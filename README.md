# murmur

**A research project on multi-agent coding.** murmur is a deliberately tiny, non-hierarchical agent swarm: N [Pi](https://www.npmjs.com/package/@earendil-works/pi-coding-agent) coding agents share one folder and an optional message board, nobody assigns work, and the model does the coordinating. It was built to answer one question, and it has mostly been used as the instrument for answering it:

> Can a non-hierarchical swarm of coding agents consistently beat a single agent of the same model?

## Findings so far (2026-10-04)

**Without an oracle, 12 agents (round 15 stage A, a screen: 2 tasks, k=2, a 12M cap shared by the swarm and by the single agent).** Two 12-agent configurations beat one agent with the clock, at 23–27× its tokens: a git branch per agent with merges (0.53 against 0.34) and staggered entry (0.51). A plain 12-agent swarm with a board does not (0.31). A shared task list went almost unused. These verdicts rest mostly on one noisy task and are being followed up on a volume task. Details in [docs/research.md](docs/research.md).

**Without an oracle (round 11 phase 1, single agents on 7 blind tasks, k=3).** This is the first evidence that counts for real work, and swarms have not been re-tested yet.
- A one-line clock (the minutes left, on every tool result) is the one lever that moves a single agent. On three contract tasks it lifts scores from 0.26–0.60 to 0.71–0.99, with or without norms, at 4–10× the tokens.
- Without it, agents stop after about 2 of 18 minutes, often saying the work is unfinished.
- Generic engineering norms are not decided. murmur's agent beats Pi only narrowly (+0.07).
- Details in [docs/research.md](docs/research.md).

**With an oracle (rounds 1–10):**

> **Caveat (2026-10-03): these results are not evidence for real work.** In every round so far the agents had an oracle that real work does not give: a visible acceptance check that revealed correctness, on some tasks a printed score that predicted the hidden grade, and prompts that said "call done when the check passes". The findings below describe how configurations use that oracle. They are being re-tested on oracle-free tasks with an oracle-free prompt, and until then they are hypotheses.

No. Eleven rounds, ~585M tokens, 441 graded swarmtest runs and 34 task batches on hidden-test benchmarks (model `openai-codex/gpt-6-luna`) point the same way: for this model and these tasks, a single agent that keeps working matches or beats every swarm configuration tried.

- **Persistence of one agent beats coordination of several.**
  - A single murmur agent with short lessons beats Pi by about +0.25 at ~0.35M tokens.
  - A single agent with fresh-context relays beats every 3-agent arm on the same tasks.
  - A single agent that sees the minutes it has left (a one-line clock on every tool result) scores 0.997 on three hard tasks, against 0.434 for the same agent without it. Without the clock, the agent gives up after 2–5 of its 18 minutes.
- **Coordination mechanisms did not help** against a same-prompt single agent:
  - message boards, role menus, cheaper delivery channels and automatic notices;
  - verified findings and help-when-stuck signals;
  - file locks.
- **The one positive swarm result was persistence.** In batches of four tasks, agents with a board beat isolated agents (+0.17, k=3) at 3x the tokens. Once the isolated agents also see the clock, the swarm with a clock scores the same (0.921 vs 0.925).
- **What actually fails:**
  - agents stop early: work after the first green check predicts the score, Spearman 0.72–0.80;
  - they break a shared file with a chunked `write`;
  - they yield to a teammate ("X owns the file").
  - Coordination-only turns take 31–62% of a swarm's tokens.
- **Swarms against the clock agent where it has headroom (round 9):** on two 3–5k-line OpenSpec projects that exhaust one agent's tokens, a 4-agent swarm with the same tokens loses (−0.16): it spends them twice as fast on board turns and integration. On four optimisation tasks where the agent stops on a green check, parallel attempts with selection tie (−0.004) at 4x the tokens. They win clearly only where the check prints a number that predicts the hidden grade (+0.27).
- **Round 10 checked that win, and it does not hold against a single agent that keeps going.**
  - Telling the single agent that the printed score is the target does not stop it from ending on the first green check at a low score.
  - In the same campaigns, the plain clock agent matches the 3-agent swarm on that task (0.72 vs 0.68) at a sixth of the tokens.
  - At a fixed token budget, smaller swarms do better: n=2 0.69, n=3 0.58, n=10 0.50.
  - A bare post-only board ties the single agent (−0.006), and a threaded board does not make the volume swarm cheaper (36% of tokens still on the board).

## The research record

| What | Where |
|---|---|
| Curated summary: question, criterion, every round, theory status, threats to validity, next steps | [docs/research.md](docs/research.md) |
| Index of all experiment material, by round and by kind | [experiments/README.md](experiments/README.md) |
| Lab notebook: pre-registrations written before each round, rules as applied, findings, campaign registry | [experiments/plan.md](experiments/plan.md) |
| Longer analyses: adversarial review, methodology and trace audits, DeepSWE diagnosis, incident-inspired theories, task families | [experiments/reports/](experiments/reports/) |
| One row per graded run (441 swarmtest runs), and per-batch results | [experiments/rows/runs.json](experiments/rows/runs.json), `experiments/batch/*/batch-result.json` |
| Per-agent behaviour tables (calls, board share, calls after green, why each agent stopped) | `experiments/criba*-traces.md`, [experiments/batch/traces.md](experiments/batch/traces.md) |
| Raw agent transcripts and event traces (23 MB, attached to a release) | [release `data-2026-10-02`](https://github.com/azaru/murmur/releases/tag/data-2026-10-02), described in [archive/MANIFEST.md](archive/MANIFEST.md) |
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

#### Task file

| Field | Meaning |
|---|---|
| `goal`, `done`, `check` | The goal, the definition of done, and the acceptance command. The default briefing shows agents only the goal; `done` and `check` are placeholders a profile may use. The check runs at the end to record the result, and only levers keyed to it (lab-only) use it during the run |
| `project` | Optional folder copied into the workspace |
| `agents` | 1–12 |
| `provider`, `model`, `thinking` | The Pi model to run |
| `budgetUsd` and/or `budgetTokens`, `timeoutMinutes` | Limits for the whole swarm |
| `profile` | Optional path to a profile (below) |
| `checks` | Optional, one acceptance command per part, for batches of tasks |

#### Profile

A profile holds everything an experiment may tune; the defaults are in `src/profile.ts`. `profiles/no-messaging.json` is the control arm.

- **Prompts:**
  - `briefing` and `teamBriefing` templates;
  - `steer` and `wake` texts;
  - `systemPromptAppend`;
  - `toolDescriptions`: replaces a tool's description, for board, task-list and branch tools, `append` or the built-in tools the profile offers (Pi's one-line summaries and guidelines in the system prompt stay).
- **Agents and tools:**
  - `messaging`: board on or off;
  - `threads`: a threaded board (`thread_new`, `thread_list`, `thread_read`, `reply`) in place of `post`; agents receive only the threads they follow, plus an announcement of each new thread;
  - `tools`: built-in tools;
  - `append`: an `append(path, content)` tool that adds text to the end of a file, for writing a long file in parts;
  - `boardTools`: which coordination tools to offer;
  - `spawnGapSeconds`: staggered entry by time;
  - `spawnAfterTurns`: staggered entry by turns: each agent enters once the previous one has made that many model turns, or `spawnGapSeconds` after it entered if that comes first;
  - `taskList`: a shared task list (`tasks`, `task_add`, `task_take`, `task_done`, `task_drop`) that any agent adds to and takes from; murmur only keeps it and shows its progress on tool results, and it works with the board off;
  - `branches`: a git branch per agent in its own worktree, with `merge` (integrate into the shared folder, reporting conflicts) and `update`; `"required"` puts every agent in its branch, `"optional"` leaves agents in the shared folder with a `branch` tool;
  - `roles`: a menu agents pick from, never assigned.
- **Delivery of posts:**
  - `delivery`: `"steer"` interrupts a busy agent; `"attach"` appends new posts to its next tool result; `"pull"` waits until it calls `inbox`;
  - `notices`: shares each teammate's edits and check runs (needs `"attach"`).
- **Write safety:**
  - `writeGuard`: refuses a `write` that looks like only part of an existing file;
  - `claimLease`: claims block teammates' writes and lapse after that many seconds without a write;
  - `staleGuard`: refuses a `write` onto a file that changed since the agent last read it.
- **Finishing:**
  - `revive`: how many times a new post may wake an agent that already called `done`;
  - `doneGate`: no `done` with unread posts or a failing check;
  - `doneAfterGreen`: tool calls required after the first passing check;
  - `clock`: minutes left appended to tool results.
- **Fresh context:**
  - `relay`: a new instance takes over the seat after `done`;
  - `relayContext`: or once turns grow past that many tokens.
- **Coordination signals:**
  - `findings`: a `finding(text, command)` tool whose post carries the command's real output;
  - `helpAfter`: after that many calls with a red or unrun check, or a `done` without a pass, murmur posts that the agent may need help.

#### Output

Each run writes `runs/<id>/` with:
- `workspace/`;
- `events.jsonl`, the full trace;
- `result.json`, with status, end reason, check output, cost, tokens and per-agent data;
- one transcript per agent.

With OAuth subscriptions the reported cost may be 0 or a catalog estimate, so use `budgetTokens`.

### Design

- Design premise (the hypothesis under test): the value of a swarm is unstructured communication, with one shared board, no roles and no protocol.
- Every agent works in the same folder with Pi's read/bash/edit/write.
- Coordination tools: `post`, `inbox`, `team`, `budget`, `claim`/`release` (advisory) and `done(reason)`.
- A busy agent gets one steer when messages arrive; an idle one is re-prompted.
- The default briefing assumes no test or check: agents decide when the goal is met, and `done(reason)` is also the explicit way to give up.
- The swarm ends when all are done, when nobody works and nobody has unread mail, or on budget/timeout.
- The acceptance check always runs at the end; the trace records posts, tool calls, usage and done reasons.
- A profile with `messaging: false` registers only `done`: the control condition for measuring the board's value.
- Agents are isolated from your Pi extensions, skills, settings and context files.
- It refuses to run outside a sandbox unless told `--unsafe`. Small on purpose: a few hundred lines per file.
