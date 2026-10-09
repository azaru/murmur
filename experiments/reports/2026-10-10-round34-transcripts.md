# Round 34 baseline: transcript analysis

Model output from a subagent (Claude), read-only analysis of `experiments/deepswe/runs/e34-base-r0..r4/b/` (events, `<agent>.messages.json`, `*.score.json`, `*.diff`, `*-logs/new.log`). Hidden-test logs were used only to say which tests failed and why.
Checked by hand (main session, 2026-10-10): (1) expr r0 — `handleTryPanic` appears once in the diff, as a call, with no definition; (2) python-statemachine — the `engines/async_.py` hunk adds `state_data` 0 times in r0, r3 and r4 against 4 and 5 in r1 and r2; (3) anko — the grammar uses `type_data` in r1–r3 and not in r0 or r4. All three hold.

Conventions. "min" is minutes since `run_start`. "-X" is minutes before the cap (the `abort` event, reason `budget`). Times of tool calls come from the `toolResult` timestamps in `<agent>.messages.json` under `murmur/run/` (940/937/920/914/979 calls reconstructed, matching `traces34.md`). "Budget left" is `1 - cumulative usage/32M`, summing the `usage` events. Paths below are relative to `experiments/deepswe/runs/e34-base-r<N>/b/` unless absolute. Scratch scripts lived in `tmp/claude-round34/` (deleted).

## 0. Context that frames everything

- Runs are short: 10.9 to 14.6 min of wall clock (r4 10.9, r0 11.7, r1 12.5, r2 12.7, r3 14.6), not the 120 min timeout. The 32M cap is spent almost entirely on cache reads (30.7M of 32.0M in every batch, `murmur/run/result.json` `usage.cacheRead`; output is 0.11 to 0.13M). About 920 to 980 tool calls per batch, ~40k tokens per model turn.
- Every task is implemented by very few agents. Writers per task per run (agents with at least one edit/write on the task): 1 to 5, typically 2 to 3. All 11 or 12 agents read each task, but 1 to 4 agents per batch never write anything.
- Token use is very uneven: one agent burned 33% (r0 heron), 29% (r2 linnet), 22% (r4 crane), 21% (r3 crane). Writers account for 96 to 100% of tokens.
- No hangs were found. The idle cost is agents that leave early or only review.

## 1. Broken trees

| Run / task | Agent | Breaking edits | Context | Build/test after? |
|---|---|---|---|---|
| r0 expr (score 0, `vm.handleTryPanic undefined`) | heron | `vm/vm.go` edit at 11.17 (-0.5) added `recover(); ... !vm.handleTryPanic(...)` at `vm.go:118`; the method was never written. Further edits to `compiler.go` 11.47 and `parser.go` 11.66 (-0.0) | heron implemented the whole try/catch syntax (AST, parser, checker, printer, opcodes, compiler, VM) in one burst: 13 edits from 9.6 (-2.1) to 11.7, after switching away from wasmi tests (2.3-5.7) and a short DynamoDB DTO claim (8.7-8.9). Agent token share 33% | No. Zero builds/tests on the task by heron, and no agent built the expr tree after 11.7 |
| r3 expr (score 0, `TryNode does not implement ast.Node`) | linnet | `ast/node.go` edit at 12.47 (-2.1) added `TryNode` without a `String()` method (build log: "missing method String"); then parser 13.83, opcodes 13.89, compiler 14.28 and 14.42 (-0.2) | linnet took over expr syntax at 11.76 after wren (who had only done `throw`/`errtype` builtins in `builtin/`) asked at 11.64. Nobody had started parser/compiler/VM in the first 12 min | Its last build was `go test ./...` at 11.3 (-3.2), before any syntax edit; 6 edits after that, no further build. Nobody built after 14.42 |
| r4 wasmi (score 0, E0061 and E0425 in `crates/wasmi/src/engine/executor/mod.rs:61,69`) | crane (finch saw it) | crane made 8 edits to `executor/mod.rs` and `resumable.rs` from 10.32 to 10.88 (-0.0). Its last build was `cargo check` at 9.87 (-1.0) | Re-entrant coredump integration. Concurrently finch edited `coredump.rs` (7.5-10.3) and ran `cargo test` at 10.83 (-0.1), whose output shows exactly the two errors (`func_instance` not found, method takes 1 argument but 3 supplied). The cap hit while crane was mid-refactor (two of its last edits failed with "Found N occurrences" / "Could not find") | crane: no build after 9.87. finch saw the errors with 0.1 min left |

