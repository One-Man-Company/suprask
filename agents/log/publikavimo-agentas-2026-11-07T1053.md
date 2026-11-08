# publikavimo-agentas — 2026-11-07T1053

- paleidimas: #35 (manual)
- trukmė: 167s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub35_probe.py
│ @@ -0,0 +1,20 @@
│ +import json, pathlib, urllib.request
│ +
│ +idx = json.load(open('content/lt/grade-01/index.json'))
│ +mods = [(s['id'], m) for s in idx['strands'] for m in s['modules']]
│ +print("modulių:", len(mods))
│ +bad = []
│ +for strand, m in mods:
│ +    f = m['file']
│ +    p = pathlib.Path('content/lt') / f
│ +    ok_local = p.exists()
│ +    url = "https://one-man-company.github.io/suprask/content/lt/" + f
│ +    try:
│ +        req = urllib.request.Request(url, headers={"User-Agent": "suprask-check/1.0"})
│ +        code = urllib.request.urlopen(req, timeout=25).status
│ +    except Exception as e:
│ +        code = getattr(e, 'code', str(e))
│ +    print(f"{code}  {'OK    ' if ok_local else 'NOFILE'}  {f}")
│ +    if code != 200 or not ok_local:
│ +        bad.append(f)
│ +print("BLOGAI:", bad)
│ profiles/deepseek41flash/cache/scratch/pub35_sims.py
│ @@ -0,0 +1,32 @@
│ +import json, pathlib, hashlib, urllib.request
│ +
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +idx = json.load(open('content/lt/grade-01/index.json'))
│ +mods = [(s['id'], m) for s in idx['strands'] for m in s['modules']]
│ +
│ +sim_files = sorted(pathlib.Path('assets/js/sims').glob('*.js'))
│ +sim_src = {p.name: p.read_text(encoding='utf-8') for p in sim_files}
│ +
│ +print("== sim registracija ==")
│ +missing_sim = []
│ +for strand, m in mods:
│ +    c = (m.get('sim') or {})
│ +    comp = c.get('component') if isinstance(c, dict) else c
│ +    where = [n for n, src in sim_src.items() if f'"{comp}"' in src or f"'{comp}'" in src]
│ +    if not where:
│ +        missing_sim.append((m['id'], comp))
│ +    print(f"{m['id']:34s} sim={comp!r:28s} -> {where or 'NERA'}")
│ +print("Neregistruotos sim:", missing_sim)
│ +
│ +print("\n== gyvi assets/js failai vs repo ==")
│ +for p in sorted(pathlib.Path('assets/js').rglob('*.js')):
│ +    rel = p.as_posix()
│ +    local = hashlib.sha256(p.read_bytes()).hexdigest()
│ +    try:
│ +        req = urllib.request.Request(BASE + rel, headers={"User-Agent": "suprask-check/1.0"})
│ +        data = urllib.request.urlopen(req, timeout=25).read()
│ +        code = 200
│ +    except Exception as e:
│ +        data, code = b"", getattr(e, 'code', str(e))
│ +    live = hashlib.sha256(data).hexdigest() if data else "-"
│ +    print(f"{code}  {'SUTAMPA' if live == local else 'SKIRIASI'}  {rel}")
│ profiles/deepseek41flash/cache/scratch/pub35_core.py
│ @@ -0,0 +1,21 @@
│ +import hashlib, pathlib, urllib.request
│ +
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +files = [
│ +    "index.html",
│ +    "content/lt/grades.json",
│ +    "content/lt/grade-01/index.json",
│ +    "content/lt/grade-01/path.json",
│ +    "assets/css/main.css",
│ +]
│ +for rel in files:
│ +    p = pathlib.Path(rel)
│ +    local = hashlib.sha256(p.read_bytes()).hexdigest()[:12] if p.exists() else "NOFILE"
│ +    try:
│ +        req = urllib.request.Request(BASE + rel, headers={"User-Agent": "suprask-check/1.0"})
│ +        data = urllib.request.urlopen(req, timeout=25).read()
│ +        code = 200
│ +    except Exception as e:
│ +        data, code = b"", getattr(e, 'code', str(e))
│ +    live = hashlib.sha256(data).hexdigest()[:12] if data else "-"
│ +    print(f"{code}  {'SUTAMPA  ' if live == local else 'SKIRIASI '} local={local} live={live}  {rel}")
Ataskaitos juodraštis (failų įrašyti nespėjau — žr. pabaigą).

