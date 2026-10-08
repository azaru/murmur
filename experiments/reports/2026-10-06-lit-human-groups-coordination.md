Model-written literature review (subagent), 2026-10-06. Labels: [verified] read in primary source; [secondary] otherwise.

# Handoffs, ownership and stopping in human groups, mapped to murmur's eight failure modes (part 2)

Scope: the failure modes in `2026-10-05-swarm-communication-diagnosis.md` (FM1 silent departure, FM2 "done" = my slice, FM3 stale claims, FM4 owner-gating, FM5 allocation blindness, FM6 echo, FM7 shared blind spot at the finish, FM8 rediscovered facts). Part 1 (`2026-10-04-lit-human-groups-biology.md`) is not repeated. Round 20 (departure notice, team status line, task list that releases on `done`) is taken as given.

Honesty note on labels: in this session only these pages were actually opened and read: the Debian MIA wiki, the Red Hat "don't lick the cookie" post, the Rust forge issue-assignment page, and the arXiv abstract of the truck-factor paper. Everything else (I-PASS, Mockus, TMS, Herbsleb, stale-bot, Joint Commission, Kruglanski, Sleesman, Weick, Malone) comes from search snippets or abstracts, so its numbers are [secondary] and should be checked before they go in a paper. Two PDFs (Mockus 2002, DeChurch 2010) could not be read.

## 1. Headline

- The closest human analogue to FM1 is not a hospital handoff but the open-source "missing in action" problem. Humans solved it with **derived liveness** (last upload, unanswered bugs, repository activity) and a **mechanical orphaning step**, never with the leaver's goodwill. Debian MIA does exactly this [verified]. Round 20's notice and status line are the same idea; the human record says the weak point is the *late reader*, not the announcement.
- Handoff research agrees on what makes a handover reliable: a **fixed structure that forces the leaver to state remaining work and contingencies**, plus read-back by the receiver. I-PASS cut errors by 23% and preventable adverse events by 30% in a nine-site study [secondary]. Murmur's `done(reason)` is free text, and 35 of 58 reasons admitted partial scope without handing it on (FM2). A structured `done` is the cheapest untested lever.
- Open-source projects treat a claim as **cheap to make and cheap to void**. Cookie-licking is the named failure [verified, Red Hat], and its remedy is "assign only when you start working" and visible activity, not stronger promises. Linux's MAINTAINERS keeps an explicit `Orphan`/`Odd Fixes` status; unmaintained is a first-class visible state [secondary]. Murmur has no "orphan" state; it has only "last writer".
- Where humans hold a gate (maintainers, owners), helpers defer because of ownership norms and status (psychological ownership, territoriality) [secondary]. Agents have no careers, so the deference seen in FM4 is probably copying the claim text, not fear. That means a **tool-level answer to "may I take it?"** should work where norm text did not.
- Shared-awareness research (Endsley; shared mental models; transactive memory) finds that accurate "who knows/does what" tracks team performance (TMS meta-analysis r about .44 [secondary]) and that this knowledge **decays unless refreshed by observation**. Round 20's status line is the refresh. Nobody called `team` in 54 runs: the human lesson is that awareness must be pushed into the working view, as the status line now does.
- Closure research warns about the clock. Time pressure raises the need for closure (seizing then freezing) [secondary, Kruglanski & Webster]. The visible clock helped murmur's other results but may also feed FM7. Treat as a hypothesis to check in the traces, not a finding.
- Mission command, HRO "deference to expertise" and Kanban's WIP limits all work by changing what people see or by an authority structure. The visible part transfers; the authority part smuggles in a boss and is excluded.

## 2. Findings by topic

### 2.1 Handoffs: I-PASS, SBAR, sign-out, aviation (FM1, FM2)

