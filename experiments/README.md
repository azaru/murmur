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
| Round 7 | 10-02 | recalibrate the task panel against c4g-clock (difficulty and volume regimes) | "Round 7" | `criba7/`, [`criba7-lanes.mjs`](criba7-lanes.mjs); `batch/lane.sh L3 <image> "IC"`, `batch/lane.sh L1 <image> "O"` | [`rows/runs.json`](rows/runs.json) (seed 20261025), `batch/{L3-IC,L1-O}-r<rep>/batch-result.json` | [`criba7-traces.md`](criba7-traces.md), [`batch/traces.md`](batch/traces.md) ("Round 7") |
| Round 8 | 10-02 | expand panel D (5 new staged tasks, one remedy) and build panel V (OpenSpec projects) | "Round 8" | `criba8/`, [`criba8-lanes.mjs`](criba8-lanes.mjs), [`criba8b-lanes.mjs`](criba8b-lanes.mjs) | [`rows/runs.json`](rows/runs.json) (seeds 20261030–20261033) | [`criba8-traces.md`](criba8-traces.md), [`criba8b-traces.md`](criba8b-traces.md), [`reports/2026-10-02-panel8-build.md`](reports/2026-10-02-panel8-build.md) |
| Round 9 | 10-02 | the swarm against c4g-clock: 4-agent section swarm on panel V, parallel attempts on panel D | "Round 9" | `criba9/`, [`criba9-lanes.mjs`](criba9-lanes.mjs); profiles `v-swarm-clock`, `x1g-select-clock` | [`rows/runs.json`](rows/runs.json) (seeds 20261034, 20261035) | [`round9-traces.md`](round9-traces.md), [`reports/2026-10-02-round9-v-traces.md`](reports/2026-10-02-round9-v-traces.md), [`reports/2026-10-02-round9-d-traces.md`](reports/2026-10-02-round9-d-traces.md) |
| Round 10 | 10-02 | does the swarm add anything once the single agent gets the quality signal (10A), swarm size n=2/3/10, a bare post-only board (10B), a cheaper threaded V swarm (10C) | "Round 10" | `criba10/`, [`criba10-lanes.mjs`](criba10-lanes.mjs); profiles `c4g-signal`, `x1g-select-signal`, `b0-basic`, `ti-swarm-clock` | [`rows/runs.json`](rows/runs.json) (seeds 20261036–20261040) | [`round10-traces.md`](round10-traces.md), [`reports/2026-10-02-round10-d-traces.md`](reports/2026-10-02-round10-d-traces.md), [`reports/2026-10-02-round10-b0-traces.md`](reports/2026-10-02-round10-b0-traces.md), [`reports/2026-10-02-round10-v-traces.md`](reports/2026-10-02-round10-v-traces.md) |
| Round 11, phase 1 | 10-03 | without an oracle: does murmur's single agent beat Pi, do norms help, does the clock help (with and without norms), and which blind tasks leave headroom | "Round 11, phase 1" and its result | `criba11/`, [`criba11-lanes.mjs`](criba11-lanes.mjs); profiles `solo`, `solo-norms`, `solo-norms-clock`, `solo-clock` | [`rows/runs.json`](rows/runs.json) (seeds 20261053–20261055) | [`round11-traces.md`](round11-traces.md), [`reports/2026-10-03-round11-traces-analysis.md`](reports/2026-10-03-round11-traces-analysis.md), [`reports/2026-10-03-tool-usage-audit.md`](reports/2026-10-03-tool-usage-audit.md) |

## By kind

- **Notebook and rules:** [`plan.md`](plan.md), and [`hard-tasks.md`](hard-tasks.md) (how benchmark tasks are built and calibrated).
- **Reports:** [`reports/`](reports/).
  - `2026-10-01-adversarial-review.md`: review of the code, the architecture and the evidence.
  - `2026-10-01-review-subagent-reports.md`: methodology audit, trace scan for measurement bugs, DeepSWE diagnosis.
  - `2026-10-01-incident-theories.md`: the coordination theories taken from the July 2026 swarm incident, and how they fared.
  - `2026-10-01-task-families.md`: the `fam_*` and `opt_*` task families, their validation and calibration.
  - `2026-10-02-panel8-build.md`: the round 8 tasks, their validation, the ambiguity review and the OpenSpec pilot.
  - `2026-10-02-round9-v-traces.md`, `2026-10-02-round9-d-traces.md`: why the swarm lost on panel V and tied on panel D.
  - `2026-10-02-round10-d-traces.md`, `2026-10-02-round10-b0-traces.md`, `2026-10-02-round10-v-traces.md`: whether the single agent uses the printed score, how the n=2/3/10 swarms select, what the bare board does, and why the threaded V swarm was not cheaper.
  - `2026-10-03-oracle-audit-blind-d.md`, `2026-10-03-blind-panel-wave2.md`: the audit of the oracle in every task, and the build of the oracle-free (blind) panel.
  - `2026-10-03-round11-traces-analysis.md`: round 11 phase 1, why agents without a clock stop, what the clock does, the norms, and why the optimisation tasks stay near 0.
  - `2026-10-03-tool-usage-audit.md`: how agents use read, bash, edit and write, the write-guard refusals, and which tool changes are worth making.
  - `2026-10-02-astra-swarm-ideas.md`: the ExploitGym and Astra swarm sources and the ideas drawn from them.
  - `2026-10-02-video-S2sjyokoxeE-review.md`: the video review behind the `threads` lever.
  - `2026-10-02-round6-traces.md`: why the agent without a clock stops, what the clock agent does with the time, and coordination in the 6B batches.
- **Per-run data:**
  - [`rows/runs.json`](rows/runs.json): every swarmtest run since 09-30, 552 rows. Regenerate with `node scripts/rows.mjs ../swarmtest/runs --since 20260930`.
  - `batch/*/batch-result.json`: one per batch.
- **Per-agent behaviour:** `criba{1,2,3,5,6,7,8}-traces.md`, `round{9,10,11}-traces.md`, from `scripts/traces.mjs`; [`batch/traces.md`](batch/traces.md) for the batches.
- **Campaign configs:** `*.json` here and in `criba*/`. They are swarmtest configs: competitors, seed, repetitions and token budget. Drivers are `*-lanes.mjs` and `criba1-driver*.mjs`.
- **Raw agent transcripts:** not in git; see [`../archive/MANIFEST.md`](../archive/MANIFEST.md).

## Conventions

- **Arm label:** `<profile>/n=<agents>`, where the profile is a file in [`../profiles/`](../profiles/). Profiles are never edited in place.
- **Scores:** swarmtest's hidden grader, in [0, 1]. "Cut" or "capped" runs hit the 3M token cap; their score is a floor.
- **Task abbreviations:**
  - ieh: `information_extraction_hard`;
  - ieh2: `information_extraction_hard2`;
  - routing, shop, packing, roster: the L3 optimisation tasks `opt_*` (in `../swarmtest/staging/`);
  - durable: `durable_workflow_engine`;
  - cph: `constrained_planning_hard`;
  - fih: `feature_implementation_hard`;
  - ledger: `ledger_reconciliation_hard`.
- **Ignored on purpose:** logs (`*.log`, `*.out`), locks, `tmp/` and copied workspaces (see `../.gitignore`).
