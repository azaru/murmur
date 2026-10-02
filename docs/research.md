# Research log: can a non-hierarchical swarm beat a single agent?

This is the curated record of every experiment run with murmur so far: the question, what was tried, what came out, which theories held and which did not, and what is wrong with the evidence. The raw lab notebook, with every pre-registration written before its round was measured, is [`experiments/plan.md`](../experiments/plan.md); longer analyses are in [`experiments/reports/`](../experiments/reports/). Numbers here are copied from them, and each one can be traced to a run in [`experiments/rows/runs.json`](../experiments/rows/runs.json).

**Status (2026-10-02, after round 6): the evidence answers the question negatively for the tasks tested.** No swarm configuration has met the success criterion. Round 6 confirmed that the strongest results come from a *single* agent that keeps working: a one-line clock explains the best single agent, and once isolated agents get the same clock, the swarm's only win disappears. What remains open is whether coordination helps on tasks where a persistent single agent still has headroom. Round 7 recalibrated the panel: only cph and opt_routing keep the clock agent in the band, because on them it stops on a green check before reaching the quality ceiling.

## TL;DR

- The pre-registered criterion (beat Pi n=1 in two independent confirmation campaigns on a held-out task set) has **never been tested**: no candidate earned a confirmation run.
- Across ~340M tokens and eight rounds, the most reliable lever is **persistence of one agent**:
  - a single murmur agent with short lessons (c4n1) beats Pi by about +0.25 at ~0.35M tokens;
  - a single agent with relays beats every 3-agent arm on the same tasks;
  - **a single agent with a visible clock (c4g-clock) scores 0.997** on ieh, ieh2 and ledger, against 0.434 for the same agent without it (round 6A, k=3). Without the clock the agent gives up on a red check after 2–5 of its 18 minutes; with it, it keeps working for 9–14.
- **Coordination mechanisms did not help**:
  - message boards, role menus, automatic notices, verified findings, help signals and file locks are neutral or negative against a same-prompt single agent;
  - the one positive swarm result (batches of tasks with a board, L1, +0.17) was **induced persistence**: with a clock on both sides, the swarm scores 0.921 and isolated agents 0.925 (round 6B).
- **The tasks now saturate** for the clock agent (0.93–1.0 on all but ieh2), so the rounds so far cannot show a coordination benefit where a persistent agent still has headroom. Round 7's recalibration leaves two tasks in the band, cph and opt_routing; on both, the agent stops on a green check with time and tokens left.
- The dominant failure modes are **stopping early**, **breaking a shared file**, and **yielding to a teammate** ("X owns the file, I'll review").
  - Work done after the first green check predicts the score (Spearman 0.72–0.80 on multi-file tasks).
  - 31–62% of a swarm's tokens go to coordination-only turns.

## The question and the success criterion

murmur runs N Pi coding agents (`openai-codex/gpt-6-luna`, thinking `medium`) in one shared folder, optionally with a message board. It is deliberately **non-hierarchical**: nothing assigns roles or splits work. Agents may pick roles from a menu, enter staggered, and receive signals or finishing conditions, but no planner hands out work.

Goal: a configuration that beats a single Pi agent *consistently*. Fixed before measuring (`plan.md`, "Criterio"):

- a confirmation set never used to pick candidates: 18 `validation_pool` canary tasks plus 8 swarmtest tasks with new seeds, with `holdout_final` reserved;
- two independent confirmation campaigns, each with:
  - a paired per-task mean delta > 0, with the lower end of the 90% bootstrap CI > 0;
  - more tasks won than lost;
  - a timeout or failure rate within 10 points of Pi's.

**Status: not met, never run.** Candidates were screened on calibrated `*_hard` tasks in swarmtest. None reached the confirmation stage.

## Setup

