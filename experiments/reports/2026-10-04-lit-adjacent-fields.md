Model-written literature review (subagent), 2026-10-04. Labels: [verified] read in primary source; [secondary] otherwise.

Scope: adjacent fields where populations of agents or searchers are compared with one searcher (LLM evolutionary search, ML-engineering agents, MARL/collaboration training, SAT/optimisation portfolios, crowdsourced contests, theorem proving). Not repeated: the Astra/HF incident, selection/verifier work for code, single-vs-multi LLM studies, stigmergy, stopping, heterogeneity, human group science.

Method note. Search snippets were thin, so I fetched arXiv abstract pages. "[verified]" below means: the abstract (and in two cases the HTML body) was read on arxiv.org/jair.org; I did NOT read full papers except where I say "body read". Numbers quoted are from those pages. Anything from search summaries only is [secondary]. Fetch summaries came from a small model; I only used verbatim abstracts for numbers. Several 2026 arXiv ids (26xx.xxxxx) were fetched successfully but are recent and not independently replicated.

## 1. Headline findings (most relevant first)

1. **Every LLM-evolution system needs a fitness function; the oracle-free variants exist but are early.** FunSearch, AlphaEvolve, ShinkaEvolve, DGM all score candidates with an external evaluator ("empirically validates each change using coding benchmarks", DGM abstract [verified]). The two oracle-free lines I found: (a) *pairwise validator* replacing the scalar reward at the accept/reject gate in GEPA, ADRS and ShinkaEvolve; "matches or exceeds the full-reward baseline on the majority of settings", survives a cross-family validator swap (arXiv 2607.14408, abstract [verified]); (b) MADE, which uses LLM judges and first decomposes the vague spec into "specific, verifiable sub-requirements" to get stable selection pressure; DevAI requirement satisfaction 39.9% to 61.9% (arXiv 2511.19489, abstract page [verified]). Both still have a human-written task spec or labelled domain; neither has agents writing their own test instances. This is the closest published analogue to murmur's "agents build their own evaluation" rule, and it says: judge pairs, and decompose the spec into checkable clauses first.

2. **Self-reports are unreliable evidence, so peer evaluation must execute, not opine.** Environment-grounded audit of LLM operators in evolutionary search: 200 runs, 12,249 self-reports, top-100 success rates overstated 4.8x to 9.3x (arXiv 2609.00652, abstract [verified]). Supports murmur's `findings` design (command run by the harness) and warns against any "I verified it works" board post as a selection signal.

3. **The strongest direct evidence that a shared channel helps parallel search is about negative results, not ideas.** "Recovering Wasted Compute in Autoresearch Agents" (arXiv 2608.10424; HTML body read): a shared "debug consultant" registry of runtime constraints across all branches of an AIDE tree. Gold medals 22 to 38, valid submissions 81% to 100%, redundant bug encounters 46% to 7.8%, valid-node share 54.7% to 79.0% (as reported by the fetch summary of the body; one task set, tabular Kaggle, no multi-agent baseline at equal tokens). This is the SAT clause-sharing idea at agent level: share *learned constraints*, not plans. Same paper: tree search "does not explore" and agents "do not use analysis for decisions".

4. **Clause sharing beats pure diversification in SAT, even with identical solvers.** MallobSat (JAIR 2024): "clause sharing results in effective parallelization even if all threads execute identical solver programs that only differ based on which clauses they import at which times"; "a clause-sharing solver where adding some explicit diversification is useful but not essential"; doubles HordeSat's mean speedup; competition-ranked 2020-2023 (abstract [verified]). Key transferable point: the shared items are small, machine-checkable, and *safe to import blindly* (a learned clause is implied by the formula). A murmur board of prose is the opposite. Contradicts the idea that agents "converge on one approach" is a problem per se; in SAT convergence on shared lemmas is the gain.

