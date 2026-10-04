Model-written literature review (subagent), 2026-10-04. Labels: [verified] read in primary source; [secondary] otherwise.

Scope: diversity/heterogeneity and communication topology/efficiency. Not repeated here: the Astra swarm and incident reports. "Verified" below means the arXiv/ACL abstract or page was fetched and read (through the fetch tool's summary); full-text reading was not possible for PDFs, so detailed numbers come from abstracts or HTML pages and are marked. Nothing here was run.

## 1. Bottom line

1. Mixing different models is not what makes ensembles work. Quality of the members dominates; sampling one strong model repeatedly usually beats mixing (Self-MoA). That matches murmur: same model, so the lever is not "more different models" but "different trajectories of the same model".
2. The same model sampled N times is NOT diverse in the useful way. Initial moves collapse (first-turn query redundancy in agentic search, DivInit; homogeneity across and within models, Artificial Hivemind). murmur's "agents converge on the same approach and duplicate work" is the expected outcome, not a bug of the board. The cheap, training-free fix in the literature is diversifying the starting point at matched compute, not adding talk.
3. Talking is where the cost and the damage are. Debate is a martingale without a bias toward truth, majority voting explains most of the gain, agents flip from right to wrong under peer pressure, and sparse topologies cut cost 33-53% with equal or better accuracy. All consistent with murmur's 31-62% coordination overhead and "single agent ties swarm".
4. The strongest evidence for more agents is information/context, not diversity: sub-agents with isolated contexts that return short summaries (Anthropic research system, Chain of Agents). That reason does not apply when the task fits in one context and the agents share one folder, which is murmur's case. Cognition argues the opposite for coding: parallel agents with isolated context make conflicting implicit decisions.
5. Coordination has a capability ceiling: Google/MIT find returns vanish once the single-agent baseline passes about 45% and are worst on sequential and tool-heavy tasks. For a strong persistent single agent this predicts a tie at best.

## 2. Sources and extractions

Columns used per source: (a) evidence and baseline, (b) oracle needed, (c) non-hierarchy fit, (d) murmur finding explained or contradicted, (e) test idea against C1T (one agent with a clock and tokens-left line) and cost.

### 2.1 Heterogeneity of models

**Rethinking MoA / Self-MoA** (Li, Lin, Xia, Jin; arXiv 2502.00674; TMLR 2026) [verified, abstract and HTML page]
- (a) Same number of proposers (six) in both arms, so proposer-matched, not a single-agent baseline. Self-MoA (six samples of the top model plus aggregation) beats mixed-model MoA by 6.6 points on AlpacaEval 2.0 (65.7 vs 59.1 LC win rate) and 3.8% on average over MMLU, CRUX, MATH. Regression: performance is more sensitive to quality than to diversity (R^2 about 0.7). Mixing helps only when models are of similar quality and diverse; in a constructed multi-task case the gain was 0.17-0.35%. A sequential Self-MoA version aggregates many outputs over rounds.
- (b) No oracle for the method; it only needs an aggregator call.
- (c) The aggregator is a single call, not a planner; fine as a "finishing step" but not a labeller of roles.
- (d) Explains why heterogeneity is not the missing ingredient; shows that quality-per-agent matters, so weaker/lower-thinking helpers are risky.
- (e) Compare C1T with S2 where both agents are identical medium-thinking vs one medium and one high; expect no gain from the weaker mix. Cost: about the same as n=2 runs already done.

**Multi-Agent Reasoning Improves Compute Efficiency: Pareto-Optimal Test-Time Scaling** (arXiv 2605.01566) [verified, abstract-level]
- (a) Compute-matched: debate and mixture-of-agents beat self-consistency by 1.3 and 2.7 points at equal budget; up to +7.1 over chain-of-thought at 20x CoT compute. 34 configurations on MMLU-Pro and BBH. Rule: MoA is most efficient when parallel generations exceed sequential aggregation rounds.
- (b) Reads accuracy but only to compare methods; the methods themselves need no labels.
- (c) Fits, if parallel draws are independent and one aggregation step.
- (d) Contradicts a blanket "single beats swarm" for short reasoning tasks; supports "wide and shallow" shapes (n parallel private attempts, one merge) over "deep conversation". Matches murmur's n=2 > n=3 > n=10 only partly: those are open-ended coding tasks, not MMLU.
- (e) Profile: n=2 parallel private attempts, no board, one end-of-run reconciliation by the agent that finishes first. Cost: about 2x C1T tokens plus one reading pass.

**Revisiting Multi-Agent Debate as Test-Time Scaling** (arXiv 2505.22960) [verified, abstract-level]
- (a) MAD has limited advantage over self-agent scaling on math; helps more on harder problems and weaker models; agent diversity contributes minimally for math; heterogeneous agents help on safety tasks.
- (b) none. (c) n/a. (d) Supports "diversity is task dependent, mostly not needed". (e) None new; argues against building a diversity lever for coding tasks without evidence.

**Diverse LLMs or Diverse Question Interpretations?** (arXiv 2507.21168; LREC 2026) [verified, abstract-level]
- (a) Binary QA (boolq, strategyqa, pubmedqa). Question-interpretation diversity (rephrased prompts, one model) consistently beats model diversity; model mixing lands between best and worst member.
- (b) Voting needs no labels. (c) Fits (prompt diversity is allowed).
- (d) Prompt-level diversity of the same model is the cheap substitute for model diversity.
- (e) Give each agent a self-restated version of the task (agent rewrites the task in its own words and lists assumptions before acting, then proceeds). Cost: a few hundred tokens per agent. Risk: the agents are still the same model, so restatements may converge.

**Are Diversity Metrics Measuring Diversity? Capability-controlled audit of majority-vote gain** (arXiv 2607.20768) [verified, abstract-level]
- (a) 31,900 model subsets: majority vote of three beat the best member in only 9.98% of subsets, though oracle complementarity existed in 100%. "Strict diversity" correlates rho = 0.991 with mean accuracy, i.e. it measures capability. After control only co-failure (shared errors) predicts voting gain, modestly.
- (b) The audit uses labels; the method does not. (c) n/a.
- (d) Even when members differ, combining them without a selector rarely beats the best member. Fits murmur's "single agent ties or beats". The unlocking element is selection (another subagent's angle), not diversity.
- (e) None; treat "diverse enough" as untestable without a selector.

