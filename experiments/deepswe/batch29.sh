#!/bin/sh
# Round 29: RP with end-to-end tests before implementation, build items per layer and idle-holder marks (TF, n12-roles9-tests), against the
# fixed baseline (round 23), on the five-task DeepSWE batch, 32M, k=5. Stops on the usage-limit error (STOP29); delete
# STOP29 and rerun to resume (batches with a result are skipped).
#   nohup sh experiments/deepswe/batch29.sh &
cd "$(dirname "$0")/../.." || exit 1
TASKS=expr-try-catch-errors,oxvg-structural-selector-preservation,scriggo-method-declarations,tengo-destructuring-bindings,wasmi-trap-coredumps
LOG=experiments/deepswe/batch29.log
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
  [ -f experiments/deepswe/STOP29 ] && { log "STOP29 present, skipping $id"; return; }
  log "start $id"
  node experiments/deepswe/run-batch.mjs --tasks "$TASKS" "$@" --minutes 120 --sidecar-memory 5g --id "$id" >> "experiments/deepswe/$id.log" 2>&1
  if quota "$id"; then mv "experiments/deepswe/results/$id.json" "experiments/deepswe/runs/$id/summary-invalid.json" 2>/dev/null
    log "usage limit in $id: invalid (summary moved into its run dir), STOP29 written"; echo "$id" >> experiments/deepswe/invalid29.txt; touch experiments/deepswe/STOP29; fi
  log "end $id"
}
for rep in 0 1 2 3 4; do
  one "e29-rtests-r$rep" --arm swarm --profile profiles/n12-roles9-tests.json --agents 12 --tokens 32000000
done
log "no work left (batch29)"
