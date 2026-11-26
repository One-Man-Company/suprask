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

# Scenos rėmo slenkstis ir sąmoningo pertekliaus sąrašas yra VIENAME šaltinyje
# (`check_svg_fit.py`), kad `check_view` ir atskiras įrankis nesiskirtų (LL-38).
# Importuojama iš to paties katalogo, todėl veikia ir paleidus
# `python3 scripts/check_view.py`, ir importavus kaip modulį.
try:
    from check_svg_fit import EXCEPTIONS as SVG_FIT_EXCEPTIONS, TOL as SVG_TOL
except ImportError:  # paleidimas iš repo šaknies be scripts/ sys.path
    sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
    from check_svg_fit import EXCEPTIONS as SVG_FIT_EXCEPTIONS, TOL as SVG_TOL

VIEWPORTS = {
    "desktop": {"width": 1440, "height": 900},
    "tablet": {"width": 1024, "height": 768},
    "phone": {"width": 390, "height": 844},
    # 360 px — pigiausių Android telefonų plotis ir standarto §4.6 riba.
    "small": {"width": 360, "height": 780},
    # `tiny` = 320 px. SĄMONINGAI neįtrauktas į numatytąjį sąrašą (#4921):
    # standartas žemiau 360 px nieko nežada, todėl šis plotas yra
    # diagnostika pigiausiam telefonui (`--viewports tiny`), o ne vartas.
    # Be jo tolerancijos šaka (`width < STANDARD_MIN_WIDTH`) buvo
    # nepasiekiama per CLI — taisyklė egzistavo, bet jos niekas negalėjo
    # išbandyti.
    "tiny": {"width": 320, "height": 780},
}

# Numatytasis sąrašas lieka BE `tiny`: publikavimo vartai neturi tapti
# griežtesni už standartą.
DEFAULT_VIEWPORTS = "desktop,phone,small"

# Standarto §4.6 mažiausias palaikomas plotis. Antraštės metaduomenys privalo
# tilpti vienoje eilutėje ties šiuo pločiu ir plačiau; žemiau jo lūžimas
# toleruojamas tik tada, kai turinys realiai netelpa (žr. docstring).
STANDARD_MIN_WIDTH = 360

BRAVE_INIT = """
try { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('insecure', 'SecurityError'); } }); } catch (e) {}
try { Object.defineProperty(Crypto.prototype, 'subtle', { get() { return undefined; } }); } catch (e) {}
try { Object.defineProperty(window, 'speechSynthesis', { get() { return undefined; } }); } catch (e) {}
"""

# Skaitomiausias simuliacijos tekstas. Riba dar NĖRA `docs/` dokumente, todėl
# numatytajame bėgime tai PASTABA, o ne vartas. 2026-11-24 išmatuota: 43 iš 73
# modulių turi bent vieną vaikui skaitomą `#sim-stage` / `#sim-controls` /
# `#sim-readout` teksto mazgą, mažesnį už 14 px (žemiausias — 9,7 px,
# 19-simto-skaiciu-lentele). Raudoni vartai 43 moduliams be pataisymo moko juos
# apeiti (tas pats motyvas kaip #7396 `--text-scale`), o nutylėti negalima —
# todėl matuojama VISADA ir parodoma ataskaitoje (LL-37). `--sim-font-strict`
# paverčia pastabą klaida tiems, kurie jau taiso turinį.
SIM_FONT_FLOOR = 14.0

# 200 % teksto režimas (#7396, WCAG 1.4.4). Šaknies šriftas 16 → 32 px.
# Kodėl atskiras režimas, o ne numatytasis: žmogus su padidintu tekstu yra
# realus naudotojas, bet jo patikra neturi blokuoti publikavimo tol, kol
# defektai nesutvarkyti — kitaip vartai būna raudoni be priežasties, o tai
# moko juos apeiti (`#7396` sąmoningai taip ir siūlė).
TEXT_SCALE_INIT = """
() => {
  document.documentElement.style.fontSize = '32px';
  // `rem` kintamieji CSS'e skaičiuojami nuo šaknies, todėl vieno priskyrimo
  // pakanka: jokia kita transformacija nereikalinga ir neturi būti
  // (LL-40 — matuojama tai, ką vaikas tikrai gauna, o ne zondo sugalvota
  // geometrija).
}
"""

