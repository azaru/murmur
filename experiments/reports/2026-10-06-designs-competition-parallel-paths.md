Model-written design study (subagent), 2026-10-06.

Family: competition and parallel paths. Nothing here is measured. Evidence tags: `[full text, p.]`, `[abstract]`, `[secondary]`, `[memory]`. Names such as ST (12 agents, one swarm, staggered entry), C1T (one agent with clock and tokens line), A1/B4/C1/D4 (from `2026-10-06-theories-for-the-swarm.md`) are glossed where used.

## 1. Headline

**One structural insight from the contest literature, and it points away from the user's D5 wording.** Contest theory is about incentives: effort responds to the chance of winning. Murmur's agents have no stake and no private cost, and prompt text does not move them (round 20, lesson b). So the incentive channel is weak or absent. What survives is the **information channel**: what a rival's visible state does to what an agent believes is still undone. The two things that keep humans working in contests (a closer race; an outstanding bug report) both have oracle-free analogues in murmur. A race has no analogue without a score, so the one that works is the **pending obligation**: a concrete, externally raised, runnable item that someone must answer.

Ranking by expected value per build cost (my priors, not measured):

1. **Card 3, cross-team issue tracker (bug bounty with the hack rule).** It gives the only oracle-free reason to continue that is not prompt text: an open, runnable, valid complaint against your folder. It also solves the "nobody free to act" problem, because the complaint is addressed to a folder, not a person.
2. **Card 4, "Done → attack seat" (single swarm, no teams).** Cheapest test of the same mechanism. It converts the dominant behaviour (early `done`) into critique work. Needs no folders, only a read-only seat that writes tests.
3. **Card 2, cross-test selector.** Needed by any parallel-paths design, because it is how ONE output is delivered without an oracle. Its Goodhart risk is real and handled with a validity filter.
4. **Card 1, windowed islands (D5, refined).** Keep the structure; change what is shown (see section 3).
5. Cards 5–8 are conditional: fork on disagreement (5), join-only narrowing (6), sealed rivalry (7), joint test commons (8).

**Task fit.** Parallel paths cost a factor k in effort per path. They pay when per-attempt variance is large and selection is accurate (Nelson, Baldwin & Clark; Boudreau et al.: more contestants help on uncertain problems and hurt on routine ones). Single-deliverable tasks (planning, shop2: bimodal, high variance) fit teams. DeepSWE batches (five independent repository tasks, capacity-bound, caps hit after 12–20 minutes) fit **no teams**, or only the cross-team tracker over partitions of the same swarm (cards 3, 4). Do not triple every repository.

**Relation to the earlier report.** C1 (private attempts, one exchange) has one merge point. Mine differ by having persistent, parallel folders plus a standing mechanical selector. A1 (on-call reserve) supplies wakeups from state events; card 3 supplies the event A1 lacked: an external, runnable complaint. A2 (public production signal) is mildly contradicted for rivals: Gross shows revealing performance gaps between rivals discourages even the top performers (section 5), so a public signal must be about **activity**, never about standing.

## 2. Design cards

Every test below also runs C1T (one agent with clock and tokens line) at the same total tokens, as AGENTS.md requires; each card names only the murmur arms being compared.

### Card 1. Windowed islands (D5, refined)
- **Theory:** island models and semi-isolated subgroups (Lazer & Friedman; Fang, Lee & Schilling `[memory]`); intermittent beats constant influence (Bernstein, Shore & Lazer 2018 `[abstract]` plus PMC design summary: 17 rounds, solutions of neighbours visible on rounds 4, 7, 10, 13, 16 only; optimum found in 48.3% of intermittent triads vs 33.3% constant and 44.1% none `[secondary, via full-text summary]`); feedback improves quality but depresses participation (Gross 2017 `[full text, pp. 4, 15–16]`).
- **Structure:** 3 teams of 4 (or 4 of 3), each with its own folder and board. Other folders are read-only (write guard). At 25/50/75% of the clock each agent gets, once, a read-only copy path of each rival folder and a git-style diff since the last snapshot. A team sees **its own tests' results only**. Rival test results are not run against it. Final delivery by card 2.
- **Mechanism:** snapshots restore diversity between exchanges (the Bernstein result), while the diff gives a reason to look again at the same repository ("rival changed X").
- **Prediction:** best-team score exceeds ST's score on quality-bound tasks; between-team spread of approach at 25% is wider than within ST; first `done` is not earlier than ST's.
- **Cheapest test:** 3×4 snapshot islands vs ST vs C1T, k≥3, one planning and one shop2 task. Factor 2: snapshots (none / code only) rather than "competition text" (prompt text is a dead lever).
- **Task type:** single deliverable. **Rule tension:** none if no rival test results are shown. **Cost:** medium: three folders and board partitions, a snapshot event, a guard (`branches.ts` and the write guard already exist).

