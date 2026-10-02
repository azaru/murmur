# Round 5B: coordination events per batch

Counted from each batch's `runs/*/events.jsonl` (raw files are not in git). Arms R and E only: arm I has no board.
"Folders per agent" is how many distinct task folders each agent claimed, a measure of re-allocation.

| batch | score | tokens | end | claims | posts | help signals | findings | folders per agent |
|---|---:|---:|---|---:|---:|---:|---:|---|
| L1-E-r0 | 0.721 | 6.03M | budget | 9 | 12 | 5 | 1 | finch 1, lark 3, robin 2, wren 3 |
| L1-E-r1 | 0.643 | 6.04M | budget | 14 | 10 | 5 | 2 | finch 4, lark 3, robin 1, wren 4 |
| L1-E-r2 | 0.415 | 2.74M | all_done | 8 | 4 | 5 | 1 | finch 2, lark 1, robin 2, wren 3 |
| L1-R-r0 | 0.359 | 1.58M | all_done | 5 | 0 | 0 | 0 | finch 1, lark 1, robin 2, wren 1 |
| L1-R-r1 | 0.430 | 1.43M | quiescent | 11 | 0 | 0 | 0 | finch 1, lark 3, robin 2, wren 4 |
| L1-R-r2 | 0.226 | 1.46M | all_done | 7 | 0 | 0 | 0 | finch 3, lark 1, robin 2, wren 1 |
| L3-E-r0 | 0.414 | 0.44M | all_done | 7 | 2 | 1 | 1 | finch 1, lark 1, robin 2, wren 2 |
| L3-E-r1 | 0.431 | 0.42M | all_done | 8 | 5 | 0 | 0 | finch 4, lark 1, robin 1, wren 1 |
| L3-E-r2 | 0.512 | 0.66M | all_done | 12 | 7 | 1 | 1 | finch 4, lark 2, robin 4, wren 2 |
| L3-R-r0 | 0.407 | 0.58M | quiescent | 8 | 0 | 0 | 0 | finch 3, lark 1, robin 3, wren 1 |
| L3-R-r1 | 0.312 | 0.52M | quiescent | 9 | 0 | 0 | 0 | finch 3, lark 3, robin 1, wren 2 |
| L3-R-r2 | 0.598 | 0.34M | all_done | 8 | 0 | 0 | 0 | finch 1, lark 3, robin 3, wren 1 |

## Round 6B: coordination events per batch

Counted from each batch's `runs/run/events.jsonl` (EC) and `<task>/runs/run/{result.json,wren.messages.json}` (IC); raw files are not in git. Arm EC is b-swarm-clock (4 agents, all 4 tasks, 6M shared); arm IC is c4g-clock (4 isolated agents, one task each, 1.5M each). Columns in the EC table are counted exactly as in the Round 5B table above (claims, posts and findings are `tool` events of that name, help signals are `help` events, folders per agent are distinct `claim` paths); the 5B rows were recomputed with the same script and match.

| batch | score | tokens | end | claims | posts | help signals | findings | folders per agent |
|---|---:|---:|---|---:|---:|---:|---:|---|
| L1-EC-r0 | 0.977 | 6.04M | budget | 7 | 15 | 2 | 3 | finch 1, lark 2, robin 2, wren 2 |
| L1-EC-r1 | 0.936 | 6.04M | budget | 4 | 15 | 2 | 1 | finch 1, lark 1, robin 1, wren 1 |
| L1-EC-r2 | 0.850 | 6.01M | budget | 7 | 19 | 3 | 1 | finch 1, lark 3, robin 1, wren 2 |

IC table. Score is the hidden-grader score from `batch-result.json`; tokens, end and minutes come from the task's `result.json` (end `budget` means the 1.5M per-agent cap); tool calls are all tool calls in the agent's transcript; checks are `bash` calls running `npm run test`; "green at" is the call number of the first such check without an error or non-zero exit, and "after green" the tool calls made after it; "last check" is the outcome of the final check call.

| batch | task | score | tokens | end | min | tool calls | checks | green at | after green | last check |
|---|---|---:|---:|---|---:|---:|---:|---:|---:|---|
| L1-IC-r0 | ieh | 1.000 | 1.53M | budget | 11.3 | 62 | 10 | 37 | 25 | green |
| L1-IC-r0 | durable | 0.981 | 1.05M | quiescent | 7.7 | 57 | 9 | 28 | 29 | green |
| L1-IC-r0 | ledger | 1.000 | 0.67M | all_done | 5.9 | 40 | 7 | 11 | 29 | green |
| L1-IC-r0 | ieh2 | 0.896 | 1.53M | budget | 7.5 | 58 | 9 | - | - | red |
| L1-IC-r1 | ieh | 0.971 | 1.52M | budget | 10.7 | 60 | 5 | 30 | 30 | green |
| L1-IC-r1 | durable | 0.995 | 1.53M | budget | 10.5 | 69 | 10 | 18 | 51 | red |
| L1-IC-r1 | ledger | 1.000 | 1.05M | all_done | 9.3 | 48 | 7 | 7 | 41 | green |
| L1-IC-r1 | ieh2 | 0.973 | 1.53M | budget | 7.4 | 58 | 9 | 57 | 1 | green |
| L1-IC-r2 | ieh | 0.920 | 0.68M | all_done | 5.2 | 31 | 7 | 15 | 16 | green |
| L1-IC-r2 | durable | 0.988 | 0.84M | quiescent | 6.4 | 52 | 10 | 17 | 35 | green |
| L1-IC-r2 | ledger | 1.000 | 0.66M | quiescent | 5.8 | 43 | 8 | 24 | 19 | green |
| L1-IC-r2 | ieh2 | 0.380 | 1.52M | budget | 8.8 | 60 | 7 | - | - | red |
