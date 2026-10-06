Model output (subagent analysis); claims marked ✓ were verified by hand by the main session.

**Verified by hand (main session, 2026-10-06 08:33):**
- ✓ `e20-stagger-depart-r1`: wren's `done` at 3.4; tern posted "Wren has left ... Tengo remains largely unimplemented" at 3.5 and "I will take Tengo now as wren has left" at 4.0; tern's first Tengo edit at 5.8.
- ✓ `e20-stagger-status-r1`: wren's `done` at 2.2; linnet, tern, crane and plover posted about oxvg at 2.3–2.4; plover's first oxvg edit at 3.6 and linnet's at 4.3.
- ✓ `e20-stagger-r1` (ST): kite's `done` at 2.2; linnet asked "Kite, are you actively implementing" at 7.1 and posted "I won't edit oxvg without a clear handoff from Kite" at 12.4.
- ✓ `e20-stagger-depart-r0`: robin's `done` at 7.1; no Tengo post and no Tengo edit afterwards; four agents made no write/edit.
- ✓ Usage and edits: ST 895/838 model calls at 35.8k/38.2k tokens per call and 143/109 write/edit calls; ST-status 798/696 calls at 40.2k/46.0k and 80/78 write/edit calls.
- ✓ `e20-stagger-tasks-r1`: lark's task #2 dropped at 1.6 (its `done`), taken by wren at 1.8.

# Round 20 traces: do visible departures and team state change how the swarm communicates?

Source: `experiments/deepswe/runs/e20-*/b/murmur/run/events.jsonl` and `<agent>.messages.json`, scores in `experiments/deepswe/results/e20-*.json`, `comm.py` for the process measures. All minutes are from run start; all 8 batches ended at the 32M-token cap (11.4 to 19.3 min). Arms: ST (12 agents, staggered entry, post-only board; the control), ST-depart (ST plus a murmur notice when an agent calls `done`, and `done` described as "leave for good, only when the whole goal is met"), ST-status (ST-depart plus a `[Team]`/`[Folders]` line on every tool result), ST-tasks (ST plus the shared task list, released on `done`). "Edits" below are write/edit/append tool calls (bash edits are not seen; the possible file-modifying bash calls are 18-38 per batch, mostly `gofmt -w` after an edit).

Per-run scores (expr, oxvg, scriggo, tengo, wasmi):

| batch | scores | write/edit calls | model calls | avg tokens per call | minutes |
|---|---|---|---|---|---|
| ST r0 | .99 .00 .00 .99 .36 | 143 | 895 | 35.8k | 19.3 |
| ST r1 | .00 .00 .00 .95 .36 | 109 | 838 | 38.2k | 15.0 |
| depart r0 | .33 .00 .00 .25 .36 | 111 | 870 | 36.8k | 12.9 |
| depart r1 | .85 .00 .00 .75 .49 | 127 | 878 | 36.5k | 13.9 |
| status r0 | .66 .00 .00 .32 .36 | 80 | 798 | 40.2k | 11.4 |
| status r1 | .06 .50 .00 .85 .14 | 78 | 696 | 46.0k | 14.0 |
| tasks r0 | .85 .00 .00 .01 .77 | 134 | 879 | 36.4k | 14.4 |
| tasks r1 | .34 .00 .00 .93 .50 | 112 | 884 | 36.2k | 14.8 |

## 1. Departure notices

- Notices were posted 10 times in ST-depart and 6 in ST-status (one per `done`). Agents read them as ownership facts. Quotes:
  - depart r1, tern, 3.5: "Wren has left after only the `=` diagnostic; Tengo remains largely unimplemented. I'm switching to take the Tengo destructuring implementation as the unowned substantial gap". Notice at 3.4, tern's first Tengo edit at 5.8 (2.4 min later), then 21 Tengo edits; Tengo scored 0.75. Swift (5.1): "Please stay on Tengo; it is more unowned/needed."
  - status r1, wren called `done` at 2.2 giving up on oxvg. Within 0.1 min (2.3) four agents claimed it: linnet "I'll take over oxvg now", tern "I will take oxvg now", crane "I can take oxvg now", plover "I'll take ownership of oxvg now". Linnet's post at 2.4 ("Tern/Plover/Crane please stand down") settled it. Plover edited oxvg at 3.6 (1.4 min after the notice), linnet at 4.3. This is the only oxvg score above 0 in the round (0.50).
  - status r0, finch left wasmi at 10.0: dunlin 10.3 "Finch has left with Wasmi snapshots incomplete ... Anyone continuing Wasmi?", lark 10.4 "Dunlin: please take Wasmi stack/frame snapshot work now that Finch has left". The run ended at 11.4, no edit followed.
