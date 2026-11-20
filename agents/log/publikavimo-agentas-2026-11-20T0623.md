# publikavimo-agentas — 2026-11-20T0623

- paleidimas: #392 (manual)
- trukmė: 536s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub392/probe_orphan.py
│ @@ -0,0 +1,95 @@
│ +#!/usr/bin/env python3
│ +"""Zondas: modulio failas yra repo ir svetainėje, bet jo nėra index.json.
│ +
│ +Scenarijus (realus kūrėjo darbo pėdsakas):
│ +  1. `content/lt/grade-01/matematika/49-našlaitis.json` įkeltas (48 → 49 failai);
│ +  2. `content/lt/grades.json` `modules` pakeltas 48 → 49 (kūrėjas prisiminė);
│ +  3. `content/lt/grade-01/index.json` įrašo neturi (pamiršo).
│ +
│ +Vaikui tai reiškia: failas publikuojamas (pages.yml kopijuoja visą `content/`),
│ +bet `app.js` jo niekada nemato, nes modulio įrašo ieško `index.json`.
│ +
│ +Ko tikimasi po pataisymo: bent vieni vartai raudoni ir pranešime pasakyta
│ +„našlaitis“, o ne „sutampa 49/49“.
│ +"""
│ +from __future__ import annotations
│ +
│ +import json
│ +import os
│ +import pathlib
│ +import shutil
│ +import subprocess
│ +import sys
│ +
│ +sys.path.insert(0, str(pathlib.Path(__file__).parent))
│ +from mirror import ROOT, Server, make_mirror  # noqa: E402
│ +
│ +WORK = pathlib.Path(__file__).parent / "mirror_orphan"
│ +SRC = ROOT / "content/lt/grade-01/matematika/04-skaiciu-tiese.json"
│ +DST = WORK / "content/lt/grade-01/matematika/49-naslaitis.json"
│ +
│ +
│ +def run(cmd: list[str], env: dict | None = None) -> tuple[int, str]:
│ +    proc = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True,
│ +                          env=env or os.environ, timeout=900)
│ +    return proc.returncode, proc.stdout + proc.stderr
│ +
│ +
│ +def main() -> int:
│ +    make_mirror(WORK)
│ +
│ +    # 1) failas įkeltas su savo ID; 2) grades.json skelbia 49
│ +    data = json.loads(SRC.read_text(encoding="utf-8"))
│ +    data["id"] = "49-naslaitis"
│ +    data["title"] = "Našlaitis"
│ +    DST.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
│ +    grades_path = WORK / "content/lt/grades.json"
│ +    g = json.loads(grades_path.read_text(encoding="utf-8"))
│ +    g["grades"][0]["modules"] = 49
│ +    grades_path.write_text(json.dumps(g, ensure_ascii=False, indent=2), encoding="utf-8")
│ +
│ +    # `check_registry.py` ir `validate_content.py` skaito repo, ne veidrodį, todėl
│ +    # zondas juos paleidžia prieš laikiną `git worktree` kopiją su tuo pačiu failu.
│ +    scratch = WORK / "repo"
│ +    if scratch.exists():
│ +        shutil.rmtree(scratch)
│ +    scratch.mkdir(parents=True)
│ +    for name in ("content", "assets", "scripts"):
│ +        shutil.copytree(ROOT / name, scratch / name)
│ +    shutil.copy2(DST, scratch / "content/lt/grade-01/matematika/49-naslaitis.json")
│ +    shutil.copy2(grades_path, scratch / "content/lt/grades.json")
│ +
│ +    print("=== validate_content.py --grade 1 ===")
│ +    rc_v, out_v = run([sys.executable, "scripts/validate_content.py", "--grade", "1"], )
│ +    print(f"rc={rc_v}")
│ +    print(out_v.strip()[-600:])
│ +
│ +    print("\n=== check_registry.py --grade 1 (laikina kopija) ===")
│ +    rc_r, out_r = run([sys.executable, "scripts/check_registry.py", "--grade", "1",
│ +                       "--root", str(scratch)] if False else
│ +                      [sys.executable, str(scratch / "scripts/check_registry.py"), "--grade", "1"])
│ +    print(f"rc={rc_r}")
│ +    print(out_r.strip()[-800:])
│ +
│ +    print("\n=== check_published.py (veidrodis su našlaičiu) ===")
│ +    with Server(WORK) as url:
│ +        rc_p, out_p = run([sys.executable, "scripts/check_published.py",
│ +                           "--audio-sample", "8", "--json"],
│ +                          env=dict(os.environ, SUPRASK_LIVE_ROOT=url))
│ … omitted 17 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/pub392/probe_orphan.py
│ @@ -2,15 +2,15 @@
│  """Zondas: modulio failas yra repo ir svetainėje, bet jo nėra index.json.
│
│  Scenarijus (realus kūrėjo darbo pėdsakas):
│ -  1. `content/lt/grade-01/matematika/49-našlaitis.json` įkeltas (48 → 49 failai);
│ +  1. `content/lt/grade-01/matematika/49-naslaitis.json` įkeltas (48 → 49 failai);
│    2. `content/lt/grades.json` `modules` pakeltas 48 → 49 (kūrėjas prisiminė);
│    3. `content/lt/grade-01/index.json` įrašo neturi (pamiršo).
│
│ -Vaikui tai reiškia: failas publikuojamas (pages.yml kopijuoja visą `content/`),
│ -bet `app.js` jo niekada nemato, nes modulio įrašo ieško `index.json`.
│ +Vaikui tai reiškia: failas publikuojamas (`pages.yml` kopijuoja visą `content/`),
│ +bet naršyklė jo niekada neprašo, nes modulio įrašo ieško `index.json`.
│
│ -Ko tikimasi po pataisymo: bent vieni vartai raudoni ir pranešime pasakyta
│ -„našlaitis“, o ne „sutampa 49/49“.
│ +Leidžiama prieš laikiną repo kopiją (`repo/`), kad tikri vartai būtų paleisti
│ +tikrame savo kelyje, o `$ROOT` neliestas.
│  """
│  from __future__ import annotations
│
│ @@ -25,67 +25,65 @@
│  from mirror import ROOT, Server, make_mirror  # noqa: E402
│
│  WORK = pathlib.Path(__file__).parent / "mirror_orphan"
│ +REPO = WORK / "repo"
│  SRC = ROOT / "content/lt/grade-01/matematika/04-skaiciu-tiese.json"
│ -DST = WORK / "content/lt/grade-01/matematika/49-naslaitis.json"
│
│
│ -def run(cmd: list[str], env: dict | None = None) -> tuple[int, str]:
│ -    proc = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True,
│ +def run(cmd: list[str], cwd: pathlib.Path, env: dict | None = None) -> tuple[int, str]:
│ +    proc = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True,
│                            env=env or os.environ, timeout=900)
│      return proc.returncode, proc.stdout + proc.stderr
│
│
│ -def main() -> int:
│ -    make_mirror(WORK)
│ -
│ -    # 1) failas įkeltas su savo ID; 2) grades.json skelbia 49
│ +def plant_orphan(base: pathlib.Path) -> None:
│ +    """Įkelia našlaitį: failas yra, index.json įrašo nėra, grades.json sutvarkytas."""
│ +    dst = base / "content/lt/grade-01/matematika/49-naslaitis.json"
│      data = json.loads(SRC.read_text(encoding="utf-8"))
│      data["id"] = "49-naslaitis"
│      data["title"] = "Našlaitis"
│ -    DST.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
│ -    grades_path = WORK / "content/lt/grades.json"
│ -    g = json.loads(grades_path.read_text(encoding="utf-8"))
│ +    dst.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
│ +    gp = base / "content/lt/grades.json"
│ +    g = json.loads(gp.read_text(encoding="utf-8"))
│      g["grades"][0]["modules"] = 49
│ -    grades_path.write_text(json.dumps(g, ensure_ascii=False, indent=2), encoding="utf-8")
│ +    gp.write_text(json.dumps(g, ensure_ascii=False, indent=2), encoding="utf-8")
│
│ -    # `check_registry.py` ir `validate_content.py` skaito repo, ne veidrodį, todėl
│ -    # zondas juos paleidžia prieš laikiną `git worktree` kopiją su tuo pačiu failu.
│ -    scratch = WORK / "repo"
│ -    if scratch.exists():
│ -        shutil.rmtree(scratch)
│ -    scratch.mkdir(parents=True)
│ -    for name in ("content", "assets", "scripts"):
│ -        shutil.copytree(ROOT / name, scratch / name)
│ -    shutil.copy2(DST, scratch / "content/lt/grade-01/matematika/49-naslaitis.json")
│ -    shutil.copy2(grades_path, scratch / "content/lt/grades.json")
│ +
│ +def main() -> int:
│ +    make_mirror(WORK)
│ +    if REPO.exists():
│ +        shutil.rmtree(REPO)
│ +    REPO.mkdir(parents=True)
│ +    for name in ("content", "assets", "scripts", "docs"):
│ +        shutil.copytree(ROOT / name, REPO / name)
│ +    plant_orphan(WORK)
│ +    plant_orphan(REPO)
│
│ … omitted 41 diff line(s) across 1 additional file(s)/section(s)
Sustabdyta prieš įrašant failą — baigėsi žingsniai, o repo pakeitimų nėra.

