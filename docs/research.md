# Research log: can a non-hierarchical swarm beat a single agent?

This is the curated record of every experiment run with murmur so far: the question, what was tried, what came out, which theories held and which did not, and what is wrong with the evidence. The raw lab notebook, with every pre-registration written before its round was measured, is [`experiments/plan.md`](../experiments/plan.md); longer analyses are in [`experiments/reports/`](../experiments/reports/). Numbers here are copied from them, and each one can be traced to a run in [`experiments/rows/runs.json`](../experiments/rows/runs.json).

> **Caveat (2026-10-03): nothing below is evidence for real work yet.** Every round gave the agents an oracle that real work does not give. Each task had a visible acceptance check (`npm run test`) that revealed correctness. On the optimisation tasks it also printed a score that predicted the hidden grade. murmur's default prompt said "call done when the check passes", and the main norms said "hidden tests will probe every clause". The results describe how configurations use that oracle; the clock, for example, may work only because a red check tells the agent it is not finished. Everything is being re-tested on oracle-free tasks (the visible check confirms only that the program runs with the right output format) with an oracle-free default prompt. See "Threats to validity" and the realism rule in `AGENTS.md`.

**Direction (2026-10-03, after round 14).** The user restated the goal: the only goal is a better swarm and knowing when a swarm is useful, now with 12 agents. Every lever tested with an oracle is to be re-tested without one ([lever recount](../experiments/reports/2026-10-03-lever-recount.md)).

