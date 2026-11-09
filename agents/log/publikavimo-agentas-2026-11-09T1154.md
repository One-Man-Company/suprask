# publikavimo-agentas — 2026-11-09T1154

- paleidimas: #191 (manual)
- trukmė: 203s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub191.py
│ @@ -0,0 +1,153 @@
│ +#!/usr/bin/env python3
│ +"""#191 publikavimo zondas: ar kiekvienas gyvas failas baitais lygus repo HEAD."""
│ +import hashlib
│ +import json
│ +import random
│ +import subprocess
│ +import sys
│ +import urllib.request
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +LIVE = "https://one-man-company.github.io/suprask/"
│ +UA = {"User-Agent": "suprask-publish-probe/191"}
│ +
│ +
│ +def head_bytes(path):
│ +    return subprocess.run(
│ +        ["git", "show", f"HEAD:{path}"], cwd=ROOT, capture_output=True, check=True
│ +    ).stdout
│ +
│ +
│ +def get(url):
│ +    req = urllib.request.Request(url, headers=UA)
│ +    with urllib.request.urlopen(req, timeout=30) as r:
│ +        return r.read(), r.status
│ +
│ +
│ +def sha(b):
│ +    return hashlib.sha256(b).hexdigest()[:8]
│ +
│ +
│ +def main():
│ +    head = subprocess.run(
│ +        ["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True
│ +    ).stdout.strip()
│ +    print(f"HEAD {head[:8]}  ({head})")
│ +
│ +    idx_raw = head_bytes("content/lt/grade-01/index.json")
│ +    index = json.loads(idx_raw.decode())
│ +    mods = [(m["id"], m["file"], s["id"]) for s in index["strands"] for m in s["modules"]]
│ +    print(
│ +        f"index.json: {len(mods)} modulių, {len({m[0] for m in mods})} unikalus, "
│ +        f"kryptys {len(index['strands'])}"
│ +    )
│ +    for s in index["strands"]:
│ +        print(f"   {s['id']:<22} {len(s['modules'])}")
│ +
│ +    bad, codes = [], {}
│ +    for mid, rel, strand in mods:
│ +        local = head_bytes("content/lt/" + rel)
│ +        try:
│ +            live, code = get(LIVE + "content/lt/" + rel)
│ +        except Exception as exc:  # noqa: BLE001
│ +            bad.append((rel, f"ERR {type(exc).__name__}"))
│ +            continue
│ +        codes[code] = codes.get(code, 0) + 1
│ +        if sha(local) != sha(live):
│ +            bad.append((rel, f"{sha(local)} != {sha(live)}"))
│ +    print(f"modulių failai: HTTP {codes}, baitais identiški {len(mods) - len(bad)}/{len(mods)}")
│ +    for rel, why in bad:
│ +        print(f"  SKIRIASI {rel}: {why}")
│ +
│ +    other = [
│ +        "content/lt/grade-01/index.json",
│ +        "content/lt/grade-01/path.json",
│ +        "content/lt/grades.json",
│ +        "assets/audio/lt/manifest.json",
│ +        "assets/css/main.css",
│ +        "assets/js/sims/matematika.js",
│ +        "assets/js/sims/pasaulis.js",
│ +        "assets/js/sims/calba.js",
│ +        "assets/js/sims/geometrija.js",
│ +        "assets/js/sims/gyvenimas.js",
│ +        "assets/js/sims/muzika.js",
│ +        "assets/js/sims/technologijos.js",
│ +        "assets/js/sims/zaidimai.js",
│ +        "assets/js/sims/daile.js",
│ +        "assets/js/sims/dorin.js",
│ +        "assets/js/sims/vanduo.js",
│ … omitted 75 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/audio191.py
│ @@ -0,0 +1,36 @@
│ +import json, random, urllib.request
│ +
│ +m = json.load(open('/home/zoltanas/workspace/suprask/assets/audio/lt/manifest.json'))
│ +print('raktų', len(m))
│ +for k, v in list(m.items())[:3]:
│ +    print(repr(k), '->', v)
│ +tracks = []
│ +for k, v in m.items():
│ +    if isinstance(v, dict):
│ +        tracks += [x for x in v.values() if isinstance(x, str)]
│ +    else:
│ +        tracks.append(v)
│ +print('takų', len(tracks))
│ +print('pav pvz', tracks[:3])
│ +
│ +LIVE = 'https://one-man-company.github.io/suprask/'
│ +UA = {'User-Agent': 'suprask-publish-probe/191'}
│ +rnd = random.Random(191)
│ +sample = rnd.sample(tracks, 8)
│ +ok = 0
│ +for t in sample:
│ +    if t.startswith('http'):
│ +        url = t
│ +    elif t.startswith('/'):
│ +        url = LIVE.rstrip('/') + t
│ +    else:
│ +        url = LIVE + 'assets/audio/lt/' + t
│ +    try:
│ +        req = urllib.request.Request(url, headers=UA)
│ +        with urllib.request.urlopen(req, timeout=30) as r:
│ +            b = r.read()
│ +            ok += r.status == 200
│ +            print(r.status, len(b), url.rsplit('/', 1)[-1])
│ +    except Exception as exc:
│ +        print('ERR', type(exc).__name__, exc, url.rsplit('/', 1)[-1])
│ +print(f'imtis {ok}/{len(sample)}')
Nepavyko užbaigti iki galo: pasiekiau įrankių kvotą, kol ėjo pilna gyvos svetainės patikra. Toliau — ką jau patikrinau tikrais įrankiais ir kas liko nebaigta.

## Ką patvirtinau (viskas realiais paleidimais)

**1. `check_published.py` išvestis**
```
Repozitorija: 35 moduliai
Paskelbta:    35 moduliai
✔ Repo ir gyva svetainė sutampa.   (RC=0)
```
JSON: `{"local":35,"published":35,"missing_on_live":[],"hidden_locally":[],"not_in_path":[],"unpushed_commits":0,"live_error":""}`
- `hidden_locally` tuščias — nė vienas modulis nepradingo iš repo, vaiko `localStorage` pažanga saugi.
- `not_in_path` tuščias — `path.json` turi 35 žingsnius, 35 unikalius, 0 ne indekse, 0 ne kelyje. Tvarka sąmoningai kitokia nei `index.json` (tai mokymosi seka) — neliečiau.
- Neišstumtų commit'ų 0. `HEAD = origin/main = 5a921b1705a98bbed92d21d9dfe5210d9cf17e82` (po `git fetch`).

**2. Baitų lyginimas su gyva svetaine** (zondas `~/.hermes/profiles/deepseek41flash/cache/scratch/pub191.py`)
- 35/35 modulių failai: HTTP 200, baitais identiški `HEAD`.
- `index.json` (10 662 B), `path.json` (1 228 B), `grades.json`, `manifest.json` (55 401 B), `main.css` (23 701 B) — visi baitais lygūs `HEAD`.
- Simuliacijų JS: `matematika.js`, `muzika.js`, `calba.js` lygūs tiesiogiai; `pasaulis.js`, `geometrija.js`, `gyvenimas.js`, `technologijos.js`, `zaidimai.js`, `daile.js` skiriasi **tik** `?v=` žyma — numetus žymą baitais lygūs `HEAD`.
- `index.html`, `app.js`, `registry.js`: vienintelė žyma `5a921b17` = `HEAD` pirmi 8 simboliai → gyva svetainė pastatyta būtent iš šio commit'o. Tai patvirtina ir GitHub Actions: „Publikuoti svetainę“ prie `5a921b1` — `success`.

**3. Trys gyvi adresai**
```
200 6242B  content/lt/grade-01/daile/01-spalva-ir-nuotaika.json
200 7902B  content/lt/grade-01/muzika/02-ritmas-ir-perkusija.json
200 6209B  content/lt/grade-01/dorinis-ugdymas/01-susitarimas-ir-zaidimas.json
```
(Be to: `index.json` 200/10 662 B, `path.json` 200/1 228 B, šaknis 200/3 487 B.)

**4. Vartai**
- `validate_content.py --grade 1 --strict` → **0 klaidų, 0 įspėjimų**, RC=0.
- `check_docs_facts.py` → **0 klaidų** (9 kryptys, 35 moduliai — dokumentai sutampa su failais).
- Garso imtis (seed 191, 8 takai iš 500 raktų / 1000 takų) → **8/8 HTTP 200**, 13 626–65 035 B.

**5. Struktūra:** 9 kryptys — lietuvių 4, matematika 15, pasaulio pažinimas 6, muzika 2, žaidimų teorija 3, technologijos 2, gyvenimo įgūdžiai 1, dorinis ugdymas 1, dailė 1.

## Kas liko nebaigta

Pilna naršyklės patikra `check_view.py --base <gyva> --viewports phone,small` (35 maršrutai × 2 plotai = 70 patikrų) buvo **paleista fone ir rezultato negavau**. Vieno modulio dūrio patikra pavyko: `01-spalva-ir-nuotaika`, phone 390 px → 1 patikra, 0 problemų, RC=0. Būtent šis žingsnis liko neįrodytas iki galo.

**Neįrašyta:** `agents/log/publikavimo-agentas-2026-11-09T*.md`, `agents/state.json` (`last_publish_check`), `research/wiki/changelog.md` eilutė. Sprendimo dar nefiksuoju kaip galutinio.

## Sprendimas pagal turimus įrodymus

**SUTAMPA** — repo 35 / paskelbta 35, 0 neišstumtų, 35/35 modulių failai baitais lygūs `HEAD`, gyva svetainė pastatyta iš `5a921b17`, 3/3 adresai 200, validatorius 0/0. Nieko nešalinau, ID nepernumeravau, `path.json` tvarkos nekeičiau, `git push` nedariau, turinio/CSS/simuliacijų neliečiau.

Sąlyga „baigta“ formaliai netenkinama: trūksta 70 patikrų rezultato ir trijų įrašų. Jei paleisite mane dar kartą, pradedu nuo fono proceso `proc_54771e025109` rezultato, tada įrašau ataskaitą, `state.json` ir changelog.

## klaidos

```
session_id: local-ccc2876636489b5821430019f60be874841bfdb0679ffdd3204c5eb42a8a4d49
```
