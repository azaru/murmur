# Group science and game theory applied to murmur, deep pass: synthesis v2 (2026-10-06)

Model output (main session). This supersedes [v1](2026-10-06-group-science-game-theory.md), written the same morning from two shallow reviews. v2 rests on six deep reviews that read primary texts, and on round 20's result, recorded in `plan.md` after v1 was written. The deep reviews (subagent model output) are:

| Report | Field | Full-text share (self-reported) |
|---|---|---|
| [GT-1](2026-10-06-deep-gt1-team-theory-common-knowledge.md) | Team theory, common knowledge, cheap talk with aligned interests | ~2/3 of load-bearing claims |
| [GT-2](2026-10-06-deep-gt2-quitting-exploring.md) | Quitting, exploring, volunteering, deadlines | ~70% (15 papers read in full) |
| [GT-3](2026-10-06-deep-gt3-llm-agents-in-games.md) | LLM agents in games and coordination, 2023–2026 | ~78% (111 full-text tags, 31 abstract-only) |
| [HG-1](2026-10-06-deep-hg1-team-cognition.md) | Team cognition and information sharing, meta-analyses | 4 meta-analyses and 6 primary texts in full; Larson (2010) **not read** |
| [HG-2](2026-10-06-deep-hg2-peer-production-networks.md) | Peer production, self-managing teams, communication networks | ~15 of 26 sources |
| [HG-3](2026-10-06-deep-hg3-handoffs-stopping.md) | Handoffs, departures, deadlines and group stopping | 6 in full, 4 in part; NEJM I-PASS **not obtained** |

Arm glosses for round 20 (all twelve agents entering one at a time, with a post-only board, the write guard and the clock):
- **ST** is the control.
- **ST-depart** is ST plus a departure notice that murmur posts when an agent calls `done`.
- **ST-status** is ST-depart plus a team and folder status line on every tool result.
- **ST-tasks** is ST plus a shared task list.

## 1. Evidence ledger

**Verified by hand by the main session, in the primary text:**

| # | Claim | Where checked |
|---|---|---|
| 1 | With processors sharing a common memory, "Cφ ≡ E^kφ ≡ Eφ ≡ Sφ ≡ Dφ" (the knowledge hierarchy collapses). "Fact publication" is the act that makes a fact common knowledge | Halpern & Moses, arXiv cs/0006009, pp. 5–7 |
| 2 | In Bonatti & Hörner's team with unobserved effort, observing effort does not reduce delay. "In the unique symmetric Markovian equilibrium, delay is actually greater", because efforts are strategic substitutes | Cowles DP 1695, p. 3 |
| 3 | The hazard of helping is "61.9% lower in the two-bystander treatment … and 93% lower in the four-bystander" (Cox model) | Campos-Mercade, CEBI WP 27/20, p. 13 |
| 4 | Virtual teams: communication–performance ρ = .10, k = 14, N = 1,013, 95% CI −.02 to .19; face-to-face ρ = .32, k = 48 | Marlow et al. 2018, Table 2. The body text prints the CI as [0.02, 0.19]; the table says −0.02 |
| 5 | GPT-5.4 told that two simulated peers agree on a decoy: SWE-bench 1.00 → 0.23, GAIA → 0.43, Multi-Challenge 0.98 → 0.09. Claude Sonnet 4.6 stays at 1.00. Peers are "declared … rather than instantiated" | arXiv 2605.10698 |
| 6 | Asymmetric-knowledge coordination around 20–30% for most models, Gemini 3.1 Pro near 100%. The epistemic structure is *told* to the agents | arXiv 2607.11363 (EAST) |
| 7 | CooperBench failures: expectation 42%, commitment 32%, communication 26% (50 hand-coded traces). Communication reduces merge conflicts but "avoiding conflicts does not warrant cooperation success" | arXiv 2601.13295 |
| 8 | About 80% of 106 FLOSS tasks had a single programmer, under 10% had co-work, and difficult work was deferred | Howison & Crowston working paper, pp. 17–19 |
| 9 | Handoffs in four high-consequence settings: read-back "not observed during handoff updates" in any of them | Patterson et al. 2004, p. 127 and Table 3 |
| 10 | Lab handover: paper notes alone left 6.2 of 8 bolts wrong, face-to-face 3.5 (video 3.6, audio 4.0, no handover 4.8). Paper alone was significantly worse than every other condition except no handover | Parke, Hobbs & Kanki (NASA NTRS 20110008267) |
| 11 | Gersick's teams reoriented at the calendar midpoint. Team G stopped there because "the leader unexpectedly pronounced the group's task complete", and members said "instead of going up, we stopped" | Gersick 1988, p. 27 |

