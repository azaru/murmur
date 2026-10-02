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

## OpenSpec projects after the ~4x scale-up, and their ambiguity review

- **Scaled build** (builder report; scores re-verified by hand): ospec_green has 47 capabilities, 260 scenarios, 167 tasks and a 3,823-line solution; workspace 0.0, solution 1.0 [verified]. ospec_brown has a 3,024-line existing package with 82 tests and 28 specs, plus a change across 37 capabilities (227 change scenarios at weight 0.75, 162 regression scenarios at 0.25, 144 tasks) and a 5,159-line solution; workspace 0.25, solution 1.0 [verified]. `openspec validate --all --strict` passes on both workspaces [verified]. Probe at ~30% of tasks: 0.349 (green), 0.415 (brown).
- **Review (read-only, Sonnet; ~45 scenario/check pairs sampled per task, both reference solutions re-run scenario by scenario):** both GOOD, no contradictions between capabilities found. Fixes requested from the builder before calibration:
  - both: raise the per-scenario grader timeout from 4 s to 20 s and the total from 300 s to 900 s (the reference already needs up to 2.2 s per scenario idle; exceeding the total zeroes every later scenario, ~2–4% at stake);
  - both: make `public_check.py` a spread sample over all capabilities (it covered only the core, which in a volume task invites stopping on green halfway);
  - brown: ~14 sub-checks assert UNKNOWN_PROJECT on operations no sentence covers (~1%); ~5 sub-checks assert messages or formats that exist only in the existing code (~0.25%); two CLI scenarios use the real UTC date (fail only across a Sunday-to-Monday UTC midnight); the activity-log wording says "every mutating operation" while the checks expect only listed ones; the order of the done-gates (required fields, checklist, subtasks) is unstated;
  - green: how `create_order` prices registered customers, and whether an idempotent no-op appends an audit entry, are unstated (ungraded today).
- **Doubts left by the review:** brown's regression checks derive from the existing implementation, not all 162 were audited against the existing specs; a spec-faithful alternative implementation was not tested.
