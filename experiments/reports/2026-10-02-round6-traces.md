# Round 6: transcript analyses (2026-10-02)

Two read-only analyses that fed the round 6 findings in `plan.md`. **Both are model output** (Claude Sonnet subagents), condensed here without changing the numbers. Claims marked **[verified]** were checked by hand by the main session; the rest are the subagents' readings.

Data: the 21 round 6A campaigns (seed 20261020, `../swarmtest/runs/`) and the 6B batches `batch/L1-{IC,EC}-r{0,1,2}/`. Raw transcripts are not in git (see `../../archive/MANIFEST.md`).

## 6A: why c4g-guard stops and what c4g-clock does with the time

**Setup correction found by the subagent [verified]:** in swarmtest the agent's timeout is 18 min, not 20: the murmur adapter reserves 2 min of the 20 for the final check (`adapters/murmur.mjs`: `MAX_CHECK_MS = 120_000`), so the clock starts at `[18.0 minutes left before the timeout]`.

### c4g-guard (9 runs)

| run | task | score | stop (min / call) | check at stop | stated reason |
|---|---|---:|---|---|---|
| 3ebaea0a | ieh | .84 | 2.8 / 22 | red | done: "Cannot finish within this run: npm run test remains failing ... implementation is incomplete" **[verified quote]** |
| c7945444 | ieh | .30 | 2.3 / 15 | red | done: "acceptance check still fails" (merged_case_ids) |
| 596dee89 | ieh | .43 | 3.3 / 23 | red | turn ended without done: "still fails ... I haven't completed verification" |
| c4122f0f | ieh2 | .26 | 4.0 / 30 | red | turn ended without done: "basic extractor ... still fails on ledger replay" |
| 980e5ffc | ieh2 | .12 | 5.1 / 27 | red | done: "Further implementation and verification are required" |
| 35ab61bd | ieh2 | .18 | 4.3 / 39 | red | done: "partial extractor ... ledger/dispute/chat coverage remains missing" |
| 289117ff | ledger | .24 | 2.0 / 18 | red | turn ended without done: "still fails with 6 problems" |
| 340bbbea | ledger | .63 | 2.1 / 20 | red | done: "incomplete ... 7 sample discrepancies" |
| 356f9934 | ledger | .90 | 2.6 / 27 | green (at call 18) | done: "verified npm run test passes" |

- 8 of 9 gave up or ended the turn on a red check with an "incomplete" statement; 1 of 9 stopped 9 calls after its first green.
- 0 of 9 reason explicitly about time or budget. The one "within this run" phrase is ambiguous.
- Guard tool results carry no time line **[verified: no "minutes left" in 3ebaea0a's transcript]**. One guard run called `team` twice; it returned only "wren (you): working".
- Several gave up with a concrete, fixable failure in hand (c7945444: one missing merged case id). 3 of 9 ended their turn without `done` (quiescent).

### c4g-clock (9 runs) and c4g-evidence on ledger (3 runs)

| run | arm / task | score | first green / total calls | solution edits after green | swarm_tests writes after green |
|---|---|---:|---|---:|---:|
| 10df4893 | clock ieh | .998 | 50 / 75 | 8 | 4 |
| 37e62d7e | clock ieh | 1.0 | 44 / 71 | 5 | 3 |
| 2850eb3f | clock ieh | 1.0 | 44 / 73 | 9 | 1 |
| 56d5d46b | clock ieh2 | .990 | 44 / 79 | 14 | 1 |
| e705324e | clock ieh2 | 1.0 | 67 / 86 | 8 | 0 |
| e1ca1638 | clock ieh2 | .981 | 39 / 81 | 21 | 0 |
| b8f32b74 | clock ledger | 1.0 | 22 / 54 | 14 | 2 |
| a30c44a5 | clock ledger | 1.0 | 21 / 59 | 9 | 4 |
| 09610091 | clock ledger | 1.0 | 22 / 55 | 9 | 3 |
| 6d44a883 | evidence ledger | 1.0 | 22 / 62 | 8 | 6 |
| 3d9a4d28 | evidence ledger | 1.0 | 20 / 39 | 5 | 1 |
| 39b069c4 | evidence ledger | .90 | 23 / 57 | 9 | 3 |

- First-green and total-call figures agree with `criba6-traces.md` **[verified against the table]**.
- Post-green work is mostly hidden-case hardening found by probing with small `python3 -c` snippets (date, money and header parsing), not a clause-by-clause reading of the contract.
- The clock is mentioned in visible text in 1 of 12 runs (a30c44a5: "Need implement entirety. time 18m. write full.", after its first tool result showed 18.0 minutes **[verified: the first clock lines in that run are 18.0, 17.9]**). Thinking is encrypted.
- Runs that finished with `done` did so with 4.3–10.5 minutes left.
- On ieh2 the score-raising work starts before the first green: guard never reaches green there, clock reaches it at call 39–67.
- The two ieh2 runs capped at 3M (e705324e, e1ca1638) were still making solution edits in their last 10 calls, with some failed edits ("Could not find edits[1]") but no idling. About 2.9M of each 3M were cache reads.

### Doubts raised

- "The clock corrects a belief that time is short" and "the clock is a repeated cue to continue" predict the same transcripts here.
- The first-green detector matches `npm run test` without failure output; it was not checked run by run.

## 6B: coordination events and stop reasons in the batches

The event table and the IC per-task table were appended by the subagent to `batch/traces.md` ("Round 6B"). **[verified]** claims, posts, help signals and findings recounted by hand from `events.jsonl` for EC r0 (7, 15, 2, 3) and EC r2 (7, 19, 3, 1); IC end reasons match `batch-result.json`.

- **Low ieh2 scores.** IC r2 ieh2 (0.38) hit its 1.5M cap at 8.8 of 20 minutes while debugging `money("JPY 240,741")` (returns 2); the check was still red and the file was intact. EC r2 ieh2 (0.547): lark held it (19 edits, 2.16M tokens) when the 6M shared budget ran out at 7.6 minutes, still red on `CS-17431.severity`.
- **Cross-agent work in EC** (write/edit calls only; bash edits not counted): folders edited by two or more agents per batch: 2, 0, 1, with one edit each from the second agent. No overwrites. Help signals followed by another agent's edit in the signalled folder: 2–3 of 7 signals, one edit each. In EC r2 lark declined help: "Yes I have already ported ledger backend... Please check result soon".
- **The one plausible useful case:** EC r0, wren posted "Hidden edge gap in information_extraction_hard2/extract.py:237: regex `r'[[(]at[)]]'` matches none of '[at]', '(at)'" and made the one-line fix; ieh2 scored 0.918. Not verified against the grader.
- **Tokens.** IC left 1.21, 0.37 and 2.30M of its 6M unused. 6 of 12 IC agents hit the 1.5M cap (ieh2 in all 3 batches, at 7.4–8.8 min); the other 6 stopped on their own with 9–15 minutes left. EC hit 6M at 6.6–7.9 minutes in every batch; board tools were 16%, 16% and 20% of calls; per-agent spend 0.8–2.2M.
- **Against the reading "5B's win was induced persistence":** nothing found. Caveats: IC is token-capped rather than time-limited; EC also ends early on its shared budget; the tasks leave little headroom (only ieh2, where IC spans 0.38–0.97 across batches).
