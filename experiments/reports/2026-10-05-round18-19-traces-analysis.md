This report is model output (subagent analysis of the transcripts). Claims marked ✓ were verified by hand by the main session (2026-10-05 13:57); the list below gives what was checked and one correction.

**Verified by hand (main session):**
- ✓ e18-swarm-r0: 12 `done` events from 11 agents (dunlin twice); lark has no `done`, its last message is a plain final text, and its last tool call is at 34.0 min.
- ✓ e18-solo-r1: ten `read` calls, then `done`; no bash call. The persistence line is in both C1P transcripts' system prompts.
- ✓ e18-swarm-r1: tern called `done` at 2.8 min ("I claimed Tengo, but the requested destructuring feature spans ..."); crane's posts at 60.5–64.5 min ask tern about Tengo and report the repository clean.
- ✓ e18-swarm-r1 dasel: `new.log` has "panic: test timed out after 10m0s" in `TestReadHTMLScriptStyle`.
- ✓ e19-stagger-tail-r0: finch's last tool result is "Operation aborted"; the oxvg logs show `E0308` and `E0282`; tern made 1 edit and called `done` at 6.9 min.
- ✓ e19-stagger-file-r0: 87 write/edit calls on `TEAM.md`, 35 of them returned an error.
- **Correction (expr in r1):** counting `edit`/`write` calls, nobody edited expr in r1 until plover at 91.5 min (50 edits), then crane from 101.0 min (16). So expr's 0.886 was built in the last 29 minutes of the run, not from 73–75 min as written in section 1 (plover's earlier posts are status checks).

# Rounds 18 and 19: findings from the transcripts

Arm glosses. ST = 12 equal agents, staggered entry, post-only board, write guard, clock. C1P = one agent with the clock and a "keep working until everything is implemented and verified" line in its system prompt. ST-tail = ST where every tool result also carries each teammate's latest post (first 100 chars). ST-file = no board, only a shared TEAM.md that the agents maintain, shown in each agent's first prompt. ST-threads / ST-norms / ST-tasks = ST with a threaded board / a fuller board-use briefing / a shared task list (all three invalid: usage-limit stop).

Method: replayed `events.jsonl` and `<agent>.messages.json` per batch. File-overlap counts use `edit`/`write` calls only (bash heredocs are not counted). Times are minutes since `run_start`. Paths are under `experiments/deepswe/runs/<batch>/b/murmur/run/`. Helper scripts were in `tmp/claude-r18traces/` (deleted).

## 1. Round 18 swarm: why r0 stopped at 34 min and r1 ran to 120 min

Correction from the coordinator, confirmed: in r0 11 of 12 agents called `done` (12 done events, dunlin called it twice at 2.9 and 4.7 min). Lark never called `done`.

r0 (36.1M tokens, $0.60, ended 34.2 min, reason quiescent):
- Done order: robin 1.7, dunlin 2.9 and 4.7, finch 4.7, swift 9.1, crane 10.3, linnet 10.5, tern 12.1, kite 14.7, heron 16.2, wren 21.9, plover 22.8. Not a cascade; each agent called `done` when its own slice was finished.
- Several dones admit the work was partial and still stop. Tern (12.1): "the assigned change is only partially complete" (Scriggo). Heron (16.2): "Full execution-state capture ... remains incomplete" (Wasmi). Linnet (10.5): "Full HTML5 tree-building edge cases remain beyond the lightweight parser". Crane (10.3): "remaining project features are with their assigned owners".
- Robin (1.7) gave up on oxvg: "I couldn't implement it safely within this task session". Zero edits, diff 0 bytes.
- Early board (0-2 min): all ten repos claimed by about 2 min, with duplicate claims on expr (wren, kite, tern, linnet, plover) and fastapi (lark, dunlin). Posts such as crane 6.0 "I'm available to help another project ... all projects appear owned" and plover 1.8 "All ten now appear claimed" show that agents with no free repo offered help and then called `done` or went quiet. Nobody picked up Scriggo, Wasmi or participle after the owner stopped.
- Lark stopped without `done`: at 32.7 it posted "FastAPI GET+all HTTP decorator signature parity implemented and tests pass now; no further edits needed ... Please stop any work there". Then it ran `pytest -q` (3156 passed, 2 skipped, 5 xfailed), `git diff --check`, `git status`, and ended its turn with a plain final message ("Implemented implicit HEAD/OPTIONS handling ... full suite passes"), with 86 minutes left. It was the last agent still working (its tool calls ran to 34.2 min; every other agent was done by 22.8). Its turn ended without calling the tool, and with the other 11 done, nobody was left to wake it, so murmur ended the run as quiescent. Its repo was the only one it believed unfinished until the test run passed; it simply treated "answer finished" as the end. The same thing happened to r1's `crane` and `plover` only at the clock (see below), and to tern in the ST-file arm (ended with a final message at about 6 min, no `done`).
- The run therefore ended because every agent either considered its own slice complete or had no slice, not because the tasks were finished (scores: 5 of 10 tasks at 0 or 0.136).

