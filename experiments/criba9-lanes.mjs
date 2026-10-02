#!/usr/bin/env node
// Round 9: the swarm against c4g-clock n=1 on panels D and V. One campaign per task x repetition, tasks read through a
// private view of symlinks (tasks/ or staging/), done-detection by the stage's seed and the swarm arm.
// - D (seed 20261034): [x1g-select-clock n=3, c4g-clock n=1]. With this seed swarmtest runs c4g-clock first, so a swarm
//   run that hits the cap or the timeout (which stops the campaign) never costs the paired solo run.
// - V (seed 20261035, 6M and 30 effective minutes): [v-swarm-clock n=4, c4g-clock n=1] with --limit 1. With this seed
//   the swarm comes first, so only the swarm runs; the n=1 entry is listed because swarmtest requires one. The solo arm
//   is the round 8 calibration (seed 20261033), reused as pre-registered.
//   nohup node criba9-lanes.mjs <D|V> <lane> &
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const [stage, lane = "1"] = process.argv.slice(2);
const here = "/Users/azaru/Documents/projects/murmur/experiments";
const swarmtest = "/Users/azaru/Documents/projects/swarmtest";
const runs = join(swarmtest, "runs");
const base = JSON.parse(readFileSync(join(here, "criba3.json"), "utf8"));
const agent = (variant, agents) => ({ system: "murmur", agents, variant: `profiles/${variant}.json` });
const STAGES = {
  D: { seed: 20261034, tasks: ["constrained_planning_hard", "opt_roster2", "opt_shop2", "opt_packing2"], limits: {}, limit: [],
    competitors: [agent("x1g-select-clock", 3), agent("c4g-clock", 1)] },
  V: { seed: 20261035, tasks: ["ospec_green", "ospec_brown"], limits: { token_budget: 6_000_000, timeout_seconds: 1920 }, limit: ["--limit", "1"],
    competitors: [agent("v-swarm-clock", 4), agent("c4g-clock", 1)] },
};
if (!STAGES[stage]) throw new Error("usage: node criba9-lanes.mjs <D|V> <lane>");
const { seed, tasks: TASKS, limits, limit, competitors } = STAGES[stage];
const counted = competitors[0];
const dir = join(here, "criba9");
const view = join(dir, `tasks-${stage}`);
mkdirSync(view, { recursive: true });
for (const task of TASKS) {
  const source = [join(swarmtest, "tasks", task), join(swarmtest, "staging", task)].find(existsSync);
  if (!existsSync(join(view, task))) symlinkSync(source, join(view, task));
}
const locks = join(dir, "locks");
const log = line => appendFileSync(join(here, `criba9-${stage}-lanes.log`), `${new Date().toISOString()} lane ${lane} ${line}\n`);

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
// Interleave repetitions so early results cover every task before any task gets its last repetition.
for (let rep = 0; rep < 3; rep++) {
  for (const task of TASKS) {
    const id = `${stage}-${task}-r${rep}`;
    if (records().filter(r => same(r, task, counted)).length >= 3 || !take(id)) continue;
    const config = join(dir, `${id}.json`);
    writeFileSync(config, JSON.stringify({ ...base, ...limits, tasks: view, seed, repetitions: 1, competitors }, null, 2) + "\n");
    log(`start ${id}`);
    const out = spawnSync("python3", ["-m", "swarmtest", "--config", config, "run", "--live", "--tasks", task, ...limit, "--max-total-tokens", "25000000"],
      { cwd: swarmtest, encoding: "utf8" });
    writeFileSync(join(dir, `${id}.log`), out.stdout + out.stderr);
    log(`end ${id} exit=${out.status} ${/Campaign: (\S+)/.exec(out.stdout)?.[1] ?? "no campaign"}`);
  }
}
log("no work left");
