# Theories for a better swarm: designs derived from group science and game theory (2026-10-06)

> **Superseded by [v2](2026-10-06-theories-for-the-swarm-v2.md)**, a design catalogue that merges these theories with the user's multi-team proposal and four design studies. Kept for the record.

Model output (main session). This note is generative, not a review. Each section proposes a theory of how murmur's swarm *should* work, derived from a body of group science or game theory. Each one gives a concrete design in murmur's terms, the mechanism by which it should raise the result, a falsifiable prediction, and the cheapest test. The literature behind them is in the six `2026-10-06-deep-*.md` reports and earlier reviews. None of this is measured; every claim about murmur below is a hypothesis.

Constraints kept from `AGENTS.md`:
- No oracle.
- No grading hints.
- No orchestrator, planner or assigned roles.
- Would exist in real work.

Where a theory pushes against a rule, the section says so instead of quietly dropping it.

## 0. The design problem in one paragraph

A swarm's output is roughly **capacity × allocation × quality of what is kept**:
- **Capacity:** agent-minutes actually spent on the goal.
- **Allocation:** whether that capacity lands where work is missing.
- **Quality of what is kept:** whether the final state is the best the team produced.

murmur loses on all three:
- **Capacity:** agents call `done` in the first minutes, and their seats are lost.
- **Allocation:** claim races, orphaned repositories, and work going to repositories that are already good.
- **Quality:** shared blind spots, and identical agents agreeing with each other.

The theories below are grouped by which factor they attack. Capacity comes first, because every record since round 11 says it dominates.

---

## Part A — Capacity: keep the team's agent-minutes on the goal

### A1. Exit as an option, not a decision: the on-call reserve
**Theory:**
- *Real options under irreversibility* (Dixit & Pindyck): an irreversible exit under uncertainty should be delayed, because staying keeps the option to act on new information.
- *Ant colonies' idle reserve* and *response-threshold models* (Bonabeau): a colony keeps idle workers who respond when a stimulus appears.

Both say the problem is not that members stop, but that **stopping destroys the option**.

**Design.** `done` stops meaning "leave for good" and becomes "stand by". A standing-by agent costs nothing. murmur wakes it only on a **state event**, never on chatter. Examples of a state event:
- a folder loses its last live writer;
- a teammate's departure leaves work it listed as unfinished;
- the run passes its midpoint (see A3).

On waking, the agent gets the event and the current state of the folder concerned, and decides again. This generalises the existing `revive`, which wakes on *any post*; round 17 found revived turns ate 53–87% of the tokens. Waking on state events should be far cheaper. It is not a hierarchy: no one tells the agent what to do, and the world simply changed.

**Why it should work.** Agents keep calling `done` at 1–2 minutes whatever the text says (rounds 18–20). If the decision cannot be moved, make it reversible. Capacity then stops being set by the earliest quitters.

**Prediction.**
- Agent-minutes per run rise toward the clock.
- Orphaned repositories are picked up by woken agents within minutes.
- The score rises most on batches where ST's two repetitions diverged (round 18's 0.455 against 0.671 came from a few agents who kept going).

**Test.** ST (twelve agents entering one at a time) against ST + on-call reserve, same cap. Measure agent-minutes after first `done`, pick-up latency and score.

**Real-world analogue:** on-call rotations.

### A2. Make staying the focal equilibrium: public signals for a coordination game
**Theory.** *Global games* (Carlsson & van Damme; Morris & Shin) and the *assurance game*. When the value of my staying depends on whether others stay (integration, review, picking up what others leave), staying is a coordination problem. Such problems are decided by **public** signals, which carry more weight than private ones, more than their accuracy warrants. A team then coordinates on whatever the public signal makes salient.

**Design.** Give the team one short public fact that makes "the team is still producing" common knowledge, refreshed only when it changes, for example "last landed change: 1 min ago; 7 of 12 working". It is information delivered sparingly (round 20 showed that a long line on every result costs real work).

**Why.** Today the only public signals are posts and departures, which make leaving salient. A production signal makes staying salient. GT-2's refinement explains the sign: a fact about effort ("others are still producing") does not trigger a cascade, while a claim about the state of the work ("all validated") does.

**Prediction.** Fewer `done` calls in the first ten minutes than ST, with the same posting volume.

**Risk.** If the signal shows decline ("2 of 12 working"), it can set off a cascade. So show production (landed changes), not attrition.