- **Harness:** swarmtest (a sibling repository, `../swarmtest`) runs each competitor on a task, then grades the workspace with a hidden grader. Scores are continuous in [0, 1]. Tasks are calibrated so that Pi lands mid-band (rules in [`experiments/hard-tasks.md`](../experiments/hard-tasks.md)).
- **Per-run limits:** a 3M token cap, raised from 1.5M after F1, where cache reads count toward the cap; and 20 minutes.
- **Arms:** a profile file in `profiles/` plus an agent count. Profiles are immutable; every candidate is a new file.
- **Main tasks:**
  - `information_extraction_hard` (ieh): one file, mail/chat/invoice corpus;
  - `information_extraction_hard2` (ieh2): harder;
  - `durable_workflow_engine` (durable): multi-file;
  - `constrained_planning_hard` (cph): planning;
  - `feature_implementation_hard` (fih);
  - `ledger_reconciliation_hard` (ledger).
- **Analysis:** `scripts/traces.mjs` gives per-agent behaviour (calls, board share, checks, calls after the first green). `scripts/arms.mjs` gives paired comparisons.

## Rounds

### F0–F1 (2026-09-30): does the board help at all?

- **Question:** murmur n=3 with messages, n=3 without, n=1 and Pi, on 8 tasks with k=2.
- **What happened:** F1 was stopped at 6 of 64 runs: too many runs to detect large effects. Two screens followed on 3 workflow tasks.
  - F1a, Pi vs murmur n=3: delta +0.35, 90% CI [+0.04, +0.66], tokens ×7.8. Pi's 0.05 on durable came from Pi stopping after 9 calls.
  - F1b, three arms: n=3 with board vs n=3 without, +0.006 [−0.04, +0.05].
- **Verdict:** the swarm beat Pi, but **the board showed no effect**, at k=1 on 3 tasks.

### Criba 1 (2026-10-01): 13 arms, one run each

- **Arms:** the default swarm, no-messaging, norms (c1), a role menu (c2), a revocable done (c3), lessons (c4 at n=3 and n=1), parallel attempts (c5), silent norms (c6), and the delivery variants x1–x4.
- **Pi reference:** k=11–13 per task on ieh, cph and durable. 65.2M tokens.

| arm | Δ vs Pi mean | tokens/run |
|---|---:|---:|
| c5 parallel attempts (n=3) | +0.43 | 2.46M |
| c1 norms (n=3) | +0.42 | 2.04M |
| x1 attach delivery (n=3) | +0.39 | 1.37M |
| **c4n1 lessons (n=1)** | **+0.25** | **0.36M** |
| c4 lessons (n=3) | +0.22 | 2.43M |
| no messaging (n=3) | +0.21 | 0.51M |
| default (n=3) | +0.10 | 1.19M |
| x2 file-based coordination (n=3) | −0.08 | — |

- **Key finding:** with the same prompt, going from 1 to 3 agents (c4n1 → c4) added nothing and cost 7x. Most of the advantage over Pi comes from "don't stop while the check is red", not from teammates.
- Work after the first green check predicts the score: Spearman 0.80 on durable, 0.72 on cph, 0.16 on ieh.
- 10 of 39 murmur runs hit the 3M cap, so their scores are truncated.

### Criba 2 (2026-10-01): replication against the strong single agent

- **Rule:** an arm passes with Δ ≥ +0.05 vs c4n1 and wins on ≥ 3 of 4 tasks.
- **Results:**
  - **c5 passes:** +0.22, 4 of 4 wins, 2.49M tokens per run.
  - c1 fails: +0.09, 2 of 4.
  - x1 fails: −0.04, 1 of 4.
- **Why c5 wins:** each agent works in a private copy, so nobody breaks a shared file. c1 and x1 scored 0.00 on ieh after one agent overwrote `extract.py` with a continuation chunk, after which everybody gave up.
- 26.0M tokens.

### Criba 3 (2026-10-01): mechanisms against the broken shared file

