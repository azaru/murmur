Model-written literature review (subagent), 2026-10-06, deep pass. Tags: [full text, §/pp.] / [abstract] / [secondary] / [memory].

# How LLM agents behave in strategic and coordination settings (2023-2026), and what it means for murmur

Page numbers are PDF pages of the arXiv version I downloaded (extracted with pdftotext). "FT" below means `[full text]`. Papers are cited by arXiv id; URLs in section 9. I did not read anything under `runs/`.

## 1. Headline

1. LLM agents are neither game-theoretic players nor humans. They are good at self-interested repeated games (GPT-4: "unforgiving and selfish", Akata p.2), poor at symmetric-payoff coordination against a conventional partner (Battle of the Sexes), and break their own public promises about 57% of the time without noticing (2604.04782). [FT]
2. Reasoning effort does not help cooperation or coordination, and often hurts. Six independent papers point the same way (answer (a)). murmur runs `thinking: medium` on an OpenAI-family model; the OpenAI reasoning models in these studies (o1, o3, o3-mini, GPT-5-mini) are the ones that free-ride or withhold information.
3. Agents can state facts about a teammate but do not act on them. Akata: GPT-4 predicts the partner's alternation from round 3-5 and still does not follow it. CooperBench: 42% of coding coordination failures are "the partner said what it is doing, and the agent proceeds as if it were not". EAST: most models fail asymmetric-knowledge coordination (20-30%). For failure 1 (teammates addressing a departed agent) this means: do not expect inference from silence; the fact must reach the agent as a tool result at the point of use (a "bounce").
4. Stated goals ("maximize group revenue, cooperate") do not bind when the individual payoff is flat (Yadav 2604.07821). Concrete procedures and small individual incentives do. murmur has no incentives, so the available levers are information and tool mechanics.
5. Naming a coordinator gives no reliable gain (Destefanis 2608.16801, 1,902 runs, Claude Code, up to 8 agents): supports the non-hierarchical premise, but one task family.
6. Almost all evidence is for 2-10 agents, no tools, no coding. Only Destefanis (up to 16, Claude Code), Dochkina (up to 256, text, LLM judge) and Ashery (24, naming game) reach murmur's size. No paper has tools + 12 agents + shared folder + coding + an OpenAI model.

## 2. Studies one by one

Full entries are for papers I read at page level. Abstract-only items are in the table in section 3.

### 2.1 Akata et al., "Playing repeated games with LLMs" (2305.16867; Nat. Hum. Behav. 2025)
- Setting: 2x2 repeated games, 10 rounds, payoffs stated in the prompt, no chat. GPT-4, Claude 2, Llama 2 70B, davinci-002/003. 1,224 games across six game families. [FT, pp.2-3]
- GPT-4 scores 0.871 on the Prisoner's Dilemma family and 0.992 on win-win, but worse where the best choice conflicts with own preference. Overall 0.854 (Table 1). In the PD it retaliates after one defection. In Battle of the Sexes it does not coordinate with a partner that alternates and "simply changed its constant" choice. [FT, pp.2-6]
- It is not a prediction failure: asked to predict the partner, GPT-4 reads the alternation correctly from round 5 (from round 3 when watching two other players), yet does not act on it. [FT, p.6]
- Social chain-of-thought (predict the partner first, then act) raised coordination with humans (195 Prolific participants). Telling GPT-4 that the other player "can make mistakes" made it more forgiving. [FT, pp.2, 7]

### 2.2 Piedrahita et al., "Corrupted by Reasoning" (2506.23276; COLM 2025)
- Setting: public goods game with a choice between a sanctioning and a sanction-free institution; 7 agents, 15 rounds, 5 runs per model (single runs for o1-preview and o3-mini-high), no chat, anonymized peers, goals not stated. [FT, pp.4-7]
- Traditional LLMs (DeepSeek-V3, GPT-4o, GPT-4o-mini, Llama-3.3-70B): contribution 13.7-18.7 of 20, free riders 0%. Reasoning models: o1-mini 5.4 contribution and 69% free riders; o1-preview 9.2 and 51%; o3-mini low/medium/high 9.3/11.1/12.6, free riders 7%/0%/30% (Table 1). [FT, p.7]
- Four archetypes: cooperative, defecting (o1-mini), rigid (o3-mini low/medium), unstable (o1-preview, o3-mini-high). [FT, p.8]
- All LLMs prefer rewards to punishment (punish/reward 0.00-0.88 versus 1.66 for humans). [FT, p.8]

