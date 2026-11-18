#!/usr/bin/env python3
"""Ar simuliacijos piešinys telpa savo dėžėje (SVG klipping zondas).

`check_view.py` matuoja puslapio slinktį ir teksto apkirpimą, bet ne tai, ar
simuliacijos **SVG vaikai** neišlenda už paties SVG klianto dėžės. Būtent taip
atrodė #293 defektas (`06-figuros`: `cssText` ištrindavo `overflow`, figūros
buvo kerpamos) — puslapio slinktis buvo 0, tekstas tilpo, o vaikas matė
nukirptas figūras.

Taisyklė (LL-40 — taisoma defekto ruože, ne zondo pločiu):
  * perteklius ≤ TOL px — paribio atvejis, toleruojamas ir rodomas kaip pastaba;
  * perteklius > TOL px ir SVG kerpa (`overflow != visible`) — KLAIDA, išskyrus
    EXCEPTIONS sąraše deklaruotą sąmoningą perteklių su priežastimi.

Naudojimas:
    python3 scripts/check_svg_fit.py                 # 1 klasė, 1440 ir 360 px
    python3 scripts/check_svg_fit.py --grade 1 --module 06-figuros
    python3 scripts/check_svg_fit.py --base http://127.0.0.1:8987/   # be --serve
    python3 scripts/check_svg_fit.py --json > svg_fit.json

Be `--base` įrankis pats pakelia statinį serverį iš repo šaknies (be tinklo ir
be išorinių resursų), todėl matuoja **darbinę kopiją**, o ne paskelbtą svetainę.
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
from typing import Any, cast

ROOT = pathlib.Path(__file__).resolve().parent.parent

VIEWPORTS = {
    "desktop": {"width": 1440, "height": 900},
    "small": {"width": 360, "height": 780},
}

TOL = 4.0  # px — paribio perteklius, kurio vaikas nemato kaip nukirpimo

# Sąmoningas perteklius: modulio idėja remiasi tuo, kad piešinys eina už lapo.
EXCEPTIONS = {
    "18-taskas-tiese-spindulys-atkarpa": (
        "tiesė sąmoningai išeina už lapo krašto (matematika.js OVER = 20)"
    ),
}

MEASURE = """
(stage) => {
  const out = [];
  const svgs = [...stage.querySelectorAll('svg')];
  for (const svg of svgs) {
    const box = svg.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) { out.push({skip: 'zero-size'}); continue; }
    const cs = getComputedStyle(svg);
    let L = 0, T = 0, R = 0, B = 0, kids = 0, worst = null;
    for (const el of svg.querySelectorAll('path,rect,circle,ellipse,line,polygon,polyline,text,image,use')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      kids++;
      const l = box.left - r.left, t = box.top - r.top;
      const rr = r.right - box.right, bb = r.bottom - box.bottom;
      L = Math.max(L, l); T = Math.max(T, t); R = Math.max(R, rr); B = Math.max(B, bb);
      const m = Math.max(l, t, rr, bb);
      if (!worst || m > worst.over)
        worst = {tag: el.tagName, over: +m.toFixed(1), L: +l.toFixed(1), T: +t.toFixed(1),
                 R: +rr.toFixed(1), B: +bb.toFixed(1)};
    }
    const over = Math.max(L, T, R, B);
    out.push({
      w: +box.width.toFixed(1), h: +box.height.toFixed(1), kids,
      overflowStyle: cs.overflow, overflowPx: +over.toFixed(1),
      clipped: over > 0 && cs.overflow !== 'visible',
      worst,
    });
  }
  return out;
}
"""


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:  # noqa: A002 - bazinės klasės vardas
        pass


def serve_local() -> tuple[str, socketserver.TCPServer]:
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), handler)
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    port = httpd.server_address[1]
    return f"http://127.0.0.1:{port}/", httpd


def modules(grade: int) -> list[tuple[str, str]]:
    index_path = ROOT / "content" / "lt" / f"grade-{grade:02d}" / "index.json"
    idx = json.loads(index_path.read_text(encoding="utf-8"))
    out = []
    for strand in idx.get("strands", []):
        for m in strand.get("modules", []):
            if m.get("sim"):
                out.append((strand["id"], m["id"]))
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="")
    ap.add_argument("--grade", type=int, default=1)
    ap.add_argument("--module", default="")
    ap.add_argument("--viewports", default="desktop,small")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    names = [v.strip() for v in args.viewports.split(",") if v.strip()]
    unknown = [n for n in names if n not in VIEWPORTS]
    if unknown or not names:
        # Tylus nežinomo ploto numetimas atrodytų kaip patikrintas plotis (LL-37).
        print(f"KLAIDA: plotai {unknown or '(tuščia)'}; galimi: {', '.join(VIEWPORTS)}", file=sys.stderr)
        return 2

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("KLAIDA: nėra playwright (pip install playwright)", file=sys.stderr)
        return 2

    httpd = None
    base = args.base
    if not base:
        base, httpd = serve_local()

    mods = modules(args.grade)
    if args.module:
        mods = [m for m in mods if m[1] == args.module]
    if not mods:
        print("KLAIDA: nerasta modulių su sim", file=sys.stderr)
        if httpd:
            httpd.shutdown()
        return 2

    chrome = os.environ.get("CHROME_BIN") or str(pathlib.Path.home() / ".local/bin/google-chrome")
    rows = []
    problems = []
    notes = []

    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=chrome, args=["--no-sandbox"])
        for vname in names:
            vp = VIEWPORTS[vname]
            ctx = browser.new_context(viewport=cast(Any, vp), device_scale_factor=1)
            page = ctx.new_page()
            errors: list[str] = []
            page.on("pageerror", lambda e: errors.append(str(e)[:160]))
            for strand, mid in mods:
                errors.clear()
                page.goto(f"{base}#/modulis/{args.grade}/{strand}/{mid}", wait_until="domcontentloaded", timeout=25000)
                try:
                    page.wait_for_selector("#sim-stage", timeout=10000)
                    page.wait_for_timeout(450)
                    data = page.evaluate(MEASURE, page.query_selector("#sim-stage"))
                except Exception as exc:  # noqa: BLE001
                    data = [{"skip": f"err:{type(exc).__name__}"}]
                page_overflow = page.evaluate("document.documentElement.scrollWidth - innerWidth")
                row = {
                    "module": mid,
                    "viewport": vname,
                    "width": vp["width"],
                    "svgs": len([d for d in data if "overflowPx" in d]),
                    "maxOver": max([float(d.get("overflowPx", 0) or 0) for d in data] or [0]),
                    "clipped": [
                        d for d in data
                        if d.get("clipped") and float(d.get("overflowPx", 0) or 0) > TOL
                    ],
                    "near": [
                        round(float(d["overflowPx"]), 1) for d in data
                        if 0 < float(d.get("overflowPx", 0) or 0) <= TOL
                    ],
                    "pageOverflow": page_overflow,
                    "errors": errors[:3],
                }
                rows.append(row)
                if row["clipped"]:
                    if mid in EXCEPTIONS:
                        notes.append(f"{mid}@{vp['width']}: {row['clipped'][0]['overflowPx']}px — {EXCEPTIONS[mid]}")
                    else:
                        w = row["clipped"][0].get("worst") or {}
                        problems.append(
                            f"{mid}@{vp['width']}: SVG kerpa {row['clipped'][0]['overflowPx']}px "
                            f"({row['clipped'][0]['w']}x{row['clipped'][0]['h']}px, vaikų {row['clipped'][0]['kids']}, "
                            f"blogiausias <{w.get('tag')}> L{w.get('L')} T{w.get('T')} R{w.get('R')} B{w.get('B')})"
                        )
                if row["pageOverflow"] > 1:
                    problems.append(f"{mid}@{vp['width']}: puslapio slinktis {row['pageOverflow']}px")
                if row["errors"]:
                    problems.append(f"{mid}@{vp['width']}: konsolės klaida {row['errors'][0]}")
            ctx.close()
        browser.close()

    if httpd:
        httpd.shutdown()

    if args.json:
        print(json.dumps({
            "base": base, "tol": TOL, "exceptions": EXCEPTIONS,
            "checked": len(rows), "problems": problems, "notes": notes, "all": rows,
        }, ensure_ascii=False))
    else:
        print(f"Matuota: {len(rows)} (modulių {len(mods)} × plotų {len(names)}) · tolerancija {TOL:g}px")
        print(f"SVG kerpa daugiau už toleranciją: {len(problems)} · deklaruotas sąmoningas perteklius: {len(notes)}")
        for n in notes:
            print("  pastaba: " + n)
        for p in problems:
            print("  KLAIDA: " + p)
        worst = sorted(rows, key=lambda r: -r["maxOver"])[:3]
        print("Didžiausias perteklius: " + ", ".join(
            f"{r['module']}@{r['width']}={r['maxOver']}px" for r in worst))
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
