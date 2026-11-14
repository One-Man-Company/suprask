# publikavimo-agentas — 2026-11-14T1143

- paleidimas: #285 (manual)
- trukmė: 240s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/probe285_audio.py
│ @@ -0,0 +1,33 @@
│ +import json, pathlib, sys
│ +
│ +root = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +man = json.loads((root / 'assets/audio/lt/manifest.json').read_text(encoding='utf-8'))
│ +files = {p.name for p in (root / 'assets/audio/lt/n').glob('*.mp3')} | \
│ +        {p.name for p in (root / 'assets/audio/lt/s').glob('*.mp3')}
│ +refs = set()
│ +shape = {}
│ +for k, v in man.items():
│ +    shape[type(v).__name__] = shape.get(type(v).__name__, 0) + 1
│ +    if isinstance(v, dict):
│ +        for voice, name in v.items():
│ +            refs.add(name if str(name).endswith('.mp3') else str(name) + '.mp3')
│ +    elif isinstance(v, list):
│ +        for name in v:
│ +            refs.add(name if str(name).endswith('.mp3') else str(name) + '.mp3')
│ +    elif isinstance(v, str):
│ +        refs.add(v if v.endswith('.mp3') else v + '.mp3')
│ +print('manifest keys', len(man), 'shape', shape)
│ +print('refs', len(refs), 'files on disk', len(files))
│ +print('missing on disk', len(refs - files), sorted(refs - files)[:5])
│ +print('orphan on disk', len(files - refs), sorted(files - refs)[:5])
│ +
│ +# deleted / added by b089f3e must be consistent with manifest
│ +deleted = ['0379335dceaabec9-5d423f9c.mp3', '0ab991d7bf12a353-6db070b8.mp3',
│ +           '2425fde6a44ff0ec-1a134412.mp3', '0379335dceaabec9-322b74bd.mp3',
│ +           '0ab991d7bf12a353-a10394d6.mp3']
│ +added = ['33b9b9c23825b7b4-3ed6d89a.mp3', '82ab868b2295f338-3c27274f.mp3',
│ +         '944a34af81067786-feb719fd.mp3', '33b9b9c23825b7b4-023c3b5f.mp3',
│ +         '82ab868b2295f338-3fee3cf6.mp3', '944a34af81067786-6b54f2f2.mp3']
│ +print('deleted still in manifest:', [d for d in deleted if d in refs])
│ +print('added missing from manifest:', [a for a in added if a not in refs])
│ +print('deleted still on disk:', [d for d in deleted if d in files])
│ profiles/deepseek41flash/cache/scratch/probe285_audio.py
│ @@ -1,33 +1,27 @@
│ -import json, pathlib, sys
│ +import json, pathlib
│
│  root = pathlib.Path('/home/zoltanas/workspace/suprask')
│  man = json.loads((root / 'assets/audio/lt/manifest.json').read_text(encoding='utf-8'))
│ -files = {p.name for p in (root / 'assets/audio/lt/n').glob('*.mp3')} | \
│ -        {p.name for p in (root / 'assets/audio/lt/s').glob('*.mp3')}
│ +files = {}
│ +for sub in ('n', 's'):
│ +    for p in (root / 'assets/audio/lt' / sub).glob('*.mp3'):
│ +        files[f'{sub}/{p.name}'] = p
│  refs = set()
│ -shape = {}
│  for k, v in man.items():
│ -    shape[type(v).__name__] = shape.get(type(v).__name__, 0) + 1
│ -    if isinstance(v, dict):
│ -        for voice, name in v.items():
│ -            refs.add(name if str(name).endswith('.mp3') else str(name) + '.mp3')
│ -    elif isinstance(v, list):
│ -        for name in v:
│ -            refs.add(name if str(name).endswith('.mp3') else str(name) + '.mp3')
│ -    elif isinstance(v, str):
│ -        refs.add(v if v.endswith('.mp3') else v + '.mp3')
│ -print('manifest keys', len(man), 'shape', shape)
│ -print('refs', len(refs), 'files on disk', len(files))
│ -print('missing on disk', len(refs - files), sorted(refs - files)[:5])
│ -print('orphan on disk', len(files - refs), sorted(files - refs)[:5])
│ +    for voice, name in v.items():
│ +        name = str(name)
│ +        refs.add(name if name.endswith('.mp3') else name + '.mp3')
│ +print('manifest keys', len(man), 'refs', len(refs), 'files on disk', len(files))
│ +print('missing on disk', len(refs - set(files)), sorted(refs - set(files))[:5])
│ +print('orphans on disk', len(set(files) - refs), sorted(set(files) - refs)[:5])
│
│ -# deleted / added by b089f3e must be consistent with manifest
│ -deleted = ['0379335dceaabec9-5d423f9c.mp3', '0ab991d7bf12a353-6db070b8.mp3',
│ -           '2425fde6a44ff0ec-1a134412.mp3', '0379335dceaabec9-322b74bd.mp3',
│ -           '0ab991d7bf12a353-a10394d6.mp3']
│ -added = ['33b9b9c23825b7b4-3ed6d89a.mp3', '82ab868b2295f338-3c27274f.mp3',
│ -         '944a34af81067786-feb719fd.mp3', '33b9b9c23825b7b4-023c3b5f.mp3',
│ -         '82ab868b2295f338-3fee3cf6.mp3', '944a34af81067786-6b54f2f2.mp3']
│ -print('deleted still in manifest:', [d for d in deleted if d in refs])
│ -print('added missing from manifest:', [a for a in added if a not in refs])
│ +deleted = ['s/0379335dceaabec9-322b74bd.mp3', 's/0ab991d7bf12a353-a10394d6.mp3',
│ +           'n/0379335dceaabec9-5d423f9c.mp3', 'n/0ab991d7bf12a353-6db070b8.mp3',
│ +           'n/2425fde6a44ff0ec-1a134412.mp3']
│ +added = ['s/33b9b9c23825b7b4-023c3b5f.mp3', 's/82ab868b2295f338-3fee3cf6.mp3',
│ +         's/944a34af81067786-6b54f2f2.mp3', 'n/33b9b9c23825b7b4-3ed6d89a.mp3',
│ +         'n/82ab868b2295f338-3c27274f.mp3', 'n/944a34af81067786-feb719fd.mp3']
│ +print('deleted still referenced:', [d for d in deleted if d in refs])
│ +print('added not referenced:', [a for a in added if a not in refs])
│  print('deleted still on disk:', [d for d in deleted if d in files])
│ +print('added not on disk:', [a for a in added if a not in files])
│ profiles/deepseek41flash/cache/scratch/probe285_versions.py
│ @@ -0,0 +1,25 @@
│ +import re, urllib.request, pathlib, subprocess
│ +
│ +LIVE = 'https://one-man-company.github.io/suprask/'
│ +root = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +files = subprocess.run(['git', 'ls-files', 'assets/js'], cwd=root, capture_output=True, text=True).stdout.split()
│ +rel = re.compile(r"""(?:from|import)\s*\(?\s*["']([^"']+)["']""")
│ +bad, total = [], 0
│ +for f in files:
│ +    if not f.endswith('.js'):
│ +        continue
│ +    try:
│ +        text = urllib.request.urlopen(LIVE + f, timeout=25).read().decode('utf-8', 'replace')
│ +    except Exception as exc:
│ +        bad.append((f, f'unreachable {type(exc).__name__}'))
│ +        continue
│ +    for m in rel.finditer(text):
│ +        spec = m.group(1)
│ +        if not spec.startswith('.'):
│ +            continue
│ +        total += 1
│ +        if '?v=' not in spec:
│ +            bad.append((f, spec))
│ +print('live js files', len([f for f in files if f.endswith('.js')]), 'relative imports', total, 'without ?v=', len(bad))
│ +for item in bad[:10]:
│ +    print(' ', item)
│ profiles/deepseek41flash/cache/scratch/probe285_live_audio.py
│ @@ -0,0 +1,45 @@
│ +import json, pathlib, urllib.request, urllib.error
│ +from concurrent.futures import ThreadPoolExecutor
│ +
│ +LIVE = 'https://one-man-company.github.io/suprask/'
│ +root = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +UA = {'User-Agent': 'suprask-check/1.2'}
│ +
│ +live_man_bytes = urllib.request.urlopen(
│ +    urllib.request.Request(LIVE + 'assets/audio/lt/manifest.json', headers=UA), timeout=30).read()
│ +repo_man_bytes = (root / 'assets/audio/lt/manifest.json').read_bytes()
│ +import hashlib
│ +print('live manifest bytes', len(live_man_bytes), 'sha', hashlib.sha256(live_man_bytes).hexdigest()[:16])
│ +print('repo manifest bytes', len(repo_man_bytes), 'sha', hashlib.sha256(repo_man_bytes).hexdigest()[:16])
│ +print('equal', live_man_bytes == repo_man_bytes)
│ +
│ +man = json.loads(live_man_bytes.decode('utf-8'))
│ +paths = []
│ +for k, v in man.items():
│ +    for voice, name in v.items():
│ +        name = str(name)
│ +        paths.append(name if name.endswith('.mp3') else name + '.mp3')
│ +print('live manifest keys', len(man), 'urls', len(paths), 'unique', len(set(paths)))
│ +
│ +
│ +def check(p):
│ +    url = LIVE + 'assets/audio/lt/' + p
│ +    try:
│ +        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=25) as r:
│ +            body = r.read()
│ +            return p, r.status, len(body), body[:3]
│ +    except urllib.error.HTTPError as e:
│ +        return p, e.code, 0, b''
│ +    except Exception as e:
│ +        return p, type(e).__name__, 0, b''
│ +
│ +
│ +with ThreadPoolExecutor(max_workers=16) as pool:
│ +    res = list(pool.map(check, sorted(set(paths))))
│ +
│ +bad = [r for r in res if r[1] != 200 or r[3] != b'ID3']
│ +print('checked', len(res), 'not 200/ID3:', len(bad))
│ +for r in bad[:10]:
│ +    print('  BAD', r[0], r[1], r[2])
│ +sizes = [r[2] for r in res if r[1] == 200]
│ +print('size min/max', min(sizes), max(sizes), 'total MB', round(sum(sizes) / 1048576, 2))
│ profiles/deepseek41flash/cache/scratch/probe285_sed.py
│ @@ -0,0 +1,26 @@
│ +import pathlib, subprocess, shutil, os
│ +
│ +d = pathlib.Path('/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub285')
│ +shutil.rmtree(d, ignore_errors=True)
│ +d.mkdir(parents=True)
│ +sample = d / 'sim.js'
│ +sample.write_text(
│ +    'import { a } from "./art.js";\n'
│ +    "import { b } from './helper.js';\n"
│ +    'import {\n  c,\n} from "./registry.js";\n'
│ +    'const x = () => import("./speech.js");\n'
│ +    "const y = () => import('./other.js');\n",
│ +    encoding='utf-8')
│ +SHA = 'deadbeef'
│ +# ta pati eilutė kaip .github/workflows/pages.yml:39-40
│ +subprocess.run(
│ +    ['sed', '-i', '-E',
│ +     's|(from "\\.[^"]+\\.js)"|\\1?v=' + SHA + '"|g; '
│ +     's|(import\\("\\.[^"]+\\.js)"\\)|\\1?v=' + SHA + '")|g', str(sample)],
│ +    check=True)
│ +print(sample.read_text())
│ +text = sample.read_text()
│ +import re
│ +bad = re.findall(r"""(?:from|import)\(?\s*["']\.[^"']*["']""", text)
│ +print('relative specifiers found:', len(bad))
│ +print('without ?v:', [s for s in bad if '?v=' not in s])
│ profiles/deepseek41flash/cache/scratch/probe285_index.py
│ @@ -0,0 +1,27 @@
│ +import json, pathlib
│ +
│ +root = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +gd = root / 'content/lt/grade-01'
│ +idx = json.loads((gd / 'index.json').read_text(encoding='utf-8'))
│ +path = json.loads((gd / 'path.json').read_text(encoding='utf-8'))
│ +grades = json.loads((root / 'content/lt/grades.json').read_text(encoding='utf-8'))
│ +files = {p.stem for p in gd.glob('*/*.json') if p.name not in ('index.json', 'path.json')}
│ +ids, sims = [], []
│ +for s in idx['strands']:
│ +    for m in s['modules']:
│ +        ids.append(m['id'])
│ +        sims.append(m.get('sim'))
│ +        declared = (json.loads((root / 'content/lt' / m['file']).read_text(encoding='utf-8')).get('sim') or {}).get('component')
│ +        if declared != m.get('sim'):
│ +            print('SIM MISMATCH', m['id'], m.get('sim'), declared)
│ +seq = path['sequence']
│ +print('strands', len(idx['strands']), {s['id']: len(s['modules']) for s in idx['strands']})
│ +print('index entries', len(ids), 'unique', len(set(ids)))
│ +print('files on disk', len(files), 'index-without-file', sorted(set(ids) - files), 'file-not-in-index', sorted(files - set(ids)))
│ +print('path seq', len(seq), 'unique', len(set(seq)), 'not_in_path', sorted(set(ids) - set(seq)), 'in_path_not_index', sorted(set(seq) - set(ids)))
│ +print('path order == index order:', seq == ids)
│ +print('grades.json grade1:', [g for g in grades['grades'] if int(g.get('grade', 0)) == 1])
│ +for name in ('index.json', 'path.json'):
│ +    print(name, (gd / name).stat().st_size, 'B')
│ +print('grades.json', (root / 'content/lt/grades.json').stat().st_size, 'B')
│ +print('manifest', (root / 'assets/audio/lt/manifest.json').stat().st_size, 'B')
Nepabaigiau iki galo – baigėsi iteracijų limitas. Toliau pateikiu, ką tikrai išmatavau šiame paleidime, ir kas liko neįrašyta.