r1 (337M tokens, $4.21, 119.8 min):
- 10 dones; plover and crane never called it. At the clock plover was mid-edit on expr (0.3 min left) and its last text was "I did not complete every requested Expr behavior".
- Early dones were similar to r0 (robin 2.4, tern 2.8, swift 5.6, wren 6.5, finch 7.3, lark 15.3, kite 19.9) but four agents (heron, crane, linnet, plover, plus dunlin to 46 min) did not stop. The difference was behavioural: they kept finishing a slice and then offering help ("crane 5.8: I can take a discrete subtask", "plover 15.0: I can pick up another incomplete task ... Wasmi trap snapshots are still shallow") and then actually took it, mostly on the hard repos (Scriggo, Wasmi, then Tengo and Expr). Tool calls per 10-min bucket: at 60-90 min only crane, plover and heron were active (about 60-70 calls per bucket each).
- Tern (2.8) said it would not implement Tengo ("handing off as incomplete rather than leave partial, misleading changes") and called done; crane noticed at 60.7 ("no Tengo working tree changes visible and no response") and took Tengo with plover around 63-75 min. Expr, claimed by four agents who all moved on (finch, swift, kite, linnet), had no owner until plover took a slice at 73-75 min and crane at 93.
- Visible trigger: no early "impossible" cascade in either run; the one "can't be done" was robin in r0 (oxvg) and tern in r1 (Tengo). What differed is that r1 had 3-5 agents who did not call done after their own repo and re-spread over unowned work.
- r1 ended by the clock but is labelled `quiescent` in `result.json` (last events are tool calls at 0.3 min left; the label is the run's own reason string, not a quiet swarm).
- Wakes: only 3-4 per run (r0: swift 4.5 and 6.9, crane 5.9 and 6.5; r1: kite 4.2, crane 5.7, plover 114.9). Done agents are not woken by posts (crane/tern exchange above).

## 2. Round 18 C1P (single agent with the persistence line)

- r0: 13.0 min, 2.0M tokens, $0.043, 158 messages. Read all 10 tasks in 0.2 min, used `run` about 30 times, touched only cattrs (13 edits) and fastapi (middleware class). Done reason (quote): "I could not complete the requested work across all 10 repositories ... the remaining requested behavior ... remains unimplemented. The full goal is therefore not met." The last tool result said 107.0 minutes left. It also ran `go test ./...` on five repos in one bash at 5.1 and waited about 3.8 min for it.
- r1: 0.4 min, 47k tokens, $0.0028. Read the 10 task files and called done with "This assignment requests ten independent repository-level changes across different toolchains, and no project command can be run in this execution context." It never called bash or `run`. Its tools list included bash; the task text says "Their toolchains are not installed in your own environment: to run any command ... use `run <project> <command...>`", which it appears to have misread. Reasoning is encrypted, so the cause cannot be seen; the claim was false (r0 ran `run` commands successfully). Its final text: "I'm unable to complete all ten repository changes in this execution context."
- The persistence line is present in the system prompt (`addendum` in the system message of both transcripts). Visible effect: none beyond r0's honest done reason. r0 did no re-read of the tasks before done and did no check beyond cattrs tests; r1 stopped at the first step. Both used `done` as the "give up with the reason" exit the tool description offers.

## 3. Round 18 swarm spread, overlaps, and the swings

Edit/write calls per repo (agents):

| task | r0 (score) | r1 (score) |
|---|---|---|
| expr | plover 38, wren 28 (0) | plover 50, crane 16 (0.886) |
| oxvg | none (0) | lark 7 (0) |
| scriggo | tern 11 (0) | dunlin 45, crane 35, linnet 17, swift 5 (0.973) |
| tengo | swift 14, crane 7 (0.714) | plover 32, crane 26 (1.0 binary) |
| wasmi | heron 20 (0.136) | plover 70, heron 62, crane 14, linnet 5 (1.0 binary) |
| scc | kite 19 (0.903) | heron 26, finch 11 (0.806) |
| participle | crane 8 (0) | kite 57 (0.135) |
| dasel | linnet 16 (0.925) | wren 15 (0.219) |
| fastapi | lark 50, dunlin 4 (0.977) | dunlin 30, plover 17, linnet 7, robin 1 (0.744) |
| cattrs | finch 13 (0.899) | crane 26 (0.942) |

Duplicate/overlap: shared files exist in both runs, mostly where agents deliberately split a repo (r0 expr builtin/errtype.go wren 10, plover 2; r0 tengo compiler.go; r1 wasmi state.rs plover 15 and heron 3, scc bounded_memory.go finch 6 and heron 10, fastapi routing.py dunlin 21 and plover 13). Overwrites of another agent's `write`: two in r1 (wasmi coredump.rs plover then linnet; coredump/merge.rs heron then crane), none in r0. Concurrent edits did cause visible breakage in r0 expr ("Build currently fails builtin/errtype.go:20 undefined: errorsUnwrap (your concurrent edit?)" at 5.3).

Oxvg: r0 nobody (robin gave up at 1.7). r1 lark (7 edits, done at 15.3, "cargo check, cargo fmt --check, and collapse_groups tests pass"); the grader's new log shows 4 passed and 6 failed of 10 (collapse_groups and also `remove_empty_containers` cases), so lark covered only half the requirement. Score 0 in both because the binary reward needs all six of its tests and the score is new_frac x base_frac with new_frac 0.

Big swings (all from the grader logs in `<task>-logs/new.log`):
- expr 0 vs 0.886: r0's two agents declared done at 21.9 and 22.8 with their own tests passing, but the grader panicked ("panic: undefined node type (*ast.TryNode)") and a panic kills the whole test package, so 0 of 79. r1's plover/crane worked through 100 min and passed 70 of 79.
- scriggo 0 vs 0.973: r0 one agent did parser groundwork (11 edits) and declared partial; r1 four agents carried method checking, emitter, runtime and interface dispatch (dunlin done at 46.1 "interface dispatch ... go test ./... passing").
- dasel 0.925 vs 0.219: r1's wren finished at 6.5 min ("go test ./... passes") and nobody reviewed it; the grader hit "panic: test timed out after 10m0s" in `TestReadHTMLScriptStyle/script_tag_content` (an infinite loop in the reader), which aborts the package: 32 passed, 0 failed, 114 never ran. r0's linnet had a working reader.
- fastapi 0.977 vs 0.744: r0 one owner (lark, 50 edits) with a helper; r1 split in four with unclear ownership (robin claimed it, dunlin claimed too, plover took dispatch, linnet wrote tests): 11 failed of 43 in the grader.
- tengo 0.714 vs 1.0 and wasmi 0.136 vs 1.0: r1 put 2 and 4 agents on them for 60 to 100 minutes; r0 left one agent (heron) with the minimal "valid empty coredump" (the done reason says so).
- participle 0 vs 0.135: both fail; r1 grader log shows a Go stack overflow in `TestAnalyzeRecursiveStructure` (package panic).
- Clean binary rewards in r1 (tengo, wasmi) came with new_frac 1 and base_frac 1 (all reference tests pass, none of the base tests broken).

## 4. Round 19 wave 1 (5 tasks, 32M shared cap)

Common: all three arms had the same shape in the first 3 min (rapid claim of the five repos, then 6-8 agents with no free repo posting "all claimed, I'll review" and some calling `done` at 1.4-3.1 min). Dones for "no slice": ST wren-like cases finch 1.5 (oxvg), heron 2.5, plover 2.9, tern 3.1; tail wren 1.4, kite 3.0, plover 7.0; file wren 1.4, crane 3.9.

| arm | tokens, $, minutes, end | mean | expr | oxvg | scriggo | tengo | wasmi |
|---|---|---|---|---|---|---|---|
| ST (control) | 32.1M, $0.527, 39.2, budget | 0.351 | 0.038 | 0 | 0 | 0.945 | 0.773 |
| ST-tail | 32.0M, $0.519, 27.9, budget | 0.275 | 1.0 | 0 | 0 | 0.011 | 0.364 |
| ST-file | 11.0M, $0.228, 28.1, quiescent | 0.234 | 0.342 | 0 | 0 | 0.692 | 0.134 |

Source edits per repo (agents), counting only repo files:
- ST: expr linnet 8; oxvg wren 3; scriggo robin 3, dunlin 6; tengo wren 20, swift 13, linnet 3; wasmi lark 35, kite 10, crane 5. Two files shared (tengo compiler.go; wasmi coredump.rs). 8 agents edited.
- ST-tail: expr swift 11, heron 4; oxvg finch 13; scriggo lark 31, dunlin 16; tengo tern 1; wasmi robin 11, crane 6. No shared files, no overwrites. 8 agents edited.
- ST-file: expr robin 9, linnet 1 (test file); oxvg dunlin 2 (tests only); scriggo kite 5, heron 5; tengo finch 21, plover 8, crane 1; wasmi tern 4. One overwrite (tengo test file, crane then plover). 9 agents edited, but many only wrote tests.
- Oxvg was touched in all three; nobody got it to pass.

ST-tail mechanism: 806 tool results carried the tail (about 1.1 KB each, max 1.3 KB). No assistant text in any transcript mentions it (models emit almost no text, so references cannot be seen directly). Posts: 113 vs 173 for ST. Claim conflicts were fewer on the board (ST: expr announced by 8 agents; tail: 3, crude regex), and the visible effect is in tail posts such as wren 1.3 "Tern has claimed Tengo; handing it off. Swift owns expr", but ST's inbox also produced the same hand-offs, so a tail-specific effect cannot be separated here. Two side effects: a finished agent's last post stays in everyone's tail ("wren: I'll stand by" is shown for the whole run), and agents confused names ("I'm heron (not crane)" at 2.4).

Tail tengo 0.011: wren claimed expr+tengo then handed Tengo to tern (1.3), tern stayed on it but made one edit and called done at 6.9: "Implemented Tengo's required compile-time diagnostic ... Full destructuring patterns ... remain unimplemented." Diff about 500 bytes. Nobody else ever took Tengo, even though the tail listed tern's claim for the whole run. Compare ST where wren, swift and linnet (36 edits) worked Tengo and reached 0.945.

Tail oxvg 0: finch (13 edits) was mid-work when the budget abort fired at 27.9 min (last tool result "Operation aborted"). The final diff does not compile: grader base.log shows `error[E0308]: if and else have incompatible types` and `E0282` in `collapse_groups.rs:133`, "could not compile oxvg_optimiser", so both base and new fractions are 0. Finch's last successful run was an earlier `cargo test` at call 116 that compiled; the breaking edit (call 118 on `collapse_groups.rs`) had not been compiled. Finch did not know; it never called done. This is a budget-cut artifact, not a mistaken completion.

ST-file mechanism:
- TEAM.md: 87 write/edit calls from all 12 agents (wren 1, finch 6, robin 4, tern 3, kite 6, lark 7, swift 6, heron 15, crane 3, dunlin 11, linnet 5, plover 20); 35 of the 87 failed ("Could not find edits[1] in TEAM.md" or "Found 2 occurrences", stale oldText or duplicate text). Two path spellings (`TEAM.md` and `/work/TEAM.md`) were used.
- Reconstruction from the successful edits (approximate, because my replay cannot reproduce multi-edit calls exactly): 6 lines/352 chars at 0.2 min, 14 lines/785 chars at 1.2, 18 lines/about 2.2K chars at 14, 18 lines/3.3K chars at 27.7 (under the 60-line limit). Final file: one line per agent plus Finished/Missing/Verified bullets; it states expr block-form catch, finally, retry missing, tengo function-parameter patterns missing, wasmi runtime capture missing.
- Reads: 66 `read`/`bash` calls mention TEAM.md. The file was injected into each agent's first prompt only once, at entry (plover's first prompt carried 3.1K chars), so later changes were seen only if the agent re-read it.
- Did it help split work? Initial claims were recorded within 1.5 min (as the board did), but no repo got more than 2 coders except Tengo (3) and the work went to tests more than implementations (6 agents wrote independent test files; 4 "validation support" dones).
- Why quiescent at 11M: 11 agents called done between 1.4 and 28.0 min, mostly with "my slice/tests done, rest is with teammates" ("Full swarm goal remains in progress with the other agents", crane 3.9; "All five repository implementations remain in progress with teammates", heron 22.2). The 12th, tern, ended with a plain final message at about 6 min ("Runtime coredump generation and capture are still missing"), which left Wasmi (4 edits only) without a coder. With no board there is no message that wakes an idle agent, so the last done at 28.0 (plover) ended the run. Activity per 5-min bucket fell to 3 agents by 20 min.
- File arm cost: lowest tokens and dollars; lowest mean.

