## Context

Greenfield repo: `package.json` with `@earendil-works/pi-coding-agent@0.99.1`, `typebox`, `tsx`, `typescript`; empty `src/`. Motivation and scope: see proposal.md. Behavior contracts: see `specs/`.

Verified in the installed SDK (`dist/**/*.d.ts`):
- `createAgentSession({ cwd, modelRuntime, model, thinkingLevel, tools, customTools, sessionManager, resourceLoader })`; `tools` is an allowlist ("only the listed tool names are enabled").
- `ModelRuntime.create({ authPath?, modelsPath? })`, `runtime.getModel(provider, id)`.
- `session.prompt(text)`, `session.steer(text)`, `session.isStreaming`, `session.abort()`, `session.subscribe(listener)`, `session.getSessionStats()` → `{ tokens.total, cost, … }` (cumulative per session), `session.dispose()`.
- Events: `message_end { message }`, `tool_execution_start { toolName, args }`.
- `DefaultResourceLoader` accepts `noExtensions`, `noSkills`, `noPromptTemplates`, `noThemes`, `noContextFiles`.
- Pi honours `PI_CODING_AGENT_DIR` for its agent dir (auth.json, models.json, settings.json).

`../swarmtest` runs adapters as `node [--import <project>/node_modules/tsx/dist/loader.mjs] adapters/<system>.mjs <request.json> <result.json>` with cwd = fixture workspace, plus a `--check …` preflight that must print `{"status":"ready"}`. Systems are hard-coded in `swarmtest/config.py` (`SYSTEMS`) and the Pi auth copy is only passed to system `pi` (`runner.py`).

## Goals / Non-Goals

**Goals:**
- Stay under ~600 lines of TypeScript in this repo; three source files.
- One code path for the CLI and the swarmtest adapter.
- Everything observable from `events.jsonl` without a UI.