- **Arms (n=3):**
  - x1g-guard: refuses partial writes;
  - x1g-lock: claims that block writes, with a lease;
  - x1g-stale: refuses a write over a file changed since the agent last read it;
  - x1g-parts: claims on parts of the task.
- **Control:** c4g-guard (n=1). 59.1M tokens.

| arm | ieh / fih / durable | mean | tokens/run |
|---|---|---:|---:|
| c4g-guard (n=1, control) | 0.73 / 0.79 / 0.46 | 0.66 | 0.37M |
| c5 | 0.76 / 1.00 / 0.96 | 0.91 | 2.69M |
| x1g-lock | 0.80 / 0.73 / 0.98 | 0.84 | 1.39M |
| x1g-guard | 0.80 / 1.00 / 0.63 | 0.81 | 1.52M |
| x1g-stale | 0.77 / 0.94 / 0.65 | 0.79 | 1.31M |
| x1g-parts | 0.15 / 1.00 / 0.92 | 0.69 | 0.98M |

- **Verdict:**
  - The write guard solved the broken file: 6 overwrites in 15 campaigns, all repaired. Lock, stale and parts add nothing over the guard.
  - The failure moved to **yielding and stopping early**: on durable, x1g-guard stopped 2/2/2 calls after green, and on ieh 1–2 agents per run called done with "X owns extract.py".
  - The n=3 arms beat the single agent, but at 4–7x the tokens, and the single agent's score/M is 1.80 against at most 0.60.

### Adversarial review (2026-10-01)

An external review of the code and the evidence found:

1. The decisive comparison, the same profile at n=3 vs n=1, was almost absent. The only such pair was a tie.
2. The "did the agent run the check?" detector counted quoted mentions and masked exit codes as passes (≤ 6% of first greens; the Spearman finding survives). It is now fixed in `src/`.
3. `arms.mjs` silently drops pairs whose partner never ran, because a capped run stops the campaign. That biases it against expensive arms; the criba tables were not affected.
4. Pre-registrations lived in a git-ignored folder, the code version was not recorded per run, and graders are reachable from agent workspaces.

The review led to a new rule (every candidate also runs at n=1 with the same file) and to rounds 5A and 5B. It also showed that DeepSWE, the planned promotion benchmark, gives no signal yet: binary reward, Pi 0 of 12.

### Round 5: theories from the July 2026 OpenAI swarm incident

OpenAI's incident report describes agents that formed an unauthorised swarm and gained capability by:

- sharing discoveries;
- asking for help when stuck;
- re-allocating effort across separate tasks.

Round 5 tested those mechanisms in a benign, sandboxed setting, as two sub-rounds.

#### 5A: coordination within one task (61.7M tokens, code `46e756b`)

- **New levers:**
  - `findings`: a `finding(text, command)` tool; murmur runs the command and posts the claim with its real output;
  - `helpAfter`: after N calls with a red check, or a done without a pass, murmur tells the board an agent may need help.

| arm | ieh | ieh2 | tokens/run |
|---|---:|---:|---:|
| x1g-select n=3 (parallel attempts, selection by execution) | 0.60 | 0.32 | 1.5 / 2.3M |
| x1g-coord n=3 (select + findings + help + "messages are information") | 0.42 | 0.17 | 1.3 / 2.0M |
| c4g-relay4 n=1 (fresh-context relays) | 0.92 | 0.62 | 1.2 / 1.1M |
| **c4g-evidence n=1 (evidence gate + clock)** | **0.995** (k6) | **0.99** (k3) | 2.1 / 3.0M |

- **Communication does not help:** findings and help signals had a negative point estimate (k=3, high variance). `finding` was used 4 times in 6 runs.
- **The swarm does not help:** a single agent with relays beats every n=3 arm. All its ieh runs are ≥ 0.87, and it uses fewer tokens.
- **The single agent with c4g-evidence nearly saturates ieh and ieh2**, where c4n1 scored 0.18 on ieh2. But its evidence gate **never refused a done** (0 events), so the likely ingredient is the **clock**: minutes left, appended to every tool result. Round 6A confirmed it: a clock-only arm scores the same.
- x1g-evidence (n=3) scored 0.03 and 0.68 on ieh. 39–47% of its calls went to the board, and it ran out of budget without finishing.

