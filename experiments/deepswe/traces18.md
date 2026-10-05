# Round 18: coordination summary per batch

Generated from each batch's `murmur/run/events.jsonl` (the raw run directories stay out of git). Counts per batch: event types; tool calls; `done` calls and their times; bash calls whose command names each task; write/edit calls on files under each task's directory, with the number of distinct agents in brackets. Minutes are from the first to the last event. Cost is murmur's `costUsd`.

## e18-swarm-r0

- tokens 36.1M, $0.60, 34.2 minutes, end quiescent, agents with tool calls 12
- events: attach 435, check 1, done 12, enter 12, post 118, run_end 1, run_start 1, tool 1022, usage 960, wake 4
- tool calls: bash 376, done 12, edit 216, post 118, read 288, write 12
- done calls 12, first at 1.7 min, last at 22.8 min
- bash calls naming a task: expr 115, oxvg 3, scriggo 25, tengo 38, wasmi 34, scc 26, participle 15, dasel 24, fastapi 61, cattrs 12
- write/edit calls on a task's files (agents): expr 66 (2), oxvg 0 (0), scriggo 11 (1), tengo 21 (2), wasmi 20 (1), scc 19 (1), participle 8 (1), dasel 16 (1), fastapi 54 (2), cattrs 13 (1)

## e18-solo-r0

- tokens 2.0M, $0.04, 13.1 minutes, end all_done, agents with tool calls 1
- events: check 1, done 1, run_end 1, run_start 1, tool 90, usage 66
- tool calls: bash 49, done 1, edit 14, read 25, write 1
- done calls 1, first at 13.0 min, last at 13.0 min
- bash calls naming a task: expr 5, oxvg 7, scriggo 3, tengo 4, wasmi 3, scc 8, participle 4, dasel 7, fastapi 7, cattrs 18
- write/edit calls on a task's files (agents): expr 0 (0), oxvg 0 (0), scriggo 0 (0), tengo 0 (0), wasmi 0 (0), scc 0 (0), participle 0 (0), dasel 0 (0), fastapi 2 (1), cattrs 13 (1)

## e18-swarm-r1

- tokens 337.3M, $4.21, 119.8 minutes, end quiescent, agents with tool calls 12
- events: attach 1298, check 1, done 10, enter 12, post 509, run_end 1, run_start 1, tool 3189, usage 3118, wake 3
- tool calls: bash 1209, done 10, edit 529, post 509, read 886, write 46
- done calls 10, first at 2.4 min, last at 87.4 min
- bash calls naming a task: expr 94, oxvg 26, scriggo 257, tengo 91, wasmi 325, scc 76, participle 48, dasel 21, fastapi 98, cattrs 37
- write/edit calls on a task's files (agents): expr 66 (2), oxvg 7 (1), scriggo 102 (4), tengo 58 (2), wasmi 151 (4), scc 37 (2), participle 57 (1), dasel 15 (1), fastapi 55 (4), cattrs 26 (1)

## e18-solo-r1

- tokens 0.0M, $0.00, 0.4 minutes, end all_done, agents with tool calls 1
- events: check 1, done 1, run_end 1, run_start 1, tool 11, usage 12
- tool calls: done 1, read 10
- done calls 1, first at 0.4 min, last at 0.4 min
- bash calls naming a task: expr 0, oxvg 0, scriggo 0, tengo 0, wasmi 0, scc 0, participle 0, dasel 0, fastapi 0, cattrs 0
- write/edit calls on a task's files (agents): expr 0 (0), oxvg 0 (0), scriggo 0 (0), tengo 0 (0), wasmi 0 (0), scc 0 (0), participle 0 (0), dasel 0 (0), fastapi 0 (0), cattrs 0 (0)

