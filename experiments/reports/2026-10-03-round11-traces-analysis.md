> **Model output (subagent analysis), not verified by hand.** Written 2026-10-03 by a read-only analysis subagent (Claude). No grader, check or campaign was run; every number comes from `record.json`, `result.json`, `*.messages.json` and workspace files of finished runs. Classifications of tool calls are regex heuristics (see Method), so treat small counts as indicative. Items marked **[quote]** are verbatim from transcripts and can be checked at the given message index.

# Round 11 phase 1: what the single-agent traces show

## Method

- Runs: `../swarmtest/runs/<campaign>/run-*/`, only campaigns with `report.json`. Stage P (seed 20261053): 6 tasks x 3 reps x 4 arms = 72 runs. Stage O (seed 20261054): 3 runs. Stage C (seed 20261055): 6 finished campaigns, 1 rep each of solo and solo-clock on opt_packing2, opt_shop2, opt_roster2, information_extraction_hard and ledger_reconciliation_hard. C is supplementary, n=1 per cell; durable and the ospec task were not finished for C.
- Message index = position in `state/murmur/<agent>.messages.json` (murmur) or `state/messages.json` (Pi), starting at 0 with the system message. Times are from message timestamps, seconds since the first message.
- Call classes (temporary script, deleted afterwards): `spec` (read of CONTRACT/PROBLEM/SCHEMA/RECONCILE/README), own test file (write/edit to a file named test*/verify*/*_test.py), `probe` (bash with a python heredoc or `-c`), `testrun` (unittest/pytest/test_*.py), `pubcheck` (`npm run test` only), `runprog` (running the deliverable on the sample), `fix` (edit right after a failing run, or whose thinking summary says fix/bug/wrong), `edit_other`, `readcode`, `other`. A probe may only print output and assert nothing.
- "Calls after minute 3" = tool calls with timestamp >= 180 s.
- Contract tasks = durable_workflow_engine_blind (durable), information_extraction_hard_blind (IEH), ledger_reconciliation_hard_blind (ledger). Optimisation tasks = opt_packing2_blind, opt_roster2_blind, opt_shop2_blind.
- The prompts (identical for all arms) already say: "the acceptance command ... does not check any behavior ... verifying the implementation against CONTRACT.md is your responsibility" (contract tasks) and "verifying correctness and judging solution quality are your responsibility" (optimisation tasks). No arm is uninformed about this; the no-clock arms do not act on it.

## Per-task means (stage P, 3 reps; C in brackets, 1 rep)

| task | Pi | solo | solo-norms | solo-norms-clock | [C: solo / solo-clock] |
|---|---|---|---|---|---|
| durable | 0.52 | 0.52 | 0.36 | 0.96 | [-] |
| IEH | 0.02 | 0.24 | 0.59 | 0.91 | [0.25 / 0.64] |
| ledger | 0.42 | 0.60 | 0.44 | 0.92 | [0.41 / 0.77] |

Contract-task averages per arm (9 runs each; Pi / solo / solo-norms / solo-norms-clock): calls 12.4 / 12.8 / 13.4 / 39.4; seconds to last call 142 / 126 / 142 / 487; Ktokens 111 / 112 / 135 / 786; score 0.32 / 0.45 / 0.46 / 0.93.

## Q1. Why no-clock agents stop after 2 to 3 minutes

Population: the 27 no-clock contract runs (Pi 9, solo 9, solo-norms 9).

| fact | count |
|---|---|
| Stop reason, murmur runs (18) | all_done 15, quiescent 3 (ended the turn without `done`) |
| Own test file written (any name) | **0 of 27** |
| Any behavioural probe or test run beyond the public check, py_compile or a run on the sample | Pi 1/9, solo 1/9, solo-norms 6/9 (see Q3) |
| Probes that mention checkpoint, resume, budget or foreach (the hard clauses of durable) | 2 of 9 durable runs (1 solo-norms, 1 Pi), 1 to 2 probe calls each |
| Final text or done reason admits the contract is not met or is incomplete | **14 of 27**: durable 9/9, IEH 4/9, ledger 1/9 |
| Mean time of the last call | about 137 s (range 70 to 270 s), 6 to 20 calls per run |

Typical shape (nearly all 27): read the contract once, read the stubs, write the files in 1 to 5 `write` calls (the code is written once, in 30 to 90 s), run `npm run test` or the program on the sample once, maybe one small edit, then `done`. The last five actions are almost always write or edit, `npm run test` (or `py_compile && npm run test`), `done`.

What the done reasons claim:
- Durable (9/9 admit gaps, mean score 0.47). Solo `.../20261003T091945Z-94fe3c49/run-0003` msg 24, done reason **[quote]** "the full contract is not met: checkpoint replay/strict event validation is incomplete, and foreach resumption after a pause is not correctly restored. Further work is required." This is at 2 minutes of an 18-minute budget.
- Durable solo `.../20261003T085102Z-38e64c02/run-0003` (ended with quiescent), visible reasoning at msg 26 **[quote]**: "This contract is large and likely grading tough. foreach implement omitted. Need stop? Add. budget model iteration. Can do basic foreach." One edit follows, then an end of turn with "Checkpoint replay validation and full foreach resume semantics remain incomplete, so the implementation does not yet satisfy the full contract." (msg 28). The agent knows it is unfinished and stops after a first draft.
- Ledger and IEH: the done reason claims verification that was only a smoke test. Ledger solo-norms `.../20261003T084143Z-519bcd13/run-0001` (score 0.16) done reason **[quote]** "Implemented reconcile.py according to RECONCILE.md and verified it runs on the sample input, produces valid JSON, and passes npm run test." Ledger solo-norms `.../20261003T090938Z-4a4fb21b/run-0001` (0.17) is the same. The run that scored 0.99 (`.../20261003T094442Z-c3e2e67f/run-0001`) did exactly the same (one write, `npm run test`, done at 76 s), so its score is the luck of the first draft, not verification. Ledger no-clock scores are bimodal (0.08 to 0.17 or 0.64 to 1.0) with identical behaviour.
- IEH: the lowest scorers say it themselves. `.../20261003T090544Z-46d87407/run-0003` (solo, 0.01, quiescent, 139 s): "extract.py runs and passes the smoke test, but the implementation is incomplete: it does not parse mail or chat documents".

Relation to score: within the no-clock arms the score does not depend on tests or time (Spearman of calls-after-minute-3 vs score, n=27: rho = -0.09, p = 0.68; only 3 of 27 runs have any call after minute 3). The score tracks first-draft quality. Interpretation (not proven): the model treats "first complete draft that imports" as the stopping point, and nothing in the prompt, the check or the environment tells it how long it may work. The norms line "Use the time and budget you have while something is still unverified" does not change this (Q3).

## Q2. What the clock does with the extra time

Clock text: the harness appends "\n\n[N minutes left before the timeout]" to every tool result (`src/swarm.ts` line 128), e.g. **[quote]** "[17.9 minutes left before the timeout]" in the first result (`.../20261003T085102Z-38e64c02/run-0004` msg 3).

Reaction: **agents never verbalise the clock.** Across the visible reasoning summaries of all 26 clock runs there is no mention of minutes, time left or the clock (the only time words are "deadline" meaning the solver's own limit in optimisation tasks: 10 messages). So there is no "I still have N minutes, let me test X" to quote; the effect is behavioural.

How the time is used. Clock runs on contract tasks (P solo-norms-clock 9 runs plus C solo-clock 2 runs): 246 calls after minute 3. Per run: durable 37 / 44 / 14, IEH 25 / 36 / 31 (C: 25), ledger 3 / 6 / 20 (C: 5).

| class of calls after minute 3 | calls | share |
|---|---|---|
| verification activity: probes 48, testruns 16, own test files 5, public check 11, run on sample 5 | 85 | 35% |
| edits (fix-tagged 33, other 64) | 97 | 39% |
| reading code | 37 | 15% |
| other (cleanup, git, ls) and done | 27 | 11% |
| **re-reading the contract/spec** | **0** | 0% |

- No agent, not even a clock agent, re-reads CONTRACT.md / SCHEMA.md / RECONCILE.md after the first read (0 spec re-reads in the 11 contract clock runs; the 43 re-reads in all 26 clock runs are in the opt and ospec tasks). Checking against the contract is done from memory, e.g. thinking summaries "Reviewing replay contract", "Checking checkpoint validation" in `.../20261003T085102Z-38e64c02/run-0004` msgs 78, 94 to 100.
- Failing own tests that lead to a fix: of the 246 late calls, 13 own-test runs show a hard failure (Traceback, AssertionError, non-zero exit) and 8 are followed by an edit within 2 calls. Example, IEH `.../20261003T094049Z-3e791542/run-0004` msg 34 (t = 297 s): **[quote]** `AssertionError: ('status', None, 'closed')`, then "Updating normalization test"; msg 56 (t = 489 s) an `AssertionError` on money normalisation, "Checking the money assertion". Durable `.../20261003T085102Z-38e64c02/run-0004` wrote `test_workflow_engine.py` (msg 55, t = 269 s) and ran it 7 times; probes at msgs 59, 76, 89, 92 explored checkpoint resume and retry states and were followed by edits to checkpoint.py or bindings.py. Other fixes follow an ad-hoc probe whose printed output the agent reads.
- Own test files kept in the folder: 3 of the 9 P clock runs on contract tasks (2 durable, 1 IEH); the rest only run heredoc probes.
- 64 late edits are not triggered by a failure: hardening from the agent's own review ("Strengthening checkpoint validation", "Adding binding validation", "Updating _valid cycle handling"). That is more attempts guided by self-review, not only bug fixing driven by a failed test.

Is the gain verification or just more attempts? Both; these data cannot separate them. The clock runs make about 3 times as many calls, about 10 times as many probes per run (8.8 vs 0.2 to 0.9), find 13 hard failures with their own tests in the late phase (all 27 no-clock runs together show 8 hard failures, mostly crashes of the first draft), and spend 39% of late calls on edits not triggered by failures. The step change is that they do not stop. The clock agents also never claim "incomplete" (0 of 11 done reasons or final texts), whereas all no-clock durable agents do.

The clock agents stop on their own with 5 to 14 minutes left (mean about 10 minutes), never at the limit. The clock moves the point at which the agent feels done; it does not run agents to exhaustion. The ledger clock runs that stopped soonest (3.6 to 3.9 min, 14 minutes left, scores 0.86 and 0.89) are also the lowest ledger clock scores; the one that continued to 10.5 min got 1.0.

Spearman, calls after minute 3 vs score:
- stage P, all 4 arms, contract tasks, n=36: rho = 0.49 (permutation p = 0.003); with the task mean removed 0.57 (p = 0.0006). This is mostly the clock-vs-rest arm contrast.
- clock runs only (P plus C solo-clock), n=11: rho = 0.36 (p = 0.27), compressed by the ceiling near 1.0.
- no-clock runs only, n=27: -0.09 (Q1).

Stage C (n=1 per cell, supplementary): solo-clock (clock without the norms) also lifts the contract tasks: IEH 0.25 to 0.64, ledger 0.41 to 0.77 (25 and 5 late calls). So the norms text is not needed for the effect. (One run each; Pi's own noise is 0.0 to 0.75.)

## Q3. Do the norms change behaviour (solo-norms vs solo, stage P)

| metric | solo | solo-norms |
|---|---|---|
| contract: calls per run | 12.8 | 13.4 |
| contract: runs with at least one probe or test run | 1/9 | 6/9 |
| contract: probes + testruns per run | 0.22 | 0.89 |
| contract: own test files | 0 | 0 |
| contract: public checks per run | 1.2 | 0.9 |
| contract: seconds to last call | 126 | 142 |
| contract: mean score | 0.45 | 0.46 |
| contract: stop reasons | 7 done, 2 quiescent | 8 done, 1 quiescent |
| opt: probes + testruns per run | 1.56 | 1.67 |
| opt: ran the large instance | 3/9 | 6/9 |
| opt: mean score | 0.048 | 0.079 |

The norms change something small: more ad-hoc probes of the draft on contract tasks (1 of 9 runs to 6 of 9) and more checking of the large instance in optimisation runs. They do not produce the behaviour the norms ask for: no agent kept an own test file, no agent used more time (13 vs 13 calls, 126 vs 142 s), the stopping pattern is the same. "Use the time and budget you have while something is still unverified" has no visible effect, consistent with the agent not knowing its budget. Contract scores differ by 0.01 overall (per-task means differ by 0.1 to 0.35 in both directions, within noise).

## Q4. Why the optimisation tasks stay near zero

Population: 42 runs (36 stage P, 9 per arm; 6 stage C). Per-instance results: 168 (4 per run). 99 have cost >= naive (score 0), 2 are timeouts, 67 are below naive. 22 of 42 runs score exactly 0 (20 of 36 P runs); only 6 of 42 reach 0.25. The 2 timeouts are one roster solo run (`.../20261003T093941Z-55740991/run-0003`, exceeded 10 s on the two largest instances); the roster workspace holds only the 40-employee example and no large instance, so no roster agent can test the largest size without generating one. There were 0 invalid outputs apart from these.

**The score formula** (staging `grader.py`, read only): per instance `score = clamp((naive - cost) / (naive - best_known), 0, 1)`. The naive baseline is not trivial: packing = first-fit decreasing into the biggest bin type, then each bin downsized to the cheapest type that holds it (`holdout/model.py:52`); roster = day by day, senior-first greedy by priority key; shop = Giffler-Thompson dispatch with weighted-SPT and no backfilling. best_known / naive, inferred from scored instances, is about 0.74 (packing), 0.66 to 0.73 (roster) and 0.70 to 0.79 (shop). So all the credit lies in a 21% to 34% cost reduction relative to naive; an agent 3% below naive gets about 0.1 and an agent 2% above gets 0.

Where the agents sit (mean cost ratio to naive over all instances; Pi / solo / solo-norms / solo-norms-clock): packing 1.06 / 1.09 / 1.05 / 0.98; roster 1.17 / 1.06 / 1.26 / 0.99; shop 0.98 / 1.22 / 1.05 / 1.09. Zero-score runs have a mean ratio of 1.195 (range up to 2.0). Packing instances below naive: Pi 0/12, solo 0/16, solo-norms 3/12, solo-norms-clock 11/12 (ratios 0.967 to 1.005, scores 0.02 to 0.12). The packing 0 is mostly because the agents' first greedy is **worse than the evaluator's FFD-plus-downsizing baseline by 7 to 10%**, not because it is invalid.

**Algorithm and behaviour** (keyword scan of the final solve.py plus transcripts; approximate). A time-bounded randomised or local search or annealing appears in 1/9 Pi, 2/12 solo (P plus C), 0/9 solo-norms, 7/9 solo-norms-clock and 3/3 solo-clock runs; the others are one-pass constructive greedy (40 to 100 lines). Mean score: search runs 0.14 (n=13) vs 0.06 for greedy-only (n=29) (packing 0.075 vs 0.009, shop 0.19 vs 0.09, roster 0.12 vs 0.11). No run in the 42 contains a compare/baseline/naive/greedy step in its bash commands (regex over all bash calls, two read by hand), so none builds a second solver to see whether its cost is good. 18 of 42 runs have some cost, evaluate or validity step in a command (this regex includes validity checks, so it overstates quality measurement); 6 of 42 (4 of them clock runs) measure the cost of two different solutions of the same instance.

Two concrete traces:
- Packing, solo, no clock, `.../20261003T080953Z-d3f8b556/run-0003`: writes a greedy solve.py (msg 8), runs it on the small example (0.1 s of the 10 s limit; msg 10 prints cost 29772 and checks), makes three small edits, `done` at 50 s with a reason "verified its output against all hard constraints on the example" (msg 18). It never opens `instance_large.json` and never tries to improve. Score 0.0.
- Packing, solo-norms-clock, `.../20261003T080953Z-d3f8b556/run-0004` (0.115, the best packing run): inspects both instances (msgs 6, 10), writes a greedy (msg 12), runs the large one: 8.4 s, cost 129,870 (msgs 19 to 21), adds a local search (msg 25) and reruns: 6.0 s, **cost 130,275, higher** (msg 27), validates feasibility and stops at 133 s: "The large instance completed in about 6 seconds". It tuned feasibility and runtime, not quality.

Time: 33 to 106 s (no clock) and 82 to 178 s (clock). No-clock solvers are mostly under 2.5 s on the examples (one Pi run saw 14 s); clock solvers 6 to 9 s. Stops among the 27 murmur P runs: all_done 22, quiescent 5. Final done reasons talk about feasibility ("independently checked capacity, conflict and item-coverage constraints", "runtime is about 5.1 seconds") and never about quality.

**Does PROBLEM.md say a better solution is wanted?** Yes, in one flat sentence: "Quality: Lower cost is better. The client will use the solution on its production instances, so the cost it achieves there matters beyond mere validity." The objective formula, the production sizes (1200 to 3000 items; 60 to 160 employees; up to 85 jobs) and the 10-second limit are given. There is no sign of how much room there is, no reference solution and no suggestion to compare heuristics. That is oracle-free, as intended, but an agent that never builds a second candidate cannot tell a good result from one 5% worse than a stock heuristic. Is the 0 driven by the formula? Partly: 99 of 168 instance results are above naive and clamp to 0, so the metric discards the difference between 5% above and 50% above naive. A continuous metric (cost ratio to naive) would show the clock arm closer to the best-known value in 2 of 3 tasks (ratios 0.98 and 0.99 vs 1.05 to 1.26).

Usability: the optimisation tasks separate arms weakly at best (P means 0.077 / 0.048 / 0.079 / 0.122 for Pi / solo / solo-norms / solo-norms-clock, floor near 0 in every arm). They test whether an agent builds and compares its own baselines, which real work does demand, but with k=3 and a clamp floor they have almost no power. Stage C (n=1): solo-clock beats solo on all three (packing 0.036 vs 0, shop 0.28 vs 0, roster 0.24 vs 0.04) with 100 to 164 s vs 38 to 59 s.

## Q5. ospec_brown_blind, stage O (3 runs, solo-norms-clock, 6M cap)

Runs: `.../20261003T080947Z-2337418f/run-0001` (0.474), `.../20261003T082515Z-d4c8c23e/run-0001` (0.535), `.../20261003T083957Z-55dea7a2/run-0001` (0.405). All end with reason `budget` after 724 to 868 s (time limit 1920 s), in mid-work (last calls: reading ext_*.py, editing tasks.md, writing a test file). Score decomposition (390 checks): regression group 162 checks, 100% in all three; change group 228 checks, 30% / 38% / 21%. So the 0.40 to 0.54 is mostly the regression floor and the new feature is 21% to 38% implemented.

Where the tokens went. Cost = number of turns x context size, and 97% of the 6.0M tokens are cache reads: 114 / 89 / 98 turns with a mean context of 52k / 68k / 62k tokens per turn (max 87k to 107k). The stage P cap of 3M would have been reached at turn 72 / 56 / 59 (about 6 to 8 minutes), well before the agent is done. No single class is wasteful. Attributing each turn's tokens to the call that follows: edits (source, tests, tasks.md) 43% to 52% (2.6 to 3.1M), code reads 14% to 23% (0.85 to 1.4M), running tests 8% to 11%, writing tests 9% to 11%, spec re-reads 5% to 10%. Calls: 136 / 112 / 104; edit and write about 70 / 46 / 57; reads of code or spec about 50 / 53 / 33; test runs 13 / 9 / 7 plus a few probes.

Waste candidates: 20 / 17 / 6 spec re-reads (111k / 139k / 28k chars of openspec files in tool results, against 55k to 118k chars of other code reads); `tasks.md` (11k to 24k chars) is read 1 to 3 times and edited 7 / 2 / 4 times (checking off tasks, the OpenSpec convention); `taskboard/tasks.py`, `exporter.py`, `ext_custom_fields.py`, `ext_milestones.py` are re-read 2 to 4 times each; 37 to 52 edits to source files, 7 to 11 to tests, with repeated rewrites of board.py, workflow.py, exporter.py, ext_timetracking.py. The regression suite stays at 100%, so the turns go into the feature. The task needs about 100 turns of a 60k-token context; 6M is only just enough and a 228-check feature is 21% to 38% done when it runs out. The agents do not stall; the task is large relative to the cap.

## Implications for phase 2 and open doubts

1. The clock is the dominant lever; the no-clock arms differ only by noise (contract means 0.32 / 0.45 / 0.46). The phase-2 comparison "swarm vs a single agent" must use the single agent with the clock as the control; against a no-clock single agent, any arm that makes agents keep working will look like a win. A swarm needs the same clock to be comparable.
2. A swarm without the clock probably has the same stopping problem (every no-clock agent stops after a draft); test swarms with and without the clock separately.
3. The clock effect is behavioural, is never verbalised and appears with and without norms. Whether the content of the clock matters or it is a generic "keep going" cue is unknown (a control showing a fake or constant number would tell; nothing was run).
4. The optimisation tasks are weak instruments at k=3: floor from the clamp, strong naive baseline, no large example for roster, and agents that never compare two solutions. They need a continuous metric (cost ratio to naive), the roster example at production size, and k of at least 5 to be usable; as they stand 20 of 36 P runs score 0.
5. Open doubts: (a) call classes are regexes; whether probes cover the harder clauses was only checked by keyword in durable. (b) "fix" detection uses the model's reasoning summaries. (c) C has one repetition per cell. (d) Part of the arm gap is first-draft luck (ledger no-clock 0.08 to 1.0 with identical behaviour), so k=3 cannot rank no-clock arms. (e) Whether the clock gain is already in the first 3 minutes (a different first draft) was not analysed; that needs diffing workspaces at minute 3, which the transcripts allow but which was not done.

## Key transcript pointers

- `/Users/azaru/Documents/projects/swarmtest/runs/20261003T085102Z-38e64c02/run-0003/state/murmur/wren.messages.json` msgs 26, 28 (no-clock durable agent: "Need stop?", final admits incomplete).
- `/Users/azaru/Documents/projects/swarmtest/runs/20261003T091945Z-94fe3c49/run-0003/state/murmur/wren.messages.json` msg 24 (done reason "full contract is not met").
- `/Users/azaru/Documents/projects/swarmtest/runs/20261003T085102Z-38e64c02/run-0004/state/murmur/wren.messages.json` msgs 3 (clock text), 55 to 100 (own tests, probes, fixes).
- `/Users/azaru/Documents/projects/swarmtest/runs/20261003T094049Z-3e791542/run-0004/state/murmur/` msgs 34, 56 (own assertions fail, then fixes).
- `/Users/azaru/Documents/projects/swarmtest/runs/20261003T080953Z-d3f8b556/run-0003` and `run-0004` (opt packing no-clock vs clock, msgs 8 to 27).
- `/Users/azaru/Documents/projects/swarmtest/runs/20261003T082515Z-d4c8c23e/run-0001` (stage O, budget stop at turn 89, 17 spec re-reads).

## Verified by hand (main session, 2026-10-03)

- `20261003T091945Z-94fe3c49/run-0003`, message 24: the done reason says "the full contract is not met … Further work is required". Confirmed.
- Clock runs never mention the time left: a regex over the assistant text and reasoning of all 30 round-11 clock runs found 1 hit (`20261003T092953Z-9478a250/run-0004`, message 23), and it is about the code's own timeout handling. Confirmed.
- `20261003T080953Z-d3f8b556/run-0004`: the large-instance cost goes from 129,870 (message 22) to 130,275 (message 28), and the agent then finishes with that version. Confirmed.
- `20261003T082515Z-d4c8c23e/run-0001` ends on `budget`. Confirmed.
- The other counts (probes, call classes, Spearman) were not re-derived.