#### 5B: batches of tasks, agents and tokens proportional

- **Setup:** 4 tasks per batch, with 1.5M tokens per task. Every run happens in Docker and sees only its own folder; graders and other runs are out of reach, but network egress is not restricted. Grading happens on the host.
- **Arms:**
  - **I:** 4 isolated single agents, one per task;
  - **R:** 4 agents over all 4 tasks, 6M tokens shared, re-allocating with claims, no messages;
  - **E:** R plus a board, findings and help signals.
- **Lots:**
  - **L1:** existing tasks (ieh, durable, ledger, ieh2).
  - **L2:** a family of contract-style data tasks. A single agent solved it (0.94–1.0) in calibration, so it was dropped by the pre-registered rule.
  - **L3:** a family of optimisation tasks (routing, job shop, packing, rostering) scored against best-known solutions.

| lot | I (isolated) | R (re-allocate) | E (swarm) | E − I, wins |
|---|---:|---:|---:|---|
| L1 | 0.419 (1.6M) | 0.338 (1.5M) | **0.593** (4.9M) | +0.17, 2 of 3 |
| L3 | **0.526** (0.24M) | 0.439 (0.48M) | 0.452 (0.51M) | −0.07, 0 of 3 |

- **E beats I on L1**, which meets the rule, but the rule is weak (k=3), and E spends 3x the tokens. Isolated agents stop early and leave ~75% of their budget unused.
- **E does not beat I on L3.** Every arm stops after ~2 minutes, because the public check turns green as soon as a solution beats the naive baseline. With green checks, no help signal fires and nobody has a reason to move.
- **Mechanisms, against the traces:**
  - help signals fire only with red checks (~5 per batch in L1, 0–1 in L3);
  - re-allocation happens equally in R and E and is **net negative on its own** (R − I = −0.08 and −0.09). In L3 it caused a teammate to rewrite another agent's solver and make it worse than the baseline;
  - knowledge transfer was not observed (`finding` used 1–2 times per batch).

### Round 6: persistence versus coordination (58.8M tokens, code `d9a7510`)

Two results of round 5 could be persistence rather than the mechanism they were credited to. Round 6 gave the single agents a clock and asked whether anything was left for coordination. The pre-registration was committed before launch (`d9a7510`).

The **clock** (`"clock": true`) appends one line, `[N minutes left before the timeout]`, to every tool result. It changes no prompt, forces nothing and does not show tokens.

#### 6A: is the clock the ingredient? (n=1 arms, k=3)

| arm | ieh | ieh2 | ledger | mean | tokens/run |
|---|---:|---:|---:|---:|---:|
| **c4g-clock** (c4g-guard + clock) | 0.999 | 0.990 | 1.000 | **0.997** | 1.4–2.9M |
| c4g-guard | 0.525 | 0.189 | 0.588 | 0.434 | 0.26–0.65M |
| c4g-evidence (clock + evidence gate) | 0.995 (5A) | 0.991 (5A) | 0.967 | 0.984 | 1.1–3.0M |

- **Rule as applied:** clock − guard = +0.56, winning 3 of 3 tasks: the clock contributes. evidence − clock = −0.01: the clock explains c4g-evidence. The gate never refused a done (0 events in 21 runs). **c4g-clock is the new single-agent reference.**
- **Mechanism, from the transcripts:**
  - without the clock, 8 of 9 runs give up on a red check after 2–5 of 18 minutes, using under a quarter of the budget, and say the work is incomplete. None mentions time;
  - with the clock, the agent works 9–14 minutes and makes 19–42 calls after its first green, mostly probing edge cases and fixing the parser.
