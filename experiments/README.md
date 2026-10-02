# Experiments index

Everything needed to audit or rerun murmur's experiments. Start with the summary in [`../docs/research.md`](../docs/research.md). The lab notebook, [`plan.md`](plan.md), is the primary record: every round's pre-registration, the rule as applied, its findings, and the campaign registry with campaign ids.

## By round

| Round | Date | Question | Notebook section | Configs and driver | Results | Analysis |
|---|---|---|---|---|---|---|
| F0 | 09-30 | build the levers | "F0" | [`levers/`](levers/) | registry smoke rows | — |
| F1, F1a–c | 09-30 | does the board help? | "F1", "Findings F1a/F1b" | `f1-swarmtest.json`, `f1a-screen.json`, `f1b.json`, `f1c.json`, `f1d-calib.json` | [`rows/runs.json`](rows/runs.json) | notebook |
| Task calibration | 10-01 | tasks with headroom for Pi | "Findings of the hard-task calibrations" | [`hard-tasks.md`](hard-tasks.md), `calib-*.json` | [`rows/runs.json`](rows/runs.json) | notebook |
| Criba 1 | 10-01 | 13 arms against Pi, k=1 | "Criba 1", "Findings of Criba 1" | `criba1.json`, `criba1/`, `criba1-driver*.mjs`, `criba1-lanes.mjs`, `criba1-campaigns.txt` | [`criba1-rows.json`](criba1-rows.json), [`rows/runs.json`](rows/runs.json) | [`criba1-traces.md`](criba1-traces.md) |
| Criba 2 | 10-01 | replication against c4n1 | "Criba 2", "Findings of Criba 2" | `criba2.json`, `criba2/`, `criba2-lanes.mjs` | [`criba12-rows.json`](criba12-rows.json), [`rows/runs.json`](rows/runs.json) | [`criba2-traces.md`](criba2-traces.md) |
| Criba 3 | 10-01 | mechanisms against the broken shared file | "Criba 3", "Findings of Criba 3" | `criba3.json`, `criba3/`, `criba3-lanes.mjs` | [`rows/runs.json`](rows/runs.json) | [`criba3-traces.md`](criba3-traces.md) |
| Review | 10-01 | is the evidence sound? | "Findings of the adversarial review" | — | — | [`reports/2026-10-01-adversarial-review.md`](reports/2026-10-01-adversarial-review.md), [`reports/2026-10-01-review-subagent-reports.md`](reports/2026-10-01-review-subagent-reports.md) |
| Round 5A | 10-01 | coordination vs compute within a task | "Round 5", "A" | `criba5/`, `criba5-lanes.mjs` | [`rows/runs.json`](rows/runs.json) (seed 20261015) | [`criba5-traces.md`](criba5-traces.md), [`reports/2026-10-01-incident-theories.md`](reports/2026-10-01-incident-theories.md) |
| Round 5B | 10-01 | batches of tasks, agents and tokens proportional | "Round 5", "B" | [`batch/run-batch.mjs`](batch/run-batch.mjs), [`batch/lane.sh`](batch/lane.sh) | `batch/<lot>-<arm>-r<rep>/batch-result.json` | [`batch/traces.md`](batch/traces.md), [`reports/2026-10-01-task-families.md`](reports/2026-10-01-task-families.md) |
| Round 6 | 10-02 | persistence vs coordination: is it the clock (6A)? compute-fair batch control (6B) | "Round 6" | `criba6/`, [`criba6-lanes.mjs`](criba6-lanes.mjs); `batch/lane.sh L1 <image> "IC EC"` | [`rows/runs.json`](rows/runs.json) (seed 20261020), `batch/L1-{IC,EC}-r<rep>/batch-result.json` | [`criba6-traces.md`](criba6-traces.md), [`batch/traces.md`](batch/traces.md) ("Round 6B"), [`reports/2026-10-02-round6-traces.md`](reports/2026-10-02-round6-traces.md) |

## By kind

- **Notebook and rules:** [`plan.md`](plan.md), and [`hard-tasks.md`](hard-tasks.md) (how benchmark tasks are built and calibrated).
- **Reports:** [`reports/`](reports/).
  - `2026-10-01-adversarial-review.md`: review of the code, the architecture and the evidence.
  - `2026-10-01-review-subagent-reports.md`: methodology audit, trace scan for measurement bugs, DeepSWE diagnosis.
  - `2026-10-01-incident-theories.md`: the coordination theories taken from the July 2026 swarm incident, and how they fared.
  - `2026-10-01-task-families.md`: the `fam_*` and `opt_*` task families, their validation and calibration.
  - `2026-10-02-round6-traces.md`: why the agent without a clock stops, what the clock agent does with the time, and coordination in the 6B batches.
- **Per-run data:**
  - [`rows/runs.json`](rows/runs.json): every swarmtest run since 09-30, 268 rows. Regenerate with `node scripts/rows.mjs ../swarmtest/runs --since 20260930`.
  - `batch/*/batch-result.json`: one per batch.
- **Per-agent behaviour:** `criba{1,2,3,5,6}-traces.md`, from `scripts/traces.mjs`; [`batch/traces.md`](batch/traces.md) for the batches.
- **Campaign configs:** `*.json` here and in `criba*/`. They are swarmtest configs: competitors, seed, repetitions and token budget. Drivers are `*-lanes.mjs` and `criba1-driver*.mjs`.
- **Raw agent transcripts:** not in git; see [`../archive/MANIFEST.md`](../archive/MANIFEST.md).

## Conventions

- **Arm label:** `<profile>/n=<agents>`, where the profile is a file in [`../profiles/`](../profiles/). Profiles are never edited in place.
- **Scores:** swarmtest's hidden grader, in [0, 1]. "Cut" or "capped" runs hit the 3M token cap; their score is a floor.
- **Task abbreviations:**
  - ieh: `information_extraction_hard`;
  - ieh2: `information_extraction_hard2`;
  - durable: `durable_workflow_engine`;
  - cph: `constrained_planning_hard`;
  - fih: `feature_implementation_hard`;
  - ledger: `ledger_reconciliation_hard`.
- **Ignored on purpose:** logs (`*.log`, `*.out`), locks, `tmp/` and copied workspaces (see `../.gitignore`).