- Evidence: Starmer et al. (NEJM 2014), nine pediatric residency programmes, 10,740 admissions: medical errors 24.5 to 18.8 per 100 admissions (-23%), preventable adverse events 4.7 to 3.3 (-30%) [secondary]. The bundle was the mnemonic *plus* training, role-play, observation and a culture campaign, so the effect of the form alone is unknown. Joint Commission: communication failure is a root cause in over 60% of sentinel events [secondary]. Arora & Johnson (2005): 26 interns, 25 incidents; the main failures were omitted content (pending tests, active problems) and no face-to-face exchange [secondary].
- I-PASS elements: illness severity, patient summary, **action list**, **situation awareness and contingency plan**, **synthesis by receiver**.
- Explains: FM2 (a free-text `done` hides remaining work; the leaver never writes an action list) and FM1 (no receiver exists).
- Transfers: a required, typed leave form (what is finished, what is not, what is half-done in which folder, what I would do next). Written into a notice by murmur, so no leaver goodwill is needed.
- Does not transfer: hospital handoffs happen because of fatigue and shift length (forced, scheduled, with a named incoming person). Murmur agents leave by choice, with no designated receiver and no read-back. Assigning a receiver is an assignment, so it is excluded; broadcast to all is the non-hierarchical version, and receiver synthesis has no equivalent (it would need a live teammate to confirm).
- Mechanism class: tool (required parameters) is stronger than prompt. But note: a longer `done` description is prompt text, which murmur's record says moves little. The required *fields* are what bind.

### 2.2 Open-source claims, abandonment and "cookie-licking" (FM1, FM3, FM4)

- Cookie-licking: claiming a task and not doing it so others will not take it. The Red Hat piece [verified] lists remedies: separate team coordination from the public tracker, use component labels not assignments, and **assign issues only when starting work, not when committing to plan**. It stresses that the cause is not bad intent but process.
- Rust: `@rustbot claim` assigns only if there is no assignee; release is manual (`release-assignment`/`unclaim`) [verified, Rust forge page]. I found no automatic expiry there, so the claim-then-forget problem is handled socially (maintainers reassign). Murmur's claim-lease with expiry (prior lever) is stronger than what Rust has.
- Debian MIA [verified, wiki]: inactivity is detected from the last upload, RC bugs never answered, and VCS activity; contact is repeated; "we will orphan your packages"; account managers are told only after orphaning. The proposed workflow uses staged waits (16, 8, 4 weeks). Key structure: **liveness from behaviour, escalation by time, and orphaning as a mechanical consequence**. The MIA team itself is a standing group with authority, so it is mildly hierarchical; in murmur, murmur's code plays that role using facts only.
- Linux MAINTAINERS status values: Supported, Maintained, Odd Fixes (has a maintainer who "doesn't have time to do much"), Orphan, Obsolete [secondary, from the file]. The intermediate "Odd Fixes" state is useful: "owner present but not active" is distinct from "gone".
- Stale bots: in 20 large projects, adopting a stale bot closed more PRs in the first months; the literature also reports noise and friction for contributors [secondary, Wessel et al.]. Lesson for murmur: automatic release should be **soft** (an annotation plus permission, not deletion of work).
- Truck factor: of 133 popular GitHub projects, 65% have a truck factor of 2 or less (46% = 1) [verified abstract; 46% secondary]. Of 1,932 popular projects, 16% were abandoned and 41% of those revived when new core developers took over [secondary, Avelino et al.]. Mockus, Fielding & Herbsleb: in Apache the top 15 developers wrote about 80% of the code [secondary; PDF unreadable]. Concentrated ownership plus visible abandonment is the normal state of peer production; revival comes from someone noticing and taking over.
- Contributors say they want awareness of what others do to avoid duplicate work but "do not actively propagate information" (645 contributors) [secondary, Gousios et al.]. This matches murmur's finding that agents ask for state and rarely volunteer it. The fix humans use is tooling that derives state from activity (commit logs, PR lists), not asks people to report.
- Explains FM1, FM3 (stale prose claims), FM4 (waiting for maintainers).
- Does not transfer: open-source claim norms rest on reputation and long calendars (weeks of waiting is acceptable); murmur's whole run is 30 to 120 minutes, so any timeout must be in minutes and driven by the run clock.