**Correlated Errors in Large Language Models** (arXiv 2506.07962; ICML) [secondary, search snippets only]
- Over 350 LLMs: models agree about 60% of the time when both err; more accurate models are more correlated; shared architecture and provider drive correlation. Same-model agents inherit all of it, so errors are fully correlated by construction. Implication: a second identical agent confirms mistakes, which is consistent with "converge on the same approach".

**Diversity Empowers Intelligence (DEI)** (arXiv 2408.07060) [secondary, search snippet]
- A group of open-source SWE agents with maximum single resolve rate 27.3% on SWE-Bench Lite reaches 34.3% with a ranking/re-ranking layer. Needs a re-ranker (selection), different agent scaffolds and models. Shows heterogeneity can add on coding when members are weak and scaffolds differ and a selector exists. Not murmur's regime (one strong model, no selector).

**Ensembles for LLM code generation** (arXiv 2503.15838) [verified, abstract-level]
- Multiple LLMs, voting on behavioural equivalence (CrossHair) plus CodeBLEU: 90.2% HumanEval, 50.2% LiveCodeBench. Relies on executable semantic checks, i.e. close to an oracle on function-level tasks. Not applicable to oracle-free murmur tasks.

### 2.2 Same-model diversity: collapse and how to restore it

**Artificial Hivemind** (arXiv 2510.22954; NeurIPS 2025) [verified via search coverage, secondary on numbers]
- Infinity-Chat, 26K open-ended queries, 70+ models: strong intra-model repetition and inter-model homogeneity; reported 79% of response pairs above 0.8 similarity. Alignment tuning is blamed. Explains why N identical agents propose the same plan and why "a role menu" yields mostly "builder": the modal answer wins.

