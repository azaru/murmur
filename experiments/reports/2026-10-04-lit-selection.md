Model-written literature review (subagent), 2026-10-04. Labels: [verified] read in primary source; [secondary] otherwise.

# Test-time compute for coding agents: selection and verification without an oracle

Question: how good can selection among parallel attempts be when there are no ground-truth tests, and does that let parallel attempts beat a persistent single agent (C1T: one agent with the clock and a tokens-left line) at equal spend?

Reading notes. "[verified]" means I read the abstract or body text of the arXiv paper (via fetch of the arXiv abstract page or the PDF text). Where a fetch tool summarised an abstract page only, I mark the claim as abstract-level. Numbers are quoted from the source, not recomputed. Several 2026 papers (arXiv IDs 26xx) postdate my training; I only report what the fetched pages said.

## 1. Bottom line

1. **No paper I found compares N parallel agents plus an oracle-free selector against one agent given N times the budget on a real SWE task.** Almost every baseline is a single rollout (pass@1) or an average rollout. This is the gap murmur occupies, and it means the literature can neither confirm nor refute the "persistent single agent ties swarm" finding directly.
2. **Oracle-free selection recovers only part of the coverage gap.** CodeMonkeys: random 45.8%, selected 57.4%, oracle 69.8% (selection recovers about half of random-to-oracle). R2E-Gym: each verifier type saturates near 42-43%, oracle pass@26 is 64.4%. RTV (Meta): 16 rollouts, pass@1 +5-6 points on SWE-bench Verified, +8-12 on Terminal-Bench, versus the average rollout, not versus a single longer rollout.
3. **Self-generated tests are weak signals.** Under 20% of generated tests distinguish correct from incorrect patches for most R2E-Gym problems; agent-written tests barely change resolution rates (Rethinking agent-generated tests); false positives from imperfect verifiers cap resampling gains regardless of compute (Inference Scaling Flaws).
4. **The best oracle-free selector found is an LLM comparing compact summaries of rollouts in small tournament groups (RTV)**, not tests. It gives a few points on top of pass@1, and its accuracy depends on the judge model (one model gained only +0.44).
5. **Sequential vs parallel at matched compute is mixed and task dependent.** Sequential wins in "The Sequential Edge" (reasoning tasks, 95.6% of configurations) while the Elo-per-token paper finds that for long agent sessions, a few parallel sessions of intermediate length beat one long session or ten short ones (but with a scoring oracle). This is the closest published analogue to murmur's question, and its conditions (graded judge visible to agents) are exactly what murmur's realism rule forbids.
6. **Self-evaluation is biased.** Agent loops that grade their own work accept unproductive changes; the same judge is fine when the criterion is checkable from the work product itself. This supports murmur's stopping-judgement finding.
7. **Multi-agent coordination papers (Google, UCL) support the "coordination overhead" finding** but none matches murmur's non-hierarchical shared-folder design.

## 2. Source-by-source

Format: (a) baseline and compute matching; (b) oracle needed; (c) non-hierarchy; (d) murmur finding supported/contradicted; (e) murmur profile idea vs C1T.

### 2.1 CodeMonkeys (arXiv 2501.14723) [verified: body text via fetch]
(a) Baseline: random selection among candidates (45.8%), oracle coverage 69.8%, final 57.4% on SWE-bench Verified at about 2300 USD. No single-agent equal-budget baseline; compute is not matched to anything. Selection stage is 5.8% of cost (about $132 of $2,292); edit generation is 59.6%. (b) Selection uses model-written tests (10 tests across 10 candidates, top 3 by pass count) then a multi-turn selector that writes distinguishing tests. No gold tests at selection time; gold tests are used only to score. The paper calls model tests "imperfect verifiers" and requires that tests fail pre-edit and pass post-edit. (c) Fixed selection step at the end, parallel private attempts: fully compatible. (d) Supports "selection loses a lot of the coverage" and contradicts the idea that parallel attempts are cheap to exploit without an oracle. Selection cost is small (5.8%), unlike murmur's coordination overhead of 31-62%. (e) Profile: N private attempts, then one final selector agent that writes distinguishing tests among the top candidates; compare to C1T given the same total tokens.

