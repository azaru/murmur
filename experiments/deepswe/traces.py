#!/usr/bin/env python3
"""Coordination counts per DeepSWE batch, from each batch's events.jsonl (as in traces17.md to traces20.md).

  python3 experiments/deepswe/traces.py <batch>...

Per batch: tokens, cost, minutes, end reason; event types; tool calls; done calls and their times; bash calls whose command
names each task; write/edit calls on files under each task's directory, with the number of distinct agents in brackets.
"""
import collections, json, sys
from datetime import datetime
from pathlib import Path

RUNS = Path(__file__).parent / "runs"
ts = lambda s: datetime.fromisoformat(s.replace("Z", "+00:00")).timestamp() / 60

# A batch has one run under b/, or one per team under team1/, team2/... (round 21).
units = []
for b in sys.argv[1:]:
    if (RUNS / b / "b").exists(): units.append((b, RUNS / b / "b"))
    else: units += [(f"{b} {d.name}", d) for d in sorted((RUNS / b).glob("team*"))]

for batch, unit in units:
    run = unit / "murmur" / "run"
    res = json.load(open(run / "result.json"))
    events = [json.loads(line) for line in open(run / "events.jsonl")]
    repos = [line.split(":")[0].strip("- ") for line in events[0]["task"]["goal"].split("\n") if line.startswith("- ")]
    start = ts(events[0]["t"])
    types = collections.Counter(e["type"] for e in events)
    tools = collections.Counter(e["tool"] for e in events if e["type"] == "tool")
    callers = {e["agent"] for e in events if e["type"] == "tool"}
    bash, writes, writers, team = collections.Counter(), collections.Counter(), collections.defaultdict(set), 0
    for e in events:
        if e["type"] != "tool": continue
        args = e.get("args") or {}
        if e["tool"] == "bash":
            for r in repos:
                if r in (args.get("command") or ""): bash[r] += 1
        if e["tool"] in ("write", "edit", "append"):
            path = args.get("path") or ""
            if path.endswith("TEAM.md"): team += 1
            for r in repos:
                if f"/{r}/" in f"/{path}": writes[r] += 1; writers[r].add(e["agent"])
    dones = [ts(e["t"]) - start for e in events if e["type"] == "done"]
    short = lambda r: r.split("-")[0]
    print(f"## {batch}\n")
    print(f"- tokens {res['tokens']/1e6:.1f}M, ${res.get('costUsd', 0):.2f}, {ts(events[-1]['t']) - start:.1f} minutes, end {res.get('reason')}, agents with tool calls {len(callers)}")
    print("- events: " + ", ".join(f"{k} {v}" for k, v in sorted(types.items())))
    print("- tool calls: " + ", ".join(f"{k} {v}" for k, v in sorted(tools.items())))
    if dones: print(f"- done calls {len(dones)}, first at {min(dones):.1f} min, last at {max(dones):.1f} min")
    print("- bash calls naming a task: " + ", ".join(f"{short(r)} {bash[r]}" for r in repos))
    print("- write/edit calls on a task's files (agents): " + ", ".join(f"{short(r)} {writes[r]} ({len(writers[r])})" for r in repos))
    if team: print(f"- write/edit calls on TEAM.md: {team}")
    print()
