# Round 9 panel D: why S3 won on packing2 and not elsewhere (trace analysis)

**Model output (Claude, subagent), 2026-10-02.** Nothing here was committed. Marks: [V] = verified by running code or reading the file myself; [I] = inferred from transcripts, not tested.

Data: 12 campaigns with seed 20261034 in `../swarmtest/runs/` (C1 = c4g-clock n=1, S3 = x1g-select-clock n=3), campaign suffixes 2b1171ae, dbd4627e, 4f3d0646, 073a26b6, faa99f3e, 19e5ea32, 3eaeb195, ae8fa065, fe858d4f, f26790fe, 8f94d51d, bd8122ed. I regraded every attempt directory of the 9 optimisation S3 runs with the task's own `grader.py` (sequential, one solver at a time, `nice -n 15`). The installed root reproduces `record.json` within 0.004 in all 9 runs [V]. Attempts are graded in their FINAL state, which can be later than the moment of selection. cph attempts were not regraded (20 s per instance, five instances; and the public check gives no quality signal there).

## 1. Did S3 follow the method?

| run (suffix, task) | S3 score | attempts built | SCORES.md at min | install of the final solver at min | end (min / reason) | hidden grade of attempts (finch / robin / wren) | installed = best? |
|---|---:|---|---:|---:|---|---|---|
| 073a26b6 packing2 | 0.864 | 3 | 2.8 | 2.2 (wren), fixed at 6.3 and 9.2 | 9.6 done | 0.138 / 0.128 / 0.864 | yes |
| ae8fa065 packing2 | 0.914 | 3 | 5.7 | 7.9 (finch variant, 0.503), 11.2 (wren) | 12.5 done | 0.503 / 0.503 / 0.917 | yes, but only after a late replacement |
| bd8122ed packing2 | 0.916 | 3 + robin_fast | 7.2 | 4.6 (robin), 7.8 | 9.6 quiescent | 0.135 / 0.916 / 0.143 | yes |
| dbd4627e roster2 | 0.553 | 3 | 4.9 | 5.9-7.1 (wren) | 7.3 done | 0.426 / 0.426 / 0.553 | yes |
| 19e5ea32 roster2 | 0.013 | 3 | 5.5 | 5.9 (robin) | 7.3 done | 0.213 / 0.013 / 0.000 | NO (best was finch, 0.213, still poor) |
| f26790fe roster2 | 0.284 | 3 | 5.7 | 6.7 and 8.8 (wren) | 9.3 BUDGET | 0.109 / 0.472 / 0.537 | NO: installed 0.284, attempts/wren 0.537 |
| 4f3d0646 shop2 | 0.369 | 3 | 3.9 | 2.7 (robin) | 5.4 done | 0.369 / 0.369 / 0.000 | tie (finch = robin code) |
| 3eaeb195 shop2 | 0.105 | 3 | 6.5 | ~10.8 (fixed-50 finch) | 11.5 BUDGET, nobody done | 0.141 / 0.116 / 0.000 | ~ (all poor, -0.04) |
| 8f94d51d shop2 | 0.446 | 3 | 3.7 | 4.2 (finch) | 5.9 done | 0.446 / 0.036 / 0.086 | yes |

- Separate attempts in `attempts/<name>/`, probes in `swarm_tests/` (2-4 files) and a `SCORES.md` exist in all 9 optimisation runs and in the 3 cph runs; every run has a selection and an install [V, file listing]. The method is followed in form. Zero overwrites by the traces script.
- The agents' probes are mostly feasibility, format or determinism checks, and "all attempts pass all probes" is the usual matrix. The decision was made on the public check's costs, not on probes [I, from the posts]. Selected by the agents' own matrix = best by hidden grade in 6 of 9 runs, within 0.04 in 1 and wrong in 2 (19e5ea32 by -0.20, f26790fe by -0.25).
- Probes did catch real bugs through cross-review: an infeasible attempt that ignored blocked calendars (shop 3eaeb195), a relocation delta bug (packing bd8122ed, found by two agents), a category-fee accounting bug (packing 073a26b6, found by its own author after selection), empty-window semantics and an H20 group bug (cph).

