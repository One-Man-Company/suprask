# simuliaciju-inzinierius — 2026-11-21T1103

- paleidimas: #422 (manual)
- trukmė: 939s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/r422_map.py
│ @@ -0,0 +1,13 @@
│ +#!/usr/bin/env python3
│ +"""422: kuris sim.component priklauso kuriam 1 klases moduliui."""
│ +import json
│ +import pathlib
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +idx = json.loads((ROOT / "content/lt/grade-01/index.json").read_text())
│ +for s in idx["strands"]:
│ +    for m in s["modules"]:
│ +        f = ROOT / "content/lt/grade-01" / s["id"] / f"{m['id']}.json"
│ +        d = json.loads(f.read_text())
│ +        sim = d.get("sim") or {}
│ +        print(f"{s['id']:22s} {m['id']:34s} {sim.get('component')}")
│ profiles/deepseek41flash/cache/scratch/r422_measure3.py
│ @@ -0,0 +1,74 @@
│ +#!/usr/bin/env python3
│ +"""422: tikslus matavimas trims kandidatams (360 px, 16 px ir 32 px saknis)."""
│ +from __future__ import annotations
│ +import sys
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8985/"
│ +CHROME = "/home/zoltanas/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome"
│ +
│ +CASES = [
│ +    ("matematika", "05-desimtukas"),
│ +    ("matematika", "23-piktograma-ir-stulpelis"),
│ +    ("matematika", "30-skaiciavimas-atgal-per-desimti"),
│ +]
│ +
│ +JS = r"""
│ +() => {
│ +  const st = document.querySelector('#sim-stage');
│ +  const sh = st.getBoundingClientRect();
│ +  const de = document.documentElement;
│ +  const clipChain = (el) => {
│ +    const out = [];
│ +    for (let p = el.parentElement; p; p = p.parentElement) {
│ +      const cs = getComputedStyle(p);
│ +      if (cs.overflow !== 'visible' || cs.overflowX !== 'visible') {
│ +        out.push(p.tagName + (p.id ? '#' + p.id : '') + '=' + cs.overflow + '/' + cs.overflowX);
│ +      }
│ +    }
│ +    return out;
│ +  };
│ +  const rows = [];
│ +  for (const el of st.querySelectorAll('button, [role=button], .cell, div[id]')) {
│ +    const b = el.getBoundingClientRect();
│ +    if (!b.width && !b.height) continue;
│ +    rows.push({
│ +      tag: el.tagName.toLowerCase() + (el.id ? '#' + el.id : ''),
│ +      w: Math.round(b.width * 10) / 10,
│ +      h: Math.round(b.height * 10) / 10,
│ +      right: Math.round((b.right - sh.right) * 10) / 10,
│ +      gap: getComputedStyle(el.parentElement).columnGap,
│ +      parentW: Math.round(el.parentElement.getBoundingClientRect().width * 10) / 10,
│ +      txt: (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 18),
│ +    });
│ +  }
│ +  return {
│ +    vw: window.innerWidth,
│ +    doc: de.scrollWidth - de.clientWidth,
│ +    stageW: Math.round(sh.width * 10) / 10,
│ +    shellW: Math.round((document.querySelector('.sim-shell') || st).getBoundingClientRect().width * 10) / 10,
│ +    clip: clipChain(st.querySelector('button, .cell, div[id]')),
│ +    rows: rows.slice(0, 12),
│ +  };
│ +}
│ +"""
│ +
│ +with sync_playwright() as p:
│ +    b = p.chromium.launch(executable_path=CHROME)
│ +    for root in ("16px", "32px"):
│ +        for strand, mid in CASES:
│ +            ctx = b.new_context(viewport={"width": 360, "height": 820}, locale="lt-LT")
│ +            pg = ctx.new_page()
│ +            errs = []
│ +            pg.on("pageerror", lambda e: errs.append(str(e)))
│ +            pg.goto(f"{BASE}#/modulis/1/{strand}/{mid}", wait_until="domcontentloaded")
│ +            pg.wait_for_selector("#sim-stage *", state="attached", timeout=15000)
│ +            pg.add_style_tag(content=f"html{{font-size:{root} !important}}")
│ +            pg.wait_for_timeout(250)
│ +            d = pg.evaluate(JS)
│ +            print(f"\n### {mid} @ {root}: shell {d['shellW']} stage {d['stageW']} doc+{d['doc']} err {len(errs)}")
│ +            print(f"    clip: {d['clip'][:4]}")
│ +            for r in d["rows"]:
│ +                print(f"    {r['tag'][:26]:28s} {r['w']:6.1f}x{r['h']:5.1f} right{r['right']:+7.1f} gap={r['gap']:>8s} pW={r['parentW']:6.1f} „{r['txt']}“")
│ +            ctx.close()
│ +    b.close()
│ assets/css/main.css
│ @@ -125,7 +125,16 @@
│  .icon-btn:hover { transform: translateY(-1px); background: var(--line); }
│  .icon-btn[aria-pressed="false"] { opacity: .55; }
│
│ -main { display: block; max-width: var(--maxw); margin: 0 auto; padding: clamp(1rem, 3vw, 2rem) clamp(1rem, 4vw, 2rem) 4rem; }
│ +/* Šoninis paminkštinimas — PX, ne rem (#422). `clamp(1rem, …)` minimumas
│ +   seka šaknies šriftu, todėl prie 200 % teksto (32 px šaknis) jis išauga
│ +   nuo 16 iki 32 px ir atima 2×16 = 32 px iš turinio pločio. Matuota @360:
│ +   `main` 4vw = 14,4 px, bet clamp minimumas laimėjo, todėl simuliacijos
│ +   kortelė susiaurėjo 57,6 px (su `.sim-shell` paminkštinimu) ir dešimtuko
│ +   langeliai prie 200 % teksto liko 35 px — mažiau už standarto §4.6 48 px.
│ +   Paraštė yra rėmas, ne tekstas: didinant tekstą ji neturi didėti, kitaip
│ +   didesnis tekstas netenka vietos (WCAG 1.4.4 / 1.4.10 dvasia). 13–32 px
│ +   atkartoja senąsias .8rem–2rem ribas 16 px šaknyje. */
│ +main { display: block; max-width: var(--maxw); margin: 0 auto; padding: clamp(1rem, 3vw, 2rem) clamp(13px, 4vw, 32px) 4rem; }
│
│  .site-foot {
│    border-top: 1px solid var(--line); padding: 2rem clamp(1rem, 4vw, 2rem) 3rem;
│ assets/css/main.css
│ @@ -350,9 +350,14 @@
│    background: var(--ink); color: var(--paper); border-radius: 50%; font-weight: 900;
│  }
│
│ +/* Paminkštinimas PX (žr. `main` aukščiau, #422): prie 200 % teksto
│ +   `.8rem` išauga nuo 12,8 iki 25,6 px ir kartu su puslapio parašte atima
│ +   57,6 px iš simuliacijos ploto — būtent tiek, kiek dešimtuko penkiems
│ +   langeliams reikia, kad liktų ≥ 48 px. 13–24 px atkartoja senąsias
│ +   .8rem–1.5rem ribas 16 px šaknyje, todėl įprastas vaizdas nesikeičia. */
│  .sim-shell {
│    background: var(--paper-2); border: 2px solid var(--line); border-radius: var(--r-l);
│ -  padding: clamp(.8rem, 2.5vw, 1.5rem); box-shadow: var(--shadow-2);
│ +  padding: clamp(13px, 2.5vw, 24px); box-shadow: var(--shadow-2);
│  }
│  .sim-stage { display: grid; place-items: center; gap: 1rem; }
│  /* Valdiklių juosta. `.container-type: inline-size` daro ją konteineriu, kad
│ assets/js/sims/matematika.js
│ @@ -109,10 +109,16 @@
│         skaičiuojamas iš to paties 3.4rem. 16 px šaknyje langeliai lieka
│         54,4 px (360 px ekrane — 53,3 px), kaip ir prieš taisymą.
│         Penki stulpeliai sąmoningai nekeičiami: dešimtukas yra dvi eilės po
│ -       penkis, ir būtent eilė, o ne pusė, yra 1 klasės sąvoka. */
│ +       penkis, ir būtent eilė, o ne pusė, yra 1 klasės sąvoka.
│ +
│ +       Tarpai — PX, ne rem (#422). `.5rem` prie 200 % teksto išauga iki
│ +       16 px, keturi tarpai atima 64 px, ir penki langeliai 301 px tėve
│ +       telpa tik po 47,4 px — mažiau už standarto §4.6 48 px. Matuota
│ +       @360/32 px: su `min(.5rem, 8px)` langelis 53,8 px, o 16 px šaknyje
│ +       tarpas nesikeičia (8 px). */
│      stage.innerHTML = `
│        <div style="text-align:center">
│ -        <div id="dt-grid" style="display:grid;grid-template-columns:repeat(5,minmax(0,3.4rem));grid-template-rows:repeat(2,auto);gap:.5rem;justify-content:center;width:100%;max-width:calc(5 * 3.4rem + 4 * .5rem);margin:0 auto;box-sizing:border-box;container-type:inline-size"></div>
│ +        <div id="dt-grid" style="display:grid;grid-template-columns:repeat(5,minmax(0,3.4rem));grid-template-rows:repeat(2,auto);gap:min(.5rem,8px);justify-content:center;width:100%;max-width:calc(5 * 3.4rem + 4 * 8px);margin:0 auto;box-sizing:border-box;container-type:inline-size"></div>
│          <p class="sim-note" id="dt-msg">Spausk langelius ir skaičiuok. Kiek trūksta iki 10?</p>
│        </div>`;
│      controls.innerHTML = `<button class="btn secondary" id="dt-clear">Išvalyti</button>`;
│ profiles/deepseek41flash/cache/scratch/r422_diff.py
│ @@ -0,0 +1,30 @@
│ +#!/usr/bin/env python3
│ +"""422: prieš/po palyginimas pagal 200 % zondo išvestį."""
│ +import pathlib
│ +import re
│ +
│ +SC = pathlib.Path("/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch")
│ +pat = re.compile(r"^(OK  |BLOG) (\S+): zingsniu (\d+), defektu (\d+), klaidos (\d+)")
│ +
│ +
│ +def load(name):
│ +    d = {}
│ +    for line in (SC / name).read_text().splitlines():
│ +        m = pat.match(line.strip())
│ +        if m:
│ +            d[m.group(2)] = int(m.group(4))
│ +    return d
│ +
│ +
│ +before = load("r422_probe_before.txt")
│ +after = load("r422_probe_after.txt")
│ +print(f"moduliai: prieš {len(before)}, po {len(after)}")
│ +print(f"defektai: prieš {sum(before.values())}, po {sum(after.values())}")
│ +print(f"moduliai su defektais: prieš {sum(1 for v in before.values() if v)}, "
│ +      f"po {sum(1 for v in after.values() if v)}")
│ +print()
│ +print(f"{'modulis':34s} {'prieš':>5s} {'po':>5s}")
│ +for k in before:
│ +    b, a = before.get(k, 0), after.get(k, 0)
│ +    if b or a:
│ +        print(f"{k:34s} {b:5d} {a:5d}")
│ profiles/deepseek41flash/cache/scratch/r422_widths.py
│ @@ -0,0 +1,38 @@
│ +#!/usr/bin/env python3
│ +"""422: dešimtuko langelių dydis kituose pločiuose ir 16/32 px šaknyje."""
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8985/"
│ +CHROME = "/home/zoltanas/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome"
│ +
│ +JS = r"""
│ +() => {
│ +  const st = document.querySelector('#sim-stage');
│ +  const cells = [...st.querySelectorAll('button')];
│ +  const b = cells[0].getBoundingClientRect();
│ +  const de = document.documentElement;
│ +  return {
│ +    stage: Math.round(st.getBoundingClientRect().width * 10) / 10,
│ +    cell: Math.round(b.width * 10) / 10 + 'x' + Math.round(b.height * 10) / 10,
│ +    n: cells.length,
│ +    doc: de.scrollWidth - de.clientWidth,
│ +    rows: new Set(cells.map(c => Math.round(c.getBoundingClientRect().top))).size,
│ +  };
│ +}
│ +"""
│ +
│ +with sync_playwright() as p:
│ +    br = p.chromium.launch(executable_path=CHROME)
│ +    for w in (320, 360, 390, 414, 768, 1440):
│ +        for root in ("16px", "32px"):
│ +            ctx = br.new_context(viewport={"width": w, "height": 800}, locale="lt-LT")
│ +            pg = ctx.new_page()
│ +            pg.goto(f"{BASE}#/modulis/1/matematika/05-desimtukas", wait_until="domcontentloaded")
│ +            pg.wait_for_selector("#sim-stage button", timeout=15000)
│ +            pg.add_style_tag(content=f"html{{font-size:{root} !important}}")
│ +            pg.wait_for_timeout(200)
│ +            d = pg.evaluate(JS)
│ +            print(f"  {w:5d}px @{root}: stage {d['stage']:6.1f}  langelis {d['cell']:>9s}  "
│ +                  f"eilučių {d['rows']}  doc+{d['doc']}")
│ +            ctx.close()
│ +    br.close()
**Pakeista (repo failai, ne ataskaita):**

`assets/css/main.css`
- `main` horizontalus paminkštinimas: `clamp(1rem, 4vw, 2rem)` → `clamp(13px, 4vw, 32px)`
- `.sim-shell` paminkštinimas: `clamp(.8rem, 2.5vw, 1.5rem)` → `clamp(13px, 2.5vw, 24px)`
- Abu su komentarais, kuriuose įrašyti matuoti skaičiai ir priežastis.

`assets/js/sims/matematika.js` (sim `desimtukas`, modulis `05-desimtukas`)
- tinklelio tarpai `gap: .5rem` → `gap: min(.5rem, 8px)`, `max-width` atitinkamai `4 * 8px`.

**Klaidinga nuostata:** „puslapio ir kortelės paraštės yra `rem`, nes jos didelės — tegul auga kartu su tekstu“. Jos yra rėmas, ne tekstas. Prie 200 % teksto (32 px šaknis) `main` šoninė paraštė 16→32 px, `.sim-shell` 12,8→25,6 px, t. y. simuliacijos plotas susiaurėja **57,6 px** (298,4 → 240,8 px @360). Dešimtuko penki langeliai tame plote telpa tik po 35,4 px, nors standartas §4.6 reikalauja ≥48 px; vaikas 6–7 m. negali pataikyti į 35 px langelį. Antra priežastis tame pačiame modulyje: keturi `rem` tarpai prie 200 % užima 64 px.

**Kaip patikrinta 360 px ekrane (tikra išvestis):**
- `r422_measure3.py` prieš: shell 296 / stage 240,8 / langelis 35,4×35,4; po: shell 331,2 / stage 301,2 / **53,8×53,8** (ir 16 px, ir 32 px šaknyje).
- `r422_widths.py`: 320→46,4 (žemiau standarto pločio, pasakyta garsiai), 360→53,8, 390→59,4, 414→63,8; visur 2 eilutės, `doc+0`.
- 200 % zondas visai klasei (`probe_click_200.py`, 51 modulis, 14 paspaudimų kiekvienam): defektai **120 → 56**, moduliai su defektais **15 → 9**; visiškai išnyko `05-desimtukas` (12→0), `27-skaicius-ir-skaitmuo` (7→0), `29-atimtis-per-desimti` (14→0), `30-skaiciavimas-atgal-per-desimti` (6→0), `21-kas-sukure-dailka` (14→0), `01-garso-aukstis` (6→0).

**Vartai (tikra išvestis):**
- `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų
- `check_ui.py` → 0 klaidų, 0 įspėjimų (12 sim failų)
- `check_registry.py` → 73 SIMS raktai, 51 modulis, našlaičiai 0
- `check_view.py --base http://127.0.0.1:8985/` → **153 patikros (51×3 plotai), 0 problemų**
- `node --check assets/js/sims/matematika.js` → OK
- `check_language.py --grade 1` → 0 klaidų

**Nebuvo padaryta (sąmoningai, viena simuliacija paleidimui):** likę 9 moduliai su 200 % defektais netaisyti — `23-piktograma` (47×52, 1 px iki ribos, tas pats `rem` tarpo mechanizmas), `01-elektros-grandine` (etiketės „Baterija“/„Lemputė“ išlenda +18,9/+25,3), `18-taskas-tiese` (+12,5), `19-simto-skaiciu-lentele` (skaitmenys apkarpyti 3 px), `14-pinigai` ir `16-lygybe-svarstykles` (apkarpyta `label` 420/214 px), `17-judejimas`, `01-susitarimas-ir-zaidimas`, `12-bendradarbiavimo-tiltas` (SVG sub-pikselis +0,8/+2 — triukšmas).

**Neįrašyta:** pamokos įrašas į `research/wiki/guidelines/pamokos.md` (LL-133 „Paraštė, kuri auga su tekstu ir atima simuliacijos plotą“) ir pasiūlymas `agents/proposals/2026-11-21-simuliaciju-inzinierius-*.json` — baigėsi žingsniai prieš juos įrašant. Tai pirmas darbas kitam paleidimui. Lokalus `http.server` 8985 tebėra paleistas (sesija `proc_68b98875ff1d`).

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-5ac11979ad7158ab5bfd1f71f422fe589a744355c5f11998a3537e8030a7c53d
```