- **Open:** the visible text barely mentions the clock, and thinking is encrypted. Whether it corrects a belief that time is short, or works as a repeated cue to continue, is untested.

#### 6B: the compute-fair batch control (L1, k=3)

| batch | IC: isolated c4g-clock | EC: b-swarm-clock | EC − IC |
|---|---:|---:|---:|
| r0 | 0.969 (4.8M) | 0.977 (6.0M) | +0.008 |
| r1 | 0.985 (5.6M) | 0.936 (6.0M) | −0.049 |
| r2 | 0.822 (3.7M) | 0.850 (6.0M) | +0.028 |
| mean | **0.925** | **0.921** | **−0.005**, 2 of 3 |

- **Rule as applied:** −0.005 < +0.05, so EC does not beat IC. **5B's L1 win was induced persistence, not coordination.** With the clock, isolated agents use 62–94% of their budget (27% without it) and gain +0.51 over 5B's I; the swarm gains +0.33 over 5B's E. Both comparisons with 5B are descriptive, from another day.
- **Traces:** isolated agents with a clock are limited by their 1.5M cap rather than by time (6 of 12 hit it, ieh2 in all 3 batches). The swarm works mostly as four isolated agents: board tools take 16–20% of calls, a second agent edits a teammate's folder 0–2 times per batch, and there is one plausible useful fix passed through the board (EC r0, ieh2).
- **Ceiling:** three of the four L1 tasks are at 0.93–1.0 for both arms, so 6B shows that the clock closes the gap, not that coordination can never help. ieh2, the only task with headroom, gives 0.75 (IC) vs 0.80 (EC).

### Round 7: recalibration against c4g-clock (24.5M tokens, code `011fb28`)

Calibration only, against the new reference (band 0.3–0.6, k=3), in two regimes. No swarm arm was run.

- **Difficulty-limited (same time and tokens):**
  - in band: **cph 0.474** and **opt_routing 0.534**. They form the new panel D;
  - saturated or above the band: fih 0.972, opt_shop 0.80, opt_packing 0.69 and opt_roster 0.83, plus ieh, ieh2, ledger and durable from round 6.
- **Why the clock agent still has headroom there:** it does not give up. All its cph and fih runs end with `done` on a green check after 4–14 of 18 minutes. The L3 agents finish in 4–5 minutes using 0.04–0.6M of 1.5M each. On planning and optimisation tasks the public check turns green long before the quality ceiling, and the agent stops there. The clock cures giving up on a red check; it does not make the agent keep improving a green solution.
- **Volume-limited (one agent over the four L1 tasks, 6M, 20 min):** 0.839, above the band, so L1 is too small for the volume panel. The limit that binds is tokens, not time: one context holding four tasks costs ~45k tokens per call, and the budget runs out at 14–16 minutes. Durable gets the fewest calls and scores 0.53.
  - Descriptive only, across days: at the same 6M, four isolated agents (0.925) and the swarm (0.921) beat one agent by ~0.08–0.09, almost all of it on durable. The isolated arm has no board, so this is parallel contexts, not coordination.

### Round 8: expanding the panel (in progress; 6.4M tokens so far, code `6e586ac`)

Five new tasks were built in `staging/` (three harder optimisation tasks, an exam-timetabling task and a demand-forecasting task), checked by a read-only ambiguity review (one real contract error fixed), and calibrated against c4g-clock and Pi (k=3). Details in `experiments/reports/2026-10-02-panel8-build.md`.

| task | c4g-clock | Pi | rule |
|---|---:|---:|---|
| opt_roster2 | 0.403 | 0.285 | in band → panel D |
| opt_routing (re-measured in swarmtest) | 0.620 | 0.538 | above → out |
| pred_demand | 0.633 | 0.579 | above → out |
| opt_packing2 | 0.215 | 0.090 | below → remedy |
| plan_timetable | 0.218 | 0.120 | below → remedy |
| opt_shop2 | 0.175 | 0.342 | below → remedy |

