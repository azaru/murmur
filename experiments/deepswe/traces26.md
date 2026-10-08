# Round 26: coordination summary per batch

Generated with `python3 experiments/deepswe/traces.py <batch>...` from each batch's `murmur/run/events.jsonl` (the raw run directories stay out of git). Roles, task-list counts and expr-core edits are in `plan.md`. No run failed.

## e26-rtasks-r0

- tokens 32.0M, $0.52, 9.4 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 538, check 1, enter 12, post 141, run_end 1, run_start 1, task_add 11, task_done 6, task_take 11, tool 1013, usage 917
- tool calls: bash 330, edit 125, post 102, read 343, role 39, task_add 12, task_done 6, task_take 11, tasks 40, write 5
- bash calls naming a task: expr 104, oxvg 42, scriggo 46, tengo 95, wasmi 64
- write/edit calls on a task's files (agents): expr 46 (5), oxvg 1 (1), scriggo 22 (1), tengo 44 (2), wasmi 17 (5)

## e26-rtasks-r1

- tokens 32.0M, $0.52, 10.0 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 586, check 1, enter 12, post 164, run_end 1, run_start 1, task_add 4, task_done 2, task_take 4, tool 955, usage 916
- tool calls: bash 314, edit 112, post 131, read 298, role 33, task_add 4, task_done 2, task_take 4, tasks 49, write 8
- bash calls naming a task: expr 47, oxvg 38, scriggo 104, tengo 60, wasmi 95
- write/edit calls on a task's files (agents): expr 9 (3), oxvg 0 (0), scriggo 49 (4), tengo 35 (2), wasmi 27 (3)

## e26-rtasks-r2

- tokens 32.0M, $0.51, 10.7 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 496, check 1, enter 12, post 142, run_end 1, run_start 1, task_add 8, task_done 4, task_drop 1, task_take 5, tool 958, usage 854
- tool calls: bash 308, edit 114, post 116, read 321, role 26, task_add 8, task_done 5, task_drop 1, task_take 5, tasks 43, write 11
- bash calls naming a task: expr 48, oxvg 38, scriggo 84, tengo 90, wasmi 63
- write/edit calls on a task's files (agents): expr 20 (2), oxvg 1 (1), scriggo 36 (3), tengo 40 (3), wasmi 27 (2)

## e26-rtasks-r3

- tokens 32.0M, $0.53, 17.3 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 444, check 1, enter 12, post 144, run_end 1, run_start 1, task_add 9, task_done 3, task_drop 2, task_take 10, tool 1067, usage 910
- tool calls: bash 402, edit 143, post 112, read 297, role 32, task_add 9, task_done 3, task_drop 2, task_take 12, tasks 48, write 7
- bash calls naming a task: expr 62, oxvg 46, scriggo 159, tengo 81, wasmi 66
- write/edit calls on a task's files (agents): expr 26 (2), oxvg 3 (1), scriggo 54 (3), tengo 45 (2), wasmi 22 (1)

## e26-rtasks-r4

- tokens 32.1M, $0.55, 13.7 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 526, check 1, enter 12, post 166, run_end 1, run_start 1, task_add 12, task_done 5, task_drop 2, task_take 11, tool 1038, usage 916
- tool calls: bash 377, edit 106, post 129, read 293, role 37, task_add 12, task_done 5, task_drop 2, task_take 11, tasks 53, write 13
- bash calls naming a task: expr 75, oxvg 68, scriggo 108, tengo 97, wasmi 59
- write/edit calls on a task's files (agents): expr 26 (4), oxvg 11 (3), scriggo 31 (2), tengo 34 (2), wasmi 17 (1)

