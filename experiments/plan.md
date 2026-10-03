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

## Round 6: persistence versus coordination (fixed before measuring, 2026-10-02 08:35)

Motivation: two results of round 5 may be persistence rather than the mechanism they were credited to. (1) c4g-evidence (n=1) scores 0.995 on ieh (k6) and 0.99 on ieh2 (k3), but its gate never refused a done (0 `done_refused`), so the likely ingredient is `clock`. (2) In L1 batches the swarm E beats isolated agents I by +0.17 (2 of 3), but it spends 3x the tokens, and the isolated agents stop early with ~75 % of their budget unused. Round 6 gives the single agents the clock and asks whether anything is left for coordination.

No new lever: `clock` exists and is documented. The code is the current `src/` (hash `a5a95a58e2`, the same as the batch image). Two new profiles, each a new file:
- `c4g-clock` = c4g-guard + `"clock": true`. It differs from c4g-evidence only by `doneAfterGreen: 15`.
- `b-swarm-clock` = b-swarm + `"clock": true`.

### 6A: is the clock the ingredient? (swarmtest, n=1 arms)

- **Arms (all n=1):** C = c4g-clock; G = c4g-guard; E1 = c4g-evidence.
- **Tasks:** ieh, ieh2, `ledger_reconciliation_hard`.
- **k:** 3 fresh runs for C and G on all three tasks; 3 fresh runs for E1 on ledger only.
- **Reuse of round 5A (explicit):** E1 on ieh and ieh2 reuses its round 5A runs (ieh k6, ieh2 k3, seed 20261015). Justification: the code path of an n=1 c4g-evidence run is unchanged since `46e756b` (the only change in `src/` since then, `6ce0bef`, adds per-part `checks` for batches and refactors the board constructor; with no `checks` and no `helpAfter` the behaviour is identical, and `guard`/`doneAfterGreen`/`clock` are untouched). Confound, to be stated with the result: those runs are from 2026-10-01, another day and another load. G's 8 criba 3 runs on ieh (mean 0.73) are context only; the rule uses G's fresh runs.
- **Execution:** `experiments/criba6-lanes.mjs`, one campaign per task × arm × repetition with `repetitions: 1`, seed 20261020, base config `criba3.json` (cap 3M per run, 20 min), 21 campaigns, 4 lanes, repetitions interleaved across arms. Each campaign holds only its arm (all are single agents), so a capped run stops only itself.
- **Rule (per-task means, primary statistic the mean over the 3 tasks; runs cut at 3M count with their score, which is a floor, and are marked; if an arm has ≥ 1/3 of its runs cut this is stated when comparing):**
  - **the clock contributes** if C − G ≥ +0.05 in the 3-task mean and C wins ≥ 2 of 3 tasks;
  - **the clock explains E1** if, in addition, E1 − C < +0.05 in the 3-task mean;
  - **the gate adds something beyond the clock** if E1 − C ≥ +0.05 in the mean and E1 wins ≥ 2 of 3 tasks. This reading is only admissible if E1 has `done_refused` > 0 in the runs that make the difference; with 0 refusals C and E1 are the same treatment (the gate only acts on a done call), and the gap is reported as noise between days or between E1's reused and fresh runs;
  - **the clock is not it** if C − G < +0.05 or C wins < 2 of 3 tasks.
- **What is concluded in each case:**
  - clock contributes and explains E1: the active ingredient of round 5A's best single agent is a visible clock, that is, induced persistence; c4g-clock replaces c4g-evidence as the strong single-agent reference;
  - clock contributes, gate adds with refusals: both matter; the reference is c4g-evidence;
  - clock is not it: E1's 5A result stays unexplained (the gate never fired), and it is treated as possibly a day effect until replicated;
  - in every case tokens per run are reported next to the score (the criterion does not use them, but the claim "persistence wins" is a claim about spending the budget).
- **Descriptive (from `scripts/traces.mjs` and `events.jsonl`):** `done_refused` per run, calls after the first green, minutes used, end reason (done, cap, timeout), tokens per run.
- **Risk:** ledger is bimodal (~1.0 when the agent persists, ~0.25 when it stops), so k=3 on ledger can move the 3-task mean on its own. That is why the rule asks for the mean **and** ≥ 2 of 3 per-task wins. ieh2 clock runs are expected to hit the 3M cap (E1 hit it 3 of 3).

### 6B: the fair batch control (Docker, L1)

- **Arms:**
  - IC: c4g-clock isolated, one agent per task with 1.5M each (the I arm of 5B with a clock);
  - EC: b-swarm-clock, 4 agents over the 4 tasks with 6M shared (the E arm of 5B with a clock).