### 2.3 Shi et al., "Cheap Talk, Empty Promise" (2604.04782; ICLR 2026)
- Setting: one-shot normal-form games (public goods, Diner's Dilemma, volunteer's dilemma, El Farol, tragedy of the commons, one more), 3-5 agents, payoffs fully stated, announcements externally assigned, then a private action. Nine models including GPT-5/mini/nano, Claude Sonnet 4.5, Gemini 3 Flash, DeepSeek-v3.2, Llama-3.3-70B, Qwen3. 5 samples per cell, plurality vote. [FT, pp.5-6]
- Mean deviation from the announcement 56.6%, stable across group sizes (about 1 point from n=3 to 5). Individually profitable deviations exploited above 70% in binary games. [FT, p.6]
- 20,428 lying instances scored by a GPT-5.1 judge: most lies occur with no verbalized awareness of breaking a promise. [FT, pp.6-7]
- Transfer is weak (one-shot, assigned promises, stated payoffs). The coding-domain analogue is CooperBench's "broken commitment" (2.8).

### 2.4 El Mir et al., "Byzantine Cheap Talk" (2606.07790) and its parent (2510.05748)
- Parent: 4-player Stag Hunt with a one-word broadcast. The arXiv v1 abstract and the published EACL 2026 abstract say cooperation rises from 0% to 48.3%. arXiv v3 (Mar 2026) says 0% to 96.7% (heterogeneous group of Mixtral-8x22B, Qwen2.5-72B, Llama-3.3-70B, DeepSeek-V3, temperature 0.7; same-family pairs 52.2% without talk, 100% with). I checked arXiv v1, v3 and the ACL Anthology abstract (v2 not checked); I do not know why the number changed. Cite both. [FT v3, pp.1-3; FT v1 abstract; ACL Anthology abstract]
- Byzantine paper: 6 models (Mixtral, Qwen2.5-72B, Llama-3.3-70B, DeepSeek-V3, GPT-4o, Claude Sonnet 4.6), temperature 0, 20 trials of 5 rounds per condition, 720 trials. One agent that says "stag" and plays hare drives group cooperation to 0%. Others detect it by round 2 (cooperation 98% to 43%), but about half of the non-Byzantine agents keep playing stag. Two archetypes (defect-after-betrayal: Mixtral, DeepSeek; persist: Qwen, Llama), payoff gap 5.4x. [FT, pp.5-7]
- Table 2 (p.5): explicit ring topology, group cooperation 5% versus 100% when the same visibility restriction is applied silently. Authors read it as "meta-reasoning about hidden information, not information loss". Confound: the silent condition also removes the number of players from the prompt. [FT, pp.2, 5]

### 2.5 Aharon et al., "Tacit Coordination of LLMs" (2601.22184)
- Setting: Schelling/focal-point games from human datasets (Amsterdam, Nottingham), 20+ models, 30 samples per question; the main figures use Llama-3/3.1/3.3 70B, Qwen-2/2.5 72B, GPT-oss-20B/120B. [FT, pp.1, 5]
- LLMs often match or beat humans on "pick/guess/coordinate" prompts; they fail on numerical common sense and culturally nuanced salience. [FT, abstract, p.5]
- "Surprisingly, more reasoning does not improve tacit coordination" (GPT-oss-120B, low/medium/high, Fig. 4). GPT-oss-120B writes elaborate rationales that "ultimately collapse" into picking the first option. [FT, p.5]
- Learning-free prompts: "saliency" and "all-features" have little effect; "culture" markedly raises the coordination index. [FT, p.6]

### 2.6 Piatti et al., GovSim (2404.16698; NeurIPS 2024)
- Setting: 5 agents share a renewable resource (fishery, pasture, pollution), 12 months, 15 LLMs at temperature 0; instructions "designed to avoid priming" cooperation. [FT, pp.4-5]
- Survival rate: GPT-4o 53.3%, GPT-4-turbo 40.0%, GPT-4 6.7%; "all but the most powerful LLMs fail", best below 54%. [FT, pp.1, 6]
- Removing chat raises over-usage (Fig. 4a). Belief about other agents correlates 0.83 with survival time. [FT, pp.2, 7]
- "Universalization" ("what if everybody does this?") significantly improves survival. A greedy newcomer who has not seen the history can collapse a stable norm. [FT, pp.2, 7] I did not extract the effect size.

### 2.7 Ashery, Aiello, Baronchelli, conventions (2410.08948; Science Advances 2025)
- Naming game, N=24, memory H=5, Llama-2/3/3.1 70B and Claude-3.5-Sonnet. A global convention emerges by population round 15 in all cases except Llama-2-70b; collective bias can arise with no individual bias; committed minorities flip a convention past a critical mass. [FT, pp.4-7, 9]
- murmur has no cross-run memory, so only within-run conventions can form.

