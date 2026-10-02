#!/usr/bin/env node
// Round 8 (calibration of the expanded panel against c4g-clock and Pi) in parallel lanes: one swarmtest campaign per
// task x arm x repetition, with repetitions: 1, because clock runs can reach the token cap and a capped run stops its
// campaign. The tasks stay in swarmtest's staging/; each lane rebuilds a private view of them (symlinks) that the
// campaigns read as their tasks folder, so nothing is moved into tasks/. Done-detection counts records by the seed.
//   nohup node criba8-lanes.mjs <lane> &
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const lane = process.argv[2] ?? "1";
const here = "/Users/azaru/Documents/projects/murmur/experiments";
const swarmtest = "/Users/azaru/Documents/projects/swarmtest";
const runs = join(swarmtest, "runs");
const base = JSON.parse(readFileSync(join(here, "criba3.json"), "utf8"));
const seed = 20261030;
const agent = (variant, agents) => ({ system: "murmur", agents, variant: `profiles/${variant}.json` });
const TASKS = ["opt_shop2", "opt_packing2", "opt_roster2", "plan_timetable", "pred_demand", "opt_routing"];
// [task, slug, competitors, repetitions]; the last competitor is the arm being counted.
const units = TASKS.flatMap(task => [
  [task, "c4g-clock", [agent("c4g-clock", 1)], 3],
  [task, "pi", [{ system: "pi", agents: 1 }], 3],
]);
const dir = join(here, "criba8");
const view = join(dir, "tasks");
mkdirSync(view, { recursive: true });
for (const task of TASKS) if (!existsSync(join(view, task))) symlinkSync(join(swarmtest, "staging", task), join(view, task));
const locks = join(dir, "locks");
const log = line => appendFileSync(join(here, "criba8-lanes.log"), `${new Date().toISOString()} lane ${lane} ${line}\n`);

const records = () => readdirSync(runs).filter(d => existsSync(join(runs, d, "campaign.json"))).flatMap(d => {
  if (JSON.parse(readFileSync(join(runs, d, "campaign.json"), "utf8")).config?.seed !== seed) return [];
  return readdirSync(join(runs, d)).filter(n => n.startsWith("run-") && existsSync(join(runs, d, n, "record.json")))
    .map(n => JSON.parse(readFileSync(join(runs, d, n, "record.json"), "utf8")));
});
const same = (r, task, c) => r.task === task && r.system === c.system && r.agents === c.agents && (r.variant ?? null) === (c.variant ?? null);
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
    writeFileSync(config, JSON.stringify({ ...base, tasks: view, seed, repetitions: 1, competitors }, null, 2) + "\n");
    log(`start ${id}`);
    const out = spawnSync("python3", ["-m", "swarmtest", "--config", config, "run", "--live", "--tasks", task, "--max-total-tokens", "25000000"],
      { cwd: swarmtest, encoding: "utf8" });
    writeFileSync(join(dir, `${id}.log`), out.stdout + out.stderr);
    log(`end ${id} exit=${out.status} ${/Campaign: (\S+)/.exec(out.stdout)?.[1] ?? "no campaign"}`);
  }
}
log("no work left");
