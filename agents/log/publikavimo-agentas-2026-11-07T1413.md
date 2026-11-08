# publikavimo-agentas — 2026-11-07T1413

- paleidimas: #42 (manual)
- trukmė: 311s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub42_check.py
│ @@ -0,0 +1,96 @@
│ +#!/usr/bin/env python3
│ +"""Run 42 publikavimo patikra: repo vs gyva svetaine baitais, visi moduliu failai."""
│ +import hashlib
│ +import json
│ +import pathlib
│ +import urllib.request
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +HDRS = {"User-Agent": "suprask-publish-check/1.0", "Cache-Control": "no-cache"}
│ +
│ +
│ +def fetch(path, timeout=25):
│ +    url = BASE + path
│ +    try:
│ +        req = urllib.request.Request(url, headers=HDRS)
│ +        with urllib.request.urlopen(req, timeout=timeout) as r:
│ +            return r.status, r.read()
│ +    except urllib.error.HTTPError as e:
│ +        return e.code, b""
│ +    except Exception as e:  # noqa: BLE001
│ +        return type(e).__name__, b""
│ +
│ +
│ +def sha(b):
│ +    return hashlib.sha256(b).hexdigest()
│ +
│ +
│ +def main():
│ +    idx = json.loads((ROOT / "content/lt/grade-01/index.json").read_text(encoding="utf-8"))
│ +    mods = [(s["id"], m) for s in idx["strands"] for m in s["modules"]]
│ +    print(f"index.json krypciu: {len(idx['strands'])}  moduliu: {len(mods)}")
│ +
│ +    # 1. visi moduliu failai: HTTP kodas + sha256
│ +    bad_mod = []
│ +    same_mod = 0
│ +    diff_mod = []
│ +    for strand, m in mods:
│ +        rel = m["file"]
│ +        loc = ROOT / "content/lt" / rel
│ +        if not loc.exists():
│ +            bad_mod.append((rel, "NERA_DISKE"))
│ +            continue
│ +        code, body = fetch(rel)
│ +        if code != 200:
│ +            bad_mod.append((rel, code))
│ +            continue
│ +        if sha(body) == sha(loc.read_bytes()):
│ +            same_mod += 1
│ +        else:
│ +            diff_mod.append(rel)
│ +        print(f"  {code} {rel} {'baitai-lygus' if sha(body)==sha(loc.read_bytes()) else 'SKIRIASI'} sim={m.get('sim')}")
│ +
│ +    # 2. pagrindiniai failai baitais
│ +    core = ["index.html", "content/lt/grades.json", "content/lt/grade-01/index.json",
│ +            "content/lt/grade-01/path.json", "assets/css/main.css"]
│ +    core += sorted(str(p.relative_to(ROOT)) for p in (ROOT / "assets/js").glob("*.js"))
│ +    core += sorted(str(p.relative_to(ROOT)) for p in (ROOT / "assets/js/sims").glob("*.js"))
│ +    print("\nPagrindiniai failai:")
│ +    core_bad = []
│ +    for rel in core:
│ +        loc = ROOT / rel
│ +        if not loc.exists():
│ +            core_bad.append((rel, "NERA_DISKE"))
│ +            continue
│ +        code, body = fetch(rel)
│ +        ok = code == 200 and sha(body) == sha(loc.read_bytes())
│ +        if not ok:
│ +            core_bad.append((rel, code if code != 200 else "BAITAI_SKIRIASI"))
│ +        print(f"  {code} {rel} {'OK' if ok else 'PROBLEMA'} {sha(body)[:8] if body else '-'} vs {sha(loc.read_bytes())[:8]}")
│ +
│ +    print("\nSANTRAUKA")
│ +    print(f"  moduliu failai 200 ir baitais lygus: {same_mod}/{len(mods)}")
│ +    print(f"  moduliu failai su klaida: {bad_mod}")
│ +    print(f"  moduliu failai baitais skiriasi: {diff_mod}")
│ +    print(f"  pagrindiniai failai su problema: {core_bad}")
│ +
│ +    # 3. sim registro dublikatai: moduliu sim.component vs SIMS raktai
│ … omitted 18 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/pub42_check.py
│ @@ -1,8 +1,9 @@
│  #!/usr/bin/env python3
│ -"""Run 42 publikavimo patikra: repo vs gyva svetaine baitais, visi moduliu failai."""
│ +"""Run 42 publikavimo patikra v2: repo vs gyva svetaine baitais, visi moduliu failai."""
│  import hashlib
│  import json
│  import pathlib
│ +import re
│  import urllib.request
│
│  ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ @@ -26,71 +27,71 @@
│      return hashlib.sha256(b).hexdigest()
│
│
│ +def registry_keys():
│ +    keys = set()
│ +    for p in (ROOT / "assets/js/sims").glob("*.js"):
│ +        txt = p.read_text(encoding="utf-8")
│ +        m = re.search(r"export const SIMS\s*=\s*\{(.*?)\n\};", txt, re.S)
│ +        if not m:
│ +            continue
│ +        for line in m.group(1).splitlines():
│ +            line = line.strip().rstrip(",")
│ +            if not line:
│ +                continue
│ +            km = re.match(r'^"([^"]+)"\s*:', line) or re.match(r"^([A-Za-z0-9_-]+)\s*:", line) or re.match(r"^([A-Za-z0-9_-]+)$", line)
│ +            if km:
│ +                keys.add(km.group(1))
│ +    return keys
│ +
│ +
│  def main():
│      idx = json.loads((ROOT / "content/lt/grade-01/index.json").read_text(encoding="utf-8"))
│      mods = [(s["id"], m) for s in idx["strands"] for m in s["modules"]]
│      print(f"index.json krypciu: {len(idx['strands'])}  moduliu: {len(mods)}")
│
│ -    # 1. visi moduliu failai: HTTP kodas + sha256
│ -    bad_mod = []
│ -    same_mod = 0
│ -    diff_mod = []
│ +    bad, same, diff = [], [], []
│ +    codes = {}
│      for strand, m in mods:
│ -        rel = m["file"]
│ -        loc = ROOT / "content/lt" / rel
│ +        rel = "content/lt/" + m["file"]
│ +        loc = ROOT / rel
│          if not loc.exists():
│ -            bad_mod.append((rel, "NERA_DISKE"))
│ +            bad.append((rel, "NERA_DISKE"))
│              continue
│          code, body = fetch(rel)
│ +        codes[code] = codes.get(code, 0) + 1
│          if code != 200:
│ -            bad_mod.append((rel, code))
│ +            bad.append((rel, code))
│              continue
│ -        if sha(body) == sha(loc.read_bytes()):
│ -            same_mod += 1
│ -        else:
│ -            diff_mod.append(rel)
│ -        print(f"  {code} {rel} {'baitai-lygus' if sha(body)==sha(loc.read_bytes()) else 'SKIRIASI'} sim={m.get('sim')}")
│ +        (same if sha(body) == sha(loc.read_bytes()) else diff).append(rel)
│ +        print(f"  {code} {rel} {m.get('sim')}")
│
│ -    # 2. pagrindiniai failai baitais
│      core = ["index.html", "content/lt/grades.json", "content/lt/grade-01/index.json",
│              "content/lt/grade-01/path.json", "assets/css/main.css"]
│      core += sorted(str(p.relative_to(ROOT)) for p in (ROOT / "assets/js").glob("*.js"))
│      core += sorted(str(p.relative_to(ROOT)) for p in (ROOT / "assets/js/sims").glob("*.js"))
│ -    print("\nPagrindiniai failai:")
│      core_bad = []
│      for rel in core:
│          loc = ROOT / rel
│ -        if not loc.exists():
│ -            core_bad.append((rel, "NERA_DISKE"))
│ -            continue
│          code, body = fetch(rel)
│ … omitted 44 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/pub42_ids.py
│ @@ -0,0 +1,32 @@
│ +#!/usr/bin/env python3
│ +"""Moduliu ID ir krypciu ID istorija: ar kas nors dingo / pasikeite (pazangos tvarumas)."""
│ +import json
│ +import subprocess
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +FILE = "content/lt/grade-01/index.json"
│ +
│ +revs = subprocess.run(["git", "log", "--format=%h %ad", "--date=short", "--", FILE],
│ +                      cwd=ROOT, capture_output=True, text=True).stdout.splitlines()
│ +
│ +prev = None
│ +for line in reversed(revs):
│ +    h = line.split()[0]
│ +    try:
│ +        data = json.loads(subprocess.run(["git", "show", f"{h}:{FILE}"], cwd=ROOT,
│ +                                         capture_output=True, text=True).stdout)
│ +    except json.JSONDecodeError:
│ +        print(f"{h} -- JSON NELUZTA?"); continue
│ +    strands = {s["id"]: [m["id"] for m in s.get("modules", [])] for s in data.get("strands", [])}
│ +    ids = {i for v in strands.values() for i in v}
│ +    if prev is None:
│ +        print(f"{line}  krypciu={len(strands)} moduliu={len(ids)}")
│ +    else:
│ +        p_strands, p_ids = prev
│ +        gone = p_ids - ids
│ +        added = ids - p_ids
│ +        moved = [i for i in ids & p_ids
│ +                 if next(k for k, v in p_strands.items() if i in v) != next(k for k, v in strands.items() if i in v)]
│ +        print(f"{line}  krypciu={len(strands)} moduliu={len(ids)}"
│ +              f"  +{sorted(added)}  -{sorted(gone)}  PERKELTA={sorted(moved)}")
│ +    prev = (strands, ids)
│ profiles/deepseek41flash/cache/scratch/pub42_tasks.py
│ @@ -0,0 +1,29 @@
│ +#!/usr/bin/env python3
│ +"""Uzduociu skaiciaus kaita per moduliu istorija: ar modulis netapo 'neatliktas' po publikavimo."""
│ +import json
│ +import subprocess
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +files = subprocess.run(["git", "ls-files", "content/lt/grade-01/*/*.json"], cwd=ROOT,
│ +                       capture_output=True, text=True).stdout.split()
│ +files = [f for f in files if "index.json" not in f and "path.json" not in f]
│ +
│ +for f in sorted(files):
│ +    revs = subprocess.run(["git", "log", "--format=%h %ad", "--date=short", "--", f], cwd=ROOT,
│ +                          capture_output=True, text=True).stdout.splitlines()
│ +    counts = []
│ +    for line in reversed(revs):
│ +        h = line.split()[0]
│ +        raw = subprocess.run(["git", "show", f"{h}:{f}"], cwd=ROOT, capture_output=True, text=True).stdout
│ +        try:
│ +            d = json.loads(raw)
│ +        except json.JSONDecodeError:
│ +            counts.append((h, "BLOGAS_JSON")); continue
│ +        counts.append((h, len(d.get("tasks", []))))
│ +    uniq = []
│ +    for h, n in counts:
│ +        if not uniq or uniq[-1][1] != n:
│ +            uniq.append((h, n))
│ +    if len(uniq) > 1:
│ +        print(f"{f}: " + " -> ".join(f"{h}:{n}" for h, n in uniq))
│ +print("--- baigta: rodyti tik kaitą turintys failai ---")
│ profiles/deepseek41flash/cache/scratch/pub42_browser.py
│ @@ -0,0 +1,51 @@
│ +#!/usr/bin/env python3
│ +"""Run 42: gyvos svetaines matomumo patikra realiame Chromium (LL-07)."""
│ +import sys
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +
│ +ROUTES = [
│ +    "#/klase/1",
│ +    "#/modulis/1/technologijos/01-elektros-grandine",
│ +    "#/modulis/1/matematika/17-kryptys-ir-vieta",
│ +    "#/modulis/1/matematika/16-lygybe-svarstykles",
│ +    "#/modulis/1/lietuviu-kalba/01-garsas-ir-raide",
│ +]
│ +
│ +
│ +def main():
│ +    with sync_playwright() as p:
│ +        browser = p.chromium.launch()
│ +        for width in (360, 768, 1280):
│ +            page = browser.new_page(viewport={"width": width, "height": 800})
│ +            errs = []
│ +            page.on("console", lambda m: errs.append(("console", m.type, m.text)) if m.type in ("error", "warning") else None)
│ +            page.on("pageerror", lambda e: errs.append(("pageerror", "", str(e))))
│ +            for route in ROUTES:
│ +                page.goto(BASE + route, wait_until="networkidle")
│ +                page.wait_for_timeout(700)
│ +                info = page.evaluate(
│ +                    """() => ({
│ +                        h1: (document.querySelector('h1') || {}).textContent || '',
│ +                        strands: document.querySelectorAll('.strand-card').length,
│ +                        moduleRows: document.querySelectorAll('[data-module-card], .module-row, .module-card, li a[href*="#/modulis/"]').length,
│ +                        stageKids: document.querySelectorAll('[data-stage] *, .sim-stage *, #sim-stage *').length,
│ +                        tasks: document.querySelectorAll('[data-task]').length,
│ +                        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
│ +                        simText: (document.querySelector('[data-readout], .readout, [aria-live]') || {}).textContent || ''
│ +                    })"""
│ +                )
│ +                print(f"w={width} {route} -> {info}")
│ +            if errs:
│ +                print(f"  !!! w={width} klaidos/ispejimai:")
│ +                for e in errs[:10]:
│ +                    print("   ", e)
│ +            else:
│ +                print(f"  w={width}: 0 konsoles klaidu/ispejimu")
│ +            page.close()
│ +        browser.close()
│ +
│ +
│ +main()
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub42_browser.py
│ @@ -17,7 +17,7 @@
│
│  def main():
│      with sync_playwright() as p:
│ -        browser = p.chromium.launch()
│ +        browser = p.chromium.launch(executable_path="/home/zoltanas/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome")
│          for width in (360, 768, 1280):
│              page = browser.new_page(viewport={"width": width, "height": 800})
│              errs = []
│ profiles/deepseek41flash/cache/scratch/pub42_class.py
│ @@ -0,0 +1,24 @@
│ +#!/usr/bin/env python3
│ +"""Kaip atrodo gyvas #/klase/1 puslapis: struktura, nuorodos, kiek moduliu pasiekiama."""
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +EXE = "/home/zoltanas/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome"
│ +
│ +with sync_playwright() as p:
│ +    b = p.chromium.launch(executable_path=EXE)
│ +    page = b.new_page(viewport={"width": 1280, "height": 900})
│ +    logs = []
│ +    page.on("console", lambda m: logs.append((m.type, m.text)))
│ +    page.goto(BASE + "#/klase/1", wait_until="networkidle")
│ +    page.wait_for_timeout(1500)
│ +    print("MAIN tekstas (pirmi 600):")
│ +    print(page.inner_text("main")[:600])
│ +    print("\nNuorodos i modulius:", page.evaluate(
│ +        "() => Array.from(document.querySelectorAll('a[href*=\"#/modulis/\"]')).map(a => a.getAttribute('href'))"))
│ +    print("\nNuorodos i kryptis:", page.evaluate(
│ +        "() => Array.from(document.querySelectorAll('a[href*=\"#/klase/1/\"]')).map(a => a.getAttribute('href'))"))
│ +    print("\nKorteliu klases:", page.evaluate(
│ +        "() => Array.from(document.querySelectorAll('main a.card, main .card')).slice(0,12).map(a => a.className)"))
│ +    print("\nLogai:", logs)
│ +    b.close()
PUBLIKAVIMO PATIKRA #42 — 2026-11-07 (vaidmuo: publikavimo-agentas)

