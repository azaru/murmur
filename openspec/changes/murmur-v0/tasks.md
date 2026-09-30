## 1. Hito 1 — hello world (1 agent)

- [x] 1.1 Add `tsconfig.json` (noEmit, strict, NodeNext) and a `murmur` npm script (`tsx src/cli.ts`); verify `npx tsc --noEmit` runs on an empty `src/` stub without config errors
- [x] 1.2 Write `src/cli.ts`: parse `run <task.json> [--unsafe]`, sandbox guard, task-file validation (swarm-run "Task file" rules), run id and `runs/<id>` path, call `runSwarm`, exit 0/1 from `result.status`; verify that running any task file without the guard exits non-zero and creates no `runs/` entry, and that a task with no budget is rejected
- [x] 1.3 Write `src/board.ts` with the per-agent state and only the `done(reason)` tool for now; verify with `tsc --noEmit`
- [x] 1.4 Write `src/swarm.ts`: run dir + workspace copy, `ModelRuntime` + model lookup, sessions (tools allowlist, in-memory session manager, resource isolation via `DefaultResourceLoader`), briefing as first prompt, `events.jsonl` (run_start, tool, usage, done, error, abort, check, run_end), budget from `getSessionStats` on `message_end`, timeout + `abort()`, end on all-done/idle, check with 10-min cap and bounded output, `result.json`; verify `tsc --noEmit` passes
- [x] 1.5 Add `examples/hello.json` (1 agent, `openai-codex`/`gpt-6-luna`/`medium`, "create hello.txt containing hi", check `test "$(cat hello.txt)" = hi`, small token budget, 5-min timeout) and run it with `--unsafe`; verify `result.json` has `status: "passed"`, reason `all_done`, non-zero tokens, and `events.jsonl` shows the write tool call, usage lines and `done`
- [x] 1.6 Add the `Dockerfile` (node + git + python3, `MURMUR_SANDBOX=1`, entry `npx tsx src/cli.ts`); verify `docker build` succeeds and the hello task passes inside the container with the mounts from design.md (skip and report if Docker is unavailable)
- [x] 1.7 Commit hito 1 in small English commits and stop for review

## 2. Hito 2 — 3 agents talking

- [x] 2.1 Add `post`, `inbox`, `team`, `budget`, `claim`, `release` to `src/board.ts` per the coordination-board spec, registered only when `messaging` is true; verify `tsc --noEmit` passes and that `run_start` lists only `done` when the hello example is re-run with `messaging: false` (all seven tools in the 2.4 run)
- [x] 2.2 Add the single steer on new messages (reset by `inbox`) and the idle-agent wake + re-prompt loop with `quiescent` end detection in `src/swarm.ts`; log `post`, `steer` and `wake` events; verify `tsc --noEmit` passes
- [x] 2.3 Extend the briefing with teammates and short coordination-tool instructions (omitted when `messaging: false`); verify by reading the briefing logged in `run_start` for both messaging settings
- [x] 2.4 Add `examples/trio/` (a small Python project with three missing modules and a provided unittest file) and `examples/trio.json` (3 agents, `messaging: true`, check `python3 -m unittest -q`); run it and verify `events.jsonl` shows posts from at least two agents, `inbox` calls that read them, and a check result in `result.json`
- [x] 2.5 Write `README.md` (what it is, how to run locally/Docker, design ideas in ~10 lines, OAuth cost-0 caveat); verify `wc -l src/*.ts` totals under ~600
- [x] 2.6 Commit hito 2 in small English commits and stop for review

## 3. Hito 3 — swarmtest adapter

- [ ] 3.1 Make `runSwarm` accept `{ workspace, authPath, checkTimeoutMs }` options (workspace used in place, no copy; auth passed to `ModelRuntime.create`; check cap overridable); verify the hello example still passes through the CLI
- [ ] 3.2 Write `../swarmtest/adapters/murmur.mjs` following `adapters/pi.mjs` / `arcswarm.mjs`: request→task mapping from design.md, `--check` preflight printing `{"status":"ready"}`, status/usage mapping per the swarmtest-adapter spec, swarm timeout reduced by a margin so the check finishes before swarmtest's deadline; verify `--check` returns ready for the chosen model
- [ ] 3.3 Register `murmur` in `../swarmtest` (`SYSTEMS`/projects, `token_budget == 0` allowlist, tsx loader in `adapter_command`, `pi_auth_path` passing); verify swarmtest's own tests still pass
- [ ] 3.4 Run one swarmtest task with murmur (small budget); verify an adapter result is written, the grader runs, and no credential content appears in the workspace, trace or result
- [ ] 3.5 Commit (murmur and swarmtest repos separately) and stop for review
