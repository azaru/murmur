#!/bin/sh
# Criba 3 top-up: one-repetition campaigns for the ieh arms that miss exactly one run.
E=/Users/azaru/Documents/projects/murmur/experiments
one() {
  echo "$(date -u +%FT%TZ) topup start information_extraction_hard-x1g-$1-r1" >> $E/criba3-lanes.log
  python3 -m swarmtest --config $E/criba3/x1g-$1-ieh-r1.json run --live --tasks information_extraction_hard --max-total-tokens 25000000 > $E/criba3/information_extraction_hard-x1g-$1-r1.log 2>&1
  echo "$(date -u +%FT%TZ) topup end information_extraction_hard-x1g-$1-r1 exit=$? $(grep -o 'Campaign: [^ ]*' $E/criba3/information_extraction_hard-x1g-$1-r1.log)" >> $E/criba3-lanes.log
}
cd /Users/azaru/Documents/projects/swarmtest
(one lock; one parts) &
one stale &
wait
echo "$(date -u +%FT%TZ) topup no work left" >> $E/criba3-lanes.log
