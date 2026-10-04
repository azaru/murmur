#!/usr/bin/env node
// Round 17: a fresh-context audit before the run ends. One agent (C1T) against the same agent with two relays (C1TR: a
// fresh instance takes the seat after each done) and three agents who enter one at a time, each when the previous one
// finishes, with a post-only board and revival by posts (AUD). Same machinery as criba16-lanes.mjs: one campaign per
// task x arm x repetition; a non-solo arm's campaign lists [C1T, arm] with the arm first in make_plan under the seed
// (checked on the plan field) and runs alone with --limit 1. Quota stop as before.
//   nohup node criba17-lanes.mjs <lane> A &      (resume: delete criba17/STOP and launch again)
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const argv = process.argv.slice(2), armsAt = argv.indexOf("--arms");
const only = armsAt >= 0 ? argv.splice(armsAt, 2)[1].split(",") : undefined;
const [lane, ...stages] = argv;
const here = "/Users/azaru/Documents/projects/murmur/experiments";
const swarmtest = "/Users/azaru/Documents/projects/swarmtest";
const runs = join(swarmtest, "runs");
const base = JSON.parse(readFileSync(join(here, "criba3.json"), "utf8"));
const agent = (variant, agents) => ({ system: "murmur", agents, variant: `profiles/${variant}.json` });
const ARMS = { C1T: agent("solo-clock-tokens", 1), C1TR: agent("solo-clock-tokens-relay2", 1), AUD: agent("n3-audit-tokens", 3) };
const STAGES = {
  A: { seed: 20261101, reps: 3, tasks: ["constrained_planning_hard_blind", "opt_shop2_blind"], arms: ["C1T", "C1TR", "AUD"], solo: "C1T",
    limits: { token_budget: 12_000_000, timeout_seconds: 3720 } },
};
if (!lane || !stages.length || stages.some(s => !STAGES[s])) throw new Error(`usage: node criba17-lanes.mjs <lane> <${Object.keys(STAGES).join("|")}>...`);
const dir = join(here, "criba17");
const locks = join(dir, "locks"), stop = join(dir, "STOP"), invalidFile = join(dir, "invalid.txt");
mkdirSync(locks, { recursive: true });
const log = line => appendFileSync(join(here, "criba17-lanes.log"), `${new Date().toISOString()} lane ${lane} ${line}\n`);
const same = (r, task, c) => r.task === task && r.system === c.system && r.agents === c.agents && (r.variant ?? null) === (c.variant ?? null);
const take = id => {
  try { closeSync(openSync(join(locks, id), "wx")); return true; } catch { return false; }
};
const invalid = () => new Set(existsSync(invalidFile) ? readFileSync(invalidFile, "utf8").split("\n").filter(Boolean) : []);
// Campaigns whose transcripts carry the model's quota error.
const quotaHit = campaign => readdirSync(join(runs, campaign)).filter(n => n.startsWith("run-")).some(run => {
  const states = [join(runs, campaign, run, "state", "murmur"), join(runs, campaign, run, "state")];
  return states.filter(existsSync).some(state => readdirSync(state).filter(f => f.endsWith("messages.json")).some(file => {
    try {
      return JSON.parse(readFileSync(join(state, file), "utf8")).some(m => m.role === "assistant" && m.stopReason === "error" && /usage limit/i.test(m.errorMessage ?? ""));
    } catch { return false; }
  }));
});

for (const stage of stages) {
  const { seed, reps, tasks, arms, limits, solo, alone } = STAGES[stage];
  const view = join(dir, `tasks-${stage}`);
  mkdirSync(view, { recursive: true });
  for (const task of tasks) {
    const source = [join(swarmtest, "tasks", task), join(swarmtest, "staging", task)].find(existsSync);
    if (!existsSync(join(view, task))) symlinkSync(source, join(view, task));
  }
  const records = () => {
    const bad = invalid();
    return readdirSync(runs).filter(d => !bad.has(d) && existsSync(join(runs, d, "campaign.json"))).flatMap(d => {
      if (JSON.parse(readFileSync(join(runs, d, "campaign.json"), "utf8")).config?.seed !== seed) return [];
      return readdirSync(join(runs, d)).filter(n => n.startsWith("run-") && existsSync(join(runs, d, n, "record.json")))
        .map(n => JSON.parse(readFileSync(join(runs, d, n, "record.json"), "utf8")));
    });
  };
  for (let rep = 0; rep < reps; rep++) {
    for (const task of tasks) {
      for (const name of arms) {
        if (existsSync(stop)) { log("STOP file present, exiting"); process.exit(0); }
        if (only && !only.includes(name)) continue;
        const arm = ARMS[name], id = `${stage}-${task}-${name}-r${rep}`;
        if (records().filter(r => same(r, task, arm)).length > rep || !take(id)) continue;
        const config = join(dir, `${id}.json`);
        const competitors = name === solo || alone ? [arm] : [ARMS[solo], arm]; // under each stage's seed make_plan swaps the two, so the arm runs first (checked on the plan field)
        writeFileSync(config, JSON.stringify({ ...base, ...limits, tasks: view, seed, repetitions: 1, competitors }, null, 2) + "\n");
        log(`start ${id}`);
        const limit = name === solo || alone ? [] : ["--limit", "1"];
        const out = spawnSync("python3", ["-m", "swarmtest", "--config", config, "run", "--live", "--tasks", task, ...limit, "--max-total-tokens", "30000000"],
          { cwd: swarmtest, encoding: "utf8" });
        writeFileSync(join(dir, `${id}.log`), out.stdout + out.stderr);
        const campaign = /Campaign: (\S+)/.exec(out.stdout)?.[1]?.split("/").pop();
        log(`end ${id} exit=${out.status} ${campaign ?? "no campaign"}`);
        if (campaign && existsSync(join(runs, campaign)) && quotaHit(campaign)) {
          appendFileSync(invalidFile, `${campaign}\n`);
          rmSync(join(locks, id));
          writeFileSync(stop, `${new Date().toISOString()} usage limit in ${campaign} (${id})\n`);
          log(`usage limit in ${campaign}: marked invalid, lock removed, STOP written`);
          process.exit(0);
        }
      }
    }
  }
}
log(`no work left (${stages.join(" ")})`);
