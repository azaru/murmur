# Theories for a better swarm, v2: a design catalogue (2026-10-06)

Model output (main session). This supersedes [v1](2026-10-06-theories-for-the-swarm.md) and merges the following:
- v1's 13 theories (A1–C4) and four integrated designs (D1–D4);
- the user's proposal of several small teams that can read but not modify each other's work and are encouraged to beat the rest (D5);
- four design studies (subagent model output, cards cited by their codes):

| Code | Report | Family |
|---|---|---|
| K1–K8 | [competition and parallel paths](2026-10-06-designs-competition-parallel-paths.md) | contests, tournaments, set-based engineering, red/blue teams |
| P1–P8 | [population structure](2026-10-06-designs-population-structure.md) | semi-isolated subgroups, migration, cultural accumulation |
| S1–S9 | [selection without an oracle](2026-10-06-designs-selection-without-oracle.md) | correlated failures, cross-testing, quorum, peer prediction |
| O1–O8 | [organisational architectures](2026-10-06-designs-org-architectures.md) | multiteam systems, Conway, relays, reserves |

It also draws on the deep reviews (`2026-10-06-deep-*.md`) and round 20's result. Nothing here is measured.

**Verified by hand by the main session, in the primary text:**

| # | Claim | Source |
|---|---|---|
| 1 | 48 coding-agent versions of one program: 429 coincident failures against 115.36 expected under independence (z = 29.20). A majority of three still lowers the mean failure count from 387.44 | Ron, Baudry & Monperrus, arXiv 2606.20158, p. 7 and abstract |
| 2 | When two LLMs are both wrong, they agree about 60% of the time on Helm, where chance is 1/3. More accurate models have more correlated errors | Kim et al., arXiv 2506.07962, p. 1 and Fig. 1 |
| 3 | No fully connected human group found both top-level innovations, against 58.3% of partially connected groups. Contact began after 36 isolated trials: one migrant visited another subgroup for three trials and returned | Derex & Boyd 2016, PNAS (PMC4801235) |
| 4 | Iterative work scored higher on average than parallel work (7.9 vs 7.4) with lower variance (0.68). Prior work can lead "future workers down the wrong path" | Little, Chilton, Goldman & Miller, HCOMP 2010 |

Also used from earlier verification: Bernstein, Shore & Lazer 2018 (intermittent visibility; numbers reported by two subagents, not checked here), Gersick 1988 (midpoint), and Bonatti & Hörner (observable effort can increase delay).

---

## 1. Five principles that cut across all the families

These come out of the four studies independently, and they reshape every design below.

