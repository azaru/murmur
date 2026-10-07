#!/bin/sh
# Round 23: the fixed baseline. One swarm of 12 (n12-base-peers, the current defaults) with 32M on the five-task DeepSWE
# batch, k=5, at one code commit. Later arms are compared with it instead of rerunning a control each round.
# Stops on the usage-limit error (STOP23); delete STOP23 and rerun to resume (batches with a result are skipped).
#   nohup sh experiments/deepswe/batch23.sh &
cd "$(dirname "$0")/../.." || exit 1
TASKS=expr-try-catch-errors,oxvg-structural-selector-preservation,scriggo-method-declarations,tengo-destructuring-bindings,wasmi-trap-coredumps
LOG=experiments/deepswe/batch23.log
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
  [ -f experiments/deepswe/STOP23 ] && { log "STOP23 present, skipping $id"; return; }
  log "start $id"
  node experiments/deepswe/run-batch.mjs --tasks "$TASKS" "$@" --minutes 120 --sidecar-memory 5g --id "$id" >> "experiments/deepswe/$id.log" 2>&1
  if quota "$id"; then mv "experiments/deepswe/results/$id.json" "experiments/deepswe/runs/$id/summary-invalid.json" 2>/dev/null
    log "usage limit in $id: invalid (summary moved into its run dir), STOP23 written"; echo "$id" >> experiments/deepswe/invalid23.txt; touch experiments/deepswe/STOP23; fi
  log "end $id"
}
for rep in 0 1 2 3 4; do
  one "e23-base-r$rep" --arm swarm --profile profiles/n12-base-peers.json --agents 12 --tokens 32000000
done
log "no work left (batch23)"
