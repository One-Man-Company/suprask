# publikavimo-agentas — 2026-11-07T1813

- paleidimas: #44 (manual)
- trukmė: 236s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub44_ids.py
│ @@ -0,0 +1,20 @@
│ +import json, pathlib
│ +
│ +root = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +idx = json.loads((root / 'content/lt/grade-01/index.json').read_text(encoding='utf-8'))
│ +mods = [(s['id'], m) for s in idx['strands'] for m in s['modules']]
│ +ids = [m['id'] for _, m in mods]
│ +print("strands:", [(s['id'], len(s['modules'])) for s in idx['strands']])
│ +print("modules in index:", len(ids), "unique:", len(set(ids)))
│ +print("dups:", [i for i in set(ids) if ids.count(i) > 1])
│ +print("missing files:", [m['file'] for _, m in mods if not (root / 'content/lt' / m['file']).exists()])
│ +print("no sim:", [m['id'] for _, m in mods if not m.get('sim')])
│ +seq = json.loads((root / 'content/lt/grade-01/path.json').read_text(encoding='utf-8'))['sequence']
│ +print("path len:", len(seq), "unique:", len(set(seq)))
│ +print("not_in_path:", [i for i in ids if i not in seq])
│ +print("in_path_not_index:", [i for i in seq if i not in ids])
│ +print("id/file mismatch:", [(m['id'], m['file']) for _, m in mods if pathlib.Path(m['file']).stem != m['id']])
│ +sims = "".join(p.read_text(encoding='utf-8') for p in (root / 'assets/js/sims').glob('*.js'))
│ +comp = [m['sim'] for _, m in mods if isinstance(m.get('sim'), dict)]
│ +print("sim comps:", len(comp), "missing in code:", [c['component'] for c in comp if '"%s"' % c['component'] not in sims])
│ +print("sim component used:", sorted({c['component'] for c in comp}))
│ profiles/deepseek41flash/cache/scratch/pub44_live.py
│ @@ -0,0 +1,48 @@
│ +import hashlib
│ +import json
│ +import pathlib
│ +import urllib.request
│ +
│ +root = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +idx = json.loads((root / 'content/lt/grade-01/index.json').read_text(encoding='utf-8'))
│ +mods = [(s['id'], m) for s in idx['strands'] for m in s['modules']]
│ +sims = "".join(p.read_text(encoding='utf-8') for p in (root / 'assets/js/sims').glob('*.js'))
│ +row = []
│ +for strand, m in mods:
│ +    mp = root / 'content/lt' / m['file']
│ +    mod = json.loads(mp.read_text(encoding='utf-8'))
│ +    comp = (mod.get('sim') or {}).get('component')
│ +    row.append((strand, m['id'], comp, '"%s"' % comp in sims if comp else None,
│ +                len(mod.get('tasks', [])), mod.get('grade'), mod.get('strand')))
│ +print("strand | id | sim component | registered | tasks | grade | strand field")
│ +for r in row:
│ +    print(" | ".join(str(x) for x in r))
│ +print("total tasks:", sum(r[4] for r in row))
│ +print("unregistered sims:", [r[1] for r in row if r[3] is False])
│ +print("grade/strand mismatches:", [(r[1], r[5], r[6]) for r in row if r[5] != 1 or r[6] != r[0]])
│ +
│ +# live: every module json reachable + byte-equal registry/app.js to local
│ +base = "https://one-man-company.github.io/suprask/"
│ +def get(path):
│ +    req = urllib.request.Request(base + path, headers={"User-Agent": "suprask-check/1.0"})
│ +    with urllib.request.urlopen(req, timeout=25) as resp:
│ +        return resp.status, resp.read()
│ +
│ +bad = []
│ +for strand, m in mods:
│ +    try:
│ +        st, body = get("content/lt/" + m['file'])
│ +        if st != 200:
│ +            bad.append((m['id'], st))
│ +        local = (root / 'content/lt' / m['file']).read_bytes()
│ +        if body != local:
│ +            bad.append((m['id'], 'differs'))
│ +    except Exception as exc:
│ +        bad.append((m['id'], type(exc).__name__))
│ +print("live module fetch problems:", bad)
│ +
│ +for p in ["assets/js/registry.js", "assets/js/app.js", "assets/js/progress.js", "assets/css/main.css", "content/lt/grade-01/index.json", "content/lt/grade-01/path.json"]:
│ +    st, body = get(p)
│ +    lh = hashlib.sha256((root / p).read_bytes()).hexdigest()
│ +    lv = hashlib.sha256(body).hexdigest()
│ +    print(("SAME " if lh == lv else "DIFF ") + p, st, lh[:12], lv[:12])
│ profiles/deepseek41flash/cache/scratch/pub44_sims.mjs
│ @@ -0,0 +1,20 @@
│ +import { SIMS as calba } from "/home/zoltanas/workspace/suprask/assets/js/sims/calba.js";
│ +import { SIMS as mat } from "/home/zoltanas/workspace/suprask/assets/js/sims/matematika.js";
│ +import { SIMS as pas } from "/home/zoltanas/workspace/suprask/assets/js/sims/pasaulis.js";
│ +import { SIMS as zai } from "/home/zoltanas/workspace/suprask/assets/js/sims/zaidimai.js";
│ +import { SIMS as tech } from "/home/zoltanas/workspace/suprask/assets/js/sims/technologijos.js";
│ +
│ +const all = { ...calba, ...mat, ...pas, ...zai, ...tech };
│ +console.log("per-file:", [["calba", Object.keys(calba).length], ["matematika", Object.keys(mat).length], ["pasaulis", Object.keys(pas).length], ["zaidimai", Object.keys(zai).length], ["technologijos", Object.keys(tech).length]]);
│ +console.log("total sims:", Object.keys(all).length);
│ +console.log("keys:", Object.keys(all).sort().join(", "));
│ +
│ +import fs from "node:fs";
│ +const idx = JSON.parse(fs.readFileSync("/home/zoltanas/workspace/suprask/content/lt/grade-01/index.json", "utf8"));
│ +const comps = [];
│ +for (const s of idx.strands) for (const m of s.modules) {
│ +  const mod = JSON.parse(fs.readFileSync("/home/zoltanas/workspace/suprask/content/lt/" + m.file, "utf8"));
│ +  comps.push([m.id, mod.sim && mod.sim.component]);
│ +}
│ +const missing = comps.filter(([, c]) => !c || !all[c]).map(([id, c]) => id + " -> " + c);
│ +console.log("module sims missing from registry:", missing.length ? missing : "none");
│ profiles/deepseek41flash/cache/scratch/pub44_nav.py
│ @@ -0,0 +1,57 @@
│ +import json
│ +import os
│ +import sys
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = os.environ.get("BASE", "https://one-man-company.github.io/suprask/")
│ +CHROME = str(os.path.expanduser("~/.local/bin/google-chrome"))
│ +
│ +MEASURE = r"""
│ +() => {
│ +  const rows = [...document.querySelectorAll('a[href*="#/modulis/"]')];
│ +  const hrefs = rows.map(a => a.getAttribute('href'));
│ +  const counts = {};
│ +  for (const h of hrefs) counts[h] = (counts[h] || 0) + 1;
│ +  return {
│ +    links: hrefs.length,
│ +    unique: Object.keys(counts).length,
│ +    hasElektros: hrefs.some(h => h.includes('01-elektros-grandine')),
│ +    done: (document.querySelector('.progress, .done-label, [data-progress]')?.innerText || '').slice(0, 80),
│ +    overflow: document.documentElement.scrollWidth - window.innerWidth,
│ +    h1: document.querySelector('h1')?.innerText || null,
│ +    strands: [...document.querySelectorAll('.strand-card, .strand')].map(e => (e.innerText || '').split('\n')[0]).slice(0, 8),
│ +  };
│ +}
│ +"""
│ +
│ +out = []
│ +with sync_playwright() as pw:
│ +    browser = pw.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│ +    for width, height in [(360, 800), (768, 1024), (1280, 900)]:
│ +        ctx = browser.new_context(viewport={"width": width, "height": height})
│ +        page = ctx.new_page()
│ +        errors = []
│ +        page.on("pageerror", lambda e: errors.append(str(e)[:120]))
│ +        page.on("console", lambda m: errors.append("console:" + m.text[:120]) if m.type == "error" else None)
│ +        for route in ["#/", "#/klase/1"]:
│ +            page.goto(BASE + route, wait_until="domcontentloaded", timeout=30000)
│ +            page.wait_for_timeout(900)
│ +            data = page.evaluate(MEASURE)
│ +            data["route"] = route
│ +            data["width"] = width
│ +            data["errors"] = list(errors)
│ +            out.append(data)
│ +            errors.clear()
│ +        ctx.close()
│ +    browser.close()
│ +
│ +for r in out:
│ +    print(f'{r["route"]} @{r["width"]}: links={r["links"]} unique={r["unique"]} elektros={r["hasElektros"]} '
│ +          f'overflow={r["overflow"]}px h1={r["h1"]!r} err={r["errors"]}')
│ +    print("   strands:", r["strands"])
│ +    print("   progress text:", r["done"])
│ +
│ +bad = [r for r in out if r["overflow"] > 1 or r["errors"] or (r["route"] == "#/klase/1" and (r["unique"] < 18 or not r["hasElektros"]))]
│ +print("PROBLEMS:", len(bad))
│ +sys.exit(1 if bad else 0)
PUBLIKAVIMO PATIKRA #44 — ataskaita (be log/state įrašų, žr. pabaigą)

