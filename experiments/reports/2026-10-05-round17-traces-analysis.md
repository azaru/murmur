# Model output (subagent analysis of round 17 transcripts), 2026-10-05

**Checked by hand in the main session (to be filled in after the report):**

- (empty)

**Checked by hand in the main session (2026-10-05):**
- ✓ AUD totals: 125 posts and 35 revivals over the six runs (`events.jsonl` counts: 28+22+28+17+5+25 posts, 9+9+5+2+3+7 revivals).
- ✓ C1TR shop2 rep 2 (`20261004T220828Z-b8f2642b`): 4 write/edit calls on `solve.py` by the first instance and 0 by each relay instance, so its 0.491 came from the first instance.
- ✓ C1TR planning rep 2 (`20261004T215905Z-1c6ea6aa`): one `done` and one `relay`, then `run_end` with no second `done` (quiescent).
- ✓ Relay instances read `NOTES-wren.md` 11 times across the six C1TR runs; the file never existed.
- ✓ The shop2 workspace provides `instance_large.json` beside `instance.json`.
- Not re-run: the version replay and per-version grading (the relay and audit effects, the planning family counts, the shop2 cost ranking).

**Status (subagent's own label): not yet checked by hand.** The claims below were computed by scripts or read from transcripts by a subagent; the "Key claims" list gives the file or command for each so they can be verified. Labels: **[V]** = computed by a script from run files; **[R]** = read in a transcript or post (excerpt-level, not exhaustive); **[H]** = keyword heuristic (counts approximate).

Scope: the 18 campaigns of round 17 (`RUN=../swarmtest/runs/<campaign>/run-0001`). Arms: C1T (one agent with clock and tokens-left line), C1TR (C1T plus 2 relays: fresh instance after each `done`), AUD (3 equal agents, post-only board, each enters when the previous ends its turn, a post revives an agent that called `done`, up to 3 revivals each). Tasks: planning (`constrained_planning_hard_blind`) and shop2 (`opt_shop2_blind`). The campaign ids are in the task message and in Appendix A. Numbering of relay transcripts: `wren.1.messages.json` is the **first** instance, `wren.2` the second, `wren.messages.json` the last one (`src/swarm.ts` lines 335-337). In this report the instances are called wren (first), wren.1 (second), wren.2 (third), as in `events.jsonl` (`relay` events).

## Key claims (numbered, for hand verification)

1. **Relays changed the graded final in 1 of 6 runs (planning rep 1, +0.111); in the other 5 the final equals the first instance's final within 0.004, although relay instances edited the file in planning reps 0 and 2.** Score of the deliverable when the first instance called `done` against the final: planning C1TR rep 0 0.416 to 0.416 (second instance 0.47, third back to 0.42), rep 1 0.372 to 0.483 (+0.111, second instance), rep 2 0.372 to 0.372; shop2 rep 0 0.118 to 0.114, rep 1 0.000 to 0.000, rep 2 0.491 to 0.491. [V] Verify: Section 1 tables; `python3 evalver.py <task>` (Appendix B) over the versions replayed by `replay.py` (Appendix A); the replayed final equals the graded `workspace/` file in all 18 runs (`final==last True` in the check in Appendix A).
2. **C1TR's shop2 margin over C1T (0.202 against 0.000) is first-instance luck, not a relay effect.** The 0.491 run reached it at minute 3 inside the first instance (version 0.159 at 22:09:36, 0.491 at 22:11:05, `shop2 C1TR rep 2` in the series); its relay instances made **0** edits of `solve.py` (`feat.py` table: wren.1, wren.2 have no `edit_deliv`). The other two C1TR shop2 runs score 0.114 and 0.000 and their relays changed the file once (a runtime headroom edit, score 0.118 to 0.114). [V]
3. **In shop2 the hidden score is above 0 exactly when the final program beats the grader's baseline on the *provided* instances, and the provided `instance_large.json` already ranks all 9 runs correctly.** Cost of each final `solve.py` on `workspace/instance_large.json` (naive Giffler-Thompson/WSPT cost 74,090, computed with `holdout/model.py:56`): 64,890 (hidden 0.592), 72,222 (0.491), 74,571 (0.114), then 76,185 / 78,821 / 87,817 / 103,195 / 268,151 / 557,981 (all hidden 0.000). [V] Table in Section 3; `grep -ic "naive\|baseline" ../swarmtest/staging/opt_shop2_blind/workspace/PROBLEM.md` returns 0, so no agent was told that a baseline exists.
4. **Every shop2 zero is a valid schedule that costs about the baseline or more; none is invalid.** Hidden cost/naive per instance: C1T 1 1.06/1.00/1.13/1.09, AUD 0 1.11-1.19, AUD 2 1.05-1.20 (near-naive); C1T 0 2.27-3.15 and C1TR 1 2.01-7.03 (far worse). [V] `record.json` -> `grade.checks[].detail`.
5. **The later contexts verified validity and timing and almost never judged quality.** C1TR 1 (shop2): both relay instances quoted "cost 557981" on the large example (7.5x naive) in their `done` reasons and still declared it verified (`events.jsonl`, `done` events of campaign 20261004T215030Z-332901af). 0 of 6 shop2 relay instances tried to improve quality (their done reasons report verification, or a runtime-headroom edit); 3 of 3 first auditors in shop2 AUD (finch) opened with a quality attempt ("try improving it via machine-sequence local search", "Working on quality improvements", "Looking for quality improvement options", `python3 posts.py shop2`). [R]
6. **No context mentions the clock or the tokens-left line.** Regex over assistant text, thinking summaries, `post` and `done` arguments of all 18 runs finds only solver-internal "time budget/timeout/iteration budget" (never "minutes left", "tokens left", "clock"). [V] Appendix C, check 1.
7. **Only 1 of 18 runs built a production-size planning input, and it was a loose one; no relay instance built anything larger than the 16-session example.** AUD planning rep 1, finch (21:55:00 UTC): 90 sessions, 6 days, 10 rooms, 1-slot sessions, unique speakers, no windows; the planner took 56.6 s (limit 20 s); finch and robin fixed it to about 5 s. All 9 final planners ran inside the limit on all 5 hidden instances (`record.json`: `:run` checks passed in 9/9 runs), so the fix was real but grade-neutral; the pre-fix version graded at 21:51:31 (0.442) also passed `:run` on all 5 hidden instances. [V] for the run checks, [R] for the stress test (`finch.messages.json`, msg 63 of campaign 20261004T214054Z-20922723). In shop2 every context, C1T included, ran the provided `instance_large.json` (the task ships it), so that is not a discriminator; AUD fuzzers (100 random 12-job instances, AUD 0 wren; 25 cases, AUD 0 finch) were small.
8. **Planning scores are the number of hard-constraint families the (infeasible) fallback happens to satisfy on the larger hidden instances.** In all 9 planning runs `large` and `xl_dense` fail 8-12 of 22 hard families and no quality tier; only `small` (and in 2 runs `medium`, in 1 `crowded`) is ever fully feasible. [V] `record.json` -> `grade.checks` (table in Section 1). The scores 0.35-0.57 are inside one agent's own spread (C1T alone: 0.354, 0.498, 0.574).
9. **AUD planning rep 0's author lost its own best version before anyone audited it.** wren's graded versions in its first turn: 0.335 (first write), 0.646-0.649 (21:14:05-21:14:19, 5.5 min), then 0.55, 0.335, 0.40, 0.335 ... and 0.459 at its first `done` (21:19:30). Auditors then took it to 0.571 (robin's `best_snapshot` fallback edit at 21:26:31: 0.473 to 0.550; finch's H13 pruning at 21:30:50: 0.571). Final 0.571 is below the early peak 0.649. [V] `series` below.
10. **The one run where a reachable author clearly used an auditor's finding is shop2 AUD rep 1, and it is two steps of about +0.07-0.08, one of them the author's own tuning.** v6 0.450 (7.4 min) to v10 0.518 (9.5 min): wren integrates finch's "top-3 randomized dispatch, 24 trials" (`'top_k'`/`draw_rng` appear in v10, not in v6); robin's index-order bug fix (v14 to v15) moved nothing (0.514 to 0.508); v15 to v16 0.508 to 0.589 (12.6 min) is wren's SA temperature/iteration edit (iteration cap 5000 to 12000, restart period 500 to 900), not finch's idea. The run's first draft already scored 0.503 (0.8 min). [V] versions and scores, [R] diffs (`difflib` between replayed versions, Appendix A).
11. **AUD auditors mostly edit the code themselves rather than post to the author.** Edits of the deliverable by agents other than wren: planning 11/37, 10/26, 11/18; shop2 11/13 (all finch, only tiny local-search gains), 1/19, 0/4. Of 35 revival turns, 22 included an edit of the deliverable and 13 did not (`revive.py` output). Revived turns are 53-87% of AUD tokens (`spend.py`). [V]
12. **The quiescent C1TR planning rep 2 is a missing `done` call, not a decision to stop.** The second instance (wren.1) fixed the example (search timeout 15 s to 0.3 s), ran its own checker (violations 0), and ended its turn with text ("feasibility on larger or tighter instances is not guaranteed") without calling `done`; relays start only after a `done` (`src/swarm.ts:228`), so the run ended `quiescent` at 9.0 min with 51 min and 11.5M tokens left. [R] `wren.messages.json` of campaign 20261004T215905Z-1c6ea6aa, last message; `result.json` agents[0].done is false.
13. **A negative verdict still passes the seat.** C1TR planning rep 0, second instance: `done` reason "the required feasibility goal is not met" (example falls back to an infeasible plan with room overlaps); the harness relayed anyway and the third instance spent 20 min and 1.6M tokens (66 calls) making the example feasible, partly by narrowing the restart seeds to `(19,)` (the seed whose debug line it had just printed) at 21:31 and then listing 19 first (`for seed in (19, 731, ...)`, `workspace/planner.py` line 128), an example-fitted order; inferred from the replayed versions and the debug output, not stated by the agent. Graded 0.416, below its predecessor's 0.470. [R]
14. **The relay handoff is only the previous `done` reason.** 11 of 11 reads of `NOTES-wren.md` by relay instances return ENOENT (nobody was told to write it except in the relay prompt itself, which says "if it wrote any"). [V] Appendix C, check 2.
15. **Spend:** AUD costs 4.2x (planning) and 11.1x (shop2) C1T's mean tokens; the three agents' first turns alone are 0.6-2.1M (planning) and 0.3-1.0M (shop2); the rest is revived turns, a post-`done` cycle that re-reads about 30k tokens of context per call. C1TR is 1.0x (planning) and 1.5x (shop2) C1T's mean tokens because 10 of 11 relay instances stop after 6-24 calls (the 11th, planning rep 0 third instance, used 66). [V] `ctx_table`, `spend.py`.

## 1. What each later context did, and what it did to the score

### 1.1 Contexts (all 18 runs)

| task | arm | rep | context | calls | tokens (incl. cache reads) | minutes (start-end) | edits of deliverable | graded run score |
|---|---|---:|---|---:|---:|---|---:|---:|
| planning | C1T | 0 | wren | 85 | 2,938,800 | 0.1-20.2 | 22 | 0.574 |
| planning | C1T | 1 | wren | 13 | 109,970 | 0.0-2.5 | 3 | 0.354 |
| planning | C1T | 2 | wren | 13 | 159,855 | 0.0-2.6 | 3 | 0.498 |
| planning | C1TR | 0 | wren | 29 | 411,849 | 0.1-5.7 | 12 | 0.416 |
| planning | C1TR | 0 | wren.1 | 18 | 161,755 | 5.8-9.3 | 2 | 0.416 |
| planning | C1TR | 0 | wren.2 | 66 | 1,641,935 | 9.4-29.9 | 24 | 0.416 |
| planning | C1TR | 1 | wren | 23 | 231,901 | 0.0-3.9 | 8 | 0.483 |
| planning | C1TR | 1 | wren.1 | 20 | 155,401 | 3.9-6.0 | 3 | 0.483 |
| planning | C1TR | 1 | wren.2 | 9 | 58,405 | 6.1-7.2 | 0 | 0.483 |
| planning | C1TR | 2 | wren | 25 | 287,560 | 0.1-5.0 | 10 | 0.372 |
| planning | C1TR | 2 | wren.1 | 24 | 264,620 | 5.1-9.0 | 6 | 0.372 |
| planning | AUD | 0 | wren | 106 | 3,579,779 | 0.0-20.5 | 26 | 0.571 |
| planning | AUD | 0 | finch | 61 | 1,540,884 | 11.4-23.6 | 7 | 0.571 |
| planning | AUD | 0 | robin | 44 | 1,156,476 | 13.6-22.3 | 4 | 0.571 |
| planning | AUD | 1 | wren | 66 | 1,820,471 | 0.0-13.4 | 16 | 0.442 |
| planning | AUD | 1 | finch | 55 | 1,424,014 | 8.7-21.4 | 8 | 0.442 |
| planning | AUD | 1 | robin | 44 | 1,094,176 | 12.0-21.2 | 2 | 0.442 |
| planning | AUD | 2 | wren | 27 | 544,163 | 0.0-4.1 | 7 | 0.483 |
| planning | AUD | 2 | finch | 55 | 1,477,371 | 1.8-11.0 | 7 | 0.483 |
| planning | AUD | 2 | robin | 42 | 865,884 | 4.4-10.8 | 4 | 0.483 |
| shop2 | C1T | 0 | wren | 20 | 218,936 | 0.0-2.7 | 3 | 0.000 |
| shop2 | C1T | 1 | wren | 13 | 82,067 | 0.1-2.3 | 2 | 0.000 |
| shop2 | C1T | 2 | wren | 20 | 225,721 | 0.0-2.6 | 4 | 0.000 |
| shop2 | C1TR | 0 | wren | 14 | 94,573 | 0.1-2.1 | 3 | 0.114 |
| shop2 | C1TR | 0 | wren.1 | 15 | 125,209 | 2.1-3.3 | 1 | 0.114 |
| shop2 | C1TR | 0 | wren.2 | 12 | 29,937 | 3.4-4.0 | 0 | 0.114 |
| shop2 | C1TR | 1 | wren | 18 | 150,180 | 0.0-2.9 | 5 | 0.000 |
| shop2 | C1TR | 1 | wren.1 | 12 | 41,705 | 2.9-3.8 | 1 | 0.000 |
| shop2 | C1TR | 1 | wren.2 | 10 | 26,524 | 3.9-4.5 | 0 | 0.000 |
| shop2 | C1TR | 2 | wren | 19 | 252,847 | 0.1-3.0 | 4 | 0.491 |
| shop2 | C1TR | 2 | wren.1 | 11 | 36,192 | 3.1-3.9 | 0 | 0.491 |
| shop2 | C1TR | 2 | wren.2 | 6 | 16,449 | 3.9-4.5 | 0 | 0.491 |
| shop2 | AUD | 0 | wren | 45 | 621,146 | 0.0-8.3 | 2 | 0.000 |
| shop2 | AUD | 0 | finch | 78 | 1,572,407 | 2.6-17.1 | 11 | 0.000 |
| shop2 | AUD | 0 | robin | 27 | 291,974 | 6.0-15.7 | 0 | 0.000 |
| shop2 | AUD | 1 | wren | 67 | 1,539,316 | 0.0-14.3 | 18 | 0.592 |
| shop2 | AUD | 1 | finch | 60 | 1,110,306 | 1.7-14.3 | 0 | 0.592 |
| shop2 | AUD | 1 | robin | 15 | 142,885 | 11.6-14.2 | 1 | 0.592 |
| shop2 | AUD | 2 | wren | 27 | 362,461 | 0.0-6.1 | 4 | 0.000 |
| shop2 | AUD | 2 | finch | 22 | 185,619 | 2.0-5.7 | 0 | 0.000 |
| shop2 | AUD | 2 | robin | 10 | 50,511 | 5.0-5.7 | 0 | 0.000 |


Tokens include cache reads (the same measure as `plan.md`: C1T planning mean 1.07M, AUD 4.50M). [V]

### 1.2 Graded versions in time order

Method as in the round 16 stage A report (Appendix A and B): every `write`/`edit` of `planner.py`/`solve.py` is replayed from `events.jsonl`; selected versions (first write, the last version of every context or agent change, the final, and up to four evenly spaced others; for AUD planning rep 0 every version between 5.5 and 22 min) are graded with the task's own `grader.py` and hidden instances, unchanged, under `nice -n 15`, three at a time. Abbreviations: wr = wren (first instance in C1TR), wr.1 / wr.2 = second / third instance, fi = finch, ro = robin. **Noise:** load was 8-15 during the grading because of an unrelated VM using about 6.5 cores, so single scores carry about +-0.03 (planning solver uses 15 s deadlines, shop2 5-7 s). The replayed final equals the swarmtest score within 0.01 in every run I compared (planning: 0.5714/0.571, 0.4420/0.442, 0.4831/0.483, 0.574, 0.416, 0.483, 0.372; shop2 AUD 1 0.584 against 0.592).

* planning C1T rep 0: 21:09:34 wr 0.07 | 21:12:37 wr 0.07 | 21:15:43 wr 0.18 | 21:17:20 wr 0.18 | 21:19:08 wr 0.00 | 21:19:14 wr 0.18 | 21:20:49 wr 0.57 | 21:25:13 wr 0.45 | 21:26:57 wr 0.57 | 21:28:15 wr 0.57
* planning C1T rep 1: 21:38:08 wr 0.00 | 21:39:03 wr 0.35
* planning C1T rep 2: 21:56:26 wr 0.00 | 21:57:40 wr 0.50
* planning C1TR rep 0: 21:09:34 wr 0.45 | 21:12:55 wr 0.42 | 21:16:07 wr.1 0.47 | 21:18:59 wr.2 0.47 | 21:30:51 wr.2 0.42 | 21:37:53 wr.2 0.42
* planning C1TR rep 1: 21:40:53 wr 0.00 | 21:41:55 wr 0.37 | 21:42:57 wr 0.37 | 21:43:39 wr 0.37 | 21:44:20 wr.1 0.37 | 21:45:42 wr.1 0.48
* planning C1TR rep 2: 22:00:19 wr 0.42 | 22:01:55 wr 0.42 | 22:03:16 wr 0.37 | 22:05:43 wr.1 0.37 | 22:06:09 wr.1 0.43 | 22:07:54 wr.1 0.37
* planning AUD rep 0: 21:09:45 wr 0.34 | 21:14:05 wr 0.65 | 21:14:19 wr 0.65 | 21:14:31 wr 0.64 | 21:15:01 wr 0.55 | 21:15:33 wr 0.34 | 21:16:30 wr 0.34 | 21:17:22 wr 0.40 | 21:17:44 wr 0.34 | 21:18:21 wr 0.40 | 21:18:41 wr 0.34 | 21:19:02 wr 0.34 | 21:19:30 wr 0.46 | 21:21:22 fi 0.46 | 21:22:50 wr 0.26 | 21:22:56 wr 0.47 | 21:22:57 fi 0.47 | 21:24:27 ro 0.47 | 21:26:31 ro 0.55 | 21:26:50 fi 0.55 | 21:27:02 fi 0.55 | 21:27:42 wr 0.55 | 21:28:30 ro 0.55 | 21:30:16 ro 0.55 | 21:30:50 fi 0.57
* planning AUD rep 1: 21:42:04 wr 0.37 | 21:45:58 wr 0.44 | 21:50:23 fi 0.47 | 21:51:31 wr 0.44 | 21:57:03 fi 0.44 | 22:00:43 fi 0.44
* planning AUD rep 2: 22:04:29 wr 0.41 | 22:05:12 wr 0.46 | 22:08:23 fi 0.52 | 22:09:56 fi 0.43 | 22:12:14 ro 0.48
* shop2 C1T rep 0: 21:31:13 wr 0.00 | 21:32:25 wr 0.00
* shop2 C1T rep 1: 21:49:41 wr 0.01 | 21:50:31 wr 0.00
* shop2 C1T rep 2: 22:06:23 wr 0.00 | 22:07:57 wr 0.00
* shop2 C1TR rep 0: 21:33:42 wr 0.12 | 21:34:40 wr 0.12 | 21:35:45 wr.1 0.11
* shop2 C1TR rep 1: 21:51:27 wr 0.00 | 21:53:05 wr 0.00 | 21:54:02 wr.1 0.00
* shop2 C1TR rep 2: 22:09:36 wr 0.16 | 22:11:05 wr 0.49
* shop2 AUD rep 0: 21:34:53 wr 0.00 | 21:37:38 fi 0.00 | 21:39:40 fi 0.00 | 21:40:29 fi 0.00 | 21:40:43 wr 0.00 | 21:42:26 fi 0.00 | 21:46:47 fi 0.00 | 21:49:22 fi 0.00
* shop2 AUD rep 1: 21:51:55 wr 0.50 | 21:54:56 wr 0.48 | 21:58:27 wr 0.45 | 22:00:32 wr 0.52 | 22:01:44 wr 0.51 | 22:02:29 wr 0.51 | 22:02:54 ro 0.51 | 22:03:42 wr 0.59 | 22:05:14 wr 0.58
* shop2 AUD rep 2: 22:09:57 wr 0.00 | 22:12:59 wr 0.00


Milestones (graded version just before the event; the second and third columns after the first are only filled when that context/agent called `done`):

| task | arm | rep | first write | peak graded | state when the first agent/instance first called done | state when the 2nd context/agent first called done | state when the 3rd first called done | final (graded in swarmtest) |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| planning | C1T | 0 | 0.068 | 0.574 | 0.574 |  |  | 0.574 |
| planning | C1T | 1 | 0.000 | 0.353 | 0.353 |  |  | 0.354 |
| planning | C1T | 2 | 0.000 | 0.498 | 0.498 |  |  | 0.498 |
| planning | C1TR | 0 | 0.446 | 0.470 | 0.416 | 0.470 | 0.416 | 0.416 |
| planning | C1TR | 1 | 0.000 | 0.483 | 0.372 | 0.483 | 0.483 | 0.483 |
| planning | C1TR | 2 | 0.424 | 0.432 | 0.372 |  |  | 0.372 |
| planning | AUD | 0 | 0.335 | 0.649 | 0.459 | 0.459 | 0.473 | 0.571 |
| planning | AUD | 1 | 0.367 | 0.467 | 0.437 | 0.442 | 0.442 | 0.442 |
| planning | AUD | 2 | 0.414 | 0.518 | 0.460 | 0.460 | 0.518 | 0.483 |
| shop2 | C1T | 0 | 0.000 | 0.000 | 0.000 |  |  | 0.000 |
| shop2 | C1T | 1 | 0.006 | 0.006 | 0.000 |  |  | 0.000 |
| shop2 | C1T | 2 | 0.000 | 0.000 | 0.000 |  |  | 0.000 |
| shop2 | C1TR | 0 | 0.118 | 0.118 | 0.118 | 0.114 | 0.114 | 0.114 |
| shop2 | C1TR | 1 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| shop2 | C1TR | 2 | 0.159 | 0.491 | 0.491 | 0.491 | 0.491 | 0.491 |
| shop2 | AUD | 0 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| shop2 | AUD | 1 | 0.503 | 0.589 | 0.503 | 0.514 | 0.584 | 0.592 |
| shop2 | AUD | 2 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |


Reading, in time order:

* **C1TR relays, planning.** Rep 0: first instance 0.446 (first write) to 0.416; second instance 0.470 (MRV search; it says "goal not met"); third instance 20 min of work and ends at 0.416. Net effect of the two relays against the first instance's final: 0.000. Rep 1: second instance fixes empty/reversed windows (a clause of the contract that the first instance missed: `PROBLEM.md` line 27), reorders candidates and salvages deeper partial solutions: 0.372 to 0.483. Third instance: no edit. Rep 2: second instance makes the example feasible in 0.3 s instead of 15 s; the graded score does not move (0.372 to 0.372, transient 0.432). **Mean relay effect on planning: +0.037 (0.000, +0.111, 0.000).**
* **AUD, planning.** Against the author's state at its first `done`: rep 0 +0.112 (0.459 to 0.571), rep 1 +0.005 (0.437 to 0.442), rep 2 +0.023 (0.460 to 0.483; finch's edit at 22:08 had reached 0.518 and a later edit of its own fell to 0.435). **Mean audit effect: +0.047.** The same size as the relay effect, smaller than the spread between runs of one arm (0.35-0.57).
* **shop2.** C1TR: relays changed nothing (claim 2). AUD: only rep 1 is non-zero and it was non-zero from the first draft (claim 10); reps 0 and 2 stayed at 0.000 through every version. In rep 0 finch made 11 edits (adjacent-swap descent: sweeps 2 to 4 to 5 to 6, with cost on the large example 88,216 to 88,041 to 87,942 to 87,843 to 87,796 against naive 74,090) and wren and robin re-validated it through 9 revivals; nobody compared against anything outside the agents' own earlier version.

