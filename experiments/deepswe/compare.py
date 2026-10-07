#!/usr/bin/env python3
"""Compare an arm's DeepSWE batches with the fixed baseline (the decision rule since 2026-10-07).

  python3 experiments/deepswe/compare.py <arm-batch>... [--baseline e23-base-r0,...,e23-base-r4]

Each batch is one run: its five-task mean is one observation. The rule:
- Δ = arm mean − baseline mean of the per-run five-task means;
- p = exact two-sided permutation test over every split of the runs into the two groups;
- better if p < 0.05, Δ > 0 and the arm's per-task mean is higher on at least 3 of the 5 tasks; worse if p < 0.05, Δ < 0
  and lower on at least 3 of 5; otherwise not decided.
Also printed: per-task means and sd, and a 95% bootstrap interval for Δ (resampling runs within each group).
"""
import itertools, json, random, statistics as st, sys
from pathlib import Path

RESULTS = Path(__file__).parent / "results"
args = sys.argv[1:]
baseline = [f"e23-base-r{i}" for i in range(5)]
if "--baseline" in args:
    i = args.index("--baseline"); baseline = args[i + 1].split(","); del args[i:i + 2]
if not args: sys.exit(__doc__)


def load(batches):
    runs = [json.load(open(RESULTS / f"{b}.json")) for b in batches]
    tasks = runs[0]["tasks"]
    return tasks, [[r["perTask"][t]["score"] for t in tasks] for r in runs]


tasks, base = load(baseline)
arm_tasks, arm = load(args)
assert arm_tasks == tasks, "the arm and the baseline must have the same tasks"
mean = lambda rows: [st.mean(r[i] for r in rows) for i in range(len(tasks))]
sd = lambda rows: [st.stdev(r[i] for r in rows) if len(rows) > 1 else 0 for i in range(len(tasks))]
a, b = [st.mean(r) for r in arm], [st.mean(r) for r in base]
delta = st.mean(a) - st.mean(b)

pooled, k = a + b, len(a)
splits = list(itertools.combinations(range(len(pooled)), k))
diff = lambda idx: st.mean(pooled[i] for i in idx) - st.mean(pooled[i] for i in range(len(pooled)) if i not in idx)
p = sum(abs(diff(s)) >= abs(delta) - 1e-12 for s in splits) / len(splits)

rng = random.Random(0)
boot = sorted(st.mean(rng.choices(a, k=len(a))) - st.mean(rng.choices(b, k=len(b))) for _ in range(10000))
lo, hi = boot[249], boot[9749]

ma, mb, sa, sb = mean(arm), mean(base), sd(arm), sd(base)
higher, lower = sum(x > y for x, y in zip(ma, mb)), sum(x < y for x, y in zip(ma, mb))
verdict = ("better" if delta > 0 and higher >= 3 else "worse" if delta < 0 and lower >= 3 else "not decided") if p < 0.05 else "not decided"

short = lambda t: t.split("-")[0]
print(f"| task | arm mean (sd) | baseline mean (sd) | Δ |\n|---|---:|---:|---:|")
for t, x, y, u, v in zip(tasks, ma, mb, sa, sb): print(f"| {short(t)} | {x:.3f} ({u:.3f}) | {y:.3f} ({v:.3f}) | {x - y:+.3f} |")
print(f"| **five-task mean** | {st.mean(a):.3f} ({st.stdev(a) if k > 1 else 0:.3f}) | {st.mean(b):.3f} ({st.stdev(b):.3f}) | {delta:+.3f} |")
print(f"\nruns: arm {', '.join(f'{x:.3f}' for x in a)}; baseline {', '.join(f'{x:.3f}' for x in b)}")
print(f"Δ {delta:+.3f}, 95% bootstrap interval [{lo:+.3f}, {hi:+.3f}], exact permutation p = {p:.3f} ({len(splits)} splits), "
      f"higher on {higher} of {len(tasks)} tasks, lower on {lower}: **{verdict}**")
