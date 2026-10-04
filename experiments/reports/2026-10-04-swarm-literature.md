# Swarm literature review: what it says about murmur and what to test next (2026-10-04)

Synthesis written by the main session from eight model-written subagent reviews (web research, 2026-10-04). The eight full reports, each with its sources table, are:

| Angle | Report |
|---|---|
| Selection and verification among parallel attempts without an oracle | [2026-10-04-lit-selection.md](2026-10-04-lit-selection.md) |
| Single agent against multi-agent, compute-matched studies, failure taxonomies | [2026-10-04-lit-single-vs-multi.md](2026-10-04-lit-single-vs-multi.md) |
| Decentralized coordination: stigmergy, blackboards, network structure, self-organizing LLM agents | [2026-10-04-lit-decentralized-coordination.md](2026-10-04-lit-decentralized-coordination.md) |
| Stopping, persistence and quality without an oracle | [2026-10-04-lit-stopping-persistence.md](2026-10-04-lit-stopping-persistence.md) |
| Practitioners: Cursor, Anthropic's C compiler, Cognition, Claude Code teams, Factory, CORAL | [2026-10-04-lit-practitioners.md](2026-10-04-lit-practitioners.md) |
| Heterogeneity, diversity and communication topology | [2026-10-04-lit-heterogeneity-topology.md](2026-10-04-lit-heterogeneity-topology.md) |
| Adjacent fields: LLM evolution, ML-engineering agents, SAT portfolios, trained collaboration | [2026-10-04-lit-adjacent-fields.md](2026-10-04-lit-adjacent-fields.md) |
| Human groups, organisations and biological collectives | [2026-10-04-lit-human-groups-biology.md](2026-10-04-lit-human-groups-biology.md) |

**Provenance.** The subagents mostly read arXiv abstract pages and vendor pages through a fetch tool that returns a model summary, so most numbers are abstract-level and unchecked in full text. Many 2026 arXiv papers are recent, unreplicated and not peer reviewed. **[checked]** means the main session fetched the primary page itself and read the fetch tool's extract of it, with quoted phrases taken from that extract (not a manual read of the raw page or the full paper); everything else is the subagents' reading.

## 1. The literature agrees with murmur's null result, and has explanations for it

No source found compares, at matched tokens and without an oracle, a group of identical peers editing one repository against one persistent agent. murmur's setting appears to be new. The closest evidence points the same way as rounds 1–16:

- **Compute-matched studies mostly favour the single agent.** At equal thinking tokens a single agent matches or beats multi-agent systems on multi-hop reasoning (arXiv 2604.02460); at equal LM calls a team ties (0.769 vs 0.754, p=0.80; 2609.04217); debate rarely beats self-consistency. These are reasoning benchmarks, not repositories.
- **CooperBench** (2601.13295) **[checked]**: on 600+ coding tasks, two agents that each implement one feature in a shared codebase succeed "on average 30% lower" than one agent doing both. Chat did not fix it. This is the closest academic analogue to murmur.
- **Teams fall below their best member** (Pappu et al., 2602.01011, "Multi-Agent Teams Hold Experts Back") **[checked]**: self-organizing LLM teams lose up to 41.1% against their expert, even when told who it is, through "integrative compromise", and this grows with team size. Fits n=2 > n=3 > n=10 and "yielding to a teammate".
- **Same-model peers share their errors.** Self-MoA (2502.00674): six samples of the best model beat six different models; quality explains more than diversity. A theory paper (2601.17311) puts synergy behind a threshold of error decorrelation. Identical gpt-6-luna agents sit below it.
- **Peers make agents agree, not improve.** Debate behaves like a martingale with no drift to truth (2508.17536); right-to-wrong flips outnumber wrong-to-right ones (2509.05396). In humans, seeing others' answers narrows diversity and raises confidence without improving accuracy (Lorenz et al. 2011, PNAS, read by the subagent in full). This is the signature of murmur's "everyone converges on one approach".
- **Interacting groups lose to nominal groups.** Brainstorming meta-analyses: people working apart and pooling beat groups working together, more so for larger groups, mainly through production blocking. The LLM analogue is a board that consumes turns and anchors each agent's plan (murmur: 31–62% of tokens on coordination turns).
- **Task type sets the ceiling.** Steiner's typology: on a unitary ("disjunctive") task a group cannot exceed its best member and can only add process loss. Google/MIT's scaling study (2512.08296): +80.8% on decomposable tasks, −70% on sequential planning, diminishing returns once the single agent is strong. murmur's results line up: the swarm's only wins are coverage and speed on a large decomposable spec (round 15 B/C), and nothing on planning or shop2 (rounds 15 A, 16 A).

