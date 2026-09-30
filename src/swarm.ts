import { spawn } from "node:child_process";
import { appendFileSync, cpSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  type AgentSession, type CreateAgentSessionOptions, createAgentSession, DefaultResourceLoader,
  getAgentDir, ModelRuntime, SessionManager, SettingsManager,
} from "@earendil-works/pi-coding-agent";
import { Board, boardTools, formatMessages, type Member } from "./board.ts";
import { loadProfile, type Profile, render } from "./profile.ts";

export type Task = {
  goal: string; done: string; check: string; project?: string;
  agents: number; provider: string; model: string; thinking?: string;
  budgetUsd?: number; budgetTokens?: number; timeoutMinutes: number; profile?: string;
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
    const minutes = Math.max(0, task.timeoutMinutes - (Date.now() - started) / 60_000).toFixed(1);
    return `Spent $${cost.toFixed(4)} and ${tokens} tokens. Remaining: ${left.filter(Boolean).join(", ") || "no limit"}; ${minutes} minutes before timeout.`;
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
    const inline = profile.steer.includes("{messages}");
    if (!session?.isStreaming || (member.nudged && !inline)) return;
    const text = withMessages(profile.steer, member.name);
    member.nudged = true;
    log("steer", { agent: member.name });
    session.steer(text).catch(() => {});
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
  const runAgent = async ({ name, session, briefing }: Agent, index: number) => {
    const member = board.members.get(name)!;
    if (index && profile.spawnGapSeconds) {
      // Staggered start; end() cuts the wait short through wake.
      await new Promise<void>(resolve => {
        const timer = setTimeout(resolve, index * profile.spawnGapSeconds * 1000);
        member.wake = () => { clearTimeout(timer); resolve(); };
      });
      member.wake = undefined;
      if (reason) return;
    }
    let prompt = briefing;
    while (true) {
      member.working = true;
      try {
        await session.prompt(prompt);
      } catch (error) {
        log("error", { agent: name, message: String(error) });
      }
      member.working = false;
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

  const timer = setTimeout(() => end("timeout"), task.timeoutMinutes * 60_000);
  try {
    agents = await Promise.all(names.map(async name => {
      const loader = new DefaultResourceLoader({
        cwd: workspace, agentDir: getAgentDir(),
        noExtensions: true, noSkills: true, noPromptTemplates: true, noThemes: true, noContextFiles: true,
        appendSystemPrompt: profile.systemPromptAppend ? [profile.systemPromptAppend] : undefined,
      });
      await loader.reload();
      const verify = async () => {
        const check = await runCheck(task.check, workspace, Math.min(opts.checkTimeoutMs ?? 10 * 60_000, 5 * 60_000));
        log("done_check", { agent: name, exitCode: check.exitCode, timedOut: check.timedOut });
        return { ok: check.exitCode === 0, output: check.output };
      };
      const tools = boardTools(board, name, profile, verify);
      const { session } = await createAgentSession({
        cwd: workspace, modelRuntime: runtime, model,
        thinkingLevel: task.thinking as CreateAgentSessionOptions["thinkingLevel"],
        resourceLoader: loader, settingsManager: SettingsManager.inMemory(),
        sessionManager: SessionManager.inMemory(workspace),
        tools: [...profile.tools, ...tools.map(t => t.name)], customTools: tools,
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
      return { name, session, briefing: briefing(task, profile, name, names) };
    }));
    log("run_start", {
      task, profile, workspace,
      agents: agents.map(a => ({
        name: a.name, model: a.session.model?.id, thinking: a.session.thinkingLevel,
        tools: a.session.getActiveToolNames(), briefing: a.briefing,
      })),
    });
    await Promise.all(agents.map((agent, index) => runAgent(agent, index)));
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
  for (const { name, session } of agents) {
    writeFileSync(join(opts.runDir, `${name}.messages.json`), JSON.stringify(session.messages, null, 1) + "\n");
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
