import { normalize } from "node:path";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import type { Profile } from "./profile.ts";

export type Log = (type: string, data?: Record<string, unknown>) => void;
export type Member = {
  name: string; working: boolean; doneReason?: string; role?: string;
  read: number; nudged: boolean; revivals: number; wake?: () => void; notices: string[];
  following: Map<string, number>; // threaded board: thread id -> how many of its posts the agent has seen
  announced: Set<string>; // threaded board: threads the agent was told about without following them
};
type Message = { from: string; thread?: string; text: string };
type Thread = { id: string; title: string; author: string; posts: Message[] };
export type Verify = () => Promise<{ ok: boolean; output: string }>;
export type Run = (command: string) => Promise<{ exitCode: number | null; output: string }>;

export const formatMessages = (messages: Message[]) =>
  messages.map(m => `${m.thread ? `[${m.thread}] ` : ""}${m.from}: ${m.text}`).join("\n\n");

/** Shared in-memory state of one swarm: messages, claims and each agent's status. */
export class Board {
  members = new Map<string, Member>();
  messages: Message[] = [];
  threads = new Map<string, Thread>();
  /** On a threaded board an agent receives only the threads it follows, plus a one-line announcement of each new one. */
  threaded = false;
  claims = new Map<string, { agent: string; at: number }>();
  /** How long a claim lives without its holder touching the path, in ms; 0 means it never lapses. */
  lease = 0;

  constructor(names: string[], private log: Log, private notify: (member: Member) => void, public budget: () => string) {
    for (const name of names) this.members.set(name, { name, working: true, read: 0, nudged: false, revivals: 0, notices: [], following: new Map(), announced: new Set() }); // working until its first turn ends
  }

  unread(agent: string) {
    return this.threaded ? this.unreadThreads(agent) : this.messages.slice(this.members.get(agent)!.read).filter(m => m.from !== agent);
  }

  post(from: string, text: string, thread?: string) {
    if (this.threaded) return this.append(this.threads.get(thread ?? "general") ?? this.create(thread ?? "general", thread ?? "general", from), from, text);
    this.messages.push({ from, thread, text });
    this.log("post", { agent: from, thread, text });
    this.alert(from);
  }

  /** Opens a thread with its first post and returns its id. */
  open(from: string, title: string, text: string) {
    const thread = this.create(`t${this.threads.size + 1}`, title, from);
    this.append(thread, from, text);
    return thread.id;
  }

  /** Adds a post to a thread and returns the posts of others that the agent had not seen. */
  reply(from: string, id: string, text: string) {
    const thread = this.thread(id), member = this.members.get(from)!;
    const missed = this.newPosts(thread, member);
    this.append(thread, from, text);
    member.following.set(id, thread.posts.length);
    return missed;
  }

  /** The whole thread; the agent follows it from now on. */
  read(agent: string, id: string) {
    const thread = this.thread(id);
    this.members.get(agent)!.following.set(id, thread.posts.length);
    return thread;
  }

  listThreads(agent: string) {
    const member = this.members.get(agent)!;
    return [...this.threads.values()].map(t => `${t.id} "${t.title}" by ${t.author}, ${t.posts.length} post(s); ${
      member.following.has(t.id) ? `${this.newPosts(t, member).length} new` : "not following"}`).join("\n");
  }

  /** A fact about one agent's work for the others; never wakes or steers anyone. */
  notice(from: string, text: string) {
    this.log("notice", { agent: from, text });
    for (const member of this.members.values()) if (member.name !== from) member.notices.push(text);
  }

  inbox(agent: string) {
    const messages = this.unread(agent);
    const member = this.members.get(agent)!;
    member.read = this.messages.length;
    for (const t of this.threads.values()) member.following.has(t.id) ? member.following.set(t.id, t.posts.length) : member.announced.add(t.id);
    member.nudged = false;
    return messages;
  }

  private thread(id: string) {
    const thread = this.threads.get(id);
    if (!thread) throw new Error(`no thread ${id}; thread_list shows the existing ones`);
    return thread;
  }

  private create(id: string, title: string, author: string) {
    const thread: Thread = { id, title, author, posts: [] };
    this.threads.set(id, thread);
    this.log("thread", { id, title, author });
    return thread;
  }

  /** An author who was up to date stays up to date; one who was behind still receives what they missed. */
  private append(thread: Thread, from: string, text: string) {
    const member = this.members.get(from)!, seen = member.following.get(thread.id) ?? thread.posts.length;
    thread.posts.push({ from, thread: thread.id, text });
    if (seen === thread.posts.length - 1) member.following.set(thread.id, thread.posts.length);
    this.log("post", { agent: from, thread: thread.id, text });
    this.alert(from);
  }

