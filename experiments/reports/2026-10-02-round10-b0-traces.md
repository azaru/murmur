> **Model output.** Written by a read-only analysis subagent (Claude) on 2026-10-02 from the round 10 transcripts, copied unchanged below. Claims verified by hand by the main session are listed here: the capped B0 shop2 run (`20261002T190159Z-488ba77b/run-0002`) ends with a 141-line `solve.py` that has no wall-clock check and fixed budgets (`anneal_trials=9000 if N < 500 else 1700`), scored 0.147 against the paired C1's 0.575.

# B0 (b0-basic, n=3, post-only board) transcript analysis

Run ids: pk1 9f7c1abc, sh1 51dc3944, ro1 5b165e05, pk2 50b24b1d, sh2 488ba77b, ro2 5f9357b7, pk3 12956c27, sh3 299e8bbe, ro3 3583a47a (all under ../swarmtest/runs/20261002T*-<id>/run-000{1,2}). [S] = scripts/traces.mjs or my inline Python on messages.json/events.jsonl; [R] = read by me; [H] = keyword heuristic.

## Summary
- The board is a coordination/verification channel, not a work-splitting one. ~10 posts per agent (265 posts, 27 agents), ~22% of tokens in post-only turns [S]. Most posts are results/S and review/verify [H]. Real adoption happened (pk1, pk3, sh1, sh2, sh3) and so did claim checking, including two retractions of wrong numbers.
- Nobody split the work. All agents edit one solve.py; all three end every run at the same S (shared file). Initial write races in 6/9 runs. Separate solvers only in sh1 (scratch prototypes).
- B0's packing2 edge (mean 0.888 vs 0.801) is not separable from "more work": B0 spends 2-7x the tokens, and the biggest gap (pk1) is C1 stopping at 1.8 min after 14 calls. pk3 C1 matches B0 with 0.39M vs 2.73M tokens. Across 9 pairs B0 wins 4, C1 wins 3, 2 about tied; means pk .888/.801, sh .307/.338, ro .280/.354.
- Capped sh2: the swarm swapped the wall-clock search for fixed iteration budgets ("deterministic" argument from the board), visible S fell 0.52 to 0.35, large S 0.083, and nobody reverted. Same move in sh3. This is a board-amplified consensus mistake.
- No run used the 1200 s: B0 3.3-10.1 min, C1 1.8-13.4 min.

## Q1 Board use [S unless noted]
Posts per agent (f/r/w): pk1 10/12/19, sh1 3/15/17, ro1 9/5/13, pk2 13/6/2, sh2 18/4/28, ro2 4/3/11, pk3 13/3/20, sh3 2/6/6, ro3 4/13/6. Board token share: mean 22%, range 2-43%. This undercounts cost: the "New on the board" text appended to every tool result (delivery attach) is not in the post-only turns.

Post content [H, multi-label, 265 posts]: result/S 166, review/verify 111, divide/coordinate 62 (mostly "avoid overwriting / I own solve.py"), ask/request 41, plan/announce 36, other 20. Typical first minute: each agent announces "I'll implement solve.py" (pk1 18:48:13-22, sh2 19:04:12-55); then results with numbers.

Acted on a teammate's post [R]:
- pk1 (events.jsonl 18:49:57-18:50:42): wren recommends category-clustered order; finch implements it, "npm test now visible 21869 (0.778)"; robin/wren then tune it via posts (cost 102677, 101835, 101529). S 0.181 to 0.912 mostly via this exchange.
- pk3 19:22:58-19:23:30: finch notes categories per bin; wren experiment and finch exp_cat both land on ~21.3k; solve.py moves 26266 to 21183.
- sh1 19:06-19:11: robin shares params and benchmarks wren_proto.py; wren moves the solve.py branch mix to robin's narrow parameter ranges; robin's patch for the blocked-interval bug is confirmed by wren.
- sh2 19:07:58: finch says time-based stop breaks "behave the same twice"; robin switches to fixed budgets (harmful, see Q4). sh3 19:21:07: finch does the same.
Claim checking [R]: pk1 wren corrects own bin count (18:50:09) and robin discards his partial scratch result; finch asks wren to verify the 101835 vs 102258 gap, wren finds the missing residual term (18:53:45); sh1 wren retracts "56,709 beats best known" (slot bug, 19:08:23), robin repeats it; ro1 wren and finch find the trial-0 key not matching the baseline and the Saturday bug (18:56:23-31).
Failed verification: pk3 wren's attribution of 21402 was wrong because the shared workspace changed under it (19:23:36).

## Q2 Self-organisation
- Single shared solve.py in every run; no per-agent solvers (only sh1 robin_impl.py/wren_proto.py scratch). Experiments mostly by bash scripts and scratch files (pk1 8 robin bash experiments, pk3 exp_*.py).
- Writer sequence on solve.py (W=whole-file write, e=edit) [S]:
Writes/writer switches/final writer: pk1 14/1/finch, sh1 17/2/finch, ro1 26/19/wren (robin and finch alternate, 4 whole-file writes), pk2 3/0/wren (only wren wrote; finch 13 posts), sh2 15/2/robin (3 simultaneous initial writes), ro2 6/0/robin, pk3 18/2/robin, sh3 11/8/finch, ro3 12/8/robin.
- "Ownership" announcements ("don't overwrite, I own it") appear in most runs and are mostly respected after the first race. Final S identical for all three agents (shared file), so no diversification.
- Parallel behaviour: one writer plus two reviewer/tester agents (pk2, pk3, sh2, ro2); competing edits only in ro1, sh3, ro3. Whole-test files collided too (pk3 swarm_tests/test_solver.py overwritten).

