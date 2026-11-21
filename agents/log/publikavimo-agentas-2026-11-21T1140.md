# publikavimo-agentas — 2026-11-21T1140

- paleidimas: #423 (manual)
- trukmė: 300s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_published.py
│ @@ -182,6 +182,19 @@
│    priežastį, o pranešimas įvardija failą. Tai LL-37 šeima (tyli riba), tik
│    riboja ne užklausą, o aibę: matuota „indeksas prieš indeksą“, o vaikui
│    svarbu „failas prieš naršyklę“.
│ +
│ +2026-11-21 (paleidimas #423): svetainės failai imami iš katalogo, ne tik `*.js`/`*.css`.
│ +  `shell_files()` rinkdavo `index.html`, `404.html`, `assets/js/**/*.js` ir
│ +  `assets/css/*.css`, o `pages.yml` publikuoja `cp -r assets` — t. y. visą
│ +  katalogą. Bet koks kitas svetainės failas (paveikslas, SVG, šriftas, JSON)
│ +  būtų paskelbtas be vartų: baitų lyginimas jo nepamatytų, o vaikas, radęs
│ +  404 paveikslo adrese, nematytų jokio įspėjimo. Matuota buvo tai, kas
│ +  įrašyta sąraše, ne tai, ką svetainė siunčia (LL-37 — tyli riba). Šiandien
│ +  tokių failų nėra, todėl poveikis nulinis (`shell_count` 19 → 19), bet pirmas
│ +  `assets/img/*.svg` praeitų visas patikras žalias. Dabar `shell_files()`
│ +  prideda visus `assets/` failus, išskyrus `assets/audio/` — garsas tikrinamas
│ +  atskirai (`check_audio()` ir AUX `manifest.json`), o 1 486 mp3 dublikatas
│ +  bėgimą pailgintų be naujos informacijos.
│
│  Naudojimas:
│      python3 scripts/check_published.py               # žmogui
│ scripts/check_published.py
│ @@ -638,10 +638,17 @@
│
│
│  def shell_files() -> list[str]:
│ -    """Svetainės kodo failai, kuriuos naršyklė įkelia (`index.html`, JS, CSS).
│ +    """Svetainės failai, kuriuos naršyklė įkelia (`index.html`, JS, CSS, kiti `assets/`).
│
│      Sąrašas imamas iš katalogų, ne įrašomas ranka: nauja simuliacija
│      `assets/js/sims/` faile atsiranda be įrankio pakeitimo.
│ +
│ +    `SHELL_GLOBS` išvardija tik `*.js` ir `*.css`, o `pages.yml` publikuoja
│ +    visą `assets/` (`cp -r assets`). Todėl po jų pridedami visi kiti `assets/`
│ +    failai — paveikslas, SVG, šriftas, JSON. Kitaip pirmas `assets/img/*.svg`
│ +    būtų paskelbtas be vartų: baitai žali, o vaikas paveikslo adrese randa 404
│ +    (LL-37 — riboja sąrašas, ne svetainė). `assets/audio/` praleidžiamas:
│ +    garsą tikrina `check_audio()` ir AUX `manifest.json`.
│      """
│      out: list[str] = []
│      for name, pattern in SHELL_GLOBS:
│ @@ -652,6 +659,16 @@
│              continue
│          if path.is_dir():
│              out += [str(p.relative_to(ROOT)) for p in sorted(path.rglob(pattern))]
│ +    assets = ROOT / "assets"
│ +    if assets.is_dir():
│ +        for p in sorted(assets.rglob("*")):
│ +            if not p.is_file():
│ +                continue
│ +            rel = p.relative_to(ROOT).as_posix()
│ +            if rel.startswith("assets/audio/"):
│ +                continue
│ +            if rel not in out:
│ +                out.append(rel)
│      return out
│
│
│ profiles/deepseek41flash/cache/scratch/probe423_assets.py
│ @@ -0,0 +1,102 @@
│ +#!/usr/bin/env python3
│ +"""Zondas #423: ar check_published.py pamato NE-js/css svetainės failą.
│ +
│ +Tikslas: dvipusis įrodymas, kad
│ +  (a) prieš pataisymą `assets/img/zyva.svg` nebuvo nė viename sąraše,
│ +  (b) po pataisymo jis lyginamas ir 404 / kiti baitai duoda ne-"ok",
│ +      o identiški baitai — "ok" (jokio klaidingo raudono).
│ +"""
│ +import http.server
│ +import pathlib
│ +import shutil
│ +import socketserver
│ +import sys
│ +import threading
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +SCRATCH = pathlib.Path(__file__).resolve().parent
│ +sys.path.insert(0, str(ROOT / "scripts"))
│ +import check_published as cp  # noqa: E402
│ +
│ +REL = "assets/img/zyva-probe.svg"
│ +REPO_FILE = ROOT / REL
│ +MIRROR = SCRATCH / "mirror423"
│ +MIRROR_FILE = MIRROR / REL
│ +
│ +
│ +def old_list() -> list[str]:
│ +    """Senas shell_files() sąrašas — tik SHELL_GLOBS (js/css)."""
│ +    out = []
│ +    for name, pattern in cp.SHELL_GLOBS:
│ +        path = ROOT / name
│ +        if pattern is None:
│ +            if path.exists():
│ +                out.append(name)
│ +            continue
│ +        if path.is_dir():
│ +            out += [str(p.relative_to(ROOT)) for p in sorted(path.rglob(pattern))]
│ +    return out
│ +
│ +
│ +def main() -> int:
│ +    fails = 0
│ +
│ +    def check(label, cond, detail):
│ +        nonlocal fails
│ +        print(("  OK   " if cond else "  FAIL ") + label + " — " + detail)
│ +        if not cond:
│ +            fails += 1
│ +
│ +    before = cp.shell_files()
│ +    check("be naujo failo shell_count", len(before) == 19, f"{len(before)} failai")
│ +
│ +    REPO_FILE.parent.mkdir(parents=True, exist_ok=True)
│ +    REPO_FILE.write_bytes(b"<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'/>\n")
│ +    try:
│ +        new = cp.shell_files()
│ +        old = old_list()
│ +        check("senas sąrašas naujo failo nemato", REL not in old, f"senas {len(old)} failų, REL {'yra' if REL in old else 'nėra'}")
│ +        check("naujas sąrašas failą mato", REL in new, f"naujas {len(new)} failų")
│ +
│ +        # veidrodis: realios kopijos (ne simlinkai — #415 pamoka)
│ +        if MIRROR.exists():
│ +            shutil.rmtree(MIRROR)
│ +        MIRROR_FILE.parent.mkdir(parents=True, exist_ok=True)
│ +        shutil.copy2(REPO_FILE, MIRROR_FILE)
│ +
│ +        handler = lambda *a, **kw: http.server.SimpleHTTPRequestHandler(  # noqa: E731
│ +            *a, directory=str(MIRROR), **kw
│ +        )
│ +        socketserver.TCPServer.allow_reuse_address = True
│ +        srv = socketserver.TCPServer(("127.0.0.1", 0), handler)
│ +        port = srv.server_address[1]
│ +        threading.Thread(target=srv.serve_forever, daemon=True).start()
│ +        old_live = cp.LIVE_ROOT
│ +        cp.LIVE_ROOT = f"http://127.0.0.1:{port}/"
│ +        try:
│ +            state, lo, li = cp._shell_state(REL)
│ +            check("identiški baitai → ok", state == "ok" and lo == li, f"state={state} repo={lo} B gyvai={li} B")
│ … omitted 24 diff line(s) across 1 additional file(s)/section(s)
Sustabdyta dėl ėjimų limito — pateikiu ką tiksliai padariau ir ko trūksta.

check_published.py išvestis (rc 0)
  Repozitorija: 51 moduliai
  Paskelbta:    51 moduliai  (grade-01: repo 51, gyvai 51)
  Neišstumta commit'ų: 0 (git rev-list origin/main..HEAD → 0)
  Deploy pasivijo per 10 s — baitai lyginti su HEAD (81c1ef2b)
  missing_on_live 0 · hidden_locally 0 · not_in_path 0 · orphan_files 0
  stale 0 · stale_unknown 0 · aux_stale 0 · aux_absent 0 · aux_gone 0
  shell_stale 0 · shell_gone 0 · shell_count 19
  path_differs false · live_index_ok true · published_measured true · bytes_checked true
  vanished_ids 1 — 03-sakinio-tvarka → 03-sakinio-zodziai, resolved true, alias_ok true
  Garsas: 1486/1486 (sampled false), missing/empty/unreachable []
  live_version = repo_version = 81c1ef2b · verdict ok true · label „sutampa“

3 gyvi adresai (HTTP kodai, baitai prieš repo)
  200 5319 B = repo  content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json
  200 8221 B = repo  content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
  200 3629 B = repo  content/lt/grade-01/matematika/04-skaiciu-tiese.json
  404 (563 B)        content/lt/grade-01/matematika/99-nera.json  (neigiama kontrolė)

Vartai
  validate_content.py --grade 1 --strict → 0 klaidų / 0 įspėjimų, rc 0
  check_registry.py --grade 1 → kryptys 9 · index 51 · failai 51 · užduotys 223 · sim 51 · path 51 · našlaičiai 0, PROBLEMŲ 0, rc 0
  Gyvas funkcinis zondas (check_view.py --base gyva --module 10-gyvunu-grupes, phone 390 + small 360): patikrinta 2, problemų 0, „Visi moduliai matomi ir telpa“.

Failas, kurį pakeičiau: scripts/check_published.py
  shell_files() rinko tik index.html, 404.html, assets/js/**/*.js ir assets/css/*.css, nors pages.yml publikuoja `cp -r assets` (visą katalogą). Bet koks kitas svetainės failas (paveikslas, SVG, šriftas, JSON) būtų paskelbtas be vartų — vaikas paveikslo adrese rastų 404, o visos patikros liktų žalios. Dabar po SHELL_GLOBS pridedami visi assets/ failai, išskyrus assets/audio/ (garsą tikrina check_audio() ir AUX manifest.json). Šiandien tokių failų nėra, tad shell_count 19 → 19, jokių naujų užklausų; pataisymas skirtas pirmam assets/img/*.svg atvejui. Docstring papildytas 2026-11-21 (#423) įrašu.

KAS NEPADARYTA (sąžiningai)
1. Zondas įrašytas, bet NEPALEISTAS: /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe423_assets.py (5 dvipusiai tikrinimai: senas sąrašas failo nemato, naujas mato, identiški baitai → ok, kiti → differs, nėra → gone). Tai vienintelis trūkstamas įrodymas.
2. research/wiki/changelog.md eilutė neįrašyta — būtent tai, ko trūko ir praėjusiam paleidimui. Reikiama eilutė (dėti virš 2026-11-20 #413 įrašo):
   „## 2026-11-21 — Publikavimo patikra #423: repo 51 / paskelbta 51 prie 81c1ef2b, garsas 1 486/1 486, kodas 19 failų; 3 adresai 200, neigiama kontrolė 404; shell_files() ėmė visus assets/ failus, ne tik js/css“
3. agents/state.json blokas last_publish_check_423 neįrašytas (failas .gitignore, bet bėgiklis/dashboard jį skaito; paskutinis blokas — 413).

Sprendimas: sutampa (repo = gyva svetainė), su vienu profilaktiniu vartų išplėtimu scripts/check_published.py. Joks modulio ID nepernumeruotas, nieko nešalinta, content/**, assets/**, docs/**, AGENTS.md, .github/workflows/**, agents/state.json neliesti; jokio git push iš agento. Eilutės „ĮGYVENDINTA: #…“ nėra — nė vienas atviras pasiūlymas (#29003, #24447, #24307, #24171, #23765, #22168, #16892, #16338, #7396, #5400) nėra skirtas šiam pakeitimui.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-ee5597fb742fffa261671963958957a476633eecb114d149c9f5efaad368a634
```
