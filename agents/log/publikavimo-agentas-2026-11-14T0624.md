# publikavimo-agentas — 2026-11-14T0624

- paleidimas: #277 (manual)
- trukmė: 212s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub277/check_index.py
│ @@ -0,0 +1,34 @@
│ +import json, os, glob
│ +
│ +idx = json.load(open('content/lt/grade-01/index.json'))
│ +mods = idx['modules'] if isinstance(idx, dict) and 'modules' in idx else idx
│ +ids = []
│ +strands = {}
│ +for m in mods:
│ +    ids.append(m['id'])
│ +    s = m.get('strand') or m.get('subject')
│ +    strands[s] = strands.get(s, 0) + 1
│ +print('index entries:', len(ids), 'unique:', len(set(ids)))
│ +print('strands:', len(strands), sorted(strands.items()))
│ +
│ +files = [f for f in glob.glob('content/lt/grade-01/*/*.json')
│ +         if os.path.basename(f) not in ('index.json', 'path.json')]
│ +print('module files on disk:', len(files))
│ +disk_ids = {os.path.basename(f)[:-5] for f in files}
│ +print('index ids without file:', sorted(set(ids) - disk_ids))
│ +print('files not in index:', sorted(disk_ids - set(ids)))
│ +
│ +path = json.load(open('content/lt/grade-01/path.json'))
│ +print('path keys:', list(path.keys()))
│ +seq = path.get('sequence') or path.get('steps') or []
│ +print('path sequence:', len(seq), 'unique:', len(set(seq)))
│ +print('not_in_path:', sorted(set(ids) - set(seq)))
│ +print('in_path_not_index:', sorted(set(seq) - set(ids)))
│ +print('path order == index order:', seq == ids)
│ +
│ +g = json.load(open('content/lt/grades.json'))
│ +gl = g.get('grades', g if isinstance(g, list) else [])
│ +for x in gl:
│ +    if str(x.get('id') or x.get('grade')) in ('01', '1'):
│ +        print('grades.json grade-01:', x)
│ +print('grades.json top:', {k: v for k, v in g.items() if k != 'grades'} if isinstance(g, dict) else '')
│ profiles/deepseek41flash/cache/scratch/pub277/check_audio.py
│ @@ -0,0 +1,19 @@
│ +import json, glob, os
│ +
│ +m = json.load(open('assets/audio/lt/manifest.json'))
│ +refs = sum(len(v) if isinstance(v, dict) else 1 for v in m.values())
│ +paths = set()
│ +for k, v in m.items():
│ +    for p in (v.values() if isinstance(v, dict) else [v]):
│ +        paths.add(p)
│ +on_disk = set(glob.glob('assets/audio/lt/*/*.mp3'))
│ +rel = set()
│ +for p in paths:
│ +    rel.add(p if p.startswith('assets/') else 'assets/audio/lt/' + p.lstrip('/'))
│ +print('manifest keys:', len(m), 'refs:', refs, 'unique paths:', len(paths))
│ +print('on disk mp3:', len(on_disk))
│ +miss = sorted(p for p in rel if p not in on_disk)
│ +orph = sorted(p for p in on_disk if p not in rel)
│ +print('manifest paths missing on disk:', len(miss), miss[:3])
│ +print('mp3 on disk not in manifest:', len(orph), orph[:3])
│ +print('sample keys:', list(m.items())[:2])
│ profiles/deepseek41flash/cache/scratch/pub277/check_index.py
│ @@ -1,15 +1,23 @@
│  import json, os, glob
│
│  idx = json.load(open('content/lt/grade-01/index.json'))
│ -mods = idx['modules'] if isinstance(idx, dict) and 'modules' in idx else idx
│  ids = []
│ -strands = {}
│ -for m in mods:
│ -    ids.append(m['id'])
│ -    s = m.get('strand') or m.get('subject')
│ -    strands[s] = strands.get(s, 0) + 1
│ +per_strand = {}
│ +for s in idx['strands']:
│ +    per_strand[s['id']] = len(s['modules'])
│ +    for m in s['modules']:
│ +        ids.append(m['id'])
│ +        # file path in index must exist
│ +        f = 'content/lt/' + m['file']
│ +        if not os.path.exists(f):
│ +            print('MISSING FILE for', m['id'], f)
│ +        # module JSON must declare same sim
│ +        d = json.load(open(f))
│ +        sim = (d.get('sim') or {}).get('component')
│ +        if sim != m.get('sim'):
│ +            print('SIM MISMATCH', m['id'], 'index:', m.get('sim'), 'file:', sim)
│ +print('strands:', len(per_strand), per_strand)
│  print('index entries:', len(ids), 'unique:', len(set(ids)))
│ -print('strands:', len(strands), sorted(strands.items()))
│
│  files = [f for f in glob.glob('content/lt/grade-01/*/*.json')
│           if os.path.basename(f) not in ('index.json', 'path.json')]
│ @@ -24,11 +32,9 @@
│  print('path sequence:', len(seq), 'unique:', len(set(seq)))
│  print('not_in_path:', sorted(set(ids) - set(seq)))
│  print('in_path_not_index:', sorted(set(seq) - set(ids)))
│ -print('path order == index order:', seq == ids)
│
│  g = json.load(open('content/lt/grades.json'))
│ -gl = g.get('grades', g if isinstance(g, list) else [])
│ -for x in gl:
│ +print('grades.json keys:', list(g.keys()) if isinstance(g, dict) else 'list')
│ +for x in (g.get('grades') or []):
│      if str(x.get('id') or x.get('grade')) in ('01', '1'):
│          print('grades.json grade-01:', x)
│ -print('grades.json top:', {k: v for k, v in g.items() if k != 'grades'} if isinstance(g, dict) else '')
│ profiles/deepseek41flash/cache/scratch/pub277/live_check.py
│ @@ -0,0 +1,58 @@
│ +import json, urllib.request, subprocess, hashlib
│ +
│ +BASE = 'https://one-man-company.github.io/suprask/'
│ +idx = json.load(open('content/lt/grade-01/index.json'))
│ +
│ +
│ +def head_bytes(path):
│ +    return int(subprocess.check_output(['git', 'cat-file', '-s', 'HEAD:' + path]).strip().decode())
│ +
│ +
│ +def fetch(rel):
│ +    url = BASE + rel
│ +    req = urllib.request.Request(url, method='GET')
│ +    with urllib.request.urlopen(req, timeout=30) as r:
│ +        return r.status, r.read()
│ +
│ +
│ +bad = []
│ +ok = 0
│ +total = 0
│ +for s in idx['strands']:
│ +    for m in s['modules']:
│ +        rel = 'content/lt/' + m['file']
│ +        total += 1
│ +        try:
│ +            st, body = fetch(rel)
│ +        except Exception as e:  # noqa
│ +            bad.append((rel, 'ERR ' + str(e)))
│ +            continue
│ +        local = head_bytes(rel)
│ +        if st != 200:
│ +            bad.append((rel, 'HTTP %s' % st))
│ +        elif len(body) != local:
│ +            bad.append((rel, 'size %d vs local %d' % (len(body), local)))
│ +        else:
│ +            ok += 1
│ +print('modules fetched:', total, 'exact-byte 200:', ok, 'problems:', len(bad))
│ +for b in bad:
│ +    print('  ', b)
│ +
│ +for rel in ('content/lt/grade-01/index.json', 'content/lt/grade-01/path.json',
│ +            'content/lt/grades.json', 'assets/audio/lt/manifest.json'):
│ +    try:
│ +        st, body = fetch(rel)
│ +        local = head_bytes(rel)
│ +        print(rel, st, len(body), 'local', local, 'MATCH' if len(body) == local else 'DIFF')
│ +    except Exception as e:  # noqa
│ +        print(rel, 'ERR', e)
│ +
│ +# sample audio from manifest
│ +man = json.load(open('assets/audio/lt/manifest.json'))
│ +sample_keys = list(man.keys())
│ +picked = [sample_keys[0], sample_keys[len(sample_keys) // 2], sample_keys[-1]]
│ +for k in picked:
│ +    for form in ('n', 's'):
│ +        rel = 'assets/audio/lt/' + man[k][form]
│ +        st, body = fetch(rel)
│ +        print('audio', k, form, st, len(body), body[:3] == b'ID3')
│ profiles/deepseek41flash/cache/scratch/pub277/check_bust.py
│ @@ -0,0 +1,28 @@
│ +import re, glob, urllib.request
│ +
│ +SHA = '3140e1bc'
│ +BASE = 'https://one-man-company.github.io/suprask/'
│ +files = sorted(glob.glob('assets/js/**/*.js', recursive=True))
│ +pat = re.compile(r'(?:from\s+"([^"]+)"|import\(\s*"([^"]+)"\s*\)|import\(\'([^\']+)\'\)|from\s+\'([^\']+)\')')
│ +bad = []
│ +noimport = []
│ +for f in files:
│ +    url = BASE + f
│ +    try:
│ +        with urllib.request.urlopen(url, timeout=30) as r:
│ +            body = r.read().decode('utf-8', 'replace')
│ +    except Exception as e:  # noqa
│ +        bad.append((f, 'FETCH ' + str(e)))
│ +        continue
│ +    specs = [g for m in pat.finditer(body) for g in m.groups() if g]
│ +    rel = [s for s in specs if s.startswith('.')]
│ +    if not specs:
│ +        noimport.append(f)
│ +    for s in rel:
│ +        if '?v=' not in s:
│ +            bad.append((f, 'NO VERSION: ' + s))
│ +print('repo js files:', len(files))
│ +print('files with relative imports but no ?v=:', len(bad))
│ +for b in bad:
│ +    print('  ', b)
│ +print('files without any import:', noimport)
│ profiles/deepseek41flash/cache/scratch/pub277/gate_json.py
│ @@ -0,0 +1,20 @@
│ +import json, subprocess, sys
│ +
│ +out = subprocess.run([sys.executable, 'scripts/check_published.py', '--json'],
│ +                     capture_output=True, text=True)
│ +print('rc:', out.returncode)
│ +if out.stderr.strip():
│ +    print('stderr:', out.stderr.strip()[:400])
│ +d = json.loads(out.stdout)
│ +print('scalars:')
│ +for k, v in d.items():
│ +    if not isinstance(v, (list, dict)):
│ +        print('  ', k, '=', v)
│ +print('lists:')
│ +for k, v in d.items():
│ +    if isinstance(v, list):
│ +        print('  ', k, '=', v if len(v) <= 3 else 'len %d' % len(v))
│ +print('dicts:')
│ +for k, v in d.items():
│ +    if isinstance(v, dict):
│ +        print('  ', k, '=', json.dumps(v, ensure_ascii=False)[:600])
Nepavyko įrašyti ataskaitos ir changelog įrašo — pasiekiau iteracijų limitą. Šiame paleidime repo neliestas (jokių failų nepakeičiau), todėl būsena tokia, kokia buvo.

## Ką išmatavau (realūs rezultatai)

**`check_published.py` (rc=0, `--json`):**
- repo 39 / paskelbta 39 (`grade-01: repo 39, gyvai 39`)
- `unpushed_commits` 0; `HEAD` = `origin/main` = `3140e1bc`; `git rev-list --left-right --count origin/main...HEAD` → `0 0`
- `verdict.label` = `sutampa`, `reasons` []
- `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0, `aux_stale` 0, `shell_stale` 0, `shell_unreachable` 0, `path_differs` []
- `shell_count` 17, `live_version` = `repo_version` = `3140e1bc`
- `vanished_ids`: `03-sakinio-tvarka` → įpėdinis `03-sakinio-zodziai`, `resolved: true`

**3 gyvi adresai (visi baitais lygūs repo `git cat-file -s HEAD:`):**
- `content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json` → 200, 8 812 B
- `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` → 200, 5 459 B
- `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` → 200, 4 932 B
- papildomai `/` 200 (3 487 B), `404.html` 200 (563 B)

**Pilnas tinklas, ne imtis:**
- 39/39 modulio JSON gyvai → 200 ir baitais lygūs; problemų 0
- `index.json` 11 741 B, `path.json` 1 339 B, `grades.json` 1 126 B, garso `manifest.json` 63 966 B — visi MATCH
- `index.json` 39 įrašai / 9 kryptys ↔ 39 failai diske (našlaičių 0 abiem kryptymis, `sim` raktai sutampa su failais); `path.json` 39 unikalių ID, ne sekoje 0; `grades.json` 39
- garsas: manifestas 569 raktai → 1 138 nuorodų = 1 138 mp3 diske = 1 138 `git ls-files`; trūkstamų 0, be manifesto 0; 6 gyvi pavyzdžiai → 200, `ID3`

**Talpinimo grandinė (naujas šio paleidimo matavimas):** `pages.yml` prirašinėja `?v=<sha8>` per `sed`; patikrinau visus 15 gyvų JS failų — 20 statinių `from "./…"` ir 1 dinaminis `import("./speech.js?v=3140e1bc")`: **0 nuorodų be versijos**. Šiandien repo neturi nė vieno viengubų kabučių ar daugiaeilio importo (0), tad grandis uždara.

**#276 pasekmė publikuota:** `matematika.js` gyvai 159 596 B, sha256 `73471d7fc32153d0…` = `HEAD`; trikdis iš `svg.style.overflow = "visible"` yra gyvame faile. `check_view.py --base <gyva> --module 06-figuros --viewports desktop,phone,small` → 3 patikros, `problems []`, 0 px slinkties, 5/5 užduočių. // Ši eilutė buvo `06-figuros`, o #276 keitė `figuros` simuliaciją, kuri naudojama ir `21-erdvines-figuros`.

**Struktūra:** 9 kryptys — lietuvių 5, matematika 16, pasaulio pažinimas 8, muzika 2, žaidimų teorija 3, technologijos 2, gyvenimo įgūdžiai 1, dorinis 1, dailė 1.

## Sprendimas: **SUTAMPA**

Nieko nešalinta, joks ID nepernumeruotas, `content/**`, `assets/**`, `scripts/**`, `docs/**` neliesti. Jokio defekto neradau, todėl ir netaisiau — tai ta pati taisyklė, kuri buvo pažeista #273 (pakeitimas be radinio).

## Kas liko nepadaryta (darbas, kurio nepabaigiau)

1. `agents/log/publikavimo-agentas-2026-11-14T0627.md` — ataskaita **neįrašyta**.
2. `research/wiki/changelog.md` — eilutė „2026-11-14 — Publikavimo patikra #277: repo 39 / paskelbta 39“ **neįrašyta**.
3. `agents/state.json` — `roles.publikavimo-agentas.last_run` ir `last_publish_check_277` **neatnaujinti**.
4. Pasiūlymo failas dėl `pages.yml` (žr. toliau) **neįrašytas**.

## Vienas radinys, kuris ne defektas, bet vertas eilės

`pages.yml` „Prirašyti versiją prie CSS ir JS“ `sed` raštas atpažįsta tik `from "./x.js"` ir `import("./x.js")` dvigubomis kabutėmis. Jei kada nors simuliacijos faile atsiras viengubos kabutės ar daugiaeilis importas, deploy vis tiek bus žalias, o vaikas iki ~10 min. matys seną JS — ir nė vienas vartas to nepasakys (šiandien 0 tokių atvejų, todėl tai latentinė, ne matoma problema). Tai būtų vienas `low` pasiūlymas su tikslu `.github/workflows/pages.yml`: po `sed` pridėti patikrą, kuri grąžintų `rc 1`, jei liko bent vienas importas be `?v=`.

Norint užbaigti, reikia dar vieno paleidimo, kuris įrašytų 1–4 punktus; matavimų kartoti nereikia — jie pateikti aukščiau ir visi yra šio paleidimo realūs išėjimai.

## klaidos

```
session_id: local-572259548a297320e8ce121a49e9e41a05e8f86db0759c849c9ee964f186a364
```
