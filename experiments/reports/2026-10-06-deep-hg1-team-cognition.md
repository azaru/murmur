Model-written literature review (subagent), 2026-10-06, deep pass. Tags: [full text, pp.] / [abstract] / [secondary] / [memory].

# Human groups, part 1: team cognition and information sharing, with effect sizes

## 1 Headline

- **Larson (2010) could not be read.** Only the book description and chapter titles were reachable (Routledge, Loyola page, Google Books landing page; the archive.org text is locked). Everything below about Larson, Hill (1982), Laughlin's truth-supported-wins and Steiner is [memory] or [secondary: web-search summary or Pappu et al. 2026], and is marked so. No chapter-level content from Larson is claimed.
- **Full text was read** for: Mesmer-Magnus & DeChurch 2009 (MM&D); DeChurch & Mesmer-Magnus 2010 (DC&MM); Marlow et al. 2018; Mathieu et al. 2019 (an Annual Review that tabulates about 30 meta-analyses, used as a cross-check); Stasser & Titus 1985; Riedl et al. 2021; Bates & Gupta (Intelligence, online 2016); Hutchins 1995; Malone & Crowston 1994; Pappu et al. 2026 (arXiv). LePine et al. 2008 was not readable, but its corrected correlations were recovered from the data file of the R package `configural` and cross-checked against Mathieu 2019 Table 2.
- **Strongest regularities.**
  - Information sharing, team cognition and teamwork processes all correlate with team performance at roughly ρ = .3–.5.
  - The effects are about one third to one half smaller on objective criteria, which is the criterion type murmur's hidden grader uses (MM&D .21; DC&MM .31).
  - Communication quality predicts performance about twice as well as communication frequency (ρ .36 vs .19).
  - Virtual (text-mediated) teams show almost no communication–performance link (ρ .10, CI includes 0, k=14).
  - The mechanisms with the largest effects are things the team knows about itself: who knows what (TMS), what has been shared, what is in the shared representation. They are not things a team is told to do.
- **Best-member question.** Human groups beat their best member only on tasks where a correct answer can be recognised once shown, and where several members hold complementary partial knowledge. murmur's oracle-free rule removes task-provided demonstrability by design. That is a structural reason to expect no easy "strong synergy", and it matches the one direct LLM analogue (Pappu et al. 2026: self-organising LLM teams do not match their expert member).
- **What transfers.** Almost all of it is meta-analytic correlation from observational designs (DC&MM say so, p. 49). The usable content is the *mechanism list*, filtered to what a tool can supply: shared visibility of who touched/ran what, shared records of executed checks, and departure facts.

## 2 Findings by topic

### 2.1 Information sharing and hidden profiles

**Stasser & Titus 1985 (original)** [full text, Results and Table 3, pp. 1470–1473]. Four-person groups chose a student-body president from three candidates. In the *shared* condition all members saw the same information and 83% of 18 groups chose the best candidate A. In the *hidden profile* conditions (unshared information, the full set would favour A) only 18% of 38 groups chose A (χ²(1, N=56)=21.59, p<.001). Pre- and post-discussion recall showed that discussion "tended to perpetuate, not to correct" members' distorted pictures (abstract). The proposed mechanism is a biased sampling model: discussion is dominated by information held in common and by information supporting members' existing preferences.

**MM&D 2009** (J Appl Psychol 94:535–546; 72 independent studies, 4,795 groups, total N=17,279) [full text, abstract and Tables 2–6, pp. 535–543]. ρ is corrected for unreliability.
- Information sharing → team performance: ρ=.42, k=43, N=2,701 groups, 90% CI [.35,.49], 80% credibility interval [.14,.70]. The authors note positive effects "across all levels of moderators" (abstract).
- **Uniqueness vs openness** (Table 2, p. 540). Uniqueness (sharing information that only some members hold): ρ=.50, k=25, N=1,490, CI [.40,.60]. Openness (general, self-reported willingness to share): ρ=.32, k=19, N=1,295, CI [.25,.39]. Non-overlapping CIs. The authors list methodological confounds (uniqueness studies are manipulations on ad hoc teams, openness studies are self-reports on intact teams) and say the gap may be "conceptual versus methodological" (p. 541).
- **Criterion type** (Table 2). Decision effectiveness ρ=.45 (k=31); subjective measures .51 (k=4, N=286); **objective measures .21 (k=8, N=498, CI [.09,.33])**. Behaviours are "more controllable by teams" than outcomes (p. 541).
- **Task type** (Table 3, p. 540). Hidden-profile intellective tasks .53 (k=23, N=1,307, CI [.43,.63]); hidden-profile judgmental .36 (k=5); non-hidden intellective .36 (k=4); non-hidden judgmental .37 (k=4). CIs overlap; the authors caution.
- **Discussion structure** (Table 4, p. 541). Structured discussion, uniqueness: ρ=.46 (k=8) vs unstructured .34 (k=14). For openness structure made no difference (.29 vs .37). "Structured" meant instructed to share, told to be vigilant, or given a format that ensures participation.
- **Antecedents of sharing** (Table 5, p. 542): cooperation during discussion ρ=.57 (k=14, wide credibility interval [.16,.97]); task demonstrability .45 (k=5); discussion structure .41 (k=13); informational independence .52 (k=4); member similarity .22 (k=9). Sharing is greater in *similar* teams (p. 540), contrary to the folk expectation that diversity helps.
- **Bias magnitude** (Table 6 and note 10, pp. 542–543). Share of discussion devoted to shared vs unshared information: ρ=.69, k=23, N=901 groups, d≈1.38. In plain words, groups spend roughly 1.4 SD more discussion on what everybody already knows.

