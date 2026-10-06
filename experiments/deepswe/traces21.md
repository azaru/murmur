# Round 21: coordination summary per batch

Generated from each run's `murmur/run/events.jsonl` (the raw run directories stay out of git). The teams batches have one run per team (`runs/<batch>/team{1,2,3}/`). Part 1 is `python3 experiments/deepswe/traces.py <batch>...`; part 2 is `python3 experiments/deepswe/rivals.py <teams-batch>...`, the pre-registered measures of how teams used the rivals' work. A team's minutes run from its own first event to its last; the batch's minutes in `results/` are the longest team's run plus setup. No run failed.

# Part 1: coordination counts

## e21-teams-r0 team1

- tokens 8.0M, $0.13, 15.2 minutes, end budget, agents with tool calls 3
- events: abort 1, attach 30, check 1, done 1, enter 3, post 28, run_end 1, run_start 1, tool 269, usage 225
- tool calls: bash 122, done 1, edit 33, post 27, read 85, write 1
- done calls 1, first at 8.4 min, last at 8.4 min
- bash calls naming a task: expr 4, oxvg 24, scriggo 38, tengo 18, wasmi 37
- write/edit calls on a task's files (agents): expr 0 (0), oxvg 10 (1), scriggo 15 (1), tengo 0 (0), wasmi 9 (1)

## e21-teams-r0 team2

- tokens 8.1M, $0.12, 26.6 minutes, end budget, agents with tool calls 3
- events: abort 1, attach 9, check 1, done 2, enter 3, post 12, run_end 1, run_start 1, tool 234, usage 195
- tool calls: bash 111, done 2, edit 24, post 10, read 87
- done calls 2, first at 2.6 min, last at 4.3 min
- bash calls naming a task: expr 16, oxvg 24, scriggo 17, tengo 27, wasmi 20
- write/edit calls on a task's files (agents): expr 1 (1), oxvg 7 (1), scriggo 5 (1), tengo 1 (1), wasmi 10 (1)

## e21-teams-r0 team3

- tokens 8.0M, $0.13, 11.6 minutes, end budget, agents with tool calls 3
- events: abort 1, attach 35, check 1, enter 3, post 20, run_end 1, run_start 1, tool 280, usage 234
- tool calls: bash 128, edit 50, post 20, read 82
- bash calls naming a task: expr 21, oxvg 9, scriggo 22, tengo 35, wasmi 25
- write/edit calls on a task's files (agents): expr 1 (1), oxvg 0 (0), scriggo 4 (1), tengo 27 (1), wasmi 18 (1)

## e21-solo-r0

- tokens 1.5M, $0.03, 17.1 minutes, end all_done, agents with tool calls 1
- events: check 1, done 1, enter 1, run_end 1, run_start 1, tool 77, usage 47
- tool calls: bash 47, done 1, edit 8, read 21
- done calls 1, first at 16.6 min, last at 16.6 min
- bash calls naming a task: expr 6, oxvg 7, scriggo 11, tengo 13, wasmi 9
- write/edit calls on a task's files (agents): expr 0 (0), oxvg 0 (0), scriggo 0 (0), tengo 3 (1), wasmi 5 (1)

## e21-teams-r1 team1

- tokens 8.0M, $0.13, 22.1 minutes, end budget, agents with tool calls 3
- events: abort 1, attach 24, check 1, done 2, enter 3, post 16, run_end 1, run_start 1, tool 249, usage 211
- tool calls: bash 115, done 2, edit 47, post 14, read 70, write 1
- done calls 2, first at 5.1 min, last at 8.9 min
- bash calls naming a task: expr 10, oxvg 27, scriggo 20, tengo 32, wasmi 25
- write/edit calls on a task's files (agents): expr 0 (0), oxvg 15 (1), scriggo 5 (1), tengo 17 (1), wasmi 11 (1)

## e21-teams-r1 team2

- tokens 8.0M, $0.14, 16.6 minutes, end budget, agents with tool calls 3
- events: abort 1, attach 40, check 1, enter 3, post 26, run_end 1, run_start 1, tool 276, usage 246
- tool calls: bash 106, edit 50, post 26, read 90, write 4
- bash calls naming a task: expr 10, oxvg 22, scriggo 18, tengo 27, wasmi 21
- write/edit calls on a task's files (agents): expr 6 (1), oxvg 1 (1), scriggo 4 (1), tengo 27 (1), wasmi 16 (1)

## e21-teams-r1 team3

