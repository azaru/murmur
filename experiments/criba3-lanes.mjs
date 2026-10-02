#!/usr/bin/env node
// Criba 3 (mechanisms against the broken shared file) in parallel lanes: each lane takes the next task x group
// that is neither done nor taken by another lane and runs it as one swarmtest campaign. The x1g variants share a
// campaign (x1 never reached the token cap); c5 can, so it runs apart. Every campaign carries the single-agent
// c4g control. Start several lanes to run campaigns concurrently:
//   node criba3-lanes.mjs <lane>
// Second pass, after a grouped campaign stopped early: one campaign per arm (with c4g) for the given tasks, skipping
// arms that already have two runs:
//   node criba3-lanes.mjs <lane> --per-arm <task>...
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const lane = process.argv[2] ?? "1";
const here = "/Users/azaru/Documents/projects/murmur/experiments";
const swarmtest = "/Users/azaru/Documents/projects/swarmtest";
const runs = join(swarmtest, "runs");
const tasks = ["information_extraction_hard", "feature_implementation_hard", "durable_workflow_engine"];
const murmur = variant => ({ system: "murmur", agents: 3, ...(variant && { variant: `profiles/${variant}.json` }) });
const single = { ...murmur("c4g-guard"), agents: 1 };
const perArm = process.argv.indexOf("--per-arm");
const grouped = [
  ["x1g", [single, murmur("x1g-guard"), murmur("x1g-lock"), murmur("x1g-stale"), murmur("x1g-parts")]],
  ["c5", [single, murmur("c5-attempts")]],
];
const groups = perArm < 0 ? grouped
  : ["x1g-guard", "x1g-lock", "x1g-stale", "x1g-parts"].map(v => [`${v}-alone`, [single, murmur(v)]]);
const taskList = perArm < 0 ? tasks : process.argv.slice(perArm + 1);
const base = JSON.parse(readFileSync(join(here, "criba3.json"), "utf8"));
const locks = join(here, "criba3", "locks");
const log = line => appendFileSync(join(here, "criba3-lanes.log"), `${new Date().toISOString()} lane ${lane} ${line}\n`);

// Every finished run of this criba, found by the criba's seed.
const records = () => readdirSync(runs).filter(d => existsSync(join(runs, d, "campaign.json"))).flatMap(d => {
  if (JSON.parse(readFileSync(join(runs, d, "campaign.json"), "utf8")).config?.seed !== base.seed) return [];
  return readdirSync(join(runs, d)).filter(n => n.startsWith("run-") && existsSync(join(runs, d, n, "record.json")))
    .map(n => JSON.parse(readFileSync(join(runs, d, n, "record.json"), "utf8")));
});
const same = (r, task, c) => r.task === task && r.system === c.system && r.agents === c.agents && (r.variant ?? undefined) === c.variant;
const take = id => {
  try { closeSync(openSync(join(locks, id), "wx")); return true; } catch { return false; }
};

mkdirSync(locks, { recursive: true });
for (const task of taskList) {
  for (const [slug, competitors] of groups) {
    const id = `${task}-${slug}`;
    if (records().filter(r => same(r, task, competitors.at(-1))).length >= base.repetitions || !take(id)) continue;
    const config = join(here, "criba3", `${slug}.json`);
    writeFileSync(config, JSON.stringify({ ...base, competitors }, null, 2) + "\n");
    log(`start ${id}`);
    const out = spawnSync("python3", ["-m", "swarmtest", "--config", config, "run", "--live", "--tasks", task, "--max-total-tokens", "25000000"],
      { cwd: swarmtest, encoding: "utf8" });
    writeFileSync(join(here, "criba3", `${id}.log`), out.stdout + out.stderr);
    log(`end ${id} exit=${out.status} ${/Campaign: (\S+)/.exec(out.stdout)?.[1] ?? "no campaign"}`);
  }
}
log("no work left");