5. **Untrained models are measurably bad at collaboration, which fits murmur's null results; part of it is fixable with a protocol.** CooperBench: two coding agents achieve about 30% lower success than one doing both tasks; failures: jammed vague messages, broken commitments, wrong expectations about the partner (arXiv 2601.13295, abstract [verified]). Multi-Agent Teams Hold Experts Back: self-organising LLM teams fail to match their best member, loss up to 41.1% on ML benchmarks, "integrative compromise" grows with team size (arXiv 2602.01011 [verified]). Collaboration Tax (2608.22152 [verified]): tax falls monotonically with capability; a four-stage cascade (ungrounded claims, no queries to partner, no integration, accepting without re-derivation); "a prompt intervention targeting all four stages closes a substantial fraction of the gap". More Capable, Less Cooperative (2604.07821 [verified]): o3 reaches 17% of optimal collective performance, o3-mini 50%; explicit protocols about double competence-limited models. Alem (2606.08340 [verified]): 13 LLMs about 6% normalised return zero-shot; "individual task competence does not imply coordination competence"; communication is the largest ablation gain there.

6. **Training for collaboration works only when training is joint and has a verifier reward.** MAPoRL: "training individual LLMs alone is insufficient to induce effective collaboration"; joint multi-agent RL with a verifier reward helps and generalises (arXiv 2502.18439, abstract [verified]). Kimi K2.5 PARL: orchestrator trained with RL, sub-agents frozen, "up to 4.5x lower latency over single-agent baselines" (arXiv 2602.02276, abstract [verified]). Note the claim is latency, matching murmur's "12 agents win on speed". PARL is hierarchical (trained orchestrator), so it is outside murmur's rules. A population of non-trained agents therefore sits in the regime these papers call weak.

7. **Test-time scaling of general agents plateaus on both axes, with a "verification gap" for parallel.** Ten agents, realistic mixed benchmark: "neither scaling axis can consistently yield meaningful gains ... scaling plateau ... and verification gap that undermines parallel scaling" (arXiv 2602.18998, abstract [verified]). An earlier study found parallel sampling, list-wise verification/merging and diversified rollouts help (arXiv 2506.12928, abstract [verified]). The split is consistent with murmur: parallel gain needs a selector that works.

8. **Population only beats a single lineage when the archive keeps stepping stones; the ablation is against greedy descent.** DGM: without open-ended archive (build only on latest agent) it "performed poorly" (23.0% SWE-bench, 14.0% Polyglot per search summary [secondary]; full DGM 20.0 to 50.0 and 14.2 to 30.7, abstract [verified]). ShinkaEvolve HTML body read: weighted parent sampling beats hill climbing and random "across all tasks"; "hill climbing shows strong initial performance but plateaus quickly"; embedding-based novelty rejection gives "substantial" gains; 150 samples for a new circle-packing record (abstract [verified]). Parallel: murmur's single agent writes a quick greedy and stops. The evolutionary literature says that greedy-then-stop is exactly the baseline that populations beat *when continued for many iterations with a score*. Baselines there are single-lineage hill climbing at equal sample count, so compute-matched, but always with an oracle.

## 2. Per-field analysis

### 2.1 LLM-driven evolutionary and open-ended search (FunSearch, AlphaEvolve, ShinkaEvolve, OpenEvolve, DGM, ThetaEvolve)
(a) Evidence: AlphaEvolve white paper reports 48 scalar multiplications for 4x4 complex matrices [verified abstract]; ThetaEvolve gets new bounds with a single small LLM plus a large program database, and RL at test time beats inference-only (2511.23473 [verified]). Island model and MAP-Elites database are described in secondary sources; I found no clean published ablation of AlphaEvolve's database vs none [secondary; searched, not found]. Baselines: hill climbing/single LLM at equal samples (ShinkaEvolve body) are compute-matched; DGM's no-archive variant too.
(b) Oracle: yes, always a programmatic score. Proxy by agents themselves: the pairwise-validator and MADE lines (section 1.1) show the gate can be an LLM judge; for optimisation tasks the agents can write an instance generator and a feasibility checker themselves, and the objective is computable on any instance, so the "score" is self-built and sound (unlike a quality judgement). The risk is shared blind spots, the same model writing both solver and checker.
(c) Non-hierarchy: archive plus sampling is non-hierarchical in spirit, but all of these have a central controller that selects parents. A murmur analogue is a shared folder of candidate solvers where each agent chooses its parent.
(d) Explains: why single agent + greedy stop loses to long runs with scores; why parallel private attempts need selection. Contradicts nothing; it predicts 12 agents help only with a real evaluator, which is what murmur found.
(e) Test: see idea B.

