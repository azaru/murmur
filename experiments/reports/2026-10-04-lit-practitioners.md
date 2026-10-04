Model-written literature review (subagent), 2026-10-04. Labels: [verified] read in primary source; [secondary] otherwise.

# What practitioners did with many coding agents (2025-2026), and what it means for murmur

Scope: documented experiences of many agents building software, their coordination design, oracle reliance, and lessons. Earlier reports (OpenAI/Hugging Face incident, "Astra swarm", the IndieDevDan video) are not repeated.

Method note: "verified" means I fetched the primary page. The fetch tool returns a model-made summary of the page, not raw text, so quoted phrases are as the tool relayed them; numbers that drive a decision should be rechecked by hand before they go into docs/research.md. Items I could not reach (Yegge's Medium posts returned HTTP 403) are marked [secondary].

## 1. Bottom line

1. Every large "swarm succeeded" report I found either (a) had a strong oracle that gave every agent a next target (Anthropic's compiler: GCC torture tests, GCC as known-good compiler), or (b) used a hierarchy (Cursor planners/workers, Factory orchestrator, Gas Town mayor), or both. The only non-hierarchical, oracle-free swarm I found with positive reports (Gusev and Bernal Neira, September 2026) is a research perspective with no single-agent baseline and an unresolved verification backlog.
2. Cursor reports that flat peers failed for two distinct reasons: lock mechanics (fixed by optimistic concurrency) and, after that, risk-aversion with no hierarchy. The second matches murmur's "yielding" and "avoid the hard module" failures. My reading (inference, not stated by Cursor): without an oracle, someone has to generate and own work items; the planner does that. The oracle does that in Anthropic's setup. murmur has neither by design, so this is the most honest hint that non-hierarchy is part of the problem, at least at large N.
3. The best-measured conflict result is Cursor's July 2026 SQLite experiment: the same task and models, old swarm vs redesigned swarm, merge conflicts fell from over 70,000 to under 1,000. The fix was a mix of hierarchy (planners own design), an agent-curated shared "Field Guide", and a neutral merge agent. There was no single-agent baseline. Cursor itself says gains come "from this context efficiency, more than from parallelism itself".
4. The one practitioner head-to-head against a single agent (embedding-shapes, one human plus one GPT-5.2 agent, ~20K LOC browser, about EUR 19) is informal, but it matches murmur's central finding. Simon Willison: still waiting for concrete evidence that swarms of parallel agents are worthwhile.
5. Vendors converge on "writes stay single-threaded; extra agents read, review or validate" (Cognition, Factory, Claude Code docs). This is the same as murmur's staggered-entry finding (one early agent claims the core, later ones validate).

## 2. Source-by-source

Format: (a) design, (b) measured vs baseline, (c) oracle, (d) lesson and murmur finding, (e) lever.

### 2.1 Cursor, "Scaling long-running autonomous coding" (Jan 2026) [verified]
- (a) Three generations. Gen 1: equal-status agents coordinating through a shared file with locks. Gen 2: optimistic concurrency (reads free, write fails if state changed). Gen 3: planners (recursive sub-planners) create tasks; workers do one task each and do not talk to other workers; a judge decides at cycle end; an integrator role was tried and removed ("more bottlenecks than it solved").
- Failure quotes: agents "hold locks too long or forget to release them"; "twenty agents would slow down to the effective throughput of two or three"; agents updated the coordination file without taking the lock; with optimistic concurrency and no hierarchy, "agents became risk-averse. They avoided difficult tasks and made small, safe changes instead."
- (b) Browser project: about 1M lines, 1,000 files, about a week; Solid-to-React migration 266K additions and 193K deletions over 3 weeks. No baseline against one agent. Later work by Wilson Lin says peak about 2,000 concurrent agents, near 30,000 commits [verified via Simon Willison's page].
- (c) Specs (WHATWG, CSS-WG, ECMA-262 as git submodules), screenshot comparison to golden samples, Rust compiler checks. The CI at the end showed an 88% job failure rate and `cargo check` failed on the last commits [secondary: The Register, HN]; Lin says the harness "occasionally leaves the repo in an incomplete state but does converge". Humans patched compilation afterwards [secondary: HN commenters].
- (d) Supports murmur: yielding/risk-aversion without hierarchy, broken shared files, free coordination cost. Also stated: "the prompts matter more than the harness"; Opus 4.5 "tends to stop earlier and take shortcuts", GPT-5.2 better for extended work (model dependence of the stopping failure).
- (e) Lever: a "hard-first" norm is not enough; test instead a self-chosen ownership note ("I own X until it is wired and used") that is public in the folder but never assigned by anyone. Compare against C1T.

### 2.2 Cursor, "Towards self-driving codebases" [verified]
- (a) Root planner (does no coding), recursive subplanners owning narrow slices, workers that talk to no one, a handoff message carrying "important notes, concerns, deviations, findings". A centralised integrator ("hundreds of workers and one gate") was removed. Tried and failed: a single "continuous executor" with too many jobs (it "would sleep randomly, stop running agents, do work itself, refuse to plan"), and plan-everything-upfront-then-execute (cannot adapt).
- (b) Peak about 1,000 commits per hour over 10M tool calls in a week. No baseline.
- (c) Browser-without-JavaScript target; heavy logging.
- (d) Early stopping: agents "frequently stopped to proclaim success despite being far from it". Cursor's fix was structural: a planner that owns a slice is accountable, so motion continues. Prompt lessons worth copying: "constraints are more effective than instructions" ("no TODOs, no partial implementations" beats "remember to finish implementations"); numeric ranges change behaviour ("generate 20-100 tasks"); scratchpad files rewritten rather than appended; allow agents to pivot and challenge assumptions; accept a small steady error rate rather than a perfect gate. They also warn: "too little structure and agents conflict, duplicate work and drift; too much creates fragility."
- (e) Lever (oracle-free): phrase the finishing condition as constraints ("no module unwired, no TODO, nothing stubbed") and add a scratchpad that is rewritten, not appended. Cheap; applies to C1T too, so it is fairly testable.

### 2.3 Cursor, "Agent swarms and the new model economics" (Wilson Lin, 2026-07-20) [verified, primary page]
- (a) Planners (frontier model) split goals into task trees and own design; workers (cheaper model) do narrow tasks; a Field Guide (an agent-owned folder whose index.md is auto-injected into every agent at start; entries curated within a line budget; captures "surprise encounters" so the next trajectory is shorter); a neutral third-party Reconciler / merge agent resolves conflicts "on behalf of all parties"; design docs with compile-checked references; stacked, decorrelated review lenses (transcript only, output only, codebase only, across models); a custom VCS taking about 1,000 commits per second.
- (b) Same task, same models, old vs new swarm. Task: implement the 835-page SQLite manual in Rust with no source, no test suite, no binary and no internet. Grader: the held-out sqllogictest suite, used only to measure. Old Grok 4.5 run: more than 70,000 merge conflicts, hottest file 7,771 conflicts, 54 crates, halted before hour 2. New run: under 1,000 conflicts, hottest file 47, 9 crates, 80% at 4 hours; every new configuration eventually reached 100% of the suite. Cost: Opus 4.8 planner plus Composer 2.5 workers about USD 1,339; GPT-5.5 for both roles about USD 10,565 (about 8x for similar quality). Final code size for one pair: 9,908 vs 64,305 lines. No single-agent baseline.
- (c) Notably oracle-free for the agents, which is the closest practitioner analogue to murmur's realism rule. Agents still wrote their own tests (not stated in detail; my inference). The authors checked runs by hand for cheating and shortcuts. Test suite score is not product maturity (C API, locks, crash recovery not covered) [secondary: yage.ai analysis].
- (d) Supports: conflicts and sprawl come from a lack of shared design, not from parallelism per se; "everyone converging" has a mirror failure (split-brain: conflicting planners) that they fix with shared design docs. Contradicts "all coordination is waste": a cheap, curated, always-injected shared memory was a core component. It also suggests why free boards cost 31-62% of tokens in murmur: chat is uncurated and unbounded, the Field Guide is bounded and injected.
- (e) Lever (non-hierarchical, oracle-free): replace the board with one agent-owned, line-budgeted, auto-injected `FIELD_GUIDE.md` that any agent may edit and must keep within N lines. Test arm: C1T plus the same file (one agent) vs N agents plus file.

### 2.4 Anthropic, "Building a C compiler with a team of parallel Claudes" (Feb 2026) [verified]
- (a) 16 Claude agents (Opus 4.6), each in its own Docker container, cloning from a bare git repo mounted at /upstream; a task is claimed by writing a text file to `current_tasks/`; git's push conflict forces a second claimant to pick something else; finished agents pull, merge, push and remove the lock; "no orchestration agent"; an outer bash loop starts a fresh session as soon as one ends. Agents specialised on their own (code quality, documentation, performance).
- (b) About 2,000 sessions, 2B input and 140M output tokens, just under USD 20,000, about 100K lines of Rust, compiles Linux 6.9 on x86, ARM and RISC-V, 99% on the GCC torture suite. No single-agent baseline stated. Limits listed by Anthropic: no 16-bit real mode, no own assembler or linker, inefficient output, "new features and bugfixes frequently broke existing functionality".
- (c) Heavy oracle reliance, explicit: "the task verifier is nearly perfect" is the stated precondition; GCC torture tests; GCC used as an online known-good compiler. Critics note the swarm got thorough human-built test suites [secondary: The Register], and that a hello-world failed in some environments because of hard-coded include paths [secondary: HN].
- (d) Key lesson for murmur: parallelism "is trivial" when there are many distinct failing tests; it collapsed on the Linux kernel, where "every agent would hit the same bug, fix that bug, and then overwrite each other's changes". They only recovered by creating a partition (GCC compiled a random subset of files, Claude's compiler the rest, so different agents had different failing files). This is exactly murmur's "everyone converging on one approach" failure, and the fix was an oracle-created partition, not coordination chat. They also hit "time blindness" and context pollution and answered with sampled test output (1% or 10%) and compact logs. That supports C1T's clock line. Supports non-hierarchy where an oracle exists; does not show non-hierarchy works without one.
- (e) Lever: an oracle-free partition rule that no one assigns, for example agents derive their slice from a self-written feature/failure list by a deterministic rule (hash of agent id modulo N over items). Tests "converging" and "yielding" together. Risk: it is close to assigned work, so check with the user that it counts as allowed.

### 2.5 Anthropic, "Effective harnesses for long-running agents" [verified]
- (a) One agent type with two phases: an initializer writes `init.sh`, a `claude-progress.txt` log, a first git commit and a `feature_list.json` with 200+ features all marked failing; each later coding session reads the progress file and git log, runs a smoke test, does one feature, tests end to end, commits.
- (b) No quantitative results. (c) Self-written feature list and end-to-end browser testing, so oracle-free in the sense murmur needs (the agent writes its own checks).
- (d) Failure modes: declaring the job done early, trying to one-shot the app, marking features done without real end-to-end verification. Anthropic says explicitly that it is "still unclear" whether one agent or a multi-agent design is best. Supports murmur's early-stopping finding; the remedy is a persistent, agent-authored ledger of what is not yet done.
- (e) Lever: the first agent writes the ledger of failing features; later entrants may flip an item only after running it. murmur's shared task list was "barely used", so test whether making the ledger the only completion criterion (finish = ledger empty) changes that. C1T plus ledger is the single-agent control.

### 2.6 Anthropic, "How we built our multi-agent research system" [verified]
- Orchestrator-worker; multi-agent used about 15x the tokens of chat, and token usage alone explained about 80% of performance variance in browsing evaluation; 90.2% better than single-agent Opus 4 on an internal research eval (LLM-judge). Early failures: spawning 50 subagents for simple queries, duplicated work from vague task descriptions. Anthropic states that it performs poorly at coding (fewer parallelizable parts, real-time coordination). Effort-scaling rules were put in the prompt ("1 agent with 3-10 calls for simple facts, 10+ subagents for complex research").
- Murmur reading: supports "spend is the driver" (equal-spend ties). Lever: an effort-scaling line in the prompt keyed to the tokens-left line already in C1T; tests whether agents calibrate spend to task size without an oracle.

### 2.7 Claude Code agent teams (docs, 2026) [verified]
- Experimental; a lead, teammates with their own contexts, a shared task list with dependencies, mailbox messaging, file-locked task claiming; self-claim of the next unblocked task; hooks `TeammateIdle`, `TaskCreated`, `TaskCompleted` (exit code 2 keeps a teammate working: a finishing-condition lever). Docs advise: for "sequential tasks, same-file edits, or work with many dependencies, a single session or subagents are more effective"; start with 3-5 teammates; "three focused teammates often outperform five scattered ones"; "two teammates editing the same file leads to overwrites"; known problems: "teammates may stop after encountering errors instead of recovering", "the lead can stop early too", task status lags because teammates forget to mark tasks completed.
- Oracle: none required, but docs recommend research, review and competing-hypothesis debates first. Community reports (about 4 teammates reporting done after permission denial; "10x cost, best quality") are anecdotal [secondary: HN 46743908, Medium].
- Supports murmur: shared task list under-used (status lags), yielding avoided only by file ownership, early stopping. Their "competing hypotheses" debate (teammates try to disprove each other) is a heterogeneity lever that needs no oracle for debugging-type tasks.

### 2.8 Cognition (Devin), "Multi-Agents: What's Actually Working" (April 2026) [verified]
- Writes stay single-threaded; multiple agents contribute intelligence. Works: a code-review loop where the reviewer has no shared context with the author (average 2 bugs per PR, about 58% severe); a "smart friend" stronger model called as a tool; manager-spawns-children. Fails: the smart-friend pattern with a weaker primary model, because it cannot calibrate when to escalate. Open problems: context transfer and calibration.
- Supports murmur's staggered entry: later agents as clean-context validators. Lever: late entrants start with no read of earlier reasoning, only the output and the folder (decorrelated lens, as in Cursor's July post). Hierarchy is present in their manager pattern, but the reviewer pattern itself is non-hierarchical.

### 2.9 Factory, Missions (2026) [secondary: conference-talk summaries; factory.ai page redirected and was not read]
- Orchestrator plus workers plus validators; each feature gets a fresh worker; features run serially, not in parallel, because agents "step on each other's changes, duplicate work, and make inconsistent architectural calls"; parallelism only for read-only work (search, research, validator review). A validation contract is written before implementation ("tests written after implementation don't catch bugs, they confirm decisions"). Longest mission 16 days; most wall-clock time was spent on behavioural validation.
- Hierarchy-only design; evidence that serial persistence beats parallel writes, same as murmur's C1T result. Lever: write the acceptance criteria (agent-written, not task-provided) before coding, a pre-registered self-check list. This is oracle-free and the first agent can write it; later agents validate against it. Note murmur's rule: no check that reveals correctness; an agent-written contract is fine.

### 2.10 Gas Town and Beads (Steve Yegge, Jan 2026) [secondary; Medium returned 403]
- Mayor (human-facing dispatcher), polecats (ephemeral workers), witness (supervises and unsticks), refinery (merge queue), deacon (health), Beads (git-backed work items). GUPP: agents must run work that is on their hook, so workflows survive session crashes. Targets people already running 10-30 agents; Yegge says money is the barrier. Maggie Appleton's analysis [verified via fetch of her page]: design and planning become the bottleneck ("you have to do a LOT of design and planning to keep the engine fed"), and it was "vibe coded, and vibe designed too". HN criticism is loud; reports say it works for independent, clearly specified tasks and falls apart when work is ambiguous [secondary].
- Hierarchy-only. Relevant mechanism: persistence by a standing rule (propulsion) plus a supervisor nudge. Non-hierarchical analogue: a self-nudge when the agent's own queue is empty ("if nothing is on your list, re-audit the folder for unwired work before stopping").

### 2.11 CORAL (arXiv 2604.01658, COLM 2026) [verified, arXiv HTML]
- Peers, each in its own git worktree, asynchronous, coordinating through shared persistent memory (scored attempts, notes, skills) symlinked into all worktrees; no orchestrator; "heartbeat" prompts: reflect every iteration, consolidate every 10 evaluations, redirect after 5 non-improving evaluations. Oracle: a numeric grader per task (lab-like).
- Results: on kernel engineering, one agent 1,350 cycles vs four agents 1,103; ablation: removing notes/skills cost 18.6% on kernels; co-evolution beat the best independent run on all three ablation tasks (the claim is coordination, not extra compute, though the compared independent runs are a different baseline from equal-spend single agents). 36% of attempts used another agent's commit as parent; 66% of new records came from a cross-agent parent; agents' strategy vocabularies overlapped only 0.43.
- Contradicts "free boards do not help" only partly: the shared memory here is structured (scores, notes) and driven by a numeric oracle. Supports 2.3 (curated memory). The stagnation-redirect heartbeat has an oracle-free analogue: trigger on "no new committed diff in k turns".

### 2.12 SwarmResearch (arXiv 2607.02807) [verified, arXiv HTML]
- A Shepherd orchestrator spawns search agents, each on its own git branch with limited context (isolation preserves diversity); baselines EvoX and CORAL at stated budgets; beat EvoX on 13/15 and CORAL on 10/15 open-ended optimisation tasks; orchestrator-guided scaling beat the best fixed scaling on 4/5 tasks. Failure: the orchestrator itself drifts toward greedy local search.
- Supports private parallel attempts (isolation keeps diversity). Oracle: numeric scores. Contradicts "visibility is good": here, shared visibility collapses diversity.

### 2.13 Gusev and Bernal Neira, "AI Agent Swarms as Researchers" (arXiv 2609.35719, 2026-09-28) [verified: abstract; body details from fetch summary]
- Swarms of off-the-shelf coding agents (Claude Code and Codex harnesses), one standing instruction "make real, correct, useful progress, and do not stop", literature, solvers, compute; intentionally non-hierarchical, no pre-built workflow or approval gates; independent cross-provider review; Lean proofs where possible. Output: 45 potential papers, 22 complete drafts, 1,699 pages; they report no major errors on review but cannot yet confirm novelty or correctness; the bottleneck became verification (months of review backlog).
- Closest practitioner analogue to murmur's philosophy and the strongest positive for non-hierarchy and "do not stop". Caveats: models far stronger than gpt-6-luna may be (it names GPT-6 Astra, GPT-5.6 Sol, Claude Fable 5.1); no single-agent baseline; output volume is not quality; no negative results reported. Overlaps with the earlier Astra report, so not expanded.
- Lever: copy the one-sentence persistence instruction plus a cross-model reviewer, testable as "C1T plus a do-not-stop line" first.

### 2.14 Merge-conflict and cost evidence from the wild
- Xu, Subramanian, Karthik (2026), arXiv:2607.04697: 33,596 agent-authored PRs in 2,807 repos; cross-agent conflict rate 41.7% vs 19.8% within the same agent; 57.6% content conflicts, 26.8% modify/delete, 15.1% add/add. [secondary: reported by a blog (codex.danielvaughan.com); the paper itself was not read]. Cross-agent conflicts roughly double: consistent with "everyone writes the same file" and architectural disagreement.
- Willison, "Embracing the parallel coding agent lifestyle" (Oct 2025) [verified]: use parallel agents for research, understanding code, low-stakes maintenance, carefully specified work; limit is human review; "mentally exhausting" with four agents. Not about autonomous swarms.
- embedding-shape, "One Human + One Agent = One Browser" (HN 46779522) [secondary]: single GPT-5.2 agent in Codex, three days, about 20K LOC, about EUR 19; WPT and specs placed in the repo but the logs show they were never consulted; humans steered. Simon Willison's comment there: "still waiting to see concrete evidence" for swarms.
- Cost: agent teams roughly 7x tokens in plan mode [secondary, blog]; "ten agents use quota ten times as fast" [secondary]; Anthropic's 15x [verified]. Practical ceilings quoted by Osmani and the Claude Code docs: 3-5 agents [verified for docs; Osmani via fetch, qualitative, no measurements].
- A cohesion-aware task-partitioning paper (arXiv 2606.00953) was fetched but the fetch summary looks unreliable (generic claims, "up to 3.8x speedup"); not used.

### 2.15 Other tools (design only, no outcome data)
- Claude Squad, Conductor, Sculptor, uzi, ccswarm: worktree-per-agent managers for humans; the human is the integrator; advice is "merge one branch at a time" [secondary]. claude-flow/Ruflo: hierarchy of "queens" and workers, headline numbers (84.8% SWE-bench) are self-reported and I found no independent replication [secondary]. Cursor best-of-N: same prompt to several models in separate worktrees, human picks [secondary]; this is the human-as-selector pattern, which murmur's oracle-free rule forbids as an automatic step.
- MCP Agent Mail (Dicklesworthstone): peer identities, inboxes, advisory file reservations with TTL leases, git plus SQLite [secondary: GitHub readme]; no outcome data. Closest off-the-shelf analogue to a board with locks, which murmur found unhelpful.
- Karpathy's agenthub (March 2026): bare git repo plus message board, no main branch, no PRs, a DAG of commits; the repo went private within days, forks survive [secondary]; autoresearch ran 700 experiments in two days for a single agent thread [secondary]. No swarm results.
- Amp/Sourcegraph: parallel subagents for mechanical edits (seven subagents, 180K-line Go refactor in eleven minutes) [secondary]; Thorsten Ball later said subagents are "not a promising direction" [secondary].
- Kimi K2.5 Agent Swarm: trained orchestrator (PARL), up to 100 sub-agents, up to 4.5x lower critical steps in wide search [secondary]; this is wide, read-heavy work, not shared-codebase writing.

## 3. Cross-cutting patterns

| Pattern | Evidence | murmur link |
|---|---|---|
| Oracle gives work items and partitions | Anthropic compiler; CORAL; Cursor SQLite grader used only to measure | Explains why swarms look good in lab rounds 1-10 and why oracle-free peers stall |
| Hierarchy substitutes for the oracle in generating and owning work | Cursor 3 generations; Factory; Gas Town | Non-hierarchy may be the cause of yielding and unwired modules |
| Single-threaded writes, parallel read/validate | Cognition; Factory; Claude Code docs | Matches staggered entry (early core, later validators) |
| Curated shared memory beats free chat | Cursor Field Guide; CORAL notes; Anthropic progress file | Board cost 31-62% |
| Isolation preserves diversity | SwarmResearch; Karpathy agenthub DAG | Parallel private attempts |
| Early stopping is the base failure of agents | Anthropic harness; Cursor; Claude Code docs | Persistence levers (C1T clock) |
| Speed, not quality, is the swarm's reliable win | Cursor commit rates; Kimi 4.5x; Amp 11 minutes | 4-6x wall-clock for 12 agents |
| Model dependence | Cursor: Opus 4.5 stops early, GPT-5.2 persists; Cognition smart-friend fails with weaker primary | Findings may not transfer across models |

Honest assessment of non-hierarchy: the evidence neither shows that non-hierarchy is the problem nor that it is not. Counter-evidence in favour of non-hierarchy: Anthropic's 16 peers with only a lock file, and Gusev and Bernal Neira. Evidence against: Cursor's flat peers, and the pattern that every successful non-hierarchical case has an oracle or a very strong model. For murmur, the realism rule removes the oracle, so the Cursor result is the one that applies, with the nuance that Cursor's peers were hundreds, not 3-12, and used locks.

Designs that only work with hierarchy: Cursor planners/subplanners with handoffs, Factory serial orchestrator with validation contract, Gas Town mayor and refinery, Devin manager-children. None of these can be copied into murmur without breaking its rule.

## 4. Testable ideas (all against C1T = one agent with a clock and tokens-left line)

1. **Agent-owned Field Guide replaces the board.** One file, line-budgeted, injected at the start of every turn or session, rewritten rather than appended, editable by anyone, no messaging tool. Oracle-free: yes. Non-hierarchy: yes. Cost: low (a small change in `src/board.ts`; saves the coordination turns). Arms: C1T plus Field Guide; N agents plus Field Guide; N agents plus board. Prediction: Field Guide cuts the 31-62% board overhead while keeping the shared knowledge; one-agent version tests whether the file itself helps persistence.
2. **Constraint-phrased finishing plus agent-written ledger.** First agent writes a ledger of unbuilt items (all marked failing) and a pre-coding checklist of acceptance behaviours; finishing condition is phrased as constraints ("no unwired module, no stub, no TODO, ledger empty") and an own-activity heartbeat fires after k turns without a commit ("re-audit the folder for modules nobody wired in"). Oracle-free: yes (agent-written). Non-hierarchy: yes (no one assigns). Cost: low, prompt plus one hook; applies to the single agent, so C1T plus ledger is a clean control. Targets early stopping and unwired modules directly (Anthropic harness, Cursor "proclaim success", Factory contract-first).
3. **Decorrelated late validators.** Staggered later entrants get the folder and the final output but not the earlier agents' transcripts, with the single job to write and run their own tests and fix what fails on a branch; optionally one with transcript-only. Oracle-free: yes. Non-hierarchy: yes (a role from the menu chosen by the agent, or enforced by entry order). Cost: moderate. Builds on the staggered-entry finding and on Cognition's and Cursor's reviewer result.

Lower priority: self-computed partition by hash of agent id (kills "everyone converging", but is close to assigned work; needs the user's call); effort-scaling line keyed to tokens-left (Anthropic research system); one-sentence persistence instruction "do not stop" (Gusev and Bernal Neira) as a cheap first arm for C1T.

## 5. Open doubts

- None of the large swarm reports has a single-agent baseline at equal spend. Cursor and Anthropic report capability and throughput, not efficiency. The murmur finding (a persistent single agent ties or beats at equal spend) is therefore not contradicted but also not directly supported by any practitioner with a controlled comparison.
- Several summaries came through the fetch tool's model summaries (details such as 36%/66% in CORAL, SQLite cost table). They should be rechecked by hand if cited in docs/research.md.
- The Gusev and Bernal Neira perspective uses far stronger models; its "no collapse, no early stopping" claim may not transfer to gpt-6-luna.
- Cursor's browser output was disputed (CI failing, humans patched the build); treat its quality claims with caution. The July 2026 SQLite post is stronger because of the held-out grader, but it was written by the vendor and compared old and new swarms only.
- I could not read Yegge's Medium posts, the Factory page (redirected), the 2607.04697 paper or Karpathy's agenthub original (private).
- The Hacker News "Show HN: lessons from running Claude Code swarms at scale" (id 48407998) is a centralised fleet manager with token-overhead lessons (system tools about 15K tokens, 7% of a session); low relevance.

## 6. Sources

| Source | URL | Status |
|---|---|---|
| Cursor, Scaling long-running autonomous coding | https://cursor.com/blog/scaling-agents | verified |
| Cursor, Towards self-driving codebases | https://cursor.com/blog/self-driving-codebases | verified |
| Cursor, Agent swarms and the new model economics (2026-07-20) | https://cursor.com/blog/agent-swarm-model-economics | verified |
| Analysis of the Cursor SQLite experiment (yage.ai) | https://yage.ai/share/cursor-sqlite-harness-swarm-en-20260723.html | secondary |
| minisqlite repo (named by Cursor, not opened) | https://github.com/cursor/minisqlite | not read |
| Wilson Lin on FastRender (Simon Willison) | https://simonwillison.net/2026/Jan/23/fastrender/ | verified |
| Simon Willison on Cursor's post | https://simonwillison.net/2026/jan/19/scaling-long-running-autonomous-coding/ | verified |
| The Register on the browser | https://www.theregister.com/2026/01/22/cursor_ai_wrote_a_browser/ | secondary (critique) |
| HN: Cursor browser experiment | https://news.ycombinator.com/item?id=46646777 | secondary |
| HN: One Human + One Agent = One Browser | https://news.ycombinator.com/item?id=46779522 | secondary |
| Anthropic, Building a C compiler with a team of parallel Claudes | https://www.anthropic.com/engineering/building-c-compiler | verified |
| The Register on the compiler | https://www.theregister.com/2026/02/13/anthropic_c_compiler/ | secondary (critique) |
| HN: Hello world does not compile | https://news.ycombinator.com/item?id=46920922 | secondary |
| Anthropic, Effective harnesses for long-running agents | https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents | verified |
| Anthropic, Multi-agent research system | https://www.anthropic.com/engineering/multi-agent-research-system | verified |
| Claude Code agent teams docs | https://code.claude.com/docs/en/agent-teams | verified |
| Cognition, Multi-Agents: What's Actually Working | https://cognition.com/blog/multi-agents-working | verified |
| Factory talk digest (Alvoeiro) | https://www.alcreon.com/podcast-digest/missions-multi-agent-systems-that-ship-for-days-luke-alvoeiro-factory | secondary |
| Factory Missions (redirects to factory.com/news/missions, not read) | https://factory.ai/news/missions | not read |
| Gas Town: Maggie Appleton | https://maggieappleton.com/gastown | verified (her page) |
| Gas Town notes (Torq) | https://reading.torqsoftware.com/notes/software/ai-ml/agentic-coding/2026-01-15-gas-town-multi-agent-orchestration-framework/ | secondary |
| Yegge, Welcome to Gas Town | https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04 | not read (403) |
| CORAL | https://arxiv.org/html/2604.01658v2 | verified |
| SwarmResearch | https://arxiv.org/html/2607.02807v1 | verified |
| Gusev and Bernal Neira, AI Agent Swarms as Researchers | https://arxiv.org/abs/2609.35719 | verified (abstract) |
| Merge-conflict study write-up (arXiv:2607.04697) | https://codex.danielvaughan.com/2026/07/28/agent-pr-merge-conflicts-concurrent-coding-agents-codex-cli-worktree-isolation-coordination-defence/ | secondary |
| Simon Willison, parallel coding agents | https://simonwillison.net/2025/Oct/5/parallel-coding-agents/ | verified |
| Addy Osmani, Code Agent Orchestra | https://addyosmani.com/blog/code-agent-orchestra/ | verified, qualitative |
| HN: Claude Code swarms | https://news.ycombinator.com/item?id=46743908 | secondary |
| HN: lessons from Claude Code swarms at scale | https://news.ycombinator.com/item?id=48407998 | secondary |
| MCP Agent Mail | https://github.com/Dicklesworthstone/mcp_agent_mail | secondary |
| Karpathy agenthub write-up | https://rywalker.com/research/agenthub | secondary |
| Karpathy on X (autoresearch SETI@home) | https://x.com/karpathy/status/2030705271627284816 | secondary |
| Kimi K2.5 Agent Swarm guide | https://www.datacamp.com/tutorial/kimi-k2-agent-swarm-guide | secondary |
| 10 parallel agents, week 1 | https://findskill.ai/blog/claude-code-10-parallel-agents-week-1/ | secondary |
