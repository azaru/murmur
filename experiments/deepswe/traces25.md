# Round 25: coordination summary per batch

Generated with `python3 experiments/deepswe/traces.py <batch>...` from each batch's `murmur/run/events.jsonl` (the raw run directories stay out of git). Role choices, departures and clock-line counts are in `plan.md`. No run failed.

## e25-roles-r0

- tokens 32.0M, $0.49, 20.9 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 528, check 1, done 1, enter 12, post 235, run_end 1, run_start 1, tool 973, usage 867
- tool calls: bash 380, done 1, edit 99, post 169, read 254, role 65, write 5
- done calls 1, first at 9.1 min, last at 9.1 min
- bash calls naming a task: expr 123, oxvg 89, scriggo 119, tengo 94, wasmi 72
- write/edit calls on a task's files (agents): expr 42 (3), oxvg 9 (2), scriggo 15 (2), tengo 21 (3), wasmi 17 (2)

## e25-roles-r1

- tokens 32.0M, $0.49, 14.2 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 565, check 1, enter 12, post 219, run_end 1, run_start 1, tool 969, usage 837
- tool calls: bash 382, edit 74, post 160, read 286, role 59, write 8
- bash calls naming a task: expr 73, oxvg 60, scriggo 88, tengo 115, wasmi 73
- write/edit calls on a task's files (agents): expr 11 (2), oxvg 1 (1), scriggo 17 (3), tengo 36 (5), wasmi 17 (2)

## e25-roles-r2

- tokens 32.1M, $0.50, 15.2 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 444, check 1, done 1, enter 12, post 190, run_end 1, run_start 1, tool 950, usage 822
- tool calls: bash 334, done 1, edit 117, post 147, read 301, role 42, write 8
- done calls 1, first at 2.9 min, last at 2.9 min
- bash calls naming a task: expr 62, oxvg 61, scriggo 83, tengo 95, wasmi 63
- write/edit calls on a task's files (agents): expr 15 (2), oxvg 9 (2), scriggo 27 (3), tengo 55 (3), wasmi 19 (4)

## e25-roles-r3

- tokens 32.0M, $0.50, 12.0 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 592, check 1, done 1, enter 12, post 222, run_end 1, run_start 1, tool 1043, usage 909
- tool calls: bash 431, done 1, edit 75, post 168, read 302, role 53, write 13
- done calls 1, first at 5.0 min, last at 5.0 min
- bash calls naming a task: expr 59, oxvg 55, scriggo 134, tengo 102, wasmi 103
- write/edit calls on a task's files (agents): expr 5 (1), oxvg 3 (1), scriggo 25 (5), tengo 34 (3), wasmi 21 (5)

## e25-roles-r4

- tokens 32.0M, $0.49, 16.6 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 378, check 1, enter 12, post 168, run_end 1, run_start 1, tool 925, usage 836
- tool calls: bash 392, edit 98, post 121, read 254, role 47, write 13
- bash calls naming a task: expr 44, oxvg 52, scriggo 157, tengo 80, wasmi 62
- write/edit calls on a task's files (agents): expr 5 (1), oxvg 5 (1), scriggo 56 (2), tengo 24 (3), wasmi 20 (1)

## e25-rclock-r0

- tokens 28.1M, $0.44, 27.5 minutes, end quiescent, agents with tool calls 12
- events: attach 464, check 1, done 11, enter 12, post 237, run_end 1, run_start 1, tool 920, usage 762, wake 3
- tool calls: bash 394, done 11, edit 70, post 153, read 218, role 73, write 1
- done calls 11, first at 1.2 min, last at 27.2 min
- bash calls naming a task: expr 100, oxvg 151, scriggo 86, tengo 97, wasmi 92
- write/edit calls on a task's files (agents): expr 10 (1), oxvg 38 (4), scriggo 0 (0), tengo 9 (3), wasmi 14 (1)

## e25-rclock-r1

- tokens 26.6M, $0.43, 21.2 minutes, end all_done, agents with tool calls 12
- events: attach 430, check 1, done 12, enter 12, post 237, run_end 1, run_start 1, tool 865, usage 737, wake 2
- tool calls: bash 394, done 12, edit 54, post 167, read 179, role 58, write 1
- done calls 12, first at 18.0 min, last at 21.2 min
- bash calls naming a task: expr 71, oxvg 151, scriggo 76, tengo 58, wasmi 114
- write/edit calls on a task's files (agents): expr 4 (1), oxvg 15 (6), scriggo 3 (1), tengo 3 (1), wasmi 30 (4)

## e25-rclock-r2

- tokens 23.8M, $0.40, 33.3 minutes, end all_done, agents with tool calls 12
- events: attach 407, check 1, done 12, enter 12, post 206, run_end 1, run_start 1, tool 849, usage 709
- tool calls: bash 355, done 12, edit 83, post 131, read 204, role 63, write 1
- done calls 12, first at 31.1 min, last at 33.2 min
- bash calls naming a task: expr 77, oxvg 85, scriggo 76, tengo 133, wasmi 90
- write/edit calls on a task's files (agents): expr 4 (2), oxvg 6 (3), scriggo 4 (1), tengo 50 (4), wasmi 20 (2)

## e25-rclock-r3

- tokens 20.7M, $0.37, 35.3 minutes, end quiescent, agents with tool calls 12
- events: attach 340, check 1, done 11, enter 12, post 226, run_end 1, run_start 1, tool 873, usage 701, wake 2
- tool calls: bash 396, done 11, edit 47, post 143, read 198, role 72, write 6
- done calls 11, first at 33.3 min, last at 35.2 min
- bash calls naming a task: expr 98, oxvg 105, scriggo 96, tengo 83, wasmi 102
- write/edit calls on a task's files (agents): expr 14 (2), oxvg 8 (3), scriggo 9 (1), tengo 4 (2), wasmi 18 (2)

## e25-rclock-r4

- tokens 25.8M, $0.42, 39.5 minutes, end all_done, agents with tool calls 12
- events: attach 461, check 1, done 12, enter 12, post 228, run_end 1, run_start 1, tool 933, usage 792, wake 1
- tool calls: bash 423, done 12, edit 66, post 155, read 213, role 61, write 3
- done calls 12, first at 14.0 min, last at 39.5 min
- bash calls naming a task: expr 67, oxvg 117, scriggo 103, tengo 115, wasmi 98
- write/edit calls on a task's files (agents): expr 5 (2), oxvg 9 (6), scriggo 6 (2), tengo 35 (2), wasmi 13 (3)

