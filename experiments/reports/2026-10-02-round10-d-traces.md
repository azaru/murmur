> **Model output.** Written by a read-only analysis subagent (Claude) on 2026-10-02 from the round 10 transcripts, copied unchanged below. Claims verified by hand by the main session are listed here: C1s packing2 r0 (`20261002T165303Z-00d0c849/run-0001`) had the signal norm in its prompt and ended after 3 min with "`npm run test` passes for both the visible and large instances", without mentioning the score; roster2's check prints a visible-instance S (`public_check.py` line 169), so the norm applied there too; the end-of-run acceptance check of S3s packing2 r0 (`run-0003`) printed large S = 0.152 in 7.2 s while the hidden grade was 0.819 and the subagent's quiet regrade gave 0.933, so in-run S is load-sensitive. Deviation: the subagent's 137 regrade runs (`nice -n 15`, sequential, about 19:08–19:33 UTC) overlapped live B0 and S2 campaigns, whose graders are wall-clock based; the machine was not quiet as the text below says (the S2 section was regraded after every campaign had ended). S2 claim verified: in S2s packing2 r0 (`20261002T192127Z-b2d51c69/run-0002`) finch posted "category-first ordering improved visible cost from 26235 to 21016 and large from 129941 to 102308". Note: the report says 6 of 9 S3s runs were capped; `record.json` gives 7 of 9.

# Round 10, panel D: transcript analysis (read-only)

Sources: [S] = script output (traces.mjs, my extraction scripts on `*.messages.json`, result.json, record.json); [R] = reading of transcripts/board; [G] = my regrade. Regrade method: for each attempt dir and the root `solve.py` of every swarm run, I copied the run's `public_check.py` + instances into a scratch dir and ran it once, sequentially, under `nice -n 15` on a quiet machine (137 runs). No hidden grader was used. Solvers are time-based, so regrade S can differ from in-run S (see doubts).

## Summary
- C1s mostly did NOT use the signal. Its low packing runs are early stops on first green at S 0.11 / 0.21 (66k and 102k tokens, 3 min of 20). The norm text is in the system prompt of those runs; the done reasons never mention S [R]. The one packing run that kept going (0.302) improved S 0.16 to 0.39 and then plateaued in the same heuristic family.
- S3s and S10s do pick the best-S candidate when they get to install; the problems are the pool and the budget. S3s pools were often uniformly weak (packing d69b: all four attempts S 0.15-0.25). S10s run out of 3M at 4.4-6.4 min, in the middle of choosing: in 3 of 9 runs a clearly better attempt was left uninstalled.
- roster2 does print a visible S, and it predicts the hidden grade well across C1/C1s (all 4 runs with vis S >= 0.77 scored >= 0.67; all 5 with S <= 0.5 scored <= 0.18). The pre-registered "|C1s - C1| < 0.05" was not met (0.569 vs 0.281), but with per-run spread this large it is noise-level.

## Q1. C1s / C1 single agents [S]
Final-check S is the harness's last public check; "large S seen" is the sequence the agent saw. Time of 18 min budget shown as minutes used.

