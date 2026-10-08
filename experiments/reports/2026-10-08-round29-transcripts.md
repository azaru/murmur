Model output (a subagent's analysis of the round 29 transcripts), not verified by hand.

> Checked by hand in the main session: oxvg r3's final diff touches `oxvg_ast/src/visitor.rs`, `collapse_groups.rs` and two new e2e test files, and all four oxvg implementation edits in that run are plover's (entered at 6.7 min by the main session's count, 6.8 here); lark is the only agent with write/edit on scriggo in r0 (33 calls including tests); in expr r2 the hidden `TestTryCatch_RetryExhaustion` was killed after 17 s (`signal: killed`), and the agents' own `trycatch_e2e` package was killed the same way, in its own package as the profile asks. The strict-rule count depends on the definition: 5 of 25 here (implementation before the first test item was done), 9 of 25 by the main session's script (before every test item naming the project was done).

Counts come from short Python scripts over `events.jsonl`, `<agent>.messages.json`, diffs, score files and grader logs of `e29-rtests-r0..r4` (TF, the arm with end-to-end tests first) and `e28-rparts-r0..r4` (RP, round 28). Minutes are from `run_start`. "Write" means the `edit`/`write` tool only (writes through `bash` are not seen). A path counts as a test when it contains "test" or "e2e"; it belongs to the project named in its path. A first pass attributed `tengo.../parser/expr.go` to expr; all numbers below use the corrected rule.

## 0. Summary

- The test-first behaviour appeared organically: every project that got an item got a "tests:" item first (22 of 22 pairs; oxvg r1 got no item at all), 32 test items of 110 (RP: 0 of 99), and tests were written before implementation in 20 of 25 pairs. The strict rule was broken in 5 pairs (4 wasmi runs, oxvg r4).
- Test edits were 24-38% of edits per run (RP 14-26%). First implementation write came later: median 4.2 min (RP 3.2), 2.6M tokens in (RP 2.0M). Three projects never got an implementation write (oxvg r0, r1, r2), all Rust.
- The decisive costs were not the tests. They were (a) Rust cold builds of 6.5 min plus lock contention, which starved oxvg; (b) one owner or no owner for the hard layer (expr r1, r4, oxvg); (c) builds broken in the last minute (wasmi r0, oxvg r4).
- Idle marks had no visible effect.

## 1. Order and the strict rule

Item to first implementation write (min): tengo 1.7-3.4, expr 1.7-3.5, scriggo 1.8-4.6, wasmi 1.7-3.0, oxvg 6.5-6.6 where it happened (RP median gap over all projects: 1.0, TF 2.5).

Implementation writes before the project's first test item was done (25 pairs): 0 in 20 pairs. Broken in:

| run, project | impl writes before first test item done | who, when |
|---|---|---|
| r1 wasmi | 9 (tests done 7.4) | crane 4.6 (config.rs, error.rs), linnet 6.3 |
| r2 wasmi | 2 (done 5.2) | robin 4.6-4.8 (engine, error) |
| r3 wasmi | 17 (done 11.4) | robin 3.3-3.5 (engine, error) and onward |
| r4 wasmi | 3 (done 4.8) | lark 3.8-3.9 (config.rs, error.rs) |
| r4 oxvg | 1 (done 9.6) | plover 7.3 (visitor.rs) |

Cause in wasmi (reading of the board): the test needs a new public API (`Config::generate_coredump`, `Error::coredump`), so it cannot compile; the rule says to keep it outside the project. r3 robin 2.3: "Wasmi E2E authored outside repo at /work/wasmi-coredump-e2e ... Expected compile failure until API implementation", then 3.0: "The run environment is isolated (/app only); it cannot access /work/wasmi-coredump-e2e", so the harness could not be run with `run`. r1 lark put it in a nested crate `crates/wasmi/tests/coredump-e2e` with its own `[workspace]`; its `target/` ended in the diff (451,004 lines), without hurting the base score (59/59). In r1-r4 the first test item stayed open 4-10 min while builders wrote the API. Also oxvg r3: item #3 was never marked done, but lark's test file existed from 3.0 and plover implemented from 8.1, so that follows the rule in spirit.

## 2. Test items, writers, places, damage

- Test items per project: 1 in 18 of 22 pairs. The text asked for one item per requirement; agents wrote one per project (finch r0/r3/r4 added four in a row, one per repo). More than one: r1 expr 3, r2 expr 3 (late "tests: retry..." items), r1 tengo 2, r1 wasmi 2, r2 scriggo 2, r2 wasmi 2. Duplicates in the sense of two agents on one test: none found; the extra items were later gaps (r2 plover 9.1, 9.3 "tests: expr retry budgets").
- Distinct agents who wrote test files per project: 1 in 8 pairs, 2 in 10, 3-4 in 6. So the split is by project (one agent per project's first test), later extended by other agents.
- Places: expr `test/errorhandling`, `test/trycatch`, `trycatch_e2e`, `e2e`; scriggo `test/methods`, `e2e_test`, `methods_e2e`; tengo `tests/destructuring`, `test/destructuring_e2e`; oxvg `crates/oxvg_optimiser/tests/*.rs`; wasmi `crates/wasmi/tests/` or an external crate (r0 `wasmi-trap-coredumps-e2e`, r3 `wasmi-coredump-e2e`, r1 `_wasmi-coredump-tests`). Own package or folder in all cases.
- Damage at grading: none through tests. Base fractions: expr r4 base lost 13 of 66,794 (the team's own red `e2e` package: `TestTryCatchRequiredSyntax` x12, `TestTryFallbackIsLazy`), worth 0.0004. Scriggo r1/r3/r4 base 0.9933 (7 of 1045); not traced (cause unknown). The two build breaks at the end (wasmi r0, oxvg r4) were in implementation files, not tests: wasmi r0 `core_dump.rs:220 const_expr ... takes 3 arguments but 2 were supplied`, edited by plover at 15.8 and 16.3, run ended 16.4; oxvg r4 robin wrote `structural_selectors.rs` at 12.0, ran `cargo check` at 12.1, never fixed the missing trait import (`to_css_string` not found), run ended 12.7. Both score 0.

## 3. Did the tests encode the description better?

Not a clear yes. Tengo: the description says defaults apply only when a key is missing. r1 and r3 tests covered it (grep: "explicit undefined", lazy defaults in r1), yet r1 fails 13 and r3 12 hidden tests; r0's tests mention undefined 0 times and r0 fails only 5 (all "default not evaluated for undefined"). So the own tests did not predict the hidden result (interpretation: they were written before the code, and the weak spot was the implementation).

Oxvg r3 (0.5, 7 of 10 hidden tests): what differed.
- Files: `oxvg_ast/src/visitor.rs` (new `Context.selector_protected_elements`) and `collapse_groups.rs`; RP touched only `collapse_groups.rs`/`inline_styles.rs`. In r3 `prepare` collects the style selectors that contain a combinator or pseudo-class, selects the matching elements in the original tree with `root.select`, and protects them and every ancestor before any flattening. This is the task's "determined from the structure that exists before the rewrite". Hidden tests now passing: the child, descendant and "only implicated groups" cases. Still failing: adjacent sibling (`+`), and both `remove_empty_containers` tests (that job was never touched; r3 tests only drove `CollapseGroups`).
- How the tests helped (interpretation): lark wrote `structural_selector_e2e.rs` at 3.0 (Jobs::none + collapse_groups, class combinators; 3.1 red), and dunlin added a pseudo-class file at 10.0. Plover, a late entrant (6.8), read the test file at 7.2 and implemented at 8.1-8.6 with no other agent on oxvg code. The test gave a late entrant the entry point and a concrete failing case in 1.5 min of reading. That is the only run where it got implemented that way.
- Why not the others: r0 swift took the test item at 3.3, wrote the file at 4.1, ran it at 4.2 and the item stayed open until 16.4; the weight-7 build item was added at 16.4. r1: no oxvg item ever (finch said "I'll take oxvg E2E tests" 1.2 and moved on; 25 calls in the project). r2: see 5. r4: plover implemented at 7.3 but the build broke (2).
- Tests named `collapse_groups` in 4 of 4 runs that wrote oxvg tests; none covered remove_empty_containers, which is where 2 hidden tests are.

Scriggo r0 (0.854; 44 of 53) vs 0 elsewhere. Only r0 edited the full pipeline: lark wrote 27 implementation edits alone (5.8-12.5 min): `ast.go`, `parser_func.go`, `checker_package/statements/checker.go`, `emitter.go` (8 edits), `typeinfo.go`, i.e. parser, checker and emitter/runtime in one head. Hidden failures left: interface satisfaction ("cannot use MyInt(42) as fmt.Stringer"). Others: r1 swift/crane 16 edits and no emitter work (hidden: "not enough arguments in call to x.Double"), r2/r3 never reached selector resolution ("x.Double undefined"), r3 total 6 implementation edits, r4 three agents (kite 2, linnet 10, tern 12), emitter edited at 11.9-12.0 only, hidden panics `Scriggo method placeholder called before generated dispatch`. In r4 the layers were split and the runtime layer arrived in the last 40 s. Interpretation: single owner of the whole pipeline worked once; per-layer split without an integrator did not, in 4 of 4 runs.

## 4. Build items

110 items (RP 99): 32 tests, 78 others. Items per run 24, 26, 24, 17, 19. Weight >= 8: 3 items in total (RP 8). "Build:" per layer (parser, compiler/VM, config/serialization): tengo, expr (r0, r2, r3), wasmi (r1, r3). Whole-project items (my reading of the titles, hand-classified): 10 of 25 pairs; scriggo 5 of 5 runs, oxvg 3 of 5 (r0 #24 added at 16.4), expr 2 (r3, r4). RP: 12 of 25 first adders added one item. So the hard projects (scriggo, oxvg) are still the ones with a single whole-project item; only the easy ones were cut by layer. Expr: per-layer items in r0, r2, r3 (0.974, 0.683, 0.949); r1 two items that left out the compiler layer; r4 one item "Expr implementation (all error handling semantics)" held by swift only (0.063).

## 5. Idle marks

37 `tasks` results showed the mark, but only 5 distinct items in 4 runs: r0 #10 (wasmi config, 3 min, done 10.5 by linnet, its other holder, minutes later), r1 #11 (wasmi serialization, 3 min, never done), r2 #1 (oxvg tests, held by wren since 0.3; shown 24 times from 4.0 on), r3 #9 (wasmi serialization, never done), r4 none. After a mark: no one took, joined or dropped any of the 5 items except r0 #10 (done by its other holder). No post mentions it (grep for idle, stale, since taking it: only unrelated hits). Why r2 #1 mattered: wren ran `cargo test --no-run` at 0.6, it blocked until about 7.2 ("Finished ... in 6m 33s"); at 5.2 heron: "Gap found: oxvg currently has only the E2E test item (#1)... I added #14 ... blocked on #1"; linnet 6.3: "Taking oxvg #14 ... please ping when test spec is ready", then went to expr 6.8. The strict rule made two implementers wait on a stuck test item. The mark did not help because waiters followed the rule ("hold implementation until #1 done"). It would not fire for the other two stuck cases: r1 robin held expr #13 (VM) and wrote 4 edits in tengo, because the mark counts any write/edit, not edits in the item's project (interpretation).

## 6. Cost of the strict rule

- Minutes before the first implementation write per project: median 4.2 (2.0-8.1), RP 3.2 (0.7-7.6); tokens by then 0.6-12.0M, median 2.6M of 32M (RP 2.0M). Highest: oxvg r3 12.0M (8.1 min), oxvg r4 9.9M (7.3 min), scriggo r0 5.0M, r1 5.2M, wasmi r1 5.2M.
- Not a budget problem for Go projects: tengo/scriggo/expr were implementing within 2-5 min. For oxvg and wasmi (cargo) it combined with cold builds: `cargo test` first run 6.5 min, "Blocking waiting for file lock on build directory" in 6-22 tool results per run (22 in r0) and "Command aborted" in 2-11 bash results. In oxvg r0 and r2 the project ended with tests and no implementation at all; in r3/r4 implementation came at 8.1/7.3 min and r4 broke it.
- Runs ended 10.7-16.4 min (RP 12.3-14.0); r0 ran longest.

## 7. Zeros and low scores

| case | score | cause (grader log, diff, events) |
|---|---|---|
| expr r4 | 0.063 | Only swift implemented (1 edit, `builtin.go`, throw/errtype) after taking the single item #8; no parser/compiler work; 5/79 pass. Swift 3.0: "Scope too broad ..." nobody joined #8. Own `e2e` package red in the base run (13 tests, negligible). |
| expr r1 | 0.342 | Parser/AST/checker (kite) and `try(...)` plus builtins (heron) exist; `undefined node type (*ast.TryNode)` in 52 of 79 hidden tests: nobody lowered TryNode in the compiler. robin held #13 and made 0 expr implementation edits (4 tengo edits at 7.3); read compiler.go at 10.5; run ended 10.7. |
| expr r2 | 0.683 | `TestTryCatch_RetryExhaustion` was `signal: killed` after 17 s, the package aborted, 22 of 79 tests lost (54/57 of those that ran). Agents had written retry-budget tests (item #22, 9.3). Open doubt: infinite loop vs memory kill. |
| wasmi r0 | 0 | Lib does not compile, `core_dump.rs:220` (section 2). |
| oxvg r4 | 0 | Lib test does not compile (section 2). |
| oxvg r0, r1, r2 | 0 | No implementation edit in the project; 4/10 pass (the same 4 pass with no change). |
| scriggo r1-r4 | 0 | The hidden test aborts at the first error family with 3/53 passing; layers not wired (section 3). |
| wasmi r1-r4 | 0.364-0.773 | r1/r2 fail the memory/global tests (the serializer emits a stub; only host-error and basic tests pass); r3 passes memory and globals, fails frames and locals (5); r4 fails 7. |
| tengo r1-r4 | 0.857-0.868 | 12-13 hidden fails on defaults (map defaults, missing vs present undefined); r0 5. |

## 8. Spread (r3 0.618 vs r1 0.312) and what remains

Difference 0.306 in the run mean: expr 0.607 (r3 per-layer items, kite and crane carried parser/compiler/VM; r1 no TryNode lowering), oxvg 0.5 (above), wasmi 0.409 (r3 real state capture), tengo 0.011. r1 also ended earlier (10.7 vs 13.2 min) with six "fix:" items and two broken builds (scriggo `undefined: resultEnd` at 10.4, tengo compiler not building at 6.4).

Main remaining failure mode (interpretation): the integrating layer has no owner. The hard layer (compiler lowering of expr, emitter/runtime of scriggo, the oxvg job set) is either left out of the item list, held by one agent who works elsewhere, or arrives in the last minutes. Tests at the entry point exist and fail, but nothing assigns the cost of making them green, and the strict rule delays everyone who would. Second: Rust builds, which kill the test-first loop for oxvg and wasmi.

One concrete change (interpretation, would exist in real work): require the last build item for a project to be an integration item named after the entry point ("make the end-to-end tests pass: wire parser, checker and compiler/runtime together"), added by whoever adds the last layer item, weight 6-8, and taken first by anyone who finishes a layer. Optionally, `taskIdleMinutes` could count edits only inside the item's project. For Rust, a second Cargo `CARGO_TARGET_DIR` per agent or an early "warm the build" call by the first agent would cut the 6.5-minute stall (not tested).

## 9. Open doubts

- Edits through `bash` are not counted; path-to-project attribution is by repo name in the path, so relative paths lacking the repo name inside `run` commands are missed.
- Whole-project item count is hand-classified from titles.
- One run per cell; the spread inside the arm (0.312-0.618) is as large as the gap to the baseline. Oxvg r3's 0.5 is one run.
- Whether expr r2's retry kill was a loop or memory was not checked.
