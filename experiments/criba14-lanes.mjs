#!/usr/bin/env node
// Round 14 (phase 2): two agents with a board against one agent, without an oracle, with and without the clock.
// D: one campaign per task x repetition with all four arms; with its seed make_plan runs s2-board-clock last (checked),
// so a capped swarm run never costs the other arms. V (ospec, 6M and 1920 s, where single agents hit the cap): one
// campaign per arm, the arm first in make_plan under its seed (checked) and run alone with --limit 1; solo is listed
// as the campaign's n=1 competitor. Tasks are read through a private view of symlinks; done-detection by seed and arm.
//   nohup node criba14-lanes.mjs <lane> <stage>... &
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const [lane, ...stages] = process.argv.slice(2);
const here = "/Users/azaru/Documents/projects/murmur/experiments";
const swarmtest = "/Users/azaru/Documents/projects/swarmtest";
const runs = join(swarmtest, "runs");
const base = JSON.parse(readFileSync(join(here, "criba3.json"), "utf8"));
const agent = (variant, agents) => ({ system: "murmur", agents, variant: `profiles/${variant}.json` });
const C1 = agent("solo-clock", 1), S2c = agent("s2-board-clock", 2), solo = agent("solo", 1), S2 = agent("s2-board", 2);
const V = ["ospec_brown_blind", "ospec_green_blind"];
const big = { token_budget: 6_000_000, timeout_seconds: 1920 }, alone = ["--limit", "1"];
const STAGES = {
  D: { seed: 20261066, tasks: ["constrained_planning_hard_blind", "opt_shop2_blind"], competitors: [C1, S2c, solo, S2], counted: S2c },
  VC: { seed: 20261060, tasks: V, competitors: [C1, solo], counted: C1, limits: big, limit: alone },
  VS: { seed: 20261062, tasks: V, competitors: [S2c, solo], counted: S2c, limits: big, limit: alone },
  VB: { seed: 20261063, tasks: V, competitors: [S2, solo], counted: S2, limits: big, limit: alone },
  VO: { seed: 20261065, tasks: V, competitors: [solo], counted: solo, limits: big },
};
if (!lane || !stages.length || stages.some(s => !STAGES[s])) throw new Error(`usage: node criba14-lanes.mjs <lane> <${Object.keys(STAGES).join("|")}>...`);
const dir = join(here, "criba14");
const locks = join(dir, "locks");
mkdirSync(locks, { recursive: true });
const log = line => appendFileSync(join(here, "criba14-lanes.log"), `${new Date().toISOString()} lane ${lane} ${line}\n`);
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
