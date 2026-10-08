# Raw runs archive

`murmur-raw-runs-20261002.tar.xz` holds the raw data behind every number in [`docs/research.md`](../docs/research.md): the **agents'** transcripts, event traces and results for every run since murmur started. It does not include any conversation with the human or with the coding assistant that ran the experiments.

The archive is not committed, because of its size. Download it from the release [`data-2026-10-02`](https://github.com/azaru/murmur/releases/tag/data-2026-10-02) ([direct link](https://github.com/azaru/murmur/releases/download/data-2026-10-02/murmur-raw-runs-20261002.tar.xz)) and verify it with the checksum below.

| | |
|---|---|
| File | `murmur-raw-runs-20261002.tar.xz` |
| Size | 23 MB compressed (~300 MB uncompressed) |
| SHA-256 | `1bb4cf1db2cdd000a161d231c0f88d1d2d53c608b1ebaf981a9ab5e2a41ac5a2` |
| Created | 2026-10-02, after round 5 |

## Layout

- **`swarmtest-runs/<campaign>/`**: the 105 swarmtest campaigns from 2026-09-30 on (F1 to round 5A; campaign ids are in the registry in `experiments/plan.md`).
  - `campaign.json`: config and stop reason.
  - `run-NNNN/record.json`: task, arm, grade and usage.
  - `run-NNNN/request.json`: what the adapter was asked to run.
  - `run-NNNN/state/`:
    - for Pi: `messages.json`;
    - for murmur: `murmur/events.jsonl`, `murmur/result.json` and `murmur/<agent>[.N].messages.json`, with one transcript per agent (`.N` for relayed instances).
- **`murmur-batch/<lot>-<arm>-r<rep>/`**: the round 5B batches, including calibration (`*-calib1`) and failed (`*-infrafail`) batches.
  - `batch-result.json`: per-task scores and tokens.
  - `container.log`
  - `task.json`, `profile.json`, `run.mjs`: what the container ran.
  - `runs/*/`: murmur's `events.jsonl`, `result.json`, agent transcripts and the final workspace that was graded. The input copies (`ws/`) are left out.

Transcripts are Pi message lists: `assistant` messages with `toolCall` items, and `toolResult` messages. They contain the model's encrypted reasoning blobs, which are opaque base64.

## Checks done before packaging

- Exact search for the operator's Pi credentials in all 45,365 files: 0 hits.
- Pattern search for token-like strings (`eyJ…`, `sk-…`, `"refresh": …`): the only hits are random substrings inside encrypted reasoning blobs.

## Use

```sh
shasum -a 256 murmur-raw-runs-20261002.tar.xz
tar -xJf murmur-raw-runs-20261002.tar.xz
node scripts/traces.mjs swarmtest-runs/<campaign>...     # per-agent behaviour tables
node scripts/rows.mjs swarmtest-runs --since 20260930     # regenerates experiments/rows/runs.json
```

# Raw runs archive, part 2 (rounds 6 to 10)

`murmur-raw-runs-20261003.tar.xz` holds the raw data that is **not** in the first archive: the agents' transcripts, event traces and results for rounds 6 to 10 (2026-10-02). Together with `murmur-raw-runs-20261002.tar.xz` it covers every run. It does not include any conversation with the human or with the coding assistant. It is **not uploaded yet** (the first archive is on the release `data-2026-10-02`).

| | |
|---|---|
| File | `murmur-raw-runs-20261003.tar.xz` |
| Size | 32 MiB compressed (33,515,192 bytes), 377 MiB uncompressed |
| SHA-256 | `ac0187a3c667e2dc325d028d63fd3fe6da675b564cd8f5b785ac53bb6760156b` |
| Created | 2026-10-03, after round 10 |

## Layout

Same layout and subset as the first archive.

- **`swarmtest-runs/<campaign>/`**: 137 swarmtest campaigns, from `20261002T063615Z-10df4893` (round 6A) to `20261002T200521Z-0b133e12` (round 10), with `campaign.json`, `report.json`, `run-NNNN/{record.json,request.json,adapter-result.json}`, `state/` and the graded `workspace/`.
- **`murmur-batch/<lot>-<arm>-r<rep>/`**: 12 batches (rounds 6B and 7): `L1-EC`, `L1-IC`, `L1-O` and `L3-IC`, each with r0 to r2. Input copies (`ws/`) are left out.

Left out: one runaway nested directory in `swarmtest-runs/20261002T175354Z-4c742835/run-0002/workspace/attempts/swift/attempts/` (an agent created `attempts/swift/attempts/swift/...` recursively until the path exceeded the OS limit; the first level is kept).

## Checks done before packaging

- Exact search for the operator's Pi credentials (every secret value and JWT segment in `~/.pi/agent/auth.json`) in all files of the 137 campaigns and the batch dirs: 0 hits.
- Pattern search (`eyJ…`, `sk-…`, `"refresh":`, `"access":`, `Bearer `): 0 hits in the campaigns. In the batches, `eyJ…` (19 files) and `sk-…` (8 files) match only inside agent `*.messages.json` as random substrings of encrypted reasoning blobs; the other patterns have 0 hits.

## Use

```sh
shasum -a 256 murmur-raw-runs-20261003.tar.xz
tar -xJf murmur-raw-runs-20261003.tar.xz
```


# Raw runs archive, part 3 (rounds 11 to 26)

`murmur-raw-runs-20261008.tar.xz` holds the raw data that is **not** in the first two archives: the agents' transcripts, event traces and results for the swarmtest campaigns after round 10 and for the DeepSWE batches (rounds 17 to 26). Together with `murmur-raw-runs-20261002.tar.xz` and `murmur-raw-runs-20261003.tar.xz` it covers every run. It does not include any conversation with the human or with the coding assistant. It is **not uploaded yet**.

| | |
|---|---|
| File | `murmur-raw-runs-20261008.tar.xz` |
| Size | 132 MiB compressed (138,190,804 bytes), 1,008 MiB uncompressed (35,362 files) |
| SHA-256 | `cf679bd8843cd500575d2538c9083a141753c22828849d44e6c918f6b8c9513b` |
| Created | 2026-10-08, after round 26 |

## Layout

- **`swarmtest-runs/<campaign>/`**: 145 swarmtest campaigns, from `20261003T080947Z-2337418f` (round 11) to `20261004T220858Z-7ac6739b`. Same layout as the first archive: `campaign.json`, `report.json`, `report.md`, `run-NNNN/{record.json,request.json,adapter-result.json}`, `state/` and the graded `workspace/` (including `.git`).
- **`deepswe-runs/<batch>/`**: 67 DeepSWE batches (`cal16-r*`, `scr17-b1..b3`, `e17-` to `e26-<arm>-r<rep>`; the `e21-teams-*` and `e22-teams-*` batches have `team1/` to `team3/` instead of `b/`). Includes the failed batches `e20-stagger-status-r1-fetchfail`, `e20-stagger-tasks-r1-fetchfail` and `e22-teams-r1-quota`. Each `b/` (or `team*/`) holds:
  - `murmur/`: `events.jsonl`, `result.json` and `<agent>.messages.json` (under `murmur/run/` for the swarm);
  - per task: `<task>.diff` (the agents' final patch), `<task>.score.json` (grader result) and `<task>-logs/new.log` (test output after the patch);
  - `cfg/` (`profile.json`, `task.json`, `entry.mjs`), `tasks/` (task statements) and `hub.log`.

Left out:

- `<task>-logs/base.log` in every DeepSWE batch: test output of the unmodified repository, produced by the grader and not by the agents (3.4 GB of the 3.9 GB in `experiments/deepswe/runs/`). The per-test pass/fail lists of the base run stay in `*.score.json`.
- `dry-*` and `smoke-*` batches in `experiments/deepswe/runs/` (dry runs of the batch scripts and smoke tests, no experiment data).
- `experiments/batch/`: already complete in the first two archives (all 42 batch directories; only three `lane-*.log` files are new and they are driver logs).
- `runs/` at the project root (local smoke runs).

## Checks done before packaging

- Exact search for the operator's Pi credentials (every secret value and JWT segment in `~/.pi/agent/auth.json`) in all 35,362 packed files: 0 hits.
- Pattern search (`eyJ…`, `sk-…`, `"refresh":`, `"access":`, `Bearer `): `"refresh":`, `"access":` and `Bearer ` have 0 hits. `eyJ…` (351 files) and `sk-…` (326 files) match only as random substrings inside agent `*.messages.json` (encrypted reasoning blobs), as `sk-` inside task names such as `task-creation-validation` in `record.json`, and as base85 noise in one binary patch (`e26-rtasks-r3/b/scriggo-method-declarations.diff`). No `eyJ…` string followed by the `.xxx.` JWT structure was found in any transcript.

## Use

```sh
shasum -a 256 murmur-raw-runs-20261008.tar.xz
tar -xJf murmur-raw-runs-20261008.tar.xz
```
