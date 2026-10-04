Model-written literature review (subagent), 2026-10-04. Labels: [verified] read in primary source; [secondary] otherwise.

# Decentralized and non-hierarchical coordination: theory and evidence mapped to murmur levers

Scope: swarm intelligence, blackboards, network structure and collective search, self-organizing LLM systems, evolutionary islands, human software teams, contract-net. For each: evidence, fit with the non-hierarchy rule, oracle dependence, which murmur finding it explains, and one lever to test against C1T (one agent with the clock and tokens-left line). I skimmed the repo's lever list in `src/profile.ts` (clock, clockTokens, spawnGapSeconds, spawnAfterTurns, roles, delivery, notices, claimLease, staleGuard, relay, findings, threads, taskList, branches) so that proposals do not duplicate existing levers.

Reading note: "verified" here means I read the arXiv abstract page or a primary-source summary page, not always the full paper. Numbers beyond the abstract are marked [secondary]. OpenAI-incident material is not repeated (see 2026-10-02 reports).

## 1. Short version

1. The best-supported negative result for murmur comes from industry, not theory: Cursor's flat, self-coordinating agents (shared file, locks, then optimistic concurrency) became risk-averse and churned; they moved to planners/workers [verified, Cursor blog]. That matches murmur's yielding ("X owns the file, I'll review") and "modules nobody wrote". But it is a statement about *hard tasks needing someone to own them*, and the fix Cursor chose is hierarchical, which murmur cannot use. The non-hierarchical analogue is *self-claimed ownership of a whole outcome* (stagger already does this).
2. Network-structure theory predicts murmur's "less communication is better for hard problems" only conditionally: Barkoczi and Galesic show the sign flips with the social learning rule (copy-the-best favours sparse networks; conformity favours dense ones) [verified, PMC]. LLM agents mostly copy the visible solution (conformity/herding), so the board is a strong homogenizer. This is a mechanism for "everyone converges on the same approach" and for "more agents is worse at fixed budget".
3. LLM debate literature independently shows sycophancy and conformity: agents flip from right to wrong under peer pressure and debate can go below single-agent baselines [verified abstract, 2509.23055; secondary for 2509.05396]. Explains why a free board (31–62% tokens on coordination turns) does not add information.
4. Stigmergy (coordination through the artefact, not messages) is the theory that fits murmur's shared folder, and the one with an active 2026 LLM literature. But the strongest LLM stigmergy result I found (pressure fields, 4× over conversation) depends on a measurable quality signal, i.e. an oracle [verified abstract]. Without one, stigmergy reduces to "what the files look like", which murmur already has.
5. Evolutionary islands (FunSearch, AlphaEvolve, ShinkaEvolve) are the cleanest non-hierarchical sharing scheme, with isolation plus rare migration, but every one needs a fitness function [verified]. Their transferable idea is *isolation then rare exchange*, which murmur has no lever for except branches.
6. Response-threshold models (Bonabeau/Theraulaz) predict division of labour from heterogeneous thresholds, not from assignment. In murmur, agents are identical (same model, same prompt), so thresholds are identical: all enter, all pick "builder". Stagger works plausibly because it creates heterogeneity in *state* (stimulus already reduced by the first agent), which is exactly what threshold models say produces specialization [reasoning, not tested].
7. Blackboard LLM papers exist and claim wins, but the winning designs have a central agent posting requests (2510.01285) or a controller selecting the next agent (2507.01701), so they are not non-hierarchical in murmur's sense, and their benchmarks are QA/data-discovery, not shared-codebase building [verified abstracts].
8. Contract-net and market mechanisms are self-selection with an announcer; murmur's task list is the nearest equivalent and was barely used. Evidence that agents will not use an optional mechanism is itself in line with MAST ("specification issues", "inter-agent misalignment") [secondary].

## 2. Swarm intelligence and stigmergy

**Idea.** Grassé's stigmergy: work leaves traces in the environment that trigger the next worker's action (termite building). Pheromone decay prevents lock-in on stale trails. Heylighen generalizes it to "a universal coordination mechanism" for open-access communities; Elliott's thesis frames wiki and open source as stigmergic collaboration, where "work-in-progress" lists direct contributors to where they are most useful [secondary: p2pfoundation summaries of Heylighen and Elliott; I did not read the primary texts].

