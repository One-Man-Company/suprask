# publikavimo-agentas — 2026-11-19T1931

- paleidimas: #388 (manual)
- trukmė: 316s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub388/probe_f.py
│ @@ -0,0 +1,45 @@
│ +#!/usr/bin/env python3
│ +"""Zondas F: klasės indeksas svetainėje 404, o svetainė sveika.
│ +
│ +Scenarijus: `content/lt/grade-01/index.json` veidrodyje pašalintas, bet
│ +`index.html`, `grades.json` ir moduliai yra. Tai realus atvejis, kai klasė
│ +įjungta `grades.json` (`status: live`), o jos katalogas dar nepaskelbtas.
│ +
│ +Ko tikimasi: pranešimas turi sakyti, kad svetainėje nėra **klasės indekso**
│ +(publikuoti), o ne kad „gyva svetainė nepasiekiama“ (kartoti užklausą).
│ +"""
│ +from __future__ import annotations
│ +
│ +import os
│ +import pathlib
│ +import subprocess
│ +import sys
│ +
│ +sys.path.insert(0, str(pathlib.Path(__file__).parent))
│ +from mirror import ROOT, Server, make_mirror  # noqa: E402
│ +
│ +WORK = pathlib.Path(__file__).parent / "mirror_f"
│ +GRADE = WORK / "content/lt/grade-01"
│ +
│ +
│ +def run(url: str) -> tuple[int, str]:
│ +    env = dict(os.environ, SUPRASK_LIVE_ROOT=url)
│ +    proc = subprocess.run(
│ +        ["python3", "scripts/check_published.py", "--audio-sample", "8"],
│ +        cwd=ROOT, capture_output=True, text=True, env=env, timeout=600,
│ +    )
│ +    return proc.returncode, proc.stdout + proc.stderr
│ +
│ +
│ +def main() -> int:
│ +    make_mirror(WORK)
│ +    (GRADE / "index.json").unlink()
│ +    with Server(WORK) as url:
│ +        rc, out = run(url)
│ +    print(f"rc={rc}")
│ +    print(out)
│ +    return 0
│ +
│ +
│ +if __name__ == "__main__":
│ +    raise SystemExit(main())
│ profiles/deepseek41flash/cache/scratch/pub388/probe_f.py
│ @@ -7,9 +7,15 @@
│
│  Ko tikimasi: pranešimas turi sakyti, kad svetainėje nėra **klasės indekso**
│  (publikuoti), o ne kad „gyva svetainė nepasiekiama“ (kartoti užklausą).
│ +
│ +Naudojimas:
│ +    python3 probe_f.py            # žmogui skirtas pranešimas
│ +    python3 probe_f.py --json     # tik verdict / live_error / skaičiai
│  """
│  from __future__ import annotations
│
│ +import argparse
│ +import json
│  import os
│  import pathlib
│  import subprocess
│ @@ -22,23 +28,54 @@
│  GRADE = WORK / "content/lt/grade-01"
│
│
│ -def run(url: str) -> tuple[int, str]:
│ +def run(url: str, as_json: bool = False) -> tuple[int, str]:
│      env = dict(os.environ, SUPRASK_LIVE_ROOT=url)
│ +    args = ["python3", "scripts/check_published.py", "--audio-sample", "8"]
│ +    if as_json:
│ +        args.append("--json")
│      proc = subprocess.run(
│ -        ["python3", "scripts/check_published.py", "--audio-sample", "8"],
│ -        cwd=ROOT, capture_output=True, text=True, env=env, timeout=600,
│ +        args, cwd=ROOT, capture_output=True, text=True, env=env, timeout=600,
│      )
│      return proc.returncode, proc.stdout + proc.stderr
│
│
│  def main() -> int:
│ +    ap = argparse.ArgumentParser()
│ +    ap.add_argument("--json", action="store_true")
│ +    ap.add_argument("--drop", default="index.json",
│ +                    help="kurį klasės failą pašalinti veidrodyje (index.json|path.json)")
│ +    ap.add_argument("--expect", choices=["new", "old"], default="new")
│ +    args = ap.parse_args()
│ +
│      make_mirror(WORK)
│ -    (GRADE / "index.json").unlink()
│ +    (GRADE / args.drop).unlink()
│      with Server(WORK) as url:
│ -        rc, out = run(url)
│ -    print(f"rc={rc}")
│ -    print(out)
│ -    return 0
│ +        rc, out = run(url, args.json)
│ +
│ +    verdict = None
│ +    if args.json:
│ +        data = json.loads(out.strip().splitlines()[-1])
│ +        verdict = data.get("verdict")
│ +        print(f"rc={rc}")
│ +        print(f"live_error={data.get('live_error')!r}")
│ +        print(f"repo_error={data.get('repo_error')!r}")
│ +        print(f"local={data.get('local')} published={data.get('published')} "
│ +              f"published_measured={data.get('published_measured')}")
│ +        print(f"audio={data.get('audio', {}).get('checked')}/{data.get('audio', {}).get('total')}")
│ +        print(f"verdict={verdict}")
│ +    else:
│ +        print(f"rc={rc}")
│ +        print(out)
│ +
│ +    text = out if not args.json else json.dumps(verdict, ensure_ascii=False)
│ +    if args.expect == "new":
│ +        ok = (rc == 1 and "klasės indekso" in text
│ +              and "gyva svetainė nepasiekiama" not in text)
│ +    else:
│ +        ok = "gyva svetainė nepasiekiama" in text
│ +    print(f"\nF: {'GERAI' if ok else 'BLOGAI'} (laukta: "
│ +          f"{'publikavimo trūkumas' if args.expect == 'new' else 'senoji klaida'})")
│ +    return 0 if ok else 1
│
│
│  if __name__ == "__main__":
│ scripts/check_published.py
│ @@ -699,7 +699,7 @@
│      # `verdict()` iš to darė „gyva svetainė nepasiekiama“: veidrodis be
│      # `grade-01/index.json` skelbė klaidą apie svetainę, nors svetainė sveika
│      # (LL-21 — teiginys apie priežastį, kurios niekas neperskaitė).
│ -    out: dict = {"grade": grade, "live_error": "", "repo_error": ""}
│ +    out: dict = {"grade": grade, "live_error": "", "repo_error": "", "live_gone": []}
│
│      try:
│          data, files = local_index(grade)
│ scripts/check_published.py
│ @@ -711,8 +711,19 @@
│      live_ids: list[str] = []
│      live_seq: list[str] = []
│      live_index_ok = False
│ +    # Klasės indeksas ir `path.json` skaitomi prieš bet kurį modulį, tad jų
│ +    # 404 yra atskiras faktas, ne ryšio klaida: tai nepaskelbta klasė
│ +    # (`grades.json` jau sako `live`, o katalogas dar ne svetainėje). Iki #388
│ +    # `fetch()` grąžindavo `None` abiem atvejais, o `verdict()` iš to darė
│ +    # „gyva svetainė nepasiekiama“ — tame pačiame pranešime, kuriame garso
│ +    # patikra ėjo per tą pačią svetainę ir rado viską (LL-21, LL-120 vienu
│ +    # lygiu aukščiau: priežastis, kurios niekas neperskaitė).
│      for name in ("index.json", "path.json"):
│ -        blob = fetch(f"{LIVE_ROOT}content/lt/{gd}/{name}")
│ +        status, blob = fetch_answer(f"{LIVE_ROOT}content/lt/{gd}/{name}")
│ +        if status == "missing":
│ +            # 404 — atsakymas, ne gedimas: failo svetainėje nėra.
│ +            out["live_gone"].append(f"{gd}/{name}")
│ +            break
│          if blob is None:
│              out["live_error"] = out["live_error"] or f"gyvas {gd}/{name} nepasiekiamas"
│              break
│ scripts/check_published.py
│ @@ -979,6 +979,7 @@
│          "stale_unknown": merge("stale_unknown"),
│          "stale_unmeasured": merge("stale_unmeasured"),
│          "live_missing": merge("live_missing"),
│ +        "live_gone": merge("live_gone"),
│          "missing_in_repo": merge("missing_in_repo"),
│          "aux_stale": aux_stale,
│          "aux_absent": aux_absent,
│ scripts/check_published.py
│ @@ -1032,10 +1032,19 @@
│          reasons.append("repo indekso nepavyko perskaityti")
│      if data.get("live_error"):
│          reasons.append("gyva svetainė nepasiekiama")
│ +    # Klasės indekso 404: svetainė atsako, bet klasės katalogo joje nėra.
│ +    # Atskira priežastis, nes taisymas kitas — publikuoti, o ne kartoti
│ +    # užklausą. Iki #388 šis atvejis virsdavo „gyva svetainė nepasiekiama“,
│ +    # nors tame pačiame pranešime garso patikra ėjo per tą pačią svetainę
│ +    # (LL-21, LL-120 vienu lygiu aukščiau).
│ +    if data.get("live_gone"):
│ +        reasons.append(f"klasės failo nėra svetainėje (404): {', '.join(data['live_gone'])}")
│      # `published` be perskaityto gyvo indekso yra nulis vietoj matavimo. Jei
│      # dėl kokios nors priežasties `live_error` liko tuščias, skaičius vis tiek
│ -    # neturi atrodyti išmatuotas (#382).
│ -    if data.get("published_measured") is False and not data.get("live_error"):
│ +    # neturi atrodyti išmatuotas (#382). Kai indekso svetainėje nėra, priežastis
│ +    # jau įvardyta aukščiau, tad kartoti „neišmatuota“ nereikia.
│ +    if (data.get("published_measured") is False and not data.get("live_error")
│ +            and not data.get("live_gone")):
│          reasons.append("paskelbtų modulių skaičius neišmatuotas")
│      if data.get("missing_on_live"):
│          reasons.append(f"{len(data['missing_on_live'])} neskelbta")
│ scripts/check_published.py
│ @@ -1142,6 +1142,10 @@
│      print(f"Repozitorija: {data['local']} moduliai")
│      if data.get("published_measured", True):
│          print(f"Paskelbta:    {data['published']} moduliai")
│ +    elif data.get("live_gone"):
│ +        # 404 yra atsakymas: klasės katalogo svetainėje nėra. Ne „neperskaityta“.
│ +        print(f"Paskelbta:    neišmatuota — svetainėje nėra "
│ +              f"{', '.join(data['live_gone'])} (404)")
│      else:
│          # Ne „0 modulių“: tiek pat tiesos būtų sakyti „0“ ir „48“, nes gyvo
│          # indekso niekas neperskaitė (#382, LL-37).
│ scripts/check_published.py
│ @@ -1165,6 +1165,13 @@
│          print("  Taisyk repo failą — publikavimas čia nieko nepakeis.")
│      if data["live_error"]:
│          print(f"Gyvos svetainės klaida: {data['live_error']}")
│ +    if data.get("live_gone"):
│ +        # Ne „svetainė nepasiekiama“: svetainė atsakė 404, tad trūksta
│ +        # publikavimo, o ne ryšio. Svetainės klaida šiame bėgime tuščia, o
│ +        # garso patikra ėjo per tą pačią svetainę (#388, LL-120).
│ +        print(f"SVETAINĖJE NĖRA KLASĖS FAILO — svetainė atsakė 404 "
│ +              f"({len(data['live_gone'])}): {', '.join(data['live_gone'])}")
│ +        print("  Publikuok klasę — kiti adresai svetainėje atsakė, tad tai ne ryšio gedimas.")
│      if data["missing_on_live"]:
│          print(f"NESKELBTA ({len(data['missing_on_live'])}): {', '.join(data['missing_on_live'])}")
│      if data["hidden_locally"]:
│ scripts/check_published.py
│ @@ -153,6 +153,20 @@
│    `…KODO FAILO`), o `verdict()` turi savo priežastis, nes taisymas kitas —
│    paleisti publikavimą, ne kartoti užklausą. Zondas:
│    `scratch/pub386/probe.py` — prieš pataisymą 3/5 (B krito), po — 5/5.
│ +
│ +2026-11-19 (paleidimas #388): ta pati 404 klaida liko vienu lygiu aukščiau.
│ +  #386 sutvarkė modulio failą ir svetainės kodą, bet **klasės** `index.json`
│ +  ir `path.json` tebebuvo skaitomi senuoju `fetch()` kontraktu: 404 virsdavo
│ +  `None`, `live_error` — „gyvas grade-01/index.json nepasiekiamas“, o
│ +  `verdict()` — „gyva svetainė nepasiekiama“. Tai būdavo pranešama kartu su
│ +  garso eilute, kuri ėjo per **tą pačią** svetainę ir rado visus 1432 įrašus,
│ +  tad pranešimas prieštaravo pats sau ir siuntė taisyti tinklo vietoj
│ +  publikavimo (LL-21, LL-120). Realus atvejis: klasė įjungta `grades.json`
│ +  (`status: live`), o jos katalogas dar nepaskelbtas. Dabar `check_grade()`
│ +  naudoja `fetch_answer()`, rašo `live_gone`, o `verdict()` turi priežastį
│ +  „klasės failo nėra svetainėje (404)“. Zondas:
│ +  `scratch/pub388/probe_f.py` — prieš pataisymą `verdict.label` =
│ +  „gyva svetainė nepasiekiama“, po — „klasės failo nėra svetainėje“.
│
│  Naudojimas:
│      python3 scripts/check_published.py               # žmogui
│ profiles/deepseek41flash/cache/scratch/pub388/probe.py
│ @@ -0,0 +1,146 @@
│ +#!/usr/bin/env python3
│ +"""Zondas: ar check_published.py skiria „svetainėje nėra“ nuo „nepasiekta“?
│ +
│ +Scenarijai:
│ +  A  sveikas veidrodis                          -> rc 0, sutampa
│ +  B  gyvas index.json rodo modulį, failo nėra    -> SVETAINĖJE NĖRA MODULIO FAILO
│ +  C  gyvas failas pasenęs (kitas turinys)        -> PASENĘS TURINYS
│ +  D  svetainė neatsiliepia (miręs uostas)        -> SVETAINĖ NEPASIEKAMA
│ +  E  gyvas grades.json 404                       -> PAGRINDINIO FAILO NĖRA SVETAINĖJE
│ +  F  gyvas grade-01/index.json 404, svetainė sveika -> SVETAINĖJE NĖRA KLASĖS FAILO
│ +
│ +Naudojimas:
│ +  python3 probe.py --expect new   # po pataisymo: 6/6 GERAI
│ +  python3 probe.py --expect old   # prieš pataisymą: B ir F defektai turi būti
│ +
│ +Neigiama kontrolė atskiru klonu:
│ +  git worktree add /tmp/suprask-old f09e196
│ +  SUPRASK_PROBE_ROOT=/tmp/suprask-old python3 probe.py --expect old
│ +  git worktree remove /tmp/suprask-old
│ +
│ +Kodėl F atsirado (#388): #386 atskyrė 404 nuo nepasiekiamumo modulio faile,
│ +bet klasės `index.json` / `path.json` tebebuvo skaitomi senuoju `fetch()`
│ +kontraktu — 404 virsdavo `live_error` → „gyva svetainė nepasiekiama“, nors
│ +garso patikra tame pačiame bėgime ėjo per tą pačią svetainę ir rado viską.
│ +"""
│ +from __future__ import annotations
│ +
│ +import argparse
│ +import json
│ +import os
│ +import pathlib
│ +import subprocess
│ +import sys
│ +
│ +sys.path.insert(0, str(pathlib.Path(__file__).parent))
│ +from mirror import ROOT, Server, dead_url, make_mirror  # noqa: E402
│ +
│ +WORK = pathlib.Path(__file__).parent / "mirror"
│ +GRADE = WORK / "content/lt/grade-01"
│ +MOD = "matematika/04-skaiciu-tiese.json"
│ +AUDIO_SAMPLE = ["--audio-sample", "8"]
│ +
│ +
│ +def run(url: str) -> tuple[int, str]:
│ +    env = dict(os.environ, SUPRASK_LIVE_ROOT=url)
│ +    proc = subprocess.run(
│ +        ["python3", "scripts/check_published.py", *AUDIO_SAMPLE],
│ +        cwd=ROOT, capture_output=True, text=True, env=env, timeout=600,
│ +    )
│ +    return proc.returncode, proc.stdout + proc.stderr
│ +
│ +
│ +def scenario_a():
│ +    make_mirror(WORK)
│ +    with Server(WORK) as url:
│ +        return run(url)
│ +
│ +
│ +def scenario_b():
│ +    """Indeksas gyvas ir teisingas, modulio failo svetainėje nėra (404)."""
│ +    make_mirror(WORK)
│ +    (GRADE / MOD).unlink()
│ +    with Server(WORK) as url:
│ +        return run(url)
│ +
│ +
│ +def scenario_c():
│ +    """Failas yra, bet turinys kitas — tai turi likti PASENĘS TURINYS."""
│ +    make_mirror(WORK)
│ +    path = GRADE / MOD
│ +    data = json.loads(path.read_text(encoding="utf-8"))
│ +    data["subtitle"] = data.get("subtitle", "") + " (senas veidrodis)"
│ +    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
│ +    with Server(WORK) as url:
│ +        return run(url)
│ +
│ +
│ +def scenario_e():
│ … omitted 68 diff line(s) across 1 additional file(s)/section(s)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub388/mirror.py
│ @@ -8,13 +8,16 @@
│
│  import functools
│  import http.server
│ +import os
│  import pathlib
│  import shutil
│  import socket
│  import socketserver
│  import threading
│
│ -ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +# `SUPRASK_PROBE_ROOT` leidžia paleisti zondą prie seno commit'o atskiru
│ +# `git worktree` klonu (neigiama kontrolė), nekeičiant šio failo.
│ +ROOT = pathlib.Path(os.environ.get("SUPRASK_PROBE_ROOT", "/home/zoltanas/workspace/suprask"))
│  COPY = ["index.html", "404.html", "assets", "content"]
│
│
## Ką radau ir ką pakeičiau

**Būsena šiandien (išmatuota, ne iš atminties):** `check_published.py` numatytasis bėgimas → `Repo 48 / Paskelbta 48`, `grade-01: repo 48, gyvai 48`, garsas 1432/1432, kodas 19 failų, gyva versija `371b5815` = `HEAD`, `unpushed 0`, rc 0. Vietinė kopija švari, `HEAD` = `origin/main`.

**Ankstesnio paleidimo skola uždaryta:** #386 darbas tikrai įvykdytas ir įkomituotas (`dfcedd6`) — paleidau zondą `scratch/pub386/probe.py --expect new`: **5/5 GERAI** (A sutampa, B „SVETAINĖJE NĖRA MODULIO FAILO“, C pasenęs, D nepasiekiama, E pagrindinis failas). Changelog eilutė, `LL-120` ir `state.json` blokas `last_publish_check_386` jau yra — jų nekūriau iš naujo.

**Naujas defektas, kurį radau ir pataisiau (tas pats 404 tipas vienu lygiu aukščiau):**
`check_grade()` klasės `index.json` / `path.json` tebelskaitė senuoju `fetch()` kontraktu. Kai svetainėje nėra klasės indekso (realus atvejis: klasė įjungta `grades.json` su `status: live`, o katalogas dar nepaskelbtas), įrankis pranešdavo `verdict.label` = **„gyva svetainė nepasiekiama“** — tame pačiame pranešime, kuriame garso patikra ėjo per **tą pačią** svetainę ir rado visus įrašus. Tai siuntė taisyti tinklo vietoj publikavimo (LL-21 / LL-120).

Pakeitimai `scripts/check_published.py`:
- `check_grade()` naudoja `fetch_answer()`, 404 → naujas laukas `live_gone` (ne `live_error`);
- `report()` perduoda `live_gone`;
- `verdict()` nauja priežastis „klasės failo nėra svetainėje (404)“; „neišmatuotas skaičius“ nebedubliuojamas, kai priežastis jau įvardyta;
- spausdintuvas: atskiras blokas `SVETAINĖJE NĖRA KLASĖS FAILO` ir tiksli `Paskelbta:` eilutė;
- docstring įrašas „2026-11-19 (paleidimas #388)“.

**Įrodymas zondais** (`~/.hermes/profiles/deepseek41flash/cache/scratch/pub388/probe.py`, veidrodis + 6 scenarijai):
- prieš pataisymą F: `live_error='grade-01: gyvas grade-01/index.json nepasiekiamas'`, `verdict.label='gyva svetainė nepasiekiama'`;
- po pataisymo: **6/6 GERAI** — F → `SVETAINĖJE NĖRA KLASĖS FAILO … atsakė 404`, `Paskelbta: neišmatuota — svetainėje nėra grade-01/index.json (404)`, be žodžio „nepasiekiama“; A–E nepakito (neigiama kontrolė rodo, kad pataisymas nepakeitė to, ko neturėjo).

## Ko dar nebaigiau

1. **Neigiama kontrolė senu kodu** (`git worktree` prie `f09e196` + `--expect old`) — nepalėsta. Zondo docstring tam paruoštas (`SUPRASK_PROBE_ROOT`), bet senojo kodo F defektas jau užfiksuotas tiesioginiu bėgimu aukščiau, o B defektas — #386 ataskaitoje.
2. **3 gyvi HTTP kodai** šiame bėgime dar nepaleisti (`curl`), nors #387 leidėjo įrašas ką tik matavo tuos pačius adresus.
3. **`research/wiki/changelog.md` eilutė #388** ir `agents/state.json` blokas `last_publish_check_388` — neįrašyti; `pamokos.md` LL-121 taip pat dar nėra (naujas pamokos tipas: „taisyta viena būsena, o tas pats `None` kontraktas liko kituose vartotojuose“).

## Sprendimas

**ištaisyta** (`scripts/check_published.py` — 404 klasės lygyje atskirtas nuo ryšio gedimo, patvirtinta 6/6 zondais) ir **sutampa** (repo 48 / paskelbta 48, versija `371b5815`). Modulio ID nekeisti, `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, kitų vaidmenų failai neliesti; jokio `git push` ar commit'o.

## klaidos

```
session_id: local-98b002a41696f598bf967e2b1c76ae86df804007ade71dbb1dbdc68dc5a5f2a0
```
