# Human groups, organisations and biological collectives: what transfers to murmur

Model-written literature review (subagent), 2026-10-04. Labels: [verified] read in primary source; [secondary] otherwise.

Scope: human and biological science only. LLM selection, stigmergy/blackboards, network structure (Lazer & Friedman, Hong-Page), stopping and heterogeneity are covered by other reviews; the 2026-10-01 incident note is not repeated. Honest provenance: only two sources were actually opened (Lorenz et al. 2011 on PMC; Ward et al. 2008 on PMC). Everything else comes from search-result abstracts and snippets, so is [secondary]. No numbers below were invented; where I lack a figure I say so.

## 0. Frame: what kind of task is a coding/optimisation run?

Steiner (1972) [secondary]: actual productivity = potential productivity minus process loss; process loss splits into coordination loss and motivation loss. Task types: additive (contributions sum), conjunctive (needs all members), disjunctive (best member decides), plus divisible vs unitary.
- A single-file or single-solution task with no oracle is **unitary and disjunctive-or-compensatory**: the group result is only as good as the best attempt (or the selection of it). Potential productivity of N agents is at most that of the best one, so every extra agent can only add process loss (tokens on talk, convergence) and cannot add output. This directly predicts "persistent single agent ties or beats swarms at equal spend" and "n=2 > n=3 > n=10".
- A multi-module task is **divisible and conjunctive** (every module must exist and fit). Here conjunctive tasks are dominated by the weakest member/hole, which matches "modules nobody wrote". Group potential is higher but the failure mode is gaps, not poor quality.
- Consequence for design: the swarm can only win on divisible-conjunctive tasks (coverage) or on disjunctive tasks where selection among diverse attempts beats one attempt's variance. On a unitary task with a strong persistent single agent, the theory predicts no gain. Which of the two a benchmark task is should be recorded per task.
- Caveat: Steiner's framework was built for humans with fixed capacity; an LLM agent's "capacity" is mostly tokens and persistence, which the clock changes. The single agent with a clock (C1T) is the right potential-productivity baseline.

## 1. Social loafing and the Collective Effort Model

