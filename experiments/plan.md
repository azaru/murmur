# Experiment plan: murmur vs Pi

Goal: a murmur configuration that beats Pi n=1 (same model: `openai-codex/gpt-6-luna`, thinking `medium`) consistently. Everything is tried through profiles, without OpenSpec. When something shows signal, it is fixed with an OpenSpec change, for example by turning a winning profile into the default behaviour.

Prerequisite: the levers (profiles, variants in swarmtest, autotuner adapter, `scripts/arms.mjs`), implemented without OpenSpec; design notes and steps in `experiments/levers/`.

## Candidate design rule

Nothing hierarchical: the system never assigns roles or splits the work. It may offer a role menu (with its own instructions that the agent reads when choosing), stagger the entries so that each agent chooses and announces its role before the next one enters, and provide tools, signals and finishing conditions that help agents discover for themselves what is needed. Who does what is decided by the agents, and they can change roles.

## Criterion for "consistently beats Pi" (fixed before measuring)

- **Confirmation set.** Never used to decide candidates. It consists of:
  - the 18 `validation_pool` tasks of the agentic-canary;
  - the 8 swarmtest tasks (below), with new repetitions and another seed.
  - `holdout_final` stays reserved; it would only be used once, with `holdout --i-am-releasing`.
- **Rules.** Two independent confirmation campaigns are needed and each must satisfy:
  - mean paired delta per task (murmur score − Pi score) > 0, with the lower end of the 90 % bootstrap CI > 0;
  - murmur wins more tasks than it loses;
  - the rate of timeouts and failures does not exceed Pi's by more than 10 points.
- **Cost.** Tokens are recorded but do not decide; each run has a cap of 1.5M.

## Known noise

- Pi n=1 on `durable_workflow_engine`, with the same adapter, gave 0.67 / 0.90 / 0.65 / 0.49 and a mean of 0.51 over 3 runs.
- Conclusion: one run orders nothing. Always k≥2, paired comparison per task and a decision on the per-task mean.

## Phases

### F0: levers (without OpenSpec; see `experiments/levers/`) — DONE 2026-09-30
Smoke runs only; under 1M tokens.

### F1: pilot in swarmtest, does the board contribute? (cap 20M tokens)
- **Tasks (8):** `bug_fixing`, `complex_workflow_engine`, `constrained_planning`, `data_analysis`, `durable_workflow_engine`, `feature_implementation`, `incremental_workflow_engine`, `information_extraction`. `document_synthesis` and `live_web_research` are excluded, since they require human review.
- **Arms:** `pi/n=1`, `murmur/n=1`, `murmur/n=3` and `murmur[profiles/no-messaging.json]/n=3`, with k=2. That is 64 runs.
- **Parameters:** `token_budget` 1.5M per run, `timeout_seconds` 1200, `--max-total-tokens 20000000`. Estimate: 8–12M.
- **Decision on the board** (`scripts/arms.mjs`, n3 with messages vs n3 without messages):
  - it contributes if the mean delta is ≥ +0.05 and it wins on ≥ 5 of 8 tasks;
  - it does not contribute if the mean delta is ≤ 0;
  - otherwise it is inconclusive and k=2 more are run.
- **Also, descriptively:** the current distance between murmur n=1 and n=3 and Pi.

### F2: autotuner, exploratory baseline
- Murmur with the best F1 configuration against Pi on the canary's 12-task panel (train split, active tasks), with k=2. Estimate: 3–8M.
- It is exploratory because the canary is calibrated for Pi `gpt-5.6-luna`.
- The 480 s per-task timeout must be reviewed for murmur n≥3.

### F3: tuning loop (canary panel)
- **Candidate:** a `profiles/<id>.json` file plus its autotuner config. A profile is never edited in place: each new candidate is a new file. Autotuner does not see the profile's content in its cache or in version control, so editing it in place would silently mix results.
- **Evaluation:** conservative 12×2 gate against the murmur baseline (cached). If it promotes, it becomes the new baseline; if it rejects, it is recorded and discarded.
- **Batches:** 3 to 5 candidates, with a token estimate approved before launching them. Each candidate costs about 2–7M.
- **Follow-up:** every 3 promotions, an exploratory comparison against Pi on the panel.

### F4: confirmation
- When the panel shows murmur ≥ Pi, the two confirmation campaigns are launched.
- If they pass, an OpenSpec change is opened to fix the winning profile.
- If they do not pass, it is noted as possible overfitting and we go back to F3.

## Initial hypothesis backlog (lever → idea)

1. `messaging`: does the board contribute compared with working in silence? (F1)
2. `agents`: compare N = 2, 3 and 5.
3. `spawnGapSeconds`: 0 versus 20–30 s, so that the first agent explores and posts a plan before the others enter.
4. `briefing`: ask the first agent to enter to split the work through the board, and the others to wait for the plan or answer it.
5. `systemPromptAppend`: swarm coexistence norms (claim before editing, post findings and test results).
6. `tools`: add `grep`, `find` and `ls`.
7. `thinking`: medium versus high.
8. More directive `steer` and `wake` texts: summarise the new message and say what to do.
9. `toolDescriptions`: make `post` encourage sharing test results and make `done` require having run the check after a teammate's last change.
10. Stricter briefing `done`: do not finish if another teammate is still working on the same file.

## Open ideas (extended with each transcript analysis)

Only two principles: non-hierarchical and self-managed. Everything else is fair game.

