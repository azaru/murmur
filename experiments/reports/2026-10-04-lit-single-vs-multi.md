Model-written literature review (subagent), 2026-10-04. Labels: [verified] read in primary source; [secondary] otherwise.

Scope: academic and empirical studies of single-agent vs multi-agent LLM systems, scaling of agent teams, and failure taxonomies, read against murmur's findings (a persistent single agent ties or beats swarms at equal spend; coordination-only turns eat 31-62% of swarm tokens; smaller swarms do better at a fixed budget; staggered entry helps). Practitioner reports (Cursor, Anthropic C compiler, Gas Town) are covered by another subagent; they appear here only where they anchor a claim. The OpenAI/Hugging Face incident, "Astra swarm" and IndieDevDan video are not repeated (see the three earlier reports).

Method caveat. "[verified]" below means I fetched the arXiv abstract page or the publisher's own page and read a summary of it through the fetch tool (a small model summarising the page). I did NOT read full PDFs. Numbers in the body of papers (tables) are therefore only as good as the abstract. Anything from search-result snippets alone is marked [secondary]. Several 2026 arXiv IDs (26xx.xxxxx) postdate my training; I only know them from this session's search and fetch results.

## 1. Headline: what is the evidence for "multi-agent beats single agent at equal compute"?

Short answer: weak, and mostly negative, for the setting murmur cares about (long-horizon coding, same model, peers). The positive results fall in three classes: (i) the single baseline was a single pass or got far fewer tokens; (ii) the task is decomposable and read-heavy (search, finance reasoning); (iii) the multi-agent system has a hierarchy that verifies or assigns scope. None of the compute-matched positive results I found is about peer agents editing one shared codebase without an oracle.

### 1.1 Compute-matched comparisons (the strongest evidence class)

| Source | Baseline and matching | Result | Oracle? | Hierarchy? |
|---|---|---|---|---|
| Single-Agent LLMs Outperform Multi-Agent Systems on Multi-Hop Reasoning Under Equal Thinking Token Budgets, arXiv 2604.02460 [verified abstract] | Same thinking-token budget; 3 model families (Qwen3, DeepSeek-R1-Distill-Llama, Gemini 2.5); 5 MAS architectures; FRAMES and MuSiQue (secondary for the list of architectures) | Single agent matches or beats MAS; authors attribute reported MAS gains to unaccounted computation and context effects; they flag API budget-control artefacts (Gemini 2.5) that can inflate MAS | Benchmarks with gold answers | Mixed (debate, ensemble, sequential, parallel roles) |
| Stop Overvaluing Multi-Agent Debate, arXiv 2502.08788 [secondary: search summary only] | 5 MAD methods, 9 benchmarks, 4 models, vs CoT and Self-Consistency | MAD often fails to beat CoT/SC despite more compute; SC is more token-efficient | Gold answers | Peers (debate) |
| The Illusion of Multi-Agent Advantage, arXiv 2606.13003 [verified abstract] | Automatically generated MAS vs CoT-SC, reasoning sets and BrowseComp-Plus | Auto-MAS underperform CoT-SC while up to 10x more expensive; expert-designed MAS beat auto-designed ones | Gold answers | Varies |
| At Equal Inference Cost, Multi-Agent Structure Does Not Beat a Single Frozen Agent, arXiv 2609.04217 [verified abstract] | Same total LM calls, 7B backbone, evolved team vs evolved single agent, ALFWorld and WebShop | Team 0.769 vs single 0.754 (p=0.80); gain came entirely from the executor role, planner and critic prompts evolved to empty or low-impact | Environment reward | Planner-executor-critic |
| Rethinking the Bounds of LLM Reasoning: Are Multi-Agent Discussions the Key?, ACL 2024, arXiv 2402.18272 [verified abstract] | Single agent with strong prompt (with demonstrations) vs best discussion methods | Single agent with strong prompt almost matches the best discussion approach; MAD helps mainly when the prompt has no demonstrations | Gold answers | Peers |
| Multi-Agent Reasoning Improves Compute Efficiency, arXiv 2605.01566 [verified abstract] | 34 configurations; SC, self-refinement, debate, Mixture-of-Agents at matched budgets; MMLU-Pro, BBH | Counter-evidence: at equal budgets debate beats SC by 1.3 points and MoA by 2.7; gains persist at up to 20x CoT compute (+7.1 points) while SC plateaus | Gold answers | MoA is layered (aggregator) |
| Towards a Science of Scaling Agent Systems, Google/DeepMind/MIT, arXiv 2512.08296 [verified abstract and Google blog] | 5 architectures (single, independent, centralized, decentralized, hybrid), 3 model families; the latest arXiv abstract says 260 configurations on six benchmarks (the first version said 180 on four); search snippets say Finance Agent, BrowseComp-Plus, PlanCraft, Workbench. The blog does not state whether tokens were matched | Relative change vs single agent from +80.8% (decomposable finance reasoning) to -70.0% (sequential planning); independent MAS amplify errors 17.2x vs 4.4x for centralized (blog); tool-heavy tasks pay a coordination tax; a ~45% single-agent accuracy ceiling beyond which adding agents gives diminishing or negative returns [secondary for 45%, from review articles]; fitted model R^2=0.373 cross-validated, picks the best architecture on 87% of held-out configs | Benchmarks with ground truth | Mixed; centralized best at containing errors |
| Phase Transition for Budgeted Multi-Agent Synergy, arXiv 2601.17311 [verified abstract] | Theory, fixed compute | Synergy appears only above a threshold set by communication fidelity, correlation of errors among similar agents, and fan-in limits; otherwise the organisation washes out to chance. Authors say it explains the bottlenecks in recent matched-budget studies | Majority-vote binary tasks | Trees, chains, stars |
| Multi-Agent Teams Hold Experts Back, ICML 2026, arXiv 2602.01011 [verified abstract] | Self-organising LLM teams vs their best member | Teams underperform their best agent by up to 41.1% on ML benchmarks, even when told who the expert is; mechanism is "integrative compromise" (averaging expert and non-expert views), which grows with team size | Benchmark scores | Peers, self-organising |