### 2.2 Judging without ground truth (AI co-scientist, Multi-Agent Evolve, pairwise validators)
(a) AI co-scientist uses an Elo tournament of hypotheses ranked by debate; Elo auto-ratings correlate with GPQA diamond accuracy and with human preference [secondary, search summaries of Google/DeepMind posts; I did not read the paper]. It has a supervisor and specialised agents, so it is hierarchical. Multi-Agent Evolve (Proposer/Solver/Judge from one LLM, RL): +4.54% average on Qwen2.5-3B (2510.23595 [verified]); small-scale, trained, not a compute-matched test against single-agent.
(b) Needs no external ground truth but needs a notion of "better" encoded in the judge; correlation with truth was checked against a benchmark by the authors, i.e. an oracle was used to validate the proxy. TTRL-family methods use majority vote as pseudo-reward and "can actively amplify" a systematic flaw (search summary of 2504.16084 and follow-ups [secondary]).
(c) Tournaments among peers fit non-hierarchy if every agent both submits and judges (symmetric roles).
(d) Matches murmur's finding that agents converge: majority-style signals reward convergence.
(e) Test: idea B uses pairwise running instead of judging.

### 2.3 ML-engineering and Kaggle agents (MLE-bench, AIDE, ML-Master, R&D-Agent, AIRA-dojo/AIRA_2, ScienceFlow)
(a) MLE-bench: 75 competitions; o1-preview + AIDE got at least bronze in 16.9% (2410.07095 [verified]). The leaderboard figures in search results (R&D-Agent 35.1 ± 0.4 with gpt-5, ML-Master with parallelism 3, ML-Master 2.0 56.44%) are [secondary]. ScienceFlow reports 70.22% Any-Medal on full MLE-bench in 24 h with state re-anchoring and an evidence-aware execution controller (2608.14354 [verified abstract]); a fetch summary claims it found single-agent designs often beat naive parallelism but the abstract does not say so, so I discard it. AIRA-dojo: search policy (greedy, MCTS, evolutionary) and operator set interact, best raises MLE-bench lite 39.6% to 47.7%, and there is a validation/test generalisation gap that causes overfitting under long search (2507.02554 [verified]). AIRA_2: asynchronous worker pool (throughput linear), "Hidden Consistent Evaluation", ReAct agents; mean percentile rank 81.5% at 24 h vs 72.7% best baseline (2603.26499 [verified]).
(b) Oracle: a validation split, which the agent builds itself in real Kaggle practice, and a hidden test split. That is the closest to murmur's rule: the agent writes its own cross-validation. AIRA shows that this self-made proxy overfits as search lengthens, a direct warning for self-built evaluators.
(c) Parallel workers sharing one tree are centralised, but the useful part (shared debug registry, 2608.10424) is not.
(d) Explains: gains come from throughput of experiments, shared failure knowledge and operator quality, not from agent count. Consistent with murmur "12 agents win on speed".
(e) Test: idea A.

### 2.4 Research-agent teams (Agent Laboratory, AI Scientist v1/v2, PaperBench)
(a) AI Scientist-v2: tree search plus experiment-manager agent, one of three autonomous workshop papers cleared the average human acceptance threshold [secondary, search summary]. Agent Laboratory: role pipeline (PhD, Postdoc, ML Engineer, Professor) [secondary]. PaperBench: best agent 21.0% (Claude 3.5 Sonnet New) [secondary]. I found no compute-matched multi-vs-single comparison for these.
(b) Graded by rubric and LLM judge, i.e. a proxy built by the benchmark owner.
(c) Role pipelines are assigned roles: out of scope.
(d) Little to add; treat as absence of evidence.

