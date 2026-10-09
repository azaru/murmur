Model output (subagent), 2026-10-09. No agent or model was run.

> Checked by hand in the main session: the fail-to-pass and base test counts of the ten recommended candidates in `experiments/deepswe/refs/<id>.json` match the table (for example sqlfmt 32 / 1155, meriyah 49 / 50,834, abs 21 / 2); the dry runs were not re-run.

# DeepSWE candidates, second selection (to recalibrate the five-task batch)

Difficulty is a guess from the shape of the reference patch only; nothing here is calibrated against a single agent or a swarm.

## Key claims

1. 12 tasks pass the driver's dry mode, 0 failed. Proof: `nice -n 15 node experiments/deepswe/run-batch.mjs --tasks <id> --dry --id dry-sel-<id>`, one task at a time, all exit 0 and every line `PASS` (reference solution scores 1.0 with binary 1, untouched base scores 0, anti-leak, no network in the sidecar, timeout kill, 12 concurrent calls). Refs written: `experiments/deepswe/refs/<id>.json` (12 new untracked files; kept).
2. The pool had 117 entries; after removing every id in `experiments/deepswe/refs/` and the four earlier rejects, about 87 tasks remained. I filtered by language and by how test.sh invokes the runner (`go test`, `pytest`, `npx jest`, `npx vitest run`, `mocha`), skipping Rust, Deno (cliffy), `pnpm -F`/`--filter`/`npm run` wrappers (koota, quill, drizzle, kysely, happy-dom, clack, vitest-duration-sharding, optique), builds-first tasks and giant repos (kgateway, pebble, kcp-go, wazero, numba, prometheus). Not dry-run, so not claimed to work: those exclusions are by reading test.sh only.
3. Scorer parsing works for all 12: `parsed` is large in both modes (for example meriyah 50,900, csstree 16,790, bandit 359, opa 9, abs-stepped-slices 12).
4. Test seconds are the `seconds` fields of the scorer's `base` and `new` runs on the reference (images were already local or pulled without a rate-limit error). Peak sidecar memory comes from `docker stats --no-stream` every ~3 s (container limit 3 GB); short peaks are missed and agents compile more than the reference run, so these are lower bounds. All peaks are under 1 GB; no network is needed.
5. Anti-leak: `rev-list --all` equals `rev-list HEAD` for all 12 (commit counts: abs 652, anko 1102, bandit 1498, csstree 1249, katex 2246, meriyah 971, opa 6245, sql-formatter 3095, sqlfmt 503, tomlkit 459, yaegi 1097), no unreachable objects, refs or remotes.
6. Patch stats from `../deep-swe/tasks/<id>/solution/solution.patch` (files, `+`/`-` lines excluding headers). Reference points from the first report: expr 12 / 446, tengo 6 / 754, wasmi 11 / 603 (the hard ones), versus etree 8 / 1453 and dasel 4 / 959 (easy). Size did not predict difficulty before, so the "why mid-band" column rests on layer count and hidden requirements, not lines.

## Valid candidates, ranked (10 recommended, 2 reserves)

patch = files / changed lines; f2p = fail-to-pass tests in the ref; base = tests that must stay green; seconds = scorer `base` / `new` run on the reference; mem = peak sidecar MiB.