**Beyond the Hivemind** (arXiv 2608.02618) [verified, abstract-level]
- Meta-persona anchoring (the model self-selects a persona before answering) plus filtered extreme temperature (T >= 4 after top-p) reduces mean pairwise similarity from about 0.85 to about 0.65 on Infinity-Chat with ~20B open models. Open-ended text, no task accuracy shown. Self-selected persona is the same idea as murmur's role menu, but their persona is picked from an unbounded space, not a short menu of 4-5 job titles. Temperature is not available via Pi/Codex OAuth (probably) [unverified].

**Verbalized Sampling** (arXiv 2510.01171; ICML 2026) [verified, search page]
- Ask the model to verbalise several candidate responses with probabilities; 2-3x diversity at similar quality on creative and open-ended tasks. For murmur: a single call that lists k distinct approaches (with rough probabilities) restores the distribution that alignment collapsed. Training-free.

**Beyond Parallel Sampling: Diverse Query Initialization (DivInit)** (arXiv 2606.17209) [verified, abstract-level]
- Agentic search: parallel trajectories waste compute because first-turn queries are redundant. Draw n candidates in one model call, pick k < n diverse seeds, run them in parallel: +5 to +7 points on multi-hop QA at matched compute, five open-weight models, eight benchmarks, training-free. This is the closest published analogue of murmur's "duplicate work" problem and it is solved at the start, not by messaging. Non-hierarchical caveat: the seeds come from one call, but in murmur each agent could generate its own and then pick the one furthest from those already on the board (stagger).
- (e) Test: n=2 each agent writes its own list of 4 distinct approaches before reading code, posts one line, second agent (staggered) picks an approach that differs from the first. Cost: about 1-2k extra tokens per agent plus one board read. Compare with C1T and with n=2 without seeding. Ties it to "staggered entry helps a structure form".

**Enhancing Diversity in Parallel Agents: Maximum State Entropy** (arXiv 2505.01336) [verified, abstract-level]
- RL theory: N identical agents give only a factor-N speed-up; specialised sampling distributions concentrate faster. Supports the claim that identical parallel agents buy compute, not new information. It is an RL setting, not LLMs.

### 2.3 Debate, conformity, and "the same model talking to itself"

**Debate or Vote** (Choi, Zhu, Li; arXiv 2508.17536; NeurIPS 2025) [verified via search page]
- Seven NLP benchmarks: majority voting gives most of the gains attributed to MAD; GSM8K with Qwen2.5-7B 94.0% vote vs 90.3% best MAD variant. Theory: debate is a martingale on belief in the correct answer; extra rounds do not push toward truth without a bias. Interventions that bias updates toward correction help. Fits murmur: extra messaging rounds are free tokens without expected gain.

**Talk Isn't Always Cheap** (arXiv 2509.05396) [verified via search page]
- Accuracy often falls over rounds; right-to-wrong flips exceed wrong-to-right; sycophancy and conformity. Directly matches "agents converge" and gives a mechanism: social conformity rather than reasoning.

**When and Why Does Multi-Agent Debate Fail** (arXiv 2510.20963) [verified, abstract-level]
- "Debate hacking": competitive framings produce misleading messages; consensus framings filter out informative disagreement. ColMAD (non-zero-sum framing) gains up to 10 points over other debate methods and non-trivially over single agent at equal budget. Task: error detection (needs ground truth to score, but not to run). Suggests a norm "report disagreement and evidence, not stances".