## 2. packing2

- S3 attempts at final state: 3 of 9 distinct attempts reach 0.9 or more (wren 073, wren ae8, robin bd8) [V]; 2 sit at 0.50 (ae8 finch and robin, which time out on the two largest hidden sizes); 4 sit at 0.13-0.14. C1: 1 of 3 runs good (0.917), the other two at 0.52 and 0.456. So the per-attempt "good" rate (about 1/3) matches C1's. With p = 1/3, P(at least one good of 3) = 0.70 and of 2 = 0.56 [I, tiny sample]. In all three S3 runs the good attempt belonged to a different agent (wren, wren, robin), which supports diversity.
- Selection by the large instance was what made it work [V, check outputs]. The public check prints "large instance ... score S". C1's final check output showed large S = 0.122, 0.146 and 0.993, and the hidden scores were 0.520, 0.456 and 0.917. C1 stopped after 2.5-4.2 minutes with S = 0.12-0.15 printed, because the line is marked "informational only". Across packing2 and shop2 (12 runs, both arms) the correlation of the final large S with the hidden score is 0.94, against 0.67 for the visible S [V].
- Iteration after green mattered in 2 of 3 runs. ae8fa065: the interim install (Finch/Robin lineage, large 129737, hidden 0.50) was replaced at 11.2 min by wren's category-priority variant (large 101889, hidden 0.917). 073a26b6: wren found the cumulative-fee bug at 6.3 min, after being "selected" (0.14-class to 0.86). bd8122ed: cross-review found the relocation bug at 5.2-5.8 min (0.14 to 0.92).
- The two other agents in 073a26b6 declared done at 3.1 and 4.5 minutes, so only one agent produced the win there.

## 3. The bad S3 runs

- **19e5ea32 roster2 0.013:** the installed solver (robin) was chosen on the visible N=40 cost (963 against finch 1057 and wren 1290) and a determinism probe. It scores 0.053 at n60 and cost equal to naive (score 0) at n90, n120 and n160. Its iteration count shrinks with N (`900000*40/N`) [V, code]. Why the cost equals naive is not diagnosed [unknown]. Cause: nothing public has a size above N=40, so a probe-and-visible selection cannot see this. The determinism probe pushed all three agents from wall-clock deadlines to fixed iteration counts, which then did not scale [I].
- **f26790fe roster2 0.284 (budget):** root (installed 7.5 min) has `trials=max(30,min(300,20000//N))` and times out on n120 and n160. At 8.5 min finch and robin agreed on a workload-scaled budget; attempts/wren has it (0.537, no timeouts) but root does not. The 3M cap hit at 9.3 min before it was ported [V, diff of root against attempts/wren]. Out of tokens before the install.
- **3eaeb195 shop2 0.105 (budget):** attempts were first infeasible (blocked calendars), then everyone tuned fixed-iteration variants that return the baseline on large (74090) and on hidden sizes 45-85 jobs. Debugging and arguing about determinism took 27 posts; nobody called done; installed at about 10.8 min. Agents also timed solvers while 3 agents ran solvers at once (a posted remark: "sometimes >10s under load"), which made them conservative [I].
- **cph (0.334, 0.414 budget-or-quiescent, 0.300 budget):** C1 and S3 are equally bad because the failure is search feasibility on hidden sizes; both fall back to an invalid plan (H09, H10, H11, H14 ... fail on medium to xl_dense in every run), and not one run passes any quality tier [V, record.json]. The public check only says "sample passed", with no larger instance, so neither arm has a signal. S3 burned 3M in 6.4-9.4 minutes and ended with the last check red in 2 runs.

## 4. Token economics