Cross-arm duplicates and spread: per repo the number of editing agents was similar (1-3). ST-tail had no multi-agent files, ST had 2, ST-file 2 plus the TEAM.md contention. ST-tail and ST-file reached 5 repos like ST, so spread did not change; what differed is which repo was abandoned (tail: tengo; file: wasmi; ST: expr, 8 agents claimed it, one with 8 edits).

## 5. Round 19 wave 2 (invalid): mechanism use only

First usage-limit error (stopReason `error`, "You have hit your ChatGPT usage limit (plus plan). Try again in ~50 min." or "Codex error: The usage limit has been reached"): ST-threads 15.4 min (finch; 9 of 12 agents had errors, last tool call 15.4); ST-norms 15.3 (heron; 8 agents); ST-tasks 15.3 (finch and heron; 7 agents). Before that, all three had normal tool use. The batches then ended as "quiescent" at 25.6, 23.0 and 28.2 min with 3.9M, 10.4M and 11.1M tokens. Their `result.json` does not mark the cause; the error is only in the `.messages.json` assistant messages.

Also all three batches contain six cold cargo builds killed by the 1200 s command limit (see section 6), a possible extra handicap besides the quota.

- ST-threads (until the quota): 10 threads opened (nine within 2.7 min: two threads both titled "Project ownership" by wren and finch, then Scriggo ownership, Expr ownership, Cross-project review, Review availability, Implementation assistance, Tengo assistance, Oxvg structural helper; t10 "Tengo parser findings" at 10.8). Tool calls: `thread_new` 10, `reply` 44, `thread_read` 59, `thread_list` 24, only 17 edits and 1 write in total. Ownership was split over two parallel threads (t1 and t2), with corrections such as finch 1.2 "Correction: I'll take Tengo (not expr)" and tern opening a separate Expr thread. Dones: linnet 3.2, dunlin 4.6, plover 12.5 (reviews, no slice).
- ST-norms: 125 posts (average 211 chars vs 224 for ST). Style: claim lines ("I own expr-try-catch-errors (initial claim predates linnet's post)"), findings from reviewing owners' diffs ("flagged invalid variadic receiver parsing"), few thanks or agreements. About 12 posts include a `run ...` command with its result. Agents without a free repo became reviewers (plover 3.2: "No source edits from me"; tern 7.2 "Scriggo review finished") and sometimes took isolated pieces after asking (tern 8.7 "I'll own only `FuncType.ParamPatterns`", heron 10.2). Oxvg was touched (finch 5 edits). Dones: linnet 2.4, plover 6.4, wren 10.9, dunlin 13.5.
- ST-tasks: wren added all five tasks (one per repo) at 0.1-0.2 min and took two himself (tengo 0.4, wasmi 0.4), finch took expr, lark oxvg, swift scriggo. No sub-tasks were ever added (5 `task_add` in total, all by wren). 7 takes, 2 drops (swift drop 1.2 "finished without completing it", lark drop 2.5 "Asked linnet to take over ... need for selector API expertise"), re-taken by plover (1.4) and linnet (2.7). No `task_done`. The `tasks` tool was called 40 times. Dones: swift 1.2, robin 1.8, tern 2.6, lark 3.8, crane 5.3. Oxvg: linnet 7 edits, kite 2, lark 1.