### Card 2. Cross-test selector with a validity filter
- **Theory:** parallel R&D with selection (Nelson 1961 `[memory]`; Machlup 1962 on duplication and diminishing returns of added researchers `[full text, pp. 158–159]`); real-options value of k experiments per module (Baldwin & Clark, expected best of k grows like σ·E[max of k normals]; for k=3 that is 0.85σ `[memory]`); selection quality as the binding constraint (Girotra, Terwiesch & Ulrich 2010 `[memory]`).
- **Structure:** after the clock ends, murmur runs every team's agent-written tests against every team's solution. A test counts only if (a) it passes on the solution of its own team, and (b) at least one other solution passes it, or none does and it is dropped as likely mis-specified. Deliver the solution with most counting tests passed; tie → the team with the later last write. Fully mechanical.
- **Mechanism:** gives best-of-k without an oracle. Condition (a) mirrors the Codeforces hack rule and bug-bounty practice: a complaint is valid only with a reproduction that works on the claimant's own build `[memory]`.
- **Goodhart risk:** a team can win by writing many tests its own code passes and rivals' code fails because of a different spec reading (wrong, not better). The filter limits only part of this. Mitigation: no agent sees pass counts; cap per-team tests counted; compare against a coin-flip selector and a "most commits" selector.
- **Prediction:** delivered score ≥ mean team score + 0.4σ of between-team spread; selector picks the team with the higher hidden grade in more than 60% of runs (a 50% selector is worthless: report this first).
- **Cheapest test:** offline first: reuse stored team-sized runs, no new campaign. Online: card 1's arm with selector on, vs the same runs under a random selector.
- **Task type:** single deliverable; per-repo on batches. **Rule tension:** results are never shown to agents, so no oracle for them; the user should judge whether a pass count over agent-written tests counts as a "predictor of the grade" if ever surfaced (I recommend: never surface it). **Cost:** medium: test discovery needs a convention (tests under `tests/` runnable by a stated command), which is a task-specific dependency; for planning tasks without tests this card does not apply.

