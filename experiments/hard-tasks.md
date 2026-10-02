# Hardened tasks for swarmtest (option B)

Goal: tasks where Pi n=1 (gpt-6-luna, medium) averages 0.25–0.75, with continuous scoring, so there is headroom to compare systems. They are calibrated against Pi only; murmur is not looked at until the task is fixed.

## Common rules

- New ids `<original>_hard`, same `category`; the originals are not touched. No commits in swarmtest.
- Neutral prompt: no roster text, owners or "solo".
- Grader with a reference: the hidden cases are inputs; the expected output is obtained by running `solution/` in the same grader (no outputs are written by hand, so contract, solution and cases do not drift apart). Checks carry a `weight`; score = weight earned / weight possible; `passed` = all checks. Timeout per case (SIGALRM) and < 60 s in total.
- Each hidden check comes from one sentence of the contract. If Pi fails a check in every run and there is no clear sentence behind it, it is a contract bug, not difficulty.
- Mix of shapes: not all of them should be packages that get split by files (that would favour a swarm by construction).
- Validation without a model: `solution/` scores 1.0; the initial workspace < 0.1; `public_check.py` passes with the solution and fails with the initial workspace, and its docstring says the grader is broader; grader deterministic across two runs; `workspace/` does not reveal hidden cases; seeded generators in `holdout/`; the swarmtest tests still have the same 4 failures.
- Ambiguity review: a read-only agent derives tests from the contract and flags clauses it cannot make concrete, before spending on Pi.

## Calibration protocol (fixed before measuring)

- Only Pi n=1, k=3 per iteration (Pi's noise on `durable` ranges from 0.24 to 0.96).
- Band 0.25–0.75 on average.
- > 0.75: add new families of clauses (not trap cases). < 0.25: clarify the contract or move an example into `public_check.py`.
- Each iteration is recorded in the registry in `plan.md`.
- **Change of 2026-10-01 (approved by the user):** second-generation tasks (`*_hard2`) are also calibrated against a strong single-agent reference, murmur n=1 with `profiles/c4-lessons.json` (c4n1), with k=2 and a band of 0.3–0.6. Reason: the best 3-agent arms saturate the tasks calibrated against Pi only (0.91–1.0 on ieh and durable) and can no longer be ordered among themselves. Pi is still calibrated with k=3 as the "beats Pi" reference, with no lower band limit. The 3-agent candidates are still not looked at until the task is fixed.
- **Change of 2026-10-02 (approved by the user):** the strong single-agent reference is now **c4g-clock** (murmur n=1, `profiles/c4g-clock.json`), with k=3 and a band of 0.3–0.6, replacing c4n1. Reason: round 6 showed that a visible clock alone lifts a single agent to 0.93–1.0 on ieh, ieh2, ledger and durable, so tasks calibrated against c4n1 saturate. Tasks are calibrated and reported in two separate regimes: **difficulty-limited** (same time and tokens as every arm; c4g-clock stays in the band because of quality) and **volume-limited** (more work than one agent can do within the time limit; a swarm can win there by parallelism, which is reported as such and not as coordination). Pi is still calibrated as the "beats Pi" reference.
- **Panel after round 8 (c4g-clock, k=3):** difficulty-limited (D), in band: `constrained_planning_hard` (0.474), `opt_roster2` (0.403), `opt_packing2` (0.402, after the large-visible-instance remedy) and `opt_shop2` (0.306, after the remedy). Out: `opt_routing` (0.620 in swarmtest), `pred_demand` (0.633), `plan_timetable` (0.272 after its one remedy), plus every task saturated in rounds 6–7. Volume-limited (V; 30 min, 6M per run): `ospec_green` (0.459) and `ospec_brown` (0.448), both stopped by the token budget. All round 8 tasks live in `../swarmtest/staging/` and are read through a symlink view.
- Scale reference: `durable` (16 KB contract, ~60 KB solution, 334 checks) is the only known task inside the band (~0.59).

## Pilot: `data_analysis_hard`

Shape: a single script (`analyze.py`) that produces a JSON of answers. It does not split naturally by files (a counterweight to the package tasks).

- **Workspace**
  - `data/`: `orders.csv` (~3,000 rows), `refunds.csv`, `fx_rates.csv`, `products.csv`, `customers.csv`.
  - `QUESTIONS.md` (the contract, ~8–12 KB): ~20 metrics with an exact definition.
  - `public_check.py`: runs `analyze.py` on the visible data and checks the schema and 3 answers.
  - `package.json`.
- **Interface:** `python3 analyze.py <data_dir> <output.json>`, standard library only.
- **Difficulty, all explicit in the contract**
  - Timezone-aware dates converted to a UTC month.
  - Currency conversion at the rate of the order day; if missing, the one from the last earlier day available.
  - Duplicate orders: keep the version with the most recent `updated_at`.
  - Cancelled orders excluded.
  - Partial and full refunds, attributed to the month of the refund.
  - SKU rename chains (`replaced_by`).
  - Customers duplicated by email with different case or whitespace.
  - Half-up rounding only at the end.
  - Top-N with tie-breaks.
  - Retention cohorts.
  - Median and percentiles.
  - Breakdown by day of the week.
- **Grader**
  - Runs the candidate's `analyze.py` and the one in `solution/` on 4 hidden datasets generated by `holdout/generate.py` with different seeds and mixes of rare cases.
  - One check per metric and dataset, with a weight.
  - Invalid output for a dataset: 0 on that dataset.
- **Difficulty dial:** number of metrics and cleaning rules, and how many rules only show up in the hidden data (but are always written in the contract).

## Sketches (written after the pilot)

- **`feature_implementation_hard`:** extended inventory allocation library.
  - Batches with expiry (FEFO), several warehouses with split shipments according to rules.
  - Reservations with TTL and idempotent commands, backorder policies.
  - Movement ledger with replay and audit.
  - Multi-module Python package, ~150 hidden cases.
- **`information_extraction_hard`:** 100–150 synthetic documents (email threads, chats, invoices as text) → `records.json` according to `SCHEMA.md`.
  - Normalisation of dates, amounts and names.
  - Later corrections in a thread that replace earlier data, deduplication.
  - Requires an `extract.py` that the grader runs on hidden corpora generated from the same templates.
- **`constrained_planning_hard`:** a planner that produces `plan.json` for a scheduling instance.
  - People, rooms, windows, precedences, skills and soft preferences.
  - The grader runs it on hidden instances.
  - Score: hard constraints satisfied as a gate, plus the objective against the reference's.
  - A single output.