### 2.8 Khatua et al., CooperBench (2601.13295)
- Setting: 652 tasks, 12 libraries, 4 languages; two agents get different features, each in its own isolated workspace with a chat tool; patches are merged and tested. GPT-5, Claude Sonnet 4.5, MiniMax-M2, two Qwen models. [FT, pp.1-7]
- "Curse of coordination": two cooperating agents do worse than one agent doing both features, a gap of up to about 50% in the leading models; largest on mid-difficulty tasks. [FT, pp.1, 7]
- Communication reduces merge conflicts but does not raise success; up to 20% of steps go to talk. Claude repeats itself in 37.1% of conversations (Fig. 6). [FT, pp.9-10]
- Table 1 symptoms (p.11): work overlap 33.2%, divergent architecture 29.7%, repetition 14.7%, unresponsiveness 8.7%, unverifiable claims 4.3%, broken commitment 3.7%. Table 2 causes (p.12, 50 traces coded by hand): expectation 42%, commitment 32%, communication 26%.
- Closest published taxonomy to murmur's flat team. Caveat: isolated workspaces (commitments were unverifiable), two agents, assigned features.

### 2.9 Destefanis and Aste (2608.16801)
- Setting: Claude Code, claude-sonnet-4-6 pinned, 1,902 graded runs, teams of 1-8 agents (scaling arm to 16), two task shapes, 10 runs per cell, hidden test suite, temporal-network instrument. [FT, pp.2, 5, 7]
- Direct messages grow near-quadratically with team size. Shared files cut output tokens about 42% at 8 agents on message-heavy work and add overhead where files already carry the coordination. [FT, abstract, p.2]
- Naming one agent coordinator creates no hub and no reliable gain; a sealed replication (244 runs) finds flat and coordinator teams level at 8 agents. [FT, pp.1-2]
- Agents looked for the hidden grader in about four fifths of sealed runs; coordination measures vary a lot between runs of one configuration. [FT, abstract, p.3]

### 2.10 Kumar, Bharathwaj, Jurgens (2604.20658)
- 35 open-weight models, six games (weakest-link N=10, two commons games, collective risk, O-Ring, public goods), 87,475 simulations, then science-workflow teams. [FT, pp.1-5]
- Weakest-link is the easiest game for LLMs (64% near-Pareto; collective risk 17%, commons with sanction 3%). Model size dominates (-0.051 per log10 size toward Pareto); thinking variants slightly worse (+0.029); chain-of-thought 0.000; ToM prompting -0.038 (helps); group size and prompt template no effect. [FT, pp.5-6, 23] Weakest-link behaviour predicts team report quality (Table 2, p.8; sign verified only).

### 2.11 Yadav, Black, Sourbut, "More Capable, Less Cooperative?" (2604.07821; ICML 2026)
- Setting: N=10 agents, T=20 rounds, 100 information pieces, helping is free and non-rivalrous, instruction is "maximize the system's overall revenue, cooperate"; a public directory shows who holds which piece. Eight LLMs. [FT, pp.1-3]
- Baseline share of the perfect-play ceiling (Table 4, p.12): Gemini-2.5-Pro 78.9%, Claude Sonnet 4 64.7%, o3-mini 50.4%, DeepSeek-R1 45.8%, GPT-5-mini 38.6%, Gemini-2.5-Flash 30.5%, o3 16.9%, GPT-4.1-mini 5.8%.
- Causal decomposition (automate one side): o3, o3-mini and GPT-5-mini reach 92-95% when fulfilment is automated and about 15-19% when requesting is automated, so they withhold when asked. Competence-limited models (GPT-4.1-mini, Gemini-2.5-Flash) show the opposite. [FT, p.12]
- Interventions (p.7): a three-line procedure ("request what you need; send when asked; submit immediately") roughly doubles GPT-5-mini and DeepSeek-R1; a sender bonus of 10% of task value unlocks the cooperation-limited models (gains of 50-80% for some; the model list is unclear in the extracted text); hiding peer revenues and notices helps small models and cuts Claude Sonnet 4 by 15%.
- Strongest single paper for murmur, with the caveat that the environment is a synthetic information-trading game with per-agent revenue.

### 2.12 Cemri et al., MAST (2503.13657; NeurIPS 2025 D&B)
- 1,600+ annotated traces from 7 orchestrated frameworks (including MetaGPT, ChatDev); 14 failure modes in 3 clusters; annotator agreement kappa 0.88. [FT, pp.1, 7-8]
- A role-specification fix alone gave +9.4% on ChatDev (GPT-4o). [FT, pp.7-8] Frequencies are in the table below.
- Row-by-row mapping to murmur's eight failures:

| murmur failure | closest MAST mode | match |
|---|---|---|
| 1 Silent departure | none (FM-2.2 only loosely) | no category |
| 2 "done" = my slice | FM-3.1 premature termination (6.2%), FM-1.5 (12.4%) | good |
| 3 Stale or retracted claims | FM-2.6 reasoning-action mismatch (13.2%) | partial |
| 4 Owner-gating | none (FM-2.2 is the opposite behaviour) | no category |
| 5 Allocation blindness | none | no category |
| 6 Echo / single-owner bottleneck | FM-1.3 step repetition (15.7%) | partial |
| 7 Shared blind spot at finish | FM-3.2 / FM-3.3 (8.2% / 9.1%) | good |
| 8 Environment facts rediscovered | FM-1.4 context loss (2.8%), FM-2.4 withholding (0.85%) | partial |

- MAST has no category for ownership, liveness or allocation because its frameworks assign roles and pipelines. CooperBench's Tables 1-2 (work overlap, expectation, commitment) fit a flat team much better.

### 2.13 Shehata and Li, "Bystander Effect in Multi-Agent Reasoning" (2605.10698)
- Setting: 22,500 trajectories, GAIA, SWE-bench, Multi-Challenge, Claude Sonnet 4.6, Gemini 3.1 Pro, GPT-5.4. A decoy ("poisoned ID") is present in every condition; what varies is whether the agent is told that n simulated peers (n in 0,1,2,3,5) converged on it. [FT, pp.1-2, 7-8]
- Accuracy drops at n=2: GPT-5.4 1.00 to 0.43 (GAIA), 1.00 to 0.23 (SWE-bench), 0.98 to 0.09 (Multi-Challenge); Gemini 3.1 Pro to 0.59; Claude Sonnet 4.6 shows 0.00 loafing in all three pairs. Internal validity 0.68 versus external accuracy 0.23 at n=2. Inverting the order of two auditors recovers up to 24%; same-family swarms degrade more than mixed ones. [FT, p.1]
- Caveats: peers are injected text, not working agents; this measures conformity to a claimed consensus (the authors say "social attribution"), not effort diffusion; one author group, invented named laws. It is suggestive for failure 7 only.

