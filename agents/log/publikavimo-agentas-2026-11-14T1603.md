# publikavimo-agentas — 2026-11-14T1603

- paleidimas: #288 (manual)
- trukmė: 427s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub288_audio.py
│ @@ -0,0 +1,63 @@
│ +#!/usr/bin/env python3
│ +"""288 zondas: gyvo garso prieinamumas pagal repo manifestą.
│ +
│ +Tikrina NE manifestą (jį jau lygina check_published.py baitais), o ar kiekvienas
│ +manifesto nurodytas mp3 realiai atsiduoda iš gyvos svetainės. 2026-11-14 #285
│ +tikrino visus 1138; čia imama imtis tolygiai per visą sąrašą, kad būtų matoma
│ +ne tik pradžia.
│ +"""
│ +import json
│ +import sys
│ +import urllib.request
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +
│ +data = json.load(open(f"{ROOT}/assets/audio/lt/manifest.json", encoding="utf-8"))
│ +print("manifesto tipas:", type(data).__name__)
│ +if isinstance(data, dict):
│ +    print("viršutiniai raktai:", list(data)[:8], "... iš", len(data))
│ +
│ +# Surink visus mp3 kelius iš bet kokios struktūros
│ +paths = set()
│ +
│ +
│ +def walk(node):
│ +    if isinstance(node, str):
│ +        if node.endswith(".mp3"):
│ +            paths.add(node)
│ +    elif isinstance(node, dict):
│ +        for v in node.values():
│ +            walk(v)
│ +    elif isinstance(node, list):
│ +        for v in node:
│ +            walk(v)
│ +
│ +
│ +walk(data)
│ +paths = sorted(paths)
│ +print("mp3 nuorodų:", len(paths))
│ +
│ +step = max(1, len(paths) // 40)
│ +sample = paths[::step][:40]
│ +print("imtis:", len(sample))
│ +
│ +bad = []
│ +for u in sample:
│ +    url = BASE + u.lstrip("/")
│ +    try:
│ +        with urllib.request.urlopen(url, timeout=25) as r:
│ +            blob = r.read()
│ +            code = r.status
│ +    except Exception as exc:  # noqa: BLE001
│ +        bad.append((u, repr(exc)[:80]))
│ +        print("KLAIDA", u, repr(exc)[:80])
│ +        continue
│ +    if code != 200 or len(blob) < 5000:
│ +        bad.append((u, f"code {code}, {len(blob)} B"))
│ +        print("BLOGAI", code, len(blob), u)
│ +    else:
│ +        print("200", len(blob), u.split("/")[-1])
│ +
│ +print("blogi:", len(bad))
│ +sys.exit(1 if bad else 0)
│ profiles/deepseek41flash/cache/scratch/pub288_audio.py
│ @@ -1,31 +1,26 @@
│  #!/usr/bin/env python3
│ -"""288 zondas: gyvo garso prieinamumas pagal repo manifestą.
│ +"""288 zondas: ar kiekvienas manifesto mp3 atsiduoda iš gyvos svetainės.
│
│ -Tikrina NE manifestą (jį jau lygina check_published.py baitais), o ar kiekvienas
│ -manifesto nurodytas mp3 realiai atsiduoda iš gyvos svetainės. 2026-11-14 #285
│ -tikrino visus 1138; čia imama imtis tolygiai per visą sąrašą, kad būtų matoma
│ -ne tik pradžia.
│ +check_published.py lygina manifestą baitais, bet ne kiekvieną garso failą.
│ +Manifesto keliai yra santykiniai (`n/…mp3`, `s/…mp3`) — speech.js juos jungia
│ +prie `./assets/audio/lt/` (speech.js:15), todėl zondas privalo daryti tą patį.
│  """
│  import json
│  import sys
│  import urllib.request
│ +from concurrent.futures import ThreadPoolExecutor
│
│  ROOT = "/home/zoltanas/workspace/suprask"
│ -BASE = "https://one-man-company.github.io/suprask/"
│ +BASE = "https://one-man-company.github.io/suprask/assets/audio/lt/"
│
│  data = json.load(open(f"{ROOT}/assets/audio/lt/manifest.json", encoding="utf-8"))
│ -print("manifesto tipas:", type(data).__name__)
│ -if isinstance(data, dict):
│ -    print("viršutiniai raktai:", list(data)[:8], "... iš", len(data))
│ -
│ -# Surink visus mp3 kelius iš bet kokios struktūros
│ -paths = set()
│ +rels = set()
│
│
│  def walk(node):
│      if isinstance(node, str):
│          if node.endswith(".mp3"):
│ -            paths.add(node)
│ +            rels.add(node)
│      elif isinstance(node, dict):
│          for v in node.values():
│              walk(v)
│ @@ -35,29 +30,30 @@
│
│
│  walk(data)
│ -paths = sorted(paths)
│ -print("mp3 nuorodų:", len(paths))
│ +rels = sorted(rels)
│ +print(f"manifesto raktai: {len(data)} · unikalūs mp3: {len(rels)}")
│
│ -step = max(1, len(paths) // 40)
│ -sample = paths[::step][:40]
│ -print("imtis:", len(sample))
│
│ -bad = []
│ -for u in sample:
│ -    url = BASE + u.lstrip("/")
│ -    try:
│ -        with urllib.request.urlopen(url, timeout=25) as r:
│ -            blob = r.read()
│ -            code = r.status
│ -    except Exception as exc:  # noqa: BLE001
│ -        bad.append((u, repr(exc)[:80]))
│ -        print("KLAIDA", u, repr(exc)[:80])
│ -        continue
│ -    if code != 200 or len(blob) < 5000:
│ -        bad.append((u, f"code {code}, {len(blob)} B"))
│ -        print("BLOGAI", code, len(blob), u)
│ -    else:
│ -        print("200", len(blob), u.split("/")[-1])
│ +def probe(rel):
│ +    url = BASE + rel
│ +    for attempt in (0, 1):
│ +        try:
│ +            with urllib.request.urlopen(url, timeout=25) as r:
│ +                blob = r.read()
│ +                return rel, r.status, len(blob)
│ +        except Exception as exc:  # noqa: BLE001
│ +            last = repr(exc)[:70]
│ +    return rel, last, 0
│ … omitted 14 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/pub288_class.py
│ @@ -0,0 +1,91 @@
│ +#!/usr/bin/env python3
│ +"""288 zondas: ar gyva klasės puslapio būsena tokia, kokią sukūrė #286.
│ +
│ +check_published.py įrodo, kad baitai gyvai lygūs repo. Bet jis neįrodo, kad
│ +naršyklė iš tų baitų gauna veikiantį puslapį: 39 eilutes, vieną „tęsk“ žymą ir
│ +0 px slinkties telefone. Todėl matuojama gyva svetainė, ne repo.
│ +"""
│ +import json
│ +import sys
│ +import urllib.request
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +
│ +with urllib.request.urlopen(BASE + "content/lt/grade-01/index.json", timeout=30) as r:
│ +    idx = json.loads(r.read().decode("utf-8"))
│ +live_ids = [m["id"] for s in idx["strands"] for m in s["modules"]]
│ +print(f"live index.json: {len(live_ids)} moduliai, {len(idx['strands'])} kryptys")
│ +
│ +out = {}
│ +with sync_playwright() as p:
│ +    browser = p.chromium.launch()
│ +    for width in (390, 360):
│ +        page = browser.new_page(viewport={"width": width, "height": width and 844})
│ +        errors = []
│ +        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
│ +        page.on("pageerror", lambda exc: errors.append(str(exc)))
│ +        page.goto(BASE + "#/klase/1", wait_until="networkidle")
│ +        page.wait_for_selector(".mod-row", timeout=20000)
│ +        page.wait_for_timeout(600)
│ +        data = page.evaluate(
│ +            """() => {
│ +              const rows = [...document.querySelectorAll('.mod-row')];
│ +              const cur = [...document.querySelectorAll('.mod-row.is-current')];
│ +              const chips = rows.map(r => (r.querySelector('.chip')||{}).textContent || '');
│ +              const hrefs = rows.map(r => r.getAttribute('href'));
│ +              return {
│ +                rows: rows.length,
│ +                current: cur.length,
│ +                currentHref: cur[0] ? cur[0].getAttribute('href') : '',
│ +                currentAria: cur[0] ? cur[0].getAttribute('aria-current') : '',
│ +                currentStepBadge: cur[0] ? !!cur[0].querySelector('.step-badge.current') : false,
│ +                chipDone: chips.filter(c => c === 'atlikta').length,
│ +                chipContinue: chips.filter(c => c === 'tęsk' || c === 'pradėk').length,
│ +                chipOther: chips.filter(c => c && c !== 'atlikta' && c !== 'tęsk' && c !== 'pradėk').length,
│ +                hrefs,
│ +                docScroll: document.documentElement.scrollWidth,
│ +                innerWidth: window.innerWidth,
│ +                rowsBox: rows.map(r => Math.round(r.getBoundingClientRect().height)).slice(0, 5),
│ +              };
│ +            }"""
│ +        )
│ +        bad_links = [h for h in data["hrefs"] if not any(h.endswith(i) for i in live_ids)]
│ +        out[width] = {
│ +            "rows": data["rows"],
│ +            "current": data["current"],
│ +            "currentHref": data["currentHref"],
│ +            "currentAria": data["currentAria"],
│ +            "stepBadgeCurrent": data["currentStepBadge"],
│ +            "chipDone": data["chipDone"],
│ +            "chipContinue": data["chipContinue"],
│ +            "chipOther": data["chipOther"],
│ +            "linksBeModulio": bad_links,
│ +            "overflow": data["docScroll"] - data["innerWidth"],
│ +            "rowHeights": data["rowsBox"],
│ +            "errors": errors,
│ +        }
│ +        page.close()
│ +    browser.close()
│ +
│ +print(json.dumps(out, ensure_ascii=False, indent=1))
│ +
│ +bad = False
│ +for w, d in out.items():
│ +    if d["rows"] != len(live_ids):
│ +        print(f"BLOGAI @{w}: eilučių {d['rows']} ≠ modulių {len(live_ids)}")
│ +        bad = True
│ … omitted 13 diff line(s) across 1 additional file(s)/section(s)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub288_class.py
│ @@ -12,6 +12,7 @@
│  from playwright.sync_api import sync_playwright
│
│  BASE = "https://one-man-company.github.io/suprask/"
│ +CHROME = "/home/zoltanas/.local/bin/google-chrome"
│
│  with urllib.request.urlopen(BASE + "content/lt/grade-01/index.json", timeout=30) as r:
│      idx = json.loads(r.read().decode("utf-8"))
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub288_class.py
│ @@ -21,7 +21,7 @@
│
│  out = {}
│  with sync_playwright() as p:
│ -    browser = p.chromium.launch()
│ +    browser = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│      for width in (390, 360):
│          page = browser.new_page(viewport={"width": width, "height": width and 844})
│          errors = []
Sustabdau darbą ne iki galo — baigėsi iteracijų limitas, todėl ataskaita ir `research/wiki/changelog.md` įrašas **neįrašyti**. Tai pasakau tiesiai, o ne pateikiu kaip padarytą.

## Ką realiai išmatavau

**`python3 scripts/check_published.py` → rc 0, sprendimas `sutampa`**

```
Repozitorija: 39 moduliai
Paskelbta:    39 moduliai
  · grade-01: repo 39, gyvai 39
Pervadinti ID, priimta ir užregistruota (1):
  - 03-sakinio-tvarka → 03-sakinio-zodziai (žyma už seno ID LIEKA — alias nėra)
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai,
  svetainės kodas 17 failų, versija d6d8cf99).
```

`--json`: `missing_on_live []`, `hidden_locally []`, `not_in_path []`, `stale []`, `stale_unknown []`, `aux_stale []`, `shell_stale []`, `shell_unreachable []`, `path_differs []`, `unpushed_commits 0`, `history_checked true` (istorija ne ribota), `live_version = repo_version = d6d8cf99`.

**3 gyvi adresai (HTTP + baitai):**
- `matematika/25-ilgis-ir-vienetas.json` → 200, 8 812 B, sha lygus repo
- `lietuviu-kalba/03-sakinio-zodziai.json` → 200, 5 459 B, sha lygus repo
- `pasaulio-pazinimas/16-vandens-busenos.json` → 200, 4 932 B, sha lygus repo

Papildomai baitais sutampa: `index.json` (11 741 B), `path.json` (1 339 B), `grades.json` (1 126 B), `manifest.json` (63 974 B), `app.js` ir `main.css` (po `?v=` nuėmimo).

**Garsas — visas sąrašas, ne imtis:** manifestas 569 raktai → 1 138 unikalių mp3; patikrinti **visi 1 138** iš gyvos svetainės → **1 138 × 200, 0 ne 200**, dydžiai 12 999–89 486 B, iš viso **32,89 MB** (sutampa su platformos būkle `audio_mb 32,9`). Pirmas zondo variantas rodė 40/40 404 — tai buvo **mano zondo klaida** (manifesto keliai santykiniai `n/…`, `s/…`, o `speech.js:15` juos jungia prie `./assets/audio/lt/`), ne svetainės defektas.

**#286 (vienintelis turinio/neturinio pakeitimas po #285) paskelbtas ir veikia:** gyvas `app.js` turi `aria-current="step"`, gyvas `main.css` turi `.mod-row.is-current`. Gyvas klasės puslapis (Chromium, 390 ir 360 px, 0 konsolės klaidų): **39 eilutės = 39 moduliai**, lygiai **1** `is-current` (`01-garsas-ir-raide`, `aria-current="step"`, žingsnio numeris pažymėtas), 1 žyma „pradėk“, 0 „bandyk“ likučių, **0 px slinkties**, visos 39 nuorodos veda į gyvus ID.

**Visa gyva svetainė per vartus:** `check_view.py --base <gyva> --viewports phone,small` → **78 patikros (39×2), 0 problemų, rc 0**.

## Kas liko nepadaryta

1. `research/wiki/changelog.md` eilutė (2026-11-14, #288: repo 39 / paskelbta 39) — **neįrašyta**.
2. `agents/log/publikavimo-agentas-2026-11-14T….md` ataskaita — **neįrašyta**.
3. `agents/state.json` (`roles.publikavimo-agentas`, `last_publish_check`) — **neatnaujintas**.
4. Pasiūlymo failas — neįrašytas. Kandidatas buvo vienas, bet **nepakankamai pagrįstas**: `check_published.py` nepatikrina, ar kiekvienas manifesto mp3 gyvai egzistuoja (šįkart tikrinta rankiniu zendu, 1 min 41 s). Prieš rašydamas būčiau tikrinęs, ar tai ne dubliuoja CI (`validate.yml` turi „Garso pilnumas“ → `check_audio.py` manifestas→diskas) — t. y. spraga lieka tik „repo turi, gyvai nėra“, o tai šiandien neįrodyta kaip reali.

## Sprendimas

**`sutampa`** — nieko nešalinta, joks ID nepernumeruotas, `content/**`, `assets/**`, `scripts/**`, `docs/**` neliesti, darbinė kopija nešvari ne dėl manęs (nieko nerašiau į repo).

Neužbaigta dalis yra vien rašymas (changelog + log + state), ne matavimas. Jei paleisi dar kartą, tam užtenka 3 veiksmų su jau surinktais skaičiais aukščiau.

## klaidos

```
session_id: local-5a2a0610b2b0805b26866ac26f1fc2bc17513f4e92f580ffe1428b22bbc7476d
```
