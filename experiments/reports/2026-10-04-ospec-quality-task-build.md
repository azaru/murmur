# ospec_green_q_blind: build report for a quality-bound variant of the stockroom task

> **Checked by hand by the main session (2026-10-04):**
> - ✓ The agents' prompt (`task.json`) is unchanged apart from the id.
> - ✓ The spec gains 10 added lines in 8 spec files; the report says 7 files.
> - The proxy scores were not re-run by hand.

Model output, written by a Claude subagent on 2026-10-04. Claims marked (verified) were checked by hand against the files or by running the grader; the rest is interpretation. No model calls, no campaigns, nothing committed, nothing in `../swarmtest/tasks/`.

## Result in one paragraph

The task is built and validated in `/Users/azaru/Documents/projects/swarmtest/staging/ospec_green_q_blind/`. It keeps the 47 capabilities and the 260 single-capability checks (now `kind: basic`, 30 percent of the weight) and adds 41 `kind: depth` checks (70 percent). **The calibration target was not reached.** Regrading the existing final workspaces, C1T (one agent, clock and tokens) scores 0.980 and the best swarm workspace (STT1) 0.979, against 0.985 on the old grader; the spread across arms widened (0.40 to 0.98), the ordering is preserved. I did not tune weights or scoring to force C1T to 0.4: after removing grader artefacts, the strong workspaces lose only what they really get wrong. Reaching ~0.4 needs genuinely harder requirements, which an offline proxy cannot measure (see "Decision for you").

## Design

