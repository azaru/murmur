# Round 6A (criba 6): per-agent traces

Generated with `node scripts/traces.mjs <campaign-dir>...` over the 21 campaigns with seed 20261020 (ids in the campaign registry of `plan.md`). One row per agent transcript; "green at" and "after green" count tool calls; the stop reasons follow the table. `done_refused` events: 0 in all 21 runs.

| run | task | arm | score | tokens | min | end | agent | calls | board % | checks | green at | after green | last check | overwrites | nudges |
|---|---|---|---:|---:|---:|---|---|---:|---:|---:|---:|---:|---|---:|---:|
| 10df4893/0001 | information_extraction_hard | murmur[c4g-clock]/n=1 | 0.998 | 2.07M | 11.4 | all_done | wren | 75 | 5 | 12 | 50 | 25 | green | 0 | 0 |
| 3ebaea0a/0001 | information_extraction_hard | murmur[c4g-guard]/n=1 | 0.839 | 0.30M | 2.8 | all_done | wren | 22 | 14 | 5 | - | - | red | 0 | 0 |
| 56d5d46b/0001 | information_extraction_hard2 | murmur[c4g-clock]/n=1 | 0.990 | 2.73M | 13.1 | all_done | wren | 79 | 5 | 16 | 44 | 35 | green | 0 | 0 |
| c4122f0f/0001 | information_extraction_hard2 | murmur[c4g-guard]/n=1 | 0.264 | 0.60M | 4.0 | quiescent | wren | 30 | 13 | 8 | - | - | red | 0 | 0 |
| b8f32b74/0001 | ledger_reconciliation_hard | murmur[c4g-clock]/n=1 | 1.000 | 1.37M | 9.4 | all_done | wren | 54 | 7 | 12 | 22 | 32 | green | 0 | 0 |
| 356f9934/0001 | ledger_reconciliation_hard | murmur[c4g-guard]/n=1 | 0.896 | 0.36M | 2.6 | all_done | wren | 27 | 11 | 4 | 18 | 9 | green | 0 | 0 |
| 6d44a883/0001 | ledger_reconciliation_hard | murmur[c4g-evidence]/n=1 | 1.000 | 1.15M | 8.1 | all_done | wren | 62 | 10 | 11 | 22 | 40 | green | 0 | 0 |
| 37e62d7e/0001 | information_extraction_hard | murmur[c4g-clock]/n=1 | 1.000 | 2.57M | 13.8 | all_done | wren | 71 | 4 | 10 | 44 | 27 | green | 0 | 0 |
| c7945444/0001 | information_extraction_hard | murmur[c4g-guard]/n=1 | 0.304 | 0.20M | 2.3 | all_done | wren | 15 | 27 | 2 | - | - | red | 0 | 0 |
| e705324e/0001 | information_extraction_hard2 | murmur[c4g-clock]/n=1 | 1.000 | 3.03M | 12.3 | budget | wren | 86 | 3 | 13 | 67 | 19 | red | 0 | 0 |
| 980e5ffc/0001 | information_extraction_hard2 | murmur[c4g-guard]/n=1 | 0.122 | 0.63M | 5.1 | all_done | wren | 27 | 11 | 5 | - | - | red | 0 | 0 |
| a30c44a5/0001 | ledger_reconciliation_hard | murmur[c4g-clock]/n=1 | 1.000 | 1.54M | 11.3 | all_done | wren | 59 | 7 | 10 | 21 | 38 | green | 0 | 0 |
| 289117ff/0001 | ledger_reconciliation_hard | murmur[c4g-guard]/n=1 | 0.241 | 0.21M | 2.0 | quiescent | wren | 18 | 11 | 2 | - | - | red | 0 | 0 |
| 3d9a4d28/0001 | ledger_reconciliation_hard | murmur[c4g-evidence]/n=1 | 1.000 | 0.83M | 7.6 | all_done | wren | 39 | 13 | 6 | 20 | 19 | green | 0 | 0 |
| 2850eb3f/0001 | information_extraction_hard | murmur[c4g-clock]/n=1 | 1.000 | 2.02M | 10.9 | all_done | wren | 73 | 5 | 14 | 44 | 29 | green | 0 | 0 |
| 596dee89/0001 | information_extraction_hard | murmur[c4g-guard]/n=1 | 0.432 | 0.33M | 3.4 | quiescent | wren | 23 | 9 | 2 | - | - | red | 0 | 0 |
| e1ca1638/0001 | information_extraction_hard2 | murmur[c4g-clock]/n=1 | 0.981 | 3.04M | 13.8 | budget | wren | 81 | 4 | 13 | 39 | 42 | red | 0 | 0 |
| 35ab61bd/0001 | information_extraction_hard2 | murmur[c4g-guard]/n=1 | 0.182 | 0.73M | 4.3 | all_done | wren | 39 | 10 | 8 | - | - | red | 0 | 0 |
| 09610091/0001 | ledger_reconciliation_hard | murmur[c4g-clock]/n=1 | 1.000 | 1.29M | 8.5 | all_done | wren | 55 | 7 | 9 | 22 | 33 | green | 0 | 0 |
| 340bbbea/0001 | ledger_reconciliation_hard | murmur[c4g-guard]/n=1 | 0.625 | 0.22M | 2.1 | all_done | wren | 20 | 20 | 2 | - | - | red | 0 | 0 |
| 39b069c4/0001 | ledger_reconciliation_hard | murmur[c4g-evidence]/n=1 | 0.900 | 1.23M | 13.6 | all_done | wren | 57 | 7 | 9 | 23 | 34 | green | 0 | 0 |

