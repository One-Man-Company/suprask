# simuliaciju-inzinierius — 2026-11-19T1103

- paleidimas: #381 (manual)
- trukmė: 696s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/probe200.py
│ @@ -0,0 +1,88 @@
│ +#!/usr/bin/env python3
│ +"""Zondas: 200 % teksto (32 px šaknis) @360 px — kas išlenda ir kas atsakingas."""
│ +import json
│ +import pathlib
│ +import sys
│ +import urllib.request
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8985"
│ +CHROME = str(pathlib.Path.home() / ".local/bin/google-chrome")
│ +
│ +MEASURE = r"""
│ +() => {
│ +  const de = document.documentElement;
│ +  const vw = window.innerWidth;
│ +  const out = [];
│ +  const walk = (el, depth) => {
│ +    if (depth > 40) return;
│ +    const r = el.getBoundingClientRect();
│ +    if (r.width === 0 && r.height === 0) return;
│ +    const cs = getComputedStyle(el);
│ +    if (cs.visibility === 'hidden' || cs.display === 'none') return;
│ +    if (r.right > vw + 1.5 || r.left < -1.5) {
│ +      out.push({
│ +        tag: el.tagName.toLowerCase(),
│ +        id: el.id || '',
│ +        cls: (typeof el.className === 'string' ? el.className : '').slice(0, 60),
│ +        text: (el.textContent || '').trim().slice(0, 34),
│ +        left: Math.round(r.left * 10) / 10,
│ +        right: Math.round(r.right * 10) / 10,
│ +        w: Math.round(r.width * 10) / 10,
│ +        depth,
│ +      });
│ +    }
│ +    for (const c of el.children) walk(c, depth + 1);
│ +  };
│ +  walk(document.body, 0);
│ +  return {
│ +    vw,
│ +    scrollWidth: de.scrollWidth,
│ +    overflow: de.scrollWidth - vw,
│ +    offenders: out.slice(0, 12),
│ +  };
│ +}
│ +"""
│ +
│ +
│ +def routes():
│ +    with urllib.request.urlopen(BASE + "/content/lt/grade-01/index.json", timeout=20) as r:
│ +        data = json.loads(r.read().decode())
│ +    for s in data["strands"]:
│ +        for m in s["modules"]:
│ +            yield s["id"], m["id"]
│ +
│ +
│ +def main():
│ +    with sync_playwright() as pw:
│ +        b = pw.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│ +        ctx = b.new_context(viewport={"width": 360, "height": 780}, device_scale_factor=1)
│ +        page = ctx.new_page()
│ +        errs = []
│ +        page.on("pageerror", lambda e: errs.append(str(e)[:120]))
│ +        page.on("console", lambda m: errs.append("console: " + m.text[:120]) if m.type == "error" else None)
│ +        for strand, mid in routes():
│ +            errs.clear()
│ +            page.goto(f"{BASE}/#/modulis/1/{strand}/{mid}", wait_until="domcontentloaded", timeout=25000)
│ +            try:
│ +                page.wait_for_selector(".task", timeout=12000)
│ +            except Exception as exc:  # noqa: BLE001
│ +                print(f"{mid}: NEPASIKROVĖ {exc}"[:160])
│ +                continue
│ +            page.wait_for_timeout(450)
│ +            page.evaluate("document.documentElement.style.fontSize='32px'")
│ +            page.wait_for_timeout(350)
│ +            d = page.evaluate(MEASURE)
│ +            status = "OK  " if d["overflow"] <= 1 else "SLINKA"
│ +            print(f"{status} {mid}: dok {d['scrollWidth']}/{d['vw']} (+{d['overflow']}) klaidos={len(errs)}")
│ … omitted 10 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/probe_poster.py
│ @@ -0,0 +1,92 @@
│ +#!/usr/bin/env python3
│ +"""Zondas: 05-plakatas-ir-informacija @360 px @32 px — kas lemia 13 px slinktį."""
│ +import pathlib
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8985"
│ +CHROME = str(pathlib.Path.home() / ".local/bin/google-chrome")
│ +ROUTE = "#/modulis/1/lietuviu-kalba/05-plakatas-ir-informacija"
│ +
│ +CHAIN = r"""
│ +() => {
│ +  const start = document.querySelector('#sim-stage');
│ +  const rows = [];
│ +  let el = start;
│ +  while (el && el !== document.documentElement) {
│ +    const r = el.getBoundingClientRect();
│ +    const cs = getComputedStyle(el);
│ +    rows.push({
│ +      tag: el.tagName.toLowerCase(),
│ +      id: el.id || '',
│ +      cls: (typeof el.className === 'string' ? el.className : '').slice(0, 40),
│ +      w: Math.round(r.width * 10) / 10,
│ +      cw: el.clientWidth,
│ +      sw: el.scrollWidth,
│ +      display: cs.display,
│ +      justify: cs.justifyItems,
│ +      jc: cs.justifyContent,
│ +      minw: cs.minWidth,
│ +      maxw: cs.maxWidth,
│ +      pad: cs.padding,
│ +      overflowX: cs.overflowX,
│ +      fs: cs.fontSize,
│ +    });
│ +    el = el.parentElement;
│ +  }
│ +  rows.reverse();
│ +  const child = start ? start.firstElementChild : null;
│ +  const c = child ? child.getBoundingClientRect() : null;
│ +  const grid = document.querySelector('#pi-zones');
│ +  const g = grid ? grid.getBoundingClientRect() : null;
│ +  const q = document.querySelector('#pi-question');
│ +  const qr = q ? q.getBoundingClientRect() : null;
│ +  return {
│ +    chain: rows,
│ +    childWidth: c ? { w: Math.round(c.width * 10) / 10, r: Math.round(c.right * 10) / 10 } : null,
│ +    gridWidth: g ? { w: Math.round(g.width * 10) / 10, r: Math.round(g.right * 10) / 10 } : null,
│ +    questionWidth: qr ? { w: Math.round(qr.width * 10) / 10, r: Math.round(qr.right * 10) / 10 } : null,
│ +    docOverflow: document.documentElement.scrollWidth - window.innerWidth,
│ +  };
│ +}
│ +"""
│ +
│ +
│ +def show(page, label):
│ +    page.evaluate("document.documentElement.style.fontSize='32px'")
│ +    page.wait_for_timeout(350)
│ +    d = page.evaluate(CHAIN)
│ +    print(f"\n=== {label} ===  docOverflow={d['docOverflow']}")
│ +    for row in d["chain"]:
│ +        print(f"  <{row['tag']}{('#'+row['id']) if row['id'] else ''}{('.'+row['cls'].replace(' ','.')) if row['cls'] else ''}>"
│ +              f" w={row['w']} cw={row['cw']} sw={row['sw']} disp={row['display']} justify-items={row['justify']}"
│ +              f" minw={row['minw']} maxw={row['maxw']} ovx={row['overflowX']} fs={row['fs']}")
│ +    print(f"  child={d['childWidth']} grid={d['gridWidth']} question={d['questionWidth']}")
│ +    page.evaluate("document.documentElement.style.fontSize=''")
│ +
│ +
│ +def main()

