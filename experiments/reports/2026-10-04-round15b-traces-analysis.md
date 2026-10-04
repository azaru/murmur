# Round 15, stage B (volume, ospec_green_blind): transcript and trace analysis

> **Checked by hand by the main session (2026-10-04):**
> - ✓ C1 called `done` with the clock showing 5.2 minutes left (702c5333, wren msg 289) and 3.3 minutes left (371a385b, msg 283), at 11.0M and 10.6M of the 24M cap.
> - ✓ Coverage, not quality, separates the arms. Of the grader's 47 capabilities, the ones scoring 0 are 23 and 20 for C1, 14 and 6 for B, and 8 and 1 for ST. The weighted score inside the capabilities scored above 0 is 0.87–0.89 for C1, 0.92–0.95 for B and 0.96–0.97 for ST (from `record.json` `grade.checks`).
> - ✓ B's six zero capabilities in ad877a8f are exactly warehouse-registry, bins, stocktake, reorder, stock-holds and write-offs. ST's only zero in 4b350f75 is abc-analysis.
> - ✓ Early claims. In B ad877a8f, seven agents (finch, plover, tern, lark, heron, kite, robin) posted that they would take the core between 6.3 s and 14.7 s. In ST 4b350f75, wren claimed the core at 10.1 s, finch took the extensions at 15–17 s, and wren confirmed at 17.8 s.
> - ✓ No `wake` event occurs in any of the four swarm runs, so the new default wake was not exercised.
> - Everything else is model output and was not re-checked.

**Model output.** Written by a Claude subagent (general-purpose) on 2026-10-04 from the finished round's `events.jsonl`, `result.json`, `<agent>.messages.json`, `record.json` and final workspaces, plus the task source in `../swarmtest/staging/ospec_green_blind/` (`task.json`, workspace spec; hidden tests not read). Nothing was graded, no campaign was run, no model was called. Facts come from the cited files, counted with short scripts (heuristic ones are flagged); "Interpretation" paragraphs are the model's reading. Paths are relative to `/Users/azaru/Documents/projects/swarmtest/runs/<campaign>/run-0001/`; campaigns are named by the last 8 hex characters. Times are seconds since `run_start`. "Msg N" is the index in `state/murmur/<agent>.messages.json`.

| short | campaign | arm | score | tokens | wall | end |
|---|---|---|---|---|---|---|
| 702c5333 | 20261004T052617Z-702c5333 | C1 (one agent, clock) | 0.426 | 11.0M | 24.9 min | all_done |
| 371a385b | 20261004T060732Z-371a385b | C1 | 0.469 | 10.6M | 26.9 min | all_done |
| f21a7e66 | 20261004T055147Z-f21a7e66 | B (12 equals, board) | 0.638 | 24.1M | 440 s | budget |
| ad877a8f | 20261004T063455Z-ad877a8f | B | 0.830 | 24.0M | 417 s | budget |
| f7a15bdf | 20261004T055945Z-f7a15bdf | ST (B plus staggered entry) | 0.790 | 24.0M | 427 s | budget |
| 4b350f75 | 20261004T064229Z-4b350f75 | ST | 0.947 | 24.0M | 435 s | budget |

Task: 47 spec capabilities ("families" below), 260 grade weight, about 167 tasks in `tasks.md`. The first 12 families (catalog to persistence-cli, weight 58) are the briefed core; the other 35 (weight 202) are the tail. All times and counts below use `state/murmur/events.jsonl` and the `messages.json` files unless stated.

## Q1. Why C1 stopped at ~11M tokens

- **It stopped on the clock, not the token cap.** `run_start` has `timeoutMinutes: 30`. Every tool result carried "[N minutes left before the timeout]". The `done` call came at 5.1 minutes left (702c5333, msg 289) and 3.2 minutes left (371a385b, msg 283). Wall time was 24.9 and 26.9 min. The cap (24M) was never close: 11.0M and 10.6M, 97% of it cache reads.
- **It saw the clock and chose to stop.** Both `done` reasons say the change is incomplete. 702c5333: "several of the 47 capabilities (for example bins, stocktake, write-offs, customers, promotions, shipping, invoices, backorders, shipments, RMA, and access control) remain unimplemented". 371a385b: "86 tasks remain unchecked". Neither says time was the reason; the last visible thinking summary is "Closing out incomplete work" (702c5333 msg 289). Whether it judged 3-5 minutes too short for another capability is not in the transcript.
- **Pace.** 140 and 131 turns, about 3 tasks ticked per minute. Everything went into one file: `stockroom/__init__.py` (871 and 901 lines; 54 and 61 edit calls) plus a 62-68 line `__main__.py`. Ticked tasks: 72 / 95 unticked and 81 / 86 unticked (`workspace/openspec/changes/add-stockroom/tasks.md`).
- **Grade breakdown (`record.json`, `grade.checks`).** Core (12 families): 55.4/58 and 53.2/58. Tail: 55.3/202 and 68.7/202. Families at about zero: 24 (702c5333) and 21 (371a385b), for example abc-analysis, turnover-aging, backorders, pick-lists, shipments, packing, rma, supplier-*, po-approval, invoices-payments, stocktake, write-offs, bins, promotions.
- **Self-report vs grade.** 702c5333's final message lists bundles as implemented, but `bundles/nested-bundles-and-cycles`, `exploding` and `availability` score 0 (bundles 2.0/5). 371a385b's coupon rules (`pricing/coupon-rejections`, `coupon-usage-limit`) score 0 and `report-formats` is 3.3/7. Everything else it claimed matches.

