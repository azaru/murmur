# Round 23: the fixed baseline, coordination summary per batch

Generated with `python3 experiments/deepswe/traces.py e23-base-r0 ... e23-base-r4` from each batch's `murmur/run/events.jsonl` (the raw run directories stay out of git). No run failed.

## e23-base-r0

- tokens 32.0M, $0.50, 24.6 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 427, check 1, done 3, enter 12, post 181, run_end 1, run_start 1, tool 1001, usage 833
- tool calls: bash 398, done 3, edit 127, post 178, read 291, write 4
- done calls 3, first at 7.7 min, last at 12.4 min
- bash calls naming a task: expr 102, oxvg 62, scriggo 102, tengo 57, wasmi 63
- write/edit calls on a task's files (agents): expr 53 (3), oxvg 7 (2), scriggo 35 (3), tengo 28 (2), wasmi 8 (2)

## e23-base-r1

- tokens 32.1M, $0.49, 16.6 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 275, check 1, done 7, enter 12, post 98, run_end 1, run_start 1, tool 894, usage 759, wake 1
- tool calls: bash 358, done 7, edit 156, post 91, read 273, write 9
- done calls 7, first at 1.1 min, last at 12.6 min
- bash calls naming a task: expr 33, oxvg 65, scriggo 130, tengo 68, wasmi 57
- write/edit calls on a task's files (agents): expr 40 (1), oxvg 12 (1), scriggo 55 (2), tengo 38 (1), wasmi 20 (1)

## e23-base-r2

- tokens 32.0M, $0.49, 14.6 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 441, check 1, done 7, enter 12, post 149, run_end 1, run_start 1, tool 941, usage 824
- tool calls: bash 343, done 7, edit 153, post 142, read 292, write 4
- done calls 7, first at 1.2 min, last at 14.3 min
- bash calls naming a task: expr 62, oxvg 71, scriggo 69, tengo 52, wasmi 86
- write/edit calls on a task's files (agents): expr 31 (2), oxvg 10 (1), scriggo 25 (2), tengo 46 (1), wasmi 45 (2)

## e23-base-r3

- tokens 32.0M, $0.50, 12.7 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 466, check 1, done 6, enter 12, post 147, run_end 1, run_start 1, tool 978, usage 816, write_refused 1
- tool calls: bash 341, done 6, edit 119, post 141, read 361, write 10
- done calls 6, first at 4.5 min, last at 11.5 min
- bash calls naming a task: expr 53, oxvg 62, scriggo 60, tengo 83, wasmi 75
- write/edit calls on a task's files (agents): expr 17 (3), oxvg 1 (1), scriggo 23 (2), tengo 47 (3), wasmi 41 (3)

## e23-base-r4

- tokens 32.1M, $0.52, 13.7 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 492, check 1, done 6, enter 12, post 164, run_end 1, run_start 1, tool 1011, usage 837, write_refused 1
- tool calls: bash 392, done 6, edit 117, post 158, read 330, write 8
- done calls 6, first at 2.2 min, last at 10.4 min
- bash calls naming a task: expr 58, oxvg 53, scriggo 131, tengo 77, wasmi 86
- write/edit calls on a task's files (agents): expr 25 (3), oxvg 7 (2), scriggo 20 (3), tengo 30 (2), wasmi 43 (3)