… PRALEISTA 8571 SIMBOLIŲ IŠ 26571 (įrankių išklotinės) — visa ataskaita: agents/work/simuliaciju-inzinierius/00381/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

 return { label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 24), w: Math.round(r.width), h: Math.round(r.height) }; })
│ +    .filter(t => t.w > 0);
│ +  const small = targets.filter(t => t.h < 48);
│ +  return {
│ +    docOverflow: de.scrollWidth - window.innerWidth,
│ +    stageW: sr ? Math.round(sr.width * 10) / 10 : null,
│ +    stageInnerScroll: stage ? stage.scrollWidth - stage.clientWidth : null,
│ +    childW: stage && stage.firstElementChild ? Math.round(stage.firstElementChild.getBoundingClientRect().width * 10) / 10 : null,
│ +    outOfBox,
│ +    clipped,
│ +    targets: targets.length,
│ +    small,
│ +    readout: (document.querySelector('#sim-readout')?.innerText || '').slice(0, 90),
│ +    note: (document.querySelector('.sim-note')?.innerText || '').slice(0, 90),
│ +  };
│ +}
│ +"""
│ +
│ +CORRECT = ["uzrasas-atsvaitas", "piesinys-atsvaitas", "piesinys-dviratis", "uzrasas-gatva"]
│ +
│ +
│ +def state(page, label, problems):
│ +    d = page.evaluate(MEASURE)
│ +    flag = "OK  "
│ +    bits = []
│ +    if d["docOverflow"] > 1:
│ +        bits.append(f"dok slinktis {d['docOverflow']}px")
│ +    if d["outOfBox"]:
│ +        bits.append("iš dėžės: " + ", ".join(f"<{o['tag']}#{o['id']}> r={o['right']}" for o in d["outOfBox"]))
│ +    if d["clipped"]:
│ +        bits.append("apkarpyta: " + ", ".join(f"„{c['text']}“ {c['sw']}>{c['cw']}" for c in d["clipped"]))
│ +    if d["small"]:
│ +        bits.append("maži taikiniai: " + ", ".join(f"„{s['label']}“ {s['w']}×{s['h']}" for s in d["small"]))
│ +    if bits:
│ +        flag = "DEF  "
│ +        problems.append((label, "; ".join(bits)))
│ +    print(f"  {flag}{label}: dok={d['docOverflow']:+d} stage={d['stageW']} vaikas={d['childW']} "
│ +          f"vid.slinktis={d['stageInnerScroll']} taikiniai={d['targets']}")
│ +    print(f"        readout: {d['readout']}")
│ +    print(f"        note:    {d['note']}")
│ +    if bits:
│ +        print(f"        >>> {bits}")
│ +    return d
│ +
│ +
│ … omitted 64 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/probe_finish.py
│ @@ -0,0 +1,58 @@
│ +#!/usr/bin/env python3
│ +"""Pabaigos būsena @360 px @32 px: kas tiksliai išlenda."""
│ +import pathlib
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8985"
│ +CHROME = str(pathlib.Path.home() / ".local/bin/google-chrome")
│ +ROUTE = "#/modulis/1/lietuviu-kalba/05-plakatas-ir-informacija"
│ +CORRECT = ["uzrasas-atsvaitas", "piesinys-atsvaitas", "piesinys-dviratis", "uzrasas-gatva"]
│ +
│ +DUMP = r"""
│ +() => {
│ +  const stage = document.querySelector('#sim-stage');
│ +  const sr = stage.getBoundingClientRect();
│ +  const rows = [];
│ +  stage.querySelectorAll('*').forEach(el => {
│ +    const r = el.getBoundingClientRect();
│ +    if (r.width === 0 && r.height === 0) return;
│ +    rows.push({
│ +      tag: el.tagName.toLowerCase(),
│ +      cls: (typeof el.className === 'string' ? el.className : '').slice(0, 26),
│ +      w: Math.round(r.width * 10) / 10,
│ +      right: Math.round(r.right * 10) / 10,
│ +      cw: el.clientWidth, sw: el.scrollWidth,
│ +      cs: getComputedStyle(el).display + '/' + getComputedStyle(el).minWidth + '/' + getComputedStyle(el).maxWidth,
│ +      text: (el.textContent || '').trim().slice(0, 26),
│ +    });
│ +  });
│ +  return { stage: { w: Math.round(sr.width * 10) / 10, right: Math.round(sr.right * 10) / 10 }, rows };
│ +}
│ +"""
│ +
│ +
│ +def main():
│ +    with sync_playwright() as pw:
│ +        b = pw.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│ +        ctx = b.new_context(viewport={"width": 360, "height": 780}, device_scale_factor=1)
│ +        page = ctx.new_page()
│ +        page.goto(f"{BASE}/{ROUTE}", wait_until="domcontentloaded", timeout=25000)
│ +        page.wait_for_selector(".task", timeout=12000)
│ +        page.wait_for_timeout(500)
│ +        for z in CORRECT:
│ +            page.click(f'button[data-zone="{z}"]')
│ +            page.wait_for_timeout(200)
│ +            page.click("#pi-next")
│ +            page.wait_for_timeout(250)
│ +        page.evaluate("document.documentElement.style.fontSize='32px'")
│ +        page.wait_for_timeout(350)
│ +        d = page.evaluate(DUMP)
│ +        print(f"stage w={d['stage']['w']} right={d['stage']['right']}")
│ +        for row in d["rows"]:
│ +            print(f"  <{row['tag']}{('.'+row['cls'].replace(' ','.')) if row['cls'] else ''}> w={row['w']} right={row['right']} cw={row['cw']} sw={row['sw']} [{row['cs']}] „{row['text']}“")
│ +        b.close()
│ +
│ +
│ +if __name__ == "__main__":
│ +    main()
│ assets/js/sims/calba.js
│ @@ -1147,7 +1147,7 @@
│
│      function finish() {
│        stage.innerHTML = `
│ -        <div style="text-align:center;padding:.4rem;max-width:34rem">
│ +        <div style="text-align:center;padding:.4rem;min-width:0;max-width:min(34rem, 100%)">
│            <p style="margin:0;font-family:var(--font-head);font-weight:900;font-size:clamp(1.1rem,4.2vw,1.35rem)">Atsakymus radai abiejose dalyse.</p>
│            <p style="margin:.4rem 0 0">Užraše: ${tally.uzrasas} ${plural(tally.uzrasas, "atsakymą", "atsakymus", "atsakymų")}.</p>
│            <p style="margin:.15rem 0 0">Piešinyje: ${tally.piesinys} ${plural(tally.piesinys, "atsakymą", "atsakymus", "atsakymų")}.</p>
│ agents/proposals/2026-11-19-simuliaciju-inzinierius-min-content-200.json
│ @@ -0,0 +1,17 @@
│ +{
│ +  "role": "simuliaciju-inzinierius",
│ +  "run_id": 381,
│ +  "created": "2026-11-19T11:13:54+02:00",
│ +  "type": "ux",
│ +  "title": "200 % tekste dar du moduliai slenka: simuliacijos blokas telpa tik išsitęsdamas",
│ +  "body": "Šiame paleidime sutvarkius 05-plakatas-ir-informacija (blokas 313 px tarp 241 px dėžės → 13 px slinktis; pataisa — `min-width:0` ir `max-width:min(44rem,100%)`, 8 būsenos × 360/390/1440 × 16/32 px = 0 defektų), tas pats mechanizmas liko dar dviejuose moduliuose, matuotuose per visą 1 klasę. 10-gyvunu-grupes: `<strong>„Maistą susiranda pats“` dešinysis kraštas 363 px, kai ekranas 360 px (+3 px dokumento slinktis) — tai simuliacijos scenos tekstas `pasaulis.js`. 23-ismestas-daiktas-nedingsta: trys `button.btn.secondary` (`Naudosiu dar`, `Atiduosiu kitam`, `Išmesiu`) yra 304 px pločio, nors valdiklių dėžė 240,8 px (+4 px), nes `.btn` horizontalus paminkštinimas `1.4rem` prie 32 px šaknies sudaro 89,6 px „oro“, o mygtukas negali susitraukti žemiau savo `min-content`. Abu atvejai — LL-55 ir LL-52/LL-70 šeima, tik šie du failai nebuvo perkelti į `min-width:0` + `minmax(min(100%,…),1fr)` + `padding-inline:min(1.4rem,9%)` tvarką, kurią kiti sim failai jau turi. Kadangi `check_view.py` matuoja tik 16 px šaknį (pasiūlymas #7396), šie defektai vartuose nematomi ir gali išgyventi ilgai; todėl siūloma taisyti juos kartu su pirmuoju prisilietimu prie tų simuliacijų, o ne laukti atskiro 200 % audito.",
│ +  "target": "assets/js/sims/pasaulis.js",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "Zondas probe200.py (2026-11-19, Chromium, 360 px, 32 px šaknis, visi 48 moduliai): po šio paleidimo liko SLINKA 10-gyvunu-grupes (+3, <strong> r=363) ir 23-ismestas-daiktas-nedingsta (+4, trys button.btn.secondary w=304); 05-plakatas-ir-informacija po pataisos — +0",
│ +    "assets/js/sims/calba.js:1116–1123 ir 1149 — šiame paleidime įdėta `min-width:0;max-width:min(44rem,100%)`; 390 px @32 px anksčiau plakatas išlindo 42 px už `#sim-stage` dėžės, nors dokumentas nesislinko (LL-30)",
│ +    "assets/css/main.css:348 — `.sim-stage { display:grid; place-items:center }`: `justify-items:center` verčia vaiką imti max-content, o `min-width:auto` neleidžia susitraukti, todėl kiekvienas sim blokas be `min-width:0` tampa platesnis už dėžę 200 % tekste",
│ +    "research/wiki/guidelines/pamokos.md — LL-55 („Takelis susitraukė, o slanktį toliau laiko vaiko min-content“) ir LL-52/LL-70 (`.btn` paminkštinimas 200 % tekste)"
│ +  ]
│ +}
Darbas atliktas: sutvarkyta `05-plakatas-ir-informacija` simuliacija (`assets/js/sims/calba.js`). Papildomai įrašytas pasiūlymas dėl likusių dviejų modulių.

KAS PAKEISTA
- `calba.js:1114–1128` — plakato blokas: `width:100%` → `width:100%;min-width:0;max-width:min(44rem,100%)`.
- `calba.js:1149` — pabaigos blokas: tas pats `min-width:0` + `max-width:min(34rem,100%)`.
- `agents/proposals/2026-11-19-simuliaciju-inzinierius-min-content-200.json` — likę du moduliai su tuo pačiu mechanizmu.

KLAIDINGA NUOSTATA
Modelyje ji lieka ta pati ir dabar veikia: „informacija plakate yra tik užrašyta (arba tik nupiešta)“ — vaikas privalo atsakymo ieškoti abiejuose kanaluose, o klausimai išdėstyti taip, kad vienas atsakomas tik užraše, kitas — tik piešinyje. Sutvarkytas defektas yra kitas: 200 % tekste plakatas neišsitekdavo, t. y. vaikas, kuriam reikia didelio šrifto, negalėdavo perskaityti būtent to klausimo.

DEFEKTAS IR PRIEŽASTIS (pamatuota, ne spėta)
`#sim-stage` yra `grid` su `place-items:center` (`main.css:348`), todėl vaikas ima savo max-content, o `min-width:auto` neleidžia jam susitraukti. 360 px ekrane su 32 px šaknimi (200 % teksto) plakatas buvo 313,1 px tarp 240,8 px dėžės → 13 px dokumento slinkties. Prielaida „pakaks `max-width:100%`“ pasitvirtino kaip klaidinga: kandidatas A davė child=313,1 ir docOverflow=13, t. y. nieko nepakeitė; tik `min-width:0` davė child=240,8 ir docOverflow=0. 390 px @32 px anksčiau plakatas išlindo 42 px už `#sim-stage` dėžės, nors dokumentas nesislinko (LL-30 atvejis, kurio `check_view.py` nemato). 16 px šaknyje matmenys nepakito (298,4 → 298,4).

TIKRA ZONDO IŠVESTIS (Chromium, `.venv`, lokalus `http.server`, 8 būsenos × 3 plotai × 2 teksto dydžiai)
```
### 360px @ 16px šaknis   pradinis: dok=+0 stage=298.4 vaikas=298.4 vid.slinktis=0 taikiniai=6
### 360px @ 32px šaknis   pradinis: dok=+0 stage=240.8 vaikas=240.8 vid.slinktis=0 taikiniai=6
### 390px @ 32px šaknis   q4 atsakytas: dok=+0 stage=270.8 vaikas=270.8 vid.slinktis=0
### 1440px @ 32px šaknis  pabaiga:  dok=+0 stage=1248.8 vaikas=1088 vid.slinktis=0
=== SUMMED DEFECTS ===
0
```
Būsenos: pradinis, po netinkamos zonos, piešiniai paslėpti, q1–q4 atsakyti, pabaiga, po „Bandyti dar kartą“. Kiekvienoje matuota: dokumento slinktis, ar nė vienas scenos elementas neišeina iš `#sim-stage`, ar tekstas neapkarpytas (`scrollWidth−clientWidth`), ar taikiniai ≥48 px. Visur 0 defektų, konsolės klaidų 0, klaviatūra (`#pi-toggle` → Tab → zonos mygtukas) veikia. Prieš pataisą tame pačiame zonde buvo 13 px slinktis ir 2,5 px išlindęs pabaigos blokas.

VISOS 1 KLASĖS 200 % ZONDAS (48 maršrutai, 360 px, 32 px šaknis)
```
OK   05-plakatas-ir-informacija: dok 360/360 (+0)
SLINKA 10-gyvunu-grupes: dok 363/360 (+3)  <strong>„Maistą susiranda pats“ r=363
SLINKA 23-ismestas-daiktas-nedingsta: dok 364/360 (+4)  button.btn.secondary w=304
```
Prieš darbą 05 buvo +13. Kiti du — atskiri sim failai (`pasaulis.js`, `gyvenimas.js`), todėl ne šio paleidimo apimtis; įrašyti į pasiūlymą su matavimais.

VARTŲ IŠVESTIS (po paskutinio pakeitimo)
```
python3 scripts/validate_content.py --grade 1 --strict → 0 klaidų, 0 įspėjimų, RC=0
check_ui.py                                            → 0 klaidų, 0 įspėjimų, RC=0
check_language.py --grade 1  → 48 moduliai, 0 klaidų, 4 įspėjimai (visi kituose moduliuose; 05 — 0), RC=0
check_registry.py → 67 SIMS raktai; 48 index / 48 failai / 210 užduočių / 48 sim; našlaičiai 0; RC=0
check_art.py → 9 sim failai naudoja art.js, legacy 1; RC=0
check_view.py --module 05-plakatas-ir-informacija → 3 patikrinta, 0 problemų, RC=0
check_view.py (visa klasė, small+phone+desktop) → 144 patikrinta (48×3), 0 problemų, RC=0
```

LIKO
- `10-gyvunu-grupes` (+3 px) ir `23-ismestas-daiktas-nedingsta` (+4 px) — tas pats mechanizmas kituose sim failuose; pasiūlymas eilėje.
- Naujos pamokos neįrašiau sąmoningai: defektas yra LL-55 („Takelis susitraukė, o slanktį toliau laiko vaiko min-content“) kartojimas, o šis failas nebuvo perkeltas į tą tvarką; dubliuoti numerio nedėjau.
- Foninis `http.server 8985` uždarytas.

## klaidos

```
session_id: local-5b03b879dff64013cad5f73508fee9ada68aef1e905fc18c252a79ed19832d3e
```
