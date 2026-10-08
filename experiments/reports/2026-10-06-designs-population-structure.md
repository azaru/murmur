Model-written design study (subagent), 2026-10-06.

# Designs from population structure and cultural evolution

Nothing here is measured. Claims about murmur are hypotheses. Evidence tags: `[full text]` read in a fetched full text (section level only: the fetch tool returns a summarised page, no page numbers), `[abstract]`, `[secondary]` (search summary or another report), `[memory]` (my recall, unchecked). The Fang, Lee & Schilling (2010) full text was **not** obtainable: the publisher returned a paywall page and no open copy turned up. Everything on it is `[abstract]` or `[memory]`. I could not verify its effect sizes or its optimal linking rate, and I do not quote any.

Terms used: ST = twelve agents, one swarm, staggered entry. C1T = one agent with the clock and tokens line. Team = a group of agents with its own folder and board. "Contact" = any event where one team's state becomes visible to another. Theories A1–D4 are from `2026-10-06-theories-for-the-swarm.md`; none is re-proposed.

## 1. Headline

1. **Structure alone will not create diversity in murmur.** One model, one prompt: one open-weight model made the same first pick in 7,677 of 7,680 trials (He 2026, via HG-2 `[secondary]`). Isolated teams will mostly reach the same approach. The population literature gets its gains from isolation only where the landscape is path-dependent *and* early choices differ. So every design below pairs isolation with a mechanical diversity source: a founder effect through staggered entry (P1), a niche registry (P4), or contact timed late (P2, P3).
2. **The best-supported element of D5 is late, partial, short contact.** Derex & Boyd (2016): no fully connected group (0 of 12) found both third-level innovations; 58.3% of partially connected groups did, and every one of those went on to combine them `[full text, Results/Fig. 2]`. Fully connected groups led early and plateaued around trial 35 `[full text, Fig. 3]`. Contact began at the midpoint, in four short visits `[full text, Methods]`. D5's first snapshot at 25% is probably too early (section 3).
3. **The biggest murmur-specific idea: make the visit the exit.** Early `done` is the dominant failure. A `done`-triggered visit (P2) converts the moment an agent would leave into a cross-team contact: its price is paid only by leavers, it is point-of-use (round 20 lesson a), and it gives an oracle-free reason to continue (the rival's state is a new fact). It is also the nearest thing here to the Derex–Boyd migrant, who visited and came back.
4. **One output without an oracle:** cross-team tests, weighted so that tests which every solution passes (or every one fails) count for nothing (P5), then a reunified final phase on the winner's folder (P6). This extends D5's tournament; it does not replace it.
5. **Batches (DeepSWE) need different cards from single deliverables.** Independent repos give teams nothing to differ on unless the teams are replicates; P7 (rotation of agents across repos) and P8 (replicated teams, per-repo selection) are the batch designs.

## 2. Design cards

### P1. Founders, then colonists (founder effect through staggered entry)
- **Theory.** Founder effects and speciation (Mayr) `[memory]`. Path dependence in cultural lineages: early choices set the trajectory for later arrivals (Derex & Boyd: groups "progress along alternative path-dependent trajectories") `[full text, Discussion]`. March (1991): a slow-learning newcomer population preserves diversity `[memory]`.
- **Structure.** 3 teams × 4 (alt. 4 × 3), each with its own folder and board, others unreadable. The existing stagger is used as the seed: each team's first agent works **alone for the first 3–4 minutes**, then the team's other agents enter one per minute, joining a folder that already has a direction. No contact at all before P2/P3 fire.
- **Mechanism.** In ST, agent 2 joins agent 1 and echoes; staggered entry makes all twelve one lineage. Here the three founders are independent draws, and the colonists are socialised into their own founder's path, not the global mean. No tool change except team scoping and an entry rule.
- **Prediction.** Mean pairwise similarity of the teams' first approach statements and file layouts (lexical overlap, measured by the analyst, not shown to agents) is lower than between the first three agents of ST by a clear margin. If it is not lower, isolation is not creating diversity here and P2–P6 lose their basis.
- **Cheapest test.** One shop2 or planning task, k ≥ 2: P1 alone (no contact, final = a fixed team) against ST and C1T. Primary measure is divergence, not score.
- **Task type.** Single deliverable, quality-bound. On batches only as the base of P8.
- **Rule tension.** None. No roles; the stagger already exists.
- **Cost.** About 80–120 lines: team scoping in `swarm.ts`, per-team folder and board, entry schedule in `profile.ts`.

### P2. Done-triggered visit ("leave and look")
- **Theory.** Partially connected populations accumulate more because contact is limited and later `[full text, Derex & Boyd, Abstract and Discussion]`. Real options (A1): exit is irreversible, so look first. Rendell et al. (2010): strategies that copy sparingly, only when their own information is poor, beat heavy copying `[memory]`. Contact rate here is endogenous: it happens when somebody would otherwise leave.
- **Structure.** Teams as in P1. When an agent calls `done`, the call does not end it. It returns one block at the point of use: the file tree and last-changed list of **one** rival team's folder (read-only snapshot of its current state), plus that team's production summary, such as "7 files changed in the last 5 minutes" (coarse, B5). The agent may then re-decide and continue (read, test, write into its own team's folder, post to its own board) or confirm `done`. It sees only one rival per `done`, chosen round-robin, so contact stays partial. Each agent gets at most two such looks.
- **What migrates.** State and approach-level information (tree, headings, test names), not source text; the agent decides whether to open files. Direction: any team to any leaver.
- **Mechanism.** (a) Delays exit with an oracle-free reason: a new fact about a competing lineage. (b) Rate of contact adjusts to how fast teams finish. (c) The agent carries what it saw home inside its context, as the migrant in Derex–Boyd did. Round 20's lessons apply: no broadcast, cost only for leavers, information at the point of use.
- **Prediction.** First-`done` times shift later and a fraction of leavers (target ≥ 30%) write something after the look. If agents confirm `done` immediately after reading, the lever is dead, as the `done` description text was.
- **Cheapest test.** P1 + P2 against P1 alone and ST; same cap. Measure agent-minutes after first `done`, writes after the look, divergence and score.
- **Task type.** Both. In batches the rival folder is the same repo's other team (see P8).
- **Rule tension.** Mild: `done` changes meaning (compare A1). It stays non-hierarchical.
- **Cost.** About 60–100 lines (snapshot of a folder tree plus recent-changes list at `done`, reusing the `revive` and board code).

### P3. Scheduled ambassador exchange, with return
- **Theory.** Derex & Boyd's design exactly: three subgroups, isolated for the first 36 of 72 trials; then one member visits another subgroup for three trials and returns, four contacts per subgroup in total `[full text, Methods]`. Skolicki & De Jong: migration interval dominates the effect, migration size matters little (even small migration has a large effect) `[secondary]`. Island-model result: too frequent migration makes islands converge and lose diversity before they have exchanged anything useful; too rare gives slow convergence `[secondary]`.
- **Structure.** 3 teams × 4. Isolation until 50% of the clock (or until the team's third `done`, whichever is first). Then two exchange windows, one near 55% and one near 75%. In a window the **agent that has been idle longest** in each team (a mechanical rule) becomes an ambassador: it is given read access to the next team's folder in a ring and a short exchange note from that team's board (migration rate = 1 agent per team per window = 25% of a team, at the top of what the island literature tolerates). It returns to its own team at the end of the window with its context.
- **What migrates.** An agent with its context (carries tacit reasons); a note; read access. Not files.
- **Mechanism.** The agent carries approaches and recombines them with its own team's trajectory, as the Derex–Boyd migrant did when two subgroups' different pathways met. Idle agents are used, so capacity that would be lost to `done` is recruited (compare A1).
- **Prediction.** Per-team approach divergence appears by 50% and then shrinks by 75%. Score above ST by a margin that grows with k.
- **Cheapest test.** P3 against P2 (endogenous contact) at equal tokens. If P2 matches P3, keep P2: it is simpler.
- **Task type.** Single deliverable. It is a clock-scheduled contact, so it fits a long task; batches finish in 12–20 minutes and have little time for two windows.
- **Rule tension.** "Longest idle" is a mechanical rule, not an assignment. Moving an agent between teams touches the no-roles line only if the ambassador is told what to do; it is not.
- **Cost.** About 150 lines: cross-team access control, window clock, the idle-rank rule.

### P4. Niche registry: distinctness replaces fitness (MAP-Elites without a score)
- **Theory.** Quality-diversity and niching: MAP-Elites keeps the best individual in each cell of a descriptor space; novelty search and fitness sharing penalise crowding `[memory]`. The oracle problem (`2026-10-04-lit-adjacent-fields.md`): every LLM-evolution system needs a score. This design keeps only the *descriptor* half, which needs no oracle: agents declare an approach descriptor themselves, and cells are only the declared descriptors.
- **Structure.** 3–4 teams. In the first minutes each team posts a one-line approach statement plus two to four self-chosen tags (for shop2: the algorithm family, the representation, the evaluation strategy). A registry tool holds the statements. When a team registers a tag set whose overlap with another team's is high (set overlap above a fixed threshold), the registering call returns the other team's statement. The agent may keep the plan, but must write one sentence on how its plan differs (a costly signal, B2-style). Nothing is blocked.
- **What migrates.** A one-line approach statement and tags, across teams, once at the start. Nothing else before the later contacts.
- **Mechanism.** Counters identical priors directly: it makes crowding visible exactly when a team commits, the only point where moving is cheap. It is point-of-use and costs one short block per team.
- **Prediction.** The same-approach rate (as judged from statements by the analyst) falls from ST's baseline; if agents always write "it differs by implementation details", the lever is cheap talk.
- **Cheapest test.** P1 with registry vs P1 without, on divergence and score.
- **Task type.** Single deliverable; for batches only if teams are replicates (P8).
- **Rule tension.** **Close to assignment** (it nudges teams to different regions), but the tool only reports facts, nobody decides; B1 had the same shape. Flag for the user.
- **Cost.** About 70 lines plus a similarity function.

### P5. Cross-test tournament with discrimination weights
- **Theory.** Competitive coevolution and fitness sharing on the test side (Rosin & Belew): a test that every solution passes carries no information and should weigh nothing `[memory]`. Pairwise validators replace scalar rewards in LLM evolution (arXiv 2607.14408, abstract) `[secondary, via lit-adjacent-fields]`. Agent-built evaluation is allowed by AGENTS.md; nothing in it reveals correctness as the hidden grader measures it.
- **Structure.** At 85–90% of the clock each team's test files are frozen. A harness step (no agent) runs every team's tests against every team's solution. Test weight = 1 / (number of solutions that pass it); a test that no solution passes also weighs 0 (likely wrong or unreachable). Score of a solution = weighted pass sum of tests written by **other** teams (own tests excluded). The best solution wins; its team's folder becomes the delivered output. For optimisation tasks, the shared instance pool plus each team's feasibility checker plays the role of tests (lit-adjacent B).
- **What migrates.** Tests only (and the final output), once.
- **Mechanism.** D5 had the mechanical rule; the weights remove its main failure, a mass of trivial tests that all teams pass. Selection pressure comes from tests that separate solutions.
- **Prediction.** The selected team's hidden-grader score is at least the mean of the teams and above the median of the other teams in more than half of the tasks. The check is after the fact (measure only; never tune to it). If the winner's score is no better than a random team's, the tournament is selecting noise (shared blind spots: same model writes both).
- **Cheapest test.** Run P1 teams, apply P5 as a post-hoc selector, compare with picking at random and with the best team by the grader. Costs nothing extra in tokens.
- **Task type.** Both; best where tests have a runnable form (code, optimisation).
- **Rule tension.** None if the tests are agent-written. If any test is task-supplied it breaks the oracle rule.
- **Cost.** About 150–250 lines: a test-run convention (where each team's tests live and how to run them), the harness step, the weighting. This is the largest item in this report and is shared by P6 and P8.

### P6. Reunification phase and module-wise crossover (island, then panmixia)
- **Theory.** Derex–Boyd: contact allowed *combination* of A and B lineages into fourth-level innovations, which no fully connected group reached `[full text, Results]`. Memetic and crossover recombination `[memory]`. Island-model GAs end with merged populations `[memory]`.
- **Structure.** At about 80% the teams dissolve. All agents (including those that were standing by) get write access to **one** folder, the P5 winner, and read access to the others. The only rule is the base: the winner's folder. Recombination is agents' choice: they may transplant a rival module that passed more cross tests, with a note. Each module (file, section, repo) keeps the version from whichever team's version passes more weighted tests (mechanical tie-break); agents may override with a test run as evidence.
- **What migrates.** Code and text, at module level, once, from all teams into one.
- **Mechanism.** Selection alone discards the losers' good parts; crossover retrieves them. It also provides a late reason to continue for agents that have stopped: a concrete, bounded list of "modules where another team's version beats ours".
- **Prediction.** Delivered score above the selected team's own score at the freeze, on tasks with several separable modules; no gain on tasks with one monolithic artefact.
- **Cheapest test.** P5-winner alone against P5 + P6, same total tokens (carve the final 20% out of the clock).
- **Task type.** Many-file projects and batches with several modules; weak for a single short document.
- **Rule tension.** The base choice is mechanical, but "who merges" is open: agents self-select, with duplicate risk (round 20 lesson c). A `defer`-like marker of "I am merging module X" (B2) would cover it.
- **Cost.** About 80 lines on top of P5 (access flip, per-module comparison report).

### P7. Rotation of agents across repositories (March turnover)
- **Theory.** March (1991): turnover and slow socialisation preserve diversity and raise long-run knowledge `[memory]`. Transactive memory (C3). Mesoudi/Muthukrishna: migrants bring knowledge across populations `[memory]`.
- **Structure.** Batch of 5–10 repos. Each repo is a deme with its own board. At about 40% and 70% of the clock a deterministic cyclic shift moves **every agent that has called `done` or stalled** to the next repo in a ring (agents still working are never moved). The arrival gets an arrival brief for its new repo (last writes, exit notes of those who left; HG-3 M2) at point of use. Agents may decline and call `done`.
- **What migrates.** Agents with their context; the repo's own state is the brief.
- **Mechanism.** Gives an early finisher a reason and a place to continue (fresh eyes on a repo that may have been left at its first-pass state), and delivers cross-repo lessons (environment facts, test conventions; failure 8) through the agent itself. Unlike A1 it moves the agent, not a wake-up for the same one.
- **Prediction.** Fewer repos left at first-pass quality; the second visit to a repo adds edits; coverage up. A negative prediction: if rotated agents mostly repeat "already fine", the batch has no residual defects an agent can find without an oracle.
- **Cheapest test.** ST vs ST + rotation on the DeepSWE batch used in round 20 (k = 2). It reuses the departure notice.
- **Task type.** Batches. Not single deliverables.
- **Rule tension.** **Rotation is a mechanical assignment of where idle agents go.** It is the weakest point of this card with respect to "nothing assigns work"; it is defensible as a seat-allocation rule (no one picks the work, and the agent can refuse). Flag for the user.
- **Cost.** About 100 lines.

### P8. Replicated teams on batches, with per-repo selection
- **Theory.** Order statistics of independent runs: Pi's own noise on one task spans 0.0–0.75 (AGENTS.md), so the best of k independent attempts beats one even with a noisy selector. Replicates are the batch counterpart of islands; isolation keeps them independent (Derex–Boyd) `[full text]`.
- **Structure.** 3 teams × 4, **each team on all repos** (or 4 × 3), independent folders. P5 per repo picks the best of three. Contact P2 optional.
- **Mechanism.** Each repo gets three independent attempts instead of one 12-agent pile-up. Uses selection, not coordination, to cut the variance of the early-`done` failure: a team that stalled loses its repos to the other two.
- **Prediction.** Per-repo best-of-3 selected by P5 exceeds ST's per-repo score in a majority of repos. Cost: each team has a third of the budget per repo, so repos that need a lot of effort get worse. This is the sharp trade-off to measure.
- **Cheapest test.** Offline first: from round-20 style data, nothing needed; live: ST vs P8 on the five-repo batch, k = 2, same cap.
- **Task type.** Batches only.
- **Rule tension.** None (no roles). The one-output rule is met by selection.
- **Cost.** Mostly shared with P5; teams scoping from P1.

## 3. What the theory says about D5

**Keep.**
- Several small teams with their own folders and boards at the same total budget: Derex–Boyd's partial connectivity and Fang et al.'s semi-isolated subgroups `[abstract]` both support it. The structure is the only mechanism on my list that delays convergence of a shared lineage.
- Read-only access to rivals. It removes the one contact channel that spreads errors silently (writes).
- Snapshots rather than continuous visibility. Continuous visibility makes success-biased copying lock a population in: participants adopted a newly discovered beneficial ingredient in about 70% of cases within two trials, which collapsed diversity `[full text, Methods]`.
- A mechanical cross-test for the final choice.

**Change.**
1. **First contact late.** D5's 25% snapshot comes before diversity has been established: in Derex–Boyd, fully connected groups led early and the partially connected groups overtook them only after contact at the midpoint `[full text, Fig. 3 and Methods]`. Suggested schedule: first contact at about 50% (or earlier on a team's first `done`), second at about 75%. Two contacts, not three. This is theory and one experiment, not a measured optimum; the Fang optimum is not recoverable (full text unavailable), only "moderate" `[abstract]`.
2. **Contact should be partial in what it carries.** Show structure, tests and approach notes by default; let code be read on demand. D5's own tests-of-rivals idea is good (tests are the cheapest thing to migrate that cannot be copied as a solution), but they must be agent-written.
3. **Make contact event-triggered, not only clock-triggered.** Clock snapshots can arrive after everyone has called `done` (batches ended at the cap after 12–20 minutes; first `done` at 1–2 minutes). P2 solves this.
4. **Selection weights.** Add discrimination weights to the cross-test (P5); otherwise easy tests dominate.
5. **Team count.** For a single deliverable use 3 × 4 as the primary and 4 × 3 as the secondary. Rationale: Muthukrishna-type results say larger groups retain more complexity `[memory]`; Derex, Perreault & Boyd (2018) find an intermediate fragmentation best, with fully connected groups maintaining complexity but producing too little variation and highly fragmented groups producing diversity but unable to sustain complexity `[full text, summary of the model page]`. Singletons (12 × 1) are the fragmented extreme and also the C1T comparator at a fraction of its budget.

**Add.**
- Founders (P1) and a niche signal (P4) so that isolation is not a copy of the same draw.
- Reunification and crossover after selection (P6): selection throws away the losers' modules; combination was what the best groups did in Derex–Boyd.
- Agent exchange, which D5 has no analogue of (P2, P3).

**On 'encouraged to do better than the rest'.** This is intergroup competition. Prompt text will not carry it (round 20 lesson b). A coarse rival-production line at the point of use (inside P2's visit) is the only form that fits the tool-and-sight rule. Prior that it raises effort in LLM agents: low to medium, since the human mechanism is identity and reward.

## 4. Designs that look good but theory says fail

1. **Isolation alone as a diversity engine.** Identical priors give the same first approach (He 2026, 7,677 of 7,680) `[secondary]`. Isolation then yields k copies of one lineage and a tournament among near-clones, which picks at random. It works only with a founder or niche source (P1, P4).
2. **Continuous visibility of rivals' work.** Success-biased copying with a visible leader locks the population in `[full text, Derex & Boyd]`. In murmur the leader would also be unidentifiable without an oracle, so imitation would follow volume, not quality.
3. **Conformist copying across teams (copy what most teams do).** With identical priors, agreement among teams carries almost no information (Aumann, as used in C1). Majority-vote pseudo-rewards can "actively amplify" a systematic flaw (TTRL family, `[secondary]`). Do not add "consensus across teams" as a selection rule.
4. **Many tiny teams (6 × 2, 12 × 1) at a fixed token cap.** Too fragmented to sustain complexity (Derex et al. 2018 `[full text, summary]`), and each team falls below the budget that one C1T agent gets whole. The order-statistics gain is real but needs each draw to be viable.
5. **Frequent exchange (every few minutes).** Skolicki & De Jong: migration interval dominates; too frequent migration kills diversity before anything is exchanged `[secondary]`. D5's three snapshots are already near the top of the safe range for a 12–60 minute run.
6. **Success-biased copying of rival code, with success defined by a shown test score.** It re-imports an oracle-like signal that predicts the grader. Cross-test results shown to agents mid-run would make teams tune to rivals' tests; show them only at the freeze (P5) and let agents see test *content*, not score.
7. **Tournament decided by tests written by the same model.** Shared blind spots: the winner is the one that satisfies a common misconception. Weights help (they do not fix a test that all teams get wrong). Expect P5's lift to be modest; measure it against the random pick before trusting it.
8. **Slow socialisation of newcomers (March) inside a team** (an agent may not read the team's folder for X minutes after entry). It duplicates work and C1 already covers private attempts; with first `done` at 1–2 minutes, newcomers would be gone before they read anything.
9. **Elite migration** (the best team's code pushed to others). Without a quality signal there is no elite; with the P5 weighting it is the end-phase P6, not a mid-run flow.

## 5. Three load-bearing claims

1. **No fully connected group discovered both third-level innovations; 58.3% of partially connected groups did, and all of those combined them into fourth-level innovations.** Derex & Boyd (2016), PNAS, Results and Fig. 2, 144 participants in groups of six; fetched via PMC4801235 `[full text, section-level]`. Supports P1–P3, P6 and the "late contact" change to D5. It is a human experiment on one two-pathway task, not LLM agents; the generalisation to murmur is my hypothesis.
2. **Fully connected groups led early and plateaued around trial 35, and contact began at trial 36 with one migrant per subgroup visiting for three trials and returning.** Derex & Boyd (2016), Methods and Fig. 3 `[full text, section-level]`. Supports the 50% first contact and migrant-with-return (P2, P3). The plateau figure and the schedule come from a fetch summary; verify against the original before pre-registering numbers.
3. **Migration interval is the dominant parameter in island models; too frequent migration makes islands lose diversity before they exchange anything, too rare gives slow convergence; migration size matters little.** Skolicki & De Jong (2005), GECCO `[secondary: search summary of the paper]`. Supports "two contacts, not continuous" and "interval over size". It was shown on function-optimisation benchmarks with a fitness function, not on oracle-free work.

Not load-bearing but cited: Fang, Lee & Schilling (2010): "moderate levels of cross-group linking lead to the highest equilibrium performance" `[abstract]`. The report could not read the model's details, so I make no claim about group number or linking rate from it.

## 6. Sources

- Derex & Boyd (2016), Partial connectivity increases cultural accumulation within groups, PNAS. https://pmc.ncbi.nlm.nih.gov/articles/PMC4801235 (fetched, summarised full text)
- Fang, Lee & Schilling (2010), Organization Science 21(3), 625–642. https://ideas.repec.org/a/inm/ororsc/v21y2010i3p625-642.html and DOI https://doi.org/10.1287/orsc.1090.0468 (abstract only; full text paywalled)
- Derex, Perreault & Boyd (2018), Divide and conquer: intermediate levels of population fragmentation maximize cultural accumulation. https://catalog.comses.net/publications/205826 (record page summary)
- Skolicki & De Jong (2005), The influence of migration sizes and intervals on island models, GECCO. https://gpbib.cs.ucl.ac.uk/gecco2005/docs/p1295.pdf (found through search; summary only)
- March (1991), Exploration and exploitation in organizational learning, Organization Science `[memory]`.
- Rendell et al. (2010), Why copy others? Insights from the social learning strategies tournament, Science `[memory]`. PubMed page not readable (cookie wall).
- Boyd & Richerson on conformist and success-biased copying; Caldwell & Millen (2008); Mesoudi & Whiten; Muthukrishna et al. on population size and connectedness; Whitley, Cantú-Paz (island GAs); MAP-Elites (Mouret & Clune 2015); novelty search (Lehman & Stanley); Rosin & Belew (competitive coevolution) `[memory]`.
- Repo reports used: `experiments/reports/2026-10-06-theories-for-the-swarm.md`, `2026-10-06-deep-hg2-peer-production-networks.md`, `2026-10-06-group-science-game-theory-v2.md` (section 3), `2026-10-04-lit-adjacent-fields.md` (headline and design B).

## Open doubts

- Fang et al. unread beyond the abstract; the "optimal linking rate" is unknown to me.
- Human results on a two-pathway puzzle may not transfer to agents with identical priors; P1's divergence test is the gate.
- At a fixed cap, k teams each hold 1/k of the budget; C1T holds all of it alone. P8's trade-off is open and may be negative on repos that need the full budget.
- Cross-test quality depends on the test-run convention; P5 is the biggest build and gates P6, P8.
