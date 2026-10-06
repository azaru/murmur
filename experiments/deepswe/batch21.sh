#!/bin/sh
# Round 21: three rival teams of three on the five-task DeepSWE batch, each told to finish above the others and that the
# others cannot see its work (false: every team reads the others' repositories read-only). Per repetition: the three teams
# at once (8M and 120 minutes each), then one agent alone with 8M and 120 minutes. k=2. Stops on the usage-limit error (STOP21).
#   nohup sh experiments/deepswe/batch21.sh &
cd "$(dirname "$0")/../.." || exit 1
TASKS=expr-try-catch-errors,oxvg-structural-selector-preservation,scriggo-method-declarations,tengo-destructuring-bindings,wasmi-trap-coredumps
LOG=experiments/deepswe/batch21.log
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
  [ -f experiments/deepswe/STOP21 ] && { log "STOP21 present, skipping $id"; return; }
  log "start $id"
  node experiments/deepswe/run-batch.mjs --tasks "$TASKS" "$@" --minutes 120 --sidecar-memory 5g --id "$id" >> "experiments/deepswe/$id.log" 2>&1
  if quota "$id"; then mv "experiments/deepswe/results/$id.json" "experiments/deepswe/runs/$id/summary-invalid.json" 2>/dev/null
    log "usage limit in $id: invalid (summary moved into its run dir), STOP21 written"; echo "$id" >> experiments/deepswe/invalid21.txt; touch experiments/deepswe/STOP21; fi
  log "end $id"
}
for rep in 0 1; do
  one "e21-teams-r$rep" --arm teams --teams 3 --profile profiles/n12-base.json --agents 3 --tokens 8000000
  one "e21-solo-r$rep" --arm solo --profile profiles/solo-clock.json --tokens 8000000
done
log "no work left (batch21)"
