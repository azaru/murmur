> **Model output.** Written by a read-only analysis subagent (Claude) on 2026-10-02 from the round 10 transcripts, copied unchanged below. Claims verified by hand by the main session are listed here: TI run A coordination share 40.8% (recomputed: 2.45M of 6.02M tokens in board-only turns); `taskboard/__init__.py` is the unchanged 174-byte original in all three runs and `board.py` already loads `ext_*.py` with pkgutil; 33 of 41 capabilities above 0 in each run.

# Round 10 stage 10C (TI) traces, ospec_brown, 3 runs

Sources: [S] = my inline scripts (an.py, b.py, c.py, deleted after) over `*.messages.json`, `events.jsonl`, `record.json`; [T] = `node scripts/traces.mjs`; [R] = read by hand. Runs are `../swarmtest/runs/<id>/run-0001/` with ids A=20261002T165259Z-e530e637, B=20261002T170131Z-571bc91f, C=20261002T171010Z-0af634f7. S4 brown = 20261002T144545Z-52bf769e, 20261002T145352Z-394553ef, 20261002T150244Z-59dbbe1c. C1 brown = 20261002T130022Z-a2f2083f, 20261002T131320Z-a8270f20, 20261002T132336Z-6d8ed73d.

## Summary
- TI did not cut coordination cost. Token share of coordination-only turns is 35.6% (30.0–40.8) vs S4 27.8% by the same script; the target was <10%. The threaded board made coordination slightly worse, not better.
- Integration norm: no import breakage, no destructive overwrite of a teammate's file in final workspaces. But there was no new discovery package: `taskboard/__init__.py` is the untouched 174-byte original, and `board.py` (line ~162) already auto-loads every `ext_*.py` (pre-existing design). So the norm's "foundation makes the package discover" was moot here.
- Coverage is identical to S4/C1: 33 of 41 capabilities in every TI run. The 8 zero capabilities are the same in all three runs and nearly the same in S4 and C1: missing work, not integration faults.
- Every run is stopped by the 6M budget at 7.5–7.9 min; S4 ended at 6.3–7.6 min. Cost is context re-reads (93% cache read), driven by turn count, not by the board's payload.

## 1. Coordination share of tokens [S]
Method: for each assistant message, tokens = `usage.totalTokens` (input incl. cache read + output; the per-agent sums add to the run total, 6.02/6.04/6.04M, matching `result.json`). A turn is coordination-only if it has tool calls and all are in {post, inbox, team, budget, claim, release, role, finding, done, thread_new, thread_list, thread_read, reply} (the same set as `traces.mjs`). Share = those turns' tokens / all tokens. Note this charges a coordination turn its whole context re-read.

| run | coord tokens | share | coord turns / turns | traces.mjs board % of calls (4 agents) |
|---|---:|---:|---:|---|
| A | 2.45M | 40.8% | 95/238 | 36/28/40/38 |
| B | 2.18M | 36.1% | 86/246 | 32/31/36/35 |
| C | 1.81M | 30.0% | 85/280 | 35/31/31/28 |
| TI mean | | 35.6% | | ~33 |
| S4 brown (3 runs) | 1.85/1.60/1.57M | 30.6/26.6/26.1 = 27.8% | | 20–31 |

traces.mjs counts calls, not tokens, so it reads ~33% for TI by call share and agrees in magnitude with the token share; it does not equal it because turns differ in context size and some turns mix board and work calls (those count as work in my measure). Breakdown of TI coordination tokens (run A): reply 850K, thread_read 364K, team 353K, claim 340K, release 247K, thread_new 213K, thread_list 83K. In C, claim/team/thread_new/release dominate (reply only 186K). So threading is a small part; reply, claim, team and release turns are most of it, each costing a ~24k-token context re-read to move ~100 bytes.

## 2. Thread usage [S, events.jsonl `thread` events]
Threads opened: A 12, B 12, C 15. Per agent (A/B/C ranges): thread_new 2–4, thread_list 1–4, thread_read 1–7, reply 0–10 (run A: finch 10, wren 10, robin 8; run B: 2–7; run C: 0–4).

| run | thread_list total | thread_read total | reply total |
|---|---:|---:|---:|
| A | 6 | 15 | 31 |
| B | 11 | 14 | 18 |
| C | 7 | 14 | 10 |

Every agent starts with thread_list (the "No threads yet" 56-byte result) and later lists return new content; all results had content, no empty re-lists, and no polling loop (max 4 lists by one agent, each with a longer result than the last). Agents did read threads (e.g. robin in A read t2–t7, 7 reads; `.../e530e637/run-0001/state/murmur/robin.messages.json`). Reads are cheap in bytes (300–2000 B) but each is a turn. Replies in A look like chatter: 31 replies, 850K tokens.

