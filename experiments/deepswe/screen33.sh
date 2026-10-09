#!/bin/sh
# Round 33: screen DeepSWE tasks for a recalibrated five-task batch. Two lanes, run at once:
#   swarm: the default 12-agent swarm (n12-base-peers) on the 10 new candidates, two groups of five, 32M per batch, k=2;
#   solo:  one agent per task (isolated arm, solo-clock-tokens), 6.4M per task, on the 10 candidates and the 4 kept tasks, k=2.
# Stops on the usage-limit error (STOP33); delete STOP33 and rerun a lane to resume (batches with a result are skipped).
#   nohup sh experiments/deepswe/screen33.sh swarm &
#   nohup sh experiments/deepswe/screen33.sh solo &
cd "$(dirname "$0")/../.." || exit 1
G1=sql-formatter-bigquery-pipe-formatting,sqlfmt-create-table-ddl-formatting,anko-typed-variable-bindings,yaegi-go-embed-directives,katex-multicolumn-array-spans
G2=meriyah-explicit-resource-declarations,bandit-interprocedural-taint-checks,tomlkit-toml-table-converters,csstree-shorthand-expansion-compression,abs-module-cache-flags
G3=expr-try-catch-errors,wasmi-trap-coredumps,tengo-destructuring-bindings,scriggo-method-declarations
LOG=experiments/deepswe/screen33.log
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
  id=$1 tasks=$2; shift 2
  [ -f "experiments/deepswe/results/$id.json" ] && return
  [ -f experiments/deepswe/STOP33 ] && { log "STOP33 present, skipping $id"; return; }
  log "start $id"
  node experiments/deepswe/run-batch.mjs --tasks "$tasks" "$@" --minutes 120 --sidecar-memory 5g --id "$id" >> "experiments/deepswe/$id.log" 2>&1
  if quota "$id"; then mv "experiments/deepswe/results/$id.json" "experiments/deepswe/runs/$id/summary-invalid.json" 2>/dev/null
    log "usage limit in $id: invalid (summary moved into its run dir), STOP33 written"; echo "$id" >> experiments/deepswe/invalid33.txt; touch experiments/deepswe/STOP33; fi
  log "end $id"
}
case "$1" in
  swarm)
    for rep in 0 1; do
      one "s33-swarm-g1-r$rep" "$G1" --arm swarm --profile profiles/n12-base-peers.json --agents 12 --tokens 32000000
      one "s33-swarm-g2-r$rep" "$G2" --arm swarm --profile profiles/n12-base-peers.json --agents 12 --tokens 32000000
    done ;;
  solo)
    for rep in 0 1; do
      one "s33-solo-g1-r$rep" "$G1" --arm isolated --tokens 32000000
      one "s33-solo-g2-r$rep" "$G2" --arm isolated --tokens 32000000
      one "s33-solo-g3-r$rep" "$G3" --arm isolated --tokens 25600000
    done ;;
  *) echo "usage: screen33.sh swarm|solo"; exit 1 ;;
esac
log "no work left (screen33 $1)"
