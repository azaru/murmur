## Purpose

Give the agents of one swarm a shared, unstructured message board and a few coordination tools, so the model itself decides how to divide and verify the work.

## ADDED Requirements

### Requirement: Coordination tools
With `messaging: true` each agent SHALL have the tools `post`, `inbox`, `team`, `budget`, `claim`, `release` and `done`. With `messaging: false` each agent SHALL have only `done`. The board SHALL live in memory for the duration of one run.

#### Scenario: Control condition
- **WHEN** a task sets `messaging: false`
- **THEN** agents can call `done` but no other coordination tool is registered

### Requirement: Post and inbox
`post(text, thread?)` SHALL append a message with sender, optional thread label and text to the board, visible to every other agent. `inbox()` SHALL return, oldest first, every message from other agents that the caller has not yet received via `inbox`, and mark them read. An agent's own posts SHALL NOT appear in its inbox. Threads are labels only; they do not restrict who receives a message.

#### Scenario: Broadcast
- **WHEN** wren posts "I take parser.ts" in thread "plan"
- **THEN** the next `inbox()` of finch and robin includes that message with sender wren and thread plan, and a second `inbox()` does not repeat it

### Requirement: Team
`team()` SHALL return, for every agent, its name, state (working, idle or done), the paths it currently claims, and its done reason if any.

#### Scenario: Seeing a finished teammate
- **WHEN** robin has called `done("tests pass")` and wren calls `team()`
- **THEN** the result shows robin as done with reason "tests pass"

### Requirement: Budget tool
`budget()` SHALL return the swarm's cumulative cost and tokens, and the remaining amount for each configured limit.

#### Scenario: Token-only budget
- **WHEN** only `budgetTokens` is configured
- **THEN** `budget()` reports spent and remaining tokens, and the cost spent

### Requirement: Advisory claims
`claim(path)` SHALL succeed when no other agent holds the path, and SHALL fail naming the holder when another agent holds it. `release(path)` SHALL free a path held by the caller. Claims SHALL be advisory only: they SHALL NOT block file tools.

#### Scenario: Conflicting claim
- **WHEN** wren holds `src/a.ts` and finch calls `claim("src/a.ts")`
- **THEN** the call fails with a message saying wren holds it, and finch can still edit the file with its file tools

### Requirement: Done
`done(reason)` SHALL mark the caller as done with the given reason, release its claims, and end its participation after the current turn. Any agent MAY call it, whether the goal was reached or it gives up.

#### Scenario: Giving up
- **WHEN** an agent calls `done("cannot reach the API from the sandbox")`
- **THEN** it is marked done with that reason and is not prompted again

### Requirement: New-message steer
When a message is posted and a recipient agent is in the middle of a turn, the system SHALL send that agent a single short steer telling it that it has new messages and should call `inbox`. It SHALL NOT steer that agent again until the agent has called `inbox`.

#### Scenario: Several posts while busy
- **WHEN** wren and robin post three messages while finch is working
- **THEN** finch receives exactly one steer, and becomes eligible for another only after it calls `inbox`