Reading: all three are the cap cutting a multi-file edit sequence that was never compiled. The expr cases are a late whole-feature implementation by one agent with no build until the end. None was a conflict between agents' edits (r4 wasmi is the only one with two agents editing nearby). Cost of the break: the hidden test package fails to build and `base_frac` collapses too (expr r0/r3 `base_frac` 0.013 vs 1.0 in r1/r2/r4, `results/e34-base-r*.json`; wasmi r4 base 0), so a late break also removes any partial credit.

## 2. What separates high from low runs, by task

### expr (79 hidden tests, all in `test/trycatch`)
| run | score | who wrote syntax-level code | first parser/compiler/VM write | outcome |
|---|---|---|---|---|
| r4 | 0.645 | plover (28 edits, 5.6-10.9): parser, compiler, vm, builtin | 5.7 | 51/79 pass. 28 fail, all "named catch clauses are not supported" (`catch name {}` and the `is "substring"` forms). Block form works |
| r1 | 0.342 | linnet (15 edits, 7.7-12.1), compiler/vm/opcodes only, **no parser edits** | 9.9 | 27/79 pass. 52 fail with `unexpected token Bracket("{")`: only `try(expr, fallback)` works, the block form does not parse. linnet `done` at 12.4 (-0.1) with exactly that scope |
| r2 | 0.038 | finch alone (37 edits, 0.7-12.5): builtin, compiler, vm, opcodes, program; **no parser/AST** | 5.3 | Package panic `reflect: nil type passed to Type.AssignableTo` in a `try(items[0], nil)` test aborts the whole `test/trycatch` run: only 5 of 79 results exist (3 pass) |
| r0 | 0 | heron (late, section 1); plover did `errtype` (4.6-6.6) | 9.7 | broken build |
| r3 | 0 | wren builtins only until 11.7; linnet from 12.5 | 13.8 | broken build |