### 1.3 Behaviour of the later contexts (counts from `feat.py`, [H]; real defects from posts and done reasons, [R])

Columns: P = runs of the program (`python3 ... planner.py`/`solve.py`, `time`), S = own inline python scripts, V = scripts that look like a validator or checker, L = built an input larger than the contract's example sizes, E = edits of the deliverable.

| context | P | S | V | L | E | real defects found / what it did |
|---|---:|---:|---:|---|---:|---|
| planning C1TR 0 wren.1 | 3 | 4 | 2 | no | 2 | found that the example falls back to an infeasible plan (room overlaps) after 14-16 s; changed the search to dynamic MRV; reported "goal not met" |
| planning C1TR 0 wren.2 | 18 | 13 | 4 | no | 24 | same defect; 20 min of search rewrites, seeded restarts, local descent; example 0.7 s; checker: errors [] and objective 237 to 207 |
| planning C1TR 1 wren.1 | 2 | 5 | 3 | no | 3 | empty-window clause, candidate ordering, timeout salvage |
| planning C1TR 1 wren.2 | 0 | 4 | 1 | no | 0 | re-ran, example checker "errs []", removed `__pycache__` |
| planning C1TR 2 wren.1 | 6 | 4 | 2 | no | 6 | example search timed out at 15 s; made it 0.3 s; violations 0 |
| shop2 C1TR, 6 relay instances | 1-4 | 1-3 | 1-2 | the provided `instance_large.json` | 0-1 | validity and runtime only; one deadline-headroom edit twice; costs printed, never compared |
| planning AUD, finch (3 runs) | 2 / 13 / 7 | 7 / 16 / 8 | 5 / 9 / 6 | rep 1: 90 sessions | 7 / 8 / 7 | rep 0: empty-string chair id, deadline guards, rank-sort cap, fallback H13 filter; rep 1: empty windows, 56.6 s stress overrun, MRV probe cap (5.4 s); rep 2: coordinate-descent cutoff, empty windows |
| planning AUD, robin (3 runs) | 8 / 1 / 5 | 10 / 6 / 3 | 10 / 2 / 1 | rep 0: 1-session wide-domain probe | 4 / 2 / 4 | rep 0: best-depth snapshot fallback (+0.076), heapq domain ordering; rep 1: `max_concurrent == 0`, pairwise moves; rep 2: preferred-room empty string, MRV scan, candidate precompute |
| shop2 AUD, finch (3 runs) | 27 / 12 / 3 | 25 / 9 / 4 | 12 / 6 / 2 | no (own random cases, small) | 11 / 0 / 0 | rep 0: local-search sweeps; rep 1: private experiments (`dispatch_exp.py`, `d7.py`, `de2.py`) on seeds and top-k dispatch, posted to wren; rep 2: validity only |
| shop2 AUD, robin (3 runs) | 5 / 3 / 2 | 6 / 4 / 2 | 4 / 3 / 1 | no | 0 / 1 / 0 | rep 1: found that `dispatch()` appended starts in scheduling order instead of by operation index (a real bug in wren's integration); reps 0, 2 validity only |

Contrast between the arms that have the same instruction in content: nearly all of the 11 relay instances and the 12 auditor contexts ran the program and wrote their own checkers. The differences are (a) quality attempts (shop2: 0 of 6 relays against 3 of 3 first auditors, claim 5) and (b) the AUD briefing names the actions ("run the program, write and run your own tests against the spec, then fix what is wrong or missing yourself, or post what you found with the command output") while the relay prompt says "check the work against the spec yourself, fix what is wrong or missing, and call done only after verifying it". Fresh context is shared by both; peers, a board and the wording differ. The data cannot separate those (see H2).

## 2. AUD specifically (125 posts, 35 revivals)

### 2.1 Who wrote what

Edits of the deliverable by agent (wren / finch / robin), from `revive.py`: planning 26/7/4, 16/8/2, 7/7/4; shop2 2/11/0, 18/0/1, 4/0/0. The author is the main editor in 3 of 6 runs; in planning rep 2 and shop2 rep 0 the auditors made most of the edits.

### 2.2 Revivals

| run | revivals (wren, finch, robin) | revival turns with a deliverable edit | notes |
|---|---|---:|---|
| planning rep 0 | 3, 3, 3 (cap reached by all) | 8 of 9 | the run ends because every agent used its 3 revivals, not by convergence: the last edit (finch, 22.2 min) is followed by one `done` and nothing else |
| planning rep 1 | 3, 1, 1 | 3 of 5 | |
| planning rep 2 | 3, 2, 2 | 5 of 7 | the first three revivals of wren (2.6, 3.2, 3.7 min) each followed one finch post and each ended in one wren edit within 0.3-0.6 min |
| shop2 rep 0 | 3, 3, 3 (cap) | 4 of 9 | five revival turns without an edit (re-validation) |
| shop2 rep 1 | 1, 1, 0 | 1 of 2 | wren revived at 2.7 min, worked 11.6 min and made 16 edits |
| shop2 rep 2 | 2, 1, 0 | 1 of 3 | |

Whether the woken author fixed its code after a post: [R] planning rep 2: 3 of 3 posts to wren (fallback risks, empty-string id, local-loop deadline) led to a wren edit within 20-40 s; planning rep 1: finch's "candidate generation is outside the 13 s timer" (10.1 min) led to wren's "timer now starts at solve entry" (11.0 min); shop2 rep 1: finch's experiment results led to wren's top-3 dispatch (claim 10). None of those fixes changed the graded score by more than the noise except shop2 rep 1's v6 to v10 (+0.07). The posts that asked the author for something were mostly robustness and runtime edge cases of the example-size program.

### 2.3 Posts

[H] 125 posts; 69 (55%) contain numbers (seconds, costs, counts); 48 announce an edit of the poster's own; 28 (22%) are validation-only ("validated, 0 violations, smoke passes"); 39 raise a risk or propose a change. Per run (posts / numbers / own edit / validation only / risk or proposal): planning 28/12/11/3/14, 28/17/11/5/9, 25/7/9/7/9; shop2 22/15/9/6/3, 17/13/7/3/4, 5/5/1/4/0. Most posts are specific; the agreement-only share is small except shop2 rep 2 (4 of 5). Specific does not mean consequential: the post with the largest consequence in planning was finch's 56.6 s stress result, and it was grade-neutral (claim 7).

### 2.4 Did coordination add anything the relays could not?

One observed case: shop2 rep 1 (author woken with full context integrates an auditor's private experiments, +0.07; the run's other +0.08 is the author's own tuning). A relay could in principle also run the experiments, but in the 6 shop2 relay instances none tried. In planning the AUD gain (+0.112 in rep 0) came from an auditor editing the file itself, which a relay could equally do (compare C1TR rep 1 +0.111). So the data show no gain that requires the board, and one case where the author's context was used. n = 1.

## 3. shop2: why the zeros and what made the non-zero scores

| arm | rep | hidden score | hidden cost/naive per instance (45, 60, 70, 85 jobs) | visible small cost (naive 14,980) | visible large cost (naive 74,090) |
|---|---:|---:|---|---:|---:|
| C1T | 0 | 0.000 | 2.27 / 2.90 / 2.45 / 3.15 | 33,028 | 268,151 |
| C1T | 1 | 0.000 | 1.06 / 1.00 / 1.13 / 1.09 | 14,878 | 78,821 |
| C1T | 2 | 0.000 | 1.06 / 1.32 / 1.24 / 1.33 | 17,088 | 103,195 |
| C1TR | 0 | 0.114 | 0.95 / 0.94 / 0.99 / 1.00 | 13,997 | 74,571 |
| C1TR | 1 | 0.000 | 2.01 / 4.03 / 4.72 / 7.03 | 32,798 | 557,981 |
| C1TR | 2 | 0.491 | 0.77 / 0.91 / 0.93 / 0.89 | 13,447 | 72,222 |
| AUD | 0 | 0.000 | 1.11 / 1.14 / 1.19 / 1.19 | 16,010 | 87,817 |
| AUD | 1 | 0.592 | 0.74 / 0.88 / 0.89 / 0.90 | 12,152 | 64,890 |
| AUD | 2 | 0.000 | 1.09 / 1.05 / 1.20 / 1.09 | 16,540 | 76,185 |

[V] (the visible costs: each final `workspace/solve.py` run with `python3 -I` on the two provided instances and evaluated with the task's `holdout/model.py`; the naive costs with `model.naive`.) The grader's baseline is Giffler-Thompson dispatching with a weighted-shortest-processing-time rule and no backfilling (`holdout/model.py:56`); the best-known cost is about 22% below it on the largest instance (`best_known.json` 58,000 against naive 74,963). The score is `(naive - cost) / (naive - best_known)` clamped at 0, so the zone that scores is a narrow band under the baseline.

* **Why all C1T runs are 0.** Each wrote a single construction or dispatch heuristic with earliest-slot insertion (ATC-like urgency, a few priority variants) in 2-3 minutes and 13-20 calls, ran it on the two provided instances, validated feasibility and called `done`. C1T rep 1 is 0-13% over the baseline, rep 2 6-33%, rep 0 2.3-3.2x (its example cost 33,028 and large 265,651-268,151 were printed and not questioned). None had a reference point: the blind contract has no baseline and no agent built a second method.
* **Which change produced the non-zero scores.**
  * *AUD rep 1 (0.592).* The first draft by wren (0.8 min) already scored 0.503: whole-job priority orders with earliest-slot insertion plus deterministic annealing (`anneal`, `priority`, `deadline`; cost 72,604 on the large example, 2% under baseline). Then finch's private experiments (seeds, then top-k randomized operation dispatch, 72,927 to 64,565) were integrated by wren (v6 to v10, +0.07), robin fixed the start-index bug (neutral), and wren tuned the SA schedule (+0.08). Who: the author's first draft carried most of it; the auditor's experiment added +0.07; the author's tuning another +0.08. [V]/[R]
  * *C1TR rep 2 (0.491).* The first instance wrote a job-order search with annealing and random restarts (74,555 on the large example, 0.159 hidden), then edited it: iteration limit 1000 to 2000, removed a periodic restart from the seed order, added a base order (`edit` calls at msg 17-19 of `wren.1.messages.json`), re-ran and saw 74,555 to 67,371; hidden 0.159 to 0.491. Relays 1 and 2 confirmed validity and made no edit. The mechanism is a measure-compare-keep loop on the provided large instance, done by the first instance on its own. [V]/[R]
  * *C1TR rep 0 (0.114).* Near baseline; the relay's only edit lowered the deadline for runtime headroom.
* **The signal existed in the provided files.** Because `instance_large.json` is a production-size instance, the cost on it ranked all 9 runs in the right order, though nobody knew the baseline cost 74,090. A norm "build a second, different simple method and keep the cheaper on the provided instances" would have exposed the 7 zeros that are at or above a simple dispatch rule. (No agent built the baseline: the grader's naive rule is textbook Giffler-Thompson.) Selecting the lowest visible large cost among the three arms of each repetition would give hidden 0.114, 0.592, 0.491 (mean 0.399) against the observed arm means 0.00 / 0.20 / 0.20. [V] Offline selection on final programs from different arms, not a new run.

## 4. Stopping

| context | why it stopped | evidence |
|---|---|---|
| C1T, planning rep 1, rep 2 | `done` after 13 calls and 2.5 min, with about 57 min and 12M tokens left; reason: implemented, example feasible, `npm run test` passes | `events.jsonl` `done`; clock lines in tool results ("57.7 minutes left") |
| C1T, other 4 runs | `done` after 13-20 calls (shop2, 2.3-2.7 min) and 85 calls (planning rep 0, 20 min, the one long single-context improvement: 0.07 to 0.57) | |
| C1TR, first instances | same as C1T: `done` after verifying on the example | done reasons |
| C1TR, relays | `done` after 6-66 calls; the 6 shop2 relays and planning rep 1's third instance only verify (0-1 edits); rep 0's second instance says "goal not met" | claim 13 |
| C1TR planning rep 2, second instance | no `done` call: the model ended its turn in text; relay only fires on `done`; run ends `quiescent` | claim 12 |
| AUD | all_done in 6 of 6; planning rep 0 and shop2 rep 0 end because all three agents used their 3 revivals; the others end when the last post gets no wake (one agent's last `done` after its last edit) | `revive.py` output |

Nobody mentions the clock or the tokens line (claim 6). Observed in the transcripts: stopping is each context's judgement that the example passes and its own check shows no violations; no context spent more than 20 minutes in any run, and at least 9M of the 12M tokens were left at the end of every C1 and C1TR run.

## 5. Spend

Tokens per context are in section 1.1. AUD tokens by kind of call (share of tokens, [V] `spend.py`): checks and program runs 23-41%, edits of the deliverable 10-18%, reads 4-16%, calls that post 11-22%, `done` and text-only turns 12-32%, other bash 2-8%. Per run, share of tokens spent after each agent's first `done` (revived turns): planning 67%, 69%, 79%; shop2 87%, 64%, 53%. The three agents' first turns alone: planning 2.08M, 1.33M, 0.61M (C1T runs: 2.94M, 0.11M, 0.16M); shop2 0.33M, 1.00M, 0.28M (C1T: 0.22M, 0.08M, 0.23M). So AUD's extra spend is mostly the revival cycle, each model call carrying about 30k tokens of context on average (cache reads included). Duplicate work: each auditor wrote its own full hard-constraint checker from the spec (planning rep 0: 16, 5 and 10 validator-like scripts by wren, finch and robin; wren's own had a travel-order bug that its post admits) and re-read the deliverable 5-11 times each (27 reads in rep 0 against 1-5 in C1T). 13 of 35 revival turns made no edit (2-17% of tokens per run). [H] for the script counts.

## 6. Hypotheses for the next round

All respect the rules (nobody is assigned a role, no oracle, no grading hint, work for a task without tests, new levers default off). Each names its falsifier.

**H1. A cost-reference norm lifts single agents on optimisation tasks: build a second, different simple method, run both on the provided instances, keep the cheaper.** Evidence: claims 3-5: 7 of 9 runs score 0 at or above a textbook dispatch rule, one relay instance quoted a cost 7.5x naive and verified it, and the provided large instance ranks all runs. Lever: one briefing sentence for tasks that state a cost. The agent builds its own baseline; the sentence does not say that a baseline exists or what the grader does. Test: C1T (one agent with clock and tokens line) plus the sentence, shop2, k=4. Falsifier: fewer than 2 of 4 runs score above 0, or mean below 0.15 (C1T: 0 of 3 here; one C1T-type run reached about 0.55 in round 16 stage A). Caveat: it needs a stated cost, so it does not apply to tasks without one; flag for the user whether "a second simple method" reads as a hint about the grader (I think not: it is standard practice). Planning has no such signal at the example size, see H3.

**H2. Fresh context is not the active ingredient; a same-context audit at `done` would match C1TR at lower spend, and the audit wording matters more than the seat change.** Evidence: relays made 0 edits in 5 of 11 relay instances and changed the score in 1 of 6 runs (+0.111, a contract clause a same-context agent could have re-read); first-instance behaviour of C1TR and C1T is identical by construction and the shop2 gap is first-draw luck (claim 2); the AUD briefing names the actions ("run the program, write and run your own tests") and its auditors attempted quality improvements 3 of 3 in shop2 while relays 0 of 6. Lever: a default-off steer on the agent's first `done` that injects the AUD sentence once and lets it continue in the same context (no board). Test: C1T plus the steer against C1TR, planning and shop2, k=4. Falsifier: the steer scores below C1TR by 0.05 or more on both tasks, which would mean freshness matters; within +-0.03 means the cheaper option suffices. Prediction: within +-0.03.

**H3. A production-size, planted-solution test norm for a single agent.** Evidence: 1 of 18 runs generated a larger input and it was loose (claim 7); in 9 of 9 planning runs the final planner is infeasible on `large` and `xl_dense` (8-12 of 22 families failed, no tier) while the reviewers had validated the 16-session example (claim 8). Lever: a briefing sentence such as "real inputs are larger and tighter than the example; before you stop, make one at the largest size the contract states, built so that a valid answer is known to exist (start from a valid answer and derive the input from it), run your program on it and check the result with your own checker". Not in any contract; borderline against "no grading hints" because the hidden generator is also built around a planted solution, so the user should decide. Test: C1T plus the sentence, planning, k=4. Falsifier: mean hard families passed on the three largest hidden instances (now 10-14 of 22 in every run) rises by less than 3, or no run reports infeasibility at size. This repeats H3 of the round 16 report for one agent, as that report suggested.

**H4. Parallel independent first drafts, picked by measured cost on the provided production-size instance (shop2 only).** Evidence: the first draft decides the family (claim 2, claim 10: 0.503 at 0.8 min and 0.159 at 3 min were the starting points of the two non-zero runs) and the visible large cost ranks all runs (claim 3). The offline selection over the three arms of each repetition gives 0.399 (section 3). Lever: the existing private-branch/copy option with n=3 and a final shared step in which anyone may promote the lowest-cost draft (selection by task-defined cost, no check). Falsifier: shop2 mean below 0.30 at k=3, or the promoted draft not the lowest-cost one. Spend about 3x C1T, well under AUD's 11x on shop2.

**H5. AUD's revival cycle can be cut by two thirds without losing its gain.** Evidence: revived turns are 53-87% of AUD tokens, 13 of 35 made no edit, and the late gains are few: +0.112 (planning rep 0, one robin edit) and +0.07 (shop2 rep 1) came within the first revivals of the later agents; planning rep 0 and shop2 rep 0 ended on the cap, not on convergence, and their last edits were never re-reviewed. Lever already in code: `revive: 1` (the profile uses 3). Test: AUD with `revive: 1`, k=3, both tasks. Falsifier: two-task mean below AUD's 0.348 by 0.05 or more, or tokens above 50% of AUD's.

Which first: H1 and H2 are single-agent and cheap (about 1.0-1.4x C1T each) and decide whether the next step is a norm or a mechanism; H3 repeats an older proposal with a planted-solution twist the user must approve; H4 and H5 are swarm variants that wait for H1/H2.

## Method and open doubts

* **Replay:** `edit` calls are replayed atomically with the exact-single-match rule; bash modifications of the deliverable are ignored. In all 18 runs the replayed last version equals the final `workspace/` file. 14 replayed edits failed to apply (planning AUD 0 has 5, AUD 2 has 4, C1TR 2 has 2; planning C1T 0, planning C1TR 0 and shop2 AUD 1 one each); these are concurrent-edit failures in AUD and did not change the replayed final. The version times are the `tool` event timestamps, so a version "at" a time is the file state after that call.
* **Sampling of versions:** planning versions were sampled (45 plus 19 extra in AUD rep 0, 11 from an interrupted first pass), shop2 versions 31. A "state when X first called `done`" is the last graded version before that event; where the sample is sparse (AUD planning reps 1 and 2) the value can be one or two versions off. The differences I call equal (<= 0.03) cannot be separated from grading noise (load 8-15 during grading).
* **Small samples:** k=3 per arm and task; every effect I quote from one run (+0.112, +0.111, +0.07, the AUD 1 shop2 chain) is n=1.
* **Keyword heuristics:** counts of validator-like scripts, generator-like scripts and post categories ([H]) overcount (a script that checks anything matches); the production-size finding in claim 7 was checked by reading the commands (planning: regex over all `bash` commands that build instances, then read).
* **Not checked:** the hidden-grader detail of why planner fallbacks differ in H-family counts (not needed for the claims); whether AUD 1 planning's 90-session fix would matter on instances tighter than finch's; whether wren's tuning edit (shop2 AUD 1 v15 to v16) depends on robin's fix; what a relay with the AUD wording would do (the confound in H2).
* The earlier suggestion that finch's top-5 result alone explains shop2 AUD 1's 0.592 is not supported: the first draft was already 0.503 and the second +0.08 step is the author's SA tuning.

## Appendix A: scripts (replay and selection)

Run from `tmp/claude-r17-traces/` (deleted at the end of the task), Python 3.12.

```python
# runs.py (campaign map and helpers)
import json,os,re
R='/Users/azaru/Documents/projects/murmur/../swarmtest/runs/'
R=os.path.abspath(R)+'/'
C={'planning':{'C1T':['20261004T210830Z-5a3ac503','20261004T213705Z-b3e89e59','20261004T215507Z-483599ac'],
'C1TR':['20261004T210833Z-23fb44cc','20261004T214000Z-b045c24d','20261004T215905Z-1c6ea6aa'],
'AUD':['20261004T210836Z-d3325af2','20261004T214054Z-20922723','20261004T220328Z-592c18d3']},
'shop2':{'C1T':['20261004T212958Z-2dd4c8ce','20261004T214838Z-5984556f','20261004T220538Z-5b58af77'],
'C1TR':['20261004T213251Z-8830c5f5','20261004T215030Z-332901af','20261004T220828Z-b8f2642b'],
'AUD':['20261004T213316Z-133efb5d','20261004T215104Z-ebc541b8','20261004T220858Z-7ac6739b']}}
def runs():
    for t,a in C.items():
        for arm,l in a.items():
            for i,c in enumerate(l):
                p=R+c+'/run-0001'
                yield t,arm,i,c,p,json.load(open(p+'/record.json'))
def events(p): return [json.loads(l) for l in open(p+'/state/murmur/events.jsonl')]
def ctxs(ev):
    """annotate each event with context label: agent or agent.N (relay count so far)"""
    rel={}; out=[]
    for e in ev:
        a=e.get('agent')
        if a:
            n=rel.get(a,0); e['ctx']=a if n==0 else f'{a}.{n}'
        out.append(e)
        if e['type']=='relay': rel[e['agent']]=e['relay']
    return out
def ctxfile(p,ctx):
    ev=events(p); nrel=max([e['relay'] for e in ev if e['type']=='relay'] or [0])
    a,_,k=ctx.partition('.'); k=int(k or 0)
    return p+'/state/murmur/'+(f'{a}.{k+1}' if k<nrel else a)+'.messages.json'

```

```python
# replay.py
import sys,json,os,re
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from runs import *
ST='/Users/azaru/Documents/projects/swarmtest/staging/'
ST=os.path.abspath('/Users/azaru/Documents/projects/murmur/../swarmtest/staging')+'/'
def replay(p,fname,task):
    ev=ctxs(events(p))
    tk=ST+task+'/workspace/'+fname
    cur=open(tk).read(); vers=[]; bm=[]
    for e in ev:
        if e['type']!='tool': continue
        a=e['args']
        if e['tool']=='bash' and fname in a.get('command','') and re.search(r"sed -i|>\s*"+re.escape(fname)+r"|open\(.*[\"']w|perl -pi|cat >|tee|mv |cp |python3? - ",a['command']):
            bm.append((e['t'],e['ctx'],a['command'][:100]))
        if e['tool'] in('write','edit') and a.get('path')==fname:
            if e['tool']=='write':
                cur=a['content']; vers.append((e['t'],e['ctx'],'write',cur,True))
            else:
                new=cur; good=True
                for ed in a['edits']:
                    if new.count(ed['oldText'])==1: new=new.replace(ed['oldText'],ed['newText'],1)
                    else: good=False
                if good: cur=new
                vers.append((e['t'],e['ctx'],'edit',cur,good))
    return ev,vers,bm

```

```python
# selsel.py (version selection)
import sys; sys.path.insert(0,'.')
from replay import *
def select(v):
    idx=set()
    ok=[k for k,x in enumerate(v) if x[4]]
    if not ok: return []
    for a,b in zip(ok,ok[1:]):
        if v[a][1]!=v[b][1]: idx.add(a); idx.add(b)
    idx.add(ok[0]); idx.add(ok[-1])
    if len(ok)>6:
        for n in (len(ok)//4,len(ok)//2,3*len(ok)//4): idx.add(ok[n])
    seen=set(); out=[]
    for k in sorted(idx):
        if v[k][3] in seen: continue
        seen.add(v[k][3]); out.append(k)
    if len(out)>6:
        mid=out[1:-1]; pick=[mid[int(j*(len(mid)-1)/3)] for j in range(4)]
        out=sorted({out[0],out[-1],*pick})
    return out
if __name__=='__main__':
    tot={}
    for t,arm,i,c,p,rec in runs():
        f='planner.py' if t=='planning' else 'solve.py'
        ev,v,bm=replay(p,f,rec['task'])
        s=select(v); tot[t]=tot.get(t,0)+len(s)
        print(t,arm,i,len(s))
    print(tot)

```

## Appendix B: version grader (`evalver.py`, final working copy)

Imports the task's `grader.py` from `../swarmtest/staging/<task>/` unchanged. For planning, `reference_objective` is computed once per case (cached) and `grade_case` is called per case; for shop2 `grade_case(case, workspace, scratch)` per hidden instance. Each selected version is written alone into a private directory and graded; three versions in parallel, `nice -n 15`. The `res-planning-partial1.json` / `prev` lines were added when the first planning pass was interrupted (it was too slow under load) and restarted with a smaller selection; delete them for a clean run. A second copy (`evalver2.py`) selected every version of AUD planning rep 0 between k=9 and k=36.

```python
import sys,json,os,importlib.util,tempfile
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
from replay import *
from selsel import select
ST_=Path(ST)
def load(task):
    d=ST_/task
    sys.path.insert(0,str(d/'holdout'))
    spec=importlib.util.spec_from_file_location('g_'+task,d/'grader.py'); g=importlib.util.module_from_spec(spec); spec.loader.exec_module(g)
    sys.path.pop(0); return g
OUT=HERE/'ver'; OUT.mkdir(exist_ok=True)
task=sys.argv[1]
f='planner.py' if task.startswith('constrained') else 'solve.py'
g=load(task)
scratch=Path(tempfile.mkdtemp(prefix='s-',dir=OUT))
if task.startswith('constrained'):
    cases=g.cases()
    rp=OUT/'refs.json'
    if rp.exists(): refs=json.load(open(rp))
    else:
        with ThreadPoolExecutor(3) as ex: refs=list(ex.map(lambda c:g.reference_objective(c,scratch),cases))
        json.dump(refs,open(rp,'w'))
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
    if rec['task']!=task: continue
    ev,v,bm=replay(p,f,task)
    if not any(j[2]==-1 for j in jobs): jobs.append((arm,i,-1,('start','-','stub',open(ST+task+'/workspace/'+f).read(),True)))
    for k in select(v): jobs.append((arm,i,k,v[k]))
# dedupe stubs: grade once
def run(j):
    arm,i,k,x=j
    ws=OUT/f'{task[:6]}-{arm}{i}-{k}'; ws.mkdir(exist_ok=True); (ws/f).write_text(x[3])
    s,ch=score(ws)
    fam=[c['name'] for c in ch if not c['passed'] and ':H' in c['name']]
    return dict(arm=arm,rep=i,k=k,t=x[0],ctx=x[1],op=x[2],score=round(s,4),
                checks={c['name']:(round(c.get('score',1.0 if c['passed'] else 0),3) if 'score' in c else int(c['passed'])) for c in ch},
                detail=[c['detail'][:100] for c in ch if c['name'].endswith(('quality',':run'))][:5])
res=[]; stub=None
import glob
prev=json.load(open(OUT/'res-planning-partial1.json')) if task.startswith('constr') and (OUT/'res-planning-partial1.json').exists() else []
done={(r['arm'],r['rep'],r['k']) for r in prev}
jobs=[j for j in jobs if (j[0],j[1],j[2]) not in done]
res=list(prev)
with ThreadPoolExecutor(int(os.environ.get('W','3'))) as ex:
    for r in ex.map(run,jobs):
        res.append(r); print(json.dumps({k:r[k] for k in ('arm','rep','k','t','ctx','op','score')}),flush=True)
        json.dump(res,open(OUT/f'res-{task}.json','w'))

```

## Appendix C: checks

1. Clock/tokens mentions (claim 6): for every `*.messages.json`, apply `re.compile(r"minutes left|tokens left|token budget|time budget|the budget|budget|the clock|timeout|time left|remaining time|plenty of time|enough time|\d+ ?min(ute)?s? (left|remain)", re.I)` to assistant `text`, `thinking` and the arguments of `done`/`post` tool calls; all hits are about the solver (timeouts, iteration or time budgets of `planner.py`/`solve.py`). Thinking blocks are summaries only.
2. `NOTES-wren.md` (claim 14): every `read` of `NOTES-wren` in the relay transcripts returns `ENOENT` (11 of 11).
3. Revivals and edits (claim 11): for each `revive` event, the revived agent's `edit`/`write` calls on the deliverable and `usage.total` up to its next `done` (`revive.py`).
4. Spend by kind (section 5): each `usage` event is attributed to the kind of the tool calls that follow it at the same timestamp (`spend.py`).
5. Visible costs (section 3): each final `solve.py` run with `python3 -I` on `workspace/instance.json` and `instance_large.json` of the task and scored with `holdout/model.py:evaluate`; naive from `model.naive`.
