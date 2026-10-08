Model-written literature review (subagent), 2026-10-06, deep pass. Tags: [full text, pp.] / [abstract] / [secondary] / [memory].

Scope: game theory part 1 (team theory, information structure, common knowledge, cheap talk with aligned interests, focal points, organisational economics). I read no run data. Page numbers are the printed pages of the journal or book unless noted. Marschak-Radner (1972) was read from a scanned copy through OCR (Cowles Monograph 22, Yale); OCR errors are possible in formulas, not in the quoted prose.

## 1 Headline

1. **Murmur is the case team theory was built for**: common interests and beliefs, different information, costly communication (Marschak-Radner, p.123-124). What there is to design is the *information structure*, not incentives. Almost every murmur failure is a missing or stale item in somebody's information, not a conflict of interest.
2. **Common knowledge is cheap in murmur.** For processors sharing a common memory, what is in the memory is common knowledge (Halpern-Moses, arXiv cs/0006009 §2, p.5-6). Board, folder and status line are close to shared memory. What was not in it is facts about agents (alive, gone, why). H&M call getting a fact into common knowledge "fact publication" (§3, p.7). Round 20's departure notice and status line are fact publication: theory predicts they work, and that they publish presence, not meaning (failure 2, `done` as "my slice").
3. **"Validated" posts are an error/staleness problem, not deception.** Cheap talk is credible when interests align (Farrell-Rabin p.105-106; Alonso-Dessein-Matouschek (ADM) Prop. 3(i), p.159). But those papers do not model sincere error. The support for "staleness" is by elimination plus Marschak-Radner on delay and noise (p.205, 233-234, 260-261). I found no theorem on stale claims as such.
4. **Agreement among identical-prior agents is weak evidence** (Aumann p.1236-1237: same prior, different information). Twelve copies reading one board have nearly one partition, so "all 12 validated" adds little over one (failure 7). Adding identical validators cannot help; making evidence differ might (staggered entry does a little).
5. **Tools over coordinators.** Marschak-Radner list "standing rules" for inconsistent messages (ch.9 §11, p.321-322) and say that instead of a coordinator the acting members can exchange information "from time to time (standing conference), as the need arises" (p.313). That backs the write guard and claim release.
6. **Not supported:** acknowledgement protocols (no finite number gives common knowledge, H&M p.8-9), credibility discounting (no deception incentive), "who is in charge" conventions (Farrell-Rabin p.116; that is a coordinator).

About two thirds of the load-bearing claims are at full text; gaps are named in §4 and §8.

## 2 Results one by one

### R1 Team decision problems: Marschak-Radner 1972, Radner 1962

**Statement.** A team has common utility and beliefs; member i acts on information y_i = η_i(x). The team problem is to choose the n decision rules and the n information structures to maximise expected payoff net of organisational cost (observation, communication, decision) [full text, M&R p.124-130]. Four facts matter:
- *Fully shared information turns the team into one person* (eq. 5.1, p.128). Adding to a member's knowledge never lowers gross payoff, and with free communication everybody would share everything (p.129). With costs, "it will not, in general, be worthwhile to have every member informed about the same events and in the same detail" (p.129).
- *Optimal information structure depends on costs.* In the airline-style Example 4A, "centralized incomplete information about one price" beats complete information for every positive cost; the best structure flips between routine (pre-agreed rule), decentralised, and partial sharing as costs vary (Tables 4.9-4.10, Fig. 4.1, p.137-138).
- *Person-by-person satisfactory is not optimal in general.* A rule that no member can improve alone can be worse than the best rule ("East always accepts, West never": payoff 10 vs 12.5; p.139). Radner's 1962 theorem, reproduced as Theorem 1 (p.157): if payoff is concave and differentiable in real-valued actions, every stationary (p.b.p.) rule is optimal.
- *Delay and noise.* Information about the distant past is less valuable than about the recent past (p.233); delay of d periods is modelled as information about states up to t-d (p.234); memory is costly, "when to throw away files" is itself a choice (p.233). With periodic recovery of complete information, the optimal recovery frequency is proportional to the square root of the value gap between complete and incomplete information and inversely proportional to the square root of the cost (ch.7 §5, p.260). When improving information increases delay, there is an optimal "group size" with complete communication inside groups only; as n grows, the optimal group size grows but the ratio group/team goes to zero (§6, p.260-261). Erroneous observations: value falls to zero as error variance grows (ch.6 §10, p.205-206).

