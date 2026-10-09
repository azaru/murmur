Model output (subagent), 2026-10-09. No agent or model was run.

> Checked by hand in the main session: the fail-to-pass and base test counts of tengo-callable (23 / 123), dynamodb-toolbox (37 / 1267) and helm (51 / 6) in `experiments/deepswe/refs/` match the table; the dry runs were not re-run.

# DeepSWE candidates, third selection (harder tasks for the recalibrated five-task batch)

Difficulty is a guess from the shape of the reference patch only; nothing here is calibrated against a single agent or a swarm. Numbers below come from the dry-run logs and patches (checked by the subagent, not re-verified by hand in the main session).

## Key claims

1. 10 tasks pass the driver's dry mode; 3 attempted tasks failed (see Failures). Proof: `nice -n 15 node experiments/deepswe/run-batch.mjs --tasks <id> --dry --id dry-sel2-<id>`, one task at a time, exit 0 and every line `PASS` (reference 1.0 with binary 1, untouched base 0, anti-leak, no network in the sidecar, timeout kill, 12 concurrent calls). Refs written (untracked, kept): `experiments/deepswe/refs/<id>.json` for the 10 valid ids. The ref of the failed arktype task was removed.
2. Pool: 117 entries. After removing the 31 ids in `refs/` and the earlier rejects (Rust: boa, pest; Deno: cliffy; `pnpm`/filter wrappers: koota, quill, drizzle, kysely, happy-dom, clack, vitest-duration-sharding, optique; giants: kgateway, pebble, kcp-go, wazero, numba, prometheus; dateutil, narwhals, valibot), I looked at the remaining ones by patch shape and kept those that change a runtime, a type system, a schema/serialisation pipeline or a multi-layer library. Few language-implementation tasks are left in the pool: the first two selections took most of them. Only tengo-callable-instance-isolation is a VM task; the rest are "several layers of a library" tasks.
3. Tasks not tried: other candidates in the pool are formatters/linters or small (<=4 files): go-critic-doc-link-checker, actionlint-action-pinning-lint, vulture-persistent-analysis-cache, ink-grid-box-layout, mashumaro-flattened-dataclass-fields, geo-shapeindex-serialization, obsidian-linter-*, bandit-* (second bandit task), httpx-*; helm-unified-manifest-stream (same repo as helm-array-merge-strategies), dynamodb-toolbox-conditional-attribute-requirements (same repo as the lazy one), kombu-single-active-consumer-priority (same repo), koota-*, and the others listed above.
4. One task per repository among the picks. tengo-callable-instance-isolation is the same repository as tengo-destructuring-bindings, already in `refs/` (the pool has no other VM task; say so when choosing batches).
5. Test seconds are the scorer's `base` / `new` runs on the reference. Peak sidecar memory is the maximum of `docker stats --no-stream` samples every ~3 s over the dry run (per container, the limit is 3 GB), so it is a sampled lower bound for agent runs and includes the dry run's own heavy steps. kea (2,876 MiB) and python-statemachine (2,401 MiB) peaked close to the 3 GB container limit; see doubts.
6. Anti-leak passed for all 10 (`rev-list --all` equals `HEAD`, no unreachable objects, refs or remotes).

## Valid candidates, ranked (10)

patch = files / changed lines (`+`/`-` excluding headers); f2p = fail-to-pass tests in the ref; base = tests that must stay green; seconds = scorer base / new runs on the reference; mem = peak sidecar MiB.