### 2.3 Situation awareness, shared mental models, transactive memory (FM1, FM3, FM5)

- Endsley (1995): three levels of awareness: perceiving elements, comprehending their meaning, projecting forward. Errors are mostly at level 1 (information not available or not perceived), which is why interface design is the main lever [secondary, abstract]. Murmur's FM1 is a level-1 failure: the fact "finch left" existed but was not in anyone's view.
- Shared mental models: positively related to team process and performance across 23 studies, whatever the measure [secondary, abstract of DeChurch & Mesmer-Magnus 2010; coefficient not read]. TMS (Wegner 1985; Lewis 2003 scale: specialization, credibility, coordination): meta-analytic r about .44 with team outcomes in a 44-study analysis [secondary]. TMS is built by observation of who does what and decays when membership changes.
- Explains: FM3 and FM5 are transactive-memory failures: nobody holds an accurate "who owns what, and how good is it". The status line gives who and what; it does not give "how weak is this repo", which is the quality signal murmur cannot show without an oracle.
- Does not transfer: human TMS includes credibility (trust built over weeks). Agents have no history; every claim starts at equal credibility, which is a reason to base credibility on observed writes.

### 2.4 Psychological ownership and territoriality (FM3, FM4)

- Pierce et al. (2001, 2003) and Brown, Lawrence & Robinson (2005): ownership feelings lead to territorial behaviour that marks, defends and restores claims [secondary]. Marking is visible claim text; defending is "please avoid those files".
- Explains: why helpers wait to be invited; why a departed owner's marks persist.
- Does not transfer: status, identity and career threats. Agents defer to *text on screen*. So the intervention is to make the marking truthful (derived from writes) and let it lapse automatically; there is nobody whose feelings need managing.

### 2.5 Definition of done, swarming, mob programming, Kanban (FM2, FM5, FM7)

- Scrum's definition of done is a team-level shared criterion; murmur's agents each use their own (FM2). The human practice that matters is that "done" applies to the *work item*, with the whole team accountable for unfinished items. The non-hierarchical transfer is to show the work-item state (what is not finished) to the person about to leave.
- Swarming/mob programming: experience reports only (an 18-month report; a survey of 82 practitioners) [secondary]. Swarming "can slow down development" as conversation grows [secondary]. No effect sizes; treat as design inspiration, which murmur's n=12 swarm already is.
- Kanban WIP limits: an observational study of 8,000+ items over four years in five teams found WIP correlates with lead time, but not the claimed link to productivity [secondary]. The transferable part is the **visible board**; WIP limits themselves are a rule imposed on members, and "limit claims per agent" is a prompt-level rule with weak evidence.

### 2.6 Stopping, closure, escalation (FM2, FM7)

- Escalation of commitment (Staw 1976; Sleesman et al. 2012 meta-analysis of 160+ studies: prior investment predicts persistence) [secondary] is the opposite failure to murmur's. Agents quit early; they do not throw good money after bad. Not useful here, except as a warning against any lever that rewards persistence for its own sake.
- Need for closure (Kruglanski & Webster 1996): urgency pushes people to seize on early answers, permanence to freeze them; time pressure and fatigue raise it, and it promotes premature group consensus [secondary]. FM7 (12 agents agree on the same weak criterion within minutes) matches "freezing", and a visible clock is a time-pressure signal. The agents' "I independently validated it" is a conformity illusion that part 1 already covered (herding, hidden profiles; prior levers: execution-quorum finish, commit-then-reveal).
- Premature closure in medicine is mitigated by forced consideration of alternatives, which needs a role or a checklist; no oracle-free, non-hierarchical equivalent was found beyond the prior levers.

### 2.7 Coordination theory (all FMs)