1. check_published.py --json (realus išėjimas):
   local 18 / published 18 / unpushed_commits 0
   missing_on_live []  hidden_locally []  not_in_path []  live_error ""
   last_commit 45515d0

2. Vartai, kuriuos perėjau viršija vaidmens minimumą (visi 18, ne 3):
   - Visi 18 modulių failų gyvai: 200, ir visi baitais sutampa su repo (sha256) — 18/18.
   - 14 pagrindinių failų (index.html, grades.json, grade-01/index.json, path.json, main.css, 5 × assets/js/*.js, 5 × sims/*.js): 200 ir baitais lygūs — 0 problemų.
   - curl 3 adresai (prašyta): 200 technologijos/01-elektros-grandine.json, 200 matematika/16-lygybe-svarstykles.json, 200 lietuviu-kalba/01-garsas-ir-raide.json; šaknis 200.
   - SIMS registras: 18/18 modulių sim.component rasti (įskaitant trumpąją `{ desimtukas }` sintaksę ir naują elektros-grandine).
   - path.json: 18 ID, 0 trūkstamų, 0 perteklinių; naujas modulis pridėtas gale, esama tvarka nepakeista.
   - validate_content.py --grade 1: 0 klaidų, 0 įspėjimų. check_ui.py: 0/0. check_audio.py: 343 tekstai × 2 įrašai, visi iš Piper.
   - ID tvarumas (pažangos apsauga): 6 index.json revizijos — tik papildymai (+15-laikas, +16, +14, +17, +01-elektros-grandine), nė vieno pašalinto ar perkeltos krypties ID. progress.js raktas — tik modulio ID, tad krypties keitimas pažangos nesugadintų.

3. Gyvo puslapio matomumo patikra realiame Chromium (LL-07), 360/768/1280 px:
   - 0 konsolės klaidų ir įspėjimų visuose 5 maršrutuose × 3 pločiai.
   - #/klase/1 rodo „0 iš 18 atlikta“, 18 modulių nuorodų (įskaitant #/modulis/1/technologijos/01-elektros-grandine) → naujas modulis pasiekiamas navigacija.
   - Modulių puslapiai renderuoja: h1 teisingas, sim stage užpildytas (17/31/47/5 elementų), 4 užduotys, readout tekstas lietuviškas.
   - Horizontali slinktis 0 px visur; jokių tinklo klaidų.

4. Sprendimas: SUTAMPA. Nieko nekeitžiau — nebuvo ko taisyti; jokio modulio nepašalinau, ID nepernumeravau, path.json tvarkos neliečiau.

5. Radiniai, kurie ne mano nuosavybė (nekeista):
   - docs/ARCHITEKTURA.md:172 „Būsena“ teigia 17 modulių / 17 simuliacijų, o repo ir gyva svetainė turi 18 / 18 (5 kryptys). Dokumentas atsilieka nuo realybės; taiso docs/ vaidmuo. Tai jau fiksuota kritiko pasiūlyme 2026-11-05-kritikas-dokumentai-neatitinka-tikroves.json (45515d0 jį atnaujino), tad naujo pasiūlymo neduodu — nedubliuoju.
   - Pažangos semantikos regresija (istorinė, jau įvykusi): commit aa7739a visuose 11 to meto modulių užduočių skaičių pakėlė 3 → 4. progress.js isDone lygina solved.length >= total, tad vaikas, baigęs modulį prie 3 užduočių, dabar mato jį nebaigtą. Tai ta pati šeima kaip atviras #728 (api.progress semantika) — mano siūlymas būtų fiksuoti total modulio lygmenyje arba saugoti „done“ žymą atskirai, bet tai assets/js nuosavybė, ne mano.

6. KAS NEPADARYTA (sąžiningai): nepavyko įrašyti agents/log/publikavimo-agentas-2026-11-07T…md ir neatnaujintas agents/state.json — sesijos kvotos pabaiga nutraukė darbą prieš tuos du įrašus. Visi aukščiau esantys skaičiai ir HTTP kodai yra išmatuoti realiai, ne iš atminties. Jei nori, kad užbaigčiau įrašus (log + state.json + changelog eilutė „2026-11-07 — Publikavimo patikra #42: repo 18 / paskelbta 18“), tai trys failų pakeitimai be jokio turinio, simuliacijų ar CSS keitimo.

Naujų pamokų į research/wiki/guidelines/pamokos.md nepridėjau: šįkart naujo defekto tipo neradau — trys mano paties klaidingi signalai (404 visiems moduliams, „sim registre nėra“, „strands: 0“) buvo mano matuoklio klaidos (trūkstamas content/lt/ prefiksas, neteisingas regex trumpajai registracijai, neteisingas selektorius `.strand-card` vietoj `.mod-row`), o ne platformos defektai. Tai verta pamokos „matuoklio klaida nėra platformos klaida — pirmiau perskaityk kodą, tada pranešk“, bet jos neįrašiau dėl kvotos; jei nori, įrašysiu kitą kartą.

## klaidos

```
session_id: local-e34df9f8aca41bf882deaeb7f1326aed2f23bf2f20eff6d1bd5e46e38e0d1bb5
```
