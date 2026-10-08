Model-written design study (subagent), 2026-10-06.

# Organisational architectures for the swarm: how to arrange 12 agents into groups

Scope: design family "how to arrange groups". Not a review. Builds on `2026-10-06-theories-for-the-swarm.md` (A1-D4, not re-proposed; extended or contradicted by name), the six `deep-*` reports (HG-2 and HG-3 levers, M1-M5, L1-L6), `group-science-game-theory-v2.md` section 3 (round 20 lessons), and the round 17 record (C1TR, AUD). Task-type tags: SD = single-deliverable quality-bound (planning, shop2); BATCH = 5-10 independent repository tasks (DeepSWE).

Reading log. Full text: Conway 1968, Little et al. 2010, DeChurch & Marks 2006, Hansen 1999 (abstract and hypotheses only). Abstract only: BOAD. Everything else [memory] or [secondary].

## 1. Headline

1. **Capacity before coordination.** In round 20 eleven of twelve agents had called `done` by minute 23. An arrangement that only changes who talks to whom spends the same seats at the same early moment, so the designs rank by where in the clock and across which boundary capacity is held.
2. **Conway's arithmetic favours small groups for BATCH.** Paths grow as about n squared over 2 (Conway 1968, p. 31 [full text]): 66 for 12 agents, 3 for each pod of three. Round 20 showed that board and status cost tokens and bought no work; independent repositories need only a thin port (O2).
3. **For SD, parallel first, then one lineage.** Little et al. (2010): iteration raises the mean and shrinks variance, parallel work raises the odds of the best single result; they suggest parallel iterative lines then continuing on the best branch (5.2, Conclusion [full text]). D5 ends in selection, so what the losers learned is discarded (O1).
4. **Fresh-context relays are not free.** C1TR's relays made 0 edits and AUD's later agents added about +0.05. O4 keeps one relay only as a capacity device, with a drop condition.
5. **Hierarchy enters through four doors**: team leads, liaisons, an integrator or judging team, a senior integrating team. Each card says how it avoids them; section 4 lists the ones that cannot be rescued.

First tests: O2 (pods on BATCH), O1 (SD), O7 (reserve across pods, extends A1). O4 and O5 are riskiest.

## 2. Design cards

ST = 12 agents, one swarm, staggered entry. C1T = one agent with clock and tokens line. Equal tokens = same cap (32M BATCH, 12M SD). Build costs are rough line counts of default-off levers.

### O1. Fork-and-converge (parallel lines, then blind adoption of one lineage)

- **Theory (tags):** parallel vs iterative processes and the hybrid (Little et al. 2010 [full text]); nominal groups then interaction (C1 in the theories note); explore-then-exploit (March 1991 [memory]); sparse early communication preserves variety (Lazer & Friedman 2007 [secondary via HG-2]).
- **Structure:** 3 pods of 4 (or 4 of 3), each with its own folder and board, started together. Basis for the split: none beyond membership order (agents 1-4, 5-8, 9-12 by entry slot). Nobody assigns work inside a pod. Phase 1 (0 to 40% of the clock): other pods' folders are invisible (nothing crosses). At 40% every pod's folder becomes readable to all, read-only. Phase 2: each agent, once, makes a blind `adopt(folder)` choice, committed before any choice is revealed (commit-reveal, no counts shown before). Mechanical rule: the folder with the most adopters becomes the single live lineage, and its folder is writable by everyone; ties go to the pod whose last write is the oldest, to avoid favouring the loudest. Adoption requires the agent to have run at least one command inside the folder (tool-checked, no judgement of the result). Agents may still import files from losing folders by copying (read-only source), which is how their good parts survive. Combination: one folder is the deliverable; no integrator, because phase 2 is a single-lineage swarm.
- **Mechanism:** phase 1 decorrelates errors of identical models; phase 2 recovers the cumulative improvement that pure selection discards. Visibility starts late because prior work leads later workers astray (Little 5.2).
- **Prediction:** pods differ more at 40% than ST's first agents (file overlap, distinct criteria posted); final score above ST and above pure selection, with smaller spread across repetitions (ST's two repetitions diverged by 0.22). Falsified if the converged lineage scores no better than the best pod's frozen 40% snapshot.
- **Cheapest test:** planning and shop2, k=3, 12M: arms ST, C1T, O1. Add a free arm: the O1 run's own best pod snapshot at 40% (copy the folder, grade it) as a within-run control for phase 2.
- **Task type:** SD. For BATCH it triples work per repo and fits badly (see D5 verdict).
- **Rule tension:** the adoption rule is mechanical, not a quality judgement; blind commit limits herding. Not hierarchical.
- **Build cost:** about 120 lines: per-pod board and folder scoping (board.ts, tools.ts), a time-triggered visibility switch (swarm.ts), an `adopt` tool with commit-reveal.