- Malone & Crowston (1994): coordination is managing dependencies: shared resources, producer-consumer, simultaneity, task-subtask [secondary]. Each has a standard mechanism. Murmur's repos are shared resources with a "who may touch it" mechanism that is prose and so unreliable; the producer-consumer dependency is the handoff (FM1/FM2), which has *no* mechanism at all.
- Herbsleb & Mockus (2003): distributed work items took about 2.5 times as long, partly because more people were involved and informal channels broke [secondary]. Herbsleb & Grinter (1999): coordination broke where informal channels did [secondary]. The parallel is that murmur's board is an informal channel with 4 to 5 second delivery, so the problem is not latency but the content of what is known (as the diagnosis concluded).

### 2.8 High-reliability organisations and mission command (FM1, FM7)

- Weick & Sutcliffe's five principles: preoccupation with failure, reluctance to simplify, sensitivity to operations, commitment to resilience, deference to expertise [secondary]. "Sensitivity to operations" (a live picture of what is happening on the floor) is exactly what the status line adds. "Preoccupation with failure" and "reluctance to simplify" are attitudes; murmur's record says prompt text rarely changes them.
- Flags: "deference to expertise" needs expertise to be identified and authority to move to it, which is a boss by another name. Mission command and commander's intent presuppose a commander who issues the intent; the task statement is the only analogue and is already there.

## 3. Mapping table

| FM | Human mechanism | Lever | Acts via | In round 20 or prior? |
|---|---|---|---|---|
| FM1 silent departure | Debian MIA liveness from behaviour; Endsley level-1 availability | Departure notice; status line | information | Round 20 |
| FM1 (late readers) | Undeliverable-mail bounce at point of use | Reply to a post that names a departed agent, with the leave facts | tool | New (L1) |
| FM2 done = my slice | I-PASS action list and contingency | Structured `done` fields (finished, unfinished by folder, what I would do next) in the notice | tool (required params) | New (L3); round 20 only changes `done`'s description |
| FM2/FM5 | Definition of done at work-item level | Leave-time orphan view in the `done` result | information | New (L2) |
| FM3 stale claims | Red Hat: assign when starting work; Debian: orphan mechanically; Rust: release command | Claim derived from writes with lease; task list releases on `done` | tool | Prior (claim lease) and round 20 (task list) |
| FM4 owner-gating | Apache lazy consensus; MAINTAINERS Odd Fixes/Orphan states | Take-over on an idle or departed owner, owner told | tool | New (L4) |
| FM5 allocation blindness | Linux MAINTAINERS statuses; Kanban board | Per-folder activity labels (edits count, last writer, live or not) | information | Partly round 20 (last writer per folder); labels and edit counts are new (inside L2) |
| FM6 echo | Production blocking, Delphi | Commit-then-reveal | tool | Prior |
| FM7 blind spot | Need for closure; groupthink | Execution-quorum finish; commit-then-reveal | tool | Prior; clock may hurt |
| FM8 facts rediscovered | Transactive memory; wikis | A persistent facts file, shared | tool (weak) | Not built; low priority |

## 4. Top levers

All are default-off, facts only, no assignment, no test signal.

**L1. Bounce on a post to a departed agent (undeliverable notice).** Mechanism: when `post` text contains the name of a teammate who has left, the poster's tool result adds "finch left at 1.5 min (reason: ...); it used write/edit in oxvg 0 min ago". Human basis: the mail-delivery bounce; Debian's `mia-query` shows last activity before anyone contacts a maintainer [verified]. What is new against round 20: the notice is posted once at departure, so late readers and forgetters (wren: nine requests to finch over 8 minutes) still hit the same blind spot; this fires at the moment of the mistake. Prediction: posts addressed to the departed drop by well over half versus round 20's ST-depart; pick-up time of an orphaned repo falls. Cost: about 15 to 25 lines in `board.ts` (name match against the member list). Measure: from `events.jsonl`, the count and timing of posts naming a member after its `done` (as `comm.py` does), and minutes from the first such post to the first write in that folder by another agent.

