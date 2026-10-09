Model output (a subagent's count of deference to teammates in rounds 29 and 30), not verified by hand.

> Checked by hand in the main session:
> - **e30-r0 expr:** the chain is as described (finch drops #10 at 6.1; plover leaves at 8.4; robin asks finch and waits, with the first VM edit at 11.8; no compiler file in the diff). It was found by hand before this count.
> - **e30-r4 wasmi:** swift at 2.4 posts "Finch owns test writing", and at 10.7 posts "no coredump e2e file exists yet. Are you writing it now…".
> - **Corrected, e30-r4 scriggo:** heron asks crane at 9.9, 10.5, 10.8 and 11.3. Crane's last tool call is a `read` at 6.6 minutes. Crane's only later event is one `usage` at 13.3, so it was inside a single model call from 6.6 to the end, not "no events after 9.5". The deference was stale either way.

# Deference to teammates in rounds 29 and 30 (e29-rtests-r0..r4, e30-rinteg-r0..r4)

## Methods

**Source.** Only `events.jsonl` was used: `post` events (1,200+ posts over the 10 runs) and the `done` reasons. The `<agent>.messages.json` files contain tool calls and "thinking" blocks that are one-line headings (for example "Waiting for Finch"), and no assistant prose, so they add no deference text beyond the posts. Minutes are from `run_start`. "Line" in the table is the line number in `events.jsonl` (event index + 1).

**Finding candidates.** I ran a regex over all posts (avoid, won't edit/touch, own(s)/owner, working on, anyone, waiting/wait, confirm, leave it, until, once ... lands, before touching, scope, are you, is X doing ..., your file/area, please confirm), then read the hits run by run (about 450 in the broad pass, a narrower pass for the second read). Pure claims ("Taking #7") and status reports were dropped. A second scan listed posts that name a teammate who had already left (`done`) or had dropped an item in the previous 8 minutes. A third scan listed every post with "owns/owner/belongs/defer" that was not already a candidate, and the `done` reasons (two were added: plover leaving in e30-r0, dunlin leaving in e29-r4). Posts that ask an unnamed "anyone" (for example robin at e30-r0 line 1521, "Is anyone editing test/trycatch/trycatch_test.go") were not counted, because there is no named teammate to check. **The candidate list was assembled by hand from regex hits, so recall is unknown; an episode phrased without any of the words above would be missed.**

**Episode.** A chain of one or more posts by one agent about one area and one set of named teammates. The agent (a) says it will not edit / will avoid / will wait for something that a named teammate is said to own or be doing (type A, "avoid or leave"), or (b) asks the teammate whether they are working on it, asks them to confirm or supply an interface before the agent proceeds, or says it waits (type W, "wait or ask"). Routine claims ("I own the parser, please avoid it") are not episodes; the agent who receives a claim and answers "I will avoid it" is. 75 episodes were kept.

**Area and liveness.** For each episode I fixed a file-path regex for the area (for example expr compiler/VM = `compiler|vm.go|/vm/|opcode|program.go`; the exact regex is in the scratch scripts, which were deleted; the area label column says what it covers). Per post: **L (live)** = a named teammate made an `edit`/`write` to a file of that area in the project within 2 min before or after the post, and had not already left; **U** = no edit within 2 min but one within the next 6 min; **P (paused holder)** = no edit, but the teammate holds an open item in the project and edited the area earlier; **S (stale)** = none of these (teammate dropped the item, had left, was in another project, or had never edited the area). Chain class: all L = live; all S = stale; anything else = unclear. The "ownership" tested is therefore "was editing the area", not "held an item", because holding was common without any editing. Task-list state came from `task_add/task_take/task_done/task_drop` events.

**Cost.** For non-live episodes: minutes from the first post to the next edit of the area by anyone ("never" = no later edit of that regex in the run), and minutes to the first edit by the deferring agent. The final-diff column is "files matching the area regex in `<repo>.diff` / total files in the diff". Scores are `perTask[...].score` from `experiments/deepswe/results`.

**Answers.** A "question" is any chain post containing `?`, "confirm", "let me know" or "please share/advise/tell/send/respond". It counts as answered if a named teammate posted within 6 min a message that mentions the asker's name. This misses answers by action only and answers that do not name the asker.

**Sanity checks done by hand:** e30-r0 expr (finch's last event is at 6.2 after dropping #10 at 6.1; robin's four questions got no answer; the final expr diff has no `compiler/` file); e30-r4 wasmi (finch added item #7 and never edited wasmi; swift took #7 at 2.4 saying "Finch owns test writing", and wrote the only wasmi E2E test at 13.3); e30-r4 scriggo heron/crane, e29-r1 and e29-r4 stale rows (post text and edit lists were read). The other rows were classified by the script only.

## Summary

| | count |
|---|---|
| Episodes (chains), 10 runs | 75 (4 to 10 per run, mean 7.5); 34 of the 50 run x project pairs have at least one |
| Type A (avoid or leave) / type W (wait or ask) | 37 / 38 |
| Live / unclear / stale | 56 / 9 / 10 (stale share 13%; stale plus unclear 25%) |
| Stale or unclear with cost >= 2 min or "never" (first post to next edit of the area) | stale: a1, a2, a2b (same project), e7, j8, k1; unclear: a5, g2, i2, b9, c6 |
| Question posts / answered by a named teammate within 6 min | 64 / 33 (52%), median 0.6 min, max 2.9 min. Live chains 28 of 42, unclear 3 of 8, stale 2 of 14 |

Episodes per run (all / stale): e29 r0 4/0, r1 9/1, r2 6/1, r3 4/0, r4 9/2; e30 r0 7/3, r1 10/0, r2 9/1, r3 10/0, r4 7/2.

**Most deference is live.** In 56 of 75 episodes the named teammate was editing the area within 2 min, and the answer, when asked for, came in under a minute. These look like ordinary coordination between two people who are both working.

**Stale deference exists but is rare and mostly cheap.** Of the 10 stale episodes, 4 cost under 2 min (h1 answered in 0.2 min, g7 1.4, e4b 1.6, j7 1.7). Four cost 2 min or more in two projects (a1, a2, a2b in e30-r0 expr; e7 in e30-r4 wasmi), and two more (j8, k1) show a mechanical cost although nothing was blocked:

| project | episodes | cost | final diff | score |
|---|---|---|---|---|
| e30-r0 expr | a1 (robin), a2 (plover), a2b (plover leaves) | 4.1 to 5.1 min to the first VM edit; compiler never edited | no `compiler/` file | 0 |
| e30-r4 wasmi | e7 (swift, test file) | 10.9 min until swift wrote the test itself | no wasmi E2E test file in the diff | 0.773 |
| e29-r4 tengo | j8 (tern asks finch) | 2.2 min, but tern was not blocked: it worked on the parser | normal | 0.857 |
| e30-r2 scriggo | k1 (kite, "avoiding swift's receiver parser changes") | "never" is an artefact: swift had left at 5.0 and nothing was blocked | normal | 0 |

By my reading only the first two rows are costly deference to a teammate who was not working (strict count: **2 of 50 pairs**, mean score 0.386 against 0.439 for the other 48). Counting all four rows mechanically (loose count: **4 of 50**), the mean is 0.407 against 0.439 for the other 46. Projects with any stale episode, whatever the cost (7 of 50): 0.379 against 0.446 for the other 43. These are means only, and they are not a test: the project mix dominates the means (project means over the 10 runs: tengo 0.879, expr 0.535, wasmi 0.473, scriggo 0.246, oxvg 0.050), and the flagged projects are mostly expr and scriggo. Within expr, the flagged e30-r0 scored 0 against an expr mean of 0.535.

## The clearest stale cases (hand-checked)

1. **e30-r0, expr (lines 1223, 1264, 1384, 1429, 1516, 1573, 1671, 1718, 1973, 2083, 2141 of `events.jsonl`).** Finch dropped item #10 (expr runtime/compiler) at 6.1 and its last event is at 6.2. Plover took #10 at 6.6, wrote `throw`/`errtype` in `builtin.go` only, and at 8.4 left with the reason that block try/catch "require Finch's VM/compiler work". Robin (integrate item #11, 7.7) said "plover/finch own implementation files, so I'll avoid touching their compiler/VM/builtins", then asked finch at 8.7, 10.7 and 11.3 (and said at 9.5 that it was avoiding edits until Finch confirms); none was answered. Robin's first VM edit is at 11.8. No `compiler/` file is in the final diff and expr scored 0. This is the pattern in the hypothesis, as found by hand.
2. **e30-r4, wasmi (lines 303 and 2080).** Finch added the wasmi test item #7 at 1.3 but took expr work and never edited wasmi. Swift took #7 at 2.4 ("Finch owns test writing; I'll handle core implementation") and asked finch at 10.7 whether finch was writing the test. No answer. The only wasmi E2E test is swift's own `coredump_e2e.rs` at 13.3: 10.9 min after swift's first post (2.4) and 2.6 min after its question; it is not in the final diff. Wasmi still scored 0.773, so the cost here is a late test, not a lost score.
3. **e30-r4, scriggo (lines 1977, 2007, 2060, 2089, 2112, 2137).** Heron was blocked on `types/defined.go` and `ptr.go` (method registry) and asked crane five times between 9.9 and 11.3 whether crane was editing them, saying "I haven't edited those files yet while waiting to avoid conflicts". Crane held #13 (checker/types) from 4.5, had made one scriggo edit (`checker_statements.go`, 5.6), posted nothing after 8.5 and had no tool or post event between 9.5 and 12. Heron started the files itself at 11.5 without an answer (1.6 min after the first ask, longer counting from its block at about 8.3). Scriggo scored 0 in that run, with many other causes in the round 30 report.

Next unclear case worth a look: e30-r0 scriggo a5 (lines 959 and 1619, lark waits for kite's emitter work; kite held #13 from 4.5 and first edited the emitter at 9.7; 4.0 min; scriggo scored 0.75).

## Doubts about the classification

- **Recall.** Candidates come from regex hits read by hand. Deference without the listed words, or in the first line of a long post, is not counted. Counts of episodes are lower bounds; the stale share is more reliable than the totals.
- **"Live" is generous.** Live means "edited a file of the area within 2 min". For broad areas (scriggo `checker`, expr `compiler|vm`) any edit by the teammate counts, even if it is not the part the deferring agent needed. Some live rows may be stale in the narrow sense.
- **"Stale" is strict on holding.** A teammate who holds an open item but made no edits in the window is stale (e4b crane) or paused (P), and a teammate who finished their part is stale even though the post may just mean "that is done". Posts after a teammate has finished (k1) are the weakest stale rows.
- **Cost is the time to the next edit of the area regex by anyone**, not proof that the deferral caused the delay. For j8, k1 and the live rows the number is not a real cost (rows "live" show n/a).
- **Answers** miss replies by action or without the asker's name. The 2 of 14 answered stale questions is therefore a floor, but the e30-r0 and e30-r4 silences were checked by hand.
- **Agent liveness.** I used edits only. An agent running a long test or thinking for minutes (crane at 9.5 to 12) looks idle in `events.jsonl` and may not have been "away".
- The three cases above show the behaviour; two pairs of 50 is too few to say it moves the arm mean. The data do not show that stale deference separates low-scoring projects: the flagged project scores were 0, 0.773, 0.857, 0.

## Appendix: area regexes (paths relative to the repository)

- compiler/VM (expr, tengo): `compiler|vm\.go|/vm/|^vm/|opcode|program\.go`
- parser/AST: `parser|(^|/)ast(/|\.go)|pattern`; tests: `test|e2e`; scriggo checker `checker|types/|compilation|typeinfo`, parser `parser|(^|/)ast/`, emitter `emitter|runtime`; wasmi config/error `config|error\.rs`, executor/state `executor|state\.rs|coredump|core_dump|handler`.
- Specific ones: e4b `types/(defined|ptr)`; b5 `state\.rs|coredump|snapshot`; c6 `executor|state\.rs`; e6/e7 etc. as labelled in the table.

## Table of episodes

Columns: id; run; project; deferring agent; `events.jsonl` line(s) of the post(s) (for a2b and j9 the `done` event); minute(s); named teammate(s); area; type (A avoid/leave, W wait/ask); per-post liveness string (L live, U edit within next 6 min, P paused holder, S stale) and chain class; minutes to the next area edit by anyone (n/a for live); minutes to the deferring agent's own first area edit after the post; area files in the final diff / all files in the diff; project score; questions answered / questions asked.

| id | run | project | agent | line(s) | min | teammate | area | type | liveness -> class | cost any | cost own | diff | score | Q a/n |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| f1 | e29-rtests-r0 | expr | crane | 887,1207,1758 | 6.9-11.7 | tern | expr compiler | W | LLL -> live | n/a | n/a | 5/15 | 0.974 | 1/2 |
| f3 | e29-rtests-r0 | wasmi | linnet | 954 | 7.3 | robin | wasmi config/error | A | L -> live | n/a | n/a | 3/89 | 0 | - |
| f2 | e29-rtests-r0 | expr | finch | 1786 | 11.9 | tern | expr compiler | W | L -> live | n/a | n/a | 5/15 | 0.974 | 1/1 |
| f5 | e29-rtests-r0 | wasmi | dunlin | 2096 | 14.8 | wren/plover | wasmi executor capture | W | L -> live | n/a | n/a | 9/89 | 0 | 1/1 |
| g1 | e29-rtests-r1 | scriggo | swift | 278,329 | 2.4-2.7 | finch | scriggo (tests then build) | W | LL -> live | n/a | n/a | 1/8 | 0 | - |
| g2 | e29-rtests-r1 | tengo | swift | 559 | 3.5 | robin | tengo VM | A | U -> unclear | 2.3 | - | 3/10 | 0.857 | - |
| g3 | e29-rtests-r1 | expr | kite | 608 | 3.8 | heron | expr builtins | A | L -> live | n/a | n/a | 3/14 | 0.342 | 1/1 |
| g4 | e29-rtests-r1 | wasmi | linnet | 1086 | 5.2 | crane | wasmi config/error | A | L -> live | n/a | n/a | 2/231 | 0.364 | 1/1 |
| g5 | e29-rtests-r1 | tengo | finch | 1135,1284 | 5.5-5.8 | robin | tengo compiler | A | LL -> live | n/a | n/a | 3/10 | 0.857 | 1/1 |
| g6 | e29-rtests-r1 | tengo | wren | 1332,1409,1568 | 5.9-6.7 | robin | tengo compiler.go | W | LLL -> live | n/a | n/a | 3/10 | 0.857 | 1/1 |
| g7 | e29-rtests-r1 | expr | kite | 1862 | 7.6 | robin | expr compiler | W | S -> stale | 1.4 | - | 4/14 | 0.342 | 0/1 |
| g8 | e29-rtests-r1 | expr | robin | 2048,2192,2364 | 8.2-9.0 | heron | expr VM | W | LLL -> live | n/a | n/a | 3/14 | 0.342 | 2/2 |
| g9 | e29-rtests-r1 | scriggo | swift | 2825 | 10.4 | crane | scriggo parser | A | L -> live | n/a | n/a | 4/8 | 0 | - |
| h1 | e29-rtests-r2 | expr | linnet | 1101,1375,1406 | 7.2-8.2 | finch/crane | expr compiler | W | SSS -> stale | 1.6 | 1.6 | 4/14 | 0.683 | 2/2 |
| h4 | e29-rtests-r2 | scriggo | tern | 2052 | 9.9 | crane | scriggo types/checker | W | L -> live | n/a | n/a | 5/8 | 0 | 1/1 |
| h5 | e29-rtests-r2 | scriggo | kite | 2061 | 10.0 | crane | scriggo checker_statements | W | L -> live | n/a | n/a | 2/8 | 0 | 1/1 |
| h6 | e29-rtests-r2 | scriggo | plover | 2148 | 10.2 | finch | scriggo tests | A | L -> live | n/a | n/a | 2/8 | 0 | - |
| h2 | e29-rtests-r2 | expr | lark | 2168,2486 | 10.3-11.4 | linnet | expr vm.go | W | LL -> live | n/a | n/a | 3/14 | 0.683 | 0/2 |
| h3 | e29-rtests-r2 | expr | dunlin | 2518 | 11.5 | linnet | expr vm.go | W | L -> live | n/a | n/a | 3/14 | 0.683 | 1/1 |
| i2 | e29-rtests-r3 | expr | heron | 836 | 5.6 | crane | expr compiler/VM protocol | W | U -> unclear | 2.4 | 4.8 | 5/14 | 0.949 | 1/1 |
| i1 | e29-rtests-r3 | wasmi | linnet | 1014 | 6.3 | tern | wasmi executor/mod.rs | A | L -> live | n/a | n/a | 1/8 | 0.773 | - |
| i3 | e29-rtests-r3 | expr | crane | 1609 | 9.3 | kite | expr parser | W | L -> live | n/a | n/a | 4/14 | 0.949 | 1/1 |
| i4 | e29-rtests-r3 | expr | crane | 2282 | 12.7 | robin | expr builtin | A | L -> live | n/a | n/a | 3/14 | 0.949 | - |
| j7 | e29-rtests-r4 | tengo | finch | 219 | 1.9 | wren | tengo parser | A | S -> stale | 1.7 | - | 4/6 | 0.857 | - |
| j8 | e29-rtests-r4 | tengo | tern | 449 | 3.3 | finch | tengo compiler | W | S -> stale | 2.2 | - | 1/6 | 0.857 | 0/1 |
| j9 | e29-rtests-r4 | oxvg | dunlin | 1113 | 6.6 | plover | oxvg (on leaving) | A | L -> live | n/a | n/a | 4/4 | 0 | - |
| j1 | e29-rtests-r4 | scriggo | tern | 1405,1502 | 7.7-8.1 | linnet | scriggo types/checker | W | LL -> live | n/a | n/a | 7/12 | 0 | 2/2 |
| j2 | e29-rtests-r4 | scriggo | linnet | 1598,1655 | 8.6-8.9 | tern | scriggo types/defined.go | W | LL -> live | n/a | n/a | 4/12 | 0 | 1/1 |
| j4 | e29-rtests-r4 | wasmi | finch | 1870 | 10.0 | lark | wasmi state.rs | A | L -> live | n/a | n/a | 1/16 | 0.682 | - |
| j3 | e29-rtests-r4 | wasmi | heron | 1889 | 10.1 | lark | wasmi state.rs | A | L -> live | n/a | n/a | 1/16 | 0.682 | - |
| j6 | e29-rtests-r4 | oxvg | robin | 2009,2105 | 10.6-11.1 | plover | oxvg visitor/selector | W | PP -> unclear | 1.4 | 1.4 | 3/4 | 0 | 0/2 |
| j5 | e29-rtests-r4 | wasmi | lark | 2038,2129 | 10.7-11.3 | finch | wasmi coredump.rs/executor | W | LL -> live | n/a | n/a | 9/16 | 0.682 | 0/1 |
| a3 | e30-rinteg-r0 | tengo | swift | 298,315 | 3.0-3.2 | robin | tengo parser/AST | A | LL -> live | n/a | n/a | 5/8 | 0.945 | 1/1 |
| a4 | e30-rinteg-r0 | scriggo | kite | 562 | 4.5 | lark | scriggo checker/parser | A | L -> live | n/a | n/a | 8/12 | 0.75 | - |
| a6 | e30-rinteg-r0 | tengo | robin | 722,1063,1294 | 5.1-7.0 | swift | tengo compiler/VM | A | LLL -> live | n/a | n/a | 3/8 | 0.945 | - |
| a5 | e30-rinteg-r0 | scriggo | lark | 959,1619 | 5.7-8.9 | kite | scriggo emitter/runtime | W | UL -> unclear | 4.0 | - | 2/12 | 0.75 | 0/1 |
| a2 | e30-rinteg-r0 | expr | plover | 1223,1264,1384 | 6.7-7.5 | finch | expr compiler/VM | A | SSS -> stale | 5.1 | - | 4/13 | 0 | - |
| a1 | e30-rinteg-r0 | expr | robin | 1429,1573,1671,1718,1973,2083,2141 | 7.7-11.7 | plover/finch | expr compiler/VM | W | SSSSSSS -> stale | 4.1 | 4.1 | 4/13 | 0 | 0/4 |
| a2b | e30-rinteg-r0 | expr | plover | 1516 | 8.4 | finch | expr compiler/VM (on leaving) | A | S -> stale | 3.4 | - | 4/13 | 0 | - |
| b1 | e30-rinteg-r1 | tengo | heron | 616 | 4.7 | lark | tengo parser/AST (wait for AST) | W | L -> live | n/a | n/a | 2/4 | 0.813 | 1/1 |
| b3 | e30-rinteg-r1 | wasmi | finch | 868 | 5.5 | crane | wasmi config/error | A | L -> live | n/a | n/a | 2/13 | 0.682 | - |
| b4 | e30-rinteg-r1 | wasmi | swift | 889 | 5.5 | crane | wasmi config/error/executor | A | L -> live | n/a | n/a | 9/13 | 0.682 | - |
| b2 | e30-rinteg-r1 | wasmi | crane | 962 | 5.8 | tern | wasmi executor/state | W | L -> live | n/a | n/a | 7/13 | 0.682 | 0/1 |
| b5 | e30-rinteg-r1 | wasmi | finch | 1111,1288,1727,1953,1983 | 6.2-8.9 | tern | wasmi snapshot (state.rs/coredump) | W | LLLLL -> live | n/a | n/a | 4/13 | 0.682 | 4/4 |
| b6 | e30-rinteg-r1 | scriggo | kite | 1229 | 6.5 | wren | scriggo AST/parser | W | L -> live | n/a | n/a | 4/14 | 0 | - |
| b7 | e30-rinteg-r1 | expr | swift | 1258,1506 | 6.5-7.1 | linnet | expr compiler/VM | A | LL -> live | n/a | n/a | 5/13 | 0.202 | - |
| b8 | e30-rinteg-r1 | expr | linnet | 1370 | 6.8 | swift | expr VM opcodes | W | U -> unclear | 1.0 | 1.0 | 5/13 | 0.202 | 1/1 |
| b9 | e30-rinteg-r1 | oxvg | dunlin | 1749 | 7.9 | robin/plover | oxvg tests | W | P -> unclear | never | - | 1/2 | 0 | 0/1 |
| b10 | e30-rinteg-r1 | wasmi | dunlin | 2422 | 10.6 | tern | wasmi tests file | A | L -> live | n/a | n/a | 2/13 | 0.682 | - |
| c1 | e30-rinteg-r2 | tengo | wren | 723 | 4.2 | kite/lark | tengo parser | A | L -> live | n/a | n/a | 5/8 | 0.912 | 1/1 |
| c2 | e30-rinteg-r2 | tengo | lark | 780 | 4.4 | kite | tengo parser | W | L -> live | n/a | n/a | 5/8 | 0.912 | 0/1 |
| k1 | e30-rinteg-r2 | scriggo | kite | 1014 | 5.5 | swift | scriggo parser (receiver) | A | S -> stale | never | - | 3/12 | 0 | - |
| c3 | e30-rinteg-r2 | tengo | lark | 1070,1253 | 5.6-6.2 | wren/kite | tengo compiler.go | A | LL -> live | n/a | n/a | 3/8 | 0.912 | - |
| c4 | e30-rinteg-r2 | expr | finch | 1094,1190,1453 | 5.7-6.8 | tern | expr VM opcodes | W | LLL -> live | n/a | n/a | 4/14 | 1.0 | 0/3 |
| c5 | e30-rinteg-r2 | wasmi | dunlin | 1648,2488,2555 | 7.5-12.6 | kite/wren | wasmi state.rs/executor | W | LLL -> live | n/a | n/a | 4/8 | 0.136 | 2/2 |
| c8 | e30-rinteg-r2 | tengo | lark | 1956 | 8.8 | robin | tengo parser | A | L -> live | n/a | n/a | 5/8 | 0.912 | - |
| c7 | e30-rinteg-r2 | wasmi | wren | 2253 | 9.8 | plover | wasmi tests file | A | P -> unclear | 0.2 | 0.2 | 4/8 | 0.136 | - |
| c6 | e30-rinteg-r2 | wasmi | kite | 2476 | 12.1 | dunlin | wasmi executor hook | W | S -> unclear | never | - | 0/8 | 0.136 | 0/1 |
| d1 | e30-rinteg-r3 | tengo | tern | 600,709,765 | 4.9-5.3 | kite | tengo parser/compiler | W | LLL -> live | n/a | n/a | 8/9 | 0.879 | - |
| d3 | e30-rinteg-r3 | expr | heron | 679,784 | 5.1-5.4 | finch | expr compiler | A | UL -> unclear | 1.7 | 1.7 | 4/14 | 0.936 | 1/1 |
| d2 | e30-rinteg-r3 | tengo | kite | 938,1334 | 6.1-7.4 | tern | tengo compiler/VM | A | LL -> live | n/a | n/a | 3/9 | 0.879 | - |
| d9 | e30-rinteg-r3 | scriggo | robin | 1399 | 7.5 | crane | scriggo checker/types | W | L -> live | n/a | n/a | 5/10 | 0.854 | 0/1 |
| d6 | e30-rinteg-r3 | wasmi | swift | 1469,1526,1833 | 7.8-8.8 | kite | wasmi coredump.rs/error.rs | A | LLL -> live | n/a | n/a | 3/9 | 0.136 | - |
| d4 | e30-rinteg-r3 | expr | dunlin | 1500,1842 | 7.9-8.9 | finch | expr compiler | A | LL -> live | n/a | n/a | 4/14 | 0.936 | 0/1 |
| d7 | e30-rinteg-r3 | wasmi | dunlin | 1510 | 7.9 | kite | wasmi coredump.rs | A | L -> live | n/a | n/a | 2/9 | 0.136 | - |
| d5 | e30-rinteg-r3 | expr | heron | 1878 | 9.0 | finch | expr compiler (OpTryEnd) | W | L -> live | n/a | n/a | 4/14 | 0.936 | 0/1 |
| d8 | e30-rinteg-r3 | expr | swift | 1917 | 9.1 | finch | expr compiler | A | L -> live | n/a | n/a | 4/14 | 0.936 | 0/1 |
| d10 | e30-rinteg-r3 | wasmi | kite | 2013,2134 | 9.6-10.3 | crane | wasmi state/executor | W | LL -> live | n/a | n/a | 4/9 | 0.136 | 2/2 |
| e7 | e30-rinteg-r4 | wasmi | swift | 303,2080 | 2.4-10.7 | finch | wasmi test file | W | SS -> stale | 10.9 | 10.9 | 0/12 | 0.773 | 0/1 |
| e1 | e30-rinteg-r4 | expr | finch | 694 | 4.0 | kite | expr compiler/VM/builtin | A | L -> live | n/a | n/a | 5/10 | 0.202 | - |
| e2 | e30-rinteg-r4 | scriggo | crane | 838 | 4.6 | heron | scriggo parser/AST | A | L -> live | n/a | n/a | 3/11 | 0 | - |
| e3 | e30-rinteg-r4 | tengo | wren | 861 | 4.7 | swift | tengo compiler | A | L -> live | n/a | n/a | 1/6 | 0.857 | - |
| e4 | e30-rinteg-r4 | scriggo | heron | 1135 | 5.8 | crane | scriggo checker | W | L -> live | n/a | n/a | 1/11 | 0 | 1/1 |
| e5 | e30-rinteg-r4 | scriggo | dunlin | 1381,1890 | 6.8-9.4 | crane/heron | scriggo parser/checker/runtime/types | A | LL -> live | n/a | n/a | 10/11 | 0 | 0/1 |
| e4b | e30-rinteg-r4 | scriggo | heron | 1977,2007,2060,2089,2112,2137 | 9.9-11.3 | crane | scriggo types/defined.go, ptr.go | W | SSSSSS -> stale | 1.6 | 1.6 | 3/11 | 0 | 0/5 |
