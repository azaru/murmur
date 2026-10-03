# Lever recount for 12-agent swarms without an oracle (2026-10-03)

Written by the main session (Claude) after round 14. The user restated the goal: **the only goal of murmur is a better swarm, and knowing when a swarm is useful.** From now on the swarm has **12 agents**, and the user wants pronounced differences. Every lever that was tested only with an oracle has to be re-tested without one.

## Already tested without an oracle

| lever | round | verdict |
|---|---|---|
| clock (minutes left on every tool result) | 11 (R3, R4), 14 D | **works**: single agents keep working, with gains of +0.26 to +0.34 on contract tasks at 4–10× the tokens; swarm agents keep working too |
| generic engineering norms | 11 (R2) | nothing measurable |
| write guard / `append` | 12 | `append` fixes the chunked-write mechanism; the score effect is not measurable at k=4 |
| bare post-only board, n=2 | 14 D | no gain; a teammate does not keep agents working |

## Tested only with an oracle: re-test without one

| lever | how it was tested | verdict then | why re-test at n=12 |
|---|---|---|---|
| board on/off (`messaging`) | F1, criba 1 | refuted (no effect, 33–62% of tokens on coordination) | the base contrast at n=12: isolated agents in one folder vs a board |
| delivery `attach` / `pull` / `steer` | criba 1 (x1, x4) | delivery changed, habits did not | at 12 agents, how posts reach agents decides the coordination cost |
| file-write notices (`notices`, without check-run notices) | criba 1 (x3) | worse | awareness of who changed what matters more with 12 writers |
| roles chosen from a menu (`roles`) | criba 1 (c2) | not better than norms | self-organised specialisation may only pay off at scale |
| staggered entry (`spawnGapSeconds`) | criba 1 (c2) | bundled with roles, not isolated | later agents see a structure to join |
| claims and leases (`claimLease`), `staleGuard` | criba 3 | add nothing next to the write guard | the broken shared file comes back with 12 writers in one folder |
| fresh-context relays (`relay`, `relayContext`) | 5A, 9 | supported against n=3 | at n=12 it is also the only cost control (cost ≈ turns × context) |
| verified findings (`finding` tool) | 5A, 5B | barely used | it runs the agent's own command, so it is oracle-free; a way to share knowledge at scale |
| threads (`threads`) | 9, 10C | refuted on cost at n=4 | topic routing may matter more at 12 |
| revive (wake done agents on new posts) | criba 1 (c3) | bundled with `doneGate` | without the gate it is a realistic finishing rule |
| parallel attempts with selection by the agents' own probes (`x1g-select` method) | criba 2–3, 5A, 9, 10 | beats a plain single agent, not one with relays; with a printed score, n=2 reached packing2's good mode 3 of 3 | **only if rewritten without any acceptance-check language**: selection by the agents' own probe matrix is real work, and it is the strongest candidate for exploration tasks at 12 |
| section split for volume (`v-swarm-clock` norms) | 9 V | lost −0.16 | volume is where 12 agents could cover more; the old norms speak of hidden tests and must be rewritten |
| re-allocation across tasks (batch) | 5B, 6B | refuted on its own | not a priority |

## Lab-only: never re-test

`doneGate`, `doneAfterGreen`, `helpAfter`, check-run notices, selection by a printed score, and every norm that says "hidden tests" or "call done when the check passes". Profiles c3-close, b-swarm and every c4g-* or x1g-* profile with norms embed these. New profiles start from the neutral briefing.

## New levers (not built yet)

Each has a real-world analogue, and none assigns work. Each needs implementation in `tmp/claude-<task>/src`, a scripted smoke and a 12-agent smoke before any campaign.

1. **Self-claimed work items (issue tracker).** Agents create items, take one, and mark it done. murmur only keeps the list and shows progress. It would replace free-text claims.
2. **Branch per agent with merge (pull requests).** Each agent works in its own git worktree. A `merge` tool integrates into the shared tree and reports conflicts. This attacks the broken shared file at scale.
3. **The agents' own test suite on every merge (CI).** murmur runs `tests/` (written by the agents, so not an oracle) when someone merges, and posts the result.
4. **Clock-driven freeze (code freeze).** In the last N minutes, agents are told to integrate and test only.
5. **Self-chosen approach and a shared candidates folder (parallel experimentation).** For optimisation tasks, agents post which approach they take, write candidates to `candidates/`, and score them with their own evaluator. The objective's formula is in PROBLEM.md, so this is not an oracle.
6. **Quorum finish.** The run ends when two thirds of the agents have called done.

## Cost: the binding constraint

Rates measured today, for one agent: about 0.45M tokens/min on ospec (6M in 13 min), 0.08M/min on planning and 0.1M/min on contract tasks. Round 10's n=10 used 3M in 4–6 minutes. Twelve agents cost about 12× while contexts are small:
- planning, 15 min: about 15M per run;
- ospec, 10 min: 50M or more per run;
- optimisation tasks, short runs: about 5M per run.

Today's Codex quota ran out after about 108M. A factorial round at k=2, with 2 tasks and 3 swarm arms, needs about 150–250M, which is several quota windows.

## Framing to decide

- **(a) Equal wall-clock.** Each agent gets a single-agent-sized budget, and cost is reported next to every score. This is real use: a user who launches 12 seats pays 12× to get more done in the same time. It is the only framing in which a swarm can plausibly win, and it answers "when is a swarm useful".
- **(b) Equal total tokens**, as in every round so far. It structurally penalises 12 agents, which get one draft each.
