# DeepSWE batch feasibility (2026-10-04)

> **Checked by hand by the main session (2026-10-04):**
> - ✓ Git history leak: in anko's image, `git rev-list --all --count` gives 1119 and `git rev-list HEAD --count` gives 1105.
> - ✓ fd partial credit: with the solution applied, 47 of 47 new tests pass (binary 1). On the untouched base, 3 of 47 new tests already pass. The saved `base.json` still shows the pre-fail-to-pass score of 0.064; the fail-to-pass correction makes it 0.0.
> - Everything else is model output and was not re-checked.

Model output (Claude subagent, no model calls to any agent LLM). Verified by hand: scorer results, image sizes, git-history leak, IPC smoke test. Not verified: runtimes of tasks other than the three validated; difficulty of any task; the Pier internals beyond the files read.
Prototype code: `tmp/claude-deepswe/` (`score_task.py`, `mkref.py`, `validate.sh`, `exec/execd.sh`, `exec/run`, `images.json`, `sizes.json`, `task-stats.json`, `out/<task>/`).

## Recommendation

1. **Architecture: one hub container + one sidecar container per task, shared through Docker volumes. No change to `src/`.**
   The hub is the existing murmur image (Node, tsx, murmur, internet only for the model API). Each task runs from its own prebuilt image, `--network none`, with its repo at `/app` on a named volume. The hub mounts the same volume at `/work/<task-id>`, so murmur's file tools (read, edit, write, grep, find, ls) work on the repo directly and fast. Commands that need the task's toolchain go through a `run <task-id> <command>` script on the hub's PATH, which drops a command file into a per-task queue volume; a 15-line loop (`execd.sh`) in the task container runs it with `/app` as cwd and returns output and exit code. Agents are told in the goal text how it works (an environment fact, like a remote dev box).
2. **Scoring: set-based fail-to-pass fraction** (`score_task.py`), validated on 3 tasks (Go, Python, Rust).
3. **Do not write a Pier agent.** Pier is useful as reference and for its docker plumbing, but our own driver is simpler (see Q3).
4. **First batch (4 tasks):** `expr-try-catch-errors`, `termenv-preserve-ansi-resets` (both Go), `cattrs-partial-structuring-recovery` (Python), `fd-deterministic-multi-key-sorting` (Rust, already validated). Calibrate single agents (k=3) on each task alone first; nothing here says whether they are in the 0.3-0.6 band.

## Q1. Architecture for a batch

Facts that decide it: every one of the 113 Dockerfiles is `FROM mars-base` (Go, Cargo, Python, Node, bun all present) plus `git clone` of the repo at `/app` and a dependency step. Python tasks use `pip install -e .` into the global site-packages, which pins the repo path to `/app`, and different Python tasks install conflicting versions. So a combined image (c) is not workable: only one repo can live at `/app`, and rebuilding per-task venvs replicates 113 different Dockerfiles. Option (c) rejected.

| Option | How agents' bash reaches the task | Problems |
|---|---|---|
| (a) murmur on the host, repos bind-mounted, `docker exec` wrapper | wrapper script per task | Host run with `--unsafe` exposes `../deep-swe/tasks/*/tests` (hidden tests) to `find /`. Bind mounts over virtiofs are slow for node_modules/cargo target. Rejected unless murmur also runs in Docker with the socket (agents would then control the host Docker: no isolation). |
| (b) murmur inside one container per task, shared board | n/a | Needs a board shared across containers: new network protocol in murmur. Large change. Rejected. |
| **(d) hub + sidecars + volumes (recommended)** | `run <task> <cmd>` via queue volume | New driver code outside `src/`; ~0.3 s latency per command. |

