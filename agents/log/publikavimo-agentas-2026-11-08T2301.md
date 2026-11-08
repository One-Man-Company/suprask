# publikavimo-agentas — 2026-11-08T2301

- paleidimas: #175 (manual)
- trukmė: 291s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub175.py
│ @@ -0,0 +1,59 @@
│ +#!/usr/bin/env python3
│ +"""#175: ar kiekvienas gyvas failas baitais lygus repo HEAD (ir ar ?v= žyma = origin/main)?"""
│ +import hashlib, json, pathlib, re, subprocess, urllib.request, sys
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +UA = {"User-Agent": "suprask-check/1.0"}
│ +
│ +def get(url):
│ +    req = urllib.request.Request(url, headers=UA)
│ +    with urllib.request.urlopen(req, timeout=30) as r:
│ +        return r.read()
│ +
│ +def head_bytes(rel):
│ +    return subprocess.run(["git", "show", f"HEAD:{rel}"], cwd=ROOT, capture_output=True).stdout
│ +
│ +def sha(b):
│ +    return hashlib.sha256(b).hexdigest()[:8]
│ +
│ +head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
│ +main = subprocess.run(["git", "rev-parse", "origin/main"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
│ +print("HEAD", head, "origin/main", main, "equal", head == main)orig
│ +
│ +idx = json.loads((ROOT / "content/lt/grade-01/index.json").read_text())
│ +
│ +# moduliai
│ +files = []
│ +for s in idx["strands"]:
│ +    for m in s["modules"]:
│ +        files.append((m["file"], f'{s["id"]}/{m["id"]}'))
│ +bad = []
│ +for rel, name in files:
│ +    live = get(BASE + "content/lt/" + rel)
│ +    local = head_bytes("content/lt/" + rel)
│ +    if live != local:
│ +        bad.append((name, len(local), len(live), sha(local), sha(live)))
│ +print(f"moduliai: {len(files)}; baitais skiriasi: {len(bad)}")
│ +for b in bad: print("  SKIRIASI", b)
│ +
│ +# kiti turinio failai
│ +for rel in ["content/lt/grade-01/index.json", "content/lt/grade-01/path.json", "content/lt/grades.json",
│ +            "assets/audio/lt/manifest.json", "assets/css/main.css", "assets/js/sims/matematika.js"]:
│ +    live = get(BASE + rel); local = head_bytes(rel)
│ +    print(f"{rel}: {'LYGUS' if live == local else 'SKIRIASI'} local {len(local)}B {sha(local)} live {len(live)}B {sha(live)}")
│ +
│ +# ?v= žymos
│ +tag = main[:8]
│ +for rel in ["index.html", "assets/js/app.js", "assets/js/registry.js", "assets/js/sims/gyvenimas.js"]:
│ +    live = get(BASE + rel).decode("utf-8", "replace")
│ +    local = head_bytes(rel).decode("utf-8", "replace")
│ +    tags = sorted(set(re.findall(r"\?v=([0-9a-f]{8})", live)))
│ +    local_tags = sorted(set(re.findall(r"\?v=([0-9a-f]{8})", local)))
│ +    norm = live
│ +    for t in tags:
│ +        norm = norm.replace("?v=" + t, "")
│ +    norm_local = local
│ +    for t in local_tags:
│ +        norm_local = norm_local.replace("?v=" + t, "")
│ +    print(f"{rel}: live žymos {tags}, repo {local_tags}, be žymų lygus={norm == norm_local}, žyma==main[:8] {all(t == tag for t in tags) if tags else 'n/a'}")
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub175.py
│ @@ -19,7 +19,7 @@
│
│  head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
│  main = subprocess.run(["git", "rev-parse", "origin/main"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
│ -print("HEAD", head, "origin/main", main, "equal", head == main)orig
│ +print("HEAD", head, "origin/main", main, "equal", head == main)
│
│  idx = json.loads((ROOT / "content/lt/grade-01/index.json").read_text())
│
│ profiles/deepseek41flash/cache/scratch/counts175.py
│ @@ -0,0 +1,23 @@
│ +import json, pathlib
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +idx = json.loads((ROOT / "content/lt/grade-01/index.json").read_text())
│ +ids = [m["id"] for s in idx["strands"] for m in s["modules"]]
│ +files = [m["file"] for s in idx["strands"] for m in s["modules"]]
│ +print("modules", len(ids), "unique", len(set(ids)))
│ +print("missing files", [f for f in files if not (ROOT / "content/lt" / f).exists()])
│ +path = json.loads((ROOT / "content/lt/grade-01/path.json").read_text())
│ +seq = path["sequence"]
│ +print("path", len(seq), "unique", len(set(seq)), "missing", [i for i in ids if i not in seq], "extra", [i for i in seq if i not in ids])
│ +g = json.loads((ROOT / "content/lt/grades.json").read_text())
│ +print("grades modules", g.get("modules"), "updated", g.get("updated"))
│ +mism = []
│ +tasks = 0
│ +for s in idx["strands"]:
│ +    for m in s["modules"]:
│ +        d = json.loads((ROOT / "content/lt" / m["file"]).read_text())
│ +        tasks += len(d["tasks"])
│ +        if d["title"] != m["title"] or d["subtitle"] != m["subtitle"] or d["minutes"] != m["minutes"]:
│ +            mism.append(m["id"])
│ +print("index vs module mismatch", mism)
│ +print("strands", [(s["id"], len(s["modules"])) for s in idx["strands"]])
│ +print("tasks total", tasks)
│ profiles/deepseek41flash/cache/scratch/sims175.mjs
│ @@ -0,0 +1,33 @@
│ +import { readFileSync, readdirSync } from "node:fs";
│ +import { pathToFileURL } from "node:url";
│ +import path from "node:path";
│ +
│ +const ROOT = "/home/zoltanas/workspace/suprask";
│ +globalThis.window = { AudioContext: class {}, addEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }) };
│ +globalThis.document = { createElement: () => ({ style: {}, appendChild() {}, addEventListener() {}, getContext: () => null, setAttribute() {} }), addEventListener() {}, querySelector: () => null, documentElement: { style: {} }, body: { appendChild() {}, classList: { add() {}, remove() {} } } };
│ +globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
│ +globalThis.navigator = { language: "lt-LT" };
│ +globalThis.requestAnimationFrame = (f) => setTimeout(f, 0);
│ +
│ +const dirs = readdirSync(path.join(ROOT, "assets/js/sims")).filter((f) => f.endsWith(".js") && f !== "art.js");
│ +let all = {};
│ +for (const f of dirs) {
│ +  const mod = await import(pathToFileURL(path.join(ROOT, "assets/js/sims", f)).href);
│ +  const sims = mod.SIMS || {};
│ +  for (const [k, v] of Object.entries(sims)) {
│ +    if (all[k]) console.log("DUBLIKATAS", k, f);
│ +    all[k] = { file: f, mount: typeof v.mount };
│ +  }
│ +  console.log("failas", f, Object.keys(sims).length, "sim");
│ +}
│ +const idx = JSON.parse(readFileSync(path.join(ROOT, "content/lt/grade-01/index.json"), "utf8"));
│ +const used = [];
│ +for (const s of idx.strands) for (const m of s.modules) {
│ +  const d = JSON.parse(readFileSync(path.join(ROOT, "content/lt", m.file), "utf8"));
│ +  if (d.sim && d.sim.component) used.push(d.sim.component);
│ +}
│ +const missing = used.filter((u) => !all[u]);
│ +const unused = Object.keys(all).filter((k) => !used.includes(k));
│ +const noMount = Object.entries(all).filter(([, v]) => v.mount !== "function").map(([k]) => k);
│ +console.log("registre", Object.keys(all).length, "naudojama", used.length, "unikalus naudojami", new Set(used).size);
│ +console.log("neregistruoti", missing, "nenaudojami", unused, "be mount", noMount);
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/sims175.mjs
│ @@ -6,7 +6,7 @@
│  globalThis.window = { AudioContext: class {}, addEventListener() {}, matchMedia: () => ({ matches: false, addEventListener() {} }) };
│  globalThis.document = { createElement: () => ({ style: {}, appendChild() {}, addEventListener() {}, getContext: () => null, setAttribute() {} }), addEventListener() {}, querySelector: () => null, documentElement: { style: {} }, body: { appendChild() {}, classList: { add() {}, remove() {} } } };
│  globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
│ -globalThis.navigator = { language: "lt-LT" };
│ +try { globalThis.navigator = { language: "lt-LT" }; } catch { /* node 22 read-only */ }
│  globalThis.requestAnimationFrame = (f) => setTimeout(f, 0);
│
│  const dirs = readdirSync(path.join(ROOT, "assets/js/sims")).filter((f) => f.endsWith(".js") && f !== "art.js");
│ profiles/deepseek41flash/cache/scratch/audio175.py
│ @@ -0,0 +1,30 @@
│ +import json, pathlib, sys
│ +sys.path.insert(0, "/home/zoltanas/workspace/suprask/scripts")
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +man = json.loads((ROOT / "assets/audio/lt/manifest.json").read_text())
│ +print("manifest raktai", len(man))
│ +want = set()
│ +collect = {}
│ +for k, v in man.items():
│ +    for p in ("n", "s"):
│ +        if isinstance(v, dict) and v.get(p):
│ +            want.add(v[p] if p == "n" else v[p])
│ +paths = set()
│ +for v in man.values():
│ +    if isinstance(v, dict):
│ +        for p in ("n", "s"):
│ +            if v.get(p):
│ +                paths.add(v[p])
│ +disk = {str(p.relative_to(ROOT)) for p in (ROOT / "assets/audio").rglob("*.mp3")}
│ +print("diske mp3", len(disk), "manifeste takai", len(paths))
│ +print("trūksta failų", sorted(paths - disk)[:10], len(paths - disk))
│ +orph = sorted(disk - paths)
│ +print("našlaičiai", len(orph), orph[:10])
│ +# texts collected by generate_audio
│ +import generate_audio as ga
│ +texts = ga.collect()
│ +print("collect tekstų", len(texts))
│ +hit = [t for t in texts if t not in man]
│ +print("manifeste nėra collect tekstų", len(hit), hit[:5])
│ +stale = [k for k in man if k not in texts]
│ +print("manifesto raktai, kurių collect nebegrąžina", len(stale), stale[:10])
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/audio175.py
│ @@ -14,7 +14,7 @@
│      if isinstance(v, dict):
│          for p in ("n", "s"):
│              if v.get(p):
│ -                paths.add(v[p])
│ +                paths.add("assets/audio/lt/" + v[p])
│  disk = {str(p.relative_to(ROOT)) for p in (ROOT / "assets/audio").rglob("*.mp3")}
│  print("diske mp3", len(disk), "manifeste takai", len(paths))
│  print("trūksta failų", sorted(paths - disk)[:10], len(paths - disk))
│ research/wiki/changelog.md
│ @@ -1,6 +1,17 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-08 (23:05) — Publikavimo patikra #175: repo 31 / paskelbta 31, svetainė baitais lygi `HEAD`
│ +
│ +- **`check_published.py`** → repo 31, paskelbta 31, `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, neišstumtų commit'ų 0, `live_error` tuščias, `rc=0`. `HEAD` = `origin/main` = `e3a61b2` (0 priekyje, 0 atsilieka).
│ +- **4 gyvi adresai (HTTP):** šaknis `200` (3487 B), `content/lt/grade-01/matematika/24-komandu-seka.json` `200` (6874 B), `content/lt/grade-01/gyvenimo-igudziai/01-dovana-ir-noras.json` `200` (5389 B), `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` `200` (4947 B); papildomai `index.json` `200`, `grades.json` `200`, `assets/audio/lt/manifest.json` `200`.
│ +- **Baitai, ne skaičiai:** visi 31 modulio JSON failai gyvai baitais lygūs `git show HEAD:` (skiriasi 0); `grade-01/index.json` (`dda1273a`, 9192 B), `path.json` (`88ff0a20`, 1103 B), `grades.json` (`2ec1e57d`, 1126 B), `audio/lt/manifest.json` (`de1ad5e4`, 50 497 B, 463 raktai), `main.css` (`c88fab2e`), `matematika.js` (`afc29fd6`) — lygūs. `index.html`, `app.js`, `registry.js`, `gyvenimas.js` skiriasi TIK `?v=e3a61b20` žyma (`pages.yml:33–42`); be žymų — baitais lygūs, žyma lygi `origin/main` pirmiems 8 simboliams (LL-41, ne defektas).
│ +- **Struktūra:** `index.json` 31 modulis, 31 unikalus ID, trūkstamų failų 0; `path.json` 31 įrašas, 31 unikalus, trūksta 0, perteklius 0 (tvarka neliesta); `grades.json` `grades[0].modules` 31, `updated` 2026-11-08; `index.json` pavadinimai/paantraštės/minutės su modulių JSON sutampa (0 neatitikimų); 133 užduotys.
│ +- **Simuliacijų registras (node importas):** 31 raktas 8 failuose (kalba 4, geometrija 1, gyvenimas 1, matematika 14, muzika 1, pasaulis 5, technologijos 2, žaidimai 3), visi su `mount()`, neregistruotų 0, nenaudojamų 0, dublikatų 0.
│ +- **Garsas:** `check_audio.py` → 462 tekstai × 2 įrašai, visi Piper, `rc=0`; manifeste 926 takai, trūkstamų failų 0; diske 932 mp3 → 6 našlaičiai; 1 pasenęs manifesto raktas („Dangtis“, `collect()` jo nebegrąžina). Vaikui nieko netrūksta.
│ +- **Vartai:** `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų. **Gyvas puslapis naršyklėje:** `check_view.py --base https://one-man-company.github.io/suprask/ --viewports phone,small` → 62 patikros (31 maršrutas × 2 plotai), 0 problemų.
│ +- **Sprendimas:** sutampa; nieko nešalinta, ID nepernumeruoti, `path.json` neliestas. Pastaba: paleidimas #173 (log `agents/log/publikavimo-agentas-2026-11-08T1932.md`) baigėsi prieš įrašant changelog eilutę — šis įrašas ją pakeičia šviežiais to paties `HEAD` skaičiais. Ataskaita `agents/log/publikavimo-agentas-2026-11-08T2305.md`.
│
│  ## 2026-11-08 (16:37) — Publikavimo patikra #171: 31 modulis gyvai, svetainė pastatyta iš `origin/main`
│
│ agents/log/publikavimo-agentas-2026-11-08T2305.md
│ @@ -0,0 +1,98 @@
│ +# Publikavimo agentas — paleidimas #175
│ +
│ +Data: 2026-11-08 23:05 (EET)
│ +Vaidmuo: publikavimo-agentas
│ +Užduotis: užtikrinti, kad sukurtas turinys būtų paskelbtas ir kad publikuojant nedingtų nė vienas ankstesnis modulis.
│ +
│ +## 1. check_published.py
│ +
│ +```
│ +Repozitorija: 31 moduliai
│ +Paskelbta:    31 moduliai
│ +✔ Repo ir gyva svetainė sutampa.
│ +```
│ +
│ +`--json`: `{"local": 31, "published": 31, "missing_on_live": [], "hidden_locally": [],
│ +"not_in_path": [], "unpushed_commits": 0, "last_commit": "e3a61b2 [sistemos-architektas] #174: import sqlite3, sys",
│ +"live_error": ""}` → rc 0.
│ +
│ +`HEAD` = `origin/main` = `e3a61b203b9cb23558102a36f2da75ad900a36ab` (`git fetch` po to: 0 priekyje, 0 atsilieka). Darbinė kopija prieš darbą švari.
│ +
│ +## 2. Gyvi adresai (HTTP)
│ +
│ +| adresas | kodas | baitai |
│ +|---|---|---|
│ +| `https://one-man-company.github.io/suprask/` | 200 | 3487 |
│ +| `content/lt/grade-01/matematika/24-komandu-seka.json` | 200 | 6874 |
│ +| `content/lt/grade-01/gyvenimo-igudziai/01-dovana-ir-noras.json` | 200 | 5389 |
│ +| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | 200 | 4947 |
│ +| `content/lt/grade-01/index.json` | 200 | 9192 |
│ +| `content/lt/grades.json` | 200 | 1126 |
│ +| `assets/audio/lt/manifest.json` | 200 | 50497 |
│ +
│ +## 3. Baitai, ne skaičiai
│ +
│ +- Visi **31 modulio JSON** gyvai = `git show HEAD:` baitais (skiriasi 0).
│ +- `grade-01/index.json` `dda1273a` (9192 B), `grade-01/path.json` `88ff0a20` (1103 B),
│ +  `grades.json` `2ec1e57d` (1126 B), `audio/lt/manifest.json` `de1ad5e4` (50 497 B, 463 raktai),
│ +  `main.css` `c88fab2e` (22 718 B), `matematika.js` `afc29fd6` (156 641 B) — gyvai = HEAD.
│ +- `index.html`, `assets/js/app.js`, `assets/js/registry.js`, `assets/js/sims/gyvenimas.js`
│ +  skiriasi TIK `?v=e3a61b20` žyma (`pages.yml:33–42`); nulupus žymą — baitais lygūs,
│ +  žyma = `origin/main` pirmiems 8 simboliams → gyva svetainė pastatyta iš `e3a61b2` (LL-41,
│ +  ne defektas).
│ +
│ +## 4. Struktūra ir registras
│ +
│ +- `index.json`: 31 modulis, 31 unikalus ID, trūkstamų failų 0; kryptys: lietuvių 4,
│ +  matematika 15, pasaulio pažinimas 5, muzika 1, žaidimų teorija 3, technologijos 2,
│ +  gyvenimo įgūdžiai 1. Užduočių iš viso 133.
│ +- `index.json` `title/subtitle/minutes` sutampa su modulių JSON — 0 neatitikimų.
│ +- `path.json`: 31 įrašas, 31 unikalus, trūksta 0, perteklius 0. **Tvarkos neliečiau.**
│ +- `grades.json`: `grades[0].modules` 31, `updated` 2026-11-08, 1 klasė `live`.
│ +- Simuliacijų registras (node importas, su `window`/`document`/`localStorage` pakaitais):
│ +  31 raktas 8 failuose, visi su `mount()`, naudojama 31, neregistruotų 0, nenaudojamų 0,
│ +  dublikatų 0.
│ +
│ +## 5. Garsas
│ +
│ +- `check_audio.py` → ✔ 462 tekstai, po du įrašus, visi Piper, rc 0.
│ +- Manifestas 463 raktai; `generate_audio.collect()` 462 → **1 pasenęs raktas** („Dangtis“).
│ +- Manifeste 926 takų, trūkstamų failų **0**; diske 932 mp3 → **6 našlaičiai**
│ +  (`3411685a…`, `59d9a6e9…`, `6d5d3fd7…` × n/s). Vaikui nieko netrūksta; higiena —
│ +  atskiras pasiūlymas.
│ +
│ +## 6. Vartai
│ +
│ +- `python3 scripts/validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų (rc 0).
│ +- `python3 scripts/check_view.py --base https://one-man-company.github.io/suprask/ --viewports phone,small`
│ +  → Plotai phone 390 px, small 360 px; **62 patikros (31 × 2), 0 problemų**, rc 0.
│ +
│ +## 7. Sprendimas
│ +
│ +**SUTAMPA** — repo 31 / paskelbta 31, 0 neišstumtų commit'ų, visi 31 moduliai baitais lygūs
│ +`HEAD`, gyva svetainė pastatyta iš `e3a61b2`, sims 31/31, garsas 462/462 be trūkstamų įrašų,
│ +62/62 naršyklės patikros švarios.
│ +
│ +Nieko nešalinau, ID nepernumeravau, `path.json` nekeičiau, `git push` nedariau, turinio,
│ +CSS ir simuliacijų neliečiau.
│ +
│ … omitted 20 diff line(s) across 1 additional file(s)/section(s)
Paleidimas #175 — sustabdytas ties žingsnių limitu, bet pagrindinis darbas padarytas ir patikrintas realiais paleidimais.

SKAIČIAI (check_published.py)

    Repozitorija: 31 moduliai
    Paskelbta:    31 moduliai
    ✔ Repo ir gyva svetainė sutampa.
    {"local":31,"published":31,"missing_on_live":[],"hidden_locally":[],
     "not_in_path":[],"unpushed_commits":0,"live_error":""}  rc=0

HEAD = origin/main = e3a61b203b9cb23558102a36f2da75ad900a36ab (0 priekyje, 0 atsilieka).

3 GYVI ADRESAI (HTTP)

    200  https://one-man-company.github.io/suprask/                                           3487 B
    200  .../content/lt/grade-01/matematika/24-komandu-seka.json                               6874 B
    200  .../content/lt/grade-01/gyvenimo-igudziai/01-dovana-ir-noras.json                     5389 B
    200  .../content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json                    4947 B
    (papildomai index.json 200, grades.json 200, audio manifest 200)

BAITAI, NE SKAIČIAI — visi 31 modulio JSON gyvai baitais lygūs `git show HEAD:` (0 skirtumų); index.json dda1273a, path.json 88ff0a20, grades.json 2ec1e57d, manifest.json de1ad5e4 (463 raktai), main.css c88fab2e, matematika.js afc29fd6 — lygūs. index.html/app.js/registry.js/gyvenimas.js skiriasi TIK `?v=e3a61b20` žyma, kuri = origin/main pirmi 8 simboliai (LL-41, ne defektas).

KITA: path.json 31/31 unikalūs, trūksta 0, perteklius 0 (tvarkos neliečiau); index.json 31 modulis / 133 užduotys, metaduomenys su modulių JSON sutampa 0 neatitikimų; sims 31/31 su mount(), neregistruotų 0; check_audio 462 tekstai × 2, Piper, rc 0; validate_content --grade 1 --strict 0/0; check_view prieš gyvą bazę 62/62 (31 maršrutas × 390/360 px), 0 problemų.

SPRENDIMAS: SUTAMPA. Nieko nešalinau, ID nepernumeravau, git push nedariau, turinio/CSS/sim neliečiau.

ĮRAŠYTA
- research/wiki/changelog.md — naujas įrašas viršuje „2026-11-08 (23:05) — Publikavimo patikra #175“.
- agents/log/publikavimo-agentas-2026-11-08T2305.md — pilna ataskaita.

NEĮRAŠYTA (sąžiningai, baigėsi žingsniai)
1) agents/state.json — last_publish_check dar rodo #171; reikia run_id 175, decision „sutampa“, head_sha e3a61b2, modules_live 31, audio 462, cache_tag ?v=e3a61b20, orphan_mp3 6, stale_manifest_key „Dangtis“.
2) agents/proposals/2026-11-08-publikavimo-agentas-garso-manifesto-higiena.json — garso higiena: manifeste 1 pasenęs raktas („Dangtis“), diske 932 mp3 vs 926 referencijuotų → 6 našlaičiai, trūkstamų 0; target scripts/generate_audio.py (`--prune` jau egzistuoja, bet manifestas nevalomas automatiškai), priority low.
3) Commit'o nedariau — pagal vaidmens taisykles publikavimą atlieka bėgiklis.

Radinys: #173 log egzistuoja (…T1932.md), bet changelog eilutės nebuvo — šis įrašas ją pakeičia šviežiais to paties HEAD skaičiais. Naujos pamokos nepridėjau: viskas priklauso LL-41 šeimai.

## klaidos

```
session_id: local-5105faba10b520a57b919a1722d590fe3eaeafb8e5c9ebc7fd475f201007683f
```
