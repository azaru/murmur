Model output (a subagent's analysis of the round 28 transcripts), not verified by hand.

> Checked by hand in the main session: the expr r1 timeline (finch's builtins edits at 1.6–4.6 min, the 8.1-minute item, heron's only core edits at 13.9–14.0 min with the run ending at 14.0); **one correction**: the 8.1-minute item (#9, dunlin) was taken by linnet at 8.3 min, not never taken, but linnet never edited expr, so the reading (nobody built the core for 9 minutes) stands. The oxvg diffs touch only `inline_styles.rs`, `collapse_groups.rs` and (r2, r4) `visitor.rs`, `mod.rs` and a new test file, and none touches `remove_empty_containers`. The scout count (10 of 60 first roles) matches the main session's script. The share of first adders who read code before their first item differs by definition: 21 of 23 here (any call naming the repository), 15 of 24 by the main session's stricter count (a path inside the repository in the call's arguments, task files excluded).

Counts come from short Python scripts over `events.jsonl`, the diffs, score files and grader logs of `e28-rparts-r0..r4` (RP) and `e27-rweights-r0..r4` (RW, round 27). Minutes are from `run_start`. "Edit" means the `edit`/`write` tool only; writes through `bash` are not seen. Project of an item = project named in its title (6 of 99 RP items name none). "First write" = first edit/write inside that repo. Interpretations are marked.

## 0. Summary

- The prompt changes did what they were meant to do on process: agents read before decomposing (21 of 23 pairs vs 4 of 25), weights moved from 8-10 to 4-7, duplicate decompositions halved, entry was spread over 6-9 min.
- The score effect is within the noise (0.422 vs 0.351). The zeros do not come from decomposition. They come from (a) work that starts late or is never integrated (expr r1, oxvg), (b) a runtime path that crashes on the hidden tests while the team's own tests pass (scriggo r0-r3), (c) a build broken in the last seconds of the run (expr r1, wasmi r4).
- Run lengths 12.3, 14.0, 12.3, 13.2, 14.0 min (RW 8.7-11.8): slower entry did not cost the cap, the runs are about 3 min longer.

## 1. Reading before decomposing

Pairs (run x project) where the project got at least one item: 23 of 25 (oxvg r0 and r1 got none). For the first adder, calls (`read`/`bash`) naming that repo before its first `task_add`:

| | RW | RP |
|---|---|---|
| pairs with >= 1 call in repo | 4 of 25 | 21 of 23 |
| pairs with >= 3 calls | 2 | 10 |

Most are 1-6 calls, so "reads the code" means a short look (the median is about 2). Zero-call cases: wasmi r0 (swift), wasmi r4 (robin).

Whole-project items (first adder added exactly one item for the project within 1 min): RW 17 of 25. RP 12 of 25 had a single first item, but only 5 of those have weight >= 7 (the other 7 are single parts at 4-6); 11 had several items from the first adder; 2 had none. So whole-project items fell from 15 (weight >= 8) to 5.

Items per project before its first write: 0 in 3 pairs, 1 in 9, >= 2 in 13 (RW: 9 single, 16 multi). Quote: expr r4 wren at 0.4-0.7 min added three parts (parser/AST 5, lazy try and throw 4, VM/compiler error handling and retry 7) after 4 calls in the repo. Contrast: tengo r3 finch at 1.0 min added one 8 with zero calls in the repo, then six items before the first write.

## 2. Weights

Items by band (weights 1-3 / 4-7 / 8-10): RP 25 / 66 / 8 (n=99); RW 7 / 31 / 59 (n=97). The guide worked on the adders: the 8-10 band fell from 61% to 8%.

Items added after the project's first write: 47 (RW 42). All have weight <= 7 (RW 21 were 8-9). Counted weights: 2 (x6), 3 (x10), 4 (x13), 5 (x8), 6 (x7), 7 (x3). So "bug found on the way" items are used, but they are mostly 3-5, not 1-3 only. Late items are what moves the count: the list kept growing while the main parts stayed untaken (see expr r1).

Taken at all: items never taken 10 of 99 (RW 19 of 97). Done 43 (RW 31). Interpretation: the weight guide did not change who builds what, but it made items small enough to take and finish.

## 3. Stagger

Entry (min): r0 0 to 8.7, r1 0 to 7.8, r2 0 to 6.4, r3 0 to 8.4, r4 0 to 8.1 (RW: all within 0.7). Second and later agents entered to a non-empty list: agents 2-4 saw 1-10 items; by agent 6 the list held 4-12, by agent 12 7-18.

Duplicate decompositions (2+ adders for one project before its first write): 6 of 25 (RW 11). Still happen: r3 expr had three adders (wren, finch, robin) before wren's first write at 2.4 min; r4 oxvg two (finch, tern).

Budget of late entrants (agents 7-12, by token share of the 32M): r0 25%, r1 55%, r2 45%, r3 34%, r4 44% (RW 27-56%). Agents 11-12 get 0-8%. Entrants 7-12 made 36-63 of the 118-152 edits in r1-r4 (47 of 146 in r0), so they did find work; but the last entrants mostly scouted ("Scout findings: all five repositories have working-tree changes...", linnet r4 6.9 min, dunlin r3 8.7 min). Roles at first call: builder 48 of 60, scout 10, researcher 1, fixer 1 (RW: builder 51, scout 5). Scouts correctly pointed at gaps, but only after 4-9 min, when the cap was near. Zero-edit agents: one per run in r1-r4 (linnet, robin, crane, dunlin) and none in r0.

## 4. Take and drop

- 113 takes (RW 109), 11 drops (RW 10), 43 done (RW 31). The drop rule ("drop what you hold before moving on") had no effect: 33 takes happened while the taker still held another item (RW 33), and 59 takes were never closed or dropped by the end (RW 68).
- Holders who never edited the item's project: 21 of 113 (RW 37 of 109). The "start it now" rule helped here.
- Said on the board which part: 105 of 113 takes were followed by a post of the same agent within 1 min (RW 101). Typical: tengo r0 wren 3.5 "I'll take Tengo #7 compiler/runtime. Lark owns parser AST/grammar; please post the planned AST type/field names", scriggo r0 tern 8.9 "Confirmed split: I'll own AST/checker/type method sets ... you own emitter registration/runtime dispatch".
- Deferrals: the pattern "you take it, no you take it" is rare. 31 posts ask someone to take a slice (RW 33), mostly one-way handoffs with an API request, for example wasmi r1 kite 7.6 "Plover, please take a distinct Wasmi slice". Expr r1 finch/linnet 11.7-11.9 is the clear case where two agents ask each other who builds `try(expr,fallback)` (see 5).

## 5. Builds and the zeros

Builds are routine: each project had 4-36 build/test commands, and in 20 of 25 pairs the last build came after the last edit. The five pairs with edits after the last build are the end-of-run breaks (expr r1 2 edits, expr r4 5, scriggo r0 1, scriggo r4 2, wasmi r4 2). Only expr r1 and wasmi r4 left a broken build.

| case | score | cause (grader log, diff, events) |
|---|---|---|
| expr r1 | 0 | `ast/visitor.go:59:7: impossible type switch case: *TryNode ... missing method String`, so the ast package does not build and all 659 base tests fail. Heron's first edit in expr was `ast/node.go` at 13.9 min and `ast/visitor.go` at 14.0, the run ended at 14.0. Before that, expr had only finch's builtins (7 edits: 1.6-4.6 min). Item "Expr block try/catch/finally/retry end-to-end" was added at 8.1 (dunlin, 5), 11.9 (heron, 5) and 12.8 (heron, two 4s), and the 8.1 item was never taken. At 11.7-11.9 finch and linnet were still asking each other who builds the try syntax. Interpretation: nobody owned the heaviest part of expr for 9 minutes, and the work started when the cap was near. |
| expr r3 | 0.152 | wren was the only editor (23 edits 2.4-12.1). Items #1 (parser/AST 4) and #2 (runtime 5) were both taken by wren (0.6 and 1.7 min); nobody else took an expr item before 12.3 min (swift, #2). 67 of 79 new tests fail with "Received unexpected error" in the try/catch tests. One agent carried an 8-part project. |
| wasmi r4 | 0 | base 0 passed: `error[E0603]: module coredump is private` in `crates/wasmi/src/instance/tests.rs:86` (`crate::engine::coredump::capture`), so the lib tests do not compile. Linnet wrote that test at 9.4 min; plover's full suite at 12.2 got as far as a runtime assertion, so it compiled then; the visibility must have changed later (not from an `edit` call I could see; open doubt). Last wasmi edits were linnet 13.9-14.0 in `executor/mod.rs`. Nobody was left to build. |
| scriggo r0-r3 | 0 | Hidden test `TestScriggoMethodDeclVerify` fails 50 of 53 with the same family of errors: r0 `build error: main:8:13: undefined: m` (receiver name not in scope), r1 `nil pointer dereference`, r2 and r3 `panic: reflect: call of reflect.Value.Type on zero Value`. In r3 the same panic also breaks an existing package (`test/misc`, base 520 of 1045 passed, which halves the base fraction). Diffs: parse and checker support are present in all four; the emitter/runtime wiring is thin (r0, r2, r3 touch `emitter.go` and `emitter_func_store.go`, r1 only `emitter_util.go`). r4 (0.75, 41 of 53 pass) touches `emitter_expressions.go`, `builder_instructions.go`, `compilation.go`, `methods.go`; it had the most scriggo edits (heron 24) and ended with edits at 14.0. Interpretation: scriggo is the task where "parts pass their own tests but the whole is not run end to end" is most visible; this is untested by hand. |
| oxvg, all five | 0 | The same 6 of 10 hidden tests fail in every run (`collapse_groups_*` x4 and `remove_empty_containers_*` x2: "group must remain when a child/descendant/adjacent-sibling selector depends on it"); the 4 that pass also pass without any change. It is not a build bottleneck (cargo builds ran, 4-14 builds per run) and not "never finished": 21-50 oxvg tool calls per run (of ~1000), 1-2 main agents (finch/wren), 3-19 edits. Diffs: r0 changes only `inline_styles.rs` (keeps rules with structural pseudo-classes), r1, r3, r4 only `collapse_groups.rs`, r2 `visitor.rs` + `collapse_groups.rs`; none touches `remove_empty_containers`. wren r1 13.3 reported "cargo test -p oxvg_optimiser --lib passes 59/59", a green that does not cover the described behaviour. Interpretation: wrong or incomplete approach (the requirement says implication must be computed from the structure before the rewrite), verified against the repo's own suite. Oxvg got the least attention: items 0, 0, 1, 1, 4. |

## 6. What explains r1 0.279 vs r2 0.520

Difference 0.241 in the run mean (sum of per-task gaps 1.205 / 5): expr 0 vs 0.86 (0.86 of it), wasmi 0.636 vs 0.818 (0.18), tengo 0.758 vs 0.923 (0.17). Oxvg and scriggo are 0 in both. So the spread is mostly one thing: expr in r1 had no builder on its main part until 11.9 min and ended with a broken build. In r2 wren added "Expr error handling syntax and AST nodes" at 0.5 (4 calls in repo), finch and others had 41 expr edits and the last build at 10.8 passed. Same prompt, so this is order and attention effects: which early agent picked which project. Interpretation: the board has no view of "this project has nothing under way", so a project with only a small side part done (builtins) looks started.

The main remaining failure mode (interpretation): the team verifies with its own tests and passes them, but the hidden behaviour is not run end to end, and the project's hardest layer is picked late or never. This accounts for scriggo r0-r3 (parse and check done, runtime panics), oxvg (own suite green), expr r1 (heaviest part started at 12 min). Builds and holders are not the issue anymore.

One concrete lever (interpretation, would exist in real work): a prompt line for when a project's items are all done or the list has gone quiet: "Before calling a project finished, re-read its description line by line, write one small end-to-end example per requirement (not per function), run it in the project, and add a failing one to the list with how to reproduce it." This is oracle-free (agents write the examples) and aims at the oxvg and scriggo zeros. A cheaper board-side companion: show in `tasks` the projects with no unfinished item at weight >= 4 taken, so a project whose heavy part is untaken is visible to a new entrant. This second part is a code change, not a profile change; I did not test either.

## 7. Open doubts

- Whole-project definition: I use "first adder, one item for the project within 1 min", which reproduces RW's 17 of 25. Under the weight guide, a single weight-5 item is not a whole-project item, so the RP count of 12 single-first-item pairs overstates it.
- Edit counts exclude writes through `bash`; per-project attribution of paths uses `/work/<repo>` or the repo name, so a few relative-path edits may be missed.
- The wasmi r4 visibility break was not traced to an event.
- One run per cell; the spread among runs (0.279-0.520) is as large as the gap to RW/baseline, so none of the process changes above can be tied to the score.