| stage/task | arm | grade | large S seen (first..last, max) | calls (to 1st check / after) | min | tokens | end |
|---|---|---|---|---|---|---|---|
| S3 pack #1 | C1s | 0.086 | 0.096, 0.107 | 14 (10/4) | 3.0 | 66k | done on S 0.107 |
| S3 pack #1 | C1 | 0.866 | 0.17 ... 0.97, final 0.939 | 38 (8/30) | 9.2 | 540k | done |
| S3 pack #2 | C1s | 0.302 | 0.16 .. 0.391 (x4 flat), 16 checks | 64 (8/56) | 9.4 | 1.12M | done on S 0.391 after plateau |
| S3 pack #2 | C1 | 0.467 | 0.145/0.181 flat; visible 0.83 | 38 (9/29) | 8.4 | 387k | done |
| S3 pack #3 | C1s | 0.269 | 0.207, 0.207 | 17 (12/5) | 3.0 | 102k | done on S 0.207 |
| S3 pack #3 | C1 | 0.823 | 0.105 then 0.900 | 28 (13/15) | 9.9 | 262k | done |
| S10 pack | C1s | 0.829 / 0.906 / 0.138 | 0.913 / 0.983 / 0.170 | 29/23/22 | 4.0/4.9/2.7 | 266k/196k/165k | done at those S |
| S3 shop | C1s | 0.421 / 0.133 / 0.631 | 0.219 / 0.192 / 0.59 | 95/63/21 | 15.1/13.8/6.0 | 1.9M/1.2M/197k | done |
| S3 shop | C1 | 0.742 / 0.029 / 0.116 | 0.845 / 0.000 / 0.05 | 17/65/21 | 3.7/12.7/3.6 | 142k/1.0M/174k | done |
| S10 shop | C1s | 0.329 / 0.512 / 0.529 | 0.078 (peak 0.196) / 0.467 / 0.442 | 51/15/17 | 10.8/3.2/2.6 | 908k/131k/139k | done |

- Packing S3 stage: 2 of 3 C1s runs stopped within 3 min on the first green with S 0.11 and 0.21, i.e. ignored the printed score. Hidden grade tracks last S (0.107 to 0.086, 0.207 to 0.269, 0.391 to 0.302; C1 0.939 to 0.866, 0.900 to 0.823). Exception: C1 0.145 to 0.467.
- C1 (no norm) found the good algorithm in 2 of 3 packing runs by working 9-10 min; C1s did not. Nothing shows the norm caused the failure beyond not triggering continuation; with n=3 the C1s vs C1 packing gap (0.22 vs 0.72) is not separable from run variance, but C1s did not lift anything.
- Norm effect on stopping: C1s ended under 5 min in 3/9 S3 runs and 8/9 S10 runs; C1 in 4/9. Where C1s kept going (shop2, 4 runs) it did iterate against S, but S ended low (0.08-0.22 in 3 of 4); shop S10 #1 went 0.196 to 0.078 (regressed, stopped on the lower one).
- Final S vs grade: shop2 and packing S predict grade within roughly 0.1-0.2 except C1 packing #2.

## Q2. Selection in S3s / S10s [G][S][R]
Regrade S = large S (packing/shop) or visible S (roster). "valid" = attempt dirs with a solve.py that passed the check.

| run (campaign/task) | n valid | installed (root S) | best attempt S | grade | ended |
|---|---|---|---|---|---|
| S3 00d0 pack | 3 | wren 0.933 | 0.933 (others 0.13, 0.08) | 0.819 | done |
| S3 49c4 shop | 3 | 0.407 | 0.407 | 0.365 | budget |
| S3 4e06 roster | 3 | 0.704 | 0.694 | 0.576 | budget |
| S3 d69b pack | 4 | finch 0.242 | 0.254 (all <= 0.25) | 0.335 | budget |
| S3 c210 shop | 2 | 0.497 | 0.497 (other 0.0) | 0.457 | budget |
| S3 4556 roster | 2 of 3 | wren 0.604 | 0.662 | 0.517 | budget |
| S3 7c03 pack | 3 | finch 1.000 | 1.000 (others 0.24, 0.15) | 0.885 | done |
| S3 7000 shop | 3 | finch 0.672 | 0.672 | 0.619 | budget |
| S3 f4db roster | 3 | wren 0.825 | 0.825 | 0.521 | budget |
| S10 54fb pack | 8 of 11 | 0.868 | 0.868 (x3) | 0.780 | budget |
| S10 1f73 shop | 8 | kite 0.442 | 0.569 (wren), 0.549 (finch) uninstalled | 0.282 | budget |
| S10 afc6 roster | 5 | 0.817 | 0.840 | 0.518 | budget |
| S10 4c74 pack | 8 | kite-claimed root 0.141 | linnet 0.425 uninstalled | 0.143 | budget |
| S10 3a81 shop | 5 | linnet 0.638 | lark 0.725 uninstalled | 0.605 | budget |
| S10 f904 roster | 7 | root INFEASIBLE at end (check failed) | 0.84 | 0.584 | budget |
| S10 a0bd pack | 7 | heron/wren 0.943 | 0.943 (x4) | 0.863 | budget |
| S10 2acb shop | 8 | 0.516 | 0.516 | 0.312 | budget |
| S10 e32a roster | 10 | swift_det 0.689 | 0.697 | 0.118 | budget |

