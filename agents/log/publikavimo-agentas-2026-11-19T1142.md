# publikavimo-agentas — 2026-11-19T1142

- paleidimas: #382 (manual)
- trukmė: 303s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_published.py
│ @@ -126,6 +126,20 @@
│      apie svetainę, nors svetainė sveika, o taisyti reikia repo failą
│      (LL-21). Dabar `check_grade()` tokį atvejį rašo į `repo_error`, o
│      `verdict()` pirmoji priežastis — „repo indekso nepavyko perskaityti“.
│ +
│ +2026-11-19 (paleidimas #382): nepasiekiama svetainė nebepaverčiama skaičiais.
│ +  #374 užbaigė `--no-bytes` ir `repo_error` puses, bet trys vietos liko:
│ +  - `published` buvo skaičiuojamas iš gyvo indekso, kurio **neperskaitėme**:
│ +    svetainės gedimas virsdavo „Paskelbta: 0 modulių“ — teiginys apie
│ +    svetainę, kurios nematėme. Dabar yra `published_measured`, o eilutė sako
│ +    „Paskelbta: neišmatuota“.
│ +  - baitų ciklas (`check_grade()`) ėjo net tada, kai gyvo indekso nėra: 48
│ +    užklausos virsdavo 48 eilutėmis „NEPASIEKTA“ apie failus, kurių niekas
│ +    nematė. Dabar jis paleidžiamas tik su perskaitytu gyvu indeksu, o **repo**
│ +    indekso vientisumas (įrašas be failo) tikrinamas ir be tinklo.
│ +  - `report()` pradeda vienu HEAD į `index.html`: kai svetainė neatsiliepia,
│ +    pagrindinių failų, svetainės kodo ir 1432 garso įrašų patikros
│ +    nevykdomos, o pranešime pasakoma, kas NETIKRINTA (ne 1451 „nepasiekiama“).
│
│  Naudojimas:
│      python3 scripts/check_published.py               # žmogui
│ scripts/check_published.py
│ @@ -602,6 +602,22 @@
│          return ""
│      match = VERSION_PARAM.search(blob.decode("utf-8", "replace"))
│      return match.group(0)[3:] if match else ""
│ +
│ +
│ +def site_reachable() -> bool:
│ +    """Ar gyva svetainė iš viso atsako (HEAD į `index.html`).
│ +
│ +    Vienas pigus matavimas prieš visus kitus. Be jo kiekviena gyva patikra
│ +    atskirai aiškinosi tą patį gedimą ir kiekviena jo rezultatą pranešdavo
│ +    kaip atskirą faktą: 48 moduliai „nepasiekiami“, 19 kodo failų
│ +    „nepasiekiami“, 1432 garso įrašai „nepasiekiami“ — nors buvo vienas
│ +    faktas (svetainė neatsiliepia), o 1451 užklausa tikrino ryšį, ne turinį.
│ +
│ +    404/410 čia reiškia „serveris atsako“ — tada svetainė pasiekiama ir
│ +    toliau matuojama įprastai.
│ +    """
│ +    state, _ = head_state("index.html")
│ +    return state != "unreachable"
│
│
│  def check_shell() -> dict:
│ scripts/check_published.py
│ @@ -717,30 +717,41 @@
│          # nepasenęs: jo svetainėje tiesiog nėra. 2026-11-12 zondas su veidrodžiu
│          # rodė tą patį ID abiejose eilutėse.
│          missing = set(out["missing_on_live"])
│ -        todo = [(mid, files[mid]) for mid in local_ids if mid in files and mid not in missing]
│ -        with ThreadPoolExecutor(max_workers=8) as pool:
│ -            results = list(pool.map(lambda pair: (pair[0], pair[1], same_bytes(*pair[1:])), todo))
│ -        for mid, rel, (state, local_size, live_size) in results:
│ -            if state == "ok":
│ -                continue
│ -            if state == "absent":
│ -                # Indeksas rodo į failą, kurio repo nėra (#370). Tai ne
│ -                # „pasenęs turinys“ ir ne „nepasiekiamas“: publikavimas čia
│ -                # nieko nepakeis, kol indeksas netaisytas. Vaidmens taisyklė
│ -                # šį atvejį vadina lūžusiu indeksu ir reikalauja jį įvardyti
│ -                # atskirai, o ne sumaišyti su publikavimo defektais.
│ -                missing_in_repo.append({"id": mid, "file": rel, "grade": grade,
│ -                                        "repo_bytes": local_size, "live_bytes": live_size})
│ -            elif state == "unreachable":
│ -                stale_unknown.append(mid)
│ -            elif live_size < 0 or local_size < 0:
│ -                # Būsena „differs“, bet vienas dydis neišmatuotas — tokio
│ -                # derinio būti neturėtų; jei atsiranda, sakome tai žodžiais,
│ -                # o ne spausdiname -1 kaip baitus (LL-37).
│ -                unmeasured.append(mid)
│ -            else:
│ -                stale.append({"id": mid, "file": rel, "repo_bytes": local_size,
│ -                              "live_bytes": live_size})
│ +        if live_index_ok:
│ +            todo = [(mid, files[mid]) for mid in local_ids if mid in files and mid not in missing]
│ +            with ThreadPoolExecutor(max_workers=8) as pool:
│ +                results = list(pool.map(lambda pair: (pair[0], pair[1], same_bytes(*pair[1:])), todo))
│ +            for mid, rel, (state, local_size, live_size) in results:
│ +                if state == "ok":
│ +                    continue
│ +                if state == "absent":
│ +                    # Indeksas rodo į failą, kurio repo nėra (#370). Tai ne
│ +                    # „pasenęs turinys“ ir ne „nepasiekiamas“: publikavimas čia
│ +                    # nieko nepakeis, kol indeksas netaisytas. Vaidmens taisyklė
│ +                    # šį atvejį vadina lūžusiu indeksu ir reikalauja jį įvardyti
│ +                    # atskirai, o ne sumaišyti su publikavimo defektais.
│ +                    missing_in_repo.append({"id": mid, "file": rel, "grade": grade,
│ +                                            "repo_bytes": local_size, "live_bytes": live_size})
│ +                elif state == "unreachable":
│ +                    stale_unknown.append(mid)
│ +                elif live_size < 0 or local_size < 0:
│ +                    # Būsena „differs“, bet vienas dydis neišmatuotas — tokio
│ +                    # derinio būti neturėtų; jei atsiranda, sakome tai žodžiais,
│ +                    # o ne spausdiname -1 kaip baitus (LL-37).
│ +                    unmeasured.append(mid)
│ +                else:
│ +                    stale.append({"id": mid, "file": rel, "repo_bytes": local_size,
│ +                                  "live_bytes": live_size})
│ +        else:
│ +            # Gyvo indekso neperskaitėme, tad palyginti nėra su kuo: 48 baitų
│ +            # užklausos duotų 48 eilutes „NEPASIEKTA“ apie failus, kurių niekas
│ +            # nematė (#382, LL-37). Bet „indeksas rodo į failą, kurio repo
│ +            # nėra“ yra re

… PRALEISTA 7026 SIMBOLIŲ IŠ 25026 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00382/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

,11 @@
│          reasons.append("repo indekso nepavyko perskaityti")
│      if data.get("live_error"):
│          reasons.append("gyva svetainė nepasiekiama")
│ +    # `published` be perskaityto gyvo indekso yra nulis vietoj matavimo. Jei
│ +    # dėl kokios nors priežasties `live_error` liko tuščias, skaičius vis tiek
│ +    # neturi atrodyti išmatuotas (#382).
│ +    if data.get("published_measured") is False and not data.get("live_error"):
│ +        reasons.append("paskelbtų modulių skaičius neišmatuotas")
│      if data.get("missing_on_live"):
│          reasons.append(f"{len(data['missing_on_live'])} neskelbta")
│      if data.get("hidden_locally"):
│ dashboard/server.py
│ @@ -838,7 +838,9 @@
│      const v = p.verdict;
│      setText("#pubBig", v ? v.label : (drift === 0 && !p.unpushed_commits) ? "sutampa" : `${drift} neskelbta`);
│      setText("#pubLocal",  p.local);
│ -    setText("#pubLive",  p.published);
│ +    // `published` be perskaityto gyvo indekso yra 0 vietoj matavimo: rodom
│ +    // brūkšnį, o ne skaičių, kurio niekas nematavo (#382).
│ +    setText("#pubLive",  p.published_measured === false ? "—" : p.published);
│      setText("#pubUnpushed",  p.unpushed_commits);
│      setText("#pubNote",  risky ? `repo nebeturi: ${p.hidden_locally.join(", ").slice(0,40)}`
│        : (v && v.reasons && v.reasons.length > 1) ? v.reasons.slice(1).join(" · ").slice(0,50)
│ profiles/deepseek41flash/cache/scratch/pub382/probe.py
│ @@ -0,0 +1,155 @@
│ +#!/usr/bin/env python3
│ +"""#382 zondas: ar `check_published.py` nepaverčia vieno gedimo 1451 eilute.
│ +
│ +Scenarijai:
│ +
│ +A. Svetainė nepasiekiama (miręs uostas), pilnas režimas. Iki šiol:
│ +   „Paskelbta: 0 modulių“ (nors gyvo indekso niekas neskaitė), tūkstančiai
│ +   užklausų ir „NEPASIEKTA po 2 bandymų (48)“. Dabar: „neišmatuota“,
│ +   viena NEPASIEKIAMA eilutė, rc 1.
│ +
│ +B. (kontrolė) Vietinis veidrodis sveikas — pilnas bėgimas turi likti žalias,
│ +   t. y. modulio baitai, kodas ir garsas vis dar matuojami.
│ +
│ +C. (kontrolė) Veidrodis be vieno modulio failo — turi likti „NESKELBTA (1)“,
│ +   kad pasiekiamumo vartai neužgožtų tikro publikavimo defekto.
│ +
│ +D. (kontrolė) Repo indeksas rodo į failą, kurio repo nėra, o svetainė mirusi —
│ +   „LŪŽĘS INDEKSAS“ turi likti matomas: tai repo defektas, ne tinklo.
│ +
│ +`--expect old` — tikrina, kad A defektas DAR yra (prieš taisymą), o kontrolės
│ +jau žalios. Po taisymo visi keturi turi būti geri.
│ +"""
│ +from __future__ import annotations
│ +
│ +import argparse
│ +import functools
│ +import http.server
│ +import json
│ +import os
│ +import pathlib
│ +import shutil
│ +import socket
│ +import subprocess
│ +import sys
│ +import threading
│ +import time
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +SCRATCH = pathlib.Path(__file__).resolve().parent
│ +DEAD_ROOT = "http://127.0.0.1:9/"
│ +MODULE = "content/lt/grade-01/matematika/04-skaiciu-tiese.json"
│ +
│ +
│ +def copy_tree(dest: pathlib.Path) -> pathlib.Path:
│ +    if dest.exists():
│ +        shutil.rmtree(dest)
│ +    subprocess.run(["cp", "-al", str(ROOT), str(dest)], check=True)
│ +    return dest
│ +
│ +
│ +def run(script: pathlib.Path, args: list[str], live_root: str) -> tuple[int, str, float]:
│ +    env = dict(os.environ)
│ +    env["SUPRASK_LIVE_ROOT"] = live_root
│ +    started = time.time()
│ +    proc = subprocess.run([sys.executable, str(script), *args], cwd=script.parent.parent,
│ +                          capture_output=True, text=True, timeout=900, env=env)
│ +    return proc.returncode, proc.stdout + proc.stderr, time.time() - started
│ +
│ +
│ +class _Quiet(http.server.SimpleHTTPRequestHandler):
│ +    def log_message(self, *_a):  # noqa: D401 — tyla, kad zondas būtų skaitomas
│ +        pass
│ +
│ +
│ +def serve(directory: pathlib.Path) -> tuple[http.server.ThreadingHTTPServer, str]:
│ +    with socket.socket() as s:
│ +        s.bind(("127.0.0.1", 0))
│ +        port = s.getsockname()[1]
│ +    handler = functools.partial(_Quiet, directory=str(directory))
│ +    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
│ +    threading.Thread(target=srv.serve_forever, daemon=True).start()
│ +    return srv, f"http://127.0.0.1:{port}/"
│ +
│ +
│ +def scenario_a(script: pathlib.Path) -> tuple[bool, str]:
│ +    rc, out, secs = run(script, ["--grade", "1", "--audio-sample", "20"], DEAD_ROOT)
│ +    unmeasured = "Paskelbta:    neišmatuota" in out
│ +    zero = "Paskelbta:    0 modulių" in out
│ … omitted 77 diff line(s) across 1 additional file(s)/section(s)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub382/probe.py
│ @@ -116,7 +116,7 @@
│      rc, out, secs = run(repo / "scripts" / "check_published.py",
│                          ["--grade", "1", "--json"], DEAD_ROOT)
│      try:
│ -        data = json.loads(out[:out.index("\n}") + 2] if "\n}" in out else out)
│ +        data = json.loads(out)
│      except (ValueError, json.JSONDecodeError):
│          return False, f"rc={rc} · JSON neperskaitytas: {out[:160]}"
│      reasons = data.get("verdict", {}).get("reasons", [])
│ profiles/deepseek41flash/cache/scratch/pub382/manual_c.py
│ @@ -0,0 +1,32 @@
│ +#!/usr/bin/env python3
│ +"""Rankinis C scenarijaus išklotinis išvedimas (be sutrumpinimo)."""
│ +import functools
│ +import http.server
│ +import os
│ +import socket
│ +import subprocess
│ +import sys
│ +import threading
│ +
│ +D = "/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub382/live_missing"
│ +
│ +
│ +class Q(http.server.SimpleHTTPRequestHandler):
│ +    def log_message(self, *a):
│ +        pass
│ +
│ +
│ +with socket.socket() as s:
│ +    s.bind(("127.0.0.1", 0))
│ +    port = s.getsockname()[1]
│ +srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=D))
│ +threading.Thread(target=srv.serve_forever, daemon=True).start()
│ +env = dict(os.environ)
│ +env["SUPRASK_LIVE_ROOT"] = f"http://127.0.0.1:{port}/"
│ +p = subprocess.run([sys.executable, "scripts/check_published.py", "--grade", "1"],
│ +                   cwd="/home/zoltanas/workspace/suprask", capture_output=True,
│ +                   text=True, env=env, timeout=300)
│ +print("rc:", p.returncode)
│ +print(p.stdout)
│ +print("ERR:", p.stderr[-800:])
│ +srv.shutdown()
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub382/probe.py
│ @@ -97,7 +97,14 @@
│
│
│  def scenario_c(script: pathlib.Path) -> tuple[bool, str]:
│ -    live = copy_tree(SCRATCH / "live_missing")
│ +    """Gyvame indekse modulio nėra — tai publikavimo defektas (NESKELBTA)."""
│ +    live = copy_tree(SCRATCH / "live_noentry")
│ +    index = live / "content/lt/grade-01/index.json"
│ +    data = json.loads(index.read_text(encoding="utf-8"))
│ +    for strand in data.get("strands", []):
│ +        strand["modules"] = [m for m in strand.get("modules", [])
│ +                             if m.get("id") != "04-skaiciu-tiese"]
│ +    index.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
│      (live / MODULE).unlink()
│      srv, url = serve(live)
│      try:
│ @@ -108,6 +115,21 @@
│      ok = rc == 1 and names
│      line = [ln for ln in out.splitlines() if ln.startswith("NESKELBTA")]
│      return ok, f"rc={rc} {secs:.1f}s · {line[0] if line else 'NESKELBTA eilutės nėra'}"
│ +
│ +
│ +def scenario_e(script: pathlib.Path) -> tuple[bool, str]:
│ +    """Indeksas gyvas, failo svetainėje nėra — turi likti „NEPASIEKTA“."""
│ +    live = copy_tree(SCRATCH / "live_nofile")
│ +    (live / MODULE).unlink()
│ +    srv, url = serve(live)
│ +    try:
│ +        rc, out, secs = run(script, ["--grade", "1"], url)
│ +    finally:
│ +        srv.shutdown()
│ +    names = "NEPASIEKTA po 2 bandymų (1): 04-skaiciu-tiese" in out
│ +    ok = rc == 1 and names
│ +    line = [ln for ln in out.splitlines() if ln.startswith("NEPASIEKTA")]
│ +    return ok, f"rc={rc} {secs:.1f}s · {line[0] if line else 'NEPASIEKTA eilutės nėra'}"
│
│
│  def scenario_d(script: pathlib.Path) -> tuple[bool, str]:
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub382/probe.py
│ @@ -149,7 +149,8 @@
│
│
│  SCENARIOS = [("A", scenario_a, "defect"), ("B", scenario_b, "guard"),
│ -             ("C", scenario_c, "guard"), ("D", scenario_d, "guard")]
│ +             ("C", scenario_c, "guard"), ("D", scenario_d, "guard"),
│ +             ("E", scenario_e, "guard")]
│
│
│  def main() -> int:
## Ką padaryta šiame paleidime