PUBLIKAVIMO PATIKRA #35 — 2026-11-07

1. check_published.py (--json):
   local 17 / published 17 / unpushed_commits 0
   missing_on_live []  hidden_locally []  not_in_path []  live_error ""
   last_commit 990b0d0 "Publikavimo matomumas ir publikavimo agentas"

2. HTTP patikra (ne 3, o visi 17 modulių failų — pigiau nei tikrinti tris ir spėti apie likusius):
   200 grade-01/lietuviu-kalba/01-garsas-ir-raide.json
   200 grade-01/matematika/16-lygybe-svarstykles.json
   200 grade-01/zaidimu-teorija/13-akmenelis-popierius.json
   … ir visi likę 14 — 200. BLOGAI: [].
   Papildomai baitais sutampa su repo (sha256): index.html (7c614788…), content/lt/grades.json (7f7e1333…), content/lt/grade-01/index.json (1e49ae83…), path.json (db38e918…), assets/css/main.css (325aae45…), visi 8 assets/js/*.js.
   Sim registracija: 17/17 modulių `sim.component` rasti SIMS registre (desimtukas, figuros, desningumai — registruoti trumpąja `{ desimtukas }` sintakse, ne kabutėmis; pirmas mano patikrinimas dėl to davė klaidingą „NERA“, pasitikrinta rankiniu grep).
   validatorius --grade 1: 0 klaidų, 0 įspėjimų.

3. Sprendimas dėl skaičių: SUTAMPA. Nieko nekeitžiau, nieko nenumarinau, `path.json` tvarkos neliečiau (visi 17 ID sekoje, 0 trūkstamų).

4. Bet skaičiai slepia gyvą defektą — ir tai mano kompetencijos riba.
   `assets/js/sims/matematika.js:745-746, 892-902` (modulis 16-lygybe-svarstykles, GYVAI 200):
   diff = known + box − whole; angle = 1.6·diff; SVG `rotate(+a)` sukasi pagal laikrodį, todėl kairysis sijos galas kyla; `place(panL, −110)` duoda dy = −110·sin(a).
   known=5, box=1, whole=8 → diff=−2, a=−3,2°, kairė dy=+6,14 (leidžiasi), dešinė dy=−6,14 (kyla).
   Dešinė sunkesnė (8 prieš 6), o kyla būtent dešinė. Kryptis apversta.
   Tai ta pati būsena, dėl kurios leidėjas #30 laikė publikavimo vartus uždarytus (pasiūlymas #449, `high`, tebeatviras) — tik dabar modulis jau gyvai, tad vaikas gauna apverstą modelį. Simuliacijų nekeičiau: vaidmens ribos tai draudžia. Taisymas — simuliaciju-inzinierius pagal #449 (pakanka `angle()` grąžinti −1.6·diff arba invertuoti `place`/`beam` ženklą; abiejų daryti nereikia, kitaip grįš atgal).

5. Šalutinis radinys, ne mano nuosavybė: `docs/ARCHITEKTURA.md:172` „Būsena“ teigia 13 modulių / 13 simuliacijų, o repo ir svetainė turi 17 / 17. Dokumentas atsilieka nuo realybės — taisyti turi docs/ vaidmuo.

KAS NEPADARYTA (sąžiningai): nepavyko įrašyti `agents/log/publikavimo-agentas-2026-11-07T…md`, neatnaujintas `agents/state.json`, neįrašyta changelog eilutė `2026-11-07 — Publikavimo patikra #35: repo 17 / paskelbta 17`, nesibaigė `node` patikra (blokuota kaip script execution). Skaičiai ir HTTP kodai aukščiau yra realūs, išmatuoti; matematika — deterministinė ir sutampa su #30 matavimu, bet nepriklausomo paleidimo per node neturiu. Jei nori, kad užbaigčiau įrašus (log + state.json + changelog), pasakyk — tai trys failų pakeitimai, be jokio turinio ar simuliacijų keitimo.

## klaidos

```
session_id: local-c60a28eb69efce942852647f0f8d3e2537bf141d00ecf02f0012bf7093c64bda
```
