# simuliaciju-inzinierius — 2026-11-14T1103

- paleidimas: #284 (manual)
- trukmė: 809s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/sim284/probe_progress.py
│ @@ -0,0 +1,40 @@
│ +"""Probe: does api.progress from sim actually reach localStorage for
│ +11-saziningas-dalijimasis?  Run with the repo served at --base."""
│ +import json
│ +import sys
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8841"
│ +ROUTE = "#/modulis/1/zaidimu-teorija/11-saziningas-dalijimasis"
│ +
│ +with sync_playwright() as p:
│ +    b = p.chromium.launch()
│ +    pg = b.new_page(viewport={"width": 390, "height": 780})
│ +    errs = []
│ +    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
│ +    pg.on("pageerror", lambda e: errs.append(str(e)))
│ +    pg.goto(BASE + "/" + ROUTE, wait_until="networkidle")
│ +    pg.wait_for_selector("#sd-cake path.piece")
│ +    readout = lambda: pg.inner_text("#sim-readout")
│ +    note = lambda: pg.inner_text("#sim-note")
│ +
│ +    print("start:", readout(), "|", note())
│ +    # equal split: first four pieces -> pile a
│ +    for i in range(4):
│ +        pg.click(f'#sd-cake path.piece[data-i="{i}"]')
│ +    print("4/4:", readout())
│ +    pg.click("#sd-choose")
│ +    print("choose equal:", readout(), "|", note())
│ +    print("storage1:", pg.evaluate("localStorage.getItem('suprask:progress:v1')"))
│ +
│ +    # make it unequal: move a 5th piece to pile b
│ +    pg.click('#sd-cake path.piece[data-i="4"]')
│ +    pg.evaluate("document.querySelector('#sd-cake path.piece[data-i=\"4\"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))")
│ +    print("after flip:", readout())
│ +    pg.evaluate("document.querySelector('#sd-cake path.piece[data-i=\"4\"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))")
│ +    print("after flip2:", readout())
│ +    pg.click("#sd-choose")
│ +    print("choose unequal:", readout(), "|", note())
│ +    print("storage2:", pg.evaluate("localStorage.getItem('suprask:progress:v1')"))
│ +    print("errors:", errs)
│ +    b.close()
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/sim284/probe_progress.py
│ @@ -7,8 +7,10 @@
│  BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8841"
│  ROUTE = "#/modulis/1/zaidimu-teorija/11-saziningas-dalijimasis"
│
│ +CHROME = "/home/zoltanas/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome"
│ +
│  with sync_playwright() as p:
│ -    b = p.chromium.launch()
│ +    b = p.chromium.launch(executable_path=CHROME)
│      pg = b.new_page(viewport={"width": 390, "height": 780})
│      errs = []
│      pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
│ profiles/deepseek41flash/cache/scratch/sim284/probe_progress.py
│ @@ -1,12 +1,10 @@
│ -"""Probe: does api.progress from sim actually reach localStorage for
│ -11-saziningas-dalijimasis?  Run with the repo served at --base."""
│ -import json
│ +"""Probe: does api.progress from a sim reach localStorage?
│ +11-saziningas-dalijimasis — equal split, then unequal, then read storage."""
│  import sys
│  from playwright.sync_api import sync_playwright
│
│  BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8841"
│  ROUTE = "#/modulis/1/zaidimu-teorija/11-saziningas-dalijimasis"
│ -
│  CHROME = "/home/zoltanas/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome"
│
│  with sync_playwright() as p:
│ @@ -19,24 +17,27 @@
│      pg.wait_for_selector("#sd-cake path.piece")
│      readout = lambda: pg.inner_text("#sim-readout")
│      note = lambda: pg.inner_text("#sim-note")
│ +    store = lambda: pg.evaluate("localStorage.getItem('suprask:progress:v1')")
│ +
│ +    def tap(i):
│ +        pg.evaluate(
│ +            "i => document.querySelector('#sd-cake path.piece[data-i=\"' + i + '\"]')"
│ +            ".dispatchEvent(new MouseEvent('click',{bubbles:true}))", i)
│
│      print("start:", readout(), "|", note())
│ -    # equal split: first four pieces -> pile a
│ -    for i in range(4):
│ -        pg.click(f'#sd-cake path.piece[data-i="{i}"]')
│ -    print("4/4:", readout())
│ +    for i in range(4):          # 0..3 -> pile a
│ +        tap(i)
│ +    for i in range(4, 8):       # 4..7 -> a then b
│ +        tap(i); tap(i)
│ +    print("full 4/4:", readout(), "|", note())
│      pg.click("#sd-choose")
│      print("choose equal:", readout(), "|", note())
│ -    print("storage1:", pg.evaluate("localStorage.getItem('suprask:progress:v1')"))
│ +    print("storage after equal:", store())
│
│ -    # make it unequal: move a 5th piece to pile b
│ -    pg.click('#sd-cake path.piece[data-i="4"]')
│ -    pg.evaluate("document.querySelector('#sd-cake path.piece[data-i=\"4\"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))")
│ +    tap(0)                       # a -> b, all 8 still assigned: 3 / 5
│      print("after flip:", readout())
│ -    pg.evaluate("document.querySelector('#sd-cake path.piece[data-i=\"4\"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))")
│ -    print("after flip2:", readout())
│      pg.click("#sd-choose")
│      print("choose unequal:", readout(), "|", note())
│ -    print("storage2:", pg.evaluate("localStorage.getItem('suprask:progress:v1')"))
│ +    print("storage after unequal:", store())
│      print("errors:", errs)
│      b.close()
│ profiles/deepseek41flash/cache/scratch/sim284/dead_config.py
│ @@ -0,0 +1,58 @@
│ +"""Find modules whose sim.config keys are never read by the component (LL-61)."""
│ +import json
│ +import re
│ +from pathlib import Path
│ +
│ +ROOT = Path("/home/zoltanas/workspace/suprask")
│ +SIMS = ROOT / "assets/js/sims"
│ +
│ +# component name -> (file, source)
│ +comp_src = {}
│ +for f in SIMS.glob("*.js"):
│ +    src = f.read_text(encoding="utf-8")
│ +    for m in re.finditer(r'^\s*"([a-z0-9\-]+)":\s*([A-Za-z0-9_]+)\s*,?\s*$', src, re.M):
│ +        comp_src[m.group(1)] = (f.name, src, m.group(2))
│ +
│ +def strings(obj):
│ +    if isinstance(obj, str):
│ +        yield obj
│ +    elif isinstance(obj, list):
│ +        for x in obj:
│ +            yield from strings(x)
│ +    elif isinstance(obj, dict):
│ +        for x in obj.values():
│ +            yield from strings(x)
│ +
│ +rows = []
│ +for p in sorted((ROOT / "content/lt").glob("grade-*/**/*.json")):
│ +    try:
│ +        d = json.loads(p.read_text(encoding="utf-8"))
│ +    except Exception:
│ +        continue
│ +    if not isinstance(d, dict) or "sim" not in d:
│ +        continue
│ +    comp = (d.get("sim") or {}).get("component")
│ +    cfg = (d.get("sim") or {}).get("config") or {}
│ +    if not comp or not cfg:
│ +        continue
│ +    entry = comp_src.get(comp)
│ +    if not entry:
│ +        rows.append((d.get("id"), comp, "NO COMPONENT FOUND", ""))
│ +        continue
│ +    fname, src, var = entry
│ +    # mount signature of this component
│ +    idx = src.find(f"const {var} = {{")
│ +    if idx < 0:
│ +        idx = src.find(f"function {var}")
│ +    chunk = src[idx: idx + 4000] if idx >= 0 else src
│ +    mount = re.search(r"mount\(([^)]*)\)", chunk)
│ +    sig = mount.group(1) if mount else "?"
│ +    takes_config = "config" in sig
│ +    cfg_strings = [s for s in strings(cfg) if s.strip()]
│ +    # how many of the config strings appear literally anywhere in the component
│ +    used = sum(1 for s in cfg_strings if s in chunk)
│ +    missing = [s for s in cfg_strings if s not in chunk]
│ +    rows.append((d.get("id"), comp, sig, takes_config, f"{used}/{len(cfg_strings)}", missing[:4]))
│ +
│ +for r in rows:
│ +    print(r)
│ assets/js/sims/pasaulis.js
│ @@ -1265,6 +1265,24 @@
│  const NP_ANGLE = [12, 21, 30];                       // plokštumos kampas laipsniais
│  const NP_NAME = ["žema", "vidutinė", "aukšta"];
│  const NP_NAME_NOM = ["Žema", "Vidutinė", "Aukšta"];
│ +/* Vaikui rodomi ir tariami žodžiai ateina iš modulio `sim.config.words`
│ +   (LL-61). Anksčiau komponentas config apskritai neimdavo, o penkis žodžius
│ +   turėjo įrašytus kietai, nors modulio JSON juos skelbė: pakeitus žodį
│ +   turinyje pasikeisdavo tik garso įrašai, o ekranas ir balsas likdavo seni.
│ +   Sutartis su turiniu — skaitomi LYGIAI šie penki raktai:
│ +     light „Lengvesnis pirmas“, heavy „Sunkesnis pirmas“, both „Abu kartu“,
│ +     faster „Greičiau“, slower „Lėčiau“.
│ +   Kiekvienas jų rodomas mygtuke ir tariamas TAS PATS žodis: anksčiau
│ +   mygtukas klausė „Lengvesnis pirmas“, o balsas sakydavo „Lengvas rutulys“ —
│ +   vaikas, paspaudęs spėjimą, išgirsdavo kito dalyko pavadinimą.
│ +   Nežinomi raktai ignoruojami (neteisinga konfigūracija nelūžta). */
│ +const NP_WORDS = {
│ +  light: "Lengvesnis pirmas",
│ +  heavy: "Sunkesnis pirmas",
│ +  both: "Abu kartu",
│ +  faster: "Greičiau",
│ +  slower: "Lėčiau",
│ +};
│  const NP_LEN = 150;                                   // lentos ilgis
│  const NP_THICK = 9;                                   // lentos storis
│  const NP_R = 10;                                      // rutulio spindulys
│ assets/js/sims/pasaulis.js
│ @@ -1311,7 +1311,21 @@
│  }
│
│  const nuozulniojiPlokstuma = {
│ -  mount({ stage, controls, api }) {
│ +  mount({ stage, controls, api, config }) {
│ +    const words = { ...NP_WORDS };
│ +    const cfgWords = config && typeof config.words === "object" && !Array.isArray(config.words)
│ +      ? config.words : {};
│ +    for (const key of Object.keys(NP_WORDS)) {
│ +      const v = cfgWords[key];
│ +      if (typeof v === "string" && v.trim()) words[key] = v.trim();
│ +    }
│ +    /* Mygtuko užrašas ir balsas yra tas pats žodis, o spėjimo ataskaitoje jis
│ +       pakartojamas žodžio viduryje — todėl didžioji raidė nuleidžiama tik
│ +       pirmai raidei, neliečiant „Abu kartu“ vidurio. */
│ +    const lower1 = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
│ +    const esc = (s) => String(s ?? "").replace(/[&<>"]/g,
│ +      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
│ +
│      let level = 1;              // 0 žema, 1 vidutinė, 2 aukšta
│      let guess = null;           // "light" | "heavy" | "both"
│      let state = "ready";        // ready | rolling | done
│ assets/js/sims/pasaulis.js
│ @@ -1357,9 +1357,9 @@
│          <div role="group" aria-label="Tavo spėjimas">
│            <p id="np-guess-label" style="margin:0 0 .3rem;font-weight:800;font-size:.9rem;text-align:center">Tavo spėjimas: kuris atriedės pirmas?</p>
│            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,7rem),1fr));gap:.4rem">
│ -            ${guessBtn("np-guess-light", "Lengvesnis pirmas")}
│ -            ${guessBtn("np-guess-heavy", "Sunkesnis pirmas")}
│ -            ${guessBtn("np-guess-both", "Abu kartu")}
│ +            ${guessBtn("np-guess-light", esc(words.light))}
│ +            ${guessBtn("np-guess-heavy", esc(words.heavy))}
│ +            ${guessBtn("np-guess-both", esc(words.both))}
│            </div>
│          </div>
│          <div role="group" aria-label="Plokštumos aukštis">
│ assets/js/sims/pasaulis.js
│ @@ -1483,16 +1483,15 @@
│        dH = NP_D;
│        const first = prevLevel === null;
│        if (first) {
│ -        const said = guess === "light" ? "lengvesnis pirmas"
│ -          : guess === "heavy" ? "sunkesnis pirmas" : "abu kartu";
│ +        const said = lower1(words[guess]);
│          msg = `Spėjai: ${said}. Įvyko: abu atriedėjo beveik kartu.`;
│ -        api.speak("Kartu", { rate: .9 });
│ +        api.speak(words.both, { rate: .9 });
│        } else if (level > prevLevel) {
│          msg = "Plokštuma aukštesnė: abu rutuliai atriedėjo greičiau.";
│ -        api.speak("Greičiau", { rate: .9 });
│ +        api.speak(words.faster, { rate: .9 });
│        } else if (level < prevLevel) {
│          msg = "Plokštuma žemesnė: abu rutuliai atriedėjo lėčiau.";
│ -        api.speak("Lėčiau", { rate: .9 });
│ +        api.speak(words.slower, { rate: .9 });
│        } else {
│          msg = "Ta pati plokštuma: rutuliai vėl atriedėjo beveik kartu.";
│        }
│ assets/js/sims/pasaulis.js
│ @@ -1569,7 +1569,7 @@
│          ? "Spėjimas pakeistas. Bandyk su kitu plokštumos aukščiu."
│          : "Spėjimas įrašytas. Dabar spausk „Leisk abu“.";
│        render();
│ -      api.speak(v === "light" ? "Lengvas rutulys" : v === "heavy" ? "Sunkus rutulys" : "Kartu", { rate: .9 });
│ +      api.speak(words[v], { rate: .9 });
│      }
│
│      q("#np-guess-light").addEventListener("click", () => pickGuess("light"));
│ content/lt/grade-01/pasaulio-pazinimas/17-judejimas.json
│ @@ -23,7 +23,13 @@
│    "sim": {
│      "component": "nuozulnioji-plokstuma",
│      "config": {
│ -      "words": ["Lengvas rutulys", "Sunkus rutulys", "Kartu", "Greičiau", "Lėčiau"]
│ +      "words": {
│ +        "light": "Lengvesnis pirmas",
│ +        "heavy": "Sunkesnis pirmas",
│ +        "both": "Abu kartu",
│ +        "faster": "Greičiau",
│ +        "slower": "Lėčiau"
│ +      }
│      }
│    },
│    "tasks": [
│ profiles/deepseek41flash/cache/scratch/sim284/probe_np.py
│ @@ -0,0 +1,114 @@
│ +"""17-judejimas / nuozulnioji-plokstuma: ar sim.config gyvas ir ar balsas
│ +taria TĄ PATĮ žodį, kuris parašytas mygtuke.
│ +
│ +A) bazinė konfigūracija: mygtukų užrašai, spėjimas, balsas (garso failas),
│ +   spėjimo ataskaita, 360 px geometrija 16 ir 32 px, 48 px taikiniai.
│ +B) config pakeistas tinkle: užrašai ir balsas turi sekti config (LL-61 zondas).
│ +"""
│ +import json
│ +import sys
│ +from pathlib import Path
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8841"
│ +ROUTE = "#/modulis/1/pasaulio-pazinimas/17-judejimas"
│ +CHROME = "/home/zoltanas/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome"
│ +MOD = Path("/home/zoltanas/workspace/suprask/content/lt/grade-01/pasaulio-pazinimas/17-judejimas.json")
│ +
│ +
│ +def rel_for(page, text):
│ +    return page.evaluate(
│ +        """async (t) => {
│ +            const m = await (await fetch('assets/audio/lt/manifest.json')).json();
│ +            const rec = m[t] || (m.entries ? m.entries[t] : null);
│ +            return rec ? rec : null;
│ +        }""", text)
│ +
│ +
│ +def main():
│ +    mod = json.loads(MOD.read_text(encoding="utf-8"))
│ +    out = {}
│ +    with sync_playwright() as p:
│ +        b = p.chromium.launch(executable_path=CHROME)
│ +
│ +        # ---------- A ----------
│ +        pg = b.new_page(viewport={"width": 390, "height": 780}, reduced_motion="reduce")
│ +        errs, audio = [], []
│ +        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
│ +        pg.on("pageerror", lambda e: errs.append(str(e)))
│ +        pg.on("request", lambda r: audio.append(r.url) if "assets/audio/lt/" in r.url else None)
│ +        pg.goto(BASE + "/" + ROUTE, wait_until="networkidle")
│ +        pg.wait_for_selector("#np-guess-light")
│ +
│ +        labels = [pg.inner_text(s) for s in ("#np-guess-light", "#np-guess-heavy", "#np-guess-both")]
│ +        heights = [pg.inner_text(s) for s in ("#np-h0", "#np-h1", "#np-h2")]
│ +        out["labels"] = labels
│ +        out["heights"] = heights
│ +        out["manifest_has_label_audio"] = {t: bool(rel_for(pg, t)) for t in labels + heights}
│ +
│ +        audio.clear()
│ +        pg.click("#np-guess-light")
│ +        pg.wait_for_timeout(400)
│ +        pg.click("#np-h1")
│ +        pg.click("#np-release")
│ +        pg.wait_for_timeout(300)
│ +        out["msg_first_run"] = pg.inner_text("#sim-note")
│ +        out["readout_first_run"] = pg.inner_text("#sim-readout")
│ +        out["audio_after_guess_light"] = [u.rsplit("/", 1)[-1] for u in audio]
│ +        rel_light = rel_for(pg, labels[0])
│ +        out["rel_for_label_light"] = rel_light
│ +        out["speech_played_label_file"] = bool(
│ +            rel_light and any(rel_light.rsplit("/", 1)[-1] in u for u in audio))
│ +
│ +        # antras bandymas kitame aukštyje -> api.progress
│ +        audio.clear()
│ +        pg.click("#np-h2")
│ +        pg.click("#np-release")
│ +        pg.wait_for_timeout(300)
│ +        out["msg_second_run"] = pg.inner_text("#sim-note")
│ +        out["audio_second_run"] = [u.rsplit("/", 1)[-1] for u in audio]
│ +        out["rel_for_slower"] = rel_for(pg, "Lėčiau")
│ +        store = pg.evaluate("localStorage.getItem('suprask:progress:v1')")
│ +        out["storage"] = store
│ +        out["errors_a"] = errs
│ +
│ +        # ---------- 360 px -------------
│ +        geo = {}
│ +        for root in (16, 32):
│ +            for w in (360, 390, 1440):
│ … omitted 36 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/sim284/probe_np.py
│ @@ -1,10 +1,5 @@
│  """17-judejimas / nuozulnioji-plokstuma: ar sim.config gyvas ir ar balsas
│ -taria TĄ PATĮ žodį, kuris parašytas mygtuke.
│ -
│ -A) bazinė konfigūracija: mygtukų užrašai, spėjimas, balsas (garso failas),
│ -   spėjimo ataskaita, 360 px geometrija 16 ir 32 px, 48 px taikiniai.
│ -B) config pakeistas tinkle: užrašai ir balsas turi sekti config (LL-61 zondas).
│ -"""
│ +taria TĄ PATĮ žodį, kuris parašytas mygtuke."""
│  import json
│  import sys
│  from pathlib import Path
│ @@ -16,22 +11,30 @@
│  MOD = Path("/home/zoltanas/workspace/suprask/content/lt/grade-01/pasaulio-pazinimas/17-judejimas.json")
│
│
│ -def rel_for(page, text):
│ +def entry_for(page, text):
│      return page.evaluate(
│          """async (t) => {
│              const m = await (await fetch('assets/audio/lt/manifest.json')).json();
│              const rec = m[t] || (m.entries ? m.entries[t] : null);
│ -            return rec ? rec : null;
│ +            return rec || null;
│          }""", text)
│
│
│ +def files_of(rec):
│ +    if not rec:
│ +        return []
│ +    if isinstance(rec, dict):
│ +        return [v for v in rec.values() if isinstance(v, str)]
│ +    if isinstance(rec, list):
│ +        return [v for v in rec if isinstance(v, str)]
│ +    return []
│ +
│ +
│  def main():
│ -    mod = json.loads(MOD.read_text(encoding="utf-8"))
│      out = {}
│      with sync_playwright() as p:
│          b = p.chromium.launch(executable_path=CHROME)
│
│ -        # ---------- A ----------
│          pg = b.new_page(viewport={"width": 390, "height": 780}, reduced_motion="reduce")
│          errs, audio = [], []
│          pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
│ @@ -44,35 +47,66 @@
│          heights = [pg.inner_text(s) for s in ("#np-h0", "#np-h1", "#np-h2")]
│          out["labels"] = labels
│          out["heights"] = heights
│ -        out["manifest_has_label_audio"] = {t: bool(rel_for(pg, t)) for t in labels + heights}
│ +        out["audio_entries"] = {t: files_of(entry_for(pg, t)) for t in labels + heights + ["Lėčiau", "Greičiau"]}
│
│          audio.clear()
│          pg.click("#np-guess-light")
│ -        pg.wait_for_timeout(400)
│ +        pg.wait_for_timeout(500)
│ +        out["audio_after_guess_light"] = [u.rsplit("/", 1)[-1] for u in audio]
│ +        light_files = files_of(entry_for(pg, labels[0]))
│ +        out["entry_for_label_light"] = light_files
│ +        out["speech_played_label_file"] = any(
│ +            f.rsplit("/", 1)[-1] in " ".join(audio) for f in light_files)
│ +
│          pg.click("#np-h1")
│          pg.click("#np-release")
│          pg.wait_for_timeout(300)
│          out["msg_first_run"] = pg.inner_text("#sim-note")
│          out["readout_first_run"] = pg.inner_text("#sim-readout")
│ -        out["audio_after_guess_light"] = [u.rsplit("/", 1)[-1] for u in audio]
│ -        rel_light = rel_for(pg, labels[0])
│ -        out["rel_for_label_light"] = rel_light
│ -        out["speech_played_label_file"] = bool(
│ -            rel_light and any(rel_light.rsplit("/", 1)[-1] in u for u in audio))
│
│ -        # antras bandymas kitame aukštyje -> api.progress
│          audio.clear()
│          pg.click("#np-h2")
│          pg.click("#np-release")
│ … omitted 84 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/sim284/probe_speak.py
│ @@ -0,0 +1,43 @@
│ +"""Ar api.speak tikrai groja mygtuko žodį?  Instrumentuojam fetch + Audio."""
│ +import json
│ +import sys
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8841"
│ +ROUTE = "#/modulis/1/pasaulio-pazinimas/17-judejimas"
│ +CHROME = "/home/zoltanas/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome"
│ +
│ +INIT = """
│ +window.__log = { fetch: [], play: [], tts: [] };
│ +const of = window.fetch;
│ +window.fetch = function (u, o) {
│ +  const s = typeof u === 'string' ? u : (u && u.url) || '';
│ +  window.__log.fetch.push(s);
│ +  return of.apply(this, arguments);
│ +};
│ +const op = HTMLMediaElement.prototype.play;
│ +HTMLMediaElement.prototype.play = function () {
│ +  window.__log.play.push(this.currentSrc || this.src || '');
│ +  return op.apply(this, arguments);
│ +};
│ +try {
│ +  const s = window.speechSynthesis;
│ +  if (s) { const os = s.speak.bind(s); s.speak = (u) => { window.__log.tts.push(u.text); return os(u); }; }
│ +} catch (e) {}
│ +"""
│ +
│ +with sync_playwright() as p:
│ +    b = p.chromium.launch(executable_path=CHROME)
│ +    pg = b.new_page(viewport={"width": 390, "height": 780}, reduced_motion="reduce")
│ +    pg.add_init_script(INIT)
│ +    pg.goto(BASE + "/" + ROUTE, wait_until="networkidle")
│ +    pg.wait_for_selector("#np-guess-light")
│ +    pg.wait_for_timeout(600)  # leisk manifestui ir prime() užsikrauti
│ +    print("manifest fetch:", [u for u in pg.evaluate("window.__log.fetch") if "audio" in u])
│ +    pg.click("#np-guess-light")
│ +    pg.wait_for_timeout(1200)
│ +    log = pg.evaluate("window.__log")
│ +    print("play:", log["play"])
│ +    print("tts:", log["tts"])
│ +    print("audio fetches:", [u for u in log["fetch"] if "audio" in u])
│ +    b.close()
│ profiles/deepseek41flash/cache/scratch/sim284/probe_speak2.py
│ @@ -0,0 +1,56 @@
│ +"""Tikslus žemėlapis: kuris mp3 failas sugrotas paspaudus mygtuką."""
│ +import sys
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8841"
│ +ROUTE = "#/modulis/1/pasaulio-pazinimas/17-judejimas"
│ +CHROME = "/home/zoltanas/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome"
│ +
│ +INIT = """
│ +window.__blobOf = new WeakMap();
│ +window.__urlOf = new Map();
│ +window.__played = [];
│ +const of = window.fetch;
│ +window.fetch = async function (u) {
│ +  const r = await of.apply(this, arguments);
│ +  const url = typeof u === 'string' ? u : (u && u.url) || '';
│ +  try {
│ +    const ob = r.blob.bind(r);
│ +    r.blob = async () => { const b = await ob(); window.__blobOf.set(b, url); return b; };
│ +  } catch (e) {}
│ +  return r;
│ +};
│ +const oco = URL.createObjectURL;
│ +URL.createObjectURL = function (b) {
│ +  const u = oco.call(URL, b);
│ +  window.__urlOf.set(u, window.__blobOf.get(b) || '?');
│ +  return u;
│ +};
│ +const op = HTMLMediaElement.prototype.play;
│ +HTMLMediaElement.prototype.play = function () {
│ +  const src = this.currentSrc || this.src || '';
│ +  window.__played.push(window.__urlOf.get(src) || src);
│ +  return op.apply(this, arguments);
│ +};
│ +"""
│ +
│ +with sync_playwright() as p:
│ +    b = p.chromium.launch(executable_path=CHROME)
│ +    pg = b.new_page(viewport={"width": 390, "height": 780}, reduced_motion="reduce")
│ +    pg.add_init_script(INIT)
│ +    pg.goto(BASE + "/" + ROUTE, wait_until="networkidle")
│ +    pg.wait_for_selector("#np-guess-light")
│ +    pg.wait_for_timeout(500)
│ +
│ +    for sel in ("#np-guess-light", "#np-guess-heavy", "#np-guess-both"):
│ +        pg.evaluate("window.__played.length = 0")
│ +        pg.click(sel)
│ +        pg.wait_for_timeout(700)
│ +        print(sel, pg.inner_text(sel), "->", pg.evaluate("window.__played"))
│ +
│ +    # antras aukštis -> „Greičiau“ ar „Lėčiau“
│ +    pg.click("#np-h1"); pg.click("#np-release"); pg.wait_for_timeout(300)
│ +    pg.evaluate("window.__played.length = 0")
│ +    pg.click("#np-h0"); pg.click("#np-release"); pg.wait_for_timeout(400)
│ +    print("level 1 -> 0 (žemiau) note:", pg.inner_text("#sim-note"), "->", pg.evaluate("window.__played"))
│ +    b.close()
│ profiles/deepseek41flash/cache/scratch/sim284/probe_speak3.py
│ @@ -0,0 +1,68 @@
│ +"""Kuris mp3 sugrotas: blob turinio SHA-256 lyginamas su manifeste įrašytais failais."""
│ +import hashlib
│ +import json
│ +import sys
│ +from pathlib import Path
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8841"
│ +ROUTE = "#/modulis/1/pasaulio-pazinimas/17-judejimas"
│ +CHROME = "/home/zoltanas/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome"
│ +AUDIO = Path("/home/zoltanas/workspace/suprask/assets/audio/lt")
│ +
│ +INIT = """
│ +window.__playedSrc = [];
│ +const op = HTMLMediaElement.prototype.play;
│ +HTMLMediaElement.prototype.play = function () {
│ +  window.__playedSrc.push(this.currentSrc || this.src || '');
│ +  return op.apply(this, arguments);
│ +};
│ +"""
│ +
│ +HASH = """
│ +async (src) => {
│ +  const b = await (await fetch(src)).blob();
│ +  const buf = await b.arrayBuffer();
│ +  const d = await crypto.subtle.digest('SHA-256', buf);
│ +  return Array.from(new Uint8Array(d)).map(x => x.toString(16).padStart(2, '0')).join('');
│ +}
│ +"""
│ +
│ +# failo hash -> (tekstas, variantas)
│ +index = {}
│ +for mp3 in AUDIO.glob("*/*.mp3"):
│ +    index[hashlib.sha256(mp3.read_bytes()).hexdigest()] = mp3.relative_to(AUDIO).as_posix()
│ +
│ +manifest = json.loads((AUDIO / "manifest.json").read_text(encoding="utf-8"))
│ +
│ +with sync_playwright() as p:
│ +    b = p.chromium.launch(executable_path=CHROME)
│ +    pg = b.new_page(viewport={"width": 390, "height": 780}, reduced_motion="reduce")
│ +    pg.add_init_script(INIT)
│ +    pg.goto(BASE + "/" + ROUTE, wait_until="networkidle")
│ +    pg.wait_for_selector("#np-guess-light")
│ +    pg.wait_for_timeout(500)
│ +
│ +    for sel in ("#np-guess-light", "#np-guess-heavy", "#np-guess-both"):
│ +        pg.evaluate("window.__playedSrc.length = 0")
│ +        pg.click(sel)
│ +        pg.wait_for_timeout(900)
│ +        srcs = pg.evaluate("window.__playedSrc")
│ +        got = []
│ +        for s in srcs:
│ +            if s.startswith("blob:"):
│ +                got.append(index.get(pg.evaluate(HASH, s), "UNKNOWN"))
│ +            else:
│ +                got.append(s)
│ +        label = pg.inner_text(sel)
│ +        entry = manifest.get(label) or {}
│ +        print(f"{label!r} -> grota {got} | manifestas: {entry}")
│ +
│ +    pg.evaluate("window.__playedSrc.length = 0")
│ +    pg.click("#np-h1"); pg.click("#np-release"); pg.wait_for_timeout(300)
│ +    pg.evaluate("window.__playedSrc.length = 0")
│ +    pg.click("#np-h0"); pg.click("#np-release"); pg.wait_for_timeout(600)
│ +    print("aukštis 1 -> 0:", pg.inner_text("#sim-note"))
│ +    for s in pg.evaluate("window.__playedSrc"):
│ +        print("   grota:", index.get(pg.evaluate(HASH, s), s) if s.startswith("blob:") else s)
│ +    b.close()
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/sim284/probe_speak3.py
│ @@ -14,7 +14,9 @@
│  window.__playedSrc = [];
│  const op = HTMLMediaElement.prototype.play;
│  HTMLMediaElement.prototype.play = function () {
│ -  window.__playedSrc.push(this.currentSrc || this.src || '');
│ +  // `currentSrc` atsinaujina tik pradėjus krautis, todėl imamas src atributas
│ +  // (jis nustatomas sinchroniškai prieš play()) — kitaip žurnalas atsilieka vienu žodžiu.
│ +  window.__playedSrc.push(this.getAttribute('src') || this.src || '');
│    return op.apply(this, arguments);
│  };
│  """
│ profiles/deepseek41flash/cache/scratch/sim284/probe_fallback.py
│ @@ -0,0 +1,43 @@
│ +"""Sąlyga: modulis be sim.config — komponentas turi veikti su atsarginiais žodžiais."""
│ +import json
│ +import sys
│ +from pathlib import Path
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8841"
│ +ROUTE = "#/modulis/1/pasaulio-pazinimas/17-judejimas"
│ +CHROME = "/home/zoltanas/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome"
│ +MOD = Path("/home/zoltanas/workspace/suprask/content/lt/grade-01/pasaulio-pazinimas/17-judejimas.json")
│ +
│ +with sync_playwright() as p:
│ +    b = p.chromium.launch(executable_path=CHROME)
│ +    pg = b.new_page(viewport={"width": 360, "height": 780}, reduced_motion="reduce")
│ +    errs = []
│ +    pg.on("pageerror", lambda e: errs.append(str(e)))
│ +    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
│ +    mod = json.loads(MOD.read_text(encoding="utf-8"))
│ +    mod["sim"]["config"] = {}
│ +    pg.route("**/17-judejimas.json", lambda r: r.fulfill(
│ +        status=200, content_type="application/json", body=json.dumps(mod, ensure_ascii=False)))
│ +    pg.goto(BASE + "/" + ROUTE, wait_until="networkidle")
│ +    pg.wait_for_selector("#np-guess-light")
│ +    print("be config mygtukai:", [pg.inner_text(s) for s in
│ +                                 ("#np-guess-light", "#np-guess-heavy", "#np-guess-both")])
│ +    pg.click("#np-guess-light"); pg.click("#np-h1"); pg.click("#np-release")
│ +    pg.wait_for_timeout(200)
│ +    print("note:", pg.inner_text("#sim-note"))
│ +    # neteisinga konfigūracija: masyvas (senoji forma) — turi būti ignoruojamas
│ +    pg2 = b.new_page(viewport={"width": 360, "height": 780}, reduced_motion="reduce")
│ +    e2 = []
│ +    pg2.on("pageerror", lambda e: e2.append(str(e)))
│ +    mod2 = json.loads(MOD.read_text(encoding="utf-8"))
│ +    mod2["sim"]["config"] = {"words": ["Lengvas rutulys"]}
│ +    pg2.route("**/17-judejimas.json", lambda r: r.fulfill(
│ +        status=200, content_type="application/json", body=json.dumps(mod2, ensure_ascii=False)))
│ +    pg2.goto(BASE + "/" + ROUTE, wait_until="networkidle")
│ +    pg2.wait_for_selector("#np-guess-light")
│ +    print("masyvo config atveju:", [pg2.inner_text(s) for s in
│ +                                    ("#np-guess-light", "#np-guess-heavy", "#np-guess-both")],
│ +          "| klaidos:", e2)
│ +    print("klaidos (tuščias config):", errs)
│ +    b.close()
## Padaryta šiame paleidime (#284)

**Darbas: `17-judejimas` simuliacija `nuozulnioji-plokstuma` (assets/js/sims/pasaulis.js) — gyva konfigūracija + vienas žodis vienam veiksmui.**

### Defektas (įrodytas, ne spėtas)
Kritiko pasiūlymas #270 (`2026-11-13-kritikas-judejimas-negyva-konfiguracija.json`) buvo teisus, ir aš jį patikrinau plačiau: iš **39 simuliacijų komponentų 38 priima `config`, o `nuozulnioji-plokstuma` buvo vienintelis be jo** (`mount({ stage, controls, api })`). Todėl modulio `sim.config.words` buvo negyvas (LL-61 klasė tame pačiame faile, kur `vandensBusenos` jau buvo sutvarkyta lygiai taip pat).

Antras, vaikui matomas sluoksnis: mygtukas klausė **„Lengvesnis pirmas“**, o balsas ištardavo **„Lengvas rutulys“** — ekranas ir ausis atsakinėjo į skirtingus klausimus (spėjimas vs daikto pavadinimas).

### Pakeitimai
- `pasaulis.js`: `mount(... config)`; naujas `NP_WORDS` (light/heavy/both/faster/slower) su atsarginių žodžių logika (masyvo forma ir tuščias config ignoruojami, nelūžta); mygtukų užrašai, `api.speak` ir „Spėjai: …“ ataskaita imami iš **to paties** config žodžio; pridėtas `esc()` (žodžiai ateina iš JSON).
- `17-judejimas.json`: `sim.config.words` → objektas su 5 raktais (visi skaitomi).
- Garsas: sugeneruota 6 nauji mp3 (Piper, lokalu) trims naujiems žodžiams; 6 pasenę našlaičiai pašalinti (`check_audio --prune`) → **569 tekstai / 1138 įrašai, 0 našlaičių**.

### Tikra patikra (ne „turėtų veikti“)
- **LL-61 elgesio zondas:** pakeitus `config.words` tinkle, mygtukai pasikeitė į „Lėčiau / Greičiau / Abu kartu“ — config gyvas.
- **Balso zondas (blob SHA-256 vs manifestas):** „Lengvesnis pirmas“ → `n/944a…`, „Sunkesnis pirmas“ → `n/82ab…`, „Abu kartu“ → `n/33b9…`, aukštis žemyn → „Lėčiau“ `n/4a93…` — kiekvienas mygtukas groja **savo** žodį.
- **360 px:** 6 deriniai (360/390/1440 × 16/32 px): `docOverflow 0`, `#sim-stage scrollWidth == clientWidth` (298/298, 241/241, 328/328, 271/271), `smallTargets []`, 0 konsolės klaidų. `check_view.py --module 17-judejimas` → 3 patikros, 0 problemų; **visa klasė 117 patikrų (39×3), 0 problemų**.
- **Vartai:** `validate_content.py --grade 1 --strict` 0/0 (rc 0), visi moduliai 0/0; `check_ui.py` 0/0; `check_language.py --grade 1` 0 klaidų / 5 įspėjimai (kituose moduliuose, buvo prieš); `check_art.py` ✔; `check_lessons.py` ✔ 91; `check_docs_facts.py` 0/0.
- **Kraštiniai atvejai:** tuščias `config` ir senoji masyvo forma → atsarginiai žodžiai, 0 klaidų.
- **Ankstesnio paleidimo atviras punktas išspręstas:** `api.progress` **veikia** — `localStorage` turi `"simDone":true` po abiejų atvejų (ankstesnis zondas klydo, nes nepadalijo viso torto).

### NEpadaryta (sąžiningai)
- **`agents/log/` ataskaita, `agents/state.json` (`last_sim_work`) ir pamokos LL-92 įrašas `research/wiki/guidelines/pamokos.md` neįrašyti** — baigėsi iteracijų limitas. Tai pirmas darbas kitam paleidimui; pakeitimai palikti darbinėje kopijoje, nekomituoti (publikuoja bėgiklis).
- **Naujas atradimas, kurio neišnaudojau:** `progress.markSimDone` rašo `simDone`, bet **jokioje kodo vietoje jo niekas neskaito** (`isDone()` remiasi tik užduotimis). Vaikas, išsprendęs pagrindinę mokymosi vietą (P2 — simuliacija) bet neatsakęs užduočių, žymos „atlikta“ nemato. Tai verta atskiro pasiūlymo (`assets/js/progress.js`), bet failo keisti negalėjau — ne mano vaidmens ribos.
- Simuliacijos modelio fizika neliesta (2 % rutulių skirtumas, `api.progress` po dviejų skirtingų aukščių) — ji buvo teisinga.

## klaidos

```
session_id: local-db8f6dfa63f2ec3b5a62fc485e822d065dc476a940d30976fd14f85ee6401e1b
```
