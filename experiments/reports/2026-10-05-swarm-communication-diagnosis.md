This report is model output (subagent analysis of the transcripts). Claims marked ✓ were verified by hand by the main session (2026-10-05 17:43); the list below says what was checked.

**Verified by hand (main session):**
- ✓ `team` and `inbox` were offered in 4 of the 54 twelve-agent runs (swarmtest and DeepSWE) and never called in any of them; in the ST profiles a `done` reason is not visible to teammates.
- ✓ `e19-stagger-r0`: finch called `done` at 1.5 min on oxvg; wren asked finch about oxvg nine times from 18.3 to 26.4 min ("Finch no response and oxvg repo clean" at 21.7), took it at 26.4 and made its first oxvg edit at 27.8.
- ✓ `e19-stagger-r0`: robin claimed expr at 0.4, handed it to wren at 0.5 and corrected at 0.6; robin called `done` at 10.9; linnet still asked for "Robin approves" / "Robin confirms" on expr and scriggo from 17.7 to 32.2 min.
- ✓ `e18-swarm-r1`: swift called `done` at 5.6 min; 50 later posts name Swift, the last by crane at 104.4 ("Swift, ... Please avoid those files").
- ✓ `e19-stagger-tail-r0`: robin's tool results kept showing "tern: Staying on Tengo" in the tail for at least 20 minutes, well after tern's `done` at 6.9.
- ✓ `e19-stagger-tasks-r0` (invalid batch, first minutes): swift's `done` at 1.2 dropped its task #3 automatically ("swift finished without completing it"), and plover took #3 next. Swift's done reason says it "will continue with the assigned Scriggo task rather than mark the overall goal done" — it called `done` believing it would keep working.

# Swarm communication diagnosis (12-agent runs)

Scope: every 12-agent run listed in the brief. DeepSWE = batches `e17-swarm-r0/r1`, `e18-swarm-r0/r1`, `e19-stagger-r0`, `e19-stagger-tail-r0` (6 valid board runs, 40 repo-runs), plus `e19-stagger-file-r0` (no board) and the first 15 minutes of `e19-stagger-threads/norms/tasks-r0` (mechanism use only). Swarmtest = 40 runs (seeds 20261070/72/74/80; planning, shop2, ospec). Times are minutes since `run_start`. DeepSWE paths are under `experiments/deepswe/runs/<batch>/b/murmur/run/`. k is 1-2 per cell everywhere, so arm contrasts are anecdotes.

Arm glosses (first use). **ST** = 12 equal agents, staggered entry (one every 60 s), post-only board, write guard, clock. **ST-tail** = ST where every tool result also shows each teammate's latest post (first 100 chars). **ST-file** = no board, only a shared `TEAM.md`. **ST-threads** = ST with thread_new/reply/thread_read instead of post. **ST-tasks** = ST plus a shared task list (add/take/done/drop; a leaving agent's taken items reopen). **ST-norms** = ST with extra norm text in the prompt. **S2** = two agents, parallel attempts, a board (`s2-board-clock`). **n12-tasks / n12-branches / n12-roles** = 12 agents with a task list / a branch per agent / a role menu. **n12-stagger-tokens** = ST with a token clock.

Method: scripts over `events.jsonl` (posts, `done`, tool calls with args) and `<agent>.messages.json` (tool results), under `tmp/claude-commdiag/` (deleted at the end). Post classification, claim detection and "awareness" are regex heuristics: counts are indicative, the quoted cases are read by hand. Reasoning content is encrypted and not used.

## Mechanics confirmed in code

- ✓-candidate (read in `src/board.ts`, `src/swarm.ts`): `done(reason)` writes the reason only to `member.doneReason` and logs a `done` event. The only reader is the `team` tool (`Board.team`), and the ST profiles offer `boardTools: ["post"]`. Across all 50 12-agent runs, no agent ever called `team` or `inbox` (tool counts by name). A departure is therefore invisible to teammates unless the leaver posts.
- A post attaches to the recipient's next tool result. A done agent is not woken (`revive` 0). The run ends `quiescent` when every agent is done or has nothing unread, so a swarm whose agents have all left ends early even if the goal is unmet.
- `TaskList.release` runs on `done` only when the task list is on (`swarm.ts` line 136). In every other arm, claims made in prose never expire.
- Delivery latency is not the problem: in DeepSWE ST runs the median delay from a post to the recipient's next attach is 4-5 s (p90 0.4-0.8 min, p99 1.4-5.6 min; e17/e18). Later batches show longer tails (e19 p90 3-12 min) but those include long `cargo` runs and, for threads/norms/tasks, the usage-limit stall after ~15 min.