- **Panel D is now cph and opt_roster2.**
- **The clock agent stops early on quality-limited tasks:** it uses 1–11 of 18 minutes and under 1.3M tokens, and it is no better than Pi on average here. Its solvers are tuned on a small visible instance and do not scale to the large hidden ones.
- **Next:** the remedy is to show the score on a visible instance as large as the hidden ones, then recalibrate. OpenSpec projects for the volume regime are being scaled up after a pilot showed that one clock agent finishes them (0.97 and 0.998).

## Theories and their status

| Theory | Test | Verdict |
|---|---|---|
| A message board lets agents coordinate better | F1b, criba 1 (default vs no-messaging) | **Refuted**: no effect at equal prompt, and 33–62% of tokens go to coordination |
| Roles chosen from a menu (c2) | criba 1 | Not better than norms alone (+0.27 vs +0.42) |
| Cheaper channels (attach, pull, automatic notices) | criba 1 (x1, x3, x4) | Delivery changed, habits did not; notices were worse |
| Norms and lessons in the prompt help | criba 1–2 | **Supported**, and they help a single agent just as much (c4n1) |
| Parallel private attempts plus selection (c5, select) | criba 2–3, 5A | Supported against a plain single agent (no broken shared file); **not** against a single agent with relays |
| Guards and locks against the broken shared file | criba 3 | The write guard **fixes** it; locks, stale checks and part claims add nothing |
| An evidence gate on done | 5A, 6A | **Inert**: never fired in 33 runs; the clock alone reproduces its scores |
| A visible clock keeps a single agent working | 6A, 6B, 7 | **Supported** on tasks with a red check: +0.56 over the same agent without it; closes the isolated agents' gap in batches. It does **not** keep the agent improving a green solution (cph, optimisation) |
| Fresh-context relays (compute-matched single agent) | 5A | **Supported**: beats every n=3 arm |
| Verified findings (knowledge sharing) | 5A, 5B | **Not supported**: barely used, negative point estimate |
| Help-when-stuck signals | 5A, 5B, 6B | Keep agents working on tasks with a red check; no gain against a persistent single agent |
| Re-allocating effort across tasks | 5B, 6B | **Refuted on its own** (R < I); with a board its L1 win disappears once isolated agents get a clock (EC − IC = −0.005) |
| The swarm beats a same-prompt single agent | criba 1, 5A, 6B | **Not supported**; untested on tasks where the clock agent has headroom |

## Cross-cutting findings

- **Single agents stop early.** Pi runs the check 1–4 times and stops; 19 of 24 calibration runs end admitting incomplete work. Work done after the first green check is the best predictor of score.
- **Writes in chunks break files.** Pi writes ~5–7 KB per `write`; a second `write` meant as a continuation replaces the whole file. In a swarm, a broken shared file plus "someone else owns it" leads everyone to give up.
- **Cost ≈ turns × context length.** Over 85% of tokens are cache reads, context per turn triples during a run, and coordination-only turns take 31–62% of a swarm's tokens.
- **Contract-style tasks saturate.** The best arms reach 0.91–1.0 on them, and a family built for transfer was solved by a single agent in 2 minutes. Ranking strong systems needs tasks with open-ended headroom, and even then a green public check makes agents stop.

## Threats to validity

