import { normalize } from "node:path";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import type { Profile } from "./profile.ts";

export type Log = (type: string, data?: Record<string, unknown>) => void;
export type Member = {
  name: string; working: boolean; doneReason?: string; role?: string;
  read: number; nudged: boolean; revivals: number; wake?: () => void; notices: string[];
};
type Message = { from: string; thread?: string; text: string };
export type Verify = () => Promise<{ ok: boolean; output: string }>;

export const formatMessages = (messages: Message[]) =>
  messages.map(m => `${m.thread ? `[${m.thread}] ` : ""}${m.from}: ${m.text}`).join("\n\n");

/** Shared in-memory state of one swarm: messages, claims and each agent's status. */
export class Board {
  members = new Map<string, Member>();
  messages: Message[] = [];
  claims = new Map<string, string>();

  private log: Log;
  private notify: (member: Member) => void;
  budget: () => string;

  constructor(names: string[], log: Log, notify: (member: Member) => void, budget: () => string) {
    this.log = log;
    this.notify = notify;
    this.budget = budget;
    for (const name of names) this.members.set(name, { name, working: true, read: 0, nudged: false, revivals: 0, notices: [] }); // working until its first turn ends
  }

  unread(agent: string) {
    return this.messages.slice(this.members.get(agent)!.read).filter(m => m.from !== agent);
  }

  post(from: string, text: string, thread?: string) {
    this.messages.push({ from, thread, text });
    this.log("post", { agent: from, thread, text });
    for (const member of this.members.values()) {
      if (member.name !== from) this.notify(member);
    }
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
    member.nudged = false;
    return messages;
  }

  claim(agent: string, path: string) {
    const holder = this.claims.get(path);
    if (holder && holder !== agent) throw new Error(`${path} is claimed by ${holder}`);
    this.claims.set(path, agent);
  }

  release(agent: string, path: string) {
    if (this.claims.get(path) !== agent) throw new Error(`you do not hold ${path}`);
    this.claims.delete(path);
  }

  done(agent: string, reason: string) {
    this.members.get(agent)!.doneReason = reason;
    for (const [path, holder] of this.claims) if (holder === agent) this.claims.delete(path);
    this.log("done", { agent, reason });
  }

  team(agent: string) {
    return [...this.members.values()].map(m => {
      const state = m.doneReason !== undefined ? `done (${m.doneReason})` : m.working ? "working" : "idle";
      const claims = [...this.claims].filter(([, holder]) => holder === m.name).map(([path]) => path);
      return `${m.name}${m.name === agent ? " (you)" : ""}: ${state}${m.role ? `; role ${m.role}` : ""}${claims.length ? `; claims ${claims.join(", ")}` : ""}`;
    }).join("\n");
  }
}

const reply = (text: string) => ({ content: [{ type: "text" as const, text }], details: {} });

/** Coordination tools for one agent; only `done` when messaging is off. */
export function boardTools(board: Board, agent: string, { messaging, toolDescriptions, roles, doneGate }: Profile, verify: Verify) {
  const describe = (name: string, text: string) => toolDescriptions[name] ?? text;
  const done = defineTool({
    name: "done",
    label: "done",
    description: describe("done", "Finish your work in the swarm. Call it when the definition of done is met, or to give up with the reason why the goal cannot be reached."),
    parameters: Type.Object({ reason: Type.String({ description: "Why you are finishing" }) }),
    async execute(_id, { reason }) {
      if (doneGate) {
        const unread = board.unread(agent).length;
        if (unread) return reply(`Not done: you have ${unread} unread message(s); read them first.`);
        const check = await verify();
        if (!check.ok) return reply(`Not done: the acceptance check fails:\n${check.output.slice(-1500)}`);
      }
      board.done(agent, reason);
      return reply("You are done. End your turn now.");
    },
  });
  if (!messaging) return [done];
  const menu = Object.keys(roles);
  const role = defineTool({
    name: "role",
    label: "role",
    description: describe("role", `Take a role from the menu, or switch to another one: returns its instructions and tells the team. Roles: ${menu.join(", ")}.`),
    parameters: Type.Object({ name: Type.String() }),
    async execute(_id, { name }) {
      if (!roles[name]) throw new Error(`unknown role ${name} (roles: ${menu.join(", ")})`);
      board.members.get(agent)!.role = name;
      board.post(agent, `I take the role ${name}.`);
      return reply(roles[name].instructions);
    },
  });
  const path = Type.Object({ path: Type.String({ description: "File path relative to the working directory" }) });
  return [
    defineTool({
      name: "post",
      label: "post",
      description: describe("post", "Post a message to every teammate on the shared board. Use an optional thread label to group a conversation."),
      parameters: Type.Object({ text: Type.String(), thread: Type.Optional(Type.String()) }),
      async execute(_id, { text, thread }) {
        board.post(agent, text, thread);
        return reply("Posted.");
      },
    }),
    defineTool({
      name: "inbox",
      label: "inbox",
      description: describe("inbox", "Read the board messages from teammates that you have not read yet."),
      parameters: Type.Object({}),
      async execute() {
        const messages = board.inbox(agent);
        if (!messages.length) return reply("No new messages.");
        return reply(formatMessages(messages));
      },
    }),
    defineTool({
      name: "team",
      label: "team",
      description: describe("team", "Show every agent's state (working, idle or done with its reason) and the files it claims."),
      parameters: Type.Object({}),
      async execute() {
        return reply(board.team(agent));
      },
    }),
    defineTool({
      name: "budget",
      label: "budget",
      description: describe("budget", "Show the swarm's shared spend and what remains of its budget."),
      parameters: Type.Object({}),
      async execute() {
        return reply(board.budget());
      },
    }),
    defineTool({
      name: "claim",
      label: "claim",
      description: describe("claim", "Announce that you are editing a file. Fails if another agent holds it. Advisory only: it does not lock the file."),
      parameters: path,
      async execute(_id, { path }) {
        board.claim(agent, normalize(path));
        return reply(`You hold ${normalize(path)}.`);
      },
    }),
    defineTool({
      name: "release",
      label: "release",
      description: describe("release", "Release a file you claimed."),
      parameters: path,
      async execute(_id, { path }) {
        board.release(agent, normalize(path));
        return reply(`Released ${normalize(path)}.`);
      },
    }),
    ...(menu.length ? [role] : []),
    done,
  ];
}