**Self-preference bias** (Panickssery et al. "LLM Evaluators Recognize and Favor Their Own Generations"; arXiv 2509.26464 "Extreme Self-Preference"; 2504.03846) [secondary, search snippets]
- LLMs rate own outputs higher; EMNLP 2025 work reportedly finds debate amplifies bias after the first round. An identical-model reviewer is therefore a weak check; relevant to any murmur "review each other" lever. Suggestion in the literature: cross-model judging; not available in murmur, so use execution evidence (own tests) instead of opinion.

**Persona studies**: MARS (arXiv 2509.20502) ablation: persona-diversified reviewers gave no improvement across tasks except marginal on MMLU [secondary]. "Persona Inconstancy in Multi-Agent LLM Collaboration" (arXiv 2405.03862): personas drift toward conformity [secondary, title and search blurb only]. Persona-based brainstorming (arXiv 2512.04488) reports benefits on idea generation [secondary]. Net: personas help creativity-style outputs, not correctness; consistent with the role-menu picks collapsing to "builder".

### 2.4 Topology and communication efficiency

**Improving Multi-Agent Debate with Sparse Communication Topology** (Li et al., Google; EMNLP Findings 2024; arXiv 2406.11776) [verified, HTML page]
- Six agents, graph density D from neighbour ring (D = 2/5) to fully connected. Cost down 41.5% (MATH), 43.5% (GSM8K), up to 53% (alignment labelling), 33.1% tokens on MathVista; accuracy +3.0 to +7.5% (MATH), +3.5 to +6.5% (GSM8K) vs fully connected MAD. Sample sizes small (100 GPT, 500 Mistral). Mixed-model: putting the stronger LLM at the high-centrality node adds +3.0%. Baseline is fully connected MAD (compute is lower, not matched), not a single agent.
- (b) Evaluated on labelled benchmarks; the topology is hand-chosen, so no training. (c) Ring/neighbour graphs are decentralised: fits. (d) Shows that fewer links, not more, is better; murmur's free board is the fully connected case. (e) Profile: board entries visible only to the two previous entrants (ring), or inbox read only at fixed points (start and before done). Cost is lower than the free board; compare against C1T.

**AgentPrune "Cut the Crap"** (arXiv 2410.02506) [verified, abstract-level]
- One-shot pruning of the spatial-temporal message graph; 28.1-72.8% fewer tokens, $5.6 vs $43.7 for comparable accuracy, six benchmarks. Training of the mask needs task data with correctness signal [unverified from the page; abstract does not say]; therefore flagged as oracle-dependent. The fact it matters: most messages are removable. Same family: G-Designer (GNN topology, ICLR 2025 workshop) [secondary], AgentDropout (round-level node/edge dropout) [secondary, not read], AgentDropoutV2 (arXiv 2602.23258, test-time rectify-or-reject) [secondary].
- (e) A cheap oracle-free analogue is a message budget: each agent may post at most k board entries per run (k = 3), which prunes by construction. Cost: none.

**GPTSwarm** (Zhuge et al.; ICML 2024) [verified, search abstract]: agents as computational graphs; edge optimisation learns communication patterns; needs a task reward to optimise. **MacNet** (ICLR 2025) [verified, search abstract]: DAG topologies, irregular beat regular, logistic scaling with agents up to 1000; evaluated on benchmark tasks with short outputs, not shared-folder coding. **Optima** (arXiv 2410.08115, ACL Findings 2025) [verified, search abstract]: trains agents to be token efficient; 2.8x performance on information-heavy tasks with under 10% tokens; needs training and rewards: not usable here. **Graph-of-Agents** (arXiv 2604.17148), **MetaGen** (arXiv 2601.19290), **AgentNet** (arXiv 2504.00587) [secondary, titles only]. All topology optimisers use labelled tasks (b = yes) and some form of meta-controller (c = partial).

