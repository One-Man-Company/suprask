#!/usr/bin/env python3
"""Elgsenos zondas: `37-tinklelio-adresas` simuliacija (tikra naršyklė).

Kodėl atskiras failas, o ne `check_view.py` matavimas: `check_view.py` matuoja
**matomumą** (ar telpa, ar ≥ 48 px, ar nėra slinkties). Modelio elgsenos jis
nemato — o būtent elgsena čia ir yra mokymosi esmė. Modulio klaidinga
nuostata yra „vieno ženklo užtenka pasakyti, kur daiktas“, todėl zondas
tikrina, kad:

 1. Raidė viena pati paryškina VISĄ stulpelį (3 langelius), o ne vieną —
    tai pati klaidingos nuostatos kontrole (LL-18: klaidingas variantas, kuris
    gyvenime teisingas, neturi likti teisingu ekrane).
 2. Skaičius vienas pats paryškina VISĄ eilutę (4 langelius).
 3. Tik raidė IR skaičius kartu paryškina VIENĄ langelį, ir tai tas, kurį
    nurodo antraštės (ne pirmas tinklelio langelis — LL-25).
 4. Langelių skaičius ekrane yra perskaičiuojamas iš to paties tinklelio,
    kurį vaikas mato (M-07), o ne įrašytas atskirai.
 5. Pažanga (`sim-goal`) atsiranda TIK įvardijus vieną langelį, ne po pirmo
    ženklo (LL-29, LL-17).
 6. Pasirinkus kitą raidę, skaičius nunyksta ir vėl paryškinama juosta —
    vaikas pats pamato, kad vieno ženklo atgal nebeužtenka.
 7. Po „Iš naujo“ nė vienas langelis neparyškintas, o pažanga lieka.
 8. 0 konsolės klaidų ir 0 puslapio klaidų; jokios horizontalios slinkties.

Naudojimas:
    python3 scripts/probe_tinklelio_adresas.py                  # pats pakelia serverį
    python3 scripts/probe_tinklelio_adresas.py --base http://127.0.0.1:8991/

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
ROUTE = "matematika/37-tinklelio-adresas"

# Kiek langelių modelis turi paryškinti vienu ir dviem ženklais. Skaičiai
# imami iš modulio `sim.config` (cols/rows), o ne įrašomi iš atminties — jei
# modulis pakeis tinklelio dydį, zondas skaitysis naują leistiną atsakymą, o ne
# kaltins teisingo darbo (LL-21).
MODULE = ROOT / "content/lt/grade-01/matematika/37-tinklelio-adresas.json"


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

    cfg = (json.loads(MODULE.read_text(encoding="utf-8")).get("sim") or {}).get("config") or {}
    cols = int(cfg.get("cols") or 4)
    rows = int(cfg.get("rows") or 3)

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
            page.wait_for_timeout(450)

            readout = page.locator("#sim-readout")

            # Kiek langelių paryškinta — skaitoma iš SVG, kurį vaikas mato.
            lit_js = """() => [...document.querySelectorAll('#sim-stage rect[data-cell]')]
              .filter(r => (r.style.strokeDasharray || '') !== '').length"""

            def lit() -> int:
                return page.evaluate(lit_js)

            def lit_cells() -> list[str]:
                return page.evaluate(
                    """() => [...document.querySelectorAll('#sim-stage rect[data-cell]')]
                      .filter(r => (r.style.strokeDasharray || '') !== '')
                      .map(r => r.dataset.cell)""")

            check("pradinė būsena įvardyta", bool(readout.inner_text().strip()),
                  readout.inner_text().strip())
            check("pradžioje niekas neparyškinta", lit() == 0, f"{lit()}")
            check("tinklelio langelių tiek, kiek config",
                  page.eval_on_selector_all("#sim-stage rect[data-cell]", "els => els.length") == cols * rows,
                  f"{cols}×{rows}")

            # 1–2. Vienas ženklas = visa linija (tai klaidingos nuostatos kontrolė).
            page.click('[data-letter="1"]')          # raidė B
            page.wait_for_timeout(170)
            col_cells = lit_cells()
            check("raidė viena pati paryškina visą stulpelį",
                  len(col_cells) == rows and sorted(c.split("-")[1] for c in col_cells)
                  == [str(r) for r in range(rows)],
                  json.dumps(col_cells))
            check("stulpelis — būtent B (antras iš kairės)",
                  all(c.split("-")[0] == "1" for c in col_cells), json.dumps(col_cells))
            check("po pirmo ženklo dar ne „atlikta“",
                  page.locator(".sim-goal").count() == 0,
                  f"sim-goal {page.locator('.sim-goal').count()}")
            col_text = readout.inner_text().strip()
            check("sakinys pasako, kad raidė rodo stulpelį",
                  "stulpel" in col_text.lower(), col_text)

            page.click('#sim-controls [data-number="0"]')   # skaičius 1
            page.wait_for_timeout(170)
            cell_cells = lit_cells()
            check("du ženklai paryškina vieną langelį", len(cell_cells) == 1,
                  json.dumps(cell_cells))
            check("tas langelis yra B1 (ne pirmas tinklelio A1)",
                  cell_cells == ["1-0"], json.dumps(cell_cells))
            check("po dviejų ženklų „atlikta“",
                  page.locator(".sim-goal").count() == 1,
                  f"sim-goal {page.locator('.sim-goal').count()}")
            cell_text = readout.inner_text().strip()
            check("sakinys įvardija adresą B1 ir daiktą",
                  "B1" in cell_text and "varlyt" in cell_text.lower(), cell_text)

            # 3. Skaičius vienas pats = visa eilutė. Nauja raidė numeta skaičių,
            #    tad pirmiau pasirenkama raidė, paskui — tik skaičius po reset.
            page.click("#ta-reset")
            page.wait_for_timeout(170)
            check("po „Iš naujo“ niekas neparyškinta", lit() == 0, f"{lit()}")
            page.click('#sim-controls [data-number="1"]')   # skaičius 2
            page.wait_for_timeout(170)
            row_cells = lit_cells()
            check("skaičius vienas pats paryškina visą eilutę",
                  len(row_cells) == cols and all(c.endswith("-1") for c in row_cells),
                  json.dumps(row_cells))
            row_text = readout.inner_text().strip()
            check("sakinys pasako, kad skaičius rodo eilutę",
                  "eilut" in row_text.lower(), row_text)

            # 4. Kita raidė numeta skaičių — vėl juosta, ne langelis.
            page.click('#sim-controls [data-number="0"]')
            page.wait_for_timeout(150)
            page.click('[data-letter="2"]')          # raidė C
            page.wait_for_timeout(170)
            again = lit_cells()
            check("nauja raidė vėl paryškina juostą, ne langelį",
                  len(again) == rows and all(c.split("-")[0] == "2" for c in again),
                  json.dumps(again))

            # 5. Adresas, kuriame nieko nėra, vis tiek įvardijamas.
            #    Tuščias langelis imamas iš config (o ne įrašomas ranka):
            #    jei modulis kas nors įrašys, zondas ieškos kito.
            filled = {str(it.get("cell", "")).upper() for it in cfg.get("items") or []}
            letters_cfg = "ABCDEF"[:cols]
            empty = next((f"{letters_cfg[c]}{r + 1}" for r in range(rows)
                          for c in range(cols) if f"{letters_cfg[c]}{r + 1}" not in filled), "")
            if not empty:
                check("tuščias langelis C2 įvardijamas kaip tuščias", False,
                      "modulis neturi nė vieno tuščio langelio — nėra ko tikrinti")
            else:
                page.click(f'#sim-controls [data-letter="{letters_cfg.index(empty[0])}"]')
                page.wait_for_timeout(150)
                page.click(f'#sim-controls [data-number="{int(empty[1]) - 1}"]')
                page.wait_for_timeout(170)
                empty_text = readout.inner_text().strip()
                check(f"tuščias langelis {empty} įvardijamas kaip tuščias",
                      empty in empty_text and "tušč" in empty_text.lower(), empty_text)
                # …ir pažanga antrą kartą neįrašoma (jau buvo po B1).
                check("antras langelis pažangos nebekartoja",
                      page.locator(".sim-goal").count() == 1,
                      f"sim-goal {page.locator('.sim-goal').count()}")

            # 6. Pažanga lieka ir po „Iš naujo“ (ji žymi įveiktą ciklą).
            page.click("#ta-reset")
            page.wait_for_timeout(170)
            check("pažanga lieka po „Iš naujo“",
                  page.locator(".sim-goal").count() == 1,
                  f"sim-goal {page.locator('.sim-goal').count()}")

            # 6. Figūros tame pačiame tinklelyje — vienodo regimojo svorio.
            #    `check_art.py` mato, kad scena naudoja art.js, bet nemato, ar
            #    varlytė ir obuolys tame pačiame kadre nėra 3× skirtingo dydžio
            #    (LL-229). Todėl matuojama reali geometrija: `bleed` — kiek
            #    figūra išlenda iš savo langelio į kiekvieną pusę (≤ 0 = telpa).
            figs = page.evaluate("""() => [...document.querySelectorAll('#sim-stage [data-fig]')]
              .map(g => {
                const fig = g.getBoundingClientRect();
                const rect = document.querySelector(`#sim-stage rect[data-cell="${g.dataset.fig}"]`)
                  .getBoundingClientRect();
                return { cell: g.dataset.fig, w: fig.width, h: fig.height,
                  cellW: rect.width,
                  bleed: [rect.left - fig.left, rect.top - fig.top,
                          fig.right - rect.right, fig.bottom - rect.bottom] };
              })""")
            out = [f["cell"] for f in figs if max(f["bleed"]) > 1]
            check("visos figūros telpa savo langeliuose", bool(figs) and not out,
                  f"išlenda: {json.dumps(out)}" if out else f"{len(figs)} figūros")
            widths = [f["w"] for f in figs] or [0]
            ratio = max(widths) / max(min(widths), 0.01)
            check("figūrų plotis tame pačiame tinklelyje ≤ 1,5×",
                  ratio <= 1.5, f"{min(widths):.1f}–{max(widths):.1f} px, {ratio:.2f}×")
            small = [f["cell"] for f in figs if f["w"] < 0.45 * f["cellW"]]
            check("nė viena figūra nėra dėmė (< 45 % langelio pločio)", not small,
                  json.dumps(small) if small else "visos ≥ 45 %")

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
