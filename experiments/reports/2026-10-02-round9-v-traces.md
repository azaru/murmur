# Round 9 panel V: why the 4-agent swarm lost to the single agent (model output, not committed)

Label: written by a subagent (model output) from transcripts. Numbers were computed with inline Python over `*.messages.json`, `events.jsonl` and `record.json`; the green r2 failure was checked by hand against the final workspace and the check output. Reading of causes (section 5) is interpretation. Scripts were under `tmp/claude-r9v/` (deleted).

## Results
S4 = v-swarm-clock n=4 (seed 20261035), C1 = c4g-clock n=1 (seed 20261033, round 8). Means: green S4 0.166 (0.201 / 0.298 / 0.000) vs C1 0.459; brown S4 0.412 (0.462 / 0.372 / 0.401) vs C1 0.448. Mean S4 0.289 vs C1 0.453, delta -0.16, loses on both: "loses" by the pre-registered rule. All 12 runs end by budget (S4 6-9 min, C1 12-23 min).

## 1. Green r2 (20261002T150204Z-2f2325e4) = 0.0
The package did not import. `stockroom/__init__.py` line 275 has `from .customers import CustomerMixin`, but `customers.py` defines `CustomersMixin`. Every one of the 260 scenarios therefore "crashed" with ImportError, so the score is 0 although about 17 modules existed. Cause: finch and lark both wrote `customers.py` (finch at t=402 s, `CustomerMixin`, and imported it in `__init__`; lark at t=427 s with `write`, replacing the whole file with `CustomersMixin`). Lark had posted "I'll implement section 27 customers" at t=402; finch posted "I just wrote customers.py ... avoid conflict" at t=407; robin posted at t=413 that both had claimed it. Nobody ran the check after lark's write; the run was cut by budget at 432 s (check output in `events.jsonl`, `check` event). 0 of 167 tasks ticked, 0 releases, 0 `done`. A second duplicate existed too: `warehouse.py` (finch) and `warehouses.py` (wren), the latter only because wren did not read what finch had wired in.

## 2. Token economics
Per run (S4 over 4 agents; C1 single agent):
| | S4 green | S4 brown | C1 green | C1 brown |
|---|---|---|---|---|
| calls per run | 253-277 | 247-273 | 91-98 | 116-125 |
| tokens per call | 15-27k (mean ~22k) | 15-29k | 61-67k | 48-52k |
| cache-read share | 90-95% | 90-95% | 95-96.5% | 96-97% |
| median context per agent | 15-26k (max 28-46k) | 16-31k (max 28-49k) | ~58k (max 109k) | ~53k (max 86k) |
| output tokens per run | ~46-52k | ~39-47k | 43k / 21k | ~21k |
| read volume | ~70 kB per agent, ~300 kB total | similar | ~165 kB | ~150 kB |
| share of tokens on board-only turns | 14-46% (mean ~32%) | 18-37% (mean ~26%) | <1% | ~1% |
Board-only turns (post/team/claim/release only) are 9-29 calls per agent, about 85-100 per run (a third of the 250-ish calls), each paying a 15-40k cached context. So the 6M is not paying full-project context four times: agents' contexts are 40% of C1's. It buys 2.5x the calls at 0.4x the context, about the same number of output tokens as C1. What is duplicated: each agent re-reads the spec (4-8 spec.md reads each; 300 kB read in total against C1's 150 kB). Cost is about 0.7-1.0M tokens per minute for S4 against 0.3-0.5M for C1, so the budget ends in 6-9 minutes and the remaining ~20 minutes of the 30 are unusable.

## 3. Coordination (green / brown)
- Claims: 16-19 (green), 13-18 (brown) per run. Conflicts: 0-3 per run, all resolved by taking another section. Sections never claimed: green 31-35 of 48 (only 13-17 claimed), brown 24-27 of 39. Ticked tasks at the end: green 15 / 40 / 0 of 167, brown 30 / 25 / 19 of 145 (swarm agents rarely tick).
- Done twice: green r2 customers (finch+lark) and warehouse(s); brown none observed. Overwrite of another agent's file with `write`: green 1 per run (`__init__.py` robin->wren r0, `__main__.py` finch->wren r1, `customers.py` finch->lark r2), brown 0. Cross-edits (edit tool on a teammate's file) 1-4 in green, 3-7 in brown. Reads of teammates' files: 27-37 of 73-92 reads per run.
- Building on teammates: yes, constantly, but through a shared single file. Green r2: lark posted "snapshots/events need `seq,actor` in audit, please update" at t=115 and finch eventually changed `_audit`; robin reported the failing public check at t=194 and finch fixed it; modules were written against posted interfaces (`_state`, `_audit`, `_clock`) before the foundation existed (lark wrote snapshots.py at t=47 s, `__init__.py` first appeared at t=81 s and had to be redone to match).
- Foundation: claimed in the first 10-30 s every time (green: wren, wren, finch; brown: robin, lark, finch) but in green it was not released before the end in 2 of 3 runs and the same agent kept editing `__init__.py` (22 write/edit calls in green r2) as the sole integrator. Others did not wait: they wrote mixins immediately, each guessing the interface, then posted "please add X to the MRO" (about 15 such posts per green run). In brown the foundation (dates.py, small shared module) was released after 75-286 s and the others had already started; brown extends existing code, so the pieces are separable.

