#!/usr/bin/env python3
"""Process measures of team communication for DeepSWE batches (round 20 on), from each batch's events.jsonl.

  python3 experiments/deepswe/comm.py <batch>...

Per batch:
- posts addressed to the departed: posts by agents (not murmur's notices) that address a teammate after it called done, i.e. its name
  followed by a comma, colon, slash or "please" ("Finch, are you working there?", "Finch/Robin please post progress"). Talking about a
  departed agent ("tern left; I'll take tengo") does not count;
- departures of a last editor: an agent calls done while it is the last write/edit/append author in a task repository;
  picked up = another agent writes/edits there before the run ends; delay = minutes from the done to that edit;
- untouched: task repositories with no write/edit/append at all by the end of the run.
Edits made through bash are not seen, as in the teamStatus lever.
"""
import json, re, statistics, sys
from datetime import datetime
from pathlib import Path

RUNS = Path(__file__).parent / "runs"
ts = lambda s: datetime.fromisoformat(s.replace("Z", "+00:00")).timestamp() / 60

def measure(batch):
    events = [json.loads(line) for line in open(RUNS / batch / "b" / "murmur" / "run" / "events.jsonl")]
    start, end = ts(events[0]["t"]), ts(events[-1]["t"])
    repos = [line.split(":")[0].strip("- ") for line in events[0]["task"]["goal"].split("\n") if line.startswith("- ")]
    done, last, departures, edited = {}, {}, [], set()
    to_departed = 0
    for e in events:
        t = ts(e["t"]) - start
        if e["type"] == "done":
            if e["agent"] in done: continue  # a second done (after a revival) is not a new departure
            done[e["agent"]] = t
            for repo, author in last.items():
                if author == e["agent"]: departures.append({"agent": e["agent"], "repo": repo, "at": t, "pickup": None})
        elif e["type"] == "post" and not e["text"].startswith("(sent by murmur)"):
            to_departed += sum(1 for n, at in done.items() if n != e["agent"] and at < t and re.search(rf"(?:^|[\s.!?;(@]){n}\s*(?:[,:/]|please\b)", e["text"], re.I))
        elif e["type"] == "tool" and e["tool"] in ("write", "edit", "append"):
            path = str((e.get("args") or {}).get("path", ""))
            repo = next((r for r in repos if f"/{r}/" in f"/{path}"), None)
            if not repo: continue
            edited.add(repo)
            last[repo] = e["agent"]
            for d in departures:
                if d["repo"] == repo and d["pickup"] is None and e["agent"] != d["agent"] and t >= d["at"]: d["pickup"] = t - d["at"]
    delays = [d["pickup"] for d in departures if d["pickup"] is not None]
    return {"batch": batch, "minutes": round(end - start, 1), "posts_addressed_to_departed": to_departed, "departures_of_last_editor": len(departures),
            "picked_up": len(delays), "median_pickup_min": round(statistics.median(delays), 1) if delays else None,
            "untouched": [r for r in repos if r not in edited]}

if __name__ == "__main__":
    for batch in sys.argv[1:]:
        print(json.dumps(measure(batch)))