**Evidence strength.** Strong in biology and in descriptive studies of Wikipedia/open source; descriptive, not causal, for software. For LLM agents: SwarmWorld (arXiv 2608.26081) reports agents spontaneously splitting into explorers/builders/caretakers and spreading technology by "walking past what another had built" [secondary: search snippet and a blog]; Rodriguez, "Emergent Coordination via Pressure Fields and Temporal Decay" (arXiv 2601.08129) reports 4× the solve rate of conversation-based coordination and over 30× that of hierarchical control on meeting-room scheduling, 1350 trials [verified abstract page via search listing]; CodeCRDT (arXiv 2510.18893) lets agents observe shared state with CRDTs and finds up to 21.1% speedup on some tasks and up to 39.4% slowdown on others, 600 trials, 5–10% semantic conflicts [verified abstract].

**Fit with the non-hierarchy rule.** Perfect. No assigner, no roles.

**Oracle.** Pressure fields: yes, agents act on "measurable quality signals" of the artefact, so this is an oracle design [verified]. Temporal decay is oracle-free in itself (it only discounts old claims), but the paper pairs it with a gradient. CodeCRDT: no oracle; it only provides conflict-free merging.

**Explains / contradicts.** Explains why notices of teammates' edits did not help: they are a message layer, not a trace that changes what is attractive to do next. Explains CodeCRDT-style task dependence: murmur gains only on decomposable tasks. Suggests that murmur's "claims block other agents' write/edit and lapse after N seconds" (claimLease) is a pheromone-with-decay mechanism that was tried via file locks and did not help; Cursor saw the same (locks held too long, 20 agents at the throughput of 2–3) [verified, Cursor].

**Lever (cost).** "Decaying claim marker": a one-line file header or a status file the agent updates ("working on X, started T"), with murmur only appending an age-discounted summary of stale markers to tool results. Mostly overlaps with claimLease and taskList; the new part is *decay without blocking*. Cost: about 40 lines, no new tools. Oracle-free. Expected effect small; I would not prioritize it.

## 3. Response-threshold models and quorum sensing

**Idea.** Bonabeau, Theraulaz and Deneubourg (1998): each individual has a threshold for each task-stimulus; low-threshold individuals respond first, and their work lowers the stimulus for the others, producing division of labour without assignment. Response-threshold reinforcement (Theraulaz, Bonabeau, Deneubourg 1998, Proc. R. Soc. B) lets thresholds drift with experience, producing specialization [verified: existence and gist via search listing; I did not read the models in full]. Quorum sensing: a collective switch when enough individuals signal [secondary, standard biology].

**Evidence strength.** Strong as models; moderate in ants; none for LLM agents.

**Fit.** Perfect: thresholds are individual, nothing is assigned. Murmur's role menu ("pick yourself") is a primitive threshold model, but with identical agents it fails: picks happen before reading, everyone picks "builder" (murmur finding).

**Oracle.** No, if the stimulus is something agents can measure themselves (an unclaimed module, a stale TODO, how many agents already work on a file).

**Explains.** Stagger: the second agent arrives when the first has already lowered the "core" stimulus, so it validates instead. It also predicts that stagger gains require *visible* depletion of the stimulus, which is why file-presence and claims matter more than messages. Explains role-menu failure: identical thresholds, simultaneous start, no state to differentiate on. Also explains "yielding": a high-threshold response to someone else's claimed file.

**Lever (cost).** Role menu *after* a delay: an agent picks a role only after its first N turns of reading the folder, and the menu text lists what is currently unclaimed or untouched (derived from files, not assigned). Variation of existing `roles` plus a readiness gate. Cost: small. Oracle-free. Honest caveat: the staggered arm already gives most of this.

## 4. Blackboard architectures

**Idea.** Hearsay-II (Erman et al., 1980): independent knowledge sources read and write a shared blackboard; a scheduler picks the next to run from the blackboard state [verified via ACM/AAAI listings; I did not read the full text]. Contract Net (Smith, 1980): a node announces a task, others bid, the announcer awards; control is distributed but each task has an announcer [verified listing].

