# publikavimo-agentas — 2026-11-11T2302

- paleidimas: #239 (manual)
- trukmė: 344s
- exit: 0 → ok
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub239_compare.py
│ @@ -0,0 +1,61 @@
│ +"""Publikavimo patikros #239 zondas: gyvi failai vs HEAD baitai."""
│ +import json
│ +import subprocess
│ +import urllib.request
│ +
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +
│ +
│ +def get(url):
│ +    with urllib.request.urlopen(url, timeout=30) as r:
│ +        return r.status, r.read()
│ +
│ +
│ +def blob(path):
│ +    return subprocess.run(
│ +        ["git", "cat-file", "blob", "HEAD:" + path],
│ +        capture_output=True, cwd="/home/zoltanas/workspace/suprask", check=True,
│ +    ).stdout
│ +
│ +
│ +idx = json.load(open("/home/zoltanas/workspace/suprask/content/lt/grade-01/index.json"))
│ +mods = [(st["id"], m["id"]) for st in idx["strands"] for m in st["modules"]]
│ +print("modules in index:", len(mods))
│ +bad = []
│ +for s, m in mods:
│ +    p = f"content/lt/grade-01/{s}/{m}.json"
│ +    try:
│ +        st, data = get(BASE + p)
│ +    except Exception as e:  # noqa: BLE001
│ +        bad.append((p, "ERR", str(e), 0))
│ +        continue
│ +    b = blob(p)
│ +    if st != 200 or data != b:
│ +        bad.append((p, st, len(data), len(b)))
│ +print("module mismatches:", len(bad))
│ +for row in bad[:10]:
│ +    print("  ", row)
│ +
│ +for p in [
│ +    "content/lt/grade-01/index.json",
│ +    "content/lt/grade-01/path.json",
│ +    "content/lt/grades.json",
│ +    "assets/audio/lt/manifest.json",
│ +]:
│ +    st, data = get(BASE + p)
│ +    b = blob(p)
│ +    print(f"{st} live={len(data)}B head={len(b)}B {'MATCH' if data == b else 'DIFF'}  {p}")
│ +
│ +# assets po ?v=<sha8> transformacijos
│ +import re
│ +assets = ["index.html", "404.html", "assets/css/main.css", "assets/js/app.js",
│ +          "assets/js/registry.js", "assets/js/progress.js", "assets/js/speech.js"]
│ +for p in assets:
│ +    try:
│ +        st, data = get(BASE + p)
│ +    except Exception as e:  # noqa: BLE001
│ +        print("ERR", p, e)
│ +        continue
│ +    stripped = re.sub(rb"\?v=[0-9a-f]{8}", b"", data)
│ +    b = blob(p)
│ +    print(f"{st} {'MATCH(v-nuimta)' if stripped == b else 'DIFF'} {p} live={len(data)}B head={len(b)}B")
│ profiles/deepseek41flash/cache/scratch/pub239_audio.py
│ @@ -0,0 +1,18 @@
│ +"""Garso gyvas zondas: imtis is manifest'o, HTTP 200 + ID3 + dydis."""
│ +import json
│ +import urllib.request
│ +
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +man = json.load(open("/home/zoltanas/workspace/suprask/assets/audio/lt/manifest.json"))
│ +print("manifest keys:", len(man))
│ +sample = list(man.items())[:: max(1, len(man) // 6)][:6]
│ +for key, val in sample:
│ +    for variant in ("n", "s"):
│ +        url = BASE + f"assets/audio/lt/{variant}/{val[variant]}"
│ +        try:
│ +            with urllib.request.urlopen(url, timeout=30) as r:
│ +                data = r.read()
│ +            head = data[:3]
│ +            print(f"{r.status} {len(data):>7}B ID3={'TAIP' if head == b'ID3' else 'NE'} {variant} {key[:40]}")
│ +        except Exception as e:  # noqa: BLE001
│ +            print("ERR", variant, key, e)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub239_audio.py
│ @@ -8,7 +8,7 @@
│  sample = list(man.items())[:: max(1, len(man) // 6)][:6]
│  for key, val in sample:
│      for variant in ("n", "s"):
│ -        url = BASE + f"assets/audio/lt/{variant}/{val[variant]}"
│ +        url = BASE + f"assets/audio/lt/{val[variant]}"
│          try:
│              with urllib.request.urlopen(url, timeout=30) as r:
│                  data = r.read()
│ agents/log/publikavimo-agentas-2026-11-11T2306.md
│ @@ -0,0 +1,98 @@
│ +# publikavimo-agentas — 2026-11-11T2306
│ +
│ +- paleidimas: #239 (grafikas 23:00)
│ +- šaknis: /home/zoltanas/workspace/suprask
│ +- HEAD: `f1b14162b153586521308198b5374e1ca97c1100` = `origin/main` (0 neišstumtų commit'ų)
│ +- darbinė kopija: `git status --porcelain -uall` → 0 eilučių (švari)
│ +
│ +## 1. check_published.py (repo / paskelbta / neišstumta)
│ +
│ +```
│ +$ python3 scripts/check_published.py
│ +Repozitorija: 37 moduliai
│ +Paskelbta:    37 moduliai
│ +  · grade-01: repo 37, gyvai 37
│ +✔ Repo ir gyva svetainė sutampa (ID, seka ir failų baitai).
│ +rc = 0
│ +```
│ +
│ +`--json`, grade 1: `local 37`, `published 37`, `missing_on_live []`,
│ +`hidden_locally []`, `not_in_path []`, `stale []`, `stale_unknown []`,
│ +`path_differs false`, `unpushed_commits 0`, `live_error ""`.
│ +Platformos suvestinė: `local 37` / `published 37`, `live_grades [1]`.
│ +
│ +## 2. Trys gyvi adresai (HTTP)
│ +
│ +```
│ +200  8812 B  content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json
│ +200  5044 B  content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json
│ +200  4946 B  content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json
│ +```
│ +
│ +## 3. Baitai, ne skaičiai
│ +
│ +Zondas (`scratch/pub239_compare.py`) lygino kiekvieną gyvą failą su
│ +`git cat-file blob HEAD:<kelias>`:
│ +
│ +- **37/37 modulio JSON** — baitais lygūs, sutapimų 0 skirtumų.
│ +- `content/lt/grade-01/index.json` — 200, 11 209 B, MATCH.
│ +- `content/lt/grade-01/path.json` — 200, 1 284 B, MATCH.
│ +- `content/lt/grades.json` — 200, 1 126 B, MATCH.
│ +- `assets/audio/lt/manifest.json` — 200, 60 762 B, MATCH (543 raktai).
│ +- Assets po `?v=<sha8>` nuėmimo: `index.html` (3 487 / 3 465 B), `404.html`
│ +  (563 / 563), `main.css` (30 802 / 30 802), `app.js` (30 746 / 30 713),
│ +  `registry.js` (3 731 / 3 621), `progress.js` (2 779 / 2 779), `speech.js`
│ +  (7 565 / 7 565) — **7/7 MATCH**.
│ +
│ +Ar svetainė pastatyta iš HEAD: gyvas `index.html` neša **`?v=f1b14162`**, o
│ +`git rev-parse HEAD` pirmi 8 simboliai yra `f1b14162` → taip, iš `HEAD`.
│ +
│ +## 4. Garsas
│ +
│ +Imtis iš manifest'o (kas ~90-ą raktą, 6 raktai × n/s): **12/12 HTTP 200**,
│ +visi su `ID3` antrašte, 15 925–50 407 B.
│ +`check_audio.py` → 543 tekstų, 1 086 įrašų, visi Piper, naudojama 1 086 iš 1 086
│ +(0 trūkstamų, 0 našlaičių), rc 0.
│ +
│ +## 5. Vartai
│ +
│ +- `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų, rc 0.
│ +- `check_docs_facts.py` → 0 klaidų, 0 įspėjimų (9 kryptys, 37 moduliai), rc 0.
│ +- `check_view.py --base https://one-man-company.github.io/suprask/
│ +  --module 25-ilgis-ir-vienetas --viewports phone,small` → 2 patikros,
│ +  0 problemų, rc 0 (gyva svetainė, ne lokalus serveris).
│ +
│ +## 6. Kas pasikeitė nuo praėjusio changelog įrašo (2026-11-09 23:06, 35 moduliai)
│ +
│ +- 35 → 37: `pasaulio-pazinimas/19-dumai-ir-isejimas` (commit 87c18e2, #217) ir
│ +  `matematika/25-ilgis-ir-vienetas` (commit d781856, #218). Abu gyvai, baitais
│ +  lygūs `HEAD`, kelyje (`path.json` 37 žingsniai, `not_in_path []`).
│ +- `git diff --stat 7e8afe3..HEAD -- content assets index.html docs research` →
│ +  tuščias: nuo #237 patikros turinio ir assets nekeitė **niekas** (#238 commit
│ +  `f1b1416` liečia tik `agents/`, `dashboard/`, `scripts/` — 6 failai).
│ +  Todėl #237 skaičiai (37/37) galioja ir šiandien, o pasikeitė tik tai, iš kurio
│ +  commit'o statyta svetainė: `7e8afe3` → `f1b1416` (abu su tuo pačiu turiniu).
│ +
│ +## 7. Sprendimas
│ +
│ +**sutampa.**
│ … omitted 20 diff line(s) across 1 additional file(s)/section(s)
│ research/wiki/changelog.md
│ @@ -1,6 +1,16 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-11 (23:06) — Publikavimo patikra #239: repo 37 / paskelbta 37, svetainė pastatyta iš `f1b14162`
│ +
│ +- **`check_published.py`** → repo 37, paskelbta 37, `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0, `path_differs` false, `unpushed_commits` 0, `live_error` tuščias, `rc=0`. `HEAD` = `origin/main` = `f1b14162b153586521308198b5374e1ca97c1100`; `git status --porcelain -uall` tuščias.
│ +- **Baitai, ne skaičiai:** 37/37 modulio JSON baitais lygūs `git cat-file blob HEAD:`; `grade-01/index.json` (11 209 B), `path.json` (1 284 B), `grades.json` (1 126 B), `audio/lt/manifest.json` (60 762 B, 543 raktai) — lygūs. 7 assets (`index.html`, `404.html`, `main.css`, `app.js`, `registry.js`, `progress.js`, `speech.js`) lygūs po to, kai iš gyvo failo nuimama `?v=<sha8>` žyma (LL-76).
│ +- **Pastatyta iš `HEAD`:** gyvas `index.html` neša `?v=f1b14162` = pirmi 8 `HEAD` simboliai. 3 gyvi moduliai: `matematika/25-ilgis-ir-vienetas.json` `200` (8812 B), `lietuviu-kalba/01-garsas-ir-raide.json` `200` (5044 B), `pasaulio-pazinimas/16-vandens-busenos.json` `200` (4946 B).
│ +- **Garsas:** imtis 6 raktai × n/s = 12/12 `200`, `ID3`, 15 925–50 407 B; `check_audio.py` → 543 tekstų, 1086 įrašų, 1086/1086 mp3, 0 našlaičių.
│ +- **Vartai:** `validate_content.py --grade 1 --strict` → 0/0; `check_docs_facts.py` → 0/0 (9 kryptys, 37 moduliai); `check_view.py --base <gyva> --module 25-ilgis-ir-vienetas --viewports phone,small` → 2 patikros, 0 problemų.
│ +- **Nuo #237:** `git diff --stat 7e8afe3..HEAD` turinio ir assets nelietė (#238 liečia tik `agents/`, `dashboard/`, `scripts/`), todėl skaičiai nepakito — pasikeitė tik statybos commit'as `7e8afe3` → `f1b1416`. #237 changelog įrašas nebuvo įrašytas; šis įrašas jį uždengia tais pačiais skaičiais.
│ +- **Sprendimas:** sutampa. Nieko nešalinta, ID nepernumeruoti, `path.json` nekeistas; ataskaita `agents/log/publikavimo-agentas-2026-11-11T2306.md`.
│
│  ## 2026-11-09 (23:06) — Publikavimo patikra #212: repo 35 / paskelbta 35, svetainė pastatyta iš `b4a6fac3`
│
│ agents/state.json
│ @@ -236,44 +236,32 @@
│      "log": "agents/log/tikrintojas-2026-11-09.md"
│    },
│    "last_publish_check": {
│ -    "date": "2026-11-09T16:40:00",
│ -    "run_id": 209,
│ -    "role": "leidejas",
│ -    "head_sha": "97ed524d666e87b72bdc207e6193ca20d91914a4",
│ -    "main_sha": "97ed524d666e87b72bdc207e6193ca20d91914a4",
│ +    "date": "2026-11-11T23:06:00",
│ +    "run_id": 239,
│ +    "role": "publikavimo-agentas",
│ +    "head_sha": "f1b14162b153586521308198b5374e1ca97c1100",
│ +    "main_sha": "f1b14162b153586521308198b5374e1ca97c1100",
│      "unpublished_commits": 0,
│ -    "unmerged_remote_branches": 0,
│ -    "worktree": "clean (git status --porcelain -uall tuščias)",
│ -    "pages_runs": [
│ -      "97ed524d: completed/success, 2026-11-09T14:09:13Z, 1m40s",
│ -      "11bcdca6: completed/success, 2026-11-09T14:02:32Z, 1m25s",
│ -      "b63b9720: completed/success, 2026-11-09T13:28:12Z, 47s",
│ -      "f48f4b23: completed/success, 2026-11-09T13:13:58Z",
│ -      "449511d3: completed/success, 2026-11-09T13:07:19Z"
│ -    ],
│ -    "live": {
│ -      "root": 200,
│ -      "grade01_index": 200,
│ -      "path_json": 200,
│ -      "grades_json": 200,
│ -      "audio_manifest": 200,
│ -      "module_files": "35/35 HTTP 200"
│ -    },
│ -    "live_bytes": "35/35 modulio JSON + index.json (10662 B) + path.json (1228 B) + grades.json (1126 B) baitais lygūs git cat-file blob HEAD:",
│ -    "built_from": "gyvas index.html neša ?v=97ed524d = HEAD pirmi 8 simboliai",
│ -    "modules_live": 35,
│ -    "modules_local": 35,
│ +    "worktree": "clean (git status --porcelain -uall → 0 eilučių)",
│ +    "built_from": "gyvas index.html neša ?v=f1b14162 = HEAD pirmi 8 simboliai",
│ +    "modules_live": 37,
│ +    "modules_local": 37,
│      "strands_local": 9,
│ -    "ids": "missing_on_live 0, extra_on_live 0, duplicate 0; 35 unikalūs ID; grades.json 35/live",
│ -    "live_browser_probe": "check_view.py --base <gyva> --viewports phone,small -> 70 patikrų (35 maršrutai x 390/360 px), 0 problemų, rc 0, 1m11s",
│ -    "audio_sample": "seed 209, 8 raktai x n/s = 16/16 mp3 HTTP 200, 17179-89486 B",
│ -    "internal_paths_not_published": "deploy/systemd/suprask-dashboard.service 404, deploy/gen_timers.py 404, agents/AGENTS.md 404",
│ -    "validated": "validate_content.py --grade 1 --strict 0/0; check_docs_facts.py 0/0 (9 kryptys, 35 moduliai)",
│ -    "since_previous_check": "31 -> 35 moduliai, 7 -> 9 kryptys: daile/01-spalva-ir-nuotaika, dorinis-ugdymas/01-susitarimas-ir-zaidimas, muzika/02-ritmas-ir-perkusija, pasaulio-pazinimas/18-kuprine-ir-kuno-dalys",
│ -    "decision": "palaikyta (nieko neatsukta)",
│ -    "changelog": "research/wiki/changelog.md - įrašas 2026-11-09 (16:40)",
│ -    "log": "agents/log/leidejas-2026-11-09T1635.md",
│ -    "notes": "Commit'ų žinutės vis dar imamos iš modelio teksto (#5190 atviras) — autorystė nustatyta pagal git show --stat. agents/state.json yra .gitignore, ataskaita tracked."
│ +    "ids": "missing_on_live 0, hidden_locally 0, not_in_path 0, stale 0, stale_unknown 0, path_differs false",
│ +    "http_codes": {
│ +      "matematika/25-ilgis-ir-vienetas.json": "200 (8812 B)",
│ +      "lietuviu-kalba/01-garsas-ir-raide.json": "200 (5044 B)",
│ +      "pasaulio-pazinimas/16-vandens-busenos.json": "200 (4946 B)"
│ +    },
│ +    "live_bytes": "37/37 modulio JSON = git cat-file blob HEAD:; index.json 11209 B, path.json 1284 B, grades.json 1126 B, manifest.json 60762 B (543 raktai) — MATCH; 7 assets MATCH po ?v=<sha8> nuėmimo",
│ +    "live_browser_probe": "check_view.py --base <gyva> --module 25-ilgis-ir-vienetas --viewports phone,small → 2 patikros, 0 problemų, rc 0",
│ +    "audio_sample": "6 raktai × n/s = 12/12 HTTP 200, ID3, 15925–50407 B; check_audio.py 543 tekstų / 1086 įrašų / 1086 mp3, 0 našlaičių",
│ +    "validated": "validate_content.py --grade 1 --strict 0/0; check_docs_facts.py 0/0 (9 kryptys, 37 moduliai)",
│ +    "since_previous_check": "turinys ir assets nepakito nuo #237 (git diff --stat 7e8afe3..HEAD tuščias; #238 liečia tik agents/, dashboard/, scripts/); pasikeitė tik statybos commit'as 7e8afe3 → f1b1416",
│ +    "decision": "sutampa",
│ +    "changelog": "research/wiki/changelog.md — įrašas 2026-11-11 (23:06)",
│ +    "log": "agents/log/publikavimo-agentas-2026-11-11T2306.md",
│ +    "notes": "#237 log'as repo yra (commit 8eeee20), bet jos changelog įrašas nepateko — uždengta šiuo įrašu tais pačiais skaičiais. check_published.py vis dar nelygina index/path/grades/manifest baitų (#8716 tąsa) — tikrinta atskiru zond'u."
│    },
│    "last_language_work": {
│      "date": "2026-11-08",
│ profiles/deepseek41flash/cache/scratch/pub239_state.py
│ @@ -0,0 +1,7 @@
│ +import json
│ +
│ +d = json.load(open("/home/zoltanas/workspace/suprask/agents/state.json"))
│ +pc = d["last_publish_check"]
│ +for k in ("run_id", "role", "modules_local", "modules_live", "decision", "log", "changelog"):
│ +    print(k, "=", pc.get(k))
│ +print("roles:", len(d["roles"]))
Publikavimo patikra #239 baigta. Sprendimas: sutampa.

check_published.py
```
Repozitorija: 37 moduliai
Paskelbta:    37 moduliai
  · grade-01: repo 37, gyvai 37
✔ Repo ir gyva svetainė sutampa (ID, seka ir failų baitai).   rc=0
```
--json: local 37, published 37, missing_on_live [], hidden_locally [], not_in_path [],
stale [], path_differs false, unpushed_commits 0, live_error "".

3 gyvi adresai (HTTP)
  200  8812 B  content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json
  200  5044 B  content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json
  200  4946 B  content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json

Baitai, ne skaičiai
  37/37 modulio JSON = git cat-file blob HEAD: (0 skirtumų).
  index.json 11209 B, path.json 1284 B, grades.json 1126 B, manifest.json 60762 B
  (543 raktai) — MATCH. 7 assets (index.html, 404.html, main.css, app.js, registry.js,
  progress.js, speech.js) MATCH po ?v=<sha8> nuėmimo.
  Gyvas index.html neša ?v=f1b14162 = HEAD pirmi 8 simboliai → svetainė pastatyta iš HEAD.

Garsas
  Imtis 6 raktai × n/s = 12/12 HTTP 200, ID3, 15 925–50 407 B.
  check_audio.py → 543 tekstų, 1086 įrašų, 1086/1086 mp3, 0 našlaičių.

Vartai
  validate_content.py --grade 1 --strict → 0 klaidų, 0 įspėjimų
  check_docs_facts.py → 0/0 (9 kryptys, 37 moduliai)
  check_view.py --base <gyva> --module 25-ilgis-ir-vienetas --viewports phone,small → 2 patikros, 0 problemų

KAS PASIKEITĖ NUO #237
  git diff --stat 7e8afe3..HEAD -- content assets index.html docs research → tuščias.
  #238 (f1b1416) liečia tik agents/, dashboard/, scripts/. Skaičiai nepakito; pasikeitė
  tik statybos commit'as 7e8afe3 → f1b1416.

ĮRAŠYTA
  agents/log/publikavimo-agentas-2026-11-11T2306.md (naujas)
  research/wiki/changelog.md — įrašas 2026-11-11 (23:06) viršuje
  agents/state.json → last_publish_check: run_id 239, modules 37/37, decision "sutampa"

PASTABOS
  #237 log'as repo yra (commit 8eeee20), bet jos changelog įrašas taip ir nepateko — šis
  įrašas jį uždengia tais pačiais skaičiais. check_published.py vis dar nelygina
  index/path/grades/manifest baitų (atviras #8716) — tikrinau atskiru zond'u.
  Nieko nešalinta, ID nepernumeruoti, path.json nekeistas. Naujos pamokos (LL-81) nemačiau:
  joks defektas nepasikartojo.

## klaidos

```
session_id: local-7d38ee6568b95409a8e1dc457cbf6c5504bf681fc06c0165230b88c77ed51db7
```
