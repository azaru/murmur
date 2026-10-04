# Round 15, stage C (equal spend on volume): transcript and trace analysis

> **Checked by hand by the main session (2026-10-04):**
> - ✓ No assistant text or thinking in C1T's transcripts (102de6ff green, cfaad405 brown) mentions tokens, budget, minutes left or the timeout. The trailer is present from msg 3 (`[24.0M tokens left in the budget]`), and neither run calls `done`.
> - ✓ No post in the four STT runs mentions tokens or the budget.
> - ✓ C1T green had spent about 8.5M at 25 minutes (from `usage` events), against C1's 11.0M when it called `done` at 24.8 minutes. The report says 8.2M.
> - Everything else is model output and was not re-checked.

**Model output.** Written by a Claude subagent on 2026-10-04, read-only, from `events.jsonl`, `<agent>.messages.json`, `record.json` (`grade.checks`) and final workspaces under `../swarmtest/runs/<campaign>/run-0001/` (state under `state/murmur/`). Counts come from short ad-hoc scripts (not saved). Quoted passages are tool-result trailers; the model's visible reasoning is only terse summaries, so "never mentioned" is weak evidence. The 7th stage C run (20261004T084418Z-f23dfd8d, C1T green) was cut by the model quota at 26 min and is excluded.

| campaign | task | arm | score | tokens | min | end |
|---|---|---|---|---|---|---|
| 20261004T072757Z-102de6ff | green | C1T (one agent, clock, tokens line) | 0.985 | 24.1M | 43.4 | cap |
| 20261004T081156Z-cfaad405 | brown | C1T | 0.919 | 24.2M | 31.2 | cap |
| 20261004T072759Z-b3cf2574 | green | STT (12 agents, staggered, board, clock, tokens line) | 0.985 | 24.0M | 7.8 | cap |
| 20261004T074445Z-4650e8ee | green | STT | 0.925 | 24.0M | 7.7 | cap |
| 20261004T073624Z-92e01575 | brown | STT | 0.941 | 24.1M | 7.4 | cap |
| 20261004T075304Z-f4a6dd58 | brown | STT | 0.986 | 24.0M | 7.9 | cap |

## Q1. Why C1T kept going when C1 stopped

Facts (wren, `wren.messages.json`):
- **C1T never mentioned the tokens or the clock.** No assistant text or reasoning summary in 102de6ff (399 messages) contains "budget", "tokens", "minutes left", "timeout" or "deadline"; same for C1 702c5333 and brown C1T cfaad405. Every tool result in C1T ended with both lines (213 "tokens left" trailers), e.g. msg 3 "[59.9 minutes left before the timeout] [24.0M tokens left in the budget]" and the last result (msg 398) "[16.6 minutes left before the timeout] [0.0M tokens left in the budget]".
- **C1 stopped on an incomplete job.** 702c5333 called `done` at msg 289, 24.8 min, 11.0M used, 5.2 min left, with 72 of 167 tasks ticked; its final text (msg 291): "The change is incomplete: multiple specified capabilities remain unimplemented".
- **C1T at the same moments.** At 24.7 min it had used 8.2M, had 35 min left and had ticked about 120 tasks (sum of "replaced N block(s)" in `tasks.md` edits: 120 at 25.6 min). It crossed 11M at about 27.5 min (msg ~245) with 32.5 min left. It ticked all 167 tasks by 37.4 min (msg 355, 3.9M left; msg 368 `rg -c '^- \[x\]'` printed 167, 2.7M left). It then spent the last ~5 min on audit fixes (msgs 370-396: CLI write-off parser, variant validation, lot expiry) and never called `done`; the cap aborted it (msg 399, "This operation was aborted").
- Pace: 183 vs 140 assistant turns; 0.55M tokens/min vs 0.44M/min.

Interpretation. C1 was out of time (stage B: all `done` calls had 3-5 min left); with 60 min C1T simply had the time to finish the checklist. The simplest reading is the clock, not the tokens line. After finishing, C1T kept auditing instead of stopping; whether the tokens line (or just habit) kept it going cannot be told, because it never referred to either. **Not determinable** between line and clock for the post-completion stretch; the earlier difference (72 vs 120 tasks at ~25 min) is run-to-run pace, not a stop decision. There is no 30-minute C1T or 60-minute C1 control.
- Brown C1T (cfaad405) never ticked a single task (0 of 145 `[x]`; only 2 tool calls touch `tasks.md`, both reads), although the task asks for ticking. Score unaffected.

## Q2. STT: tokens line and the cap

