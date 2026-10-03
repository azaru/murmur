> **Model output.** Written by a task-building subagent (Claude) on 2026-10-03, copied unchanged below. Verified by hand by the main session: `grader.py` is byte-identical to the original in all four variants, and no agent-visible file (`workspace/` outside `node_modules`, `task.json`) contains grader, hidden test, scored or public sample.

# Blind variants, build report (2026-10-03)

Four variants built in `../swarmtest/staging/` (nothing in `tasks/`, nothing committed): `information_extraction_hard_blind`, `ledger_reconciliation_hard_blind`, `durable_workflow_engine_blind`, `ospec_brown_blind`. All checks below ran offline under `nice -n 15`, at most 3 processes, no model calls. Graders were run directly the way swarmtest does (`python3 grader.py <workspace>`, cwd = task dir, TMPDIR inside `tmp/claude-blind2`).

Grader and holdout data are byte-identical to the originals (`diff -r`), with one exception: `ledger_reconciliation_hard_blind/holdout/build_workspace.py` is deleted. It is not used by the grader, but it regenerated the oracle `public_check.py` from the reference. Changed files per task are only: task.json, the spec file, public_check.py (plus package.json and three openspec docs for ospec).

## Per task

**information_extraction_hard_blind.** Old check: 5 full expected records of `corpus/` (all 18 fields) compared to the output, failure lines printed expected and actual values; the docstring said the grader runs hidden corpora. Changed: `task.json` (prompt rewritten, no "run npm run test before finishing", states what the check does not do); `workspace/SCHEMA.md` (2 sentences: "visible sample / hidden corpora" became "example input / real corpora", "sample corpus" became "example corpus in corpus/"); `workspace/public_check.py` (new: runs extract.py, checks top-level `{"cases": [...]}`, exact key set, types, YYYY-MM-DD shape, money object shape, sort/uniqueness of case_id; prints no counts and no values). Corpus kept (inputs only).

**ledger_reconciliation_hard_blind.** Old check: 4 full expected accounts plus the list of all account ids, with expected/actual in failure lines. Changed: `task.json`; `RECONCILE.md` (1 sentence: "small visible input / hidden inputs" became "example input / real inputs"); `public_check.py` (new: `accounts` object, sorted keys, per account exact keys, item/amount/ledger_net/dispute types and formats, ledger_net null iff ledger_items null); `holdout/build_workspace.py` deleted (see above). `sample/` kept (inputs only; the directory name stays).

**durable_workflow_engine_blind.** Old check: scenario tests with asserted values (foreach, retry/pause, recovery, expressions, checkpoints), i.e. a capability oracle. Changed: `task.json` (prompt: removed the ArcSwarm roster/ownership/ready/done paragraph, "run npm run test", added the acceptance statement); `CONTRACT.md` (acceptance sentence in the intro; the last paragraph "For the five-peer ArcSwarm roster ..." removed, because it assigns roles and an ownership protocol, which murmur forbids; the "Engineering boundaries" paragraph kept); `public_check.py` (new: imports the public names, checks callables and exception classes, runs one trivial literal workflow and checks only the 6 top-level keys and their container types; does not even check status value).

**ospec_brown_blind.** Old check: `npm run test` ran the existing unit tests and then a 13-scenario value-asserting `public_check.py`; the check docstring gave the grader's scenario counts (227 + 162); the prompt said each scenario "is a requirement of the hidden acceptance tests". Changed: `task.json` (prompt); `package.json` (test = `python3 public_check.py` only); `public_check.py` (new: imports taskboard, builds a Board, a few basic calls, checks two return types); `openspec/changes/add-sprint-planning/{design,proposal,tasks}.md` ("visible tests" became "existing tests", 6 spots). No requirement touched.

## Validation (hidden score = swarmtest grader, `score`)