**Management by exception** (ch.6 §11-13, p.206-226). Members act locally on ordinary observations and send exceptional ones to a *central agency* ("reports of exceptions") or call an *emergency conference* of everyone. At equal average group size the value ranks: reports of exceptions > emergency conference > one large group > equal groups (p.223-226). The first needs a central agency; the second does not.

**Size** (ch.6 §14, p.229-230). Value per member of complete information rises with n if pairwise interaction is constant, and falls if total interaction is constant (Selten). "More agents help" depends on how coupling scales.

**Assumptions.** Common interests and beliefs (p.123); quadratic or concave payoffs for the closed forms; costs in comparable units (p.130, 306).

**Murmur fit.** Same goal and score: holds. Costs: tokens and attention. Concavity: breaks (code tasks are discrete and strongly interacting), so the p.b.p. warning applies: a state where each agent is individually content ("I wait for the owner", "that repo is covered") can be a bad equilibrium for the team. Delay: delivery is fast (a post reaches five agents within 0.5 min, diagnosis), but staleness of *claims* is the object of p.233-234. Within a run, each agent's context is its memory and the board plus folder is the external memory.

**Evidence tags.** [full text, M&R p.123-130, 137-139, 157, 205-206, 223-230, 233-234, 260-261, 311-313, 321-322]. Radner 1962 itself not read: [secondary: M&R Theorem 1 reproduces it, p.157; Evstigneev et al. 2025 cite it as Annals Math. Stat. 33(3), 857-881].

### R2 Knowledge and common knowledge in a distributed system: Halpern-Moses 1990

**Statement.**
- Group knowledge hierarchy: C ⊃ E^k ⊃ E ⊃ S ⊃ D ⊃ φ. With a shared memory the levels coincide (§2, p.5-6).
- Common knowledge comes from membership in a community or from copresence at the event (Clark-Marshall, cited p.7). Private whispering to each child "would have been of no help at all" (p.7).
- Coordinated attack: no finite exchange of acknowledged messages makes an attack guaranteed simultaneous (p.8-9). Theorem 5 (p.20-21): with communication not guaranteed, what is common knowledge at a point is the same as without any message received. Corollary 6: a correct protocol means neither general ever attacks. Theorem 7 (p.22): the same with unbounded delivery times even if delivery is guaranteed. Footnote 4: with a global clock, "at 5 o'clock it becomes common knowledge that it is 5 o'clock".
- Theorem 8 (p.24-25): with temporal imprecision (always true in practice), common knowledge of a new fact is unattainable, yet coordination happens, so weaker notions matter. ε-common knowledge (actions within ε), eventual common knowledge, and *timestamped* common knowledge (everyone knows φ at time T on their own clock; §12, p.32-33). Theorem 11 (p.32): asynchronous channels cannot give ε-common knowledge. Theorem 12: timestamped CK implies CK if clocks are identical, ε-CK if clocks are within ε, eventual CK if every clock reads T at some time.

**Assumptions.** Message passing between processors with local states; common-knowledge definitions over runs; exactly simultaneous action is what needs C.

**Murmur fit.**
- Board and folder act as shared memory, so what is written there is common to anyone who reads it. The gap is *what is written*: an agent's departure is a fact about a processor that was not in the memory. Failure 1 is absent fact publication, not a protocol impossibility.
- `done` is unilateral, so coordinated-attack impossibility does not bite. At the finish (failure 7) the problem is the opposite: coordinating a stop is too easy.
- "Left at minute M" is a timestamped fact (§12). The clock lever worked for the same reason: the clock is the one thing that becomes common knowledge for free (fn.4).
- The attack structure remains for *acting on another's pending action* ("I take A if you take B"): delivery is observed, uptake is not (diagnosis, e19-tail). That is the e-mail game (R4).

