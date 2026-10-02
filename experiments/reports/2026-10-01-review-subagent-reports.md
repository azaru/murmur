# Subagent reports behind the adversarial review and the DeepSWE check (2026-10-01)

These are condensed reports from read-only Claude Code subagents. They are model output: treat them as analyses, not ground truth. Claims marked **[verified]** were re-checked by hand before they were used in a decision.

## A. Methodology and thesis audit

Sources: `experiments/plan.md` and `../swarmtest/runs/*/record.json`.

1. **Same-profile n=3 vs n=1 is essentially absent.**
   - The only pair is c4 n=3 (k=1) against c4n1 (k=3), from `criba12-rows.json`: cph 0.33 vs 0.40, durable 0.83 vs 0.59, ieh 0.61 vs 0.67. Mean 0.59 vs 0.55, carried by one durable run.
   - Single-agent baselines in use: Pi n=1 (k=11–13 per task in cribas 1–2), c4n1, c4g-guard (the criba 3 control), and c4g-relay (prepared but not launched). The default murmur n=1 appears only in the F1 pilot.
2. **The criterion has never been met as written.**
   - No confirmation campaign was run. c5 passes only the criba 2 internal rule (+0.22 vs c4n1, 4 of 4): cph 0.43 vs 0.40, durable 0.99 vs 0.59, ieh 0.93 vs 0.67, fih 1.00 vs 0.83 (k=1).
   - Deviations: x1 went to k=2 by choice; the per-run cap went from 1.5M to 3M (13 of 95 rows in `criba12-rows.json` end as `token_budget`); the F1 board rule was never completed; criba 2 pools criba 1; fih v4 entered at k=1.
3. **Timeouts and `token_budget` runs are graded, not null** **[verified]**.
   - `runner.py:297-316` calls `grade()` whatever the status, and `grading.py:22-28` returns 0.0 on grader failure. 0 of 251 records have a null score.
   - The real hole: a capped run stops its campaign (`usage_unknown_or_cleanup_unconfirmed`, 19 campaigns), so its partner may never run, and `arms.mjs` skips the pair.
4. **Graders see the workspace by path but collect only named files.**
   - No pytest discovery, so `attempts/`, `NOTES-*.md` and `swarm_tests/` are not collected. ieh's grader copies the whole workspace except `corpus/`.
   - Not checked: whether agents can read `../swarmtest/tasks/*/grader.py` from the workspace. Later verified that they can, by relative path.
5. **The evidence base is thin.** Strongest claim: c5 at k=2/2/2/1 over 4 tasks. Other swarm arms have k=1 on 3 tasks. ieh is bimodal; durable and ieh saturate for strong arms; cph sits on a 0.37 plateau.

## B. Trace scan: how often the suspected bugs fire

Scope: 302 completed runs (174 Pi, 128 murmur). Every acceptance command was `npm run test`.

| Item | Finding |
|---|---|
| A. Masked greens (`check; cp …`, `check \| tail`) | 15 murmur, 0 Pi. 5 were first greens; 1 confirmed false (`cp attempts/robin/planner.py planner.py; npm run test; cp /tmp/origplanner planner.py` printed an AssertionError but exited 0) |
| Quoted-mention greens (`echo '… npm run test …'`) | 12 classified green, 6 of them first greens (~3.5% of 171). They also triggered "PASS" notices |
| B. Missed check forms | 28 murmur and 3 Pi calls ran `python3 public_check.py` directly; 42 ran the agents' own `unittest` suites (not the check). No `npm test` variants |
| C. `done_refused` | 0, because no profile used `doneAfterGreen` yet. The `doneGate` check fired 23 times: 18 exit 0, 5 exit 1 |
| D. Provider errors | 0 `error` events. 10 `stopReason: "error"` messages, all "This operation was aborted", all in runs ended by budget (the swarm's own abort). No real outages |
| E. Tool calls after `done` | 16 agent files (mostly `inbox`). Without a revive, 14 agents acted after `done`; 2 edited or ran bash |
| F. Escapes | 0 accesses outside the workspace, 0 broad kills in ~12,000 bash calls. 212 calls used `/tmp` (177 murmur, 35 Pi) |
| G. `write_refused` | 29: 13 partial write, 10 stale, 6 claimed. Only 2 were followed by `rm`/redirect, and neither by a write |

Summary: masked first greens are rare (1 confirmed false); quoted mentions are the larger source, at ≤ 6% of first greens. The rest are latent or small.

## C. DeepSWE: why every run scores 0.00

Sources: autotuner records and `../deep-swe/tasks/*/tests/test.sh`.

- **Verdict:** this is not an infrastructure bug for Pi. The verifier runs and grades the real workspace.
  - Reward is **binary** **[verified]**: `test.sh` writes 1 only if both the base and the new tests exit 0.
  - Reference patches are 700–1100 lines across 6 or more files **[verified for testem: 728 lines]**.
  - Pi stops after 4–15 steps with partial work.
- **Pi records:**
  - Smoke: 7 steps, no edits, 0-byte patch ("I haven't made changes yet").
  - k=2 on INNER-6: 12 of 12 runs score 0, with 4–15 steps and $0.002–0.007 each. 10 of 12 wrote non-empty patches. Final messages admit partial work.
  - No auth, proxy or network errors.
- **ArcSwarm's zeros are its own bug.** 9 of 12 runs ended "blocked"/"planning_stalled" in planning ("plans using one/two/agent-1..3 rejected as unknown/duplicate"). Some patches contained only the swarm's own `events.ndjson`.
- codex-luna-max on expr-try-catch-errors: 3,416 s, 25.6M input tokens, score 0. This is the strongest evidence of genuine difficulty.
- **Cheapest confirmation:** one oracle run on the smallest task. The suggested `pier run … --agent oracle` flag was not verified.
- **Conclusion:** DeepSWE needs partial credit before it can discriminate between systems.
