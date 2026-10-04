# Round 16: per-run measures and per-agent traces

Generated 2026-10-04 21:26 from the campaigns listed in experiments/plan.md (round 16 stage A result and side test U result). Stage D (DeepSWE) is not a swarmtest campaign; its per-run results are in experiments/deepswe/results/.

# Stage A

## Per task x arm (scripts/n12.mjs)

| task | arm | runs | capped | mean score | mean tokens | mean minutes | mean agentsDone | mean calls | mean coordination | mean maxWriters | mean meanWriters | mean refused | mean adds | mean takes | mean taskDone | mean drops | mean branches | mean merges | mean conflicts | mean updates | mean unmergedAgents | mean unmergedFiles | mean lastEnter | scores |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| constrained_planning_hard_blind | n12-stagger-threads-tokens n=12 | 2 | 1 | 0.48 | 8.78M | 10.22 | 9.5 | 437.0 | 0.46 | 3.5 | 2.75 | 0.5 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 1.45 | 0.35 0.60 |
| constrained_planning_hard_blind | n12-stagger-tokens n=12 | 2 | 1 | 0.45 | 11.74M | 9.81 | 7.0 | 523.5 | 0.33 | 5.0 | 3.50 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 1.20 | 0.48 0.43 |
| constrained_planning_hard_blind | solo-clock-tokens n=1 | 2 | 0 | 0.49 | 0.93M | 9.73 | 1.0 | 43.5 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – | 0.33 0.65 |
| opt_shop2_blind | n12-stagger-threads-tokens n=12 | 2 | 0 | 0.46 | 9.71M | 7.15 | 12.0 | 540.0 | 0.45 | 5.5 | 2.92 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 1.05 | 0.45 0.48 |
| opt_shop2_blind | n12-stagger-tokens n=12 | 2 | 0 | 0.64 | 5.14M | 6.94 | 12.0 | 345.0 | 0.26 | 4.0 | 2.17 | 0.5 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 1.24 | 0.64 0.63 |
| opt_shop2_blind | solo-clock-tokens n=1 | 2 | 0 | 0.56 | 0.06M | 1.63 | 1.0 | 12.0 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – | 0.57 0.55 |

## Per run (scripts/n12.mjs --runs)

| campaign | run | task | arm | reason | roles | score | tokens | minutes | agentsDone | calls | coordination | maxWriters | meanWriters | refused | adds | takes | taskDone | drops | branches | merges | conflicts | updates | unmergedAgents | unmergedFiles | lastEnter |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 20261004T154422Z-5d32faf7 | run-0001 | constrained_planning_hard_blind | solo-clock-tokens n=1 | all_done |  | 0.33 | 0.62M | 8.37 | 1.0 | 35.0 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – |
| 20261004T155400Z-ec715fbc | run-0001 | constrained_planning_hard_blind | n12-stagger-tokens n=12 | budget |  | 0.48 | 12.02M | 6.07 | 2.0 | 566.0 | 0.31 | 7.0 | 4.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 1.13 |
| 20261004T160123Z-f88d7d38 | run-0001 | constrained_planning_hard_blind | n12-stagger-threads-tokens n=12 | all_done |  | 0.35 | 5.53M | 11.82 | 12.0 | 343.0 | 0.42 | 3.0 | 3.00 | 1.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 1.96 |
| 20261004T161433Z-b8573bf5 | run-0001 | opt_shop2_blind | solo-clock-tokens n=1 | all_done |  | 0.57 | 0.07M | 1.77 | 1.0 | 11.0 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – |
| 20261004T161628Z-9d9938d8 | run-0001 | opt_shop2_blind | n12-stagger-tokens n=12 | all_done |  | 0.64 | 7.36M | 8.47 | 12.0 | 438.0 | 0.22 | 5.0 | 1.33 | 1.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 1.21 |
| 20261004T162502Z-2d378749 | run-0001 | opt_shop2_blind | n12-stagger-threads-tokens n=12 | all_done |  | 0.45 | 10.93M | 7.57 | 12.0 | 565.0 | 0.45 | 5.0 | 2.33 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 1.15 |
| 20261004T163242Z-c89a315a | run-0001 | constrained_planning_hard_blind | solo-clock-tokens n=1 | all_done |  | 0.65 | 1.23M | 11.09 | 1.0 | 52.0 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – |
| 20261004T164501Z-9e697046 | run-0001 | constrained_planning_hard_blind | n12-stagger-tokens n=12 | all_done |  | 0.43 | 11.46M | 13.54 | 12.0 | 481.0 | 0.34 | 3.0 | 3.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 1.26 |
| 20261004T165922Z-25fef1a5 | run-0001 | constrained_planning_hard_blind | n12-stagger-threads-tokens n=12 | budget |  | 0.60 | 12.03M | 8.63 | 7.0 | 531.0 | 0.49 | 4.0 | 2.50 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.93 |
| 20261004T170924Z-fd773a08 | run-0001 | opt_shop2_blind | solo-clock-tokens n=1 | all_done |  | 0.55 | 0.06M | 1.50 | 1.0 | 13.0 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – |
| 20261004T171102Z-c2362101 | run-0001 | opt_shop2_blind | n12-stagger-tokens n=12 | all_done |  | 0.63 | 2.91M | 5.41 | 12.0 | 252.0 | 0.30 | 3.0 | 3.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 1.26 |
| 20261004T171634Z-37116428 | run-0001 | opt_shop2_blind | n12-stagger-threads-tokens n=12 | all_done |  | 0.48 | 8.49M | 6.74 | 12.0 | 515.0 | 0.46 | 6.0 | 3.50 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.95 |

| task | arm | runs | capped | mean score | mean tokens | mean minutes | mean agentsDone | mean calls | mean coordination | mean maxWriters | mean meanWriters | mean refused | mean adds | mean takes | mean taskDone | mean drops | mean branches | mean merges | mean conflicts | mean updates | mean unmergedAgents | mean unmergedFiles | mean lastEnter | scores |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| constrained_planning_hard_blind | n12-stagger-threads-tokens n=12 | 2 | 1 | 0.48 | 8.78M | 10.22 | 9.5 | 437.0 | 0.46 | 3.5 | 2.75 | 0.5 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 1.45 | 0.35 0.60 |
| constrained_planning_hard_blind | n12-stagger-tokens n=12 | 2 | 1 | 0.45 | 11.74M | 9.81 | 7.0 | 523.5 | 0.33 | 5.0 | 3.50 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 1.20 | 0.48 0.43 |
| constrained_planning_hard_blind | solo-clock-tokens n=1 | 2 | 0 | 0.49 | 0.93M | 9.73 | 1.0 | 43.5 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – | 0.33 0.65 |
| opt_shop2_blind | n12-stagger-threads-tokens n=12 | 2 | 0 | 0.46 | 9.71M | 7.15 | 12.0 | 540.0 | 0.45 | 5.5 | 2.92 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 1.05 | 0.45 0.48 |
| opt_shop2_blind | n12-stagger-tokens n=12 | 2 | 0 | 0.64 | 5.14M | 6.94 | 12.0 | 345.0 | 0.26 | 4.0 | 2.17 | 0.5 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 1.24 | 0.64 0.63 |
| opt_shop2_blind | solo-clock-tokens n=1 | 2 | 0 | 0.56 | 0.06M | 1.63 | 1.0 | 12.0 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – | 0.57 0.55 |

