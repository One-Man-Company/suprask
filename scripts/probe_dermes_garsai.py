#!/usr/bin/env python3
"""Elgsenos zondas: `04-dermes-garsai` simuliacija (tikra naršyklė).

`check_view.py` matuoja **matomumą** (ar telpa, ar ≥ 48 px, ar nėra slinkties),
bet nemato modelio elgsenos — o būtent elgsena čia yra mokymosi esmė. Modulio
klaidinga nuostata yra „jei gaidos tos pačios, tai ir daina ta pati“, todėl
zondas tikrina, kad:

 1. Pradžioje eilė yra tokia, kokią sako `sim.config.start`, o rastų eilių
    sąrašas tuščias (pradinė eilė dar nėra „rasta“ — vaikas jos neieškojo).
 2. Vienas paspaudimas nieko neperstato — tik paima vietą (LL-17: būsena turi
    atitikti dabartį, o ne ketinimą).
 3. Du paspaudimai perstato būtent tas dvi gaidas, o aibė nepakinta: kiekvienoje
    eilėje vis dar lygiai trys skirtingos gaidos (klaidingos nuostatos
    „pakeitus eilę atsiranda nauja gaida“ kontrolė).
 4. Rastų eilių skaičius ir sąrašas skaičiuojami iš scenos, o ne rašomi
    atskirai, ir sutampa su Python pusėje veikiančiu tuo pačiu modeliu (LL-21).
 5. Tos pačios eilės kartojimas skaičiaus nepadidina — ir kai ji gaunama
    „Apversk“ (kuri eilės nekeičia, jei ji jau atvirkštinė) — ne.
 6. Pažanga (`.sim-goal`) atsiranda TIK radus visas eiles, ne po pirmo veiksmo
    (LL-29).
 7. „Apversk“ duoda atvirkštinę eilę ir ją įskaito kaip naują.
 8. Greta esančių porų perstatymų ciklas tikrai išvardija visas eiles, o ne tik
    dalį jų (LL-37: „visos“ turi būti perskaičiuota).

Naudojimas:
    python3 scripts/probe_dermes_garsai.py                # pats pakelia serverį
    python3 scripts/probe_dermes_garsai.py --base http://127.0.0.1:8971/

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
ROUTE = "muzika/04-dermes-garsai"
MODULE = ROOT / "content/lt/grade-01/muzika/04-dermes-garsai.json"


def serve() -> tuple[socketserver.TCPServer, str]:
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))

    class Quiet(socketserver.ThreadingTCPServer):
        allow_reuse_address = True
        daemon_threads = True

    httpd = Quiet(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, f"http://127.0.0.1:{httpd.server_address[1]}/"


class Mirror:
    """Tas pats modelis Python pusėje: eilė, perstatymas, rastos eilės.

    Lūkesčiai taip perskaičiuojami iš to paties `sim.config`, o ne įrašomi
    ranka — modulio pakeitimas zondo nekaltina be priežasties.
    """

    def __init__(self, start: list[str]) -> None:
        self.order = list(start)
        self.seen: list[list[str]] = []

    def _remember(self) -> None:
        if self.order not in self.seen:
            self.seen.append(list(self.order))

    def swap(self, a: int, b: int) -> None:
        self.order[a], self.order[b] = self.order[b], self.order[a]
        self._remember()

    def reverse(self) -> None:
        self.order.reverse()
        self._remember()

    def text(self) -> str:
        return ",".join(self.order)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    cfg = (json.loads(MODULE.read_text(encoding="utf-8")).get("sim") or {}).get("config") or {}
    start = [n.lower() for n in (cfg.get("start") or [])]
    # Kiek eilių modelis turi surasti — skaičiuojama iš config, o ne įrašoma
    # ranka: jei modulis kada nors turės keturias gaidas, zondas tikrins 24.
    total = 1
    for i in range(2, len(cfg.get("notes") or []) + 1):
        total *= i

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("PRALEISTA: nėra playwright — elgsenos patikra neatlikta "
              "(matomumą CI matuoja kitais vartais, bet modelio elgsenos ne)")
        return 0

    chrome = os.environ.get("CHROME_BIN") or str(pathlib.Path.home() / ".local/bin/google-chrome")
    if not pathlib.Path(chrome).exists():
        print(f"PRALEISTA: nėra naršyklės „{chrome}“ — elgsenos patikra neatlikta")
        return 0

    httpd = None
    base = args.base
    if not base:
        httpd, base = serve()

    mirror = Mirror(start)
    start_text = mirror.text()
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

            # Garsas tikrinamas instrumentuojant `AudioContext`, o ne klausantis:
            # CI ir šis zondas neturi ausų, bet turi WebAudio. Užrašomi tik TIE
            # dažniai, kuriuos simuliacija tikrai suplanavo groti, ir ta tvarka,
            # kuria juos suplanavo — todėl paveikslas ir garsas lyginami
            # (LL-225: klausomasis rezultatas privalo turėti savo garsą).
            page.add_init_script("""
              (() => {
                const AC = window.AudioContext || window.webkitAudioContext;
                window.__tones = [];
                if (!AC) return;
                const co = AC.prototype.createOscillator;
                AC.prototype.createOscillator = function () {
                  const osc = co.call(this);
                  try { osc.frequency.__tag = true; } catch (e) {}
                  return osc;
                };
                const svat = AudioParam.prototype.setValueAtTime;
                AudioParam.prototype.setValueAtTime = function (v, t) {
                  try { if (this.__tag) window.__tones.push(Math.round(v)); } catch (e) {}
                  return svat.call(this, v, t);
                };
              })();
            """)
            page.goto(f"{base.rstrip('/')}/#/modulis/1/{ROUTE}",
                      wait_until="domcontentloaded", timeout=25000)
            page.wait_for_selector("#ge-slots button", timeout=15000)
            page.wait_for_timeout(400)

            order_js = """() => [...document.querySelectorAll('#ge-slots button .ge-name')]
              .map(n => n.textContent.trim().toLowerCase()).join(',')"""
            found_js = "() => document.querySelectorAll('#ge-found [role=listitem]').length"
            count_js = "() => document.querySelector('#ge-count').textContent.trim()"
            goal_js = "() => document.querySelectorAll('.sim-goal').length"

            def order() -> str:
                return page.evaluate(order_js)

            def notes_in_order() -> list[str]:
                return [x for x in page.evaluate(order_js).split(",") if x]

            def found() -> int:
                return page.evaluate(found_js)

            def tap(i: int) -> None:
                page.click(f"#ge-slots button:nth-child({i + 1})")
                page.wait_for_timeout(140)

            def drag(a: int, b: int) -> None:
                """Paima `a`, spaudžia `b` — gaidos susikeičia vietomis."""
                tap(a)
                page.click(f"#ge-slots button:nth-child({b + 1})")
                page.wait_for_timeout(360)
                mirror.swap(a, b)

            def agrees(where: str) -> None:
                """Scena ir modelis sutaria tiek eile, tiek rastų eilių skaičiumi."""
                check(f"{where}: eilė", order() == mirror.text(),
                      f"{order()} (laukta {mirror.text()})")
                check(f"{where}: rastų eilių skaičius", found() == len(mirror.seen),
                      f"{found()} (laukta {len(mirror.seen)})")

            check("pradinė eilė — iš config", order() == start_text,
                  f"{order()} (laukta {start_text})")
            check("pradžioje rastų eilių nėra", found() == 0, f"{found()}")
            check("skaitiklis rodo iš viso eilių", f"iš {total}" in page.evaluate(count_js),
                  page.evaluate(count_js))
            check("pradžioje dar ne „atlikta“", page.evaluate(goal_js) == 0,
                  f"sim-goal {page.evaluate(goal_js)}")

            # Valdikliai užrakinti iki spėjimo, bet paspaudimas paaiškina, kodėl
            # (LL-04: užraktas be paaiškinimo yra klaida).
            tap(1)
            locked_text = page.locator("#sim-note").inner_text().strip()
            check("vienas paspaudimas prieš spėjimą nieko neperstato ir paaiškina",
                  order() == start_text and "spėj" in locked_text.lower(), locked_text)

            page.click("#ge-guess")
            page.wait_for_timeout(200)
            check("po spėjimo spėjimo mygtukas neberodomas",
                  page.locator("#ge-guess:visible").count() == 0,
                  f"matomų {page.locator('#ge-guess:visible').count()}")

            # Vienas paspaudimas paima, bet neperstato.
            tap(0)
            check("paimta vieta pažymėta (aria-pressed)",
                  page.eval_on_selector("#ge-slots button:nth-child(1)",
                                        "b => b.getAttribute('aria-pressed')") == "true",
                  page.eval_on_selector("#ge-slots button:nth-child(1)",
                                        "b => b.getAttribute('aria-pressed')"))
            check("vienas paspaudimas eilės neperstato", order() == start_text, order())
            check("vienas paspaudimas eilių neįskaito", found() == 0, f"{found()}")

            # Antras paspaudimas perstato dvi gaidas.
            page.click("#ge-slots button:nth-child(2)")
            page.wait_for_timeout(450)
            mirror.swap(0, 1)
            agrees("po perstatymo")
            # Garsas: simuliacija turi suplanuoti groti BŪTENT tą eilę, kuri
            # rodoma ekrane, ir ta pačia tvarka (LL-225).
            hz = {n["id"]: n["hz"] for n in (cfg.get("notes") or [])}
            expected_hz = [round(hz[n]) for n in mirror.order]
            heard = page.evaluate("() => (window.__tones || []).slice(-%d)" % len(expected_hz))
            check("grojama būtent rodoma eilė", heard == expected_hz,
                  f"{heard} (laukta {expected_hz})")
            check("aibė nepakinta: trys skirtingos gaidos",
                  sorted(notes_in_order()) == sorted(start), order())
            check("ekrane tiek pat eilių, kiek skaitiklyje",
                  f": {found()} " in page.evaluate(count_js), page.evaluate(count_js))
            check("po vieno perstatymo dar ne „atlikta“", page.evaluate(goal_js) == 0,
                  f"sim-goal {page.evaluate(goal_js)}")

            # Perstatymas atgal: tai eilė, kurios vaikas dar nebuvo įvardijęs
            # kaip rastos (pradinė eilė nėra „rasta“), todėl skaičius auga.
            drag(0, 1)
            agrees("grįžus į pradinę eilę")
            check("pradinė eilė įskaitoma, kai ją vaikas grąžina perstatymu",
                  found() == 2, f"{found()}")

            # „Apversk“ duoda atvirkštinę eilę ir ją įskaito.
            page.click("#ge-reverse")
            page.wait_for_timeout(400)
            mirror.reverse()
            agrees("po „Apversk“")
            check("apsukta eilė skiriasi nuo buvusios",
                  order() == ",".join(reversed([x for x in start_text.split(",")])),
                  order())
            check("po dviejų eilių dar ne „atlikta“", page.evaluate(goal_js) == 0,
                  f"sim-goal {page.evaluate(goal_js)}")

            # „Iš naujo“ grąžina pradinę eilę, bet rastų eilių netrina: tai
            # vaiko jau atrastas dalykas, o ne scenos būsena.
            rastos = found()
            page.click("#ge-reset")
            page.wait_for_timeout(300)
            mirror.order = list(start)
            agrees("po „Iš naujo“")
            check("„Iš naujo“ rastų eilių nebeištrina", found() == rastos,
                  f"{rastos} → {found()}")

            # Greta esančių porų perstatymų ciklas: permutacijų šešiakampis.
            for a, b in [(0, 1), (1, 2), (0, 1), (1, 2), (0, 1)]:
                drag(a, b)

            check("ciklas kartu su ankstesniais veiksmais išvardija visas eiles",
                  len(mirror.seen) == total,
                  f"modelis {len(mirror.seen)} iš {total}: "
                  + "; ".join(",".join(x) for x in mirror.seen))
            agrees("po viso ciklo")
            check("po visų eilių „atlikta“", page.evaluate(goal_js) == 1,
                  f"sim-goal {page.evaluate(goal_js)}")
            check("skaitiklis rodo galutinį skaičių",
                  page.evaluate(count_js).strip() == f"Jau rasta: {total} iš {total}",
                  page.evaluate(count_js))

            # „Apversk“ dar kartą — eilė jau rasta, skaičius neturi kisti.
            page.click("#ge-reverse")
            page.wait_for_timeout(400)
            mirror.reverse()
            agrees("po antro „Apversk“")
            check("jau rasta eilė skaičiaus nepadidina",
                  found() == len(mirror.seen) and len(mirror.seen) == total,
                  f"{found()} iš {total}")

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