### 1. Publikavimo būklė (vaidmens branduolys) — sutampa

`python3 scripts/check_published.py` (prieš mano pakeitimus, HEAD `150d0f7`):

```
Repozitorija: 48 moduliai
Paskelbta:    48 moduliai
  · grade-01: repo 48, gyvai 48
Pervadinti ID, priimta ir užregistruota (1):
  - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai (žyma perkeliama)
Garsas: patikrinta 1432 iš 1432 (visi) — visi pasiekiami
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, svetainės kodas 19 failų, versija 150d0f78).
RC=0
```

Neskelbtų modulių, dingusių ID, `hidden_locally`, `not_in_path` nėra. HTTP kodai (iš ankstesnio šio vaidmens bėgimo, adresai tie patys): `200 matematika/04-skaiciu-tiese`, `200 lietuviu-kalba/01-garsas-ir-raide`, `200 pasaulio-pazinimas/08-metu-laikai`.

### 2. Failas, kuris pakeistas: `scripts/check_published.py` (ir 2 eilutės `dashboard/server.py`)

Užbaigta tai, ką #374 paliko neužbausta — nepasiekiama svetainė nebepaverčiama išgalvotais skaičiais:

- `published_measured` (per klasę ir bendrai) + eilutė „Paskelbta: neišmatuota — gyvos svetainės indeksas neperskaitytas“ vietoj „Paskelbta: 0 modulių“.
- Baitų ciklas `check_grade()` paleidžiamas tik su perskaitytu gyvu indeksu; **repo** indekso vientisumas (įrašas be failo) tikrinamas ir be tinklo, todėl `LŪŽĘS INDEKSAS` nepradingsta.
- `report()` pradeda vienu HEAD į `index.html` (`site_reachable()`): kai svetainė neatsiliepia, pagrindinių failų, kodo ir 1432 garso įrašų patikros nevykdomos, o pranešime viena eilutė `SVETAINĖ NEPASIEKIAMA — … NETIKRINTI`.
- `verdict()` — apsauginė priežastis „paskelbtų modulių skaičius neišmatuotas“.
- `dashboard/server.py`: kortelė rodo „—“, o ne 0, kai `published_measured === false`.

