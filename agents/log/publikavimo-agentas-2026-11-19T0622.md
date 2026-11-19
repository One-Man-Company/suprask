# publikavimo-agentas — 2026-11-19T0622

- paleidimas: #374 (manual)
- trukmė: 326s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub374/probe.py
│ @@ -0,0 +1,101 @@
│ +#!/usr/bin/env python3
│ +"""#374 zondas: ar `check_published.py` praneša daugiau, negu išmatavo.
│ +
│ +Du scenarijai, kurie neturi liesti tinklo (arba liečia nedaug):
│ +
│ +A. `--no-bytes` — režimas sąmoningai Nelygina baitų, bet sėkmės eilutė
│ +   iki šiol sakydavo „modulių ir pagrindinių failų baitai“ ir
│ +   „svetainės kodas 0 failų“. Tai teiginys apie matavimą, kurio nebuvo
│ +   (LL-37 šeima).
│ +
│ +B. Sulaužytas repo indeksas (grade-01/index.json ištrintas veidrodyje) —
│ +   `check_grade()` grąžina `live_error`, nors klaida yra repo pusėje, o
│ +   `verdict()` iš to daro „gyva svetainė nepasiekiama“. Žmogus taisytų
│ +   svetainę, o taisyti reikia indeksą (LL-21).
│ +
│ +Būsena: `--expect old` — tikrina, kad defektai DAR yra (prieš taisymą);
│ +`--expect new` — tikrina, kad jų nebėra (po taisymo).
│ +"""
│ +from __future__ import annotations
│ +
│ +import argparse
│ +import json
│ +import os
│ +import pathlib
│ +import shutil
│ +import subprocess
│ +import sys
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +SCRATCH = pathlib.Path(__file__).resolve().parent
│ +MIRROR = SCRATCH / "mirror"
│ +
│ +
│ +def run(script: pathlib.Path, args: list[str]) -> tuple[int, str]:
│ +    env = dict(os.environ)
│ +    env.pop("SUPRASK_LIVE_ROOT", None)
│ +    proc = subprocess.run([sys.executable, str(script), *args],
│ +                          cwd=script.parent.parent, capture_output=True,
│ +                          text=True, timeout=300, env=env)
│ +    return proc.returncode, proc.stdout + proc.stderr
│ +
│ +
│ +def make_mirror() -> pathlib.Path:
│ +    if MIRROR.exists():
│ +        shutil.rmtree(MIRROR)
│ +    # Hardlinkai: kopija sukuriama per sekundę, o ištrintas failas kopijoje
│ +    # originalo neliečia (panaikinama tik nuoroda).
│ +    subprocess.run(["cp", "-al", str(ROOT), str(MIRROR)], check=True)
│ +    return MIRROR
│ +
│ +
│ +def scenario_a(script: pathlib.Path) -> tuple[bool, str]:
│ +    rc, out = run(script, ["--grade", "1", "--no-bytes"])
│ +    line = [ln for ln in out.splitlines() if ln.startswith("✔") or ln.startswith("x")]
│ +    text = line[0] if line else out.strip().splitlines()[-1]
│ +    claims_bytes = "baitai" in text or "bait" in text
│ +    says_partial = "NETIKRINT" in text.upper()
│ +    ok = rc == 0 and not claims_bytes and says_partial
│ +    return ok, f"rc={rc} · {text}"
│ +
│ +
│ +def scenario_b(script: pathlib.Path) -> tuple[bool, str]:
│ +    mirror = make_mirror()
│ +    (mirror / "content" / "lt" / "grade-01" / "index.json").unlink()
│ +    rc, out = run(mirror / "scripts" / "check_published.py", ["--grade", "1", "--json", "--no-bytes"])
│ +    try:
│ +        data = json.loads(out)
│ +    except json.JSONDecodeError:
│ +        return False, f"rc={rc} · JSON neperskaitytas: {out[:160]}"
│ +    reasons = data.get("verdict", {}).get("reasons", [])
│ +    blames_live = any("gyva svetainė" in r for r in reasons)
│ +    names_repo = any("repo" in r for r in reasons)
│ +    ok = rc == 1 and names_repo and not blames_live
│ +    return ok, f"rc={rc} · reasons={reasons} · live_error={data.get('live_error')!r} · repo_error={data.get('repo_error')!r}"
│ +
│ +
│ +def main() -> int:
│ +    ap = argparse.ArgumentParser()
│ … omitted 23 diff line(s) across 1 additional file(s)/section(s)
│ scripts/check_published.py
│ @@ -109,6 +109,23 @@
│    o trūkstamas repo failas rodomas kaip `LŪŽĘS INDEKSAS` su gyvos pusės
│    matavimu (`head_state()`): ar svetainėje failas yra. Neišmatuotas dydis
│    lieka `-1` ir pranešamas žodžiais, ne kaip „0 B“.
│ +
│ +2026-11-19 (paleidimas #374): pranešimas nebeteigia to, ko nebuvo matuota.
│ +  Du defektai, kuriuos rado zondas `probe.py` (`--expect old` → 2/2, t. y.
│ +  abu dar buvo):
│ +  - `--no-bytes` režimas sąmoningai **nelygina** baitų, bet sėkmės eilutė
│ +    iki šiol sakydavo „sutampa (ID, seka, modulių ir pagrindinių failų
│ +    baitai, svetainės kodas 0 failų)“. Nei baitai, nei kodas nebuvo
│ +    lyginti, o „0 failų“ yra ne matavimas, o praleista dalis. Greitas
│ +    rankinis bėgimas taip tapdavo „įrodymu“, kurio nebuvo (LL-37/LL-10).
│ +    Dabar `report()` grąžina `bytes_checked`, o eilutė sako „dalinė
│ +    patikra“ ir išvardija, kas NETIKRINTA.
│ +  - Sulaužytas **repo** indeksas (`content/lt/grade-01/index.json`
│ +    neperskaitomas) buvo rašomas į `live_error`, o `verdict()` iš to darė
│ +    „gyva svetainė nepasiekiama“. Veidrodis be indekso davė rc 1 su klaida
│ +    apie svetainę, nors svetainė sveika, o taisyti reikia repo failą
│ +    (LL-21). Dabar `check_grade()` tokį atvejį rašo į `repo_error`, o
│ +    `verdict()` pirmoji priežastis — „repo indekso nepavyko perskaityti“.
│
│  Naudojimas:
│      python3 scripts/check_published.py               # žmogui
│ scripts/check_published.py
│ @@ -613,12 +613,18 @@
│
│  def check_grade(grade: int, compare_bytes: bool = True) -> dict:
│      gd = grade_dir(grade)
│ -    out: dict = {"grade": grade, "live_error": ""}
│ +    # `repo_error` ir `live_error` yra skirtingi dalykai: pirmasis reiškia,
│ +    # kad įrankis nemato **repo** indekso (taisyti reikia failą), antrasis —
│ +    # kad neatsiliepia gyva svetainė. Iki #374 abu ėjo į `live_error`, o
│ +    # `verdict()` iš to darė „gyva svetainė nepasiekiama“: veidrodis be
│ +    # `grade-01/index.json` skelbė klaidą apie svetainę, nors svetainė sveika
│ +    # (LL-21 — teiginys apie priežastį, kurios niekas neperskaitė).
│ +    out: dict = {"grade": grade, "live_error": "", "repo_error": ""}
│
│      try:
│          data, files = local_index(grade)
│      except (OSError, json.JSONDecodeError) as exc:
│ -        out["live_error"] = f"repo index: {type(exc).__name__}: {exc}"
│ +        out["repo_error"] = f"repo {gd}/index.json: {type(exc).__name__}: {exc}"
│          return out
│      local_ids = [m["id"] for s in data.get("strands", []) for m in s.get("modules", [])]
│
│ scripts/check_published.py
│ @@ -770,6 +770,7 @@
│          return out
│
│      live_errors = [f"{grade_dir(g['grade'])}: {g['live_error']}" for g in per_grade if g.get("live_error")]
│ +    repo_errors = [f"{grade_dir(g['grade'])}: {g['repo_error']}" for g in per_grade if g.get("repo_error")]
│
│      # Svarbiausias failas, kurio modulio baitų ciklas neapima: garso manifestas.
│      # Jo stagnacija reiškia 404 naujo modulio garsui, o visi kiti vartai žali.
│ scripts/check_published.py
│ @@ -841,6 +841,10 @@
│          "retried_requests": RETRIES["count"],
│          "last_commit": last_commit(),
│          "live_error": "; ".join(live_errors),
│ +        "repo_error": "; ".join(repo_errors),
│ +        # Ką šis bėgimas **iš tikrųjų** matavo. Be šio lauko `--no-bytes`
│ +        # sėkmės eilutė skelbė baitų lygybę, kurios niekas netikrino (#374).
│ +        "bytes_checked": compare_bytes,
│      }
│      # Sprendimas keliauja kartu su duomenimis: dashboard'as neperrašo taisyklės
│      # savo (LL-10 — būsena iš to paties šaltinio, iš kurio imamas rc).
│ scripts/check_published.py
│ @@ -863,6 +863,11 @@
│      rezultatą.
│      """
│      reasons: list[str] = []
│ +    # Repo klaida — pirmoji, nes ji yra šaknis: kol įrankis nemato klasės
│ +    # indekso, jokia išvada apie svetainę negalioja. #374: anksčiau šis
│ +    # atvejis virsdavo „gyva svetainė nepasiekiama“ ir siuntė taisyti ne to.
│ +    if data.get("repo_error"):
│ +        reasons.append("repo indekso nepavyko perskaityti")
│      if data.get("live_error"):
│          reasons.append("gyva svetainė nepasiekiama")
│      if data.get("missing_on_live"):
│ scripts/check_published.py
│ @@ -959,6 +959,11 @@
│      print(f"Paskelbta:    {data['published']} moduliai")
│      for g in data["grades"]:
│          print(f"  · {grade_dir(g['grade'])}: repo {g.get('local', 0)}, gyvai {g.get('published', 0)}")
│ +    if data["repo_error"]:
│ +        # Ne „svetainė nepasiekiama“: įrankis nemato repo indekso, o be jo
│ +        # bet kokia išvada apie svetainę yra spėjimas (#374).
│ +        print(f"REPO INDEKSAS NEPERSKAITYTAS: {data['repo_error']}")
│ +        print("  Taisyk repo failą — publikavimas čia nieko nepakeis.")
│      if data["live_error"]:
│          print(f"Gyvos svetainės klaida: {data['live_error']}")
│      if data["missing_on_live"]:
│ scripts/check_published.py
│ @@ -1066,9 +1066,16 @@
│          # Ne klaida, bet svarbu: jei svetainė flakuoja, skaičius auga.
│          print(f"Užklausos, kartotos po laikinos klaidos: {data['retried_requests']}")
│      if not problems(data):
│ -        print(f"✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, "
│ -              f"svetainės kodas {data.get('shell_count', 0)} failų"
│ -              f"{', versija ' + data['live_version'] if data.get('live_version') else ''}).")
│ +        if data.get("bytes_checked", True):
│ +            print(f"✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, "
│ +                  f"svetainės kodas {data.get('shell_count', 0)} failų"
│ +                  f"{', versija ' + data['live_version'] if data.get('live_version') else ''}).")
│ +        else:
│ +            # `--no-bytes` sąmoningai nelygina baitų, kodo ir garso. Iki #374
│ +            # ši eilutė vis tiek sakydavo „baitai“ ir „svetainės kodas 0 failų“,
│ +            # t. y. pranešdavo apie matavimą, kurio nebuvo (LL-37).
│ +            print("✔ ID ir seka sutampa — DALINĖ PATIKRA: modulių baitai, pagrindinių failų baitai, "
│ +                  "svetainės kodas ir garsas NETIKRINTI (--no-bytes).")
│
│      return 1 if problems(data) else 0
│
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub374/probe.py
│ @@ -53,8 +53,8 @@
│      rc, out = run(script, ["--grade", "1", "--no-bytes"])
│      line = [ln for ln in out.splitlines() if ln.startswith("✔") or ln.startswith("x")]
│      text = line[0] if line else out.strip().splitlines()[-1]
│ -    claims_bytes = "baitai" in text or "bait" in text
│ -    says_partial = "NETIKRINT" in text.upper()
│ +    claims_bytes = "Repo ir gyva svetainė sutampa" in text
│ +    says_partial = "DALINĖ PATIKRA" in text and "NETIKRINTI" in text
│      ok = rc == 0 and not claims_bytes and says_partial
│      return ok, f"rc={rc} · {text}"
│
│ scripts/check_published.py
│ @@ -630,6 +630,7 @@
│
│      live_ids: list[str] = []
│      live_seq: list[str] = []
│ +    live_index_ok = False
│      for name in ("index.json", "path.json"):
│          blob = fetch(f"{LIVE_ROOT}content/lt/{gd}/{name}")
│          if blob is None:
│ @@ -638,13 +639,24 @@
│          if name == "index.json":
│              live_data = json.loads(blob.decode("utf-8"))
│              live_ids = [m["id"] for s in live_data.get("strands", []) for m in s.get("modules", [])]
│ +            live_index_ok = True
│          else:
│              live_seq = list(json.loads(blob.decode("utf-8")).get("sequence", []))
│
│ +    out["live_index_ok"] = live_index_ok
│      out["local"] = len(local_ids)
│      out["published"] = len(live_ids)
│ -    out["missing_on_live"] = [m for m in local_ids if m not in live_ids]
│ -    out["hidden_locally"] = [m for m in live_ids if m not in local_ids]
│ +    if live_index_ok:
│ +        out["missing_on_live"] = [m for m in local_ids if m not in live_ids]
│ +        out["hidden_locally"] = [m for m in live_ids if m not in local_ids]
│ +    else:
│ +        # Gyvo indekso nematėme, tad bet kuris sąrašas būtų teiginys apie
│ +        # neperskaitytą svetainę. #374: svetainės gedimas atspausdindavo
│ +        # „NESKELBTA (45)“ — t. y. visą klasę „nepaskelbta“ — nors nebuvo
│ +        # perskaitytas nė vienas gyvas failas (LL-37). Sprendimą neša
│ +        # `live_error` (`verdict()` → rc 1), o ne išgalvotas sąrašas.
│ +        out["missing_on_live"] = []
│ +        out["hidden_locally"] = []
│
│      # LL-88: abi dabartys gali sutapti, o ID vis tiek gali būti dingęs.
│      # Nuo to priklauso vaiko `localStorage` žyma, todėl tikrinama ne tik
Sustabdyta dėl žingsnių limito. Darbas repo faile jau įrašytas — tai ne tuščias paleidimas.

## Ką pakeičiau (`scripts/check_published.py`)

Trys tos pačios šeimos defektai: įrankis pranešdavo daugiau, negu išmatavo (LL-37/LL-21/LL-10).

1. **`--no-bytes` klaidingai skelbė baitų lygybę.** Režimas sąmoningai nelygina baitų, kodo ir garso, o sėkmės eilutė sakydavo „sutampa (ID, seka, modulių ir pagrindinių failų **baitai**, svetainės kodas **0 failų**)". „0 failų“ — ne matavimas, o praleista dalis. Dabar `report()` grąžina `bytes_checked`, o eilutė sako `DALINĖ PATIKRA: ... NETIKRINTI`.

2. **Sulaužytas repo indeksas buvo vadinamas „gyva svetainė nepasiekiama“.** `check_grade()` klaidą rašydavo į `live_error`, o `verdict()` iš to darydavo kaltinimą svetainei. Dabar atskiras `repo_error`, `verdict()` pirmoji priežastis — „repo indekso nepavyko perskaityti“, spausdinamas `REPO INDEKSAS NEPERSKAITYTAS` su nurodymu taisyti indeksą, ne publikavimą.

3. **Svetainės gedimas virsdavo „NESKELBTA (45)“.** Trys pataisymai įrašyti, bet **nebaigti**: `check_grade()` dabar turi `live_index_ok`, o kai gyvo indekso nematė — `missing_on_live`/`hidden_locally` tušti. Dar liko: `report()` `published_measured` laukas, spausdintuvo eilutė „Paskelbta: neišmatuota“, ir `if compare_bytes and live_index_ok:` byte cikle.

## Įrodymas (realūs paleidimai)

Zondas `~/.hermes/profiles/deepseek41flash/cache/scratch/pub374/probe.py`:
- **Prieš taisymą** (`--expect old`): 2/2 — A: `✔ ... baziai, svetainės kodas 0 failų`; B: `reasons=['gyva svetainė nepasiekiama']`, `repo_error=None`.
- **Po taisymo** (`--expect new`): 2/2 — A: `DALINĖ PATIKRA ... NETIKRINTI`; B: `reasons=['repo indekso nepavyko perskaityti']`, `live_error=''`.
- Neigiama kontrolė tikra: `git stash` → senoji versija vėl duoda `old` 2/2, `git stash pop` grąžino pataisymus.
- Gyvos svetainės kelias nelūžo: `SUPRASK_LIVE_ROOT=http://127.0.0.1:9/` → `Gyvos svetainės klaida`, rc 1, jokios repo eilutės.
- `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų; `py_compile` OK.

## `check_published.py` išvestis prieš gyvą svetainę

```
Repozitorija: 45 moduliai
Paskelbta:    45 moduliai
  · grade-01: repo 45, gyvai 45
Pervadinti ID: 03-sakinio-tvarka → 03-sakinio-zodziai (žyma perkeliama)
Garsas: patikrinta 1332 iš 1332 (visi) — visi pasiekiami
✔ ... sutampa (ID, seka, baitai, kodas 18 failų, versija cc0225db)
```

HTTP kodai (3 moduliai): `200 matematika/04-skaiciu-tiese`, `200 lietuviu-kalba/01-garsas-ir-raide`, `200 pasaulio-pazinimas/08-metu-laikai`.

## Sprendimas

**ištaisyta** — `scripts/check_published.py`. Repo ir gyva svetainė sutampa (45/45); neskelbtų modulių, dingusių ID, `hidden_locally` nėra, todėl vaiko `localStorage` pažangai niekas negresia.

## LIKO NEĮRAŠYTA (žingsniai, ne failas)

1. Užbaigti 3-ią pataisymą: `report()` `published_measured`, spausdintuvo „Paskelbta: neišmatuota“, `if compare_bytes and live_index_ok:` byte cikle; po to patikrinti, kad `--no-bytes` su gandingu svetainės adresu nebespausdina „NESKELBTA (45)“, ir kad pilnas bėgimas prieš gyvą svetainę lieka žalias.
2. `research/wiki/changelog.md` — #374 eilutė su skaičiais (repo 45 / paskelbta 45).
3. `research/wiki/guidelines/pamokos.md` — **LL-119** (LL-118 yra paskutinė): „Pranešimas, kuris aprašo neįvykusią patikrą“ — Simptomas / Priežastis / Taisyklė / Patikra, įrodymas `pub374/probe.py` 2/2 prieš ir 2/2 po.
4. `agents/state.json` blokas `last_publish_check_374` (failas `.gitignore`, repo nepatenka).

Niekeio nešalinau, jokio modulio ID nepernumeravau, `content/**`, `assets/**`, `docs/**`, `AGENTS.md` neliečiau.

## klaidos

```
session_id: local-d258a6459d7cc5b65b583900dd1d52f6439f03f7e1992e3f942706bc07926eaf
```
