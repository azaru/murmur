# Round 22: coordination summary per batch

Generated from each run's `murmur/run/events.jsonl` (the raw run directories stay out of git). Part 1 is `python3 experiments/deepswe/traces.py <batch>...`; part 2 is `python3 experiments/deepswe/rivals.py e22-teams-r0`. Only three batches are valid: the model quota stopped `e22-teams-r1` (its run is in `runs/e22-teams-r1-quota/`, excluded) and the user closed the round there, so `e22-teams-r2` and `e22-swarm-r2` were not run.

# Part 1: coordination counts

## e22-teams-r0 team1

- tokens 12.7M, $0.21, 13.8 minutes, end budget, agents with tool calls 4
- events: abort 1, attach 48, check 1, enter 4, post 25, run_end 1, run_start 1, tool 413, usage 379
- tool calls: bash 190, edit 75, post 25, read 121, write 2
- bash calls naming a task: expr 10, oxvg 14, scriggo 36, tengo 58, wasmi 66
- write/edit calls on a task's files (agents): expr 4 (1), oxvg 4 (1), scriggo 9 (1), tengo 29 (1), wasmi 31 (2)

## e22-teams-r0 team2

- tokens 12.9M, $0.20, 13.9 minutes, end budget, agents with tool calls 4
- events: abort 1, attach 47, check 1, done 1, enter 4, post 23, run_end 1, run_start 1, tool 389, usage 334
- tool calls: bash 164, done 1, edit 54, post 22, read 148
- done calls 1, first at 1.9 min, last at 1.9 min
- bash calls naming a task: expr 42, oxvg 20, scriggo 37, tengo 41, wasmi 26
- write/edit calls on a task's files (agents): expr 12 (2), oxvg 0 (0), scriggo 13 (1), tengo 18 (2), wasmi 11 (1)

## e22-teams-r0 team3

- tokens 6.6M, $0.11, 13.9 minutes, end budget, agents with tool calls 4
- events: abort 1, attach 34, check 1, done 3, enter 4, post 24, run_end 1, run_start 1, tool 263, usage 221
- tool calls: bash 119, done 3, edit 21, post 21, read 98, write 1
- done calls 3, first at 1.0 min, last at 10.7 min
- bash calls naming a task: expr 13, oxvg 9, scriggo 29, tengo 26, wasmi 30
- write/edit calls on a task's files (agents): expr 3 (1), oxvg 0 (0), scriggo 9 (1), tengo 0 (0), wasmi 10 (1)

## e22-swarm-r0

- tokens 32.1M, $0.51, 12.4 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 532, check 1, done 4, enter 12, post 176, run_end 1, run_start 1, tool 946, usage 832
- tool calls: bash 338, done 4, edit 114, post 172, read 309, write 9
- done calls 4, first at 2.8 min, last at 9.8 min
- bash calls naming a task: expr 46, oxvg 60, scriggo 46, tengo 73, wasmi 103
- write/edit calls on a task's files (agents): expr 23 (2), oxvg 11 (2), scriggo 14 (1), tengo 49 (2), wasmi 26 (4)

## e22-swarm-r1

- tokens 32.1M, $0.53, 11.7 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 672, check 1, done 2, enter 12, post 207, run_end 1, run_start 1, tool 1059, usage 929
- tool calls: bash 388, done 2, edit 110, post 205, read 351, write 3
- done calls 2, first at 8.4 min, last at 10.9 min
- bash calls naming a task: expr 85, oxvg 38, scriggo 104, tengo 77, wasmi 88
- write/edit calls on a task's files (agents): expr 19 (3), oxvg 6 (1), scriggo 25 (3), tengo 31 (3), wasmi 32 (3)

# Part 2: use of the rivals' work

## e22-teams-r0

### team1

- 13.8 minutes, end budget, first done none, last write 13.8 min
- tool calls mentioning /rivals: 21 (finch 1, lark 9, robin 11); by minute: 0-10 17, 10-20 4
- posts naming another team or rivals: 1 of 25
  - 9.1 min robin: "I've updated Scriggo method receiver as first compiled arg (matching rival's parser approach) so receiver is available in method body and typechecks. No method "

### team2

- 13.9 minutes, end budget, first done 1.9 min (1 done calls), last write 13.8 min
- tool calls mentioning /rivals: 17 (finch 3, lark 4, robin 3, wren 7); by minute: 0-10 15, 10-20 2
- posts naming another team or rivals: 2 of 23
  - 0.6 min lark: "finch confirmed oxvg; robin says scriggo and wasmi. I'll proceed wasmi unless robin has already started there; I'll inspect current files/rival work."
  - 0.8 min lark: "I found no coredump work in local or team1. Since robin mentioned taking wasmi too, are you actively implementing? I'll take wasmi unless you are already deep i"

### team3

- 13.9 minutes, end budget, first done 1.0 min (3 done calls), last write 10.0 min
- tool calls mentioning /rivals: 10 (finch 1, lark 6, robin 3); by minute: 0-10 6, 10-20 4
- posts naming another team or rivals: 0 of 24

### identical file diffs between teams: 1; written after reading the rival's copy: 1

- scriggo-method-declarations internal/compiler/parser_test.go: team1 = team2
- team1 wrote scriggo-method-declarations internal/compiler/parser_test.go after reading team2's, which team2 had written first