### 2.5 MARL and collaboration training
See section 1, items 5 and 6. (a) No compute-matched baseline in CooperBench except "same two tasks done by one agent", which is the right control: solo beat pair by about 30%. (b) MAPoRL needs a verifier; PARL needs task reward. (c) PARL is hierarchical, MAPoRL peer. (d) Explains the null swarm results as a capability gap in the base model; the Collaboration Tax says the tax shrinks with capability, so a stronger model could shift this. (e) A protocol line in the briefing aimed at the four-stage cascade (idea C) is the cheap, untrained analogue of what training does.

### 2.6 Anytime, portfolio, restart and clause-sharing algorithms (SAT, CSP, planning)
(a) Gomes and Selman: runtime distributions of backtrack search are heavy-tailed; randomised restarts and portfolios remove the tail, speedups of up to two orders of magnitude on SAT/CSP encodings of planning, scheduling and circuit synthesis [secondary: search summary of the JAR paper; I did not open the PDF]. "A portfolio of possibly on-average slower algorithms can significantly outperform a single arbitrarily efficient one" (search snippet of algorithm-portfolio literature [secondary]). MallobSat: see section 1.4 [verified].
(b) Oracle: in SAT the solver's output is checkable (model or proof), and portfolio members race on the *same* instance, so the winner is self-evident. For optimisation, the proxy is the objective value on any instance the agent can generate, plus feasibility checkers, so "agents build their own evaluation" is natural here.
(c) Fully non-hierarchical: portfolios, restarts and clause sharing have no planner. This is the best fit among the fields.
(d) Explains: heavy tails predict that a *single* quick greedy attempt has high variance; 12 agents on identical prompts are not a portfolio (same distribution), and without sharing they just restart. Predicts that gain from parallel agents depends on variance of single-agent outcomes. murmur's own Pi n=1 noise of 0.0-0.75 (AGENTS.md) is heavy-tailed-like, so racing or restarting should pay IF a self-evaluation can choose the winner. Contradiction risk: if the single agent's failure is "stops too early" rather than "unlucky", restarts do not help; persistence does.
(e) Test: ideas A and B.

### 2.7 Crowdsourced contests, competitive programming, Netflix-style blending
(a) Boudreau and Lakhani field experiment with TopCoder: 122 solvers made 650 solutions in two weeks; 30 beat the internal Harvard and NIH solutions; contest (final disclosure, independent work) produced more diverse and novel approaches, while intermediate disclosure (community) made solvers converge on a few pathways [secondary: search snippets of HBS working paper; PDF unreadable via fetch]. Netflix Prize: independent teams merged (BellKor + Big Chaos + Pragmatic Theory) and a blend of different techniques beat any single one; winning submission came 24 minutes before the end [secondary, popular summaries]. AlphaCode 2 and ICPC-style systems: not read, skipped (sampling plus filter, covered by the selection subagent).
(b) Oracle: Netflix had a held-out RMSE that every blender used; contests have a public leaderboard. Without it, blending weights cannot be learned. The TopCoder result is the human analogue of murmur's earlier finding that parallel private attempts win only when a score predicts the grade, and shows that *sharing intermediate work reduces diversity*, consistent with "agents converge" and "boards cost tokens".
(c) Independent attempts with a final merge are non-hierarchical.
(d) Explains: board harms diversity; selection needs a signal.
(e) See idea B (staged disclosure: private until an end-of-run cross-evaluation).

### 2.8 Theorem proving and math (Aristotle, IMO systems, Deep Think)
(a) Gemini 2.5 Deep Think uses parallel thinking: multiple candidate solutions generated in parallel then revised or combined, reaching IMO 2025 gold (5 of 6 problems, 35 points) [secondary, news summaries]. A model-agnostic IMO pipeline uses generation, verification and refinement roles with a verifier score in {0, 0.5, 1} and meta-verifiers (arXiv 2507.15855, search-result description [secondary]). Aristotle: highly parallel Monte Carlo Graph Search in Lean with a formal checker [secondary, search summary of arXiv 2510.01346].
(b) The Lean kernel is the oracle; the informal pipelines use LLM verifiers with a meta-verifier, i.e. an LLM-built proxy that is itself audited, closest to a self-built evaluator. Relevant caveat from 2.1: self-reports overstate.
(c) Pipelines are role-assigned; parallel MCGS is not.
(d) Parallel sampling plus a verifier works where verification is cheaper than generation; murmur's optimisation tasks are exactly that case if the checker is feasibility+objective evaluation.

