#!/usr/bin/env python3
"""Zondas #46530: ar check_sim_palette gaudo LL-174 defekta, o svaru config praleidzia.

Kviecia TAS PATS funkcijas, kurias kviecia validate_content.py, — be tinklo.
"""
import json
import pathlib
import sys

ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
sys.path.insert(0, str(ROOT / 'scripts'))
import validate_content as vc  # noqa: E402

fails = 0
runs = 0


def run(name, cfg, expect_errors, expect_substr=''):
    global fails, runs
    runs += 1
    rep = vc.Report()
    vc.check_sim_palette('content/lt/grade-01/matematika/x.json', 'desningumai', cfg, rep)
    ok = len(rep.errors) == expect_errors
    if expect_substr:
        ok = ok and any(expect_substr in e for e in rep.errors)
    print(('✔' if ok else '✗'), name, '→', len(rep.errors), 'klaidos',
          ('' if not rep.errors else '| ' + rep.errors[0][:110]))
    if not ok:
        fails += 1


def circles(*keys):
    return {k: {'name': k, 'shape': 'apskritimas', 'fill': 'var(--x)'} for k in keys}


# T1: LL-174 pirmoji būsena — visi žetonai vienodi apskritimai.
run('T1 visi apskritimai (LL-174)', {
    'palette': circles('r', 'b', 'g'),
    'tasks': [{'seq': ['r', 'b', 'r', 'b', '?'], 'options': ['b', 'r', 'g'], 'answer': 1}],
}, 1, 'nesiskiria forma')

# T2: teisinga paletė — lygiai vienas sprendimas be spalvos (teigiama kontrolė).
run('T2 vienas sprendimas (švaru)', {
    'palette': {
        'r': {'shape': 'apskritimas'}, 'b': {'shape': 'kvadratas'},
        'g': {'shape': 'trikampis'},
    },
    'tasks': [{'seq': ['r', 'b', 'r', 'b', '?'], 'options': ['b', 'r', 'g'], 'answer': 1}],
}, 0)

# T3: nė vienas variantas nepadaro sekos periodiška.
run('T3 seka be sprendimo', {
    'palette': {
        'r': {'shape': 'apskritimas'}, 'b': {'shape': 'kvadratas'},
        'g': {'shape': 'trikampis'}, 'y': {'shape': 'rombas'},
    },
    'tasks': [{'seq': ['r', 'g', 'b', '?', 'y'], 'options': ['b', 'r', 'g'], 'answer': 0}],
}, 1, 'be sprendimo')

# T4: žetonas be shape.
run('T4 žetonas be formos', {
    'palette': {'r': {'name': 'raudonas'}, 'b': {'shape': 'kvadratas'}, 'g': {'shape': 'trikampis'}},
    'tasks': [{'seq': ['r', 'b', '?'], 'options': ['b', 'r', 'g'], 'answer': 1}],
}, 2, 'neturi „shape“')

# T5: tikras repo config (07-desningumai) — turi būti švarus.
real = json.loads((ROOT / 'content/lt/grade-01/matematika/07-desningumai.json').read_text(encoding='utf-8'))
rep = vc.Report()
vc.check_sim_palette('07-desningumai', 'desningumai', real['sim']['config'], rep)
ok = not rep.errors
runs += 1
print(('✔' if ok else '✗'), 'T5 tikras 07-desningumai →', len(rep.errors), 'klaidos')
fails += 0 if ok else 1

# T5b: paletė su unikaliomis formomis, bet teisingas variantas — ne tas,
#      kuris padaro seką periodiška. Gaudoma tik answer↔solved sankirta.
run('T5b teisingas variantas nesutampa su sprendžiamu', {
    'palette': {
        'r': {'shape': 'apskritimas'}, 'b': {'shape': 'kvadratas'},
        'g': {'shape': 'trikampis'},
    },
    'tasks': [{'seq': ['r', 'b', 'r', 'b', '?'], 'options': ['g', 'r', 'b'], 'answer': 0}],
}, 1, 'nesutampa')

# T6: sena (prieš #505) 07-desningumai forma — penkios sekos iš vienodų apskritimų.
old = {'palette': circles('r', 'b', 'y', 'o', 'g', 'v'),
       'tasks': [{'seq': ['r', 'b', 'r', 'b', '?'], 'options': ['b', 'r', 'g'], 'answer': 1},
                 {'seq': ['y', 'y', 'g', 'y', 'y', '?'], 'options': ['o', 'y', 'r'], 'answer': 0}]}
rep = vc.Report()
vc.check_sim_palette('07-desningumai (senas)', 'desningumai', old, rep)
ok = len(rep.errors) == 2
runs += 1
print(('✔' if ok else '✗'), 'T6 senas config →', len(rep.errors), 'klaidos')
fails += 0 if ok else 1

print(f'\nZondas: {fails} nepavykę lūkesčiai iš {runs}')
sys.exit(1 if fails else 0)
