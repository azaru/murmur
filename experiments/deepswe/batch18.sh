#!/bin/sh
# Round 18: the DeepSWE batch again, on ten tasks. ST (12 agents, staggered entry, post-only board, clock) against
# C1P (one agent, clock, an instruction to keep working until everything is done), 120 minutes per batch and a token cap
# set so high (400M) that the clock decides. Both arms of a repetition run at the same time; repetition 0 first. Stops on the
# model's usage-limit error and writes deepswe/STOP18.
#   nohup sh experiments/deepswe/batch18.sh &
cd "$(dirname "$0")/../.." || exit 1
TASKS=expr-try-catch-errors,oxvg-structural-selector-preservation,scriggo-method-declarations,tengo-destructuring-bindings,wasmi-trap-coredumps,scc-bounded-memory-spilling,participle-grammar-conflict-analysis,dasel-html-document-format,fastapi-implicit-head-options,cattrs-partial-structuring-recovery
LOG=experiments/deepswe/batch18.log
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
  [ -f experiments/deepswe/STOP18 ] && { log "STOP18 present, exiting"; exit 0; }
  s=e18-swarm-r$rep o=e18-solo-r$rep
  [ -f "experiments/deepswe/results/$s.json" ] && [ -f "experiments/deepswe/results/$o.json" ] && continue
  log "start rep $rep"
  [ -f "experiments/deepswe/results/$s.json" ] || node experiments/deepswe/run-batch.mjs --tasks "$TASKS" --arm swarm --profile profiles/n12-stagger.json --agents 12 --tokens 400000000 --minutes 120 --sidecar-memory 5g --id "$s" >> "experiments/deepswe/$s.log" 2>&1 &
  [ -f "experiments/deepswe/results/$o.json" ] || node experiments/deepswe/run-batch.mjs --tasks "$TASKS" --arm solo --profile profiles/solo-clock-persist.json --tokens 400000000 --minutes 120 --sidecar-memory 5g --id "$o" >> "experiments/deepswe/$o.log" 2>&1 &
  wait
  log "end rep $rep"
  for id in $s $o; do
    if quota "$id"; then mv "experiments/deepswe/results/$id.json" "experiments/deepswe/runs/$id/summary-invalid.json" 2>/dev/null
      log "usage limit in $id: invalid (summary moved into its run dir), STOP18 written"; echo "$id" >> experiments/deepswe/invalid18.txt; touch experiments/deepswe/STOP18; fi
  done
  [ -f experiments/deepswe/STOP18 ] && exit 0
done
log "no work left (batch18)"