  private newPosts(thread: Thread, member: Member) {
    return thread.posts.slice(member.following.get(thread.id) ?? 0).filter(m => m.from !== member.name);
  }

  private unreadThreads(agent: string): Message[] {
    const member = this.members.get(agent)!;
    return [...this.threads.values()].flatMap(thread => member.following.has(thread.id) ? this.newPosts(thread, member)
      : member.announced.has(thread.id) ? [] : [{ from: thread.author, thread: thread.id,
        text: `opened "${thread.title}" (${thread.posts.length} post(s)); thread_read ${thread.id} to follow it.` }]);
  }

  /** Tells the others a post exists; on a threaded board only those who have something to receive. */
  private alert(from: string) {
    for (const member of this.members.values()) {
      if (member.name !== from && (!this.threaded || this.unread(member.name).length)) this.notify(member);
    }
  }

  claim(agent: string, path: string) {
    const holder = this.holder(path);
    if (holder && holder !== agent) throw new Error(`${path} is claimed by ${holder}`);
    this.claims.set(path, { agent, at: Date.now() });
  }

  release(agent: string, path: string) {
    if (this.holder(path) !== agent) throw new Error(`you do not hold ${path}`);
    this.claims.delete(path);
  }

  holder(path: string) {
    const claim = this.claims.get(path);
    if (claim && this.lease && Date.now() - claim.at > this.lease) this.claims.delete(path);
    return this.claims.get(path)?.agent;
  }

  done(agent: string, reason: string) {
    this.members.get(agent)!.doneReason = reason;
    for (const [path, claim] of this.claims) if (claim.agent === agent) this.claims.delete(path);
    this.log("done", { agent, reason });
  }

  team(agent: string) {
    return [...this.members.values()].map(m => {
      const state = m.doneReason !== undefined ? `done (${m.doneReason})` : m.working ? "working" : "idle";
      const claims = [...this.claims.keys()].filter(path => this.holder(path) === m.name);
      return `${m.name}${m.name === agent ? " (you)" : ""}: ${state}${m.role ? `; role ${m.role}` : ""}${claims.length ? `; claims ${claims.join(", ")}` : ""}`;
    }).join("\n");
  }
}

const reply = (text: string) => ({ content: [{ type: "text" as const, text }], details: {} });

