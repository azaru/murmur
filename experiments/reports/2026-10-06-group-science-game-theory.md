# Group science and game theory applied to murmur: synthesis (2026-10-06)

> **Superseded by [v2](2026-10-06-group-science-game-theory-v2.md)** (deep pass with primary texts, checked against round 20's result). Kept for the record.

Model output (main session), written from two subagent literature reviews and the earlier records. Sources:
- [Game theory review](2026-10-06-lit-game-theory.md) (subagent, model output; ~4,400 words, over its 3,000 cap).
- [Human groups, part 2: handoffs, ownership, awareness, open source](2026-10-06-lit-human-groups-coordination.md) (subagent, model output).
- Earlier: [human groups and biology](2026-10-04-lit-human-groups-biology.md) (loafing, Ringelmann, brainstorming, hidden profiles, Delphi, team size), [decentralized coordination](2026-10-04-lit-decentralized-coordination.md), and the [communication diagnosis](2026-10-05-swarm-communication-diagnosis.md) whose eight failure modes structure this note.

**Verified by hand (main session, 2026-10-06):**
- ✓ arXiv 2506.23276 (COLM 2025): reasoning LLMs (o1 series) "struggle significantly with cooperation" in public goods games, while some traditional LLMs cooperate consistently.
- ✓ arXiv 2605.10698: in multi-agent reasoning, "simulated social pressure triggers an algorithmic 'Bystander Effect'"; models compute the right answer and then drop it to conform.
- ✓ arXiv 1604.06766 (Avelino et al.): 65% of 133 popular GitHub projects have a truck factor of 2 or less.
- ✓ In `src/swarm.ts`, `teamStatus` already shows every departed teammate as "left at M min" in every tool result, and each folder's last writer. It does not show the leaver's reason, whether a folder's last writer has left, or edit counts. The departure notice is a single post.
- Everything else (I-PASS effect sizes, Debian MIA process, Crawford–Sobel, Chwe, Diekmann, Kruglanski, LLM-in-games papers other than the two above) is as reported by the subagents, with their own [verified]/[secondary] labels. Not checked here.

## 1. The frame: murmur is a team game, so the problem is information, not incentives

Most group-work theory explains losses through private incentives: free riding in public goods games, social loafing when effort is costly and unidentifiable, the volunteer's dilemma when helping costs the helper. murmur's agents share one goal and one score, have no private cost of effort, no career and no memory across runs. In game-theoretic terms this is a **team game** (Marschak and Radner): every player wants the same outcome, and every loss comes from what each player knows and when.

Three consequences:

1. **Payoff and responsibility framing has no theoretical purchase.** The record agrees. Generic norms were not decided (round 11). "Your time is unlimited" changed nothing (side test U). "Keep working until every change is verified" was ignored (round 18). Both reviews independently recommend not building more of this.
2. **LLMs still show the human symptoms, by a different route.** The bystander effect and cooperation failures appear in LLM groups (2605.10698, 2506.23276, both ✓), but through conformity and stopping judgement, not effort cost. The lever has to change what the agent sees at the moment it decides, not what it is told it gains.
3. **The levers that have moved behaviour in murmur all act through information or tool mechanics.** Examples are the visible clock, staggered entry, the write guard and the task list releasing claims on `done`. This note uses that as its filter. Every candidate is labelled *information*, *tool* or *prompt text*, and prompt text ranks last.

## 2. Failure modes, models and levers

The failure modes come from the communication diagnosis. "R20" means round 20, running now (`n12-stagger-depart`: murmur posts a departure notice; `n12-stagger-status`: adds a team and folder status line to every tool result; `n12-stagger-tasks`: a task list that releases claims on `done`).

| # | Failure mode | Game-theoretic model | Human-group analogue | Candidate lever | Acts via | Status |
|---|---|---|---|---|---|---|
| 1 | Silent departure | Common knowledge vs mutual knowledge (Aumann; Rubinstein's email game: more pings never create common knowledge, and silence is uninformative) | Debian "missing in action": liveness derived from behaviour, packages orphaned mechanically | Departure made public by the tool; standing "left" state | information | **R20 covers it** (notice + "left at M" in the status line) |
| 1b | …and late readers keep addressing the leaver | Same, for agents who missed or forgot the notice | Mail bounce at the point of use | **Bounce**: a post naming a departed agent gets the departure facts in the poster's own tool result | tool | New |
| 2 | `done` = "my slice is done" | Optimal stopping without a team-level view; stag hunt (quitting is contagious when others quit) | I-PASS handoff: the leaver states what remains; team-level "definition of done" | Goal-level facts at the decision point (unowned or untouched folders, how many still work); structured `done` | information / prompt | Partly R20 (status line, new `done` description) |
| 3 | Stale or retracted prose claims | Coordination game, equilibrium selection; claims are cheap talk | "Cookie-licking" in open source: claim only when starting work, voided by inactivity | Ownership derived from writes, not words; lease that lapses | tool | Prior report (claim lease); R20 task list releases on `done` |
| 4 | Owner-gating (asking permission from busy or gone owners) | War of attrition; volunteer's dilemma in its belief form ("has anyone moved?") | Apache lazy consensus; Linux MAINTAINERS "Orphan" status | Take-over on lapse: `take(folder)` succeeds if the last writer left or was idle T minutes, and the owner is told | tool | New; most intrusive (touches the write guard) |
| 5 | Allocation blindness (work goes to repos already good) | Congestion game; multi-armed bandit across repos | Kanban board, MAINTAINERS statuses | Per-folder "no live writer" flag; recent-writer counts | information | Partly R20 (last writer only). **Weak**: the true signal (marginal value per repo) needs an oracle |
| 6 | Echo and single-owner bottleneck | Information cascade | Production blocking, Delphi | Commit-then-reveal | tool | Prior report |
| 7 | Shared blind spot at the finish | Cascade; "validated" is cheap talk (Crawford–Sobel), checkable facts are a costly signal (Spence) | Need for closure under time pressure (Kruglanski); groupthink | Departure notice carries murmur-collected facts of what the leaver *executed*; execution-quorum finish | information | Prior report (quorum); executed-facts notice is new |
| 8 | Environment facts rediscovered | Team theory: value of shared information | Transactive memory, team wikis | Shared facts file | tool (weak) | Low priority |

## 3. What the theory says about round 20 itself

Round 20 is well aimed: both reviews independently arrive at "make the departure a public fact, derived from behaviour, and keep it in view". They also raise two risks that round 20's predictions do not state, and that its data can show:

- **The stag-hunt risk (game theory).** A visible list of who has left is a strategic complement for quitting. When an agent sees others leave, its own `done` looks more reasonable. Round 20 predicts that ST-depart and ST-status agents call `done` *later* than ST (twelve agents entering one at a time, the control). The theory allows the opposite: a faster `done` cascade in ST-status. **Read in R20:** the distribution of `done` times, and whether a `done` follows another agent's departure notice more often than chance (for example, within 2 minutes).
- **The closure risk (human groups, hypothesis only).** Time pressure raises the need for cognitive closure. The visible clock, the strongest single-agent lever, may also feed failure 7, where everyone stops together on the same weak criterion. **Read in R20 and earlier traces:** whether clustered finishes are more frequent late in the clock.
- **Herding on activity facts.** A folder line showing recent activity can attract agents as easily as spread them. **Read in R20:** editors per repository in ST-status against ST (the wasmi pile-up in round 18: 4 editors and 151 edits on a repo already at 1.0).

One correction to the game-theory review: its lever A ("make the departure a standing line, not a one-time post") is already in ST-status. The status line shows "left at M min" for every leaver on every tool result. Only the reason excerpt would be new.

## 4. Candidate levers for after round 20 (not pre-registered)

Ordered by how directly they act through information or tool mechanics, and by fit with the failure ranking. All would be new default-off levers, facts only, with no assignment and no test signal. Each depends on what round 20 shows.

1. **Bounce on posts to departed agents** (human review L1). When a `post` names a teammate who has left, the poster's tool result adds "finch left at 1.5 min, saying: …; last write/edit in oxvg". It targets the 221 posts addressed to departed agents in the diagnosis's baseline. *Build if* R20's notice and status line still leave posts addressed to the departed. Cost: ~20 lines in `swarm.ts`. Measure: `comm.py`'s "addressed to the departed" count, plus the time from the bounce to the poster's first edit in that folder.
2. **Orphan flag in the folder line** (merges game-theory B and human-review L2/L5). The status line marks a folder "last writer left, nobody since" or "untouched". It turns the volunteer's dilemma into a sequential game with a visible first mover: the next writer appears at once as the folder's current writer. Human L2 proposed showing this in the `done` result. That comes too late, because by then the agent has already left. Putting it in the status line shows it before every decision. *Build if* R20 shows departures of a last editor that are not picked up. Cost: ~5–10 lines on top of `teamStatus`. Measure: pick-up share and minutes to pick-up (already in `comm.py`).
3. **Executed-facts departure notice** (game-theory E). murmur appends what the leaver actually ran: commands since its last edit, their exit codes, and files changed. The point is to turn "I validated everything" into a checkable claim. It must never include output that predicts the grade. The task's visible check only confirms the format, and the agents' own tests are theirs. Targets failure 7. Cost: 10–20 lines. Measure: clustered finishes (all `done` within 3 minutes), and whether a later agent runs something the leavers did not.
4. **Take-over on lapse** (human review L4; closest to the earlier claim lease). `take(folder)` succeeds immediately when the folder's last writer has left or has been idle T minutes, and the previous holder is told. It replaces "Robin, may I take it?" with a tool answer. It is the most intrusive and T has no empirical basis (Debian's intervals are weeks). *Build only if* owner-gating persists after 1–2.
5. **Structured `done`** (human review L3, I-PASS). Required `unfinished` field copied into the notice. The human review labels it "tool (required parameters)": a required field is a schema change the model cannot skip. This note ranks it last anyway, because it changes what the leaver *writes*, not what anyone *sees* before deciding, and the content of the field is still free text shaped by the prompt. It is still worth noting because the readers, not the leaver, are the ones who act on it.

**Not recommended by either review:** payoff or responsibility text; sanctions, monitors or any manager-led auction (Ostrom's graduated sanctions, contract-net with a coordinator); longer acknowledgement chains; confidence votes at the finish (cheap talk); a tail showing everyone's conclusions when the aim is independent validation (it feeds cascades); cross-run reputation.

## 5. What neither field solves

- **Allocation blindness (failure 5) has no oracle-free fix.** Both reviews agree. A repo's marginal value is what the hidden grader measures. Facts such as edit counts and time since the last edit reveal neglect, not need, and can herd agents. This may be a hard limit of a non-hierarchical swarm without a quality signal. Agents' own tests are the only legitimate source, and they would have to be shared as facts, not as a score.
- **The largest driver is still stopping judgement, not communication.** Every status line in `docs/research.md` since round 11 points to when agents choose to stop. Team theory says better information helps a team only while members keep acting on it. If agents leave in the first 7 minutes (the diagnosis's departures), no coordination lever can recover the capacity they take with them. The stag-hunt reading suggests visibility levers could even make this worse.
- **Transfer is untested.** The LLM game papers used stated payoffs, which murmur does not give. The human numbers (I-PASS −23% errors for the full bundle, the transactive-memory r≈.44) are secondary and come from people with fatigue, status and careers.

## 6. Suggested reading order of round 20's data, given this note

1. Process measures as pre-registered: addressed to the departed, pick-up share, untouched repositories.
2. `done` timing against departure notices (stag-hunt risk).
3. Editors per repository (herding).
4. Clustered finishes late in the clock (closure risk).

The results decide which of levers 1–4 is worth a round.
