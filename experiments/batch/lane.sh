#!/bin/sh
# Rounds 5B and 6B lane: the batches of one lot, arms interleaved per repetition so time-of-day effects spread evenly.
#   nohup sh lane.sh <lot> <image> ["<arms>"] &      (arms default to "I R E"; round 6B uses "IC EC")
lot=$1; image=$2; arms=${3:-"I R E"}; here=/Users/azaru/Documents/projects/murmur/experiments/batch
log=$here/lane-$lot${3:+-$(echo $3 | tr -d ' ')}.log
for rep in 0 1 2; do
  for arm in $arms; do
    echo "$(date -u +%FT%TZ) start $lot-$arm-r$rep" >> $log
    node $here/run-batch.mjs $lot $arm $rep $image >> $log 2>&1
    echo "$(date -u +%FT%TZ) end $lot-$arm-r$rep exit=$?" >> $log
  done
done
echo "$(date -u +%FT%TZ) no work left" >> $log