/** Coordination tools for one agent; only `done` when messaging is off. */
export function boardTools(board: Board, agent: string, { messaging, threads, toolDescriptions, roles, doneGate, findings, claimLease, boardTools: offered }: Profile, verify: Verify, run: Run) {
  const describe = (name: string, text: string) => toolDescriptions[name] ?? text;
  // The snippet is the tool's line in the system prompt's tool list; without one Pi leaves the tool out of that list.
  const tool = (name: string, text: string, promptSnippet: string) => ({ name, label: name, description: describe(name, text), promptSnippet });
  const done = defineTool({ ...tool("done", "Finish your work in the swarm. Call it when you judge that the goal is met, or to give up with the reason why it cannot be reached.", "Finish your work, or give up with the reason"),
    parameters: Type.Object({ reason: Type.String({ description: "Why you are finishing" }) }),
    async execute(_id, { reason }) {
      const unread = doneGate ? board.unread(agent).length : 0;
      if (unread) return reply(`Not done: you have ${unread} unread message(s); read them first.`);
      const check = doneGate ? await verify() : { ok: true, output: "" };
      if (!check.ok) return reply(`Not done: the acceptance check fails:\n${check.output.slice(-1500)}`);
      board.done(agent, reason);
      return reply("You are done. End your turn now.");
    } });
  if (!messaging) return [done];
  const menu = Object.keys(roles);
  const role = defineTool({ ...tool("role", `Take a role from the menu, or switch to another one: returns its instructions and tells the team. Roles: ${menu.join(", ")}.`, "Take a role from the menu, or switch to another"),
    parameters: Type.Object({ name: Type.String() }),
    async execute(_id, { name }) {
      if (!roles[name]) throw new Error(`unknown role ${name} (roles: ${menu.join(", ")})`);
      board.members.get(agent)!.role = name;
      board.post(agent, `I take the role ${name}.`);
      return reply(roles[name].instructions);
    } });
  const finding = defineTool({ ...tool("finding", "Share something you verified: the command runs in your working folder, and your claim is posted to every teammate with the command's real exit code and output.", "Post a verified claim to the team with a command's real output"),
    parameters: Type.Object({ text: Type.String({ description: "What you found" }), command: Type.String({ description: "A shell command whose output shows it" }) }),
    async execute(_id, { text, command }) {
      const { exitCode, output } = await run(command);
      board.post(agent, `${text}\n$ ${command}\n[exit ${exitCode}]\n${output.slice(-1500)}`, "finding");
      return reply(`Posted. Command exited with code ${exitCode ?? "124 (timed out)"}\n${output.slice(-1500)}`); // read like bash by the check tracker
    } });
  const path = Type.Object({ path: Type.String({ description: "File path relative to the working directory" }) });
  const threadId = Type.Object({ thread: Type.String({ description: "Thread id, such as t3" }) });
  const threadTools = [
    defineTool({ ...tool("thread_new", "Open a thread on the board about one topic, with its first post. Teammates are told its title and follow it by reading or replying.", "Open a board thread on one topic"),
      parameters: Type.Object({ title: Type.String({ description: "Short topic" }), text: Type.String() }),
      async execute(_id, { title, text }) { return reply(`Opened thread ${board.open(agent, title, text)}. You follow it: replies arrive with your tool results.`); } }),
    defineTool({ ...tool("thread_list", "List every thread with its title, author and, for you, how many posts are new or whether you do not follow it.", "List the board's threads"),
      parameters: Type.Object({}), async execute() { return reply(board.listThreads(agent) || "No threads yet."); } }),
    defineTool({ ...tool("thread_read", "Read a whole thread and follow it from now on.", "Read a board thread and follow it"), parameters: threadId,
      async execute(_id, { thread }) {
        const { id, title, author, posts } = board.read(agent, thread);
        return reply(`Thread ${id}, "${title}", opened by ${author}:\n\n${formatMessages(posts)}`);
      } }),
    defineTool({ ...tool("reply", "Add a post to a thread, and see what others posted in it since you last read it.", "Post in a board thread"),
      parameters: Type.Object({ thread: Type.String({ description: "Thread id, such as t3" }), text: Type.String() }),
      async execute(_id, { thread, text }) {
        const missed = board.reply(agent, thread, text);
        return reply(missed.length ? `Posted. Since you last read this thread:\n\n${formatMessages(missed)}` : "Posted.");
      } }),
  ];
  const post = defineTool({ ...tool("post", "Post a message to every teammate on the shared board. Use an optional thread label to group a conversation.", "Message every teammate on the shared board"),
    parameters: Type.Object({ text: Type.String(), thread: Type.Optional(Type.String({ description: "Label shown as [label] before the post" })) }),
    async execute(_id, { text, thread }) { board.post(agent, text, thread); return reply("Posted."); } });
  return [
    ...(threads ? threadTools : [post]),
    defineTool({ ...tool("inbox", "Read the board messages from teammates that you have not read yet.", "Read your unread board messages"), parameters: Type.Object({}),
      async execute() { const messages = board.inbox(agent); return reply(messages.length ? formatMessages(messages) : "No new messages."); } }),
    defineTool({ ...tool("team", "Show every agent's state (working, idle or done with its reason), its role if it took one, and the files it claims.", "Show each teammate's state, role and claimed files"),
      parameters: Type.Object({}), async execute() { return reply(board.team(agent)); } }),
    defineTool({ ...tool("budget", "Show the swarm's shared spend, what remains of its budget, and the minutes left before the timeout.", "Show the shared spend, remaining budget and time"),
      parameters: Type.Object({}), async execute() { return reply(board.budget()); } }),
    defineTool({ ...tool("claim", `Announce that you are editing a file. Fails if another agent holds it. ${claimLease
      ? `While you hold it, teammates' write and edit on it are refused; the claim lapses after ${claimLease} s without you writing the file.`
      : "Advisory only: it does not lock the file."}`, "Claim a file you are editing"),
      parameters: path, async execute(_id, { path }) { board.claim(agent, normalize(path)); return reply(`You hold ${normalize(path)}.`); } }),
    defineTool({ ...tool("release", "Release a file you claimed.", "Release a file you claimed"),
      parameters: path, async execute(_id, { path }) { board.release(agent, normalize(path)); return reply(`Released ${normalize(path)}.`); } }),
    ...(menu.length ? [role] : []),
    ...(findings ? [finding] : []),
    done,
  ].filter(tool => tool === done || offered.includes(tool.name));
}
