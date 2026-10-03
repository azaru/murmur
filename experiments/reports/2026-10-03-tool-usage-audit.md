# Tool-usage audit: write / edit / bash / read in murmur and Pi runs (2026-10-03)

**Model output (subagent audit), not verified by hand.** Counts come from ad-hoc Python replays of the saved transcripts; the claims that drive a decision are marked "check by hand" with a transcript path and message index in section 8.

## 1. Method

- Data: every swarmtest campaign with a `report.json` and seed in {20261053, 20261054, 20261055 (round 11)} or {20261020, 20261025, 20261030..20261040 (earlier rounds)}. 279 runs: 
  - round 11 ("r11"): 67 murmur n=1 runs (arms solo, solo-norms, solo-norms-clock, solo-clock; all have `writeGuard` on) and 18 Pi runs (no murmur, no guard). Stage C is still running; only its finished campaigns are in.
  - earlier ("early"): 119 murmur n=1, 57 murmur swarm runs (n=2..10, 234 agent transcripts), 18 Pi runs. This is all finished runs of those seeds, not a sample. Many have oracles and board tools; read the swarm numbers as contrast only.
- Per agent transcript (`state/murmur/<agent>.messages.json` or `state/messages.json`) I paired each assistant `toolCall` with its `toolResult` and counted by tool. "Cost" is the per-message `usage.cost.total` (USD) split evenly over the tool calls of that message. Output tokens use `usage.output`. Cache-read tokens are not used.
- Edit failures: the "wasted" chain is the failing call plus the following calls on the same path (read, edit, write, or a bash naming the file) up to, but not including, the next successful edit/write on that path (max 8 calls ahead). That is an upper-bound heuristic.
- Not-found causes: I replayed each transcript to rebuild the file content the agent knew (full reads, own writes, own successful edits). Files modified by bash or teammates are not tracked, so classes are approximate.
- Events: `write_refused` events counted from `events.jsonl` match the transcript counts (r11: 5, early: 12).
- Heavy scripts ran under `nice -n 15`, single process. Scratch scripts were in `tmp/claude-tools-audit/` and were deleted.

## 2. Current tool definitions (Pi `dist/core/tools/*.js`)

| tool | description (verbatim, shortened) | system-prompt rules |
|---|---|---|
| `read` | "Read the contents of a file. Supports text files and images... output is truncated to 2000 lines or 50KB (whichever is hit first). Use offset/limit for large files." Params: `path`, `offset` ("1-indexed"), `limit`. | "Use read to examine files instead of cat or sed." |
| `bash` | "Execute a bash command in the current working directory. Returns stdout and stderr. Output is truncated to last 2000 lines or 50KB... Optionally provide a timeout in seconds." Param `timeout`: "Timeout in seconds (optional, no default timeout)". | "Use bash for file operations like ls, rg, find" |
| `edit` | "Edit a single file using exact text replacement. Every edits[].oldText must match a unique, non-overlapping region of the original file. If two changes affect the same block or nearby lines, merge them into one edit... Do not include large unchanged regions." Param `edits[].oldText`: "Exact text for one targeted replacement. It must be unique in the original file..." | "Use edit for precise changes (edits[].oldText must match exactly)"; "use one edit call with multiple entries in edits[]" for several locations; "Keep edits[].oldText as small as possible". |
| `write` | "Write content to a file. Creates the file if it doesn't exist, overwrites if it does. Automatically creates parent directories." Params `path`, `content`. | "Use write only for new files or complete rewrites." |

Error strings (edit-diff.js): "Could not find edits[N] in X. The oldText must match exactly including all whitespace and newlines." / "Found N occurrences of edits[N] in X. Each oldText must be unique. Please provide more context to make it unique." / "No changes made to X. The replacements produced identical content." Edit already does fuzzy matching (smart quotes, trailing whitespace, NFKC), so what still fails is a real mismatch. Pi's `bash` returns "(no output)" for an empty command string. The murmur guard text is in `src/swarm.ts` ("write replaces the whole file, and this content looks like only part of it ... Add it with edit, or write the complete file in one call; to really replace the file with something shorter, delete it first.").