## Per agent (scripts/traces.mjs)

| run | task | arm | score | tokens | min | end | agent | calls | board % | checks | green at | after green | last check | overwrites | nudges |
|---|---|---|---:|---:|---:|---|---|---:|---:|---:|---:|---:|---|---:|---:|
| 5d32faf7/0001 | constrained_planning_hard_blind | murmur[solo-clock-tokens]/n=1 | 0.334 | 0.62M | 8.4 | all_done | wren | 35 | 3 | 6 | 11 | 24 | green | 0 | 0 |
| ec715fbc/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.479 | 12.02M | 6.1 | budget | crane | 44 | 32 | 1 | 15 | 29 | green | 0 | 0 |
| ec715fbc/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.479 | 12.02M | 6.1 | budget | dunlin | 37 | 19 | 3 | 23 | 14 | green | 0 | 0 |
| ec715fbc/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.479 | 12.02M | 6.1 | budget | finch | 45 | 16 | 1 | 39 | 6 | green | 0 | 0 |
| ec715fbc/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.479 | 12.02M | 6.1 | budget | heron | 51 | 41 | 1 | 47 | 4 | green | 0 | 0 |
| ec715fbc/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.479 | 12.02M | 6.1 | budget | kite | 65 | 43 | 2 | 40 | 25 | red | 0 | 0 |
| ec715fbc/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.479 | 12.02M | 6.1 | budget | lark | 53 | 38 | 1 | 35 | 18 | green | 0 | 0 |
| ec715fbc/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.479 | 12.02M | 6.1 | budget | linnet | 51 | 27 | 3 | 11 | 40 | green | 0 | 0 |
| ec715fbc/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.479 | 12.02M | 6.1 | budget | plover | 49 | 31 | 3 | 29 | 20 | green | 0 | 0 |
| ec715fbc/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.479 | 12.02M | 6.1 | budget | robin | 43 | 35 | 1 | 30 | 13 | green | 0 | 0 |
| ec715fbc/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.479 | 12.02M | 6.1 | budget | swift | 46 | 35 | 1 | 43 | 3 | green | 0 | 0 |
| ec715fbc/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.479 | 12.02M | 6.1 | budget | tern | 52 | 31 | 1 | - | - | red | 0 | 0 |
| ec715fbc/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.479 | 12.02M | 6.1 | budget | wren | 35 | 11 | 1 | 24 | 11 | green | 0 | 0 |
| f88d7d38/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.354 | 5.53M | 11.8 | all_done | crane | 24 | 63 | 0 | - | - | none | 0 | 0 |
| f88d7d38/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.354 | 5.53M | 11.8 | all_done | dunlin | 26 | 46 | 1 | 16 | 10 | green | 0 | 0 |
| f88d7d38/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.354 | 5.53M | 11.8 | all_done | finch | 58 | 31 | 6 | 17 | 41 | green | 0 | 0 |
| f88d7d38/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.354 | 5.53M | 11.8 | all_done | heron | 26 | 42 | 1 | 15 | 11 | green | 0 | 0 |
| f88d7d38/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.354 | 5.53M | 11.8 | all_done | kite | 32 | 47 | 1 | 9 | 23 | green | 0 | 0 |
| f88d7d38/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.354 | 5.53M | 11.8 | all_done | lark | 37 | 57 | 0 | - | - | none | 0 | 0 |
| f88d7d38/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.354 | 5.53M | 11.8 | all_done | linnet | 26 | 50 | 1 | 16 | 10 | green | 0 | 0 |
| f88d7d38/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.354 | 5.53M | 11.8 | all_done | plover | 23 | 48 | 0 | - | - | none | 0 | 0 |
| f88d7d38/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.354 | 5.53M | 11.8 | all_done | robin | 23 | 43 | 1 | 20 | 3 | green | 0 | 0 |
| f88d7d38/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.354 | 5.53M | 11.8 | all_done | swift | 24 | 54 | 0 | - | - | none | 0 | 0 |
| f88d7d38/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.354 | 5.53M | 11.8 | all_done | tern | 20 | 40 | 1 | 13 | 7 | green | 0 | 0 |
| f88d7d38/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.354 | 5.53M | 11.8 | all_done | wren | 24 | 38 | 3 | 11 | 13 | green | 0 | 0 |
| b8573bf5/0001 | opt_shop2_blind | murmur[solo-clock-tokens]/n=1 | 0.565 | 0.07M | 1.8 | all_done | wren | 11 | 9 | 1 | 10 | 1 | green | 0 | 0 |
| 9d9938d8/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.639 | 7.36M | 8.5 | all_done | crane | 41 | 15 | 1 | 37 | 4 | green | 0 | 0 |
| 9d9938d8/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.639 | 7.36M | 8.5 | all_done | dunlin | 47 | 34 | 2 | 33 | 14 | green | 0 | 0 |
| 9d9938d8/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.639 | 7.36M | 8.5 | all_done | finch | 33 | 15 | 3 | 12 | 21 | green | 0 | 0 |
| 9d9938d8/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.639 | 7.36M | 8.5 | all_done | heron | 60 | 22 | 1 | 58 | 2 | green | 0 | 0 |
| 9d9938d8/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.639 | 7.36M | 8.5 | all_done | kite | 45 | 36 | 2 | 18 | 27 | green | 0 | 0 |
| 9d9938d8/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.639 | 7.36M | 8.5 | all_done | lark | 33 | 27 | 1 | 32 | 1 | green | 0 | 0 |
| 9d9938d8/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.639 | 7.36M | 8.5 | all_done | linnet | 41 | 17 | 2 | 31 | 10 | green | 0 | 0 |
| 9d9938d8/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.639 | 7.36M | 8.5 | all_done | plover | 36 | 22 | 2 | 20 | 16 | green | 0 | 0 |
| 9d9938d8/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.639 | 7.36M | 8.5 | all_done | robin | 9 | 22 | 1 | 5 | 4 | green | 0 | 0 |
| 9d9938d8/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.639 | 7.36M | 8.5 | all_done | swift | 34 | 29 | 0 | - | - | none | 0 | 0 |
| 9d9938d8/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.639 | 7.36M | 8.5 | all_done | tern | 22 | 36 | 0 | - | - | none | 0 | 0 |
| 9d9938d8/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.639 | 7.36M | 8.5 | all_done | wren | 37 | 24 | 2 | 6 | 31 | green | 0 | 0 |
| 2d378749/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.451 | 10.93M | 7.6 | all_done | crane | 48 | 63 | 2 | 15 | 33 | green | 0 | 0 |
| 2d378749/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.451 | 10.93M | 7.6 | all_done | dunlin | 66 | 52 | 2 | 17 | 49 | green | 0 | 0 |
| 2d378749/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.451 | 10.93M | 7.6 | all_done | finch | 47 | 30 | 3 | 31 | 16 | green | 0 | 0 |
| 2d378749/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.451 | 10.93M | 7.6 | all_done | heron | 45 | 51 | 1 | 41 | 4 | green | 0 | 0 |
| 2d378749/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.451 | 10.93M | 7.6 | all_done | kite | 37 | 57 | 2 | 15 | 22 | green | 0 | 0 |
| 2d378749/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.451 | 10.93M | 7.6 | all_done | lark | 47 | 51 | 2 | 40 | 7 | green | 0 | 0 |
| 2d378749/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.451 | 10.93M | 7.6 | all_done | linnet | 43 | 40 | 3 | 18 | 25 | green | 0 | 0 |
| 2d378749/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.451 | 10.93M | 7.6 | all_done | plover | 31 | 32 | 1 | 28 | 3 | green | 0 | 0 |
| 2d378749/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.451 | 10.93M | 7.6 | all_done | robin | 40 | 25 | 4 | 17 | 23 | green | 0 | 0 |
| 2d378749/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.451 | 10.93M | 7.6 | all_done | swift | 53 | 51 | 2 | 17 | 36 | green | 0 | 0 |
| 2d378749/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.451 | 10.93M | 7.6 | all_done | tern | 48 | 52 | 2 | 39 | 9 | green | 0 | 0 |
| 2d378749/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.451 | 10.93M | 7.6 | all_done | wren | 60 | 48 | 3 | 21 | 39 | green | 0 | 0 |
| c89a315a/0001 | constrained_planning_hard_blind | murmur[solo-clock-tokens]/n=1 | 0.650 | 1.23M | 11.1 | all_done | wren | 52 | 2 | 6 | 7 | 45 | green | 0 | 0 |
| 9e697046/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.430 | 11.46M | 13.5 | all_done | crane | 28 | 36 | 1 | 22 | 6 | green | 0 | 0 |
| 9e697046/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.430 | 11.46M | 13.5 | all_done | dunlin | 50 | 38 | 2 | 18 | 32 | green | 0 | 0 |
| 9e697046/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.430 | 11.46M | 13.5 | all_done | finch | 24 | 25 | 1 | 21 | 3 | green | 0 | 0 |
| 9e697046/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.430 | 11.46M | 13.5 | all_done | heron | 25 | 28 | 1 | 20 | 5 | green | 0 | 0 |
| 9e697046/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.430 | 11.46M | 13.5 | all_done | kite | 43 | 37 | 1 | 42 | 1 | green | 0 | 0 |
| 9e697046/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.430 | 11.46M | 13.5 | all_done | lark | 53 | 49 | 1 | 41 | 12 | green | 0 | 0 |
| 9e697046/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.430 | 11.46M | 13.5 | all_done | linnet | 27 | 30 | 2 | 23 | 4 | green | 0 | 0 |
| 9e697046/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.430 | 11.46M | 13.5 | all_done | plover | 32 | 44 | 1 | 24 | 8 | green | 0 | 0 |
| 9e697046/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.430 | 11.46M | 13.5 | all_done | robin | 46 | 35 | 2 | 35 | 11 | green | 0 | 0 |
| 9e697046/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.430 | 11.46M | 13.5 | all_done | swift | 63 | 52 | 1 | 59 | 4 | green | 0 | 0 |
| 9e697046/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.430 | 11.46M | 13.5 | all_done | tern | 28 | 39 | 0 | - | - | none | 0 | 0 |
| 9e697046/0001 | constrained_planning_hard_blind | murmur[n12-stagger-tokens]/n=12 | 0.430 | 11.46M | 13.5 | all_done | wren | 62 | 16 | 5 | 25 | 37 | green | 0 | 0 |
| 25fef1a5/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.598 | 12.03M | 8.6 | budget | crane | 48 | 52 | 2 | 32 | 16 | green | 0 | 0 |
| 25fef1a5/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.598 | 12.03M | 8.6 | budget | dunlin | 54 | 59 | 3 | 28 | 26 | green | 0 | 0 |
| 25fef1a5/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.598 | 12.03M | 8.6 | budget | finch | 37 | 22 | 3 | 8 | 29 | red | 0 | 0 |
| 25fef1a5/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.598 | 12.03M | 8.6 | budget | heron | 53 | 51 | 3 | 28 | 25 | green | 0 | 0 |
| 25fef1a5/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.598 | 12.03M | 8.6 | budget | kite | 59 | 58 | 3 | 19 | 40 | green | 0 | 0 |
| 25fef1a5/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.598 | 12.03M | 8.6 | budget | lark | 48 | 50 | 2 | 22 | 26 | green | 0 | 0 |
| 25fef1a5/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.598 | 12.03M | 8.6 | budget | linnet | 26 | 58 | 0 | - | - | none | 0 | 0 |
| 25fef1a5/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.598 | 12.03M | 8.6 | budget | plover | 47 | 51 | 1 | 42 | 5 | green | 0 | 0 |
| 25fef1a5/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.598 | 12.03M | 8.6 | budget | robin | 55 | 53 | 2 | 38 | 17 | green | 0 | 0 |
| 25fef1a5/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.598 | 12.03M | 8.6 | budget | swift | 38 | 45 | 2 | 22 | 16 | green | 0 | 0 |
| 25fef1a5/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.598 | 12.03M | 8.6 | budget | tern | 11 | 55 | 0 | - | - | none | 0 | 0 |
| 25fef1a5/0001 | constrained_planning_hard_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.598 | 12.03M | 8.6 | budget | wren | 55 | 53 | 4 | 19 | 36 | green | 0 | 0 |
| fd773a08/0001 | opt_shop2_blind | murmur[solo-clock-tokens]/n=1 | 0.547 | 0.06M | 1.5 | all_done | wren | 13 | 8 | 1 | 10 | 3 | green | 0 | 0 |
| c2362101/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.633 | 2.91M | 5.4 | all_done | crane | 17 | 41 | 1 | 16 | 1 | green | 0 | 0 |
| c2362101/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.633 | 2.91M | 5.4 | all_done | dunlin | 14 | 21 | 1 | 10 | 4 | green | 0 | 0 |
| c2362101/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.633 | 2.91M | 5.4 | all_done | finch | 33 | 21 | 2 | 15 | 18 | green | 0 | 0 |
| c2362101/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.633 | 2.91M | 5.4 | all_done | heron | 16 | 38 | 1 | 13 | 3 | green | 0 | 0 |
| c2362101/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.633 | 2.91M | 5.4 | all_done | kite | 26 | 42 | 1 | 23 | 3 | green | 0 | 0 |
| c2362101/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.633 | 2.91M | 5.4 | all_done | lark | 16 | 38 | 1 | 14 | 2 | green | 0 | 0 |
| c2362101/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.633 | 2.91M | 5.4 | all_done | linnet | 16 | 25 | 0 | - | - | none | 0 | 0 |
| c2362101/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.633 | 2.91M | 5.4 | all_done | plover | 14 | 29 | 1 | 12 | 2 | green | 0 | 0 |
| c2362101/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.633 | 2.91M | 5.4 | all_done | robin | 41 | 41 | 1 | 31 | 10 | green | 0 | 0 |
| c2362101/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.633 | 2.91M | 5.4 | all_done | swift | 24 | 38 | 1 | 18 | 6 | green | 0 | 0 |
| c2362101/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.633 | 2.91M | 5.4 | all_done | tern | 18 | 33 | 1 | 16 | 2 | green | 0 | 0 |
| c2362101/0001 | opt_shop2_blind | murmur[n12-stagger-tokens]/n=12 | 0.633 | 2.91M | 5.4 | all_done | wren | 17 | 47 | 1 | 8 | 9 | green | 0 | 0 |
| 37116428/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.477 | 8.49M | 6.7 | all_done | crane | 43 | 37 | 1 | 38 | 5 | green | 0 | 0 |
| 37116428/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.477 | 8.49M | 6.7 | all_done | dunlin | 43 | 51 | 2 | 31 | 12 | green | 0 | 0 |
| 37116428/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.477 | 8.49M | 6.7 | all_done | finch | 37 | 38 | 2 | 23 | 14 | green | 0 | 0 |
| 37116428/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.477 | 8.49M | 6.7 | all_done | heron | 44 | 50 | 1 | 13 | 31 | green | 0 | 0 |
| 37116428/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.477 | 8.49M | 6.7 | all_done | kite | 44 | 50 | 1 | 42 | 2 | green | 0 | 0 |
| 37116428/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.477 | 8.49M | 6.7 | all_done | lark | 58 | 52 | 1 | 54 | 4 | green | 0 | 0 |
| 37116428/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.477 | 8.49M | 6.7 | all_done | linnet | 47 | 57 | 1 | 43 | 4 | green | 0 | 0 |
| 37116428/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.477 | 8.49M | 6.7 | all_done | plover | 39 | 54 | 1 | 36 | 3 | green | 0 | 0 |
| 37116428/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.477 | 8.49M | 6.7 | all_done | robin | 37 | 49 | 1 | 21 | 16 | green | 0 | 0 |
| 37116428/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.477 | 8.49M | 6.7 | all_done | swift | 39 | 28 | 4 | 18 | 21 | green | 0 | 0 |
| 37116428/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.477 | 8.49M | 6.7 | all_done | tern | 43 | 63 | 1 | 41 | 2 | green | 0 | 0 |
| 37116428/0001 | opt_shop2_blind | murmur[n12-stagger-threads-tokens]/n=12 | 0.477 | 8.49M | 6.7 | all_done | wren | 41 | 49 | 2 | 23 | 18 | green | 0 | 0 |

