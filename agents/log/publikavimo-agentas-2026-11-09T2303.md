# publikavimo-agentas — 2026-11-09T2303

- paleidimas: #212 (manual)
- trukmė: 250s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub212_assets.py
│ @@ -0,0 +1,62 @@
│ +"""#212 publikavimo zondas: ar gyvi assets failai baitais lygus repo HEAD.
│ +
│ +? v=<sha8> žyma NEKEIČIAMA ir NELYGINAMA — ji pašalinama iš gyvo turinio
│ +(pamoka LL-76: žymą reikia šalinti, o ne pakeisti žymekliu).
│ +"""
│ +import hashlib
│ +import re
│ +import subprocess
│ +import urllib.request
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +UA = {"User-Agent": "suprask-pub212/1.0"}
│ +TAG = re.compile(rb"\?v=[0-9a-f]{8}")
│ +
│ +FILES = [
│ +    "index.html",
│ +    "assets/css/main.css",
│ +    "assets/js/app.js",
│ +    "assets/js/registry.js",
│ +    "assets/js/progress.js",
│ +    "assets/js/speech.js",
│ +    "assets/js/sims/art.js",
│ +    "assets/js/sims/calba.js",
│ +    "assets/js/sims/daile.js",
│ +    "assets/js/sims/dorinis.js",
│ +    "assets/js/sims/geometrija.js",
│ +    "assets/js/sims/gyvenimas.js",
│ +    "assets/js/sims/matematika.js",
│ +    "assets/js/sims/muzika.js",
│ +    "assets/js/sims/pasaulis.js",
│ +    "assets/js/sims/technologijos.js",
│ +    "assets/js/sims/zaidimai.js",
│ +    "assets/audio/lt/manifest.json",
│ +    "content/lt/grades.json",
│ +    "content/lt/grade-01/index.json",
│ +    "content/lt/grade-01/path.json",
│ +]
│ +
│ +same = 0
│ +diff = []
│ +for rel in FILES:
│ +    repo = subprocess.run(["git", "cat-file", "blob", f"HEAD:{rel}"], cwd=ROOT,
│ +                          capture_output=True).stdout
│ +    try:
│ +        with urllib.request.urlopen(urllib.request.Request(BASE + rel, headers=UA), timeout=30) as r:
│ +            live = r.read()
│ +    except Exception as exc:  # noqa: BLE001
│ +        diff.append((rel, "HTTP", repr(exc)))
│ +        continue
│ +    stripped = TAG.sub(b"", live)
│ +    if hashlib.sha256(stripped).hexdigest() == hashlib.sha256(repo).hexdigest():
│ +        same += 1
│ +        note = " (pašalinta ?v= žyma)" if stripped != live else ""
│ +        print(f"OK   {rel} {len(repo)} B{note}")
│ +    else:
│ +        diff.append((rel, "BYTES", f"repo {len(repo)} B, gyvai {len(live)} B"))
│ +        print(f"DIFF {rel}: repo {len(repo)} B, gyvai {len(live)} B")
│ +
│ +print(f"\nSutampa: {same}/{len(FILES)}; skirtumų: {len(diff)}")
│ +for d in diff:
│ +    print("  ", d)
│ profiles/deepseek41flash/cache/scratch/pub212_audio.py
│ @@ -0,0 +1,28 @@
│ +import json
│ +import random
│ +import urllib.request
│ +
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +UA = {"User-Agent": "suprask-pub212/1.0"}
│ +m = json.load(open("/home/zoltanas/workspace/suprask/assets/audio/lt/manifest.json"))
│ +print("manifest type:", type(m).__name__, "keys:", len(m))
│ +keys = sorted(m.keys())
│ +rnd = random.Random(212)
│ +ok = 0
│ +total = 0
│ +for k in rnd.sample(keys, 8):
│ +    entry = m[k]
│ +    for v in ("n", "s"):
│ +        total += 1
│ +        path = entry[v] if isinstance(entry, dict) else entry
│ +        url = BASE + str(path).lstrip("/")
│ +        try:
│ +            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
│ +                b = r.read()
│ +                head = b[:3] == b"ID3"
│ +                if r.status == 200 and head and len(b) > 5000:
│ +                    ok += 1
│ +                print(f"{r.status} {len(b):>6} B ID3={head} {k}/{v}")
│ +        except Exception as e:  # noqa: BLE001
│ +            print("ERR", k, v, e)
│ +print(f"\nGarsas: {ok}/{total}")
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub212_audio.py
│ @@ -15,7 +15,7 @@
│      for v in ("n", "s"):
│          total += 1
│          path = entry[v] if isinstance(entry, dict) else entry
│ -        url = BASE + str(path).lstrip("/")
│ +        url = BASE + "assets/audio/lt/" + str(path).lstrip("/")
│          try:
│              with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
│                  b = r.read()
│ research/wiki/changelog.md
│ @@ -1,6 +1,18 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-09 (23:06) — Publikavimo patikra #212: repo 35 / paskelbta 35, svetainė pastatyta iš `b4a6fac3`
│ +
│ +- **`check_published.py`** (nuo #211 jau lygina ir baitus, ne tik ID) → repo 35, paskelbta 35, `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0, `path_differs` [], `unpushed_commits` 0, `live_error` tuščias, `rc=0`.
│ +- **Būsena:** `HEAD` = `origin/main` = `b4a6fac35111217edf907ad5fe5e0b40647762e4`; `git status --porcelain -uall` tuščias. Gyvas `index.html` neša `?v=b4a6fac3` — svetainė pastatyta būtent iš `HEAD`, ne iš ankstesnio `99b8a34`.
│ +- **3 realios gyvos patikros (HTTP):** `content/lt/grade-01/daile/01-spalva-ir-nuotaika.json` `200` (6242 B), `…/matematika/24-komandu-seka.json` `200` (6874 B), `…/pasaulio-pazinimas/16-vandens-busenos.json` `200` (4946 B). Papildomai `…/pasaulio-pazinimas/18-kuprine-ir-kuno-dalys.json` `200` (8051 B) ir šaknis `200` (3487 B).
│ +- **Baitai, ne skaičiai (asssets, kurių `check_published.py` neapima):** 21/21 — `index.html`, `main.css`, `app.js`, `registry.js`, `progress.js`, `speech.js`, visi 10 sim failų, garso manifestas (500 raktų / 1000 takų), `grades.json`, `index.json`, `path.json` gyvai baitais lygūs `git cat-file blob HEAD:` po to, kai iš gyvo failo **pašalinama** `?v=<sha8>` žyma (LL-76). Skirtumų 0.
│ +- **Garsas:** imtis `seed 212` — 16/16 gyvų mp3 (`n` ir `s`) `200`, ID3 antraštė, 18 433–69 215 B.
│ +- **Naršyklė gyvai:** `check_view.py --base <gyva> --viewports small` → 35 maršrutai × 360 px, 0 problemų, `rc=0`.
│ +- **Nutekėjimo patikra:** `agents/state.json`, `agents/AGENTS.md`, `docs/ARCHITEKTURA.md`, `scripts/check_published.py`, `research/wiki/changelog.md` → `404`; `404.html` → `200`.
│ +- **Ką tai reiškia turiniui:** nuo #209 turinys ir assets nekeitėsi (tarpinis #211 keitė tik `agents/`, `dashboard/`, `scripts/`), tad vaiko `localStorage` pažanga rodo į tuos pačius modulius. #210 (19:38) patikra changelog įrašo nepaliko — šis įrašas ją uždengia tais pačiais skaičiais, ne nauju teiginiu.
│ +- **Sprendimas:** sutampa. Nieko nešalinta, ID nepernumeruoti, `path.json` nekeistas; ataskaita `agents/log/publikavimo-agentas-2026-11-09T2306.md`.
│
│  ## 2026-11-09 (16:40) — Publikavimo patikra #209 (leidėjas): repo 35 / gyvai 35, svetainė pastatyta iš `97ed524`
│
│ research/wiki/changelog.md
│ @@ -7,7 +7,7 @@
│  - **`check_published.py`** (nuo #211 jau lygina ir baitus, ne tik ID) → repo 35, paskelbta 35, `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0, `path_differs` [], `unpushed_commits` 0, `live_error` tuščias, `rc=0`.
│  - **Būsena:** `HEAD` = `origin/main` = `b4a6fac35111217edf907ad5fe5e0b40647762e4`; `git status --porcelain -uall` tuščias. Gyvas `index.html` neša `?v=b4a6fac3` — svetainė pastatyta būtent iš `HEAD`, ne iš ankstesnio `99b8a34`.
│  - **3 realios gyvos patikros (HTTP):** `content/lt/grade-01/daile/01-spalva-ir-nuotaika.json` `200` (6242 B), `…/matematika/24-komandu-seka.json` `200` (6874 B), `…/pasaulio-pazinimas/16-vandens-busenos.json` `200` (4946 B). Papildomai `…/pasaulio-pazinimas/18-kuprine-ir-kuno-dalys.json` `200` (8051 B) ir šaknis `200` (3487 B).
│ -- **Baitai, ne skaičiai (asssets, kurių `check_published.py` neapima):** 21/21 — `index.html`, `main.css`, `app.js`, `registry.js`, `progress.js`, `speech.js`, visi 10 sim failų, garso manifestas (500 raktų / 1000 takų), `grades.json`, `index.json`, `path.json` gyvai baitais lygūs `git cat-file blob HEAD:` po to, kai iš gyvo failo **pašalinama** `?v=<sha8>` žyma (LL-76). Skirtumų 0.
│ +- **Baitai, ne skaičiai (assets, kurių `check_published.py` neapima):** 21/21 — `index.html`, `main.css`, `app.js`, `registry.js`, `progress.js`, `speech.js`, visi 10 sim failų, garso manifestas (500 raktų / 1000 takų), `grades.json`, `index.json`, `path.json` gyvai baitais lygūs `git cat-file blob HEAD:` po to, kai iš gyvo failo **pašalinama** `?v=<sha8>` žyma (LL-76). Skirtumų 0.
│  - **Garsas:** imtis `seed 212` — 16/16 gyvų mp3 (`n` ir `s`) `200`, ID3 antraštė, 18 433–69 215 B.
│  - **Naršyklė gyvai:** `check_view.py --base <gyva> --viewports small` → 35 maršrutai × 360 px, 0 problemų, `rc=0`.
│  - **Nutekėjimo patikra:** `agents/state.json`, `agents/AGENTS.md`, `docs/ARCHITEKTURA.md`, `scripts/check_published.py`, `research/wiki/changelog.md` → `404`; `404.html` → `200`.
│ agents/log/publikavimo-agentas-2026-11-09T2306.md
│ @@ -0,0 +1,128 @@
│ +# Publikavimo agentas — paleidimas #212
│ +
│ +**Data:** 2026-11-09 23:06 (EET)
│ +**Vaidmuo:** publikavimo-agentas
│ +**HEAD:** `b4a6fac35111217edf907ad5fe5e0b40647762e4` = `origin/main`, darbinė kopija švari (`git status --porcelain -uall` tuščias), neišstumtų commit'ų 0.
│ +**Sprendimas:** **SUTAMPA.** Nieko nešalinta, ID nepernumeruoti, `path.json` tvarka nekeista, `git push` nedarytas, joks turinio failas netaisytas.
│ +
│ +---
│ +
│ +## 1. `check_published.py` išvestis
│ +
│ +```
│ +$ python3 scripts/check_published.py
│ +Repozitorija: 35 moduliai
│ +Paskelbta:    35 moduliai
│ +  · grade-01: repo 35, gyvai 35
│ +✔ Repo ir gyva svetainė sutampa (ID, seka ir failų baitai).
│ +RC=0
│ +```
│ +
│ +`--json` (sutrumpinta):
│ +
│ +```json
│ +{"local": 35, "published": 35,
│ + "missing_on_live": [], "hidden_locally": [], "not_in_path": [],
│ + "stale": [], "stale_unknown": [], "path_differs": [],
│ + "unpushed_commits": 0,
│ + "last_commit": "b4a6fac [sistemos-architektas] #211: import sqlite3, sys",
│ + "live_error": ""}
│ +```
│ +
│ +Įrankis šįkart **jau pats** lygino baitus: #211 (`scripts/check_published.py`, +242 eil.)
│ +įgyvendino atvirą #8716 — klasės imamos iš `grades.json` (`status: live`), kiekvienas
│ +gyvas modulio failas lyginamas `sha256` su repo failu, o nesutapimas patikrinamas antrą
│ +kartą (LL-76). Todėl atskiras baitų zondas buvo reikalingas tik tam, ko įrankis
│ +neapima — `assets/` failams (žr. §3).
│ +
│ +Vaidmens šakos nepanaudotos: `missing_on_live` 0 → indekso taisyti nereikėjo;
│ +`hidden_locally` 0 → sustabdymo priežasties nėra (`path.json` ir `index.json` ID aibės
│ +sutampa abiem kryptimis); `not_in_path` 0 → `path.json` neliestas.
│ +
│ +## 2. Trys gyvi adresai (HTTP)
│ +
│ +| adresas | kodas | baitai |
│ +|---|---|---|
│ +| `content/lt/grade-01/daile/01-spalva-ir-nuotaika.json` | **200** | 6242 B |
│ +| `content/lt/grade-01/matematika/24-komandu-seka.json` | **200** | 6874 B |
│ +| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | **200** | 4946 B |
│ +
│ +Papildomai: `…/pasaulio-pazinimas/18-kuprine-ir-kuno-dalys.json` **200** (8051 B),
│ +šaknis **200** (3487 B). Jokio kito kodo nebuvo.
│ +
│ +## 3. Baitai, ne ID aibės — tai, ko `check_published.py` neapima
│ +
│ +Zondas `pub212_assets.py` (scratch, 21 failas): `git cat-file blob HEAD:<kelias>` prieš
│ +gyvą baitą; iš gyvo failo **pašalinama** `?v=<sha8>` žyma (ne pakeičiama žymekliu —
│ +pirmoji tokio zondo versija #210 dėl to davė 3 klaidingus DIFF).
│ +
│ +```
│ +OK index.html 3465 B (pašalinta ?v= žyma)     OK assets/js/sims/matematika.js 158964 B
│ +OK assets/css/main.css 30802 B                OK assets/js/sims/muzika.js 23086 B
│ +OK assets/js/app.js 30713 B (?v=)             OK assets/js/sims/pasaulis.js 95894 B (?v=)
│ +OK assets/js/registry.js 3621 B (?v=)         OK assets/js/sims/technologijos.js 21653 B
│ +OK assets/js/progress.js 2779 B               OK assets/js/sims/zaidimai.js 13614 B
│ +OK assets/js/speech.js 7565 B                 OK assets/audio/lt/manifest.json 55403 B
│ +OK assets/js/sims/art.js 35702 B              OK content/lt/grades.json 1126 B
│ +OK assets/js/sims/calba.js 20380 B            OK content/lt/grade-01/index.json 10662 B
│ +OK assets/js/sims/daile.js 9543 B (?v=)       OK content/lt/grade-01/path.json 1228 B
│ +OK assets/js/sims/dorinis.js 13681 B (?v=)    OK assets/js/sims/geometrija.js 18542 B
│ +OK assets/js/sims/gyvenimas.js 11115 B (?v=)
│ +
│ +Sutampa: 21/21; skirtumų: 0
│ +```
│ +
│ +Gyvas `index.html` neša `?v=b4a6fac3` — pirmi 8 `HEAD` simboliai, tad svetainė pastatyta
│ +iš `b4a6fac`, o ne iš ankstesnio `99b8a34`. Pages deploymentas prie to paties SHA yra
│ +`completed/success`; tai sutampa ir su `?v=` žyma, ir su baitų lygybe.
│ +
│ … omitted 50 diff line(s) across 1 additional file(s)/section(s)
Publikavimo patikra #212 baigta. Sprendimas: **sutampa**.

## `check_published.py` išvestis

```
Repozitorija: 35 moduliai
Paskelbta:    35 moduliai
  · grade-01: repo 35, gyvai 35
✔ Repo ir gyva svetainė sutampa (ID, seka ir failų baitai).
RC=0
```

`--json`: `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0, `path_differs` [], `unpushed_commits` 0, `live_error` tuščias. Įrankis šįkart jau pats lygino baitus — #211 įgyvendino atvirą #8716 (klasės iš `grades.json`, sha256 lyginimas, pakartotinis patikrinimas pagal LL-76).

`HEAD` = `origin/main` = `b4a6fac35111217edf907ad5fe5e0b40647762e4`, darbinė kopija švari.

## 3 gyvi adresai (HTTP)

- `content/lt/grade-01/daile/01-spalva-ir-nuotaika.json` → **200**, 6242 B
- `content/lt/grade-01/matematika/24-komandu-seka.json` → **200**, 6874 B
- `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` → **200**, 4946 B

Papildomai: `18-kuprine-ir-kuno-dalys.json` 200 (8051 B), šaknis 200 (3487 B) — jokio kito kodo.

## Kas dar patikrinta

- **Assets baitais (ko įrankis neapima):** 21/21 lygūs `git cat-file blob HEAD:` — `index.html`, `main.css`, 6 JS branduolio failai, visi 10 sim failų, garso manifestas, `grades.json`, `index.json`, `path.json`. Skirtumų 0 po `?v=<sha8>` žymos pašalinimo (LL-76).
- **Svetainė pastatyta iš HEAD:** gyvas `index.html` neša `?v=b4a6fac3`; GitHub Actions `pages.yml` prie `b4a6fac3` → `completed/success`, 2026-11-09T18:34:29Z. Tai sutampa ir su žyma, ir su baitų lygybe.
- **Garsas:** seed 212, 16/16 mp3 (`n`+`s`) 200, ID3, 18 433–69 215 B. (Pirmoji zondo versija rodė 0/16 — kaltas zondas, manifesto takai santykiniai `assets/audio/lt/`.)
- **Naršyklė gyvai:** `check_view.py --base <gyva> --viewports small` → 35 maršrutai × 360 px, 0 problemų, rc 0.
- **Nutekėjimas:** `agents/state.json`, `agents/AGENTS.md`, `docs/ARCHITEKTURA.md`, `scripts/check_published.py`, `research/wiki/changelog.md` → 404; `404.html` → 200.

## Įrašyta

- `research/wiki/changelog.md` — įrašas „2026-11-09 (23:06) — Publikavimo patikra #212: repo 35 / paskelbta 35, svetainė pastatyta iš `b4a6fac3`“ (jis uždengia ir #210 tarpą tais pačiais skaičiais).
- `agents/log/publikavimo-agentas-2026-11-09T2306.md` — pilna ataskaita.

## Neįvykdyta iki galo

`agents/state.json` `last_publish_check` **neatnaujintas** — baigėsi įrankių kvota prieš tą žingsnį. Duomenys įrašui: run 212, HEAD `b4a6fac3`, repo 35 / paskelbta 35, 21/21 assets, 16/16 garso imtis, 35/35 check_view, decision „sutampa“, log kelias aukščiau.

Nieko nešalinta, ID nepernumeruoti, `path.json` neliestas, joks turinio failas netaisytas, `git push` nedarytas. Naujų pasiūlymų neteikta — #8716 šiandien įgyvendintas, #7397 ir `?v=` normalizavimas jau turi atvirus pasiūlymus. Naujos pamokos nepridėjau: `?v=` taisyklė fiksuota LL-76, o manifesto takų klaida buvo zondo, ne platformos, defektas.

## klaidos

```
session_id: local-28fcc7e9881e40fe7b3fdf8c1ddf16e916e3d233d53b9d74d4f523a39ebde930
```