### Card 3. Cross-team issue tracker (bug bounty with the hack rule)
- **Theory:** attacker-defender games and bug bounties; red team / blue team; hacks in programming contests `[memory]`; dialectical inquiry vs consensus (Schweiger, Sandberg & Ragan 1986 `[secondary: abstract via search result]`: dialectical and devil's-advocacy groups made higher-quality decisions than consensus groups, no difference between the two); Schwenk 1990 meta-analysis `[secondary]`.
- **Structure:** 3 teams as in card 1. Any agent may write a runnable test into a shared `attacks/<target-team>/` directory. murmur validates mechanically (runs it): valid if it passes on the attacker's folder and fails on the target's. Valid attacks appear to the target as open items at point of use: when an agent in the target folder next reads or edits there, the tool result says "2 open attacks (names: test_x, test_y; reproduce: `cmd`)". It never says who is ahead. When the target's test passes, the item closes. One shot per snapshot, event-triggered, not per call.
- **Mechanism:** the cheapest oracle-free reason not to stop: an external, reproducible, specific complaint. It also meets lesson (d): attacks go to a folder, so whoever is free picks them up. Costly for the attacker (must make a passing build), so low noise.
- **Prediction:** agent-minutes after the first `done` rise; mean time from valid attack to the first write in the target folder is under 5 minutes; the fraction of agents calling `done` with open attacks against their folder is below 20%.
- **Cheapest test:** 3×4 with tracker vs 3×4 snapshots only (card 1) vs ST.
- **Task type:** single deliverable with runnable code; batches if teams are partitions of one swarm by repo. **Rule tension:** an open attack is a correctness-like signal ("your code fails X"). It is agent-written, not task-provided, exists in real work (bug reports), but flag it: AGENTS.md says nothing printed may predict the grade. My reading: it reveals a specific failing case, not a score. User's call. **Cost:** medium-high: validation harness, attack dir, point-of-use annotation.

### Card 4. "Done → attack seat" (no teams, one swarm)
- **Theory:** devil's advocate / critic as a self-chosen role (Schweiger et al.; Schwenk `[secondary]`); self-selected roles are allowed; A1's "stand by" generalised: an agent who stops contributing code can do critique instead.
- **Structure:** when an agent calls `done`, the tool offers: "stop, or take the critic seat". Critic seat: read-only everywhere; writes only to `attacks/` and posts issues; its tests are validated by the hack rule of card 3 applied to the whole folder (passes on the critic's own minimal repro, fails on the folder; for tasks without runnable tests: an issue with a quoted line and a command). Each attack addressed to a folder or file, visible at point of use.
- **Mechanism:** early `done` ("my part is done") is the dominant behaviour. This converts it into new, specific work instead of fighting it. A critic has no stake in the code, which is the point of the devil's-advocate effect.
- **Prediction:** share of seats still active at 50% of the clock rises from ST's baseline; valid attacks per run >0 in at least 70% of runs; owners fix at least half of the valid attacks.
- **Cheapest test:** ST vs ST + seat; same cap. If it fails, card 3 is unlikely to matter, a cheap kill.
- **Task type:** both; the best fit for DeepSWE batches because it needs no folder split. **Rule tension:** a seat is chosen, not assigned; flagged only because "offer at `done`" is a tool change in the exit path. **Cost:** low-medium (read-only guard variant, `attacks/` dir, annotation).

### Card 5. Fork on disagreement (teams emerge, not preset)
- **Theory:** parallel paths are worth paying for when someone believes the incumbent path is wrong (Nelson; real options, Baldwin & Clark `[memory]`); the number of live paths should track uncertainty, not be preset (Boudreau, Lacetera & Lakhani 2011 `[abstract]`: more contestants reduce effort per contestant through rivalry but raise the chance of extreme solutions; rivalry dominates for less uncertain problems, extreme value for more uncertain).
- **Structure:** one swarm, one folder. Any agent may `fork(reason)`: murmur copies the folder and creates a new board. Others may `join(fork)`; max 3 live forks; no agent is moved. Teams are the agents who chose a fork. Selector: card 2. Forks idle for N minutes and with no members stop being writable.
- **Mechanism:** pays the redundancy cost only on disagreement. On routine tasks nobody forks and the design degenerates to ST; on uncertain tasks it becomes card 1 without an assigned k.
- **Prediction:** fork rate correlates with between-attempt score spread across tasks; forked runs beat ST on high-variance tasks and tie elsewhere.
- **Cheapest test:** ST vs ST + fork on a planning set and one DeepSWE batch (to check that it does not fire spuriously: forks per repo should be near 0).
- **Task type:** single deliverable; batches only to confirm it does not fire.
- **Rule tension:** none (git-style). Risk: agents may fork for free (lesson c, zero-cost volunteering → duplicates). Mitigate: forker must write a one-line statement of what differs. **Cost:** medium (`branches.ts` exists).

### Card 6. Join-only narrowing (set-based concurrent engineering)
- **Theory:** set-based concurrent engineering (Ward, Liker, Cristiano & Sobek 1995; Sobek, Ward & Liker 1999 `[memory]`): keep several alternatives alive, narrow progressively by pre-agreed criteria, do not choose early.
- **Structure:** 4 teams of 3 at the start. At 50% and 75%, the selector of card 2 makes the lowest-ranked folder read-only. Its agents' write guard then allows writing only to the surviving folders; they self-choose where. Nothing tells them which. A folder that is read-only cannot be revived.
- **Mechanism:** gives capacity back to the agents of an eliminated team (they have a reason to continue: somewhere to write) and concentrates effort as the field narrows (Toyota practice). Contests lose participants as the gap becomes known (Gross); this removes the choice to quit and replaces it with the choice of where to keep working.
- **Prediction:** agent-minutes after the 50% cut are at least ST's; final score ≥ card 1.
- **Cheapest test:** card 1 with and without the cuts.
- **Task type:** single deliverable.
- **Rule tension, two of them.** (1) Elimination tells a team it lost: a standing signal (Gross: discouragement). Show only "your folder is now read-only; writable: A, B", never ranks. (2) The cut rule uses agent-written tests, so it is the card 2 oracle issue made visible by its effect. Not recommended before cards 2 and 3 show the selector is better than random. **Cost:** medium-high.

### Card 7. Sealed rivalry (activity-only visibility)
- **Theory:** interim feedback in dynamic tournaments: whether to reveal depends on the cost curve (Aoyagi 2010: with convex marginal effort cost no feedback maximises second-stage effort, with concave cost full feedback does `[full text, Thm 4.2, Sec. 4.1]`; Ederer 2010: feedback can reduce incentives by revealing asymmetries, motivation vs evaluation `[secondary, via Gross pp. 1–2]`); Gross: private feedback (own ratings, rivals shrouded) beat full public feedback on the count and number of high-quality entries in simulation `[full text, p. 4]`; abandonment convex in win probability, lowest near 0.5 `[full text, p. 16]`.
- **Structure:** teams as card 1, but the only rival information is a **liveness line**: "team B: last write 2 min ago" / "team B: no writer for 6 min". No code, no counts, no tests. Delivered by event (a rival goes idle or restarts), not on every result.
- **Mechanism:** the race stays unresolved: nobody can tell who is ahead, which is Gross's condition for effort (near 0.5). A live rival is a reason not to stop; an idle rival invites a late finish (risk: cascade, GT-2).
- **Prediction:** first `done` later than card 1's; liveness-only ≥ card 1 on stop timing; code visibility adds quality but costs participation.
- **Cheapest test:** the same arms as card 1 with a third level of the factor (none / liveness / snapshots).
- **Task type:** single deliverable. **Rule tension:** none. **Cost:** low (the status line from round 20 already has most data). Caveat: this is the weakest card, because it depends on agents acting as if they care about winning. Round 20 gives no evidence that they do.

### Card 8. Joint test commons (adversarial collaboration)
- **Theory:** adversarial collaboration (Mellers, Hertwig & Kahneman 2001 `[memory]`): rivals agree up front on the test that would separate their views; reduces unresolved spec arguments and gives a shared referee that is not a person.
- **Structure:** during the first 15% of the clock all teams may write into a shared `spec-tests/` (the only shared-writable folder); tests there are run on every team's folder at each snapshot, results visible only to the owning team. After 15%, the commons freezes; later tests go to the tracker (card 3).
- **Mechanism:** teams discover spec ambiguity by finding where their tests disagree, a shared-blind-spot remedy that same-model agents lack within one team (same priors, same reading).
- **Prediction:** fewer final solutions that all fail the same unstated requirement; between-team disagreement on the commons before building is a signal that the tests are doing work.
- **Cheapest test:** card 1 + commons vs card 1.
- **Rule tension:** it is a oracle-adjacent signal (a shared test result); I would show pass/fail only for commons tests, not for scores. Also a coordination cost: one shared writable folder reintroduces overwrites. **Cost:** medium. Lowest priority, applies only when the task has runnable tests.

## 3. What the theory says about D5 specifically

**Keep**
- Several small teams with their own folder and board and read-only rivals (island models; semi-isolation).
- **Snapshots, not continuous view.** This fits Bernstein et al.: intermittent influence kept the best-of-group while keeping the average (optimum found in 48.3% of intermittent triads vs 33.3% constant, `[secondary]`; the paper also reports that storing and reloading best solutions behaves like constant influence `[abstract]`, which is exactly what a continuously readable rival folder is). It also satisfies round 20 lesson (a): delivery is event-triggered, not per tool result.
- **Final selection by a mechanical cross-test** (card 2): it is the only candidate I found that delivers one output without an oracle.

**Change**
1. **Do not run rivals' tests against your code during the run.** That is a relative-standing signal. Gross shows disclosure of a strong rival can drive even high performers out, abandonment is convex in the probability of winning, and private feedback beat public in simulation (`[full text, pp. 4, 15–16]`). For murmur, "you are missing cases" in the form of a *score* is what reveals standing; in the form of a specific reproducible failing test addressed to your folder (card 3) it is a bug report, and works as the obligation to continue. Show the second, never the first.
2. **Drop "encouraged to do better than the rest".** It is prompt text; round 20 shows it does not move behaviour, and contest incentives need stakes that murmur agents do not have. Replace the "competition text" factor with a **visibility factor** (none / liveness / snapshots / snapshots + tracker).
3. **Do not preset 3×4 for every task.** Boudreau et al. `[abstract]`: more contestants dampen effort on routine problems and help on uncertain ones. The number of teams should follow uncertainty (cards 5, 6), and for DeepSWE batches it should be 1 (or the same swarm with card 4).
4. **Test the selector offline first.** If the cross-test selector picks the higher-graded team in fewer than ~60% of cases, no parallel-paths design helps.

**Add**
- The hack rule (a complaint is valid only if it passes on the attacker's own build).
- A critic seat as the alternative to `done` (card 4), which needs no teams.
- The liveness-only level (card 7) as a control for D5's rival-code reading.

**Verdict:** D5's structure is sound, its "see rival test results" is the part theory flags as most likely to discourage, and its "compete" text is expected to do nothing. The version most worth running is card 1 with snapshots of code only, plus card 3 as the interim interaction.

## 4. Designs that look good but theory says fail

- **A visible leaderboard of agent-test pass counts.** Looks like a Kaggle leaderboard. Gross (`[full text, pp. 15–16]`): showing that rivals are far ahead drives effort down even for top performers; the leaderboard also leaks a predictor of the grade (AGENTS.md rule), and Goodhart pushes teams to write tests their code passes. Reject.
- **Winner-take-all, prize-structure or "bonus" text.** Lazear-Rosen/Tullock results require agents with costs and stakes. Murmur's agents have neither. Prompt text does not change behaviour (round 20). Reject as an experimental lever; use mechanical consequences (read-only, selection) instead.
- **More teams = better.** Machlup's duplication argument and Boudreau et al. (rivalry lowers effort per contestant) say returns diminish, and at fixed budget each path gets 1/k. On DeepSWE batches (capacity-bound, caps hit) 3 teams over 5 repos triples redundancy for no quality gain unless the selector is accurate.
- **Cross-team code copying as "recombination" at the end.** Merging files from the winner into the loser's folder and vice versa creates integration conflicts, and under the Bernstein result continuous copying produces constant influence (lower best-of-group). Prefer selection, not merging, except per module in a batch.
- **Preassigned devil's advocate or counter-plan team.** Dialectical inquiry originally needs a facilitator assigning counter-plans (hierarchy). Only the self-chosen seat (card 4) is allowed.
- **Rival activity shown on every tool result.** Round 20: a status line of ~800 characters per result cost real edits. Deliver by event.

## 5. Three load-bearing claims (for verification)

1. **Gross (2017), "Performance Feedback in Competitive Product Development", RAND J. Econ. 48(2).** [full text] Printed p. 4: "private feedback might achieve the best of both worlds... shrouding competitors' precise performance increases the total number and number of high-quality designs"; p. 15: feedback "can have the perverse consequence of driving highly-rated players away"; p. 16: "The tendency to abandon is definitively convex in a player's probability of winning, reaching a minimum near a win probability of 0.5". Load-bearing for: dropping rival test results from D5 (section 3, change 1) and for card 7. Caveat: human logo designers with real costs and a cash prize; transfer to LLM agents is an assumption.
2. **Aoyagi (2010), "Information feedback in a dynamic tournament", Games & Economic Behavior 70(2), Theorem 4.2 (Sec. 4.1).** [full text] If stage-2 marginal effort cost is convex, no feedback maximises total effort; if concave, full feedback does. Load-bearing for: there is no theory-free answer to "show rivals or not"; the sign depends on the cost curve, which for LLM agents is unknown, so the test must have a no-visibility and a full-visibility level, not just one. Caveat: two agents, symmetric, effort-cost framing.
3. **Bernstein, Shore & Lazer (2018), PNAS 115(35): 8734.** [abstract; design summary from PMC6126746 `[secondary]`] 17 rounds per trial, neighbours' solutions visible only on rounds 4, 7, 10, 13, 16; optimum found in 48.3% (intermittent) vs 33.3% (constant) vs 44.1% (none); intermittent mean as good as constant. Load-bearing for: snapshots over continuous visibility (cards 1, 3). Caveat: human triads on a travelling-salesman task. Numbers were taken from a summarised page fetch, not read in the PDF; verify in the paper's results section.

Not read in full text, held as `[memory]`/`[abstract]`: Nelson 1961 (parallel R&D), Sobek/Ward/Liker, Baldwin & Clark, Ederer 2010, Brown 2011 ("Quitters never win": the superstar discouragement effect, J. Political Economy), Mellers/Hertwig/Kahneman, Schwenk 1990, Girotra et al. Goel/Yan/Zeidel (arXiv 2510.23178, full text) reports no treatment effect of feedback policy on total bids in a two-stage all-pay lab experiment, with a discouragement effect from large head starts that "kicks in when it is not too small, and is not as large as predicted" `[full text, abstract and introduction]`: a warning that humans in the lab show a weaker version of the discouragement result than the theory says.

## 6. Sources

- Gross (2017), RAND J. Econ. 48(2) 438–466, Harvard DASH full text: https://dash.harvard.edu/server/api/core/bitstreams/7312037e-2a2f-6bd4-e053-0100007fdf3b/content
- Aoyagi (2010), Games Econ. Behav. 70(2) 242–260, Osaka repository: https://ir.library.osaka-u.ac.jp/repo/ouka/all/3424/Aoyagi_2010-ip.pdf
- Goel, Yan & Zeidel (2025), Feedback in Dynamic Contests: https://arxiv.org/pdf/2510.23178
- Bernstein, Shore & Lazer (2018), PNAS 115(35): https://www.pnas.org/content/pnas/115/35/8734.full.pdf ; PMC: https://pmc.ncbi.nlm.nih.gov/articles/PMC6126746/
- Machlup (1962), "The Supply of Inventors and Inventions", NBER: https://www.nber.org/system/files/chapters/c2116/c2116.pdf
- Boudreau, Lacetera & Lakhani (2011), Management Science 57(5) 843–863: https://pubsonline.informs.org/doi/10.1287/mnsc.1110.1322
- Schwenk (1990), OBHDP 47(1) 161–176: https://ideas.repec.org/a/eee/jobhdp/v47y1990i1p161-176.html
- Ederer (2010), J. Econ. Manag. Strategy 19: 733–769 (not accessed; cited by Gross).
- Not accessed: Nelson 1961 (Rev. Econ. Stat. 43(4)); Brown 2011 (J. Polit. Econ. 119(5)); Ward et al. 1995 (Sloan Mgmt Rev.); Sobek, Ward & Liker 1999 (HBR); Baldwin & Clark (2000), Design Rules; Mellers, Hertwig & Kahneman (2001), Psychological Science 12(4); Schweiger, Sandberg & Ragan (1986), Acad. Manag. J. 29(1); Girotra, Terwiesch & Ulrich (2010), Management Science 56(4); Lazer & Friedman (2007), ASQ 52(4).
