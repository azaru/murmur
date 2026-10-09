#!/bin/sh
# Round 34: the new fixed baseline, the default swarm (n12-base-peers) on the recalibrated five-task DeepSWE batch, 32M, k=5.
# Stops on the usage-limit error (STOP34); delete STOP34 and rerun to resume (batches with a result are skipped).
#   nohup sh experiments/deepswe/batch34.sh &
cd "$(dirname "$0")/../.." || exit 1
TASKS=expr-try-catch-errors,wasmi-trap-coredumps,dynamodb-toolbox-lazy-recursive-schemas,anko-typed-variable-bindings,python-statemachine-state-data-scoping
LOG=experiments/deepswe/batch34.log
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
  [ -f experiments/deepswe/STOP34 ] && { log "STOP34 present, skipping $id"; return; }
  log "start $id"
  node experiments/deepswe/run-batch.mjs --tasks "$TASKS" "$@" --minutes 120 --sidecar-memory 5g --id "$id" >> "experiments/deepswe/$id.log" 2>&1
  if quota "$id"; then mv "experiments/deepswe/results/$id.json" "experiments/deepswe/runs/$id/summary-invalid.json" 2>/dev/null
    log "usage limit in $id: invalid (summary moved into its run dir), STOP34 written"; echo "$id" >> experiments/deepswe/invalid34.txt; touch experiments/deepswe/STOP34; fi
  log "end $id"
}
for rep in 0 1 2 3 4; do
  one "e34-base-r$rep" --arm swarm --profile profiles/n12-base-peers.json --agents 12 --tokens 32000000
done
log "no work left (batch34)"