| # | id | lang | patch | f2p | base | dry | test s (base / new) | mem MiB | why chosen, why it should land mid-band |
|---|---|---|---|---|---|---|---|---|---|
| 1 | sql-formatter-bigquery-pipe-formatting | ts (jest) | 11 / 589 | 26 | 5709 | PASS | 12.4 / 5.8 | 958 | New syntax crosses tokenizer, token disambiguation, PEG grammar (`grammar.ne`, needs the nearley compile step), AST, expression formatter and the dialect config; plus 5,709 existing formatting tests that must not move. Layered like expr/tengo; formatting output is judged by exact strings, so partial credit is granular |
| 2 | sqlfmt-create-table-ddl-formatting | python | 10 / 755 | 32 | 1155 | PASS | 35.3 / 1.0 | 208 | New splitter/merger/rules/token models and line-breaking in 10 files of a formatter whose existing output must stay byte-identical (1,155 base tests); exact-output tests need many unstated decisions (430-word spec) |
| 3 | anko-typed-variable-bindings | go | 9 / 500 | 9 | 93 | PASS | 7.4 / 4.4 | 295 | Language feature through the yacc grammar (`parser.go.y`, must be regenerated), AST, env and VM; closest in shape to tengo and scriggo. Second Anko task (see doubts: anko-default-function-arguments is in refs). Only 9 f2p, so steps are coarse |
| 4 | meriyah-explicit-resource-declarations | ts (vitest) | 6 / 580 | 49 | 50,834 | PASS | 141.4 / 3.7 | 746 | `using` / `await using` in a hand-written JS parser: context-sensitive keyword handling (`await using` vs. expression, `for` heads, ASI) and the 50k-test suite must stay green. Short spec (184 words), many edge cases left to the agent |
| 5 | yaegi-go-embed-directives | go | 3 / 618 | 38 | 51 | PASS | 3.8 / 1.3 | 474 | `//go:embed` inside a Go interpreter: comment-directive plumbing from the parser through the interpreter's program/global initialisation, `embed.FS` values and type-driven rules (string / []byte / FS). 3 files only, so it may saturate; included for the interpreter shape |
| 6 | bandit-interprocedural-taint-checks | python | 9 / 844 | 66 | 274 | PASS | 17.3 / 6.5 | 288 | New taint engine in `node_visitor`, issue model and five plugin checks (shell, sql, path, ssrf, xss) with a `setup.cfg` entry-point registration; 66 behaviours. Very short spec (124 words), so the hidden requirements dominate |
| 7 | katex-multicolumn-array-spans | js (jest) | 4 / 598 | 94 | 599 | PASS | 3.3 / 2.3 | 135 | `\multicolumn` across the parser, function registry, array environment and rendering; very short spec (91 words), 94 output-exact tests give granular credit |
| 8 | tomlkit-toml-table-converters | python | 4 / 598 | 60 | 964 | PASS | 1.8 / 0.6 | 26 | Round-trip-preserving conversions between table kinds (comments, whitespace, dotted keys); many edge cases per conversion. Fast and light; may be the easiest of the ten |
| 9 | csstree-shorthand-expansion-compression | js (mocha) | 3 / 519 | 79 | 16,711 | PASS | 3.6 / 0.9 | 238 | Algorithmic: expand and re-compress CSS shorthands for many properties against the lexer's grammar data; 79 tests over many properties give granular credit, but only 3 files |
| 10 | abs-module-cache-flags | go | 4 / 728 | 21 | 2 | PASS | 2.0 / 15.2 | 144 | Cross-cutting runtime change (module resolution order, cache keys, env precedence, debug output, REPL script mode) with many named behaviours in a 357-word spec; 21 tests |
| R1 | abs-stepped-slices | go | 3 / 546 | 6 | 6 | PASS | 3.9 / 1.2 | 149 | Parser + AST + evaluator (arrays and strings, rune-correct, assignment). Only 6 f2p tests: coarse partial credit. Same repo as #10 |
| R2 | opa-template-string-reconstruction | go | 4 / 506 | 5 | 4 | PASS | 13.3 / 5.7 | 408 | Rego partial-evaluation output rewriting; only 5 f2p and 4 base tests, so one miss costs 20%. Big repo (6,245 commits) |

Languages in the ten: Go 3 (anko, yaegi, abs), Python 3 (sqlfmt, bandit, tomlkit), JS/TS 4 (sql-formatter, meriyah, katex, csstree). One per repository.

## Failures

None: all 12 attempted tasks passed. No task was dropped for scorer, network, memory or image problems, and no `toomanyrequests` error occurred.

## Open doubts

- No difficulty evidence exists for any of these; the ranking is a shape-based guess. Several (tomlkit, csstree, yaegi, katex) have 3-4 patch files and could score above 0.9 for one agent, like most of the ≥0.9 tasks in round 17. The screen must decide; I would expect sql-formatter, sqlfmt, anko, meriyah and bandit to be the best bets.
- meriyah's first scorer base run took 141 s (cold TypeScript/vitest start, 50k tests) against 3.7 s for the new run; later runs may be faster if the cache is warm. It is the only slow task.
- anko-typed-variable-bindings changes `parser.go.y`: the agent has to regenerate the parser with goyacc offline; the reference does it in the image (dry PASS), but an agent that forgets leaves a stale `parser.go`. This is a legitimate extra layer, but also a possible zero for infrastructure-like reasons. Same repo as the already-screened anko-default-function-arguments (listed in `refs/`; I did not find where it ranked).
- sql-formatter likewise depends on regenerating the grammar (`grammar.ne`); the memory peak of 958 MB is the highest of the set.
- jest/vitest/mocha tasks parse correctly with the scorer's injected reporters; the `npx vitest run --bail 1` in meriyah is rewritten by the scorer's sed (the `--bail` flag is removed).
- abs-module-cache-flags new-run time (15 s) is dominated by the evaluator tests, not a problem. Peak memory is a sampled lower bound.
- Docker disk use is now about 12 images heavier; nothing was removed.