## check_published.py (rc=0)

```
Repozitorija: 39 moduliai
Paskelbta:    39 moduliai
  · grade-01: repo 39, gyvai 39
Pervadinti ID, priimta ir užregistruota (1):
  - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai,
  svetainės kodas 17 failų, versija d38e8496)
```

Neišstumta commit'ų: 0 (`git rev-list --count origin/main..HEAD` → 0). `HEAD` = `d38e849`, gyvas `index.html` neša `?v=d38e8496`.

## 3 gyvi adresai (200)

- `matematika/25-ilgis-ir-vienetas.json` → 200
- `lietuviu-kalba/01-garsas-ir-raide.json` → 200
- `pasaulio-pazinimas/16-vandens-busenos.json` → 200

## Kiti šio paleidimo matavimai

- **#284 pasekmė publikuota:** gyvas `17-judejimas.json` sha256 = `HEAD` (`232b5254…`); `pasaulis.js` gyvai, nuėmus `?v=`, sha256 = repo (`5e82bce7…`), versijos žymė `d38e8496`.
- **Naršyklė prieš gyvą bazę:** `check_view.py --base <gyva> --module 17-judejimas --viewports desktop,phone,small` → 3 patikros, `problems []`, 0 px slinkties, 4/4 užduočių, 8 sim valdikliai, 0 konsolės klaidų.
- **Talpinimo grandinė:** 15 gyvų JS failų, 21 santykinis importas, **0 be `?v=`**. Repo: 0 viengubų kabučių importų.
- **Garsas (repo):** manifestas 569 raktai → 1 138 nuorodų = 1 138 mp3 diske, trūkstamų 0, našlaičių 0. #284 ištrinti 5 mp3 nebeliko manifeste (0), pridėti 6 — visi manifeste (0 neatitikimų). Gyvai: ištrinti → 404 (taip ir turi būti), pridėti → 200. `check_audio.py` ✔ 569 tekstų / 1 138 įrašų.
- **Struktūra:** 9 kryptys (matematika 16, pasaulio pažinimas 8, lietuvių 5, žaidimų teorija 3, muzika 2, technologijos 2, gyvenimo įgūdžiai 1, dorinis 1, dailė 1); `index.json` 39 = 39 failai = `path.json` 39 (našlaičių 0 abiem kryptimis); `sim` raktai sutampa su failais. Baitai: `index.json` 11 741 B, `path.json` 1 339 B, `grades.json` 1 126 B, manifestas 63 974 B.
- **`pages.yml` spraga įrodyta vykdant:** nukopijavau failą su penkiais importais ir paleidau tą pačią `sed` eilutę — viengubų kabučių `from './helper.js'` ir `import('./other.js')` liko **be `?v=`**, dvigubų kabučių ir daugiaeiliai — su versija. Tai latentinė, šiandien neaktyvi problema (repo tokių importų 0).