**Interpretation.** One agent in one file converts about 0.44M tokens/min into about 3 tasks/min. It reaches the core and about a third of the tail, and the clock ends the run. It is time-bound, not token-bound.

## Q2. How the 12-agent arms divided the work

**What happened (facts, `events.jsonl` post and tool events).** Nobody assigned work. Agents posted "I'll own X" claims, then wrote one mixin module per capability group and a core facade in `stockroom/__init__.py` that inherits the mixins. All four swarm workspaces import cleanly and pass the visible check. Module counts (src files other than `__init__`/`__main__`): B 15 and 13, ST 23 and 28.

| run | `__init__.py` full `write` calls (agent @ s) | agents editing `__init__.py` | src files edited by 2+ agents / all src files | duplicate full-writes of one module (incl. refused) |
|---|---|---|---|---|
| f21a7e66 B | kite @275, finch @278 (26 KB), linnet @358 (refused) | 7 | 3 / 18 | access.py (swift, finch refused), `__init__.py` x3 |
| ad877a8f B | heron @100 (10 KB), tern @200 (19 KB) | 7 | 2 / 15 | `__init__.py` x2 |
| f7a15bdf ST | finch @60 (3 KB facade); wren wrote `core_ops.py` @93 | 3 | 6 / 25 | writeoffs.py (kite, plover refused), carriers.py (plover, linnet refused) |
| 4b350f75 ST | wren @79 (11 KB) | 4 | 2 / 30 | none |

- **B claims collided on the core.** In ad877a8f eight agents posted a claim to the core/facade within 15 s (finch 6.3, plover 7.3, tern 8.2, lark 8.8, heron 10.1, kite 10.3, crane 10.3, robin 14.7). Wren (14.6) and crane (14.6) then posted that several agents claimed `__init__.py`. Swift posted at 83 s and 95 s that `__init__.py` was still empty. The first core landed at 100 s (heron) and was replaced by tern's larger full write at 200 s. In f21a7e66 plover claimed the core at 7.8 s, finch at 11.6 s, and plover yielded to finch at 14.4 s, but the core did not land until 275-278 s, where finch's 26 KB write replaced kite's 11 KB write made 3 s earlier.
- **Per-agent work.** Each agent wrote 1-3 mixin modules (see the module lists in the workspaces) and took on CLI, integration or tick-marking. Spec reading was partitioned: each spec file was read by 1.8-2.4 agents on average (45-47 distinct spec files per run), while `proposal.md`, `design.md` and `tasks.md` were read by 11-12 agents each.
- **Claim mechanism.** Claims are free-text posts naming a file and a spec group. About 30% of posts are claim-like and 17-49 are yield, conflict or overlap posts (regex count, rough): B 49 / 36, ST 17 / 25.

**Interpretation.** The swarm reinvented a facade-plus-mixin layout without being told. The cost of "equals" shows in the core: eight simultaneous claimants, two or three whole-core writes, and a core that landed late.

## Q3. What staggered entry changed

**Entry (facts).** `enter` events: all 12 had entered by 88 s (f7a15bdf) and 71 s (4b350f75), against about 5 s in B. The first entrant (wren) posted a core claim at 14.0 s and 10.1 s.

| | B (f21a7e66 / ad877a8f) | ST (f7a15bdf / 4b350f75) |
|---|---|---|
| posts before 60 s | 55 / 54 | 24 / 28 |
| first src write (s) | 49 / 50 | 60 / 79 |
| agents claiming the core | 2 within 12 s then 4 more by 51 s / 8 within 15 s | 2 (wren 14.0, finch 15.9; settled by 40 s) / 1 (wren 10.1) |
| post calls / all calls | 27% (218/817) / 20% (164/819) | 20% (155/788) / 19% (146/784) |
| tokens in post-only turns | 28% / 20% | 22% / 21% |
| duplicate full-writes | 5 / 2 | 2 (both refused) / 0 |
| ticked tasks of 167 | 39 / 102 | 86 / 160 |

