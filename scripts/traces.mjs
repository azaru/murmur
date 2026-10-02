#!/usr/bin/env node
// Per-agent behavior summary from swarmtest campaigns: how much each agent worked, checked and coordinated, and why it stopped.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

const dirs = process.argv.slice(2);
if (!dirs.length) {
  console.error("usage: node scripts/traces.mjs <campaign-dir>...");
  process.exit(1);
}

const BOARD = new Set(["post", "inbox", "team", "budget", "claim", "release", "role", "finding", "done", "thread_new", "thread_list", "thread_read", "reply"]);
const json = path => JSON.parse(readFileSync(path, "utf8"));
const text = message => (Array.isArray(message.content) ? message.content : [{ type: "text", text: message.content }])
  .filter(c => c.type === "text").map(c => c.text).join(" ");
const oneLine = (s, n) => (s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

/** Agents of a run as [name, messages]: Pi keeps one transcript, murmur one per agent. */
function transcripts(run) {
  const pi = join(run, "state", "messages.json");
  if (existsSync(pi)) return [["pi", json(pi)]];
  const dir = join(run, "state", "murmur");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith(".messages.json")).sort()
    .map(f => [f.replace(".messages.json", ""), json(join(dir, f))]);
}

function summarize(messages, checkCommand) {
  const results = new Map(messages.filter(m => m.role === "toolResult").map(m => [m.toolCallId, m]));
  const s = { calls: 0, board: 0, checks: 0, firstGreen: null, afterGreen: 0, last: "none", overwrites: 0, nudges: 0, final: "" };
  const written = new Set();
  for (const m of messages) {
    if (m.role === "user") s.nudges += 1;
    if (m.role !== "assistant") continue;
    const said = text(m);
    if (said.trim()) s.final = said;
    for (const c of m.content.filter(c => c.type === "toolCall")) {
      s.calls += 1;
      if (s.firstGreen !== null) s.afterGreen += 1;
      if (BOARD.has(c.name)) s.board += 1;
      const args = c.arguments ?? {};
      // A write that starts indented continues a file the previous write already replaced.
      if (c.name === "write") {
        if (written.has(args.path) && /^\s/.test(args.content ?? "")) s.overwrites += 1;
        written.add(args.path);
      }
      if (c.name === "bash" && (args.command ?? "").includes(checkCommand)) {
        s.checks += 1;
        const r = results.get(c.id);
        const failed = !r || r.isError || /exited with code [1-9]/.test(text(r));
        s.last = failed ? "red" : "green";
        if (!failed && s.firstGreen === null) s.firstGreen = s.calls;
      }
    }
  }
  s.nudges = Math.max(0, s.nudges - 1); // the first user message is the briefing
  return s;
}

const label = r => `${r.system}${r.variant ? `[${basename(r.variant, ".json")}]` : ""}/n=${r.agents}`;
console.log("| run | task | arm | score | tokens | min | end | agent | calls | board % | checks | green at | after green | last check | overwrites | nudges |");
console.log("|---|---|---|---:|---:|---:|---|---|---:|---:|---:|---:|---:|---|---:|---:|");
const stops = [];
for (const dir of dirs) {
  for (const name of readdirSync(dir).filter(n => n.startsWith("run-")).sort()) {
    const run = join(dir, name);
    if (!existsSync(join(run, "record.json"))) continue;
    const record = json(join(run, "record.json"));
    const checkCommand = json(join(run, "request.json")).acceptance_command;
    const result = existsSync(join(run, "state", "murmur", "result.json")) ? json(join(run, "state", "murmur", "result.json")) : undefined;
    const end = result?.reason ?? record.result?.status;
    const runId = `${basename(dir).slice(-8)}/${name.slice(4)}`;
    for (const [agent, messages] of transcripts(run)) {
      const s = summarize(messages, checkCommand);
      const head = [runId, record.task, label(record), record.grade?.score?.toFixed(3) ?? "-",
        `${((record.result?.tokens?.total ?? 0) / 1e6).toFixed(2)}M`, ((record.process?.elapsed_seconds ?? 0) / 60).toFixed(1), end];
      console.log(`| ${[...head, agent, s.calls, s.calls ? Math.round(100 * s.board / s.calls) : 0, s.checks,
        s.firstGreen ?? "-", s.firstGreen === null ? "-" : s.afterGreen, s.last, s.overwrites, s.nudges].join(" | ")} |`);
      const doneReason = result?.agents?.find(a => a.name === agent)?.doneReason;
      stops.push(`- ${runId} ${label(record)} ${agent}: ${doneReason ? `done: ${oneLine(doneReason, 200)}` : `last text: ${oneLine(s.final, 200)}`}`);
    }
  }
}
console.log("\nWhy each agent stopped:\n" + stops.join("\n"));