**LLM revivals (2025).**
- Han and Zhang, "Exploring Advanced LLM Multi-Agent Systems Based on Blackboard Architecture", arXiv 2507.01701: agents with roles share all information on a blackboard; a controller selects who acts next based on blackboard content; best average performance among baselines at fewer tokens; commonsense, reasoning, maths benchmarks [verified abstract page].
- Salemi et al. (Google), "LLM-Based Multi-Agent Blackboard System for Information Discovery in Data Science", arXiv 2510.01285: a *central agent* posts requests, subordinate agents volunteer; 13–57% relative end-to-end gains over baselines on KramaBench, modified DSBench, modified DA-Code [verified abstract page].

**Fit.** Partial. Both keep a central agent or a scheduler. Volunteering by capability is murmur-compatible; the central request-poster and the controller are not.

**Oracle.** Not required by the designs, but benchmarks have answers; their tasks are read-only information discovery, where parallel volunteers do not collide in a shared file. Murmur's collisions come from concurrent *writes*.

**Explains / contradicts.** Does not contradict murmur's "board does not help": those papers compare against weak multi-agent baselines, not a persistent single agent at equal spend. Explains why the board consumes tokens: in a blackboard architecture someone must *read and select* what is relevant; murmur has no scheduler, so every agent pays for reading everything (31–62% of tokens).

**Lever (cost).** "Pull-only, typed board": the board is a structured set of short entries (claim / artefact-ready / blocker) read on demand, not pushed. This is largely `delivery: "pull"` plus tools; it was in effect tested. I do not recommend a new arm.

## 5. Network structure and collective problem solving

**Lazer and Friedman (2007, ASQ 52(4):667–694).** Agent-based simulation: efficient networks spread information fast and win in the short run but lose in the long run on complex problems; inefficient (sparser) networks preserve diversity and explore more; at intermediate times there is an inverted U between connectedness and performance [verified via search summary; not the full paper].

**Mason, Jones and Goldstone (2008, JEP:General 137:422–433).** Human experiments: the best network depends on the landscape; clustered networks do better for problems needing broad exploration, long-range networks for less exploratory ones [verified via search summary]. I could not verify a Mason–Watts 2012 PNAS paper under the title I was given; do not cite it without checking.

**Barkoczi and Galesic (2016, Nat. Commun. 7:13109).** Reconcile the two: with *conformity* (copy the most frequent solution) efficient networks win; with *copy-the-best* inefficient networks win; for complex tasks small-sample conformity does well because noise preserves exploration; simulation of 100 agents, NK landscapes, 10 network structures, 200 steps [verified, PMC page].

**Hong and Page (2004, PNAS).** "Diverse beats best" theorem; Thompson (2014) argues the proof is flawed and the result does not generalize [verified listing; I did not read Thompson]. Treat diversity benefits as conditional on how agents' search heuristics actually differ.

**Wisdom of crowds / independence.** Aggregation helps only with independent errors; herding destroys it [secondary, standard result].

**LLM-specific.** Wynn et al., "Talk Isn't Always Cheap" (arXiv 2509.05396): debate can lower accuracy, including when stronger models outnumber weaker; models flip from right to wrong under peer reasoning [secondary: search summary]. Yao et al., "Peacemaker or Troublemaker" (arXiv 2509.23055): sycophancy collapses debate into premature consensus and can score below single-agent baselines; both centralized and decentralized debate [verified abstract page]. Kim et al. (Google/MIT, arXiv 2512.08296): 260 configurations, five architectures, six benchmarks; gains from +80.8% on decomposable financial reasoning to −70.0% on sequential planning; diminishing returns once the single-agent baseline is strong [verified abstract]; "independent agents amplify errors 17.2×, centralized 4.4×" and "sequential tasks degrade 39–70% for every multi-agent variant" [secondary: blog summaries; not found in the abstract].

**Fit.** Descriptive theory, not a mechanism to add. It tells murmur what to *remove*: fewer, later, lower-bandwidth channels.