**Non-Goals:**
- Tests beyond running the example tasks (the hitos are the tests).
- Crash recovery, resuming runs, retries (Pi's own provider retry settings stay as they are).
- Network isolation inside the container (agents need the model API).

## Decisions

### File structure (the thing to approve first)

```
src/cli.ts        ~60   argv, sandbox guard, read + validate task.json, call runSwarm, exit code
src/swarm.ts     ~260   runSwarm(task, opts): run dir, workspace copy, model runtime, sessions,
                        briefing, per-agent loop, budget, timeout, end detection, check,
                        events.jsonl, result.json
src/board.ts     ~140   Board (messages, read cursors, claims, states, done) + coordination tools
                        built with defineTool + Type
examples/hello.json                     hito 1
examples/trio.json + examples/trio/     hito 2 (small multi-file project with its tests)
Dockerfile        ~15   node + git + python3, runs the CLI
README.md               what / how to run / design ideas in 10 lines
tsconfig.json           only for `tsc --noEmit`
../swarmtest/adapters/murmur.mjs  ~150  hito 3, lives in the swarmtest repo
```

Invocation: `npx tsx src/cli.ts run task.json [--unsafe]`, aliased as `npm run murmur -- run …`. No `bin`/build step. *Alternative:* a compiled `bin` — rejected, adds a build for no benefit.

### `runSwarm(task, opts)` is the single entry point
`opts = { runDir, workspace?, authPath?, checkTimeoutMs? }`. The CLI passes `runDir = runs/<id>` and lets `workspace` default to `<runDir>/workspace` (copied from `project` with `fs.cp`). The adapter passes swarmtest's workspace (agents edit it in place, which the grader inspects) and the campaign's auth copy. These options are not exposed in `task.json`. *Alternative:* adapter spawns the CLI and copies the workspace back — rejected: deletions don't propagate and credentials would need an agent-dir shuffle.

### Sessions
One `ModelRuntime` for the run; per agent `createAgentSession` with `cwd = workspace`, `sessionManager: SessionManager.inMemory(workspace)`, `tools: ["read","bash","edit","write", …coordinationToolNames]` (the allowlist also shuts out tools the user's global settings/extensions would add), and `customTools` from `board.ts`. Names: `wren, finch, robin, lark, swift, tern, kite, heron, crane, linnet, plover, dunlin` → `agents` is limited to 1–12 (validation error above that).

Resource isolation (approved): pass a `DefaultResourceLoader` with `noExtensions, noSkills, noPromptTemplates, noThemes, noContextFiles`, so nothing from `~/.pi/agent/` (extensions, skills, global `AGENTS.md`) or from an `AGENTS.md` inside the project reaches the agents; the briefing is the only instruction they get.

### Board and loop
- `Board` keeps `messages[]`, a read cursor per agent, `claims: Map<path, agent>`, and per agent `{ state: working|idle|done, doneReason, nudged }`.
- `post` → append, log, then for each other non-done agent: if `session.isStreaming && !nudged` → `nudged = true; steer("You have new messages; call inbox.")`; else wake its waiter. `inbox` resets `nudged`.
- Per-agent loop: `prompt(briefing)`; then while not done and swarm not ended: mark idle → evaluate end → await "has unread or swarm ended" → mark working → `prompt("New messages on the board. Call inbox, then continue.")`.
- End evaluation runs whenever an agent goes idle/done: all done → `all_done`; all done-or-idle-with-no-unread → `quiescent`. With `messaging: false` nobody posts, so the swarm ends when every turn has ended.
- A `session.prompt` that throws is logged as an `error` event and the agent goes idle (it may be woken again). Only harness-level exceptions end the run with `error`.
- `done` marks the agent done and releases its claims; the current turn is allowed to finish naturally.

### Budget, timeout, abort
Subscribe to each session; on `message_end` log usage and recompute totals as the sum of `getSessionStats()` over all sessions (session stats are cumulative, so no double counting). Exceeding `budgetUsd` or `budgetTokens` → `end("budget")`. A `setTimeout(timeoutMinutes)` → `end("timeout")`. `end` sets the reason once, resolves all waiters, calls `abort()` on every session (only for budget/timeout/error), awaits all agent loops, then disposes sessions.

### Check and result
`sh -c <check>` in the workspace via `spawn`, fixed 10-minute cap (assumption: not in the v0 list, but a hanging check must not hang the run), keeping the last 4,000 chars of combined output. `result.json` fields per the `swarm-run` spec; `status` is `passed` iff exit code 0.

### Trace
`events.jsonl` appended synchronously (`appendFileSync`), one line per event: `run_start` (task, and per agent its tool names and briefing), `tool` (agent, name, args), `usage` (agent, input/output/total tokens, cost), `post`, `steer`, `wake`, `done`, `error`, `abort`, `check`, `run_end`. Assistant text is not logged in v0 (not in the list; add later if traces prove too thin).

### Run id
`YYYYMMDD-HHMMSS-<4 hex>` — sortable and unique enough without state.

### Sandbox
Guard in `cli.ts` only (the adapter is trusted-local, as the other swarmtest adapters are). Docker usage:
```
docker build -t murmur .
docker run --rm -e MURMUR_SANDBOX=1 \
  -v "$PWD/runs:/murmur/runs" -v "$PWD/examples:/murmur/examples:ro" \
  -v "$HOME/.murmur-pi:/root/.pi/agent" murmur run examples/hello.json
```
`~/.murmur-pi` is a user-made copy of `auth.json` (+ `models.json` if needed); writable because Pi refreshes OAuth tokens. The image sets `MURMUR_SANDBOX=1` itself.

### swarmtest adapter (hito 3)
`murmur.mjs` is loaded with murmur's tsx loader, imports `src/swarm.ts` directly, maps `prompt→goal`, `acceptance_command→check` (and `done` = "the acceptance command passes and the task prompt is satisfied"), `agents`, `provider`, `model`, `reasoning→thinking`, `token_budget→budgetTokens` (0 → no token limit; the "at least one budget" rule is task-file validation in `cli.ts`, so `runSwarm` itself accepts no budget), `timeout_seconds→timeoutMinutes`, `runDir = state_dir/murmur`. It implements `--check` (resolve model, print `{"status":"ready"}`). swarmtest needs small edits: add `murmur` to `SYSTEMS`/projects and to the `token_budget == 0` allowlist in `config.py`, use the tsx loader for it in `adapter_command`, and pass `pi_auth_path` to it as it does for `pi`.

Deadline: swarmtest kills the adapter at `timeout_seconds + 30` and expects confirmed cleanup, while murmur runs the check *after* the swarm timeout. The adapter therefore reserves time for the check: it sets `timeoutMinutes` below `timeout_seconds` by a margin and passes a matching check cap through `runSwarm` opts (`checkTimeoutMs`, default 10 min for the CLI). The check result doubles as the adapter's public acceptance check, as in `pi.mjs`.

## Risks / Trade-offs

- [Steer arrives mid-tool and the model ignores it] → the idle re-prompt still delivers the messages after the turn.
- [Agents never call `done` and never go idle] → timeout and budget bound the run.
- [Quiescence too early: an agent ends its turn while a teammate is about to post] → a later post can't wake anyone once the swarm has ended; acceptable for v0 ("if a run fails, repeat it"), visible in the trace as `quiescent`.
- [Budget overshoot: in-flight calls finish after the limit] → soft limit, overshoot recorded in `result.json`.
- [Cost 0 with OAuth] → token budget is supported; the adapter reports cost exactly as Pi does, and the README notes the caveat.
- [`--unsafe` on a dev machine] → agents have full bash in the workspace and beyond; the flag name and README say so.
- [SDK drift from 0.99.1] → pinned by package-lock; API surface used is small.

## Open Questions

(Live hito runs use `openai-codex` / `gpt-6-luna` / thinking `medium`, as in swarmtest's benchmark; it authenticates via OAuth.)


- Exact swarmtest benchmark config for murmur (agents counts, budget) — decide at hito 3.
