#!/bin/sh
# Round 19: board delivery and board instructions on the five-task DeepSWE batch. Six 12-agent arms that differ only in
# how the team shares state, each with 32M shared and 120 minutes per batch, k=2. Starts after round 18's batches.
# Per repetition, two waves of three arms run at the same time (15 sidecars each). Stops on the usage-limit error (STOP19).
#   nohup sh experiments/deepswe/batch19.sh &
cd "$(dirname "$0")/../.." || exit 1
TASKS=expr-try-catch-errors,oxvg-structural-selector-preservation,scriggo-method-declarations,tengo-destructuring-bindings,wasmi-trap-coredumps
LOG=experiments/deepswe/batch19.log
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
until grep -q "no work left (batch18)" experiments/deepswe/batch18.log 2>/dev/null || [ -f experiments/deepswe/STOP18 ]; do sleep 60; done
[ -f experiments/deepswe/STOP18 ] && { log "STOP18 present (quota), not starting"; exit 0; }
wave() {
  rep=$1; shift; ids=""
  for arm in "$@"; do
    id=e19-$arm-r$rep; ids="$ids $id"
    [ -f "experiments/deepswe/results/$id.json" ] && continue
    node experiments/deepswe/run-batch.mjs --tasks "$TASKS" --arm swarm --profile "profiles/n12-$arm.json" --agents 12 --tokens 32000000 --minutes 120 --sidecar-memory 4g --id "$id" >> "experiments/deepswe/$id.log" 2>&1 &
  done
  wait
  for id in $ids; do
    if quota "$id"; then mv "experiments/deepswe/results/$id.json" "experiments/deepswe/runs/$id/summary-invalid.json" 2>/dev/null
      log "usage limit in $id: invalid (summary moved into its run dir), STOP19 written"; echo "$id" >> experiments/deepswe/invalid19.txt; touch experiments/deepswe/STOP19; fi
  done
}
for rep in 0 1; do
  for w in "stagger stagger-tail stagger-file" "stagger-threads stagger-norms stagger-tasks"; do
    [ -f experiments/deepswe/STOP19 ] && { log "STOP19 present, exiting"; exit 0; }
    log "start rep $rep wave: $w"
    wave $rep $w
    log "end rep $rep wave: $w"
  done
done
log "no work left (batch19)"
