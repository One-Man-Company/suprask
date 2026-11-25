#!/usr/bin/env python3
"""Ar senas (pervadinto) modulio adresas veda į įpėdinį, o ne į „Nerasta“.

Kodėl šis zondas egzistuoja. `KURINIO-STANDARTAS.md` §7.1 leidžia modulį
pervardinti ir reikalauja `renamed_from`, kad vaiko `localStorage` žyma
nepasiklystų. Bet žyma — ne vienintelė vieta, kur gyvena senas ID: jis lieka
mokytojo numatytoje nuorodoje, kitoje atidarytoje kortelėje, naršyklės
istorijoje. `app.js` modulį randa **tik** pagal `index.json` `id`, todėl
senas adresas atsidurdavo ties `notFound()` — vaikas matydavo „Nerasta“,
nors pamoka ta pačia tema svetainėje yra (`#523`: `03-sakinio-tvarka` →
`03-sakinio-zodziai`).

Zondas matuoja TIKRĄ naršyklę, o ne kodą: kiekvieną `renamed_from` porą
atidaro senu adresu ir tikrina, kad
  1. puslapyje matomas įpėdinio pavadinimas (ne „Nerasta“),
  2. adresas nukreiptas į dabartinį ID (kad nuoroda būtų galima dalintis toliau),
  3. neigiama kontrolė — išgalvotas ID VIS DAR rodo „Nerasta“ (kitaip
     zondas būtų žalias ir tada, kai maršrutizatorius nerodo nieko).

Naudojimas:
    .venv/bin/python scripts/check_route_alias.py                     # vietinis repo
    .venv/bin/python scripts/check_route_alias.py --json

Kodėl ne `probe_*.py` ir ne CI: šis patikrinimas atidaro tikrą naršyklę
(kaip `check_view.py`), o CI neturi nei playwright, nei Chrome —`probe_*.py`
ciklas CI'yje reikalauja zondo be tinklo ir < 5 s. Todėl jis paleidžiamas
rankiniu būdu / agento, o ne kiekviename PR.

Išėjimas: rc 0 — visi atvejai praėjo; rc 1 — bent vienas senas adresas
neveda į įpėdinį; rc 2 — nėra playwright / Chrome.
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
BOGUS_ID = "99-zondo-isgalvotas-modulis"


def renamed_pairs() -> list[dict]:
    """(grade, strand, senas ID, dabartinis ID, pavadinimas) iš visų klaidų."""
    pairs: list[dict] = []
    for index_path in sorted((ROOT / "content" / "lt").glob("grade-*/index.json")):
        doc = json.loads(index_path.read_text(encoding="utf-8"))
        grade = int(doc.get("grade") or 0)
        for strand in doc.get("strands", []):
            for mod in strand.get("modules", []):
                olds = mod.get("renamed_from") or []
                if not isinstance(olds, list):
                    continue
                for old in olds:
                    if not isinstance(old, str) or not old or old == mod.get("id"):
                        continue
                    pairs.append({
                        "grade": grade,
                        "strand": strand.get("id", ""),
                        "old": old,
                        "id": mod.get("id", ""),
                        "title": mod.get("title", ""),
                    })
    return pairs


def serve() -> tuple[socketserver.TCPServer, str]:
    class QuietHandler(http.server.SimpleHTTPRequestHandler):
        # Zondo išvestis — tik rezultatai, ne kiekvienas HTTP prašymas.
        def log_message(self, *args, **kwargs):  # noqa: D401
            pass

    handler = functools.partial(QuietHandler, directory=str(ROOT))
    httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), handler)
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, f"http://127.0.0.1:{httpd.server_address[1]}/"


def open_hash(browser, base: str, hash_route: str) -> dict:
    """Atidaro hash maršrutą naujame puslapyje ir grąžina, ką vaikas mato.

    Naujas puslapis, o ne `location.hash` tame pačiame dokumente: keičiant
    hash'ą be perkrovimo, ankstesnio (lėtesnio) maršruto `await` gali baigtis
    po naujojo ir perpiešti jo turinį — zondas tada matuotų lenktynes, o ne
    maršrutą.
    """
    page = browser.new_page(viewport={"width": 1024, "height": 768})
    try:
        page.goto(base + hash_route, wait_until="load")
        page.wait_for_function(
            "() => { const h = document.querySelector('#app h1');"
            " return h && h.textContent.trim().length > 0; }",
            timeout=15000,
        )
        return {
            "heading": page.evaluate("() => document.querySelector('#app h1').textContent.trim()"),
            "hash": page.evaluate("() => location.hash"),
        }
    finally:
        page.close()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    pairs = renamed_pairs()
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("KLAIDA: nėra playwright (naudok .venv/bin/python)", file=sys.stderr)
        return 2

    chrome = os.environ.get("CHROME_BIN") or str(pathlib.Path.home() / ".local/bin/google-chrome")
    httpd, base = serve()
    results: list[dict] = []
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(executable_path=chrome, args=["--no-sandbox"])
            for pair in pairs:
                route = f"#/modulis/{pair['grade']}/{pair['strand']}/{pair['old']}"
                seen = open_hash(browser, base, route)
                landed = seen["hash"].rstrip("/").endswith("/" + pair["id"])
                ok = seen["heading"] == pair["title"] and landed
                results.append({**pair, "route": route, **seen, "landed": landed, "ok": ok})
            # Neigiama kontrolė: be jos žalias rezultatas reiškia tik tai, kad
            # puslapyje visada yra koks nors h1 (LL-37).
            control_route = f"#/modulis/1/matematika/{BOGUS_ID}"
            control = open_hash(browser, base, control_route)
            control_ok = control["heading"] == "Nerasta"
            browser.close()
    finally:
        httpd.shutdown()
        httpd.server_close()

    if args.json:
        print(json.dumps({"pairs": results, "control": {**control, "ok": control_ok}},
                         ensure_ascii=False, indent=2))
    else:
        print(f"Pervadintų modulių sąsajos: {len(results)}")
        for r in results:
            mark = "OK " if r["ok"] else "NE "
            print(f"  {mark}{r['grade']} {r['strand']}/{r['old']} → {r['id']}: "
                  f"antraštė „{r['heading']}“, adresas {r['hash'] or '(tuščias)'}")
        print(f"Neigiama kontrolė {BOGUS_ID}: "
              f"„{control['heading']}“ — {'OK' if control_ok else 'NE'}")

    bad = [r for r in results if not r["ok"]]
    if not results:
        # Nė vienos poros nėra: zondas neturi ką matuoti, bet tai nereiškia
        # „praėjo“ — pasakome, kad matavimo nebuvo.
        print("PASTABA: repo nėra nė vieno `renamed_from` įrašo — sąsajos netikrintos")
    return 0 if (not bad and control_ok) else 1


if __name__ == "__main__":
    sys.exit(main())
