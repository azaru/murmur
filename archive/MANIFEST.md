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
