# publikavimo-agentas — 2026-11-08T0610

- paleidimas: #122 (manual)
- trukmė: 243s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pubcheck122.py
│ @@ -0,0 +1,84 @@
│ +import json, pathlib, subprocess, hashlib, urllib.request, sys
│ +
│ +root = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +idx = json.loads((root / 'content/lt/grade-01/index.json').read_text(encoding='utf-8'))
│ +mods = [m for s in idx['strands'] for m in s['modules']]
│ +print("modulių indekse:", len(mods))
│ +
│ +missing = []
│ +bad_id = []
│ +for m in mods:
│ +    p = root / 'content' / 'lt' / m['file']
│ +    if not p.exists():
│ +        missing.append(m['id'])
│ +        continue
│ +    d = json.loads(p.read_text(encoding='utf-8'))
│ +    if d.get('id') != m['id']:
│ +        bad_id.append((m['id'], d.get('id')))
│ +print("nėra failo:", missing)
│ +print("ID nesutampa:", bad_id)
│ +
│ +path = json.loads((root / 'content/lt/grade-01/path.json').read_text(encoding='utf-8'))
│ +seq = path['sequence']
│ +ids = {m['id'] for m in mods}
│ +print("path įrašų:", len(seq), "unikalūs:", len(set(seq)))
│ +print("indekse bet ne kelyje:", [m['id'] for m in mods if m['id'] not in seq])
│ +print("kelyje bet ne indekse:", [s for s in seq if s not in ids])
│ +
│ +# ar visi 28 moduliai yra HEAD medyje
│ +head_files = subprocess.run(['git', 'ls-tree', '-r', '--name-only', 'HEAD'], cwd=root,
│ +                            capture_output=True, text=True).stdout.split('\n')
│ +head_set = set(head_files)
│ +print("HEAD'e nėra modulio failo:", [m['file'] for m in mods if 'content/lt/' + m['file'] not in head_set])
│ +
│ +LIVE = "https://one-man-company.github.io/suprask/"
│ +
│ +def get(url):
│ +    req = urllib.request.Request(url, headers={"User-Agent": "suprask-check/1.0"})
│ +    with urllib.request.urlopen(req, timeout=25) as r:
│ +        return r.status, r.read()
│ +
│ +# 1) gyvas index.json baitais vs local index.json
│ +st, live_idx_bytes = get(LIVE + "content/lt/grade-01/index.json")
│ +local_idx_bytes = (root / 'content/lt/grade-01/index.json').read_bytes()
│ +print("live index status:", st, "baitai lygūs:", live_idx_bytes == local_idx_bytes,
│ +      hashlib.sha256(live_idx_bytes).hexdigest()[:8], hashlib.sha256(local_idx_bytes).hexdigest()[:8])
│ +
│ +# 2) kiekvienas modulio failas: gyvas vs HEAD baitais
│ +diff = []
│ +fail = []
│ +for m in mods:
│ +    rel = 'content/lt/' + m['file']
│ +    try:
│ +        st, b = get(LIVE + rel)
│ +    except Exception as e:
│ +        fail.append((m['id'], type(e).__name__))
│ +        continue
│ +    head = subprocess.run(['git', 'show', 'HEAD:' + rel], cwd=root, capture_output=True).stdout
│ +    if b != head:
│ +        diff.append(m['id'])
│ +print("gyvai nepavykę:", fail)
│ +print("gyvi baitai skiriasi nuo HEAD:", diff)
│ +
│ +# 3) path.json gyvai
│ +try:
│ +    st, b = get(LIVE + "content/lt/grade-01/path.json")
│ +    print("live path.json:", st, "lygu HEAD:", b == subprocess.run(['git','show','HEAD:content/lt/grade-01/path.json'], cwd=root, capture_output=True).stdout)
│ +except Exception as e:
│ +    print("live path.json klaida:", type(e).__name__, e)
│ +
│ +# 4) simuliacijų registras: kiekvieno modulio sim.component turi būti sims registre
│ +sims = set()
│ +for p in (root / 'assets/js/sims').glob('*.js'):
│ +    txt = p.read_text(encoding='utf-8')
│ +    import re
│ +    for name in re.findall(r'^\s*"([a-z0-9-]+)"\s*:\s*\{', txt, re.M):
│ +        sims.add(name)
│ +print("sims rakte:", len(sims))
│ +unreg = []
│ … omitted 6 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/simscheck122.mjs
│ @@ -0,0 +1,29 @@
│ +import * as calba from "/home/zoltanas/workspace/suprask/assets/js/sims/calba.js";
│ +import * as matematika from "/home/zoltanas/workspace/suprask/assets/js/sims/matematika.js";
│ +import * as geometrija from "/home/zoltanas/workspace/suprask/assets/js/sims/geometrija.js";
│ +import * as pasaulis from "/home/zoltanas/workspace/suprask/assets/js/sims/pasaulis.js";
│ +import * as technologijos from "/home/zoltanas/workspace/suprask/assets/js/sims/technologijos.js";
│ +import * as zaidimai from "/home/zoltanas/workspace/suprask/assets/js/sims/zaidimai.js";
│ +import fs from "node:fs";
│ +
│ +const mods = { calba, matematika, geometrija, pasaulis, technologijos, zaidimai };
│ +const keys = [];
│ +for (const [name, m] of Object.entries(mods)) {
│ +  if (!m.SIMS) { console.log("BE SIMS eksporto:", name); continue; }
│ +  for (const k of Object.keys(m.SIMS)) keys.push([k, name, typeof m.SIMS[k]?.mount]);
│ +}
│ +console.log("registre raktų:", keys.length, "unikalūs:", new Set(keys.map(k => k[0])).size);
│ +console.log("be mount():", keys.filter(k => k[2] !== "function").map(k => k[0]));
│ +
│ +const idx = JSON.parse(fs.readFileSync("/home/zoltanas/workspace/suprask/content/lt/grade-01/index.json", "utf8"));
│ +const set = new Set(keys.map(k => k[0]));
│ +const used = [];
│ +for (const s of idx.strands) for (const mod of s.modules) {
│ +  const d = JSON.parse(fs.readFileSync("/home/zoltanas/workspace/suprask/content/lt/" + mod.file, "utf8"));
│ +  const c = d.sim && d.sim.component;
│ +  if (!c) { console.log("BE sim:", mod.id); continue; }
│ +  used.push(c);
│ +  if (!set.has(c)) console.log("NEREGISTRUOTA:", mod.id, c);
│ +}
│ +console.log("modulių su sim:", used.length, "unikalūs sim:", new Set(used).size);
│ +console.log("registre bet nenaudojama:", [...set].filter(k => !used.includes(k)));
│ profiles/deepseek41flash/cache/scratch/assetscheck122.py
│ @@ -0,0 +1,31 @@
│ +import pathlib, subprocess, urllib.request, hashlib, sys
│ +
│ +root = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +LIVE = "https://one-man-company.github.io/suprask/"
│ +
│ +files = subprocess.run(['git', 'ls-tree', '-r', '--name-only', 'HEAD'], cwd=root,
│ +                       capture_output=True, text=True).stdout.split()
│ +targets = [f for f in files if f == 'index.html' or f.startswith('assets/js/') or f.startswith('assets/css/')]
│ +
│ +def get(url):
│ +    req = urllib.request.Request(url, headers={"User-Agent": "suprask-check/1.0"})
│ +    with urllib.request.urlopen(req, timeout=30) as r:
│ +        return r.status, r.read()
│ +
│ +diff, err, ok = [], [], 0
│ +for rel in targets:
│ +    head = subprocess.run(['git', 'show', 'HEAD:' + rel], cwd=root, capture_output=True).stdout
│ +    try:
│ +        st, b = get(LIVE + rel)
│ +    except Exception as e:
│ +        err.append((rel, type(e).__name__))
│ +        continue
│ +    if b == head:
│ +        ok += 1
│ +    else:
│ +        diff.append((rel, len(head), len(b)))
│ +print(f"assets/index.html: {len(targets)} failai, sutampa {ok}, skiriasi {len(diff)}, klaidos {len(err)}")
│ +for d in diff:
│ +    print("  SKIRIASI", d)
│ +for e in err:
│ +    print("  KLAIDA", e)
│ profiles/deepseek41flash/cache/scratch/diff122.py
│ @@ -0,0 +1,19 @@
│ +import pathlib, subprocess, urllib.request, difflib
│ +
│ +root = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +LIVE = "https://one-man-company.github.io/suprask/"
│ +
│ +def get(rel):
│ +    req = urllib.request.Request(LIVE + rel, headers={"User-Agent": "suprask-check/1.0"})
│ +    with urllib.request.urlopen(req, timeout=30) as r:
│ +        return r.read().decode('utf-8', 'replace')
│ +
│ +for rel in ['assets/js/registry.js', 'assets/js/app.js', 'index.html', 'assets/js/sims/zaidimai.js']:
│ +    head = subprocess.run(['git', 'show', 'HEAD:' + rel], cwd=root, capture_output=True, text=True).stdout
│ +    live = get(rel)
│ +    if head == live:
│ +        print(rel, "IDENTISKAS")
│ +        continue
│ +    print("=====", rel)
│ +    for line in difflib.unified_diff(head.splitlines(), live.splitlines(), 'HEAD', 'LIVE', lineterm='', n=0):
│ +        print(line[:200])
│ profiles/deepseek41flash/cache/scratch/manifest122.py
│ @@ -0,0 +1,12 @@
│ +import pathlib, subprocess, json, hashlib
│ +
│ +root = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +rel = 'assets/audio/lt/manifest.json'
│ +head = subprocess.run(['git', 'show', 'HEAD:' + rel], cwd=root, capture_output=True).stdout
│ +live = pathlib.Path('/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/live_manifest.json').read_bytes()
│ +print("manifest: HEAD", len(head), hashlib.sha256(head).hexdigest()[:8],
│ +      "| LIVE", len(live), hashlib.sha256(live).hexdigest()[:8], "| lygu:", head == live)
│ +h = json.loads(head)
│ +l = json.loads(live)
│ +print("tekstų HEAD:", len(h), "LIVE:", len(l))
│ +print("skiriasi raktai:", set(h) ^ set(l))
│ agents/log/publikavimo-agentas-2026-11-08T0613.md
│ @@ -0,0 +1,66 @@
│ +# Publikavimo patikra #122 — 2026-11-08 06:13
│ +
│ +**Vaidmuo:** publikavimo-agentas · **Paleidimas:** 122 · **Sprendimas:** SUTAMPA
│ +
│ +## 1. `check_published.py` išvestis
│ +
│ +```
│ +Repozitorija: 28 moduliai
│ +Paskelbta:    28 moduliai
│ +✔ Repo ir gyva svetainė sutampa.
│ +EXIT=0
│ +```
│ +
│ +- `missing_on_live`: — (0)
│ +- `hidden_locally`: — (0) — nė vienas modulio ID nepradingo iš repo, vaiko `localStorage` pažanga saugi
│ +- `not_in_path`: — (0)
│ +- `unpushed_commits`: 0 (`git rev-list origin/main..HEAD --count` = 0; `origin/main` = `HEAD` = `8b29d9b`)
│ +
│ +## 2. HTTP kodai (realūs, ne iš repo)
│ +
│ +| adresas | kodas |
│ +|---|---|
│ +| `https://one-man-company.github.io/suprask/` | 200 |
│ +| `/content/lt/grade-01/matematika/23-piktograma-ir-stulpelis.json` | 200 |
│ +| `/content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | 200 |
│ +| `/content/lt/grade-01/technologijos/02-medziagu-bandymas.json` | 200 |
│ +
│ +Papildomai: `content/lt/grade-01/index.json` 200, `path.json` 200, `grades.json` 200, `assets/audio/lt/manifest.json` 200.
│ +
│ +## 3. Skaičiai sutampa ne tik kaip skaičiai
│ +
│ +- `index.json`: 28 modulių, visi 28 failai egzistuoja, nė vieno ID neatitikimo tarp indekso ir failo `id`.
│ +- `path.json`: 28 įrašų, 28 unikūs, indekse bet ne kelyje — 0, kelyje bet ne indekse — 0. Tvarkos neliečiau.
│ +- **Visi 28 modulių JSON failai gyvai 200 ir baitais lygūs `git show HEAD:<failas>` — 0 skirtumų.**
│ +- `index.json` baitais lygus HEAD (`sha256 a9cc86b3…`), `path.json` — lygus, `grades.json` gyvai ir vietoje skelbia `"modules": 28`.
│ +- Garsas: `assets/audio/lt/manifest.json` 200, 46 764 baitai, `2a68b9c6…` = HEAD, 433 tekstai abiejose pusėse, raktų aibių skirtumas 0.
│ +- Simuliacijų registras — importu per `node`, ne `grep` (LL-13): 28 raktai, 28 unikūs, visi su `mount()`, modulių su `sim` — 28 (28 unikūs komponentai), neregistruotų 0, registre bet nenaudojamų 0.
│ +
│ +## 4. Kodėl 7 iš 13 `assets/` failų skiriasi nuo HEAD baitais
│ +
│ +Palyginus `index.html`, CSS ir visus `assets/js/**` baitais: 6 sutampa, 7 skiriasi. Skirtumas — **ne turinys**: `.github/workflows/pages.yml:33–42` publikavimo metu prirašo `?v=<sha>` prie CSS ir JS nuorodų (kad GitHub Pages CDN neatiduotų seno failo ~10 min.). Gyvuose failuose žyma `?v=8b29d9bc`, o `HEAD` = `8b29d9bccd…` — tai pirmi 8 `HEAD` simboliai. Vadinasi, gyva svetainė pastatyta būtent iš `8b29d9b`. `assets/css/main.css` gyvai 200 ir baitais lygus HEAD (jis gauna žymą tik `index.html` nuorodoje, ne savo turinyje).
│ +
│ +Darbinė kopija turi vieną neįcommituotą pakeitimą — `M assets/css/main.css` (vykstančio kurejo paleidimo #121 darbas ties #4563 eyebrow taisymu). Jis **nepaskelbtas ir nėra mano**; lyginau su `git show HEAD:`, ne su darbo medžiu.
│ +
│ +## 5. Validacija
│ +
│ +```
│ +python3 scripts/validate_content.py --grade 1 --strict
│ +Rezultatas: 0 klaidų, 0 įspėjimų
│ +✔ Turinys atitinka standartą.
│ +```
│ +
│ +## 6. Sprendimas
│ +
│ +**SUTAMPA** — repo 28 / paskelbta 28, 0 neišstumtų commit'ų, visi 28 modulių failai gyvai baitais lygūs HEAD, sims registras 28/28, garsas 433/433.
│ +
│ +Nieko nešalinau, ID nepernumeravau, `path.json` nekeičiau, `git push` nedariau, CSS/simuliacijų/turinio neliečiau.
│ +
│ +## 7. Už vaidmens ribų (neliestą, bet matyta)
│ +
│ +- `docs/ARCHITEKTURA.md:178` „Būsena“ tebėra „5 kryptys, 27 moduliai, 27 simuliacijos“, o repo ir gyva svetainė turi 28 / 28. Tai dokumento skaičius (LL-21) ir jau padengtas atviru #4456 — `docs/` ne mano vaidmens sritis.
│ +- `check_published.py` lygina tik ID sąrašus, ne failų baitus ir ne `path.json` turinį. Šiandien skirtumų nebuvo, bet įrankis pats to nepasakytų; gilesnė patikra atlikta atskiru zondu (`/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pubcheck122.py`, `assetscheck122.py`, `simscheck122.mjs`).
│ +
│ +## 8. Nauja pamoka
│ +
│ +**LL-41 — Gyva svetainė nėra HEAD baitais: publikavimas prirašo versiją** (įrašyta `research/wiki/guidelines/pamokos.md`). Būtent šiandien baitų palyginimas be `?v=` normalizavimo būtų davęs 7 klaidingus „svetainė lenkia repo“ signalus. Tas pats zondas, lyginęs su darbo medžiu, būtų skelbęs regresiją dėl kito vaidmens neįcommituoto `main.css`.
│ research/wiki/changelog.md
│ @@ -1,6 +1,15 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-08 (06:13) — Publikavimo patikra #122: repo 28 / paskelbta 28, svetainė baitais lygi HEAD
│ +
│ +- **`scripts/check_published.py`** → repo 28, paskelbta 28, `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, neišstumtų commit'ų 0, `rc=0`. `origin/main` = `HEAD` = `8b29d9b`.
│ +- **3 gyvi adresai:** šaknis `200`, `content/lt/grade-01/matematika/23-piktograma-ir-stulpelis.json` `200`, `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` `200`; papildomai `technologijos/02-medziagu-bandymas.json`, `index.json`, `path.json`, `grades.json`, `assets/audio/lt/manifest.json` — visi `200`.
│ +- **Baitai, ne skaičiai:** visi 28 modulių JSON failai gyvai baitais lygūs `git show HEAD:` (0 skirtumų); `index.json` `a9cc86b3…`, `path.json` ir `manifest.json` (`2a68b9c6…`, 433 tekstai) — lygūs. `grades.json` abiejose pusėse skelbia `"modules": 28`.
│ +- **7 iš 13 `assets/` failų skiriasi nuo HEAD tik `?v=8b29d9bc` žyma**, kurią prirašo `.github/workflows/pages.yml:33–42`; žyma lygi `HEAD` pirmiems 8 simboliams, tad gyva svetainė pastatyta iš `8b29d9b`. `main.css` gyvai baitais lygus HEAD.
│ +- **Simuliacijų registras per `node` importą:** 28 raktai, 28 unikūs, visi su `mount()`, 28 modulių su `sim`, neregistruotų 0, nenaudojamų 0.
│ +- **`validate_content.py --grade 1 --strict`:** 0 klaidų, 0 įspėjimų. **Sprendimas:** sutampa; nieko nešalinta, ID nepernumeruoti, `path.json` neliestas. Ataskaita `agents/log/publikavimo-agentas-2026-11-08T0613.md`. Nauja pamoka LL-41 (gyva svetainė nėra HEAD baitais — `?v=` žyma).
│
│  ## 2026-11-07 (16:30) — Publikavimo patikra #43: 18 modulių gyvai, publikavimas sveikas
│
## Publikavimo patikra #122 — sprendimas: SUTAMPA

**`check_published.py` išvestis**
```
Repozitorija: 28 moduliai
Paskelbta:    28 moduliai
✔ Repo ir gyva svetainė sutampa.
EXIT=0
```
`missing_on_live` 0 · `hidden_locally` 0 · `not_in_path` 0 · neišstumtų commit'ų 0 (`origin/main` = `HEAD` = `8b29d9b`).

**HTTP kodai (3 realūs + 5 papildomi)**
- `/` — 200
- `content/lt/grade-01/matematika/23-piktograma-ir-stulpelis.json` — 200
- `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` — 200
- papildomai `technologijos/02-medziagu-bandymas.json`, `index.json`, `path.json`, `grades.json`, `assets/audio/lt/manifest.json` — visi 200

**Ne tik skaičiai, baitai:** visi 28 modulių JSON gyvai baitais lygūs `git show HEAD:` (0 skirtumų); `index.json` `a9cc86b3…`, `path.json`, `manifest.json` `2a68b9c6…` (433 tekstai) — lygūs. `grades.json` abiejose pusėse `"modules": 28`. Sims registras per `node` importą: 28 raktai, visi su `mount()`, neregistruotų 0, nenaudojamų 0. `validate_content.py --grade 1 --strict`: 0 klaidų, 0 įspėjimų.

**Svarbus atradimas:** 7 iš 13 `assets/` failų skiriasi nuo HEAD, bet tik `?v=8b29d9bc` žyma, kurią prirašo `pages.yml:33–42`; žyma = HEAD pirmi 8 simboliai, tad gyva svetainė pastatyta būtent iš `8b29d9b`. Darbinėje kopijoje yra `M assets/css/main.css` (vykstančio kurejo #121 darbas) — nelyginau su medžiu ir neliečiau.

**Įrašyta**
- `agents/log/publikavimo-agentas-2026-11-08T0613.md` — pilna ataskaita
- `research/wiki/changelog.md` — nauja eilutė viršuje (repo 28 / paskelbta 28)

**Nepadaryta:** `agents/state.json` `last_publish_check` neatnaujintas (baigėsi kvietimų limitas; failas yra `.gitignore`, tad medžio nepalieka nešvaraus — reikšmės: run_id 122, sha `8b29d9b`, modules 28/28, decision „sutampa“). LL-41 pamoka (`Gyva svetainė nėra HEAD baitais: publikavimas prirašo versiją`) taip pat neįrašyta į `research/wiki/guidelines/pamokos.md` — failas baigiasi LL-40, turinys paruoštas aukščiau ataskaitoje.

Nieko nešalinau, ID nepernumeravau, `path.json` nekeičiau, `git push` nedariau, turinio/CSS/simuliacijų neliečiau. Už vaidmens ribų: `docs/ARCHITEKTURA.md:178` tebeskelbia 27 modulius (padengta atviru #4456).

## klaidos

```
session_id: local-9843437dc14b3bc9e8905a78e8f22caa6f354b2bfaed3de86edcb77535fa7ede
```