## 4. Per-capability scores
Brown (41 capabilities, 390 scenarios): S4 covers 32-34 capabilities >0 against C1 31-33; scenarios fully passed S4 203 / 222 / 193 against C1 210 / 226 / 218. Almost identical profiles; the gap is small (-0.04) and sits in notifications (S4 0.43 vs C1 1.0, 1.0, 0.38), activity, a few capabilities with partial credit; S4 sometimes wins single capabilities (recurrence, estimates, timesheets). Crashed scenarios are the same ~55-66 in both arms (shared gaps: subtasks, burnup, team-capacity, favorites, field-search, calendar-export are 0 for all).
Green (47 capabilities, 260 scenarios): S4 covers 14 / 16 / 0 capabilities against C1 32 / 24 / 32. Scenarios fully passed S4 49 / 76 / 0 against C1 116 / 81 / 96. Crashes are missing methods (S4 r0: 154 crashed, 46 on `create_order`, 38 `add_supplier`, 19 `add_customer`; r1: 113 crashed, `add_supplier`, `add_customer`, `subscribe`). Where S4 builds a capability it is as correct as C1 (catalog, stock, ledger, units, barcodes, variants, bundles, attributes all 1.0 in r0/r1), but orders, purchasing, returns, reports (0), shipping, price lists, promotions never exist. C1 also covers about 10 capabilities S4 never has (orders 0.76-0.95, purchasing, customers, stocktake, reorder). So the loss is breadth: green is a 47-capability, mostly sequential project in which swarm progress was limited to ~17 modules in 7 minutes.

## 5. Diagnosis and changes
Diagnosis (interpretation). The swarm spends a third of its tokens on board turns and 2x duplicated spec reading, burns the 6M in under 9 minutes, and funnels all integration through one shared file (`__init__.py` MRO) whose owner is the foundation agent, so interface mismatches (a name, a missing import) are fatal and nobody runs the full check on the merged state; green r2 is that failure in its pure form. Unclaimed and unticked sections show the swarm covers about a third of the work at the budget, while C1 gets 12-23 minutes and 2x the sections. On brown (extensible, separable modules) the swarm ties C1 within 0.04, so the loss is concentrated where integration is fragile and the work is long.

Changes (profile level only, all hypotheses):
1. Auto-discovery integration norm: tell the foundation holder (teamBriefing) to make `__init__.py` assemble `Stockroom` by scanning the package for `*Mixin` classes (pkgutil/importlib, tolerant of import errors in a module and reporting them), and tell everyone never to edit `__init__.py` and to run `npm run test` after each write. Falsifier: rerun ospec_green k=3 with this profile; if the share of crashed scenarios stays above ~40% (S4 now 43-97%) or any run scores below 0.2, drop it. Cheapest: green only, same budget, 3 runs ~18M.
2. Fewer board turns and fewer agents: n=2 (or n=3) with the same 6M and a norm "post only interface changes and failures, one post per section" (cuts board share from ~30% to <10%, gives each agent 3M and ~15 min). Falsifier: the same green k=3 at n=2; if the mean stays at or below S4's 0.17 it is not the token split. Cheap because the n=2 run is a different n, not new levers.
3. Staggered entry on the foundation: agents other than the foundation holder first wait for a post "foundation ready" (or take a section with no dependency such as units/barcodes/categories read-only first) and only claim after reading `__init__.py`. Falsifier: count modules written before the foundation exists (now 2-3 per green run, rewritten afterwards) and compare the score on green; if rewrites remain, it was not the cause.

## Open doubts
- Green S4 is capped at 6M so scores are floors; with a higher budget the swarm could close more of the gap, but a swarm run with higher budget costs more than C1.
- S4 and C1 were not paired in time; C1 (round 8) noise is 0.39-0.52 on green.
- `bash` writes (heredocs) were not included in the file-ownership analysis, only `write`/`edit`.
- Claim-failure detection used the claim result text ("is claimed by"); 8 failures found across 6 runs.
