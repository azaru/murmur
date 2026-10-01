# murmur

A deliberately tiny agent swarm: N [Pi](https://www.npmjs.com/package/@earendil-works/pi-coding-agent) coding agents share one folder and one message board, and the model does the coordinating.

## Run

```sh
npm install
npm run murmur -- run examples/hello.json --unsafe   # --unsafe: agents get full bash on this machine
```

Or in the sandbox container (the image sets `MURMUR_SANDBOX=1`). `~/.murmur-pi` is a copy of your Pi `auth.json` (and `models.json` if you use one); keep it writable so Pi can refresh OAuth tokens.

```sh
docker build -t murmur .
docker run --rm -v "$PWD/runs:/murmur/runs" -v "$PWD/examples:/murmur/examples:ro" \
  -v "$HOME/.murmur-pi:/root/.pi/agent" murmur run examples/hello.json
```

A task file sets `goal`, `done` (definition of done), `check` (acceptance command), optional `project` (folder copied into the workspace), `agents` (1–12), `provider`, `model`, `thinking`, `budgetUsd` and/or `budgetTokens`, `timeoutMinutes` and an optional `profile`. A profile (see `src/profile.ts` for the defaults) holds everything an experiment may tune: `messaging`, the `briefing`/`teamBriefing` templates, `steer` and `wake` texts, `systemPromptAppend`, `toolDescriptions`, the built-in `tools`, `spawnGapSeconds`, and `delivery`/`notices` (with `delivery: "attach"` new posts, and with `notices` each teammate's edits and check runs, are appended to an agent's next tool result instead of steering it into a new turn; with `delivery: "pull"` they wait until the agent calls `inbox`), `boardTools` (which coordination tools to offer) `writeGuard` (refuse a `write` that looks like only part of an existing file, the usual sign of a continuation that would erase it), `claimLease` (claims block teammates' writes and lapse after that many seconds without the holder writing) and `staleGuard` (refuse a `write` onto a file that changed since the agent last read or wrote it); `profiles/no-messaging.json` is the control arm. Each run writes `runs/<id>/workspace/`, `events.jsonl` (full trace) and `result.json` (status, end reason, check output, cost, tokens, per-agent data). With OAuth subscriptions the reported cost may be 0 or a catalog estimate; use `budgetTokens`.

## Design

- The value of a swarm is unstructured communication: one shared board, no roles, no protocol.
- Every agent works in the same folder with Pi's read/bash/edit/write.
- Coordination tools: `post`, `inbox`, `team`, `budget`, `claim`/`release` (advisory) and `done(reason)`.
- A busy agent gets one steer when messages arrive; an idle one is re-prompted.
- Every briefing carries a verifiable definition of done and an explicit way to give up (`done`).
- The swarm ends when all are done, when nobody works and nobody has unread mail, or on budget/timeout.
- The acceptance check always runs at the end; the trace records posts, tool calls, usage and done reasons.
- A profile with `messaging: false` registers only `done`: the control condition for measuring the board's value.
- Agents are isolated from your Pi extensions, skills, settings and context files.
- It refuses to run outside a sandbox unless told `--unsafe`. Under ~600 lines, on purpose.