## Ranked failure modes

Cost estimates are bounded by what the data shows; "low score" means final task score < 0.5.

| # | Failure mode | Frequency | Estimated cost | Best example |
|---|---|---|---|---|
| 1 | **Silent departure leaves a repo/slice unowned, and teammates keep believing the leaver is alive** (done reasons are invisible; "silent" is read as "busy") | 47 departed agents in 6 DeepSWE board runs; 26 (55%) were addressed by name afterwards, 221 posts, 155 of them requests; only 9 leavers were ever recognised as gone (regex). 11 of the 20 low-scoring repo-runs (of 40) ended with the last editor gone, 4-113 min still on the clock | Up to 11 repo-runs left unattended; for the 7 in e18 that is 12-113 min of idle clock each. Wait cost per episode 3-60 min | e19-stagger-r0: finch left oxvg at 1.5; wren concluded "Finch no response" at 20.1, took oxvg at 26.4, 3 edits, score 0 |
| 2 | **"Done" means "my slice is finished", with no goal-level view; agents quit early and capacity is lost** | All 6 board runs. 35 of 58 DeepSWE dones admit partial scope; only 2 of those were announced on the board just before leaving. e18-r0: 11 of 12 agents done by 22.8 min, run ended 34.2 with 5 of 10 tasks at <= 0.14. e19-r0: 4 agents (finch, heron, plover, tern) quit by 3.1 min with zero edits | e18-r0 vs e18-r1 (same arm): mean 0.455 vs 0.67, i.e. about +2.1 task-points, produced by the 5 agents that kept going (97% of r1's 337M tokens). In r1, 7 of 12 agents were gone by 20 min and used 2.7% of tokens | e18-swarm-r0 done reasons, e.g. tern 12.1 "only partially complete", heron 16.2 "remains incomplete"; nobody checked what was left |
| 3 | **Ownership ambiguity at claim time: retracted, relayed or stale claims, so a repo is believed owned and nobody works it** | 16 of 45 repo-runs had 2+ claimants (regex). 2 clear orphanings from it (e18-r1 expr, e19-r0 expr), plus the same pattern for oxvg in e17 | e19-r0 expr 0.04 for the whole 39 min (5 agents cite "Robin owns expr"; Robin had retracted at 0.6). e18-r1 expr unowned until 91-93 min; it was still being edited when the clock hit 119.5 (final 0.886, plover: "I did not complete every requested Expr behavior") | e18-r1: swift posts "I will handle expr" 0.7, then "I'll take scriggo" 0.7; finch yields to swift's expr claim at 0.9; first mention of expr's state at 60.5 |
| 4 | **Owner-gating: helpers wait for confirmation from owners who are busy or gone** | 270 direct requests in DeepSWE: 79 (29%) to agents already done; of the 191 to live agents 112 (59%) got a reply naming the asker within 5 min, 19 (10%) got no post at all in 5 min | 3-14 min per episode in e18-r1 scriggo (crane waited on swift from 6.0; first crane edit 15); about 20 min of idle helpers in e19-r0 (wren/linnet/dunlin on Robin) | e19-r0 linnet 17.0-32.5 "Robin, may I take ... please assign specific scope" (Robin done at 10.9) |
| 5 | **Allocation blindness: no shared view of which repo is weakest, so attention goes to repos that are already good** | e18-r1: wasmi (score 1.0) had 4 editors and 151 edits; dasel (0.22), participle (0.13), oxvg (0) got no edits after their owners left at 6.5, 19.9, 15.3 | Up to ~0.8 score points each on dasel and participle (unknown; r0 got dasel 0.92 in 10 min, so first-pass quality varies) | e18-r1 per-repo edit table below |
| 6 | **Echo and single-owner bottleneck on single-deliverable tasks**: every agent runs the same test and posts the same result to one file owner | 17% of 5,048 swarmtest posts match echo wording (30% in planning ST: 44 of 146 posts); in planning ST only 4 editors / 11 edits among 12 agents | Tokens (12M cap hit) rather than score: planning ST scored 0.45/0.49 vs S2 (2 agents) 0.40/0.43 | `295e25a1` ST planning 1.4-2.2 min: 10 agents post "my run is infeasible, 8.5 s fallback" |
| 7 | **Shared blind spot at the finish: 12 agents "independently validate" the same weak criterion and all finish within minutes** | shop2: 5 of 40 swarmtest runs scored 0 with all or nearly all agents `done` within 1-3 min of each other (`0a019874`, `c0f34249`, `b54b47ab`) | Score 0 (quality worse than naive baseline); grader detail only visible to the grader, so the agents could not know | `c0f34249`: 14 done reasons each say "independently validated ... all hard constraints pass" |
| 8 | **Environment facts rediscovered** | e18-r1: participle "go test needs network (Kong download)" hit by kite at 3.1, plover at 69.7, crane at 92.4; first board mention 72.4 | A few calls each; small | see Q4 |

## Q1. Silent departures and stale claims

Counts (6 DeepSWE board runs, name-addressed posts with capitalised names; "aware" = a later post that says the agent is silent, gone or done, regex):

| run | departed agents | addressed afterwards | posts addressed to them | recognised as gone |
|---|---|---|---|---|
| e17-swarm-r0 | 6 | 5 | 17 | 0 |
| e17-swarm-r1 | 2 | 1 | 11 | 1 (at +9.4) |
| e18-swarm-r0 | 11 | 2 | 9 | 0 |
| e18-swarm-r1 | 10 | 6 | 105 | 4 |
| e19-stagger-r0 | 11 | 8 | 76 | 3 |
| e19-stagger-tail-r0 | 7 | 4 | 18 | 0 |

Mis-beliefs are stated, not just implied: 47 post-departure posts say the leaver "owns / is handling / is active" (regex).

Cases (all re-readable with `python3`-style filtering of `events.jsonl`; times in minutes):
- **e18-r1 swift (Scriggo)**: swift posts at 5.0 "Is anyone available to pair?", at 5.2 asks linnet for an architecture report, calls `done` at 5.6 ("remains incomplete"). Linnet, crane and dunlin then address "Swift" 50 times between 6.0 and 104.4. At 8.1 linnet: "Swift hasn't replied yet", 8.2 crane: "several pings, no response"; they proceed at 8.6-9.1 on their own. At 104.4 crane still posts "Swift, I implemented parser/AST nodes ... Please avoid those files". Takeover happened (Scriggo 0.973) because other agents chose to proceed after about 3 min; the cost is delay (first non-swift Scriggo edit linnet 9.4) and the idle waiting of crane (first edit 15).
- **e18-r1 tern (Tengo)**: `done` at 2.8 "I claimed Tengo, but the requested destructuring feature spans ... did not implement". No post. First notice crane 60.7 ("What code area/subtask is unclaimed?"), plover and crane start 77. Tengo finished 1.0 (binary). Cost: 57-74 min of wall clock, no score loss only because the run had 120 min and no cap.
- **e18-r1 dunlin**: done 46.1. At 54.2 linnet tells crane "Dunlin owns emitter ... and is active", 54.3 crane: "You've gone silent; I won't overlap without confirmation". 57.4 crane edits anyway ("Dunlin has not replied"). The wrong belief ("active") came 8 min after departure.
- **e18-r0 dunlin (FastAPI)**: done at 2.9 and 4.7. Lark asks "Dunlin" to extend decorators at 9.3, 12.8, 13.0, 17.5, 20.1 (5 requests, 11 min); wren answers at 10.1 and 13.0 "dunlin owns app methods"; lark does it itself at 18.9. FastAPI scored 0.977, so the cost is ~10 min of lark's time.
- **e19-r0 finch (oxvg)**: posted twice (0.3, 0.5), done at 1.5 with "I have not identified a safe implementation point". 15 posts address Finch afterwards; wren: 19.5 "Finch, oxvg status clean, are you working there?", 21.7 "Finch no response and oxvg repo clean; I'm going to inspect/take Oxvg", repeated pings 22.1-26.1, "taking" at 26.4, 3 edits in 28-39 min, score 0. Wren's evidence was `git status` ("clean"), not any message from Finch; the done reason was never visible.
- **e19-r0 robin (Scriggo + expr)**: claimed expr at 0.4, retracted at 0.6 ("Correction: I will handle scriggo, not expr"), edited 3 times, done at 10.9 (broad checker/runtime work left). 17 posts addressed to Robin afterwards (6.0 min later onward, last at +21 min). Expr and Scriggo scored 0.04 and 0.
- **e17-r0 wren and e17-r1 tern (oxvg)**: wren done at 1.5, tern done at 2.0, both silent. Plover, crane, dunlin send 7 and 14 posts to them ("I'm unassigned; happy to take Oxvg ... Oxvg hasn't responded yet, so I won't create conflicting work", dunlin 3.9) until the budget ended at 11.8-13.5. Oxvg: never edited, score 0 in both runs. Note oxvg scored 0 in every run, even when edited (lark 7 edits in e18-r1, 3 in e19-r0), so the loss attributable to abandonment is unknown; it may be a hard task.
- **e19-tail tern (Tengo)**: tern posted twice (last 1.9 "Staying on Tengo"), 1 edit, done 6.9. No one mentioned Tengo again. Tengo 0.01. Robin's last tool result (≈18.6 min, 12 min after Tern left) still shows "- tern: Staying on Tengo. Destructuring requires parser/AST ..." in the tail footer: the tail kept a stale claim on display.

Aggregate outcome: in the 6 board runs, 20 of 40 repo-runs scored < 0.5: 3 never edited, 6 were being edited at the end, **11 ended with the last editor gone and nobody continuing** (4-113 min before the end; the 8 e18 cases were 11-113 min). Caveat: some of these repos may not be solvable by this model at all.

## Q2. Duplicate and conflicting claims

- First minute: every DeepSWE run has the same pattern: ten repos, twelve agents, all claimed within 2 min. Regex claims: 69 claims over 45 repo-runs, 16 repo-runs with 2+ claimants (expr in e18-r0/r1 had 5-6).
- Resolution is mostly yielding by post ("Finch and I both claimed expr; I will switch to dasel", wren 0.2 e18-r1). That works in the typical case (about 1 min, 5-10 posts). It fails in two ways: (a) a claimant who has already switched is still treated as owner (e18-r1: swift's expr claim at 0.7, swift's scriggo claim at 0.7, finch yields to swift on expr at 0.9; kite claims expr at 0.9 and 0.9 participle; net result nobody on expr); (b) a claimant retracts in his own post and others cite the older message (e19-r0 Robin, above). Both orphaned expr for 60-90 min or the whole run.
- Duplicated editing is small. Files edited by 2+ agents: 4-8 per run in e17/e18-r0/e19, 16 in e18-r1; 11-31% of edits fall on them, mostly cooperative (explicit file ownership posts such as e19-r0 swift 6.9 "I currently own parser.go and expr.go AST, and Wren owns compiler.go" produced Tengo 0.95 with three agents). Largest true duplication: e18-r1 fastapi (dunlin 30 + plover 17 edits on `routing.py`, 21+13 on the same file in the same 3-15 min; score 0.744, k=1) and e17-r0 expr (finch 30, robin 10, linnet 5; 0.0).
- Edit error rate is about 10% (41 of 388 edit calls in e18-r1, 14 of 106 in e19-r0); not separable from stale-text errors by this pass.
- In swarmtest single-file tasks, the claim problem takes the form of one file owner (Wren posts at 0.1 in `295e25a1`) while other agents hold back; one agent (crane, 0.8) said "I'll build a robust implementation now unless Wren has already started", was told within 0.1-0.3 min by three agents, and complied.

## Q3. Agents with nothing to do

- Offers within the first 10 min (regex "I can take/help/review", "available", "standing by"): 13-41 per run by 5-10 agents (e17-r0 33, e17-r1 41, e18-r0 13, e18-r1 33, e19-r0 26, e19-tail 16). An accept-like reply naming the offerer within 4 min exists for up to 70-90% of them (upper bound, the regex for "accept" is loose); e18-r0 is the exception (2 of 13).
- Offers mostly convert into **read-only audits sent to the owner**, not edits: e18-r1 linnet 2.4 "Audit findings: APIRoute ...", e19-tasks heron 1.4 "Scriggo architecture findings (no edits)". Several end with `done`: agents that never edited and then called `done` in the first 3-10 min: e17-r0 crane/heron/swift, e19-r0 finch/heron/plover/tern, e19-tail wren/kite/plover (10 agent-slots in 3 runs). Typical done reasons: "all five repositories have active owners" (e17-r0 crane 3.2; e19-r0 plover 2.9; e19-tail kite 3.0), "standing by for explicit non-overlapping task ownership" (e19-r0 heron 2.5).
- Offers are answered when the owner is alive and responsive (e18-r1 robin delegated fastapi to dunlin and plover within 0.6 min of the offers) and ignored when the owner is silent (e19-r0: heron 1.6, 1.8 and 2.4 three requests to Robin about an expr slice, no answer; heron quit at 2.5).
- The offer step has a structural effect: 10 of 12 agents in e18-r1 posted offers "I can review/assist" in the first 8 min while 7 of them left by 20 min; the 5 who kept offering and re-spreading carried 97% of tokens.

## Q4. Information that existed but did not travel (and the reverse)

Did not travel:
- **Network blocked for Go modules** (e18-r1): kite's `go test ./...` in participle failed at 3.1 on `proxy.golang.org ... dial tcp: lookup`. First post naming it: plover 72.4 ("Participle conformance blocked missing network kong download"). Plover re-hit it at 69.7 and crane at 92.4. Cost: a few diagnostic calls each; small.
- **Hanging dasel reader** (e18-r1): `TestReadHTMLScriptStyle` hangs (`panic: test timed out after 10m0s` in the grader log). Wren stopped at 6.5 ("go test ./... passes"); plover re-ran dasel `go test ./...` at 70.3 and it passed. The visible tests did not reveal it, so a reviewer running the same tests would not have found it either; only reading the reader's loop or writing a script/style edge test would have. Final 0.219.
- **Stale ownership state** (Q1) is the largest class: the information "X left, slice unfinished" existed in `done(reason)` and never reached the board.
- **Weak shared validators** (Q7 of ranking): 12 agents trusted each other's "independently validated" claims for shop2.

Travelled and changed an action:
- e18-r1 plover 76.5 / crane 76.5: Tengo AST contract (`Pattern` interface ...) then plover 76.7 "Contract works. Please include `Patterns []Pattern` ..." followed by Tengo edits from both (plover 77-97, crane 77-95); Tengo 1.0.
- e18-r1 crane 99.5-100.3 and plover 100.1: "take Expr parser/AST block syntax; I'll own compiler/VM" and crane's `TryNode` contract at 100.3; crane edits 101-116, plover 92-119; expr 0.886.
- e19-r0 wren 1.6 "Swift please own parser/stmt.go and parser.go ... I will own compiler.go" and linnet 10.6 "Wren delegated function-entry compiler.go block to me, so I will own only FuncLit parameter handling": three agents edited `compiler.go` in turn without a conflict; Tengo 0.95.
- e19-tail: crane's 13.1 post about oxvg `pnpm install` network failure appears in five other agents' tool results within 0.5 min (13.1-13.6). Delivery works; whether the recipients acted is not visible.
- e19-r0 swift 12.8-13.0 (two compiler review concerns) and wren 13.2 reply point by point; wren's matching edits are at 12.4/12.7, so the causal order is not clear.

## Q5. What posts carry

Regex classification of 6,552 posts in all 50 12-agent runs (heuristic; the "offer" and "finding" patterns are broad): request/question 30%, finding/evidence 23%, help offer 22%, other 14%, status 8%, claim 4%, agreement/thanks 0.4%. Posts that name a specific teammate: 1,872 (29%). Of those, 85% got any post from that teammate within 5 min (lenient proxy), 8% were addressed to an agent that had already called `done`, 7% got no reply from a live agent. Strict view for DeepSWE direct requests (target named in the first 45 characters, contains a question or "please"): see Q ranking row 4 (59% replied by name, 29% to departed agents). Swarmtest runs: 255 direct requests, 1 to a departed agent, 26% replied by name (the runs are 4-13 min and agents answer by acting instead of replying).

Acting on posts: attach delivery is immediate (median 4-5 s), so unread posts are not the issue. Evidence that agents act on posts: file-ownership proposals are followed (Q4); ping-and-wait loops show agents obey "avoid X" posts to a fault (waiting for an absent owner). I did not measure post-to-action rates automatically beyond these cases; claim "most posts lead to an observable action" is unsupported.

## Q6. Review and integration

- Another agent touching a repo after its last edit: e18-r0 0 of 9 edited repos (the swarm left). e18-r1 7 of 10 repos had at least one other agent run a test or look after the last edit; dasel/participle/oxvg reviews were test runs (plover 70.3 validation sweep) that could not catch the hanging reader.
- Unreviewed-complete cases: dasel (wren left 6.5; no review); participle (kite left 19.9; crane's quick review at 98.1 found a real flaw, "suppressedSubtree skips first/first checks ...", but crane said "I won't edit conflicts.go without Kite" and kite was gone since 19.9).
- Bug found by review and fixed: e18-r1 crane 109.1 and 115.2 reported expr `try { arr[5] } catch { 9 } finally { cleanup() }` returning the original error; plover owned the VM fix.
- ST-file (`e19-stagger-file-r0`) has no board, so reviews can only be traced through `TEAM.md`: 87 write/edit calls to it, 35 errors (stale-text conflicts).

## Q7. Mechanism contrasts (k = 1-2; direction only)

- **Task list (ST-tasks, first 15 min only, ✓-candidate in `e19-stagger-tasks-r0`)**: swift called `done` at 1.2 with #3 taken; the list released it; plover `task_take 3` at 1.4 succeeded ("You have taken #3."), kite's take at 1.5 was refused ("#3 is taken by plover"). Duplicate claim and stale claim resolved in 0.3 min. It does not fix gating on silent owners of work that is not on the list, and wren pre-created all five items itself.
- **Tail (ST-tail)**: fast broadcast of the latest post (13.1-13.6 min network fact), but it also freezes a stale claim on display (tern, above). Tengo 0.01, 4 of 7 done agents addressed afterwards.
- **File (ST-file)**: 0 posts, no claims at all; `TEAM.md` contention (87 edits, 35 failed). 11 of 11 dones, no one addressed a departed agent (no one could). Scores: expr 0.34, tengo 0.69, scriggo/oxvg 0, wasmi 0.13.
- **Threads (ST-threads)**: first 15 min: 54 posts but median post-to-attach delay 4.6 min (usage-limit stall confounds). Swarmtest `n12-stagger-threads-tokens` vs `n12-stagger-tokens` (k=2 each): planning 0.35/0.60 vs 0.48/0.43; shop2 0.45/0.48 vs 0.64/0.63. Echo share 25-48 of 97-140 posts in threads shop2/planning vs 23-26 of 97-164 in tokens: no sign threads reduce echo.
- **Branches (n12-branches)**: 12 editors every run, 41-63 edits, 20-76 posts (lowest chatter). shop2 0.56/0.76 (best arm), planning 0.46/0.35 (middle). It removes the single-owner bottleneck of Q ranking row 6 for single-file work. `n12-branches-optional` (branches offered, not forced): 0 / 0.07 planning, 0.02 / 0.40 shop2, two of four hit the token cap: mostly worse than ST.
- **Roles (n12-roles)**: more posts (133-214) and more echo; no better scores (planning 0.35/0.42, shop2 0.42/0.39).
- **Stagger vs simultaneous entry**: S2/ST comparisons on swarmtest show no clear difference (planning S2 0.40/0.43 vs ST 0.45/0.49; shop2 0.39/0 vs 0.38/0.69). In DeepSWE the stagger does not prevent the claim storm: 10 repos are claimed within 2 min in every run because agents enter every 60 s but read the board once.

## Q8. Other failures not covered above

- **"Silent" read as "busy".** Agents consistently interpret absence of a reply as "owner is occupied" (and therefore do not edit) until at least 3 min, up to 20+ min, have passed. There is no timeout norm.
- **Give-up with unannounced done.** 4 of the 5 early give-ups (finch e19-r0 1.5, robin e18-r0 1.7, tern e18-r1 2.8, wren e17-r0 1.5) are on the same repo type: oxvg or Tengo; they claim on the board and leave without posting the reason. The reason sits in `done(reason)` and is not shown.
- **Clock asymmetry.** e18-r1 ran 120 min only because 5 agents kept working; the 7 who left early had no signal that the rest of the swarm still needed help (their dones read "remaining work with owners").
- **Budget ends mask abandonment.** In e17 and e19 (32M token cap, 12-39 min), the whole swarm is cut short; abandoned slices cannot be separated from "ran out of budget" there. Abandonment is clear in e18 (no cap).

## What a mechanism would need to fix, top 3

Requirements only; each must work on tasks with no tests and must not show anything about the hidden grader (AGENTS.md "Realism first").

1. **Silent departures / stale claims.** Requirements: (a) when an agent leaves, the board shows to everyone, once and in the same channel as posts, that the agent has left and what it said was unfinished; (b) a claim by an agent that has left or is unreachable stops counting as ownership (without murmur assigning the work to anyone); (c) the state must be derived from facts murmur already has (done, last tool activity), not from the agent's willingness to post; (d) it must not be shown as a deadline or a score. A leave note by the agent is an optional addition. Task-list arms already do (b) for listed items (e19-tasks 1.2-1.5 min); the requirement is the same for prose claims.
2. **Goal-level state for the decision to leave.** Requirements: an agent deciding to call `done` must be able to see, from facts only (which repos/files have been touched, by whom, which agents are still active, how much clock remains), what remains unowned or unexamined, without being told what to do; "done" must differ from "I gave up on my slice" so that a give-up is not a quiet exit; no assignment of roles or work; no grading information; no use of a visible acceptance check (it would be lab-only).
3. **Ownership ambiguity and owner-gating.** Requirements: (a) one authoritative, current statement per claimed unit ("X is handled by Y" and later "no longer") that readers see instead of hunting through posts; (b) a way for an agent to see that a claimed repo is clean or untouched after N minutes (Wren used `git status` by hand at 17-26 min in e19-r0 and 60-68 min in e18-r1) without waiting for the owner; (c) a norm or default that a request with no answer from a reachable-but-silent owner is not blocking after a bounded wait; (d) must not hand out work.

## Open doubts

- k is 1-2 per arm everywhere; swarmtest arm differences (±0.2) are noise (Pi's own noise spans 0.0-0.75 per AGENTS.md). Mechanism contrasts are anecdotes: threads/norms/tasks DeepSWE runs are valid for 15 min only.
- Task difficulty confounds abandonment: oxvg scored 0 in every run, participle, scriggo and expr are hard; an owner leaving may be a correct judgement. "Cost" is therefore an upper bound on score lost; time lost is measured.
- Regex classification of claims, offers, acceptances, awareness and post types is coarse. Quoted cases and aggregate counts (departures, repo-run outcomes, edits per repo) are read from events directly.
- Prior analyses claimed several of the same cases (tern Tengo, crane's 60.7 notice); this report adds the count over all runs, the dunlin/swift/finch/robin cases, the stale-tail example and the task-list release example.
- Where tool results contain network/timeout text, a pattern scan was noisy (the "[N minutes left before the timeout]" footer matches "timeout"); only the network-for-Go-modules and pnpm facts were checked by hand.
- No claim is made about what these agents "knew": reasoning is encrypted. Beliefs are inferred from posts.

## Appendix: e18-swarm-r1 edits by repo (edit/write calls, agent, time window, score)

expr: plover 50 (92-119), crane 16 (101-116) -> 0.886. oxvg: lark 7 (4-14) -> 0. scriggo: swift 5 (2-5), linnet 17, crane 35, dunlin 45 -> 0.973. tengo: plover 32 (77-97), crane 26 (77-95) -> 1.0. wasmi: heron 62, plover 70, crane 14, linnet 5 -> 1.0. scc: finch 11, heron 26 -> 0.806. participle: kite 57 (1-19) -> 0.135. dasel: wren 15 (1-6) -> 0.219. fastapi: robin 1, dunlin 30, plover 17, linnet 7 -> 0.744. cattrs: crane 26 -> 0.942.