- **Ceiling.** With the clock, ieh, ledger and durable score 0.93–1.0 for the single agent. Round 6B cannot show a coordination benefit that would need headroom; it shows only that the clock closes round 5B's gap.
- **Reused runs.** Round 6A's c4g-evidence figures on ieh and ieh2 are round 5A's runs (another day; same code path, pre-registered). The main contrast (clock − guard) uses only fresh runs; "the clock explains c4g-evidence" uses them, and the fresh c4g-evidence runs on ledger (0.967) agree.
- **Small k.** Most comparisons use k=2–3 on 2–4 tasks, while one task's noise spans 0.0–0.75 for Pi. Bootstrap CIs over 3–4 task deltas mostly reflect which tasks were sampled.
- **Capped runs are floors.** Many swarm runs hit 3M; their score is truncated, and a capped run stops its swarmtest campaign.
- **Rule drift.** The per-run cap moved from 1.5M to 3M, one arm went to k=2 by choice rather than by rule, F1 was stopped at 6 of 64 runs, and criba 2 pools criba 1's runs. All of this is logged in the notebook.
- **Pre-registrations were not under version control** until this commit. Their timestamps are self-reported in `plan.md`.
- **Code version per run** was not recorded before commit `46e756b`; campaigns ran from `src/` live.
- **Isolation.** swarmtest campaigns run agents with full bash on the host, and graders are reachable from the workspace (0 accesses observed in ~12,000 bash calls). The batch runs use Docker but leave the network open.
- **Shared `/tmp`.** Concurrent runs share it, with fixed agent names; collisions were not verified.

## What would change the picture next

Round 6 answered the first two items of the previous list (the clock, and the compute-fair batch control); both favoured the persistent single agent. Round 7 recalibrated the panel against it. What is left:

1. **Swarm versus the clock agent on panel D** (cph, opt_routing; round 7). This is the compute-fair test of coordination where a persistent agent still has headroom. On these tasks the agent stops on a green check, so a swarm that keeps improving a green solution, or a quality-based stuck signal (6C), has something to fix.
2. **A volume panel:** L1 is too small (one agent scores 0.839). The pre-registered next step is a lot of 6–8 tasks, where one agent cannot cover every task within its tokens and time. A win there is parallelism, reported as such.
3. **Why the clock works:** a control with a neutral line of the same size, and one showing tokens left, would separate "corrects a belief that time is short" from "a repeated cue to continue".
4. **A promotion benchmark with partial credit.** DeepSWE's binary reward gives Pi and ArcSwarm 0 of 12.

If panel D also favours the single agent, the project's answer is that, for this model, a well-instructed single agent that does not stop beats a non-hierarchical swarm.

## Record completeness

For each experiment: whether its question or theory was written down before measuring (pre-registration), its setup (configs and drivers), its per-run results, its analysis, and its decision.

| Experiment | Pre-registered | Setup | Per-run results | Analysis | Decision |
|---|---|---|---|---|---|
| F0 levers | design notes (`experiments/levers/`) | yes | smoke rows in `plan.md` | — | yes |
| F1 pilot and F1a–c screens | F1 yes; **F1a–c screens no** | `experiments/f1*.json` | `rows/runs.json` | findings in `plan.md` | yes |
| Task calibrations | rules in `hard-tasks.md` | `experiments/calib-*.json` | `rows/runs.json` | `plan.md` registry | yes |
| Criba 1 | yes | yes | `criba1-rows.json`, `rows/runs.json`, `criba1-traces.md` | yes | yes (one arm added mid-round, logged) |
| Criba 2 | yes | yes | `criba12-rows.json`, `rows/runs.json`, `criba2-traces.md` | yes | yes |
| Criba 3 | yes | yes | `rows/runs.json`, `criba3-traces.md` | yes | yes |
| Adversarial review | — | — | — | `reports/2026-10-01-adversarial-review.md`, `reports/2026-10-01-review-subagent-reports.md` | led to the n=1 rule and round 5 |
| Round 5A | yes (merged with round 4) | yes | `rows/runs.json`, `criba5-traces.md` | yes | yes |
| Round 5B | yes | `batch/run-batch.mjs`, `lane.sh` | `batch/*/batch-result.json`, `batch/traces.md` | yes, plus `reports/2026-10-01-incident-theories.md` | yes |
| Round 6 (6A, 6B) | yes, committed before launch (`d9a7510`) | `criba6-lanes.mjs`, `batch/run-batch.mjs`, `batch/lane.sh` | `rows/runs.json` (seed 20261020), `criba6-traces.md`, `batch/L1-{IC,EC}-r*/batch-result.json`, `batch/traces.md` | yes, `plan.md` and `reports/2026-10-02-round6-traces.md` | yes |
| Round 7 (calibration) | yes, committed before launch (`011fb28`) | `criba7-lanes.mjs`, `batch/run-batch.mjs` (arm O), `batch/lane.sh` | `rows/runs.json` (seed 20261025), `criba7-traces.md`, `batch/{L3-IC,L1-O}-r*/batch-result.json`, `batch/traces.md` | yes, in `plan.md` | yes |
| Task families (L2, L3) | calibration rule yes | `reports/2026-10-01-task-families.md` | calibration batches in `batch/` | yes | L2 dropped by rule, L3 used |

