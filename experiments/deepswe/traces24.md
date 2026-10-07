# Round 24: coordination summary per batch

Generated with `python3 experiments/deepswe/traces.py <batch>...` from each batch's `murmur/run/events.jsonl` (the raw run directories stay out of git). Revivals, mentions and task-list counts are in `plan.md`. Batches `e24-mention-r0..r2` and `e24-mtasks-r0..r1` ran code `cd5cfde`, the rest `3e52e3e` (see the deviation in `plan.md`). No run failed.

## e24-mention-r0

- tokens 32.0M, $0.51, 18.1 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 330, check 1, done 8, enter 12, post 118, revive 1, run_end 1, run_start 1, tool 944, usage 815, wake 1
- tool calls: bash 351, done 8, edit 165, post 110, read 307, write 3
- done calls 8, first at 1.2 min, last at 15.7 min
- bash calls naming a task: expr 54, oxvg 61, scriggo 77, tengo 72, wasmi 93
- write/edit calls on a task's files (agents): expr 47 (2), oxvg 9 (1), scriggo 32 (2), tengo 43 (1), wasmi 37 (2)

## e24-mention-r1

- tokens 32.1M, $0.49, 15.2 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 303, check 1, done 6, enter 12, post 97, revive 1, run_end 1, run_start 1, tool 930, usage 856, wake 1
- tool calls: bash 339, done 6, edit 162, post 91, read 327, write 5
- done calls 6, first at 0.6 min, last at 6.2 min
- bash calls naming a task: expr 56, oxvg 36, scriggo 124, tengo 50, wasmi 58
- write/edit calls on a task's files (agents): expr 37 (2), oxvg 3 (1), scriggo 60 (2), tengo 27 (2), wasmi 40 (2)

## e24-mention-r2

- tokens 32.0M, $0.51, 19.2 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 400, check 1, done 3, enter 12, post 137, run_end 1, run_start 1, tool 1024, usage 847, wake 1
- tool calls: bash 397, done 3, edit 142, post 134, read 341, write 7
- done calls 3, first at 7.8 min, last at 18.7 min
- bash calls naming a task: expr 110, oxvg 26, scriggo 69, tengo 80, wasmi 100
- write/edit calls on a task's files (agents): expr 54 (3), oxvg 3 (1), scriggo 21 (2), tengo 38 (2), wasmi 32 (3)

## e24-mention-r3

- tokens 32.0M, $0.49, 12.1 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 508, check 1, done 5, enter 12, post 168, revive 1, run_end 1, run_start 1, tool 949, usage 843, wake 1
- tool calls: bash 305, done 5, edit 123, post 163, read 351, write 2
- done calls 5, first at 1.6 min, last at 6.9 min
- bash calls naming a task: expr 53, oxvg 45, scriggo 37, tengo 49, wasmi 112
- write/edit calls on a task's files (agents): expr 32 (3), oxvg 7 (2), scriggo 4 (1), tengo 32 (1), wasmi 50 (5)

## e24-mention-r4

- tokens 32.1M, $0.51, 17.4 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 413, check 1, done 4, enter 12, post 164, revive 2, run_end 1, run_start 1, tool 968, usage 826, wake 2
- tool calls: bash 379, done 4, edit 124, post 160, read 294, write 7
- done calls 4, first at 1.0 min, last at 3.0 min
- bash calls naming a task: expr 70, oxvg 45, scriggo 116, tengo 89, wasmi 82
- write/edit calls on a task's files (agents): expr 34 (3), oxvg 4 (1), scriggo 44 (3), tengo 34 (2), wasmi 15 (3)

## e24-mtasks-r0

- tokens 32.0M, $0.50, 10.8 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 479, check 1, done 5, enter 12, post 129, run_end 1, run_start 1, task_add 13, task_assign 10, task_done 4, task_drop 5, task_take 7, tool 898, usage 809
- tool calls: bash 279, done 5, edit 116, post 114, read 299, task_add 13, task_assign 3, task_done 4, task_drop 5, task_take 8, tasks 48, write 4
- done calls 5, first at 1.7 min, last at 9.2 min
- bash calls naming a task: expr 25, oxvg 46, scriggo 40, tengo 88, wasmi 78
- write/edit calls on a task's files (agents): expr 25 (1), oxvg 20 (1), scriggo 15 (1), tengo 38 (2), wasmi 22 (3)

## e24-mtasks-r1

- tokens 32.0M, $0.51, 16.9 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 374, check 1, done 8, enter 12, post 133, revive 7, run_end 1, run_start 1, task_add 10, task_assign 6, task_drop 5, task_take 5, tool 960, usage 815, wake 8, write_refused 1
- tool calls: bash 315, done 8, edit 123, post 119, read 316, task_add 10, task_assign 6, task_drop 4, task_take 8, tasks 40, write 11
- done calls 8, first at 1.4 min, last at 15.6 min
- bash calls naming a task: expr 69, oxvg 43, scriggo 60, tengo 51, wasmi 97
- write/edit calls on a task's files (agents): expr 40 (2), oxvg 5 (1), scriggo 20 (1), tengo 23 (2), wasmi 46 (4)

## e24-mtasks-r2

- tokens 32.0M, $0.49, 18.4 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 201, check 1, done 8, enter 12, post 66, run_end 1, run_start 1, task_add 11, task_assign 6, task_done 3, task_drop 3, task_take 5, tool 835, usage 719
- tool calls: bash 313, done 8, edit 129, post 52, read 279, task_add 11, task_assign 5, task_done 3, task_drop 1, task_take 5, tasks 24, write 5
- done calls 8, first at 1.6 min, last at 9.9 min
- bash calls naming a task: expr 58, oxvg 51, scriggo 44, tengo 73, wasmi 84
- write/edit calls on a task's files (agents): expr 40 (2), oxvg 12 (1), scriggo 12 (2), tengo 32 (2), wasmi 37 (2)

## e24-mtasks-r3

- tokens 32.1M, $0.51, 9.3 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 445, check 1, done 4, enter 12, post 110, run_end 1, run_start 1, task_add 9, task_assign 6, task_drop 1, task_take 2, tool 876, usage 797
- tool calls: bash 291, done 4, edit 104, post 100, read 323, task_add 9, task_assign 6, task_take 3, tasks 30, write 6
- done calls 4, first at 2.3 min, last at 5.6 min
- bash calls naming a task: expr 20, oxvg 47, scriggo 37, tengo 67, wasmi 110
- write/edit calls on a task's files (agents): expr 17 (1), oxvg 6 (1), scriggo 9 (1), tengo 37 (2), wasmi 40 (6)

## e24-mtasks-r4

- tokens 32.0M, $0.51, 10.8 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 539, check 1, done 4, enter 12, post 163, revive 1, run_end 1, run_start 1, tool 916, usage 812, wake 2
- tool calls: bash 320, done 4, edit 95, post 159, read 306, tasks 25, write 7
- done calls 4, first at 1.6 min, last at 3.7 min
- bash calls naming a task: expr 51, oxvg 50, scriggo 81, tengo 45, wasmi 88
- write/edit calls on a task's files (agents): expr 23 (3), oxvg 3 (1), scriggo 22 (2), tengo 23 (1), wasmi 31 (2)

