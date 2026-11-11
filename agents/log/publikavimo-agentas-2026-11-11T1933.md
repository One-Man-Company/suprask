# publikavimo-agentas — 2026-11-11T1933

- paleidimas: #237 (manual)
- trukmė: 218s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub237.py
│ @@ -0,0 +1,6 @@
│ +import json
│ +d = json.load(open('/tmp/pub237.json'))
│ +for k in ('local', 'published', 'missing_on_live', 'hidden_locally', 'not_in_path',
│ +          'stale', 'stale_unknown', 'path_differs', 'unpushed_commits',
│ +          'last_commit', 'live_error', 'live_grades'):
│ +    print(k, '=', d[k])
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub237.py
│ @@ -1,5 +1,5 @@
│  import json
│ -d = json.load(open('/tmp/pub237.json'))
│ +d = json.load(open('/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub237.json'))
│  for k in ('local', 'published', 'missing_on_live', 'hidden_locally', 'not_in_path',
│            'stale', 'stale_unknown', 'path_differs', 'unpushed_commits',
│            'last_commit', 'live_error', 'live_grades'):
│ profiles/deepseek41flash/cache/scratch/assets237.py
│ @@ -0,0 +1,47 @@
│ +"""Palygina gyvus assets su repo failais po tos pačios ?v=<sha8> transformacijos,
│ +kurią daro .github/workflows/pages.yml. Tik skaitymas."""
│ +import hashlib
│ +import pathlib
│ +import re
│ +import subprocess
│ +import urllib.request
│ +
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +LIVE = 'https://one-man-company.github.io/suprask/'
│ +UA = {'User-Agent': 'suprask-pub-check/237'}
│ +SHA = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=ROOT, capture_output=True, text=True).stdout.strip()[:8]
│ +
│ +
│ +def fetch(rel):
│ +    req = urllib.request.Request(LIVE + rel, headers=UA)
│ +    with urllib.request.urlopen(req, timeout=30) as r:
│ +        return r.read()
│ +
│ +
│ +def strip_v(data: bytes) -> bytes:
│ +    return re.sub(rb'\?v=[0-9a-f]{8}', b'', data)
│ +
│ +
│ +assets = ['index.html', '404.html', 'assets/css/main.css', 'assets/js/app.js',
│ +          'assets/js/registry.js', 'assets/js/progress.js', 'assets/js/speech.js']
│ +sims = sorted(p.name for p in (ROOT / 'assets/js/sims').glob('*.js'))
│ +assets += ['assets/js/sims/' + s for s in sims]
│ +
│ +ok = bad = 0
│ +for rel in assets:
│ +    try:
│ +        live = fetch(rel)
│ +    except Exception as exc:  # noqa: BLE001
│ +        print(f'FAIL {rel}: {type(exc).__name__} {exc}')
│ +        bad += 1
│ +        continue
│ +    local = (ROOT / rel).read_bytes()
│ +    if strip_v(live) == strip_v(local):
│ +        ok += 1
│ +        print(f'ok   {rel} ({len(local)} B)')
│ +    else:
│ +        bad += 1
│ +        print(f'DIFF {rel}: repo {len(local)} B, gyvai {len(live)} B, '
│ +              f'repo {hashlib.sha256(local).hexdigest()[:12]}, gyvai {hashlib.sha256(live).hexdigest()[:12]}')
│ +
│ +print(f'\nSutampa: {ok}/{len(assets)} · skiriasi: {bad}')
│ profiles/deepseek41flash/cache/scratch/audio237.py
│ @@ -0,0 +1,50 @@
│ +"""Garso vientisumas: manifestas <-> diskas <-> gyva svetaine. Tik skaitymas."""
│ +import hashlib
│ +import json
│ +import pathlib
│ +import random
│ +import urllib.request
│ +
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +AUDIO = ROOT / 'assets/audio/lt'
│ +LIVE = 'https://one-man-company.github.io/suprask/assets/audio/lt/'
│ +UA = {'User-Agent': 'suprask-pub-check/237'}
│ +
│ +man = json.loads((AUDIO / 'manifest.json').read_text(encoding='utf-8'))
│ +refs = set()
│ +for key, val in man.items():
│ +    for kind in ('n', 's'):
│ +        if isinstance(val, dict) and val.get(kind):
│ +            refs.add(val[kind])
│ +
│ +on_disk = {str(p.relative_to(AUDIO)) for p in AUDIO.rglob('*.mp3')}
│ +missing = sorted(refs - on_disk)
│ +orphans = sorted(on_disk - refs)
│ +print(f'manifestas: {len(man)} tekstų -> {len(refs)} nuorodų')
│ +print(f'diske: {len(on_disk)} mp3')
│ +print(f'manifest -> diske trūksta: {len(missing)} {missing[:5]}')
│ +print(f'diske be manifesto (našlaičiai): {len(orphans)} {orphans[:5]}')
│ +
│ +random.seed(237)
│ +sample = random.sample(sorted(refs), 12)
│ +codes = []
│ +for rel in sample:
│ +    req = urllib.request.Request(LIVE + rel, headers=UA)
│ +    try:
│ +        with urllib.request.urlopen(req, timeout=30) as r:
│ +            body = r.read()
│ +            codes.append((r.status, len(body), body[:3] == b'ID3', rel))
│ +    except Exception as exc:  # noqa: BLE001
│ +        codes.append((type(exc).__name__, 0, False, rel))
│ +ok = sum(1 for c in codes if c[0] == 200 and c[2])
│ +print(f'gyvas zondas: {ok}/{len(sample)} HTTP 200 + ID3')
│ +for c in codes:
│ +    print(f'  {c[0]} {c[1]} B ID3={c[2]} {c[3]}')
│ +
│ +for rel in ('manifest.json',):
│ +    req = urllib.request.Request(LIVE + rel, headers=UA)
│ +    with urllib.request.urlopen(req, timeout=30) as r:
│ +        live = r.read()
│ +    local = (AUDIO / rel).read_bytes()
│ +    print(f'{rel}: repo {len(local)} B, gyvai {len(live)} B, '
│ +          f'baitais lygus: {hashlib.sha256(live).hexdigest() == hashlib.sha256(local).hexdigest()}')
Sustojau ties įrankių limitu, todėl ataskaita žemiau — visi matavimai atlikti realiai, bet trys įrašai (agents/log/, changelog, state.json) dar neįrašyti.

