import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, normalize, relative, resolve } from "node:path";
import {
  type AgentSession, type CreateAgentSessionOptions, createAgentSession, DefaultResourceLoader,
  getAgentDir, isToolCallEventType, ModelRuntime, SessionManager, SettingsManager, type ToolCallEvent, type ToolResultEvent,
} from "@earendil-works/pi-coding-agent";
import { Board, boardTools, formatMessages, type Member } from "./board.ts";
import { Branches } from "./branches.ts";
import { KNOWN_BOARD_TOOLS, loadProfile, type Profile, render } from "./profile.ts";
import { TaskList, taskTools } from "./tasklist.ts";
import { fileTools } from "./tools.ts";

export type Task = {
  goal: string; done: string; check: string; project?: string;
  agents: number; provider: string; model: string; thinking?: string;
  budgetUsd?: number; budgetTokens?: number; timeoutMinutes: number; profile?: string;
  checks?: string[]; // per-part checks of a batch: each counts as a check run, and help follows the part an agent last checked
};
export type RunOptions = { runDir: string; workspace?: string; authPath?: string; checkTimeoutMs?: number };
export type EndReason = "all_done" | "quiescent" | "budget" | "timeout" | "error";
type Agent = { name: string; session: AgentSession; briefing: string };

export const NAMES = ["wren", "finch", "robin", "lark", "swift", "tern", "kite", "heron", "crane", "linnet", "plover", "dunlin"];
const OUTPUT_LIMIT = 4000;