**Oracle.** The simulations use a payoff to copy "the best", i.e. an oracle. In murmur, "copy the best" has no oracle; agents therefore fall back on conformity (copy the visible, most-repeated approach), which is the setting where *dense* networks help on simple tasks and hurt on rugged landscapes only if the sample is large. A free board is large-sample conformity.

**Explains.** (a) Everyone converging on the same approach: conformity without an oracle. (b) Small swarms beating large at fixed budget: more agents means a bigger sample to conform to and a smaller token budget each; n=2 keeps near-independence. (c) Why stagger helps: the first agent's committed core acts as a single strong signal rather than a vote of many. (d) Why parallel private attempts are the one structure with theory behind it: independence preserves error diversity, but selection among attempts needs a judge (another team's angle).

**Lever (cost).** "Late-visibility parallel attempts": N agents work in private subfolders and see only the others' *file listing and sizes* (no content, no board) until each reaches a finish condition; then one shared folder and a merge-by-whoever-finishes-last. Tests the Lazer–Friedman exploration-then-exploitation schedule. Cost: needs a visibility rule in `tools.ts` and a finish signal; medium. Oracle-free so long as the final choice is made by the last agent's own judgement. Risk: this converts to "best-of-N", which another report covers.

## 6. Self-organizing LLM systems

- **Self-Organized Agents (SoA)**, Ishibashi and Nishimura, arXiv 2404.02183: *mother* agents split code into functions and spawn *child* agents that implement them; "automatic multiplication of agents with problem complexity"; +5% Pass@1 over a single-agent baseline on HumanEval [verified abstract]. This is **hierarchical** (mother/child, docstring assignment), so only the "scale agent count with problem size" idea transfers; and the gain is on small function-level tasks.
- **AgentNet**, Yang et al., arXiv 2504.00587 (NeurIPS 2025): decentralized, RAG-based agents with dynamic DAG topology; "higher accuracy than single-agent and centralized multi-agent baselines" [verified abstract via search listing]. Routing is by learned agent capability memory, i.e. routing = assignment by capability; benchmarks are QA/reasoning.
- **Riedl, "Emergent Coordination in Multi-Agent Language Models"**, arXiv 2510.05174 (ICLR 2026 submission): information-theoretic measure (partial information decomposition of time-delayed mutual information) of higher-order structure; a simple guessing game *without direct communication*; conditions control, personas, personas + "think about what others might do"; control groups show temporal synergy but little alignment, personas add stable differentiation, adding the metacognitive instruction yields differentiation plus goal-directed complementarity [verified abstract page]. The performance link is weak: it shows structure measurable through prompt design, not that it improves coding.
- **Generative Agents** (Park et al. 2023): not re-read; social-simulation evidence, not task-performance evidence [secondary].
- **MAST**, "Why Do Multi-Agent LLM Systems Fail?" arXiv 2503.13657: 14 failure modes in three groups (specification issues, inter-agent misalignment, task verification), 1600+ annotated traces over 7 frameworks; multi-agent gains are often minimal vs. single agent or best-of-N [verified abstract listing].
- **Cursor, "Scaling long-running autonomous coding"** (Jan 2026): see section 1; the only large-scale, coding-specific, flat-versus-hierarchy result; planners/workers plus a judge "solved most of our coordination problems"; browser project of over 1M lines across 1,000 files in about a week [verified, blog]. Evidence is a vendor report with no controlled comparison and no cost against a single agent.

**Fit.** Riedl's *prompted differentiation* (personas plus "consider what others will do") is compatible if the persona is self-chosen; **assigned** personas violate the rule. SoA, AgentNet and Cursor's planners are hierarchical or capability-routed.

**Oracle.** Riedl: no. SoA: unit tests inside the loop (oracle). AgentNet: benchmark answers. Cursor: not described.

**Explains.** Riedl's result is the only direct support for "role menu plus a nudge to model teammates" and suggests murmur's role menu failed because picks occurred before agents could see what others were doing (nothing to be complementary *to*). It also contradicts nothing: it finds no performance gain.

