#!/usr/bin/env python3
"""
Ką vaikas realiai mato: modulio patikra tikroje naršyklėje.

Skirta nuo `check_ui.py`: tas skaito CSS/HTML failus, o šis **atidaro puslapį**
keliais plotais (desktop / planšetė / telefonas / mažas telefonas) ir matuoja, ką
vaikas iš tikrųjų gauna: ar tekstas telpa, ar nėra horizontalios slinkties, ar
mygtukai pakankami, ar užduotys matomos, ar simuliacija įsikėlė, ar garsas prasideda.

Papildomai simuliuoja **Brave skydus**: blokuoja `localStorage`, `crypto.subtle`
ir `speechSynthesis` — būtent tai anksčiau laužė puslapį.

Naudojimas:
    python3 scripts/check_view.py                       # visa 1 klasė, trys plotai (su 360 px)
    python3 scripts/check_view.py --module 15-laikas
    python3 scripts/check_view.py --base http://127.0.0.1:8987/
    python3 scripts/check_view.py --json > view.json

Plotai: desktop 1440, tablet 1024, phone 390 ir small 360 (standarto §4.6 riba).
Numatytasis sąrašas yra desktop,phone,small — 360 px tikrinamas visada, nes jo
reikalauja ir kūrėjo baigties sąlyga, ir `docs/KURINIO-STANDARTAS.md` §4.6.

Antraštės metaduomenų taisyklė (LL-05, #4348). `.eyebrow` turi du atskirus
defektus, ir jie neturi būti matuojami vienu skaičiumi:

  1. **Žymos lūžimas** („10 min.“ tampa „10 / min.“ arba apskritimu) — klaida
     VISUOSE pločiuose, nes tai ne geometrijos, o CSS defektas (`nowrap`).
  2. **Bloko persikėlimas** į antrą eilutę — klaida ties standarto riba
     (360 px) ir plačiau. Žemiau 360 px standartas nieko nežada, todėl
     lūžimas toleruojamas, bet parodomas ataskaitoje kaip pastaba, o ne
     tyliai nuginčijamas (LL-37).
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
    # 360 px — pigiausių Android telefonų plotis ir standarto §4.6 riba.
    "small": {"width": 360, "height": 780},
}

# Standarto §4.6 mažiausias palaikomas plotis. Antraštės metaduomenys privalo
# tilpti vienoje eilutėje ties šiuo pločiu ir plačiau; žemiau jo lūžimas
# toleruojamas tik tada, kai turinys realiai netelpa (žr. docstring).
STANDARD_MIN_WIDTH = 360

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

  // Antraštės metaduomenys (kryptis · minutės). Du atskiri signalai (LL-05, #4348):
  //  - eyebrowNowrapLines: ar pati žyma („10 min.“) liko viena eilutė — klaida visur;
  //  - eyebrowLines: ar blokas liko vienoje eilutėje (klaida tik ≥360 px);
  //  - eyebrowFit: diagnostika pranešimui (ar blokas išvis galėjo tilpti), ne vartas.
  const eyebrow = document.querySelector('.module-head .eyebrow') || document.querySelector('.eyebrow');
  let eyebrowLines = 1;
  let eyebrowNowrapLines = 1;
  let eyebrowFit = true;
  if (eyebrow) {
    const cs = getComputedStyle(eyebrow);
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
    // Eilutės skaičiuojamos iš vaikų viršutinių koordinačių, o ne height / lineHeight:
    // aukštis priklauso nuo eilučių tarpo, todėl dalyba apvalina neteisingai (LL-31).
    const tops = [...eyebrow.children]
      .map(el => Math.round(el.getBoundingClientRect().top))
      .sort((a, b) => a - b);
    const rows = [];
    for (const t of tops) if (!rows.length || t - rows[rows.length - 1] > lh / 2) rows.push(t);
    if (rows.length) {
      eyebrowLines = rows.length;
    } else {
      eyebrowLines = Math.max(1, Math.round(eyebrow.getBoundingClientRect().height / lh));
    }
    // Žyma yra flex elementas, todėl jos tekstas lūžta savo dėžutėje — aukštis išduoda.
    for (const el of eyebrow.querySelectorAll('.nowrap')) {
      const els = parseFloat(getComputedStyle(el).lineHeight) || lh;
      eyebrowNowrapLines = Math.max(eyebrowNowrapLines, Math.max(1, Math.round(el.getBoundingClientRect().height / els)));
    }
    // Ar blokas išvis galėjo tilpti: vaikų pločiai + tarpai ≤ turinio plotis.
    const kids = [...eyebrow.children];
    if (kids.length) {
      const gap = parseFloat(cs.columnGap) || 0;
      const need = kids.reduce((s, el) => s + el.getBoundingClientRect().width, 0) + gap * (kids.length - 1);
      const room = eyebrow.clientWidth - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0);
      eyebrowFit = need <= room + 0.5;
    }
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
  // Žymos („9 min.“) neturi lūžti į dvi eilutes — aukštis išduoda.
  const chipTall = [...document.querySelectorAll('.chip')]
    .map(c => Math.round(c.getBoundingClientRect().height)).filter(h => h > 34).length;

  // Ar simuliacija neprašo atsakymo TIK balsu (be teksto lauko ir be pasirinkimų)?
  const readoutText = (document.querySelector('#sim-readout')?.innerText || '');
  const hasTypedInput = !!document.querySelector('#sim-controls input, #sim-controls textarea, #sim-stage input, #sim-stage textarea');
  const voiceOnly = /pasakyk/i.test(readoutText) && !hasTypedInput && visibleSim.length <= 1;

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
    eyebrowNowrapLines,
    eyebrowFit,
    chipTall,
    voiceOnly,
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
    # Antraštės metaduomenys: žymos lūžimas — klaida visur; bloko lūžimas —
    # klaida ties standarto riba ir plačiau, o žemiau jos toleruojamas ir
    # parodomas kaip pastaba (LL-05 vs LL-37, #4348). Sąmoningai NEginčijama
    # pagal išmatuotą „ar galėjo tilpti“: min-content įvertis klysta, kai
    # krypties pavadinimas lūžta savo dėžutėje, o klaidingai raudonas vartas
    # stabdo visą eilę (tai ir buvo #4348 priežastis).
    eyebrow_ok = (
        data["eyebrowNowrapLines"] <= 1
        and (data["eyebrowLines"] <= 1 or viewport["width"] < STANDARD_MIN_WIDTH)
    )
    data["ok"] = (
        data["overflow"] <= 1
        and data["tasks"] > 0
        and data["tasksVisible"] == data["tasks"]
        and data["smallCount"] == 0
        and not data["clipped"]
        and not data["loading"]
        and not data["fatal"]
        and not data["errors"]
        and eyebrow_ok
        and data["simVisibleControls"] >= 1
        and data["chipTall"] == 0
        and not data["voiceOnly"]
        and not data["simHiddenControls"]
    )
    return data


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="https://one-man-company.github.io/suprask/")
    ap.add_argument("--module", default="")
    ap.add_argument("--viewports", default="desktop,phone,small")
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

    names = [v.strip() for v in args.viewports.split(",") if v.strip()]
    unknown = [v for v in names if v not in VIEWPORTS]
    if unknown:
        # Tylus nežinomo ploto numetimas ataskaitoje atrodytų kaip patikrintas
        # plotis (LL-37), todėl klaida sakoma garsiai, o ne praleidžiama.
        print(f"KLAIDA: nežinomi plotai {', '.join(unknown)}; galimi: {', '.join(VIEWPORTS)}", file=sys.stderr)
        return 2
    if not names:
        print(f"KLAIDA: --viewports tuščias; galimi: {', '.join(VIEWPORTS)}", file=sys.stderr)
        return 2
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
    plane_list = ", ".join(f"{n} {VIEWPORTS[n]['width']}px" for n in names)
    if args.json:
        print(json.dumps({
            "base": args.base,
            "viewports": {n: VIEWPORTS[n] for n in names},
            "checked": len(results),
            "problems": bad,
            # Toleruoti atvejai (antraštė lūžta tik todėl, kad netelpa žemiau
            # standarto pločio) — atskirai, kad neliktų paslėpti serveryje (LL-37).
            "notes": [r for r in results if r.get("ok") and r.get("eyebrowLines", 1) > 1],
            "all": results,
        }, ensure_ascii=False))
    else:
        print(f"Plotai: {plane_list}")
        print(f"Patikrinta: {len(results)} (maršrutų: {len(routes)} · plotų: {len(names)}) · problemos: {len(bad)}")
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
            if r.get("eyebrowNowrapLines", 1) > 1:
                bits.append(f"antraštės žyma „min.“ lūžta į {r['eyebrowNowrapLines']} eilutes")
            elif r.get("eyebrowLines", 1) > 1:
                bits.append(f"antraštė lūžta į {r['eyebrowLines']} eilutes"
                            + (" (blokas tilptų)" if r.get("eyebrowFit") else ""))
            if r.get("chipTall"):
                bits.append(f"žymų dviejų eilučių: {r['chipTall']}")
            if r.get("voiceOnly"):
                bits.append("atsakymas tik balsu (nėra teksto lauko)")
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
        # Toleruotas, bet ne tylus atvejis (LL-37): antraštė lūžta žemiau standarto
        # pločio, nes turinys realiai netelpa. Tai ne klaida, bet ataskaitoje matoma.
        soft = [r for r in results if r.get("ok") and r.get("eyebrowLines", 1) > 1]
        for r in soft:
            print(f"  · {r['route']} @{r['viewport']}px: antraštė {r['eyebrowLines']} eilutės — "
                  f"plotis žemiau standarto {STANDARD_MIN_WIDTH} px; žyma vienoje eilutėje")
        if not bad:
            print("✔ Visi moduliai matomi ir telpa visuose plotuose (su Brave skydų blokais).")

    return 1 if bad else 0


if __name__ == "__main__":
    raise SystemExit(main())