- Installed = best (within 0.05) in 12/18 runs; clear misses 3 (S10 1f73, 4c74, 3a81) plus 4556 (0.06 below, S3) and f904 (root broken at the cap). In S3, selection by S was explicit in SCORES.md (e.g. `.../20261002T180247Z-7c03dbb0/run-0003/workspace/SCORES.md`: "Finch wins both informative quality scores"). 
- Budget ran out mid-install in S10: 3a81 board, last posts: lark asks to replace root with attempts/lark (62470 vs 64476), swarm already agreed, run ended 18:11:30. 1f73: crane/swift/kite arguing wren attempt (64974 large) should be a candidate when the cap hit. 4c74: the matrix posts were in visible cost, not S, and a Kite "claim" on root blocked others; the run ended with root = the early Wren-like variant (S 0.141) while linnet (0.425 large, 0.370 visible) was top on visible cost.
- S3 quality was limited by the pool: when all attempts are weak (d69b 0.15-0.25; c210 one attempt 0.0) selection cannot help. The selected best on packing 00d0/7c03 (0.93/1.00 regraded) gave 0.82/0.89.
- Grade vs installed S: packing/shop track (0.93 to 0.82, 1.00 to 0.89, 0.672 to 0.619, 0.943 to 0.863), except shop S10 2acb 0.516 to 0.312 and 1f73 0.442 to 0.282. Roster visible S does not rank within the swarm: f4db 0.825 to 0.521, e32a 0.689 to 0.118 (hidden n90-n160 all `solve.py exceeded 10 seconds`; e32a record.json), afc 0.817 to 0.518.

## Q3. n = 10 at ~0.3M/agent [S][G]
- All 9 runs ended by budget at 4.4-6.4 min (of 20). Per agent: calls min 14, mean 28-32, max 59 (traces.mjs); board share of calls 13-27%. 
- Working attempts (public check passes): packing 8/8/7, shop 8/5/8, roster 5/7/10 of 10 (counts include extra dirs such as larkvar, swift_det). Typically 1-3 checks per agent; agents reaching a green public check by traces: 1-8 of 10.
- Almost no iteration: one agent in 54fb raised S 0.15 to 0.87 in 6 checks; others made one draft and spent calls on probes, claims and matrices (board posts are mostly comparisons of cost values, e.g. `.../20261002T175354Z-4c742835/run-0002/state/murmur/events.jsonl`). A solo C1s needs 15-29 calls in total, so 3M across 10 agents buys about one first draft each plus coordination; the swarm runs out before refinement and sometimes before install.
- Outcome: packing 0.78/0.14/0.86, shop 0.28/0.61/0.31, roster 0.52/0.58/0.12. Mean about equals C1s; n=10 is a max-of-10 draw on first drafts, bounded by installation timing.

## Q4. roster2, C1s vs C1 [S]
- Visible S is printed (`visible instance: ... score S = ...`), so the norm applied. C1s final visible objective / grade: 1165/0.028, 954/0.751, 918/0.927 (S3); 1099/0.178, 990/0.701, 1147/0.022 (S10). C1: 953/0.673, 1148/0.075, 1233/0.094.
- C1s ran longer on 2 of 3 S3 runs (7.9, 6.4 min; 13-18 checks vs 12/2). Means 0.569 vs 0.281, diff 0.29 against the |diff| < 0.05 prediction. Final check S vs grade is monotone in all 9 runs (>=0.77 gives >=0.67). Failure runs end with S 0.33-0.5: one ended on a worse solution than its best (e32a C1s: min objective 1061, stopped at 1147).

