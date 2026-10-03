#!/usr/bin/env node
// Phase 2 calibration (round 13): Pi and C1 = solo-clock (phase 2's control) on four harder blind contract tasks, k=3.
// One campaign per stage x task x repetition, tasks read through a private view of symlinks, done-detection by the
// stage's seed and its counted arm. With both seeds make_plan runs solo-clock last (checked), so a capped C1 run never
// costs Pi's run. G runs ospec_green_blind with ospec's 6M and 1920 s.
//   nohup node criba13-lanes.mjs <lane> <stage>... &
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const [lane, ...stages] = process.argv.slice(2);
const here = "/Users/azaru/Documents/projects/murmur/experiments";
const swarmtest = "/Users/azaru/Documents/projects/swarmtest";
const runs = join(swarmtest, "runs");
const base = JSON.parse(readFileSync(join(here, "criba3.json"), "utf8"));
const agent = (variant, agents) => ({ system: "murmur", agents, variant: `profiles/${variant}.json` });
const competitors = [{ system: "pi", agents: 1 }, agent("solo-clock", 1)];
const STAGES = {
  K: { seed: 20261057, tasks: ["constrained_planning_hard_blind", "information_extraction_hard2_blind", "fam_payouts_blind"], competitors, counted: competitors[1] },
  G: { seed: 20261059, tasks: ["ospec_green_blind"], competitors, counted: competitors[1], limits: { token_budget: 6_000_000, timeout_seconds: 1920 } },
};
if (!lane || !stages.length || stages.some(s => !STAGES[s])) throw new Error(`usage: node criba13-lanes.mjs <lane> <${Object.keys(STAGES).join("|")}>...`);
const dir = join(here, "criba13");
const locks = join(dir, "locks");
mkdirSync(locks, { recursive: true });
const log = line => appendFileSync(join(here, "criba13-lanes.log"), `${new Date().toISOString()} lane ${lane} ${line}\n`);
const same = (r, task, c) => r.task === task && r.system === c.system && r.agents === c.agents && (r.variant ?? null) === (c.variant ?? null);
const take = id => {
  try { closeSync(openSync(join(locks, id), "wx")); return true; } catch { return false; }
};

for (const stage of stages) {
  const { seed, reps = 3, tasks, competitors, counted, limits = {}, limit = [], lanes } = STAGES[stage];
  if (lanes && !lanes.includes(lane)) continue;
  const view = join(dir, `tasks-${stage}`);
  mkdirSync(view, { recursive: true });
  for (const task of tasks) {
    const source = [join(swarmtest, "tasks", task), join(swarmtest, "staging", task)].find(existsSync);
    if (!existsSync(join(view, task))) symlinkSync(source, join(view, task));
  }
  const records = () => readdirSync(runs).filter(d => existsSync(join(runs, d, "campaign.json"))).flatMap(d => {
    if (JSON.parse(readFileSync(join(runs, d, "campaign.json"), "utf8")).config?.seed !== seed) return [];
    return readdirSync(join(runs, d)).filter(n => n.startsWith("run-") && existsSync(join(runs, d, n, "record.json")))
      .map(n => JSON.parse(readFileSync(join(runs, d, n, "record.json"), "utf8")));
  });
  // Interleave repetitions so early results cover every task before any task gets its last repetition.
  for (let rep = 0; rep < reps; rep++) {
    for (const task of tasks) {
      const id = `${stage}-${task}-r${rep}`;
      if (records().filter(r => same(r, task, counted)).length >= reps || !take(id)) continue;
      const config = join(dir, `${id}.json`);
      writeFileSync(config, JSON.stringify({ ...base, ...limits, tasks: view, seed, repetitions: 1, competitors }, null, 2) + "\n");
      log(`start ${id}`);
      const out = spawnSync("python3", ["-m", "swarmtest", "--config", config, "run", "--live", "--tasks", task, ...limit, "--max-total-tokens", "25000000"],
        { cwd: swarmtest, encoding: "utf8" });
      writeFileSync(join(dir, `${id}.log`), out.stdout + out.stderr);
      log(`end ${id} exit=${out.status} ${/Campaign: (\S+)/.exec(out.stdout)?.[1] ?? "no campaign"}`);
    }
  }
}
log(`no work left (${stages.join(" ")})`);