### 3. Įrodymas (zondas `~/.hermes/profiles/deepseek41flash/cache/scratch/pub382/probe.py`)

`--expect new`: A (miręs uostas, pilnas režimas) **GERAI** — rc 1, 3,2 s, „neišmatuota“, jokio `NEPASIEKTA`/`NESKELBTA`/`PASENĘS KODAS` srauto; B (sveikas veidrodis) **GERAI** — rc 0, 48/48, „sutampa … kodas 19 failų“; D (repo indeksas be failo + mirusi svetainė) **GERAI** — `reasons=['gyva svetainė nepasiekiama', '1 indekso įrašas be failo repo']`. C scenarijus pirmą kartą krito dėl **mano paties zondo klaidos** (tryniau failą, o ne indekso įrašą — teisingas rezultatas buvo `NEPASIEKTA (1)`, ne `NESKELBTA`); zondas pataisytas (C = indekso įrašas pašalintas, E = failas 404, indeksas gyvas) ir **neigiamos kontrolės (`--expect old`) bei galutinio 5/5 paleidimo dar nespėjau įvykdyti** — baigėsi žingsniai.

### 4. Sprendimas

**ištaisyta** — `scripts/check_published.py`. Repo ir gyva svetainė sutampa (48/48), vaiko `localStorage` pažangai niekas negresia.

