# simuliaciju-inzinierius — 2026-11-09T1110

- paleidimas: #188 (manual)
- trukmė: 649s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/probe_view.py
│ @@ -0,0 +1,78 @@
│ +#!/usr/bin/env python3
│ +"""Zondas: modulio matavimas 360 px ir 200 % teksto (32 px šaknis)."""
│ +import json
│ +import sys
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8991/"
│ +
│ +PROBE = r"""
│ +() => {
│ +  const vw = window.innerWidth;
│ +  const de = document.documentElement;
│ +  const stage = document.querySelector('#sim-stage');
│ +  const over = [];
│ +  const walk = (root) => {
│ +    for (const el of root.querySelectorAll('*')) {
│ +      const r = el.getBoundingClientRect();
│ +      if (r.width === 0 && r.height === 0) continue;
│ +      if (r.right > vw + 1 || r.left < -1) {
│ +        over.push({ tag: el.tagName, cls: (el.className||'').toString().slice(0,30),
│ +                    text: (el.textContent||'').trim().slice(0,30),
│ +                    left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height) });
│ +      }
│ +    }
│ +  };
│ +  walk(document.body);
│ +  const small = [...document.querySelectorAll('#sim-stage button, #sim-controls button, #sim-stage [role=button], #sim-controls [role=button]')]
│ +    .map(el => el.getBoundingClientRect())
│ +    .filter(r => r.width > 0 && r.height > 0 && (r.height < 48 || r.width < 48))
│ +    .map(r => ({ w: Math.round(r.width), h: Math.round(r.height) }));
│ +  return {
│ +    rootFont: getComputedStyle(document.documentElement).fontSize,
│ +    innerWidth: vw,
│ +    scrollWidth: de.scrollWidth,
│ +    overflow: de.scrollWidth - vw,
│ +    stageScrollW: stage ? stage.scrollWidth : null,
│ +    stageClientW: stage ? stage.clientWidth : null,
│ +    overflowing: over.slice(0, 8),
│ +    smallTargets: small.slice(0, 8),
│ +    readout: (document.querySelector('#sim-readout')?.innerText || '').slice(0, 120),
│ +  };
│ +}
│ +"""
│ +
│ +
│ +def run(route, width, root_px=None, clicks=()):
│ +    with sync_playwright() as p:
│ +        b = p.chromium.launch()
│ +        page = b.new_page(viewport={"width": width, "height": 800})
│ +        errs = []
│ +        page.on("pageerror", lambda e: errs.append(str(e)[:160]))
│ +        page.on("console", lambda m: errs.append("console: " + m.text[:160]) if m.type == "error" else None)
│ +        if root_px:
│ +            page.add_init_script(
│ +                "document.addEventListener('DOMContentLoaded',()=>{document.documentElement.style.fontSize='%dpx'})" % root_px
│ +            )
│ +        page.goto(f"{BASE}#/modulis/1/{route}", wait_until="domcontentloaded", timeout=25000)
│ +        page.wait_for_selector(".task", timeout=15000)
│ +        page.wait_for_timeout(700)
│ +        for sel in clicks:
│ +            try:
│ +                page.click(sel, timeout=3000)
│ +                page.wait_for_timeout(250)
│ +            except Exception as exc:  # noqa: BLE001
│ +                errs.append(f"click {sel}: {exc}"[:120])
│ +        data = page.evaluate(PROBE)
│ +        data["route"] = route
│ +        data["errors"] = errs[:6]
│ +        b.close()
│ +        return data
│ +
│ +
│ +if __name__ == "__main__":
│ +    route = sys.argv[1]
│ +    clicks = sys.argv[2:]
│ +    for width, root in ((360, None), (360, 32), (390, 32), (1440, 32)):
│ +        print(json.dumps(run(route, width, root, clicks), ensure_ascii=False, indent=1))
│ profiles/deepseek41flash/cache/scratch/serve.py
│ @@ -0,0 +1,16 @@
│ +#!/usr/bin/env python3
│ +"""Statinis serveris su correct MIME tipais."""
│ +import functools
│ +import http.server
│ +import socketserver
│ +
│ +Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory="/home/zoltanas/workspace/suprask")
│ +Handler.extensions_map = {".js": "text/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", "": "text/plain"}
│ +
│ +
│ +class S(socketserver.ThreadingTCPServer):
│ +    allow_reuse_address = True
│ +
│ +
│ +with S(("127.0.0.1", 8991), Handler) as httpd:
│ +    httpd.serve_forever()
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe_view.py
│ @@ -46,7 +46,10 @@
│
│  def run(route, width, root_px=None, clicks=()):
│      with sync_playwright() as p:
│ -        b = p.chromium.launch()
│ +        b = p.chromium.launch(
│ +            executable_path="/home/zoltanas/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome",
│ +            args=["--no-sandbox"],
│ +        )
│          page = b.new_page(viewport={"width": width, "height": 800})
│          errs = []
│          page.on("pageerror", lambda e: errs.append(str(e)[:160]))
│ assets/js/sims/geometrija.js
│ @@ -1,11 +1,16 @@
│  /**
│   * Erdvinių kūnų simuliacija (1 klasė, matematika).
│   *
│ - * Modelis: vienas kūnas stovi ant stalo, o vaikas keičia TIK žvilgsnį —
│ - * iš priekio, iš viršaus, nuo šono. Kiekvieną kartą jis pirma spėja, kokią
│ - * plokščią formą matys, paskui pamato tikrą vaizdą. Taip atsiranda tai, ko
│ - * neparodo nei tekstas, nei paveikslėlis: kūnas lieka vienas, keičiasi tik
│ + * Modelis: vienas kūnas stovi ant stalo, o vaikas keičia TIK tai, iš kur
│ + * žiūri — iš priekio, iš viršaus, nuo šono. Kiekvieną kartą jis pirma spėja,
│ + * kokią plokščią formą matys, paskui pamato tikrą vaizdą. Taip atsiranda tai,
│ + * ko neparodo nei tekstas, nei paveikslėlis: kūnas lieka vienas, keičiasi tik
│   * vaizdas (kūgis iš priekio — trikampis, iš viršaus — apskritimas).
│ + *
│ + * Trys vaizdai nėra pametami: kiekvienas mygtukas „Iš priekio / Iš viršaus /
│ + * Nuo šono“ po pasižiūrėjimo parodo, kokią formą tada matei. Taip vaikas
│ + * VISUS tris vaizdus mato vienu metu — invarianto („tas pats kūnas“) negali
│ + * pamiršti, nes jis lieka ekrane.
│   *
│   * Sąmoningai NEliečiama: briaunų, viršūnių ir sienų skaičiavimas — tai ne
│   * 1 klasės programa ir būtent elementų skaičiavimas 6–7 m. vaikui sukelia
│ @@ -16,7 +21,7 @@
│   */
│  import { art } from "./art.js";
│
│ -/* Trys žvilgsniai. `prep` vartojamas sakinyje, `arrow` — rodyklė prie kūno. */
│ +/* Trys žiūrėjimo kryptys. `prep` vartojamas sakinyje, `arrow` — rodyklė prie kūno. */
│  const VIEWS = [
│    { id: "priekis", label: "Iš priekio", prep: "iš priekio", arrow: [8, 196, 30, 178] },
│    { id: "virsus", label: "Iš viršaus", prep: "iš viršaus", arrow: [100, 8, 100, 30] },
│ @@ -34,6 +39,10 @@
│  /**
│   * Kūnai ir jų vaizdai iš trijų pusių. Lentelė yra vienintelis tiesos
│   * šaltinis: ir piešinys, ir grįžtamasis ryšys, ir garso sakiniai remiasi ja.
│ + *
│ + * Vardai — oficialūs (NŠA 2024, matematikos programa 1 klasei): ne
│ + * „gretasienis“, o „stačiakampis gretasienis“. Modulio rezultatas moko to
│ + * paties vardo, todėl simuliacija negali jo trumpinti (#5826, LL-34 atvirkštinė).
│   */
│  const BODIES = [
│    {
│ @@ -59,9 +68,9 @@
│    },
│    {
│      id: "gretasienis",
│ -    name: "Gretasienis",
│ -    acc: "gretasienį",
│ -    why: "Gretasienio sienos yra stačiakampiai.",
│ +    name: "Stačiakampis gretasienis",
│ +    acc: "stačiakampį gretasienį",
│ +    why: "Visos jo sienos yra stačiakampiai.",
│      views: { priekis: "staciakampis", virsus: "staciakampis", sonas: "staciakampis" },
│    },
│    {
│ @@ -98,7 +107,7 @@
│      const S = config.sentences || {};
│      const VIEW_KEYS = VIEWS.map((v) => v.id);
│
│ -    /* `revealed` — kuriuos (kūnas, žvilgsnis) vaizdus vaikas jau matė.
│ +    /* `revealed` — kuriuos (kūnas, kryptis) vaizdus vaikas jau matė.
│         `done` — kurių kūnų visi trys vaizdai jau apžiūrėti (tikslas). */
│      const revealed = new Set();
│      const done = new Set();
│ @@ -106,14 +115,18 @@
│      let view = "priekis";
│      let lastSaid = "";
│
│ +    /* Tinkleliai rišami prie `min(<rem>,100%)`, o ne prie gryno `rem`:
│ +       200 % teksto atveju šaknies `rem` padvigubėja ir minimumas nebetelpa į
│ +       kortelę (LL-40). Su `min()` stulpelis susitraukia iki kortelės pločio
│ +       ir eilutė persirikiuoja, o ne išstumia puslapį. */
│      stage.innerHTML = `
│        <div id="ef-wrap" style="width:100%;max-width:36rem;margin:0 auto;box-sizing:border-box">
│          <p class="sim-note" style="margin:0 0 .5rem;text-align:center">
│ -          Pasirink kūną ir žvilgsnį. Spėk, kokią formą matai.
│ +          Pasirink kūną ir spėk, kokią formą matai. Tada žiūrėk iš kitos pusės.
│          </p>
│          <div id="ef-bodies" role="group" aria-label="Pasirink kūną"
│ -             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(6.1rem,1fr));gap:.4rem;box-sizing:border-box"></div>
│ … omitted 138 diff line(s) across 1 additional file(s)/section(s)
│ assets/js/sims/geometrija.js
│ @@ -284,16 +284,13 @@
│        const finished = checkGoal();
│        api.readout(finished ? `${head} Apžiūrėjai jį iš trijų pusių.` : head);
│
│ -      if (!guess) {
│ -        api.note("Pats kūnas nepasikeitė. Pasikeitė tik vaizdas.");
│ -      } else if (guess === target) {
│ -        api.note(`${b.why} Pats kūnas liko tas pats.`);
│ -      } else {
│ -        api.note(`${b.why} Pats kūnas liko tas pats.`);
│ -      }
│ -      if (finished) {
│ -        api.note(`Tas pats ${b.name.toLowerCase()} — trys skirtingi vaizdai. Pats kūnas nepasikeitė.`);
│ -      }
│ +      let note;
│ +      if (!guess) note = "Pats kūnas nepasikeitė. Pasikeitė tik vaizdas.";
│ +      else if (guess === target) note = `${b.why} Pats kūnas liko tas pats.`;
│ +      else note = `${b.why} Pažiūrėk į paveikslą dešinėje.`;
│ +      // Viena pastaba, o ne dvi iš eilės: `api.note` keičia tekstą, ne prideda.
│ +      if (finished) note = `${note} Trys vaizdai, vienas kūnas.`;
│ +      api.note(note);
│
│        speakOnce(S[`${b.id}-${v.id}`]);
│      }
│ assets/js/sims/geometrija.js
│ @@ -309,7 +309,8 @@
│        if (revealedNow()) {
│          const b = byId(body);
│          const shape = SHAPES[b.views[view]];
│ -        api.readout(`Iš ${viewById(view).prep.replace(/^(iš|nuo) /, "$1 ")} matai ${shape.acc}. Pasirink, iš kur dar žiūrėsi.`);
│ +        const prep = viewById(view).prep;
│ +        api.readout(`${prep.charAt(0).toUpperCase() + prep.slice(1)} matai ${shape.acc}. Pasirink, iš kur dar žiūrėsi.`);
│        } else {
│          api.readout(promptText());
│          api.note("Spėk formą arba spausk „Rodyk vaizdą“.");
│ content/lt/grade-01/matematika/21-erdvines-figuros.json
│ @@ -34,9 +34,9 @@
│          "kubas-priekis": "Kubas iš priekio atrodo kaip kvadratas.",
│          "kubas-virsus": "Kubas iš viršaus irgi atrodo kaip kvadratas.",
│          "kubas-sonas": "Kubas nuo šono irgi atrodo kaip kvadratas.",
│ -        "gretasienis-priekis": "Gretasienis iš priekio atrodo kaip stačiakampis.",
│ -        "gretasienis-virsus": "Gretasienis iš viršaus irgi atrodo kaip stačiakampis.",
│ -        "gretasienis-sonas": "Gretasienis nuo šono irgi atrodo kaip stačiakampis.",
│ +        "gretasienis-priekis": "Stačiakampis gretasienis iš priekio atrodo kaip stačiakampis.",
│ +        "gretasienis-virsus": "Stačiakampis gretasienis iš viršaus irgi atrodo kaip stačiakampis.",
│ +        "gretasienis-sonas": "Stačiakampis gretasienis nuo šono irgi atrodo kaip stačiakampis.",
│          "rutulys-priekis": "Rutulys iš priekio atrodo kaip apskritimas.",
│          "rutulys-virsus": "Rutulys iš viršaus vėl atrodo kaip apskritimas.",
│          "rutulys-sonas": "Rutulys nuo šono vėl atrodo kaip apskritimas.",
│ profiles/deepseek41flash/cache/scratch/probe_sim.py
│ @@ -0,0 +1,74 @@
│ +#!/usr/bin/env python3
│ +"""Zondas: geometrijos simuliacijos veiksmas 360 px ir 200 % teksto."""
│ +import json
│ +import sys
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8991/"
│ +ROUTE = "matematika/21-erdvines-figuros"
│ +
│ +
│ +def state(page):
│ +    return page.evaluate(
│ +        """() => {
│ +      const btns = [...document.querySelectorAll('#ef-views .ef-view')].map(b => ({
│ +        view: b.dataset.view,
│ +        label: b.getAttribute('aria-label'),
│ +        pressed: b.getAttribute('aria-pressed'),
│ +        seen: b.querySelector('.ef-seen').textContent,
│ +        h: Math.round(b.getBoundingClientRect().height),
│ +        w: Math.round(b.getBoundingClientRect().width),
│ +      }));
│ +      const bodies = [...document.querySelectorAll('#ef-bodies .ef-body')].map(b => ({
│ +        body: b.dataset.body, text: b.innerText.replace(/\\s+/g, ' ').trim(),
│ +        h: Math.round(b.getBoundingClientRect().height), w: Math.round(b.getBoundingClientRect().width),
│ +      }));
│ +      const r = (sel) => { const e = document.querySelector(sel); return e ? e.innerText.replace(/\\s+/g,' ').trim() : null; };
│ +      const de = document.documentElement;
│ +      return {
│ +        scrollWidth: de.scrollWidth, innerWidth: window.innerWidth,
│ +        stageScrollW: document.querySelector('#sim-stage').scrollWidth,
│ +        stageClientW: document.querySelector('#sim-stage').clientWidth,
│ +        readout: r('#sim-readout'), note: r('#sim-note') || r('.sim-note'),
│ +        flatCap: r('#ef-flat-cap'),
│ +        views: btns, bodies,
│ +        progressChips: [...document.querySelectorAll('.chip')].map(c => c.innerText.trim()),
│ +        simDone: document.querySelector('[data-sim-done], .sim-done') ? true : null,
│ +      };
│ +    }"""
│ +    )
│ +
│ +
│ +def run(width, root_px, clicks):
│ +    with sync_playwright() as p:
│ +        b = p.chromium.launch(
│ +            executable_path="/home/zoltanas/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome",
│ +            args=["--no-sandbox"],
│ +        )
│ +        page = b.new_page(viewport={"width": width, "height": 900})
│ +        errs = []
│ +        page.on("pageerror", lambda e: errs.append(str(e)[:200]))
│ +        page.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" else None)
│ +        if root_px:
│ +            page.add_init_script(
│ +                "document.addEventListener('DOMContentLoaded',()=>{document.documentElement.style.fontSize='%dpx'})" % root_px
│ +            )
│ +        page.goto(f"{BASE}#/modulis/1/{ROUTE}", wait_until="domcontentloaded", timeout=25000)
│ +        page.wait_for_selector("#ef-bodies .ef-body", timeout=15000)
│ +        page.wait_for_timeout(600)
│ +        out = {"width": width, "rootPx": root_px or 16, "initial": state(page)}
│ +        for sel in clicks:
│ +            page.click(sel, timeout=4000)
│ +            page.wait_for_timeout(220)
│ +        out["after"] = state(page)
│ +        out["errors"] = errs[:6]
│ +        out["progressStored"] = page.evaluate("() => Object.keys(localStorage).join(' | ')")
│ +        b.close()
│ +        return out
│ +
│ +
│ +if __name__ == "__main__":
│ +    clicks = sys.argv[1:]
│ +    for width, root in ((360, None), (360, 32)):
│ +        print(json.dumps(run(width, root, clicks), ensure_ascii=False, indent=1))
│ profiles/deepseek41flash/cache/scratch/probe_flow.py
│ @@ -0,0 +1,63 @@
│ +#!/usr/bin/env python3
│ +"""Zondas: pažanga ir neteisingas spėjimas (kūgis)."""
│ +import json
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8991/"
│ +ROUTE = "matematika/21-erdvines-figuros"
│ +
│ +
│ +def run(width, root_px):
│ +    with sync_playwright() as p:
│ +        b = p.chromium.launch(
│ +            executable_path="/home/zoltanas/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome",
│ +            args=["--no-sandbox"],
│ +        )
│ +        page = b.new_page(viewport={"width": width, "height": 900})
│ +        errs = []
│ +        page.on("pageerror", lambda e: errs.append(str(e)[:200]))
│ +        page.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" else None)
│ +        if root_px:
│ +            page.add_init_script(
│ +                "document.addEventListener('DOMContentLoaded',()=>{document.documentElement.style.fontSize='%dpx'})" % root_px
│ +            )
│ +        page.goto(f"{BASE}#/modulis/1/{ROUTE}", wait_until="domcontentloaded", timeout=25000)
│ +        page.wait_for_selector("#ef-bodies .ef-body", timeout=15000)
│ +        page.wait_for_timeout(500)
│ +
│ +        def snap(tag):
│ +            return {
│ +                "tag": tag,
│ +                "readout": page.inner_text("#sim-readout"),
│ +                "seen": [page.inner_text(f"#ef-views [data-view={v}] .ef-seen") for v in ("priekis", "virsus", "sonas")],
│ +                "pressed": [page.get_attribute(f"#ef-views [data-view={v}]", "aria-pressed") for v in ("priekis", "virsus", "sonas")],
│ +                "aria": [page.get_attribute(f"#ef-views [data-view={v}]", "aria-label") for v in ("priekis", "virsus", "sonas")],
│ +                "flatCap": page.inner_text("#ef-flat-cap"),
│ +                "progress": page.evaluate("() => localStorage.getItem('suprask:progress:v1')"),
│ +            }
│ +
│ +        steps = []
│ +        # kūgis pasirinktas pagal nutylėjimą; spėjam neteisingai (kvadratas)
│ +        page.click("#ef-shapes [data-shape=kvadratas]")
│ +        page.wait_for_timeout(250)
│ +        steps.append(snap("neteisingas spėjimas iš priekio"))
│ +        page.click("#ef-views [data-view=virsus]")
│ +        page.wait_for_timeout(200)
│ +        steps.append(snap("perėjimas į viršų"))
│ +        page.click("#ef-shapes [data-shape=apskritimas]")
│ +        page.wait_for_timeout(250)
│ +        steps.append(snap("teisingas spėjimas iš viršaus"))
│ +        page.click("#ef-views [data-view=sonas]")
│ +        page.click("#ef-shapes [data-shape=trikampis]")
│ +        page.wait_for_timeout(300)
│ +        steps.append(snap("trečias vaizdas iš šono"))
│ +        out = {"width": width, "rootPx": root_px or 16, "steps": steps, "errors": errs[:6],
│ +               "scrollWidth": page.evaluate("() => document.documentElement.scrollWidth")}
│ +        b.close()
│ +        return out
│ +
│ +
│ +if __name__ == "__main__":
│ +    for width, root in ((360, None), (360, 32)):
│ +        print(json.dumps(run(width, root), ensure_ascii=False, indent=1))
│ profiles/deepseek41flash/cache/scratch/probe_opt.py
│ @@ -0,0 +1,45 @@
│ +#!/usr/bin/env python3
│ +"""Zondas: užduoties varianto išsiliejimas prie 200 % teksto."""
│ +import json
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8991/"
│ +ROUTE = "matematika/21-erdvines-figuros"
│ +
│ +JS = r"""
│ +() => {
│ +  const vw = window.innerWidth;
│ +  const out = [];
│ +  for (const el of document.querySelectorAll('*')) {
│ +    const r = el.getBoundingClientRect();
│ +    if (r.width && r.right > vw + 1) {
│ +      const cs = getComputedStyle(el);
│ +      out.push({
│ +        tag: el.tagName, cls: (el.className || '').toString(),
│ +        text: (el.textContent || '').trim().slice(0, 28),
│ +        left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width),
│ +        font: cs.fontSize, padL: cs.paddingLeft, padR: cs.paddingRight,
│ +        display: cs.display, ws: cs.whiteSpace, minW: cs.minWidth,
│ +        parent: el.parentElement ? el.parentElement.tagName + '.' + (el.parentElement.className || '').toString() : null,
│ +        parentDisplay: el.parentElement ? getComputedStyle(el.parentElement).display : null,
│ +      });
│ +    }
│ +  }
│ +  return out.slice(0, 12);
│ +}
│ +"""
│ +
│ +with sync_playwright() as p:
│ +    b = p.chromium.launch(
│ +        executable_path="/home/zoltanas/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome",
│ +        args=["--no-sandbox"],
│ +    )
│ +    page = b.new_page(viewport={"width": 360, "height": 900})
│ +    page.add_init_script("document.addEventListener('DOMContentLoaded',()=>{document.documentElement.style.fontSize='32px'})")
│ +    page.goto(f"{BASE}#/modulis/1/{ROUTE}", wait_until="domcontentloaded", timeout=25000)
│ +    page.wait_for_selector(".task", timeout=15000)
│ +    page.wait_for_timeout(700)
│ +    print(json.dumps(page.evaluate(JS), ensure_ascii=False, indent=1))
│ +    print("scrollWidth", page.evaluate("() => document.documentElement.scrollWidth"))
│ +    b.close()
│ profiles/deepseek41flash/cache/scratch/check_manifest.py
│ @@ -0,0 +1,15 @@
│ +import json
│ +
│ +m = json.load(open("assets/audio/lt/manifest.json", encoding="utf-8"))
│ +for t in [
│ +    "Teisingai!",
│ +    "Sudėjai visus sakinius!",
│ +    "Kartu",
│ +    "Greičiau",
│ +    "Lėčiau",
│ +    "Dešimt. Puiku!",
│ +    "Visos figūros savo vietose. Puiku!",
│ +    "Visi taikiniai pasiekti!",
│ +]:
│ +    e = m.get(t)
│ +    print(repr(t), "->", "YRA " + (e.get("n") or "") if e else "NĖRA")
│ assets/js/sims/geometrija.js
│ @@ -138,7 +138,7 @@
│              <figcaption id="ef-flat-cap" style="font-size:.85rem;color:var(--ink-soft);font-weight:700">Ką matai?</figcaption>
│            </figure>
│          </div>
│ -        <p style="margin:.7rem 0 .3rem;font-size:.85rem;font-weight:800;color:var(--ink-soft);text-align:center">Iš kur žiūri? Jau matyti vaizdai lieka po mygtuku.</p>
│ +        <p style="margin:.7rem 0 .3rem;font-size:.85rem;font-weight:800;color:var(--ink-soft);text-align:center">Iš kur žiūri? Ką matei, lieka po mygtuku.</p>
│          <div id="ef-views" role="group" aria-label="Iš kur žiūri"
│               style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(5rem,100%),1fr));gap:.4rem;box-sizing:border-box"></div>
│          <p style="margin:.7rem 0 .3rem;font-size:.85rem;font-weight:800;color:var(--ink-soft);text-align:center">Kokią formą matai?</p>
│ profiles/deepseek41flash/cache/scratch/probe_kbd.py
│ @@ -0,0 +1,53 @@
│ +#!/usr/bin/env python3
│ +"""Zondas: klaviatūra (Tab + Enter), 360 px."""
│ +import json
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8991/"
│ +ROUTE = "matematika/21-erdvines-figuros"
│ +
│ +with sync_playwright() as p:
│ +    b = p.chromium.launch(
│ +        executable_path="/home/zoltanas/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome",
│ +        args=["--no-sandbox"],
│ +    )
│ +    page = b.new_page(viewport={"width": 360, "height": 900})
│ +    errs = []
│ +    page.on("pageerror", lambda e: errs.append(str(e)[:200]))
│ +    page.on("console", lambda m: errs.append("console: " + m.text[:200]) if m.type == "error" else None)
│ +    page.goto(f"{BASE}#/modulis/1/{ROUTE}", wait_until="domcontentloaded", timeout=25000)
│ +    page.wait_for_selector("#ef-bodies .ef-body", timeout=15000)
│ +    page.wait_for_timeout(500)
│ +
│ +    labels = []
│ +    shape_hit = 0
│ +    for i in range(60):
│ +        page.keyboard.press("Tab")
│ +        info = page.evaluate(
│ +            """() => {
│ +          const a = document.activeElement;
│ +          return { tag: a.tagName, id: a.id, label: a.getAttribute('aria-label') || (a.innerText || '').trim().slice(0, 24) };
│ +        }"""
│ +        )
│ +        labels.append(info)
│ +        if info.get("id") == "ef-show":
│ +            break
│ +    # Tab to first shape button and press Enter
│ +    for _ in range(40):
│ +        page.keyboard.press("Tab")
│ +        active = page.evaluate("() => document.activeElement.getAttribute('aria-label')")
│ +        if active in ("Trikampis", "Apskritimas", "Kvadratas", "Stačiakampis"):
│ +            page.keyboard.press("Enter")
│ +            page.wait_for_timeout(250)
│ +            shape_hit = 1
│ +            break
│ +    out = {
│ +        "tabbed": labels,
│ +        "shapeActivatedByKeyboard": bool(shape_hit),
│ +        "readout": page.inner_text("#sim-readout"),
│ +        "seen": page.inner_text("#ef-views .ef-seen"),
│ +        "errors": errs[:5],
│ +    }
│ +    print(json.dumps(out, ensure_ascii=False, indent=1))
│ +    b.close()
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe_kbd.py
│ @@ -37,7 +37,7 @@
│      for _ in range(40):
│          page.keyboard.press("Tab")
│          active = page.evaluate("() => document.activeElement.getAttribute('aria-label')")
│ -        if active in ("Trikampis", "Apskritimas", "Kvadratas", "Stačiakampis"):
│ +        if (active or "").lower() in ("trikampis", "apskritimas", "kvadratas", "stačiakampis"):
│              page.keyboard.press("Enter")
│              page.wait_for_timeout(250)
│              shape_hit = 1
Darbas kode baigtas ir patikrintas, bet paleidimo apskaitos įrašų nespėjau sukurti — žemiau tiksliai, kas padaryta ir kas liko.

KAS PAKEISTA

assets/js/sims/geometrija.js — simuliacija „erdvines-figuros“ (modulis 21-erdvines-figuros):
1. Terminas. BODIES gretasienio vardas „Gretasienis“ → „Stačiakampis gretasienis“, galininkas „stačiakampį gretasienį“. Modulio rezultatas ir NŠA 2024 programa moko šio vardo, todėl simuliacija jo nebetrumpina (#5826).
2. Abstraktus žodis. Pastaba „Pasirink kūną ir žvilgsnį“ → „Pasirink kūną ir spėk, kokią formą matai. Tada žiūrėk iš kitos pusės.“; „Pasirink kitą žvilgsnį“ → „Pasirink, iš kur dar žiūrėsi.“ Simuliacijos kode žodžio „žvilgsnis“ nebeliko (#5828).
3. Modelio patobulinimas. Krypties mygtukas „Iš priekio / Iš viršaus / Nuo šono“ dabar išsaugo, ką vaikas tada matė (antra eilutė: „trikampis“, „apskritimas“). Visi trys vaizdai lieka ekrane vienu metu, todėl invarianto „tas pats kūnas“ nebereikia prisiminti — jis matomas.
4. Grįžtamasis ryšys apie veiksmą, ne apie vaiką: „Ne taip“ → „Tu spėjai kvadratą. Iš tikrųjų kūgis iš priekio: matai trikampį.“ Pastaba viena, o ne dvi iš eilės (api.note keičia tekstą, ne prideda); po trečio vaizdo — „Trys vaizdai, vienas kūnas.“
5. 200 % teksto atsparumas: tinkleliai perrašyti į minmax(min(Xrem,100%),1fr), todėl stulpelis susitraukia iki kortelės, o ne išstumia puslapį.

content/lt/grade-01/matematika/21-erdvines-figuros.json — tik sim.config.sentences trys gretasienio sakiniai su pilnu terminu (kitus laukus lieti neleidžia vaidmens ribos).

assets/audio/lt — sugeneruoti 6 nauji įrašai (3 sakiniai × n/s) Piper balsu, manifestas atnaujintas.

TIKRA IŠVESTIS

    validate_content.py            0 klaidų, 0 įspėjimų (--strict taip pat)
    check_ui.py                    0 klaidų, 0 įspėjimų
    check_audio.py                 500 tekstų, visi turi po du įrašus, visi Piper
    check_language.py              0 klaidų (4 įspėjimai — seni, kituose moduliuose)
    check_art.py                   7 sim failai naudoja art.js, legacy 1
    check_view.py --module 21      3 plotai (1440/390/360), 0 problemų
    check_view.py (visa 1 kl.)     105 patikros (35×3), 0 problemų
    node/Playwright zondas 360 px  0 konsolės klaidų, sim stage scrollWidth == clientWidth
    zondas 360 px @200 % teksto    sim stage 241 == 241 (prieš tai buvo 246 > 241)
    pažanga                        prieš trečią vaizdą simDone nėra; po trečio simDone:true
    klaviatūra                     Tab pasiekia visus sim valdiklius; jų eilė: Kūgis…Rutulys, trys kryptys, keturios formos, Rodyk vaizdą

KLAIDINGA NUOSTATA: „kūno vardą simuliacijoje galima sutrumpinti, nes mygtukas trumpesnis“. Modelis dabar vartoja tą patį terminą kaip modulis (stačiakampis gretasienis), o ilgesnis vardas telpa 360 px (mygtukas 146 px pločio, 89 px aukščio; prie 200 % — 241 px, 135 px).

PASTABA DĖL 200 % TEKSTO: puslapis ties 360 px ir 200 % teksu vis dar slenka 38 px, bet kaltininkas NE simuliacija — tai `.task-q` viduje esantis klausimo `<span>` (left 132, width 266, font 37,12 px), t. y. jau atviras #4748 (19 modulių), app.js/main.css lygmuo, ne mano vaidmens riba. Simuliacijos vidinį 5 px išsiliejimą pašalinau.

RADINYS, KURĮ REIKIA UŽRAŠYTI: `api.speak("Sudėjai visus sakinius!")` (calba.js:229) ir `api.speak("Visi taikiniai pasiekti!")` (matematika.js:81) neturi garso įrašo manifeste, o `check_audio.py` vis tiek sako „Garsas pilnas“ — vartai nemato tiesioginių `api.speak` eilučių (renka tik sim.config raktus).

LIKO NEĮRAŠYTA (reikia kito paleidimo arba rankinio įrašymo)

- agents/log/simuliaciju-inzinierius-2026-11-09.md — ataskaita nesukurta.
- agents/state.json — roles.simuliaciju-inzinierius (last_run, log) ir last_sim_work neatnaujinti (ten vis dar 2026-11-07, run 36).
- agents/proposals/ — nepasiūlyti 2 darbai: (a) check_audio.py aklumas `api.speak` literalams su dviem konkrečiais trūkstamais tekstais; (b) 13-akmenelis-popierius 10 ėjimų išvada „kiekvienas variantas laimi maždaug trečdalį kartų“ teigiama kaip faktas apie vaiko bėgimą, nors rodomi skaičiai to neįrodo.
- research/wiki/guidelines/pamokos.md — nauja pamoka LL-69 „Terminas, kuris simuliacijoje sutrumpintas“ (Simptomas: modulis moko „stačiakampis gretasienis“, sim mygtukas sako „Gretasienis“; Priežastis: vardas rašytas pagal mygtuko plotį, ne pagal programą; Taisyklė: sąvokos vardas imamas iš modulio rezultato raidžiai, o ilgis sprendžiamas išdėstymu; Patikra: palygink sim BODIES vardus su modulio outcomes ir sources terminais).

Neliečiau kitų simuliacijų, app.js, registry.js, AGENTS.md, kitų klasių. Pakeitimai palikti darbinėje kopijoje — commit ir publikavimą atlieka bėgiklis.

## klaidos

```
session_id: local-7ff618d07fe8b4fe3cdbc919a9165dad5488a0f064d5b926fbb35fb9ff0dac52
```