### O2. Pods on a batch with a thin one-way port

- **Theory:** Conway's communication-path count and the "organise according to the need for communication" criterion (Conway 1968 pp. 28, 31 [full text]); loose coupling (Weick 1976, Orton & Weick 1990 [memory]); component teams with a shared distal goal (Mathieu, Marks & Zaccaro 2001; Zaccaro, Marks & DeChurch 2012 [memory]; DeChurch & Marks 2006, p. 311 [full text], where inter-team coordination, not within-team process, carried MTS performance).
- **Structure:** 12 agents in 4 pods of 3, entry staggered across the pods (one agent per minute, rotating pods, so every pod gets an early member). One shared workspace of ten repositories; one board per pod, with post-only boards as today. Basis of the split: none; pods claim repositories by first write (B2 ownership from writes), so each pod ends up with its own set. What crosses a pod boundary: a **port**, a mechanical one-line-per-repository digest (last write minute, writer's pod, "has an unfinished list from a leaver": the HG-2 L1/L2 view), delivered **only when an agent attempts its first write in a repository that another pod wrote in** (point of use, not on every tool result) and in the agent's `done` result. Parallel. No combination problem: repositories are independent. Timing: all along.
- **Mechanism:** a 3-way board instead of a 12-way one (round 17 E: board 31-62% of tokens); the port gives the one fact independent repositories need, "someone is or was on this one".
- **Prediction:** at equal tokens, score within noise of ST (k=3) while board tokens fall at least 40%, and fewer cross-pod same-repository collisions within 2 minutes. Falsified if score falls by more than 0.05 or collisions do not fall.
- **Cheapest test:** the round 17 E five tasks, 32M, k=3, ST against O2 against C1P (one agent persisting).
- **Task type:** BATCH. For SD it is O1's phase 1.
- **Rule tension:** pods are self-formed by first write, so no assignment. A "pod lead" would be hierarchy and does not exist. The port is facts only, no quality signal.
- **Build cost:** about 80 lines: board scoping per pod, port digest at first-write-in-foreign-repo (reuses the work-map code planned for HG-2 L1).
- **Note:** pod membership by entry slot is the weakest part; fallback is one board plus the port (ST-port), a strict subset.

### O3. Visiting rights (self-selected boundary spanning by pull)

- **Theory:** boundary-spanning activities and external ties (Ancona & Caldwell 1992 [memory]); weak ties help search but hurt the transfer of complex knowledge (Hansen 1999, abstract p. 82 and hypotheses 1-2 [full text, abstract and hypotheses]).
- **Structure:** in a pod arrangement (O1 phase 1 or O2), any agent may call `visit(pod)` once per hour of clock. It returns, from the visited pod's folder, the mechanical digest of the changes since the visitor's last visit (file list with sizes and diff stats, exit notes of agents who left) and opens a read-only view for 10 minutes. The visitor returns to its own pod and posts nothing by force; if it posts, only to its own board. People never move. What crosses: a digest and read access. Who carries it: the agent who chose to look, pulling at the moment it is stuck or finishing.
- **Mechanism:** `visit` transfers *search* ("rival has a parser for X"); complex parts move by read-only file copy (Hansen). Cost is paid only by those who choose it.
- **Prediction:** visits cluster before `done` and after stalls; visited files reach the visitor's folder in a minority of visits. Falsified if visits are under 1 per agent per run.
- **Cheapest test:** a sub-arm inside O1: O1 with and without `visit` between 15% and 40%, same tokens.
- **Task type:** SD mostly; on BATCH the port of O2 already does the job.
- **Rule tension:** none; volunteer pull with a private benefit, so duplicates are harmless.
- **Build cost:** about 50 lines.

### O4. Shifts: waves of teams entering at the quarter points (follow-the-sun)

- **Theory:** sequential relay and cumulative improvement (Little et al. 2010, iterative process [full text]); handoff bundles (I-PASS, Patterson et al. 2004; HG-3 M1, M2 [secondary]); follow-the-sun development [memory].
- **Structure:** 12 agents in 3 shifts of 4, entering at 0%, 33% and 66% of the clock (within a shift, staggered by one minute). One workspace, one board. A shift ends only when its members have called `done`; shift k+1 enters whether or not shift k has finished. Basis: time only. What crosses: the **handover bundle** assembled by the tool, shown once at entry (not on every result): per repository or folder, diff stat since the start, minute of the last write, exit notes of the agents who left with their unfinished lists (HG-3 M2). Sequential. Nothing is combined: the workspace is the deliverable.
- **Mechanism:** in ST every seat is spent in the first 12 minutes; later shifts cannot quit early because they have not entered. The bundle gives arrivers availability and ownership facts, which round 20 showed they use.
- **Prediction:** more edits after minute 40 than ST and a higher score where ST stopped early. **Drop condition:** if shifts 2 and 3 average under 5 edits per agent and call `done` within 3 minutes (as C1TR's relays did), it is ST with fewer early seats.
- **Cheapest test:** the round 17 E five tasks, 32M, k=2: ST vs O4 vs "ST with 4 seats only" (to separate "less capacity early" from "fresh later seats"). Without the third arm a null cannot be read.
- **Task type:** BATCH (state is visible as files, handover per repository). On SD it is AUD with larger shifts, which is already measured as weak.
- **Rule tension:** none; later shifts receive facts, not an audit instruction.
- **Build cost:** about 60 lines, mostly the existing `enterOnDone` and staggered entry with a clock trigger and a bundle printer. Risk of trading the strong early parallel burst (swarm = speed win) for late seats: that is exactly what the test measures.

### O5. Mainline by cross-team signature (federated trees)

- **Theory:** open-source federations: Linux subsystem trees with sign-off trailers [memory]; Apache core and its public change stream (Mockus, Fielding & Herbsleb 2002, via HG-2 section 2.1 [secondary]); multiteam "between-team processes" as the part that decides MTS outcomes (DeChurch & Marks 2006, p. 311 [full text]).
- **Structure:** 3 teams of 4, each team owns a tree (its folder). A separate `mainline/` folder holds the deliverable. A change enters mainline when a **member of a different team** has **run the changed code** (the tool logs command and exit code in a "Signed-off-by" line attached to the change) and posts nothing else; the pull is performed by the tool, by the same mechanical rule, when the line exists. Anyone may sign off any other team's change. Basis of split: membership by entry order. Crosses the boundary: patches and tool-logged run records; carried by the signing agent. Parallel, continuous; no final tournament.
- **Mechanism:** continuous cross-checking instead of one end tournament; a sign-off needs an executed run by a stranger, so it is evidence about the change, not a vote.
- **Prediction:** mainline contains fewer changes that break the cross-team run than a single-swarm ST folder at the end (measure by re-running agents' own tests at 3 time points, not by a hidden grader); more cross-team reads than D5. Falsified if signatures become rubber stamps: a sign-off in under 30 seconds of tool time on more than half of changes.
- **Cheapest test:** SD tasks, k=3: ST, C1T, D5 (user's design) and O5. Compare to D5 at the same tokens; the point is whether continuous beats end-of-run selection.
- **Task type:** SD (a single deliverable that many agents edit). On BATCH repositories are independent and there is nothing to sign.
- **Rule tension:** Linux maintainers are hierarchy; the substitute is that any stranger can sign. This is the card nearest an "integrator": the mainline rule must stay mechanical, with no one who can refuse. Flagged.
- **Build cost:** about 200 lines (command-run logging with exit code, mainline pull, per-team write roots). The most expensive card; build after O1 and O2.

### O6. Ring visibility (sparse topology between rival pods)

- **Theory:** sparse networks preserve variety, dense ones converge fast (Lazer & Friedman 2007; Mason & Watts 2012 [secondary via HG-2 2.7]).
- **Structure:** variant of D5/O1 with 4 pods of 3. Pod i reads pod i+1's folder read-only from 25%; everything opens at 50%. Only the topology changes.
- **Mechanism:** with full visibility at 25% all rivals can copy the leading draft (Little et al. 5.2 [full text]); in a ring at most one copy path exists and two pods stay independent until 50%.
- **Prediction:** at 50% the pods' deliverables overlap less than under full visibility at 25%, at equal final score. Falsified if the ring lowers the mean.
- **Cheapest test:** D5 with only the visibility rule changed, k=3 on shop2 and planning. **Task:** SD. **Tension:** none. **Build:** about 15 lines on top of O1.

### O7. Floating reserve across pods (capacity keeper)

- **Theory:** on-call reserve and real options (A1 in the theories note); boundary-spanner and job rotation (Ancona & Caldwell 1992 [memory]); round 20 "a signal helps only if someone is free to act" (v2 section 3).
- **Structure:** extends A1 to a pod arrangement (O1 phase 1 or O2). `done` becomes "stand by" for the *whole swarm*, not for its own pod. On a state event (a pod's last live writer left with an unfinished list, or a repository in the O2 port has had no write for 10 minutes while its owner has left) the tool delivers the event, with the folder's handover bundle (O4 format), to **one** standby agent chosen by a deterministic rule (the one that has been standing by longest, preferring a member of a different pod) and, if it has not edited in that folder within 3 minutes, to the next. Everyone else sees no wake. Crosses: a person moves by choice (the agent may decline by calling `done` again), carrying its own context.
- **Mechanism:** pods make capacity local (a pod of three can lose all seats by minute 5); a cross-pod reserve turns idle seats into capacity where work is left, and one-at-a-time delivery avoids four agents on oxvg in 0.2 minutes.
- **Prediction:** pick-up latency of a leaver's unfinished unit falls to minutes (Tengo after robin left at 7.1: never, in ST); one duplicate per event, not four; fewer tokens per event than `revive` (53-87% of AUD's tokens). Falsified if the woken agent calls `done` again within 1 minute in over half of events: then the stopping rule is the lever, not waking.
- **Cheapest test:** BATCH, five tasks, 32M, k=2: ST vs ST + A1 (single-swarm reserve) vs O2 + O7. The comparison A1 against O7 isolates the pod effect.
- **Task type:** BATCH first; SD has one folder, so there is nothing to float to.
- **Rule tension:** a mechanical rotation that offers, not assigns, work; the nearest thing to dispatch here. Fallback: wake all standby agents and accept duplicates.
- **Build cost:** about 100 lines, shared with A1.

### O8. Interface-first pods for multi-module deliverables (Conway mirroring)

- **Theory:** Conway p. 28-29 [full text]; mirroring (MacCormack et al. 2012; Colfer & Baldwin 2016 [memory]).
- **Structure:** only for deliverables with real module structure. Pods own subtrees by first write; a seam file between two pods that import each other is writable by those two pods only (permission derived from imports). No integrator: only the two owners of a seam can see a mismatch.
- **Prediction:** fewer cross-module breakages at three timepoints (agents' own build); worse on tasks without modules (section 4). **Test:** at least three modular tasks, k=2, vs ST. **Task:** multi-module SD only, not planning or shop2. **Tension:** a fixed split of work, derived not assigned; a stretch. **Build:** about 150 lines; last.

## 3. What the theory says about D5 (the user's three rival teams)

**Keep:**
- Own folder and own board per team, others read-only. It is the cheapest way to get independent lines (O1 phase 1) and it keeps the cost of the board at 4-way instead of 12-way (Conway, p. 31: paths about n squared over 2).
- A mechanical final rule instead of a judge. Any judging role would be an integrator.
- Teams of 4 rather than 2. Pairs give no capacity margin when one agent calls `done` at minute 2.

**Change:**
1. **Visibility timing.** Snapshots at 25% let rivals copy the leading draft; later workers rarely backtrack (Little 5.2) and the first draft carries most of the score (round 17). Open at 40-50%, or use a ring (O6).
2. **Selection throws away learning.** A pure tournament keeps the winner and discards the losers' discoveries; Little et al. recommend continuing iteration on the best branch. Add a phase where the winner's folder becomes writable by all, with import of loser files allowed (O1 phase 2), or continuous cross-team sign-off (O5).
3. **Rival tests are correlated.** Agent-written tests encode each team's reading of the task, and the shared model correlates the readings, so the tournament may select code easiest for tests to pass. Keep it mechanical, compare with blind adoption, never tune it to the grader.
4. **"Encouraged to do better than the rest" is a prompt.** The record says prompt text does not move behaviour. Replace it by a fact the team receives at a decision point: when an agent is about to call `done`, it is shown what changed in the rival folders since it last looked (event-triggered, no scores).
5. **Capacity.** D5 does not address the dominant driver. A team of four can die at minute 5. Add a floating reserve across teams (O7) or stagger entry across teams.
6. **Task fit.** For BATCH D5 triples work per repository for a gain independent repositories cannot use; use pods that split repositories (O2).

**Add:** visit rights (O3) for the losers' discoveries, and a within-run control: grade the snapshot at the visibility switch to measure phase 2.

## 4. Designs that look good but theory says fail (including smuggled hierarchy)

- **Team-of-teams with liaisons (McChrystal) [memory].** Liaisons are chosen by commanders: the flag hierarchy is the mechanism. Substitute: volunteer visits (O3) and the mechanical port (O2).
- **Multiteam leadership (DeChurch & Marks 2006).** Inter-team coordination fully mediated leadership's effect on MTS performance (p. 311 [full text]; 64 three-team student simulations), but the manipulation was leader training. The transferable half, that between-team process drives system performance, went into the port and the mainline rule, not into leaders.
- **Structural ambidexterity with a senior team that integrates [memory].** The integration is a role. With entry order as the explore/exploit split it reduces to O1 plus staggered entry, so no card.
- **Orchestrator sub-swarms.** BOAD (arXiv 2512.23631, abstract) and Cursor's planner-worker design are hierarchy by construction. Cursor's flat failure had two causes, one fixed by optimistic concurrency, so it does not prove flat teams fail.
- **Fresh-context relay as audit.** C1TR's relays made 0 edits; AUD's later agents added about 0.05. Relays help when the later worker has an artefact and a reason to change it; "check against the spec" is not one. Only O4 keeps a relay, with a drop condition.
- **Conway-mirrored pods for planning or shop2.** Conway p. 28: delegation narrows the designs that can be pursued. One connected argument split into section pods installs defects at the seams and is an assignment in disguise. O8 is limited to real module boundaries.
- **Appointed boundary spanners (Ancona & Caldwell's ambassador role).** An appointed spanner is a liaison and a single point of failure: it will call `done` early and take the link with it (HG-3 FM1).

## 5. Three load-bearing claims

1. **Conway 1968, Datamation April 1968, p. 31 (pdf p. 4), "system management".** "The number of possible communication paths in an organization is approximately half the square of the number of people"; "it becomes necessary to restrict communication in order that people can get some 'work' done"; conclusion: organise "according to the need for communication". Basis for pods (O2, D5's 4-way boards). Caveat: arithmetic, not measurement.
2. **Little et al. 2010, sections 4.1.1, 4.3.1, 5.2, 7.** Iteration raised mean ratings (7.9 vs 7.4, p = 0.04) with lower variance (0.68 vs 0.9); parallel work gave a higher chance of the best result; prior work "can have a negative effect on quality by leading future workers down the wrong path"; suggested hybrid: parallel iterative lines, then iterate on the best branch. Sole primary support for O1. Caveat: Turkers on short tasks, and the hybrid is proposed, not tested.
3. **Hansen 1999, ASQ 44(1), abstract p. 82, hypotheses 1-2.** Weak inter-unit ties "help a project team search for useful knowledge in other subunits but impede the transfer of complex knowledge" (120 projects, 41 divisions, one firm). Fixes what crossings carry in O2/O3: pointers, with artefacts moved as complete files. Caveat: observational, human; abstract and hypotheses read only.

Supporting full-text reading: DeChurch & Marks 2006, p. 311 (abstract): inter-team coordination fully mediated the effect of MTS leadership on MTS performance in 64 three-team simulation systems, student sample.

## 6. Sources

- Conway, M. E. (1968). How Do Committees Invent? Datamation 14(4), 28-31. https://www.melconway.com/Home/pdf/committees.pdf [full text, read]
- Little, G., Chilton, L. B., Goldman, M., Miller, R. C. (2010). Exploring Iterative and Parallel Human Computation Processes. HCOMP. https://www.cs.columbia.edu/~chilton/web/my_publications/LittleIterativeHCOMP2010.pdf [full text, read]
- DeChurch, L. A., Marks, M. A. (2006). Leadership in Multiteam Systems. Journal of Applied Psychology 91(2), 311-329. https://atlas.northwestern.edu/wp-content/uploads/2017/03/DeChurch-et-al.-2006.pdf [full text, abstract and results read]
- Hansen, M. T. (1999). The Search-Transfer Problem. Administrative Science Quarterly 44(1), 82-111. https://study.sagepub.com/sites/default/files/Hansen%2C%20M.T.%20(1999)%20%E2%80%98The%20search-transfer%20problem.pdf [abstract and hypotheses read]
- Xu, I. et al. (2026). BOAD: Discovering Hierarchical Software Engineering Agents via Bandit Optimization. https://arxiv.org/abs/2512.23631 [abstract]
- Chalmers study on coordination patterns for multi-agent LLM systems (31 articles; single, sequential, hierarchical on unit-test generation): https://odr.chalmers.se/bitstreams/b34c2bd8-5032-4f7c-82c6-6d70ce7296de/download [search snippet only, not read]
- [memory, not retrieved]: Mathieu, Marks & Zaccaro 2001; Zaccaro, Marks & DeChurch 2012; Weick 1976; Orton & Weick 1990; O'Reilly & Tushman 2004; Tushman & O'Reilly 1996; Ancona & Caldwell 1992; MacCormack, Baldwin & Rusnak 2012; Colfer & Baldwin 2016; McChrystal 2015; March 1991.
- Internal: `experiments/reports/2026-10-06-theories-for-the-swarm.md`, `2026-10-06-deep-hg2-peer-production-networks.md`, `2026-10-06-deep-hg3-handoffs-stopping.md`, `2026-10-06-group-science-game-theory-v2.md`, `2026-10-04-lit-practitioners.md`, `docs/research.md` (round 17, round 20).
- Every card is untested; the round 17 and round 20 evidence is k=2 on five tasks. Even the cheapest test (O2) needs k=3 to separate from ST's own 0.60 between-repetition spread on the shared five tasks.
- O2 and O7 both rely on pod membership by entry slot. If the user reads that as a role assignment, the fallback is "one board plus the port" (ST-port).
- I could not retrieve the primary texts for multiteam-system theory (Mathieu 2001, Zaccaro 2012), Ancona & Caldwell, Weick, or the mirroring papers, so their parts of the cards are from memory; the cards lean on Conway, Little and Hansen, which were read.

## Open doubts

All cards are untested; k=3 is needed against ST's 0.60 between-repetition spread. Pod membership by entry slot (O2, O7) may read as role assignment; fallback is one board plus the port. Primary texts for MTS theory, Ancona & Caldwell, Weick and the mirroring papers were not retrieved.
