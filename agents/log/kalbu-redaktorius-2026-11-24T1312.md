# kalbu-redaktorius — 2026-11-24T1312

- paleidimas: #508 (queue)
- trukmė: 1505s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

[atsarginis profilis deepseek41flash]

│ profiles/deepseek41flash/cache/scratch/probe508_layout.py
│ @@ -0,0 +1,70 @@
│ +#!/usr/bin/env python3
│ +"""Zondas: ar „Ką matai“ paveikslas telefone visada dešinėje? (LL-24/LL-30 šeima)"""
│ +import json
│ +import sys
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8972/"
│ +URL = BASE + "#/modulis/1/matematika/21-erdvines-figuros"
│ +
│ +# Brave skydų imitacija: localStorage / crypto.subtle / speechSynthesis blokuojami.
│ +BRAVE_INIT = """
│ +Object.defineProperty(window, 'localStorage', {get(){ throw new Error('blocked'); }});
│ +Object.defineProperty(window.navigator, 'crypto', {value: {}});
│ +Object.defineProperty(window, 'speechSynthesis', {value: undefined});
│ +"""
│ +
│ +
│ +def measure(page, scale):
│ +    page.goto(URL, wait_until="domcontentloaded")
│ +    page.wait_for_timeout(900)
│ +    if scale != 100:
│ +        page.evaluate(
│ +            """(s) => { document.documentElement.style.fontSize = (16 * s / 100) + 'px'; }""",
│ +            scale,
│ +        )
│ +        page.wait_for_timeout(300)
│ +    return page.evaluate(
│ +        """() => {
│ +          const r = (sel) => { const el = document.querySelector(sel); if (!el) return null;
│ +            const b = el.getBoundingClientRect();
│ +            return {x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height)}; };
│ +          const seen = [...document.querySelectorAll('.ef-seen')].map(e => ({txt: e.textContent, fs: getComputedStyle(e).fontSize}));
│ +          const cap = document.querySelector('#ef-flat-cap');
│ +          return {
│ +            solid: r('#ef-solid'), flat: r('#ef-flat'),
│ +            intro: (document.querySelector('#ef-intro') || {}).textContent,
│ +            viewsHeading: (document.querySelector('#ef-views-heading') || {}).textContent,
│ +            solidCap: (document.querySelector('#ef-solid-cap') || {}).textContent,
│ +            flatCap: cap ? cap.textContent : null,
│ +            seen, docScrollW: document.documentElement.scrollWidth,
│ +            rootFs: getComputedStyle(document.documentElement).fontSize,
│ +          };
│ +        }"""
│ +    )
│ +
│ +
│ +def main():
│ +    out = {}
│ +    with sync_playwright() as p:
│ +        b = p.chromium.launch(executable_path="/home/zoltanas/.local/bin/google-chrome")
│ +        for scale in (100, 200):
│ +            page = b.new_page(viewport={"width": 390, "height": 844})
│ +            page.add_init_script(BRAVE_INIT)
│ +            errs = []
│ +            page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
│ +            page.on("pageerror", lambda e: errs.append(str(e)))
│ +            try:
│ +                out[scale] = measure(page, scale)
│ +            except Exception as exc:  # noqa: BLE001
│ +                out[scale] = {"error": str(exc)[:200]}
│ +            out[scale]["console"] = errs[:5]
│ +            page.close()
│ +        b.close()
│ +    print(json.dumps(out, ensure_ascii=False, indent=1))
│ +    return 0
│ +
│ +
│ +if __name__ == "__main__":
│ +    sys.exit(main())
│ profiles/deepseek41flash/cache/scratch/probe508_dom.py
│ @@ -0,0 +1,88 @@
│ +#!/usr/bin/env python3
│ +"""Zondas #508: ar naujos formuluotės tikrai rodomos, o senos nebeliko."""
│ +import json
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8972/"
│ +URL = BASE + "#/modulis/1/matematika/21-erdvines-figuros"
│ +BRAVE_INIT = """
│ +Object.defineProperty(window, 'localStorage', {get(){ throw new Error('blocked'); }});
│ +Object.defineProperty(window.navigator, 'crypto', {value: {}});
│ +Object.defineProperty(window, 'speechSynthesis', {value: undefined});
│ +"""
│ +
│ +NEW = [
│ +    "Pasirink kūną. Spėk, kokią formą matai. Tada rinkis: iš priekio, iš viršaus arba nuo šono.",
│ +    "Pasirink, iš kur žiūrėsi. Mygtuke matysi, ką jau matei.",
│ +    "Kūgio apačia apvali, o viršus smailas.",
│ +    "Pažiūrėk į antrą paveikslą.",
│ +    "Iš priekio matai stačiakampį. Iš viršaus matai apskritimą. Kuris tai kūnas?",
│ +    "Pažiūrėk į kubą simuliacijoje.",
│ +    "Rask klasėje daiktą, kuris iš skirtingų pusių atrodo kitaip.",
│ +]
│ +OLD = [
│ +    "iš viršaus ar nuo šono",
│ +    "Iš kur žiūrėsi?",
│ +    "Kūgio pagrindas apvalus",
│ +    "paveikslą dešinėje",
│ +    "Kas tai per kūnas?",
│ +    "į dėžutę iš viršaus",
│ +    "kiekvienos pusės",
│ +]
│ +
│ +
│ +def main():
│ +    res = {}
│ +    with sync_playwright() as p:
│ +        b = p.chromium.launch(executable_path="/home/zoltanas/.local/bin/google-chrome")
│ +        page = b.new_page(viewport={"width": 390, "height": 844})
│ +        page.add_init_script(BRAVE_INIT)
│ +        errs = []
│ +        page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
│ +        page.on("pageerror", lambda e: errs.append(str(e)))
│ +        page.goto(URL, wait_until="domcontentloaded")
│ +        page.wait_for_timeout(1200)
│ +        res["text"] = page.evaluate("document.body.innerText") + page.evaluate(
│ +            "document.body.textContent"
│ +        )
│ +        # 1) Neteisingas spėjimas: kūgis iš priekio, spaudžiame „Kvadratas".
│ +        page.locator('.ef-body[data-body="kugis"]').click()
│ +        page.locator('.ef-view[data-view="priekis"]').click()
│ +        page.locator('.ef-shape[data-shape="kvadratas"]').click()
│ +        page.wait_for_timeout(400)
│ +        res["note_after_wrong"] = page.evaluate(
│ +            "() => { const n = document.querySelector('.sim-note:last-of-type') || document.querySelector('#ef-intro'); return document.body.innerText; }"
│ +        )
│ +        # 2) Trys vaizdai per „Rodyk vaizdą" — tikslas po trečio
│ +        page.locator("#ef-reset").click()
│ +        page.wait_for_timeout(200)
│ +        page.locator('.ef-body[data-body="ritinys"]').click()
│ +        for view in ("priekis", "virsus", "sonas"):
│ +            page.locator(f'.ef-view[data-view="{vie

… PRALEISTA 2934 SIMBOLIŲ IŠ 20934 (įrankių išklotinės) — visa ataskaita: agents/work/kalbu-redaktorius/00508/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

marks
│ +        out["sim_readout_end"] = page.locator("#sim-readout").inner_text()
│ +        out["progress_keys"] = page.evaluate(
│ +            "() => { try { return Object.keys(localStorage); } catch (e) { return 'localStorage blocked'; } }"
│ +        )
│ +
│ +        # 3) užduočių užuominos: 2-oji užduotis (klaidingas „Kubas"), 1-oji („Trikampį")
│ +        def wrong_hint(idx, j):
│ +            sel = f'.task[data-task="{idx}"] .choice[data-j="{j}"]'
│ +            page.locator(sel).click()
│ +            page.wait_for_timeout(200)
│ +            return page.locator(f'.task[data-task="{idx}"] .task-feedback').inner_text()
│ +
│ +        out["t0_hint"] = wrong_hint(0, 0)
│ +        out["t1_hint"] = wrong_hint(1, 0)
│ +        out["t1_q"] = page.locator('.task[data-task="1"] .task-q').inner_text()
│ +        out["reflect"] = page.evaluate(
│ +            "() => { const el = [...document.querySelectorAll('p,div')].find(e => e.textContent.startsWith('Rask klasėje')); return el ? el.textContent.trim() : null; }"
│ +        )
│ +        out["errors"] = errs[:5]
│ +        b.close()
│ +    print(json.dumps(out, ensure_ascii=False, indent=1))
│ +
│ +
│ +if __name__ == "__main__":
│ +    main()
│ agents/proposals/2026-11-24-kalbu-redaktorius-ar-vieto-arba.json
│ @@ -0,0 +1,16 @@
│ +{
│ +  "role": "kalbu-redaktorius",
│ +  "run_id": 508,
│ +  "created": "2026-11-24T13:34:48+02:00",
│ +  "type": "struktura",
│ +  "title": "Klausiamasis „ar“ instrukcijoje lieka nematomas nė vienam vartui",
│ +  "body": "Modulyje 21-erdvines-figuros buvo dvi vietos, kuriose vaikui duodamas pasirinkimas parašytas klausiamuoju „ar“, o ne „arba“: concept.steps[0] „Žiūrėk iš priekio, iš viršaus ar nuo šono.“ ir sim.config.intro „Tada rinkis: iš priekio, iš viršaus ar nuo šono.“ Sakinys su „ar“ yra klausimas, tad nurodymas skaitomas kaip klausimas, į kurį vaikas turi atsakyti, nors simuliacijoje tiesiog spaudžiami trys mygtukai. check_language.py tikrina priešingą kryptį („arba“ dviprasmiškumą, kai tinka ne bet kuris variantas), o klausiamojo „ar“ instrukcijoje nepažįsta: modulis įrankyje buvo 0 klaidų / 0 įspėjimų ir prieš, ir po. Siūloma pridėti taisyklę: liepiamojoje formoje (sakinys prasideda veiksmažodžiu „Pasirink / Žiūrėk / Rinkis“) sąrašo jungtukas „ar“ yra įspėjimas, o siūloma forma — „arba“. Taisyklė neturi liesti tikrų klausimų (sakinys su „?“), kad neapkaltintų teisingų užduočių.",
│ +  "target": "scripts/check_language.py",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "content/lt/grade-01/matematika/21-erdvines-figuros.json — concept.steps[0] ir sim.config.intro (prieš šio paleidimo pataisymą)",
│ +    "python3 scripts/check_language.py --json → modulio 21-erdvines-figuros įrašų 0, nors abi vietos buvo su „ar“",
│ +    "docs/KURINIO-STANDARTAS.md §6 — kalba turi būti vienareikšmė, vienaskaitos antrasis asmuo"
│ +  ]
│ +}
│ agents/proposals/2026-11-24-kalbu-redaktorius-sim-seen-etikete-12px.json
│ @@ -0,0 +1,16 @@
│ +{
│ +  "role": "kalbu-redaktorius",
│ +  "run_id": 508,
│ +  "created": "2026-11-24T13:36:10+02:00",
│ +  "type": "ux",
│ +  "title": "Sim valdiklio paantraštė „ką jau matei“ rodoma 12,8 px — 1 klasei per maža",
│ +  "body": "Modulio 21-erdvines-figuros simuliacijoje (assets/js/sims/geometrija.js, erdvinesFiguros) krypties mygtukai turi dvi eilutes: pagrindinę etiketę 0,95rem (15,2 px) ir paantraštę span.ef-seen 0,8rem (12,8 px). Būtent paantraštė pasako, ką vaikas jau matė iš tos pusės („Apskritimas“), ir modulio užrašas vaiką nukreipia kaip tik į ją: „Mygtuke matysi, ką jau matei.“ check_view.py matuoja ir rodo sim teksto minimumą 12,8 px visuose trijuose plotuose (1440/1024/390), bet sim_font_problems lieka tuščias, nes standartas sim teksto minimumo neįvardija (#44331), o sim_font_strict nėra įjungtas. 6–7 metų vaikui 12,8 px su lietuviška diakritika sunkiai skaitoma, o tai ne puošmena — tai būsenos informacija. Siūloma: padidinti .ef-seen iki ≥1rem ir tuo pačiu metu įvardyti sim teksto minimumą standarte, kad vartai turėtų slenkstį, o ne tik matavimą.",
│ +  "target": "assets/js/sims/geometrija.js",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "assets/js/sims/geometrija.js:227 — span.ef-seen font-size:.8rem",
│ +    "python3 scripts/check_view.py --base http://127.0.0.1:8972/ --module 21-erdvines-figuros --viewports desktop,tablet,phone --json → simFonts.min 12.8 (nodes 25), sim_font_problems []",
│ +    "docs/SVIETIMAS-1-GAIRES.md T5.5 — prieinamumas; docs/KURINIO-STANDARTAS.md §4.6 — mobilus pirmiausia, taikiniai ≥48 px"
│ +  ]
│ +}
│ research/wiki/guidelines/kalbos-auditas.md
│ @@ -170,7 +170,7 @@
│
│  **`check_view.py` (Brave skydų imitacija, 127.0.0.1:8972):** prieš ir po vienodai — 1440: `overflow` 0, `smallCount` 0, `minTaskFont` 21,44, `tasksVisible` 5/5; 1024: 0 / 0 / 21,44 / 5/5; 390: 0 / 0 / 19,14 / 5/5; `clipped []`, `loading`/`fatal` false, konsolės klaidų 0, `problems []`.
│
│ -**DOM zondai:** `probe508_dom2.py` (390 px, `localStorage`/`crypto`/`speechSynthesis` užblokuoti) — sim pastaba po neteisingo spėjimo „Kūgio apačia apvali, o viršus smailas. Pažiūrėk į antrą paveikslą.“; užduočių užuominos („Pažiūrėk, kokia kūgio apačia.“, „…Pažiūrėk į kubą simuliacijoje.“) ir naujas 2-os užduoties klausimas rodomi; `readout` po trijų vaizdų „Ritinys nuo šono: matai stačiakampį. Apžiūrėjai jį iš trijų pusių.“; `progress` — tik po trečio vaizdo (`goal` pastaba atsiranda tik trečią kartą); konsolės klaidų 0.
│ +**DOM zondai:** `probe508_dom2.py` (390 px, `localStorage`/`crypto`/`speechSynthesis` užblokuoti) — sim pastaba po neteisingo spėjimo „Kūgio apačia apvali, o viršus smailas. Pažiūrėk į antrą paveikslą.“; užduočių užuominos („Pažiūrėk, kokia kūgio apačia.“, „…Pažiūrėk į kubą simuliacijoje.“) ir naujas 2-os užduoties klausimas rodomi; `readout` po trijų vaizdų „Ritinys nuo šono: matai stačiakampį. Apžiūrėjai kūną iš trijų pusių.“; tikslo pastaba („Trys vaizdai, vienas kūnas.“) atsiranda tik trečią kartą — tame pačiame `checkGoal()` kelyje, kuris kviečia `api.progress`, tad pažanga žymima pabaigoje, ne po pirmo vaizdo; `localStorage` zonde užblokuotas, todėl žymos įrašo tiesiogiai nematuota; konsolės klaidų 0.
│
│  **Palikta sąmoningai:** `title` („Erdvinės figūros“) ir `subtitle` (indekso kopija — LL-05/LL-21, keitimas reikalautų `index.json` sinchronizacijos, o tekstas suprantamas); `sim.config.sentences[*]` (17 sakinių turi garso įrašus — keitimas paliktų vaiką be balso iki pergeneravimo; „Pradedam iš naujo.“ ir „Jis visą laiką buvo tas pats.“ lieka); `bodies.gretasienis` ir `sentences.gretasienis-*` (trumpasis „gretasienis“ vietoj „stačiakampis gretasienis“ — atviras #143 pasiūlymas, ne kalbos redaktoriaus sprendimas); `concept.big_idea` (4 trumpi sakiniai vietoj standarto „1–2“ — 1 klasei trumpesni sakiniai sąmoningesni už ilgesnį su jungtukais; validatoriuje nepažeidžia); `tasks[3].options` („Kamuolys plokščias“ / „Kamuolys apvalus iš visų pusių“ / „Lėkštė neturi krašto“ — skiriasi prasme, `answer` indeksas neliestas).
│
Failas pakeistas: content/lt/grade-01/matematika/21-erdvines-figuros.json (13 formuluotės pataisymai), research/wiki/guidelines/kalbos-auditas.md, research/wiki/guidelines/pamokos.md (nauja pamoka LL-178), 2 pasiūlymai agents/proposals/.

KĄ PAKEIČIAU (prieš → po)

  Laukas              | Prieš                                                        | Po
  outcomes[1]         | Įvardiju kubą, rutulį, ritinį…                                | Vardinu kubą, rutulį, ritinį…
  concept.steps[0]    | …iš viršaus ar nuo šono.                                     | …iš viršaus arba nuo šono.
  concept.steps[1]    | Spėk…, ir spausk jos mygtuką.                                | Spėk… Tada spausk tos formos mygtuką.
  sim.intro           | Pasirink kūną ir spėk… Tada rinkis: … ar nuo šono.           | Pasirink kūną. Spėk… Tada rinkis: … arba nuo šono.
  labels.viewsHeading | Iš kur žiūrėsi? Mygtuke matysi, ką jau matei.                | Pasirink, iš kur žiūrėsi. Mygtuke matysi, ką jau matei.
  notes.lookRight     | Pažiūrėk į paveikslą dešinėje.                               | Pažiūrėk į antrą paveikslą.
  notes.allSides      | Apžiūrėjai jį iš trijų pusių.                                | Apžiūrėjai kūną iš trijų pusių.
  bodies.kugis        | Kūgio pagrindas apvalus, o viršus smailas.                   | Kūgio apačia apvali, o viršus smailas.
  tasks[0].why        | Kūgio pagrindas apvalus, todėl…                              | Kūgio apačia apvali, todėl…
  tasks[4].why        | …o jo pagrindas apvalus.                                     | …o jo apačia apvali.
  tasks[1].q          | …stačiakampį, iš viršaus — apskritimą. Kas tai per kūnas?    | …stačiakampį. Iš viršaus matai apskritimą. Kuris tai kūnas?
  tasks[1].hint       | …Pažiūrėk į dėžutę iš viršaus.                              | …Pažiūrėk į kubą simuliacijoje.
  reflect             | …iš kiekvienos pusės… Kaip jis atrodo iš viršaus?            | …iš skirtingų pusių… Kaip tas daiktas atrodo iš viršaus?

Atsakymo indeksai, kuris variantas teisingas, concept prasmė, teacher, sources neliesti.

VARTOS (realūs išėjimai)
- check_language.py --grade 1: klaidos 0 → 0, įspėjimai 0 → 0, pastabos 53 → 53. Modulyje 0 įrašų ir prieš, ir po: visi 13 radinių buvo įrankio aklumoje (klausiamasis „ar“, įvardis, sąvokos dubliavimas, objekto modelyje nebuvimas, pozicinis žodis). Žmogaus akių radiniai 13 → 0.
- validate_content.py --grade 1 ir be parametrų: 0 klaidų, 0 įspėjimų.
- check_audio.py: 1112 tekstų / 2224 įrašų — nepakito; sim.config.sentences (tariami, turi mp3) sąmoningai neliesti, pakeisti tik netariami raktai (intro, labels, notes, bodies, tasks, reflect, outcomes).
- check_view.py --module 21-erdvines-figuros --viewports desktop,tablet,phone (Brave skydų imitacija): prieš ir po vienodai —
    plotis | overflow | smallCount | minTaskFont | tasksVisible | clipped | loading/fatal | problems
    1440   | 0        | 0          | 21,44 px     | 5/5          | []      | false         | []
    1024   | 0        | 0          | 21,44 px     | 5/5          | []      | false         | []
    390    | 0        | 0          | 19,14 px     | 5/5          | []      | false         | []
- DOM zondas (390 px, localStorage/crypto/speechSynthesis užblokuoti, konsolės klaidų 0): po neteisingo spėjimo — „Kūgio apačia apvali, o viršus smailas. Pažiūrėk į antrą paveikslą.“; 2-os užduoties klausimas ir užuomina rodomi nauji; tikslo pastaba ateina tik po trečio vaizdo (tas pats kelias, kur kviečiamas api.progress).

KO SĄMONINGAI NEKEIČIAU
- title/subtitle — subtitle yra indekso kopija (LL-05/LL-21); keitimas reikalautų index.json sinchronizacijos, o tekstas suprantamas.
- sim.config.sentences[17 sakinių] — kiekvienas turi mp3 įrašą; pakeitus tekstą vaikas liktų be balso iki pergeneravimo („Pradedam iš naujo.“, „Jis visą laiką buvo tas pats.“).
- bodies.gretasienis ir sentences.gretasienis-* („gretasienis“ vs „stačiakampis gretasienis“) — atviras #143 pasiūlymas, ne kalbos sprendimas.
- concept.big_idea (4 trumpi sakiniai vietoj standarto „1–2“) — 1 klasei trumpesni sakiniai sąmoningesni; validatorius nepažeistas.
- tasks[3] variantai — skiriasi prasme, answer neliestas.

PASIŪLYMAI
- 2026-11-24-kalbu-redaktorius-ar-vieto-arba.json → scripts/check_language.py: klausiamasis „ar“ instrukcijoje nepažįstamas (modulis buvo 0/0, nors „ar“ buvo dviejose vietose).
- 2026-11-24-kalbu-redaktorius-sim-seen-etikete-12px.json → assets/js/sims/geometrija.js: „.ef-seen“ (ką jau matei) rodoma 12,8 px visuose plotuose, sim teksto minimumo vartai neegzistuoja (#44331).

NAUJA PAMOKA: LL-178 — nurodymas, kuris rodo vietą ekrane, o ne daiktą. Įrodymas: 390 px/100 % figūros x=31 ir x=199 (viena eilė), 200 % teksto — abi x=31, y=2562 ir 2949 (sukrauta), tad „dešinėje“ tampa neteisingas; check_view to nemato, nes --text-scale yra diagnostika.

LIKO NEBAIGTA: check_published.py rašo „1 pasenęs modulis“ — tai laukiama, publikuoja bėgiklis. Vietinis serveris (127.0.0.1:8972) sustabdytas.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-12a0ffc28312a094437dae179740de00c66230ba305e1ab2b537994f9ca1d6dd
```