**Evidence tags.** [full text, arXiv cs/0006009 pp.5-9, 20-22, 24-25, 27-28, 32-33; JACM pagination differs]. Clark-Marshall [secondary: H&M p.7].

### R3 Agreeing to disagree: Aumann 1976 (and dialogues)

**Statement.** If two agents have the same prior and their posteriors for an event are common knowledge, the posteriors are equal (p.1236). Common knowledge at ω means the event contains the cell of the meet of the two information partitions containing ω (p.1237). "The result is not true if we merely assume that the persons know each other's posteriors" (p.1236, counterexample p.1237). The partitions are themselves assumed common knowledge, which Aumann argues costs nothing because the state includes how information is imparted (p.1237). Aumann treats the common prior as the Harsanyi doctrine and notes that systematic biases may break it (p.1237-1238) and suggests the theorem underlies reconciling beliefs by exchanging posteriors (p.1238). Geanakoplos-Polemarchakis: back-and-forth exchange of posteriors converges to a common posterior [abstract / secondary]. I could not obtain the paper.

**Assumptions.** Common prior; Bayesian updating; partitions common knowledge; posteriors (not evidence) exchanged.

**Murmur fit.** Common prior: roughly true (same model and prompt). Bayesian updating: not true for LLMs. Partitions common knowledge: only if the prompt describes the mechanisms.
- Failure 7: with identical priors and nearly identical information, verdicts converge whether or not they are right; each extra "validated" post adds little. The theorem is about agreement, not truth.
- Failure 6 (echo): a post any reader can already infer is worth zero; value requires a strictly finer partition (M&R p.129).
- Aumann's remark that the partitions are common knowledge implies that *declaring* a mechanism ("every tool result lists all teammates") is what makes it common knowledge. That is a legitimate descriptive use of prompt text, unlike norms.

**Evidence tags.** [full text, Aumann p.1236-1238]. G-P 1982 [abstract / secondary].

### R4 The electronic mail game: Rubinstein 1989

**Statement.** Two players play one of two coordination games; only player 1 learns which. Confirmations bounce automatically, each lost with probability ε. The only equilibrium in which player 1 plays A in the base game has both play A at every message count, however many were exchanged (Corollary 2 in Takamiya-Tanaka). Rubinstein found this paradoxical.

**Murmur fit.** Delivery is nearly lossless; *uptake* is the lossy link (did the recipient read, understand and still hold the plan?). Agents react as the theory says: hedge by doing the safe thing themselves (duplication, rediscovery, failure 8). The structure is real only for risky joint plans ("you take X, I take Y").

**Evidence tags.** [secondary: Takamiya-Tanaka 2006, DP650 Osaka ISER, p.1-5; AER 79(3), 385-391 not obtained]. I downloaded a file with the wrong paper and discarded it; no claim here rests on it.

### R5 Public signals and communication networks: Chwe

**Statement.** In a coordination game where each person revolts only if others do, with a communication network by which people learn neighbours' willingness, a network is *sufficient* if revolt is an equilibrium for every prior (p.3). More communication never hurts (Lemma 3, p.3); the complete network is sufficient because common knowledge arises when everyone talks to everyone (p.3). Minimal sufficient networks are hierarchies of cliques (Proposition, p.4). Chwe's abstract: "A communication network helps coordination in exactly two ways: by informing each stage about earlier stages, and by creating common knowledge within each stage" (p.1). The book *Rational Ritual* makes the same argument for public rituals and media events [secondary: publisher summary].

**Assumptions.** Supermodular payoffs, threshold-style willingness, network known, local knowledge of neighbours.

**Murmur fit.** The board is the complete network. So by Chwe, sufficiency is not the problem; what fails is *content* (the fact is not posted) and *conditioning* (agents do not use what they read). Chwe's "hierarchy" is of who must know what, not of authority: his stages arise in minimal networks without any commander. Useful for one design point: information that all must have should be delivered to all at once and visibly (the status line), not routed.

**Evidence tags.** [full text, Chwe 2000 Rev. Econ. Stud. 67, 1-16, p.1-4]. Rational Ritual [secondary].

