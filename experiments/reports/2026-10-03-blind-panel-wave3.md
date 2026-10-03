> **Model output (subagent build), not verified by hand.** Written by a task-building subagent on 2026-10-03. Nothing in `../swarmtest/tasks/`, nothing committed, no agent runs. All checks ran offline under `nice -n 15`, one process at a time.

# Blind variants, wave 3 (harder contract tasks)

Four variants in `../swarmtest/staging/`: `constrained_planning_hard_blind`, `information_extraction_hard2_blind`, `ospec_green_blind`, `fam_payouts_blind`. All are straight blind copies of existing tasks; no contract was enlarged. `grader.py`, `holdout/` and `solution/` are byte-identical to the source (`diff -rq`), except that `information_extraction_hard2_blind/holdout/build_workspace.py` is deleted (not used by the grader, it regenerated the oracle `public_check.py` from the reference; same step as wave 2 for ledger).

## Selection evidence (`experiments/rows/runs.json`, mean hidden score, k in brackets)

Single agent with clock = murmur n=1 `profiles/c4g-clock.json` (with the oracle), unless noted. Contract-style tasks that already saturate with the clock are excluded: `feature_implementation_hard` 0.97 (3), `information_extraction_hard` 1.0, `ledger_reconciliation_hard` 1.0, `complex_workflow_engine` (Pi 0.88).

| task | clock agent with oracle | Pi n=1 | blind-variant expectation |
|---|---|---|---|
| constrained_planning_hard | 0.45 (6; x1g-select-clock 3 agents 0.35) | 0.35 (14) | without the oracle the agent cannot test feasibility, expect lower; note an infeasible trivial plan already scores 0.34 (see below) |
| information_extraction_hard2 | 0.99 (3) | 0.08 (3) | saturated with the oracle, but the oracle printed 6 full expected records; the ieh blind variant dropped from 1.0 to 0.71 (solo-clock) / 0.91 (solo-norms-clock), and hard2 is the larger contract (ledger replay, fx, disputes). Plausibly 0.5-0.9: the weakest candidate |
| ospec_green | 0.59 (4: 0.97, 0.39, 0.52, 0.47); v-swarm-clock 0.17 | n/a | volume task (47 capabilities, 260 scenarios, 288 KB of specs); stopped by the token budget in round 8 at 6M, so within 3M expect lower |
| fam_payouts | no data | no data | no clock evidence at all. Chosen as the clause-heaviest of the `fam_*` family (tiered fees, chargeback fees, payout carry-over, seller merges). `data_analysis_hard` Pi spans 0.0-1.0 (6 runs, mean 0.56) so the family is high variance; ledger-style single-script contracts saturated (0.92 blind). Treat as a probe |

## What changed per task

- **constrained_planning_hard_blind.** `task.json`: prompt rewritten (no "hidden instances", no "run npm run test before finishing", states what the check does not do). `PROBLEM.md`: intro (hidden/visible example -> example instance and real instances), section 4 sentence "each of those four checks fails", section 6 "Evaluation" (weights, reference planner, g thresholds, weighted share) replaced by "Quality" (feasibility first, lower objective preferred, check is a smoke check), section 7 notes (grader/reference wording). Hard constraints H01-H22 and objective untouched. `public_check.py`: old one checked H01, H05, H06, H07, H09, H12 (a feasibility oracle); new one checks run, 20 s limit, shape, coverage, types, ids exist, day in range.
- **information_extraction_hard2_blind.** `task.json`: prompt (example corpus, acceptance statement, no "run npm run test"). `SCHEMA.md`: 2 sentences ("visible sample / hidden corpora", "sample corpus"). `public_check.py`: old one compared 6 full expected records (all 21 fields) and printed expected/actual values; new one is the ieh_blind format check plus ledger_items / ledger_net / dispute format (shape and types only, failure lines never print values).
- **ospec_green_blind.** `task.json`: prompt ("hidden acceptance tests" removed, acceptance statement added). `design.md` line 3 ("hidden acceptance tests" -> "consumers"). `README.md` (smoke check wording). `public_check.py`: old one asserted ~16 scenarios with values and its docstring said "260 scenarios"; new one imports the package, builds a `Stockroom`, and checks that `add_product`/`get_product` return dicts with the documented keys. The workspace `stockroom/` package is still empty, so the unmodified starter fails the check at import (unlike ospec_brown_blind, which passes on the starter).
- **fam_payouts_blind.** `task.json`: prompt. `QUESTIONS.md` line 7 ("It is graded on other data ... Anything not described here is not tested" -> will be run on other data / outside this contract). `public_check.py`: old one checked schema plus 3 sample values (rows read 1705, sales 1358, month list); new one checks keys and value types only (counts int, money number or null, names string or null, month format).

## Validation (swarmtest grader, `python3 grader.py <workspace>` in the task dir)

