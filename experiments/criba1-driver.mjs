#!/usr/bin/env node
// Criba 1: runs every missing task x arm as its own swarmtest campaign with a Pi run beside it,
// so a budget stop only ends that pair and every arm has a Pi baseline in its own campaign.
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { join } from "node:path";

const here = "/Users/azaru/Documents/projects/murmur/experiments";
const swarmtest = "/Users/azaru/Documents/projects/swarmtest";
const list = join(here, "criba1-campaigns.txt");
const tasks = ["information_extraction_hard", "constrained_planning_hard", "durable_workflow_engine"];
const arms = [
  ["default", { system: "murmur", agents: 3 }],
  ["nomsg", { system: "murmur", agents: 3, variant: "profiles/no-messaging.json" }],
  ["c1", { system: "murmur", agents: 3, variant: "profiles/c1-norms.json" }],
  ["c2", { system: "murmur", agents: 3, variant: "profiles/c2-roles.json" }],
  ["c4n1", { system: "murmur", agents: 1, variant: "profiles/c4-lessons.json" }],
  ["c4", { system: "murmur", agents: 3, variant: "profiles/c4-lessons.json" }],
  ["c5", { system: "murmur", agents: 3, variant: "profiles/c5-attempts.json" }],
  ["c3", { system: "murmur", agents: 3, variant: "profiles/c3-close.json" }],
];
const pi = { system: "pi", agents: 1 };
const base = JSON.parse(readFileSync(join(here, "criba1.json"), "utf8"));
const log = line => appendFileSync(join(here, "criba1-driver.log"), `${new Date().toISOString()} ${line}\n`);

// Wait for the original multi-arm campaign that may still be running.
while (execFileSync("ps", ["ax"], { encoding: "utf8" }).includes("criba1.json")) spawnSync("sleep", ["30"]);

const done = () => readFileSync(list, "utf8").split("\n").filter(Boolean).flatMap(dir =>
  readdirSync(dir).filter(n => n.startsWith("run-") && existsSync(join(dir, n, "record.json")))
    .map(n => JSON.parse(readFileSync(join(dir, n, "record.json"), "utf8"))));
const same = (r, task, c) => r.task === task && r.system === c.system && r.agents === c.agents && (r.variant ?? undefined) === c.variant;

mkdirSync(join(here, "criba1"), { recursive: true });
for (const task of tasks) {
  for (const [slug, competitor] of arms) {
    if (done().some(r => same(r, task, competitor))) continue;
    const config = join(here, "criba1", `${slug}.json`);
    writeFileSync(config, JSON.stringify({ ...base, competitors: [pi, competitor] }, null, 2) + "\n");
    log(`start ${task} ${slug}`);
    const out = spawnSync("python3", ["-m", "swarmtest", "--config", config, "run", "--live", "--tasks", task, "--max-total-tokens", "7000000"],
      { cwd: swarmtest, encoding: "utf8" });
    writeFileSync(join(here, "criba1", `${task}-${slug}.log`), out.stdout + out.stderr);
    const campaign = /Campaign: (\S+)/.exec(out.stdout)?.[1];
    if (campaign) appendFileSync(list, campaign + "\n");
    log(`end ${task} ${slug} exit=${out.status} ${campaign ?? "no campaign"}`);
  }
}
log("ALL DONE");