- **Parameters, the same as 5B:** L1 (ieh, durable, ledger, ieh2), M = 4, B = 1.5M per task, 20 min, k=3 batches per arm, board empty in each batch, grading on the host with `swarmtest.grading.grade`.
- **Execution:** `experiments/batch/lane.sh L1 murmur-batch:a5a95a58e2 "IC EC"` (IC and EC interleaved per repetition), one lane, in parallel with 6A. The image was checked against `src/` before the round (hash of the sorted contents of `src/`, `a5a95a58e2`, inside and outside the image). The driver sends IC through the isolated branch (one container per task), like I.
- **Rule (the same shape as 5B):** EC beats IC if the mean Δ over the 3 batch pairs is ≥ +0.05 and EC wins ≥ 2 of 3 pairs.
- **What is concluded in each case:**
  - **EC does not beat IC:** E's advantage in 5B L1 was induced persistence, not coordination. With round 5A, the project reports that for this model and these tasks a single agent that persists is what wins;
  - **EC beats IC:** coordination contributes something beyond a clock in L1. Report the token ratio EC/IC next to it. If IC still leaves more than half of its budget unused, the conclusion is qualified as "the board induces more persistence than the clock", and the traces decide whether there is cross-agent work (help notices followed by another agent's edits in the failing folder; folders edited by ≥ 2 agents) beyond each agent working longer.
- **Descriptive only (different days):** IC − I(5B) is the clock's effect on isolated agents; EC − E(5B) is the clock's effect on the swarm. Per batch: tokens, unused budget, end reasons, help notices, posts, `finding` calls, folders per agent.
- **Infrastructure failures:** a batch whose container dies without a result is repeated in full and the failed one is kept as `*-infrafail` (the decision depends only on the failure, as in 5B).

### 6C (optional, not pre-registered yet)

A stuck signal based on quality for optimisation tasks (L3, `staging/opt_*`), because `helpAfter` only fires with a red check. It needs a new lever, off by default, with its own smoke test. It is decided after 6A and 6B, depending on the budget left and on the user's OK, and gets its own pre-registration and commit before any run.

### Budget (estimated before measuring, from round 5 costs)

- 6A: C 9 runs ≈ 3 × 2.1M (ieh) + 3 × 3.0M (ieh2, capped) + 3 × ~2M (ledger) ≈ 21M; G 9 runs ≈ 5M; E1 on ledger 3 runs ≈ 6–9M. **≈ 33–35M** (upper bound ~41M if every clock run is capped).
- 6B: IC 3 batches × ~4–6M ≈ 15M; EC 3 × ~6M ≈ 18M (E hit 6M in 2 of 3 batches). **≈ 33M** (upper bound 36M).
- **Total ≈ 66–68M**, upper bound ~77M. Re-running E1 on ieh and ieh2 instead of reusing it would add ~15M.

### Round 6 result and rule applied (2026-10-02 09:35; launched 08:36 with the user's OK, code `d9a7510`, `src/` hash `a5a95a58e2`)

Before 6B, a smoke of the IC path on lot S (bug_fixing + data_analysis): two containers, c4g-clock, 1.0 / 1.0, 97k tokens, clock lines present in the transcripts. All 21 6A campaigns and all 6 6B batches finished with exit 0; no infrastructure failure. Spend: 6A 26.5M, 6B 32.2M, smoke 0.1M, **58.8M** in total (estimate 66–68M).

**6A** (per-task means; tokens per run; capped = runs that hit 3M):

| arm | ieh | ieh2 | ledger | 3-task mean | tokens/run | capped |
|---|---:|---:|---:|---:|---:|---:|
| C c4g-clock | 0.999 | 0.990 | 1.000 | **0.997** | 2.22 / 2.93 / 1.40M | 2 of 9 (ieh2) |
| G c4g-guard | 0.525 | 0.189 | 0.588 | 0.434 | 0.28 / 0.65 / 0.26M | 0 of 9 |
| E1 c4g-evidence | 0.995 (5A, k6) | 0.991 (5A, k3) | 0.967 | 0.984 | 2.08 / 3.03 / 1.07M | 3 of 12 (ieh2, 5A) |

- **Rule applied:** C − G = **+0.563**, C wins 3 of 3 tasks: **the clock contributes**. E1 − C = **−0.012** (< +0.05): **the clock explains E1**. `done_refused` = 0 in all 21 new runs, as in 5A, so the gate never acted. Conclusion as pre-registered: the active ingredient of 5A's best single agent is a visible clock, that is, induced persistence; **c4g-clock replaces c4g-evidence as the strong single-agent reference.** C has 2 of 9 runs capped (both ieh2, scoring 1.00 and 0.98), below the 1/3 threshold.
- **Findings from the transcripts** (`criba6-traces.md`; subagent reading of all 21 transcripts, key figures verified by hand: the clock starts at 18.0 because the swarmtest adapter reserves 2 of the 20 min for the final check; G's tool results carry no time line; the quoted stop reasons exist):
  - **G gives up, it does not run out of anything.** 8 of 9 G runs stop on a red check after 15–39 calls and 2–5 of 18 minutes, with 0.2–0.7M of 3M tokens used, saying the work is incomplete ("Cannot finish within this run: npm run test remains failing", "Further implementation and verification are required"). 3 of the 8 end their turn without `done` (quiescent). The ninth stops 9 calls after its first green, at 0.90. None of the 9 mentions time or budget.
  - **C keeps going.** It works 9–14 minutes, reaches green at call 21–67 and makes 19–42 more calls after it, mostly probing edge cases with small `python3 -c` snippets and editing the solution (subagent count, not verified by hand: about 119 solution edits and 28 test-file writes after the first green across the 12 C and E1 runs). On ieh2, where G never reaches green, C does and ends at 0.98–1.0. The 2 capped ieh2 runs were still making productive edits when the cap hit.
  - **Open:** the visible text barely mentions the clock (1 of 12 runs: "time 18m. write full."), and thinking is encrypted. Whether the clock works by correcting a belief that time is short or as a repeated "the session is still open" cue cannot be separated from these traces. A neutral-line control or a tokens-left line would separate them.

**6B** (L1, k=3 batch pairs; batch means; tokens per batch):

| batch | IC c4g-clock isolated | EC b-swarm-clock | EC − IC |
|---|---:|---:|---:|
| r0 | 0.969 (4.79M) | 0.977 (6.04M, budget) | +0.008 |
| r1 | 0.985 (5.63M) | 0.936 (6.04M, budget) | −0.049 |
| r2 | 0.822 (3.70M) | 0.850 (6.01M, budget) | +0.028 |
| mean | **0.925** (4.70M) | **0.921** (6.03M) | **−0.005**, EC wins 2 of 3 |

- Per task (IC / EC): ieh 0.964 / 0.933, durable 0.988 / 0.982, ledger 1.000 / 0.967, ieh2 0.750 / 0.801.
- **Rule applied:** mean Δ = −0.005 < +0.05: **EC does not beat IC.** Conclusion as pre-registered: **E's advantage in 5B L1 was induced persistence, not coordination.** With a clock, isolated agents use 62–94 % of their 6M (I in 5B used ~27 %) and score 0.925 against I's 0.419; the swarm with a clock scores the same as isolated agents with a clock, at 1.3x the tokens.
- **Descriptive (different days):** IC − I(5B) = +0.51; EC − E(5B) = +0.33.
- **Findings from the traces** (`batch/traces.md`, "Round 6B"; subagent reading, event counts re-verified by hand on EC r0 and r2):
  - **IC is limited by tokens, not time.** 6 of 12 IC agents hit their 1.5M cap, including ieh2 in all 3 batches, at 7.4–8.8 of 20 minutes. The other 6 stop on their own (done or quiescent) with 9–15 minutes left. IC r2's ieh2 (0.38) hit the cap while debugging one money-parsing bug, with the check still red; the file was not broken.
  - **EC is mostly parallel isolated work.** All 3 batches hit the 6M shared budget at 6.6–7.9 minutes. Board tools take 16–20 % of calls; 15–19 posts, 2–3 help signals and 1–3 findings per batch. Folders edited by two or more agents: 2, 0 and 1 per batch, with one edit each from the second agent; no overwrites. In EC r1 every agent stayed in its own folder.
  - **One plausible case of useful coordination:** in EC r0, wren posted a diagnosed regex bug in ieh2's `extract.py` and made the one-line fix; ieh2 scored 0.918 (not verified against the grader). Against it, IC r1 reached 0.973 on ieh2 with no help. The shared pool let EC's ieh2 holder spend more than 1.5M (lark: 2.16M in r2), and it still did not beat IC on average beyond noise (0.80 vs 0.75, IC spans 0.38–0.97).
- **Ceiling (threat to validity, stated here because it limits the conclusion):** with the clock, L1 is near saturated for both arms (0.93–1.0 on three of four tasks). 6B shows that the clock closes 5B's gap; it cannot show that coordination never helps, because on these tasks there is almost no headroom left for it. ieh2 is the only task with room (0.75 / 0.80).
- **Conclusion of round 6:** both pre-registered questions favour the persistent single agent. For this model and these tasks, a single agent that is shown the clock matches or beats every swarm configuration tried, and the swarm's earlier wins are explained by persistence. The next step (agreed with the user on 2026-10-02) is to recalibrate the task panel against c4g-clock, in two separate regimes: tasks limited by difficulty at equal time and tokens, and tasks limited by volume within the time limit.

## Round 7: recalibration against c4g-clock (fixed before measuring, 2026-10-02 09:45)

Motivation: after round 6 the tasks saturate for the strong single agent (c4g-clock 0.93–1.0 on ieh, ieh2, ledger and durable), so no swarm can show a benefit on them. With the user's approval (2026-10-02), the calibration reference is now c4g-clock with a band of 0.3–0.6 and k=3 (`hard-tasks.md`), in two regimes reported separately. Round 7 only calibrates; it compares no swarm arm.

**6C** (quality-based stuck signal for optimisation tasks) is **deferred**: it would be measured on L3, and L3 first needs to be calibrated against the clock agent here. It gets its own pre-registration if L3 lands in the band.

**Code:** `src/` unchanged (hash `a5a95a58e2`, image `murmur-batch:a5a95a58e2`). New in the batch driver: arm **O**, one c4g-clock agent over all M tasks of a lot with the same M × B tokens (the shared-folder branch with `agents: 1`). Smoke on lot S before the first O batch.

### D: difficulty-limited (same time and tokens as every arm)

- **swarmtest:** c4g-clock n=1, k=3, on `constrained_planning_hard` (cph; c4n1 0.40, Pi 0.35) and `feature_implementation_hard` v4 (fih; c4g-guard 0.79, Pi 0.38). Driver `experiments/criba7-lanes.mjs`, one campaign per task × repetition with `repetitions: 1`, seed 20261025, base `criba3.json` (3M cap, 20 min), 3 lanes.
- **Not re-run, decided from existing clock data:** ieh 0.999, ieh2 0.990, ledger 1.000 (6A) and durable 0.988 (6B IC, at 1.5M): all saturated, out of panel D.
- **Batch L3** (`opt_*`, open-ended, scored against best-known): arm IC (c4g-clock isolated, 1.5M per task, 20 min), k=3, via `lane.sh L3 <image> "IC"`. The per-task score is the calibration unit. Note: in 6B the 1.5M per-agent cap, not the clock, stopped half of the IC agents; it is kept at 1.5M so that L3 stays comparable with 5B and with any later swarm arm on 6M.
- **Rule per task:** c4g-clock mean in [0.3, 0.6] → enters panel D. Above 0.6 → saturated; it stays out until a harder version is built (a separate round). Below 0.3 → the remedies of `hard-tasks.md` (clarify the contract or move information into the public check), then recalibrate.

### V: volume-limited (more work than one agent can do in the time limit)

- **Batch L1 with arm O:** one c4g-clock agent over ieh, durable, ledger and ieh2, 6M tokens, 20 min, k=3, via `lane.sh L1 <image> "O"`.
- **Rule:** lot L1 enters panel V if O's batch mean is in [0.3, 0.6] **and** the limit is volume: every O batch ends by timeout or budget (not by done or quiescent), with at least one task folder below 0.5. Above 0.6 → the lot is too small for one agent; the next step is a lot of 6–8 tasks (a separate round). Below 0.3 → a lot of 3 tasks.
- **Descriptive only, not a test:** O against 6B's IC (0.925) and EC (0.921), all at 6M per batch, is a first, cross-day look at parallelism (4 agents) versus one agent at equal tokens. The comparison that would count is pre-registered in a later round, with all arms on the same day.

### Budget (estimate)

- D swarmtest: 6 runs × ~2–3M ≈ 12–18M.
- D L3 IC: 3 batches × ~2–6M (I used 0.24M per batch without a clock; the cap is 6M) ≈ 6–18M.
- V L1 O: 3 batches × ~4–6M ≈ 12–18M, plus the O smoke on lot S (~0.1M).
- **Total ≈ 30–54M, central estimate ~40M.**

### Round 7 result and rule applied (2026-10-02 10:35; launched 09:46 with the user's OK, code `011fb28`, `src/` hash `a5a95a58e2`)

Smoke of arm O on lot S: one agent (wren), 3M budget, clock lines present, 1.0 / 1.0, 40k tokens; output deleted. All 6 swarmtest campaigns and all 6 batches finished with exit 0. Spend: D swarmtest 4.3M, L3 IC 2.1M, L1 O 18.1M, smoke 0.04M: **24.5M** (estimate ~40M; the clock agent stops early on cph, fih and L3).

**D, difficulty-limited** (c4g-clock; per-task means, k=3):

| task | runs | mean | tokens/run | rule |
|---|---|---:|---:|---|
| cph | 0.569 / 0.425 / 0.429 | **0.474** | 0.31–1.76M | **in band → panel D** |
| fih v4 | 1.000 / 0.916 / 1.000 | 0.972 | 0.47–0.76M | saturated, out |
| opt_routing (L3 IC) | 0.682 / 0.202 / 0.717 | **0.534** | — | **in band → panel D** |
| opt_shop (L3 IC) | 0.880 / 0.772 / 0.755 | 0.802 | — | saturated, out |
| opt_packing (L3 IC) | 0.665 / 0.532 / 0.861 | 0.686 | — | above band, out |
| opt_roster (L3 IC) | 0.827 / 0.737 / 0.924 | 0.830 | — | saturated, out |

- L3 IC batches: 0.764 / 0.561 / 0.814 (mean 0.713; I without a clock in 5B: 0.526), 0.53–0.95M of 6M per batch, 4.0–4.9 minutes.
- **Panel D after round 7: cph and opt_routing.** fih joins ieh, ieh2, ledger and durable as saturated.
- **Finding (from `criba7-traces.md` and the batch results):** where the clock agent still has headroom, it is not because it gives up. All 6 swarmtest runs end with `done` on a **green** check, after 4–14 of 18 minutes and 0.3–1.8M of 3M tokens; the L3 batches finish in 4–5 of 20 minutes with 9–16 % of their budget. On cph and the optimisation tasks the public check turns green long before the quality ceiling (feasible plan versus the reference objective), and the agent stops there. The clock fixes giving up on a red check; it does not make the agent keep improving a green solution. That is the regime 6C was meant for.

**V, volume-limited** (one c4g-clock agent over the four L1 tasks, 6M, 20 min):

| batch | ieh | durable | ledger | ieh2 | mean | tokens | minutes | end |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| r0 | 0.920 | 0.572 | 1.000 | 1.000 | 0.873 | 6.01M | 15.4 | budget |
| r1 | 0.981 | 0.651 | 1.000 | 0.990 | 0.906 | 6.05M | 14.3 | budget |
| r2 | 0.910 | 0.371 | 1.000 | 0.670 | 0.738 | 6.02M | 16.2 | budget |
| mean | 0.937 | 0.531 | 1.000 | 0.886 | **0.839** | | | |

- **Rule applied:** 0.839 > 0.6 → **L1 is too small for one agent; it does not enter panel V.** The pre-registered next step is a lot of 6–8 tasks (a separate round). Every batch ended by budget, with durable below 0.5 in one of three.
- **The binding limit is tokens, not time:** the single agent spends its 6M in 120–139 calls and 14–16 minutes, about 45k tokens per call, because one context carries all four tasks (an isolated agent in 6B spent 17–26k per call). It spent most calls on ieh and ieh2 (66–98 of 120–139) and least on durable (22–27).
- **Descriptive only (cross-day, as pre-registered):** at 6M per batch, one agent scores 0.839, four isolated agents 0.925 (6B IC) and the swarm 0.921 (6B EC). Four agents beat one by ~0.08–0.09, almost all of it on durable (0.53 vs 0.98–0.99), and the cause visible in the traces is context cost rather than coordination: IC has no board at all.

## Round 8: expanding the panel (fixed before measuring, 2026-10-02 13:10; calibration only)

Motivation: after round 7, panel D (difficulty-limited, c4g-clock in 0.3–0.6) holds only cph and opt_routing, too few to rank systems. The user asked to expand it (2026-10-02), and, in parallel, to build OpenSpec projects for a swarm-versus-single comparison in the volume regime (comparison A: both arms apply the same pre-written OpenSpec change).

**New tasks** (built by subagents in `../swarmtest/staging/`, never in `tasks/`; validated offline; stub and solution scores re-verified by hand with `swarmtest.grading.grade`):

| task | shape | stub | solution | probe ladder (subagent, not verified) |
|---|---|---:|---:|---|
| opt_shop2 | job shop, 45–85 jobs, weighted tardiness, stronger baseline | 0.0 | 0.743 | greedy 0.06, simple SA 0.38 |
| opt_roster2 | rostering, 60–160 employees, stronger baseline | 0.0 | 0.920 | greedy 0.00, simple SA 0.62 |
| opt_packing2 | vector bin packing, 1,200–3,000 items, 6 bin types | 0.0 | 0.674 | greedy 0.14, simple SA 0.62 |
| plan_timetable | exam timetabling, 150–700 exams, hard + soft constraints | 0.0 | 0.776 | modest 0.16, generic SA 0.32, efficient SA 0.57 |
| pred_demand | daily demand forecast, RMSLE against the oracle noise floor | 0.0 | 0.968 | store×item mean 0.19, log-linear 0.48, with interactions 0.58 |

**OpenSpec projects, pilot** (one c4g-clock run each, 20 min and 3M, seed 20261031, configs `criba8/pilot-*.json`): ospec_green 0.970 (12.3 min, 1.56M, done) and ospec_brown 0.998 (9.3 min, capped at 3M). Both saturate, so by the user's instruction ("measure first, scale up if needed") they are being scaled up about 4x, to be calibrated with 30 min and 6M per run. Their calibration and the swarm comparison get their own pre-registration.

**Ambiguity review** (read-only subagent, `reports/2026-10-02-panel8-build.md`): one real contract error, fixed before calibration. opt_packing2's contract said hidden instances have 400–1,000 items, and the generator makes 1,200–3,000 [verified]. Minor one-sentence clarifications were added to all five contracts (concurrent grading and wall-clock margin; no history before day 0 in roster2; acyclic precedence in plan_timetable; scientific notation in pred_demand).

### Calibration of panel D

- **Harness:** swarmtest, `experiments/criba8-lanes.mjs`, seed 20261030, base `criba3.json` (3M cap, 20 min), one campaign per task × arm × repetition. The tasks stay in `staging/`; the driver builds a private view of symlinks (`criba8/tasks/`) that the campaigns read as their tasks folder.
- **Tasks:** the five above plus opt_routing, re-calibrated in swarmtest so that all of panel D uses one harness (round 7 measured it in the Docker batch harness).
- **Arms:** c4g-clock n=1 (the reference, k=3) and Pi n=1 (the "beats Pi" reference, k=3).
- **Load:** these tasks run solvers with a 10 s limit per instance, which load slows down. At most 3 lanes, and no other heavy job running (load below ~8 at launch).
- **Rule per task:** c4g-clock mean in [0.3, 0.6] → enters panel D. Above 0.6 → out (saturated for the reference). Below 0.3 → the `hard-tasks.md` remedies, then recalibrate. Pi is descriptive.
- **Budget:** c4g-clock on the optimisation tasks of round 7 used 0.04–0.6M per task; on cph 0.3–1.8M. Estimate 6 tasks × 3 × (~0.8M clock + ~0.3M Pi) ≈ **~20M** (upper bound ~35M if pred_demand or plan_timetable keep the agent busy).

### Round 8 result and rule applied (2026-10-02 13:56; launched 13:17 with the user's OK, code `6e586ac`)

36 campaigns (`20261002T111710Z-c227adf3` → `20261002T115022Z-b1ddf99d`, seed 20261030), all exit 0, **6.4M tokens** (estimate ~20M: both arms stop early). The OpenSpec builder was running in the background with `nice` and at most 3 processes (load ~3–4 at launch).

| task | c4g-clock runs | clock mean | Pi mean | clock tokens/run | rule |
|---|---|---:|---:|---:|---|
| opt_roster2 | 0.019 / 0.687 / 0.503 | **0.403** | 0.285 | 0.09–0.39M | **in band → panel D** |
| opt_routing | 0.705 / 0.438 / 0.718 | 0.620 | 0.538 | 0.06–0.46M | above the band → out (0.534 in the batch harness, round 7) |
| pred_demand | 0.409 / 0.742 / 0.747 | 0.633 | 0.579 | 0.56–1.25M | above the band → out |
| opt_packing2 | 0.176 / 0.378 / 0.091 | 0.215 | 0.090 | 0.08–0.30M | below → remedy |
| plan_timetable | 0.191 / 0.277 / 0.187 | 0.218 | 0.120 | 0.09–0.28M | below → remedy |
| opt_shop2 | 0.263 / 0.103 / 0.159 | 0.175 | 0.342 | 0.08–0.15M | below → remedy |

- **Panel D now:** cph (0.474, round 7) and opt_roster2 (0.403). opt_routing leaves it: its swarmtest mean (0.620) is just above the band. The band edges are noisy at k=3 (per-run spread up to 0.67 on roster2), but the rule is applied as written.
- **Why the three tasks fall below the band** (per-instance grades in the records):
  - the solutions are feasible but barely beat the baseline, and the score falls with instance size. On shop2 the clock agent's per-instance scores run from 0.29–0.39 on the smallest instance to 0.0–0.33 on the largest;
  - only one run timed out (opt_packing2 clock r2: 3 of 4 instances over 10 s).
  - The visible instance is much smaller than the hidden ones (packing2: 600 vs 1,200–3,000 items), so the agent tunes on a case that does not show its solver failing to scale.
- **The clock agent stops early on these tasks, as in round 7:** 14–66 calls, 1.2–11 of 18 minutes, 0.06–1.25M of 3M tokens. It makes 2–55 calls after its first green; on the four optimisation tasks the median is 6–7. Pi is no worse on average here (shop2: Pi 0.342 vs clock 0.175). Persistence induced by the clock does not reach quality-limited tasks.
- **Next, by the rule (`hard-tasks.md`, below the band):** move information into the public check. For shop2, packing2 and plan_timetable, `npm run test` will also report the score on a visible instance as large as the largest hidden one. Then recalibrate c4g-clock with k=3 (a separate step, pre-registered in its own commit).

### Round 8, second step: remedy recalibration and OpenSpec calibration (fixed before measuring, 2026-10-02 14:40; the user approved both proposals)

Driver `experiments/criba8b-lanes.mjs <stage> <lane>`, c4g-clock n=1 only, k=3, one campaign per task × repetition, tasks read from `staging/` through a private view of symlinks. At most 3 lanes in total, launched only when no offline job is running.

**Stage `remedy`** (seed 20261032; swarmtest defaults: 3M, 20 min):
- **Tasks:** opt_shop2, opt_packing2 and plan_timetable, after the remedy. Each workspace now holds `instance_large.json`, the size of the largest hidden instance, with a new seed. `npm run test` also prints the score on it, for information; pass/fail is unchanged.
- **Rule per task:** the same as before, c4g-clock mean in [0.3, 0.6] → panel D. Below 0.3 again → the task is dropped from panel D (one remedy only, so this does not turn into tuning against the reference agent). Above 0.6 → out.
- **Remedy check, done by hand before launch:** stub 0.0 on all three; solution 0.743 (shop2), 0.674 (packing2) and 0.777 (timetable), the same as before. The hidden instances, `grader.py` and `best_known.json` are untouched (builder's md5 check). `npm run test` prints the large-instance line. The large instances use seeds 9085, 9300 and 36301 (hidden: 311–314, 111–114 and 105 + 1000k). Their best_known comes from the reference at ~30x its budget, two seeds. Known noise: packing2's reference solver stops on a wall-clock deadline, so its own grade varies by ±0.002 between runs.
- **Budget:** 9 runs × ~0.1–0.6M ≈ **2–5M**.
- **Deviation (logged at launch, 14:45):** the remedy stage was launched at 14:42 with no job of mine running. Shortly after, the OpenSpec builder resumed to apply the review fixes, with `nice -n 15` and at most 3 processes, so the remedy runs share the machine with that offline job.

**Stage `ospec`** (seed 20261033; `token_budget` 6M, `timeout_seconds` 1920, which gives the agent 30 minutes):
- **Tasks:** ospec_green and ospec_brown after the ~4x scale-up and the fixes from the ambiguity review (`reports/2026-10-02-panel8-build.md`).
- **Rule per project:** it enters **panel V** if the c4g-clock mean is in [0.3, 0.6] **and** at least 2 of its 3 runs end by budget or timeout, not by `done`. Above 0.6 → one agent can still cover it, so not a volume task as built. Below 0.3 → too large, to be trimmed. A run that hits the 6M cap counts with its score, which is a floor.
- **Budget:** 6 runs × ~4–6M ≈ **25–36M**.
- **Then:** a project that enters panel V gets the swarm comparison (comparison A: c4g-clock n=1 against a 4-agent swarm with a clock and the same total tokens), with its own pre-registration.

**Stage `remedy`, result and rule applied (2026-10-02 15:00):** 9 campaigns `20261002T124256Z-cdc442e1` → `20261002T125232Z-a2671488`, all exit 0, 2.0M tokens.

| task | c4g-clock runs | mean | before the remedy | rule |
|---|---|---:|---:|---|
| opt_packing2 | 0.144 / 0.870 / 0.192 | **0.402** | 0.215 | in band → panel D |
| opt_shop2 | 0.248 / 0.404 / 0.266 | **0.306** | 0.175 | in band → panel D |
| plan_timetable | 0.178 / 0.386 / 0.252 | 0.272 | 0.218 | below again → dropped (one remedy only) |

- **Panel D is now cph, opt_roster2, opt_shop2 and opt_packing2.** packing2 is bimodal: one run reached 0.87 on every instance, the other two stayed at 0.14–0.20. shop2 is just inside the band.
- The clock agent still stops early: 0.10–0.58M tokens per run.

**OpenSpec, fixes from the review, applied before the stage `ospec` launch** (builder report; scores, strict validation and public-check exit codes re-verified by hand):
- the grader allows 20 s per scenario and 900 s in total;
- `public_check.py` is now a spread sample: 16 capabilities in green; 13 change capabilities and 3 regression checks in brown;
- brown changes:
  - one new requirement, "unknown projects raise UNKNOWN_PROJECT", which adds 1 scenario (228 change scenarios, 390 hidden in total) and 1 task (145 in all);
  - sentences for the notification texts, the empty Markdown export and the CLI usage-error format;
  - the order of the done-gates;
  - activity: only the operations listed append an entry;
  - the two date-dependent scenarios are now seeded at a fixed date;
- green changes: `create_order` ignores tiers and promotions; a repeated `grant` or `assign_role` still appends an audit entry.
- Stage `ospec` launched at 15:00 with no offline job running, 3 lanes.

**Stage `ospec`, result and rule applied (2026-10-02 15:45):** 6 campaigns `20261002T130021Z-d3c30e94` → `20261002T132336Z-6d8ed73d`, all exit 0, 36.2M tokens (estimate 25–36M).

| project | c4g-clock runs | mean | end | minutes used (of 30) | calls after first green |
|---|---|---:|---|---|---|
| ospec_green | 0.391 / 0.519 / 0.468 | **0.459** | budget ×3 | 22.8 / 18.0 / 19.2 | 79 / 86 / 80 |
| ospec_brown | 0.422 / 0.473 / 0.449 | **0.448** | budget ×3 | 12.1 / 20.1 / 16.5 | 31 / 54 / 46 |

- **Rule applied:** both means are in [0.3, 0.6] and all 6 runs end by budget, not by `done`. **Both projects enter panel V.** Their spread is small (0.39–0.52), unlike the optimisation tasks.
- **The binding limit is tokens, not time.** Every run spends its 6M in 12–23 of 30 minutes. One context holding a 3–5k-line project grows until each call is expensive, as with arm O in round 7. A swarm whose agents each hold part of the project would spend fewer tokens per call. If it wins here, part of the gain is context cost, and the comparison must say so.
- **The agent keeps working this time:** 79–86 calls after the first green check in green, and 31–54 in brown. The spread public check and a large `tasks.md` keep it going; nothing in these runs stops on a green check.
- **Next:** comparison A on panel V (c4g-clock n=1 against a 4-agent swarm with a clock, same 6M, k=3), and the swarm comparison on panel D. Each gets its own pre-registration.


## Round 9: the swarm against the single agent on panels D and V (fixed before measuring, 2026-10-02 16:45, commit `3ea1d8d`; the header first said 16:55 by mistake; the user approved the plan)

Question: with the panels from round 8, does a non-hierarchical swarm beat c4g-clock n=1 at the same time and token budget? The two panels test different routes. In V (volume) one context with the whole project gets expensive and runs out of tokens. In D (difficulty) the single agent stops on a green check with time and tokens left.

**Harness facts that shaped the design** (verified in `../swarmtest` before writing this):
- every campaign must list an n=1 competitor (`config.py`);
- a murmur run that ends by budget or timeout reports `usage_complete: false`, and the runner then stops the campaign (`usage_unknown_or_cleanup_unconfirmed`, as in both capped ospec calibration campaigns);
- `make_plan` shuffles the competitors with `Random(seed)`. The order below was checked with `swarmtest plan` on the real configs.

**New profiles** (existing levers only, so no new-mechanism smoke is required):
- `v-swarm-clock`: c4g-clock (same norms, write guard and clock) plus messaging with `delivery: attach`, board tools post, team, claim and release, and a menu norm. The menu: pick a section of the change's `tasks.md` that nobody holds, `claim("tasks.md#<number>")`, post what you will build, take sections others depend on first, and take another unclaimed section when yours is done. Nothing assigns sections. Smoke on a scripted 3-section task (3 agents, 0.21M tokens, passed): the briefing renders, `tasks.md#N` claims work, and agents resolve contention on the board.
- `x1g-select-clock`: x1g-select (parallel attempts, selected by execution) plus `clock`.

### V: volume (comparison A)

- **Tasks:** ospec_green, ospec_brown (from `staging/`). Their fingerprints are unchanged since the calibration (`f439d64f…` and `83ecd447…`).
- **Arms:** S4 = v-swarm-clock n=4 against C1 = c4g-clock n=1. Both get 6M tokens per run, shared by the whole swarm, and 30 effective minutes (`timeout_seconds` 1920). k=3.
- **Solo arm reused (a deliberate deviation from same-campaign pairing):** C1 is the round 8 calibration (seed 20261033, 6 runs, 2026-10-02 13:00–13:50), not repeated. Pairing inside a campaign is impossible here, because whichever arm runs first hits the cap and stops the campaign, so a repeated C1 would also sit in separate campaigns and buy no pairing in time. The cost is that the two arms ran at different hours with different seeds.
- **Execution:** `experiments/criba9-lanes.mjs V <lane>`, seed 20261035, one campaign per project × repetition, competitors `[v-swarm-clock n=4, c4g-clock n=1]` with `--limit 1`. With this seed only the swarm runs; the n=1 entry is listed because swarmtest requires one. Every V campaign is expected to end with `usage_unknown_or_cleanup_unconfirmed`.
- **Rule** (per-project means from `record.json`):
  - **the swarm wins on V** if S4 − C1 ≥ +0.05 on the mean of the two projects and S4 wins on both;
  - **it loses** if S4 − C1 ≤ −0.05 and it loses on both;
  - otherwise **not decided**.
  - Capped runs count with their score, which is a floor.
- **Attribution (fixed now):** a V win is credited to coordination only if the traces show agents using teammates' work: importing or calling modules a teammate wrote, acting on a post, or fixing a teammate's section after reading it. Otherwise it is credited to smaller contexts and parallelism. Descriptive measures: tokens per call and cache-read share, against C1's; board share of tokens; claims per agent and claim conflicts; sections left unclaimed at the end; overwrites of a teammate's file.

### D: difficulty

- **Tasks:** constrained_planning_hard (cph), opt_roster2, opt_shop2, opt_packing2.
- **Arms:** S3 = x1g-select-clock n=3 against C1 = c4g-clock n=1. Both get 3M per run (shared by the swarm) and the swarmtest default of 1200 s, 18 effective minutes. k=3.
- **Solo arm repeated, paired:** each campaign is `[x1g-select-clock n=3, c4g-clock n=1]` with seed 20261034. With this seed C1 runs first, then S3, so a swarm run that hits the cap or the timeout never costs the paired solo run. C1 is cheap here (0.06–1.8M per run in rounds 7–8). The calibration runs are reported only as descriptive (pooled C1, k=6).
- **Execution:** `experiments/criba9-lanes.mjs D <lane>`.
- **Rule** (per-task means of the paired runs):
  - **the swarm wins on D** if S3 − C1 ≥ +0.05 on the mean of the four tasks and S3 wins at least 3 of 4 tasks;
  - **it loses** if S3 − C1 ≤ −0.05 and it loses at least 3 of 4;
  - otherwise **not decided**.
  - Capped runs count with their score, and an arm with ≥ 1/3 capped runs is flagged. opt_packing2 is bimodal for C1 (0.14 / 0.87 / 0.19 in calibration); the per-task table will say so.
- **Descriptive:** whether S3 actually builds separate attempts and selects by execution (`SCORES.md`, installs), calls after the first green per arm, tokens per arm.

### Not in this round

- **6C** (a quality-stall signal for the single agent on panel D) is deferred. `src/` is at 603 lines, already at the ceiling, so a new lever needs compaction plus a smoke, and neither comparison here depends on it. It will be proposed after D's result.

### Load, lanes and budget

- **Lanes:** at most 3 in total, as in round 8 (D's graders run solvers on a wall clock, and V's grader allows 20 s per scenario). Two V lanes and one D lane at the start. When V is done, two more D lanes start. Load at launch is recorded in the registry. Machine load before launch was ~6–7, from interactive apps, with no offline job running.
- **Budget:** V swarm 6 × 6M = **36M**. D: C1 12 × ~0.3M ≈ 4M, and S3 12 × ~1.5–3M ≈ 18–36M. **Total ~60M** (upper bound ~76M).


### Round 9 V result and rule applied (2026-10-02 17:20; launched 16:45 with 2 V lanes and 1 D lane, load 7.3, code `3ea1d8d`)

6 campaigns `20261002T144540Z-2fd46338` → `20261002T150244Z-59dbbe1c` (seed 20261035), all exit 0 and all stopped by `usage_unknown_or_cleanup_unconfirmed` as expected, 36.1M tokens. C1 is the round 8 calibration (seed 20261033).

| project | S4 v-swarm-clock n=4 | S4 mean | C1 c4g-clock n=1 | C1 mean | S4 − C1 |
|---|---|---:|---|---:|---:|
| ospec_green | 0.201 / 0.298 / 0.000 | 0.166 | 0.519 / 0.391 / 0.468 | 0.459 | −0.293 |
| ospec_brown | 0.462 / 0.372 / 0.401 | 0.412 | 0.422 / 0.473 / 0.449 | 0.448 | −0.036 |

- **Rule applied: the swarm loses on V** (mean delta −0.16, it loses both projects). All 12 runs end by the 6M budget, so every score is a floor. S4 spends its 6M in 6–9 of 30 minutes, C1 in 12–23.
- **Findings from the transcripts** (subagent analysis, `reports/2026-10-02-round9-v-traces.md`, model output; the green r2 cause was verified by hand):
  - **Green r2 scores 0.0 from one name mismatch.** `stockroom/__init__.py` imports `CustomerMixin`, while `customers.py` defines `CustomersMixin`, so all 260 scenarios fail with ImportError. Two agents took customers within 25 s, and the second rewrote the file with `write`. The budget ran out 5 s later, before anyone re-ran the check [verified].
  - **Contexts were smaller, but the swarm spent the saving on more calls.** S4 makes 247–277 calls per run at 15–29k tokens each, against C1's 91–125 calls at 48–67k. Board-only turns take 14–46% of S4's tokens (mean ~30%), and each agent re-reads the specs (4–8 `spec.md` reads per agent). The context-size advantage expected in the pre-registration exists, and coordination overhead and duplicated reading consume it.
  - **Breadth, not correctness, is what S4 loses on green.** Where S4 built a capability, it scores like C1. Orders, purchasing, returns, reports, shipping, price lists and promotions never exist in any S4 green run. 31–35 of 48 sections are never claimed. On brown, whose modules are separable, S4 ties C1 within 0.04 (32–34 versus 31–33 capabilities above 0).
  - **Integration through one shared `__init__.py` is the weak point.** Agents compose the class from mixins in that one file and ask its holder to add theirs (~15 "add X to the MRO" posts per green run). Three agents wrote modules before the foundation existed. In two green runs the foundation was never released, and its holder became the only integrator.
  - **Attribution:** there is constant use of teammates' work, through posted interfaces and the shared `__init__.py`, so coordination happened. It cost more than it returned.

### Round 9 D result and rule applied (2026-10-02 18:25; 1 D lane from 16:45, 3 lanes from 17:12)

12 campaigns `20261002T144550Z-2b1171ae` → `20261002T160742Z-bd8122ed` (seed 20261034), all exit 0, **34.7M tokens**. The paired C1 run completed in all 12 campaigns. Four S3 runs ended by budget or timeout, and their campaigns stopped after the S3 run as planned, costing nothing else.

| task | C1 c4g-clock n=1 | C1 mean | S3 x1g-select-clock n=3 | S3 mean | S3 − C1 |
|---|---|---:|---|---:|---:|
| cph | 0.354 / 0.502 / 0.449 | 0.435 | 0.334 B / 0.414 / 0.300 B | 0.349 | −0.086 |
| opt_packing2 | 0.520 / 0.456 / 0.917 | 0.631 | 0.864 / 0.914 / 0.916 | 0.898 | **+0.267** |
| opt_roster2 | 0.167 / 0.768 / 0.574 | 0.503 | 0.553 / 0.013 / 0.284 B | 0.283 | −0.220 |
| opt_shop2 | 0.158 / 0.444 / 0.249 | 0.284 | 0.369 / 0.105 B / 0.446 | 0.307 | +0.023 |

B = ended by the 3M budget (score is a floor).

- **Rule applied: not decided.** The mean delta is −0.004, and S3 wins 2 tasks and loses 2.
- **S3 has 4 of 12 runs capped (≥ 1/3), so it is flagged.** It spends 1.6–3.0M per run, against C1's 0.1–1.2M, three to twenty times as much. On equal tokens spent the comparison is even less favourable to the swarm.
- **opt_packing2 is the one clear win, and it is a variance win.** C1 is bimodal again (0.46–0.52, or 0.92). S3 lands on the good mode every time (0.86–0.92), because one of three independent attempts finds it and the selection installs it. On roster2 the same machinery picked badly once (0.013).
- **Pooled C1** (descriptive, calibration plus this round, k=6): cph 0.454, roster2 0.453, shop2 0.295, packing2 0.517.
- **Findings from the transcripts** (subagent analysis, `reports/2026-10-02-round9-d-traces.md`, model output; it regraded every optimisation attempt with the task's grader, and the installed attempt reproduces `record.json` within 0.004):
  - **S3 follows the method in form.** Every run builds 3 attempts, writes 2–4 probes and a `SCORES.md`, and installs a selection. The probes mostly check feasibility, format and determinism, and pass on every attempt, so the real selection signal is the public check's numbers. Cross-review caught real bugs three times.
  - **packing2 wins by diversity plus a predictive number.** Only 3 of 9 S3 attempts reach ≥ 0.9, each by a different agent, which is about C1's good-mode rate of 1/3. The check also prints a score S on `instance_large.json` (informational only). It predicts the hidden grade far better than the visible score (r = 0.94 against 0.67 over packing2 and shop2, both arms). C1 stops on the first green with that large S at 0.174 / 0.146 / 0.993, and its hidden scores are 0.52 / 0.46 / 0.92 [verified]. S3 selected on that number and kept improving after green: a fee bug and a relocation bug were fixed, and a 0.50 install was replaced by a 0.92 one.
  - **Where there is no size-aware number, selection fails.** roster2 and cph print no large-instance score. On roster2, S3 selected on visible cost and installed a solver whose iteration count shrinks with size (0.013). In another roster2 run the agreed fix (0.537 in an attempt) never reached the installed file before the budget ran out. Determinism probes pushed agents from wall-clock deadlines to fixed iteration counts that do not scale. cph fails identically in both arms (an invalid fallback plan on medium to xl_dense instances), with no signal in the public check.
  - **Cost.** S3 averages 2.30M per run against C1's 0.58M. S3 spends 30% of turn tokens on the board and 26% on probes and scoring, against C1's 6% and 3%. 53% of S3's tokens go before the first `SCORES.md`.

**Deviation: code changed mid-round.** At 17:45 another session of the user's edited `src/` (the `threads` lever, committed afterwards as `89478ef`) while D campaigns were running from `src/`. Runs started after 17:45 (roster2 r2, shop2 r2 and packing2 r2, all from 17:51) loaded the new code. With `threads` off the flat board is equivalent: `post` and its notifications follow the same path, which I checked in the diff, and the default-profile regression smoke passed. The runs are kept.

## Round 10: the quality signal, swarm size, back to basics and a cheaper V swarm (fixed before measuring, 2026-10-02 18:52; the user approved the plan and asked to add n=2 and n=10 and to include 10C)

Motivation (round 9 transcripts):
- On panel D the swarm's one clear win (packing2, +0.27) came from diversity plus a number printed by the check: a score on an instance as large as the hidden ones, r = 0.94 with the hidden grade. The single agent stops on green with that number at ~0.15. Until the single agent is given the same number and a norm to use it, the win cannot be credited to the swarm.
- On panel V the swarm lost on board overhead (~30% of tokens), breadth and one shared integration file.
- The Astra/ExploitGym sources (`reports/2026-10-02-astra-swarm-ideas.md`) describe a message-only board with no scaffolding. That raises the objection that murmur's tools and norms hide a benefit.
- The user also asked for larger swarms.

**New profiles** (no new code; each smoked on a scripted task, runs deleted):
- `c4g-signal` (C1s): c4g-clock plus a generic norm. When the acceptance check prints an informational quality score, it is the target, not the exit code: keep improving while it improves, and call done only when it stops improving after real attempts or time runs out. It is 6C in profile form. It names no task, file or threshold, so it is not tuning against the reference. Smoke: n=1 on a 40-element ordering task that prints a score; it reached S = 1.000, with 23k tokens.
- `x1g-select-signal` (S2s, S3s, S10s): x1g-select-clock, where the selection installs the attempt with the best printed quality score among those that pass the probes, and the same norm applies. Smoke: n=10 on the same task, with 10 attempts, a `SCORES.md`, and 0.8M tokens on a trivial task.
- `b0-basic` (B0): c4g-clock plus a post-only board (`delivery: attach`) and a one-line briefing ("equals, nobody in charge, post messages all, verify what you are told"). No claims, team, menu or method. Smoke: n=3 on a 3-section task, passed with 61k tokens and 0 posts.
- `ti-swarm-clock` (TI): t-swarm-clock (threaded board) plus an integration norm. Never edit or rewrite a teammate's file. The foundation makes the package discover its modules (and skip any that fails to import). Run the check after every write. Smoke: n=3 on the 3-section task, passed with 0.34M tokens, 4 threads, 7 `thread_read` and 5 `thread_list`.

**Harness:** `experiments/criba10-lanes.mjs <lane> <stage>...`, swarmtest defaults (3M, 1200 s) on D, 6M and 1920 s on V. One campaign per stage × task × repetition, k=3. Tasks are read from `staging/` through a private view. The competitor order per seed was checked with `make_plan`: every n=1 arm runs before the swarm, and on V the swarm runs alone (`--limit 1`).

| stage | seed | campaign (run order) | tasks |
|---|---|---|---|
| S3 | 20261036 | C1s, C1, S3s (x1g-select-signal n=3) | packing2, shop2, roster2 |
| S2 | 20261037 | C1s, S2s (n=2) | same |
| S10 | 20261038 | C1s, S10s (n=10) | same |
| B0 | 20261039 | C1, B0 (b0-basic n=3) | same |
| V | 20261040 | TI (ti-swarm-clock n=4) alone | ospec_brown |

packing2 and shop2 print the large-instance score ("signal tasks"); roster2 does not and is the no-signal contrast. cph is left out: both arms fail it identically, and its check gives no signal. Every swarm shares the same per-run tokens as the single agent (3M on D, so ~0.3M per agent at n=10).

**Rules** (per-task means; capped runs count as floors, and an arm with ≥ 1/3 capped runs is flagged):
- **10A, primary: does the swarm add anything once the single agent has the signal?** S3s − C1s, paired in the S3 campaigns, on the mean of packing2 and shop2. It **adds** if ≥ +0.05 and S3s wins both. It **does not** if ≤ −0.05 and S3s loses both. Otherwise **not decided**.
  - Attribution: if C1s ≥ S3s − 0.05 on packing2, round 9's packing2 win is credited to the signal, not to the swarm.
- **10A, secondary: does the norm alone move the single agent?** C1s − C1, paired in the S3 campaigns, on packing2 and shop2: **helps** if ≥ +0.05 on the mean and C1s wins both. Prediction for roster2: |C1s − C1| < 0.05, descriptive.
- **Size:** S2s, S3s and S10s, each against the C1s of its own campaigns, on the signal tasks, with the same rule as the primary. The size curve (score and tokens against n) is descriptive. Pooled C1s (k=9 per task) is descriptive.
- **10B, back to basics:** B0 − C1 over the three tasks. B0 **wins** if ≥ +0.05 on the mean and it wins at least 2 of 3. It **loses** if ≤ −0.05 and it loses at least 2 of 3. Otherwise **not decided**. Prediction: not decided. A null here answers the scaffolding objection.
- **10C, cheaper V swarm:** TI against C1 on ospec_brown, reusing round 8's C1 (0.448, seed 20261033) and round 9's S4 (0.412, seed 20261035), the same reuse as round 9. TI **wins** if TI − C1 ≥ +0.05. Otherwise V is parked. Mechanism measure: coordination share of tokens from `traces.mjs` (which counts thread tools), target < 10% against S4's ~30%; `thread_list` and `thread_read` calls per agent, descriptive.

**Lanes and load:** 3 lanes.
- Lane 1 runs V, then S10 (only lane 1 takes S10, so two 10-agent swarms never run together), then helps with S3, B0 and S2.
- Lanes 2 and 3 run S3, B0 and S2.
- Load before launch was ~5.5, with no other job running.

**Budget (estimate):** S3 stage ~34M (C1 0.5 + C1s ~1 + S3s ~2.3 per campaign), S2 ~24M, S10 ~36M, B0 ~27M, V ~18M. **Total ~140M**, upper bound ~155M if every swarm run hits its cap.

### Round 10 result and rule applied (2026-10-02 22:30; launched 18:53 with 3 lanes, load ~5.5, code `9d1180b`, `src/` unchanged since 17:45)

39 campaigns, all exit 0, **128.6M tokens** (estimate ~140M). Per stage: S3 9 campaigns `20261002T165303Z-00d0c849` → `20261002T182954Z-f4db5fa7` (35.9M); S2 9 `20261002T192127Z-b2d51c69` → `20261002T200521Z-0b133e12` (23.3M); S10 9 `20261002T171902Z-54fb30cf` → `20261002T183722Z-e32a4ae8` (29.6M); B0 9 `20261002T184552Z-9f7c1abc` → `20261002T191921Z-3583a47a` (21.7M); V 3 `20261002T165259Z-e530e637` → `20261002T171010Z-0af634f7` (18.1M). Every planned run was recorded: the swarm always ran last, so the 23 campaigns that stopped with `usage_unknown_or_cleanup_unconfirmed` lost nothing. `campaign.json` marks the murmur tree dirty only because `experiments/criba10/` was untracked.

Hidden-grade scores per repetition (B = ended by the 3M or 6M budget, a floor):

| stage | task | single agent(s) | swarm | swarm tokens/run |
|---|---|---|---|---:|
| S3 | packing2 | C1 0.866 / 0.467 / 0.823 (0.719); C1s 0.086 / 0.302 / 0.269 (0.219) | S3s 0.819 / 0.335 B / 0.885 (0.679) | 2.59M |
| S3 | shop2 | C1 0.742 / 0.029 / 0.116 (0.296); C1s 0.421 / 0.133 / 0.631 (0.395) | S3s 0.365 B / 0.457 B / 0.619 B (0.480) | 3.01M |
| S3 | roster2 | C1 0.673 / 0.075 / 0.094 (0.281); C1s 0.028 / 0.751 / 0.927 (0.569) | S3s 0.576 B / 0.517 B / 0.521 B (0.538) | 3.02M |
| S2 | packing2 | C1s 0.118 / 0.709 / 0.172 (0.333) | S2s 0.914 / 0.904 / 0.892 (0.904) | 1.65M |
| S2 | shop2 | C1s 0.806 / 0.394 / 0.287 (0.496) | S2s 0.280 B / 0.598 / 0.534 (0.470) | 2.50M |
| S2 | roster2 | C1s 0.564 / 0.564 / 0.549 (0.559) | S2s 0.272 B / 0.527 B / 0.284 (0.361) | 2.45M |
| S10 | packing2 | C1s 0.829 / 0.906 / 0.138 (0.624) | S10s 0.780 B / 0.143 B / 0.863 B (0.596) | 3.01M |
| S10 | shop2 | C1s 0.329 / 0.512 / 0.529 (0.457) | S10s 0.282 B / 0.605 B / 0.312 B (0.400) | 3.02M |
| S10 | roster2 | C1s 0.178 / 0.701 / 0.022 (0.300) | S10s 0.518 B / 0.584 B / 0.118 B (0.407) | 3.02M |
| B0 | packing2 | C1 0.702 / 0.817 / 0.884 (0.801) | B0 0.913 / 0.870 / 0.881 (0.888) | 2.08M |
| B0 | shop2 | C1 0.152 / 0.575 / 0.286 (0.338) | B0 0.435 / 0.147 B / 0.338 (0.306) | 2.07M |
| B0 | roster2 | C1 0.076 / 0.486 / 0.501 (0.354) | B0 0.030 / 0.180 / 0.630 (0.280) | 1.72M |
| V | ospec_brown | C1 0.448 (round 8, reused); S4 0.412 (round 9, reused) | TI 0.403 B / 0.422 B / 0.421 B (0.416) | 6.03M |

Single agents spend 0.2–1.1M per run (C1s 0.21–1.11M, C1 0.26–0.57M by task mean).

**Rules applied, as written:**
- **10A primary: the swarm adds** by the letter. S3s − C1s = +0.460 (packing2) and +0.085 (shop2), mean +0.272, S3s wins both. **Flagged:** 7 of 9 S3s runs hit the 3M cap. Attribution clause: C1s (0.219) < S3s − 0.05 on packing2, so by the letter the packing2 win is not credited to the signal.
  - **Qualification, in the same breath:** the control collapsed. The text norm did not make C1s use the score: 2 of 3 C1s packing2 runs in these campaigns stopped on the first green after 3 minutes at large S 0.11 and 0.21. The plain C1 in the same campaigns scored 0.719 on packing2, above S3s (0.679). Against C1, S3s − C1 is −0.040 (packing2) and +0.184 (shop2), at 6x the tokens. The primary does not show that the swarm adds anything a single agent that keeps working would not get.
- **10A secondary: the norm does not help.** C1s − C1 = −0.500 (packing2) and +0.099 (shop2), mean −0.200. The roster2 prediction (|C1s − C1| < 0.05) **missed**: +0.288. Pooled descriptive means: C1s (k=9) packing2 0.392, shop2 0.449, roster2 0.476; C1 (k=6, S3 and B0 campaigns) packing2 0.760, shop2 0.317, roster2 0.318. With per-run spreads of 0.03–0.93, the sign flips between tasks are within noise; what is clear is that the norm in text did not stop early exits.
- **Size, each swarm against the C1s of its own campaigns, signal tasks:**
  - S2s: +0.571 (packing2), −0.026 (shop2), mean +0.272, wins 1 of 2: **not decided**. Flagged (3 of 9 capped, exactly 1/3).
  - S3s: **adds** (above).
  - S10s: −0.028, −0.057, mean −0.043, loses both but the mean is above −0.05: **not decided**. Flagged (9 of 9 capped, all at 4.4–6.4 of 18 minutes).
  - Size curve (signal-task mean; swarm / its own C1s / swarm tokens per run): n=2 0.687 / 0.415 / 2.08M; n=3 0.580 / 0.307 / 2.80M; n=10 0.498 / 0.541 / 3.02M. Score falls with n at a fixed 3M. n=2 lands on packing2's good mode 3 of 3.
- **10B: not decided** (the prediction held). B0 − C1 = +0.087 (packing2), −0.032 (shop2), −0.074 (roster2), mean −0.006, B0 wins 1 of 3. 1 of 9 B0 runs capped (not flagged). B0 spends ~2.0M against C1's ~0.45M.
- **10C: V is parked.** TI − C1 = 0.416 − 0.448 = −0.032 (TI − S4 = +0.004). Mechanism target missed: board-only turns take **35.6%** of TI's tokens (40.8 / 36.1 / 30.0%), against S4's 27.8% by the same script, and the target was < 10%.

**Findings from the transcripts** (subagent analyses, model output: `reports/2026-10-02-round10-d-traces.md`, `-b0-traces.md`, `-v-traces.md`; hand-verified claims are listed in each report's header):
- **The text norm is inert at the moment that matters.** C1s reads the large-instance S and ends anyway: "`npm run test` passes for both the visible and large instances" at S 0.107, 3 minutes in [verified]. 11 of 18 C1s runs ended within 5 minutes. When C1s did keep going (shop2, one packing2 run), it iterated against S but plateaued. The hidden grade tracks the last S it saw.
- **Selection works when the swarm gets to install; budget and pool limit it.** The installed attempt had the best regraded S (within 0.05) in 12 of 18 S3s/S10s runs. S3s failed when every attempt was weak (one packing2 run: all four attempts at S 0.15–0.25). S10s ran out of 3M mid-selection, leaving a clearly better attempt uninstalled in 3 of 9 runs.
- **n=10 at ~0.3M per agent buys one first draft each.** About 28–32 calls per agent, 13–27% of calls on the board, almost no iteration. The result is a max-of-10 draw on first drafts, near C1s's level.
- **The large-instance S is load-sensitive.** In S3s packing2 r0, the end-of-run acceptance check printed large S = 0.152 (7.2 s), while the hidden grade was 0.819 and a quiet regrade gave 0.933 [verified]. Under 3 lanes, a time-bounded solver can print a misleading S; the signal itself is noisy under load.
- **n=2 is the best swarm here, and its packing2 win looks like transmission plus iteration.** Both agents reach large S ≥ 0.95 in all three packing2 runs, so this is not pool diversity: one agent posts the category-first insight within 2–4 minutes ("category-first ordering improved … large from 129941 to 102308" [verified]), the only peer adopts it, and both keep iterating after green (22–60 more calls) without hitting the cap. The installed attempt was the best in 9 of 9 S2s runs. On roster2 (no large-instance score) S2s selected on the small visible instance and installed solvers that degrade with size (one scores 0 on the 160-employee hidden instance), 0.36 against C1s 0.56. C1s packing2 in the S2 campaigns again stopped within 3 minutes at S 0.15–0.18 in 2 of 3 runs; over all 9 C1s packing2 runs, 5 stopped within 3 minutes at S ≤ 0.21.
- **B0 does not split work.** All agents edit one `solve.py`, the board is used for results and cross-checking (~10 posts per agent, ~22% of tokens in post-only turns), and agents adopt and verify teammates' findings. The packing2 edge cannot be separated from more total work (2–7x the tokens). In the capped shop2 run, the board converged on a bad move: an agent argued that wall-clock stopping breaks determinism, the team switched to fixed iteration budgets, and S fell from 0.52 to 0.35 (large S 0.083) with no revert [verified: the final `solve.py` has fixed `anneal_trials=9000 if N < 500 else 1700` and no clock].
- **TI's integration norm prevented breakage, but the board was not cheaper.** No capability scored 0 from an integration fault, the package auto-loads `ext_*.py` modules (it already did in the base project), and coverage stayed at 33 of 41 capabilities, like S4 and C1. Cost is turns × context (~24k tokens per turn, 93% cache reads), and threads added claim/team/reply/read turns rather than removing them. Agents read threads; there was no polling loop.

**Deviations and infrastructure:**
- **Regrades during live campaigns.** The panel D analysis subagent ran 137 public checks (sequential, `nice -n 15`) between about 19:07 and 19:50 UTC, while B0 r1–r2 and the first S2 campaigns ran. Their graders and in-run checks are wall-clock based, so those runs may have been slightly slowed. The B0 report also found load-driven budget cuts in the capped shop2 run (`20261002T190159Z-488ba77b`, 19:02–19:13 UTC), which falls inside that window. The runs are kept; the effect cannot be separated after the fact.
- My background wait hit the tool's 2-hour limit and was replaced by a re-armed monitor. Nothing was missed: all three lanes logged "no work left" and every campaign exited 0.

## 2026-10-03: the oracle problem, and an oracle-free default prompt

The user pointed out that every round so far gave the agents an oracle real work does not give. All 31 swarmtest tasks declare `acceptance_command: npm run test`, a visible check that reveals correctness, and on packing2 and shop2 it also prints a score that predicts the hidden grade. murmur's default briefing said "when the definition of done is met and the check passes, call done", and the c4g-* norms said "hidden tests will probe every clause". Rounds 1–10 therefore measure how configurations use an oracle. **They are not evidence for real work, and everything will be re-tested on oracle-free tasks.**

Changes made the same day, with the user's OK:
- **Default briefing changed** (`src/profile.ts`, in the commit that adds this note): it shows the goal only, with "When you judge that the goal is met, call done(reason)…". `{done}` and `{check}` stay available as placeholders. Every profile without its own `briefing` (33 of 35) now behaves differently, so rounds 1–10 are reproducible only at commit `9d1180b` or earlier. Smoke: the default profile on `examples/trio.json` passed (all_done, 134k tokens), and the transcript shows the new briefing with no acceptance check.
- **AGENTS.md** gets a "Realism first" rule: no oracle in tasks, no grading hints, murmur must not depend on a task-provided signal, and the check-keyed levers (`doneGate`, `doneAfterGreen`, `helpAfter`, check notices) are lab-only.
- **Blind variants** of opt_packing2, opt_shop2 and opt_roster2 are being built in `../swarmtest/staging/*_blind` (the check confirms only that `solve.py` runs and writes the documented format; the hidden grader is unchanged). Calibration and the re-test plan will be pre-registered here before anything is launched.
- The raw runs of rounds 6–10 were packed into `archive/murmur-raw-runs-20261003.tar.xz` (see `archive/MANIFEST.md`).

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
| 2026-10-02 | smoke round 6B (batch S, IC path, Docker `murmur-batch:a5a95a58e2`) | IC (c4g-clock × 2 isolated) | S × 1 | 97k | 1.0 / 1.0, one container per task, clock lines in the transcripts | IC goes through the isolated branch; smoke output deleted |
| 2026-10-02 | round 6A (21 campaigns `20261002T063615Z-10df4893` → `20261002T071139Z-39b069c4`, seed 20261020, code `d9a7510`) | c4g-clock, c4g-guard (n=1, k=3); c4g-evidence (n=1, ledger k=3; ieh and ieh2 reused from 5A) | ieh, ieh2, ledger × 3 | 26.5M | clock 0.997 / guard 0.434 / evidence 0.984 (3-task means); 0 `done_refused` | the clock contributes (+0.56, 3 of 3) and explains c4g-evidence; c4g-clock is the new single-agent reference |
| 2026-10-02 | round 6B (Docker `murmur-batch:a5a95a58e2`, L1 batches of 4 tasks, 4 agents, 4×1.5M) | IC (c4g-clock ×4 isolated), EC (b-swarm-clock) | L1 × 3 | 32.2M | IC 0.925 (4.70M) / EC 0.921 (6.03M); EC − IC −0.005, wins 2 of 3 | EC does not beat IC: 5B's L1 win was induced persistence; L1 near ceiling with the clock → recalibrate against c4g-clock |
| 2026-10-02 | smoke round 7 (batch S, arm O, Docker `murmur-batch:a5a95a58e2`) | O (one c4g-clock over 2 tasks) | S × 1 | 40k | 1.0 / 1.0, one agent, clock lines present | arm O valid; smoke output deleted |
| 2026-10-02 | round 7 D, swarmtest (6 campaigns `20261002T074611Z-d6c74849` → `20261002T075652Z-65ab2cc7`, seed 20261025, code `011fb28`) | c4g-clock n=1 | cph, fih × 3 | 4.3M | cph 0.474, fih 0.972; all end with done on a green check | cph enters panel D; fih saturated |
| 2026-10-02 | round 7 D, batch L3 (Docker `murmur-batch:a5a95a58e2`) | IC (c4g-clock ×4 isolated, 1.5M each) | L3 × 3 | 2.1M | routing 0.534, shop 0.802, packing 0.686, roster 0.830 (mean 0.713); 4–5 min per batch | opt_routing enters panel D; the rest out |
| 2026-10-02 | round 7 V, batch L1 (Docker `murmur-batch:a5a95a58e2`) | O (one c4g-clock over 4 tasks, 6M) | L1 × 3 | 18.1M | 0.873 / 0.906 / 0.738 (mean 0.839), all end by budget at 14–16 min | above band: L1 too small for panel V; next a 6–8 task lot |
| 2026-10-02 | pilot OpenSpec (`20261002T100950Z-7e60e3ee`, `20261002T100950Z-9376b32b`, seed 20261031, configs `criba8/pilot-*.json`) | c4g-clock n=1 | ospec_green, ospec_brown × 1 | 4.6M | green 0.970 (12.3 min, done), brown 0.998 (9.3 min, capped at 3M) | both saturate; scale up ~4x before calibrating |
| 2026-10-02 | round 8 calibration (36 campaigns `20261002T111710Z-c227adf3` → `20261002T115022Z-b1ddf99d`, seed 20261030, code `6e586ac`) | c4g-clock, Pi (n=1, k=3) | opt_shop2, opt_roster2, opt_packing2, plan_timetable, pred_demand, opt_routing × 3 | 6.4M | clock: roster2 0.403 in band; routing 0.620, pred 0.633 above; shop2 0.175, packing2 0.215, timetable 0.218 below | panel D = cph, opt_roster2; remedy (large visible instance) for the three below |
| 2026-10-02 | round 8 stage remedy (9 campaigns `20261002T124256Z-cdc442e1` → `20261002T125232Z-a2671488`, seed 20261032, code `0097a51`) | c4g-clock n=1 | opt_shop2, opt_packing2, plan_timetable × 3 (after the large-visible-instance remedy) | 2.0M | shop2 0.306, packing2 0.402, timetable 0.272 | shop2 and packing2 enter panel D; timetable dropped |
| 2026-10-02 | round 8 stage ospec (6 campaigns `20261002T130021Z-d3c30e94` → `20261002T132336Z-6d8ed73d`, seed 20261033, 6M and 30 min per run) | c4g-clock n=1 | ospec_green, ospec_brown × 3 (after the ~4x scale-up and the review fixes) | 36.2M | green 0.459, brown 0.448; all 6 end by budget at 12–23 min | both enter panel V |
| 2026-10-02 | round 9 V (6 campaigns `20261002T144540Z-2fd46338` → `20261002T150244Z-59dbbe1c`, seed 20261035, 6M and 30 min per run, code `3ea1d8d`) | v-swarm-clock n=4 (C1 = round 8 calibration, reused) | ospec_green, ospec_brown × 3 | 36.1M | S4 green 0.166 vs 0.459, brown 0.412 vs 0.448 | swarm loses on V |
| 2026-10-02 | round 9 D (12 campaigns `20261002T144550Z-2b1171ae` → `20261002T160742Z-bd8122ed`, seed 20261034, code `3ea1d8d`; 3 of 12 runs on `89478ef`, equivalent with threads off) | x1g-select-clock n=3 vs c4g-clock n=1 (paired) | cph, opt_roster2, opt_shop2, opt_packing2 × 3 | 34.7M | S3 − C1: cph −0.09, packing2 +0.27, roster2 −0.22, shop2 +0.02; mean −0.004; S3 capped 4/12 | not decided |
| 2026-10-02 | round 10 S3 (9 campaigns `20261002T165303Z-00d0c849` → `20261002T182954Z-f4db5fa7`, seed 20261036, code `9d1180b`) | C1s c4g-signal, C1 c4g-clock (n=1), S3s x1g-select-signal n=3 (paired) | opt_packing2, opt_shop2, opt_roster2 × 3 | 35.9M | S3s − C1s +0.46 / +0.09 (roster2 −0.03); C1s − C1 −0.50 / +0.10 (roster2 +0.29); S3s capped 7/9 | 10A primary: adds by the letter, but C1 (no norm) 0.719 ≥ S3s 0.679 on packing2; the norm does not help |
| 2026-10-02 | round 10 S2 (9 campaigns `20261002T192127Z-b2d51c69` → `20261002T200521Z-0b133e12`, seed 20261037) | C1s, S2s x1g-select-signal n=2 | same × 3 | 23.3M | S2s − C1s +0.57 / −0.03 (roster2 −0.20); packing2 0.904 in 3 of 3; capped 3/9 | size n=2: not decided |
| 2026-10-02 | round 10 S10 (9 campaigns `20261002T171902Z-54fb30cf` → `20261002T183722Z-e32a4ae8`, seed 20261038) | C1s, S10s x1g-select-signal n=10 | same × 3 | 29.6M | S10s − C1s −0.03 / −0.06 (roster2 +0.11); all 9 capped at 4.4–6.4 min | size n=10: not decided |
| 2026-10-02 | round 10 B0 (9 campaigns `20261002T184552Z-9f7c1abc` → `20261002T191921Z-3583a47a`, seed 20261039) | C1 c4g-clock, B0 b0-basic n=3 (post-only board) | same × 3 | 21.7M | B0 − C1 +0.09 / −0.03 / −0.07, mean −0.006 | 10B not decided (as predicted) |
| 2026-10-02 | round 10 V (3 campaigns `20261002T165259Z-e530e637` → `20261002T171010Z-0af634f7`, seed 20261040, 6M and 30 min) | TI ti-swarm-clock n=4 (C1 round 8 and S4 round 9 reused) | ospec_brown × 3 | 18.1M | TI 0.416 vs C1 0.448, S4 0.412; board-only turns 35.6% of tokens (target < 10%) | 10C: V parked |