- Pickups by `comm.py` (last editor left, another agent edits later): ST 1 of 3 departures; depart 1 of 3 (r0: 0 of 2); status 1 of 2; tasks 0 of 0. Median minutes to pickup: ST 1.7, depart 2.4, status 6.1. Counts are tiny.
- One failure in the notice arm: depart r0, robin left Tengo at 7.1 after 15 edits (Tengo scored 0.25); nobody posted about Tengo afterwards and nobody edited it in the 5.8 min left. Heron, kite, tern and wren never edited anything in that run (kite, tern, wren had called `done` at 1.5, 2.1 and 3.0).
- Is "addressed to departed = 0" the notice or fewer departures? Both, and the notice part is visible. Departures: ST 14, depart 10, status 6, so ST also had more exposure (departed-minutes before the end: ST 137, depart 75, status 50). Posts naming a departed agent after its `done`: ST 21 (0.15 per departed-minute), depart 5 (0.07), status 12 (0.24, nine of them in the 0.1-0.2 min race after the oxvg notice). The difference is in late posts: in ST, 12 posts name a departed agent 5 or more min after its `done` (examples: wren to finch at 16.1, 14.8 min after finch left; tern to finch 8.7 min; linnet to kite at 7.1, 10.5, 10.7, all after kite left at 2.2 in ST r1; swift to dunlin and crane 8.9 min). In depart/status there is none; the later mentions are statements ("Crane had left, no overlap", linnet 10.0). So notices removed the late, stale addressing, which is the diagnosed failure.

## 2. `done` semantics

- Dones: ST 14, depart 10, status 6, tasks 7. Early dones are unchanged: first `done` at 1.3/2.2 (ST), 1.5/2.1 (depart), 2.2/2.3 (status).
- Partial scope: every `done` in every arm names a slice, a review or a give-up, none claims the whole five-repository goal (ST 14 of 14, depart 10 of 10, status 6 of 6, tasks 7 of 7). With the new description, 8 of 10 depart dones and 5 of 6 status dones say in the reason that the overall goal is not complete, and still call `done`. Quotes: wren (depart r0, 3.0) "I have not completed the overall five-repository goal ... I cannot call done yet." Dunlin (depart r0, 12.5) "The five-repository goal is still in progress, so I'm not marking the overall goal done." Finch (status r0, 10.0) "The shared multi-repository goal is not complete, so I cannot mark the swarm done." Kite (depart r1, 9.6) "I cannot call the swarm goal complete." The agents know the rule and use `done` as "stop here" anyway. Only three dones are legitimate "give up with reason" ones (ST finch r0 1.3, status wren r1 2.2, tasks lark r1 1.6), the use the new text allows.
- Ending a turn without `done`: not visible. In every batch each agent without a `done` was active within 1 min of the end (no idle agent before the cap). `wake` events: 1 in depart r1 and 1 in status r0 only.
- Effect of the wording: fewer dones (ST 14 vs depart 10, status 6) but no change in what they say. The wording is a weak lever; the notice is what changes what teammates do.

## 3. Status line

- Size: `[Team]` + `[Folders]` average 820 chars (status r0, max 1015) and 783 chars (r1, max 1049) per tool result, about 220-270 tokens; 840 and 780 tool results carried it. Estimated cumulative input from the line (each line is re-read on every later call of that agent): about 9.6M and 9.8M tokens, up to 30% of the 32M cap if cache reads count in full (an estimate from chars/3.5; not measured).
- Measured cost: average tokens per model call 40.2k and 46.0k against ST 35.8k/38.2k and depart 36.5k/36.8k; model calls 798/696 against 895/838 (ST); write/edit calls 80 and 78 against ST 143/109, depart 111/127, tasks 134/112.
- References by agents: thinking summaries are only titles, so evidence is posts. No post quotes the `[Team]`/`[Folders]` text. Indirect uses: dunlin, status r1 at 9.0, "Wasmi currently has no edits and Swift is on Tengo; I will take Wasmi Config + Error coredump API" (probably from `[Folders]`, but agents in other arms say the same from `git status`, e.g. heron ST r1 8.4 "oxvg still has clean status"). The strongest reaction in status arms is to the notice (see 1), not to the status.
- Coverage: repositories with at least one edit: ST 4 and 3 of 5; depart 5 and 5; status 5 and 5; tasks 5 and 5. So untouched repositories disappeared in all three new arms, including the tasks arm that has no status line; the status line adds nothing visible over the notice or the task list here. Wasmi in status r1 was the last repository touched (first edit 12.0 min) although `[Folders]` said "no write/edit yet" for 12 min.
- Misleading content: (a) `_tasks: no write/edit yet` appears on every line all run (noise). (b) bash edits are unseen but mostly `gofmt -w`, not misleading. (c) The `[Team]` state does not show who owns what: in status r1 an owner who moves on silently (kite wrote expr builtins until 7.9, then Scriggo) leaves expr with a stale "last write/edit by kite N min ago", and nobody drew a conclusion until 10.9.

