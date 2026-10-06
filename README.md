# murmur

**A research project on multi-agent coding.** murmur is a deliberately tiny, non-hierarchical agent swarm: N [Pi](https://www.npmjs.com/package/@earendil-works/pi-coding-agent) coding agents share one folder and an optional message board, nobody assigns work, and the model does the coordinating. It was built to answer one question, and it has mostly been used as the instrument for answering it:

> Can a non-hierarchical swarm of coding agents consistently beat a single agent of the same model?

## Findings so far (2026-10-06)

**Without an oracle, rival teams against one swarm at equal size and budget (round 22, closed early, no verdict).** Splitting twelve agents and 32M tokens into three rival teams of four gave 0.24 on average against 0.30 for one swarm of twelve. The best team reached 0.36, but nothing could pick it without the grader. Small teams lost whole repositories when one agent quit in the first minutes.

**Without an oracle, three rival teams (round 21, a screen at k=2).** Three teams of three, each told to finish above the others and able to read the rivals' work, scored 0.17 against 0.02 for one agent on five real repository tasks. The single agent again quit early, saying the work was unfinished, which explains most of the gap. The teams looked at the rivals' folders mostly in the first minutes, copied little, and never talked about winning; teams of the same setup ranged from 0.03 to 0.29.

**Without an oracle, where twelve agents fail to communicate (round 20).** Across 54 twelve-agent runs, the board carried claims but not state: nobody learned when a teammate left, so agents kept addressing teammates who had gone and their work stayed unowned. A one-line notice from murmur when an agent leaves fixed that: posts to departed agents fell from 14 to 0, every repository got worked on, and agents took over abandoned work within minutes. The score did not move at k=2, because the 32M budget ended every run within 20 minutes. A permanent status line on every tool result was worse, and nothing so far stops agents from leaving while saying the goal is unfinished.

**Without an oracle, ten real repository tasks with the clock deciding (rounds 18 and 19).** Twelve agents scored 0.56 against 0.04 for one agent told to keep working until every change was implemented and verified. The instruction did not help: the single agent quit after 14 minutes, and in its other run after one minute without running a command. The swarm stops by the same judgement, since each agent calls `done` once its own repository looks finished or taken. In one repetition all twelve stopped within 34 minutes; in the other a few kept taking abandoned repositories until the clock, which gave the first two fully solved DeepSWE tasks for $4.21. A round on how the team shares state (a board tail, a shared notes file, threads, norms, a task list) was stopped by the model quota after one repetition of three arms, with no verdict.

**Without an oracle, an audit chain and a DeepSWE batch (round 17).** Three agents who enter one at a time, each when the previous finishes, with a board, beat one agent with the clock on planning and a job-shop optimiser: 0.35 against 0.24, at about 6× its tokens. But the margin is on the optimiser, where the single agent scored 0 three times, and the transcripts credit the first draft more than the audit. The same agent with two fresh-context relays is not decided against either. On a batch of five real repository tasks from DeepSWE, twelve agents scored 0.41 against one agent's 0.05 with the same 32M budget. The single agent gave up within 20 minutes with 90% of the budget unused, saying the work was unfinished; on the same tasks one at a time it scores 0.35. Details in [docs/research.md](docs/research.md).

**Without an oracle, difficulty tasks (round 16, planning and a job-shop optimiser, k=2, a 12M cap shared by the swarm and by the single agent).** Twelve agents with staggered entry do not beat one agent with the clock: 0.55 against 0.52, at 17× its tokens. A threaded board makes the swarm worse (0.47). The transcript analysis finds a good solution within the first minute or two, and most of the swarm's spend goes to reviewers re-reading the same file. Telling a single agent that its time and tokens are unlimited does not make it work longer: it stops within two minutes because it judges itself finished. Details in [docs/research.md](docs/research.md).

**Without an oracle, equal spend (round 15 stage C, two OpenSpec tasks, a 24M cap and a 60-minute clock for everyone).** Once one agent has the time to spend the whole cap and sees the tokens left, it ties twelve agents at the ceiling: 0.95 against 0.96, with the single agent at k=1. The swarm's only clear edge there is speed, about 8 minutes against 31–43. Stage B's swarm win below came mostly from the single agent stopping at half the budget. The next tasks are quality-bound, to find where coordination improves quality. Details in [docs/research.md](docs/research.md).

**Without an oracle, 12 agents on a large project (round 15 stage B, one OpenSpec task, k=2, a 24M cap shared by the swarm and by the single agent).** Twelve agents beat one agent with the clock by a wide margin: 0.73 with a plain board and 0.87 with staggered entry, against 0.45, at 2.2× its tokens. They win by covering more of the spec in 7 minutes than one agent covers in 25. The single agent stopped on its own clock with half the cap unspent, so a single agent given the same tokens and enough time to spend them has not been tested yet. Their losses were modules nobody wrote, or wrote but never wired in. Details in [docs/research.md](docs/research.md).

**Without an oracle, 12 agents (round 15 stage A, a screen: 2 tasks, k=2, a 12M cap shared by the swarm and by the single agent).** Two 12-agent configurations beat one agent with the clock, at 23–27× its tokens: a git branch per agent with merges (0.53 against 0.34) and staggered entry (0.51). A plain 12-agent swarm with a board does not (0.31). A shared task list went almost unused. These verdicts rest mostly on one noisy task. Details in [docs/research.md](docs/research.md).

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

A profile holds everything an experiment may tune; the defaults are in `src/profile.ts`. Since 2026-10-06 the defaults are the base profile, [`profiles/n12-base.json`](profiles/n12-base.json): a post-only board whose posts arrive on tool results (`delivery: "attach"`, `boardTools: ["post"]`), staggered entry (`spawnAfterTurns: 2`, `spawnGapSeconds: 60`), `writeGuard`, `clock` and `departureNotice` on. Before that date all of these were off and the board offered every tool, so an older profile that omits one of them behaved differently at its own commit.

- **Prompts:**
  - `briefing` and `teamBriefing` templates;
  - `steer` and `wake` texts (the default wake tells the agent to call `inbox`; when the profile offers no `inbox`, it carries the unread posts itself);
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
  - `clockTokens`: tokens left in the run's budget, shared by the whole swarm, appended to tool results.
  - `clockUnlimited`: the clock and tokens lines say "unlimited" instead of the real amounts left; the real limits still apply.
  - `enterOnDone`: staggered entry by finishing: each agent enters once the previous one ends its turn, and seats not yet entered keep the run going.
  - `boardTail`: every tool result ends with each teammate's latest post (its first 100 characters), as a view of the team's state.
  - `sharedNotes`: a file in the shared folder (for example `TEAM.md`) whose current content is added to each agent's first prompt.
  - `departureNotice`: when an agent calls `done`, murmur posts once to everyone that it left, with its reason, the top-level folders it changed with write/edit/append and when it last did.
  - `teamStatus`: every tool result ends with the team's state: each teammate working, idle, not entered yet or left (and when), and each top-level folder's last write/edit/append (who, how long ago) or none yet. Edits made through bash are not seen.
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
