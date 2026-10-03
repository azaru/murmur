#!/usr/bin/env node
// File-tool health per run and per arm, for the tool-lever round (round 12): shrinking writes (a write under half the
// tracked length of the existing file, refused or gone through), content lost at the end, edit failures, calls wasted
// between a refused write or failed edit and the next successful change to that path, and append use.
// Lengths are tracked from write, append and edit calls only (bash writes are not seen).
//   node scripts/writes.mjs <swarmtest-campaign-dir>...
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";

const json = path => JSON.parse(readFileSync(path, "utf8"));
const rows = [];
for (const campaign of process.argv.slice(2)) {
  for (const run of readdirSync(campaign).filter(n => n.startsWith("run-")).sort()) {
    const dir = join(campaign, run);
    if (!existsSync(join(dir, "record.json"))) continue;
    const record = json(join(dir, "record.json"));
    const arm = record.system === "pi" ? "pi" : basename(record.variant ?? "murmur", ".json");
    const murmur = join(dir, "state", "murmur");
    const files = existsSync(murmur)
      ? readdirSync(murmur).filter(n => n.endsWith(".messages.json")).map(n => join(murmur, n))
      : [join(dir, "state", "messages.json")].filter(existsSync);
    const row = { run: `${basename(campaign).slice(-8)}/${run.slice(-4)}`, arm, score: record.grade?.score ?? 0,
      tokens: record.result?.tokens?.total ?? 0, writes: 0, shrinkThrough: 0, shrinkRefused: 0, refused: 0,
      appends: 0, edits: 0, editFails: 0, wasted: 0, lost: [] };
    const length = new Map(), peak = new Map();
    for (const file of files) {
      const messages = json(file);
      const results = new Map(messages.filter(m => m.role === "toolResult").map(m => [m.toolCallId, m]));
      const open = new Set(); // paths with a refused write or failed edit not yet followed by a successful change
      for (const message of messages) {
        if (message.role !== "assistant") continue;
        for (const call of (message.content ?? []).filter(c => c.type === "toolCall")) {
          const result = results.get(call.id), args = call.arguments ?? {};
          const text = (result?.content ?? []).map(c => c.text ?? "").join("");
          const failed = !result || result.isError || text.startsWith("Refused");
          const path = typeof args.path === "string" ? args.path.replace(/^\.\//, "") : undefined;
          if (open.size) row.wasted += 1;
          if (!path || !["write", "append", "edit"].includes(call.name)) continue;
          const before = length.get(path) ?? 0;
          let after = before;
          if (call.name === "write") {
            row.writes += 1;
            const shrinking = before > 0 && String(args.content ?? "").length < before / 2;
            if (text.startsWith("Refused")) row.refused += 1;
            if (shrinking) failed ? (row.shrinkRefused += 1) : (row.shrinkThrough += 1);
            if (!failed) after = String(args.content ?? "").length;
          } else if (call.name === "append") {
            row.appends += 1;
            if (!failed) after = before + String(args.content ?? "").length;
          } else {
            row.edits += 1;
            if (failed) row.editFails += 1;
            const edits = args.edits ?? [{ oldText: args.oldText ?? "", newText: args.newText ?? "" }];
            if (!failed) after = before + edits.reduce((sum, e) => sum + String(e.newText ?? "").length - String(e.oldText ?? "").length, 0);
          }
          if (failed) { if (!open.size) row.wasted += 1; open.add(path); continue; }
          open.delete(path);
          length.set(path, after);
          peak.set(path, Math.max(peak.get(path) ?? 0, after));
        }
      }
    }
    for (const [path, max] of peak) {
      const final = join(dir, "workspace", path);
      const size = existsSync(final) ? statSync(final).size : 0;
      if (max >= 2000 && size < max / 2) row.lost.push(`${path} ${size}/${max}`);
    }
    rows.push(row);
  }
}

const pct = (a, b) => (b ? `${((100 * a) / b).toFixed(1)}%` : "-");
console.log("| run | arm | score | tokens | writes | shrinking through | shrinking refused | refused | appends | edits | edit fails | wasted calls | lost at end |");
console.log("|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|");
for (const r of rows) {
  console.log(`| ${r.run} | ${r.arm} | ${r.score.toFixed(3)} | ${(r.tokens / 1e6).toFixed(2)}M | ${r.writes} | ${r.shrinkThrough} | ${r.shrinkRefused} | ${r.refused} | ${r.appends} | ${r.edits} | ${r.editFails} | ${r.wasted} | ${r.lost.join(", ") || "-"} |`);
}
console.log("\n| arm | runs | mean score | mean tokens | shrinking through | shrinking refused | refused | runs with lost content | appends | edit failure rate | wasted calls per run |");
console.log("|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|");
for (const arm of [...new Set(rows.map(r => r.arm))].sort()) {
  const rs = rows.filter(r => r.arm === arm), sum = key => rs.reduce((s, r) => s + r[key], 0);
  console.log(`| ${arm} | ${rs.length} | ${(sum("score") / rs.length).toFixed(3)} | ${(sum("tokens") / rs.length / 1e6).toFixed(2)}M | ${sum("shrinkThrough")} | ${sum("shrinkRefused")} | ${sum("refused")} | ${rs.filter(r => r.lost.length).length} | ${sum("appends")} | ${pct(sum("editFails"), sum("edits"))} | ${(sum("wasted") / rs.length).toFixed(1)} |`);
}
