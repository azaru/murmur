#!/bin/sh
# Round 17 stage E: the DeepSWE batch. STT (12 agents, staggered entry, post-only board, clock + tokens left) against
# C1T (one agent, clock + tokens left) on the same five tasks, sharing 32M and 120 minutes per batch. Both arms of a
# repetition run at the same time, so they share the machine's load; repetition 0 before repetition 1. Stops on the
# model's usage-limit error and writes deepswe/STOP17E.
#   nohup sh experiments/deepswe/batch17.sh &
cd "$(dirname "$0")/../.." || exit 1
TASKS=expr-try-catch-errors,oxvg-structural-selector-preservation,scriggo-method-declarations,tengo-destructuring-bindings,wasmi-trap-coredumps
LOG=experiments/deepswe/batch17.log
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
for rep in 0 1; do
  [ -f experiments/deepswe/STOP17E ] && { log "STOP17E present, exiting"; exit 0; }
  s=e17-swarm-r$rep o=e17-solo-r$rep
  [ -f "experiments/deepswe/results/$s.json" ] && [ -f "experiments/deepswe/results/$o.json" ] && continue
  log "start rep $rep"
  [ -f "experiments/deepswe/results/$s.json" ] || node experiments/deepswe/run-batch.mjs --tasks "$TASKS" --arm swarm --profile profiles/n12-stagger-tokens.json --agents 12 --tokens 32000000 --minutes 120 --sidecar-memory 5g --id "$s" >> "experiments/deepswe/$s.log" 2>&1 &
  [ -f "experiments/deepswe/results/$o.json" ] || node experiments/deepswe/run-batch.mjs --tasks "$TASKS" --arm solo --tokens 32000000 --minutes 120 --sidecar-memory 5g --id "$o" >> "experiments/deepswe/$o.log" 2>&1 &
  wait
  log "end rep $rep"
  for id in $s $o; do
    if quota "$id"; then mv "experiments/deepswe/results/$id.json" "experiments/deepswe/runs/$id/summary-invalid.json" 2>/dev/null
      log "usage limit in $id: invalid (summary moved into its run dir), STOP17E written"; echo "$id" >> experiments/deepswe/invalid17.txt; touch experiments/deepswe/STOP17E; fi
  done
  [ -f experiments/deepswe/STOP17E ] && exit 0
done
log "no work left (batch17)"
