# Round 12: file-tool health per run (`node scripts/writes.mjs` on the four round-12 campaigns)

| run | arm | score | tokens | writes | shrinking through | shrinking refused | refused | appends | edits | edit fails | wasted calls | lost at end |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| eb5e6f59/0001 | pi | 0.515 | 0.18M | 2 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | - |
| eb5e6f59/0002 | solo-clock | 0.758 | 0.40M | 1 | 0 | 0 | 0 | 0 | 8 | 2 | 6 | - |
| eb5e6f59/0003 | solo-clock-tools | 0.797 | 0.56M | 1 | 0 | 0 | 0 | 1 | 5 | 2 | 6 | - |
| eb5e6f59/0004 | solo-clock-tools-noguard | 0.926 | 1.37M | 1 | 0 | 0 | 0 | 2 | 14 | 3 | 7 | - |
| eb5e6f59/0005 | solo-clock-append | 1.000 | 1.54M | 1 | 0 | 0 | 0 | 2 | 14 | 1 | 3 | - |
| d6a79cc8/0001 | pi | 0.463 | 0.09M | 2 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | - |
| d6a79cc8/0002 | solo-clock | 0.912 | 1.27M | 4 | 0 | 1 | 1 | 0 | 11 | 3 | 13 | - |
| d6a79cc8/0003 | solo-clock-tools | 0.543 | 1.11M | 1 | 0 | 0 | 0 | 2 | 14 | 2 | 7 | - |
| d6a79cc8/0004 | solo-clock-tools-noguard | 0.965 | 2.01M | 1 | 0 | 0 | 0 | 0 | 14 | 1 | 3 | - |
| d6a79cc8/0005 | solo-clock-append | 0.402 | 1.21M | 1 | 0 | 0 | 0 | 2 | 13 | 2 | 9 | - |
| 91dce613/0001 | pi | 0.526 | 0.08M | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | - |
| 91dce613/0002 | solo-clock | 1.000 | 1.27M | 4 | 0 | 0 | 2 | 0 | 10 | 3 | 15 | - |
| 91dce613/0003 | solo-clock-tools | 0.920 | 0.53M | 1 | 0 | 0 | 0 | 2 | 12 | 3 | 15 | - |
| 91dce613/0004 | solo-clock-tools-noguard | 0.999 | 0.91M | 1 | 0 | 0 | 0 | 2 | 9 | 2 | 6 | - |
| 91dce613/0005 | solo-clock-append | 1.000 | 1.91M | 1 | 0 | 0 | 0 | 1 | 22 | 6 | 18 | - |
| b6187a74/0001 | pi | 0.270 | 0.28M | 1 | 0 | 0 | 0 | 0 | 6 | 3 | 7 | - |
| b6187a74/0002 | solo-clock | 0.965 | 0.85M | 3 | 0 | 1 | 1 | 0 | 12 | 5 | 16 | - |
| b6187a74/0003 | solo-clock-tools | 0.727 | 0.80M | 1 | 0 | 0 | 0 | 2 | 12 | 3 | 10 | - |
| b6187a74/0004 | solo-clock-tools-noguard | 1.000 | 1.07M | 1 | 0 | 0 | 0 | 2 | 12 | 3 | 10 | - |
| b6187a74/0005 | solo-clock-append | 0.971 | 1.26M | 1 | 0 | 0 | 0 | 2 | 13 | 5 | 16 | - |

| arm | runs | mean score | mean tokens | shrinking through | shrinking refused | refused | runs with lost content | appends | edit failure rate | wasted calls per run |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| pi | 4 | 0.443 | 0.16M | 0 | 0 | 0 | 0 | 0 | 33.3% | 1.8 |
| solo-clock | 4 | 0.909 | 0.95M | 0 | 2 | 4 | 0 | 0 | 31.7% | 12.5 |
| solo-clock-append | 4 | 0.843 | 1.48M | 0 | 0 | 0 | 0 | 7 | 22.6% | 11.5 |
| solo-clock-tools | 4 | 0.747 | 0.75M | 0 | 0 | 0 | 0 | 7 | 23.3% | 9.5 |
| solo-clock-tools-noguard | 4 | 0.972 | 1.34M | 0 | 0 | 0 | 0 | 6 | 18.4% | 6.5 |
