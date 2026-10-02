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
