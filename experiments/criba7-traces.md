# Round 7 (criba 7): per-agent traces, calibration against c4g-clock

Generated with `node scripts/traces.mjs <campaign-dir>...` over the 6 campaigns with seed 20261025 (ids in the campaign registry of `plan.md`). One row per agent transcript; "green at" and "after green" count tool calls; the stop reasons follow the table.

| run | task | arm | score | tokens | min | end | agent | calls | board % | checks | green at | after green | last check | overwrites | nudges |
|---|---|---|---:|---:|---:|---|---|---:|---:|---:|---:|---:|---|---:|---:|
| d6c74849/0001 | constrained_planning_hard | murmur[c4g-clock]/n=1 | 0.569 | 1.76M | 14.1 | all_done | wren | 80 | 5 | 16 | 31 | 49 | green | 0 | 0 |
| fec33dc7/0001 | feature_implementation_hard | murmur[c4g-clock]/n=1 | 1.000 | 0.76M | 6.1 | all_done | wren | 47 | 6 | 6 | 26 | 21 | green | 0 | 0 |
| 29301c75/0001 | constrained_planning_hard | murmur[c4g-clock]/n=1 | 0.425 | 0.31M | 3.9 | all_done | wren | 26 | 12 | 5 | 14 | 12 | green | 0 | 0 |
| 16d587ca/0001 | feature_implementation_hard | murmur[c4g-clock]/n=1 | 0.916 | 0.54M | 5.7 | all_done | wren | 36 | 8 | 5 | 23 | 13 | green | 0 | 0 |
| 8bf62357/0001 | constrained_planning_hard | murmur[c4g-clock]/n=1 | 0.429 | 0.43M | 8.9 | all_done | wren | 32 | 9 | 8 | 24 | 8 | green | 0 | 0 |
| 65ab2cc7/0001 | feature_implementation_hard | murmur[c4g-clock]/n=1 | 1.000 | 0.47M | 5.9 | all_done | wren | 36 | 14 | 4 | 20 | 16 | green | 0 | 0 |

Why each agent stopped:
- d6c74849/0001 murmur[c4g-clock]/n=1 wren: done: Implemented the single-file planner with constraint-aware candidate generation, backtracking, objective-guided ordering, and a fallback plan. Verified with `npm run test` (passes).
- fec33dc7/0001 murmur[c4g-clock]/n=1 wren: done: Implemented the inventory utilities, service commands/reports, idempotency, and validating ledger replay. The acceptance command `npm run test`, the added `swarm_tests` suite, and an extended transfer
- 29301c75/0001 murmur[c4g-clock]/n=1 wren: done: Implemented planner.py with hard-constraint-aware search and objective-guided candidate ordering, added a contract smoke test, and verified both `npm run test` and `python3 -m unittest discover -s swa
- 16d587ca/0001 murmur[c4g-clock]/n=1 wren: done: Implemented the inventory package and ledger replay, added standard-library contract tests, and verified both `npm run test` and `python3 -m unittest discover -s swarm_tests` pass.
- 8bf62357/0001 murmur[c4g-clock]/n=1 wren: done: Implemented planner.py with legal candidate generation, hard-constraint-aware backtracking and a fallback plan. `npm run test` passes on the latest state.
- 65ab2cc7/0001 murmur[c4g-clock]/n=1 wren: done: Implemented inventory validation, FEFO/split allocation, service commands and reports, idempotency, and deterministic ledger replay. Verified with `npm run test`, `python3 -m unittest discover -s swar