Why each agent stopped:
- 10df4893/0001 murmur[c4g-clock]/n=1 wren: done: Implemented the contract in extract.py and added swarm_tests coverage. Both `python3 -m unittest discover -s swarm_tests -v` and the required `npm run test` pass on the latest changes.
- 3ebaea0a/0001 murmur[c4g-guard]/n=1 wren: done: Cannot finish within this run: npm run test remains failing (CS-36201.customer_name precedence); broad extraction implementation is incomplete and does not meet acceptance.
- 56d5d46b/0001 murmur[c4g-clock]/n=1 wren: done: Implemented extract.py for corpus discovery, normalization, case grouping/events, financial documents, ledger replay/FX conversion, and disputes. Added primitive regression tests; python3 -m unittest 
- c4122f0f/0001 murmur[c4g-guard]/n=1 wren: last text: Implemented a basic extractor in `extract.py`. The acceptance test now passes case parsing checks but still fails on ledger replay (`ledger_items` is `null` where entries are expected).
- b8f32b74/0001 murmur[c4g-clock]/n=1 wren: done: Implemented reconcile.py per the contract, added focused parser tests in swarm_tests, and verified both unittest discovery and `npm run test` pass.
- 356f9934/0001 murmur[c4g-guard]/n=1 wren: done: Implemented reconcile.py per contract and verified `npm run test` passes; Python compilation also succeeds.
- 6d44a883/0001 murmur[c4g-evidence]/n=1 wren: done: Implemented reconcile.py per RECONCILE.md, added swarm_tests/test_reconcile.py, and verified npm run test, the swarm unittest suite, py_compile, and isolated-mode execution.
- 37e62d7e/0001 murmur[c4g-clock]/n=1 wren: done: Implemented extract.py per SCHEMA.md, added primitive regression tests in swarm_tests/, and verified both `python3 -m unittest discover -s swarm_tests -v` and `npm run test` pass on the latest state.
- c7945444/0001 murmur[c4g-guard]/n=1 wren: done: Implemented extractor but acceptance check still fails: npm run test reports incorrect merged_case_ids (CS-11073 missing CS-43528).
- e705324e/0001 murmur[c4g-clock]/n=1 wren: last text: 
- 980e5ffc/0001 murmur[c4g-guard]/n=1 wren: done: Implemented the extractor skeleton and core case/document parsing, but acceptance remains failing (severity mismatch for CS-12134). Further implementation and verification are required.
- a30c44a5/0001 murmur[c4g-clock]/n=1 wren: done: Implemented reconcile.py per RECONCILE.md, added focused swarm tests, and verified both `python3 -m unittest discover -s swarm_tests -v` and `npm run test` pass.
- 289117ff/0001 murmur[c4g-guard]/n=1 wren: last text: `reconcile.py` is implemented, but `npm run test` still fails with 6 problems. The acceptance check has not passed.
- 3d9a4d28/0001 murmur[c4g-evidence]/n=1 wren: done: Implemented reconcile.py against the full contract, added edge-case tests in swarm_tests/, verified those tests and `npm run test` pass on the latest state.
- 2850eb3f/0001 murmur[c4g-clock]/n=1 wren: done: Implemented extract.py per SCHEMA.md, added primitive regression tests in swarm_tests/test_extract.py, and verified python3 -m py_compile extract.py, unittest discovery, and npm run test (public sampl
- 596dee89/0001 murmur[c4g-guard]/n=1 wren: last text: `extract.py` is implemented, but the acceptance check still fails: `CS-11073.merged_case_ids` is missing `CS-43528`. I haven’t completed verification.
- e1ca1638/0001 murmur[c4g-clock]/n=1 wren: last text: 
- 35ab61bd/0001 murmur[c4g-guard]/n=1 wren: done: Implemented a partial extractor, but the required contract is not complete; npm run test still fails (refund amount is scaled incorrectly, and ledger/dispute/chat coverage remains missing).
- 09610091/0001 murmur[c4g-clock]/n=1 wren: done: Implemented reconcile.py per RECONCILE.md and added swarm_tests/test_contract.py. Verified with `python3 -m unittest discover -s swarm_tests -v`, `python3 -m py_compile reconcile.py`, and `npm run tes
- 340bbbea/0001 murmur[c4g-guard]/n=1 wren: done: Implemented reconcile.py, but npm run test still fails (7 sample discrepancies). The implementation is incomplete, primarily in amount/currency parsing, replay targeting, and dispute transitions.
- 39b069c4/0001 murmur[c4g-evidence]/n=1 wren: done: Implemented reconcile.py per RECONCILE.md, added focused tests under swarm_tests/, and verified both `npm run test` and `python3 -m unittest discover -s swarm_tests -v` pass on the latest state.
