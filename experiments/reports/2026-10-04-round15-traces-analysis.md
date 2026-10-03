# Round 15, stage A: transcript and trace analysis

> **Checked by hand by the main session (2026-10-04):**
> - ✓ Conflict markers reached main in BR `8b326a02`: commit `f557f35` on main starts with `<<<<<<< HEAD`.
> - ✓ The default `wake` text says "Call inbox", and the round-15 profiles offer no `inbox`. I count 8 wakes in 4 runs (`bf95f72a` 3, `01376639` 2, `0a019874` 2, `4b82f5ba` 1), where the report says 7.
> - ✓ BO `b9b748b9`'s final `planner.py` raises IndentationError.
> - ✓ In ST `295e25a1`, wren posted "I'm implementing" at 8 s, later entrants deferred, and wren made the only write of `planner.py`.
> - Everything else is model output and was not re-checked.


**Model output.** Written by a Claude subagent (general-purpose) on 2026-10-04 from the finished round's `events.jsonl`, `result.json`, `<agent>.messages.json`, `record.json`, the per-run git repositories of the branch arms and the final workspaces. Nothing was graded, no campaign was run and no model was called. Facts come from the files cited; "Interpretation" paragraphs are the model's reading and are not verified beyond what is cited. Unless marked "checked by hand", counts come from short scripts over the event and message files.

All paths below are relative to `/Users/azaru/Documents/projects/swarmtest/runs/<campaign>/run-0001/`; campaigns are named by the last 8 hex characters of their id (full ids in the table). Times are seconds since `run_start`. "Msg N" is the index in `state/murmur/<agent>.messages.json`.

| short | campaign | task | arm | score | reason | tokens | s |
|---|---|---|---|---|---|---|---|
| 38f6ba4c | 20261003T202413Z-38f6ba4c | planning | B | 0.40 | all_done | 5.7M | 229 |
| b9457a0f | 20261003T213841Z-b9457a0f | planning | B | 0.43 | all_done | 9.1M | 460 |
| bf95f72a | 20261003T202844Z-bf95f72a | planning | TL | 0.44 | all_done | 5.1M | 255 |
| 22928c54 | 20261003T214738Z-22928c54 | planning | TL | 0.38 | budget (9 done) | 12.0M | 426 |
| 01376639 | 20261003T203414Z-01376639 | planning | BR | 0.46 | all_done | 5.0M | 327 |
| 57c5dae0 | 20261003T215609Z-57c5dae0 | planning | BR | 0.35 | all_done | 10.8M | 492 |
| b9b748b9 | 20261003T204049Z-b9b748b9 | planning | BO | 0.00 | budget (1 done) | 12.0M | 329 |
| 1cc39f1b | 20261003T220441Z-1cc39f1b | planning | BO | 0.07 | budget (1 done) | 12.0M | 402 |
| 295e25a1 | 20261003T204627Z-295e25a1 | planning | ST | 0.45 | all_done | 7.3M | 335 |
| f163d09e | 20261003T221243Z-f163d09e | planning | ST | 0.49 | budget (0 done) | 12.0M | 455 |
| 90548874 | 20261003T205317Z-90548874 | planning | RO | 0.35 | budget (0 done) | 12.1M | 379 |
| 654efcff | 20261003T222132Z-654efcff | planning | RO | 0.42 | budget (0 done) | 12.0M | 396 |
| a06df206 | 20261003T210136Z-a06df206 | shop2 | B | 0.39 | all_done | 5.5M | 271 |
| b54b47ab | 20261003T222952Z-b54b47ab | shop2 | B | 0.00 | all_done | 2.1M | 143 |
| 0a019874 | 20261003T210612Z-0a019874 | shop2 | TL | 0.00 | quiescent (11 done) | 3.6M | 209 |
| c0f34249 | 20261003T223219Z-c0f34249 | shop2 | TL | 0.00 | all_done | 4.1M | 315 |
| 3852eb50 | 20261003T210947Z-3852eb50 | shop2 | BR | 0.56 | all_done | 6.7M | 453 |
| 8b326a02 | 20261003T223740Z-8b326a02 | shop2 | BR | 0.76 | all_done | 4.5M | 350 |
| 83c3aae1 | 20261003T211724Z-83c3aae1 | shop2 | BO | 0.02 | quiescent (11 done) | 7.8M | 549 |
| c74d72c6 | 20261003T224337Z-c74d72c6 | shop2 | BO | 0.40 | all_done | 9.0M | 357 |
| 58df707d | 20261003T212639Z-58df707d | shop2 | ST | 0.38 | all_done | 10.1M | 454 |
| 2b97dfb2 | 20261003T224939Z-2b97dfb2 | shop2 | ST | 0.69 | all_done | 3.2M | 264 |
| 4b82f5ba | 20261003T213420Z-4b82f5ba | shop2 | RO | 0.42 | all_done | 5.3M | 258 |
| 391aeba3 | 20261003T225411Z-391aeba3 | shop2 | RO | 0.39 | all_done | 10.2M | 560 |

