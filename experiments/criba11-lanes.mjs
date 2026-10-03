#!/usr/bin/env node
// Round 11, phase 1: oracle-free re-test of the single agent on the blind panel (tasks in ../swarmtest/staging/*_blind,
// where the visible check confirms only that the program runs and writes the documented format). One campaign per
// stage x task x repetition, tasks read through a private view of symlinks, done-detection by the stage's seed and its
// counted arm. With P's seed swarmtest runs solo-norms-clock last (checked with make_plan), so a capped run of the arm
// most likely to spend tokens never costs the others; O runs one arm alone.
//   nohup node criba11-lanes.mjs <lane> <stage>... &
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const [lane, ...stages] = process.argv.slice(2);
const here = "/Users/azaru/Documents/projects/murmur/experiments";
const swarmtest = "/Users/azaru/Documents/projects/swarmtest";
const runs = join(swarmtest, "runs");
const base = JSON.parse(readFileSync(join(here, "criba3.json"), "utf8"));
const agent = (variant, agents) => ({ system: "murmur", agents, variant: `profiles/${variant}.json` });
const P = ["opt_packing2_blind", "opt_shop2_blind", "opt_roster2_blind", "information_extraction_hard_blind",
  "ledger_reconciliation_hard_blind", "durable_workflow_engine_blind"];
const solo = ["solo", "solo-norms", "solo-norms-clock"].map(v => agent(v, 1));
const STAGES = {
  P: { seed: 20261053, tasks: P, competitors: [{ system: "pi", agents: 1 }, ...solo], counted: solo[2] },
  // Added after 10 of 21 campaigns (see plan.md): the clock without norms, paired with solo; solo-clock runs last.
  C: { seed: 20261055, tasks: P, competitors: [solo[0], agent("solo-clock", 1)], counted: agent("solo-clock", 1) },
  O: { seed: 20261054, tasks: ["ospec_brown_blind"], competitors: [solo[2]], counted: solo[2],
    limits: { token_budget: 6_000_000, timeout_seconds: 1920 } },
};
if (!lane || !stages.length || stages.some(s => !STAGES[s])) throw new Error(`usage: node criba11-lanes.mjs <lane> <${Object.keys(STAGES).join("|")}>...`);
const dir = join(here, "criba11");
const locks = join(dir, "locks");
mkdirSync(locks, { recursive: true });
const log = line => appendFileSync(join(here, "criba11-lanes.log"), `${new Date().toISOString()} lane ${lane} ${line}\n`);
const same = (r, task, c) => r.task === task && r.system === c.system && r.agents === c.agents && (r.variant ?? null) === (c.variant ?? null);
const take = id => {
  try { closeSync(openSync(join(locks, id), "wx")); return true; } catch { return false; }
};

for (const stage of stages) {
  const { seed, tasks, competitors, counted, limits = {}, limit = [], lanes } = STAGES[stage];
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
