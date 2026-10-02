#!/bin/sh
# Round 5B lane: the batches of one lot, arms interleaved per repetition so time-of-day effects spread evenly.
#   nohup sh lane.sh <lot> <image> &
lot=$1; image=$2; here=/Users/azaru/Documents/projects/murmur/experiments/batch
for rep in 0 1 2; do
  for arm in I R E; do
    echo "$(date -u +%FT%TZ) start $lot-$arm-r$rep" >> $here/lane-$lot.log
    node $here/run-batch.mjs $lot $arm $rep $image >> $here/lane-$lot.log 2>&1
    echo "$(date -u +%FT%TZ) end $lot-$arm-r$rep exit=$?" >> $here/lane-$lot.log
  done
done
echo "$(date -u +%FT%TZ) no work left" >> $here/lane-$lot.log
