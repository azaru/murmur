# Model output (subagent analysis of round 16 stage A transcripts), 2026-10-04

**Checked by hand in the main session (2026-10-04, after the report):**
- ✓ Claim 1 (spend): planning STT rep 0 has 566 `tool` events and C1T rep 0 has 35 (`events.jsonl`).
- ✓ Claim 5 (threads), with one nuance: in all four STH runs the largest thread has posts from 11–12 agents (t1 with 52, 132 and 98 posts), but in shop2 STH rep 1 the largest is t3 (54) and t1 has 36, so that run has two busy threads rather than one room.
- ✓ Claim 8: shop2 STT rep 0 has 12 `done` events, 11 of them before the last write/edit of `solve.py` (16:24:00).
- ✓ Claim 10: `grep -ic "naive\|baseline"` on the blind shop2 `PROBLEM.md` returns 0. The premise of question 5 (a naive baseline in the contract) was the main session's mistake, corrected in `plan.md` side test U.
- Not re-run: the version replay and per-version grading (claims 2–4, 7, 11).

Scope: 12 runs of round 16 stage A (C1T = one agent with clock and tokens-left line; STT = 12 equal agents, post-only board, staggered entry; STH = STT with a threaded board), tasks `constrained_planning_hard_blind` (planning) and `opt_shop2_blind` (shop2). All numbers below come from the run directories under `../swarmtest/runs/<campaign>/run-0001/` (`record.json`, `state/murmur/events.jsonl`, `state/murmur/<agent>.messages.json`, `workspace/`). Labels: **[V]** = computed by a script and cross-checked against the grader's own record (see "Method and caveats"); **[Q]** = read from transcripts, quoted; **[H]** = hypothesis, not tested.

Campaign map (rep 0 / rep 1):

| task | C1T | STT | STH |
|---|---|---|---|
| planning | 5d32faf7 / c89a315a | ec715fbc / 9e697046 | f88d7d38 / 25fef1a5 |
| shop2 | b8573bf5 / fd773a08 | 9d9938d8 / c2362101 | 2d378749 / 37116428 |

(Each campaign directory name is `20261004T<time>Z-<id>`; each holds one `run-0001`.)

## Key claims (numbered, for hand verification)

Throughout, `RUN=../swarmtest/runs/<campaign>/run-0001`; "events" = `$RUN/state/murmur/events.jsonl`.