**Also checked in v1:** arXiv 2506.23276 (reasoning models free-ride in public goods games) and arXiv 1604.06766 (65% of 133 projects have a truck factor ≤ 2).

**Not verified (subagent claims only):**
- Mesmer-Magnus & DeChurch's uniqueness ρ = .50 and DeChurch & Mesmer-Magnus's TMS ρ = .47.
- Kittur's editor-count interaction, Bernstein et al.'s 33/48/44%, Marschak & Radner's "standing rules" (pp. 321–322) and Farrell & Rabin on aligned cheap talk.
- The "Cheap Talk" stag-hunt number, which differs between arXiv versions (48.3% in v1, 96.7% in v3).
- Larson (2010) on group synergy was not read by anyone. Every Laughlin, Steiner and Woolley claim is secondary.

## 2. The frame, sharpened

v1 said murmur is a team game, so its losses are informational. The deep pass supports this and makes it precise in three ways:

1. **No effort cost, so most free-riding theory predicts the opposite of what murmur shows.** All the classic exploration and volunteering models need a private cost of effort (Bolton–Harris, Keller–Rady–Cripps, Bonatti–Hörner, Georgiadis, Diekmann). With zero cost the static volunteer's dilemma has everyone volunteer, and the exploration cut-off is zero (GT-2). murmur's agents quit in the first minutes anyway. So early `done` is a belief, a scope judgement or a trained habit, not shirking. This also explains why payoff and responsibility text does nothing: the agents have no payoff to frame.
2. **murmur nearly has shared memory, so common knowledge is cheap, but only for what is published.** The board and the folder are close to Halpern–Moses's common memory (✓1). Common knowledge fails only for facts nobody puts there, such as "who is alive" and "why they left". Round 20's departure notice is fact publication in their exact sense.
3. **LLM agents are not the theory's players, and they are not humans either** (GT-3). They can state a teammate's state without acting on it (✓6, ✓7). They conform to declared consensus, and how much depends on the model (✓5). Reasoning effort is neutral to harmful for cooperation in six papers. Whatever the theory predicts has to be checked against the logs.

## 3. Theory against round 20

These predictions were written before round 20's result was read: in v1, and in the deep reports, which did not read its runs. Outcomes are from `plan.md`'s round 20 result (k = 2, five tasks, every batch ended at the 32M cap after 12–20 minutes).

