# swarm-run Specification

## Purpose

Run a small swarm of Pi coding agents on one goal in one shared folder, bounded by a budget and a timeout, and leave a complete trace plus a verifiable result.

## Requirements

### Requirement: Sandbox guard
The `murmur run` command SHALL refuse to start any agent unless the environment variable `MURMUR_SANDBOX` equals `1` or the `--unsafe` flag is given. On refusal it SHALL exit with a non-zero code, print why, and create no run directory.

#### Scenario: Run outside a sandbox
- **WHEN** a user runs `murmur run task.json` without `MURMUR_SANDBOX=1` and without `--unsafe`
- **THEN** the command exits non-zero with a message naming both options and no model call is made

#### Scenario: Explicit opt-in
- **WHEN** a user runs `murmur run task.json --unsafe` (or with `MURMUR_SANDBOX=1`)
- **THEN** the run starts

### Requirement: Task file
The command SHALL read a JSON task file with: `goal` (string), `done` (string, definition of done), `check` (shell command), optional `project` (folder path, resolved relative to the task file), `agents` (integer from 1 to 12), `provider`, `model`, optional `thinking`, `budgetUsd` and/or `budgetTokens` (at least one, each > 0), `timeoutMinutes` (> 0) and optional `messaging` (boolean, default `true`). An invalid task file or an unknown provider/model SHALL fail before any agent starts, with a non-zero exit and a message naming the problem.

#### Scenario: Missing budget
- **WHEN** a task file has neither `budgetUsd` nor `budgetTokens`
- **THEN** the command exits non-zero before any model call

#### Scenario: Unknown model
- **WHEN** `provider`/`model` are not known to the Pi model runtime
- **THEN** the command exits non-zero before any model call

### Requirement: Run directory
Each run SHALL create `runs/<id>/` (relative to the current directory) with a unique `<id>`, containing `workspace/`, `events.jsonl` and, at the end, `result.json`. When `project` is set, its contents SHALL be copied into `workspace/` before agents start; otherwise `workspace/` starts empty. The source project folder SHALL NOT be modified.

#### Scenario: Project copied
- **WHEN** a task names a `project` folder
- **THEN** `runs/<id>/workspace/` starts as a copy of it and agent edits only affect the copy

### Requirement: Agents share one workspace
The run SHALL start `agents` Pi sessions, all with the task's provider, model and thinking level, all with their working directory set to the same `workspace/`. Each agent SHALL have a fixed, distinct name taken in order from a fixed list (wren, finch, robin, …). Each agent SHALL have exactly the built-in tools read, bash, edit and write plus the coordination tools of the `coordination-board` capability.

#### Scenario: Three agents
- **WHEN** a task sets `agents: 3`
- **THEN** three sessions named wren, finch and robin work in the same `workspace/` and see each other's file changes

### Requirement: Briefing
Each agent's first prompt SHALL contain the goal, the definition of done, the acceptance check command, the agent's own name, its teammates' names, and short instructions for the coordination tools, including that `done(reason)` is the way to finish or to give up when the goal cannot be reached. The system prompt SHALL NOT be modified. With `messaging: false` the briefing SHALL omit teammates and coordination instructions except `done`.

#### Scenario: Give-up path is explicit
- **WHEN** an agent receives its first prompt
- **THEN** the prompt tells it to call `done` with a reason both when the definition of done is met and when it decides the goal is not achievable

### Requirement: Agent loop
When an agent's turn ends without it having called `done`, the agent SHALL wait until it has unread messages and SHALL then be prompted again with a short notice to read its inbox. An agent that called `done` SHALL NOT be prompted again.

#### Scenario: Idle agent receives a message
- **WHEN** agent finch's turn has ended without `done` and wren posts a message
- **THEN** finch is prompted again with a short notice to call `inbox`

### Requirement: Swarm end conditions
The swarm SHALL end when the first of these holds: every agent has called `done` (`all_done`); every agent is either done or idle with no unread messages (`quiescent`); cumulative usage exceeds a configured budget (`budget`); `timeoutMinutes` elapses (`timeout`). On `budget` or `timeout` every running session SHALL be aborted. An unexpected harness error SHALL end the run with reason `error`.

#### Scenario: Quiescence
- **WHEN** no agent is running a turn and no agent that has not called `done` has unread messages
- **THEN** the swarm ends with reason `quiescent`

#### Scenario: Timeout
- **WHEN** `timeoutMinutes` elapses while agents are still working
- **THEN** all sessions are aborted and the swarm ends with reason `timeout`

### Requirement: Budget
After every completed model message the run SHALL recompute cumulative cost (USD) and total tokens across all agents from the Pi session statistics. When `budgetUsd` is set and cost exceeds it, or `budgetTokens` is set and total tokens exceed it, the swarm SHALL end with reason `budget`. Cost MAY be reported as 0 (e.g. subscription/OAuth providers); the token limit SHALL still apply.

#### Scenario: Token budget with zero cost
- **WHEN** the provider reports cost 0 and total tokens exceed `budgetTokens`
- **THEN** all sessions are aborted and the swarm ends with reason `budget`

### Requirement: Acceptance check always runs
After the swarm ends, for any end reason, the run SHALL execute `check` with a shell in `workspace/` and record its exit code and a bounded tail of its combined output.

#### Scenario: Check after budget stop
- **WHEN** the swarm ends with reason `budget`
- **THEN** the check still runs and its exit code appears in `result.json`

### Requirement: Trace
The run SHALL append one JSON object per line to `events.jsonl`, each with a timestamp and a type, covering at least: run start, every board post, every tool call (agent, tool name, arguments), usage per completed model message (agent, tokens, cost), steers and re-prompts, every `done` (agent, reason), abort, check result and run end.

#### Scenario: Trace shows communication
- **WHEN** agents post messages during a run
- **THEN** each post appears in `events.jsonl` with sender, optional thread and text

### Requirement: Result file
At the end of every run that got past task validation, the run SHALL write `result.json` with: `status` (`passed` when the check exit code is 0, else `failed`), `reason` (end condition), the check's exit code and bounded output, total cost, total tokens with their input/output/cache-read/cache-write breakdown, duration, and per agent: name, whether it called `done` and its reason, cost and tokens.

#### Scenario: Hello world
- **WHEN** one agent is asked to create `hello.txt` containing `hi` with check `test "$(cat hello.txt)" = hi`, and it succeeds
- **THEN** `result.json` has `status: "passed"` and `events.jsonl` contains the agent's tool calls and its `done`
