# DeepSWE batch driver: build and validation (2026-10-04)

Model output (Claude subagent). Verified by hand in this session: all numbers below come from the logs of the runs named here; the smoke runs are single runs and say nothing about difficulty or about arms.

## What was built (all under `experiments/deepswe/`, `src/`, `profiles/`, swarmtest and deep-swe untouched)

- `run-batch.mjs`: one batch, one arm (`swarm`, `solo`, `isolated`), `--dry` for the no-model check. Hub container (`murmur:latest`, `src/` bind-mounted read-only so the run uses the working tree) with `/work` as murmur's workspace (`runSwarm({workspace: "/work"})`, as the round-5B driver did). One sidecar per task from the task's own image (`--network none --cpus 2 --memory 3g --init`, amd64), repo on a named volume at `/app`, mounted in the hub at `/work/<task>`. One queue volume per task. All containers and volumes carry the label `dswe=<batch>`; cleanup runs in `finally` and on SIGINT/SIGTERM (verified: zero containers and volumes left after every run).
- `run` (hub) and `execd.sh` (sidecar PID 1): `run <task> <cmd...>`. Exit code and streamed output; per-command timeout (`--cmd-timeout`, default 1200 s, exit 124); each command is its own process group and the whole group is killed on timeout, on `run` receiving TERM/INT/HUP, and when `run` dies without a trap (SIGKILL, as a tool timeout does) because the heartbeat file goes stale for 20 s. Concurrent calls use unique ids. Before grading the sidecar is restarted, which kills stray processes (the volume stays).
- `score_task.py`: the earlier scorer, restructured as a module, plus jest (`--json`), vitest (`--reporter=verbose`) and mocha (`--reporter=tap`) parsers injected by `sed` into the `test.sh` that `test.patch` adds, with fail-fast flags stripped. `refs/<task>.json` holds the reference (`new_f2p`, base tests passing with the solution). A reference with an empty f2p set is never written (that is what a parser that sees nothing produces).
- Goal text written by the driver: lists each project with `/work/_tasks/<id>.md` (a copy of `instruction.md`, mounted read-only, outside the repos) and `/work/<id>`; explains `run <project> <command>`, no network, the timeout, 2 CPUs per environment. Nothing on tests or grading. `check` is `true`. Same text for all arms.
- Output: `runs/<batch>/<unit>/` (ignored: `murmur/run/{events.jsonl,result.json,<agent>.messages.json}`, `murmur.log`, `hub.log`, `<task>.diff` against the starting tree, `<task>.score.json`, verifier logs) and `results/<batch>.json` (arm, profile and its hash, agents, tasks, cap, timeout, tokens, minutes, end reason, per task score/new_frac/base_frac/binary/parsed/leak counts, code commit and whether `src` was dirty). `.gitignore` got rules for the new tracked files (`experiments/deepswe/*.mjs|py|sh|run|README.md`, `refs/`, `results/`; `runs/` stays ignored).

## Anti-leak (verified, per task, the batch aborts if any item fails)

Inside each sidecar before any agent starts: HEAD must equal the base commit; detach HEAD, delete every ref, remove remotes, packed-refs, FETCH_HEAD, ORIG_HEAD, expire reflogs, `git gc --prune=now`. Checks: `rev-list --all --count` equals `rev-list HEAD --count`; `git fsck --unreachable` lists nothing; zero refs and remotes; base commit present; no `/solution`, `/tests`, `/app/test.sh`. Measured: anko 1119 -> 1105 commits (all == HEAD), ts-pattern 1042 == 1042, true-myth 2458 == 2458, unreachable 0, refs 0, remotes 0. The official `test.sh` works on the stripped repos (the solution runs below score 1.0 with binary 1, and the smoke runs scored through the same path). The hub sees only task volumes, queue volumes, instruction copies, `src`, the profile and a filtered OAuth copy; a `find` in the hub for `test.patch`, `solution.patch`, `instruction.md` outside `/work/_tasks` returned nothing. Hidden tests are copied into the sidecar only after murmur ends.

## Validation without a model (`--dry`)

| Task | Language | Runner parsed | f2p / base tests in ref | Untouched base score | Solution score (binary) |
|---|---|---|---|---|---|
| anko-default-function-arguments | Go | go test -json | 2 / 119 | 0.0 | 1.0 (1) |
| ts-pattern-match-each | TypeScript | jest --json | 85 / 6 | 0.0 | 1.0 (1) |
| true-myth-iterable-collection-combinators | TypeScript | vitest verbose | 96 / 561 | 0.0 | 1.0 (1) |

