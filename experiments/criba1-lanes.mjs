#!/usr/bin/env node
// Criba 1 in parallel lanes: each lane takes the next task x arm that is neither done nor taken by another lane
// and runs it as its own swarmtest campaign beside a Pi run. Start several lanes to run campaigns concurrently:
//   node criba1-lanes.mjs <lane>
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const lane = process.argv[2] ?? "1";
const here = "/Users/azaru/Documents/projects/murmur/experiments";
const swarmtest = "/Users/azaru/Documents/projects/swarmtest";
const runs = join(swarmtest, "runs");
const tasks = ["information_extraction_hard", "constrained_planning_hard", "durable_workflow_engine"];
const murmur = variant => ({ system: "murmur", agents: 3, ...(variant && { variant: `profiles/${variant}.json` }) });
const arms = [
  ["default", murmur()], ["nomsg", murmur("no-messaging")], ["c1", murmur("c1-norms")], ["c2", murmur("c2-roles")],
  ["c4n1", { ...murmur("c4-lessons"), agents: 1 }], ["c4", murmur("c4-lessons")], ["c5", murmur("c5-attempts")],
  ["c3", murmur("c3-close")], ["x1", murmur("x1-attach")], ["x2", murmur("x2-files")], ["x3", murmur("x3-notices")],
  ["c6", murmur("c6-silent-norms")], ["x4", murmur("x4-pull")],
];
const pi = { system: "pi", agents: 1 };
const base = JSON.parse(readFileSync(join(here, "criba1.json"), "utf8"));
const locks = join(here, "criba1", "locks");
const log = line => appendFileSync(join(here, "criba1-lanes.log"), `${new Date().toISOString()} lane ${lane} ${line}\n`);

// Every finished run of this criba, found by the criba's seed.
const records = () => readdirSync(runs).filter(d => existsSync(join(runs, d, "campaign.json"))).flatMap(d => {
  if (JSON.parse(readFileSync(join(runs, d, "campaign.json"), "utf8")).config?.seed !== base.seed) return [];
  return readdirSync(join(runs, d)).filter(n => n.startsWith("run-") && existsSync(join(runs, d, n, "record.json")))
    .map(n => JSON.parse(readFileSync(join(runs, d, n, "record.json"), "utf8")));
});
const same = (r, task, c) => r.task === task && r.system === c.system && r.agents === c.agents && (r.variant ?? undefined) === c.variant;
const take = id => {
  try { closeSync(openSync(join(locks, id), "wx")); return true; } catch { return false; }
};

mkdirSync(locks, { recursive: true });
for (const task of tasks) {
  for (const [slug, competitor] of arms) {
    const id = `${task}-${slug}`;
    if (records().some(r => same(r, task, competitor)) || !take(id)) continue;
    const config = join(here, "criba1", `${slug}.json`);
    writeFileSync(config, JSON.stringify({ ...base, competitors: [pi, competitor] }, null, 2) + "\n");
    log(`start ${id}`);
    const out = spawnSync("python3", ["-m", "swarmtest", "--config", config, "run", "--live", "--tasks", task, "--max-total-tokens", "7000000"],
      { cwd: swarmtest, encoding: "utf8" });
    writeFileSync(join(here, "criba1", `${id}.log`), out.stdout + out.stderr);
    log(`end ${id} exit=${out.status} ${/Campaign: (\S+)/.exec(out.stdout)?.[1] ?? "no campaign"}`);
  }
}
log("no work left");