- tokens 8.0M, $0.12, 24.7 minutes, end budget, agents with tool calls 3
- events: abort 1, attach 26, check 1, done 1, enter 3, post 26, run_end 1, run_start 1, tool 248, usage 212
- tool calls: bash 115, done 1, edit 30, post 25, read 75, write 2
- done calls 1, first at 1.5 min, last at 1.5 min
- bash calls naming a task: expr 17, oxvg 42, scriggo 17, tengo 19, wasmi 7
- write/edit calls on a task's files (agents): expr 4 (1), oxvg 18 (1), scriggo 3 (1), tengo 7 (1), wasmi 0 (0)

## e21-solo-r1

- tokens 1.1M, $0.02, 3.2 minutes, end all_done, agents with tool calls 1
- events: check 1, done 1, enter 1, run_end 1, run_start 1, tool 50, usage 34
- tool calls: bash 27, done 1, edit 4, read 18
- done calls 1, first at 3.2 min, last at 3.2 min
- bash calls naming a task: expr 3, oxvg 10, scriggo 4, tengo 3, wasmi 6
- write/edit calls on a task's files (agents): expr 0 (0), oxvg 0 (0), scriggo 0 (0), tengo 0 (0), wasmi 4 (1)

# Part 2: use of the rivals' work

## e21-teams-r0

### team1

- 15.2 minutes, end budget, first done 8.4 min (1 done calls), last write 14.7 min
- tool calls mentioning /rivals: 13 (finch 4, robin 7, wren 2); by minute: 0-10 12, 10-20 1
- posts naming another team or rivals: 0 of 28

### team2

- 26.6 minutes, end budget, first done 2.6 min (2 done calls), last write 26.6 min
- tool calls mentioning /rivals: 16 (finch 4, robin 12); by minute: 0-10 8, 10-20 7, 20-30 1
- posts naming another team or rivals: 2 of 12
  - 16.0 min robin: 'I see team1 also implementing Wasmi minimal coredumps and oxvg structure protection. I have tests passing for my Scriggo/Wasmi/Tengo partial changes; Tengo pars'
  - 16.6 min robin: 'Review of team1 oxvg patch: it currently matches full selector targets then protects closest group ancestor, but misses selector anchor groups like `g:nth-child'

### team3

- 11.6 minutes, end budget, first done none, last write 11.4 min
- tool calls mentioning /rivals: 13 (robin 3, wren 10); by minute: 0-10 8, 10-20 5
- posts naming another team or rivals: 0 of 20

### identical file diffs between teams: 0; written after reading the rival's copy: 0


## e21-teams-r1

### team1

- 22.1 minutes, end budget, first done 5.1 min (2 done calls), last write 22.1 min
- tool calls mentioning /rivals: 8 (finch 5, robin 2, wren 1); by minute: 0-10 8
- posts naming another team or rivals: 0 of 16

### team2

- 16.6 minutes, end budget, first done none, last write 16.3 min
- tool calls mentioning /rivals: 10 (robin 8, wren 2); by minute: 0-10 10
- posts naming another team or rivals: 2 of 26
  - 1.5 min robin: "I see 2 repos still available? I'll own Scriggo; oxvg returned to available unless someone picks. Scriggo implementation substantial; checking rivals."
  - 7.8 min robin: 'Scriggo parser groundwork done/full Go test passes, oxvg untouched. Rival team1 implemented collapse_groups protection; I can review/improve precision. Any equa'

### team3

- 24.7 minutes, end budget, first done 1.5 min (1 done calls), last write 24.7 min
- tool calls mentioning /rivals: 18 (finch 16, robin 2); by minute: 0-10 11, 10-20 7
- posts naming another team or rivals: 3 of 26
  - 10.3 min finch: "I see team1 has Tengo baseline destructuring implementation. I can work on separate enhancements after coordinating; what are you covering? I'll inspect default"
  - 14.4 min finch: 'Scriggo AST+parser receiver added locally and tests pass, but checker/runtime integration remains. Is team1 handling that or should I explore?'
  - 17.1 min finch: "Team1 Tengo baseline parser/compiler observed; I'll avoid overlapping and focus Scriggo parser AST support unless you ask otherwise."

### identical file diffs between teams: 2; written after reading the rival's copy: 2

- scriggo-method-declarations ast/ast.go: team1 = team3
- scriggo-method-declarations ast/astutil/clone.go: team1 = team3
- team3 wrote scriggo-method-declarations ast/ast.go after reading team1's, which team1 had written first
- team3 wrote scriggo-method-declarations ast/astutil/clone.go after reading team1's, which team1 had written first

