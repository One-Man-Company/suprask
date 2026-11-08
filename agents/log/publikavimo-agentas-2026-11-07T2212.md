# publikavimo-agentas — 2026-11-07T2212

- paleidimas: #52 (manual)
- trukmė: 203s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub52_bytes.py
│ @@ -0,0 +1,36 @@
│ +#!/usr/bin/env python3
│ +"""Baitų lygybė: repo failai vs gyva svetainė (publikavimo patikra #52)."""
│ +import hashlib, json, pathlib, urllib.request
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +idx = json.loads((ROOT / "content/lt/grade-01/index.json").read_text(encoding="utf-8"))
│ +mods = [m["file"] for s in idx["strands"] for m in s["modules"]]
│ +extra = ["content/lt/grade-01/index.json", "content/lt/grade-01/path.json",
│ +         "content/lt/grades.json", "assets/js/app.js", "assets/js/registry.js",
│ +         "assets/js/progress.js", "assets/css/main.css"]
│ +
│ +def get(url, timeout=25):
│ +    req = urllib.request.Request(url, headers={"User-Agent": "suprask-pub52/1.0",
│ +                                               "Cache-Control": "no-cache"})
│ +    with urllib.request.urlopen(req, timeout=timeout) as r:
│ +        return r.read()
│ +
│ +diff, err = [], []
│ +for rel in extra + mods:
│ +    local = (ROOT / "content" / rel).read_bytes() if rel.startswith("content/") else (ROOT / rel).read_bytes()
│ +    try:
│ +        live = get(BASE + rel)
│ +    except Exception as e:
│ +        err.append(f"{rel}: {type(e).__name__} {e}")
│ +        continue
│ +    if hashlib.sha256(live).digest() != hashlib.sha256(local).digest():
│ +        diff.append(f"{rel} repo={hashlib.sha256(local).hexdigest()[:12]} live={hashlib.sha256(live).hexdigest()[:12]}")
│ +
│ +print(f"lyginta failų: {len(extra)+len(mods)}  (modulių: {len(mods)})")
│ +print(f"skiriasi: {len(diff)}")
│ +for d in diff:
│ +    print("  DIFF", d)
│ +print(f"klaidos: {len(err)}")
│ +for e in err:
│ +    print("  ERR ", e)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub52_bytes.py
│ @@ -18,7 +18,7 @@
│
│  diff, err = [], []
│  for rel in extra + mods:
│ -    local = (ROOT / "content" / rel).read_bytes() if rel.startswith("content/") else (ROOT / rel).read_bytes()
│ +    local = (ROOT / rel).read_bytes()
│      try:
│          live = get(BASE + rel)
│      except Exception as e:
│ profiles/deepseek41flash/cache/scratch/pub52_bytes.py
│ @@ -5,7 +5,7 @@
│  ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│  BASE = "https://one-man-company.github.io/suprask/"
│  idx = json.loads((ROOT / "content/lt/grade-01/index.json").read_text(encoding="utf-8"))
│ -mods = [m["file"] for s in idx["strands"] for m in s["modules"]]
│ +mods = ["content/lt/" + m["file"] for s in idx["strands"] for m in s["modules"]]
│  extra = ["content/lt/grade-01/index.json", "content/lt/grade-01/path.json",
│           "content/lt/grades.json", "assets/js/app.js", "assets/js/registry.js",
│           "assets/js/progress.js", "assets/css/main.css"]
│ profiles/deepseek41flash/cache/scratch/pub52_norm.py
│ @@ -0,0 +1,34 @@
│ +#!/usr/bin/env python3
│ +"""Palygina gyvus JS/CSS/HTML failus su repo, atmetus diegimo cache-buster '?v=<sha>'."""
│ +import hashlib, pathlib, re, subprocess, urllib.request
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
│ +sha8 = head[:8]
│ +print(f"HEAD {head}  (cache-buster tikimasi: ?v={sha8})")
│ +
│ +files = ["index.html", "assets/js/app.js", "assets/js/registry.js", "assets/js/progress.js",
│ +         "assets/js/speech.js", "assets/js/sims/calba.js", "assets/js/sims/matematika.js",
│ +         "assets/js/sims/pasaulis.js", "assets/js/sims/zaidimai.js",
│ +         "assets/js/sims/technologijos.js", "assets/js/sims/art.js", "assets/css/main.css"]
│ +
│ +STAMP = re.compile(rb"\?v=[0-9a-f]{8}")
│ +
│ +def get(url):
│ +    req = urllib.request.Request(url, headers={"User-Agent": "suprask-pub52/1.0",
│ +                                               "Cache-Control": "no-cache"})
│ +    with urllib.request.urlopen(req, timeout=25) as r:
│ +        return r.read()
│ +
│ +bad = []
│ +for rel in files:
│ +    local = (ROOT / rel).read_bytes()
│ +    live = get(BASE + rel)
│ +    stamps = set(STAMP.findall(live))
│ +    norm = STAMP.sub(b"", live)
│ +    ok = hashlib.sha256(norm).digest() == hashlib.sha256(local).digest()
│ +    print(f"{'OK  ' if ok else 'DIFF'} {rel:34s} live_stamps={sorted(s.decode() for s in stamps)}")
│ +    if not ok:
│ +        bad.append(rel)
│ +print(f"\nskiriasi (be cache-buster): {len(bad)} {bad}")
│ profiles/deepseek41flash/cache/scratch/pub52_head.py
│ @@ -0,0 +1,31 @@
│ +#!/usr/bin/env python3
│ +"""Git HEAD blaze vs gyva svetainė (be diegimo cache-buster). Darbo medis gali būti nešvarus."""
│ +import hashlib, pathlib, re, subprocess, urllib.request
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +STAMP = re.compile(rb"\?v=[0-9a-f]{8}")
│ +
│ +files = ["index.html", "assets/js/app.js", "assets/js/registry.js", "assets/js/progress.js",
│ +         "assets/js/speech.js", "assets/js/sims/calba.js", "assets/js/sims/matematika.js",
│ +         "assets/js/sims/pasaulis.js", "assets/js/sims/zaidimai.js",
│ +         "assets/js/sims/technologijos.js", "assets/js/sims/art.js", "assets/css/main.css"]
│ +
│ +def head_blob(rel):
│ +    return subprocess.run(["git", "show", f"HEAD:{rel}"], cwd=ROOT, capture_output=True, check=True).stdout
│ +
│ +def get(url):
│ +    req = urllib.request.Request(url, headers={"User-Agent": "suprask-pub52/1.0",
│ +                                               "Cache-Control": "no-cache"})
│ +    with urllib.request.urlopen(req, timeout=25) as r:
│ +        return r.read()
│ +
│ +bad = []
│ +for rel in files:
│ +    hb = head_blob(rel)
│ +    live = get(BASE + rel)
│ +    ok = hashlib.sha256(STAMP.sub(b"", live)).digest() == hashlib.sha256(hb).digest()
│ +    print(f"{'OK  ' if ok else 'DIFF'} {rel}")
│ +    if not ok:
│ +        bad.append(rel)
│ +print(f"\nHEAD vs gyva (be cache-buster): skiriasi {len(bad)} {bad}")
│ profiles/deepseek41flash/cache/scratch/pub52_sims.mjs
│ @@ -0,0 +1,21 @@
│ +// Publikavimo patikra #52: simuliacijų registras importu, ne grep'u (pamoka LL-13).
│ +import fs from "node:fs";
│ +import * as calba from "/home/zoltanas/workspace/suprask/assets/js/sims/calba.js";
│ +import * as matematika from "/home/zoltanas/workspace/suprask/assets/js/sims/matematika.js";
│ +import * as pasaulis from "/home/zoltanas/workspace/suprask/assets/js/sims/pasaulis.js";
│ +import * as zaidimai from "/home/zoltanas/workspace/suprask/assets/js/sims/zaidimai.js";
│ +import * as technologijos from "/home/zoltanas/workspace/suprask/assets/js/sims/technologijos.js";
│ +
│ +const SIMS = Object.assign({}, calba.SIMS, matematika.SIMS, pasaulis.SIMS, zaidimai.SIMS, technologijos.SIMS);
│ +const idx = JSON.parse(fs.readFileSync("/home/zoltanas/workspace/suprask/content/lt/grade-01/index.json", "utf8"));
│ +const mods = idx.strands.flatMap(s => s.modules);
│ +
│ +const missing = mods.filter(m => m.sim && !SIMS[m.sim]);
│ +const noSim = mods.filter(m => !m.sim);
│ +console.log("registre komponentų:", Object.keys(SIMS).length);
│ +console.log("modulių su sim:", mods.filter(m => m.sim).length, "| be sim:", noSim.length);
│ +console.log("modulio sim.component neregistruotas:", missing.length, missing.map(m => `${m.id}:${m.sim}`).join(", "));
│ +console.log("unikalūs sim raktai moduliuose:", new Set(mods.filter(m => m.sim).map(m => m.sim)).size);
│ +// patikra, kad komponentas turi mount()
│ +const badMount = Object.entries(SIMS).filter(([, v]) => typeof v.mount !== "function").map(([k]) => k);
│ +console.log("be mount():", badMount.length, badMount.join(", "));
SUSTABDYTA DĖL ĮRANKIŲ KVIETIMŲ LIMITO — patikra atlikta, įrašai nepadaryti.

