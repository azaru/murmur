## Purpose

Let the `../swarmtest` runner execute murmur on its hidden-grader tasks through the same request/result file protocol as its other adapters, so murmur can be compared with previous systems.

## ADDED Requirements

### Requirement: Request/result bridge
The adapter SHALL be invoked as `<adapter> <request.json> <result.json>`, map the swarmtest request (prompt, agents, provider, model, reasoning, token budget, timeout, acceptance command, workspace, state and temp directories, Pi credentials) to one murmur run whose workspace is the swarmtest workspace, and write the swarmtest result JSON after the run has fully stopped.

#### Scenario: One benchmark task
- **WHEN** swarmtest runs a task with the murmur adapter
- **THEN** the agents work directly in the fixture workspace the grader will inspect, and a result JSON is written

### Requirement: Status and usage mapping
The adapter SHALL report `timeout` when murmur ends by timeout, `token_budget` when it ends by budget, `succeeded` when the acceptance command passes, and `failed` otherwise. It SHALL report murmur's total tokens and cost, and SHALL report cost as unknown rather than 0 when murmur cannot provide it.

#### Scenario: Budget stop
- **WHEN** murmur ends with reason `budget`
- **THEN** the adapter result has status `token_budget` and the recorded token usage

### Requirement: Credentials stay private
The adapter SHALL use the credentials location provided by swarmtest and SHALL NOT copy credentials into the workspace, the run trace or the result.

#### Scenario: Evidence inspection
- **WHEN** a finished run's workspace, trace and result are inspected
- **THEN** none of them contain credential contents