SPRENDIMAS: sutampa (patikra), bet šis paleidimas pagal taisykles yra tuščias — darbo failo repo neįrašiau.

Ką realiai išmatavau (ne iš atminties)

  python3 scripts/check_published.py --json  (rc 0, 54 s, pilnas bėgimas)
    Repozitorija: 48 moduliai
    Paskelbta:    48 moduliai   (grade-01: repo 48, gyvai 48)
    missing_on_live 0 · hidden_locally 0 · not_in_path 0 · stale 0
    live_missing 0 · aux_stale 0 · aux_absent 0 · aux_gone 0
    shell_stale 0 · shell_gone 0 · shell_count 19
    live_version 351d6d71 = repo_version 351d6d71
    Garsas: 1432 / 1432 — visi pasiekiami
    vanished_ids: 03-sakinio-tvarka → 03-sakinio-zodziai, resolved true, alias_ok true
    verdict {"ok": true, "label": "sutampa"}

  git: HEAD 351d6d71 = origin/main 351d6d71, rev-list origin/main..HEAD → 0, darbo kopija švari (0 eilučių)

  trys gyvi adresai (curl, ne atmintis)
    content/lt/grade-01/matematika/04-skaiciu-tiese.json        200  3636 B  sha256 7776d88b… = diske
    content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json   200  5313 B  sha256 49572d06… = diske
    content/lt/grade-01/pasaulio-pazinimas/08-metu-laikai.json   200  4411 B  sha256 dd2773d7… = diske
    index.html → 200, neša v=351d6d71

  papildomi vartai: validate_content.py --grade 1 --strict → 0 klaidų, 0 įspėjimų;
  check_registry.py → index 48 · failai 48 · našlaičiai 0 · PROBLEMŲ 0

