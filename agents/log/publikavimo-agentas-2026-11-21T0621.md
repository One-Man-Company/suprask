# publikavimo-agentas — 2026-11-21T0621

- paleidimas: #417 (manual)
- trukmė: 385s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub417/probe_deploy.py
│ @@ -0,0 +1,159 @@
│ +#!/usr/bin/env python3
│ +"""Zondas #417: ar `await_deploy()` tikrai atskiria „deploy nepasivijo“ nuo „pasenęs turinys“.
│ +
│ +#415 paliko šį zondą nepaleistą (veidrodis su simlinku `assets/` atsakė 404).
│ +Čia veidrodis daromas realiomis kopijomis (`assets/`, `content/`, `index.html`,
│ +`404.html`) ir aptarnaujamas `http.server` iš kito proceso.
│ +
│ +Trys scenos:
│ +  A) SENA priemonė (prieš #415, `d8ac863:scripts/check_published.py`) prieš veidrodį,
│ +     pastatytą iš ankstesnio commit'o → turi klaidingai pranešti „pasenęs turinys“.
│ +  B) NAUJA priemonė, tas pats veidrodis, `SUPRASK_DEPLOY_WAIT=3` → turi pranešti
│ +     „deploy nepasivijo“, o NE siųsti taisyti failų.
│ +  C) NAUJA priemonė, veidrodis pasiveja HEAD po ~4 s → turi duoti „sutampa“ su
│ +     `deploy_waited > 0` (tylus laukimas būtų LL-37).
│ +"""
│ +from __future__ import annotations
│ +
│ +import http.server
│ +import importlib.util
│ +import json
│ +import pathlib
│ +import shutil
│ +import socket
│ +import subprocess
│ +import sys
│ +import threading
│ +import time
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +SCRATCH = pathlib.Path("/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub417")
│ +MIRROR = SCRATCH / "mirror"
│ +OLD_TOOL = SCRATCH / "check_published_old.py"
│ +HEAD_SHA = subprocess.run(["git", "rev-parse", "--short=8", "HEAD"], cwd=ROOT,
│ +                           capture_output=True, text=True).stdout.strip()
│ +OLD_SHA = "d8ac863"
│ +STAMP = '<link rel="prefetch" href="?v=%s">\n'
│ +
│ +
│ +def build_mirror(stamp: str, drift: bool = True) -> None:
│ +    """Realios kopijos (ne simlinkai) + `?v=` žymė, kaip daro `pages.yml`."""
│ +    if MIRROR.exists():
│ +        shutil.rmtree(MIRROR)
│ +    MIRROR.mkdir(parents=True)
│ +    shutil.copy2(ROOT / "index.html", MIRROR / "index.html")
│ +    shutil.copy2(ROOT / "404.html", MIRROR / "404.html")
│ +    shutil.copytree(ROOT / "assets", MIRROR / "assets")
│ +    shutil.copytree(ROOT / "content", MIRROR / "content")
│ +    # Senas veidrodis: vienas modulio failas skiriasi baitais. Tai imituoja
│ +    # deploy, kuris dar nepastatė naujausio commit'o — būtent #415 atvejį.
│ +    if drift:
│ +        target = MIRROR / "content/lt/grade-01/matematika/04-skaiciu-tiese.json"
│ +        target.write_bytes(target.read_bytes() + b"\n")
│ +    stamp_version(stamp)
│ +
│ +
│ +def stamp_version(stamp: str) -> None:
│ +    path = MIRROR / "index.html"
│ +    text = path.read_text(encoding="utf-8")
│ +    for line in (STAMP % OLD_SHA, STAMP % HEAD_SHA):
│ +        text = text.replace(line, "")
│ +    path.write_text(text + STAMP % stamp, encoding="utf-8")
│ +
│ +
│ +def serve() -> tuple[http.server.ThreadingHTTPServer, int]:
│ +    handler = lambda *a, **kw: http.server.SimpleHTTPRequestHandler(*a, directory=str(MIRROR), **kw)  # noqa: E731
│ +    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
│ +    httpd.RequestHandlerClass.log_message = lambda *a, **kw: None
│ +    port = httpd.server_address[1]
│ +    threading.Thread(target=httpd.serve_forever, daemon=True).start()
│ +    return httpd, port
│ +
│ +
│ +def load_tool(path: pathlib.Path, live_root: str, wait: int, name: str):
│ +    """Importuoja įrankį su `SUPRASK_LIVE_ROOT` / `SUPRASK_DEPLOY_WAIT` (skaitoma importe)."""
│ +    import os
│ +    os.environ["SUPRASK_LIVE_ROOT"] = live_root
│ +    os.environ["SUPRASK_DEPLOY_WAIT"] = str(wait)
│ +    os.environ["SUPRASK_DEPLOY_POLL"] = "1"
│ … omitted 81 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/pub417/probe_deploy.py
│ @@ -3,26 +3,25 @@
│
│  #415 paliko šį zondą nepaleistą (veidrodis su simlinku `assets/` atsakė 404).
│  Čia veidrodis daromas realiomis kopijomis (`assets/`, `content/`, `index.html`,
│ -`404.html`) ir aptarnaujamas `http.server` iš kito proceso.
│ +`404.html`) ir aptarnaujamas `http.server` iš kito proceso, o `?v=` žymė daroma
│ +taip, kaip `.github/workflows/pages.yml` (sed į `main.css`, `app.js` ir `from './x.js'`).
│
│  Trys scenos:
│ -  A) SENA priemonė (prieš #415, `d8ac863:scripts/check_published.py`) prieš veidrodį,
│ -     pastatytą iš ankstesnio commit'o → turi klaidingai pranešti „pasenęs turinys“.
│ -  B) NAUJA priemonė, tas pats veidrodis, `SUPRASK_DEPLOY_WAIT=3` → turi pranešti
│ -     „deploy nepasivijo“, o NE siųsti taisyti failų.
│ -  C) NAUJA priemonė, veidrodis pasiveja HEAD po ~4 s → turi duoti „sutampa“ su
│ -     `deploy_waited > 0` (tylus laukimas būtų LL-37).
│ +  A) SENA priemonė (prieš #415) prieš pasenusį veidrodį → turi klaidingai siųsti
│ +     „taisyk N failų“, t. y. nematyti, kad skirtumas yra laiko.
│ +  B) NAUJA priemonė, tas pats veidrodis, 3 s laukimas → „deploy nepasivijo“.
│ +  C) NAUJA priemonė, veidrodis pasiveja HEAD po ~4 s → „sutampa“ su `deploy_waited > 0`.
│  """
│  from __future__ import annotations
│
│  import http.server
│  import importlib.util
│  import json
│ +import os
│  import pathlib
│ +import re
│  import shutil
│ -import socket
│  import subprocess
│ -import sys
│  import threading
│  import time
│
│ @@ -33,11 +32,29 @@
│  HEAD_SHA = subprocess.run(["git", "rev-parse", "--short=8", "HEAD"], cwd=ROOT,
│                             capture_output=True, text=True).stdout.strip()
│  OLD_SHA = "d8ac863"
│ -STAMP = '<link rel="prefetch" href="?v=%s">\n'
│ +DRIFT_REL = "content/lt/grade-01/matematika/04-skaiciu-tiese.json"
│ +# pages.yml: `sed -i "s|href=\"./assets/css/main.css\"|…?v=$SHA\"|"` ir tas pats app.js
│ +HTML_SED = (('href="./assets/css/main.css"', 'href="./assets/css/main.css?v={sha}"'),
│ +            ('src="./assets/js/app.js"', 'src="./assets/js/app.js?v={sha}"'))
│ +JS_SED = re.compile(r"(from |import\()(['\"])(\./[^'\"]+\.js)\2")
│
│
│ -def build_mirror(stamp: str, drift: bool = True) -> None:
│ -    """Realios kopijos (ne simlinkai) + `?v=` žymė, kaip daro `pages.yml`."""
│ +def stamp(sha: str) -> None:
│ +    """Tikroji `pages.yml` žymė: versija į index.html ir į santykinius JS importus."""
│ +    path = MIRROR / "index.html"
│ +    text = path.read_text(encoding="utf-8")
│ +    text = re.sub(r"\?v=[0-9a-f]{6,40}", "", text)
│ +    for old, new in HTML_SED:
│ +        text = text.replace(old, new.format(sha=sha))
│ +    path.write_text(text, encoding="utf-8")
│ +    for js in (MIRROR / "assets" / "js").rglob("*.js"):
│ +        src = JS_SED.sub(lambda m: f"{m.group(1)}{m.group(2)}{m.group(3)}?v={sha}{m.group(2)}",
│ +                         js.read_text(encoding="utf-8"))
│ +        js.write_text(src, encoding="utf-8")
│ +
│ +
│ +def build_mirror(sha: str, drift: bool = True) -> None:
│ +    """Realios kopijos (ne simlinkai). `drift` — vienas modulio failas senesnis."""
│      if MIRROR.exists():
│          shutil.rmtree(MIRROR)
│      MIRROR.mkdir(parents=True)
│ @@ -45,53 +62,62 @@
│      shutil.copy2(ROOT / "404.html", MIRROR / "404.html")
│      shutil.copytree(ROOT / "assets", MIRROR / "assets")
│      shutil.copytree(ROOT / "content", MIRROR / "content")
│ -    # Senas veidrodis: vienas modulio failas skiriasi baitais. Tai imituoja
│ -    # deploy, kuris dar nepastatė naujausio commit'o — būtent #415 atvejį.
│      if drift:
│ -        target = MIRROR / "content/lt/grade-01/matematika/04-skaiciu-tiese.json"
│ +        target = MIRROR / DRIFT_REL
│          target.write_bytes(target.read_bytes() + b"\n")
│ -    stamp_version(stamp)
│ … omitted 153 diff line(s) across 1 additional file(s)/section(s)
PALEIDIMAS #417 — publikavimo-agentas

REZULTATAS: `sutampa`. Repo failo šiame paleidime NEPADARYTA — žr. „KAS NEPADARYTA“ žemiau.

check_published.py (numatytasis režimas, rc 0, HEAD d938bbe7)
  Repozitorija: 51 moduliai
  Paskelbta:    51 moduliai
    · grade-01: repo 51, gyvai 51
  Neišstumta commit'ų: 0 (`git rev-list origin/main..HEAD` → 0)
  Deploy pasivijo per 10 s — baitai lyginti su HEAD (d938bbe7)
  missing_on_live 0 · hidden_locally 0 · not_in_path 0 · orphan_files 0
  stale 0 · stale_unknown 0 · live_missing 0 · missing_in_repo 0
  aux_stale 0 · aux_absent 0 · aux_gone 0 · shell_stale 0 · shell_gone 0
  path_differs false · live_index_ok true · published_measured true
  vanished_ids 1 — 03-sakinio-tvarka → 03-sakinio-zodziai, resolved true, alias_ok true (žyma perkeliama)
  Garsas: 1486 iš 1486 (visi) — visi pasiekiami
  Svetainės kodas: 19 failų
  ✔ Repo ir gyva svetainė sutampa, versija d938bbe7

3 gyvi adresai (HTTP kodai, ne atmintis)
  200 content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json  (5319 B = repo)
  200 content/lt/grade-01/pasaulio-pazinimas/08-metu-laikai.json  (4389 B = repo)
  200 content/lt/grade-01/matematika/04-skaiciu-tiese.json        (3629 B = repo)
  404 content/lt/grade-01/matematika/99-nera.json  (neigiama kontrolė)

PAPILDOMAI UŽBAIGTA: #415 paliktas neįrodytas funkcinis zondas
#415 ataskaita baigėsi žodžiais „Funkcinis zondas NEBAIGTAS“ — veidrodis su simlinkintu `assets/` atsakė 404. Šį kartą veidrodis padarytas realiomis kopijomis, o `?v=` žymė dedama taip, kaip `.github/workflows/pages.yml` (sed į main.css, app.js ir `from './x.js'`). Zondas paleistas, 3/3:
  A) senas įrankis (d8ac863) prieš pasenusį veidrodį → „1 pasenęs modulis“, deploy_pending false (klaidinga priežastis, siūlo taisyti turinį)
  B) naujas įrankis, tas pats veidrodis, 3 s → „svetainė pastatyta iš d8ac863, o repo HEAD d938bbe7 — deploy nepasivijo per 3 s“ (pirmoji priežastis)
  C) naujas įrankis, veidrodis pasiveja HEAD po 4 s → „sutampa“, ok true, deploy_waited 4
  rc 0. Taigi `await_deploy()` atskiria laiko skirtumą nuo turinio defekto į abi puses, o tylaus laukimo nėra.

KAS NEPADARYTA (sąžiningai, be pagražinimų)
Baigėsi ėjimų limitas prieš įrašant `research/wiki/changelog.md` eilutę. Tai buvo vienintelis šio paleidimo turinio rezultatas, todėl pagal taisykles paleidimas neturi savo failo ir gali būti laikomas tuščiu. Trūksta būtent vienos eilutės:

  ## 2026-11-21 — Publikavimo patikra #417: repo 51 / paskelbta 51 prie d938bbe7, garsas 1 486/1 486, kodas 19 failų; 3 adresai 200, neigiama kontrolė 404

Jei nori, kad paleidimas turėtų rezultatą, tą eilutę reikia įrašyti `research/wiki/changelog.md` viršuje (po 2026-11-20 #413 įrašo) — duomenys aukščiau yra pilni, įskaitant zondo 3/3. Joks modulio ID nepernumeruotas, nieko nešalinta; `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `.github/workflows/**`, `agents/state.json` neliesti; jokio `git push` iš agento. Eilutės „ĮGYVENDINTA: #…“ nėra — nė vienas atviras pasiūlymas (#30349, #30200, #29003, #24447, #24307, #24171, #23765, #22168, #16892, #16338) skirtas kitų vaidmenų failams.

## klaidos

```
session_id: local-8fb9b46efa70344284ce13058fb2de84c9605f5497735fa05c584c03fd986d22
```
