# Round 17 stage E: coordination summary per batch

Generated from each batch's `murmur/run/events.jsonl` (the raw run directories stay out of git). Counts per batch: event types; bash calls whose command names each task; write/edit calls on files under each task's directory.

## e17-swarm-r0

- tokens 32.1M, 13.9 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 451, check 1, done 6, enter 12, post 141, run_end 1, run_start 1, tool 949, usage 798
- bash calls naming a task: expr 80, oxvg 29, scriggo 74, tengo 65, wasmi 67
- write/edit calls on a task's files: expr 57, oxvg 0, scriggo 34, tengo 35, wasmi 22

## e17-solo-r0

- tokens 3.1M, 19.3 minutes, end all_done, agents with tool calls 1
- events: check 1, done 1, run_end 1, run_start 1, tool 107, usage 72
- bash calls naming a task: expr 15, oxvg 12, scriggo 12, tengo 15, wasmi 10
- write/edit calls on a task's files: expr 8, oxvg 0, scriggo 2, tengo 1, wasmi 2

## e17-swarm-r1

- tokens 32.0M, 12.2 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 650, check 1, done 2, enter 12, post 182, run_end 1, run_start 1, tool 1031, usage 925
- bash calls naming a task: expr 95, oxvg 38, scriggo 69, tengo 73, wasmi 81
- write/edit calls on a task's files: expr 38, oxvg 0, scriggo 20, tengo 36, wasmi 47

## e17-solo-r1

- tokens 3.1M, 13.6 minutes, end all_done, agents with tool calls 1
- events: check 1, done 1, run_end 1, run_start 1, tool 126, usage 97
- bash calls naming a task: expr 18, oxvg 10, scriggo 7, tengo 22, wasmi 16
- write/edit calls on a task's files: expr 3, oxvg 0, scriggo 0, tengo 5, wasmi 6

