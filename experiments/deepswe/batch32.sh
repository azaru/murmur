#!/bin/sh
# Round 32: TS with a deadline notice at 75% of the budget, one layer per build item and end-to-end tests through the user's path (TD,
# n12-roles9-deadline), against the fixed baseline (round 23), on the five-task DeepSWE batch, 32M, k=5. Stops on the usage-limit error (STOP32); delete
# STOP32 and rerun to resume (batches with a result are skipped).
#   nohup sh experiments/deepswe/batch32.sh &
cd "$(dirname "$0")/../.." || exit 1
TASKS=expr-try-catch-errors,oxvg-structural-selector-preservation,scriggo-method-declarations,tengo-destructuring-bindings,wasmi-trap-coredumps
LOG=experiments/deepswe/batch32.log
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
one() {
  id=$1; shift
  [ -f "experiments/deepswe/results/$id.json" ] && return
  [ -f experiments/deepswe/STOP32 ] && { log "STOP32 present, skipping $id"; return; }
  log "start $id"
  node experiments/deepswe/run-batch.mjs --tasks "$TASKS" "$@" --minutes 120 --sidecar-memory 5g --id "$id" >> "experiments/deepswe/$id.log" 2>&1
  if quota "$id"; then mv "experiments/deepswe/results/$id.json" "experiments/deepswe/runs/$id/summary-invalid.json" 2>/dev/null
    log "usage limit in $id: invalid (summary moved into its run dir), STOP32 written"; echo "$id" >> experiments/deepswe/invalid32.txt; touch experiments/deepswe/STOP32; fi
  log "end $id"
}
for rep in 0 1 2 3 4; do
  one "e32-rdead-r$rep" --arm swarm --profile profiles/n12-roles9-deadline.json --agents 12 --tokens 32000000
done
log "no work left (batch32)"
