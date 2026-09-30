#!/usr/bin/env node
// Paired comparison of two arms (B - A) across one or more swarmtest campaigns.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const option = name => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : undefined; };
const [armA, armB] = [option("--a"), option("--b")];
if (!armA || !armB || !args.length) {
  console.error("usage: node scripts/arms.mjs <campaign-dir>... --a <arm> --b <arm>\n  arm labels as in report.md, e.g. murmur/n=3 or murmur[profiles/no-messaging.json]/n=3");
  process.exit(1);
}

const label = r => `${r.system}${r.variant ? `[${r.variant}]` : ""}/n=${r.agents}`;
const grade = r => ({ ...r.grade, ...r.offline_regrade?.grade, ...(r.review && { score: r.review.score, passed: r.review.passed }) });
const runs = args.flatMap(dir => readdirSync(dir)
  .filter(name => name.startsWith("run-") && existsSync(join(dir, name, "record.json")))
  .map(name => ({ campaign: dir, ...JSON.parse(readFileSync(join(dir, name, "record.json"), "utf8")) })));

// Pair runs of the same campaign, task and repetition.
const pairs = new Map();
for (const run of runs) {
  const side = label(run) === armA ? "a" : label(run) === armB ? "b" : undefined;
  if (!side) continue;
  const key = `${run.campaign}|${run.task}|${run.repetition}`;
  pairs.set(key, { ...pairs.get(key), task: run.task, [side]: run });
}

const perTask = new Map();
const totals = { pairs: 0, passA: 0, passB: 0, tokA: 0, tokB: 0, secA: 0, secB: 0, unknownTokens: 0, skipped: 0 };
for (const { task, a, b } of pairs.values()) {
  const [ga, gb] = [a && grade(a), b && grade(b)];
  if (ga?.score == null || gb?.score == null) { totals.skipped += 1; continue; }
  const entry = perTask.get(task) ?? { a: [], b: [] };
  entry.a.push(ga.score);
  entry.b.push(gb.score);
  perTask.set(task, entry);
  totals.pairs += 1;
  totals.passA += ga.passed ? 1 : 0;
  totals.passB += gb.passed ? 1 : 0;
  const [ta, tb] = [a.result?.tokens?.total, b.result?.tokens?.total];
  if (ta == null || tb == null) totals.unknownTokens += 1;
  else { totals.tokA += ta; totals.tokB += tb; }
  totals.secA += a.process?.elapsed_seconds ?? 0;
  totals.secB += b.process?.elapsed_seconds ?? 0;
}

const mean = xs => xs.reduce((sum, x) => sum + x, 0) / xs.length;
const rows = [...perTask].map(([task, { a, b }]) => ({ task, n: a.length, a: mean(a), b: mean(b), delta: mean(b) - mean(a) }))
  .sort((x, y) => x.task.localeCompare(y.task));
if (!rows.length) {
  console.error(`no paired runs for ${armA} vs ${armB} (skipped ${totals.skipped})`);
  process.exit(1);
}

// Seeded bootstrap over tasks (mulberry32), 90% interval of the mean per-task delta.
let seed = 1;
const random = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const deltas = rows.map(r => r.delta);
const boot = Array.from({ length: 5000 }, () => mean(deltas.map(() => deltas[Math.floor(random() * deltas.length)])))
  .sort((x, y) => x - y);
const fmt = x => (x >= 0 ? "+" : "") + x.toFixed(3);

console.log(`A = ${armA}\nB = ${armB}\n`);
console.log("| task | pairs | A | B | B-A |\n|---|---:|---:|---:|---:|");
for (const r of rows) console.log(`| ${r.task} | ${r.n} | ${r.a.toFixed(3)} | ${r.b.toFixed(3)} | ${fmt(r.delta)} |`);
const wins = deltas.filter(d => d > 0).length, losses = deltas.filter(d => d < 0).length;
console.log(`
tasks ${rows.length}, pairs ${totals.pairs}${totals.skipped ? ` (skipped ${totals.skipped} without both scores)` : ""}
mean delta ${fmt(mean(deltas))}, 90% bootstrap CI [${fmt(boot[249])}, ${fmt(boot[4749])}]
B wins ${wins}, loses ${losses}, ties ${rows.length - wins - losses} (per-task means)
passed: A ${totals.passA}/${totals.pairs}, B ${totals.passB}/${totals.pairs}
tokens B/A ${totals.tokA ? (totals.tokB / totals.tokA).toFixed(2) : "n/a"}${totals.unknownTokens ? ` (${totals.unknownTokens} pairs with unknown tokens excluded)` : ""}, time B/A ${totals.secA ? (totals.secB / totals.secA).toFixed(2) : "n/a"}`);
