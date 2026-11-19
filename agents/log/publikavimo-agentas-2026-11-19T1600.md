# publikavimo-agentas — 2026-11-19T1600

- paleidimas: #386 (manual)
- trukmė: 315s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub386/mirror.py
│ @@ -0,0 +1,58 @@
│ +#!/usr/bin/env python3
│ +"""Veidrodis check_published.py zondams.
│ +
│ +Nukopijuoja index.html, assets/ ir content/ i laikina kataloga, tada leidzia
│ +`python3 -m http.server` ir grąžina URL. Scenarijus keiciamas po kopijavimo.
│ +"""
│ +from __future__ import annotations
│ +
│ +import functools
│ +import http.server
│ +import pathlib
│ +import shutil
│ +import socket
│ +import socketserver
│ +import threading
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +COPY = ["index.html", "404.html", "assets", "content"]
│ +
│ +
│ +def make_mirror(dest: pathlib.Path) -> pathlib.Path:
│ +    if dest.exists():
│ +        shutil.rmtree(dest)
│ +    dest.mkdir(parents=True)
│ +    for name in COPY:
│ +        src = ROOT / name
│ +        if src.is_dir():
│ +            shutil.copytree(src, dest / name)
│ +        elif src.exists():
│ +            shutil.copy2(src, dest / name)
│ +    return dest
│ +
│ +
│ +class Server:
│ +    def __init__(self, directory: pathlib.Path):
│ +        handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(directory))
│ +        handler.log_message = lambda *a, **k: None
│ +        socketserver.TCPServer.allow_reuse_address = True
│ +        self.httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), handler)
│ +        self.port = self.httpd.server_address[1]
│ +        self.thread = threading.Thread(target=self.httpd.serve_forever, daemon=True)
│ +
│ +    def __enter__(self):
│ +        self.thread.start()
│ +        return f"http://127.0.0.1:{self.port}/"
│ +
│ +    def __exit__(self, *exc):
│ +        self.httpd.shutdown()
│ +        self.httpd.server_close()
│ +
│ +
│ +def dead_url() -> str:
│ +    """Uostas, kuriame niekas neklauso: svetainė nepasiekiama."""
│ +    sock = socket.socket()
│ +    sock.bind(("127.0.0.1", 0))
│ +    port = sock.getsockname()[1]
│ +    sock.close()
│ +    return f"http://127.0.0.1:{port}/"
│ profiles/deepseek41flash/cache/scratch/pub386/probe.py
│ @@ -0,0 +1,110 @@
│ +#!/usr/bin/env python3
│ +"""Zondas: ar check_published.py skiria „svetainėje 404“ nuo „nepasiekta“?
│ +
│ +Scenarijai:
│ +  A  sveikas veidrodis                        -> rc 0, sutampa
│ +  B  gyvas index.json rodo modulį, failo nėra -> DEFEKTAS, jei sako „NEPASIEKTA“
│ +  C  gyvas failas pasenęs (kitas turinys)     -> PASENĘS TURINYS
│ +  D  svetainė neatsiliepia (miręs uostas)     -> SVETAINĖ NEPASIEKAMA
│ +  E  gyvas grades.json 404                    -> pagrindinis failas
│ +
│ +Naudojimas:
│ +  python3 probe.py --expect new   # po pataisymo: 5/5 GERAI
│ +  python3 probe.py --expect old   # prieš pataisymą: B turi būti BLOGAI
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
│ +    """Pagrindinis failas (grades.json), kurį svetainė skaito pirmą, 404."""
│ +    make_mirror(WORK)
│ +    (WORK / "content/lt/grades.json").unlink()
│ +    with Server(WORK) as url:
│ +        return run(url)
│ +
│ +
│ +def main() -> int:
│ +    ap = argparse.ArgumentParser()
│ +    ap.add_argument("--expect", choices=["new", "old"], default="new")
│ +    args = ap.parse_args()
│ … omitted 32 diff line(s) across 1 additional file(s)/section(s)
│ scripts/check_published.py
│ @@ -468,6 +468,34 @@
│  RETRIES = {"count": 0}
│
│
│ +def fetch_answer(url: str, timeout: int = 20,
│ +                 attempts: int = FETCH_ATTEMPTS) -> tuple[str, bytes | None]:
│ +    """(būsena, baitai), kur būsena yra `"ok"` | `"missing"` | `"unreachable"`.
│ +
│ +    Atskyrimas atsirado dėl #386: `fetch()` grąžindavo `None` ir 404, ir
│ +    laikinam ryšio gedimui, o `compare()` abu paversdavo „nepasiekta“.
│ +    Svetainė, kurioje modulio failo **nėra**, pranešdavo „NEPASIEKTA po 2
│ +    bandymų“: teiginys apie tinklą, kurio nebuvo — 404 yra atsakymas, ir jo
│ +    net nekartojame. Vaikui skirtumas didelis: 404 reiškia „publikavimas
│ +    nepaleistas / failas nedingo“, o nepasiekiamumas — „bandyk dar kartą“.
│ +    404/410 — galutinis atsakymas, kitos klaidos kartojamos (LL-76, #368).
│ +    """
│ +    for attempt in range(max(1, attempts)):
│ +        try:
│ +            req = urllib.request.Request(url, headers=UA)
│ +            with urllib.request.urlopen(req, timeout=timeout) as resp:
│ +                return "ok", resp.read()
│ +        except urllib.error.HTTPError as exc:
│ +            if exc.code in (404, 410):
│ +                return "missing

… PRALEISTA 2908 SIMBOLIŲ IŠ 20908 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00386/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

 repo baitai, gyvi baitai)."""
│ +    """("ok"|"differs"|"gone"|"unreachable", repo baitai, gyvi baitai)."""
│      local_path = ROOT / rel
│      if not local_path.exists():
│          return "ok", 0, 0
│      local = local_path.read_bytes()
│ -    live = fetch(LIVE_ROOT + rel)
│ +    status, live = fetch_answer(LIVE_ROOT + rel)
│ +    if status == "missing":
│ +        # Svetainė kodo failo neturi: tai nepasibaigęs publikavimas, o ne
│ +        # ryšio klaida (#386, ta pati LL-21 šeima kaip `compare()`).
│ +        return "gone", len(local), -1
│      if live is None:
│          return "unreachable", len(local), -1
│      for attempt in (0, 1):
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub386/mirror.py
│ @@ -31,10 +31,14 @@
│      return dest
│
│
│ +class _Quiet(http.server.SimpleHTTPRequestHandler):
│ +    def log_message(self, *args, **kwargs):
│ +        pass
│ +
│ +
│  class Server:
│      def __init__(self, directory: pathlib.Path):
│ -        handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(directory))
│ -        handler.log_message = lambda *a, **k: None
│ +        handler = functools.partial(_Quiet, directory=str(directory))
│          socketserver.TCPServer.allow_reuse_address = True
│          self.httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), handler)
│          self.port = self.httpd.server_address[1]
│ scripts/check_published.py
│ @@ -743,6 +743,7 @@
│
│      stale: list[dict] = []
│      stale_unknown: list[str] = []
│ +    live_missing: list[dict] = []
│      missing_in_repo: list[dict] = []
│      unmeasured: list[str] = []
│      if compare_bytes:
│ scripts/check_published.py
│ @@ -768,6 +768,14 @@
│                      # atskirai, o ne sumaišyti su publikavimo defektais.
│                      missing_in_repo.append({"id": mid, "file": rel, "grade": grade,
│                                              "repo_bytes": local_size, "live_bytes": live_size})
│ +                elif state == "gone":
│ +                    # Svetainė atsakė 404/410: failo ten nėra, nors indeksas jį
│ +                    # rodo. Tai nepasibaigęs publikavimas, o ne „bandyk dar
│ +                    # kartą“ (#386). Sąrašas atskiras, nes baitų nėra su kuo
│ +                    # lyginti — `live_size` čia `-1`, ir be šios šakos įrašas
│ +                    # nukristų į „neišmatuotas dydis“.
│ +                    live_missing.append({"id": mid, "file": rel, "grade": grade,
│ +                                         "repo_bytes": local_size})
│                  elif state == "unreachable":
│                      stale_unknown.append(mid)
│                  elif live_size < 0 or local_size < 0:
│ scripts/check_published.py
│ @@ -798,6 +798,7 @@
│                                              "repo_bytes": -1, "live_bytes": -1})
│      out["stale"] = stale
│      out["stale_unknown"] = stale_unknown
│ +    out["live_missing"] = live_missing
│      out["missing_in_repo"] = missing_in_repo
│      if unmeasured:
│          out["stale_unmeasured"] = unmeasured
│ scripts/check_published.py
│ @@ -807,6 +807,7 @@
│      # lyginami atskirai — kitaip „ID yra“ nereiškia „svetainė rodo tą patį“.
│      aux_stale: list[dict] = []
│      aux_absent: list[dict] = []
│ +    aux_gone: list[dict] = []
│      if compare_bytes and live_index_ok:
│          for name in ("index.json", "path.json"):
│              url_rel = f"content/lt/{gd}/{name}"
│ @@ -817,10 +818,13 @@
│                      "repo_bytes": local_size, "live_bytes": live_size}
│              if state == "absent":
│                  aux_absent.append(item)
│ +            elif state == "gone":
│ +                aux_gone.append(item)
│              else:
│                  aux_stale.append(item)
│      out["aux_stale"] = aux_stale
│      out["aux_absent"] = aux_absent
│ +    out["aux_gone"] = aux_gone
│      return out
│
│
│ scripts/check_published.py
│ @@ -657,13 +657,19 @@
│          results = list(pool.map(lambda rel: (rel, _shell_state(rel)), files))
│      stale: list[dict] = []
│      unreachable: list[str] = []
│ +    missing: list[str] = []
│      for rel, (state, local_size, live_size) in results:
│          if state == "differs":
│              stale.append({"file": rel, "repo_bytes": local_size, "live_bytes": live_size})
│ +        elif state == "gone":
│ +            # Failo svetainėje nėra (404). Tai nepasibaigęs publikavimas, o ne
│ +            # „nepasiekiamas“ — kitaip pranešimas siųstų tikrinti ryšį (#386).
│ +            missing.append(rel)
│          elif state == "unreachable":
│              unreachable.append(rel)
│      return {
│          "shell_stale": stale,
│ +        "shell_gone": missing,
│          "shell_unreachable": unreachable,
│          "shell_count": len(files),
│          "live_version": live_version(),
│ scripts/check_published.py
│ @@ -951,11 +951,14 @@
│          "stale": merge("stale"),
│          "stale_unknown": merge("stale_unknown"),
│          "stale_unmeasured": merge("stale_unmeasured"),
│ +        "live_missing": merge("live_missing"),
│          "missing_in_repo": merge("missing_in_repo"),
│          "aux_stale": aux_stale,
│          "aux_absent": aux_absent,
│ +        "aux_gone": aux_gone,
│          "audio": audio,
│          "shell_stale": shell["shell_stale"],
│ +        "shell_gone": shell.get("shell_gone", []),
│          "shell_unreachable": shell["shell_unreachable"],
│          "shell_count": shell["shell_count"],
│          "live_version": shell["live_version"],
│ scripts/check_published.py
│ @@ -890,10 +890,11 @@
│      # Jo stagnacija reiškia 404 naujo modulio garsui, o visi kiti vartai žali.
│      aux_stale = list(merge("aux_stale"))
│      aux_absent = list(merge("aux_absent"))
│ +    aux_gone = list(merge("aux_gone"))
│      if live_bytes_ok:
│          for url_rel, local_path in AUX_FILES:
│              # Kontraktas yra būsena, ne boolean: `compare()` grąžina
│ -            # "ok"|"differs"|"absent"|"unreachable". Iki #372 čia buvo
│ +            # "ok"|"differs"|"absent"|"gone"|"unreachable". Iki #372 čia buvo
│              # `if not ok:` — o ne tuščia būsena visada teisinga, tad
│              # pasenęs `manifest.json` / `grades.json` būdavo tyliai
│              # nerodomas (tyli žalia, blogiau nei prieš #370 darbą).
│ @@ -904,6 +905,8 @@
│                      "repo_bytes": local_size, "live_bytes": live_size}
│              if state == "absent":
│                  aux_absent.append(item)
│ +            elif state == "gone":
│ +                aux_gone.append(item)
│              else:
│                  aux_stale.append(item)
│
│ scripts/check_published.py
│ @@ -1033,6 +1033,10 @@
│          reasons.append("dingusių ID patikra neįvyko")
│      if data.get("stale"):
│          reasons.append(f"{len(data['stale'])} pasenęs modulis")
│ +    if data.get("live_missing"):
│ +        # Atsakymas 404, ne laikinas ryšio gedimas. Atskira priežastis, nes
│ +        # taisymas kitas: paleisti publikavimą, o ne bandyti dar kartą (#386).
│ +        reasons.append(f"{len(data['live_missing'])} modulio failo nėra svetainėje")
│      if data.get("stale_unknown"):
│          reasons.append(f"{len(data['stale_unknown'])} nepasiekiamas modulis")
│      if data.get("stale_unmeasured"):
│ scripts/check_published.py
│ @@ -1051,8 +1051,12 @@
│          reasons.append(f"{len(data['aux_stale'])} pasenęs pagrindinis failas")
│      if data.get("aux_absent"):
│          reasons.append(f"{len(data['aux_absent'])} pagrindinis failas be repo kopijos")
│ +    if data.get("aux_gone"):
│ +        reasons.append(f"{len(data['aux_gone'])} pagrindinio failo nėra svetainėje")
│      if data.get("shell_stale"):
│          reasons.append(f"{len(data['shell_stale'])} pasenęs kodas")
│ +    if data.get("shell_gone"):
│ +        reasons.append(f"{len(data['shell_gone'])} svetainės kodo failo nėra")
│      if data.get("shell_unreachable"):
│          reasons.append(f"{len(data['shell_unreachable'])} nepasiekiamas kodas")
│      audio = data.get("audio") or {}
│ scripts/check_published.py
│ @@ -1135,6 +1135,14 @@
│          print(f"PASENĘS TURINYS — ID yra, failas gyvai kitas ({len(data['stale'])}):")
│          for s in data["stale"]:
│              print(f"  - {s['id']} ({s['file']}): repo {s['repo_bytes']} B, gyvai {s['live_bytes']} B")
│ +    if data.get("live_missing"):
│ +        # Ne „NEPASIEKTA po 2 bandymų“: 404 yra atsakymas, ne tinklo gedimas.
│ +        # Vaikui tai reiškia, kad modulio svetainėje nėra — reikia publikuoti.
│ +        print(f"SVETAINĖJE NĖRA MODULIO FAILO — indeksas jį rodo, svetainė atsakė 404 "
│ +              f"({len(data['live_missing'])}):")
│ +        for item in data["live_missing"]:
│ +            print(f"  - {item['id']} ({item['file']}), repo {item['repo_bytes']} B. "
│ +                  f"Tai nepasibaigęs publikavimas, o ne ryšio klaida.")
│      if data["stale_unknown"]:
│          print(f"NEPASIEKTA po {FETCH_ATTEMPTS} bandymų ({len(data['stale_unknown'])}): "
│                f"{', '.join(data['stale_unknown'])}")
Nepavyko užbaigti — pataisymas įpusėtas, bet repo paliktas su neišbandytu kodu. Tai svarbiausia žinutė.