| Prediction (source) | Round 20 outcome | Verdict |
|---|---|---|
| Publishing departures as a fact removes posts addressed to departed agents (Halpern–Moses fact publication; v1) | Posts addressed to the departed fell from 14 in ST to 0 in ST-depart and ST-status. The record notes the drop also reflects fewer departures (14, 10, 6 `done` calls). Transcripts show the mechanism directly: tern took Tengo 0.6 min after wren's notice, while in ST linnet waited on kite, who had left | **Held** |
| A standing line beats a one-time notice, because notices reach agents at different times (v1 lever A; GT-1 L1) | ST-depart's one-time notice already reached 0. The status line added nothing on this measure | **Not supported** (floor reached without it) |
| With zero volunteering cost there is no delay, only duplicate volunteers (GT-2, answer d) | Four agents claimed oxvg within 0.2 minutes of wren's notice. Two of them produced the project's first non-zero oxvg score (0.500) | **Held** (duplicates, with a gain) |
| Visible departures may set off a quitting cascade (stag hunt; v1 §3). GT-2 refined it: the sign depends on what a `done` says. "My slice is done, X untouched" is an effort fact and predicts no cascade; "all validated" is a state claim and predicts one | `done` calls before the cap: 14 in ST, 10 in ST-depart, 6 in ST-status, the opposite direction. Confound: ST-status runs were shorter and made fewer calls. Almost every `done` admitted partial scope | **v1's crude version not supported; GT-2's refined version held** |
| Prompt text does not change behaviour (record; GT-3: stated goals do not bind) | Under the new `done` description, 8 of 10 ST-depart and 5 of 6 ST-status dones say the goal is unmet and call `done` anyway. First `done` still at 1.3–2.3 minutes | **Held** |
| Information helps only if someone is free to act on it (team theory; Campos-Mercade ✓3) | "A notice is not enough when nobody is free": robin left Tengo at 7.1 and nobody posted about it or edited it again. Four agents never edited anything | **Held** |
| A written note alone transfers little (NASA ✓10) | The notice moved agents through who was *available*, not through the leaver's reason. No reply quotes the reason | Consistent, weak |
| Communication volume is weakly linked to performance in mediated teams (Marlow ✓4; Kittur via HG-2) | ST-status was **worse** than ST by the rule (−0.076, below on 3 of 5). Its line added ~800 characters to every tool result, leading to fewer and larger calls and 80/78 write/edit calls against 143/109. No post quotes the line | **Held, through a cost mechanism none of the reports named** |

**The lesson round 20 adds: information is not free at a fixed cap.** Every report ranked levers as "information" vs "tool" vs "prompt text", with information first. Round 20 shows that information broadcast on every tool result has a token cost. Under a shared cap it buys fewer edits. Team theory says the same thing in principle: communication should be refreshed in proportion to the value at stake over its cost (Marschak & Radner, p. 260, subagent-reported). In practice none of the deep reports applied it to the status line.

## 4. The filter, revised

v1 filtered levers by mechanism: information, then tool, then prompt text. After round 20 the order becomes:

1. **Information at the point of use.** Delivered only when an agent acts on the thing it concerns. Costs nothing on every other call.
2. **Tool mechanics.** What a call does, such as a claim that releases itself or a write that registers its author.
3. **Information broadcast on every result.** Useful only if it is short. Its token cost scales with calls × agents.
4. **Prompt text.** Weakest, and confirmed again by round 20's `done` description.

This reorders v1's list. Three reports reached the first category independently:
- the **bounce** (HG pass 1 L1, GT-3 lever 1): a post naming a departed agent returns the departure facts to the poster;
- the **arrival brief** (HG-3 M2): the first write into a departed agent's area returns its last writes and exit note;
- **claims annotated with their author's state** (GT-1 L2).

## 5. Failure modes after round 20

| # | Failure mode (diagnosis) | Best-supported model | Round 20 | Still open? | Candidate (category in §4) |
|---|---|---|---|---|---|
| 1 | Silent departure | Fact publication; common memory | Notice: 14 → 0 posts to the departed | Solved on that measure | Keep the notice; the status line is not needed for it |
| 2 | `done` = "my slice is done" | Not free-riding (no cost). A belief or scope judgement; Gersick team G stopped at the midpoint by declaration | Description text ignored | **Open: the main one** | Executed-facts notice (1); structured `done` (4, weak) |
| 3 | Stale prose claims | Coordination game; claims as cheap talk that is sincere but stale (GT-1; theorems on stale claims not found) | Notice voids the leaver's claims | Partly | Claims annotated with author state (1); ownership from writes (2) |
| 4 | Owner-gating | War of attrition in its belief form | ST: "I won't edit oxvg without a clear handoff from Kite" (kite had left at 2.2). Gone in ST-depart | Partly, for live but silent owners | Take-over on lapse (2), only if it persists |
| 5 | Allocation blindness | Congestion game; bandits with an unobserved outcome ("largely unsolved", Hörner–Skrzypacz via GT-2) | All five repositories touched in every arm except ST | Coverage fixed; value-weighting not | **No oracle-free fix** (§7) |
| 6 | Echo | Cascade; production blocking | Not measured | Open | Collapse duplicate reports (2) |
| 7 | Shared blind spot at the finish | Aumann: agreement among identical priors carries little information; conformity is model-specific (✓5) | Not measured | Open | Executed-facts notice (1); never count "N agree" as a signal |
| 8 | Facts rediscovered | Value of shared information | Not measured | Low cost | — |
| new | **Claim races after a notice** | Zero-cost volunteer's dilemma gives duplicates; symmetric players need a tie-breaker | Four-way race on oxvg | **New, and now observed** | A symmetric, time-based standing rule for simultaneous claims (2; GT-1 L3) |

