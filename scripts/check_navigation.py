#!/usr/bin/env python3
"""Ar naujas puslapis atsidaro nuo SAVO viršaus, o ne ten, kur baigėsi senasis.

Kodėl šis zondas egzistuoja. Visi maršrutai gyvena **viename** dokumente
(hash maršrutizatorius, `docs/ARCHITEKTURA.md`). Fragmento navigacija
dokumento neperkrauna, todėl naršyklė slinkties nekeičia: paspaudus „Toliau“
modulio apačioje, dokumentas lieka toje pačioje vietoje ir vaikas pamato
NAUJO modulio vidurį, o antraštė lieka už ekrano. Naršyklės atkurta slinktis
taip pat yra **seno** puslapio likutis (ir dar nukerpama pagal naujo puslapio
aukštį), tad „atgal“ grąžindavo į sąrašo apačią.

To negauna nė vienas esamas vartas: `check_view.py` kiekvieną maršrutą atidaro
NAUJU įkėlimu (`page.goto`), o tada slinktis visada 0; `check_ui.py` skaito
tik CSS. Defektas matomas TIK perėjime, todėl matuojamas perėjimas.

Tikrinama tikra naršyklė, kaip `check_view.py` ir `check_route_alias.py`
(CI neturi nei playwright, nei Chrome):

  1. kiekvienas modulis, turintis „Toliau“ kortelę, atidaromas nuslinkus į
     puslapio apačią → kitas modulis prasideda viršuje (y = 0);
  2. klasės sąrašo eilutė, paspausta nuslinkus žemyn → modulis prasideda viršuje;
  3. „Pereiti prie turinio“ nekeičia puslapio: lieka ta pati antraštė, o
     fokusas atsiduria `#app` (anksčiau `#app` buvo maršrutas → „Nerasta“);
  4. neigiamos kontrolės — (a) `#app` adresas VIS DAR rodo „Nerasta“, t. y.
     zondas tikrai matytų perėjimą į svetimą puslapį; (b) modulio apačioje
     prieš paspaudimą `scrollY` tikrai nėra 0, t. y. matuojama tikra būsena,
     o ne „visada 0“.

Naudojimas:
    .venv/bin/python scripts/check_navigation.py            # rc 0 — gerai
    .venv/bin/python scripts/check_navigation.py --json
    .venv/bin/python scripts/check_navigation.py --limit 12 # greitas rinkinys

Išėjimas: rc 0 — visi lūkesčiai išsipildė; rc 1 — bent vienas perėjimas
prasideda ne viršuje; rc 2 — nėra playwright / Chrome.
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
GRADE = 1

STATE = r"""
() => ({
  y: Math.round(window.scrollY),
  hash: location.hash,
  heading: (document.querySelector('#app h1') || {}).textContent || '',
  focusInApp: !!(document.activeElement && document.activeElement.closest && document.activeElement.closest('#app')),
})
"""


def module_routes() -> list[str]:
    """`<kryptis>/<id>` visų 1 klasės modulių, `path.json` eile."""
    index = json.loads((ROOT / "content" / "lt" / f"grade-{GRADE:02d}" / "index.json").read_text(encoding="utf-8"))
    path = json.loads((ROOT / "content" / "lt" / f"grade-{GRADE:02d}" / "path.json").read_text(encoding="utf-8"))
    by_id = {}
    for strand in index.get("strands", []):
        for mod in strand.get("modules", []):
            by_id[mod.get("id")] = strand.get("id")
    seq = [mid for mid in (path.get("sequence") or []) if mid in by_id]
    for mid, sid in by_id.items():          # kelyje dar nebuvę — indekso eile
        if mid not in seq:
            seq.append(mid)
    return [f"{by_id[mid]}/{mid}" for mid in seq]


def serve() -> tuple[socketserver.TCPServer, str]:
    class QuietHandler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args, **kwargs):  # noqa: D401
            pass

    handler = functools.partial(QuietHandler, directory=str(ROOT))
    httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), handler)
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, f"http://127.0.0.1:{httpd.server_address[1]}/"


def wait_ready(page) -> None:
    page.wait_for_function(
        "() => { const h = document.querySelector('#app h1');"
        " return h && h.textContent.trim().length > 0; }",
        timeout=20000,
    )
    page.wait_for_timeout(150)


def transition(browser, base: str, start: str, selector: str, index: int = 0) -> dict:
    """Atidaro `start`, nuslenka į apačią, spaudžia `selector` ir matuoja, kur atsidūrė.

    `page.goto` NAUJAME puslapyje (ne `location.hash`): keičiant hash tame
    pačiame dokumente ankstesnio (lėtesnio) maršruto `await` gali baigtis po
    naujojo ir perpiešti jo turinį — tada būtų matuojamos lenktynės, ne maršrutas.

    Paspaudimas — **sintetinė nuoroda**, o ne Playwright `click()`: pastarasis
    prieš paspaudimą pats priscrollina elementą į matomą sritį, tad matavimas
    „prieš“ būtų apie zondo sugalvotą geometriją (LL-40), o ne apie vaiko
    būseną. `document.createElement('a') + click()` yra ta pati fragmento
    navigacija, be jokio slinkties keitimo.
    """
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    try:
        page.goto(base + start, wait_until="load", timeout=30000)
        wait_ready(page)
        try:
            page.wait_for_selector(selector, timeout=12000)
        except Exception:
            # Paskutinis kelio modulis „Toliau“ kortelės neturi, o klasės
            # sąrašas gali būti trumpesnis — tai ne defektas, o neturima
            # matuoti. Sąžiningai pasakoma, o ne apeinama tyliai (LL-37).
            return {"start": start, "selector": selector, "before": None,
                    "after": None, "href": None}
        page.evaluate("() => window.scrollTo(0, document.documentElement.scrollHeight)")
        page.wait_for_timeout(250)
        before = page.evaluate(STATE)
        href = page.evaluate(
            "(sel) => document.querySelectorAll(sel)[%d].getAttribute('href')" % index, selector
        )
        if not href:
            return {"start": start, "selector": selector, "before": before,
                    "after": before, "href": None}
        after = page.evaluate(
            """async (href) => {
              const a = document.createElement('a');
              a.href = href; document.body.appendChild(a); a.click(); a.remove();
              await new Promise(r => setTimeout(r, 700));
              return {
                y: Math.round(window.scrollY),
                hash: location.hash,
                heading: (document.querySelector('#app h1') || {}).textContent || '',
                focusInApp: !!(document.activeElement && document.activeElement.closest && document.activeElement.closest('#app')),
              };
            }""",
            href,
        )
        return {"start": start, "selector": selector, "before": before, "after": after, "href": href}
    finally:
        page.close()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--limit", type=int, default=0, help="tikrinti tik N modulių (greitas rinkinys)")
    args = ap.parse_args()

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("KLAIDA: nėra playwright (naudok .venv/bin/python)", file=sys.stderr)
        return 2

    chrome = os.environ.get("CHROME_BIN") or str(pathlib.Path.home() / ".local/bin/google-chrome")
    routes = module_routes()
    if args.limit:
        step = max(1, len(routes) // args.limit)
        routes = routes[::step][: args.limit]

    httpd, base = serve()
    misjumps: list[dict] = []
    checked = 0
    noscroll = 0
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=chrome, args=["--no-sandbox"])
        try:
            # 1. „Toliau“ į kitą modulį
            for route in routes:
                res = transition(browser, base, f"#/modulis/{GRADE}/{route}", "[data-next-module]")
                if not res["before"] or not res["href"]:
                    continue                      # nėra „Toliau“ kortelės — nieko nematuotume
                if not res["before"]["y"]:
                    noscroll += 1
                    continue                      # modulis trumpesnis už ekraną
                checked += 1
                if res["after"]["y"] != 0:
                    misjumps.append({**res, "kind": "toliau"})

            # 2. Klasės sąrašo eilutė
            for row in (29, 50, 70):
                res = transition(browser, base, f"#/klase/{GRADE}", ".mod-row", index=row)
                if not res["before"] or not res["href"]:
                    continue
                checked += 1
                if res["after"]["y"] != 0 or res["after"]["heading"] == f"{GRADE} klasė":
                    misjumps.append({**res, "kind": "eilutė"})

            # 3. „Pereiti prie turinio“
            page = browser.new_page(viewport={"width": 1440, "height": 900})
            page.goto(base + f"#/klase/{GRADE}", wait_until="load", timeout=30000)
            wait_ready(page)
            title_before = page.evaluate("() => (document.querySelector('#app h1') || {}).textContent || ''")
            page.evaluate("() => document.querySelector('.skip-link').click()")
            page.wait_for_timeout(300)
            skip = page.evaluate(STATE)
            page.close()
            checked += 1
            skip_ok = skip["heading"] == title_before and title_before != "Nerasta" and skip["focusInApp"]
            if not skip_ok:
                misjumps.append({"kind": "skip", "before": title_before, "after": skip})

            # 4a. Neigiama kontrolė: `#app` VIS DAR yra maršrutas į „Nerasta“.
            #     Jei ir šis taptų puslapiu, zondas nebegalėtų atskirti
            #     perėjimo į svetimą vietą nuo teisingo.
            page = browser.new_page(viewport={"width": 1440, "height": 900})
            page.goto(base + "#app", wait_until="load", timeout=30000)
            wait_ready(page)
            control = page.evaluate("() => (document.querySelector('#app h1') || {}).textContent || ''")
            page.close()
        finally:
            browser.close()
    httpd.shutdown()
    httpd.server_close()

    if args.json:
        print(json.dumps({"checked": checked, "noscroll": noscroll,
                          "misjumps": misjumps, "control_app_route": control},
                         ensure_ascii=False, indent=2))
    else:
        print(f"Perėjimų patikrinta: {checked} · prasideda ne viršuje: {len(misjumps)}"
              f" · trumpesni už ekraną (nematuota): {noscroll}")
        for m in misjumps[:12]:
            kind = m["kind"]
            if kind == "toliau":
                print(f"  NE  {m['start']}: {m['before']['y']} px → {m['after']['y']} px "
                      f"(atsidarė {m['after']['heading']!r})")
            elif kind == "eilutė":
                print(f"  NE  eilutė {m['start']}: {m['before']['y']} px → {m['after']['y']} px "
                      f"(atsidarė {m['after']['heading']!r})")
            else:
                print(f"  NE  „Pereiti prie turinio“: „{m['before']}“ → „{m['after']['heading']}“, "
                      f"fokusas turinyje={m['after']['focusInApp']}")
        print(f"Neigiama kontrolė #app: „{control}“ — {'OK' if control == 'Nerasta' else 'NE'}")

    if not checked:
        print("PASTABA: nė vieno perėjimo neišmatuota — tai ne „praėjo“")
        return 1
    return 0 if (not misjumps and control == "Nerasta") else 1


if __name__ == "__main__":
    sys.exit(main())
