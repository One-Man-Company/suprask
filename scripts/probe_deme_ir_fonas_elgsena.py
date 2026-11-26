#!/usr/bin/env python3
"""Elgsenos zondas: `04-deme-ir-fonas` simuliacija (tikra naršyklė, 360 px).

`check_view.py` matuoja matomumą, o čia tikrinama MODELIO elgsena — būtent ji
yra mokymosi esmė. Zondas atsako į klausimus, kurių nei validatorius, nei
matomumo vartai nemato:

 1. Pradinė būsena įvardyta, o dėmė piešiama TIK vieną kartą.
 2. Be spėjimo lapo mygtukas NElukinamas tyliai: atsakymas „Pirma pasakyk…“,
    fokusas grįžta į spėjimą, lapas nepasikeičia (LL-04, LL-15).
 3. Kiekviename lape matomų pusių skaičius tikras: 4 → 2 → 1, ir dėmės
    geometrija (`#df-scene rect` dėmės spalva) nepasikeičia nė karto (LL-27).
 4. `simDone` atsiranda TIK po visų trijų lapų ir teisingų skaičių, ne po
    pirmo lapo (LL-29, LL-17).
 5. Po „Iš naujo“ žymos lieka (LL-16, LL-20), o vėl rodomas šviesus lapas.
 6. 0 konsolės klaidų ir 0 horizontalios slinkties.

Naudojimas:
    python3 scripts/probe_deme_ir_fonas.py              # pats pakelia serverį
    python3 scripts/probe_deme_ir_fonas.py --base http://127.0.0.1:8991/
CI neturi nei playwright, nei Chrome, tad ten zondas atsako `PRALEISTA` ir
grąžina 0 — bet tai pasakoma žodžiu, o ne nutylima (LL-37).
"""

from __future__ import annotations

import argparse
import functools
import http.server
import json
import os
import pathlib
import socketserver
import sys
import threading

ROOT = pathlib.Path(__file__).resolve().parent.parent
ROUTE = "daile/04-deme-ir-fonas"
SPOT_HEX = "#7b6b50"


def chromium_path() -> str:
    return os.environ.get("CHROME_BIN") or str(pathlib.Path.home() / ".local/bin/google-chrome")