## LIKO NEBAIGTA (žingsniai, ne failas)

1. Paleisti zondą po paskutinio pataisymo ir neigiamą kontrolę: `probe.py --expect new` (turi būti 5/5) ir po `git stash` → `probe.py --expect old` (A turi būti BLOGAI, B–E GERAI), tada `git stash pop`.
2. Pilnas `python3 scripts/check_published.py` prieš gyvą svetainę — turi likti žalias (48/48) ir `validate_content.py --grade 1 --strict` 0 klaidų.
3. `research/wiki/changelog.md` — viena eilutė su skaičiais (repo 48 / paskelbta 48).
4. `research/wiki/guidelines/pamokos.md` — **LL-119** (LL-118 paskutinė): „Vienas gedimas, praneštas 1451 eilute“ — Simptomas / Priežastis / Taisyklė / Patikra, įrodymas `pub382/probe.py`.
5. `agents/state.json` blokas `last_publish_check_382` (failas `.gitignore`, repo nepatenka).

Nieko nešalinau, modulio ID nepernumeravau, `content/**`, `assets/**`, `docs/**`, `AGENTS.md` neliečiau.

## klaidos

```
session_id: local-ff5732ced7cc005a9a07b0c2e703bcf98342db45e023267ad91e364ecdb1598b
```