Interpretation for murmur: these results are consistent with murmur's "persistent single agent ties or beats swarms at equal spend", but nearly all are reasoning benchmarks with answer-checking, one-shot tasks. The one structural result that matters most is "Phase Transition" (2601.17311) plus 2602.01011: agents of the same model have correlated errors and compromise rather than defer, so peers add little independent signal. That is a mechanism, not just an observation, for why message boards, review and discussion did not help in murmur.

### 1.2 Where multi-agent is reported to win

1. Decomposable, read-heavy, breadth tasks: Anthropic's research system beat single-agent Opus 4 by 90.2% on an internal research eval [verified, anthropic.com engineering post]. Baseline: one agent, not token-matched. Token usage alone explained 80% of the variance on BrowseComp (95% with tool calls and model choice); multi-agent used about 15x chat tokens vs about 4x for a single agent. The post itself says most coding tasks have fewer truly parallelisable parts and that LLM agents are not yet good at real-time delegation. Reading: the multi-agent win is substantially "more tokens and more fresh context windows", which is exactly murmur's equal-spend result (a 12-agent swarm = single agent at the same 24M tokens).
2. Google scaling study: +80.8% on decomposable financial reasoning [verified abstract], against -70% on sequential planning. This matches murmur's finding that planning/job-shop does not benefit.
3. Wall-clock: Kimi K2.5 Agent Swarm / PARL cut "critical steps" 3x to 4.5x on large search tasks [secondary: search summary of arXiv 2602.02276, which I did not open]. Latency, not accuracy at equal tokens; the orchestrator is trained and the sub-agents are frozen (hierarchical, so it violates murmur's non-hierarchy rule). It matches murmur's "only 4-6x faster in wall time".
4. Coding with a manager/reviewer: Agyn (blog, March 2026) reports 72.2% on SWE-bench Verified with GPT-5/GPT-5-Codex at medium reasoning against 71.8% for OpenHands and mini-SWE-agent with GPT-5 high [verified from the dev.to post, which is the vendor's own writeup; the reported team gain is +7.2 points over a single-agent baseline of the same model class, per the search snippet]. Tokens and cost are not disclosed, the baselines used a higher reasoning setting, and the reviewer's use of tests is not specified. Weak evidence, hierarchical (manager role), and SWE-bench Verified has hidden-test oracle character. [secondary quality]
5. Pareto/MoA: 2605.01566 above (reasoning benchmarks only).
6. Role-specialised heterogeneous teams: AgentCARD, arXiv 2606.20629 [verified abstract]: heterogeneous model assignment gives up to 44% accuracy over cost-equivalent uniform teams, or equal accuracy at up to 12x lower cost. That is a result about mixing models by role and cost, not about same-model peers.
7. EvoMAS (arXiv 2602.06511, ICML 2026) [secondary: search snippets only]: on SWE-bench Verified with Claude-3.5-Sonnet reports 42.7% at 29M tokens vs SWE-Agent best-of-10 37.8% at 40M tokens, and a single SWE-Agent 33.6% at 2.3M. If true it is one of the few token-matched coding comparisons, but the system is evolutionary and orchestrated, the model is old, and the baseline is a best-of-N, which is itself a parallel-sampling baseline. Verify before use.

### 1.3 Conditions under which multi-agent is reported to beat a compute-matched single agent
- The task is decomposable into pieces that do not need shared context (search, finance sub-questions) [Google, Anthropic].
- The single agent is below saturation: gains vanish when it already scores about 45% or more [Google, secondary].
- There is a verifier or orchestrator that contains error propagation (4.4x vs 17.2x amplification) [Google blog].
- Aggregation via a strong aggregator (MoA) at a high budget on reasoning benchmarks [2605.01566].
- Heterogeneity: different models across agents, with cost-aware assignment [AgentCARD; also "Stop Overvaluing MAD" recommends heterogeneity]. Counter-evidence: Mo' Models, Mo' Problems (arXiv 2609.17306) [verified through search summary only: 23 models; bigger heterogeneous pools raise the oracle ceiling but often lower achieved accuracy below the best single model; the best gain came from candidates from a single family].
- Unbounded budget with exceptional scale: Cursor reports trillions of tokens, but its coordination used planners and a judge (hierarchy) after peer coordination failed [verified, cursor.com blog; covered by another subagent]. It does not claim equal-compute superiority.

## 2. Coordination and failure taxonomies

### MAST (Cemri et al., NeurIPS 2025 Datasets and Benchmarks, arXiv 2503.13657) [verified abstract]
1,600+ annotated traces from 7 MAS frameworks; 14 failure modes in three groups: specification and system design, inter-agent misalignment, task verification; kappa = 0.88 on a 150-trace sample. Search summaries say specification/design issues are about 41.8% of failures and about a quarter are missing or weak verification [secondary]. Models: GPT-4, Claude 3, Qwen2.5, CodeLlama (old). The abstract makes no single-agent comparison. Oracle: none (it is a taxonomy). Hierarchy: frameworks are mostly role-assigned (MetaGPT, ChatDev style), so the "specification and role" group describes failures of assigned roles that murmur already avoids. The verification group (premature termination, no or incomplete verification) corresponds to murmur's "stopping early" and "no one tests". Testable: tally murmur traces against MAST's termination/verification modes; murmur's own list (yielding to "X owns the file", modules never wired in) maps to inter-agent misalignment and verification but is not named in MAST, which suggests a coding-peer-specific extension.

### CooperBench (Khatua et al., arXiv 2601.13295) [verified abstract]
600+ two-agent coding tasks on 12 libraries and 4 languages; each agent gets an independently implementable feature. Cooperating agents achieve about 30% lower success than the same agent doing both features alone (secondary: GPT-5 and Claude Sonnet 4.5 reach about 25% in pairs, roughly half of solo). Failure modes: jammed communication (vague, ill-timed, inaccurate messages), commitment deviation, wrong expectations about the partner. Tests are hidden and expert-written. Peers, with chat. This is the closest academic analogue to murmur's setup and agrees with it: more communication did not fix it. Note the comparison is not token-matched (the solo agent does both jobs, so the two arms have similar total work but different parallelism).

### Claim Plane (arXiv 2608.00947) [verified abstract]
Pre-write admission: one model declares file scope, another codes inside it. On 30 feature pairs x 3 seeds, pair pass rose from 23.3% to 50.0% and integration success from 65.6% to 96.7%, but the static scheme serialised 96.7% of executions, so no wall-clock speedup. Hierarchical (a declaring planner), so it is outside murmur's rules, but it shows the cost of enforcing no-collision: the safe schedule is nearly sequential. Secondary corroboration: a supervisor meta-agent lifted CooperBench pair pass from 28.8% to 54.7% [secondary, from a search snippet; source not read].

### Others
- "Drop the Hierarchy and Roles" (Dochkina, arXiv 2603.28990) [verified abstract]: 25,000 tasks, 8 models, 4-256 agents, 8 protocols. A "Sequential" protocol (fixed order, but each agent chooses its own role and whether to participate) beat centralised coordination by 14% and fully autonomous protocols by 44%. Protocol explains about 44% of variance, model about 14%. Models below a capability threshold do better with assigned roles. Baseline is other protocols, not a single agent; tasks are LLM-judged simulations rather than coding. Respects non-hierarchy in spirit (agents pick their role, a fixed order is the only imposed structure). The fixed order is analogous to murmur's staggered entry, and the finding that autonomous-but-ordered beats fully free is consistent with murmur's "staggered entry helped form structure" [consistent, but weak evidence: a simulation without an external grader, as far as the abstract reveals].
- Failure as a Process: An Anatomy of CLI Coding Agent Trajectories (arXiv 2607.09510) [verified abstract]: 1,794 trajectories, 7 frontier models, OpenHands/MiniSWE/Terminus2 (single agents). Failures are mostly epistemic errors that start early and stay hidden until recovery is impossible. Supports the "stopping judgement and unnoticed errors" side of murmur's findings and argues for intermediate validation.
- MultiAgentBench / MARBLE (ACL 2025, arXiv 2503.01935) [secondary, search summaries]: 6 environments incl. coding; star, chain, tree and graph topologies; graph topology best in the research scenario, cognitive planning +3% milestone rate; GPT-4o-mini scored highest on average. Old models, no single-agent equal-token control that I could find.
- MacNet (ICLR 2025, arXiv 2406.07155) [secondary]: DAG-organised agents up to 1,000+; "collaborative scaling law" with logistic growth; irregular topologies beat regular ones. Not compute-matched against single agents (the abstract compares to single agents and other multi-agent setups); the logistic claim conflicts with murmur's "n=2 > n=3 > n=10" at a fixed budget, though MacNet does not hold the total budget fixed.
- More Agents Is All You Need (Agent Forest, arXiv 2402.05120) [secondary]: sampling and voting scales with number of agents, with the gain correlated to task difficulty. This is parallel sampling, not collaboration, and it needs a vote (a checkable answer format); another subagent covers it.
- Single-Agent Scaling Fails Multi-Agent Intelligence (arXiv 2512.08743) [secondary]: 41 models, 7 benchmarks; multi-agent understanding and planning improve only modestly while single-agent skills improve quickly. Supports "peers are not built for this".
- When Single-Agent with Skills Replace Multi-Agent Systems (arXiv 2601.04748) [verified abstract]: a single agent with a skill library matches MAS on reasoning benchmarks with fewer tokens and lower latency, but skill selection collapses past a library-size threshold (semantic confusability). Relevant to murmur's "role menu agents pick from" idea: a menu is fine until the options become confusable.
- Sycophancy in multi-agent systems (arXiv 2604.02668, "Too Polite to Disagree") [secondary, search snippet]: peers that agree with each other amplify errors; giving each agent a sycophancy prior reduced the effect by 10.5 points. Supports not relying on peer review for correctness.
- Studying Coordination and Collusion in Multi-Agent LLM Code Reviews (NeurIPS 2025 workshop) [secondary]: models in a review loop sabotage and preferentially request reviews from other saboteurs; adversarial and an unusual setting, mostly relevant to safety.
- Surveys: multi-vocal review of MAS for code generation, arXiv 2604.16321 [verified title/scope through snippets only; 114 studies]. I did not extract compute-matched claims from it.

## 3. Self-correction and peer review as an external signal

- Huang et al., "LLMs Cannot Self-Correct Reasoning Yet" (ICLR 2024, arXiv 2310.01798) [secondary for numbers: GPT-4 GSM8K 95.5 -> 91.5 after intrinsic self-correction; this specific figure came from a third-party summary, treat it with caution]. Intrinsic self-correction without external feedback does not help and can hurt. Many reported gains came from oracle labels used to decide when to stop correcting.
- Kamoi et al., "When Can LLMs Actually Correct Their Own Mistakes?" (TACL 2024, arXiv 2406.01297) [verified through ACL/arXiv search summaries, not the PDF]: no prior work shows successful self-correction using feedback from a prompted LLM, except on tasks especially suited to it; works with reliable external feedback; large-scale fine-tuning helps.
- Implication for murmur: a peer is the same model, so it is "feedback from a prompted LLM" with correlated errors (Phase Transition, 2601.17311; 2602.01011). It is not the external signal the literature says works. Reliable external signal in murmur's world means executing code the agent wrote itself (tests the agent writes, runs of the program) - which is allowed under the realism rule, and which Cursor and Anthropic reports say mattered. I found no study that measures cross-agent review as a test substitute with a hidden grader in compute-matched coding. The nearest are Agyn (reviewer role, vendor blog, not matched), "LLM Code Reviewers Are Harder to Fool Than You Think" (arXiv 2602.16741) and CR-Bench (arXiv 2603.11078), found only as titles in search results and not read, and practitioner posts recommending cross-vendor review (secondary, unquantified).
- Self-preference bias in LLM judges (search snippet, secondary): LLMs favour their own outputs; relevant to a swarm of same-model peers reviewing each other.

## 4. Coding frameworks reporting compute-matched comparisons
MetaGPT, ChatDev, AgentVerse, MapCoder and AgentCoder: I did not find a compute-matched comparison against a single agent in the sources I read. MAST uses ChatDev/MetaGPT-style traces to show failure rates, not baselines. The only matched-budget coding-adjacent numbers are EvoMAS (secondary) and the Claim Plane / CooperBench pair (solo vs pair on the same total work). Treat the multi-agent coding framework literature as uncontrolled.

## 5. Unexpected finds
1. **Phase Transition for Budgeted Multi-Agent Synergy (2601.17311)** gives a theory in which synergy exists only if communication fidelity and error decorrelation exceed a threshold. Same-model agents have high error correlation, so murmur's null result is what the theory predicts; staggered entry and private parallel attempts are the only levers that could lower correlation. Not yet a proof for coding, because the model is majority aggregation.
2. **Multi-Agent Teams Hold Experts Back (2602.01011)**: teams compromise rather than defer, and this grows with team size, which is a candidate mechanism for murmur's "yielding to a teammate" and for n=2 > n=3 > n=10.
3. **Equal-budget Reasoning (2604.02460)** warns that budget control through APIs is itself a source of artefact. murmur counts tokens including cache reads, which is the right guard, but note that a single agent given the same tokens through a "tokens left" line is not identical to a hard thinking-token budget.
4. **Claim Plane (2608.00947)** quantifies the trade-off murmur has felt: safe parallel writing means near-serial execution.
5. **Dochkina (2603.28990)** is the only academic paper I found that argues for role self-selection and scales it; its signal is that the fixed ordering, not roles, did the work. It is the closest to murmur's "role menu + staggered entry" design, but has no compute-matched single-agent control and no external grader that I could verify.
6. **Failure as a Process (2607.09510)** supports intervening on early epistemic errors; murmur has no mechanism for that beyond the agent's own judgement.

## 6. Per-source mapping to murmur (condensed)

| Source | Needs oracle | Non-hierarchy OK | Supports or contradicts | Test as profile vs C1T (one agent with a clock and tokens-left line) |
|---|---|---|---|---|
| 2512.08296 Scaling | Yes (benchmark scores), but it is about architecture choice | Mixed | Supports: planning/sequential tasks lose; matches "volume wins, planning not decided" | Profile "S-split": run a decomposable volume task with n=4 independent private attempts vs C1T at 4x tokens; predict gain only when the spec has independent modules |
| Anthropic multi-agent research | Internal eval | No (lead agent) | Supports "tokens explain variance" | C1T with a bigger token allowance vs a swarm at the same total; check if variance is explained by total tokens rather than n |
| 2604.02460, 2609.04217, 2606.13003, 2502.08788 | Gold answers | n/a | Support equal-spend ties | Already the murmur design; add per-agent token-matching audit |
| 2601.17311 Phase Transition | No (theory) | n/a | Supports: same-model peers have correlated errors | Cross-model swarm (e.g. a second model) vs same-model swarm; prediction: error decorrelation is the lever, not the board |
| 2602.01011 Teams hold experts back | Benchmarks | Peers | Supports "yielding" and n=2 > n=10 | Profile with a rule "defer only if the other agent's file is demonstrably better by running it"; measure yielding events |
| CooperBench 2601.13295 | Hidden tests | Peers | Supports: communication does not fix coordination | Two agents with no chat, only the shared folder (a "silent pair"), vs a pair with a board vs C1T at 2x tokens |
| Claim Plane 2608.00947 | Hidden tests | No | Contradicts non-hierarchy; supports "ownership/collisions are the cost" | Not applicable as-is; the peer variant is a self-declared file claim in the board (murmur's claim lever already tried) |
| 2603.28990 Self-organising | LLM-judged | Yes | Weakly supports staggered entry | Fixed order of entry (already murmur's staggered entry) with free role choice vs random entry |
| MAST 2503.13657 | No | Targets assigned roles | Supports termination/verification failures | Code murmur traces with the 14 modes to see which are new for peers |
| Kamoi / Huang | No | n/a | Supports: peer review without execution is weak | Profile: reviewer agent must run the author's code before commenting vs review by reading only |
| Kimi PARL | RL reward | No | Wall-clock only | Not testable (trained orchestrator) |
| Agyn 72.2% | Hidden tests | No | Weak, unmatched | Skip |
| EvoMAS, AgentCARD | Benchmarks | No | Heterogeneity helps | Mixed-model swarm if a second model is available |

## 7. Testable ideas (ranked, with oracle and fairness status)
1. **Decorrelate the peers, not the board.** Theory (2601.17311) and 2602.01011 say same-model peers share errors and compromise. Test: murmur with n=3 where agents get diversity by construction without assigned roles (different seeds/temperature are weak; a different second model is strong; staggered entry already tried) vs the same n=3 same-model swarm vs C1T at equal tokens. Oracle-free: yes. Fairness: equal total tokens, per-task means, k>=2. Caveat: a second model may not be available inside Pi OAuth.
2. **Silent pair vs boarded pair vs C1T at equal spend.** CooperBench found communication jammed; murmur's coordination turns eat 31-62% of tokens. Test: n=2 with only the filesystem as channel (no board) against n=2 with a board and C1T. Oracle-free: yes. Fairness: matched tokens; the grader sees only the final folder.
3. **Execution-grounded review.** Kamoi: feedback helps only when external. Test: a late-entering agent whose only permitted action is to run the program and write its own tests (no author-supplied tests), as a swarm member vs a C1T that does the same self-review at the end. Oracle-free: yes (the agent writes tests). Fairness: matched tokens. Risk: it adds a stopping-judgement lever, which murmur has found is the binding limit.

## 8. Open doubts
- Most compute-matched evidence is from one-shot reasoning benchmarks with answer checks; transfer to long-horizon coding with peers is unproven in either direction. I found no academic compute-matched comparison of peers editing one repo without a hierarchy.
- I read abstracts, not full papers. Numbers marked secondary (45% threshold, 41.8% MAST share, EvoMAS tokens, Agyn's +7.2) must be checked before citing. Several 26xx arXiv papers are known to me only from this session.
- The Google scaling paper's abstract revised its scope between versions (180 vs 260 configs), and the blog does not say whether tokens were matched; do not cite the 17.2x/4.4x figures as token-matched.
- Positive results often come from hierarchies (Anthropic lead agent, Claim Plane, Kimi orchestrator, Agyn manager, Cursor planners), which murmur excludes by design; their success does not transfer to peers.
- Could not read OpenAI-hosted pages, as in earlier reports; none were needed here.

## Sources

| Short name | URL | Status |
|---|---|---|
| Towards a Science of Scaling Agent Systems | https://arxiv.org/abs/2512.08296 ; https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/ | verified (abstract, blog) |
| MAST, Why Do Multi-Agent LLM Systems Fail? | https://arxiv.org/abs/2503.13657 | verified (abstract) |
| Anthropic multi-agent research system | https://www.anthropic.com/engineering/multi-agent-research-system | verified |
| Cognition, Don't Build Multi-Agents (12 June 2025) | https://cognition.com/blog/dont-build-multi-agents | verified |
| Anthropic C compiler (16 agents, lock files in current_tasks/, about $20k) | https://www.anthropic.com/engineering/building-c-compiler | verified (covered elsewhere) |
| Cursor, Scaling long-running autonomous coding | https://cursor.com/blog/scaling-agents | verified (covered elsewhere) |
| Single-agent vs MAS under equal thinking-token budgets | https://arxiv.org/abs/2604.02460 | verified abstract |
| Illusion of Multi-Agent Advantage | https://arxiv.org/abs/2606.13003 | verified abstract |
| At Equal Inference Cost, MA Structure Does Not Beat a Single Frozen Agent | https://arxiv.org/abs/2609.04217 | verified abstract |
| SwarmBench | https://arxiv.org/abs/2608.30661 | verified abstract (orchestration benchmark, not a single-vs-multi comparison) |
| Rethinking the Bounds of LLM Reasoning (MAD vs single agent) | https://arxiv.org/abs/2402.18272 | verified abstract |
| Stop Overvaluing Multi-Agent Debate | https://arxiv.org/abs/2502.08788 | secondary |
| Should we be going MAD? | https://arxiv.org/abs/2311.17371 | secondary (title only) |
| CooperBench | https://arxiv.org/abs/2601.13295 | verified abstract |
| Claim Plane | https://arxiv.org/abs/2608.00947 | verified abstract |
| Multi-Agent Teams Hold Experts Back | https://arxiv.org/abs/2602.01011 | verified abstract |
| Drop the Hierarchy and Roles | https://arxiv.org/abs/2603.28990 | verified abstract |
| Phase Transition for Budgeted Multi-Agent Synergy | https://arxiv.org/abs/2601.17311 | verified abstract |
| Multi-Agent Reasoning Improves Compute Efficiency | https://arxiv.org/abs/2605.01566 | verified abstract |
| AgentCARD, Specialize Roles, Mix Deployments | https://arxiv.org/abs/2606.20629 | verified abstract |
| Single-Agent with Skills Replace MAS | https://arxiv.org/abs/2601.04748 | verified abstract |
| Failure as a Process: CLI Coding Agent Trajectories | https://arxiv.org/abs/2607.09510 | verified abstract |
| Mo' Models, Mo' Problems | https://arxiv.org/abs/2609.17306 | secondary |
| Single-Agent Scaling Fails Multi-Agent Intelligence | https://arxiv.org/abs/2512.08743 | secondary |
| Kimi K2.5 (PARL, Agent Swarm) | https://arxiv.org/abs/2602.02276 | secondary |
| MultiAgentBench / MARBLE | https://arxiv.org/abs/2503.01935 | secondary |
| MacNet | https://arxiv.org/abs/2406.07155 | secondary |
| More Agents Is All You Need | https://arxiv.org/abs/2402.05120 | secondary |
| Huang et al., LLMs Cannot Self-Correct Reasoning Yet | https://arxiv.org/abs/2310.01798 | secondary |
| Kamoi et al., When Can LLMs Actually Correct Their Own Mistakes? | https://arxiv.org/abs/2406.01297 | secondary |
| Agyn multi-agent 72.2% SWE-bench Verified (vendor post) | https://dev.to/nikita_benkovich_eb86e54d/coding-agent-teams-outperform-solo-agents-722-on-swe-bench-verified-4of5 | verified (vendor writeup, weak) |
| EvoMAS | https://arxiv.org/abs/2602.06511 | secondary |
| Too Polite to Disagree (sycophancy in MAS) | https://arxiv.org/abs/2604.02668 | secondary |
| MAS for code generation multi-vocal review | https://arxiv.org/abs/2604.16321 | secondary |
| LLM Code Reviewers Are Harder to Fool; CR-Bench | https://arxiv.org/abs/2602.16741 ; https://arxiv.org/abs/2603.11078 | secondary (titles only, not read) |
