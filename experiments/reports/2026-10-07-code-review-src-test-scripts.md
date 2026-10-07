# Code review of `src/`, `test/` and `scripts/` (2026-10-07)

Question from the user: could a programming fault have misled an experiment, and are there bugs. Model output (Claude), with the
claims marked "verified" checked against the run data by hand-written scripts in this session; `runs/` and `experiments/` were not
reviewed, only queried for counts. Baseline: `npm run typecheck` passes, `npm test` 11/11.

## Verdict

No sign that any round's verdict was flipped by a bug. Two code gaps did or could affect results, and both were contained by process
rather than by code:

1. **murmur does not see model errors** (`src/swarm.ts:297`, `:362-379`). `session.prompt()` resolves normally when the model answers
   with `stopReason: "error"`, so the turn simply ends, the agent goes idle, and a single-agent run ends `quiescent` as if the agent had
   stopped on purpose; no `error` event is logged. Verified: 560 October swarmtest runs have zero murmur `error` events, while 125
   transcripts end in an error message. 119 are "This operation was aborted", all in runs that ended by `budget` or `timeout` (expected:
   `end()` aborts the sessions). The other 6 are "Codex error: The usage limit has been reached", all in single-agent arms (`solo-clock`,
   one agent with the clock; `solo-clock-tokens`): three never got a first answer (0 tokens, 0 minutes) and were graded 0.0, 0.25 and
   0.0. All six were invalidated by hand in `experiments/plan.md` (lines ~1063-1072 and ~1450) because the batch driver greps the
   transcripts; the code itself would have counted them. Round 23 baseline and round 24 batches: no model error besides the expected
   aborts.
2. **The `done` tool result carries board messages and the clock** (`src/swarm.ts:195-218`). After `board.done()` and the departure
   notice ("left the team for good… its claims no longer hold"), `attach` appends unread posts and `[N minutes left]` to the very
   result that says "You are done. End your turn now.", and marks those posts read. Verified: in 12 of 560 swarmtest runs an agent kept
   calling tools after `done` without a revival (79 calls, 29 bash/write/edit). Most are one stray call ("call inbox" steers in the old
   delivery-by-steer profiles); the clear cases are `22928c54/run-0001` (`n12-tasks`, twelve agents with a task list): dunlin made 44
   calls, 19 of them bash/write/edit, after its done result arrived with board text; `2f54852c/run-0002` (`c3-close`, three agents):
   robin 11 calls; `9e47457b/run-0002`: robin 8 calls. Round 23 baseline and round 24: zero. Side effect for round 24
   (`reviveOnMention`): a mention attached to the done result is consumed by `inbox()` in-turn, so the agent is never recalled for it;
   none observed in the four round-24 batches (revives 1, 1, 0, 7; mention posts 14, 7, 15, 24).

## Other findings

- **`profiles/n12-base.json` is no longer the defaults.** It pins the old sentence "{teammates}, equals working…" (read by teams of three
  as a teammate named "equals"). `n12-base-peers.json` equals the current defaults exactly and is what round 23 ran (verified with
  `loadProfile` against `DEFAULT_PROFILE`). `AGENTS.md` and the comment at `src/profile.ts:23` still call `n12-base` the base. A new arm
  cloned from `n12-base.json` would silently differ from the baseline in that sentence. Round 24 profiles set the new sentence and are fine.
- **Two kinds of "early departure".** An agent that ends its turn without `done` is re-prompted on every later post, departure notices
  included (`src/swarm.ts:313-327`); an agent that called `done` is not (unless revived). Not a bug, but the two fates differ, which
  matters when reading "nudges" and `quiescent` ends.
- **No validation of lever combinations** (`src/profile.ts`): `taskAssign` without `taskList`, `reviveOnMention` without `messaging`, and
  `notices` without `delivery: "attach"` are silently inert; in the last case every notice is pushed to each member's list
  (`src/board.ts:79`) and never drained (`src/swarm.ts:201`).
- **Tests cover none of the run loop.** The 11 tests exercise threads, branches and the task list. Nothing covers `src/swarm.ts`: the
  entry gates, `evaluate()` transitions, `attach`/`guard`, or the check-detection regex (`:158-163`).
- **`scripts/traces.mjs`:** check detection is plain containment of the acceptance command (`:47`) and reads the exit code from the result
  text, so `checks`, `green at` and `after green` are weaker than murmur's own regex and, for oracle-free tasks where agents never see the
  command, mostly empty. Relayed transcripts (`wren.1.messages.json`) do not match `result.agents` (`:79`), so their stop line shows the
  last text instead of the done reason. `traces.mjs`, `rows.mjs` and `n12.mjs` read `record.grade.score` only, while `arms.mjs` merges
  `offline_regrade` and `review`; harmless so far (one September record has an offline regrade, none has a review).
- Cosmetic: the departure notice lists top-level files as folders ("used write/edit in main.py, tests", `src/swarm.ts:132`); the clock
  starts at `runSwarm` entry, a few seconds before the timeout timer (`:33`, `:383`).

Checked and found sound: `tokens.total` includes cache reads (Pi `agent-session.js:3353`), as the 3M cap note assumes; the profile hash
covers the defaults; seats not yet entered count as working so the swarm cannot end early; the `quiescent` rule only ends when no idle
agent has unread posts; the shared-budget pool writes atomically; the write guard applies to `write` only, as documented.

## Fixes (applied in `3e52e3e`; see the 2026-10-07 review section of `experiments/plan.md`)

1. On `message_end` with an assistant `stopReason === "error"` whose message is not the abort, log `model_error` with the message and
   report it in `result.json`, so the adapter and batch driver can mark the run invalid without grepping transcripts (or `end("error")`).
2. In `attach`, when the tool is `done` and the output starts with "You are done", append nothing and leave the posts unread; with
   `reviveOnMention` an unread mention then recalls the agent through the normal path. Log `work_after_done` when a tool event arrives
   for a member whose `doneReason` is set.
3. Point `AGENTS.md` and the `src/profile.ts` comment at `n12-base-peers.json`, or retire `n12-base.json`.
4. Two unit tests for `swarm.ts`: the check-detection regex with `&&`, `|` and `;` suffixes, and `attach` returning nothing on a done result.

Out of scope here: `experiments/deepswe/compare.py` implements the decision rule (exact permutation test) and was not reviewed.