## 3. Integration [S, R]
| run | ext modules created | cross-agent edit/write on a file another agent touched first | import/attribute errors seen in bash |
|---|---|---|---|
| A | 7 ext_* new | edits to comments.py, workflow.py (original files), tasks.md | 18 bash outputs, all `bulk_move` AttributeError (hidden tests missing method while bulk was unfinished) or unittest start dir |
| B | 9 new | comments.py (original), tasks.md | 19, `add_dependency`/`bulk_move` AttributeError, transient |
| C | 6 new | ext_recurrence.py written by robin then by finch; edits to tasks.py, search.py, comments.py, workflow.py | 16, `bulk_move`, `create_sprint`, transient |

- tasks.md edits by all four are intended (ticking). Cross edits on comments/workflow/tasks/search/tasks.py are on original taskboard files, which several sections legitimately touch; none is a rewrite by `write`.
- Only real violation of the norm: run C, `taskboard/ext_recurrence.py`: robin `write` (2794 chars, ts 1790961306637), later finch `write` (648 chars, ts 1790961454671). The final file is robin's 2794 B version, so finch's write seems not to have landed (probably blocked by the write guard; inferred, not checked). Recurrence scores 1.00 in C, 0.33 in A and B, 1.00 in S4 runs 1 and 2; those 0.33 are missing work, not an import fault.
- No capability scored 0 from an import fault. Final workspaces import (all non-regression checks ran). traces.mjs overwrites column is 0 everywhere.

## 4. Where the 6M went [S]
| run | turns per agent | tokens/turn (mean) | cache-read share | output tokens | spec read/bash calls per agent |
|---|---|---:|---:|---:|---|
| A | 66/43/75/54 | ~25k | 93.2% | 44K | 8–9 |
| B | 79/59/66/42 | ~24k | 93.0% | 45K | 7–9 |
| C | 55/59/75/91 | ~21k | 92.8% | 39K | 3–10 |
| S4 brown | 49–76 | ~23k | 92.9–94.1% | 37–44K | 5–11 |

Output is under 1% of tokens. Total turns are ~240–280 for both arms; at ~24k tokens a turn, 6M is gone in 7–8 min with 4 agents running in parallel, wall time bounded by the 6M cap, so TI was no slower or faster than S4 (7.5–7.9 vs 6.3–7.6 min). Spec reading is duplicated about as much as in S4 (each agent reads proposal/design/specs/tasks, 7–10 times). The context grows through spec text, so every turn, board or not, pays ~20–27k. TI cut nothing here.

## 5. Capability coverage [S, record.json grade checks by `capability`, score > 0]
| arm | runs | capabilities > 0 (of 41) | scores |
|---|---|---|---|
| TI | A, B, C | 33, 33, 33 | 0.403 / 0.422 / 0.421 |
| S4 | 3 | 33, 34, 32 | 0.401 / 0.462 / 0.372 |
| C1 | 3 | 31, 33, 32 | 0.422 / 0.473 / 0.449 |

Zeros in all three TI runs: burnup, calendar-export, favorites, field-search, rule-audit, subtasks, team-capacity, timesheets. The same 7 are zero in every S4 and C1 run (C1 lacks recurrence or estimates in two runs, S4 lacks bulk in one). Those 7–8 capabilities are outside what any arm reaches; the gain/loss between arms is in partially scored groups (notifications 0.17–0.92, checklists 0–0.71, export 0.11–1.0, activity 0.25–0.88, recurrence, time-entries), which vary a lot by run for the same arm.

## 6. Design points for a next V swarm
1. The cost is turn count times context size, not the board medium. Fewer coordination turns need a mechanism, not a better board: for example batch the claim/team/thread_new/reply into one call, or cut the teams' need to speak (agents spent 30–40% of turns on claim, team, release, reply, read). The per-turn context (~24k, 93% cache) means even a 50-token post costs ~24k.
2. Duplicated spec reading and a cap spent in 7.5 min: either give a larger budget or pass a shared digest of the spec once (a file in the folder), so each agent re-reads less and the context stays small. The change is unmeasured; treat as hypothesis.

## Open doubts
- My coordination share charges the full turn (context re-read) to a board-only turn; a marginal cost estimate would be lower but the same ordering holds. S4 share by my script (27.8%) is a little below the ~30% in the round 9 report (it used a different, per-agent mean).
- Whether finch's second `ext_recurrence.py` write was rejected by the write guard was inferred from the final file only.
- "Spec reads" is a heuristic (read/bash call mentioning openspec and spec/design/proposal/tasks); only relative size is meaningful.
- Zero-capability lists compared by name; whether those capabilities were attempted at all in TI was not checked in tasks.md ticks.
- n=3 per arm; per-run score noise (S4 0.372–0.462) is larger than TI−S4 (+0.004).