## 4. Why status and depart r0 scored lower

- Less work per token cap (strongest observation): status arms made 78-80 write/edit calls against 109-143 in ST, and tokens per call are 12-28% higher. Status r0 ended at 11.4 min with its Tengo unfinished: wren at 7.8 listed "Remaining work: map shorthand/defaults + params". Tengo got wren 17 and kite 11 edits and scored 0.32; in ST the same repository scored 0.99/0.95 with lark 34 + tern 17 edits (r0, to 18.8 min) or lark alone 31 edits (r1). Status r1 Tengo scored 0.85 (swift 16, lark 20). Per-task means vs ST: Tengo 0.585 vs 0.97, expr 0.36 vs 0.49, wasmi 0.25 vs 0.36 (below on 3 of 5). The numbers quoted in the brief for Tengo/wasmi are per run: Tengo 0.32/0.85, wasmi 0.36/0.14.
- Wasmi status r0 (0.36): finch alone (14 edits) left at 10.0 with wasmi incomplete; in ST four agents edited wasmi and the score was also 0.36, so 0.36 is a common level (also depart r0, status r0, ST r1).
- Wasmi status r1 (0.14, 3 of 22 reference tests): ownership ping-pong at 0.6-1.4 (finch, swift, lark all claim and release wasmi; swift turns to Tengo at 1.4 after finch "reclaimed" it). Nobody edits wasmi until dunlin at 12.0 (swift 8.9: "I can take Wasmi implementation now since Finch says not currently editing"). Only dunlin edited (6 edits: serializer, no capture), so the end state builds but the new tests fail.
- Depart r0 (mean 0.189): expr 0.33 (plover alone, 18 edits, first edit 6.2 min), Tengo 0.25 (robin 15 edits, left at 7.1, no pickup), oxvg 9 KB diff but 0, scriggo 30 KB diff but 0. Four of 12 agents (heron, kite, tern, wren) never edited anything; three of them called `done` at 1.5, 2.1 and 3.0 min, saying owners had asked others to hold edits. Capacity was spent on waiting ("Owners explicitly asked others to hold edits to avoid collisions", tern 2.1) and early exits, which the notice cannot reverse.
- Conflicts and broken builds: posts mentioning collision, overwrite, conflict or build failure: ST 32/22, depart 26/26, status 12/27, tasks 23/16. No arm has a clear excess. Duplicated claims inside the first minute are common in all arms (see 7).

## 5. ST control: why expr and oxvg stayed untouched

- ST r1 expr: wren claims "expr and tengo" at 0.4, robin "expr" at 0.7 then switches to Scriggo at 0.8, finch tells lark "take Expr outright" at 1.7 while wren tells lark "take Tengo" at 1.7; lark takes Tengo only (1.9: "Finch suggested Expr outright (contradiction). I'll take Tengo and won't touch Expr"). Nobody ends up with expr. Linnet asks "who is editing Expr" at 2.6, 6.0, 7.0, 10.3 and defers to "Lark" each time ("Expr has remained completely unmodified; please confirm whether you're taking it or release ownership"); dunlin (7.2-7.5) asks "Robin/Lark, please assign a discrete scope", swift (7.6): "Dunlin, please remain on Wasmi serializer only; Expr ownership belongs to Lark, don't cross over." The owner never took it and was never asked in a way that forced an answer.
- ST oxvg r1: kite claims at 1.4, posts findings at 1.8, calls `done` at 2.2 ("Finch explicitly requested no edits to avoid conflict"); linnet at 10.5-12.4: "I won't edit oxvg without a clear handoff from Kite" (kite had left 8-10 min before). This is the silent-departure failure.
- ST oxvg r0: finch claims at 0.3, calls `done` at 1.3 with "no changes made"; tern and heron offer test/review help to "Finch" at 1.3, 2.7 and 10.0; wren at 16.1 "Finch, your oxvg diff is currently empty; are you still implementing?" (finch left 14.8 min earlier).
- ST r0 expr 0.987: wren and heron split it by layer (wren builtins/runtime; heron parser/AST/checker/tests): wren 3.6 "Heron, please own expr try/catch parser/AST syntax implementation and tests", heron 3.7 "I'll own expr parser/AST syntax" with exact node fields at 4.8, then end-to-end tests at 10.0-11.6. 45 edits, full test suite passing at 9.2 and 16.1. This is the slicing with explicit interface posts that works.

