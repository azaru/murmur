# Round 19: coordination summary per batch

Generated from each batch's `murmur/run/events.jsonl` (the raw run directories stay out of git), as in [traces18.md](traces18.md). Only repetition 0 ran. The three wave-2 batches (`e19-stagger-threads-r0`, `e19-stagger-norms-r0`, `e19-stagger-tasks-r0`) hit the model's usage limit at about 10:12 UTC, 16 minutes after they started, so they are **invalid**: their counts below show mechanism use up to that point only, and their scores do not count. Write/edit calls on `TEAM.md` are listed for the file arm.

## e19-stagger-r0

- tokens 32.1M, $0.53, 39.2 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 380, check 1, done 11, enter 12, post 173, run_end 1, run_start 1, tool 912, usage 815
- tool calls: bash 364, done 11, edit 96, post 173, read 258, write 10
- done calls 11, first at 1.5 min, last at 32.6 min
- bash calls naming a task: expr 31, oxvg 44, scriggo 54, tengo 91, wasmi 114
- write/edit calls on a task's files (agents): expr 8 (1), oxvg 3 (1), scriggo 9 (2), tengo 36 (3), wasmi 50 (3)

## e19-stagger-tail-r0

- tokens 32.0M, $0.52, 27.9 minutes, end budget, agents with tool calls 12
- events: abort 1, attach 305, check 1, done 7, enter 12, post 113, run_end 1, run_start 1, tool 813, usage 724
- tool calls: bash 395, done 7, edit 91, post 113, read 205, write 2
- done calls 7, first at 1.4 min, last at 19.1 min
- bash calls naming a task: expr 154, oxvg 62, scriggo 118, tengo 38, wasmi 59
- write/edit calls on a task's files (agents): expr 15 (2), oxvg 13 (1), scriggo 47 (2), tengo 1 (1), wasmi 17 (2)

## e19-stagger-file-r0

- tokens 11.0M, $0.23, 28.1 minutes, end quiescent, agents with tool calls 12
- events: check 1, done 11, enter 12, run_end 1, run_start 1, tool 637, usage 573
- tool calls: bash 252, done 11, edit 133, read 231, write 10
- done calls 11, first at 1.4 min, last at 28.0 min
- bash calls naming a task: expr 30, oxvg 44, scriggo 76, tengo 66, wasmi 35
- write/edit calls on a task's files (agents): expr 10 (2), oxvg 2 (1), scriggo 10 (2), tengo 30 (3), wasmi 4 (1)
- write/edit calls on TEAM.md: 87

## Invalid batches (usage limit; mechanism use only)

### e19-stagger-threads-r0

- tokens 3.9M, $0.12, 25.6 minutes, end quiescent, agents with tool calls 12
- events: attach 118, check 1, done 3, enter 12, post 54, run_end 1, run_start 1, thread 10, tool 472, usage 291
- tool calls: bash 179, done 3, edit 17, read 135, reply 44, thread_list 24, thread_new 10, thread_read 59, write 1
- done calls 3, first at 3.2 min, last at 12.5 min
- bash calls naming a task: expr 29, oxvg 45, scriggo 28, tengo 39, wasmi 26
- write/edit calls on a task's files (agents): expr 1 (1), oxvg 3 (2), scriggo 5 (1), tengo 6 (1), wasmi 3 (1)

### e19-stagger-norms-r0

- tokens 10.4M, $0.21, 23.0 minutes, end quiescent, agents with tool calls 12
- events: attach 308, check 1, done 4, enter 12, post 125, run_end 1, run_start 1, tool 582, usage 504
- tool calls: bash 244, done 4, edit 41, post 125, read 160, write 8
- done calls 4, first at 2.4 min, last at 13.5 min
- bash calls naming a task: expr 35, oxvg 30, scriggo 26, tengo 83, wasmi 58
- write/edit calls on a task's files (agents): expr 6 (2), oxvg 5 (1), scriggo 4 (1), tengo 17 (3), wasmi 17 (2)

### e19-stagger-tasks-r0

- tokens 11.1M, $0.23, 28.2 minutes, end quiescent, agents with tool calls 12
- events: attach 282, check 1, done 5, enter 12, post 89, run_end 1, run_start 1, task_add 5, task_drop 2, task_take 7, tool 594, usage 557
- tool calls: bash 188, done 5, edit 49, post 89, read 199, task_add 5, task_drop 1, task_take 13, tasks 40, write 5
- done calls 5, first at 1.2 min, last at 5.3 min
- bash calls naming a task: expr 40, oxvg 39, scriggo 49, tengo 36, wasmi 18
- write/edit calls on a task's files (agents): expr 18 (2), oxvg 10 (3), scriggo 12 (2), tengo 12 (1), wasmi 2 (1)