1. check_published.py išvestis (realus paleidimas, rc=0):

    Repozitorija: 18 moduliai
    Paskelbta:    18 moduliai
    ✔ Repo ir gyva svetainė sutampa.

   missing_on_live: —, hidden_locally: —, not_in_path: —, neišstumtų commit'ų: 0.

2. 3 gyvi HTTP kodai (curl, --max-time 25):

    200 https://one-man-company.github.io/suprask/content/lt/grade-01/technologijos/01-elektros-grandine.json
    200 https://one-man-company.github.io/suprask/content/lt/grade-01/matematika/17-kryptys-ir-vieta.json
    200 https://one-man-company.github.io/suprask/content/lt/grade-01/index.json

3. ID tvarumas ir sandara (matuota, ne iš atminties):
   - index.json: 18 modulių, 18 unikalių ID, 0 dublikatų; 5 kryptys (lietuviu-kalba 3, matematika 8, pasaulio-pazinimas 3, zaidimu-teorija 3, technologijos 1).
   - Visi 18 `file` egzistuoja; kiekvieno `id` sutampa su failo vardu; `grade`/`strand` laukai nesipriešina krypčiai (0 neatitikimų); užduočių iš viso 72.
   - path.json: 18 įrašų, 18 unikalių, `not_in_path` tuščias, `in_path_not_index` tuščias. Tvarkos nekeičiau — nebuvo ko.
   - Simuliacijos: importavau visus 5 `SIMS` registrus per node — 18 komponentų (calba 3, matematika 8, pasaulis 3, zaidimai 3, technologijos 1); nė vienas modulio `sim.component` neregistruotas: 0.
   - Baitų lygybė su gyva svetaine (sha256): registry.js, app.js, progress.js, main.css, grade-01/index.json, grade-01/path.json — visi SAME. Visi 18 modulių JSON gyvai baitais identiški repo failams (0 skirtumų, 0 klaidų).