**Lever (cost).** "Complementarity instruction after reading": agents are told to read the folder first, then state in one line what is not yet covered before picking a role. Cost: prompt only. Oracle-free. Likely modest.

## 7. Evolutionary islands, MAP-Elites, open-endedness

- **FunSearch** (Romera-Paredes et al., Nature 2023): LLM plus automated evaluator, evolutionary loop, island populations for diversity [verified listing; island detail not found in the snippets I read, so [secondary]].
- **AlphaEvolve:** MAP-Elites quality-diversity archive combined with an island model, default 5 islands of up to 25 programs [secondary: description in a third-party search summary].
- **ShinkaEvolve**, Lange, Imajuku, Cetin, arXiv 2509.19349: island model without MAP-Elites; migration is occasional and an island's best program is not allowed to migrate (protects island uniqueness); novelty rejection-sampling using embeddings plus an LLM judge before evaluation; new circle-packing state of the art with 150 samples [verified abstract page for the sample figure and techniques; the migration rule [secondary] from a search summary].

**Fit.** Islands with migration are non-hierarchical in structure. The controller that picks parents is a program, not an agent; that is a gray area but not an assigner.

**Oracle.** Strict: every method scores programs with a fitness function. Murmur's rule excludes a task-provided evaluator. The only compatible variant is one where agents write their own evaluator, which is just an agent writing tests; that is fine under the rules but then the "oracle" is as weak as the agent's tests.

**Explains.** Islands formalize why n=2 beats n=10 at fixed budget: each island needs enough budget to climb before migration; ten islands at 1/10 budget each never leave the foothills. They also formalize why a free board homogenizes: it is migration at rate 1.

**Transferable, oracle-free part.** (a) *Novelty rejection*: before starting, an agent checks whether its plan duplicates another agent's (ShinkaEvolve does this with embeddings plus an LLM judge). (b) *Rare migration*: each agent works in isolation and receives others' artefacts only at long intervals or on its own request. (c) *Best-island exclusion*: the leader does not get the others' influence; weak evidence.

**Lever (cost).** "Rare migration": board delivery restricted to one digest every K turns or K minutes (with `delivery: "pull"` plus a rate limit), no steering interrupts. Cost: small (rate limit in `swarm.ts`). Oracle-free. Closest existing lever: `delivery: "pull"`, so test the *rate* not the mode.

## 8. Human software teams

- **Brooks's law** (The Mythical Man-Month, 1975): adding people to a late project makes it later; communication overhead grows as n(n−1)/2; also the "surgical team" idea of one chief programmer with a support crew, which is hierarchical [secondary, standard].
- **Conway's law** (1968): system structure mirrors the communication structure of the organization [secondary]. Murmur prediction: with no module ownership, nobody owns the integration points, which is where "modules nobody wired in" occurs.
- **Open source without assignment** (Mockus, Fielding, Herbsleb, TOSEM 2002): Apache and Mozilla coordinated through email archives, code ownership and a small core; coordination matches participants' decentralization and availability [verified listing]. It still has maintainers and a core team: "no assignment" is not "no hierarchy". Real self-organization is enabled by modularity, public change history and the ability to veto.
- **Pair programming** (Hannay et al. 2009 meta-analysis): small positive effect on quality, medium positive effect on duration, medium negative effect on effort; faster for simple tasks at lower quality, higher quality for complex tasks at much greater effort; significant between-study variance and publication bias [verified listing, abstract-level].
- **Mob/ensemble programming:** one driver, group navigates; I found no controlled evidence in this session [unverified].
- **Joint attention:** requires a common referent and a turn-taking protocol; not searched.

**Fit.** Brooks and Conway are descriptive. Pair programming's *driver/navigator* is two roles, but chosen by the pair and swapped; compatible if self-selected.

**Oracle.** No.

**Explains.** Brooks: the 31–62% coordination tokens. Conway: unwired modules. Pair programming: the n=2 sweet spot and the quality-for-effort trade, matching "n=2 > n=3 > n=10" and "single agent ties at equal spend": the evidence says pairing buys quality at roughly double cost, which murmur's equal-spend design has already paid. Open source: murmur has no equivalent of the maintainers' veto or a public change history that is easier to read than the files; `branches` was mixed.