| task | reference: original / blind score | stub vs blind check | stub hidden score | wrong deliverable passes blind check? hidden score | blind check rejects malformed? |
|---|---|---|---|---|---|
| planning | 1.0 / 1.0 | fails (NotImplementedError) | 0.0 | yes (all sessions day 0, start 0, first room): 0.338 | yes (coverage, types, ids) |
| ieh2 | 1.0 / 1.0 | fails | 0.0 | yes (`{"cases": []}`): 0.0 | yes (bad ledger_net, dispute types) |
| ospec_green | 1.0 / 1.0 | fails at import | 0.0 | yes (minimal 2-method Stockroom): 0.0026 | not tested separately |
| fam_payouts | 1.0 / 1.0 | fails | 0.0 | yes (zero-filled well-formed report): 0.075 | yes (string in p90_sale_usd) |

The reference also passes the new check in all four, and the old check on the original. Planning note: the grader gives vacuous passes for the families a trivial plan does not violate, so a feasibility-ignoring plan floors at ~0.34. This is inherited from the original grader, not changed.

## Loader check

Private view `tmp/claude-blind3/tasks-view/` (4 symlinks into staging) plus a copy of `experiments/criba11/C-durable_workflow_engine_blind-r0.json` (one competitor `profiles/solo-clock.json`, `tasks` and `runs` redirected into tmp): `python3 -m swarmtest --config <cfg> plan` listed 4 runs, one per task, no error. View, config and logs deleted afterwards.

## Fingerprints (`swarmtest.config.fingerprint`, pycache removed)

- constrained_planning_hard_blind `56184a6c49f147a49d600034fac07e37f827a935544ea792a2ca40fd3b015c25`
- information_extraction_hard2_blind `477fa3dd98b0b4de3cead620a7f1e52e5ec48447536d39b40367e7abadbb9e07`
- ospec_green_blind `91feedadf501c20a34ace49e8ba9995523291c1d0fe098b50c2cb9c1819c03ef`
- fam_payouts_blind `a8758668bb89c49db74df85e98da99ecb7bba8a16522d3ecfd8f62249b1aa324`

## Leftovers and open doubts

1. Grep of agent-visible files for hidden/grader/score/sample/expected/visible/public: only `grading_kind` in task.json (not forwarded to agents by the murmur adapter), the file name `public_check.py`, `public_check.py` docstrings ("expected answer", "expected a top-level object", while stating nothing is compared), domain words (`supplier-scorecards`, `expected` in stocktake variance examples, `reference` as a case-id label in ieh2 SCHEMA), and proposal.md of ospec_green ("`public_check.py` ... must not be edited", same as ospec_brown_blind).
2. PROBLEM.md of planning still says "Every instance is known to have at least one plan that satisfies all hard constraints", which is a real-work statement but tells agents feasibility is attainable. Kept from the original.
3. planning: the new Quality section says "a plan close to the best achievable matters more than merely feasible". This is a quality instruction, not a grading description, but it is new text.
4. ieh2 is the weakest candidate for headroom (0.99 with the oracle). fam_payouts has no clock data. If calibration puts either above 0.7, the swap candidates are `data_analysis_hard`, `fam_billing`, `fam_clinic`, `fam_shipments` (blind variants not built).
5. ospec_green: 288 KB of specs; one agent may spend most of 3M tokens on reading and writing. Because the starter package is empty and the check fails until Stockroom exists, the "check green" signal comes early and says nothing about the rest (by design).
6. `profiles/c4g-clock.json` norms still mention hidden tests (wave 2 doubt 5); use a profile without them.
7. Not run: swarmtest unit tests (no swarmtest code touched), Pi or murmur calibration, ambiguity review of contracts (originals were reviewed earlier).

## Commands to verify

- Grader identical: `cd ../swarmtest && diff -q tasks/constrained_planning_hard/grader.py staging/constrained_planning_hard_blind/grader.py` (same for the other three; sources: `tasks/information_extraction_hard2`, `staging/ospec_green`, `staging/fam_payouts`); `diff -rq <source> staging/<name>_blind | grep -v pycache`.
- Reference scores: copy `staging/<name>_blind/workspace` to a temp dir, overlay `solution/.`, then `cd staging/<name>_blind && nice -n 15 python3 grader.py <tempdir>`.

## Verified by hand (main session, 2026-10-03)

- `diff -rq` against each source shows changes only in `task.json`, the documentation files listed above and `public_check.py`, plus the deleted `holdout/build_workspace.py` in ieh2. `grader.py`, `holdout/` and `solution/` are identical. Confirmed.
- A case-insensitive search of each blind task's `workspace/` and `task.json` for hidden, grader, graded, score, scoring, best-known, baseline, evaluat and weight finds only domain words: instance weights, supplier scorecards, promotion evaluation. Confirmed.
- The four prompts say the acceptance command only checks that the program runs and its format. planning's "Quality" section asks for a good plan without describing grading. Read.
- Not yet re-run: the reference scores and the loader check. Graders are not run while campaigns are live; this happens before calibration.