- Evidence: Karau & Williams 1993, meta-analysis of 78 studies, J. Personality and Social Psychology [secondary]. Loafing is "moderate in magnitude and generalizable across tasks and subject populations". Moderators with strong influence: evaluation potential, expectation of co-worker performance, task meaningfulness (also culture, gender). Loafing shrinks when individual evaluation potential is the same in individual and collective conditions (i.e. when contributions are identifiable). Loafing is larger on simple tasks than on complex or intrinsically involving ones.
- CEM mechanism [secondary]: effort = expectancy that effort improves group performance x instrumentality of group performance for group outcome x value of the outcome to me. Redundant contributors (high expectation that others will cover) lower expected instrumentality.
- Explains: "X owns the file, I'll review instead" (low perceived instrumentality of own work when a teammate is already doing it); modules nobody wrote (everyone expects someone else); tie to staggering (an early agent has high unique contribution).
- Lever (oracle-free, non-hierarchical): (a) **Identifiable contribution**: each agent's briefing says its final state is attributed per agent in the board/log (a per-agent ledger of files it authored and checks it ran is shown to all). Cheap: a generated line, no grader. (b) **Unique-contribution framing**: "if you do not write module M, nobody will" is a hierarchy-free claim-gap list: a shared list of unclaimed required artefacts (derived from the task text by the agents themselves, not by an orchestrator). (c) **Pessimistic expectation line**: tell each agent that teammates may stop early so it should not assume coverage. Test each against C1T (one agent, clock, tokens-left line) at equal tokens.
- Oracle needed: no.
- Caveats: LLMs have no ego, evaluation apprehension, or fatigue; what transfers is the expectancy structure (the prompt makes others' work salient). Identifiability matters for humans through reputation; for LLMs it only works if the prompt text can make "being judged" credible, and that risks becoming a lab-only grading hint (see AGENTS.md "no grading hints"). Prefer ledger-style visibility over any statement about grading.

## 2. Ringelmann effect, diffusion of responsibility, bystander effect

- Ringelmann (1880s data, rediscovered by Kravitz & Martin 1986) [secondary]: rope-pulling groups of 3 reached about 85% and groups of 8 about 37% of summed individual capacity; Ringelmann already separated coordination from motivation loss. Later work (Latané) separated them experimentally; I did not retrieve that source.
- Diffusion of responsibility is the classic bystander mechanism; in murmur "two agents each waiting for the other" is the mutual-yield version.
- LLM evidence [secondary, preprints, unreviewed here]: "The Bystander Effect in Multi-Agent Reasoning: Quantifying Cognitive Loafing" (arXiv 2605.10698, May 2026) reports that multi-agent setups induce cognitive loafing: models compute a correct derivation then defer sycophantically to a simulated swarm; effect stronger with same-family agents. "Unlocking the Power of Multi-Agent LLM for Reasoning: From Lazy Agents to Deliberation" (arXiv 2511.02303, ICLR 2026) [secondary] shows the "lazy agent" problem in a two-role setup: one agent dominates, the other copies or outputs blanks, collapsing to a single agent. Both are role-structured or simulated-swarm settings, not free shared-folder coding, but the pattern matches murmur's yielding.
- Lever: **explicit trigger for self-assignment**: a rule that a stated claim must be followed by an artefact within K calls, or the claim lapses (claim expiry). This is a scheduled, non-hierarchical mutual-yield breaker (the human analogue is a lease). No oracle. Cost: one timer.
- Caveat: yielding in LLMs is partly politeness/sycophancy trained in, so it may be fixable by prompt more than by structure.

## 3. Brainstorming: nominal groups, production blocking, brainwriting

- Evidence: Mullen, Johnson & Salas 1991 meta-analysis [secondary]: nominal (isolated, pooled afterwards) groups outperform interacting groups, more so for larger groups and when ideas are spoken rather than written. Diehl & Stroebe 1987 [secondary]: four experiments testing free riding, evaluation apprehension, production blocking; blocking (only one person can speak at a time, so ideas are forgotten or suppressed) explained most of the loss; evaluation apprehension weakly supported.
- Mechanism and murmur mapping: production blocking in LLM terms is **context blocking**: reading a teammate's board turns displaces own working memory/plan and anchors it. Free discussion boards eating 31-62% of tokens is the transcript of blocking. Convergence on the same approach is the anchoring half.
- Matches the old finding that independent attempts plus selection beat shared-folder collaboration.
- Lever: **nominal-group phases with write-only boards**: phase 1 each agent works privately (own branch/folder, no reading others) for a budget fraction; phase 2 reveal and pool; phase 3 one agent (or each agent, then majority) integrates. This already exists as "parallel private attempts"; the new element from brainwriting is the **write-then-read rotation** (each agent reads one peer's entry at a time, adds to it, passes on) which keeps the nominal advantage while allowing cross-fertilisation. Test arm: nominal + one reveal round vs nominal only vs C1T. Selection without an oracle is the open problem (other reviews cover verifiers); a quorum rule (section 6) is one oracle-free selector.
- Caveat: the human nominal-group advantage is counted in the number of ideas, an additive-ish measure. For a single deliverable the pooled output must be one artefact, so the advantage depends entirely on the selector. This is why "nominal + selection" ties a strong single agent: the best of k attempts only beats one persistent attempt if variance is high and selection is good.

## 4. Hidden profiles

- Stasser & Titus 1985 [secondary]; Lu, Yuan & McLeod 2012 meta-analysis, Personality and Social Psychology Review, 65 studies, 101 effects, 3,189 groups [secondary]: groups discuss shared information, fail to pool unshared information, rarely discover hidden profiles. Mesmer-Magnus & DeChurch 2009 [secondary] (72 studies, 4,795 groups): information sharing predicts performance, and the benefit is largest when what is shared is unique information; discussion structure, task demonstrability and cooperation increased sharing, while redundancy and heterogeneity of information distribution moderated it.
- Mapping: identical agents in a shared folder hold almost no unique information (same model, same files), so the hidden-profile problem mostly does not exist, but the **bias to rehearse shared information** does: board talk repeats what everyone already knows. Unique information in murmur is what only one agent has actually executed or discovered by running code.
- Lever: **post only non-redundant observations**: a board tool that posts command output (evidence) and rejects messages that are near-duplicates of existing board content or that contain no new run result. The `finding(text, command)` tool already attaches evidence; the new piece is a novelty filter. Non-hierarchical, oracle-free (the evidence is execution output, not correctness). Cost: small.
- Caveat: with identical agents the pooling gain is limited; the stronger lever is giving agents different private information by construction (heterogeneity, covered elsewhere).

## 5. Herding, cascades, dissent, devil's advocate

- Lorenz, Rauhut, Schweitzer & Helbing 2011, PNAS [verified, read on PMC]: 144 participants, 12 sessions, estimation tasks repeated five times, no-information vs aggregated vs full information of others' estimates. Social influence strongly reduced diversity without improving collective accuracy ("the collective error changes only slightly"), moved the truth toward the edge of the estimate range, and substantially raised individual confidence. Three effects: social influence, range reduction, confidence.
- Mapping: exactly the signature of agents converging on the same approach while feeling surer. The confidence effect explains early stopping after a teammate agrees ("a teammate does not make it keep going" may actually be: agreement raises confidence that it is done).
- Dissent literature [secondary, snippets only]: authentic minority dissent improves information processing and decision quality more than role-played devil's advocacy; devil's advocacy has some benefits in heterogeneous groups; minority dissent triggers divergent thinking, majority dissent convergent thinking (Nemeth tradition, Schulz-Hardt and colleagues, Greitemeyer et al.). I did not retrieve effect sizes. LLM conformity: BenchForm (ICLR 2025, "Do as We Do, Not as You Think") [secondary] reports conformity in LLM multi-agent systems driven by interaction time and majority size, mitigated by personas and reflection.
- Levers: (a) **Independence-before-exposure**: an agent must commit its approach in a short private note before it may read the board (a commit-then-reveal step, the Delphi/prediction-market remedy). (b) **Authentic dissent by construction**: not a role assignment (forbidden) but a menu item "contrarian attempt" that agents may self-select, and a rule that a second agent who picks the same approach as an existing claim must differ in a stated way. Since the dissent literature says contrived dissent is weaker than authentic dissent, prefer enforcing divergent private attempts (genuinely different solutions) over assigning a critic. (c) **Suppress agreement signals** (no "LGTM"-type board posts count toward finishing), because agreement is what raises confidence without accuracy.
- Oracle: none. Caveat: LLM agents of the same model share priors, so independent attempts are less independent than human ones, which caps the benefit of nominal diversity (and strengthens the case for explicit divergence rules).

## 6. Delphi and the Nominal Group Technique

- Rowe & Wright review [secondary]: Delphi groups outperformed statistical groups in 12 studies to 2 (2 ties) and interacting groups in 5 to 1 (2 ties), but no consistent evidence of superiority over other structured procedures; laboratory Delphi differs from the original concept; recommend analysing judgement change within nominal groups.
- Mechanism: anonymous independent first round, controlled feedback of group aggregate and reasons, revise independently. It removes blocking, status and anchoring-by-speaker while keeping information exchange.
- Lever: **Delphi rounds for murmur**: round 1 private attempts; round 2 each agent sees only a digest (not the dialogue) of the others' approaches and results, then revises its own attempt; no further talk; finish by a quorum (below). Digest by a script, not an agent (no hierarchy). Compare with free board at equal tokens and with C1T.

## 7. Collective intelligence factor

- Woolley et al. 2010 [secondary]: a general factor c across group tasks, associated with equal conversational turn-taking, social sensitivity, share of women. Critiques: Bates & Gupta 2016 (three studies, 312 people; individual IQ explained more than Woolley reported); a two-meta-analysis comparison "g versus c" (Cognitive Research 2021) found a moderate correlation of .26 (95% CI .10 to .40) for c's predictive value over eight samples with 857 groups, and about 80% of studies underpowered; comments by Credé & Howardson on the structure of task performance [all secondary].
- Evidence strength: weak and contested. Transfers poorly: social sensitivity is irrelevant for LLM agents. Only the turn-taking-equality claim has a murmur reading: not letting one agent dominate the board. That conflicts with our own finding that early agent claims core. I recommend not building on c.

## 8. Team size, coordination cost, Brooks's law, Hackman

- Brooks's law and quadratic communication paths (n(n-1)/2, e.g. 28 for 8) [secondary, popular summaries]; software-engineering literature broadly finds average productivity falls with team size, with 3-9 often cited as productive (an empirical Software Engineering paper is in the search results; I did not open it). Hackman: problems rise sharply with team size [secondary, quoted second-hand]; Hackman's conditions (real team, compelling direction, enabling structure, supportive context, coaching) were not retrieved from primary text.
- Explains n=2 > n=3 > n=10 directly: board turns scale with paths, not with work. Rather than adding agents, murmur could cap *channels* not agents: the board visible to each agent restricted to k peers (network structure is another reviewer's topic).
- Lever: none new beyond n=2 as default; the useful translation of "enabling structure" is a short shared written intent (see section 11).

## 9. Biology

Honeybee nest-site selection (Seeley, Visscher) [secondary; Cornell press release and a model paper]: scouts explore independently, advertise quality through dance duration (so quality-weighted recruitment without any scout comparing sites), stop signals provide cross-inhibition between supporters of different sites, and the swarm commits when a **quorum** (about 75 scouts at the site in the cited source) is present there. Strengths: evidence is experimental and replicated over decades, but the decision is among a few physical options with a measurable quality.
- Mapping: honeybee = nominal phase (independent scouts), amplification proportional to self-assessed quality, cross-inhibition, quorum commit. Murmur's analogue: attempts each report a self-estimated quality *and the basis* (evidence they ran); an attempt becomes the deliverable only when at least q agents have independently verified it (ran it and posted evidence), not when the author says it is done. The **stop signal** analogue: an agent that found a concrete defect in attempt A posts a pointed "stop A" with a reproducing command; enough stops freeze A.
- Ward et al. 2008, PNAS, sticklebacks [verified, read on PMC]: the probability of acting rises non-linearly with the number of others acting (reported steepness parameter about 3.2); a single replica influenced solitary fish but was largely ignored by groups of 4 or 8, and a second replica was needed to sway them; model results say quorum responses improve accuracy and let larger groups be as fast as small ones without losing accuracy, and that this depends on the non-linear response.
- Mapping to "done": early stopping is a single-agent threshold problem; a quorum-of-two rule for finishing (done only after another agent independently posts a run) is the human analogue of the fish rule. The risk: the Lorenz results say agreement can inflate confidence without adding accuracy, so the second voter must verify by execution, not by reading.
- Ants (Gordon; Pinter-Wollman; Robinson; Danesh et al.) [secondary]: response-threshold models (individuals begin a task when stimulus exceeds a personal threshold), reserves of idle or "walker" workers who respond to demand changes, and "foraging for work" when idle. Mapping: the **idle reserve** is the late-entering agent (staggered entry finding); the **threshold** is a stimulus the agents themselves can see, such as tokens-left and an unclaimed-artefact count, so an agent joins a task when its own threshold is crossed. Variation of thresholds between identical agents could be injected by randomised thresholds in the briefing (heterogeneity of thresholds is what stabilises division of labour in these models; transfer to LLMs unproven).
- "Many wrongs" (Simons 2004; Codling, Pitchford & Simpson 2007; Faria et al. 2009 in human crowds) [secondary; I could not retrieve the Simons paper itself, only follow-ups]: averaging independent noisy directional estimates cancels error. Valid only when errors are independent and unbiased, and when the output is an average. Code is not averageable; this does not transfer except for numeric outputs (parameters, scores).
- Immune system, slime mould: I did not search these. Clonal selection (diversify, select by affinity, amplify) is the same shape as the honeybee loop; slime-mould network optimisation is better covered by the adjacent-fields review. Not reported.

## 10. Organisation design without bosses

- Mission command / Auftragstaktik [secondary]: intent plus disciplined initiative; subordinates act within a stated purpose, method and end state. Shattuck's West Point work studied how commanders write intent and whether subordinates understood it (details not retrieved). It presupposes a commander, so only the *intent statement* transfers: a short shared purpose-and-end-state text that the task author (not an agent-orchestrator) writes in the task file.
- Holacracy/sociocracy, Hayek prices, contract net: I found no usable evidence in this session and I will not make claims. Contract net and market allocation are covered by the computational-fields review.

## 11. Mapping table

| Finding in murmur | Human / bio mechanism | Strength of source | Lever |
|---|---|---|---|
| Single agent ties or beats swarm | Process loss on unitary, disjunctive task (Steiner) | Classic theory, secondary | Treat task type as a covariate; test only on divisible tasks |
| Smaller is better | Coordination loss, Brooks, Hackman | Broad but weak causal | Default n=2, cap board channels |
| Board eats tokens | Production blocking | Meta-analysis (Mullen), experiment (Diehl & Stroebe) | Write-only phases, Delphi digest |
| Same approach | Social influence, range reduction (Lorenz) | Verified primary | Commit-then-reveal, divergent private attempts |
| Yielding | CEM expectancy, bystander | Meta-analysis (Karau & Williams) + preprints | Claim lease/expiry, identifiable ledger |
| Early stop | Confidence from agreement (Lorenz); fish quorum | Verified primary | Quorum-of-verifiers for done |
| Staggering helps | Ant idle reserve, scouts then followers | Secondary | Keep staggering; threshold-based entry |

## 12. Top levers (oracle-free, non-hierarchical)

1. **Execution-quorum finish.** An agent may stop only when q others (q=1 for n=2) have each posted a command run on the artefact, with its raw output, after the last change. Not keyed to any task check. Predicts: fewer early stops, because agreement-without-running does not count. Compare with C1T at equal tokens. Cost: small, a counter in `board.ts`.
2. **Commit-then-reveal Delphi (two rounds).** Private attempt, then a script-made digest of peers' approaches (no dialogue), one revision round, then quorum finish. Predicts: removes blocking and anchoring while keeping selection. Cost: no board talk, so cheaper than free board. Needs an oracle-free selector, so pair with lever 1.
3. **Claim lease with expiry and a visible ledger.** Claims lapse unless an artefact lands within K calls; ledger of who wrote what shown to everyone. Targets yielding, unwritten modules and mutual waits. Cost: small.

## 13. Open doubts

- Almost all the cited human effect sizes are from secondary sources here; any lever's expected size is a guess.
- Identical agents share priors: independence and diversity assumptions from human nominal groups are weaker.
- Quorum plus agreement may hit the Lorenz confidence effect if the verifier reads instead of executing.
- "Identifiable and separately evaluated" may drift into grading hints, which AGENTS.md forbids.
- The per-task Steiner type is a hypothesis; no check yet whether the benchmark tasks are divisible.

## Sources

| Claim | Source | URL | Status |
|---|---|---|---|
| Social loafing CEM, 78 studies | Karau & Williams 1993 (JPSP) via summaries | https://en.wikipedia.org/wiki/Social_loafing | secondary |
| Nominal vs interacting groups | Mullen, Johnson & Salas 1991 | https://scrapbox.io/nishio-en/Productivity_Loss_in_Brainstorming_Groups:_A_Meta-Analytic_Integration | secondary |
| Blocking, apprehension, free riding | Diehl & Stroebe 1987 | https://homepages.se.edu/cvonbergen/files/2013/01/Productivity-Loss-In-Brainstorming_Toward-the-Solution-of-a-Riddle.pdf | secondary (snippet) |
| Hidden profiles meta-analysis | Lu, Yuan & McLeod 2012 | https://journals.sagepub.com/doi/10.1177/1088868311417243 | secondary |
| Info sharing meta-analysis | Mesmer-Magnus & DeChurch 2009 | https://stars.library.ucf.edu/scopus2000/12034 | secondary |
| Social influence undermines crowd wisdom | Lorenz et al. 2011 PNAS | https://pmc.ncbi.nlm.nih.gov/articles/PMC3107299 | verified |
| Fish quorum | Ward et al. 2008 PNAS | https://pmc.ncbi.nlm.nih.gov/articles/PMC2383955 | verified |
| Honeybee quorum, cross-inhibition | Seeley & Visscher, press and model | https://www.news.cornell.edu/stories/2006/04/honeybee-decision-making-ability-rivals-any-department-committee ; https://ar5iv.arxiv.org/html/1611.07575 | secondary |
| Ant task allocation | Gordon, Robinson et al. | https://pmc.ncbi.nlm.nih.gov/articles/PMC2817103 | secondary |
| Delphi evidence | Rowe & Wright | https://iaorifors.com/paper/29874 ; https://iaorifors.com/paper/5495 | secondary |
| c factor critique | Bates & Gupta; g vs c meta-analyses | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8019454/ | secondary |
| Authentic vs contrived dissent | Greitemeyer, Schulz-Hardt, Frey | https://www.psych.uni-goettingen.de/de/ecosop/publikationen/publications-folder/greitemeyer-et-al-2009b | secondary |
| Steiner, Ringelmann | Steiner 1972; Kravitz & Martin 1986 | https://en.wikipedia.org/wiki/Steiner%27s_Taxonomy_of_Tasks ; https://mason.gmu.edu/~dkravitz/Pubs/JPSPv50p936.htm | secondary |
| Brooks/team size | various | https://umbrex.com/resources/frameworks/organization-frameworks/brooks-law/ | secondary |
| LLM conformity | BenchForm, ICLR 2025 | https://arxiv.org/pdf/2501.13381 | secondary |
| LLM lazy agent | ICLR 2026 | https://arxiv.org/html/2511.02303v1 | secondary |
| LLM bystander effect | arXiv 2605.10698 | https://arxiv.org/abs/2605.10698 | secondary, preprint |
| Mission command | Shattuck; various | https://apps.dtic.mil/sti/pdfs/ADA599111.pdf | secondary |
| Many wrongs | Codling et al. 2007; Faria et al. 2009 | https://catalog.comses.net/publications/95138 | secondary |
