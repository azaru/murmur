#!/usr/bin/env node
// Round 5A (coordination vs compute, and the evidence gate) in parallel lanes: one swarmtest campaign per
// task x arm x repetition, with repetitions: 1, because x1g-select and x1g-coord can reach the token cap and a capped
// run stops its campaign. Swarm campaigns carry c4g-evidence as their single agent; c4g-relay4 runs alone, so a
// capped relay run only stops itself. Done-detection counts this round's records by its seed.
//   nohup node criba5-lanes.mjs <lane> &
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const lane = process.argv[2] ?? "1";
const here = "/Users/azaru/Documents/projects/murmur/experiments";
const swarmtest = "/Users/azaru/Documents/projects/swarmtest";
const runs = join(swarmtest, "runs");
const base = JSON.parse(readFileSync(join(here, "criba3.json"), "utf8"));
const seed = 20261015;
const agent = (variant, agents) => ({ system: "murmur", agents, variant: `profiles/${variant}.json` });
const filler = agent("c4g-evidence", 1);
const [ieh, ieh2, durable] = ["information_extraction_hard", "information_extraction_hard2", "durable_workflow_engine"];
// [task, slug, competitors, repetitions]; the last competitor is the arm being counted.
const units = [
  ...[ieh, ieh2].flatMap(task => [
    [task, "x1g-select", [filler, agent("x1g-select", 3)], 3],
    [task, "x1g-coord", [filler, agent("x1g-coord", 3)], 3],
    [task, "c4g-relay4", [agent("c4g-relay4", 1)], 3],
  ]),
  ...[ieh, durable].map(task => [task, "x1g-evidence", [filler, agent("x1g-evidence", 3)], 2]),
];
const dir = join(here, "criba5");
const locks = join(dir, "locks");
const log = line => appendFileSync(join(here, "criba5-lanes.log"), `${new Date().toISOString()} lane ${lane} ${line}\n`);

const records = () => readdirSync(runs).filter(d => existsSync(join(runs, d, "campaign.json"))).flatMap(d => {
  if (JSON.parse(readFileSync(join(runs, d, "campaign.json"), "utf8")).config?.seed !== seed) return [];
  return readdirSync(join(runs, d)).filter(n => n.startsWith("run-") && existsSync(join(runs, d, n, "record.json")))
    .map(n => JSON.parse(readFileSync(join(runs, d, n, "record.json"), "utf8")));
});
const same = (r, task, c) => r.task === task && r.system === c.system && r.agents === c.agents && r.variant === c.variant;
const take = id => {
  try { closeSync(openSync(join(locks, id), "wx")); return true; } catch { return false; }
};

mkdirSync(locks, { recursive: true });
// Interleave repetitions so early results cover every arm before any arm gets its last repetition.
const maxReps = Math.max(...units.map(u => u[3]));
for (let rep = 0; rep < maxReps; rep++) {
  for (const [task, slug, competitors, reps] of units) {
    const id = `${task}-${slug}-r${rep}`;
    if (rep >= reps || records().filter(r => same(r, task, competitors.at(-1))).length >= reps || !take(id)) continue;
    const config = join(dir, `${id}.json`);
    writeFileSync(config, JSON.stringify({ ...base, seed, repetitions: 1, competitors }, null, 2) + "\n");
    log(`start ${id}`);
    const out = spawnSync("python3", ["-m", "swarmtest", "--config", config, "run", "--live", "--tasks", task, "--max-total-tokens", "25000000"],
      { cwd: swarmtest, encoding: "utf8" });
    writeFileSync(join(dir, `${id}.log`), out.stdout + out.stderr);
    log(`end ${id} exit=${out.status} ${/Campaign: (\S+)/.exec(out.stdout)?.[1] ?? "no campaign"}`);
  }
}
log("no work left");