## Q3 Persistence and paired C1 [S]
Per run totals (B0 sum over agents, C1 single agent):
| run | C1 grade tok calls>green min | B0 grade tok calls>green(sum) min(max) |
|---|---|---|
| pk1 | .702 0.07M 3 1.8 | .913 2.79M 140 10.1 |
| sh1 | .152 1.38M 35 13.4 | .435 2.44M 100 8.3 |
| ro1 | .076 0.31M 2 2.9 | .030 2.50M 108 7.0 |
| pk2 | .817 0.31M 14 5.2 | .870 0.72M 34 3.3 |
| sh2 | .575 0.08M 3 1.8 | .147 3.01M 143 9.0 |
| ro2 | .486 0.50M 28 6.7 | .180 0.90M 46 4.1 |
| pk3 | .884 0.39M 25 6.4 | .881 2.73M 122 8.0 |
| sh3 | .286 0.12M 11 3.5 | .338 0.77M 37 3.7 |
| ro3 | .501 0.90M 10 7.3 | .630 1.76M 75 5.5 |
Per-agent B0 calls after first green: 4-57 (pk1 57/46/37, sh2 47/39/57). Final visible S of all three B0 agents (max/min within a run) agree except sh2 (0.353/0.353/0.237). Visible S ladder pk: 0.18 to 0.91/0.88/0.87; sh2 peaks 0.52 mid-run then ends 0.35; ro1 ends 0.138 while C1 ro1 had 0.195.
Total work vs information on packing2: pk1's gain is mostly C1's early stop (C1 large S 0.197 after 2 checks; B0 reached large 1.0), which a single agent that keeps verifying would probably avoid; pk2 B0 is one agent plus reviewers (paired +0.05 inside C1's 0.70-0.88 noise); pk3 is a tie at 7x cost. The only clean information effect is the category-first exchange in pk1, which C1 agents also found alone in pk2/pk3. Conclusion: not separable from more total work; this design cannot show a board benefit. B0 is also worse than C1 on 4 of 6 shop/roster runs, so more work did not help there.

## Q4 Capped sh2 (0.147B; 3.01M tokens, 9.2 min, events.jsonl 19:04:12-19:13:18)
- Run ended on token budget with wren still running (wren 1.10M, finch 1.02M done, robin 0.88M done), three agents at ~330k tokens per minute.
- Timeline [R]: 19:04:48-19:05:00 three simultaneous solve.py writes, robin's wins; 19:05:56 robin widens gamma and adds an annealer on wall-clock (visible 13529-14270, S up to 0.52); 19:07:58 finch argues wall-clock outputs differ run to run and the spec wants determinism; fixed loops adopted (19:08:34); wren, finch, robin then spend 19:08-19:13 adjusting budgets (200/12000, then 100/9000 and 25/1700) because load made runs take 7-9.4 s (their own timing, with parallel campaigns on the machine).
- Final workspace/solve.py (141 lines) has no wall-clock check, fixed 100/9000 (N<500) and 25/1700 (large). Public S 0.353, large 0.083; hidden checks per instance 0.234/0.307/0.045/0.001. C1 sh2 stopped at 1.8 min with S 0.632/large 0.612 and 0.575.
- Nobody tied the budget cut to S (S 0.52 then 0.11-0.35 in robin's log) and no agent restored the earlier version. The cap stopped the run (not the quality collapse), but the run was already regressing.

## Q5 Design points
1. Add a no-board control: the same briefing and c4g-clock with n=3 in one folder but boardTools empty (or no-messaging.json plus the briefing), paired with B0 on packing2 and shop2. Without it B0-C1 gaps mix 3x work with the board. Also a C1 control with ~3x tokens (forced continuation or "run the check, keep going until 15 min") to test persistence alone.
2. The shop2 failure mode needs a guard: the board converged on a bad trade-off (fixed budgets) with S dropping on every check. A check line or briefing sentence "keep the best S; revert changes that lower it on instance_large" is a signal, not a role, and tests whether verification beats the consensus. Related: wall-clock noise from concurrent campaigns made agents cut time budgets; avoid running B0 alongside other load or log load in the check.

## Open doubts
- Board share undercounts cost (attached posts in every tool result). [H] post classification is keyword-based; I read pk1, pk3, sh1, sh2, sh3, ro1 posts only (ro2, ro3, pk2 not read). "Writes" count write/edit tools plus common bash patterns; edits via other bash forms may be missed. Time = last assistant message, not run end.
- Hidden grades of B0 vs C1 rest on k=3 with C1 noise 0.15-0.4 per task; no claim at that sample size.
- I did not verify that agents' own S timelines under load match the grader's conditions (the grader ran under the same campaign load).