4. Matomumo patikra (LL-07), realus Chromium per scripts/check_view.py, gyvas adresas:
   - 54 bandymai (18 maršrutų × desktop 1440 / tablet 1024 / phone 390), su Brave skydų blokais (localStorage, crypto.subtle, speechSynthesis išjungti): problemos: 0. Visi moduliai matomi, telpa, simuliacijoje yra matomas valdiklis, jokių paslėptų valdiklių, jokių nutekėjusių užduočių.
   - Navigacija atskiru zondus 360/768/1280 px: `#/klase/1` → 19 nuorodų, 18 unikalių, `01-elektros-grandine` yra; 5 krypčių kortelės (įsk. technologijos); horizontali slinktis 0 px visur; 0 konsolės klaidų ir 0 pageerror.
   - validate_content.py --grade 1: 0 klaidų, 0 įspėjimų. check_ui.py: 0/0.

5. Sprendimas: SUTAMPA. Nieko nekeitžiau — nebuvo ko taisyti. Jokio modulio nepašalinau, ID nepernumeravau, path.json neliečiau.

6. Kas NEPADARYTA (sąžiningai): neįrašiau `agents/log/publikavimo-agentas-2026-11-07T…md`, neatnaujinau `agents/state.json` (`last_publish_check`) ir neįrašiau changelog eilutės — pasibaigė įrankių kvota. Tai trys tekstiniai įrašai; jokio turinio, CSS ar simuliacijų keitimo nereikia. Norimas changelog įrašas:
   „2026-11-07 — Publikavimo patikra #44: repo 18 / paskelbta 18; 3 HTTP 200; check_view 54×0 problemų; sprendimas — sutampa.“

7. Pasiūlymų neteikiu. Radiniai, kurie ne mano nuosavybė ir kurių neliečiau:
   - docs/ARCHITEKTURA.md:172 „Būsena“ tebėra „4 kryptys, 17 modulių, 17 simuliacijų“, o repo ir gyva svetainė turi 5 kryptis / 18 / 18. Jau padengta atviru kritiko pasiūlymu, naujo nedubliuoju.
   - content/lt/grades.json 1 klasei skelbia 16 modulių, o index.json turi 18 (jau fiksuota #769). Vaikui nerodoma, bet publikuojamas metaduomenų failas skelbia netiesą.

8. Pamokos: šįkart platformos defekto neradau, bet pakartojau SAVO matuoklio klaidą — bandymas „ar simuliacija registruota“ ieškojo `"desimtukas"` su kabutėmis, o registre raktai parašyti sutrumpinta forma (`desimtukas,`), todėl trys sveikos simuliacijos atrodė neregistruotos. Tai jau antras paleidimas iš eilės su tuo pačiu klaidingu signalu, tad verta pamokos LL-13 „Matuoklio klaida nėra platformos klaida“ (Simptomas: įrankis praneša 0 radinių ten, kur jų yra / Priežastis: paieška tekstu, o ne importuotas registras / Taisyklė: registrą tikrink importu `SIMS`, ne grep'u / Patikra: `node pub44_sims.mjs` → 18 raktų, 0 trūkstamų). Jos neįrašiau dėl kvotos.

## klaidos

```
session_id: local-73aa3036e124399b4817a7c9842bb066c57e0452f8c386b4f2342862b42234e5
```