Wording notes:
- `write` already says "overwrites if it does", and the system prompt says "only for new files or complete rewrites". The misuse is therefore not ignorance of the semantics; the agents' own reasoning labels show intent to append ("Appending parser grouping", "Finishing core append", "Adding the EOF edit"). There is no append tool and nothing tells the model how to append.
- `edit` explains exact matching but says nothing about escaping. The most common real cause of "not found" in regex-heavy code is the model doubling backslashes (section 4). Nothing in the tool text or error says "pass the raw characters".
- `edit` does not say that a multi-edit call is all-or-nothing, and the error does not say that nothing was applied.
- `bash.timeout` says seconds, yet the model passes millisecond values (section 6).
- `bash` with an empty command silently returns "(no output)", which hides that the call was malformed.

## 3. write

### 3.1 Counts

| | r11 murmur n=1 (67 runs) | r11 Pi (18) | early murmur n=1 (119) | early swarms (57) | early Pi (18) |
|---|---|---|---|---|---|
| write calls | 135 | 38 | 206 | 611 | 18 |
| writes onto a path the agent had already read or written | 115 | 37 | 149 | 73 | 18 |
| `write_refused` (guard) | 5 | n/a (no guard) | 4 | 8 | n/a |
| full rewrites replacing a >3k-char file the agent wrote earlier (calls / runs) | 12 / 10 | 9 / 5 | 10 / 7 | 7 / 7 | 0 |
| output cost of the replaced versions (USD, upper bound on re-emission) | 0.017 (2.3% of 0.739) | 0.016 (20% of 0.078) | 0.017 | 0.006 | 0 |
| writes with empty/whitespace-only content | 1 | 0 | 3 | 2 | 0 |

(Most "writes onto a known path" are the first write over the scaffold stub the agent had just read, which is legitimate.)

### 3.2 The chunked-write pattern is concentrated in one task

All suspected chunked writes in round 11 are on `information_extraction_hard_blind` (writing `extract.py`, 14 runs: 11 murmur, 3 Pi). On the other 71 round-11 runs (five other tasks), including `ledger_reconciliation_hard_blind` where agents write 10k+ chars in one call, there is none. First-write length on the info-extraction task has median 6.5k chars (about 2.3-2.6k output tokens) against 2.8-3.9k on the optimization tasks, but ledger tasks write 10k in one go, so it is not a hard output cap; it is the agent's plan ("core first, then assembly").

Runs with the append intent (a later `write` to the same file that is a continuation, starting with a newline, indentation or `def`, or a stub):

| arm | runs | with continuation write | outcome |
|---|---|---|---|
| murmur (guard on) | 11 | 5 (all refused by the guard) | all 5 recovered; 0 content lost |
| Pi (no guard) | 3 | 2 | both destroyed the file: `de311f74/run-0002` lost the header (fixed by an edit after a failing test); `46d87407/run-0002` lost 11.4k chars and ended with a 216-char stub that "writes an empty cases list" (grade 0.0) |

Also in 9 of the 14 runs the agent wrote a 4-7k-char first chunk, then a second `write` of the whole file again (6-18k chars) that replaces the first chunk. This works (no content loss) but re-emits the chunk (about 2.3k output tokens each). So the dominant way agents "append" today is to rewrite the whole file.

### 3.3 The five round-11 refusals (all true positives)

All five contents start with a newline; the guard's first clause (leading whitespace) is what fired. The second clause (shorter and different first line) did not matter in round 11.

