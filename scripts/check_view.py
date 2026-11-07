#!/usr/bin/env python3
"""
Ką vaikas realiai mato: modulio patikra tikroje naršyklėje.

Skirta nuo `check_ui.py`: tas skaito CSS/HTML failus, o šis **atidaro puslapį**
trimis plotais (desktop / planšetė / telefonas) ir matuoja, ką vaikas iš tikrųjų
gauna: ar tekstas telpa, ar nėra horizontalios slinkties, ar mygtukai pakankami,
ar užduotys matomos, ar simuliacija įsikėlė, ar garsas prasideda.

Papildomai simuliuoja **Brave skydus**: blokuoja `localStorage`, `crypto.subtle`
ir `speechSynthesis` — būtent tai anksčiau laužė puslapį.

Naudojimas:
    python3 scripts/check_view.py                       # visa 1 klasė, trys plotai
    python3 scripts/check_view.py --module 15-laikas
    python3 scripts/check_view.py --base http://127.0.0.1:8987/
    python3 scripts/check_view.py --json > view.json
"""

from __future__ import annotations

import argparse
import json
import os
import pathlib
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent

VIEWPORTS = {
    "desktop": {"width": 1440, "height": 900},
    "tablet": {"width": 1024, "height": 768},
    "phone": {"width": 390, "height": 844},
}

BRAVE_INIT = """
try { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('insecure', 'SecurityError'); } }); } catch (e) {}
try { Object.defineProperty(Crypto.prototype, 'subtle', { get() { return undefined; } }); } catch (e) {}
try { Object.defineProperty(window, 'speechSynthesis', { get() { return undefined; } }); } catch (e) {}
"""

MEASURE = r"""
() => {
  const vw = window.innerWidth;
  const de = document.documentElement;
  const tasks = [...document.querySelectorAll('.task')];
  // Mažo taikinio taisyklė taikoma VALDYMO elementams, ne teksto nuorodoms
  // (footer licencijos nuoroda yra sakinio dalis, ne mygtukas).
  const interactive = [...document.querySelectorAll('button, [role="button"], input, select')]
    .concat([...document.querySelectorAll('a')].filter(a => {
      const cs = getComputedStyle(a);
      const inText = a.closest('p, footer, .site-foot, .strand-meta, li');
      const isControl = cs.display !== 'inline' && (a.className || '').match(/btn|icon|card|chip/i);
      return !inText || isControl;
    }));
  const small = interactive
    .map(el => { const r = el.getBoundingClientRect(); return { r, el }; })
    .filter(({ r }) => r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 24))
    .map(({ r, el }) => ({ tag: el.tagName, text: (el.textContent || '').trim().slice(0, 24), h: Math.round(r.height), w: Math.round(r.width) }));

  const clipped = [...document.querySelectorAll('h1, h2, h3, p, li, .task, .opt, button')]
    .filter(el => el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== 'visible')
    .slice(0, 5)
    .map(el => ({ tag: el.tagName, text: (el.textContent || '').trim().slice(0, 40), sw: el.scrollWidth, cw: el.clientWidth }));

  const taskFonts = tasks.map(t => parseFloat(getComputedStyle(t.querySelector('.task-q') || t).fontSize) || 0).filter(Boolean);

  // Antraštės metaduomenys (kryptis · minutės) neturi lūžti į dvi eilutes.
  const eyebrow = document.querySelector('.eyebrow');
  let eyebrowLines = 1;
  if (eyebrow) {
    const lh = parseFloat(getComputedStyle(eyebrow).lineHeight) || parseFloat(getComputedStyle(eyebrow).fontSize) * 1.4;
    eyebrowLines = Math.max(1, Math.round(eyebrow.getBoundingClientRect().height / lh));
  }

  // Simuliacijos valdikliai: ar yra bent vienas MATOMAS veiksmas, ir ar nėra
  // 0×0 dydžio mygtukų (pvz. monetos, kurios „yra“, bet vaikas jų nemato).
  const simZone = [...document.querySelectorAll('#sim-stage button, #sim-controls button, #sim-stage a, #sim-controls a')];
  const visibleSim = simZone.filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
  // 0×0 mygtukas yra defektas TIK jei jo tėvai matomi. Jei tėvas turi
  // display:none — tai sąmoningai užrakintas žingsnis (pvz. monetos iki spėjimo).
  const insideHidden = (el) => {
    let node = el;
    while (node && node !== document.body) {
      if (getComputedStyle(node).display === 'none' || node.hasAttribute('hidden')) return true;
      node = node.parentElement;
    }
    return false;
  };
  const hiddenSim = simZone
    .filter(b => { const r = b.getBoundingClientRect(); return (r.width === 0 || r.height === 0) && !insideHidden(b); })
    .map(b => (b.getAttribute('aria-label') || b.innerText || b.id || b.className).toString().slice(0, 30));
  const stage = document.querySelector('#sim-stage');
  const stageBox = stage ? stage.getBoundingClientRect() : null;

  return {
    width: vw,
    scrollWidth: de.scrollWidth,
    overflow: de.scrollWidth - vw,
    tasks: tasks.length,
    tasksVisible: tasks.filter(t => { const r = t.getBoundingClientRect(); return r.height > 0; }).length,
    minTaskFont: taskFonts.length ? Math.min(...taskFonts) : null,
    smallTargets: small.slice(0, 6),
    smallCount: small.length,
    clipped,
    simHeight: stageBox ? Math.round(stageBox.height) : 0,
    eyebrowLines,
    simVisibleControls: visibleSim.length,
    simHiddenControls: hiddenSim.slice(0, 5),
    loading: !!document.querySelector('.loading'),
    fatal: !!document.querySelector('.boot-fallback') && getComputedStyle(document.querySelector('.boot-fallback')).opacity === '1',
    title: document.querySelector('h1') ? document.querySelector('h1').innerText : null,
  };
}
"""


