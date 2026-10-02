# AGENTS.md

Guidance for coding agents working on murmur. README.md explains what murmur is; this file covers how to work on it and on its experiments.

## Project in one paragraph

murmur runs N Pi coding agents (SDK `@earendil-works/pi-coding-agent`, model `openai-codex/gpt-6-luna`, thinking `medium`, OAuth) in one shared folder with an optional message board. It is deliberately small and **non-hierarchical**: nothing assigns roles or splits work. A role menu that agents pick from themselves, staggered entry, signals and finishing conditions are allowed; assigned roles, orchestrators and planners that hand out work are not. The research goal is a configuration that beats a single Pi agent consistently (criterion in `experiments/plan.md`).

## Layout

- `src/` (~600 lines, hard ceiling ~600): `swarm.ts` (run loop, sessions, hooks, relays), `board.ts` (board state and coordination tools), `profile.ts` (every tunable lever and its default), `cli.ts`.
- `profiles/*.json`: one file per experimental arm. `no-messaging.json` is the control.
- `scripts/arms.mjs`: paired comparison of two arms inside the same swarmtest campaign(s). `scripts/traces.mjs`: per-agent behaviour table (calls, board share, checks, calls after the first green, overwrites, steers) and why each agent stopped.
- `examples/`: tiny task files for smoke tests (`trio.json` with 3 agents is the usual one).
- `experiments/` (partly tracked: notebook, configs, drivers and aggregated results; logs, locks, `tmp/` and copied workspaces stay ignored, see `.gitignore`): `plan.md` (rules, findings, pre-registered rounds, campaign registry), `hard-tasks.md` (how benchmark tasks are built and calibrated), campaign configs, lane drivers and logs.
- Benchmark harness: `../swarmtest` (Python, `python3 -m swarmtest`; adapters in `adapters/murmur.mjs` and `adapters/pi.mjs`; tasks in `tasks/`; results in `runs/<campaign>/run-*/`). `../autotuner` has a murmur adapter on branch `murmur-adapter`.

## Commands

- `npm run typecheck`: must pass before any commit.
- `npm run murmur -- run <task.json> --unsafe`: a local run (`--unsafe` gives agents full bash on this machine). Each run writes `runs/<id>/` with `events.jsonl`, `result.json` and `<agent>.messages.json`.
- swarmtest unit tests: `cd ../swarmtest && python3 -m unittest discover -s tests`. Exactly 4 known failures in `test_runner`; anything else is a regression.
- Analysis: `node scripts/traces.mjs <campaign-dir>...` and `node scripts/arms.mjs <campaign-dir>... --a <arm> --b <arm>`.

## Rules for changing murmur

- **Never edit a profile in place.** Every candidate is a new file, because results are keyed by profile path and hash.
- **New levers default to off** and must leave existing profiles' behaviour unchanged (for example, register Pi hooks only when a lever needs them). Document each lever in `src/profile.ts` and in README.md's profile sentence.
- **Campaigns run murmur straight from `src/`.** While any campaign is running (`pgrep -fl swarmtest`), edit a copy under `tmp/claude-<task>/src`, typecheck it there, smoke-test it from the copy (`npx tsx tmp/claude-<task>/src/cli.ts run ...`), and only then copy the files over `src/` in one step.
- Smoke-test every new mechanism with a cheap scripted task that forces the behaviour (see the write-guard and claim tests in the history), plus one default-profile run to check nothing regressed.
- Stay under ~600 lines in `src/`. If a change does not fit, compact existing code without changing behaviour, and say so in the commit.
- Code, comments and commit messages in English. Commits go to `main`, ending with the Co-Authored-By line. Never commit in `../swarmtest`.
- Temporary files only in `tmp/claude-<task>/` inside the project, and delete them when done (also delete the `runs/` dirs of smoke tests).

## Running experiments

- **Pre-register before measuring:** write the round's question, arms, tasks, k, budget and decision rule in `experiments/plan.md` before launching. Afterwards, apply the rule as written, add a row to the campaign registry, and write findings from the transcripts.
- **One run orders nothing.** Use k≥2 and compare per-task means. Pi's own noise on one task spans 0.0–0.75.
- **A run that hits its token cap stops the whole swarmtest campaign** (no resume). Put arms that may hit the cap in their own campaign, or use the lane drivers' `--per-arm` second pass (`experiments/criba3-lanes.mjs`). The per-run cap is 3M tokens (`token_budget`), and cache reads count toward it.
- Every swarmtest campaign needs one single-agent competitor (Pi n=1, or a murmur n=1 control such as `c4g-guard`).
- **Parallel lanes:** the `criba*-lanes.mjs` drivers run several campaigns at once (`nohup node <driver> <lane> &`), with a lock file per task × arm and done-detection by the campaign seed. Three to five concurrent campaigns have not affected graders so far.
- Long jobs: start them with `nohup ... &`, not as a tool's background command (those are capped at 2 hours). Wait with a background `until <condition>; do sleep 60; done` command so the session is notified once.
- **Benchmark tasks:** build new tasks in `../swarmtest/staging/<id>/`, never directly in `tasks/`. swarmtest loads every directory in `tasks/` when a campaign starts, and a half-built task makes every new campaign fail. Validate with a private symlinked view of `tasks/`, then `mv` the finished task in. Calibrate against Pi (k=3) and against the strong single agent c4n1 (k=3, band 0.3–0.6). Rules are in `experiments/hard-tasks.md`.
- **Check that traces are saved before a campaign:** Pi in `state/messages.json`, murmur in `state/murmur/` (`events.jsonl`, `result.json`, `<agent>[.N].messages.json`).

