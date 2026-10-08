Model-written literature review (subagent), 2026-10-06, deep pass. Tags: [full text, pp.] / [abstract] / [secondary] / [memory].

Page conventions: "PDF p." is the page of the file I read; "printed p." is the page number printed on it. Versions read are named. Formulas marked [derived] are my own arithmetic on a formula that I read at full text. No run data was read.

## 1. Headline

- **Theory does not predict murmur's early quitting; it predicts the opposite.** Every free-riding model of exploration (Bolton-Harris, Keller-Rady-Cripps, Bonatti-Hörner, Georgiadis) needs a private cost of effort, or a safe arm with positive payoff, to make anyone stop. With zero cost the cut-off belief at which an agent quits is 0 (KRC Prop. 3.1 cut-off p*_N = μs/((μ+N)(g−s)+μs), s = 0 gives 0) [full text, KRC p.9]. Early `done` in murmur is therefore not free-riding. It is belief, judgement of scope, or training prior. This agrees with the earlier note that payoff framing has no purchase, and makes it stronger.
- **The sign of "visible quitting" depends on what a `done` means to the reader.** Two full-text models give opposite answers.
  - Quitting as effort withdrawal (Bonatti-Hörner Th. 2, KRC): others take up the slack, so observed quitting does not spread. In murmur, with no effort cost, it is neutral.
  - Quitting as a pessimism signal about the task (Murto-Välimäki; Chamley-Gale; BHW): exit waves. The same model says the absence of exits is good news and keeps agents in.
  - So the stag-hunt risk of the earlier synthesis has **two signs, and a condition**: it is real for `done` reasons that read as "nothing more to do", and absent for reasons that read as "my slice is done, X is untouched".
- **Volunteering has no free-riding in murmur, only a tie-breaking problem.** With c = 0 the static volunteer's dilemma gives p* = 1: everyone volunteers at once (Kopányi-Peuker p. 7, formula p* = 1−(c/b)^(1/(n−1))). Duplicate work, not delay, is the static prediction. The delay in the logs must come from belief ("has anyone moved?", "will the owner return?"), which is the Bilodeau-Slivinski/Campos-Mercade dynamic version.
- **Identical agents are exactly the non-generic case where war-of-attrition uniqueness fails** (Bilodeau-Slivinski Prop. 2 is "generic"). The only tie-breaker is an asymmetry that the tool creates, such as arrival order. That is a theory argument for staggered entry and for visible first movers.
- **Deadlines bunch effort, not quitting.** Bonatti-Hörner predict effort that is low and falling, then maximal near the deadline (U-shape), and no quitting before T. Deadline atoms in bargaining are a different mechanism. A visible clock should therefore raise late activity. Whether it also bunches `done` is an open empirical question, because no deadline model predicts early quitting.
- **Best information to show (b):** outcomes that are public facts (landed changes, executed results), the count and recency of live work, and departures stated as effort facts (what the leaver left untouched). Not: effort observability as such, and not teammates' conclusions (cascades).

## 2. Results one by one

### 2.1 Strategic experimentation: free-riding on exploration