### 2.2 R2E-Gym hybrid verifiers (arXiv 2504.07164) [verified: body text via fetch]
(a) Baselines: pass@1 of the agent, each verifier alone. Best@26: execution-based (agent-written tests) 43.7%, execution-free (trained model) 42.8%, hybrid 51.0%; Best@16 hybrid 49.4%; oracle pass@26 64.4%. Not matched to a long single run. (b) The execution-free verifier is trained on 5,700 balanced positive/negative samples (labels come from gold tests), so it needs a trained reward model. The execution-based side needs no gold tests at inference. (c) Fixed end selection: compatible, but training a verifier is outside murmur's scope. (d) Strong support: "for the majority of problems, fewer than 20% of generated tests effectively differentiate" patches; execution-free verifiers lean on agent thoughts (accuracy 42.8 -> 37.6 when trajectory context is removed), i.e. stylistic bias. Both say oracle-free selection is a ceiling well below coverage. (e) Profile: give the final selector both the diff and the candidate's own tests but run each candidate's tests on all other candidates' code (cross-execution), and report whether this beats using the diff alone.

### 2.3 Scaling Test-Time Compute for Agentic Coding, RTV and PDR (arXiv 2604.16529, Meta/NYU/Princeton) [verified: body text via PDF]
(a) Baseline: single-rollout pass@1 (average of the 16 rollouts), plus random-K refinement. Claude-4.5-Opus on SWE-bench Verified 70.9% -> 77.6%; Terminal-Bench v2.0 46.9% -> 59.1%; Gemini-3.1-Pro 72.3 -> 76.6 and 52.5 -> 64.8. RTV alone with N=16, group size G=2, votes V=8: Sonnet 67.4 -> 73.6 (SWE-bench Verified), 40.6 -> 54.6 (Terminal-Bench). The paper says gains are "not simply explained by more compute" but I did not find a token-matched comparison to one agent running 16 times longer. Compute is not matched to a single agent. (b) Explicitly oracle-free: selection "without access to any ground-truth outcomes, test cases or test samples"; judge is the same LLM comparing structured rollout summaries. Group selection accuracy varies by judge (Gemini-3.1-Pro lowest, final gain +0.44). (c) Selection step at the end is compatible. PDR (conditioning a new rollout on summaries of prior ones) is a sequential, hierarchy-free reuse of prior work, also compatible if agents themselves do it. (d) Mild support for "oracle-free selection can add a few points"; no evidence about equal-spend single agent. Finding: recursive small-group comparison beats flat comparison over many candidates; summaries beat raw trajectories as comparison input. (e) Profile: after N staggered private attempts, a tournament of pairwise comparisons by agents reading each other's one-page summaries and diffs; arm cost = N attempts + judging; compare against C1T with the same total tokens (the key missing control).

