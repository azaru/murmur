import { spawn } from "node:child_process";
import { appendFileSync, cpSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  type AgentSession, type CreateAgentSessionOptions, createAgentSession, DefaultResourceLoader,
  getAgentDir, ModelRuntime, SessionManager, SettingsManager,
} from "@earendil-works/pi-coding-agent";
import { Board, boardTools, type Member } from "./board.ts";

export type Task = {
  goal: string; done: string; check: string; project?: string;
  agents: number; provider: string; model: string; thinking?: string;
  budgetUsd?: number; budgetTokens?: number; timeoutMinutes: number; messaging: boolean;
};
export type RunOptions = { runDir: string; workspace?: string; authPath?: string; checkTimeoutMs?: number };
export type EndReason = "all_done" | "quiescent" | "budget" | "timeout" | "error";
type Agent = { name: string; session: AgentSession; briefing: string };

export const NAMES = ["wren", "finch", "robin", "lark", "swift", "tern", "kite", "heron", "crane", "linnet", "plover", "dunlin"];
const BUILTIN_TOOLS = ["read", "bash", "edit", "write"];
const OUTPUT_LIMIT = 4000;

export async function runSwarm(task: Task, opts: RunOptions) {
  const started = Date.now();
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
  let reason: EndReason | undefined;

  const totals = () => {
    const usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
    let cost = 0, tokens = 0;
    for (const { session } of agents) {
      const stats = session.getSessionStats();
      cost += stats.cost;
      tokens += stats.tokens.total;
      for (const key of Object.keys(usage) as (keyof typeof usage)[]) usage[key] += stats.tokens[key];
    }
    return { cost, tokens, usage };
  };
  const budgetText = () => {
    const { cost, tokens } = totals();
    const left = [task.budgetUsd && `$${(task.budgetUsd - cost).toFixed(4)}`, task.budgetTokens && `${task.budgetTokens - tokens} tokens`];
    return `Spent $${cost.toFixed(4)} and ${tokens} tokens. Remaining: ${left.filter(Boolean).join(", ") || "no limit"}.`;
  };
  // A new post steers a busy agent once (until it reads its inbox) or wakes an idle one.
  const notify = (member: Member) => {
    const session = agents.find(a => a.name === member.name)?.session;
    if (!member.working) return member.wake?.();
    if (!session?.isStreaming || member.nudged) return;
    member.nudged = true;
    log("steer", { agent: member.name });
    session.steer("You have new messages on the board; call inbox.").catch(() => {});
  };
  const board = new Board(names, log, notify, budgetText);
  const end = (why: EndReason) => {
    if (reason) return;
    reason = why;
    for (const member of board.members.values()) member.wake?.();
    if (why === "all_done" || why === "quiescent") return;
    log("abort", { reason: why });
    for (const { session } of agents) session.abort().catch(() => {});
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
  const runAgent = async ({ name, session, briefing }: Agent) => {
    const member = board.members.get(name)!;
    let prompt = briefing;
    while (true) {
      member.working = true;
      try {
        await session.prompt(prompt);
      } catch (error) {
        log("error", { agent: name, message: String(error) });
      }
      member.working = false;
      if (reason || member.doneReason !== undefined) break;
      if (!board.unread(name).length) {
        evaluate();
        if (reason) break;
        await new Promise<void>(resolve => { member.wake = resolve; });
        member.wake = undefined;
        if (reason) break;
      }
      log("wake", { agent: name });
      prompt = "You have new messages on the board. Call inbox, then continue toward the goal.";
    }
    evaluate();
  };

  const timer = setTimeout(() => end("timeout"), task.timeoutMinutes * 60_000);
  try {
    agents = await Promise.all(names.map(async name => {
      const loader = new DefaultResourceLoader({
        cwd: workspace, agentDir: getAgentDir(),
        noExtensions: true, noSkills: true, noPromptTemplates: true, noThemes: true, noContextFiles: true,
      });
      await loader.reload();
      const tools = boardTools(board, name, task.messaging);
      const { session } = await createAgentSession({
        cwd: workspace, modelRuntime: runtime, model,
        thinkingLevel: task.thinking as CreateAgentSessionOptions["thinkingLevel"],
        resourceLoader: loader, settingsManager: SettingsManager.inMemory(),
        sessionManager: SessionManager.inMemory(workspace),
        tools: [...BUILTIN_TOOLS, ...tools.map(t => t.name)], customTools: tools,
      });
      if (task.thinking && session.thinkingLevel !== task.thinking) {
        throw new Error(`${task.model} ran with thinking ${session.thinkingLevel}, not ${task.thinking}`);
      }
      session.subscribe(event => {
        if (event.type === "tool_execution_start") log("tool", { agent: name, tool: event.toolName, args: event.args });
        if (event.type === "message_end" && event.message.role === "assistant") {
          const { input, output, totalTokens, cost } = event.message.usage;
          log("usage", { agent: name, input, output, total: totalTokens, cost: cost.total });
          setImmediate(checkBudget); // session stats include this message only after listeners run
        }
      });
      return { name, session, briefing: briefing(task, name, names) };
    }));
    log("run_start", {
      task, workspace,
      agents: agents.map(a => ({
        name: a.name, model: a.session.model?.id, thinking: a.session.thinkingLevel,
        tools: a.session.getActiveToolNames(), briefing: a.briefing,
      })),
    });
    await Promise.all(agents.map(runAgent));
  } catch (error) {
    log("error", { message: String(error) });
    end("error");
  }
  clearTimeout(timer);

  const check = await runCheck(task.check, workspace, opts.checkTimeoutMs ?? 10 * 60_000);
  log("check", check);
  const { cost, tokens, usage } = totals();
  const result = {
    status: check.exitCode === 0 ? "passed" : "failed",
    reason, check, costUsd: cost, tokens, usage, durationMs: Date.now() - started,
    agents: [...board.members.values()].map(m => {
      const stats = agents.find(a => a.name === m.name)?.session.getSessionStats();
      return { name: m.name, done: m.doneReason !== undefined, doneReason: m.doneReason, costUsd: stats?.cost ?? 0, tokens: stats?.tokens.total ?? 0 };
    }),
  };
  for (const { session } of agents) session.dispose();
  writeFileSync(join(opts.runDir, "result.json"), JSON.stringify(result, null, 2) + "\n");
  log("run_end", { status: result.status, reason });
  return result;
}

function briefing(task: Task, name: string, names: string[]) {
  const others = names.filter(n => n !== name);
  const team = !task.messaging ? "" : `
Teammates: ${others.join(", ") || "none"}. You all share this folder and this goal; nobody is in charge.
Coordinate on the shared board:
- post(text, thread?) sends a message to every teammate; inbox() returns the messages you have not read.
- team() shows who is working, idle or done and which files they claim; budget() shows the shared spend.
- claim(path) / release(path) announce which file you are editing (advisory; claim fails if someone else holds it).
Start by reading your inbox and posting what you will work on. When told you have new messages, call inbox.
`;
  return `You are ${name}, an agent in a swarm. You work in the current directory; stay inside it.
${team}
Goal:
${task.goal}

Definition of done:
${task.done}

Acceptance check (run from the current directory, must exit 0):
${task.check}

When the definition of done is met and the check passes, call done(reason). If you conclude the goal cannot be reached, call done(reason) with the reason instead of pushing on.`;
}

function runCheck(command: string, cwd: string, timeoutMs: number) {
  return new Promise<{ exitCode: number | null; output: string; timedOut: boolean }>(resolve => {
    const child = spawn("sh", ["-c", command], { cwd, detached: true });
    let output = "", timedOut = false;
    const add = (chunk: Buffer) => { output = (output + chunk).slice(-OUTPUT_LIMIT); };
    child.stdout.on("data", add);
    child.stderr.on("data", add);
    const timer = setTimeout(() => {
      timedOut = true;
      try { process.kill(-child.pid!, "SIGKILL"); } catch {}
    }, timeoutMs);
    child.on("error", error => { output += String(error); });
    child.on("close", exitCode => { clearTimeout(timer); resolve({ exitCode, output, timedOut }); });
  });
}
