#!/bin/sh
# Round 22: three rival teams of four sharing one 32M pool, against one swarm of 12 with 32M, on the five-task DeepSWE batch.
# Teams are told to finish above the others and that the others cannot see their work (false, as in round 21). Both arms use
# n12-base-peers (n12-base with the "equals" sentence fixed). k=3; the order alternates by repetition. 120 minutes each.
# Stops on the usage-limit error (STOP22).
#   nohup sh experiments/deepswe/batch22.sh &
cd "$(dirname "$0")/../.." || exit 1
TASKS=expr-try-catch-errors,oxvg-structural-selector-preservation,scriggo-method-declarations,tengo-destructuring-bindings,wasmi-trap-coredumps
LOG=experiments/deepswe/batch22.log
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
  [ -f experiments/deepswe/STOP22 ] && { log "STOP22 present, skipping $id"; return; }
  log "start $id"
  node experiments/deepswe/run-batch.mjs --tasks "$TASKS" "$@" --minutes 120 --sidecar-memory 5g --id "$id" >> "experiments/deepswe/$id.log" 2>&1
  if quota "$id"; then mv "experiments/deepswe/results/$id.json" "experiments/deepswe/runs/$id/summary-invalid.json" 2>/dev/null
    log "usage limit in $id: invalid (summary moved into its run dir), STOP22 written"; echo "$id" >> experiments/deepswe/invalid22.txt; touch experiments/deepswe/STOP22; fi
  log "end $id"
}
teams() { one "e22-teams-r$1" --arm teams --teams 3 --pool --profile profiles/n12-base-peers.json --agents 4 --tokens 32000000; }
swarm() { one "e22-swarm-r$1" --arm swarm --profile profiles/n12-base-peers.json --agents 12 --tokens 32000000; }
teams 0; swarm 0
swarm 1; teams 1
teams 2; swarm 2
log "no work left (batch22)"