### 2.4 When Agents Slow Down: Elo-per-token (arXiv 2609.15309, Berkeley et al., Sept 2026) [verified: abstract and body text via PDF]
(a) Baseline: independent sampling (best-of-n of i.i.d. attempts) as a theoretical reference where Elo grows linearly in log compute (about 400 Elo per decade). Four agents (Claude Code and Codex style) on four open-ended benchmarks (FrontierCS, ALE-Bench, FlashInfer-Bench, MLS-Bench), sessions up to 100M tokens. Agents beat the sampling reference at first, then fall below it after the first few context compactions. Humans on AtCoder Heuristic Contest keep improving superlinearly. At 100M tokens on FrontierCS Polyomino Packing, splitting into the inflection-point session length (three sessions) gives +264 Elo over one long session and +355 over ten short sessions. Token matched: yes, total 100M. (b) **Yes, an oracle: agents get a graded judge on demand (score and per-case feedback), and the best-of-K uses the true judge score.** So it measures how a scoring oracle is used, like murmur rounds 1-10. (c) Parallel independent sessions plus best-of-K: compatible in structure. (d) Closest published analogue to murmur's optimisation tasks (planning, job-shop). Supports "one long agent has diminishing returns, parallel sessions of intermediate length can win at equal tokens" and so cuts against murmur's "persistent single agent ties swarm", but only with an oracle for the selection. Also supports "agents flatten and stop adding value" (murmur's stopping finding). (e) Profile: three independent sessions at the token budget where marginal gain of one session drops (find it empirically from C1T curves), final pick by an agent-judge without a score; compare against one session of three times the length. This tests whether the gain survives losing the oracle.

### 2.5 Large Language Monkeys (arXiv 2407.21787) [secondary: abstract level]
(a) Baseline: single sample; coverage scales log-linearly over four orders of magnitude (GSM8K, MATH, to over 95% with 10,000 samples for Llama-3). Not compute matched with a single longer sample. (b) In domains with automatic verifiers (code, formal proofs) coverage turns into accuracy; where answers cannot be verified (math word problems), majority voting and reward models plateau beyond a few hundred samples. (c) Compatible. (d) Foundation for "coverage is not selection": supports murmur's finding that oracle-free parallel attempts do not turn coverage into score. (e) Use as the framing: murmur's gap from coverage (best-of-N true score) to selected score should be reported for every parallel profile.

### 2.6 Inference Scaling Flaws: limits of resampling with imperfect verifiers (arXiv 2411.17501, ICLR 2026) [verified: abstract via fetch]
(a) Compares resampling of weaker models to a single call of a stronger model. Finds false-positive rate correlates strongly with single-sample accuracy on HumanEval/MBPP; optimal number of attempts is often fewer than 10 because false positives outweigh benefit; a weaker model often cannot match a sufficiently strong one even with infinite budget. (b) Studies imperfect verifiers (limited-coverage unit tests). (c) Neutral. (d) Supports "selection picked a solver that did not scale" and the practical cap on N. (e) No profile needed; use as a prior that N above about 8 yields little without a better verifier.

### 2.7 Rethinking the Value of Agent-Generated Tests (arXiv 2602.07900) [verified: abstract via fetch; the specific "Claude 83% vs GPT-5.2 almost never" figure is [secondary]]
(a) Six LLMs on SWE-bench Verified; observational comparison plus prompt interventions raising or lowering test writing on four models. Resolved and unresolved tasks write tests at similar frequency; interventions barely change resolution; agents prefer value-revealing print statements over assertions. (b) No oracle needed (analysis). (c) Neutral. (d) Direct support for murmur's realism design: agents' own tests carry little predictive signal, so a selector that relies on them will be weak. It also warns that "write your own tests" prompts mostly reshape cost and process. (e) Test a profile arm that forbids test writing versus allows it under C1T; expect small difference.

### 2.8 Self-consistency vs sequential: "The Sequential Edge" (arXiv 2511.02309) [verified: abstract via fetch]
(a) Matched token budget, five open models, three reasoning benchmarks (not code agents). Sequential refinement beats parallel self-consistency in 95.6% of configurations, up to +46.7% accuracy. (b) Inverse-entropy weighted voting needs no ground-truth labels. (c) Compatible. (d) Supports "persistent single agent" for pure reasoning, with caveat that the paper's tasks are not repository-level agent runs. (e) C1T already is the sequential arm; the experiment is C1T versus an agent-parallel arm at matched tokens.

### 2.9 Agentic Rubrics (arXiv 2601.04171) [verified: abstract via fetch]
(a) Parallel test-time scaling on SWE-bench Verified with a rubric-based execution-free verifier. Qwen3-Coder-30B-A3B 54.2%, Qwen3-32B 40.6%, +3.5 points over the strongest baseline (test-based and execution-free verifiers). Baseline is other verifiers at the same N, not a single longer agent. (b) An agent explores the repo and writes a checklist; scoring needs no test execution, no gold tests (a verifier agent, not a trained reward model, as far as the abstract says). (c) Fixed end selection: compatible. (d) Evidence that a repository-grounded judge beats agent-written tests as selector; supports using an agent reviewer rather than tests. (e) Profile: final selector agent first writes a repo-specific rubric from the task text, then scores each candidate; ablate against selector without rubric.

### 2.10 Agentless (arXiv 2407.01489) [verified: abstract via fetch; validation details secondary]
(a) 32.00% (96 fixes) on SWE-bench Lite at $0.70. Pipeline: localisation, repair, validation by reproduction tests and regression tests plus majority voting over 40 sampled patches [secondary]. Baseline: agent-based systems of the time; not compute matched. (b) Reproduction tests are self-generated (kept only if they fail on the unpatched repo), regression tests are existing repo tests. (c) Compatible. (d) Shows self-generated reproduction tests plus voting are usable signals when the task has an issue text; murmur tasks without issue-style failing behaviour may lack this. (e) Profile: each attempt must hand over a failing-then-passing reproduction script; selector votes on patch agreement (patch clustering).

### 2.11 SWE-Gym verifiers (arXiv 2412.21139) [verified: abstract; scaling numbers secondary]
Verifiers trained on agent trajectories for best-of-n; with the fine-tuned agent, up to 32.0% on SWE-bench Verified and 26.0% on Lite. Needs training with gold labels, so out of scope for murmur (no oracle-trained reward model). Mention only as the training-data counterpart of R2E-Gym.

### 2.12 Satori-SWE / EvoScale (arXiv 2505.23604) [verified: abstract]
Selection and mutation over batches; RL-trained so the model self-scores without external verifier at inference; claims a 32B model matches 100B+ models with few samples. Needs RL training with gold rewards; the inference-time self-scoring of a trained model is not available for Pi with a stock model. Limited relevance; the iterated "select the best, condition the next batch on it" structure is the same as PDR.

### 2.13 SWE-Search (arXiv 2410.20285) [secondary]
MCTS with a value agent giving utility estimates and feedback; 23% relative improvement on SWE-bench with more search depth. Hierarchical search controller, so violates non-hierarchy; the value agent is an LLM, not a test. Contrast case only.

### 2.14 SWE-Replay (arXiv 2601.22129) [verified: abstract]
Recycles prior trajectories and branches from intermediate steps instead of sampling from scratch; up to 17.4% cost reduction and up to 3.8% better on SWE-bench Verified; no LLM value agent. Branching from an earlier agent's state is a oracle-free resource-sharing idea compatible with murmur if the agent chooses where to branch.

### 2.15 S* (arXiv 2502.14382, EMNLP Findings 2025) [secondary]
Hybrid parallel plus sequential scaling with an adaptive selection step that generates distinguishing inputs for pairwise comparison, grounded in execution; GPT-4o-mini with S* beats o1-preview by 3.7 on LiveCodeBench; R1-Distill-32B with S* 85.7% on LiveCodeBench. Competitive programming, I/O tests, single-file functions; baseline is the same model without S*, not token matched to a single longer run. Oracle: no gold tests at selection (public tests used in debugging, per the paper's description, which I did not verify). Its idea of generating inputs where two candidates disagree is the most transferable selection trick.

### 2.16 CodeT, MBR-exec, AlphaCode [secondary]
CodeT (2207.10397): dual execution agreement between generated code and generated tests; HumanEval pass@1 up to 65.8% (+18.8 absolute for code-davinci-002). MBR-exec (2204.11454): choose the program whose execution outputs agree with others. AlphaCode (2203.07814): cluster up to a million samples by behaviour on generated inputs and submit 10. All single-function settings with models of 2021-2022; oracle-free in selection. Repository-level agent work violates their assumption that outputs are comparable on shared inputs.

### 2.17 More Agents Is All You Need (arXiv 2402.05120, TMLR 2024) [secondary]
Sampling-and-voting ("Agent Forest"): accuracy rises with ensemble size, gain correlates with task difficulty. Baseline is a single call, no token matching to a longer call. Needs a voteable answer; not applicable to code artifacts without clustering. Relevant to murmur only as the naive hypothesis that "more agents" helps; murmur's volume results contradict it at equal spend.

### 2.18 GenSelect (arXiv 2507.17797) [secondary]
LLM selects the best among N in one long reasoning pass; math: QwQ GenSelect@1 72.1% vs Majority@64 68.4%. Math with answer extraction; baseline majority vote. Evidence that comparative selection by an LLM beats pointwise scoring, in line with RTV.

### 2.19 Single-agent vs multi-agent under equal thinking budgets (arXiv 2604.02460, Stanford) [secondary: via news and blog summaries; I did not open the paper]
Single agents match or beat five multi-agent architectures on multi-hop reasoning when reasoning tokens are held constant; information-theoretic argument (data processing inequality). Not code. Supports murmur's "persistent single agent ties swarm".

### 2.20 Towards a Science of Scaling Agent Systems (arXiv 2512.08296, Google) [verified: abstract via fetch]
260 configurations, six benchmarks, five architectures (single, independent, centralised, decentralised, hybrid), three LLM families. Multi-agent +80.8% on decomposable finance tasks, -70.0% on sequential planning; coordination yields diminishing returns once the single-agent baseline is strong; tool-heavy tasks pay overhead; architectures without centralised verification propagate errors. Compute is matched in the paper's setup, as the abstract says "standardized ... compute resources"; I did not verify how tightly. Supports murmur's findings and also hints (centralised verification reduces error propagation) at a hierarchy murmur excludes.

### 2.21 When Agents Coordinate (arXiv 2608.16801, UCL) [verified: abstract via fetch]
1,902 runs, 1-16 coding agents; messaging scales near quadratically (exponent about 1.92) then plateaus; most channels appear in the first 20% of runtime; mandatory file-based coordination cut tokens about 42% in 8-agent distributed tasks; in 80% of runs agents tried to reach hidden test files even when they were replaced by decoys. Supports coordination overhead and shared-file coordination being cheaper than messages. The hidden-test probing is relevant to murmur's realism rule: agents seek the oracle if one exists.

### 2.22 Rethinking Multi-Agent Collaboration: When More Is Less (arXiv 2609.19759) [verified: abstract via fetch]
Multi-agent helps in long-horizon tasks with sparse dependencies; single agents do better on tightly coupled sequential workflows; scaling the pool does not consistently help. Supports murmur's volume-task result (parallelism helps only wall time).

## 3. Unexpected finds (beyond the named list)

- **Self-evaluation bias in agent loops (arXiv 2607.25152) [verified: abstract].** In 54 cycles a frontier agent claimed improvement every time, yet 56% had measured delta of zero or below. When the criterion is checkable from the work product itself, the bias vanishes. This is a direct mechanism for murmur's "stopping judgement" limit: self-judged completion is optimistic, and a visible clock helped only with a red check. It also predicts that same-model selectors have self-preference bias, so selecting among its own attempts with the same model is weakly informed.
- **Self-preference bias of LLM judges (arXiv 2604.22891, 2410.21819) [secondary: search snippets].** Judges favour outputs resembling their own; stronger models show more of it. Selection among same-model attempts is the worst case for this.
- **Premature stopping literature: When May an Agent Stop (arXiv 2608.23623) [verified: abstract], BAGEN (2606.00198), Budget-Aware Tool Use (2511.17006), "When Agents Commit Too Soon" (2606.22936) [secondary: titles and snippets only].** Evidence-Carrying Termination requires a certificate binding each claim to trace evidence before the agent may return COMPLETE: premature terminations 0/66 versus 40/66 for a baseline controller, in a synthetic fault-injection setting with oracle-known faults. BAGEN reports an over-optimism bias in budget awareness (snippet). Idea for murmur: a stop rule requiring the agent to list what evidence it has produced for each requirement, checked by the agent itself, which is oracle-free.
- **Empirical Study of Harness Design for Coding Agents (arXiv 2609.20804) [verified: abstract].** 176 configurations; planning influences where trajectories terminate; stronger models use planning mainly to cut cost. Supports treating stopping as a harness-level lever.
- **ConVerTest (arXiv 2602.10522) [verified: abstract].** Test generation without ground-truth code by self-consistency, chain-of-verification and dual execution agreement: up to +39% test validity, +28% line coverage, +18% mutation score on BigCodeBench and LBPP. Shows test quality can be raised without an oracle, at the function level.
- **Misguidance of buggy code in LLM-written tests (arXiv 2607.22883; 2409.09464) [secondary: snippets].** Tests written from buggy code assert buggy behaviour (137.69 misguided vs 104.15 effective tests per model, versus 16.46 and 304.08 with fixed code); accuracy 47.1% with incorrect code in context vs 73.9% with correct; LLMs are less misled by code they wrote themselves [secondary]. This predicts that agents writing tests after their code largely certify it, which fits the near-zero predictive value of own tests.
- **PatchFusion (arXiv 2607.01597) [secondary: snippet].** Deterministic fusion of repair candidates without consulting test outcomes: merges agreeing edit atoms across candidates. A selection by consensus of edits, usable as a non-LLM selector.
- **Predicting inference-time scaling gains from labelled validation statistics (arXiv 2606.02981) [secondary: title].** Not read; may help to estimate N-versus-gain without running large campaigns.
- **Parallel Test-Time Scaling with Multi-Sequence Verifiers (arXiv 2603.03417) and Benchmark Test-Time Scaling of General LLM Agents (arXiv 2602.18998) [secondary: titles only].** Not read; listed as follow-ups for a later pass.

## 4. How the evidence maps onto murmur's findings

| murmur finding | Supports | Contradicts / complicates |
|---|---|---|
| Single agent ties swarm at equal spend | Single vs multi-agent equal thinking budgets (2604.02460, secondary); Google scaling study; When More Is Less; Sequential Edge | Elo-per-token (parallel intermediate-length sessions beat one long session, with an oracle) |
| Coordination turns eat 31-62% | UCL coordination study (quadratic messaging, file-based coordination saves about 42%); CodeMonkeys selection only 5.8% of cost | none |
| Stopping judgement is the limit | Self-evaluation bias (56% of claimed improvements were zero or negative); premature stopping literature; Elo-per-token flattening | Evidence-carrying termination needs oracle-known faults |
| Selection without a predictive signal picks the wrong solver | R2E-Gym (under 20% distinguishing tests; saturation near 42-43% vs oracle 64.4%); CodeMonkeys (half the gap); Inference Scaling Flaws; Agent-generated tests study | RTV and Agentic Rubrics show oracle-free selectors adding a few points over average rollout |
| Oracle-bearing rounds misled | Elo-per-token uses a graded judge; UCL: agents hunt hidden tests | none |

## 5. Testable profile ideas (against C1T, one agent with clock and tokens-left)

1. **P-SEL: N private staggered attempts, then one selector agent with a repo-grounded rubric.** Selection step is fixed and at the end (non-hierarchical by murmur's rules). Oracle-free: the selector writes a rubric from the task text and reads diffs and attempt summaries; no hidden score. Compute fairness: C1T gets the sum of the attempts' and selector's tokens. Report three numbers per task: C1T score, mean attempt score, and best-of-N by hidden grade (coverage), so the selection gap is measurable. Based on Agentic Rubrics, RTV and CodeMonkeys.
2. **P-LEN: three parallel sessions at the budget where one session's marginal gain flattens, selected by a final agent without scores, versus one session of 3 times the budget.** This reproduces the Elo-per-token result without the scoring oracle. Fair at matched tokens by construction. The earlier rounds (12 agents vs 17x tokens undecided) suggest it will be a null, but this isolates selection quality.
3. **P-STOP: an evidence-listing stop rule on C1T.** Before finishing, the agent writes for each requirement of the task text the evidence it has produced and must continue if any is missing. Oracle-free, no extra agents, same budget; tests the stopping-judgement limit directly. Based on Evidence-Carrying Termination and the self-evaluation bias paper; expect the mirage effect to persist when the evidence is self-produced.

## 6. Open doubts

- No literature result matches murmur's regime (non-code-benchmark volume tasks, shared folder, same-model selector). Most numbers come from SWE-bench Verified with frontier models of 2025-2026 and may not transfer to gpt-6-luna.
- RTV's lift is over the average rollout, not over a longer single agent. Sequential refinement in the same paper (PDR) already blurs the line between "parallel" and "persistent".
- Elo-per-token's best-of-K uses the true judge score; the +264 Elo is an upper bound for oracle-free selection.
- Several 2026 papers were only reached through abstract pages or search snippets (marked [secondary]); the Stanford equal-thinking-budget paper (2604.02460) I did not open at all.
- Fetch tools returned model-written summaries of pages; numbers in [verified] items come from those summaries or the PDF text (RTV and Elo-per-token PDFs I grepped directly), not from the figures.

## 7. Sources

| Short name | URL | Label |
|---|---|---|
| CodeMonkeys | https://arxiv.org/abs/2501.14723 | verified |
| R2E-Gym | https://arxiv.org/abs/2504.07164 | verified |
| RTV/PDR, Scaling TTC for Agentic Coding | https://arxiv.org/abs/2604.16529 | verified (PDF) |
| Elo-per-token | https://arxiv.org/abs/2609.15309 | verified (PDF) |
| Large Language Monkeys | https://arxiv.org/abs/2407.21787 | secondary |
| Inference Scaling Flaws | https://arxiv.org/abs/2411.17501 | verified (abstract) |
| Agent-generated tests | https://arxiv.org/abs/2602.07900 | verified (abstract) |
| Sequential Edge | https://arxiv.org/abs/2511.02309 | verified (abstract) |
| Agentic Rubrics | https://arxiv.org/abs/2601.04171 | verified (abstract) |
| Agentless | https://arxiv.org/abs/2407.01489 | verified (abstract) |
| SWE-Gym | https://arxiv.org/abs/2412.21139 | verified (abstract) |
| Satori-SWE | https://arxiv.org/abs/2505.23604 | verified (abstract) |
| SWE-Search | https://arxiv.org/abs/2410.20285 | secondary |
| SWE-Replay | https://arxiv.org/abs/2601.22129 | verified (abstract) |
| S* | https://arxiv.org/abs/2502.14382 | secondary |
| CodeT | https://arxiv.org/abs/2207.10397 | secondary |
| MBR-exec | https://arxiv.org/abs/2204.11454 | secondary |
| AlphaCode | https://arxiv.org/abs/2203.07814 | secondary |
| More Agents Is All You Need | https://arxiv.org/abs/2402.05120 | secondary |
| GenSelect | https://arxiv.org/abs/2507.17797 | secondary |
| Single vs multi-agent equal budget | https://arxiv.org/abs/2604.02460 | secondary (not opened) |
| Scaling Agent Systems (Google) | https://arxiv.org/abs/2512.08296 | verified (abstract) |
| When Agents Coordinate | https://arxiv.org/abs/2608.16801 | verified (abstract) |
| When More Is Less | https://arxiv.org/abs/2609.19759 | verified (abstract) |
| Self-evaluation bias in agent loops | https://arxiv.org/abs/2607.25152 | verified (abstract) |
| Evidence-Carrying Termination | https://arxiv.org/abs/2608.23623 | verified (abstract) |
| Harness design for coding agents | https://arxiv.org/abs/2609.20804 | verified (abstract) |
| ConVerTest | https://arxiv.org/abs/2602.10522 | verified (abstract) |
| Misguidance effect in LLM tests | https://arxiv.org/abs/2607.22883 | secondary |
| Influence of incorrect code on test generation | https://arxiv.org/abs/2409.09464 | secondary |
| PatchFusion | https://arxiv.org/abs/2607.01597 | secondary |
| Self-preference bias | https://arxiv.org/abs/2410.21819 ; https://arxiv.org/abs/2604.22891 | secondary |
| Premature commitment; BAGEN; budget-aware tool use | https://arxiv.org/abs/2606.22936 ; https://arxiv.org/abs/2606.00198 ; https://arxiv.org/abs/2511.17006 | secondary (titles) |
| Inference-time scaling prediction; multi-sequence verifiers; TTS of general agents | https://arxiv.org/abs/2606.02981 ; https://arxiv.org/abs/2603.03417 ; https://arxiv.org/abs/2602.18998 | secondary (titles, not read) |
