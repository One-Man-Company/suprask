#!/usr/bin/env python3
"""Elgsenos zondas: `42-transporto-priemone-marsrutui` simuliacija.

Kodėl atskiras failas, o ne `check_view.py` matavimas: vartai matuoja
**matomumą** (ar telpa, ar ≥ 48 px, ar nėra slinkties). Modelio elgsenos jie
nemato — o būtent elgsena čia ir yra mokymosi esmė. Zondas tikrina:

 1. Pradinė būsena įvardyta (`#sim-readout` netuščias) ir joje nėra skaičiaus,
    kurio modelis dar negalėjo suskaičiuoti (LL-234).
 2. Netinkama priemonė: pėsčiasis per upę **pajuda ir sustoja**, o ne dingsta
    ar klaidai lieka nepastebėta; „atlikta“ žymos dar nėra (LL-29).
 3. Tinkama priemonė: valtis per upę pasiekia tikslą (LL-18 — klaidingas
    variantas neturi būti vienintelis įmanomas).
 4. Visi trys keliai išspręsti → TIK dabar atsiranda `.sim-goal`; iki tol jo
    nėra nė po vieno kelią (LL-29, LL-17).
 5. Priemonė, kuriai kelias per ilgas, NEATsiduria tikslo taške: dviračio
    vieta miesto kelyje skiriasi nuo tikslo žymės (LL-17 — būsena atitinka tai,
    ką vaikas mato).
 6. 0 konsolės klaidų ir 0 puslapio klaidų.

Naudojimas:
    python3 scripts/probe_transporto_priemone.py                # pats pakelia serverį
    python3 scripts/probe_transporto_priemone.py --base http://127.0.0.1:8971/

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
import re
import socketserver
import sys
import threading

ROOT = pathlib.Path(__file__).resolve().parent.parent
ROUTE = "pasaulio-pazinimas/42-transporto-priemone-marsrutui"


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
            found = page.locator("#tp-found")
            scene = page.locator("#tp-scene")

            def goal() -> int:
                return page.locator(".sim-goal").count()

            def pick(trip: int, veh: int) -> None:
                page.click(f'[data-trip="{trip}"]')
                page.wait_for_timeout(180)
                page.click(f'[data-veh="{veh}"]')
                page.wait_for_timeout(320)

            start_text = readout.inner_text().strip()
            check("pradinė būsena įvardyta", bool(start_text), start_text)
            check("pradinis sakinys be skaičiaus (LL-234)",
                  not re.search(r"\d", start_text), start_text)
            check("iš karto „atlikta“ nėra", goal() == 0, f"sim-goal {goal()}")
            check("gairė skatina rinktis, o ne vertina",
                  "rinkis" in found.inner_text().lower() or "pasirink" in note.inner_text().lower(),
                  found.inner_text().strip() or note.inner_text().strip())

            # Netinkama priemonė per upę: pėsčiasis įbrenda ir sustoja.
            pick(1, 0)
            blocked = readout.inner_text().strip().lower()
            check("kelias neįveiktas iki galo pasakomas žodžiais",
                  "netinka" in blocked or "dalį" in blocked, blocked)
            check("netinkama priemonė — dar ne „atlikta“", goal() == 0, f"sim-goal {goal()}")
            check("paaiškinama, kodėl netinka", len(note.inner_text().strip()) > 20,
                  note.inner_text().strip())
            check("pasakoma, ką daryti toliau",
                  "pasirink" in note.inner_text().lower(), note.inner_text().strip())
            check("pėsčiasis ekrane pavaizduotas",
                  page.eval_on_selector_all("#tp-scene svg, #tp-scene path, #tp-scene circle",
                                            "els => els.length") > 3, "scena nupiešta")

            # Ta pati priemonė per kiemą: ten ji tinka.
            pick(0, 0)
            check("pėsčiasis per kiemą tinka",
                  "tinka" in readout.inner_text().lower() and "netinka" not in readout.inner_text().lower(),
                  readout.inner_text().strip())
            check("po vieno kelio „atlikta“ dar nėra", goal() == 0, f"sim-goal {goal()}")
            check("skaičiuojama, kiek kelių jau tinka",
                  re.search(r"\d", found.inner_text()) is not None, found.inner_text().strip())

            # Valtis per upę: tinka.
            pick(1, 2)
            check("valtis per upę tinka",
                  "tinka" in readout.inner_text().lower(), readout.inner_text().strip())
            check("po dviejų kelių „atlikta“ dar nėra", goal() == 0, f"sim-goal {goal()}")

            # Dviratis į miestą: kelias per ilgas — sustoja, nepasiekia tikslo.
            pick(2, 1)
            part = readout.inner_text().strip().lower()
            check("per ilgas kelias nevadinamas tinkančiu", "priemonė tinka" not in part, part)
            check("pasakoma, kad įveikta tik dalis kelio", "dalį" in part, part)
            check("dviračiui paaiškinama, kad liko per toli",
                  "toli" in note.inner_text().lower(), note.inner_text().strip())
            ents = page.eval_on_selector_all("#tp-scene [data-vx]", "els => els.map(e => e.dataset.vx)")
            check("dviratis sustoja kelyje, o ne prie tikslo", ents == ["part"], str(ents))
            dist = page.evaluate("""() => {
              const v = document.querySelector('#tp-scene [data-vx]');
              const p = document.querySelector('#tp-scene [data-pin]');
              if (!v || !p) return null;
              const a = v.getBoundingClientRect(), b = p.getBoundingClientRect();
              return Math.round(Math.abs((a.x + a.width / 2) - (b.x + b.width / 2)));
            }""")
            check("dviratis nutolęs nuo tikslo žymės", dist is not None and dist > 60, f"{dist} px")

            # Autobusas į miestą: trečias kelias.
            pick(2, 3)
            check("autobusas į miestą tinka",
                  "tinka" in readout.inner_text().lower(), readout.inner_text().strip())
            near = page.evaluate("""() => {
              const v = document.querySelector('#tp-scene [data-vx]');
              const p = document.querySelector('#tp-scene [data-pin]');
              if (!v || !p) return null;
              const a = v.getBoundingClientRect(), b = p.getBoundingClientRect();
              return Math.round(Math.abs((a.x + a.width / 2) - (b.x + b.width / 2)));
            }""")
            check("priemonė, pasiekusi tikslą, stovi prie žymės",
                  near is not None and near < 40, f"{near} px")
            check("visi trys keliai — DABAR „atlikta“", goal() == 1, f"sim-goal {goal()}")
            check("skaičius sutampa su išspręstais keliais",
                  re.search(r"3\s+iš\s+3", found.inner_text()) is not None, found.inner_text().strip())

            # Iš naujo: būsena grįžta į pradžią, o ne lieka „atlikta“.
            page.click("#tp-reset")
            page.wait_for_timeout(300)
            check("po „Iš naujo“ pradinė būsena",
                  not re.search(r"\d", found.inner_text().strip()), found.inner_text().strip())

            check("0 konsolės klaidų", not errors, "; ".join(errors[:3]) or "0")

            # Geometrija: ratuota priemonė turi LIESTI kelią, o valtis — plaukti
            # vandenyje. Tekstas ir piešinys turi sutarti (LL-13, LL-235).
            for trip_i, trip_id, ground in ((0, "kiemas", 252), (2, "miestas", 248)):
                page.click(f'[data-trip="{trip_i}"]')
                page.wait_for_timeout(200)
                for veh_i in (0, 1, 3):      # pėsčiasis, dviratis, autobusas
                    page.click(f'[data-veh="{veh_i}"]')
                    page.wait_for_timeout(220)
                    bot = page.evaluate("""() => {
                      const svg = document.querySelector('#tp-scene');
                      const s = svg.getBoundingClientRect(), k = s.width / 360;
                      const g = svg.querySelector('[data-vx]');
                      if (!g) return null;
                      return Math.round((g.getBoundingClientRect().bottom - s.y) / k);
                    }""")
                    check(f"{trip_id}: ratai liečia kelią", bot is not None and abs(bot - ground) <= 4,
                          f"apačia {bot} vs kelias {ground}")

            page.click('[data-trip="1"]')
            page.wait_for_timeout(200)
            page.click('[data-veh="2"]')                 # valtis per upę
            page.wait_for_timeout(220)
            boat = page.evaluate("""() => {
              const svg = document.querySelector('#tp-scene');
              const s = svg.getBoundingClientRect(), k = s.width / 360;
              const g = svg.querySelector('[data-vx]');
              const water = svg.querySelector('rect[fill*="-water"]');
              if (!g || !water) return null;
              const gb = g.getBoundingClientRect(), wb = water.getBoundingClientRect();
              return {top: Math.round((gb.top - s.y) / k), bottom: Math.round((gb.bottom - s.y) / k),
                      wTop: Math.round((wb.top - s.y) / k), wBottom: Math.round((wb.bottom - s.y) / k)};
            }""")
            check("valtis plaukia vandenyje, ne ant kranto",
                  boat is not None and boat["top"] > boat["wTop"] and boat["bottom"] < boat["wBottom"],
                  str(boat))
            browser.close()
    finally:
        if httpd is not None:
            httpd.shutdown()

    failed = [c for c in checks if not c["ok"]]
    if args.json:
        print(json.dumps({"route": ROUTE, "checks": checks,
                          "failed": len(failed)}, ensure_ascii=False))
    print(f"Rezultatas: {len(checks) - len(failed)}/{len(checks)} lūkesčių išsipildė, "
          f"{len(errors)} konsolės klaidų")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