Ką radau ir ko nespėjau įrašyti

  #390 palikta hipotezė dėl „našlaičių“ (failas yra, index.json įrašo nėra) JAU turi vartus:
  scripts/check_registry.py:81–83 lygina `glob("*/*.json")` su index.json sąrašu ir
  praneša `našlaičiai`. Hipotezė nepasitvirtino kaip spraga — kurti naujo įrankio nereikia.

  Tikroji spraga kita ir konkreti: check_registry.py neįtrauktas į
  .github/workflows/validate.yml (patikrinau — nė vieno paminėjimo), tad vienintelis
  įrankis, matantis našlaičius, CI nepaleidžiamas nė karto. validate_content.py:403–406
  tikrina tik `grades.json` deklaruotą skaičių prieš failų skaičių, o našlaitis su
  sutvarkytu `grades.json` abiem vartais praeina: failas publikuojamas (pages.yml kopijuoja
  visą content/), bet naršyklė jo neprašo, nes modulio įrašo ieško index.json.

  Zondo (probe_orphan.py) paleisti nepavyko — `from mirror import …` krito
  ModuleNotFoundError, nes mirror.py yra scratch/pub388, ne pub392. Defektas
  neįrodytas, todėl pamokos į research/wiki/guidelines/pamokos.md nerašiau (reikalavimas:
  pamoka tik po zondų).

Kas liko kitam paleidimui (tiksliai)

  1. Persodinti `mirror.py` iš scratch/pub388 į pub392 (arba importuoti per sys.path į pub388).
  2. Paleisti probe_orphan.py iki galo: tikimasi, kad su našlaičiu bus
     validate rc 0, registry rc 1 (esamas elgesys), published rc 0 — tai įrodo, kad
     našlaitis praeina visus CI paleidžiamus vartus.
  3. Jei zondas patvirtina: įrašyti į changelog.md eilutę #392 su šio bėgimo skaičiais
     (48/48, 351d6d71, 0 neišstumtų, 1432/1432, 200/200/200) ir pridėti pamoką.
     validate.yml neliesti — CI failas priklauso sistemos architektui, o ne šiam vaidmeniui;
     tam reikia pasiūlymo, ne savavališko pakeitimo.

ĮGYVENDINTA: — (jokio pasiūlymo iš eilės šiame paleidime neįgyvendinau; #386 ir #388 jau uždaryti, jų failai šiame commit'e nepakito)

## klaidos

```
session_id: local-0f71f3a984fc0ed624616815465612a6cc0429f9f68810be719abe978b507108
```