**Lever (cost).** "Driver/navigator pair": exactly two agents; one writes, the other reads the diff stream only and may post at most K objections; they swap when the writer calls done. Compatible (self-selected, swap), costs about 2× tokens. Oracle-free. Evidence suggests the benefit is on complex tasks; the cost is the equal-spend problem.

## 9. Markets, auctions, contract-net

Contract Net (Smith, 1980) is self-selection of work by bids, but with an announcer that issues task announcements and awards contracts [verified listing]. Distributed auction/market allocation in multi-robot work uses bids on costs; **requires** a cost estimate or utility each agent can compute; LLM agents' cost estimates are unreliable (not searched in this session).

**Fit.** Contract-net violates "no one hands out work" only if the announcer decides the award. A variant where the *bidder takes* an open item (first-come claim) is exactly murmur's `taskList`.

**Oracle.** No, but it needs a *task decomposition*, which someone must write; that is the planner, and a planner is banned.

**Explains.** The task list's low use: someone must decompose first; agents prefer to start coding. Cursor's observation that, with no owner, agents take small safe tasks is the market-side failure (an item with a high bid threshold gets no bidders).

**Lever (cost).** "Open bounty for the unclaimed hard part": any agent may add an item with a stake (a short rationale) and the remaining token cost is shown; a taker must post a plan line. Gains over `taskList` are speculative; I do not recommend it.

## 10. What the evidence says about murmur's findings

| murmur finding | best explanation in the literature | confidence |
|---|---|---|
| A persistent single agent ties or beats every swarm at equal spend | Kim et al. diminishing returns once the baseline is strong; MAST; Brooks overhead; pair-programming effort cost | high (consistent, but several sources are secondary) |
| Stagger helps | Threshold-model logic: stimulus depletion creates heterogeneity; first agent as single strong signal rather than a vote (Barkoczi and Galesic) | medium (mechanism is my inference) |
| Free board costs 31–62% of tokens, does not help | Blackboards need a scheduler to select; conformity/sycophancy turns shared view into homogenization; dense network when exploration is needed | medium |
| Role menu: agents pick before reading, mostly "builder" | Identical thresholds; Riedl: differentiation needs identity plus a nudge to consider others | medium |
| Notices, verified-findings, locks, task list not helpful | Cursor: locks are bottlenecks; stigmergy needs a trace that changes action, not a message | medium |
| Everyone converges on the same approach | Conformity without an oracle; sycophancy in debate | medium-high |
| Yielding ("X owns the file, I'll review") and modules nobody wrote | Cursor: without hierarchy, no one takes hard problems; Conway: no owner at the interfaces | medium (Cursor is a vendor report) |
| n=2 > n=3 > n=10 at fixed budget | Island logic (budget per island); Lazer and Friedman inverted U; Brooks | medium |
| Branches mixed | Open source's reliance on maintainers/veto; CodeCRDT's 39% slowdowns and 5–10% semantic conflicts on some tasks | low-medium |

## 11. Ranking of levers by promise and cost

All compared against C1T (one agent with the clock and tokens-left line). Each is oracle-free.

1. **Rare migration** (board digest every K turns, no interrupts). Cost: small code, k≥2 on two tasks. Tests the exploration-then-exploitation schedule directly and is the least likely to repeat earlier negative results because it changes the *rate*, not the channel. Risk: may degenerate to no-messaging.
2. **Staggered entry plus read-first role pick** (agents choose among roles listed from the folder state after their first turns). Cost: prompt and a gate. Builds on the only lever that worked and tests the threshold-model explanation of why it worked.
3. **Driver/navigator pair** (n=2). Cost: 2× tokens, so compare against C1T at 2× budget or against n=1 given the same total. Tests the one human-teams result with controlled evidence.

Not recommended: contract-net bounties, decay-only claim markers, more blackboard variants.

## 11b. Unexpected finds (found by following related work; abstract-level reads only)