def serve() -> tuple[socketserver.TCPServer, str]:
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))

    class Quiet(socketserver.ThreadingTCPServer):
        allow_reuse_address = True
        daemon_threads = True

    httpd = Quiet(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, f"http://127.0.0.1:{httpd.server_address[1]}/"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("PRALEISTA: nėra playwright — elgsenos patikra neatlikta")
        return 0

    chrome = chromium_path()
    if not pathlib.Path(chrome).exists():
        print(f"PRALEISTA: nėra naršyklės „{chrome}“ — elgsenos patikra neatlikta")
        return 0

    httpd = None
    base = args.base
    if not base:
        httpd, base = serve()

    checks: list[dict] = []

    def check(name: str, ok: bool, detail: str = "") -> None:
        checks.append({"name": name, "ok": bool(ok), "detail": detail})
        print(f"{'OK  ' if ok else 'KLAIDA'} {name} — {detail}")

    errors: list[str] = []
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(executable_path=chrome, args=["--no-sandbox"])
            ctx = browser.new_context(viewport={"width": 360, "height": 780})
            page = ctx.new_page()
            page.on("pageerror", lambda e: errors.append(str(e)[:200]))
            page.on("console", lambda m: errors.append("console: " + m.text[:200])
                    if m.type == "error" else None)

            page.goto(f"{base.rstrip('/')}/#/modulis/1/{ROUTE}",
                      wait_until="domcontentloaded", timeout=25000)
            page.wait_for_selector(".task", timeout=15000)
            page.wait_for_timeout(700)

            readout = page.locator("#sim-readout")
            note = page.locator("#sim-note")

            # PUSES MATUOJAMOS IŠ PAVEIKSLO, o ne iš config: didžiausias
            # dėmės spalvos plotas yra dėmė, o kiekvienas kitas tos pačios
            # spalvos plotas, liečiantis jos kraštą, tą pusę paslepia (LL-33:
            # tekstas turi atitikti piešinį, o ne atvirkščiai).
            SIDES_JS = """
            () => {
              const SPOT = "#7b6b50";
              const rs = [...document.querySelectorAll("#df-scene rect")]
                .filter((e) => e.getAttribute("fill") === SPOT)
                .map((e) => { const b = e.getBBox();
                  return { x: b.x, y: b.y, w: b.width, h: b.height }; });
              rs.sort((a, b) => b.w * b.h - a.w * a.h);
              const s = rs[0], o = rs.slice(1);
              const near = (a, b) => Math.abs(a - b) < 0.5;
              const sx = s.x, sy = s.y, ex = s.x + s.w, ey = s.y + s.h;
              const covers = (test) => o.some(test);
              const hidden = [
                ["virsus", covers((r) => near(r.y + r.h, sy) && r.x + r.w > sx && r.x < ex)],
                ["apacia", covers((r) => near(r.y, ey) && r.x + r.w > sx && r.x < ex)],
                ["kaire", covers((r) => near(r.x + r.w, sx) && r.y + r.h > sy && r.y < ey)],
                ["desine", covers((r) => near(r.x, ex) && r.y + r.h > sy && r.y < ey)],
              ].filter(([, v]) => v).map(([k]) => k);
              return { hidden, visible: 4 - hidden.length };
            }
            """

            def drawn_sides() -> dict:
                return page.evaluate(SIDES_JS)

            # Dėmės plotas — ta pati geometrija visais trimis lapais.
            def spot_boxes() -> list[str]:
                return page.eval_on_selector_all(
                    f'#df-scene rect[fill="{SPOT_HEX}"]',
                    "els => els.map(e => [e.getAttribute('x'), e.getAttribute('y'),"
                    " e.getAttribute('width'), e.getAttribute('height')].join(','))")

            check("pradinė būsena įvardyta", bool(readout.inner_text().strip()),
                  readout.inner_text().strip())
            before = spot_boxes()
            check("dėmė nupiešta (4×3 langeliai)", len(before) == 1, json.dumps(before))

            # Be spėjimo: lapo mygtukas paspaudžiamas, bet ne tylus — modelis
            # paaiškina, ką daryti, ir fokusas grįžta į skaičių (LL-04).
            page.click('[data-sheet="juostos"]')
            page.wait_for_timeout(220)
            locked = readout.inner_text().strip()
            focus_ok = page.evaluate(
                "() => document.activeElement && document.activeElement.dataset.count")
            after_lock = spot_boxes()
            check("be spėjimo lapas nesikeičia", after_lock == before,
                  json.dumps(after_lock))
            check("be spėjimo prašoma spėti", "pasakyk" in locked.lower(), locked)
            check("fokusas grįžta į spėjimą", focus_ok == "1", str(focus_ok))

            # Spėjimas: PIRMAS skaičius tame lape yra ir spėjimas, ir
            # skaičiavimas — vienas spaudimas, ne du (T1.1 žingsnis).
            page.click('[data-count="4"]')
            page.wait_for_timeout(320)

            sviesus = spot_boxes()
            check("dėmė nepasikeitė pirmame lape", sviesus == before, json.dumps(sviesus))
            check("paveiksle matomos 4 pusės", drawn_sides()["visible"] == 4,
                  json.dumps(drawn_sides(), ensure_ascii=False))
            check("spėjimas palygintas su paveikslu", "taip" in readout.inner_text().lower(),
                  readout.inner_text().strip())
            check("po pirmo lapo dar ne „atlikta“", page.locator(".sim-goal").count() == 0,
                  f"sim-goal {page.locator('.sim-goal').count()}")

            # Antras lapas — juostos.
            page.click('[data-sheet="juostos"]')
            page.wait_for_timeout(320)
            juostos = spot_boxes()
            bands = page.eval_on_selector_all(
                f'#df-scene rect[fill="{SPOT_HEX}"]', "els => els.length")
            # Pakeitus lapą sakinys TIK įvardija, kas pasikeitė — pusių
            # skaičiaus nesako, jį vaikas turi suskaičiuoti pats (LL-22).
            changed = readout.inner_text().strip().lower()
            check("lapo sakinys pusių skaičiaus neišduoda",
                  "juostos" in changed and "dvi" not in changed, changed)
            check("juostos liečia dėmę, bet jos nedengia", bands == 17,
                  f"tos pačios spalvos plotai: {bands}")
            check("paveiksle matomos 2 pusės", drawn_sides()["visible"] == 2,
                  json.dumps(drawn_sides(), ensure_ascii=False))
            page.click('[data-count="2"]')
            page.wait_for_timeout(300)
            check("skaičių patvirtina sakinys su dvi pusėmis",
                  "dvi" in readout.inner_text().lower(), readout.inner_text().strip())
            check("po antro lapo dar ne „atlikta“", page.locator(".sim-goal").count() == 0,
                  f"sim-goal {page.locator('.sim-goal').count()}")
            check("dėmė vis dar toje pačioje vietoje",
                  juostos[0] in before or before[0] in juostos, json.dumps(juostos))

            # Trečias lapas — lopai; po jo pažanga.
            page.click('[data-sheet="lopai"]')
            page.wait_for_timeout(300)
            check("trečio lapo sakinys pusių skaičiaus neišduoda",
                  "viena" not in readout.inner_text().lower(),
                  readout.inner_text().strip())
            page.click('[data-count="1"]')
            page.wait_for_timeout(420)
            check("trečiame lape lieka viena pusė", "viena" in readout.inner_text().lower(),
                  readout.inner_text().strip())
            check("paveiksle lieka 1 pusė", drawn_sides()["visible"] == 1,
                  json.dumps(drawn_sides(), ensure_ascii=False))
            check("po trečio lapo „atlikta“", page.locator(".sim-goal").count() == 1,
                  f"sim-goal {page.locator('.sim-goal').count()}")
            check("pabaigos sakinys pasakytas",
                  "trys lapai" in readout.inner_text().lower(), readout.inner_text().strip())

            # Iš naujo: žymos lieka, vėl šviesus lapas.
            page.click("#df-reset")
            page.wait_for_timeout(320)
            marks = page.eval_on_selector_all("#df-marks [role=listitem]", "els => els.length")
            check("po „Iš naujo“ trys žymos lieka", marks == 3, f"{marks}")
            check("po „Iš naujo“ prašoma spėti",
                  "pasakyk" in note.inner_text().lower(), note.inner_text().strip())
            check("po „Iš naujo“ vėl šviesus lapas",
                  "šviesus" in page.locator("#df-scene").get_attribute("aria-label").lower(),
                  page.locator("#df-scene").get_attribute("aria-label"))

            # Kontūras: rodo tą pačią dėmę, tik su brūkšniu.
            page.click('[data-count="4"]')
            page.wait_for_timeout(160)
            page.click("#df-edge")
            page.wait_for_timeout(240)
            dashed = page.eval_on_selector_all("#df-scene rect[stroke-dasharray]", "els => els.length")
            check("„Parodyk kraštą“ rodo brūkšninį kontūrą", dashed == 1, f"{dashed}")
            check("kontūras dėmės nepakeitė", spot_boxes() == before, json.dumps(spot_boxes()))

            overflow = page.evaluate(
                "() => document.documentElement.scrollWidth - window.innerWidth")
            check("jokios horizontalios slinkties", overflow <= 1, f"{overflow}px")
            check("0 konsolės ir puslapio klaidų", not errors,
                  json.dumps(errors, ensure_ascii=False)[:300])

            browser.close()
    finally:
        if httpd is not None:
            httpd.shutdown()

    ok = all(c["ok"] for c in checks)
    if args.json:
        print(json.dumps({"ok": ok, "checks": checks, "errors": errors}, ensure_ascii=False))
    else:
        print(f"\nRezultatas: {sum(c['ok'] for c in checks)}/{len(checks)} lūkesčių išsipildė")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
