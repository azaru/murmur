# Round 27: coordination summary per batch

Generated with `python3 experiments/deepswe/traces.py <batch>...` from each batch's `murmur/run/events.jsonl` (the raw run directories stay out of git). Weights, shared items, decompositions and expr-core edits are in `plan.md`. No run failed.

## e27-rweights-r0

- tokens 32.0M, $0.54, 9.8 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 629, check 1, done 1, enter 12, post 149, run_end 1, run_start 1, task_add 16, task_done 5, task_drop 2, task_take 20, tool 1044, usage 989, work_after_done 68
- tool calls: bash 293, done 1, edit 150, post 128, read 357, role 20, task_add 16, task_done 6, task_take 20, tasks 41, write 12
- done calls 1, first at 1.0 min, last at 1.0 min
- bash calls naming a task: expr 52, oxvg 21, scriggo 71, tengo 57, wasmi 103
- write/edit calls on a task's files (agents): expr 33 (3), oxvg 7 (1), scriggo 29 (3), tengo 40 (2), wasmi 53 (5)

## e27-rweights-r1

- tokens 32.0M, $0.53, 11.8 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 445, check 1, done 1, enter 12, post 112, run_end 1, run_start 1, task_add 16, task_done 5, task_drop 1, task_take 18, tool 954, usage 878
- tool calls: bash 289, done 1, edit 176, post 90, read 299, role 21, task_add 16, task_done 6, task_take 18, tasks 31, write 7
- done calls 1, first at 2.5 min, last at 2.5 min
- bash calls naming a task: expr 66, oxvg 57, scriggo 82, tengo 43, wasmi 46
- write/edit calls on a task's files (agents): expr 51 (3), oxvg 13 (2), scriggo 53 (2), tengo 45 (1), wasmi 21 (1)

## e27-rweights-r2

- tokens 32.0M, $0.53, 9.4 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 596, check 1, enter 12, post 167, run_end 1, run_start 1, task_add 23, task_done 11, task_drop 4, task_take 28, tool 1002, usage 922
- tool calls: bash 319, edit 95, post 134, read 298, role 33, task_add 23, task_done 11, task_drop 4, task_take 28, tasks 48, write 9
- bash calls naming a task: expr 24, oxvg 44, scriggo 92, tengo 78, wasmi 110
- write/edit calls on a task's files (agents): expr 0 (0), oxvg 2 (1), scriggo 28 (3), tengo 38 (2), wasmi 36 (3)

## e27-rweights-r3

- tokens 32.1M, $0.53, 8.7 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 588, check 1, done 1, enter 12, post 153, run_end 1, run_start 1, task_add 25, task_done 2, task_drop 3, task_take 20, tool 942, usage 918, work_after_done 70
- tool calls: bash 261, done 1, edit 118, post 121, read 307, role 31, task_add 25, task_done 2, task_drop 2, task_take 20, tasks 44, write 10
- done calls 1, first at 3.1 min, last at 3.1 min
- bash calls naming a task: expr 33, oxvg 32, scriggo 74, tengo 64, wasmi 83
- write/edit calls on a task's files (agents): expr 32 (1), oxvg 4 (2), scriggo 33 (3), tengo 32 (3), wasmi 27 (3)

## e27-rweights-r4

- tokens 32.0M, $0.54, 11.8 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 588, check 1, enter 12, post 174, run_end 1, run_start 1, task_add 17, task_done 8, task_take 23, tool 1060, usage 1002
- tool calls: bash 341, edit 108, post 140, read 332, role 34, task_add 17, task_done 10, task_take 25, tasks 36, write 17
- bash calls naming a task: expr 36, oxvg 38, scriggo 121, tengo 91, wasmi 76
- write/edit calls on a task's files (agents): expr 24 (1), oxvg 2 (1), scriggo 23 (5), tengo 45 (4), wasmi 31 (3)