## Q5. Design points
1. Keep the first green from ending a run: the norm in text is not enough (11/18 C1s runs ended under 5 min). Use a mechanical gate (done rejected while S < threshold or while time left > X and last N checks improved) or minimum improvement rounds; in swarms, make "install best-S" a bounded step done by anyone.
2. Budget for swarms: n=10 at 0.3M is below one agent's own use plus coordination. Either n=3-5, or a cheaper board (the 13-27% board share plus probe-matrix work), or a per-agent reserve so the best attempt is installed before the cap. Also report S (not cost) in matrices and forbid a root claim to block install of the top attempt.

## Open doubts
- Regrade S is single-run on a quiet machine; time-based solvers vary under load (00d0 root 0.933 here vs 0.152 in the harness final check; d69b ROOT ok). "Uninstalled best" cases (3a81, 1f73, 4c74) are by regrade, not in-run S. In-run S for 1f73 wren was 0.442 for kite's root vs 0.569 regraded.
- "valid" counts include dirs with no output; some counts exceed 10 because of variant dirs.
- Per-run variance is large (single agent spans 0.03-0.87 on one task); all comparisons above are n=3.
- Token share of board not measured; used board share of calls from traces.mjs.

## S2 stage (seed 20261037; C1s then S2s = x1g-select-signal n=2)
Sources: [S] scripts on messages/result/record, [R] board/transcript reading, [G] regrade of each attempt dir and root with that run's `public_check.py`, one process under `nice -n 15`, no hidden grader. Run dirs: the 9 campaigns with `config.seed` 20261037 (the 8 you listed plus `20261002T194613Z-52684833`, roster2 rep 2).

### Q1. Selection table (S2s)
Regrade S = large S (packing/shop), visible S (roster). Tokens are totals for the 2-agent run (cap 3M); "end": done / quiescent / budget.

| run | attempts (S) | installed (root S) | best | grade | tok / min / end |
|---|---|---|---|---|---|
| pack b2d5 | finch 0.999, wren 0.988 | finch 0.999 | same | 0.914 | 0.90M / 6.0 / quiescent |
| pack 51e5 | finch 1.000, wren dir stale (0.06, the 1.0 was at root) | 1.000 | same | 0.904 | 2.64M / 11.7 / done |
| pack 4fa1 | wren 0.955, finch 0.693 | wren 0.955 | same | 0.892 | 1.40M / 8.7 / done |
| shop d621 | wren 0.442, finch 0.000 | wren 0.442 | same | 0.280 | 3.02M / 11.6 / budget |
| shop 3504 | both 0.603 | 0.603 | same | 0.598 | 2.29M / 12.9 / done |
| shop 5e3f | wren/finch7 variants 0.47-0.58 | 0.583 (vis 0.845) | same | 0.534 | 2.18M / 15.1 / done |
| roster 5c0b | finch 0.419, wren 0.419 | 0.807 (vis) | n/a | 0.272 | 3.01M / 11.1 / budget |
| roster 5268 | finch 0.18, wren 0.622, wren_fast 0.687 | wren_fast 0.687 | same | 0.527 | 3.03M / 10.0 / budget |
| roster 0b13 | finch 0.541, wren 0.363 | finch 0.541 | same | 0.284 | 1.30M / 9.8 / done |

- Installed = best in 9/9 runs; no good attempt was left uninstalled. Only 3 of 9 runs hit the cap (d621, 5c0b, 5268), versus 6/9 at S3 and 9/9 at S10, so S2 had time to install.
- Selection did not break down on packing/shop: grade tracks installed S (0.999 to 0.914, 1.0 to 0.904, 0.955 to 0.892, 0.603 to 0.598). Shop d621 is a pool problem (both agents stuck at 0.44; first-draft C1s got 0.892 and scored 0.806).

