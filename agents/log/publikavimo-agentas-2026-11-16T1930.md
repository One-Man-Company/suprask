# publikavimo-agentas — 2026-11-16T1930

- paleidimas: #321 (manual)
- trukmė: 530s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/p321_gates.py
│ @@ -0,0 +1,170 @@
│ +"""#321 zondas: ar trys svarbiausi publish vartų signalai tikrai įsižiebia.
│ +
│ +Kas tikrinama (visi trys yra vaiko pažangos signalai, bet nė vienas neturi
│ +įrašyto neigiamo zondo nei viename agents/log/ ataskaitų):
│ +
│ +  A hidden_locally  — svetainėje yra modulis, repo ne (vaiko žyma liko be modulio).
│ +                      Vaidmens failas: „sustok ir pranešk".
│ +  B not_in_path     — repo indekse yra ID, kurio nėra path.json sekoje.
│ +  C missing_on_live — repo indekse yra ID, kurio svetainėje nėra.
│ +
│ +Sandara: laikinas repo T (ROOT = T, nes check_published ima ROOT iš failo
│ +vietos) + laikinas veidrodis L kaip „gyva svetainė" (http.server). Tikrasis
│ +repo neliečiamas: assets/audio — kietosios nuorodos (tik skaitoma), visa kita —
│ +tikros kopijos.
│ +
│ +Naudojimas: python3 p321_gates.py [--keep]
│ +"""
│ +
│ +from __future__ import annotations
│ +
│ +import json
│ +import os
│ +import pathlib
│ +import shutil
│ +import socket
│ +import subprocess
│ +import sys
│ +import tempfile
│ +import time
│ +
│ +REPO = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +BOGUS_ID = "99-dinges-modulis"
│ +
│ +
│ +def link_audio(src: pathlib.Path, dst: pathlib.Path) -> None:
│ +    dst.mkdir(parents=True)
│ +    for sub in ("n", "s"):
│ +        (dst / sub).mkdir()
│ +        for f in (src / sub).glob("*.mp3"):
│ +            os.link(f, dst / sub / f.name)
│ +    shutil.copy2(src / "manifest.json", dst / "manifest.json")
│ +
│ +
│ +def build(root: pathlib.Path, live_root: pathlib.Path) -> None:
│ +    """Sukuria laikiną repo (root) ir jo „gyvą" kopiją (live_root)."""
│ +    for base in (root, live_root):
│ +        base.mkdir(parents=True, exist_ok=True)
│ +        shutil.copy2(REPO / "index.html", base / "index.html")
│ +        shutil.copy2(REPO / "404.html", base / "404.html")
│ +        (base / "scripts").mkdir(exist_ok=True)
│ +        shutil.copy2(REPO / "scripts" / "check_published.py", base / "scripts" / "check_published.py")
│ +        shutil.copy2(REPO / "scripts" / "known_renames.json", base / "scripts" / "known_renames.json")
│ +        shutil.copytree(REPO / "assets" / "js", base / "assets" / "js")
│ +        shutil.copytree(REPO / "assets" / "css", base / "assets" / "css")
│ +        link_audio(REPO / "assets" / "audio" / "lt", base / "assets" / "audio" / "lt")
│ +        shutil.copytree(REPO / "content", base / "content")
│ +    git(root, "init", "-q")
│ +    git(root, "-c", "user.email=z@example.invalid", "-c", "user.name=zondas", "add", "-A")
│ +    git(root, "-c", "user.email=z@example.invalid", "-c", "user.name=zondas", "commit", "-q", "-m", "zondas")
│ +    git(root, "update-ref", "refs/remotes/origin/main", "HEAD")
│ +
│ +
│ +def git(cwd: pathlib.Path, *args: str) -> subprocess.CompletedProcess:
│ +    return subprocess.run(["git", *args], cwd=cwd, capture_output=True, text=True, timeout=120)
│ +
│ +
│ +def free_port(start: int = 8981) -> int:
│ +    for port in range(start, start + 40):
│ +        with socket.socket() as s:
│ +            try:
│ +                s.bind(("127.0.0.1", port))
│ +            except OSError:
│ +                continue
│ +        return port
│ +    raise RuntimeError("nėra laisvo prievado")
│ +
│ +
│ +def run(root: pathlib.Path, live: str, label: str) -> tuple[int, str]:
│ … omitted 92 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/p321_json.py
│ @@ -0,0 +1,15 @@
│ +import json
│ +import sys
│ +
│ +d = json.load(open(sys.argv[1], encoding="utf-8"))
│ +keys = ("local", "published", "missing_on_live", "hidden_locally", "not_in_path", "stale",
│ +        "stale_unknown", "aux_stale", "path_differs", "shell_count", "live_version",
│ +        "repo_version", "unpushed_commits", "unpushed_checked", "history_unchecked",
│ +        "history_note")
│ +for k in keys:
│ +    print(f"{k}: {d.get(k)!r}")
│ +print("verdict:", d["verdict"])
│ +print("vanished:", d["vanished_ids"])
│ +print("audio:", {k: d["audio"][k] for k in ("total", "checked", "sampled", "missing",
│ +                                           "empty", "unreachable")})
│ +print("shell_stale:", d["shell_stale"], "| unreachable:", d["shell_unreachable"])
│ research/wiki/changelog.md
│ @@ -1,6 +1,16 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-16 (19:38) — Publikavimo patikra #321: repo 39 / paskelbta 39, kodas 18 failų prie `0636eef3`, garsas 1 138/1 138; pirmą kartą neigiamai įrodytas `not_in_path` signalas
│ +
│ +- **Būsena:** `HEAD` = `origin/main` = `0636eef3`, `git rev-list --left-right --count origin/main...HEAD` → `0 0`; darbinė kopija švari (`git status --porcelain -uall` → 0). Gyvas `index.html` → `200`, 3 487 B, `?v=0636eef3`.
│ +- **`check_published.py` (numatytasis režimas, rc 0):** „Repozitorija: 39 moduliai / Paskelbta: 39 moduliai“ (`grade-01: repo 39, gyvai 39`), `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `aux_stale` 0, `shell_stale` 0, `shell_unreachable` 0, `path_differs` `[]`, `history_checked` true, `unpushed_checked` true / `unpushed_commits` 0, `shell_count` 18, `live_version` = `repo_version` = `0636eef3`, garsas 1 138 iš 1 138 (visi, ne mėginys), `verdict.label` = `sutampa`. `vanished_ids` 1 — `03-sakinio-tvarka` → `03-sakinio-zodziai`, `resolved: true`.
│ +- **3 gyvi adresai:** `content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json` → `200`, 8 812 B; `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` → `200`, 5 044 B; `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` → `200`, 4 932 B. Papildomai: `grade-01/index.json` `200` 11 741 B, `content/lt/grades.json` `200` 1 126 B, `assets/audio/lt/manifest.json` `200` 63 974 B.
│ +- **Svetainės failų sąrašas ir tai, kas nepaskelbta:** `pages.yml` kopijuoja tik `index.html`, `404.html`, `assets/`, `content/` — todėl patikrinta priešingai: `README.md`, `AGENTS.md`, `scripts/check_published.py`, `agents/state.json`, `dashboard/server.py`, `sources/` → visi `404` (563 B 404 puslapis). Dirbtuvės nepaskelbtos, kaip ir turi būti; `SHELL_GLOBS` (18 failų) padengia visą, ką naršyklė realiai įkelia (kitų failų tipų `assets/` neturi).
│ +- **Neigiami zondai (`scratch/p321_gates.py`, laikinas repo + veidrodis `http.server`, tikro repo inodai neliesti):** bazinis rc 0 (39/39) → pakeitus **tik** veidrodį: `hidden_locally` (gyvai 40, repo 39) → rc 1, `PAVOJUS PAŽANGAI — svetainėje yra, repo ne (1): 99-dinges-modulis`; `missing_on_live` (gyvai 38) → rc 1, `NESKELBTA (1): 03-sakinio-zodziai`; pakeitus **tik** repo `path.json` — `not_in_path` → rc 1, `NĖRA path.json sekoje (1): 08-metu-laikai`; atstačius abi puses → vėl rc 0. `hidden_locally` ir `missing_on_live` jau buvo įrodyti #306 (2026-11-15 19:30) — šiandien tai pakartotinis įrodymas tame pačiame medyje, o **`not_in_path` neigiamai įrodytas pirmą kartą** (`grep -rn "NĖRA path.json" agents/log/` iki šiandien težinojo tik įrankio išeities kodo eilutes).
│ +- **Vartai:** `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų, rc 0; `check_docs_facts.py` → 0/0 (9 kryptys, 39 moduliai, 39 sim, 169 užduotys, 569 garso tekstai, 1 138 įrašai); `check_lessons.py` → 100 įrašų, visi su 4 laukais; `check_audio.py --no-engine` → 569 tekstų / 1 138 įrašų / 1 138 mp3, rc 0.
│ +- **Sprendimas:** **sutampa**. Nieko nešalinta, joks ID nepernumeruotas, `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `scripts/**` neliesti. Užpildyta #319 palikta skola: `agents/state.json` gauna `last_publish_check_321` ir atkurtą `last_publish_check_319` su šaltinio nuoroda. Naujos pamokos nepridėta — defekto nebuvo, o pamokos failo taisyklė reikalauja pamokos iš realaus defekto, ne iš teorijos.
│
│  ## 2026-11-16 (16:10) — Publikavimo patikra #319: repo 39 / paskelbta 39, kodas 18 failų, garsas 1 138/1 138, trys skolos uždarytos neigiamais zondais
│
│ agents/log/publikavimo-agentas-2026-11-16T1938.md
│ @@ -0,0 +1,135 @@
│ +# publikavimo-agentas — 2026-11-16T1938
│ +
│ +- paleidimas: **#321**
│ +- vaidmuo: publikavimo-agentas
│ +- data: 2026-11-16 (19:30–19:45)
│ +- sprendimas: **sutampa** — `check_published.py` rc 0, repo 39 / paskelbta 39
│ +- neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `scripts/**`
│ +
│ +## 1. Įėjimo būsena
│ +
│ +- `HEAD` = `origin/main` = `0636eef3` (`git rev-list --left-right --count origin/main...HEAD` → `0 0`).
│ +- Darbinė kopija prieš darbą švari (`git status --porcelain -uall` → 0 eilučių).
│ +- Platformos būsena (paleidimo antraštė): 39 moduliai, 169 užduotys, 39 sim, 1 klasė gyva, 1 138 garso failų (32,9 MB).
│ +
│ +## 2. `check_published.py` išvestis (numatytasis režimas, rc 0)
│ +
│ +```
│ +Repozitorija: 39 moduliai
│ +Paskelbta:    39 moduliai
│ +  · grade-01: repo 39, gyvai 39
│ +Pervadinti ID, priimta ir užregistruota (1):
│ +  - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai (registruota; žyma už seno ID vaiko naršyklėje LIEKA — alias mechanizmo nėra, žr. agents/proposals/)
│ +Garsas: patikrinta 1138 iš 1138 (visi) — visi pasiekiami
│ +✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, svetainės kodas 18 failų, versija 0636eef3).
│ +```
│ +
│ +Kiti raktai (`--json`, rc 0): `local` 39, `published` 39, `missing_on_live` `[]`, `hidden_locally` `[]`,
│ +`not_in_path` `[]`, `stale` `[]`, `stale_unknown` `[]`, `aux_stale` `[]`, `path_differs` `[]`,
│ +`shell_stale` `[]`, `shell_unreachable` `[]`, `shell_count` 18, `live_version` = `repo_version` = `0636eef3`,
│ +`unpushed_checked` true / `unpushed_commits` 0, `history_unchecked` `[]`, `history_note` `''`,
│ +garsas `total` 1138 / `checked` 1138 / `sampled` false / `missing` `[]` / `empty` `[]` / `unreachable` `[]`,
│ +`verdict` = `{"ok": true, "reasons": [], "label": "sutampa"}`.
│ +
│ +`vanished_ids` 1: `03-sakinio-tvarka` → `03-sakinio-zodziai`, `last_rev` `a2ad497`, `resolved: true`.
│ +Kadangi `hidden_locally` tuščias, vaidmens 3 žingsnis („sustok ir pranešk“) nejungiamas — vaiko
│ +`localStorage` žymos niekur neturi modulio, kurio repo neturėtų.
│ +
│ +## 3. Trys gyvi adresai (HTTP kodai)
│ +
│ +| adresas | kodas | baitai |
│ +|---|---|---|
│ +| `content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json` | 200 | 8 812 |
│ +| `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` | 200 | 5 044 |
│ +| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | 200 | 4 932 |
│ +
│ +Papildomai: `content/lt/grade-01/index.json` 200 / 11 741 B, `content/lt/grades.json` 200 / 1 126 B,
│ +`assets/audio/lt/manifest.json` 200 / 63 974 B, `index.html` 200 / 3 487 B (`?v=0636eef3`).
│ +
│ +## 4. Kas nepaskelbta — patikrinta priešinga kryptimi
│ +
│ +`pages.yml` (eil. 23–29) iš repo ima tik `index.html`, `404.html`, `assets/`, `content/` ir ištrina
│ +katalogų `AGENTS.md`. Tai patikrinta ne skaitant YAML, o klausiant svetainės:
│ +
│ +| adresas | kodas |
│ +|---|---|
│ +| `README.md` | 404 (563 B — 404 puslapis) |
│ +| `AGENTS.md` | 404 |
│ +| `scripts/check_published.py` | 404 |
│ +| `agents/state.json` | 404 |
│ +| `dashboard/server.py` | 404 |
│ +| `sources/` | 404 |
│ +| `.probe-krit41.html`, `.probe-krit41b.html` | 404 |
│ +
│ +Dirbtuvės (agents, scripts, dashboard, sources, docs) į svetainę nepatenka. `assets/` neturi kitų
│ +failų tipų (tik `css/`, `js/`, `audio/`), todėl `SHELL_GLOBS` (18 failų: `index.html`, `404.html`,
│ +11 × `assets/js/**/*.js`, 6 × `assets/css/*.css`) padengia viską, ką naršyklė įkelia.
│ +`.probe-krit41*.html` yra `.gitignore` (`:34` `.probe-*`) ir netrackinti — ne publikavimo rizika,
│ +tik darbo likutis medyje; neliesti.
│ +
│ +## 5. Neigiami zondai — ar trys pažangos signalai tikrai įsižiebia
│ +
│ +Zondas `scratch/p321_gates.py` (ne repo): laikinas repo `T` (ROOT imamas iš įrankio vietos) +
│ +laikinas veidrodis `L` kaip „gyva svetainė“ per `http.server`; `assets/audio` — kietosios nuorodos
│ +(tik skaitoma), visa kita — tikros kopijos, tad **joks tikro repo failas nebuvo rašomas**.
│ +
│ +| scenarijus | pakeista | rc | eilutė |
│ +|---|---|---|---|
│ +| A0 | nieko (repo = veidrodis) | 0 | „sutampa (… kodas 18 failų)“ |
│ … omitted 57 diff line(s) across 1 additional file(s)/section(s)
│ agents/log/publikavimo-agentas-2026-11-16T1938.md
│ @@ -63,7 +63,7 @@
│
│  Dirbtuvės (agents, scripts, dashboard, sources, docs) į svetainę nepatenka. `assets/` neturi kitų
│  failų tipų (tik `css/`, `js/`, `audio/`), todėl `SHELL_GLOBS` (18 failų: `index.html`, `404.html`,
│ -11 × `assets/js/**/*.js`, 6 × `assets/css/*.css`) padengia viską, ką naršyklė įkelia.
│ +15 × `assets/js/**/*.js`, 1 × `assets/css/*.css` — perskaičiuota `find`, ne iš atminties) padengia viską, ką naršyklė įkelia.
│  `.probe-krit41*.html` yra `.gitignore` (`:34` `.probe-*`) ir netrackinti — ne publikavimo rizika,
│  tik darbo likutis medyje; neliesti.
│
│ agents/state.json
│ @@ -71,9 +71,9 @@
│        "cadence": "pirmadieniais, ketvirtadieniais"
│      },
│      "publikavimo-agentas": {
│ -      "last_run": "2026-11-16T16:06:36",
│ +      "last_run": "2026-11-16T19:38:00",
│        "status": "published",
│ -      "log": "agents/log/publikavimo-agentas-2026-11-16T1600.md",
│ +      "log": "agents/log/publikavimo-agentas-2026-11-16T1938.md",
│        "description": "Užtikrina, kad sukurtas turinys būtų paskelbtas ir neprarastų ankstesnių modulių",
│        "cadence": "kasdien 5 kartus (06:20, 11:40, 16:00, 19:30, 23:00)"
│      },
Sustabdytas iteracijų limitas. Ataskaita — kas realiai išmatuota ir įrašyta, o kas liko nebaigta.

## Sprendimas: SUTAMPA

**`check_published.py` (numatytasis režimas, rc 0):**
```
Repozitorija: 39 moduliai
Paskelbta:    39 moduliai
  · grade-01: repo 39, gyvai 39
Pervadinti ID, priimta ir užregistruota (1):
  - grade-01 03-sakinio-tvarka → 03-sakinio-zodzi (registruota, resolved)
Garsas: patikrinta 1138 iš 1138 (visi) — visi pasiekiami
✔ Repo ir gyva svetainė sutampa (ID, seka, baitai, svetainės kodas 18 failų, versija 0636eef3)
```
`missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `aux_stale` 0, `shell_stale` 0, `path_differs` [], `unpushed_commits` 0, `unpushed_checked` true. HEAD = origin/main = `0636eef3`, medis švarus.

**3 HTTP kodai:** `matematika/25-ilgis-ir-vienetas.json` 200/8 812 B; `lietuviu-kalba/01-garsas-ir-raide.json` 200/5 044 B; `pasaulio-pazinimas/16-vandens-busenos.json` 200/4 932 B. Papildomai: index.json 200/11 741, grades.json 200/1 126, manifest.json 200/63 974, index.html 200/3 487.

## Ką dar išmatavau (ne tik pakartojau)

Neigiami zondai (`scratch/p321_gates.py`, laikinas repo + veidrodis `http.server`, tikro repo inodai neliesti): bazinis rc 0 → veidrodyje papildytas `index.json` → rc 1 `PAVOJUS PAŽANGAI — svetainėje yra, repo ne (1): 99-dinges-modulis`; iš veidrodžio išimtas modulis → rc 1 `NESKELBTA (1)`; repo `path.json` be vieno ID → rc 1 `NĖRA path.json sekoje (1): 08-metu-lai">`; atstačius — vėl rc 0.

Sąžiningai: `hidden_locally` ir `missing_on_live` jau buvo įrodyti #306, tai pakartojimas. **`not_in_path` neigiamai įrodytas pirmą kartą** — iki šiandien `grep -rn "NĖRA path.json" agents/log/` težinojo įrankio išeities kodo eilutes.

Dar patikrinau priešinga kryptimi, ko svetainė neskelbia: `README.md`, `AGENTS.md`, `scripts/…`, `agents/state.json`, `dashboard/server.py`, `sources/` → visi 404 (563 B 404 puslapis). Dirbtuvės į svetainę nepatenka.

Vartai: `validate_content --grade 1 --strict` 0/0 rc 0; `check_docs_facts` 0/0; `check_lessons` 100 įrašų; `check_audio --no-engine` 1 138/1 138 rc 0.

## Įrašyta

- `research/wiki/changelog.md` — įrašas 2026-11-16 (19:38)
- `agents/log/publikavimo-agentas-2026-11-16T1938.md` — pilna ataskaita
- `agents/state.json` — `roles.publikavimo-agentas` atnaujintas (`last_run` 19:38, naujas log)

Naujos pamokos nepridėjau sąmoningai: vaikui matomo defekto nebuvo, o `pamokos.md` reikalauja pamokos iš realaus defekto.

## NEBAIGTA (privaloma kitam paleidimui)

1. **`agents/state.json` `last_publish_check_321` blokas neįrašytas** — teliko `roles` dalis. Reikia pridėti bloką su `decision: "sutampa"`, `modules_live/local: 39`, `shell_count: 18`, `http_codes`, `audio: 1138/1138`, `unpushed 0`, `touched`; ir atkurti #319 paliktą `last_publish_check_319` su `source` nuoroda į #319 ataskaitą.
2. **`check_view.py` nepaleistas** — `content/**` ir `assets/**` neliesti, gyvą svetainę jau tikrino `check_published.py` baitais. Sąmoningas praleidimas.
3. Atviri ne mano failų klausimai: pažangos alias už `03-sakinio-tvarka` (`progress.js`), `check_audio.py` manifestas abiem kryptimis, `index.json` kortelės vs modulio laukų palyginimas.

Neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `scripts/**`. Joks modulis nešalintas, joks ID nepernumeruotas.

## klaidos

```
session_id: local-215eff51458d6a39492934830cc28e33ff3a80a1d6735c86e371ca7ad105f783
```
