#!/usr/bin/env python3
"""Elgsenos zondas: `38-du-pozymiai-paieska` simuliacija (tikra naršyklė).

Kodėl atskiras failas, o ne `check_view.py` matavimas: `check_view.py` matuoja
**matomumą** (ar telpa, ar ≥ 48 px, ar nėra slinkties). Modelio elgsenos jis
nemato — o būtent elgsena čia ir yra mokymosi esmė. Zondas tikrina:

 1. Pradinė būsena įvardyta (`#sim-readout` netuščias), krūvoje 9 daiktai,
    krūvos skaičius nerašomas (kol kas pažymėti visi).
 2. Pažymėjus VIENĄ spalvą pažymėta 4 iš 9 — ir ekrane, ir `#sim-readout`
    tekste. Krūva viršuje nepakito (vis dar 9 daiktai).
 3. Pažymėjus ir dydį pažymėtas 1 iš 9 — tai modelio teiginys. `simDone`
    atsiranda TIK dabar, ne po pirmo požymio (LL-29, LL-17).
 4. Po „Iš naujo“ rastos eilutės lieka (LL-16, LL-20), o paieška prasideda
    iš naujo (pažymėti vėl visi).
 5. 0 konsolės klaidų ir 0 puslapio klaidų.

Naudojimas:
    python3 scripts/probe_du_pozymiai.py                  # pats pakelia serverį
    python3 scripts/probe_du_pozymiai.py --base http://127.0.0.1:8993/

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
import re
import socketserver
import sys
import threading

ROOT = pathlib.Path(__file__).resolve().parent.parent
ROUTE = "matematika/38-du-pozymiai-paieska"

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
            count_el = page.locator("#dp-count")

            check("pradinė būsena įvardyta", bool(readout.inner_text().strip()),
                  readout.inner_text().strip())
            # LL-234: pradinis sakinys neturi skelbti skaičiaus, kuris išvedamas
            # iš `items` — modelis jį skaičiuoja, o tekstas neperskaičiuotų.
            start_text = readout.inner_text().strip()
            check("pradinis sakinys be skaičiaus (LL-234)",
                  not re.search(r"\d", start_text), start_text)
            n_items = page.eval_on_selector_all("#dp-pile svg", "els => els.length")
            check("krūvoje visi 9 daiktai", n_items == 9, f"{n_items}")
            check("kol kas skaičius nerašomas", count_el.inner_text().strip() == "",
                  count_el.inner_text().strip())

            # Vienas požymis: raudona.
            page.click('[data-crit="spalva"][data-value="raudona"]')
            page.wait_for_timeout(320)
            after_one = count_el.inner_text().strip()
            got_one = re.findall(r"\d+", after_one)
            check("vienas požymis pažymi 4 iš 9", got_one[:2] == ["4", "9"],
                  after_one)
            check("vienas požymis — dar ne „atlikta“", page.locator(".sim-goal").count() == 0,
                  f"sim-goal {page.locator('.sim-goal').count()}")
            check("krūva viršuje nepakito",
                  page.eval_on_selector_all("#dp-pile svg", "els => els.length") == 9, "9")
            check("užuomina sako, ką daryti toliau", "dydį" in note.inner_text().lower(),
                  note.inner_text().strip())
            check("readout kartoja tą patį skaičių", "4" in readout.inner_text(),
                  readout.inner_text().strip())

            # Antras požymis: didelis.
            page.click('[data-crit="dydis"][data-value="didelis"]')
            page.wait_for_timeout(420)
            after_two = count_el.inner_text().strip()
            got_two = re.findall(r"\d+", after_two)
            check("du požymiai pažymi 1 iš 9", got_two[:2] == ["1", "9"], after_two)
            check("po abiejų požymių „atlikta“", page.locator(".sim-goal").count() == 1,
                  f"sim-goal {page.locator('.sim-goal').count()}")
            check("paaiškinimas — abu požymiai",
                  "abu" in (note.inner_text() + readout.inner_text()).lower(),
                  note.inner_text().strip())

            # Iš naujo: rastos eilutės lieka, paieška prasideda iš naujo.
            page.click("#dp-reset")
            page.wait_for_timeout(320)
            found = page.eval_on_selector_all("#dp-found li", "els => els.map(e => e.textContent)")
            check("po „Iš naujo“ rastos eilutės lieka", len(found) >= 2,
                  json.dumps(found, ensure_ascii=False))
            check("po „Iš naujo“ vėl pažymėti visi",
                  count_el.inner_text().strip() == "", count_el.inner_text().strip())

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
