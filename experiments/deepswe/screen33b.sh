#!/bin/sh
# Round 33, second set: screen ten harder DeepSWE candidates with the default 12-agent swarm (n12-base-peers), two groups
# of five, 32M per batch, k=2, one lane per group run at once. Stops on the usage-limit error (STOP33); delete STOP33 and
# rerun a lane to resume (batches with a result are skipped).
#   nohup sh experiments/deepswe/screen33b.sh h1 &
#   nohup sh experiments/deepswe/screen33b.sh h2 &
cd "$(dirname "$0")/../.." || exit 1
H1=tengo-callable-instance-isolation,dynamodb-toolbox-lazy-recursive-schemas,python-statemachine-state-data-scoping,helm-array-merge-strategies,gql-incremental-graphql-delivery
H2=kea-atomic-signal-selectors,adaptix-name-mapping-aliases,kombu-virtual-queue-dead-lettering,superjson-error-stack-serialization,task-task-graph-export
LOG=experiments/deepswe/screen33b.log
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
  h1) for rep in 0 1; do one "s33-swarm-h1-r$rep" "$H1" --arm swarm --profile profiles/n12-base-peers.json --agents 12 --tokens 32000000; done ;;
  h2) for rep in 0 1; do one "s33-swarm-h2-r$rep" "$H2" --arm swarm --profile profiles/n12-base-peers.json --agents 12 --tokens 32000000; done ;;
  *) echo "usage: screen33b.sh h1|h2"; exit 1 ;;
esac
log "no work left (screen33b $1)"