1. **Dochkina, "Drop the Hierarchy and Roles: How Self-Organizing LLM Agents Outperform Designed Structures"** (arXiv 2603.28990, 2026-03-30): 25,000 tasks, 8 models, 4-256 agents, 8 coordination protocols. The "Sequential" protocol (autonomy, agents act in turn and see earlier output) beats centralized coordination by 14% (p<0.001); agents invent roles, abstain from tasks outside their competence, form shallow hierarchies; "strong models self-organize effectively, while models below a capability threshold still benefit from rigid structure"; no quality loss up to 256 agents [verified abstract page]. Relevance: this is the closest published analogue to murmur's **staggered entry** (later agents see earlier work), and it is non-hierarchical. It also qualifies the role-menu finding: roles *emerge* in this paper rather than being picked from a menu. Caveats: I do not know the task type, whether there is an oracle, or whether a single-agent baseline at equal spend was included; "beats centralized" is not "beats one agent". Murmur lever: none new; it supports keeping stagger and dropping the menu. Read the paper's task section before citing.
2. **DeLM, "Decentralized Multi-Agent Systems with Shared Context"** (Mao et al., Mirhoseini group, arXiv 2606.10662): agents claim items from a task queue, publish *compact verified updates* to a shared context, reuse peers' findings; up to +17.5 points over the strongest baseline, up to 2.49x faster, +19.9 points on ProgramBench within 120 min vs Claude Code; benchmarks Terminal-Bench, DeepSWE, SWE-bench Verified [verified abstract page]. Note two things for murmur: (a) "verified" updates likely rely on tests, so check for an oracle before reading it as support for murmur's `findings` lever (which did not help); (b) the speed gain matches murmur's "12 agents win on speed"; the accuracy gain over a *single* agent at equal spend is not established from the abstract.
3. **"Passes Alone, Fails Together"** (Xia, Wu, Park, arXiv 2609.25396): patches by parallel agents pass alone but break together; interference in 97% of runs on constructed Django-helper tasks but only 1 of 417 mined real PR pairs; giving agents context about concurrent changes recovered about 82% of failures [verified abstract page]. Explains murmur's broken shared files and unwired modules, and says the *notices* lever should help on tasks with shared interfaces; murmur's null result may reflect tasks without interface collisions or notice noise. Cheap to check in murmur traces.
4. **Pressure fields, re-read** (arXiv 2601.08129): disabling temporal decay costs 10 points of solve rate; 48.5% vs 1.5% for hierarchical control on meeting-room scheduling [verified abstract page]. The quality signal's origin is not stated in the abstract, so my earlier "oracle" label is [inferred]: check the paper's method before ruling the idea out.
5. **EvoGit** (arXiv 2506.02049) and **Grite**: git-native decentralized coordination (phylogenetic graph; append-only event log with advisory leases) [secondary, search listings]. Relevant to murmur's `branches` and claimLease; Grite's *advisory* leases (warn, never block) differ from murmur's blocking claims, which matches Cursor's finding that blocking locks bottleneck.
6. **Kim et al. and CodeCRDT both say task structure decides** (decomposable vs sequential): this is a stronger predictor than any coordination mechanism, so murmur results should be reported per task type before comparing levers.
7. **Predicting Multi-Agent Specialization via Task Parallelizability** (arXiv 2503.15703) [secondary, listing only]: not read; relevant to when specialization helps.

## 12. Open doubts

- I read abstract pages, not full papers, for almost everything; numbers like 17.2×/4.4× and 39–70% are from secondary summaries.
- The "stagger works via threshold depletion" account is inference; murmur's own traces could check whether the second agent's first action depends on what the first left in the folder.
- Cursor is a vendor blog without a single-agent comparison; do not weight it above murmur's own paired data.
- Evolutionary-island evidence all rests on an automated fitness function; it cannot support claims for oracle-free work.
- Search tool returned some 2026 papers I could not read beyond abstracts (SwarmWorld 2608.26081, pressure fields 2601.08129); treat their headline numbers as unreplicated.
- I did not find controlled evidence on mob programming, joint attention, or an LLM-specific test of response-threshold models; those parts are open.

## Sources