**Towards a Science of Scaling Agent Systems** (Kim et al., Google/MIT; arXiv 2512.08296) [verified, abstract-level]
- 260 configurations, six benchmarks, five architectures (single, independent, centralised, decentralised, hybrid), three LLM families. Range from +80.8% (decomposable finance) to -70.0% (sequential planning); coordination gives diminishing or negative returns above a single-agent baseline of about 45%; overhead pronounced on tool-intensive tasks; independent agents amplify errors 17.2x versus 4.4x for centralised verification (blog figure, [secondary]); predictive model R^2 = 0.373 cross-validated and picks the best architecture for 87% of held-out configs. Matches the murmur finding at equal spend and gives a prior: tool-heavy sequential coding is the worst place for swarms. Centralised verification being better is a hierarchy-flavoured finding that murmur excludes by design.

**Why Do Multi-Agent LLM Systems Fail? (MAST)** (arXiv 2503.13657) [verified, search coverage]
- 14 failure modes in 1,642 traces; categories: specification issues about 42%, inter-agent misalignment about 37%, verification failures about 21-25%. Same-model single agent often outperforms. Useful as a coding scheme for murmur traces.

**Silo-Bench** (arXiv 2603.01045; ACL 2026) [verified, abstract-level]
- 30 algorithmic tasks, 54 configurations, 1,620 experiments, role-free. Agents spontaneously form task-suited topologies and exchange info, but fail to integrate it ("Communication-Reasoning Gap"); Level III tasks reach zero success beyond 50 agents. Strong evidence that spontaneous (non-assigned) coordination is not the bottleneck; integrating shared information is.

**LLM blackboard systems** (arXiv 2507.01701 and 2510.01285) [secondary, search blurbs]
- Blackboard as sole memory, volunteer-based participation, central control unit in some variants; they report lower token cost than per-agent memory. Control unit or central posting agent breaks the non-hierarchy rule in the original; the volunteer pattern fits. Note that every agent reading the whole blackboard each time is exactly the cost mechanism murmur measured.

**Learning to Share: Selective Memory for Efficient Parallel Agentic Systems** (arXiv 2602.05965; ICML 2026) [verified, abstract-level]
- Shared memory bank with a controller (trained by RL) deciding what to store; cuts runtime while matching or improving AssistantBench and GAIA. Selective write (not read-all) is the idea; training needs a task reward (b = yes). Oracle-free version: write only conclusions and decisions, never progress chatter.

### 2.5 Information asymmetry and context as the real reason for multi-agent

**Chain of Agents** (Google; arXiv 2406.02818) [verified via search page]: workers read sequential chunks and pass notes; up to 10% over RAG and truncation baselines on long-context tasks; reduces complexity from n^2 to nk. Reason for many agents is a context limit, not diversity. In murmur the folder fits one agent's context, so this reason is absent unless tasks outgrow context.

**Anthropic multi-agent research system** (engineering blog) [secondary: only via blog summaries, primary page not opened]: orchestrator-worker, sub-agents with isolated windows returning 1-2k token summaries; +90.2% over single Opus 4 on an internal eval; about 15x tokens vs chat; token usage explains 80% of variance on BrowseComp. Best fit is breadth-first, parallelisable, exceeding one context; not tasks with high dependencies. This is orchestrated, so excluded by murmur's rules, but the "isolation plus summary" mechanism can be had without an orchestrator.

**Cognition, "Don't Build Multi-Agents"** (cognition.com/blog/dont-build-multi-agents) [verified via search snippets; page not read in full]: share full traces, because actions carry implicit decisions that conflict. Explains murmur's duplicate work and overwrites in a shared folder; suggests that a decision log (what I chose and why) rather than chat is the useful content.

**Budget-Aware Tool Use Enables Effective Agent Scaling** (arXiv 2511.17006; COLM 2026) [verified, abstract-level]: a budget tracker plugin giving continuous budget awareness improves scaling curves and the cost-performance Pareto frontier on web-search agents. This is the C1T mechanism (clock plus tokens-left line) in the literature; supports C1T as the single-agent comparator and suggests that a per-agent share of the swarm budget visible to each agent is the fair swarm analogue.

## 3. What the evidence says about murmur's findings