### R6 Cheap talk with aligned interests: Crawford-Sobel 1982, Farrell-Rabin 1996, ADM 2008

**Statement.**
- Crawford-Sobel: with sender bias b, equilibria are partitions; the number of intervals falls as b rises, so information depends on alignment; at b=0 communication is fully informative [secondary: Farrell-Rabin p.106-107; Dean G5212 notes; ADM08 fn.26 and Prop. 1, p.157-158 restate the difference equation]. Original not obtained.
- Farrell-Rabin: a *self-signaling* message (the sender wants it believed iff true) is credible; Example 1 (p.105-106): Sally "has no incentive to lie because that would induce Rayco to make a mistake, and ... a mistake for Rayco is bad for Sally". Babbling always exists (p.108) but is "absurd" with a shared rich language (p.108-110). For intentions a message must also be *self-committing*: if believed, the speaker wants to do it (p.111-112). Pure coordination: talk beats focal points (p.112). Conflict: "If Pat says 'I'm going to the opera' while Chris says 'I'm going to the fight' ... unless it's common knowledge who's in charge ... only a 'sidewalk shuffle'" (p.115-116); in pure coordination this disappears with long enough talk. Two-way talk was less effective than one-way in experiments (fn.17).
- ADM 2008: with aligned managers (λ=1/2) communication is perfectly revealing, S_C = S_D = 0 (Prop. 3(i), p.159); with d=0 under decentralisation "communication is irrelevant" (p.158). Need for coordination improves horizontal and worsens vertical communication (abstract); decentralisation can dominate even when coordination is very important. They cite Chandler (centralise) and Sloan's General Motors, whose committees "merely provided a place to bring these men together" (p.145-146).

**Assumptions.** One-shot sender-receiver, or two-manager games; players know the language; bias b or λ is common knowledge; mistakes are costly for both.

**Murmur fit.** b = 0 by construction (same score, no private payoff). So every post is self-signaling in Farrell-Rabin's sense. A false "validated" or "I own expr" then arises by (a) sincere mis-assessment, (b) staleness, (c) vague scope. None of these is in the cheap-talk models, which assume that the sender *knows* the type. So the literature supports "no discount, no verification of motives" and is silent on error. "I'll take X" is self-committing only while the speaker is present: when the speaker leaves, the commitment dissolves but the message remains. That is the formal shape of failures 1, 3, 4. Sidewalk shuffle (simultaneous conflicting claims) matches the 16 of 45 repo-runs with 2+ claimants (diagnosis, failure 3) and the claim-time ambiguity.

**Evidence tags.** [full text, Farrell-Rabin p.103-118; ADM08 p.145-146, 157-159]. Crawford-Sobel [secondary]. Rabin 1994 [secondary: Farrell-Rabin p.116].

### R7 Focal points, team reasoning

**Statement.** Schelling's focal points let players coordinate without talk through "rules of selection" that stand out. Mehta-Starmer-Sugden (1994) showed that coordinators' responses are more concentrated than pickers' (no incentive) and guessers'. Bardsley et al. 2010 test cognitive hierarchy (level-0 inclinations, "primary salience") against team reasoning ("what should we do?", Sugden, Bacharach). One experiment supports team reasoning, the other cognitive hierarchy: "players' reasoning is sensitive to the decision context" (abstract; p.33). Team reasoning is prompted by aligned interests (p.11) and by group identification [secondary: Smerilli 2010].

**Murmur fit.** Identical agents are the extreme of shared primary salience, so convergence on the same salient item is the prediction. That helps when all should do the same (file naming) and hurts when they should differ: the pile-on of failure 5 (wasmi: four editors, 151 edits, others none). Focal-point theory covers coordination, not anti-coordination; I found no result for how identical players split without asymmetric information (symmetric deterministic procedures cannot elect a leader in anonymous networks, Angluin 1980 [memory]). Murmur's asymmetries (entry time, names) are information. A "we" frame is prompt text, which has been inert.

**Evidence tags.** [full text, Bardsley et al. CeDEx DP 2008-17, p.1-2, 10-13, 24-25, 33]. Mehta et al. 1994, Bacharach 2006 [secondary].