**L2. Leave-time orphan view.** Mechanism: the `done` tool result (and only it) lists each top-level folder with: number of write/edit calls, last writer, whether that writer is still in, minutes since last edit, and flags "no live writer". Human basis: MAINTAINERS' `Orphan`/`Odd Fixes` statuses (visible unmaintained state) and the definition of done at item level; Endsley level 1 at the decision point. It acts on information at the moment of the leave decision, which is when agents decide, and it shows goal-level state without any quality claim. Prediction: some agents with spare budget decline `done` or call `done` after taking an orphan; fewer repo-runs end with the last writer gone and clock left. Risk: more agents may keep working and hit the token cap sooner (round 20 already predicts that); weak repos are not identified (no oracle), only unattended ones, so the lever fixes FM1/FM2 more than FM5. Cost: about 30 lines reusing the round 20 status-line data. Measure: share of `done` calls issued while at least one folder has no live writer; edits to orphaned folders after the `done` of their last writer.

**L3. Structured `done`.** Mechanism: `done` requires `unfinished` (free text or "none") and optional `next_steps`; murmur copies both into the departure notice and into the unfinished list shown in L2. Human basis: I-PASS action list and contingency [secondary: 23% fewer errors for the bundle]. Prediction: fewer partial-scope exits with no statement (35 of 58 in baseline admitted partial scope; only 2 announced it); readers can act on "unfinished: expr parser". Honest weakness: it changes what agents *write* and uses prompt-like schema text, so it may only change the wording. Cost: about 10 lines in the tool schema. Measure: the share of `done` calls whose `unfinished` is non-empty; whether a teammate edits within 10 minutes after one that names a folder.

**L4. Take-over on lapse (lazy consensus).** Mechanism: a `take(folder)` call (or the first write guard hit on a folder) succeeds immediately if the last writer there has left or has made no write/edit for T minutes (T fixed in the profile, say 8), and the previous holder is told. Human basis: Apache's lazy consensus and Debian's salvage/orphan route [verified for Debian staging, [secondary] for Apache]. It replaces "Robin, may I take it, please assign scope" with a tool answer. Prediction: median wait from "may I take" to first edit falls from 3 to 14 minutes to under 1 for departed owners; for live but idle owners it sits at T. Risks: T is a guess; collisions if the owner returns (the write guard would need to allow both). Cost: 40 to 60 lines, mostly interacting with the write guard and claim lease. This is the most intrusive lever; build only if L1 to L3 leave FM4 unsolved. Measure: gap between a request naming an owner and the requester's first edit in that folder.

**L5 (optional, with L2). Per-folder status labels** (maintained / odd fixes / orphan), derived: live writer with an edit in the last T, live but idle, no live writer, or untouched. This is only a rendering choice for the L2 table; no separate build.

## 5. What not to build

- Assigned receivers for handoffs (I-PASS names an incoming clinician). That is an assignment.
- A "MIA team" agent or any agent that watches others, pings them or reassigns work. Murmur's code does that mechanically; an agent doing it is a manager.
- Role menus for devil's advocate or red team to cure FM7. Roles are allowed only if picked by agents; the evidence that it cures blind spots is clinical and relies on authority to override.
- Reputation or credibility scores (TMS credibility, MAINTAINERS trust). They need history and would drift toward a status hierarchy.
- WIP limits per agent as rules (weak evidence, prompt-level).
- More norm text about handing off, "announce before you leave", "don't wait on silent owners": the murmur record says it does not move behaviour.
- Deference-to-expertise or commander's-intent schemes: they presuppose someone who recognises expertise or issues intent.
- Stale-bot style deletion of claims or closing of work; use annotation and permission.

## 6. Open doubts

