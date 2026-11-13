# publikavimo-agentas — 2026-11-13T2302

- paleidimas: #275 (manual)
- trukmė: 314s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/orphans.py
│ @@ -0,0 +1,27 @@
│ +import json, glob, os, sys
│ +
│ +root = '/home/zoltanas/workspace/suprask'
│ +os.chdir(root)
│ +
│ +idx = json.load(open('content/lt/grade-01/index.json'))
│ +ref = set()
│ +for s in idx['strands']:
│ +    for m in s['modules']:
│ +        ref.add('content/lt/' + m['file'])
│ +files = set(glob.glob('content/lt/grade-01/*/*.json'))
│ +print('index refs', len(ref), 'files on disk', len(files))
│ +print('file not in index:', sorted(files - ref))
│ +print('index entry w/o file:', sorted(ref - files))
│ +
│ +# path.json vs index
│ +p = json.load(open('content/lt/grade-01/path.json'))
│ +seq = p.get('sequence', [])
│ +ids = {m['id'] for s in idx['strands'] for m in s['modules']}
│ +print('path entries', len(seq), 'unique', len(set(seq)))
│ +print('in path not in index:', sorted(set(seq) - ids))
│ +print('in index not in path:', sorted(ids - set(seq)))
│ +
│ +# audio manifest vs module texts (rough): count missing text keys
│ +man = json.load(open('assets/audio/lt/manifest.json'))
│ +keys = set(man.keys()) if isinstance(man, dict) else set()
│ +print('manifest entries', len(keys), 'type', type(man).__name__)
│ profiles/deepseek41flash/cache/scratch/audio_check.py
│ @@ -0,0 +1,41 @@
│ +import json, os, collections
│ +
│ +root = '/home/zoltanas/workspace/suprask'
│ +os.chdir(root)
│ +man = json.load(open('assets/audio/lt/manifest.json'))
│ +items = list(man.items())[:3]
│ +print('sample:', json.dumps(items, ensure_ascii=False)[:400])
│ +
│ +# determine value shape
│ +shapes = collections.Counter(type(v).__name__ for v in man.values())
│ +print('value types:', shapes)
│ +
│ +refs = []
│ +for text, v in man.items():
│ +    if isinstance(v, dict):
│ +        for variant, h in v.items():
│ +            if isinstance(h, str):
│ +                refs.append((variant, h))
│ +    elif isinstance(v, str):
│ +        refs.append(('?', v))
│ +print('refs', len(refs), 'variants', collections.Counter(v for v, _ in refs))
│ +
│ +missing = []
│ +for variant, h in refs:
│ +    p = os.path.join('assets/audio/lt', variant, h + '.mp3')
│ +    if not os.path.exists(p):
│ +        missing.append(p)
│ +print('manifest refs missing on disk:', len(missing), missing[:5])
│ +
│ +disk = [os.path.join(dp, f) for dp, _, fs in os.walk('assets/audio/lt') for f in fs if f.endswith('.mp3')]
│ +print('mp3 on disk:', len(disk))
│ +disk_hashes = collections.defaultdict(set)
│ +for p in disk:
│ +    parts = p.split(os.sep)
│ +    disk_hashes[parts[-2]].add(parts[-1][:-4])
│ +manifest_hashes = collections.defaultdict(set)
│ +for variant, h in refs:
│ +    manifest_hashes[variant].add(h)
│ +for variant in sorted(manifest_hashes):
│ +    extra = disk_hashes[variant] - manifest_hashes[variant]
│ +    print(f'{variant}: manifest {len(manifest_hashes[variant])} disk {len(disk_hashes[variant])} disk-extra {len(extra)}')
│ profiles/deepseek41flash/cache/scratch/audio_check.py
│ @@ -3,39 +3,20 @@
│  root = '/home/zoltanas/workspace/suprask'
│  os.chdir(root)
│  man = json.load(open('assets/audio/lt/manifest.json'))
│ -items = list(man.items())[:3]
│ -print('sample:', json.dumps(items, ensure_ascii=False)[:400])
│ +refs = [(variant, v) for text, d in man.items() for variant, v in d.items()]
│ +print('refs', len(refs), collections.Counter(v for v, _ in refs))
│
│ -# determine value shape
│ -shapes = collections.Counter(type(v).__name__ for v in man.values())
│ -print('value types:', shapes)
│ -
│ -refs = []
│ -for text, v in man.items():
│ -    if isinstance(v, dict):
│ -        for variant, h in v.items():
│ -            if isinstance(h, str):
│ -                refs.append((variant, h))
│ -    elif isinstance(v, str):
│ -        refs.append(('?', v))
│ -print('refs', len(refs), 'variants', collections.Counter(v for v, _ in refs))
│ -
│ -missing = []
│ -for variant, h in refs:
│ -    p = os.path.join('assets/audio/lt', variant, h + '.mp3')
│ -    if not os.path.exists(p):
│ -        missing.append(p)
│ +missing = [v for _, v in refs if not os.path.exists(os.path.join('assets/audio/lt', v))]
│  print('manifest refs missing on disk:', len(missing), missing[:5])
│
│ -disk = [os.path.join(dp, f) for dp, _, fs in os.walk('assets/audio/lt') for f in fs if f.endswith('.mp3')]
│ -print('mp3 on disk:', len(disk))
│ -disk_hashes = collections.defaultdict(set)
│ -for p in disk:
│ -    parts = p.split(os.sep)
│ -    disk_hashes[parts[-2]].add(parts[-1][:-4])
│ -manifest_hashes = collections.defaultdict(set)
│ -for variant, h in refs:
│ -    manifest_hashes[variant].add(h)
│ -for variant in sorted(manifest_hashes):
│ -    extra = disk_hashes[variant] - manifest_hashes[variant]
│ -    print(f'{variant}: manifest {len(manifest_hashes[variant])} disk {len(disk_hashes[variant])} disk-extra {len(extra)}')
│ +disk_stems = collections.defaultdict(set)
│ +for dp, _, fs in os.walk('assets/audio/lt'):
│ +    for f in fs:
│ +        if f.endswith('.mp3'):
│ +            disk_stems[os.path.basename(dp)].add(f)
│ +man_stems = collections.defaultdict(set)
│ +for variant, v in refs:
│ +    man_stems[variant].add(v.split('/', 1)[1])
│ +for variant in sorted(set(disk_stems) | set(man_stems)):
│ +    extra = disk_stems[variant] - man_stems[variant]
│ +    print(f'{variant}: manifest {len(man_stems[variant])} disk {len(disk_stems[variant])} disk-only {len(extra)} {sorted(extra)[:3]}')
│ profiles/deepseek41flash/cache/scratch/live_audio.py
│ @@ -0,0 +1,34 @@
│ +import json, os, urllib.request, urllib.error
│ +from concurrent.futures import ThreadPoolExecutor
│ +
│ +root = '/home/zoltanas/workspace/suprask'
│ +os.chdir(root)
│ +LIVE = 'https://one-man-company.github.io/suprask/'
│ +man = json.load(open('assets/audio/lt/manifest.json'))
│ +paths = sorted({v for d in man.values() for v in d.values()})
│ +print('checking', len(paths), 'audio files on live')
│ +
│ +
│ +def head(rel):
│ +    url = LIVE + 'assets/audio/lt/' + rel
│ +    req = urllib.request.Request(url, method='HEAD', headers={'User-Agent': 'suprask-check/1.2'})
│ +    for attempt in range(2):
│ +        try:
│ +            with urllib.request.urlopen(req, timeout=20) as r:
│ +                return rel, r.status
│ +        except urllib.error.HTTPError as e:
│ +            if e.code in (429, 503) and attempt == 0:
│ +                continue
│ +            return rel, e.code
│ +        except Exception as e:  # noqa: BLE001
│ +            if attempt == 0:
│ +                continue
│ +            return rel, type(e).__name__
│ +
│ +with ThreadPoolExecutor(max_workers=8) as pool:
│ +    res = list(pool.map(head, paths))
│ +
│ +bad = [r for r in res if r[1] != 200]
│ +print('not 200:', len(bad))
│ +for r in bad[:20]:
│ +    print(' ', r)
│ agents/log/publikavimo-agentas-2026-11-13T2306.md
│ @@ -0,0 +1,94 @@
│ +# Publikavimo agentas — paleidimas #275 (2026-11-13T23:06+02:00)
│ +
│ +## 1. `check_published.py` išvestis (ne perfrazuota)
│ +
│ +```
│ +Repozitorija: 39 moduliai
│ +Paskelbta:    39 moduliai
│ +  · grade-01: repo 39, gyvai 39
│ +Pervadinti ID, priimta ir užregistruota (1):
│ +  - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai (registruota; žyma už seno ID vaiko naršyklėje LIEKA — alias mechanizmo nėra, žr. agents/proposals/)
│ +✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, svetainės kodas 17 failų, versija 27635c28).
│ +RC=0
│ +```
│ +
│ +Po raktų: `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0,
│ +`stale_unknown` 0, `aux_stale` 0, `shell_stale` 0, `shell_unreachable` 0,
│ +`path_differs` `[]`, `unpushed_commits` 0, `shell_count` 17,
│ +`history_checked` `true`, `history_note` tuščias,
│ +`vanished_ids` 1 (`03-sakinio-tvarka` → `03-sakinio-zodziai`, `resolved: true`),
│ +`live_version` = `repo_version` = `27635c28`, `verdict.label` = `sutampa`, rc 0.
│ +Trukmė — 6,2 s.
│ +
│ +`HEAD` = `origin/main` = `27635c28`, `git rev-list --left-right --count
│ +origin/main...HEAD` → `0	0`, darbinė kopija prieš darbą švari
│ +(`git status --porcelain -uall` → 0 eilučių). Gyvas `index.html` neša
│ +`?v=27635c28` — svetainė pastatyta būtent iš šio commit'o. Neišstumtų commit'ų: 0.
│ +
│ +## 2. Trys gyvi adresai (+3 pagrindiniai)
│ +
│ +| adresas | kodas | baitai |
│ +|---|---|---|
│ +| `content/lt/grade-01/matematika/04-skaiciu-tiese.json` | 200 | 3 636 |
│ +| `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` | 200 | 5 459 |
│ +| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | 200 | 4 932 |
│ +| `/` (šaknis) | 200 | 3 487 |
│ +| `content/lt/grade-01/index.json` | 200 | 11 741 |
│ +| `assets/audio/lt/manifest.json` | 200 | 63 966 |
│ +
│ +Repo to paties manifesto dydis — 63 966 B; `grades.json` 1 126 B,
│ +`grade-01/index.json` 11 741 B, `path.json` 1 339 B. Visi sutampa su gyvais
│ +(vartų `aux_stale` = 0).
│ +
│ +## 3. Ką dar patikrinau šiame paleidime (ne vartų darbas)
│ +
│ +1. **Indekso ir failų vientisumas.** `index.json` 39 nuorodos ↔ diske 39 modulių
│ +   failai; failų, kurių nėra indekse — 0; indekso įrašų be failo — 0.
│ +   `path.json` `sequence` 39 unikalių ID, nei vieno ne indekse, nei vieno indekso
│ +   ID ne sekoje.
│ +2. **Senasis ID niekur nedingo į kodą.** `grep -rn "03-sakinio-tvarka"` per
│ +   `*.json/*.js/*.html` (be `agents/`, `research/`, `scripts/known_renames.json`)
│ +   → 0 atvejų. Taigi nė vienas gyvas failas nesiunčia vaiko į nebeegzistuojantį
│ +   modulį; lieka tik `localStorage` žymos problema (alias, #15045), kuri yra
│ +   platformos kodo, ne publikavimo darbas.
│ +3. **Visas garsas, ne manifestas.** Vartai lygina tik `manifest.json` baitus;
│ +   pačių mp3 failų niekas nelygina. Šiame paleidime išmatuota pilnai:
│ +   - manifestas 569 raktai → 1 138 nuorodos (`n` 569, `s` 569);
│ +   - nuorodų, kurių nėra diske — **0**; diske esančių mp3, kurių nėra manifeste — **0**;
│ +   - `git ls-files 'assets/audio/lt/*/*.mp3'` = **1 138** = diske **1 138**, nepridėtų/pakeistų `assets` failų — 0;
│ +   - gyvai `HEAD`- užklausa į **1 138** failų → **1 138 × 200**, ne 200 — 0.
│ +
│ +   Kodėl toks skenavimas nėra dedamas į kiekvieną paleidimą: `pages.yml` publikuoja
│ +   šaką be surinkimo žingsnio, todėl paskelbiama viskas, kas įtrackinta; grandinė
│ +   „manifestas → diskas → git → gyva“ šiandien uždaryta trimis nepriklausomais
│ +   matavimais. Tai įrodymas šiam kartui, ne naujas nuolatinis vartas.
│ +
│ +## 4. Sprendimas: **SUTAMPA**
│ +
│ +Nieko nešalinta, joks ID nepernumeruotas, `index.json` / `path.json` /
│ +`grades.json` / garso manifestas / modulių JSON / `assets/` neliesti.
│ +Jokių failų šiame paleidime nekeitinėjau — nebuvo ko taisyti, o be defekto
│ +daromas pakeitimas paskutinį kartą (#273) ir buvo ta vieta, kur įrankis ėmė
│ +teigti daugiau, nei matė.
│ +
│ +## 5. Kas liko atvira (ne šio vaidmens sprendimas)
│ +
│ +1. **Alias mechanizmo nėra.** Vaikas, atlikęs `03-sakinio-tvarka`, dabartinio
│ +   `03-sakinio-zodziai` mato kaip neatliktą. Pasiūlymas
│ +   `agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json` (high)
│ … omitted 16 diff line(s) across 1 additional file(s)/section(s)
│ agents/log/publikavimo-agentas-2026-11-13T2306.md
│ @@ -56,7 +56,7 @@
│     - manifestas 569 raktai → 1 138 nuorodos (`n` 569, `s` 569);
│     - nuorodų, kurių nėra diske — **0**; diske esančių mp3, kurių nėra manifeste — **0**;
│     - `git ls-files 'assets/audio/lt/*/*.mp3'` = **1 138** = diske **1 138**, nepridėtų/pakeistų `assets` failų — 0;
│ -   - gyvai `HEAD`- užklausa į **1 138** failų → **1 138 × 200**, ne 200 — 0.
│ +   - gyvai `HEAD` užklausa į **1 138** failų → **1 138 × 200**, ne 200 — 0.
│
│     Kodėl toks skenavimas nėra dedamas į kiekvieną paleidimą: `pages.yml` publikuoja
│     šaką be surinkimo žingsnio, todėl paskelbiama viskas, kas įtrackinta; grandinė
│ research/wiki/changelog.md
│ @@ -1,6 +1,15 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-13 (23:06) — Publikavimo patikra #275: 39/39 sutampa, garsas išmatuotas 1 138/1 138, jokių pakeitimų
│ +
│ +- **Būsena:** `HEAD` = `origin/main` = `27635c28`, `git rev-list --left-right --count origin/main...HEAD` → `0	0`, darbinė kopija prieš darbą švari (0 eilučių). Gyvas `index.html` neša `?v=27635c28` — svetainė pastatyta iš šio commit'o. Neišstumtų commit'ų: 0.
│ +- **`check_published.py`:** repo 39 / paskelbta 39 (`grade-01: repo 39, gyvai 39`); `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0, `aux_stale` 0, `shell_stale` 0, `shell_unreachable` 0, `path_differs` `[]`, `shell_count` 17, `history_checked` true, `verdict.label` = `sutampa`, `rc=0` (6,2 s).
│ +- **3 gyvi adresai (+3):** `matematika/04-skaiciu-tiese.json` → `200` (3 636 B), `lietuviu-kalba/03-sakinio-zodziai.json` → `200` (5 459 B), `pasaulio-pazinimas/16-vandens-busenos.json` → `200` (4 932 B); papildomai `/` `200` (3 487 B), `grade-01/index.json` `200` (11 741 B), `assets/audio/lt/manifest.json` `200` (63 966 B = repo baitai).
│ +- **Vientisumas, kurio vartai nemato:** `index.json` 39 nuorodos ↔ 39 failai diske (našlaičių 0 abiem kryptimis); `path.json` 39 unikalių ID, ne sekoje/ne indekse — 0; `03-sakinio-tvarka` kode (`*.json/*.js/*.html`) — 0 atvejų. **Garsas:** manifestas 569 raktai → 1 138 nuorodų, trūkstamų diske 0, diske be manifesto 0, `git ls-files` = diskas = **1 138**, gyvai 1 138 × `200`, ne 200 — 0.
│ +- **Ką keitė šis paleidimas:** nieko — nebuvo defekto. Praėjusį kartą (#273) vienintelis pakeitimas buvo įrankio išvesties eilutė, kuri teigė daugiau, nei matė; pakartoti tokį ėjimą be radinio būtų ta pati klaida.
│ +- **Sprendimas:** **sutampa**. Nieko nešalinta, ID nepernumeruoti, `content/**`, `assets/**`, `scripts/**`, `docs/**` neliesti. Ataskaita `agents/log/publikavimo-agentas-2026-11-13T2306.md`. Atvira lieka tik alias problema (#15045) — `assets/js/progress.js` darbas, ne publikavimo.
│
│  ## 2026-11-13 (19:47) — Publikavimo patikra #273: 39/39 sutampa; vartai nustojo teigti, kad žyma „nebegalioja“
│
Sutrumpintai — ką radau ir ką įrašiau.

PATIKROS REZULTATAS

`python3 scripts/check_published.py` (6,2 s, rc=0):
    Repozitorija: 39 moduliai
    Paskelbta:    39 moduliai
      · grade-01: repo 39, gyvai 39
    ✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai,
      svetainės kodas 17 failų, versija 27635c28).

Raktai: missing_on_live 0, hidden_locally 0, not_in_path 0, stale 0, stale_unknown 0, aux_stale 0, shell_stale 0, shell_unreachable 0, path_differs [], unpushed_commits 0, history_checked true, verdict.label = „sutampa“. HEAD = origin/main = 27635c28, darbinė kopija švari, gyvas index.html neša ?v=27635c28.

HTTP (3 privalomi + 3 papildomi, visi 200):
    04-skaiciu-tiese.json 200 / 3 636 B
    03-sakinio-zodziai.json 200 / 5 459 B
    16-vandens-busenos.json 200 / 4 932 B
    / 200 / 3 487 B · grade-01/index.json 200 / 11 741 B · manifest.json 200 / 63 966 B (= repo baitai)

KĄ DAR IŠMATAVAU (vartai to nemato)
- Indeksas vientisas: 39 nuorodos ↔ 39 failai, našlaičių 0 abiem kryptymis; path.json 39 unikalių ID, spragų 0.
- Senasis ID `03-sakinio-tvarka` kode (*.json/*.js/*.html) — 0 atvejų, tad joks gyvas failas nesiunčia į nebeegzistuojantį modulį. Lieka tik localStorage žymos problema (alias, #15045).
- Garsas pilnai, ne manifestas: 569 raktai → 1 138 nuorodų; trūkstamų diske 0, diske be manifesto 0, git ls-files = diskas = 1 138, gyvai 1 138 × HEAD → 1 138 × 200, ne 200 — 0.

SPRENDIMAS: sutampa. Niekas nešalinta, ID nepernumeruoti, jokių kodo/turinio pakeitimų nepadariau — defekto nebuvo, o be radinio daromas pakeitimas paskutinį kartą (#273) ir buvo ta vieta, kur įrankis ėmė teigti daugiau, nei matė.

ĮRAŠYTA
- agents/log/publikavimo-agentas-2026-11-13T2306.md — pilna ataskaita su išvestimi, raktais, HTTP kodais ir tuo, ko nepadariau.
- research/wiki/changelog.md — įrašas „2026-11-13 (23:06) — Publikavimo patikra #275“.
- agents/state.json — NELIKO įrašytas: baigėsi kvietimų limitas prieš šį žingsnį. Liko vienintelis neatliktas dalykas. Reikia pridėti bloką `last_publish_check_275` (prieš `last_system_work_274`, po `last_publish_check_273`, 1 257 eilutė) su: run_id 275, head/main 27635c28, modules_local/live 39, decision „sutampa“, log „agents/log/publikavimo-agentas-2026-11-13T2306.md“, changelog „2026-11-13 (23:06)“, fix „—“, remaining „alias #15045 atviras“, ir atnaujinti `roles["publikavimo-agentas"]` → last_run 2026-11-13T23:06:00, log ta pati ataskaita. Failas yra .gitignore, tad pokytis lokalus.

ATVIRA: alias mechanizmo nėra (progress.js:31/77/88–96) — vaikas, atlikęs 03-sakinio-tvarka, dabartinio 03-sakinio-zodziai mato kaip neatliktą. Tai platformos kodo, ne publikavimo darbas; pasiūlymas 2026-11-13-publikavimo-agentas-progreso-alias.json (high) tebegalioja.

## klaidos

```
session_id: local-52bdc18a6cbe62a5b502678d6265daa34a8e798adb3e56b917d2e3b80acc77ed
```