1. check_published.py išvestis (paleista švarioje kopijoje, prieš tai `git fetch`)

   Repozitorija: 18 moduliai
   Paskelbta:    18 moduliai
   ✔ Repo ir gyva svetainė sutampa.
   (išeities kodas 0 → `missing_on_live`, `hidden_locally`, `not_in_path` ir `unpushed_commits` visi tušti; HEAD = origin/main = 0ae05a258bc8bc94001505eba524d19dd9934683, 0 priekyje / 0 atsilieka)

2. HTTP kodai (gyvi adresai)

   200  https://one-man-company.github.io/suprask/
   200  .../content/lt/grade-01/index.json
   200  .../content/lt/grade-01/matematika/15-laikas.json
   200  .../content/lt/grade-01/path.json

3. Baitų lygybė (sha256)

   - 18 modulių JSON + index.json + path.json + grades.json + progress.js + main.css: 0 skirtumų.
   - index.html, app.js, registry.js, speech.js, visi 5 sims failai, art.js, main.css: gyvi failai nuo `git HEAD` skiriasi TIK diegimo cache-buster'iu `?v=0ae05a25`. Nuėmus žymą — 0 skirtumų iš 12 failų. Žymos reikšmė lygi HEAD pirmiems 8 simboliams, t. y. gyva svetainė pastatyta būtent iš 0ae05a2 (patvirtinta `.github/workflows/pages.yml:36–41`).
   - Vienintelis tariamas skirtumas (assets/js/sims/matematika.js) buvo DARBO MEDIS, ne HEAD: neįcommituotas vykstančio kurejo paleidimo #51 pakeitimas (prideda `vk-guess` spėjimo bloką). `HEAD:matematika.js` = gyvas failas baitais. Tai ne regresija ir ne publikuotas turinys.
   - SVARBU: `git status` dabar rodo `M assets/js/sims/matematika.js` — medis nešvarus dėl kito vaidmens vykdomo darbo, ne dėl manęs.

