#!/usr/bin/env python3
"""Process table for the role arms of rounds 29-32 (TF, TI, TS, TD), from each batch's events.jsonl.
  python3 experiments/deepswe/process.py
A write is an edit/write call; a path is a test when it contains "test" or "e2e"; paths may be absolute (/work/<repo>) or relative.
"""
import json,re,statistics as st
from datetime import datetime
R='experiments/deepswe/runs/'
ARMS={'TF':'e29-rtests-r','TI':'e30-rinteg-r','TS':'e31-rsibl-r','TD':'e32-rdead-r'}
PROJ=['expr','oxvg','scriggo','tengo','wasmi']
LAYER=r'parser|checker|compiler|vm|runtime|emitter|executor|engine|lexer|type checker|typechecker|codegen|optimizer|translator|validator|interpreter'
def T(s): return datetime.fromisoformat(s.replace('Z','+00:00')).timestamp()
def proj(p):
    p=p.lstrip('/'); p=p[5:] if p.startswith('work/') else p
    for s in PROJ:
        if re.match(s+r'(-|/|$)',p): return s
def multi(title):
    t=title.lower()
    if re.search(r'/|,| and | \+ | & ',t.split(':',1)[-1]):
        return len(set(re.findall(r'\b(?:'+LAYER+r')\b',t)))>=2
    return False
out={};titles={}
for arm,pre in ARMS.items():
    o=dict(enter=[],first_test=0,withw=0,multi_w=0,impl_before=0,items=0,w=[0,0,0],fi_min=[],fi_tok=[],calls=[],last2=0,multilayer=0)
    titles[arm]=[]
    for r in range(5):
        ev=[json.loads(l) for l in open(f'{R}{pre}{r}/b/murmur/run/events.jsonl')]
        t0=T(next(e for e in ev if e['type']=='run_start')['t'])
        ent=[T(e['t']) for e in ev if e['type']=='enter']
        o['enter'].append((sorted(ent)[11]-t0)/60 if len(ent)>=12 else None)
        tend=T(next(e for e in ev if e['type']=='abort')['t'])
        cum=0
        W=[]  # (time, agent, path, cumulative tokens)
        for e in ev:
            if e['type']=='usage': cum+=e.get('total',0)
            if e['type']=='tool' and e.get('tool') in('write','edit'):
                p=(e.get('args') or {}).get('path') or ''
                W.append((T(e['t']),e['agent'],p,cum))
        o['calls'].append(len(W))
        items={}
        for e in ev:
            if e['type']=='task_add':
                items[e['id']]=dict(title=e['title'],w=e.get('weight',0),done=None)
                o['items']+=1;w=e.get('weight',0)
                o['w'][0 if w<=3 else 1 if w<=7 else 2]+=1
                if multi(e['title']) and not e['title'].lower().startswith('tests'):
                    o['multilayer']+=1;titles[arm].append(f'r{r}: {e["title"]}')
            if e['type']=='task_done' and e['id'] in items: items[e['id']]['done']=T(e['t'])
        for s in PROJ:
            pw=[(t,a,p,c) for t,a,p,c in W if proj(p)==s]
            if not pw: continue
            o['withw']+=1
            istest=lambda p:'test' in p.lower() or 'e2e' in p.lower()
            if istest(pw[0][2]): o['first_test']+=1
            if len({a for t,a,p,c in pw if istest(p)})>=2: o['multi_w']+=1
            impl=[x for x in pw if not istest(x[2])]
            if impl:
                o['fi_min'].append((impl[0][0]-t0)/60);o['fi_tok'].append(impl[0][3]/1e6)
                o['last2']+=sum(1 for x in impl if tend-x[0]<=120)
            ti=[i for i in items.values() if i['title'].lower().startswith('tests:') and s in i['title'].lower()]
            if ti and impl and impl[0][0]<max((i['done'] or tend) for i in ti): o['impl_before']+=1
    out[arm]=o
f=lambda a:f'{min(a):.1f}-{max(a):.1f}'
rows=[('entered within (min)',lambda o:f(o['enter'])+' min'),
('first write is test',lambda o:f"{o['first_test']} of {o['withw']}"),
('tests >=2 writers',lambda o:o['multi_w']),
('impl before all test items done',lambda o:o['impl_before']),
('items',lambda o:o['items']),
('weights 1-3/4-7/8-10',lambda o:' / '.join(map(str,o['w']))),
('first impl write median',lambda o:f"{st.median(o['fi_min']):.1f} min, {st.median(o['fi_tok']):.1f}M (n={len(o['fi_min'])})"),
('write/edit per run',lambda o:f"{min(o['calls'])}-{max(o['calls'])}"),
('impl writes last 2 min',lambda o:o['last2']),
('multi-layer build items',lambda o:o['multilayer'])]
print('| |'+'|'.join(out)+'|');print('|---'*5+'|')
for n,fn in rows: print(f'| {n} |'+'|'.join(str(fn(o)) for o in out.values())+'|')
for a in ('TS','TD'):
    print(a);[print('  ',t) for t in titles[a]]