| Topic | Source | URL | Label |
|---|---|---|---|
| Blackboard LLM, controller | Han and Zhang, 2025 | https://arxiv.org/abs/2507.01701 | [verified abstract] |
| Blackboard LLM, volunteers | Salemi et al., 2025 | https://arxiv.org/abs/2510.01285 | [verified abstract] |
| Hearsay-II | Erman et al., 1980 | https://apps.dtic.mil/sti/pdfs/ADA025172.pdf | [secondary, listing] |
| Contract Net | Smith, 1980 | https://www.cs.ucf.edu/~lboloni/Teaching/EEL6788_2008/papers/The_Contract_Net_Protocol_Dec-1980.pdf | [secondary, listing] |
| Emergent coordination | Riedl 2025 | https://arxiv.org/abs/2510.05174 | [verified abstract] |
| Self-Organized Agents | Ishibashi, Nishimura 2024 | https://arxiv.org/abs/2404.02183 | [verified abstract] |
| AgentNet | Yang et al. 2025 | https://arxiv.org/abs/2504.00587 | [secondary, listing] |
| Network structure | Lazer and Friedman 2007 | https://doi.org/10.2189/asqu.52.4.667 (not opened) ; summaries via search | [secondary] |
| Network structure and learning | Barkoczi and Galesic 2016 | https://pmc.ncbi.nlm.nih.gov/articles/PMC5059778/ | [verified] |
| Innovations in networks | Mason, Jones, Goldstone 2008 | https://pc.cogs.indiana.edu/?p=456 | [secondary, listing] |
| Diversity | Hong and Page 2004 | https://pubmed.ncbi.nlm.nih.gov/15534225/ | [secondary, listing] |
| Debate sycophancy | Yao et al. 2025 | https://arxiv.org/abs/2509.23055 | [verified abstract] |
| Debate failure modes | Wynn et al. 2025 | https://arxiv.org/abs/2509.05396 | [secondary] |
| Scaling agent systems | Kim et al. 2025 | https://arxiv.org/abs/2512.08296 | [verified abstract; extra numbers secondary] |
| Failure taxonomy | Cemri et al. (MAST) | https://arxiv.org/abs/2503.13657 | [secondary, listing] |
| Cursor | Cursor, Jan 2026 | https://cursor.com/blog/scaling-agents | [verified] |
| CodeCRDT | Pugachev 2025 | https://arxiv.org/abs/2510.18893 | [verified abstract] |
| Pressure fields | Rodriguez 2026 | https://arxiv.org/abs/2601.08129 | [secondary, listing] |
| SwarmWorld | MIT, Aug 2026 | https://www.alphaxiv.org/abs/2608.26081 | [secondary] |
| ShinkaEvolve | Lange et al. 2025 | https://arxiv.org/abs/2509.19349 | [verified abstract] |
| FunSearch | Romera-Paredes et al. 2023 | https://deepmind.google/blog/funsearch-making-new-discoveries-in-mathematical-sciences-using-large-language-models/ | [secondary] |
| Response thresholds | Bonabeau, Theraulaz, Deneubourg 1998 | https://doi.org/10.1006/BULM.1998.0041 | [secondary, listing] |
| Stigmergy | Heylighen; Elliott | https://wiki.p2pfoundation.net/Stigmergic_Collaboration | [secondary] |
| Open source | Mockus, Fielding, Herbsleb 2002 | https://isr.uci.edu/node/617.html | [secondary, listing] |
| Pair programming | Hannay et al. 2009 | https://www.simula.no/research/effectiveness-pair-programming-meta-analysis | [secondary, listing] |
| Self-organizing protocols | Dochkina 2026 | https://arxiv.org/abs/2603.28990 | [verified abstract] |
| Decentralized shared context | Mao et al. 2026 (DeLM) | https://arxiv.org/abs/2606.10662 | [verified abstract] |
| Semantic coordination | Xia, Wu, Park 2026 | https://arxiv.org/abs/2609.25396 | [verified abstract] |
| EvoGit | 2025 | https://arxiv.org/pdf/2506.02049 | [secondary] |
| Specialization and parallelizability | 2025 | https://arxiv.org/pdf/2503.15703 | [secondary, unread] |
