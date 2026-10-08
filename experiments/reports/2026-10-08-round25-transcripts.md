Model output (a subagent's analysis of the round 25 transcripts), not verified by hand. Counts come from short scripts over `events.jsonl`, `<agent>.messages.json` and the score files; interpretations are the subagent's. Role at a call = the agent's most recent `role(name)` call before it (`none` before the first one).
> Checked by hand in the main session: wren's expr post at 8.8 min in `e25-roles-r4` ("Expr implementation currently adds throw/errtype builtins…") and that run's expr score fields (score 0.063, new tests 6%, existing tests 99.96% passing); crane's `done` at 20.5 min in `e25-rclock-r1` ("…cannot be completed safely in the remaining time"); tern's "Only ~7 minutes shared budget" at 38.1 min in `e25-rclock-r4`; and the per-run counts of `done` calls, role calls and write/edit calls, which the main session computed independently (see `plan.md`). The other claims are not verified.

# Round 25 transcripts: why roles (R) and roles plus budget clock (RC) scored below the baseline

Batches: R = `e25-roles-r0..r4`, RC = `e25-rclock-r0..r4`, baseline = `e23-base-r0..r4` (all under `experiments/deepswe/runs/`).

## 0. Context that changes the reading

- **Every R run and every baseline run ended at the 32M token cap after 12-25 minutes** (R: 21, 14, 15, 12, 17 min). The 120-minute timeout never mattered. RC runs ended by `done` at 21-40 min with 20.7-28.1M spent. Total tool calls per run are the same (~900-1000) in all arms.
- Agent-authored board posts are about the same as the baseline (baseline 91-178, mean 142; R 121-169, mean 153; RC 131-167, mean 150). The extra board volume is the 42-73 automatic "I take the role X" posts per run.
- Wasmi scored 0.364 in 9 of 10 role runs (baseline 0.14-0.82). Scriggo is ~0 in both (baseline 0.15 mean, one run 0.75). Most of the gap is expr, and in RC also tengo.

## 1. Why expr collapsed (0.42 to 0.08)

Score files (`new_frac` = share of the 79 reference tests passing; `base_frac` = existing tests):

| batch | expr score | files touched in final diff | note |
|---|---|---|---|
| base r1 | 0.54 | 9 files incl. parser, compiler, vm | 464-line diff |
| base r4 | 0.80 | 12 files incl. ast, checker, parser, compiler, vm | 1480-line diff |
| R r0 | 0.20 | 13 files incl. parser, compiler, vm, ast | the only role run with real syntax work |
| R r1/r2/r3/r4 | 0.06/0.04/0.06/0.06 | 3 files, all `builtin/` (141, 117, 107 lines); R r2 (342 lines) adds ast/parser/checker/try_test but no compiler/vm | only `throw`/`errtype`; 5 of 79 tests pass (the compile-error ones) |
| RC r0..r4 | 0.13, 0.06, 0.06, 0.06, 0.06 | 2-5 files, `builtin/` plus tests (108-205 lines) | same pattern; r3 also leaves 7 failing agent-written tests in the package |

So 8 of 10 role runs (R r1, r3, r4 and all five RC runs) ended with `throw`/`errtype` builtins and nothing in parser/compiler/VM; R r2 stopped at partial parser/AST; only R r0 touched the VM: the hard core of the task (try/catch/finally/retry syntax and lazy `try`) was never started. The code builds; `base_frac` is 1.00 in every R/RC expr run, so nothing is broken, the feature is missing.

Writers on expr (edit/write calls, agents): baseline 17-53 edits by 1-3 agents, first edit at 0.7-1.9 min. R: 42/3, 11/2, 15/2, 5/1, 5/1; first edit at 1.7, 5.1, 10.2, 5.3, 0.9 min. RC: 10/1, 4/1, 4/2, 14/2, 5/2.

Mechanism (not "roles pulled builders away": builder is still 50% of R calls). It is ownership that re-forms and then stalls:

- Agents claim projects in the first minute despite the "nobody owns" sentence. R r2, heron 0.5 min: "All five tasks appear claimed (expr wren, oxvg robin, scriggo swift, tengo finch, wasmi kite/tern)". R r4, wren 0.6 min: "I own expr-try-catch-errors." Others then post "I can take a piece if the owner confirms" instead of writing (posts with confirm/overlap wording that mention expr: R 10-20 per run, baseline 6-9).
- The single expr owner builds helpers first and leaves. R r4 (`e25-roles-r4/.../events.jsonl`), wren 8.8 min: "Expr implementation currently adds throw/errtype builtins and tests; full try/fallback, block catch/finally/retry remains unimplemented... I'm investigating a feasible VM/co..." then 9.0: "I take the role reviewer." Wren made 22 of its 43 calls on expr, 5 edits, and never returned. The team sentence "when your role has nothing left to do, take another role" fires for an agent who has done the easy slice.
- R r3: expr sat uncovered from 0.3 to 4.4 min (lark and wren each said the other owned it). Crane took it at 4.4 min; at 11.8 min lark posted "Expr is still materially uncovered after >10 minutes; Crane's claimed implementation hasn't touched parser/compiler/VM" and crane answered 11.9: "My expr work currently has only helpers." The run hit the cap at 12.0 min.
- R r2: first expr edit at 10.2 min. Before that, wren (builder) had "inspected architecture" and several agents offered help.
- The builder role text ("implement part of a project's change", "post which part you are building", "if a teammate is building the same part... take another part") invites slicing. RC r1, lark (sole Tengo owner) at 3.6 min: "I can't complete Tengo's nested/default/rest/parameter support within this slice; currently only the diagnostic is implemented." Tengo then got 2 edits in that whole run (score 0.01).

Expr has the biggest single-owner core; Tengo, Wasmi and Scriggo tolerate slices better.

## 2. What non-builder roles did (tool calls by role at call time, 5 runs each)

| role | R calls (share) | RC calls (share) | what they did |
|---|---|---|---|
| builder | 2430 (50%) | 1602 (36%) | 358/204 edits, most of all writes |
| reviewer | 578 (12%) | 680 (15%) | mostly `git diff` + `run ... test`; 30/27 edits; 116/145 posts with concrete defects |
| researcher | 506 (10%) | 222 (5%) | maps of files and functions; 18/2 edits (some write tests despite the role) |
| tester | 459 (9%) | 359 (8%) | writes tests; 42/23 edits |
| verifier | 349 (7%) | 589 (13%) | 257/368 bash, almost all full-suite runs; 3/14 edits |
| scout | 202 (4%) | 317 (7%) | 47/74 posts, 30/35 of them "tree still clean"/gap-status posts |
| finisher | n/a | 360 (8%) | 161 bash (115 test/build commands), 29 edits |
| fixer, integrator | 73+42 (2%) | 45+19 (1%) | rarely used (fixer 9 role calls, integrator 5) |

Total test/build commands (go test, cargo test/check/build) per run: baseline 82-130 (Rust 18-31); R 99-150 (Rust 28-40); RC 124-159 (Rust 58-94). Verifier, finisher, tester and reviewer all run the full suites.

Uptake of outputs: mixed and hard to measure. Concrete uses exist: R r3, linnet (reviewer) 8.6 min flagged that Tengo's pattern syntax leaked into ordinary literals; lark fixed it at 10.0 ("Fixed Tengo review issues... preserving literal syntax"). R r3, heron (verifier) 8.1 reported expr not compiling; a fix followed. But many posts are repeated status ("oxvg and scriggo trees remain clean" appears about once a minute from different scouts in RC r0 between 15 and 19 min). A crude proxy (another agent edits the same project within 4 min of a post) is high (57-91%) for every role, including builders, so it does not separate used from unused posts; I do not report it as evidence. Counts of explicit uptake phrases ("per X", "reported by", "thanks") are no higher in R/RC than in the baseline (R 0-8 per run, RC 2-7, baseline 0-6).

Role-labels are loose: researchers and testers write code and offer to implement ("crane[researcher]: Expr: can implement isolated errtype(err)... if useful", R r1, 4.3 min).

## 3. Did agents try to leave? Busywork?

- R had 3 `done` calls in total (r0 plover 9.1, r2 robin 2.9, r3 swift 5.0), each followed by continuing ("continuing batch work by taking another role"). Nobody idled: R runs end because the cap was reached while agents were working.
- Role switching is frequent: 42-65 role calls per run, 21-30% of role stints are 3 or fewer work calls. The pattern is builder to reviewer to scout to builder (R r1 kite: buil@5 revi@6 scou@5 buil@5 revi@6 test@6 scou@6 buil@7 revi@7 scou@8 buil@9 revi@14). Only 0-4 per run are back-to-back role calls with no work in between, so I did not find pure loops. The reviewer/scout/verifier share (R 35% of calls, RC 52% incl. finisher) is mostly re-reading diffs and re-running suites on a codebase that is mostly unfinished, which looks like busywork but is partly real review.

## 4. RC: why runs ended early with budget left

- Last budget line each agent saw before `done`, with the cumulative tokens at that moment (RC r1): done calls at 18-21 min after lines of 8.4, 7.9, 4.8, 3.0... 1.7 "minutes left", with 18.8-26.6M of 32M spent. RC r2: 4.2-3.0 min left at 18.9-23.7M. RC r3: 10.1-5.2 min left at 16.2-20.5M. RC r4: 4.5-2.1 min left at 22.5-25.6M. So the first `done` came at 16-25M spent (50-80% of the cap) and 4-16M stayed unused.
- Quotes (all in `events.jsonl` of the batch): r4 tern 38.1 min: "Only ~7 minutes shared budget. I'll finalize my Scriggo parser/AST + Wasmi valid shell contributions"; r2 plover 31.0: "Budget ~4 min. My contribution: Wasmi coredump.rs..."; r1 crane done 20.5: "The requested goal cannot be completed safely in the remaining time."; r3 dunlin done 34.2: "cannot reasonably be reached within the remaining time"; r4 linnet 0.9 min: "Please ensure code is being written promptly; shared budget ~19 min."; r0 crane done at 1.4 min: "Unable to meet batch goal within remaining time. Repeated checks showed no diffs across all repositories and ownership remained disputed" (an early quitter, and one of two such in r0).
- The estimate is noisy. `t + N` (implied end time) over each run spans 17-116 min and 3-98 min "left" appear within minutes of each other. It extrapolates a short-window rate, and bursts feed back: RC r2 had 3.0M of tokens in minutes 27-30, then 8.5M in minutes 30-33 (the mass switch to reviewer/tester/finisher and full-suite runs, ~166 calls), and the line fell from 30.7 to 4.2 min within a minute; RC r4 spent 8.6M in minutes 36-39 with 189 calls and 3 edits, 11 `done` calls. The wrap-up itself consumes the budget it announces. Early in the run the line said 20-36 min left, which is on the long side of what R then did (cap at 12-21 min), so I see no sign it misled agents in the initial phase; the damage is at the end (drop in N, then everyone verifies and quits together).
- Finisher: 360 calls (8%), mostly full-suite runs. I found no finisher that reverted work (revert-ish posts: RC 1/0/0/1/1, baseline 0-1; the one real revert is heron in r4 undoing its own failed patch at 38.9). Finishers did not prevent damage either: RC r0 tengo ended with 5 broken existing tests (base_frac 0.90), RC r4 oxvg with one failing agent-written regression.
- RC wall time was longer than R (21-40 vs 12-21 min) at similar call counts because of build-lock contention: bash results with "Blocking waiting for file lock" or "timed out" per run: baseline 1-12, R 17-30, RC 29-83. In RC r4 the team made 5, 3, 23 and 2 calls in 3-minute windows between minutes 15 and 27 while several verifiers/finishers fought for the cargo lock (swift 20.1: "Who currently holds oxvg cargo build lock?"; 26.2: "...full dependency compilation timed out at 360s mid-build"). A lot of RC's "time" is lost here, not in thinking.
- RC attention moved to oxvg: oxvg reads/bash 92-198 and edits 6-38 per run (baseline ~100 and 1-12), because scouts and verifiers repeatedly pointed to its failing regression; tengo (3 of 5 runs 0.01-0.05) and scriggo were starved.

## 5. Board traffic

Agent-authored posts per run: baseline 91-178, R 121-169, RC 131-167. Automatic role announcements add 42-65 (R) and 58-73 (RC) per run. Posts that ask who owns what or ask to avoid overlap: baseline 25-35, R 21-47, RC 19-38 (with 'expr' mentioned: R 10-20, RC 4-12, baseline 6-9). Role switching creates modest, not dominant, overhead; the larger cost is that ownership negotiation moved to the board and ended with single owners.

## 6. Other explanations and the positive case

- **RC oxvg 0.667 (r0)** came from a chain started by scouts. From 15 to 19 min six scout/finisher/verifier posts said oxvg and scriggo trees were clean. Linnet 17.8: "I'll attempt scoped oxvg protection"; first oxvg edit 20.2 min. Wren (researcher, 15.3) and heron had mapped `exit_element` postorder as the cause; plover (finisher) 22.7: "Oxvg path to fix postorder violation: Context can hold HashSet<HashableElement...>... In CollapseGroups.prepare, before rewrites traverse root candidates and run selector check, store implicated exact elements." Finch, linnet, plover, heron and wren iterated 20-27 min (38 edits, 4 agents), fixed a non-element panic and a selector-cache panic, and landed the pre-rewrite pass. Tests: `cargo test -p oxvg_optimiser --lib` 58/58 at 26.4 min. R r4 and RC r4 found the same root cause only at 38.8 min ("matching occurs in exit_element after descendant rewrites") and had no time to fix it. This is the one clear positive case of researcher/reviewer/scout output being used: diagnosis from non-builders plus a few builders executing it. Other oxvg runs stay at 0 (baseline also 0 in all five).
- **Positive**: scouts and the board status surface untouched projects (they found oxvg and scriggo clean at 15-19 min in RC r0), and reviewer to builder fixes work when an owner is active (Tengo in R r3).
- **Dilution**: with the same ~950 calls and 32M tokens, builders get 36% (RC) or 50% (R) of calls instead of ~100% minus board traffic, and the verify/review share runs the same expensive suites repeatedly (Rust 2-3x baseline in RC).
- **Budget as a quit signal in RC**: expr, tengo and scriggo got fewer builder minutes and the "cannot be completed in remaining time" `done` reasons (30 of 1134 RC posts/done reasons mention time or budget, 0 of 1034 in R) justify stopping rather than starting the hard core.

## Open doubts

- Role-at-call-time is the last `role` call before each call. It is stale if an agent works on without calling `role` again, and I did not check that every `role` call took effect on the same turn. (In one ad-hoc listing of R r4 wren's expr edits the roles printed were the final role of the agent, not the role at the time; the tables use the role at the time and wren was `builder` for those edits.)
- The "other agent edited the same project within 4 min" uptake proxy is not discriminating (see section 2); real uptake needs manual reading.
- `base_frac` failing names for some RC expr runs are agent-written tests (r3: `TestErrorHandling...`), so some "broken existing tests" are the agents' own failing tests, not regressions of old ones.
- The exact point at which each R run would have finished expr if run longer is unknown; R r0 (0.20) shows the core can be started within 21 min.
- No reasoning text was read; only posts, done reasons and tool calls.