### R8 Organisational economics of communication

**Dessein-Santos 2006** [full text, JPE 114(5), 956-985]. Tasks need adaptation (local information) and coordination. Organisations either adapt (flexible employees, coordination ex post by costly, imperfect communication of quality p) or fix a pre-agreed plan (ex ante coordination, no communication, ignores local information) (p.956-958; Prop. 1, p.965-966). Specialisation falls with the importance of adaptation and the variance of local information (Prop. 3, p.968). Better communication raises bundling when coordination matters (Prop. 5). The problem is convex: organisations are "either very rigid and specialized ... or ... substantial employee flexibility and extensive ex post coordination" (p.972-973).

**Garicano 2000** [full text, JPE 108(5), 874-904]. Workers learn common problems and refer the rest up; hierarchy arises when matching problems to solvers is costly. "Communication costs are incurred even when the worker asked does not know the answer" (helping cost h, p.878). Needs non-overlapping knowledge.

**Bolton-Dewatripont 1994** [abstract only]: efficient networks centralise processing and delegate when overloaded.

**Murmur fit.** No organiser sets bundling; the self-picked role menu is agents choosing it. A fixed slicing is the ex ante rule, which D&S favour only when adaptation matters little; coding tasks are the opposite. Communication quality p is what status line and notices raise. Garicano's useful content for murmur is h: asking a busy owner costs the owner, and a departed owner's reply never comes (owner-gating, failure 4). B-D's centre smuggles a coordinator.

## 3 Assumption-break table

ID = identical model and prompt; pay = one shared payoff; cost = no private effort cost; LLM = LLMs without real utilities.