**P-I. Identical agents in separate groups are not independent minds.**
- Coding agents fail together 3.7 times more often than independence predicts (✓1).
- LLMs pick the same wrong answer 60% of the time (✓2).
- With pairwise error correlation ρ, K groups are worth about K / (1 + (K−1)ρ) independent voters. That is roughly 2–3 whatever K is (S-report's arithmetic).
- **Separate groups alone buy little diversity.** Diversity has to be injected through:
  - different information (what each group reads first, when it sees others);
  - different approaches made explicit (S3: readings of ambiguous points and the algorithm for the hard step, posted before coding);
  - or different model families (C2).
- Different random seeds are the weakest decorrelator.

**P-II. Selection is the gate.**
- Every multi-group design produces K outputs and must deliver one without an oracle.
- Counting how many foreign tests a solution passes rewards the most common solution. When errors are correlated, the most common solution is also the most common mistake (S-report).
- The repaired rule (S1) weights each test by how well it **discriminates** between solutions, and drops tests that all or no candidates pass. It also excludes a group's own tests and adds clustering by behaviour.
- If an offline replay shows that rule is no better than a random pick, no parallel-paths design can beat one agent. The budget should then go to capacity instead (Part B designs).

**P-III. Contact late and intermittently, never continuously.**
- Partially connected groups innovate more than fully connected ones (✓3), and intermittent visibility beats constant visibility (Bernstein 2018).
- Earlier work anchors later workers (✓4; round 17's audit).
- So groups should work blind first and make contact at 40–50% of the clock, or at a group's first `done`, through a few discrete events (P2, O1, O6, K1).

**P-IV. Competition works through obligations, not standings.**
- murmur's agents have no stakes, so contest theory's incentive channel is absent. Prompt text such as "beat the others" does not move them (round 20).
- Showing relative standing is harmful even in humans: disclosure of strong rivals drives top performers away (Gross 2017, subagent-reported).
- What survives is a **pending obligation**: a concrete, runnable complaint against your work. A test from another group passes on its author's build and fails on yours (K3, S4). That is the oracle-free reason to keep working that every round since 11 has lacked.

**P-V. Capacity is still the dominant factor.**
- A team of four can be empty by minute 5.
- Every design needs a capacity keeper: `done` becomes "stand by" (A1), the standby pool is shared across groups (O7), and standby agents are woken by state events. **An incoming obligation from P-IV is exactly such a state event**, which ties P-IV and P-V together.

---

## 2. The design space

Every design in the four studies and in v1 is a choice on six dimensions. The grid shows where each card sits, which cards are the same idea twice, and which cells are empty.

| Dimension | Values | Cards |
|---|---|---|
| **Groups** | one swarm | ST (control), A1–A4, B1–B5, C3, C4, K4, S3 |
| | parallel groups (islands) | D5, K1, P1, P8, O1, O2, O6, O8 |
| | sequential groups (relay, shifts) | O4; v1 relays (C1TR, round 17) |
| | groups that appear on demand | K5 (fork on disagreement) |
| **Group size and count** | fixed (3×4, 4×3) | D5, K1, O2 |
| | grows with need | A4, K5 |
| **What groups see of each other** | nothing | K1's blind phase, P1, O1's first phase |
| | liveness only | K7 |
| | structure, tests and notes (not code) | P-report's D5 revision |
| | code by snapshot | D5, K1, O3 (pull-only visits), O6 (ring) |
| | specific failing tests as open items | K3, S4 |
| **When** | continuous | (rejected: P-III) |
| | fixed points (25/50/75%) | D5 |
| | late fixed points (40–50%, 75%) | O1, P3, S-report's D5 revision |
| | event-triggered (first `done`) | P2 |
| **Interaction** | read-only | D5, O3, O6 |
| | attack (tests and issues against others) | K3, K4, S4 |
| | migrate agents | P3 (ambassadors), P7 (rotation) |
| | recombine and converge | O1, P6 (transplant modules into the winner) |
| | narrow (losers join survivors) | K6 |
| **Selection** | discriminative cross-test | S1 (repaired D5), K2, P5, S6 |
| | agree-then-ship | S9 |
| | quorum with stop signals (bee-style) | S4, O5 |
| | per unit on batches | S5, P8 |
| | none (one swarm, one folder) | ST, D1–D3 |
| **Capacity keeper** | `done` → standby, woken by events | A1, O7 |
| | `done` → critic seat | K4 |
| | midpoint event | A3 |

**Duplicates:**
- P2, O1 and the S-report's revision of D5 all say "first contact at 40–50% or on the first `done`".
- K2, P5 and S1 are the same discriminative cross-test.
- O7 is A1 extended across groups.
- K3 and S4 are the same idea, a runnable complaint as the unit of competition.

**Empty or thin cells:**
- Groups split by *approach* rather than by unit. Only K5 does it (forking when an agent disagrees), and S3 (the interpretation ledger) would supply the trigger.
- Sequential groups on batches. O4 is the only card and carries a drop condition from round 17's weak relays.

---

## 3. The user's design (D5), after four studies

All four studies keep its core: small teams, own folders, read-only access to rivals, and a mechanical end rule. They change five things:

| Element of D5 | Change | Why |
|---|---|---|
| Snapshots at 25/50/75% | First contact at 40–50% or at a team's first `done`; two contacts, not three | P-III; ✓3 (contact after a long isolated phase), ✓4 (anchoring) |
| Rivals' code visible | Show structure, tests and approach notes first; code at 75% or on demand | Code invites copying the leader (herding, P-I) |
| "Encouraged to do better" | Drop the text. Rivals' failing tests become open items at the point of use (K3) | P-IV |
| Rivals' tests run against your code, shown as a count | Show the specific failing test as an issue, never a count or ranking | Gross: standings drive agents away; a count is also a quality signal close to an oracle |
| Cross-test tournament (count of foreign tests passed) | Discriminative weights, own tests excluded, behaviour clustering, agree-then-ship first (S1 + S9) | P-II; ✓1, ✓2 |
| *(missing)* Capacity | `done` → standby across teams; woken by incoming issues (A1 + O7 + K3) | P-V |
| *(missing)* After selection | A converge phase: everyone moves into the winning folder and transplants better rival modules (O1, P6) | ✓4: parallel then iterate on the best; a pure tournament discards the losers' work |
| Scope | Single-deliverable tasks only. On batches of independent repositories, three teams triple the work per repository | Batches are capacity-bound (O-, K- and P-reports agree) |

---

## 4. Four integrated designs

### I1. Islands with a hack window (single-deliverable, quality-bound tasks)

Built from D5, P1, K3, S1, S9, O1/P6, A1 and O7.
1. **Founders (0–15%).** Three teams of four. Each team's first agent works alone for a few minutes; teammates enter staggered, as now. No contact between teams.
2. **Blind work (until 40–50%).** Each team works in its own folder with its own board. A team that drops to zero active agents is refilled from the shared standby pool.
3. **Hack window (from 40–50%, or from a team's first `done`).** Each team can read the others' structure, tests and approach notes, and their code from 75%. Any agent may file an *issue* against another team: a test that passes on its own team's build and fails on the target's. murmur runs it and delivers it to the target team as an open item, the next time one of its agents touches the affected file. It also wakes a standby agent of that team if no one is active.
4. **Selection (at 85–90%).** If the teams' solutions agree on every agent-written test, ship any of them. Otherwise apply S1: weight each test by how well it discriminates, exclude a team's own tests, and pick the solution with the most weighted passes.
5. **Converge (last 10%).** Every agent may write in the winning folder and transplant modules from the others. Rival folders stay read-only.

**Mechanism:**
- Independence early gives real alternatives (P-I, P-III).
- Issues give an oracle-free reason to keep working (P-IV).
- Standby keeps capacity (P-V).
- Selection cannot reward the most common mistake (P-II).

**Prediction against ST and C1T on planning and shop2:**
- Fewer runs where all agents stop on the same weak criterion.
- A later median `done`.
- A higher mean, *if* the offline selector gate passes.

### I2. One swarm, critics on exit (batches of independent repositories)

Built from ST, B2, K4, A1, S4 and S5.
- One swarm of twelve, as ST.
- Ownership of a repository is derived from writes and lapses (B2).
- An agent that calls `done` becomes a **read-only critic** that may only write tests and issues against repositories it did not edit (K4).
- An issue is a reproducing failing command. It is delivered to that repository's current writer, or wakes a standby agent if there is none (A1).
- Selection is per repository (S5) and only matters if two lineages exist.

**Mechanism.** The agents that leave at 1–2 minutes (round 20) stop being lost capacity. They become the source of obligations for those who stay.

**Prediction against ST:**
- More agent-minutes after the first `done`.
- More late edits on repositories with open issues.
- Fewer repositories frozen at their first-pass score.

**Cheapest kill test.** The critic seat is one tool restriction plus one delivery rule.

### I3. Fork on disagreement (any task; parallel paths only where there is uncertainty)

Built from K5, S3, S1 and P-I.
- One swarm by default.
- Before coding the hard step, agents post their reading of ambiguous points and their algorithm (S3). This is enforced as a tool precondition, because prompt text does not move behaviour.
- When an agent's reading differs from the current lineage, it may fork a new read-only-to-others folder (at most three live forks). Others may join it.
- Selection is S1 among forks.

**Mechanism.** The number of parallel paths follows real disagreement, not a preset 3×4. Diversity is injected where the correlated failures concentrate: Ron et al. trace them to one plausible wrong algorithm for the hard step (✓1).

**Prediction:**
- On tasks with a unique hard step, forks appear and S1 picks the less common reading when its tests discriminate.
- On easy tasks, no forks appear and cost equals ST.

### I4. Mixed minds (any of I1–I3 with different model families per group)

Built from C2, P-I and Kim et al. (✓2). This is the only strong decorrelator the studies found.
- Each island, or each fork, runs a different model family.
- Same rules otherwise.

**Rule tension.** `AGENTS.md` fixes the model. This needs the user's decision.

---

## 5. What to do first: two cheap gates before any live round

1. **Selector gate (offline, no new runs).** On existing runs that left two or more candidate solutions with agent-written tests (for example round 9's parallel attempts, the S2 runs of two agents with parallel attempts and a board, and branch runs from round 15), replay S1 against a random pick and against the raw count.
   - If S1 picks the higher-graded candidate in fewer than about 60% of pairs, drop the parallel-path designs (I1, I3) and put the budget into I2.
   - The hidden grade is used here only to *measure* the selector afterwards, never shown to agents. This is allowed by the rule that the grader only measures.
2. **Divergence gate (cheap live).** Run three isolated teams of four on one single-deliverable task for the first 40% only. Measure whether their approaches differ (algorithm for the hard step, structure).
   - If they converge on the same approach (P-I), I1 needs I3's interpretation ledger or I4's model mix to be worth anything.

Gates passed → I1 on single-deliverable tasks and I2 on batches, each against ST and C1T at equal tokens.

---

## 6. Decisions for the user

1. **Showing a rival's failing test as an issue (I1, I2).** Is a runnable bug report from another agent allowed under "no oracle"? The case for: it is agent-written and exists in real work (bug reports, CI on a teammate's tests), and it reveals nothing the grader measures. The case against: it is a correctness signal.
2. **Mixed model families (I4).** This changes the fixed model.
3. **The correlation device (v1 B1).** This is still open, and less needed if I3 handles symmetry through disagreement.
4. **Order:** the two gates first, or straight to I2? I2 needs no selector and attacks capacity, the factor that dominates.

## 7. Designs all four studies reject

- Continuous visibility of rivals' work.
- Raw majority or raw test counts over same-model groups.
- Same-model LLM judges.
- Peer-prediction or "surprisingly popular" among identical agents (no diversity of priors to exploit).
- Showing standings or test scores mid-run.
- Competition text.
- Isolation with no contact at all.
- Very small teams (one or two agents) that die at the first `done`.
- Frequent migration.
- Appointed liaisons, integrators or team leads.
- Seeds or personas as the only source of diversity.
