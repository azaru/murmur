#!/bin/sh
# Round 16 stage D: calibrate C1T (one agent, clock + tokens left) on four DeepSWE tasks, one isolated run per task
# (12M and 90 minutes each, all four in parallel), k=2. Starts after the round 16 stage A lane, because planning and
# shop2 have wall-clock-bound solvers. Stops on the model's usage-limit error and writes deepswe/STOP16.
#   nohup sh experiments/deepswe/calib16.sh &
cd "$(dirname "$0")/../.." || exit 1
TASKS=expr-try-catch-errors,termenv-preserve-ansi-resets,cattrs-partial-structuring-recovery,fd-deterministic-multi-key-sorting
LOG=experiments/deepswe/calib16.log
log() { echo "$(date -u +%FT%TZ) $*" >> "$LOG"; }
until grep -q "no work left (A)" experiments/criba16-lanes.log 2>/dev/null || [ -f experiments/criba16/STOP ]; do sleep 60; done
[ -f experiments/criba16/STOP ] && { log "criba16 STOP present, not starting"; exit 0; }
for rep in 0 1; do
  id=cal16-r$rep
  [ -f "experiments/deepswe/results/$id.json" ] && continue
  log "start $id"
  node experiments/deepswe/run-batch.mjs --tasks "$TASKS" --arm isolated --tokens 48000000 --minutes 90 --id "$id" >> "$LOG" 2>&1
  log "end $id exit=$?"
  if python3 - "experiments/deepswe/runs/$id" <<'PY'
import json, pathlib, sys
hit = False
for f in pathlib.Path(sys.argv[1]).rglob("*.messages.json"):
    try:
        hit |= any(m.get("role") == "assistant" and m.get("stopReason") == "error" and "usage limit" in (m.get("errorMessage") or "").lower() for m in json.loads(f.read_text()))
    except Exception:
        pass
sys.exit(0 if hit else 1)
PY
  then mv "experiments/deepswe/results/$id.json" "experiments/deepswe/runs/$id/summary-invalid.json" 2>/dev/null
    log "usage limit in $id: invalid (summary moved into its run dir), STOP16 written"; echo "$id" >> experiments/deepswe/invalid16.txt; touch experiments/deepswe/STOP16; exit 0; fi
done
log "no work left (calib16)"
