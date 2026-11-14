# publikavimo-agentas — 2026-11-14T1930

- paleidimas: #290 (manual)
- trukmė: 280s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/probe290_index_vs_module.py
│ @@ -0,0 +1,35 @@
│ +"""290 zondas: ar index.json kortelės laukai sutampa su modulio JSON laukais.
│ +
│ +Klasės puslapis (`app.js`) kortelei ima `title`, `subtitle`, `minutes`, `sim`
│ +iš `index.json`, o modulio puslapis — iš paties modulio JSON. `validate_content.py`
│ +lygina tik `id` ir `strand`, todėl šis skirtumas vartams nematomas.
│ +"""
│ +import json
│ +import pathlib
│ +
│ +ROOT = pathlib.Path(__file__).resolve().parents[2] / "suprask"
│ +CONTENT = ROOT / "content" / "lt"
│ +KEYS = ("title", "subtitle", "minutes", "sim")
│ +
│ +diff = []
│ +total = 0
│ +for idx_path in sorted(CONTENT.glob("grade-*/index.json")):
│ +    index = json.loads(idx_path.read_text(encoding="utf-8"))
│ +    for strand in index.get("strands", []):
│ +        for entry in strand.get("modules", []):
│ +            total += 1
│ +            mod = json.loads((CONTENT / entry["file"]).read_text(encoding="utf-8"))
│ +            for key in KEYS:
│ +                left = entry.get(key)
│ +                if key == "sim":
│ +                    left = left if isinstance(left, str) else (left or {}).get("component")
│ +                    right = (mod.get("sim") or {}).get("component")
│ +                else:
│ +                    right = mod.get(key)
│ +                if left != right:
│ +                    diff.append((entry["id"], key, left, right))
│ +
│ +print(f"moduliai: {total}")
│ +print(f"nesutapimai: {len(diff)}")
│ +for row in diff:
│ +    print("  ", row)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe290_index_vs_module.py
│ @@ -7,7 +7,7 @@
│  import json
│  import pathlib
│
│ -ROOT = pathlib.Path(__file__).resolve().parents[2] / "suprask"
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│  CONTENT = ROOT / "content" / "lt"
│  KEYS = ("title", "subtitle", "minutes", "sim")
│
│ profiles/deepseek41flash/cache/scratch/probe290_shell.py
│ @@ -0,0 +1,42 @@
│ +"""290 zondas: gyvo svetainės kodo baitai prieš repo baitus (po `?v=` nuėmimo).
│ +
│ +check_published.py tai daro, bet šis zondas spausdina kiekvieną failą atskirai,
│ +kad ataskaitoje būtų ne vien `shell_count 17`.
│ +"""
│ +import hashlib
│ +import re
│ +import subprocess
│ +import urllib.request
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +LIVE = "https://one-man-company.github.io/suprask/"
│ +VERSION = re.compile(r"\?v=[0-9a-f]{6,40}")
│ +FILES = [
│ +    "index.html",
│ +    "assets/js/app.js",
│ +    "assets/js/registry.js",
│ +    "assets/js/progress.js",
│ +    "assets/js/speech.js",
│ +    "assets/css/main.css",
│ +    "assets/js/sims/art.js",
│ +    "assets/js/sims/daile.js",
│ +    "assets/js/sims/pasaulis.js",
│ +]
│ +
│ +for rel in FILES:
│ +    live = urllib.request.urlopen(LIVE + rel, timeout=30).read()
│ +    repo = subprocess.run(["git", "-C", ROOT, "cat-file", "blob", "HEAD:" + rel],
│ +                          capture_output=True, check=True).stdout
│ +    stripped = VERSION.sub("", live.decode("utf-8", "replace"))
│ +    same = hashlib.sha256(stripped.encode()).hexdigest() == hashlib.sha256(repo).hexdigest()
│ +    print(f"{rel:32} live {len(live):7} B  repo {len(repo):7} B  "
│ +          f"{'SUTAMPA' if same else 'SKIRIASI'}  "
│ +          f"zymu={len(VERSION.findall(live.decode('utf-8', 'replace')))}")
│ +
│ +app = urllib.request.urlopen(LIVE + "assets/js/app.js", timeout=30).read().decode()
│ +css = urllib.request.urlopen(LIVE + "assets/css/main.css", timeout=30).read().decode()
│ +print()
│ +print('gyvas app.js turi aria-current="step":', 'aria-current="step"' in app)
│ +print("gyvas main.css turi .mod-row.is-current:", ".mod-row.is-current" in css)
│ +ver = VERSION.findall(urllib.request.urlopen(LIVE + "index.html", timeout=30).read().decode())
│ +print("gyvas index.html versija:", ver[:1])
│ agents/proposals/2026-11-14-publikavimo-agentas-index-ir-modulis.json
│ @@ -0,0 +1,19 @@
│ +{
│ +  "role": "publikavimo-agentas",
│ +  "run_id": 290,
│ +  "created": "2026-11-14T19:35:00+02:00",
│ +  "type": "struktura",
│ +  "title": "Kortelė ir modulio puslapis gali skelbti skirtingą pavadinimą: index.json laukai nelyginami su moduliu",
│ +  "body": "Klasės puslapio kortelė `title`, `subtitle` ir `minutes` ima iš `index.json`, o modulio puslapis tuos pačius tris laukus ima iš paties modulio JSON. Tai dvi to paties teiginio kopijos, kurių niekas nesulygina: `validate_content.py:262–265` tikrina tik `id` ir `strand`, o baitų palyginimas (`check_published.py`) lygina failus su gyva svetaine, ne failus tarpusavyje. Šiandien skirtumo nėra — išmatavau visus 39 modulius, 0 nesutapimų, todėl tai latentinis, o ne matomas defektas. Bet jei kas nors pataisys modulio trukmę ar pavadinimą tik modulio faile, vaikas sąraše matys „9 min.“, o atidaręs modulį — „10 min.“, ir nė vieni vartai to nepasakys. Tai ta pati klasė kaip LL-21 (skaičius, kurio niekas neperskaičiuoja), tik ne dokumente, o dviejuose turinio failuose. Siūloma `validate_content.py` lyginti `title`, `subtitle`, `minutes` ir `sim` (indekso eilutėje `sim` yra tekstas, modulyje — `sim.component`) ir nesutapimą laikyti klaida, o ne įspėjimu, nes tai ne stilius, o du skirtingi teiginiai tam pačiam vaikui.",
│ +  "target": "scripts/validate_content.py",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "assets/js/app.js:281–282 — klasės sąrašo kortelė rašo m.title, m.subtitle ir m.minutes iš index.json įrašo",
│ +    "assets/js/app.js:314–317 — tos pačios kortelės antra forma (mod-row) rašo tuos pačius m.title / m.minutes / m.subtitle",
│ +    "assets/js/app.js:377–379 — modulio puslapio antraštė rašo mod.title, mod.subtitle ir mod.minutes iš modulio JSON",
│ +    "scripts/validate_content.py:262–265 — lyginama tik data.id su indekso id ir data.strand su krypties id; title / subtitle / minutes / sim nelyginami",
│ +    "zondas 2026-11-14 (paleidimas #290): 39 moduliai, 4 laukai × 39 = 156 palyginimai, nesutapimų 0 — defektas latentinis, ne šiandien matomas",
│ +    "docs/KURINIO-STANDARTAS.md:20–38 — title, subtitle, minutes ir sim yra privalomi modulio laukai, o 7 skyriaus pavyzdyje jie kartojami index.json įraše be jokio ryšio reikalavimo"
│ +  ]
│ +}
│ research/wiki/changelog.md
│ @@ -1,6 +1,18 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-14 (19:32) — Publikavimo patikra #290: repo 39 / paskelbta 39, gyvas kodas = `HEAD`, #286 sąsajos pataisa gyvai
│ +
│ +- **Būsena:** `HEAD` = `origin/main` = `0fa0df8`, `git rev-list --left-right --count origin/main...HEAD` → `0 0`, darbinė kopija prieš darbą švari (`git status --porcelain -uall` → 0 eilučių). Gyvas `index.html` neša `?v=0fa0df8e`; `live_version` = `repo_version` = `0fa0df8e`, `unpushed_commits` 0.
│ +- **`check_published.py`:** repo 39 / paskelbta 39 (`grade-01: repo 39, gyvai 39`); `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0, `aux_stale` 0, `shell_stale` 0, `shell_unreachable` 0, `path_differs` `[]`, `shell_count` 17, `history_checked` true, `verdict.label` = `sutampa`, `rc=0`.
│ +- **3 gyvi adresai (sha256, ne tik kodas):** `matematika/25-ilgis-ir-vienetas.json` → `200`, 8 812 B; `lietuviu-kalba/03-sakinio-zodziai.json` → `200`, 5 459 B; `pasaulio-pazinimas/16-vandens-busenos.json` → `200`, 4 932 B — visų trijų gyvas `sha256` lygus `git cat-file blob HEAD:` baitams.
│ +- **Kas pasikeitė nuo #285 įrašo ir ar pasiekė vaiką:** `d38e8496..0fa0df8` turinio ir `assets/` kataloge pasikeitė tik `assets/js/app.js` (+30/−5) ir `assets/css/main.css` (+12) — #286 „pirma neužbaigta eilutė“; modulio JSON, `index.json`, `path.json`, `grades.json` ir garsas nepakito. Zondas baitais po `?v=` nuėmimo: `index.html`, `app.js`, `registry.js`, `progress.js`, `speech.js`, `main.css`, `art.js`, `daile.js`, `pasaulis.js` — 9/9 sutampa su `HEAD`; gyvas `app.js` turi `aria-current="step"`, gyvas `main.css` — `.mod-row.is-current`.
│ +- **Priimtas pervadinimas:** `vanished_ids` 1 — `03-sakinio-tvarka` (paskutinį kartą `a2ad497`) su įpėdiniu `03-sakinio-zodziai`, `resolved: true` (`scripts/known_renames.json`, paleidimas #261). Gyvas senas adresas → `404`: sąmoningas pervadinimas, ne regresas. Pasekmė, kuri lieka: žyma vaiko naršyklėje už seno ID tampa našlaite (alias pasiūlymas jau eilėje — `agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json`).
│ +- **Vartai:** `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų, `rc=0`; `check_docs_facts.py` → 0/0 (9 kryptys, 39 moduliai, 39 simuliacijos, 169 užduotys, 569 garso tekstai, 1 138 įrašai, 15 agentų); `check_audio.py` → 569 tekstų (5 tiesioginės `api.speak` eilutės), 1 138 įrašų, naudojama 1 138 iš 1 138 mp3.
│ +- **Naujas radinys (latentinis, ne matomas):** klasės kortelė `title` / `subtitle` / `minutes` ima iš `index.json` (`app.js:281–282`, `:314–317`), o modulio puslapis tuos pačius laukus — iš modulio JSON (`app.js:377–379`); `validate_content.py:262–265` lygina tik `id` ir `strand`. Išmatavau 39 modulius × 4 laukus = 156 palyginimų, nesutapimų 0 — šiandien vaikui nieko nesimato, tad nieko ir netaisiau. Pasiūlymas `agents/proposals/2026-11-14-publikavimo-agentas-index-ir-modulis.json`.
│ +- **Ankstesnių paleidimų skola:** #288 (`agents/log/publikavimo-agentas-2026-11-14T1603.md`) išmatavo 39/39 ir visą garsą (1 138 × `200`), bet baigėsi `exit 1 → partial` ir changelog eilutės neįrašė. Šis įrašas rodo šiandienos būseną, o ne kartoja #288 skaičių.
│ +- **Sprendimas:** **sutampa**. Niekas nešalinta, ID nepernumeruoti, `content/**`, `assets/**`, `scripts/**`, `docs/**` neliesti. Ataskaita `agents/log/publikavimo-agentas-2026-11-14T1932.md`.
│
│  ## 2026-11-14 (11:48) — Publikavimo patikra #285: repo 39 / paskelbta 39, #284 pataisa gyvai, garsas 1 138/1 138
│
│ agents/log/publikavimo-agentas-2026-11-14T1932.md
│ @@ -0,0 +1,84 @@
│ +# publikavimo-agentas — 2026-11-14T1932
│ +
│ +- paleidimas: #290
│ +- vaidmuo: publikavimo-agentas
│ +- tikslas: patikrinti, ar repo ir gyva svetainė sutampa, ir užrašyti trūkstamus įrašus (changelog, log, state)
│ +
│ +## 1. `check_published.py` (repo / paskelbta / neišstumta)
│ +
│ +```
│ +Repozitorija: 39 moduliai
│ +Paskelbta:    39 moduliai
│ +  · grade-01: repo 39, gyvai 39
│ +Pervadinti ID, priimta ir užregistruota (1):
│ +  - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai (registruota; žyma už seno ID vaiko naršyklėje LIEKA — alias mechanizmo nėra, žr. agents/proposals/)
│ +✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, svetainės kodas 17 failų, versija 0fa0df8e).
│ +```
│ +
│ +`rc = 0`. `--json`: `missing_on_live []`, `hidden_locally []`, `not_in_path []`, `stale []`, `stale_unknown []`, `aux_stale []`, `shell_stale []`, `shell_unreachable []`, `path_differs []`, `shell_count 17`, `history_checked true`, `live_version = repo_version = 0fa0df8e`, `unpushed_commits 0`, `verdict.label = "sutampa"`, `vanished_ids` 1 įrašas (`03-sakinio-tvarka` → `03-sakinio-zodziai`, `last_rev a2ad497`, `resolved true`).
│ +
│ +Git: `HEAD` = `origin/main` = `0fa0df8` (`git rev-list --left-right --count origin/main...HEAD` → `0 0`), darbinė kopija prieš darbą švari (0 eilučių).
│ +
│ +## 2. Trys gyvi adresai (HTTP + baitai)
│ +
│ +| adresas | kodas | baitai | gyvas sha256 vs `git cat-file blob HEAD:` |
│ +|---|---|---|---|
│ +| `content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json` | 200 | 8 812 B | sutampa (`34bfc3a0…`) |
│ +| `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` | 200 | 5 459 B | sutampa (`f267ae9d…`) |
│ +| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | 200 | 4 932 B | sutampa (`462f9ed4…`) |
│ +
│ +Papildomai — gyvas svetainės kodas baitais (9 failai, po `?v=` nuėmimo):
│ +
│ +```
│ +index.html           3487 B / 3465 B  SUTAMPA  (2 žymos)
│ +assets/js/app.js    31813 B / 31780 B SUTAMPA  (3 žymos)
│ +assets/js/registry.js 3731 B / 3621 B SUTAMPA (10 žymų)
│ +assets/js/progress.js 2779 B / 2779 B SUTAMPA
│ +assets/js/speech.js   7565 B / 7565 B SUTAMPA
│ +assets/css/main.css  31687 B / 31687 B SUTAMPA
│ +assets/js/sims/art.js 37587 B / 37587 B SUTAMPA
│ +assets/js/sims/daile.js 9554 B / 9543 B SUTAMPA (1 žyma)
│ +assets/js/sims/pasaulis.js 126779 B / 126768 B SUTAMPA (1 žyma)
│ +gyvas app.js turi aria-current="step": True
│ +gyvas main.css turi .mod-row.is-current: True
│ +gyvas index.html versija: ?v=0fa0df8e
│ +```
│ +
│ +## 3. Ką reiškia tie skaičiai (ne tik „39 = 39“)
│ +
│ +Nuo #285 changelog įrašo (`d38e8496`) iki `HEAD` (`0fa0df8`) turinio ir `assets/` kataloge pasikeitė **tik** du failai: `assets/js/app.js` (+30/−5) ir `assets/css/main.css` (+12) — tai #286 (dizaineris) „pirma neužbaigta eilutė“. Nė vienas modulio JSON, `index.json`, `path.json`, `grades.json` ar garso failas nepasikeitė, todėl vaiko pažangos raktai (`localStorage`) ir modulio ID nejudėjo. Abiejų pakeitimų gyvumas patvirtintas baitais ir turiniu (`aria-current="step"`, `.mod-row.is-current`), ne vien versijos žyma.
│ +
│ +## 4. Vartai
│ +
│ +- `validate_content.py --grade 1 --strict` → **0 klaidų, 0 įspėjimų**, `rc 0`.
│ +- `check_docs_facts.py` → **0 klaidų, 0 įspėjimų** (9 kryptys, 39 moduliai, 39 simuliacijos, 169 užduotys, 569 garso tekstai, 1 138 įrašai, 15 agentų).
│ +- `check_audio.py` → ✔ 569 tekstų (5 tiesioginės `api.speak` eilutės), 1 138 įrašų, naudojama **1 138 iš 1 138 mp3**.
│ +
│ +## 5. Naujas radinys — latentinis, ne matomas
│ +
│ +Klasės puslapio kortelė `title`, `subtitle`, `minutes` ima iš `index.json` (`assets/js/app.js:281–282`, `:314–317`), o modulio puslapio antraštė tuos pačius laukus ima iš modulio JSON (`:377–379`). `scripts/validate_content.py:262–265` lygina tik `id` ir `strand`, tad šios dvi to paties fakto kopijos niekada nesulyginamos; `check_published.py` lygina failus su gyva svetaine, ne failus tarpusavyje.
│ +
│ +Išmatavau zendu (39 moduliai × 4 laukai = 156 palyginimai): **nesutapimų 0**. Tai reiškia, kad šiandien vaikui nieko nesimato — todėl nieko ir netaisiau. Užregistruota pasiūlymu `agents/proposals/2026-11-14-publikavimo-agentas-index-ir-modulis.json` (normal), o ne tyliu pataisymu, kurio niekas neperžiūrėtų.
│ +
│ +## 6. Ką parašiau šiame paleidime
│ +
│ +1. `research/wiki/changelog.md` — naujas įrašas 2026-11-14 (19:32), viršuje. Tai uždaro ir #288 skolą: #288 išmatavo 39/39 bei visą garsą, bet baigėsi `exit 1 → partial` ir changelog eilutės neįrašė.
│ +2. `agents/log/publikavimo-agentas-2026-11-14T1932.md` — ši ataskaita.
│ +3. `agents/state.json` — `roles.publikavimo-agentas` (`last_run`, `status`, `log`) ir `last_publish_check`.
│ +4. `agents/proposals/2026-11-14-publikavimo-agentas-index-ir-modulis.json` — vienas pasiūlymas (riba: ne daugiau kaip 3).
│ +
│ +Neliesta: `content/**`, `assets/**`, `scripts/**`, `docs/**`, `AGENTS.md`, `path.json`, `index.json`, `grades.json`, garsas. Joks ID nepernumeruotas, niekas nešalinta.
│ +
│ +## 7. Kas liko atvira (ne šio vaidmens)
│ +
│ +- **Alias pažangai** (`progress.js` nežino, kad `03-sakinio-tvarka` virto `03-sakinio-zodziai`) — pasiūlymas jau eilėje nuo #273: `agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json` (high). Tai vienintelė šiandien matoma publikavimo pasekmė vaikui: kas tą modulį buvo atlikęs, dabar mato jį kaip neatliktą.
│ +- **`add_optional_tasks.py`** turi raktą į nebeegzistuojantį ID `03-sakinio-tvarka` (13 raktų 39 moduliams) — latentinis, `agents/proposals/2026-11-13-publikavimo-agentas-add-optional-rakto-likutis.json`.
│ +- **`pages.yml` viengubų kabučių `sed` spraga** — latentinė (`agents/proposals/2026-11-14-publikavimo-agentas-pages-versija-importams.json`).
│ +
│ +## 8. Nauja pamoka
│ … omitted 6 diff line(s) across 1 additional file(s)/section(s)
│ agents/state.json
│ @@ -71,9 +71,9 @@
│        "cadence": "pirmadieniais, ketvirtadieniais"
│      },
│      "publikavimo-agentas": {
│ -      "last_run": "2026-11-14T16:10:42",
│ +      "last_run": "2026-11-14T19:36:00",
│        "status": "published",
│ -      "log": "agents/log/publikavimo-agentas-2026-11-14T1603.md",
│ +      "log": "agents/log/publikavimo-agentas-2026-11-14T1932.md",
│        "description": "Užtikrina, kad sukurtas turinys būtų paskelbtas ir neprarastų ankstesnių modulių",
│        "cadence": "kasdien 5 kartus (06:20, 11:40, 16:00, 19:30, 23:00)"
│      },
│ agents/state.json
│ @@ -320,6 +320,37 @@
│      "notes": "#237 log'as repo yra (commit 8eeee20), bet jos changelog įrašas nepateko — uždengta šiuo įrašu tais pačiais skaičiais. check_published.py vis dar nelygina index/path/grades/manifest baitų (#8716 tąsa) — tikrinta atskiru zond'u."
│    },
│    "last_publish_check": {
│ +    "date": "2026-11-14T19:32:00",
│ +    "run_id": 290,
│ +    "role": "publikavimo-agentas",
│ +    "head_sha": "0fa0df8",
│ +    "main_sha": "0fa0df8",
│ +    "unpublished_commits": 0,
│ +    "worktree": "švarus prieš darbą (git status --porcelain -uall → 0); po darbo — research/wiki/changelog.md, agents/log/publikavimo-agentas-2026-11-14T1932.md, agents/proposals/2026-11-14-publikavimo-agentas-index-ir-modulis.json",
│ +    "modules_live": 39,
│ +    "modules_local": 39,
│ +    "strands_local": 9,
│ +    "ids": "missing_on_live 0, hidden_locally 0, not_in_path 0, stale 0, stale_unknown 0, aux_stale 0, shell_stale [], shell_unreachable [], path_differs [], vanished_ids 1 (03-sakinio-tvarka → 03-sakinio-zodziai, last_rev a2ad497, resolved true), shell_count 17, history_checked true — rc 0",
│ +    "live_version": "0fa0df8e",
│ +    "repo_version": "0fa0df8e",
│ +    "http_codes": {
│ +      "matematika/25-ilgis-ir-vienetas.json": "200, 8812 B, sha256 34bfc3a0… = repo baitai",
│ +      "lietuviu-kalba/03-sakinio-zodziai.json": "200, 5459 B, sha256 f267ae9d… = repo baitai",
│ +      "pasaulio-pazinimas/16-vandens-busenos.json": "200, 4932 B, sha256 462f9ed4… = repo baitai"
│ +    },
│ +    "shell_probe": "9 failai baitais po ?v= nuėmimo: index.html, app.js, registry.js, progress.js, speech.js, main.css, art.js, daile.js, pasaulis.js — 9/9 SUTAMPA; gyvas app.js turi aria-current=\"step\", gyvas main.css turi .mod-row.is-current; gyvas index.html ?v=0fa0df8e",
│ +    "since_previous_entry": "d38e8496..0fa0df8 turinio/assets kataloge pasikeitė tik assets/js/app.js (+30/−5) ir assets/css/main.css (+12) — #286 dizaineris; modulio JSON, index.json, path.json, grades.json, garsas nepakito (ID ir pažangos raktai nejudėjo)",
│ +    "validated": "validate_content.py --grade 1 --strict 0 klaidų, 0 įspėjimų rc 0; check_docs_facts.py 0/0 (9 kryptys, 39 moduliai, 39 sim, 169 užduotys, 569 garso tekstai, 1138 įrašai, 15 agentų); check_audio.py ✔ 569 tekstų / 1138 įrašų / 1138 iš 1138 mp3",
│ +    "new_finding": "index.json kortelės title/subtitle/minutes (app.js:281–282, 314–317) ir modulio JSON tie patys laukai (app.js:377–379) niekada nesulyginami (validate_content.py:262–265 lygina tik id ir strand). Zondas: 39 moduliai × 4 laukai = 156 palyginimai, nesutapimų 0 — latentinis, nieko netaisyta.",
│ +    "proposal_out": "agents/proposals/2026-11-14-publikavimo-agentas-index-ir-modulis.json (struktura, normal)",
│ +    "decision": "sutampa",
│ +    "changelog": "research/wiki/changelog.md — 2026-11-14 (19:32)",
│ +    "log": "agents/log/publikavimo-agentas-2026-11-14T1932.md",
│ +    "debt_closed": "#288 (2026-11-14T1603, exit 1 → partial) išmatavo 39/39 ir visą garsą, bet changelog eilutės neįrašė — šis įrašas užima jo vietą šiandienos skaičiais",
│ +    "open_advisories": "alias pažangai (agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json, high, progress.js ne mano failas); add_optional_tasks.py raktas į 03-sakinio-tvarka; pages.yml sed be viengubų kabučių",
│ +    "notes": "Nieko nešalinta, ID nepernumeruoti, content/** assets/** scripts/** docs/** neliesti. Naujos pamokos nepridėta — vaiko matomo defekto nebuvo. agents/state.json yra .gitignore."
│ +  },
│ +  "last_publish_check_251": {
│      "date": "2026-11-12T16:10:00",
│      "run_id": 251,
│      "role": "publikavimo-agentas",
Ataskaita — publikavimo-agentas, paleidimas #290 (2026-11-14)

SPRENDIMAS: sutampa.

1. check_published.py (repo / paskelbta / neišstumta)
   Repo: 39 moduliai. Paskelbta: 39 (grade-01: repo 39, gyvai 39).
   Neišstumtų commit'ų: 0 (HEAD = origin/main = 0fa0df8; rev-list --left-right --count → 0 0).
   missing_on_live 0, hidden_locally 0, not_in_path 0, stale 0, aux_stale 0,
   shell_stale 0, shell_unreachable 0, path_differs [], shell_count 17,
   history_checked true, live_version = repo_version = 0fa0df8e, rc 0.
   vanished_ids: 1 — 03-sakinio-tvarka → 03-sakinio-zodziai (resolved true, known_renames.json).

2. Trys gyvi adresai (HTTP + baitai)
   matematika/25-ilgis-ir-vienetas.json → 200, 8 812 B, sha256 = git blob
   lietuviu-kalba/03-sakinio-zodziai.json → 200, 5 459 B, sha256 = git blob
   pasaulio-pazinimas/16-vandens-busenos.json → 200, 4 932 B, sha256 = git blob
   Papildomai: 9 svetainės kodo failai (index.html, app.js, registry.js, progress.js,
   speech.js, main.css, art.js, daile.js, pasaulis.js) — 9/9 baitais sutampa po ?v= nuėmimo;
   gyvas app.js turi aria-current="step", main.css — .mod-row.is-current, index.html ?v=0fa0df8e.

3. Ką tai reiškia: nuo #285 įrašo (d38e8496) turinio/assets kataloge keitėsi tik app.js (+30/−5)
   ir main.css (+12) — #286 sąsajos pataisa, ir ji gyvai. Modulio JSON, index.json, path.json,
   grades.json, garsas nepakito — vaiko pažangos raktai nejudėjo.

4. Vartai: validate_content --grade 1 --strict 0/0 rc 0; check_docs_facts 0/0 (9 kryptys,
   39 moduliai, 39 sim, 169 užduotys, 569 garso tekstai, 1 138 įrašai, 15 agentų);
   check_audio ✔ 1 138 iš 1 138 mp3.

Įrašyta:
- research/wiki/changelog.md — naujas įrašas 2026-11-14 (19:32) viršuje; juo uždaryta #288 skola
  (#288 matavo, bet baigėsi exit 1 → partial ir changelog eilutės neįrašė).
- agents/log/publikavimo-agentas-2026-11-14T1932.md — pilna ataskaita.
- agents/state.json — roles.publikavimo-agentas (last_run 19:36, log) ir last_publish_check
  (senasis perkeltas į last_publish_check_251).
- agents/proposals/2026-11-14-publikavimo-agentas-index-ir-modulis.json — vienas pasiūlymas.

Naujas radinys (latentinis, ne matomas): klasės kortelė title/subtitle/minutes ima iš index.json
(app.js:281–282, 314–317), modulio puslapis — iš modulio JSON (app.js:377–379), o
validate_content.py:262–265 lygina tik id ir strand. 39 moduliai × 4 laukai = 156 palyginimai,
nesutapimų 0 — todėl nieko netaisiau, tik užregistravau pasiūlymu.

Naujos pamokos nepridėjau: vaiko matomo defekto nebuvo, o pamokų registras yra realių klaidų, ne idėjų sąrašas.

Atvira (ne šio vaidmens): alias pažangai progress.js (pasiūlymas jau eilėje, high), add_optional_tasks.py
raktas į nebeegzistuojantį 03-sakinio-tvarka, pages.yml sed be viengubų kabučių.

content/, assets/, scripts/, docs/ neliesti; joks ID nepernumeruotas, niekas nešalinta.

## klaidos

```
session_id: local-1bddfafc319bc01d15788d2272193254e3ab7434fd0b16198bc74a099863a346
```
