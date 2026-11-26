# sveikatos-inspektorius — 2026-11-26T0651

- paleidimas: #547 (manual)
- trukmė: 2944s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/health547.py
│ @@ -0,0 +1,95 @@
│ +#!/usr/bin/env python3
│ +"""SUPRASK sveikatos-inspektorius #547 — dviejų ratų URL patikra per HTTPS.
│ +
│ +Tik stdlib. Kas ~350 ms tarp užklausų. Kiekvienas URL du kartus.
│ +"""
│ +import json, hashlib, time, sys, os, urllib.request, gzip, io
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +DELAY = 0.35
│ +OUT = sys.argv[1] if len(sys.argv) > 1 else "health547.json"
│ +
│ +def get(url, want_body=True):
│ +    t0 = time.time()
│ +    req = urllib.request.Request(url, headers={"User-Agent": "suprask-health/547"})
│ +    try:
│ +        with urllib.request.urlopen(req, timeout=45) as r:
│ +            body = r.read()
│ +            code = r.status
│ +            clen = r.headers.get("Content-Length")
│ +            lm = r.headers.get("Last-Modified")
│ +            ct = r.headers.get("Content-Type")
│ +    except urllib.error.HTTPError as e:
│ +        return {"url": url, "code": e.code, "bytes": 0, "sec": round(time.time()-t0, 3),
│ +                "clen": None, "lm": None, "ct": None, "body": b""}
│ +    except Exception as e:
│ +        return {"url": url, "code": -1, "err": repr(e), "bytes": 0,
│ +                "sec": round(time.time()-t0, 3), "clen": None, "lm": None, "ct": None, "body": b""}
│ +    return {"url": url, "code": code, "bytes": len(body), "sec": round(time.time()-t0, 3),
│ +            "clen": clen, "lm": lm, "ct": ct, "body": body}
│ +
│ +# --- URL sąrašas ---
│ +idx = json.load(open(os.path.join(ROOT, "content/lt/grade-01/index.json")))
│ +mods = [(s["id"], m["file"], m.get("sim"), m["id"]) for s in idx["strands"] for m in s["modules"]]
│ +
│ +basic = [
│ +    "", "index.html", "assets/css/main.css", "assets/js/app.js", "assets/js/registry.js",
│ +    "assets/js/progress.js", "assets/js/speech.js", "content/lt/grades.json",
│ +    "content/lt/grade-01/index.json", "content/lt/grade-01/path.json",
│ +    "assets/audio/lt/manifest.json", "404.html",
│ +]
│ +sims = ["art", "calba", "daile", "dorinis", "geometrija", "gyvenimas", "matematika",
│ +        "muzika", "pasaulis", "technologijos", "uzdavinys", "zaidimai"]
│ +urls = [BASE + p for p in basic if p != ""]
│ +urls.insert(0, BASE)
│ +urls += [BASE + "assets/js/sims/%s.js" % s for s in sims]
│ +urls += [BASE + "content/lt/" + m[1] for m in mods]
│ +# neigiama kontrolė
│ +neg = BASE + "content/lt/grade-01/matematika/99-nera.json"
│ +
│ +results = {"base": BASE, "head": None, "rounds": [], "mods": len(mods), "strands": len(idx["strands"]),
│ +           "negative": None, "started": time.strftime("%Y-%m-%dT%H:%M:%S%z")}
│ +
│ +def sha(b):
│ +    return hashlib.sha256(b).hexdigest()
│ +
│ +for rnd in (1, 2):
│ +    rows = []
│ +    for u in urls:
│ +        r = get(u)
│ +        rel = u[len(BASE):]
│ +        disk = os.path.join(ROOT, rel.split("?")[0]) if rel else os.path.join(ROOT, "index.html")
│ +        local_sha = None
│ +        if rel and os.path.isfile(disk) and r["body"]:
│ +            local_sha = sha(open(disk, "rb").read())
│ +        rec = {"url": u, "rel": rel, "code": r["code"], "bytes": r["bytes"], "sec": r["sec"],
│ +               "clen": r["clen"], "lm": r["lm"], "ct": r["ct"],
│ +               "remote_sha": sha(r["body"]) if r["body"] else None,
│ +               "local_sha": local_sha}
│ +        if rel.endswith(".json") and r["body"]:
│ +            try:
│ +                j = json.loads(r["body"])
│ +                rec["json_ok"] = True
│ +                if rel.startswith("content/lt/grade-01/"):
│ +                    if "modules" in j:
│ +                        rec["json_modules"] = sum(len(s.get("modules", [])) for s in j.get("strands", []))
│ +                    elif "id" in j:
│ +                        rec["json_tasks"] = len(j.get("tasks", []))
│ … omitted 17 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/norm547.py
│ @@ -0,0 +1,32 @@
│ +#!/usr/bin/env python3
│ +"""Normalizuotas palyginimas: nuima `?v=<sha>` nuo gyvos versijos importų."""
│ +import json, hashlib, re, os, urllib.request, time
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +d = json.load(open("health547.json"))
│ +r1 = d["rounds"][0]
│ +V = re.compile(rb"\?v=[0-9a-f]{7,40}")
│ +out = []
│ +for rec in r1:
│ +    rel = rec["rel"]
│ +    if not rel:
│ +        continue
│ +    url = BASE + rel
│ +    live = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "suprask-health/547"}), timeout=45).read()
│ +    loc = open(os.path.join(ROOT, rel), "rb").read()
│ +    ln, ll = V.sub(b"", live), V.sub(b"", loc)
│ +    out.append({"rel": rel, "raw_equal": live == loc, "norm_equal": ln == ll,
│ +                "live_norm_sha": hashlib.sha256(ln).hexdigest()[:12],
│ +                "disk_norm_sha": hashlib.sha256(ll).hexdigest()[:12],
│ +                "live_bytes": len(live), "disk_bytes": len(loc)})
│ +    time.sleep(0.3)
│ +
│ +bad = [o for o in out if not o["norm_equal"]]
│ +print("failai", len(out), "raw lygūs", sum(o["raw_equal"] for o in out),
│ +      "normalizuoti lygūs", sum(o["norm_equal"] for o in out))
│ +print("nesutapimai po normalizavimo:", [(b["rel"], b["live_norm_sha"], b["disk_norm_sha"]) for b in bad])
│ +# kiek importų turi ?v= (kad nekiltų abejonių, jog normalizavimas kažką slepia)
│ +cnt = {o["rel"]: len(V.findall(open(os.path.join(ROOT, o["rel"]), "rb").read())) for o in out}
│ +print("?v= atvejų diske:", {k: v for k, v in cnt.items() if v}, "failų be ?v=:", sum(1 for v in cnt.values() if v == 0))
│ +json.dump(out, open("health547_norm.json", "w"), ensure_ascii=False, indent=1)
│ profiles/deepseek41flash/cache/scratch/assets547.py
│ @@ -0,0 +1,89 @@
│ +#!/usr/bin/env python3
│ +"""Garsas + svoris + TLS #547."""
│ +import json, os, random, time, urllib.request, ssl, gzip, io, socket, hashlib
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +BASE =