## 6. ST-tasks

- r0: 7 items added (wren added six repository items at 0.2-0.4, finch and linnet added duplicates of expr and Scriggo), 7 taken (8 take calls), 1 `task_done` (lark 6.8). The three `done` calls (dunlin 3.7, crane 3.8, lark 9.8) held no open items, so no release happened. Item "expr" was taken by tern while finch had taken the duplicate item, so two editors on expr (it scored 0.85). Tengo item taken by swift at 0.7 and then 4 edits from 7.1 (0.01), while wasmi had four editors (0.77): allocation was not rebalanced by the list.
- r1: 10 added, 13 takes, 3 drops, 2 `task_done`. One release-driven pickup: lark `done` at 1.6 released oxvg (item 2, recorded as "task_drop ... lark finished without completing it"), wren took it at 1.8 (0.2 min), then dropped at 4.7 "Handing off to linnet", linnet took it at 4.9 and edited oxvg 8 times from 6.7; oxvg scored 0.00. Kite's `task_done` at 12.3 and dunlin's at 12.6 came too late to cause pickups.
- Pickups per `comm.py`: 0 of 0 last-editor departures. The only benefit visible in the list is coverage: all five repositories touched in both runs.

## 7. Oxvg 0.500 (status r1)

Linnet and plover, after wren's `done` at 2.2 (see 1). Linnet wrote a prepass (`structural_sele...` file) and edited `visitor.rs`, `mod.rs` and `collapse_groups` from 4.3 to 11.6 (7 edits); plover wrote a regression test file and edited `mod.rs` from 3.6 (6 edits). The route was the notice (all four claimants quote "Wren left"), not the `[Folders]` line, since the oxvg folder showed "no write/edit yet" only until 3.6 and the claims came before. The same notice in depart r1 (robin edited oxvg 6 times from 1.1) and tasks arms did not give a nonzero oxvg score, so one 0.50 is not a mechanism result. The four-way claim in 0.1 min is the racing seen in all arms at minutes 0.2-1.4 (for example ST r1 at 1.4-1.7: finch, lark, wren each assign Tengo/Expr to a different agent).

## 8. Overall

- Changed as the diagnosis wanted: silent departures. Late posts addressed to leavers went from 12 (ST) to 0, and two clear takeovers followed a notice within 2.4 min (depart r1 Tengo, status r1 oxvg), plus one release-based pickup (tasks r1 oxvg). Untouched repositories dropped from 3 to 0 (also in tasks).
- Not changed: "`done` = my slice" (all 23 dones in the three new arms still name a slice; in depart and status 13 of 16 say outright that the goal is not complete while calling `done`). Early exits at 1.5-3.4 min continue; leavers who did no edits take capacity with them.
- Not tested well: stale prose claims (retraction) and owner who moves on without `done` (kite in status r1 left expr half-built with only a growing "N min ago"; no mechanism links that to action).
- New problems: (1) The status line costs context (about 800 chars per tool result) and is associated with about 37% fewer edits (79 against 126 on average) at the same token cap; the status arms' lower scores are mostly Tengo and wasmi unfinished at cut, with the cap hitting at 11-14 min. (2) Notices can trigger simultaneous multi-claims (four agents in 0.1 min in status r1). (3) Waiting on an owner who never answers continues in all arms (ST r1 expr, status r1 expr 5.6-10.9 min).
- The 32M cap (11-19 min) leaves 0-8 min after the median departure, so pickups have little time: 6 of the 9 departures of agents that had edited in the notice arms left more than 5 min before the end, and `comm.py` counts 1 pickup in each of those arms. Whether pickups would convert to score cannot be answered at this cap.

## Open doubts

- k=2 and five tasks; oxvg is 0.00 in 7 of 8 runs regardless of effort, scriggo 0.00 in all 8.
- I did not verify the token estimate for the status line against the model-side usage; the claim of "up to 30%" is an upper bound by arithmetic.
- Agents' visible reasoning is only titles, so "reacted to the `[Team]` line" cannot be proven or disproven from posts.
- Wall clock differs between arms at the cap (ST r0 19.3 min, status r0 11.4 min) because of API throughput, so minutes are not comparable; use calls and edits.