## 3. Cross-cutting lessons for murmur

- **What gets shared matters more than whether anything is shared.** SAT clauses, debug constraints and verified findings are cheap, small and importable without trust. Prose plans and opinions invite "integrative compromise" and unverifiable claims. This suggests the 31-62% board token cost is the wrong medium, not the wrong idea.
- **Convergence is good for lemmas and bad for strategies.** TopCoder: disclosure reduced diversity. MallobSat: identical solvers with shared clauses still scale. Design: share negative results and tools, hide candidate solutions until late.
- **Self-built evaluators overfit and self-reports inflate.** AIRA (validation-test gap), 2609.00652 (4.8x-9.3x). Mitigation seen in the literature: pairwise comparison, decomposed spec, hidden/consistent evaluation (AIRA_2), execution rather than assertion.
- **Persistence is the first-order effect in optimisation tasks.** ALE-Bench: four hours of iterative refinement raised average performance by over 400 points across models; o4-mini-high averaged 1520 (rating 2104, top 11.8% of humans); frontier models show a "notable gap ... in long-horizon problem-solving" (arXiv 2506.09050, abstract [verified]; 400-point and 1520 figures [secondary, search summary of the paper]). This reads as evidence for C1T (clock and tokens-left line) over more agents, and says swarms must be compared against a single agent that is *kept working*.

## 4. Candidate profiles (testable against C1T)

All three keep the realism rule: no task-supplied oracle; all evaluators are written by the agents. All are new profile files.

**A. "Lemma board" (shared constraints only, no prose).** N=3 agents, same prompt as C1T plus a board restricted to two post types: (i) a command and its observed output that falsifies an approach or reveals a constraint, (ii) a reusable tool path (instance generator, checker). Agents are told that a post must be reproducible by running its command. Source: 2608.10424 and MallobSat. Expected cost: about 3x C1T tokens (board overhead kept small by the format), k>=2 on planning and shop2. Success rule: beats C1T per-task mean without more than 3x tokens. Risk: the finding is for a tree with shared nodes; here it is peers.