Why each agent stopped:
- 5d32faf7/0001 murmur[solo-clock-tokens]/n=1 wren: done: Implemented planner.py with standard-library candidate generation, constrained-first backtracking, hard-constraint checks, and unary soft-cost ordering. Verified example feasibility and confirmed npm 
- ec715fbc/0001 murmur[n12-stagger-tokens]/n=12 crane: last text: 
- ec715fbc/0001 murmur[n12-stagger-tokens]/n=12 dunlin: done: planner.py is implemented, compiles under isolated execution, passes npm smoke testing, and the example plan was independently validated with zero hard-constraint violations in about 0.25 seconds. Emp
- ec715fbc/0001 murmur[n12-stagger-tokens]/n=12 finch: last text: 
- ec715fbc/0001 murmur[n12-stagger-tokens]/n=12 heron: last text: 
- ec715fbc/0001 murmur[n12-stagger-tokens]/n=12 kite: last text: 
- ec715fbc/0001 murmur[n12-stagger-tokens]/n=12 lark: last text: 
- ec715fbc/0001 murmur[n12-stagger-tokens]/n=12 linnet: last text: 
- ec715fbc/0001 murmur[n12-stagger-tokens]/n=12 plover: last text: 
- ec715fbc/0001 murmur[n12-stagger-tokens]/n=12 robin: last text: 
- ec715fbc/0001 murmur[n12-stagger-tokens]/n=12 swift: done: Independently reviewed and tested the solver: example output passes all hard constraints and npm smoke test; reported critical solver issues to the team. No further changes needed from my side.
- ec715fbc/0001 murmur[n12-stagger-tokens]/n=12 tern: last text: 
- ec715fbc/0001 murmur[n12-stagger-tokens]/n=12 wren: last text: 
- f88d7d38/0001 murmur[n12-stagger-threads-tokens]/n=12 crane: done: Reviewed the planner, independently checked the sample assignment (my initial validator alert was a validator logic error), and confirmed with independent full validations that the generated plan sati
- f88d7d38/0001 murmur[n12-stagger-threads-tokens]/n=12 dunlin: done: Reviewed the complete hard-constraint contract and current planner.py, ran the acceptance smoke test (passes in ~0.2s), independently reviewed the generated plan and corrected a bug in my own validati
- f88d7d38/0001 murmur[n12-stagger-threads-tokens]/n=12 finch: done: Implemented planner.py with hard-constraint candidate generation, incremental CSP search, soft-score improvements, and lazy chair expansion for large domains. The example plan was independently valida
- f88d7d38/0001 murmur[n12-stagger-threads-tokens]/n=12 heron: done: Independently validated the current example plan against all hard constraints H01–H22 (zero violations) and confirmed objective 194. Reported results and remaining Cartesian-domain scaling risk to the
- f88d7d38/0001 murmur[n12-stagger-threads-tokens]/n=12 kite: done: Independently validated the current sample plan against H01–H22 with zero violations and computed its objective (194). Reported findings and safe scaling suggestions to the planner team; no further ed
- f88d7d38/0001 murmur[n12-stagger-threads-tokens]/n=12 lark: done: planner.py is implemented by the team, runs in 0.2s on the example, and independent validation confirms a feasible plan for H01-H22 with objective 194. I reviewed hard-constraint checks and reported r
- f88d7d38/0001 murmur[n12-stagger-threads-tokens]/n=12 linnet: done: planner.py is implemented, empty-window handling is corrected, npm smoke test passes in ~0.2s, and independent checks confirm the example plan satisfies H01–H22 with objective 194. I also independentl
- f88d7d38/0001 murmur[n12-stagger-threads-tokens]/n=12 plover: done: Reviewed the shared planner, independently ran it on the example, validated its assignments alongside the swarm’s H01–H22 checks, and calculated objective 194. Empty-window handling and first-feasible
- f88d7d38/0001 murmur[n12-stagger-threads-tokens]/n=12 robin: done: Reviewed the contract and current planner, reported edge cases and scaling concerns, and confirmed the smoke test passes in 0.2s. Multiple independent agents validated the generated example plan again
- f88d7d38/0001 murmur[n12-stagger-threads-tokens]/n=12 swift: done: Reviewed planner.py, ran the example after updates (0.20s), and reported the remaining worst-case Cartesian-domain generation risk. Teammates independently validated the generated example plan against
- f88d7d38/0001 murmur[n12-stagger-threads-tokens]/n=12 tern: done: Reviewed PROBLEM.md and current planner; independent agents verified the fresh plan satisfies H01–H22 and computes objective 194. The smoke test passes in ~0.2s. I made no code edits to avoid conflict
- f88d7d38/0001 murmur[n12-stagger-threads-tokens]/n=12 wren: done: Implemented the single-file planner with hard-constraint-aware candidate generation, CSP search, and feasible local objective improvements. The example passes npm smoke testing in ~0.3s; multiple inde
- b8573bf5/0001 murmur[solo-clock-tokens]/n=1 wren: done: Implemented solve.py with deterministic serial schedule generation and simulated-annealing job-order search. Verified schedules against all hard constraints on both example instances, and `npm run tes
- 9d9938d8/0001 murmur[n12-stagger-tokens]/n=12 crane: done: Current shared solve.py passes the smoke test, produces deterministic feasible schedules on both supplied instances, and the large-instance cost is 61,409 within the runtime budget.
- 9d9938d8/0001 murmur[n12-stagger-tokens]/n=12 dunlin: done: Independently validated the integrated deterministic solve.py on both provided instances: all hard constraints pass; large cost 61,409 with ~4.3s runtime, and npm run test passes. Reported findings to
- 9d9938d8/0001 murmur[n12-stagger-tokens]/n=12 finch: done: Implemented and verified solve.py. It deterministically generates feasible schedules with a fixed multi-policy portfolio; npm run test passes, and independent validation on both supplied instances con
- 9d9938d8/0001 murmur[n12-stagger-tokens]/n=12 heron: done: solve.py is implemented and independently validated. It passes npm run test, produces valid schedules on both provided instances, and completes the large instance in about 4.1 seconds.
- 9d9938d8/0001 murmur[n12-stagger-tokens]/n=12 kite: done: solve.py is implemented and validated. npm run test passes; both example instances produce valid schedules (all release, precedence, machine, and blocked-interval constraints verified). The large inst
- 9d9938d8/0001 murmur[n12-stagger-tokens]/n=12 lark: done: Implemented and validated the deterministic solver. The acceptance smoke test passes; independent checks confirm valid schedules on both provided instances, with the large instance scoring 61,409 in a
- 9d9938d8/0001 murmur[n12-stagger-tokens]/n=12 linnet: done: Implemented solve.py with deterministic multi-policy job-shop scheduling and insertion into machine-calendar gaps. It passes npm smoke test and independent hard-constraint validation on both provided 
- 9d9938d8/0001 murmur[n12-stagger-tokens]/n=12 plover: done: Current solve.py meets the contract and was independently tested: npm smoke check passes; both provided instances satisfy release, precedence, blocked-interval, and machine non-overlap constraints. De
- 9d9938d8/0001 murmur[n12-stagger-tokens]/n=12 robin: done: Current shared solve.py passes the acceptance smoke test, and I independently validated its large-instance schedule for precedence, machine non-overlap, blocked intervals, and weighted-tardiness cost 
- 9d9938d8/0001 murmur[n12-stagger-tokens]/n=12 swift: done: Implemented and independently validated solve.py. Current deterministic solver passes the smoke test; both example and large schedules satisfy release, precedence, machine non-overlap, and blocked-int
- 9d9938d8/0001 murmur[n12-stagger-tokens]/n=12 tern: done: Completed independent validation and benchmarking: current shared solver passes hard constraints on both example and production-sized instance, with measured costs/runtime reported to the team. I prov
- 9d9938d8/0001 murmur[n12-stagger-tokens]/n=12 wren: done: solve.py is implemented as a deterministic standard-library-only multi-start job-shop scheduler. Its insertion schedules were independently validated against precedence, releases, machine non-overlap,
- 2d378749/0001 murmur[n12-stagger-threads-tokens]/n=12 crane: done: The shared solve.py implements a deterministic heap-based insertion SGS with dynamic urgency priorities, handles releases, precedence, maintenance, and machine conflicts, and writes the required JSON.
- 2d378749/0001 murmur[n12-stagger-threads-tokens]/n=12 dunlin: done: Implemented and validated solve.py: it passes the acceptance smoke test, produces feasible schedules on both supplied instances, and the large instance completes in about 4.7s with weighted tardiness 
- 2d378749/0001 murmur[n12-stagger-threads-tokens]/n=12 finch: done: Implemented and verified solve.py. The smoke test passes; two runs on instance_large.json produced byte-identical output, and an independent check found zero constraint violations (weighted tardiness 
- 2d378749/0001 murmur[n12-stagger-threads-tokens]/n=12 heron: done: Current solve.py is complete, deterministic, and validated. `npm run test` passes; a full check on instance_large.json confirms release, precedence, machine, and blocked-interval constraints, with cos
- 2d378749/0001 murmur[n12-stagger-threads-tokens]/n=12 kite: done: Validated the current heap-based solver on the largest instance: all release, precedence, machine, and blocked-interval constraints hold, with weighted tardiness 67,802. The documented smoke test pass
- 2d378749/0001 murmur[n12-stagger-threads-tokens]/n=12 lark: done: solve.py is implemented as a deterministic 800-trial heap-based insertion scheduler with a 5.5s emergency guard. `npm run test` passes; I independently validated the large instance (cost 68,746, no co
- 2d378749/0001 murmur[n12-stagger-threads-tokens]/n=12 linnet: done: Implemented and tested solve.py. npm run test passes; independently validated the produced production-size schedule against release, precedence, machine, and blocked-interval constraints (cost 68,746)
- 2d378749/0001 murmur[n12-stagger-threads-tokens]/n=12 plover: done: solve.py is implemented and verified: it produces feasible schedules for both example and largest provided instance, minimizes weighted tardiness heuristically, stays within a 4.6-second internal budg
- 2d378749/0001 murmur[n12-stagger-threads-tokens]/n=12 robin: done: Implemented solve.py as a deterministic, fixed-seed 800-trial insertion SGS with an emergency wall-clock guard. npm run test passes; repeated large-instance runs produced identical output, and indepen
- 2d378749/0001 murmur[n12-stagger-threads-tokens]/n=12 swift: done: Implemented and validated solve.py. `npm run test` passes; independently checked the large-instance output for release, precedence, machine non-overlap, and blocked-interval constraints (cost 67,802).
- 2d378749/0001 murmur[n12-stagger-threads-tokens]/n=12 tern: done: Implemented deterministic fixed-portfolio heap SGS in solve.py, with an emergency wall-clock guard. npm run test passes; independently validated large-instance release, precedence, machine, and blocke
- 2d378749/0001 murmur[n12-stagger-threads-tokens]/n=12 wren: done: solve.py is implemented as a deterministic heap-based insertion SGS scheduler. I validated large-instance release, precedence, machine and blocked-interval constraints (cost 67,802); npm run test pass
- c89a315a/0001 murmur[solo-clock-tokens]/n=1 wren: done: Implemented planner.py with legal candidate generation, constraint-aware simulated annealing, hard-constraint verification in the search, and feasible-plan local improvement. The example plan was inde
- 9e697046/0001 murmur[n12-stagger-tokens]/n=12 crane: done: Implemented the initial planner CSP, fixed the syntax issue, ran the sample, and coordinated with the shared-file owner. The current dynamic-MRV version passes npm smoke and was independently verified
- 9e697046/0001 murmur[n12-stagger-tokens]/n=12 dunlin: done: Completed independent QA: sample planner runs under 3 seconds, npm smoke passes, and multiple teammates independently audited the exact sample output with zero H01–H22 violations. I made no conflictin
- 9e697046/0001 murmur[n12-stagger-tokens]/n=12 finch: done: planner.py is implemented by the shared team, passes npm run test in ~3 seconds, and I independently verified the sample output against H01–H22 with zero violations.
- 9e697046/0001 murmur[n12-stagger-tokens]/n=12 heron: done: The shared planner.py is implemented; I independently validated the latest sample output against H01-H22 with zero violations and confirmed npm run test passes. I did not edit the shared planner to av
- 9e697046/0001 murmur[n12-stagger-tokens]/n=12 kite: done: Independently audited the current sample plan against H01–H22 (zero violations), timed planner.py (~2.8–3.4s), and confirmed npm run test passes. Shared implementation is in place; I reported remainin
- 9e697046/0001 murmur[n12-stagger-tokens]/n=12 lark: done: The shared planner.py is implemented, passes npm smoke in about 3.3s, and independent audits validate every sample hard constraint. I made no overlapping edits; advised the writer on remaining large-i
- 9e697046/0001 murmur[n12-stagger-tokens]/n=12 linnet: done: planner.py is implemented, passes the smoke test in about 3.3s, compiles under Python, and the generated sample plan has been independently checked against H01–H22 with zero violations. I also reviewe
- 9e697046/0001 murmur[n12-stagger-tokens]/n=12 plover: done: Completed independent QA of the shared planner: npm smoke test passes, and a comprehensive H01–H22 audit of the example plan found zero violations. Reported the remaining fallback/scalability concerns
- 9e697046/0001 murmur[n12-stagger-tokens]/n=12 robin: done: planner.py is implemented; the sample plan was independently checked against H01–H22 with zero violations, and `npm run test` passes in about 3 seconds. QA and implementation are complete.
- 9e697046/0001 murmur[n12-stagger-tokens]/n=12 swift: done: Reviewed the contract and planner, identified and helped correct large-domain chair-sampling bias, validated the sample feasibility reports, ran npm test successfully, and stress-tested a 90-session h
- 9e697046/0001 murmur[n12-stagger-tokens]/n=12 tern: done: I independently validated the latest sample plan against H01–H22 (zero violations), timed the current planner, and sent the owner recommendations for large-instance search and fallback safety. I avoid
- 9e697046/0001 murmur[n12-stagger-tokens]/n=12 wren: done: Implemented the standard-library-only planner.py CSP solver, validated the sample plan against H01–H22 with zero violations, improved its objective via feasible relocation, passed npm smoke/py_compile
- 25fef1a5/0001 murmur[n12-stagger-threads-tokens]/n=12 crane: last text: 
- 25fef1a5/0001 murmur[n12-stagger-threads-tokens]/n=12 dunlin: done: Reviewed the planner implementation, verified the example passes npm smoke and independent H01–H22 checks, reviewed the objective hill-climb, fixed empty-string chair-id handling, and tested that edge
- 25fef1a5/0001 murmur[n12-stagger-threads-tokens]/n=12 finch: last text: 
- 25fef1a5/0001 murmur[n12-stagger-threads-tokens]/n=12 heron: last text: 
- 25fef1a5/0001 murmur[n12-stagger-threads-tokens]/n=12 kite: done: Reviewed the shared planner implementation, reported the reversed-window and empty-string chair edge cases, and verified the example plan with npm run test; independent validators report all hard cons
- 25fef1a5/0001 murmur[n12-stagger-threads-tokens]/n=12 lark: done: I independently validated the example plan against all hard constraints and objective, ran the smoke test, caught and verified the empty/reversed-window fix, and reported the remaining search robustne
- 25fef1a5/0001 murmur[n12-stagger-threads-tokens]/n=12 linnet: done: Finished review; flagged the newly discovered empty/reversed-window overlap bug to the implementation team for correction.
- 25fef1a5/0001 murmur[n12-stagger-threads-tokens]/n=12 plover: done: Reviewed planner.py, identified and reported contract edge cases (empty/reversed windows, chair-domain diversity, empty-string IDs, and deadline/fallback risks), and independently verified the latest 
- 25fef1a5/0001 murmur[n12-stagger-threads-tokens]/n=12 robin: last text: 
- 25fef1a5/0001 murmur[n12-stagger-threads-tokens]/n=12 swift: last text: 
- 25fef1a5/0001 murmur[n12-stagger-threads-tokens]/n=12 tern: done: Reviewed the full contract, identified and shared key feasibility pitfalls and example-instance constraints with the implementing agent. Other teammates are preparing independent validation; I avoided
- 25fef1a5/0001 murmur[n12-stagger-threads-tokens]/n=12 wren: done: Implemented and verified the bounded full-objective hill-climb in planner.py. Independent H01–H22 validation passes on repeated example runs (objective 182–186), npm smoke test passes, and empty-strin
- fd773a08/0001 murmur[solo-clock-tokens]/n=1 wren: done: Implemented solve.py with deterministic multi-start dispatch scheduling, blocked-interval and precedence-aware insertion, weighted-tardiness scoring, and verified valid schedules on both supplied inst
- c2362101/0001 murmur[n12-stagger-tokens]/n=12 crane: done: solve.py is implemented as a deterministic-seed, time-bounded serial schedule-generation/annealing solver. It passes npm run test, and independent validation confirmed release, precedence, blocked-int
- c2362101/0001 murmur[n12-stagger-tokens]/n=12 dunlin: done: solve.py is implemented; npm run test passes, and independent validation confirms feasible schedules for both example instances (costs 12861 and 67775). Runtime is about 6.6 seconds, below the 10-seco
- c2362101/0001 murmur[n12-stagger-tokens]/n=12 finch: done: Implemented solve.py with feasible blocked-aware scheduling, deterministic bounded search, and a dispatch candidate. npm run test passes; independently validated all hard constraints on example and la
- c2362101/0001 murmur[n12-stagger-tokens]/n=12 heron: done: solve.py is implemented; both example and largest instance were independently validated for all hard constraints, npm run test passes, and measured runtime is about 6.6–6.9 seconds under the 10-second
- c2362101/0001 murmur[n12-stagger-tokens]/n=12 kite: done: solve.py is implemented and verified: npm test passes, independent validators confirmed feasibility on both examples, and the large instance completes with valid cost 65718. Runtime and deterministic 
- c2362101/0001 murmur[n12-stagger-tokens]/n=12 lark: done: Validated the existing solve.py implementation without edits: it runs the example and largest instance within the limit, produces documented output, and independently passes all hard-constraint checks
- c2362101/0001 murmur[n12-stagger-tokens]/n=12 linnet: done: Validated the existing solve.py on both example and largest instance: output is feasible, costs are 12861 and 67775, runtime is about 6.6–6.9s, and npm tests are reported passing. Shared independent h
- c2362101/0001 murmur[n12-stagger-tokens]/n=12 plover: done: solve.py is implemented, npm run test passes, and independent validators confirmed feasibility on both the example and largest instance within the time limit.
- c2362101/0001 murmur[n12-stagger-tokens]/n=12 robin: done: solve.py is implemented and independently validated on both sample instances. The large schedule is constraint-valid at cost 65718; the example is valid at cost 12861. Fixed-seed, fixed-iteration sear
- c2362101/0001 murmur[n12-stagger-tokens]/n=12 swift: done: Completed independent QA: solver smoke test passes, both example and largest schedules satisfy all hard constraints, and measured costs are 12861 and 67775. Reported runtime/determinism observations t
- c2362101/0001 murmur[n12-stagger-tokens]/n=12 tern: done: Current solve.py is implemented, npm smoke test passes, and I independently verified valid schedules on both the small and largest instances (costs 12861 and 67775, respectively).
- c2362101/0001 murmur[n12-stagger-tokens]/n=12 wren: done: Solver is implemented and independently validated on both example instances; I benchmarked an optional ready-operation SGS candidate that improves the large sample but not the small one, and shared ex
- 37116428/0001 murmur[n12-stagger-threads-tokens]/n=12 crane: done: Latest solve.py is implemented and validated: npm smoke test passes, and independent checks on both example instances confirm all hard constraints, deterministic output, and runtimes below 10 seconds.
- 37116428/0001 murmur[n12-stagger-threads-tokens]/n=12 dunlin: done: Validated the shared solve.py: the fixed-seed, fixed-iteration solver passes npm run test, produces identical large-instance outputs across two runs, and independently passes precedence, machine, and 
- 37116428/0001 murmur[n12-stagger-threads-tokens]/n=12 finch: done: Implemented and validated solve.py. It produces deterministic, feasible schedules on both examples (weighted tardiness 13,424 small / 66,462 large), passes independent precedence/machine/blocked-inter
- 37116428/0001 murmur[n12-stagger-threads-tokens]/n=12 heron: done: Implemented and independently validated the authoritative permutation-SGS solver on both supplied instances: outputs satisfy precedence, machine exclusivity, and blocked-interval constraints; measured
- 37116428/0001 murmur[n12-stagger-threads-tokens]/n=12 kite: done: solve.py is implemented; I independently verified hard constraints and weighted-tardiness costs on both examples and confirmed `npm run test` passes. Reported results/robustness recommendations to the
- 37116428/0001 murmur[n12-stagger-threads-tokens]/n=12 lark: done: solve.py is implemented and independently validated on both provided instances: hard constraints pass, repeated runs produce identical outputs, weighted tardiness costs are 13,424 (small) and 66,462 (
- 37116428/0001 murmur[n12-stagger-threads-tokens]/n=12 linnet: done: solve.py is implemented, passes npm run test, produces valid schedules on both example instances, and repeated runs are deterministic. Independent validation confirmed precedence, machine non-overlap,
- 37116428/0001 murmur[n12-stagger-threads-tokens]/n=12 plover: done: Validated the final solve.py on both provided instances: schedules satisfy precedence, machine-capacity and blocked-interval constraints; repeated large runs produced identical output, cost was 66,462
- 37116428/0001 murmur[n12-stagger-threads-tokens]/n=12 robin: done: Independently validated the authoritative permutation-SGS solver on both instances: outputs satisfy precedence, machine capacity, blocked intervals, and releases; costs 13,813 (small) and 68,497 (larg
- 37116428/0001 murmur[n12-stagger-threads-tokens]/n=12 swift: done: Implemented solve.py as a deterministic, blocked-aware permutation SGS with bounded multi-start simulated annealing. Verified feasible schedules on both examples, repeatable output, measured costs 13,
- 37116428/0001 murmur[n12-stagger-threads-tokens]/n=12 tern: done: Independently verified the current solve.py on both provided instances: outputs satisfy precedence, machine exclusivity, and blocked intervals, with costs 13,813 (small) and 68,497 (large); npm run te
- 37116428/0001 murmur[n12-stagger-threads-tokens]/n=12 wren: done: solve.py now contains a deterministic-seed, blocked-aware permutation SGS/SA solver; I independently verified both example outputs against precedence, release, machine-conflict, maintenance and output

# Stage U

## Per task x arm (scripts/n12.mjs)

| task | arm | runs | capped | mean score | mean tokens | mean minutes | mean agentsDone | mean calls | mean coordination | mean maxWriters | mean meanWriters | mean refused | mean adds | mean takes | mean taskDone | mean drops | mean branches | mean merges | mean conflicts | mean updates | mean unmergedAgents | mean unmergedFiles | mean lastEnter | scores |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opt_shop2_blind | solo n=1 | 2 | 0 | 0.13 | 0.04M | 0.65 | 1.0 | 8.5 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – | 0.00 0.26 |
| opt_shop2_blind | solo-clock-tokens n=1 | 2 | 0 | 0.00 | 0.07M | 2.05 | 1.0 | 12.0 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – | 0.00 0.00 |
| opt_shop2_blind | solo-clock-unlimited n=1 | 2 | 0 | 0.00 | 0.04M | 0.73 | 1.0 | 8.5 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – | 0.00 0.00 |

## Per run (scripts/n12.mjs --runs)

| campaign | run | task | arm | reason | roles | score | tokens | minutes | agentsDone | calls | coordination | maxWriters | meanWriters | refused | adds | takes | taskDone | drops | branches | merges | conflicts | updates | unmergedAgents | unmergedFiles | lastEnter |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 20261004T182027Z-27402aac | run-0001 | opt_shop2_blind | solo-clock-unlimited n=1 | all_done |  | 0.00 | 0.04M | 0.61 | 1.0 | 9.0 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – |
| 20261004T182030Z-bfbb4a6a | run-0001 | opt_shop2_blind | solo n=1 | all_done |  | 0.00 | 0.04M | 0.72 | 1.0 | 9.0 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – |
| 20261004T182115Z-e63f6aac | run-0001 | opt_shop2_blind | solo-clock-unlimited n=1 | all_done |  | 0.00 | 0.04M | 0.86 | 1.0 | 8.0 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – |
| 20261004T182025Z-4f3259e1 | run-0001 | opt_shop2_blind | solo-clock-tokens n=1 | all_done |  | 0.00 | 0.08M | 1.93 | 1.0 | 13.0 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – |
| 20261004T182208Z-ee9d90bc | run-0001 | opt_shop2_blind | solo n=1 | all_done |  | 0.26 | 0.04M | 0.59 | 1.0 | 8.0 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – |
| 20261004T182105Z-c1134564 | run-0001 | opt_shop2_blind | solo-clock-tokens n=1 | all_done |  | 0.00 | 0.06M | 2.17 | 1.0 | 11.0 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – |

| task | arm | runs | capped | mean score | mean tokens | mean minutes | mean agentsDone | mean calls | mean coordination | mean maxWriters | mean meanWriters | mean refused | mean adds | mean takes | mean taskDone | mean drops | mean branches | mean merges | mean conflicts | mean updates | mean unmergedAgents | mean unmergedFiles | mean lastEnter | scores |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| opt_shop2_blind | solo n=1 | 2 | 0 | 0.13 | 0.04M | 0.65 | 1.0 | 8.5 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – | 0.00 0.26 |
| opt_shop2_blind | solo-clock-tokens n=1 | 2 | 0 | 0.00 | 0.07M | 2.05 | 1.0 | 12.0 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – | 0.00 0.00 |
| opt_shop2_blind | solo-clock-unlimited n=1 | 2 | 0 | 0.00 | 0.04M | 0.73 | 1.0 | 8.5 | 0.00 | 1.0 | 1.00 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | 0.0 | – | 0.00 0.00 |

## Per agent (scripts/traces.mjs)

| run | task | arm | score | tokens | min | end | agent | calls | board % | checks | green at | after green | last check | overwrites | nudges |
|---|---|---|---:|---:|---:|---|---|---:|---:|---:|---:|---:|---|---:|---:|
| 27402aac/0001 | opt_shop2_blind | murmur[solo-clock-unlimited]/n=1 | 0.000 | 0.04M | 0.6 | all_done | wren | 9 | 11 | 1 | 7 | 2 | green | 0 | 0 |
| bfbb4a6a/0001 | opt_shop2_blind | murmur[solo]/n=1 | 0.000 | 0.04M | 0.7 | all_done | wren | 9 | 11 | 1 | 8 | 1 | green | 0 | 0 |
| e63f6aac/0001 | opt_shop2_blind | murmur[solo-clock-unlimited]/n=1 | 0.000 | 0.04M | 0.9 | all_done | wren | 8 | 13 | 1 | 6 | 2 | green | 0 | 0 |
| 4f3259e1/0001 | opt_shop2_blind | murmur[solo-clock-tokens]/n=1 | 0.000 | 0.08M | 1.9 | all_done | wren | 13 | 8 | 1 | 9 | 4 | green | 0 | 0 |
| ee9d90bc/0001 | opt_shop2_blind | murmur[solo]/n=1 | 0.261 | 0.04M | 0.6 | all_done | wren | 8 | 13 | 1 | 6 | 2 | green | 0 | 0 |
| c1134564/0001 | opt_shop2_blind | murmur[solo-clock-tokens]/n=1 | 0.000 | 0.06M | 2.2 | all_done | wren | 11 | 9 | 1 | 9 | 2 | green | 0 | 0 |

Why each agent stopped:
- 27402aac/0001 murmur[solo-clock-unlimited]/n=1 wren: done: Implemented deterministic serial schedule generation in solve.py. Smoke test passes, and the generated schedule for instance_large.json was independently checked for precedence, releases, blocked inte
- bfbb4a6a/0001 murmur[solo]/n=1 wren: done: Implemented solve.py with deterministic heuristic job ordering and earliest-gap insertion scheduling. Verified constraints on the example, ran the largest instance successfully, and passed npm run tes
- e63f6aac/0001 murmur[solo-clock-unlimited]/n=1 wren: done: Implemented deterministic single-file scheduling heuristic in solve.py. It passes npm smoke test, runs the large instance, and independently validated precedence, machine, blocked-interval, and output
- 4f3259e1/0001 murmur[solo-clock-tokens]/n=1 wren: done: Implemented a deterministic, multi-start Giffler–Thompson-style job-shop scheduler with release dates and blocked-machine intervals. Verified output validity on both the small and largest provided ins
- ee9d90bc/0001 murmur[solo]/n=1 wren: done: Implemented a standard-library single-file solver. The public smoke test passes, and the generated schedule for the largest example was independently checked for precedence, release dates, blocked int
- c1134564/0001 murmur[solo-clock-tokens]/n=1 wren: done: Implemented solve.py as a deterministic, standard-library-only heuristic scheduler. It respects precedence, machine capacity, releases, and blocked intervals; smoke-tested the required command and ind