4. Struktūra ir registras

   - index.json: lietuviu-kalba 3, matematika 8, pasaulio-pazinimas 3, zaidimu-teorija 3, technologijos 1 = 18.
   - path.json: 18 įrašų, 18 unikalių, visi modulių ID yra; tvarkos neliečiau.
   - SIMS registras importu per node (ne grep — LL-13 klaida nekartota): 18 komponentų, 18 modulių su `sim`, 18 unikalių raktų, 0 neregistruotų, 0 be `mount()`.
   - validate_content.py --grade 1: 0 klaidų, 0 įspėjimų. check_ui.py: 0/0.

5. NEPADARYTA (sąžiningai)

   - check_view.py (LL-07 matomumo patikra) neįvykdyta: sistemos python neturi playwright (`KLAIDA: nėra playwright`). Repo `.venv` yra, bet bandymas su `python -c "import playwright"` buvo užblokuotas saugumo guard'o (single-query režimas be patvirtinančio žmogaus), o tada baigėsi kvietimų limitas. Šioje vietoje turiu tik HTTP 200 + baitų lygybę, ne realios naršyklės matavimą.
   - Neįrašytas `agents/log/publikavimo-agentas-2026-11-07T*.md`, neatnaujintas `agents/state.json` (`last_publish_check`), neįrašyta `research/wiki/changelog.md` eilutė. Tai trys tekstiniai įrašai; turinio, CSS ar simuliacijų neliečiau.
     Norima changelog eilutė: „2026-11-07 — Publikavimo patikra #52: repo 18 / paskelbta 18; 0 neišstumtų commit'ų; 4 HTTP 200 (šaknis, index, path, 15-laikas); HEAD 0ae05a2 = gyva svetainė baitais (be `?v=` žymos), 25 failai, 0 skirtumų; sims registras 18/18; sprendimas — sutampa.“
   - Nepapildžiau `research/wiki/guidelines/pamokos.md` (žr. 6 punktą).

6. Sprendimas: SUTAMPA.

   Nė vieno modulio nepašalinau, ID nepernumeravau, path.json nekeitčiau, git push nedariau.

   Naujas pamokos kandidatas (LL-17, neįrašytas): „Gyvas failas lyginamas su darbo medžiu, ne su HEAD“ — Simptomas: publikavimo patikra praneša, kad svetainė „lenkia“ repo; Priežastis: lyginama su nešvaria darbo kopija, kurioje kito vaidmens neįcommituotas darbas; Taisyklė: publikuotą būseną lygink su `git show HEAD:<failas>`, o darbo medžio pokyčius vadink ne „publikuotu“, o „vykstančiu“; Patikra: `git status --short` tuščias ARBA kiekvienas DIFF paaiškintas `git diff`. Šiandien būtent tai išgelbėjo nuo klaidingo „sustabdyta“ sprendimo.

   Už mano ribų (neliečiau, jau padengta atvirais pasiūlymais): docs/ARCHITEKTURA.md:172 „Būsena“ tebėra „4 kryptys, 17 modulių, 17 simuliacijų“, o repo ir gyva svetainė turi 5 kryptis / 18 / 18.

## klaidos

```
session_id: local-16210f8cf941da239103af18ada0a83ffe6156093a5a12af4787ffa124b7b157
```
