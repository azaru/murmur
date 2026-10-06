# Round 20: coordination summary per batch

Generated with `python3 experiments/deepswe/traces.py <batch>...` from each batch's `murmur/run/events.jsonl` (the raw run directories stay out of git). Process measures (`comm.py`) are in `plan.md`. The first runs of `e20-stagger-status-r1` and `e20-stagger-tasks-r1` failed on the model API ("fetch failed" at 18:58 UTC, no tool call) and were rerun; their data is in `runs/<id>-fetchfail/`.

## e20-stagger-r0

- tokens 32.0M, $0.52, 19.3 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 521, check 1, done 8, enter 12, post 170, run_end 1, run_start 1, tool 993, usage 895
- tool calls: bash 381, done 8, edit 137, post 170, read 291, write 6
- done calls 8, first at 1.3 min, last at 19.3 min
- bash calls naming a task: expr 70, oxvg 20, scriggo 27, tengo 121, wasmi 130
- write/edit calls on a task's files (agents): expr 45 (2), oxvg 0 (0), scriggo 6 (1), tengo 53 (3), wasmi 38 (4)

## e20-stagger-r1

- tokens 32.0M, $0.52, 15.0 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 526, check 1, done 6, enter 12, post 173, run_end 1, run_start 1, tool 1028, usage 838
- tool calls: bash 463, done 6, edit 103, post 173, read 277, write 6
- done calls 6, first at 2.2 min, last at 14.1 min
- bash calls naming a task: expr 30, oxvg 41, scriggo 224, tengo 62, wasmi 97
- write/edit calls on a task's files (agents): expr 0 (0), oxvg 0 (0), scriggo 46 (5), tengo 31 (1), wasmi 32 (3)

## e20-stagger-depart-r0

- tokens 32.0M, $0.51, 12.9 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 581, check 1, done 5, enter 12, post 189, run_end 1, run_start 1, tool 991, usage 870
- tool calls: bash 381, done 5, edit 101, post 184, read 310, write 10
- done calls 5, first at 1.5 min, last at 12.5 min
- bash calls naming a task: expr 41, oxvg 82, scriggo 116, tengo 59, wasmi 76
- write/edit calls on a task's files (agents): expr 18 (1), oxvg 3 (1), scriggo 46 (3), tengo 15 (1), wasmi 29 (2)

## e20-stagger-depart-r1

- tokens 32.0M, $0.52, 13.9 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 562, check 1, done 5, enter 12, post 181, run_end 1, run_start 1, tool 977, usage 878, wake 1
- tool calls: bash 336, done 5, edit 121, post 176, read 333, write 6
- done calls 5, first at 2.1 min, last at 10.5 min
- bash calls naming a task: expr 59, oxvg 13, scriggo 34, tengo 45, wasmi 182
- write/edit calls on a task's files (agents): expr 44 (3), oxvg 6 (1), scriggo 9 (1), tengo 22 (2), wasmi 46 (6)

## e20-stagger-status-r0

- tokens 32.0M, $0.51, 11.4 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 545, check 1, done 2, enter 12, post 161, run_end 1, run_start 1, tool 840, usage 798, wake 1
- tool calls: bash 304, done 2, edit 79, post 159, read 295, write 1
- done calls 2, first at 2.3 min, last at 10.0 min
- bash calls naming a task: expr 43, oxvg 73, scriggo 49, tengo 73, wasmi 57
- write/edit calls on a task's files (agents): expr 21 (2), oxvg 3 (1), scriggo 14 (2), tengo 28 (2), wasmi 14 (1)

## e20-stagger-status-r1

- tokens 32.0M, $0.49, 14.0 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 422, check 1, done 4, enter 12, post 166, run_end 1, run_start 1, tool 780, usage 696
- tool calls: bash 273, done 4, edit 66, post 162, read 263, write 12
- done calls 4, first at 2.2 min, last at 5.5 min
- bash calls naming a task: expr 47, oxvg 39, scriggo 75, tengo 83, wasmi 35
- write/edit calls on a task's files (agents): expr 9 (1), oxvg 13 (2), scriggo 10 (2), tengo 40 (5), wasmi 6 (1)

## e20-stagger-tasks-r0

- tokens 32.0M, $0.53, 14.4 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 526, check 1, done 3, enter 12, post 132, run_end 1, run_start 1, task_add 7, task_done 1, task_take 7, tool 919, usage 879
- tool calls: bash 312, done 3, edit 125, post 132, read 293, task_add 7, task_done 1, task_take 8, tasks 29, write 9
- done calls 3, first at 3.7 min, last at 9.8 min
- bash calls naming a task: expr 45, oxvg 28, scriggo 88, tengo 28, wasmi 113
- write/edit calls on a task's files (agents): expr 31 (2), oxvg 13 (1), scriggo 34 (3), tengo 4 (1), wasmi 52 (4)

## e20-stagger-tasks-r1

- tokens 32.0M, $0.52, 14.8 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 500, check 1, done 4, enter 12, post 128, run_end 1, run_start 1, task_add 10, task_done 2, task_drop 3, task_take 13, tool 970, usage 884
- tool calls: bash 326, done 4, edit 107, post 128, read 318, task_add 10, task_done 2, task_drop 3, task_take 18, tasks 49, write 5
- done calls 4, first at 1.6 min, last at 6.4 min
- bash calls naming a task: expr 40, oxvg 60, scriggo 82, tengo 86, wasmi 73
- write/edit calls on a task's files (agents): expr 17 (1), oxvg 8 (1), scriggo 20 (2), tengo 41 (3), wasmi 26 (2)

