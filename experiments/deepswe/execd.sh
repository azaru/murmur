#!/bin/bash
# PID 1 of a task sidecar (--network none, started with --init). Runs the command files that the hub's `run` script drops
# into /q/req, one process group per command, with /app (the task repo) as working directory. Writes /q/res/<id>.out
# (output so far) and, when the command is over, /q/res/<id>.rc (exit code). A command is killed (whole process group)
# when it exceeds RUN_TIMEOUT seconds (exit 124), when `run` was killed (exit 143: <id>.kill, or no <id>.alive heartbeat
# for 20 s because the caller died without a trap), and that is the only way a command stops besides finishing.
Q=/q; T=${RUN_TIMEOUT:-1200}
mkdir -p $Q/req $Q/res

job() {  # job <id>
  local id=$1 out=$Q/res/$1.out rc why="" start=$SECONDS n=0 pid
  cd /app
  setsid bash "$Q/res/$id.sh" >> "$out" 2>&1 < /dev/null &
  pid=$!
  while kill -0 $pid 2> /dev/null; do
    if (( SECONDS - start >= T )); then why="timed out after ${T}s"; rc=124; break; fi
    if [ -e "$Q/res/$id.kill" ]; then why="killed by the caller"; rc=143; break; fi
    if (( ++n % 25 == 0 )) && (( $(date +%s) - $(stat -c %Y "$Q/res/$id.alive" 2> /dev/null || echo 0) > 20 )); then why="caller gone"; rc=143; break; fi
    sleep 0.2
  done
  if [ -n "$why" ]; then
    kill -TERM -- -$pid 2> /dev/null; sleep 2; kill -KILL -- -$pid 2> /dev/null
    wait $pid 2> /dev/null
    echo "[run: $why; the command and its child processes were killed]" >> "$out"
  else
    wait $pid; rc=$?
  fi
  echo $rc > "$Q/res/$id.rc.tmp" && mv "$Q/res/$id.rc.tmp" "$Q/res/$id.rc"   # written after the last output byte
}

while true; do
  for f in $Q/req/*.sh; do
    [ -e "$f" ] || continue
    id=$(basename "$f" .sh)
    mv "$f" "$Q/res/$id.sh"; : > "$Q/res/$id.out"
    job "$id" &
  done
  sleep 0.2
done