Smoke test of (d), no model, on the anko image as sidecar and alpine as hub: `run a "go version; ..."` returned output and exit code 3 correctly; streaming output arrived; a file appended by the hub in `/work/a` was visible to `git status` and `tail` inside the sidecar; `go test` in the sidecar ran; `curl` inside the sidecar failed (no network, as in the task spec). The volume is seeded from the image automatically (a new named volume mounted at `/app` copies the image's `/app`, including `.git` and `node_modules`). The per-task queue uses `volume-subpath`, so a sidecar sees only its own queue (supported on Docker 29.8).

Details the driver must handle (not yet built): kill file on SIGTERM of `run` (the `trap` writes `<id>.kill`, `execd.sh` does not yet act on it); per-command timeout (`RUN_TIMEOUT`, default 1800 s); pre-existing `PATH` entries differ in the image (`/root/.cargo/bin` etc. are set by the image ENV; `docker run` keeps them); owner of files written by hub (root in both; ok).

**Murmur changes needed: none.** Murmur's `createBashToolDefinition` accepts `operations`/`spawnHook` (Pi SDK `bash.d.ts`), so a future lever could route bash by cwd instead of `run`, but that is an optimisation, not a requirement. The existing `checks` lever (per-part acceptance command) is lab-only and stays off; the batch goal text lists task folders and says how to run commands, nothing more.

**Controls, same driver:**
- O (one agent with the clock, the whole batch): hub with 1 agent (`solo-clock-tokens`), all M sidecars, cap M x B.
- I (isolated, one agent per task): M hubs, each with one sidecar, cap B each.
- S (swarm, M agents + board): hub with M agents, all M sidecars, cap M x B.

**Grading:** after the run, scoring executes in the same sidecar (same as the official verifier, which runs in the agent's container): `docker cp tests`, run `score_task.py`. Official `test.sh` also resets and re-applies the test.patch files, so agent edits to test files are discarded.

## Q2. Partial credit

Reading 113 `test.sh`: 110 are byte-identical apart from the base commit hash (step 0 captures `model.patch`, step 1 resets files touched by `test.patch`, step 2 applies it, then runs `/app/test.sh base` and `/app/test.sh new`, reward 1 only if both exit 0). `test.patch` itself adds `/app/test.sh` (or a `test.py`), which differs per task. Runner mix by test command: Go `go test` 40 tasks, pytest ~34, jest/vitest/mocha/npm ~39 (one task, kea, mixes), cargo 5.

`score_task.py` reuses the official steps 0-2 verbatim (truncated before "Step 3"), strips fail-fast flags (`-x`, `-failfast`; some tasks use `pytest -x`, which would cap credit at one failure), then runs `base` and `new` separately and parses per-test results:
- Go: a shim `/opt/shim/go` turns `go test` into `go test -json` only for that subcommand. (`GOFLAGS=-json` was tried first and broke a task's own test that calls `go env`: a good example of why the shim is scoped.)
- pytest: `PYTEST_ADDOPTS="-rA"`, parse `PASSED/FAILED name`.
- cargo: parse `test name ... ok`.
- jest/vitest/mocha: **not implemented** (would need `--reporter json` injected via sed into `test.sh`); this is ~40 % of tasks. Fallback: pass/fail per `test.sh` command.

Definition (per task): reference file from the solution run. `new_f2p` = new tests passing with the solution and failing on the untouched base commit; `base_ref` = base tests passing with the solution.
`new_frac = |passed_new ∩ new_f2p| / |new_f2p|`, `base_frac = |passed_base ∩ base_ref| / |base_ref|`, `score = new_frac × base_frac`, plus `binary` (official reward).

Why fail-to-pass and not "new tests passed / total": on the untouched repo some new tests already pass.

Validation with no model (exact command: `nice -n 15 tmp/claude-deepswe/validate.sh <task-id>`, which starts the image with `--platform linux/amd64 --cpus 2 --memory 3g`, applies `solution/solve.sh` for the reference run, then scores the untouched base):

| Task (language) | New tests | Pass at base | f2p | Base tests | Solution: new / base / binary | Untouched base: new_frac / base_frac / score | Verifier time (solution run, new + base) |
|---|---|---|---|---|---|---|---|
| anko-default-function-arguments (Go) | 2 | 0 | 2 | 119 | 2/2, 119/119, 1 | 0.0 / 1.0 / 0.0 | 4 s + 71 s |
| fd-deterministic-multi-key-sorting (Rust) | 47 | 3 | 44 | 106 | 47/47, 106/106, 1 | 0.0 (3 of 47 pass raw = 6.4 %) / 1.0 / 0.0 | 5 s + 181 s |
| mashumaro-flattened-dataclass-fields (Python) | 72 | 6 | 66 | 30008 | 72/72, 30008/30008, 1 | 0.0 (6 of 72 pass raw = 8.3 %) / 1.0 / 0.0 | 1 s + 483 s |

(The raw column was what the scorer printed before `mkref.py` removed the floor; the final scorer uses f2p. The anko run was repeated after the last scorer edit with the same outcome; fd and mashumaro were not rerun after the `-x` strip, which does not touch them.)

Expect noise in the denominator: `anko` has only 2 new tests, so a single agent can only score 0, 0.5 or 1. Prefer tasks with at least ~20 new tests (counted by regex in `task-stats.json`; the regex matches the three validated tasks exactly).

## Q3. Pier

Installed (`uv tool install datacurve-pier`, version 0.3.1). Findings from `pier run --help` and source:
- Pier installs the agent *inside the task container* at run time (apt/uv/curl, needs network) with a per-agent network allowlist (model API domains only). So each run needs internet for installation; the task is otherwise air-gapped.
- `mini-swe-agent` is the leaderboard agent. In Pier the default `cost_limit` is `0` (no limit; Pier passes `-c agent.cost_limit=0`); step limits come from mini-swe-agent's own `mini.yaml`, which I could not inspect (it is installed in the container at run time). The leaderboard page says only "all models run on mini-swe-agent", with no step/cost/timeout details. The only hard limit in the task format is the 5400 s agent timeout. Frontier pass rates published: 36 % to 74 % (Pass@1).
- Custom agents: `--agent-import-path` with a `BaseAgent` subclass (`install_spec`, `network_allowlist`, `setup`, `run(instruction, environment, context)`). Writing murmur as such an agent is feasible, but murmur is N agents with its own run directory and OAuth credentials, one task per container, and Pier runs one task per trial. It does not do batches. Our driver gives us batches, volumes and our own token accounting. Recommendation: do not build the Pier agent; keep Pier for reference (`pier run --agent oracle` could cross-check our scorer later) and for a later optional leaderboard-comparable single-task run.

## Q4. Task selection and the sweet spot

Selection criteria: Go/Python/Rust (so the scorer works today), image under ~900 MB compressed, at least 20 new tests, solution patch under ~700 added lines, base suite small enough to run quickly under amd64 emulation (Rosetta is on; mashumaro's 30,008 base tests take 8 min). Difficulty data does not exist per task (leaderboard shows none), so the proxies are solution size, files touched, instruction length and new-test count. Treat all as guesses until single agents run each task k=3.

First batch (4): language, new tests, solution lines added/files, base suite:
- `expr-try-catch-errors` (Go): 74 new tests, 466 lines / 12 files, base `go test ./...`, 200-word instruction.
- `termenv-preserve-ansi-resets` (Go): 35, 512 / 8, base is a filtered `go test`, 182 words.
- `cattrs-partial-structuring-recovery` (Python): 63, 632 / 3, base is one file (`tests/test_errors.py`), 160 words.
- `fd-deterministic-multi-key-sorting` (Rust): 47, 642 / 5, validated end to end; base 181 s under emulation (cargo build dominated), 478-word instruction.
Two Go, one Python, one Rust; all image sizes 758-820 MB.

Later (about 10, adding): `tengo-callable-instance-isolation` (Go, 23), `yaegi-go-embed-directives` (Go, 45), `aiomonitor-task-snapshots-diff` (py, 54; its `-x` is stripped), `tomlkit-toml-table-converters` (py, 60), `adaptix-name-mapping-aliases` (py, 44), `vulture-persistent-analysis-cache` (py, 24), `pest-character-class-coalescing` (Rust), `oxvg-structural-selector-preservation` (Rust). JS/TS tasks need the vitest/jest parsers first.

Sweet spot reasoning: the swarm only has something to coordinate when the batch is bigger than the single agent can finish, but a 90-minute task times M in one session makes the single control spend its whole clock serially. Wall time per run is bounded by the longest sidecar test cycle (3 min to 8 min per full base run under emulation), so agents will run narrow tests; tokens scale with M. Signal needs enough variance in per-task scores: partial credit gives that, but k>=2 per arm and M=4 means 4 values per run. Suggested ramp: M=3 smoke (no signal expected), M=4 first real batch, then M=6, then 10 only if M=4/6 shows the single agent below the ceiling and above the floor.

Proposed cap (the project convention: the swarm shares one cap equal to the single agent's): B = 2.0 M tokens per task (cache reads count; the per-run swarmtest cap is 3 M), so batch of 4 = 8 M shared, same for the O control; isolated arm I gets 2 M per task. Timeout: 90 min per task x 1 is the official per-task limit; for a batch of 4 I propose 120 min of wall clock for all arms (every arm sees the same clock), which is a deliberate squeeze on the single agent. This number is a design decision for the user, not a measured result.

## Q5. Oracle check

- `instruction.md` (all 113 grepped for "hidden", "grader", "verifier", "test.sh", "reward", "benchmark", "will be tested"): no mention of hidden tests or grading. They are specs with exact API names, so there is no oracle in the realism sense (agents write their own tests). Some very short instructions (mashumaro, 61 words; geo-shapeindex, 96) are underspecified relative to 72 tests, which only adds noise.
- Repo: `/app` contains no test.sh or solution (checked anko). **Leak found:** `/app/.git` contains the full upstream history, including 14 commits after the base commit and all remote branches and tags (anko: 1119 commits in `--all` vs 1105 in HEAD). For repos that later implemented similar features upstream, `git log --all` could expose it. Fix in the driver (not done, not tested): after seeding the volume, delete all refs except HEAD, remove `origin`, `git reflog expire --expire=now --all`, `git gc --prune=now`. The official `test.sh` only needs the base commit object (`git rev-parse --verify <base>^{commit}`), which stays reachable from HEAD. I did not check how many tasks have post-base commits that touch the feature.
- Host exposure: the hub must not mount `../deep-swe` or the host home; the scorer copies `tests/` into the sidecar only after the agent has finished.

## Q6. Resources

- Images: 0.75-2.5 GB compressed, median 0.85 GB, sum for all 113 about 108 GB compressed (not needed); the layers share the `mars-base` base, so ~10 tasks cost roughly 3.5 GB plus about 0.1-1.5 GB per task. The three pulled images show 2.57-2.88 GB each as uncompressed sizes (shared layers). Docker disk is 61 GB with 188 GB free on the host.
- RAM: task spec says 8 GB and 2 CPUs per container; Docker VM currently has 4 GB (8 CPUs). Measured idle container load is small, but I did not measure peaks (cargo and jest bursts are typically 2-4 GB). For a batch of 4: **Docker VM 16 GB** (4 sidecars at a 3 GB cap + hub ~1 GB + a grading container); for 8-10 tasks: 24 GB. Host has 38.6 GB. CPU: `--cpus 2` per sidecar, 4 sidecars = 8 CPUs; the user's machine also runs other work, so batches of 4 are the ceiling on 8 VM CPUs unless the VM gets more.
- Emulation: images are linux/amd64 on this arm64 host (Rosetta enabled in Docker settings). Test cycles are slower than the official runs.
- Verifier wall time (solution run, base + new): anko 75 s, fd 186 s, mashumaro 8 min; a batch of 4 grades in 5-15 min if run in parallel (max 2 at a time on this machine).

## Open doubts and build plan

Doubts: (1) jest/vitest/mocha tasks (~40 %) have no per-test parser yet; (2) difficulty is unknown, so the band 0.3-0.6 must be measured with single agents (k=3 per task, about 4 tasks x 3 runs x up to 2 M tokens); (3) emulation may make the 90-minute budget bind harder than in the official setup; (4) the git history leak is not yet closed in a driver and the number of affected tasks is unknown; (5) the `run` queue has no kill handling yet and long commands past the Pi bash tool timeout may orphan processes; (6) Pi's 0/12 on 2026-10-01 used binary reward; partial credit may still show floor effects.

Build plan (estimate: about 1.5 days of work, no `src/` changes):
1. Driver `experiments/deepswe/run-batch.mjs` (volumes, sidecars, hub, history strip, task text, grading, result JSON): 0.5 day.
2. Finish `execd.sh`/`run` (kill, timeouts) and test with 2 real images: 2 hours.
3. Add jest/vitest/mocha parsers (sed-inject `--reporter=json` / `--json`), validate on 2 JS tasks (needs 2 more image pulls): 3 hours.
4. Single-agent calibration k=3 on the 4 tasks (solo-clock-tokens), pre-registered in `experiments/plan.md` first; then M=4 arms O, I, S.