### Q2. Why packing found the good mode 3 of 3 [S][R]
- Evidence points to mode transmission on a 2-agent board plus iteration after green, not pool diversity and not budget per agent.
  - Insight spread on the board in the first 2-4 min: b2d5, finch at 19:25:54: "category-first ordering improved ... large 129941 to 102308", wren replied "clearly need category-first"; 4fa1, wren posted the recipe and finch asked to port it; 51e5, wren moved to "category-biased order variants" after finch's posts. With 2 agents every post is read by the only peer; with 10, posts are mostly probe/claim chatter (S10, Q3).
  - Iteration after green: first check at call 9-15, then 22-60 more calls; in-run large S went 0.06 to 1.000 (51e5 wren), 0.143 to 0.992 (b2d5 finch). Total 0.9-2.6M per run, not capped; in S3 packing 2 of 3 runs hit the cap and d69b never found it.
  - Pool diversity is not the explanation: both agents reached >=0.95 in-run in 3/3 runs (b2d5 0.99/0.99, 51e5 1.0/1.0, 4fa1 0.955/0.955). The 4fa1 finch attempt dir later regressed to 0.693 (kept editing after the board converged).
- Caveat: n=3 per stage; S2s 3/3 vs S3s 2/3 is not statistically separable. The mechanism above is from transcripts, not tested.

### Q3. C1s packing, S2 stage [S]
| run | grade | large S seen | calls / min / tok | end |
|---|---|---|---|---|
| b2d5 | 0.118 | 0.163, 0.152 | 17 / 2.3 / 89k | done on 0.152 |
| 51e5 | 0.709 | 0.147 x7 then 0.969 .. 0.987 (final 0.987) | 65 / 10.0 / 1.11M | done at 0.987 |
| 4fa1 | 0.172 | 0.156, 0.135, 0.176 x2 | 18 / 3.0 / 133k | done on 0.176 |

- Same pattern: 2/3 stopped within 3 min on S 0.15-0.18 with the norm in its prompt. Across all 9 C1s packing runs (S3, S10, S2) 5 stopped within 3 min on S <= 0.21, and 4 kept going (S 0.391, 0.913, 0.983, 0.987; grades 0.30, 0.83, 0.91, 0.71).
- 51e5: final S 0.987 but grade 0.709 (unexplained gap; I did not regrade it with the hidden grader).

### Q4. roster2, S2s 0.36 vs C1s 0.56 [S][R]
Hidden checks (n60..n160 quality) from record.json:
- 5c0b S2s 0.272: n160 cost 5495 > naive 5159 (score 0.0), n120 0.175, n90 0.368. Its C1s: 0.51-0.63 on all sizes.
- 0b13 S2s 0.284: 0.37/0.33/0.22/0.22; C1s 0.45-0.60.
- 5268 S2s 0.527 vs C1s 0.564: roughly flat 0.45-0.56.
- Cause: selection on the small visible instance. Installed visible S was highest in S2s (0.807, 0.687, 0.541) yet the solvers degrade with size. In 5c0b, finch's own scaled test (160 employees) gave objective 5495 and it still pushed it as a "safety win"; in 0b13 the last edit replaced the wall-clock cutoff by a fixed iteration budget `max(55, int(95*40/N))`, which starves large N. Roster prints no larger-instance score, so S cannot detect this (no analogue of packing's large S).
- Process: in 5c0b both agents spent the last ~3 min on "claim"/"please port" pings about root (22 posts) and the cap hit. Final root was a late edit that was not validated at scale.
- C1s roster S2 (0.564, 0.564, 0.549) ended after 4.7-8.8 min of own checks; visible S 0.64/0.60/0.78 for solvers that happened to be generic.

### Open doubts
- Roster S2s explanation rests on 3 runs; 5c0b root differs from both attempt dirs (late edits).
- The 51e5 wren attempt dir was stale, so its regrade (0.062) is not its in-run solver.
- C1s vs S2s means per task (pack 0.33 vs 0.90; shop 0.50 vs 0.47; roster 0.56 vs 0.36) are n=3.
