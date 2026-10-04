#!/usr/bin/env node
// Round 16, stage A: at equal caps with the tokens left visible, one agent (C1T) against 12 agents with staggered entry (STT)
// and the same swarm with a threaded board (STH), on planning and shop2. Same machinery as criba15-lanes.mjs.
// One campaign per task x arm x repetition. A swarm arm's campaign lists [arm, C1] with the arm first in make_plan under
// the seed (checked) and runs alone with --limit 1, because a capped run stops its campaign. C1 gets its own campaigns.
// Repetition 0 of every arm runs before any repetition 1, so a stop leaves complete k=1 coverage.
// After each campaign the transcripts are scanned for the model's "usage limit" error: the campaign is recorded as
// invalid, its lock is removed so a resumed lane retakes it, a STOP file is written and every lane exits.
//   nohup node criba16-lanes.mjs <lane> A [--arms C1T,STT] &      (resume: delete criba16/STOP and launch again)
// --arms limits a lane to those arms, so stage C can run its long single-agent campaigns beside the 12-agent ones.
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
const ARMS = { C1T: agent("solo-clock-tokens", 1), STT: agent("n12-stagger-tokens", 12), STH: agent("n12-stagger-threads-tokens", 12) };
const STAGES = {
  A: { seed: 20261080, reps: 2, tasks: ["constrained_planning_hard_blind", "opt_shop2_blind"], arms: ["C1T", "STT", "STH"], solo: "C1T",
    limits: { token_budget: 12_000_000, timeout_seconds: 1200 } },
};
if (!lane || !stages.length || stages.some(s => !STAGES[s])) throw new Error(`usage: node criba16-lanes.mjs <lane> <${Object.keys(STAGES).join("|")}>...`);
const dir = join(here, "criba16");
const locks = join(dir, "locks"), stop = join(dir, "STOP"), invalidFile = join(dir, "invalid.txt");
mkdirSync(locks, { recursive: true });
const log = line => appendFileSync(join(here, "criba16-lanes.log"), `${new Date().toISOString()} lane ${lane} ${line}\n`);
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
  const { seed, reps, tasks, arms, limits, solo } = STAGES[stage];
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
        const competitors = name === solo ? [arm] : [ARMS[solo], arm]; // under each stage's seed make_plan swaps the two, so the arm runs first (checked on the plan field)
        writeFileSync(config, JSON.stringify({ ...base, ...limits, tasks: view, seed, repetitions: 1, competitors }, null, 2) + "\n");
        log(`start ${id}`);
        const limit = name === solo ? [] : ["--limit", "1"];
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