| # | run / agent / message | path | refused content (start) | what the agent did next | extra calls, USD |
|---|---|---|---|---|---|
| 1 | `20261003T082412Z-de311f74/run-0004` wren, msg 16 | extract.py (12,433 chars) | `"\ndef assemble(docs):\n parent=list(range(len(docs)))..."` (3,073 chars, continuation) | edit to add an anchor blank line (msg 18), then edit appending the 3,022-char function (msg 20) | 2 wasted calls (refused write 1,089 output tokens + anchor edit), about 0.0015. Run scored 0.977. |
| 2 | `20261003T090544Z-46d87407/run-0001` wren, msg 12 | extract.py (6,369) | `"\ndef main(argv):\n if len(argv)!=3:return 2..."` (7,973) | empty bash (msg 14), edit anchored on `if __name__ == "__main__"` that the file did not contain: failed (msg 16, 7.8k chars re-emitted), `tail` (msg 18), then a full 13k-char rewrite (msg 20) | 4 wasted calls, about 0.0057 (about 6k output tokens). Run scored 0.605. |
| 3 | `20261003T094049Z-3e791542/run-0003` wren, msg 10 | extract.py (6,680) | `"\ndef update_pair(line, form=False):..."` (5,131) | edit anchored on `def main(argv):\n` inserting the function (msg 12), npm test, further edit | 1-2 wasted calls, about 0.002 (1.9k output tokens). Run scored 0.0 (cause not examined). |
| 4 | `20261003T094049Z-3e791542/run-0001` wren, msg 12 | extract.py (4,469) | `"\ndef normalize(k,v):..."` (6,908) | edit anchored on `"\n"`: failed, 67 occurrences (msg 14, 5.6k chars re-emitted), then a full 7.8k-char rewrite (msg 16) | 2 wasted calls, about 0.0029. Run scored 0.544. |
| 5 | `20261003T101120Z-b52e2cc6/run-0002` (stage C) wren, msg 16 | extract.py (8,386) | `"\n"` (degenerate, empty continuation) | read the file (msg 18), then a correct 4.7k-char edit | 2 wasted calls, about 0.0008. Run scored 0.641. |

Run 5 also shows a guard false negative: at msg 12 the agent wrote a 94-char stub (`#!/usr/bin/env python3\n# Support document normalizer; ...`) over its 9,219-char file. It was not refused because the stub's first non-blank line equals the file's (the shebang). The agent re-wrote the file in full at msg 14 (8.4k chars, about 0.0018).

Total for the five: about 12 wasted calls and about 0.013 USD in a 0.739 USD set (about 2%). In dollars the guard barely matters; its value is the prevented content loss (Pi lost the file in 2 of 3 runs on this task).

### 3.4 The twelve earlier-round refusals (writeGuard on, swarms and solos)