- Most numbers here are [secondary]; the Mockus, DeChurch and Starmer papers were not read. Check before citing.
- I-PASS's effect is for a bundle with training and culture change; the structured form alone has no isolated effect size.
- Agents do not have fatigue, careers or relationships, which are the main drivers of human handoff and ownership behaviour. The transferable part is information design, and that is a weaker evidence base than the human outcome data suggest.
- The threshold T in L4 has no empirical basis; Debian's intervals are in weeks.
- The visible clock may raise need for closure (FM7) while helping elsewhere; no data. Worth checking in the round 20 traces (do `done` calls cluster when the clock is low?).
- FM5 (weak repos get no attention) needs a quality signal. Human practice (code review, bug counts) uses external signals murmur may not show without an oracle. None of the levers fix it; L2 only exposes neglect.
- Some failure modes may not be coordination at all but agents' individual stopping policy (35 of 58 `done` reasons admit partial scope); human handoff literature assumes the leaver is forced out, which agents are not.

## 7. Sources

- Starmer et al., I-PASS, NEJM 2014;371:1803-1812 (via press/AHRQ summaries): https://psnet.ahrq.gov/resources/resource/28485 ; https://intermountainhealthcare.org/news/2014/12/multicenter-patientsafety-study-reduces-medical-error-injuries-by-30
- Arora & Johnson 2005, communication failures in sign-out: https://pmc.ncbi.nlm.nih.gov/articles/PMC1744089
- Joint Commission hand-off communication: https://www.jointcommission.org/-/media/cth/documents/improvement-topics/handoff_comm_storyboard.pdf
- Red Hat, "Don't lick the cookie" [verified]: https://www.redhat.com/en/blog/dont-lick-cookie
- Rust forge, issue assignment [verified]: https://forge.rust-lang.org/triagebot/issue-assignment.html
- Debian MIA wiki [verified]: https://wiki.debian.org/Teams/MIA
- Linux MAINTAINERS status values: https://kernelsources.org/source/xref/linux/MAINTAINERS
- Avelino et al., truck factor [verified abstract]: https://arxiv.org/abs/1604.06766
- Mockus, Fielding & Herbsleb, Apache and Mozilla, TOSEM 2002: https://www.st.cs.uni-saarland.de/edu/empirical-se/2006/PDFs/mockus00.pdf
- Herbsleb & Mockus 2003: https://www.st.cs.uni-saarland.de/edu/empirical-se/2006/PDFs/herbsleb03.pdf ; Herbsleb & Grinter 1999: https://www.nokia.com/bell-labs/publications-and-media/publications/splitting-the-organization-and-integrating-the-code-conways-law-revisited
- Gousios et al., pull-based development (contributors): https://serg.ewi.tudelft.nl/publications/work-practices-and-challenges-in-pull-based-development-the-contributors-perspective
- Wessel et al., stale bot: https://arxiv.org/pdf/2305.18150
- Endsley 1995: https://ntrs.nasa.gov/citations/19950007634
- DeChurch & Mesmer-Magnus 2010: https://atlas.northwestern.edu/wp-content/uploads/2017/03/DeChurch-_-Mesmer-Magnus-2010-Measuring-SMMs-META.pdf
- Lewis 2003 TMS scale and TMS meta-analysis: https://www.emerald.com/insight/content/doi/10.1108/TPM-05-2020-0036/full/html
- Brown, Lawrence & Robinson 2005, territoriality (summary): https://academicnewsletter.sufe.edu.cn/info/367494
- Sleesman et al. 2012: https://Www.Gwern.net/doc/psychology/cognitive-bias/sunk-cost/2012-sleesman.pdf
- Kruglanski & Webster 1996: https://terpconnect.umd.edu/~hannahk/NFC-KW96.html
- Malone & Crowston 1994: https://dspace.mit.edu/handle/1721.1/2356
- Weick & Sutcliffe summary: https://silberzahnjones.com/2012/01/24/managing-the-unexpected-by-karl-e-weick-and-kathleen-m-sutcliffe/
- Kanban WIP study: https://www.sintef.no/en/publications/publication/1637884/ ; mob programming report: https://arxiv.org/pdf/1907.11352