export async function runSwarm(task: Task, opts: RunOptions) {
  const started = Date.now();
  const profile = loadProfile(task.profile);
  const runtime = await ModelRuntime.create(opts.authPath ? { authPath: opts.authPath } : {});
  const model = runtime.getModel(task.provider, task.model);
  if (!model) throw new Error(`unknown model ${task.provider}/${task.model}`);

  const workspace = opts.workspace ?? join(opts.runDir, "workspace");
  mkdirSync(opts.runDir, { recursive: true });
  mkdirSync(workspace, { recursive: true });
  if (!opts.workspace && task.project) cpSync(task.project, workspace, { recursive: true });
  const log = (type: string, data: Record<string, unknown> = {}) =>
    appendFileSync(join(opts.runDir, "events.jsonl"), JSON.stringify({ t: new Date().toISOString(), type, ...data }) + "\n");

  const names = NAMES.slice(0, task.agents);
  let agents: Agent[] = [];
  const retired: { name: string; session: AgentSession }[] = []; // sessions replaced by a relay
  let reason: EndReason | undefined;
  // Staggered entry by turns: seat i opens when seat i-1 reaches spawnAfterTurns turns, ends a turn, or entered spawnGapSeconds ago.
  const gates = names.map(() => { let open = () => {}; const opened = new Promise<void>(resolve => { open = resolve; }); return { opened, open }; });
  const openNext = (name: string) => gates[names.indexOf(name) + 1]?.open();
  const turns = new Map<string, number>();

  const totals = () => {
    const usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
    let cost = 0, tokens = 0;
    for (const stats of [...agents, ...retired].map(a => a.session.getSessionStats())) {
      cost += stats.cost, tokens += stats.tokens.total;
      for (const key of Object.keys(usage) as (keyof typeof usage)[]) usage[key] += stats.tokens[key];
    }
    return { cost, tokens, usage };
  };
  const minutesLeft = () => Math.max(0, task.timeoutMinutes - (Date.now() - started) / 60_000).toFixed(1);
  const budgetText = () => {
    const { cost, tokens } = totals();
    const left = [task.budgetUsd && `$${(task.budgetUsd - cost).toFixed(4)}`, task.budgetTokens && `${task.budgetTokens - tokens} tokens`];
    return `Spent $${cost.toFixed(4)} and ${tokens} tokens. Remaining: ${left.filter(Boolean).join(", ") || "no limit"}; ${minutesLeft()} minutes before timeout.`;
  };
  // A {messages} placeholder delivers the unread posts inline and marks them read.
  const withMessages = (template: string, name: string) =>
    template.includes("{messages}") ? render(template, { messages: formatMessages(board.inbox(name)) }) : template;
  // A new post steers a busy agent (once until it reads, unless delivered inline), wakes an idle one
  // and revives a done one while it has revivals left.
  const notify = (member: Member) => {
    if (member.doneReason !== undefined && member.revivals >= profile.revive) return;
    const session = agents.find(a => a.name === member.name)?.session;
    if (!member.working) return member.wake?.();
    if (profile.delivery !== "steer") return; // attached to its next tool result, or left for it to pull
    const inline = profile.steer.includes("{messages}");
    if (!session?.isStreaming || (member.nudged && !inline)) return;
    const text = withMessages(profile.steer, member.name);
    member.nudged = true;
    log("steer", { agent: member.name });
    session.steer(text).catch(() => {});
  };
  const board = new Board(names, log, notify, budgetText);
  board.lease = profile.claimLease * 1000;
  board.threaded = profile.threads;
  const tasks = profile.taskList ? new TaskList(log) : undefined;
  const branches = profile.branches !== "off" ? new Branches(workspace, opts.runDir, profile.branches, log) : undefined;
  const root = (name: string) => branches?.root(name) ?? workspace; // the folder an agent works in
  const seen = new Map<string, string>(); // agent and path -> content digest it last read or wrote
  const digest = (path: string) => (existsSync(path) ? createHash("sha1").update(readFileSync(path)).digest("hex") : "");
  const evidence = new Map<string, { calls: number; firstGreen?: number; green?: boolean; stuck?: number; part?: string }>(); // per seat, reset by a relay
  const status = new Map<string, { ok: boolean; tail: string }>(); // latest run of each check, by anyone
  // A command runs a check when the check starts a statement (after time/timeout/env/VAR= wrappers) outside quotes and nothing
  // after it can mask its exit status. A check that itself contains quotes falls back to plain containment.
  const unquote = (text: string) => text.replace(/'[^']*'|"(?:\\.|[^"\\])*"/g, "''");
  const checks = [...(task.checks ?? []), task.check].map(check => {
    const at = new RegExp(`(?:^|[;&|(\\n])\\s*(?:(?:time|timeout\\s+\\S+|env|\\w+=\\S*)\\s+)*${unquote(check).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[\\s;&|)<>])([^]*)`);
    return { check, runs: (command: string) => { const match = unquote(command).match(at);
      return /['"]/.test(check) ? command.includes(check) : !!match && !/[;|\n]/.test(match[1].trim()); } };
  });
  const help = (name: string, what: string, part: string) => (log("help", { agent: name, what, part }), board.post(name, `(sent by murmur) ${name} ${what}${task.checks ? ` (${part})` : ""}. ${status.get(part)
    ? `The check's latest run failed:\n${status.get(part)!.tail}` : "Nobody has run the acceptance check yet."}\nIf you can spare the time, offer help on the board or take a look.`, "help"));
  // With delivery "attach", unread posts and notices ride on the agent's next tool result instead of costing a turn.
  const attach = (name: string, event: ToolResultEvent) => {
    const output = event.content.map(c => (c.type === "text" ? c.text : "")).join("");
    const ran = event.toolName === "bash" || event.toolName === "finding" ? checks.find(c => c.runs(String(event.input.command)))?.check : undefined;
    const ranCheck = ran !== undefined;
    const failed = event.isError || /exited with code [1-9]/.test(output);
    const tail = output.split("\n").filter(l => l.trim() && !l.startsWith("Command exited")).slice(-3).join("\n");
    const seat = evidence.get(name) ?? { calls: 0 };
    evidence.set(name, seat);
    const work = !KNOWN_BOARD_TOOLS.includes(event.toolName);
    if (work) seat.calls += 1;
    if (ran) seat.green = !failed, seat.part = ran, status.set(ran, { ok: !failed, tail });
    const part = seat.part ?? task.check;
    if (ranCheck && !failed) seat.firstGreen ??= seat.calls;
    if (status.get(part)?.ok) seat.stuck = 0;
    else if (profile.helpAfter && work && (seat.stuck = (seat.stuck ?? 0) + 1) === profile.helpAfter) help(name, `has made ${profile.helpAfter} tool calls while the acceptance check is failing or not yet run`, part);
    if (profile.helpAfter && event.toolName === "done" && output.startsWith("You are done") && !status.get(part)?.ok) help(name, `finished without a passing acceptance check, saying: "${event.input.reason}"`, part);
    if (profile.staleGuard && ["read", "write", "edit", "append"].includes(event.toolName) && !event.isError) {
      const path = resolve(root(name), String(event.input.path));
      seen.set(`${name}:${path}`, digest(path));
    }
    if (profile.notices) {
      if (["write", "edit", "append"].includes(event.toolName) && !event.isError) {
        board.notice(name, `${name} ${{ write: "wrote", edit: "edited", append: "appended to" }[event.toolName]} ${event.input.path}`);
      } else if (ranCheck) {
        board.notice(name, `${name} ran the acceptance check: ${failed ? `FAIL\n${tail}` : "PASS"}`);
      }
    }
    if (event.toolName === "done" && output.startsWith("You are done")) tasks?.release(name);
    const lines: string[] = [];
    const notices = profile.delivery === "attach" ? board.members.get(name)!.notices.splice(0) : [];
    const messages = profile.delivery === "attach" && board.unread(name).length ? board.inbox(name) : [];
    if (notices.length || messages.length) {
      log("attach", { agent: name, messages: messages.length, notices: notices.length });
      lines.push("New on the board:", ...notices.map(n => `- ${n}`), formatMessages(messages));
    }
    const news = tasks?.news(name);
    if (news) lines.push(news);
    if (profile.clock) lines.push(`[${minutesLeft()} minutes left before the timeout]`);
    const text = lines.filter(Boolean).join("\n");
    return text ? { content: [...event.content, { type: "text" as const, text: `\n\n${text}` }] } : undefined;
  };
  const end = (why: EndReason) => {
    if (reason) return;
    reason = why;
    for (const member of board.members.values()) member.wake?.();
    for (const gate of gates) gate.open();
    if (why === "all_done" || why === "quiescent") return;
    log("abort", { reason: why });
    for (const { session } of agents) session.abort().catch(() => {});
  };
  const guard = (name: string, event: ToolCallEvent) => {
    const seat = evidence.get(name) ?? { calls: 0 };
    if (event.toolName === "done" && profile.doneAfterGreen && !(seat.green && seat.calls - seat.firstGreen! >= profile.doneAfterGreen)) {
      log("done_refused", { agent: name, ...seat });
      return { block: true, reason: seat.firstGreen === undefined || !seat.green
        ? "Refused: the acceptance check must pass, run by you, before you finish. If the goal truly cannot be reached, end your turn without calling done."
        : `Refused: the acceptance check is only a sample. Spend at least ${profile.doneAfterGreen - (seat.calls - seat.firstGreen!)} more tool calls verifying clauses it does not cover (write tests for them, run them, fix what fails), run the check again, then finish.` };
    }
    const unmerged = event.toolName === "done" ? branches?.doneWarning(name) : undefined;
    if (unmerged) return (log("done_refused", { agent: name, unmerged: true }), { block: true, reason: unmerged });
    const write = isToolCallEventType("write", event);
    if (!write && !isToolCallEventType("edit", event) && event.toolName !== "append") return;
    const path = resolve(root(name), String(event.input.path)), key = normalize(relative(root(name), path));
    const refuse = (reason: string) => (log("write_refused", { agent: name, path: key, reason }), { block: true, reason: `Refused: ${reason}` });
    const holder = profile.claimLease ? board.holder(key) : undefined;
    if (holder && holder !== name) {
      return refuse(`${key} is claimed by ${holder}. Ask on the board, work on another part, or wait: the claim lapses after ${profile.claimLease} s without ${holder} writing it.`);
    }
    if (holder) board.claim(name, key); // writing your own claimed file renews it
    const old = write && existsSync(path) ? readFileSync(path, "utf8") : "";
    if (!old) return;
    if (profile.staleGuard && seen.get(`${name}:${path}`) !== digest(path)) {
      return refuse(`${key} changed since you last read or wrote it, so this write would erase someone's work. Read it again and use edit, or write it again from the current version.`);
    }
    const content = (event.input as { content: string }).content, first = (text: string) => text.split("\n").find(line => line.trim()) ?? "";
    if (profile.writeGuard && (/^\s/.test(content) || (content.length < old.length && first(content) !== first(old)))) {
      return refuse(`write replaces the whole file, and this content looks like only part of it (it starts indented, or it is shorter than the file and starts differently), so it would erase what is there. Add it with ${profile.append ? "append (to the end) or edit" : "edit"}, or write the complete file in one call; to really replace the file with something shorter, delete it first.`);
    }
  };
  const checkBudget = () => {
    const { cost, tokens } = totals();
    if ((task.budgetUsd && cost > task.budgetUsd) || (task.budgetTokens && tokens > task.budgetTokens)) end("budget");
  };
  // Called whenever a turn ends: the swarm is over once nobody is working.
  const evaluate = () => {
    const members = [...board.members.values()];
    if (members.some(m => m.working)) return;
    if (members.every(m => m.doneReason !== undefined)) end("all_done");
    else if (members.every(m => m.doneReason !== undefined || !board.unread(m.name).length)) end("quiescent");
  };
  const runAgent = async (agent: Agent, index: number) => {
    const { name, briefing } = agent, member = board.members.get(name)!;
    let relays = 0;
    if (index && profile.spawnAfterTurns) {
      await gates[index].opened;
      if (reason) return;
    } else if (index && profile.spawnGapSeconds) {
      // Staggered start; end() cuts the wait short through wake.
      await new Promise<void>(resolve => {
        const timer = setTimeout(resolve, index * profile.spawnGapSeconds * 1000);
        member.wake = () => { clearTimeout(timer); resolve(); };
      });
      member.wake = undefined;
      if (reason) return;
    }
    if (profile.spawnAfterTurns) {
      log("enter", { agent: name });
      if (profile.spawnGapSeconds) setTimeout(() => openNext(name), profile.spawnGapSeconds * 1000).unref();
    }
    let prompt = briefing;
    while (true) {
      member.working = true;
      await agent.session.prompt(prompt).catch(error => log("error", { agent: name, message: String(error) }));
      member.working = false;
      if (profile.spawnAfterTurns) openNext(name);
      if (!reason && member.doneReason !== undefined && relays < profile.relay) {
        // A fresh instance takes the seat: same name and board history, empty context.
        relays += 1;
        retired.push({ name, session: agent.session });
        agent.session = await open(name);
        if (reason) break; // the swarm ended while the new session was opening
        evidence.delete(name);
        log("relay", { agent: name, relay: relays, reason: member.doneReason });
        prompt = `${briefing}\n\nYou are a fresh instance taking over ${name}'s seat. The previous instance finished saying: "${member.doneReason}". Its handoff notes, if it wrote any, are in NOTES-${name}.md. Do not assume the goal is met: check the work against the spec yourself, fix what is wrong or missing, and call done only after verifying it.`;
        member.doneReason = undefined;
        continue;
      }
      if (reason || (member.doneReason !== undefined && member.revivals >= profile.revive)) break;
      if (!board.unread(name).length || member.doneReason !== undefined) {
        evaluate();
        if (reason) break;
        await new Promise<void>(resolve => { member.wake = resolve; });
        member.wake = undefined;
        if (reason) break;
      }
      if (member.doneReason !== undefined) {
        member.doneReason = undefined;
        member.revivals += 1;
        log("revive", { agent: name });
      }
      log("wake", { agent: name });
      prompt = withMessages(profile.wake, name);
    }
    evaluate();
  };

  const open = async (name: string) => {
    const loader = new DefaultResourceLoader({
      cwd: root(name), agentDir: getAgentDir(),
      noExtensions: true, noSkills: true, noPromptTemplates: true, noThemes: true, noContextFiles: true,
      appendSystemPrompt: profile.systemPromptAppend ? [profile.systemPromptAppend] : undefined,
      extensionFactories: profile.delivery === "attach" || profile.notices || profile.writeGuard || profile.claimLease || profile.staleGuard
        || profile.doneAfterGreen || profile.clock || profile.helpAfter || profile.taskList || branches ? [pi => { pi.on("tool_result", event => attach(name, event)); pi.on("tool_call", event => guard(name, event)); }] : [],
    });
    await loader.reload();
    const verify = async () => {
      const check = await runCheck(task.check, workspace, Math.min(opts.checkTimeoutMs ?? 10 * 60_000, 5 * 60_000));
      log("done_check", { agent: name, exitCode: check.exitCode, timedOut: check.timedOut });
      return { ok: check.exitCode === 0, output: check.output };
    };
    const tools = [...fileTools(profile, root(name)), ...boardTools(board, name, profile, verify, command => runCheck(command, root(name), 2 * 60_000)),
      ...(tasks ? taskTools(tasks, name, profile.toolDescriptions) : []), ...(branches?.tools(name, profile.toolDescriptions) ?? [])];
    const { session } = await createAgentSession({
      cwd: root(name), modelRuntime: runtime, model,
      thinkingLevel: task.thinking as CreateAgentSessionOptions["thinkingLevel"],
      resourceLoader: loader, settingsManager: SettingsManager.inMemory({ steeringMode: "all" }), // queued steers arrive together
      sessionManager: SessionManager.inMemory(root(name)),
      tools: [...new Set([...profile.tools, ...tools.map(t => t.name)])], customTools: tools,
    });
    if (task.thinking && session.thinkingLevel !== task.thinking) {
      throw new Error(`${task.model} ran with thinking ${session.thinkingLevel}, not ${task.thinking}`);
    }
    let handoff = false; // asked this instance to hand off its long context
    session.subscribe(event => {
      if (event.type === "tool_execution_start") log("tool", { agent: name, tool: event.toolName, args: event.args });
      if (event.type === "message_end" && event.message.role === "assistant") {
        const { input, output, totalTokens, cost } = event.message.usage;
        log("usage", { agent: name, input, output, total: totalTokens, cost: cost.total });
        setImmediate(checkBudget); // session stats include this message only after listeners run
        if (profile.spawnAfterTurns) {
          turns.set(name, (turns.get(name) ?? 0) + 1);
          if (turns.get(name) === profile.spawnAfterTurns) openNext(name);
        }
        const relaysLeft = retired.filter(r => r.name === name).length < profile.relay;
        if (profile.relayContext && totalTokens > profile.relayContext && relaysLeft && !handoff && session.isStreaming) {
          handoff = true;
          log("handoff", { agent: name, tokens: totalTokens });
          session.steer(`Your context has grown long. Write your handoff in NOTES-${name}.md (what works, what fails, what is next), then call done; a fresh instance of you will continue from those notes.`).catch(() => {});
        }
      }
    });
    return session;
  };

  const timer = setTimeout(() => end("timeout"), task.timeoutMinutes * 60_000);
  try {
    branches?.init(names);
    agents = await Promise.all(names.map(async name => ({ name, session: await open(name), briefing: briefing(task, profile, name, names) })));
    log("run_start", { task, profile, workspace, agents: agents.map(({ name, session, briefing }) => ({
      name, model: session.model?.id, thinking: session.thinkingLevel, tools: session.getActiveToolNames(), briefing })) });
    await Promise.all(agents.map((agent, index) => runAgent(agent, index)));
  } catch (error) {
    log("error", { message: String(error) });
    end("error");
  }
  clearTimeout(timer);
  const unmerged = branches?.finish(names); // agent -> files its branch holds that the shared folder lacks
  if (unmerged) log("branches_end", { unmerged });

  const check = await runCheck(task.check, workspace, opts.checkTimeoutMs ?? 10 * 60_000);
  log("check", check);
  const { cost, tokens, usage } = totals();
  const result = {
    status: check.exitCode === 0 ? "passed" : "failed",
    reason, check, costUsd: cost, tokens, usage, durationMs: Date.now() - started, ...(unmerged && { unmerged }),
    agents: [...board.members.values()].map(m => {
      const stats = [...agents, ...retired].filter(a => a.name === m.name).map(a => a.session.getSessionStats());
      return { name: m.name, done: m.doneReason !== undefined, doneReason: m.doneReason, relays: stats.length - 1,
        costUsd: stats.reduce((sum, s) => sum + s.cost, 0), tokens: stats.reduce((sum, s) => sum + s.tokens.total, 0) };
    }),
  };
  for (const [i, { name, session }] of [...retired, ...agents].entries()) {
    const earlier = retired.slice(0, i).filter(r => r.name === name).length; // relayed instances get a numbered transcript
    const file = i < retired.length ? `${name}.${earlier + 1}.messages.json` : `${name}.messages.json`;
    writeFileSync(join(opts.runDir, file), JSON.stringify(session.messages, null, 1) + "\n");
    session.dispose();
  }
  writeFileSync(join(opts.runDir, "result.json"), JSON.stringify(result, null, 2) + "\n");
  log("run_end", { status: result.status, reason });
  return result;
}

function briefing(task: Task, profile: Profile, name: string, names: string[]) {
  const teammates = names.filter(n => n !== name).join(", ") || "none";
  const roles = Object.entries(profile.roles).map(([role, { summary }]) => `- ${role}: ${summary}`).join("\n");
  const team = profile.messaging ? render(profile.teamBriefing, { teammates, roles }) : "";
  return render(profile.briefing, { name, teammates, team, goal: task.goal, done: task.done, check: task.check });
}

function runCheck(command: string, cwd: string, timeoutMs: number) {
  return new Promise<{ exitCode: number | null; output: string; timedOut: boolean }>(resolve => {
    const child = spawn("sh", ["-c", command], { cwd, detached: true });
    let output = "", timedOut = false;
    for (const stream of [child.stdout, child.stderr]) stream.on("data", (chunk: Buffer) => { output = (output + chunk).slice(-OUTPUT_LIMIT); });
    const timer = setTimeout(() => { timedOut = true; try { process.kill(-child.pid!, "SIGKILL"); } catch {} }, timeoutMs);
    child.on("error", error => { output += String(error); });
    child.on("close", exitCode => { clearTimeout(timer); resolve({ exitCode, output, timedOut }); });
  });
}