… PRALEISTA 44620 SIMBOLIŲ IŠ 62620 (įrankių išklotinės) — visa ataskaita: agents/work/sveikatos-inspektorius/00547/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

l` turi `.boot-fallback` bloką „Puslapis neįsikėlė“ su veikiančiu „Atnaujinti“ mygtuku ir jis būtent tam ir parašytas — bet `index.html:5` inline skirtukas iškart prideda `html.js`, o `assets/css/main.css:639` sako `html.js .boot-fallback { display: none }`. Nuėmus klasę ranka, pranešimas atsiranda (`display: block`, `visible: true`). Trūkstant **turinio** failo (`grade-01/index.json`) elgesys teisingas — rodoma „Nepavyko įkelti“. Nė vienas vartas to nepamato: `check_view.py` matuoja sėkmingą krovimą, `check_published.py` — baitus, `check_refs.py` — ar nuoroda veda į esamą failą, `check_ui.py` — šabloną.
│ +- **Priežastis:** dvi savarankiškos pusės, kurios susitinka tik šiame atvejyje. (1) `assets/js/registry.js:70-80` turi 11 **statinių** sim importų — statinis importas yra grafo briauna, tad vienas neįkeltas failas užmuša `registry.js`, o su juo ir `app.js`. Kodo bazė šią taisyklę jau žino: `assets/js/app.js:4-8` garso modulį importuoja dinamiškai būtent todėl („statinis importas sugriautų visą programą“), o sim registre ji nepritaikyta. (2) `html.js` reiškia „naršyklė vykdo skriptus“, o ne „programa įsikėlė“ — klasė dedama inline, prieš bet kokį modulį, tad `display:none` veikia ir tada, kai skriptai sudužo. Kiekviena pusė atskirai teisinga; kartu jos paverčia pranešimą nematomu lygiai tais atvejais, kai jis vienintelė išeitis. Tai LL-96 šeima (numatytasis režimas nemato defekto, kuriam įrankis sukurtas), bet pjūvis kitas: ten vartas matavo ne tą režimą, čia **pats puslapis** savo išeities pranešimą paslepia savo paties sąlyga.
│ +- **Taisyklė:** „skriptai vykdomi“ ir „programa įsikėlė“ yra **skirtingi faktai**, tad ir skirtingos žymos. Sėkmės žymą (`html.js`, `html.app-ok`) deda programos įėjimas po to, kai įkėlimas pavyko, o ne inline skirtukas prieš jį; pranešimas apie sudužimą rodomas tol, kol šios žymos nėra. Kiekvienas **nebūtinas** modulis (simuliacija, garsas, pažanga) registre įkeliamas dinamiškai su `catch`, kad vieno failo nebuvimas negalėtų užmušti grafo — privalomas lieka tik turinys, ir tam jau yra atskiras kelias („Nepavyko įkelti“). Tikrinant bet kokį išeities pranešimą, zondas privalo jį matuoti **toje būsenoje, kuriai jis parašytas**, o ne kontrolinėje.
│ +- **Patikra:** zondas (Chromium 390×844) nutraukia po vieną `assets/js/sims/*.js` (`page.route` → `abort`) ir reikalauja, kad `main` nerodytų „Kraunama…“ arba kad `.boot-fallback` būtų matomas (`getComputedStyle().display !== 'none'`); kontrolė be `route()` — „1 KLASĖ · 6–7 METAI“. Šiame matavime prieš pataisą: 8/8 pakibo, `fallback display: none` visur; su nuimta `js` klase pranešimas atsiranda (įrodyta, kad HTML/CSS jau yra, trūksta tik ryšio). Radinys užfiksuotas kaip issue (https://github.com/One-Man-Company/suprask/issues/4) su atkartojimo komanda; likusi #547 dalis žalia — 212/212 URL `200`, 246 sąsajos patikros be problemų.
│ agents/log/sveikatos-inspektorius-2026-11-26T0651.md
│ @@ -0,0 +1,130 @@
│ +# sveikatos-inspektorius — 2026-11-26T0651
│ +
│ +- paleidimas: #547 (ketvirtadienis 06:50)
│ +- HEAD: `1a134c12a2b04b1742374edd27f6f94871234d3f`, gyva versija `?v=1a134c12` — **sutampa**
│ +- matuota: 2026-11-26 06:51–07:45 EET, HTTP/2, GitHub Pages (edge `fra`)
│ +- įrankiai: `curl`, `python3` (stdlib urllib), `gh`, `playwright` (Chromium, `/home/zoltanas/.local/bin/google-chrome`); jokių mokamų stebėjimo paslaugų
│ +- matavimo tvarka: kas 350 ms, kiekvienas URL **du ratus**
│ +- žaliavos: `~/.hermes/profiles/deepseek41flash/cache/scratch/health547*.json`, `view547*.json`, `routes547.json`, `a11y547.json`, `perf547.json`, `eager547.json`, `mechanism547.json`, `flaky547.json`, `interact547.json`, `zones547.json`
│ +
│ +## SPRENDIMAS: svetainė VEIKIA — bet yra VIENAS vaikui matomas defektas → issue #4
│ +
│ +212/212 URL `200`, 0×404, 0 JSON lūžių, 246 sąsajos patikros be problemų, 82/82 simuliacijos reaguoja į įvestį.
│ +**Naujas radinys:** vienas nepavykęs sim failas palieka vaiką prie amžino „Kraunama…“, o pranešimas apie sudužimą paslėptas. Užfiksuota: https://github.com/One-Man-Company/suprask/issues/4 (+ pamoka LL-203).
│ +
│ +---
│ +
│ +## 1. URL lentelė — URL → statusas → laikas
│ +
│ +Kiekvienas URL matuotas du kartus (R1/R2). Visi 106 URL abiem ratams `200`, ratų skirtumų **0**, baitų skirtumų **0**.
│ +
│ +| URL | kodas R1/R2 | baitai | laikas R1 |
│ +|---|---|---|---|
│ +| `/suprask/` | 200 / 200 | 3 487 | 0,397 s (3 matavimai: 0,347 / 0,208 / 0,182 s) |
│ +| `/index.html` | 200 / 200 | 3 487 | 0,21 s |
│ +| `/404.html` | 200 / 200 | 563 | 0,22 s |
│ +| `/assets/css/main.css` | 200 / 200 | 32 727 | 0,19 s |
│ +| `/assets/js/app.js` | 200 / 200 | 36 167 (su `?v=`) | 0,22 s |
│ +| `/assets/js/registry.js` | 200 / 200 | 5 626 (su `?v=`) | 0,20 s |
│ +| `/assets/js/progress.js` | 200 / 200 | 11 664 | 1,68 s (šaltas kraštas), R2 0,25 s |
│ +| `/assets/js/speech.js` | 200 / 200 | 12 345 | 0,33 s |
│ +| `/content/lt/grades.json` | 200 / 200 | 1 126 | 0,17 s |
│ +| `/content/lt/grade-01/index.json` | 200 / 200 | 25 331 | 0,30 s |
│ +| `/content/lt/grade-01/path.json` | 200 / 200 | 1 515 | 0,19 s |
│ +| `/assets/audio/lt/manifest.json` | 200 / 200 | 63 974 | 0,31 s |
│ +| sim `art.js` | 200 / 200 | 51 153 | 0,22 s |
│ +| sim `calba.js` | 200 / 200 | 75 486 | 1,68 s (šaltas), R2 0,27 s |
│ +| sim `daile.js` | 200 / 200 | 32 497 | 0,19 s |
│ +| sim `dorinis.js` | 200 / 200 | 13 692 | 0,18 s |
│ +| sim `geometrija.js` | 200 / 200 | 47 415 | 0,21 s |
│ +| sim `gyvenimas.js` | 200 / 200 | 11 126 | 0,19 s |
│ +| sim `matematika.js` | 200 / 200 | 171 147 | 0,21 s |
│ +| sim `muzika.js` | 200 / 200 | 23 086 | 0,20 s |
│ +| sim `pasaulis.js` | 200 / 200 | 164 933 | 0,31 s |
│ +| sim `technologijos.js` | 200 / 200 | 38 038 | 0,20 s |
│ +| sim `uzdavinys.js` | 200 / 200 | 68 430 | 0,20 s |
│ +| sim `zaidimai.js` | 200 / 200 | 21 014 | 0,20 s |
│ +| **82 modulių JSON** | **200 / 200 visi** | vid. 7 081 B (3 586–10 359) | lėčiausi: `01-garsas-ir-raide` 1,486 s, `06-garso-trukme` 1,226 s (šaltas kraujas), kiti ≤ 0,52 s |
│ +
│ +Neigiama kontrolė: `/content/lt/grade-01/matematika/99-nera.json` → **404**; `content/lt/grade-02/index.json` (nepaskelbta klasė) → **404**; katalogų indeksai (`assets/js/sims/`) → **404** (nepamaskuojama).
│ +Neigiama kontrolė **teigiama**: `AGENTS.md`, `scripts/`, `research/`, `agents/`, `.git/config` → visi **404** (privatus turinys nepaskelbtas).
│ +
│ +**Suvestinė: 106 URL × 2 ratai = 212/212 `200`.**
│ +
│ +## 2. Publikuota = repo
│ +
│ +- `?v=1a134c12` gyvame `index.html` = HEAD pirmi 8 simboliai. `last-modified` 2026-11-26 04:36:14 GMT, HEAD commit 06:35:44 EET (04:35:44 GMT) → deploy **30 s**.
│ +- **Normalizuotas palyginimas** (nuėmus publikavimo prirašytą `?v=`): **105/105 failų lygūs su disku**, 0 nesutapimų. Be normalizavimo skyrėsi 13 failų — **visi** tik dėl `?v=` žymos importuose (`sed` žingsnis `pages.yml`), t. y. būtent tas mechanizmas, kurį LL-110 aprašo.
│ +- Turinys gyvai: **9 kryptys / 82 moduliai / 359 užduotys** (82 `optional`), `path.json` 82 žingsnių (0 už indekso, 0 indekse ne sekoje), `grades.json` — 1 klasė `live`, 2–12 `planned`.
│ +- Sim registras: **79 unikalūs `SIMS` raktai kode + 3 raktai su trumpu užrašu** (`desimtukas`, `figuros`, `desningumai` — `matematika.js:5874-5876`) = **82**; 82 modulių su `sim.component`, **0 trūkstamų, 0 nenaudojamų**.
│ +- Kortelė vs modulio JSON (gyvas `index.json` × gyvas modulio failas): **82 palyginimai** (title / subtitle / minutes / sim / id / strand / grade) → **0 nesutapimų**.
│ +- `check_registry.py` → 82 · 82 · 359 · 82 · 82, našlaičiai 0, PROBLEMŲ 0. `check_docs_facts.py` → 0 klaidų, 0 įspėjimų. `check_audio.py` → 1 213 tekstų, 2 426/2 426 įrašų.
│ +
│ +## 3. Sąsaja — 246 patikros, 0 problemų
│ +
│ +`check_view.py --base https://one-man-company.github.io/suprask/ --viewports desktop,phone,small`:
│ +
│ +| plotis | patikros | problemos | overflow | smallTargets | tasksVisible | minTaskFont | eyebrowLines |
│ +|---|---|---|---|---|---|---|---|
│ +| phone 390 | 82 | 0 | 0 | 0 | 359/359 | 19,14 | 1 |
│ +| small 360 | 82 | 0 | 0 | 0 | 359/359 | 18,96 | 1 |
│ +| desktop 1440 | 82 | 0 | 0 | 0 | 359/359 | 21,44 | 1 |
│ +
│ +`voiceOnly` false visur; `simVisibleControls` ≥ 1 visur (mažiausiai 1 — `04-kaip-zmones-sveikinasi`, `12-bendradarbiavimo-tiltas`); `clipped` 0; konsolės klaidų **0**; `fatal`/`loading` false visur. Viso **246 patikros** (82×3).
│ +Mažiausias sim aukštis 107 px @360, didžiausias 908 px @390 (forma, ne defektas).
│ +
│ +**200 % teksto @360 px** (WCAG 1.4.4, atskiras diagnostinis režimas): **82/82 be problemų**, `scaled_unapplied` tuščias.
│ +
│ +## 4. Simuliacijos REAGUOJA į įvestį (82/82)
│ … omitted 52 diff line(s) across 1 additional file(s)/section(s)
Live-site health check #547 complete. The runner writes the formal log; here is the report content.

## SPRENDIMAS: svetainė VEIKIA — bet rastas VIENAS vaikui matomas defektas → issue #4

212/212 URL `200`, 0×404, 246 sąsajos patikros be problemų, 82/82 simuliacijos reaguoja į įvestį. Naujas radinys užfiksuotas issue #4, pamoka LL-203 įrašyta.

## 1. URL → statusas → laikas (kiekvienas du ratus)

| URL | R1/R2 | baitai | laikas |
|---|---|---|---|
| `/suprask/` | 200/200 | 3 487 | 0,397 s (3 mat.: 0,347/0,208/0,182) |
| `/index.html` | 200/200 | 3 487 | 0,21 s |
| `/404.html` | 200/200 | 563 | 0,22 s |
| `/assets/css/main.css` | 200/200 | 32 727 | 0,19 s |
| `/assets/js/app.js` | 200/200 | 36 167 | 0,22 s |
| `/assets/js/registry.js` | 200/200 | 5 626 | 0,20 s |
| `/assets/js/progress.js` | 200/200 | 11 664 | **1,68 s** (šaltas kraštas), R2 0,25 s |
| `/assets/js/speech.js` | 200/200 | 12 345 | 0,33 s |
| `/content/lt/grades.json` | 200/200 | 1 126 | 0,17 s |
| `/content/lt/grade-01/index.json` | 200/200 | 25 331 | 0,30 s |
| `/content/lt/grade-01/path.json` | 200/200 | 1 515 | 0,19 s |
| `/assets/audio/lt/manifest.json` | 200/200 | 63 974 | 0,31 s |
| sim `art/calba/daile/dorinis/geometrija/gyvenimas/matematika/muzika/pasaulis/technologijos/uzdavinys/zaidimai` | 200/200 visi | 11–171 tūkst. | 0,18–0,31 s (calba 1,68 s šaltas) |
| **82 modulių JSON** | **200/200 visi** | vid. 7 081 (3 586–10 359) | maks. 1,486 s, kiti ≤ 0,52 s |

Neigiamos kontrolės: neegzistuojantis modulis → 404, nepaskelbta `grade-02` → 404, `AGENTS.md`/`scripts/`/`research/`/`.git/config` → 404 (privatu nepaskelbta).

## 2. Publikuota = repo
`?v=1a134c12` = HEAD. Deploy 30 s. **105/105 failų lygūs su disku** po `?v=` normalizavimo (be jo skyrėsi 13 — visi tik dėl publikavimo žymės). Turinys gyvai: 9 kryptys / 82 moduliai / 359 užduotys; registre 82 SIMS, 0 našlaičių; kortelė vs modulis **82/82 sutampa**.

## 3. Sąsaja — 246 patikros, 0 problemų
390/360/1440: overflow 0, smallTargets 0, `tasksVisible` 359/359, minTaskFont 18,96–21,44, eyebrowLines 1, konsolės klaidų 0. 200 % teksto @360 → 82/82 be problemų.

## 4. Svoris / našumas
356 787 B perduota (19 failų), 92 350 B didžiausias (`pasaulis.js`). Turinys pasiekiamas 1,48 s greitu, **3,48 s @1,6 Mbps**, 8,87 s @Slow-3G. Po įkėlimo ir po paspaudimų — **0 tinklo užklausų**.

## 5. DEFEKTAS (issue #4)
Nutraukus **vieną** iš 11 sim failų: **8/8 krovimų pakimba** prie „Kraunama…“ su paslėptu `.boot-fallback` (`display: none`). Priežastis: `registry.js:70-80` 11 statinių importų + `index.html:5` deda `html.js` prieš įkėlimą. Reprodukcija — issue apraše; taisymas ne šio vaidmens ribose.

## 6. Kita
Klaviatūra tvarkinga (14 Tab, matomas fokusas), garsas išlieka po perkrovimo, be JS pranešimas matomas, reduced-motion 0 pažeidimų, 10 hash maršrutų × 2 plotai be klaidų, TLS iki 2026-12-29, manifest 2 426/2 426 (0 našlaičių), 40/40 garso imtis `200`.

Pastaba: **#3** dar gyvas — 24/82 maršrutų turi tikro teksto < 14 px (mažiausias 9,7 px `19-simto-skaiciu-lentele`); issue rašė 37/73, tad skaičius mažėjo, bet 9,7 px etiketė liko.

**Pakeistas failas:** `research/wiki/guidelines/pamokos.md` (+8 eilutės, LL-203). Nekeista turinio, kodo, `AGENTS.md`; visi vartai žali (`validate_content` 0/0, `check_docs_facts` 0/0, `check_lessons` 203 įrašai).

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-e43a3131fb33c6ce197abdaf6e1e1d282182d1c701544ff67a7ede26b94b133b
```