### A3. Punctuated equilibrium: engineer a midpoint transition
**Theory.** *Gersick (1988)*: project teams with a deadline work in one frame until the calendar midpoint, then reorganise once and accelerate toward the end. The midpoint acts as an alarm clock. The one team that stopped there did so because its leader declared the task done (verified, p. 27).

**Design.** At 50% of the clock, murmur delivers one **midpoint event** to every agent, including those standing by (A1). It contains the goal-level state: folders with no live writer, folders untouched since minute X, and each agent's own last write. It carries no instruction. Agents re-choose freely.

**Why.** It creates the one reallocation moment that human teams generate by themselves and LLM agents do not. It also re-recruits capacity lost to early exits.

**Prediction.**
- A burst of new claims on neglected folders in the 5 minutes after the event.
- Fewer repositories left at their first-pass score.

**Real-world analogue:** sprint midpoint reviews and release checkpoints.

### A4. Entry by need: the swarm grows only while there is unowned work
**Theory.** *Steiner's task typology* and the *Ringelmann effect*. Adding members helps additive tasks until the work runs out, then turns into coordination loss. *Response thresholds*: workers are recruited by the stimulus, not by a schedule.

**Design.** Staggered entry already exists (one agent every 60 s). Change the trigger: the next agent enters only while a stimulus exists, such as an untouched folder, a folder whose last writer left, or a deferred item (B4). When there is no stimulus, remaining seats wait. The waiting seats are a reserve, as in A1.

**Why.** It turns a fixed N into the number the work needs. It cuts the echo and pile-ups seen on single-deliverable tasks (failure 6) without a planner deciding N.

**Prediction.**
- On single-deliverable tasks (planning, shop2): fewer agents enter, there are fewer tokens per point, and the score is equal.
- On batches: the same coverage with fewer claim races.

---

## Part B — Allocation: put capacity where work is missing, without an allocator

### B1. A correlation device: break the symmetry of identical agents
**Theory.** *Correlated equilibrium* (Aumann 1974). In anti-coordination games (who goes where), players who see a common random signal and follow a known rule reach outcomes better than any Nash equilibrium without communication. The traffic light is the standard example. Identical agents have no natural tie-breaker. Bilodeau & Slivinski's volunteer model has no generic solution with identical players, so a public device supplies one.

**Design.** At start murmur publishes a public, random but fixed "preference order" for each agent over the work units, computed from a seed and the agent's name. It is a **recommendation that anyone can ignore**. Agents are told what it is: a tie-breaker, not an assignment.

**Why.** Claim races (four agents on oxvg within 0.2 minutes in round 20) and duplicated first moves come from symmetric agents reasoning identically. One open-weight model made the same first pick in 7,677 of 7,680 trials (He 2026, via HG-2). A correlation device spreads first moves at zero communication cost.

**Prediction.**
- First-claim collisions drop sharply.
- Coverage of all units by minute 5 reaches 100%.
- Quality inside units is unchanged.

**Rule tension, for the user to decide.** A recommendation of where to start sits close to assignment. The case for allowing it: it carries no authority, it is random rather than planned, it is ignorable, and it is the textbook example of coordination *without* a coordinator. If that is too close, B2 gets most of the gain with no recommendation at all.

### B2. Claims as costly signals: ownership exists only as work
**Theory.** *Signalling* (Spence). A claim is credible only if it is costly to fake. *Cheap talk* is credible under aligned interests, but it goes stale. Open source's anti-"cookie-licking" rule says: claim only when you start working.

**Design.** The tool ignores prose claims. Ownership of a unit is derived from writes: the agent with the most recent write there, while it is live. A first write into an unowned unit makes its author the visible owner at once. Ownership lapses when the owner leaves or stops writing for T minutes.

**Why.**
- Failure 3 (stale or retracted claims): a prose claim can no longer block a unit.
- Failure 4 (owner-gating): ownership lapses by itself, so nobody waits for permission.
- Claim races: the first write wins, visibly.
- Agents can keep talking, but talk no longer allocates.

**Prediction.** The diagnosis's "unit believed owned, nobody working" episodes disappear. Waits for an owner's permission drop.

### B3. Matching without a matchmaker: deferred acceptance as a protocol
**Theory.**
- *Two-sided matching* (Gale & Shapley; Roth): stable matchings exist and are reached by deferred acceptance.
- *Random paths to stability* (Roth & Vande Vate): decentralised proposing converges to a stable matching without a centre.

