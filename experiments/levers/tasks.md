## 1. Tuning profile in murmur

- [x] 1.1 Before any code change, run `examples/hello.json` once and save its `run_start` briefing to `tmp/claude-levers/v0-briefing.txt` (the reference for 1.4); verify the file is non-empty
- [x] 1.2 Replace `Board`'s constructor parameter properties with explicit fields; verify `tsc --noEmit` passes and `node --experimental-strip-types src/cli.ts run examples/hello.json --unsafe` passes
- [x] 1.3 Add `src/profile.ts` (defaults equal to today's texts, TypeBox schema without extra properties, `loadProfile`); verify `tsc --noEmit` and that a profile with an unknown key or tool name throws a message naming it
- [x] 1.4 Wire the profile: `profile` task field (relative path), rejection of `messaging` in task files, briefing/teamBriefing templates, steer and wake texts, tool descriptions, tool set, system-prompt append, spawn gap with all members starting as working, effective profile in `run_start`; verify the hello briefing is identical to 1.1's reference and hello still passes
- [x] 1.5 Add `profiles/no-messaging.json`, drop `messaging` from `examples/*.json`, update the README task-file section; verify a hello run with the no-messaging profile lists only `done` and a task file with `messaging` is rejected before any model call
- [x] 1.6 Add `examples/relay.json` (2 agents; one must learn a value only from the other's post) and run it; verify the trace shows a `wake` event and the run ends `all_done` or `quiescent` with the check passing
- [x] 1.7 Run a 2-agent hello with a profile setting `spawnGapSeconds: 15`, extra tools `grep/find/ls` and a `systemPromptAppend`; verify from the trace that the second agent's first usage comes ≥15 s after the first's, `run_start` lists the extra tools, and (via a one-off script in `tmp/`) the session system prompt ends with the append
- [x] 1.8 Verify `wc -l src/*.ts` stays under ~600, then commit in small English commits

## 2. swarmtest variants (../swarmtest, no commits)

- [x] 2.1 Carry an optional competitor `variant` through `config.py` (validation and identity), `make_plan`, the runner request and `report.py` (label `murmur[<variant>]/n=N`, index key); verify swarmtest's tests show exactly the 4 known failures
- [x] 2.2 Make `adapters/murmur.mjs` load the variant with murmur's `loadProfile`, record `variant` and the profile SHA-256 in metadata, and fail without model calls on a missing file; verify with a request naming a missing profile
- [x] 2.3 Run a `--simulate` campaign with murmur n=3 with and without `profiles/no-messaging.json`; verify both arms appear with distinct labels in `report.md`
- [x] 2.4 Live smoke: `bug_fixing` with murmur n=1 under both variants (≈0.1M tokens); verify both adapter results carry the right variant and hash

## 3. Arm comparison script

- [x] 3.1 Write `scripts/arms.mjs` (pairing by task and repetition across campaign dirs, per-task means, wins/losses/ties, seeded bootstrap 90% CI, pass counts, token/time ratios); verify on the 2.3 simulated campaign and on campaign `20260930T171707Z-94478e80` (murmur n=3 vs n=1), checking the numbers by hand for one task
- [x] 3.2 Commit the script

## 4. autotuner adapter (../autotuner, no commits)

- [x] 4.1 Add `packages/adapters/src/murmur/` (config, adapter, child runner) per design.md; verify autotuner's adapter contract test and typecheck pass for it
- [x] 4.2 Register murmur in `apps/cli/src/docker-runtime.ts` (adapter, provider, credential profile, bootstrap, read-only murmur mount); verify autotuner's existing tests still pass
- [x] 4.3 Add `configs/murmur/gpt6-luna-medium-n1.json` and `-n3.json`; verify they validate through the adapter's config loader
- [x] 4.4 Smoke run one `toy` task with murmur n=1 in autotuner's Docker runtime; verify the record is graded from the repository diff, no murmur trace or result file is in the patch, and no credential content appears in the outputs