| Result | Needs | Murmur fact | Verdict |
|---|---|---|---|
| M&R team model | common interests and beliefs; comparable costs | pay holds; cost is tokens; LLM beliefs not coherent probabilities | holds loosely |
| Radner 1962 / M&R Thm 1 | concave payoff in real actions | discrete code changes, strong interaction | **breaks**: p.b.p. equilibria can be bad |
| M&R value of information | strictly finer partition adds value | ID: partitions nearly equal, duplicate posts add ~0 | holds; explains echo |
| M&R delay/noise | information ages; error variance | claims age silently; agents sincerely wrong | holds; no theorem on stale claims |
| H&M shared memory | knowledge from memory contents | board/folder/status line are memory; liveness was not in it before round 20 | holds for contents, **breaks for liveness** |
| H&M coordinated attack | simultaneous action, lossy channel | `done` unilateral; delivery reliable | **does not bite**; uptake unobserved |
| Aumann | common prior, Bayes, partitions common knowledge | ID: prior ~common; LLM not Bayes; partitions known only if the prompt describes them | partly; **explains failure 7** |
| Rubinstein e-mail | lossy acks, risky joint action | delivery ~lossless; uptake unseen; agents hedge by duplicating | partly |
| Chwe | supermodular game, known network | board = complete network, N=12 | holds; failure is content, not topology |
| Crawford-Sobel, ADM | bias b>0 makes talk noisy | b=0 | **noise from conflict absent**; error not modelled |
| Farrell-Rabin | shared language; self-signaling; unbounded talk | ID: language trivial; N=12, short horizon; speaker leaves | self-committing **breaks** at departure; talk too short: sidewalk shuffle persists |
| Focal points | one-shot, no talk | ID: identical level-0; talk available | pile-on predicted; anti-coordination not covered |
| D&S, Garicano, B-D | organiser sets bundling; non-overlapping knowledge; delegation | none; ID: knowledge overlaps; no delegation tool | mostly breaks (Garicano's h survives) |

## 4 Where the field disagrees or results are fragile

- **Common knowledge vs behaviour.** Rubinstein found it "hard to imagine" that a player will not play B at 17 messages (secondary, Takamiya-Tanaka p.2); they attribute the paradox to the idealisation of common knowledge of rationality (p.2-3). H&M conclude exact common knowledge is unattainable and systems use weaker versions (Theorem 8, §9). Murmur should use those: timestamped, eventual.
- **Aumann's premises.** Aumann calls the evidence of people who disagree "not conclusive" because of biases (p.1238). For LLMs the common prior is closer than for people, Bayes further.
- **Cheap talk.** Babbling always exists; credibility is argued by introspection (Farrell-Rabin p.108-110). They and Aumann disagree on self-committing but not self-signaling messages (p.113-114). One-way talk beat two-way talk in experiments (Cooper et al., fn.17), so more talkers are not simply better. I did not read those experiments.
- **Focal points.** Near-identical designs gave opposite verdicts (Bardsley et al., p.33); for identical players the sign is not established.
- **Public information.** Morris-Shin is quoted as "more public information can be bad"; Svensson shows it is good except in special cases and that the coordination term is zero-sum, so it does not transfer to a team [secondary, p.1-2]. Original not read.
- **Team size.** Value per member of complete information rises or falls with n depending on whether interaction per pair or in total is constant (M&R p.229-230); no data say which holds for 12 agents.
- **Centralise or not.** Chandler vs Sloan (ADM p.145-146); ADM show decentralisation can win even when coordination matters (Prop. 5); D&S show the optimum can jump (p.973). Parameter-fragile.

## 5 Implications and levers for murmur

Rules applied: oracle-free (nothing about correctness, scores or test results); non-hierarchical; would exist in real work; each labelled information / tool mechanics / prompt text.

**L1. Publish liveness as a timestamped fact (information).** Departure notice plus status line, with the leaver's own last sentence and the folders it last wrote. Theory: H&M fact publication (§3, p.7), timestamped knowledge (§12, p.32-33), Chwe's "informing each stage". Prediction: fewer posts addressed to departed agents; shorter time from departure to first edit by someone else in the leaver's folder. Measure: from `events.jsonl`, per departure, count of posts naming the leaver after its stop minute; minutes to first non-leaver edit in the folder; fraction of "waiting for X" posts where X has left. Cost: small (a line per tool result).

**L2. Annotate delivered claims with the author's current state (information).** When a board post that contains a claim ("I own", "I will take") is delivered, append "author left at minute M" or "author last wrote this folder N min ago". Theory: M&R p.233-234 (information about old states is less valuable; delay), Farrell-Rabin p.111-112 (a claim is self-committing only while the speaker stays). Prediction: fewer actions that rely on claims by departed agents (failures 3, 4). Measure: after a claimant's departure, count edits or waits that cite the claim; time until someone takes the folder. Cost: low. Is this a coordinator? No, it states a fact the system already has.

**L3. Standing rules in the tools for claim conflicts (tool mechanics).** Claim release on departure exists. Add a deterministic rule for simultaneous claims shown to both ("earliest timestamp wins; ties by arrival order") so that the sidewalk shuffle of Farrell-Rabin p.115-116 is settled by a rule, not by negotiation. Theory: M&R §11 p.321-322 (standing rule; "some such devices ... must in fact be used in any team"). Prediction: fewer claim-negotiation posts; fewer repos with 2+ claimants for more than a minute. Measure: claimant counts per folder over time; posts that contain two claims to the same folder. Flag: a rule is not a leader, but "who is in charge" conventions are (Farrell-Rabin p.116); keep the rule symmetric and time-based.

**L4. Show exceptions, not everything (information; event-driven).** Show in the status line only what changed since the agent last saw it, plus folders with *no live writer*. Theory: M&R ch.6 §13 p.223-226 (exception-driven structures dominate fixed groups at equal average group size), ch.7 §5 p.260 (refresh interval ~ sqrt(value gap / cost)), p.261 (group size vs delay; optimal group size / team size goes to zero). Use the emergency-conference style (broadcast to all), not a central agency. Prediction: same departure-recognition effect as L1 at lower token cost; less habituation to a constant line. Measure: tokens per status line; reaction time to a change vs a constant line. Oracle-free: "no live writer" is about presence, not quality.

**L5. At `done`, show who is still working and which folders have no live writer (information at the decision point).** Not a test of correctness; a count. Theory: value of information is highest at the action it changes (M&R p.129, "information structure"); H&M: `done` is unilateral so it needs only knowledge, not common knowledge. Prediction: fewer early exits with orphaned folders (failure 2), more `done` reasons that name the unfinished scope. Measure: at each `done`, orphaned-folder count versus time remaining; agents re-entering after viewing; `done` reasons admitting partial scope. Risk: it can read as a nudge to stay, and prompt-level nudges have not worked; it is information, so it should not be worded as an instruction.

**L6. Duplicate-result collapse (tool mechanics).** If an agent posts a result already posted (same command and same output hash within a window), deliver "N agents already reported this" instead of a new post. Theory: M&R p.129 and Aumann p.1236-1237 (a message that adds nothing to the partition has no value; agreement among same-prior agents is not new evidence). Prediction: fewer echo posts (failure 6) and fewer tokens; it does *not* cure failure 7, because identical agents share the blind spot. Measure: share of posts matching echo wording; tokens per agent per post.

**L7. Declare the mechanisms in the prompt, descriptively (prompt text).** State what each tool result shows and when notices are posted. Theory: Aumann p.1237 (partitions must be common knowledge), H&M §3 (community membership gives common knowledge). The one prompt-text use I would keep; it matters only because L1-L5 exist.

**L8. Finish diversity without roles (information; weakest).** More identical validators add little; what differs across agents is entry time and what each saw. Do not use "N agents agree" as stopping evidence. Possible: late entrants see a digest of what earlier agents did *not* check (files never opened, commands never run), not what they concluded. Oracle-free, no hierarchy. My extrapolation from Aumann and M&R, not a tested result.

**Predictions for round 20's levers (made without reading its runs).**
- Departure notice = fact publication: fewer posts to departed agents; limited effect on takeover unless claim state is also visible (the claim still reads "mine"; L2).
- Status line = shared memory plus timestamp (H&M §12): helps recognition of departures more than allocation (failure 5), since it shows who touches a folder, not which folder is weak; may be ignored once constant (L4).
- Task list released on `done` = standing rule (M&R p.321-322): fewer orphaned tasks when the list is the unit of work; nothing for partial `done` unless scope is shown (L5).

## 6 What not to build

- **Orchestrator, planner, assigned slices, rank-based assignment ("take folder k by arrival rank"):** coordinator or assigned role (M&R central agency; Garicano Prop. 4; Bolton-Dewatripont centre).
- **Reports of exceptions to a central agency:** best-ranked in M&R p.223-226 but needs a centre; broadcast instead.
- **Ack/confirm protocols:** no finite number gives common knowledge (H&M p.8-9); the board already shows delivery.
- **Credibility scores or trust discounting:** with b = 0 there is no incentive to deceive (Farrell-Rabin p.105-106; ADM p.159).
- **Vote or "N agree" finishing conditions:** agreement of same-prior agents is not evidence (Aumann).
- **A named "who is in charge" tie-break:** Farrell-Rabin p.116 offer it; it is hierarchy.
- **Any display of test results, scores or "validated" counts as a team signal:** oracle.
- **Prompt norms** ("ask before editing", "announce before leaving"): inert in the record; the theory predicts nothing otherwise.
- **Suppressing public information to avoid herding** on Morris-Shin: fragile, zero-sum welfare term (Svensson).

## 7 Three load-bearing claims to verify

1. **Shared memory makes group knowledge collapse; the gap is publication of facts about agents.** Halpern-Moses, arXiv cs/0006009, §2 on p.5-6 ("... share a common memory ... C φ ≡ E^k φ ≡ E φ ≡ S φ ≡ D φ") and the passage on fact publication and copresence at p.7; footnote 4 on p.21 for the global clock. If this fails, L1, L2, L4 lose their theoretical basis.
2. **With aligned interests, cheap talk is credible; the residual problem is not deception.** Farrell-Rabin, JEP 10(3), p.105-106 (Example 1; self-signaling) and ADM, AER 98(1), Proposition 3(i), p.159 (S_C = S_D = 0 at λ = 1/2) with p.158 (communication irrelevant at d=0 under decentralisation). The limit: neither paper models sincere error or staleness, so "the problem is staleness" rests on elimination plus M&R p.233-234.
3. **Standing rules, not coordinators, are the team-theory answer to inconsistent messages, and partial exchange can replace a coordinator.** Marschak-Radner, Economic Theory of Teams, ch.9 §11 p.321-322 ("standing rules, rulings, hierarchy ... some such devices must in fact be used") and §4 p.313 ("instead of having a coordinator, one might introduce partial exchange of communications ... standing conference ... ad hoc conferences"). If the main session reads these as endorsing hierarchy, the lever list changes: the same page lists "the hierarchical principle" as one of three devices, so my reading is that the standing rule is the one that needs no person.

Runner-up claims: M&R p.139 (p.b.p. satisfactory is not optimal); p.260 (refresh frequency ~ sqrt(value gap / cost)); Aumann p.1236-1237.

## 8 Sources with URLs and tags

Full text read:
- Aumann 1976, Ann. Stat. 4(6), 1236-1239. https://www.haverford.edu/sites/default/files/Aumann1976.pdf
- Farrell and Rabin 1996, JEP 10(3), 103-118. https://ics-websites.science.uu.nl/docs/vakken/mas/papers/cheapTalkFarrelRabin.pdf
- Halpern and Moses, arXiv cs/0006009 (JACM 37(3), 1990; pagination differs). https://arxiv.org/pdf/cs/0006009
- Marschak and Radner 1972, Cowles Monograph 22 (scanned, OCR). https://cowles.yale.edu/sites/default/files/2022-09/m22-all.pdf
- Chwe 2000, Rev. Econ. Stud. 67, 1-16 (scanned, OCR). http://www.chwe.net/michael/s.pdf
- Alonso, Dessein, Matouschek 2008, AER 98(1). https://drupalgsb-test.paas.cc.columbia.edu/sites/default/files-efs/pubfiles/3134/coordination.pdf
- Dessein and Santos 2006, JPE 114(5). https://drupalgsb-test.paas.cc.columbia.edu/sites/default/files-efs/pubfiles/595/adaptive.pdf
- Garicano 2000, JPE 108(5) (abstract, introduction, set-up; not proofs). http://www.edegan.com/pdfs/Garicano%20(2000)%20-%20Hierarchies%20and%20the%20Organization%20of%20Knowledge%20in%20Production.pdf
- Bardsley, Mehta, Starmer, Sugden, CeDEx DP 2008-17. https://www.nottingham.ac.uk/cedex/documents/papers/2008-17.pdf

Secondary or abstract only:
- Rubinstein 1989, AER 79(3), via Takamiya-Tanaka 2006 (DP650). https://www.econ.niigata-u.ac.jp/~takamiya/DP0650.pdf
- Crawford-Sobel 1982, Econometrica 50(6), via Dean's notes https://www.columbia.edu/~md3405/GT_Info_Signal_3_17.pdf and ADM08.
- Radner 1962, Ann. Math. Stat. 33(3), via M&R Theorem 1 (p.157).
- Mehta-Starmer-Sugden 1994 (Theory and Decision 36; AER 84(3)), via Bardsley et al.
- Bacharach 2006, via Smerilli 2010. https://mpra.ub.uni-muenchen.de/25246/1/MPRA_paper_25246.pdf
- Bolton-Dewatripont 1994, QJE 109(4): abstract. https://ideas.repec.org/a/oup/qjecon/v109y1994i4p809-839..html
- Morris-Shin 2002, via Svensson 2006. https://larseosvensson.se/files/papers/Morris-Shin.pdf
- Geanakoplos-Polemarchakis 1982: abstract. https://ideas.repec.org/p/cwl/cwldpp/639.html
- Chwe, Rational Ritual: publisher summary. Angluin 1980, Clark-Marshall 1981: [memory] / [secondary: H&M p.7].

Open doubts: (a) no primary text for Rubinstein, Crawford-Sobel, Radner 1962, Mehta et al., Bacharach, Bolton-Dewatripont; (b) "cheap-talk models do not cover sincere error" rests on the papers I read, not a systematic search; (c) OCR may mis-render numbers in M&R, so I cite prose and pages only; (d) all predictions in §5 are untested.