- Role menu that each agent chooses and changes (tool `role(name)` that returns the role's instructions, announces it and shows it in `team`).
- Staggered entry so that each agent chooses and announces before the next one enters; a "fresh eye" agent that enters late with no history.
- Contract checklist in a shared file (`SWARM.md`) that everyone maintains.
- Swarm test suite (`swarm_tests/`) that anyone can extend; `done` requires it to pass.
- Automatic notice of edits on the board (summary per time window).
- Ending by consensus with an epoch: any edit invalidates earlier `done` calls and wakes whoever finished.
- Wake whoever has been idle for N s so they look for gaps; periodic one-line status.
- `budget()` with remaining time.
- Agent diversity (different thinking per agent).
- Ask for a teammate with a clean context or step aside.
- Generic lessons in the system prompt, drawn from the transcripts.

### Findings F1a/F1b (transcripts) and the ideas that come from them

- Everyone (Pi and murmur) stops as soon as `npm run test` passes, using ~11 % of the time and 8–43 % of tokens; several `done` calls admit the gap ("replay validation is not complete"). The only 0.987 came from an agent that, after the green, compared the code against the contract and wrote forged checkpoints to break it.
  → Norm: the check is a sample; the contract is what counts; use the spare time to break your own and others' work. Show remaining time and budget.
- A late finding is lost: posts to `done` agents do not wake them and nobody reopens the work.
  → Revocable `done`: a later edit or post wakes those who finished; `done` is rejected with unread messages or with the check red after the last change.
- Without a board there are overwrites (18 writes over 5 files; bugs from a single author stepping on others). With a board there are not, but quality does not improve: 61 % of tool calls are coordination (inbox, acks, "I'll take X").
  → Put the text of new messages into the steer (no trip to `inbox`); `post` only for decisions, interfaces, failures and blockers; automatic notice of claims and edits.
- The ArcSwarm text of the tasks ("The solo Pi run implements all modules itself") makes each agent believe it is the only one.
  → Line in the prompt: the task text may talk about other harnesses; you are one of N equals.
- `claim("bindings.py")` and `claim("workflow_engine/bindings.py")` do not collide; `engine.py` was left without an owner for 70 s.
  → Canonicalise paths; `team()` lists what nobody has taken.
- `budgetTokens` counts cache_read: probing burns budget without real work.
- Extra control: no messages but knowing there are teammates, to separate communication from team awareness.

### "Out of the box" ideas (2026-10-01; literature review plus our own data)

Our own data that frame them:
- Context triples over a run (from ~6k to ~19k tokens per turn) and the second half of the turns takes 66 % of the spend.
- c5 barely uses its private attempts: it creates `attempts/` in cph and in one of the two ieh runs; in durable and fih it splits the work. Its advantage is partly due to c1's norms.

Ideas:
1. **Selection by execution** (CodeT, S*, CodeMonkeys). Independent attempts; each agent writes probes derived from the contract, all attempts are run against all probes, a results matrix is published and the attempt with the most agreement is installed. The two or three probes that separate the candidates are written by someone who is not the author of any of them.
2. **`done` with evidence and a visible clock.** One cannot finish without N verification actions after the last green or without a marked clause list; remaining time and tokens arrive with the tool results (SWE-Marathon and MAST: premature stopping and poor verification among the main failures).
3. **Relays with clean context** (Anthropic, Cursor, Carlini, Fail-Fast Restart-Smart). When an agent does `done` or exceeds K turns, it writes `NOTES.md` and a new agent with the same name continues with clean context, until time or budget runs out. It attacks both cost (growing context) and early abandonment at once. It also serves as a compute-matched control: n=1 with relays.
4. **Menu of chosen strategies** (Self-MoA and personality diversity). Each agent chooses a different strategy (test-first, contract to checklist, bottom-up). It only pays off if execution selection follows; the best of 3 is measured, not just the chosen one.
5. **Cross-pollination after selection** (AlphaEvolve, SWE-Replay). The unchosen bring to the winner the clauses where their attempt scores better, with acceptance by tests only.
6. **Phases in silence** (blackboard or stigmergy). Board only at phase boundaries. Cursor sees that flat peers avoid what is hard, and our "yielding the file" is the same thing, so yielding is explicitly forbidden: whoever finds a defect fixes it in their copy and posts the patch.
- **Missing control:** a single agent with 3 times the budget. In our case raising the cap is not enough, because c4n1 does not get to spend it (it stops earlier); the fair control is n=1 with relays (idea 3).

### Findings of Criba 3 (screen 3; traces of 15 campaigns; counts from events.jsonl and traces.mjs, plus reading a few runs)

- **The broken file almost disappeared.** There were 6 overwrites in total, at most one per run, and no run was left with the file broken and unfixed. `writeGuard` rejected 12 partial writes, stale 10 and lock 6 (all in `50117473/0006`). With the guard, A, B and C have nothing left to fix, and that is why they contribute nothing.
- **The dominant failure becomes yielding and stopping early:**
  - **ieh (a single file):** in the n=3 arms there is usually one implementer and 1–2 "reviewers" who do `done` with "X owns extract.py". In parts it is extreme (`cc8a515c/0002`, 0.00 in 66 s): all three claim parts that are not implementation (audit or normalisation), drop "extract.py implementation", and all three do `done` with the stub intact. In fih and durable the parts are real modules and parts works (1.0 and 0.88–0.96).
  - **durable:** guard loses 0.36 in both repetitions on the same families (checkpoint, replay and foreach-resume), because nothing else comes out once green: 2/2/2 calls after the green in `/0007`. lock and parts keep going 7–27 calls and lose only 17–90 points. The public check does not cover those families, so what decides is continuing to work after the green, not the file mechanism.
  - **c4g in ieh:** all runs that reach green score ≥ 0.90, and those that stop on red score 0.27–0.53, giving up on a stubborn case (CS-11073).
  - **lock in fih:** 0.73 twice with the same failed checks (fuzz, ValueError on the first `add_lot`). It is a shared misreading of the contract, not a blockage.
- **Calls after the first green (mean over agents that reach green):** c4g 3.9, stale 3.8, guard 9.3, parts 10.0, lock 10.9 and c5 15.3. Agents that run no check: guard 6 of 24, stale 7 of 18, lock and parts 3 of 18, c5 1 of 18.
- **Cost:** turns that only use board tools take ~31–45 % of tokens in n=3, versus ~9 % in c4g. Of the runs cut at 3M, two were making progress (stale ieh and c5 ieh 0.97). One guard run in fih scored 1.0 and kept verifying up to the cap. One c5 run in ieh (`ea037e72/0002`, 0.54) went into a loop: 184 calls, 49 `inbox`, 32 `post`, 5 edits and no green.
- **Consequence for round 4:** the levers already prepared (evidence in `done` with a clock, relays with clean context and selection by execution) target exactly these failures. Yielding without implementing with the check red should not count as a reason for `done`.

### Findings of Criba 2 (replication against c4n1; `criba12-rows.json` joins the two screens)

- **Rule applied:** an arm passes with a mean Δ against c4n1 ≥ +0.05 and winning on ≥ 3 of 4 tasks. **c5 passes:** +0.22 against c4n1, wins 4 of 4 tasks, +0.42 against Pi, 2.49M on average. c1 does not pass (+0.09 but wins only 2 of 4) and neither does x1 (−0.04, wins 1 of 4).
- **Why c5 wins:** each agent works in its own copy (`attempts/<name>/`), so nobody overwrites another's file. In ieh it scores 0.97 and 0.90. In the replication, c1 and x1 score 0.00 in ieh:
  - x1: one agent overwrites `extract.py` with a continuation chunk and all three give up after 4 minutes;
  - c1: it runs out of the 3M cap in the middle of an edit and the file is left with an unclosed parenthesis.
- **The dominant failure in single-file tasks is the broken shared file, followed by abandonment.** Already 4 of 6 three-agent arms have 0.00 in ieh (x2, c6, c1, x1). Two different mechanisms fix it: isolation (c5) and `writeGuard` (not yet measured).
- **c4n1 is confirmed as a strong, cheap reference:** ieh 0.67, cph 0.40, durable 0.59 and fih 0.83 (Pi in fih: 0.29 in calibration), with 0.25M on average.
- **Ceiling:** c1, x1 and c5 score 0.92–0.99 in durable; c1 and c5 score 1.0 in fih with k=1. Saturation from above is confirmed; hence `information_extraction_hard2`.
- **Cost of Criba 2:** 26.0M. Three runs cut by the cap: c5 in durable and c1 in ieh and in cph.

### Findings of Criba 1 (74 runs, k=1 per arm; tables in `experiments/criba1-rows.json` and `criba1-traces.md`)

- **Cleanest result: c4n1.** A single murmur agent with c4's lessons scores +0.245 against Pi on the three tasks, with 0.36M. The default n=3 arm scores +0.10 with 1.19M, and c4 n=3 +0.22 with 2.43M (cut twice). With the same prompt, going from 1 to 3 agents added nothing and cost 7 times more. Almost all of the advantage over Pi comes from "do not stop with the check red", not from having teammates. The comparison that matters from now on is murmur n=3 versus murmur n=1 with the same prompt.
- **Continuing to work after the green predicts the score** in multi-file and planning tasks (Spearman between calls after the first green and score: 0.80 in durable, 0.72 in cph). In the single-file task it does not (0.16 in ieh); there what fails is collision.
- **Chunked writes that overwrite each other, inside the swarm:** 8 of 39 murmur runs. It is fatal when nobody fixes it. In ieh, x2 and c6 (file-based coordination, no board) score 0.00: one agent overwrites `extract.py` with a continuation chunk and all three give up after 3–5 minutes out of 20, leaving it to someone else. Knowing there are teammates without having a channel leads to yielding, not fixing. In durable, which is multi-file, c6 scores 0.90. c4's lesson did not prevent the overwrite.
- **x1 (attach):** it removed the steers (0 versus 12), but it does not save anything: 1.37M versus 1.19M. Agents still call `inbox` (5–12) and `team` (9–11), and post more (13–27). The channel changed, the habit did not; those tools would have to be removed. The prediction of −30–50 % of tokens is refuted. The score comes out better than the default arm, but it rests on durable (0.99 versus 0.18).
- **x3 (automatic notices) is worse than x1 on all three tasks:** refuted with k=1. **x4 (voluntary board)** scores +0.21 with 0.91M; against the default arm it is cheaper and somewhat better.
- **The default arm's 0.18 in durable is atypical.** In F1 that arm scored 0.99 and 0.59. Any "X beats the default arm" that depends on durable with k=1 rests on that run.
- **cph barely discriminates:** 8 of 11 Pi runs and 8 of 13 murmur runs land exactly at 0.37. Only c3 (0.50) and c5 (0.43) exceed that plateau, and in both all agents end with the check green.
- **3M cap:** 10 of 39 murmur runs reach it (c2 three times; c1, c3, c4 and c5 twice). In those runs the 3.0M is a floor, not a cost, and the score is truncated.
- **Concurrency (3 lanes):** there is no grader timeout in 74 runs.
- **`arms.mjs --across` does not work with one Pi per campaign:** all the Pi runs collapse onto the key `|task|1`. For this screen one has to compare against the mean Pi per task (Pi n=11–13 per task).
- **Cost:** 65.2M in total (murmur 59.1M, Pi 6.1M), versus the 26M estimated at the start and ~40M afterwards. It is due to there being 13 arms, to heavy arms that hit the cap and to carrying Pi in every campaign.

### Findings of the hard-task calibrations (Pi transcripts, 24 runs)

- **Chunked writes that overwrite each other.** Pi writes ~5–7 KB per `write`. If the file does not fit, it sends a second `write` that is the continuation (it starts with an indented `def …` or `# aggregation`) and replaces the first. It happens in 7 runs: fih v2 r3, v3 r3, v4 r1 and r2, dah v1 r1, dah v2 r1 and r2. Six of the seven score < 0.1; the other (dah v2 r2) fixes it by rewriting and scores 1.0. The fih solution has a 27.8 KB `service.py`: the jump v1 (0.87) → v2–v4 (0.05–0.40) is explained mostly by the size of the largest file, not by the difficulty of the contract.
- **Early abandonment.** Pi runs the check 1–4 times and stops; 19 of 24 runs end by admitting that it fails or is incomplete.
- **When it does not break, the difficulty is real.** fih v4 r3 (0.68) passes all the simple families and fails `fuzz_long`, `fuzz_ops`, `replay_v2` and `replay_forged`, which are interactions, as in v1.
- **Bimodality.** fih v4 and dah v2 have two modes: (a) package or script broken by the overwrite, followed by abandonment; (b) complete work with failures on interactions (fih) or a ceiling of 1.0 (dah).
  → Idea: a generic lesson in `systemPromptAppend`: `write` replaces the whole file; long files are built by modules or by appending with `edit`; with the check red you continue, you do not stop. It would also help n=1, so to attribute the effect to the swarm a murmur n=1 arm with the same lesson is needed.

## Criba 1 (screen 1; fixed before measuring, 2026-10-01)

- **Tasks:** the three continuous, calibrated ones: `information_extraction_hard` (Pi 0.58), `constrained_planning_hard` (0.32) and `durable_workflow_engine` (~0.59). `feature_implementation_hard` v4 (0.29) and `data_analysis_hard` v2 (0.48) stay as they are and do not enter the screen. They are bimodal: breakage from chunked writes and abandonment.
- **Arms (k=1):** pi n=1; murmur n=3 default; no-messaging n=3; c1, c2 and c3 n=3; `c4-lessons` (c1 plus lessons: `write` replaces the file and do not stop with the check red) at n=3 and n=1. The n=1 arm separates the effect of the lesson from the effect of the swarm.
- **Execution:** `experiments/criba1.json`. One campaign per task, so that a cut by budget only affects that task. Seed 20261006 leaves c3 for last. Cap of 3M per run and 20M per campaign. Estimate: ~26M in total.
- **Mid-way change (2026-10-01 12:50).** c4 n=3 used up the 3M in ieh (2.8M of cache read) and swarmtest stopped the campaign after 2/8 runs. From then on, each missing arm runs in its own campaign next to a Pi run (`experiments/criba1-driver.mjs`; swarmtest requires a one-agent arm). That way a cut only affects that pair and Pi accumulates k≈8 per task. **c5** (`c5-attempts`) is added: c1 plus parallel attempts. If the deliverable is a single file, each agent makes its complete attempt in `attempts/<name>/`, the best one is installed and everyone keeps improving it together. It comes from the transcripts: in cph and in ieh, two of three agents yield the file and call `done` as "reviewers". `arms.mjs --across` pairs runs from different campaigns by task.
- **Three-legged objective (2026-10-01):** (1) raise the score, (2) communication that serves that score and (3) lower the cost in tokens. Data mid-screen: in ieh, no messages gives 0.92 with 0.71M and the default arm 0.87 with 1.69M. Turns that only coordinate take 33–62 % of tokens and cache read is > 85 %. The cost is set by the turns, not by what the agents write.
- **Second batch: different mechanisms for the same objective** (useful communication at lower cost; `criba1-driver2.mjs`, runs after the first; Pi in each campaign):
  - **x1 `x1-attach`** (channel without turns): new posts are attached to the result of the next tool (`delivery: "attach"`); there are no steers and `inbox` is not needed. It is compared with the default arm. Prediction: same score and −30–50 % of tokens.
  - **x2 `x2-files`** (stigmergy): no board. Agents know they have teammates and coordinate through files: `SWARM.md` as a shared notebook and `swarm_tests/`. It is compared with no-messaging (cost) and with the default arm (score).
  - **x3 `x3-notices`** (automatic facts): x1 plus notices generated by the system (who writes or edits which file, each check with PASS/FAIL), and `post` restricted to failures with a repro, interfaces and blockers. It is compared with x1. Prediction: fewer posts, fewer overlaps and score ≥ x1.
  - **c5** (diversity instead of conversation; already in the first batch): parallel attempts and selection.
  - **x4 `x4-pull`** (voluntary board): there is a board but nobody interrupts or attaches messages to results (`delivery: "pull"`). The prompt asks to look at `inbox` and `team` before each piece of work and to post when finished what was done, what was found and what is missing. An agent that ends its turn with unread messages still gets the usual `wake`. It is compared with the default arm (steer) and with x1 (attach). Prediction: fewer coordination turns than the default arm. The risk is that findings arrive late.
  - **c6 `c6-silent-norms`** (control): c1's norms with x2's file-based coordination and no board. It separates the effect of the norms from the effect of the board in c1's 1.0.
  - **Parallel execution (13:47):** the two sequential drivers are replaced by `criba1-lanes.mjs`, with 3 lanes in parallel. Each lane takes the next task × arm combination that is neither done nor locked (lock in `criba1/locks/`). Runs already done are found by the screen's seed. The no-messaging cph run that was in progress continues until it finishes and stays locked. Risk: under load, the grader's performance checks could come out worse; if odd timeouts appear, it has to be looked at.
  - To compare cost: total tokens, turns and non-cached tokens (input + output), with `traces.mjs` and the `usage` events.
- **Rule:** the 1–2 murmur arms with the best mean delta against Pi on the three tasks go to k=2, provided it is > 0. The descriptive comparison n=3 with messages versus without messages, and c4 n=3 versus c4 n=1, serves to improve the messaging, not to decide.

## Criba 2: replication (fixed before measuring, 2026-10-01 16:20)

- **Question:** does a 3-agent arm beat a single agent with the same prompt level (c4n1)?
- **Arms:** c1, x1 and c5. Each campaign carries c4n1 next to the 3-agent arm; no more Pi is needed, since it already has k=11–13 per task.
- **Tasks:** ieh, cph and durable (with Criba 1 they end up at k=2), plus `feature_implementation_hard` v4 (k=1), because it has headroom: even Pi's best run fails fuzz and replay.
- **Execution:** `experiments/criba2-lanes.mjs`, 3 lanes, seed 20261007, cap 3M per run. Estimate: ~25M.
- **Rule:** an arm beats c4n1 if the mean Δ per task (arm mean − c4n1 mean, pooling Criba 1 and 2) is ≥ +0.05 and it wins on ≥ 3 of the 4 tasks. Δ against the Pi mean and the cost are also recorded. c1, x1 and c5 are not ordered among themselves in durable or ieh, because they are at the ceiling (0.91–1.0).
- **Saturation, calibration change approved (2026-10-01):** the `*_hard2` tasks are calibrated against Pi (k=3) and against c4n1 (k=2, band 0.3–0.6); details in `hard-tasks.md`. The first is `information_extraction_hard2`, under construction with a subagent.
- **Open problem: saturation.** The calibration used Pi as the reference and the good arms touch the ceiling in durable and ieh. To order candidates, tasks with headroom above c4n1 are needed.

## Criba 3: mechanisms against the broken file (fixed before measuring, 2026-10-01 17:30)

- **Question:** which mechanism prevents the broken shared file (and the abandonment that follows) without paying c5's cost.
- **Arms (n=3 except the control):**
  - c4g-guard: c4n1 with `writeGuard`; it is the single-agent control.
  - x1g-guard: x1 with `writeGuard`, chosen by the user.
  - x1g-lock (A): x1g with claims that block and expire after 120 s without writing.
  - x1g-stale (B): x1g with version control; a `write` on a file that changed since the agent read it is rejected.
  - x1g-parts (C): x1g with claims on parts of the task instead of files.
  - c5: winner of Criba 2, as a reference.
- **Tasks:** ieh v1, fih v4 and durable (multi-file control), with k=2. cph is left out: plateau at 0.37.
- **Execution:** `experiments/criba3-lanes.mjs`, 3 lanes, seed 20261012, cap of 3M per run. The four x1g variants share a campaign with c4g (x1 never reached the cap); c5 goes separately, also with c4g. Estimate: ~48M.
- **Rule:**
  - an n=3 arm is a candidate if its mean exceeds c4g's by ≥ +0.05 on the task average and it scores no 0.00 in ieh;
  - among candidates, best score per M of tokens;
  - the mechanism (A, B or C) contributes if it beats x1g-guard by ≥ +0.05 without raising tokens by more than 30 %.
- **Incident (17:40):** x1g-guard uses up the 3M in fih (with score 1.0) and swarmtest stops the grouped campaign after the first run. The assumption that x1 does not reach the cap was false in fih. What is missing is relaunched with one campaign per arm (`criba3-lanes.mjs <lane> --per-arm <task>`). The grouped ieh campaign was also cut (5 of 10 runs) and at 18:02 its per-arm pass was launched (lane 5). The grouped durable one finished entirely (10 of 10). The c5 ones were cut in ieh (2 runs) and in durable (3 runs) because c5 reaches the cap. c5 is missing repetitions in those two tasks, and `--per-arm` does not include it: it has to be relaunched with one campaign per repetition (repetitions 1), so that a cut does not take the rest with it.
- **Reload (18:31–18:43).** c5 in durable already had k=2: the cut of `e7029fb2` took away c4g's second repetition, not c5's. Only c5 in ieh was missing, and a campaign with `repetitions: 1` was launched (`criba3/c5-ieh-r1.json`, `ea037e72`): 0.54, cut at 3M again. `--per-arm` does not complete what is missing, but adds 2 repetitions per arm, so fih x1g-guard ends up with k=3 and c4g with k=3–7 per task. For ieh lock, stale and parts (each was missing 1 run) their locks were reserved and three 1-repetition campaigns were launched (`criba3/topup-ieh.sh`), with the user's OK. The c4g control mean uses all its runs per task. Spend of the screen at 18:30: 47.3M.
- **Result and rule applied (19:00; mean per task ieh / fih / durable, tokens per run):**
  - c4g-guard (control): 0.73 (k8) / 0.79 (k10) / 0.46 (k3), mean 0.66, 0.37M.
  - c5: 0.76 / 1.00 / 0.96, mean 0.91 (+0.25 against c4g), 2.69M; 3 of 6 runs cut at 3M; score/M 0.34.
  - x1g-guard: 0.80 (k3) / 1.00 (k3) / 0.63, mean 0.81 (+0.15), 1.52M; score/M 0.53.
  - x1g-lock (A): 0.80 / 0.73 / 0.98, mean 0.84 (+0.18), 1.39M; score/M 0.60.
  - x1g-stale (B): 0.77 / 0.94 / 0.65, mean 0.79 (+0.13), 1.31M; score/M 0.60.
  - x1g-parts (C): 0.15 / 1.00 / 0.92, mean 0.69 (+0.03), 0.98M; scores 0.00 in ieh: the three agents yield the implementation within 1 minute.
  - **Candidates:** c5, x1g-guard, x1g-lock and x1g-stale. parts does not pass: +0.03 and a 0.00 in ieh. **Best score/M among candidates:** lock and stale tie (0.60), ahead of guard (0.53) and c5 (0.34).
  - **Mechanisms:** none beats x1g-guard by ≥ +0.05 (lock +0.03, stale −0.02, parts −0.12). By the rule, A, B and C do not contribute. lock's advantage depends on durable (0.98 versus 0.63, k=2), and in fih it loses (0.73 versus 1.00).
  - Total spend: 59.1M in 15 campaigns (initial estimate 48M).
- **Round 4, prepared (not launched; merged into round 5A on 2026-10-01 19:40):** levers `relay`/`relayContext`, `doneAfterGreen` and `clock`, and the profiles x1g-relay, c4g-relay (n=1, compute-matched control), x1g-evidence (15 calls after the green and a clock) and x1g-select (attempts in `attempts/`, probes per agent, attempt × probe matrix in SCORES.md, install the best, port what is missing). Smoke test: the relay found and fixed a real bug that the first instance had accepted.
- **In parallel:** `ledger_reconciliation_hard`, a small task with only the ledger families, to address saturation.

### Findings of the adversarial review (2026-10-01 19:00; code, Pi SDK and 302 runs)

- **The comparison that decides the thesis is missing:** the same profile at n=3 versus n=1. The only pair (c4 n=3 k=1 versus c4n1 k=3) ties. The recent levers (relay, doneAfterGreen, clock) also serve n=1. **New rule:** each candidate profile also runs at n=1, with the same file and in the same campaign.
- **Check predicate (fixed in `src/`):** before, any bash containing the command counted as a check. It gave false greens on quoted mentions (`echo '... npm run test ...' >> SWARM.md`: 6 of 171 first greens) and with the exit status masked (`check; cp ...`: 1 confirmed). Now the check has to open a statement outside quotes and cannot be followed by `|`, `;` or `||`. `traces.mjs` keeps the old predicate, so the historical numbers do not change; the Spearman 0.72–0.80 holds (≤ 6 % doubtful first greens).
- **`arms.mjs` biased against expensive arms:** a run that hits the cap stops the campaign before its pair runs, and `arms.mjs` discards the incomplete pair as "skipped". The screens' tables use pooled Pi means and are not affected.
- **`/tmp` shared between lanes:** 212 calls write to `/tmp` with fixed names (`/tmp/wrenplan.json`), and agent names are the same in all runs. There may be contamination between concurrent runs; unverified.
- **Pending, not fixed:**
  - if `end()` arrives during `open()`, a relay starts a session without aborting, so the budget is not a hard cap in relay arms;
  - `done` does not return `terminate: true` (14 agents kept acting after `done`; 2 edited);
  - the code version is not recorded in each run;
  - the graders are reachable from the workspace (`../../../tasks/<t>/grader.py`) with unsandboxed bash (0 accesses observed).
- **DeepSWE:** see the registry row. Also, the reward is binary (`tests/test.sh`: 1 only if base and new pass), so partial credit is needed for it to discriminate.

## Round 5: coordination (fixed before measuring, 2026-10-01 19:11)

Motivation: the swarm in OpenAI's July 2026 incident won by pooling discoveries between agents with different tasks, by reassigning effort toward the stuck ones and by asking for help when stuck. It did not win by splitting a single file. Here those two routes are tested separately. The round absorbs x1g-select from round 4.

**New levers** (off by default; smoke in the registry):
- `findings`: tool `finding(text, command)`. murmur runs the command and posts the claim with its real output and exit code.
- `helpAfter`: after N calls with the check red or not run, and when an agent finishes without a pass, murmur posts on the board that it may need help.

### A: within a task, merged with round 4 (fixed before measuring, 2026-10-01 19:40, code `46e756b`)

It merges round 4, which the Criba 3 analysis proposed, with 5A. Criba 3 leaves two failures: **yielding** (agents that do `done` with "X owns extract.py") and **stopping as soon as the green appears** (durable: 2/2/2 calls after the green). The broken file is already solved with the guard.

- **Main theory: coordination versus compute.** Tasks ieh v1 and `information_extraction_hard2` (both with headroom; durable is not included because select and c5 already score ~0.96 there), k=3.
  - S3 = x1g-select n=3 (each agent builds its own attempt: it attacks yielding);
  - S3c = x1g-coord n=3 (S3 + `findings` + `helpAfter: 25` + "a message is information, not an order");
  - R4 = c4g-relay4 n=1 (c4g-relay with 4 relays instead of 2, so that it can spend ~2M versus S3's ~2.7M).
- **Secondary theory: evidence gate (what round 4 proposed).** Tasks ieh v1 and durable, k=2.
  - E3 = x1g-evidence n=3;
  - E1 = c4g-evidence n=1 (c4g-guard + `doneAfterGreen: 15` + `clock`), which also goes as the filler single agent in all the S3, S3c and E3 campaigns.
  - References from Criba 3, not repeated (their behaviour does not change with `46e756b`): x1g-guard and c4g-guard.
- **Out:** x1g-relay (always hits the cap; the idea stays measured with R4) and cph (plateau at 0.37 for everyone).
- **Execution:** `experiments/criba5-lanes.mjs`, one campaign per task × arm × repetition with `repetitions: 1`, seed 20261015, cap of 3M per run. R4 goes in its own campaigns (if it hits the cap it only stops itself). 3–4 lanes. **Launched 2026-10-01 19:23** (4 lanes, 22 campaigns). swarmtest runs the n=3 arm before the E1 filler, so if the n=3 hits the cap, E1 does not run in that campaign (only E1's k goes down). Estimate: S3 and S3c ~16M each, R4 ~12M, E3 ~7M, E1 filler ~8M: **~60M**.
- **Rule (fixed before measuring):**
  - **communication contributes** if S3c − S3 ≥ +0.05 in the mean of ieh and ieh2 and it wins on both, without raising tokens by more than 30 %;
  - **the swarm contributes** if the better of S3/S3c beats R4 by ≥ +0.05 and wins on both tasks. If R4 spends less than half the tokens of that arm and loses, the conclusion is "not decided because of compute", not "coordination wins";
  - **the gate contributes in the swarm** if E3 beats x1g-guard (Criba 3) by ≥ +0.05 in the mean of ieh and durable and scores no 0.00 in ieh; **in a single agent**, if E1 beats c4g-guard (Criba 3) by ≥ +0.05;
  - runs cut at 3M count with their score (it is a floor) and are marked; if an arm has ≥ 1/3 of its runs cut, this is stated explicitly when comparing.
- **Risks to look at in the traces:** with the gate, the one who yields stays idle until someone posts, and the rejection tells them to end the turn without `done`, which can end in `quiescent` with work half done. Board-only turns are already 31–45 % of tokens at n=3: measure whether `finding` raises them. At n=1, the x1g-* prompt says "Teammates: none"; it does not apply here because the n=1 controls are c4g-*.
- **Descriptive:** number of `finding` calls and help notices (`help` events, not `post`), whether after a notice another agent touched the area that was failing, and calls after the first green per arm.

- **Result and rule applied (2026-10-01 22:00; per-task means, tokens per run, cut at 3M):**

  | arm | ieh | ieh2 | durable | tokens/run | cut |
  |---|---|---|---|---|---|
  | S3 x1g-select n=3 | 0.60 (k3) | 0.32 (k3) | — | 1.5 / 2.3M | 0 / 2 |
  | S3c x1g-coord n=3 | 0.42 (k3) | 0.17 (k3) | — | 1.3 / 2.0M | 0 / 1 |
  | R4 c4g-relay4 n=1 | 0.92 (k3) | 0.62 (k3) | — | 1.2 / 1.1M | 0 / 0 |
  | E3 x1g-evidence n=3 | 0.36 (k2) | — | 0.99 (k2) | 3.0 / 2.9M | 2 / 1 |
  | E1 c4g-evidence n=1 | **0.995 (k6)** | **0.99 (k3)** | no data | 2.1 / 3.0M | 0 / 3 |

  - **Communication does not contribute:** S3c − S3 = −0.18 in ieh and −0.15 in ieh2; it loses on both. They barely used `finding` (4 times in 6 runs); there were 19 help notices.
  - **The swarm does not contribute:** the best n=3 (S3) stays 0.32 and 0.30 below R4, which also spends fewer tokens. What follows is the opposite: a single agent with relays beats the swarm.
  - **The gate in the swarm does not contribute:** E3 in ieh/durable gives a mean of 0.67 versus x1g-guard's 0.715 (Criba 3), and scores 0.03 in ieh.
  - **In a single agent, E1 beats c4g-guard** (Criba 3: ieh 0.73, k8) by +0.27 in ieh. In ieh2 it scores 0.99, versus c4n1's 0.18 in calibration. It costs 5–8 times more tokens (the 3 ieh2 runs reach the cap without calling `done`).
  - **Note, the cause is not the gate:** E1 has **0 `done_refused` events**, so the gate never acted. The other difference from c4g-guard is `clock` (minutes remaining, added to each tool result). Hypothesis: the clock keeps the agent working because it sees it has time to spare. A c4g-clock arm (clock only) is needed to separate it.
  - durable has no E1: the two E3 runs ended by timeout or budget and swarmtest stopped the campaign before the filler.
- **Conclusion of round A:** what moves the score most is still the persistence of a single agent (clock or relays), not coordination. The n=3 arms lose even with the same starting prompt.

### B: several tasks at once (batch)

- **Question:** with M tasks at once and a fixed total budget, does coordination improve on isolated agents with the same budget?
- **Arms:**
  - I (isolated): one fixed agent per task, no board;
  - R (reassignment): each agent chooses a task with a claim and, when done, moves to another unsolved one; no messages;
  - E (swarm): R + board + `findings` + `helpAfter` + the messages line as data.
  - Nobody assigns tasks: in R and E the agents choose them.
- **Batches:**
  - L1 with existing tasks (ieh v1, durable, `ledger_reconciliation_hard`, ieh2). They are dissimilar, so it mostly measures reassignment.
  - L2 with the `fam_*` family (4 tasks of the same type, under construction in `swarmtest/staging/`), which measures knowledge transfer.
- **Unit of measurement:** the batch. Score = mean of the per-task scores; k=3 batches per arm and family; the board starts empty in each batch.
- **Rule:**
  - E beats I if the mean Δ is ≥ +0.05 and it wins on ≥ 2 of 3 batch pairs, in each family separately;
  - R − I (reassignment) and E − R (communication) are descriptive.
- **Requirements before the first run:**
  - a batch driver in `experiments/`: one workspace per task and scoring with `swarmtest.grading.grade` imported, without touching swarmtest;
  - murmur support for several tasks (one check per task for evidence and help);
  - **mandatory isolation** (Docker, network only to the model API, graders out of the agents' reach), because B reproduces the structure of the incident;
  - L2 validated offline and calibrated with I (0.3–0.6 per task).
- **Parameters (fixed 2026-10-01 20:00, before B's first run; user request: agents and tokens proportional to the batch):**
  - M = 4 tasks per batch; B = 1.5M tokens per task; 20 min of clock in all arms (the agents work in parallel).
  - I: 4 single-agent runs (`c4g-guard`), one per task, at the same time, with B each.
  - R: `b-realloc` (c4g-guard + claim/release/team, no messages), 4 agents, 4×B shared.
  - E: `b-swarm` (R + post + `finding` + `helpAfter: 25` + "information, not orders"), 4 agents, 4×B.
  - The last two receive a neutral goal: 4 subfolders with their TASK.md and one check per task (`npm run test:<id>`, which murmur knows from the task's `checks` field).
  - L1 = ieh, durable, `ledger_reconciliation_hard`, ieh2. L2 = `fam_billing`, `fam_shipments`, `fam_clinic`, `fam_payouts` (validated offline: solution 1.0, stub 0.0, transfer probe 0.24–0.64; read from `staging/`, without going through `tasks/`).
  - k=3 batches per arm and family.
  - **L2 calibration before measuring R/E:** the first I batch of L2 serves as calibration. If any task scores < 0.1 or > 0.9, it is adjusted before continuing and that batch does not count.
  - **Driver:** `experiments/batch/run-batch.mjs <batch> <arm> <rep> <image>`. Lane: `experiments/batch/lane.sh <batch> <image>` (I, R and E interleaved per repetition). **L1 launched 2026-10-01 19:31** with `murmur-batch:a5a95a58e2`, one lane, in parallel with round A. Ambiguity review of L2 (independent agent, read-only): all 4 are fine, with no ambiguity carrying hidden weight; 11 one-sentence clarifications were applied to the contracts (the largest, in payouts: "a sale discarded for lack of fx is not a kept sale", ~15–20 % of the weight). Re-verified: stub 0.0, solution 1.0. **L2 calibration (I r0) launched 2026-10-01 19:40.** **Result (19:43): saturated.** Isolated c4g-guard scores billing 0.94, shipments 1.0, clinic 1.0 and payouts 1.0, with 9–15 calls and ~66k tokens per task, in 1.9 min. No leak: 17-line stub and its own 150–190-line solution. By the rule, L2 v1 is not measured and this batch does not count. It confirms what AGENTS.md says: contract tasks saturate. **Replacement: L3, an optimisation family** (`opt_*`: routes with windows, shop, packing, shifts; score = (naive − cost)/(naive − best_known), no practical ceiling), under construction in `staging/` with a subagent. It fits B better: an optimisation task is never finished, so free agents can always help, and search techniques transfer. Same parameters as L1/L2, and calibrated the same way (I r0; band 0.1–0.9 per task). **L3 validated offline (20:15):** stub 0.0; greedy 0.26–0.37; solution/ 0.84–0.87 (I verified it with `grade`); best_known comes from the same SA with 10–100 times more iterations, so the real headroom is between 0.85 and 1.0 and a better algorithm can reach 1.0. Transfer probe: the routes SA skeleton adapted to packing with ~30 lines scores 0.89. There is transfer, and also a risk of saturating near 0.9. Limit of 10 s per instance: sensitive to load. **L3 calibration (I r0) launched 20:16.** **Result:** routing 0.33, shop 0.81, packing 0.07, roster 0.89 (mean 0.52; 0.25M tokens; 1.6 min; all 4 finish with done). packing falls below 0.1, so the rule is applied. It is not a contract defect: the solution is feasible on all 4 instances and only 1–4 % better than naive (a 64-line heuristic in 11 calls, and the agent stops). Remedy from `hard-tasks.md` for tasks below the band (move information into `public_check`): in all 4 tasks, `npm run test` also prints the score of the visible instance with the same formula and its own best_known. Pass/fail does not change. This batch does not count; it is recalibrated with I r0 after the change. **Recalibration (20:45):** routing 0.16, shop 0.35, packing 0.56, roster 0.89 (mean 0.49; 0.25M; all 4 with done in 1.5 min). All four in band, so it counts as I r0. High variance between the two calibrations (shop 0.81→0.35, packing 0.07→0.56), which justifies k=3. **L3 lane launched 20:46** (`lane.sh L3`). **Infrastructure failure in L1 r2:** the E r2 container and the durable one in I r2 were killed on reaching 28 min without a result. Probable cause: the CLI's final check (10 min) plus high load; 20 + 10 exceeded the limit, and `runs/` was only copied at the end. Fix in the driver (21:50): direct `runSwarm` with a 2 min final check, `timeout` inside the container and `runs/` always copied. Smoke S OK. E r2 and I r2 are repeated in full (the decision depends only on the failure, not on the score); the failed ones stay in `*-infrafail`.
- **L3 result (k=3, rule applied 22:00):** I 0.526 (0.24M/batch), R 0.439 (0.48M), E 0.452 (0.51M). E − I = −0.07, loses all 3 pairs: **E does not beat I in L3**. Descriptive: R − I = −0.09, E − R = +0.01. **Finding:** all arms finish in ~2 min with < 10 % of the budget. The public check passes as soon as naive is exceeded, so there are no help notices and no reason to reassign: B's mechanisms activate with red checks, and in optimisation the check is green right away. In routing, E scores 0.02–0.03 in 2 of 3 batches (to look at in the traces: infeasible output?).
- **L1 result (k=3, rule applied 22:40; r2 repeated after the infrastructure failure):** I 0.419 (1.62M/batch), R 0.338 (1.49M), E 0.593 (4.94M). E − I per repetition: +0.41, +0.19, −0.08; mean +0.17, wins 2 of 3. **E beats I in L1.** Per task (E / I): ieh 0.73 / 0.78, ieh2 0.19 / 0.16, durable 0.64 / 0.53, ledger 0.81 / 0.22 (ledger is bimodal: persisting leads to ~1.0). Descriptive: R − I = −0.08; E − R = +0.26.
- **Verdict B by family:** yes in L1 (tasks with a red check), no in L3 (optimisation, check green right away). **Mechanism, according to the traces:** R and E reassign equally (2–4 folders per agent). E is distinguished by the board: ~5 help notices and 10–18 posts per batch in L1, versus 0–1 notices in L3; `finding` 1–2 times per batch. E spends 3 times more tokens than I with the same budget available: the isolated ones stop and leave ~75 % unused. **Reading:** E's advantage in L1 fits "the board keeps agents working" (persistence induced by the others), not knowledge transfer. The missing control is I with its own persistence (clock), given what was seen in round A.
- **Two traces that qualify this (22:50):**
  - **routing in L3 E:** in r1 the solution is feasible but barely improves on naive (little effort). In r2 coordination does harm: robin writes `solve.py`, releases it, and 5 min later finch rewrites it entirely; the result is worse than naive on 2 instances and exceeds 10 s on another. It is the failure of overwriting work, now induced by reassignment. `writeGuard` does not stop it because it is a complete file.
  - **x1g-evidence in ieh (0.03 and 0.68):** 0 gate rejections and 0 `done`. The 3 agents use up the 3M with 39–47 % of calls on the board (88 work calls in total). It is not the gate's trap: it is coordination overhead with agents that do not stop.
- **The three mechanisms of the incident, against the data:**
  - **help for the stuck:** it only fires with a red check (5 per batch in L1, 0–1 in L3, 19 in round A); in L1 it keeps agents working;
  - **reassignment:** it happens equally in R and E, and by itself it **subtracts** (R − I = −0.08 in L1 and −0.09 in L3), besides overwriting work;
  - **knowledge transfer:** not observed (`finding` 1–2 times per batch).
- **Calibration of the wording:** "coord < select" is a negative point estimate with k=3 and a lot of variance, not an established effect; the rule fails all the same. What is robust is that R4 > all the n=3 arms in ieh (its 3 runs ≥ 0.87). In L1, the repetition due to infrastructure moved the result against E (the failed I r2 does not change much; the repeated E r2 is its worst batch): E meets the rule, but the rule is weak (k=3, +0.17, 3 times the tokens).
- **Real isolation (weaker than pre-registered; note it when interpreting):**
  - each run goes in Docker (`murmur-batch:<src hash>`) and only sees its folder, plus a filtered copy of the credentials (`openai-codex` only);
  - the graders, the other tasks and the other executions are out of its reach;
  - the network is **not** restricted to the model API;
  - scoring is done afterwards, on the host, with `swarmtest.grading.grade`.

## Campaign registry

| Date | Phase | Arms | Tasks × k | Tokens | Result | Decision |
|---|---|---|---|---:|---|---|
| 2026-09-30 | smoke adapter | murmur n=3, n=1 | bug_fixing × 1 | 148k | 1.0 / 1.0 (hidden grader) | adapter valid |
| 2026-09-30 | F0 smoke | relay n=2 (forced wake) | relay × 1 | 37k | all_done, check OK | idle→wake path verified |
| 2026-09-30 | F0 smoke | quiet n=1 | hello × 1 | 1k | quiescent | end by quiescence verified |
| 2026-09-30 | F0 smoke | swarmtest murmur n=1 ± no-messaging | bug_fixing × 1 | 35k | 1.0 / 1.0 | variants and profile hash OK |
| 2026-09-30 | F0 smoke | autotuner murmur n=1 (Docker) | toy_001 × 1 | 17k | passed, clean patch | adapter OK; toy gives 10 s per task, use own timeoutMs |
| 2026-09-30 | F1 (stopped) | pi n=1, murmur n=1, n=3, n=3 without messages | 8 × 2 (6/64 done) | ~0.5M | bug_fixing saturates (1.0 for all); Pi durable 0.48 | stopped: too many runs to look for big effects |
| 2026-09-30 | F1a screen (`20260930T185151Z-58c677b9`) | pi n=1 vs murmur n=3 | 3 workflow × 1 | 2.73M | durable 0.05 → 0.99; incremental 0.83 → 0.95; complex 0.885 = 0.885 (same 3 failed cases); delta +0.35, CI90 [+0.04, +0.66]; tokens ×7.8 | signal by the rule (durable ≥ 0.85). Pi durable 0.05 = stopped after 9 calls without touching engine.py. In durable the prompt says "The solo Pi run implements all modules itself": murmur read it as one implementer + two reviewers |
| 2026-09-30 | F1b (`20260930T193821Z-04146f7e`) | pi n=1, murmur n=3, murmur n=3 without messages | 3 workflow × 1 | 3.87M | durable 0.44 / 0.59 / 0.65; incremental 0.918 / 0.962 / 0.887; complex 0.885 all three (same 3 cases, as in F1a: ceiling or ambiguous contract). F1a+F1b pi vs murmur n=3: delta +0.21, CI90 [+0.03, +0.39], 2 won 1 tie, tokens ×8.4. n3 vs without messages: +0.006 [−0.04, +0.05] | the 0.987 in durable does not repeat; the board shows no effect with k=1; complex does not discriminate: out of the screens. Full transcripts from this campaign on |
| 2026-09-30 | F1c (`20260930T211945Z-1ede12d2`, stopped at 2/8) | pi n=1, murmur n=3 c1/c2/c3 | 2 × 1 | 1.59M | incremental: Pi 0.805; c3 0.962 cut by budget (1.5M, 1.33M of cache read; 41 steers, 4 revived) | swarmtest stops the campaign if a run ends by budget; raised to 3M and steers are queued in `all` mode |
| 2026-10-01 | calibration (`20261001T064603Z-8fda3442`) | pi n=1, murmur n=3 | 4 new tasks × 1 | ~0.7M | constrained_planning, data_analysis, feature_implementation, information_extraction: 1.0 on everything (Pi 10–20k tokens, 20–30 s) | saturated. In swarmtest only `durable` discriminates |
| 2026-10-01 | DeepSWE (trace reading, no cost) | — | — | 0 | Pi 0/12: harness OK, stops after 4–15 turns declaring work incomplete; binary reward; ArcSwarm 9/12 blocked at startup | no signal today; usable with partial credit + murmur adapter for pier |
| 2026-10-01 | calibration `data_analysis_hard` v1 (`20261001T075538Z-291d75ce`) | pi n=1 | 1 × 3 | 0.43M | 0.0 / 1.0 / 0.937 (the 0.0: Pi gives up without writing output) | too easy when Pi persists → v2 with new families |
| 2026-10-01 | calibration `feature_implementation_hard` v1 (`20261001T080642Z-ccca7e96`) | pi n=1 | 1 × 3 | 0.39M | 0.821 / 0.875 / 0.903 (mean 0.866); fails mostly fuzz and replay (interactions) | too easy → v2 with new interacting operations and more weight on long scenarios |
| 2026-10-01 | calibration `data_analysis_hard` v2 (`20261001T081433Z-f7132825`) | pi n=1 | 1 × 3 | 0.47M | 0.04 / 1.0 / 0.413 (mean 0.48). The two low ones: Pi gives up after 13 and 6 calls ("I wasn't able to complete", "the report is incomplete"); when it persists it scores 1.0 | in band by the mean, but bimodal: it measures persistence in the face of volume, not hard reasoning; ceiling 1.0 for a system that persists |
| 2026-10-01 | calibration `information_extraction_hard` v1 (`20261001T082033Z-ee8d2860`) | pi n=1 | 1 × 3 | 1.16M | 0.679 / 0.296 / 0.765 (mean 0.58), continuous; Pi stops after 12–20 calls with the public check still red | calibrated |
| 2026-10-01 | calibration `constrained_planning_hard` v1 (`20261001T082842Z-5001af2c`) | pi n=1 | 1 × 3 | 0.29M | 0.391 / 0.361 / 0.202 (mean 0.32), continuous; Pi stops after 8–11 calls without a feasible plan and with the public check red | calibrated (lower part of the band) |
| 2026-10-01 | calibration `feature_implementation_hard` v2 (`20261001T084457Z-bf8603a4`) | pi n=1 | 1 × 3 | 0.46M | 0.096 / 0.268 / 0.055 (mean 0.14); Pi gives up after 10–16 calls ("not complete") with a 28 KB contract | too hard → v3: remove units and partial commit, keep transfers and recalls |
| 2026-10-01 | calibration `feature_implementation_hard` v3 (`20261001T085954Z-91efd0c5`) | pi n=1 | 1 × 3 | 0.45M | 0.227 / 0.405 / 0.0 (mean 0.21); 25 KB contract; Pi gives up after 11–13 calls | just below the band → v4 without recalls (~21 KB) |
| 2026-10-01 | calibration `feature_implementation_hard` v4 (`20261001T091411Z-ba74e288`) | pi n=1 | 1 × 3 | 0.51M | 0.099 / 0.076 / 0.682 (mean 0.29); 21.9 KB contract; two runs give up after 13–14 calls with the package broken, one persists | barely in band, bimodal like data_analysis_hard |
| 2026-10-01 | criba 1 (`20261001T101927Z-f44c2308` → `20261001T130110Z-80b74b2c`, seed 20261006; one arm + Pi per campaign from 12:46, 3 lanes from 13:47) | pi n=1 (k=11–13 per task); murmur n=3 default, nomsg, c1–c6, x1–x4; c4 n=1 | 3 tasks (ieh, cph, durable) × 1 | 65.2M | mean Δ against the Pi mean (ieh 0.26, cph 0.35, durable 0.50): c5 +0.43 (2.46M), c1 +0.42 (2.04M), x1 +0.39 (1.37M), c3 +0.37 (2.56M), c2 +0.27, c4n1 +0.25 (0.36M), c4 +0.22, x4 +0.21 (0.91M), nomsg +0.21 (0.51M), x3 +0.15, default +0.10 (1.19M), c6 +0.06, x2 −0.08. 10 of 39 murmur runs cut at 3M | the rule picks c5 and c1 for k=2; x1 is tied within the noise and is the cheapest of the first four; c4n1 is the essential attribution control. Pending the user's OK |
| 2026-10-01 | criba 2, replication (`20261001T141956Z-895b323f` → `20261001T144902Z-3b8cf33c`, seed 20261007, 3 lanes; 9 campaigns failed at startup because of a half-built task in `tasks/` and were relaunched) | c1, x1 and c5 (n=3), each with c4n1 | ieh, cph, durable (k=2 with criba 1) + fih v4 × 1 | 26.0M | Δ against c4n1: c5 +0.22 (wins 4 of 4), c1 +0.09 (2 of 4), x1 −0.04 (1 of 4). c1 and x1 score 0.00 in ieh because of a broken file | c5 passes. Next step: mechanisms against the broken file (isolation versus `writeGuard`) and cheaper than c5, on ieh2 when it is calibrated |
| 2026-10-01 | calibration `information_extraction_hard2` v1 (`20261001T145854Z-eaf8ca35` Pi, `20261001T145858Z-d9c26c9f` c4n1) | pi n=1, c4n1 | 1 × 3 | ~2.3M | Pi 0.00 / 0.11 / 0.15 (mean 0.09); c4n1 0.00 / 0.29 / 0.26 (mean 0.18). Nobody scores even a point on the ledger families and the ieh v1 level is not even reached. The 0.00 of c4n1 is an accidental overwrite. Everyone stops at 3–6 min out of 20 admitting they have not finished. 31.7 KB contract and 34 KB solution in one file | too hard because of volume, not reasoning (same as fih v2–v4). Below c4n1's band (0.3–0.6) |
| 2026-10-01 | calibration `ledger_reconciliation_hard` v1 (`20261001T154556Z-815af3aa` Pi, `20261001T154559Z-2d624144` c4n1) | pi n=1, c4n1 | 1 × 3 | ~1.4M | Pi 0.88 / 0.22 / 0.26 (mean 0.45); c4n1 1.00 / 0.32 / 0.99 (mean 0.77). Bimodal: whoever insists reaches ~1.0 and whoever stops early stays at ~0.25 | above c4n1's band (0.3–0.6). Useful to separate Pi from a persistent agent, not to order strong candidates. Same pattern as the rest: contract tasks saturate as soon as one insists. cph is the only one with open headroom (plateau at 0.37 due to feasibility and quality steps against the reference) |
| 2026-10-01 | criba 3, mechanisms against the broken file (15 campaigns `20261001T153217Z-2833b805` → `20261001T165207Z-cc8a515c`, seed 20261012; grouped, then per arm, and 1-repetition reload) | c4g-guard n=1 (control, k=3–10 per task, mean with all its runs); x1g-guard, x1g-lock, x1g-stale, x1g-parts and c5 (n=3) | ieh v1, fih v4 and durable × 2 (x1g-guard k=3 in ieh and fih) | 59.1M | mean of the 3 tasks: c5 0.91 (2.69M), lock 0.84 (1.39M), guard 0.81 (1.52M), stale 0.79 (1.31M), parts 0.69 (0.98M; 0.00 in ieh), c4g 0.66 (0.37M). 5 runs cut at 3M (c5 ×3: 2 in ieh and 1 in durable; guard in fih; stale in ieh) | candidates: c5, guard, lock and stale; by score/M, lock = stale (0.60) > guard (0.53) > c5 (0.34). No mechanism beats guard by +0.05, so A, B and C do not contribute by the rule. The basis for round 4 is pending the user's OK |
| 2026-10-01 | smoke round 5 (`runs/20261001-170848-f6f1`, `-0eda`) | murmur n=2 with `findings` + `helpAfter: 3` (scripted); trio n=3 default | smoke × 1, trio × 1 | 35k + 155k | `finding` posts `[exit 0]` with the real output; help at 3 calls without a check and when doing `done` without a pass, delivered by attach; trio passes with all_done | levers OK; check predicate: 21/21 cases (real false greens, `time`/`timeout`/`env`/`VAR=` wrappers, check with quotes → exact containment) |
| 2026-10-01 | smoke round 5b (`runs/20261001-171406-ebef`) | murmur n=2, the check run via `finding` | smoke × 1 | 34k | no help notices: a green check via `finding` counts as running the check | fix verified (before, x1g-coord would have asked for help for agents that were green) |
| 2026-10-01 | smoke round 5B (batch S = bug_fixing + data_analysis, Docker `murmur-batch:a5a95a58e2`) | b-swarm (4→2 agents), c4g-guard × 2 isolated; scripted from `checks` with `helpAfter: 3` | 1 batch E, 1 batch I, 1 scripted | 111k + 51k + 34k | E: 1.0/1.0, split by claim, quiescent; I: 1.0/1.0 in parallel; help notice with the part (`test -f part_a.txt`) | driver and `checks` OK. Fix: Node's `cpSync` fails on macOS mounts → the run goes on the container's disk and `runs/` is copied back |
| 2026-10-01 | round 5A (22 campaigns `20261001T172348Z-2db1b717` → `20261001T182345Z-f27c7ed5`, seed 20261015, code `46e756b`) | x1g-select, x1g-coord, x1g-evidence (n=3); c4g-relay4, c4g-evidence (n=1) | ieh, ieh2 × 3; ieh, durable × 2 | 61.7M | coord < select (−0.15/−0.18); R4 > best n=3 (+0.3); E1 c4g-evidence 0.995 ieh (k6) / 0.99 ieh2 (k3) with 0 `done_refused` (the clock?) | communication and swarm do not contribute; single-agent persistence does; try c4g-clock |
| 2026-10-01 | round 5B (Docker `murmur-batch:a5a95a58e2`, batches of 4 tasks, 4 agents, 4×1.5M) | I (c4g-guard ×4 isolated), R (b-realloc), E (b-swarm) | L1 × 3, L3 × 3 (+ calibrations of L2, saturated, and L3) | 28.3M | L1: E 0.593 / I 0.419 / R 0.338 (E wins 2/3); L3: I 0.526 / E 0.452 / R 0.439 (all stop at ~2 min) | E beats I only where the check is red; the I + clock control is missing |