**Lu, Yuan & McLeod 2012** (Pers Soc Psychol Rev 16:54–75) [secondary: web-search summary; full text closed]. 65 studies, 101 effects, 3,189 groups. Groups mention about two SD more common than unique information; hidden-profile groups are about eight times less likely to find the solution than full-information groups; the percentage of unique information pooled predicts decision quality; moderators include group size, information load, proportion of unique information, task demonstrability and hidden-profile strength. I have not seen the abstract itself, so the "eight times" and "two SD" figures are unverified here.

### 2.2 Team cognition, shared mental models, transactive memory

**DC&MM 2010** (J Appl Psychol 95:32–53; 65 studies, 231 correlations) [full text, Tables 3–12, pp. 40–46].
- Team cognition → team performance: ρ=.38, k=60, N=3,512 groups, CI [.33,.43]. **Objective ρ=.31** (k=39, N=2,243), **subjective .44** (k=19). Cognition → behavioural process ρ=.43 (k=37); → motivational states .37 (k=17) (Table 3, p. 41).
- Incremental validity (Table 4, p. 41–42): motivation plus behavioural process explained 11.6% of performance variance; adding cognition raised it to 18.4% (ΔR²=6.8%, significant). The caveat is that this uses meta-analytic correlations from studies that are mostly cross-sectional; the authors say "we did not address the causal nature" (p. 49, limitations).
- **Nature of emergence is the main moderator** (Tables 5–6, p. 42). *Compositional* measures (do members' mental models agree or are they accurate?) → performance ρ=.32 (k=33, N=2,088); congruence .30, accuracy .34. *Compilational* measures (a team-level property: transactive memory, "who knows what") → performance ρ=.44 (k=26, N=1,510). TMS "global" (the overall system) ρ=.47 (k=21, N=1,310); TMS "specialization" .35 (k=11). On objective performance only: compositional .26 (k=24, N=1,403, CI [.19,.33]); **compilational .42 (k=17, N=972); TMS global .47 (k=15, N=919, CI [.36,.58])**.
- Cognition → process: compilational .62 (k=10) vs compositional .29 (k=15); TMS global .68 (k=8, N=467) (Table 5).
- Team type (Table 12, p. 45): TMS-type cognition predicts performance in action teams ρ=.47 (k=10) and project teams .54 (k=7) but only .30 in decision-making teams (k=6, N=343). Compositional cognition in decision-making teams: process ρ=.15, performance .40.
- Interdependence: compositional cognition predicts performance more under *moderate* than high interdependence (.38 vs .28); the hypothesis for compilational was not supported (p. 43).

**Mathieu et al. 2019** (Annu Rev Organ Psychol Organ Behav 6:17–46) [full text, Tables 1–2, pp. 21–23], as a cross-check: team cognition ρ=.37 with performance; information sharing .41; coordination .29; intrateam trust .29; cohesion .21; psychological safety .29; **team size .259 as printed (a typo or a coding oddity, not used here)**; team general mental ability .27 (Bell 2007); team conscientiousness .11; demographic and background diversity about 0 to −.06.

**Transactive memory primary studies: not read.** Liang, Moreland & Argote 1995: groups trained together had stronger TMS and fewer errors [secondary]. Moreland & Myaskovsky 2000 asked whether the benefit is TMS or communication; I could not retrieve results. My memory (unverified, check before use) is that members trained alone but told each other's skills did about as well as group-trained members, which would make the information, not shared experience, the active ingredient. Ren & Argote 2011, Lewis 2003 and the Bachrach et al. 2019 meta-analysis: not read.

### 2.3 Team processes

**LePine et al. 2008** (Personnel Psychology 61:273–307) [secondary-numeric: corrected correlations decoded by hand from the `configural` R package data file, `team.RData`, and cross-checked with Mathieu 2019 Table 2; the paper itself was not read; the package gives N but not k, and no CIs].

| Process (dimension) | ρ with performance (N) | ρ with member satisfaction |
|---|---|---|
| Mission analysis (transition) | .27 (1,164) | .32 |
| Goal specification (transition) | .34 (1,612); Mathieu lists .32 pooled over three sources | .36 |
| Strategy formulation (transition) | .35 (1,587) | .38 |
| Monitoring progress (action) | .25 (874) | .30 |
| Systems monitoring (action) | .17 (770) | .29 |
| Team monitoring and backup (action) | .30 (1,891) | .29 |
| Coordination (action) | .29 (2,012) | .34 |
| Conflict management (interpersonal) | .26 (2,049) | .32 |
| Motivating (interpersonal) | .34 (1,525) | .41 |
| Affect management (interpersonal) | .30 (2,478) | .47 |

Mathieu 2019 Table 2 gives dimension-level values: transition .29, action .29, interpersonal .29 with performance; overall team processes **ρ=.31 with performance, .43 with satisfaction**. The corrected correlations *among* the ten processes are .41 to .87 (the data file), so they are hardly separable constructs. Team size and task interdependence moderate the process–performance link (Mathieu 2019, p. ~28; the direction was not extracted). The Marks, Mathieu & Zaccaro (2001) taxonomy supplies the process labels (transition, action, interpersonal) [secondary: Dinh et al. 2021 summary of definitions; Marks not read].

### 2.4 Communication: frequency vs quality

**Marlow et al. 2018** (OBHDP 144:145–170; 150 effect sizes, N=9,702 teams) [full text, Tables 2–3, pp. 152–153 and text]. Overall communication → performance ρ=.31 (r=.27), 95% CI [.23,.30] as printed, 80% credibility [.03,.59].
- **Quality ρ=.36** (k=78, N=4,662) vs **frequency ρ=.19** (k=51, N=3,349, CI [.09,.23], credibility interval includes −.13). Fisher z-test of the difference z=7.01 (observed r .31 vs .16).
- By type: information elaboration .52, knowledge sharing .44, openness .31, general information sharing .30, objective frequency .15, self-report frequency .16.
- **Virtuality**: face-to-face ρ=.32 (k=48, N=2,526); hybrid .29 (k=18); **virtual .10 (k=14, N=1,013, CI [−.02,.19])**.
- Familiarity moderates it (β=.30, p<.01, k=95, R²=.09). Team size did not (β=−.08, n.s., k=137).
- Task type: cognitive .30 vs action .26. Defined problem-solving .32, ill-defined .29. Leadership structure: **hierarchical .33 vs shared .27** (credibility interval for shared includes negative values).
- **Curvilinearity was not tested** (footnote 1: primary studies did not report frequency means). The authors cite Patrashkova-Volzdoska et al. 2003 as suggesting an inverted U "in certain cases". So the only large meta-analysis does not answer whether too much communication hurts.

### 2.5 Collective intelligence (c): the replication debate

- **Woolley et al. 2010** (Science) [memory/secondary]: a general factor "c" across group tasks, correlated with average social sensitivity, evenness of turn-taking and share of women, but only weakly with average or maximum member IQ. Bates & Gupta report that Woolley's study 2 found individual IQ explained about 3% of group-IQ variance (their intro).
- **Bates & Gupta** (Intelligence; 3 studies, 312 people, 40+ groups) [full text, abstract and results]: a single factor accounts for about 31–40% of task variance; **individual IQ explains about 80% of group-IQ differences, and 100% of the latent factor in the combined model** (β=.74–.76 in the regressions); no effect of proportion of women or turn-taking; "reading the mind in the eyes" had no effect on the latent factor in the combined model. Small samples, one cultural context (the replication was partly in India).
- **Credé & Howardson 2017** (J Appl Psychol 102:1483), reanalysing six published samples [secondary: press summaries only; I did not see the abstract]: statistical artifacts such as low-effort responding, zero scores and nested data may inflate task correlations; the factor explains little variance in many tasks.
- **Riedl, Kim, Gupta, Malone & Woolley 2021** (PNAS 118:e2005737118; 22 studies, 5,279 individuals, 1,356 groups) [full text, PMC HTML, Results and Discussion]: average inter-task correlation 0.27 (range 0.12–0.50); a single meta-analytic factor; leave-one-task-out prediction of the held-out task r=0.40 (CI 0.26–0.53). A random forest finds that **group collaboration process measures (skill congruence, strategy, effort) explain the largest share of CI variation, then member skill (mean and max), then group size, social perceptiveness and composition**. Process versus skill varies by task: more than 51% of explained variation on Sudoku is individual skill, 55% on unscrambling words is process. The authors themselves conclude that "methodological choices" and task selection likely explain divergent findings. The strongest process measures are produced by the authors' own platform logs, not independent coding.
- **Reading:** the existence of a stable c is contested, and its dependence on individual ability is large in Bates & Gupta and smaller in Riedl; the sign of the disagreement is task type, not a clear winner.

### 2.6 When do groups beat their best member? (Larson, Hill, Laughlin)

All [memory] or [secondary] unless stated.
- **Larson's definitions** (book description, which was read): *weak synergy* means group performance exceeds the average of members' performance; *strong synergy* means it exceeds the best member. "Synergy" is an objective gain attributable to interaction, measured against the same number of people working independently. [Description read; the conclusions are not.]
- **Hill 1982** [memory]: groups typically beat the average individual and rarely beat the best individual on the problem-solving tasks reviewed.
- **Laughlin line** [secondary: Pappu et al. 2026 §2.2 cites Hill 1982, Laughlin et al. 2002 and Bonner et al. 2002; a search summary of Laughlin & Ellis 1986 and Laughlin et al. 2006]: on *intellective* tasks (a demonstrably correct answer within a shared system, such as letters-to-numbers or math problems), groups almost always beat their average member and "often perform as well as, and occasionally better than, their best members". Conditions for truth-wins: the group shares a system, has sufficient information, can recognise the correct answer when a member proposes it, and the solver can and will share it. Laughlin et al. 2006 (N=760 students): groups of three to five beat the best of the same number of independent individuals on letters-to-numbers problems; groups of two matched the best of two. My memory is that the stronger result (truth-supported-wins, where one correct member is not enough but two suffice) comes from tasks with several partial insights that members can combine. **Not read: treat as a lead.**
- **Pappu et al. 2026, arXiv 2602.01011v4** [full text; the closest LLM study]. Self-organising teams of four LLMs, four discussion rounds, majority vote at the end. They fail strong synergy: on three psychology tasks the team's error exceeds the expert's by 17% to 113% (Table 1), and "even when explicitly told who the expert is", with prompts optimised to induce deference; on ML benchmarks losses reach 41.1% (abstract). They reach weak synergy (team beats member average) everywhere. Team-size dilution: the synergy gap grows with team size 2, 4, 8, all correlations p<.05 including the reveal-expert condition (§4.3). Conversation analysis finds "integrative compromise" (averaging expert and non-expert views). Different mechanism from murmur (voting over a conversation, not a shared folder with executable checks), so use it for the dilution and prompt-deference findings only. The human comparison it quotes (Bonner et al. 2002: human teams match the expert once expertise is revealed) is [secondary].

### 2.7 Distributed cognition and coordination theory

**Hutchins 1995, "How a cockpit remembers its speeds"** (Cognitive Science 19:265–288) [full text, pp. 284–286 and 288]. The cockpit as a cognitive unit computes and remembers landing speeds through a chain of representations: a laminated speed card (non-volatile "memory"), speed bugs set on two airspeed indicators, and verbal cross-checks between the pilots. "Memory processes may be distributed among human agents, or between human agents and external representational devices" (p. 284). The physical device "permits the computation of speeds to be moved arbitrarily far in time" and is "relatively insensitive to the interruptions, the distractions, and the delays that may disrupt internal memories" (pp. 284–286). The system is "surprisingly redundant: not only redundant representation in memory, there is also redundant processing and redundant checking" (p. 286). Much of what matters "is in the interaction of the people with each other and with physical structure in the environment" (p. 286). The mechanism is a *shared external representation with built-in cross-checks*, not trained shared understanding.

**Malone & Crowston 1994** (ACM Comput Surv 26(1):87–119) [full text, Table 1 and §2.2]. Coordination is "managing dependencies between activities". Table 1 pairs each dependency with mechanisms: *shared resources* (first-come-first-served, priority, budgets, managerial decision, market bidding); *task assignment* (same as shared resources); *producer/consumer* with sub-types *prerequisite* (notification, sequencing, tracking), *transfer* (inventory management), *usability* (standardisation, ask users); *simultaneity* (scheduling, synchronisation). Of these, the ones that need no manager are first-come-first-served, notification, tracking and synchronisation; priority orders and managerial decision need an authority.

### 2.8 Software-team studies (abstract level only)

- Espinosa et al. 2007 (JMIS 24:135-169) [secondary: search summary]: distance hurts coordination in distributed software teams; shared knowledge of the team and **presence awareness** mitigate it. Their ICIS 2002 version finds prior familiarity with the same code reduces development time [secondary].
- Kraut & Streeter 1995: informal communication is necessary for coordination across 65 projects [secondary].
- Hannay et al. 2009 pair-programming meta-analysis [secondary]: small positive effect on quality, medium effects on duration and effort; pairs are faster on simple tasks at lower quality and better on complex tasks at much greater effort. Effect sizes not retrieved.
- Not read, memory only: Rico et al. 2008, Endsley 1995, Mohammed et al. 2010.

## 3 Effect-size table

ρ is corrected for unreliability unless marked r. CI is 90% for MM&D and DC&MM, 95% for Marlow. "Team" is the unit, so N counts groups.

| Mechanism | Source | k | N | ρ (or r) | CI | Moderators and notes |
|---|---|---|---|---|---|---|
| Information sharing → team performance | MM&D 2009, T2 | 43 | 2,701 | .42 | .35–.49 | credibility .14–.70 |
| IS as uniqueness | same | 25 | 1,490 | .50 | .40–.60 | manipulated, ad hoc teams |
| IS as openness | same | 19 | 1,295 | .32 | .25–.39 | self-report, intact teams |
| IS → objective performance | same | 8 | 498 | .21 | .09–.33 | subjective .51 (k=4); decision effectiveness .45 (k=31) |
| IS → performance, hidden profile intellective | MM&D, T3 | 23 | 1,307 | .53 | .43–.63 | other task types .36–.37 |
| Uniqueness, structured vs unstructured discussion | MM&D, T4 | 8 / 14 | 405 / 730 | .46 / .34 | .36–.56 / .27–.41 | openness not moderated |
| Discussion share on shared vs unshared info | MM&D, T6 | 23 | 901 | .69 (d≈1.38) | .61–.77 | judgmental .86 |
| Cooperation → IS | MM&D, T5 | 14 | 1,028 | .57 | .42–.72 | wide credibility |
| Member similarity → IS | MM&D, T5 | 9 | 565 | .22 | .10–.34 | |
| Team cognition → performance | DC&MM 2010, T3 | 60 | 3,512 | .38 | .33–.43 | objective .31 (k=39); subjective .44 (k=19) |
| Cognition → behavioural process | same | 37 | 1,934 | .43 | .36–.50 | |
| Compositional (agreement/accuracy) → perf | DC&MM, T6 | 33 | 2,088 | .32 | .25–.39 | objective .26 (k=24) |
| Compilational (TMS-type) → perf | same | 26 | 1,510 | .44 | .37–.51 | objective .42 (k=17, N=972) |
| TMS global → performance | same | 21 | 1,310 | .47 | .39–.55 | objective .47 (k=15, N=919) |
| TMS specialization → performance | same | 11 | 601 | .35 | .22–.48 | |
| TMS-type cognition → perf by team type | DC&MM, T12 | 10 / 6 / 7 | 617 / 343 / 338 | .47 / .30 / .54 | .35–.59 / .19–.41 / .43–.65 | action / decision-making / project |
| Teamwork processes → performance | LePine 2008 via Mathieu T2 | – | – | .31 | – | dimensions each .29 |
| Individual processes → performance | LePine data file | – | 770–2,478 | .17–.35 | – | lowest systems monitoring, highest strategy formulation; no k or CI available |
| Communication → performance | Marlow 2018, T2 | 150 | 9,702 | .31 | .23–.30 (as printed) | credibility .03–.59 |
| Quality / frequency | same | 78 / 51 | 4,662 / 3,349 | .36 / .19 | .27–.35 / .09–.23 | z=7.01 for the difference |
| Virtual / face-to-face | same | 14 / 48 | 1,013 / 2,526 | .10 / .32 | −.02–.19 / .21–.34 | |
| Hierarchical / shared leadership | same | 59 / 75 | 4,227 / 4,379 | .33 / .27 | .24–.34 / .18–.28 | |
| Inter-task correlation of group scores | Riedl 2021 | 22 studies | 1,356 groups | r=.27 (.12–.50) | – | single factor; held-out task r=.40 (.26–.53) |
| Individual IQ → latent group-IQ | Bates & Gupta | 3 studies | 312 people | β≈.74–.76 | – | about 80–100% of c |

## 4 Answers

**(a) When do groups beat their best member, and are murmur's coding tasks such conditions?**
- Human-group conditions [memory/secondary]: an intellective task, a shared system for judging answers, recognisable correct solutions, complementary partial knowledge, and enough members (three to five in Laughlin's tasks), and often practice together.
- murmur's tasks are large, partially decomposable and judged by a hidden grader, so there is no shared recognition rule inside the run unless agents build one (their own tests). Information is not hidden in the Stasser–Titus sense at the start (all agents have identical model knowledge and the same folder), but it becomes distributed during the run (who read, ran or hit what). So the hidden-profile problem exists in murmur only for *acquired* information.
- Not a "eureka" task: the relevant human analogue is non-eureka collective work (additive contributions, where better coordination yields more), for which Riedl's text says "generate" and "execute" tasks are driven more by group process than by individual skill. This is a plausible fit and not a finding about coding.
- Net: beating the best member is a high bar; the realistic route is *weak-plus* synergy from parallel work on separable parts, which also needs coordination to avoid losses.

**(b) What predicts team performance most strongly?** In the meta-analyses, the largest corrected correlations for performance are about .4–.55: TMS (global) .47; cooperation-conditioned information sharing; uniqueness-type sharing .50; information elaboration .52 in communication; strategy formulation .35 and goal specification .34 among processes; team cognition .38. Composition variables are weaker (team GMA .27, personality ≤.12, diversity ≈0). On **objective** criteria all the process effects shrink by a third to a half (IS .21, cognition .31), except TMS global .47 which held up. The shrinkage matters because murmur's grader is objective.

**(c) Which mechanisms can a tool supply instead of training or familiarity?** The ones that are about *representations of the team's state*: who knows or has done what (TMS-as-directory), what has been shared and what has not (uniqueness), what was executed and with what outcome (a checkable fact), and who is still present (presence awareness; Espinosa's "mitigation" of distance, [secondary]). A tool can compute these exactly. The ones that need the human background (familiarity β=.30 in Marlow; training together in Liang et al.) are not available and are partly replaced by the tool's perfect logs.

**(d) Cost versus benefit of communication, curvilinear effects?**
- Benefit: quality of communication ρ=.36 and elaboration .52; frequency alone .19 with a credibility interval that includes negative values.
- Virtual (text-only) teams: ρ=.10, CI [−.02,.19]. That is the group closest to murmur's board.
- Cost: not measured by Marlow. Pappu et al. find a monotone dilution with size (2, 4, 8) in LLM teams. Marlow found no moderation by team size (β=−.08). An inverted U is plausible and suggested in primary studies, but no meta-analysis tests it. Treat "more messages is worse beyond a point" as a hypothesis, not a finding.

## 5 What transfers to LLM agents and what does not

| Mechanism | Needs from humans | LLM agents lack | LLM agents have that humans do not |
|---|---|---|---|
| TMS (who knows what) | Time together, repeated interaction, feedback on accuracy | No memory across runs, no history together | Perfect logs; a tool can compute "who touched/read/ran what" exactly; identical knowledge makes expertise differences come only from the run |
| Shared mental models | Training, familiarity, shared experience | The same | Identical model and prompt, so *compositional* agreement is high by construction; the DC&MM effect is larger for *compilational* team-level measures, which are tool-computable |
| Information sharing (uniqueness) | Motivation, discussion norms, cooperation | A tendency to repeat what is common (Pappu's integrative compromise suggests cluster-and-average); unclear whether the biased-sampling bias exists in LLMs | Costless posting; tools can show what is *not yet seen* by others |
| Teamwork processes (transition: mission analysis, goal, strategy) | A leader or an upfront planning meeting | Self-organised planning is rare in 12 simultaneous starters | Staggered entry lets late starters read a plan; processes can be exposed as shared files |
| Team monitoring and backup | Attentiveness, status | No implicit awareness of others' workload | The tool can show stalls and departures (murmur's team status) |
| Cross-checking (Hutchins) | Rehearsed procedure | Routine of verifying the other's setting | A tool can run the cross-check and show its result |

Interpersonal processes (conflict, motivating, affect; ρ .26–.34 with performance) have no counterpart in murmur because agents have no private stakes (consistent with the game-theory synthesis). Do not build for them.

## 6 Where the field disagrees or results are fragile

- **c factor:** whether a general group factor exists (Riedl, 22 studies) and whether it is more than individual ability (Bates & Gupta: ≈80–100% IQ; Credé & Howardson: statistical artifacts; the authors of Riedl concede that task choice drives the disagreement). A group-level c is not a safe basis for a lever.
- **Uniqueness vs openness:** MM&D's .50 vs .32 is partly design (manipulation on ad hoc teams vs self-report on intact teams). It may not be a conceptual effect.
- **Objective vs subjective criteria:** every headline is strongest on self-rated or decision-quality criteria and weakest on objective ones (MM&D .21 vs .51; DC&MM .31 vs .44). The grader murmur uses is objective.
- **Causality:** cognition–performance correlations are cross-sectional (DC&MM p. 49); reciprocal causation between cognition and performance is acknowledged in their text.
- **Meta-analytic hygiene:** MM&D report small k in many cells (k=2–8 for objective subgroups), and file-drawer N is large but their credibility intervals are wide (e.g., cooperation .16–.97). LePine's processes correlate .4–.87 with one another, so "which process matters" is not identified.
- **Larson's synergy conclusions:** not read; the existence of strong synergy in non-eureka tasks rests on a few laboratory findings by one group (Laughlin and colleagues) [memory].
- **LLM groups:** Pappu et al. use older models (Haiku 3.5, GPT-4o-mini) for the psychology tasks and a vote-after-discussion protocol. A different protocol (shared executable artifacts) may behave differently.

## 7 Levers

Filter: oracle-free, non-hierarchical, would exist in real work. Labels: information (what agents see), tool (what tools do), prompt (text). Ranked by how directly they act through the best-supported mechanism.

1. **Touch provenance in team status** (information). Per folder or file: who read, wrote or ran something there, and when; a compact "who has been where" index. This is TMS-as-directory computed by the tool (compilational, DC&MM ρ .44–.47). It adds read and run activity to the existing last-writer line. Oracle-free; exists in real work (blame, activity feeds). Measure: whether agents ask the board "who knows X" less, and whether posts addressed to a specific teammate become more accurate. Cost: modest, but touches `teamStatus`.
2. **Shared log of executed checks** (information or tool). Each agent's own test/command runs, exit codes and which files they covered, visible to the team (a CI-status analogue). It supplies Laughlin's "shared system for recognising a solution" and Hutchins' external representation with cross-checks, using only agents' own tests. **Realism-rule question for the main session:** this shows no task-provided oracle, but it does make agents' *own* checks a visible team artifact; whether that counts as "revealing correctness" depends on whether a test's pass/fail is allowed to be seen by others. It also overlaps with the existing departure-notice "executed facts" idea (E in the synthesis).
3. **Departure facts that are novel, not summary** (tool). At `done`, the tool appends what this agent touched that no one else has (files read or run only by it). Targets unique-information loss (uniqueness ρ=.50). Information-only; no extra prompt text.
4. **Unseen-by-others flag** (information). The status line marks files or folders that only one agent has read or edited. This is the uniqueness analogue (unique information pooled predicts quality, Lu et al. [secondary]) and a cheap hint about single points of knowledge.
5. **Structured post kinds** (tool, weak). MM&D's structure effect (uniqueness ρ .46 vs .34) came from instructions and formats; a tool-enforced field on posts (e.g., "found / need / claim") would be a structure. Evidence is thin (k=8 vs 14) and the human structure was facilitator-enforced; rank low.
6. **Prompt text asking for elaboration** (prompt text). Marlow's information elaboration ρ .52. Murmur's record says prompt text rarely moves behaviour, and Pappu et al. found deference prompts ineffective; do not build.

Mechanisms that **need a manager** (flag, do not build): a discussion facilitator who enforces structure (MM&D's structured discussion), a leader who sets mission, goals and strategy in advance (transition processes; shared leadership trails hierarchical in Marlow .27 vs .33, but both are positive), a Delphi-style aggregator, an assigned expert who the team defers to (Bonner/Pappu "reveal expert"), a priority queue set by a decision-maker (Malone's "managerial decision").

## 8 What not to build

- Anything for interpersonal processes (conflict management, affect management, motivation); no private stakes in murmur.
- Familiarity or training-together substitutes (a "warm-up" run, shared past logs); agents have no memory and the staggered entry already gives the late starters the log.
- A c-factor or "team intelligence" score to select configurations; the construct is disputed and may mostly track member ability.
- A frequency target for messages (more or fewer posts); Marlow shows frequency is the weak, noisy predictor and curvilinearity is untested.
- Expert-reveal or deference mechanics; Pappu shows telling LLM teams who the expert is barely helps, and it needs an assigned expert anyway.
- Anything that scores the *team's* knowledge against a ground truth (TMS accuracy needs a true expertise map); keep it descriptive (who touched what), never evaluative.

## 9 Three load-bearing claims, with exact locations to verify

1. **Uniqueness vs openness:** Mesmer-Magnus & DeChurch 2009, J Appl Psychol 94(2):535–546, **Table 2, p. 540**: IS–uniqueness ρ=.50 (k=25, N=1,490, 90% CI .40–.60) vs IS–openness ρ=.32 (k=19, N=1,295, CI .25–.39); the same table gives IS → objective measures ρ=.21 (k=8, N=498).
2. **Virtual teams:** Marlow et al. 2018, OBHDP 144:145–170, **Table 2, pp. 152–153**: virtuality row "Virtual" ρ=.10 (k=14, N=1,013, 95% CI −.02 to .19) vs face-to-face ρ=.32 (k=48, N=2,526); quality .36 vs frequency .19 in the same table, with footnote 1 (section 3.3) stating that curvilinearity was not tested.
3. **Compilational cognition on objective performance:** DeChurch & Mesmer-Magnus 2010, J Appl Psychol 95(1):32–53, **Table 6, p. 42**: TMS global → objective performance ρ=.47 (k=15, N=919, 90% CI .36–.58) vs compositional emergence → objective .26 (k=24, N=1,403). (My page numbers come from the running heads in the extracted text; the table number is certain.)

Also worth a fast check: the LePine values in section 2.3 come from a package data file, not the paper; Mathieu 2019 Table 2 reproduces all but goal specification (.32 vs .34).

## 10 Sources

Full text read:
- Mesmer-Magnus & DeChurch 2009: https://atlas.northwestern.edu/papers/information.pdf
- DeChurch & Mesmer-Magnus 2010: https://atlas.northwestern.edu/papers/underpinningsTeamwork.pdf
- Marlow et al. 2018 (highlighted copy): https://psychiatry.ucsd.edu/research/programs-centers/instep/tools-resource/Marlow-et-al.-2018_highlighted.pdf
- Mathieu et al. 2019: https://psychiatry.ucsd.edu/research/programs-centers/instep/tools-resource/Mathieu-et-al-2019-Review-of-TER.pdf
- Stasser & Titus 1985: https://www.uni-muenster.de/imperia/md/content/psyifp/aeechterhoff/vorlesungkommunikation/stasser_titus_unsharedinfogroupdisc_jpsp1985.pdf
- Riedl et al. 2021: https://pmc.ncbi.nlm.nih.gov/articles/PMC8166150/
- Bates & Gupta: https://www.gwern.net/doc/iq/2016-bates.pdf
- Hutchins 1995: https://courses.ischool.berkeley.edu/i290-3/s05/papers/How_a_cockpit_remembers_its_speeds.pdf
- Malone & Crowston 1994: https://crowston.syr.edu/sites/default/files/acmcs94.pdf
- Pappu et al. 2026: https://arxiv.org/pdf/2602.01011
- LePine data (R package `configural`, dataset `team`): https://cran.r-project.org/src/contrib/configural_0.1.5.tar.gz; documentation https://search.r-project.org/CRAN/refmans/configural/html/team.html
- Dinh et al. 2021 (definitions of Marks taxonomy): https://www.frontiersin.org/journals/communication/articles/10.3389/fcomm.2021.617928/pdf

Abstract or summary only (not full text):
- Larson 2010 (book description): https://mail.jlarson4.sites.luc.edu/research/abstracts/abs10.html
- Lu, Yuan & McLeod 2012: https://journals.sagepub.com/doi/10.1177/1088868311417243
- LePine et al. 2008: https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1744-6570.2008.00114.x
- Credé & Howardson 2017: https://www.sciencedaily.com/releases/2017/10/171017124354.htm (press summary)
- Espinosa et al. 2007: https://jmis-web.org/articles/324; ICIS 2002 version https://aisel.aisnet.org/icis2002/39
- Hannay et al. 2009: https://www.simula.no/research/effectiveness-pair-programming-meta-analysis
- Laughlin et al. 2006: https://www.bps.org.uk/research-digest/three-person-groups-best-problem-solving (summary)
- Ren & Argote 2011: https://experts.umn.edu/en/publications/transactive-memory-systems-1985-2010-an-integrative-framework-of-/
- Moreland & Myaskovsky 2000: https://ideas.repec.org/a/eee/jobhdp/v82y2000i1p117-133.html
- Bachrach et al. 2019 (TMS meta-analysis): https://academicnewsletter.sufe.edu.cn/info/369906

Not retrieved (memory only): Woolley et al. 2010, Hill 1982, Laughlin & Ellis 1986, Laughlin 2011, Steiner 1972, Wegner 1987, Lewis 2003, Rico et al. 2008, Endsley 1995, Mohammed et al. 2010, Marks et al. 2001.
