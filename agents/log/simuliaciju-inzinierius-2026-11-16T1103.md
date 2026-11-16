# simuliaciju-inzinierius — 2026-11-16T1103

- paleidimas: #315 (manual)
- trukmė: 670s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ assets/js/sims/pasaulis.js
│ @@ -2279,17 +2279,27 @@
│  const KG_STEM_BASE = 40;          // pradinis stiebo aukštis
│  const KG_BALL_REST = 246;
│  const KG_BALL_MOVED = 282;
│ -const KG_MAX_WEEKS = 3;           // dvi savaitės + trečia, kai abi buvo vienodos
│
│  const kasGyvas = {
│    mount({ stage, controls, api, config = {} }) {
│      const objects = Array.isArray(config.objects) && config.objects.length
│        ? config.objects
│        : [
│ -        { id: "augalas", name: "pupos daigas" },
│ -        { id: "akmenukas", name: "akmenukas" },
│ -        { id: "kamuoliukas", name: "kamuoliukas" },
│ +        { id: "augalas", name: "pupos daigas", art: "plant" },
│ +        { id: "akmenukas", name: "akmenukas", art: "pebble" },
│ +        { id: "kamuoliukas", name: "kamuoliukas", art: "ball" },
│        ];
│ +    /* Kuris daiktas reaguoja, sprendžiama iš iliustracijos (`art: "plant"`),
│ +       o ne iš įrašyto ID: scenoje augalas piešiamas visada tame pačiame
│ +       langelyje, todėl skaičius privalo priklausyti būtent jam. */
│ +    const plantObj = objects.find((o) => o.art === "plant")
│ +      || objects.find((o) => o.id === "augalas")
│ +      || objects[0];
│ +    const reactive = (plantObj || {}).id || "";
│ +    /* `config.weeks` yra minimalus savaičių skaičius. Jei joje pokytis 0
│ +       (dvi priešingos savaitės), modelis visada leidžia dar vieną savaitę —
│ +       kitaip vaikas liktų aklavietėje su nuliu ir nepamatytų jokio pokyčio. */
│ +    const baseWeeks = Math.max(2, Math.min(5, Math.floor(Number(config.weeks)) || 2));
│      const S = config.sentences || {};
│      const growthPx = Number(config.growthPx) > 0 ? Number(config.growthPx) : KG_PAD;
│      const step = growthPx / KG_PAD;          // padalos per savaitę
│ assets/js/sims/pasaulis.js
│ @@ -2357,11 +2357,17 @@
│      const q = (sel) => controls.querySelector(sel);
│      const guessButtons = [...controls.querySelectorAll("[data-guess]")];
│
│ -    const changeOf = (id) => (id === "augalas"
│ +    /* Vienas skaičiaus šaltinis. Anksčiau lentelė ėjo iš grynosios sumos, o
│ +       sakinys — iš palyginimo „ar savaitės skyrėsi“: dviejų priešingų savaičių
│ +       kelyje suma visada 0, o sakinys vis tiek skelbė pokytį ir `api.progress`
│ +       įsirašydavo būtent tada, kai visi trys skaičiai 0 (LL-17). Dabar ir
│ +       skaičius, ir piešinys, ir sakinys, ir pažanga imami iš `changeOf()`. */
│ +    const changeOf = (id) => (id === reactive
│        ? weeks.reduce((sum, wet) => sum + (wet ? step : -step), 0)
│        : 0);
│      const signed = (v) => (v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : "0");
│ -    const contrast = () => weeks.some((w, i) => weeks.slice(i + 1).some((x) => x !== w));
│ +    const plantChange = () => changeOf(reactive);
│ +    const anyChange = () => objects.some((o) => changeOf(o.id) !== 0);
│
│      const paint = (btn, on) => {
│        btn.style.background = on ? "var(--ink)" : "var(--paper-2)";
│ assets/js/sims/pasaulis.js
│ @@ -2376,9 +2376,13 @@
│      };
│
│      function scene() {
│ -      const change = changeOf("augalas");
│ -      const h = Math.max(24, Math.min(84, KG_STEM_BASE + change * KG_PAD));
│ -      const dry = weeks.length > 0 && weeks[weeks.length - 1] === false;
│ +      const change = plantChange();
│ +      /* Visa išvaizda yra TIK `change` funkcija: aukštis, nusvirimas ir spalva.
│ +         Anksčiau nusvirimą lėmė paskutinė savaitė, o skaičių — suma, todėl
│ +         „laistyk → nelaistyk“ rodė nusvirusį augalą su skaičiumi 0. Dabar
│ +         piešinys ir skaičius negali išsiskirti pagal konstrukciją. */
│ +      const dry = change < 0;
│ +      const h = Math.max(16, Math.min(84, KG_STEM_BASE + change * KG_PAD));
│        const leafS = Math.max(8, Math.min(13, 10 + change));
│        const ballX = ballMoved ? KG_BALL_MOVED : KG_BALL_REST;
│        const stemCol = dry ? "#8d7a55" : "#4c8b3a";
│ @@ -2397,13 +2401,17 @@
│          ${art.ball(ballX, 114, 26, "#f2cf94", "#a9793f")}
│          ${label(55, ["pupos", "daigas"])}${label(150, ["akmenukas"])}${label(262, ["kamuoliukas"])}`;
│
│ +      const weekWords = weeks.length === 1 ? "vienos savaitės"
│ +        : weeks.length === 2 ? "dviejų savaičių"
│ +          : weeks.length === 3 ? "trijų savaičių" : `${weeks.length} savaičių`;
│ +      const look = change < 0 ? `${nameOf(reactive)}: lapai nusvirę.`
│ +        : change > 0 ? `${nameOf(reactive)} didesnis nei pradžioje.`
│ +          : weeks.length ? `${nameOf(reactive)} toks pat kaip pradžioje.` : "";
│        svg.setAttribute("aria-label",
│ -        `Lentynoje pupos daigas, akmenukas ir kamuoliukas. `
│ -        + `${dry ? "Augalo lapai nuleisti." : "Augalas su lapais."}`
│ +        `Lentynoje ${objects.map((o) => o.name).join(", ")}. ${look}`
│          + (weeks.length
│ -          ? ` Po ${weeks.length === 1 ? "vienos savaitės" : weeks.length === 2 ? "dviejų savaičių" : "trijų savaičių"}`
│ -            + ` augalas ${signed(change)}.`
│ -          : ""));
│ +          ? ` Po ${weekWords} ${nameOf(reactive)} ${signed(change)}.`
│ +          : "").replace(/\s+/g, " "));
│      }
│
│      function render() {
│ assets/js/sims/pasaulis.js
│ @@ -2417,8 +2417,11 @@
│      function render() {
│        scene();
│
│ -      const change = changeOf("augalas");
│ -      const ended = weeks.length >= KG_MAX_WEEKS;
│ +      const change = plantChange();
│ +      /* Pabaiga — ne „praėjo N savaičių“, o „pokytis matomas“. Kol pokytis 0,
│ +         modelis duoda dar vieną savaitę, kad vaikas nepaliptų į aklavietę
│ +         su nuliu ir neprarastų galimybės pamatyti skirtumą (LL-17). */
│ +      const ended = weeks.length >= baseWeeks && change !== 0;
│
│        for (const btn of guessButtons) {
│          const on = btn.dataset.guess === guess;
│ assets/js/sims/pasaulis.js
│ @@ -2466,7 +2466,9 @@
│        const table = q("#kg-table");
│        if (weeks.length) {
│          table.style.display = "grid";
│ -        table.innerHTML = objects.map((o) => `<div style="min-width:0;border:2px solid var(--line);
│ +        table.innerHTML = `<div style="grid-column:1/-1;text-align:center;font-size:.8rem;
│ +          line-height:1.2;font-weight:700;color:var(--ink-soft)">Kiek pasikeitė</div>`
│ +          + objects.map((o) => `<div style="min-width:0;border:2px solid var(--line);
│            border-radius:var(--r-s);background:var(--paper-2);padding:.25rem .2rem;text-align:center">
│            <span style="display:block;font-size:.875rem;line-height:1.15;font-weight:700;color:var(--ink-soft);overflow-wrap:anywhere">${o.name}</span>
│            <strong style="display:block;font-size:1.15rem;line-height:1.25">${signed(changeOf(o.id))}</strong>
│ assets/js/sims/pasaulis.js
│ @@ -2482,15 +2482,15 @@
│        if (!guess) end = "Pirma spėk, tada spausk „Po savaitės“.";
│        else if (!weeks.length) end = "Spėjimas užrašytas. Pasirink vandenį ir spausk „Po savaitės“.";
│        else if (weeks.length === 1) end = "Viena savaitė. Ar kas nors pasikeitė?";
│ -      else if (contrast()) end = "Dvi savaitės. Palygink tris skaičius.";
│ -      else if (!ended) end = "Savaitės buvo vienodos. Pabandyk dar vieną kitaip.";
│ -      else end = "Modelis baigėsi. Paspausk „Iš naujo“.";
│ +      else if (change === 0) end = "Pokytis 0. Paspausk „Po savaitės“ dar kartą.";
│ +      else end = "Palygink skaičius: kas pasikeitė, o kas ne?";
│        q("#kg-end").textContent = end;
│
│ -      const weekWord = weeks.length === 1 ? "Viena savaitė"
│ -        : weeks.length === 2 ? "Dvi savaitės" : "Trys savaitės";
│ +      const weekWord = ["", "Viena savaitė", "Dvi savaitės", "Trys savaitės",
│ +        "Keturios savaitės", "Penkios savaitės", "Šešios savaitės"][weeks.length]
│ +        || `${weeks.length} savaičių`;
│        api.readout(weeks.length
│ -        ? `${weekWord}. Augalas ${signed(change)}. Akmenukas 0. Kamuoliukas 0.`
│ +        ? `${weekWord}. ` + objects.map((o) => `${o.name} ${signed(changeOf(o.id))}`).join(". ") + "."
│          : (guess ? `Tu sakei: ${nameOf(guess)}. Dabar pasirink vandenį.`
│            : "Kuris daiktas per savaitę pasikeis? Spėk."));
│
│ @@ -2499,16 +2499,25 @@
│        else if (!weeks.length) note = "Pasirink, ar šią savaitę laistysi.";
│        else if (flash) note = flash;
│        else if (weeks.length === 1) {
│ -        note = guess === "augalas"
│ -          ? "Tu sakei augalas. Taip ir įvyko."
│ -          : "Tu sakei kitaip. Pasikeitė augalas.";
│ -      } else if (contrast()) note = `${S.table || "Trys daiktai, vienas pasikeitė."} ${S.done || "Gyvas organizmas keičiasi pats."}`;
│ -      else if (!ended) note = "Savaitės buvo vienodos. Pakeisk vandenį ir pamatysi kitą kryptį.";
│ -      else note = "Kamuoliukas juda, bet lentelėje jo pokytis 0.";
│ +        note = guess === reactive
│ +          ? `Tu spėjai: ${nameOf(guess)}. Taip ir įvyko.`
│ +          : `Tu spėjai: ${nameOf(guess)}. Pasikeitė ${nameOf(reactive)}.`;
│ +      } else if (change !== 0) {
│ +        /* Sakinys imamas iš to paties `change`, kaip ir skaičius: jei bent
│ +           vienas skaičius neneiginis, teiginys „vienas pasikeitė“ yra tiesa. */
│ +        note = `${S.table || `Pasikeitė ${nameOf(reactive)}.`} ${S.done || "Gyvas organizmas keičiasi pats."}`;
│ +        if (ballMoved) note += ` ${S.pushNote || "Kamuoliukas nuriedėjo, bet jo pokytis 0."}`;
│ +      } else if (ended) {
│ +        note = S.zero || "Augalas grįžo į pradinį dydį: pokytis 0.";
│ +      } else {
│ +        /* Nulis po priešingų savaičių: skaičius teisingas (augalas grįžo į
│ +           pradinį dydį), bet modelis neturi palikti vaiko su nuliu vieno. */
│ +        note = `${S.zero || "Augalas grįžo į pradinį dydį: pokytis 0."} Paspausk „Po savaitės“ dar kartą.`;
│ +      }
│        api.note(note);
│
│        const speechKey = weeks.length ? `w${weeks.length}-${weeks[weeks.length - 1] ? "wet" : "dry"}` : "";
│ -      if (!reported && weeks.length >= 2 && contrast()) {
│ +      if (!reported && weeks.length >= 2 && change !== 0) {
│          reported = true;
│          spoken = speechKey;
│          api.progress({ correct: true });
│ assets/js/sims/pasaulis.js
│ @@ -2368,6 +2368,10 @@
│      const signed = (v) => (v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : "0");
│      const plantChange = () => changeOf(reactive);
│      const anyChange = () => objects.some((o) => changeOf(o.id) !== 0);
│ +    /* Modelis baigiasi, kai savaičių pakanka IR pokytis matomas. Nulio būsena
│ +       pabaiga nelaikoma — kitaip mygtukas užsirakintų, o vaikas liktų su
│ +       nuliu lentelėje (LL-17). */
│ +    const isEnded = () => weeks.length >= baseWeeks && plantChange() !== 0;
│
│      const paint = (btn, on) => {
│        btn.style.background = on ? "var(--ink)" : "var(--paper-2)";
│ assets/js/sims/pasaulis.js
│ @@ -2422,10 +2422,7 @@
│        scene();
│
│        const change = plantChange();
│ -      /* Pabaiga — ne „praėjo N savaičių“, o „pokytis matomas“. Kol pokytis 0,
│ -         modelis duoda dar vieną savaitę, kad vaikas nepaliptų į aklavietę
│ -         su nuliu ir neprarastų galimybės pamatyti skirtumą (LL-17). */
│ -      const ended = weeks.length >= baseWeeks && change !== 0;
│ +      const ended = isEnded();
│
│        for (const btn of guessButtons) {
│          const on = btn.dataset.guess === guess;
│ assets/js/sims/pasaulis.js
│ @@ -2538,7 +2538,8 @@
│      }
│
│      function nextWeek() {
│ -      if (!guess || weeks.length >= KG_MAX_WEEKS) return;
│ +      /* Viena savaitė virš `config.weeks` leidžiama tik tada, kai pokytis 0. */
│ +      if (!guess || isEnded() || weeks.length >= baseWeeks + 1) return;
│        weeks.push(watered);
│        flash = "";
│        render();
│ assets/js/sims/pasaulis.js
│ @@ -2558,7 +2558,7 @@
│      }
│
│      function setWater(value) {
│ -      if (weeks.length >= KG_MAX_WEEKS) return;
│ +      if (isEnded()) return;
│        watered = value;
│        flash = "";
│        render();
│ assets/js/sims/pasaulis.js
│ @@ -2508,8 +2508,6 @@
│             vienas skaičius neneiginis, teiginys „vienas pasikeitė“ yra tiesa. */
│          note = `${S.table || `Pasikeitė ${nameOf(reactive)}.`} ${S.done || "Gyvas organizmas keičiasi pats."}`;
│          if (ballMoved) note += ` ${S.pushNote || "Kamuoliukas nuriedėjo, bet jo pokytis 0."}`;
│ -      } else if (ended) {
│ -        note = S.zero || "Augalas grįžo į pradinį dydį: pokytis 0.";
│        } else {
│          /* Nulis po priešingų savaičių: skaičius teisingas (augalas grįžo į
│             pradinį dydį), bet modelis neturi palikti vaiko su nuliu vieno. */
│ assets/js/sims/pasaulis.js
│ @@ -2367,7 +2367,6 @@
│        : 0);
│      const signed = (v) => (v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : "0");
│      const plantChange = () => changeOf(reactive);
│ -    const anyChange = () => objects.some((o) => changeOf(o.id) !== 0);
│      /* Modelis baigiasi, kai savaičių pakanka IR pokytis matomas. Nulio būsena
│         pabaiga nelaikoma — kitaip mygtukas užsirakintų, o vaikas liktų su
│         nuliu lentelėje (LL-17). */
│ content/lt/grade-01/pasaulio-pazinimas/20-kas-gyvas.json
│ @@ -36,6 +36,7 @@
│          "guess": "Spėjimas užrašytas. Dabar pasirink vandenį.",
│          "grew": "Augalas paaugo. Kiti du nepakito.",
│          "dry": "Augalo lapai nuleisti. Kiti du nepakito.",
│ +        "zero": "Augalas grįžo į pradinį dydį: pokytis 0.",
│          "push": "Kamuoliukas nuriedėjo ir sustojo.",
│          "pushNote": "Jį pastūmei tu. Pats jis nejuda ir neauga.",
│          "table": "Trys daiktai, vienas pasikeitė.",
│ profiles/deepseek41flash/cache/scratch/k315_kasgyvas.py
│ @@ -0,0 +1,219 @@
│ +#!/usr/bin/env python3
│ +"""Zondas #18245 / LL-17: ar kas-gyvas skaičius, piešinys, sakinys ir pažanga
│ +imami iš to paties šaltinio.
│ +
│ +Tikrina:
│ +1. VISOS 14 būsenų sekų (1-3 savaitės): ar augalo skaičius != 0 tada ir tik
│ +   tada, kai piešinys skiriasi nuo pradinio kadro.
│ +2. Ar `simDone` įsirašo tik tada, kai lentelėje bent vienas skaičius != 0.
│ +3. Ar sakinys „vienas pasikeitė“ niekada nepasirodo, kai visi skaičiai 0.
│ +4. Ar nėra aklavietės: jei pokytis 0, mygtukas „Po savaitės“ lieka įjungtas.
│ +5. 360/390/1440 px: slinktis, taikiniai, lentelės antraštė.
│ +6. Klaviatūra: Tab/Enter, fokusas neiškrenta.
│ +
│ +Paleidimas: .venv/bin/python <šis failas> [--base http://127.0.0.1:8899/]
│ +"""
│ +from __future__ import annotations
│ +
│ +import argparse
│ +import json
│ +import pathlib
│ +import sys
│ +
│ +BASE_DEFAULT = "http://127.0.0.1:8899/"
│ +ROUTE = "#/modulis/1/pasaulio-pazinimas/20-kas-gyvas"
│ +CHROME = str(pathlib.Path.home() / ".local/bin/google-chrome")
│ +
│ +SNAP = """
│ +() => {
│ +  const g = (sel) => { const el = document.querySelector(sel); return el ? el : null; };
│ +  const table = g('#kg-table');
│ +  const cells = {};
│ +  if (table && table.style.display !== 'none') {
│ +    const divs = [...table.children].filter(d => !(d.getAttribute('style') || '').includes('grid-column'));
│ +    for (const d of divs) {
│ +      const n = d.querySelector('span')?.textContent.trim() || '?';
│ +      const v = d.querySelector('strong')?.textContent.trim() || '?';
│ +      cells[n] = v;
│ +    }
│ +  }
│ +  const store = (() => { try { return JSON.parse(localStorage.getItem('suprask:progress:v1') || '{}'); } catch (e) { return {}; } })();
│ +  const rec = store['20-kas-gyvas'] || null;
│ +  const svg = g('#kg-scene');
│ +  const strokes = svg ? [...svg.querySelectorAll('path')].map(p => (p.getAttribute('stroke') || '') + '|' + (p.getAttribute('fill') || '')) : [];
│ +  const target = [...document.querySelectorAll('#sim-controls button, #sim-controls [role=button]')]
│ +    .map(el => { const r = el.getBoundingClientRect(); return { t: (el.textContent || '').trim().slice(0, 18), h: Math.round(r.height), w: Math.round(r.width) }; });
│ +  const caption = table ? (table.querySelector('div[style*="grid-column"]')?.textContent.trim() || '') : '';
│ +  return {
│ +    readout: (g('#sim-readout')?.textContent || '').trim(),
│ +    note: (g('#sim-note')?.textContent || '').trim(),
│ +    end: (g('#kg-end')?.textContent || '').trim(),
│ +    aria: svg ? (svg.getAttribute('aria-label') || '') : '',
│ +    svgHtml: svg ? svg.innerHTML.replace(/\\s+/g, ' ') : '',
│ +    strokes,
│ +    cells,
│ +    caption,
│ +    captionClipped: table ? [...table.querySelectorAll('div[style*="grid-column"]')].some(e => e.scrollWidth > e.clientWidth + 2) : false,
│ +    weekDisabled: (() => { const b = g('#kg-week'); return b ? b.disabled : null; })(),
│ +    resetDisabled: (() => { const b = g('#kg-reset'); return b ? b.disabled : null; })(),
│ +    simDone: !!(rec && rec.simDone === true),
│ +    goalMarks: document.querySelectorAll('.sim-goal').length,
│ +    overflow: document.documentElement.scrollWidth - window.innerWidth,
│ +    smallTargets: target.filter(t => t.h < 48 || t.w < 24),
│ +    focusId: document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : '',
│ +    store: rec,
│ +  };
│ +}
│ +"""
│ +
│ +SEQS = [
│ +    [True], [False],
│ +    [True, True], [True, False], [False, True], [False, False],
│ +    [True, True, True], [True, True, False], [True, False, True], [True, False, False],
│ +    [False, True, True], [False, True, False], [False, False, True], [False, False, False],
│ +]
│ +
│ +
│ +def run(pw, base, width, height, seqs):
│ +    out = []
│ … omitted 141 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/dbg_k315.py
│ @@ -0,0 +1,24 @@
│ +import pathlib, sys
│ +from playwright.sync_api import sync_playwright
│ +
│ +CHROME = str(pathlib.Path.home() / ".local/bin/google-chrome")
│ +BASE = "http://127.0.0.1:8899/"
│ +ROUTE = "#/modulis/1/pasaulio-pazinimas/20-kas-gyvas"
│ +
│ +with sync_playwright() as pw:
│ +    b = pw.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│ +    p = b.new_page(viewport={"width": 390, "height": 844})
│ +    errs = []
│ +    p.on("pageerror", lambda e: errs.append("pageerror: " + str(e)[:300]))
│ +    p.on("console", lambda m: errs.append(m.type + ": " + m.text[:300]))
│ +    p.goto(BASE + ROUTE, wait_until="domcontentloaded")
│ +    p.wait_for_timeout(2500)
│ +    print("URL:", p.url)
│ +    print("errors:")
│ +    for e in errs[:12]:
│ +        print("  ", e)
│ +    print("has sim-stage:", p.eval_on_selector_all("#sim-stage", "els => els.length"))
│ +    print("stage html:", (p.eval_on_selector("#sim-stage", "el => el.innerHTML")[:200] if p.query_selector("#sim-stage") else "none"))
│ +    print("controls html:", (p.eval_on_selector("#sim-controls", "el => el.innerHTML")[:300] if p.query_selector("#sim-controls") else "none"))
│ +    print("readout:", p.eval_on_selector("#sim-readout", "el => el.textContent") if p.query_selector("#sim-readout") else "none")
│ +    b.close()
│ profiles/deepseek41flash/cache/scratch/dbg2_k315.py
│ @@ -0,0 +1,21 @@
│ +import pathlib
│ +from playwright.sync_api import sync_playwright
│ +
│ +CHROME = str(pathlib.Path.home() / ".local/bin/google-chrome")
│ +BASE = "http://127.0.0.1:8899/"
│ +ROUTE = "#/modulis/1/pasaulio-pazinimas/20-kas-gyvas"
│ +
│ +with sync_playwright() as pw:
│ +    b = pw.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│ +    p = b.new_page(viewport={"width": 390, "height": 844})
│ +    fails = []
│ +    p.on("requestfailed", lambda r: fails.append("FAILED " + r.url))
│ +    p.on("response", lambda r: fails.append(f"{r.status} {r.url}") if r.status >= 400 else None)
│ +    p.on("pageerror", lambda e: fails.append("pageerror: " + str(e)[:300]))
│ +    p.on("console", lambda m: fails.append(m.type + ": " + m.text[:300]))
│ +    p.goto(BASE + ROUTE, wait_until="domcontentloaded")
│ +    p.wait_for_timeout(2500)
│ +    print("\n".join(fails[:20]))
│ +    print("---")
│ +    print("body head:", p.eval_on_selector("body", "el => el.innerHTML.slice(0, 400)"))
│ +    b.close()
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/dbg2_k315.py
│ @@ -2,7 +2,7 @@
│  from playwright.sync_api import sync_playwright
│
│  CHROME = str(pathlib.Path.home() / ".local/bin/google-chrome")
│ -BASE = "http://127.0.0.1:8899/"
│ +BASE = "http://127.0.0.1:8977/"
│  ROUTE = "#/modulis/1/pasaulio-pazinimas/20-kas-gyvas"
│
│  with sync_playwright() as pw:
│ profiles/deepseek41flash/cache/scratch/dbg3_k315.py
│ @@ -0,0 +1,21 @@
│ +import pathlib
│ +from playwright.sync_api import sync_playwright
│ +
│ +CHROME = str(pathlib.Path.home() / ".local/bin/google-chrome")
│ +BASE = "http://127.0.0.1:8977/"
│ +ROUTE = "#/modulis/1/pasaulio-pazinimas/20-kas-gyvas"
│ +
│ +with sync_playwright() as pw:
│ +    b = pw.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│ +    p = b.new_page(viewport={"width": 390, "height": 844})
│ +    p.on("console", lambda m: print("console", m.type, m.text[:200]))
│ +    p.on("pageerror", lambda e: print("pageerror", str(e)[:300]))
│ +    p.goto(BASE + ROUTE, wait_until="domcontentloaded")
│ +    for i in range(6):
│ +        p.wait_for_timeout(500)
│ +        print(i, "hash=", p.evaluate("() => location.hash"),
│ +              "simshell=", p.eval_on_selector_all(".sim-shell", "e => e.length"),
│ +              "tasks=", p.eval_on_selector_all(".task", "e => e.length"),
│ +              "h1=", (p.eval_on_selector("h1", "e => e.textContent") if p.query_selector("h1") else None))
│ +    print("app text:", p.eval_on_selector("#app", "e => e.textContent.slice(0, 300)"))
│ +    b.close()
│ profiles/deepseek41flash/cache/scratch/dbg4_k315.py
│ @@ -0,0 +1,19 @@
│ +import pathlib
│ +from playwright.sync_api import sync_playwright
│ +
│ +CHROME = str(pathlib.Path.home() / ".local/bin/google-chrome")
│ +BASE = "http://127.0.0.1:8977/"
│ +ROUTE = "#/modulis/1/pasaulio-pazinimas/20-kas-gyvas"
│ +
│ +with sync_playwright() as pw:
│ +    b = pw.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│ +    p = b.new_page(viewport={"width": 390, "height": 844})
│ +    p.on("console", lambda m: print("console", m.type, m.text[:400]))
│ +    p.on("pageerror", lambda e: print("pageerror", str(e)[:500]))
│ +    p.goto(BASE + ROUTE, wait_until="domcontentloaded")
│ +    p.wait_for_timeout(1500)
│ +    for sel in ("#sim-stage", "#sim-controls", "#sim-readout", "#sim-note"):
│ +        el = p.query_selector(sel)
│ +        print(sel, "->", (el.inner_html()[:250] if el else "NĖRA"))
│ +    print("sim ids:", p.eval_on_selector_all("#sim-controls button", "els => els.map(e => e.id || e.textContent.trim().slice(0,20))"))
│ +    b.close()
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/k315_kasgyvas.py
│ @@ -90,7 +90,8 @@
│
│      for seq in seqs:
│          page.evaluate("() => { try { localStorage.clear(); } catch (e) {} }")
│ -        page.goto(base + ROUTE + "?r=" + str(abs(hash(tuple(seq))) % 100000), wait_until="domcontentloaded")
│ +        page.goto(base + "#/", wait_until="domcontentloaded")
│ +        page.goto(base + ROUTE, wait_until="domcontentloaded")
│          page.wait_for_selector("#kg-week", timeout=15000)
│          page.wait_for_timeout(250)
│          start = page.evaluate(SNAP)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/k315_kasgyvas.py
│ @@ -90,7 +90,7 @@
│
│      for seq in seqs:
│          page.evaluate("() => { try { localStorage.clear(); } catch (e) {} }")
│ -        page.goto(base + "#/", wait_until="domcontentloaded")
│ +        page.goto("about:blank")
│          page.goto(base + ROUTE, wait_until="domcontentloaded")
│          page.wait_for_selector("#kg-week", timeout=15000)
│          page.wait_for_timeout(250)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/k315_kasgyvas.py
│ @@ -98,6 +98,11 @@
│          page.click('[data-guess="augalas"]')
│          steps = []
│          for wet in seq:
│ +            if not page.is_enabled("#kg-wet"):
│ +                steps.append({"locked": True, "note": "modelis jau baigtas", "cells": {},
│ +                              "svgHtml": "", "simDone": True, "weekDisabled": True,
│ +                              "smallTargets": [], "overflow": 0, "readout": ""})
│ +                break
│              page.click("#kg-wet" if wet else "#kg-dry")
│              wk = page.query_selector("#kg-week")
│              enabled = wk.is_enabled()
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/k315_kasgyvas.py
│ @@ -139,6 +139,9 @@
│          for row in data:
│              seq = row["seq"]
│              for i, s in enumerate(row["steps"]):
│ +                if s.get("locked"):
│ +                    print(f"  {''.join('W' if w else 'D' for w in seq):3s} sav{i + 1}: modelis jau baigtas (pasiektas tikslas) — likusi seka nepasiekiama")
│ +                    continue
│                  nums = list(s["cells"].values())
│                  plant = s["cells"].get("pupos daigas", "?")
│                  changed_vis = s["svgHtml"] != base["svgHtml"]
Atsakymas sustabdytas ties 200 įrankio kvietimų riba. Toliau — ką realiai padariau, ką įrodžiau ir kas liko.

## Simuliacija, kurią taisiau

`kas-gyvas` (`assets/js/sims/pasaulis.js`), modulis `content/lt/grade-01/pasaulio-pazinimas/20-kas-gyvas.json`. Defektas iš kritiko #18245 (high): tikslas įsirašydavo tame kadre, kuriame visi trys lentelės skaičiai 0, o tekstas skelbė „Trys daiktai, vienas pasikeitė“. Priežastis: skaičius ėjo iš grynosios savaičių sumos (kuri dviejų priešingų savaičių kelyje visada 0), o sakinys, lapų nusvirimas ir `api.progress` — iš kito skaičiavimo („ar savaitės skyrėsi“). Vaikas matydavo tris nulius su „pasikeitė“ sakiniu ir gaudavo „Modelis įveiktas“.

**Klaidinga nuostata:** „jei skaičius 0, niekas nepasikeitė, vadinasi augalas negyvas“. Modelis ją maitino, nes pats sau prieštaravo.

## Ką pakeičiau

1. `changeOf()` yra vienintelis šaltinis — iš jo imami lentelės skaičiai, piešinio aukštis, lapų nusvirimas ir spalva, `aria-label`, `api.readout`, `api.note` ir pažanga. Piešinys dabar yra tik `change` funkcija (`dry = change < 0`), todėl vaizdas ir skaičius negali išsiskirti pagal konstrukciją.
2. Rėžiantis daiktas nustatomas iš `art: "plant"`, o ne iš įrašyto `id` — neliko kietai įrašyto `"augalas"`.
3. Nulio būsena nebėra pabaiga ir nebėra įveikimas: `isEnded()` reikalauja `weeks >= config.weeks` **ir** `change !== 0`; prie nulio modelis duoda dar vieną savaitę (ne aklavietė), o `api.progress` kviečiamas tik kai bent vienas skaičius neneiginis.
4. Sakinys imamas iš tų pačių skaičių; nuliui skirta frazė „Augalas grįžo į pradinį dydį: pokytis 0“ + kvietimas spausti dar kartą. Pridėtas `sim.config.sentences.zero`, lentelė gavo antraštę „Kiek pasikeitė“, `readout`/`aria-label` surinkti iš `config.objects`, o ne iš trijų kietai įrašytų pavadinimų.

## Vartai (tikra išvestis)

```
validate_content.py --grade 1 --strict → 0 klaidų, 0 įspėjimų, rc 0
check_ui.py                            → 0/0, rc 0
```

Zondas `.venv/bin/python …/k315_kasgyvas.py` (Chromium, 390×844, 14 sekų, 34 būsenos):
```
W  sav1: [+1,0,0] piešinys_kitoks=True  D  sav1: [−1,0,0] piešinys_kitoks=True
WD sav2: [ 0,0,0] piešinys_kitoks=False btn=įjungtas note='Augalas grįžo į pradinį dydį: pokytis 0…'
WDW sav3: [+1,0,0] piešinys_kitoks=True btn=užrakintas note='Trys daiktai, vienas pasikeitė…'
DD sav2: [−2,0,0] piešinys_kitoks=True
Problemos: ✔ 0 · 360/390/1440 px overflow=0, mažų taikinių 0, antraštė 'Kiek pasikeitė' neapkirpta
Klaviatūra: po Enter ant spėjimo → kg-week; Shift+Tab → kg-dry; fokusas nepabėgo į BODY
```
Tikrintos trys nekintančios sąlygos būsenų visumoje: `skaičius ≠ 0 ⟺ piešinys skiriasi nuo pradinio`; `simDone` niekada su nuliu; „vienas pasikeitė“ niekada su visais nuliais; prie nulio „Po savaitės“ lieka įjungtas.

## Nebaigta (privalau pasakyti atvirai)

- **`simDone` zonde liko `false` visose sekose.** Radau priežastį tik pačioje pabaigoje: `progress.markSimDone` rašo į `suprask:progress:v1` struktūrą `{modules: {"<id>": {...}}}`, o mano zondas skaitė raktą viršutiniame lygyje (`store['20-kas-gyvas']`). Tai zondo, ne simuliacijos klaida, bet **nepatvirtinta** — reikia pataisyti skaitymą į `store.modules['20-kas-gyvas'].simDone` ir paleisti zondą iš naujo.
- Nepaleisti: `check_view.py --module 20-kas-gyvas`, `check_view.py` visai klasei, `check_language.py`, `check_docs_facts.py`.
- Neįrašyta ataskaita `agents/log/simuliaciju-inzinierius-2026-11-16.md` ir neatnaujintas `agents/state.json` (`last_sim_work`) — tai privalu padaryti prieš baigiant.
- Neuždarytas foninis `http.server 8977` (ir senesnis 8850). Portas 8899 užimtas svetimo „Market pulse“ serverio — juo naudotis negalima.
- Liko žinoma rizika: scenos geometrija vis dar skirta trims langeliams (55/150/262), nors skaičiai ir tekstai jau config-driven. Kito paleidimo darbas, ne šio defekto šaknis.
- Naujos pamokos į `research/wiki/guidelines/pamokos.md` neįrašiau. Šis defektas telpa į esamą LL-17, bet verta atskiro tipo: „du skaičiavimai vienam skaičiui — skaičius iš sumos, sakinys iš palyginimo“.

## klaidos

```
session_id: local-c0ab367e4b48ccf8bc1d8feaf0f6ab77be487edc612ca920a00f25f0de87d835
```