**Practitioners report the same failures without a single-agent control.** Cursor's flat peers **[checked]**: with locks, "twenty agents would slow down to the effective throughput of two or three"; with optimistic concurrency, "with no hierarchy, agents became risk-averse. They avoided difficult tasks and made small, safe changes". Cursor moved to planners and workers, which murmur excludes. Anthropic's 16-agent C compiler had no orchestrator, but relied on a near-perfect oracle (GCC torture tests, GCC as reference) both to verify and to partition work. Cursor's later SQLite swarm (July 2026, built from the manual with a held-out test suite) cut merge conflicts from about 70,000 to under 1,000, and Cursor attributes the gain to "context efficiency, more than parallelism itself". None of these has a single-agent baseline.

**Where the literature reports multi-agent gains**, at least one of these holds: the task is broad and decomposable, the bottleneck is latency or context size, there is a hierarchy, or there is an oracle or trained verifier. murmur's open question is the one case the literature has not covered: peers, no oracle, matched spend.

## 2. Stopping judgement: what the literature adds

Rounds 11–16 and side test U point to the agent's own judgement of "done" as the binding limit. Relevant findings:

- **Agents overclaim completion.** Cursor: agents "frequently stopped to proclaim success despite being far from it" (subagent reading). OverclaimBench (2609.20812): files skipped in 67.9% of runs. An agent claimed improvement in 54 of 54 cycles while 56% measured zero or negative; the bias vanished when the criterion was checkable from the work product (2607.25152).
- **Context anxiety** (Cognition, Devin on Sonnet 4.5) **[checked]**: the model took "shortcuts or [left] tasks incomplete when it believed it was near the end of its window, even when it had plenty of room left". Their fix gave a 1M window with usage capped at 200k. murmur's tokens-left line could act in either direction, and side test U suggests a live number and a fixed sentence act differently.
- **Budget awareness helps only when the agent sees what remains** (BATS, 2511.17006, web search), consistent with the clock.
- **Self-written tests carry little signal.** On SWE-bench Verified, solved and unsolved tasks have the same test-writing rate, and prompting for more tests barely changes outcomes (2602.07900). For most problems, under 20% of generated tests separate correct from incorrect patches (R2E-Gym). This matches round 11's "norms not decided" and weakens "agents write their own tests" as the oracle substitute.
- **A fresh-context auditor** is the best-supported external check: LongHorizon-Harness (2608.01964) **[checked]** runs a Manage-Execute-Audit loop in which "a read-only auditor [verifies] the resulting environment state before the next round", and reports WeaveBench 51.8% → 80.7%, Terminal-Bench 2.1 69.7% → 77.2%, OSWorld 2.0 2.8% → 8.3%. The abstract does not say whether compute was matched, and the loop has a manager that picks the next subtask, so only the auditor part fits murmur; Cognition reports a clean-context reviewer works best. In humans, quorum rules (sticklebacks, honeybee scouts) commit only after several independent actors act, and one signal is ignored by larger groups.

## 3. Ideas that fit murmur's rules, ranked

Each idea is oracle-free, non-hierarchical, and needs a new profile (and in most cases a new default-off lever). Each is compared with C1T (one agent with the clock and tokens-left line) at matched total tokens, plus the single-agent control that removes the "more total work" explanation.

### H1. Execution-quorum finish with a fresh-context auditor (targets stopping judgement)
- **What:** an agent's `done` is provisional. A teammate entering later (staggered entry), with no access to earlier transcripts, reads the folder cold, runs the program, writes and runs its own probes, and posts a gap list with raw command output. The swarm ends only after a done claim survives an audit, with no changes since. Agreement posts do not count, only executed checks.
- **Sources:** LongHorizon-Harness's read-only auditor (there after every round, here only on a done claim), Cognition clean reviewer, Cursor's overclaiming, OverclaimBench, Lorenz (agreement inflates confidence), Seeley/Ward quorum.
- **Control that matters:** C1T + `relay` (a fresh instance of the same single agent takes over after done, which murmur already has, and which beat 3-agent swarms in round 5A). If the auditor wins only against C1T and ties C1T + relay, the gain is fresh context, not the swarm.
- **Risk:** self-preference bias of a same-model auditor; the audit itself may stop early.
- **Cost:** 1.3–2× C1T per audit cycle.

