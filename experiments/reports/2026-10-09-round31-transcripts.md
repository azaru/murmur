Model output (a subagent's analysis of the round 31 transcripts), not verified by hand.

> Checked by hand in the main session:
> - **Tengo r1:** the final diff adds `parser/tmp_test.go`, and the hidden base log ends in `panic: test timed out after 10m0s` with `TestTmpAhead` running.
> - **Wasmi r4:** linnet's last edit, to `crates/wasmi/src/engine/executor/mod.rs`, is at 10.53 minutes. The budget abort is at 10.56.
> - **Expr r1:** the final diff touches no `checker/` file. The team's tests call `expr.Eval(source, nil)`. The hidden logs show a panic through `checker.go:233`.
> - **The process counts in the main session's own script** (same as rounds 29–30) differ slightly from this report's:
>   - first write a test: 20 of 25 there;
>   - test writers ≥2: 12 of 25;
>   - first implementation at a median of 3.9 minutes and 3.1M tokens.

Counts come from short Python scripts over `events.jsonl`, `<agent>.messages.json`, the final diffs, `*.score.json` and the hidden grader logs of `e31-rsibl-r0..r4` (TS, round 29's TF plus three sentences), compared with `e29-rtests-r0..r4` (TF, end-to-end tests first) and `e30-rinteg-r0..r4` (TI, an integrate item per project). Minutes are counted from the first event of each run. Tokens are the sum of the `usage` totals up to that minute. "Implementation write" means an edit or write whose path is not test-like by a path regexp (`_test.go`, `/test/`, `e2e`, `tests.rs`, `_tests/`), so it can misclassify a few files; tool results were matched to events by order within each agent. "Sibling search" is a heuristic: a grep or rg whose pattern alternates at least two identifiers with a node-like name or `case *ast.`. All of these are my own definitions, not the round's pre-registered ones, and none were checked by hand except where marked "read".

## 0. Summary

1. **The drop against TF is two events, not the rules.** Excluding Tengo r1 (0.00) and the single TF oxvg run that scored 0.5 (TF r3), TS equals TF. TS minus TF per task: expr -0.002, oxvg -0.100, scriggo -0.047, tengo -0.172, wasmi -0.036. Tengo's loss is all r1: the other four TS Tengo runs score 0.857, 0.945, 0.868, 0.857 (mean 0.882, TF 0.877). Oxvg's loss is TF r3's 0.5; TS oxvg is 0 in all five runs, as in 14 of 15 TS/TF/TI runs. Those two items are 0.054 of the 0.071 gap. "Lower on all 5 tasks" is really 4 tasks plus a tie on expr.
2. **Tengo r1 was a stray scratch test that hangs.** `parser/tmp_test.go` (robin, 5.8 min) loops forever (`for p.token != 0`, never reaches 0). It is left in the repo; `go test ./parser` then times out at 10 min, and the hidden base log has 0 of 123 passing. Robin hung on it from 5.9 min to the end, and tern hung on the same package from 6.5 min. Nobody saw it fail, because the call never returned.
3. **Wasmi r4 (parsed 0) is a last-second edit.** linnet's edit at 10.53 min, 2 seconds before the 10.56 min budget abort, adds `String::new()`, `Vec::new()` and a `coredump::Global` literal without the imports or the `ty` field in `engine/executor/mod.rs`. That is 4 compile errors. The build had been green at 10.3 min.
4. **The sibling rule did not change behaviour measurably.** Sibling-style searches are 267 (TS), 265 (TF), 277 (TI); search share of tool calls is 13–17% in all arms. The only visible shift is expr: a multi-layer search naming existing nodes comes earlier in TS (median first at 2.9 min in 5/5 runs; TF 5.5 min, TI 4.1 min). Of 116 items, 3 mention a sibling or analogue (TF 1, TI 2); none is an item created from a sibling search. In expr r1 the search did reach the checker (wren, 3.9 min) and produced no item, because item #6, titled "checker/compiler/VM", already "covered" it. Nobody edited the checker, and the hidden run panics with `undefined node type (*ast.TryNode)`.
5. **The red-test rule fires, but late.** There are about 17 items that name a failing end-to-end test and its reproduction. Eleven closed, about 9 with the named test passing. The ones that mattered most (Scriggo r1 #25 at 9.2, r3 #20 at 12.8; oxvg r3 #21 at 13.5) came with 1 to 4 minutes left and stayed open.
6. **Cost is nil.** Median first implementation write: TS 3.8 min / 2.9M tokens, TF 4.0 / 2.6, TI 4.4 / 2.9. Items: 116 (TF 110, TI 114). Tool calls: 5004 (TF 4827, TI 4804).

## 1. Use of the rules

**Items.** TS: 25, 25, 23, 21, 22 = 116 `task_add` events (one more call in r3, lark 3.6, passed `text` instead of a title and did nothing). Items whose title starts with "tests": 6, 6, 5, 5, 5. After the first few minutes the item mix is the usual layer split. Parser/checker/compiler/runtime per project appear in r1 (Scriggo #13–#18, 4.8–5.0 min) and r3 (#6, #7, #12, #13, #17, #18). I found no item titled after a place that a sibling search surfaced (no "also handle X in the visitor/optimizer").

**Sibling searches (heuristic).** Per run, TS 54, 54, 49, 62, 48; TF 59, 61, 44, 41, 60; TI 46, 52, 66, 57, 56. Counts do not differ.

**Expr, the case where the sibling is clear** (grep naming `*Node` identifiers across at least two of compiler, checker, optimizer, visitor): first search minute per run, TS 1.8, 2.9, 10.5, 2.7, 6.2; TF 5.5, 3.7, 8.0, 10.6, 2.7; TI 6.0, 3.9, 7.8, 4.1, 2.9. So the rule moved the search earlier in 4 of 5 TS runs, a real but small effect.

**What the search found and did not use (read).** Expr r1 (0.025): wren read `ast/visitor.go` (2.0 min), then grepped `ConditionalNode|VariableDeclaratorNode` in `compiler checker` (3.9 min) and posted at 3.8 that #6 is "broad checker/compiler/VM". finch had taken #6 at 2.6 and posted at 3.9 "I'll handle VM + compiler TryNode path". `checker/checker.go` was not edited by anyone in r1 (in r0, r2, r3, r4 someone did: tern 3.9, finch 10.3, finch 5.1, swift 6.4). The rule's exception ("unless an item already covers it") was satisfied by a title that nobody built. Cause: one multi-layer item was split between two people by the files they named in a post, and the checker fell through.

**Items that name a failing end-to-end test and its reproduction** (read from `task_add` details; the closing note is the `task_done` note):
- r0: #10 (3.3 finch, Tengo), #18 (5.5 wren), #21 (5.6 lark), #22 (6.7 dunlin), #23 (7.4 dunlin), #24 (7.4 wren), #25 (8.3 dunlin), all expr but #10. All 7 closed; each note says the named test now passes. Several are narrow (finally-skipped, errtype classification).
- r1: #24 (7.6 wren, Scriggo checker panic at `checker_statements.go:1130`) closed 8.7 by crane, with "remaining expected failures" left; #25 (9.2 crane, Scriggo emitter panic `none of the previous conditions matched identifier c`) never closed.
- r2: #19 (6.0 crane, Scriggo non-empty interfaces) closed 7.3 with parser unit tests only.
- r3: #8 (2.1 finch, expr, open), #19 (8.1 swift, wasmi, closed 10.6 with an isolated regression), #20 (12.8 robin, Scriggo emitter panic, open), #21 (13.5 heron, oxvg, open).
- r4: #15 (5.3 heron, closed 6.8 by kite on parser unit tests), #16 (6.6 plover, Tengo acceptance, closed 7.7 by dunlin); and three duplicate build-break items for one missing `strings` import in expr (#18, #19, #20, all at 7.1 within seconds, resolved 7.2–9.6).
- Total about 17 (+3 duplicates); closed 12 (about 9 with the named test passing); open at the end 5. Items created after minute 8: r1 #25 (9.2), r3 #20 (12.8), #21 (13.5), r0 #25 (8.3).

**Whether red tests were left red at the end** is not measured reliably. My crude proxy (the last non-aborted test command per project, any agent) gives RED in 6 of 25 for TS, 9 of 24 for TF, 12 of 25 for TI, but it counts narrow unit runs and misses runs that were still in flight when the cap hit. For example it shows TS r0 oxvg and scriggo as GREEN, yet those score 0 (r0 oxvg's diff has only a test file; r0 scriggo has 50 of 53 hidden failures). I do not rely on it.

## 2. Why scores did not follow layer coverage

**Tengo r1 (0.0, base_frac 0)** (read). `tengo-destructuring-bindings-logs/base.log` is one package: `parser`, `TestTmpAhead`, `panic: test timed out after 10m0s`. The final diff contains `parser/tmp_test.go` (3 lines), and the new log carries the same hang. Timeline: robin wrote the file at 5.8, added the missing `token` import at 5.8, ran `go test ./parser -run TestTmpAhead -v` at 5.8 (compile error) and at 5.9 (printed two lines, then hung; the result later reads "Command aborted"). Tern ran `go test ./parser ./test/destructuring` at 6.5 and also hung. Robin, kite (5.9), swift (4.7) and tern (6.5) make no tool call after those minutes in r1; two of them are the Tengo hang, the other two are other long-running calls (swift on oxvg, kite on wasmi cargo). Tengo's compiler/VM work in r1 was partial in the diff (compiler.go, parser/expr.go, parser/parser.go only, no VM change) and the project's own destructuring tests were still failing at the end (finch 6.x–, kite `go test ./...` ok at 5.9 before the hang). Nobody could have seen the hang as a result, since the call never returned. Kind of failure: a scratch file left in the tree that blocks a package, not a missing place.

**Wasmi r4 (0.0, parsed 0)** (read). `wasmi-trap-coredumps-logs/new.log` shows 4 errors, all in `crates/wasmi/src/engine/executor/mod.rs` lines 78–100: `String`, `Vec` not in scope (twice) and missing field `ty` of `coredump::Global`. Writers on wasmi: wren (coredump.rs, config, error, lib.rs, tests; 4.4–10.4) and linnet (`handler/state.rs`, `executor/mod.rs`; 8.7–10.5). Wren's last cargo call (10.5, `cargo test -p wasmi --test mod coredump`) printed `Compiling wasmi` and dead-code warnings (build compiling). Linnet's last edit to `executor/mod.rs` at 10.53 min (run ends 10.56) added the block with the missing imports; no build followed. Result: a project whose builds compiled at 9.4 and 9.7 scored 0 (other TS wasmi runs: 0.14–0.77). This is the late-edit risk, not a missing place.

**Scriggo r0, r2, r3, r4 (0–0.10) and r1 (0.52).** Emitter touched in r0, r1, r2, r3, not r4 (changed paths from the diffs, non-test). Hidden failure counts (pass/fail) and dominant message:
- r0: 3/50. 31 and 10 failures `interface conversion: reflect.Type is types.definedType / ptrType, not *reflect.rtype`. Team saw the same panic: swift 7.2, crane 13.5. Also `none of the previous conditions matched identifier` at 12.4 (swift) and 12.5 (wren).
- r1: 28/25 (0.52). Panics `interface {} is *ast.Func, not *runtime.callable` and `Value.IsNil on zero Value`. Team saw `none of the previous conditions matched identifier` from linnet at 8.8; crane opened #25 at 9.2 and it stayed open.
- r2: 1/52. 36 and 13 `reflect.Type is types.definedType / ptrType, not *reflect.rtype`. Team saw it at 10.1 (crane), 10.2 (robin), 10.6, 11.8, i.e. four times in the last 2 minutes, and nobody fixed it.
- r3: 8/45. `*ast.Func, not *runtime.callable` (6), `reflect.Value.Field on zero Value` (10). Team saw `none of the previous conditions` at 10.2 (crane) and opened #20 (robin) at 12.8, open.
- r4: 3/50. 7, 5, 4, 4, 4 `none of the previous conditions matched identifier c/p/m/n/a` (no emitter change). Team's own runs showed `reflect.Type is types.definedType` at 9.3 (tern) and 9.6 (heron) with 1 minute left; no item.
- In all five runs the failing panic was visible in the agents' own output between 6 and 10 minutes, after about 5 minutes of building, and the runs end at 10.6–14.1 minutes. The shortfall is the depth of the emitter/runtime work in the time available, not an untouched layer. The `*reflect.rtype` assertion in r0, r2 and r4 is a classic sibling place (a type-assertion helper for ordinary reflect types), but I did not locate its file in the diffs, so I cannot say which sibling search would have found it.

**Expr r1 (0.025).** Hidden: 15 fail / 2 pass. Two causes: `unknown name try` for `try(...)` (the builtin is registered but the checker does not know it) and `panic: undefined node type (*ast.TryNode)` at `checker/checker.go:233`. The team's own `test/trycatch` went green at 10.6 (crane), 10.1 (wren), 12.5 and 13.0 (wren) because the tests call `expr.Eval(src, nil)`; with no environment the checker is not run. So the team's tests could not see the checker, a test-shape gap. Wren edited the test file at 10.0, 12.3, 12.4 and 12.6 (adding cases, changing the expected error to a string), none exercising the checker.

**Expr r4 (0.481).** 38 pass / 41 fail. 32 `Received unexpected error`, 12 panic traces. The checker was touched (swift 6.4, 9.8). Seen: three agents spent 7.1–7.6 min on the same missing `strings` import in `builtin/lib.go` (items #18, #19, #20 in the same 6 seconds, plover/dunlin/kite). The expr agents were still on #9 defects (robin #22 at 9.4: CatchFilter ignored, `retry` is `panic("retry is not implemented")`, finally not run on throw) when the run ended at 10.6. Fewest minutes in the arm (10.6) and 4 of the 5 non-expr projects got fewer than 150 calls.

**Oxvg (0 in all 5).** r0 and r1 have no implementation in the final diff (r0: one test file; r1: `packages/napi/test.js`). r3 compiles, with 6 hidden failures. r2 and r4 fail to compile: r2 `lifetime may not live long enough` (linnet's cargo was `ok` at 8.4 and 8.8, then more edits and `cargo fmt` runs at 9.3 and 11.9 aborted), r4 `E0599 clone ... Chain<Once<Element>>` (visible in lark's runs from 7.9 min; four more runs aborted at 8.4–10.5). Cold cargo builds on oxvg take about 6.5 min and cargo takes a directory lock, so 4–6 agents per run wait on the lock when the cap hits (r2: aborted calls at 9.1, 9.1, 9.1, 10.9, 11.2, 11.9; r4: 8.7, 8.9, 9.3, 9.7, 10.2, 10.5).

## 3. Cost of the rules

| | TS | TF | TI |
|---|---|---|---|
| Median first implementation write, minutes / M tokens (per project, path heuristic) | 3.8 / 2.9 | 4.0 / 2.6 | 4.4 / 2.9 |
| Items (`task_add`) | 116 | 110 | 114 |
| Tool calls, 5 runs | 5004 | 4827 | 4804 |
| Search share of bash calls | 13–17% | 12–16% | 14–17% |
| Implementation writes in the last 2 min / last 1 min / last 0.5 min | 99 / 55 / 24 | 100 / 53 / 16 | 97 / 38 / 21 |
| Projects with parsed 0 or base_frac 0 | 4 (tengo r1, oxvg r2, oxvg r4, wasmi r4) | 2 | 2 |
| `done` calls | 7 (r2: 2, r3: 5) | 8 | 6 |
| Mean implementation writers per project (expr / oxvg / scriggo / tengo / wasmi) | 5.8 / 2.2 / 2.0 / 2.2 / 1.6 | 4.0 / 0.6 / 2.4 / 2.2 / 2.8 | 4.2 / 0.8 / 2.0 / 2.6 / 2.8 |

Attention shifted. TS used more calls on oxvg (435 vs 237 for TF, 307 for TI) and on scriggo (796 vs 633, 706) and fewer on wasmi (674 vs 869, 826). That did not translate to score on either. The expr project drew more implementation writers (5.8 vs 4.0 and 4.2), the mix of the same extra agents on one project. Agents waiting on a hung or long build at the cap (last tool call more than 2.5 minutes before the end) are 4, 4, 3, 0, 0 in r0–r4 for TS, with most on cargo; this is the same order as TF and TI (1–6 per run). No evidence that the rules cost more minutes than TF/TI. The late broken builds are more numerous in TS (4 vs 2 and 2), but two are the oxvg compile baseline and one is the stray test file.

## 4. As in rounds 29–30

- **First write is a test:** TS 22 of 25 projects by my path rule (TF 23/24, TI 23/25 by the same rule). The three non-tests are r0 oxvg (plover edited `collapse_groups.rs` at 7.6, tests only at 8.1), r1 oxvg (finch's first write is `packages/napi/test.js`, which is a test I misclassified, so effectively 23/25), and r2 oxvg (wren's first write is `jobs/mod.rs` at 1.2, which I did not inspect). Oxvg is the project that drifts in the arm.
- **Test writers ≥ 2 per project** (my rule): TS 12 of 25, TF 17 of 24, TI 17 of 25. TS is lower: oxvg and tengo tests get one or no writer in several runs (r0 oxvg 1, r1 oxvg 0, r2 oxvg 0 and expr 1, r3 expr 1). I cannot say whether this is chance or the rule taking attention away from test writing.

## 5. Findings a next round could use

1. **The test shape hides a layer.** Expr r1's team tests went green (10.6–13.0 min) while the checker panicked for the hidden entry point, because `expr.Eval(src, nil)` does not run the checker. A rule that asks the end-to-end test to call the project's usual public entry point with the same options a user would (an environment, a type check, a full build) is realistic work practice and needs no grader. It matches the layer coverage question better than the sibling sentence.
2. **A multi-layer item hides an unowned layer.** Item #6 named "checker/compiler/VM", finch took VM + compiler, and the checker was never owned. The sentence "add it as an item unless an item already covers it" let a title count as coverage. Variant: each layer is a separate item, or an item stays open until each file it names has been edited by someone (still a rule between equals).
3. **Late edits, not missing layers, are what zeroes projects.** A 2-second-before-cap edit (wasmi r4) and a leftover infinite-loop scratch test (tengo r1) cost the five-task mean about 0.034 (tengo r1, 0.86/5 less than its siblings) and an unknown part of 0.1 (wasmi r4; the other TS wasmi runs average 0.51). A fix that is not hierarchical: a norm "delete scratch files you created, and run the project's build after the last edit you make" (TF/TI/TS all have a broken build at the end 2–4 times in 5 runs). Another: a timeout on one's own test runs (the `run` tool allows 20 minutes; Tengo's package timed out only at 10 min).
4. **Red tests are found too late to fix.** The Scriggo panic is in the team's own output at 6–10 min in every run; items opened for it (r1 #25, r3 #20) arrive with 1–4 minutes left. The binding constraint is the 10–14 minute cap and the 6-minute cold oxvg build. Rule (2) works when the test is cheap to run (expr, tengo: 7 items in r0, all closed) and cannot when the build is the cost (cargo, Scriggo's wide emitter).
5. **Oxvg is a null project here.** 0 in 14 of 15 runs of TS/TF/TI, hence the five-task mean has a ceiling of 0.8 and only four tasks can move.

## 6. Doubts

- The path heuristic for "implementation" and "test", the sibling-search regexp and the "last test command" proxy are mine; the counts of items with a named failing test come from reading the details by hand but a few borderline items (r0 #10/#21, r4 #15) are judgement calls.
- Tengo r1: I did not verify by running that `tmp_test.go` is what zeroed the base log; the base log, diff and timeline all point at it. Whether the other tengo runs' parser tests could have hung the same way was not checked.
- The scriggo `*reflect.rtype` assertion site was not located.
- The wasmi r4 attribution rests on the diff plus the log line numbers and on wren's earlier green build; I did not rebuild.
- The first-write and test-writers numbers for oxvg were not inspected in the transcript for r0 and r2.
- A hedge on the drop: two noisy events explain about three quarters of it, but k=5 with this noise cannot say the rules did nothing. The behaviour measures (searches, items, cost) say they did little.