**Status (2026-10-06, after round 20).** The communication problem is partly located: a departure was invisible, so work was orphaned and teammates kept waiting for agents who had left. A one-time notice from murmur fixes that (0 posts to departed agents, every repository covered), without a score gain at k=2 on a 32M cap that ends runs in 12–20 minutes. A permanent status line costs more than it gives. What the notices do not touch is agents leaving early while knowing the goal is unfinished. See [Round 20](#round-20-making-the-teams-state-visible-2562m-tokens-411-code-ed4fb54).

**Status (2026-10-05, after rounds 18 and 19).** On ten real repository tasks with the clock as the only limit, 12 agents beat one agent by the rule (0.563 against 0.038), but again because the single agent quit, now even with an instruction not to stop. What decides both arms is the agents' own judgement of when to stop: a swarm only keeps working while some agents refuse to call `done`, and its two repetitions differ by 0.22. The round on how the team shares state stopped at the model quota with no verdict. See [Round 18](#round-18-ten-deepswe-tasks-the-clock-deciding-and-a-single-agent-told-not-to-stop-3755m-tokens-486-code-7eeeca4-3c02043).

**Status (2026-10-05, after round 17).** Two rule wins for multi-agent configurations, both with caveats. On planning and shop2, three agents entering in turn with a board (AUD) beat one agent (C1T), but the margin is on shop2 where C1T scored 0 three times, and fresh-context relays (C1TR) are not decided against either. The transcripts credit the first draft more than the audit. On a five-task DeepSWE batch, 12 agents (STT) beat one agent sharing the same budget, but the single agent quit within 20 minutes with 90% of the budget unused. The common thread with rounds 11, 16 and side test U is that a single agent's stopping judgement, not its budget or its partners, sets most outcomes. See [Round 17](#round-17-a-fresh-context-audit-and-the-first-deepswe-batch-swarmtest-271m-deepswe-screen-461m-and-batch-703m-tokens-code-73ff3e7-497b6d9-37213a7).

**Status (2026-10-04, after round 16).** On the difficulty tasks (planning and shop2) at a shared 12M cap, 12 agents with staggered entry and the tokens line (STT) are not decided against one agent with the clock and the tokens line (C1T): 0.545 against 0.524, at 17× the spend. A threaded board (STH) loses to C1T. The transcript report finds a good deliverable within 1–2 minutes (from its version replay, not re-run by hand), with most of the swarm's spend going to reviewers re-reading the one file. Nobody tests on inputs larger than the example. Telling one agent its budget is unlimited changes nothing: it stops within two minutes because it judges itself finished. The DeepSWE calibration left one usable task under partial credit, so the batch needs new tasks. Candidate tests from a literature review are listed in `plan.md`. See [Round 16](#round-16-difficulty-tasks-at-equal-caps-threads-at-n12-an-unlimited-clock-and-deepswe-calibration-stage-a-727m-side-test-u-029m-stage-d-197m-tokens-code-b438df5-e5f402f-4833873).

**Status (2026-10-04, after round 15 stage C, equal spend).** Stage B's swarm win on volume was mostly spend. Stage C gave one agent the time to spend the same 24M (a 60-minute clock) and showed every agent the tokens left. C1T (that single agent) scored 0.985 on ospec_green and 0.919 on ospec_brown, at k=1. STT (12 agents with staggered entry and the tokens line) scored 0.955 and 0.963. The rule says not decided, and both tasks are at the ceiling. The swarm's remaining advantage on these tasks is speed: it gets the same score 4–6× faster. No agent ever mentioned the tokens line, so whether it or the longer clock kept C1T working is open. The stage was closed early, and the user moved to quality-bound tasks calibrated against C1T, to find where coordination improves quality. See [Round 15 stage C](#round-15-stage-c-equal-spend-on-volume-closed-early-1546m-tokens-code-10e6f54).

**Status (2026-10-04, after round 15 stage B, volume).** On ospec_green_blind, a many-file project, at a shared 24M cap (k=2), both 12-agent arms beat one agent with the clock by wide margins. B (12 equals with a post-only board) scored 0.734 and ST (B + staggered entry) scored 0.869, against C1's 0.447, at 2.2× its tokens. ST is pronounced better than B (+0.135), but the run ranges overlap. Both predictions failed: B was expected to lose to C1. The swarm wins on coverage. C1 stops on its own 30-minute clock with about half the spec untouched, while twelve agents cover far more of it in 7 minutes before the cap. The confound left open is that C1 had the same cap but spent half of it: it is bound by time, not tokens. Over the three tasks, ST averages 0.627, B 0.448 and C1 0.378. See [Round 15](#round-15-stage-b-twelve-agents-against-one-on-volume-1178m-tokens-code-f4c5f63).

**Status (2026-10-04, after round 15 stage A, the first 12-agent screen without an oracle).** At a shared 12M cap on planning and opt_shop2 (k=2), two 12-agent arms beat one agent with the clock at 23–27× its tokens: required branches per agent (+0.19) and staggered entry (+0.16). Both verdicts lean on shop2, whose single runs span 0.00–0.76, and on C1 planning runs below its earlier means. Against the base 12-agent swarm, staggered entry is pronounced better (+0.20) and the task list pronounced worse (−0.10, at the threshold). The transcripts support a mechanism for staggered entry on planning only (one early agent claims the deliverable, later ones validate) and show no task-list effect at all (it was barely used). A screen at k=2 orders nothing for certain. Stage B (volume) is next, with B, C1 and ST. See [Round 15](#round-15-stage-a-twelve-agents-against-one-1885m-tokens-code-f8a6693).

**Status (2026-10-03, after round 11 phase 1, the first round without an oracle).** Swarms have not been tested without an oracle yet. For a single agent on 7 blind tasks, one lever matters: a visible clock (time left). It raises the contract tasks from 0.26–0.60 to 0.71–0.99, at 4–10× the tokens, with or without norms. Generic engineering norms are not decided, and murmur's agent beats Pi only narrowly (+0.07, carried by one task). Only two blind tasks leave the clock agent headroom (shop2 and ospec), so phase 2 (swarm against single agent) needs harder tasks first. See [Round 11, phase 1](#round-11-phase-1-the-single-agent-without-an-oracle-398m-tokens-code-7651a12).

**Status before the oracle problem (2026-10-02, after round 10, with an oracle): the evidence answers the question negatively for the tasks tested.** No swarm configuration has met the success criterion. Round 6 confirmed that the strongest results come from a *single* agent that keeps working: a one-line clock explains the best single agent, and once isolated agents get the same clock, the swarm's only win disappears. What remains open is whether coordination helps on tasks where a persistent single agent still has headroom. Rounds 7 and 8 rebuilt the panel around the clock agent: four planning and optimisation tasks where it stops on a green check short of the quality ceiling (panel D), and two medium OpenSpec projects where it runs out of tokens at about 0.45 (panel V). Rounds 9 and 10 put swarms against it on that panel: they lose on V, and on D they win only on one task, packing2, where the single agent sometimes stops early on a low score. A plain single agent that does not stop early matches them.

## TL;DR

**An integrate item per project and stubs (round 30, against the fixed baseline, k=5):** TI is TF (round 29, end-to-end tests first) with three changes: a last item per project, "integrate: make every end-to-end test pass"; stubs allowed so that tests compile before the API exists; and no idle marks. It scored 0.434 against 0.357 (p = 0.32, higher on 4 of 5 tasks, not decided), level with TF (−0.005). Neither mechanism took hold. The integrate item appeared in only 8 of 25 projects, 4 were marked done, and its holders mostly built layers instead of wiring them. Stubs were mentioned once. What still separates high from low scores is whether every layer of the change was built: the expr compiler and the scriggo emitter were missing in the runs that scored 0. Oxvg scored 0 in every run, because a cold Rust build of about 6.5 minutes does not fit a 13-minute run.

**End-to-end tests before implementation (round 29, against the fixed baseline, k=5):** TF is RP plus four changes. Whoever finds a project without end-to-end tests adds test items and writes them, and nobody implements before they are done. Build items are cut per layer and name the tests they make pass. A new lever, `taskIdleMinutes`, marks idle holders in `tasks`. It scored 0.439 against 0.357 (p = 0.38, higher on 4 of 5 tasks, not decided), the highest mean so far, and +0.02 over RP. In 24 of 25 projects the first write was a test, and in 16 the tests had several writers. Oxvg scored for the first time in any arm (0.5 in r3), in the one run that changed the selector visitor as well as the optimiser job. The strict rule cost Rust projects the most: oxvg got no implementation in three runs, and wasmi's tests could not compile before its new API existed. Projects split into layers without an integrator failed (scriggo r1–r4 at 0, while one agent alone scored 0.854). The idle marks were shown 37 times and acted on never.

**Parts read from the code, a weight guide and a slower stagger (round 28, against the fixed baseline, k=5):** RP is RW with profile changes only. Each agent enters about 50 seconds after the previous one (15 turns or 60 seconds), weights get a guide (1–3 a detail or a bug found on the way, 4–7 a part buildable on its own, 8–10 most of a project, to be split), the first agent on a project reads the code before adding its parts, and three working rules apply (take an item only when starting it and say which part, drop before moving on, build after finishing a change). It scored 0.422 against 0.357 (p = 0.39, higher on 3 of 5 tasks, not decided), the highest mean against this baseline so far but inside the noise. The mechanics changed as intended: entry spread over 6.4–8.7 minutes, duplicate decompositions fell from 11 to 6 of 25, and weights moved to the middle (8 of 99 items at 8–10, against 59 of 97). Projects were still rarely split before the first write. The spread between runs came from one expr cell: in r1 the syntax layer was started at 13.9 of 14 minutes (0). oxvg scored 0 in every run, as in every arm: the agents changed one module and passed the repository's own tests, while the same 6 of 10 hidden tests failed each time.

**A weighted, shared task list (round 27, against the fixed baseline, k=5):** RW is round 26's RT plus weights (1–10) on task items with the heaviest listed first, items several agents can hold at once, the first agent on a project decomposing it before writing code, and builders taking the heaviest item. It scored 0.351 against 0.357 (p = 0.91, not decided; +0.06 over RT, not decided). Agents decomposed every project before editing it, but mostly into one item of weight 10, so weights told building from repair rather than hard from easy (70 of 97 items weighted 7 or more). Joining a held item helped when it was early and split by layer; elsewhere it was nominal, or left a layer nobody owned (expr r0, the checker). The staggered entry staggers by about four seconds (all 12 agents in within 0.7 minutes), so two agents could decompose the same project at once.

**Roles that mostly build, with the task list for findings (round 26, against the fixed baseline, k=5):** RT is round 25's roles changed three ways at once: builder by default, builders join the hardest unfinished part instead of taking another, and non-builders put concrete findings on the shared task list. Building came back (49 of 60 agents started as builders; 119–150 write/edit calls per run, R 82–125) and expr reached its core in 4 of 5 runs (0.35, R 0.09), but the arm scored 0.292 against 0.357 (p = 0.44, not decided; +0.05 over R, also not decided). The list carried small defects that were picked up within a minute, not the hard gaps; builders ganged up on expr's core in one run only (0.81); and wasmi lost two runs to final builds that did not compile, one from four agents writing the same function into the same file within a minute.

**Roles without owners and a budget clock (round 25, against the fixed baseline, k=5 each):** telling 12 agents that nobody owns a project and giving them a nine-role menu (builder, researcher, reviewer, verifier, tester, integrator, fixer, scout, finisher) to take on entry and switch instead of leaving ended the early departures (0–1 `done` per run against 3–7), but they built less: a quarter fewer edits, expr fell from 0.42 to 0.08, and the arm scored 0.241 against 0.357 (p = 0.20, not decided). Adding a clock that counts down to the end of the budget (0.190, p = 0.071, interval below 0) made the whole team wrap up together and stop with 4–11M of 32M unspent.

**Calling departed agents back (round 24, against the fixed baseline, k=5 each):** letting a post with `@name` or `@all` wake an agent that called `done` (M, 0.434) and adding a task list with hand-overs (MT, 0.370) are both not decided against the baseline (0.357; p 0.46 and 0.85). The mechanism works when used (revived agents went back to work), but only 8 of 174 mentions reached a departed agent: agents treat a departure as final and take over the leaver's repository. Early departures are unchanged, because agents leave when every repository already has an owner, and nobody calls back someone who left for lack of work. The task list became a plan written by the first agent in.

**A fixed baseline (round 23, five DeepSWE tasks, 32M, k=5):** one swarm of 12 with the current defaults scores 0.357 on average (sd 0.135, runs 0.19–0.52; per task expr 0.420, oxvg 0, scriggo 0.150, tengo 0.749, wasmi 0.464). Later arms run only their own batches and are compared with it. The spread between identical runs is large (0.19–0.52), so the ±0.05 rule was replaced by an exact permutation test on per-run means (`deepswe/compare.py`, p < 0.05 and the same direction on 3 of 5 tasks). At k=5 it can decide only differences of about ±0.25, and none of the earlier k=2 DeepSWE verdicts would be decided under it; the large swarm-against-quitting-agent gaps (rounds 17 E, 18) are far outside the spread, the swarm-variant differences of round 20 are inside it.

**Without an oracle, rival teams against one swarm at the same agents and budget (round 22, five DeepSWE tasks, 12 agents and 32M each side; closed after a quota stop, no verdict):**
- Three teams of four sharing one 32M pool averaged 0.239 (one repetition) against 0.303 for one swarm of 12 (two repetitions). The best team, picked by the grader after the fact, scored 0.357; the mean team did not beat the swarm.
- The teams' weak point is departures: a team of four on five repositories loses a whole repository when one agent quits in the first minutes, and one team lost three of four agents by minute 11 (0.085). The swarm absorbed its early departures.
- Teams again used rivals' code silently (one Tengo design adopted within a minute of reading it), never restated the rivalry, and, with the briefing fixed, nobody waited for a teammate named "equals".

**Without an oracle, three rival teams that can read each other's work (round 21, five DeepSWE tasks, 8M per team, k=2, a screen with no verdict):**
- Three teams of three, told to finish above the others and (falsely) that the rivals cannot see them, average 0.169 against one agent's 0.015 (+0.154, higher on 4 of 5). As in rounds 17 E and 18, the margin is mostly the single agent stopping: it called `done` after 16.6 and 3.2 minutes, saying the work was unfinished.
- Teams vary as much as arms do: 0.073–0.252 in one repetition, 0.025–0.294 in the other. oxvg reached 0.667, the project's best on that task, by a team's own work.
- **The rivalry text changed little that is visible.** Agents read the rivals' folders (78 calls, mostly listings in the first minutes), copied two files whole and adopted code in three other cases, none of which scored above its source except one oxvg patch. Nobody restates the goal of beating the others, doubts the "unseen" claim, or mentions rivals when leaving.
- The default briefing's "Teammates: finch, robin, equals working…" is read as a fourth teammate named "equals" in teams of three (17 posts).

**Without an oracle, making the team's state visible (round 20, five DeepSWE tasks, 32M, k=2):**
- A diagnosis of 54 twelve-agent runs found the board carries claims, not state: teammates never learn that someone left, keep addressing departed agents, and leave their work unowned.
- **Departure notices fix that part.** Posts addressed to departed agents fell from 14 to 0, every repository was touched (ST left 3 untouched), and agents took over a leaver's work within minutes. The score is not decided (ST-depart −0.062).
- **They do not change when agents leave.** Agents still call `done` while saying the goal is unfinished, even when told it means leaving for good.
- **A status line on every tool result is worse by the rule** (−0.076): it is never quoted, makes every call larger, and came with 37% fewer edits at the same cap. A shared task list is not decided (−0.024).

**Without an oracle, two more DeepSWE batches (rounds 18 and 19):**
- **Ten tasks, the clock deciding (round 18, k=2):** 12 agents with staggered entry (ST, 0.563) beat one agent told to keep working until every change is implemented and verified (C1P, 0.038) by the rule, above on 9 of 10. But the instruction did not make the single agent persist: it stopped after 13.9 minutes and, in the other repetition, after 1.3 minutes without running a command.
- **The swarm stops by the same judgement.** Agents call `done` once their own repository is finished or claimed, and nothing wakes them. In one repetition everyone stopped by minute 34 (0.455); in the other a few agents kept taking abandoned repositories and the run used the whole clock (0.671, 337M tokens, $4.21), with the first two binary rewards on DeepSWE.
- **How the team shares state (round 19)** is not measured yet: the model quota stopped it after one repetition of three arms (board tail 0.275, shared file 0.234, control 0.351), all inside the control's spread on these tasks (0.17–0.77).

**Without an oracle, a fresh-context audit and a DeepSWE batch (round 17):**
- **Audit (planning and shop2, 12M, k=3):** three agents who enter one at a time, each when the previous finishes, with a board and revival (AUD, 0.348), beat one agent with the clock and the tokens line (C1T, 0.238) by the rule, at about 6× its tokens. The same agent with two fresh-context relays (C1TR, 0.313) is not decided against either. The win rests on shop2, where C1T scored 0 three times. A quiet regrade confirmed every grade.
- **From the transcripts, the audit itself added little:** +0.047 on average over the author's first `done`, about the same as the relays (+0.037 on planning). Most margins were set by the first draft. Later contexts checked that the program ran and met the time limit, almost never tested at the contract's production sizes (1 of 18 runs), and never used the provided large instance to compare costs, although its cost ranks every run in the order of the hidden grade.
- **DeepSWE batch (five tasks where one agent stays below 0.85, 32M shared, 120 minutes, k=2):** 12 agents with staggered entry (STT, 0.408) beat one agent with the same budget (C1T, 0.045) by the rule. But C1T gave up after 14–19 minutes and 3.1M, saying the goal was not met. Given the same tasks one at a time, it scored 0.349 on them. Nobody touched the Rust task oxvg, and no batch reached the official binary reward on any task.
- A DeepSWE screen of 12 harder candidates kept 4 below 0.85. Patch size predicted difficulty poorly.

**Without an oracle, difficulty tasks at equal caps with the tokens left (round 16 stage A, planning and shop2, 12M, k=2):**
- 12 agents with staggered entry (STT, 0.545 at 8.4M per run) do not beat one agent with the clock and the tokens line (C1T, 0.524 at 0.5M): not decided. The same swarm with a threaded board (STH, 0.470) loses to C1T and is not pronounced against STT.
- The transcript report's version replay (not re-run by hand) finds a good deliverable within the first 1–2 minutes, little gained after it, and the graded file the best version produced in all 7 evaluable swarm runs. The 17× spend is 17× more calls, mostly reviewers re-reading the one file. Scores follow the algorithm of the first full solver, not the arm.
- Threads collapse into one or two busy threads and raise the board's share of calls from 29% to 46%.
- No agent tested on inputs larger than the example, and in 6 of 8 swarm runs most agents called `done` before the last edit of the deliverable.
- Telling one agent its time and tokens are unlimited (side test U) changes nothing: it stops within 35–130 s, whatever the line says. One agent's shop2 score is bimodal (0.55 in stage A, 0 in U three hours later).
- DeepSWE calibration (stage D): with partial credit, C1T scores 0.97–1.0 on three of four tasks, so only expr stays and the batch needs new tasks. A cargo cache fault in the offline sidecars is fixed.

**Without an oracle, equal spend on volume (round 15 stage C, ospec_green and ospec_brown, 24M, 60-minute clock):**
- One agent that can spend the whole cap (C1T, 0.952) ties 12 agents (STT, 0.959). Both sit at the ceiling, with C1T at k=1. Stage B's +0.29 to +0.42 for the swarm came from C1 stopping at 11M.
- The swarm's edge on these tasks is wall time: about 8 minutes against 31–43.
- Nobody mentioned the new tokens-left line. C1T simply never stopped: it finished all tasks at 37 minutes and then audited until the cap.
- The volume panel is saturated, and the next tasks are quality-bound, calibrated so that C1T lands near 0.4.

**Without an oracle, 12 agents on volume (round 15 stage B, ospec_green_blind, 24M shared cap, k=2):**
- B (12 equals, post-only board) 0.734 and ST (B + staggered entry) 0.869 both beat C1 (one agent with the clock, 0.447), at 2.2× its tokens. ST is pronounced better than B by the rule (+0.135), but B's best run beats ST's worst.
- The gain is coverage. Of 47 graded capabilities, C1 leaves 20–23 at zero, B 6–14 and ST 1–8. Quality inside the covered ones is similar (0.87–0.97).
- C1 stopped on its 30-minute clock at ~11M, saying the work was unfinished. The swarms hit the 24M cap at ~7 minutes. So "equal cap" here means 2.2× the spend and a quarter of the wall time for the swarm.
- Swarm losses are modules nobody wrote (two agents yielding to each other) or wrote but never wired in before the cap. Staggered entry gave a cleaner start (1–2 core claimants against 7–8).

**Without an oracle, 12 agents (round 15 stage A, planning and opt_shop2, 12M shared cap, k=2):**
- Required branches per agent (BR, 0.534) and staggered entry (ST, 0.506) beat one agent with the clock (C1, 0.343) by the pre-registered rule, at 23–27× its tokens. The base swarm (B, 12 equals with a post-only board) is not decided against C1 (0.305).
- Against B: ST is pronounced better, the task list (TL) pronounced worse at the threshold, and optional branches, roles and BR are not pronounced (each moves in opposite directions on the two tasks).
- On planning, staggered entry works as hoped: the first agent claims the planner and the later ones validate it (1.5 full writers per run against 5.0 in B). On shop2, final scores follow the cost of the solver the swarm ends with. Two zeros (TL, B) came from reviewers replacing a wall-clock search with fixed policies.
- A merge bug (conflict markers reaching the shared folder through a hand-staged file) is fixed. The default wake text told agents to call an `inbox` tool these profiles do not offer; with the user's OK it now carries the unread posts when there is no `inbox` (not yet exercised: no agent went idle in stage B).

**Without an oracle (round 11 phase 1, single agents only, 7 blind tasks, k=3):**
- **The clock is the one lever that works.** Showing the time left raises the single agent on the three contract tasks from 0.36–0.59 to 0.91–0.96 with norms (R3, +0.255, 6/6) and from 0.26–0.44 to 0.71–0.99 without them (R4, +0.335, 6/6). It costs 4–10× the tokens (0.3–1.0M against ~0.1M) and 3–4× the minutes.
- **Without the clock, agents stop after about 2 of 18 minutes.** In 14 of 27 runs they say the work is not finished. None keeps a test file of its own. Agents never mention the clock; with it they simply keep working, verifying and fixing.
- **Generic engineering norms are not decided** (R2, +0.02). They add a few ad-hoc probes and nothing measurable.
- **murmur's single agent against Pi passes narrowly** (R1, +0.071, 4 of 6). One task carries it. The old gap of +0.25 was mostly the oracle prompt.
- **The blind optimisation tasks stay near 0 for everyone.** The grader gives 0 to anything not cheaper than a strong naive baseline, and agents submit their first greedy solution.
- **Only shop2 and ospec passed phase 1's calibration.** The contract tasks saturate with the clock. Round 13 added planning and ospec_green.
- **Phase 2 (round 14), stage D only, because the model quota ran out:**
  - A teammate does not keep agents working: two agents without a clock stop as early as one.
  - On planning, two agents with the clock scored 0.32 against one agent's 0.42, at 3.5× the tokens.
  - The volume tasks are not measured.
- **Tools:** agents write long files in parts by mistake (`write` replaces the file). The write guard caught all 5 cases in murmur, and Pi lost the file in 2 of 3. New default-off levers: an `append` tool and replaceable descriptions for Pi's tools.

**With an oracle (rounds 1–10; not evidence for real work):**

- The pre-registered criterion (beat Pi n=1 in two independent confirmation campaigns on a held-out task set) has **never been tested**: no candidate earned a confirmation run.
- Across ~585M tokens and eleven rounds, the most reliable lever is **persistence of one agent**:
  - a single murmur agent with short lessons (c4n1) beats Pi by about +0.25 at ~0.35M tokens;
  - a single agent with relays beats every 3-agent arm on the same tasks;
  - **a single agent with a visible clock (c4g-clock) scores 0.997** on ieh, ieh2 and ledger, against 0.434 for the same agent without it (round 6A, k=3). Without the clock the agent gives up on a red check after 2–5 of its 18 minutes; with it, it keeps working for 9–14.
- **Coordination mechanisms did not help**:
  - message boards, role menus, automatic notices, verified findings, help signals and file locks are neutral or negative against a same-prompt single agent;
  - the one positive swarm result (batches of tasks with a board, L1, +0.17) was **induced persistence**: with a clock on both sides, the swarm scores 0.921 and isolated agents 0.925 (round 6B).
- **The tasks now saturate** for the clock agent (0.93–1.0 on all but ieh2), so the rounds so far cannot show a coordination benefit where a persistent agent still has headroom. After rounds 7 and 8 the panel holds four difficulty-limited tasks (the agent stops on a green check with time and tokens left) and two volume-limited OpenSpec projects (it runs out of tokens at about 0.45).
- **Round 9 put swarms against the clock agent on that panel.** On the volume projects a 4-agent swarm **loses** (−0.16), burning the shared 6M twice as fast on board turns and integration. On the difficulty tasks parallel attempts with selection are **not decided** (−0.004, 2 wins and 2 losses) at 4x the tokens. They win clearly only where the check prints a number that predicts the hidden grade.
- **Round 10 tested that number, swarm size, a bare board and a cheaper V swarm.**
  - A text norm ("the printed score is the target") does **not** make the single agent use the score. It still ends on the first green at a low score in 5 of 9 packing2 runs.
  - Against that weakened control, parallel attempts "add" by the pre-registered rule. But the plain clock agent in the same campaigns scores as well on packing2 (0.719 against 0.679), at a sixth of the tokens.
  - At a fixed 3M, smaller swarms do better: n=2 0.69, n=3 0.58, n=10 0.50 on the two tasks with a score. n=10 runs out of tokens after one draft per agent.
  - A post-only board with a one-line briefing (B0) ties the single agent (−0.006). A threaded board with an integration rule (TI) does not make the V swarm cheaper: board-only turns still take 36% of its tokens.
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

### Round 8: expanding the panel (44.6M tokens, code `6e586ac` → `0097a51`)

New tasks were built in `staging/` by subagents, checked by read-only ambiguity reviews (one real contract error and several minor gaps fixed), and calibrated against c4g-clock (k=3). Details: `experiments/reports/2026-10-02-panel8-build.md`.

- **Panel D, difficulty-limited** (20 min, 3M):

  | task | c4g-clock | Pi | rule |
  |---|---:|---:|---|
  | cph (round 7) | 0.474 | 0.35 | in |
  | opt_roster2 | 0.403 | 0.285 | in |
  | opt_packing2 | 0.402 | 0.090 | in after the remedy (0.215 before) |
  | opt_shop2 | 0.306 | 0.342 | in after the remedy (0.175 before) |
  | opt_routing | 0.620 | 0.538 | out, above |
  | pred_demand | 0.633 | 0.579 | out, above |
  | plan_timetable | 0.272 | 0.120 | out, below after its one remedy |

  - The remedy for tasks below the band was a visible instance as large as the largest hidden one, scored by `npm run test`. Before it, agents tuned their solvers on a small visible instance that hid the fact that they did not scale.
  - On these tasks the clock agent stops early (1–11 of 18 minutes, under 1.3M tokens) and is no better than Pi on average.
- **Panel V, volume-limited** (OpenSpec projects, 30 min, 6M; comparison A agreed with the user):
  - **ospec_green** is a stockroom service built from scratch: 47 capabilities, 260 scenarios, 167 tasks.
  - **ospec_brown** is an existing 3k-line task tracker plus a change: 228 change scenarios and 162 regression scenarios.
  - A first build of ~1k lines saturated (0.97 and 0.998), so both were scaled up about 4x.
  - At that size the clock agent scores **0.459** and **0.448**. All 6 runs end on the 6M budget at 12–23 minutes, still working (31–86 calls after the first green). The limit that binds is tokens: one context holding the whole project grows expensive.
- **Next:** the swarm comparisons on both panels, each pre-registered.

### Round 9: the swarm against the clock agent on panels D and V (70.8M tokens, code `3ea1d8d`)

- **Panel V** (comparison A; 6M and 30 min per run, k=3). S4 = v-swarm-clock n=4: c4g-clock plus a board and a menu of `tasks.md` sections claimed by the agents themselves. C1 = c4g-clock n=1, the round 8 calibration, reused as pre-registered (pairing within a campaign is impossible there because every run hits the cap).

  | project | S4 | C1 | S4 − C1 |
  |---|---:|---:|---:|
  | ospec_green | 0.166 (0.201 / 0.298 / 0.000) | 0.459 | −0.293 |
  | ospec_brown | 0.412 | 0.448 | −0.036 |

  - **Rule applied: the swarm loses.**
  - Agents held smaller contexts (15–29k tokens per call against 48–67k), as expected. They spent the saving on 2.5x more calls: board turns took ~30% of tokens, and specs were read twice as often. The 6M ran out in 6–9 of 30 minutes.
  - On green, the swarm lost on breadth: 31–35 of 48 sections were never claimed. Integration through one shared `__init__.py` was fragile, and one run scored 0.0 from a `CustomerMixin`/`CustomersMixin` mismatch. On brown, whose modules are separable, it tied.
  - Agents did use each other's work (posted interfaces, a shared composition file). Coordination happened, and it cost more than it returned.
- **Panel D** (3M and 18 min per run, k=3, paired in the same campaigns). S3 = x1g-select-clock n=3 (parallel attempts selected by execution, plus the clock) against C1.

  | task | S3 | C1 | S3 − C1 |
  |---|---:|---:|---:|
  | cph | 0.349 | 0.435 | −0.086 |
  | opt_packing2 | 0.898 | 0.631 | **+0.267** |
  | opt_roster2 | 0.283 | 0.503 | −0.220 |
  | opt_shop2 | 0.307 | 0.284 | +0.023 |

  - **Rule applied: not decided** (mean −0.004, 2 wins and 2 losses). S3 spends 2.3M per run against 0.58M, and 4 of its 12 runs hit the cap.
  - The packing2 win is diversity plus a predictive number. About 1 attempt in 3 finds the good algorithm, the same rate as C1's good mode. The check prints a score on an instance as large as the hidden ones (r = 0.94 with the hidden grade). C1 stops on green with that score at ~0.15; S3 selected on it and kept fixing bugs after green.
  - On roster2 and cph there is no such number. S3 selected on the visible cost and once installed a solver that does not scale (0.013).
- Analyses: `experiments/reports/2026-10-02-round9-v-traces.md`, `experiments/reports/2026-10-02-round9-d-traces.md`; per-agent table `experiments/round9-traces.md`.

### Round 10: the quality signal, swarm size, a bare board and a cheaper V swarm (128.6M tokens, code `9d1180b`)

Panel D (opt_packing2, opt_shop2, opt_roster2; 3M and 18 min per run, k=3, paired in the same campaigns). packing2 and shop2 print a score on an instance as large as the hidden ones; roster2 prints one only for its small visible instance. New profiles, built from existing levers:
- **C1s** (`c4g-signal`): the clock agent plus a norm that makes the printed score the target, not the exit code.
- **S2s, S3s, S10s** (`x1g-select-signal`): parallel attempts, selected by the printed score, with the same norm.
- **B0** (`b0-basic`): the clock agent plus a post-only board and a one-line briefing.
- **TI** (`ti-swarm-clock`): a threaded board plus an integration rule, on panel V.

| comparison | packing2 | shop2 | roster2 | rule |
|---|---:|---:|---:|---|
| S3s − C1s (10A primary) | +0.460 | +0.085 | −0.031 | **adds**, by the letter; S3s capped 7/9 |
| C1s − C1 (10A secondary) | −0.500 | +0.099 | +0.288 | the norm **does not help** |
| S3s − C1 (descriptive) | −0.040 | +0.184 | +0.257 | — |
| S2s − C1s (size) | +0.571 | −0.026 | −0.198 | not decided; capped 3/9 |
| S10s − C1s (size) | −0.028 | −0.057 | +0.107 | not decided; capped 9/9 |
| B0 − C1 (10B) | +0.087 | −0.032 | −0.074 | **not decided** (mean −0.006), as predicted |

Panel V, ospec_brown (6M and 30 min): TI scores 0.416, against C1 0.448 (round 8) and S4 0.412 (round 9). **V is parked.**

- **The control collapsed, so the primary does not mean what it was meant to.** The norm in text did not stop early exits. 5 of 9 C1s packing2 runs ended within 3 minutes on the first green, with the large-instance score at 0.11–0.21, and the agent wrote that the check "passes for both the visible and large instances". The plain clock agent in the same campaigns scored 0.719 on packing2, above S3s's 0.679, at about a sixth of the tokens.
- **Size, at a fixed 3M.** On the two tasks with a score, the mean is n=2 0.687, n=3 0.580 and n=10 0.498. Swarm tokens per run are 2.1M, 2.8M and 3.0M.
  - n=10 gets about one first draft per agent before the cap, which it hits at 4–6 of 18 minutes. In 3 of 9 runs the cap also left a better attempt uninstalled.
  - n=2 reached packing2's good mode in 3 of 3 runs, and installed its best attempt in 9 of 9. The transcripts show one agent posting the key idea within 2–4 minutes, the only peer adopting it, and both iterating after green.
- **Selection is only as good as the number.** On roster2 the swarms selected on the small visible instance and installed solvers that degrade with size. One S2s solver scores 0 on the largest hidden instance.
  - The large-instance score itself is load-sensitive. One end-of-run check printed 0.152, while the hidden grade was 0.819 and a quiet regrade gave 0.933.
- **B0 (the incident's basics) adds nothing measurable.** Three agents edit one `solve.py` and use the board for results and cross-checks, at 2–7x the single agent's tokens.
  - Its packing2 edge cannot be separated from more total work.
  - In its one capped run, the board converged on a harmful change: fixed iteration budgets in place of a time limit. S fell from 0.52 to 0.35, and nobody reverted it.
- **TI did not cut coordination cost.** Board-only turns took 35.6% of its tokens, against S4's 27.8% by the same script; the target was under 10%. The integration rule did prevent broken imports. Coverage stayed at 33 of 41 capabilities.
- Analyses: `experiments/reports/2026-10-02-round10-{d,b0,v}-traces.md`; per-agent table `experiments/round10-traces.md`.

### Round 11, phase 1: the single agent without an oracle (39.8M tokens, code `7651a12`)

These are the first measurements without an oracle. The panel has 7 blind variants: the visible check only confirms the deliverable runs and has the right format, and the graders are unchanged. The neutral default briefing ends with "When you judge that the goal is met, call done". Every arm is one agent: Pi without murmur; solo (murmur's neutral prompt plus the write guard); solo-norms (plus generic engineering norms); solo-norms-clock (plus the clock); and solo-clock (the clock without norms, added after interim results, as a declared deviation). Runs got 3M tokens and 1200 s, of which the agent's clock shows 18 minutes (ospec: 6M and 1920 s), k=3.

| task | Pi | solo | solo-norms | solo-norms-clock | solo (C) | solo-clock (C) |
|---|---:|---:|---:|---:|---:|---:|
| durable | 0.52 | 0.52 | 0.36 | **0.96** | 0.44 | **0.99** |
| ieh | 0.02 | 0.24 | 0.59 | **0.91** | 0.37 | **0.71** |
| ledger | 0.42 | 0.60 | 0.44 | **0.92** | 0.26 | **0.92** |
| opt_packing2 | 0.00 | 0.00 | 0.01 | 0.06 | 0.00 | 0.28 |
| opt_roster2 | 0.06 | 0.09 | 0.14 | 0.14 | 0.10 | 0.15 |
| opt_shop2 | 0.17 | 0.05 | 0.09 | 0.16 | 0.00 | 0.12 |
| tokens per run (contract tasks) | 0.11M | 0.11M | 0.14M | 0.78M | 0.13M | 0.75M |

ospec_brown_blind (solo-norms-clock only): 0.47, with all 3 runs capped at 6M.

Rules as written:
- R1 (solo-norms − Pi): +0.071, wins 4/6. **Passes**, carried by ieh (+0.56).
- R2 (solo-norms − solo): +0.020. **Not decided.**
- R3 (solo-norms-clock − solo-norms): +0.255, 6/6. **Passes.**
- R4 (solo-clock − solo): +0.335, 6/6. **Passes.**
- Calibration for phase 2 (clock agent in [0.15, 0.85]): only shop2 (0.16) and ospec (0.47, capped) enter.

From the transcripts (`experiments/reports/2026-10-03-round11-traces-analysis.md`, model output, key claims checked by hand):
- Without the clock, the pattern is one write, one `npm run test`, then done at about 2 minutes, often admitting the contract is not met.
- With the clock, agents make 3× the calls (35% verification, 39% edits). They never mention the time and stop on their own with 5–14 minutes left.
- On the optimisation tasks no run compares two candidate solutions on purpose. The clamp at the naive baseline turns small improvements into 0.

The tool audit (`experiments/reports/2026-10-03-tool-usage-audit.md`) found that chunked writes happen only on ieh's large `extract.py`. About 8.5% of `edit` calls fail, mostly on over-escaped backslashes. It led to two new default-off levers, `append` and `toolDescriptions` for Pi's tools, which are not measured yet.

### Round 12: the tool levers (18.7M tokens, code `07b6cf4`)

The task is information_extraction_hard_blind, the one blind task where agents write a long file in parts, with k=4. Every murmur arm has the clock.

| arm | score | tokens | writes per run | refusals | wasted calls per run | edit failures |
|---|---:|---:|---:|---:|---:|---:|
| Pi | 0.443 | 0.16M | 2.0 | – | 1.8 | 33% |
| G (write guard) | 0.909 | 0.95M | 3.0 | 4 | 12.5 | 32% |
| GA (guard + `append`) | 0.843 | 1.48M | 1.0 | 0 | 11.5 | 23% |
| GDA (guard + `append` + clearer write/edit descriptions) | 0.747 | 0.75M | 1.0 | 0 | 9.5 | 23% |
| DA (`append` + descriptions, no guard) | 0.972 | 1.34M | 1.0 | 0 | 6.5 | 18% |

- **Mechanism.** With `append`, agents write the file once and add to it. Full-file re-sends and refusals disappear, wasted calls fall, and no arm lost content.
- **Rule.** The pre-registered score clause (not more than 0.05 below G) fails for GA and GDA, so phase 2 keeps G.
- **Noise.** GDA and DA had the same effective tools, because the guard never fired in GDA, yet they differ by 0.22. At k=4 on one task, the score clause measures noise. The tools are not ruled out; they were measured with the wrong guard.

### Round 13: calibrating harder blind tasks for phase 2 (25.3M tokens, code `7f2c84d`)

Phase 1 left only two tasks with headroom for the clock agent, so four harder blind variants were built (`experiments/reports/2026-10-03-blind-panel-wave3.md`). Each was calibrated against Pi and C1 (solo-clock, phase 2's control) at k=3. A task enters phase 2 if C1's mean is in [0.3, 0.6].

| task | Pi | C1 | verdict |
|---|---:|---:|---|
| constrained_planning_hard_blind | 0.38 | 0.465 | enters |
| information_extraction_hard2_blind | 0.01 | 0.847 | out |
| fam_payouts_blind | 0.97 | 1.000 | out |
| ospec_green_blind (6M) | 0.07 | 0.425 (2/3 capped) | enters, flagged |

Phase 2 (round 14) runs on planning, ospec_green, opt_shop2 and ospec_brown.

### Round 14 (phase 2): two agents with a board against one agent, stage D only (24.0M tokens, code `429cbb3`)

The arms, all without an oracle:
- **C1**: one agent with the clock;
- **S2c**: two agents with a post-only board and the clock;
- **solo**: one agent without the clock;
- **S2**: two agents with a board, no clock.

The tasks were planning and opt_shop2 (stage D), plus ospec_brown and ospec_green (stage V). The Codex usage limit was reached after stage D and one V run. Five campaigns are invalid and listed in `plan.md`. The pre-registered rules need all four tasks, so they are not applied.

| task | C1 | S2c | solo | S2 |
|---|---:|---:|---:|---:|
| planning | 0.421 (0.57M) | 0.315 (1.97M) | 0.356 (0.07M) | 0.363 (0.18M) |
| opt_shop2 | 0.184 (0.09M) | 0.307 (0.46M) | 0.266 (0.06M) | 0.366 (0.12M) |

- **A teammate is not a "keep working" cue.** S2's agents stop at 1–2 minutes, like solo. With the clock, both swarm and single agents keep working.
- **Where the clock barely helps (planning, an algorithmic gap), two agents do not help either.** They spend 21–24% of their calls on the board and 3.5× the tokens. shop2 swings 0.00–0.54 within one arm at k=3.

### Round 15, stage A: twelve agents against one (188.5M tokens, code `f8a6693`)

The user restated the goal (a better swarm, and knowing when one is useful), moved to 12 agents, and chose the levers. Three were new, all default off:
- turn-based staggered entry;
- a shared task list, like an issue tracker;
- a git branch per agent with `merge` and `update`, required or optional.

Every arm had the clock and the write guard, and every run got the same 12M cap and 20 minutes, the single agent included. The tasks were constrained_planning_hard_blind and opt_shop2_blind, at k=2.

| arm | planning | shop2 | mean | tokens per run |
|---|---:|---:|---:|---:|
| C1, one agent with the clock | 0.275 | 0.412 | 0.343 | 0.30M |
| B, 12 equals, post-only board | 0.415 | 0.195 | 0.305 | 5.6M |
| TL, B + task list | 0.410 | 0.000 | 0.205 | 6.2M |
| BR, B + required branches | 0.409 | 0.658 | 0.534 | 6.8M |
| BO, B + optional branches | 0.034 | 0.209 | 0.122 | 10.2M |
| ST, B + staggered entry | 0.473 | 0.539 | 0.506 | 8.2M |
| RO, B + role menu | 0.387 | 0.409 | 0.398 | 9.9M |

**Rules as applied:**
- Against B, a lever is pronounced if it moves the mean by ≥ 0.10 in the same direction on both tasks. ST is pronounced better; TL is pronounced worse (−0.100).
- Against C1, an arm wins if it is ≥ +0.05 above and above on both tasks. BR and ST win and BO loses.
- Stage B (ospec_green_blind, 24M) takes B, C1 and ST.

**From the transcripts** ([report](../experiments/reports/2026-10-04-round15-traces-analysis.md), model output, key claims checked by hand):
- **Staggered entry on planning:** the first agent posted "I'm implementing" at 8 s, and each later entrant deferred and validated instead. On shop2 there was no such effect, and the pronounced verdict comes from shop2.
- **Task list:** barely used (1–3 "inspect" items per run). Its zeros on shop2 match B's own zero: reviewers swapped a time-bounded search for fixed policies, which made the solver costlier than the grader's baseline.
- **Optional branches on planning:** the shared planner ended broken (an untested edit merged 5 s before the cap, and a last-minute wave of direct edits).
- **Required branches on shop2:** merges forced agents to compare solvers at each conflict, and both runs ended with one agent's best solver.
- **Roles:** agents picked roles before reading the task, mostly builder, and both role runs on planning ended on the cap.
- **Bugs:** conflict markers could reach main through a hand-staged file, now fixed. The default wake text names an `inbox` tool these profiles lack, and fixing it needs the user's OK.

### Round 15, stage B: twelve agents against one on volume (117.8M tokens, code `f4c5f63`)

Stage A's promotion rule sent B, C1 and ST to ospec_green_blind, a many-file OpenSpec project (47 graded capabilities). Every run got the same 24M cap and 32 minutes (murmur's own timeout is 30), k=2. The code differs from stage A by the conflict-marker fix and by the new default wake, which carries the unread posts when a profile has no `inbox`.

| arm | runs | mean | tokens per run | minutes | end |
|---|---|---:|---:|---:|---|
| C1, one agent with the clock | 0.426, 0.469 | 0.447 | 10.8M | 25.9 | done, both |
| B, 12 equals, post-only board | 0.638, 0.830 | 0.734 | 24.0M | 7.2 | cap, both |
| ST, B + staggered entry | 0.790, 0.947 | 0.869 | 24.0M | 7.2 | cap, both |

**Rules as applied:**
- ST against B: pronounced better (+0.135, threshold +0.10).
- B beats C1 (+0.286), and ST beats C1 (+0.421), both at 2.2× C1's tokens.
- Three-task means (stage A plus this task): ST 0.627, B 0.448, C1 0.378.
- Both predictions failed. B was expected to lose to C1 (it burns 24M in about 7 minutes), and ST was expected not to matter on a task with many files.

**From the transcripts** ([report](../experiments/reports/2026-10-04-round15b-traces-analysis.md), model output, key claims checked by hand):
- **C1 is bound by time, not tokens.** It called `done` with 3–5 minutes left on its clock, at about 11M of 24M, saying the change was incomplete. One agent writing one file ticks about 3 tasks a minute.
- **The swarm wins on coverage.** Capabilities at zero: C1 20–23 of 47, B 6–14, ST 1–8. Inside the covered capabilities, quality is 0.87–0.97 in every arm.
- **Swarm losses are modules nobody wrote or nobody wired in.** In one B run two agents yielded the same module to each other 1.2 s apart, and its six capabilities are exactly the run's six zeros. In an ST run, four modules written in the last 25 s before the cap were never connected to the main class.
- **Staggered entry gives a cleaner start.** In one B run seven agents claimed the core within 15 s. In the best ST run one agent claimed it at 10 s and the next entrant took the extensions. ST also had half the posts before 60 s and fewer duplicate whole-file writes. The overall post share is similar, and at k=2 the score gap is inside the run-to-run spread.
- **Where the swarm's tokens go:** cache reads are 94–95% of them, and each post is a full-context turn (20–28% of tokens). When the cap hit, the agents' clock still showed about 23 minutes left: nothing tells them about the shared token budget.

### Round 15, stage C: equal spend on volume, closed early (154.6M tokens, code `10e6f54`)

Stage B left a confound: C1 stopped on its 30-minute clock with 13M unspent. Stage C gave every run a 60-minute clock and a new default-off lever, `clockTokens`, which shows the tokens left in the shared budget on every tool result. Arms: C1T (one agent with the clock and the tokens line) and STT (ST plus the tokens line). Tasks: ospec_green_blind and ospec_brown_blind, 24M, k=2. The model quota ran out during C1T's second green run. The user then judged the tasks saturated and closed the stage, so C1T has k=1 (a declared deviation).

| arm | green | brown | mean | minutes |
|---|---:|---:|---:|---:|
| C1T, one agent, clock + tokens left | 0.985 (k=1) | 0.919 (k=1) | 0.952 | 43, 31 |
| STT, 12 agents, staggered entry + tokens left | 0.955 | 0.963 | 0.959 | ~8 |

**Rule as applied** (C1T at k=1): STT − C1T is −0.030 on green and +0.044 on brown, mean +0.007, so **not decided**. Every valid run ended on the 24M cap.

**From the transcripts** ([report](../experiments/reports/2026-10-04-round15c-traces-analysis.md), model output, key claims checked by hand):
- No agent mentioned the tokens line in any message or post.
- C1T worked at about C1's pace (8.5M at 25 minutes) but never called `done`. It ticked all 167 tasks at 37 minutes and then audited and patched until the cap. Whether the tokens line or the 60-minute clock did that cannot be separated.
- Both STT green runs had every module wired in, where stage B's ST runs had left 4 and 1 unwired.
- The strong runs lose their last points to interface and command-line mismatches, not to missing capabilities.

### Round 16: difficulty tasks at equal caps, threads at n=12, an "unlimited" clock, and DeepSWE calibration (stage A 72.7M, side test U 0.29M, stage D 19.7M tokens; code `b438df5`, `e5f402f`, `4833873`)

**Stage A.** On planning and shop2 at a shared 12M cap and 1200 s, with the tokens left visible to every agent: C1T (one agent with the clock and the tokens line), STT (12 equals, post-only board, staggered entry, the same lines) and STH (STT with a threaded board: `thread_new`, `thread_list`, `thread_read`, `reply`). k=2.

| arm | planning | shop2 | mean | tokens per run |
|---|---:|---:|---:|---:|
| C1T, one agent | 0.492 | 0.556 | 0.524 | 0.5M |
| STT, 12 agents, staggered, posts | 0.455 | 0.636 | 0.545 | 8.4M |
| STH, STT with threads | 0.476 | 0.464 | 0.470 | 9.2M |

**Rules as applied:** STT against C1T not decided (+0.021, below on planning, above on shop2). STH against C1T loses (−0.054, below on both). STH against STT: no pronounced difference.

**From the transcripts** ([report](../experiments/reports/2026-10-04-round16a-traces-analysis.md), model output, key claims checked by hand):
- From the report's version replay (not re-run by hand): a near-final deliverable existed within 1–2 minutes in 3 of 7 evaluable swarm runs (planning STT rep 0: 0.454 at 72 s, final 0.479 after 12M tokens). The graded file was the best, or tied-best, version in all 7, so later agents did not degrade the final.
- Spend per call is the same (~20k tokens), so 17× the tokens is 17× the calls: 566 against 35 in planning, with 94–124 reads of `planner.py` per STT run against 2–7 for C1T.
- An owner emerges by itself: 3–7 agents write the deliverable and 8–9 only review. Reviewers named the exact weakness the grader measures and left the fix to the owner.
- Planning loses points on hard constraints of the larger hidden instances, never on format. All validation used the one 16-session example; the hidden instances have 36–80 sessions.
- Scores follow the algorithm family of the first full solver (annealing or heavy local search ~0.60–0.65, backtracking 0.33–0.48) in every arm.
- Threads: one thread opened in the first minute collects most posts from 11–12 agents (two busy threads in one run). The board's share of calls rises from 29% to 46% with no fewer posts, and both shop2 STH runs left a crashing shared `solve.py` for 1.5–2 minutes.
- In 6 of 8 swarm runs most agents called `done` before the last edit of the deliverable, with near-identical "independently validated" reasons. No agent mentioned the tokens line or the clock.
- On shop2 the swarm's one quality gain was a portfolio: an agent benchmarked an independent heuristic and the owner kept it "only if lower" (0.42 → 0.63).

**Side test U.** The user asked whether one agent does better when the clock lines always say "unlimited". New default-off lever `clockUnlimited`. On shop2, k=2, 24M and 3720 s for every arm: C1T 0.000, CU (lines say unlimited) 0.000, C0 (no clock line) 0.130. No difference by the rule in any pair. CU stopped after 35–51 s, before C1T (115–130 s). All six agents wrote a 40–136-line solver and called `done`, and none mentioned the lines. The zeros are real: the solvers are worse than the grader's naive baseline, confirmed by a quiet regrade. What limits one agent here is its own judgement of when it is finished, not the budget it sees.

**Stage D (DeepSWE calibration).** C1T, one agent per task, four tasks in parallel (`isolated` arm), 48M shared and 90 minutes, k=2, partial credit (new tests' pass fraction × base tests' pass fraction). Means: termenv 1.000, fd 0.989, cattrs 0.972, expr 0.671. Every agent ended by itself, far below the cap. By the rule (exclude a task at ≥ 0.85) only expr stays, so the batch needs new tasks. fd r1 first scored 0 because cargo deleted the image's dev-dependency crates after a `cargo check` in the offline sidecar ([report](../experiments/reports/2026-10-04-deepswe-scorer-offline-fix.md)). The driver now disables that cleanup, and the saved diff rescores to 1.000.

### Round 17: a fresh-context audit, and the first DeepSWE batch (swarmtest 27.1M, DeepSWE screen 46.1M and batch 70.3M tokens; code `73ff3e7`, `497b6d9`, `37213a7`)

**Stage A, the audit.** Planning and shop2, 12M and 3720 s per run, k=3. Arms: C1T (one agent with the clock and the tokens line); C1TR (C1T plus `relay: 2`, so after each `done` a fresh instance takes the seat and is told to check the work against the spec); AUD (3 equals with a post-only board, entering one at a time by the new default-off lever `enterOnDone`, `revive: 3`, and one neutral briefing sentence telling late joiners to audit cold).

| arm | planning | shop2 | mean | tokens per run (planning, shop2) |
|---|---:|---:|---:|---|
| C1T | 0.475 | 0.000 | 0.238 | 1.07M, 0.18M |
| C1TR | 0.424 | 0.202 | 0.313 | 1.07M, 0.26M |
| AUD | 0.499 | 0.197 | 0.348 | 4.50M, 1.96M |

**Rules as applied:** AUD beats C1T (+0.110, above on both tasks). C1TR against C1T is not decided (+0.075, below on planning). AUD against C1TR is not decided (+0.035). A quiet regrade of all 18 final workspaces moved no run by more than 0.02.

**From the transcripts** ([report](../experiments/reports/2026-10-05-round17-traces-analysis.md), model output; counts checked by hand, version replay not re-run):
- Relays changed the graded final in 1 of 6 runs. Audits raised the author's first-`done` state by +0.047 on average. Both are smaller than the spread between runs.
- The shop2 margins came from first drafts: C1TR's 0.491 was reached by its first instance (its relays made 0 edits), and AUD's 0.592 run had 0.503 within a minute. One woken author used one auditor's finding (+0.07).
- Later contexts checked validity and timing. Two relays quoted a cost of 7.5× the naive level on the provided large instance and still called the work verified. Only 1 of 18 runs tested at the contract's production size.
- 53–87% of AUD's tokens went to revived turns. The relay handoff is only the previous `done` reason, and a relay fires only on `done`, so one run ended with 51 minutes and 11.5M left.

**Stage S, DeepSWE screen.** One C1T run on each of 12 new candidates (three batches of four in parallel, 48M and 90 minutes per batch). Four scored below 0.85: oxvg 0.000, scriggo 0.000, tengo 0.440 and wasmi 0.636. Both zeros were checked as real (the tests ran and failed on assertions).

**Stage E, DeepSWE batch.** expr, oxvg, scriggo, tengo and wasmi in one workspace, 32M shared and 120 minutes (stage D's rule), k=2, both arms of a repetition at the same time.

| task | STT, 12 agents | C1T, one agent | C1T isolated (stages D/S) |
|---|---:|---:|---:|
| expr | 0.335 | 0.063 | 0.671 |
| oxvg | 0.000 | 0.000 | 0.000 |
| scriggo | 0.372 | 0.000 | 0.000 |
| tengo | 0.901 | 0.027 | 0.440 |
| wasmi | 0.432 | 0.136 | 0.636 |
| mean | 0.408 | 0.045 | 0.349 |

**Rule as applied:** STT beats C1T (+0.363, above on 4 of 5). STT hit the cap after 12–14 minutes. C1T stopped after 14–19 minutes with 3.1M, saying in both repetitions that the goal was not met. Nobody changed oxvg. No batch reached a binary reward of 1. Coordination counts are in [`deepswe/traces17.md`](../experiments/deepswe/traces17.md).

### Round 18: ten DeepSWE tasks, the clock deciding, and a single agent told not to stop (375.5M tokens, $4.86; code `7eeeca4`, `3c02043`)

Ten repository tasks in one workspace (round 17 E's five, plus scc, participle, dasel, fastapi and cattrs, where the isolated agent scored 0.90–0.98 without the binary reward), 120 minutes, a 400M cap so that the clock decides, k=2, both arms at once. Arms: ST (`n12-stagger`, 12 equals with staggered entry, a post-only board, write guard and clock) and C1P (`solo-clock-persist`, one agent with write guard and clock, plus a system-prompt instruction to keep working until every change is implemented and verified, and not to stop because the work is large).

| task | ST, 12 agents | C1P, one agent told not to stop |
|---|---:|---:|
| expr | 0.443 | 0.000 |
| oxvg | 0.000 | 0.000 |
| scriggo | 0.486 | 0.000 |
| tengo | 0.857 | 0.000 |
| wasmi | 0.568 | 0.000 |
| scc | 0.855 | 0.000 |
| participle | 0.067 | 0.000 |
| dasel | 0.572 | 0.000 |
| fastapi | 0.860 | 0.081 |
| cattrs | 0.920 | 0.297 |
| mean (r0, r1) | 0.563 (0.455, 0.671) | 0.038 (0.076, 0.000) |
| tokens and cost (r0, r1) | 36.1M $0.60, 337.3M $4.21 | 2.0M $0.04, 0.05M $0.003 |

**Rule as applied:** ST beats C1P (+0.525, above on 9 of 10, oxvg tied at 0). As in round 17 E, the margin is the single agent stopping, and the instruction made it no longer: C1P called `done` after 13.9 minutes (cattrs and part of fastapi done) and, in the other repetition, after 1.3 minutes without running a single command, saying that "no project command can be run in this execution context". The same setup ran 49 commands in the first repetition, so this is the model's behaviour, not a fault. The swarm also stops on its own judgement: in r0 eleven agents called `done` by minute 23 and the twelfth stopped at 34, while in r1 two agents never called it and the run used the whole clock. r1 has the first two binary rewards on DeepSWE in this project (tengo and wasmi).

**From the transcripts** ([report](../experiments/reports/2026-10-05-round18-19-traces-analysis.md), model output; key claims checked by hand): agents called `done` when their own repository was finished or owned by someone else, often admitting it was partial, and a `done` agent is never woken. In r0 nobody took over an abandoned repository. In r1 five agents kept offering help and took the abandoned ones late: nobody edited expr until minute 91.5, and its 0.886 was built in the last 29 minutes. So the swarm's working time, and much of its score, depends on how many agents refuse to stop. Coordination counts are in [`deepswe/traces18.md`](../experiments/deepswe/traces18.md).

### Round 19: how the team shares state, stopped by the model quota (100.7M tokens, $1.84, of which 25.5M invalid; code `3c02043`)

Six 12-agent arms on round 17 E's five tasks at 32M and 120 minutes, differing only in how the team shares state: ST (the control), ST-tail (each teammate's latest post on every tool result), ST-file (no board; a shared `TEAM.md` added to each agent's first prompt), ST-threads (threaded board), ST-norms (a fuller board briefing) and ST-tasks (a shared task list). Only the first wave of repetition 0 is valid; the second wave hit the model's usage limit 16 minutes in. **No rule is applied** (k=1, half the arms missing).

| task | ST | ST-tail | ST-file |
|---|---:|---:|---:|
| expr | 0.038 | 1.000 | 0.342 |
| oxvg | 0.000 | 0.000 | 0.000 |
| scriggo | 0.000 | 0.000 | 0.000 |
| tengo | 0.945 | 0.011 | 0.692 |
| wasmi | 0.773 | 0.364 | 0.134 |
| mean | 0.351 | 0.275 | 0.234 |
| tokens, cost, end | 32.1M, $0.53, cap | 32.0M, $0.52, cap | 11.0M, $0.23, quiescent at 28 min |

On these five tasks the ST control alone has now scored 0.170, 0.351 and 0.772, so one repetition orders nothing. ST-tail's oxvg zero is a diff that the cap cut mid-edit, so it does not compile. No agent mentions the tail. ST-file's agents edited `TEAM.md` 87 times (35 edits failed on stale text) and stopped with two thirds of the budget unspent, saying the rest was "in progress with teammates"; with no board, nothing woke them. Counts, including the invalid batches' mechanism use, are in [`deepswe/traces19.md`](../experiments/deepswe/traces19.md).

### Round 20: making the team's state visible (256.2M tokens, $4.11; code `ed4fb54`)

A diagnosis of all 54 twelve-agent runs ([report](../experiments/reports/2026-10-05-swarm-communication-diagnosis.md), model output; key claims checked by hand) found that the board carries claims, not state: a `done` is invisible to teammates, so they keep addressing agents who left and leave their work unowned; `done` is read as "my part is done"; and retracted or orphaned claims keep counting. Delivery speed is not the problem. Round 20 tested two new default-off levers on round 17 E's five tasks at 32M, k=2: `departureNotice` (murmur posts once when an agent calls `done`, with its reason and the folders it changed, and `done`'s description says it means leaving for good) and `teamStatus` (every tool result ends with each teammate's state and each folder's last write/edit).

| | ST (control) | ST-depart (notices) | ST-status (notices and status line) | ST-tasks (task list) |
|---|---:|---:|---:|---:|
| five-task mean (r0, r1) | 0.365 (0.468, 0.262) | 0.303 (0.189, 0.417) | 0.288 (0.268, 0.309) | 0.341 (0.326, 0.355) |
| rule against ST | | not decided (−0.062, below on 1 of 5) | **worse** (−0.076, below on 3 of 5) | not decided (−0.024) |
| posts addressed to departed agents | 14 | 0 | 0 | 5 |
| untouched repositories at the end | 3 | 0 | 0 | 0 |
| write/edit calls (r0, r1) | 143, 109 | | 80, 78 | |

**From the transcripts** ([report](../experiments/reports/2026-10-06-round20-traces-analysis.md), model output; key claims checked by hand): the notices work as communication. Agents read them as ownership facts and take over the leaver's work within minutes (tern on Tengo, four agents on oxvg, which gave the first non-zero oxvg score in the project), where in ST an agent waited ten minutes for a "handoff" from someone who had left. They do not change *when* agents leave: the new `done` text did not stop agents from calling `done` while saying the goal is not complete (13 of 16 cases), and one abandoned repository went untouched because nobody was free. The status line is never quoted, makes every call larger, and came with 37% fewer edits at the same cap, which fits its lower score. Every batch ended at the 32M cap in 12–20 minutes. Two runs failed on a model API outage and were rerun. Counts are in [`deepswe/traces20.md`](../experiments/deepswe/traces20.md).

### Round 21: three rival teams that can read each other's work (50.9M tokens, $0.82; code `46f2aff`)

The user's design: three teams of three (the base profile `n12-base` inside each team), each with its own copy of round 17 E's five tasks and 8M tokens, told that their objective is to finish above the other two teams, that they can read the rivals' repositories read-only at `/rivals/<team>/<project>`, and, falsely, that the rivals cannot see their work. Against one agent with the clock (`solo-clock`, 8M), run after the teams. k=2, so a screen with no verdict.

| | team1 | team2 | team3 | teams mean | solo |
|---|---:|---:|---:|---:|---:|
| five-task mean r0 | 0.073 | 0.188 | 0.252 | | 0.029 |
| five-task mean r1 | 0.294 | 0.183 | 0.025 | | 0.000 |
| mean over both | | | | **0.169** | **0.015** |
| minutes (r0, r1) | 15.2, 22.1 | 26.6, 16.6 | 11.6, 24.7 | | 17.1, 3.2 |

**Rule as written:** +0.154, higher on 4 of 5 tasks (scriggo 0 for everyone): the teams are above, as a screen. The best team of each repetition, chosen by the grader after the fact, averages 0.273. Every team ended at its 8M cap; the single agent quit after 1.5M and 1.1M of its 8M, saying the work was unfinished, and a solo `done` ends the run while one team member's does not. The margin is therefore mostly stopping, as in rounds 17 E and 18.

**Use of the rivals' work** ([`deepswe/traces21.md`](../experiments/deepswe/traces21.md), from `deepswe/rivals.py`): 78 tool calls touched `/rivals` (about 5% of the teams' calls), 37 of them in the first 3 minutes and mostly listings or modification-time queries; 14 of 18 agents made at least one. Two files were copied whole (team3 took team1's Scriggo AST changes in r1; scriggo scored 0) and three partial adoptions are traced in the transcripts. Only one adopter scored above its source (r0 team2's oxvg, 0.5 against team1's 0.0, after a written critique of team1's patch). The two best results, oxvg 0.667 and tengo 0.835, were the teams' own work.

**From the transcripts** ([report](../experiments/reports/2026-10-06-round21-transcripts.md), model output; key claims checked by hand): no agent doubts or tests the "unseen" claim, hides work or looks for its own team under `/rivals`; reasoning is recorded only as short titles, so belief and indifference cannot be told apart. No post or `done` reason restates the aim of beating the others. Leaving is unchanged: all six `done` calls by team members say the work is incomplete and none mentions the rivals. In teams of three, the default briefing "Teammates: finch, robin, equals working on the same goal" is read as a fourth teammate called "equals" (17 posts in 3 of 6 teams; none in round 20's 12-agent runs).

### Round 30: an integrate item per project, stubs before tests, no idle marks (160.1M tokens, $2.54; code `3e23e34`)

The user approved three changes after round 29 and asked for a review of the existing levers first. The review found no lever that fits the remaining failures (in `experiments/plan.md`), and `taskAssign` was left for a later round. **TI** (`n12-roles9-integrate`) is TF with three changes:
- **An integrate item:** each project gets a last item, "integrate: make every end-to-end test of <project> pass", for wiring the layers together. The integrator role starts by taking it.
- **Stubs:** a new function, type or method the tests call may be written first as a stub, with a body that returns an error, so that the tests compile and fail.
- **No idle marks:** `taskIdleMinutes` is off.

| | expr | oxvg | scriggo | tengo | wasmi | five-task mean (runs) | write/edit per run |
|---|---:|---:|---:|---:|---:|---|---|
| baseline | 0.420 | 0 | 0.150 | 0.749 | 0.464 | **0.357** (0.19–0.52) | 125–165 |
| TF (round 29) | 0.602 | 0.100 | 0.171 | 0.877 | 0.445 | **0.439** (0.31–0.62) | 106–139 |
| TI | 0.468 | 0 | 0.321 | 0.881 | 0.500 | **0.434** (0.34–0.56), p = 0.32 | 104–156 |

Rule as written: not decided against the baseline (Δ +0.077, interval [−0.051, +0.204], higher on 4 of 5 tasks, oxvg tied at 0). Against TF, descriptive: −0.005, p = 0.94.

**From the transcripts** ([report](../experiments/reports/2026-10-08-round30-transcripts.md), model output; key claims checked by hand, two corrected; counts in [`deepswe/traces30.md`](../experiments/deepswe/traces30.md)):
- **The integrate item rarely took hold.**
  - **Where:** it was added in 8 of 25 projects, and never in wasmi or in r1.
  - **What happened to it:** 6 were taken, at 4.8–10.4 minutes, and 4 were marked done.
  - **What holders did:** they mostly built a layer rather than wiring the ones there. In scriggo r4, the holder edited checker types while the selector path stayed unwired.
  - **The integrator role** was chosen once in 50 role calls.
- **Stubs were not used.** Wasmi's new API was again written before its tests were done in 4 of 5 runs, as real code this time. A stub was mentioned once.
- **Tests still came first:**
  - the first write was a test in 23 of 25 projects;
  - tests had several writers in 17 of 25;
  - the first implementation came at a median 4.3 minutes and 2.8M tokens, as in TF.
- **Scores follow layer coverage.**
  - **Expr** scored 1.0 and 0.936 where separate agents built the compiler and the VM. It scored 0 where no one touched the compiler.
  - **Scriggo** scored 0.75 and 0.854 where the emitter was edited, and 0 elsewhere.
  - **A panic in expr r1 and r4:** one nil-node panic took 62 of 79 hidden tests with it, because it killed the whole Go package.
- **Oxvg was starved by build time.**
  - Implementation began at 8.5–9.5 minutes, or never (r3, r4).
  - Cargo calls after it waited on the build lock behind a cold build of about 6.5 minutes, and the 32M cap ended them first. In r0 and r2 the final library does not compile, and the team never saw it.
  - The subagent had read these "Command aborted" results as interruptions by posts. All of them occur at the run's final budget abort.

### Round 29: end-to-end tests before implementation, build items per layer, idle-holder marks (160.1M tokens, $2.59; code `9b74367`)

The user's design after round 28. They chose the strict variant (no implementation code until a project's test items are done) and an organic start: whoever finds a project without tests writes them, nobody is designated. They also asked whether to stagger more; the answer was no, because entry already spans 6–9 of 13 minutes. **TF** (`n12-roles9-tests`) is RP plus four changes:
- test items per requirement, written first;
- build items per layer, each naming the tests it makes pass;
- placement rules for the tests (the existing entry point, their own package, outside the project until they can compile);
- the new default-off lever `taskIdleMinutes: 3`, under which `tasks` marks a holder with no write/edit since taking an item.

| | expr | oxvg | scriggo | tengo | wasmi | five-task mean (runs) | write/edit per run |
|---|---:|---:|---:|---:|---:|---|---|
| baseline | 0.420 | 0 | 0.150 | 0.749 | 0.464 | **0.357** (0.19–0.52) | 125–165 |
| RP (round 28) | 0.524 | 0 | 0.150 | 0.866 | 0.573 | **0.422** (0.28–0.52) | 118–152 |
| TF | 0.602 | 0.100 | 0.171 | 0.877 | 0.445 | **0.439** (0.31–0.62), p = 0.38 | 108–141 |

Rule as written: not decided against the baseline (Δ +0.082, interval [−0.069, +0.234], higher on 4 of 5 tasks). Against RP, descriptive: +0.017, p = 0.83.

**From the transcripts** ([report](../experiments/reports/2026-10-08-round29-transcripts.md), model output; key claims checked by hand; counts in [`deepswe/traces29.md`](../experiments/deepswe/traces29.md)):
- **Tests came first.** The first write in a project was a test in 24 of 25 cases. The tests had two to four writers in 16 of 25, but usually sat under one test item rather than one per requirement.
- **The strict rule was kept where tests could compile.** Implementation started before every test item was done in 9 of 25 projects: wasmi in all five runs, because its tests need the new API, plus oxvg r3/r4 and expr r1/r2.
- **Waiting cost most on Rust.** Before a project's first implementation write, 0.6–5.2M tokens went by for expr, scriggo, tengo and wasmi, and 9.9–12M for oxvg. Oxvg got no implementation at all in r0–r2, where cold builds of about 6.5 minutes and cargo lock contention held it back.
- **Oxvg r3 (0.5), the first non-zero.** A late entrant read a teammate's end-to-end test and changed the selector visitor as well as `collapse_groups.rs`. The still-failing hidden tests include a job no run's tests covered.
- **Split layers with no integrator failed.** Scriggo scored 0.854 in r0, where one agent built every layer, and 0 in r1–r4, where the layers were split. Expr r1 (0.342) never lowered `TryNode` in the compiler, and expr r4 (0.063) had one holder who wrote only the builtins.
- **Late breaks remain.** Wasmi r0 and oxvg r4 ended with builds broken by implementation files, not tests.
- **Idle marks were not acted on.** They appeared 37 times on 5 items. No one joined or dropped a marked item, and no post mentions one.

### Round 28: parts read from the code, a weight guide and a slower stagger (160.2M tokens, $2.61; code `e1d84cf`)

The design agreed with the user after round 27, against the round 23 baseline at k=5. **RP** (`n12-roles9-parts`) is RW with profile changes only. The stagger is `spawnAfterTurns: 15`, with `spawnGapSeconds: 60` as the ceiling. A weight guide by bands appears in the team sentence and in `task_add`'s description. The user rejected a rule that a project's parts add up to 10, so that any bug found on the way can still be added. The first agent on a project reads the code the change touches before adding its parts. Three working rules: take an item only when you start it now and say on the board which part you write; drop what you hold before moving on; build after finishing a change and fix or undo a break first. The stagger was sized from round 27's events, where the first item came at turn 3–6 and the first write at turn 12–31, and from a simulation of the run length.

| | expr | oxvg | scriggo | tengo | wasmi | five-task mean (runs) | write/edit per run | weights 1–3 / 4–7 / 8–10 |
|---|---:|---:|---:|---:|---:|---|---|---|
| baseline | 0.420 | 0 | 0.150 | 0.749 | 0.464 | **0.357** (0.19–0.52) | 125–165 | — |
| RW (round 27) | 0.369 | 0 | 0.093 | 0.886 | 0.409 | **0.351** (0.19–0.44) | 104–183 | 7 / 31 / 59 |
| RP | 0.524 | 0 | 0.150 | 0.866 | 0.573 | **0.422** (0.28–0.52), p = 0.39 | 118–152 | 25 / 66 / 8 |

Rule as written: not decided against the baseline (Δ +0.066, interval [−0.069, +0.198], higher on 3 of 5 tasks, lower on none). Against RW, descriptive: +0.071, p = 0.25.

**From the transcripts** ([report](../experiments/reports/2026-10-08-round28-transcripts.md), model output; key claims checked by hand, one corrected; counts in [`deepswe/traces28.md`](../experiments/deepswe/traces28.md)):
- **The stagger worked.** The 12 agents entered 22–60 seconds apart, over 6.4–8.7 minutes. Projects decomposed by two or more agents at once fell from 11 to 6 of 25. Agents 11 and 12 used 0.1–2.6M tokens each, against 0.8–5.8M for the first two.
- **The first adder took a short look, not a deep read.** It looked at the repository first in 21 of 23 project-runs, but made three or more calls there in only 10.
- **Splitting stayed rare.** In 12 of 25 cases a project still got one item for all of it (RW 17), though mostly at a middle weight.
- **Weights followed the guide.** Bugs found along the way went on the list at low and middle weights: 52 items were added after their project's first write, one of them at 8–10.
- **Holding:** takers posted which part they were writing (105 of 113 takes). Holders who never edited the item's project fell from 30 to 13 of 104. The rule to drop before moving on changed nothing (33 takes while holding another item, as in RW).
- **The spread came mostly from expr r1 (0).** finch built the builtins only. A later end-to-end item was taken by an agent who never edited expr. The syntax layer was first edited at 13.9 of 14 minutes, and the run ended with `ast` not compiling.
- **Zeros elsewhere:** wasmi r4 (0) ended with its library tests not compiling (`module coredump is private`). Scriggo r0–r3 (0) failed 50 of 53 hidden tests, with parsing and type checking done but the emitter and runtime wiring thin.
- **Oxvg stays at 0 in every arm.** 1–2 agents changed one optimiser job and passed the repository's 59 existing tests, while the same 6 of 10 hidden tests failed every time. The agents read the change narrowly and check it only against existing tests. The subagent suggests (model reading, not tested) one end-to-end example per requirement before calling a project finished.

### Round 27: a weighted, shared task list, building from the heaviest item (160.2M tokens, $2.67; code `7e54b16`)

The design agreed with the user after round 26, against the round 23 baseline at k=5. Two new default-off levers: `taskWeights` (`task_add` requires a weight from 1 to 10 for how much of the goal the item covers; `tasks` lists unfinished items heaviest first) and `taskShared` (`task_take` on an item a teammate holds joins its holders). **RW** (`n12-roles9-weights`) is RT with both, plus two prompt changes: the first agent on a project adds its parts with weights before writing code, and the builder takes the heaviest unfinished item even if teammates hold it, splitting it with them.

| | expr | oxvg | scriggo | tengo | wasmi | five-task mean (runs) | write/edit per run | task items per run |
|---|---:|---:|---:|---:|---:|---|---|---|
| baseline | 0.420 | 0 | 0.150 | 0.749 | 0.464 | **0.357** (0.19–0.52) | 125–165 | — |
| RT (round 26) | 0.352 | 0 | 0.140 | 0.752 | 0.218 | **0.292** (0.09–0.44) | 119–150 | 4–12 |
| RW | 0.369 | 0 | 0.093 | 0.886 | 0.409 | **0.351** (0.19–0.44), p = 0.91 | 104–183 | 16–25 |

Rule as written: not decided against the baseline (Δ −0.005, interval [−0.138, +0.122], lower on 3 of 5 tasks). Against RT, descriptive: +0.059, p = 0.43.

**From the transcripts** ([report](../experiments/reports/2026-10-08-round27-transcripts.md), model output; key claims checked by hand; counts in [`deepswe/traces27.md`](../experiments/deepswe/traces27.md)): every project got an item before its first edit, but in 17 of 25 cases the first agent added the whole project as one item, mostly at weight 10; weights separated building (8.8 on average) from tests and fixes (about 6), not hard parts from easy ones. Heavy items were taken within seconds, half of them by their author. Joining a held item worked when the holders split it by layer on the board in the first minute (tengo r4, wasmi r2); in 9 of 24 shared items a sharer never touched the project, and in expr r0 three agents split the work by layer and left the checker to nobody (0.025). In expr r2 two agents each deferred to the other and nobody edited expr (0); in r3 a single writer covered every layer (0.759). All 12 agents entered within 0.7 minutes, because `spawnAfterTurns: 2` lets the next agent in after two short model turns, so whole-project items were added twice in four runs.

### Round 26: roles that mostly build, with the task list as the channel for findings (160.1M tokens, $2.63; code `f602660`)

The user's idea after round 25, against the round 23 baseline at k=5. **RT** (`n12-roles9-tasks`) changes R three ways at once: the team sentence says most of the team should be building and to take builder unless a concrete need for another role is visible; the builder joins the hardest unfinished part of a project, splitting it by file or function with whoever is on it, instead of taking another part; and whoever finds something concrete to do adds it to the shared task list (empty at start, no assignment), from which builders and fixers take items. No budget clock.

| | expr | oxvg | scriggo | tengo | wasmi | five-task mean (runs) | write/edit per run | builder share of calls |
|---|---:|---:|---:|---:|---:|---|---|---|
| baseline | 0.420 | 0 | 0.150 | 0.749 | 0.464 | **0.357** (0.19–0.52) | 125–165 | — |
| R (round 25) | 0.086 | 0 | 0.146 | 0.609 | 0.364 | **0.241** (0.09–0.40) | 82–125 | 39–54% |
| RT | 0.352 | 0 | 0.140 | 0.752 | 0.218 | **0.292** (0.09–0.44), p = 0.44 | 119–150 | 48–79% |

Rule as written: not decided against the baseline (Δ −0.064, interval [−0.214, +0.078], lower on 3 of 5 tasks). Against R, descriptive: +0.051, p = 0.52.

**From the transcripts** ([report](../experiments/reports/2026-10-08-round26-transcripts.md), model output; key claims checked by hand; counts in [`deepswe/traces26.md`](../experiments/deepswe/traces26.md)): building by default worked, and nobody called `done`. The task list got 44 items in five runs; 18 were reproducible defects, which were taken within about a minute and fixed, and the rest were plans and status lines moved from the board. The hard gaps sat on the list for about 11 minutes (expr's block try/catch in r3, wasmi's empty dump in r4). Builders joined expr's core early in one run only (r0, five agents split by layer within 2.4 minutes, 0.81); elsewhere the second writer came after 8–16 minutes, and in r1 a self-claimed item scoped expr to the builtins and a teammate read it as ownership (0.06). Wasmi lost r0 to four agents writing the same accessor into `state.rs` within a minute after one open request (duplicate definitions), and r2 to one edit at the cap with a missing import.

### Round 25: roles without owners, and a clock that counts the budget (285.1M tokens, $4.53; code `7f6d59e`)

The user's design, against the round 23 baseline at k=5 each. **R**: a team sentence saying nobody owns a project and anyone may work on any of them, and a nine-role menu (builder, researcher, reviewer, verifier, tester, integrator, fixer, scout, finisher) taken on entry with `role(name)` and switched "instead of calling done". **RC**: R plus `clockEffective`, a clock line that shows the minutes until the token budget runs out at the current pace when that comes before the timeout.

| | expr | oxvg | scriggo | tengo | wasmi | five-task mean (runs) | `done` per run | write/edit per run |
|---|---:|---:|---:|---:|---:|---|---|---|
| baseline | 0.420 | 0 | 0.150 | 0.749 | 0.464 | **0.357** (0.19–0.52) | 3–7 | 125–165 |
| R | 0.086 | 0 | 0.146 | 0.609 | 0.364 | **0.241** (0.09–0.40), p = 0.20 | 0–1 | 82–125 |
| RC | 0.076 | 0.133 | 0 | 0.375 | 0.364 | **0.190** (0.09–0.27), p = 0.071 | 11–12 | 53–84 |

**From the transcripts** ([report](../experiments/reports/2026-10-08-round25-transcripts.md), model output; key claims checked by hand; counts in [`deepswe/traces25.md`](../experiments/deepswe/traces25.md)): the roles did what was asked about leaving, since nobody idled and the few `done` calls were followed by another role, but builders were half of the calls and the rest went to review, verification, scouting and tests, much of it status posts and full test runs on unfinished code. Ownership re-formed in the first minute anyway, and on expr the single agent built the easy slice and switched to reviewer, leaving the core unimplemented in 8 of 10 runs. Some non-building work paid off: a scout-to-builder chain gave oxvg 0.667 in one RC run. With the budget clock, agents read the countdown, switched together to wrap-up, which burned the budget faster and shortened the countdown further, and called `done` with budget left; the estimate itself is noisy.

### Round 24: calling departed agents back (320.4M tokens, $5.03; code `cd5cfde`, then `3e52e3e`)

Two default-off levers from the user, each at k=5 against the round 23 baseline: **M** (`reviveOnMention`: a post mentioning `@name` or `@all` wakes an agent that called `done`, every time; the departure notice says so) and **MT** (M plus the shared task list with `taskAssign`: `task_add` for a teammate and `task_assign`, the teammate told and woken if it had left).

| | expr | oxvg | scriggo | tengo | wasmi | five-task mean (runs) |
|---|---:|---:|---:|---:|---:|---|
| baseline | 0.420 | 0 | 0.150 | 0.749 | 0.464 | **0.357** (0.19–0.52) |
| M | 0.658 | 0 | 0.278 | 0.879 | 0.355 | **0.434** (0.17–0.64), p = 0.46, not decided |
| MT | 0.542 | 0 | 0 | 0.818 | 0.491 | **0.370** (0.29–0.50), p = 0.85, not decided |

**From the transcripts** ([report](../experiments/reports/2026-10-07-round24-transcripts.md), model output; key claims checked by hand; counts in [`deepswe/traces24.md`](../experiments/deepswe/traces24.md)): revivals were 5 in M and 8 in MT, nearly every mention of a departed agent revived it, and revived agents worked (one, called back to "rejoin" on expr, built the parser of a run that scored expr 1.0). But only 8 of 174 mentions went to agents who had left: teammates take over a leaver's repository instead of calling it back. `@all` was used once and woke four agents who offered the same slice. Agents still leave within minutes when every repository has an owner, so the levers do not reach the early departures. With the task list, the first agent in writes a five-item plan and hands it out within half a minute; few items are finished (7 of 43), and no hand-over went to a departed agent. The code changed mid-round (the `done` result no longer carries unread posts); no revival was lost to the old behaviour.

### Round 23: the fixed baseline (160.3M tokens, $2.52; code `0b0e12c`)

The user asked for one reference to compare everything against instead of rerunning a control each round. After the tool descriptions and the briefing corrections became defaults (commit `03aa568`), one swarm of 12 (`n12-base-peers`, equal to the defaults) ran the five-task DeepSWE batch at 32M, five times.

| | expr | oxvg | scriggo | tengo | wasmi | five-task mean |
|---|---:|---:|---:|---:|---:|---:|
| mean of 5 | 0.420 | 0 | 0.150 | 0.749 | 0.464 | **0.357** |
| sd | 0.316 | 0 | 0.335 | 0.336 | 0.266 | 0.135 |

All runs ended at the cap in 13–25 minutes. One run scored scriggo 0.75, the first non-zero scriggo score in the project. The best run had 6 of its 7 `done` calls by minute 5, so early departures did not track the score here. A later arm is compared with these per-task means by the usual rule; the baseline is rerun only when the defaults, the model, the tasks or the batch setup change (default-off levers do not count). Counts are in [`deepswe/traces23.md`](../experiments/deepswe/traces23.md).

### Round 22: three rival teams of four sharing 32M against one swarm of 12 (112.5M tokens, $1.85, of which 16.2M invalid; code `aca4e9b`)

The user's design: the same 12 agents and 32M split into three rival teams of four (round 21's rivalry text and readable `/rivals`, one token pool shared by the three teams through a new optional run option `sharedBudget`), against one swarm of 12 with 32M. Both arms use `n12-base-peers`, the base profile with the briefing's "equals" sentence fixed. Planned k=3; the model quota stopped the second teams batch, and the user closed the round with three valid batches.

| | expr | oxvg | scriggo | tengo | wasmi | mean |
|---|---:|---:|---:|---:|---:|---:|
| teams r0 (mean of 3 teams: 0.357, 0.276, 0.085) | 0.050 | 0.167 | 0 | 0.571 | 0.409 | **0.239** |
| swarm (mean of r0 0.320, r1 0.285) | 0.032 | 0 | 0 | 0.890 | 0.591 | **0.303** |

No rule is applied (k=1 for the teams). The rule's arithmetic would give −0.063 with 2 tasks each way, i.e. not decided even at k=3. The pool bound: all teams stopped together at 13.9 minutes, with 12.7M, 12.9M and 6.6M spent.

**From the transcripts** ([report](../experiments/reports/2026-10-06-round22-transcripts.md), model output; key claims checked by hand; counts in [`deepswe/traces22.md`](../experiments/deepswe/traces22.md)): the worst team (0.085) lost three of four agents by minute 11, one of them at minute 1 with no edit, and left Tengo untouched although a rival's Tengo was readable. Where an agent quit in the first two minutes its repository scored 0. The swarm's wasmi edge came from splitting the change across 3–4 agents. Teams copied one test file whole and adopted one rival's Tengo design within a minute of reading it; the rivalry was never restated or doubted, and no agent waited for "equals".

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
| The swarm beats a same-prompt single agent | criba 1, 5A, 6B, 9, 10 | **Not supported**, now also where the clock agent has headroom: it loses on volume (V, −0.16; a threaded variant does no better) and is not decided on difficulty (D, −0.004 at 4x tokens). In round 10 it beats only a single agent that stops early; the plain clock agent in the same campaigns matches it on packing2 |
| Smaller contexts let a swarm cover a large project on the same tokens | 9 (V), 15 B | **Refuted as built in round 9; in round 15 B, 12 agents at 24M cover far more of a large project than one agent, but the single agent there is time-bound and spent less than half the cap**. Round 9: contexts were 2–3x smaller, but more calls, board turns and duplicated spec reading consumed the saving |
| Parallel attempts escape a bimodal single agent | 9, 10 (D) | **Supported only with a predictive selection signal**, and only against a single agent that stops early: on packing2 n=2 reached the good mode 3 of 3, but the plain clock agent in round 10's S3 campaigns matched n=3 (0.719 vs 0.679). Without a size-aware number, selection picks a solver that does not scale |
| A text norm makes the single agent use a printed quality score | 10A | **Refuted**: C1s still ends on the first green at a low score (5 of 9 packing2 runs within 3 minutes); C1s − C1 = −0.20 on the signal tasks |
| Larger swarms do better at the same tokens | 10 (size) | **Not supported at 3M** (descriptive, each n against its own C1s, k=3): n=2 0.69 > n=3 0.58 > n=10 0.50 on the signal tasks; rule verdicts not decided / adds / not decided; n=10 hits the cap after one draft per agent |
| A 12-agent swarm beats one agent with the clock at equal caps, **without an oracle** | 15 A, 15 B, 15 C, 16 A | **On difficulty at equal caps (16 A), not decided:** STT +0.021 over C1T at 17× the spend, and a threaded board loses. **On volume, only at unequal spend:** at equal spend (15 C) the swarm ties one agent at the ceiling (+0.007, C1T k=1) and is 4–6× faster. **Earlier, at unequal spend:** on ospec (B) both B (+0.29) and ST (+0.42) win at 2.2× tokens and a quarter of the wall time, by covering more of the spec; C1 is time-bound there and spends half the cap. On planning and shop2 (A) the base swarm is not decided (−0.04); required branches (+0.19) and staggered entry (+0.16) win at 23–27× the tokens, k=2 |
| Staggered entry lets a structure form that later agents join | 15 A, 15 B | **Supported as a mechanism on planning and ospec** (planning: 1.5 full writers against 5.0; ospec: 1–2 core claimants against 7–8, half the early posts); pronounced better than B on both stages by the rule (+0.20, +0.135), but each verdict sits inside k=2 noise (A's is carried by shop2) |
| A shared task list cuts duplicated work | 15 A | **Not supported as used**: agents barely used it (1–3 items per run). Pronounced worse by the rule, but its zeros on shop2 come from a failure B shares |
| A branch per agent with merges protects shared work | 15 A | **Mixed**: required branches beat C1 and tie B on planning; optional branches loses (a broken planner merged at the cap). One mechanism bug fixed |
| Roles chosen from a menu with sub-prompts, at n=12 | 15 A | **Not pronounced** (+0.09 against B); agents pick before reading, mostly builder |
| Showing the tokens left keeps agents spending the budget | 15 C, 16 A | **Not separable on volume, not supported on difficulty**: C1T spent the whole 24M where C1 stopped at 11M, but its clock was also 60 minutes instead of 30. On planning and shop2 (16 A) C1T still stops at 0.06–1.2M of 12M. No agent mentioned the tokens line in any run |
| Telling one agent its time and tokens are unlimited makes it work longer | 16 U | **Not supported** (one task, k=2): it stopped after 35–51 s, sooner than C1T (115–130 s), with no difference in score |
| A fresh-context audit before the end raises quality, **without an oracle** | 17 A | **Supported by the rule for AUD against C1T (+0.110), but weakly**: it is shop2-led, relays are not decided against either arm, and the transcripts put the audit's own effect at about +0.05, near the relays' |
| Coordination adds over fresh context alone (AUD against relays) | 17 A | **Not decided** (+0.035); one woken author used one auditor's finding |
| A swarm covers a batch of real repository tasks better than one agent with the same budget | 17 E, 18 | **Supported by the rule twice, both times mostly because the single agent gave up.** 17 E: +0.363, the single agent stopped at 14–19 minutes with 90% of the budget left; against the same agent on isolated tasks the swarm is +0.06 (descriptive). 18 (ten tasks, the clock deciding): +0.525, 9 of 10, against an agent that stopped at 13.9 and 1.3 minutes. The swarm's own two repetitions differ by 0.22, because in one of them every agent stopped by minute 34 |
| An instruction to keep working until everything is done makes one agent persist | 18 | **Not supported** (k=2, one batch of ten tasks): with the instruction in its system prompt, the agent stopped after 13.9 and 1.3 minutes, sooner than round 17's agent without it (14–19); in the second run it ran no command at all, claiming none could run |
| How 12 agents share state (a board tail, a shared file, threads, fuller board norms, a task list) changes what they achieve | 19 | **Not tested yet**: the model quota stopped the round after one repetition of three arms (ST 0.351, ST-tail 0.275, ST-file 0.234, inside the control's own spread of 0.17–0.77). ST-file spent a third of its budget and stopped |
| Silent departures orphan work, and a notice from murmur when an agent leaves fixes it | diagnosis, 20 | **Supported on the mechanism, not on the score**: posts addressed to departed agents 14 → 0, untouched repositories 3 → 0, take-overs within minutes of a notice; ST-depart's score is not decided (−0.062, k=2) |
| Telling agents that `done` means leaving for good, only when the whole goal is met, delays `done` | 20 | **Not supported**: 13 of 16 `done` calls under the new text say the goal is not complete; first `done` times unchanged (1.3–2.3 min) |
| A team status line on every tool result helps 12 agents coordinate | 20 | **Refuted as built**: worse by the rule (−0.076); never quoted; larger calls and 37% fewer edits at the same cap |
| Rival teams told to beat each other, who can read the rivals' work, do better than one agent | 21 | **Above as a screen** (+0.154, 4 of 5, k=2, no verdict); the margin is mostly the single agent quitting at 3–17 minutes |
| Agents use visible rival work (copy, adapt, judge) when told to beat the rivals | 21 | **Weakly**: 78 calls on `/rivals`, mostly early listings; 2 files copied whole and 3 partial adoptions, one of which scored above its source |
| Weights on task items and shared holding let builders find and gang up on the heaviest work | 27 | **Not decided** (−0.005 against the baseline, p = 0.91; +0.059 against RT): weights inflated (70 of 97 items ≥7) and track building vs repair, not difficulty; early joins split by layer helped, late or nominal ones did not |
| Reading the code before decomposing, a weight guide and a slower stagger turn the task list into parts that builders share | 28 | **Not decided** (+0.066 against the baseline, p = 0.39; +0.071 against RW): stagger and weights worked as designed (duplicate decompositions 11 → 6 of 25; 8 of 99 items at 8–10); splitting before building stayed rare; one unbuilt expr core decided the spread |
| Writing end-to-end tests before implementing makes the swarm build what the description asks | 29 | **Not decided** (+0.082 against the baseline, p = 0.38; +0.017 against RP): tests came first in 24 of 25 projects and oxvg scored for the first time (one run); waiting starved the Rust projects, and split layers without an integrator failed (scriggo r1–r4) |
| An integrate item per project and stubs let a swarm that splits a change into layers wire them together | 30 | **Not decided** (+0.077 against the baseline, p = 0.32; −0.005 against TF): integrate items appeared in 8 of 25 projects and their holders mostly built layers; stubs were not used; scores still follow whether every layer was built |
| Roles that build by default, joining the hardest part, with findings on the task list, help 12 agents | 26 | **Not decided** (−0.064 against the baseline, p = 0.44; +0.051 against R): building and expr recover from R; the list carries small defects, not hard gaps; ganging up on the hard part happened in 1 of 5 runs and once broke a build |
| Telling agents nobody owns a project and offering a menu of roles keeps them working and helps | 25 | **Not decided, lower** (−0.116, p = 0.20): early departures end (0–1 `done` per run), but a quarter fewer edits and expr 0.42 → 0.08; ownership re-forms anyway |
| A clock that counts down to the end of the budget helps the team use it | 25 | **Not decided, lower** (−0.167, p = 0.071, interval below 0): agents wrap up together and stop with 4–11M of 32M unspent |
| Letting teammates call a departed agent back by name (`@name`, `@all`) keeps work going | 24 | **Not decided** (+0.077, p = 0.46, k=5): works when used, but only 8 of 174 mentions reach a departed agent; early departures unchanged |
| Peer task hand-over with a task list helps 12 agents | 24 | **Not decided** (+0.013, p = 0.85): the list becomes a plan written by the first agent; 7 of 43 items finished |
| Splitting 12 agents and 32M into three rival teams beats one swarm of 12 | 22 | **Not measured** (closed after the quota stop at k=1 for teams): 0.239 against 0.303; best team 0.357 after the fact; small teams lose a repository when one agent quits early |
| Telling agents they are unseen by the rivals changes how they work | 21 | **No visible effect**: never doubted, tested or mentioned; reasoning is recorded only as titles, so belief cannot be read |
| A shared task list helps 12 agents on a batch of repositories | 15 A, 20 | **Not decided** (−0.024 in 20); its release on `done` handed one item over in 0.2 min; coverage of all repositories |
| A threaded board helps 12 agents on difficulty tasks | 16 A | **Not supported**: STH loses to C1T (−0.054) and is not pronounced against STT. Threads collapse into one or two busy threads, and the board's share of calls rises from 29% to 46% |
| A teammate keeps agents working the way the clock does, **without an oracle** | 14 (stage D) | **Not supported**: two agents without a clock stop at 1–2 minutes, like one |
| A visible clock keeps a single agent working, **without an oracle** | 11 (R3, R4) | **Supported**: +0.255 with norms and +0.335 without them, 6 of 6 tasks each, at 4–10× the tokens on the contract tasks; agents never mention it |
| Generic engineering norms help, **without an oracle** | 11 (R2) | **Not decided** (+0.020); a few more ad-hoc probes, same score |
| murmur's single agent beats Pi, **without an oracle** | 11 (R1) | **Passes narrowly** (+0.071, 4 of 6, carried by one task); the old +0.25 had the oracle prompt in it |
| An `append` tool and clearer write/edit descriptions remove chunked-write damage | 12 | **Supported on the mechanism**: 0 refusals and 1 write per run instead of 3, fewer wasted calls. The score effect is not measurable at k=4 on one task, and phase 2 keeps the guard alone by the rule |
| murmur's scaffolding hides a swarm benefit (bare board, Astra/ExploitGym style) | 10B | **Not supported**: a post-only board with a one-line briefing ties the single agent (−0.006) at ~4x tokens |
| A threaded board and an integration rule make a V swarm cheaper | 10C | **Refuted**: board-only turns 35.6% of tokens (S4 27.8%); integration breakage avoided, score unchanged (0.416) |

## Cross-cutting findings

- **Single agents stop early.** Pi runs the check 1–4 times and stops; 19 of 24 calibration runs end admitting incomplete work. Work done after the first green check is the best predictor of score.
- **Without an oracle, agents stop at about 2 minutes** (round 11), often saying the work is unfinished. A visible clock is enough to keep them working. They never keep a test file of their own unless they have time.
- **Writes in chunks break files.** Pi writes ~5–7 KB per `write`; a second `write` meant as a continuation replaces the whole file. In a swarm, a broken shared file plus "someone else owns it" leads everyone to give up.
- **Cost ≈ turns × context length.** Over 85% of tokens are cache reads, context per turn triples during a run, and coordination-only turns take 31–62% of a swarm's tokens.
- **Contract-style tasks saturate.** The best arms reach 0.91–1.0 on them, and a family built for transfer was solved by a single agent in 2 minutes. Ranking strong systems needs tasks with open-ended headroom, and even then a green public check makes agents stop.

## Threats to validity

- **A visible oracle in every task (the main threat; it invalidates rounds 1–10 as evidence for real work).** All 31 swarmtest tasks declare `acceptance_command: npm run test`. The default briefing told agents to call done when it passes, and the main profiles' norms described hidden tests. The strongest findings (the clock, norms, persistence after green, selection by a printed score) may be artefacts of that oracle. They are hypotheses until re-tested oracle-free.
- **Round 17:**
  - Stage A: two tasks at k=3. The AUD win rests on shop2, where C1T scored 0 in all three runs and one agent's score is bimodal. AUD differs from C1TR in several ways at once (board, revival, named agents, briefing wording).
  - The DeepSWE screen and the round 17 transcript analysis ran while other jobs were live. A quiet regrade showed no effect on stage A's grades. The subagent's version grading ran under load (±0.03).
  - Stage E: five tasks at k=2. The single-agent control quit early, so the rule's verdict mostly measures stopping, not coordination. The isolated C1T numbers come from separate budgets and are a reference, not a control. Both arms ran at the same time on 8 Docker CPUs.
- **Round 16:**
  - Stage A is 2 tasks at k=2. One agent's shop2 score is bimodal (C1T 0.565 and 0.547 in stage A, 0 and 0 in side test U three hours later), so one task can carry or erase any verdict. STH changes the board's tools and briefing together.
  - Side test U is one task at k=2, with all three arms running in the same window.
  - Stage D: the partial-credit scorer is this project's construction, not DeepSWE's binary reward. fd r1 was rescored after a harness fault, and its agent could not run the tests during its run.
- **Round 15 stage A** is a screen: 2 tasks at k=2, and shop2 swings 0.00–0.76 within one arm. Both "beat C1" verdicts lean on shop2 and on C1 planning runs below its rounds 13–14 means (0.275 against 0.42–0.47). ST's pronounced verdict rests on shop2. The first launch ran C1 in place of B on planning because of a wrong order check. That C1 run is valid and counted, one killed campaign is excluded, and all of it is logged in `plan.md`. Merges in BR could let conflict markers into the shared folder; this happened once, for about 76 s, in the best BR run. Eight wakes told agents to call an `inbox` tool their profile lacks.
- **Round 27:** RW changes four things against RT at once (weights, shared holding, decomposing first, taking the heaviest item), so no effect can be assigned to one of them; agents gave most items high weights, so "heaviest first" ordered little; at k=5 only differences of about ±0.25 are decidable.
- **Round 28:** RP changes several things against RW at once (stagger, reading before adding, weight guide, three working rules), so no effect can be assigned to one of them. The last entrants spend less of the budget. oxvg scores 0 in every arm, which caps every arm's mean near 0.8. At k=5 only differences of about ±0.25 are decidable.
- **Round 29:** TF changes four things against RP at once (tests first, build items per layer, finishing on the end-to-end tests, idle marks), so no effect can be assigned to one of them. The strict rule interacts with the language: tests that need new APIs cannot compile first, and Rust build times make waiting expensive. Oxvg's first non-zero is a single run. At k=5 only differences of about ±0.25 are decidable.
- **Round 30:** TI changes three things against TF at once (integrate item, stubs, no idle marks). Neither new mechanism was used much, so the round mostly re-measures TF. Its tie with TF (−0.005) is within run-to-run noise, and at k=5 only about ±0.25 is decidable.
- **Round 26:** RT changes three things against R at once (the task list for findings, builder by default, no slicing), so no effect can be assigned to one of them; two of its five wasmi results are 0 from a final build that did not compile, which a single late edit decides; at k=5 only differences of about ±0.25 are decidable.
- **Round 25:** R changes the team sentence and adds the roles at once; RC's clock estimate is noisy and its wall time was longer from build-lock contention; at k=5 only differences of about ±0.25 are decidable.
- **Round 24:** the code changed mid-round (`3e52e3e`: the `done` result no longer carries unread posts) after five of ten batches; M and MT differ by the task list as well as by hand-over; at k=5 only differences of about ±0.25 are decidable.
- **Round 23 (baseline):** later arms are no longer paired in time with their control, so drift in the model service between days goes into each comparison; runs of the baseline itself span 0.19–0.52, so the old ±0.05 rule was about half the standard error of a k=3 comparison; the permutation rule that replaced it decides only differences of about ±0.25 at k=5.
- **Round 22:**
  - closed after a quota stop: teams k=1, swarm k=2, so no rule applies; the three valid batches ran within 80 minutes, the invalid one is excluded;
  - the teams arm changes several things at once against the swarm (one swarm split into three, the rivalry text, visible rivals, the false claim, one shared pool);
  - the pool is checked after each model message, so the total lands slightly above 32M (0.6%);
  - the swarm arm uses `n12-base-peers`, not round 20's profile, so earlier swarm numbers are only a reference.
- **Round 21:**
  - k=2 on five tasks, a screen; scriggo 0 everywhere; teams of the same arm range 0.025–0.294;
  - the solo arm ran after the teams, not at the same time, and quit at 3–17 minutes, so the rule mostly measures stopping; a solo `done` ends the run, a team member's does not;
  - the teams arm changes team size, the rivalry text, the visibility of rivals and the false claim at once, against any earlier arm;
  - copies are counted from identical final diffs plus the order of reads and writes; partial adoptions come from the transcript report;
  - the default briefing's "equals" was misread as a teammate's name in 3 of 6 teams.
- **Round 20:**
  - k=2 on five tasks, with ST's own spread on them 0.17–0.77; oxvg and scriggo were 0 in 7 and 8 of 8 runs;
  - every batch ended at the 32M cap in 12–20 minutes, too soon for most take-overs to reach the score;
  - ST-depart bundles the notice with a new `done` description; ST-status adds the status line on top;
  - the notices and the status line see only write/edit/append, not bash edits;
  - two runs failed on a model API outage (no tool call) and were rerun 11 hours later, so that wave's pairing in time differs.
- **Round 19** stopped at the model quota after the first wave of repetition 0. Three arms have one batch each and three have none (their batches hit the usage limit 16 minutes in and are excluded). No rule was applied.
- **Round 18:**
  - the control collapsed again: C1P stopped at 13.9 and 1.3 minutes, so the rule's verdict measures the single agent's stopping, not what coordination adds;
  - the swarm's two repetitions differ by 0.22 on ten tasks and by 0.60 on the five shared with round 17 E, because in one of them every agent stopped by minute 34;
  - round 19's default-off levers and the driver's cost field were committed ten minutes into repetition 0 (the hubs had loaded the old `src/`; the driver was edited in place, not in a copy). ST and C1P do not use the new levers;
  - the tasks were chosen with another profile's isolated scores (C1T), and five are near that agent's ceiling when run alone.
- **Round 15 stage C** was closed early: C1T has k=1 per task, and its second green run was cut by the quota and excluded. Two things changed against stage B at once (the 60-minute clock and the tokens line), so their effects cannot be separated. Both tasks are at the ceiling for both arms.
- **Round 15 stage B** is one task at k=2. B's two runs differ by 0.19, so ST's +0.135 over B is inside the noise, although the rule calls it pronounced. "Equal cap" is not equal spend or equal time. C1 ended on its own 30-minute clock at about 11M, while the swarms spent 24M in about 7 minutes. A single agent given 24M and enough time to spend it is the missing control. The new default wake was not exercised in any stage B run, because no agent went idle before the cap; only its scripted smoke has passed.
- **Round 14** stopped at the model quota: five campaigns are invalid (two C1 runs cut mid-run, three with no model call). They are listed in `plan.md` and excluded.
- **Round 11 phase 1:**
  - stage C (the clock without norms) was added after interim results were seen;
  - a load spike (33–91, mostly I/O wait) at 12:25–12:39 overlapped five C campaigns. It coincided with this session's own read-only transcript analysis (two subagents) and is likely due to it, three of them with wall-clock-bound optimisation solvers;
  - ospec runs are all capped, so its score is a floor;
  - the optimisation graders give 0 to anything at or above the naive cost, which hides differences between weak solutions.
- **Ceiling.** With the clock, ieh, ledger and durable score 0.93–1.0 for the single agent. Round 6B cannot show a coordination benefit that would need headroom; it shows only that the clock closes round 5B's gap.
- **Reused runs.** Round 6A's c4g-evidence figures on ieh and ieh2 are round 5A's runs (another day; same code path, pre-registered). The main contrast (clock − guard) uses only fresh runs; "the clock explains c4g-evidence" uses them, and the fresh c4g-evidence runs on ledger (0.967) agree.
- **Reused control (round 9 V).** The solo arm is the round 8 calibration: same task fingerprints and code path, but another hour and seed.
- **Collapsed control (round 10A).** The primary comparison's control (C1s) underperformed the plain clock agent on packing2 by 0.50, so the rule's "adds" verdict measures the swarm against an agent that stopped early, not against the strong single agent.
- **Load-sensitive signal.** The large-instance score comes from a time-bounded solver run. Under 3 lanes, one end-of-run check printed 0.152 where a quiet regrade gave 0.933 (hidden 0.819). Agents selecting or stopping on that number saw noise.
- **Regrades during live campaigns (round 10).** An analysis subagent ran 137 public checks (sequential, `nice -n 15`) between about 19:07 and 19:50 UTC, while B0 and the first S2 campaigns ran, so wall-clock graders and in-run checks may have been slightly slowed. The runs are kept.
- **Code changed mid-round (round 9 D).** The `threads` lever landed in `src/` at 17:45 while D campaigns ran from `src/`; three runs loaded it. With `threads` off the flat board is equivalent (diff and default-profile smoke).
- **Small k.** Most comparisons use k=2–3 on 2–4 tasks, while one task's noise spans 0.0–0.75 for Pi. Bootstrap CIs over 3–4 task deltas mostly reflect which tasks were sampled.
- **Capped runs are floors.** Many swarm runs hit 3M; their score is truncated, and a capped run stops its swarmtest campaign.
- **Rule drift.** The per-run cap moved from 1.5M to 3M, one arm went to k=2 by choice rather than by rule, F1 was stopped at 6 of 64 runs, and criba 2 pools criba 1's runs. All of this is logged in the notebook.
- **Pre-registrations were not under version control** until this commit. Their timestamps are self-reported in `plan.md`.
- **Code version per run** was not recorded before commit `46e756b`; campaigns ran from `src/` live.
- **Isolation.** swarmtest campaigns run agents with full bash on the host, and graders are reachable from the workspace (0 accesses observed in ~12,000 bash calls). The batch runs use Docker but leave the network open.
- **Shared `/tmp`.** Concurrent runs share it, with fixed agent names; collisions were not verified.

## What would change the picture next

Round 9 ran items 1 and 2 of the previous list, and round 10 ran items 1–3 (signal, cheaper V swarm, bare board). What is left:

1. **A mechanical gate on the score instead of a text norm.** The single agent read the large-instance score and stopped anyway. The next fair test enforces it for both arms, for example by refusing `done` while the score is still improving or before a minimum number of attempts. Only then does "the swarm adds something beyond persistence" have a strong control.
2. **n=2 against that gated single agent, with a compute-matched control.** n=2 was the best swarm (packing2 0.904 in 3 of 3). The transcripts credit it to one idea spreading over the board plus iteration after green. A single agent with the same tokens (relays or a longer gate) separates that from more total work.
3. **A quieter signal.** The large-instance score is time-bounded and noisy under load, so agents selecting or stopping on it saw noise. A fixed-work score, or fewer concurrent lanes, removes that.
4. **Panel V stays parked.** Its cost is turns × context (~24k tokens per turn). A threaded board did not cut turns, so only a design that removes coordination turns altogether is worth another V round.
5. **Why the clock works**, and **a promotion benchmark with partial credit**, as before.

**Added 2026-10-04 after the literature review** ([synthesis](../experiments/reports/2026-10-04-swarm-literature.md); candidate list in `plan.md`, "candidate tests from the literature review"). No source compares identical peers in one repository against a persistent single agent at matched spend without an oracle; the closest studies (CooperBench, "Multi-Agent Teams Hold Experts Back") agree with murmur's null result. Candidates, in suggested order:

6. **H4, runway diagnostic** on the volume tasks: does the tokens-left line help or cause early wrap-up?
7. **H1, execution-quorum finish with a fresh-context auditor**, controlled by C1T + `relay`.
8. **H2, independence first, then one structured exchange**, with seeded approach diversity and an oracle-free pairwise selector.
9. **H3, a curated shared file injected at entry instead of the chat board**, and H3b, a fixed-size board tail on every tool result (like the clock line), against plain `attach`.
10. **H5, report results by task type** (unitary/sequential against decomposable).

**Added 2026-10-05 after rounds 18 and 19.** Both DeepSWE wins were set by when agents stop, not by coordination. Candidates: keep a seat working when its agent ends a turn without `done` (the relay fix, a new default-off lever), let posts wake `done` agents (`revive`), and finish round 19 to see whether any way of sharing state keeps more agents on abandoned work.

**Added 2026-10-06 after round 20.** Departure notices make abandonment visible; what is left is agents leaving early while knowing the goal is unfinished, and runs too short for take-overs to reach the score. Candidates: the notice without the status line at a larger cap, and a way for a leaving agent's open work to reach an idle teammate.

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
| Round 8 (panel expansion) | yes, committed before each stage (`6e586ac`, `0097a51`) | `criba8-lanes.mjs`, `criba8b-lanes.mjs` | `rows/runs.json` (seeds 20261030, 20261032, 20261033), `criba8-traces.md`, `criba8b-traces.md` | yes, `reports/2026-10-02-panel8-build.md` | yes |
| Round 10 (signal, size, bare board, cheaper V swarm) | yes, committed before launch (`fb8e16f`, timestamp fixed in `9d1180b`) | `criba10-lanes.mjs`, `criba10/` | `rows/runs.json` (seeds 20261036–20261040), `round10-traces.md` | yes, `reports/2026-10-02-round10-{d,b0,v}-traces.md` | yes |
| Round 9 (swarm vs clock agent, D and V) | yes, committed before launch (`3ea1d8d`) | `criba9-lanes.mjs`, `criba9/` | `rows/runs.json` (seeds 20261034, 20261035), `round9-traces.md` | yes, `reports/2026-10-02-round9-{v,d}-traces.md`, `reports/2026-10-02-astra-swarm-ideas.md` | yes |
| Round 11 phase 1 (no oracle) | yes, committed before launch (`4a6b664`; addenda `50c1c61`, `7651a12`, stage C a declared deviation) | `criba11-lanes.mjs`, `criba11/` | `rows/runs.json` (seeds 20261053–20261055), `round11-traces.md` | yes, `reports/2026-10-03-round11-traces-analysis.md`, `reports/2026-10-03-tool-usage-audit.md` | yes; phase 2 waits for the user |
| Round 12 (tool levers) | yes, committed before launch (`286f625`, time fixed in `64c4543`; measurement script `07b6cf4`) | `criba12-lanes.mjs`, `criba12/` | `rows/runs.json` (seed 20261056), `round12-traces.md`, `round12-writes.md` | yes, in `plan.md` | yes |
| Round 13 (phase-2 calibration) | yes, committed before launch (`bdeb8a6`, time fixed in `7f2c84d`) | `criba13-lanes.mjs`, `criba13/` | `rows/runs.json` (seeds 20261057, 20261059), `round13-traces.md` | yes, in `plan.md` | yes |
| Round 14 (phase 2) | yes, committed before launch (`5da5d6d`, `429cbb3`) | `criba14-lanes.mjs`, `criba14/` | `rows/runs.json` (seeds 20261066, 20261060; 5 invalid campaigns listed in `plan.md`) | descriptive, in `plan.md` | stopped by the model quota after stage D; rules not applied |
| Round 15 stage A (12 agents) | yes, committed before launch (`a277ff4`, `89fe4fe`; measurement script `fd1e239`; order fix and deviation `95bce30`) | `criba15-lanes.mjs`, `criba15/` | `rows/runs.json` (seed 20261070), `round15-traces.md` (per-run table regenerated in stage B's commit; the first version was empty) | yes, `reports/2026-10-04-round15-traces-analysis.md` | yes; stage B with B, C1 and ST |
| Round 15 stage B (12 agents, volume) | yes, committed before launch (`f4c5f63`) | `criba15-lanes.mjs` (stage V), `criba15/V-*.json` | `rows/runs.json` (seed 20261072), `round15-traces.md` | yes, `reports/2026-10-04-round15b-traces-analysis.md` | yes |
| Round 15 stage C (equal spend) | yes, committed before launch (`10e6f54`); closed early by the user's decision, logged in `plan.md` | `criba15-lanes.mjs` (stage C), `criba15/C-*.json` | `rows/runs.json` (seed 20261074; 1 invalid campaign), `round15-traces.md` | yes, `reports/2026-10-04-round15c-traces-analysis.md` | yes: not decided at the ceiling; quality-bound tasks next |
| Round 16 stage A (difficulty, threads) | yes, committed before launch (`b438df5`) | `criba16-lanes.mjs` (stage A), `criba16/A-*.json` | `rows/runs.json` (seed 20261080), `round16-traces.md` | yes, `reports/2026-10-04-round16a-traces-analysis.md` | yes |
| Round 16 side test U ("unlimited" clock) | yes, committed before launch (`e5f402f`) | `criba16-lanes.mjs` (stage U), `criba16/U-*.json` | `rows/runs.json` (seed 20261090), `round16-traces.md` | descriptive, in `plan.md` | yes |
| Round 16 stage D (DeepSWE calibration) | yes, committed before launch (`b438df5`) | `deepswe/run-batch.mjs`, `deepswe/calib16.sh` | `deepswe/results/cal16-r{0,1}.json`, `cal16-r1-fd-rescore.json` | `reports/2026-10-04-deepswe-scorer-offline-fix.md`, in `plan.md` | yes (only expr stays) |
| Round 17 stage A (audit) | yes, committed before launch (`73ff3e7`) | `criba17-lanes.mjs`, `criba17/` | `rows/runs.json` (seed 20261101), `round17-traces.md` | yes, `reports/2026-10-05-round17-traces-analysis.md` | yes |
| Round 17 stage S (DeepSWE screen) | yes, committed before launch (`497b6d9`) | `deepswe/screen17.sh`, candidates in `reports/2026-10-04-deepswe-candidates.md` | `deepswe/results/scr17-b{1,2,3}.json` | in `plan.md` | yes (4 of 12 kept) |
| Round 17 stage E (DeepSWE batch) | yes, committed before launch (`37213a7`) | `deepswe/batch17.sh` | `deepswe/results/e17-*.json`, `deepswe/traces17.md` | in `plan.md` | yes |
| Round 18 (DeepSWE batch, ten tasks) | yes, committed before launch (`7eeeca4`) | `deepswe/batch18.sh` | `deepswe/results/e18-*.json`, `deepswe/traces18.md` | yes, `reports/2026-10-05-round18-19-traces-analysis.md` | yes |
| Round 19 (how the team shares state) | yes, committed before launch (`3c02043`) | `deepswe/batch19.sh` | `deepswe/results/e19-*.json` (3 valid batches; 3 invalid ones listed in `plan.md`), `deepswe/traces19.md` | descriptive, `reports/2026-10-05-round18-19-traces-analysis.md` | stopped by the model quota after wave 1 of repetition 0; no rule applied |
| Communication diagnosis | — | — | — | `reports/2026-10-05-swarm-communication-diagnosis.md` | led to round 20 |
| Round 20 (team state visible) | yes, committed before launch (`ed4fb54`) | `deepswe/batch20.sh`, `deepswe/comm.py` | `deepswe/results/e20-*.json`, `deepswe/traces20.md` (two rerun batches listed in `plan.md`) | yes, `reports/2026-10-06-round20-traces-analysis.md` | yes |
| Round 21 (rival teams) | yes, committed before launch (`46f2aff`) | `deepswe/batch21.sh`, `deepswe/run-batch.mjs` (`--arm teams`), `deepswe/rivals.py` | `deepswe/results/e21-*.json`, `deepswe/traces21.md` | yes, `reports/2026-10-06-round21-transcripts.md` | yes (screen, no verdict) |
| Round 22 (rival teams sharing a pool vs one swarm) | yes, committed before launch (`aca4e9b`) | `deepswe/batch22.sh`, `deepswe/run-batch.mjs` (`--pool`), `profiles/n12-base-peers.json` | `deepswe/results/e22-*.json` (3 valid; the invalid batch listed in `plan.md`), `deepswe/traces22.md` | yes, `reports/2026-10-06-round22-transcripts.md` | closed by the user after the quota stop, no rule applied |
| Round 23 (fixed baseline) | yes, committed before launch (`0b0e12c`) | `deepswe/batch23.sh`, `profiles/n12-base-peers.json` | `deepswe/results/e23-base-r{0..4}.json`, `deepswe/traces23.md` | descriptive, in `plan.md` | yes (the reference for later arms) |
| Round 24 (calling departed agents back) | yes, committed before launch (`cd5cfde`) | `deepswe/batch24.sh`, `profiles/n12-mention.json`, `profiles/n12-mention-tasks.json` | `deepswe/results/e24-*.json`, `deepswe/traces24.md` | yes, `reports/2026-10-07-round24-transcripts.md` | yes (both not decided) |
| Round 25 (roles without owners, budget clock) | yes, committed before launch (`7f6d59e`; its heading time corrected afterwards) | `deepswe/batch25.sh`, `profiles/n12-roles9.json`, `profiles/n12-roles9-clock.json` | `deepswe/results/e25-*.json`, `deepswe/traces25.md` | yes, `reports/2026-10-08-round25-transcripts.md` | yes (both not decided) |
| Round 26 (roles that mostly build, task list for findings) | yes, committed before launch (`f602660`) | `deepswe/batch26.sh`, `profiles/n12-roles9-tasks.json` | `deepswe/results/e26-*.json`, `deepswe/traces26.md` | yes, `reports/2026-10-08-round26-transcripts.md` | yes (not decided) |
| Round 27 (weighted, shared task list) | yes, committed before launch (`7e54b16`) | `deepswe/batch27.sh`, `profiles/n12-roles9-weights.json` | `deepswe/results/e27-*.json`, `deepswe/traces27.md` | yes, `reports/2026-10-08-round27-transcripts.md` | yes (not decided) |
| Round 28 (parts, weight guide, slower stagger) | yes, committed before launch (`e1d84cf`) | `deepswe/batch28.sh`, `profiles/n12-roles9-parts.json` | `deepswe/results/e28-*.json`, `deepswe/traces28.md` | yes, `reports/2026-10-08-round28-transcripts.md` | yes (not decided) |
| Round 29 (end-to-end tests first, items per layer, idle marks) | yes, committed before launch (`9b74367`) | `deepswe/batch29.sh`, `profiles/n12-roles9-tests.json` | `deepswe/results/e29-*.json`, `deepswe/traces29.md` | yes, `reports/2026-10-08-round29-transcripts.md` | yes (not decided) |
| Round 30 (an integrate item per project, stubs) | yes, committed before launch (`3e23e34`) | `deepswe/batch30.sh`, `profiles/n12-roles9-integrate.json` | `deepswe/results/e30-*.json`, `deepswe/traces30.md` | yes, `reports/2026-10-08-round30-transcripts.md` | yes (not decided) |
| Task families (L2, L3) | calibration rule yes | `reports/2026-10-01-task-families.md` | calibration batches in `batch/` | yes | L2 dropped by rule, L3 used |

**Known gaps** (they cannot be fixed after the fact, or they live outside this repo):
- pre-registrations were not version-controlled before commit `138a4d7`, so their timestamps are self-reported;
- the F1a–c screens were not pre-registered separately;
- the code version per run was not recorded before `46e756b`;
- raw agent transcripts and workspaces are not in git (size); they are packed in a 23 MB archive described in [`archive/MANIFEST.md`](../archive/MANIFEST.md); the raw runs of rounds 6–10 (from campaign `20261002T063615Z-10df4893` on) are not in it yet and will go into the next archive;
- the `fam_*` and `opt_*` task sources live in the separate swarmtest repository (`staging/`, commit `34c8385`), which has no public remote yet.

## Where the data is

An index by round and by kind is in [`experiments/README.md`](../experiments/README.md).


- [`experiments/plan.md`](../experiments/plan.md): the lab notebook. It holds every pre-registration, rule applied, finding, and the campaign registry, including campaign ids.
- [`experiments/reports/`](../experiments/reports/): longer analyses:
  - the adversarial review and the subagent audits behind it;
  - the DeepSWE diagnosis;
  - the incident-inspired theories and how they fared;
  - the round 6 transcript analyses (the clock, and coordination in the batches);
  - the construction and calibration of the task families;
  - the round 9 transcript analyses (panels V and D) and the review of the Astra/ExploitGym swarm sources;
  - the round 10 transcript analyses (panel D with the signal and swarm size, the bare board B0, and the threaded V swarm TI);
  - the oracle audit and the build of the blind panel;
  - the round 11 phase 1 transcript analysis and the tool-usage audit;
  - the lever recount for 12-agent swarms and the round 15 transcript analyses (stages A, B and C);
  - the round 16 stage A, round 17, rounds 18–19, round 20 to round 30 transcript analyses, and the swarm communication diagnosis;
  - the DeepSWE candidate selection for round 17;
  - the DeepSWE batch feasibility notes, driver build and offline-scorer fix (the driver and per-batch results are in `experiments/deepswe/`);
  - the literature review (eight source reviews and a synthesis).
- [`experiments/rows/runs.json`](../experiments/rows/runs.json): one row per swarmtest run since murmur started (703 runs in 385 campaigns, including 6 invalid ones: 5 from round 14's quota stop and 1 from round 15 stage C's): campaign, seed, task, arm, score, tokens, cost in dollars (`cost_usd`), status and end reason. Regenerate with `node scripts/rows.mjs ../swarmtest/runs --since 20260930`.
- `experiments/criba{1,2,3,5,6,7,8}-traces.md`, `experiments/round{9,10,11,12,13,15,16,17}-traces.md`: per-agent behaviour tables from `scripts/traces.mjs`: calls, board share, checks, calls after the first green, and why each agent stopped.
- `experiments/deepswe/`: the DeepSWE batch driver (`run-batch.mjs`), one shell driver per round, one result file per batch with per-task scores, tokens and (from round 19) cost in `results/`, and the coordination counts per batch (`traces17.md` to `traces27.md`, from round 20 generated by `traces.py`; process measures by `comm.py`, and round 21's use of the rivals' work by `rivals.py`).
- `experiments/criba1-rows.json`, `criba12-rows.json`: the aggregated tables used for the criba 1–2 decisions.
- `experiments/*.json`, `experiments/criba*/`, `experiments/*-lanes.mjs`: swarmtest campaign configs and the parallel lane drivers.
- `experiments/batch/`: the round 5B–7 driver (`run-batch.mjs`, `lane.sh`), one `batch-result.json` per batch (including calibration and failed batches), and the coordination events per batch (`traces.md`).
- `profiles/`: every arm. `src/`: murmur itself. The commit history shows when each lever was added.
- **Not in this repo:**
  - raw runs (transcripts, events, workspaces) live in `../swarmtest/runs/<campaign>/` and locally in `experiments/batch/*/`. They are packed into one archive, with a checksum and its layout in [`archive/MANIFEST.md`](../archive/MANIFEST.md);
  - the task families built for round 5 are in `../swarmtest/staging/`.

To reproduce a round, run the driver named in its `plan.md` entry, for example `node experiments/criba5-lanes.mjs <lane>` or `sh experiments/batch/lane.sh L1 <image>`. Then aggregate with `node scripts/traces.mjs <campaign-dir>...`, `node scripts/rows.mjs`, or the `batch-result.json` files.