- **Zero mentions.** In the four STT runs, 0 posts and 0 assistant text/reasoning blocks mention tokens left, budget or the cap (regex hits in posts were false positives such as "daily cap" in a time-tracking spec: brown 92e01575 robin @259 s, f4a6dd58 plover @233 s, swift @266 s). Trailers are present ("[0.4M tokens left in the budget shared by all agents]", b3cf2574 wren).
- **No visible behaviour change near the cap.** Last 90 s of each run: still 12-59 bash and 12-31 edits and 13-34 posts (e.g. b3cf2574: 47 bash, 22 edit, 29 post; last posts at 460-467 s are still delegating CLI hooks). No post says "wrap up", "stop" or "integrate now" because of budget. `done` calls: kite (b3cf2574, 385 s), robin/linnet/swift (f4a6dd58, 328/417/443 s), each citing completed own sections, not the budget. Runs end at 7.4-7.9 min exactly as in stage B (7.0-7.3 min); the cap still lands mid-work.
- **Unwired/unwritten modules (final workspaces, python check of Stockroom MRO and `tasks.md` ticks).** green b3cf2574: all 19 modules in the MRO, 0 zero capabilities, 20 tasks open. green 4650e8ee: `install_mixins` (dynamic) wires the code, and `events` and `access-control` were simply never written (no `subscribe`/`create_policy`; 42 tasks open; the two zero capabilities). Stage B ST: f7a15bdf had four modules written but not inherited (`LandedCostOps`, `PackingOps`, `PickListsOps`, `ShipmentsOps`; 8 zero capabilities); 4b350f75 had `ABCAnalysisMixin` unwired (zero: abc-analysis). So unwired modules fell from 4+1 in ST to 0 in STT green, but that is two runs against two, and one STT run shows the opposite failure (unwritten). Brown wiring was not checked; brown STT zero capabilities: none in either run (grade `checks`).
- Posts note late integration problems in the same style as stage B (green-STT1 post @460 s "Duplicate `_ensure_warehouse_state()`... remove one"; STT2 @432 s crane: CLI `order-create` broken).

## Q3. Where the strong runs lost the last points (`record.json`, `grade.checks`)

Green (260 weight):
- C1T 102de6ff: 4.0 weight lost over 10 failing checks, zero zero-capabilities: `snapshots/snapshot-command-line` 1.0, `stocktake/finishing-edge-cases` 0.8, `bundles/defining-bundles` 0.4, plus promotions/supplier-catalog/shipping/report-formats/landed-cost CLI or edge cases (0.2-0.3 each).
- STT b3cf2574: 4.0 over 13 checks: orders 1.5 (`cancel-releases`, `confirm-reserves-atomically`, `partial-shipments`), `backorders/cancel-a-backorder` 0.7, small bits in stock, reservations (`list_reservations() got an unexpected keyword argument 'ref'`).
- STT 4650e8ee: 19.5 lost; `access-control` 6.0 and `events` 5.0 unwritten, snapshots 1.0, reports, report-formats, landed-cost 1.0 each.
- Shared failures: command-line checks of tail capabilities (`report-formats/render-command-line`, `access-control/...command-line`, `landed-cost/...command-line`: usage-error argparse mismatches) and `shipping/register-shipping-methods`, `reservations/reserve-reduces-availability` in two of three runs. The strong runs lose to interface mismatches and CLI edges, not to missing capabilities.

Brown (weights sum to 1; points = percent of score):
- C1T cfaad405: 8.1 points lost; `rule-audit` 3.3 and `field-search` 3.0 are zero capabilities (checks fail: e.g. `rule-audit/log-entries`, `field-search/compare-numbers-and-dates`), rest under 0.4 each.
- STT 92e01575: 5.9; `automation-rules` 2.6, `rule-audit` 2.6 (e.g. `AttributeError: 'Board' object has no attribute 'rule_log'` appears in 2 runs), `recurrence` 0.35.
- STT f4a6dd58: 1.4; eight small checks (`dependencies/ready-tasks`, `saved-filters/shared-filter-commands`, `sprints/*`, `task-import/label-column`, ...).
- Checks failing in all three brown runs: `timesheets/submission-validation` ("expected INVALID_WEEK, got INVALID_DATE": a spec-reading ambiguity worth checking by hand). In two of three: `sprints/close-carry-over` and `sprints/membership` (`TypeError: string indices must be integers, not 'str'`), `automation-rules/loop-protection`.

## Q4. murmur friction

- No `wake` events in any of the six runs.
- `write_refused` (whole-file write looked like a fragment): C1T green wren @156 s (`__init__.py`), C1T brown wren @1053 s (`ext_reporting.py`), brown STT f4a6dd58 heron @238 s (`ext_milestones.py`). None in the other three STT runs (stage B ST had 3 in f7a15bdf).
- Tool errors are ordinary (failing test commands, stale edit text): bash `isError` 5-59 per run, edit 5-21. One timeout/abort-string per run is the final cap abort. No bash timeout pattern found beyond that.
- Late `tasks.md` hygiene: green 4650e8ee swift @455 s notes multiple ticked lines whose replacement dropped a closing backtick (shared-file edit hazard).

## Open doubts

- Q1 attribution between tokens line and 60-min clock is open; no control varies one factor alone.
- n=1-2 per cell; STT scores 0.925-0.985 and 0.941-0.986 overlap C1T 0.985/0.919.
- Reasoning blocks are summaries, so unmentioned lines may still have influenced behaviour.
- Brown module wiring and brown C1 (30 min) baselines were not checked/run.
- Ticks counted from `edit` results ("replaced N block(s)"), which can overcount re-edits; final counts (167/167) are from `tasks.md`.
