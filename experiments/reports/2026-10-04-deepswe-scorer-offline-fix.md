# DeepSWE scorer: cargo cache loss in the offline sidecar (fix and rescore)

Model output (subagent), 2026-10-04. Claims marked "reproduced" were re-run by hand in this session.

**Checked by hand in the main session (2026-10-04 20:52):**
- ✓ The driver change is the single `-e CARGO_CACHE_AUTO_CLEAN_FREQUENCY=never` line (`git diff experiments/deepswe/run-batch.mjs`).
- ✓ fd cal16-r1 rescored: score 1.0, binary 1, 153 tests parsed, 47 new-run passes and 0 failures; the old file, kept as `*.score.invalid.json`, has score 0 and 0 parsed.
- ✓ The r0 control reproduces 0.977 (46 passes, 1 failure).
- ✓ r1's agent ran `cargo check` before its first `cargo test` (`wren.messages.json`).
- The cache-deletion mechanism itself (125 → 62 files) was not re-run by hand.

## Root cause

The sidecar has no network by design. The task image (`cargo fetch --locked` in its Dockerfile) holds every crate in `/root/.cargo/registry/cache` (125 files), which is enough for an offline `cargo test`. Cargo 1.92 runs an automatic cache garbage collection (crates not used for a month are deleted; the image's crates carry the image build date). A `cargo check` used only the non-dev crates and the GC deleted the 63 others (dev-dependencies: `getrandom 0.4.2`, `diff 0.1.13`, `tempfile`...). The cache lives in the container's file system, not in the `/app` volume, and survives the `docker restart` before grading, so the scorer's `cargo test` had to download them and failed (DNS). In cal16-r0 the agent's first cargo command was `cargo test --no-run`, which used every crate before the GC could drop any, so the scorer found them.

It also hurt the agent: in cal16-r1 its `cargo test` failed the same way (`wren.messages.json`), so it never ran the tests.

## Key claims

1. Scorer failure is a download failure, not a code failure. Proof: `experiments/deepswe/runs/cal16-r1/fd-deterministic-multi-key-sorting/fd-deterministic-multi-key-sorting-logs/base.log` (`failed to download from https://static.crates.io/crates/getrandom/0.4.2/download`), `new.log` (same for `diff/0.1.13`), `*.score.invalid.json` (exit 101, parsed 0).
2. The diff touches no Cargo file. Proof: `grep '^diff --git'` on `fd-deterministic-multi-key-sorting.diff` lists only doc/fd.1 and src/*.rs.
3. The image holds the crates. Proof: `docker run --rm --network none --platform linux/amd64 --entrypoint bash public.ecr.aws/d3j8x8q7/swe-bench-202605:kh79s1ny2ab454f8caet44rv5n82za06 -c 'cd /app; cargo test --no-run'` finishes (reproduced).
4. Order matters. Same command, `cargo check` first, then `cargo test --no-run`: the cache goes from 125 to 62 files and the second command fails with the getrandom download error (reproduced, `ls ~/.cargo/registry/cache/*/ | wc -l` before and after).
5. Order in the saved transcripts: r1's first cargo call is `cargo check`, then `cargo test` fails (`runs/cal16-r1/.../murmur/run/wren.messages.json`); r0's first call is `cargo test --no-run` and every later `cargo test` passes (r0 `*.messages.json`).
6. The fix works. Same two commands with `-e CARGO_CACHE_AUTO_CLEAN_FREQUENCY=never`: the cache stays at 125 and `cargo test --no-run` finishes (reproduced).
7. Rescores below come from the saved diffs applied to fresh sidecars (no agent, no model call).

## Files changed

- `experiments/deepswe/run-batch.mjs`: one line added to the sidecar `docker run`: `-e CARGO_CACHE_AUTO_CLEAN_FREQUENCY=never`. The variable reaches the agents' commands and the scorer's `docker exec`. Other languages ignore it. Agents still have no network; the only visible change is that `cargo test` after `cargo check` now works offline (as in a normal environment).
- `experiments/deepswe/runs/cal16-r1/fd-deterministic-multi-key-sorting/`: `*.score.json` replaced by the rescore, the old file kept as `*.score.invalid.json`, new logs in `*-logs-rescore/`. cal16-r0 got `*.score.rescore-control.json` and `*-logs-rescore/` (its original score file is untouched).
- `experiments/deepswe/results/cal16-r1-fd-rescore.json` (new). `results/cal16-r1.json` is NOT edited: the driver has no rescore path, so the original summary stays as written.

## Rescored numbers

| Run | score | new_frac | base_frac | binary | parsed |
|---|---|---|---|---|---|
| fd cal16-r1, original (invalid) | 0.0 | 0.0 | 0.0 | 0 | 0 |
| fd cal16-r1, rescored | 1.0 | 1.0 (44/44) | 1.0 (106/106) | 1 | 153 |
| fd cal16-r0 control, rescored | 0.977 | 0.977 (43/44) | 1.0 | 0 | 153 |
| fd cal16-r0 original | 0.977 | 0.977 | 1.0 | 0 | 153 |

The control reproduces r0 exactly (one new test fails, `new` exit 101, the same as the original). Mean score of cal16-r1 over its four tasks: 0.582 as stored, 0.832 with the fd rescore (`results/cal16-r1-fd-rescore.json`).

## Other task types

- Go (34 tasks), Python (34), JS (5), TS (35): no cache garbage collection that deletes pre-fetched dependencies exists in `go`, `pip`/`pytest` or `npm`/`pnpm`. Not exposed to this mechanism. They remain exposed to a different kind of problem if a task needs a dependency that the image lacks (not observed).
- Rust: 5 tasks in deep-swe, all exposed without the fix (only fd was run so far; the dry run of fd and expr passes after the change: `--tasks fd-deterministic-multi-key-sorting,expr-try-catch-errors --dry`, all PASS, solution 1.0/binary 1); the fix covers all of them provided their images carry cargo >= 1.78 (the variable is ignored by older cargo, which has no GC).

## Remaining risks

- Rescored r1 is the diff of an agent that could not run `cargo test`. Its score is valid as a score of that diff, but the run is not what a fixed-harness run would have produced; cal16-r1's fd behaviour is not comparable with r0 in process.
- The fix is verified on fd's image (cargo 1.92) only. The other Rust images were not run.
- Rescore sidecars were fresh containers with the git history intact (the anti-leak strip is irrelevant to the score), applied with `git apply --binary` onto the image's work tree (clean at the base commit).
- A different latent cause for a missing crate (image without the dev-dependencies) would show as `parsed = 0` and exit 101 again; `parsed = 0` with a Rust task should be treated as an infrastructure failure.
