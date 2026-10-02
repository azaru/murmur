# murmur

**A research project on multi-agent coding.** murmur is a deliberately tiny, non-hierarchical agent swarm: N [Pi](https://www.npmjs.com/package/@earendil-works/pi-coding-agent) coding agents share one folder and an optional message board, nobody assigns work, and the model does the coordinating. It was built to answer one question, and it has mostly been used as the instrument for answering it:

> Can a non-hierarchical swarm of coding agents consistently beat a single agent of the same model?

## Findings so far (2026-10-02)

Not yet, and the evidence points away from it. Six rounds, ~255M tokens and ~300 graded runs on hidden-test benchmarks (model `openai-codex/gpt-6-luna`):

- **Persistence of one agent beats coordination of several.**
  - A single murmur agent with short lessons beats Pi by about +0.25 at ~0.35M tokens.
  - A single agent with fresh-context relays beats every 3-agent arm on the same tasks.
  - A single agent that sees the minutes it has left scores 0.99–1.0 on the two hardest extraction tasks.
- **Coordination mechanisms did not help** against a same-prompt single agent:
  - message boards, role menus, cheaper delivery channels and automatic notices;
  - verified findings and help-when-stuck signals;
  - file locks.
- **The one positive swarm result is still unconfirmed.** In batches of four tasks, agents with a board beat isolated agents on one task family (+0.17, k=3), but spent 3x the tokens. The compute-fair control has not been run yet.
- **What actually fails:**
  - agents stop early: work after the first green check predicts the score, Spearman 0.72–0.80;
  - they break a shared file with a chunked `write`;
  - they yield to a teammate ("X owns the file").
  - Coordination-only turns take 31–62% of a swarm's tokens.

## The research record

| What | Where |
|---|---|
| Curated summary: question, criterion, every round, theory status, threats to validity, next steps | [docs/research.md](docs/research.md) |
| Index of all experiment material, by round and by kind | [experiments/README.md](experiments/README.md) |
| Lab notebook: pre-registrations written before each round, rules as applied, findings, campaign registry | [experiments/plan.md](experiments/plan.md) |
| Longer analyses: adversarial review, methodology and trace audits, DeepSWE diagnosis, incident-inspired theories, task families | [experiments/reports/](experiments/reports/) |
| One row per graded run (247 swarmtest runs), and per-batch results | [experiments/rows/runs.json](experiments/rows/runs.json), `experiments/batch/*/batch-result.json` |
| Per-agent behaviour tables (calls, board share, calls after green, why each agent stopped) | `experiments/criba*-traces.md`, [experiments/batch/traces.md](experiments/batch/traces.md) |
| Raw agent transcripts and event traces (23 MB archive, not in git) | [archive/MANIFEST.md](archive/MANIFEST.md) |
| Every experimental arm | [profiles/](profiles/) |

Method in one paragraph:
- Each candidate is an immutable profile file. Each round is pre-registered in the notebook with its arms, tasks, repetitions, budget and decision rule, then applied as written.
- Runs are graded by hidden tests in a separate harness, swarmtest.
- Every comparison now includes a single agent with the same profile.
- The weaknesses of this evidence (small k, saturating tasks, capped runs, rule drift, partial sandboxing) are listed in [docs/research.md](docs/research.md#threats-to-validity).

## The tool

### Run

```sh
npm install
npm run murmur -- run examples/hello.json --unsafe   # --unsafe: agents get full bash on this machine
```

Or in the sandbox container (the image sets `MURMUR_SANDBOX=1`). `~/.murmur-pi` is a copy of your Pi `auth.json` (and `models.json` if you use one); keep it writable so Pi can refresh OAuth tokens.

```sh
docker build -t murmur .
docker run --rm -v "$PWD/runs:/murmur/runs" -v "$PWD/examples:/murmur/examples:ro" \
  -v "$HOME/.murmur-pi:/root/.pi/agent" murmur run examples/hello.json
```

A task file sets `goal`, `done` (definition of done), `check` (acceptance command), optional `project` (folder copied into the workspace), `agents` (1–12), `provider`, `model`, `thinking`, `budgetUsd` and/or `budgetTokens`, `timeoutMinutes`, an optional `profile`, and optional `checks` (one acceptance command per part, for batches of tasks). A profile (see `src/profile.ts` for the defaults) holds everything an experiment may tune: `messaging`, the `briefing`/`teamBriefing` templates, `steer` and `wake` texts, `systemPromptAppend`, `toolDescriptions`, the built-in `tools`, `spawnGapSeconds`, and `delivery`/`notices` (with `delivery: "attach"` new posts, and with `notices` each teammate's edits and check runs, are appended to an agent's next tool result instead of steering it into a new turn; with `delivery: "pull"` they wait until the agent calls `inbox`), `boardTools` (which coordination tools to offer) `writeGuard` (refuse a `write` that looks like only part of an existing file, the usual sign of a continuation that would erase it), `claimLease` (claims block teammates' writes and lapse after that many seconds without the holder writing) `staleGuard` (refuse a `write` onto a file that changed since the agent last read or wrote it), `doneAfterGreen` (tool calls required after an agent's first passing check before `done`), `clock` (minutes left appended to tool results), `relay`/`relayContext` (after `done`, or when its turns grow past that many tokens, a fresh instance with empty context takes over the agent's seat), `findings` (a `finding(text, command)` tool whose post carries the command's real exit code and output) and `helpAfter` (after that many tool calls while the acceptance check fails or has not run, or when an agent finishes without a pass, murmur posts that it may need help); `profiles/no-messaging.json` is the control arm. Each run writes `runs/<id>/workspace/`, `events.jsonl` (full trace) and `result.json` (status, end reason, check output, cost, tokens, per-agent data). With OAuth subscriptions the reported cost may be 0 or a catalog estimate; use `budgetTokens`.

### Design

- Design premise (the hypothesis under test): the value of a swarm is unstructured communication, with one shared board, no roles and no protocol.
- Every agent works in the same folder with Pi's read/bash/edit/write.
- Coordination tools: `post`, `inbox`, `team`, `budget`, `claim`/`release` (advisory) and `done(reason)`.
- A busy agent gets one steer when messages arrive; an idle one is re-prompted.
- Every briefing carries a verifiable definition of done and an explicit way to give up (`done`).
- The swarm ends when all are done, when nobody works and nobody has unread mail, or on budget/timeout.
- The acceptance check always runs at the end; the trace records posts, tool calls, usage and done reasons.
- A profile with `messaging: false` registers only `done`: the control condition for measuring the board's value.
- Agents are isolated from your Pi extensions, skills, settings and context files.
- It refuses to run outside a sandbox unless told `--unsafe`. Under ~600 lines, on purpose.