**B. "Private then cross-run" (independent solvers, a self-built instance pool, pairwise selection).** N=3 to 4 agents work privately in separate branches for most of the budget, each writing a solver and also an instance generator and feasibility checker (the agent's own evaluation). In the last phase all agents drop instances into a shared folder, everyone runs every solver on every instance, and the final answer is the solver that wins most pairwise comparisons on feasible runs (pairwise gate, per 2607.14408; staged disclosure, per TopCoder). No orchestrator: the end phase is triggered by a clock line, a finishing condition already allowed. Source: 2607.14408, MADE, Boudreau-Lakhani, algorithm portfolios. Cost: about 3 to 4x C1T tokens plus cross-run compute (cheap for solvers that finish in seconds). Oracle-free: yes, since instances, checkers and objective are agent-written; hidden grader only measures. Main threat: shared blind spots (same model writes solver and checker), so include a line that each agent must try to break another's checker; verify by comparing the selected solver with the grader afterwards (measure only).

**C. "Four-stage protocol line" on top of any board arm.** A short briefing: claims must come with a command that grounds them, ask a teammate before assuming, integrate both views, re-derive before accepting. Source: Collaboration Tax (2608.22152). Cost: near zero extra tokens, can be added to existing swarm profile as a new file; run on 2-agent and 3-agent arms vs C1T, k>=2. Weak expectation: the effect was shown in two-LLM dialogues on solo-tractable tasks, not coding swarms.

Ranking by expected information per token: B, then A, then C.

## 5. Open doubts

- Most 2026 arXiv items were read only at abstract level, and some are single-source and unreplicated (2607.14408, 2608.10424, 2609.00652, 2608.22152, 2603.26499). Treat the numbers as claims by the authors.
- The 2608.10424 numbers came through a small-model summary of the HTML body, not my reading of tables.
- No source I found compares a population of identical agents against a persistent single agent with matched tokens on oracle-free optimisation. The gap is real, and murmur's design is probably novel there.
- AI co-scientist, Netflix, TopCoder, SAT-restart and IMO-pipeline claims are [secondary].
- I did not verify the "no-archive" DGM figures in the paper table.

## 6. Sources

| Topic | URL | Status |
|---|---|---|
| Pairwise validator for self-evolving agents | https://arxiv.org/abs/2607.14408 | abstract read |
| MADE, evolution without an oracle | https://arxiv.org/abs/2511.19489 | abstract page read |
| Self-reports in evolutionary search | https://arxiv.org/abs/2609.00652 | abstract read |
| Multi-Agent Evolve | https://arxiv.org/abs/2510.23595 | abstract read |
| Recovering wasted compute in autoresearch agents | https://arxiv.org/abs/2608.10424 (html version also) | abstract + body summary |
| ShinkaEvolve | https://arxiv.org/abs/2509.19349, https://arxiv.org/html/2509.19349 | abstract + body summary |
| Darwin Godel Machine | https://arxiv.org/abs/2505.22954 | abstract read; ablation numbers secondary (https://sakana.ai/dgm/) |
| AlphaEvolve | https://arxiv.org/abs/2506.13131 | abstract read |
| ThetaEvolve | https://arxiv.org/abs/2511.23473 | abstract read |
| MLE-bench | https://arxiv.org/abs/2410.07095 | abstract read |
| AIRA-dojo | https://arxiv.org/abs/2507.02554 | abstract read |
| AIRA_2 | https://arxiv.org/abs/2603.26499 | abstract read |
| ScienceFlow | https://arxiv.org/abs/2608.14354 | abstract read |
| R&D-Agent, ML-Master | https://arxiv.org/html/2505.14738v2, https://arxiv.org/pdf/2506.16499 | search snippets only [secondary] |
| ALE-Bench | https://arxiv.org/abs/2506.09050 | abstract read |
| Test-time scaling of general agents | https://arxiv.org/abs/2602.18998 | abstract read |
| Scaling test-time compute for LLM agents | https://arxiv.org/abs/2506.12928 | abstract read |
| MAPoRL | https://arxiv.org/abs/2502.18439 | abstract read |
| Kimi K2.5 (PARL) | https://arxiv.org/abs/2602.02276 | abstract read; PARL details from https://www.kimi.ai/blog/kimi-k2-5 [secondary] |
| Multi-agent teams hold experts back | https://arxiv.org/abs/2602.01011 | abstract read |
| Collaboration Tax | https://arxiv.org/abs/2608.22152 | abstract read |
| More capable, less cooperative | https://arxiv.org/abs/2604.07821 | abstract read |
| CooperBench | https://arxiv.org/abs/2601.13295 | abstract read |
| Alem | https://arxiv.org/abs/2606.08340 | abstract read |
| MallobSat | https://jair.org/index.php/jair/article/view/15827 | abstract read |
| Heavy tails, restarts, portfolios | https://www.cs.cornell.edu/gomes/pdf/2000_gomes_jar_phenomena.pdf | search snippet [secondary] |
| TopCoder field experiment | https://www.hbs.edu/ris/Publication%20Files/14-002_4fc48e55-9e17-4e81-af56-419e6797acbb.pdf | search snippet only (PDF unreadable) [secondary] |
| Netflix Prize | https://prod.lsa.umich.edu/social-solutions/diversity-democracy/oci-series/excerpts/volume-ii/the-netflix-prize.html | search snippet [secondary] |
| AI co-scientist | https://research.google/blog/accelerating-scientific-breakthroughs-with-an-ai-co-scientist/ | search snippet [secondary] |
| AI Scientist-v2 | https://arxiv.org/abs/2504.08066 | search snippet [secondary] |
| PaperBench | https://arxiv.org/abs/2504.01848 | search snippet [secondary] |
| IMO pipelines, Deep Think, Aristotle | https://arxiv.org/abs/2507.15855, https://arxiv.org/abs/2510.01346, https://blog.google/products-and-platforms/products/gemini/gemini-2-5-deep-think/ | search snippets [secondary] |
| TTRL | https://arxiv.org/abs/2504.16084 | search snippet [secondary] |