(`record.json` `grade.score`, `state/murmur/result.json` `reason`, `tokens`, `durationMs`. C1 runs are in `5e5f0aa0`, `0184c709`, `dd25b816`, `f3578273`; not analysed here.)

## Headline findings

1. **No arm shows a mechanism that explains its score by itself.** The scores that differ most (TL 0.00 and 0.00 on shop2, BO 0.00 and 0.07 on planning) are each explained by a late, specific event in the transcripts (a rewrite that cut the search budget; an untested edit merged 5 s before the cap; a final edit wave that broke the example). Two of the three shop2 zeros are not TL-specific: the base swarm B has the same failure in `b54b47ab`.
2. **Two murmur defects were found** (one in `branches.ts`, one in the default wake prompt) and two friction points (write guard against conflict-marked files; 10 s bash timeout against 5 s solver runs). See "Suspected murmur bugs".
3. **Shop2's score tracks the cost the agents themselves last reported on their own `instance_large.json`** (heuristic regex extraction, see Q6). Runs whose last reported cost is about 60-63k scored 0.39-0.76; runs at 71k or more scored 0.00-0.40.

## Q1. TL on shop2 scored 0.00 twice

**Task-list use (facts).** Per run: `0a019874` 3 adds, 3 takes, 3 dones; `c0f34249` 1 add, 1 take, 1 done (`state/murmur/events.jsonl`, types `task_add/take/done`). `tasks()` was called 23 times in each run (a coincidence: per-agent counts differ), mostly at t=2 s, when the list was empty. The titles were all about checking, not splitting the build: "Inspect problem specification and design scheduler" (linnet, 5 s), "Analyze schedule generation heuristics and validate solver" (dunlin), "Validate and benchmark solver" (wren) in `0a019874`; "Validate solver output" (wren, 49 s) in `c0f34249`. Nobody added an implementation item. No `task_drop`. In planning, 8 of 9 adds were validate/verify items and one was "Implement planner solver" (plover, `bf95f72a`, 6 s).

**Duplicated or fragmented work (facts).** Two agents wrote `solve.py` in each TL run (`0a019874`: kite 34 s, robin 57 s; `c0f34249`: linnet 32 s, lark 59 s), against 5-6 in B shop2 (`a06df206`: 6 writers, 5 full writes; `b54b47ab`: 6 writers, 6 full writes; script over `tool` events with `write`/`edit` on `solve.py`). In `0a019874` the owner was set by posts, not by the list (robin 6.9 s "I'm taking solver implementation", 14.3 s "I'll own solve.py"). All of the other ten agents then validated.