## Keeping the research record

This repository is shown primarily as research. Every experiment must leave a complete, public record in git, written in English. A round is not finished until all of this is committed.

- **Before launching:** commit the pre-registration in `experiments/plan.md` (question, arms, tasks, k, budget, decision rule), together with the new profiles and drivers. The commit is what dates the pre-registration.
- **After the round:**
  - **Notebook:** in `experiments/plan.md`, apply the rule as written, add the findings drawn from the transcripts, and add a registry row with the campaign ids, tokens and the code commit. Note any deviation or infrastructure failure, and how it was handled.
  - **Per-run data:** regenerate `experiments/rows/runs.json` with `node scripts/rows.mjs ../swarmtest/runs --since 20260930`. Write a per-agent table with `node scripts/traces.mjs` to `experiments/<round>-traces.md`. For non-swarmtest runs (such as batches), save a per-run result file and a summary of the coordination events.
  - **Analyses:** save every long analysis that drove a decision to `experiments/reports/YYYY-MM-DD-<topic>.md`. That includes reviews, subagent audits, task-family builds and calibrations. Label model output as such, and mark the claims you verified by hand.
  - **Summary:** update `docs/research.md`: the round's section with its results table and the rule as applied, the theory-status table, threats to validity, the record-completeness table, and "Where the data is".
  - **Index and README:** add the round's row to the index in `experiments/README.md`. Update "Findings so far" in `README.md` when the headline changes.
  - **Raw transcripts:** after a set of rounds, pack the new raw runs into a new `archive/murmur-raw-runs-<date>.tar.xz`, agents' data only. Search for the real credentials and for token patterns first, then record the contents, size and SHA-256 in `archive/MANIFEST.md`. The archive itself stays out of git.
- **Check before committing:** run `git add -n experiments` and confirm that every new file you meant to keep is tracked. `.gitignore` only lets through the notebook, configs, drivers, traces, reports, rows and batch results, so a new kind of file may need a new `!` rule. Keep logs, locks, `tmp/` and copied workspaces out.

## What the data says so far (details in `experiments/plan.md`)

- A single agent stops early. Work done after the first green check is the best predictor of score (Spearman 0.72–0.80 on multi-file and planning tasks). A single agent with short lessons (c4n1) already beats Pi by about +0.25 at ~0.3M tokens.
- On single-file tasks, swarm arms fail by breaking the shared file: a chunked `write` overwrites it, or a run is cut mid-edit. Everyone then gives up or yields ("X owns the file, I'll review").
- Over 85% of tokens are cache reads, so cost ≈ turns × context length. Context per turn triples during a run, and 33–62% of tokens go to coordination-only turns.
- The best arms saturate the contract-style tasks near 1.0. Tasks made harder by sheer volume make everyone give up. Ranking strong arms needs tasks with open-ended headroom (optimisation objectives).

## Delegation: protect the main context

The main session coordinates experiments that last hours. Its context is the scarcest resource, so push bulk reading and building into subagents and keep only conclusions.

- **Delegate**:
  - transcript and trace analysis across many runs (`*.messages.json`, `events.jsonl`);
  - building or revising a benchmark task;
  - literature and web research;
  - reviews of long contracts for ambiguity;
  - any job that needs dozens of file reads.
- **Do directly:** short targeted reads, single commands, and edits to `src/` and profiles that you will reason about next.
- **Write delegation prompts that are self-contained:**
  - the goal and why it matters;
  - exact paths;
  - hard constraints (no commits in swarmtest, staging instead of `tasks/`, no live campaigns unless asked, temp files under `tmp/claude-<task>/` or the staging dir);
  - what to validate;
  - an explicit, concise report format with numbers, paths and open doubts. Ask for at most ~1,500 words.
- **Run subagents in the background** and keep working. Never read or tail a subagent's output file; wait for its completion report. Relay the relevant numbers to the user yourself.
- **Prefer scripts that summarise over raw dumps.** Use `scripts/traces.mjs`, or a short inline Python script that prints only the aggregated table, instead of printing transcripts. Cap output with `head`/`cut`.
- **Treat subagent output as unverified data.** Check the key claims that drive a decision before acting on them, for example that a staged task loads in swarmtest before moving it into `tasks/`.
- Put durable findings in `experiments/plan.md` as you go, so a new context can resume from the files rather than from the conversation.
