#!/bin/sh
# Round 17 stage S: screen 12 new DeepSWE candidates with one C1T run each (one agent, clock + tokens left), in three
# isolated batches of four (48M shared and 90 minutes per batch, 6 GB per sidecar), one batch after another. Stops on the
# model's usage-limit error and writes deepswe/STOP17.
#   nohup sh experiments/deepswe/screen17.sh &
cd "$(dirname "$0")/../.." || exit 1
LOG=experiments/deepswe/screen17.log
log() { echo "$(date -u +%FT%TZ) $*" >> "$LOG"; }
batch() {
  id=$1 tasks=$2
  [ -f "experiments/deepswe/results/$id.json" ] && return 0
  [ -f experiments/deepswe/STOP17 ] && { log "STOP17 present, exiting"; exit 0; }
  log "start $id"
  node experiments/deepswe/run-batch.mjs --tasks "$tasks" --arm isolated --tokens 48000000 --minutes 90 --sidecar-memory 6g --id "$id" >> "$LOG" 2>&1
  log "end $id exit=$?"
  if python3 - "experiments/deepswe/runs/$id" <<'PY'
import json, pathlib, sys
hit = False
for f in pathlib.Path(sys.argv[1]).rglob("*.messages.json"):
    try:
        hit |= any(m.get("role") == "assistant" and m.get("stopReason") == "error" and "usage limit" in (m.get("errorMessage") or "").lower() for m in json.loads(f.read_text()))
    except Exception:
        pass
sys.exit(0 if hit else 1)
PY
  then mv "experiments/deepswe/results/$id.json" "experiments/deepswe/runs/$id/summary-invalid.json" 2>/dev/null
    log "usage limit in $id: invalid (summary moved into its run dir), STOP17 written"; echo "$id" >> experiments/deepswe/invalid17.txt; touch experiments/deepswe/STOP17; exit 0; fi
}
batch scr17-b1 oxvg-structural-selector-preservation,etree-xml-diff-patch,tengo-destructuring-bindings,returns-validated-error-accumulation
batch scr17-b2 scc-bounded-memory-spilling,go-git-worktree-merge-conflicts,dasel-html-document-format,wasmi-trap-coredumps
batch scr17-b3 ytt-jsonpath-query-api,scriggo-method-declarations,participle-grammar-conflict-analysis,fastapi-implicit-head-options
log "no work left (screen17)"
