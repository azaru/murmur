Model output (a subagent's contrast of high- and low-scoring project runs, rounds 23–30), not verified by hand.

> Checked by hand in the main session (own scripts over the final diffs and results):
> - **Scriggo:** no run whose final diff leaves `emitter` out of every path scores ≥0.7. That is 24 runs by a plain path match, 22 by this report's layer rule; the 7 highs all touch the emitter.
> - **Expr:** 10 runs (11 here) change only `builtin/` outside tests, and they score 0.063 (nine) or 0.127 (one).
> - **Wasmi:** 19 of 50 runs score exactly 0.364.
> - **A late break:** e29-rtests-r0 wasmi (broken build on `core_dump.rs`, edited at 16.3 min) was already checked in round 29.

## Methods

Data: 50 runs (10 arms x k=5, `experiments/deepswe/runs/<arm>-r<N>/b/`), five projects each. All process numbers come from short Python scripts over `murmur/run/events.jsonl` and `<agent>.messages.json` (tool results), final diffs and hidden-grader logs (`<repo>-logs/new.log`, `<repo>.score.json`). Scripts were in `tmp/claude-contrast/` (deleted).

Definitions.
- **High** = project score >= 0.7; **low** = <= 0.25. The wasmi plateau at exactly 0.364 (8/22 hidden tests) is called **S** and is neither; 19 runs sit on it.
- **Implementation write** = an `edit`/`write` tool call on a non-test file of the project (path normalised; absolute or relative). Test file = `_test.go`, `_test.rs`, `tests/`, `e2e`, `testdata`, `trycatch`, `errorhandling`, `try_catch*` directories. Writes through `bash` (`sed -i`, `cat >`...) are not counted: 19 write-looking bash commands against 4,707 implementation edits in all 50 runs, so the effect is negligible.
- **Layer touched** = at least 5 added non-test lines in files of that layer in the final diff. Layers: expr = parser/, ast/, checker/, compiler/, vm/, builtin/; scriggo = parser*.go, checker*.go, emitter*.go (+builder*, compilation.go), types (types/, typeinfo.go), runtime/, methods.go; wasmi = engine/config.rs, error.rs, `*coredump*`, engine/executor/*, other wiring. Letters in the table: P parser, A ast, C checker, K compiler, V vm, B builtin, E emitter, T types, R runtime, M methods.go; wasmi: cfg, err, dump, exe, wir.
- **Time and tokens**: minutes from `run_start`; tokens = running sum of `usage.total` (checked: it ends at exactly the run total, 32,004,204 in e30-rinteg-r4). Run end = `run_end` (= budget abort).
- **Test outcome** of a tool result: green / fail / build-error / aborted (ends with "Command aborted" = killed by the final budget abort, excluded) from the Go and cargo output. A run is **whole-suite** if it is `go test ./...` without `-run`, or `cargo test` without `--test/--lib` or a name filter.
- **Failure class** from the grader log, assigned by me with regexes and then spot-checked on 12 runs. Events and messages were aligned by order per agent: they agree in all agents except 20 agents with one extra final tool call in the messages (the call in flight at the abort), so the alignment of the rest is exact.
- Statistics are descriptive; the p-values given are one-sided hypergeometric/Fisher tests, **exploratory**, chosen after looking at the data, no correction.

## 0. Summary

1. **Layer coverage is close to necessary but not sufficient.** Scriggo: with no emitter change (22 runs) 0 of 22 are high; with checker and emitter both touched (28 runs) 7 are high (mean 0.26). Expr: all five core layers touched (parser, ast, checker, compiler, vm) in 22 runs gives mean 0.68, 13 high, 3 low; four layers in 9 runs gives 0.33 (2 high); at most three layers (19 runs) gives 0 high. Wasmi: coredump file plus executor hook in 36 runs gives 10 of the 11 highs. Touching a layer is not enough: 10 expr lows touch all layers yet panic (a node type missing in `Checker.visit` or `ast.Walk`), and 16 scriggo lows touch checker and emitter yet fail at run time.
2. **Four behaviours separate high from low** (details in section 6): (a) the swarm stops at the easy half of the feature (expr: only the `try()` function, 11 runs; scriggo: no emitter, 22; wasmi: API without capture, 19), with its own tests green; (b) the headline example is not driven through the public entry point, or a red signal is left red (scriggo 24 of 40 lows saw the hidden error text in their own output, 18 of them again in the last 3 min); (c) edits in the last minute leave a tree that does not build (18 pairs; 16 of them had edits after the last green build, 8 of 8 in wasmi); (d) the hard layer starts late with one owner (scriggo emitter: first edit minute 8.3 in highs vs 11.0 in lows that have one; 11 vs 3.5 edits).
3. **Process counts that do not separate:** number of implementing agents (median 2 in highs and lows), minute of first implementation write (1–4 min everywhere), tokens at first write (1–3M), implementation span (7–11 min), whole-suite runs in the last 3 min (see 3.3), departures (weak), silences (almost none).
4. **Arm effect vs noise.** e25-rclock and e25-roles (10 runs) have 0 expr highs and 0 wasmi highs (p = 0.018 and 0.06 under random placement); outside e25 the highs are spread over all eight other arms (expr 1–3 of 5 per arm, wasmi 1–2, scriggo 0–2). No run has all three of expr, scriggo, wasmi high (best: 2, in 9 runs).
5. **oxvg** is zero in 48 runs because the change was not made or not finished; cargo test cycles are slow (median 3.0 min, 51% of calls blocked on the cargo build-directory lock).

## 1. Scores and failure class of every run

Class codes. expr: `B` block form not parsed (`unexpected token Bracket("{")`, `cannot fetch try`; only the builtins exist); `D` parses but panics `undefined node type` (stack: `Checker.visit` in 7 of the 9 runs whose stack I parsed: e23-base-r0, e23-base-r3, e24-mtasks-r4, e25-roles-r0, e26-rtasks-r3, e27-rweights-r0, e30-rinteg-r0; `ast.Walk` via `optimizer.Optimize` in e30-rinteg-r1 and r4); `V` runs but wrong (e28-rparts-r3, no vm change); `X` repo does not build (e24-mention-r3, e28-rparts-r1). scriggo: `X` the compiler package does not build (7); `F` methods not accepted by parser/checker (`x.Double undefined (type MyInt has no field or method Double)`, `undefined: c`, `method declarations are not supported`, `not enough arguments in call`); `E` front end accepts, run time or emitter fails (`none of the previous conditions matched identifier`, `reflect: call of reflect.Value.Type on zero Value`, `interface conversion: reflect.Type is types.definedType, not *reflect.rtype`, nil dereference); `O` partial. wasmi: `X` base suite does not run (compile error in the final tree, or base_frac 0); `S` plateau 0.364 (API present, capture empty: `index out of bounds: the len is 0`, `left: 0 right: 2`); `T` 0.14 (`coredump should be present`, 13 tests; or `unsupported Wasm version`). `OK` = high, `m` = between 0.25 and 0.7.

Class counts among lows: expr (24) B 11, D 10, X 2, V 1; scriggo (40) F 16, E 16, X 7, O 1; wasmi (12) X 8, T 4. Mean score by class: expr OK 0.86, m 0.59, D 0.15, B 0.15; scriggo OK 0.79, F 0, E 0.01, X 0; wasmi OK 0.79, S 0.36, T 0.19, X 0. Scriggo also has 7 lows that broke the existing suite (base_frac < 0.7: e30-rinteg-r1 0.38, e28-rparts-r3 0.49, e27-rweights-r3 0.02, e25-roles-r1 0.42, r2 0.24, r3 0.49, e26-rtasks-r3 0.66). Of the 7 scriggo `X` runs, 6 are missing helpers in `internal/compiler` (e23-base-r0 `methodRuntimeType`, r3 `isDefinedType`, r4 `runtime.ScriggoMethod`; e24-mtasks-r0 `types`, r1 `too many return values`, r4 `methodNameForDeclaration`) and one is an agent-written root test file (e26-rtasks-r1, `method_declarations_test.go:16:10`).

Full table (score, class, layers touched in the final diff; `.` = not touched):

| run | expr | scriggo | wasmi |
|---|---|---|---|
| e23-base-r0 | 0.20 D `PA.KVB` | 0.00 X `PCE...` | 0.14 T `cfg err dump . .` |
| e23-base-r1 | 0.54 m `P..KVB` | 0.75 OK `PCETR.` | 0.36 S `cfg err . exe .` |
| e23-base-r2 | 0.56 m `PACKVB` | 0.00 F `PCE...` | 0.36 S `cfg err dump exe wir` |
| e23-base-r3 | 0.00 D `PA..VB` | 0.00 X `PC.T..` | 0.82 OK `cfg err dump exe wir` |
| e23-base-r4 | 0.80 OK `PACKVB` | 0.00 X `PC.T..` | 0.64 m `cfg err dump exe wir` |
| e24-mention-r0 | 1.00 OK `PACKVB` | 0.00 E `PCET..` | 0.77 OK `cfg err dump exe wir` |
| e24-mention-r1 | 0.76 OK `PACKVB` | 0.85 OK `PCETR.` | 0.64 m `cfg err . exe wir` |
| e24-mention-r2 | 0.68 m `PACKVB` | 0.54 m `PCE...` | 0.36 S `cfg err dump exe .` |
| e24-mention-r3 | 0.00 X `PACKVB` | 0.00 F `P.....` | 0.00 X `cfg err dump exe wir` |
| e24-mention-r4 | 0.85 OK `PACKVB` | 0.00 E `PCE.R.` | 0.00 X `cfg err . exe wir` |
| e24-mtasks-r0 | 0.49 m `P.CKVB` | 0.00 X `PCET..` | 0.77 OK `cfg err dump exe .` |
| e24-mtasks-r1 | 0.91 OK `PACKVB` | 0.00 X `PCE..M` | 0.00 X `cfg err dump exe wir` |
| e24-mtasks-r2 | 0.76 OK `PA.KVB` | 0.00 F `PC.T..` | 0.82 OK `cfg err . exe wir` |
| e24-mtasks-r3 | 0.34 B `...KVB` | 0.00 F `P.....` | 0.50 m `cfg err dump exe wir` |
| e24-mtasks-r4 | 0.20 D `PACKVB` | 0.00 X `PCET..` | 0.36 S `cfg err dump exe .` |
| e25-rclock-r0 | 0.13 B `.....B` | 0.00 O `......` | 0.36 S `cfg err . exe .` |
| e25-rclock-r1 | 0.06 B `.....B` | 0.00 F `P.....` | 0.36 S `cfg err dump exe .` |
| e25-rclock-r2 | 0.06 B `.....B` | 0.00 F `P.....` | 0.36 S `cfg err dump . wir` |
| e25-rclock-r3 | 0.06 B `.....B` | 0.00 F `P.....` | 0.36 S `cfg err dump exe .` |
| e25-rclock-r4 | 0.06 B `.....B` | 0.00 F `PC....` | 0.36 S `cfg err . exe .` |
| e25-roles-r0 | 0.20 D `PA.KVB` | 0.00 F `P.....` | 0.36 S `cfg err dump exe .` |
| e25-roles-r1 | 0.06 B `.....B` | 0.00 E `PC.T..` | 0.36 S `cfg err dump exe wir` |
| e25-roles-r2 | 0.04 D `PAC..B` | 0.00 E `PC.T..` | 0.36 S `cfg err dump exe .` |
| e25-roles-r3 | 0.06 B `.....B` | 0.00 E `PCE...` | 0.36 S `cfg err dump exe .` |
| e25-roles-r4 | 0.06 B `.....B` | 0.73 OK `PCET..` | 0.36 S `cfg err dump exe .` |
| e26-rtasks-r0 | 0.81 OK `PACKVB` | 0.52 m `PCE...` | 0.00 X `cfg err dump exe .` |
| e26-rtasks-r1 | 0.06 B `.....B` | 0.00 X `PCET..` | 0.36 S `cfg err dump exe .` |
| e26-rtasks-r2 | 0.34 B `PACKVB` | 0.00 E `PCET..` | 0.00 X `cfg err dump exe wir` |
| e26-rtasks-r3 | 0.20 D `PA.KVB` | 0.18 E `PCET.M` | 0.36 S `cfg err . exe .` |
| e26-rtasks-r4 | 0.34 B `...KVB` | 0.00 E `PCET..` | 0.36 S `cfg err dump . wir` |
| e27-rweights-r0 | 0.03 D `PA.KVB` | 0.00 E `PC.T..` | 0.00 X `cfg err dump exe wir` |
| e27-rweights-r1 | 0.48 B `PACKVB` | 0.47 m `PCETR.` | 0.36 S `cfg err . exe .` |
| e27-rweights-r2 | 0.00 B `......` | 0.00 F `PC.T..` | 0.77 OK `cfg err dump exe wir` |
| e27-rweights-r3 | 0.76 OK `P.CKVB` | 0.00 E `PC.T..` | 0.14 T `cfg err dump . wir` |
| e27-rweights-r4 | 0.58 m `P..KVB` | 0.00 F `PC.T..` | 0.77 OK `cfg err dump exe wir` |
| e28-rparts-r0 | 0.75 OK `PACKVB` | 0.00 F `PCET..` | 0.64 m `cfg err dump exe wir` |
| e28-rparts-r1 | 0.00 X `.A...B` | 0.00 E `PCET..` | 0.64 m `cfg err dump exe wir` |
| e28-rparts-r2 | 0.86 OK `PACKVB` | 0.00 E `PCET..` | 0.82 OK `cfg err dump exe wir` |
| e28-rparts-r3 | 0.15 V `PACK.B` | 0.00 E `PCET..` | 0.77 OK `cfg err dump exe wir` |
| e28-rparts-r4 | 0.86 OK `PACKVB` | 0.75 OK `PCE.RM` | 0.00 X `cfg err dump exe wir` |
| e29-rtests-r0 | 0.97 OK `PACKVB` | 0.85 OK `PCE...` | 0.00 X `cfg err . exe wir` |
| e29-rtests-r1 | 0.34 D `PACKVB` | 0.00 F `PC....` | 0.36 S `cfg err dump exe .` |
| e29-rtests-r2 | 0.68 m `PACKVB` | 0.00 F `PC.T..` | 0.41 T `cfg err dump exe wir` |
| e29-rtests-r3 | 0.95 OK `PACKVB` | 0.00 F `PC....` | 0.77 OK `cfg err dump exe wir` |
| e29-rtests-r4 | 0.06 B `.....B` | 0.00 E `PCET..` | 0.68 m `cfg err dump exe wir` |
| e30-rinteg-r0 | 0.00 D `PA..VB` | 0.75 OK `PCET..` | 0.77 OK `cfg err dump exe wir` |
| e30-rinteg-r1 | 0.20 D `PA.KVB` | 0.00 E `PC.T..` | 0.68 m `cfg err dump exe wir` |
| e30-rinteg-r2 | 1.00 OK `PACKVB` | 0.00 E `PC.T..` | 0.14 T `cfg err dump . .` |
| e30-rinteg-r3 | 0.94 OK `PACKVB` | 0.85 OK `PCET..` | 0.14 T `cfg err dump exe .` |
| e30-rinteg-r4 | 0.20 D `PACKVB` | 0.00 F `PCET..` | 0.77 OK `cfg err dump exe wir` |

Source: `experiments/deepswe/runs/<run>/b/<repo>.diff`, `<repo>.score.json`, `<repo>-logs/new.log`.

## 2. Layers and score

| task | layers touched | runs | mean | high | low |
|---|---|---|---|---|---|
| expr (core = P, A, C, K, V) | 0 | 11 | 0.06 | 0 | 11 |
| | 1–3 | 8 | 0.23 | 0 | 4 |
| | 4 | 9 | 0.33 | 2 | 6 |
| | 5 | 22 | 0.68 | 13 | 3 |
| scriggo (core = P, C, E, T) | emitter not touched | 22 | 0.00 | 0 | 22 |
| | emitter + checker touched | 28 | 0.26 | 7 | 18 |
| wasmi (core = cfg, err, dump, exe) | dump and exe both | 36 | 0.46 | 10 | 7 |
| | one of them missing | 14 | 0.31 | 1 | 5 |

What a complete change touches (from the 15/7/11 high runs): expr parser (`try {` syntax), `ast/node.go`, `ast/visitor.go`, `ast/print.go`, `checker/checker.go`, `compiler/compiler.go`, `vm/opcodes.go`, `vm/program.go`, `vm/vm.go` (or `vm/retry.go`), `builtin/*`. Scriggo: `ast/ast.go`, `parser_func.go`, `checker_package.go`, `checker_expressions.go`, `checker_statements.go`, `emitter.go`, `emitter_expressions.go`, `typeinfo.go` (e29-rtests-r0, e30-rinteg-r3) or the `types/` subsystem plus `runtime/` (e23-base-r1, e24-mention-r1). Wasmi: `engine/config.rs`, `error.rs`, a coredump module, `engine/executor/mod.rs` (and sometimes `handler/*`). Examples: e30-rinteg-r2 (expr 1.0): 14 files, P 50, A 52, C 37, K 87, V 81, B 76 lines. e29-rtests-r0 (scriggo 0.85): checker 57 + emitter 53 lines.

Implementing agents per project (final diff authors from edit events): median 2 in expr (H 2, L 2), 2 in scriggo (H 2, L 2), 3 in wasmi (H 3, L 3). In the hard layer (scriggo emitter) the median number of writers is **1** in both the 7 highs and the 18 lows that have one; the same agent edited checker and emitter in 6 of 7 highs and 14 of 18 lows. So splitting is not what separates them.

## 3. Process measures, high against low

### 3.1 Medians (n in header)

| measure | expr H (15) | expr D (10) | expr B (11) | scriggo H (7) | scriggo F (16) | scriggo E (16) | scriggo X (7) | wasmi H (11) | wasmi X (8) | wasmi T (4) |
|---|---|---|---|---|---|---|---|---|---|---|
| implementing agents | 2 | 3 | 1 | 2 | 2 | 2 | 2 | 3 | 4 | 2 |
| agents with >= 3 impl edits | 2 | 2.5 | 1 | 2 | 1 | 2 | 2 | 2 | 3 | 2 |
| implementation edits | 29 | 24 | 4 | 31 | 10 | 20.5 | 17 | 25 | 23 | 13 |
| first impl write, min | 1.5 | 1.6 | 1.0 | 3.7 | 3.1 | 2.7 | 1.5 | 2.3 | 1.4 | 3.3 |
| tokens at first write, M | 1.0 | 1.4 | 1.6 | 3.1 | 2.8 | 2.5 | 1.9 | 1.7 | 1.4 | 3.4 |
| last impl write, min before end | 0.9 | 0.3 | 9.1 | 0.1 | 0.6 | 0.3 | 0.1 | 0.4 | 0.0 | 0.8 |
| impl span, min | 10.6 | 9.4 | 7.2 | 10.0 | 7.0 | 8.7 | 9.3 | 9.4 | 11.2 | 6.7 |
| impl edits in last 2 min | 5 | 6 | 0 | 6 | 2 | 6 | 7 | 5 | 5.5 | 3 |
| whole-suite runs | 9 | 7.5 | 10 | 8 | 4.5 | 7.5 | 5 | 1 | 0.5 | 0.5 |
| first whole-suite run, min | 3.3 | 1.6 | 0.6 | 4.4 | 2.2 | 3.0 | 1.3 | 6.7 | 7.8 | 5.8 |
| run length, min | 13.7 | 13.4 | 16.6 | 15.2 | 13.2 | 13.2 | 12.7 | 13.2 | 13.0 | 12.4 |

Reading: nothing in rows 1–7 separates D from H in expr: the same two agents write the same number of edits over the same span. The expr B runs are different: they stop implementing 9.1 min before the end (median) and have 4 implementation edits; the swarm believed it was done. In scriggo the highs start writing later (3.7 min, 3.1M tokens) than F/E/X lows (1.5–3.1 min) and run the first whole suite later (4.4 vs 1.3–3.0); n = 7, so this is a hint only. Wasmi X runs have the most implementers (4) and the longest span (11.2 min): many hands, last edits 0.0 min before the end.

Tengo (sanity, 43 high, 6 low): implementing agents 2 vs 1.5, first write 2.2 vs 1.7 min, last whole-suite run green in 41/43 highs and 4/6 lows. Lows: e25-rclock-r0/r1/r3 (the lone implementer left with `done` at 7.9, 0.7 and 0.7 min before the end, 1–7 edits), e25-roles-r1, e23-base-r3, e26-rtasks-r2. Tengo's pattern matches the others: the hard part is not reached.

### 3.2 Whole suite and end-to-end tests in the last 3 minutes (last such run's result)

| task, group | whole-suite in last 3 min | e2e test run in last 3 min | any test run in last 3 min |
|---|---|---|---|
| expr H (15) | green 12, fail 1, build-error 1, none 1 | green 3, fail 1, none 11 | green 11, fail 3, other 1 |
| expr L (24) | green 13, fail 4, build-error 2, none 5 | green 1, fail 2, none 21 | green 17, fail 4, build-error 1, none 2 |
| scriggo H (7) | green 3, fail 3, build-error 1 | fail 2, build-error 2, none 3 | green 3, fail 4 |
| scriggo L (40) | green 17, fail 12, build-error 3, none 8 | fail 4, green 1, build-error 2, none 33 | green 20, fail 9, build-error 8, none 3 |
| wasmi H (11) | green 4, fail 1, build-error 1, none 6 | green 4, fail 2, none 4, other 1 | green 8, fail 2, other 1 |
| wasmi L (12) | green 1, fail 2, build-error 1, none 8 | build-error 3, fail 2, none 5, other 1 | green 5, build-error 5, fail 1, other 1 |

The "fail" of a scriggo whole suite is not informative: the unmodified repo already fails 0.7% of its base tests (base_frac 0.993 in most runs). The outcome in the last 3 minutes does **not** discriminate in expr: 13 of 24 lows had a green whole suite in their last 3 min, and e30-rinteg-r4's last test run ended green 0.06 min before the end (hidden grade 0.20). Reason: the agents' own tests do not exercise what the grader exercises. Wasmi: in 8 of 12 lows and 6 of 11 highs nobody ran the whole suite in the last 3 min (a cargo suite takes minutes).

### 3.3 Was the grader's failure visible to the agents?

Method: grader error text for each low (e.g. `undefined node type`, `cannot fetch try`, `none of the previous conditions matched`, `reflect: call of reflect.Value`, a compile error text), searched in the results of test/build commands of that project, excluding aborted calls.

| task | lows | with signature | seen in own test/build output | first sighting, median min | lead before end, median min | seen again in last 3 min | seen >= 5 min before end |
|---|---|---|---|---|---|---|---|
| expr | 24 | 22 | 5 | 4.5 | 8.8 | 2 | 4 |
| scriggo | 40 | 40 | 24 | 9.3 | 2.4 | 18 | 8 |
| wasmi | 12 | 10 | 2 | 12.9 | 0.7 | 2 | 0 |

- expr: the panic string appeared in agent output in only 3 of 10 D runs (e30-rinteg-r1: swift at 4.5 min, nothing after; e30-rinteg-r4: wren at 7.2; e30-rinteg-r0: finch at 4.2, last 10.3). In the other 7 D runs the panic string never appeared in any test or build result. In B runs the signature was visible in 1 of 11 (e29-rtests-r4, finch 1.1 min, last 9.9, run ended 12.7).
- scriggo: where seen, the error was usually still in view at the end: e29-rtests-r1/r2/r3 first saw `has no field or method` / `none of the previous conditions` at 4.8, 6.9, 6.8 min and last at 10.1, 12.0, 11.9 (run ends 10.7, 12.4, 13.2); e30-rinteg-r4 first 4.2 (finch), last 12.5 (end 13.3). That is 6–8 min of visible, unresolved failure, not neglect. For 6 of the 7 compile-broken runs (e24-mtasks-r4: never seen) the build error is first seen 0.0–1.5 min before the end (e23-base-r0: 24.5 of 24.6; r3: 12.3 of 12.7; r4: 13.5 of 13.7; e24-mtasks-r0: 10.7 of 10.8; e24-mtasks-r1: 15.8 of 16.9; e26-rtasks-r1: 9.7 of 10.0).
- wasmi: the missing capture was almost never observed: in the 19 S runs the last own test run was green in 17; in the 10 lows with a signature it was seen in 2.

Public-API test of the headline syntax in expr (a test file that contains `try {` and calls `expr.Compile/Eval/Run`): written in 10 of 15 highs (first at 4.2 min median) and 7 of 24 lows (p = 0.024 one-sided, exploratory; excluding the 10 e25 runs 6 of 14 lows vs 10 of 15 highs, p about 0.2). In 4 of the 7 lows that wrote it (e30-rinteg-r0 0.9 min, r1 1.1, r4 1.6, e29-rtests-r4 1.1) the test existed from minute 1–2 and, as far as the final grade shows, the feature never worked.

### 3.4 Departures, silences, late edits, broken build

- **Departures (`done`) of implementers**: expr 3 of 15 highs vs 9 of 24 lows (p = 0.22); scriggo 0 of 7 vs 11 of 40 (p = 0.13); wasmi 2 of 11 vs 3 of 12. All 166 `done` events: e23 29, e24-mention 26, e24-mtasks 29, e25-rclock 58, e25-roles 3, e26 0, e27 3, e28 4, e29 8, e30 6; median 7.1 min before the end. Weak evidence, and almost gone in e26+.
- **Silences** (gap >= 3 min between consecutive tool-call starts of an agent, or from its last call to its `done`/the end): 365. 267 are one long-running command (cargo or go, mid-run) and 89 are a last command still running at the abort. Only 9 are an idle gap with a short call; 7 of them are agents that then called `done` (5 in e24-mtasks-r1), leaving **2 stalled holders**: e30-rinteg-r4 crane (read at 6.6 min, next event the abort at 13.3; the model call hung; the task-list footer says `taken ... by you: #13`, a scriggo item, and scriggo scored 0) and e27-rweights-r1 swift (5.4 to 11.8 min, tool `tasks`). Two in 50 runs: rare.
- **Long command waits** (>= 3 min) per project and run, median: wasmi H 1 (4.8 agent-min) vs L 2.5 (11.1 agent-min); oxvg 2.0 (16.4 agent-min); expr L 1.5, H 0; scriggo 0.
- **Late edits** (implementation, last 2 min): present in nearly every run (median 5–6 in highs and in lows of expr/scriggo/wasmi); does not separate by itself.
- **Edits after the last green build/test of the project**, share of runs with at least one: expr H 0.40, L not-broken 0.29, L broken 1.0 (2 of 2); scriggo H 0.57, L not-broken 0.42, L broken 0.75 (6 of 8); wasmi H 0.36, L not-broken 0.0, L broken 1.0 (8 of 8; p = 0.007 vs highs, exploratory). In broken runs the median number of such edits is 2–3.5 and the last edit is 0.0–0.2 min before the end.
- **Build broken at the end** (base_frac < 0.1): expr 2, scriggo 8 (the 7 X plus e27-rweights-r3, base 0.015), wasmi 8: 18 of 150 project-runs.

## 4. Arm effect against noise

| arm | expr H/L | scriggo H/L | wasmi H/L (S plateau) | 5-task mean |
|---|---|---|---|---|
| e23-base | 1/2 | 1/4 | 1/1 (2) | 0.357 |
| e24-mention | 3/1 | 1/3 | 1/2 (1) | 0.434 |
| e24-mtasks | 2/1 | 0/5 | 2/1 (1) | 0.370 |
| e25-rclock | 0/5 | 0/5 | 0/0 (5) | 0.190 |
| e25-roles | 0/5 | 1/4 | 0/0 (5) | 0.241 |
| e26-rtasks | 1/2 | 0/4 | 0/2 (3) | 0.292 |
| e27-rweights | 1/2 | 0/4 | 2/2 (1) | 0.351 |
| e28-rparts | 3/2 | 1/4 | 2/1 (0) | 0.422 |
| e29-rtests | 2/1 | 1/4 | 1/1 (1) | 0.439 |
| e30-rinteg | 2/3 | 2/3 | 2/2 (0) | 0.434 |

e25 is a real arm effect: 10 of 10 runs have expr in class B or D (0.04–0.20; 8 of them 0.06 or below, the builtin-only plateau), 10 of 10 wasmi are on the 0.364 plateau, and the e25-rclock runs last 21–40 minutes, about twice the other arms. In e25-roles-r3 plover wrote at 11.9 min "Expr core (try/catch/finally/retry parser/compiler/VM) is still wholly unimplemented and blocks most task" and the run ended at 12.0; in e25-rclock-r2 crane's final verification at 33.2 min said the green suites "do not fulfill task spec" and then called `done`. Outside e25 the highs are spread: expr highs in 8 of 8 other arms, wasmi in 7 of 8, scriggo in 5 of 8; the best arms (e28, e29, e30) have more expr highs per arm (2–3) and fewer wasmi S plateaus (0–1) than e23/e26/e27, but arms differ by at most 2 highs of 5 per task, within the run-to-run spread, so no arm is decided by this table. Scriggo highs: 7 runs in 6 arms (e23-r1, e24-mention-r1, e25-roles-r4, e28-rparts-r4, e29-rtests-r0, e30-rinteg-r0 and r3).

## 5. oxvg

Hidden tests: 10, of which 4 pass on the unmodified repo (that is the `passed 4, ref_new_total 6` pattern in 37 of 50 runs) and 6 need the change; the score counts only those 6. 48 runs score 0; 2 do not: e25-rclock-r0 0.67 (8 passed, 2 `remove_empty_containers_*` still failing) and e29-rtests-r3 0.5 (7 passed, 3 failing).
- Zero runs: median 4 implementation edits by 1 agent (min 0, max 20; 6 runs with no implementation write), first write at 3.7 min, median 5 `cargo test` commands of which 1 completed with a result; 6 final trees did not compile (`NonWhitespace` Display, `to_css_string`, `visit_types` not a trait member, `document` not found, move out of deref).
- Non-zero: e25-rclock-r0 had 4 implementers and 38 edits (visitor.rs `structurally_implicated_elements` set computed before mutation, collapse_groups.rs), first write only at 20.2 min, in a 27.9 min run; e29-rtests-r3 had one agent, 4 edits at 8.1–8.6 min (pre-computed `selector_protected_elements` in `Context`, collapse_groups.rs) and no more. Both added the "capture implicated elements before rewriting" state to the shared `Context` and consulted it in `collapse_groups`.
- Cost of a cycle: 637 oxvg cargo commands, median duration 3.0 min (50% >= 3 min, p90 14.5 min); 326 (51%) printed "Blocking waiting for file lock" and those took a median 2.05 min against 0.14 without the message (wasmi: 388 of 1,305 calls). Median agent-minutes blocked on the lock per oxvg run: 17.7 (12 agents x 13 min = 156 agent-min). With 13-minute runs one agent gets 1–3 oxvg cycles. This is evidence for "time and contention", not proof; the 48 zeros may also be the difficulty of the semantics.

## 6. Behaviours that separate high from low

**B1. The swarm stops at the easy half of the feature, with its own tests green.**
- Evidence: expr B, 11 lows (5 e25-rclock, 3 e25-roles, e26-rtasks-r1, e27-rweights-r2, e29-rtests-r4): only `builtin/` changed, 5 of 79 hidden tests, last own test green in 9 of 11; implementation ended 9.1 min before the end (median). Scriggo, 22 runs without an emitter change: 0 high, mean 0.0. Wasmi S, 19 runs: config and error API present, hidden tests report empty frames/globals/memories. Expr D, 10 runs: all layers written except one node-type switch (`Checker.visit` in 7 of the 9 parsed stacks, `ast.Walk` in 2): up to 63 of 79 hidden tests die in the panic.
- Frequency: expr 21 of 50 runs, scriggo 22 of 50, wasmi 19+ of 50 (not independent of e25: 10 of the 21 expr cases and 10 of the 19 wasmi cases).
- Cost (upper bound, assuming the affected runs reached the mean of the runs that have the layers; overlaps with B3): expr +0.055 on the 5-task mean, scriggo +0.023, wasmi +0.010, total about +0.09 (about +0.05 without e25).
- Lever sketch: a peer norm, not a role: "before you call done on a feature, find one existing sibling of it (for a new node type, another node type; for a new method form, another receiver form) and list every file where the sibling appears (`grep` the sibling across the repo); post the list; each remaining entry is an open item for anyone". It needs no test and works for a task with none. The D panics are exactly places where every existing node type already has a case; the 22 no-emitter scriggo runs would have the emitter on the list. Evidence weakness: I did not check that a sibling grep would have found each missing site; it is an inference.

**B2. The headline example from the task text is not driven through the public entry point, or the red signal is left red.**
- Evidence: expr public-API block-form test written in 10 of 15 highs vs 7 of 24 lows (p = 0.024 one-sided, exploratory; 6/14 vs 10/15 without e25). Of the 10 D runs, in 7 the panic string never appeared in a test result and 3 saw it (e30-rinteg-r1 at 4.5 min, r4 at 7.2, r0 at 4.2) and did not fix it by the end (8.8, 6.1, 9.2 min later). Scriggo lows saw the hidden failure text in 24 of 40 runs and again in the last 3 min in 18, median 2.4 min before the end.
- Frequency: expr 17 of 24 lows without the test; scriggo 24 of 40 lows with the failure visible and unresolved.
- Cost: not separable from B1 (same runs). Rounds 29 and 30 already pushed tests first (a public-API block-form test existed from 0.9–1.6 min in e30-rinteg-r0/r1/r4 and e29-rtests-r4) and these runs still ended without a working feature, so the weak step is turning a red end-to-end test into an owned, open item, not writing it.
- Lever sketch: an item (or board line) that is created automatically when an end-to-end run fails and stays open until the same command is green, visible to everyone; a request between equals ("take this failing command"). Works without a hidden test: it uses the agents' own test output only.

**B3. Unverified edits in the last minute leave a tree that does not build.**
- Evidence: 18 project-runs with base_frac < 0.1 (expr 2, scriggo 8, wasmi 8); 16 of them had edits after the last green build (expr 2/2, wasmi 8/8, scriggo 6/8), median 2–3.5 such edits, last edit 0.0–0.2 min before the end. Build errors first seen 0–1.5 min before the end in 6 of the 7 scriggo X.
- Frequency: 18 of 150 project-runs (12%).
- Cost: +0.025 on the 5-task mean at most (expr 0.003, scriggo 0.006, wasmi 0.016; assumes the runs would reach the mean of non-broken runs, probably an overestimate for scriggo).
- Lever sketch: a norm "build the project after every edit set before the next edit and never leave a multi-file change half applied", or a mechanical hook that appends the cheap build result (`go build ./...`, `cargo check`) to the result of an edit in a project; both work for any task. Weakness: the end comes from a token cap the agents cannot see, so the final seconds cannot be guarded by a norm alone; the e25 clock arm did not help (0.19).

**B4. The hard layer starts late, with one owner, and gets few edits.**
- Evidence: scriggo, emitter first edit at 8.3 min in highs vs 11.0 in lows that touch it, 11 vs 3.5 edits in the layer; median 1 writer in both groups; lows write parser and checker first (first implementation 2.7–3.1 min). Wasmi: first edit in dump/exe at 4.4 (H) vs 6.6 min (L).
- Frequency: all scriggo and wasmi runs.
- Cost: part of B1; no separate estimate.
- Lever sketch: a request between equals, not a role: whoever finishes the front-end layer posts "emitter/runtime needed, who takes it", or a rule that a layer reached by nobody within the first third of the run is listed as open. Weakest of the four (n = 7 highs; medians differ by under 3 minutes).

Infrastructure note (not a behaviour): cargo calls queue on one build directory (oxvg 51%, wasmi 30% of calls blocked on the lock), costing about 11% of agent time on oxvg and, by exclusion, making the one-cycle-per-agent regime of oxvg. A per-agent target directory would be a harness change, outside this analysis.

## 7. Doubts

- Class assignment (B/D/X, F/E, S/T) is mine, by regex and a 12-run spot check; the table in section 1 allows rechecking. The layer threshold of 5 added lines counts a stray edit as a layer.
- Layer coverage is a necessary-looking, not sufficient, condition; the p-values come after looking, uncorrected, and arm is confounded with them (e25).
- "Seen in own output" counts only strings in test/build command results; an agent could have seen the failure by reading code.
- The last tool call of 20 agents is in the messages but not in the events (aborted call), so late-edit counts can be one low.
- Cost figures assume that fixing a behaviour would give the mean of the runs that do not show it; they are upper bounds and overlap.
- The wasmi S plateau and expr B plateau are well supported; the D "dispatch site" mechanism rests on 9 parsed stacks; B4 on 7 high scriggo runs.
