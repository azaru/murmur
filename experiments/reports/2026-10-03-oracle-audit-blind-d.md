> **Model output.** Written by a task-building subagent (Claude) on 2026-10-03, copied unchanged below. Verified by hand by the main session: every task.json declares `acceptance_command: npm run test` (all 31 tasks); in the revised blind variants no agent-visible file (`workspace/*`, `task.json`) mentions grader, hidden, score, naive, baseline or best known; `grader.py` is byte-identical to the original in all three.

# Oracle audit and blind variants (report)

## Summary
- Every task in the registry has `acceptance_command: "npm run test"` (and murmur's adapter defines done as "the acceptance check exits 0", swarmtest/adapters/murmur.mjs:56). Oracle strength varies from format-only (original easy tasks) to a quality number on a hidden-size instance (opt_packing2, opt_shop2, plan_timetable).
- Three blind variants are built in `../swarmtest/staging/` (`opt_packing2_blind`, `opt_shop2_blind`, `opt_roster2_blind`). Grader and holdout are untouched: reference hidden scores are identical (two differ at the 4th decimal on packing, clock noise). A deliberately infeasible output passes the new check. swarmtest `plan` loads all three. Nothing was written to `tasks/`, no commits in swarmtest, no model calls. Note: `git status` in murmur shows AGENTS.md, README.md, docs/research.md and src/profile.ts modified; these are not mine (the status snapshot at start was clean).

## Part 1: oracle audit
Classes: a format only, b validity/feasibility on a visible instance, c pass/fail on a sample of hidden-like cases, d quality number on a small visible instance, e quality number on an instance sized like the hidden ones. Rounds are from the registry (approximate where the registry says "L1/L3 batch").

| task | rounds | class | evidence (swarmtest/{tasks,staging}/<t>/workspace/public_check.py) |
|---|---|---|---|
| bug_fixing, feature_implementation | F0/smoke, 5B/6B/7 smoke batch S | c | 4 / 1 hard-coded cases, exit code only (bug_fixing :4-17, feature_implementation :19) |
| data_analysis, information_extraction | smoke batch S | a | schema/keys only (data_analysis :9-16, information_extraction :16) |
| constrained_planning, document_synthesis, live_web_research | early F1/calibration | a | plan shape / headings and word count / source count (constrained_planning :17, document_synthesis :13, live_web_research :27) |
| complex/durable/incremental_workflow_engine | F1, criba1-3, 5A, L1 (durable) | c | small public examples, exit code (docstring :1-3; durable :64) |
| data_analysis_hard, fam_billing/clinic/payouts/shipments | calibration; L2 (fam_*, 5B) | c | schema plus 3 (or a few) exact values from the sample (docstring :1-6) |
| feature_implementation_hard (fih) | criba2/3, round 7 D | c | a few basic calls, exact (docstring :1-4; print :58) |
| information_extraction_hard, _hard2 (ieh, ieh2) | criba1-3, 5A, 6A, L1 | c | shape plus 5/6 exact sample records (docstring :1-5; ieh2 :466) |
| ledger_reconciliation_hard | 6A, L1 | c | sample accounts must match; failure lines are printed (:300-304) |
| constrained_planning_hard (cph) | criba1/2, round 7 D, 9 D | b | format plus "a few easy hard constraints" on the visible instance (docstring :1-3) |
| ospec_green, ospec_brown | pilot, 8, 9 V, 10 V | c | 16 of 47 capabilities / 13 scenarios pass-fail (docstring :1-5) |
| opt_shop, opt_packing, opt_roster, opt_routing | L3 batches (5B, 7 D), opt_routing round 8 | d | prints `objective`, `baseline` and `score S = clamp((N-C)/(N-B))` with best known on instance.json (opt_routing :131-137; opt_shop :124-130; opt_packing :120-126; opt_roster :148-154); exit 0 only if feasible and better than naive |
| opt_roster2 | rounds 8, 9 D, 10 | d | same prints at :165-171; no large instance |
| pred_demand | round 8 | d | prints RMSLE, baseline, best attainable, score S on the visible set (:80-86) |
| opt_packing2, opt_shop2 | round 8 remedy, 9 D, 10 | **e** | as d, plus `instance_large.json` (hidden-largest size) run with feasibility, cost and score S printed (packing2 :128-175, shop2 :129-175; measured for the reference: visible S 0.77, large S 0.69 vs hidden mean 0.68) |
| plan_timetable | round 8 remedy | e | same structure (:174-216) |

The audit scope is read from the registry rows; I did not re-derive which rounds touched each task beyond the registry text. Only the three optimisation tasks of panel D have the strong oracle (d/e); the panel's fourth task cph is b.

### What the profiles tell agents (fragments)
- `src/profile.ts:22-25` (default briefing): "Acceptance check (run from the current directory, must exit 0)"; "When the definition of done is met and the check passes, call done(reason)." `swarmtest/adapters/murmur.mjs:56`: done = "...the acceptance check exits 0."
- `profiles/c4g-clock.json:2`, `c4g-signal.json:2`, `b0-basic.json:2`: "The acceptance check is only a small visible sample"; "A green check is where verification starts ... run them together with the acceptance check"; "Call done only after the acceptance check and swarm_tests pass"; "A failing check is information ... fix it and run the check again"; `done` description (line 4): "verified by the acceptance check and swarm_tests".
- `c4g-signal.json:2` only: "When the acceptance check prints an informational quality score ... treat that score as the target, not the exit code: a green check with a low score is not done."
- `x1g-select-clock.json:5`: "Prefer clauses the public acceptance check does not cover"; attempts are run "against every probe and the acceptance check"; done when it "passes the acceptance check and every probe". `x1g-select-signal.json:5` adds: "install the attempt with the best such score", "Treat a printed quality score as the target, not the exit code".
- `src/swarm.ts:117-118,142-146`: check runs are broadcast as PASS/FAIL (notices) and `done` is refused until a check pass (doneAfterGreen), profile-dependent.
- opt_*2 task prompts: "quality matters beyond feasibility ... Run npm run test before finishing."
- On blind tasks the signal sentences are inert (no printed score); other profiles work unchanged.

## Part 2: blind variants
Each `staging/opt_{packing,shop,roster}2_blind/` is a copy of the original minus `holdout/build_public.py` and `holdout/public_template.py` (they only generated the old check). `grader.py`, the rest of `holdout/`, `best_known.json`, `solution/`, instances, `package.json` and the stub `solve.py` are byte-identical.
- `workspace/public_check.py` (rewritten, no model or baseline code): runs `solve.py` on `instance.json` only, 10 s limit; fails on timeout, non-zero exit, unreadable JSON or wrong shape; prints only the elapsed time and a passed line. Shape: packing `bins` list of `{type:int, items:[int]}`; shop one list per job with one int per op; roster one row per employee with `days` ints in -1..2.
- `PROBLEM.md`: removed "`npm run test` prints the score", the attribution of the baseline to public_check.py, and the notes claiming the check validates constraints or reports the large-instance score. New notes say the check only runs solve.py and checks the shape, reports no cost/baseline/score, and that validity and quality are the author's job; `instance_large.json` is plain data nothing scores. Contract, baseline and scoring text unchanged.
- `task.json`: id renamed; "Run npm run test before finishing" replaced by a statement that the command only confirms the program runs within the limit and writes the documented format, checks no constraints, reports no cost or score, "so verifying correctness and judging solution quality are your responsibility".

### Validation (all under nice -n 15, at most 3 processes; the grader's 4-wide pool was capped at 3 with a wrapper, grader file untouched)
| task | hidden score, original + reference | hidden score, blind + reference | reference passes new check | infeasible output passes new check |
|---|---|---|---|---|
| packing2 | 0.676871 | 0.676477 (n3000 0.6517 vs 0.6533; wall-clock solver) | yes (4.0 s) | yes (all items in one bin type 0, `model.evaluate`: Invalid, conflict) |
| shop2 | 0.742966 | 0.742966 | yes (4.3 s) | yes (all starts 0; Invalid, release/precedence) |
| roster2 | 0.919864 | 0.919864 | yes (3.0 s) | yes (all days off; Invalid, coverage 0 < 6) |

- The unmodified stub (raises NotImplementedError) fails the check, as intended; I did not run the greedy probes.
- swarmtest load: private view `tmp/claude-blind/tasks-view/` with three symlinks and a config copied from criba3.json (competitor: murmur c4g-clock n=1, runs dir redirected into tmp/claude-blind/runs). `python3 -m swarmtest --config <cfg> plan` listed the three tasks (category optimization), 3 runs, no errors. `plan` prints no fingerprints; I computed them with `swarmtest.config.fingerprint` (16 hex): opt_packing2_blind 0fe847ff1e93e6b8, opt_shop2_blind 46fa203eac021dba, opt_roster2_blind ee7c65ca2494bc12 (originals: f2673e672fa3dabf, fa9ea5fcea112128, bda2eda5152669b2).

### Leftover grep
Over PROBLEM.md, task.json, public_check.py, solve.py, package.json for score, S =, best known, baseline, feasible, cost, objective, naive: no "S =" and no "feasible"; the task text mentions best-known only inside the scoring definition. Remaining hits are contract text that defines what the hidden grader measures: the Objective section (cost/penalty formula), the Baseline section (naive procedure) and the Scoring section (`score = clamp((naive - cost) / (naive - best_known), 0, 1)`), and "score of 0" for invalid output. public_check.py mentions "cost, objective, baseline or score" only in the sentence saying it prints none. instance*.json hold only instance data (no best_known or naive keys).

## Open doubts
- The contract still gives the exact objective, naive baseline and score formula, so an agent can build its own scorer (intended).
- Time-limit leakage: the check prints elapsed seconds on the small visible instance and fails above 10 s. It says nothing about quality, and does not exercise the large hidden sizes (instance_large.json is not run), but you could drop the elapsed print.
- Format checks leak little validity: they rule out malformed shapes only. Packing has no range or coverage check; roster checks -1..2 (documented format rule, hard constraint 7).
- Reference scores match; wall-clock solvers vary slightly (packing n3000, 3rd decimal).
- done on "solve.py merely runs" is possible, so doneAfterGreen/doneGate profiles enforce nothing on quality; many runs may end early. Use c4g-clock / x1g-select-clock, not the signal profiles.
- Pre-registration, calibration (c4g-clock k=3, band 0.3-0.6) and a registry entry are still pending; nothing in murmur was changed.

## Revision 2 (no grading description anywhere the agents can see)
- **PROBLEM.md (all three):** intro rewritten as a client spec: production instances of up to 3000 items / 85 jobs on 15 machines / 160 employees (the example has 600 / 38 jobs on 10 machines / 40), the ranges and mix the grader uses, and a 10 s limit "on a machine that may be busy with other work". "Scores 0" became "unusable". The "## Baseline" and "## Scoring" sections are gone (naive procedure, score formula, best_known, offline search, "hidden"). A new "## Quality" section says lower cost is better and the client will use the solution on production instances. Notes: the example is "a small example"; `instance_large.json` is "a second example of the largest production size. It is plain data."; the check description is shortened. The objective, format and hard constraints are unchanged.
- **task.json:** the scoring sentence became "the cost to minimise (lower is better), the 10-second per-instance time limit and the production instance sizes the program must handle"; "visible" became "example"; the sentence that the command only confirms run and format stays.
- **public_check.py:** the docstring and last print no longer mention a baseline, a score or a hidden grader.
- **Leftover grep** (grader, hidden, score, naive, baseline, best known, graded, tens of minutes) over PROBLEM.md, task.json, public_check.py, solve.py and package.json: no hits. A grep for "visible" also finds none in the prompts. The one remaining oddity is that `instance_large.json` is now simply data in the workspace.
- **Checks:**
  - The reference solution passes the new check on all three (4.0, 4.3 and 3.0 s).
  - swarmtest `plan` loads all three tasks (3 runs, no error).
  - `grader.py`, `holdout/` (apart from the previously removed build_public.py and public_template.py) and `instance.json` are byte-identical to the originals. The reference hidden scores from the first validation therefore still hold (0.6769/0.7430/0.9199).
- **New fingerprints (16 hex):** opt_packing2_blind 13e3bf96d11c6b21, opt_shop2_blind 480c03f7acacad81, opt_roster2_blind 39b54327e5f42a61. The earlier ones are obsolete.
- **Open doubt:** the production sizes stated are exactly the grader's, so the spec still lets agents infer the scale of the evaluation. That is the intended truthful production requirement, but it is the one place where grader parameters remain visible, as requirements.
- **Final prompt of opt_shop2_blind:**

> Write solve.py, a single-file Python program (standard library only) that is run as `python3 -I solve.py <instance.json> <solution.json>` and schedules the operations of a job-shop instance with release dates, due dates and machine blocked intervals, exactly as specified in PROBLEM.md. The contract defines the input and output formats, the hard constraints, the cost to minimise (lower is better), the 10-second per-instance time limit and the production instance sizes the program must handle. workspace/instance.json is a small example instance. The acceptance command (npm run test) only confirms that solve.py runs on the example instance within the time limit and writes output in the documented format; it does not check that the output satisfies the constraints and it reports no cost, so verifying correctness and judging solution quality are your responsibility. Do not edit public_check.py or package.json.