| murmur finding | Literature | Verdict |
|---|---|---|
| Persistent single agent ties or beats swarms at equal spend | Google/MIT 45% threshold; MAST single-agent wins; Debate-or-Vote; capability audit (vote beats best member in 10% of subsets) | Expected, not surprising |
| Free board costs 31-62% of tokens, threaded board no cut | Sparse topology (-33 to -53% cost at same or better accuracy); AgentPrune (28-73% fewer tokens); blackboard read-all cost | Cost is from reading all, every time. Fewer links or budgeted posts is the studied cure; threads keep full reads |
| Agents converge and duplicate work | Artificial Hivemind; DivInit first-turn redundancy; max-entropy theory; correlated errors | Expected for N identical aligned models; fix is at the start |
| n=2 > n=3 > n=10 at fixed budget | MacNet logistic scaling (for easy tasks); Silo-Bench zero success at 50+ agents; error amplification; but Pareto paper favours wide-parallel plus one merge | Consistent; the wide-parallel merge variant has not been tried in murmur [check against plan.md] |
| Role menu: agents choose before reading task, mostly "builder" | Hivemind modal collapse; MARS personas no gain; Beyond-Hivemind says self-chosen persona must come from an unbounded set | Choosing before reading the task is the weak point; choosing after a first look, from a menu with a "different from what is already taken" rule, is untested |
| Staggered entry helps | DivInit/ring: later agents see earlier decisions and can differ | Plausible mechanism: seeded diversity via observation |

## 4. Heterogeneity options that murmur can really run

All through Pi with OpenAI Codex OAuth (models other than gpt-6-luna not confirmed; I did not check what Pi exposes).

1. Thinking level (medium vs high vs low). Literature gives no direct evidence on this axis. By Self-MoA, a lower level lowers quality and mixing would hurt; a higher level costs more tokens per agent. Untested ground.
2. Prompt variation: restated task [Diverse Question Interpretations], self-generated approach list [VS, DivInit], different tool subsets (e.g. only one agent may write; not assigned by anyone, chosen from a menu). Existing levers: `briefing`, `roles`, `tools`, `systemPromptAppend`, `spawnGapSeconds`.
3. Information partition: agents see different files or only the task text vs the task plus tests. Silo-Bench says integration fails, and AGENTS.md realism rules would need review; low priority.

## 5. Testable ideas, oracle-free (ranked)

**A. Self-seeded approach diversity with stagger (DivInit/VS adapted).** Each agent, before touching code, writes four distinct approaches (not roles) to its own scratch, posts one line with the chosen one; the next agent reads those lines once and picks an approach not yet taken (or "same, because X"). No oracle; no assigned roles; one board read per agent at entry. Profile: `trio.json`-style n=2 with `spawnGapSeconds`, new briefing text, board read limited to entry. Compared with C1T (one agent with a clock and tokens-left line) and with n=2 unseeded. Cost: n=2 run budget (about 2x C1T) plus about 2k tokens. Metric: do the two final solutions differ in approach (read from transcripts) and does per-task mean beat C1T. Risk: both agents list the same four approaches (hivemind), then distinctness comes only from stagger; this is itself a result.

**B. Sparse/budgeted communication.** Each agent may post at most 3 entries and read the board only at entry and just before finishing (no steering during the run), possibly on a ring for n >= 3. Expect coordination-only turns to drop below the 31-62% observed. No oracle. Cost: cheaper than existing swarm arms. It tests whether the sparse-topology result transfers to coding; the ceiling is "ties C1T at lower cost", not a win.

**C. Wide-parallel private attempts with one merge (Pareto paper).** n=2 or 3 agents with no board, then the first to finish reads the others' final diffs and decides (one reading pass). Selection is by the agent's own judgment, so self-preference bias applies; weak without execution evidence. Cost about n x C1T plus a merge turn. Likely already close to an existing arm ("parallel private attempts"); verify in plan.md before building.