**What happened to the final solver (facts, `0a019874`).**
- robin's file went from a wall-clock search to a fixed number of starts after reviewers (finch 61 s, crane 68 s, tern 68 s, plover 73 s, lark 74 s, heron 74 s, wren 75 s) quoted the clause "behave the same way twice" and runtime. Fixed 36 starts, then 18, then 24 (edits at 80, 91, 113, 147, 177 s).
- Agents measured the same file at different costs because the source changed under them: 79,862 (lark, plover, 73-74 s, wall-clock loop), 83,143 (wren 98 s, fixed 18), 96,820 (log-weight fixed 24, six agents from 103 s on).
- Two agents posted that the earlier version was better (lark 147.8 s, crane 181.2 s: "79,862 vs 96,820"). Nobody restored it. robin's `done` text (206.5 s) still cites cost 83,143, which no longer matched the file (others measured 96,820).
- One agent (linnet) ended its turn without calling `done`; the run ended `quiescent` (see Bug 2).
- Final `solve.py` is valid and fast; the grader's `detail` strings (`record.json` `grade.checks`) show cost above the naive baseline on all four instances: 22,895 vs 21,108; 43,056 vs 41,974; 75,796 vs 61,528; 83,548 vs 74,963. So the solver neither broke nor timed out; it was feasible and worse than the baseline.