**Bolton-Harris 1999 (Econometrica 67:349).** Players face the same two-armed bandit and see each other's actions and outcomes, so information is a public good. Two effects: free-riding (others' experiments let me stop) and encouragement (my experiment brings forward others' future experiments) [abstract; KRC pp.2-3; Hörner-Skrzypacz survey printed p.2-3]. Full text not obtained (Econometrica paywall; LSE working paper link returned a landing page). Assumptions: Brownian payoff noise, symmetric Markov equilibria, positive-payoff safe arm, observed actions and outcomes, discounting. Held in murmur: shared, observed outcomes. Broken: no safe-arm payoff or effort cost.

**Keller-Rady-Cripps 2005 (Econometrica 73:39), April 2004 preprint.** Exponential bandits: the risky arm pays after exponential times only if good, so a breakthrough is conclusive.
- In the unique symmetric Markov equilibrium the cut-off belief at which all switch to the safe arm is the same as for one player: no encouragement effect [full text, KRC p.2]. Intuition: the only way to induce others to experiment is a breakthrough, and that already tells me everything [KRC p.3].
- All Markov equilibria are inefficient [KRC Prop. 4.1, p.13].
- There is no equilibrium where all use simple cut-offs; equilibria with finite role switching generate the same total information as a single agent but faster when the burden is shared evenly; infinite switching approaches efficiency at an inefficient rate [KRC abstract, pp.3-4, Props. 6.1-6.4, pp.17-23].
- Murmur reading: conclusive news (a passing test) does not make a team persist longer than one agent would. Murmur's "breakthroughs" are not conclusive (own tests passing proves little), which moves it toward the Brownian/inconclusive case (Keller-Rady 2010 [secondary: survey p.2]) where encouragement exists. Role-taking is a model result: agents alternate, which murmur's staggered entry can mimic.

**Keller-Rady follow-ups and surveys.** KR 2015 "breakdowns" (bad news) and KR 2010 (inconclusive news) [secondary: Hörner-Skrzypacz survey, printed p.2-3, where the good-news/bad-news distinction is stated]. In good-news models experimentation stops unless news arrives; in bad-news models it goes on forever unless bad news arrives [survey p.3, full text]. Observed actions with unobserved outcomes "remains largely unsolved" [survey printed p.7]. That is murmur's setting for agents that see `done` and edits but not what each learned.

**Bonatti-Hörner 2011 "Collaborating" (AER 101:632), Cowles DP 1695, revised Nov 2009.** Private cost, public benefit; one breakthrough ends the project; success is uncertain; effort hidden; only success observed. Findings [full text, printed pp.3-4]:
- Agents procrastinate. Total effort is independent of team size, but the project is completed later, on average, with more agents (Lemma 1, printed p.18).
- Deadlines help: the optimal deadline is finite and the longest time for which all agents work at the maximal rate (Th. 3, printed p.32); it is shorter for larger n (printed p.32). With a deadline T, effort follows the no-deadline path, then jumps to maximum before T (Lemma 2, printed p.30; "U-shaped", printed p.32).
- **Observability lowers effort** (Th. 2, printed p.24): efforts are strategic substitutes, so an observed reduction by one lets others "take up the slack" [printed p.25]. The individual payoff is independent of n in the observable case ("rent dissipation", printed p.25).
- Murmur reading: observability of withdrawal produces substitution, not contagion. All of this needs c(u) > 0. With c = 0 the symmetric equilibrium is full effort whether or not effort is seen, so Th. 2 predicts **neutrality** of observability in murmur. The survey adds that under bad news the sign flips (observed shirking depresses collaborators, lowering later effort) [survey printed p.8].

**Georgiadis 2015 (REStud 82:187).** A project completes at a threshold of accumulated progress; progress rate is the sum of efforts; each agent is paid on completion and bears an effort cost; Markov perfect equilibrium. Effort rises as the project nears completion (efforts are strategic complements across time); members of a larger team work harder iff the project is far from completion (free-riding vs encouragement) [full text, pp.1-2, Th. 2 p.10]. With a cancellation state, effort is positive only above a threshold (Prop. 9, p.21). Murmur reading: needs an observable progress state and discounting. Murmur has no oracle for "distance to completion", so only the cancellation/deadline analogue is available.

### 2.2 Quit cascades, herding, global games

**Murto-Välimäki 2011 (REStud 78:1426), April 2010 version.** A stopping game with correlated payoffs; each player privately learns (good types get a conclusive signal at a constant rate, bad types get none); players also observe exits. Findings [full text]:
- Unique symmetric equilibrium in mixed strategies (Th. 1, p.15).
- Two modes: in the **flow mode** bad news from no signals is balanced by the good news that nobody exits; in an **exit wave** one exit makes the others more pessimistic, which triggers more exits, until a period with no exit restores optimism (pp.3).
- Information aggregates in random bursts even for large N (abstract, p.1; p.3).
- "Observational learning induces the players to stay in the game longer" (abstract). It helps good types stay and hurts bad types who stay too long (p.4).
- No private cost is needed: waiting is purely informational.
- Murmur reading: a `done` can be read as private pessimism. The model predicts a below-baseline hazard of `done` while nobody has left, an above-baseline hazard right after a departure, and wave clusters. Its extension says exits stay bunched under heterogeneity (p.3, point at Section 7; I did not read Section 7).

**Chamley-Gale 1994 (Econometrica 62:1065).** N players with an option to invest; the signal is private, revealed only when someone invests; delay is rational (wait and see), the equilibrium is inefficient, herding or collapse is possible, and with more players "adding more players simply increases the number who delay" [secondary: Peck OSU course notes; search summary]. Murmur reading: waiting to see whether others quit, or whether the owner returns, has this structure when the signal is the others' action.

**Bikhchandani-Hirshleifer-Welch 1992 (JPE 100:992).** In sequential choice with observed actions, an agent follows the predecessor's action regardless of its own signal once public evidence outweighs one private signal. Cascades are fragile: (Result 1) small differences in the precision of early movers decide whether and when a cascade starts (pp.1002-1003); (Result 3) **a small amount of public information, less informative than one private signal, can shatter a long-lasting cascade** (journal p.1005, PDF p.15) [full text]. The paper also discusses "decide or delay", with a free-rider incentive to let the best-informed move first [PDF p.12]. Murmur reading: early leavers' reasons set the cascade; a small, neutral, public fact can break it.

**Global games (Carlsson-van Damme 1993; Morris-Shin 1998; Frankel-Morris-Pauzner 2001).**
- Carlsson-van Damme: with slightly noisy payoff signals, iterated dominance leaves one equilibrium, the risk-dominant one in 2x2 games [secondary: FMP intro, PDF p.3 (printed p.2); I did not read CvD itself].
- FMP generalise to many players and actions with strategic complementarities: limit uniqueness holds; **noise-independent selection does not hold in general** [full text, abstract, PDF p.2].
- Morris-Shin 1998 [full text, PDF p.2]: with common knowledge of fundamentals self-fulfilling attacks give multiple equilibria; a small amount of private noise gives uniqueness, and the equilibrium depends on financial variables.
- **Dynamic global games (Angeletos-Hellwig-Pavan 2007, Econometrica 75:711).** Learning from the history of past play restores multiplicity under conditions that give uniqueness in the static case; dynamics alternate between "tranquility" and "distress" phases; "public news only reinforces the multiplicity result" [full text, pp.712-714 (PDF pp.3-5)].
- Murmur reading: global games model coordinated quitting when success needs a critical mass. Murmur's score is additive across repositories, so there is no critical-mass threshold. The relevant part is only the second-order lesson: once agents observe each other's moves over time, equilibrium selection becomes history-dependent, so phases of "everyone stays" and "everyone leaves" are possible without any change in the task. Hellwig 2002 on public vs private information in coordination games [memory; only bibliographic data confirmed].
- Bank runs (Diamond-Dybvig 1983) are the standard application, as a run of withdrawals triggered by beliefs about others' withdrawals [memory]. They need payoff complementarity; murmur lacks it.

**Endogenous timing and clustering.** Gul-Lundholm 1995 show that endogenous timing leads agents to cluster their decisions (a waiting game, not herding on early actions) [memory; title and venue confirmed from a listing]. Frick-Ishii (2015), via the survey: with good news there is no region of indifference; adoption is extremal [secondary: survey printed p.8].

### 2.3 Volunteering and wars of attrition

**Diekmann 1985/1993 (static volunteer's dilemma).** One volunteer suffices; the cost c is private; the benefit b is shared. The unique symmetric equilibrium has p* = 1−(c/b)^(1/(n−1)) per player and P(at least one volunteer) = 1−(c/b)^(n/(n−1)); both fall with n and c [full text, Kopányi-Peuker 2018, PDF p.7, which restates the model; Diekmann's own papers not obtained]. [Derived] With c/b = 0.05: P(nobody) = 0.0025 at n = 2 and 0.037 at n = 12, so the bystander effect saturates at c/b. With c = 0, p* = 1.
- Lab evidence contradicts the mixed equilibrium: subjects over-volunteer, the group-size effect is non-monotonic, and in groups from 15 to 100 there is at least one volunteer (Kopányi-Peuker 2018, groups of 3, 15, 39, ~100) [full text, abstract p.3, p.7]. Franzen 1995 found non-monotonic cooperation across 1 to 100 co-players [secondary: Kopányi-Peuker p.5].
- Weesie 1994: under incomplete information the probability of volunteering may *rise* with uncertainty for N > 2 [secondary: Healy-Pate 2009 p.2].

**Campos-Mercade (CEBI WP 27/20), a dynamic volunteer's dilemma.** Bystanders choose when to help; waiting is costly to the victim. Theory (Prop. 1, PDF p.10): in the unique symmetric equilibrium the help probability per period falls with group size, so each bystander helps later in larger groups, and victims are helped later. Data [full text, Results 1-3, PDF pp.14-15; printed pp.12-13]:
- Alone, 60.7% help immediately and 25% never help. With two bystanders 17.9% help immediately, with four 11.1%.
- The mean waiting time per bystander rises from 5.55 s to 9.45 s to 10.97 s.
- The hazard of helping is 61.9% lower with two and 93% lower with four than alone (Cox model).
- The victim is helped **earlier** in larger groups (5.55, 4.21, 3.20 s), contrary to the model, which an extended model with altruists and selfish types explains.

**Bilodeau-Slivinski 1996 (J. Public Econ. 59:299), working paper May 1994.** The search for a volunteer is a war of attrition. In the infinite-horizon complete-information game, **every individual** has a subgame perfect equilibrium where only they volunteer immediately (Prop. 1, printed p.3); trembling-hand perfection does not reduce the set (printed p.4). With a finite horizon the unique equilibrium outcome has the player with the largest t_i volunteer immediately and all others wait, where t_i rises with the benefit/cost ratio, the horizon and impatience (Prop. 2, printed p.5, "generically") [full text]. Bliss-Nalebuff 1984 (private costs, revelation principle: waiting time rises with cost, so the lowest-cost individual volunteers first) [secondary: Bilodeau-Slivinski, printed p.1]. Murmur reading: identical agents are the non-generic tie; the model gives no volunteer, or all, and arrival order is the only tie-breaker.

### 2.4 Allocation among repositories

**Gittins index.** For independent discounted Markov bandits there is an optimal index policy: play the arm with the largest index [secondary: Bartlett course notes, Berkeley Stat 260, Gittins theorem stated at line 172 of the notes]. Whittle's restless bandits (1988) extend this to arms that change when not played; there is no optimal index rule in general [secondary; Hörner-Skrzypacz survey also notes that restless cases are open]. Murmur is multi-server with unobserved arm values: the index (marginal value per unit effort) needs an oracle.

**Congestion and potential games.** Rosenthal (1973) defined congestion games and proved they have a pure equilibrium via a potential; Monderer-Shapley show finite potential games coincide with congestion games, and better-reply dynamics converge (Lemma 2.3, FIP) [full text, Monderer-Shapley 1996 pp.125-126, PDF p.2 and printed text lines on congestion; Rosenthal not obtained]. Murmur reading: showing per-folder writer counts makes congestion visible. Convergence is toward a count equilibrium, which is about spreading, not about value.

### 2.5 Deadlines

- **Effort near deadlines:** Bonatti-Hörner Lemma 2 and the figure caption (printed pp.30-32) [full text, above]. This requires cost and procrastination incentive.
- **Bargaining deadlines:** Fuchs-Skrzypacz 2013 (AEJ Micro 5:219): with private information and a deadline, trade proceeds smoothly then with an atom at the deadline; bleaker disagreement options lead to more late agreements [full text, abstract p.219; p.220 on the empirical deadline effect (31% of 5,002 labour negotiations settle at the deadline)]. Gneezy-Haruvy-Roth 2003 (GEB 45:347): in a reverse ultimatum game with a deadline, agreements come near the deadline, "substantially less extreme than predicted by perfect equilibrium" [full text, abstract, PDF p.1]. Roth-Murnighan-Schoumaker 1988 [secondary: Fuchs-Skrzypacz p.220]. Murmur reading: bargaining deadlines concern a conflict about division. Murmur has no division, so bunching of agreements does not transfer. Only the effort U-shape (Bonatti-Hörner) is on point, and only if effort has a cost.

## 3. Assumption → murmur fact: holds or breaks

| Assumption in theory | Where it matters | murmur fact | Result |
|---|---|---|---|
| Private effort cost or safe-arm payoff s > 0 | BH, KRC, Georgiadis, Bonatti-Hörner, Diekmann (c), Bilodeau-Slivinski | No cost, no safe arm: quitting earns nothing | **Breaks.** KRC cut-off → 0; static VD p* → 1; Bonatti-Hörner Th. 2 → neutral |
| Agents have utility and discount | Bonatti-Hörner T*, Georgiadis | LLMs have no utility; "discounting" only through context and clock | Breaks; time pressure acts as a belief about remaining useful time |
| Common prior, Bayesian updating | All | Agents hold unspoken, inconsistent beliefs; may over-weight "tests pass" | Doubtful. Quit decisions are the project's key unexplained variable |
| Identical players | Symmetric equilibria (KRC 5.1, MV Th. 1, BH Th. 1) | Identical model, prompt; entry staggered | **Holds**; so tie-breaking comes only from entry order and history |
| Breakthrough conclusive | KRC | Passing tests inconclusive | Breaks (toward Brownian/KR10 case) |
| One shared project and payoff, success from one breakthrough | Bonatti-Hörner, KRC | Additive score across repos, many sub-tasks | Partly breaks: disjunctive in repo-by-repo terms (Bonatti-Hörner Prop. 4, PDF p.53, lower effort per task) |
| Others' actions observable | KRC, BH(Th. 2), MV, BHW | Departures visible only in R20 status arms; edits not observed | Varies by arm (control: no) |
| Success needs critical mass | Global games, bank runs | None; additive score | **Breaks**; stag-hunt contagion has no payoff basis |
| Small N cap or N → ∞ | Diekmann; MV large-N limit | N = 12 | Holds as finite N; over-volunteering in 15-100 groups says the NE is a poor guide |
| Progress observable | Georgiadis | No oracle; clock is the only public state | Breaks for progress, holds for time |
| Deadline known, hard | Bonatti-Hörner | Clock shown, but an agent can leave anytime and the run continues for others | Partly holds |
| Agents rational about waiting | Chamley-Gale, MV | LLMs herd under sequential social learning [secondary: lit-game-theory report on Jain-Krishnamurthy, arXiv 2411.01271] | Plausibly holds qualitatively |

## 4. Where the field disagrees or results are fragile

- **Free-riding and encouragement are model-dependent.** Brownian (Bolton-Harris) has both; exponential good-news (KRC) has no encouragement [KRC p.2]; Bonatti-Hörner finds observability harmful under good news but helpful under bad news [survey printed p.8]. A theory that gives both signs is not a forecast.
- **Observability.** Bonatti-Hörner: observed shirking lowers effort (Th. 2). Fershtman-Nitzan: observability exacerbates free-riding [secondary: Bonatti-Hörner printed p.6]. Yet the Ellison data reading in Bonatti-Hörner says co-located authors finish *faster*, which they use as evidence that the Markov observable equilibrium does not describe behaviour [printed p.4].
- **Global-game uniqueness is fragile.** FMP: noise-independent selection fails in general [abstract]. Dynamic versions restore multiplicity [AHP]. So any prediction that "visible departures cause a unique cascade" is not supported by the theory.
- **Murto-Välimäki vs Chamley-Gale.** Chamley-Gale: information aggregates in one burst at the start, with a collapse risk. MV: slow aggregation in random waves; private learning prevents collapse [MV p.4]. Which one fits depends on whether agents have an ongoing private signal; murmur agents do (tests, reading code).
- **Lab vs equilibrium for volunteering.** Mixed NE predicts falling volunteering and falling success; labs find over-volunteering and near-certain provision in large groups [Kopányi-Peuker abstract, p.7]. Campos-Mercade finds the model right on individual delay and wrong on the victim's wait, which an altruist-selfish mixture fixes [abstract, PDF p.2]. Healy-Pate: costs asymmetry reduces volunteering, and volunteers are those with low cost [secondary: abstract, PDF p.1].
- **Deadlines.** Theory (subgame perfection) predicts an extreme last-moment atom; the lab finds agreements near the deadline but "substantially less extreme" [GHR abstract]. 
- **Identical-agent war of attrition has no unique outcome** (Bilodeau-Slivinski Prop. 1); the unique result needs a finite horizon and heterogeneity.

## 5. Answers to the questions

**(a) Does making others' quitting visible accelerate or delay quitting?** It depends on the channel, and three channels give three signs.
1. *Effort substitution* (Bonatti-Hörner Th. 2, KRC): visible withdrawal raises others' optimism and effort. With c = 0 this is neutral.
2. *Information about the state* (Murto-Välimäki, BHW, Chamley-Gale): a visible exit is pessimism evidence, so exits cluster (waves); but visible *absence* of exits is good news and delays quitting. The net effect of a "who is still here" display is delay while departures are rare and acceleration right after one.
3. *Payoff complementarity* (global games, stag hunt): needs critical mass; murmur lacks it.
The discriminating condition is the content of the `done` reason: "my slice is done, folder X untouched" is an effort fact (channel 1), "nothing more to do, all validated" is a state claim (channel 2). Modest confidence: the earlier synthesis's stag-hunt risk is real only through channel 2.

**(b) Best information for a team with uncertain success and a deadline?** The theory says the public state variable is the common belief, which is driven by *outcomes*: breakthroughs and failures are public goods, efforts are not (KRC pp.2-3; survey p.7). So show landed outcomes (what changed, what executed) with their time, how many agents are still active, and the time left. Do not show conclusions as a tail (BHW cascades). Do not show "progress" (no oracle). Observed effort and hidden outcomes (murmur's default) is the largely unsolved case (survey p.7).

**(c) Does a visible deadline cause bunching?** Of effort, yes in theory: low and falling effort, then a jump to maximum before T (Bonatti-Hörner Lemma 2, printed p.30), though only when effort is costly. Of stopping, theory has nothing: Bonatti-Hörner agents never quit before T, and bargaining deadline atoms concern agreements. The Bilodeau-Slivinski finite-horizon structure gives a plausible quitting-by-time mechanism: beyond t_i the job is no longer worth starting (printed p.4), so `done` hazard should rise when the time left is shorter than the smallest useful unit of work. That predicts end-bunching of `done`, not of start-bunching.

**(d) How does volunteering latency scale with N when the cost is zero but uncertainty about others is high?** The static model predicts none: p* = 1 at c = 0 (everyone volunteers at once, which means duplication). Latency in the dynamic model comes from a waiting cost against a private cost (Campos-Mercade): per-agent help hazard falls with N (61.9% lower with 2, 93% lower with 4 bystanders [Result 3]) but the time to the *first* helper falls as altruists accumulate (5.55 to 3.20 s). Under heterogeneous altruism the first-help time is non-increasing in N. Murmur's identical agents with zero cost and uncertainty about whether others have moved: expect per-agent latency to be flat or rising in N, first-mover latency to fall with N, and the main driver to be belief about whether the last writer is gone, not N. This is a hypothesis; no experiment has these conditions.

## 6. Levers

All are oracle-free (facts about activity, never correctness), non-hierarchical (no assignments), and exist in real work (team channels show who left and what is untouched). None is a coordinator.

| # | Lever | Mechanism | Theory basis | Prediction | Measure | Cost |
|---|---|---|---|---|---|---|
| L1 | **Live-count line**: "k of 12 still working; last landed change anywhere t min ago" in every tool result | information | MV flow mode (absence of exits is good news); BHW Result 3 (small public fact breaks cascades) | Lower `done` hazard for agents who have not left, fewer clusters. Risk: "t min idle" reads as bad news and speeds exit | Hazard of `done` per arm; cluster index (section 7, P1-P3) | ~5 lines in the status line; default off |
| L2 | **Departure as effort facts**: tool-collected "left at M min; wrote in X, Y; folder Z has no writer since" instead of, or beside, the agent's own reason | information (tool-collected) | Bonatti-Hörner channel 1: makes exit an effort fact, not a state claim | Fewer exit clusters; earlier pick-up of orphans | Cascade size after `done` by reason type; pick-up latency | ~10 lines on `teamStatus`. Part of the R20 status line |
| L3 | **First-visible-mover**: when an agent starts writing in an orphaned folder, the status line immediately shows it as that folder's writer | tool mechanics | Sequential volunteering; Bilodeau-Slivinski tie-break via history | Fewer simultaneous takers; shorter pick-up | Collisions within 2 min; pick-up latency | ~5 lines. Never name a "next in line" (that is an allocator) |
| L4 | **Clock with a "time left" figure** (exists) | information | Bonatti-Hörner Lemma 2; Bilodeau-Slivinski t_i | Late-activity rise; possible end-bunching of `done` | Tool-call rate and `done` share in last 10% | 0 (exists) |
| L5 | **Outcome broadcast**: landed changes (diff stat, command executed, exit code) appear in others' tool results; no conclusions | information | KRC/BH: outcomes are the public good; "executed facts" are costly signals | Fewer repeated discoveries; risk of herding on one repo | Editors per repo; repeated commands across agents | Moderate; may reveal quality if exit codes are shown, so counts only |

## 7. Testable predictions on existing logs (`events.jsonl`)

I did not read any runs. For each, "arm" means any murmur arm with and without visible departures.

- **P1. Contagion hazard (MV, two-sided).** Per agent, estimate the hazard of `done` in windows [0,2], [2,5], [5,10] min after another agent's `done`, against its hazard at the same elapsed run time otherwise. MV predicts above-baseline soon after a departure and below-baseline in quiet periods, only in arms where departures are visible (status or board post). In a no-messaging arm any excess is common task difficulty (difference-in-differences).
- **P2. Reason type decides the sign.** Classify `done` reasons as partial-scope ("my slice", "X untouched") vs closure ("all validated", "nothing more"). Cascade size (further `done` within 5 min) should be larger after closure reasons (channel 2) and smaller or zero after partial-scope reasons.
- **P3. Wave clustering.** For each run, compare the index of dispersion of `done` times to a permutation null. Exit waves predict overdispersion (clumps), with clumps ending after quiet intervals.
- **P4. Entry order and exit order.** Rank correlation between stagger entry position and `done` rank. The finite-horizon war of attrition says the player with the most to gain from continuing (largest t_i) stays; here entry order is the only asymmetry, so check whether later entrants stay longer (they see more finished work).
- **P5. Deadline shape.** Share of tool calls and of `done` events in the last 10% vs first 10% of the clock, in clock arms vs no-clock arms. Bonatti-Hörner predict a late rise in effort; an end-bunch of `done` is the alternative reading (quit when time left < minimum useful unit).
- **P6. Volunteering latency vs N.** For each departure of a folder's last writer, time to first write by another agent in that folder, against N_active at that moment. Under identical agents with no cost: flat or falling first-mover latency in N_active; the per-agent pick-up rate falls with N (Campos-Mercade's 62% and 93% hazard drops are the benchmark).
- **P7. Hazard shape.** Kaplan-Meier of time-to-`done`, per arm. A constant hazard says memoryless identical agents; a falling hazard says heterogeneity (a few persistent agents), which is the "refuse to stop" pattern in the record.

## 8. What not to build

- Anything that shows or implies a score or payoff (oracle) to cut exit: violates the realism rule and the theory has no purchase without cost.
- A manager, auction, or assigned "next taker" for orphans (contract-net, serial dictatorship with an allocator): coordinator.
- Payoff or responsibility text ("someone has to take orphans"): works through c and b, which agents lack.
- A tail of all teammates' conclusions: BHW cascades (Result 1, early leaders' signals dominate).
- A hidden or delayed departure display aimed at suppressing waves: it hides facts agents would have in real work (a team chat shows who left) and reintroduces the silence problem.
- "Minimum presence" or "do not leave before T" norms: a prompt-text rule; the record says prompt text does not change behaviour, and it works against the theory's own point that agents without cost should not leave.

