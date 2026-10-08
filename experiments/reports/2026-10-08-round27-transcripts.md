Model output (a subagent's analysis of the round 27 transcripts), not verified by hand. Counts come from short scripts over `events.jsonl`, `<agent>.messages.json`, `*.diff`, grader logs and score files; interpretations are the subagent's and are marked. Role at a call = the agent's most recent `role(name)` call before it (`none` before the first one); this report mostly uses events, not roles. Minutes are from `run_start`. "Edits" = `edit`/`write` tool calls only (writes through `bash` are not counted). Batches under `experiments/deepswe/runs/`: RW = `e27-rweights-r0..r4`, RT = `e26-rtasks-r*`, baseline = `e23-base-r*`. Project of an item is read from its title. The main session's counts (first roles, builder share, edits per run, items per run, weights 72% >= 7, 32 of 97 at 10) were taken as given.
> Checked by hand in the main session: the `enter` span of every RW run (all 12 agents within 0.66–0.73 minutes; RT r0 0.57, baseline r0 1.13); finch's and swift's expr posts at 0.43–0.62 min in `e27-rweights-r2` (each defers to the other) and finch's tool calls stopping at 0.73 min there; that run's empty expr diff; the `panic: undefined node type (*ast.TryNode)` in `e27-rweights-r0`'s expr grader log and no `checker/` file in its diff; wren's and swift's wasmi `task_add` at 0.44 and 0.45 min in `e27-rweights-r3` after swift's `tasks` at 0.43; the `cannot find value state` error in `e27-rweights-r0`'s wasmi grader log; and the per-run task-list, weight, role and write/edit counts, which the main session computed independently.

# Round 27 transcripts: why weights plus shared holding (RW) scored 0.351

## 0. Context

- Runs ended at the token cap after 9.8, 11.8, 9.4, 8.7, 11.8 min (RT 9.4-17.3; baseline 12.7-24.6).
- Versus RT, the gain is in wasmi (0.41 vs 0.22) and tengo (0.89 vs 0.75); scriggo fell (0.09 vs 0.14); expr and oxvg are unchanged. Versus the baseline, no task differs by more than the noise.
- Causes of the zeros (details below): wasmi r0 and oxvg r1 and r3 were left with a build broken by one agent's last edits; scriggo r3 by a panicking test added at 8.6 of 8.7 min; scriggo r1 by a panic in an existing test (the grader stops at that package); expr r0 by a missing `checker` case; expr r2 by nobody writing at all.

## 1. Weights

**Inflated, and weakly informative.** 97 items: 17 of the 25 (run, project) pairs got a single whole-project item from the first adder (weights: 12 at 10, 4 at 8, 1 at 5). Five whole-project items at 8-10 each (r3: 42) do not behave as shares of one goal. Per project the mean is 7.1-8.1 for all five; scriggo is lower only because it has more small items.

By kind (my reading of the titles; rough): top-level "implement X" items mean 8.8 (n=54), test/regression items 6.5 (n=8), fix or reproducer items 5.9 (n=35). Items added after 2 min average 6.0 against 8.7 before. So weights separate "build" from "repair", not hard from easy parts of a build:

| case | weights | reading |
|---|---|---|
| expr r4 wren (0.6) | #9 throw/errtype builtins 4, #10 try/catch syntax + VM 10 | informative |
| expr r0 robin (0.3) | parser/AST 8, "errors, try/throw/retry, errtype builtins" 10 | mixed in one item |
| wasmi r0, r2, r4 | whole feature 10 (r0 #6, r2 #6, r4 #3); frame capture 8 (r0 #12, r2 #22); memory/global snapshots 7-8 | capture is not above the rest |
| scriggo r1 lark | parser/AST 7, typecheck 9, runtime dispatch 9 | informative |
| scriggo r0/r2/r4 | runtime dispatch or bridge 8-9, tests 5-6 | informative, but added late (below) |

**Does heaviest-first change what is picked?** Of 109 `task_take` events, 53 took an item with the maximum weight among unfinished items (ties at 10 are common). 25 takes (19 items) were joins to a held item (`with` non-empty), 16 of them in the first 1.5 min; in 18 of those 25 an unheld item of equal or higher weight existed, so the "even if held" sentence changed behaviour. For items added after 2 min, other agents took weight >= 8 items within 0.1, 0.1, 0.3, 0.5, 0.5, 1.4 min (6 of 14; 3 never taken: r2 #19, r3 #19, r3 #25) and weight <= 5 items within 0.2-7.9 min (8 of 16; median of all takers 1.4 vs 0.1). (Interpretation: heavy late items are picked faster than in RT, where hard gaps waited ~11 min; but weights are set by the adder, who often claims it at once.) The first agent does not always follow it: r4 wren added #9 (w4, builtins) and #10 (w10, syntax) at 0.6, took #9 at 0.7, closed it at 4.5, and never took #10 (no `task_take` on #10); it then wrote the syntax anyway (24 edits to expr, VM and parser from 5.8, parser only at 10.0).

## 2. Shared holding

25 shared takes on 19 items. Early ones were split on the board by layer within 0.5-1.0 min, for example tengo r4 (item #5): heron 0.6 "I joined #5 Tengo with kite/tern. I'll handle parser/AST/formatter portion", tern "I will inspect and implement compiler/runtime side", kite "I'll own function-parameter destructuring"; wasmi r2 #6: lark serializer module, kite config/capture, dunlin tests (0.5-0.9). Those runs scored tengo 0.857 and wasmi 0.773.

Collisions and nominal joins:
- Sharers made no edit on the item's project in 9 of the 24 multi-holder rows I printed (r0 #4 finch, r1 #4 and #5 heron, r1 #9 kite, r2 #3 swift, r2 #7, r3 #3 plover, r3 #13 lark, r4 #2 crane). Several moved to another project right after the join.
- The same file was edited by two sharers in 5 items: wasmi `state.rs` (r0 #12; r2 #6 also `state.rs`), `coredump.rs` (r2 #6, r3 #8), tengo `compiler.go` (r4 #5, tern 6 and kite 2 edits at 3.1-4.5), wasmi `mod.rs` (r4 #3). Tengo r4 had a one-minute build break at 2.8-3.0 (`'\\n'` rune literal in heron's `pattern_parse.go`) reported on the board at 2.8 and 3.0.
- **wasmi r0 (0.0):** item #12 (plover, 5.8) was taken by linnet 6.3, robin 6.3 and heron 6.7, all sharing. Linnet 6.4 and robin 6.5 both said they would build the frame helper without overlap; robin 7.0 proposed `Stack::core_frames()` in `state.rs`, tern 7.3 and plover 7.6 asked linnet for `coredump_frames()` there. robin (7.7), linnet (7.9) and heron edited `state.rs`; tern 8.2: "Build failed duplicate Stack::coredump_frames in state.rs (CoredumpFrameSnapshot @541 and CoreFrameSnapshot @587)"; robin 9.3: "Concurrent edits then removed both". The final grader error is a different one: E0425 `state` not found at `exec.rs:67`, from tern's own edit at 8.6 (`state.stack.sync_ip(ip)` in a function whose parameter is `_state`); tern held #6 alone. rustc reports name errors first, so the `state.rs` conflict may still have been unresolved behind it (unknown). Shared holding made the last two minutes a repair race, as in RT r0, but the immediate cause was a single-holder edit.
- **oxvg r1 (base_frac 0):** tern, the only writer, edited five `oxvg_ast` files at 11.2-11.3 and `collapse_groups.rs` at 11.4; test run at 11.5, run ended 11.8; grader: E0507 "cannot move out of dereference of `Element`" in `oxvg_ast`. Heron joined #5 at 0.9 and never edited. Not caused by sharing.
- **oxvg r3 (base_frac 0):** robin, the only holder of #4, wrote an `impl Visit for StructuralSelectors` at 2.1-2.3 using `visit_types`/`visit_rule`, which `lightningcss` here does not have (E0407, E0277). Robin then waited in `cargo test` from 2.3 until the end. Dunlin joined #3 with plover and only added a test file (1.7). Not caused by sharing.
- **scriggo r3 (base_frac 0.015):** linnet (holder of #5, #20, #21 alone) added `ast/astutil/method_receiver_test.go` at 8.6 and started `go test ./ast/...`; the run ended at 8.7. `base.log` ends at its nil-pointer panic in `TestCloneAndWalkMethodReceiver`; no later package ran. Not sharing.
- **scriggo r1 (0.62):** panic "comparing uncomparable type types.definedType" in existing `test/misc` `TestMultiFileTemplate`; the log stops at that package, so later packages count as failed. lark and dunlin both edited scriggo (53 edits, no common file) under separate items (#6/#9 vs #8). I did not trace the line; I believe dunlin's `types/defined.go` work is the likely source (unverified).

## 3. Decomposition first

- In all 25 (run, project) pairs the first `task_add` came before the first edit on that project (earliest edit 0.7 min). The prompt was followed to the letter.
- It was not followed in spirit: 17 of 25 first adders added one whole-project item; 8 added parts (r0 expr 2, scriggo 3, tengo 2; r1 expr 2, scriggo 4; r2 oxvg 2, tengo 3; r4 expr 3).
- Duplicates: the whole-project duplicates are 13 items in 4 runs (r2: expr 1; r3: expr, oxvg, scriggo, tengo x2, wasmi x3; r4: tengo x3). Cause is a race, not disobedience: all 12 agents entered within 0.66-0.73 min (gaps 0.05-0.1 min, i.e. 3-6 s, because two model turns take that long), and each duplicate adder's last `tasks` call came 2-20 s before the earlier item existed (r3 swift #8 added 0.45, last `tasks` 0.43, wren's wasmi #7 at 0.44; r4 swift #8 0.61 with last `tasks` 0.38; r2 swift #7 0.40 vs finch #4 at 0.30 with last `tasks` 0.27).
- Cost: mostly bookkeeping. Duplicates were later closed with "duplicate"/"already" notes with no work (r2 5, r4 3; RT 0-1 per run), e.g. r4 robin #7 and #8 at 5.8-5.9. The harmful case is r2 expr (Q4).

## 4. Expr

| run | score | expr writers (edits) | note |
|---|---|---|---|
| r0 | 0.025 | crane 15, dunlin 10, robin 8 | no `checker` case |
| r1 | 0.481 | wren 26, linnet 19 (VM), swift 6 | split by layer from 1.1 |
| r2 | 0.000 | none | see below |
| r3 | 0.759 | finch 32 | single writer |
| r4 | 0.582 | wren 24 | single writer |

- **r2, zero edits.** Finch added #4 (expr, w10) at 0.3 and posted at 0.4 "I will handle expr-try-catch-errors (#4)". Swift added the duplicate #7 at 0.4 ("I'm taking expr (#7) ... end-to-end"), then dropped it at 0.6: "Finch owns expr (#4), so I dropped duplicate #7. I've joined oxvg test task #3 with heron". Finch, reading swift's post, posted at 0.6 "I see swift has taken expr (#7) end-to-end. I'll avoid overlapping expr implementation", took the roles scout and verifier (0.5, 0.7), and at 0.7 started five `run ... test` commands in parallel including `cargo test --workspace` on wasmi; its next event is at 9.3 (blocked 8.6 min). The expr diff is empty. Crane asked at 4.9 to close #7; wren took and closed #7 at 9.1. The "join the heaviest, even if held" rule was not applied: #4 had one holder, weight 10, for the whole run. Two agents deferring to each other is the mechanism; the item header showed an owner.
- **r0, 0.025.** Grader `new.log`: 2 of 17 tests pass; the `test/trycatch` binary panics `undefined node type (*ast.TryNode)` (`checker/checker.go`, called from `expr.go:239`) on the first block-form test. The diff touches ast, compiler, parser, VM, builtin, but not `checker/`. Robin 1.7 posted "Please update compiler/checker/print dispatch to recognize AST nodes; Crane is runtime/VM"; nobody did (crane read `checker.go` at 6.3, no edit). Layered slicing by three agents left a fourth layer unowned; the panic kills the test binary, so one missing case costs most of the score. Robin also joined wasmi #12 at 6.3 and returned to expr parsing at ~8.9; `try(expr, fallback)` call form was still rejected by the parser at 8.6.
- **r3, 0.759.** Finch (task #1 at 0.3: "Anyone else assigned? To avoid collision please split by project") wrote builtins 1.1-3.5 (throw/errtype, with tests), VM/compiler 4.1-4.5, parser 5.2, AST 5.7, **`checker/checker.go` 6.4 and 7.1**, ran `go test ./builtin ./checker ./compiler ./parser ./vm` at 6.5 and 7.2 and `go test ./...` at 7.7, with fix-ups to 8.5. All layers were covered in one head and tested after each layer. r4 wren did the same without touching `checker`/AST (0.582), also builtins first. (Interpretation: for expr a single writer who covers every layer beats three layer-slicers; the builtins-before-syntax habit from RT remains.)

## 5. Other evidence

- **Build stalls hit the oxvg joiners.** Calls blocked more than 3 min (cold `cargo test` of oxvg, 3-4 at a time, plus `go test ./...`): RW agent-minutes lost 11, 29, 32, 20, 41 of 118, 141, 113, 104, 142 (RT 31-107; baseline 6-152). Examples: r4 finch 1.4 (9.4 min) and crane 1.6 (9.2 min), r3 plover 1.5 (7.2), dunlin 1.8 (6.9), robin 2.3 (6.3), all on oxvg. Not new in RW, but the joiners ended up there (r1 heron, r2 swift and heron, r3 dunlin and plover, r4 crane) and oxvg got 2-13 edits per run, 0 score in all five.
- **The missing core piece is found late.** Scriggo r0/r2/r4 scored 0: the item naming runtime dispatch or method-body emission appears at 9.8 (r0 #16), 7.1 (r2 #21, w9), 10.7 (r4 #17), each taken within 0.1 min, with 0-1.2 min left to the cap. The list was fast but the gap was found at the end.
- Edits per run 162, 183, 104, 128, 125 (RT 119-150; baseline 125-165).
- Three agents called `done` early (r0 kite 1.0, r1 kite 2.5, r3 tern 3.1); kite r0 kept editing.

**More staggered entry?** Evidence for: duplicate adds and the r2 expr deferral are races inside a 0.7-minute window; a later agent would have seen #4 and, per the prompt, joined it. Evidence against: the duplicates I traced cost only closing notes, except r2 expr; the dominant losses (build stalls 6-9 min, last-minute breaks, unowned `checker`, late discovery of the runtime gap) are unrelated to entry; runs end by token cap in 9-12 min, so a 30 s gap would delay the last agent by about 5 min of a 9-12 min run (interpretation). A smaller change that fits the evidence is a signal that an item is owned only by an agent that is blocked, not more delay. Not tested.

## 6. Caveats

Edit counts exclude `bash` writes. Project assignment of items is by title keywords (checked by reading all 97 titles). The 25 shared takes include a few same-agent retakes. Weight-kind classes are my rough reading. All causal statements are interpretations; counts of a few runs.