| task | reference, original check passes | reference hidden: original / blind | wrong deliverable passes new check | its hidden score | unmodified starter vs new check |
|---|---|---|---|---|---|
| ieh_blind | yes | 1.0 / 1.0 (270 checks) | yes (empty `{"cases": []}`; and well-formed records with ids from regex, rest null) | 0.0 / 0.0822 | fails (stub raises) |
| lrh_blind | yes | 1.0 / 1.0 (27) | yes (empty accounts; and account ids with all-null entries) | 0.0 / 0.0383 | fails (stub raises) |
| durable_blind | yes | 1.0 / 1.0 (334) | yes (run_workflow returns constant well-formed dict) | 0.0186 / 0.0186 | fails (stub raises) |
| ospec_brown_blind | yes | 1.0 / 1.0 (390) | yes: the unmodified starter passes the check | 0.25 (regression part only) | passes |

Reference on the new check: passes for all four. New check rejects malformed output (tested: ieh missing keys and wrong type, lrh ledger_net/ledger_items mismatch, durable missing keys), and failure lines contain only field names, never values.

## swarmtest load and fingerprints

Private view `tmp/claude-blind2/tasks-view/` with the four symlinks plus a copy of `experiments/criba3.json` (one competitor: murmur n=1 `profiles/c4g-clock.json`, k=1, runs redirected into tmp): `python3 -m swarmtest --config <cfg> plan` listed all 4 tasks, 4 runs, no error. View, config and runs dir deleted afterwards.

Fingerprints (`swarmtest.config.fingerprint`, pycache excluded, computed after the last edit):
- information_extraction_hard_blind `f5964edd6ea6151734131c62e1e2ab8826bbde44b5aac0306bb779bd4a7a7a7c`
- ledger_reconciliation_hard_blind `cd7bf17d75b6ac2d41c6e2cdcf5e1e11fc9b7e4c379de25cc5e69d154f5edf10`
- durable_workflow_engine_blind `a4748b8379d35d091f03cdb211afa1155a100d625590a9e9d6acb494d10a973b`
- ospec_brown_blind `6b442d1a4a2087bc8170855e5736f3ade7e7a46ffd0420460edfb24082aa7bd8`

## Leftovers (grep hidden|grader|scored|score|sample|expected|grading|visible|public)

- `task.json` key `grading_kind` (swarmtest metadata; the murmur adapter forwards only provider, model, prompt, acceptance_command, so agents do not see it).
- `public_check.py` file name, and its docstring/failure text say "expected answer" / "expected a top-level object" while stating that nothing is compared. Accepted; the docstring is agent-visible and only describes what the check does not do.
- ledger: directory `sample/` and its mention in RECONCILE.md and the prompt (as the "example input"); renaming it was not worth changing the visible dir. ieh/ospec: none.
- "public API" in durable CONTRACT.md and stubs (meaning the API), "hidden/visibility" in ospec specs (domain words: deleted tasks hidden, filter visibility), `expected {n} arguments` in taskboard/clihelp.py. All legitimate.
- No hit for hidden/grader/scored in corpus/, sample/, tests/.

## Open doubts

1. ospec: I kept `workspace/tests/` (the project's own unit suite for existing behaviour) and the sentence "existing unit tests must keep passing" in the prompt, but `npm run test` no longer runs them. Real repos have such suites, but they are a regression oracle for the 25% regression part of the hidden score, and you asked to remove tests that check correctness. If you want strict blindness, delete `tests/` and the unit-test sentences in the prompt, `design.md`, `proposal.md`, `tasks.md` (tasks 2.4, 14.1, 17.5, 20.5, 23.4 then need rewording). Decision for you.
2. ospec: no format-only check can say anything about the change itself (a Python API change has no output format), so the check passes on the unmodified starter. By design, but it gives agents zero signal that anything is wired up.
3. durable: the 4-key-set check on a trivial workflow is the most that can be said without testing behaviour; I did not check `status` or `checkpoint` content.
4. Roster text removal in durable (prompt and CONTRACT.md) is my decision beyond "remove grading hints": it assigns roles and protocol steps (ready/done). Original hidden score and requirements unchanged.
5. `profiles/c4g-clock.json` (the competitor profile used in the plan) still has a norm "The acceptance check is only a small visible sample ... hidden tests will probe every clause". Out of scope here, but it contradicts these blind tasks and needs a new profile before any run.
6. Not run: the swarmtest unit tests (no swarmtest code was touched).
