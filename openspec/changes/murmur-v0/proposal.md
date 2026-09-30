## Why

Three earlier swarms (`../swarm`, `../miniswarm`, `../arcswarm`) grew to 4,000–9,000 lines of UI, daemons, recoverable journals, custom sandboxes and structured protocols, which made them hard to measure and tune. murmur tests the opposite bet (IndyDevDan's "Simple Swarm System"): the value of a swarm is unstructured communication between agents in one shared folder, so the harness should be tiny (< ~600 lines) and everything else is left to the model.

## What Changes

- New CLI `murmur run task.json` that starts N Pi agent sessions in one shared workspace copied from an optional project folder.
- New in-memory message board exposed to each agent as coordination tools: `post`, `inbox`, `team`, `budget`, `claim`/`release` (advisory), and `done(reason)`. With `messaging: false` only `done` is registered (control condition for measurement).
- Every agent is briefed with the goal, a verifiable definition of done, the acceptance check, its name, its teammates and a way to give up (`done`).
- A per-agent loop that wakes idle agents on new messages and steers busy agents once, and a swarm end on all-done, quiescence, budget (USD and/or tokens) or timeout.
- Full trace in `runs/<id>/events.jsonl` and a summary in `runs/<id>/result.json`; the acceptance `check` always runs at the end.
- Sandbox guard: the CLI refuses to run unless `MURMUR_SANDBOX=1` or `--unsafe`; a minimal Dockerfile runs murmur in a container.
- A `../swarmtest` adapter so murmur can be compared with the previous systems.
- Brief README.

Out of scope: web UI, recoverable persistence, real locks, worktrees, OpenSpec inside the product, retry logic.

## Capabilities

### New Capabilities
- `swarm-run`: the CLI, `task.json` contract, sandbox guard, run directory, agent sessions and loop, end conditions, budget/timeout, acceptance check, trace and `result.json`.
- `coordination-board`: the shared in-memory board and the coordination tools (`post`, `inbox`, `team`, `budget`, `claim`, `release`, `done`), including the new-message steer.
- `swarmtest-adapter`: the request/result bridge that lets `../swarmtest` run murmur on its tasks.

### Modified Capabilities
<!-- none: greenfield project -->

## Impact

- New code under `src/` (TypeScript run with `tsx`), plus `Dockerfile`, `README.md` and example tasks.
- Depends on `@earendil-works/pi-coding-agent@0.99.1` (`createAgentSession`, `defineTool`, `ModelRuntime`, `SessionManager.inMemory`) and `typebox`.
- Reads Pi credentials from `~/.pi/agent/auth.json` (or the directory named by `PI_CODING_AGENT_DIR`).
- Hito 3 touches a separate repository, `../swarmtest`: a new `adapters/murmur.mjs` plus small edits to `swarmtest/config.py` (register the system, allow `token_budget: 0`) and `swarmtest/runner.py` (tsx loader, pass the Pi auth copy).
- Live runs spend real model tokens; they must run inside the container or with an explicit `--unsafe`.