### H2. Independence first, then one structured exchange (targets convergence and board cost)
- **What:** n=2–4 agents work privately on branches. Before writing code, each lists several distinct approaches in its own scratch and posts a single line naming the one it picked. Later entrants pick an untaken approach or justify the duplicate. No board during work. At a clock mark, murmur posts a digest of each branch (approach, files, own measurements). One revision round follows, then a selection.
- **Selection without an oracle:** pairwise comparison of short rollout summaries in a tournament (RTV, 2604.16529, 70.9% → 77.6% on SWE-bench Verified with 16 rollouts, against the average rollout, not a longer agent). For optimisation tasks, agents also write instance generators and feasibility checkers, and every solver is run on every instance (cross-run). The grader only measures afterwards.
- **Sources:** nominal groups and Delphi, DivInit (2606.17209, +5–7 points at matched compute in search), TopCoder private entries keep diversity, FunSearch-style islands, SAT portfolios.
- **Risk:** this is c5 again (parallel attempts, round 2), which won only with a predictive printed score. The new parts are seeded diversity and an oracle-free selector. Log three numbers per task (C1T, mean attempt, best attempt by hidden grade) to see whether the loss is in coverage or in selection.
- **Cost:** about n × C1T.

### H3. Replace the chat board with a curated shared artefact (targets coordination cost and unwired modules)
- **What:** no `post`. One agent-curated file with a line budget, injected into every agent's context at entry (Cursor's "Field Guide" **[checked]**: "a folder owned entirely by the agents, whose index.md is automatically injected into every agent at start ... their only constraint is a line budget"). Refreshing it on tool results, and asking agents to rewrite rather than append, are murmur's additions, not Cursor's. It holds the requirement ledger (unbuilt items, wiring points) and reproducible facts (a command plus its output that falsifies an approach or states a constraint).
- **Sources:** Cursor SQLite Field Guide (held-out sqllogictest, "the swarm was never told the suite existed"; old swarm over 70,000 merge conflicts, new one under 1,000; no single-agent baseline; all **[checked]**), SAT clause sharing (small items safe to import without trust), the autoresearch constraint registry (2608.10424: gold 22 → 38, redundant bugs 46% → 7.8%), CORAL shared notes (−18.6% without them), Anthropic's long-running harness feature list, sparse-topology debate (−41–53% tokens).
- **Single-agent control:** C1T + the same ledger file, so a gain can be credited to sharing rather than to the ledger.
- **Risk:** murmur's `findings` tool (verified posts) was barely used in round 5. Injection rather than an opt-in tool is the difference to test.
- **Cost:** below the current board arms.

### H4. Runway diagnostic for the tokens-left line (single-agent, cheap)
- **What:** C1T against C1 with a 60-minute clock and no tokens line, and against C1T showing an inflated nominal budget. This separates time pressure from runway and checks whether the tokens line causes context anxiety.
- **Task:** the volume tasks (ospec_green, ospec_brown), where C1T spends the whole cap and its context grows long. On planning and shop2 C1T stops at 0.06–1.23M of 12M within minutes, so the line cannot bite there (side test U's null).
- **Why now:** round 15 C could not separate the longer clock from the tokens line, and every swarm comparison uses C1T as the control.
- **Cost:** small (one agent, short runs).

### H5. Choose tasks by type before choosing levers
- Report results per Steiner/Google task type: unitary and sequential (planning, shop2: the single agent should win), decomposable and large (ospec: the swarm can win on coverage and speed). A swarm claim is credible only on the second kind, at matched spend and wall-clock-limited conditions, which is where real users would deploy one.

## 4. What the literature says not to build

- **Model or persona mixing:** Self-MoA and persona ablations show no gain for correctness; only one model is available anyway.
- **Debate-style review rounds and more board variants:** conformity and martingale results; murmur's threaded board already failed.
- **Locks, leases and claim markers:** Cursor's lock failure; murmur's claims and leases already added nothing.
- **Contract-net bounties, trained topology pruning (AgentPrune):** need labels or a planner.
- **Evolutionary search with a fitness function:** an oracle. Only the isolate-then-migrate pattern transfers (H2).

## 5. Open doubts

- Almost every number is abstract-level and from 2025–2026 frontier models; transfer to gpt-6-luna is untested.
- RTV's and LongHorizon-Harness's baselines are a single rollout or no audit, not a compute-matched persistent agent.
- Elo-per-token (2609.15309, three medium sessions beating one long session on an optimisation task) gives agents continuous scores during the run **[checked: abstract states intermediate submissions are scored]**, so it is an oracle result and only an upper bound for H2.
- Dochkina's "Drop the Hierarchy and Roles" (2603.28990; a sequential protocol beats centralized coordination by 14%) is the nearest analogue to staggered entry, but its abstract mentions no single-agent baseline **[checked]**.
- Human group findings transfer to identical LLM agents only by analogy; identical priors make "independent" attempts less independent than human ones.