## 9. Three load-bearing claims to verify

1. **Observability lowers effort in a cost-bearing team; at zero cost it is neutral.** Bonatti-Hörner, Cowles DP 1695 (Nov 2009), Theorem 2, printed p.24 (PDF p.25), with the explanation on printed p.25; compare with the unobservable Theorem 1 at printed p.17. The zero-cost neutrality is my inference from the formulas (effort u(p) ∝ r/(α(n−1)) × V(p), with V from the cost α), not a statement in the paper.
2. **Exit waves and the staying effect.** Murto-Välimäki, April 2010, abstract (p.1) and pp.3-4 ("flow mode", "exit wave", "observational learning induces the players to stay in the game longer"), Theorem 1, p.15. This is what makes the stag-hunt risk two-sided.
3. **Per-agent volunteering delay rises with group size while the victim is helped earlier.** Campos-Mercade, CEBI WP 27/20, Result 3 (hazard 61.9% and 93% lower, printed p.13, PDF p.15) and Table 1 (mean times 5.55, 9.45, 10.97 s for bystanders; 5.55, 4.21, 3.20 s for victims, printed p.13).

## 10. Sources

Read at full text (files in `tmp/claude-deep-gt2/pdf/`, deleted at the end):
- Bonatti, Hörner, "Collaborating", Cowles DP 1695, revised Nov 2009. https://cowles.yale.edu/sites/default/files/2022-08/d1695.pdf (published AER 101(2):632-663, 2011)
- Keller, Rady, Cripps, "Strategic Experimentation with Exponential Bandits", preprint April 2004. https://www.econ.uni-bonn.de/micro/en/rady/publications-1/051strategic.pdf/@@download/file/051Strategic.pdf (Econometrica 73:39-68, 2005)
- Georgiadis, "Projects and Team Dynamics", REStud 82:187-218 (advance access version). https://www.kellogg.northwestern.edu/faculty/georgiadis/ProjectsTeamDynamics.pdf
- Murto, Välimäki, "Learning and Information Aggregation in an Exit Game", April 2010. https://www.game.kier.kyoto-u.ac.jp/2010/101028Valimaki.pdf (REStud 78:1426, 2011)
- Angeletos, Hellwig, Pavan, "Dynamic Global Games of Regime Change", Econometrica 75:711-756. https://economics.mit.edu/sites/default/files/publications/Angeletos%20Hellwig%20Pavan%20%28Ecma%202007%29.pdf
- Morris, Shin, "Unique Equilibrium in a Model of Self-Fulfilling Currency Attacks", AER 88:587. https://economics.mit.edu/sites/default/files/publications/morris-uniqueequilibriuminamodelofselffulfillingat.pdf
- Frankel, Morris, Pauzner, "Equilibrium Selection in Global Games with Strategic Complementarities", Cowles DP 1336 (Nov 2001). https://cowles.yale.edu/sites/default/files/2022-08/d1336.pdf
- Bikhchandani, Hirshleifer, Welch, JPE 100:992. https://snap.stanford.edu/class/cs224w-readings/bikhchandani92fads.pdf
- Bilodeau, Slivinski, "Toilet cleaning and department chairing", working paper, May 1994. https://econwpa.ub.uni-muenchen.de/econ-wp/pe/papers/9405/9405001.pdf (J. Public Econ. 59:299, 1996)
- Kopányi-Peuker, "Yes, I'll do it", Tinbergen Institute DP 2018-072/II. https://papers.tinbergen.nl/18072.pdf
- Campos-Mercade, "The Volunteer's Dilemma explains the Bystander Effect", CEBI WP 27/20. https://www.econ.ku.dk/cebi/publikationer/working-papers/CEBI_WP_27-20.pdf
- Hörner, Skrzypacz, "Learning, Experimentation and Information Design". https://web.stanford.edu/~skrz/survey_learning_Horner_Skrzypacz.pdf
- Fuchs, Skrzypacz, "Bargaining with Deadlines and Private Information", AEJ Micro 5:219. https://web.stanford.edu/%7Eskrz/Fuchs_Skrzypacz%20Deadlines.pdf
- Gneezy, Haruvy, Roth, "Bargaining under a deadline", GEB 45:347. https://stanford.edu/%7Ealroth/papers/2005_GEB_Bargaining_Under.pdf
- Monderer, Shapley, "Potential Games", GEB 14:124. https://www.math.cmu.edu/~af1p/Teaching/INFONET/Papers/EconomicModels/PotGam.pdf