PAGRINDINIS REZULTATAS

check_published.py (rc=0)
  Repozitorija: 37 moduliai
  Paskelbta:    37 moduliai
  · grade-01: repo 37, gyvai 37
  missing_on_live [], hidden_locally [], not_in_path [], stale [], stale_unknown [],
  path_differs [], unpushed_commits 0, live_error "" ; live_grades [1]
  ✔ Repo ir gyva svetainė sutampa (ID, seka ir failų baitai).

Pastaba dėl #8716: įrankis jau lygina baitus (sha256) ir ima klases iš grades.json, ne vieną kietą grade-01. Filtravau, kad nebūtų pasikartojęs dvigubas darbas — jis jau įgyvendintas.

Git būsena
  HEAD = origin/main = 7e8afe3969f831d658db8f4cf274b633055f8a55 (7e8afe39)
  0 neišstumtų commit'ų, git status --porcelain -uall tuščias.
  refs/remotes/origin/main egzistuoja (rev-parse --verify rc=0) — unpushed skaičius nėra tyliai tuščias.

HTTP kodai (gyva svetainė)
  200  8812 B  content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json
  200  5044 B  content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json
  200  4946 B  content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json
  papildomai: 19-dumai-ir-isejimas 200 (7721 B), index.json 200 (11209 B),
  path.json 200 (1284 B), grades.json 200 (1126 B), index.html 200 (3487 B),
  manifest.json 200 (60762 B)

Baitai (ne skaičiai)
  index.json, path.json, grades.json gyvai sha256 lygūs repo (11209 / 1284 / 1126 B).
  index.html gyvas neša ?v=7e8afe39 (2 žymos) = HEAD pirmi 8 simboliai → svetainė
  pastatyta būtent iš HEAD.
  Assets po pages.yml ?v=<sha8> transformacijos: 18/18 sutampa (index.html, 404.html,
  main.css, app.js, registry.js, progress.js, speech.js + 11 sim failų). Skirtumų 0.

Garsas
  manifestas 543 tekstų → 1086 nuorodų; diske 1086 mp3; trūksta 0; našlaičių 0.
  Gyvas zondas (seed 237): 12/12 HTTP 200, ID3, 14671–56467 B. Gyvas manifest.json =
  repo baitais (60762 B).

Vartai
  validate_content.py --grade 1 --strict → 0 klaidų, 0 įspėjimų (rc 0)
  check_docs_facts.py → 0 klaidų, 0 įspėjimų (9 kryptys, 37 moduliai)
  check_agents.py → 15 vaidmenų, 1 įspėjimas (seni pasiūlymai >3 d., buvo prieš)

Naršyklė prieš gyvą svetainę (check_view.py --base live)
  25-ilgis-ir-vienetas @390/360 → 2 patikros, 0 problemų
  19-dumai-ir-isejimas @390/360 → 2 patikros, 0 problemų

KAS PASIKEITĖ NUO PRAĖJUSIO CHANGELOG ĮRAŠO (2026-11-09 23:06, 35 moduliai)
  35 → 37: pridėti 19-dumai-ir-isejimas (commit 87c18e2, #217) ir
  25-ilgis-ir-vienetas (commit d781856, #218). Abu gyvai, baitais lygūs, kelyje.

SPRENDIMAS: sutampa
  Repo 37 / paskelbta 37, 0 neišstumtų, 0 stale, ID nepasikeitę, baitai sutampa
  (moduliai, index/path/grades, assets 18/18, manifest), garsas gyvas.
  Vaiko localStorage pažangai niekas negresia. Nieko nešalinta, nepernumeruota,
  path.json nekeistas.

NEBAIGTA (sąžiningai — baigėsi įrankių kvota)
  1) agents/log/publikavimo-agentas-2026-11-11T1933.md — įrašyti aukščiau esantį turinį.
  2) research/wiki/changelog.md — viena eilutė VIRŠUJE (prieš 2026-11-09 23:06 įrašą):
     "## 2026-11-11 (19:40) — Publikavimo patikra #237: repo 37 / paskelbta 37,
      svetainė pastatyta iš 7e8afe39" + 3–4 punktai tais pačiais skaičiais.
  3) agents/state.json → last_publish_check: run_id 237, role publikavimo-agentas,
     head_sha/main_sha 7e8afe3969f831d658db8f4cf274b633055f8a55, unpushed_commits 0,
     modules_local 37, modules_live 37, decision "sutampa", log kelias iš (1).
  Papildomai svarstytas vienas pasiūlymas (neparašytas): check_published.py lygina
  modulių baitus, bet ne index.json/path.json/grades.json baitus — šiandien juos
  tikrinau rankiniu zond'u; tai #8716 tąsa, ne naujas defektas. Naujos pamokos
  (LL-81) nemačiau — joks defektas nepasikartojo.

## klaidos

```
session_id: local-154aada1ed249332335cd5fe30cdf7ddfbeece6773f285a0a53179c1e2b5d5f2
```