## 6. Candidate levers (not pre-registered)

These are conditional and not a round. Each would be a new default-off lever, facts only, with no assignment and no test signal.

1. **Bounce on posts to departed agents** (point of use). In round 20 it is not needed for failure 1, since the notice reached 0. Its remaining use is the variant for *live but silent* owners, which round 20 did not measure. A post that names an owner with no tool call or write for T minutes gets that fact back.
2. **Arrival brief** (point of use). The first write into a folder whose last writer has left returns that writer's last writes and departure reason. It targets the four-way race and gives a newcomer state, as the FAA/NASA findings advise for the receiver's side. HG-3 reports the FAA error peak in the first 30 minutes after a position relief (not verified here).
3. **Standing rule for simultaneous claims** (tool). When several agents write into a newly orphaned folder within a short window, murmur tells the later ones who wrote first. It is a fact, not an instruction, and needs no negotiation. It is aimed at the observed claim race.
4. **Executed-facts departure notice** (point of use: posted once). It adds what the leaver actually ran: commands since its last edit and their exit codes. It must never include output that predicts the grade. It targets failure 7, and failure 2's "validated" exits.
5. **A shortened status line**: at most a few dozen characters, such as "3 left; no live writer in: tengo". This only makes sense if a re-test at the same cap shows the full line's cost was the problem. ST-status's loss is k = 2 and confounded with run length.
6. **Take-over on lapse**, and a **structured `done`** last.

**Not to build** (all six reports agree, with sources):
- payoff, responsibility or norm text;
- assigned receivers, an incident commander or a devil's-advocate role;
- a "planning to leave" announcement, which reduced specialisation in 32 triads (HG-3);
- read-back gates (not used even in high-reliability settings, ✓9);
- counting agreement as a stop signal;
- cross-run reputation;
- arrival-rank assignment of folders (GT-1: a convention, but an assigned role).

## 7. What neither field solves, and two questions for the user

- **Value-weighted allocation (failure 5) and the strong synergy question.** Groups beat their best member when solutions are demonstrable (Laughlin's truth-wins, via HG-1, secondary). The oracle-free rule removes task-provided demonstrability on purpose. Self-organising LLM teams reach only weak synergy, and the gap to the expert member grows with team size 2 → 8 (Pappu et al. 2026, via HG-1, not verified here). This is a structural limit worth stating in `docs/research.md`: without a quality signal, a swarm's advantage is coverage and speed, not judgement.
- **The main driver is still stopping.** Round 20 confirms that `done` is called at 1–2 minutes by agents who say the goal is unmet, whatever the tool description says. Neither field has a non-hierarchical remedy for a member who leaves *by choice* with no cost of leaving. The human remedies (shifts, contracts, a leader who keeps the group going) are hierarchical or absent.
- **Question for the user (realism rule):** may agents share a log of their *own* tests and exit codes, as a team CI would show? HG-1 ranks this lever second as the closest analogue to "recognising a correct solution". It does not reveal the grader, but it is a correctness signal the team builds for itself.
- **Model covariate:** conformity to declared consensus is strongly model-specific (✓5: GPT-5.4 collapses, Claude Sonnet 4.6 does not). murmur runs an OpenAI model, and nothing here says how gpt-6-luna behaves. That is a covariate to record, not a lever.

## 8. Sources

See each deep report's source list. Primary texts checked by hand are listed in §1.