**`c0f34249` (facts).** Final solver is an "80-rule dispatch portfolio" (lark's done text, 306 s) with no search; the agents' reported large costs at the end were 90,498-91,401 (posts 232-312 s). Grader: 25,592 vs 21,108; 47,691 vs 41,974; 84,921 vs 61,528; 93,712 vs 74,963.

**Same failure in B (facts).** `b54b47ab` (B, 0.00): lark's version ran 7.3 s on the example (64 s); robin, linnet, tern, plover, dunlin recommended 5 s or less (79-97 s); the file ended as "9 fixed policies" running 0.1 s / 0.6 s; every agent reported cost 84,083 on `instance_large.json`, 11 of 12 agents called `done` on feasibility and runtime alone. Grader: 25,151 vs 21,108; 52,028 vs 41,974; 79,624 vs 61,528; 81,437 vs 74,963. Compare B's other run `a06df206` (0.39): last reported large cost 63,374.

**Interpretation.** The task list was used for "someone should check this", never to divide implementation, and it did not cause the zeros. The zeros come from a contract clause (determinism, 10 s limit) that reviewers amplified until the search budget was gone, after which every agent could verify feasibility and none had a reference for quality. TL and B behave alike on shop2; TL's mean (0.00) against B's (0.195) is two runs against two runs with B's own runs spanning 0.00-0.39. Fewer writers (2 vs 5-6) removed the selection among different drafts that B had at least sometimes. One more contributor: 12 agents ran CPU-bound solvers on a shared machine. linnet measured 9.31 s wall for a 5.5 s deadline (82 s, `0a019874`) and dunlin's two-run shell command hit the 10 s tool timeout (142 s); agents cut time budgets in response. That load effect is plausible but not isolated.

## Q2. BO on planning scored 0.00 and 0.07, both runs capped

**`b9b748b9` (0.00).**
- Branches: 10 of 12 agents called `branch()` (events `branch`; first by plover at 19 s, nine more between 102 and 319 s). Two `merge` events, both tern's (177 s and 321 s), one `update`. 7 agents wrote `planner.py`, 6 of them in the shared folder (12 shared edits), 4 inside a worktree (8 edits), 3 did both (script over `write`/`edit` paths: absolute `/worktrees/` paths vs relative `planner.py`).
- Why 0.00 (facts): the grader says "planner exited with status 1" on every instance. The final shared `planner.py` does not parse (IndentationError at line 69; `ast.parse` check; `workspace/planner.py`). Scanning every commit in `state/murmur/git` with `ast.parse`, the first broken commit is `f8e86f8`, tern's own commit of its worktree: "Add exact full-objective score ... prune globally impossible chairs and clean dead code". That commit is a single-parent commit on tern's branch, not a merge. tern had run its worktree successfully at msgs 102-105 (0 violations, objective 176), then applied a 3-block edit (msg 106, chair prune and dead-code cleanup), called `merge` (msg 110, 320.8 s) without running anything, and its next command (msg 112) failed with the IndentationError. Cap hit at 326 s (`abort` event, reason budget). tern's last action was reading the file to fix it.
- So this is an untested edit merged 5 s before the cap, an agent error and not a merge artefact. The merge itself was a clean fast-forward of that commit.
- Tokens: 12.03M in 329 s (36.5k tokens/s); per agent 0.59-1.62M (`result.json` agents). B's runs used 24.8k/s (`38f6ba4c`) and 19.8k/s (`b9457a0f`). No agent looped; 11 of 12 had not called `done` (the only `done`, heron at 272 s, after a `done_refused` for unmerged work).
- Posts from 194 s on are review waves: empty-window guard (plover 201 s, then wren, swift, finch, robin, heron repeating it within 12 s), capped-MRV completeness, chair-domain pruning proposed again by six agents (255-264 s). Posts were 198 of 596 calls (33%).

**`1cc39f1b` (0.07).**
- 8 branches, 1 merge (dunlin 271 s) and 2 conflicts (dunlin). 10 agents edited the shared `planner.py` (33 edits), 4 edited worktrees (13 edits), 4 did both.
- Coordination stall (facts): from 250 s to 293 s about 20 posts asked dunlin or kite to merge a verified solver that existed only in dunlin's worktree (crane tested it by absolute path, 250 s; wren 277 s: "I don't have Dunlin/Kite branch access"). crane copied the file into the shared folder by hand (post 286.9 s); dunlin's own `merge` event is at 271 s.
- Final edit wave (facts): from 308 s to 371 s about 40 direct edits by 10 agents on the shared file (script over `edit` events), 17+3 failures "Could not find edits[N]/the exact text in planner.py" in this run (`messages.json` tool results, `isError`). Posts at 298 s state the shared solver was verified (0.41 s, feasible, objective 202); the cap hit at ~402 s.
- Why 0.07 (checked by hand): the grader's `coverage` check fails on all five instances ("each session must appear exactly once"). I ran the final `workspace/planner.py` once on the run's own `instance.json` (niced, output in the temp dir): it ran 13.95 s (the search cutoff) and wrote 15 of 16 sessions (S015 missing). The version agents verified at 0.4 s at 298 s had stopped working by the end. The causal edit was not isolated.
- The agents' own posts flag the fallback path as fragile ("search timeout unwinds all assignments; fallback puts defaults", plover 324 s, wren 349 s). Consistent with that, not verified.

**Interpretation.** BO planning is not stuck or looping. Twelve agents keep editing one shared file at 30k+ tokens per second and the cap arrives before anyone is done. `branch()` is opt-in per call, and the default folder stays the shared one; agents that opened branches kept editing the shared file (see Q4 and the hazard note). The 0.00 and 0.07 are the state of the shared file at the cap, so BO's planning scores say more about "where in an edit wave the cap fell" than about branches.

## Q3. ST (staggered entry), the best arm

**Entry times (facts, `enter` events).** Entry steps were 5-12 s apart, so the "after the previous agent's 2nd model turn" condition always fired well before the 60 s fallback. All 12 were in by 54.9 s (`295e25a1`), 69.8 s (`f163d09e`), 62.1 s (`58df707d`), 57.7 s (`2b97dfb2`). The first full write of the deliverable was at 50 s (`295e25a1`, wren), 57 s (`f163d09e`, wren), 34 s (`58df707d`, finch), 36 s (`2b97dfb2`, finch). So 6-9 agents had entered before any file existed.

**Writers (facts; agents writing the deliverable file, `write` = full file).**

| arm | task | run | writers | full-write agents | full writes | edits |
|---|---|---|---|---|---|---|
| B | planning | 38f6ba4c | 6 | 6 | 6 | 13 |
| B | planning | b9457a0f | 4 | 4 | 5 | 11 |
| ST | planning | 295e25a1 | 2 | 1 | 1 | 8 |
| ST | planning | f163d09e | 6 | 2 | 2 | 21 |
| B | shop2 | a06df206 | 6 | 5 | 7 | 12 |
| B | shop2 | b54b47ab | 6 | 6 | 6 | 10 |
| ST | shop2 | 58df707d | 5 | 3 | 3 | 15 |
| ST | shop2 | 2b97dfb2 | 5 | 5 | 5 | 11 |

Full-write agents average 1.5 in ST planning against 5.0 in B planning, and 4.0 against 5.5 on shop2.

**Ownership by announcement (facts, `295e25a1` posts).** wren, the first agent, posted at 8 s "I'm implementing a backtracking CSP planner". Each agent entering later answered with a deferral: finch 15 s "Wren implementing ... I'll build an independent validator", robin 19.8 s, lark 24.2 s ("Wren owning planner.py"), swift 28 s, kite 40.5 s, heron 47 s, crane 63.6 s ("I won't edit planner.py given Wren ownership"). Only linnet (entered 46 s) edited the file (three edits: 58, 146, 240 s). In B (`38f6ba4c`), 12 posts of "I'll implement planner.py" were made between 2 and 14 s, before anyone saw anyone else's; six agents then wrote complete files at 48-95 s, and tern at 47.9 s wrote "file is still stub after several minutes; I'll now take ownership".

**Late agents building on the file (facts).** In ST, 5 agents' first touch of the deliverable was an edit (4 in `f163d09e`, 1 in `295e25a1`; shop2: 2 in `58df707d`, 0 in `2b97dfb2`) against 0-1 in B. In shop2 no agent that entered after 30 s made a full write in either ST run; in planning `f163d09e`, heron (entered 50.9 s) made a full write at 110 s.

**Board and cost (facts).** Posts per run: ST planning 146 and 190, B planning 95 and 151; ST shop2 142 and 64, B shop2 95 and 38. Tokens per run: ST 7.3M / 12.0M (cap) / 10.1M / 3.2M against B 5.7M / 9.1M / 5.5M / 2.1M. ST runs last longer than B on 3 of 4 pairs.

**What drove shop2's 0.69 (facts, `2b97dfb2`).** swift (entered 23 s) made a full write at 76 s, then edits at 117-217 s and was the last to call `done` (261 s). Other agents found a real bug by validation: split blocked/calendar lists in `find_slot` allowed blocked-interval overlaps (lark 23 s message, wren, plover; swift msgs 16-30). After the fix, swift's reported costs fell 73,738 (large) to 62,214, then 60,412, with 21 configurations (swift msgs 31-45). The grade is 0.69 with 4 per-instance scores 0.58-0.78 (grader `detail`). The other ST shop2 run, `58df707d` (0.38), ended at 63,780 reported cost after 454 s and 10.1M.

**Interpretation.** On planning there is a plausible mechanism: an early announcement that later entrants can see turns equal agents into one owner plus reviewers, with 1-2 full-file writers against 4-6. Entry only 5 s apart gives the first agent a short head start, but the posts it makes are visible before the next agent's first turn, which the simultaneous start in B does not allow. On shop2 that mechanism does not appear (5 and 3 full-write agents against 5 and 6), and the two ST runs differ by 0.31 (0.38 and 0.69) with different histories. With k=2 and two tasks, planning's +0.06 over B (0.473 vs 0.415) is below the pre-registered +0.10 threshold. I cannot separate the entry mechanism from noise on shop2.

## Q4. BR (required branches) on shop2, 0.66

**Merging (facts, `state/murmur/events.jsonl`; BR gives every agent its own worktree, so "12 writers" means 12 copies, not 12 overwrites).**

| run | score | merge events | with file changes | merge_conflict events | `update` events | `done_refused` | unmerged at end |
|---|---|---|---|---|---|---|---|
| 3852eb50 | 0.56 | 6 | 3 (plover 92 s, tern 175 s, robin 197 s) | 19 | 16 | 8 | swift, crane (`solve.py`) |
| 8b326a02 | 0.76 | 9 | 8 by 7 agents (finch 67, linnet 94, swift 116, lark 135, robin 212, wren 291, tern 298 and 336 s; heron 285 s empty) | 25 | 0 | 4 | kite, crane, plover, dunlin |

`result.json` `unmerged` lists the above. In both runs, every agent still unmerged at the end called `done` after the one-time refusal, with a reason that it was leaving a worse solver out ("its large-instance cost is worse than the teammate's validated 66,968", kite 186 s `8b326a02`).

**Final solver (facts).** Both runs ended with robin's solver. In `3852eb50` the final blob first appears in commit `75bf143` ("serial job-by-job SGS ... insertion/adjacent-swap descent"), a robin merge message (robin msgs 25, 35, 41); robin merged at 197 s; wren, lark and dunlin later "merged" with empty file lists after adopting it. In `8b326a02` the final blob is commit `6505cf8`, tern's 5.0 to 4.2 s deadline reduction on robin's 24-policy scheduler (cost 61,215 at 235 s); heron, wren and tern adopted it by rewriting their file to match (commits `32b8496`, `250dcbf`, `a104ec9`). The final file is 51 lines (`workspace/solve.py`).

**How the merge step selected (facts, `8b326a02`).** After conflicts, agents posted their measured costs and chose: plover 66,968, tern 67,760, wren 75,400, kite 101,408, dunlin 90,283, robin 61,215 (posted 212 s: "I'll merge this implementation"); then kite, dunlin, crane and plover declined to merge theirs.

**Interpretation.** The selection came from the conflict step: an agent who cannot merge must read what main holds and compare it with its own number. In B, `write` of a whole file replaces the previous draft with no such step. This is a mechanism hypothesis from two runs. BR's other task (planning) scored 0.46 and 0.35 with 12 writers and 14-24 conflicts, at a higher token cost (10.8M in the worse run).

## Q5. RO (role menu)

**Roles taken (facts, `role` tool calls).**

| run | first pick (all at 1-5 s) | picked a second role | final roles |
|---|---|---|---|
| 90548874 (planning) | builder 9, explorer 2, tester 1 | 4 | builder 6, tester 3, reviewer 2, explorer 1 |
| 654efcff (planning) | builder 7, explorer 5 | 6 | explorer 6, builder 2, reviewer 2, tester 1, integrator 1 |
| 4b82f5ba (shop2) | builder 10, explorer 1, integrator 1 | 3 | builder 8, reviewer 2, explorer 1, integrator 1 |
| 391aeba3 (shop2) | builder 12 | 7 | tester 7, builder 5 |

Everyone picked a role before their first read of the problem (picks at 1-5 s). Across the four runs, 18 of 48 agents called `role` more than once.

**Behaviour by final role (facts; averages over the 48 agents).**

| final role | n | calls | posts | bash | deliverable edits and writes | other-file writes |
|---|---|---|---|---|---|---|
| builder | 21 | 46.2 | 14.2 | 18.0 | 1.6 | 0.8 |
| explorer | 8 | 50.0 | 14.1 | 21.0 | 2.1 | 0.9 |
| tester | 11 | 43.9 | 13.5 | 18.6 | 0.1 | 0.4 |
| reviewer | 6 | 45.7 | 13.0 | 18.5 | 0.5 | 0.0 |
| integrator | 2 | 40.5 | 9.5 | 14.5 | 2.5 | 0.5 |

Testers and reviewers touch the deliverable much less than builders; explorers write to it as much as builders, although the role text says to work "in a file of your own" and replace the shared version only if better. Calls and posts are similar across roles.

**Cap behaviour (facts).** Both planning runs ended on the 12M cap with 0 agents done (`90548874`: 379 s; `654efcff`: 396 s), against B planning all 12 done at 229 s and 460 s. In both, the deliverable was still being edited in the last minutes (`90548874`: 4 and 2 edits in minutes 5-6; `654efcff`: 1 and 3) and the last posts (360-377 s) are fixes in progress: feasibility failing on the example at the default search budget (6.5 s), several agents announcing the same domain-pruning insertion. The role texts (`profiles/n12-roles.json`) contain no wording about when to stop; the tester text says "Nobody else checks the work", which is the kind of sentence that keeps checking going. That link is an interpretation.

**Interpretation.** RO's outcomes (0.387 vs B 0.415) are within noise. The menu is used as a first-turn habit; the visible effect is that the subset of agents who take testing and reviewing stop writing the main file. Whether that explains the planning cap hits cannot be shown from two runs.

## Q6. Across arms

**Duplicated writing (facts).** Agents writing the deliverable (shared-folder arms): B 4-6; TL 2-5; ST 2-6; RO 2-7; BO 2-10 (hybrid, see below). BR: 12 agents each write their own branch copy (BR full-write agents = 12 in all four runs).

**Coordination share (facts; calls to `post`, `tasks`, `task_*`, `merge`, `update`, `branch`, `role` over all tool calls).** B 23% and 30% planning, 22% and 17% shop2; TL 36-37% planning, 34-36% shop2 (posts alone 23-30%); BR 17-20% planning, 19-28% shop2 (posts 6-17% in shop2 `8b326a02`); BO 28-36% planning, 28-34% shop2; ST 31-34% planning, 24-25% shop2; RO 34-35% planning, 31-32% shop2.

**End reasons (facts).**
- `all_done` in 16 of 24 swarm runs (B 4, BR 4, ST 3, RO 2, TL 2, BO 1).
- `budget` in 6: BO planning x2, RO planning x2, ST planning `f163d09e`, TL planning `22928c54` (9 done). B and BR never hit the cap.
- `quiescent` in 2, both shop2 (`0a019874` TL and `83c3aae1` BO): 11 of 12 done, the twelfth agent ended its turn with a text reply and no `done` call.

**Tool failures (facts, tool results in `messages.json`).** Edits whose old text was stale ("Could not find ..."): 0-8 per run; highest in the arms where many agents edit the same shared file (BO planning `1cc39f1b` 20; ST planning `f163d09e` 8; RO planning `654efcff` 5). Bash exit failures or timeouts: 3-75 per run; highest in TL planning `22928c54` (75) and BO shop2 `83c3aae1` (50), where agents ran several solver instances in parallel.

**Shop2 score against last reported large cost (facts, heuristic).** Regex over `post` and `done` texts for a 5-digit number near "large", last mention per run; the agents' `instance_large.json` is not a grader instance, so only the ordering is informative.

| run | arm | score | last reported large cost |
|---|---|---|---|
| 2b97dfb2 | ST | 0.69 | 60,412 |
| 8b326a02 | BR | 0.76 | 61,215 |
| 3852eb50 | BR | 0.56 | 63,402 |
| a06df206 | B | 0.39 | 63,374 |
| 58df707d | ST | 0.38 | 63,780 |
| 391aeba3 | RO | 0.39 | 65,353 |
| 4b82f5ba | RO | 0.42 | 67,512 |
| c74d72c6 | BO | 0.40 | 71,289 |
| 83c3aae1 | BO | 0.02 | 75,265 |
| b54b47ab | B | 0.00 | 84,083 |
| c0f34249 | TL | 0.00 | 91,401 |
| 0a019874 | TL | 0.00 | 96,820 |

The ordering is close to monotone. Costs 60-63k correspond to grades 0.38-0.76 and costs of 71k or more to 0.40 or lower. I checked `8b326a02` (61,215 in robin's post and the final file), `2b97dfb2` (swift msg 46), `0a019874` and `b54b47ab` by hand.

## Suspected murmur bugs and hazards

**Bug 1 (real, `src/branches.ts`): conflict markers can reach the shared folder.**
- `commit()` only checks files that git still lists as unmerged (`git diff --diff-filter=U`) for markers. If an agent runs `git add <file>` itself, the file leaves the unmerged state and the check never sees it.
- Observed in `8b326a02`: lark's second merge conflicted again after a clean rewrite; instead of resolving, lark ran `git add solve.py` (lark msg 36), then `merge` returned "Merged into the shared folder" (msg 39, 135.4 s). The merged commit `f557f35` has `<<<<<<< HEAD` at line 1 (checked by `git show f557f35:solve.py`).
- Main held that file until robin's merge at 211.9 s (the next successful merge, about 76 s). Agents that updated or merged in that window got nested markers (kite msgs 40-45: "branch file has nested conflict markers"; tern msg 44 shows `<<<<<<< HEAD` twice at the top of its file). lark's `done` (138 s) said the solver "runs ... in about 3.3 s".
- That run has 25 `merge_conflict` events in total; I did not split them by before and after the leak.
- Only this run showed it (commit scan of all four BR repositories, `planner.py` and `solve.py`: one commit with markers in `main`). The fix would be to scan the content being committed for marker lines rather than only unmerged paths.

**Bug 2 (real, `src/profile.ts:32`, default `wake`): the wake prompt tells agents to call a tool that does not exist in the post-only profiles.** The default text is "You have new messages on the board. Call inbox, then continue toward the goal." but all round-15 arms use `boardTools: ['post']` (RO: `['post','role']`), so no `inbox` tool is registered. A woken agent gets no message text and no tool to read it (the posts only arrive on the next tool result). Observed 7 wakes in 4 runs (`bf95f72a` x3, `01376639` x2, `0a019874` x2, `4b82f5ba` x1): swift posted "I do not have an inbox tool available in this session" (`01376639`, msg 55); linnet ended its turn after calling `tasks` and replying "no `inbox` tool is available" (`0a019874`, msg 53-54), which produced the `quiescent` ending of that run. Small effect here, but it makes `quiescent` partly a prompt artefact.

**Friction 1: write guard against conflict resolution.** In `8b326a02`, 7 `write_refused` events happened (tern 158 s, dunlin 161, heron 164, robin 172, wren 204, crane 207, plover 266), each time an agent in conflict state tried to replace a marker-laden file with a clean full rewrite. The guard compares against the longer conflicted file and calls the new content "only part of it". Agents learned `rm solve.py` then `write` (tern msgs 35-39). Not seen in the other BR runs.

**Friction 2: hybrid editing in BO (by design).** In optional mode `root(name)` is the shared folder, so relative paths always hit the shared file even after `branch()`. Agents mixing both: `b9b748b9` 5 of 6 shared-folder editors had also opened a branch; `1cc39f1b` 6 of 10; `83c3aae1` 2 of 5; `c74d72c6` 0 of 2. This is the setting in which the BO planning failures happened. It is a design property, not a defect.

**Friction 3: the 10 s bash timeout against 5 s solver runs** with 12 agents on one machine; two-instance shell checks time out (dunlin, `0a019874`, 142 s; 50 bash failures in `83c3aae1`). Load was not measured during the runs.

No other tool-level errors were found: no `branch`/`merge` errors about missing branches or paths in BR (the `you have no branch` message does not appear in any tool result), and the "[N minutes left]" suffix is attached to results as designed.

## Open doubts

- **BO `1cc39f1b` failure cause not isolated.** Only the end state was run (one niced run on the example) and the edit that broke it was not identified.
- **Branch ownership of the shop2 BR `3852eb50` final solver** rests on robin's merge messages matching commit messages; the first commit carrying the blob is `75bf143`.
- **ST mechanism** rests on one task (planning) and four runs. Shop2's 0.69 came with five full-write agents and a validator-found bug fix by another agent.
- **Load.** The task description predicts load effects; the transcripts show agents reacting to slow wall-clock runs, but no load figure was recorded per run in these files.
- **The cost extraction** is a regex over free text and uses the agents' instance, not the grader's.
- **Nothing here supports tuning any arm against the grader.** All explanations above come from what agents saw and did, not from what the grader rewards.