## Sprendimas: **SUTAMPA**

Nieko nešalinta, joks ID nepernumeruotas, `content/**`, `assets/**`, `scripts/**`, `docs/**` neliesti. Defekto, kurį reikėtų taisyti, neradau — taisyti be radinio būtų ta pati klaida, kuri buvo #273.

## Kas liko nepadaryta (reikia dar vieno paleidimo)

1. `agents/log/publikavimo-agentas-2026-11-14T1143.md` — ataskaita **neįrašyta**.
2. `research/wiki/changelog.md` — #285 eilutė **neįrašyta** (paskutinis įrašas yra #275; #277 eilutės taip pat nėra — jos matavimai yra `agents/log/publikavimo-agentas-2026-11-14T0624.md:229–253`, HEAD tuo metu buvo `3140e1bc`).
3. `agents/state.json` — `roles.publikavimo-agentas.last_run` (dabar `2026-11-14T06:28:06`) ir `last_publish_check` (dabar #251) **neatnaujinti**.
4. Pasiūlymo failas dėl `pages.yml` **neįrašytas**: `agents/proposals/2026-11-14-publikavimo-agentas-pages-versija-importams.json`, `type: struktura`, `priority: low`, `target: .github/workflows/pages.yml` — po `sed` (pages.yml:39–40) pridėti patikrą, kuri grąžina `rc 1`, jei liko bent vienas santykinis importas be `?v=`; evidence: `pages.yml:39–40`, mano `sed` testas, 21/21 gyvų importų su versija šiandien.

5. **Neužbaigtas matavimas:** pilnas gyvo garso tinklas (1 138 URL) — foninis procesas `proc_4fd3825c26d1` dar veikė, kai baigėsi iteracijos. Patvirtinta tik tiek: gyvas manifestas 63 974 B = repo baitai, 569 raktai, 1 138 unikalių nuorodų. Likusių 1 135 mp3 HTTP kodų **netvirtinu** — jų nemariavau.

## Naujų pamokų

Naujo defekto tipo neradau. Savo zonde pats pirmą kartą palyginau manifesto nuorodas su `n/…` prefiksu prieš bare failų vardus ir gavau „1 138 trūksta / 1 138 našlaičių“ — tai LL-37 klasės artefaktas (palyginimas, kuris lygina ne tuos raktus ir praneša pilną rezultatą). Pataisęs paleidau iš naujo: 0 ir 0. Pamokos nepridėjau, nes tipas jau yra sąraše.

## klaidos

```
session_id: local-350858f24b68ca189f2617add75b66a8c99b9a0ea5060e1526f5994656545705
```
