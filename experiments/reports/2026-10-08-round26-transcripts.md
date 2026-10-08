Model output (a subagent's analysis of the round 26 transcripts), not verified by hand. Counts come from short scripts over `events.jsonl`, `<agent>.messages.json`, `*.diff` and the score files; interpretations are the subagent's and are marked. Role at a call = the agent's most recent `role(name)` call before it (`none` before the first one). Minutes are from `run_start`. "Edits" = `edit`/`write` tool calls only (writes through `bash` are not counted). Batches: RT = `e26-rtasks-r0..r4` (runs r0..r4), R = `e25-roles-r*`, baseline = `e23-base-r*`, all under `experiments/deepswe/runs/`.
> Checked by hand in the main session: swift's expr help request at 1.2 min in `e26-rtasks-r0`; finch's `task_add` scoping expr to builtins at 0.7 min and kite's "Expr finch owns try/catch builtins" at 1.8 min in `e26-rtasks-r1`; the four edits to wasmi's `state.rs` by heron (8.9), linnet (9.2), plover (9.2) and dunlin (9.3) in `e26-rtasks-r0` and the `duplicate definitions with name coredump_frames` error in its grader log; crane's `task_add` #4 at 1.1 min, kite's take and drop at 7.6–7.7 and wren's take at 12.4 in `e26-rtasks-r3`; the undeclared `Vec` error in `e26-rtasks-r2`'s wasmi grader log; and the per-run task-list, role, `done` and write/edit counts, which the main session computed independently.

# Round 26 transcripts: why roles plus a task list (RT) scored 0.292

## 0. Context

- Every RT run ended at the token cap (`reason: budget`) after 9.4, 10.0, 10.7, 17.3, 13.7 min (R 12-21, baseline 12.7-24.6).
- Per-task means (runs in order r0..r4):

| task | RT | R | baseline |
|---|---|---|---|
| expr | 0.81 0.06 0.34 0.20 0.34 = 0.35 | 0.08 | 0.42 |
| oxvg | 0 in all five (0 in R and baseline too) | 0 | 0 |
| scriggo | 0.52 0 0 0.18 0 = 0.14 | 0.15 | 0.15 |
| tengo | 0.86 0.86 0.10 1.0 0.95 = 0.75 | 0.61 | 0.75 |
| wasmi | 0 0.36 0 0.36 0.36 = 0.22 | 0.36 | 0.46 |

- Against R, RT recovered expr (+0.27) and tengo (+0.14) and lost wasmi (-0.14). Against the baseline the gap is wasmi (-0.24) and expr (-0.07). No run got wasmi above 0.364, the plateau that R also hit in all five runs.

## 1. Do findings turn into work?

**Items (44 over 5 runs).** Adder role: scout 14, builder 12, reviewer 7, researcher 4, tester 3, verifier 3, fixer 1. By my reading of title and details: 18 are reproducible defects (a command or file/line plus a failure), 26 are plan, gap or status items ("implement X", "no diff yet"). Of the 26, 12 are builders' own claims. Taken: 37 (18 self-claims, 19 handoffs); untaken: 7. Median lag from add to first take for handoffs: 1.0 min (range 0.1-11.9; the six slowest were 4.4, 5.3, 6.5, 6.5, 7.0, 11.9 min, all in r2-r4).

**Defect items** (counts of 18):

| outcome | n | examples |
|---|---|---|
| taken by another agent and the code changed as asked | 5 | r1 #2 swift(reviewer)->heron, 1.4 min lag, `builtin.go` edit, done 8.2; r1 #4 swift->wren, 5 tengo edits, done 9.0; r3 #8 dunlin(reviewer)->wren 8.1, 4 edits, done 10.1; r0 #4/#6 (plover/lark testers; see below) |
| taken, "done", but the taker made no edit because the fix had already landed | 3 | r4 #7 kite 8.1: "wren's concurrent fix imported alloc::vec"; #8 tern 9.4; #9 wren 13.2 ("Concurrent registry fix landed") |
| taken, unfinished or dropped | 3 | r4 #5 (crane, 5 edits to `collapse_groups.rs`, oxvg build then broke), r4 #11 (wren, taken 13.4, run ended 13.7), r2 #6 (tern took 8.4, dropped 8.5) |
| self-claimed by the adder | 2 | r2 #7 dunlin (1 edit, done 6.5), r0 #5 swift (no edit by the taker, done 6.7) |
| never taken | 5 | r2 #8 (10.3, robin reviewer: wasmi dump "emits only empty sections"), r4 #4 (2.2, linnet reviewer: "Wasmi coredump only emits empty placeholder", open for 11.5 min), r4 #10, r4 #12, r3 #9 |

- r0 #4/#6 (hand-offs of an expr `finally`/retry failure): linnet (#4) diagnosed it on the board at 7.4 (zero-return `cleanup()` hits `out[0]` in `OpCall`); swift's `vm.go` edits at 7.2-7.5 fixed it, and swift took #6 only at 7.7 after the fix. The item and the board post pointed the same way, but the fix was made by the author of that code, not by the taker.
- r0 #7 (plover scout, 6.8: "array destructuring defaults are still missing") -> dunlin 7.7: dunlin's only edit was a new test (`vm_test.go`) and its done note says defaults "now work", so the claim was stale or already satisfied.
- Handoffs that created new code are the ones that named a missing component: r3 #7 (swift, wasmi, 16 edits), r4 #1 (crane, tengo compiler, 19 edits, score 0.945), r4 #5 (crane, oxvg wiring).
- The items that name the core gap are the slowest to be taken (r3 #4 and r4 #4) or never taken (r2 #8). Easy, local compile or test fixes are taken within 0.1-1.4 min. (Interpretation: the list works as a queue for small defects, not for hard parts.)
- Duplicate items: r3 #4 and #6 are the same block-try gap (plover dropped #6 as "Duplicate of #4" at 13.1 and retook it at 14.9); r0 #9 and #10 are the same wasmi `state.rs` request (see Q2).

**Board posts.** I hand-classified a random sample of 20 agent posts each from r0, r2, r4 (60; "I take the role" excluded): claims, offers and ownership talk 28 (47%); concrete requests or defect reports with a file, test or command 14 (23%); status of the poster's own work 18 (30%), of which about half also carry a failing build or test (for example r0 plover 2.6, r4 lark 5.6). Defect reports with repro commands still go mainly to the board, not the list: r4 lark 7.9, heron 7.9. (Sample classification, not exhaustive.)

## 2. Ganging up or slicing?

Writers (edits) on expr and wasmi, with first and last minute:

| run | expr writers | wasmi writers |
|---|---|---|
| r0 | plover 12 (1.5-6.5, builtins), heron 8 (1.8-4.0, AST/parser), swift 17 (2.4-7.5, VM/compiler), lark 6 (tests), linnet 3 | finch 7 (0.9-8.0); heron, linnet, plover, dunlin join 6.8-9.3 |
| r1 | finch 4, swift 4 (tests), heron 1 (builtins only) | lark 19, plover 7 |
| r2 | heron 14 (builtins to 4.8, VM 8.4-9.5), dunlin 6 (parser 8.1-9.0) | wren 12, finch 15 |
| r3 | wren 17 (builtins to 11.1, try() VM 11.0-15.7), plover 9 (AST/parser 15.5-17.2) | swift 22 (alone) |
| r4 | tern 12 (builtins to 13.3); swift, plover, lark join at 11.2-11.3 | wren 17 (alone) |

- **Expr**: only r0 ganged up on the hard core. swift (the expr starter) posted at 1.2: "Expr implementation is substantial... I need help implementing try/catch/finally AST/parser/compiler/VM. Any teammate willing to own isolated piece (AST/parser or VM handler)", and at 1.5 gave heron the block-syntax AST and parser with a node definition. Five agents were writing expr within 2.4 min, split by layer (builtins, AST/parser, VM/compiler, tests). That run scored 0.81, above every baseline expr run (best 0.80). In r2, r3, r4 second writers reached parser/VM at 8.1, 15.5 and 11.2 min, 1-4 min before the run ended (r3, r4), and as slices: dunlin in r2 at 7.8: "I'll implement Expr parser support for `try(expression, fallback)` only"; plover in r4 wrote VM `OpTry`/`OpEndTry` (12.5-12.8); only r3's plover wrote the block-syntax parser, at 15.5. In r1 nobody joined (Q3).
- **Wasmi coredump capture**: never ganged until the last minutes. r3 and r4 had one writer; r1 and r2 two, split by file (r2 wren: config/error/tests, finch: `state.rs`, `utils.rs`, `exec.rs`, `executor/mod.rs`). In r0 the team ganged up in the last 3 minutes, which broke the build.
- **r0 wasmi break** (`new.log`: E0592 "duplicate definitions with name `coredump_frames`" twice, E0560 `CoredumpFrame` has no field `cells`, E0107). Cause: concurrent edits to the same file. finch asked at 8.2: "Yes, please add focused Stack/CallStack accessor(s) in state.rs ... I'll handle integration." Within 0.4 min four agents each added their own version to `engine/executor/handler/state.rs`: heron 8.9, plover 9.2, linnet 9.2, dunlin 9.3. Their versions have different signatures and return types (`Vec<FrameInfo>`, an iterator of `StackFrameSnapshot`, `Vec<CoredumpFrame>`). Two task items for the same request (#9 dunlin 8.3 and #10 plover 8.4) were each taken by their own adder and neither saw the other. The run hit the cap at 9.4 with nobody left to build. (Interpretation: an open request to "anyone" plus a task-list item per helper multiplies the work instead of splitting it.)
- **r2 wasmi break**: not concurrency. The log shows three `E0433 use of undeclared type Vec` in `executor/mod.rs` (lines 87, 88, 107). finch's last edit to that file came at 10.7, the same minute the run ended; the file has no `Vec` import (no_std crate). wren and finch had agreed explicitly on who edits what (9.7 "avoid conflicting changes").
- Both zeroes come from edits in the last 0.1-1.5 min before the cap, with no build after them. No agent had a "build the whole tree before the cap" step, and the cap arrives without warning (clock tool is on, but runs ended 9-17 min in). Interpretation.

## 3. Two outliers

- **expr r1 (0.063)**: the final diff has only `builtin/builtin.go` and one builtin test. The first item, finch's #1 at 0.7, was scoped as "Implement expr error-handling builtins ... add throw(value) and errtype(err) (plus try function if feasible)", and kite posted at 1.8: "Expr finch owns try/catch builtins". Nobody read the project as syntax work. Attention went elsewhere: edits per project r1 scriggo 49, tengo 35, wasmi 27, expr 9, oxvg 0. Finch's `run expr-try-catch-errors "go test ./builtin ./..."` started at 1.2 and returned at 7.8 (no tool call from finch in between), and kite's identical command ran 2.1-8.0; the output is all `ok` except two flaky testify `Eventually` tests (kite 8.0). Both expr agents were therefore idle for about 6 of the run's 10 minutes. Interpretation: whole-repo `go test ./...` stalled under load; the same stall pattern (single `run` of 5-6 min) appears once in r2 (crane 0.6-7.2, wasmi `cargo test --workspace`).
- **tengo r2 (0.099)**: `new.log` shows 9 of 91 reference tests passing and one panic: `TestDestructuring_MultipleRestError` panics with `index out of range [0] with length 0` at `parser/parser.go:1205` in `parseSimpleStmt`, which kills the whole `tengo/v2` test binary. The other runs score 0.86-1.0. The r2 patch routes `:=` and `=` through a pattern-detection path (diff around `isCompositePatternExpr`, `x[0]`); the agents' own error test covered "rest element must be last" and "cannot use destructuring with =" but not a second `...` element. I did not pinpoint the exact line of the unguarded index. Interpretation: one unhandled panic in a rare error path costs a package; in the other runs the hidden-test paths did not panic.

## 4. Other evidence on RT vs baseline and R

- **The RT lever that worked was the "hardest part" sentence only in r0**, where the expr owner asked for help in the first two minutes. Elsewhere "join the hardest part" showed up as late offers (r3 plover 14.7 "Wren, I can implement block syntax parser/AST slice for expr"; r4 swift 10.1, plover 13.7). The task list recorded the gap early (r3 crane #4 at 1.1: "No task currently tracks this uncovered half") but staffing came at 12.4 (wren), 12.5 (plover), 13.5 (kite) after kite had taken and dropped it at 7.6/7.7 for Scriggo ("expression block work remains open/unassigned").
- Builders still pick easy slices first: in every run the first expr writer built throw/errtype builtins before syntax (r2 heron to 4.8, r3 wren to 11.1, r4 tern to 13.3), then moved to `try(expr, fallback)`.
- Verifier-found build breaks (r4 #7, #8, #9) were fixed by concurrent edits before the "fixer" arrived; the list entries only recorded it. Overhead without work.
- Tasks added by 'scout' (14) are mostly "X has no diff yet" statuses, i.e. the board-status posts of R moved to the list rather than turning into defects.
- Coordination chatter is large (102-131 agent posts per run); in r0 and r2 it includes ownership assignments between peers ("Everyone stop overlapping: Heron own expr AST/parser/visitor, Linnet own custom throw", swift 2.0 in r0), which is what produced the ganged-up expr in r0. Interpretation.

## 5. Caveats

- Edit counts exclude `bash` writes. Item-to-code matching uses the taker's edits between take and done (or +6 min). Post classification is a hand-labelled sample of 60 of about 580 posts. All causal readings are interpretations.