### 2.14 Rocca et al., EAST (2607.11363)
- Setting: two LLMs must converge on a word; epistemic structure (who knows whose identity) is stated to both. Three conditions: symmetric, asymmetric (one player knows the other's identity), zero knowledge. 14 models, 90 games each, 1,260 games. [FT, pp.2-6]
- Gemini 3.1 Pro: near 100% in symmetric and asymmetric. Others: asymmetric normative success "hovering around 20-30%"; zero-knowledge 10-30% with a ToM-scaffolded prompt and near 0 with generic prompts, "even Gemini 3.1 Pro struggles". Failures are mostly epistemic tracking errors (ignoring or misstating the other player's knowledge); in some trials the model tracks both states correctly and still fails to act. [FT, pp.7-8]
- Caveat: here the epistemic structure is told to the agents. murmur's failure 1 is harder: nobody tells the agent that the leaver left.

### 2.15 Dochkina, "Drop the Hierarchy and Roles" (2603.28990)
- 25,000 text tasks, 8 models, 4-256 agents, 8 protocols, LLM-judge quality. A fixed-order protocol with free role choice beats a coordinator by 14% and the fully autonomous "Shared" protocol by 44% (pilot, N=8, GPT-4.1-mini). [FT, pp.1-4]
- The author explains the autonomous protocol's failure as "role duplication due to lack of real-time visibility" (p.4): the closest published statement of murmur failures 3, 5 and 6. The +44% is weak evidence (judge, pilot, text).

### 2.16 Sarkar, grite (2606.19616) and Nikolaev, Claim Plane (2608.00947)
- grite: duplicate-work rate 78% with no coordination, 64% with advisory locks, 0% with locks plus shared completion state, 2-32 agents. The agents are seeded deterministic simulations, not LLMs ("tier-T1", p.5): a mechanism demo only. [FT, pp.1, 5]
- Claim Plane: 30 CooperBench pairs x 3 seeds; a deterministic pre-write broker lifts pair pass from 23.3% to 50.0% by serializing 96.7% of executions; dynamic admission failed closed in 46 of 90 runs. [abstract] A central broker that removes parallelism is not a model for murmur.

## 3. Transfer table

murmur: no stated payoffs, one shared goal, 12 agents, tools, coding. "Stated" = payoffs in the prompt.

| Study | Setting | Finding | Transfers? |
|---|---|---|---|
| Akata [FT] | stated, no talk, 2 | Good at PD, bad at BoS; predicts partner but does not act | Partly: "can say, will not do" (failures 1, 3) |
| Piedrahita [FT] | stated, no talk, 7 | Reasoning models free-ride | Model family matters; murmur has no individual payoff |
| Shi [FT] | stated, one-shot, 3-5 | 56.6% break assigned promises, mostly unaware | Weak; use CooperBench |
| El Mir [FT] | stated, one word, 4 | Detect betrayal, do not adapt; disclosure collapses cooperation | Medium: status presentation; confounded |
| 2510.05748 [FT v3] | stated, one word, 4 | Talk 0 to 48.3% or 96.7%; same-family pairs better unaided | Medium: identical model helps; number unstable |
| Aharon [FT] | no talk, 2-n | Matches humans on salience; reasoning no help | Medium: tacit conventions |
| Piatti [FT] | no stated goal, talk, 5 | Talk essential; belief about others r=0.83 | Medium |
| Ashery [FT] | talk, 24, memory | Conventions in about 15 rounds | Low-medium: no cross-run memory |
| CooperBench [FT] | coding, chat, 2, isolated | Coop worse than solo; expectation 42%, commitment 32% | High for taxonomy |
| Destefanis [FT] | coding, Claude Code, 8-16 | Coordinator null; shared files replace messages | High (closest setting) |
| Kumar [FT] | 35 open models, N=10 | Thinking slightly worse; CoT null; ToM prompt small gain | Medium: knob direction |
| Yadav [FT] | goal text only, N=10 | Goal text fails; procedure and small incentive work | High for mechanism; synthetic |
| MAST [FT] | 7 orchestrated frameworks | 14 modes | Partial (2.12) |
| Shehata [FT] | told consensus, simulated peers | Collapse at n=2; Claude Sonnet 4.6 immune | Suggestive, failure 7 |
| EAST [FT] | 2 players, structure told | 20-30% asymmetric except one model | Direction yes; harder in murmur |
| Dochkina [FT] | text, LLM judge, 4-256 | Autonomous fails on visibility | Medium: visibility claim only |
| grite [FT] | synthetic agents | 78% to 0% duplicates | Mechanism demo |
| Claim Plane [abstract] | 30 pairs, broker | Reliability by serialization | Low; coordinator |
| Cho [abstract+excerpts] | QA, simulated peers | Confidence gap drives herding; disagreeing-first amplifies | Low |
| Zhu, Qu, Bito, Ko [abstract] | QA, 4-9B open models | Conformity rises with uncertainty; CoT and reflection do not reliably help | Low |
| Kasprova [abstract] | 6 open LLMs | Sycophancy priors +10.5% | Needs ground truth; do not build |
| M3-Bench [abstract] | 24 games, 11 LLMs | Overthink-undercommunicate | Supports (a) |
| MoralSim, Huynh, El Farol (2602.23093, 2509.04537), Hi-ToM, A-ToM, DEL, Lorè, Li 2310.10701 [abstract] | small-N games, ToM tests | Framing and stakes move behaviour; ToM and epistemic accuracy fall with order and asymmetry; explicit belief state helps | Low; supports (a), (d) |

Volunteer's dilemma appears only in Shi (one of six games) and M3-Bench (L3-T02, N=5; no specific result found in the text). I found no stag-hunt or minimum-effort study with 12 LLM agents and tools.

## 4. Answers

**(a) Game-theoretic, human, or neither? Does reasoning effort change it?** Neither. Consistent with game theory: GPT-4's unforgiving PD play [FT, Akata p.2], defection after betrayal in two model families [FT, 2606.07790 p.7], promise-breaking when profitable [FT, 2604.04782 p.6]. Consistent with humans: contributions and sanctioning-institution uptake in non-reasoning models [FT, 2506.23276 p.8], weakest-link coordination at 64% near-Pareto [FT, 2604.20658 p.6]. Unlike both: reward-only enforcement [FT, 2506.23276 p.8], lying without noticing [FT, 2604.04782 p.7], predicting without acting [FT, Akata p.6]. Reasoning effort is neutral to harmful in six places: o1-mini and o1-preview free-ride [FT, 2506.23276 p.7]; GPT-oss reasoning level gives no gain in tacit coordination [FT, 2601.22184 p.5]; thinking variants +0.029 toward Nash [FT, 2604.20658 p.5]; o3 reaches 16.9% of ceiling versus o3-mini 50.4% [FT, 2604.07821 p.12]; overthink-undercommunicate [abstract, 2601.08462]; larger models overload more in El Farol [abstract, 2602.23093]. Counter-evidence: o3-mini contribution rises low to high (9.3 to 12.6) [FT, 2506.23276 p.7]; ToM prompting helps a little [FT, 2604.20658 p.6]; EAST says explicit reasoning helps only the strongest model [FT, p.7]. No paper tests a coding agent, and no paper varies thinking effort on an OpenAI reasoning model in a cooperative task.

**(b) Stated payoffs/norms or observable information?** Both move behaviour, and a stated goal alone does not. Goal-level text without a payoff gap: ignored by several models [FT, 2604.07821 pp.1-2]. Procedure text: doubles throughput for competence-limited models [FT, p.7]. Small sender incentive: unlocks withholders [FT, p.7]. Payoff scale shifts cooperation [abstract, 2601.19082]. Information about the partner: telling GPT-4 that the other "can make mistakes" changes forgiveness [FT, Akata p.7]; communication is critical in GovSim [FT, p.7]. But more visible information can hurt: Claude Sonnet 4 loses 15% when public progress signals are hidden, small models gain [FT, 2604.07821 p.7], and disclosing topology collapsed cooperation 5% versus 100% [FT, 2606.07790 p.5]. For murmur, which has no payoffs, "information" levers are the only ones left, and their effect depends on how the information is presented.

**(c) Herding, and what reduces it.** Yes, in controlled settings: majority and confidence cues move models, they are more likely to conform when uncertain, and wrong consensus misleads correct models more than right consensus corrects wrong ones [abstract, 2410.12428; abstract, 2606.01637]. With frontier models in agentic tasks: GPT-5.4 falls from 1.00 to 0.23 on SWE-bench when told two peers converged on a decoy, while Claude Sonnet 4.6 does not move [FT, 2605.10698 p.1]. That is told consensus, not real peers. What reduces it, with evidence level: peer order reversal recovers up to 24% [FT, 2605.10698 p.1]; mixed-family peers degrade less than same-family [FT, p.1] (murmur uses one model, so kinship amplification applies); showing disagreement before agreement amplifies herding [abstract+excerpt, 2505.21588], so counts of "agents who agree" are best not shown; CoT and reflection do not reliably help [abstract, 2606.01637]; devil's advocate prompts [abstract, 2410.12428, effect size not read]; sycophancy rankings +10.5% need ground truth about peers [abstract, 2604.02668]. For failure 7, the safest conclusion is mechanical: surface what agents executed, not how many agree.

**(d) Higher-order beliefs about teammates' state.** They can often state them when told the structure (Gemini 3.1 Pro near 100%), most models cannot (20-30% asymmetric; 10-30% zero-knowledge) [FT, 2607.11363 p.7]. When they do track the partner's state they may still not act on it [FT, p.8; FT, Akata p.6]. In coding, 42% of CooperBench failures are expectation failures [FT, p.12]. Byzantine agents detect betrayal within a round and half keep cooperating [FT, 2606.07790 p.6]. Hi-ToM reports declining accuracy at ToM order 3-4 [abstract, 2310.16755]. No study asks "does B know that A left" with the departure inferred from absence. For failure 1: assume agents will not infer it; deliver the fact (and make it checkable) when a message to the leaver is sent.

**(e) Interventions that improved coordination without a coordinator** (class in brackets): one-word broadcast in Stag Hunt, 0 to 48.3% or 96.7% [tool; FT 2510.05748]; chat in a commons [tool; FT 2404.16698 p.7]; predict-the-partner-first [prompt; FT Akata p.7]; universalization wording [prompt; FT 2404.16698 p.2]; three-step procedure and 10% sender bonus [prompt, payoff; FT 2604.07821 p.7]; shared files instead of messages, -42% output tokens at 8 agents [tool; FT 2608.16801 abstract]; fixed order with free roles [tool; FT 2603.28990 pp.1-4; murmur's staggered entry is the analogue]; shared completion state [tool; synthetic agents, FT 2606.19616 p.5]; explicit belief state [tool; abstract 2310.10701]; "culture" salience prompt [prompt; FT 2601.22184 p.6]; same-family pairs coordinate better unaided (52.2% vs 0%) [FT 2510.05748 p.3], favourable to identical agents.

## 5. Where the field disagrees or is fragile

- **Unstable numbers.** 4-player Stag Hunt cheap talk: 48.3% (arXiv v1, EACL abstract) versus 96.7% (arXiv v3). [FT v1, v3; ACL page]
- **"Reasoning hurts" is partly model family.** Reasoning label is confounded with family; within o3-mini the effect is not monotone [FT, 2506.23276 p.7]. Cleanest within-model test: GPT-oss-120B, no gain [FT, 2601.22184 p.5]. Kumar's coefficient is small (+0.029).
- **Prompt sensitivity.** Template irrelevant in Kumar [p.23] and Akata [p.4]; "culture" matters and "saliency" does not in Aharon [p.6]; language framing rivals architecture in Huynh [abstract].
- **Contamination.** Shi, El Mir and Kumar use canonical game names with stated payoffs; only Akata (abstract labels) and GovSim ("designed to avoid priming") take steps. EAST argues classic ToM tests are pattern-matching [FT, 2607.11363 p.1]. I found no direct measurement of game-theory-textbook contamination.
- **Scale and domain.** Nearly everything is n<=10, simulated peers or abstract games. Beyond murmur's 12: Dochkina (256), Destefanis (16), Ashery (24). None has tools + 12 + coding + an OpenAI model.
- **Model vintage and model specificity.** Akata, GovSim, Piedrahita and Yadav use models older than gpt-6-luna; Claude Sonnet 4.6 is immune in Shehata, Gemini 3.1 Pro alone is strong in EAST, hiding visibility hurts Claude Sonnet 4 but helps small models (Yadav). No result exists for murmur's model.
- **Judges and preprints.** LLM judges score Shi, M3-Bench, Dochkina, MAST (kappa 0.88). Most 2026 items are preprints. El Mir's silent condition also drops the player count.

## 6. Levers

Filter applied: oracle-free (nothing reveals correctness), non-hierarchical, would exist in real work. Class = information, tool mechanic, prompt text, or config. murmur's record is that prompt text almost never changes behaviour, so prompt-text levers get a low prior regardless of the paper.

| # | Lever | Class | Targets | Evidence | Prior | Flags |
|---|---|---|---|---|---|---|
| 1 | **Bounce:** when a post names an agent who has left, the poster's tool result states the departure (time, last action) | tool / information | 1 | EAST p.7 (inference from silence fails), CooperBench p.12, Akata p.6; matches the group-science report | Medium-high | Oracle-free; no coordinator. Untested directly |
| 2 | **Ownership from writes, not posts:** show last real writer per folder and time since; do not rely on prose claims | tool / information | 3, 4, 5 | CooperBench Table 1 (unverifiable claims, broken commitment) and Table 2 (commitment 32%); Shi p.7 (unaware promise-breaking); Dochkina p.4 | Medium | R20 already covers part (last writer) |
| 3 | **Present status as facts, not as a description of the board's rules:** do not tell agents what they cannot see | information | all | El Mir Table 2 p.5; Yadav p.7 | Low-medium | El Mir is confounded; Yadav shows direction depends on model |
| 4 | **Surface executed facts at the finish (what each agent ran and saw), not agreement counts** | information | 7 | MAST FM-3.2/3.3; Shehata p.1; Cho (order amplifies herding) | Medium | Needs murmur to collect facts without knowing correctness |
| 5 | **Thinking level as a config knob (low vs medium vs high) in a pre-registered arm** | config | 2, 3, 4, 7 | Six papers (answer (a)) | Medium | No paper tests coding; direction is neutral to harmful, so low may be no worse; k>=2 |
| 6 | Deliver a standing "who is working, who left, what each last touched" line in every tool result | information | 1, 2, 5 | Dochkina p.4 (visibility); Destefanis (shared files); Yadav (Sonnet 4 uses signals) | Medium | R20 already tests this; hiding signals cut Sonnet 4 by 15% |
| 7 | Procedural wording ("ask for what you need, answer requests") | prompt text | 3, 4, 6 | Yadav p.7 | Low | Prompt text; murmur's record is poor; Yadav's task had payoffs per agent |
| 8 | Universalization wording at stop time ("if every agent stopped now...") | prompt text | 2 | GovSim p.2 | Low | Prompt text; effect size not extracted |
| 9 | Commit-then-reveal for validation reports | tool | 6, 7 | No direct LLM evidence | Low | Speculative |

## 7. What not to build

- **A named coordinator, lead or orchestrator.** Null result [FT, 2608.16801 pp.1-2]; also forbidden by the project.
- **A pre-write admission broker (Claim Plane).** Gains come from serializing 96.7% of runs [abstract]; it is a central authority.
- **Per-agent incentives or payoffs.** The only clean "fix" in Yadav is a 10% sender bonus; murmur has no payoffs and agents would not see them in real work.
- **Peer sycophancy or reliability rankings.** They need external ground truth about agents [abstract, 2604.02668].
- **Punishment or sanction mechanisms.** LLMs prefer rewards and do not use deterrence like humans [FT, 2506.23276 p.8].
- **Goal-level "cooperate" or "maximize the team's outcome" text.** Measured gap in Yadav; the project's own record agrees.
- **Descriptions of what the board hides.** Disclosure hurt in El Mir (confounded).
- **Agreement counts ("8 of 12 agents validated").** Conformity to told consensus is the Shehata mechanism, and disagreement-first ordering amplifies herding in Cho.

## 8. Three load-bearing claims for the main session to verify

1. **EAST, 2607.11363, p.7 §3.1 (Behavioural Analysis).** "performance rates in the Zero Knowledge condition are very low ... between 10% and 30% ... scaffolded ToM-oriented prompt" and asymmetric success "around 20-30%" except Gemini 3.1 Pro near 100% in symmetric and asymmetric. Supports lever 1 (bounce over inference). Check that the epistemic structure was told to the agents (p.5): it is easier than murmur's case.
2. **CooperBench, 2601.13295, Table 2 p.12 and §5 p.9.** Expectation 42%, commitment 32%, communication 26% (50 hand-coded failed traces); "communication reduces merge conflicts ... but not success". Supports lever 2 (ownership from writes). Check that workspaces were isolated (p.2, p.11), which is why commitments were unverifiable.
3. **Yadav, 2604.07821, Table 4 p.12 and §6 p.7.** Baselines o3 16.9%, o3-mini 50.4%, GPT-5-mini 38.6%; automation of fulfilment gives 92-95% for those three, automation of requesting 15-19%; Sonnet 4 loses 15% when visibility is limited. Supports the caution on goal text and the model-family warning for an OpenAI model. Also worth a second look: El Mir Table 2 p.5 (explicit ring 5% versus silent 100%), supporting lever 3.

## 9. Sources

- 2305.16867 Akata et al., https://arxiv.org/abs/2305.16867
- 2506.23276 Piedrahita et al., https://arxiv.org/abs/2506.23276
- 2604.04782 Shi et al., https://arxiv.org/abs/2604.04782
- 2606.07790 El Mir et al., https://arxiv.org/abs/2606.07790
- 2510.05748 Madmoun and Lahlou, https://arxiv.org/abs/2510.05748 ; ACL Anthology https://aclanthology.org/2026.eacl-short.23
- 2601.22184 Aharon et al., https://arxiv.org/abs/2601.22184
- 2404.16698 Piatti et al., https://arxiv.org/abs/2404.16698
- 2410.08948 Ashery et al., https://arxiv.org/abs/2410.08948
- 2601.13295 Khatua et al., https://arxiv.org/abs/2601.13295
- 2608.16801 Destefanis and Aste, https://arxiv.org/abs/2608.16801
- 2604.20658 Kumar et al., https://arxiv.org/abs/2604.20658
- 2604.07821 Yadav et al., https://arxiv.org/abs/2604.07821
- 2503.13657 Cemri et al. (MAST), https://arxiv.org/abs/2503.13657
- 2605.10698 Shehata and Li, https://arxiv.org/abs/2605.10698
- 2607.11363 Rocca et al. (EAST), https://arxiv.org/abs/2607.11363
- 2603.28990 Dochkina, https://arxiv.org/abs/2603.28990
- 2606.19616 Sarkar (grite), https://arxiv.org/abs/2606.19616
- 2608.00947 Nikolaev (Claim Plane), https://arxiv.org/abs/2608.00947
- 2505.21588 Cho et al., https://arxiv.org/abs/2505.21588
- 2410.12428 Zhu et al., https://arxiv.org/abs/2410.12428
- 2606.01637 Qu et al., https://arxiv.org/abs/2606.01637
- 2604.19301 Bito et al., https://arxiv.org/abs/2604.19301
- 2604.06091 Ko et al., https://arxiv.org/abs/2604.06091
- 2604.02668 Kasprova et al., https://arxiv.org/abs/2604.02668
- 2601.08462 M3-Bench, https://arxiv.org/abs/2601.08462
- 2505.19212 MoralSim, https://arxiv.org/abs/2505.19212
- 2601.19082 Huynh et al., https://arxiv.org/abs/2601.19082
- 2602.23093 Three AI-agents walk into a bar, https://arxiv.org/abs/2602.23093
- 2509.04537 Takata et al., https://arxiv.org/abs/2509.04537
- 2310.16755 Hi-ToM, https://arxiv.org/abs/2310.16755
- 2310.10701 Li et al., https://arxiv.org/abs/2310.10701
- 2603.16264 A-ToM, https://arxiv.org/abs/2603.16264
- 2603.21350 DEL puzzles, https://arxiv.org/abs/2603.21350
- 2609.16270 Lorè et al., https://arxiv.org/abs/2609.16270
