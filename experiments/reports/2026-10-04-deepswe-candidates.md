# DeepSWE candidates for stage E screening

Model output (subagent), 2026-10-04. No agent or model was run. Difficulty is a guess from size evidence only; none of it is calibrated against C1T (one agent with the clock and the tokens left).

## Key claims

1. 12 tasks pass the driver's dry mode (reference solution scores 1.0 with binary 1, untouched base scores 0, anti-leak check passes, no network in the sidecar). Proof: `node experiments/deepswe/run-batch.mjs --tasks <id> --dry` per task, one at a time under `nice -n 15`, all exit 0 (all `PASS` lines). The refs are `experiments/deepswe/refs/<id>.json` (new files, untracked at the time of writing).
2. Four other candidates failed the dry mode or were unusable (table below). Proof: the same command; `FAIL` lines.
3. Patch size, file counts and instruction length come from `../deep-swe/tasks/<id>/solution/solution.patch` (`grep -c '^diff --git'`, count of `+`/`-` lines) and `instruction.md`. These patches contain no test files. For scale: expr (kept, C1T mean 0.671) is 12 files / 446 lines; termenv (0.97+) 8 / 472; cattrs 3 / 547; fd 5 / 572. Every candidate below has a larger patch than all four, except tengo (754, same order) and wasmi (603).
4. Test-run seconds are the `seconds` fields of the scorer's `base` and `new` runs on the reference solution (`runs/dry-sel-<id>/d/<id>.score.json`; the run dirs were deleted afterwards). They include compiling. All are far below 10 minutes; the slowest is oxvg at 210 s with the image already pulled.
5. No task file has difficulty metadata. `task.toml` has only category, language, repository and base commit (checked on `expr-try-catch-errors`); `manifest.json` carries id-label provenance only.
6. The scorer parses `go test -json`, `pytest -rA`, cargo, jest `--json`, vitest verbose and mocha tap (`experiments/deepswe/score_task.py`). Runners called through a package script or a pnpm filter (koota, vitest-duration-sharding, quill, happy-dom's `npm run test`) are not covered, so I avoided them. Two JS/TS tasks I did try (valibot, happy-dom-abort) both gave `parsed=0`.
7. Sidecar memory: `docker stats` sampled every 3 s during the dry runs (container limit 3 GB, `--sidecar-memory 3g`). Peaks seen: scc 2.99 GB (at the limit), oxvg 2.79 GB, wasmi 0.85 GB, everything else 0.5 GB or less. The sampler missed the ytt dry run (log lost). Hub idle use: below 20 MB. Docker has 15.6 GiB and 8 CPUs here (`docker info`). A sample every 3 s misses short peaks, and agents compile more than the reference run does, so these are lower bounds.
8. The first attempt failed on `toomanyrequests: Rate exceeded` from public.ecr.aws for etree. The retry after a pause worked. Images are now local (about 2.6-2.9 GB each; 12 new images pulled, left in place for the screening run).

## Valid candidates (12)

Columns: patch = files / changed lines of the reference solution; f2p = fail-to-pass tests in `refs/<id>.json` (`new_f2p`); base = tests that must stay green; seconds = scorer `base` + `new` run on the reference.

| id | lang | patch | f2p | base tests | dry run | test-run s (base + new) | why chosen |
|---|---|---|---|---|---|---|---|
| etree-xml-diff-patch | go | 8 / 1453 | 52 | 15 | PASS (1.0, binary 1; base 0) | 1.3 + 2.8 | largest patch of the whole set; new diff/patch/merge API from a long spec (458 words) |
| ytt-jsonpath-query-api | go | 5 / 1030 | 103 | 1 | PASS | 4.1 + 2.5 | JSONPath engine in a big repo, 103 tests |
| go-git-worktree-merge-conflicts | go | 3 / 977 | 17 | 2 | PASS | 3.9 + 4.0 | merge conflict logic in one big file, a large and old repo (3113 commits) |
| dasel-html-document-format | go | 4 / 959 | 146 | 1012 | PASS | 2.4 + 1.5 | a whole new document format, 146 tests |
| scc-bounded-memory-spilling | go | 12 / 880 | 31 | 283 | PASS | 8.9 + 20.5 | cross-cutting change in 12 files, memory-bound design |
| scriggo-method-declarations | go | 18 / 831 | 48 | 1045 | PASS | 23.3 + 0.7 | language feature across parser, type checker and emitter (18 files) |
| participle-grammar-conflict-analysis | go | 14 / 648 | 89 | 152 | PASS | 7.6 + 8.3 | static analysis of grammars in 14 files |
| tengo-destructuring-bindings | go | 6 / 754 | 91 | 123 | PASS | 8.0 + 1.6 | parser, compiler and VM change; smallest margin over the calibration tasks |
| returns-validated-error-accumulation | python | 7 / 774 | 159 | 61 | PASS | 0.7 + 3.3 | new Validated container, 159 tests, 17 test files |
| fastapi-implicit-head-options | python | 4 / 899 | 43 | 3131 | PASS | 43.5 + 1.2 | routing change that can break many existing tests (3131 base) |
| oxvg-structural-selector-preservation | rust | 3 / 743 | 6 | 58 | PASS | 113.0 + 97.3 | Rust, release build; only 6 f2p tests, so one miss costs a lot |
| wasmi-trap-coredumps | rust | 11 / 603 | 22 | 58 | PASS | 7.4 + 8.8 | Rust, 11 files in an interpreter |

Anti-leak check: `rev-list --all` equals `rev-list HEAD` for every task (210, 3113, 804, 1564, 5005, 456, 344, 2219, 6914, 480, 1364 commits; ytt 1284), no unreachable objects, refs or remotes.

## Proposed batches of 4

Grouped so that each batch holds at most one memory-heavy sidecar and one slow Rust build, and mixes languages:

- **Batch 1:** oxvg-structural-selector-preservation (rust, 2.8 GB), etree-xml-diff-patch, tengo-destructuring-bindings, returns-validated-error-accumulation
- **Batch 2:** scc-bounded-memory-spilling (3 GB), go-git-worktree-merge-conflicts, dasel-html-document-format, wasmi-trap-coredumps
- **Batch 3:** ytt-jsonpath-query-api, scriggo-method-declarations, participle-grammar-conflict-analysis, fastapi-implicit-head-options

Is 4 at a time safe? With 15.6 GiB, four sidecars at 3 GB are 12 GB at worst, plus the hubs (tiny when idle, but each runs a Node process) and the OS. The calibration ran 4 at once the same way. Only scc and oxvg ever came near their 3 GB limit, and a container over its limit is OOM-killed by Docker, which would show up as a failed command, not a wrong score. Batches 1 and 2 each hold one such sidecar, so the expected total is well below 12 GB; the realistic risk is two heavy builds in the same batch, which this grouping avoids. I did not run four at once, so this is reasoning from per-sidecar peaks, not a measurement.

## Dropped

| id | lang | reason |
|---|---|---|
| dateutil-rfc5545-timezone-interop | python | the reference solution scores 1.0 partial but binary 0: 41 base-mode tests fail even with the solution applied (exit 1), so the official reward is unreachable here. Ref file written (`refs/dateutil-rfc5545-timezone-interop.json`), do not use. The 41 failures were not investigated |
| narwhals-rolling-window-suite | python | pytest segfaults (exit 139, numpy) in both base and new modes, `parsed=0`. Probably an emulation problem of the amd64 image; not investigated |
| valibot-recursive-schema-composition | typescript | `parsed=0`: vitest output not parsed by the scorer |
| happy-dom-abort-pending-body-reads | typescript | `parsed=0`, same reason |

Not tried: kgateway (huge repo), kcp-go (timing-based tests), pebble (300 s test timeouts), vitest-duration-sharding (builds, 105 test files), all pnpm-filter monorepo tasks (koota, quill, effect). The other 4 Rust images (besides fd, oxvg, wasmi) were not examined; oxvg and wasmi pass dry, so those two are verified.

## Open doubts

- Size is a weak predictor: expr is only 446 lines and C1T got 0.34-0.999 on it; the near-ceiling tasks are of similar size. Some of these large patches may still be easy for one agent (for example dasel, a well-specified new format with 146 tests).
- oxvg has 6 f2p tests and 113 s of compile per test run; one C1T run may spend a lot of its minutes just waiting for builds.
- The anti-leak and scorer checks were run once each; fast tasks (etree, returns) have very small base-test sets, so partial credit there is nearly all from the new tests.