## 6. Infrastructure faults

- hub.log is empty in all ten batches; no sidecar errors found in the events.
- Wave 1 and round 18: no command timeouts of 1200 s. Expected failures only: no network (`proxy.golang.org` lookup failed for participle `-tags analyze`; e18-swarm r0 and r1, solo-r0), which the tasks announce.
- "Blocking waiting for file lock on build directory" appeared in 2-12 results per batch, i.e. concurrent cargo runs in one sidecar (cost time, not failures).
- Wave 2 only: six `run ...` commands hit the 1200 s limit, all cold `cargo test` / `cargo check` on oxvg or wasmi (threads: crane wasmi, wren, heron and kite oxvg; norms: finch oxvg; tasks: linnet, dunlin and kite oxvg), at about 91-98 min left (22-29 min of run time), after the quota had hit. Wave 1 never had one; the oxvg new.log in round 18 r1 reports a 2m04 release build. Suggests the three simultaneous batches (6 or more concurrent heavy builds on 2-CPU sidecars) were slow, but that cannot be separated from the quota stop here. Three shorter agent-set timeouts (20, 30, 120, 300 s) also occurred, which are the agents' own settings.
- Grader-side: panics or hangs abort a whole Go test package (round 18: expr r0 TryNode panic, participle r1 stack overflow, dasel r1 10 min timeout). These are product bugs, but they turn partial work into 0-0.2 scores and may hide partial quality. The oxvg grader's `new` always reports `4 passed, 6 failed` on an untouched repo (an expected baseline of existing tests), so scores for oxvg are 0 with diff 0 bytes.
- Label: round 18 r1's `reason: quiescent` at the clock (see section 1) is a misleading end reason, not a fault.

## Open doubts

- Tail effect: no direct evidence of agents using the tail; assistant text is almost empty, so only post content and timing can hint at it.
- Why lark and tern ended a turn without `done`: the transcripts show a plain final message; whether the prompt's "call done" instruction is read as optional cannot be seen (reasoning encrypted).
- C1P r1's belief that commands cannot run is unexplained (reasoning encrypted).
- ST-file TEAM.md reconstruction is approximate (59 of about 87 replayed edits did not match, partly because 35 actually failed in the run and partly because multi-edit calls apply atomically).
- Single run per arm and batch; per-task swings (expr 0.038 vs 1.0 across arms) are larger than any arm difference.
