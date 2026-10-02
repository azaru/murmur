# Round 8 (criba 8): per-agent traces, panel D calibration

Generated with `node scripts/traces.mjs <campaign-dir>...` over the 36 campaigns with seed 20261030 (ids in the campaign registry of `plan.md`). One row per agent transcript; "green at" and "after green" count tool calls; the stop reasons follow the table.

| run | task | arm | score | tokens | min | end | agent | calls | board % | checks | green at | after green | last check | overwrites | nudges |
|---|---|---|---:|---:|---:|---|---|---:|---:|---:|---:|---:|---|---:|---:|
| c227adf3/0001 | opt_shop2 | murmur[c4g-clock]/n=1 | 0.263 | 0.11M | 1.4 | all_done | wren | 15 | 27 | 4 | 12 | 3 | green | 0 | 0 |
| a7e1fe67/0001 | opt_shop2 | pi/n=1 | 0.288 | 0.03M | 0.8 | succeeded | pi | 6 | 0 | 1 | 6 | 0 | green | 0 | 0 |
| acac7b99/0001 | opt_packing2 | murmur[c4g-clock]/n=1 | 0.176 | 0.30M | 4.3 | all_done | wren | 31 | 13 | 6 | 14 | 17 | green | 0 | 0 |
| 281f4353/0001 | opt_packing2 | pi/n=1 | 0.000 | 0.06M | 1.2 | failed | pi | 15 | 0 | 3 | - | - | red | 0 | 0 |
| 5404be55/0001 | opt_roster2 | murmur[c4g-clock]/n=1 | 0.019 | 0.12M | 2.2 | quiescent | wren | 16 | 13 | 3 | 14 | 2 | green | 0 | 0 |
| 55b77478/0001 | opt_roster2 | pi/n=1 | 0.347 | 0.04M | 0.8 | succeeded | pi | 8 | 0 | 1 | 8 | 0 | green | 0 | 0 |
| 40f02ff1/0001 | plan_timetable | murmur[c4g-clock]/n=1 | 0.191 | 0.09M | 1.2 | all_done | wren | 15 | 20 | 3 | 11 | 4 | green | 0 | 0 |
| c23ba3ef/0001 | plan_timetable | pi/n=1 | 0.000 | 0.17M | 1.3 | failed | pi | 16 | 0 | 5 | - | - | red | 0 | 0 |
| f09a369e/0001 | pred_demand | murmur[c4g-clock]/n=1 | 0.409 | 0.56M | 7.7 | all_done | wren | 48 | 6 | 7 | 12 | 36 | green | 0 | 0 |
| 4a5b11f6/0001 | pred_demand | pi/n=1 | 0.666 | 0.03M | 0.8 | succeeded | pi | 8 | 0 | 1 | 8 | 0 | green | 0 | 0 |
| 22c5fab2/0001 | opt_routing | murmur[c4g-clock]/n=1 | 0.705 | 0.06M | 1.2 | all_done | wren | 14 | 21 | 2 | 10 | 4 | green | 0 | 0 |
| 4fd5f264/0001 | opt_routing | pi/n=1 | 0.627 | 0.05M | 0.8 | succeeded | pi | 9 | 0 | 2 | 7 | 2 | green | 0 | 0 |
| 000396c0/0001 | opt_shop2 | murmur[c4g-clock]/n=1 | 0.103 | 0.15M | 4.0 | quiescent | wren | 18 | 17 | 5 | 14 | 4 | green | 0 | 0 |
| 524af8ef/0001 | opt_shop2 | pi/n=1 | 0.321 | 0.03M | 0.9 | succeeded | pi | 8 | 0 | 1 | 8 | 0 | green | 0 | 0 |
| 66fabcae/0001 | opt_packing2 | murmur[c4g-clock]/n=1 | 0.378 | 0.24M | 4.9 | all_done | wren | 29 | 10 | 4 | 14 | 15 | green | 0 | 0 |
| 977cf0f3/0001 | opt_packing2 | pi/n=1 | 0.147 | 0.03M | 1.3 | succeeded | pi | 8 | 0 | 1 | 8 | 0 | green | 0 | 0 |
| fc319a45/0001 | opt_roster2 | murmur[c4g-clock]/n=1 | 0.687 | 0.09M | 2.3 | all_done | wren | 15 | 40 | 2 | 8 | 7 | green | 0 | 0 |
| 365ac436/0001 | opt_roster2 | pi/n=1 | 0.116 | 0.09M | 1.3 | succeeded | pi | 13 | 0 | 4 | 13 | 0 | green | 0 | 0 |
| de44c8c7/0001 | plan_timetable | murmur[c4g-clock]/n=1 | 0.277 | 0.28M | 3.2 | all_done | wren | 22 | 14 | 5 | 10 | 12 | green | 0 | 0 |
| 5fe2c563/0001 | plan_timetable | pi/n=1 | 0.180 | 0.08M | 1.1 | succeeded | pi | 10 | 0 | 2 | 10 | 0 | green | 0 | 0 |
| 0e5047ed/0001 | pred_demand | murmur[c4g-clock]/n=1 | 0.742 | 0.80M | 11.3 | all_done | wren | 48 | 6 | 10 | 9 | 39 | green | 0 | 0 |
| 8e120919/0001 | pred_demand | pi/n=1 | 0.551 | 0.03M | 0.8 | succeeded | pi | 11 | 0 | 1 | 11 | 0 | green | 0 | 0 |
| 48fc5569/0001 | opt_routing | murmur[c4g-clock]/n=1 | 0.438 | 0.46M | 8.5 | all_done | wren | 38 | 11 | 9 | 14 | 24 | green | 0 | 0 |
| 407d803a/0001 | opt_routing | pi/n=1 | 0.219 | 0.02M | 1.0 | succeeded | pi | 6 | 0 | 1 | 6 | 0 | green | 0 | 0 |
| b3560056/0001 | opt_shop2 | murmur[c4g-clock]/n=1 | 0.159 | 0.08M | 1.9 | all_done | wren | 16 | 25 | 2 | 12 | 4 | green | 0 | 0 |
| 7805341b/0001 | opt_shop2 | pi/n=1 | 0.417 | 0.04M | 1.0 | succeeded | pi | 7 | 0 | 1 | 7 | 0 | green | 0 | 0 |
| e864c700/0001 | opt_packing2 | murmur[c4g-clock]/n=1 | 0.091 | 0.08M | 1.7 | quiescent | wren | 16 | 13 | 4 | 10 | 6 | green | 0 | 0 |
| e9d1e5b0/0001 | opt_packing2 | pi/n=1 | 0.124 | 0.04M | 1.1 | succeeded | pi | 10 | 0 | 2 | 10 | 0 | green | 0 | 0 |
| f298f78b/0001 | opt_roster2 | murmur[c4g-clock]/n=1 | 0.503 | 0.39M | 8.0 | all_done | wren | 32 | 9 | 10 | 9 | 23 | green | 0 | 0 |
| e6c46866/0001 | opt_roster2 | pi/n=1 | 0.393 | 0.03M | 0.8 | succeeded | pi | 6 | 0 | 1 | 6 | 0 | green | 0 | 0 |
| bd0ed196/0001 | plan_timetable | murmur[c4g-clock]/n=1 | 0.187 | 0.09M | 1.7 | all_done | wren | 15 | 20 | 3 | 9 | 6 | green | 0 | 0 |
| 0f8079f9/0001 | plan_timetable | pi/n=1 | 0.179 | 0.05M | 1.0 | succeeded | pi | 9 | 0 | 3 | 9 | 0 | green | 0 | 0 |
| 8de20962/0001 | pred_demand | murmur[c4g-clock]/n=1 | 0.747 | 1.25M | 9.7 | all_done | wren | 66 | 5 | 10 | 11 | 55 | green | 0 | 0 |
| 34ebaeae/0001 | pred_demand | pi/n=1 | 0.519 | 0.03M | 0.7 | succeeded | pi | 8 | 0 | 1 | 8 | 0 | green | 0 | 0 |
| 3ce36dac/0001 | opt_routing | murmur[c4g-clock]/n=1 | 0.718 | 0.41M | 9.0 | quiescent | wren | 35 | 6 | 8 | 9 | 26 | green | 0 | 0 |
| b1ddf99d/0001 | opt_routing | pi/n=1 | 0.769 | 0.03M | 0.7 | succeeded | pi | 7 | 0 | 1 | 7 | 0 | green | 0 | 0 |