## Ką radau

`check_published.py` šiandien rodo 48/48 (`Repo ir gyva svetainė sutampa … versija f09e1961`), 3 gyvi adresai atsakė 200:
- `content/lt/grade-01/matematika/04-skaiciu-tiese.json`
- `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json`
- `content/lt/grade-01/pasaulio-pazinimas/08-metu-laikai.json`

Bet įrankis turi realų defektą, kurį radau skaitydamas kodą, o ne išvestį: `fetch()` grąžina `None` ir tada, kai svetainė atsakė **404**, ir tada, kai ryšio nėra; `compare()` abu paverčia `"unreachable"`. Pasekmė — modulio failo, kurio svetainėje nėra, atveju pranešama `NEPASIEKTA po 2 bandymų (1)`, t. y. teigiama apie tinklą, kurio nebuvo (404 net nekartojamas), ir siūloma bandyti dar kartą vietoj publikuoti. Tai LL-21 / LL-37 šeima. Zondas su veidrodžiu (5 scenarijai) paleistas prieš pataisymą davė 3/5 — B scenarijus (gyvas indeksas + failo 404) krito būtent taip.

## Ką spėjau pakeisti (`scripts/check_published.py`, NEBAIGTA)

- `fetch_answer()` — nauja funkcija su būsenomis `ok|missing|unreachable`; `fetch()` paliktas kaip suderinama apvalkalas.
- `compare()` — nauja būsena `"gone"` (repo failas yra, svetainė atsakė 404/410).
- `_shell_state()` — ta pati `"gone"` būsena kodui.
- `check_grade()` — `live_missing` sąrašas (už `absent` šakos, kad nenukristų į „neišmatuotas dydis“), `aux_gone`.
- `check_shell()` — `shell_gone`; `report()` — nauji raktai; `verdict()` — 3 naujos priežastys; spausdintuvas — blokas `SVETAINĖJE NĖRA MODULIO FAILO` atskirtas nuo `NEPASIEKTA`.