**Design.** In the first minutes, each agent proposes to a unit by writing there (B2). A unit already owned "rejects" the later proposer by showing it the owner. The rejected agent proposes to its next choice. The tool only reports facts (who is there, since when). The agents' own ranking of units, which is their judgement of where they can add most, plays the role of preferences.

**Why.** It turns the chaotic first minutes into a convergent process with a known end state: no agent wants a unit it could take, and no unit lacks a writer. Unlike B1, the preferences are the agents' own.

**Prediction.** Coverage converges within about N proposals. With B1 as a tie-breaker, convergence is faster.

**Note.** B2 plus visible rejection already *is* this protocol. The theory says it converges, and that is why to build B2 first.

### B4. Open superposition: work in layers, defer what is too big
**Theory.** *Howison & Crowston*: in open-source projects, about 80% of tasks are done by one person in short layers, and work too big for one layer is deferred until it becomes easy. There is no breakdown or planning (verified, pp. 17–19).

**Design.**
- A unit of work is "one layer one agent can finish".
- Add a `defer(unit, why)` tool. It marks work as too big for the caller, visible to all, with no owner. Deferred work is a stimulus for entry (A4) and for waking (A1).
- Later agents see what was deferred and why, plus the layers already laid.

**Why.** Agents now call `done` with "my part is done but X remains" (35 of 58 in the diagnosis). That sentence is lost in a reason nobody reads. Deferral turns it into a public, takeable object, which is what open source does with too-big work.

**Prediction.** Fewer "partial-scope" exits that leave work unowned. The time from deferral to the next write on that unit is in minutes, not never.

### B5. Information design: show coarse facts, not everything
**Theory.**
- *Bayesian persuasion and information design* (Kamenica & Gentzkow; Bergemann & Morris): a designer who controls what receivers see can improve outcomes by revealing **less**, in coarse categories that move behaviour the right way.
- Herding results show that detailed peer behaviour causes copying.

**Design.** Everything murmur shows (A2, A3, B2, B4) uses coarse, action-relevant categories. Examples: "unowned", "owned, active", "owned, idle 10+ min", "deferred". It never shows counts of agreement, other agents' conclusions, or per-folder crowd sizes.

**Why.**
- Round 20's full status line cost real work and moved no posts.
- GT-3 found extra visible information hurt a strong model.
- Coarse categories are short (cheap at a fixed cap) and point to an action.

**Prediction.** The same coordination gains as the full line, at a fraction of the tokens.

---

## Part C — Quality: keep the best version, avoid shared blind spots

### C1. Diversity beats agreement: independent attempts, then one exchange
**Theory.**
- *Nominal groups and brainwriting*: independent generation beats interacting groups.
- *Delphi*.
- *Lorenz et al. (2011)*: social influence narrows the range of estimates without improving accuracy.
- *Aumann*: agreement among agents with identical priors carries little information.
- *Schulz-Hardt (2006)*: dissent that exists before discussion improves group decisions, even when every member is wrong.

**Design (for single-deliverable tasks).**
- Two to four agents work **in private** (branches), with no board.
- At a fixed point, each posts a short description of its approach and the facts it executed (commands and exit codes of its *own* tests).
- One revision round follows. The final version is chosen by the agents from executed evidence, never from votes.

**Why.** Failure 7 (twelve agents validating the same weak criterion) is a correlated-error problem. Independence is what decorrelates errors. This applies the human-groups review's earlier "commit-then-reveal" lever, now with its theoretical justification.

**Prediction.** A wider spread of approaches before the exchange, fewer runs where everyone stops on the same criterion, and a higher mean on shop2-like tasks where scores are bimodal.

### C2. Cognitive diversity by construction: mixed models
**Theory.**
- *Hong & Page's diversity results*, contested but directional: diverse problem solvers can beat homogeneous high-ability ones when their errors differ.
- *Ensemble learning*: gains require decorrelated errors.
- GT-3: conformity to a declared consensus is strongly model-specific. GPT-5.4 fell from 1.00 to 0.23 on SWE-bench when told two peers agreed with a decoy; Claude Sonnet 4.6 did not move (verified). Same-family swarms degrade more than mixed ones.

**Design.** A swarm of two or more model families, such as the current OpenAI model plus another vendor's model. No roles, and the same prompt.

**Why.** Identical agents share every blind spot, and no communication design can create independent judgement out of identical priors. Mixing families is the only lever on this list that changes the priors themselves.