1. **A near-final deliverable existed within the first 1-2 minutes in 3 of 7 evaluable 12-agent runs, and the rest of the run bought almost nothing.** Planning STT rep 0: version at 15:55:14 (72 s) scores 0.454, final graded 0.479, and the run burned 12.0M tokens until 16:00:05. Planning STT rep 1: first version 0.372, final 0.430 (11 min later). Shop2 STT rep 0: 0.63 at 83 s, final 0.639. Verify: replay the write/edit events of `planner.py`/`solve.py` and grade each version (Appendix A/B; per-version scores in the table of section 1).
2. **The graded file was the best (or tied-best) version ever produced in all 7 evaluable runs; later agents did not degrade the final.** But the shared file was repeatedly broken in between: shop2 STH rep 0 scored 0.00 for 123 s, STH rep 1 for 92 s, planning STT rep 0 for 15 s (section 3).
3. **Planning loses points on hard-constraint families of the 4 larger hidden instances, not on format.** All 6 planning runs get 4/4 basic checks (run, shape, coverage, types) on all 5 instances. Lost share of total score: hard families 0.22-0.53, quality tiers 0.126-0.136 (identical in every arm). `record.json` -> `grade.checks`.
4. **Final score follows the algorithm family of the first full solver, not the arm.** Planning: the two best runs (C1T rep 1 0.650; STH rep 1 0.598) are the ones with annealing/conflict repair or heavy local search (final `planner.py` keyword counts, section 1); CSP-backtracking finals score 0.33-0.48 in every arm.
5. **STH threads degenerate into one chat room.** Every STH run has a thread `t1` opened by `finch` within ~1 minute that collects 36-133 posts from all 12 agents; 2-7 threads per run in total, 6 of 20 threads never got a reply. Board share of calls rises from 22-34% (STT) to 42-49% (STH) (section 2).
6. **Ownership emerges by itself and is respected: 3-7 agents write the deliverable, 8-9 only review.** Reviewers then spend 94-124 `read` calls of `planner.py` per planning STT run (C1T: 2 and 7) (section 3).
7. **Write races exist and are costly in edits:** 15 failed (stale `oldText`) edits in planning STT rep 0 (of 30), 9 in shop2 STH rep 0; 6 competing whole-file rewrites over another agent's version in STT runs, 10 in STH runs; write-guard refusals only 2 in total (section 3). No conflict markers anywhere (branches are off).
8. **In 6 of 8 swarm runs most agents had already called `done` before the last edit of the deliverable** (e.g. shop2 STT rep 0: 11 of 12 before linnet's last edit), so their "independently validated" reasons refer to an earlier version (section 4).
9. **Nobody mentions the tokens-left line or the clock** in any of the 12 runs (assistant text, thinking summaries, posts, done reasons; regex in section 4). 3 of 6 planning swarm runs ended on the token cap (12M burned in 364 s in planning STT rep 0).
10. **The blind shop2 `PROBLEM.md` does not describe a naive baseline** (`grep -in "naive\|baseline" ../swarmtest/staging/opt_shop2_blind/workspace/PROBLEM.md` is empty), contrary to the premise of question 5. Agents had nothing external to compare with; the swarms compared candidate solvers *with each other* on the two provided instances in all 4 shop2 swarm runs, C1T never did (section 5).
11. **All swarm "validation" of planning used the single 16-session example**; the hidden instances have 36-80 sessions and every arm's final planner is infeasible on 4/5 of them in most runs. Reviewers did flag the risky code paths in words (quotes in section 3) but the owner did not act on them before the cap/done.

## 1. Why does STT lose to C1T on planning at 17x the tokens?

### Scores and spend

| arm | rep | graded score | tokens | wall s | end | agents calling `done` | calls |
|---|---|---:|---:|---:|---|---:|---:|
| C1T | 0 | 0.334 | 0.62M | 502 | done | 1/1 | 35 |
| C1T | 1 | 0.650 | 1.23M | 666 | done | 1/1 | 52 |
| STT | 0 | 0.479 | 12.02M | 364 | **token cap** | 2/12 | 566 |
| STT | 1 | 0.430 | 11.46M | 812 | all done | 12/12 | 481 |
| STH | 0 | 0.354 | 5.53M | 709 | all done | 12/12 | 343 |
| STH | 1 | 0.598 | 12.03M | 518 | **token cap** | 8/12 | 531 |

Tokens per call are the same (~18-21k per call for C1T and STT), so the 17x is 17x more calls: 566 calls against 35, almost all of them reading and validating the same file (`read` of `planner.py`: STT 124 and 94, STH 38 and 89, C1T 2 and 7).

### What got graded

The graded artifact is `workspace/planner.py` at the end of the run. I replayed every `write`/`edit` event on it (Appendix A; exact-match edits, atomic per call) and graded every distinct version with the task's own grader code and hidden instances (Appendix B; reference objectives computed once). The replay reproduces the final graded score exactly for STT rep 0 (0.4794), and within 0.01 for STT rep 1 and STH rep 1; **STH rep 0 cannot be replayed** (15 replay edits fail against 4 real failures; treat it as unknown). Scores of intermediate versions depend slightly on machine load (solvers are wall-clock bound; load was 5-8 here).

Per-version score (minute:second, agent initials, score). Only versions that changed the file are listed.

* STT rep 0 (ec715fbc): `55:02 wr 0.17 | 55:14 fi 0.45 | 55:27 fi 0.45 | 55:45 du 0.48 | 55:54 fi 0.48 | 56:18 du 0.42 | 56:57 du 0.42 | 57:34 fi 0.42 | 57:41 du 0.47 | 57:59 du 0.47 | 58:31 fi 0.00 | 58:46 li 0.47 | 58:49 fi 0.47 | 59:35 cr 0.35 | 59:36 wr 0.35 | 59:51 cr 0.48` (run ended 16:00:05 on the cap). Last writer: crane. Final = best.
* STT rep 1 (9e697046): `46:13 wr 0.37 | 47:17 cr 0.00 | 47:25 cr 0.39 | 50:33 wr 0.43 ... 57:39 wr 0.43` (all later edits 0.43). Last writer: wren. Best 0.433 reached at 4.5 min of 13.5.
* STH rep 1 (25fef1a5): `00:57 fi 0.44 | 03:08 fi 0.45 | 04:38 wr 0.47 | 06:10 du 0.46 | 07:48 fi 0.60 | 07:52 cr 0.61 | 07:56 fi 0.61` (cap at 17:08:00). Last writer: finch. Final 0.598, best 0.608. The +0.15 jump came at minute 7.8 of 8.6, from one edit by finch.
* C1T rep 0 (5d32faf7): `0.19 -> 0.07 -> 0.25 (48:10) -> 0.33 (50:28)`, final 0.334. C1T rep 1 (c89a315a): `0.31 (33:46) flat for 6 minutes, 0.43 (40:01), 0.64 (40:41), 0.65 (42:10)`, final 0.650 (best 0.650; last version 0.643 vs graded 0.650, load noise).

So: (a) the swarm's final was never worse than its best; (b) the swarm reached its plateau fast (0.45 at 72 s in STT rep 0) and then 11 agents polished/verified for 4-12 more minutes for +0.02-0.06 (STT) or one late jump (STH rep 1); (c) C1T's one agent gets the same range (0.33 / 0.65) in ~1M tokens, and rep 1's 0.65 comes from a rewrite late in the run. The spread between runs of the same arm (0.33-0.65 C1T, 0.35-0.60 STH) is larger than the spread between arms.

**Algorithm family of the final planner (keyword counts in final `planner.py`)** [V]: C1T rep 0 (0.334) `def search`, MRV, greedy fallback; C1T rep 1 (0.650) `anneal`, `restart`, `conflict`; STT rep 0 (0.479) and STH rep 0 (0.354): backtracking `def search` + MRV + fallback; STT rep 1 (0.430): fallback + local + greedy; STH rep 1 (0.598): MRV search + 7x local improvement + deadline checks. Architecture is fixed by the first 1-2 full writes (wren, finch, crane write complete solvers in the first 70-100 s of every run); everyone else patches it.

### Where each arm loses points (planning, share of total weighted score lost; mean of 2 runs)

| family | C1T | STT | STH | note |
|---|---:|---:|---:|---|
| basic (run, shape, coverage, types) | 0 | 0 | 0 | format is always right |
| hard H01-H22 | 0.375 (0.530 / 0.219) | 0.415 (0.395 / 0.435) | 0.394 (0.511 / 0.276) | all of it on `medium`..`xl_dense` (+ `small` in STT rep 1, STH rep 0) |
| quality tiers (needs a feasible plan) | 0.134 | 0.131 | 0.131 | only `small` can reach them; best any run did is 2 of 4 tiers on small |

Hard families failed on the large instances by every run (count of the 5 instances failing each family, summed over arms): H09 room overlap, H11 person overlap, H10 turnover, H14 travel, H16 precedence, H17/H18/H19 day rules, H15 daily load, H20-H22. H04/H05/H07/H12/H13 fail only in C1T rep 0. Reading: the planners do not find a feasible plan on 36-80 session instances and write the (infeasible) fallback; partial credit is the number of families the fallback happens to satisfy. A swarm of 12 does not solve the feasibility problem faster than one agent because all 12 share one architecture.

STT rep 1 and STH rep 0 even fail the hard families on the `small` hidden instance (H 16/22 and 11/22), although their reviewers had "independently validated" the 16-session example with zero violations.

## 2. Threads (STH vs STT)

| run | calls | board calls (post/thread_new/reply + list/read/inbox) | board share | posts written | thread_list | thread_read | threads opened | posters | tokens |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| planning STT 0 | 566 | 175 | 31% | 175 | - | - | - | 12 | 12.0M |
| planning STT 1 | 481 | 164 | 34% | 164 | - | - | - | 12 | 11.5M |
| shop2 STT 0 | 438 | 97 | 22% | 97 | - | - | - | 12 | 7.4M |
| shop2 STT 1 | 252 | 76 | 30% | 76 | - | - | - | 12 | 2.9M |
| planning STH 0 | 343 | 144 | 42% | 62 (5 new + 57 reply) | 31 | 51 | 5 | 12 | 5.5M |
| planning STH 1 | 531 | 262 | 49% | 134 (2 + 132) | 92 | 36 | 2 | 12 | 12.0M |
| shop2 STH 0 | 565 | 252 | 45% | 140 (6 + 134) | 49 | 63 | 6 | 12 | 10.9M |
| shop2 STH 1 | 515 | 238 | 46% | 97 (7 + 90) | 59 | 82 | 7 | 12 | 8.5M |

* Mean board share 29% (STT) vs 46% (STH). Posts written: mean 128 (STT) vs 108 (STH); STH adds 80-140 navigation calls per run (list/read), i.e. 20-25% of all calls. Threads did not reduce chatter; they added a navigation tax.
* Thread structure: the first thread (`t1`, always opened by `finch` in the first 60-90 s, titles like "Planner implementation coordination", "Solver approach and validation") has 52, 133, 98 and 36 posts and 12 authors in every run. All other threads have 1-5 posts (shop2 STH 1: `t3` "Shared solve.py ownership/status" has 54, a second big thread). 6 of 20 threads got no reply (`t3`/`t4` planning STH 0; `t2` planning STH 1; `t5`-`t7` shop2 STH 1) and several are one-line validation reports ("Validation results for SGS baseline", "Validation report", "Independent planner.py review").
* Following: threads touched per agent (read or reply) 2-5 and 1-2 in planning, 3-6 and 3-7 in shop2. So nearly every agent follows `t1` and a handful of others; routing by thread did not reduce what each agent receives.
* Duplicate effort: competing whole-file rewrites over another agent's version (different author, <0.25 similarity): STT 1+1 (planning), 3+1 (shop2) = 6; STH 1+0 (planning, STH 0 unreliable), 3+6 (shop2) = 10 (section 3). Threads did not reduce duplicate solver writing; the worst case (6 whole-file writes in 90 s) is STH shop2 rep 1.
* Score effect: shop2 STH 0.464 vs STT 0.636 comes from the finals' algorithms (STT: portfolio of heuristics plus a dispatch candidate kept "only if lower"; STH: single heap insertion SGS, 800 trials, 0.451; permutation SGS/SA, 0.477), not from a visible coordination difference. At k=2 this is not separable from noise. STH also spent 123 s and 92 s with a crashing shared `solve.py` (section 3), STT 0 s.

## 3. Ownership and integration

Single-file deliverables (`planner.py`, `solve.py`), so there are no orphaned modules in the graded entry point. Side files left in `workspace/`: `validate_local.py` (planning STT 0), `check_tmp.py` (planning STH 1); everything else was written under `/tmp` (up to 111 bash commands touch `/tmp` per run, 8 `write`/`edit` calls to absolute `/tmp` paths in shop2 STT 0), despite the briefing saying "stay inside it".

| run | writers of deliverable | whole-file `write`s (applied) | applied edits | failed edits (stale `oldText`) | write-guard refusals | competing full rewrites over someone else's version | last writer |
|---|---:|---:|---:|---:|---:|---:|---|
| planning C1T 0 / 1 | 1 / 1 | 1 / 1 | 11 / 18 | 0 / 3 (own typos) | n/a | 0 / 0 | wren |
| planning STT 0 | 7 (finch 8, dunlin 7, wren 6, linnet 4, crane 4, tern 1) | 2 | 29 (15 failed) | 15 | 0 | 1 | crane |
| planning STT 1 | 3 (wren 14, plover 2, crane 2) | 2 | 16 | 2 | 0 | 1 | wren |
| planning STH 0 | 3 (finch 11, wren 4, linnet 2) | 2 | 15 | 4 | 1 | 1 | finch |
| planning STH 1 | 4 (finch 12, crane 5, wren 1, dunlin 1) | 1 | 18 | 4+2 | 0 | 0 | finch |
| shop2 STT 0 | 5 | 4 | 6 | 2 | 1 | 3 | linnet |
| shop2 STT 1 | 3 | 2 | 7 | 2 | 0 | 1 | finch |
| shop2 STH 0 | 5 (+2 side files) | 4 | 16 | 9 | 0 | 3 | robin |
| shop2 STH 1 | 6 | 7 | 5 | 2 | 0 | 6 | swift |

(C1T planning failed edits counted from the replay; swarm failed edits and refusals counted from `isError` tool results in `<agent>.messages.json`, "Could not find the exact text" / "write replaces the whole file".)

* **Spontaneous single-owner pattern** [Q]: planning STT 0, `events.jsonl` 15:54:15 finch: "I will implement planner.py core solver unless another agent already owns it"; then six agents post "won't edit planner.py since finch owns core" within 30 s (lark 54:29, swift 54:36, tern 54:42, heron 54:54, crane 55:02, swift 55:04). Posts matching ownership/no-edit/standby: 40, 32, 8, 24 (STT); 11, 15, 53, 33 (STH) out of 175/164/97/76 and 62/134/140/97. Validation/review posts: 42-85 per STT run.
* **But the owner did not take the reviewers' warnings** [Q]: planning STT 1 (9e697046), plover: "It has dynamic MRV only N<=35; for larger sizes it uses static order, risky. I defer edits to wren. Fallback still can pick incompatible choices[0], so if no solution must not claim feasible". That is exactly the failure the grader measures (infeasible fallback on large instances). Reviewers defer edits to the owner; the owner works through a list one edit at a time (wren 14 edits over 11 min).
* **Races on the shared file** [Q]: shop2 STT 0 (9d9938d8): `write` by robin 16:17:50, lark 16:17:52, finch 16:17:53, each a full rewrite replacing the previous (similarity 0.08-0.20). Lark's version scored 0.63, finch's replacement 0.40 one second later; 0.63 only returns at 16:20:22 (2.5 min). kite 16:18:09: "Correction: output was concurrently overwritten / stale while validating." Shop2 STH 1 (37116428): six full rewrites between 17:17:44 and 17:19:46 by robin, kite, swift, heron, finch, swift; dunlin: "File changed during my initial run (SyntaxError transient)"; crane at 17:19:13 measured "large cost 145,657" (worse than naive 74,963) on a transient version. I confirmed two intermediate versions crash (`SyntaxError: no binding for nonlocal 'cal'`, `ValueError: too many values to unpack`).
* **Time with an unusable shared file (score <= 0.05)** [V]: shop2 STH 0 123 s, shop2 STH 1 92 s, planning STT 0 15 s, planning STT 1 8 s; none in shop2 STT, planning STH 1.
* **Cap lottery** [V]: planning STT 0 ended on the 12M cap at 16:00:05. Versions at 15:59:35-15:59:50 scored 0.35 (kite at 16:00:01: "npm smoke likely fails on all successful plans with the new TypeError"); crane's fix at 15:59:51 restored 0.48, 14 s before the abort. The graded state at a token cap is whatever the shared file holds at that moment.
* No conflict markers in any workspace or event log; `branches` is off.

## 4. Stopping

Why each agent stopped (`scripts/traces.mjs`, plus `done` events):

| run | end | done count | when |
|---|---|---:|---|
| planning STT 0 | cap at 364 s | 2 (swift, dunlin at 314-316 s) | 10 agents were mid-work, `last text` empty |
| planning STT 1 | all done | 12 | 9 done at 277-382 s, last three at 684-806 s |
| planning STH 0 | all done | 12 | 10 at 225-269 s, finch last at 706 s |
| planning STH 1 | cap at 518 s | 8 | first at 74 s (tern) |
| shop2 STT 0 / 1 | all done | 12 / 12 | 129-502 s / 169-320 s |
| shop2 STH 0 / 1 | all done | 12 / 12 | 298-449 s / 271-400 s |
| C1T (all 4) | done | 1 | 90-666 s, 11-52 calls |

* Done reasons are nearly identical across agents ("independently validated ... zero violations on H01-H22 ... npm run test passes"). They refer to the 16-session example (planning) or the two provided instances (shop2) and to the version each agent last read.
* **Done before the last edit** [V]: planning STT 1 10 of 12; planning STH 1 6 of 8; shop2 STT 0 11 of 12; shop2 STT 1 9 of 12; shop2 STH 0 7 of 12; shop2 STH 1 4 of 12; planning STT 0 2 of 2. (Planning STH 0 not computable.) In planning STT 1 the nine early finishers declared the planner done at 4.6-6.4 minutes; wren kept editing until 12.6 minutes.
* **Tokens-left line and clock** [V on assistant text, thinking summaries, board posts and done reasons; thinking is only available as summaries]: regex `tokens? left|token budget|tokens in the|shared budget|minutes? left|before the timeout|budget shared|12M|running low|burn` over all `*.messages.json` assistant blocks (excluding tool calls to bash/edit/write/read): 0 hits in 10 of 12 runs; 2 unrelated hits ("burns 7.1s in the first broken SA loop", "example burns the full budget" about solver run time). Nobody reacted to the 12M countdown, which is why planning STT 0 spent 12M in 6 minutes: 12 agents x ~45 calls x ~20k tokens per call.
* The cap and the clock are not what stopped anybody except the three cap runs; the others stopped on their own judgement, as in C1T.

## 5. Did anyone compare quality against an alternative before done? (shop2)

* **Premise correction (claim 10):** the blind shop2 contract has no naive baseline text. The grader's `model.naive` (Giffler-Thompson, WSPT, no backfilling) is hidden. Agents could only compare candidates with each other, or with the two provided instances' own costs.
* **C1T:** one `solve.py` written in one `write`, run once on each example (5.9-7.5 s), cost computed once per instance (e.g. rep 0: 12,542 and 68,502; rep 1: 13,455 and 68,033), then `done` after 11-13 calls, 90-106 s, 59-70k tokens. No alternative was tried. Hidden score 0.565 / 0.547 (per instance: 0.715, 0.522, 0.536, 0.450 averaged).
* **Swarm:** every swarm shop2 run had agents benchmarking alternatives in private files or `/tmp` and posting costs: posts with >=2 cost numbers and a comparison word: 36 (STT 0, 11 distinct authors), 13 (STT 1, 8 authors), 19 (STH 0, 9), 19 (STH 1, 9). Example [Q] shop2 STT 1 (c2362101): linnet "op-level ready-operation SGS benchmark ... large one-pass costs: due/weight 70,208; ... versus current 67,775"; wren "ready-op list SGS ... large 65718 (current ... 67775)", finch integrated it as "a separate feasible candidate, returning it only if lower than the job-permutation search" (large 67,775 -> 65,718, hidden score of that version 0.42 -> 0.63 at 15:22). That is the only mechanism by which the swarm beat C1T on shop2: a portfolio with keep-the-best.
* Hidden per-instance scores (mean of 2 runs): C1T 0.715 / 0.522 / 0.536 / 0.450 (j45m10 / j60m12 / j70m12 / j85m15); STT 0.659 / 0.676 / 0.631 / 0.579; STH 0.536 / 0.483 / 0.398 / 0.439. STT's advantage is on the three larger instances (+0.15, +0.10, +0.13); on the small one C1T is ahead.
* In STH both runs spent the middle of the run on a broken shared `solve.py` and their finals are single-algorithm (heap insertion SGS, or permutation SGS/SA).
* No agent ever compared against anything the task defines as bad (nothing was given). Side test U (single agents, 35-130 s, sometimes worse than naive) is consistent: stopping is the agent's judgement of "finished", and in the swarm the judgement is shared by 11 validators who check feasibility and runtime, not cost relative to an alternative, except for the few challengers above.

## 6. Hypotheses (falsifiable, rules respected)

None assigns roles, plans, or uses a task signal; each is implementable as a new profile or a new default-off lever.

**H1. Diverge first: private full attempts, then merge by measured cost.** Evidence: final planning score tracks algorithm family (SA+conflict repair 0.65, heavy local search 0.60, backtracking 0.33-0.48 in every arm); architecture is fixed by the first 1-2 full writes (70-100 s), and 7-11 agents then patch one design; planning STT 0's first usable version (0.454) came at 72 s and 10M tokens bought +0.025. Variant: n=4-6, each agent builds its own solver in a private branch/copy (existing `branches: "optional"` or the earlier H2 in `plan.md` line ~1696), posts one line with its approach, and a later shared step lets anyone measure all candidates on instances they generate themselves and promote one. Falsifier: on planning and shop2 (k>=3), best-of-n final >= STT by +0.05 on both tasks at <= half STT's tokens; refuted if the promoted file is no better than the median private attempt.

**H2. n=12 is ~3x oversized for these tasks: n=4 with staggered entry matches n=12.** Evidence: STT runs spend 8.4M vs C1T 0.5M with 8-9 agents only reviewing (94-124 reads of `planner.py` per run vs 2-7); plateau reached at 16-41% of the run in 3 of 7 runs; STT mean (0.545) is within noise of C1T (0.524). Prediction: n=4 stagger (the same profile otherwise) scores within 0.03 of STT's two-task mean at <= 35% of its tokens. This does not beat C1T by itself, so treat as a cost lever that makes any later swarm lever testable at lower budget.

**H3. The weak point is verification scope: nobody builds a realistic harder instance.** Evidence: all swarm validation was on the 16-session example; hard families fail on the 36-80 session instances in all arms (section 1); the stress instances that did get built (swift in STT 1, finch in STH 0, robin in STH 1) used trivial 1-slot sessions and checked runtime only; reviewers named the failure in words (plover, section 3) but no one reproduced it. Lever (default off, oracle-free, works without tests): a neutral line in the briefing "real inputs are larger and tighter than any example you were given; before you stop, make an input that is, run your work on it, and check the result with your own tooling" (a norm, not a role). Falsifier: STT + this line raises the feasible-family count on the large hidden planning instances (e.g. mean H-families passed on the 3 largest, now 11-14 of 22) by >= 3 families, and does not lower shop2. Caveat: round 11 found generic engineering norms undecided for a single agent, so test it on one agent (C1T) first, it is cheap.

**H4. Stale-done and shared-file instability: make `done` and writes depend on what the agent last saw.** Evidence: in 6/8 runs most agents called `done` before the last edit (shop2 STT 0: 11 of 12), 15 stale-edit failures in one run, 6-10 competing whole-file rewrites per run, 92-123 s of a crashing shared file in both STH shop2 runs, and a cap-timing lottery (planning STT 0, 14 s). Levers already in code, default off: `staleGuard` (refuse a write onto a file that changed since the agent last read it), plus a new `done` refusal "files you read changed after your last read of them". Falsifier: with both on, whole-file overwrites over other authors fall to ~0 and broken-file time to < 20 s per run with scores no lower than STT's by more than 0.03. Caution: in this data the *final* file was already best in 7/7, so the expected gain on the grade is small; its value is variance at a cap stop.

**H5. A challenger norm: spend validator capacity on an independent alternative, kept only if cheaper.** Evidence: the only quality gains in shop2 came when one agent benchmarked a second algorithm in a private file and the owner kept it as a "return only if lower" candidate (STT 1: 0.42 -> 0.63; STT 0 lark's portfolio 0.63 within 83 s); 42-85 validation posts per STT run against 3-5 independent-alternative benchmarks; STT beats C1T by +0.08 on shop2 mainly on the larger instances where the portfolio helped. Lever: a briefing sentence that anyone may offer an alternative implementation as a candidate and the shared deliverable keeps the better measured one (selection by task-defined cost, not by a check). Falsifier: STT + sentence has >= 2 posted alternative-vs-current cost comparisons per run on shop2 (observed 2-3 in STT) rising to >= 5, with shop2 mean >= STT + 0.05; refuted if comparisons rise but score does not. For planning the same needs H3's harder instance.

**Which first?** H3 and H5 are single-line, default-off, cheap to test with C1T and STT; H2 reduces spend; H1 needs the most new machinery (and the branch tests in round 15 were mixed: BR 0.534, BO 0.122 on the same tasks); H4 is mostly about stability.

## Method and caveats (open doubts)

* Replay assumptions: `edit` calls apply atomically, each `oldText` must match exactly once; bash modifications of the deliverable are ignored (planning STH 0 has 4 such commands and its replay is unreliable; every other run's replayed final equals the graded file or, for planning STT 1, STH 1, shop2 runs, scores within 0.01 of the grader's record).
* Intermediate grades come from the real grader code but load-dependent solvers (planning solver uses ~15 s deadlines; shop2 ~5-7 s) make single scores noisy by about +-0.03; shop2 was evaluated one at a time, planning two or three at a time with load 5-8.
* k=2 per arm and one hour of runs: STT vs STH on shop2 (0.636 vs 0.464) is explained by which algorithm the swarm landed on; I found no transcript evidence that threads caused it.
* "Mentions of the tokens line" cover only visible text, posts, done reasons and thinking *summaries*.
* Duplicate efforts were counted by whole-file rewrites and by posts of the form "I will implement ..." (planning STT 0 first minute: finch and crane both claim the core, heron: "I see both finch and crane claiming core implementation"), not by semantic similarity of the solvers.
* C1T was graded by replay only for planning (shop2 C1T has a single version); C1T planning rep 1's last version scores 0.643 vs 0.650 graded, load noise.

## Appendix A: replay script (`runs.py` + `replay.py`)

```python
import json,os
R='../swarmtest/runs/'
C={'planning':{'C1T':['20261004T154422Z-5d32faf7','20261004T163242Z-c89a315a'],'STT':['20261004T155400Z-ec715fbc','20261004T164501Z-9e697046'],'STH':['20261004T160123Z-f88d7d38','20261004T165922Z-25fef1a5']},
'shop2':{'C1T':['20261004T161433Z-b8573bf5','20261004T170924Z-fd773a08'],'STT':['20261004T161628Z-9d9938d8','20261004T171102Z-c2362101'],'STH':['20261004T162502Z-2d378749','20261004T171634Z-37116428']}}
def runs():
    for t,a in C.items():
        for arm,l in a.items():
            for i,c in enumerate(l):
                cd=R+c
                # find run with agents (swarm campaigns have 2 runs?)
                for r in sorted(os.listdir(cd)):
                    if r.startswith('run-'):
                        p=cd+'/'+r
                        rec=json.load(open(p+'/record.json'))
                        yield t,arm,i,c,p,rec

```

```python
import sys,json,os,re,collections
sys.path.insert(0,'tmp/claude-r16a-traces')
from runs import *
def rec_task(p):
    return json.load(open(p+'/record.json'))['task']
def replay(p,fname):
    """return list of versions (t,agent,op,text,ok)"""
    ev=[json.loads(l) for l in open(p+'/state/murmur/events.jsonl')]
    ws=p+'/workspace/'
    tk='../swarmtest/staging/'+rec_task(p)+'/workspace/'+fname
    cur=open(tk).read() if os.path.exists(tk) else None; vers=[]; bashmods=[]
    for e in ev:
        if e['type']!='tool': continue
        a=e['args']
        if e['tool']=='bash' and fname in a.get('command','') and re.search(r"sed -i|>\s*"+re.escape(fname)+r"|open\(.*[\"']w|perl -pi|cat >|tee|mv |cp ",a['command']):
            bashmods.append((e['t'],e['agent'],a['command'][:100]))
        if e['tool'] in('write','edit') and a.get('path')==fname:
            if e['tool']=='write':
                cur=a['content']; vers.append((e['t'],e['agent'],'write',cur,True))
            else:
                ok=cur is not None
                if ok:
                    new=cur; good=True
                    for ed in a['edits']:
                        if new.count(ed['oldText'])==1: new=new.replace(ed['oldText'],ed['newText'],1)
                        else: good=False
                    ok=good
                    if good: cur=new
                vers.append((e['t'],e['agent'],'edit',cur,ok))
    return ev,vers,bashmods
if __name__=='__main__':
    for t,arm,i,c,p,rec in runs():
        f='planner.py' if t=='planning' else 'solve.py'
        ev,vers,bm=replay(p,f)
        fin=open(p+'/workspace/'+f).read() if os.path.exists(p+'/workspace/'+f) else None
        last=vers[-1][3] if vers else None
        print(t,arm,i,'versions',len(vers),'badedit',sum(1 for v in vers if not v[4]),'final==replay',fin==last,'bashmods',len(bm),'finallines',len(fin.splitlines()) if fin else None,'lastwriter',vers[-1][1] if vers else None)

```

## Appendix B: version grader (`evalver.py`)

Imports the task's own `grader.py` from `../swarmtest/staging/<task>/` (no changes), writes each version into a private directory and grades it. Run with `nice -n 15`, `W=<workers>`, `ONE=1` for the single-agent runs.

```python
import sys,json,os,importlib.util,tempfile,time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0,'tmp/claude-r16a-traces')
from replay import *
ST=Path('../swarmtest/staging').resolve()
def load(task):
    d=ST/task
    sys.path.insert(0,str(d/'holdout'))
    for m in ('cases','evaluator','generator','model'):
        sys.modules.pop(m,None)
    spec=importlib.util.spec_from_file_location('g_'+task,d/'grader.py'); g=importlib.util.module_from_spec(spec); spec.loader.exec_module(g)
    sys.path.pop(0); return g
OUT=Path('tmp/claude-r16a-traces/ver').resolve(); OUT.mkdir(exist_ok=True)
task=sys.argv[1]
f='planner.py' if task.startswith('constrained') else 'solve.py'
g=load(task)
scratch=Path(tempfile.mkdtemp(prefix='s-',dir=OUT))
if task.startswith('constrained'):
    cases=g.cases()
    refs=[g.reference_objective(c,scratch) for c in cases] if not (OUT/'refs.json').exists() else json.load(open(OUT/'refs.json'))
    json.dump(refs,open(OUT/'refs.json','w'))
    def score(ws):
        ch=[]
        for c,r in zip(cases,refs): ch+=g.grade_case(c,scratch,r,ws)
        return sum(x['weight'] for x in ch if x['passed'])/sum(x['weight'] for x in ch), ch
else:
    cases=g.generator.hidden()
    def score(ws):
        ch=[g.grade_case(c,ws,scratch) for c in cases]
        return sum(x['weight']*x['score'] for x in ch)/sum(x['weight'] for x in ch), ch
jobs=[]
for t,arm,i,c,p,rec in runs():
    if rec['task']!=task or ((rec['agents']==1)!=(os.environ.get('ONE')=='1')): continue
    ev,v,bm=replay(p,f)
    seen=set()
    for k,x in enumerate(v):
        if x[4] and x[3] not in seen:
            seen.add(x[3]); jobs.append((arm,i,k,x))
def run(j):
    arm,i,k,x=j
    ws=OUT/f'{task[:6]}-{arm}{i}-{k}'; ws.mkdir(exist_ok=True); (ws/f).write_text(x[3])
    s,ch=score(ws)
    return dict(arm=arm,rep=i,k=k,t=x[0],agent=x[1],op=x[2],score=round(s,4),fail=[c['name'] for c in ch if not c['passed'] and ':H' in c['name']][:0])
res=[]
with ThreadPoolExecutor(int(os.environ.get('W','3'))) as ex:
    for r in ex.map(run,jobs):
        res.append(r); print(json.dumps(r),flush=True)
json.dump(res,open(OUT/f'res-{task}{os.environ.get('ONE','')}.json','w'))

```