Visi pataisymai pritaikyti, `lint: ok`, bet **nei vienas neįvykdytas**. Trūksta: spausdintuvo eilučių `aux_gone` ir `shell_gone` blokams, docstring įrašo su data, `probe.py --expect new` (turi būti 5/5), `git stash` → `probe.py --expect old` (B turi būti BLOGAI) → `stash pop`, `changelog.md` eilutės, LL-120 pamokos, `state.json` bloko.

## Sprendimas

**sustabdyta** — `scripts/check_published.py` šiuo metu yra perpus pataisytas ir nepaleistas; jo negalima laikyti sutvarkytu, o ir palikti su pakeitimais, kurių niekas neišbandė, negalima. Prieš bet kokį commitą reikia arba užbaigti žemiau esančius žingsnius, arba grąžinti failą (`git checkout -- scripts/check_published.py`).

Liko nebaigta: (1) spausdintuvo `aux_gone`/`shell_gone` eilutės; (2) docstring įrašas „2026-11-19 (paleidimas #386)“; (3) zondo paleidimas po ir prieš (`stash` neigiama kontrolė); (4) `research/wiki/changelog.md` eilutė „repo 48 / paskelbta 48, versija f09e1961“; (5) `research/wiki/guidelines/pamokos.md` LL-120 (LL-119 jau užimta — „Citata, kuri paneigia lauką“), įrodymas `~/.hermes/profiles/deepseek41flash/cache/scratch/pub386/probe.py`; (6) `agents/state.json` blokas `last_publish_check_386`.

Nieko nešalinau, modulio ID nepernumeravau, `content/**`, `assets/**`, `docs/**`, `AGENTS.md` neliečiau; jokių `git push`, jokių commitų.

## klaidos

```
session_id: local-bf70f04f80ac51b15d3e55e2e4482c6dc62d01af34a8223a6591564cde90a110
```