Not recommended: model mixing (not available), personas (no evidence of gain), debate-style review (martingale, conformity, self-preference), trained topology pruning (needs labels).

## 6. Open doubts

- Almost every positive topology/diversity result is on short-answer benchmarks with labelled test sets (MATH, GSM8K, MMLU, AlpacaEval) and compares against debate or MoA, not against a single persistent agent with equal tokens. Transfer to long-horizon shared-folder coding is unproven. Exceptions: DEI (SWE-Bench Lite, selector needed) and Google/MIT (tool-heavy benchmarks, negative returns).
- Numbers from search snippets only (marked [secondary]) were not checked in primary text: Hivemind 79%, error amplification 17.2x/4.4x, DEI 27.3 to 34.3, AgentPrune dollars.
- I could not read PDFs fully; abstract-level claims on 2605.01566, 2505.22960, 2510.20963, 2507.21168, 2607.20768, 2602.05965 should be checked if a decision rests on them.
- Whether Pi exposes temperature or other OpenAI models was not checked.
- Several 2026 arXiv items appeared only through the search tool and fetch summaries; I did not independently confirm venues.

## 7. Source URLs

| Source | URL |
|---|---|
| Self-MoA | https://arxiv.org/abs/2502.00674 |
| Sparse topology MAD | https://arxiv.org/abs/2406.11776 |
| Pareto test-time scaling | https://arxiv.org/abs/2605.01566 |
| Revisiting MAD as TTS | https://arxiv.org/abs/2505.22960 |
| When and why MAD fails | https://arxiv.org/abs/2510.20963 |
| Debate or Vote | https://arxiv.org/abs/2508.17536 |
| Talk Isn't Always Cheap | https://arxiv.org/abs/2509.05396 |
| Diverse LLMs or interpretations | https://arxiv.org/abs/2507.21168 |
| Diversity metrics audit | https://arxiv.org/abs/2607.20768 |
| Correlated errors | https://arxiv.org/abs/2506.07962 |
| DEI | https://arxiv.org/abs/2408.07060 |
| Code-gen ensembles | https://arxiv.org/abs/2503.15838 |
| Artificial Hivemind | https://arxiv.org/abs/2510.22954 |
| Beyond the Hivemind | https://arxiv.org/abs/2608.02618 |
| Verbalized Sampling | https://arxiv.org/abs/2510.01171 |
| DivInit | https://arxiv.org/abs/2606.17209 |
| Parallel agents max entropy | https://arxiv.org/abs/2505.01336 |
| Scaling agent systems | https://arxiv.org/abs/2512.08296 |
| MAST | https://arxiv.org/abs/2503.13657 |
| Silo-Bench | https://arxiv.org/abs/2603.01045 |
| AgentPrune | https://arxiv.org/abs/2410.02506 |
| AgentDropoutV2 | https://arxiv.org/abs/2602.23258 |
| GPTSwarm | https://arxiv.org/abs/2402.16823 |
| MacNet | https://proceedings.iclr.cc/paper_files/paper/2025/file/66a026c0d17040889b50f0dfa650e5e0-Paper-Conference.pdf |
| Optima | https://arxiv.org/abs/2410.08115 |
| Blackboard LLM MAS | https://arxiv.org/abs/2507.01701 |
| Learning to Share | https://arxiv.org/abs/2602.05965 |
| Budget-aware tool use | https://arxiv.org/abs/2511.17006 |
| Chain of Agents | https://arxiv.org/abs/2406.02818 |
| Cognition, Don't Build Multi-Agents | https://cognition.com/blog/dont-build-multi-agents |
| MARS | https://arxiv.org/abs/2509.20502 |
| Persona inconstancy | https://arxiv.org/abs/2405.03862 |
| More Agents Is All You Need | https://arxiv.org/abs/2402.05120 |
| Extreme self-preference | https://arxiv.org/abs/2509.26464 |
| Do LLM evaluators prefer themselves | https://arxiv.org/abs/2504.03846 |
