#!/usr/bin/env python3
"""Elgsenos zondas: `36-grupavimas-pagal-pozymi` simuliacija (tikra naršyklė).

Kodėl atskiras failas, o ne `check_view.py` matavimas: `check_view.py` matuoja
**matomumą** (ar telpa, ar ≥ 48 px, ar nėra slinkties). Modelio elgsenos jis
nemato — o būtent elgsena čia ir yra mokymosi esmė. Zondas tikrina:

 1. Pradinė būsena įvardyta (`#sim-readout` netuščias) ir krūvoje — visi daiktai.
 2. Be spėjimo požymio mygtukas NElukinamas tyliai: atsakymas „Pirma spėk…“ ir
    fokusas grįžta į spėjimą (LL-04 — valdiklis be paaiškinimo; LL-15 — spėjimas,
    kurį modelis pameta).
 3. Pasirinkus kitą požymį, būriai PERSIRIKIUOJA, o krūva viršuje nepakinta
    (tas pats daiktų skaičius) — tai ir yra modelio teiginys.
 4. `simDone` atsiranda TIK po trečio požymio, ne po pirmo (LL-29, LL-17).
 5. Po „Iš naujo“ požymių žymos lieka (LL-16 — būsena, kuri grįžta atgal), o
    būriai vėl nerodomi.
 6. 0 konsolės klaidų ir 0 puslapio klaidų.

Naudojimas:
    python3 scripts/probe_kruva_ir_buriai.py                  # pats pakelia serverį
    python3 scripts/probe_kruva_ir_buriai.py --base http://127.0.0.1:8991/

CI neturi nei playwright, nei Chrome, tad ten zondas atsako `PRALEISTA` ir
grąžina 0 — bet tai pasakoma žodžiu, o ne nutylima (LL-37). Naršyklė reikalinga
todėl, kad modelio būsena gyvena DOM'e, o ne faile.
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
ROUTE = "matematika/36-grupavimas-pagal-pozymi"


def chromium_path() -> str:
    return os.environ.get("CHROME_BIN") or str(pathlib.Path.home() / ".local/bin/google-chrome")


def serve() -> tuple[socketserver.TCPServer, str]:
    """Statinis serveris iš repo šaknies (be tinklo ir be išorinių resursų)."""
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
        print("PRALEISTA: nėra playwright — elgsenos patikra neatlikta "
              "(matomumą CI matuoja kitais vartais, bet modelio elgsenos ne)")
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

            check("pradinė būsena įvardyta", bool(readout.inner_text().strip()),
                  readout.inner_text().strip())
            n_items = page.eval_on_selector_all("#kg-pile svg", "els => els.length")
            check("krūvoje visi 6 daiktai", n_items == 6, f"{n_items}")

            # Be spėjimo: mygtukas neaktyvus, bet NE tylus.
            page.click('[data-crit="forma"]')
            page.wait_for_timeout(220)
            locked = readout.inner_text().strip()
            focus_id = page.evaluate("() => document.activeElement && document.activeElement.id")
            groups_before = page.eval_on_selector_all("#kg-groups [role=group]", "els => els.length")
            check("be spėjimo neleidžia rinktis", "spėk" in locked.lower(), locked)
            check("fokusas grįžta į spėjimą", focus_id == "kg-g-yes", focus_id)
            check("be spėjimo būrių nepiešia", groups_before == 0, f"{groups_before}")

            # Spėjimas + pirmas požymis.
            page.click("#kg-g-yes")
            page.wait_for_timeout(160)
            page.click('[data-crit="forma"]')
            page.wait_for_timeout(320)
            forma = page.eval_on_selector_all(
                "#kg-groups [role=group]", "els => els.map(e => e.getAttribute('aria-label'))")
            check("pagal formą trys būriai", len(forma) == 3,
                  json.dumps(forma, ensure_ascii=False))
            check("po pirmo požymio dar ne „atlikta“", page.locator(".sim-goal").count() == 0,
                  f"sim-goal {page.locator('.sim-goal').count()}")
            check("krūva viršuje nepakito",
                  page.eval_on_selector_all("#kg-pile svg", "els => els.length") == 6,
                  "6")
            check("spėjimas palygintas su tuo, kas atsitiko",
                  "spėjai" in readout.inner_text().lower(), readout.inner_text().strip())

            # Antras požymis — būriai persirikiuoja.
            page.click('[data-crit="spalva"]')
            page.wait_for_timeout(320)
            spalva = page.eval_on_selector_all(
                "#kg-groups [role=group]", "els => els.map(e => e.getAttribute('aria-label'))")
            check("pagal spalvą du būriai", len(spalva) == 2,
                  json.dumps(spalva, ensure_ascii=False))
            check("būriai persirikiavo", forma != spalva, "skiriasi")
            check("po antro požymio dar ne „atlikta“", page.locator(".sim-goal").count() == 0,
                  f"sim-goal {page.locator('.sim-goal').count()}")

            # Trečias požymis — tada progress.
            page.click('[data-crit="dydis"]')
            page.wait_for_timeout(420)
            dydis = page.eval_on_selector_all(
                "#kg-groups [role=group]", "els => els.map(e => e.getAttribute('aria-label'))")
            check("pagal dydį du būriai", len(dydis) == 2,
                  json.dumps(dydis, ensure_ascii=False))
            check("po trečio požymio „atlikta“", page.locator(".sim-goal").count() == 1,
                  f"sim-goal {page.locator('.sim-goal').count()}")
            check("pabaigos sakinys pasakytas",
                  "trys" in readout.inner_text().lower(), readout.inner_text().strip())

            # Iš naujo: žymos lieka (LL-16), būriai išnyksta.
            page.click("#kg-reset")
            page.wait_for_timeout(320)
            marks = page.eval_on_selector_all("#kg-marks li", "els => els.map(e => e.textContent)")
            after_reset = page.eval_on_selector_all("#kg-groups [role=group]", "els => els.length")
            check("po „Iš naujo“ trys žymos lieka", len(marks) == 3,
                  json.dumps(marks, ensure_ascii=False))
            check("po „Iš naujo“ būriai nerodomi", after_reset == 0, f"{after_reset}")
            check("po „Iš naujo“ prašoma spėti iš naujo",
                  "spėk" in note.inner_text().lower(), note.inner_text().strip())

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
