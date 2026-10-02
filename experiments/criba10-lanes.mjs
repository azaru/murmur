#!/usr/bin/env node
// Round 10: quality signal, swarm size, back to basics and a cheaper V swarm. One campaign per stage x task x repetition,
// tasks read through a private view of symlinks (tasks/ or staging/), done-detection by the stage's seed and its swarm
// arm. Competitor lists are ordered so that, with each stage's seed, swarmtest runs every n=1 arm before the swarm (a
// swarm run that hits the cap or the timeout stops the campaign); on V the swarm runs alone (--limit 1) and the n=1
// entry is listed only because swarmtest requires one. Orders checked with `swarmtest plan` before launch.
//   nohup node criba10-lanes.mjs <lane> <stage>... &
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const [lane, ...stages] = process.argv.slice(2);
const here = "/Users/azaru/Documents/projects/murmur/experiments";
const swarmtest = "/Users/azaru/Documents/projects/swarmtest";
const runs = join(swarmtest, "runs");
const base = JSON.parse(readFileSync(join(here, "criba3.json"), "utf8"));
const agent = (variant, agents) => ({ system: "murmur", agents, variant: `profiles/${variant}.json` });
const D = ["opt_packing2", "opt_shop2", "opt_roster2"];
const STAGES = {
  S3: { seed: 20261036, tasks: D, competitors: [agent("x1g-select-signal", 3), agent("c4g-clock", 1), agent("c4g-signal", 1)] },
  S2: { seed: 20261037, tasks: D, competitors: [agent("c4g-signal", 1), agent("x1g-select-signal", 2)] },
  S10: { seed: 20261038, tasks: D, competitors: [agent("c4g-signal", 1), agent("x1g-select-signal", 10)], lanes: ["1"] },
  B0: { seed: 20261039, tasks: D, competitors: [agent("b0-basic", 3), agent("c4g-clock", 1)] },
  V: { seed: 20261040, tasks: ["ospec_brown"], competitors: [agent("c4g-clock", 1), agent("ti-swarm-clock", 4)],
    limits: { token_budget: 6_000_000, timeout_seconds: 1920 }, limit: ["--limit", "1"] },
};
if (!lane || !stages.length || stages.some(s => !STAGES[s])) throw new Error(`usage: node criba10-lanes.mjs <lane> <${Object.keys(STAGES).join("|")}>...`);
const dir = join(here, "criba10");
const locks = join(dir, "locks");
mkdirSync(locks, { recursive: true });
const log = line => appendFileSync(join(here, "criba10-lanes.log"), `${new Date().toISOString()} lane ${lane} ${line}\n`);
const same = (r, task, c) => r.task === task && r.system === c.system && r.agents === c.agents && (r.variant ?? null) === (c.variant ?? null);
const take = id => {
  try { closeSync(openSync(join(locks, id), "wx")); return true; } catch { return false; }
};

for (const stage of stages) {
  const { seed, tasks, competitors, limits = {}, limit = [], lanes } = STAGES[stage];
  if (lanes && !lanes.includes(lane)) continue;
  const counted = competitors.find(c => c.agents > 1);
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
  for (let rep = 0; rep < 3; rep++) {
    for (const task of tasks) {
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
}
log(`no work left (${stages.join(" ")})`);