Plumbing checks (all passed, on all three tasks or on the first): output and exit code 3 returned; a file written by the hub is visible in the sidecar; no network in the sidecar; a timeout (6 s limit) returned 124 after 7.5-8.4 s and left no child processes; `run` killed with SIGKILL: the remote command was gone within 30 s; 12 concurrent calls each got their own output and rc 0.

Bugs found and fixed on the way: the vitest reporter was stripped by the mocha injection line (ordering); vitest's typecheck pass prints the same test names as passing while the runtime run fails, so a failure in either now wins (without that the untouched base looked like 96 new tests already passing and f2p was 0); my own `pgrep -c sleep` check counted execd's `sleep 0.2`.

The mocha parser was unit-tested only on a synthetic TAP snippet (pass, fail, skip), not on a real task: the limit was two more image pulls. Runners called through a package script (`pnpm -F core test`, `npm test`) are not covered by the `sed` injection; for those tasks `parsed` is 0 and only `binary` counts. Images pulled: ts-pattern (kh724..., 2.78 GB shown), true-myth (kh74r..., 2.88 GB shown); listed sizes include shared layers.

Docker VM RAM was 3.8 GB (8 CPUs); two sidecars were up at the same time, graded one at a time (`--grade-parallel 1`, default), with no memory problems on these small tasks. A batch of 4 with real compiles needs the 16 GB the user is raising.

## Smoke runs with the model (quota was available; hello probe 8k tokens, deleted)

| Batch | Arm / profile | Cap, clock | Tokens | End | `run` calls | Score (new_frac, base_frac, binary) |
|---|---|---|---|---|---|---|
| smoke-solo | solo, `solo-clock-tokens` (one agent with the clock) | 1.0 M, 15 min | 193,000 | all_done after 2.2 min | 4 of 21 tool calls | 0.0 (0.0, 1.0, 0) |
| smoke-swarm | swarm, `n12-stagger-tokens` (agents join one after another, a board), 3 agents | 1.5 M, 15 min | 1,519,984 | budget after 4.5 min | 17 (finch 5, robin 4, wren 8), 19 posts | 0.0 (0.0, 0.84, 0) |

Total spend about 1.72 M tokens (limit 3 M). The solo agent called `run` to look for `goyacc` (the repo's parser is generated; the sidecar has no network), found none, and called done with no edits (its diff holds only files missing from the image's work tree, which is why diffs are taken against the starting tree). The swarm edited `ast/`, parser and vm files (17 KB diff) but ran out of tokens, and regressed 17 base tests. Traces are complete: `events.jsonl`, `result.json`, one `<agent>.messages.json` per agent. Both runs are one sample on a task with only 2 new tests; nothing follows about the arms.

## Known gaps and open issues

1. JS/TS tasks whose `test.sh` calls a package script get `parsed = 0` (binary only). The mocha path has not run on a real task.
2. Tasks that need generated code (anko needs `goyacc`) may be unsolvable without network; the earlier feasibility study did not check this. Worth looking at before choosing batch tasks.
3. Only the solution and the untouched base were used to build references; test flakiness is not measured (one run each). The solution score of 1.0 is partly circular (the reference comes from the same run), the independent evidence is binary 1 from the official exit codes.
4. Murmur's `check` is `true`; the final check inside murmur is therefore meaningless and `status` is always "passed".
5. The hub has internet and the OAuth credentials (a filtered `auth.json` copy readable by agents), as in the 5B driver.
6. CPU: sidecars are capped at 2 CPUs each, but 12 agents sharing one task's sidecar will queue on those 2 CPUs. Emulated amd64 makes builds slower than in the official setup.
7. `isolated` arm is implemented (one hub plus sidecar per task, cap/M each, in parallel) but not run.
8. The batch clock covers murmur only; grading time (minutes per task) comes after it.

## Calibration command lines (not run)

```
node experiments/deepswe/run-batch.mjs --tasks <id> --arm solo --tokens 2000000 --minutes 90 --id cal-<id>-r0
node experiments/deepswe/run-batch.mjs --tasks a,b,c,d --arm solo --tokens 8000000 --minutes 120
node experiments/deepswe/run-batch.mjs --tasks a,b,c,d --arm swarm --profile profiles/n12-stagger-tokens.json --agents 4 --tokens 8000000 --minutes 120
node experiments/deepswe/run-batch.mjs --tasks a,b,c,d --arm isolated --tokens 8000000 --minutes 120
```
(`--dry --tasks ...` first for every new task: it creates `refs/<task>.json`.)