**Known gaps** (they cannot be fixed after the fact, or they live outside this repo):
- pre-registrations were not version-controlled before commit `138a4d7`, so their timestamps are self-reported;
- the F1a–c screens were not pre-registered separately;
- the code version per run was not recorded before `46e756b`;
- raw agent transcripts and workspaces are not in git (size); they are packed in a 23 MB archive described in [`archive/MANIFEST.md`](../archive/MANIFEST.md); round 6's raw runs are not in it yet and will go into the next archive;
- the `fam_*` and `opt_*` task sources live in the separate swarmtest repository (`staging/`, commit `34c8385`), which has no public remote yet.

## Where the data is

An index by round and by kind is in [`experiments/README.md`](../experiments/README.md).


- [`experiments/plan.md`](../experiments/plan.md): the lab notebook. It holds every pre-registration, rule applied, finding, and the campaign registry, including campaign ids.
- [`experiments/reports/`](../experiments/reports/): longer analyses:
  - the adversarial review and the subagent audits behind it;
  - the DeepSWE diagnosis;
  - the incident-inspired theories and how they fared;
  - the round 6 transcript analyses (the clock, and coordination in the batches);
  - the construction and calibration of the task families.
- [`experiments/rows/runs.json`](../experiments/rows/runs.json): one row per swarmtest run since murmur started (312 runs in 169 campaigns): campaign, seed, task, arm, score, tokens, status and end reason. Regenerate with `node scripts/rows.mjs ../swarmtest/runs --since 20260930`.
- `experiments/criba{1,2,3,5,6,7,8}-traces.md`: per-agent behaviour tables from `scripts/traces.mjs`: calls, board share, checks, calls after the first green, and why each agent stopped.
- `experiments/criba1-rows.json`, `criba12-rows.json`: the aggregated tables used for the criba 1–2 decisions.
- `experiments/*.json`, `experiments/criba*/`, `experiments/*-lanes.mjs`: swarmtest campaign configs and the parallel lane drivers.
- `experiments/batch/`: the round 5B–7 driver (`run-batch.mjs`, `lane.sh`), one `batch-result.json` per batch (including calibration and failed batches), and the coordination events per batch (`traces.md`).
- `profiles/`: every arm. `src/`: murmur itself. The commit history shows when each lever was added.
- **Not in this repo:**
  - raw runs (transcripts, events, workspaces) live in `../swarmtest/runs/<campaign>/` and locally in `experiments/batch/*/`. They are packed into one archive, with a checksum and its layout in [`archive/MANIFEST.md`](../archive/MANIFEST.md);
  - the task families built for round 5 are in `../swarmtest/staging/`.

To reproduce a round, run the driver named in its `plan.md` entry, for example `node experiments/criba5-lanes.mjs <lane>` or `sh experiments/batch/lane.sh L1 <image>`. Then aggregate with `node scripts/traces.mjs <campaign-dir>...`, `node scripts/rows.mjs`, or the `batch-result.json` files.
