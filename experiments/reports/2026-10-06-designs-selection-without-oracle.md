Model-written design study (subagent), 2026-10-06.

# Selection and aggregation without ground truth: designs for K groups, one output

Evidence tags: `[full text, pp.]` read in the downloaded PDF; `[abstract]` abstract page only; `[secondary]` summary or news; `[memory]` from training, not re-read. Nothing here was measured on murmur. I did not read `runs/`, so every "cheapest test" below is a procedure for the main session to run, not something I checked. I use the project's gloss rule: ST = twelve agents in one swarm with a board; C1T = one agent with the clock and a tokens line.

## 1. Headline

1. **The discriminating fact is where the failures are shared.** In the closest replication of Knight & Leveson with coding agents (Ron, Baudry, Monperrus 2026), 48 versions written by five agent systems, several models and three languages still failed together 3.7 times more often than independence predicts, and 81 of 146 cross-language pairs with a defined correlation had identical failure vectors [full text, pp.7, 1]. The shared failures sat on one hard sub-problem (a plausible shortcut: circumcircle instead of minimum enclosing circle) plus a few specification ambiguities [full text, pp.8-9]. So the thing to decorrelate is the **hard-sub-problem shortcut and the reading of ambiguous clauses**, not the sampling seed. Different seeds in separate groups of the same model are the weakest decorrelator on the list.
2. **Voting still helps; it helps the tail less than the mean.** Majority of three cut mean failures from 387.44 to 130.99 and raised zero-failure units from 56.25% to 68.48%, but the P99 stayed at 419 failures against 6,004 for singles, and P95 barely moved (429 vs 419) [full text, p.10]. Selection among K same-model groups buys a real but bounded gain, and the residue is exactly the shared misreading.
3. **Best mechanical rule available:** score each candidate only on tests that *discriminate* (some candidates pass, some fail), counted across groups, with an agreement early-exit that costs nothing when all candidates behave alike (cards S1, S9). Tests every candidate passes carry no information (CodeT's consensus set rests on the same idea). This is D5's tournament, changed.
4. **Opinion-based aggregation (SP, peer prediction, BTS, LLM judge) needs voters with different priors**; identical models have none (Section 5). Use them only to triage where candidates diverge.
5. **Merging beats picking only when quality is additive** (batch units, plan sections); for one holistic deliverable pick, cheaply (S5).
6. **Agents take part through artefacts, never opinions:** a reproducible failing command is a costly stop signal (S4); a posted reading is a ledger entry (S3).

## 2. Correlated-failure evidence

### (i) Knight & Leveson 1986
I could not get the original paper's text. What I read is a 3-page student summary hosted at KTH [secondary]. From it: 27 versions from the same specification at two universities (9 UVA, 18 UCI), one million random test cases, a gold program as oracle. Six versions had no failure; 21 passed more than 99% of cases; 23 passed more than 99.9%. Yet many cases failed more than one version: the most common coincidence was two versions on the same case (551 cases), and one extreme case had eight versions failing together (twice). The independence hypothesis was rejected (z = 100.55 in the summary). The common faults, as I recall [memory], sat in hard parts of the algorithm that many programmers got wrong the same way; the 2026 replication agrees.

### (ii) Agents and LLMs
- **Ron, Baudry, Monperrus 2026, "N-Version Programming with Coding Agents", arXiv 2606.20158** [full text, pp.1, 7-10; 7 pages]. 48 admitted implementations (Claude Code, Cursor, Gemini CLI, OpenCode agent systems, 23 models, Pascal/Python/Rust), 1,000,000 test inputs, shared oracle.
  - Pooled: 429 inputs where at least two versions fail, against 115.36 expected under independence (K/μ about 3.7, z = 29.20) [p.7, Table III]. Within Python, 419 vs 23.97 (K/μ about 17.5); within Rust, 419 vs 4.91 [p.7]. The per-language ratios are far larger than the pooled one: the same few inputs fail many versions of the same language.
  - Across languages: 761 pairs, 615 with undefined φ because one version never fails, 146 defined; 81 of those 146 sit at φ = 1 (identical failure vectors), 40 are non-positive [p.7].
  - Failures "overwhelmingly concentrate" in two conditions (LIC 9 and 14), both variants of the minimum-enclosing-circle predicate; a recurring mistake is computing a circumcircle instead [pp.8-9, Fig. 7-8]. Two other conditions expose a specification ambiguity (floating-point comparison). The remaining recurring faults are described as "concrete implementation errors rather than specification mistakes" [p.9]. One agent system (Codex) had no failing admitted version [p.8]. Caution: a blog summary I fetched said failures were mostly about "two specification ambiguities"; the paper says the main cluster is a **wrong-but-plausible algorithm**, not an ambiguity.
  - Majority of three: mean failures 387.44 to 130.99; 68.48% of triples have zero failures against 56.25% of singles; P95 429 vs 419; P99 6,004 vs 419; max 10,469 vs 419 [p.10].
- **Kim, Garg, Peng, Garg 2025, "Correlated Errors in Large Language Models", ICML** [full text, pp.1, 4]. 349 models on a HuggingFace leaderboard (12,032 questions), 71 on Helm (14,042), 20 on resume screening. Pairs of models that are *both wrong* choose the same wrong answer about 60% of the time on Helm, where random wrong choice would give 1/3 (p.1); mean 0.423 on HuggingFace, with 97.5% of Helm pairs above the random baseline (p.4). Same provider, same architecture and similar size raise it; **more accurate models are more correlated even after conditioning on those** (pp.1-2). As judge, a model inflates the measured accuracy of weaker models and deflates stronger ones, because it accepts wrong answers it shares (p.4, Section 4). This is across different models; two samples of one model are closer still.
- **Test generation from faulty code:** Huang et al., arXiv 2409.09464 [abstract]: tests generated from incorrect code detect 47% fewer bugs on real-world examples; natural-language descriptions give back +34%.

### (iii) Do agent-written tests share the author's misunderstanding?
Yes, to the extent the author's reading of the task is the failure. Supports: Huang et al. above; CodeT, where same-model tests and solutions lift HumanEval pass@1 from 47.0% to 65.8% but give no significant lift on competition-level APPS and CodeContests [full text, p.6]; and the project's note that under 20% of generated tests separate correct from incorrect patches on R2E-Gym (`2026-10-04-lit-selection.md`, secondary). Same-model tests help on easy items and fail on the hard items where the shared reading is wrong.

### What this implies, quantitatively
- Treat an N-group majority as worth roughly N_eff = N / (1 + (N-1)ρ) voters (the standard design effect; my arithmetic, not a source). With the pairwise error agreement Kim et al. find (about 0.6 against 0.33 chance), ρ is far from zero, so N_eff for K = 3 or 12 same-model groups is small: roughly 2 to 3 whatever K is.
- Condorcet with correlated voters (Ladha 1992) [memory]: majority accuracy stops converging to 1 once the common-cause component is positive. Adding groups past about 3 buys almost nothing on a hard shared mistake and costs 4x tokens, which fits round 9's "not decided at 4x".
- What breaks the correlation, ranked by what the evidence supports: (a) different **hard-step approach** (forced by a taboo list, S7); (b) different **information** (one group sees a rival's committed approach, another does not; or one gets the reference reading of an ambiguous clause from an execution, S3); (c) different **model family** (Ron et al. mixed agent systems and models; Codex's clean admitted set suggests family matters; needs the user's decision on `gpt-6-luna`, same as C2); (d) different seeds in one model: the weakest.

## 3. Design cards

Common conventions. "Candidate" = one group's final folder/output. "Foreign test" = a test written by a group other than the candidate's own. The selection step is a mechanical script at the end (like CI), run by murmur, not an agent; agents write tests and artefacts before it, with no authority. Round 20 lesson applied: nothing is broadcast on tool results; selection data is read only by the final step and, where stated, at one or two snapshots.

### S1. Discriminativeness-weighted cross-test (D5's tournament, repaired)
- **Theory:** differential testing, CodeT dual execution agreement, AlphaCode clustering by behaviour (agreement on shared inputs, not tests passed); information value of a test = how much it splits the candidates.
- **Rule:** inputs: K candidates; the union of all agents' tests and their test inputs, each runnable by command. Procedure: run every test and every input against every candidate (sandboxed, timeouts). Drop a test that all candidates pass (no information) and one that all candidates fail (likely a bad test or a spec-wide misreading; flagged, not scored). For each remaining test, weight w = 1 / (number of candidates that pass), or the binary-entropy of the pass fraction; ignore the author group's own candidate for that test. Also run all test *inputs* with no expected output on every candidate and cluster candidates by identical outputs (AlphaCode). Deliver the candidate with the highest weighted foreign score; ties go to the larger behaviour cluster. Participants: all agents write tests during the run (they do already); no one judges.
- **Why it should pick well:** it drops the part of D5's score that is pure conformity (tests everyone passes, which show only shared reading). It fails when the shared misreading is in all groups' tests *and* candidates: then no test discriminates, and the output is a coin flip among equal candidates. That is the Ron et al. regime for the hard sub-problem.
- **Prediction:** the selected candidate's hidden grade is closer to the best than raw "most foreign tests passed" and than random; on units where candidates are equal, S1 ties with random.
- **Cheapest test:** offline replay (main session, not me) on existing multi-candidate outputs for the same repository: round 20 gave several arms with k = 2 on the same five tasks; round 9 has parallel attempts. For each task, take the candidates, extract the agents' tests, run S1 and raw D5, then compare the *selected* grade with mean and best (grader used only to measure). Live: K = 3 groups of 4 against ST (12 agents, one swarm) and C1T.
- **Task type:** batches (DeepSWE) first; single deliverable only if tests exist.
- **Rule tension:** none. Mechanical rule; tests are agent-written. Check: a task with no tests at all gives nothing to run; S1 must degrade to S9's agreement test, not to a made-up score.
- **Build cost:** low-medium (a harness that runs a union of test commands per candidate; the main risk is test portability across foreign folders, since a test written against group A's file layout fails B's for interface reasons; require tests to take the project root and call the documented interface).

### S2. Surprise ledger: execution-based "surprisingly popular" as triage, never as verdict
- **Theory:** surprisingly popular (Prelec, Seung, McCoy 2017), Bayesian truth serum, peer prediction.
- **Rule:** each test comes with a one-field prediction in the `test` tool call: "which candidates will pass?" (no pay-off). After S1's run, tests whose realised pass pattern differs from the prediction ("all pass" but one fails) form a short divergence list shown at the next snapshot and logged. It feeds repair and S4 stop signals; it picks no winner.
- **Why:** SP needs voters with different private information. Identical agents share the prior, so prediction equals answer and the surprise term vanishes (Section 5). Execution supplies the missing "actual" side, so SP's idea finds surprises instead of deciding.
- **Prediction:** divergence-list tests expose later-fixed defects 2-3x more often than random tests.
- **Cheapest test:** replay: for existing agent tests, execute and compare to any recorded expectation; live: add the field to the test tool (prose requests do not move behaviour, round 20).
- **Task type:** batches, tasks with tests. **Tension:** none. **Cost:** low once S1 exists.

### S3. Interpretation ledger: decorrelate the reading before the code
- **Theory:** Ron et al.'s concentration on a few hard or ambiguous clauses; Schulz-Hardt dissent-before-discussion; commit-then-reveal.
- **Rule:** the first write tool call requires a ledger entry: 2-5 points where a reasonable reader could decide either way, the decision taken, a one-line test that would split the readings, and the planned algorithm for the hard sub-problem. A script compares ledgers across groups at the 25% snapshot; points where groups differ are flagged to those groups and weighted up in S1. No group sees rivals' entries before posting its own.
- **Why:** turns a shared misreading into a visible split when readings differ, and yields the distinguishing test cheaply. Fails when all groups read alike (the usual same-model case): then it only records the shared mistake.
- **Prediction:** ledger disagreement points coincide with S1's top-weighted tests. Whether the minority reading is more often right is untested and may be false.
- **Cheapest test:** live only: K = 3 with and without ledger (S1 in both) against ST and C1T.
- **Task type:** planning, issue-style batches. **Tension:** must be a tool precondition, not a prompt. **Cost:** medium.

### S4. Cross-inhibition quorum: stop signals as failing commands
- **Theory:** honeybee nest-site choice: competing proposals, recruitment by assessed quality, quorum, cross-inhibitory stop signals that break deadlock between equal sites (Seeley et al. 2012) [secondary]; Seeley & Buhrman quorum models [memory].
- **Rule:** a **stop signal** is a post carrying a command and expected output that fails on a rival candidate; murmur re-runs it and records it only if it reproduces. An **endorsement** is a run record (command, exit code) of a candidate's own tests passing in a foreign group's hands, not a vote. A candidate reaches **quorum** with endorsements from two foreign groups and no reproducing, unrepaired stop signal; the first to do so after the 50% snapshot is delivered. Signals lift when the command passes after a repair. No quorum by the end: fall back to S1.
- **Why:** the stop signal is costly and specific (the scout had to visit the rival site); a reproducing command is checkable by anyone, so it needs no authority. Fails when all groups share the blind spot (no one produces the command) and when stop signals are hostile tests only the author passes (Section 4).
- **Prediction:** candidates repaired after a stop signal gain more than ones left alone; quorum without stop signals is no better than S1.
- **Cheapest test:** live only: K = 3 groups of 4 with S4 vs S1 alone vs ST vs C1T; measure repairs per signal and delivered grade against the best candidate.
- **Task type:** both. **Tension:** none if quorum is a script. **Cost:** medium-high (sandboxed reproduction, lifting).

### S5. Pick per unit; merge by test-guided transplant only when quality is additive
- **Theory:** Condorcet with correlated voters; independent units multiply comparisons.
- **Rule:** batches: apply S1 per repository, not per team; K teams work on all repositories and the delivered folder for r is its best candidate. Multi-section plans: S1 winner as base; a rival section that passes a discriminating test the base fails becomes a transplant item any free agent may take; it closes when the base passes the test and its own tests.
- **Why:** one bad draw costs one unit, not the batch. Merging a holistic output (one schedule, one global design) mixes designs and breaks invariants, so there pick.
- **Prediction:** per-unit pick beats per-team pick by the spread of team quality across units; transplant does not help holistic tasks.
- **Cheapest test:** replay on round 20's multi-arm runs per repository: "best arm per repository by S1" vs "best arm overall by S1", grader only scores.
- **Task type:** batches (pick), planning (merge). **Tension:** transplant is a self-selected item. **Cost:** low (pick), medium (transplant).

### S6. Mutation score as test weight (tests of tests)
- **Rule:** murmur mutates each candidate mechanically (boundary, negation, arithmetic, early return; about 50 mutants) and runs each group's suite on it; S1 weights tests by their suite's kill rate and drops suites below a floor.
- **Why/fails:** separates strong from decorative suites without ground truth; a mutant of a misread solution is still graded by tests that encode the misreading.
- **Prediction:** kill rate correlates with the hidden grade of the suite's own candidate. **Cheapest test:** replay with a standard mutation tool on existing repositories.
- **Task type:** code batches only. **Tension:** none. **Cost:** medium, language-specific; run last.

### S7. Taboo-list approach diversification
- **Theory:** Hong-Page diversity; anti-coordination games; Ron et al.'s single wrong shortcut.
- **Rule:** groups enter staggered and post their hard-step algorithm family (S3's field) before coding; later groups see earlier families as a taboo list ("choose another unless you name the earlier one's failure mode").
- **Why:** makes repeating the shared shortcut costly. Fails when only one family is feasible or the forced family is worse.
- **Prediction:** distinct families across K groups rise from about 1-2 to K; best-of-K rises, median group falls slightly.
- **Cheapest test:** live, with and without taboo, S1 in both; partial replay: count families in existing solutions (verify by hand).
- **Task type:** shop2, planning. **Tension:** close to assigned roles; it constrains by what was chosen, not by who does what. Flag for the user. **Cost:** low-medium.

### S8. Foreign-only blind pairwise tiebreak (last resort)
- **Theory:** LLM-as-judge pairwise tournaments; position and self-preference bias (Panickssery et al. 2024); Kim et al. p.4.
- **Rule:** only when S1's top two are within a margin. A volunteer from each foreign group sees two candidates as S1's table of discriminating tests (not code), positions randomised, and answers only with a command that would change its mind; no command, the larger behaviour cluster wins.
- **Why/fails:** cheap when rare; all agents share one model, so foreign-only does not remove self-preference. Value is eliciting evidence, not a verdict.
- **Prediction:** near chance alone. **Cheapest test:** replay on close-call pairs; drop if near 50%.
- **Task type:** both. **Tension:** volunteers, no authority. **Cost:** low.

### S9. Agree-then-ship, disagree-then-dig
- **Theory:** selection has value only where candidates differ; self-consistency's use of agreement.
- **Rule:** after S1's run, cluster candidates by behaviour on all inputs. One cluster: deliver any candidate and skip all other steps. Several clusters: activate S2, S4, S8, capped (for example 10% of the clock).
- **Why:** round 9 won only where a score separated candidates; budget should follow disagreement. Cannot save agreement on a wrong answer.
- **Prediction:** most units show one cluster; the grade gain lives in the minority that splits.
- **Cheapest test:** replay: share of units where candidates give identical outputs on shared inputs. Live: wrapper around S1.
- **Task type:** batches; shop2 (compare on validity only). **Tension:** none. **Cost:** low.

## 4. Verdict on D5's cross-test tournament: **change**, keep the mechanism

D5: 3 teams of 4, own folders and boards, rivals read-only, snapshots at 25/50/75%, the solution passing most foreign tests is delivered.

- **Keep:** a mechanical end rule, foreign-only scoring, agent-written tests, read-only visibility. Ron et al. show that voting over agent-written versions improves the mean even with strong coupling (p.10), and CodeT-style agreement lifts easy items [p.6].
- **Change 1: replace "passes most foreign tests" with S1 (discriminativeness weights).** Passing-count rewards the candidate that matches the common reading, i.e. the modal solution, which in the correlated regime is also the modal mistake. It also counts tests every candidate passes, which carry no information.
- **Change 2: per-unit selection (S5) for batches.**
- **Change 3: gate rival visibility.** Showing same-model agents a rival's code at 25/50% invites copying (herding, B5 in the theories note), the opposite of decorrelation. Show executed results and divergence points (S2) first; open code at 75%. Add S3/S7 inputs before coding if the budget allows.
- **Change 4: agree-then-ship (S9)** so a batch where teams agree does not pay for tournament infrastructure.
- **Weaknesses D5 keeps:** (a) foreign tests encode the foreign interface, so require tests to use the documented interface; (b) hostile tests only the author passes: count a test that fails all but its author's candidate only if a second group's candidate agrees, or cap each group's weight at 1/K (untested); (c) nothing fixes a misreading shared by all teams.

Replace the tournament only if the replay shows S1's selected grade is no better than random choice among the candidates (then selection is worth nothing without an oracle, and the right move is to spend the budget on a single longer agent, C1T).

## 5. Designs that look good but fail

1. **Raw majority/plurality over K same-model groups.** Effective voters about 2 to 3 (Section 2); Ladha's limit does not reach 1 with a positive common cause. The shared shortcut wins the vote. (Ron et al. p.10: the P99 tail stays.)
2. **Surprisingly popular or BTS among same-model agents.** SP's guarantee requires private signals that differ and a common prior about how signals relate [full text, Prelec et al. 2017, p.1: "under reasonable assumptions about voter behaviour", with the two-worlds argument on pp.1-2]. Identical agents have one prior, so "what will others say" equals "what I say"; the surprise is zero by construction. BTS [memory] also needs a large population with independent signals and it rewards honest reporting only in a truth-telling equilibrium. SP does work as a method on heterogeneous panels (21.3% fewer errors than majority across four studies [secondary: MIT news summary of Nature 541]); murmur's panel is homogeneous.
3. **Peer prediction paying for agreement.** Miller, Resnick & Zeckhauser (2005) [memory] rewards a report by how well it predicts a peer's; babbling equilibria (everyone says the same thing) exist. Same-model agents coordinate on the focal answer, so an agreement-paying rule rewards the shared misreading. Use only the effort-neutral variant (S2): no pay-off, only a triage signal.
4. **LLM-as-judge between groups of one model.** Kim et al. p.4: a judge inflates the accuracy of weaker models by accepting shared wrong answers; Panickssery et al. report self-preference scaling with self-recognition. Foreign-only judging does not remove the effect when all agents are the same model. The project's own headline: self-reports overstated 4.8-9.3x (`2026-10-04-lit-adjacent-fields.md`, cited not re-read).
5. **Recruitment proportional to self-assessed quality (naive bee model).** Bees' assessments are physical and independent; agents' self-assessment is overstated. Use executed foreign evidence (S4).
6. **Different seeds, temperatures or personas inside one model.** Ron et al. and Kim et al. show coupling across systems; seeds change the surface, not the reading or the shortcut.
7. **Counting tests passed as the final signal on hard tasks.** CodeT's gains vanish on competition-level problems (p.6).
8. **Tournaments where agents have authority to eliminate candidates.** A judge in disguise; hierarchical.

## 6. Three load-bearing claims, with exact locations

1. **Agents' failures are coupled across agent systems, models and languages.** Ron, Baudry, Monperrus 2026, arXiv 2606.20158, p.7 (Table III: K = 429 coincident-failure inputs against μ = 115.36 expected under independence, z = 29.20; and the cross-language φ paragraph: 81 of 146 defined pairs at φ = 1); pp.8-9 (Fig. 7-8: failures concentrate in LICs 9 and 14, a circumcircle instead of a minimum enclosing circle); p.10 (majority of three: 387.44 to 130.99 mean failures; P99 6,004 to 419). [full text, 7 pages]
2. **LLM errors agree beyond chance and more so for accurate models.** Kim et al. 2025, arXiv 2506.07962: p.1 (Helm pairs agree about 60% when both wrong, against 1/3 for random wrong choice), p.4 (mean 0.423 on HuggingFace; 97.5% of Helm pairs above baseline; Section 4, judges inflate accuracy of weaker models). [full text, 29 pages]
3. **Same-model test/solution agreement helps on easy items and not on hard ones.** Chen et al. 2022, CodeT, arXiv 2207.10397, p.6 (HumanEval pass@1 47.0% to 65.8%; "improvements are not significant for competition level problems in APPS and CodeContest"; +7.4% on introductory APPS). [full text, p.6]

## 7. Sources

Read in full or in part (downloaded to `tmp/claude-designs-selection/pdf/`, deleted at the end):
- Ron, Baudry, Monperrus (2026), N-Version Programming with Coding Agents, https://arxiv.org/abs/2606.20158 (PDF https://arxiv.org/pdf/2606.20158).
- Kim, Garg, Peng, Garg (2025), Correlated Errors in Large Language Models, https://arxiv.org/abs/2506.07962.
- Chen et al. (2022), CodeT: Code Generation with Generated Tests, https://arxiv.org/abs/2207.10397.
- Prelec, Seung, McCoy (2017), A solution to the single-question crowd wisdom problem, Nature 541:532-535, https://gwern.net/doc/statistics/prediction/2017-prelec.pdf (downloaded; I read its first pages and located the figures), and MIT News summary https://news.mit.edu/2017/algorithm-better-wisdom-crowds-0125 [secondary].
- Panickssery et al. (2024), LLM Evaluators Recognize and Favor Their Own Generations, https://arxiv.org/abs/2404.13076 (skimmed; correlation figures only).
- Li et al. (2022), AlphaCode, https://arxiv.org/abs/2203.07814 (downloaded; used from [memory] for clustering by behaviour on generated inputs).

Abstract or secondary only: Knight & Leveson (1986), IEEE TSE 12(1):96-109, summary https://www.kth.se/social/files/564df871f2765419e306178d/KnightLeveson.pdf (original https://libraopen.lib.virginia.edu/public_view/jd472w463, not read); Huang et al. (2024) https://arxiv.org/abs/2409.09464 [abstract]; Seeley et al. (2012) via https://news.cornell.edu/node/271186 [secondary]. From memory: Ladha (1992), Miller-Resnick-Zeckhauser (2005), Prelec (2004), Seeley & Buhrman, Passino & Seeley, Pratt & Franks.

Internal: `experiments/reports/2026-10-06-theories-for-the-swarm.md` (C1, C2, B5, D4), `2026-10-04-lit-selection.md`, `2026-10-04-lit-adjacent-fields.md`, `2026-10-06-group-science-game-theory-v2.md` section 3. This note extends C1 ("choose from executed evidence, never votes") with a concrete rule (S1) and a stop-signal quorum (S4); it contradicts C1's "private attempts then one exchange" only in that the exchange should show executed divergences, not approaches (herding).

## Open doubts

- Knight & Leveson numbers come from a summary, not the paper.
- Ron et al.'s task had a hard geometric sub-problem and a clean oracle; murmur's split between shared shortcut and shared ambiguity may differ.
- No replay was run; whether existing outputs hold enough runnable agent tests per repository is unchecked.
- S3, S4 and S7 add posts and tool fields of unknown token cost at a fixed cap.