- Tokens per run (record.json): S3 mean 2.30M, C1 0.58M, so about 4x. Packing is the extreme: C1 0.11-0.13M against S3 1.65-2.56M (about 18x).
- Turn-attributed token shares (each turn's total tokens, cache reads included, assigned to the tool it called) [V, script over events.jsonl]:

| | board | score/probe | build (write/edit) | read | npm check | other bash |
|---|---:|---:|---:|---:|---:|---:|
| S3 (12 runs) | 30% | 26% | 17% | 15% | 5% | 7% |
| C1 (12 runs) | 6% | 3% | 40% | 6% | 30% | 16% |

- Board-only turns 24-47% of S3 per run; scoring and probing 19-31%; building 12-22%. 53% of S3 tokens are spent before the first SCORES.md write.
- Calls per agent and calls after the first green check: C1 40.0 and 25.1; S3 54.5 and 22.1 per agent (163 and 66 per run). Checks per agent: C1 2.7 (packing) to 17.7 (shop2), S3 2.4-4.2. C1 on shop2/roster2 iterates on the check (23 checks in shop 3eaeb195, 0.444), S3 agents almost never re-run it.

## 5. Diagnosis and changes

**Diagnosis.** The S3 packing win comes from three diverse attempts and, above all, from a selection and a keep-improving phase that look at a number that predicts the hidden grade (the large-instance score the check prints); C1 stops on the first green with the same number at 0.12-0.15. Where no such number exists (roster2, cph) S3 selects on visible cost and feasibility probes, which cannot see size scaling, and it spends 4x the tokens, 30% of them on the board, so budget-capped runs lose the ported fix. The method's overhead is justified only by selection on a size-aware score.

**Changes (each with its cheapest falsifying test):**
1. **Select and iterate purely by the large instance's printed score, and add one to roster2 and cph (task side).** Norm: "install the attempt with the highest large-instance score S; do not call done while S on the large instance is below the best-known-attempt's S; probes only gate feasibility." Evidence: r = 0.94 for large S against hidden over 12 runs. Falsify: replay the 9 regraded S3 runs, rank attempts by their large S, and count how often argmax equals the hidden-best. Packing and shop are mostly already selected this way (packing 3 of 3 correct), so the test that matters is roster2 and cph after a large instance is added to their public check: S3 and C1 on k=3 each, same seed. If the roster2 mean does not move by +0.15 for either arm, the signal is not the bottleneck.
2. **Test the cheap rival first: c4g-clock with a "done only if the large S is at least 0.8, or has not improved in the last N checks" norm, n=1.** The C1 packing failures stop after 0.11M tokens with S=0.12; if a norm makes C1 hit 0.9 in 3 of 3 packing runs at under 0.5M, the 4x S3 spend is not needed for packing. Falsify: C1+norm on packing2 and shop2, k=3. If C1+norm is at least 0.85 on packing2 and S3 stays higher on shop2, the swarm adds nothing there.
3. **n=2 instead of n=3 with a port-the-fix rule.** Packing's good-attempt rate is about 1/3, so n=2 would give about 0.56 against 0.70 for at least one good attempt [I]; the gain would be diversity-limited, not cost-limited. A small lever, only if change 2 fails: when two agents agree on a fix after install, the installer ports it before anything else (f26790fe lost 0.25 to this). Falsify: n=2 on packing2 k=4. If at least 3 of 4 land at 0.85 or more at at most 1.5M tokens, keep n=2; if 2 of 4 or fewer, diversity needs 3.

## Open doubts

- Attempts were graded in final state, not at the selection minute; the "installed = best" column is therefore an upper bound on selection quality.
- Why the 19e5ea32 root returns cost equal to naive at n90-n160 is not diagnosed.
- cph attempts were not regraded; the cph conclusions use hidden checks of the installed planner only.
- The 1/3 per-attempt good rate for packing2 rests on 9 attempts (and 3 C1 runs).
- Token shares are per-turn totals (cache reads included), a proxy for cost, not billed tokens.