| path | n | verdict (my reading) |
|---|---|---|
| `extract.py` with empty content (`10df4893/run-0001` msg 128, `56d5d46b/run-0001` msg 19) | 2 | true positive (would have wiped a 400-line file; agent then used edit) |
| `SCORES.md` rewritten blind while a teammate had just written it (`f26790fe/run-0002`, `8f94d51d/run-0002`, `49c4da67/run-0003`, `c2103a4e/run-0003`, `45567644/run-0003`) | 5 | true positive in spirit (would have clobbered a teammate's file the writer had not read), though the criterion fired by accident (shorter and different first line) |
| `attempts/lark/solve.py` (2 refusals in a row, `54fb30cf/run-0002` msgs 39 and 41), `attempts/crane/solve.py` (`a0bd1b2b/run-0002` msg 39), `taskboard/activity.py` (`9376b32b/run-0001` msg 90), `inventory/__init__.py` (`fec33dc7/run-0001` msg 20) | 5 | false positive: deliberate full rewrite of an existing, shorter file. Cost 1-3 extra calls each (read, `mv` to delete first, rewrite), about 0.001-0.002 |

So: round 11, 5 of 5 true positives; earlier rounds 7 of 12 true positives, 5 of 12 false positives, all false positives from the "shorter and starts differently" clause.

## 4. edit

| | r11 murmur n=1 | r11 Pi | early murmur n=1 | early swarms | early Pi |
|---|---|---|---|---|---|
| edit calls | 339 | 9 | 1,424 | 1,303 | 19 |
| failures | 30 (8.8%) | 3 | 121 (8.5%) | 113 (8.7%) | 0 |
| runs with at least one failure | 15 / 67 (22%) | 2 / 18 | 51 / 119 (43%) | 46 / 57 (81%) | 0 |
| not found | 23 | 1 | 72 | 84 | - |
| not unique | 6 | 2 | 29 | 14 | - |
| no change / ENOENT / aborted / overlap | 1 | 0 | 8 / 6 / 4 / 2 | 10 / 2 / 2 / 1 | - |
| wasted chain (calls, USD, share of agents' total cost) | 57 calls, 0.039 (5.3%) | 7 calls, 0.003 | 240 calls, 0.140 (6.0%) | 261 calls, 0.110 (2.8%) | 0 |
| output tokens in the chains (share of total output) | 23.1k (4.6%) | 1.3k | 79k (5.6%) | 56k (2.8%) | 0 |

Pi uses `edit` rarely in these runs (19 + 9 calls), so its rate is not measurable; Pi mostly rewrites.

Retries: after a failure the first same-path follow-up (within 3 calls) was, in r11 murmur n=1, a read (11), another edit (13), a bash on that file (3), a write (2); 1 of 30 failure chains never ended in a successful edit/write (early n=1: 12 of 121, swarms 37 of 113). The failing call is usually one that must be re-sent in full: the failed `newText` totalled 21.9k chars in r11 (30 calls), 108k chars early (234 calls).

Multi-edit calls fail about twice as often as single-edit calls: 12.5% (130 of 1,042) vs 6.2% (104 of 1,685) early, 12.5% (17 of 136) vs 6.4% (13 of 203) in r11. Pi applies edits atomically, so one bad `oldText` discards the others.

Not-found causes (replay classification, only where the full file content was known):

| cause | early n=1 | early swarms | r11 n=1 |
|---|---|---|---|
| `oldText` has doubled backslashes (`\\s` where the file has `\s`) | 33 | 0 | 11 |
| other text absent (recalled code that is not in the file, stale) | 21 | 26 | 10 |
| whitespace mismatch (e.g. indentation of one space) | 15 | 11 | 2 |
| text already replaced (newText already present) | 3 | 0 | 0 |
| file not read in full, not classifiable | 15 | 28 | 5 |
| file changed by teammate or bash since the agent's read | 0 | 22 | 0 |

In regex-heavy tasks (`extract.py`, `reconcile.py`) over-escaped backslashes are the largest single cause: 11 of 23 not-found failures in round 11, and some earlier runs wrote the doubled backslashes into the file and then repaired them with `python3 - <<'PY' ... s.replace('\\\\','\\')` (10 such calls in 3 early runs). In swarms, a fifth of not-found cases are the file changing under the agent.

## 5. bash used for file work

| per group | r11 n=1 (439 bash calls) | r11 Pi (33) | early n=1 (1,850) | early swarms (4,135) |
|---|---|---|---|---|
| `cat/head/tail/nl <file>` read | 5 (1.1%), 4 runs | 1 | 29 (1.6%), 22 runs | 84 (2%), 36 runs |
| `sed -n` read | 2 | 0 | 11 | 32 |
| heredoc `cat > f <<EOF` write | 0 | 0 | 0 | 2 |
| append (`cat >> f <<EOF`, `>> f`) | 0 | 0 | 3 (1 run) | 0 |
| `sed -i` / perl -i | 0 | 0 | 0 | 5 |
| python writing a .py/.md/.json file | 2 | 0 | 32 (many are the backslash repair above) | 184 (includes probe scripts writing JSON, not separated) |
| ls/find/grep/rg | 98 (22%) | 3 | 250 | 727 |

Heredoc appends are not the agents' workaround: three `cat >> extract.py <<'PY'` calls in a single early run (`20261002T064929Z-e705324e/run-0001`) and none in round 11. The workaround actually used is "append by edit": an edit whose `newText` starts with the `oldText` and adds more than 400 chars. That occurred 11 times in 7 of 67 r11 runs, 35 times in 21 of 119 early n=1 runs, 11 times in 9 swarm runs. Some are legitimate insertions, so this is an upper bound for the append intent.

## 6. read and bash mechanics

- read: partial reads (offset/limit) are normal: r11 n=1 238 partial vs 148 full; Pi 60 vs 10. Real Pi truncation (`[Showing lines X-Y of Z ...]`) occurred 0 times in 279 runs. The `[N more lines in file. Use offset=...]` marker (46 in r11 n=1) is only the agent's own `limit` being reached. A single line larger than 50KB (a minified `instance.json`) occurred 10 times in r11 n=1 and 3 in Pi; the tool's message points at `sed -n 'Np' | head -c`. Out-of-range offsets: 8 in total. Repeated reads of an unchanged file: 1 in r11 n=1, 0 in early n=1 (51 in swarms, but teammates' edits are invisible to my tracker, so most are legitimate). Waste is negligible.
- bash timeouts: r11 murmur 0, Pi 1; early n=1 5 (4 runs); early swarms 44 (20 of 57 runs), all the agent's own short `timeout` (5-30 s) killing a probe; "Command aborted" (run ended during a command) 21 times early, 0 in r11. Truncated bash output ("Showing last ..."): 4 in r11 n=1 (3 runs), 4 early n=1, 1 swarm. Cost is minor.
- The `timeout` parameter is documented in seconds but values of 1000 or more (milliseconds) appear in 103 r11 murmur calls (20 of 67 runs), 15 Pi calls (9 of 18 runs), 554 early n=1 calls, 1,058 swarm calls. No harm observed (those commands finished), but a hung command would run for hours.
- Degenerate calls: `bash` with an empty `command` 3 times in r11 murmur (3 runs), 1 Pi, 13 early n=1 (12 runs), 25 swarms (20 runs); `write` with empty content 1 in r11, 3 early n=1, 2 swarm. The agent's reasoning label shows it meant something else ("Inspecting incomplete file tail" with command `""`). The result "(no output)" hides the error. In `46d87407/run-0002` (Pi) msg 34 an empty bash was followed directly by the 216-char stub write. Cost per call is about 0.0004; the damage is in the misread.

## 7. Recommendations, ranked by expected value

1. **An append capability for files** (new `append` tool, or `write` with `mode: "append"`), as a new lever default-off and a new profile (AGENTS.md rules; the lever is realism-safe, since an append tool exists in real work, and does not depend on a task signal). Evidence: 7 of 14 runs on the one large-file task show the intent; 5 guarded refusals, 2 unguarded destructions (one ended with a stub file and grade 0.0), 9 of 14 runs re-emit a 6k-char chunk, 11 "append by edit" in 7 r11 runs, and agents do not find `cat >>` themselves. Pi has no guard, so any non-murmur baseline keeps losing files. Caveat: it is one task, 14 runs, so value is uncertain on other tasks; adding it may also change behaviour (more chunking), so run it as an arm, not a silent change.
2. **Cheaper, no new tool: change the guard's refusal text** to say how to append, and tighten the guard. The current text offers "edit, or write the complete file in one call" and agents' anchored edits then failed in 2 of 4 cases (anchor not found; `"\n"` matched 67 times). A better text names a safe route, e.g. "to add to the end, use edit with the last line of the file as oldText" or, with an append tool, that tool. Guard criteria: the leading-whitespace clause alone caught all five r11 true positives; the "shorter and different first line" clause produced 5 false positives in 12 early refusals and misses same-shebang stubs (b52e2cc6/run-0002 msg 12). Consider (a) keeping clause 1, (b) adding "content is empty/whitespace-only", (c) dropping or softening clause 2 (for example refuse only when the file was not read by that agent, which also matches the SCORES.md cases). I have no data that clause 2 ever saved real work in r11.
3. **Better edit not-found error** (wrapping the tool or appending to the result): name the nearest line match and line number, say "if the text contains backslashes, pass them exactly as they appear in the file; do not double them", and for multi-edit calls say "no edits were applied". Evidence: not-found is 60-70% of edit failures; over-escaped backslashes are about half of the classified cases in r11 and a third early; failures cost 5-6% of a single agent's cost and about 5% of its output tokens, and multi-edit calls fail twice as often. Open: whether a murmur extension hook can change a tool result, or the edit tool must be overridden; I did not check `src/swarm.ts` hooks beyond the guard.
4. **bash: reject an empty `command` with an explicit error**, and reword `timeout` as "seconds (for example 120), not milliseconds". Low effort; the empty call happens in about 1 of 10 runs and misled the agent at least once. The timeout part is cosmetic.
5. **Description wording for `write`** ("replaces the entire file; to add to it use ..."). Cheap but probably weak: the description and the system prompt already say overwrite and "only for new files or complete rewrites", and agents still chunk, so the gain is mainly as part of items 1-2.

Not worth it on this evidence:
- Changes to `read` (no truncation ever, negligible repeats, partial reads are normal), `bash` truncation or timeout handling, or discouraging `cat`/`sed` reads (about 1-2% of bash calls).
- Fuzzy matching in `edit` (already present; the remaining failures are real mismatches).
- Extra search tools (ls/find/grep via bash are 22% of bash calls and harmless).
- Fixing the guard's dollar cost: the five refusals cost about 0.013 USD.

## 8. Representative transcripts (check by hand)

Paths are relative to `/Users/azaru/Documents/projects/swarmtest/runs/`.

1. `20261003T082412Z-de311f74/run-0004/state/murmur/wren.messages.json`, msgs 12-21: first chunk, whole-file second write, refused continuation (msg 17), anchored-edit recovery.
2. `20261003T090544Z-46d87407/run-0002/state/messages.json` (Pi), msgs 8-40: chunk 3 at msg 12 replaces an 11k file with 4.3k chars, `IndentationError`, restore attempts, empty bash at msg 34, final 216-char stub and "currently writes an empty cases list". Grade 0.0 (`run-0002/record.json`).
3. `20261003T082412Z-de311f74/run-0002/state/messages.json` (Pi), msgs 8-17: second write at msg 10 starts at `def fieldline` and drops the header; msg 14 restores it by edit.
4. `20261003T094049Z-3e791542/run-0001/state/murmur/wren.messages.json`, msgs 10-19: refusal, anchored edit on `"\n"` matching 67 times, full rewrite.
5. `20261003T101120Z-b52e2cc6/run-0002/state/murmur/wren.messages.json`, msgs 8-21: unguarded 94-char stub over a 9.2k file (msg 12), `"\n"` write refused (msg 16).
6. Over-escaped backslashes: `20261003T090544Z-46d87407/run-0004/state/murmur/wren.messages.json`, msgs 25 and 29 (same edit failing with `\\\\-.` then succeeding with `\\-.`).
7. Early false positive: `20261002T171902Z-54fb30cf/run-0002/state/murmur/lark.messages.json`, msgs 39-46 (two refusals of a deliberate rewrite, read, rewrite).
8. Teammate-clobber prevention: `20261002T155118Z-f26790fe/run-0002/state/murmur/wren.messages.json`, msgs 73-78 (SCORES.md).

## 9. Limits and open doubts

- The append-intent finding rests on one task (14 runs, one campaign of 3 plus stage C's 2). Scores on that task are confounded by arm (Pi 0.07/0.0/0.0 vs murmur 0.0-1.0); I do not claim the chunking caused the Pi scores, only that two Pi runs ended with destroyed files.
- Replay-based classes (not-found causes, "file not read in full") are approximate; bash- or teammate-modified files are invisible to the replay.
- Cost per call is the message's cost split evenly; the wasted-chain figures are upper bounds. Dollars are tiny (a whole r11 n=1 set is 0.74 USD), so the case for tool changes is about content loss, wall-clock and output tokens, not money.
- Pi samples are small (18 runs, 9 edit calls in r11), so edit/bash rates for Pi are not estimable.
- Empty bash/write calls and the odd 94-char stub may be argument truncation in transport or constrained sampling rather than model intent; I could not tell from the transcripts. The cause matters for whether a tool-side check is enough.
- Early-round swarms had oracles, boards, claims and the stale/claim guards, so their rates are contrast, not baselines.
- Stage C is still running; the single stage C campaign included here (`b52e2cc6`) is complete, the rest were skipped.

## Verified by hand (main session, 2026-10-03)

- There are exactly 5 `write_refused` events in round 11's `events.jsonl` (seeds 20261053–20261055), all on `extract.py` in information_extraction_hard_blind. Confirmed.
- `20261003T101120Z-b52e2cc6/run-0002`: message 12 writes 94 characters over the 9,219-character file from message 10. Both start with `#!/usr/bin/env python3`, and the write is not refused. Message 16 (`"\n"`) is refused. Confirmed.
- `20261003T090544Z-46d87407/run-0002` (Pi): the final `extract.py` is 216 bytes and the grade is 0.0. Confirmed.
- Pi's `write` description says "overwrites if it does", and its system-prompt guideline says "Use write only for new files or complete rewrites." Confirmed in `node_modules/@earendil-works/pi-coding-agent/dist/core/tools/write.js`.
- The edit failure rates and cost figures were not re-derived.
