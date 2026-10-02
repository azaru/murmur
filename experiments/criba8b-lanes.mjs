#!/usr/bin/env node
// Round 8, second step: c4g-clock calibrations of (a) the three panel D tasks after the large-visible-instance remedy
// and (b) the scaled OpenSpec projects, which get 30 effective minutes and 6M tokens per run (swarmtest's murmur adapter
// keeps 2 of the timeout's minutes for the final check). Otherwise as criba8-lanes.mjs: one campaign per task x
// repetition, tasks read from staging/ through a private view of symlinks, done-detection by the stage's seed.
//   nohup node criba8b-lanes.mjs <remedy|ospec> <lane> &
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const [stage, lane = "1"] = process.argv.slice(2);
const here = "/Users/azaru/Documents/projects/murmur/experiments";
const swarmtest = "/Users/azaru/Documents/projects/swarmtest";
const runs = join(swarmtest, "runs");
const base = JSON.parse(readFileSync(join(here, "criba3.json"), "utf8"));
const STAGES = {
  remedy: { seed: 20261032, tasks: ["opt_shop2", "opt_packing2", "plan_timetable"], limits: {} },
  ospec: { seed: 20261033, tasks: ["ospec_green", "ospec_brown"], limits: { token_budget: 6_000_000, timeout_seconds: 1920 } },
};
if (!STAGES[stage]) throw new Error("usage: node criba8b-lanes.mjs <remedy|ospec> <lane>");
const { seed, tasks: TASKS, limits } = STAGES[stage];
const agent = (variant, agents) => ({ system: "murmur", agents, variant: `profiles/${variant}.json` });
// [task, slug, competitors, repetitions]; the last competitor is the arm being counted.
const units = TASKS.map(task => [task, "c4g-clock", [agent("c4g-clock", 1)], 3]);
const dir = join(here, "criba8b");
const view = join(dir, `tasks-${stage}`);
mkdirSync(view, { recursive: true });
for (const task of TASKS) if (!existsSync(join(view, task))) symlinkSync(join(swarmtest, "staging", task), join(view, task));
const locks = join(dir, "locks");
const log = line => appendFileSync(join(here, `criba8b-${stage}-lanes.log`), `${new Date().toISOString()} lane ${lane} ${line}\n`);

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
    writeFileSync(config, JSON.stringify({ ...base, ...limits, tasks: view, seed, repetitions: 1, competitors }, null, 2) + "\n");
    log(`start ${id}`);
    const out = spawnSync("python3", ["-m", "swarmtest", "--config", config, "run", "--live", "--tasks", task, "--max-total-tokens", "25000000"],
      { cwd: swarmtest, encoding: "utf8" });
    writeFileSync(join(dir, `${id}.log`), out.stdout + out.stderr);
    log(`end ${id} exit=${out.status} ${/Campaign: (\S+)/.exec(out.stdout)?.[1] ?? "no campaign"}`);
  }
}
log("no work left");
