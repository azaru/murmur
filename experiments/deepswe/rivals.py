#!/usr/bin/env python3
"""Round 21's pre-registered measures of how rival teams use each other's work.

  python3 experiments/deepswe/rivals.py <teams-batch>...

Per team: minutes, end reason, first done, last write; tool calls whose arguments mention /rivals, per agent and per
10-minute bin; posts that name another team or rivals. Per repetition: files whose final diff is identical in two teams,
and how many of those one team wrote after reading the other's (under /rivals/<team>/<task>), which the other
had written first.
"""
import collections, json, re, sys
from datetime import datetime
from pathlib import Path

RUNS = Path(__file__).parent / "runs"
ts = lambda s: datetime.fromisoformat(s.replace("Z", "+00:00")).timestamp() / 60
WRITES = ("write", "edit", "append")


def file_diffs(path):
    """Split a git diff into {file: text of that file's diff, without the index line}."""
    out, cur = {}, None
    for line in open(path, errors="replace"):
        m = re.match(r"diff --git a/(\S+) b/", line)
        if m: cur = m.group(1); out[cur] = []; continue
        if cur and not line.startswith("index "): out[cur].append(line)
    return {f: "".join(v) for f, v in out.items()}


def write_times(events, file):
    return [ts(e["t"]) for e in events if e["type"] == "tool" and e["tool"] in WRITES
            and (e.get("args") or {}).get("path", "").endswith(file)]


for batch in sys.argv[1:]:
    teams = sorted(d.name for d in (RUNS / batch).glob("team*"))
    events, start = {}, {}
    print(f"## {batch}\n")
    for team in teams:
        run = RUNS / batch / team / "murmur" / "run"
        ev = [json.loads(line) for line in open(run / "events.jsonl")]
        events[team], start[team] = ev, ts(ev[0]["t"])
        res = json.load(open(run / "result.json"))
        m = lambda e: ts(e["t"]) - start[team]
        others = [t for t in teams if t != team]
        rivals, bins = collections.Counter(), collections.Counter()
        for e in ev:
            if e["type"] == "tool" and "/rivals" in json.dumps(e.get("args") or {}):
                rivals[e["agent"]] += 1; bins[int(m(e) // 10) * 10] += 1
        posts = [e for e in ev if e["type"] == "post"]
        named = [e for e in posts if not e["text"].startswith("(sent by murmur)")
                 and re.search(r"\b(" + "|".join(others) + r"|rivals?|other teams)\b", e["text"], re.I)]
        dones = [m(e) for e in ev if e["type"] == "done"]
        writes = [m(e) for e in ev if e["type"] == "tool" and e["tool"] in WRITES]
        print(f"### {team}\n")
        print(f"- {m(ev[-1]):.1f} minutes, end {res.get('reason')}, first done "
              + (f"{min(dones):.1f} min ({len(dones)} done calls)" if dones else "none")
              + (f", last write {max(writes):.1f} min" if writes else ", no writes"))
        print(f"- tool calls mentioning /rivals: {sum(rivals.values())} ("
              + ", ".join(f"{a} {n}" for a, n in sorted(rivals.items())) + "); by minute: "
              + ", ".join(f"{b}-{b + 10} {n}" for b, n in sorted(bins.items())))
        print(f"- posts naming another team or rivals: {len(named)} of {len(posts)}")
        for e in named[:6]: print(f"  - {m(e):.1f} min {e['agent']}: {e['text'][:160]!r}")
        print()

    # Identical per-file diffs between two teams of the same repetition.
    tasks = sorted(p.stem for p in (RUNS / batch / teams[0]).glob("*.diff"))
    same, read_first = [], []
    for task in tasks:
        diffs = {t: file_diffs(RUNS / batch / t / f"{task}.diff") for t in teams}
        for i, a in enumerate(teams):
            for b in teams[i + 1:]:
                for f in sorted(set(diffs[a]) & set(diffs[b])):
                    if diffs[a][f] != diffs[b][f]: continue
                    same.append((task, f, a, b))
                    # x copied from y if y wrote the file first, then x read y's copy of the task, then x wrote the file.
                    for x, y in ((a, b), (b, a)):
                        wx, wy = write_times(events[x], f), write_times(events[y], f)
                        read = [ts(e["t"]) for e in events[x] if e["type"] == "tool"
                                and f"/rivals/{y}/{task}" in json.dumps(e.get("args") or {})]
                        if wx and wy and any(min(wy) < r < max(wx) for r in read): read_first.append((task, f, x, y))
    print(f"### identical file diffs between teams: {len(same)}; written after reading the rival's copy: {len(read_first)}\n")
    for s in same: print(f"- {s[0]} {s[1]}: {s[2]} = {s[3]}")
    for r in read_first: print(f"- {r[2]} wrote {r[0]} {r[1]} after reading {r[3]}'s, which {r[3]} had written first")
    print()
