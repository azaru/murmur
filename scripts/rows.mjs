#!/usr/bin/env node
// One row per finished swarmtest run (every campaign under the runs dir), so each number in the research log can be
// traced to a run: campaign, seed, task, arm, score, tokens, status and murmur's end reason.
//   node scripts/rows.mjs ../swarmtest/runs [--since 20260930] > experiments/rows/runs.json
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const [root, flag, since = ""] = process.argv.slice(2);
if (!root || (flag && flag !== "--since")) {
  console.error("usage: node scripts/rows.mjs <swarmtest-runs-dir> [--since YYYYMMDD]");
  process.exit(1);
}
const json = path => JSON.parse(readFileSync(path, "utf8"));
const rows = [];
for (const campaign of readdirSync(root).sort()) {
  if (campaign.slice(0, 8) < since || !existsSync(join(root, campaign, "campaign.json"))) continue;
  const { config = {}, stop_reason } = json(join(root, campaign, "campaign.json"));
  for (const run of readdirSync(join(root, campaign)).filter(n => n.startsWith("run-")).sort()) {
    const file = join(root, campaign, run, "record.json");
    if (!existsSync(file)) continue;
    const r = json(file), murmur = join(root, campaign, run, "state", "murmur", "result.json");
    rows.push({
      campaign, run, seed: config.seed, campaign_stop: stop_reason ?? null, task: r.task, system: r.system,
      variant: r.variant ?? null, agents: r.agents, repetition: r.repetition, score: r.grade?.score ?? null,
      passed: r.grade?.passed ?? null, status: r.result?.status ?? null, tokens: r.result?.tokens?.total ?? null,
      reason: existsSync(murmur) ? json(murmur).reason : null, minutes: r.process?.elapsed_seconds ? +(r.process.elapsed_seconds / 60).toFixed(1) : null,
    });
  }
}
console.log(JSON.stringify(rows, null, 1));
