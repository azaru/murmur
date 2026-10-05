#!/bin/sh
# Round 20: making the team's state visible on the five-task DeepSWE batch. Four 12-agent arms (ST, ST-depart, ST-status,
# ST-tasks), each with 32M shared and 120 minutes per batch, k=2. Per repetition, two waves of two arms run at the same time
# (10 sidecars each). Stops on the usage-limit error (STOP20).
#   nohup sh experiments/deepswe/batch20.sh &
cd "$(dirname "$0")/../.." || exit 1
TASKS=expr-try-catch-errors,oxvg-structural-selector-preservation,scriggo-method-declarations,tengo-destructuring-bindings,wasmi-trap-coredumps
LOG=experiments/deepswe/batch20.log
log() { echo "$(date -u +%FT%TZ) $*" >> "$LOG"; }
quota() {
  python3 - "experiments/deepswe/runs/$1" <<'PY'
import json, pathlib, sys
hit = False
for f in pathlib.Path(sys.argv[1]).rglob("*.messages.json"):
    try:
        hit |= any(m.get("role") == "assistant" and m.get("stopReason") == "error" and "usage limit" in (m.get("errorMessage") or "").lower() for m in json.loads(f.read_text()))
    except Exception:
        pass
sys.exit(0 if hit else 1)
PY
}
wave() {
  rep=$1; shift; ids=""
  for arm in "$@"; do
    id=e20-$arm-r$rep; ids="$ids $id"
    [ -f "experiments/deepswe/results/$id.json" ] && continue
    node experiments/deepswe/run-batch.mjs --tasks "$TASKS" --arm swarm --profile "profiles/n12-$arm.json" --agents 12 --tokens 32000000 --minutes 120 --sidecar-memory 5g --id "$id" >> "experiments/deepswe/$id.log" 2>&1 &
  done
  wait
  for id in $ids; do
    if quota "$id"; then mv "experiments/deepswe/results/$id.json" "experiments/deepswe/runs/$id/summary-invalid.json" 2>/dev/null
      log "usage limit in $id: invalid (summary moved into its run dir), STOP20 written"; echo "$id" >> experiments/deepswe/invalid20.txt; touch experiments/deepswe/STOP20; fi
  done
}
for rep in 0 1; do
  for w in "stagger stagger-depart" "stagger-status stagger-tasks"; do
    [ -f experiments/deepswe/STOP20 ] && { log "STOP20 present, exiting"; exit 0; }
    log "start rep $rep wave: $w"
    wave $rep $w
    log "end rep $rep wave: $w"
  done
done
log "no work left (batch20)"