Why each agent stopped:
- c227adf3/0001 murmur[c4g-clock]/n=1 wren: done: Implemented deterministic single-file solver with blocked-interval-aware earliest-gap placement and diversified weighted-tardiness dispatch search. `npm run test` passes (visible cost 13157 vs baselin
- a7e1fe67/0001 pi/n=1 pi: last text: Implemented `solve.py` and ran `npm run test`. The visible instance passed with cost **13,781** (baseline: 14,980; score: 0.351).
- acac7b99/0001 murmur[c4g-clock]/n=1 wren: done: Implemented the standalone deterministic heuristic solver and verified the required acceptance check passes. It scores 0.825 on the visible instance and finished a 3000-item synthetic run within the 1
- 281f4353/0001 pi/n=1 pi: last text: Implemented `solve.py`, but `npm run test` currently fails: the solution is feasible, but its objective (29102) does not beat the baseline (26811).
- 5404be55/0001 murmur[c4g-clock]/n=1 wren: last text: Implemented `solve.py` with a feasible baseline roster and deterministic multi-start optimization. `npm run test` passes; the visible instance scores 0.248.
- 55b77478/0001 pi/n=1 pi: last text: Implemented `solve.py` and ran `npm run test`. The visible instance passed with objective 1092 versus the baseline 1297.
- 40f02ff1/0001 murmur[c4g-clock]/n=1 wren: done: Implemented deterministic greedy construction and constraint-aware coordinate descent in plan.py. Verified compilation and `npm run test` passes; visible cost 2769 vs baseline 3098.
- c23ba3ef/0001 pi/n=1 pi: last text: Implemented `plan.py`, but `npm run test` still fails: the generated plan is feasible, but its cost (3098) matches the baseline, so it does not meet the checker’s requirement to beat it.
- f09a369e/0001 murmur[c4g-clock]/n=1 wren: done: Implemented deterministic standard-library demand regression in predict.py, including missing-value handling and future-known price/weather/calendar features. Verified with `npm run test` (passes, vis
- 4a5b11f6/0001 pi/n=1 pi: last text: Implemented `predict.py` with a regularized log-demand regression using store, item, calendar, promotion, price, and temperature features. `npm run test` passes; visible RMSLE is 0.5790 (baseline 0.74
- 22c5fab2/0001 murmur[c4g-clock]/n=1 wren: done: Implemented deterministic feasible route construction with cheapest feasible insertions and local relocate, swap, and 2-opt improvement in solve.py. Verified with py_compile and npm run test; acceptan
- 4fd5f264/0001 pi/n=1 pi: last text: Implemented `solve.py` with feasible route construction and local-search improvements. `npm run test` passes; the visible-instance cost is 3123 versus a baseline of 4054.
- 000396c0/0001 murmur[c4g-clock]/n=1 wren: last text: Implemented `solve.py` with a deterministic, randomized scheduling heuristic and verified it passes `npm run test`. The visible instance cost is 14629, down from the baseline 14980.
- 524af8ef/0001 pi/n=1 pi: last text: Implemented `solve.py` with deterministic dispatch-based scheduling and machine-gap insertion. `npm run test` passes; the visible instance cost is 13,906 versus the 14,980 baseline.
- 66fabcae/0001 murmur[c4g-clock]/n=1 wren: done: Implemented deterministic, cost-aware multi-dimensional bin packing in solve.py with conflict-safe greedy construction, multiple orderings, relocation, and bin consolidation. npm run test passes; also
- 977cf0f3/0001 pi/n=1 pi: last text: Implemented `solve.py` with a deterministic, conflict-aware greedy packing heuristic and four placement-order variants. `npm run test` passes: cost 25,941 versus baseline 26,811.
- fc319a45/0001 murmur[c4g-clock]/n=1 wren: done: Implemented deterministic feasible roster construction with simulated-annealing local improvements in solve.py. `npm run test` passes (visible objective 1005 vs baseline 1297, score 0.732), and isolat
- 365ac436/0001 pi/n=1 pi: last text: Implemented `solve.py` and verified it with `npm run test`. The roster is feasible and beats the visible baseline: objective 1190 versus 1297.
- de44c8c7/0001 murmur[c4g-clock]/n=1 wren: done: Implemented the standard-library single-file planner with feasible construction and iterated local improvement. `npm run test` passes; the visible plan cost is 2464 versus baseline 3098.
- 5fe2c563/0001 pi/n=1 pi: last text: Implemented `plan.py` and verified it with `npm run test`. The visible instance passes with cost 2727 versus the baseline 3098.
- 0e5047ed/0001 murmur[c4g-clock]/n=1 wren: done: Implemented the single-file standard-library forecaster in predict.py. Verified with `npm run test` (passes; visible RMSLE 0.5491 versus baseline 0.7406) and `python3 -m py_compile predict.py`.
- 8e120919/0001 pi/n=1 pi: last text: Implemented `predict.py` using a regularized log-demand regression with store-item, calendar, promotion, price, and temperature features. `npm run test` passes; visible score: **0.419**.
- 48fc5569/0001 murmur[c4g-clock]/n=1 wren: done: Implemented deterministic, standard-library CVRP-TW routing in solve.py with savings-based construction and feasibility-checked local search. `npm run test` passes (visible objective 2930 vs baseline 
- 407d803a/0001 pi/n=1 pi: last text: Implemented `solve.py` with feasible route merging and local improvements. `npm run test` passes: cost 3093 vs. baseline 4054 (score 0.655).
- b3560056/0001 murmur[c4g-clock]/n=1 wren: done: Implemented deterministic priority-list search with simulated annealing and earliest-gap placement in solve.py. `npm run test` passes; the visible schedule is feasible and improves cost from 14980 to 
- 7805341b/0001 pi/n=1 pi: last text: Implemented `solve.py`. `npm run test` passes; the visible instance cost is 13,106 (baseline 14,980), scoring 0.549.
- e864c700/0001 murmur[c4g-clock]/n=1 wren: last text: Implemented `solve.py` with deterministic multi-start packing and cost-reducing item relocation. `npm run test` passes; the visible objective is 25,041 versus the 26,811 baseline.
- e9d1e5b0/0001 pi/n=1 pi: last text: Implemented `solve.py` with a deterministic multi-start greedy packing heuristic. `npm run test` passes; the visible instance cost is 26,262 versus the 26,811 baseline (score 0.086).
- f298f78b/0001 murmur[c4g-clock]/n=1 wren: done: Implemented deterministic standard-library roster construction with fixed-budget randomized greedy search, rotation-safe shift polishing, and baseline fallback. Added contract feasibility/determinism 
- e6c46866/0001 pi/n=1 pi: last text: Implemented `solve.py` with a deterministic constructive heuristic and multiple tie-break variants. `npm run test` passes: cost 1096 vs. baseline 1297; visible score 0.504.
- bd0ed196/0001 murmur[c4g-clock]/n=1 wren: done: Implemented deterministic greedy construction with exact-feasibility relocation local search in plan.py. Verified syntax and `npm run test` passes (cost 2769 vs baseline 3098).
- 0f8079f9/0001 pi/n=1 pi: last text: Implemented `plan.py` with a deterministic greedy schedule and local-improvement search. `npm run test` passes; the visible instance cost is 2760 versus the 3098 baseline (score 0.370).
- 8de20962/0001 murmur[c4g-clock]/n=1 wren: done: Implemented the standard-library ridge-regression demand forecaster in predict.py, added contract tests, and verified both `python3 -m unittest discover -s swarm_tests -v` and the required `npm run te
- 34ebaeae/0001 pi/n=1 pi: last text: Implemented `predict.py` using a regularized log-demand regression with store-item effects and calendar, promotion, price, and weather features. `npm run test` passes; visible RMSLE is **0.6249** vers
- 3ce36dac/0001 murmur[c4g-clock]/n=1 wren: last text: Implemented `solve.py` with feasible route construction and deterministic merge and local-search improvements. `npm run test` passes; the visible instance scores 0.796.
- b1ddf99d/0001 pi/n=1 pi: last text: Implemented `solve.py` with deterministic route construction and local improvements. `npm run test` passes; the visible instance cost is 3270 versus the baseline 4054.
