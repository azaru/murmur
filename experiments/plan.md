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

## Round 11, phase 1: the single agent without an oracle, and calibration of the blind panel (fixed before measuring, 2026-10-03 10:09; the user approved the plan, keeping the clock, ospec's own regression tests and the production sizes in the specs)

**The blind panel** (built 2026-10-03; reports `reports/2026-10-03-oracle-audit-blind-d.md` and `reports/2026-10-03-blind-panel-wave2.md`). Seven variants in `../swarmtest/staging/*_blind`. In each, the visible check (`npm run test`) confirms only that the deliverable runs and writes the documented format. No agent-visible file mentions a grader, hidden tests or scores. The hidden graders are byte-identical to the originals, and each reference solution gets the same hidden score (packing2 within 0.0004, because its solver stops on wall-clock time).
- Optimisation: opt_packing2_blind, opt_shop2_blind, opt_roster2_blind. Baseline, score formula and best-known values are removed. Production sizes and the 10 s limit stay as requirements.
- Contracts: information_extraction_hard_blind, ledger_reconciliation_hard_blind, durable_workflow_engine_blind.
  - The old checks gave expected records or accounts and asserted scenario values.
  - durable's prompt and CONTRACT.md also lose the ArcSwarm roster/ownership paragraph, because it assigned roles.
  - ledger's `holdout/build_workspace.py`, which only regenerated the old check, is removed.
- Volume: ospec_brown_blind.
  - The 13-scenario check and its scenario counts are gone.
  - The project's own regression tests stay in `workspace/tests/`, as in a real brownfield project, but `npm run test` no longer runs them.

**Question.** Without an oracle, which of the old single-agent findings hold? They are "murmur's agent beats Pi", "norms help" and "the clock helps". And which blind tasks leave the single agent headroom for phase 2?

**Arms** (all n=1; new profiles, smoked on a one-agent trio task: all passed, 20–25k tokens; norms and clock lines present; no acceptance-check text):
- **Pi**: the Pi coding agent without murmur, given only the task prompt (`adapters/pi.mjs` sends `request.prompt` and nothing else; checked).
- **solo**: murmur's oracle-free default briefing plus `writeGuard`.
- **solo-norms**: solo plus generic engineering norms: nobody checks your work, write and run your own tests, use the time while something is unverified, the `write` warning, errors are information. It also gets a `done` description without any check.
- **solo-norms-clock**: solo-norms plus `clock`.

**Execution.** `experiments/criba11-lanes.mjs <lane> <stage>...`, 2 lanes (the optimisation solvers are wall-clock bound, and round 10 showed the load moves in-run results).
- **Stage P:** seed 20261053, 3M and 1200 s. One campaign per task × repetition over the six non-ospec tasks, k=3. With this seed, `make_plan` runs solo-norms, Pi, solo, then solo-norms-clock (checked).
- **Stage O:** seed 20261054, 6M and 1920 s. ospec_brown_blind with solo-norms-clock alone, k=3.

**Rules** (per-task means over the six P tasks; capped runs count as floors; an arm with ≥ 1/3 capped runs is flagged). Each contrast passes if the difference is ≥ +0.05 on the mean and the arm wins at least 4 of 6 tasks. It fails if the difference is ≤ −0.05 and the arm loses at least 4 of 6. Otherwise it is not decided.
- R1, murmur's agent against Pi: solo-norms − Pi. Old finding: c4n1 − Pi ≈ +0.25.
- R2, norms: solo-norms − solo.
- R3, clock: solo-norms-clock − solo-norms. Old finding: +0.56 on ieh, ieh2 and ledger with a red check.
- **Calibration for phase 2, fixed now:** a task enters phase 2 if solo-norms-clock's mean is in [0.15, 0.85]. Tasks outside that range are left out of phase 2, with no adjustment in this round. The same rule applies to ospec_brown_blind for a volume comparison.
- **Predictions:**
  - Contract tasks drop the most against their oracle runs: ieh and ledger lost sample expected values, and durable lost asserted scenarios.
  - R2 helps.
  - R3 is smaller than in round 6A and possibly not decided, because without a red check the clock has nothing to keep the agent working against.

**Addendum (2026-10-03 10:35, after 4 of 21 campaigns had ended and before any rule was applied).** The user asked whether the clock is a lab artefact too. Decision: it is kept. Users set the token and time caps when they launch a swarm, so showing the time left is available in real use. R3 stays as written. Tokens and minutes per arm are reported next to every score, so that a clock gain bought with much more spend reads as such (descriptive).

**Addendum 2 (2026-10-03 11:30): stage C, the clock without norms. It is a deviation, added after 10 of 21 campaigns had ended and after looking at interim per-task means.** The user pointed out that the design is not factorial. R3 measures the clock only together with the norms, so a gain cannot be attributed to the clock alone, and the norms' "use the time while something is unverified" may be what the clock acts on.
- **New arm:** solo-clock, which is solo plus `clock` with no norms. Its smoke on the one-agent trio task passed (20k tokens, clock lines present, no norms).
- **Stage C:** seed 20261055, campaigns `[solo, solo-clock]` on the six P tasks, k=3, 3M and 1200 s. `make_plan` runs solo first (checked), so solo gets a second paired sample.
- **R4, the clock without norms:** solo-clock − solo, paired within stage C, with the same thresholds as R1–R3.
- **Descriptive:** the interaction, (solo-norms-clock − solo-norms) against (solo-clock − solo). The two contrasts come from different campaigns, so it is not paired.
- **Budget:** ~(0.1 + 1.0)M × 18 ≈ 20M.
- It runs after stage P, on the same 2 lanes.

**Not in this phase:** swarms and prompt optimisation. Phase 2 (swarm against single agent on the tasks that pass calibration) and prompt optimisation (autotuner, with held-out tasks) are pre-registered after phase 1.

**Budget (estimate):** P ~2M per campaign (Pi 0.3, solo 0.3, solo-norms 0.5, solo-norms-clock 0.8) × 18 ≈ 36M. O 3 × 6M = 18M. **Total ~54M**, upper bound ~70M.

**Old findings and where they are re-tested:**

| finding (with oracle) | re-test |
|---|---|
| murmur's single agent beats Pi; norms help | phase 1, R1 and R2 |
| the clock keeps the single agent working | phase 1, R3 |
| no swarm beats a persistent single agent (board, parallel attempts, bare board B0, V swarm) | phase 2, on the tasks that pass calibration |
| fresh-context relays beat n=3 swarms | phase 2, as the compute-matched single-agent control |
| the write guard fixes the broken shared file | phase 2 (it needs a swarm); kept on in every arm |
| role menus, notices, locks, verified findings, re-allocation across tasks | not re-tested for now: neutral or negative with the oracle; the user decides |
| evidence gate, help signals, `doneAfterGreen`, selection by a printed score | not re-tested: keyed to the check or to a printed score, so lab-only by the realism rule |

### Round 11 phase 1 result and rule applied (2026-10-03 13:40; launched 10:09 with the user's OK, 2 lanes, code `7651a12`, `src/` unchanged since `d7bc0ae`)

39 campaigns, 111 runs, **39.8M tokens** (P 12.2M, O 18.2M, C 9.4M; estimate was ~54M plus ~20M for C). Every lane ended with exit 0. No grader or check was run during the campaigns.

**Stage P** (seed 20261053, 18 campaigns `20261003T080953Z-d3f8b556` → `20261003T100111Z-917d6ddb`). Mean score, then mean tokens and minutes per run, k=3. No run was capped.

| task | Pi (Pi without murmur) | solo (neutral prompt + writeGuard) | solo-norms (+ engineering norms) | solo-norms-clock (+ norms + clock) |
|---|---|---|---|---|
| durable_workflow_engine_blind | 0.52 [0.10M, 2.2 min] | 0.52 [0.09M, 2.1] | 0.36 [0.11M, 2.0] | **0.96** [0.91M, 8.4] |
| information_extraction_hard_blind | 0.02 [0.17M, 3.2] | 0.24 [0.16M, 2.6] | 0.59 [0.23M, 3.7] | **0.91** [1.01M, 11.1] |
| ledger_reconciliation_hard_blind | 0.42 [0.06M, 2.1] | 0.60 [0.08M, 2.0] | 0.44 [0.07M, 1.7] | **0.92** [0.43M, 6.0] |
| opt_packing2_blind | 0.00 [0.03M, 1.1] | 0.00 [0.11M, 1.0] | 0.01 [0.03M, 1.1] | 0.06 [0.07M, 1.8] |
| opt_roster2_blind | 0.06 [0.04M, 0.9] | 0.09 [0.04M, 1.0] | 0.14 [0.03M, 0.6] | 0.14 [0.10M, 2.2] |
| opt_shop2_blind | 0.17 [0.03M, 0.6] | 0.05 [0.06M, 0.7] | 0.09 [0.04M, 0.8] | 0.16 [0.07M, 1.5] |

**Stage O** (seed 20261054, 3 campaigns `20261003T080947Z-2337418f` → `20261003T083957Z-55dea7a2`): ospec_brown_blind with solo-norms-clock scores 0.474 / 0.535 / 0.405 (mean 0.47) at 6.0–6.1M and 14 min. **All 3 runs hit the 6M cap**, so they count as floors and the arm is flagged. swarmtest records these campaigns' stop reason as `usage_unknown_or_cleanup_unconfirmed`; each held a single run, so nothing else was lost.

**Stage C** (seed 20261055, 18 campaigns `20261003T100141Z-ac05f238` → `20261003T110416Z-9d1641ed`), k=3, no run capped:

| task | solo | solo-clock (neutral prompt + writeGuard + clock, no norms) |
|---|---|---|
| durable | 0.44 [0.10M, 1.8] | 0.99 [1.05M, 8.4] |
| ieh | 0.37 [0.20M, 2.7] | 0.71 [0.95M, 8.1] |
| ledger | 0.26 [0.08M, 2.3] | 0.92 [0.26M, 3.6] |
| opt_packing2 | 0.00 [0.04M, 1.8] | 0.28 [0.12M, 2.9] (0.04 / 0.00 / 0.81) |
| opt_roster2 | 0.10 [0.05M, 1.0] | 0.15 [0.08M, 2.1] |
| opt_shop2 | 0.00 [0.03M, 0.6] | 0.12 [0.19M, 3.2] |

**Rules, applied as written** (per-task differences in the order durable, ieh, ledger, packing2, roster2, shop2):
- **R1, murmur's agent against Pi** (solo-norms − Pi): +0.071, wins 4 of 6. **Passes.** It is carried by ieh (+0.56); the other per-task differences are −0.16, +0.02, +0.01, +0.08, −0.08, so two of the four wins are ≤ +0.02. The old finding (+0.25) shrinks to a third.
- **R2, norms** (solo-norms − solo): +0.020, wins 4 of 6 (−0.16, +0.35, −0.16, +0.01, +0.05, +0.03). **Not decided.** The prediction "R2 helps" fails.
- **R3, clock with norms** (solo-norms-clock − solo-norms): +0.255, wins 6 of 6 (+0.60, +0.32, +0.48, +0.05, 0.00, +0.08). **Passes.** The prediction that it would be smaller than in round 6A and possibly not decided fails on the contract tasks. Cost: 4–10× the tokens and 3–4× the minutes on the contract tasks.
- **R4, clock without norms** (solo-clock − solo, paired in stage C): +0.335, wins 6 of 6 (+0.55, +0.34, +0.66, +0.28, +0.05, +0.12). **Passes.** packing2's +0.28 comes from one run (0.81).
- **Descriptive interaction:** the clock gains +0.255 with norms and +0.335 without them (different campaigns, not paired). The norms add nothing the clock does not already give.
- **Calibration for phase 2** (solo-norms-clock mean in [0.15, 0.85]): **only opt_shop2_blind (0.161) and ospec_brown_blind (0.471, flagged: 3/3 capped) enter.** durable (0.96), ieh (0.91) and ledger (0.92) saturate. packing2 (0.06) and roster2 (0.14) stay below. shop2 enters on one run of 0.48 among two zeros.

**Findings from the transcripts** (subagent reports `reports/2026-10-03-round11-traces-analysis.md` and `reports/2026-10-03-tool-usage-audit.md`, model output; the claims below marked ✓ were checked by hand):
- **Without the clock, agents stop after about 2 minutes of 18, often knowing the work is unfinished.** Across the 27 no-clock contract runs, 0 kept a test file of their own. In 14 of 27 the done reason or final text says the contract is not fully met (all 9 durable runs) ✓ (`20261003T091945Z-94fe3c49/run-0003`, done reason "the full contract is not met … Further work is required"). The usual pattern is one write, one `npm run test`, then done. Ledger's scores are bimodal (0.08–0.17 or 0.64–1.0) with the same behaviour, so first-draft luck decides them.
- **The clock is never mentioned.** Agents never refer to the time left in their text or reasoning: 1 hit in 30 clock runs, and it is about their code's own timeout handling ✓. They simply keep working: 39 calls per contract run against 13. After minute 3, 35% of their calls verify (probes, test runs, own test files) and 39% edit. They never re-read the contract, and they stop on their own with 5–14 minutes left. The gain mixes verification and more attempts; the analysis could not separate the two.
- **Norms change behaviour slightly but not the score.** Runs with at least one behavioural probe: 1/9 solo against 6/9 solo-norms; own test files 0 against 0; calls and time about equal.
- **The optimisation tasks are near 0 for a structural reason.** The grader is `clamp((naive − cost)/(naive − best))`, with a strong naive baseline and best ≈ 0.66–0.79 of naive, so any solution at or above the naive cost scores 0 (99 of 168 instance results). No-clock runs submit their first greedy solution after 33–106 s, using 0.1–2.5 s of the 10 s limit. Local search shows up mainly in clock runs (7/9 solo-norms-clock, 3/3 solo-clock). No run builds a baseline to compare candidates, and one clock run accepted a worse cost (129,870 → 130,275) ✓ (`20261003T080953Z-d3f8b556/run-0004`, messages 22 and 28). The roster workspace has no production-size example.
- **ospec_brown_blind is volume-bound.** All 3 runs end on the token cap mid-work at 12–14 of 32 minutes. 97% of their tokens are cache reads of a 52–68k context, and regression tests stay at 100% while 21–38% of the change group passes.
- **Tools:**
  - `writeGuard` refused 5 writes in round 11 ✓, all on `extract.py` in ieh and all true positives: the agent was trying to append. In 2 of 3 Pi runs that chunked the same file without a guard, the file was destroyed; one ended as a 216-byte stub with score 0.0 ✓ (`20261003T090544Z-46d87407/run-0002`).
  - The guard missed a 94-character stub over a 9.2k-character file because the stub's first line equals the file's ✓ (`20261003T101120Z-b52e2cc6/run-0002`, message 12).
  - About 8.5% of `edit` calls fail, in every group. The main cause in round 11 was over-escaped backslashes in regex code (11 of 23 "not found").
  - Pi's `write` description already says it overwrites. The agents' problem is that there is no append tool, not a misunderstanding.

**Deviations and infrastructure:**
- Stage C was added after looking at interim results (addendum 2), so R4 is a declared deviation.
- **Correction (same day): the cause of the load spike is not established, and this session's own activity is the likeliest one.** The machine's load rose to 33–91 between about 12:25 and 12:39. It began when this session's two read-only analysis subagents started (the tool audit and the trace analysis). They bulk-read several hundred transcript files under `nice -n 15` with at most 3 processes and ran no grader. Codex processes started at the same moment. The load fell from 91 to 15 within 3 minutes after the second subagent finished. CPU use stayed at about 8 of 12 cores, so the load was mostly I/O wait, which `nice` does not throttle. The first version of this note blamed the user's other processes, which was not supported. The spike overlapped the C campaigns opt_packing2 r1, opt_shop2 r1, opt_roster2 r1, ledger r1 and ieh r1, and the optimisation solvers are wall-clock bound, so those runs may be slightly worse. No verdict depends on them: R4 passes on the other five tasks without packing2, packing2's 0.81 run (r2) ran after the spike, and calibration uses stage P. Lesson: bulk transcript reads wait for the end of wall-clock-bound campaigns.

**Decision.** By the rules: R1 passes narrowly, R2 is not decided, and R3 and R4 pass. Without an oracle, the clock (knowing the time left) is the one lever that moves a single agent, and it works without the norms. As pre-registered, phase 2 has only shop2 and ospec, which is too few to order anything. The tasks are not adjusted in this round; the proposal for phase 2 goes to the user.

## 2026-10-03: tool levers `append` and `toolDescriptions` for built-in tools (default off)

From the tool audit above, and at the user's request to review the tools (code in the commit that adds this note). Both are new levers that default to off, so no existing profile changes. All 39 profiles load as before.
- `append: true` offers `append(path, content)`, which adds text to the end of a file and creates it if missing. It goes through the same claim and stale-file bookkeeping as `write`. When it is on, the `writeGuard` refusal text suggests it.
- `toolDescriptions` now also accepts the built-in tools the profile offers, and `append`. murmur then registers its own copy of Pi's tool with the new description. Pi's one-line summaries and guidelines in the system prompt stay as they are. The write guard keys on the tool's name (`isToolCallEventType` compares `toolName` only; checked in the SDK), so it still fires when `write`'s description is replaced.

Smoke tests (scripted, from a copy in `tmp/`):
- writing a file in three parts with `write` + `append` + `append` gave the exact six lines;
- a partial `write` was refused with the text that mentions append;
- the session's tool definitions carry the replaced descriptions of `write` and `edit`;
- a description for a tool the profile does not offer is rejected;
- the default profile on `examples/trio.json` passed (all_done, 157k tokens).

**Not measured yet.** If murmur's arms get tools Pi lacks, every murmur-against-Pi comparison must say so.

## 2026-10-03: decisions after round 11 phase 1 (the user approved every recommendation in the proposal)

- **Phase 2 tasks:** harder blind contract tasks, built in `../swarmtest/staging/`, calibrated against solo-clock (one agent with the clock, no norms) at k=3 into the band [0.3, 0.6]. opt_shop2_blind and ospec_brown_blind also enter, because they passed phase 1's calibration. No continuous-metric regrade of the optimisation tasks and no tighter caps.
- **Phase 2 arms:**
  - the control is C1 = solo-clock;
  - S2 has two agents with the clock, a shared folder, a post-only board and the neutral prompt;
  - S2 without the clock is paired against solo, to test whether a teammate acts as the "keep working" cue.
  - Every campaign has its n=1 competitor, ospec runs one campaign per arm, and there are at most 2 lanes.
- **Cost rule for phase 2:** a swarm arm "wins" only if its per-task mean is ≥ +0.05 above the control, it wins ≥ 4 of the tasks, and its mean tokens per run are ≤ 2× the control's. If it clears the score bar at a higher cost, it is recorded as "wins at higher cost". Tokens and minutes are reported next to every score.
- **Prompt optimisation (autotuner):** the rule "never tune against what the grader rewards" is read as follows. Tuning may use the scores of a training set of tasks whose graders are then retired from measurement, and every claim is confirmed on held-out blind tasks the tuner never saw. This reading is approved by the user. The objective and the task split will be pre-registered after phase 2's tasks exist.
- **Tools:** a separate small round measures the new tool levers (pre-registered below) before phase 2 uses them.
  - On re-checking the audit, the write guard's "shorter and starts differently" clause also caught 5 writes in earlier swarms that would have erased a teammate's file, and it already refuses empty writes. So **the guard is not changed**; the proposal to drop that clause is withdrawn.
  - The advice for failed edits (copy backslashes exactly) goes into `edit`'s description, with no new code.
- **AGENTS.md** gets a rule: no bulk transcript reads while campaigns run.
- **Archive:** the user decided (17:15) that the archives need not be uploaded and that packing is not a priority. The raw runs of rounds 11–14 stay in `../swarmtest/runs/`, and none of them is packed for now.

## Round 12: the tool levers (fixed before measuring, 2026-10-03 13:45; the user approved the plan)

**Question.** Round 11's tool audit found that agents write a long file in several `write` calls, and each call replaces the file. The write guard caught all 5 cases in murmur, and Pi lost the file in 2 of 3 runs. Do an `append` tool and clearer `write`/`edit` descriptions remove the problem and the wasted calls? And is the guard still needed once agents have them? This round settles which tool set phase 2's murmur arms use.

**Task.** information_extraction_hard_blind is the only blind task where chunked writes happened (14 of 21 round-11 runs). k=4. Every run gets 3M tokens and 1200 s.

**Arms** (all n=1 with the clock; new profiles, which load and register the expected tools):
- **G** = `solo-clock`: the neutral prompt, the write guard and the clock. This is the reference.
- **GA** = `solo-clock-append`: G plus `append`.
- **GDA** = `solo-clock-tools`: GA plus replaced `write` and `edit` descriptions.
  - `write` says the content becomes the whole file, and to use edit or append.
  - `edit` says to copy oldText exactly, with backslashes as in the file and not doubled, and to re-read after a failure.
- **DA** = `solo-clock-tools-noguard`: GDA without the guard.
- **Pi**: the Pi agent without murmur, as the unguarded reference.

**Execution.** `experiments/criba12-lanes.mjs <lane> T` with 2 lanes and seed 20261056. One campaign per repetition with all five arms. `make_plan` runs Pi, G, GDA, DA, then GA (checked), and no arm is expected near the cap.

**Measures** (from the transcripts and `events.jsonl`, by a script written before reading the results):
- **shrinking writes**: a `write` whose content is under half the tracked length of the existing file. The length is tracked from earlier write, append and edit calls in the same run. Each one is counted as refused or as gone through.
- **lost content at the end**: the final deliverable is under half the largest size it reached during the run.
- **edit failure rate**: edit calls that return an error, over all edit calls.
- **wasted calls**: calls from a refused write or failed edit to the next successful write or edit on the same path.
- **append use**, and the score and tokens (descriptive).

**Rule for phase 2's tool set:**
- Use **GDA** if all of these hold over its 4 runs:
  - (a) no shrinking write goes through, and no run loses content at the end;
  - (b) its mean score is not below G's by more than 0.05;
  - (c) its edit failure rate is not above G's by more than 3 points.
- Otherwise use **GA** if it meets (a) and (b). Otherwise keep **G**.
- DA against GDA is descriptive: if DA passes (a) too, the guard was redundant once append and the descriptions exist.
- Any murmur arm with `append` has a tool Pi lacks, and every murmur-against-Pi comparison will say so.

**Budget.** About 4 × (0.2 + 4 × 1.0)M ≈ 17M.

### Round 12 result and rule applied (2026-10-03 15:00; launched 13:46 with 2 lanes, code `07b6cf4`)

4 campaigns (`20261003T114648Z-eb5e6f59`, `20261003T114708Z-d6a79cc8`, `20261003T122450Z-91dce613`, `20261003T122926Z-b6187a74`), seed 20261056, 20 runs, **18.7M tokens**. All exit 0, no run capped. Table from `scripts/writes.mjs`, committed before the results; per run in `round12-writes.md`.

| arm | mean score (runs) | tokens | min | shrinking writes through / refused | lost at end | writes per run | appends | edit failure rate | wasted calls per run |
|---|---|---:|---:|---|---:|---:|---:|---:|---:|
| Pi (Pi without murmur) | 0.443 (0.52 0.46 0.53 0.27) | 0.16M | 3.2 | 0 / 0 | 0 | 2.0 | – | 33% | 1.8 |
| G, solo-clock (guard) | **0.909** (0.76 0.91 1.00 0.97) | 0.95M | 8.1 | 0 / 2 (4 refusals) | 0 | 3.0 | – | 32% | 12.5 |
| GA, solo-clock-append (guard + append) | 0.843 (1.00 0.40 1.00 0.97) | 1.48M | 10.1 | 0 / 0 | 0 | 1.0 | 7 | 23% | 11.5 |
| GDA, solo-clock-tools (guard + append + descriptions) | 0.747 (0.80 0.54 0.92 0.73) | 0.75M | 7.5 | 0 / 0 | 0 | 1.0 | 7 | 23% | 9.5 |
| DA, solo-clock-tools-noguard (append + descriptions) | 0.972 (0.93 0.97 1.00 1.00) | 1.34M | 9.4 | 0 / 0 | 0 | 1.0 | 6 | 18% | 6.5 |

**Rule, as written:**
- GDA meets (a): no shrinking write went through and no run lost content. It fails (b): 0.747 is 0.162 below G.
- GA meets (a) and fails (b): −0.066.
- **So phase 2 keeps G** (the write guard, no append, Pi's descriptions).
- DA, descriptive: it also meets (a), and the guard never fired in GDA, so with append and the descriptions the guard was redundant here.

**Findings** (claims marked ✓ checked by hand in the transcripts):
- **The mechanism works as intended.**
  - With `append`, agents write the long `extract.py` as one `write` plus appends (✓ `eb5e6f59/run-0005`: write 6.3k, append 5.5k, append 5.6k). Writes per run fall from 3.0 to 1.0, and refusals from 4 to 0.
  - G's agents instead re-send the whole file and then get a chunk refused (✓ `d6a79cc8/run-0002`: three full writes of 6.6k, 6.3k and 13.1k, then a refused 2.6k chunk).
  - Arms with the replaced descriptions waste fewer calls (9.5 and 6.5 per run against 12.5), and edits fail less (18–23% against 32%).
- **The score rule cannot see this, because single-task noise at k=4 is larger than the effect.** GDA and DA ran with the same effective tools, since the guard never fired in GDA, yet their means differ by 0.225. GA's 0.40 run and GDA's 0.54 run are first-draft outcomes, not tool failures.
  - In hindsight, a 0.05 score margin on one task at k=4 was the wrong guard for a tools decision. It is kept as written, and the user is told.
- **Pi did not chunk this time** (0 of 4 runs, against 3 of the round-11 Pi runs on this task). Its edits fail as often as G's.
- Edit failure rates on this task (18–33%) are well above the audit's 8.5% across all tasks. The clock runs make many regex edits in `extract.py`.

## Round 13: calibration of the third wave of blind tasks for phase 2 (fixed before measuring, 2026-10-03 15:05; within the plan the user approved)

**Question.** Which of four harder blind contract tasks leave phase 2's control enough headroom? The control is C1 = solo-clock (one agent with the clock and the write guard, no norms; round 12 kept the guard alone).

**Tasks.** They were built and checked as in `reports/2026-10-03-blind-panel-wave3.md`. Graders are identical to the originals, and reference scores were re-run before launch.
- constrained_planning_hard_blind (planning);
- information_extraction_hard2_blind (ieh2);
- fam_payouts_blind (an analytics contract);
- ospec_green_blind (a volume-bound OpenSpec project).

**Arms.** Pi (the Pi agent without murmur) and C1, both n=1, k=3.

**Execution.** `experiments/criba13-lanes.mjs <lane> K G`, with 2 lanes, because planning's solver has a 20 s wall-clock limit.
- Stage K: seed 20261057, planning, ieh2 and fam_payouts, 3M and 1200 s.
- Stage G: seed 20261059, ospec_green_blind, 6M and 1920 s, as for ospec_brown.
- `make_plan` runs C1 last under both seeds (checked).

**Rule.** A task enters phase 2 if C1's mean is in [0.3, 0.6]. Capped runs count as floors, and a task with ≥ 1/3 of C1 runs capped is flagged. opt_shop2_blind and ospec_brown_blind are already in from round 11.
- If fewer than 2 of the 4 new tasks enter, the next blind wave is built before phase 2. Its candidates are the fallbacks listed in the wave-3 report: data_analysis_hard, fam_billing, fam_clinic and fam_shipments.
- Pi's means are descriptive.

**Budget.** K is about 9 × 1.2M ≈ 11M. G is about 3 × 6.3M ≈ 19M. ~30M in total.

### Round 13 result and rule applied (2026-10-03 16:50; launched 15:06 with 2 lanes, code `7f2c84d`)

12 campaigns (K: `20261003T130631Z-ab2cbcbc` → `20261003T134150Z-c0a79e33`; G: `20261003T134942Z-97fa0a26` → `20261003T141549Z-9d503af0`), 24 runs, **25.3M tokens**. All exit 0.

| task | Pi (Pi without murmur) | C1 = solo-clock | C1 tokens, minutes | verdict |
|---|---|---|---|---|
| constrained_planning_hard_blind | 0.38 (0.39 0.38 0.37) | **0.465** (0.37 0.58 0.44) | 0.27M, 5.7 | **enters** |
| information_extraction_hard2_blind | 0.008 | 0.847 (0.91 0.74 0.90) | 1.72M, 11.5 | out (above 0.6) |
| fam_payouts_blind | 0.974 | 1.000 (1.00 1.00 1.00) | 0.14M, 3.3 | out (saturated) |
| ospec_green_blind (6M, 1920 s) | 0.07 | **0.425** (0.36 0.53 0.38) | 5.72M, 23.1 | **enters, flagged** (2 of 3 C1 runs capped) |

- **Rule:** 2 of the 4 new tasks enter, so phase 2 goes ahead without another wave. Its tasks are constrained_planning_hard_blind, ospec_green_blind, opt_shop2_blind and ospec_brown_blind.
- **Notes:**
  - fam_payouts is easy even for Pi (0.97). The other `fam_*` tasks are probably easy too.
  - On ieh2 the clock lifts C1 from Pi's 0.01 to 0.85. Without an oracle, that is the largest clock gap seen so far.
  - Planning's C1 stops at 4–8 minutes of 18. The traces are in `round13-traces.md`.

## Round 14 (phase 2): two agents with a board against one agent, without an oracle (fixed before measuring, 2026-10-03 16:47; within the plan the user approved)

**Question.** Without an oracle, does a small non-hierarchical swarm beat one agent at the same token and time caps? Phase 1 found that without the clock agents stop early. Does a teammate keep agents working the way the clock does?

**Tasks** (the four that passed calibration, rounds 11 and 13):
- difficulty and optimisation (3M, 1200 s): constrained_planning_hard_blind, opt_shop2_blind;
- volume (6M, 1920 s): ospec_brown_blind, ospec_green_blind.

**Arms** (new swarm profiles; both passed a 2-agent smoke on the trio task: neutral briefing and posts attached to tool results. `s2-board-clock` showed clock lines and ended all_done at 55k tokens; `s2-board` showed no clock lines, made 1 post (it ended before any post was attached) and ended all_done at 45k):
- **C1** = `solo-clock`: one agent with the clock and the write guard, no norms. It is the control, because phase 1 found norms add nothing (R2, R4).
- **S2c** = `s2-board-clock`: two agents in one folder with a post-only board (posts arrive with tool results), the write guard and the clock. The briefing says only that they are equals with no one in charge, and it has no norms and no check language.
- **solo**: one agent, the write guard, no clock.
- **S2** = `s2-board`: S2c without the clock.
- Tools stay as in phase 1, with no `append` (round 12's rule). The swarm shares its run's caps, so it gets the same tokens and time as one agent.

**Execution.** `experiments/criba14-lanes.mjs <lane> D VC VS VB VO`, 2 lanes, k=3.
- Stage D (seed 20261066): one campaign per task × repetition with all four arms. S2c runs last (checked).
- Stages VC, VS, VB and VO (seeds 20261060, 20261062, 20261063, 20261065): one campaign per arm, run alone, because single agents already hit the 6M cap on these tasks.

**Rules** (per-task means over the 4 tasks; capped runs count as floors; an arm with ≥ 1/3 of its runs capped is flagged):
- An arm **wins** if its mean is ≥ +0.05 above the reference, it wins ≥ 3 of 4 tasks, and its mean tokens per run are ≤ 2× the reference's.
- It **wins at higher cost** if the score conditions hold but its tokens exceed 2×.
- It **loses** if its mean is ≤ −0.05 below and it loses ≥ 3 of 4.
- Otherwise it is **not decided**.

Contrasts:
- **P1 (primary): S2c against C1.** Does a swarm beat the persistent single agent?
- **P2: S2 against solo.** Does a swarm beat the single agent when neither has a clock?
- **Descriptive:**
  - S2 against C1: does a teammate do what the clock does?
  - S2c against S2: the clock inside a swarm.
  - Coordination share: the fraction of turns that only post, from `scripts/traces.mjs`.
- **Predictions:**
  - P1 is not decided or loses, as in rounds 9–10 with an oracle.
  - P2 wins, if a teammate's posts keep agents working.

**Known threats, written before measuring:**
- With 4 tasks and "wins ≥ 3 of 4", one task decides. opt_shop2_blind is the noisiest: the clock agent scored 0.00 / 0.00 / 0.48 and 0.28 / 0.06 / 0.02 in two campaigns.
- On the V tasks single agents with the clock hit the 6M cap by construction, so C1 and probably S2c will carry the capped flag. That is the comparison, not a defect.

**Budget (estimate).** D is 2 × 3 × (0.3 + 1.0 + 0.1 + 0.3)M ≈ 10M. V is 2 × 3 × (6 + 6 + 1 + 2)M ≈ 90M. **Total ~100M**, upper bound ~120M.

### Round 14: stopped by the model quota after stage D (2026-10-03 18:10; launched 16:45 with 2 lanes, code `429cbb3`)

**What happened.** At 17:58 the Codex subscription returned "The usage limit has been reached". Two C1 runs on the V tasks were cut short:
- ospec_green r0 stopped at 2.54M tokens;
- ospec_brown r1 stopped at 4.88M tokens.

Three later runs made no model call at all (0 tokens). The lanes were killed at 18:00. The quota error appears in exactly these 5 campaigns, found by a scan of every assistant message with `stopReason: "error"` since 10-02:
- `20261003T154230Z-6d817148`
- `20261003T154429Z-aa563b23`
- `20261003T155828Z-2a47e79f`
- `20261003T155900Z-43e22a14`
- `20261003T155905Z-fca20609`

They are **invalid**: not counted, not deleted, and the driver's done-detection must skip them if the round resumes. The valid runs are stage D (6 campaigns, 24 runs, 10.5M) and C1 on ospec_brown r0 (`20261003T153036Z-5adae0be`, capped at 6.04M, 0.589). The round used 24.0M tokens.

**The pre-registered rules need all 4 tasks, so they are not applied.** Stage D, descriptive only (mean score [tokens, minutes], k=3):

| task | C1 (one agent, clock) | S2c (two agents, board, clock) | solo (one agent, no clock) | S2 (two agents, board, no clock) |
|---|---|---|---|---|
| constrained_planning_hard_blind | 0.421 [0.57M, 7.3] (0.39 0.45 0.42) | 0.315 [1.97M, 9.1] (0.28 0.22 0.45), 1 capped | 0.356 [0.07M, 1.9] | 0.363 [0.18M, 1.9] |
| opt_shop2_blind | 0.184 [0.09M, 2.2] (0.52 0.03 0.00) | 0.307 [0.46M, 3.8] (0.12 0.26 0.54) | 0.266 [0.06M, 1.2] | 0.366 [0.12M, 1.3] |

- S2c − C1: −0.11 and +0.12, at 3.5× and 5× the tokens.
- S2 − solo: +0.01 and +0.10, at 2–2.6× the tokens.
- shop2 swings 0.00–0.54 within one arm, so it orders nothing at k=3.
- **A teammate does not keep agents working.** S2's agents stop at 1.9 and 1.2 minutes, like solo (1.9 and 1.2). They make 15 and 10 calls each against 10 and 11, and they end with done or go quiet. With the clock, S2c's agents keep working: 52 and 24 calls each, 9.1 and 3.8 minutes. That matches C1 (33 and 14 calls, 7.3 and 2.2 minutes). The keep-working effect comes from the clock, not from the teammate.
- In S2c, 21–24% of each agent's calls go to the board. On planning S2c spent 3.5× C1's tokens and scored lower.

**Decision.** The round stops here. The user asked for a recap and a pause to analyse and decide before anything else runs.

## 2026-10-03 18:30: the goal restated, and 12-agent swarms

The user restated the goal: **the only goal of murmur is a better swarm, and knowing when a swarm is useful.** From now on the swarm has **12 agents**, and the user wants pronounced differences. Every lever tested only with an oracle has to be re-tested without one, and new levers are to be designed.

The recount, the new lever ideas and the cost estimates are in `reports/2026-10-03-lever-recount.md`.

Pending the user's decision:
- the budget per round, given the Codex quota (it ran out today after ~108M);
- the framing: equal wall-clock with a single-agent-sized budget per agent, or equal total tokens.

Round 14's V stage is not resumed, because it was a 2-agent design.

## 2026-10-03 18:50: the user's selection of levers for 12-agent swarms

Re-test without an oracle, at n=12:
- the **threaded board** (`threads`);
- **delivery** `attach` and `pull` only (`steer` is dropped);
- the **roles menu**, with a sub-prompt per role (`roles` instructions);
- **staggered entry**, done properly: each agent enters after the previous one has taken 1–3 turns, or after at least 60 s (today's `spawnGapSeconds` is time-only);
- **claims and releases with a timeout** (`claimLease`).

New levers to build:
- a **task list** that every agent can add to and take from while working. The user rates it the most promising;
- **branches per agent**, in two variants: required and optional.

Explained to the user, decision pending: the optimisation lever (each agent picks a distinct approach, candidates in a shared folder, scored by the agents' own evaluator).

**Budget: per swarm.** The swarm shares one token cap, and comparisons are at equal total tokens. This is the user's choice "B, presupuesto por swarm". The amount per swarm run is to be set from a 12-agent smoke.

## 2026-10-03 21:50: the user's decisions for 12-agent swarms, the 12-agent smoke, and three new levers (default off)

**Decisions (the user, 21:40):**
- **Cap per run: 12M tokens on planning and optimisation tasks, 24M on ospec**, shared by the whole swarm. C1 (one agent with the clock and the write guard) gets the same cap, so swarm and single agent are compared at equal caps. C1 is re-run at these caps; rounds 11–14 used 3M and 6M.
- **The optimisation lever (lever 8) is not built for now.**
- **Staggered entry by turns:** an agent enters when the previous one has made N turns or 60 s after the previous one entered, whichever comes first.
- **Optional branches:** agents work in the shared folder and may open their own branch with a `branch` tool. They then work in it by absolute path and integrate with `merge`.

**Smoke with 12 agents** (`examples/trio.json` with `agents: 12` and `s2-board-clock`, i.e. a post-only board with posts on tool results, the write guard and the clock; code `8dc2890`). It passed with all_done in 52 s and 347k tokens (149k input, 186k cache read, 13k output). Each agent used 21–37k tokens and made 8–15 calls, and all 12 called done. NAMES holds exactly 12 names. All 12 agents wrote all three modules at the same time; nobody split the work. The write guard refused 9 writes. The rate is about 0.4M tokens per minute with small contexts. It does not extrapolate to real tasks. Budgets use the single-agent rates × 12: planning ~1M/min, optimisation ~0.5M/min, ospec ~5M/min.

**New levers** (code in the commit that adds this note; all default off, and all 44 existing profiles load with them off):
- `spawnAfterTurns` (in `src/swarm.ts`): each agent enters once the previous one has finished that many model turns (assistant messages), or ends a turn, or `spawnGapSeconds` after the previous one entered, whichever comes first. murmur logs an `enter` event. With it off, `spawnGapSeconds` keeps its old meaning (agent i starts i × gap after the run starts).
- `taskList` (`src/tasklist.ts`): a shared task list, like an issue tracker. The tools are `tasks`, `task_add`, `task_take`, `task_done` and `task_drop`.
  - Only the holder can mark an item done.
  - An agent that calls done gives back the items it had taken.
  - A one-line progress summary (`[task list: 2 open, 1 taken (by you: #3), 4 done]`) is appended to an agent's next tool result whenever it changed for that agent.
  - The tools work with the board off. Nobody assigns, and no time lease was built: holding an item has no natural "touch" signal.
- `branches` (`src/branches.ts`): one git repository per run, kept in the run directory, so the shared folder gets no `.git`. The shared folder is the working tree of branch `main`. Each agent's branch has a worktree in `<runDir>/worktrees/<agent>`, outside the folder the grader reads.
  - `merge(message)` commits the agent's work and merges `main` into its branch. On conflict it stops and reports the files; the markers stay in the agent's copy. Otherwise it fast-forwards the shared folder.
  - `update()` brings others' merged work into the branch.
  - Direct edits in the shared folder are committed to `main` before every merge.
  - `"required"`: every agent works in its worktree (its cwd), and `done` is refused once while it holds unmerged work.
  - `"optional"`: agents work in the shared folder and get a `branch` tool.
  - At the end murmur commits each worktree, removes it, and records what was left unmerged in `result.json` (`unmerged`).

**Smoke tests** (from `src/`, no campaign running; scripted tasks in `tmp/`):
- unit tests `test/tasklist.test.ts` and `test/branches.test.ts` (conflict, markers refused, resolution, update, the done warning, the optional flow): 10 of 10 pass;
- turn-based stagger (trio, 3 agents, `spawnAfterTurns: 2`, gap 60 s): finch entered right after wren's second turn and robin right after finch's second; all_done, 91k tokens;
- task list (2 agents, board off): both found the list empty and added the same three items, a race the script invites; then 6 takes and 6 dones, and the progress line on every change; all_done, 99k;
- required branches (2 agents writing the same file): the first merge went through, the second reported a conflict in `shared.txt`; the agent resolved it and merged, and the shared folder ended with both names and both files; 23k. The write guard refused the agent's first resolution, a whole-file write shorter than the file with markers; the agent used `edit` instead;
- optional branches (2 agents): `branch`, write by absolute path, `merge`; both files reached the shared folder; 16k;
- default profile on `examples/trio.json`: all_done, 155k tokens, same tool list and event types as before.

## Round 15, stage A: twelve agents against one, without an oracle (fixed before measuring, 2026-10-03 21:55; the user approved the plan at 21:59)

**Question.** Without an oracle, at a shared cap of 12M tokens per run, does any of five levers change a 12-agent swarm pronouncedly? And does any 12-agent configuration beat one agent with the clock at the same cap? The user chose the levers (18:50 note) and the scope of six arms (21:52).

**Tasks** (12M cap and 1200 s per run, for every arm):
- constrained_planning_hard_blind (difficulty). C1 scored 0.465 and 0.421 in rounds 13–14, at a 3M cap it never reached.
- opt_shop2_blind (exploration). C1 scored 0.16, 0.12 and 0.18, and single runs range from 0.00 to 0.54.
- Volume (ospec) is stage B, pre-registered separately after stage A.

**Arms** (all with the neutral briefing, the write guard and the clock; posts arrive at the end of tool results):
- **C1** = `solo-clock`: one agent with the clock and the write guard, the control.
- **B** = `s2-board-clock` at n=12: twelve equals with a post-only board, the base swarm.
- **TL** = `n12-tasks`: B plus the shared task list.
- **BR** = `n12-branches`: B plus a required branch per agent; only merged work reaches the shared folder.
- **BO** = `n12-branches-optional`: B plus optional branches, opened with `branch()` from the shared folder.
- **ST** = `n12-stagger`: B plus turn-based entry; each agent enters after the previous one's 2nd turn, or 60 s after it entered.
- **RO** = `n12-roles`: B plus a role menu with a sub-prompt per role (builder, tester, reviewer, integrator, explorer). Agents pick a role or none, and nobody assigns. The texts are new and have no check or test-oracle language.

**Before launch:** each of the 5 new profiles gets a 12-agent smoke on `examples/trio.json` (about 2M in total). It checks that the mechanism appears in the events (task-list events, merges, `enter` events, roles taken) and that the run ends.

**Execution.** `experiments/criba15-lanes.mjs 1 A`, one lane, because 12 agents load a 12-core machine.
- Seed 20261070. One campaign per task × arm × repetition, 28 campaigns in all.
- A swarm arm's campaign lists `[arm, C1]` and runs with `--limit 1`. With this seed `make_plan` puts the arm first for all 12 arm × task pairs (checked with `swarmtest plan`). C1 gets its own campaigns.
- Order: repetition 0 of every task and arm (C1 first), then repetition 1, so a stop leaves complete k=1 coverage.
- `--max-total-tokens 30000000` per campaign.
- **Quota stop:** after each campaign the driver parses the transcripts for an assistant message with `stopReason: "error"` and "usage limit" in `errorMessage`. It does not grep, because some workspaces contain the phrase. On a hit, the campaign goes to `criba15/invalid.txt` and is skipped by done-detection, its lock is removed so a resumed lane retakes it, and a `STOP` file ends the lane. The detector flags all 3 tested invalid round-14 campaigns and neither of 2 valid ones. Resuming means deleting `STOP` and relaunching, and is noted here when it happens.

**Rules** (per-task means over the 2 tasks, k=2; scores of capped runs count as they are; tokens and minutes are reported next to every score):
- **L, each lever arm against B (TL, BR, BO, ST, RO):**
  - **pronounced better** if its two-task mean is ≥ +0.10 above B's and it is above B on both tasks;
  - **pronounced worse** if it is ≤ −0.10 below and below on both tasks;
  - otherwise **no pronounced difference**.
- **S, each 12-agent arm against C1:**
  - **beats C1** if its mean is ≥ +0.05 above and it is above on both tasks;
  - **loses** if it is ≤ −0.05 below and below on both tasks;
  - otherwise **not decided**.
  - Both get the same cap and not the same spend, so the ratio of tokens spent is reported with each verdict.
- **Promotion to stage B** (ospec_green_blind, 24M and 1920 s, k=2, pre-registered before it runs): B, C1 and the pronounced-better arms (at most two, by mean). If none is pronounced better, B, C1 and the lever arm with the highest mean.
- **Descriptive** (from `events.jsonl` and `scripts/traces.mjs`, by a script written before reading the results):
  - duplicated work, measured as how many agents write each deliverable file;
  - write refusals; merges and conflicts;
  - task-list use (adds, takes, dones, drops);
  - roles taken, and entry times;
  - the board's share of calls;
  - done reasons, and tokens and minutes per run.
- **Predictions:**
  - TL is pronounced better on planning, because in the n=12 smoke every agent wrote every file.
  - BR is not pronounced: merge conflicts replace overwrites.
  - B against C1 is not decided or loses, as S2c (two agents with the clock) did in round 14.

**Known threats, written before measuring:**
- Two tasks at k=2, and shop2 swings 0.00–0.54 within an arm. That is why the lever threshold is +0.10 and why it requires both tasks.
- Most 12-agent planning runs will likely end on the 12M cap. Every swarm arm shares that cap, so hitting it is part of the comparison, not a defect.
- **Unmerged work at the cap.** When a run ends on the cap or the timeout, whatever sits in BR's twelve worktrees, or in BO's opened branches, never reaches the shared folder. murmur commits it to the branches as a record, but nothing merges it. That is the real-work meaning of a branch, but it ties BR's score to when the cap hits. So every BR and BO score is reported next to `result.json`'s `unmerged` (files per agent), to tell "left unmerged" apart from "merged but worse".
- A campaign that fails to start (exit ≠ 0, no campaign directory) keeps its lock. Before a resume, locks of units with no record are deleted. `criba15/invalid.txt` is not tracked, so its contents are copied here whenever a quota stop happens.
- Planning's solver has a 20 s wall-clock limit, and 12 agents load the machine. The load is logged at launch and again during the run.
- The round may span several quota windows, so resumed campaigns run hours apart.
- C1 never used more than 1M on these tasks, so its 12M cap changes nothing for it. It is re-run anyway, as the user decided, and rounds 13–14's C1 means are reported next to it, descriptively.

**Profile smokes at n=12 (2026-10-03 22:00–22:08, after the OK; `examples/trio.json`, 3M cap; runs deleted).** All five ran and the mechanisms appear in the events:
- TL: all_done in 62 s, 0.41M. 11 agents called `tasks()`, and nobody added an item on this small task.
- BR: **ended on the 3M cap after 4 min.** All 12 agents wrote the same three files in their branches, and 29 of 33 merge calls hit conflicts. 5 merges went through, `done` was refused 3 times for unmerged work, and 7 agents were left with unmerged files.
- BO: all_done in 52 s, 0.41M. Nobody opened a branch.
- ST: all_done in 78 s, 0.44M. 12 `enter` events over 53 s.
- RO: all_done in 93 s, 1.26M. All 12 agents first took builder, and 5 then switched to tester (3) or reviewer (2).

**Deviation (2026-10-03 22:24): order check fixed after a wrong first launch.** The lane started at 22:08. The campaign meant for B on planning (`20261003T201626Z-f3578273`) ran C1 instead, with score 0.19. My `make_plan` check had read the first `variant` in `swarmtest plan`'s output. That output lists the config's competitors before the plan, so the check proved nothing: under seed 20261070 the shuffle swaps the two competitors.
- I killed the lane at 22:24, during the next campaign (`20261003T202310Z-6f2a1318`, the TL slot, also running C1 and with no record). That campaign is listed in `criba15/invalid.txt` and not counted.
- The driver now lists `[C1, arm]`. The `plan` field (`plan[0]`) shows the 12-agent arm first for all 12 arm × task pairs (checked).
- The C1 run in `f3578273` is a valid C1 run, with the same task, seed, caps and code. Done-detection counts it as C1's second planning repetition, so C1's planning r1 does not run again.
- The locks of the B and TL slots were removed, and the lane was relaunched.

**Budget (estimate).**
- C1: 4 runs × ~0.4M ≈ 1.6M.
- Swarm arms: 6 × 2 × (planning ~11M + shop2 ~3.5M) ≈ 174M. Upper bound 6 × 2 × 24M = 288M.
- Smokes: ~2M.
- **Total ~178M**, upper bound ~290M: about two quota windows (one ran out after ~108M today).
- Wall clock about 5–6 hours of running time.

### Round 15 stage A result and rule applied (2026-10-04 01:15; lane 22:24–01:03 after the fix, code `f8a6693`, `src/` unchanged since)

28 valid campaigns (seed 20261070, `20261003T200851Z-dd25b816` → `20261003T225411Z-391aeba3`; the list is in `round15-traces.md`), 28 runs, **188.5M tokens** (estimate ~178M). There was no quota stop and every campaign exited 0. The one invalid campaign is `20261003T202310Z-6f2a1318` (the killed TL slot, no record). Load was 3–6 during the lane.

Mean score [mean tokens, minutes] (runs), k=2:

| arm | constrained_planning_hard_blind | opt_shop2_blind | two-task mean |
|---|---|---|---|
| C1 (one agent with the clock) | 0.275 [0.54M, 5.8] (0.36 0.19) | 0.412 [0.06M, 1.3] (0.55 0.27) | 0.343 |
| B (12 agents, post-only board) | 0.415 [7.40M, 5.8] (0.40 0.43) | 0.195 [3.77M, 3.5] (0.39 0.00) | 0.305 |
| TL (B + task list) | 0.410 [8.57M, 5.7] (0.44 0.38), 1 capped | 0.000 [3.83M, 4.4] (0.00 0.00) | 0.205 |
| BR (B + required branches) | 0.409 [7.91M, 6.9] (0.46 0.35) | 0.658 [5.64M, 6.7] (0.56 0.76) | 0.534 |
| BO (B + optional branches) | 0.034 [12.02M, 6.1] (0.00 0.07), 2 capped | 0.209 [8.40M, 7.6] (0.02 0.40) | 0.122 |
| ST (B + staggered entry) | 0.473 [9.67M, 6.6] (0.45 0.49), 1 capped | 0.539 [6.69M, 6.0] (0.38 0.69) | 0.506 |
| RO (B + role menu) | 0.387 [12.03M, 6.5] (0.35 0.42), 2 capped | 0.409 [7.72M, 6.8] (0.42 0.39) | 0.398 |

**Rules, applied as written** (differences in the order planning, shop2):
- **L, against B:**
  - **ST: pronounced better.** +0.058 and +0.344, mean +0.201.
  - **TL: pronounced worse, exactly at the threshold.** −0.005 and −0.195, mean −0.100.
  - BR: not pronounced. −0.007 and +0.463, mean +0.228; it is below B on planning by 0.007.
  - BO: not pronounced. −0.381 and +0.014, mean −0.184.
  - RO: not pronounced. −0.028 and +0.213, mean +0.093.
- **S, against C1** (tokens spent per run against C1's 0.30M):
  - **BR beats C1:** +0.134 and +0.246, mean +0.190, at 6.8M (23×).
  - **ST beats C1:** +0.199 and +0.127, mean +0.163, at 8.2M (27×).
  - **BO loses:** −0.241 and −0.203, mean −0.222, at 10.2M (34×).
  - Not decided: B (+0.140 and −0.217, mean −0.038, 19×), TL (−0.139, 21×) and RO (+0.055 but −0.004 on shop2, 33×).
- **Promotion to stage B:** B, C1 and ST, because ST is the only pronounced-better arm.

**Reading, before the transcripts:**
- Both verdicts that "beat C1" lean on shop2. That task's single runs span 0.00–0.76, and C1 itself scored 0.55 and 0.27 there.
- On planning every 12-agent arm except BO lands at 0.39–0.47, against C1's 0.275. C1's two planning runs (0.36 and 0.19) are below its rounds 13–14 means (0.465, 0.421).
- At k=2, a "pronounced" verdict is a screen result, not a confirmed effect.

**Findings from the transcripts** (subagent report `reports/2026-10-04-round15-traces-analysis.md`, model output; ✓ marks claims I checked by hand):
- **ST on planning: an early agent's claim settles who writes.** In `295e25a1`, wren posted "I'm implementing" at 8 s. Each later entrant deferred ("Wren owns planner.py") and took validation work, and wren made the only write of `planner.py` ✓. Agents writing the whole deliverable: 1.5 per ST planning run against 5.0 in B, where twelve agents announce "I'll implement" at once. On shop2 the effect is absent (5 and 3 full writers against B's 5 and 6). The entry steps were only 5–12 s apart, so all 12 were in by 55–70 s. ST's planning gain (+0.06) is below the lever threshold. The pronounced verdict comes from shop2, where the mechanism did not appear.
- **TL's zeros on shop2 are not caused by the task list.**
  - The list was barely used: 3 and 1 items, all "inspect/validate", and no implementation items.
  - Both final solvers were valid but costlier than the grader's naive baseline. Reviewers had pushed the solver from a wall-clock search to fixed starts, citing determinism and runtime.
  - B's 0.00 run (`b54b47ab`) failed the same way: a 7.3 s search was cut to 9 fixed policies.
  - On shop2, scores follow the last cost the agents reported for the large example (heuristic extraction).
- **BO on planning:**
  - In `b9b748b9` the final shared `planner.py` raises an IndentationError ✓. The first broken commit is tern's own untested edit, merged 5 s before the cap.
  - In `1cc39f1b` about 40 direct edits by 10 agents landed in the last minute, after the file had been verified.
  - About 20 posts begged a teammate to merge a verified solver that sat in its branch.
  - BO burned 12M in 5.5 minutes (36k tokens/s against B's 20–25k/s), while agents were still in review-and-edit waves.
- **BR on shop2:**
  - The two runs merged 6 and 9 times, against 19 and 25 conflicts.
  - Both ended with one agent's solver (robin's), adopted by the others after comparing costs at a conflict.
  - Four agents' solvers stayed unmerged in `8b326a02`.
  - The hypothesis that a conflict forces a comparison that a whole-file `write` skips rests on two runs.
- **RO:** every agent picked a role at 1–5 s, before reading the task, and builder dominated (9–12 of 12 in 3 of 4 runs). Testers and reviewers barely touched the deliverable. Both planning runs ended on the cap with no agent done.
- **Coordination share of calls:** 17–30% in B, and 24–37% in the lever arms. End reasons: 16 of 24 swarm runs all_done, 6 on the cap, 2 quiescent.

**Bugs and friction found** (none changes a verdict above):
- **Conflict markers could reach main (fixed).** In BR `8b326a02`, lark ran `git add` on a file that still had conflict markers, and `merge` let it through. Commit `f557f35` on main starts with `<<<<<<< HEAD` ✓ and stayed for about 76 s, until robin's merge replaced it. The marker check looked only at files git still listed as unmerged. It now scans every changed or new file (fix and test in the commit that adds this note). The run still scored 0.76, the best BR run.
- **The default `wake` text says "Call inbox", but the round-14 and round-15 swarm profiles offer no `inbox`** ✓. There were 8 wakes in 4 runs. One agent posted "I do not have an inbox tool", and one ended its turn on it, which produced the run's quiescent end (`0a019874`). Fixing it changes a default, so it goes to the user.
- The write guard refuses a clean rewrite of a file with markers, because the rewrite is shorter and starts differently. Agents worked around it with `rm` then `write`.
- With 12 agents on one machine, two-instance solver checks hit their bash timeouts (50 bash failures in `83c3aae1`).


## 2026-10-04 07:25: default change, the wake without inbox (the user approved it at 07:20)

The default `wake` text says "Call inbox". Swarm profiles that offer no `inbox` tool left agents with an order they could not follow; round 15 had 8 such wakes in 4 runs. **Change (in the commit that adds this note):** when a profile keeps the default `wake` but offers no `inbox`, the wake now carries the unread posts itself: "You have new messages on the board: … Continue toward the goal."
- Profiles with an `inbox` tool, or with their own `wake` text, are unchanged.
- The changed profiles are b-realloc, b-swarm, b-swarm-clock, b0-basic, n12-branches, n12-branches-optional, n12-roles, n12-stagger, n12-tasks, s2-board, s2-board-clock, v-swarm-clock and x5-lean. Their earlier runs are reproducible at commit `831e7f6` or before.
- Smoke: a scripted 2-agent run on `s2-board-clock` passed (all_done, 12k tokens). The idle agent was woken with "You have new messages on the board: wren: ping" and wrote the message to a file.

## Round 15, stage B: twelve agents against one on volume (fixed before measuring, 2026-10-04 07:25; the user approved the launch at 07:20)

**Question.** On a volume-bound task, do B (12 equals with a post-only board) and ST (B + staggered entry, stage A's only pronounced-better lever) beat C1 (one agent with the clock) at the same 24M cap? And is ST still better than B there? The arms follow stage A's promotion rule.

**Task.** ospec_green_blind, a volume-bound OpenSpec project. C1 scored 0.425 at 6M in round 13, with 2 of 3 runs capped. Every run gets 24M and 1920 s; k=2.

**Arms:** C1 = `solo-clock`; B = `s2-board-clock` at n=12; ST = `n12-stagger` at n=12. The profiles are unchanged since stage A. The code differs from stage A by the conflict-marker fix (branches only, not used here) and by the wake change above, which applies to B and ST.

**Execution.** `experiments/criba15-lanes.mjs 1 V`, one lane, seed 20261072. Campaigns list `[C1, arm]` with `--limit 1`, and `plan[0]` is the 12-agent arm for B and ST under this seed (checked on the plan field). C1 gets its own campaigns. Order: repetition 0 (C1, B, ST), then repetition 1. The quota stop and the resume rules are as in stage A.

**Rules** (k=2 on one task; scores of capped runs count as they are; tokens and minutes are reported):
- **ST against B:** pronounced better if ST's mean is ≥ +0.10 above, pronounced worse if ≤ −0.10, otherwise no pronounced difference.
- **Each of B and ST against C1:** beats C1 if ≥ +0.05 above, loses if ≤ −0.05 below, otherwise not decided. Tokens spent are reported with the verdict.
- **Descriptive:** the three-task means (stage A plus this task) for B, ST and C1, and the measures of `scripts/n12.mjs`.
- **Predictions:**
  - B loses to C1. Twelve agents spend 24M in about 5 minutes at the observed ~5M/min, while C1 can work for most of 32 minutes. The 4-agent V swarm also lost in round 9, with an oracle.
  - ST is not pronounced against B, because ST's mechanism helps when one deliverable file is the bottleneck, and ospec has many files.

**Known threats:**
- The 12-agent runs will very likely end on the 24M cap, and C1 may end on the timeout. Both endings are part of the comparison.
- With one task at k=2, a single run can move a mean by 0.2.
- ospec's own regression tests run in each agent's shell, so 12 agents load the machine.

**Budget (estimate):** B 2 × 24M + ST 2 × 24M + C1 2 × ~14M ≈ **124M**, upper bound ~144M. That is probably two quota windows. Wall clock is about 2 hours.

### Round 15 stage B result and rule applied (2026-10-04 08:57; lane 07:26–08:50, code `f4c5f63`, `src/` and profiles unchanged since)

6 valid campaigns (seed 20261072, `20261004T052617Z-702c5333` → `20261004T064229Z-4b350f75`; the list is in `round15-traces.md`), 6 runs, **117.8M tokens** (estimate ~124M). There was no quota stop, every campaign exited 0, and `criba15/invalid.txt` still lists only stage A's killed slot. Each campaign ran the intended competitor (checked on `record.json`'s variant). Load was 3–5 during the lane.

Score [tokens, minutes, end] per run, k=2:

| arm | run 1 | run 2 | mean | mean tokens | mean minutes |
|---|---|---|---:|---:|---:|
| C1 (one agent with the clock) | 0.426 [11.0M, 24.9, done] | 0.469 [10.6M, 26.9, done] | 0.447 | 10.81M | 25.9 |
| B (12 agents, post-only board) | 0.638 [24.1M, 7.4, cap] | 0.830 [24.0M, 7.0, cap] | 0.734 | 24.05M | 7.2 |
| ST (B + staggered entry) | 0.790 [24.0M, 7.1, cap] | 0.947 [24.0M, 7.3, cap] | 0.869 | 24.03M | 7.2 |

**Rules, applied as written:**
- **ST against B: pronounced better**, +0.135 (threshold +0.10).
- **B beats C1**, +0.286, at 2.2× C1's tokens.
- **ST beats C1**, +0.421, at 2.2× C1's tokens.

**Descriptive:**
- Three-task means (stage A's planning and shop2 plus ospec_green; tokens per run averaged over the three tasks): ST 0.627 [13.5M], B 0.448 [11.7M], C1 0.378 [3.8M].
- Both predictions failed. B did not lose to C1: it won by +0.29. ST was pronounced better than B on a many-file task.
- C1 did not run out of anything. Both runs ended with `done` at 10.6–11.0M of 24M and at 25–27 of 32 minutes. Its mean (0.447) is close to round 13's 0.425 at a 6M cap, where 2 of 3 runs were capped. So the larger cap did not raise C1 on this task.
- Every 12-agent run ended on the 24M cap after about 7 minutes (3.3M tokens per minute), with 0–1 agents done.
- The ranges overlap. B's runs differ by 0.19 and ST's by 0.16, and ST's lower run (0.790) is below B's higher one (0.830). All four swarm runs are above both C1 runs.

**Findings from the transcripts** (subagent report `reports/2026-10-04-round15b-traces-analysis.md`, model output; ✓ marks claims I checked by hand):
- **C1 is bound by time on this task, not by tokens.** murmur's own timeout is 30 minutes (`timeoutMinutes`, inside swarmtest's 1920 s). C1 called `done` with the clock showing 5.2 and 3.3 minutes left ✓, at 11.0M and 10.6M ✓. Both done messages say the change is incomplete (95 and 86 of 167 tasks unticked). One agent turns about 0.44M tokens per minute into about 3 ticked tasks per minute, all in one 870–900-line file.
- **The swarm wins on coverage, not on quality** ✓. The grader has 47 capabilities. The ones scoring 0 number 23 and 20 for C1, 14 and 6 for B, and 8 and 1 for ST. Inside the capabilities scored above 0, the weighted score is 0.87–0.89 for C1, 0.92–0.95 for B and 0.96–0.97 for ST. Twelve agents covered more of the spec in 7 minutes than one agent did in 25.
- **The swarm's losses are orphaned or unwired modules:**
  - In B `ad877a8f`, plover and swift each yielded the warehouse-operations module to the other, 1.2 s apart, and nobody wrote it. Its six capabilities are exactly the run's six zeros ✓.
  - In B `f21a7e66`, reports, import-export, units and barcodes were never written. The board noticed the missing `reports.py` at 401 s, and four agents then claimed it within 25 s.
  - In ST `f7a15bdf`, four modules written in the last 25 s before the cap were never wired into the `Stockroom` class.
  - In ST `4b350f75`, only `abc_analysis` is unwired, and it is the run's only zero ✓.
- **Staggered entry gives a cleaner start; the score gap is not separated.** In B `ad877a8f`, seven agents posted that they would take the core between 6.3 and 14.7 s ✓. In ST `4b350f75`, wren claimed the core at 10.1 s and finch took the extensions at 15–17 s ✓; later entrants read the board and claimed what was still open. Posts before 60 s: 54–55 in B against 24–28 in ST. Duplicate whole-file writes: 5 and 2 in B, 2 (both refused) and 0 in ST. The post share of calls is similar (19–27%). With B's runs 0.19 apart, +0.135 at k=2 is a screen result. The mechanism matches stage A's planning finding, this time on a many-file task.
- **Where the 24M went:**
  - cache reads are 94–95%;
  - 97–99% of posts take a full-context turn of their own, which makes post-only turns 20–28% of tokens;
  - the 12 agents made 645–745 turns at about 34k tokens per turn;
  - when the cap hit, the agents' clock still showed about 22.8 minutes left. Nothing tells them about the shared token budget. In f21a7e66, the write that was in flight at the cap (`reports.py`) was lost.
- **Friction:**
  - The new default wake was not exercised: there is no `wake` event in any swarm run ✓, because no agent went idle before the cap.
  - The write guard refused 8 writes; the 3 that were inspected were genuine partial writes.
  - The subagent found no bash timeouts in this stage.

## 2026-10-04 09:27: the user's decisions after stage B, the `clockTokens` lever, and the list of arms to re-evaluate

**Decisions (the user, in reply to the 09:05 proposal):**
- Show the tokens left next to the clock. This is realistic: real work has budgets, and people can see them.
- Drop B (12 equals with a post-only board). From here on, C1 (one agent) and ST (12 agents with staggered entry) are the arms, and ST is the base swarm.
- Run stage C as proposed: equal spend, two volume tasks.

**New lever `clockTokens`** (default off; `src/profile.ts`, `src/swarm.ts`, in the commit that adds this note). It appends `[12.3M tokens left in the budget shared by all agents]` to every tool result ("in the budget" alone at n=1). The count is the run's `budgetTokens` minus the tokens spent so far, cache reads included: the same counter that ends the run on `budget`. It is independent of `clock`.
- New profiles: `solo-clock-tokens` (`solo-clock` + `clockTokens`) and `n12-stagger-tokens` (`n12-stagger` + `clockTokens`).
- Smokes (from `src/`, no campaign running; runs deleted):
  - trio with 3 agents on `n12-stagger-tokens`: all_done, 81k tokens, 3 `enter` events, and the line went from 1.5M to 1.4M;
  - trio with 1 agent on `solo-clock-tokens`: all_done, 23k, with "in the budget";
  - default profile on `examples/trio.json`: all_done, 124k, and no "tokens left" line.
- Typecheck and unit tests (10 of 10) pass.

**Arms to re-evaluate** (the user asked for the list). Every verdict below is either a k=2 screen, or was measured at unequal spend, or was measured with an oracle.
1. **Swarm against single agent at equal spend.** In every round 15 verdict against C1, C1 spent much less than the cap: 0.3M of 12M on planning and shop2 (it ends with `done` at ~6 of 20 minutes), and 11M of 24M on ospec. Stage C covers ospec. Planning and shop2 would need a spend-matched single-agent control. Candidates:
   - C1 with tokens left on the clock;
   - fresh-context relays (`relay`);
   - 12 isolated agents in one folder with the board off, which is also recount item 2.
2. **Round 15 stage A screens (k=2, mostly carried by shop2):**
   - BR (required branches) and ST (staggered entry) "beat C1", and ST is "pronounced better than B";
   - TL (task list) is "pronounced worse", at the threshold, and was barely used;
   - BO (optional branches) "loses";
   - RO (roles) is not pronounced.
   
   BR and ST are the ones worth confirming with more k. TL, BO and RO are low priority.
3. **Stage B screen:** ST is pronounced better than B by +0.135, inside B's own 0.19 spread. Not followed up, because B is dropped.
4. **Levers measured only with an oracle** (from `reports/2026-10-03-lever-recount.md`; staggered entry and roles have since been retested in round 15):
   - board on or off (`messaging`) at n=12;
   - delivery (`attach`, `pull`, `steer`);
   - write notices (`notices`);
   - claims with leases (`claimLease`) and `staleGuard`;
   - fresh-context relays (`relay`, `relayContext`);
   - verified findings (`finding`);
   - threads (`threads`);
   - revive without `doneGate`;
   - parallel attempts with selection by the agents' own probes;
   - section split for volume (old norms that mention hidden tests, to be rewritten).
5. **Single-agent results from round 11** that rest on one task: murmur against Pi (+0.07), and norms not decided. These are low priority for the swarm question.

## Round 15, stage C: equal spend on volume (fixed before measuring, 2026-10-04 09:27; the user approved the plan and the launch in reply to the 09:05 proposal)

**Question.** On volume tasks, does a 12-agent swarm still beat one agent once the single agent has the time to spend the same cap, and both see how many tokens are left? Stage B left this open: C1 stopped on its 30-minute clock with 13M of 24M unspent.

**Tasks** (24M cap and 3720 s per run for every arm; murmur's clock starts at 60 minutes, because the adapter keeps 2 minutes for the final check; k=2):
- ospec_green_blind, as in stage B.
- ospec_brown_blind, an OpenSpec change to an existing codebase. A single agent with the clock scored 0.47 there in round 11, with all 3 runs capped at 6M. It is added so that the volume result does not rest on one task.

**Arms:**
- **C1T** = `solo-clock-tokens`: one agent with the write guard, the clock and the tokens left.
- **STT** = `n12-stagger-tokens` at n=12: ST (12 equals with a post-only board, turn-based staggered entry, write guard, clock) plus the tokens left.

**Execution.** `experiments/criba15-lanes.mjs`, stage C, seed 20261074, in two lanes: `1 C --arms C1T` and `2 C --arms STT`. At most one 12-agent run and one single-agent run run at a time.
- STT campaigns list `[C1T, STT]` with `--limit 1`. Under this seed `plan[0]` is STT on both tasks (checked on the `plan` field of `swarmtest plan`). C1T gets its own campaigns.
- Order within each lane: repetition 0 on both tasks, then repetition 1.
- `--max-total-tokens 30000000` per campaign. The quota stop and the resume rules are as in stage A. A STOP ends both lanes, after their running campaigns.

**Rules** (per-task means over the 2 tasks, k=2; scores of capped runs count as they are; tokens and minutes are reported with every score):
- **STT against C1T:**
  - **beats C1T** if its two-task mean is ≥ +0.05 above and it is above on both tasks;
  - **loses** if it is ≤ −0.05 below and below on both tasks;
  - otherwise **not decided**.
- **Descriptive:**
  - On green, C1T against stage B's C1 and STT against stage B's ST. These compare the same task at another hour and seed, so they are descriptive only. They are reported for tokens spent, minutes, score, and (for the swarm) modules left unwired or unwritten at the end.
  - How often agents mention the tokens left or the budget in their messages.
  - The end reason per run, and tokens left at the end.
  - Wall time. If the scores tie, the swarm's speed is the result to report.
- **Predictions:**
  - C1T spends more than C1 did (over 15M on green) but still ends before the cap and gains less than 0.15 over C1's 0.447. Its pace (about 3 tasks a minute) is the limit, not its knowledge of the budget.
  - STT beats C1T on both tasks. On brown the margin is smaller, because the existing code makes coverage less of the bottleneck.
  - The tokens line makes some STT agents wire in or finish modules before the cap. STT ends with fewer unwired modules than ST's stage B runs.

**Known threats:**
- STT, C1T and the lever change together against stage B, so stage B comparisons are descriptive. The verdict compares STT with C1T only, and both arms carry the lever.
- C1T runs take up to an hour each. With k=2 on two tasks, a single run can move a task mean by 0.2.
- Two lanes put 13 agents on the machine at once (12 + 1). The ospec tests are not wall-clock bound, and load is logged.
- The round likely spans two quota windows, so resumed campaigns run hours apart.

**Budget (estimate):** STT 4 × 24M = 96M; C1T 4 × ~20M ≈ 80M (upper 96M). **Total ~176M**, upper bound ~192M, about two quota windows. Wall clock about 4 hours, set by the single-agent lane.

**Quota stop (2026-10-04 11:11).** The model quota ran out during C1T's second green run (`20261004T084418Z-f23dfd8d`, cut at 26 minutes, end `quiescent`). The driver marked it invalid and wrote `STOP`, and lane 1 exited. Lane 2 (STT) had already finished its 4 runs at 10:02. `criba15/invalid.txt` now reads:
```
20261003T202310Z-6f2a1318
20261004T084418Z-f23dfd8d
```
At the stop, 6 of 8 runs were valid. C1T's second runs on green and brown are left, and neither has a lock (the driver removed green's, and brown's was never taken). The lane resumes with `nohup node criba15-lanes.mjs 1 C --arms C1T &` once the quota is back.

### Round 15 stage C closed early, and its result (2026-10-04 12:11; the user decided in reply to the proposal made after the quota stop)

**Deviation.** After the quota stop the user judged the volume tasks saturated, and the stage was closed with C1T at k=1 per task, without its second runs (about 48M not spent). The rule needs k=2 for both arms, so it is applied below with that gap stated. The lane was not relaunched, and `STOP` stays.

6 valid campaigns (seed 20261074: `20261004T072757Z-102de6ff`, `20261004T072759Z-b3cf2574`, `20261004T073624Z-92e01575`, `20261004T074445Z-4650e8ee`, `20261004T075304Z-f4a6dd58`, `20261004T081156Z-cfaad405`), plus 1 invalid (`20261004T084418Z-f23dfd8d`, cut by the quota). **154.6M tokens** in all, 144.4M of them in valid runs. Every valid run ended on the 24M cap.

| arm | ospec_green_blind | ospec_brown_blind | two-task mean |
|---|---|---|---:|
| C1T (one agent, clock + tokens left) | 0.985 [24.1M, 43.4 min] (k=1) | 0.919 [24.2M, 31.2 min] (k=1) | 0.952 |
| STT (ST + tokens left, n=12) | 0.955 [24.0M, 7.7 min] (0.985, 0.925) | 0.963 [24.0M, 7.7 min] (0.941, 0.986) | 0.959 |

**Rule, applied with C1T at k=1:** STT − C1T = −0.030 on green and +0.044 on brown, mean +0.007. **Not decided.** The tasks are at the ceiling for both arms.

**Descriptive:**
- C1T against stage B's C1 on green (other hour and seed): 0.985 at 24.1M and 43 minutes, against 0.447 at 10.8M and 26 minutes. The invalid run was at 0.935 with 10.2M when the quota cut it at 26 minutes. It points the same way and is not counted.
- STT against stage B's ST on green: 0.955 against 0.869.
- Both predictions about C1T failed. It spent the whole cap and gained +0.54 over C1, not less than +0.15. STT did not beat C1T.
- The tokens line and the longer clock changed together, so stage C cannot tell which of them made C1T keep working.
- Wall time: STT reaches the same score about 4–6× faster.

**Findings from the transcripts** (subagent report `reports/2026-10-04-round15c-traces-analysis.md`, model output; ✓ marks claims I checked by hand):
- **No agent ever mentioned the tokens line.**
  - C1T's assistant text and thinking never mention tokens, budget, minutes left or the timeout ✓. It never called `done` ✓.
  - No STT post mentions them either ✓, and STT agents did not visibly change behaviour near the cap. In the last 90 s they still made 12–59 bash calls and 12–31 edits per run.
- **C1T kept a pace like C1's but did not stop.** At 25 minutes it had spent about 8.5M ✓, against C1's 11.0M at its `done` at 24.8 minutes. It had ticked about 120 of 167 tasks against C1's 72, and it ticked all 167 at 37 minutes. After that it audited and patched until the cap at 43 minutes. Whether the 60-minute clock or the tokens line kept it going cannot be told from these runs: no run changes only one of them.
- **Wiring:** both STT green runs had every module wired in. One still never wrote two capabilities (events, access-control). Stage B's ST runs had left 4 modules and 1 module unwired. This is 2 runs against 2.
- **Where the strong runs lose their last points:** mostly interface and command-line mismatches (argparse usage errors in three `...-command-line` checks, an unexpected keyword argument), not missing capabilities. On brown, one timesheet check failed in all 3 runs ("expected INVALID_WEEK, got INVALID_DATE"); it may be a spec ambiguity and should be read before brown is reused.
- **Friction:** no `wake` events, 3 write refusals, no bash timeouts.

## 2026-10-04 13:40: the quality-bound ospec task misses its target (no measurement)

A subagent built `ospec_green_q_blind` in `../swarmtest/staging/` (report `reports/2026-10-04-ospec-quality-task-build.md`, model output; no model calls). It keeps the scope and the agents' prompt ✓, adds 10 spec lines ✓, and puts 70% of the weight on 41 depth checks: long random walks, persistence and ledger invariants, state-machine tables, and error-precedence matrices. Each check traces to the spec. The solution scores 1.0 and the initial workspace 0.0.

**Proxy (stage B and C final workspaces regraded):**
- C1T 0.980 (old grader 0.985) and STT 0.979 and 0.858.
- ST 0.668 and 0.899; B 0.557 and 0.703; C1 0.415 and 0.397.

The 0.3–0.5 target is not reachable with checks that trace to this spec. The strong workspaces are 96–99% correct on everything the spec states, and they lose only a handful of real bugs. The task orders weak and strong arms more widely than the old grader did, but it cannot separate strong ones.

**Reading:** on spec-implementation tasks, quality is not where this model fails once it has the time. Its limit is coverage and time. To find where coordination improves quality, the next tasks should be difficulty-bound: DeepSWE, and the optimisation tasks at equal spend.

The new checks also found a real bug in the original task's `solution/`: reservations reload as R10 before R2. It is fixed in the q copy only. The old grader never reloads past nine reservations, so no past score is affected.

## 2026-10-04 13:30: DeepSWE batches, the user's decisions and the infrastructure (no measurement yet)

**Decisions (the user, after round 15 stage C):**
- Test murmur on DeepSWE (`../deep-swe`: 113 real tasks from open-source repositories, Harbor format, with hidden tests applied only when grading). This fits the realism rule.
- The design is a **batch**: one swarm gets several tasks at once and organises itself across them, against one agent with the clock on the same batch at the same cap.
- Start with 3–4 tasks per batch and look for the sweet spot.
- First check that single agents with the clock get signal.
- Giving containers more CPU is acceptable.

**Feasibility** (subagent report `reports/2026-10-04-deepswe-batch-feasibility.md`, model output; ✓ marks claims I checked):
- The task format sets only time: 5400 s for the agent and 1800 s for the verifier. There is no token cap, and the leaderboard ran mini-swe-agent with no cost limit.
- The official reward is binary, so a partial-credit scorer was added. The score is the fraction of fail-to-pass new tests that pass, times the fraction of the reference's base tests still passing. Fail-to-pass means the test fails on the untouched base and passes with the solution.
- **Oracle leak found.** Each image's `.git` holds the full upstream history, including commits after the base: anko has 1119 commits in all refs against 1105 reachable from HEAD ✓. The driver strips it.

**Driver** (`experiments/deepswe/`, built by a subagent; report `reports/2026-10-04-deepswe-driver-build.md`, model output). `src/` is unchanged.
- Layout: a hub container runs murmur, and one sidecar per task runs the task's own image with `--network none` and 2 CPUs. The repositories sit on shared volumes, and agents run commands in a task's environment with `run <task> <cmd>`.
- Arms: `swarm` (N agents, one shared cap), `solo` (one agent, same cap) and `isolated` (one single-agent run per task, cap divided by the number of tasks).
- Anti-leak:
  - Before any agent starts, every ref except the base HEAD, the remotes and the reflogs are deleted, followed by `gc --prune=now`.
  - The batch is checked and aborts if a check fails: `rev-list --all` must equal HEAD, with no unreachable objects, refs or remotes.
  - Hidden tests are copied in only at grading time.
- Validation without a model (`--dry`) on anko (Go), ts-pattern (jest) and true-myth (vitest): the untouched base scores 0.0 and the reference solution 1.0 (binary 1) on all three. The mocha parser was checked only on a synthetic snippet. Runners called through a package script are not parsed, so for those tasks only the binary reward counts.
- Model smokes (about 1.72M tokens, on anko, which has only 2 new tests):
  - `solo` scored 0.0 with 193k tokens: it looked for `goyacc`, found none, and called done with no edits;
  - `swarm` with 3 agents scored 0.0 with 1.52M tokens, ending on the cap, and broke 17 base tests;
  - agents did use `run`, and the traces are saved.
  
  anko needs generated code that the offline sidecar cannot produce, so it is not a candidate.
- Open issues: grading time is not counted in the clock; 12 agents share each sidecar's 2 CPUs under amd64 emulation; the hub holds a filtered OAuth copy, as in round 5B; murmur's `check` is `true` and its status is meaningless here.
- The Docker VM has 3.8 GB of RAM. One sidecar at a time fits, so single-task calibration can run now. Batches of 4 need about 16 GB, and the user has been asked to raise it.

## Round 16: equal caps with the tokens left on difficulty tasks, threads at n=12, and DeepSWE calibration (fixed before measuring, 2026-10-04 17:45; the user asked for it in reply to the 13:45 proposal)

**The user's requests (in reply to the DeepSWE calibration proposal):**
- Raise Docker's RAM. Done: the VM now has 16 GB, with 8 CPUs unchanged.
- The DeepSWE test is a batch, run after calibration. A task where one agent scores 0 may still give signal for a swarm.
- Run planning and shop2 with STT.
- Find out whether a threaded board helps 12 agents on complex tasks. Threads were tested only in round 10C: with an oracle, n=4 and volume, where they were refuted on cost.

### Stage A: planning and shop2, C1T against STT and STH

**Question.** On difficulty tasks, at a shared 12M cap with the tokens left visible to everyone, does STT beat C1T? And does a threaded board change the 12-agent swarm pronouncedly?

**Tasks:** constrained_planning_hard_blind and opt_shop2_blind, 12M and 1200 s per run, k=2.

**Arms:**
- **C1T** = `solo-clock-tokens` (one agent: write guard, clock, tokens left).
- **STT** = `n12-stagger-tokens` (12 equals, post-only board, staggered entry, write guard, clock, tokens left).
- **STH** = `n12-stagger-threads-tokens`: STT with a threaded board in place of `post`. Agents get `thread_new`, `thread_list`, `thread_read` and `reply`, receive only the threads they follow plus an announcement of each new one, and get a neutral one-paragraph briefing with no norms. It is a new profile.
- STH smoke at n=12 on `examples/trio.json` (3M cap; run deleted): all_done, 0.30M, 12 `enter` events and 4 write refusals. All 12 agents called `thread_list`, and nobody opened a thread on this small task. The tokens line was present.

**Execution.** `experiments/criba16-lanes.mjs 1 A`, one lane, seed 20261080. Swarm campaigns list `[C1T, arm]` with `--limit 1`, and `plan[0]` is the 12-agent arm for both arms on both tasks (checked on the `plan` field). C1T gets its own campaigns. Order: repetition 0 (planning C1T, STT, STH, then shop2), then repetition 1. Quota stop and resume as in round 15.

**Rules** (per-task means, k=2; capped scores count as they are; tokens and minutes reported):
- **STT against C1T** and **STH against C1T**:
  - beats if the two-task mean is ≥ +0.05 above and above on both tasks;
  - loses if ≤ −0.05 below and below on both tasks;
  - otherwise not decided. Tokens spent are reported with each verdict.
- **STH against STT** (the threads lever):
  - pronounced better if ≥ +0.10 above and above on both tasks;
  - pronounced worse if ≤ −0.10 below and below on both;
  - otherwise no pronounced difference.
- **Descriptive:**
  - tokens spent and the end reason per run; C1T against round 15 stage A's C1, from another hour and seed;
  - thread use: threads opened, replies, reads, and how many threads each agent follows;
  - the board's share of calls, writers per deliverable, and mentions of the tokens line.
- **Predictions:**
  - C1T still ends with `done` far below the cap on both tasks, because nobody mentioned the tokens line in round 15 stage C.
  - STT is above C1T on planning by ≥ 0.05 (ST was +0.20 over C1 there). On shop2 the result is noise, so overall it is not decided.
  - STH shows no pronounced difference against STT. Threads did not cut coordination turns in round 10C.

**Known threats:**
- Two tasks at k=2, and shop2 swings 0.00–0.76.
- planning and shop2 have wall-clock-bound solvers, so nothing else runs during this lane. Stage D waits for it.
- STH changes the board's tools and briefing together. That is the lever as a whole.

### Stage D: C1T calibration on four DeepSWE tasks

**Question.** Does one agent with the clock get signal on these DeepSWE tasks under partial credit? And how much does it spend when left to itself?

**Tasks** (all validated with `--dry`: the reference solution scores 1.0 with binary 1, the untouched base 0, and the anti-leak checks pass):
- expr-try-catch-errors (Go, 74 new tests);
- termenv-preserve-ansi-resets (Go, 35);
- cattrs-partial-structuring-recovery (Python, 63);
- fd-deterministic-multi-key-sorting (Rust, 47).

**Execution.** `sh experiments/deepswe/calib16.sh` starts after stage A's lane. It runs the driver's `isolated` arm: one C1T run per task, all four in parallel, each with 12M and 90 minutes (DeepSWE's official agent time) and its own 3 GB, 2-CPU sidecar. It does this twice (k=2). On the usage-limit error it marks the batch invalid and writes `deepswe/STOP16`.

**Rule:**
- A task goes into the first batch unless C1T's mean partial score on it is ≥ 0.85 (saturated). Tasks where C1T scores 0 stay, because a swarm may get signal where one agent does not (the user's point). If fewer than 3 tasks remain, more candidates are validated and calibrated the same way.
- The batch cap is 4M × the number of tasks, or the sum of C1T's larger spend on each retained task, whichever is greater, rounded up to the next 4M. The swarm and the single agent share it, with a 120-minute clock.
- The batch round itself (stage E) is pre-registered after stage D.

**Budget (estimate):**
- Stage A: C1T 4 × ~3M (upper 48M), STT 4 × ~9M, STH 4 × ~10M. About 88M, upper 144M.
- Stage D: 8 runs × up to 12M. About 40M, upper 96M.
- **Total ~128M**, upper ~240M, about two quota windows.

### Round 16 stage A result and rules applied (2026-10-04 19:40; lane 17:44–19:23, code `b438df5`)

12 valid campaigns (seed 20261080, `20261004T154422Z-5d32faf7` → `20261004T171634Z-37116428`), 12 runs, **72.7M tokens** (estimate ~88M). Every campaign exited 0, with no quota stop. Load was 4–5.

Mean score [mean tokens] (runs, end), k=2:

| arm | planning | shop2 | two-task mean | tokens per run |
|---|---|---|---:|---:|
| C1T (one agent, clock + tokens left) | 0.492 [0.93M] (0.334, 0.650; done, done) | 0.556 [0.07M] (0.565, 0.547; done, done) | 0.524 | 0.50M |
| STT (12 agents, staggered entry, post board, tokens left) | 0.455 [11.74M] (0.479 cap, 0.430 done) | 0.636 [5.13M] (0.639, 0.633; done) | 0.545 | 8.4M |
| STH (STT with a threaded board) | 0.476 [8.78M] (0.354 done, 0.598 cap) | 0.464 [9.71M] (0.451, 0.477; done) | 0.470 | 9.2M |

**Rules, applied as written:**
- **STT against C1T: not decided.** −0.038 on planning, +0.080 on shop2, mean +0.021, at 17× C1T's tokens.
- **STH against C1T: loses.** −0.016 on planning, −0.092 on shop2, mean −0.054 (below on both tasks), at 18× C1T's tokens.
- **STH against STT: no pronounced difference.** +0.021 on planning, −0.172 on shop2, mean −0.076.

**Predictions:**
- C1T ended with `done` far below the cap, as predicted: 0.06–1.23M of 12M.
- STT was not above C1T on planning, so that prediction failed: C1T's 0.650 is the best planning run of the stage.
- STT against C1T is not decided overall, and STH is not pronounced against STT, both as predicted.

**Descriptive:**
- C1T against round 15 stage A's C1 (another hour and seed): planning 0.492 against 0.275, shop2 0.556 against 0.412, with similar spend (0.5M against 0.3M per run). The tokens line did not make C1T spend more, so the gap is more likely noise in C1's runs than an effect of the line.
- On these difficulty tasks a 12-agent swarm does not beat one agent left to its own spend, with or without threads.

**Findings from the transcripts** ([report](reports/2026-10-04-round16a-traces-analysis.md), model output; the spend part of claim 1 and claims 4, 5, 8 and 10 checked by hand, the version replay behind claims 1–2 not re-run):
- From the report's version replay: a near-final deliverable existed within 1–2 minutes in 3 of 7 evaluable swarm runs, and the graded file was the best version produced in all 7. Later work bought little and did not degrade it.
- The 17× spend is 17× the calls (566 against 35 in planning STT rep 0), mostly 8–9 reviewers re-reading the file one of 3–7 writers owns. Reviewers named the weakness the grader measures and left the fix to the owner.
- Validation used only the 16-session example; points are lost on hard constraints of the 36–80-session hidden instances. Scores follow the first full solver's algorithm family, not the arm.
- Threads: one thread opened in the first minute takes most posts (two busy threads in one run); board share 46% against 29%, posts not fewer, more whole-file rewrites (10 against 6).
- In 6 of 8 swarm runs most agents called `done` before the last edit of the deliverable. No agent mentioned the tokens line or the clock.
- shop2's one swarm quality gain was a portfolio kept "only if lower" (0.42 → 0.63 in STT rep 1).
- Hypotheses proposed in the report (not pre-registered): diverge first with private full attempts and merge by measured cost; n=4 instead of 12 as a cost lever; a neutral line that real inputs are larger than the examples; `staleGuard` plus a `done` refusal when read files changed; a challenger norm.

### Round 16 stage D result: DeepSWE C1T calibration (2026-10-04 20:19, rule applied 20:52; batches 19:23–20:17, code `4833873`)

C1T (one agent with the clock and the tokens left), `isolated` arm: the four tasks in parallel, one agent each, 48M shared cap, 90 minutes. Scores are partial credit (new tests' pass fraction × base tests' pass fraction); "binary" is the official all-pass reward.

| task | r0 score (binary, tokens, minutes) | r1 score (binary, tokens, minutes) | mean |
|---|---|---|---|
| expr-try-catch-errors | 0.999 (1, 8.54M, 34.2) | 0.342 (0, 1.05M, 6.3) | 0.671 |
| termenv-preserve-ansi-resets | 1.000 (1, 0.36M, 4.5) | 1.000 (1, 1.01M, 7.9) | 1.000 |
| cattrs-partial-structuring-recovery | 0.957 (0, 1.76M, 9.4) | 0.986 (0, 2.97M, 15.2) | 0.972 |
| fd-deterministic-multi-key-sorting | 0.977 (0, 1.86M, 10.6, quiescent) | 1.000 after rescore (1, 2.12M, 17.4); first score invalid | 0.989 |

- Batch totals: r0 12.5M in 34.4 minutes, r1 7.1M in 17.6 minutes. Every agent ended by itself (`all_done`, one `quiescent`), far below the cap and the clock.
- **Infrastructure failure, fd r1:** the scorer's `cargo test` could not resolve `static.crates.io` while fetching `getrandom 0.4.2` (exit 101, no tests parsed, base and new alike). The agent's diff touches no Cargo file, so the 0 is not the agent's. The saved diff must be rescored before fd's mean exists, and the scorer should not depend on the network.
- **Rescore (2026-10-04 20:52, [report](reports/2026-10-04-deepswe-scorer-offline-fix.md)):** the cause was cargo's cache garbage collection, not the network. Cargo 1.92 deletes cached crates it considers unused for a month, and the image's crates count as old. r1's agent ran `cargo check` first, which kept only the non-dev crates and deleted the dev-dependencies, so every later `cargo test` (the agent's and the scorer's) tried to download them and failed offline. r0's agent ran `cargo test` first and was not hit. The driver now sets `CARGO_CACHE_AUTO_CLEAN_FREQUENCY=never` in every sidecar. The saved r1 diff rescores to 1.000 (binary 1, 44/44 new and 106/106 base tests); as a control, r0's diff rescores to its original 0.977. r1's agent could not run the tests during its run, so its process is not comparable with r0's.
- **Rule as written:** termenv (1.000), cattrs (0.972) and fd (0.989) are excluded (C1T mean ≥ 0.85). Only expr stays (0.671). Batch cap: max(4M × 1, 8.54M) → 12M, with a 120-minute clock.
- **Consequence:** a batch of one task is not a batch. Three of the four candidates are near the ceiling for C1T under partial credit, so stage E needs new candidate tasks, either calibrated on the binary reward or chosen to be harder.
- Partial credit puts C1T near the ceiling on three of four tasks even when the official binary reward is 0 (cattrs both runs, fd r0). The swarm's room on these tasks is in the binary reward, not in the partial score.

### Side test U: one agent told its time and tokens are unlimited (fixed before measuring, 2026-10-04 20:19; the user asked for it)

**The user's request:** C1T with the clock always saying "unlimited" for time and tokens, to see whether one agent behaves better than the plain version. It is a single-agent question, not about the swarm.

**Lever.** New lever `clockUnlimited` (default off). With `clock` and `clockTokens` it appends `[time left: unlimited]` and `[tokens left: unlimited]` to every tool result in place of the real amounts. The real cap and timeout still apply. Nothing else shows the agent the real limits: a solo agent gets only the `done` board tool, so `budget()` and its "minutes before timeout" text are unreachable. Smoke on `examples/hello.json` at n=1 from a copy of `src/` (run deleted): both lines on every tool result, all_done.

**Arms** (all one agent, write guard, no board):
- **C1T** = `solo-clock-tokens` (the real minutes and tokens left after each tool call).
- **CU** = `solo-clock-unlimited`, new: C1T with both lines saying "unlimited".
- **C0** = `solo` (no clock line at all). It answers the other reading of "the basic one" and separates "told it is unlimited" from "told nothing".

**Task:** opt_shop2_blind (job shop, an optimisation task where more work can lower the cost). In stage A, C1T ended by itself after ~100 s with 60–70k of 12M tokens and scored 0.565 and 0.547, so it has room to do more.

**Execution.** `experiments/criba16-lanes.mjs <lane> U`, seed 20261090, k=2, each arm alone in its own campaign (no `--limit`, no make_plan pairing). Cap 24M and 3720 s per run (C1T's clock starts at 60 minutes), the same for every arm. This is generous so that the "unlimited" claim is not contradicted by a cutoff at a plausible spend. A run that times out is graded on what it left. Three lanes at once, so the three arms' repetition 0 run in the same window, then repetition 1. Nothing else runs alongside: shop2's grader is wall-clock bound.

**Rules** (per-arm mean over k=2 on shop2; one task, so this is a screen, not a decision):
- **CU against C1T**, **C0 against C1T** and **CU against C0**: better if the mean is ≥ +0.10 above and its lower run is above the other arm's higher run; worse if the mean is ≤ −0.10 below and its higher run is below the other arm's lower run; otherwise no difference.
- **Descriptive:** tokens, minutes and end reason per run; tool calls, and runs of the agent's own tests or solver; whether the agent mentions the time or tokens line.
- **Predictions:** CU spends more than C1T (median tokens at least ×2) but its score is not different. C0 behaves like C1T, because C1T never reached its limits.

**Known threats:** one task at k=2, and shop2 has swung 0.00–0.76 across arms. The "unlimited" line is untrue while a hard timeout exists. That is the lever as asked, and the generous cap keeps it from biting at the spends seen so far.

### Side test U result (2026-10-04 20:27; lanes 20:20–20:23, code `e5f402f`)

| arm | r0 score (tokens, seconds) | r1 score (tokens, seconds) | mean |
|---|---|---|---|
| C1T (real minutes and tokens left) | 0.000 (76k, 115) | 0.000 (61k, 130) | 0.000 |
| CU (both lines say "unlimited") | 0.000 (39k, 35) | 0.000 (42k, 51) | 0.000 |
| C0 (no clock line) | 0.000 (41k, 42) | 0.261 (35k, 34) | 0.130 |

**Rules as written:**
- CU against C1T: no difference (0.000 against 0.000).
- C0 against C1T: no difference. The mean is +0.130, but C0's lower run (0.000) is not above C1T's higher run (0.000).
- CU against C0: no difference.

**Checks:**
- The zeros are real, not a grading fault. Each zero is a solver whose cost is worse than the grader's naive baseline on all four hidden instances (the baseline is in the hidden grader; the blind PROBLEM.md does not describe one), which scores 0 by the grader's formula. Two C1T solutions were regraded on a quiet machine with the same result (C1T r0 costs 23603/48965/79686/98401 against naive 21108/41974/61528/74963).
- C1T scored 0.565 and 0.547 in stage A, three hours earlier, with the same arm, cap and behaviour (~100 s, 60–70k tokens). One agent's shop2 score is bimodal: the quick heuristic it writes either beats the naive baseline or does not.

**Descriptive (from the six transcripts):**
- Every agent wrote a short solver (40–136 lines) and called `done` within 35–130 s, using 8–13 tool calls and 1–3 runs of its own solver. Every agent stopped far below the cap and the clock.
- No agent mentioned the clock or tokens line, "unlimited" included.
- CU spent less than C1T, not more: 39–42k tokens and 35–51 s, against 61–76k and 115–130 s. CU and C0 behave alike. Seeing a real countdown went with somewhat longer work, but at k=2 that is a hint, not a finding.
- Predictions: "CU spends at least ×2 C1T" is refuted (×0.6). "C0 behaves like C1T" is half right: same stopping, about half the time.

**Finding.** On shop2, telling one agent that time and tokens are unlimited does not make it work longer or better. The agent stops when it judges the deliverable finished, a minute or two in, whatever the line says. What limits one agent here is its stopping judgement, not the budget it sees.

## 2026-10-04 20:45: candidate tests from the literature review (not pre-registered)

The user asked to add these to the list of tests to run. They come from [`reports/2026-10-04-swarm-literature.md`](reports/2026-10-04-swarm-literature.md) (synthesis of eight subagent reviews). Each is oracle-free and non-hierarchical, needs a new profile and in most cases a new default-off lever, and is compared at matched total tokens with C1T (one agent with the clock and tokens left) plus a single-agent control that removes "more total work". None is pre-registered yet; each needs its own pre-registration (tasks, k, budget, rule) before it runs.

1. **H4, runway diagnostic for the tokens-left line (single agent, cheap).** On ospec_green and ospec_brown, where C1T spends the whole cap and its context grows long: C1T against C1 with a 60-minute clock and no tokens line, and against C1T showing an inflated nominal budget. It separates time pressure from runway, and checks for "context anxiety" (Cognition: a model that sees little room left takes shortcuts). It tests the control every swarm comparison uses. Not on planning or shop2, where C1T stops at 0.06–1.23M of 12M within minutes.
2. **H1, execution-quorum finish with a fresh-context auditor.** A `done` is provisional. A staggered later entrant, with no access to earlier transcripts, reads the folder cold, runs the program, writes and runs its own probes, and posts a gap list with raw output. The swarm ends only after a done claim survives an audit with no changes since. Agreement posts do not count. Controls: C1T and **C1T + `relay`** (a fresh instance of the same single agent takes over after done). If H1 beats C1T but ties C1T + relay, the gain is fresh context, not the swarm. About 1.3–2× C1T per audit cycle.
3. **H2, independence first, then one structured exchange.** n=2–4 agents on private branches. Each lists several distinct approaches before coding and posts one line naming its pick; later entrants pick an untaken one or justify the duplicate. No board during work. At a clock mark murmur posts a digest of each branch, one revision round follows, then selection by pairwise comparison of short summaries (tournament). On optimisation tasks, agents also write instance generators and feasibility checkers, and every solver runs on every instance. Log C1T, the mean attempt and the best attempt by hidden grade, to see whether the loss is in coverage or in selection. Close to c5, which won only with a predictive printed score; the new parts are seeded diversity and an oracle-free selector. About n× C1T.
4. **H3, a curated shared file instead of the chat board.** No `post`. One agent-curated file with a line budget, injected into every agent at entry (Cursor's "Field Guide"), holding the requirement ledger (unbuilt items, wiring points) and reproducible facts (a command plus its output). Control: C1T + the same file. Close to `findings`, which was barely used; the difference is injection rather than an opt-in tool. Cheaper than the board arms.
   - **H3b, a board tail on every tool result (the user asked to add it).** Like the clock line: every tool result ends with a short fixed-size view of the shared state (the last 2–3 posts, or who works on what), not only the unread posts once, as `delivery: "attach"` does now. Same idea as H3 but refreshed on every call instead of injected at entry. Compare against the same swarm with plain `attach`. `attach` itself has never been compared with `steer` without an oracle.
5. **H5, report by task type.** Classify every task as unitary/sequential (planning, shop2: the single agent should win) or decomposable/large (ospec), and state swarm claims per type.

Suggested order: H4, then H1, then H2 and H3 on decomposable tasks.

## Round 17: a fresh-context audit before the run ends (fixed before measuring, 2026-10-04 23:08; the user approved the proposal made after the round 16 record with "adelante con todo")

**Why.** Round 16 and side test U point the same way. One agent stops when it judges itself finished, within minutes and far below its budget, whatever its clock line says. In the swarm most agents call `done` on an older version, and nobody tests beyond the example. H1 of the literature list targets this: a later agent with no access to earlier transcripts audits the work cold before the run ends. Its key control is the same single agent with relays, because a fresh context alone might explain any gain.

**Question.** Does a fresh-context audit raise quality over C1T? And does coordination, meaning a board that lets auditors reach a still-live author, add anything over fresh context alone?

**Arms:**
- **C1T** = `solo-clock-tokens` (one agent: write guard, clock, tokens left).
- **C1TR** = `solo-clock-tokens-relay2`, new: C1T with `relay: 2`. After each `done`, a fresh instance takes the seat (empty context), up to 2 times. The existing relay prompt tells it not to assume the goal is met, to check the work against the spec itself, to fix what is wrong, and to call `done` only after verifying.
- **AUD** = `n3-audit-tokens`, new: 3 equals with a post-only board, posts attached to tool results, the write guard, the clock and the tokens line. Entry uses the new lever `enterOnDone`: each agent enters when the previous one ends its turn, and seats not yet entered keep the run going. `revive: 3` lets a post wake an agent that already called `done`. Everyone gets the same neutral briefing: "If you join after a teammate has finished, do not assume the goal is met: read the folder as it is, run the program, write and run your own tests against the spec, then fix what is wrong or missing yourself, or post what you found with the command output so whoever knows the code best can fix it." Nobody is assigned a role.
- C1TR and AUD are both three fresh contexts in sequence with the same audit instruction. The difference is that AUD's earlier agents stay reachable through the board and can be woken to fix their own code.

**Smoke tests** (from a copy of `src/`, runs deleted): `examples/hello.json` with AUD at n=3 entered wren, then finch after wren's `done`, then robin after finch's, and ended all_done with no early quiescent end. C1TR relayed twice (`wren.1`, `wren.2`). A scripted two-agent task forced a post after the first agent's `done`: the post revived it, it made the change, and the run ended all_done. The default profile on `examples/hello.json` passed.

**Tasks:** constrained_planning_hard_blind and opt_shop2_blind, 12M and 3720 s per run (C1T's clock starts at 60 minutes, so the three sequential contexts have room), k=3.

**Execution.** `experiments/criba17-lanes.mjs <lane> A`, three lanes, seed 20261101. Non-solo campaigns list `[C1T, arm]` with `--limit 1`, and `plan[0]` is the arm for both arms on both tasks under this seed (checked on the `plan` field; seed 20261100 put C1T first and was dropped). Repetition 0 of every arm runs before repetition 1. Quota stop and resume as before.

**Rules** (per-task means over k=3; capped scores count as they are):
- **C1TR against C1T** and **AUD against C1T**:
  - beats if the two-task mean is ≥ +0.05 above and above on both tasks;
  - loses if ≤ −0.05 below and below on both tasks;
  - otherwise not decided.
- **AUD against C1TR** (coordination over fresh context): better if ≥ +0.05 above and above on both tasks; worse if ≤ −0.05 below and below on both; otherwise not decided.
- **Descriptive:**
  - tokens, minutes and end reason per run; relays used and agents entered;
  - posts and revivals in AUD;
  - whether a later context changed the deliverable, and whether any context tested on inputs larger than the example (the contracts state the real sizes: planning 15–90 sessions; shop2 states its production sizes);
  - a quiet regrade of every final workspace after all lanes and the DeepSWE screen have finished, reported beside the swarmtest grade.
- **Predictions:**
  - C1TR is above C1T by a small margin (+0.03 to +0.08, likely not decided), because a fresh instance re-checks but writes the same kind of solver.
  - AUD against C1TR is not decided: coordination adds little over fresh context.
  - Spend: C1TR 2–3× C1T, AUD 3–5×.

**Known threats:**
- Two tasks at k=3. One agent's shop2 score is bimodal (0.55 in round 16 stage A, 0 in side test U).
- The DeepSWE screen (stage S below) runs in Docker at the same time, and both graders run time-bounded solvers. Hence the quiet regrade.
- AUD differs from C1TR in several ways at once: the board, revival, three named agents instead of one seat, and the briefing wording. That is the arm as a whole. The audit instruction itself is matched in content.

### Stage S: screening 12 new DeepSWE candidates (fixed before measuring, 2026-10-04 23:55)

Round 16 stage D left only expr below 0.85. A subagent chose 12 candidates with larger reference patches than the calibration tasks and validated them with the driver's dry mode ([report](reports/2026-10-04-deepswe-candidates.md), model output). The test counts in `refs/*.json` were checked by hand against its table; the dry runs were not re-run.

**Candidates** (language; fail-to-pass / base tests):
- **Batch 1:** oxvg-structural-selector-preservation (Rust; 6/58), etree-xml-diff-patch (Go; 52/15), tengo-destructuring-bindings (Go; 91/123), returns-validated-error-accumulation (Python; 159/61).
- **Batch 2:** scc-bounded-memory-spilling (Go; 31/283), go-git-worktree-merge-conflicts (Go; 17/2), dasel-html-document-format (Go; 146/1012), wasmi-trap-coredumps (Rust; 22/58).
- **Batch 3:** ytt-jsonpath-query-api (Go; 103/1), scriggo-method-declarations (Go; 48/1045), participle-grammar-conflict-analysis (Go; 89/152), fastapi-implicit-head-options (Python; 43/3131).
- Dropped in the dry runs: dateutil (the reference's binary reward is 0), narwhals (pytest segfaults under amd64 emulation), valibot and happy-dom (vitest output not parsed).

**Execution.** `experiments/deepswe/screen17.sh`: C1T (`profiles/solo-clock-tokens.json`), `isolated` arm, the three batches one after another, each with its four tasks in parallel, 48M shared and 90 minutes. Sidecar memory goes from 3 GB to 6 GB, because scc reached 2.99 GB in its reference run alone. It runs alongside round 17's lanes. Quota stop as in stage D.

**Rule** (k=1, a screen): a task goes to stage E if its partial-credit score is < 0.85. A task whose scoring fails for infrastructure reasons (no tests parsed in both modes, a killed sidecar, an image failure) is invalid, not scored, and is rerun once in a make-up batch. Reported: score, binary reward, tokens, minutes and end reason per task.

**Prediction:** about half the candidates score < 0.85, giving 5–7 tasks plus expr for stage E. Stage E (the batch, swarm against solo) gets its own pre-registration after the screen.

**Estimate:** 7–12M per batch, so about 20–36M.

### Round 17 result and rules applied (2026-10-05 00:16; lanes 23:08–00:15, code `73ff3e7`; quiet regrade 01:40)

| arm | planning (runs) | shop2 (runs) | two-task mean | tokens per run (planning, shop2) |
|---|---|---|---:|---|
| C1T, one agent | 0.475 (0.574, 0.354, 0.498) | 0.000 (0, 0, 0) | 0.238 | 1.07M, 0.18M |
| C1TR, C1T + 2 relays | 0.424 (0.416, 0.483, 0.372) | 0.202 (0.114, 0, 0.491) | 0.313 | 1.07M, 0.26M |
| AUD, 3 agents entering on finish, board, revival | 0.499 (0.571, 0.442, 0.483) | 0.197 (0, 0.592, 0) | 0.348 | 4.50M, 1.96M |

18 valid campaigns, 27.1M tokens, none capped, no quota stop.

**Rules as written:**
- **C1TR against C1T: not decided.** The mean is +0.075, but C1TR is below on planning (−0.051) and above on shop2 (+0.202).
- **AUD against C1T: beats.** The mean is +0.110, and AUD is above on both tasks (+0.024 on planning, +0.197 on shop2), at about 6× the tokens.
- **AUD against C1TR: not decided.** The mean is +0.035; AUD is above on planning (+0.075) and level on shop2 (−0.005).

**Caveats:**
- The "beats" verdict rests on shop2, where C1T scored 0 in all three runs, as in side test U. Its planning margin (+0.024) is small.
- AUD's shop2 mean comes from one run (0.592), with two zeros.
- **Quiet regrade** (2026-10-05, after the DeepSWE screen, with no runs live): all 18 final workspaces were regraded with each task's grader. No run moved by more than 0.02, and the arm means are unchanged (AUD 0.349, C1TR 0.313, C1T 0.237). The load from the concurrent screen did not change the grades.

**Descriptive:**
- Every AUD run entered all 3 agents and used revivals (2–9 per run, 5–28 posts).
- C1TR used both relays in 5 of 6 runs. In one planning run the second instance ended without `done` (quiescent).
- Predictions: C1TR not decided against C1T, as predicted, but with the margin on shop2 rather than planning. AUD against C1TR not decided, as predicted. Spend: C1TR was 1.0–1.4× C1T (predicted 2–3×) and AUD 4–11× (predicted 3–5×).

**Findings from the transcripts** ([report](reports/2026-10-05-round17-traces-analysis.md), model output; post and revival counts, relay edits, the quiescent run and the NOTES reads checked by hand; the version replay not re-run):
- **Later contexts changed little.** From the replay: relays changed the graded final in 1 of 6 runs (+0.037 on planning, 0 on shop2). Audits raised the author's state at its first `done` by +0.047 on average (+0.112, +0.005, +0.023). Both effects are smaller than the spread between runs of one arm.
- **The shop2 margins come from the first draft.** C1TR's 0.491 run reached it within its first instance (checked: the relays made 0 edits). AUD's 0.592 run had 0.503 at 0.8 minutes. A finding from one auditor's private experiments, integrated by the woken author, added about +0.07, and the author's own tuning added +0.08. It is the one case of a woken author using an auditor's finding.
- **Relays checked validity and timing only.** 5 of 11 relay instances made no edit, and none built an input larger than the example. Two relays quoted a cost of 7.5× the naive level on the large example and still called it verified.
- **Testing at the stated production size happened in 1 of 18 runs** (an AUD auditor, 90 sessions). It found a 56.6 s overrun, and the fix was grade-neutral.
- **AUD's spend is mostly revived turns** (53–87% of its tokens; 13 of 35 revival turns made no edit). Auditors edited the code themselves more than they asked the author (30–85% of deliverable edits in 5 of 6 runs). Two runs ended when every agent had used its 3 revivals, with the last edits unreviewed.
- **Relay mechanics:** relays fire only on `done`, so a second instance that ended its turn in text closed the run with 51 minutes and 11.5M tokens left. The handoff is only the previous `done` reason: `NOTES-wren.md` never existed, and relays tried to read it 11 times.
- **shop2 zeros:** all are valid schedules at or above the grader's naive cost (Giffler–Thompson with a weighted-shortest-processing-time rule, hidden). The provided `instance_large.json` ranks all nine runs' final programs in the same order as the hidden grade.
- No agent mentioned the clock or the tokens line.
- **Hypotheses in the report** (not pre-registered):
  - a cost-reference norm: build a second, different simple method and keep the cheaper;
  - a same-context audit, a single steer at the first `done` with no fresh instance;
  - a production-size self-test norm;
  - parallel private first drafts selected by cost on the provided large instance;
  - AUD with `revive: 1`.
  The subagent flags the cost-reference and production-size norms as close to the no-grading-hints rule. They need care: they may refer only to what the contract states.

### Round 17 stage S result: DeepSWE screen (2026-10-05 01:33; batches 23:55–01:31, code `497b6d9`)

C1T, one run per task, `isolated` arm, three batches of four, 48M shared and 90 minutes per batch, 6 GB per sidecar. 46.1M tokens in total (13.0M, 18.9M and 14.2M), above the 20–36M estimate. No infrastructure failure: every task parsed its tests in both modes.

| task | score | binary | new / base fraction | tokens | minutes | end | stage E |
|---|---:|---:|---|---:|---:|---|---|
| oxvg-structural-selector-preservation (Rust) | 0.000 | 0 | 0.000 / 1.000 | 7.02M | 35.7 | all_done | **kept** |
| scriggo-method-declarations (Go) | 0.000 | 0 | 0.000 / 0.993 | 0.63M | 4.9 | quiescent | **kept** |
| tengo-destructuring-bindings (Go) | 0.440 | 0 | 0.440 / 1.000 | 1.46M | 7.6 | all_done | **kept** |
| wasmi-trap-coredumps (Rust) | 0.636 | 0 | 0.636 / 1.000 | 12.13M | 27.7 | all_done | **kept** |
| scc-bounded-memory-spilling (Go) | 0.903 | 0 | 0.903 / 1.000 | 1.11M | 9.0 | all_done | out |
| participle-grammar-conflict-analysis (Go) | 0.955 | 0 | 0.955 / 1.000 | 0.54M | 8.3 | all_done | out |
| dasel-html-document-format (Go) | 0.973 | 0 | 0.973 / 1.000 | 1.59M | 9.5 | all_done | out |
| fastapi-implicit-head-options (Python) | 0.977 | 0 | 0.977 / 1.000 | 9.22M | 23.1 | all_done | out |
| returns-validated-error-accumulation (Python) | 0.981 | 1 | 0.981 / 1.000 | 2.66M | 11.2 | all_done | out |
| etree-xml-diff-patch (Go) | 1.000 | 1 | 1.000 / 1.000 | 1.82M | 11.2 | all_done | out |
| go-git-worktree-merge-conflicts (Go) | 1.000 | 1 | 1.000 / 1.000 | 4.05M | 15.4 | all_done | out |
| ytt-jsonpath-query-api (Go) | 1.000 | 1 | 1.000 / 1.000 | 3.78M | 15.0 | all_done | out |

- **Rule as written:** 4 of 12 score below 0.85: oxvg, scriggo, tengo and wasmi. With expr from round 16 stage D (0.671), stage E has 5 tasks.
- **The two zeros are real:** the tests ran and failed on assertions. In oxvg, all 6 fail-to-pass tests panic. In scriggo, 50 of the new tests fail, and its agent stopped on its own after 4.9 minutes with a 4.8 KB diff.
- **Prediction** ("about half below 0.85"): one third did. Patch size predicted difficulty poorly, as the candidate report warned.
- The binary reward is 1 on 4 of 12 tasks. Partial credit again puts C1T near the ceiling on most tasks it does not fully solve.

### Stage E: the DeepSWE batch, 12 agents against one (fixed before measuring, 2026-10-05 01:47; part of the "adelante con todo" approval: screen first, then the batch)

**Question.** On a batch of real repository tasks where one agent stays below the ceiling, does a 12-agent swarm sharing the batch's budget beat one agent with the same budget and clock?

**Tasks** (C1T's partial score in stage D or S): expr-try-catch-errors (Go, 0.671), oxvg-structural-selector-preservation (Rust, 0.000), scriggo-method-declarations (Go, 0.000), tengo-destructuring-bindings (Go, 0.440), wasmi-trap-coredumps (Rust, 0.636).

**Arms:**
- **STT** = `n12-stagger-tokens` (12 equals, post-only board, staggered entry, write guard, clock, tokens left), driver arm `swarm`. All five repositories are in one shared `/work`, and `run <task> <cmd>` runs commands in each task's sidecar.
- **C1T** = `solo-clock-tokens` (one agent, write guard, clock, tokens left), driver arm `solo`: the same five repositories and tools.

**Budget (stage D rule):** max(4M × 5, the sum of C1T's larger spend per task: 8.54 + 7.02 + 0.63 + 1.46 + 12.13 = 29.8M), rounded up to the next 4M, gives **32M per batch, shared**, with a **120-minute** clock, for both arms.

**Execution.** `experiments/deepswe/batch17.sh`, k=2. Both arms of a repetition run at the same time (paired load), repetition 0 before repetition 1. Sidecars get 5 GB and 2 CPUs each; the Docker VM has 16 GB and 8 CPUs. Quota stop as before. Scoring uses partial credit (new tests' pass fraction × base tests' pass fraction) and the binary reward, from the saved diff of each repository.

**Rule** (per-task means over k=2, then the mean over the five tasks):
- STT **beats** C1T if the five-task mean is ≥ +0.05 above and STT is above on at least 3 of 5 tasks;
- **loses** if ≤ −0.05 below and below on at least 3 of 5;
- otherwise **not decided**.

**Descriptive:**
- binary rewards per arm; tokens, minutes and end reason per batch;
- how the swarm spread over the tasks (agents and writes per repository);
- per-task scores against C1T's isolated runs in stages D and S (one agent per task, a separate budget each), as a reference.

**Predictions:**
- C1T alone runs out of the 120 minutes before finishing all five, because its isolated runs took 5–36 minutes each (about 100 in sequence). It scores below its isolated runs on the last tasks it reaches.
- STT covers all five and beats C1T (the batch is volume-like across tasks).
- Neither arm gets binary 1 on oxvg or scriggo.

**Estimate:** up to 32M per batch, 4 batches, so ≤128M (likely 60–100M).

**Known threats:**
- k=2, five tasks, one hub per arm. Twelve agents in one hub container are untested at this size (the swarm smoke used n=3).
- Running both arms at once shares 8 Docker CPUs between up to 10 sidecars, which slows builds (oxvg compiles in ~100 s) for both arms alike.
- C1T's numbers from stages D and S come from a separate budget per task, so they are a reference, not a control.

### Round 17 stage E result and rule applied (2026-10-05 02:38; batches 01:47–02:37, code `37213a7`)

| task | STT r0 | STT r1 | STT mean | C1T r0 | C1T r1 | C1T mean | C1T isolated (stages D/S, reference) |
|---|---:|---:|---:|---:|---:|---:|---:|
| expr | 0.000 | 0.671 | 0.335 | 0.063 | 0.063 | 0.063 | 0.671 |
| oxvg | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| scriggo | 0.745 | 0.000 | 0.372 | 0.000 | 0.000 | 0.000 | 0.000 |
| tengo | 0.945 | 0.857 | 0.901 | 0.011 | 0.044 | 0.027 | 0.440 |
| wasmi | 0.364 | 0.500 | 0.432 | 0.136 | 0.136 | 0.136 | 0.636 |
| **five-task mean** | 0.411 | 0.406 | **0.408** | 0.042 | 0.049 | **0.045** | 0.349 |

- **Spend:** STT hit the 32M cap after 13.9 and 12.2 minutes. C1T called `done` after 19.3 and 13.6 minutes, having spent 3.1M each time. In total 70.3M tokens, and no quota stop.
- **Rule as written: STT beats C1T.** The five-task mean is +0.363, and STT is above on 4 of 5 tasks (oxvg tied at 0). No binary reward of 1 in any batch.
- **But the margin is mostly C1T giving up.** In both repetitions C1T made small diffs on 3–4 tasks (0.5–3.3 KB) and called `done` saying the goal was not met: "The requested full feature sets ... remain unimplemented, so the overall goal is not fully met". It left about 100 minutes and 29M tokens unused. Given the same tasks one at a time (stages D and S, a separate budget each), the same agent scored 0.349 on these five with about 26M in total.
- **STT against that isolated reference** (descriptive, not a control): 0.408 against 0.349 at similar total spend (32M against ~26M). It is above on scriggo and tengo and below on expr and wasmi.
- **Nobody touched oxvg in any batch** (0 bytes of diff; 29–38 bash calls in the swarm, 10–12 by C1T). The swarm's expr rep 0 is 0 because the cap stopped it with the base tests broken (base fraction 0.013).
- **Predictions:**
  - "C1T runs out of the 120 minutes" is refuted: it stopped by itself within 20 minutes.
  - "STT covers all five" is half right: four of five, never oxvg.
  - "No binary 1 on oxvg or scriggo" holds, and there is none anywhere.
- **Coordination summary:** [`deepswe/traces17.md`](deepswe/traces17.md). The swarm made 949–1031 tool calls and 141–182 posts, with all 12 agents active.

## Round 18: the DeepSWE batch on ten tasks, the clock deciding, and a single agent told not to stop (fixed before measuring, 2026-10-05 08:03; the user's design)

**The user's requests, in reply to the round 17 proposal:**
- Run the batch again, without the tokens line, which did nothing.
- Raise whatever stopped the swarm. It was the token cap (32M in 12–14 of 120 minutes), so the cap goes; the user chose no practical cap, so the 120-minute clock decides.
- Only ST and a single agent.
- Give the single agent an instruction that insists it must not stop, and only to it.
- Use many more tasks at once: 10.
- Docker raised to 24 GB and 10 CPUs (from 16 GB and 8).

**Question.** On a batch of ten real repository tasks with the clock as the only limit, does a 12-agent swarm beat one agent that is told to keep working until everything is done?

**Arms:**
- **ST** = `n12-stagger` (12 equals, post-only board, staggered entry, write guard, clock; no tokens line), driver arm `swarm`.
- **C1P** = `solo-clock-persist`, new: `solo-clock` (one agent, write guard, clock) plus a system-prompt addition: "Keep working until every requested change is implemented and verified. Do not settle for a partial implementation, and do not stop because the work is large. Before you call done, re-read every task and check each requirement with your own tests; if anything is missing or failing, keep going." The instruction is generic: it names no test, grader or score. Smoke on `examples/hello.json` (run deleted): the text is in the system prompt, and the run ended all_done.

**Tasks** (C1T's isolated partial score in round 16 D or round 17 S):
- The five from round 17 E: expr (0.671), oxvg (0.000), scriggo (0.000), tengo (0.440), wasmi (0.636).
- Five more where the isolated agent never got the binary reward: scc (0.903), participle (0.955), dasel (0.973), fastapi (0.977), cattrs (0.972).
- All ten have validated refs.

**Execution.** `experiments/deepswe/batch18.sh`: 120 minutes and a 400M token cap per batch (set so high that the clock decides), 5 GB and 2 CPUs per sidecar, k=2. Both arms of a repetition run at the same time (20 sidecars). Repetition 0 runs first. On the usage-limit error the batch is invalid and the script stops.

**Rule** (per-task means over k=2, then the mean over the ten tasks):
- ST **beats** C1P if the ten-task mean is ≥ +0.05 above and ST is above on at least 6 of 10 tasks;
- **loses** if ≤ −0.05 below and below on at least 6 of 10;
- otherwise **not decided**.
- If only repetition 0 is valid (quota), it is reported as k=1 with no verdict.

**Descriptive:**
- tokens, minutes and end reason per batch; binary rewards;
- whether C1P stops early despite the instruction, and its `done` reason;
- how the swarm spreads over the ten tasks (`traces18.md`);
- comparison with round 17 E on the five shared tasks (another hour and cap, so descriptive).

**Predictions:**
- C1P works much longer than round 17's C1T (more than 3.1M and 20 minutes) but still calls `done` before the clock with tasks unfinished.
- ST uses most of the 120 minutes and covers more tasks.
- ST beats C1P by the rule, and neither arm touches oxvg.

**Estimate:** ST spent about 2.4M per minute in round 17 E, so a full 120 minutes could cost up to ~290M per batch; C1P perhaps 10–50M. k=2 would be ~400–700M, more than one quota window, so the quota may stop the round after repetition 0.

**Known threats:**
- The two arms differ in two things at once, the swarm and the instruction. That is the design: the control is strengthened on purpose.
- 20 sidecars share 10 Docker CPUs, slowing builds for both arms alike.
- The tasks were chosen with C1T's isolated scores (another profile), and five of them are near its ceiling when run alone.
- Twelve agents spending for 120 minutes in one hub is untested.

### Round 18 result and rule applied (2026-10-05 13:51; batches 06:03–09:07 UTC, code `7eeeca4` for repetition 0 and `3c02043` for repetition 1, see the deviation)

| task | ST r0 | ST r1 | ST mean | C1P r0 | C1P r1 | C1P mean |
|---|---:|---:|---:|---:|---:|---:|
| expr | 0.000 | 0.886 | 0.443 | 0.000 | 0.000 | 0.000 |
| oxvg | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| scriggo | 0.000 | 0.973 | 0.486 | 0.000 | 0.000 | 0.000 |
| tengo | 0.714 | 1.000 | 0.857 | 0.000 | 0.000 | 0.000 |
| wasmi | 0.136 | 1.000 | 0.568 | 0.000 | 0.000 | 0.000 |
| scc | 0.903 | 0.806 | 0.855 | 0.000 | 0.000 | 0.000 |
| participle | 0.000 | 0.135 | 0.067 | 0.000 | 0.000 | 0.000 |
| dasel | 0.925 | 0.219 | 0.572 | 0.000 | 0.000 | 0.000 |
| fastapi | 0.977 | 0.744 | 0.860 | 0.163 | 0.000 | 0.081 |
| cattrs | 0.899 | 0.942 | 0.920 | 0.594 | 0.000 | 0.297 |
| **ten-task mean** | 0.455 | 0.671 | **0.563** | 0.076 | 0.000 | **0.038** |

| batch | tokens | cost | minutes | end |
|---|---:|---:|---:|---|
| ST r0 (`e18-swarm-r0`) | 36.1M | $0.60 | 35.1 | quiescent: 11 of 12 agents called `done` by 22.8 min; the twelfth worked until 34 min and stopped without it |
| ST r1 (`e18-swarm-r1`) | 337.3M | $4.21 | 120.7 | quiescent at 119.8 min, at the clock; 10 of 12 called `done` |
| C1P r0 (`e18-solo-r0`) | 2.0M | $0.04 | 13.9 | `done` |
| C1P r1 (`e18-solo-r1`) | 0.05M | $0.003 | 1.3 | `done` after reading the ten task files |

- **Rule as written: ST beats C1P.** The ten-task mean is +0.525 above, and ST is above on 9 of 10 tasks (oxvg tied at 0).
- **But, as in round 17 E, the margin is the single agent stopping, now even earlier.** The persistence instruction was in C1P's system prompt in both repetitions (checked in both transcripts ✓). In r0 C1P made 49 bash calls, implemented cattrs and part of fastapi, and called `done` at 13 minutes: "I could not complete the requested work across all 10 repositories ... The full goal is therefore not met." In r1 it read the ten task files, never called bash, and called `done` 0.4 minutes in: "This assignment requests ten independent repository-level changes across different toolchains, and no project command can be run in this execution context." That belief is false: the same image and prompt gave r0 49 working bash calls and a passing cattrs test run. So r1's zeros are the model's behaviour, not an infrastructure fault (✓). Round 17's C1T, without the instruction, worked 14–19 minutes and spent 3.1M per batch.
- **The swarm stops too, at random.** In r0 eleven agents called `done` by minute 23, the twelfth (lark) stopped at minute 34 without calling it, and the run went quiescent with 36M spent; in r1 two agents never called `done` and the run used the whole clock (337M). The two repetitions differ by 0.216 on the ten tasks and by 0.602 on the five shared with round 17 E (0.170 and 0.772). Run r1 has the first two binary rewards on DeepSWE in this project (tengo and wasmi).
- **Spread** ([`deepswe/traces18.md`](deepswe/traces18.md)): r0 wrote in 9 of 10 repositories (not oxvg) with 1–2 agents per repository; r1 wrote in all 10, with up to 4 agents on scriggo, wasmi and fastapi. oxvg scored 0 everywhere (r1 wrote 6.7 KB there).
- **From the transcripts** ([report](reports/2026-10-05-round18-19-traces-analysis.md), model output; key claims checked by hand):
  - In r0 each agent called `done` when its own repository was finished or claimed by someone else, often admitting the work was partial (tern on scriggo, "only partially complete"; heron on wasmi, "remains incomplete"). There was no cascade. All ten repositories were claimed within about 2 minutes, with five agents claiming expr, and nobody took over a repository after its owner stopped. Lark, the last one working, ended its turn with a final message instead of `done` at 34 minutes, and with everyone else done nothing woke it.
  - In r1 the same early stops happened (seven agents done by minute 20), but crane, plover, heron, linnet and dunlin kept offering help after their own repository and took the abandoned ones. Tern dropped tengo at 2.8 minutes, and crane noticed at 60.7 that the repository was still clean and took it over. Nobody edited expr until minute 91.5 (✓), so its 0.886 was built in the last 29 minutes. Both binary rewards came from repositories where two to four agents worked: wasmi from early on, tengo only after the late takeover.
  - r1's losses on dasel and fastapi: wren's HTML reader hangs a test until the grader's 10-minute timeout (✓), and wren had called `done` at 6.5 minutes with nobody reviewing; fastapi was split among four agents with unclear ownership (0.744, against 0.977 by one agent in r0).
  - A `done` agent is not woken by posts (`revive: 0`), so the swarm's working time is set by how many agents refuse to call `done`.
- **Against round 17 E on the five shared tasks** (32M cap there, so descriptive): ST 0.471 (0.170, 0.772) against STT 0.408; C1P 0.000 against C1T 0.045.
- **Suspicious zeros checked:** no batch has an empty diff together with `parsed=0`; every zero comes either from an empty diff (nobody changed that repository) or from new tests failing with the base tests intact. No infrastructure fault.
- **Predictions:**
  - "C1P works much longer than C1T" is refuted: 13.9 and 1.3 minutes, 2.0M and 0.05M. "It still calls `done` with tasks unfinished" holds.
  - "ST uses most of the 120 minutes and covers more tasks" holds in r1 only.
  - "ST beats C1P" holds. "Neither arm touches oxvg" is refuted for ST r1, which wrote there without scoring.
- **Spend:** 375.5M tokens and $4.86 in total, inside the 400–700M estimate; no quota stop in this round (round 19 hit it later).
- **Deviation:** round 19's levers (`boardTail`, `sharedNotes`, both default off) and the driver's `costUsd` field were committed in `3c02043` at 06:13 UTC, ten minutes into repetition 0. Repetition 0's hubs had loaded `src/` at start (`7eeeca4`); repetition 1 ran on `3c02043`. ST and C1P do not use the new levers, so their behaviour is unchanged, but the driver was edited in place instead of in a copy. The driver records HEAD when it writes the summary, so all four summaries say `3c02043`, and the repetition 0 summaries lack `costUsd`; their costs above come from each run's `murmur/run/result.json`.

## Round 19: how the team shares state, on the five-task DeepSWE batch (fixed before measuring, 2026-10-05 08:12; the user asked for it)

**The user's requests:**
- Test the new delivery forms from the literature list (H3 and H3b) on the batch after round 18.
- Test the threaded board too.
- Test better instructions for using the board.
- Asked whether agents creating and taking tasks was ever tested properly. Only once, in round 15 A, on one-deliverable tasks where the list was barely used, so a task-list arm is added here.
- Report dollar cost, not only tokens, because the cache matters.

**Question.** With everything else fixed (12 agents, staggered entry, the same five tasks and the same 32M), does the way the team shares state change what a swarm achieves on a batch of independent repository tasks?

**Arms** (all 12 agents with staggered entry, write guard and clock; no tokens line):
- **ST** = `n12-stagger`, the control: a post-only board, with new posts attached once to the next tool result.
- **ST-tail** = `n12-stagger-tail`, new (H3b): ST plus, on every tool result, each teammate's latest post (its first 100 characters) as a view of the team's state. New default-off lever `boardTail`.
- **ST-file** = `n12-stagger-file`, new (H3): no board tools. One shared file, `TEAM.md`, in the folder root, which the agents keep under 60 lines: who works on what, what is finished, what is missing, and verified facts. Its content is added to each agent's first prompt. New default-off lever `sharedNotes`.
- **ST-threads** = `n12-stagger-threads`, new: round 16's STH without the tokens line. Threads replace `post`.
- **ST-norms** = `n12-stagger-norms`, new: ST with a fuller board briefing: before starting a piece, read the board and post one line saying what you take, preferring work nobody has; when you finish or get stuck, post what you did with the command and its result; say so when you notice untaken work, and take it; keep posts short and factual, with no agreement or thanks.
- **ST-tasks** = `n12-stagger-tasks`, new: ST plus round 15's shared task list (`tasks`, `task_add`, `task_take`, `task_done`, `task_drop`) and its briefing line.

**Smoke tests** (3 agents on `examples/hello.json` with a line to share, from a copy of `src/`, runs deleted):
- tail: the teammates' latest posts appeared in all three agents' tool results.
- file: the third agent's first prompt carried `TEAM.md` as written by the first two, and all three kept it.
- threads: threads were opened and answered.
- norms: 21 posts.
- The default profile on `examples/hello.json` passed. Unit tests pass.

**Tasks:** round 17 E's five: expr, oxvg, scriggo, tengo, wasmi. In round 17 E, STT (ST with the tokens line) scored 0.411 and 0.406 there.

**Execution.** `experiments/deepswe/batch19.sh` starts after round 18 (`no work left (batch18)`). 32M shared and 120 minutes per batch, so every arm spends the same tokens (round 17's swarm reached 32M in 12–14 minutes); 4 GB and 2 CPUs per sidecar; k=2. Each repetition runs two waves of three arms at the same time: ST, ST-tail and ST-file, then ST-threads, ST-norms and ST-tasks. Quota stop as before.

**Rule** (per-task means over k=2, then the five-task mean), each arm against ST:
- **better** if the five-task mean is ≥ +0.05 above and above on at least 3 of 5 tasks;
- **worse** if ≤ −0.05 below and below on at least 3 of 5;
- otherwise **not decided**.

**Descriptive:**
- cost in dollars (murmur's `costUsd`, from Pi's prices for gpt-6-luna: per million tokens, $0.10 input, $0.01 cache reads, $0.50 output) beside tokens;
- the board's share of calls;
- agents per repository and write/edit calls per repository (`traces19.md`), and whether anyone touches oxvg;
- duplicate work (two or more agents rewriting the same file);
- use of each mechanism: tail size, `TEAM.md` length and edits, threads, task-list items.

**Predictions:**
- ST-norms and ST-tasks spread agents over more tasks (oxvg touched) but are not decided on score.
- ST-threads is not decided or worse (round 16).
- ST-tail and ST-file are not decided.
- At a fixed 32M none changes the score by 0.05 on 3 of 5 tasks: the swarm's limit here is spend per task, not coordination.

**Estimate:** 6 arms × 2 × 32M = 384M tokens at most, about $6 at Pi's prices. More than one quota window, so the quota may stop it after repetition 0.

**Known threats:**
- k=2 on five tasks. Round 17 E's per-task scores swung from 0 to 0.745 between repetitions of one arm.
- The two waves run at different times.
- ST-file removes the board and adds the file at once. ST-norms changes only the briefing.
- The task list and the file add their own instructions, so their arms change the wording too.

**Cost reporting from now on.** `scripts/rows.mjs` now writes `cost_usd` per run (murmur's `costUsd`, or swarmtest's `cost_usd` for Pi runs). The batch driver's summary now writes `costUsd`, from round 19 on; earlier batch costs are in each run's `murmur/run/result.json`. As a check on round 17: the token ratios and the dollar ratios between arms are close, because cache reads are 77–96% of tokens in every arm. AUD against C1T is 4.2× in tokens and 4.3× in dollars on planning, and 10.9× and 8.5× on shop2. The DeepSWE swarm against the single agent is 10.3× in tokens and 10× in dollars.

### Round 19: stopped by the model quota after the first wave of repetition 0 (2026-10-05 13:52; batches 09:08–10:34 UTC, code `3c02043`)

Only wave 1 of repetition 0 is valid: ST, ST-tail and ST-file, one batch each. The three wave-2 batches (ST-threads, ST-norms, ST-tasks) hit the model's usage limit ("Codex error: The usage limit has been reached") at about 10:12 UTC, 16 minutes after they started; the driver moved their summaries into their run directories and wrote `STOP19`. **With k=1 and half the arms missing, no rule is applied**, following round 18's clause for this case (round 19's pre-registration says "quota stop as before"). The numbers below are descriptive.

| task | ST r0 | ST-tail r0 | ST-file r0 |
|---|---:|---:|---:|
| expr | 0.038 | 1.000 | 0.342 |
| oxvg | 0.000 | 0.000 | 0.000 |
| scriggo | 0.000 | 0.000 | 0.000 |
| tengo | 0.945 | 0.011 | 0.692 |
| wasmi | 0.773 | 0.364 | 0.134 |
| **five-task mean** | 0.351 | 0.275 | 0.234 |
| tokens / cost | 32.1M / $0.53 | 32.0M / $0.52 | 11.0M / $0.23 |
| minutes / end | 39.6 / budget | 28.3 / budget | 28.5 / quiescent |

- **One repetition orders nothing here.** On these five tasks the ST control (12 agents, staggered entry, post-only board) has now scored 0.351 (this round), 0.170 and 0.772 (round 18, no cap), and its tokens-line twin STT 0.411 and 0.406 (round 17 E). Every gap in the table is inside that spread.
- **ST-tail** (ST plus each teammate's latest post on every tool result) is the only batch with a binary reward (expr 1.000). Its oxvg zero is a broken build: the diff (10 KB) does not compile (`E0308` and `E0282` in both the base and new test logs), so `parsed=0` is a legitimate zero, not a grader fault (✓). Its tengo 0.011 comes from a 500-byte diff. It wrote in all five repositories, oxvg included (13 write/edit calls).
- **ST-file** (no board; a shared `TEAM.md` added to each agent's first prompt) went quiescent at 28 minutes with 11M of the 32M spent: 11 of 12 agents called `done`. The agents edited `TEAM.md` 87 times, more often than any repository (at most 30 write/edit calls on one).
- **From the transcripts** ([report](reports/2026-10-05-round18-19-traces-analysis.md), model output; key claims checked by hand):
  - ST-tail's oxvg zero is a budget-cut artifact: finch was mid-edit when the 32M cap aborted the run (✓ "Operation aborted"). Its tengo 0.011 is tern's single edit before `done` at 6.9 minutes (✓); nobody took tengo after that. The tail rode on 806 tool results (about 1.1 KB each); no agent mentions it, and spread over the repositories did not change.
  - ST-file: 35 of the 87 `TEAM.md` edits failed on stale or ambiguous `oldText` (✓). The file grew to about 18 lines. It is injected only at entry, so later agents re-read it with tools (66 times). Eleven agents called `done` while saying work "remains in progress with teammates", and with no board nothing wakes an idle agent, so the run ended with 21M unspent.
  - Wave 2 (invalid), mechanism use only: threads opened 10 threads (two titled "Project ownership") with 44 replies, against 17 edits in the whole batch; norms posts were claims and review findings, with few thanks; in the task-list arm one agent added one item per repository in the first 12 seconds and nobody added anything after, with no `task_done`.
- **Suspicious zeros checked:** apart from ST-tail's oxvg (above), every zero has base tests intact and new tests failing, or an empty diff. No infrastructure fault.
- **Coordination counts:** [`deepswe/traces19.md`](deepswe/traces19.md), with the invalid batches' mechanism use up to the quota stop (threads: 10 opened, 44 replies; task list: 5 items added, 13 takes).
- **Spend:** valid 75.2M and $1.27; invalid 25.5M and $0.57, spent but not counted; 100.7M and $1.84 in total. The quota stop came after about 475M tokens since 06:03 UTC, in rounds 18 and 19 together.
- **Resuming.** `batch19.sh` skips any batch with a `results/*.json`, so moving the three invalid run directories aside (the driver reuses `runs/<id>/` and would mix the old files with the new ones), deleting `STOP19` and restarting it would rerun wave 2 of repetition 0 and all of repetition 1: 9 batches, at most 288M and about $4.7 at this round's ~$0.016 per million. The quota's reset time is not known.

## 2026-10-05 17:43: the user's direction after rounds 18 and 19, and a communication diagnosis (no measurement)

The user declined both proposed next steps (resuming round 19 and a round on stopping): "the swarm is not communicating effectively; that is what we must find". A subagent diagnosed communication in all 54 twelve-agent runs from rounds 15–19 ([report](reports/2026-10-05-swarm-communication-diagnosis.md), model output; key claims checked by hand). Its ranking, by cost:
1. **Silent departures.** A `done` reason is visible only through the `team` tool, which the ST profiles do not offer and no agent called in any run. Teammates keep addressing agents who left (swift in round 18 r1 was named in 50 posts over 99 minutes after its `done`), and a repository claimed by a departed agent stays unowned: 11 of the 20 DeepSWE repository-runs below 0.5 ended with their last editor gone and nobody continuing, with 4–113 minutes left.
2. **`done` read as "my slice is done".** 35 of 58 `done` reasons admit partial scope; one agent called `done` saying it "will continue with the assigned Scriggo task".
3. **Stale or retracted claims.** A claim in prose keeps counting after it is retracted or its author leaves (round 19 ST: robin's expr claim, retracted at 0.6 minutes, was still cited at 32; expr scored 0.04). The board tail froze such claims on screen. The task list was the only mechanism that released a claim automatically, on `done`.
Delivery speed is not a problem (median 4–5 s from post to attach). The requirements for a fix: show a departure to everyone from facts murmur has, not from the leaver's goodwill; let an agent see goal-level state (untouched or orphaned work, who is active) before it leaves; keep one current owner statement per unit of work. All without tests, without the grader, and without assigning work.

## Round 20: making the team's state visible, on the five-task DeepSWE batch (fixed before measuring, 2026-10-05 18:31; the user approved the proposal with "Ok")

**Why.** The communication diagnosis (17:43 note) ranks silent departures first: a `done` is invisible to teammates in the ST profiles, so they keep addressing agents who left and leave their repositories unowned. Next come `done` read as "my part is done" and stale prose claims. Delivery speed is not the problem. This round tests mechanisms that make the team's state visible, derived from facts murmur already has (who called `done` and why, who changed which folder and when), with no tests, no grader and no assignment of work.

**Question.** Does making departures and the team's state visible change how a 12-agent swarm coordinates and what it achieves on a batch of independent repository tasks?

**Arms** (all 12 agents with staggered entry, write guard, clock and a post-only board; no tokens line):
- **ST** = `n12-stagger`, the control.
- **ST-depart** = `n12-stagger-depart`, new: ST plus the new default-off lever `departureNotice`. When an agent calls `done`, murmur posts once, from that agent: "(sent by murmur) X called done and left the team for good, saying: "<reason>" It used write/edit in <folders>, last N min ago. Its claims no longer hold." The profile also replaces `done`'s description (through `toolDescriptions`, no default change): "Leave the team for good. Your teammates will be told that you left, with your reason, and you will not be woken again. Call it only when the whole goal is met, not just your part, or to give up with the reason why the goal cannot be reached."
- **ST-status** = `n12-stagger-status`, new: ST-depart plus the new default-off lever `teamStatus`. Every tool result ends with two lines: each teammate's state (working, idle, not entered yet, or left at minute M; for those still in, its last write/edit folder and how long ago), and each top-level folder's last write/edit (who, how long ago) or "no write/edit yet". Facts only: nothing suggests who should take what.
- **ST-tasks** = `n12-stagger-tasks`, as in round 19 (invalid there): ST plus round 15's shared task list, whose items are released automatically when their holder calls `done`.

**Smoke tests** (from `src/` with no campaign running; runs deleted):
- A scripted 3-agent task (`n12-stagger-status`): wren calls `done` at once, finch claims the three folders and writes them, robin waits. The departure notice reached both others with the reason and "It used write/edit on no file"; the status lines showed "wren: left at 0.0 min", "robin: not entered yet", then "finch: idle, last write/edit in gamma 0 min ago" and each folder's last writer. A first version counted only folders changed through write/edit, and finch had written with bash, so the status said "untouched": the wording now says "write/edit" explicitly. In rounds 18–19, 8–15% of bash calls could modify files, mostly `gofmt -w` after an `edit`.
- The default profile on `examples/trio.json` passed with no status or notice lines. Unit tests and typecheck pass.

**Tasks:** round 17 E's five (expr, oxvg, scriggo, tengo, wasmi), as in round 19.

**Execution.** `experiments/deepswe/batch20.sh`: 32M shared and 120 minutes per batch, 5 GB and 2 CPUs per sidecar, k=2. Each repetition runs two waves of two arms at the same time (10 sidecars, as in round 18): ST with ST-depart, then ST-status with ST-tasks. Quota stop as before (the batch is invalid and the script stops). Repetition 0 runs first; if only repetition 0 is valid, it is reported as k=1 with no verdict.

**Primary read: process measures** (`experiments/deepswe/comm.py`, fixed with this commit, from `events.jsonl`; edits through bash are not seen):
- **posts addressed to the departed:** posts by agents that address a teammate after it called `done` (its name followed by a comma, colon, slash or "please");
- **departures of a last editor** and how many are **picked up** (another agent writes or edits in that repository before the run ends), with the median minutes to pick-up;
- **untouched repositories** at the end.

On round 19's and round 18's ST batches (descriptive baseline, other runs): addressed to the departed 38, 7 and 54; departures of a last editor 5, 8 and 10, picked up 2, 0 and 4.

**Expected direction, per arm against ST (summed over both repetitions):**
- ST-depart and ST-status: fewer posts addressed to the departed (at most half of ST's), and a larger share of departures picked up.
- ST-status: also fewer untouched repositories, if ST has any.
- ST-tasks: a larger share picked up, where the work was on the list.

These are directions to read, not a rule: the counts are small (3–10 departures per batch).

**Score rule** (as in round 19; per-task means over k=2, then the five-task mean), each arm against ST:
- **better** if the mean is ≥ +0.05 above and above on at least 3 of 5 tasks;
- **worse** if ≤ −0.05 below and below on at least 3 of 5;
- otherwise **not decided**.

**Descriptive:** cost in dollars beside tokens; minutes and end reason; `done` calls and when; the board's share of calls; agents and write/edit calls per repository (`traces20.md`); how agents react to notices and the status line (transcripts).

**Predictions:**
- ST-depart and ST-status meet the process directions; ST-tasks meets the pick-up direction weakly.
- With `done` now described as leaving for good, ST-depart and ST-status agents call `done` later, so their runs reach the 32M cap more often than ST's.
- No arm is better than ST by the score rule: on these five tasks ST alone has scored 0.17–0.77, and at 32M the cap still cuts most runs.

**Estimate:** 4 arms × 2 × 32M = 256M tokens at most, about $4.1 at round 19's ~$0.016 per million; about three hours.

**Known threats:**
- k=2 on five tasks, and ST's own spread on them is 0.17–0.77.
- ST-depart changes two things at once: the notice and `done`'s description. ST-status adds the status line on top. ST-tasks changes the briefing too.
- The status line and the folder list in the notice see only write/edit/append, not bash edits. The workspace's `_tasks` folder shows as "no write/edit yet" for the whole run.
- The 32M cap ends most runs in 28–40 minutes, which hides some abandonment; departures happen in minutes 1–7, so the mechanisms are exercised.
- The two waves run at different times.

### Round 20 result and rule applied (2026-10-06 08:27; batches 2026-10-05 16:32 UTC to 2026-10-06 06:25 UTC, code `ed4fb54`)

| task | ST r0 | ST r1 | ST mean | depart r0 | depart r1 | depart mean | status r0 | status r1 | status mean | tasks r0 | tasks r1 | tasks mean |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| expr | 0.987 | 0.000 | 0.494 | 0.329 | 0.848 | 0.588 | 0.658 | 0.063 | 0.361 | 0.848 | 0.342 | 0.595 |
| oxvg | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.500 | 0.250 | 0.000 | 0.000 | 0.000 |
| scriggo | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| tengo | 0.989 | 0.945 | 0.967 | 0.253 | 0.747 | 0.500 | 0.317 | 0.846 | 0.582 | 0.011 | 0.934 | 0.473 |
| wasmi | 0.364 | 0.364 | 0.364 | 0.364 | 0.491 | 0.428 | 0.364 | 0.136 | 0.250 | 0.773 | 0.500 | 0.636 |
| **five-task mean** | 0.468 | 0.262 | **0.365** | 0.189 | 0.417 | **0.303** | 0.268 | 0.309 | **0.288** | 0.326 | 0.355 | **0.341** |
| minutes | 19.8 | 15.4 | | 13.4 | 14.3 | | 11.8 | 14.5 | | 14.8 | 15.3 | |

Every batch ended at the 32M cap, after 12–20 minutes ($0.49–0.53 each). In total 256.2M tokens and $4.11 for the eight valid batches, plus two failed runs with no tool call (below).

**Rule as written** (each arm against ST):
- **ST-depart** (departure notices and the new `done` description): −0.062, below on 1 of 5 tasks and above on 2: **not decided**.
- **ST-status** (ST-depart plus the team status line): −0.076, below on 3 of 5 (expr, tengo, wasmi) and above on 1 (oxvg): **worse**.
- **ST-tasks** (shared task list): −0.024: **not decided**.

**Process measures** (`comm.py`, summed over both repetitions):

| measure | ST | ST-depart | ST-status | ST-tasks |
|---|---:|---:|---:|---:|
| posts addressed to departed agents | 14 (8, 6) | 0 | 0 | 5 (2, 3) |
| departures of a last editor, picked up | 3, 1 | 3, 1 | 2, 1 | 0, 0 |
| untouched repositories at the end | 3 (oxvg twice, expr once) | 0 | 0 | 0 |
| `done` calls before the cap | 14 (8, 6) | 10 (5, 5) | 6 (2, 4) | 7 (3, 4) |

- **Against the pre-registered directions:**
  - "At most half of ST's posts addressed to the departed" holds for ST-depart and ST-status (0 against 14).
  - "A larger share of departures picked up" cannot be read: 2–3 departures of a last editor per arm, one picked up in each.
  - "Fewer untouched repositories" holds for ST-status (0 against 3), and also for ST-depart and ST-tasks, which were not predicted to change it. Every arm except ST wrote in oxvg in both repetitions, and ST-status r1 scored 0.500 there, the first non-zero oxvg score in the project (3 of 6 new tests pass, base intact).
- **Predictions:**
  - "ST-depart and ST-status meet the process directions" holds for the first and third measures; the second is unreadable.
  - "They call `done` later, so they reach the cap more often" cannot be tested as written, since every batch reached the cap. They called `done` less often before it (10 and 6 against ST's 14).
  - "No arm is better by the score rule" holds; ST-status was worse.
- **Suspicious zeros checked:** no infrastructure fault among the valid batches. Five scriggo zeros and one oxvg zero are diffs that do not compile at the cap (`build failed`, `could not compile`); the other zeros ran their tests and failed, or had an empty diff.
- **Infrastructure failure, rerun:** the first runs of `e20-stagger-status-r1` and `e20-stagger-tasks-r1` started at 18:58 UTC when the model API was unreachable: every agent's first request ended "fetch failed", the runs went quiescent in under a minute with no tool call, and every diff was empty. The quota check in `batch20.sh` looks only for the usage-limit error, so the driver kept them (and the wave took four hours, mostly scoring empty workspaces under the outage). Both were moved to `runs/<id>-fetchfail/`, listed in `invalid20.txt`, and rerun on 2026-10-06 06:00–06:25 UTC with the same code and profiles. This changes the pairing in time for that wave (about 11 hours later than its repetition-1 partners).
- **Runs were shorter than in round 19** (12–20 minutes against 28–40 for the same 32M), probably because ten sidecars instead of fifteen shared the Docker CPUs, so commands returned faster and agents spent faster.
- **Coordination counts:** [`deepswe/traces20.md`](deepswe/traces20.md), generated with the new `deepswe/traces.py`.
- **From the transcripts** ([report](reports/2026-10-06-round20-traces-analysis.md), model output; key claims checked by hand):
  - **Agents read the departure notice as an ownership fact and act on it.** In ST-depart r1, tern posted "Wren has left ... I will take Tengo" within 0.6 minutes of the notice and edited Tengo from 5.8 (✓), and Tengo reached 0.75. In ST-status r1, four agents claimed oxvg within 0.2 minutes of wren's notice (✓), and two of them produced the 0.500. In ST, by contrast, linnet waited on kite, who had left at 2.2, and wrote at 12.4 "I won't edit oxvg without a clear handoff from Kite" (✓).
  - **A notice is not enough when nobody is free.** In ST-depart r0 robin left Tengo at 7.1 after 15 edits, and nobody posted about Tengo or edited it afterwards (✓); four agents in that run never edited anything, three of them gone within 3 minutes.
  - **The new `done` description did not change what `done` means to the agents.** No `done` in any arm claims the whole goal. With the new text, 8 of 10 ST-depart dones and 5 of 6 ST-status dones say the overall goal is not complete, and still call `done`. First `done` times stayed at 1.3–2.3 minutes. The drop in posts addressed to departed agents also reflects fewer departures (14, 10 and 6 `done` calls).
  - **The status line costs work at a fixed cap.** It adds about 800 characters to every tool result. ST-status made fewer, larger model calls than ST (798 and 696 calls at 40–46k tokens each, against 895 and 838 at 36–38k) and fewer write/edit calls (80 and 78 against 143 and 109) (✓). No post quotes it. Coverage over repositories was the same as ST-depart's and ST-tasks' (all five touched). The arm's lower score fits this: its r0 ended at 11.4 minutes with Tengo unfinished.
  - **The task list** released one item on `done` that was taken 0.2 minutes later (✓); otherwise its benefit was coverage.
  - Remaining failures: `done` as "my slice", early exits, waiting for an owner who never answers, and four-way claim races after a notice.

## 2026-10-06: group science and game theory, candidate levers after round 20 (not pre-registered, no measurement)

The user asked for a study of how human groups work and how to optimise them, of game theory, and of how both apply to murmur. Two subagent reviews ([game theory](reports/2026-10-06-lit-game-theory.md), [human groups part 2: handoffs, ownership, awareness, open source](reports/2026-10-06-lit-human-groups-coordination.md)), synthesised in [`reports/2026-10-06-group-science-game-theory.md`](reports/2026-10-06-group-science-game-theory.md) (model output, key claims checked by hand). The main points:
- murmur is a team game (one shared payoff), so the losses are in the information structure, not in incentives. Payoff or responsibility text has no theoretical purchase, which matches the record. Levers are ranked by whether they act through information, tool mechanics or prompt text.
- Round 20's notice and status line match both fields' advice. Two risks its predictions do not state, readable in its data:
  - Visible departures may speed up a `done` cascade (stag hunt). Check `done` times against departure notices.
  - Activity facts may herd agents. Check editors per repository.
- Candidate levers after round 20, in order, each conditional on what round 20 shows:
  1. A bounce on posts that name a departed agent.
  2. An orphan flag in the folder line ("last writer left, nobody since").
  3. A departure notice carrying what the leaver executed.
  4. Take-over on lapse.
  5. A structured `done`.
- Allocation blindness (work going to repositories already good) has no oracle-free fix in either field.

**Deep pass and round 20 (2026-10-06, later the same day).** Six deeper reviews that read primary texts (`reports/2026-10-06-deep-*.md`), synthesised in [`reports/2026-10-06-group-science-game-theory-v2.md`](reports/2026-10-06-group-science-game-theory-v2.md) with 11 claims checked by hand. Checked against round 20's result, the theory's predictions came out as follows.
- **Held:**
  - Publishing a departure as a fact removed posts to departed agents.
  - With zero cost of volunteering there are duplicate volunteers, not delay: a four-way claim race on oxvg.
  - Prompt text did not change `done`.
  - A notice helps only if someone is free.
- **Not supported:**
  - The stag-hunt cascade: fewer `done` calls with notices, not more.
  - The need for a standing line beyond the one-time notice.
- **The new lesson:** information broadcast on every tool result has a token cost at a fixed cap. This fits ST-status's loss, which is k=2 and confounded with run length. The lever order is now:
  1. information delivered at the point of use (bounce, arrival brief);
  2. tool mechanics (a standing rule for simultaneous claims);
  3. information broadcast on every result, only if short;
  4. prompt text.
- **Two open questions for the user:**
  - Whether agents may share a log of their own tests' exit codes (realism rule).
  - The model covariate: conformity to declared consensus differs by model.

## 2026-10-06 09:35: the base profile, new defaults, and k=3 as the norm (the user's decisions after the recap; no measurement)

- **Base profile** [`profiles/n12-base.json`](../profiles/n12-base.json): ST (`n12-stagger`: post-only board delivered on tool results, staggered entry, write guard, clock) plus `departureNotice`, without round 20's `done` description, which changed nothing. The notice alone was not tested separately from that description; the transcripts give no reason to expect the description mattered.
- **Defaults changed** (the user's OK: "cambia los default"; this commit): `delivery` "steer" → "attach"; `boardTools` all → `["post"]`; `teamBriefing` → ST's short version; `spawnAfterTurns` 0 → 2 and `spawnGapSeconds` 0 → 60; `writeGuard`, `clock` and `departureNotice` false → true. `departureNotice` now posts only with messaging on and more than one agent. Every profile that omits one of these keys behaves differently from this commit on: 27 profiles relied on the clock being off (among them `solo` and `no-messaging`), 25 on "steer" delivery, 13 on no write guard, 38 on the full board tool set. Their recorded results stay valid at their own commits; a new control that needs the old behaviour must say so explicitly in a new profile.
- **k=3 is the norm** (AGENTS.md): every arm gets at least three repetitions per task; a round with less is a screen and gives no verdict.
- Smoke: `examples/trio.json` with the new defaults (3 agents) entered staggered, carried the clock and posted two departure notices; `examples/hello.json` (1 agent) posted none. Unit tests and typecheck pass.

## Round 21: three rival teams that can read each other's work, on the five-task DeepSWE batch (fixed before measuring, 2026-10-06 11:05; the user's design)

**Why.** The user's design, in their words: "3 teams of 3, the prompt says specifically that the objective is to finish above the rest; they are told they can see the others but the others cannot see them (a lie); afterwards the three results are checked." The user chose the tasks, the budget and k.

**Question.** What do three rival teams that are told to beat each other, and believe they watch the others unseen, score on the batch, and how do they use the rivals' work?

**Arms:**
- **Teams** (`--arm teams --teams 3`, profile `n12-base.json` with 3 agents per team; new in `run-batch.mjs`). There are three teams (team1, team2, team3), each with its own hub and its own copy of the five repositories. Inside a team the setup is the base profile: a post-only board delivered on tool results, staggered entry, write guard, clock and departure notices. Each team's goal is the usual batch goal, with this added:
  > You are team1. 2 other teams, team2 and team3, are working on the same projects at the same time, each in its own copy of the repositories. Your objective is to finish above the other teams.
  > You can read their current work, read-only, at /rivals/<team>/<project> (for example /rivals/team2/expr-try-catch-errors); it changes as they work. They cannot see your work.
  - The last sentence is false: every team mounts the other two teams' repositories, read-only (Docker `:ro`).
  - Teams cannot run commands in the rivals' environments (`run` reaches only their own), and have no channel between them.
  - Each team has 8M tokens and 120 minutes, i.e. round 20's 32M for 12 agents, scaled to 3 agents. The three teams run at the same time.
- **Solo** (C1, one agent with the clock; `solo-clock.json`): the same batch with 8M and 120 minutes, run after the teams of the same repetition so that it does not share the machine with them.

**Tasks:** round 17 E's five (expr, oxvg, scriggo, tengo, wasmi), as in rounds 19–20.

**k=2**, the user's choice. Under the k=3 norm (09:35 note) this round is a **screen with no verdict**. A third repetition can be added later with the same script.

**Execution.** `experiments/deepswe/batch21.sh`, sidecars 5 GB and 2 CPUs. Per repetition: the three teams (15 sidecars), then the solo run (5 sidecars). Quota stop as in round 20 (STOP21).

**Smoke test** (deleted):
- Two teams of one agent on expr, 0.3M and 4 minutes.
- From team1's hub, `/rivals/team2/expr-try-catch-errors` was readable, and writing there failed with "Read-only file system"; the team's own repository was writable.
- Both agents read the rival's folder (2–3 reads each).
- Each team was scored separately, and the summary has one block per team.

**What is read** (descriptive, per team and repetition):
- **Scores:** the three five-task means.
- **Tokens and minutes.**
- **Use of the rivals' work:** tool calls whose arguments mention `/rivals`, per agent and over time; files copied from a rival (identical content in the final diffs); posts that mention the other teams.
- **When agents stop:** the first `done`, the last write, and the end reason, against round 20's ST (12 agents in one swarm, other time and budget, a reference only).
- **From the transcripts:** whether agents believe the claim that they are unseen, and how they talk about the rivalry.

**Score rule** (screen, reported but no verdict at k=2): the per-task mean over the three teams and both repetitions, against the solo arm's per-task mean. The teams count as above if they are ≥ +0.05 higher on the five-task mean and higher on at least 3 of 5 tasks; below if ≤ −0.05 and lower on at least 3 of 5; otherwise not decided. The best team of each repetition is also reported, labelled as chosen by the grader after the fact. That is not something the system could deliver, because nothing picks a team without the grader.

**Estimate:** at most (3 × 8M + 8M) × 2 = 64M tokens, about $1 at round 20's rate; four batches of up to two hours each, plus scoring.

**Known threats:**
- k=2.
- The solo arm runs at a different time from the teams.
- A team of three can empty early if its agents call `done`.
- The teams arm changes several things at once against any earlier arm: team size, rivalry text, the visibility of rivals and the false claim.

### Round 21 result and rule applied (2026-10-06 15:55; batches 08:58–11:26 UTC, code `46f2aff`)

| task | team1 r0 | team2 r0 | team3 r0 | team1 r1 | team2 r1 | team3 r1 | **teams mean** | solo r0 | solo r1 | **solo mean** |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| expr | 0.000 | 0.063 | 0.063 | 0.000 | 0.063 | 0.127 | 0.053 | 0.000 | 0.000 | 0.000 |
| oxvg | 0.000 | 0.500 | 0.000 | 0.667 | 0.000 | 0.000 | 0.194 | 0.000 | 0.000 | 0.000 |
| scriggo | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| tengo | 0.000 | 0.011 | 0.835 | 0.440 | 0.714 | 0.000 | 0.333 | 0.011 | 0.000 | 0.005 |
| wasmi | 0.364 | 0.364 | 0.364 | 0.364 | 0.136 | 0.000 | 0.265 | 0.136 | 0.000 | 0.068 |
| **five-task mean** | 0.073 | 0.188 | 0.252 | 0.294 | 0.183 | 0.025 | **0.169** | 0.029 | 0.000 | **0.015** |
| minutes (own run) | 15.2 | 26.6 | 11.6 | 22.1 | 16.6 | 24.7 | | 17.1 | 3.2 | |
| tokens | 8.0M | 8.1M | 8.0M | 8.0M | 8.0M | 8.0M | | 1.5M | 1.1M | |

Every team ended at its 8M cap, after 11.6–26.6 minutes (a team's minutes run from its first event to its last; the batch's 27.8 and 25.8 minutes in `results/` include setup). The solo agent called `done` after 16.6 minutes (1.5M) and 3.2 minutes (1.1M). In total 50.9M tokens and $0.82 (teams 48.2M, solo 2.6M). No run failed and nothing was rerun.

**Rule as written** (screen, k=2, no verdict): the teams' per-task mean is 0.169 against the solo arm's 0.015, **+0.154**, higher on 4 of 5 tasks (expr, oxvg, tengo, wasmi) and lower on none; scriggo is 0 for everyone. By the rule the teams are **above**. Under the k=3 norm this is a screen and gives no verdict.

**Best team per repetition, chosen by the grader after the fact** (not something the system could deliver): team3 0.252 in r0, team1 0.294 in r1, mean 0.273. The spread inside one repetition is as large as between arms: 0.073–0.252 in r0, 0.025–0.294 in r1.

**What drives the margin.** As in rounds 17 E and 18, it is mostly the single agent stopping. In both repetitions its `done` reason says the work is unfinished ("The requested end-to-end features remain incomplete…"; "…the four other projects' language/optimizer changes are not implemented; the scope is substantially larger than this partial pass"). A solo `done` ends the run, while one team member's `done` leaves two teammates working, so the arms also differ in how a single quitter ends the run.

**Use of the rivals' work** (`deepswe/rivals.py`, in [`deepswe/traces21.md`](deepswe/traces21.md)):

| | team1 r0 | team2 r0 | team3 r0 | team1 r1 | team2 r1 | team3 r1 |
|---|---:|---:|---:|---:|---:|---:|
| tool calls on `/rivals` (in the first 10 min) | 13 (12) | 16 (8) | 13 (8) | 8 (8) | 10 (10) | 18 (11) |
| posts naming another team or rivals | 0 of 28 | 2 of 12 | 0 of 20 | 0 of 16 | 2 of 26 | 3 of 26 |
| `done` calls (first at) | 1 (8.4 min) | 2 (2.6 min) | 0 | 2 (5.1 min) | 0 | 1 (1.5 min) |
| last write | 14.7 min | 26.6 min | 11.4 min | 22.1 min | 16.3 min | 24.7 min |

- 78 tool calls touched `/rivals` across the six teams, about 5% of all tool calls; 14 of 18 agents made at least one, and 37 fell in the first 3 minutes, mostly listings and modification-time queries.
- **Files copied whole:** 2. In r1, team3 (finch) diffed its Scriggo `ast/ast.go` and `ast/astutil/clone.go` against team1's at 9.1 minutes and wrote the same diffs at 11.0–11.8; team1 had written them at 1.0–3.6. Scriggo scored 0 for both.
- **Partial adoptions** (transcript report, by shared added lines and read-then-write order): r0 team2 robin took team1's oxvg design after reading it at 14.5 minutes, posted a critique of it, and wrote its own version (team2 0.5, team1 0.0; 39 of team2's 55 added lines also appear in team1's diff, checked by hand); r1 team2 robin ported team1's early oxvg code (0.0); r1 team3 finch wrote a Tengo file after reading team2's (0.0, team2 0.714).
- The two best scores did not come from rivals: oxvg 0.667 (r1 team1 finch, the project's best on that task, its own work) and tengo 0.835 (r0 team3 finch, who never read `/rivals`).
- Against round 20's ST (12 agents in one swarm, 32M; a reference only): ST's first `done` came at 1.3 and 2.2 minutes; here it came at 1.5–8.4 minutes in four teams, and two teams had no `done` before the cap.

**From the transcripts** ([report](reports/2026-10-06-round21-transcripts.md), model output; the claims listed at its top checked by hand):
- **The false claim had no visible effect.** No agent doubts or tests "they cannot see your work", hides work or delays writes, and none looks for its own team under `/rivals`. Reasoning is recorded only as short titles, so belief and indifference cannot be told apart.
- **The rivalry is never restated.** No post, final text or `done` reason says ahead, behind, beat or finish above. Mentions of rivals are neutral; one is a review of a rival's oxvg patch. One agent took a rival team for a teammate ("Team1 Tengo baseline parser/compiler observed; I'll avoid overlapping…").
- **Leaving is unchanged.** All six `done` calls by team members say the work is incomplete, and none mentions the rivals (for example r1 team3 robin at 1.5 minutes: "…have not completed an implementation yet; continuing would risk conflicting with teammates' assignments").
- **A wording problem in the default briefing.** The base profile's `teamBriefing` reads "Teammates: {teammates}, equals working on the same goal…". With three agents ("finch, robin, equals working…") the agents read "equals" as a fourth teammate: 17 posts in 3 of 6 teams address or wait for "equals". No post in round 20's 12-agent runs mentions it. Changing the text changes the default and needs the user's OK.

**Record notes.** `experiments/rows/runs.json` is not regenerated: DeepSWE batches are not swarmtest runs, and their per-run data is `deepswe/results/e21-*.json` and `deepswe/traces21.md`. `deepswe/traces.py` now also reads team batches (one run per team directory).

## Round 22: three rival teams of four sharing 32M, against one swarm of 12 with 32M, on the five-task DeepSWE batch (fixed before measuring, 2026-10-06 16:30; the user's design)

**Why.** Round 21's teams of three had a quarter of a 12-agent swarm's agents and budget each, so they could not be compared with the earlier swarms. The user, in their words: "3 teams of 4 with 32 million tokens in total, to see whether they beat similar swarms with the group of rivals." The user chose, when asked: one pool of 32M shared by the three teams (not a cap per team), the mean of the three teams as the rivals' score, a new 12-agent swarm in the same round with k=3 as the comparison, and the "equals" sentence of the briefing fixed for this round only.

**Question.** At the same agents (12) and the same total budget (32M), do three rival teams of four, told to finish above each other and able to read each other's work, score higher than one swarm of 12?

**Arms:**
- **Teams** (`--arm teams --teams 3 --agents 4 --pool --tokens 32000000`, profile `n12-base-peers.json`). As in round 21 (own hub and own copy of the five repositories per team, rivals readable at `/rivals/<team>/<project>`, the same rivalry text including the false "They cannot see your work"), with two changes: four agents per team, and one token pool. Each team writes its running token total to a shared folder and counts every team's total against the 32M (new optional run option `sharedBudget` in `src/swarm.ts`; without it nothing changes). Every team stops with reason `budget` once the sum passes 32M, so a fast team can spend what a slower one would have used. Agents are not told about the pool (the base profile shows no tokens line).
- **Swarm** (`--arm swarm --agents 12 --tokens 32000000`, profile `n12-base-peers.json`): 12 agents in one swarm, the base profile: a post-only board delivered on tool results, staggered entry, write guard, clock and departure notices.
- **Profile** `n12-base-peers.json` is `n12-base.json` with one sentence changed, because in round 21 teams of three read "Teammates: finch, robin, equals working…" as a fourth teammate named "equals". New text: "Teammates: {teammates}. You are all equals working on the same goal in this folder; nobody is in charge. …". Both arms use it, so the swarm arm differs from round 20's ST and from `n12-base` by that sentence; earlier swarm numbers are a reference, not a control.

**Tasks:** round 17 E's five (expr, oxvg, scriggo, tengo, wasmi), as in rounds 19–21.

**k=3** per arm. Order alternates by repetition (teams then swarm in r0 and r2, swarm then teams in r1). 120 minutes per run. Execution: `experiments/deepswe/batch22.sh`, sidecars 5 GB and 2 CPUs, quota stop as in round 21 (STOP22).

**Score rule** (decided, k=3): the teams' score per task is the mean over the three teams, then over the three repetitions; the swarm's is its mean over the three repetitions. The teams are **better** if they are ≥ +0.05 higher on the five-task mean and higher on at least 3 of 5 tasks; **worse** if ≤ −0.05 and lower on at least 3 of 5; otherwise **not decided**. The best team of each repetition is also reported, labelled as chosen by the grader after the fact: nothing in the system could pick it without the grader.

**What is read** (descriptive):
- scores, tokens and minutes per team and per swarm run; each team's share of the pool and when the pool ran out;
- `deepswe/rivals.py`: tool calls on `/rivals` per agent and over time, files copied whole from a rival, posts naming the other teams, first `done`, last write and end reason;
- `deepswe/traces.py` for both arms;
- from the transcripts (subagent): how teams use the rivals' work, whether any agent mentions "equals" as a teammate, and how agents talk about the rivalry.

**Smoke test** (deleted afterwards): two teams of one agent on expr with `--pool` and a 0.4M pool; both must end on `budget` with neither reaching 0.4M on its own, so the sum is what binds. Plus `examples/trio.json` with the default profile; unit tests and typecheck.
- Result: both teams ended on `budget` at 0.24M and 0.18M (sum 0.42M, 4% over the pool), so the sum bound, not a team's own share; both read the rival's folder (4 and 5 calls). `examples/trio.json` (default profile) entered staggered, posted three departure notices and ended `all_done`. Unit tests (10) and typecheck pass.

**Estimate:** 64M per repetition, about 192M and $3 in total; six batches of about 30–60 minutes each including scoring, about 5 hours. The model quota stopped rounds 14 and 19; if it stops this one, the STOP22 file halts the driver and the round resumes later with the same script.

**Known threats:**
- The teams arm changes several things at once against the swarm: one swarm split into three, the rivalry text, the visibility of rivals, and the false claim. A difference cannot be assigned to one of them.
- The rivals' score is the mean team; the best team is not available without the grader.
- The pool lets one team starve the others, and teams check the pool only after each model message, so the real total lands somewhat above 32M.
- No single-agent arm in this round; round 21's solo runs are a reference only.

### Round 22: stopped by the model quota in repetition 1 (2026-10-06 19:15; batches 15:11–17:11 UTC, code `aca4e9b`)

- Valid so far: `e22-teams-r0` (teams 0.357, 0.276, 0.085; mean 0.239), `e22-swarm-r0` (0.320) and `e22-swarm-r1` (0.285). No rule is applied until all three repetitions are in.
- The pool worked as designed in `e22-teams-r0`: the three teams spent 12.7M, 12.9M and 6.6M (32.19M in total, 0.6% over the pool), so one team got about half of what the others did.
- `e22-teams-r1` hit "The usage limit has been reached" in all three teams after 16.2M; its summary is in `runs/e22-teams-r1-quota/summary-invalid.json` (contents of the untracked `invalid22.txt`: `e22-teams-r1`). It is excluded and will be rerun from scratch.
- Resume: the same `batch22.sh` after deleting `STOP22`; it skips the batches that have a result. The resumed batches run hours after the first three, so the pairing in time differs.

### Round 22 result: closed by the user with three valid batches (2026-10-06 19:40; batches 15:11–16:30 UTC, code `aca4e9b`)

The user chose to close the round after the quota stop rather than resume it. Teams have one repetition and the swarm two, so **no rule is applied and there is no verdict**; the numbers below are a screen.

| task | team1 r0 | team2 r0 | team3 r0 | **teams mean** | swarm r0 | swarm r1 | **swarm mean** |
|---|---:|---:|---:|---:|---:|---:|---:|
| expr | 0.063 | 0.025 | 0.063 | 0.050 | 0.051 | 0.013 | 0.032 |
| oxvg | 0.500 | 0.000 | 0.000 | 0.167 | 0.000 | 0.000 | 0.000 |
| scriggo | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| tengo | 0.857 | 0.857 | 0.000 | 0.571 | 0.912 | 0.868 | 0.890 |
| wasmi | 0.364 | 0.500 | 0.364 | 0.409 | 0.636 | 0.545 | 0.591 |
| **five-task mean** | 0.357 | 0.276 | 0.085 | **0.239** | 0.320 | 0.285 | **0.303** |
| tokens | 12.7M | 12.9M | 6.6M | 32.2M | 32.1M | 32.1M | |
| minutes | 13.8 | 13.9 | 13.9 | | 12.4 | 11.7 | |

- **Arithmetic of the rule, for reference only:** teams −0.063 against the swarm, higher on 2 tasks (expr, oxvg) and lower on 2 (tengo, wasmi); even at k=3 this pattern would be "not decided", since the rule needs 3 of 5. The best team, chosen by the grader after the fact, scored 0.357, above both swarm runs; the mean team did not.
- **The pool bound and was uneven.** All three teams stopped together at 13.8–13.9 minutes when the sum passed 32M (32.19M, 0.6% over). team1 and team2 spent about 12.8M each and team3 6.6M, because three of team3's four agents had called `done` by 10.7 minutes.
- 96.4M valid tokens ($1.56) plus 16.2M ($0.29) in the invalid `e22-teams-r1`.

**Use of the rivals' work** (`deepswe/rivals.py`, in [`deepswe/traces22.md`](deepswe/traces22.md)): 48 tool calls on `/rivals` (team1 21, team2 17, team3 10), mostly early duplicate-work probes and reads at 7–10 minutes. One file was copied whole: team1 robin wrote team2's Scriggo `parser_test.go` after reading it, and posted "matching rival's parser approach" (scriggo 0 everywhere). From the transcripts, team2 wren adopted team1's Tengo compiler design within a minute of reading it (checked by hand), so team2's tengo 0.857 is not independent of team1's.

**From the transcripts** ([report](reports/2026-10-06-round22-transcripts.md), model output; the claims listed at its top checked by hand):
- **team3's low score is departures.** finch called `done` at 1.0 minutes with no edit ("Need implement Tengo; currently investigation only. Continue."), wren at 5.0 and lark at 10.7; tengo and oxvg were left untouched although team1's Tengo was readable from the start. robin, alone from minute 11, asked the departed teammates which task to take next.
- **A team of four on five repositories is short-handed when one agent leaves early:** the repository of an agent who quit in the first two minutes scored 0 (team2's oxvg, team3's tengo). team1 kept all four agents and was the best team.
- **The swarm's edge on wasmi** came from splitting the change across 3–4 agents (encoder, configuration, trap integration) with cross-checks, not from more testing. Its oxvg stayed at 0 in both runs, while team1's single agent reached 0.5.
- **Rivalry and the false claim:** as in round 21, never restated, doubted or mentioned when leaving; the rivals' work was used as source material, silently.
- **Briefing fix:** no agent addressed or waited for a teammate named "equals".

## 2026-10-07: tool descriptions and briefing corrections become defaults (the user's decision: "integra las descripciones", "las correcciones pasan a default"; no measurement)

- **Tool descriptions** (reviewed against the code on 2026-10-06 in a copy, now in `src/board.ts`, `src/branches.ts`, `src/tasklist.ts`):
  - Every coordination tool now has a one-line snippet, so Pi lists it in the system prompt's `<tools>` section. Before, only Pi's own tools and `append` were listed there; `post`, `done` and the rest appeared only as tool definitions.
  - Four descriptions that were false or incomplete are fixed: `claim` now depends on `claimLease`; `finding` runs the command in the agent's working folder; `team` mentions roles; `budget` mentions the minutes left.
  - `done` says "when you judge that the goal is met" instead of "when the definition of done is met". Smaller wording changes in `post` (the `thread` parameter), `task_add`, `task_done` and `role`.
- **Briefing:** "You are {name}, an agent." instead of "…, an agent in a swarm.", which misled a single agent. The default `teamBriefing` reads "Teammates: {teammates}. You are all equals working on the same goal…", as in `n12-base-peers` (round 22): teams of three read the old "{teammates}, equals working…" as a teammate named equals.
- **Effect:** every profile that does not override these texts sees a different prompt from this commit on, including `n12-base` (its explicit old `teamBriefing` stays) and `solo-clock`. Earlier results stay valid at their own commits; comparisons across this commit are references, not controls.
- Smoke: `examples/trio.json` (3 agents, staggered, three departure notices, `all_done`) and `examples/hello.json` (1 agent) show the new briefing and the coordination tools in `<tools>`. Unit tests (10) and typecheck pass.

## Round 23: the fixed baseline, one swarm of 12 on the five-task DeepSWE batch, k=5 (fixed before measuring, 2026-10-07 08:35; the user asked for it)

**Why.** The user, in their words: "we need a baseline to compare everything against instead of duplicating launches every time." Until now every round reran its own control. The user chose, when asked, one swarm of 12 at k=5, and to test levers against early departures only after the baseline.

**What is measured.** One arm, no lever under test:
- **Baseline** (`--arm swarm --agents 12 --tokens 32000000`, profile `n12-base-peers.json`, which now equals the defaults): 12 agents in one swarm, a post-only board delivered on tool results, staggered entry, write guard, clock and departure notices, with the tool descriptions and briefing of commit `03aa568`.
- Tasks: round 17 E's five (expr, oxvg, scriggo, tengo, wasmi). 120 minutes per run. k=5 (`e23-base-r0` to `r4`). Execution: `experiments/deepswe/batch23.sh`, sidecars 5 GB and 2 CPUs, quota stop STOP23 (resumed with the same script; batches with a result are skipped).

**What is recorded:** per-task and five-task means over the five runs, their min–max and standard deviation, tokens, minutes and end reasons; `deepswe/traces.py` counts; first `done` and departures per run. No transcript analysis unless something is anomalous.

**How later rounds use it** (fixed now, before measuring):
- A later arm runs only its own batches (k≥3) on the same five tasks, 32M and 120 minutes, and is compared with the baseline's per-task means: **better** if ≥ +0.05 on the five-task mean and higher on at least 3 of 5 tasks; **worse** if ≤ −0.05 and lower on at least 3 of 5; otherwise **not decided**.
- The baseline is measured again only when something it depends on changes: a default in `src/` that alters prompts or behaviour (new default-off levers do not count), the model, the task set, or the batch setup (budget, minutes, sidecars). Each later result records its code commit, so a stale comparison is visible.
- Known cost of this choice: a later arm is no longer paired in time with its control, so drift in the model service between days goes into the comparison.

**Estimate:** 5 × 32M = 160M tokens, about $2.6; five batches of about 25 minutes each including scoring. The quota stopped round 22 after about 112M in one window, so this may need two windows.

## 2026-10-07: two new default-off levers, `reviveOnMention` and `taskAssign` (the user's ideas against early departures; no measurement)

- **`reviveOnMention`:** a post that mentions `@name`, or `@all`, wakes an agent that already called `done`, every time (the user rejected a cap and preferred this to seat relays). The departure notice says how ("Mention @wren in a post to call it back, or @all for everyone who left") and drops "for good". murmur's own notices do not count as mentions: the first smoke showed a notice's "@all" waking every departed agent in a loop until the budget ran out.
- **`taskAssign`** (with `taskList`): `task_add` takes an optional teammate (`for`), and `task_assign` hands an open item, or one the assigner holds, to a teammate. It is a request between equals: the teammate is told on the board, woken if it had called `done`, and can give the item back with `task_drop`. AGENTS.md's non-hierarchy rule now names such requests as allowed (the user's decision); fixed orchestrators and planners stay out.
- Both default off; with both off the code paths are the old ones. `revive` events log `via` (`name`, `all`, `task` or `post`) when one of them is on.
- Smoke (deleted): three agents, two leaving at once: a post without a mention woke nobody, `@wren` woke only wren, `@all` woke both, and the run ended `all_done`. Two agents with the task list: wren left, finch handed it two items (`task_add for` and `task_assign`), and wren came back each time, did them and marked them done. `examples/trio.json` with the defaults is unchanged (three departure notices, `all_done`, no revival). Unit tests (11, one new for assignment) and typecheck pass.

### Round 23 result: the baseline (2026-10-07 10:40; batches 06:30–08:28 UTC, code `0b0e12c`)

| task | r0 | r1 | r2 | r3 | r4 | **mean** | sd | min–max |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| expr | 0.202 | 0.544 | 0.557 | 0.000 | 0.797 | **0.420** | 0.316 | 0.00–0.80 |
| oxvg | 0.000 | 0.000 | 0.000 | 0.000 | 0.000 | **0.000** | 0.000 | 0.00–0.00 |
| scriggo | 0.000 | 0.750 | 0.000 | 0.000 | 0.000 | **0.150** | 0.335 | 0.00–0.75 |
| tengo | 0.945 | 0.934 | 0.857 | 0.154 | 0.857 | **0.749** | 0.336 | 0.15–0.95 |
| wasmi | 0.136 | 0.364 | 0.364 | 0.818 | 0.636 | **0.464** | 0.266 | 0.14–0.82 |
| **five-task mean** | 0.257 | 0.518 | 0.356 | 0.194 | 0.458 | **0.357** | 0.135 | 0.19–0.52 |
| minutes | 24.6 | 16.6 | 14.6 | 12.7 | 13.7 | | | |
| `done` calls (by minute 5) | 3 (0) | 7 (6) | 7 (6) | 6 (1) | 6 (2) | | | |

- All five runs ended at the 32M cap; 160.3M tokens and $2.52 in total. No run failed and the quota held.
- **This is the reference for later arms** under the rule fixed in the pre-registration (≥ +0.05 on the five-task mean and higher on at least 3 of 5 per-task means). The levers added after it (`reviveOnMention`, `taskAssign`, commit `3252fd8`) are default-off, so it stays valid.
- r1 scored scriggo 0.75, the first non-zero scriggo score in the project (two writers, heron and wren). oxvg stayed at 0 in all five runs.
- Early departures did not track the score here: the best run (r1, 0.518) had 6 of its 7 `done` calls by minute 5, the worst (r3, 0.194) 1 of 6.
- **The noise is large against the rule's threshold.** Runs of the same arm span 0.19–0.52 (sd 0.135). For an arm at k=3 against this baseline at k=5, the standard error of the difference in five-task means is about 0.10, twice the ±0.05 threshold; the 3-of-5 condition guards only partly. Single verdicts from the rule should be read with that in mind.
- No transcript analysis: nothing anomalous beyond the scriggo score. Counts are in [`deepswe/traces23.md`](deepswe/traces23.md).

## 2026-10-07: a decision rule that fits the spread (the user: "fix the rule if needed and make the spread clear"; no arm has been compared with the baseline yet)

- **The spread.** Five identical runs of the baseline (round 23) gave five-task means of 0.257, 0.518, 0.356, 0.194 and 0.458 (sd 0.135). Per task the sd is 0.27–0.34 (oxvg is 0 everywhere). The ±0.05 rule used since round 15 sits far inside that: at k=3 against k=5 the standard error of a difference is about 0.10.
- **The new rule** (replaces the one in round 23's pre-registration, before any arm was compared with it), applied by `experiments/deepswe/compare.py`:
  - each batch is one observation, its five-task mean;
  - Δ = arm mean − baseline mean; p = exact two-sided permutation test over every split of the runs;
  - **better** if p < 0.05, Δ > 0 and higher on at least 3 of 5 per-task means; **worse** if p < 0.05, Δ < 0 and lower on at least 3 of 5; otherwise **not decided**;
  - a 95% bootstrap interval for Δ is reported with every comparison.
- **What it can see.** Shifting baseline-like runs by a constant, the smallest decidable shift is about +0.25 at k=5 and +0.30 at k=3; at k=2 nothing (the smallest possible p is 0.33). Detecting +0.10 would need about 29 runs per arm. **New arms against the baseline therefore run k=5.**
- **Earlier verdicts.** Every DeepSWE verdict so far came from k=2 per arm (rounds 17 E, 18, 20, 21) and could not be decided under this rule. The large ones (12 agents against a single agent that quit early: 0.41 against 0.05, 0.56 against 0.04) are far outside the spread; the ones between swarm variants (round 20's −0.024 to −0.076) are inside it.
- Check on old data: round 22's swarm (2 runs, 0.303) against the baseline gives Δ −0.054, interval [−0.164, +0.051], p = 0.67, not decided.

## Round 24: calling departed agents back, against the fixed baseline (fixed before measuring, 2026-10-07 11:25; the user's levers, "sigue")

**Why.** Early `done` calls left work unowned in rounds 21–22. The user rejected seat relays and proposed letting teammates call a departed agent back by naming it (`@name`, `@all`), and handing tasks to a teammate, who is told and woken. Both levers are in `src/` since `3252fd8`, default off.

**Arms** (12 agents in one swarm, 32M, 120 minutes, five DeepSWE tasks, k=5 each):
- **M** (`profiles/n12-mention.json`): the baseline profile plus `reviveOnMention`. A post that mentions `@name` or `@all` wakes an agent that called `done`, every time; the departure notice says so.
- **MT** (`profiles/n12-mention-tasks.json`): M plus the shared task list with `taskAssign` (`task_add` with `for`, `task_assign`; the teammate is told, woken if it had left, and can drop the item).
- **Control:** the fixed baseline, round 23 (`e23-base-r0` to `r4`, code `0b0e12c`); it is not rerun. The code changed since only by default-off levers.

**Rule** (2026-10-07, `experiments/deepswe/compare.py`): each arm against the baseline separately: **better** if the exact permutation test on per-run five-task means gives p < 0.05, Δ > 0 and higher on at least 3 of 5 tasks; **worse** symmetric; otherwise **not decided**. With this spread only differences of about ±0.25 can be decided. MT against M is reported descriptively only.

**What is read** (descriptive): revivals per run and what caused them (`via` in `revive` events: `name`, `all`, `task`); posts that mention `@`; task-list use (items added, handed over, dropped, done); `done` calls, first `done` and work after a revival (writes by revived agents); `deepswe/traces.py` counts. A transcript analysis (subagent) after the runs: who calls whom back and why, whether revived agents work or leave again, and whether `@all` is used as a habit.

**Execution:** `experiments/deepswe/batch24.sh`, the arms alternating (M r0, MT r0, M r1, …), sidecars 5 GB and 2 CPUs, quota stop STOP24 (resume with the same script).

**Smoke:** the levers were smoke-tested when added (`3252fd8`). `examples/trio.json` with `n12-mention-tasks` loads, offers the task tools including `task_assign` in `<tools>`, and its departure notices no longer say "for good".

**Estimate:** 10 × 32M = 320M tokens, about $5; about 20–25 minutes per batch, 4 hours. The quota held for 160M on 2026-10-07 and stopped round 22 at about 112M, so this probably spans two or three windows.

**Known threats:** the code changed mid-round (`3e52e3e`, see the 2026-10-07 code review section: a mention arriving on a done result now recalls the agent instead of being lost; batches r0–r2 of M and r0–r1 of MT ran `cd5cfde`); the control is not paired in time; M and MT differ by the task list as well as by assignment, so MT's effect cannot be split between them; at k=5 effects smaller than about 0.25 stay undecided.

## 2026-10-07: code review of `src/`, `test/` and `scripts/`; two gaps closed (the user: "haz un review… quiero saber si algún fallo de la programación ha podido inducirnos a error"; then "planea y arréglalos")

The full review is `experiments/reports/2026-10-07-code-review-src-test-scripts.md`. Verdict: no sign that a bug flipped a round's verdict. Two gaps affected or could affect results, and both had been contained by process, not code:

- **Model errors were invisible to murmur.** A turn that ends with `stopReason: "error"` resolved like a normal stop: no event, the agent idle, a single-agent run ending `quiescent`. 560 October swarmtest runs: 0 murmur `error` events, 125 transcripts ending in an error; 119 are the aborts of `end()` (all in `budget`/`timeout` runs), 6 are "The usage limit has been reached" in single-agent arms (`solo-clock`, one agent with the clock, and `solo-clock-tokens`), all six already invalidated by hand above because the batch driver greps the transcripts. Round 23 and round 24 batches: none.
- **The `done` result carried unread posts and the clock.** After the departure notice told the team the agent left "for good", `attach` appended fresh posts to "You are done. End your turn now." and marked them read. In 12 of 560 runs an agent kept working after `done` (79 calls, 29 bash/write/edit; the clear case `20261004T…-22928c54/run-0001`, `n12-tasks`, dunlin: 44 calls, 19 writes). Round 23 and round 24: none. With `reviveOnMention` a mention arriving on the done result was consumed and could not recall the agent (none observed in e24 r0–r2).

**Changes** (`src/`, copied over in one step while `e24-mention-r2` ran; running containers had already loaded the old code):
- `swarm.ts`: after a turn, a last assistant message with `stopReason: "error"` logs `model_error {agent, message}` and `result.json` gets `modelErrors`; the run goes on as before (the user can invalidate post hoc; `rows.mjs` has a `model_errors` column and the swarmtest adapter passes the list in `metadata.model_errors`). `attach` appends nothing to a done result and leaves posts unread, so a mention recalls through the normal path. A `tool` for a member whose `doneReason` is set also logs `work_after_done`. The check detector is `checkMatcher()` (exported, tested); a newline that starts another statement now counts as masking the exit status (it did not).
- `profile.ts`: `taskAssign` needs `taskList`, `reviveOnMention` needs `messaging`, `notices` need `delivery: "attach"` (no existing profile violates these). Comment and docs (`AGENTS.md`, `README.md`) now name `n12-base-peers.json` as the base: `n12-base.json` keeps the old team sentence and must not be cloned.
- `scripts/traces.mjs`: relayed transcripts (`name.N`) find their done reason.
- Tests: `test/checks.test.ts`; 13 pass. Smoke: `examples/trio.json` with the defaults from the copy (`runs/20261007-115700-6b38`, deleted): passed, `all_done` in 3 agents, 121k tokens, every done result is exactly "You are done. End your turn now.", no `work_after_done`, `modelErrors: []`.

**Deviation in round 24:** batches `e24-mention-r0..r2` and `e24-mtasks-r0..r1` ran code `cd5cfde`; the remaining batches run `3e52e3e` (the user chose "ahora"). The only behavioural difference for the arms is that a mention arriving on a done result now recalls the agent instead of being lost; none was observed in the five batches run so far. The baseline is unaffected in behaviour (0 work-after-done cases, no revivals).

### Round 24 result and rule applied (2026-10-07 15:50; batches 09:19–13:14 UTC, code `cd5cfde` and, from `e24-mtasks-r2` on, `3e52e3e`)

| task | baseline (k=5) | M mean (sd) | MT mean (sd) |
|---|---:|---:|---:|
| expr | 0.420 | 0.658 (0.386) | 0.542 (0.292) |
| oxvg | 0.000 | 0.000 | 0.000 |
| scriggo | 0.150 | 0.278 (0.397) | 0.000 |
| tengo | 0.749 | 0.879 (0.069) | 0.818 (0.104) |
| wasmi | 0.464 | 0.355 (0.356) | 0.491 (0.333) |
| **five-task mean** | **0.357** (sd 0.135) | **0.434** (sd 0.186) | **0.370** (sd 0.090) |
| runs | 0.257, 0.518, 0.356, 0.194, 0.458 | 0.543, 0.639, 0.491, 0.171, 0.326 | 0.418, 0.325, 0.504, 0.311, 0.291 |

All ten batches ended at the 32M cap after 9.7–19.6 minutes; 320.4M tokens, $5.03. No run failed, no model error, and the quota held.

**Rule as written** (`compare.py`, each arm against the baseline):
- **M** (`reviveOnMention`): Δ +0.077, 95% interval [−0.111, +0.256], p = 0.46, higher on 3 of 5 tasks: **not decided**.
- **MT** (M plus the task list with `taskAssign`): Δ +0.013, interval [−0.112, +0.141], p = 0.85: **not decided**.
- MT against M (descriptive): Δ −0.064, p = 0.50.

**What the levers did** (events; revivals by cause from the `revive` events):

| | r0 | r1 | r2 | r3 | r4 |
|---|---|---|---|---|---|
| M: `done` calls (first) | 8 (1.2) | 6 (0.6) | 3 (7.8) | 5 (1.6) | 4 (1.0) |
| M: revivals | 1 name | 1 name | 0 | 1 name | 2 name |
| MT: `done` calls (first) | 5 (1.7) | 8 (1.4) | 8 (1.6) | 4 (2.3) | 4 (1.6) |
| MT: revivals | 0 | 3 name, 4 all | 0 | 0 | 1 name |
| MT: items added / handed over / done | 13 / 10 / 4 | 10 / 6 / 0 | 11 / 6 / 3 | 9 / 6 / 0 | 0 / 0 / 0 |

- **Calling back works but is rarely used.** Of 174 `@name` mentions in agents' posts, 8 reached an agent that had left, and nearly each one revived it. Revived agents worked: 4–30 write/edit calls after their revival, and in M r0 plover, called back to "rejoin" on expr at 4.0 minutes, built the parser slice of a run that scored expr 1.0. Agents treat a departure as final: they take over the leaver's repository ("Finch called done on oxvg, so I'll take over oxvg") rather than call it back. Only two callbacks were deliberate; `@all` was used once (MT r1, 15.0 minutes), woke four agents who offered the same slice, and added nothing (wasmi 0: the patch broke the existing tests).
- **Early departures are unchanged.** 0–6 agents per run still leave within 4 minutes with no edit, for the baseline's reason ("All five repositories have active owners…"), and the levers do not touch that decision: nobody calls back an agent that left because there was nothing for it to do.
- **The task list is used as a plan.** The first agent to enter writes a five-item list and hands every item out at 0.2–0.5 minutes; a second agent often builds a competing list, and duplicates are dropped. Few items reach `task_done` (7 of 43). No revival came through a task: every hand-over went to an agent still present. In MT r4 nobody used the list.
- The spread between runs of the same arm is as large as before (M 0.17–0.64): M r3 (0.171) spread wasmi over five agents and ended with three repositories that did not compile at the cap.

**Deviation.** The code changed mid-round (`3e52e3e`, see the 2026-10-07 code review section): batches M r0–r2 and MT r0–r1 ran `cd5cfde`, the rest `3e52e3e`, whose done result no longer carries unread posts. No revival was lost to the old behaviour in the first five batches (noted at the time), and no agent worked after `done` in any batch.

Transcript analysis: [report](reports/2026-10-07-round24-transcripts.md) (model output; the claims listed at its top checked by hand). Counts: [`deepswe/traces24.md`](deepswe/traces24.md).

## 2026-10-07: `clockEffective`, a clock that counts the budget (the user asked whether the tokens line deserved another test; no measurement)

- **Why not the tokens line again.** `clockTokens` ("[12.3M tokens left in the budget shared by all agents]") was tested in round 15 C (confounded with a longer clock), round 16 A (no effect: the single agent still stopped at 0.06–1.2M of 12M) and round 17 E (STT 0.408 on this batch, inside the spread). No agent ever mentioned it. In the DeepSWE swarms the clock reads about 100 minutes left while the budget runs out at 10–20 minutes, so agents never know when the end is.
- **New default-off lever `clockEffective`** (with `clock`): when the token budget would run out before the timeout at the pace of about the last two minutes (pooled with `sharedBudget` if set), the clock line reads "[about 6.8 minutes left: at the team's current pace the shared budget runs out before the timeout]"; before 30 s of pace it shows the timeout as usual.
- Smoke (deleted): one agent looping `sleep 4; date` with 120k and 10 minutes switched to the budget line after 30 s and reached 0 when the budget ran out at 4.2 minutes; early estimates run high (6.8 shown at 0.6 minutes, 3.6 real) because turns grow more expensive as the context grows.
- **Fix found by the roles smoke:** a profile with `roles` but without "role" in `boardTools` silently offered no role tool (since 2026-10-06, `boardTools` defaults to `["post"]`). `loadProfile` now rejects it; `c2-roles.json`, which relied on the old default, no longer loads.

## Round 25: roles without owners, and a clock that counts the budget, against the fixed baseline (fixed before measuring, 2026-10-07 21:36, the commit time; the heading first said 19:25 by mistake; the user's design, "lanza")

**Why.** In rounds 23–24 most early departures gave the same reason: every repository already had an owner, so there was nothing left for the agent. The user: drop ownership, and add roles beyond building (builder, verifier, reviewer, researcher, plus five more identified from observed failures: tester, integrator, fixer, scout, finisher), chosen on entry after looking at the state, and switched instead of leaving. Separately, the clock reads about 100 minutes left while the budget runs out at 10–20 minutes, so agents never see the end coming; `clockEffective` (commit `7e3c32b`) shows the minutes until the budget runs out at the current pace.

**Arms** (12 agents in one swarm, 32M, 120 minutes, five DeepSWE tasks, k=5 each):
- **R** (`profiles/n12-roles9.json`): the baseline profile with a new team sentence ("nobody owns a project: anyone may work on any project…"; "Before you start, look at the projects and the board, then take a role…; when your role has nothing left to do, take another role instead of calling done") and a nine-role menu (`role` tool; the briefing shows one line per role, the instructions come when the role is taken).
- **RC** (`profiles/n12-roles9-clock.json`): R plus `clockEffective`.
- **Control:** the round 23 baseline, not rerun (code since: default-off levers, `3e52e3e`'s done-result change and model-error logging, and profile validation).

**Rule** (`experiments/deepswe/compare.py`): each arm against the baseline: better if the exact permutation test on per-run five-task means gives p < 0.05, Δ > 0 and higher on at least 3 of 5 tasks; worse symmetric; otherwise not decided. RC against R is descriptive only.

**What is read:** role choices per agent and over time (`role` tool calls), switches, `done` calls and when (first `done`, departures within 4 minutes, zero-edit departures), the clock line agents saw and whether anyone mentions the time or budget, write/edit spread over the repositories, and a transcript analysis (subagent): whether agents still leave because "everything is covered", what each role actually did, and whether finishers reverted or repaired broken work near the end.

**Smoke:** `examples/trio.json` with `n12-roles9-clock`: every agent took a role on entry and switched roles before leaving (10 `role` calls: builder, reviewer, tester, verifier, finisher). The first smoke offered no role tool (the `boardTools` default); fixed and validated in `7e3c32b`. Unit tests (13) and typecheck pass.

**Estimate:** 10 × 32M = 320M tokens, about $5; about 4 hours.

**Known threats:** the control is not paired in time and ran slightly older code; R changes the team sentence and adds the roles at once, so its effect cannot be split between them; RC differs from R only by the clock line; at k=5 only differences of about ±0.25 are decidable.

### Round 25 result and rule applied (2026-10-08 09:10; batches 2026-10-07 19:36 UTC to 2026-10-08 00:50 UTC, code `7f6d59e`)

| task | baseline (k=5) | R mean (sd) | RC mean (sd) |
|---|---:|---:|---:|
| expr | 0.420 | 0.086 (0.066) | 0.076 (0.028) |
| oxvg | 0.000 | 0.000 | 0.133 (0.298) |
| scriggo | 0.150 | 0.146 (0.326) | 0.000 |
| tengo | 0.749 | 0.609 (0.405) | 0.375 (0.482) |
| wasmi | 0.464 | 0.364 (0.000) | 0.364 (0.000) |
| **five-task mean** | **0.357** | **0.241** (0.116) | **0.190** (0.094) |
| runs | 0.257, 0.518, 0.356, 0.194, 0.458 | 0.190, 0.085, 0.269, 0.257, 0.403 | 0.241, 0.088, 0.257, 0.088, 0.274 |

285.1M tokens, $4.53. R's runs all ended at the 32M cap after 12–21 minutes; RC's ended by `done` (`all_done` or `quiescent`) after 21–40 minutes with 20.7–28.1M spent. No run failed, no model error, and the quota held.

**Rule as written** (`compare.py`, each arm against the baseline):
- **R** (no owners, nine roles): Δ −0.116, 95% interval [−0.254, +0.024], p = 0.20, lower on 4 of 5 tasks: **not decided**.
- **RC** (R plus `clockEffective`): Δ −0.167, interval [−0.296, −0.039], p = 0.071, lower on 4 of 5: **not decided** (the interval excludes 0, the permutation test does not reach 0.05).
- RC against R (descriptive): Δ −0.051, p = 0.52.

**Process** (events):

| | baseline | R | RC |
|---|---|---|---|
| `done` calls per run | 3–7 | 0–1 | 11–12 (near the end) |
| write/edit calls per run | 125–165 | 82–125 | 53–84 |
| expr write/edit calls per run | 17–53 | 5–42 | 4–14 |
| role calls per run | — | 42–65 | 58–73 |
| tool calls per run | 894–1011 | 925–1043 | 849–933 |

- **The roles stopped the early departures**: 3 `done` calls in five R runs, each followed by another role. Nobody idled.
- **But less was built.** First roles taken by the 120 R and RC agents: builder 47, scout 27, researcher 20, verifier 12, reviewer 9, tester 3, integrator 2. At the same number of tool calls, write/edit calls fell by about a quarter in R and by half in RC, and re-running test suites rose (Rust test/build commands per run: baseline 18–31, RC 58–94). Reviewer, verifier, scout and tester work was partly real (a reviewer's Tengo defect fixed within two minutes; the oxvg 0.667 in RC r0 came from scouts flagging oxvg untouched and a scout-turned-builder posting the fix path) and partly status posts on unfinished code ("tree still clean").
- **Expr collapsed** (0.08 against 0.42): in 8 of 10 role runs expr ended with only the `throw`/`errtype` builtins; ownership re-formed in the first minute despite "nobody owns a project", and the one agent on expr built the easy slice, posted what remained, and took another role ("…full try/fallback, block catch/finally/retry remains unimplemented", then "I take the role reviewer"). The builder text ("if a teammate is building the same part … take another part") encourages slicing.
- **The budget clock made the team wrap up and stop with budget left.** Agents read the line ("Only ~7 minutes shared budget. I'll finalize…"; `done`: "cannot be completed safely in the remaining time"), switched together to review, test and finish, which burned the budget faster and dropped the estimate further (r2: 8.5M in three minutes, the line falling from 30.7 to 4.2 minutes), and then called `done` with 4–11M unspent. The estimate itself is noisy (implied end 17–116 minutes). RC's wall time was also longer from build-lock contention (blocked or timed-out bash results per run: baseline 1–12, R 17–30, RC 29–83). No finisher reverted teammates' work.
- Role announcements add 42–73 automatic posts per run; agents' own posts are about as many as in the baseline.

Transcript analysis: [report](reports/2026-10-08-round25-transcripts.md) (model output; the claims listed at its top checked by hand). Counts: [`deepswe/traces25.md`](deepswe/traces25.md).

## Round 26: roles that mostly build, with the task list as the channel for findings, against the fixed baseline (fixed before measuring, 2026-10-08 08:05; the user approved the proposal, "si, preparalo asi")

**Why.** In round 25 the roles ended the early departures but half of the calls went to roles that do not build, their findings stayed as status posts nobody turned into work, and builders sliced the work so that the hard core of expr was left undone. The task list costs 3–9% of calls (round 24), but there it became an up-front plan handed out by the first agent. The user's idea: non-builders add tasks.

**Arm RT** (`profiles/n12-roles9-tasks.json`; 12 agents, 32M, 120 minutes, five DeepSWE tasks, k=5), changed from R (round 25) in three ways at once:
- **The task list as the findings channel:** `taskList` on, no `taskAssign`, the list starts empty. The team sentence: "Whoever finds something concrete to do (a defect, a failing test, a missing requirement) adds it to the task list with how to reproduce it; builders and fixers take items from it. Post only what someone can act on." Reviewer, verifier, tester, researcher, integrator and scout add their findings with `task_add`; the fixer takes items.
- **Building by default:** "Most of the team should be building… take a role…: builder, unless you see a need for another role right now (a broken build, a change nobody has reviewed or tested, a project nobody is advancing)." Roles are still taken on entry and switched instead of leaving.
- **No slicing:** the builder joins "the hardest unfinished part of a project over an easier separate one", splitting it with the teammates already on it by file or function; the "take another part" sentence is gone.
- No `clockEffective`.

**Control:** the round 23 baseline (not rerun). R (round 25) is a descriptive reference only.

**Rule** (`compare.py`): better if p < 0.05, Δ > 0 and higher on at least 3 of 5 tasks; worse symmetric; otherwise not decided.

**What is read:** the share of tool calls by role and the share of write/edit calls (baseline 125–165 per run, R 82–125); task items added by non-builders, taken, done and dropped; first roles; `done` calls; work on expr's core (parser, compiler, VM) and whether expr's change goes beyond the builtins; a transcript analysis (subagent) on whether findings turn into work and whether builders gang up on hard parts or still slice.

**Smoke:** `examples/trio.json` with `n12-roles9-tasks`: all three agents took builder on entry, read the task list (4 calls), switched roles before leaving (8 `role` calls) and ended `all_done`; no task was added (the task has no defects to find).

**Estimate:** 5 × 32M = 160M tokens, about $2.5; about 2 hours.

**Known threats:** RT changes three things against R at once (task list, building by default, no slicing), so a difference cannot be assigned to one of them; the control is not paired in time; at k=5 only differences of about ±0.25 are decidable.

### Round 26 result and rule applied (2026-10-08 09:55; batches 06:04–07:37 UTC, code `f602660`)

| task | baseline (k=5) | R (round 25) | RT mean (sd) |
|---|---:|---:|---:|
| expr | 0.420 | 0.086 | 0.352 (0.281) |
| oxvg | 0.000 | 0.000 | 0.000 |
| scriggo | 0.150 | 0.146 | 0.140 (0.227) |
| tengo | 0.749 | 0.609 | 0.752 (0.370) |
| wasmi | 0.464 | 0.364 | 0.218 (0.199) |
| **five-task mean** | **0.357** | **0.241** | **0.292** (0.131) |
| runs | 0.257, 0.518, 0.356, 0.194, 0.458 | 0.190, 0.085, 0.269, 0.257, 0.403 | 0.438, 0.257, 0.088, 0.349, 0.330 |

160.1M tokens, $2.63. Every run ended at the 32M cap after 9.4–17.3 minutes (R 12–21). No run failed, no model error, and the quota held.

**Rule as written** (`compare.py` against the baseline): Δ −0.064, 95% interval [−0.214, +0.078], p = 0.44, higher on 1 of 5 tasks and lower on 3: **not decided**. Against R (descriptive): Δ +0.051, p = 0.52, higher on 2 (expr +0.27, tengo +0.14) and lower on 2 (wasmi −0.15).

**Process** (events; short scripts over `events.jsonl`, role at a call = the agent's latest `role` call):

| | baseline | R | RT |
|---|---|---|---|
| first roles (of 60) | — | builder 23, scout 15, researcher 12, verifier 8, tester 1, reviewer 1 | builder 49, scout 6, verifier 4, reviewer 1 |
| builder share of tool calls per run | — | 39–54% | 48–79% (plus fixer 6% in r4) |
| `done` calls per run | 3–7 | 0–1 | 0 |
| role calls per run | — | 42–65 | 26–39 |
| write/edit calls per run | 125–165 | 82–125 | 119–150 |
| tool calls per run | 894–1011 | 925–1043 | 955–1067 |

- **Building came back** to the baseline's level: write/edit calls 119–150 per run, against 82–125 in R, and 49 of 60 agents took builder on entry.
- **The task list:** 44 items in five runs (11, 4, 8, 9, 12). 31 were added by non-builders; 17 of those were taken by a different agent (within 0.1–12 minutes, most within 2), and 8 of the 17 were marked done; 8 more were taken by their own adder. The 13 items added by builders or fixers were mostly self-claims (10). 5 items were dropped.
- **Expr reached its core in 4 of 5 runs** (R: 1 of 5): the final diff touches parser, compiler and VM in r0, r2 and r3, compiler and VM in r4; r1 stayed at the builtins (0.063). Scores 0.81, 0.06, 0.34, 0.20, 0.34.
- **Wasmi fell** (0.218 against 0.464) because the final build did not compile in r0 and r2 (score 0; r0: duplicate definitions of `coredump_frames` and a missing struct field). Broken builds at the end also happened in earlier arms (baseline scriggo three times, M wasmi twice).
- Oxvg stayed untouched or nearly (0–11 write/edit calls per run), as in the baseline.

**From the transcripts** (subagent report, key claims checked by hand):
- **The list carries small defects, not the hard parts.** Of the 44 items, 18 were reproducible defects and 26 plans, gaps or status ("X has no diff yet" moved from the board to the list; 14 items came from scouts). Small compile and test defects were taken within 0.1–1.4 minutes and fixed. Hard gaps waited: in r3, crane's item for expr's block try/catch ("No task currently tracks this uncovered half", 1.1 min) was taken and dropped at 7.6–7.7 and staffed only at 12.4; wasmi's "dump is empty" stayed open 11.5 minutes in r4. Defect reports with repro commands still went mostly to the board.
- **Ganging up on the hard part happened once.** In r0 the expr starter asked at 1.2 minutes for help on the try/catch/finally core; five agents wrote expr within 2.4 minutes, split by layer, and it scored 0.81. In r2–r4 the second writer arrived at 8–16 minutes, mostly on the easier `try(expr, fallback)` form; in every run the first writer built the builtins first. In r1 the first agent scoped expr to the builtins in its own task item ("plus try function if feasible") and a teammate read it as ownership ("Expr finch owns try/catch builtins"); expr got 9 edits and scored 0.06.
- **Ganging up without coordination broke wasmi in r0:** after one agent asked for accessors in `state.rs` at 8.2 minutes, four agents wrote their own `coredump_frames` there within 1.1 minutes (two task items for the same request, each taken by its own adder), and the build ended with duplicate definitions. In r2 the break was one edit at the cap (`Vec` without its import, 10.7 minutes, nothing built after). Nobody joined wasmi's coredump capture until the last minutes.
- Tengo r2 (0.10) is one panic in the parser that stops the whole test package (9 of 91 tests run).

Transcript analysis: [report](reports/2026-10-08-round26-transcripts.md) (model output; the claims listed at its top checked by hand). Counts: [`deepswe/traces26.md`](deepswe/traces26.md).

## 2026-10-08: housekeeping after round 26 (the user: "si" to each pending item; no measurement)

- **A lone agent gets no team sentence.** With `messaging` on and one agent, the briefing read "Teammates: none. You are all equals…". `briefing()` in `src/swarm.ts` now leaves the team sentence out when there is only one agent (in the same commit as this note, "Leave out the team sentence when an agent has no teammates"). This changes the briefing of every single-agent run whose profile keeps `messaging` on, notably the strong single agent c4n1 (`c4g-*` profiles, one agent with messaging, the clock and the guards) used to calibrate tasks: its earlier calibrations ran with the contradictory sentence. Profiles with `messaging: false` (`solo*`) and every multi-agent profile are unchanged (smoke: `examples/hello.json` briefing without the sentence, `examples/trio.json` with it for all three agents).
- **`profiles/c2-roles.json` stays as an old profile.** It no longer loads, because roles now require `role` in `boardTools`; it is not edited in place and not reused.
- The sixteen 2026-10-06 reports linked from this notebook are now committed.

## Round 27: roles that build from the heaviest item of a weighted, shared task list, against the fixed baseline (fixed before measuring, 2026-10-08 12:01; the user approved the proposal, "si, esa combinacion me parece bien")

**Why.** In round 26 (RT) building came back and expr reached its core in 4 of 5 runs, but the agents took the easy work first: small defects on the task list were taken within a minute, hard gaps waited about 11 minutes, and in every run the first agent on expr built the builtins before the syntax. Builders ganged up on the hard part once (r0, five agents split by layer, expr 0.81), after the first agent named the parts and asked for help. Prompts that set a concrete default action worked ("builder, unless…": 49 of 60), prompts that ask for a judgment did not ("nobody owns a project" in R, "join the hardest unfinished part" in RT). The design turns "the hardest part" into an observable rule: weights on the list and "take the heaviest". The list also allowed one holder per item, which works against several builders on one hard part (2 refused takes in round 26).

**Two new levers, default off** (commit of this pre-registration; unit tests in `test/tasklist.test.ts`):
- `taskWeights`: with `taskList`, `task_add` requires a weight from 1 to 10 for how much of the goal the item covers, and `tasks` lists unfinished items heaviest first.
- `taskShared`: with `taskList`, `task_take` on an item a teammate holds joins its holders instead of failing ("You share it with …"); any holder may mark it done; the item reopens once every holder dropped it. The task list's internals now keep a list of holders; with the lever off, behaviour is as before (same messages and refusals).

**Arm RW** (`profiles/n12-roles9-weights.json`; 12 agents, 32M, 120 minutes, five DeepSWE tasks, k=5): RT (round 26) plus both levers and two prompt changes:
- team sentence: "Every item on the list has a weight from 1 to 10 for how much of the goal it covers, and tasks shows the heaviest unfinished items first. The first of you to work on a project that is more than one piece of work adds its parts to the task list, each with its weight, before writing code. Several of you can take the same item, and the heavy ones need more than one builder."
- builder: "Call tasks and take the heaviest unfinished item you can work on (task_take), even if teammates already hold it: you join them, and you agree on the board how to split it by file or function and on names and interfaces. If the project you start on has no items yet, first add its parts to the task list with their weights (task_add). Mark an item done (task_done) when the whole item works, not one part of it." (The rest of the builder text and the other eight roles are unchanged.)

**Control:** the round 23 baseline (not rerun; the code since only adds default-off levers and the lone-agent briefing fix, which does not touch 12-agent runs). RT (round 26) is a descriptive reference.

**Rule** (`compare.py`): better if p < 0.05, Δ > 0 and higher on at least 3 of 5 tasks; worse symmetric; otherwise not decided. RW against RT is descriptive only.

**What is read:** weights given (distribution, and whether hard parts get high weights); share of items taken by more than one holder, and how many holders; time from adding a heavy item (weight ≥ 7) to its first and second take; whether the first agent on a project decomposes it before writing code, and duplicate decompositions; per-task writers on expr and wasmi and whether they split by file; expr's core in the final diff; same-file collisions and broken final builds; write/edit calls and builder share as in round 26; a transcript analysis (subagent).

**Smoke** (code of this commit): a scripted three-agent task forcing the behaviour: one agent added "small" (weight 2) and "big" (weight 9), all three took "big" (`task_take` with `with: [...]`), each saw "taken by finch, robin, wren", sorted heaviest first, and each `done` released it. `examples/trio.json` with RW: three builders, six weighted items (weights 3–4) added before any code, one shared take, `all_done`, 0.41M tokens; two agents decomposed the project at the same time, so each part appeared twice. Default-profile `examples/trio.json`: `all_done`, unchanged.

**Estimate:** 5 × 32M = 160M tokens, about $2.6; about 1.5 hours.

**Known threats:** RW changes four things against RT at once (weights, shared holding, decomposition first, take-the-heaviest), so a difference cannot be assigned to one of them; agents may inflate weights or decompose the same project twice (seen in the smoke); shared holding may bring more same-file collisions (wasmi r0 in round 26); the control is not paired in time; at k=5 only differences of about ±0.25 are decidable.

### Round 27 result and rule applied (2026-10-08 13:45; batches 10:01–11:25 UTC, code `7e54b16`)

| task | baseline (k=5) | RT (round 26) | RW mean (sd) |
|---|---:|---:|---:|
| expr | 0.420 | 0.352 | 0.369 (0.341) |
| oxvg | 0.000 | 0.000 | 0.000 |
| scriggo | 0.150 | 0.140 | 0.093 (0.208) |
| tengo | 0.749 | 0.752 | 0.886 (0.082) |
| wasmi | 0.464 | 0.218 | 0.409 (0.356) |
| **five-task mean** | **0.357** | **0.292** | **0.351** (0.100) |
| runs | 0.257, 0.518, 0.356, 0.194, 0.458 | 0.438, 0.257, 0.088, 0.349, 0.330 | 0.192, 0.431, 0.355, 0.337, 0.442 |

160.2M tokens, $2.67. Every run ended at the 32M cap after 8.7–11.8 minutes. No run failed, no model error, and the quota held.

**Rule as written** (`compare.py` against the baseline): Δ −0.005, 95% interval [−0.138, +0.122], p = 0.91, higher on 1 of 5 tasks and lower on 3: **not decided**. Against RT (descriptive): Δ +0.059, p = 0.43, higher on 3 (tengo, wasmi, expr) and lower on 1 (scriggo).

**Process** (events; short scripts over `events.jsonl`, role at a call = the agent's latest `role` call):

| | baseline | RT | RW |
|---|---|---|---|
| first roles (of 60) | — | builder 49 | builder 51, scout 5, researcher 2, tester 1, verifier 1 |
| builder share of tool calls per run | — | 48–79% | 57–85% |
| `done` calls per run | 3–7 | 0 | 0–1 |
| write/edit calls per run | 125–165 | 119–150 | 104–183 |
| task items per run | — | 4–12 | 16–25 |

- **Weights were inflated:** of 97 items, 70 had weight 7 or more and 32 had weight 10 (1: 1, 3: 6, 4: 8, 5: 7, 6: 5, 7: 11, 8: 22, 9: 5, 10: 32). Projects were mostly decomposed into two to six items within the first minute, before the first edit.
- **Heavy items were taken at once, mostly by their author:** of the 70 items with weight 7 or more, 33 were first taken by the agent that added them, 25 by another agent (mostly within 0.5 minutes), and 12 never.
- **Shared holding was used but rare:** 21 of 97 items had two or more distinct takers (up to four).
- **Expr:** the final diff reaches parser, compiler and VM in 4 of 5 runs, but scores spread from 0 to 0.76: r2 had no edit on expr at all (0), r0 touched the core and scored 0.025, r3 had a single writer and scored 0.759.
- **Broken builds or existing tests at the end:** wasmi r0 (0), scriggo r3 (existing tests 1.5% passing) and r1 (62%), oxvg r1 and r3 (no existing test passing; oxvg scores 0 in every arm).

**From the transcripts** (subagent report, key claims checked by hand):
- **Weights tell building from repair, not hard from easy.** In 17 of 25 run × project pairs the first agent added the whole project as one item (12 at weight 10); "implement" items averaged 8.8, tests 6.5, fixes 5.9. Hard parts (wasmi frame capture, expr's syntax) got the same weights as the rest; expr r4 is the one clean case (builtins 4, syntax 10).
- **Decomposition came first, but mostly as one item per project.** Every project's first item came before its first edit (25 of 25), but only 8 of 25 first adders split the project into parts. Duplicate whole-project items (13 in 4 runs) were a race: **all 12 agents entered within 0.66–0.73 minutes**, so `spawnAfterTurns: 2` staggers by about 4 seconds; in r3 wren added an item for every project in the first 0.45 minutes and swift added wasmi again 0.01 minutes later, having listed the tasks 0.02 minutes before.
- **Joining a held item worked when it was early and split by layer on the board** (tengo r4, wasmi r2: 0.857 and 0.773); in 9 of 24 shared items a sharer never edited the project.
- **Expr:** r2 had no edit at all: finch and swift each posted at 0.4–0.6 minutes that the other had expr, and finch then sat in a long test run until the cap (0). In r0 three agents split expr by layer and nobody took the checker: the grader stops at `panic: undefined node type (*ast.TryNode)` (0.025). In r3 a single writer went through builtins, VM, compiler, parser, AST and checker, running the suite after each (0.759).
- **Breaks at the end:** wasmi r0 ended on one agent's edit at 8.6 minutes (`state` used where the parameter is `_state`), after a duplicate-definition fight in `state.rs` on a shared item; oxvg r1/r3 and scriggo r3 were single writers' late edits. Long cold builds (oxvg `cargo test`) blocked 3–4 agents for 6–9 minutes per run, as in earlier arms.
- **More staggered entry** (the user's question): it would remove the duplicate-add race and plausibly the r2 deferral, but not the stalls, the late breaks or the unowned layer; with the budget gone in 9–12 minutes, a larger gap also delays the last agents (model reading, not tested).

Transcript analysis: [report](reports/2026-10-08-round27-transcripts.md) (model output; the claims listed at its top checked by hand). Counts: [`deepswe/traces27.md`](deepswe/traces27.md).

## Round 28: RW with parts read from the code, a weight guide, a slower stagger and three working rules, against the fixed baseline (fixed before measuring, 2026-10-08 16:05; the user's design, "bien, perfecto, preparalo asi")

**Why** (measured on round 27's events, `e27-rweights-r0..4`):
- **Items were added before anyone read the code.** In 22 of 25 run × project pairs, the first agent to add an item for a project had made no tool call inside that project's repository; it had read the task description only. The first `task_add` of each run came at the agent's turn 3–6, 9–14 seconds in. This explains the whole-project items (17 of 25).
- **Entry barely staggered.** Each agent entered 2–7 seconds after the previous one; all 12 were in within 40–44 seconds. In 11 of 25 projects, 2–4 agents added items before anyone wrote code (the duplicate decompositions). `spawnAfterTurns: 2` passes after two turns, and a turn lasts a median 3.7 seconds.
- **Agents read the code before they write.** A project's first write came at its writer’s turn 12–31 (median about 20), 41–130 seconds in for 24 of 25 (oxvg r4: 11 minutes).
- **Simulation of a larger gate**, made by shifting each agent's real token stream (no change in behaviour assumed, so only a rough guide):
  - 15 turns or 60 seconds: the last agent enters at 6–8 minutes, the run ends at 11–15 minutes;
  - 20 turns or 75 seconds: the last agent enters at 9–11 minutes, the run ends at 13–17 minutes;
  - the current gate: the last agent enters at 0.7 minutes, the run ends at 9–12 minutes.
  - A time ceiling is needed, because one turn can be a 6-minute build (oxvg).
- **The user's decisions:**
  - Stagger much more.
  - The weights get a guide by bands, not a rule that a project's parts add up to 10 ("evitará que añadan mas tareas si ya suman 10, cada bug encontrado por el camino debe poder añadirlo").

**Arm RP** (`profiles/n12-roles9-parts.json`; 12 agents, 32M, 120 minutes, five DeepSWE tasks, k=5). It is RW (round 27) with profile changes only; there is no code change:
- **Stagger:** `spawnAfterTurns: 15` (was 2). `spawnGapSeconds: 60` is unchanged and is now the ceiling: each agent enters about 50 seconds after the previous one.
- **Weight guide**, in the team sentence and in `task_add`'s description (`toolDescriptions`): "1-3 for a detail fixed in one place (a bug found on the way, a missing import, a test, an edge case); 4-7 for one part of a change that can be built and tested on its own (a function, a file, a layer); 8-10 for most of a project, several parts together, which is split into parts before anyone builds it." The weight parameter's own description in `src/` ("1 is a detail, 10 is most of a project") is unchanged.
- **Team sentence:**
  - "The first of you to work on a project reads the code the change touches, then adds its parts to the task list, each with its weight, before writing code. Whoever finds more work on the way, however small, adds it too."
  - "Take an item only when you start on it now, and say on the board which part you are writing; before you move to other work, drop what you hold (task_drop)."
  - "When you finish a change, build its project: if your change broke the build, fix it or undo it before anything else." The proposal said "after every edit"; it was narrowed to "a change" because an oxvg build takes minutes.
- **Builder:** "If the project you start on has no items yet, or one item for the whole project, first read the code the change touches, then add its parts (task_add): one item for each piece that can be built and tested on its own, with its weight." The rest of RW's text and the other eight roles are unchanged.

**Control:** the round 23 baseline. It is not rerun, because the code is the same as round 27 (`7e54b16` plus the record commits). RW (round 27) and RT (round 26) are descriptive references.

**Rule** (`compare.py`): better if p < 0.05, Δ > 0 and higher on at least 3 of 5 tasks; worse is symmetric; otherwise not decided. RP against RW is descriptive only.

**What is read:**
- **Entry:** entry times, and how many agents are in when each project gets its first item.
- **Before the first item:** the first adder's code reads in the repository before that item.
- **Decomposition:** parts per project before its first write, and whole-project items (weight 8–10 that are never split).
- **Weights:** their distribution by band, and items added after the first write (bugs found on the way).
- **Duplicates:** projects with 2 or more adders before the first write.
- **Holding:** drops, and holders who never edit the project.
- **Builds:** broken builds at the end.
- **Expr:** writers and its core in the final diff.
- **Spend:** tokens per agent (the last entrants' share).
- **Transcripts:** a transcript analysis (subagent).

**Smoke** (this profile, `examples/trio.json` with 3 agents): `all_done` in 101 seconds, 0.28M tokens.
- wren read `test_trio.py`, then added three parts (weights 4, 5, 4) at turns 5–7, and said on the board which one it was writing.
- finch entered at 25 seconds, at wren's 15th turn. Its first `tasks` showed the three parts, and it took a different one.
- robin entered at 79 seconds, when finch ended its turn.
- There was no code change, so no default-profile run was needed.

**Estimate:** 5 × 32M = 160M tokens, about $2.7. Runs should last longer than round 27's (the simulation gives 11–15 minutes), so the round takes about 1.5–2 hours.

**Known threats:**
- RP changes several things against RW at once (stagger, reading before adding, weight guide, three working rules), so a difference cannot be assigned to one of them.
- The later entrants get less of the budget.
- Reading code first may move the first item past the 15-turn gate, so that the second agent enters to an empty list.
- The control is not paired in time.
- At k=5 only differences of about ±0.25 are decidable.

### Round 28 result and rule applied (2026-10-08 18:05; batches 14:01–15:57 UTC, code `e1d84cf`)

The heading above says 16:05. The pre-registration commit `e1d84cf` is dated 16:01, and that commit time is what fixes it.

| task | baseline (k=5) | RW (round 27) | RP mean (sd) |
|---|---:|---:|---:|
| expr | 0.420 | 0.369 | 0.524 (0.415) |
| oxvg | 0.000 | 0.000 | 0.000 |
| scriggo | 0.150 | 0.093 | 0.150 (0.335) |
| tengo | 0.749 | 0.886 | 0.866 (0.073) |
| wasmi | 0.464 | 0.409 | 0.573 (0.330) |
| **five-task mean** | **0.357** | **0.351** | **0.422** (0.104) |
| runs | 0.257, 0.518, 0.356, 0.194, 0.458 | 0.192, 0.431, 0.355, 0.337, 0.442 | 0.446, 0.279, 0.520, 0.356, 0.511 |

- **Spend:** 160.2M tokens, $2.61. Every run ended at the 32M cap, after 12.7–14.4 minutes; the simulation had given 11–15.
- **Validity:** no run failed, there was no model error, and the quota held. `srcDirty` was false in every run.

**Rule as written** (`compare.py` against the baseline):
- Δ +0.066, 95% interval [−0.069, +0.198], p = 0.39.
- Higher on 3 of 5 tasks (expr, tengo, wasmi), lower on none.
- **Not decided.**
- RP's mean is the highest of any arm against this baseline so far. The difference is still well inside the noise.
- Against RW (descriptive): Δ +0.071, p = 0.25. RP is higher on expr, wasmi and scriggo, and lower on tengo (−0.02).

**Process** (events; short scripts over `events.jsonl`, the same scripts for both arms):

| | RW | RP |
|---|---|---|
| all 12 agents entered within | 0.7 min | 6.4–8.7 min |
| first adder had a call with a path inside the repository before its first item | 3 of 25 | 15 of 24 (oxvg r1 got no item) |
| projects with 2 or more adders before the first write | 11 of 25 | 6 of 25 |
| weights 1–3 / 4–7 / 8–10 | 7 / 31 / 59 | 25 / 66 / 8 |
| items added after their project's first write | 41 (8–10: 14) | 52 (8–10: 1) |
| task items per run | 16–25 | 16–23 |
| items with two or more holders | 21 | 20 |
| take × holder pairs whose holder never edited that project | 30 of 104 | 13 of 104 |
| drops | 10 | 11 |
| first roles (of 60) | builder 51, scout 5 | builder 48, scout 10 |
| write/edit calls per run | 104–183 | 118–152 |
| `done` calls per run | 0–1 | 0–1 |

- **The stagger worked as designed.** Agents entered 22–60 seconds apart.
- **The weight guide was followed.** Bugs found along the way were added at low and middle weights.
- **Items did not get split before building.** Most projects still had one item before their first write.
- **The last entrants got little budget.** By entry order, agents 11 and 12 used 0.1–2.6M tokens each; the first two used 0.8–5.8M. Per-agent tokens are in the subagent report.

**From the transcripts** (subagent report, key claims checked by hand; a correction is noted at its top):
- **A short look, not a deep read.** The first adder looked at the repository before its first item in 21 of 23 project-runs by the subagent's broader count. Only 10 of the 23 made three or more calls there. In 12 of 25, the first adder still added one item for the whole project (RW 17), but only 5 of those 12 had weight 7 or more (RW 15 at weight 8 or more).
- **Taking and holding:**
  - The take-and-drop rule did not change behaviour: 33 takes came while the taker already held another item (RW 33).
  - Saying which part one writes did change behaviour: 105 of 113 takes were followed by a post from the taker within a minute.
  - Deferral ("you take it") happened once, in expr r1 at 11.7–11.9 minutes.
- **Expr r1 (0):** the syntax layer was not built until the end.
  - finch built only the builtins (edits at 1.6–4.6 min).
  - An end-to-end expr item added at 8.1 minutes was taken at 8.3 by linnet, who never edited expr.
  - heron's first core edits came at 13.9–14.0 minutes, and the run ended at 14.0 with the `ast` package not building.
  - This one cell accounts for most of the spread: 0.86 of the 1.205 summed per-task gap between r1 and r2.
- **Expr r3 (0.152):** one editor, and 67 of 79 new hidden tests fail.
- **Wasmi r4 (0):** the library tests do not compile (`module coredump is private`). The subagent could not trace which edit caused it.
- **Scriggo r0–r3 (0):** the hidden tests fail 50 of 53. Parsing and type checking were done, but the emitter and runtime wiring were thin. r4 (0.75) changed the most emitter files.
- **Oxvg (0 in every run and arm):** this is neither a build bottleneck nor unfinished work.
  - The same 6 of 10 hidden tests fail every time.
  - 1–2 agents edited only `collapse_groups.rs` or `inline_styles.rs`, and passed the repository's own suite ("59/59 pass", wren, r1).
  - No run touched `remove_empty_containers`.
  - The change the description asks for is understood narrowly. The subagent's reading is that the swarm verifies only against existing tests.
- **The subagent's suggestions (model reading, not tested):**
  - Before calling a project finished, write and run one end-to-end example for each requirement of the task description.
  - Have `tasks` show projects whose heavy part nobody holds. This needs code.

Transcript analysis: [report](reports/2026-10-08-round28-transcripts.md) (model output; the claims listed at its top were checked by hand). Counts: [`deepswe/traces28.md`](deepswe/traces28.md).

## Round 29: end-to-end tests before implementation, build items per layer, and marks on idle holders, against the fixed baseline (fixed before measuring, 2026-10-08, the commit time; the user's design: "Y si decimos que los test end to end sea lo primero que se escriba? Hay que afinar más lo de dividir. Tus opciones me gustan", then "B" (no implementation code before the tests), "no quiero forzar que sea el primero quien los escriba, sino que sea orgánico", and "Si, genial")

**Why** (round 28's findings):
- **Oxvg scored 0 in every run of every arm.** Agents changed one module and passed the repository's own 59 tests, while the same 6 of 10 hidden tests failed each time. Expr r3 and scriggo r0–r3 also failed most hidden tests after their own checks passed. The agents check a change against existing tests, not against the behaviour the description asks for.
- **Splitting stayed rare.** 12 of 25 projects still had one item for the whole project.
- **Expr r1 (0) failed on nominal holding.** The end-to-end item was held from 8.3 minutes by an agent who never edited expr, and the syntax layer was started at 13.9 of 14 minutes.
- **The user's design:**
  - End-to-end tests are written first, and no implementation code is written in a project until they exist (option B, strict).
  - Whoever comes first writes them, not a designated agent: test items per requirement on the task list, taken by whoever arrives.
  - Splitting is tied to the tests: one build item per layer, naming the tests it makes pass.
  - Both of the main session's options are included: run every end-to-end test before calling a project finished, and mark idle holders in `tasks`.
- **Stagger stays as in RP.** The user asked whether to stagger more. Entry already spans 6.4–8.7 of 13–14 minutes, and the last two entrants get 0.1–2.6M tokens. With test items split by requirement, more agents early can write tests in parallel.

**New lever, default off:** `taskIdleMinutes` (this commit, with a unit test in `test/tasklist.test.ts`).
- With `taskList`, `tasks` marks a holder who has held an item for that many minutes without a write/edit since taking it: "[taken by linnet (no write/edit since taking it 5 min ago)]".
- A write/edit anywhere counts. Edits through bash are not seen.
- The task list now records when each holder took an item. With the lever off, the list's output is unchanged.
- The threshold is 3 minutes. In round 28, 90% of takes were followed by the holder's next write/edit within 2.2 minutes (median 0.8), and 11 of 113 takes by none.

**Arm TF** (`profiles/n12-roles9-tests.json`; 12 agents, 32M, 120 minutes, five DeepSWE tasks, k=5). It is RP (round 28) with `taskIdleMinutes: 3` and these prompt changes:
- **Team sentence.** It replaces "The first of you to work on a project reads the code the change touches, then adds its parts to the task list, each with its weight, before writing code." with:
  - "Each project starts with end-to-end tests. Whoever finds a project without them on the task list reads its task description and adds one item per requirement, or group of related requirements, for its tests (titled "tests: ..."), takes one and says so on the board; whoever comes next takes another."
  - "Nobody writes implementation code in a project until its test items are done. Meanwhile, read the code the change touches and add the build items: one for each layer or file the change crosses (for example parser, checker, compiler, runtime), each saying which tests it makes pass."
  - "An end-to-end test drives the project through the entry point it already has (source text or input files in, output out), so that it compiles before the feature exists, and lives in its own test package or folder, so that a failure or a panic cannot stop the project's other tests. A test that cannot compile until new code exists stays in a folder outside the project until that code exists."
  - "A build item is done when its tests pass, and a project is finished only when all its end-to-end tests pass."
  - The rest is unchanged: the weight guide, "whoever finds more work on the way adds it", the take, say and drop rules, and building after a change.
- **Builder.** It replaces the RP decomposition sentence and "Mark an item done … when the whole item works" with: "If the project you start on has no test items yet, start with its tests. If its tests exist but it has no build items, or one item for the whole project, read the code the change touches, then add one build item for each layer or file the change crosses (task_add), each naming the tests it makes pass, with its weight. Mark an item done (task_done) when its tests pass." The last sentence now also runs the end-to-end tests: "Build the project and run its existing tests and its end-to-end tests with run before you post that something works."
- The other eight roles, the stagger (15 turns, 60-second ceiling) and `task_add`'s description are unchanged.

**Realism check.**
- Writing end-to-end tests from the specification before implementing is ordinary practice (test-first).
- The tests are the agents' own. Nothing reveals the hidden grader, and the prompt names no task-provided signal. It would work for a task with no tests at all.

**Control:** the round 23 baseline. It is not rerun, because the code since only adds a default-off lever. RP (round 28) and RW (round 27) are descriptive references.

**Rule** (`compare.py`): better if p < 0.05, Δ > 0 and higher on at least 3 of 5 tasks; worse is symmetric; otherwise not decided. TF against RP is descriptive only.

**What is read:**
- **Order in each project:** whether the first write is a test, and the time from the project's first item to its first implementation write.
- **Test items:** per project, and how many distinct agents wrote them (the organic split).
- **Build items:** per project, and whole-project items.
- **Where tests live:** whether the agents' tests sit in their own package or folder, and whether any agent test breaks a build or panics at the end.
- **Idle marks:** how many marks were shown, and whether a marked item was joined or dropped afterwards.
- **Spend:** tokens before the first implementation write, as the cost of B.
- **Final diffs:** expr's core, and oxvg's files.
- **As in round 28:** duplicates, weights by band, and holders who never edited.
- **Transcripts:** a transcript analysis (subagent).

**Smoke** (the code of this commit):
- **Scripted, two agents, `taskIdleMinutes: 1` in a temporary copy of the profile:**
  - wren took the item and slept 75 seconds. Its `tasks` then showed "[taken by wren (no write/edit since taking it 1 min ago), finch]".
  - After wren wrote a file, the mark disappeared.
  - finch, who joined at 63 seconds, was not marked until it too had held the item for a minute without a write.
- **TF on a three-agent task with no tests (a calculator, unit conversion and a CLI written from scratch):** `all_done` in 122 seconds, 0.43M tokens.
  - The first write was `tests_e2e/test_cli.py`, end-to-end tests through the CLI in their own folder, confirmed failing before any code existed.
  - Three build items followed, one per module, each naming the tests it makes pass.
  - Nobody wrote implementation code before the test item was done.
  - The task was too small for the tests to be split: there was one test item, and the second agent entered after it was done.
- **No default-profile run.** The lever is off by default, and the list's output with the lever off is checked by the existing unit tests (16 of 16 pass).

**Estimate:** 5 × 32M = 160M tokens, about $2.6; about 2 hours.

**Known threats:**
- TF changes several things against RP at once (tests first, build items per layer, finishing on the end-to-end tests, idle marks), so a difference cannot be assigned to one of them.
- B holds back building in a run of about 13 minutes.
- Agents' tests may encode a narrow reading of the description, as their implementations did on oxvg.
- An agent's test may break a package if the placement rule is ignored.
- The control is not paired in time.
- At k=5 only differences of about ±0.25 are decidable.

### Round 29 result and rule applied (2026-10-08 20:19; batches 16:27–18:09 UTC, code `9b74367`)

| task | baseline (k=5) | RP (round 28) | TF mean (sd) |
|---|---:|---:|---:|
| expr | 0.420 | 0.524 | 0.602 (0.395) |
| oxvg | 0.000 | 0.000 | 0.100 (0.224) |
| scriggo | 0.150 | 0.150 | 0.171 (0.382) |
| tengo | 0.749 | 0.866 | 0.877 (0.038) |
| wasmi | 0.464 | 0.573 | 0.445 (0.304) |
| **five-task mean** | **0.357** | **0.422** | **0.439** (0.140) |
| runs | 0.257, 0.518, 0.356, 0.194, 0.458 | 0.446, 0.279, 0.520, 0.356, 0.511 | 0.555, 0.312, 0.390, 0.618, 0.320 |

160.1M tokens, $2.59. Every run ended at the 32M cap, after 11.1–16.9 minutes. No run failed, there was no model error, the quota held, and `srcDirty` was false.

**Rule as written** (`compare.py` against the baseline):
- Δ +0.082, 95% interval [−0.069, +0.234], p = 0.38.
- Higher on 4 of 5 tasks, lower on wasmi.
- **Not decided.**
- Against RP (descriptive): Δ +0.017, p = 0.83, higher on 4 of 5 tasks.
- Oxvg scored above 0 for the first time in any arm: 0.5 in r3.

**Process** (events; short scripts over `events.jsonl`):

| | RP | TF |
|---|---|---|
| all 12 agents entered within | 6.4–8.7 min | 6.5–8.9 min |
| a project's first write is a test | — | 24 of 25 (oxvg r1 had no write) |
| projects whose tests had 2 or more writers | — | 16 of 25 |
| implementation write before every test item naming the project was done | — | 9 of 25 (wasmi in 5 of 5 runs, oxvg r3 and r4, expr r1 and r2) |
| projects with 2 or more adders before the first write | 6 of 25 | 3 of 25 |
| weights 1–3 / 4–7 / 8–10 | 25 / 66 / 8 | 22 / 85 / 3 |
| take × holder pairs whose holder never edited that project | 13 of 104 | 23 of 142 |
| drops | 11 | 25 |
| write/edit calls per run | 118–152 | 108–141 |
| `tasks` results showing an idle mark | — | 37 (r0 1, r1 2, r2 24, r3 10, r4 0) |

- **Cost of the strict rule.**
  - Tokens spent before a project's first implementation write: 0.6–5.2M for expr, scriggo, tengo and wasmi, and 9.9–12.0M for oxvg.
  - Oxvg got no implementation write at all in r0, r1 and r2.
  - The subagent measures the first implementation write at a median 4.2 minutes and 2.6M tokens; in round 28 it was 3.2 minutes and 2.0M.
- **The organic split happened in the writing, not in the items.** The tests had several writers, but there was usually one test item per project, not one per requirement.

**From the transcripts** (subagent report, key claims checked by hand):
- **Oxvg r3 (0.5).** It is the only oxvg diff in any arm that changes `visitor.rs` as well as `collapse_groups.rs`. plover entered at 6.7 minutes, read lark's end-to-end test and wrote all four implementation edits. The hidden tests that still fail are the adjacent-sibling case and both `remove_empty_containers` tests; no run's tests covered that job.
- **Oxvg elsewhere:** in r0–r2 there was no implementation at all. Cold Rust builds took about 6.5 minutes, cargo lock contention was frequent, and in r2 the idle-marked test item held two implementers back until its holder's build finished. Oxvg r4 (0) ended with the build broken by an implementation file last written at 12.0 minutes.
- **Scriggo:** r0 scored 0.854 with a single agent (lark, the only agent writing in scriggo) building the whole pipeline. r1–r4 split it into layers with no integrator, and each scored 0. In 5 of 5 runs scriggo's build items were whole-project items, by the subagent's hand classification from titles.
- **Expr:**
  - r4 (0.063): a single item, held by one agent who wrote only the builtins.
  - r1 (0.342): nobody lowered `TryNode` in the compiler.
  - r2 (0.683): the hidden `TestTryCatch_RetryExhaustion` was killed after 17 seconds, and 22 of 79 tests were lost with it. The agents' own `trycatch_e2e` package was killed the same way, but it sat in its own package as the profile asks.
- **Wasmi r0 (0):** the build broke in the last minute, on an implementation file (`core_dump.rs`, edited at 16.3 minutes), not on a test.
- **Idle marks were shown but not acted on.** They appeared on 5 distinct items. No one joined or dropped a marked item, and no post mentions a mark.
- **Did the tests encode the description better?** The subagent found no sign of it. Its reading (model output, not tested) is that the main remaining failure is that nobody owns the integration of a project's layers. It suggests a final "make the entry-point tests pass: wire the layers" item per project, and counting idle time per project.

Transcript analysis: [report](reports/2026-10-08-round29-transcripts.md) (model output; the claims listed at its top were checked by hand). Counts: [`deepswe/traces29.md`](deepswe/traces29.md).

## Round 30: an integrate item per project and stubs before tests, against the fixed baseline (fixed before measuring, 2026-10-08, the commit time; the user approved the three changes, "Me parece bien los cambios", asked for a review of existing levers, then "Prepáralo así")

**Why** (round 29's findings):
- **Layers split with no one wiring them failed.** Scriggo scored 0 in r1–r4, where its layers were split, and 0.854 in r0, where one agent built them all. Expr r1 never lowered `TryNode` in the compiler.
- **The strict tests-first rule could not hold where the tests need a new API.** In wasmi it was broken in all five runs.
- **The idle marks were shown 37 times and never acted on.**

**Lever review** (the user's request; existing levers checked against the remaining failures). None is added.
- **Shared-file and locking levers:**
  - `staleGuard`: there is nothing for it to catch. Round 29 had 0 full writes over a teammate's unread change; 571 of 641 file changes were `edit` calls, which already fail on stale text.
  - `claimLease`: file locks were neutral or negative in the early rounds.
- **Making the team's state visible:**
  - `teamStatus` was worse in round 20 (−0.076).
  - `boardTail`, `sharedNotes`, `threads`, `notices` and `findings` were worse, unused or without effect in rounds 5–20.
- **Context, time and departures:**
  - `relayContext` has little to save. Per-turn context is a median 32k tokens and a 90th percentile of 65k.
  - `clockEffective` made the team wrap up together and leave 4–11M unspent in round 25.
  - `reviveOnMention` has little to do: agents now call `done` 0–1 times per run.
- **Branches:** `branches` would give each agent its own Rust build, but each cold oxvg build takes about 6.5 minutes.
- **The one candidate, left for a later round:** `taskAssign`, a request between equals that could hand the integrate item to a named teammate. Adding it here would mix effects.

**Arm TI** (`profiles/n12-roles9-integrate.json`; 12 agents, 32M, 120 minutes, five DeepSWE tasks, k=5). It is TF (round 29) without `taskIdleMinutes`, plus three prompt changes:
- **Stubs:**
  - "Nobody writes implementation code in a project until its test items are done" now goes on: ", except what the tests need to compile: a new function, type or method the tests call may be added first as a stub (its signature, with a body that returns an error rather than panicking)".
  - "A test that cannot compile until new code exists stays in a folder outside the project until that code exists." becomes "If a test needs code that does not exist yet, add that code as a stub so that the test compiles and fails."
- **Integrate item:**
  - The build items sentence adds: "and one last item, "integrate: make every end-to-end test of <project> pass", for wiring the layers together and fixing what falls between them".
  - The done rule becomes: "A build item is done when its tests pass, and the integrate item, like the project, only when all its end-to-end tests pass."
  - The builder adds "and the project's integrate item" when it adds build items.
  - The integrator role starts with "Take a project's integrate item (task_take), or pick a project where…".
- Everything else is as in TF.

**Control:** the round 23 baseline. It is not rerun, because the code is unchanged since round 29. TF (round 29) and RP (round 28) are descriptive references.

**Rule** (`compare.py`): better if p < 0.05, Δ > 0 and higher on at least 3 of 5 tasks; worse is symmetric; otherwise not decided. TI against TF is descriptive only.

**What is read:**
- **Integrate items:** per project, who took them and when, and whether their project's end-to-end tests pass at the end.
- **Stubs:** whether stubs were written before the tests in wasmi (and elsewhere), and whether the strict rule held in wasmi.
- **As in round 29:**
  - **Order and splitting:** whether the first write in each project is a test, and how many agents wrote its tests.
  - **Cost:** tokens before the first implementation write.
  - **Breakage:** late build breaks.
- **Splitting by project:** scriggo's split against its single-builder runs.
- **Transcripts:** a transcript analysis (subagent).

**Smoke** (this profile, three agents, on a small Go module written for the test: add a power operator, `EvalWith` with variables, and `Names`, across `lexer.go`, `parser.go` and `eval.go`):
- **Result:** `all_done` in 96 seconds, 0.55M tokens.
- **Tests first:** wren wrote end-to-end tests in their own package `e2e/` before any implementation.
- **Items:** three items followed, two build items by layer and "integrate: make every end-to-end test of calc pass".
- **The integrate item was used:** wren took it at 60 seconds and finch joined it after its own item. Both `go test ./...` and an independent probe test in the main session passed.
- **The stub rule was not exercised.** wren left the end-to-end tests not compiling in their own package until the API existed, which broke nothing else.
- **No default-profile run:** the code is unchanged.

**Estimate:** 5 × 32M = 160M tokens, about $2.6; about 2 hours.

**Known threats:**
- TI changes three things against TF at once (integrate item, stubs, no idle marks).
- Stubs that panic, or that compile but are never replaced, could hurt.
- The control is not paired in time.
- At k=5 only differences of about ±0.25 are decidable: the last three rounds moved the mean by +0.07 and +0.02, which this design cannot confirm.

### Round 30 result and rule applied (2026-10-08 22:30; batches 18:40–20:16 UTC, code `3e23e34`)

| task | baseline (k=5) | TF (round 29) | TI mean (sd) |
|---|---:|---:|---:|
| expr | 0.420 | 0.602 | 0.468 (0.464) |
| oxvg | 0.000 | 0.100 | 0.000 (0.000) |
| scriggo | 0.150 | 0.171 | 0.321 (0.441) |
| tengo | 0.749 | 0.877 | 0.881 (0.051) |
| wasmi | 0.464 | 0.445 | 0.500 (0.334) |
| **five-task mean** | **0.357** | **0.439** | **0.434** (0.092) |
| runs | 0.257, 0.518, 0.356, 0.194, 0.458 | 0.555, 0.312, 0.390, 0.618, 0.320 | 0.494, 0.339, 0.410, 0.561, 0.366 |

160.1M tokens, $2.54. Every run ended at the 32M cap, after 12.3–13.8 minutes. No run failed, there was no model error, the quota held, and `srcDirty` was false.

**Rule as written** (`compare.py` against the baseline):
- Δ +0.077, 95% interval [−0.051, +0.204], p = 0.32.
- Higher on 4 of 5 tasks, lower on none (oxvg tied at 0).
- **Not decided.**
- Against TF (descriptive): Δ −0.005, p = 0.94, higher on 3 of 5 tasks (scriggo, wasmi, tengo), lower on expr and oxvg.

**Process** (events; one short script over `events.jsonl`, run on both rounds so the columns are comparable; a write is an `edit`/`write` call, a path is a test when it contains "test" or "e2e", and relative paths count. For TF it gives 17 rather than 16 multi-writer projects, 8 rather than 9 strict-rule breaks and 17 of 133 rather than 23 of 142 idle take pairs, because round 29's script was not kept):

| | TF | TI |
|---|---|---|
| all 12 agents entered within | 6.5–8.9 min | 6.3–7.6 min |
| a project's first write is a test | 24 of 24 with writes | 23 of 25 (wasmi r2 and r4 began with `config.rs`) |
| projects whose tests had 2 or more writers | 17 of 25 | 17 of 25 |
| implementation write before every test item naming the project was done | 8 of 25 | 7 of 25 (wasmi r0, r1, r2, r4; scriggo r0, r4; oxvg r0) |
| projects with 2 or more adders before the first write | 3 of 25 | 3 of 25 |
| weights 1–3 / 4–7 / 8–10 | 22 / 85 / 3 | 11 / 97 / 6 |
| take × holder pairs whose holder never edited that project | 17 of 133 | 13 of 137 |
| drops | 25 | 15 |
| write/edit calls per run | 106–139 | 104–156 |
| projects with no implementation write | oxvg r0, r1, r2 | oxvg r3, r4 |

- **Integrate items** (from `task_add` titles):
  - **Where they appeared:** in 8 of 25 projects (r0 tengo, expr and oxvg; r2 expr; r3 tengo; r4 tengo, scriggo and expr). There were none in r1, and none in wasmi in any run.
  - **When:** they were added at 1.2–3.6 minutes (oxvg at 6.1, r4 expr at 7.1) and taken at 4.8–10.4 minutes.
  - **What happened to them:** 6 were taken and 4 marked done (r0 tengo, r2 expr, r3 tengo, r4 tengo). r0 oxvg and r4 expr were never taken; r0 expr and r4 scriggo were taken and never done.
  - **The integrator role** was chosen once in 50 role calls, in r1, which had no integrate item.
- **Stubs were barely used.** Only r1 wasmi mentions a stub, and it returned `None`, not an error. Wasmi's new API (`config.rs`, `error.rs`) was again written before its tests were done in 4 of 5 runs, now as real fields and setters. Its first implementation write came no earlier (5.2, 6.7 and 5.5 minutes in r0, r2 and r3). No final diff has an unreplaced or panicking stub.
- **Cost of waiting:** the first implementation write came at a median 4.3 minutes and 2.8M tokens (TF: 4.2 minutes and 2.6M). Oxvg's came at 8.5–9.5 minutes after 13.7–21.8M tokens, and never in r3 or r4.

**From the transcripts** (subagent report, key claims checked by hand; two corrected):
- **What separates scores is whether every layer was built, not the integrate item.**
  - **Expr:** r2 (1.0) and r3 (0.936) had separate agents on the compiler and the VM. r0 (0) had no compiler change at all; its hidden log shows `undefined node type (*ast.TryNode)`, checked by hand. r1 and r4 (0.202) changed the compiler, but one nil-node panic took down the whole Go package, and 62 of 79 hidden tests with it.
  - **Scriggo:** r0 (0.75) and r3 (0.854) edited the emitter. r1 and r2 (0) did not. In r4 (0) the selector path was left unwired (`x.Double undefined`), although heron held the integrate item from 10.4 minutes; heron edited checker types instead.
  - **Integrate item holders** mostly built layers rather than wiring them. In r0 expr, robin took the item at 7.7 minutes and wrote VM files and tests, never the compiler.
- **Wasmi r2 and r3 (0.136)** lack capture on the executor side; in r3 every hidden test fails on a header bug ("unsupported Wasm version"). The other runs pass 15–17 of 22.
- **Oxvg (0 everywhere) is starved by the cold Rust build.** A cold `cargo` build takes 6.4–7.6 minutes. Implementation started only at 8.5–9.5 minutes, and the cargo calls started after it were still waiting for the build lock when the cap hit. r0 and r2 end with a library that does not compile, and the team never saw the errors.
  - **Corrected by hand.** The subagent read the "Command aborted" results as cargo calls interrupted by incoming posts. In fact every one of them, 5–9 per run, carries the minutes-left stamp of the budget abort at the end of the run, the only place murmur aborts sessions (`src/swarm.ts:240`).
- **Leaving with items held:** all 6 agents who called `done` held an item (TF 5 of 8).
  - **Corrected by hand.** The subagent's main example was expr r4: tern left at 3.5 minutes holding its build item, but finch and kite took that item at 3.8 minutes. So the departure does not explain the 0.202.
- **Late edits:** builds were not broken at the end in wasmi or tengo. In scriggo r1 the base tests fell to 0.38 after 13 implementation edits in the last 2 minutes.

**Reading.**
- TI ties TF (−0.005), and both are about +0.08 over the baseline, which k=5 cannot decide.
- **The integrate item did not take hold.** It appeared in a third of the projects, was often taken late, and its holders built layers rather than wiring them.
- **The stub rule was not used**: agents wrote the real API first, as in TF.
- **The idle marks' absence changed nothing visible.**
- **The remaining losses:**
  - a missing layer (expr compiler, scriggo emitter);
  - a single panic that loses a whole package;
  - oxvg's build time against a 13-minute run.

Transcript analysis: [report](reports/2026-10-08-round30-transcripts.md) (model output; the claims listed at its top were checked by hand). Counts: [`deepswe/traces30.md`](deepswe/traces30.md).

## Round 31: trace the siblings of what is new, and treat a failing end-to-end test as open work, against the fixed baseline (fixed before measuring, 2026-10-09, the commit time; the user asked to find what to polish rather than repeat runs, "prefiero identificar que hay que pulir, modificar/crear una palanca y volver a probar", then approved the proposal, "si")

**Why** (two analyses after round 30, both committed):
- **Deference to stale owners is rare** ([report](reports/2026-10-09-deference.md)):
  - there were 75 episodes in the 50 projects of rounds 29–30, and 56 of them were live;
  - only 2–4 projects lost 2 minutes or more;
  - so no rule against waiting.
- **High and low runs differ in whether every place the change must reach was changed** ([report](reports/2026-10-09-high-vs-low.md), counts checked by hand):
  - **Scriggo:** no run without an emitter change scores ≥0.7.
  - **Expr:**
    - 10 runs changed only `builtin/` (0.063);
    - 10 runs that touched every layer panic with "undefined node type" in a visitor (`Checker.visit`, `ast.Walk`);
    - with all five layers touched, the mean is 0.68.
  - **Wasmi:** 19 of 50 runs stop at 0.364 (the API without capture).
- **The failure is often visible to the team:**
  - in 24 of 40 low scriggo runs, the grader's error text appeared in the agents' own output;
  - in 18 of them it appeared again in the last 3 minutes, and stayed red;
  - in 9 of 11 builtin-only expr runs, the team's last own test was green.
- **Upper bound:** the subagent estimates that fixing this completely is worth at most about +0.09 on the five-task mean. That is below what k=5 can decide, so the round is read mainly on the targeted behaviour (below).

**Arm TS** (`profiles/n12-roles9-siblings.json`; 12 agents, 32M, 120 minutes, five DeepSWE tasks, k=5). It is TF (round 29, `n12-roles9-tests`, idle marks included) with three added sentences and no other change:
- **Team sentence, after the build items:** "To find every place the change must reach, look for an existing feature of the same kind as the new one (a node, statement, type, opcode or option like it) and search the whole project for every place that handles it: each place where the new one must be handled too is a part, so add it as an item unless an item already covers it."
- **Team sentence, after the done rule:** "An end-to-end test that fails is open work: whoever sees one fail and finds no item covering its cause adds one, naming the test and the failure, and that item is done only when that test passes."
- **Builder, before "Mark an item done":** "When you add something new (a node, type, opcode or option), search the project for every place that handles an existing one like it, and handle the new one there too or add an item for it."
- Both are ordinary engineering practice, and neither depends on a task-provided test: the end-to-end tests are the agents' own.

**Control:** the round 23 baseline. It is not rerun, because the code is unchanged. TF (round 29) is the descriptive reference: TS differs from it only by these sentences.

**Rule** (`compare.py`):
- better if p < 0.05, Δ > 0 and higher on at least 3 of 5 tasks;
- worse is symmetric;
- otherwise not decided.
- TS against TF is descriptive only.

**What is read:**
- **Primary behaviour measure: missed places,** counted mechanically on the final diffs and the grader logs. The grader only measures; nothing from it reaches the agents.
  - **expr:** the diff changes no file under `compiler/`, or a hidden-test log contains "undefined node type".
  - **scriggo:** no changed path contains `emitter`.
  - **References, missed of 10** (expr + scriggo): baseline 4, RP (round 28) 1, TF 5, TI (round 30) 5.
  - **What would count as a change:** TS clearly better on this measure means 2 or fewer of 10. This is a descriptive threshold, not a test.
- **Wasmi:** missing capture is judged in the transcript analysis, because no mechanical marker separates it (an `executor` path does not).
- **Use of the rules** (transcripts):
  - searches for an existing sibling, and items added from them;
  - items that name a failing end-to-end test, and whether they were closed with that test passing;
  - red end-to-end tests left red at the end.
- **As in rounds 29–30:**
  - first write is a test;
  - tests' writers;
  - tokens before the first implementation write;
  - late build breaks.
- **Transcripts:** a transcript analysis (subagent).

**Smoke:**
- **Toy module, first version.** A small Go calculator with a conditional expression to add, and three agents. The sites were all in one file, so the sibling search was not needed. It passed, `all_done`, 0.61M tokens.
- **Toy module, second version.** It added a constant folder in another package that panics on unknown nodes. The first agent found it by reading the five files and handled it. It passed, `all_done`, 0.84M tokens.
- **The real expr repository** (three agents, 4M tokens, 9.5 minutes; its hidden score was not looked at, and its results and run files were deleted):
  - **Sibling search:** at 1.7 minutes finch searched `SequenceNode|VariableDeclaratorNode` across `ast`, `compiler`, `checker`, `optimizer` and `parser`.
  - **Red test as open work:** at 4.8 minutes robin saw the end-to-end tests panic in `checker.visit` with "undefined node type (*ast.TryNode)". Robin added item #5 naming that failure, finch fixed the checker, and #5 was closed at 6.2 minutes with the checker and end-to-end tests passing.
  - The checker item came from the red test, not from the search.
- **No default-profile run:** the code is unchanged.

**Estimate:** 5 × 32M = 160M tokens, about $2.6; about 2 hours.

**Known threats:**
- **The upper bound** of the targeted gain (+0.09) is below what k=5 can decide on the mean.
- **The missed-place measure** is coarse. It misses a wrong emitter or compiler change, and RP's 1 of 10 shows that it does not track the score closely.
- **Prompt length:** the rules add three sentences to an already long briefing.
- **The control** is not paired in time.

### Round 31 result and rule applied (2026-10-09 12:50; batches 08:53–10:39 UTC, code `5048291`)

| task | baseline (k=5) | TF (round 29) | TS mean (sd) |
|---|---:|---:|---:|
| expr | 0.420 | 0.602 | 0.600 (0.390) |
| oxvg | 0.000 | 0.100 | 0.000 (0.000) |
| scriggo | 0.150 | 0.171 | 0.124 (0.224) |
| tengo | 0.749 | 0.877 | 0.705 (0.396) |
| wasmi | 0.464 | 0.445 | 0.409 (0.329) |
| **five-task mean** | **0.357** | **0.439** | **0.368** (0.163) |
| runs | 0.257, 0.518, 0.356, 0.194, 0.458 | 0.555, 0.312, 0.390, 0.618, 0.320 | 0.471, 0.136, 0.430, 0.534, 0.268 |

160.1M tokens, $2.63. Every run ended at the 32M cap, after 10.9–14.4 minutes. No run failed, there was no model error, the quota held, and `srcDirty` was false.

**Rule as written** (`compare.py` against the baseline):
- Δ +0.011, 95% interval [−0.160, +0.172], p = 0.91.
- Higher on 1 of 5 tasks, lower on 3.
- **Not decided.**
- Against TF (descriptive): Δ −0.071, p = 0.47, lower on all 5 tasks.

**Pre-registered behaviour measure: missed places.**
- **Result:** 2 of 10 projects (expr r1, scriggo r4), against TF 5, TI 5 and the baseline 4. That meets the descriptive threshold (2 or fewer).
- **But the scores did not follow:**
  - scriggo touched the emitter in r0–r3 and scored 0, 0.517, 0 and 0.104;
  - expr r1, the one missed expr, scored 0.025.

**Process** (same script as rounds 29–30):

| | TF | TI | TS |
|---|---|---|---|
| all 12 agents entered within | 6.5–8.9 min | 6.3–7.6 min | 6.1–6.9 min |
| a project's first write is a test | 24 of 24 | 23 of 25 | 20 of 25 |
| projects whose tests had 2 or more writers | 17 | 17 | 12 |
| implementation write before every test item naming the project was done | 8 | 7 | 6 |
| items | 110 | 114 | 116 |
| weights 1–3 / 4–7 / 8–10 | 22 / 85 / 3 | 11 / 97 / 6 | 18 / 92 / 6 |
| first implementation write, median | 4.2 min, 2.6M | 4.3 min, 2.8M | 3.9 min, 3.1M |
| write/edit calls per run | 106–139 | 104–156 | 127–167 |
| implementation writes in the last 2 minutes | 100 | 97 | 99 |

**From the transcripts** (subagent report, key claims checked by hand):
- **Use of the rules:**
  - **Sibling searches:**
    - their number did not change: 267 against 265 (TF) and 277 (TI);
    - in expr they came earlier: the first multi-layer search was at a median 2.9 minutes, against 5.5 in TF;
    - only 3 of 116 items mention a sibling, and none was created from a search.
  - **Items naming a failing end-to-end test:** about 17. 12 were closed, about 9 of them with the named test passing.
- **Two events explain most of the gap against TF.** The other part of the gap is oxvg, where TF's single 0.5 (r3) has no counterpart; oxvg was 0 in every TS run. Tengo r1 and oxvg together are 0.054 of the 0.071 gap.
  - **Tengo r1 (0, existing tests too).** robin wrote `parser/tmp_test.go` at 5.8 minutes, with a loop that never ends, and left it in the tree. The hidden base log times out after 10 minutes in `TestTmpAhead` (checked by hand). robin's and tern's test calls never returned, so nobody saw it fail. The other four TS tengo runs average 0.882 (TF 0.877).
  - **Wasmi r4 (0, nothing ran).** linnet's edit to `engine/executor/mod.rs` at 10.53 minutes, 2 seconds before the budget abort, left four compile errors (checked by hand: last edit 10.53, abort 10.56).
- **Expr r1 (0.025): a title covered a layer that nobody built.**
  - wren's sibling search at 3.9 minutes reached the checker. No item followed, because item #6 was titled "checker/compiler/VM", and the rule says "unless an item already covers it".
  - Its holder built the VM and the compiler.
  - The team's end-to-end tests call `expr.Eval(source, nil)`, which skips the checker, so they went green (checked by hand: no `checker/` file in the diff, and the hidden panic is through `checker.go:233`).
- **Scriggo failed on depth and time, not on untouched layers.**
  - The hidden panics (`reflect.Type is types.definedType, not *reflect.rtype`) were in the agents' own output from 6–10 minutes, and the runs ended at 10.6–14.1.
  - Rule 2 works when the failing test is quick to fix (all 7 such items closed in r0). It comes too late for scriggo's wide emitter.

**Reading.**
- **The rules changed the targeted measure** (missed places from 5 to 2 of 10) **but not the outcome.** Touching a layer is not building it, and the measure was coarse, as the pre-registration warned.
- **The drop against TF is mostly two accidents** (a non-terminating test file, an edit at the last second) **and oxvg's single TF success.** At k=5 that cannot be told from noise.
- **Two loopholes appeared:**
  - an item title that names several layers counts as covering them;
  - end-to-end tests that drive a shortcut entry point (`Eval` without the checker) can go green while the real path fails.
- **The remaining loss is shared by every arm:** an end-of-run tree that does not build or test. Here that was a test that never ends and a last-second edit.

Transcript analysis: [report](reports/2026-10-09-round31-transcripts.md) (model output; the claims listed at its top were checked by hand). Counts: [`deepswe/traces31.md`](deepswe/traces31.md).

## Round 32: a deadline notice near the end of the budget, one layer per build item, and end-to-end tests through the user's path, against the fixed baseline (fixed before measuring, 2026-10-09, the commit time; the user approved the proposal, "si, a+b")

**Why** (round 31 and a count over rounds 23–31):
- **The end of a run leaves trees that do not build or test.** A project counts here when the grader's run of its existing tests passed none of them (a compile error or a 10-minute timeout; the oxvg cases are compile errors in the agents' code, checked by hand in `e31-rsibl-r2`). Per arm, of 25 projects: baseline 4, TF 2, TI 2, TS 4; 30 of 250 over the ten arms of rounds 23–31 that ended at the cap. Round 31 lost tengo r1 to a scratch test that never ends, left in the tree, and wasmi r4 to an edit 2 seconds before the budget abort.
- **The agents do not see the end coming.** Their clock reads about 100 minutes left while the budget runs out after 11–15 minutes. RC (round 25), whose clock counted down to the budget at the current pace, is the only arm with 0 of 25 broken trees, but its team wrapped up together and called `done` with 4–11M unspent (0.190). The user asked whether a clock that reaches 0 with whichever runs out first had been tried: it had, in RC.
- **Two loopholes in round 31's rules** (expr r1, 0.025): an item titled "checker/compiler/VM" counted as covering the checker, which nobody built; and the team's end-to-end tests called `expr.Eval(source, nil)`, which skips the checker, so they went green while the real path panicked.

**Arm TD** (`profiles/n12-roles9-deadline.json`; 12 agents, 32M, 120 minutes, five DeepSWE tasks, k=5). It is TS (round 31, `n12-roles9-siblings`) with one lever and three sentences:
- **A, new default-off lever `deadlineNotice: 0.75`.** Once 75% of the shared token budget or of the timeout is spent, whichever comes first, each agent's next tool result carries one notice, once: "[The deadline is close: 75% of the shared budget is spent, and the run stops without warning when the budget or the time runs out. Start nothing new. Finish or undo what you have half done so that every project you touched builds and its tests finish, and delete any scratch files you made.]" Unlike RC's clock it is one fixed threshold, not a running estimate, and it does not mention calling `done`. Over the 50 cap-ended runs of rounds 23–31 except RC, 75% came a median 2.0 minutes before the abort (1.2–3.8); 80% gave 1.6 (0.9–3.4) and 90% under a minute. A deadline warning exists in real work, and the lever reads only murmur's own budget and clock.
- **A, team sentence, before "When you finish a change, build its project":** "Run every test command with a time limit (for example timeout 300), and delete scratch tests and files once they have served."
- **B, team sentence, after "unless an item already covers it.":** "Each build item covers one layer or file: an item whose title names several layers covers none of them, so split it into one item per layer."
- **B, in the end-to-end test sentence, after "(source text or input files in, output out),":** "the way a user calls it, so that the input passes every stage a user's input passes (such as checking or validation) and no shortcut skips one,".

**Control:** the round 23 baseline, not rerun: the new lever is off by default, so no existing profile changes. TS (round 31) is the descriptive reference: TD differs from it only by the lever and these sentences.

**Rule** (`compare.py`):
- better if p < 0.05, Δ > 0 and higher on at least 3 of 5 tasks;
- worse is symmetric;
- otherwise not decided.
- TD against TS and TF is descriptive only.

**What is read:**
- **Primary behaviour measure (A): broken trees at the end**, counted mechanically from the grader's score files (no test of the existing suite passed). References above; TD clearly better means 1 or fewer of 25 (a descriptive threshold, not a test).
- **A's known risk, RC's failure:** `done` calls after the notice, unspent tokens at the end, and runs that end by `done` rather than at the cap. When each agent got the notice (`deadline_notice` events) and agents who never did (inside a long model call or a test at the time). Implementation writes after the notice, and whether they finished or undid work (transcripts). Test commands run with a time limit, against TS.
- **B: missed places** (round 31's measure; TS 2, TF 5 of 10), build items whose title names more than one layer, and end-to-end tests that enter through a shortcut skipping a stage (transcripts).
- **As in rounds 29–31:** first write is a test, tests' writers, items and weights, first implementation write, late implementation writes.
- **Transcripts:** a transcript analysis (subagent).

**Smoke** (both runs deleted after reading):
- **Forced notice:** `examples/trio` (three agents, 1.5M) with this profile and `deadlineNotice` lowered to 0.2, 370k tokens, `all_done`, passed. The notice reached each of the three agents exactly once, at 20.2–21.2% of the budget (`deadline_notice` events), and every test command after it ran under `timeout 300`. All three called `done` within 5 seconds of the notice; the three modules and their 12 tests were already passing, so the trio cannot tell a finished team from one the notice sent home, which is why `done` after the notice is a read measure.
- **Default profile:** `examples/trio`, 83k tokens, `quiescent`, passed, no `deadline_notice` event.

**Estimate:** 5 × 32M = 160M tokens, about $2.6; about 2 hours.

**Known threats:**
- **A and B are mixed in one arm.** Each has its own measure, but a change in the score cannot be assigned to one of them.
- **The gain is small against the noise:** fixing the broken trees completely is worth a few hundredths on the five-task mean, below what k=5 can decide, so the round is read mainly on the behaviour measures.
- **The notice may change the pace** of spending, as RC's clock did, so the real warning time may differ from 2 minutes.
- **The broken-tree measure** counts only trees where nothing of the existing suite ran, not partial breaks.
- **Prompt length:** two more sentences and a clause on an already long briefing.
- **The control** is not paired in time.

### Round 32 result and rule applied (2026-10-09 18:55; batches 14:40–16:18 UTC, code `3f2065b`)

| task | baseline (k=5) | TF (round 29) | TS (round 31) | TD mean (sd) |
|---|---:|---:|---:|---:|
| expr | 0.420 | 0.602 | 0.600 | 0.526 (0.413) |
| oxvg | 0.000 | 0.100 | 0.000 | 0.000 (0.000) |
| scriggo | 0.150 | 0.171 | 0.124 | 0.125 (0.280) |
| tengo | 0.749 | 0.877 | 0.705 | 0.892 (0.048) |
| wasmi | 0.464 | 0.445 | 0.409 | 0.482 (0.322) |
| **five-task mean** | **0.357** | **0.439** | **0.368** | **0.405** (0.067) |
| runs | 0.257, 0.518, 0.356, 0.194, 0.458 | 0.555, 0.312, 0.390, 0.618, 0.320 | 0.471, 0.136, 0.430, 0.534, 0.268 | 0.338, 0.495, 0.448, 0.349, 0.394 |

160.2M tokens, $2.67. Every run ended at the 32M cap, after 11.9–14.6 minutes. No run failed, there was no model error, the quota held, and `srcDirty` was false.

**Rule as written** (`compare.py` against the baseline):
- Δ +0.048, 95% interval [−0.069, +0.166], p = 0.48.
- Higher on 3 of 5 tasks, lower on 1.
- **Not decided.**
- Descriptive: against TS Δ +0.037 (p = 0.67), against TF Δ −0.034 (p = 0.64). The run means have the smallest spread of any arm so far (sd 0.067), mostly by composition: oxvg 0 in every run, scriggo 0 in 4 of 5, tengo 0.86–0.95, expr bimodal (0.80–0.85 three times, 0.03 and 0.13).

**Primary measure (A): broken trees at the end** (`deepswe/endstate.py`):
- **2 of 25** (oxvg r0, oxvg r4), against TS 4, TF 2, TI 2 and the baseline 4. The descriptive threshold (1 or fewer) is **not met**.
- **Oxvg r4:** heron's two edits to `collapse_groups.rs` at 11.55 and 11.64 minutes, after heron's notice at 10.82, left an unclosed delimiter; the abort was at 11.94 (checked by hand).
- **Oxvg r0:** dunlin's edits to `inline_styles.rs` at 9.3 call a function that does not exist; dunlin was inside a cargo call blocked on the build lock and got the notice at the abort (checked by hand).
- Both cargo checks sat on "Blocking waiting for file lock on build directory" and ended in "Command aborted", so neither error was ever visible to the team.
- **What disappeared:** no test that never ends and no scratch test file left in a diff (TS: tengo r1); test commands under `timeout`: 549 of 601 (TS 0 of 588); all 13 `timeout 300` kills were oxvg cargo calls.
- **Partial damage the measure does not count:** robin's scriggo `parser_test.go`, written after the notice (11.4–12.3), panics the whole `internal/compiler` test package (scriggo r0 `base_frac` 0.419).

**A's known risk (RC's failure) did not happen:**
- No `done` after a notice, and every run spent the whole 32M. The five `done` calls (r1 wren, finch, crane; r4 tern, plover) came at 2.3–7.4 minutes, before any notice; those are the 5 agents never reached.
- **When the notice arrived:** the first 1.5–2.8 minutes before the abort (pre-registered estimate 2.0, 1.2–3.8). Per agent 0–169 seconds before; 10 of 55 agents got it 10 seconds or less before, because they were inside long cargo or `go test` calls.
- **What agents did after it** (subagent classes): 8 made no further call, 14 only read, tested or posted, 8 finished their own files and tested, 7 took an item without editing, 13 started new files or surface, 5 edited teammates' files. No one reverted a teammate's working code. 75 write/edit calls came after the agent's notice.
- **Implementation writes in the last 2 minutes:** 63, against 100 (TF), 97 (TI) and 99 (TS).

**B: did not change behaviour.**
- **Missed places: 6 of 10** (scriggo r0–r3, expr r3, r4), against TS 2 and TF 5.
- **Multi-layer build items** (`deepswe/process.py`): 18 in TD, against 17 (TS), 14 (TI) and 9 (TF), for example "Expr checker/compiler: typecheck and emit error handling constructs" and "Scriggo: implement checker/compiler/runtime support for declared methods".
- **End-to-end tests through a shortcut:** expr's tests still call `expr.Eval(src, nil)`, which skips the checker, in r1, r2 and r3 (TS: r0, r1). Expr r3 (0.025) is round 31's expr r1 again: no `checker/` file in the diff, the hidden panic in `checker.(*Checker).visit` (checked by hand).
- **Scriggo:** someone named the emitter at 7.9–10.8 minutes in r0–r3, but the end-to-end tests still panicked in the checker, so emitter items waited behind it or came after the notice. The only run with emitter edits, r4 (0.625), wrote them at 10.5–11.6.
- **Expr r4 (0.127):** the hidden tests panic in `compiler.compile`; the compiler item was held by one agent whose first compiler edit came at 11.9 of 11.9, and item #28 "e2e: compiler dispatch missing TryNode" was never taken.

**Process** (`deepswe/process.py`, same definitions as rounds 29–31; it reproduces the published TF, TI and TS values except TF's "implementation write before every test item was done", 9 rather than 8, and TF's write/edit range):

| | TF | TI | TS | TD |
|---|---|---|---|---|
| all 12 agents entered within | 6.5–8.9 min | 6.3–7.6 min | 6.1–6.9 min | 6.3–8.9 min |
| a project's first write is a test | 24 of 24 | 23 of 25 | 20 of 25 | 24 of 25 |
| projects whose tests had 2 or more writers | 17 | 17 | 12 | 17 |
| implementation write before every test item naming the project was done | 9 | 7 | 6 | 10 |
| items | 110 | 114 | 116 | 152 |
| weights 1–3 / 4–7 / 8–10 | 22 / 85 / 3 | 11 / 97 / 6 | 18 / 92 / 6 | 41 / 95 / 16 |
| first implementation write, median | 4.2 min, 2.6M | 4.3 min, 2.8M | 3.9 min, 3.1M | 4.1 min, 2.6M |
| write/edit calls per run | 108–141 | 104–156 | 128–167 | 117–138 |
| implementation writes in the last 2 minutes | 100 | 97 | 99 | 63 |
| build items naming more than one layer | 9 | 14 | 17 | 18 |

**Also from the transcripts:**
- **Wasmi r0 (0) is a deadlock in the text TD shares with TF and TS.** "Nobody writes implementation code in a project until its test items are done" met "a test that cannot compile until new code exists stays in a folder outside the project": finch's external test package could not be reached, the test item never closed, kite posted at 6.0 "rule blocks wasmi implementation until its tests are marked done", and nobody took the build items in 12.5 minutes. The final diff has only tests (checked by hand).
- Three TD diffs carry a cargo `target/` directory from a team-made end-to-end crate (TS one).

**Reading.**
- **A removed the hang and the early stop, but not the late break.** No test hung, test commands carried a time limit, nobody went home after the notice, and late implementation writes fell by a third. But the notice comes about 1.5 minutes before the end, a quarter of the agents started new work after it, and one of them broke oxvg 18 seconds before the abort. The other break was invisible: oxvg's build lock kept the error from anyone.
- **B's two sentences did nothing measurable.** Titles naming several layers and tests through `Eval` without the checker continued as in TS; missed places rose to 6 of 10 (TS 2, TF 5), which says more about this measure's noise than about B.
- **The score did not move** beyond the noise in either direction.

Transcript analysis: [report](reports/2026-10-09-round32-transcripts.md) (model output; the claims listed at its top were checked by hand). Counts: [`deepswe/traces32.md`](deepswe/traces32.md), [`deepswe/endstate.py`](deepswe/endstate.py), [`deepswe/process.py`](deepswe/process.py).

## Round 33: screen DeepSWE tasks for a recalibrated batch, where a single agent and the swarm both land in the middle (fixed before measuring, 2026-10-09, the commit time; the user's decision after round 32: drop the Rust task and redo the baseline with another, "creo que vamos a quitar la tarea de rust y rehacer el baseline", then "queremos una tarea que solo/baseline queden en rango medio para tener margen de mejora" and "recalibra el lote")

**Why.**
- **Oxvg measures nothing.** It scored 0 in almost every run of every arm since round 23 (non-zero: TF r3 0.5, RC r0 0.667), and also for one agent with 90 minutes (round 17, all 6 new tests panic) and for the swarm with 120 minutes and 337M (round 18). It takes a fifth of the team and the budget and most of the broken trees at the end. Wasmi, also Rust, builds in seconds and stays.
- **The user's criterion:** every task of the batch should leave room to improve, with both a single agent and the default swarm in a middle band. By that criterion two kept tasks are doubtful: tengo (baseline swarm 0.75, TF 0.88) and scriggo (baseline 0.15, one agent 0 in round 17). Since the baseline must be rerun anyway, the whole batch is re-chosen once.

**Candidates.** Ten new DeepSWE tasks chosen and validated by a subagent ([report](reports/2026-10-09-deepswe-candidates2.md), model output; the test counts checked by hand): fast-building Go, Python and JS/TS, a change that crosses several layers or many call sites, one per repository, all passing the driver's dry mode (reference 1.0, base 0, no leak):
- sql-formatter-bigquery-pipe-formatting (TS), sqlfmt-create-table-ddl-formatting (Python), anko-typed-variable-bindings (Go), yaegi-go-embed-directives (Go), katex-multicolumn-array-spans (JS) — group 1;
- meriyah-explicit-resource-declarations (TS), bandit-interprocedural-taint-checks (Python), tomlkit-toml-table-converters (Python), csstree-shorthand-expansion-compression (JS), abs-module-cache-flags (Go) — group 2;
- plus the four kept tasks: expr, wasmi, tengo, scriggo — group 3 (single agent only).

**Arms** (`experiments/deepswe/screen33.sh`, two lanes at once, 120 minutes per batch, k=2):
- **Swarm:** the default 12-agent swarm (`n12-base-peers`, the round 23 baseline profile), 32M per batch of five, on groups 1 and 2. The kept tasks use their round 23 baseline (k=5).
- **One agent per task:** the `isolated` arm (`solo-clock-tokens`, one agent with the clock and the tokens left, a separate run per task), 6.4M per task (the swarm's 32M over five tasks), on groups 1, 2 and 3.

**Rule** (on per-task means of partial credit):
- A task is **eligible** when its single-agent mean and its swarm mean are both in [0.2, 0.7].
- **The new batch is five eligible tasks:** expr and wasmi first if eligible (continuity with rounds 17–32), then the others by the distance of the average of the two means from 0.45, smallest first, at most one per repository.
- **If fewer than five are eligible**, the batch is filled with the tasks whose worse mean lies closest to the band, and this is reported as a deviation; the two reserves of the candidates report (abs-stepped-slices, opa-template-string-reconstruction) are not screened in this round.
- The selection is reported to the user before the new baseline (k=5, its own pre-registration) is launched.

**What is read:** per-task scores and their spread, tokens and minutes, how each run ended (`done`, quiescent, cap), and grading failures (no tests parsed, a timeout). Tasks that score 0 because of a stale generated file (anko's `parser.go.y`, sql-formatter's `grammar.ne`) are noted as such.

**Smoke:** none with a model. The arms and profiles are the ones used since rounds 17 and 23, and every new task passed the dry mode.

**Estimate:** swarm 4 × 32M = 128M; one agent per task up to 6 × 32M, in practice about 30–60M (in round 17 single agents used 0.5–12M per task). About $3; 2–4 hours with the two lanes at once.

**Amendment (2026-10-09 ~21:00, while the last swarm batch `s33-swarm-g2-r1` was running; the user's decision, "Calibra solo con swarm").**
- **Eligibility uses the swarm mean only:** a task is eligible when the default swarm's mean is in [0.2, 0.7]. The single agent is still measured and reported, as the comparison, but not used to select.
- **Why:** the single agent's scores track when it gives up, not how hard the task is. It called `done` after 0.25–6M of its 6.4M (meriyah 0.25M in 1.1 minutes, 0; bandit 0.25M in 1.8 minutes, 0.98; katex 0.67M in 2.7 minutes, 0, against 0.96 in the other repetition), so its "middle" means were often 0 and 1 averaged.
- **More candidates:** the new tasks were mostly easy for the swarm (all of group 2 at 0.88 or more in its first repetition), so a second, harder selection (changes that cross a parser, checker, compiler or interpreter, like expr, tengo, scriggo and anko) is validated without a model and screened with the swarm in a follow-up batch under the same rule (k=2, 32M per batch of five).

**Amendment 2 (2026-10-09 ~21:50, after the first set finished and before the second set was launched; the user approved the main session's recommendation, "Sigue tu recomendaciónes").**
- **First set, swarm means (k=2):** anko 0.52, yaegi 0.48 (0.97, 0), bandit 0.44 (0.88, 0), abs 0.74, sql-formatter 0.84, sqlfmt 0.88, tomlkit 0.90, csstree 0.90, meriyah 0.95, katex 0.99. With expr 0.42 and wasmi 0.46 (round 23), exactly five were eligible, but two of them are all-or-nothing.
- **Second set:** ten more candidates ([report](reports/2026-10-09-deepswe-candidates3.md), model output; three tasks' test counts checked by hand), screened with the default swarm only (`deepswe/screen33b.sh`, two groups of five, 32M, k=2, the two groups at once): group h1 tengo-callable-instance-isolation, dynamodb-toolbox-lazy-recursive-schemas, python-statemachine-state-data-scoping, helm-array-merge-strategies, gql-incremental-graphql-delivery; group h2 kea-atomic-signal-selectors, adaptix-name-mapping-aliases, kombu-virtual-queue-dead-lettering, superjson-error-stack-serialization, task-task-graph-export.
- **Selection rule, final:**
  - eligible: swarm mean in [0.2, 0.7] (both sets; expr, wasmi, tengo and scriggo from round 23);
  - a task is **all-or-nothing** when every one of its swarm runs is ≤0.1 or ≥0.85; all-or-nothing tasks rank after every other eligible task;
  - then expr and wasmi first, then the distance of the swarm mean from 0.45, smallest first;
  - at most one task per repository.

**Known threats:**
- k=2 is a screen; a task's mean can move by ±0.3 between runs (Pi alone spans 0.0–0.75 on one task).
- A swarm's per-task score depends on the other four tasks of its batch (agents spread over them), and the groups here differ from the final batch.
- The kept tasks' swarm values come from round 23 (with oxvg in the batch), not from this screen.
- The band and the tie-breaking are the main session's proposal, not calibrated.

### Round 33 result and rule applied (2026-10-09 23:40; batches 17:17–19:20 and 20:17–21:23 UTC, code `c68fc44`)

**Default swarm (`n12-base-peers`, 12 agents, 32M per batch of five), k=2, per-task means of partial credit:**

| task | runs | mean | eligible | all-or-nothing |
|---|---|---:|---|---|
| expr (round 23, k=5) | 0.20, 0.54, 0.56, 0.00, 0.80 | 0.420 | yes | no |
| wasmi (round 23, k=5) | 0.14, 0.36, 0.36, 0.82, 0.64 | 0.464 | yes | no |
| tengo (round 23, k=5) | 0.95, 0.93, 0.86, 0.15, 0.86 | 0.749 | no | |
| scriggo (round 23, k=5) | 0.00, 0.75, 0.00, 0.00, 0.00 | 0.150 | no | |
| anko-typed-variable-bindings | 0.473, 0.556 | 0.514 | yes | no |
| yaegi-go-embed-directives | 0.974, 0.000 | 0.487 | yes | yes |
| bandit-interprocedural-taint-checks | 0.879, 0.000 | 0.440 | yes | yes |
| abs-module-cache-flags | 1.000, 0.476 | 0.738 | no | |
| sql-formatter-bigquery-pipe-formatting | 0.692, 1.000 | 0.846 | no | |
| sqlfmt-create-table-ddl-formatting | 0.875, 0.875 | 0.875 | no | |
| tomlkit-toml-table-converters | 0.917, 0.883 | 0.900 | no | |
| csstree-shorthand-expansion-compression | 0.886, 0.899 | 0.893 | no | |
| meriyah-explicit-resource-declarations | 0.959, 0.939 | 0.949 | no | |
| katex-multicolumn-array-spans | 0.979, 1.000 | 0.990 | no | |
| tengo-callable-instance-isolation | 0.913, 0.522 | 0.718 | no | |
| dynamodb-toolbox-lazy-recursive-schemas | 0.297, 0.703 | 0.500 | yes | no |
| python-statemachine-state-data-scoping | 0.569, 0.597 | 0.583 | yes | no |
| helm-array-merge-strategies | 0.843, 0.196 | 0.519 | yes | no (0.843 is 0.007 under the 0.85 line) |
| gql-incremental-graphql-delivery | 0.941, 0.941 | 0.941 | no | |
| kea-atomic-signal-selectors | 0.333, 0.917 | 0.625 | yes | no |
| task-task-graph-export | 0.300, 0.950 | 0.625 | yes | no |
| superjson-error-stack-serialization | 0.738, 0.900 | 0.819 | no | |
| adaptix-name-mapping-aliases | 0.864, 0.909 | 0.887 | no | |
| kombu-virtual-queue-dead-lettering | 0.957, 0.941 | 0.949 | no | |

**One agent per task** (`isolated`, `solo-clock-tokens`, 6.4M per task), k=2, reported as the comparison and not used to select (amendment 1): sql-formatter 1.0, sqlfmt 0.91, anko 0.48, yaegi 0.01, katex 0.48 (0.96, 0), meriyah 0.45 (0, 0.9), bandit 0.49 (0.98, 0), tomlkit 0.80, csstree 0.93, abs 1.0, expr 0.35, wasmi 0.56, tengo 0.67, scriggo 0. The second set was not run with one agent.

**Rule as written (amendment 2):**
- Eligible and not all-or-nothing: expr, wasmi, dynamodb-toolbox (0.050 from 0.45), anko (0.064), helm (0.069), python-statemachine (0.133), kea and task (0.175). All-or-nothing, ranked last: bandit, yaegi.
- Order: expr and wasmi first, then dynamodb-toolbox, anko, helm. Five repositories, no clash.
- **Batch by the rule: expr, wasmi, dynamodb-toolbox-lazy-recursive-schemas, anko-typed-variable-bindings, helm-array-merge-strategies** (Go ×3, Rust, TypeScript).
- **Borderline:** helm's two runs (0.843, 0.196) behave like the all-or-nothing tasks the rule meant to push down, and miss the line by 0.007. The next task by the rule, python-statemachine (0.569, 0.597, Python), is the stable alternative. Reported to the user as a choice before the baseline; not resolved here.

**Grading checks (by hand):**
- Three runs parsed far fewer tests than the reference total. In the two batch tasks the swarm's code panicked and killed the test binary, so the remaining tests count as failures (a real defect, not a grading fault): helm h1-r1 19 of 57 (an interface conversion panic in the new merge path), anko g1-r0 76 of 102 (assignment to a nil map in `vm`; the parser was regenerated, so not the stale `parser.go.y` case). abs g2-r1 parsed 17 of 23 with plain failures and no panic; the six missing tests were not traced (abs is not selected).
- Two score files checked against the batch result (helm h1-r1 0.196, dynamodb h1-r1 0.703): they match.

**How the runs ended:** the first set ended mostly by `all_done` (3 of 4 batches, 11.5–29.8M), the second set always at the 32M cap (17.9–38.1 minutes). The second set is harder for the swarm, as intended.

**Cost:** swarm 231.0M ($3.66: first set 102.8M, second 128.2M), one agent 50.8M ($0.89); 281.8M, $4.55 in all.

**Pending, once the new baseline is chosen and run** (done in round 34) (its own pre-registration, k=5, `n12-base-peers`, 32M): `compare.py`'s default baseline, the round 23 sentence in AGENTS.md ("the baseline is round 23"), and the TL;DR of `docs/research.md` all change to the new batch. Rounds 23–32 stay comparable only with each other.

## Round 34: the new fixed baseline on the recalibrated DeepSWE batch (fixed before measuring, 2026-10-10, the commit time; the user approved the main session's recommendation after round 33, helm swapped for python-statemachine: "Si, adelante con lo recomendado")

**Why.** Round 33 re-chose the batch. The rule picked expr, wasmi, dynamodb-toolbox, anko and helm. Helm (0.84, 0.20) is all-or-nothing in substance and missed the line by 0.007, so the user took the stable next task, python-statemachine (0.57, 0.60). Every later arm is compared with this baseline, so it is measured once, with the default swarm, at k=5.

**Tasks** (`refs/*.json` committed in round 33, all passing the driver's dry mode): expr-try-catch-errors (Go), wasmi-trap-coredumps (Rust), dynamodb-toolbox-lazy-recursive-schemas (TypeScript), anko-typed-variable-bindings (Go), python-statemachine-state-data-scoping (Python).

**Arm:** the default 12-agent swarm (`n12-base-peers`, the round 23 baseline profile, unchanged), 32M per batch of five, 120 minutes, k=5, the batches one after another (`experiments/deepswe/batch34.sh`, ids `e34-base-r0..r4`), as in rounds 23–32.

**No decision rule:** this round measures the reference. What is read: the per-run five-task means and their spread, per-task means, how each run ended, broken trees (no existing test passes) and grading failures.

**Checks, reported but not acted on automatically:**
- if a task's k=5 mean falls outside [0.2, 0.7], or every one of its runs is ≤0.1 or ≥0.85, it is reported to the user, who decides whether to keep it (a swap would need a new baseline);
- the spread of the run means is compared with round 23's (sd 0.135), since it sets the smallest decidable difference.

**After the round:** `compare.py`'s default baseline becomes `e34-base-r0..r4`; the baseline sentence in AGENTS.md and the TL;DR of `docs/research.md` change to this batch. Rounds 23–32 stay comparable only with each other.

**Smoke:** none with a model. The profile is unchanged since round 23 and every task passed the dry mode and the round 33 screen.

**Estimate:** 5 × 32M = 160M, about $2.6, 1.5–2 hours.

**Known threats:**
- k=5: the round 23 baseline spanned 0.19–0.52 on identical runs, so the reference itself carries noise of about ±0.06 on its mean.
- Two tasks (expr, wasmi) have swarm values from a batch that included oxvg; their scores may move with the new neighbours.
- The selection used the swarm screen (k=2), so the chosen tasks' means may regress towards the extremes.

### Round 34 result (2026-10-10; batches 22:14–23:30 UTC on 2026-10-09, code `d5ac689`)

| task | runs | mean (sd) | round 33 screen (k=2) |
|---|---|---:|---:|
| expr | 0.000, 0.342, 0.038, 0.000, 0.645 | 0.205 (0.285) | 0.420 (round 23) |
| wasmi | 0.636, 0.364, 0.955, 0.364, 0.000 | 0.464 (0.356) | 0.464 (round 23) |
| dynamodb-toolbox | 0.784, 0.513, 0.432, 0.324, 0.162 | 0.443 (0.232) | 0.500 |
| anko | 0.222, 0.556, 0.556, 0.556, 0.222 | 0.422 (0.183) | 0.514 |
| python-statemachine | 0.556, 0.958, 0.931, 0.569, 0.583 | 0.719 (0.206) | 0.583 |
| **five-task mean** | 0.440, 0.546, 0.582, 0.362, 0.323 | **0.451** (0.113) | |

160.2M tokens, $2.43. Every run ended at the 32M cap, after 11.3–15.0 minutes. No usage-limit stop, no invalid batch.

**Checks as pre-registered:**
- **python-statemachine's mean, 0.719, is just above the band** (0.7); it is not all-or-nothing (0.56–0.96). Reported to the user.
- **expr fell to 0.205**, inside the band, because two of its five trees were broken at the end (r0: `vm.handleTryPanic undefined`; r3: `*ast.TryNode does not implement ast.Node`); with r2 (0.038) it scored under 0.05 three times.
- **Broken trees: 3 of 25** (expr r0, expr r3, wasmi r4 with five rustc errors in the lib tests), each checked by hand in the `base.log` of the grading.
- **Spread:** sd 0.113 against round 23's 0.135. With the exact permutation rule at k=5, a simulated difference of +0.23 is decided about 80% of the time (+0.20 about 70%, +0.15 about 43%).

**Switched:** `compare.py`'s default baseline is now `e34-base-r0..r4`; AGENTS.md and README.md say so.

**Findings from the transcripts** ([report](reports/2026-10-10-round34-transcripts.md), model output; three claims checked by hand):
- **The three broken trees are the cap cutting an unbuilt edit burst:** expr r0 (heron called `vm.handleTryPanic` 0.5 minutes before the cap and never defined it; it ran no build on expr), expr r3 (linnet added `TryNode` without `String()` 2.1 minutes before the cap, last build before its syntax edits), wasmi r4 (crane mid-refactor; a teammate's `cargo test` 0.1 minutes before the cap shows the errors). The same failure as in rounds 23–32, now on the new batch.
- **Owners leave hard slices early:** 29 `done` calls; 10 from agents that never edited (0.6–3.1 minutes, 84–99% of the budget left, "every repository is claimed"), and 6 from owners who said the rest was unfinished (2.0–6.4 minutes, 75–95% left). A run scored high when one agent picked up the orphaned slice alone (wasmi r2 0.955, expr r4 0.645) and low when several split it without integrating (wasmi r3).
- **Per task, one missing layer decides the score:** expr's parser/compiler/VM work started at 5.3–13.8 minutes, and every run missed a part (block `try {}`, named catch); python-statemachine scored 0.93–0.96 when the async engine got the change and 0.56–0.58 when only the base engine did (27 of the 30–32 failures are `[async]`); anko's 0.222 runs parsed the type as a bare identifier (`[]int64`, `map`, `*T` fail), and every run returns the assigned value instead of `nil` on a type error, the repo's `RunOutput` convention; dynamodb-toolbox has one different defect per run.
- **Other costs:** one agent spent 33% of r0's tokens hopping across three tasks and finished none; cargo lock waits 1–8 per batch; no hang.

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
| 2026-10-03 | round 11 phase 1 P (18 campaigns `20261003T080953Z-d3f8b556` → `20261003T100111Z-917d6ddb`, seed 20261053, code `7651a12`) | Pi, solo, solo-norms, solo-norms-clock (all n=1, no oracle) | 6 blind tasks × 3 | 12.2M | contract: 0.02–0.60 without clock, 0.91–0.96 with it; optimisation ≤ 0.17 for all | R1 passes (+0.071, carried by ieh), R2 not decided (+0.020), R3 passes (+0.255, 6/6) |
| 2026-10-03 | round 11 phase 1 O (3 campaigns `20261003T080947Z-2337418f` → `20261003T083957Z-55dea7a2`, seed 20261054) | solo-norms-clock | ospec_brown_blind × 3, 6M | 18.2M | 0.47, 3/3 capped | enters phase 2 (flagged) |
| 2026-10-03 | round 11 phase 1 C (18 campaigns `20261003T100141Z-ac05f238` → `20261003T110416Z-9d1641ed`, seed 20261055) | solo, solo-clock | 6 blind tasks × 3 | 9.4M | solo-clock − solo +0.335, 6/6 | R4 passes; only shop2 and ospec pass calibration |
| 2026-10-03 | round 12 tools (4 campaigns `20261003T114648Z-eb5e6f59` → `20261003T122926Z-b6187a74`, seed 20261056, code `07b6cf4`) | Pi, G solo-clock, GA +append, GDA +append+descriptions, DA without guard | information_extraction_hard_blind × 4 | 18.7M | G 0.909, GA 0.843, GDA 0.747, DA 0.972, Pi 0.443; with append: 1 write per run instead of 3, 0 refusals, fewer wasted calls | phase 2 keeps G by the rule (GA and GDA fail the score clause, which noise dominates) |
| 2026-10-03 | round 13 calibration (12 campaigns `20261003T130631Z-ab2cbcbc` → `20261003T141549Z-9d503af0`, seeds 20261057 and 20261059, code `7f2c84d`) | Pi, C1 solo-clock | planning, ieh2, fam_payouts × 3 (3M); ospec_green × 3 (6M) | 25.3M | C1 0.465 / 0.847 / 1.000 / 0.425 (2/3 capped) | planning and ospec_green enter phase 2 |
| 2026-10-03 | round 14 phase 2, stage D + 1 V run (7 valid campaigns `20261003T144556Z-fb37df36` → `20261003T153036Z-5adae0be`, seeds 20261066 and 20261060, code `429cbb3`; 5 more invalid, see the note) | C1, S2c, solo, S2 | planning, shop2 × 3; ospec_brown × 1 (C1) | 24.0M | descriptive: S2c − C1 −0.11 / +0.12 at 3.5–5× tokens; S2 stops as early as solo | stopped by the model quota; rules not applied |
| 2026-10-03 | smoke n=12 (`runs/20261003-193607-2967`, deleted) | s2-board-clock n=12 | trio × 1 | 347k | all_done in 52 s; 9 write refusals; all 12 agents wrote all 3 files | 12 agents work; tokens/min with small contexts only |
| 2026-10-03 | smoke new levers (5 runs, deleted) | stagger by turns n=3, task list n=2, branches required n=2, branches optional n=2, default n=3 | scripted × 1, trio × 2 | 385k | all pass; see the 21:50 note | levers OK |
| 2026-10-03/04 | round 15 stage A (28 valid campaigns `20261003T200851Z-dd25b816` → `20261003T225411Z-391aeba3`, seed 20261070, code `f8a6693`; 1 invalid, `20261003T202310Z-6f2a1318`) | C1 solo-clock n=1; B s2-board-clock, TL n12-tasks, BR n12-branches, BO n12-branches-optional, ST n12-stagger, RO n12-roles (n=12) | planning, shop2 × 2, 12M cap | 188.5M | two-task means: BR 0.534, ST 0.506, RO 0.398, C1 0.343, B 0.305, TL 0.205, BO 0.122 | L: ST pronounced better, TL pronounced worse (at threshold); S: BR and ST beat C1 at 23–27× tokens, BO loses; stage B gets B, C1, ST |
| 2026-10-04 | round 15 stage B (6 valid campaigns `20261004T052617Z-702c5333` → `20261004T064229Z-4b350f75`, seed 20261072, code `f4c5f63`) | C1 solo-clock n=1; B s2-board-clock, ST n12-stagger (n=12) | ospec_green_blind × 2, 24M cap, 1920 s | 117.8M | ST 0.869, B 0.734, C1 0.447; swarms all capped at ~7 min, C1 done at ~11M | ST pronounced better than B (+0.135); B and ST beat C1 (+0.29, +0.42) at 2.2× tokens |
| 2026-10-04 | round 15 stage C, closed early (6 valid campaigns `20261004T072757Z-102de6ff` → `20261004T081156Z-cfaad405`, seed 20261074, code `10e6f54`; 1 invalid, `20261004T084418Z-f23dfd8d`, quota) | C1T solo-clock-tokens n=1 (k=1); STT n12-stagger-tokens n=12 (k=2) | ospec_green, ospec_brown, 24M, 60-minute clock | 154.6M | STT 0.959, C1T 0.952; all valid runs capped | not decided (C1T k=1); volume tasks saturated; the user moves to quality-bound tasks calibrated against C1T |
| 2026-10-04 | round 16 stage A (12 valid campaigns `20261004T154422Z-5d32faf7` → `20261004T171634Z-37116428`, seed 20261080, code `b438df5`) | C1T solo-clock-tokens n=1; STT n12-stagger-tokens, STH n12-stagger-threads-tokens (n=12) | planning, shop2 × 2, 12M | 72.7M | two-task means: STT 0.545, C1T 0.524, STH 0.470; C1T spends 0.5M per run | STT vs C1T not decided; STH loses to C1T; threads not pronounced vs posts |
| 2026-10-04 | round 16 side test U (6 campaigns `20261004T182025Z-4f3259e1` → `20261004T182208Z-ee9d90bc`, seed 20261090, code `e5f402f`) | C1T solo-clock-tokens, CU solo-clock-unlimited, C0 solo (all n=1) | shop2 × 2, 24M, 3720 s | 0.29M | means: C0 0.130, C1T 0.000, CU 0.000; CU 35–51 s, C1T 115–130 s | no difference in any pair; "unlimited" does not lengthen work |
| 2026-10-04 | round 16 stage D, DeepSWE calibration (batches `cal16-r0`, `cal16-r1`, `isolated` arm, code `4833873`; fd r1 rescored after a cargo cache fault) | C1T solo-clock-tokens n=1 per task | expr, termenv, cattrs, fd × 2, 48M shared, 90 min | 19.7M | means: termenv 1.000, fd 0.989, cattrs 0.972, expr 0.671 (partial credit) | three tasks excluded (≥ 0.85); only expr stays; stage E needs new tasks |
| 2026-10-04/05 | round 17 (18 campaigns `20261004T210830Z-5a3ac503` → `20261004T220858Z-7ac6739b`, seed 20261101, code `73ff3e7`) | C1T solo-clock-tokens; C1TR solo-clock-tokens-relay2 (n=1); AUD n3-audit-tokens (n=3) | planning, shop2 × 3, 12M, 3720 s | 27.1M | means: AUD 0.348, C1TR 0.313, C1T 0.238 | AUD beats C1T (shop2-led); C1TR vs C1T and AUD vs C1TR not decided; quiet regrade confirms the grades |
| 2026-10-04/05 | round 17 stage S, DeepSWE screen (batches `scr17-b1` to `scr17-b3`, `isolated` arm, code `497b6d9`) | C1T solo-clock-tokens n=1 per task | 12 candidates × 1, 48M shared per batch, 90 min | 46.1M | 4 below 0.85: oxvg 0, scriggo 0, tengo 0.44, wasmi 0.64 | those 4 plus expr go to stage E |
| 2026-10-05 | round 17 stage E, DeepSWE batch (batches `e17-swarm-r0/r1`, `e17-solo-r0/r1`, code `37213a7`) | STT n12-stagger-tokens (n=12); C1T solo-clock-tokens (n=1) | expr, oxvg, scriggo, tengo, wasmi × 2, 32M shared, 120 min | 70.3M | five-task means: STT 0.408, C1T 0.045 (C1T gave up at 14–19 min with 3.1M) | STT beats C1T by the rule; the margin is mostly C1T stopping early |
| 2026-10-05 | round 18, DeepSWE batch (batches `e18-swarm-r0/r1`, `e18-solo-r0/r1`, code `7eeeca4` r0, `3c02043` r1) | ST n12-stagger (n=12); C1P solo-clock-persist (n=1) | 10 DeepSWE tasks × 2, 400M cap, 120 min | 375.5M ($4.86) | ten-task means: ST 0.563, C1P 0.038; C1P stopped at 13.9 and 1.3 min; ST r0 quiescent at 35 min, r1 to the clock | ST beats C1P by the rule; the margin is again the single agent stopping, and the swarm's two repetitions differ by 0.22 |
| 2026-10-05 | round 19, DeepSWE batch, stopped by the quota (valid `e19-stagger-r0`, `e19-stagger-tail-r0`, `e19-stagger-file-r0`; invalid `e19-stagger-threads-r0`, `-norms-r0`, `-tasks-r0`; code `3c02043`) | ST n12-stagger, ST-tail n12-stagger-tail, ST-file n12-stagger-file (n=12, k=1) | expr, oxvg, scriggo, tengo, wasmi × 1, 32M, 120 min | 100.7M ($1.84; 25.5M invalid) | five-task means: ST 0.351, ST-tail 0.275, ST-file 0.234 | no rule applied (k=1, wave 2 invalid); resume or close is the user's call |
| 2026-10-05/06 | round 20, DeepSWE batch (batches `e20-{stagger,stagger-depart,stagger-status,stagger-tasks}-r{0,1}`, code `ed4fb54`; two runs rerun after a model API outage) | ST n12-stagger, ST-depart n12-stagger-depart, ST-status n12-stagger-status, ST-tasks n12-stagger-tasks (n=12) | expr, oxvg, scriggo, tengo, wasmi × 2, 32M, 120 min | 256.2M ($4.11) | five-task means: ST 0.365, ST-depart 0.303, ST-status 0.288, ST-tasks 0.341; posts addressed to departed agents 14 / 0 / 0 / 5; untouched repositories 3 / 0 / 0 / 0 | ST-status worse by the rule; ST-depart and ST-tasks not decided; the notices remove talk to departed agents and every new arm covers every repository |
| 2026-10-06 | round 21, DeepSWE batch, rival teams (batches `e21-teams-r{0,1}`, `e21-solo-r{0,1}`, code `46f2aff`) | Teams: three teams of 3 (n12-base each), told to finish above the others, reading the rivals' repositories at /rivals and told, falsely, they are unseen; Solo solo-clock (n=1) | expr, oxvg, scriggo, tengo, wasmi × 2, 8M per team and for the solo agent, 120 min | 50.9M ($0.82) | five-task means: teams 0.169 (team range 0.025–0.294), solo 0.015 (stopped at 16.6 and 3.2 min); 78 calls on /rivals, 2 files copied whole; oxvg 0.667 best on that task | teams above by the rule (+0.154, 4 of 5), screen at k=2, no verdict; the margin is mostly the solo agent stopping |
| 2026-10-06 | round 22, DeepSWE batch, rival teams sharing a pool, closed after the quota stop (valid `e22-teams-r0`, `e22-swarm-r0`, `e22-swarm-r1`; invalid `e22-teams-r1`; code `aca4e9b`) | Teams: three teams of 4 (n12-base-peers), one 32M pool, rivalry text and /rivals as in round 21; Swarm: n12-base-peers n=12, 32M | expr, oxvg, scriggo, tengo, wasmi; teams × 1, swarm × 2; 120 min | 112.5M ($1.85; 16.2M invalid) | five-task means: teams 0.239 (0.357, 0.276, 0.085), swarm 0.303 (0.320, 0.285); pool split 12.7M / 12.9M / 6.6M | no rule applied (closed by the user at k=1 / k=2); the arithmetic would be not decided (2 of 5 each way) |
| 2026-10-07 | round 23, the fixed baseline (batches `e23-base-r0` to `r4`, code `0b0e12c`) | Baseline: n12-base-peers n=12 (the defaults of `03aa568`) | expr, oxvg, scriggo, tengo, wasmi × 5, 32M, 120 min | 160.3M ($2.52) | five-task mean 0.357 (sd 0.135, 0.19–0.52); per task expr 0.420, oxvg 0, scriggo 0.150, tengo 0.749, wasmi 0.464 | reference for later arms; rerun only when defaults, model, tasks or setup change |
| 2026-10-07 | round 24, calling departed agents back (batches `e24-mention-r0..r4`, `e24-mtasks-r0..r4`; code `cd5cfde`, from `e24-mtasks-r2` `3e52e3e`) | M n12-mention, MT n12-mention-tasks (n=12), against the round 23 baseline | expr, oxvg, scriggo, tengo, wasmi × 5 each, 32M, 120 min | 320.4M ($5.03) | five-task means: M 0.434 (0.17–0.64), MT 0.370 (0.29–0.50), baseline 0.357; revivals M 5, MT 8 (4 by one @all); 8 of 174 mentions reached a departed agent | both not decided (p 0.46 and 0.85); callbacks work but are rarely used, early departures unchanged |
| 2026-10-07/08 | round 25, roles without owners and a budget clock (batches `e25-roles-r0..r4`, `e25-rclock-r0..r4`, code `7f6d59e`) | R n12-roles9, RC n12-roles9-clock (n=12), against the round 23 baseline | expr, oxvg, scriggo, tengo, wasmi × 5 each, 32M, 120 min | 285.1M ($4.53) | five-task means: R 0.241, RC 0.190, baseline 0.357; `done` per run R 0–1, RC 11–12; write/edit per run R 82–125, RC 53–84, baseline 125–165 | both not decided (p 0.20 and 0.071, RC's interval below 0); roles end early departures but build less; the budget clock makes the team wrap up and stop with budget left |
| 2026-10-08 | round 26, roles that mostly build with the task list for findings (batches `e26-rtasks-r0..r4`, code `f602660`) | RT n12-roles9-tasks (n=12), against the round 23 baseline | expr, oxvg, scriggo, tengo, wasmi × 5, 32M, 120 min | 160.1M ($2.63) | five-task mean RT 0.292 (0.09–0.44), baseline 0.357, R 0.241; write/edit per run 119–150; 44 task items, 17 of 31 non-builder items taken by another agent, 8 of those done; expr core reached in 4 of 5 runs | not decided (p 0.44); building and expr recover from R, wasmi lost to two broken final builds |
| 2026-10-08 | round 27, a weighted, shared task list and building from the heaviest item (batches `e27-rweights-r0..r4`, code `7e54b16`) | RW n12-roles9-weights (n=12), against the round 23 baseline | expr, oxvg, scriggo, tengo, wasmi × 5, 32M, 120 min | 160.2M ($2.67) | five-task mean RW 0.351 (0.19–0.44), baseline 0.357, RT 0.292; 97 task items, 70 of weight ≥7 (32 of weight 10); 21 items with two or more holders | not decided (p 0.91); weights inflated, projects decomposed in the first minute, heavy items mostly taken by their author |
| 2026-10-08 | round 28, RW with parts read from the code, a weight guide, a slower stagger and three working rules (batches `e28-rparts-r0..r4`, code `e1d84cf`) | RP n12-roles9-parts (n=12), against the round 23 baseline | expr, oxvg, scriggo, tengo, wasmi × 5, 32M, 120 min | 160.2M ($2.61) | five-task mean RP 0.422 (0.28–0.52), baseline 0.357, RW 0.351; entry spread over 6.4–8.7 min; weights 1–3/4–7/8–10: 25/66/8 of 99; duplicate decompositions 6 of 25 | not decided (p 0.39); highest mean so far; expr r1 core started at 13.9 of 14 min; oxvg 0 in every run |
| 2026-10-08 | round 29, end-to-end tests before implementation, build items per layer, idle-holder marks (batches `e29-rtests-r0..r4`, code `9b74367`) | TF n12-roles9-tests (n=12), against the round 23 baseline | expr, oxvg, scriggo, tengo, wasmi × 5, 32M, 120 min | 160.1M ($2.59) | five-task mean TF 0.439 (0.31–0.62), baseline 0.357, RP 0.422; first write a test in 24 of 25 projects; oxvg 0.5 in r3 (first non-zero); 37 idle marks shown, none acted on | not decided (p 0.38); highest mean so far; the strict rule starved the Rust projects; layers split without an integrator (scriggo r1–r4) |
| 2026-10-08 | round 30, an integrate item per project, stubs before tests, no idle marks (batches `e30-rinteg-r0..r4`, code `3e23e34`) | TI n12-roles9-integrate (n=12), against the round 23 baseline | expr, oxvg, scriggo, tengo, wasmi × 5, 32M, 120 min | 160.1M ($2.54) | five-task mean TI 0.434 (0.34–0.56), baseline 0.357, TF 0.439; integrate items in 8 of 25 projects, 4 done; stubs barely used; oxvg 0 in every run | not decided (p 0.32); ties TF; scores follow whether every layer was built, not the integrate item; oxvg starved by cold Rust builds |
| 2026-10-09 | round 31, trace the siblings of what is new, a failing end-to-end test is open work (batches `e31-rsibl-r0..r4`, code `5048291`) | TS n12-roles9-siblings (n=12), against the round 23 baseline | expr, oxvg, scriggo, tengo, wasmi × 5, 32M, 120 min | 160.1M ($2.63) | five-task mean TS 0.368 (0.14–0.53), baseline 0.357, TF 0.439; missed places 2 of 10 (TF 5); tengo r1 0 (a test file that never ends), wasmi r4 0 (edit 2 s before the cap) | not decided (p 0.91); the targeted measure moved but scores did not; loopholes: multi-layer item titles, end-to-end tests through a shortcut entry point |
| 2026-10-09 | round 32, a deadline notice at 75% of the budget, one layer per build item, end-to-end tests through the user's path (batches `e32-rdead-r0..r4`, code `3f2065b`) | TD n12-roles9-deadline (n=12), against the round 23 baseline | expr, oxvg, scriggo, tengo, wasmi × 5, 32M, 120 min | 160.2M ($2.67) | five-task mean TD 0.405 (0.34–0.50, sd 0.067), baseline 0.357, TS 0.368, TF 0.439; broken trees 2 of 25 (TS 4), one from an edit after the notice; no hang, no `done` after the notice, late writes 63 (TS 99); missed places 6 of 10 | not decided (p 0.48); A removed hangs and early stops but not the late break; B changed nothing measurable |
| 2026-10-09 | round 33, screen for a recalibrated DeepSWE batch (batches `s33-swarm-g{1,2}-r{0,1}`, `s33-swarm-h{1,2}-r{0,1}`, `s33-solo-g{1,2,3}-r{0,1}`, code `c68fc44`) | default swarm n12-base-peers (n=12, 32M per batch of five); one agent per task solo-clock-tokens (6.4M per task) | 20 new candidates × 2 (swarm), first 10 + expr, wasmi, tengo, scriggo × 2 (one agent) | 281.8M ($4.55) | swarm means in [0.2, 0.7]: expr 0.42, wasmi 0.46, dynamodb-toolbox 0.50, anko 0.51, helm 0.52 (0.84, 0.20), python-statemachine 0.58, kea 0.63, task 0.63; all-or-nothing bandit 0.44, yaegi 0.49; 10 of 20 new tasks at 0.8 or more | batch by the rule: expr, wasmi, dynamodb-toolbox, anko, helm; helm borderline, python-statemachine the alternative, to the user before the new baseline |
| 2026-10-10 | round 34, the new fixed baseline on the recalibrated batch (batches `e34-base-r0..r4`, code `d5ac689`) | default swarm n12-base-peers (n=12) | expr, wasmi, dynamodb-toolbox, anko, python-statemachine × 5, 32M, 120 min | 160.2M ($2.43) | five-task mean 0.451 (0.32–0.58, sd 0.113); expr 0.205, wasmi 0.464, dynamodb-toolbox 0.443, anko 0.422, python-statemachine 0.719 (just above the band); broken trees 3 of 25 | the new baseline; `compare.py` defaults to it; python-statemachine's 0.72 reported to the user |