- Scope unchanged (47 capabilities, same prompt and visible files, only `id` changed in `task.json`; `public_check.py`, `package.json`, `README.md` are byte-identical).
- The old 260 checks stay hand-asserted (verified: `grader.py` of the original never touched `solution/`, contrary to the rule in `hard-tasks.md`). Only the new depth checks take their expected output from `solution/`: each depth scenario is a script that records observations; the grader runs it once against `solution/` (one process for all scenarios) and once per scenario against the candidate. A checkpoint earns the share of its observations that match at the same position.
- Only spec-defined observables are recorded: error codes, `details` keys the specs name (table `STATED`), documented keys of dicts (extra keys such as an extra `refund_by_sku` or `returned_qty` are ignored, "a dict with ..." returns are projected), no snapshot checksums (they depend on the implementation's own state layout), CLI `usage error` text only for the five capabilities that specify it.
- Depth families (weights of the 70 percent): long random walks over plausible actions chosen from the instance's own state, with boundary-biased arguments (6 walks of 200 and 300 steps, 18.1 percent); the same long run touching every capability with the whole report battery read every ten steps is part of these; persistence, snapshots, ledger replay, order arithmetic, audit trail, rollback of 39 half-way failures, ids past nine (19.3); state-machine tables, every status against every operation, 12 machines (15.7); error-precedence matrices, every pair of simultaneous violations for 55 calls, 491 cases (6.6); arithmetic and state chains and two CLI sessions (10.3). Seeds are fixed, nothing is random at grade time.
- Checks carry `capability` (cross-capability scripts are reported under the first capability they touch, listed in `touches`), `kind`, `fraction_old_spec` and `new_clause_share`.

## What changed

Specs (7 files, 10 clauses; `openspec validate add-stockroom --strict` passes (verified), CLI available): `list_reservations(sku, status, ref)` signature and creation order (a gap in the old spec: three of the old checks used it); a lapsed reservation counts as expired for every operation, so `release` raises; `NEGATIVE_STOCK` wins over `INSUFFICIENT_STOCK` in `adjust`; a line whose unshipped quantity reaches 0 gets its reservation `fulfilled`; return restock goes to the no-lot quantity; each imported CSV row appends the `add_product` audit entry; `sales_summary.by_sku` omits zero net units; cancel releases are audited in reservation id order; every listing keeps its order after a reload; a lot name only exists while it holds stock.
Solution (3 edits): the reload bug that the new checks exposed in the reference itself (`json.dump(sort_keys=True)` made the reservation dict iterate `R1, R10, R2` after a reload, which broke `list_reservations`, `expire_reservations` and cancel), release of lapsed reservations, zero entries in `by_sku`.
Grader: new `grader.py` and `holdout/depth*.py`; the old scenario files are unchanged.

## Weights

Basic: 260 checks, 30.0 percent (0.115 percent each). Depth: 41 checks, 70.0 percent (families above). Every one of the 47 capabilities has basic weight (0.35 to 1.04 percent); depth weight is concentrated by primary capability (persistence-cli 10.3, orders 9.7, stock-holds 8.5, snapshots 5.4, customers 4.8, purchasing 4.8, audit 4.2, others below 3.1). Weight on observations that rest on a clause added in this task: 4.1 percent of the depth weight (2.9 percent of the total); 95.9 percent of the depth observations rest on clauses the old spec already had. Within single scenarios the new-clause share is at most 20 percent (order arithmetic invariants 0.20, reservation and backorder tables 0.17, ledger replay 0.17, clock chain 0.12); the heavy ones are `list_reservations` and the fulfilled-reservation clause, which every reservation listing touches.

## Validation (verified)

- `solution/` scores 1.0 (basic 1.0, depth 1.0); initial workspace 0.0; two grader runs on the solution give identical per-check output.
- `public_check.py` passes on the solution and exits 1 on the initial workspace; it prints nothing about correctness.
- Nothing visible mentions hidden tests, graders, weights or "depth" (grep of `workspace/`).
- swarmtest plans the task through a private symlink view (`plan --tasks ospec_green_q_blind`, view removed); no `run`.
- Reference traces are solution-derived, but I checked the reference against the spec in two other ways: all 491 matrix cases return the code of the first violated check in spec order (zero mismatches), and the nine workspaces were used as an independent audit (below).
- Deviation from the common rules: grading takes 66 to 79 s (basic ~40 s, depth ~30 s) instead of under 60 s on this machine with three lanes running. No ambiguity review by a read-only agent (no model calls); the workspace audit replaced it. The swarmtest test suite was not run (nothing in swarmtest changed).

## Regrade proxy (new grader on final workspaces, copied to scratch)

| workspace | old | new | new, old-spec clauses only | basic | depth | depth, old-spec only |
|---|---|---|---|---|---|---|
| C1T (one agent, clock, tokens) | 0.985 | 0.980 | 0.982 | 0.985 | 0.978 | 0.981 |
| STT1 (12 agents, 24M) | 0.985 | 0.979 | 0.987 | 0.985 | 0.977 | 0.987 |
| STT2 (12 agents, 24M) | 0.925 | 0.858 | 0.865 | 0.925 | 0.830 | 0.839 |
| ST1 (12 agents, stage B) | 0.790 | 0.668 | 0.669 | 0.790 | 0.615 | 0.616 |
| ST2 (12 agents, stage B) | 0.947 | 0.899 | 0.906 | 0.947 | 0.878 | 0.888 |
| B1 (12 agents) | 0.638 | 0.557 | 0.560 | 0.638 | 0.522 | 0.527 |
| B2 (12 agents) | 0.830 | 0.703 | 0.708 | 0.830 | 0.649 | 0.656 |
| C1a (one agent, stopped early) | 0.426 | 0.415 | 0.419 | 0.426 | 0.411 | 0.416 |
| C1b (one agent, stopped early) | 0.469 | 0.397 | 0.401 | 0.469 | 0.367 | 0.372 |

"Basic" equals the old score because the basic checks are the old checks. Old workspaces never saw the ten new clauses, so their new scores are lower bounds for agents who read the new spec; the old-spec-only column drops the observations tied to those clauses on both sides and is the cleaner comparison (STT1 rises from 0.979 to 0.987). A first version of the grader scored C1T 0.82 and STT1 0.92; most of that gap was artefact (checksum targets, extra dict keys, usage-error wording, an unguarded crash zeroing whole walks), the rest was prefix scoring, which I dropped because one wrong read then costs a whole walk.

## Where the strong workspaces lose points

Old failures (1.5 to 7.5 percent, from the old grader): C1T: non-atomic `finish_count` (0.25), bundle `UNKNOWN_COMPONENT` precedence, promotion bundle with a SKU missing from the lines (KeyError), attribute sort by int, CLI usage-error output and exit codes (render, access, supplier-best, landed, snapshot export 0.0). STT1: `list_reservations(ref=)` rejected (seven checks), `NEGATIVE_STOCK` versus `INSUFFICIENT_STOCK` precedence, `OPTIONS_LOCKED`, `low_stock` ties, merged vendor-return lines. STT2: events, access control and snapshots absent (13 checks).
New checks add the same real bugs with proportional cost, plus ones the old grader could not see (verified in the diffs): reload ordering of reservations (C1T, STT2: `R10` before `R2`), `finish_count` leaving a partial adjustment after a rejected call (C1T), `find_products` descending sort and `quote` with promotions crash in every wide walk (C1T), zero-quantity active reservation after a partial shipment (C1T, now covered by a clause), extension state not persisted or snapshotted (STT2), `define_options` not locked after `generate_variants` (STT1). Real difficulty sits in cross-cutting invariants (atomicity, persistence of every module's state, precedence across modules), not in volume.

## Open doubts and risks

- Fairness of the reference: derived from `solution/` and audited by diffing nine workspaces; several artefacts were found and fixed that way (checksum targets, extra dict keys, usage-error wording, a lot-name corner). Unspecified corners may remain in the ~6,800 observations; any divergence shared by most workspaces should be read against the spec before it is trusted.
- Walks choose actions from the candidate's own state: after a divergence they follow the candidate, so the score is position-wise agreement, not a controlled replay.
- The grader credits observations, so one persistent bug costs about 2 to 4 percent of a walk. Prefix scoring (credit only up to the first wrong checkpoint) gave C1T 0.82 and STT1 0.92 in the first version, with the artefacts still present; I did not re-measure it after the fixes and dropped it because one wrong read then costs a whole walk.
- Depth weights are my choice; they barely move the strong workspaces (they pass nearly everything) and matter for weak arms.
- `solution/` had a real reload bug; other hidden bugs there would pass unnoticed unless a workspace disagrees.

## Decision for you

With checks that trace to this spec, strong 24M workspaces are 95 to 99 percent correct. Either ship this as a quality grader with a higher ceiling (it separates weak and strong arms and costs strong arms their real cross-cutting bugs), or add genuinely harder requirements to the specs (for example holds that block `reserve`, shipping and pick lists; orders for registered customers priced like their quote with a credit check at confirm; per-lot reservations), rebuild the solution, and accept that the effect cannot be measured offline. Round pre-registration changes with the choice.

## Files

Task: `/Users/azaru/Documents/projects/swarmtest/staging/ospec_green_q_blind/` (`grader.py`, `holdout/depth*.py`, `solution/`, `workspace/`). Scratch copies were deleted.
