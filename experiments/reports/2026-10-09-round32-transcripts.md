Model output (a subagent's analysis of the round 32 transcripts), not verified by hand.

> Checked by hand in the main session:
> - **Oxvg r4:** heron's two edits to `collapse_groups.rs` are at 11.55 and 11.64 minutes, after heron's notice at 10.82; the abort is at 11.94, and the hidden base log fails on "this file contains an unclosed delimiter" in that file.
> - **Oxvg r0:** dunlin's edits to `inline_styles.rs` are at 9.33 and 9.38; dunlin's notice came at the abort (12.51); the hidden base log fails on `E0425 cannot find function test_config` there.
> - **Expr r3:** the final diff has no `checker/` file and calls `expr.Eval` 11 times (the report says 12); the hidden new log panics in `expr/checker.(*Checker).visit`.
> - **Wasmi r0:** the final diff touches only `crates/wasmi/tests/integration/`, and kite posted "rule blocks wasmi implementation until its tests are marked done".
> - **Agents never reached:** the five `done` calls in r1 and r4 are by wren, finch, crane, tern and plover, the agents without a notice. Per agent, the notice came 0–169 seconds before the abort; 10 agents got it 10 seconds or less before.

## 0. Summary

Times are minutes since run start (from `events.jsonl`). TD is round 32 (`e32-rdead-r0..4`), TS is round 31 (`e31-rsibl-r0..4`).

1. The notice came too late to change much. The first notice came 1.5-2.8 min before the abort, and 10 of the 55 agents that got one got it 10 s or less before the abort (r0: 3, r2: 5, r3: 1, r4: 1). Cause: the notice rides on a tool result, and `timeout 300` lets a call last up to 5 min. 5 more agents never got one because they had called `done` early (r1: wren 2.3, finch 2.7, crane 5.8; r4: tern 7.0, plover 7.4).
2. After the notice the team kept working as before. There were 75 write/edit calls. 26 of 55 agents edited. 19 took a new item and 16 added items. 32 edits went to files nobody had edited before. Only 2 `rm` calls occurred (kite r1, its own debug test, removed in the same command). No agent reverted a teammate's working code.
3. Both broken oxvg trees were broken by a single unverified test or edit whose compile check never finished: the cargo build was waiting on the shared build-directory lock when the run was aborted. r0 oxvg was dunlin's test (before its notice). r4 oxvg was heron's `collapse_groups.rs` edit 0.8 min after its notice.
4. The new "missed places" are mostly a gate-and-queue effect, not a lack of discovery. In scriggo r0-r3 someone had named the emitter by 7.9-10.8 min, but E2E tests could not reach it because the checker still panicked, so the emitter item stayed queued until the run ended. In expr r3 the checker layer was never an item and nobody opened `checker/checker.go`, and the team's 11 end-to-end tests call `expr.Eval(src, nil)`, which skips the checker. In expr r4 the compiler layer was a single item held by one agent, whose first compiler edit came at 11.9 of 11.9 min.
5. B did not change item titles. By a crude layer-word count, build items naming 2 or more layers were 19 of 86 in TD against 20 of 73 in TS.
6. Wasmi r0 = 0 is a deadlock inherited from the shared text, not from A or B. "Nobody writes implementation code in a project until its test items are done" combined with "a test that cannot compile until new code exists stays in a folder outside the project" meant the wasmi E2E item (#5) never closed. The diff has no `Config` or `Error` API at all, only a test file.
7. Low variance is mostly composition. TD has oxvg = 0 in 5 of 5, scriggo near 0, tengo flat (0.86-0.95) and no zero-tengo tree (TS had one). TD run-mean sd is 0.067 (TS 0.163). Expr is still bimodal (0.80-0.85 in 3 runs, 0.03 and 0.13 in 2).
8. Prompt grew from 984 to 1060 words (+7.7%). The `timeout` sentence was followed (565 of 624 test commands), and 13 `timeout 300` kills occurred, all oxvg cargo calls waiting on the build lock.

## 1. After the notice

Method: events after each agent's own `deadline_notice` event (index order, so the triggering call is excluded). The 75 write/edit calls match the main session's 15/15/12/14/19.

Per-agent classification (55 agents with a notice; no-notice agents are the 5 above). The classes are heuristic, with "new surface" meaning an edit to a file nobody had edited before the agent's notice, so it includes new code in existing repo files:

| class | agents |
|---|---|
| no further call (notice arrived at the abort) | 8 |
| only reads, tests, posts | 14 |
| continued own files and ran a test after | 8 |
| took a new item, no edit | 7 |
| new file or new surface edits | 13 |
| took a new item and edited teammates' files | 3 |
| edited teammates' files, no new item | 2 |

Of the 26 agents with a post-notice edit, 20 ran a build/test command after their last edit (a started command counts even if aborted, see Q2). Six did not: r0 plover (wasmi test), r1 lark (`handler/func.rs`), r2 plover, r3 finch (`checker_package.go`), r3 swift (`state.rs`), r4 wren (`compiler.go`).

- Finishing and verifying: r0 lark `compiler.go` (edit 11.7, tests 11.8 and 12.1, task_done 12.4), r0 swift (see below), r1 heron fixed a test (3 edits, tests, task_done 11.9), r1 kite finished #9/#33 (tests 12.3, task_done 12.4).
- Undoing: r0 swift edited `vm/vm.go` at 11.2, removing a VM divide-by-zero guard (589 chars to 87) that it wrote earlier and that wren had reported as breaking `test/fuzz` and `test/gen`; test at 11.5. r1 kite wrote `test/debug_tmp_test.go` at 11.0 and 11.4 and removed it in the same bash call (`...; rm -f test/debug_tmp_test.go`). r3 finch removed a debug `fmt.Printf("REGISTER METHOD ...")` it had put into `checker_package.go` at 11.0, at 11.2.
- Starting something new: r1 tern started `types/interface.go` (a new file, "#34 represent declared interfaces") at 11.1, 0.1 min after the notice; r1 linnet took oxvg #24 at 11.5 and only read; r1 robin posted a "scout" item #38 at 12.1; r2 plover began wasmi stack extraction, 8 edits in `cell.rs`, `state.rs`, `locals.rs` and `code_map.rs` (13.1-14.6); r2 kite and crane took scriggo #21; r4 wren edited `opcodes.go`, `program.go` and `vm.go` of expr (10.7-11.3); r4 kite wrote Scriggo `emitter.go` and `emitter_expressions.go` (10.5-11.6, after notice 10.3) and that run scored scriggo 0.625, the only non-zero scriggo in TD.
- Teammates' working code: no revert found. The only edits that shrink text by more than 60% are swift r0 (own, above), plover r0 (own test, 213 to 75 chars) and finch r3 (own code).
- Breaking after notice: r0 robin added `TestMethodDeclarationAndInterfaceSyntax` to scriggo `parser_test.go` (5 edit-and-test cycles, 11.4-12.3, still failing at the end). It panics (`ast.Node is *ast.Var, not *ast.Assignment`), which kills the whole `internal/compiler` package: hidden base score for scriggo r0 is 0.419 (1 test failed, 439 passed; the other tests in the package never ran). This is the only post-notice change I found that damaged an existing suite besides r4 oxvg (Q2).
- Agents never reached: r1 wren, finch and crane and r4 tern and plover had called `done` earlier. Their reasons contradict the action ("I should not finish the overall batch; switching to additional project work is needed", "Not yet.", "We need not exit, continue.", "(don't call)").
- Agents inside long calls: r2 wren, swift and linnet last called a tool at 11.7, 11.3 and 11.1 (cargo or `go test` with `timeout 300`) and got their notice at 14.6, when the call returned at the abort.

## 2. The two broken oxvg trees

- r0. `base.log:148` is `error[E0425]: cannot find function test_config in this scope` at `crates/oxvg_optimiser/src/jobs/inline_styles.rs:721`. Only the lib-test target fails. The final oxvg diff contains only this test and `packages/napi/test.js`: there is no oxvg implementation. Author: dunlin, two edits at 9.3 and 9.4 (its notice was at 12.5, so before it). `test_config` is `pub(crate)` in `jobs/mod.rs:369` and was not imported (dunlin read that file at 9.2). Dunlin's `cargo test -p oxvg_optimiser <test>` started at 9.4 and printed "Blocking waiting for file lock on build directory" until it was aborted at 12.5. Finch's identical run at 10.5 ended the same way. So the error was never visible to the team.
- r4. `base.log:148` is `error: this file contains an unclosed delimiter` at `collapse_groups.rs:554` (the `impl visitor::Visitor for StructuralSelectors` block opened near line 40, unclosed `for matched in matches`). Author: heron (holder of #11), two multi-block edits to `collapse_groups.rs` at 11.6, 0.8 min after its notice at 10.8, 0.3 min before the abort at 11.94. Its first and only test of them (cargo, `--test structural_selector_preservation`) hit "Blocking waiting for file lock ... Command aborted". Before this it had spent about 3 min reading. Swift's earlier "edit" of the same file had an empty `edits` list (a no-op).
- Both: not visible before the end. Common cause: oxvg builds wait on one shared lock (62 lock-wait results in TD, 60 in TS), so a compile check takes minutes. In TD all 13 `timeout 300` kills (exit 124) were oxvg cargo calls (r0: 2, r2: 4, r3: 4, r4: 3).

## 3. Missed places

Scriggo diffs touching an emitter file: TD r4 only (0.625). TS: r0-r3 yes, r4 no.

- r0. Items: #10 "parser/compiler method declarations" (robin), #11 checker, #12 "runtime method dispatch" (crane), no emitter item. Crane wrote about the emitter at 7.9-10.2 ("Emitter has `functionStore.availableScriggoFuncs`... can register method funcs as `T.Method`"), and heron at 9.0, but at 12.4 crane was still asking robin "Are you emitting methods...?". Crane's #12 stayed "blocked pre-runtime" because E2E still panicked in the checker (12.3).
- r1. Swift named emitter collisions at 8.8; the explicit item "#38 Scriggo emitter/runtime" was created by robin at 12.1, after the notice; swift announced emitter work at 12.0 and made no emitter edit.
- r2. #21 "compiler/runtime method dispatch" existed. Crane took it at 12.2 and dropped it at 12.5; kite took it at 13.1 and could not test it because #15 (checker) was unclaimed (14.0-14.5); run ended at 14.6.
- r3. #16 "compiler method sets and calls" and #17 "runtime method and interface dispatch" (both lark) were never worked as emitter work; checker work (finch) absorbed everyone; at 12.7 dunlin's test showed "pointer method expression panics emitting identifiers".
- r4 (the one that worked). Item #20 "Scriggo emitter/runtime" (tern) existed; kite wrote the emitter edits in the last 1.5 min.
- So the emitter was identified in 4 of 4 misses (or 3 of 4 before the notice), but treated as a later layer that the checker had to unblock. One-layer-per-item did not create parallelism, because the layers were serialized by the red-test panic order.

Expr, hidden-log evidence:
- r3 (0.025): `panic: undefined node type (*ast.TryNode)` with stack in `checker.(*Checker).visit` (`checker.ParseCheck`). No agent ever opened or edited `checker/checker.go` (searched all r3 tool args). No item named the checker (items: #14 "expr try/catch implementation", #18 parser/AST, #19 "compiler/runtime"). The team's own E2E file `try_catch_e2e/try_catch_test.go` uses `expr.Eval(src, nil)` 11 times; `expr.Eval` is `parser.Parse` then `compiler.Compile(tree, nil)` then `Run` (printed in tool results of r2 wren and r4 robin, and read by r3 swift), so it never calls the checker.
- r4 (0.127): the same panic 52 times, in `compiler.(*compiler).compile` (checker was edited by wren at 10.1). Compiler item #13 ("compiler and VM integration", weight 5) was taken by wren at 7.1; wren read the repo for about 3 min, its first compiler edit was at 11.9 (not in the final diff). Item #28 "e2e: compiler dispatch missing TryNode" (robin, 10.5) was never taken. The r4 tests use `expr.Compile` and `expr.Run`, so they were red for the right reason.

Test entry points used (added lines in diffs): TD r0 `expr.Compile`/`expr.Run` (0.83), r1 `expr.Eval` plus `vm.Run` on parsed input (0.85, checker still edited by someone), r2 `expr.Eval` (0.80), r3 `expr.Eval` x11 (0.03), r4 `expr.Compile`/`Run` (0.13). TS: r0 Eval, r1 Eval (0.03, no checker edit), r2 Compile, r3 Compile and Eval, r4 Compile. B's "no shortcut" sentence did not stop `Eval` in 3 of 5 TD runs against 2 of 5 TS runs.

Build items naming two or more layers, crude regex over layer words (parser/AST, checker/types, compiler/emitter, VM/runtime/dispatch/serialization), excluding test, fix and E2E items:

| | build items | multi-layer |
|---|---|---|
| TD | 86 | 19 (r0 2, r1 4, r2 4, r3 4, r4 5) |
| TS | 73 | 20 (5, 5, 5, 2, 3) |

Examples in TD: "Tengo compiler/runtime: compile destructuring declarations..." (r1 #5, #16), "expr checker/compiler/VM: implement recoverable errors..." (r4 #7), "Scriggo: implement checker/compiler/runtime support for declared methods" (r4 #12), "Tengo parser/evaluator/compiler destructuring implementation" (r3 #6). The regex has false positives (for example "Scriggo parse non-empty interface method sets" in TS). Weight-8 umbrella items were split less often than per layer; positive cases of per-file splitting exist (r1 oxvg #30-32, one per job file).

## 4. Scratch files in final diffs

No `tmp`, `scratch`, `debug` or `probe`-named test file in any TD diff (TS: `parser/tmp_test.go` in tengo r1). No debug prints in non-test code in either set. However, 3 TD diffs contain a cargo `target/` build directory from a separate E2E crate (r1 wasmi `crates/wasmi/e2e/target`, 136 files; r3 oxvg `e2e-tests/target`, 561 files; r3 wasmi `crates/wasmi/coredump_e2e/target`, 121 files), against 1 in TS (r3 wasmi `e2e/target`). Those diffs hit the 30,000,000-byte diff cap, so the later files are cut from the record (scores come from the live tree: r1 wasmi scored 0.773). So the "delete scratch files" sentence worked for named scratch tests but not for build output of a team-made crate.

## 5. Wasmi r0 = 0

`new.log` has 14 compile errors in the hidden `crates/wasmi/tests/coredump.rs`: `Config::generate_coredump`, `Config::coredump_executable_name` and `wasmi::Error::coredump()` do not exist (the task text names all three). The r0 wasmi diff contains only `tests/integration/mod.rs` and `trap_coredump.rs`, no implementation at all. Timeline: wren added tests item #5 at 0.5; finch took it at 3.6 and dropped it at 4.3 (wrote the test package at `/work/_tests/wasmi-coredumps/`, "isolated run environment cannot access ../_tests", following the "stays in a folder outside the project" rule); kite added build items #17-#19 at 5.7 but posted at 6.0 "rule blocks wasmi implementation until its tests are marked done"; crane and linnet made project-local tests (7.0-7.6); plover took #5 at 8.1; linnet dropped #22 at 11.9 "full coredump behavior assertions are absent until API/feature implementation". Nobody took #17-#19 in 12.5 min. The other four TD runs got wasmi implemented (0.36-0.77), so this is a single-run deadlock of the inherited gate; B's sentence ("compiles before the feature exists") is in direct tension with Rust tests that need the new API.

## 6. Other

- Variance: TD run means 0.338/0.495/0.448/0.349/0.394 (sd 0.067), TS 0.471/0.136/0.430/0.534/0.268 (sd 0.163). Per task TD: expr 0.83, 0.85, 0.80, 0.03, 0.13; oxvg all 0; scriggo 0, 0, 0, 0, 0.62; tengo 0.86, 0.86, 0.95, 0.95, 0.86; wasmi 0, 0.77, 0.50, 0.77, 0.36. The TS-to-TD gain of 0.037 comes from tengo (TS r1 was a broken tree, 0.0) and wasmi, minus expr; it is within noise.
- Timeout rule: 565 of 624 test commands carried `timeout` (TS: 606 commands, 0 with it). 13 exit-124 kills (all oxvg cargo, 5-min dead calls ending with no information). Harness "timed out" results: TD 3, TS 9; "Command aborted" at the end: TD 17, TS 36 (a weak sign that A and the timeout rule leave fewer half-finished commands, but run lengths differ: 11.9-14.6 min).
- Prompt: 984 to 1060 words (+76 words, +411 characters).
- Notice wording: "Start nothing new" was not obeyed in spirit (see Q1), and in the one case where new work after the notice paid off (r4 scriggo emitter, 0.625) it was the missing layer.
