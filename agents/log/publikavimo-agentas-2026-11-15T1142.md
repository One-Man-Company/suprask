# publikavimo-agentas — 2026-11-15T1142

- paleidimas: #301 (manual)
- trukmė: 280s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/probe_manifest.py
│ @@ -0,0 +1,12 @@
│ +import json
│ +p = "/home/zoltanas/workspace/suprask/assets/audio/lt/manifest.json"
│ +m = json.load(open(p, encoding="utf-8"))
│ +print("type:", type(m).__name__, "length:", len(m))
│ +if isinstance(m, dict):
│ +    k = list(m)[0]
│ +    print("first key:", repr(k))
│ +    print("first value:", repr(m[k])[:300])
│ +    kinds = {}
│ +    for v in m.values():
│ +        kinds[type(v).__name__] = kinds.get(type(v).__name__, 0) + 1
│ +    print("value types:", kinds)
│ scripts/check_published.py
│ @@ -43,14 +43,27 @@
│  prieš publikavimą prirašo commit'o trumpinį prie CSS/JS nuorodų, kad
│  naršyklė nepaimtų iš GitHub Pages tarpinės atminties seno failo. Todėl
│  svetainės failai lyginami **nuėmus `?v=`**, o pati versija perskaitoma ir
│ -palyginama su `git HEAD` — kitu atveju įrankis klaidingai skelbtų „pasenęs
│ +palyginama su `git HEAD` — kitu atveju įrankis klaidingai skelbė „pasenęs
│  kodas“ po kiekvieno publikavimo.
│ +
│ +2026-11-15 (paleidimas #301): tikrinami ir **garso failai**, ne tik manifestas.
│ +Iki šiol lygintas tik `assets/audio/lt/manifest.json` baitais: jei manifestas
│ +gyvas ir teisingas, vartai žali — nors patys mp3 gali būti nepaskelbti, ir
│ +vaikas, paspaudęs garsiakalbį, negirdi nieko. Ši sritis liko vienintelė, kurios
│ +neapėmė nė vieni vartai (#288, #292, #294 kas kartą matavo rankiniu zendu:
│ +1138/1138, 86 s). Dabar manifestas perskaitomas, kiekvienas įrašas tikrinamas
│ +HEAD užklausa, o rezultatas įvardijamas skaičiais. Numatytai tikrinamas
│ +**mėginys** (48 įrašai, tolygiai per visą manifestą), kad 5 kartus per dieną
│ +einantis publikavimo patikrinimas liktų greitas; `--audio-full` tikrina visus
│ +1138. Mėginys niekada nepranešamas kaip pilnas: išvestis visada sako
│ +„patikrinta N iš M (mėginys)“ (LL-37).
│
│  Naudojimas:
│      python3 scripts/check_published.py               # žmogui
│      python3 scripts/check_published.py --json        # dashboard'ui
│      python3 scripts/check_published.py --grade 1     # viena klasė
│      python3 scripts/check_published.py --no-bytes    # greita: tik ID ir seka
│ +    python3 scripts/check_published.py --audio-full  # visi garso įrašai
│  """
│
│  from __future__ import annotations
│ scripts/check_published.py
│ @@ -43,7 +43,7 @@
│  prieš publikavimą prirašo commit'o trumpinį prie CSS/JS nuorodų, kad
│  naršyklė nepaimtų iš GitHub Pages tarpinės atminties seno failo. Todėl
│  svetainės failai lyginami **nuėmus `?v=`**, o pati versija perskaitoma ir
│ -palyginama su `git HEAD` — kitu atveju įrankis klaidingai skelbė „pasenęs
│ +palyginama su `git HEAD` — kitu atveju įrankis klaidingai skelbtų „pasenęs
│  kodas“ po kiekvieno publikavimo.
│
│  2026-11-15 (paleidimas #301): tikrinami ir **garso failai**, ne tik manifestas.
│ scripts/check_published.py
│ @@ -114,6 +114,92 @@
│  # vartus amžinai raudonus, o amžinai raudoni vartai — tas pats kaip jokių (LL-37).
│  RENAMES = ROOT / "scripts" / "known_renames.json"
│  HISTORY_LIMIT = 400
│ +
│ +# Garsas. Manifestas jau lyginamas kaip `AUX_FILES` įrašas, bet baitų lygybė
│ +# sako tik tiek, kad sąrašas gyvas — ne kad failai, į kuriuos jis rodo, yra
│ +# svetainėje. Vaikas, paspaudęs garsiakalbį, gauna 404 ir nieko negirdi, o
│ +# visi vartai žali (#288, #292, #294). Todėl manifestas perskaitomas ir
│ +# tikrinamas kiekvienas įrašas.
│ +AUDIO_MANIFEST = ROOT / "assets" / "audio" / "lt" / "manifest.json"
│ +AUDIO_URL_PREFIX = "assets/audio/lt/"
│ +# Numatytasis mėginys: 5 paleidimai per dieną × 1138 užklausų būtų 5690
│ +# veltui pasikartojančių HEAD užklausų. 48 įrašai tolygiai per visą manifestą
│ +# pagauna „visas aplankas nepaskelbtas“ ir „naujausi įrašai nepaskelbti“ —
│ +# būtent tuos du atvejus, dėl kurių ši patikra ir atsirado.
│ +AUDIO_SAMPLE = 48
│ +
│ +
│ +def audio_paths(sample: int | None = AUDIO_SAMPLE) -> tuple[list[str], int]:
│ +    """(tikrinimi garso kelių sąrašas, kiek jų iš viso manifeste).
│ +
│ +    `sample=None` — visi įrašai. Mėginys imamas tolygiai (kas n-tas), ne iš
│ +    pradžios: pirmi įrašai yra seniausi ir paskelbti seniausiai, tad pradžios
│ +    mėginys sistemingai nematytų naujausio modulio garso (LL-37).
│ +    """
│ +    try:
│ +        data = json.loads(AUDIO_MANIFEST.read_text(encoding="utf-8"))
│ +    except (OSError, json.JSONDecodeError):
│ +        return [], 0
│ +    paths: list[str] = []
│ +    for value in data.values():
│ +        if isinstance(value, dict):
│ +            paths += [str(p) for p in value.values() if p]
│ +        elif isinstance(value, str) and value:
│ +            paths.append(value)
│ +    paths.sort()
│ +    total = len(paths)
│ +    if sample is None or sample <= 0 or total <= sample:
│ +        return paths, total
│ +    step = total / sample
│ +    picked = [paths[min(total - 1, int(i * step))] for i in range(sample)]
│ +    return list(dict.fromkeys(picked)), total
│ +
│ +
│ +def _audio_state(rel: str) -> tuple[str, int]:
│ +    """("ok"|"missing"|"empty"|"unreachable", baitai). HEAD, ne GET: turinys
│ +    čia neįdomus — įdomu, ar failas yra ir ar jis ne tuščias."""
│ +    url = AUDIO_URL_PREFIX + rel
│ +    for attempt in (0, 1):
│ +        try:
│ +            req = urllib.request.Request(LIVE_ROOT + url, headers=UA, method="HEAD")
│ +            with urllib.request.urlopen(req, timeout=20) as resp:
│ +                size = int(resp.headers.get("Content-Length") or 0)
│ +                return ("ok" if size > 0 else "empty"), size
│ +        except urllib.error.HTTPError as exc:
│ +            if exc.code in (404, 410):
│ +                return "missing", -1
│ +            if attempt == 0:
│ +                time.sleep(1.5)  # LL-76: kraštas po deploymento būna mišrus
│ +                continue
│ +            return "unreachable", -1
│ +        except Exception:  # noqa: BLE001
│ +            if attempt == 0:
│ +                time.sleep(1.5)
│ +                continue
│ +            return "unreachable", -1
│ +    return "unreachable", -1
│ +
│ +
│ +def check_audio(sample: int | None = AUDIO_SAMPLE) -> dict:
│ +    rels, total = audio_paths(sample)
│ +    if not total:
│ +        return {"total": 0, "checked": 0, "sampled": False,
│ +                "missing": [], "empty": [], "unreachable": [],
│ +                "note": "manifestas neperskaitytas — garso patikra neįvyko"}
│ +    with ThreadPoolExecutor(max_workers=10) as pool:
│ +        results = list(pool.map(lambda rel: (rel, _audio_state(rel)), rels))
│ +    missing = [rel for rel, (state, _) in results if state == "missing"]
│ … omitted 14 diff line(s) across 1 additional file(s)/section(s)
│ scripts/check_published.py
│ @@ -77,6 +77,7 @@
│  import subprocess
│  import sys
│  import time
│ +import urllib.error
│  import urllib.request
│  from concurrent.futures import ThreadPoolExecutor
│
│ scripts/check_published.py
│ @@ -531,7 +531,8 @@
│          return ""
│
│
│ -def report(grades: list[int] | None = None, compare_bytes: bool = True) -> dict:
│ +def report(grades: list[int] | None = None, compare_bytes: bool = True,
│ +           audio_sample: int | None = AUDIO_SAMPLE) -> dict:
│      grades = grades or live_grades()
│      per_grade = [check_grade(g, compare_bytes) for g in grades]
│
│ scripts/check_published.py
│ @@ -560,6 +560,14 @@
│          "live_version": "", "repo_version": "",
│      }
│
│ +    # Garsas: manifestas lyginamas aukščiau, bet failai — ne. Be šios dalies
│ +    # „sutampa“ galėjo reikšti „manifestas teisingas, o mp3 svetainėje nėra“.
│ +    audio = check_audio(None if not compare_bytes else audio_sample) if compare_bytes else {
│ +        "total": 0, "checked": 0, "sampled": False,
│ +        "missing": [], "empty": [], "unreachable": [],
│ +        "note": "garso patikra praleista (--no-bytes)",
│ +    }
│ +
│      out = {
│          "grades": per_grade,
│          "live_grades": grades,
│ @@ -575,6 +583,7 @@
│          "stale": merge("stale"),
│          "stale_unknown": merge("stale_unknown"),
│          "aux_stale": aux_stale,
│ +        "audio": audio,
│          "shell_stale": shell["shell_stale"],
│          "shell_unreachable": shell["shell_unreachable"],
│          "shell_count": shell["shell_count"],
│ scripts/check_published.py
│ @@ -636,6 +636,13 @@
│          reasons.append(f"{len(data['shell_stale'])} pasenęs kodas")
│      if data.get("shell_unreachable"):
│          reasons.append(f"{len(data['shell_unreachable'])} nepasiekiamas kodas")
│ +    audio = data.get("audio") or {}
│ +    if audio.get("missing"):
│ +        reasons.append(f"{len(audio['missing'])} trūksta garso failo")
│ +    if audio.get("empty"):
│ +        reasons.append(f"{len(audio['empty'])} tuščias garso failas")
│ +    if audio.get("unreachable"):
│ +        reasons.append(f"{len(audio['unreachable'])} nepasiekiamas garso failas")
│      if data.get("unpushed_commits"):
│          reasons.append(f"{data['unpushed_commits']} neišsiųstas commit")
│      return {"ok": not reasons, "reasons": reasons,
│ scripts/check_published.py
│ @@ -658,10 +658,15 @@
│      ap.add_argument("--json", action="store_true")
│      ap.add_argument("--grade", type=int, default=0, help="tikrinti vieną klasę")
│      ap.add_argument("--no-bytes", action="store_true", help="greita: tik ID ir seka")
│ +    ap.add_argument("--audio-full", action="store_true",
│ +                    help="tikrinti visus garso įrašus (numatyta: mėginys)")
│ +    ap.add_argument("--audio-sample", type=int, default=AUDIO_SAMPLE,
│ +                    help=f"kiek garso įrašų tikrinti (numatyta {AUDIO_SAMPLE})")
│      args = ap.parse_args()
│
│      grades = [args.grade] if args.grade else None
│ -    data = report(grades, compare_bytes=not args.no_bytes)
│ +    sample = None if args.audio_full else args.audio_sample
│ +    data = report(grades, compare_bytes=not args.no_bytes, audio_sample=sample)
│
│      if args.json:
│          print(json.dumps(data, ensure_ascii=False))
│ scripts/check_published.py
│ @@ -720,6 +720,20 @@
│      if data.get("shell_unreachable"):
│          print(f"NEPASIEKIAMI svetainės kodo failai ({len(data['shell_unreachable'])}): "
│                f"{', '.join(data['shell_unreachable'])}")
│ +    audio = data.get("audio") or {}
│ +    if audio.get("total"):
│ +        kind = "mėginys" if audio.get("sampled") else "visi"
│ +        line = f"Garsas: patikrinta {audio['checked']} iš {audio['total']} ({kind})"
│ +        bad = len(audio.get("missing", [])) + len(audio.get("empty", [])) + len(audio.get("unreachable", []))
│ +        print(line + (f" — TRŪKSTA {bad}" if bad else " — visi pasiekiami"))
│ +        for key, label in (("missing", "nėra svetainėje"), ("empty", "tuščias"),
│ +                           ("unreachable", "nepasiektas")):
│ +            for rel in audio.get(key, [])[:10]:
│ +                print(f"  - {rel} — {label}")
│ +        if audio.get("sampled"):
│ +            print("  (mėginys tolygus per visą manifestą; pilna patikra: --audio-full)")
│ +    elif audio.get("note"):
│ +        print(f"Garsas: {audio['note']}")
│      if data["unpushed_commits"]:
│          print(f"Neišstumta commit'ų: {data['unpushed_commits']}")
│      if not problems(data):
│ profiles/deepseek41flash/cache/scratch/make_mirror301.py
│ @@ -0,0 +1,30 @@
│ +"""Veidrodis, kuriame vienas garso failas „nepaskelbtas“: ar vartai tai pamato?
│ +
│ +Nekopijuojame 33 MB: garso failai sukuriami kaip kietosios nuorodos, tada
│ +vienas iš jų perkeliamas už serverio šaknies (repo failas nepaliestas).
│ +"""
│ +import os
│ +import pathlib
│ +import shutil
│ +
│ +SRC = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +DST = pathlib.Path("/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/mirror301a")
│ +
│ +if DST.exists():
│ +    shutil.rmtree(DST)
│ +(DST / "assets").mkdir(parents=True)
│ +for name in ("index.html", "404.html", "content"):
│ +    os.symlink(SRC / name, DST / name)
│ +for name in ("js", "css"):
│ +    os.symlink(SRC / "assets" / name, DST / "assets" / name)
│ +shutil.copytree(SRC / "assets" / "audio", DST / "assets" / "audio", copy_function=os.link)
│ +
│ +mp3s = sorted((DST / "assets" / "audio" / "lt" / "n").glob("*.mp3"))
│ +victim = mp3s[-1]
│ +hidden = DST / "pakeliuta"
│ +hidden.mkdir()
│ +os.rename(victim, hidden / victim.name)
│ +print("veidrodis:", DST)
│ +print("pašalinta iš svetainės:", victim.relative_to(DST))
│ +print("mp3 veidrodyje:", sum(1 for _ in DST.rglob("*.mp3")))
│ +print("repo mp3:", sum(1 for _ in SRC.rglob("assets/audio/lt/*/*.mp3")))
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/make_mirror301.py
│ @@ -21,7 +21,7 @@
│
│  mp3s = sorted((DST / "assets" / "audio" / "lt" / "n").glob("*.mp3"))
│  victim = mp3s[-1]
│ -hidden = DST / "pakeliuta"
│ +hidden = DST.parent / "pakeliuta301"
│  hidden.mkdir()
│  os.rename(victim, hidden / victim.name)
│  print("veidrodis:", DST)
Sustabdyta dėl iteracijų limito — pateikiu ataskaitą tokią, kokia yra, ir aiškiai įvardiju, kas liko neįrašyta.

PAGAL BAIGTIES SĄLYGĄ

1. `python3 scripts/check_published.py` (repo / paskelbta / neišstumta):
   Repozitorija: 39 moduliai
   Paskelbta:    39 moduliai (grade-01: repo 39, gyvai 39)
   Neišstumta commit'ų: 0 (HEAD = origin/main = 36f2adf9a64770a0ad9c5e91894a4a1f04bdb163, rev-list abiem kryptimis 0/0, darbinė kopija buvo švari prieš darbą)
   ID: missing_on_live 0, hidden_locally 0, not_in_path 0, stale 0, stale_unknown 0, aux_stale 0, shell_stale 0, shell_unreachable 0, path_differs []
   vanished_ids 1: 03-sakinio-tvarka → 03-sakinio-zodziai (resolved true, registruota known_renames.json; vaiko žyma už seno ID lieka be modulio — alias mechanizmo nėra, atviras pasiūlymas)
   Svetainės kodas: 17 failų, gyvai versija 36f2adf9 = repo HEAD

2. Trys gyvi adresai (visi 200, baitai = `git cat-file blob HEAD:`):
   200  8812 B  content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json  LYGUS
   200  5459 B  content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json LYGUS
   200  4932 B  content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json LYGUS
   Papildomai: index.json 11741 B, path.json 1339 B, grades.json 1126 B — visi 200 ir LYGŪS.
   Kodas: app.js, calba.js, index.html gyvai skiriasi tik `?v=36f2adf9` žyma (nuėmus — baitai lygūs, sha sutampa); progress.js ir main.css lygūs be žymos; santykinių importų be `?v=` gyvai 0.

3. Sprendimas: **sutampa**. Nuo #294 (662d3144) nepasikeitė nė vienas `content/` failas — nė vienas ID ir pažangos raktas nejudėjo. Pasikeitė tik kodas (app.js, progress.js, main.css, calba.js — #297–#300) ir visi jie gyvi. Vartai: validate_content.py --grade 1 --strict 0/0; check_docs_facts.py 0/0; check_audio.py 569 tekstų / 1138 įrašų / 1138 mp3.

PADARYTAS DARBAS (vienintelis pakeitimas — scripts/check_published.py)

Užtaisiau sritį, kurią trys paleidimai (#288, #292, #294) matavo tik rankiniu zendu ir kurios neapėmė nė vieni vartai: gyvus garso failus. Iki šiol buvo lyginamas tik `manifest.json` baitais — jei manifestas teisingas, vartai žali, nors mp3 gali būti nepaskelbti.

Kas pridėta: `audio_paths()` (manifestas → 1138 kelių; mėginys imamas tolygiai per visą sąrašą, ne nuo pradžios), `_audio_state()` (HEAD, 404/410 = nėra, 0 B = tuščias, kita = nepasiektas, vienas pakartojimas po 1,5 s pagal LL-76), `check_audio()`, `--audio-full` ir `--audio-sample N` vėliavėlės, trys naujos `verdict()` priežastys, išvesties eilutė „Garsas: patikrinta N iš M (mėginys|visi)“. Mėginys niekada nepranešamas kaip pilnas (LL-37).

Išmatuota realiai:
   numatytasis režimas → 48 iš 1138, visi pasiekiami, visas patikrinimas 5,8 s
   --audio-full → 1138 iš 1138, visi pasiekiami, 44,5 s, rc 0
   Abu paleisti prieš gyvą svetainę, rc 0.

KAS LIKO NEĮRAŠYTA (dėl iteracijų limito, ne dėl kliūties)

   - Neigiamas zondo testas nepaleistas: veidrodis `scratch/mirror301a` su vienu „nepaskelbtu“ mp3 buvo sukurtas, bet pirmas bandymas skaičiavo 1138 todėl, kad pašalintas failas liko veidrodžio viduje; pataisytas kelias (`pakeliuta301` už serverio šaknies) įrašytas, bet paleisti nespėjau. **Todėl naujoji garso patikra dar neįrodyta neigiamu atveju** — tai ta pati LL-10 klasė, dėl kurios #251 buvo taisomas šis įrankis. Pirmas darbas kitam paleidimui.
   - `agents/log/publikavimo-agentas-2026-11-15T1120.md` — ši ataskaita neįrašyta.
   - `research/wiki/changelog.md` — eilutė „2026-11-15 (11:20) — Publikavimo patikra #301: repo 39 / paskelbta 39, versija 36f2adf9, garsas 48/1138 mėginys + 1138/1138 pilna, rc 0“ neįrašyta.
   - `agents/state.json` → `last_publish_check` (run_id 301) neatnaujintas.
   - Commit nepaleistas — `scripts/check_published.py` yra darbinėje kopijoje (git push daro bėgiklis).

NELIESTA: content/**, assets/js/**, assets/css/**, docs/**, AGENTS.md, index.json, path.json, grades.json, garsas. Joks ID nepernumeruotas, nieko nešalinta. Naujos pamokos nepridėjau — vaiko matomo naujo defekto tipo neradau.

Vienas pastebėjimas ateičiai: #300 commit'o žinutė vėl iš modelio teksto („c = sqlite3.connect('agents/runs.db')“), o commit'e — calba.js + 776 eilučių log. Tai jau turimas #5190, nekartoju.

## klaidos

```
session_id: local-852958e7306d3003b2a18b98c1a0dddff50c3271a49e3d6c1a508085a216eb4e
```
