# simuliaciju-inzinierius — 2026-11-12T1102

- paleidimas: #246 (manual)
- trukmė: 810s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/sims246.py
│ @@ -0,0 +1,6 @@
│ +import json, glob
│ +for f in sorted(glob.glob('content/lt/grade-01/*/*.json')):
│ +    if f.endswith('index.json') or f.endswith('path.json'):
│ +        continue
│ +    d = json.load(open(f))
│ +    print(f.split('/')[-2], d.get('id'), '->', (d.get('sim') or {}).get('component'))
│ profiles/deepseek41flash/cache/scratch/probe246_elektra.py
│ @@ -0,0 +1,86 @@
│ +import asyncio, json, subprocess, sys, time, socket
│ +
│ +PORT = 8996
│ +
│ +def serve():
│ +    p = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT)],
│ +                         cwd="/home/zoltanas/workspace/suprask",
│ +                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
│ +    for _ in range(50):
│ +        s = socket.socket()
│ +        s.settimeout(0.2)
│ +        try:
│ +            s.connect(("127.0.0.1", PORT)); s.close(); return p
│ +        except OSError:
│ +            time.sleep(0.1)
│ +        finally:
│ +            s.close()
│ +    return p
│ +
│ +JS = r"""
│ +async () => {
│ +  const { getSim } = await import('./assets/js/registry.js');
│ +  const idx = await (await fetch('./content/lt/grade-01/index.json')).json();
│ +  const mod = await (await fetch('./content/lt/grade-01/technologijos/01-elektros-grandine.json')).json();
│ +  const stage = document.getElementById('probe-stage');
│ +  const controls = document.getElementById('probe-controls');
│ +  const out = {};
│ +  const api = {
│ +    speak: () => {}, progress: () => {},
│ +    readout: (t) => { out.readout = t; },
│ +    note: (t) => { out.note = t; },
│ +    ask: () => ({ input: null, remove() {} }),
│ +  };
│ +  getSim('elektros-grandine').mount({ stage, controls, api, config: (mod.sim && mod.sim.config) || {} });
│ +  const r = (el) => { const b = el.getBoundingClientRect(); return {l: +b.left.toFixed(1), r: +b.right.toFixed(1), t: +b.top.toFixed(1), b: +b.bottom.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1)}; };
│ +  const bat = stage.querySelector('.cc-battery'), lamp = stage.querySelector('#cc-lamp');
│ +  const snap = () => {
│ +    const bt = r(bat), lp = r(lamp);
│ +    const bars = [...stage.querySelectorAll('.cc-bar')].map((b) => {
│ +      const bb = r(b);
│ +      return { cls: b.className, ...bb,
│ +        overlapBat: +(bt.r - bb.l > 0 ? bt.r - bb.l : 0).toFixed(1),
│ +        overlapLamp: +(bb.r - lp.l > 0 ? bb.r - lp.l : 0).toFixed(1),
│ +        solid: getComputedStyle(b).backgroundImage === 'none' };
│ +    });
│ +    return { readout: out.readout, note: out.note, battery: bt, lamp: lp,
│ +             lampOn: lamp.classList.contains('is-on'), bars,
│ +             board: r(stage.querySelector('.cc-board')),
│ +             docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
│ +  };
│ +  const res = { start: snap() };
│ +  stage.querySelector('#cc-top').click();  res.topOnly = snap();
│ +  stage.querySelector('#cc-bottom').click(); res.both = snap();
│ +  stage.querySelector('#cc-top').click(); res.bottomOnly = snap();
│ +  stage.querySelector('#cc-top').click(); res.both2 = snap();
│ +  stage.querySelector('#cc-switch').click(); res.bothOpen = snap();
│ +  return res;
│ +}
│ +"""
│ +
│ +async def main():
│ +    from playwright.async_api import async_playwright
│ +    srv = serve()
│ +    try:
│ +        async with async_playwright() as p:
│ +            b = await p.chromium.launch()
│ +            for w, fs in [(1440, 16), (360, 16), (360, 32)]:
│ +                pg = await b.new_page(viewport={"width": w, "height": 900})
│ +                errs = []
│ +                pg.on("pageerror", lambda e: errs.append(str(e)))
│ +                pg.on("console", lambda m: errs.append("console:" + m.text) if m.type == "error" else None)
│ +                await pg.goto(f"http://127.0.0.1:{PORT}/index.html")
│ +                await pg.add_style_tag(content=f"html{{font-size:{fs}px}}")
│ +                await pg.evaluate("""() => {
│ +                    const s = document.createElement('div'); s.id='probe-stage'; s.style.width='100%'; document.body.appendChild(s);
│ +                    const c = document.createElement('div'); c.id='probe-controls'; document.body.appendChild(c);
│ +                }""")
│ +                res = await pg.evaluate(JS)
│ … omitted 8 diff line(s) across 1 additional file(s)/section(s)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe246_elektra.py
│ @@ -63,7 +63,7 @@
│      srv = serve()
│      try:
│          async with async_playwright() as p:
│ -            b = await p.chromium.launch()
│ +            b = await p.chromium.launch(executable_path="/home/zoltanas/.local/bin/google-chrome", args=["--no-sandbox"])
│              for w, fs in [(1440, 16), (360, 16), (360, 32)]:
│                  pg = await b.new_page(viewport={"width": w, "height": 900})
│                  errs = []
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe246_elektra.py
│ @@ -48,12 +48,13 @@
│               board: r(stage.querySelector('.cc-board')),
│               docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
│    };
│ +  const wait = () => new Promise((r) => setTimeout(r, 320));
│    const res = { start: snap() };
│ -  stage.querySelector('#cc-top').click();  res.topOnly = snap();
│ -  stage.querySelector('#cc-bottom').click(); res.both = snap();
│ -  stage.querySelector('#cc-top').click(); res.bottomOnly = snap();
│ -  stage.querySelector('#cc-top').click(); res.both2 = snap();
│ -  stage.querySelector('#cc-switch').click(); res.bothOpen = snap();
│ +  stage.querySelector('#cc-top').click();   await wait(); res.topOnly = snap();
│ +  stage.querySelector('#cc-bottom').click();await wait(); res.both = snap();
│ +  stage.querySelector('#cc-top').click();   await wait(); res.bottomOnly = snap();
│ +  stage.querySelector('#cc-top').click();   await wait(); res.both2 = snap();
│ +  stage.querySelector('#cc-switch').click();await wait(); res.bothOpen = snap();
│    return res;
│  }
│  """
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe246_elektra.py
│ @@ -77,8 +77,12 @@
│                      const c = document.createElement('div'); c.id='probe-controls'; document.body.appendChild(c);
│                  }""")
│                  res = await pg.evaluate(JS)
│ -                print(f"=== {w}px / {fs}px root; errors={errs}")
│ -                print(json.dumps(res, ensure_ascii=False, indent=1))
│ +                print(f"=== {w}px / {fs}px root; errors={errs}; overflow={res['start']['docOverflow']}")
│ +                for k, v in res.items():
│ +                    print(f" {k:10s} lamp={v['lampOn']}  bat[{v['battery']['l']}-{v['battery']['r']}] lamp[{v['lamp']['l']}-{v['lamp']['r']}]")
│ +                    for b in v["bars"]:
│ +                        print(f"            bar {b['cls']:22s} [{b['l']}-{b['r']}] solid={b['solid']}")
│ +                    print(f"            readout: {v['readout']}")
│                  await pg.close()
│              await b.close()
│      finally:
│ assets/js/sims/technologijos.js
│ @@ -73,26 +73,53 @@
│  .cc-switch:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
│  #cc-top { top: 35px; }
│  #cc-bottom { top: 131px; }
│ +/*
│ + * Gnybtai. Keturi kontaktai ten, kur laidas susitinka su baterija ir lempute:
│ + * viršuje prie baterijos pliuso, apačioje prie minuso, ir abu lemputės šone.
│ + * Prijungtas gnybtas užpildytas, neprijungtas — tuščias žiedas. Todėl vaikas
│ + * mato NE TIK kad laido nėra, bet ir KURIOJE VIETOJE kelias atviras, o
│ + * informaciją neša ir forma, ir tekstas, ne vien spalva.
│ + */
│ +.cc-term {
│ +  position: absolute;
│ +  width: 14px;
│ +  height: 14px;
│ +  box-sizing: border-box;
│ +  border: 2px solid var(--ink);
│ +  border-radius: 50%;
│ +  background: var(--paper);
│ +  pointer-events: none;
│ +  transition: background-color .18s ease;
│ +}
│ +.cc-term.is-on { background: var(--ink); }
│ +.cc-term.t-bat { left: 69px; }
│ +.cc-term.t-lamp { right: 69px; }
│ +.cc-term.t-top { top: 52px; }
│ +.cc-term.t-bot { top: 148px; }
│  .cc-bar {
│    position: absolute;
│    top: 50%;
│    transform: translateY(-50%);
│ -  left: 0;
│ -  right: 0;
│    height: 9px;
│    border-radius: 5px;
│    background: var(--ink);
│    transition: left .18s ease, right .18s ease;
│  }
│ +/*
│ + * Prijungtas laidas baigiasi ties gnybtu (18 px nuo laido dėžės krašto).
│ + * Neprijungtas atsitraukia iki 34 px, todėl tarpas tarp gnybto ir laido yra
│ + * 15 px — matoma pertrauka, o ne 10 px „beveik liečia“ (kritiko radinys #41:
│ + * laidas liečia lemputę, o tekstas sako „neateina“).
│ + */
│ +.cc-whole { left: 18px; right: 18px; }
│ +.cc-half-l { left: 18px; right: calc(50% + 28px); }
│ +.cc-half-r { left: calc(50% + 28px); right: 18px; }
│ +.cc-wire.is-off .cc-whole { left: 34px; right: 34px; }
│ +.cc-wire.is-off .cc-half-l { left: 34px; }
│ +.cc-wire.is-off .cc-half-r { right: 34px; }
│  .cc-wire.is-off .cc-bar {
│ -  left: 22px;
│ -  right: 22px;
│    background: repeating-linear-gradient(90deg, var(--ink-faint) 0 9px, transparent 9px 15px);
│  }
│ -.cc-half-l { right: calc(50% + 28px); }
│ -.cc-half-r { left: calc(50% + 28px); }
│ -.cc-wire.is-off .cc-half-l { left: 22px; }
│ -.cc-wire.is-off .cc-half-r { right: 22px; }
│  .cc-switch {
│    position: absolute;
│    left: 50%;
│ @@ -130,6 +157,12 @@
│    transition: transform .18s ease;
│  }
│  .cc-switch.is-open .cc-lever { transform: translateY(-50%) rotate(-34deg); }
│ +/* Jungiklis yra apatiniame laide. Kai tas laidas neprijungtas, svirtis
│ +   braižoma ta pačia brūkšniuota linija kaip trūkstamas laidas — kitaip
│ +   valdiklis atrodo esąs kelyje, kurio nėra. */
│ +.cc-switch.is-off .cc-lever {
│ +  background: repeating-linear-gradient(90deg, var(--ink-faint) 0 6px, transparent 6px 11px);
│ +}
│  .cc-switch-name {
│    position: absolute;
│    left: 50%;
│ @@ -141,7 +174,7 @@
│    white-space: nowrap;
│  }
│  @media (prefers-reduced-motion: reduce) {
│ … omitted 5 diff line(s) across 1 additional file(s)/section(s)
│ assets/js/sims/technologijos.js
│ @@ -181,8 +181,11 @@
│  const DEFAULT_SAY = {
│    pradzia: "Pradedam. Prijunk laidus ir pažiūrėk, ar lemputė šviečia.",
│    "nera-laido": "Nė vieno laido. Kelias visai nutrūkęs.",
│ -  "vienas-virsutinis": "Vienas laidas. Nuo baterijos iki lemputės kelias yra, o atgal nėra.",
│ -  "vienas-apatinis": "Vienas laidas. Atgal į bateriją veda, bet iki lemputės neateina.",
│ +  // Sakinys turi atitikti paveikslą (LL-13): su vienu laidu jis TIKRAI liečia
│ +  // ir bateriją, ir lemputę, todėl „iki lemputės neateina“ buvo netiesa.
│ +  // Tiesą pasako tai, ko trūksta: kito laido nėra, todėl kelias neužsidaro.
│ +  "vienas-virsutinis": "Viršutinis laidas yra. Apatinio nėra, todėl kelias neužsidaro.",
│ +  "vienas-apatinis": "Apatinis laidas yra. Viršutinio nėra, todėl kelias neužsidaro.",
│    jungiklis: "Abu laidai prijungti. Jungiklis atidarytas, todėl kelias nutrūkęs.",
│    sviecia: "Kelias vientisas. Lemputė šviečia.",
│    "is-naujo": "Pradedam iš naujo. Prijunk laidus.",
│ @@ -190,8 +193,8 @@
│
│  const NOTES = {
│    "nera-laido": "Bakstelėk laidą — jis prisijungs prie baterijos ir lemputės.",
│ -  "vienas-virsutinis": "Kelias turi sugrįžti į bateriją. Prijunk ir antrą laidą.",
│ -  "vienas-apatinis": "Kelias prasideda ne nuo baterijos. Prijunk ir viršutinį laidą.",
│ +  "vienas-virsutinis": "Kelias turi sugrįžti. Prijunk apatinį laidą.",
│ +  "vienas-apatinis": "Kelias turi sugrįžti. Prijunk viršutinį laidą.",
│    jungiklis: "Jungiklis yra tame pačiame kelyje. Uždaryk jį ir lemputė vėl švies.",
│    sviecia: "Dabar atidaryk jungiklį ir pažiūrėk, kas nutiks keliui.",
│  };
│ assets/js/sims/technologijos.js
│ @@ -215,7 +215,7 @@
│      const line = (key) => say[key] || DEFAULT_SAY[key] || "";
│
│      stage.innerHTML = `
│ -      <div class="cc-board">
│ +      <div class="cc-board" id="cc-board" role="group" aria-label="Baterija ir lemputė, sujungtos dviem laidais">
│          <div class="cc-part cc-battery" role="img" aria-label="Baterija su pliuso ir minuso galais">
│            <span class="cc-sign" aria-hidden="true">+</span>
│            <span class="cc-name">Baterija</span>
│ @@ -225,8 +225,12 @@
│            <span class="cc-bulb" aria-hidden="true"></span>
│            <span class="cc-name">Lemputė</span>
│          </div>
│ +        <span class="cc-term t-bat t-top" id="cc-t-bat-top" aria-hidden="true"></span>
│ +        <span class="cc-term t-bat t-bot" id="cc-t-bat-bot" aria-hidden="true"></span>
│ +        <span class="cc-term t-lamp t-top" id="cc-t-lamp-top" aria-hidden="true"></span>
│ +        <span class="cc-term t-lamp t-bot" id="cc-t-lamp-bot" aria-hidden="true"></span>
│          <button type="button" class="cc-wire is-off" id="cc-top" aria-pressed="false">
│ -          <span class="cc-bar" aria-hidden="true"></span>
│ +          <span class="cc-bar cc-whole" aria-hidden="true"></span>
│          </button>
│          <button type="button" class="cc-wire is-off" id="cc-bottom" aria-pressed="false">
│            <span class="cc-bar cc-half-l" aria-hidden="true"></span>
│ assets/js/sims/technologijos.js
│ @@ -249,6 +249,13 @@
│      const bottomBtn = stage.querySelector("#cc-bottom");
│      const switchBtn = stage.querySelector("#cc-switch");
│      const lamp = stage.querySelector("#cc-lamp");
│ +    const board = stage.querySelector("#cc-board");
│ +    const terms = {
│ +      topBat: stage.querySelector("#cc-t-bat-top"),
│ +      topLamp: stage.querySelector("#cc-t-lamp-top"),
│ +      botBat: stage.querySelector("#cc-t-bat-bot"),
│ +      botLamp: stage.querySelector("#cc-t-lamp-bot"),
│ +    };
│
│      // Būsena: du laidai (prijungtas / nuimtas) ir jungiklis (uždarytas / atidarytas).
│      let top = false;
│ assets/js/sims/technologijos.js
│ @@ -285,18 +285,35 @@
│        topBtn.classList.toggle("is-off", !top);
│        bottomBtn.classList.toggle("is-off", !bottom);
│        switchBtn.classList.toggle("is-open", !closed);
│ +      // Jungiklis guli apatiniame laide: kai laido nėra, jo svirtis irgi
│ +      // braižoma kaip trūkstama, kad valdiklis nekviestų spausti kelio,
│ +      // kurio nėra (LL-04, LL-13).
│ +      switchBtn.classList.toggle("is-off", !bottom);
│        lamp.classList.toggle("is-on", lit);
│ +
│ +      terms.topBat.classList.toggle("is-on", top);
│ +      terms.topLamp.classList.toggle("is-on", top);
│ +      terms.botBat.classList.toggle("is-on", bottom);
│ +      terms.botLamp.classList.toggle("is-on", bottom);
│
│        label(topBtn, "Viršutinis laidas", top, "Prijungtas", "Neprijungtas");
│        label(bottomBtn, "Apatinis laidas", bottom, "Prijungtas", "Neprijungtas");
│        switchBtn.setAttribute("aria-pressed", String(closed));
│        switchBtn.setAttribute(
│          "aria-label",
│ -        closed
│ -          ? "Jungiklis. Uždarytas: kelias vientisas. Bakstelėk, kad atidarytum."
│ -          : "Jungiklis. Atidarytas: kelias nutrūkęs. Bakstelėk, kad uždarytum.",
│ +        !bottom
│ +          ? "Jungiklis. Apatinis laidas neprijungtas, todėl jungiklis kelyje nedalyvauja."
│ +          : closed
│ +            ? "Jungiklis. Uždarytas: kelias vientisas. Bakstelėk, kad atidarytum."
│ +            : "Jungiklis. Atidarytas: kelias nutrūkęs. Bakstelėk, kad uždarytum.",
│        );
│        lamp.setAttribute("aria-label", lit ? "Lemputė šviečia" : "Lemputė nešviečia");
│ +      board.setAttribute(
│ +        "aria-label",
│ +        `Baterija kairėje, lemputė dešinėje. Viršutinis laidas ${top ? "prijungtas" : "neprijungtas"}. `
│ +          + `Apatinis laidas ${bottom ? "prijungtas" : "neprijungtas"}. `
│ +          + `Jungiklis ${closed ? "uždarytas" : "atidarytas"}. Lemputė ${lit ? "šviečia" : "nešviečia"}.`,
│ +      );
│
│        api.readout(line(key));
│        api.note(NOTES[key] || "");
│ content/lt/grade-01/technologijos/01-elektros-grandine.json
│ @@ -27,8 +27,8 @@
│        "sentences": {
│          "pradzia": "Pradedam. Prijunk laidus ir pažiūrėk, ar lemputė šviečia.",
│          "nera-laido": "Nė vieno laido. Kelias visai nutrūkęs.",
│ -        "vienas-virsutinis": "Vienas laidas. Nuo baterijos iki lemputės kelias yra, o atgal nėra.",
│ -        "vienas-apatinis": "Vienas laidas. Atgal į bateriją veda, bet iki lemputės neateina.",
│ +        "vienas-virsutinis": "Viršutinis laidas yra. Apatinio nėra, todėl kelias neužsidaro.",
│ +        "vienas-apatinis": "Apatinis laidas yra. Viršutinio nėra, todėl kelias neužsidaro.",
│          "jungiklis": "Abu laidai prijungti. Jungiklis atidarytas, todėl kelias nutrūkęs.",
│          "sviecia": "Kelias vientisas. Lemputė šviečia.",
│          "is-naujo": "Pradedam iš naujo. Prijunk laidus."
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe246_elektra.py
│ @@ -80,8 +80,10 @@
│                  print(f"=== {w}px / {fs}px root; errors={errs}; overflow={res['start']['docOverflow']}")
│                  for k, v in res.items():
│                      print(f" {k:10s} lamp={v['lampOn']}  bat[{v['battery']['l']}-{v['battery']['r']}] lamp[{v['lamp']['l']}-{v['lamp']['r']}]")
│ -                    for b in v["bars"]:
│ -                        print(f"            bar {b['cls']:22s} [{b['l']}-{b['r']}] solid={b['solid']}")
│ +                    for bar in v["bars"]:
│ +                        print(f"            bar {bar['cls']:22s} [{bar['l']}-{bar['r']}] solid={bar['solid']}")
│ +                    for t in v.get("terms", []):
│ +                        print(f"            term {t['cls']:24s} [{t['l']}-{t['r']}] y[{t['t']}-{t['b']}] on={t['on']}")
│                      print(f"            readout: {v['readout']}")
│                  await pg.close()
│              await b.close()
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe246_elektra.py
│ @@ -45,6 +45,14 @@
│      });
│      return { readout: out.readout, note: out.note, battery: bt, lamp: lp,
│               lampOn: lamp.classList.contains('is-on'), bars,
│ +             terms: [...stage.querySelectorAll('.cc-term')].map((t) => {
│ +               const bb = r(t);
│ +               return { cls: t.className.replace('cc-term ', ''), l: bb.l, r: bb.r, t: bb.t, b: bb.b,
│ +                        on: t.classList.contains('is-on'),
│ +                        bg: getComputedStyle(t).backgroundColor };
│ +             }),
│ +             switchAria: stage.querySelector('#cc-switch').getAttribute('aria-label'),
│ +             boardAria: stage.querySelector('#cc-board').getAttribute('aria-label'),
│               board: r(stage.querySelector('.cc-board')),
│               docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
│    };
│ profiles/deepseek41flash/cache/scratch/probe246b.py
│ @@ -0,0 +1,124 @@
│ +import asyncio, json, subprocess, sys, time, socket
│ +
│ +PORT = 8997
│ +
│ +def serve():
│ +    p = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT)],
│ +                         cwd="/home/zoltanas/workspace/suprask",
│ +                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
│ +    for _ in range(50):
│ +        s = socket.socket(); s.settimeout(0.2)
│ +        try:
│ +            s.connect(("127.0.0.1", PORT)); s.close(); return p
│ +        except OSError:
│ +            time.sleep(0.1)
│ +        finally:
│ +            s.close()
│ +    return p
│ +
│ +MEASURE = r"""
│ +() => {
│ +  const de = document.documentElement;
│ +  const stage = document.querySelector('#sim-stage');
│ +  const bar = (el) => { const r = el.getBoundingClientRect(); return { l: +r.left.toFixed(1), r: +r.right.toFixed(1), t: +r.top.toFixed(1), b: +r.bottom.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
│ +  const over = [];
│ +  if (stage) {
│ +    for (const el of stage.querySelectorAll('*')) {
│ +      if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== 'visible') {
│ +        over.push({ tag: el.tagName, cls: el.className, sw: el.scrollWidth, cw: el.clientWidth });
│ +      }
│ +    }
│ +  }
│ +  const small = [...document.querySelectorAll('#sim-stage button, #sim-controls button')]
│ +    .map((b) => ({ b, r: b.getBoundingClientRect() }))
│ +    .filter(({ r }) => r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 24))
│ +    .map(({ b, r }) => ({ id: b.id, h: Math.round(r.height), w: Math.round(r.width) }));
│ +  const outside = [];
│ +  if (stage) {
│ +    const sb = stage.getBoundingClientRect();
│ +    for (const el of stage.querySelectorAll('*')) {
│ +      const r = el.getBoundingClientRect();
│ +      if (r.width === 0 || r.height === 0) continue;
│ +      if (r.right > sb.right + 1 || r.left < sb.left - 1) outside.push({ cls: el.className, l: Math.round(r.left), r: Math.round(r.right) });
│ +    }
│ +  }
│ +  return {
│ +    docOverflow: de.scrollWidth - de.clientWidth,
│ +    docScrollWidth: de.scrollWidth,
│ +    simStage: stage ? { ...bar(stage), sw: stage.scrollWidth, cw: stage.clientWidth } : null,
│ +    over, small, outside,
│ +    board: stage ? bar(stage.querySelector('.cc-board')) : null,
│ +  };
│ +}
│ +"""
│ +
│ +STATE = r"""
│ +() => {
│ +  const g = (s) => document.querySelector(s);
│ +  const bar = (el) => { const r = el.getBoundingClientRect(); return { l: +r.left.toFixed(1), r: +r.right.toFixed(1) }; };
│ +  const out = {
│ +    readout: g('#sim-readout').innerText,
│ +    note: (document.querySelector('#sim-note') || {}).innerText || '',
│ +    lampOn: g('#cc-lamp').classList.contains('is-on'),
│ +    lampAria: g('#cc-lamp').getAttribute('aria-label'),
│ +    boardAria: g('#cc-board').getAttribute('aria-label'),
│ +    switchAria: g('#cc-switch').getAttribute('aria-label'),
│ +    switchOffStyle: g('#cc-switch').classList.contains('is-off'),
│ +    leverBg: getComputedStyle(g('#cc-switch .cc-lever')).backgroundImage,
│ +    bars: [...document.querySelectorAll('.cc-bar')].map((b) => ({ cls: b.className.replace('cc-bar ', ''), ...bar(b), dashed: getComputedStyle(b).backgroundImage !== 'none' })),
│ +    terms: [...document.querySelectorAll('.cc-term')].map((t) => ({ cls: t.className.replace('cc-term ', ''), ...bar(t), on: t.classList.contains('is-on') })),
│ +    progress: (() => { try { return JSON.parse(localStorage.getItem('suprask:progress') || '{}'); } catch (e) { return 'n/a'; } })(),
│ +  };
│ +  return out;
│ +}
│ +"""
│ +
│ +async def main():
│ +    from playwright.async_api import async_playwright
│ +    srv = serve()
│ … omitted 46 diff line(s) across 1 additional file(s)/section(s)
│ assets/js/sims/technologijos.js
│ @@ -287,8 +287,11 @@
│        switchBtn.classList.toggle("is-open", !closed);
│        // Jungiklis guli apatiniame laide: kai laido nėra, jo svirtis irgi
│        // braižoma kaip trūkstama, kad valdiklis nekviestų spausti kelio,
│ -      // kurio nėra (LL-04, LL-13).
│ +      // kurio nėra (LL-04, LL-13). Tokiu metu jis ir negaudo paspaudimų —
│ +      // kitaip vidurinė apatinio laido dalis būtų akla zona: vaikas nori
│ +      // prijungti laidą, o paliečia jungiklį ir nieko neįvyksta.
│        switchBtn.classList.toggle("is-off", !bottom);
│ +      switchBtn.style.pointerEvents = bottom ? "" : "none";
│        lamp.classList.toggle("is-on", lit);
│
│        terms.topBat.classList.toggle("is-on", top);
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe246b.py
│ @@ -96,12 +96,15 @@
│                  # walk states via real buttons
│                  st = {}
│                  st["start"] = await pg.evaluate(STATE)
│ -                await pg.click("#cc-top"); await pg.wait_for_timeout(320); st["topOnly"] = await pg.evaluate(STATE)
│ -                await pg.click("#cc-bottom"); await pg.wait_for_timeout(320); st["both"] = await pg.evaluate(STATE)
│ +                await pg.click("#cc-top", position={"x": 40, "y": 24}); await pg.wait_for_timeout(320); st["topOnly"] = await pg.evaluate(STATE)
│ +                await pg.click("#cc-bottom", position={"x": 40, "y": 24}); await pg.wait_for_timeout(320); st["both"] = await pg.evaluate(STATE)
│                  await pg.click("#cc-switch"); await pg.wait_for_timeout(320); st["bothOpen"] = await pg.evaluate(STATE)
│                  await pg.click("#cc-switch"); await pg.wait_for_timeout(320); st["bothClosed"] = await pg.evaluate(STATE)
│ -                await pg.click("#cc-top"); await pg.wait_for_timeout(320); st["bottomOnly"] = await pg.evaluate(STATE)
│ -                await pg.click("#cc-switch"); await pg.wait_for_timeout(320); st["bottomOnlySwitch"] = await pg.evaluate(STATE)
│ +                await pg.click("#cc-top", position={"x": 40, "y": 24}); await pg.wait_for_timeout(320); st["bottomOnly"] = await pg.evaluate(STATE)
│ +                # ar vidurinė apatinio laido dalis nebėra akla zona: bandome spausti ten, kur jungiklis
│ +                box = await pg.locator("#cc-bottom").bounding_box()
│ +                await pg.mouse.click(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
│ +                await pg.wait_for_timeout(320); st["tapMidBottom"] = await pg.evaluate(STATE)
│                  for k, v in st.items():
│                      print(f"   {k:18s} lamp={v['lampOn']} switchOff={v['switchOffStyle']} note={v['note']!r}")
│                      print(f"      readout: {v['readout']}")
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe246b.py
│ @@ -112,13 +112,13 @@
│                      print(f"      terms:", [(x['cls'], x['l'], x['on']) for x in v["terms"]])
│                      print(f"      boardAria: {v['boardAria']}")
│                      print(f"      switchAria: {v['switchAria']}")
│ -                # keyboard order
│ -                await pg.evaluate("() => document.querySelector('#cc-reset').focus()")
│ +                # keyboard order inside the sim
│ +                await pg.evaluate("() => document.querySelector('#cc-top').focus()")
│                  seq = []
│ -                for _ in range(5):
│ +                for _ in range(4):
│                      await pg.keyboard.press("Tab")
│ -                    seq.append(await pg.evaluate("() => { const a = document.activeElement; return (a.id || a.className || a.tagName) + '|' + (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 30); }"))
│ -                print("   tab order:", seq)
│ +                    seq.append(await pg.evaluate("() => { const a = document.activeElement; return (a.id || a.className || a.tagName) + '|' + (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 46); }"))
│ +                print("   tab from #cc-top:", seq)
│                  await pg.close()
│              await b.close()
│      finally:
Sustabdytas iteracijų limitas. Toliau — kas realiai padaryta ir tikra išvestis, be pagražinimų.

PADARYTA: viena simuliacija — `elektros-grandine` (`assets/js/sims/technologijos.js`, +~70/−~25) + `sim.config.sentences` dviejų sakinių taisymas modulio JSON.

Klaidinga nuostata: simuliacijos tekstas teigė tai, ko paveikslas nerodo. Radinys iš kritiko ataskaitos (#41, `agents/log/kritikas-2026-11-07T1402.md`, iki šiol neįgyvendintas): kai prijungtas tik apatinis laidas, ekranas sakė „Atgal į bateriją veda, bet iki lemputės neateina“, o laidas vizualiai liečia ir lemputę, ir bateriją. Išmatavau: prijungta juosta 574–866 (baterija iki 586, lemputė nuo 854 — juosta įlenda 12 px į abi), o nutraukta — visada 10 px atstumu nuo abiejų dalių, t. y. tarpas buvo „beveik liečia“, o ne pertrauka. Vaikas, kuris pažiūri atidžiai, mato priešingai, nei perskaito (LL-13), ir neturi kur pirštu parodyti, kur kelias atviras — nors `outcomes[1]` reikalauja „Paaiškinu, kodėl su vienu laidu lemputė nešviečia“.

Pakeitimai:
1. Keturi gnybtai (`.cc-term`) — kontaktai ten, kur laidas susitinka su baterija ir lempute: prijungtas užpildytas, neprijungtas tuščias žiedas. Atsiranda vieta, kurią galima parodyti pirštu.
2. Laido geometrija: prijungtas baigiasi ties gnybtu (82 px @360), neprijungtas atsitraukia 15 px (98 px) — pertrauka matoma, o ne 10 px „beveik liečia“. Sąmoningai nekeitė įprastų pločių: 200 % tekste išdėstymas identiškas (matuota 16 ir 32 px root).
3. Jungiklis braižomas kaip apatinio laido dalis: kai to laido nėra, svirtis brūkšniuota, o pats valdiklis negaudo paspaudimų (`pointer-events:none`) — kitaip vidurinė apatinio laido dalis buvo akla zona: vaikas nori prijungti laidą, paliečia jungiklį ir nieko neįvyksta.
4. `api.readout` sakiniai dabar atitinka paveikslą ir yra simetriški: „Viršutinis laidas yra. Apatinio nėra, todėl kelias neužsidaro.“ / „Apatinis laidas yra. Viršutinio nėra…“ (8 ž. ≤ 10). Pastabos veda prie trūkstamo laido.
5. `.cc-board` gauna `role="group"` ir būseną atitinkantį `aria-label`, jungiklio `aria-label` pasako, kad jis apatiniame laide ir kelyje nedalyvauja. Informaciją neša trys kanalai: forma (tuščias/užpildytas žiedas), brūkšnys, tekstas.

TIKRA PATIKRA (vietinis http.server, portai 8996/8997, Chromium per Playwright):
- `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų, rc 0
- `check_ui.py` → 0/0, rc 0
- `check_view.py --module 01-elektros-grandine --viewports desktop,phone,small` → 3 patikros, 0 problemų, rc 0
- `check_view.py` visa klasė → 111 (37×3), 0 problemų, rc 0
- `check_audio.py` → 543 tekstų, 1086 įrašų, 1086/1086 mp3 (Piper), rc 0
- `check_language.py --grade 1 --strict` → rc 0, likę 4 įspėjimai kituose moduliuose, buvo prieš darbą
- `node --check` → SYNTAX_OK
- Zondas realiame modulyje 1440/390/360 × 16/32 px: `docOverflow 0`, `#sim-stage` scrollWidth == clientWidth (972/972, 328/328, 298/298), 0 elementų su slinktimi scenoje, `smallTargets []`, 0 konsolės klaidų. Būsenų seka (klikais): start → topOnly → both (lemputė įsijungia) → bothOpen → bothClosed → bottomOnly; gnybtai persijungia 1:1 su laidais; Tab iš #cc-top → #cc-bottom → #cc-switch → #cc-reset.

ZINOMA RIBAS (nepaslėpta):
- 200 % tekste (32 px root) @360 px `.cc-name` etiketės („Baterija“, „Lemputė“) išlenda iš 76 px dėžučių: `#sim-stage` scrollWidth 266 vs clientWidth 241. Tai NE mano pakeitimas — `.cc-part` ir `.cc-name` taisyklės neliestos, geometrija sena; platformos vartai 200 % teksto nematuoja (#7396/#4921), todėl `check_view.py` žalias. Siūlyčiau atskirą darbą visai simų šeimai, ne vienai scenai.
- Jungiklis, kai apatinis laidas prijungtas, vis dar dengia apatinės juostos vidurį — palietus vidurį persijungia jungiklis, ne laidas. Tai sąmoninga (jungiklis ten ir gyvena), bet jei eilė grąžins tą patį, verta svarstyti atskirą valdiklį.

NEPADARYTA (sąžiningai): ataskaitos failas `agents/log/`, `agents/state.json` (`last_sim_work`) ir pamokos `research/wiki/guidelines/pamokos.md` įrašas dar nesukurti — limitas baigėsi prieš juos įrašant. Būtent juos reikia įrašyti pirmiausia kitame paleidime (naujas defektų tipas: „Pertrauka, kurios nesimato: tekstas sako «neateina», o laidas liečia“). Pakeitimai palikti darbinėje kopijoje, nekomituoti — publikuoja bėgiklis.

## klaidos

```
session_id: local-4a84bb1b42834b2b83b9a2e490d658be285405c0f6555a1a14fb236bbf65cc53
```