- **How later entrants chose.** They read the board on entry and claimed what was unclaimed: crane at 82 s in 4b350f75 lists "bundles, variants, promotions, shipping/invoices, backorders, picks/shipments/packing/RMA/carriers, scorecards/report formats" as unclaimed. Crossed claims remained (heron and kite both claimed purchasing at 48 s and 51 s in 4b350f75, settled by 62.7 s). In f7a15bdf wren and finch swapped roles twice (finch "Correction: wren owns core" at 18.9; wren "Finch owns `__init__.py`" at 22.3; robin "board confusion" at 31.6) before settling: finch the facade, wren `core_ops.py`.
- **Is it a mechanism or noise?** B's two runs differ by 0.19 and ST's by 0.16; B mean 0.734, ST mean 0.869 (+0.135), ranges overlap (B max 0.830 > ST min 0.790). With k=2 the score gap alone does not separate the arms. The traces support a mechanism on one point only: fewer simultaneous core claimants (1-2 vs 8), fewer duplicate whole-file writes, a single core owner in 4b350f75. They do not show lower coordination cost (post share is similar) and ST f7a15bdf still lost four unintegrated modules (Q4).

**Interpretation.** The stage A mechanism (an early agent claims, later entrants defer) is visible in 4b350f75 and partly in f7a15bdf. Its benefit here is a cleaner start, not fewer posts. Four runs cannot tell an effect of +0.13 from luck.

## Q4. Where the 24M went and the workspace at the cap

- **Cap, not clock, ended every swarm run.** Agents were never told the token cap (0 mentions of "token" in the first messages of wren in 4b350f75). The last clock they saw was about 22.8 minutes left. All four hit the cap at 417-440 s.
- **Cache reads are 94-95% of the tokens** (fresh input+output 1.27-1.45M of 24M). The swarm made 645-745 turns at about 34k tokens per turn; C1 made 131-140 turns at about 80k. Per-agent tokens: 1.1-3.4M (B and ST f7a15bdf), 0.6-4.6M in 4b350f75 (robin 0.60M; crane 4.6M, who read 39 distinct spec files as integration reviewer).
- **By turn type (share of tokens, turns split by their tool calls).** Post-only turns 20-28%, reading code 17-24%, test runs 17-21%, write/edit 14-24%, other bash 7-12%, spec-read turns 7-11%. A post is its own turn 97-99% of the time (post-only turns 216 of 218 posts in f21a7e66; 159/164; 152/155; 142/146), so each post costs one full-context turn.
- **Spec re-reading.** 124-169 spec reads, 0.74-0.97M characters per run, against 22-26 reads and 0.11-0.14M for C1. Mostly partitioned (Q2); the shared overhead is the three overview files read by 11-12 agents.
- **Workspace at the cap.** No file had a syntax error and every run passed the visible check. What was unfinished:
  - f21a7e66: wren's `write stockroom/reports.py` at 440 s is the last event, the abort followed, and the file is absent. Reports, import-export, units and barcodes never existed (see Q5). Only 39 of 167 tasks ticked.
  - ad877a8f: no module for warehouse-registry, bins, stocktake, reorder, stock-holds, write-offs (see Q6 for the crossed yields). Plover posted at 373 s that no `operations.py` existed.
  - f7a15bdf: four modules were written in the last 25 s and not wired into `Stockroom`: `landed_cost.py` (plover @414), `pick_lists.py` (tern @415), `packing.py` (crane @426), plus `shipments.py`. Checked by importing the package (`PYTHONDONTWRITEBYTECODE=1`) and comparing class modules with `Stockroom.__mro__`.
  - 4b350f75: `abc_analysis.py` (heron, write @421, edits to @435) exists but its class is not in the MRO; it is the only zero family. 160 of 167 tasks ticked.
- **Transient breakage.** Heuristic count of agents whose tool results show an ImportError or SyntaxError: B 4 and 9, ST 6 and 2. In f7a15bdf `purchasing.py` had an unterminated dict from about 289 to 319 s and five agents (lark 301, wren 305, crane 307, heron 313, finch 314) reported it before robin's fix at 324.

## Q5. Which grade families separate the arms