Read, secondary (course or companion notes):
- Chamley-Gale notes (Peck, Ohio State). https://www.asc.ohio-state.edu/peck.33/gametheory/ChamleyGalenotes.pdf
- Gittins index notes (Bartlett, Berkeley). https://www.stat.berkeley.edu/~bartlett/courses/2014fall-cs294stat260/lectures/gittins-notes.pdf
- Healy, Pate, "Asymmetry and Incomplete Information in an Experimental Volunteer's Dilemma". https://www.mssanz.org.au/modsim09/D9/healy.pdf

Not obtained at full text (cited by abstract, secondary, or memory): Bolton-Harris 1999 (https://econometricsociety.org/publications/econometrica/1999/03/01/strategic-experimentation), Carlsson-van Damme 1993, Morris-Shin 2003 chapter (Cowles DP 1275), Diekmann 1985 and 1993, Franzen 1995, Bliss-Nalebuff 1984, Whittle 1988, Gittins 1979, Rosenthal 1973, Gul-Lundholm 1995, Chamley-Gale 1994 (original), Banerjee 1992, Roth-Murnighan-Schoumaker 1988, Hellwig 2002, Diamond-Dybvig 1983, Keller-Rady 2010 and 2015.

Earlier report (`2026-10-06-lit-game-theory.md`): its volunteer formula is confirmed at full text (Kopányi-Peuker PDF p.7); its stag-hunt risk is real but two-signed and conditional on reason content. No theory covers murmur's exact structure, so everything here is transfer by analogy.
