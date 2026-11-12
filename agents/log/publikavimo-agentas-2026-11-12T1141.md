# publikavimo-agentas — 2026-11-12T1141

- paleidimas: #247 (manual)
- trukmė: 164s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/probe_pub_247.py
│ @@ -0,0 +1,43 @@
│ +#!/usr/bin/env python3
│ +"""Zondas: ar top-level publikavimo failai gyvai baitais lygus repo failams."""
│ +import hashlib
│ +import pathlib
│ +import sys
│ +import urllib.request
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +LIVE = "https://one-man-company.github.io/suprask/"
│ +UA = {"User-Agent": "suprask-check/1.1"}
│ +
│ +FILES = [
│ +    "content/lt/grades.json",
│ +    "content/lt/grade-01/index.json",
│ +    "content/lt/grade-01/path.json",
│ +    "content/lt/audio/lt/manifest.json",
│ +]
│ +
│ +
│ +def sha(b):
│ +    return hashlib.sha256(b).hexdigest()
│ +
│ +
│ +for rel in FILES:
│ +    loc = (ROOT / rel).read_bytes()
│ +    try:
│ +        req = urllib.request.Request(LIVE + rel, headers=UA)
│ +        with urllib.request.urlopen(req, timeout=25) as r:
│ +            live = r.read()
│ +    except Exception as exc:  # noqa: BLE001
│ +        print(f"{rel}: FETCH FAIL {type(exc).__name__}: {exc}")
│ +        continue
│ +    ok = sha(loc) == sha(live)
│ +    print(f"{rel}: repo {len(loc)} B, gyvai {len(live)} B -> {'MATCH' if ok else 'DIFF'}")
│ +
│ +print("--- audio sample (5 mp3) ---")
│ +man = (ROOT / "content/lt/audio/lt/manifest.json").read_bytes()
│ +import json  # noqa: E402
│ +
│ +keys = list(json.loads(man).keys())[:5]
│ +for k in keys:
│ +    # manifest values map key -> file name; discover shape
│ +    print("manifest key sample:", k)
│ profiles/deepseek41flash/cache/scratch/probe_pub_247b.py
│ @@ -0,0 +1,44 @@
│ +#!/usr/bin/env python3
│ +"""Zondas #2: manifest.json ir garso failu imtis (baitai, ne skaiciai)."""
│ +import hashlib
│ +import json
│ +import pathlib
│ +import urllib.request
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +LIVE = "https://one-man-company.github.io/suprask/"
│ +UA = {"User-Agent": "suprask-check/1.1"}
│ +
│ +
│ +def sha(b):
│ +    return hashlib.sha256(b).hexdigest()
│ +
│ +
│ +def fetch(rel):
│ +    req = urllib.request.Request(LIVE + rel, headers=UA)
│ +    with urllib.request.urlopen(req, timeout=25) as r:
│ +        return r.read()
│ +
│ +
│ +rel = "assets/audio/lt/manifest.json"
│ +loc = (ROOT / rel).read_bytes()
│ +live = fetch(rel)
│ +print(f"{rel}: repo {len(loc)} B, gyvai {len(live)} B -> "
│ +      f"{'MATCH' if sha(loc) == sha(live) else 'DIFF'}")
│ +data = json.loads(loc)
│ +keys = list(data)
│ +print(f"manifest raktu: {len(keys)}, pavyzdys: {keys[0]} -> {data[keys[0]]!r}")
│ +
│ +print("--- 5 mp3 imtis ---")
│ +for k in keys[:5]:
│ +    v = data[k]
│ +    name = v if isinstance(v, str) else v.get("file", "")
│ +    path = f"assets/audio/lt/{name}" if not name.startswith("assets/") else name
│ +    lp = ROOT / path
│ +    try:
│ +        lv = fetch(path)
│ +    except Exception as exc:  # noqa: BLE001
│ +        print(f"  {path}: FETCH FAIL {type(exc).__name__}")
│ +        continue
│ +    ok = lp.exists() and sha(lp.read_bytes()) == sha(lv)
│ +    print(f"  {path}: gyvai {len(lv)} B -> {'MATCH' if ok else 'DIFF'}")
│ profiles/deepseek41flash/cache/scratch/probe_pub_247c.py
│ @@ -0,0 +1,46 @@
│ +#!/usr/bin/env python3
│ +"""Zondas #3: garso mp3 imtis pagal manifest struktura {n,s}."""
│ +import hashlib
│ +import json
│ +import pathlib
│ +import urllib.request
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +LIVE = "https://one-man-company.github.io/suprask/"
│ +UA = {"User-Agent": "suprask-check/1.1"}
│ +data = json.loads((ROOT / "assets/audio/lt/manifest.json").read_text(encoding="utf-8"))
│ +
│ +
│ +def sha(b):
│ +    return hashlib.sha256(b).hexdigest()
│ +
│ +
│ +def fetch(rel):
│ +    req = urllib.request.Request(LIVE + rel, headers=UA)
│ +    with urllib.request.urlopen(req, timeout=25) as r:
│ +        return r.read()
│ +
│ +
│ +keys = sorted(data, key=int)
│ +sample = [keys[0], keys[1], keys[len(keys) // 2], keys[-1]]
│ +n_ok = n_bad = 0
│ +for k in sample:
│ +    for variant in ("n", "s"):
│ +        rel = "assets/audio/lt/" + data[k][variant]
│ +        lp = ROOT / rel
│ +        if not lp.exists():
│ +            print(f"  {rel}: NERA REPO")
│ +            n_bad += 1
│ +            continue
│ +        try:
│ +            lv = fetch(rel)
│ +        except Exception as exc:  # noqa: BLE001
│ +            print(f"  {rel}: FETCH FAIL {type(exc).__name__}")
│ +            n_bad += 1
│ +            continue
│ +        ok = sha(lp.read_bytes()) == sha(lv)
│ +        n_ok += ok
│ +        n_bad += not ok
│ +        print(f"  key {k}/{variant}: {len(lv)} B -> {'MATCH' if ok else 'DIFF'}")
│ +
│ +print(f"imtis: {n_ok} match, {n_bad} ne")
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe_pub_247c.py
│ @@ -21,7 +21,7 @@
│          return r.read()
│
│
│ -keys = sorted(data, key=int)
│ +keys = list(data)
│  sample = [keys[0], keys[1], keys[len(keys) // 2], keys[-1]]
│  n_ok = n_bad = 0
│  for k in sample:
│ profiles/deepseek41flash/cache/scratch/probe_pub_247d.py
│ @@ -0,0 +1,31 @@
│ +#!/usr/bin/env python3
│ +"""Zondas #4: struktura — index/path/grades/manifest susiejimas."""
│ +import json
│ +import pathlib
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +CONTENT = ROOT / "content" / "lt"
│ +idx = json.loads((CONTENT / "grade-01" / "index.json").read_text(encoding="utf-8"))
│ +path = json.loads((CONTENT / "grade-01" / "path.json").read_text(encoding="utf-8"))
│ +grades = json.loads((CONTENT / "grades.json").read_text(encoding="utf-8"))
│ +manifest = json.loads((ROOT / "assets/audio/lt/manifest.json").read_text(encoding="utf-8"))
│ +
│ +ids = [m["id"] for s in idx["strands"] for m in s["modules"]]
│ +print(f"index: {len(idx['strands'])} kryptys, {len(ids)} moduliai, unikaliu {len(set(ids))}")
│ +seq = path["sequence"]
│ +print(f"path: {len(seq)} zingsniai, unikaliu {len(set(seq))}")
│ +print("ne indekse:", [x for x in seq if x not in ids])
│ +print("ne kelyje:", [x for x in ids if x not in seq])
│ +missing_files = [m["file"] for s in idx["strands"] for m in s["modules"]
│ +                 if not (CONTENT / m["file"]).exists()]
│ +print("nera failo:", missing_files)
│ +print("grades:", [(g["grade"], g["status"], g.get("modules")) for g in grades["grades"] if g["grade"] == 1])
│ +print(f"manifest: {len(manifest)} tekstu, irasu {sum(2 for _ in manifest)}")
│ +# sim registracija
│ +import re
│ +regs = ""
│ +for f in (ROOT / "assets/js/sims").glob("*.js"):
│ +    regs += f.read_text(encoding="utf-8")
│ +sims = {m.get("sim") for s in idx["strands"] for m in s["modules"]}
│ +not_reg = [s for s in sims if s and f'"{s}"' not in regs]
│ +print("sim neregistruota:", not_reg)
│ scripts/check_published.py
│ @@ -31,6 +31,7 @@
│  import argparse
│  import hashlib
│  import json
│ +import os
│  import pathlib
│  import subprocess
│  import sys
│ @@ -41,8 +42,18 @@
│  ROOT = pathlib.Path(__file__).resolve().parent.parent
│  CONTENT = ROOT / "content" / "lt"
│  GRADES = CONTENT / "grades.json"
│ -LIVE_ROOT = "https://one-man-company.github.io/suprask/"
│ -UA = {"User-Agent": "suprask-check/1.1"}
│ +LIVE_ROOT = os.environ.get("SUPRASK_LIVE_ROOT", "https://one-man-company.github.io/suprask/")
│ +UA = {"User-Agent": "suprask-check/1.2"}
│ +
│ +# Failai, kuriuos svetainė skaito prieš bet kurį modulį. Jie nelyginami modulio
│ +# baitų cikle (jis eina tik per `content/lt/<klase>/`), todėl pasenęs gyvas
│ +# `manifest.json` anksčiau likdavo nepastebėtas: visi moduliai 200, visi vartai
│ +# žali, o naujo modulio garso įrašo svetainėje nėra (404). LL-78.
│ +AUX_FILES = [
│ +    ("content/lt/grades.json", CONTENT / "grades.json"),
│ +    ("assets/audio/lt/manifest.json", ROOT / "assets" / "audio" / "lt" / "manifest.json"),
│ +]
│ +
│
│
│  def grade_dir(grade: int) -> str:
│ scripts/check_published.py
│ @@ -93,22 +93,30 @@
│      return hashlib.sha256(data).hexdigest()
│
│
│ -def same_bytes(rel: str) -> tuple[bool, int, int]:
│ -    """(ar gyvas failas baitais lygus repo failui, repo baitai, gyvi baitai)."""
│ -    local_path = CONTENT / rel
│ +def compare(local_path: pathlib.Path, url_rel: str) -> tuple[bool, int, int]:
│ +    """(ar gyvas failas baitais lygus repo failui, repo baitai, gyvi baitai).
│ +
│ +    -1 gyvuose reiškia „nepasiektas“, 0 — „repo failo nėra“.
│ +    """
│      if not local_path.exists():
│          return False, 0, 0
│      local = local_path.read_bytes()
│ -    live = fetch(LIVE_ROOT + "content/lt/" + rel)
│ +    live = fetch(LIVE_ROOT + url_rel)
│      if live is None:
│          return False, len(local), -1
│      if sha(live) != sha(local):
│          # LL-76: pirmomis sekundėmis po deploymento kraštas gali būti mišrus.
│          time.sleep(1.5)
│ -        live = fetch(LIVE_ROOT + "content/lt/" + rel)
│ +        live = fetch(LIVE_ROOT + url_rel)
│          if live is None:
│              return False, len(local), -1
│      return sha(live) == sha(local), len(local), len(live)
│ +
│ +
│ +def same_bytes(rel: str) -> tuple[bool, int, int]:
│ +    """(ar gyvas failas baitais lygus repo failui, repo baitai, gyvi baitai)."""
│ +    return compare(CONTENT / rel, "content/lt/" + rel)
│ +
│
│
│  def check_grade(grade: int, compare_bytes: bool = True) -> dict:
│ scripts/check_published.py
│ @@ -173,6 +173,17 @@
│                                    "live_bytes": live_size})
│      out["stale"] = stale
│      out["stale_unknown"] = stale_unknown
│ +
│ +    # LL-78: klasės indeksas ir seka skaitomi prieš modulį, todėl jų baitai
│ +    # lyginami atskirai — kitaip „ID yra“ dar nereiškia „svetainė rodo tą patį“.
│ +    aux_stale: list[dict] = []
│ +    if compare_bytes:
│ +        for name in ("index.json", "path.json"):
│ +            url_rel = f"content/lt/{gd}/{name}"
│ +            ok, local_size, live_size = compare(CONTENT / gd / name, url_rel)
│ +            if not ok:
│ +                aux_stale.append({"file": url_rel, "repo_bytes": local_size, "live_bytes": live_size})
│ +    out["aux_stale"] = aux_stale
│      return out
│
│
│ scripts/check_published.py
│ @@ -218,6 +218,16 @@
│          return out
│
│      live_errors = [f"{grade_dir(g['grade'])}: {g['live_error']}" for g in per_grade if g.get("live_error")]
│ +
│ +    # Svarbiausias failas, kurio modulio baitų ciklas neapima: garso manifestas.
│ +    # Jo stagnacija reiškia 404 naujo modulio garsui, o visi kiti vartai žali.
│ +    aux_stale = list(merge("aux_stale"))
│ +    if compare_bytes:
│ +        for url_rel, local_path in AUX_FILES:
│ +            ok, local_size, live_size = compare(local_path, url_rel)
│ +            if not ok:
│ +                aux_stale.append({"file": url_rel, "repo_bytes": local_size, "live_bytes": live_size})
│ +
│      return {
│          "grades": per_grade,
│          "live_grades": grades,
│ @@ -229,6 +239,7 @@
│          "not_in_path": merge("not_in_path"),
│          "stale": merge("stale"),
│          "stale_unknown": merge("stale_unknown"),
│ +        "aux_stale": aux_stale,
│          "path_differs": [g["grade"] for g in per_grade if g.get("path_differs")],
│          "unpushed_commits": len(unpushed()),
│          "last_commit": last_commit(),
│ @@ -240,7 +251,7 @@
│      return bool(
│          data["missing_on_live"] or data["hidden_locally"] or data["not_in_path"]
│          or data["stale"] or data["stale_unknown"] or data["path_differs"]
│ -        or data["unpushed_commits"] or data["live_error"]
│ +        or data.get("aux_stale") or data["unpushed_commits"] or data["live_error"]
│      )
│
│
│ scripts/check_published.py
│ @@ -289,10 +289,15 @@
│          print(f"NĖRA path.json sekoje ({len(data['not_in_path'])}): {', '.join(data['not_in_path'])}")
│      if data["path_differs"]:
│          print(f"path.json seka skiriasi: klasė {', '.join(map(str, data['path_differs']))}")
│ +    if data["aux_stale"]:
│ +        print(f"PASENĘS PAGRINDINIS FAILAS — moduliai 200, bet svetainė skaito kitą ({len(data['aux_stale'])}):")
│ +        for s in data["aux_stale"]:
│ +            live = "nepasiektas" if s["live_bytes"] < 0 else f"gyvai {s['live_bytes']} B"
│ +            print(f"  - {s['file']}: repo {s['repo_bytes']} B, {live}")
│      if data["unpushed_commits"]:
│          print(f"Neišstumta commit'ų: {data['unpushed_commits']}")
│      if not problems(data):
│ -        print("✔ Repo ir gyva svetainė sutampa (ID, seka ir failų baitai).")
│ +        print("✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai).")
│
│      return 1 if problems(data) else 0
│
│ scripts/check_published.py
│ @@ -18,6 +18,11 @@
│  atskiriama „trūksta ID“ nuo „ID yra, turinys pasenęs“. Nesutapimas
│  patikrinamas antrą kartą — GitHub Pages pirmomis sekundėmis po deploymento
│  gali grąžinti mišrią krašto būseną (LL-76).
│ +
│ +2026-11-12 (paleidimas #247): lyginami ir failai, kuriuos svetainė skaito
│ +prieš modulį — `grades.json`, klasės `index.json`, `path.json` ir
│ +`assets/audio/lt/manifest.json`. Anksčiau moduliai galėjo būti 200, o gyvas
│ +manifestas pasenęs: naujo modulio garsas 404, o visi vartai žali (LL-78).
│
│  Naudojimas:
│      python3 scripts/check_published.py               # žmogui
Sustabdyta dėl žingsnių limito, bet pagrindinis darbas atliktas ir patikrintas.

## 1. `check_published.py` išvestis (realus paleidimas)

```
Repozitorija: 37 moduliai
Paskelbta:    37 moduliai
  · grade-01: repo 37, gyvai 37
✔ Repo ir gyva svetainė sutampa (ID, seka ir failų baitai).
RC=0
```

`HEAD` = `origin/main` = `a2853d32b249…`, `git status --porcelain -uall` tuščias → neišstumtų commit'ų 0.

## 2. Trys gyvi adresai (HTTP)

```
content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json      200  8812 B
content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json    200  5044 B
content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json 200 4946 B
```

## 3. Papildomi zondai (tai, ko `check_published.py` anksčiau nematė)

Baitai, ne skaičiai:
- `content/lt/grades.json` — 1126 B → **MATCH**
- `content/lt/grade-01/index.json` — 11209 B → **MATCH**
- `content/lt/grade-01/path.json` — 1284 B → **MATCH**
- `assets/audio/lt/manifest.json` — 60758 B, 543 tekstai → **MATCH**
- 4 manifestiniai raktai × {n, s} = 8 mp3 → **8 MATCH, 0 ne** (15,9–24,3 kB kiekvienas)

Struktūra: 9 kryptys / 37 moduliai / 37 unikalūs ID; `path.json` 37 žingsniai; „ne indekse“ [], „ne kelyje“ [], trūkstamų failų [], `grades.json` 1 → live, 37. Visos simuliacijos registruotos (mano pirmas zondas klaidingai įvardijo `desningumai`, `figuros`, `desimtukas` — jie registruoti trumpąja `{ desimtukas, }` forma; validatorius tai patvirtina).

Vartai: `validate_content.py --grade 1 --strict` → 0/0 (rc 0); `check_docs_facts.py` → 0/0 (rc 0); `check_audio.py` → 543 tekstų / 1086 įrašų / 1086 mp3 (rc 0).

## Sprendimas: **sutampa**

Repo 37 / paskelbta 37. `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `path_differs` false. Niekas nešalinta, ID nepernumeruoti, `path.json` neliestas.

## Įtaisyta (failas: `scripts/check_published.py`)

Uždariau tris paleidimus kartotą spragą: įrankis lygino tik modulių baitus, o `grades.json`, klasės `index.json`, `path.json` ir `manifest.json` tik parsino. Pasenęs gyvas manifestas būtų tyliai 404'inęs naujo modulio garsą, o visi vartai likę žali.

- `compare(local_path, url_rel)` išskirtas iš `same_bytes`, kad tiktų ir `assets/` failams;
- `AUX_FILES` (grades + manifest) ir klasės `index.json`/`path.json` lyginami baitais, kai `compare_bytes`;
- naujas raktas `aux_stale` (`file`, `repo_bytes`, `live_bytes`), įtrauktas į `problems()` ir į žmogišką išvestį; seni JSON raktai nepakeisti (dashboard'as skaito tuos pačius);
- `SUPRASK_LIVE_ROOT` env kablys testavimui (numatyta reikšmė ta pati);
- docstring atnaujintas.

**Nebaigta:** naujo kodo *paleidimo* testai (realus `python3 scripts/check_published.py` su pakeitimais, lokalus serveris su tyčia pasenusiu manifestu, `--json` ir `--no-bytes`) — liko neišbandyta, tad pakeitimo negaliu vadinti patvirtintu. Be to neįrašyta: `research/wiki/changelog.md` eilutė (#247), `agents/log/publikavimo-agentas-2026-11-12.md`, `agents/state.json`, pamoka LL-78 į `research/wiki/guidelines/pamokos.md` (Simptomas: moduliai 200, garsas 404; Priežastis: manifestas už modulių baitų ciklo; Taisyklė: lyginti ir failus, skaitomus prieš modulį; Patikra: `aux_stale` + 2 mp3 zondas).

**Radinys kitam paleidimui:** `dashboard/server.py:717–725` „sutampa“ sprendžia tik iš `missing_on_live` ir `unpushed_commits`, tad `stale`/`aux_stale` atveju kortelė vis tiek rodys „sutampa“, nors įrankis grąžins rc 1. Tai ne mano failas — verta pasiūlymo.

## klaidos

```
session_id: local-34858cc10c2f8323928646e6a01103d5f0d82174529d2a05ac441615e783803f
```