| # | id | lang | patch | layers touched | f2p | base | dry | test s (base / new) | mem MiB | why it should land mid-band for a 12-agent swarm |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | tengo-callable-instance-isolation | go | 4 / 666 | compiled-function objects, VM call path, script/compiled clone, module exports (`call.go`, `objects.go`, `script.go`, `vm.go`) | 23 | 123 | PASS | 7.5 / 1.6 | 1166 | The only VM/runtime task left. Go-side calls of script closures must match in-script semantics (globals, captures, variadics, recursion, error format) and survive cloning between instances; hidden requirements dominate (174-word spec). Its sibling tengo-destructuring-bindings scored 0.75 for the swarm, so this one is plausibly lower. Same repo as a task in `refs/`. |
| 2 | dynamodb-toolbox-lazy-recursive-schemas | ts (vitest) | 28 / 540 | schema type, lazy attribute, DTO, fromDTO, finder, format, parse, update params, JSON-schema and zod schemers, TS types | 37 | 1267 | PASS | 44.9 / 6.5 | 690 | 28 files across 19 directories: a new recursive attribute kind has to be handled by every schema action (parse, format, DTO, update, schemers); missing any one fails a group of tests. Closest to the "must reach every layer" shape. |
| 3 | python-statemachine-state-data-scoping | python | 17 / 495 | callbacks, engines (sync and async), event data, factory, diagram model/extract/dot/mermaid renderers, SCXML parser | 72 | 1362 | PASS | 26.7 / 1.1 | 2401 | 17 files in 6 directories; engine semantics (async and sync) plus diagram rendering and SCXML import; 72 f2p, so partial credit is granular. |
| 4 | kea-atomic-signal-selectors | ts (jest, tsc) | 8 / 685 | core reducers/selectors, kea atomic/context/kea, React hooks, types | 12 | 153 | PASS | 34.8 / 2.6 | 2876 | A reactive state library: new primitive across core, context lifecycle, React hooks and types; long spec (436 words) with many interacting rules; only 12 f2p. |
| 5 | helm-array-merge-strategies | go | 10 / 578 | chart annotations, value coalescing, install/upgrade actions, v2 and v3 lint rules, CLI flags | 51 | 6 | PASS | 11.3 / 12.7 | 793 | Changes coalescing semantics (null deletion, key-merge, nil preservation) and has to thread through actions, CLI and two lint rule sets; 51 f2p but only 6 base tests. Dry run took 472 s wall (cold build). |
| 6 | adaptix-name-mapping-aliases | python | 8 / 510 | facade provider/retort, crown definitions, loader generation, loader provider, name layout base/component | 44 | 2690 | PASS | 15.7 / 10.2 | 1768 | Code-generating (de)serialisation library; a name-layout change has to reach the loader generator and the facade; 128-word spec, 44 f2p. |
| 7 | kombu-virtual-queue-dead-lettering | python | 6 / 652 | broker state, Queue/entity, exchange routing, virtual transport base, filesystem and memory transports | 76 | 1412 | PASS | 32.5 / 0.8 | 738 | AMQP-like semantics (dead letter exchange, per-message/per-queue TTL, max-length overflow) across the virtual transport and two concrete transports; 490-word spec of exact rules, 76 f2p. |
| 8 | gql-incremental-graphql-delivery | python | 7 / 543 | new `incremental.py`, client, DSL, aiohttp transport, websockets protocol, transport base | 17 | 795 | PASS | 21.2 / 0.8 | 432 | New protocol feature (`@defer`/`@stream` incremental delivery) crossing the client, DSL and two transports; 17 f2p. |
| 9 | superjson-error-stack-serialization | ts (vitest) | 9 / 618 | error registry, options, sanitizer, stack, transformer, types, util (all under `src/`) | 80 | 81 | PASS | 4.5 / 2.9 | 1329 | Largest f2p count; 500-word spec of many options (sanitisation, stack handling); but all files are in one directory and the base suite is small, so it may saturate. |
| 10 | task-task-graph-export | go | 4 / 642 | `graph.go`, `executor.go`, CLI flags, `cmd/task` | 20 | 16 | PASS | 5.7 / 2.9 | 482 | `--graph` with three output formats (json, dot, text) and exact JSON keys; includes/aliases/wildcards resolution. Spec-following like the formatter tasks, so likely the easiest of the ten. |

Languages: Go 3 (tengo, helm, task), Python 4 (statemachine, adaptix, kombu, gql), TS 3 (dynamodb-toolbox, kea, superjson).

## Failures

- arktype-json-schema-refs-dependencies (ts): dry mode FAIL: "solution scores 1.0 with binary 1; untouched base scores ~0 (base=0, solution=1, parsed=1704)". The reference run's base portion exited 1 (1,677 passed, 0 failed, so a non-test step such as type checking fails), giving binary 0. Not usable with the current scorer. Its ref file was removed.
- textual-kitty-key-phases (python): dry mode FAIL, base=null, solution=null, parsed=0 (no test output parsed; the scorer sees nothing).
- opa-rego-rule-profiling (go): the anti-leak strip failed ("unable to read 1949ea15...", a missing object in the image's repository). Infrastructure failure, not retried.
- A first attempt of arktype, gql and helm hit `toomanyrequests: Rate exceeded` from public.ecr.aws; all three were retried a few minutes later (gql and helm passed, arktype failed as above).

## Open doubts

- No difficulty evidence exists; the ranking is a shape-based guess. The pool no longer has many "language/VM" tasks, so this set is weaker on the criterion the screen showed (tengo is the only true VM task). Expect some to saturate (superjson, task-graph, gql, perhaps adaptix).
- kea (2,876 MiB) and python-statemachine (2,401 MiB) peaked close to the 3 GB container limit in the dry run; agents that build and test more could be OOM-killed. Raise the sidecar memory (the screen uses `--sidecar-memory 5g`) or deprioritise them.
- helm-array-merge-strategies took 472 s wall for the dry run (go build of a large repo); its scorer runs are fast (11-13 s) once built, but the first agent test run in a cold sidecar may be slow.
- tengo-callable-instance-isolation shares a repository with tengo-destructuring-bindings (already in `refs/`); do not put both in the same batch if the repo-uniqueness rule holds.
- The `base` numbers for helm (6) and task-graph (16) are small: the "must not break" part carries little weight; scores will mostly reflect f2p tests.
- Peak memory figures are sampled lower bounds. Dry-run directories `experiments/deepswe/runs/dry-sel2-*` were deleted.