# Kas išlenda už ekrano pločio 200 % teksto režime. Grąžinami KONKRETŪS
# elementai su pertekliumi, kad defektas turėtų adresatą, o ne skaičių
# (LL-36 / LL-40: taisymas ties zondo pločiu, o ne defekto ruože).
MEASURE_SCALED = r"""
() => {
  const vw = document.documentElement.clientWidth;
  const over = document.documentElement.scrollWidth - vw;
  const offenders = [];
  if (over > 1) {
    const all = [...document.querySelectorAll('body *')];
    for (const el of all) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const right = Math.round(r.right + window.scrollX);
      const bleed = Math.round(right - vw);
      if (bleed > 1) {
        // `className` ant SVG elementų yra `SVGAnimatedString`, ne tekstas —
        // be šios šakos ataskaitoje atsiranda „svg.[object SVGAnimatedString]“
        // ir defektas netenka adresato (LL-36).
        const cls = typeof el.className === 'string' ? el.className : (el.getAttribute('class') || '');
        offenders.push({
          sel: el.tagName.toLowerCase() + (cls ? '.' + cls.split(/\s+/).slice(0, 2).join('.') : ''),
          text: (el.textContent || '').trim().slice(0, 48),
          bleed,
          w: Math.round(r.width),
        });
      }
    }
    // Nuosekliausi (didžiausias perteklius, trumpiausias tekstas) — kad
    // ataskaitoje matytųsi tikrasis kaltininkas, o ne jo tėvai.
    offenders.sort((a, b) => (b.bleed - a.bleed) || (a.text.length - b.text.length));
  }
  return {
    width: vw,
    scrollWidth: document.documentElement.scrollWidth,
    overflow: over,
    rootFont: parseFloat(getComputedStyle(document.documentElement).fontSize) || 0,
    offenders: offenders.slice(0, 4),
  };
}
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

  // Simuliacijų tekstas: kas jame skaitoma, o ne tik užduoties kamienas.
  // `minTaskFont` matuoja .task-q; #sim-stage/#sim-controls/#sim-readout/#sim-note
  // šrifto nematė nė vienas laukas, todėl 9,7 px etiketė simuliacijoje buvo
  // „žalia“ (LL-06 taikoma tik zonai, kurią matuoja jos vartas).
  // Skaičiuojami TIK matomi tekstiniai mazgai; `aria-hidden` iliustracijos dalis
  // (pvz. dekoratyvūs skaičiai) neįtraukiamos, nes vaikas jų neskaito.
  //
  // Du aklosios zonos taisymai (2026-11-25):
  // 1) SVG `<text>` `font-size` yra viewBox vienetai, ne ekrano pikseliai:
  //    12 vienetų 360 vienetų scenoje, įsirėmusioje į 330 px, vaikui yra
  //    ~11 px, o 20 vienetų ikonos scenoje (0 0 20 20) — 16× daugiau. Be
  //    perskaičiavimo vartai praneša skaičių, kurio vaikas nemato, ir klysta
  //    į abi puses (LL-38 — slenkstis nuslinkęs nuo standarto).
  // 2) Mazgai, kuriuos scena užpildo TIK po pirmo veiksmo (`#ms-records`,
  //    `span.ms-seen`), teksto neturi, todėl seniau nebuvo matuojami nė karto
  //    (LL-37). Matuojami tušti mazgai, kuriems dydis DEKLARUOTAS (inline
  //    `font-size` arba klasės taisyklė), kad dekoratyvūs konteineriai
  //    neštų triukšmo.
  const svgScale = (el) => {
    if (!(el instanceof SVGElement)) return 1;
    // `getScreenCTM()` duoda tikrą vieneto → CSS px mastelį (įskaitant
    // viewBox ir `<g transform>`), todėl šriftas perskaičiuojamas tiksliai.
    const ctm = el.getScreenCTM && el.getScreenCTM();
    if (ctm && ctm.a > 0) return ctm.a;
    const svg = el.ownerSVGElement;
    const vb = svg && svg.viewBox && svg.viewBox.baseVal;
    if (!vb || !vb.width || !vb.height) return 1;
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return 1;
    // preserveAspectRatio numatytasis (`meet`) — telpa į abi ašis.
    const k = Math.min(r.width / vb.width, r.height / vb.height);
    return k > 0 ? k : 1;
  };
  const classSizes = new Map();
  try {
    for (const sheet of document.styleSheets) {
      let rules = null;
      try { rules = sheet.cssRules; } catch (e) { continue; }
      for (const rule of rules || []) {
        const st = rule.style;
        if (!st || !st.fontSize) continue;
        for (const sel of (rule.selectorText || '').split(',')) {
          const m = sel.trim().match(/^\.([A-Za-z0-9_-]+)$/);
          if (m && !classSizes.has(m[1])) classSizes.set(m[1], st.fontSize);
        }
      }
    }
  } catch (e) { /* skersinės kilmės lapas — lieka tik inline deklaracijos */ }
  const selName = (el) => {
    const cls = typeof el.className === 'string' ? el.className : (el.getAttribute('class') || '');
    return el.tagName.toLowerCase() + (cls ? '.' + cls.trim().split(/\s+/).slice(0, 2).join('.') : '');
  };
  const simText = [];
  let svgScaled = 0;
  let emptyMeasured = 0;
  for (const zone of document.querySelectorAll('#sim-stage, #sim-controls, #sim-readout, #sim-note')) {
    if (!zone.getClientRects().length) continue;
    const walker = document.createTreeWalker(zone, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const txt = (node.textContent || '').trim();
      if (!txt) continue;
      const el = node.parentElement;
      if (!el || el.closest('[aria-hidden="true"]')) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const factor = svgScale(el);
      if (factor !== 1) svgScaled++;
      const px = (parseFloat(cs.fontSize) || 0) * factor;
      if (!px) continue;
      simText.push({
        px: Math.round(px * 10) / 10,
        sel: selName(el),
        text: txt.slice(0, 32),
      });
    }
    // Tušti, bet deklaruoto dydžio mazgai — būsena, kuri atsiras po veiksmo.
    for (const el of zone.querySelectorAll('*')) {
      if (el.children.length || (el.textContent || '').trim()) continue;
      if (el.closest('[aria-hidden="true"]')) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
      const cls = typeof el.className === 'string' ? el.className : (el.getAttribute('class') || '');
      const declared = /font-size\s*:/i.test(el.getAttribute('style') || '')
        || cls.split(/\s+/).some((n) => classSizes.has(n));
      if (!declared) continue;
      const px = (parseFloat(cs.fontSize) || 0) * svgScale(el);
      if (!px) continue;
      emptyMeasured++;
      simText.push({
        px: Math.round(px * 10) / 10,
        sel: selName(el),
        text: '(tuščias)',
      });
    }
  }
  simText.sort((a, b) => (a.px - b.px) || (a.text.length - b.text.length));

  // Scena gali tilpti puslapyje ir vis tiek būti kerpama SAVO SVG rėmo
  // (`overflow:hidden`), o tada vaikas mato nukirptą medį (LL-124, LL-207).
  // `check_svg_fit.py` matuoja būtent tai, bet jo nepaleido nė vienas kelias;
  // todėl tas pats matavimas atliekamas čia, kurį kiekvienas vaidmuo ir taip
  // paleidžia savo baigties sąlygoje. Slenkstis ir išimtys — iš `check_svg_fit`
  // (vienas šaltinis, kad dokumente cituojamas skaičius nesiskirtų nuo vartų).
  const svgClip = [];
  for (const svg of document.querySelectorAll('#sim-stage svg')) {
    const box = svg.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) continue;
    let over = 0, worst = null;
    for (const el of svg.querySelectorAll('path,rect,circle,ellipse,line,polygon,polyline,text,image,use')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const m = Math.max(box.left - r.left, box.top - r.top, r.right - box.right, r.bottom - box.bottom);
      if (m > over) { over = m; worst = el.tagName.toLowerCase(); }
    }
    if (over > 0) {
      svgClip.push({
        over: Math.round(over * 10) / 10,
        tag: worst,
        w: Math.round(box.width),
        h: Math.round(box.height),
        overflowStyle: getComputedStyle(svg).overflow,
      });
    }
  }

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
    // Skaitomiausias simuliacijos tekstas (px) ir trys mažiausi mazgai su
    // adresatu — kad pastaba turėtų failą, o ne tik skaičių (LL-36).
    simFonts: {
      min: simText.length ? simText[0].px : null,
      nodes: simText.length,
      svgScaled,
      empty: emptyMeasured,
      worst: simText.slice(0, 3),
    },
    loading: !!document.querySelector('.loading'),
    fatal: !!document.querySelector('.boot-fallback') && getComputedStyle(document.querySelector('.boot-fallback')).opacity === '1',
    title: document.querySelector('h1') ? document.querySelector('h1').innerText : null,
    // Scenos rėmo kerpamumas (`check_svg_fit.py` matavimas tame pačiame
    // puslapio įkėlime). Žalias tik tada, kai nieko nekerpa ARBA perteklius
    // neviršija tolerancijos; sprendimą priima `check_route()` su išimtimis.
    svgClip,
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


def svg_fit_verdict(module_id: str, clips: list[dict]) -> tuple[list[dict], list[dict]]:
    """Scenos rėmo sprendimas: (klaidos, sąmoningos išimtys).

    Išskirta iš `check_route()`, kad zondas galėtų patikrinti sprendimą be
    naršyklės: slenkstis, `overflow` sąlyga ir `EXCEPTIONS` yra tos pačios
    taisyklės, kurias naudoja `check_svg_fit.py` (LL-38).
    """
    bad, notes = [], []
    for c in clips or []:
        if float(c.get("over") or 0) <= SVG_TOL:
            continue
        if c.get("overflowStyle") == "visible":
            # Neriboja – vaikas mato visą piešinį, net jei jis didesnis už rėmą.
            continue
        (notes if module_id in SVG_FIT_EXCEPTIONS else bad).append(c)
    return bad, notes


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
    # Scenos rėmas (LL-124, LL-207). Slenkstis ir sąmoningo pertekliaus sąrašas
    # imami iš `check_svg_fit.py`, kad vartai ir dokumente cituojamas skaičius
    # nesiskirtų (LL-38). Sprendžiama TIK tada, kai SVG tikrai kerpa
    # (`overflow != visible`) ir perteklius viršija toleranciją.
    module_id = route.rsplit("/", 1)[-1]
    data["svgClipped"], data["svgClipNotes"] = svg_fit_verdict(module_id, data.get("svgClip") or [])
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
        and not data["svgClipped"]
    )
    return data


def check_scaled(page, base: str, route: str, viewport: dict, scale: int) -> dict:
    """Modulis su padidintu tekstu: ar neatsiranda horizontali slinktis (#7396).

    Skirta nuo `check_route()`: ten matuojama, ką vaikas pamato įprastu
    šriftu; čia — ką pamato žmogus, pasididinęs tekstą 200 %. Matuojamas
    TAS PATS turinys, todėl defektą galima priskirti konkrečiam moduliui,
    o ne „svetainei apskritai“ (LL-40).
    """
    errors: list[str] = []
    page.on("pageerror", lambda e: errors.append(str(e)[:160]))
    page.on("console", lambda m: errors.append("console: " + m.text[:160]) if m.type == "error" else None)

    url = f"{base.rstrip('/')}/#/modulis/1/{route}"
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=25000)
        page.wait_for_selector(".task", timeout=12000)
        # Šriftas didinamas PO to, kai turinys įkeltas: prieš įkeliant
        # naršyklė dar neturi ko pertvarkyti, o matavimas būtų tuščias.
        page.evaluate(TEXT_SCALE_INIT)
        page.wait_for_timeout(400)
    except Exception as exc:  # noqa: BLE001
        return {"route": route, "viewport": viewport["width"], "scale": scale,
                "errors": errors + [f"nepasikrovė: {exc}"[:160]], "ok": False}

    data = page.evaluate(MEASURE_SCALED)
    data["route"] = route
    data["viewport"] = viewport["width"]
    data["scale"] = scale
    data["errors"] = errors[:5]
    # Pastaba apie šaknies šriftą: jei jis nepakilo (pvz., CSS naudoja
    # absoliučius px visame puslapyje), matavimas būtų apie nieką ir tai
    # turi būti pasakyta, o ne nutylėta (LL-37).
    data["scale_applied"] = data.get("rootFont", 0) >= 30
    data["ok"] = data["overflow"] <= 1 and not data["errors"]
    return data


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="https://one-man-company.github.io/suprask/")
    ap.add_argument("--module", default="")
    ap.add_argument("--viewports", default=DEFAULT_VIEWPORTS)
    ap.add_argument("--text-scale", type=int, default=0, metavar="N",
                    help="padidinti šaknies šriftą N %% (200 = WCAG 1.4.4); "
                         "atskiras režimas, neįtrauktas į numatytąjį bėgimą")
    ap.add_argument("--sim-font-min", type=float, default=SIM_FONT_FLOOR, metavar="PX",
                    help=f"mažiausias skaitomas simuliacijos teksto dydis "
                         f"(numatyta {SIM_FONT_FLOOR:g} px, 1 kl.)")
    ap.add_argument("--sim-font-strict", action="store_true",
                    help="simuliacijos tekstas žemiau ribos yra KLAIDA (vartai), "
                         "ne pastaba")
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
    scaled: list[dict] = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=chrome, args=["--no-sandbox"])
        for vname in names:
            vp = VIEWPORTS[vname]
            ctx = browser.new_context(viewport=vp, device_scale_factor=1)
            ctx.add_init_script(BRAVE_INIT)
            page = ctx.new_page()
            # DU ATSKIRI ĖJIMAI, ne vienas su šakiniu if'u. `check_scaled()`
            # nustato `documentElement.style.fontSize = '32px'`, o maršrutizatorius
            # yra HASH'inis — `page.goto()` su kitu `#/...` NEperkrauna dokumento,
            # todėl inline stilius išlieka. 2026-11-21 pamatuota: maišant režimus
            # tame pačiame puslapyje, įprasto bėgimo `minTaskFont` rodė 37,12 px
            # (padidintas!), o 47/51 maršrutų virto klaidingais praleidimais.
            # Todėl pirmiausia išmatuojamas VISAS įprastas turinys, tik paskui —
            # padidintas (LL-40: matuok tai, ką vaikas gauna, o ne tai, ką paliko
            # ankstesnis zondas).
            for route in routes:
                results.append(check_route(page, args.base, route["route"], vp))
            if args.text_scale:
                for route in routes:
                    scaled.append(check_scaled(page, args.base, route["route"], vp, args.text_scale))
            ctx.close()
        browser.close()

    bad = [r for r in results if not r.get("ok")]
    # Simuliacijų skaitomumas: matuojama visada, bet numatytajame bėgime —
    # pastaba (riba dar nėra docs/ dokumente). `--sim-font-strict` paverčia klaida.
    font_low = [
        r for r in results
        if (r.get("simFonts") or {}).get("min") is not None
        and r["simFonts"]["min"] < args.sim_font_min
    ]
    font_low.sort(key=lambda r: r["simFonts"]["min"])
    font_bad = font_low if args.sim_font_strict else []
    scaled_bad = [r for r in scaled if not r.get("ok")]
    # Šaknies šriftas, kuris nepakilo, reiškia, kad matavimas buvo apie nieką.
    # Tai atskiriama nuo „telpa“ (LL-37), nes kitaip žalias rezultatas
    # reikštų priešingai, nei rodo.
    scale_unapplied = [r for r in scaled if not r.get("scale_applied")]
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
            # Simuliacijų skaitomumas (1 kl. riba). `notes` neturi tapti
            # klaida numatytajame bėgime, bet ir tylėti negali (LL-37):
            # todėl atskiras laukas su KIEKVIENU žemiau ribos maršrutu.
            "sim_font_floor": args.sim_font_min,
            "sim_font_strict": args.sim_font_strict,
            "sim_font_notes": [
                {"route": r["route"], "viewport": r["viewport"],
                 "min": r["simFonts"]["min"], "worst": r["simFonts"]["worst"],
                 "svg_scaled": r["simFonts"].get("svgScaled", 0),
                 "empty": r["simFonts"].get("empty", 0)}
                for r in font_low
            ],
            "sim_font_checked": sum(1 for r in results if (r.get("simFonts") or {}).get("min") is not None),
            "sim_font_problems": [r["route"] for r in font_bad],
            # Scenos rėmo matavimas (LL-124, LL-207): tas pats, kurį daro
            # `check_svg_fit.py`, bet atliktas kiekvieno modulio patikros metu,
            # todėl jo nepaleisti nebegalima atskirai „neprisiminus“.
            "svg_fit_tol": SVG_TOL,
            "svg_fit_checked": sum(1 for r in results if r.get("svgClip") is not None),
            "svg_fit_unmeasured": [
                {"route": r["route"], "viewport": r["viewport"]}
                for r in results if r.get("svgClip") is None
            ],
            "svg_fit_problems": [
                {"route": r["route"], "viewport": r["viewport"], "worst": r["svgClipped"][0]}
                for r in results if r.get("svgClipped")
            ],
            "svg_fit_notes": [
                {"route": r["route"], "viewport": r["viewport"], "worst": r["svgClipNotes"][0]}
                for r in results if r.get("svgClipNotes")
            ],
            # 200 % teksto režimas (#7396) — tik kai paprašytas; `null` reiškia
            # „nematuota“, o ne „švaru“.
            "text_scale": args.text_scale or None,
            "scaled_checked": len(scaled) if args.text_scale else None,
            "scaled_problems": scaled_bad if args.text_scale else None,
            "scaled_unapplied": [r["route"] for r in scale_unapplied] if args.text_scale else None,
            "all": results,
            "scaled_all": scaled if args.text_scale else None,
        }, ensure_ascii=False))
    else:
        print(f"Plotai: {plane_list}")
        print(f"Patikrinta: {len(results)} (maršrutų: {len(routes)} · plotų: {len(names)}) · "
              f"problemos: {len(bad) + len(font_bad)}")
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
            if r.get("svgClipped"):
                c = r["svgClipped"][0]
                bits.append(f"scena kerpama savo rėme {c['over']}px (<{c['tag']}>, {c['w']}×{c['h']}px)")
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
        # Sąmoningas scenos perteklius (EXCEPTIONS) — ne klaida, bet parodomas,
        # kad deklaruota išimtis neliktų nematoma (LL-37, LL-38).
        for r in results:
            for c in (r.get("svgClipNotes") or []):
                print(f"  · {r['route']} @{r['viewport']}px: scena sąmoningai kerpa {c['over']}px — "
                      f"{SVG_FIT_EXCEPTIONS[r['route'].rsplit('/', 1)[-1]]}")
        # Simuliacijų skaitomumas: VISADA spausdinama, jei yra ką pasakyti.
        # Riba dar nėra docs/ dokumente, todėl numatytai tai pastaba; su
        # `--sim-font-strict` — klaida. Skaičius + sąrašas, kad neliktų „tylios
        # ribos“ (LL-37): sakoma, kiek maršrutų žemiau ribos ir kuris žemiausias.
        checked_font = sum(1 for r in results if (r.get("simFonts") or {}).get("min") is not None)
        if font_low:
            if args.sim_font_strict:
                mark, head = "✗", "klaida"
            else:
                mark, head = "·", "pastaba, ne vartas — ribos dar nėra docs/"
            print(f"  {mark} simuliacijų tekstas < {args.sim_font_min:g} px: "
                  f"{len(font_low)} iš {checked_font} patikrų ({head})")
            for r in font_low[:10]:
                w = r["simFonts"]["worst"][0]
                print(f"      {r['simFonts']['min']:>5} px  {r['route']} @{r['viewport']}px  "
                      f"{w['sel']} „{w['text']}“")
            if len(font_low) > 10:
                print(f"      … ir dar {len(font_low) - 10} (visi — --json sim_font_notes)")
        if not bad and not font_bad:
            print("✔ Visi moduliai matomi ir telpa visuose plotuose (su Brave skydų blokais).")
        # 200 % teksto režimas (#7396) — atskira sekcija, kad žalias įprastas
        # bėgimas niekada neatrodytų kaip žalias ir padidintam tekstui.
        if args.text_scale:
            print(f"\nTekstas {args.text_scale} % (WCAG 1.4.4): patikrinta {len(scaled)} · "
                  f"problemos: {len(scaled_bad)}")
            if scale_unapplied:
                print(f"  ! šaknies šriftas nepakilo {len(scale_unapplied)} maršrutuose — "
                      f"matavimas nepatikimas: {', '.join(r['route'] for r in scale_unapplied[:3])}")
            for r in scaled_bad[:12]:
                who = (r.get("offenders") or [{}])[0]
                where = (f"{who.get('sel', '?')} „{who.get('text', '')[:34]}“ "
                         f"+{who.get('bleed', 0)}px") if who else "nežinoma"
                bits = [f"slinktis {r.get('overflow', 0)}px", where]
                for e in (r.get("errors") or [])[:1]:
                    bits.append(e[:60])
                print(f"  ✗ {r['route']} @{r['viewport']}px: " + "; ".join(bits))
            if not scaled_bad:
                print("  ✔ Tekstas telpa ir 200 % dydžiu.")

    # `--text-scale` problemos NEGRĄŽINA ne-nulinio kodo, kol defektai
    # nesutvarkyti: #7396 sąmoningai prašė atskiro režimo, nes raudoni vartai
    # be pataisymo moko juos apeiti. Tai pasakyta, o ne nutylėta (LL-37).
    return 1 if (bad or font_bad) else 0


if __name__ == "__main__":
    raise SystemExit(main())