Separator: how early the agent who owns the language-level feature starts, and whether it covers the parser (block syntax) and the catch variants. In 4 of 5 runs the agent that claimed expr first (wren in r0, r1, r3, r4, at 0.1 to 0.6 min) wrote only the `throw`/`errtype` builtins and either called `done` (r1 at 2.0, r4 at 3.8) or went elsewhere (r0 wren worked on python, r3 wren stayed on builtins). The syntax work was then picked up at 5.6 (r4 plover, who announced at 4.0 after wren's `done`), 7.7 (r1), 9.6 (r0), 12.5 (r3). Score order r4 > r1 > r0/r3 matches the pick-up order except r2, where the claimant (finch) did compiler/VM itself from 5.3 but never wrote a parser and left a panic that zeroed the package.

### wasmi (22 hidden tests, `crates/wasmi` integration)
| run | score | passes | what was built |
|---|---|---|---|
| r2 | 0.955 | 21/22 | robin: config/accessor/minimal dump (0.9-4.3, `done` 4.5 "partially complete"); then **linnet alone took the runtime capture** (announced 4.6, wrote 6.1-12.6, 23 writes, 13 builds, 29% of tokens): active stack frames, locals, memories + data, current globals, re-entrant merge. Only host-frame exclusion fails |
| r0 | 0.636 | 14/22 | robin config + serializer with empty frame snapshot (done 6.4, said so); wren added memory/global capture (8.7-10.8). Frames/locals missing: the 8 failures are `*_locals`, `nested_*`, `single_frame_unreachable`, `on_integer_division_by_zero`, `on_memory_out_of_bounds`, host frames |
| r1 | 0.364 | 8/22 | only config/accessor/skeleton; frames, memory and globals missing. Capture work started at 9.9 (-2.6) by lark/heron/dunlin, no single owner |
| r3 | 0.364 | 8/22 | same skeleton (robin done 4.3 "scaffold"); five writers on capture (crane 7.3, dunlin 11.9, plover 12.0, wren 13.5) in parallel pieces (encoder, stack snapshot, CodeMap local types) not integrated by the cap; a board post at 11.43 reports the integrated tree failing `cargo test` (missing `vec!` import in `coredump.rs`) |
| r4 | 0 | broken | section 1 |

Separator: whether one agent took ownership of the runtime capture layer (frames + locals + memory/globals) early and kept it to the end (r2) versus a skeleton owner who left with the hard part undone (the others). The hidden tests show three layers: config/accessor/valid empty dump (at least 8 tests, in every non-broken run), memory/global capture (r0, r2), stack frames/locals (only r2; needs engine internals: private call stack in `executor/handler/state.rs`, local types not retained in `code_map.rs`).

### dynamodb-toolbox lazy (37 hidden tests in two vitest files)
| run | score | writers | failures by cause |
|---|---|---|---|
| r0 | 0.784 | finch (27 writes, 1.0-11.6), dunlin (5, 9.7-11.4) | 8 fail: 5 "Maximum call stack" in `dto`/`fromDTO`/round-trip (recursive `$ref` DTO), 3 other DTO/`$defs`. Parse/format/check/conditions/zod pass |
| r1 | 0.513 | robin alone (39, 1.2-12.5) | 14 of 18 failures: `Cannot assign to read only property 'checking' of object '#<LazySchema>'` (a `private checking = false` guard written in `check()`; `dynamodb-toolbox-lazy-recursive-schemas.diff` ~lines 340-402); breaks check, parsing, formatting, zod, finder, DTO. Why the object is read-only was not traced |
| r2 | 0.432 | lark (39, 1.4-12.6), dunlin (10, 11.3-12.6) | same `checking` read-only bug (14), plus `schema.build`/`schema.clone` not functions (3) |
| r3 | 0.324 | finch alone (50, 0.9-14.5) | 19 "Maximum call stack" across check, parsing, formatting, finder, conditions, update expressions, zod, jsonschema, DTO: delegation loops on self-referencing schemas (the core requirement) |
| r4 | 0.162 | swift (12, 1.0-2.5; `done` 3.1 "foundational ... incomplete"), kite (16, 6.2-10.9) | `lazy(...).optional/required/hidden/key/savedAs is not a function` (12): builder interface missing; plus 14 "Maximum call stack" and `build`/`clone` missing |

Separator: not time or number of agents (r1, r3 had one writer all run; r0 two). Each run has one dominant defect that fails 14 to 25 tests at once (infinite recursion, a read-only guard property, missing builder interface), and no other agent ran a recursive-data scenario against the owner's tree before the cap.

### python-statemachine (72 hidden tests, each as `[sync]` and `[async]`)
| run | score | writers | failures |
|---|---|---|---|
| r1 | 0.958 | finch (42, 0.4-11.1), swift, kite | 3 fail (edge cases, validation). Hooks state-data init/exit in both `statemachine/engines/base.py` and `engines/async_.py` (`_initialize_state_data` at diff lines 159 and 224) |
| r2 | 0.931 | wren (35, 1.2-12.2), dunlin | 5 fail; hooks in base.py and async_.py (diff lines 101 and 160) |
| r0, r3, r4 | 0.556, 0.569, 0.583 | 4 / 1 / 4 writers | 27 of 32 (r0), 27 of 31 (r3), 27 of 30 (r4) failures are `[async]`: AsyncEngine has its own copy of the enter/exit logic and these runs hooked only `base.py`. After `sm_runner.start(SM)` in async, `get_state_data(sm.s1)` is `None` and `state_data` callbacks get `{}` ("State 's1' is not active", "assert None == {'count': 0}"). Lines mentioning `state_data` added to `async_.py`: r0 0, r3 0, r4 0 (r1 4, r2 5) |

Separator: handling the second (async) engine path. No test added by any agent used the `sm_runner` fixture (0 such lines in the added tests of all five diffs), so the agents' own tests never exercised async. In r0/r3/r4 the only `async_.py` change is clearing `_data_changes` per macrostep.

## 3. anko: why 0.222 or 0.556 exactly

9 hidden test functions (`vm::TestTypedBindings*`), 1/9 each; `base_frac` 1.0 everywhere (93 existing tests pass). Score = passed/9.

| test | r0 | r1 | r2 | r3 | r4 |
|---|---|---|---|---|---|
| DisabledOption | pass | pass | pass | pass | pass |
| ErrorContracts | pass | pass | pass | pass | pass |
| CompositeRepresentativeCases | FAIL | pass | pass | pass | FAIL |
| DeepSemantics | FAIL | pass | pass | pass | FAIL |
| NilRules | FAIL | pass | pass | pass | FAIL |
| Declarations | FAIL | FAIL | FAIL | FAIL | FAIL |
| ScopeAndControlFlow | FAIL | FAIL | FAIL | FAIL | FAIL |
| AdditionalRepresentativeFlows | FAIL | FAIL | FAIL | FAIL | FAIL |
| ErrorReturnValue | FAIL | FAIL | FAIL | FAIL | FAIL |
| score | 0.222 | 0.556 | 0.556 | 0.556 | 0.222 |

Two causes:
1. **Composite types (gate for 3 tests).** r0 and r4 wrote the grammar rule `VAR expr_idents ':' IDENT ...` (`parser/parser.go.y` hunk of `anko-typed-variable-bindings.diff`): only a single identifier as type. `var x: []int64; x == nil`, `map[string]int64`, `*int` give `ParseSrc error ... syntax error`. r1, r2, r3 reused the existing `type_data` nonterminal, so slices/maps/pointers parse.
2. **Return value on a type error (4 tests, all runs).** Hidden tests expect the script result to be `nil` when the assignment/declaration fails (`Run output - received: "hello" - expected: <nil>` for `var x: int64 = "hello"`; `typed_bindings_test.go:646: expected nil return value on type mismatch, got "bad"`). In every run the error is set but the assigned value stays as the statement result (r1 `vm/vmLetExpr.go`: sets `runInfo.err`, never resets `runInfo.rv`). The task text does not say this; it is the Anko convention in the repo's test helper (`RunOutput`/`RunError`). The agents' own added tests in r0 to r3 had 0 `RunOutput` lines (r4: 5). In AdditionalRepresentativeFlows there is also one `Run error` (r1, r2): `type error: left has source type interface {}; declared target type int64` where the test expects success (an interface-typed value with an int64 dynamic type was rejected); not checked in the other runs.

So 0.556 is reached with only cause 2 unfixed; 0.222 adds cause 1. One agent (lark in r0, r1, r3, r4; tern + linnet in r2) wrote nearly all of it in 6.3 to 10.4 min; `done` calls: r0 lark 6.7, r3 lark 10.3, r4 lark 8.2, r2 tern 6.9. Nobody reviewed it against composite types or the repo's `RunOutput` convention.

## 4. `done` calls and early leavers

`done` events (agent, min, budget left), from `events.jsonl`:

- r0 (7): swift 0.6 (99%), tern 1.0 (98%), crane 1.8 (93%), linnet 3.5 (86%), robin 6.4 (59%), lark 6.7 (56%), kite 9.4 (25%). Never done: dunlin, finch, heron, plover, wren.
- r1 (3): tern 1.0 (96%), wren 2.0 (93%), linnet 12.4 (2%).
- r2 (7): crane 1.5 (92%), heron 1.6 (91%), plover 1.6 (91%), kite 2.2 (87%), swift 3.3 (81%), robin 4.5 (75%), tern 6.9 (58%).
- r3 (5): tern 1.8 (92%), robin 4.3 (88%), lark 10.3 (53%), swift 10.9 (50%), kite 11.5 (46%).
- r4 (7): dunlin 1.4 (94%), tern 3.1 (87%), swift 3.1 (87%), wren 3.8 (84%), heron 7.3 (48%), lark 8.2 (38%), linnet 9.2 (23%).

29 `done` calls in total. The agents that call `done` account for 6 to 27% of tokens. The cap ended all five runs; 3 to 9 agents per run were never done and still active.

Early leavers (done before 4 min with no edits): r0 swift, tern, crane; r1 tern; r2 crane, heron, plover, kite; r3 tern (43 calls, 0 writes); r4 dunlin. That is 10 of 29 `done` calls, each with 84 to 99% budget left. Typical reason: "All five repositories are already claimed by teammates ... I avoided overlapping edits" (r0 swift 0.6; r2 crane 1.5). In r1 and r3 other idle agents (r1 crane 47 calls, plover 23; r3 heron 49) never called `done` and never wrote.

Owners who `done` after a minimal slice and state that the rest is unfinished (6 found):
- r1 wren 2.0: expr builtins only, "delegated core try syntax to Linnet" (linnet wrote from 7.7).
- r4 wren 3.8: "larger try/catch/finally/retry forms remain unimplemented"; plover took over (best expr run).
- r2 robin 4.5 and r3 robin 4.3: wasmi config + minimal dump, capture unimplemented. r2: linnet took it (0.955). r3: split across five agents, not integrated (0.364).
- r0 robin 6.4: serializer with empty snapshot; frames never done (0.636).
- r4 swift 3.1: DynamoDB "foundational", recursive DTO and Zod incomplete; kite continued from 6.2 (0.162).

Pattern: the claimant leaves after the easy slice with 75 to 95% of the budget left; the hard remainder is picked up late, by a single heavy agent (works: r2 wasmi, r4 expr) or in parallel pieces (fails: r3 wasmi).

## 5. Other costs

- **Late pick-up of orphaned slices** (section 2): first parser/compiler/VM write on expr at 5.3 (r2), 5.7 (r4), 9.7 (r0), 9.9 (r1), 13.8 (r3). Hand-off chatter: r3 expr, board posts 11.43 to 11.76 (heron, linnet, wren handing expr to each other, ~2 min of a 14.6 min run); r0 heron claimed DTO, retracted, and went back to expr between 8.7 and 9.0 (4 posts).
- **Task hopping by one heavy agent**: r0 heron (33% of tokens): wasmi tests 2.3-5.7, DynamoDB read and claim 6.8-8.9, expr 9.6-11.7; none finished (expr broken, 0 builds).
- **Concurrent build contention**: "Blocking waiting for file lock on build directory" (cargo) in 7 / 5 / 1 / 8 / 4 tool results in r0..r4. Same-command bursts (at least 3 agents running the same build/test within 30 s): r1 3, r3 4, r4 1, r0 0, r2 0; in r3 at 11.33 min six agents ran `go test ./...` on expr in the same second after a board broadcast. Small in tokens, but 6 agent turns each.
- **Edit failures** ("Could not find edits" or "Found N occurrences"): 11 / 14 / 15 / 6 / 22 in r0..r4. r4's include crane's two overlapping edits to wasmi `executor/mod.rs` (section 1).
- **Wrong paths / missing tools**: ENOENT results 9 to 19 per batch, `command not found` (mostly `rg`) 8 to 13 per batch. Minor.
- **Short command timeouts**: r1 wren used 20 s and 40 s timeouts on `go test`, both timed out (1.0, 1.8) and wren called `done` at 2.0 with only the builtins (cause and effect not established).
- **Spec gaps against hidden tests**: anko's nil-return convention and python-statemachine's second engine are not in the task text; a review pass that reads the repo's existing tests and fixtures (`sm_runner` parametrization, `RunOutput` helper) could find both. This is a hypothesis, not tested.

## Claims to verify by hand (most important)

1. Broken trees are uncompiled late edit bursts: r0 expr heron's `vm.go` edit at 11.17 min calls `vm.handleTryPanic` (`e34-base-r0/b/expr-try-catch-errors.diff` line 433; `expr-try-catch-errors-logs/new.log` line 2), with 0 builds by heron on the task (`murmur/run/heron.messages.json`); r3 linnet's last build 11.3 min, `TryNode` added at 12.47 without `String()`.
2. python-statemachine: r0/r3/r4 hooked only `engines/base.py`, not the AsyncEngine's own enter/exit; 27 of their 30 to 32 hidden failures are `[async]` (`python-statemachine-state-data-scoping.score.json`, diff part for `statemachine/engines/async_.py`).
3. anko: all five runs fail the same four tests on nil-return-on-error, and r0/r4 also fail three composite-type tests because the grammar uses `IDENT` rather than `type_data` (`parser/parser.go.y` hunk in `anko-typed-variable-bindings.diff`).

## Open doubts

- "Budget left" at `done` time sums the `usage` totals (including cache reads), as the cap does; not cross-checked per agent against `result.json`.
- dynamodb r1/r2: the cause of the read-only `checking` property was not traced to library code.
- That early leavers "could have" taken the late slices is inference; some may be a correct reading of ownership.
- Section 5 counts are regex matches on tool-result text and may include board-notice noise (the "conflict" matches were discarded for that reason).