| group (weight) | C1 | B | ST |
|---|---|---|---|
| core, 12 families (58) | 0.96 / 0.92 | 0.83 / 0.95 | 0.98 / 0.96 |
| tail, 35 families (202) | 0.27 / 0.34 | 0.58 / 0.80 | 0.74 / 0.94 |
| families scoring at least half | 22 / 25 | 32 / 41 | 38 / 46 (of 47) |

- **Coverage separates, correctness within a covered family does not.** Mean quality within covered families (score over weight where family at least 0.5): C1 0.96 / 0.93, B 0.94 / 0.95, ST 0.98 / 0.97.
- **C1 vs swarm.** C1 scores 0 on 21-24 tail families the swarm mostly covered: events, access-control, customers/price-lists/quotes (C1 first run only), promotions, shipping, invoices-payments, pick-lists, shipments, packing, rma, supplier-catalog, po-approval, supplier-returns, scorecards, write-offs, backorders. abc-analysis is 0 in five of six runs (both C1, f21a7e66, both ST); only ad877a8f scored it 5/5.
- **Losses inside the swarm are missing or unwired modules, not weak ones.** f21a7e66 lost reports, import-export, units, barcodes (core 0.83) and 11 tail areas; ad877a8f lost six families (weight 33); f7a15bdf lost the four unwired modules plus abc, turnover, scorecards, supplier-returns, rma; 4b350f75 lost abc-analysis only (5 points).
- **Small ST-only edges.** f7a15bdf got `orders` 8.0/8 where the other five runs got 6.5/8 (confirm, ship, partial-shipments and cancel all 1.0 against 0.5-0.8). That is a core-behaviour difference, not a coordination one.

**Interpretation.** On a volume task the score is about how many capability modules exist and are wired. A swarm adds modules faster than one agent, and the failure modes are orphaned claims and unwired files.

## Q6. Bugs and friction

- **Wake path not exercised.** `events.jsonl` has no `wake` event in any of the four swarm runs and no user message after the first one in any `messages.json`. No agent ended its turn idle before the cap. The new default wake (posts carried when the profile has no inbox, `src/swarm.ts` lines 69-71) therefore received no test in this stage.
- **Write guard worked as intended in the three refusals inspected.** Eight refusals in total (B 2 and 1, ST 3 and 0, C1 1 and 1). Inspected: f7a15bdf wren msg 26 and ad877a8f wren msg 40 sent content beginning with an indented `def` (a continuation meant to be appended); the agents then used `cat >>` or `edit`. f21a7e66 linnet msg 99 sent a 15.9 KB core over finch's 26 KB core; linnet read the file and did not retry. No legitimate rewrite was found refused; the other five were not inspected. Note that the guard cannot stop a whole-file write that looks complete: kite's core (f21a7e66, 275 s) and heron's (ad877a8f, 100 s) were replaced by larger full writes.
- **Crossed yields orphan work (the main coordination bug).** In ad877a8f plover yielded `warehouse_ops.py` to swift at 31.8 s and swift yielded `operations.py` to plover at 33.0 s, 1.2 s apart. Nobody wrote it until the cap. In f21a7e66 reports (dunlin claimed it at 20.5 s, plover dropped it at 23.5 s, dunlin yielded to heron, heron pivoted) and units/barcodes (heron, kite, linnet each pointed at another) were never written; the board only noticed `reports.py` missing at 401 s, and then four agents claimed it within 25 s (swift, tern, robin, wren; lark at 428: "Conflicting reports.py claims").
- **Posts are full turns.** See Q4: 97-99% of posts are their own turn, 20-28% of tokens.
- **Agents do not know the token cap** (Q4); unfinished writes at the cap are lost (reports.py in f21a7e66).
- **Bash timeouts:** none confirmed in these runs. A regex found five hits in f7a15bdf; the three read were false matches on other text. The agents used `timeout: 10` or none. Not a problem at n=12 here.

## Open doubts

1. k=2: ST vs B (+0.135) is inside the overlap of the run-to-run ranges. The traces show a cleaner start in ST, nothing more.
2. Per-agent file lists count `write`/`edit` tool events only. Agents also wrote through `bash` (`cat >>`), so "writers per file" is a lower bound.
3. The "claim", "yield" and "core claimant" counts are regex or manual readings of posts; treat 49/36/17/25 as rough.
4. Unwired-module checks used the final workspace, not the state at each moment; whether an unwired module would have been wired with 30 more seconds is unknown.
5. Why C1 chose to stop at 3-5 minutes left is not stated in either transcript.
6. The wake change remains untested; a run where agents go idle is needed.
7. Grade families are mapped to spec areas by name only (hidden tests were not read).
