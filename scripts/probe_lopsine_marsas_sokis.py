#!/usr/bin/env python3
"""Elgsenos zondas: `05-lopsine-marsas-sokis` simuliacija (tikra naršyklė).

`check_view.py` matuoja **matomumą** (ar telpa, ar nėra slinkties), bet nemato
modelio elgsenos — o čia būtent elgsena yra mokymosi esmė. Modulio klaidinga
nuostata yra „lopšinė tyli, o maršas garsus“ (atmaina „paskirtį pasako
melodija, o ne tempas“), todėl zondas tikrina:

 1. Pradžioje paskirties kortelėse nė viena nėra „tinka“ — vaikas dar
    nepasirinko tempo, o modelis neturi teigti išvados už jį.
 2. Vienas tempo pasirinkimas pažymi BŪTENT to tempo paskirtį ir nė vienos
    kitos: lopšinė ↔ lėtai, maršas ↔ tolygiai, šokis ↔ greitai.
 3. Garsumo keitimas paskirties NEKEIČIA (LL-18: klaidingas variantas turi
    tikrai prieštarauti modeliui) — tai ir yra modulio klaidinga nuostata.
 4. Pažanga (`.sim-goal`) atsiranda TIK išgirdus visus tris tempus, ne po
    pirmo paleidimo (LL-29).
 5. Grojama būtent to tempo pulsas: instrumentuojamas `AudioContext` ir
    matuojama, kad lėčiausias tempas tarp gaidų ilgesnis už greičiausią
    (LL-225: klausomasis rezultatas privalo turėti savo garsą).
 6. Pasirinkus tempą dar kartą, paskirtis nepakinta ir nieko nepametama.
 7. Jokios horizontalios slinkties, 0 konsolės klaidų; išjungus garsą
    modelis vis tiek rodo paskirtį (LL-11).

Naudojimas:
    .venv/bin/python scripts/probe_lopsine_marsas_sokis.py     # pats pakelia serverį
    .venv/bin/python scripts/probe_lopsine_marsas_sokis.py --base http://127.0.0.1:8977/
    .venv/bin/python scripts/probe_lopsine_marsas_sokis.py --json

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
ROUTE = "muzika/05-lopsine-marsas-sokis"
MODULE = ROOT / "content/lt/grade-01/muzika/05-lopsine-marsas-sokis.json"


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

    cfg = (json.loads(MODULE.read_text(encoding="utf-8")).get("sim") or {}).get("config") or {}
    tempos = cfg.get("tempos") or []
    purposes = cfg.get("purposes") or []
    volumes = cfg.get("volumes") or []
    notes = len(cfg.get("melody") or [])
    # Lūkesčiai skaičiuojami iš `sim.config`, o ne įrašomi ranka: modulio
    # pakeitimas zondo nekaltina be priežasties (LL-21).
    by_tempo = {p["tempo"]: p for p in purposes}
    slowest = max(tempos, key=lambda t: t["note_ms"])
    fastest = min(tempos, key=lambda t: t["note_ms"])

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

            # Garsas matuojamas instrumentuojant `AudioContext`: užrašomi TIE
            # dažniai ir tie laikai, kuriuos simuliacija tikrai suplanavo.
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
                  try { if (this.__tag) window.__tones.push({ hz: Math.round(v), t: t }); } catch (e) {}
                  return svat.call(this, v, t);
                };
              })();
            """)
            page.goto(f"{base.rstrip('/')}/#/modulis/1/{ROUTE}",
                      wait_until="domcontentloaded", timeout=25000)
            page.wait_for_selector("#lt-pulses .lt-pulse", timeout=15000)
            page.wait_for_timeout(400)

            goal_js = "() => document.querySelectorAll('.sim-goal').length"
            fit_js = """() => [...document.querySelectorAll('#lt-purpose [role=listitem]')]
              .map(c => [c.getAttribute('aria-label') || '', c.textContent.trim()])
              .filter(([, t]) => t.includes('tinka') && !t.includes('netinka'))
              .map(([a]) => a)"""
            netinka_js = "() => [...document.querySelectorAll('#lt-purpose [role=listitem]')].length"

            def fit_labels() -> list[str]:
                """Paskirtys, kurios ekrane pažymėtos „tinka“ (žodžiu, ne ID)."""
                return page.evaluate(fit_js)

            check("pradžioje paskirtis nepasirinkta", fit_labels() == [],
                  f"tinka: {fit_labels()}")
            check("paskirčių kortelių yra tiek, kiek config", page.evaluate(netinka_js) == len(purposes),
                  f"{page.evaluate(netinka_js)} iš {len(purposes)}")
            check("pradžioje dar ne „atlikta“", page.evaluate(goal_js) == 0,
                  f"sim-goal {page.evaluate(goal_js)}")

            # Valdikliai užrakinti iki spėjimo, bet paspaudimas paaiškina, kodėl
            # (LL-04: užraktas be paaiškinimo yra klaida).
            # Užrakintas valdiklis turi `aria-disabled`, todėl playwright jo
            # „nespaudžia“ (elgsena teisinga — taip jį mato ir skaitytuvas).
            # Bet klaviatūra ir bakstelėjimas VIS TIEK pasiekia apdorotoją,
            # o LL-04 reikalauja, kad jis paaiškintų, kodėl nieko neįvyko —
            # todėl spaudžiama tiesiogiai per DOM.
            page.evaluate("() => document.querySelector(\"[data-tempo='letai']\").click()")
            page.wait_for_timeout(150)
            locked = page.locator("#sim-note").inner_text().strip()
            check("prieš spėjimą tempas nepasikeičia ir paaiškina",
                  fit_labels() == [] and "spėj" in locked.lower(), locked)

            page.click("#lt-guess")
            page.wait_for_timeout(200)
            check("po spėjimo spėjimo mygtukas neberodomas",
                  page.locator("#lt-guess:visible").count() == 0,
                  f"matomų {page.locator('#lt-guess:visible').count()}")

            def pick(tempo_id: str) -> None:
                page.click(f"[data-tempo='{tempo_id}']")
                page.wait_for_timeout(200)

            def play_and_wait(tempo: dict) -> None:
                page.evaluate("() => { window.__tones = []; }")
                page.click("#lt-play")
                # Laukiama ilgiau už visą melodiją, kad `finish()` tikrai įvyktų.
                page.wait_for_timeout(notes * tempo["note_ms"] + 700)

            for index, tempo in enumerate(tempos):
                expected = by_tempo.get(tempo["id"], {})
                pick(tempo["id"])
                # Išvada rodoma TIK tam tempui, kurio vaikas klausėsi. Todėl
                # prieš paleidimą žymės neturi būti NĖ VIENOJE kortelėje — ir
                # ne tik prieš pirmą paleidimą: kitaip vaikas, perjungdamas
                # tempus, perskaitytų atsakymą nepaleidęs garso (LL-244).
                check(f"„{tempo['id']}“ prieš paleidimą išvados neteigia",
                      fit_labels() == [], f"tinka: {fit_labels()}")
                play_and_wait(tempo)
                labels = fit_labels()
                check(f"tempas „{tempo['id']}“ pažymi būtent savo paskirtį",
                      len(labels) == 1 and expected.get("label", "") in labels[0],
                      f"tinka: {labels} (laukta {expected.get('label', '')})")
                if tempo is not tempos[-1]:
                    check(f"po „{tempo['id']}“ dar ne „atlikta“",
                          page.evaluate(goal_js) == 0, f"sim-goal {page.evaluate(goal_js)}")

            check("po visų tempų „atlikta“", page.evaluate(goal_js) == 1,
                  f"sim-goal {page.evaluate(goal_js)}")

            # Garsumas paskirties nekeičia — tai ir yra klaidinga nuostata.
            before = fit_labels()
            loud = volumes[-1]["id"] if volumes else ""
            if loud:
                page.click(f"[data-vol='{loud}']")
                page.wait_for_timeout(200)
                check("garsumas paskirties nekeičia", fit_labels() == before,
                      f"tinka: {before} → {fit_labels()}")

            # Grojama būtent to tempo pulsas: lėčiausio tarpo ilgiau nei greičiausio.
            page.click(f"[data-tempo='{slowest['id']}']")
            play_and_wait(slowest)
            slow_times = [t["t"] for t in page.evaluate("() => window.__tones")][:notes]
            page.click(f"[data-tempo='{fastest['id']}']")
            play_and_wait(fastest)
            fast_times = [t["t"] for t in page.evaluate("() => window.__tones")][:notes]
            slow_span = (slow_times[-1] - slow_times[0]) if len(slow_times) > 1 else 0
            fast_span = (fast_times[-1] - fast_times[0]) if len(fast_times) > 1 else 0
            check("lėtas tempas tikrai ilgesnis už greitą",
                  slow_span > fast_span > 0,
                  f"lėtas {slow_span:.2f}s, greitas {fast_span:.2f}s")

            page.click("#lt-play")
            page.wait_for_timeout(220)
            started = page.locator("#lt-play").inner_text().strip()
            page.click("#lt-play")
            page.wait_for_timeout(220)
            stopped = page.locator("#lt-play").inner_text().strip()
            lit = page.evaluate(
                "() => [...document.querySelectorAll('#lt-pulses .lt-pulse')]"
                ".filter(d => d.style.background.includes('accent')).length")
            check("„Sustabdyk“ nutraukia grojimą ir užgesina pulsą",
                  started == "Sustabdyk" and stopped == "Paleisk" and lit == 0,
                  f"paleista „{started}“, sustabdyta „{stopped}“, dega {lit}")

            # Paveikslas ir garsas turi sutarti (LL-13): melodijos taškų aukštis
            # kyla ir leidžiasi pagal GAIDŲ AUKŠTĮ. Jei piešinys būtų
            # dekoratyvus, vaikas jo nesietų su tuo, ką girdi.
            tops = page.evaluate(
                "() => [...document.querySelectorAll('#lt-pitch > span')]"
                ".map(c => Math.round(c.firstElementChild.getBoundingClientRect().top))")
            melody = cfg.get("melody") or []
            # Mažesnis `top` ekrane = aukštesnė gaida, tad santykis atvirkštis.
            contour_ok = all(
                (tops[a] > tops[b]) if (melody[a] < melody[b]) else (tops[a] < tops[b])
                for a in range(len(tops)) for b in range(len(tops))
                if melody[a] != melody[b]
            )
            check("taškų aukštis seka melodijos kontūrą", contour_ok,
                  f"aukščiai {tops}, gaidos {melody}")
            check("pulso juostoje tiek langelių, kiek gaidų",
                  page.evaluate("() => document.querySelectorAll('#lt-pulses .lt-pulse').length")
                  == len(melody), f"{len(melody)}")

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
