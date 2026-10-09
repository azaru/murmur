#!/usr/bin/env python3
"""End-of-run measures per arm (rounds 31-32): broken trees (the grader ran none of the existing tests), missed places (expr: no compiler/ file or "undefined node type"; scriggo: no emitter path), deadline notices, done calls, time-limited test commands, writes after the notice.
  cd experiments/deepswe/runs && python3 ../endstate.py e32-rdead e31-rsibl
"""
import json,glob,re,datetime as dt,statistics as st,sys
def ts(s): return dt.datetime.fromisoformat(s.replace('Z','+00:00')).timestamp()
arms=sys.argv[1:]
for arm in arms:
    broken=[];missed=[];rows=[]
    for d in sorted(glob.glob(arm+'-r?')):
        r=d[-2:]
        for f in glob.glob(d+'/b/*.score.json'):
            s=json.load(open(f))
            if not s['base']['passed']: broken.append(f"{r}:{s['task'].split('-')[0]}")
        # missed places
        ed=open(glob.glob(d+'/b/expr-*.diff')[0]).read()
        epaths=re.findall(r'^diff --git a/(\S+)',ed,re.M)
        logs=' '.join(open(x,errors='ignore').read() for x in glob.glob(d+'/b/expr-*-logs/*'))
        if not any(p.startswith('compiler/') for p in epaths) or 'undefined node type' in logs: missed.append(r+':expr')
        sd=open(glob.glob(d+'/b/scriggo-*.diff')[0]).read()
        if not any('emitter' in p for p in re.findall(r'^diff --git a/(\S+)',sd,re.M)): missed.append(r+':scriggo')
        ev=[json.loads(l) for l in open(d+'/b/murmur/run/events.jsonl')]
        start=ts(ev[0]['t']); end=[ts(e['t']) for e in ev if e['type'] in('abort','run_end')][0]
        notes={e['agent']:(ts(e['t']),e.get('share')) for e in ev if e['type']=='deadline_notice'}
        entered={e['agent'] for e in ev if e['type']=='enter'}
        dones=[e for e in ev if e['type']=='done']
        dones_after=[e['agent'] for e in dones if e['agent'] in notes and ts(e['t'])>=notes[e['agent']][0]]
        tests=[e for e in ev if e['type']=='tool' and e.get('tool') in('bash','run') and re.search(r'\b(go test|cargo (test|nextest)|pytest|npm test)\b',json.dumps(e.get('args',{})))]
        timed=[e for e in tests if re.search(r'\btimeout\b',e.get('args',{}).get('command',''))]
        writes=[e for e in ev if e['type']=='tool' and e.get('tool') in('write','edit')]
        first_note=min((v[0] for v in notes.values()),default=None)
        wafter=sum(1 for e in writes if e['agent'] in notes and ts(e['t'])>=notes[e['agent']][0])
        tok=sum(e['total'] for e in ev if e['type']=='usage')
        reason=[e for e in ev if e['type']=='run_end'][0]['reason']
        rows.append(f"{r}: end {reason} {tok/1e6:.1f}M {(end-start)/60:.1f}min | notices {len(notes)}/{len(entered)} first {((end-first_note)/60 if first_note else float('nan')):.1f}min before end | done {len(dones)} (after notice {len(dones_after)}) | tests {len(tests)} timed {len(timed)} | writes {len(writes)} after-notice {wafter}")
    print(f"== {arm}: broken {len(broken)} {broken} | missed {len(missed)} {missed}")
    for x in rows: print('  ',x)
