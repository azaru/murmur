# Round 8: building the expanded panel (2026-10-02)

Three builders and one reviewer, all **model output** (Claude subagents: builders on the session model, reviewer on Sonnet), condensed here without changing the numbers. **[verified]** marks what the main session re-checked by hand. The tasks live in `../swarmtest/staging/` (not in `tasks/`); nothing was committed in swarmtest.

## Panel D candidates (difficulty-limited)

Design brief: a modest agent attempt should land around 0.35–0.5 and a strong one 0.85+, rewarding quality beyond a passing public check, which is where round 7 found the clock agent stops.

| task | what changed or what it is | stub | solution | probe ladder |
|---|---|---:|---:|---|
| opt_shop2 | 45×10 to 85×15 job shop (v1: 10–30 jobs), Giffler–Thompson WSPT baseline, focused SA reference | 0.0 [verified] | 0.743 [verified] | greedy 0.06, simple SA 0.38 |
| opt_roster2 | 60–160 employees (v1: 12–45), strong specified greedy baseline | 0.0 [verified] | 0.920 [verified] | greedy 0.00, simple SA 0.62 |
| opt_packing2 | 1,200–3,000 items, 6 bin types (v1: 200–500, 3), FFD baseline | 0.0 [verified] | 0.674 [verified] | greedy 0.14, simple SA 0.62 |
| plan_timetable | exam timetabling, 150–700 exams, hard constraints + slot, waste, lab, lateness and proximity costs | 0.0 [verified] | 0.776 [verified] | modest 0.16, generic SA 0.32, efficient SA 0.57 |
| pred_demand | daily store×item demand, stdlib model, RMSLE scored between a per-store mean and the oracle noise floor | 0.0 [verified] | 0.968 [verified] | store×item mean 0.19, log-linear 0.48, with interactions 0.58 |

- **best_known:** the opt tasks use the reference solver run for ~100x its contract budget, 2–3 seeds; plan_timetable takes the minimum over 3 solver runs up to 80M iterations (seed spread 1–2%, not fully converged). pred_demand uses the exact oracle error given the true mean.
- **Builders' saturation doubts:** roster2 and packing2 (a simple SA already scores 0.62; packing2's headroom is mostly implementation speed); pred_demand (a strong agent could reach 0.7–0.85). Load sensitivity: the shop2, packing2 and plan_timetable references take 4–7 s of the 10 s limit on an idle machine, 2–3x slower under heavy load.
- **Grading:** deterministic across two runs; 4–24 s per task; swarmtest unit tests keep exactly the 4 known failures (builder-reported).
- **Infrastructure note:** the builders initially ran multiprocessing pools over all 12 cores at once (load 80+). They were reniced and capped at 3 workers; `AGENTS.md` now carries a CPU cap for delegated offline work.

## Ambiguity review (read-only, Sonnet)

Verdicts: opt_shop2, opt_roster2, plan_timetable and pred_demand OK; opt_packing2 had one real contract error. All public checks embed the grader's model and print the same score formula; `workspace/` reveals no hidden seeds or best-known values; pred_demand's `visible_truth.csv` covers only the visible dataset (seed 7), not a leak.

Clarifications applied to `workspace/PROBLEM.md` (one sentence each):
- **opt_packing2 (real error) [verified]:** the contract said hidden instances have 400–1,000 items; the generator makes 1,200–3,000. Now: "1200 to 3000 items each, against 600 in the visible instance; every item also fits alone in the largest type".
- **All five:** "Hidden instances may be graded concurrently on a shared machine, so stop on wall-clock time with a safety margin." (graders run instances in parallel threads).
- **opt_roster2:** no history before day 0.
- **plan_timetable:** `a < b` also holds in `precedence`, so the graph is acyclic.
- **pred_demand:** scientific notation is accepted in `pred`.

Not changed (judged derivable or harmless): plan_timetable's back-to-back definition, pred_demand's category structure (visible in the data), the unchecked determinism sentence.

## OpenSpec projects (volume regime), first build and pilot

- **ospec_green** (stockroom: inventory and orders): 12 capabilities, 58 scenarios, 34 tasks, solution ~1,000 lines. Workspace 0.0, solution 1.0, `openspec validate --strict` passes [all verified].
- **ospec_brown** (taskboard: add sprint planning to an existing 799-line tracker): 13 capabilities, 50 new or changed scenarios plus 39 regression scenarios (weights 0.75 / 0.25), 38 tasks. Workspace 0.25, solution 1.0, strict validation passes [all verified].
- **Pilot** (one c4g-clock run each, 20 min, 3M; campaigns `20261002T100950Z-7e60e3ee` and `20261002T100950Z-9376b32b`): green 0.970 in 12.3 min with 1.56M tokens (done, every task ticked); brown 0.998 in 9.3 min, then the 3M cap. Both saturate [verified from the records], so both are being scaled up about 4x.
