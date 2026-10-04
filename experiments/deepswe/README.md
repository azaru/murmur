# DeepSWE batches

One murmur configuration over several DeepSWE tasks (`../deep-swe/tasks/<id>`, Harbor format), scored with partial credit.
`src/` is untouched: murmur runs in a hub container with `/work` as its workspace (`runSwarm` with `workspace: "/work"`).

## Run

```
node experiments/deepswe/run-batch.mjs --tasks a,b,c --arm swarm --profile profiles/n12-stagger-tokens.json --agents 12 --tokens 24000000 --minutes 120
node experiments/deepswe/run-batch.mjs --tasks a,b,c --arm solo --tokens 24000000 --minutes 120
node experiments/deepswe/run-batch.mjs --tasks a,b,c --arm isolated --tokens 24000000 --minutes 120
node experiments/deepswe/run-batch.mjs --tasks a,b --dry
```

Arms: `swarm` (N agents, one shared cap), `solo` (one agent, same cap; default profile `profiles/solo-clock-tokens.json`),
`isolated` (one single-agent run per task, cap divided by the number of tasks, all in parallel). Same clock for all.
`--dry` needs no model: it checks the plumbing and builds `refs/<task>.json` if missing. A real batch refuses to start
for a task without a reference. Check `pgrep -fl swarmtest` and `docker info` (RAM) first; at most 3 GB per sidecar
(`--sidecar-memory`), 2 CPUs each.

Output: `runs/<batch>/` (ignored by git: per unit the murmur run dir with `events.jsonl`, `result.json`,
`<agent>.messages.json`, `hub.log`, `<task>.diff` (final change of each repo), `<task>.score.json`, verifier logs) and
`results/<batch>.json` (tracked summary).

## Files

- `run-batch.mjs`: driver (volumes, sidecars, anti-leak strip, goal text, murmur in the hub, diffs, scoring, cleanup in `finally` and on SIGINT/SIGTERM; everything carries the label `dswe=<batch>`).
- `run`: the hub's `run <task> <command...>`. `execd.sh`: PID 1 of each sidecar; runs the commands, one process group each.
- `score_task.py`: partial-credit scorer. Parsers: go test -json, pytest -rA, cargo, jest `--json`, vitest verbose, mocha tap (reporters injected with `sed` into the `test.sh` that `test.patch` adds; runners called through a package script are not covered, then `parsed` is 0 and only `binary` counts).
- `refs/<task>.json`: tests that pass with the reference solution (`new_f2p` = fail at the untouched base and pass with the solution).

Score: `new_frac` (fraction of `new_f2p` passing) times `base_frac` (fraction of the reference's base tests still passing); `binary` is the official reward.

## Anti-leak

1. Each task's repo lives on a named volume seeded from the task image. Before any agent starts, inside the sidecar: detach HEAD, delete every ref, remove remotes, `packed-refs`/`FETCH_HEAD`/`ORIG_HEAD`, `git reflog expire --expire=now --all`, `git gc --prune=now`.
2. Verified per task, aborting the batch otherwise: `HEAD` is the base commit, `rev-list --all --count` equals `rev-list HEAD --count`, `git fsck --unreachable` lists nothing, no refs or remotes, the base commit is still present, and no `/solution`, `/tests` or `/app/test.sh` exists. (Counts are stored in `results/<batch>.json` under `leakCheck`.)
3. The hub mounts only the task volumes, the queue volumes, copies of `instruction.md` (`/work/_tasks`), `src` (read-only), the profile and a filtered copy of the OAuth file. Never `../deep-swe`.
4. Hidden tests are copied into the sidecar at grading time (`score_task.py`), after murmur has ended and the sidecar was restarted (kills stray processes; `/app` stays).
5. Sidecars run with `--network none`; only the hub has internet (model API).
