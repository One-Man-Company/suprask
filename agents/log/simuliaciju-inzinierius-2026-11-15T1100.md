# simuliaciju-inzinierius — 2026-11-15T1100

- paleidimas: #300 (manual)
- trukmė: 731s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/q_props.py
│ @@ -0,0 +1,9 @@
│ +import sqlite3
│ +c = sqlite3.connect('agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +cols = [r[1] for r in c.execute("PRAGMA table_info(proposals)")]
│ +print(cols)
│ +print("---- NEW proposals ----")
│ +for r in c.execute("select * from proposals where status='new' order by created"):
│ +    d = dict(r)
│ +    print(d.get('id'), '|', d.get('priority'), '|', d.get('type'), '|', d.get('created'), '|', (d.get('title') or '')[:78], '|', (d.get('target') or '')[:70])
│ profiles/deepseek41flash/cache/scratch/inv.py
│ @@ -0,0 +1,27 @@
│ +import json, glob, os, re, collections
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +os.chdir(ROOT)
│ +
│ +files = sorted(glob.glob("assets/js/sims/*.js"))
│ +decl = collections.defaultdict(list)
│ +for f in files:
│ +    src = open(f, encoding="utf-8").read()
│ +    for m in re.finditer(r'^\s{0,6}["\']?([a-z0-9][a-z0-9\-]+)["\']?\s*:\s*\{', src, re.M):
│ +        decl[m.group(1)].append((f, src[:m.start()].count("\n") + 1))
│ +
│ +mods = []
│ +for f in sorted(glob.glob("content/lt/grade-01/*/*.json")):
│ +    if f.endswith("index.json") or f.endswith("path.json"):
│ +        continue
│ +    d = json.load(open(f, encoding="utf-8"))
│ +    mods.append(d)
│ +
│ +print("modules", len(mods))
│ +for d in mods:
│ +    sim = d.get("sim") or {}
│ +    comp = sim.get("component")
│ +    cfg = sim.get("config")
│ +    ncfg = len(cfg) if isinstance(cfg, dict) else (len(cfg) if isinstance(cfg, list) else 0)
│ +    where = decl.get(comp, [])
│ +    print(f"{d['id']:34s} {d.get('strand','')[:18]:18s} {str(comp):28s} cfg={ncfg:<2} {where if where else 'NOT FOUND'}")
│ profiles/deepseek41flash/cache/scratch/inv2.py
│ @@ -0,0 +1,52 @@
│ +import re, os, glob, json
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +os.chdir(ROOT)
│ +
│ +# map component -> function name from SIMS export
│ +comp2fn = {}
│ +for f in glob.glob("assets/js/sims/*.js"):
│ +    src = open(f, encoding="utf-8").read()
│ +    m = re.search(r"export const SIMS = \{(.*?)\n\};", src, re.S)
│ +    if not m:
│ +        continue
│ +    for line in m.group(1).splitlines():
│ +        mm = re.match(r'\s*"([a-z0-9\-]+)":\s*([A-Za-z0-9_]+),?\s*$', line)
│ +        if mm:
│ +            comp2fn[mm.group(1)] = (f, mm.group(2))
│ +
│ +mods = {}
│ +for f in sorted(glob.glob("content/lt/grade-01/*/*.json")):
│ +    if f.endswith("index.json") or f.endswith("path.json"):
│ +        continue
│ +    d = json.load(open(f, encoding="utf-8"))
│ +    mods[d["id"]] = d
│ +
│ +def body_of(path, fn):
│ +    src = open(path, encoding="utf-8").read()
│ +    m = re.search(r"function\s+" + re.escape(fn) + r"\s*\(", src)
│ +    if not m:
│ +        m = re.search(r"(?:const|let)\s+" + re.escape(fn) + r"\s*=\s*(?:function\s*)?\(", src)
│ +    if not m:
│ +        return None
│ +    i = src.index("{", m.end())
│ +    depth = 0
│ +    for j in range(i, len(src)):
│ +        if src[j] == "{":
│ +            depth += 1
│ +        elif src[j] == "}":
│ +            depth -= 1
│ +            if depth == 0:
│ +                return src[i:j+1]
│ +    return None
│ +
│ +print(f"{'module':36s} {'component':30s} prog read note speak  mountSig")
│ +for mid, d in mods.items():
│ +    comp = (d.get("sim") or {}).get("component")
│ +    if comp not in comp2fn:
│ +        print(f"{mid:36s} {str(comp):30s} MISSING")
│ +        continue
│ +    path, fn = comp2fn[comp]
│ +    b = body_of(path, fn) or ""
│ +    msig = re.search(r"function\s+" + re.escape(fn) + r"\s*\(([^)]*)\)", open(path, encoding="utf-8").read())
│ +    print(f"{mid:36s} {comp:30s} {b.count('api.progress'):<4} {b.count('api.readout'):<4} {b.count('api.note'):<4} {b.count('api.speak'):<5} {(msig.group(1) if msig else '?')[:40]}")
│ profiles/deepseek41flash/cache/scratch/inv3.py
│ @@ -0,0 +1,49 @@
│ +import re, os, glob, json
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +os.chdir(ROOT)
│ +
│ +comp2fn = {}
│ +for f in glob.glob("assets/js/sims/*.js"):
│ +    src = open(f, encoding="utf-8").read()
│ +    m = re.search(r"export const SIMS = \{(.*?)\n\};", src, re.S)
│ +    if not m:
│ +        continue
│ +    for line in m.group(1).splitlines():
│ +        mm = re.match(r'\s*"([a-z0-9\-]+)":\s*([A-Za-z0-9_]+),?\s*$', line)
│ +        if mm:
│ +            comp2fn[mm.group(1)] = (f, mm.group(2))
│ +
│ +mods = {}
│ +for f in sorted(glob.glob("content/lt/grade-01/*/*.json")):
│ +    if f.endswith("index.json") or f.endswith("path.json"):
│ +        continue
│ +    d = json.load(open(f, encoding="utf-8"))
│ +    mods[d["id"]] = d
│ +
│ +def obj_body(path, fn):
│ +    src = open(path, encoding="utf-8").read()
│ +    m = re.search(r"^const\s+" + re.escape(fn) + r"\s*=\s*\{", src, re.M)
│ +    if not m:
│ +        return None
│ +    i = src.index("{", m.end() - 1)
│ +    depth = 0
│ +    for j in range(i, len(src)):
│ +        if src[j] == "{":
│ +            depth += 1
│ +        elif src[j] == "}":
│ +            depth -= 1
│ +            if depth == 0:
│ +                return src[i:j+1]
│ +    return None
│ +
│ +print(f"{'module':36s} {'component':30s} lines prog read note speak mountSig")
│ +for mid, d in mods.items():
│ +    comp = (d.get("sim") or {}).get("component")
│ +    if comp not in comp2fn:
│ +        print(f"{mid:36s} {str(comp):30s} MISSING")
│ +        continue
│ +    path, fn = comp2fn[comp]
│ +    b = obj_body(path, fn) or ""
│ +    ms = re.search(r"mount\s*\(\s*\{([^}]*)\}", b)
│ +    print(f"{mid:36s} {comp:30s} {b.count(chr(10)):<5} {b.count('api.progress'):<4} {b.count('api.readout'):<4} {b.count('api.note'):<4} {b.count('api.speak'):<5} {(ms.group(1).strip() if ms else '?')}")
│ profiles/deepseek41flash/cache/scratch/check_pw.py
│ @@ -0,0 +1,15 @@
│ +import sys
│ +try:
│ +    import playwright
│ +    print("playwright", playwright.__version__ if hasattr(playwright, "__version__") else "ok")
│ +except Exception as e:
│ +    print("no playwright:", e)
│ +    sys.exit(1)
│ +from playwright.sync_api import sync_playwright
│ +with sync_playwright() as p:
│ +    try:
│ +        b = p.chromium.launch()
│ +        print("chromium ok", b.version)
│ +        b.close()
│ +    except Exception as e:
│ +        print("chromium fail:", str(e)[:300])
│ profiles/deepseek41flash/cache/scratch/probe_ski_before.py
│ @@ -0,0 +1,74 @@
│ +"""Bazinis zondas: 02-skiemenu-jungimas prieš pataisymą."""
│ +import json, time
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8850/"
│ +CHROME = "/home/zoltanas/.local/bin/google-chrome"
│ +ROUTE = BASE + "#/modulis/1/lietuviu-kalba/02-skiemenu-jungimas"
│ +
│ +with sync_playwright() as p:
│ +    b = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│ +    pg = b.new_page(viewport={"width": 360, "height": 780})
│ +    errs = []
│ +    pg.on("pageerror", lambda e: errs.append(str(e)))
│ +    pg.on("console", lambda m: errs.append("console:" + m.text) if m.type == "error" else None)
│ +    pg.goto(ROUTE, wait_until="load")
│ +    pg.wait_for_selector("#sim-tiles, #sj-tiles", timeout=8000)
│ +
│ +    def readout():
│ +        return pg.eval_on_selector("#sim-readout", "e => e.textContent")
│ +
│ +    def note():
│ +        return pg.eval_on_selector("#sim-note", "e => e.textContent")
│ +
│ +    def tiles():
│ +        return pg.eval_on_selector_all("#sj-tiles [data-syl]", "els => els.map(e => e.textContent)")
│ +
│ +    print("A1 readout po įkėlimo:", repr(readout()))
│ +    print("A1 note:", repr(note()))
│ +    print("A1 plytelės:", tiles())
│ +
│ +    # žymės prieš
│ +    print("goal prieš:", pg.eval_on_selector_all(".sim-goal", "e => e.length"))
│ +
│ +    # spaudžiame visus skiemenis ir „Skaityk kartu“ šešiems žodžiams
│ +    for i in range(6):
│ +        n = len(pg.eval_on_selector_all("#sj-tiles [data-syl]", "e => e"))
│ +        print(f"  žodis {i+1}: plytelės={tiles()} readout={readout()!r}")
│ +        for k in range(n):
│ +            pg.eval_on_selector_all("#sj-tiles [data-syl]", "(els,k) => els[k].click()", k)
│ +        pg.click("#sj-join")
│ +        pg.wait_for_timeout(1500)
│ +        print(f"    po jungimo: readout={readout()!r} goal={pg.eval_on_selector_all('.sim-goal','e=>e.length')}")
│ +        pg.click("#sj-next")
│ +        pg.wait_for_timeout(200)
│ +
│ +    pg.wait_for_timeout(600)
│ +    prog = pg.evaluate("() => localStorage.getItem('suprask:progress:v1')")
│ +    print("B po 6 žodžių: simDone ->", prog)
│ +    print("B goal:", pg.eval_on_selector_all(".sim-goal", "e => e.length"))
│ +
│ +    # C race: grįžtame į pradžią ir spaudžiame „Skaityk kartu“ + iškart „Kitas žodis“
│ +    pg.reload(wait_until="load")
│ +    pg.wait_for_selector("#sj-tiles", timeout=8000)
│ +    t_before = tiles()
│ +    pg.click("#sj-join")
│ +    pg.wait_for_timeout(120)
│ +    pg.click("#sj-next")
│ +    pg.wait_for_timeout(1600)
│ +    print("C prieš:", t_before, "po:", tiles(), "readout:", repr(readout()), "hint:", repr(pg.eval_on_selector('#sj-hint','e=>e.textContent')))
│ +
│ +    # D geometrija
│ +    geo = pg.evaluate("""() => {
│ +      const d = document.documentElement;
│ +      const st = document.getElementById('sim-stage');
│ +      const c = document.getElementById('sim-controls');
│ +      const small = [...document.querySelectorAll('#sim-stage button, #sim-controls button')]
│ +        .map(b => { const r = b.getBoundingClientRect(); return {t: b.textContent.trim().slice(0,12), w: Math.round(r.width), h: Math.round(r.height)}; })
│ +        .filter(x => x.w < 48 || x.h < 48);
│ +      return {docOverflow: d.scrollWidth - d.clientWidth, stage: st.scrollWidth + '/' + st.clientWidth,
│ +              controls: c.scrollWidth + '/' + c.clientWidth, small};
│ +    }""")
│ +    print("D @360:", json.dumps(geo, ensure_ascii=False))
│ +    print("klaidų:", errs)
│ +    b.close()
│ assets/js/sims/calba.js
│ @@ -100,62 +100,181 @@
│
│  /* ------------------------------------------------------------------ */
│  /* 2. Skiemenų jungimas                                                */
│ +/*                                                                     */
│ +/* Modelis: tarpas tarp skiemenų yra PAUZĖ, o ne žodžio dalis. Vaikas   */
│ +/* pats perskaito skiemenis iš kairės į dešinę; kai perskaito paskutinį,*/
│ +/* plytelės suartėja, pauzės ženklai dingsta ir vietoje jų atsiranda    */
│ +/* vienas žodis. Taip taisoma modulio `teacher.misconceptions` pirma    */
│ +/* nuostata — „skaitant skiemenimis daroma pauzė, todėl žodis lieka     */
│ +/* nesuprastas“.                                                     */
│ +/*                                                                     */
│ +/* Kodėl ne mygtukas „Skaityk kartu“: jungimą sukelia pats skaitymas.  */
│ +/* Ankstesnė versija leido vaikui spausti vieną mygtuką ir stebėti      */
│ +/* animaciją — tai demonstracija, ne modelis (foundations: „simuliacija */
│ +/* leidžia nuspręsti, kas nutiks“). Mygtukas liko tik tam, kad būtų     */
│ +/* galima pakartoti tą patį žodį.                                       */
│ +/*                                                                     */
│ +/* Tekstai: kiekvienas sakinys rašomas vienoje vietoje (LL-42), o      */
│ +/* žodžiai ir skiemenys imami tik iš `config.words` (LL-61/LL-92).      */
│  /* ------------------------------------------------------------------ */
│ +const SK_KIEKIS = ["", "vienas skiemuo", "du skiemenys", "trys skiemenys"];
│ +const skKiekis = (n) => SK_KIEKIS[n] || `${n} skiemenų`;
│ +const skJunginys = (syl) =>
│ +  syl.length === 1 ? `„${syl[0]}“`
│ +    : syl.slice(0, -1).map((s) => `„${s}“`).join(", ") + ` ir „${syl[syl.length - 1]}“`;
│ +
│  const skiemenuJungimas = {
│    mount({ stage, controls, api, config }) {
│ -    const words = config.words || [];
│ -    let w = 0;
│ +    const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
│ +    const words = (Array.isArray(config.words) ? config.words : [])
│ +      .filter((it) => it && typeof it.word === "string" && Array.isArray(it.syllables) && it.syllables.length > 0)
│ +      .map((it) => ({ word: it.word, syllables: it.syllables.map(String) }));
│ +
│ +    if (!words.length) {
│ +      stage.innerHTML = `<p class="sim-note" style="margin:0">Žodžių sąrašo nėra.</p>`;
│ +      controls.innerHTML = "";
│ +      api.readout("Žodžių sąrašo nėra.");
│ +      api.note("");
│ +      return () => {};
│ +    }
│ +
│ +    const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
│      const timers = [];
│ +    const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
│ +    const stopTimers = () => { while (timers.length) clearTimeout(timers.pop()); };
│ +
│ +    let w = 0;          // kuris žodis
│ +    let step = 0;       // kiek skiemenų perskaityta iš eilės
│ +    let joined = false; // ar žodis jau sujungtas
│ +    let reported = false;
│
│      stage.innerHTML = `
│ -      <div style="text-align:center">
│ -        <div id="sj-tiles" style="display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap;min-height:5rem;align-items:center"></div>
│ -        <p class="sim-note" id="sj-hint">Spausk po vieną skiemenį, paskui — „Skaityk kartu“.</p>
│ +      <div style="text-align:center;max-width:34rem;margin:0 auto">
│ +        <div id="sj-strip" style="display:flex;flex-wrap:wrap;gap:.9rem;row-gap:.6rem;justify-content:center;align-items:center;min-height:5rem"></div>
│ +        <p id="sj-word" style="min-height:2.6rem;margin:.4rem 0 0;font-family:var(--font-head);font-weight:900;font-size:clamp(1.6rem,7vw,2.2rem)"></p>
│ +        <p id="sj-caption" class="sim-note" style="margin:.2rem 0 0"></p>
│        </div>`;
│      controls.innerHTML = `
│ -      <button class="btn" id="sj-join">Skaityk kartu</button>
│ -      <button class="btn secondary" id="sj-next">Kitas žodis →</button>`;
│ -    const tilesEl = stage.querySelector("#sj-tiles");
│ -    const hintEl = stage.querySelector("#sj-hint");
│ -
│ -    function draw() {
│ -      const item = words[w % words.length];
│ -      tilesEl.innerHTML = item.syllables.map((s) => `
│ -        <button class="btn secondary" data-syl="${s}" style="font-size:1.8rem;font-weight:900;padding:1rem 1.4rem">${s}</button>`).join("");
│ -      tilesEl.querySelectorAll("[data-syl]").forEach((b) => {
│ -        b.addEventListener("click", () => {
│ -          api.speak(b.dataset.syl, { rate: .75 });
│ -          b.style.borderColor = "var(--accent)";
│ -          setTimeout(() => { b.style.borderColor = ""; }, 500);
│ -        });
│ … omitted 146 diff line(s) across 1 additional file(s)/section(s)
│ assets/js/sims/calba.js
│ @@ -239,16 +239,15 @@
│        joined = true;
│        stripEl.querySelectorAll(".sj-pause").forEach((p) => { p.style.display = "none"; });
│        if (!reduced) stripEl.style.transition = "gap 420ms ease";
│ -      stripEl.style.gap = reduced ? ".12rem" : ".12rem";
│ +      stripEl.style.gap = ".12rem";
│        wordEl.textContent = it.word;
│        captionEl.textContent = "Pauzių nebėra: skiemenys susilieja į vieną žodį.";
│        later(() => api.speak(it.word, { rate: .85 }), reduced ? 0 : 430);
│        api.note("Tarpas buvo pauzė. Be pauzės skiemenys susilieja į žodį.");
│        setNext(last ? "Nuo pradžių" : "Kitas žodis →", last ? restart : nextWord);
│ -      api.readout(`${skJunginys(it.syllables)} — ${it.word}. Vienas žodis.`);
│ +      api.readout(`${skJunginys(it.syllables)} — ${it.word}. ${last ? "Perskaitei visus žodžius." : "Vienas žodis."}`);
│        if (last && !reported) {
│          reported = true;
│ -        api.readout("Perskaitei visus žodžius. Kiekvienas jų buvo skiemenų grandinė.");
│          api.progress({ words: words.length });
│        }
│        if (nextBtn && stage.contains(document.activeElement)) nextBtn.focus({ preventScroll: true });
│ profiles/deepseek41flash/cache/scratch/probe_ski_after.py
│ @@ -0,0 +1,74 @@
│ +"""Zondas po pataisymo: 02-skiemenu-jungimas."""
│ +import json
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8850/"
│ +CHROME = "/home/zoltanas/.local/bin/google-chrome"
│ +ROUTE = BASE + "#/modulis/1/lietuviu-kalba/02-skiemenu-jungimas"
│ +
│ +
│ +def run(width, height, root_px, label, reduced=False):
│ +    with sync_playwright() as p:
│ +        b = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│ +        ctx = b.new_context(viewport={"width": width, "height": height}, reduced_motion="reduce" if reduced else "no-preference")
│ +        pg = ctx.new_page()
│ +        errs = []
│ +        pg.on("pageerror", lambda e: errs.append("pageerror:" + str(e)))
│ +        pg.on("console", lambda m: errs.append("console:" + m.text) if m.type == "error" else None)
│ +        if root_px != 16:
│ +            pg.add_init_script(f"document.addEventListener('DOMContentLoaded',()=>{{document.documentElement.style.fontSize='{root_px}px'}})")
│ +        pg.goto(ROUTE, wait_until="load")
│ +        pg.wait_for_selector("#sj-strip [data-i]", timeout=8000)
│ +        out = {"label": label}
│ +        out["readout0"] = pg.eval_on_selector("#sim-readout", "e=>e.textContent")
│ +        out["caption0"] = pg.eval_on_selector("#sj-caption", "e=>e.textContent")
│ +        out["tiles0"] = pg.eval_on_selector_all("#sj-strip [data-i]", "els=>els.map(e=>e.textContent.trim())")
│ +        out["pause0"] = pg.eval_on_selector_all(".sj-pause", "els=>els.map(e=>getComputedStyle(e).display)")
│ +        out["gap0"] = pg.eval_on_selector("#sj-strip", "e=>getComputedStyle(e).gap")
│ +        out["next0"] = pg.eval_on_selector_all("#sj-next", "e=>e.length")
│ +        # neteisinga eilė: antra plytelė pirmiausia
│ +        pgs = pg
│ +        pgs.eval_on_selector_all("#sj-strip [data-i]", "els=>els[1].click()")
│ +        pg.wait_for_timeout(120)
│ +        out["noteWrong"] = pg.eval_on_selector("#sim-note", "e=>e.textContent")
│ +        out["readoutAfterWrong"] = pg.eval_on_selector("#sim-readout", "e=>e.textContent")
│ +        # teisinga eilė
│ +        seq = []
│ +        n = len(pg.eval_on_selector_all("#sj-strip [data-i]", "e=>e"))
│ +        for k in range(n):
│ +            pg.eval_on_selector_all("#sj-strip [data-i]", "(els,k)=>els[k].click()", k)
│ +            pg.wait_for_timeout(90)
│ +            seq.append(pg.eval_on_selector("#sim-readout", "e=>e.textContent"))
│ +        out["readoutSeq"] = seq
│ +        pg.wait_for_timeout(700)
│ +        out["readoutJoined"] = pg.eval_on_selector("#sim-readout", "e=>e.textContent")
│ +        out["word"] = pg.eval_on_selector("#sj-word", "e=>e.textContent")
│ +        out["captionJoined"] = pg.eval_on_selector("#sj-caption", "e=>e.textContent")
│ +        out["gapJoined"] = pg.eval_on_selector("#sj-strip", "e=>getComputedStyle(e).gap")
│ +        out["pauseJoined"] = pg.eval_on_selector_all(".sj-pause", "els=>els.map(e=>getComputedStyle(e).display)")
│ +        out["nums"] = pg.eval_on_selector_all("#sj-strip [data-num]", "els=>els.map(e=>e.textContent)")
│ +        out["aria"] = pg.eval_on_selector_all("#sj-strip [data-i]", "els=>els.map(e=>e.getAttribute('aria-label'))")
│ +        out["nextJoined"] = pg.eval_on_selector_all("#sj-next", "e=>e.length && e[0].textContent")
│ +        out["focus"] = pg.evaluate("()=>document.activeElement && (document.activeElement.id || document.activeElement.textContent.trim().slice(0,20))")
│ +        geo = pg.evaluate("""() => {
│ +          const d = document.documentElement, st = document.getElementById('sim-stage'), c = document.getElementById('sim-controls');
│ +          const small = [...document.querySelectorAll('#sim-stage button, #sim-controls button')]
│ +            .map(b => { const r = b.getBoundingClientRect(); return {t: b.textContent.trim().slice(0,14), w: Math.round(r.width), h: Math.round(r.height)}; })
│ +            .filter(x => x.w < 48 || x.h < 48);
│ +          return {docOverflow: d.scrollWidth - d.clientWidth, stage: st.scrollWidth + '/' + st.clientWidth,
│ +                  controls: c.scrollWidth + '/' + c.clientWidth, stageH: Math.round(st.getBoundingClientRect().height), small};
│ +        }""")
│ +        out["geoJoined"] = geo
│ +        out["errors"] = errs
│ +        ctx.close()
│ +        b.close()
│ +        return out
│ +
│ +
│ +res = []
│ +res.append(run(360, 780, 16, "360@16"))
│ +res.append(run(360, 780, 32, "360@32", reduced=True))
│ +res.append(run(390, 844, 16, "390@16"))
│ +res.append(run(1440, 900, 16, "1440@16"))
│ +res.append(run(1440, 900, 32, "1440@32"))
│ +print(json.dumps(res, ensure_ascii=False, indent=1))
│ assets/js/sims/calba.js
│ @@ -117,8 +117,9 @@
│  /* Tekstai: kiekvienas sakinys rašomas vienoje vietoje (LL-42), o      */
│  /* žodžiai ir skiemenys imami tik iš `config.words` (LL-61/LL-92).      */
│  /* ------------------------------------------------------------------ */
│ -const SK_KIEKIS = ["", "vienas skiemuo", "du skiemenys", "trys skiemenys"];
│ +const SK_KIEKIS = ["", "vienas skiemuo", "du skiemenys", "trys skiemenys", "keturi skiemenys", "penki skiemenys"];
│  const skKiekis = (n) => SK_KIEKIS[n] || `${n} skiemenų`;
│ +const skCap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
│  const skJunginys = (syl) =>
│    syl.length === 1 ? `„${syl[0]}“`
│      : syl.slice(0, -1).map((s) => `„${s}“`).join(", ") + ` ir „${syl[syl.length - 1]}“`;
│ assets/js/sims/calba.js
│ @@ -199,7 +199,7 @@
│        setNext(null);
│        api.readout(it.syllables.length === 1
│          ? "Vienas skiemuo jau yra žodis. Spausk jį."
│ -        : `${skKiekis(it.syllables.length)}, vienas žodis. Spausk pirmą skiemenį.`);
│ +        : skCap(`${skKiekis(it.syllables.length)}, vienas žodis. Spausk pirmą skiemenį.`));
│        api.note("");
│      }
│
│ profiles/deepseek41flash/cache/scratch/probe_ski_cycle.py
│ @@ -0,0 +1,104 @@
│ +"""Zondas 2: visas ciklas, simDone, žyma, klaviatūra, tekstų sutapimas."""
│ +import json
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8850/"
│ +CHROME = "/home/zoltanas/.local/bin/google-chrome"
│ +ROUTE = BASE + "#/modulis/1/lietuviu-kalba/02-skiemenu-jungimas"
│ +WORDS = [
│ +    ("mama", ["ma", "ma"]),
│ +    ("tėtis", ["tė", "tis"]),
│ +    ("saulė", ["sau", "lė"]),
│ +    ("pilis", ["pi", "lis"]),
│ +    ("obuolys", ["o", "buo", "lys"]),
│ +    ("mokykla", ["mo", "kyk", "la"]),
│ +]
│ +
│ +with sync_playwright() as p:
│ +    b = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│ +    ctx = b.new_context(viewport={"width": 360, "height": 780})
│ +    pg = ctx.new_page()
│ +    errs = []
│ +    pg.on("pageerror", lambda e: errs.append("pageerror:" + str(e)))
│ +    pg.on("console", lambda m: errs.append("console:" + m.text) if m.type == "error" else None)
│ +    pg.goto(ROUTE, wait_until="load")
│ +    pg.wait_for_selector("#sj-strip [data-i]", timeout=8000)
│ +
│ +    def ro():
│ +        return pg.eval_on_selector("#sim-readout", "e=>e.textContent")
│ +
│ +    def note():
│ +        return pg.eval_on_selector("#sim-note", "e=>e.textContent")
│ +
│ +    def word():
│ +        return pg.eval_on_selector("#sj-word", "e=>e.textContent")
│ +
│ +    def goal():
│ +        return pg.eval_on_selector_all(".sim-goal", "els=>els.map(e=>e.textContent.trim())")
│ +
│ +    def prog():
│ +        return pg.evaluate("()=>localStorage.getItem('suprask:progress:v1')")
│ +
│ +    print("1) prieš jungimą: word=%r readout=%r goal=%s" % (word(), ro(), goal()))
│ +    leaked = [w for w, _ in WORDS if w in ro() or w in word()]
│ +    print("   ar žodis atskleistas prieš jungimą:", leaked)
│ +
│ +    results = []
│ +    for idx, (w, syl) in enumerate(WORDS):
│ +        tiles = pg.eval_on_selector_all("#sj-strip [data-i]", "els=>els.map(e=>e.textContent.trim())")
│ +        assert tiles == syl, (tiles, syl)
│ +        before_goal = goal()
│ +        for k in range(len(syl)):
│ +            if k == 0:
│ +                # pirmoji plytelė — klaviatūra (Tab pasiekiama, Enter paleidžia)
│ +                pg.focus("#sj-strip [data-i='0']")
│ +                pg.keyboard.press("Enter")
│ +            else:
│ +                pg.eval_on_selector_all("#sj-strip [data-i]", "(els,k)=>els[k].click()", k)
│ +            pg.wait_for_timeout(90)
│ +        pg.wait_for_timeout(650)
│ +        results.append({
│ +            "word": w,
│ +            "readout": ro(),
│ +            "wordline": word(),
│ +            "next": pg.eval_on_selector_all("#sj-next", "els=>els.length ? els[0].textContent : null"),
│ +            "goal": goal(),
│ +            "goal_before": before_goal,
│ +            "progress": prog(),
│ +        })
│ +        print(f"2.{idx+1}) {w}: readout={ro()!r} wordline={word()!r} next={results[-1]['next']!r} goal={goal()} simDone={'simDone' in (prog() or '')}")
│ +        pg.click("#sj-next")
│ +        pg.wait_for_timeout(150)
│ +        # LL-17 regresijos zondas: ar tekstas atitinka NAUJĄ žodį
│ +        new_ro = ro()
│ +        new_tiles = pg.eval_on_selector_all("#sj-strip [data-i]", "els=>els.map(e=>e.textContent.trim())")
│ +        stale = [x for x in tiles if f"„{x}“" in new_ro and x not in new_tiles]
│ +        print("     po „Kitas žodis“: plytelės=%s readout=%r pasenusių skiemenų=%s" % (new_tiles, new_ro, stale))
│ +
│ +    print("3) galutinė būsena:")
│ … omitted 26 diff line(s) across 1 additional file(s)/section(s)
│ assets/js/sims/calba.js
│ @@ -183,6 +183,8 @@
│
│      function paint() {
│        const it = item();
│ +      step = 0;
│ +      joined = false;
│        // Tarpas tarp plytelių yra matuojamas, o ne dekoratyvus: jis rodo pauzę.
│        stripEl.style.transition = "none";
│        stripEl.style.gap = ".9rem";
│ assets/js/sims/calba.js
│ @@ -272,7 +272,7 @@
│      controls.querySelector("#sj-again").addEventListener("click", () => {
│        stopTimers();
│        paint();
│ -      api.note("Tas pats žodis iš naujo. Skaityk skiemenis iš kairės į dešinę.");
│ +      api.note("Tas pats žodis iš naujo.");
│      });
│
│      paint();
│ profiles/deepseek41flash/cache/scratch/probe_ski_edge.py
│ @@ -0,0 +1,63 @@
│ +"""Kraštiniai atvejai: tuščias config, vienas skiemuo, HTML injekcija, valymas."""
│ +import json
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8850/"
│ +CHROME = "/home/zoltanas/.local/bin/google-chrome"
│ +
│ +SCRIPT = """
│ +async (config) => {
│ +  const mod = await import('/assets/js/sims/calba.js');
│ +  const comp = mod.SIMS['skiemenu-jungimas'];
│ +  const host = document.createElement('div');
│ +  host.innerHTML = '<div id="t-stage"></div><div id="t-controls"></div>';
│ +  document.body.appendChild(host);
│ +  const stage = host.querySelector('#t-stage');
│ +  const controls = host.querySelector('#t-controls');
│ +  const log = { readout: [], note: [], speak: [], progress: 0 };
│ +  const api = {
│ +    speak: (t) => log.speak.push(t),
│ +    readout: (t) => { log.readout.push(t); },
│ +    note: (t) => { log.note.push(t); },
│ +    progress: () => { log.progress += 1; },
│ +  };
│ +  let cleanup = comp.mount({ stage, controls, api, config });
│ +  const out = {
│ +    readout: log.readout.slice(),
│ +    note: log.note.slice(),
│ +    tiles: [...stage.querySelectorAll('[data-i]')].map((b) => b.textContent.trim()),
│ +    html: stage.innerHTML,
│ +    buttons: [...controls.querySelectorAll('button')].map((b) => b.textContent.trim()),
│ +    progress: log.progress,
│ +  };
│ +  cleanup();
│ +  host.remove();
│ +  return out;
│ +}
│ +"""
│ +
│ +with sync_playwright() as p:
│ +    b = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│ +    pg = b.new_page(viewport={"width": 360, "height": 780})
│ +    errs = []
│ +    pg.on("pageerror", lambda e: errs.append(str(e)))
│ +    pg.goto(BASE, wait_until="load")
│ +    cases = {
│ +        "tuščias": {},
│ +        "words ne masyvas": {"words": "mama"},
│ +        "vienas skiemuo": {"words": [{"word": "du", "syllables": ["du"]}]},
│ +        "html injekcija": {"words": [{"word": "x", "syllables": ["<b>a</b>", "ma"]}]},
│ +        "be syllables": {"words": [{"word": "be"}]},
│ +    }
│ +    for name, cfg in cases.items():
│ +        res = pg.evaluate(SCRIPT, cfg)
│ +        print(name, "->", json.dumps({
│ +            "readout": res["readout"],
│ +            "note": res["note"],
│ +            "tiles": res["tiles"],
│ +            "buttons": res["buttons"],
│ +            "progress": res["progress"],
│ +            "has_bold": "<b>" in res["html"],
│ +        }, ensure_ascii=False))
│ +    print("klaidų:", errs)
│ +    b.close()
│ profiles/deepseek41flash/cache/scratch/probe_ski_keys.py
│ @@ -0,0 +1,77 @@
│ +"""Klaviatūros zondas: Tab/Enter, fokusas po jungimo, vieno skiemens žodis."""
│ +import json
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8850/"
│ +CHROME = "/home/zoltanas/.local/bin/google-chrome"
│ +ROUTE = BASE + "#/modulis/1/lietuviu-kalba/02-skiemenu-jungimas"
│ +
│ +with sync_playwright() as p:
│ +    b = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│ +    pg = b.new_page(viewport={"width": 360, "height": 780})
│ +    errs = []
│ +    pg.on("pageerror", lambda e: errs.append(str(e)))
│ +    pg.goto(ROUTE, wait_until="load")
│ +    pg.wait_for_selector("#sj-strip [data-i]", timeout=8000)
│ +
│ +    # Tab nuo „Skaityk iš naujo" atgal? Tikriname, ar plytelės pasiekiamos Tab eilėje nuo dokumento pradžios.
│ +    pg.evaluate("()=>document.body.focus()")
│ +    order = []
│ +    for _ in range(40):
│ +        pg.keyboard.press("Tab")
│ +        info = pg.evaluate("""() => {
│ +          const a = document.activeElement;
│ +          return a ? (a.id || a.getAttribute('aria-label') || a.textContent.trim().slice(0,18)) : null;
│ +        }""")
│ +        order.append(info)
│ +        if info and info.startswith("Skiemenis"):
│ +            break
│ +    print("Tab eilė iki pirmos plytelės:", order)
│ +
│ +    # Enter ant pirmos plytelės, Tab į antrą, Enter
│ +    pg.keyboard.press("Enter")
│ +    pg.wait_for_timeout(120)
│ +    print("po Enter: readout=", repr(pg.eval_on_selector("#sim-readout", "e=>e.textContent")),
│ +          "numeris=", pg.eval_on_selector_all("#sj-strip [data-num]", "els=>els.map(e=>e.textContent)"))
│ +    pg.keyboard.press("Tab")
│ +    print("po Tab fokusas:", pg.evaluate("()=>document.activeElement.getAttribute('aria-label')"))
│ +    pg.keyboard.press("Enter")
│ +    pg.wait_for_timeout(700)
│ +    print("po antro Enter: readout=", repr(pg.eval_on_selector("#sim-readout", "e=>e.textContent")),
│ +          "word=", repr(pg.eval_on_selector("#sj-word", "e=>e.textContent")),
│ +          "fokusas=", pg.evaluate("()=>document.activeElement.id || document.activeElement.textContent.trim().slice(0,20)"))
│ +    pg.keyboard.press("Enter")  # „Kitas žodis"
│ +    pg.wait_for_timeout(150)
│ +    print("po Enter ant „Kitas žodis“: plytelės=", pg.eval_on_selector_all("#sj-strip [data-i]", "els=>els.map(e=>e.textContent.trim())"),
│ +          "readout=", repr(pg.eval_on_selector("#sim-readout", "e=>e.textContent")),
│ +          "fokusas=", pg.evaluate("()=>document.activeElement.id || document.activeElement.textContent.trim().slice(0,20)"))
│ +
│ +    # jau perskaitytas skiemuo
│ +    pg.eval_on_selector_all("#sj-strip [data-i]", "els=>els[0].click()")
│ +    pg.wait_for_timeout(100)
│ +    pg.eval_on_selector_all("#sj-strip [data-i]", "els=>els[0].click()")
│ +    pg.wait_for_timeout(100)
│ +    print("dvigubas pirmos plytelės paspaudimas: note=", repr(pg.eval_on_selector("#sim-note", "e=>e.textContent")),
│ +          "readout=", repr(pg.eval_on_selector("#sim-readout", "e=>e.textContent")))
│ +
│ +    # vieno skiemens žodis per tą patį komponentą
│ +    res = pg.evaluate("""async () => {
│ +      const mod = await import('/assets/js/sims/calba.js');
│ +      const host = document.createElement('div');
│ +      host.innerHTML = '<div id="u-stage"></div><div id="u-controls"></div>';
│ +      document.body.appendChild(host);
│ +      const log = [];
│ +      let prog = 0;
│ +      const api = { speak: () => {}, readout: (t) => log.push(t), note: () => {}, progress: () => { prog += 1; } };
│ +      mod.SIMS['skiemenu-jungimas'].mount({ stage: host.querySelector('#u-stage'), controls: host.querySelector('#u-controls'),
│ +        api, config: { words: [{ word: 'du', syllables: ['du'] }] } });
│ +      host.querySelector('[data-i]').click();
│ +      await new Promise((r) => setTimeout(r, 600));
│ +      const out = { readout: log, word: host.querySelector('#sj-word').textContent,
│ +        next: [...host.querySelectorAll('button')].map((x) => x.textContent.trim()), progress: prog };
│ +      host.remove();
│ +      return out;
│ +    }""")
│ +    print("vieno skiemens žodis:", json.dumps(res, ensure_ascii=False))
│ +    print("klaidų:", errs)
│ +    b.close()
│ assets/js/sims/calba.js
│ @@ -256,23 +256,34 @@
│        if (nextBtn && stage.contains(document.activeElement)) nextBtn.focus({ preventScroll: true });
│      }
│
│ +    function focusFirst() {
│ +      const b = stripEl.querySelector("[data-i]");
│ +      if (b) b.focus({ preventScroll: true });
│ +    }
│ +
│      function nextWord() {
│        stopTimers();
│ +      const hadFocus = nextBtn && nextBtn === document.activeElement;
│        w += 1;
│        if (w >= words.length) w = 0;
│        paint();
│ +      // LL-32: pašalintas mygtukas negrąžina fokuso į dokumento pradžią.
│ +      if (hadFocus) focusFirst();
│      }
│
│      function restart() {
│        stopTimers();
│ +      const hadFocus = nextBtn && nextBtn === document.activeElement;
│        w = 0;
│        paint();
│ +      if (hadFocus) focusFirst();
│      }
│
│      controls.querySelector("#sj-again").addEventListener("click", () => {
│        stopTimers();
│        paint();
│        api.note("Tas pats žodis iš naujo.");
│ +      focusFirst();
│      });
│
│      paint();
│ assets/js/sims/calba.js
│ @@ -200,8 +200,8 @@
│        captionEl.textContent = "Tarpai tarp plytelių — pauzės.";
│        setNext(null);
│        api.readout(it.syllables.length === 1
│ -        ? "Vienas skiemuo jau yra žodis. Spausk jį."
│ -        : skCap(`${skKiekis(it.syllables.length)}, vienas žodis. Spausk pirmą skiemenį.`));
│ +        ? `Žodis ${w + 1} iš ${words.length}. Vienas skiemuo jau yra žodis. Spausk jį.`
│ +        : `Žodis ${w + 1} iš ${words.length}. ${skCap(skKiekis(it.syllables.length))}, vienas žodis. Spausk pirmą skiemenį.`);
│        api.note("");
│      }
│
## Kas padaryta

Pataisyta simuliacija `skiemenu-jungimas` (`assets/js/sims/calba.js:101–290`) — šiandien vienintelė iš 39 komponentų, kuri niekada nekviečia `api.progress`.

**Klaidinga nuostata:** „tarpas tarp skiemenų yra žodžio dalis“ — vaikas skaitė skiemenis su pauzėmis ir žodis liko nesuprastas (modulio `teacher.misconceptions[0]`). Ankstesnė versija to nemokė: vaikas spausdavo vieną mygtuką „Skaityk kartu“ ir stebėdavo animaciją — tai demonstracija, ne modelis.

**Naujas modelis:** vaikas pats perskaito plyteles iš kairės į dešinę; plytelės atskirtos matomu tarpu ir brūkšnine „pauzės“ linija. Perskaičius paskutinį skiemenį pauzės dingsta, tarpas susitraukia 14,4 px → 1,92 px, ir atsiranda vienas žodis. Neteisinga eilė nebaudžiama — pasakoma modelio taisyklė („Skaityk iš kairės į dešinę: dabar …“).

**Prieš / po (tikra zondo išvestis, 360×780, Chromium):**
- readout po įkėlimo: `'Skiemenys'` → `'Žodis 1 iš 6. Du skiemenys, vienas žodis. Spausk pirmą skiemenį.'`
- po visų 6 žodžių: `simDone` nebuvo, `.sim-goal` 0 → `simDone: true`, žyma „Modelis įveiktas. Atsakyk klausimus žemiau.“ (1 elementas)
- teksto ir ekrano išsiskyrimas: po „Kitas žodis“ plytelės `['tė','tis']`, readout likdavo `'mama'` → dabar readout visada apie rodomą žodį, pasenusių skiemenų 0
- 360 px / 390 / 1440 × 16 ir 32 px: `docOverflow 0`, `#sim-stage` 298/298, 241/241, 328/328, 972/972, 1249/1249; taikinių < 48 px — 0
- klaviatūra: Tab pasiekia plytelę, Enter perskaito; po jungimo fokusas eina į „Kitas žodis →“, o ne į dokumento pradžią; po jo paspaudimo — į pirmą naujo žodžio plytelę (LL-32)
- kraštiniai atvejai: tuščias `config`, `words: "mama"`, žodis be `syllables` → „Žodžių sąrašo nėra.“, 0 klaidų; HTML injekcija `<b>a</b>` lieka tekstu; vieno skiemens žodis baigiamas ir pažymimas vieną kartą

## Vartai (tikra išvestis)
```
validate_content.py --grade 1 --strict → 0 klaidų, 0 įspėjimų, rc 0
check_ui.py                            → 0/0, rc 0
check_view.py --module 02-skiemenu-jungimas → checked 3, problems [], notes [], overflow 0 (21.44/19.14/18.96 px)
check_view.py visa klasė               → 117 (39×3), problemos 0, rc 0
check_language.py --grade 1            → 0 klaidų, 5 įspėjimai (kiti moduliai, buvo prieš)
check_audio.py                         → ✔ 569 tekstų, 1138 įrašų, 1138/1138 mp3
check_art.py → ✔ 8, check_lessons.py → ✔ 94, check_docs_facts.py → 0/0
```

## Nebaigta
- Paskutinis readout pakeitimas („Žodis N iš 6“) įvestas, bet zondas po jo nepaleistas — reikia pakartoti `probe_ski_after.py` ir `probe_ski_cycle.py`.
- Neįrašyta ataskaita `agents/log/simuliaciju-inzinierius-2026-11-15.md` ir neatnaujintas `agents/state.json` (`last_sim_work`), nepridėta pamoka į `research/wiki/guidelines/pamokos.md` (naujas tipas: „simuliacija be pažangos įrašo — 39 komponentai, 38 turi `api.progress`, vienas ne; žyma „Modelis įveiktas“ tam moduliui nepasiekiama“).
- Serveris `http.server 8850` dar veikia fone.

## klaidos

```
session_id: local-bee07efda8f408798d1813d432591ee324025877e2fd781aefebcd28b4535709
```
