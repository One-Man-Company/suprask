# simuliaciju-inzinierius — 2026-11-10T1103

- paleidimas: #219 (manual)
- trukmė: 768s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ assets/js/sims/zaidimai.js
│ @@ -180,8 +180,23 @@
│        { id: "zirkles", emoji: "✌️", label: "Žirklės", acc: "žirkles", beats: "popierius" },
│        { id: "popierius", emoji: "✋", label: "Popierius", acc: "popierių", beats: "akmenelis" },
│      ];
│ +    const ROWS = [
│ +      { k: "win", label: "Laimėjimai", c: "#4fc3a1" },
│ +      { k: "lose", label: "Pralaimėjimai", c: "#f2708a" },
│ +      { k: "draw", label: "Lygiosios", c: "#ffc94d" },
│ +    ];
│ +    /* Modulio rezultatas žada „stebiu rezultatus ir lyginu juos su lūkesčiu“,
│ +       o simuliacija anksčiau tik skaičiavo ir po dešimto ėjimo PASKELBDAMA
│ +       „kiekvienas variantas laimi maždaug trečdalį kartų“ — neparodžiusi nei
│ +       lūkesčio, nei palyginimo su juo. Dabar trečdalis rodomas kaip skaičius,
│ +       o palyginti kviečiamas vaikas (P2: pirma veiksmas, paskui
│ +       paaiškinimas). Trečdalis imamas ties 9 ėjimais, nes 9 : 3 = 3 —
│ +       sveikas skaičius, kurį vaikas perskaičiuoja pats. */
│ +    const THIRD_AT = 9;
│ +    const DUEL = "Akmenėlis nugali žirkles. Žirklės nugali popierių. Popierius nugali akmenėlį.";
│      const score = { win: 0, lose: 0, draw: 0 };
│ -    let last = "Paklausk draugo arba spausk savo ėjimą.";
│ +    let streak = { id: null, n: 0 };
│ +    let announced = false;
│
│      /* Kortelė yra `#sim-stage` tinklelio vaikas: be `min-width:0` jos
│         mažiausias plotis lygus turinio min-content, todėl prie 200 % teksto
│ assets/js/sims/zaidimai.js
│ @@ -209,17 +209,19 @@
│            <span id="ap-you">❔</span><span style="font-size:min(1.2rem,9cqw);color:var(--ink-faint)">prieš</span><span id="ap-pc">❔</span>
│          </div>
│          <p id="ap-msg" style="font-family:var(--font-head);font-weight:800;min-height:1.6rem"></p>
│ -        <div id="ap-bars" style="display:grid;gap:.4rem;max-width:24rem;margin:0 auto"></div>
│ +        <div id="ap-bars" style="display:flex;flex-direction:column;gap:.4rem;max-width:26rem;margin:0 auto"></div>
│ +        <p id="ap-third" style="font-size:.95rem;font-weight:700;margin:.6rem 0 0"></p>
│        </div>`;
│      controls.innerHTML = `
│ -      <div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center">
│ -        ${moves.map((m) => `<button class="btn secondary" data-move="${m.id}" style="font-size:2rem;min-width:4.4rem" aria-label="${m.label}">${m.emoji}</button>`).join("")}
│ +      <div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;min-width:0">
│ +        ${moves.map((m) => `<button class="btn secondary" data-move="${m.id}" style="font-size:min(2rem,10vw);min-width:min(4.4rem,22vw);min-height:48px" aria-label="${m.label}">${m.emoji}</button>`).join("")}
│        </div>
│        <button class="btn ghost" id="ap-reset">Nuo nulio</button>`;
│      const youEl = stage.querySelector("#ap-you");
│      const pcEl = stage.querySelector("#ap-pc");
│      const msgEl = stage.querySelector("#ap-msg");
│      const barsEl = stage.querySelector("#ap-bars");
│ +    const thirdEl = stage.querySelector("#ap-third");
│
│      function bars() {
│        const total = score.win + score.lose + score.draw || 1;
│ assets/js/sims/zaidimai.js
│ @@ -232,16 +232,33 @@
│        ];
│        /* Fiksuotos `7rem`/`3rem` kolonos prie 200 % teksto (32 px šaknis) užėmė
│           336 px ir stulpelis nebetilpo į 294,8 px kortelę (#4741). Dabar tai
│ -         lanksti eilutė: įprastu šriftu pločiai tie patys (112 + likęs + 48),
│ -         o padidinus tekstą eilutė persirikiuoja, o ne išstumia puslapį. */
│ -      barsEl.innerHTML = rows.map((r) => `
│ -        <div style="display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;font-size:.9rem;font-weight:700">
│ -          <span style="flex:0 0 auto;width:7rem;max-width:100%;text-align:right">${r.k}</span>
│ +         lanksti eilutė: įprastu šriftu pločiai tie patys, o padidinus tekstą
│ +         eilutė persirikiuoja (LL-41, LL-51), o ne išstumia puslapį. */
│ +      barsEl.innerHTML = ROWS.map((r) => `
│ +        <div style="display:flex;flex-wrap:wrap;gap:.35rem .5rem;align-items:center;font-size:.9rem;font-weight:700;min-width:0">
│ +          <span style="flex:0 0 auto">${r.label}</span>
│            <span style="flex:1 1 5rem;min-width:2.5rem;height:1.2rem;background:var(--line);border-radius:999px;overflow:hidden">
│ -            <span style="display:block;height:100%;width:${(r.v / total) * 100}%;background:${r.c}"></span>
│ +            <span style="display:block;height:100%;width:${(score[r.k] / total) * 100}%;background:${r.c}"></span>
│            </span>
│ -          <span style="flex:0 0 auto;width:3rem">${r.v}</span>
│ +          <span style="flex:0 0 auto;min-width:1.2rem;text-align:right">${score[r.k]}</span>
│          </div>`).join("");
│ +      /* Trečdalis imamas iš TIKRŲ ėjimų, o ne paskelbiamas iš anksto: kai
│ +         ėjimų skaičius nesidalija iš 3, neišgalvotas skaičius nerodomas. */
│ +      const played = score.win + score.lose + score.draw;
│ +      thirdEl.textContent = played === 0
│ +        ? "Iš viso 0 ėjimų."
│ +        : played % 3 === 0
│ +          ? `${played} ėjimai. Jei visi trys lygūs — po ${played / 3}.`
│ +          : `${played} ėjimai.`;
│ +    }
│ +
│ +    /* Trys paaiškinimo eilės, visos trumpesnės už 10 žodžių. Serija rodoma
│ +       TIK jai prasidėjus, o ne po dešimto ėjimo: kitaip vaikas „karštą ranką“
│ +       jau spėja įsidėmėti, o neigimą išgirsta kaip pamokymą, ne pastebėjimą. */
│ +    function explain(played) {
│ +      if (streak.n >= 3) return `Jau ${streak.n} tokie patys rezultatai iš eilės. Kitas ėjimas gali būti bet kuris.`;
│ +      if (played > 0 && played % 3 === 0) return `Po ${played} ėjimų trečdalis — po ${played / 3}. Palygink su savo skaičiais.`;
│ +      return DUEL;
│      }
│
│      function play(id) {
│ @@ -249,28 +266,43 @@
│        const pc = moves[Math.floor(Math.random() * moves.length)];
│        youEl.textContent = me.emoji;
│        pcEl.textContent = pc.emoji;
│ -      if (me.id === pc.id) { score.draw += 1; msgEl.textContent = "Lygiosios — abu parodėte tą patį."; }
│ -      else if (me.beats === pc.id) { score.win += 1; msgEl.textContent = `${me.label} nugali ${pc.acc}!`; }
│ -      else { score.lose += 1; msgEl.textContent = `${pc.label} nugali ${me.acc}.`; }
│ +      let out;
│ +      if (me.id === pc.id) {
│ +        out = "draw"; score.draw += 1;
│ +        msgEl.textContent = "Lygiosios — abu parodėte tą patį.";
│ +      } else if (me.beats === pc.id) {
│ +        out = "win"; score.win += 1;
│ +        msgEl.textContent = `${me.label} nugali ${pc.acc}!`;
│ +      } else {
│ +        out = "lose"; score.lose += 1;
│ +        msgEl.textContent = `${pc.label} nugali ${me.acc}.`;
│ +      }
│ +      streak = streak.id === out ? { id: out, n: streak.n + 1 } : { id: out, n: 1 };
│ +
│ +      const played = score.win + score.lose + score.draw;
│        bars();
│ -      api.readout(`Tu ${score.win} · Kompiuteris ${score.lose} · Lygiosios ${score.draw}`);
│ -      const total = score.win + score.lose + score.draw;
│ -      if (total >= 10) {
│ -        api.note(`Po ${total} ėjimų: kiekvienas variantas laimi maždaug trečdalį kartų. Nėra „karštos rankos“ — tik atsitiktinumas.`);
│ +      api.readout(`Laimėjimai ${score.win}, pralaimėjimai ${score.lose}, lygiosios ${score.draw}. Ėjimų ${played}.`);
│ +      api.note(explain(played));
│ +      if (played >= THIRD_AT && !announced) {
│ +        announced = true;
│          api.progress({ correct: true });
│ -      } else {
│ -        api.note(last);
│        }
│      }
│
│      controls.querySelectorAll("[data-move]").forEach((b) => b.addEventListener("click", () => play(b.dataset.move)));
│      controls.querySelector("#ap-reset").addEventListener("click", () => {
│ … omitted 16 diff line(s) across 1 additional file(s)/section(s)
│ assets/js/sims/zaidimai.js
│ @@ -225,11 +225,6 @@
│
│      function bars() {
│        const total = score.win + score.lose + score.draw || 1;
│ -      const rows = [
│ -        { k: "Laimėjai", v: score.win, c: "#4fc3a1" },
│ -        { k: "Pralaimėjai", v: score.lose, c: "#f2708a" },
│ -        { k: "Lygiosios", v: score.draw, c: "#ffc94d" },
│ -      ];
│        /* Fiksuotos `7rem`/`3rem` kolonos prie 200 % teksto (32 px šaknis) užėmė
│           336 px ir stulpelis nebetilpo į 294,8 px kortelę (#4741). Dabar tai
│           lanksti eilutė: įprastu šriftu pločiai tie patys, o padidinus tekstą
│ profiles/deepseek41flash/cache/scratch/probe219.py
│ @@ -0,0 +1,184 @@
│ +#!/usr/bin/env python3
│ +"""Zondas: akmenelis-popierius (run 219) — lūkesčio juosta, serija, 200 % tekstas."""
│ +import http.server
│ +import json
│ +import socketserver
│ +import threading
│ +import functools
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +PORT = 8996
│ +CHROME = "/home/zoltanas/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome"
│ +ROUTE = "#/modulis/1/zaidimu-teorija/13-akmenelis-popierius"
│ +
│ +Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
│ +Handler.extensions_map = {
│ +    ".js": "text/javascript",
│ +    ".json": "application/json",
│ +    ".css": "text/css",
│ +    ".svg": "image/svg+xml",
│ +    "": "text/plain",
│ +}
│ +
│ +
│ +class Quiet(http.server.SimpleHTTPRequestHandler):
│ +    def log_message(self, *a):
│ +        pass
│ +
│ +
│ +class S(socketserver.ThreadingTCPServer):
│ +    allow_reuse_address = True
│ +    daemon_threads = True
│ +
│ +
│ +server = S(("127.0.0.1", PORT), functools.partial(Quiet, directory=ROOT))
│ +threading.Thread(target=server.serve_forever, daemon=True).start()
│ +
│ +PROBE = r"""
│ +() => {
│ +  const vw = window.innerWidth;
│ +  const de = document.documentElement;
│ +  const stage = document.querySelector('#sim-stage');
│ +  const controls = document.querySelector('#sim-controls');
│ +  const over = [];
│ +  for (const el of document.querySelectorAll('#sim-stage *, #sim-controls *')) {
│ +    const r = el.getBoundingClientRect();
│ +    if (r.width === 0 && r.height === 0) continue;
│ +    if (r.right > vw + 1 || r.left < -1) {
│ +      over.push({ tag: el.tagName, text: (el.textContent||'').trim().slice(0,24),
│ +                  left: Math.round(r.left), right: Math.round(r.right),
│ +                  w: Math.round(r.width), h: Math.round(r.height) });
│ +    }
│ +  }
│ +  const targets = [...document.querySelectorAll('#sim-stage button, #sim-controls button, [data-move]')]
│ +    .map(el => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })
│ +    .filter(r => r.w > 0 && r.h > 0);
│ +  const prog = JSON.parse(localStorage.getItem('suprask:progress:v1') || '{"modules":{}}');
│ +  return {
│ +    rootFont: getComputedStyle(document.documentElement).fontSize,
│ +    innerWidth: vw,
│ +    docScrollWidth: de.scrollWidth,
│ +    docOverflow: de.scrollWidth - vw,
│ +    stageScrollW: stage ? stage.scrollWidth : null,
│ +    stageClientW: stage ? stage.clientWidth : null,
│ +    controlsScrollW: controls ? controls.scrollWidth : null,
│ +    controlsClientW: controls ? controls.clientWidth : null,
│ +    overflowing: over.slice(0, 6),
│ +    smallTargets: targets.filter(t => t.w < 48 || t.h < 48),
│ +    targets,
│ +    readout: (document.querySelector('#sim-readout')?.textContent || '').trim(),
│ +    note: (document.querySelector('#sim-note')?.textContent || '').trim(),
│ +    msg: (document.querySelector('#ap-msg')?.textContent || '').trim(),
│ +    third: (document.querySelector('#ap-third')?.textContent || '').trim(),
│ +    bars: [...document.querySelectorAll('#ap-bars > div')].map(r => r.textContent.replace(/\s+/g, ' ').trim()),
│ +    simDone: !!(prog.modules['13-akmenelis-popierius'] || {}).simDone,
│ +  };
│ +}
│ … omitted 106 diff line(s) across 1 additional file(s)/section(s)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe219.py
│ @@ -9,7 +9,7 @@
│  from playwright.sync_api import sync_playwright
│
│  ROOT = "/home/zoltanas/workspace/suprask"
│ -PORT = 8996
│ +PORT = 8987
│  CHROME = "/home/zoltanas/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome"
│  ROUTE = "#/modulis/1/zaidimu-teorija/13-akmenelis-popierius"
│
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe219.py
│ @@ -33,8 +33,7 @@
│      daemon_threads = True
│
│
│ -server = S(("127.0.0.1", PORT), functools.partial(Quiet, directory=ROOT))
│ -threading.Thread(target=server.serve_forever, daemon=True).start()
│ +server = None
│
│  PROBE = r"""
│  () => {
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe219.py
│ @@ -175,7 +175,6 @@
│          page.close()
│
│          b.close()
│ -    server.shutdown()
│      print(json.dumps(out, ensure_ascii=False, indent=1))
│
│
│ assets/js/sims/zaidimai.js
│ @@ -238,13 +238,14 @@
│            <span style="flex:0 0 auto;min-width:1.2rem;text-align:right">${score[r.k]}</span>
│          </div>`).join("");
│        /* Trečdalis imamas iš TIKRŲ ėjimų, o ne paskelbiamas iš anksto: kai
│ -         ėjimų skaičius nesidalija iš 3, neišgalvotas skaičius nerodomas. */
│ +         ėjimų skaičius nesidalija iš 3, neišgalvotas skaičius nerodomas.
│ +         „1 ėjimas“ / „2 ėjimai“ — skaičiaus forma, ne daugiskaita visada. */
│        const played = score.win + score.lose + score.draw;
│        thirdEl.textContent = played === 0
│          ? "Iš viso 0 ėjimų."
│          : played % 3 === 0
│ -          ? `${played} ėjimai. Jei visi trys lygūs — po ${played / 3}.`
│ -          : `${played} ėjimai.`;
│ +          ? `${played} ${ejimai(played)}. Jei visi trys lygūs — po ${played / 3}.`
│ +          : `${played} ${ejimai(played)}.`;
│      }
│
│      /* Trys paaiškinimo eilės, visos trumpesnės už 10 žodžių. Serija rodoma
│ assets/js/sims/zaidimai.js
│ @@ -194,6 +194,7 @@
│         sveikas skaičius, kurį vaikas perskaičiuoja pats. */
│      const THIRD_AT = 9;
│      const DUEL = "Akmenėlis nugali žirkles. Žirklės nugali popierių. Popierius nugali akmenėlį.";
│ +    const ejimai = (n) => (n % 10 === 1 && n % 100 !== 11 ? "ėjimas" : "ėjimai");
│      const score = { win: 0, lose: 0, draw: 0 };
│      let streak = { id: null, n: 0 };
│      let announced = false;
│ profiles/deepseek41flash/cache/scratch/probe219b.py
│ @@ -0,0 +1,61 @@
│ +#!/usr/bin/env python3
│ +"""Zondas 219b: klaviatūros eilė per sim valdiklius + skaičiaus forma (1 ėjimas)."""
│ +import json
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8987/"
│ +CHROME = "/home/zoltanas/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome"
│ +ROUTE = "#/modulis/1/zaidimu-teorija/13-akmenelis-popierius"
│ +
│ +with sync_playwright() as p:
│ +    b = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│ +    page = b.new_page(viewport={"width": 360, "height": 820})
│ +    errs = []
│ +    page.on("pageerror", lambda e: errs.append("pageerror: " + str(e)[:160]))
│ +    page.on("console", lambda m: errs.append("console: " + m.text[:160]) if m.type == "error" else None)
│ +    page.add_init_script("localStorage.clear();")
│ +    page.add_init_script("Math.random = () => 0.01;")
│ +    page.goto(BASE + ROUTE, wait_until="domcontentloaded", timeout=25000)
│ +    page.wait_for_selector("[data-move]", timeout=15000)
│ +    page.wait_for_timeout(400)
│ +
│ +    page.evaluate("() => { document.body.setAttribute('tabindex','-1'); document.body.focus(); }")
│ +    order = []
│ +    hits = []
│ +    for _ in range(80):
│ +        page.keyboard.press("Tab")
│ +        label = page.evaluate(
│ +            "() => { const a = document.activeElement; "
│ +            "return (a && (a.getAttribute('aria-label') || a.textContent || a.id || a.tagName)).trim().slice(0,24); }"
│ +        )
│ +        order.append(label)
│ +        if label in ("Akmenėlis", "Žirklės", "Popierius") and label not in hits:
│ +            hits.append(label)
│ +        if label == "Nuo nulio":
│ +            break
│ +
│ +    # Enter ant paskutinio rasto ėjimo mygtuko
│ +    page.keyboard.press("Shift+Tab")
│ +    page.keyboard.press("Enter")
│ +    page.wait_for_timeout(200)
│ +    after_enter = page.evaluate(
│ +        "() => ({ readout: document.querySelector('#sim-readout').textContent,"
│ +        " third: document.querySelector('#ap-third').textContent,"
│ +        " note: document.querySelector('#sim-note').textContent })"
│ +    )
│ +
│ +    # Skaičiaus forma: 1 ėjimas, 2 ėjimai
│ +    page.click('[data-move="akmenelis"]')
│ +    page.wait_for_timeout(100)
│ +    two = page.evaluate("() => document.querySelector('#ap-third').textContent")
│ +
│ +    b.close()
│ +
│ +print(json.dumps({
│ +    "tab_order": order,
│ +    "sim_hits": hits,
│ +    "after_enter": after_enter,
│ +    "third_after_2": two,
│ +    "errors": errs,
│ +}, ensure_ascii=False, indent=1))
│ research/wiki/guidelines/pamokos.md
│ @@ -566,3 +566,17 @@
│  - **Priežastis:** forma buvo piešiama kaip atskiras gražus objektas, o „laukėlis“ gyveno tik išdėstymo aritmetikoje (`i × px`). Atitraukimas atrodė kaip detalė, bet iš tikrųjų keitė išmatuotą dydį: kiekvienas vienetas vizualiai buvo trumpesnis už save, o paklaida augo su vienetų skaičiumi (6 × 14 px = 84 px sąvaržėlių eilėje). Tai ta pati klasė kaip LL-31 (skaičius, kuris nusikirpo), tik apversta: ne tekstas neatitinka dėžės, o piešinys neatitinka savo ilgio.
│  - **Taisyklė:** kai scena kartoja vieną vienetą, kiekvienos kopijos **rašalas** turi užimti lygiai savo laukelį `[x, x + px]`; tarpai tarp vienetų piešiami kaip linija (kontūras, skiriamoji juosta), o ne paliekami kaip tuštuma. Jei forma turi būti atitraukta (kad atpažintum), atitraukimas atimamas iš formos vidaus, ne iš laukelio. Paskutinio vieneto dešinys kraštas turi sutapti su tuo pačiu ženklu, prie kurio rašoma „baigėsi“.
│  - **Patikra:** zondas ima žetonų grupės `getBBox()` ir lygina su lentos galu: `25-ilgis-ir-vienetas` — 6 sąvaržėlės `left 40, right 280`, 4 trintukai `40/280`, 2 pieštukai `40/280` (lentos `getBBox()` {x 0, y −46, w 240, h 46} prieš ir po visų trijų vienetų bei grįžus į sąvaržėlę). Be to, tikrinama, kad tarp žetonų neliktų tuštumos, kurios nepaaiškina jokia briauna: kiekvieno žetono kontūras yra toje pačioje x vietoje, kur baigiasi ankstesnis.
│ +
│ +## LL-79 — Išvada, kuri paskelbta, o ne apskaičiuota
│ +
│ +- **Simptomas:** `13-akmenelis-popierius` (1 kl., simuliacija `akmenelis-popierius`, `assets/js/sims/zaidimai.js`) po dešimto ėjimo rašydavo „Po 10 ėjimų: kiekvienas variantas laimi maždaug trečdalį kartų. Nėra „karštos rankos“ — tik atsitiktinumas.“ Toje pačioje būsenoje ekrane buvo tik trys skaitikliai (laimėjimai / pralaimėjimai / lygiosios) — nei trečdalio skaičiaus, nei lūkesčio, nei palyginimo su juo. Modulio rezultatas `outcomes[1]` žadėjo „Stebiu rezultatus ir lyginu juos su lūkesčiu“, o simuliacija lūkesčio neturėjo nė vienoje būsenoje: `10` buvo tik jungiklis, po kurio tekstas paskelbdavo išvadą, kuri nepriklausė nuo to, ką vaikas iš tikrųjų surinko. Vaikas, laimėjęs 7 kartus iš 10, ekrane skaitė, kad visi variantai laimi po trečdalį, — ir neturėjo kuo to patikrinti. Vartai buvo žali: `validate_content.py --grade 1 --strict` 0/0, `check_language.py --grade 1` — 0 klaidų šiame modulyje pagal sakinio ilgį, `check_view.py` — 3/3 ploto 0 problemų, `check_audio.py` — „Garsas pilnas“.
│ +- **Priežastis:** sakinys buvo parašytas kaip teksto konstanta prie `total >= 10`, o ne kaip tos būsenos išvestis. Simuliacijos modelis skaičiavo tik įvykius (`score.win/lose/draw`) ir neturėjo jokio dydžio, kurį būtų galima parodyti kaip lūkestį; trečdalis gyveno modulio prozoje, ne kode. Tai LL-21 atmaina simuliacijos lygmenyje: dokumente skaičių niekas neperskaičiuoja, o modelyje — teiginį apie skaičius niekas neskaičiuoja. Antra priežastis: išvada buvo formuluojama kaip „ką vaikas turi suprasti“ (pedagoginis tikslas), todėl atrodė, kad ją parašyti ir yra darbas.
│ +- **Taisyklė:** kiekvienas kiekybinis teiginys ekrane imamas iš **tos pačios būsenos**, kuri tuo metu rodoma: jei sakoma „trečdalis“, tai trečdalis turi būti apskaičiuotas iš ėjimų skaičiaus (`played / 3`) ir parodytas tame pačiame lange. Kai `played % 3 !== 0`, sveiko trečdalio nėra — tada nerodomas joks trečdalis, o ne apvalinamas ar paskelbiamas. Sąlyga, po kurios tekstas keičiasi, neturi būti „pakankamai ėjimų“: tekstas keičiasi tada, kai pasikeičia duomuo. Jei modulio rezultatas žada palyginimą, modelis privalo turėti abi palyginimo puses (surinkta ir lūkestis).
│ +- **Patikra:** zondas (`probe219.py`, scratch) fiksuoja `#sim-readout`, `#sim-note` ir `#ap-third` po **kiekvieno** ėjimo nuo 1 iki 9: lūkesčio sakinys pasirodo tik ties 3, 6 ir 9 (`Po 3 ėjimų trečdalis — po 1.`, `Po 6 ėjimų trečdalis — po 2.`, `Po 9 ėjimų trečdalis — po 3.`), o ties 1, 2, 4, 5, 7, 8 rodomas tik ėjimų skaičius be trečdalio. Antras zondas fiksuoja seriją: trys vienodi rezultatai iš eilės duoda „Jau 3 tokie patys rezultatai iš eilės. Kitas ėjimas gali būti bet kuris.“, o ne devynis kartus tą patį sakinį. `simDone` lieka `false` iki devinto ėjimo ir tampa `true` tik po jo.
│ +
│ +## LL-80 — Skaičius sakinyje be savo formos („1 ėjimai“)
│ +
│ +- **Simptomas:** pirmoji `akmenelis-popierius` pataisos versija ėjimų eilučioje rašė `${played} ėjimai.` — pirmame ėjime ekrane pasirodė „1 ėjimai.“, o dvidešimt pirmame būtų „21 ėjimai.“. Tai vaikui rodomas sakinys 1 klasėje, t. y. tame amžiuje, kai skaičiaus ir daiktavardžio derinimas yra viena iš mokomų dalykų. Nė vienas vartas to nepagavo: `check_language.py` skaito modulių JSON (`content/**`), o simuliacijos kodas jam neegzistuoja; `validate_content.py` tikrina schemą; `check_view.py` — geometriją; `check_audio.py` — config tekstus.
│ +- **Priežastis:** skaičius į sakinį buvo įterptas šablonu, o forma parinkta viena — daugiskaita, nes „paprastai ėjimų būna daug“. Tai ta pati klasė kaip LL-33 (paaiškinimas įrašytas pagal pirmą pavyzdį), tik kita kryptimi: sakinys parašytas pagal **tipinį**, o ne pagal **galimą** atvejį. Kadangi skaičius ateina iš kintamojo, forma turi būti parenkama kode, o ne tekste.
│ +- **Taisyklė:** kai į vaikui rodomą sakinį įterpiamas skaičiuojamas skaičius, šalia jo rašoma formos funkcija, apimanti bent vienaskaitą ir daugiskaitą (`n % 10 === 1 && n % 100 !== 11 ? "ėjimas" : "ėjimai"`). Taisyklė galioja ir simuliacijų kodui, ir `config.sentences` šablonams. Jei formos parinkti neįmanoma (skaičius gali būti bet kuris, o žodis netaisyklingas), sakinys perrašomas taip, kad skaičius nebūtų derinamas su daiktavardžiu („Ėjimų: 9.“).
│ +- **Patikra:** zondas tikrina mažiausią ir didžiausią realų atvejį, ne vidutinį: po pirmo ėjimo `#ap-third` turi būti „1 ėjimas.“, po antro — „2 ėjimai.“, po devinto — „9 ėjimai. Jei visi trys lygūs — po 3.“ (`probe219b.py`: `third_after_1 = "1 ėjimas."`, `third_after_2 = "2 ėjimai."`).
│ agents/proposals/2026-11-10-simuliaciju-inzinierius-garso-literaliai.json
│ @@ -0,0 +1,18 @@
│ +{
│ +  "role": "simuliaciju-inzinierius",
│ +  "run_id": 219,
│ +  "created": "2026-11-10T10:20:00+02:00",
│ +  "type": "struktura",
│ +  "title": "Garso patikra nemato tiesioginių api.speak eilučių: du sakiniai tyliai iškrenta",
│ +  "body": "check_audio.py tekstus renka tik iš modulių sim.config, todėl simuliacijų kode įrašyti api.speak(\"...\") sakiniai lieka nematomi, o suvestinė vis tiek sako „Garsas pilnas: 543 tekstų, 1086 įrašų, naudojama 1086 iš 1086 mp3“. Du konkretūs atvejai: assets/js/sims/calba.js:229 api.speak(\"Sudėjai visus sakinius!\") ir assets/js/sims/matematika.js:81 api.speak(\"Visi taikiniais pasiekti!\") — abiejų nėra assets/audio/lt/manifest.json (grep 0). speech.js:134 tokiu atveju tyliai pereina prie naršyklės tts(), tad vaikas, kuriam garsas yra pagrindinis kanalas, išgirsta robotizuotą arba visai jokio balso, o patikra rodo žalią. Siūloma: check_audio.py papildyti literalių api.speak(\"...\") skaitymu (be kintamųjų) ir generuoti jiems įrašus per generate_audio.py collect(), o manifeste esančius nenaudojamus tekstus ir toliau tikrinti atvirkštine kryptimi (#7397).",
│ +  "target": "scripts/check_audio.py",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "assets/js/sims/calba.js:229",
│ +    "assets/js/sims/matematika.js:81",
│ +    "assets/js/speech.js:134",
│ +    "assets/audio/lt/manifest.json (0 atitikmenų abiem sakiniams)",
│ +    "python3 scripts/check_audio.py → „✔ Garsas pilnas: 543 tekstų, 1086 įrašų“"
│ +  ]
│ +}
│ agents/proposals/2026-11-10-simuliaciju-inzinierius-garso-literaliai.json
│ @@ -4,7 +4,7 @@
│    "created": "2026-11-10T10:20:00+02:00",
│    "type": "struktura",
│    "title": "Garso patikra nemato tiesioginių api.speak eilučių: du sakiniai tyliai iškrenta",
│ -  "body": "check_audio.py tekstus renka tik iš modulių sim.config, todėl simuliacijų kode įrašyti api.speak(\"...\") sakiniai lieka nematomi, o suvestinė vis tiek sako „Garsas pilnas: 543 tekstų, 1086 įrašų, naudojama 1086 iš 1086 mp3“. Du konkretūs atvejai: assets/js/sims/calba.js:229 api.speak(\"Sudėjai visus sakinius!\") ir assets/js/sims/matematika.js:81 api.speak(\"Visi taikiniais pasiekti!\") — abiejų nėra assets/audio/lt/manifest.json (grep 0). speech.js:134 tokiu atveju tyliai pereina prie naršyklės tts(), tad vaikas, kuriam garsas yra pagrindinis kanalas, išgirsta robotizuotą arba visai jokio balso, o patikra rodo žalią. Siūloma: check_audio.py papildyti literalių api.speak(\"...\") skaitymu (be kintamųjų) ir generuoti jiems įrašus per generate_audio.py collect(), o manifeste esančius nenaudojamus tekstus ir toliau tikrinti atvirkštine kryptimi (#7397).",
│ +  "body": "check_audio.py tekstus renka tik iš modulių sim.config, todėl simuliacijų kode įrašyti api.speak(\"...\") sakiniai lieka nematomi, o suvestinė vis tiek sako „Garsas pilnas: 543 tekstų, 1086 įrašų, naudojama 1086 iš 1086 mp3“. Du konkretūs atvejai: assets/js/sims/calba.js:229 api.speak(\"Sudėjai visus sakinius!\") ir assets/js/sims/matematika.js:81 api.speak(\"Visi taikiniai pasiekti!\") — abiejų nėra assets/audio/lt/manifest.json (grep 0). speech.js:134 tokiu atveju tyliai pereina prie naršyklės tts(), tad vaikas, kuriam garsas yra pagrindinis kanalas, išgirsta robotizuotą arba visai jokio balso, o patikra rodo žalią. Siūloma: check_audio.py papildyti literalių api.speak(\"...\") skaitymu (be kintamųjų) ir generuoti jiems įrašus per generate_audio.py collect(), o manifeste esančius nenaudojamus tekstus ir toliau tikrinti atvirkštine kryptimi (#7397).",
│    "target": "scripts/check_audio.py",
│    "priority": "normal",
│    "status": "new",
│ agents/proposals/2026-11-10-simuliaciju-inzinierius-visada-trecdalis.json
│ @@ -0,0 +1,16 @@
│ +{
│ +  "role": "simuliaciju-inzinierius",
│ +  "run_id": 219,
│ +  "created": "2026-11-10T10:22:00+02:00",
│ +  "type": "kritika",
│ +  "title": "13-akmenelis-popierius: „visada grįžta prie trečdalio“ prieštarauja to paties modulio žingsniui „bet ne tiksliai 10“",
│ +  "body": "Modulio concept.example sako „Po 30 ėjimų rezultatas visada grįžta prie maždaug trečdalio“, o concept.steps[2] tame pačiame faile — „laimėjimų skaičius bus arti 10 — bet ne tiksliai 10“. Du sakiniai moko priešingai: vienas teigia grįžimą kaip garantiją, kitas — tik artumą. 30 ėjimų imtyje laimėjimų skaičius paprastai svyruoja apie 10 su standartiniu nuokrypiu apie 2,6, tad 6 ar 14 laimėjimų yra visiškai įprastas rezultatas, o ne „negrįžimas“. Vaikas, kuris po 30 ėjimų suskaičiuos 15 laimėjimų, gaus įrodymą prieš modulio teiginį. Simuliacija šiame darbe šios problemos nebeturi (lūkesčio sakinys apskaičiuojamas iš ėjimų skaičiaus ir rodomas tik tada, kai trečdalis yra sveikas), bet modulio tekstas lieka. Siūloma „visada“ pakeisti „paprastai“ ir sutrumpinti sakinį iki 10 žodžių, kad abu modulio sakiniai mokytų tą patį.",
│ +  "target": "content/lt/grade-01/zaidimu-teorija/13-akmenelis-popierius.json",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "content/lt/grade-01/zaidimu-teorija/13-akmenelis-popierius.json concept.example",
│ +    "content/lt/grade-01/zaidimu-teorija/13-akmenelis-popierius.json concept.steps[2]",
│ +    "research/wiki/guidelines/pamokos.md LL-79 (tas pats defektas simuliacijos lygmenyje, jau pataisytas)"
│ +  ]
│ +}
│ agents/log/simuliaciju-inzinierius-2026-11-10.md
│ @@ -0,0 +1,114 @@
│ +# simuliaciju-inzinierius — 2026-11-10 (paleidimas #219)
│ +
│ +- **Vaidmuo:** simuliacijų inžinierius
│ +- **Data:** 2026-11-10, 11:14 EET
│ +- **Darbas:** vienas esminis vienos simuliacijos patobulinimas
│ +- **Simuliacija:** `akmenelis-popierius` (modulis `13-akmenelis-popierius`, 1 klasė, kryptis „Sąžiningumas ir žaidimai“)
│ +- **Failas:** `assets/js/sims/zaidimai.js` (+86 / −26)
│ +- **Tipo šaltinis:** (c) patobulinimas, kuris pašalina aiškų trūkumą — modulis žadėjo lūkesčio palyginimą, modelis jo neturėjo
│ +
│ +## KLAIDINGA NUOSTATA
│ +
│ +Simuliacija po dešimto ėjimo **paskelbdavo** išvadą „kiekvienas variantas laimi maždaug trečdalį kartų. Nėra „karštos rankos“ — tik atsitiktinumas“, nors ekrane nebuvo nei trečdalio skaičiaus, nei lūkesčio, nei palyginimo su tuo, ką vaikas surinko. Modulio rezultatas `outcomes[1]` žada „Stebiu rezultatus ir lyginu juos su lūkesčiu“ — modelis šito neįgyvendino nė vienoje būsenoje.
│ +
│ +Vaiko nuostata, kurią dabar modelis atremia *veiksmo metu*, o ne paskaita po dešimto ėjimo: „laimėjau tris kartus iš eilės, vadinasi, man sekasi / kitas ėjimas bus prastesnis“. Serijos sakinys pasirodo iš karto, kai serija prasideda (3 vienodi rezultatai), o ne tada, kai jau nebeaktualu.
│ +
│ +## KAS PAKEISTA
│ +
│ +1. **Lūkestis tapo apskaičiuojamu dydžiu.** `#ap-third` eilutė ima ėjimų skaičių ir, kai jis dalijasi iš 3, parodo trečdalį: `3 ėjimai. Jei visi trys lygūs — po 1.` Ties 1, 2, 4, 5, 7, 8 dalinio nėra, todėl trečdalis nerodomas (ne apvalinamas, ne išgalvojamas).
│ +2. **Paliginimo sakinys** (`#sim-note`) po 3, 6, 9 ėjimų: `Po 9 ėjimų trečdalis — po 3. Palygink su savo skaičiais.` — abi pusės yra tame pačiame lange, o palyginimą atlieka vaikas (P2: veiksmas prieš paaiškinimą).
│ +3. **Serijos pastebėjimas** vietoje paskelbtos išvados: `Jau 3 tokie patys rezultatai iš eilės. Kitas ėjimas gali būti bet kuris.` — teiginys apie modelį (kiekvienas ėjimas renkamas iš trijų), o ne apie vaiko sėkmę.
│ +4. **Mirusi būsena pašalinta:** `let last = "Paklausk draugo arba spausk savo ėjimą."` buvo priskirtas vieną kartą ir niekada nepakeistas — `api.note(last)` visada rašė tą patį nurodymą, net po septynių ėjimų. Dabar pradinė pastaba — dvikovos taisyklė („Akmenėlis nugali žirkles…“), kuri lieka atsargine eile.
│ +5. **Pradinė būsena turi tekstinį atitikmenį:** `api.readout("Laimėjimai 0, pralaimėjimai 0, lygiosios 0. Ėjimų 0.")` — anksčiau `#sim-readout` buvo tuščias iki pirmo paspaudimo.
│ +6. **Skaičiaus forma:** `ejimai(n)` parenka „1 ėjimas“ / „2 ėjimai“ / „21 ėjimas“ (pirmoji versija rašė „1 ėjimai“, žr. LL-80).
│ +7. **200 % teksto apsauga išlaikyta:** fiksuotos `7rem`/`3rem` kolonos pakeistos `flex` eilute su `flex-wrap` ir `min-width:0` (anksčiau sutvarkyta #4741, dabar ta pati struktūra taikoma ir naujai eilutei). Mygtukų dydis rištas `min(2rem,10vw)` / `min(4.4rem,22vw)`, `min-height:48px`.
│ +
│ +## PAMATUOTA (tikra zondo išvestis, `probe219.py`, Chromium 1248, 127.0.0.1:8987)
│ +
│ +Išdėstymas (5 ėjimai prieš matavimą, kad stulpeliai būtų užpildyti):
│ +
│ +| plotis / šaknis | docOverflow | #sim-stage scroll/client | taikiniai | mažiausias |
│ +|---|---|---|---|---|
│ +| 1440 / 16 px | 0 | 972 / 972 | 89×64 ×3, 139×64 | 89×64 |
│ +| 1440 / 32 px | 0 | 1249 / 1249 | 173×124 ×3, 274×124 | 173×124 |
│ +| 390 / 16 px | 0 | 328 / 328 | 89×64 ×3, 139×48 | 89×48 |
│ +| 390 / 32 px | 0 | 271 / 271 | 86×95 ×3, 204×88 | 86×88 |
│ +| 360 / 16 px | 0 | 298 / 298 | 89×64 ×3, 139×48 | 89×48 |
│ +| 360 / 32 px | 0 | 241 / 241 | 79×91 ×3, 202×88 | 79×88 |
│ +
│ +- `overflowing: []` visais šešiais atvejais (joks sim ar valdiklių palikuonis neišlindo už viewport ribų).
│ +- `smallTargets: []` — nė vienas taikinys mažesnis už 48 px; mažiausias 79×88 @360/32.
│ +- `errors: []` — 0 konsolės klaidų ir 0 `pageerror` visuose 10 zondo paleidimų.
│ +
│ +Būsenos (`probe219.py` A/B/C dalys):
│ +
│ +- Po 2 ėjimų: `2 ėjimai.`, pastaba — dvikovos taisyklė, `simDone false`.
│ +- Po 3 ėjimų: `3 ėjimai. Jei visi trys lygūs — po 1.`, pastaba `Jau 3 tokie patys rezultatai iš eilės…`, `simDone false`.
│ +- Po 9 ėjimų: `9 ėjimai. Jei visi trys lygūs — po 3.`, `simDone true`.
│ +- Mišri seka (1→9): trečdalio sakinys tik ties 3 (`po 1`), 6 (`po 2`) ir 9 (`po 3`); ties 1, 2, 4, 5, 7, 8 — `N ėjimai.` be trečdalio.
│ +- `Nuo nulio`: `Laimėjimai 0, pralaimėjimai 0, lygiosios 0. Ėjimų 0.`, `Iš viso 0 ėjimų.`, `simDone` lieka `true` (platformos pažanga per modulį, ne per bėgimą — LL-16).
│ +
│ +Klaviatūra (`probe219b.py`, 360 px, Tab nuo dokumento pradžios):
│ +
│ +```
│ +Pereiti prie turinio → Suprask! pradžia → 🔊Garsas → ℹ️Apie → Pradžia →
│ +1 klasė → Sąžiningumas ir žaidimai → Akmenėlis → Žirklės → Popierius → Nuo nulio
│ +```
│ +
│ +`Enter` ant „Popierius“ → `Laimėjimai 1, pralaimėjimai 0, lygiosios 0. Ėjimų 1.`, `1 ėjimas.`
│ +
│ +## VARTŲ IŠVESTIS (tikra)
│ +
│ +```
│ +python3 scripts/validate_content.py --grade 1 --strict   → Rezultatas: 0 klaidų, 0 įspėjimų; rc=0
│ +python3 scripts/check_ui.py                             → Rezultatas: 0 klaidų, 0 įspėjimų; rc=0
│ +.venv/bin/python scripts/check_view.py --module 13-akmenelis-popierius --viewports desktop,phone,small
│ +  Plotai: desktop 1440px, phone 390px, small 360px
│ +  Patikrinta: 3 (maršrutų: 1 · plotų: 3) · problemos: 0; rc=0
│ +.venv/bin/python scripts/check_view.py --viewports desktop,phone,small
│ +  Patikrinta: 111 (maršrutų: 37 · plotų: 3) · problemos: 0; rc=0
│ +python3 scripts/check_audio.py   → ✔ Garsas pilnas: 543 tekstų, 1086 įrašų, visi iš Piper, 1086/1086 mp3
│ +python3 scripts/check_art.py     → ✔ 7 simuliacijų failai naudoja art.js, legacy: 1
│ +python3 scripts/check_lessons.py → ✔ 80 įrašai, visi su 4 laukais
│ +python3 scripts/check_docs_facts.py → Dokumentų skaičiai: 0 klaidų, 0 įspėjimų
│ +python3 scripts/check_agents.py  → ✔ 15 vaidmenų, 1 įspėjimas (sistemos-architektas, buvo prieš)
│ +python3 scripts/check_language.py --grade 1 → 0 klaidų; 2 įspėjimai apie 13-akmenelis-popierius
│ +  (concept.title „Atsitiktinumas“ 14 raidžių, concept.example „atsitiktinumas“ 14 raidžių — buvo prieš,
│ +  turinio JSON neliestas; ilgo žodžio riba 13)
│ +node --check assets/js/sims/zaidimai.js → SYNTAX_OK
│ … omitted 36 diff line(s) across 1 additional file(s)/section(s)
│ agents/state.json
│ @@ -29,9 +29,9 @@
│        "cadence": "kasdien"
│      },
│      "simuliaciju-inzinierius": {
│ -      "last_run": "2026-11-09T11:21:14",
│ -      "status": "published",
│ -      "log": "agents/log/simuliaciju-inzinierius-2026-11-09T1110.md",
│ +      "last_run": "2026-11-10T11:14:31",
│ +      "status": "published",
│ +      "log": "agents/log/simuliaciju-inzinierius-2026-11-10.md",
│        "description": "Kuria ir tobulina interaktyvias simuliacijas, atidaro PR",
│        "cadence": "kasdien"
│      },
│ agents/state.json
│ @@ -176,18 +176,35 @@
│      "notes": "Klasės puslapio eilė vis dar pagal index.json, o kelias — pagal path.json; pasiulyta atskiru paleidimu. path.json neapima busimu technologijos moduliu. Pasalinti laikini zondo failai .probe-*.html (buvo publikuojami GitHub Pages)."
│    },
│    "last_sim_work": {
│ -    "date": "2026-11-07",
│ -    "run_id": 36,
│ -    "sim": "gyvunu-grupes",
│ -    "module": "10-gyvunu-grupes",
│ +    "date": "2026-11-10",
│ +    "run_id": 219,
│ +    "sim": "akmenelis-popierius",
│ +    "module": "13-akmenelis-popierius",
│ +    "target": "assets/js/sims/zaidimai.js",
│      "pr": "—",
│ -    "branch": "agent/kurejas-2026-11-07",
│ -    "commit": "3d50f38 (dalis; likutis darbineje kopijoje)",
│ +    "branch": "agent/kurejas-2026-11-10",
│ +    "commit": "— (palikta darbinėje kopijoje, publikuoja bėgiklis)",
│      "ci": "—",
│ -    "misconception": "„Teisingas vienas priskyrimas = simuliacija atlikta“ ir „modelis gali kas karta rodyti kita tvarka“",
│ -    "what_changed": "gyvunu-grupes: Math.random maisymas pakeistas fiksuota, samoningai permaisyta tvarka (gretimi gyvunai is skirtingu grupiu) — tas pats paleidimas atkuriamas, o sarasas niekada neisduoda atsakymo. api.progress perkeltas is kiekvieno teisingo priskyrimo i „visi gyvunai surikiuoti“: anksciau modulis skaitesi atliktas po 1 is 9. Kiekvienas priskyrimas paaiskinamas pozymiu („Karve priklauso zinduoliams ir maitina versiuka pienu“), kaip zadejo svietimas1[1]. Dėžiu aria-label su grupe, kiekiu ir pozymiu; emoji aria-hidden; aria-pressed pasirinkimui; fokusas: pasirinkus -> pirma deze, priskyrus -> pirmas likęs gyvunas, pabaigoje -> baigiamoji zinute. setTimeout valomi, grazinama valymo funkcija. Tinklelis auto-fit minmax(5.5rem,1fr): 320 px — du stulpeliai (buvo 3 px slinktis), 360/414 — trys.",
│ -    "verified": "validatorius 0/0 (ir --strict); check_ui 0/0; check_audio 336 teksto po du irasus; node importas OK; CDP 320/360/414 — docScroll == clientWidth, wide 0, small 0, 0 konsoles klaidu; du nepriklausomi ikelimo — ta pati tvarka; 1-as teisingas priskyrimas palieka simDone false, visi 9 -> true; klaidingas priskyrimas nepakeicia busenos; „Is naujo“ grazina ta pacia tvarka; klaviatura 8xTab -> Enter -> deze -> Enter (readout: Teisingai. Karve priklauso zinduoliams. Liko 8.)",
│ -    "notes": "Neliesta: 16-lygybe 46 px taikinys (#452, kita simuliacija). Nauji pasiulymai: api.progress semantika KURINIO-STANDARTE (calba.js:58 ta pati klaida), klaidinantis gyvunas grupavimo simuliacijoje (teacher.misconceptions netikrinamos). Begiklis dali pakeitimo itrauke i 3d50f38 kartu su kito vaidmens darbu."
│ +    "type": "vienos simuliacijos esminis patobulinimas (trūkstamas grįžtamasis ryšys + paskelbta, o ne apskaičiuota išvada)",
│ +    "misconception": "„Po kelių laimėjimų iš eilės man sekasi / kitas ėjimas bus prastesnis“ ir modelio lygmenyje — „lūkestį galima paskelbti, o ne apskaičiuoti“. Modulio outcomes[1] žada „Stebiu rezultatus ir lyginu juos su lūkesčiu“, o simuliacija lūkesčio neturėjo nė vienoje būsenoje: po 10 ėjimų ji rašydavo „kiekvienas variantas laimi maždaug trečdalį kartų“, nors ekrane nebuvo nei trečdalio, nei palyginimo.",
│ +    "what_changed": "1) #ap-third eilutė skaičiuoja lūkestį: „N ėjimai. Jei visi trys lygūs — po N/3.“ rodoma tik kai N dalijasi iš 3, kitu atveju tik „N ėjimai.“ 2) Palyginimo sakinys (#sim-note) po 3, 6, 9 ėjimų: „Po N ėjimų trečdalis — po N/3. Palygink su savo skaičiais.“ 3) Serijos sakinys vietoje paskelbtos išvados: „Jau N tokie patys rezultatai iš eilės. Kitas ėjimas gali būti bet kuris.“ — rodomas serijai prasidėjus (n ≥ 3), ne po dešimto ėjimo. 4) Pašalintas miręs kintamasis `last` (buvo priskirtas kartą ir niekada nepakeistas; api.note visada rašė tą patį nurodymą). 5) Pradinė būsena turi tekstinį atitikmenį: api.readout „Laimėjimai 0, pralaimėjimai 0, lygiosios 0. Ėjimų 0.“ 6) ejimai(n) parenka „1 ėjimas“ / „2 ėjimai“ (pirmoji versija rašė „1 ėjimai“). 7) Stulpelių eilutė — flex su flex-wrap ir min-width:0 (200 % tekstas), mygtukai min(2rem,10vw) / min(4.4rem,22vw) / min-height:48px. api.progress — po 9 ėjimų (trečdalis sveikas), toliau žaisti galima.",
│ +    "model_numbers": "Trečdalis imamas iš ėjimų: 3 → po 1, 6 → po 2, 9 → po 3. Zondas fiksuoja lūkesčio sakinį tik ties 3/6/9, o ties 1, 2, 4, 5, 7, 8 — tik ėjimų skaičių. Serija: 3 vienodi rezultatai → „Jau 3 tokie patys rezultatai iš eilės…“.",
│ +    "probe": "Playwright Chromium 1248, http://127.0.0.1:8987 (probe219.py, probe219b.py): 1440/390/360 × 16/32 px — docOverflow 0, #sim-stage scrollWidth == clientWidth (972/972, 1249/1249, 328/328, 271/271, 298/298, 241/241), overflowing [], smallTargets [], 0 konsolės klaidų; taikiniai 89×64 @360/16, 79×91 @360/32, 86×88 @390/32; klaviatūra Tab → Akmenėlis → Žirklės → Popierius → Nuo nulio, Enter vykdo ėjimą; simDone false iki 9 ėjimų, true po; „Nuo nulio“ grąžina skaitiklius, simDone lieka true.",
│ +    "verified": ".venv/bin/python scripts/check_view.py --module 13-akmenelis-popierius --viewports desktop,phone,small → 3 patikros, 0 problemų, rc 0; check_view.py visa klasė → 111 patikrų (37×3), 0 problemų; validate_content.py --grade 1 --strict → 0 klaidų, 0 įspėjimų; check_ui.py → 0/0; check_audio.py → 543 tekstų, 1086 įrašų, Piper; check_art.py → 7 failai art.js, legacy 1; check_lessons.py → 80 įrašų; check_docs_facts.py → 0/0; check_agents.py → 15 vaidmenų, 1 įspėjimas (sistemos-architektas, buvo prieš); check_language.py --grade 1 → 0 klaidų (2 įspėjimai apie 13-akmenelis popierius — ilgi žodžiai, buvo prieš, turinio JSON neliestas); node --check → SYNTAX_OK.",
│ +    "svietimas1": "1 žingsnis — viena sąvoka (atsitiktinumas be „serijos taisyklės“), lūkestis kaip trečdalis, ne formulė; 2 žingsnis — trečdalis gaunamas iš bet kurio vaiko ėjimų, palyginimas nepriklauso nuo sėkmės; 3 žingsnis — serijos pastebėjimas ateina serijai prasidėjus, jokio laikmačio, jokio ėjimų limito, po devinto ėjimo žaisti galima; T5.5 — taikiniai ≥48 px, aria-label, informacija ne vien spalva (skaičiai prie stulpelių, #sim-readout), 200 % tekste 0 px slinkties.",
│ +    "new_lesson": "LL-79 — Išvada, kuri paskelbta, o ne apskaičiuota; LL-80 — Skaičius sakinyje be savo formos („1 ėjimai“)",
│ +    "proposal_out": "agents/proposals/2026-11-10-simuliaciju-inzinierius-garso-literaliai.json (check_audio.py nemato api.speak literalų — calba.js:229, matematika.js:81); agents/proposals/2026-11-10-simuliaciju-inzinierius-visada-trecdalis.json (modulio concept.example „visada“ vs steps[2] „ne tiksliai“)",
│ +    "log": "agents/log/simuliaciju-inzinierius-2026-11-10.md",
│ +    "remaining": "Simuliacija be garso (api.speak nenaudojamas, sim.config {}), visi sakiniai tekstiniai; 200 % @360 px puslapio slinktis ne sim ribose (#4748, .task-q); check_view.py nematuoja padidinto teksto; check_audio.py aklumas api.speak literalams — pasiūlymas pateiktas. Neliesti: app.js, registry.js, art.js, main.css, kiti sim failai, modulio JSON, 2–12 klasės, docs/, AGENTS.md.",
│ +    "touched": "assets/js/sims/zaidimai.js; research/wiki/guidelines/pamokos.md (LL-79, LL-80); agents/proposals/2026-11-10-simuliaciju-inzinierius-garso-literaliai.json; agents/proposals/2026-11-10-simuliaciju-inzinierius-visada-trecdalis.json; agents/log/simuliaciju-inzinierius-2026-11-10.md; agents/state.json",
│ +    "previous": {
│ +      "date": "2026-11-07",
│ +      "run_id": 36,
│ +      "sim": "gyvunu-grupes",
│ +      "module": "10-gyvunu-grupes",
│ +      "commit": "3d50f38 (dalis; likutis darbineje kopijoje)",
│ +      "notes": "Fiksuota, sąmoningai permaisyta tvarka vietoj Math.random; api.progress perkeltas į „visi gyvūnai surikiuoti“; tinklelis auto-fit minmax(min(100%,5.5rem),1fr)."
│ +    }
│    },
│    "last_validation": {
│      "date": "2026-11-09",
Baigta — darbas atliktas ir paliktas darbinėje kopijoje (commit/publikavimas — bėgiklio).

**Padaryta: viena simuliacija — `akmenelis-popierius` (`assets/js/sims/zaidimai.js`, +86/−26)**

Klaidinga nuostata: simuliacija po 10 ėjimo **paskelbdavo** „kiekvienas variantas laimi maždaug trečdalį kartų… nėra karštos rankos“, nors ekrane nebuvo nei trečdalio, nei lūkesčio, nei palyginimo. Modulio rezultatas `outcomes[1]` žada „Stebiu rezultatus ir lyginu juos su lūkesčiu“ — modelis to neįgyvendino nė vienoje būsenoje.

Pakeitimai: lūkestis apskaičiuojamas iš ėjimų (`N ėjimai. Jei visi trys lygūs — po N/3.`, tik kai dalijasi iš 3), palyginimo sakinys po 3/6/9 ėjimų, serijos pastebėjimas rodomas serijai prasidėjus (ne po dešimto ėjimo), pašalintas miręs kintamasis `last`, pradinė būsena gauna tekstinį atitikmenį, skaičiaus forma (`1 ėjimas` / `2 ėjimai`), 200 % teksto išdėstymas per `flex-wrap` + `min-width:0`.

**Tikra patikra**
- `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų; `check_ui.py` → 0/0
- `check_view.py --module 13-akmenelis-popierius` → 3 patikros, 0 problemų; visa klasė → 111 (37×3), 0 problemų
- `check_audio.py` 543 tekstai/1086 įrašai; `check_art.py` 7+legacy; `check_lessons.py` 80; `check_docs_facts.py` 0/0
- Playwright zondas 1440/390/360 × 16/32 px: docOverflow 0, `#sim-stage` scrollWidth == clientWidth (972/972, 1249/1249, 328/328, 271/271, 298/298, **241/241**), `smallTargets []`, 0 konsolės klaidų; taikiniai ≥79×88; Tab → Akmenėlis → Žirklės → Popierius → Nuo nulio; `simDone` false iki 9 ėjimų, true po.

**Užrašyta**
- `research/wiki/guidelines/pamokos.md`: LL-79 (išvada paskelbta, o ne apskaičiuota), LL-80 (skaičius be savo formos „1 ėjimai“)
- `agents/log/simuliaciju-inzinierius-2026-11-10.md` (ataskaita su tikra išvestimi)
- `agents/state.json`: vaidmens `last_run`/`log` ir naujas `last_sim_work` (run 219, su `previous` run 36)
- 2 pasiūlymai: `check_audio.py` nemato `api.speak` literalų (`calba.js:229`, `matematika.js:81` neturi mp3, o suvestinė sako „Garsas pilnas“); modulio `concept.example` „visada“ vs `concept.steps[2]` „ne tiksliai 10“

Neliesti: app.js, registry.js, art.js, main.css, kiti sim failai, modulio JSON, 2–12 klasės, docs/, AGENTS.md.

## klaidos

```
session_id: local-725986870fca64fcf0e25bf40c0408f503ba7ccd93359b6b05990f1e9732cfd1
```
