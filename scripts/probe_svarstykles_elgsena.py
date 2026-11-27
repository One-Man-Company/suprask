#!/usr/bin/env python3
"""Elgsenos zondas: 16-lygybe-svarstykles — spėjimas yra sąlyga ir palyginamas.

Tikrina:
 1. Spėjimo negalima praleisti: nėra „Pradedu dėti“ mygtuko, o dėjimo
    valdikliai paslėpti, kol spėjimo nėra.
 2. Bandymas dėti klaviatūra be spėjimo — readout prašo spėti, scena
    paaiškina, fokusas perkeliamas į spėjimo mygtuką.
 3. Spėjus 5 (daugiau, nei yra dėžutėje), pirmos lygybės metu readout
    pasako ir spėjimą, ir dėžutės kiekį (LL-15).
 4. Antrą kartą lygybėje spėjimas nebekartojamas.
 5. simDone atsiranda tik pasiekus lygybę.
 6. 0 konsolės klaidų, 0 slinkties @360 ir @390; spėjimo mygtukai ≥48 px.

Be playwright (CI) zondas atsako PRALEISTA ir grąžina 0 — tai pasakoma
žodžiu, o ne nutylima (LL-37). Be tinklo, < 8 s.
"""
from __future__ import annotations

import functools
import http.server
import json
import os
import pathlib
import socketserver
import sys
import threading

ROOT = pathlib.Path(__file__).resolve().parent.parent
ROUTE = "matematika/16-lygybe-svarstykles"


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
    httpd, base = serve()
    checks: list[dict] = []

    def check(name: str, ok: bool, detail: str = "") -> None:
        checks.append({"name": name, "ok": bool(ok), "detail": detail})

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        httpd.shutdown()
        print("PRALEISTA: nėra playwright — elgsenos patikra neatlikta")
        return 0

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chromium_path(), args=["--no-sandbox"])
        for width in (390, 360):
            page = browser.new_page(viewport={"width": width, "height": 820})
            errors: list[str] = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
            page.goto(f"{base}index.html#/modulis/1/{ROUTE}")
            page.wait_for_selector("#sim-stage [role=group]", timeout=15000)
            page.wait_for_timeout(400)

            tag = f"@{width}"

            # 1. Spėjimas yra sąlyga.
            start_btns = page.eval_on_selector_all("#sim-controls button", "els => els.map(e => e.textContent.trim())")
            check(f"{tag} nėra „Pradedu dėti“ mygtuko, kuris praleidžia spėjimą",
                  "Pradedu dėti" not in start_btns, json.dumps(start_btns, ensure_ascii=False)[:200])
            guess_btns = page.eval_on_selector_all("[data-guess]", "els => els.length")
            check(f"{tag} spėjimo mygtukų maxBox+1 = 11", guess_btns == 11, str(guess_btns))
            # Dydis matuojamas DABAR: vėliau spėjimo blokas paslepiamas.
            sizes = page.eval_on_selector_all("[data-guess]",
                                              "els => els.map(e => Math.round(e.getBoundingClientRect().height))")
            check(f"{tag} spėjimo mygtukai ≥48 px", sizes and min(sizes) >= 48, json.dumps(sizes))

            # 2. Dėti be spėjimo negalima, bet paaiškinama ir nukreipiama.
            tools_display = page.eval_on_selector("#sv-tools", "el => getComputedStyle(el).display")
            check(f"{tag} dėjimo valdikliai paslėpti, kol nėra spėjimo", tools_display == "none", tools_display)
            page.eval_on_selector("#sv-wrap", "el => el.focus()")
            page.keyboard.press("ArrowRight")   # bandymas dėti klaviatūra be spėjimo
            page.wait_for_timeout(150)
            readout = page.inner_text("#sim-readout").strip()
            msg = page.inner_text("#sv-msg").strip()
            dots = page.eval_on_selector_all("#sv-svg circle[fill='var(--accent)']", "els => els.length")
            check(f"{tag} be spėjimo readout prašo spėti", "spėk" in readout.lower(), readout)
            check(f"{tag} be spėjimo paaiškinama scenoje", ("spė" in msg.lower() or "pasakyk" in msg.lower()), msg)
            check(f"{tag} be spėjimo kubelių įdėta 0", dots == 0, str(dots))
            focused = page.evaluate("() => { const a = document.activeElement; return a && a.dataset && a.dataset.guess !== undefined ? a.dataset.guess : (a ? a.tagName + '#' + (a.id || '') : 'none'); }")
            check(f"{tag} fokusas nukreiptas į spėjimą", focused == "0", focused)

            # 3. Spėjimas palyginamas su tuo, kas įvyko.
            page.click('[data-guess="5"]')  # sąmoningai per didelis: dėžutėje 3
            page.wait_for_timeout(150)
            for _ in range(3):
                page.click("#sv-plus")
                page.wait_for_timeout(120)
            readout = page.inner_text("#sim-readout").strip()
            check(f"{tag} spėjimas palyginas su rezultatu",
                  "5" in readout and "3" in readout, readout)
            check(f"{tag} palyginimas pasako, kad prognozė buvo didesnė",
                  "didesn" in readout.lower(), readout)
            sim_done = page.evaluate(
                "() => { try { const p = JSON.parse(localStorage.getItem('suprask:progress:v1') || '{}');"
                " return !!(p.modules && p.modules['16-lygybe-svarstykles'] && p.modules['16-lygybe-svarstykles'].simDone); } catch { return false; } }")
            check(f"{tag} simDone įrašytas pasiekus lygybę", sim_done is True, str(sim_done))

            # 4. Antrą kartą spėjimas nebekartojamas.
            page.click("#sv-minus")
            page.wait_for_timeout(120)
            page.click("#sv-plus")
            page.wait_for_timeout(200)
            readout2 = page.inner_text("#sim-readout").strip()
            check(f"{tag} spėjimas nebekartojamas antrą kartą",
                  "spėjai" not in readout2.lower(), readout2)

            # 5. Ta pati lygybė kita kryptimi.
            page.click("#sv-flip")
            page.wait_for_timeout(200)
            card = page.inner_text("#sv-card").strip()
            check(f"{tag} „Perskaityk kitaip“ apverčia lygybę", card.startswith("8"), card)
            flip_readout = page.inner_text("#sim-readout").strip()
            check(f"{tag} apversta lygybė nelyginama su spėjimu iš naujo",
                  "spėjai" not in flip_readout.lower(), flip_readout)

            # 6. Telpa ir pasiekiama.
            overflow = page.evaluate("() => document.documentElement.scrollWidth - window.innerWidth")
            check(f"{tag} jokios horizontalios slinkties", overflow <= 1, f"{overflow}px")
            check(f"{tag} 0 konsolės klaidų", not errors, json.dumps(errors, ensure_ascii=False)[:300])
            page.close()

        browser.close()
    httpd.shutdown()

    ok = all(c["ok"] for c in checks)
    for c in checks:
        print(("✔ " if c["ok"] else "✘ ") + c["name"] + (f" — {c['detail']}" if not c["ok"] else ""))
    print(f"\nRezultatas: {sum(c['ok'] for c in checks)}/{len(checks)} lūkesčių išsipildė")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