**Prediction.** Fewer synchronised finishes on the same weak criterion, and a higher mean on quality-bound tasks.

**Rule tension.** `AGENTS.md` fixes the model (`gpt-6-luna`). This needs the user's decision. It exists in real work, where teams mix tools.

### C3. Transactive memory, built by the tool
**Theory.**
- *Transactive memory systems* (Wegner; Lewis): teams perform better when members know *who knows what*. The global TMS–performance correlation is about .47 in the meta-analysis (subagent-reported).
- In humans, TMS needs familiarity and time. An LLM team can get the directory from logs.

**Design.** murmur keeps an automatic directory from tool calls: who read, wrote or ran what, per unit. An `ask(unit)` tool returns who knows that unit best and whether they are live, at the point of use, only when called.

**Why.** It answers "who should I ask?" and "who can review this?" without broadcasting, and without anyone being assigned as the expert.

**Prediction.** Fewer requests to departed or uninvolved agents, and less rediscovery of environment facts (failure 8).

### C4. Accountability by visible record (identifiability)
**Theory.** *Social loafing* disappears when individual contributions are identifiable and evaluable (Williams, Harkins & Latané; Karau & Williams' meta-analysis). In LLMs the analogue is not effort but *conformity*: an agent whose own record is visible is less likely to echo others.

**Design.** Each agent's posts carry a one-line, tool-generated record: what it wrote and ran since its last post. An agent that only echoes shows "no writes, no commands since …".

**Why.** It makes echo (failure 6) visible as echo, without a moderator.

**Prior:** low to medium. The human mechanism is effort cost, which agents lack; the conformity route is a hypothesis.

---

## Part D — Four integrated designs

The theories combine into whole organisational designs. Each is a candidate arm, built from default-off levers.

| Design | Theories combined | Main target | Best for |
|---|---|---|---|
| **D1. The on-call commons** | A1 reserve + A3 midpoint + B2 ownership from writes + B5 coarse facts | Capacity and orphans | Batches of independent tasks (DeepSWE) |
| **D2. The self-sorting market** | B1 correlation device + B3 matching via B2 + B4 deferral | Allocation in the first minutes | Batches; many-file projects (ospec) |
| **D3. Elastic swarm** | A4 entry by need + A1 reserve + B4 deferral | Right-sizing N | Mixed panels where some tasks need 1 agent and some need 12 |
| **D4. Independent minds** | C1 private attempts + C2 mixed models + execution-evidence selection | Quality and blind spots | Single-deliverable, quality-bound tasks (planning, shop2) |

**My recommendation of where to start:** **D1**, and within it **A1 (the on-call reserve)**.

- It attacks the factor every round says dominates: capacity lost to early, unchangeable `done` decisions.
- It reuses a mechanism murmur already has (`revive`), keyed to state events instead of posts.
- It needs no rule exception.
- A round 20-style batch can test it directly against ST.

D4 is the strongest theory for quality, but it needs the user's decision on mixed models.

## Summary table

| # | Theory | Field | Design in murmur | Factor | Rule tension |
|---|---|---|---|---|---|
| A1 | Real options; idle reserve | GT / biology | `done` = stand by; wake on state events | Capacity | None |
| A2 | Global games; assurance | GT | One public production signal | Capacity | None |
| A3 | Punctuated equilibrium | Groups | Midpoint event with goal-level state | Capacity, allocation | None |
| A4 | Steiner, Ringelmann; response thresholds | Groups | Entry only while unowned work exists | Capacity, cost | None |
| B1 | Correlated equilibrium | GT | Public random tie-breaker of first choices | Allocation | **Close to assignment** |
| B2 | Costly signalling | GT | Ownership derived from writes, with lapse | Allocation | None |
| B3 | Matching, deferred acceptance | GT | First write = proposal, visible rejection | Allocation | None |
| B4 | Open superposition | Groups | Layers + public `defer` | Allocation, capacity | None |
| B5 | Information design | GT | Coarse categories only | Cost | None |
| C1 | Nominal groups, Delphi, dissent | Groups | Private attempts, one exchange, evidence-based choice | Quality | None |
| C2 | Diversity, ensembles | Groups / ML | Mixed model families | Quality | **Model is fixed today** |
| C3 | Transactive memory | Groups | Automatic who-knows-what, asked at point of use | Allocation, quality | None |
| C4 | Identifiability | Groups | Tool-generated record on each post | Quality, cost | None |
