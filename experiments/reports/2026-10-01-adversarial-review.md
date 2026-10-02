# Adversarial review of murmur's architecture, code and evidence (2026-10-01)

Requested as "a deep adversarial review of this architecture and code". The review was read-only, with live campaigns running.

**Method:**
- Read all of `src/`, `scripts/`, the swarmtest adapter and the relevant Pi SDK internals.
- Two background subagents checked claims against `experiments/plan.md` and against 302 completed runs. Their reports are in [2026-10-01-review-subagent-reports.md](2026-10-01-review-subagent-reports.md).
- Key claims were re-verified by hand before writing:
  - swarmtest grades every run (`runner.py:310`) and scores grader failures 0.0 (`grading.py:22-28`);
  - Pi's bash tool marks nonzero exits `isError` with "Command exited with code N";
  - Pi's `prompt()` resolves with `stopReason: "error"` instead of throwing;
  - Pi stops a turn when a tool result sets `terminate: true`.

Fixes made afterwards are noted as **[fixed in `<commit>`]**.

## 1. Thesis: swarm effect or persistence effect?

- The pre-registered criterion (`plan.md:10-25`, two confirmation campaigns on a held-out set) has never been run. No confirmation-set task was used. The decision tasks are `*_hard` tasks calibrated on Pi giving up early.
- The registry's own finding (`plan.md:131`): with the same prompt, going from 1 to 3 agents added nothing and cost 7x, and the edge over Pi comes from not stopping on red.
  - That finding is thin too: c4 n=3 at k=1 (cut by the budget twice) against c4n1 at k=3.
  - The only same-profile 1-vs-3 pair in the data is roughly a tie (0.59 vs 0.55), and one durable run decides it.
- Every recent lever (`doneAfterGreen`, `clock`, `relay`, `relayContext`) is n=1-compatible by design. Yet criba 3 compared x1g-* at n=3 against a different n=1 profile (c4g-guard).
  - **Proposed rule:** every new profile also runs at n=1 with the same file, in the same campaign. It was adopted in `plan.md`.
- The best result (c5 vs c4n1, +0.22) has k=2/2/2/1. Two of its tasks are saturated near 1.0. On cph, the only open task, the win is +0.03, and no CI was computed.
- Rule drift:
  - the 1.5M cap became 3M;
  - x1 went to k=2 by choice, not by rule;
  - F1 was stopped at 6/64 runs, yet "board has no effect" rests on it;
  - criba 2 pools criba 1's c4n1 runs.
- Pre-registration lived in a git-ignored folder, so it was not tamper-evident. **[fixed in `138a4d7`]**

## 2. Biases in the measurements (checked against the data)

1. **`arms.mjs` silently drops pairs whose partner never ran.**
   - A run that hits the token cap stops the swarmtest campaign (`runner.py:~322`, 19 campaigns), and `arms.mjs:33` drops the incomplete pair as "skipped".
   - Capped scores are floors, not results (x1g-guard scored 1.0 at 3M and still stopped its campaign).
   - Both effects penalise heavy arms. The criba tables use pooled Pi means and are not affected.
2. **The adapter maps a capped run to `token_budget` even when the check passed** (`swarmtest/adapters/murmur.mjs:66`). A soft budget ending at ~95% of the cap would avoid campaign stops.
3. **The "ran the check" predicate was a substring match** (`swarm.ts:83`, `traces.mjs:47`).
   - Measured: at most ~6% of first greens are false, and 1 is confirmed. The main path is quoted mentions (`echo '... npm run test ...' >> SWARM.md`: 6 of 171 first greens), which also posted false "PASS" notices.
   - The Spearman 0.72–0.80 finding survives.
   - **[fixed in `46e756b`]**: the check must start a statement outside quotes, with no mask after it. `traces.mjs` keeps the old predicate, so historical numbers do not change.
4. **Concurrent runs share `/tmp`.** 212 bash calls wrote to paths like `/tmp/wrenplan.json`, and `NAMES` is a fixed list (`swarm.ts:21`). No collision was verified.

## 3. Bugs to fix before launching the prepared arms

- `doneAfterGreen` gates `done` on the predicate above, and its refusal text tells the agent to end its turn without `done`, which can end a run as `quiescent`. **[predicate fixed in `46e756b`]**
- **Relay race:** `swarm.ts` checked `reason`, awaited `open()`, then `continue`d with no recheck. If the timeout or budget fired inside `open()`, a fresh session ran unaborted. **[fixed in `46e756b`]**
- **`done` does not return `terminate: true`.** 14 agents kept acting after `done`, 2 of them editing. Not fixed: changing it would alter every existing profile.
- **Transcripts are only written at the end of `runSwarm`.** A killed adapter loses `*.messages.json`; `events.jsonl` is incremental.
- **Code version per run is not recorded:** `profile_sha256` hashes the profile, not `src/`. Partly addressed: campaigns since `46e756b` are tied to commits in `plan.md`.

## 4. Latent issues and hardening

- **Provider failures would look like a voluntary stop.** `prompt()` resolves with `stopReason: "error"`, so `.catch` never fires, and the run can end `quiescent` with `usage_complete: true`. 0 real cases in the data.
- **The sandbox gate is CLI-only.** `MURMUR_SANDBOX` is checked in `cli.ts`, but the swarmtest adapter imports `runSwarm` directly, so campaign agents have full bash on the host running all lanes. 0 escapes in ~12,000 bash calls.
- **Claims and guards only cover the `write` and `edit` tools.** `sed -i`, `cat >` and `rm` through bash bypass them, so x1g-lock tests a leaky lock. Path keys differ (`normalize(path)` in the board, workspace-relative in the guard), so absolute-path claims never match. The stale guard is time-of-check vs time-of-use across parallel batches.
- **The write guard blocks chunks 2..n, not chunk 1.** Chunk 1 of a split write keeps the first line and is shorter, so it passes the guard and truncates a teammate's complete file. The guard also refuses legitimate shortening refactors that change the top of a file.
- **Smaller ones:**
  - `notices` without `delivery: "attach"` accumulates undelivered notices;
  - relays inherit stale-guard memory;
  - `traces.mjs` counts calls after green including board tools, while the gate excludes them;
  - bootstraps over 3–4 task deltas mostly reflect which tasks were sampled.

## What held up

Several suspicions came back clean:
- 0 real provider errors;
- 0 workspace escapes;
- 0 abuse of the guard's "delete it first" advice;
- grading covers every run, and the agents' scratch files are not collected.

Also sound:
- the one-pass `render`;
- strict profile validation;
- atomic adapter writes;
- immutable per-arm profiles;
- the process-group kill on check timeout;
- an unusually candid registry.

## Suggested order (as given at the time)

1. Same-profile n=1 rule, and recording the code version.
2. Fix the predicate, the relay race and `terminate` before the prepared arms.
3. Then either run the confirmation set, or reframe the goal honestly as "the best harness with k agents, where k=1 may win".
