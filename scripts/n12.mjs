#!/usr/bin/env node
// Round 15 descriptive measures for swarms, from swarmtest campaigns: score, spend, how the end came, duplicated writing,
// and the use of each coordination lever (task list, branches, roles, staggered entry, board), per run and per task x arm.
//   node scripts/n12.mjs <campaign-dir>... [--runs]
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

const args = process.argv.slice(2), perRun = args.includes("--runs"), dirs = args.filter(a => a !== "--runs");
if (!dirs.length) {
  console.error("usage: node scripts/n12.mjs <campaign-dir>... [--runs]");
  process.exit(1);
}
const COORDINATION = new Set(["post", "inbox", "team", "budget", "claim", "release", "role", "finding", "thread_new", "thread_list", "thread_read", "reply",
  "tasks", "task_add", "task_take", "task_done", "task_drop"]);
const WRITES = new Set(["write", "edit", "append"]);
const json = path => JSON.parse(readFileSync(path, "utf8"));
const mean = xs => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);
const f = (x, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : "–");

function measure(campaign, run) {
  const dir = join(campaign, run), record = json(join(dir, "record.json"));
  const state = join(dir, "state", "murmur");
  const arm = `${basename(record.variant ?? "pi", ".json")} n=${record.agents}`;
  const row = { campaign: basename(campaign), run, task: record.task, arm, score: record.grade?.score ?? NaN,
    tokens: record.result?.tokens?.total ?? NaN, minutes: (record.process?.elapsed_seconds ?? NaN) / 60 };
  if (!existsSync(join(state, "events.jsonl"))) return row;
  const events = readFileSync(join(state, "events.jsonl"), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
  const result = existsSync(join(state, "result.json")) ? json(join(state, "result.json")) : {};
  const count = type => events.filter(e => e.type === type).length;
  const tools = events.filter(e => e.type === "tool");
  const start = Date.parse(events[0]?.t);
  // Paths are made comparable across worktrees: an absolute path into an agent's branch counts as the same file.
  const writers = new Map();
  for (const e of tools.filter(e => WRITES.has(e.tool))) {
    const path = String(e.args?.path ?? "").replace(/^.*\/worktrees\/[^/]+\//, "").replace(/^\.\//, "");
    writers.set(path, (writers.get(path) ?? new Set()).add(e.agent));
  }
  const spread = [...writers.values()].map(s => s.size);
  const enters = events.filter(e => e.type === "enter").map(e => (Date.parse(e.t) - start) / 60_000);
  const unmerged = result.unmerged ?? {};
  return { ...row, reason: result.reason ?? "?", agentsDone: (result.agents ?? []).filter(a => a.done).length,
    calls: tools.length, coordination: tools.filter(e => COORDINATION.has(e.tool)).length / (tools.length || 1),
    maxWriters: Math.max(0, ...spread), meanWriters: mean(spread), refused: count("write_refused"),
    adds: count("task_add"), takes: count("task_take"), taskDone: count("task_done"), drops: count("task_drop"),
    branches: count("branch"), merges: count("merge"), conflicts: count("merge_conflict"), updates: count("update"),
    unmergedAgents: Object.keys(unmerged).length, unmergedFiles: Object.values(unmerged).flat().length,
    roles: tools.filter(e => e.tool === "role").map(e => e.args?.name).join(" "), lastEnter: enters.length ? Math.max(...enters) : NaN };
}

const rows = dirs.flatMap(campaign => readdirSync(campaign).filter(n => n.startsWith("run-") && existsSync(join(campaign, n, "record.json")))
  .map(run => measure(campaign, run)));
const cols = ["score", "tokens", "minutes", "agentsDone", "calls", "coordination", "maxWriters", "meanWriters", "refused",
  "adds", "takes", "taskDone", "drops", "branches", "merges", "conflicts", "updates", "unmergedAgents", "unmergedFiles", "lastEnter"];
const cell = (col, x) => (col === "tokens" ? `${f(x / 1e6)}M` : col === "minutes" || col === "coordination" || col === "meanWriters" || col === "lastEnter" || col === "score" ? f(x) : f(x, 1));

if (perRun) {
  console.log(`| campaign | run | task | arm | reason | roles | ${cols.join(" | ")} |\n|${"---|".repeat(cols.length + 6)}`);
  for (const r of rows) console.log(`| ${r.campaign} | ${r.run} | ${r.task} | ${r.arm} | ${r.reason ?? ""} | ${r.roles ?? ""} | ${cols.map(c => cell(c, r[c])).join(" | ")} |`);
  console.log();
}
const groups = new Map();
for (const r of rows) {
  const key = `${r.task} | ${r.arm}`;
  groups.set(key, [...(groups.get(key) ?? []), r]);
}
console.log(`| task | arm | runs | capped | ${cols.map(c => `mean ${c}`).join(" | ")} | scores |\n|${"---|".repeat(cols.length + 5)}`);
for (const [key, rs] of [...groups].sort()) {
  console.log(`| ${key} | ${rs.length} | ${rs.filter(r => r.reason === "budget").length} | ${cols.map(c => cell(c, mean(rs.map(r => r[c]).filter(Number.isFinite)))).join(" | ")} | ${rs.map(r => f(r.score)).join(" ")} |`);
}
