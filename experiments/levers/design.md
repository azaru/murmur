## Context

murmur v0 (`src/cli.ts`, `src/swarm.ts`, `src/board.ts`, 407 lines) hard-codes its briefing, steer/wake texts, tool descriptions and tool set, and treats the system prompt as untouchable. Motivation: proposal.md. Behaviour: `specs/`. The experiment plan that uses these levers lives in `experiments/plan.md` (git-ignored), not here.

Findings that shape the approach:
- Pi's `DefaultResourceLoader` accepts `appendSystemPrompt: string[]`, so a system-prompt append needs no SDK internals.
- `node --experimental-strip-types` fails on murmur only because `Board` uses constructor parameter properties (`private log`), which are not erasable syntax. Imports already use `.ts` extensions.
- swarmtest identifies competitors by `(system, agents)` in `config.py`, `make_plan`, the runner request and `report.py` (`f"{system}/n={agents}"`); two murmur arms with the same N collide today.
- autotuner (`../autotuner`): adapters implement `AgentAdapter` (`packages/core/src/agent-adapter.ts`); the core runner grades the repository diff; `describe().version` keys the run cache and `compare` refuses version skew; live runs only happen in `node:22-bookworm` Docker via `apps/cli/src/docker-runtime.ts`, which has per-agent switches (`createAdapter`, `resolveDockerProvider`, `prepareDockerCredentialProfile`, bootstrap, source mounts). The ArcSwarm adapter (`packages/adapters/src/arcswarm/`) is the template: config module, adapter, child runner.

## Goals / Non-Goals

**Goals:**
- Every lever the experiment plan needs is data (a profile), with defaults that keep today's briefing text exactly.
- One swarmtest campaign can pair murmur variants, and one autotuner gate can pair murmur profiles without version skew.
- murmur `src/` stays under ~600 lines.

**Non-Goals:**
- An autotuner mutation surface / `queue` lifecycle for murmur (candidates are hand-written profile files).
- Recalibrating agentic-canary; DeepSWE/Pier integration.
- Commits in `../swarmtest` or `../autotuner`.

## Decisions

### Profile file, separate from the task
New `src/profile.ts` (~60 lines): `DEFAULT_PROFILE`, a TypeBox schema with `additionalProperties: false`, and `loadProfile(path?)` returning the merged profile or throwing with the first schema error. The task keeps what the harnesses already pass (agents, model, thinking, budgets, timeout); the profile holds how murmur behaves. *Alternative:* every lever as a task field — rejected: autotuner candidates and swarmtest variants would each have to rewrite whole tasks, and a task's goal/check must not vary between arms.

`messaging` moves into the profile (a clean break; only our examples use it). The CLI rejects `messaging` in a task file with a pointer to the profile instead of silently ignoring it.

### Templates
`briefing` and `teamBriefing` are strings with `{name} {teammates} {goal} {done} {check} {team}` placeholders, filled with `replaceAll`. The defaults are exactly today's text; verified by diffing the hello example's `run_start` briefing before and after. No templating library.

### Spawn gap without false quiescence
Agent k waits `k × spawnGapSeconds` before its first prompt. All members start as `working: true`, so an early finisher cannot see "nobody working" and end the swarm as `quiescent` before late agents start. The wait is cut short if the swarm ends.

### Tools and descriptions
`profile.tools` replaces the fixed `["read","bash","edit","write"]` allowlist; allowed values are Pi's built-ins `read, bash, edit, write, grep, find, ls`. `boardTools` takes the description map and falls back to today's strings.

### System-prompt append
Passed as `appendSystemPrompt: [text]` to the existing isolated `DefaultResourceLoader`, only when non-empty.

### Strip-types compatibility
Replace the constructor parameter properties in `Board` with explicit fields. Verify with `node --experimental-strip-types src/cli.ts run examples/hello.json --unsafe`. tsx stays for the npm script and the swarmtest loader; the autotuner container uses plain Node.

### swarmtest variants (uncommitted edits in ../swarmtest)
A competitor may carry `"variant": "<profile path relative to murmur>"` (murmur only). Identity becomes `(system, agents, variant)` in config validation and `make_plan`; the runner copies `variant` into the request; `report.py` labels arms `murmur[<variant>]/n=N` and includes the variant in its index key. `adapters/murmur.mjs` loads the profile through murmur's `loadProfile` and records `variant` and a SHA-256 of the effective profile in `metadata`. *Alternative:* one bridge file per variant — rejected: every candidate would need a new file and system name.

### Arm comparison script
`scripts/arms.mjs <campaign-dir>... --a <label> --b <label>` reads swarmtest `record.json` files, pairs runs by (task, repetition) across the given campaigns, averages repetitions per task, and prints per-task deltas, wins/losses/ties, the mean score delta with a seeded 5,000-sample bootstrap 90% CI over tasks, pass counts, and token/time ratios. It lives outside `src/`, so it does not count toward the line budget. *Alternative:* extend swarmtest's `report.py` — rejected to keep swarmtest edits minimal.

### autotuner adapter (uncommitted edits in ../autotuner)
- `packages/adapters/src/murmur/murmur-config.ts`: config schema (id, `agent: "murmur"`, provider, model, thinking, agents, budgets, timeoutMs, `murmurRoot`, optional `profilePath`).
- `murmur-adapter.ts`: `describe()` version = SHA-256 of murmur `src/*.ts` + `package-lock.json`; `run()` spawns a child `node --experimental-strip-types murmur-runner.mjs` with a JSON input and reads its JSON output; maps `result.json` to `durationMs`, `costUsd` (`costSource: "computed"`), `tokenUsage`, `agentMetrics.turns` (count of `usage` events) and exit code / timeout.
- `murmur-runner.mjs`: imports `<murmurRoot>/src/swarm.ts`, calls `runSwarm` with `workspace = repoPath`, `runDir = <outputDir>/murmur`, goal = task prompt, a generic definition of done and `check: "git diff --check"`.
- `docker-runtime.ts`: register murmur in `createAdapter`, `resolveDockerProvider` (Pi providers), `prepareDockerCredentialProfile` (stage the filtered `~/.pi/agent` as for pi/arcswarm), the bootstrap (`PI_CODING_AGENT_DIR`) and a read-only mount of `murmurRoot` like `arcswarmRoot`.
- Configs under `configs/murmur/` (e.g. `gpt6-luna-medium-n1.json`, `-n3.json`).

## Risks / Trade-offs

- [Default templates drift from v0 text] → diff the hello `run_start` briefing before/after.
- [Pi's `pi-tui` native modules or macOS-built `node_modules` break in the Linux container] → smoke run in the container first; if needed, install `node_modules` inside the image or mount a Linux install.
- [swarmtest report code assumes `(system, agents)` beyond the label] → run swarmtest's tests (baseline: the same 4 known failures) plus a `--simulate` campaign with two murmur variants.
- [autotuner treats `solver_crash` as non-retryable] → murmur harness errors surface as crashes; watch for them in smoke runs.
- [Profiles vs version] → profiles live in config, so gates never trip version skew; a murmur source change does, by design.

## Migration Plan

`examples/hello.json` and `examples/trio.json` drop `messaging`; `profiles/no-messaging.json` provides the control arm; the README task-file section is updated.

## Open Questions

- Whether autotuner already holds PI `gpt-6-luna` records for the canary panel usable as the exploratory Pi baseline, or a fresh PI 12×2 run is needed (~0.5M tokens) — checked when that experiment phase starts.