def discover(base: str) -> list[dict]:
    index_url = base.rstrip("/") + "/content/lt/grade-01/index.json"
    with urllib.request.urlopen(index_url, timeout=20) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    out = []
    for strand in data.get("strands", []):
        for mod in strand.get("modules", []):
            out.append({
                "id": mod["id"],
                "title": mod.get("title", ""),
                "route": f"{strand['id']}/{mod['id']}",
            })
    return out


def check_route(page, base: str, route: str, viewport: dict) -> dict:
    errors: list[str] = []
    page.on("pageerror", lambda e: errors.append(str(e)[:160]))
    page.on("console", lambda m: errors.append("console: " + m.text[:160]) if m.type == "error" else None)

    url = f"{base.rstrip('/')}/#/modulis/1/{route}"
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=25000)
        page.wait_for_selector(".task", timeout=12000)
    except Exception as exc:  # noqa: BLE001
        return {"route": route, "viewport": viewport["width"], "errors": errors + [f"nepasikrovė: {exc}"[:160]], "ok": False}

    page.wait_for_timeout(600)
    data = page.evaluate(MEASURE)
    data["route"] = route
    data["viewport"] = viewport["width"]
    data["errors"] = errors[:5]
    data["ok"] = (
        data["overflow"] <= 1
        and data["tasks"] > 0
        and data["tasksVisible"] == data["tasks"]
        and data["smallCount"] == 0
        and not data["clipped"]
        and not data["loading"]
        and not data["fatal"]
        and not data["errors"]
        and data["eyebrowLines"] <= 1
        and data["simVisibleControls"] >= 1
        and not data["simHiddenControls"]
    )
    return data


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="https://one-man-company.github.io/suprask/")
    ap.add_argument("--module", default="")
    ap.add_argument("--viewports", default="desktop,phone")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("KLAIDA: nėra playwright (pip install playwright)", file=sys.stderr)
        return 2

    routes = discover(args.base)
    if args.module:
        routes = [r for r in routes if r["id"] == args.module or r["route"].endswith(args.module)]
    if not routes:
        print("KLAIDA: nerasta maršrutų", file=sys.stderr)
        return 2

    names = [v.strip() for v in args.viewports.split(",") if v.strip() in VIEWPORTS]
    chrome = os.environ.get("CHROME_BIN") or str(pathlib.Path.home() / ".local/bin/google-chrome")

    results: list[dict] = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=chrome, args=["--no-sandbox"])
        for vname in names:
            vp = VIEWPORTS[vname]
            ctx = browser.new_context(viewport=vp, device_scale_factor=1)
            ctx.add_init_script(BRAVE_INIT)
            page = ctx.new_page()
            for route in routes:
                results.append(check_route(page, args.base, route["route"], vp))
            ctx.close()
        browser.close()

    bad = [r for r in results if not r.get("ok")]
    if args.json:
        print(json.dumps({"base": args.base, "checked": len(results), "problems": bad, "all": results}, ensure_ascii=False))
    else:
        print(f"Patikrinta: {len(results)} (maršrutai × plotai) · problemos: {len(bad)}")
        for r in bad:
            bits = []
            if r.get("overflow", 0) > 1:
                bits.append(f"slinktis {r['overflow']}px")
            if r.get("tasks", 0) == 0:
                bits.append("nėra užduočių")
            elif r.get("tasksVisible") != r.get("tasks"):
                bits.append(f"matoma {r.get('tasksVisible')}/{r.get('tasks')} užduočių")
            if r.get("smallCount"):
                bits.append(f"mažų taikinių {r['smallCount']}")
            if r.get("clipped"):
                bits.append(f"apkirptas tekstas: {r['clipped'][0]['text'][:30]}")
            if r.get("eyebrowLines", 1) > 1:
                bits.append(f"antraštė lūžta į {r['eyebrowLines']} eilutes")
            if r.get("simVisibleControls", 1) == 0:
                bits.append("simuliacijoje nėra matomo valdiklio")
            if r.get("simHiddenControls"):
                bits.append(f"paslėpti valdikliai: {', '.join(r['simHiddenControls'][:2])}")
            if r.get("loading"):
                bits.append("amžinas „Kraunama…“")
            if r.get("fatal"):
                bits.append("rodomas klaidos blokas")
            for e in (r.get("errors") or [])[:2]:
                bits.append(e[:70])
            print(f"  ✗ {r['route']} @{r['viewport']}px: " + "; ".join(bits) or "nežinoma")
        if not bad:
            print("✔ Visi moduliai matomi ir telpa visuose plotuose (su Brave skydų blokais).")

    return 1 if bad else 0


if __name__ == "__main__":
    raise SystemExit(main())
