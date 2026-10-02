# Task families built for round 5B (2026-10-01)

Both families were built by subagents in `../swarmtest/staging/`. They are not in swarmtest's `tasks/` and not in this repo: the batch driver reads them from `staging/`. Each was then validated offline and calibrated before any measurement. Numbers marked **[verified]** were re-checked with `swarmtest.grading.grade`.

## L2: `fam_*`, contract-style data tasks (dropped)

**Purpose:** four tasks of the *same* kind, so that pitfalls and techniques transfer, but with different domains so answers cannot be copied.
- **Shape:** `python3 analyze.py <data_dir> <output.json>`, stdlib only, 10–13 output groups, contracts of 7.6–8.7 KB.
- **Shared rule pool:**
  - S1: UTC month bucketing;
  - S2: dedup by latest `updated_at`;
  - S3: half-up rounding at the end;
  - S4: rename chains with a cycle guard;
  - S5: case/whitespace identity;
  - S6: reversals in their own month, with caps;
  - S7: top-N ties;
  - S8: median and nearest-rank p90;
  - S9: fx fallback.

| task | domain | own rules | checks | solution | stub | transfer probe |
|---|---|---|---:|---:|---:|---:|
| fam_billing | invoices, credits, fx | paid only, drop on missing fx, churn definition | 184 | 1.0 [verified] | 0.0 [verified] | 0.24 |
| fam_shipments | shipments, returns | multi-leg completion, lost = late, lost freight/units 0 | 220 | 1.0 [verified] | 0.0 [verified] | 0.61 |
| fam_clinic | appointments, copay refunds | late cancel = missed, double-booking, 30-day revisit | 208 | 1.0 [verified] | 0.0 [verified] | 0.61 |
| fam_payouts | sales, adjustments, fx | tiered fees, chargeback fee, payout threshold with carry | 184 | 1.0 [verified] | 0.0 [verified] | 0.64 |

- The **transfer probe** is the reference solution with the task's own rules switched off. It shows how much shared knowledge alone is worth.
- **Ambiguity review:** an independent read-only agent read the contracts blind, then checked them against the reference. It found no ambiguity carrying hidden weight. 11 one-sentence clarifications were applied; the largest, in payouts, was "a sale dropped for missing fx is not a kept sale", worth ~15–20% of the weight. Re-verified afterwards: stub 0.0, solution 1.0.
- **Calibration (isolated c4g-guard, one per task):** 0.94 / 1.0 / 1.0 / 1.0 in 1.9 minutes, with 9–15 tool calls and ~66k tokens per task.
  - No leak: the stub is 17 lines (`NotImplementedError`), and the agents wrote their own 150–190-line solutions.
  - Above the 0.9 band, so by the pre-registered rule L2 was not measured.
  - It confirms an earlier finding: explicit contract tasks saturate for strong single agents.

## L3: `opt_*`, optimisation tasks (used)

**Purpose:** open-ended headroom, where more work keeps paying off, plus shared search techniques.
- **Shape:** `python3 solve.py <instance.json> <solution.json>`, stdlib, deterministic, 10 s hard limit per instance, 4 hidden instances.
- **Scoring:** 0 on any hard-constraint violation; otherwise `clamp((naive - cost)/(naive - best_known), 0, 1)`. `best_known` comes from long offline runs of the reference.

| task | domain | stub | greedy probe | solution | grader time |
|---|---|---:|---:|---:|---|
| opt_routing | CVRP with time windows, 80–220 customers | 0.0 [verified] | 0.26 | 0.843 [verified] | ~1 s |
| opt_shop | job shop with releases, blocked intervals, weighted tardiness | 0.0 [verified] | 0.37 | 0.852 [verified] | ~3 s |
| opt_packing | 3-dimensional vector bin packing, conflicts, category costs | 0.0 [verified] | 0.33 | 0.872 [verified] | ~4 s |
| opt_roster | 4-week rostering, hard and soft constraints | 0.0 [verified] | 0.26 | 0.872 [verified] | ~1 s |

- **Transfer probe:** routing's generic simulated-annealing skeleton, adapted to packing with ~30 lines, scored 0.89. Techniques do transfer, but this also suggests saturation near 0.9.
- **Caveats from the builder:**
  - best_known comes from the same SA family, so a stronger algorithm can reach 1.0;
  - the 10 s limit is sensitive to machine load;
  - roster plateaus earliest.
- **Calibration 1:** routing 0.33, shop 0.81, packing 0.07, roster 0.89.
  - Packing was below the band, but not because of a contract defect: the agent's solution was feasible, only 1–4% better than naive, written as 64 lines in 11 calls, and then the agent stopped.
  - Pre-registered remedy for a task below the band: give agents more feedback through the public check. In all four tasks, `npm run test` now also prints the visible instance's score under the same formula, using the visible instance's own best_known. Pass/fail is unchanged, and the grader reproduces the same solution scores [verified].
- **Calibration 2:** routing 0.16, shop 0.35, packing 0.56, roster 0.89. All four were in band, so this batch counts as I r0. The variance between the two calibrations is high (shop 0.81 → 0.35), which argues for k ≥ 3.
