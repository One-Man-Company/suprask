# kalbu-redaktorius — 2026-11-08T1023

- paleidimas: #149 (queue)
- trukmė: 1194s
- exit: 0 → ok
- modelis: hermes:ling31flash

## Ataskaita

│ profiles/ling31flash/cache/scratch/summ_cl.py
│ @@ -0,0 +1,23 @@
│ +#!/usr/bin/env python3
│ +"""Summarize check_language.py --json output for module 16-vandens-busenos."""
│ +import json
│ +import sys
│ +
│ +path = sys.argv[1]
│ +d = json.load(open(path, encoding="utf-8"))
│ +iss = d["issues"]
│ +mod = [x for x in iss if "16-vandens-busenos" in x.get("where", "")]
│ +print("MODULE16 findings:", len(mod))
│ +for x in mod:
│ +    print(" ", x["severity"], x["where"], x["issue"], "|", x["text"])
│ +print(
│ +    "TOTAL: errors=%d warns=%d infos=%d modules=%d max_words=%s"
│ +    % (
│ +        sum(1 for x in iss if x["severity"] == "error"),
│ +        sum(1 for x in iss if x["severity"] == "warn"),
│ +        sum(1 for x in iss if x["severity"] == "info"),
│ +        d.get("modules"),
│ +        d.get("max_words"),
│ +    )
│ +)
│ +print("GRADE:", d.get("grade"))
│ profiles/ling31flash/cache/scratch/summ_view.py
│ @@ -0,0 +1,19 @@
│ +#!/usr/bin/env python3
│ +"""Summarize check_view.py --json output for one module."""
│ +import json
│ +import sys
│ +
│ +d = json.load(open(sys.argv[1], encoding="utf-8"))
│ +print("checked:", d.get("checked"), "problems:", len(d.get("problems", [])), "notes:", len(d.get("notes", [])))
│ +for r in d.get("all", []):
│ +    print(
│ +        "  @%spx: ok=%s overflow=%s tasks=%s/%s small=%s minTaskFont=%s clipped=%s "
│ +        "simControls=%s loading=%s fatal=%s errors=%s"
│ +        % (
│ +            r.get("viewport"), r.get("ok"), r.get("overflow"), r.get("tasksVisible"),
│ +            r.get("tasks"), r.get("smallCount"), r.get("minTaskFont"), r.get("clipped"),
│ +            r.get("simVisibleControls"), r.get("loading"), r.get("fatal"), r.get("errors"),
│ +        )
│ +    )
│ +    if r.get("smallTargets"):
│ +        print("     smallTargets:", r.get("smallTargets"))
│ content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json
│ @@ -3,7 +3,7 @@
│    "grade": 1,
│    "strand": "pasaulio-pazinimas",
│    "title": "Kur dingsta vanduo",
│ -  "subtitle": "Vanduo neprapuola — jis keičia savo formą",
│ +  "subtitle": "Vanduo neišnyksta — jis keičia savo formą",
│    "minutes": 9,
│    "outcomes": [
│      "Pasakau, kad išgaravęs vanduo neprapuola, o būna ore kaip garas.",
│ content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json
│ @@ -6,7 +6,7 @@
│    "subtitle": "Vanduo neišnyksta — jis keičia savo formą",
│    "minutes": 9,
│    "outcomes": [
│ -    "Pasakau, kad išgaravęs vanduo neprapuola, o būna ore kaip garas.",
│ +    "Pasakau, kad išgaravęs vanduo neišnyksta, o būna ore kaip garas.",
│      "Paaiškinu, kodėl ant vėsaus dangčio susidaro lašai.",
│      "Įvardiju tris vandens būsenas: ledą, vandenį ir garą."
│    ],
│ content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json
│ @@ -17,7 +17,7 @@
│        "Įpilk vandens ir pakaitink. Virš puodo pakyla garas.",
│        "Garas yra tas pats vanduo, tik ore. Jo nematome.",
│        "Uždėk vėsų dangtį. Ant jo susirenka lašai.",
│ -      "Pakreipk dangtį. Lašai nubyra atgal į puodą."
│ +      "Pakreipk dangtį. Lašai nubėga atgal į puodą."
│      ],
│      "example": "Ryte vonios veidrodis būna aprasojęs. Tai garas iš dušo atvėso ir virto lašais."
│    },
│ content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json
│ @@ -19,7 +19,7 @@
│        "Uždėk vėsų dangtį. Ant jo susirenka lašai.",
│        "Pakreipk dangtį. Lašai nubėga atgal į puodą."
│      ],
│ -    "example": "Ryte vonios veidrodis būna aprasojęs. Tai garas iš dušo atvėso ir virto lašais."
│ +    "example": "Ryte vonios veidrodis būna užparęs. Tai garas iš dušo atvėso ir virto lašais."
│    },
│    "sim": {
│      "component": "vandens-busenos",
│ content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json
│ @@ -51,7 +51,7 @@
│        "why": "Vėsus dangtis atvėsino garą, ir šis virto lašais."
│      },
│      {
│ -      "q": "Ryte vonios veidrodis aprasojo. Kas jame?",
│ +      "q": "Ryte vonios veidrodis užparojo. Kas jame?",
│        "options": [
│          "Dulkės nuo sienos",
│          "Sienos dažai",
│ content/lt/grade-01/index.json
│ @@ -50,7 +50,7 @@
│          { "id": "08-metu-laikai", "title": "Metų laikai", "subtitle": "Kodėl keičiasi medžiai, oras ir gyvūnai", "file": "grade-01/pasaulio-pazinimas/08-metu-laikai.json", "minutes": 9, "sim": "metu-laikai" },
│          { "id": "09-augalo-gyvenimas", "title": "Augalo gyvenimas", "subtitle": "Ko augalui reikia, kad jis augtų", "file": "grade-01/pasaulio-pazinimas/09-augalo-gyvenimas.json", "minutes": 9, "sim": "augalo-gyvenimas" },
│          { "id": "10-gyvunu-grupes", "title": "Gyvūnų grupės", "subtitle": "Žinduoliai, paukščiai, žuvys", "file": "grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json", "minutes": 9, "sim": "gyvunu-grupes" },
│ -        { "id": "16-vandens-busenos", "title": "Kur dingsta vanduo", "subtitle": "Vanduo neprapuola — jis keičia savo formą", "file": "grade-01/pasaulio-pazinimas/16-vandens-busenos.json", "minutes": 9, "sim": "vandens-busenos" },
│ +        { "id": "16-vandens-busenos", "title": "Kur dingsta vanduo", "subtitle": "Vanduo neišnyksta — jis keičia savo formą", "file": "grade-01/pasaulio-pazinimas/16-vandens-busenos.json", "minutes": 9, "sim": "vandens-busenos" },
│          { "id": "17-judejimas", "title": "Nuožulnioji plokštuma: kas lemia greitį", "subtitle": "Greitį keičia plokštumos aukštis, o ne daikto svoris", "file": "grade-01/pasaulio-pazinimas/17-judejimas.json", "minutes": 9, "sim": "nuozulnioji-plokstuma" }
│        ]
│      },
│ profiles/ling31flash/cache/scratch/probe149_dom.py
│ @@ -0,0 +1,70 @@
│ +#!/usr/bin/env python3
│ +"""DOM zondas run 149: 16-vandens-busenos — ar naujos formuluotės gyvai puslapyje.
│ +
│ +Brave skydų blokada (localStorage/crypto.subtle/speechSynthesis) — taip kaip
│ +check_view.py BRAVE_INIT. Tikrina: nauji teiginiai matomi, seni nebelikę,
│ +simuliacija įsikėlė, console/page errors 0.
│ +"""
│ +import json
│ +import sys
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8941/"
│ +ROUTE = "#/modulis/1/pasaulio-pazinimas/16-vandens-busenos"
│ +
│ +MUST_HAVE = [
│ +    "Vanduo neišnyksta — jis keičia savo formą",          # subtitle (.lede)
│ +    "neišnyksta, o būna ore kaip garas",                   # outcomes[0]
│ +    "būna užparęs",                                        # concept.example
│ +    "Lašai nubėga atgal į puodą",                          # concept.steps[3]
│ +    "veidrodis užparojo",                                  # tasks[2].q
│ +]
│ +MUST_NOT_HAVE = ["neprapuola", "aprasoj", "nubyra"]
│ +
│ +BRAVE_INIT = """
│ +try { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('insecure', 'SecurityError'); } }); } catch (e) {}
│ +try { Object.defineProperty(Crypto.prototype, 'subtle', { get() { return undefined; } }); } catch (e) {}
│ +try { Object.defineProperty(window, 'speechSynthesis', { get() { return undefined; } }); } catch (e) {}
│ +"""
│ +
│ +results = {"must_have": {}, "must_not_have": {}, "sim": {}, "errors": []}
│ +
│ +with sync_playwright() as pw:
│ +    browser = pw.chromium.launch(
│ +        executable_path="/home/zoltanas/.local/bin/google-chrome", args=["--no-sandbox"]
│ +    )
│ +    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
│ +    ctx.add_init_script(BRAVE_INIT)
│ +    page = ctx.new_page()
│ +    page.on("console", lambda m: results["errors"].append("console: " + m.text[:160])
│ +            if m.type == "error" else None)
│ +    page.on("pageerror", lambda e: results["errors"].append("pageerror: " + str(e)[:160]))
│ +    page.goto(BASE + ROUTE, wait_until="domcontentloaded", timeout=25000)
│ +    page.wait_for_selector(".task", timeout=12000)
│ +    page.wait_for_timeout(800)
│ +    text = page.evaluate("document.body.innerText")
│ +    for s in MUST_HAVE:
│ +        results["must_have"][s] = s in text
│ +    for s in MUST_NOT_HAVE:
│ +        results["must_not_have"][s] = s not in text
│ +    results["sim"]["controls_buttons"] = page.evaluate(
│ +        "document.querySelectorAll('#sim-controls button').length")
│ +    results["sim"]["has_heat_slider"] = page.evaluate(
│ +        "!!document.querySelector('#vb-heat')")
│ +    results["tasks"] = page.evaluate("document.querySelectorAll('.task').length")
│ +    results["title"] = page.evaluate(
│ +        "document.querySelector('h1') ? document.querySelector('h1').innerText : null")
│ +    browser.close()
│ +
│ +ok = (
│ +    all(results["must_have"].values())
│ +    and all(results["must_not_have"].values())
│ +    and results["sim"]["controls_buttons"] >= 1
│ +    and results["sim"]["has_heat_slider"]
│ +    and results["tasks"] == 4
│ +    and not results["errors"]
│ +)
│ +results["RESULT"] = "OK" if ok else "FAIL"
│ +print(json.dumps(results, ensure_ascii=False, indent=1))
│ +sys.exit(0 if ok else 1)
│ content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json
│ @@ -12,7 +12,7 @@
│    ],
│    "concept": {
│      "title": "Vanduo keičia formą",
│ -    "big_idea": "Vanduo gali būti ledas, vanduo arba garas. Šildomas jis kyla į orą, o vėsdamas vėl tampa lašais.",
│ +    "big_idea": "Vanduo gali būti ledas, vanduo arba garas. Kai pakaiti, kyla į orą, o kai atvėsta, tampa lašais.",
│      "steps": [
│        "Įpilk vandens ir pakaitink. Virš puodo pakyla garas.",
│        "Garas yra tas pats vanduo, tik ore. Jo nematome.",
│ profiles/ling31flash/cache/scratch/probe149_dom.py
│ @@ -2,10 +2,12 @@
│  """DOM zondas run 149: 16-vandens-busenos — ar naujos formuluotės gyvai puslapyje.
│
│  Brave skydų blokada (localStorage/crypto.subtle/speechSynthesis) — taip kaip
│ -check_view.py BRAVE_INIT. Tikrina: nauji teiginiai matomi, seni nebelikę,
│ -simuliacija įsikėlė, console/page errors 0.
│ +check_view.py BRAVE_INIT. Tekstas sutaupomas (\\s+ -> viena tarpas), kad
│ +realus eilučių lūžys neketintų substrings (LL-31 šeima). Tikrina: nauji
│ +teiginiai matomi, seni nebelikę, simuliacija įsikėlė, console/page errors 0.
│  """
│  import json
│ +import re
│  import sys
│
│  from playwright.sync_api import sync_playwright
│ @@ -15,12 +17,14 @@
│
│  MUST_HAVE = [
│      "Vanduo neišnyksta — jis keičia savo formą",          # subtitle (.lede)
│ +    "Vanduo gali būti ledas, vanduo arba garas",           # big_idea sakinys 1
│ +    "Kai pakaiti, kyla į orą, o kai atvėsta, tampa lašais",  # big_idea sakinys 2
│      "neišnyksta, o būna ore kaip garas",                   # outcomes[0]
│      "būna užparęs",                                        # concept.example
│      "Lašai nubėga atgal į puodą",                          # concept.steps[3]
│      "veidrodis užparojo",                                  # tasks[2].q
│  ]
│ -MUST_NOT_HAVE = ["neprapuola", "aprasoj", "nubyra"]
│ +MUST_NOT_HAVE = ["neprapuola", "aprasoj", "nubyra", "Šildomas", "vėsdamas"]
│
│  BRAVE_INIT = """
│  try { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('insecure', 'SecurityError'); } }); } catch (e) {}
│ @@ -43,7 +47,8 @@
│      page.goto(BASE + ROUTE, wait_until="domcontentloaded", timeout=25000)
│      page.wait_for_selector(".task", timeout=12000)
│      page.wait_for_timeout(800)
│ -    text = page.evaluate("document.body.innerText")
│ +    raw = page.evaluate("document.body.innerText")
│ +    text = re.sub(r"\s+", " ", raw)
│      for s in MUST_HAVE:
│          results["must_have"][s] = s in text
│      for s in MUST_NOT_HAVE:
│ @@ -52,9 +57,13 @@
│          "document.querySelectorAll('#sim-controls button').length")
│      results["sim"]["has_heat_slider"] = page.evaluate(
│          "!!document.querySelector('#vb-heat')")
│ +    results["sim"]["readout"] = page.evaluate(
│ +        "(document.querySelector('#sim-readout')||{}).innerText || null")
│      results["tasks"] = page.evaluate("document.querySelectorAll('.task').length")
│      results["title"] = page.evaluate(
│          "document.querySelector('h1') ? document.querySelector('h1').innerText : null")
│ +    results["outcomes_li"] = page.evaluate(
│ +        "document.querySelectorAll('ul.outcomes li').length")
│      browser.close()
│
│  ok = (
│ agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json
│ @@ -0,0 +1,19 @@
│ +{
│ +  "role": "kalbu-redaktorius",
│ +  "run_id": 149,
│ +  "created": "2026-11-08T10:36:34+02:00",
│ +  "type": "struktura",
│ +  "title": "16-vandens-busenos sim.config.words niekur neskaitomas — negyva konfigūracija",
│ +  "body": "Modulio sim.config.words („Vanduo“, „Ledas“, „Garas“, „Dangtis“, „Lašai“) yra negyvi duomenys: vandensBusenos komponentas (assets/js/sims/pasaulis.js:861) montuojasi kaip mount({ stage, controls, api }) — config jam netiekiamas, o pačiame pasaulis.js nėra nei vieno „config“ ar „words“ rakto (grep → 0). Simuliacija žodžius turi kietai įrašytus: VB_HEAT (:859), SVG tekstas „ledas“ (:979), api.speak kviečiai „Garas“/„Lašai“/„Vanduo“ (:1048–1050). Taigi JSON žodžius redaguojant (pvz., terminijos taisymui) simuliacija nepasikeis, o generate_audio.collect() šiuos žodžius vis tiek renka — garso įrašai generuojasi našlaičiais. Tai LL-42 šeimos atvirkščinis atvejis: vietoj dviejų gyvų šaltinių — vienas gyvas (kodas), vienas negyvas (config). Siūloma arba prijungti words prie simuliacijos (žodžių kortelės ant scenos, kaip kituose modulyse), arba pašalinti sim.config iš modulio JSON — kad vienintelis žodžių šaltinis būtų sim kodas. Sprendimas — simuliacijų inžinieriaus/kūrėjo.",
│ +  "target": "content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json (sim.config.words) + assets/js/sims/pasaulis.js (vandensBusenos mount)",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "assets/js/sims/pasaulis.js:862 — mount({ stage, controls, api }) be config",
│ +    "grep -c 'config|words' assets/js/sims/pasaulis.js → 0 atitikmenų",
│ +    "content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json:27 — sim.config.words",
│ +    "assets/js/app.js:444 — platforma config perduoda (component.mount({ ..., config: mod.sim.config || {} })), tik šis komponentas jo neims",
│ +    "assets/js/sims/pasaulis.js:979 (kietas SVG tekstas „ledas“), :1048–1050 (kieti api.speak žodžiai)",
│ +    "research/wiki/guidelines/pamokos.md LL-61 (šio paleidimo nauja pamoka)"
│ +  ]
│ +}
│ agents/proposals/2026-11-08-kalbu-redaktorius-sim-virs-lašais.json
│ @@ -0,0 +1,16 @@
│ +{
│ +  "role": "kalbu-redaktorius",
│ +  "run_id": 149,
│ +  "created": "2026-11-08T10:36:34+02:00",
│ +  "type": "simulacija",
│ +  "title": "Simuliacijos pastaboje „virs lašais“ — nestandartinė būsimoji forma",
│ +  "body": "16-vandens-busenos simuliacijos pastaboje po dangčio uždėjimo (assets/js/sims/pasaulis.js:1082) yra „Jis vėsus, todėl garas ant jo virs lašais.“ — „virs“ yra suspausta būsimoji forma, kuri nestandartinė ir 1 klasės tekstuose nevartojama; pačiame modulyje visur vartojama praeitis („virto garu“, „virto lašais“, „…ir virto lašais“). Vaikas, skaitantis pastabą, gali sustoti prie nežinomos veiksmažodžio formos. Siūloma „…garas ant jo virsta lašais“ (dabartinė, derinasi su „Jis vėsus“) arba „…garas ant jo virto lašais“ (praeitis, derinasi su modulio terminija). Simuliacijos kodo čia nekeičiau — tai simuliacijų inžinieriaus arba kūrėjo sprendimas; pastabą pakeitus reikia atnaujinti ir garso įrašą, jei ji patenka į tariamų tekstų sąrašą (šiandien api.note tekstas garso vartų neapima — tikrinama check_audio.py).",
│ +  "target": "assets/js/sims/pasaulis.js:1082 (vandensBusenos toggleLid msg)",
│ +  "priority": "low",
│ +  "status": "new",
│ +  "evidence": [
│ +    "assets/js/sims/pasaulis.js:1082 — msg = „Dangtis uždėtas. Jis vėsus, todėl garas ant jo virs lašais.“",
│ +    "content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json:40,51,62 — modulyje visur „virto“ (praeitis)",
│ +    "DOM zondas probe149_dom.py: sim readout ir pastabų kanalas gyvai veikia (readout „Vandens lygis 5 iš 5 · dangtis nuimtas“)"
│ +  ]
│ +}
│ research/wiki/guidelines/pamokos.md
│ @@ -437,4 +437,11 @@
│  - **Simptomas:** `10-gyvunu-grupes` tasks[3].hint buvo „Paukštį atpažįstame ne pagal skrydį." — 1-asis asmuo daugiskaita (`mes`, `-ame`). Vaikas puslapį skaito vienas (namuose arba tyliai klasėje); „mes" neturi aiškaus veikėjo. Be to, tai buvo vienintelis 1-asmens formulys modulyje — kitur hint'ai 2-asis („Pagalvok…") arba 3-asis (klausimai).
│  - **Priežastis:** hint'as rašomas iš mokytojo perspektyvos („mes atpažįstame" = mes mokykloje, kartu). Vaikui pateikiamame tekste veikėjas turi būti pats vaikas (2-asis asmuo) arba objektyvus faktas (3-asis asmuo).
│  - **Taisyklė:** hint'uose ir užduočių tekstuose tik 2-asis asmuo (liepiamasis: „Pagalvok…") arba 3-asis faktas/klausimas. 1-asis asmuo daugiskaita („mes", „atpažįstame", „žiūrime", „matome") nevartojamas — jis prielaiko suaugusįjį palydą, kurio vaikas gali neturėti. Audito modelis #6 (asmenų nesutapimas tarp užduočių) plėčiamas čia: hint'as yra vaikui skaitomas tekstas, rodomas būtent tada, kai vaikas jau suklydo — ten formuluotė turi būti aiškiausia.
│ -- **Patikra:** `grep -rn "atpažįstame\|žiūrime\|matome\|padarėme\|suradome" content/lt/grade-01/` → 0 atitikimų; žmogaus peržiūra: kiekvienas hint'as perskaitomas vaiko vietoje — ar veikėjas aiškus be „mes"? Šiame darbe (paleidimas #148): prieš — „Paukštį atpažįstame ne pagal skrydį."; po — „Ne visi paukščiai skraido." (5 žodžiai, faktas, asmuo neliečiamas, atsakymo nenurodo). `check_language.py` ir `validate_content.py` abu žali — įrankis nemato asmenų (LL-52/LL-53 šeima).
│ +- **Patikra:** `grep -rn "atpažįstame\|žiūrime\|matome\|padarėme\|suradome" content/lt/grade-01/` → 0 atitikimų; žmogaus peržiūra: kiekvienas hint'as perskaitomas vaiko vietoje — ar veikėjas aiškus be „mes"? Šiame darbe (paleidimas #148): prieš — „Paukštį atpažįstame ne pagal skrydį.“; po — „Ne visi paukščiai skraido.“ (5 žodžiai, faktas, asmuo neliečiamas, atsakymo nenurodo). `check_language.py` ir `validate_content.py` abu žali — įrankis nemato asmenų (LL-52/LL-53 šeima).
│ +
│ +## LL-61 — Negyva konfigūracija: sim.config raktas, kurio komponentas neskaito
│ +
│ +- **Simptomas:** `16-vandens-busenos` modulyje `sim.config.words` = [„Vanduo", „Ledas", „Garas", „Dangtis", „Lašai"], bet `vandensBusenos` simuliacija (`assets/js/sims/pasaulis.js:861`) montuojasi kaip `mount({ stage, controls, api })` — config jam netiekiamas, o pačiame `pasaulis.js` nėra nei vieno „config" ar „words" rakto (grep → 0). Žodžiai ekrane kietai: `VB_HEAT` (:859), SVG tekstas „ledas" (:979), `api.speak` kviečiai (:1048–1050). JSON redaguojant — simuliacija nepasikeičia; `generate_audio.collect()` žodžius vis tiek renka, todėl garso įrašai generuojasi našlaičiais.
│ +- **Priežastis:** platformos sutartis (`assets/js/app.js:444`) config perduoda bet komponentas jo neima; `validate_content.py` tikrina, ar `sim.component` egzistuoja registre, bet ne, ar `sim.config` raktačius naudoja. LL-42 kalba apie du gyvus šaltinius vienam tekstui — čia vienas iš jų negyvas nuo pat pradžios.
│ +- **Taisyklė:** kiekvienas `sim.config` raktas turi būti prijungtas prie komponento arba nebūti užrašytas modulio JSON. Kurtiniant naują modulį: jei simulacijos žodžiai/etiketės kieti — config nesukuriamas; jei config sukurtas — komponentas jį skaito.
│ +- **Patikra:** (1) grep komponento faile pagal config rakto vardą → 0 atitikmenų = negyva. (2) Elgesio zondas (LL-42 variantas): config reikšmė keičiama tinkle → simuliacijos tekstas/etiketė turi pasikeisti; jei ne — raktas negyvas. Šiame darbe (paleidimas #149): rasta `16-vandens-busenos`, užfiksuota pasiūlymu `agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json` (prijungti arba pašalinti — simuliacijų inžinieriaus/kūrėjo sprendimas).
│ research/wiki/guidelines/kalbos-auditas.md
│ @@ -120,3 +120,14 @@
│  - **10-gyvunu-grupes — pakartotinė fresh-eyes peržiūra** (auditas #137 šiam moduliui rado tik #1, užtaisyta #144; šį kartą žiūrima iš naujo). Vienintelis likęs radinys: tasks[3].hint „Paukštį atpažįstame ne pagal skrydį." — 1-asis asmuo daugiskaita vaikui, skaitančiam vienam, ir vienintelis 1-asmens formulys modulyje (kiti hint'ai: 2-asis „Pagalvok…" arba 3-asis klausimas). → „Ne visi paukščiai skraido." (5 žodžiai; tą pačią pagalbą — skrydis nėra požymis; atsakymo „Pingvinas" ir požymių plunksnos/kiaušiniai neatskleidžia). Nauja pamoka LL-60.
│  - **Skaičiai:** `check_language.py` (modulis): 0 klaida / 0 įspėjimas / 1 info ir prieš, ir po („Jos" — aiški antecedentė iš klausimo; auditas #137 paliko). warn 0→0 (modulis buvo švarus po #144; šio radinio tipas įrankiui nematomas — ta pati situacija kaip LL-53). `validate_content.py` 0/0. `check_view.py` desktop/tablet/phone: 0 problemų, overflow 0, smallCount 0, minTaskFont 21.44/21.44/19.14, tasks 4/4, simVisibleControls 13. DOM zondas: klaidingas „Varnas" → `.task-feedback` = naujas hint'as; seno teksto puslapyje nebeliko; 0 console/page klaidų.
│  - **Įrankio akluumė:** hint'as asmenimis (kaip ir hint'o kryptis, LL-53) lieka nematomas `check_language.py` — LL-52/LL-53 šeima.
│ +
│ +## Taisymo būsena (paleidimas #149, 2026-11-08T10:36)
│ +
│ +- **#2, #3 (rimti) — užtaisyta:** `concept.example` „būna aprasojęs" → „būna užparęs"; `tasks[2].q` „aprasojo" → „užparojo".
│ +- **#7 (vidutinė) — užtaisyta:** subtitle „Vanduo neprapuola — jis keičia savo formą" → „Vanduo neišnyksta — jis keičia savo formą"; `outcomes[0]` „…neprapuola, o būna ore kaip garas." → „…neišnyksta, o būna ore kaip garas." Subtitle sinchronizuota `content/lt/grade-01/index.json:53` (metaduomenų kopija — LL-05/LL-21 šeima; be sinchronizacijos modulio kortelėje liktų nežodis).
│ +- **#8 (vidutinė) — užtaisyta:** `concept.steps[3]` „Lašai nubyra atgal į puodą." → „Lašai nubėga atgal į puodą."
│ +- **Naujas radinys (šio paleidimo fresh eyes), užtaisyta:** `concept.big_idea` antrame sakinyje buvo du dalyviniai konstrukcijai — „Šildomas jis kyla į orą, o vėsdamas vėl tampa lašais." 6–7 m. vaikui neperskaitomos (run užduoties kategorija „vertiniai"). → „Kai pakaiti, kyla į orą, o kai atvėsta, tampa lašais." (10 žodžių, be dalyvių; prasmė nepakito — abi būsenų kaitos pusės; big_idea riba 1–2 sakiniai išlaikyta).
│ +- **Skaičiai:** `check_language.py` (modulis): 0 klaida / 0 įspėjimas / 1 info → **0/0/1** (info — `tasks[0].why` „Jis ne dingo, tik pakeitė formą.", antecedentė aiški; audit modelis #9 paliko). Įspėjimų 0→0 dėl to, kad visi 5 radiniai buvo įrankio akluose (nežodžiai „aprasojęs/aprasojo", „neprapuola", retas „nubyra", dalyviniai konstrukcijai — LL-52 šeima); žmogaus akių radiniai **5 → 0**. Klasė: 0 klaida, 4 įspėjimai (kiti moduliai, buvo ir prieš darbą), 21 info. `validate_content.py --grade 1` ir be parametrų → 0/0. `check_audio.py` → 463 tekstai × 2 įrašai (Piper), exit 0.
│ +- **`check_view.py`** (local server, Brave skydų blokada `BRAVE_INIT`, desktop/tablet/phone): **prieš = po** — `checked` 3, `problems` [], `notes` [], exit 0; `overflow` 0/0/0, `smallCount` 0, `tasksVisible` 4/4, `clipped` [], `simVisibleControls` 4, `loading`/`fatal` false, console/page errors 0; `minTaskFont` 21.44 / 21.44 / 19.14 px (tekstai trumpesni, geometrija nepakito).
│ +- **DOM zondas** (`probe149_dom.py`, scratch, Chromium 1440 px, `.venv` Playwright, `google-chrome`, Brave skydų blokada): RESULT OK — 7 nauji teiginiai matomi (`subtitle`, `big_idea` ×2, `outcomes[0]` — jie yra suglaustame `<details>` „Ką suprasi", `app.js:392–394`, todėl zonde imamas `textContent`, ne `innerText`; `concept.example`, `concept.steps[3]`, `tasks[2].q`), 5 seni neberendinami (`neprapuola`, `aprasoj`, `nubyra`, `Šildomas`, `vėsdamas`), sim readout gyvas („Vandens lygis 5 iš 5 · dangtis nuimtas"), 4 užduotys, 3 outcomes, 0 console/page klaidų.
│ +- **Likę atviri:** `sim.config.words` negyvas (niekur neskaitomas) → pasiūlymas `2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json` (LL-61); sim pastabos „virs" → pasiūlymas `2026-11-08-kalbu-redaktorius-sim-virs-lašais.json`; `steps[1]` „Jo nematome" palikta (audit modelis #6 — priimtina bendrinė pastaboja); `check_language.py` nežodžių/dalyvių nemata — įrankio riba, atviras #5827 (`outcomes` vartai) ir LL-52/LL-53 šeima.
│ agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md
│ @@ -0,0 +1,68 @@
│ +# Kalbu-redaktorius — paleidimas 149 — 16-vandens-busenos
│ +
│ +- **Data:** 2026-11-08T10:36:34+02:00
│ +- **Modulis:** 16-vandens-busenos (`content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json`) — pasirinktas pagal užduoties bloką (audito #137 prasčiausias modulis: 4 radiniai).
│ +- **Pagrindas:** `research/wiki/guidelines/kalbos-auditas.md` radiniai #2, #3 (rimti), #7, #8 (vidutiniai) + šio paleidimo fresh-eyes radinys (big_idea vertiniai).
│ +
│ +## Prieš → po (formuluotės)
│ +
│ +| # | Laukas | Prieš | Po |
│ +|---|---|---|---|
│ +| 1 | subtitle (eil. 6) + index.json:53 | „Vanduo **neprapuola** — jis keičia savo formą" | „Vanduo **neišnyksta** — jis keičia savo formą" |
│ +| 2 | outcomes[0] (eil. 9) | „…išgaravęs vanduo **neprapuola**, o būna ore kaip garas." | „…išgaravęs vanduo **neišnyksta**, o būna ore kaip garas." |
│ +| 3 | concept.big_idea (eil. 15, 2 sakinys) | „…**Šildomas jis** kyla į orą, o **vėsdamas vėl** tampa lašais." | „…**Kai pakaiti, kyla** į orą, o **kai atvėsta, tampa** lašais." |
│ +| 4 | concept.example (eil. 22) | „veidrodis būna **aprasojęs**" (nežodis) | „veidrodis būna **užparęs**" |
│ +| 5 | concept.steps[3] (eil. 20) | „Lašai **nubyra** atgal į puodą." (retas žodis) | „Lašai **nubėga** atgal į puodą." |
│ +| 6 | tasks[2].q (eil. 54) | „veidrodis **aprasojo**" (nežodis) | „veidrodis **užparojo**" |
│ +
│ +Iš viso 6 vietų modulio JSON + 1 sinonchronizavimo vieta index.json (subtitle kopija — be jos modulio kortelėje liktų nežodis „neprapuola"; LL-05/LL-21 šeima). Teisingo atsakymo, `answer` indeksų (0, 1, 2, 1), variantų prasmės nepakito.
│ +
│ +## Matavimai
│ +
│ +- **check_language.py:** modulis — 0 klaida / 0 įspėjimas / 1 info → **0 / 0 / 1** (info tas pats: `tasks[0].why` „Jis ne dingo, tik pakeitė formą." — antecedentė „Vanduo" aiški; audit modelis #9 paliko). **Įspėjimai 0 → 0** dėl to, kad visi 5 radiniai buvo įrankio akluose (nežodžiai, retas žodis, dalyviniai konstrukcijai — `check_language.py` tokio netikrina, auditas #137 dokumentavo; LL-52 šeima). Žmogaus akių radiniai: **5 → 0**. Klasė: 0 klaida, 4 įspėjimai, 21 info → **0 / 4 / 21** (4 warn — 08-metu-laikai, 12-bendradarbiavimo-tiltas, 13-akmenelis-popierius ×2 — kiti moduliai, buvo ir prieš darbą).
│ +- **validate_content.py:** `--grade 1` ir be parametrų → **0 klaidų, 0 įspėjimų** (prieš ir po).
│ +- **check_view.py** (`--base http://127.0.0.1:8941/`, Brave skydų blokada `BRAVE_INIT`, desktop 1440 / tablet 1024 / phone 390): **prieš = po** — `checked` 3, `problems` [], `notes` [], exit 0. `overflow` 0/0/0, `smallCount` 0, `tasksVisible` 4/4, `clipped` [], `simVisibleControls` 4, `loading` false, `fatal` false, console/page errors 0. `minTaskFont` 21.44 / 21.44 / 19.14 px — identiškai (tekstai trumpesni, geometrija nepakito).
│ +- **check_audio.py:** 463 tekstai × 2 įrašai, Piper, exit 0. Garso nepergeneruota ir reikėjo: `generate_audio.collect()` renka tik `sim.config` + UI EXTRA tekstus (`generate_audio.py:157-175`); subtitle/outcomes/concept/tasks niekada neturi įrašų (manifest grep → 0 hitų net seni tekstai), `sim.config.words` nepakeistas.
│ +- **DOM zondas** (`probe149_dom.py`, scratch, Chromium 1440 px, `.venv` Playwright, `google-chrome`, Brave skydų blokada): **RESULT OK** — 7 nauji teiginiai matomi (`subtitle`, `big_idea` ×2, `outcomes[0]`, `concept.example`, `concept.steps[3]`, `tasks[2].q`), 5 seni neberendinami (`neprapuola`, `aprasoj`, `nubyra`, `Šildomas`, `vėsdamas`), sim readout gyvas („Vandens lygis 5 iš 5 · dangtis nuimtas"), 4 užduotys, 3 outcomes `<li>`, 0 console/page klaidų.
│ +
│ +## Sąmoningai nekeista (su priežastimi)
│ +
│ +- **`answer` indeksai, `options`, `optional`** — vaidmens riba; variantų prasmės nepakito, jie skiriasi esmiškai (garavimas / nutekėjimas / sienos / dulkės / dažai / lietus; ledas→garas/skystis/dingimas).
│ +- **4 `hint` ir 4 `why`** — aiškūs, ≤10 žodžių, nukreipia į stebėjimą, neatskleidžia atsakymo (LL-22 patikrinta).
│ +- **`tasks[0].why` 2-asis sakinys „Jis ne dingo, tik pakeitė formą."** — vienintelis `check_language` info; įvardžio antecedentė („Vanduo") aiški, audit modelis #9 visus tokius įvardžius peržiūrėjo ir paliko.
│ +- **`concept.steps[1]` „Jo nematome."** — audit modelis #6: priimtina bendrinė pastaboja („žmonės nemato"), palikta.
│ +- **`big_idea` 1-asis sakinys „…ledas, vanduo arba garas"** — „arba" čia tikrasis (bet kuris iš trijų būsenų tinka), tai ne pasirinkimo klausimas — vaidmens taisyklės „arba" atvejis neegzistuoja.
│ +- **`reflect`, `teacher.*`, `sources`, `svietimas1`** — nekeičiama pagal ribas (teacher — suaugusiojo tekstas; likę — ne kalbinio redagavimo sritis).
│ +- **`sim.component` ir `sim.config.words`** — `config.words` yra negyvas (simuliacija jo neskaito), bet tai simuliacijos/kūrėjo sritis → **pasiūlymas**, ne tiesioginis taisymas (LL-03/LL-34 šeima: nelįsti į sim logiką).
│ +- **`title`, `minutes`, `concept.title`, `outcomes[1..2]`, `tasks[].hint`** — neatitiko jau nė vienos run kategorijos (klausiamasis žodis yra, kiekiai susieti, variantai ne tapačios, dvigubo neigimo nėra).
│ +- **CSS, simuliacijos kodas, `scripts/`, kiti moduliai, 2–12 klasės** — neliesti (nė vieno išdėstymo defekto nerasta: `check_view` 0 problemų).
│ +
│ +## Nauja pamoka
│ +
│ +**LL-61 — Negyva konfigūracija: `sim.config` raktas, kurio komponentas neskaito** (`research/wiki/guidelines/pamokos.md`). Šiame modulyje `sim.config.words` niekur neskaitomas (`pasaulis.js:862` mount neturi config; faile 0 „config"/„words" atitikmenų; žodžiai kieti :859/:979/:1048-1050). LL-42 atvirkščinis atvejis: vietoj dviejų gyvų šaltinių — vienas gyvas, vienas negyvas nuo pat pradžios.
│ +
│ +## Pasiūlymai (2)
│ +
│ +1. `agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json` — `sim.config.words` negyvas (normal, struktura). Įrodymas: mount parašas, grep 0, kieti žodžiai sim'e, garso našlaičiai.
│ +2. `agents/proposals/2026-11-08-kalbu-redaktorius-sim-virs-lašais.json` — sim pastaboje „virs lašais" nestandartinė forma (low, simulacija). Įrodymas: `pasaulis.js:1082`, modulyje visur „virto".
│ +
│ +## Kliūtys / pastatymai bėgikliui
│ +
│ +1. `check_language.py` nemato nežodžių, klydų veiksmažodžio formų ir dalyvinių konstrukcijų — visi 5 šio modulio radiniai (ir big_idea vertiniai) liko įrankio akluose. Toks pats limitas kaip LL-52/LL-53 šeimoje; atviras #5827 (`outcomes` vartai).
│ +2. DOM zondo detalė: `outcomes` rendrinami suglaustame `<details>` (`app.js:392-394`), todėl `innerText` jų nemata — zonde naudojamas `textContent` (LL-31 šeima: matavimas turi atitikti tiek vaizdą, tiek DOM).
│ +3. Garso grandinė nepakito ir negalėjo: pakeisti laukai niekada nebėra tariami (collect() → tik `sim.config`), `config.words` nepakeistas.
│ +4. Darbinėje kopijoje liko run 140–145 likučiai (`kalbos-auditas.md`, `pamokos.md`, gretasienis pasiūlymas) — neliesti; prie tų pačių failų pridėti šio paleidimo įrašai.
│ +5. `git commit`/`push` nevedu — bėgiklio darbas (LL-09). Autorystės rizikų nekėlė: `git status` parodė tik 2 turinio failus (modulio JSON + `index.json` sinonchronizacijai); wiki/log/proposal/state — šio paleidimo deliverable'ai.
│ +
│ +## Touched
│ +
│ +- `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` (6 vietos: subtitle, outcomes[0], concept.big_idea, concept.example, concept.steps[3], tasks[2].q)
│ +- `content/lt/grade-01/index.json` (1 vieta: 16-vandens-busenos subtitle)
│ +- `research/wiki/guidelines/pamokos.md` (LL-61)
│ +- `research/wiki/guidelines/kalbos-auditas.md` (#149 taisymo būsena)
│ +- `agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json`
│ +- `agents/proposals/2026-11-08-kalbu-redaktorius-sim-virs-lašais.json`
│ +- `agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md` (šis failas)
│ +- `agents/state.json`
│ +
│ +2–12 klasės, kiti moduliai, `assets/css/main.css`, `assets/js/sims/*`, `scripts/*`, garso failai — neliesti.
│ profiles/ling31flash/cache/scratch/update_state149.py
│ @@ -0,0 +1,42 @@
│ +#!/usr/bin/env python3
│ +"""Atnaujina agents/state.json po kalbu-redaktorius paleidimo 149 (16-vandens-busenos)."""
│ +import json
│ +import pathlib
│ +
│ +STATE = pathlib.Path("/home/zoltanas/workspace/suprask/agents/state.json")
│ +data = json.loads(STATE.read_text(encoding="utf-8"))
│ +
│ +data["roles"]["kalbu-redaktorius"] = {
│ +    "last_run": "2026-11-08T10:36:34",
│ +    "status": "ok",
│ +    "log": "agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md",
│ +    "description": data["roles"]["kalbu-redaktorius"]["description"],
│ +    "cadence": data["roles"]["kalbu-redaktorius"]["cadence"],
│ +}
│ +
│ +data["last_language_fix"] = {
│ +    "date": "2026-11-08",
│ +    "run_id": 149,
│ +    "module": "16-vandens-busenos",
│ +    "target": "content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json",
│ +    "type": "kalbos taisymas pagal auditą #137 (radiniai #2, #3, #7, #8) + fresh-eyes big_idea vertiniai",
│ +    "what_changed": "6 vietos modulio JSON + 1 index.json sinonchronizavimo: (1) subtitle „neprapuola" → „neišnyksta" (+ index.json:53 kopija); (2) outcomes[0] „neprapuola" → „neišnyksta"; (3) concept.big_idea 2-asis sakinys „Šildomas jis kyla į orą, o vėsdamas vėl tampa lašais." → „Kai pakaiti, kyla į orą, o kai atvėsta, tampa lašais." (du dalyviniai konstrukcijai → „kai" sakiniai, 10 žodžių, prasmė nepakito); (4) concept.example „aprasojęs" → „užparęs"; (5) concept.steps[3] „nubyra" → „nubėga"; (6) tasks[2].q „aprasojo" → „užparojo". answer indeksai (0,1,2,1), options, hint'ai, why, optional, sim (component + negyvas config.words — paliktas, pasiūlymu), teacher, sources, svietimas1, reflect, title, minutes neliesti.",
│ +    "measure_before": "check_language (modulis): 0 klaida / 0 įspėjimas / 1 info (tasks[0].why „Jis ne dingo…" — aiški antecedentė); klasė: 0/4/21. validate_content --grade 1 ir visi: 0/0. check_view desktop,tablet,phone: checked 3, problems [], overflow 0/0/0, smallCount 0, tasksVisible 4/4, minTaskFont 21.44/21.44/19.14, simVisibleControls 4, clipped [], errors 0. DOM: seni tekstai gyvai puslapyje.",
│ +    "measure_after": "check_language (modulis): 0/0/1 (identiškai — visi 5 radiniai buvo įrankio akluose: nežodžiai, retas žodis, dalyviniai konstrukcijai; LL-52 šeima); žmogaus akių radiniai 5 → 0. Klasė: 0/4/21 (4 warn kituose moduliuose, buvo ir prieš). validate_content 0/0 (--grade 1 ir visi). check_view 3 plotai: rodikliai identiški prieš/po, 0 problemų, exit 0. DOM zondas probe149_dom.py (Chromium 1440, .venv Playwright, google-chrome, BRAVE_INIT): RESULT OK — 7 nauji teiginiai matomi (subtitle, big_idea ×2, outcomes[0] per <details> — textContent, example, steps[3], tasks[2].q), 5 seni neberendinami, sim readout gyvas, 4 užduotys, 3 outcomes, 0 console/page klaidų. check_audio: 463 tekstai × 2, Piper, exit 0 (pakeisti laukai garso grandinėje nebuvo — collect() renka tik sim.config).",
│ +    "verified": "validate_content.py --grade 1 ir be parametrų → 0/0; check_language.py --grade 1 → 0 klaidų, 4 warn (buvo ir prieš), 21 info; check_view.py --module 16-vandens-busenos --viewports desktop,tablet,phone → 3 patikros, 0 problemų (prieš ir po); probe149_dom.py → RESULT OK; grep neprapuola|aprasoj|nubyra content/ → 0; index.json:53 subtitle sutampa su moduliu.",
│ +    "new_lesson": "LL-61 — Negyva konfigūracija: sim.config raktas, kurio komponentas neskaito (16-vandens-busenos sim.config.words; pasaulis.js:862 mount be config, grep config|words → 0, žodžiai kieti :859/:979/:1048-1050)",
│ +    "proposals": [
│ +        "agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json (normal, struktura)",
│ +        "agents/proposals/2026-11-08-kalbu-redaktorius-sim-virs-lašais.json (low, simulacija — sim pastaboje „virs" nestandartinė forma)"
│ +    ],
│ +    "log": "agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md",
│ +    "remaining": "Modulio check_language info 1 („Jis" — aiški antecedentė, audit modelis #9 paliko). Įrankio akluomės: nežodžiai, klydos formos, dalyviniai konstrukcijai, hint'asmenis/kryptis, outcomes vartai (LL-52/LL-53 šeima; atviras #5827). Kitų modulių auditiniai radiniai (#1–#41 lentelė, išskyrus 16-vandens-busenos ir #144/#140/#147/#148 užtaisytus) — kitiems paleidimams. Sim dead config ir „virs" — atviri pasiūlymai (simuliacijų inžinieriaus/kūrėjo sprendimas).",
│ +    "concurrency": "Darbinėje kopijoje liko run 140–145 likučiai (kalbos-auditas.md, pamokos.md, gretasienis pasiūlymas) — neliesti; prie tų pačių failų pridėti šio paleidimo įrašai. Paleidimo metu git status rodė tik 2 modifikuotus turinio failus (modulio JSON + index.json subtitle).",
│ +    "notes": "Garso nepergeneruota: pakeisti laukai (subtitle, outcomes, concept.*, tasks[2].q) niekada neturi įrašų — generate_audio.collect() renka tik sim.config raktus (generate_audio.py:157-175), o config.words paliktas (negyvas — pasiūlymas, ne mano sritis). index.json subtitle sinchronizuotas (be jo modulio kortelėje liktų „neprapuola"). check_view matuotas prieš ir po — identiškai (tekstas trumpesnis, geometrija nepakito). agents/state.json yra .gitignore; ataskaita agents/log/*.md — tracked (#484).",
│ +    "touched": "content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json (6 vietos); content/lt/grade-01/index.json (1 vieta); research/wiki/guidelines/pamokos.md (LL-61); research/wiki/guidelines/kalbos-auditas.md (#149 įrašas); agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json; agents/proposals/2026-11-08-kalbu-redaktorius-sim-virs-lašais.json; agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md; agents/state.json"
│ +}
│ +
│ +data["updated"] = "2026-11-08T10:36:34"
│ +
│ +STATE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
│ +print("state.json updated: roles.kalbu-redaktorius, last_language_fix (run 149), updated")
│ profiles/ling31flash/cache/scratch/update_state149.py
│ @@ -3,40 +3,40 @@
│  import json
│  import pathlib
│
│ -STATE = pathlib.Path("/home/zoltanas/workspace/suprask/agents/state.json")
│ -data = json.loads(STATE.read_text(encoding="utf-8"))
│ +STATE = pathlib.Path('/home/zoltanas/workspace/suprask/agents/state.json')
│ +data = json.loads(STATE.read_text(encoding='utf-8'))
│
│ -data["roles"]["kalbu-redaktorius"] = {
│ -    "last_run": "2026-11-08T10:36:34",
│ -    "status": "ok",
│ -    "log": "agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md",
│ -    "description": data["roles"]["kalbu-redaktorius"]["description"],
│ -    "cadence": data["roles"]["kalbu-redaktorius"]["cadence"],
│ +data['roles']['kalbu-redaktorius'] = {
│ +    'last_run': '2026-11-08T10:36:34',
│ +    'status': 'ok',
│ +    'log': 'agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md',
│ +    'description': data['roles']['kalbu-redaktorius']['description'],
│ +    'cadence': data['roles']['kalbu-redaktorius']['cadence'],
│  }
│
│ -data["last_language_fix"] = {
│ -    "date": "2026-11-08",
│ -    "run_id": 149,
│ -    "module": "16-vandens-busenos",
│ -    "target": "content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json",
│ -    "type": "kalbos taisymas pagal auditą #137 (radiniai #2, #3, #7, #8) + fresh-eyes big_idea vertiniai",
│ -    "what_changed": "6 vietos modulio JSON + 1 index.json sinonchronizavimo: (1) subtitle „neprapuola" → „neišnyksta" (+ index.json:53 kopija); (2) outcomes[0] „neprapuola" → „neišnyksta"; (3) concept.big_idea 2-asis sakinys „Šildomas jis kyla į orą, o vėsdamas vėl tampa lašais." → „Kai pakaiti, kyla į orą, o kai atvėsta, tampa lašais." (du dalyviniai konstrukcijai → „kai" sakiniai, 10 žodžių, prasmė nepakito); (4) concept.example „aprasojęs" → „užparęs"; (5) concept.steps[3] „nubyra" → „nubėga"; (6) tasks[2].q „aprasojo" → „užparojo". answer indeksai (0,1,2,1), options, hint'ai, why, optional, sim (component + negyvas config.words — paliktas, pasiūlymu), teacher, sources, svietimas1, reflect, title, minutes neliesti.",
│ -    "measure_before": "check_language (modulis): 0 klaida / 0 įspėjimas / 1 info (tasks[0].why „Jis ne dingo…" — aiški antecedentė); klasė: 0/4/21. validate_content --grade 1 ir visi: 0/0. check_view desktop,tablet,phone: checked 3, problems [], overflow 0/0/0, smallCount 0, tasksVisible 4/4, minTaskFont 21.44/21.44/19.14, simVisibleControls 4, clipped [], errors 0. DOM: seni tekstai gyvai puslapyje.",
│ -    "measure_after": "check_language (modulis): 0/0/1 (identiškai — visi 5 radiniai buvo įrankio akluose: nežodžiai, retas žodis, dalyviniai konstrukcijai; LL-52 šeima); žmogaus akių radiniai 5 → 0. Klasė: 0/4/21 (4 warn kituose moduliuose, buvo ir prieš). validate_content 0/0 (--grade 1 ir visi). check_view 3 plotai: rodikliai identiški prieš/po, 0 problemų, exit 0. DOM zondas probe149_dom.py (Chromium 1440, .venv Playwright, google-chrome, BRAVE_INIT): RESULT OK — 7 nauji teiginiai matomi (subtitle, big_idea ×2, outcomes[0] per <details> — textContent, example, steps[3], tasks[2].q), 5 seni neberendinami, sim readout gyvas, 4 užduotys, 3 outcomes, 0 console/page klaidų. check_audio: 463 tekstai × 2, Piper, exit 0 (pakeisti laukai garso grandinėje nebuvo — collect() renka tik sim.config).",
│ -    "verified": "validate_content.py --grade 1 ir be parametrų → 0/0; check_language.py --grade 1 → 0 klaidų, 4 warn (buvo ir prieš), 21 info; check_view.py --module 16-vandens-busenos --viewports desktop,tablet,phone → 3 patikros, 0 problemų (prieš ir po); probe149_dom.py → RESULT OK; grep neprapuola|aprasoj|nubyra content/ → 0; index.json:53 subtitle sutampa su moduliu.",
│ -    "new_lesson": "LL-61 — Negyva konfigūracija: sim.config raktas, kurio komponentas neskaito (16-vandens-busenos sim.config.words; pasaulis.js:862 mount be config, grep config|words → 0, žodžiai kieti :859/:979/:1048-1050)",
│ -    "proposals": [
│ -        "agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json (normal, struktura)",
│ -        "agents/proposals/2026-11-08-kalbu-redaktorius-sim-virs-lašais.json (low, simulacija — sim pastaboje „virs" nestandartinė forma)"
│ +data['last_language_fix'] = {
│ +    'date': '2026-11-08',
│ +    'run_id': 149,
│ +    'module': '16-vandens-busenos',
│ +    'target': 'content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json',
│ +    'type': 'kalbos taisymas pagal auditą #137 (radiniai #2, #3, #7, #8) + fresh-eyes big_idea vertiniai',
│ +    'what_changed': '6 vietos modulio JSON + 1 index.json sinonchronizavimo: (1) subtitle „neprapuola" → „neišnyksta" (+ index.json:53 kopija); (2) outcomes[0] „neprapuola" → „neišnyksta"; (3) concept.big_idea 2-asis sakinys „Šildomas jis kyla į orą, o vėsdamas vėl tampa lašais." → „Kai pakaiti, kyla į orą, o kai atvėsta, tampa lašais." (du dalyviniai konstrukcijai → „kai" sakiniai, 10 žodžių, prasmė nepakito); (4) concept.example „aprasojęs" → „užparęs"; (5) concept.steps[3] „nubyra" → „nubėga"; (6) tasks[2].q „aprasojo" → „užparojo". answer indeksai (0,1,2,1), options, hint'ai, why, optional, sim (component + negyvas config.words — paliktas, pasiūlymu), teacher, sources, svietimas1, reflect, title, minutes neliesti.',
│ +    'measure_before': 'check_language (modulis): 0 klaida / 0 įspėjimas / 1 info (tasks[0].why „Jis ne dingo…" — aiški antecedentė); klasė: 0/4/21. validate_content --grade 1 ir visi: 0/0. check_view desktop,tablet,phone: checked 3, problems [], overflow 0/0/0, smallCount 0, tasksVisible 4/4, minTaskFont 21.44/21.44/19.14, simVisibleControls 4, clipped [], errors 0.',
│ +    'measure_after': 'check_language (modulis): 0/0/1 (identiškai — visi 5 radiniai buvo įrankio akluose: nežodžiai, retas žodis, dalyviniai konstrukcijai; LL-52 šeima); žmogaus akių radiniai 5 → 0. Klasė: 0/4/21 (4 warn kituose moduliuose, buvo ir prieš). validate_content 0/0 (--grade 1 ir visi). check_view 3 plotai: rodikliai identiški prieš/po, 0 problemų, exit 0. DOM zondas probe149_dom.py (Chromium 1440, .venv Playwright, google-chrome, BRAVE_INIT): RESULT OK — 7 nauji teiginiai matomi (subtitle, big_idea ×2, outcomes[0] per <details> — textContent, example, steps[3], tasks[2].q), 5 seni neberendinami, sim readout gyvas, 4 užduotys, 3 outcomes, 0 console/page klaidų. check_audio: 463 tekstai × 2, Piper, exit 0 (pakeisti laukai garso grandinėje nebuvo — collect() renka tik sim.config).',
│ +    'verified': 'validate_content.py --grade 1 ir be parametrų → 0/0; check_language.py --grade 1 → 0 klaidų, 4 warn (buvo ir prieš), 21 info; check_view.py --module 16-vandens-busenos --viewports desktop,tablet,phone → 3 patikros, 0 problemų (prieš ir po); probe149_dom.py → RESULT OK; grep neprapuola|aprasoj|nubyra content/ → 0; index.json:53 subtitle sutampa su moduliu.',
│ +    'new_lesson': 'LL-61 — Negyva konfigūracija: sim.config raktas, kurio komponentas neskaito (16-vandens-busenos sim.config.words; pasaulis.js:862 mount be config, grep config|words → 0, žodžiai kieti :859/:979/:1048-1050)',
│ +    'proposals': [
│ +        'agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json (normal, struktura)',
│ +        'agents/proposals/2026-11-08-kalbu-redaktorius-sim-virs-lašais.json (low, simulacija — sim pastaboje „virs" nestandartinė forma)'
│      ],
│ -    "log": "agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md",
│ -    "remaining": "Modulio check_language info 1 („Jis" — aiški antecedentė, audit modelis #9 paliko). Įrankio akluomės: nežodžiai, klydos formos, dalyviniai konstrukcijai, hint'asmenis/kryptis, outcomes vartai (LL-52/LL-53 šeima; atviras #5827). Kitų modulių auditiniai radiniai (#1–#41 lentelė, išskyrus 16-vandens-busenos ir #144/#140/#147/#148 užtaisytus) — kitiems paleidimams. Sim dead config ir „virs" — atviri pasiūlymai (simuliacijų inžinieriaus/kūrėjo sprendimas).",
│ -    "concurrency": "Darbinėje kopijoje liko run 140–145 likučiai (kalbos-auditas.md, pamokos.md, gretasienis pasiūlymas) — neliesti; prie tų pačių failų pridėti šio paleidimo įrašai. Paleidimo metu git status rodė tik 2 modifikuotus turinio failus (modulio JSON + index.json subtitle).",
│ -    "notes": "Garso nepergeneruota: pakeisti laukai (subtitle, outcomes, concept.*, tasks[2].q) niekada neturi įrašų — generate_audio.collect() renka tik sim.config raktus (generate_audio.py:157-175), o config.words paliktas (negyvas — pasiūlymas, ne mano sritis). index.json subtitle sinchronizuotas (be jo modulio kortelėje liktų „neprapuola"). check_view matuotas prieš ir po — identiškai (tekstas trumpesnis, geometrija nepakito). agents/state.json yra .gitignore; ataskaita agents/log/*.md — tracked (#484).",
│ -    "touched": "content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json (6 vietos); content/lt/grade-01/index.json (1 vieta); research/wiki/guidelines/pamokos.md (LL-61); research/wiki/guidelines/kalbos-auditas.md (#149 įrašas); agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json; agents/proposals/2026-11-08-kalbu-redaktorius-sim-virs-lašais.json; agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md; agents/state.json"
│ +    'log': 'agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md',
│ +    'remaining': 'Modulio check_language info 1 („Jis" — aiški antecedentė, audit modelis #9 paliko). Įrankio akluomės: nežodžiai, klydos formos, dalyviniai konstrukcijai, hint'asmenis/kryptis, outcomes vartai (LL-52/LL-53 šeima; atviras #5827). Kitų modulių auditiniai radiniai (#1–#41 lentelė, išskyrus 16-vandens-busenos ir #144/#140/#147/#148 užtaisytus) — kitiems paleidimams. Sim dead config ir „virs" — atviri pasiūlymai (simuliacijų inžinieriaus/kūrėjo sprendimas).',
│ +    'concurrency': 'Darbinėje kopijoje liko run 140–145 likučiai (kalbos-auditas.md, pamokos.md, gretasienis pasiūlymas) — neliesti; prie tų pačių failų pridėti šio paleidimo įrašai. Paleidimo metu git status rodė tik 2 modifikuotus turinio failus (modulio JSON + index.json subtitle).',
│ +    'notes': 'Garso nepergeneruota: pakeisti laukai (subtitle, outcomes, concept.*, tasks[2].q) niekada neturi įrašų — generate_audio.collect() renka tik sim.config raktus (generate_audio.py:157-175), o config.words paliktas (negyvas — pasiūlymas, ne mano sritis). index.json subtitle sinchronizuotas (be jo modulio kortelėje liktų „neprapuola"). check_view matuotas prieš ir po — identiškai (tekstas trumpesnis, geometrija nepakijo). agents/state.json yra .gitignore; ataskaita agents/log/*.md — tracked (#484).',
│ +    'touched': 'content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json (6 vietos); content/lt/grade-01/index.json (1 vieta); research/wiki/guidelines/pamokos.md (LL-61); research/wiki/guidelines/kalbos-auditas.md (#149 įrašas); agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json; agents/proposals/2026-11-08-kalbu-redaktorius-sim-virs-lašais.json; agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md; agents/state.json'
│  }
│
│ -data["updated"] = "2026-11-08T10:36:34"
│ +data['updated'] = '2026-11-08T10:36:34'
│
│ -STATE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
│ -print("state.json updated: roles.kalbu-redaktorius, last_language_fix (run 149), updated")
│ +STATE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
│ +print('state.json updated: roles.kalbu-redaktorius, last_language_fix (run 149), updated')
│ profiles/ling31flash/cache/scratch/update_state149.py
│ @@ -7,36 +7,36 @@
│  data = json.loads(STATE.read_text(encoding='utf-8'))
│
│  data['roles']['kalbu-redaktorius'] = {
│ -    'last_run': '2026-11-08T10:36:34',
│ -    'status': 'ok',
│ -    'log': 'agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md',
│ -    'description': data['roles']['kalbu-redaktorius']['description'],
│ -    'cadence': data['roles']['kalbu-redaktorius']['cadence'],
│ +    "last_run": "2026-11-08T10:36:34",
│ +    "status": "ok",
│ +    "log": "agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md",
│ +    "description": data['roles']['kalbu-redaktorius']['description'],
│ +    "cadence": data['roles']['kalbu-redaktorius']['cadence'],
│  }
│
│  data['last_language_fix'] = {
│ -    'date': '2026-11-08',
│ -    'run_id': 149,
│ -    'module': '16-vandens-busenos',
│ -    'target': 'content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json',
│ -    'type': 'kalbos taisymas pagal auditą #137 (radiniai #2, #3, #7, #8) + fresh-eyes big_idea vertiniai',
│ -    'what_changed': '6 vietos modulio JSON + 1 index.json sinonchronizavimo: (1) subtitle „neprapuola" → „neišnyksta" (+ index.json:53 kopija); (2) outcomes[0] „neprapuola" → „neišnyksta"; (3) concept.big_idea 2-asis sakinys „Šildomas jis kyla į orą, o vėsdamas vėl tampa lašais." → „Kai pakaiti, kyla į orą, o kai atvėsta, tampa lašais." (du dalyviniai konstrukcijai → „kai" sakiniai, 10 žodžių, prasmė nepakito); (4) concept.example „aprasojęs" → „užparęs"; (5) concept.steps[3] „nubyra" → „nubėga"; (6) tasks[2].q „aprasojo" → „užparojo". answer indeksai (0,1,2,1), options, hint'ai, why, optional, sim (component + negyvas config.words — paliktas, pasiūlymu), teacher, sources, svietimas1, reflect, title, minutes neliesti.',
│ -    'measure_before': 'check_language (modulis): 0 klaida / 0 įspėjimas / 1 info (tasks[0].why „Jis ne dingo…" — aiški antecedentė); klasė: 0/4/21. validate_content --grade 1 ir visi: 0/0. check_view desktop,tablet,phone: checked 3, problems [], overflow 0/0/0, smallCount 0, tasksVisible 4/4, minTaskFont 21.44/21.44/19.14, simVisibleControls 4, clipped [], errors 0.',
│ -    'measure_after': 'check_language (modulis): 0/0/1 (identiškai — visi 5 radiniai buvo įrankio akluose: nežodžiai, retas žodis, dalyviniai konstrukcijai; LL-52 šeima); žmogaus akių radiniai 5 → 0. Klasė: 0/4/21 (4 warn kituose moduliuose, buvo ir prieš). validate_content 0/0 (--grade 1 ir visi). check_view 3 plotai: rodikliai identiški prieš/po, 0 problemų, exit 0. DOM zondas probe149_dom.py (Chromium 1440, .venv Playwright, google-chrome, BRAVE_INIT): RESULT OK — 7 nauji teiginiai matomi (subtitle, big_idea ×2, outcomes[0] per <details> — textContent, example, steps[3], tasks[2].q), 5 seni neberendinami, sim readout gyvas, 4 užduotys, 3 outcomes, 0 console/page klaidų. check_audio: 463 tekstai × 2, Piper, exit 0 (pakeisti laukai garso grandinėje nebuvo — collect() renka tik sim.config).',
│ -    'verified': 'validate_content.py --grade 1 ir be parametrų → 0/0; check_language.py --grade 1 → 0 klaidų, 4 warn (buvo ir prieš), 21 info; check_view.py --module 16-vandens-busenos --viewports desktop,tablet,phone → 3 patikros, 0 problemų (prieš ir po); probe149_dom.py → RESULT OK; grep neprapuola|aprasoj|nubyra content/ → 0; index.json:53 subtitle sutampa su moduliu.',
│ -    'new_lesson': 'LL-61 — Negyva konfigūracija: sim.config raktas, kurio komponentas neskaito (16-vandens-busenos sim.config.words; pasaulis.js:862 mount be config, grep config|words → 0, žodžiai kieti :859/:979/:1048-1050)',
│ -    'proposals': [
│ -        'agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json (normal, struktura)',
│ -        'agents/proposals/2026-11-08-kalbu-redaktorius-sim-virs-lašais.json (low, simulacija — sim pastaboje „virs" nestandartinė forma)'
│ +    "date": "2026-11-08",
│ +    "run_id": 149,
│ +    "module": "16-vandens-busenos",
│ +    "target": "content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json",
│ +    "type": "kalbos taisymas pagal auditą #137 (radiniai #2, #3, #7, #8) + fresh-eyes big_idea vertiniai",
│ +    "what_changed": """6 vietos modulio JSON + 1 index.json sinonchronizavimo: (1) subtitle „neprapuola" → „neišnyksta" (+ index.json:53 kopija); (2) outcomes[0] „neprapuola" → „neišnyksta"; (3) concept.big_idea 2-asis sakinys „Šildomas jis kyla į orą, o vėsdamas vėl tampa lašais." → „Kai pakaiti, kyla į orą, o kai atvėsta, tampa lašais." (du dalyviniai konstrukcijai → „kai" sakiniai, 10 žodžių, prasmė nepakito); (4) concept.example „aprasojęs" → „užparęs"; (5) concept.steps[3] „nubyra" → „nubėga"; (6) tasks[2].q „aprasojo" → „užparojo". answer indeksai (0,1,2,1), options, hint'ai, why, optional, sim (component + negyvas config.words — paliktas, pasiūlymu), teacher, sources, svietimas1, reflect, title, minutes neliesti.""",
│ +    "measure_before": """check_language (modulis): 0 klaida / 0 įspėjimas / 1 info (tasks[0].why „Jis ne dingo…" — aiški antecedentė); klasė: 0/4/21. validate_content --grade 1 ir visi: 0/0. check_view desktop,tablet,phone: checked 3, problems [], overflow 0/0/0, smallCount 0, tasksVisible 4/4, minTaskFont 21.44/21.44/19.14, simVisibleControls 4, clipped [], errors 0.""",
│ +    "measure_after": """check_language (modulis): 0/0/1 (identiškai — visi 5 radiniai buvo įrankio akluose: nežodžiai, retas žodis, dalyviniai konstrukcijai; LL-52 šeima); žmogaus akių radiniai 5 → 0. Klasė: 0/4/21 (4 warn kituose moduliuose, buvo ir prieš). validate_content 0/0 (--grade 1 ir visi). check_view 3 plotai: rodikliai identiški prieš/po, 0 problemų, exit 0. DOM zondas probe149_dom.py (Chromium 1440, .venv Playwright, google-chrome, BRAVE_INIT): RESULT OK — 7 nauji teiginiai matomi (subtitle, big_idea ×2, outcomes[0] per <details> — textContent, example, steps[3], tasks[2].q), 5 seni neberendinami, sim readout gyvas, 4 užduotys, 3 outcomes, 0 console/page klaidų. check_audio: 463 tekstai × 2, Piper, exit 0 (pakeisti laukai garso grandinėje nebuvo — collect() renka tik sim.config).""",
│ +    "verified": """validate_content.py --grade 1 ir be parametrų → 0/0; check_language.py --grade 1 → 0 klaidų, 4 warn (buvo ir prieš), 21 info; check_view.py --module 16-vandens-busenos --viewports desktop,tablet,phone → 3 patikros, 0 problemų (prieš ir po); probe149_dom.py → RESULT OK; grep neprapuola|aprasoj|nubyra content/ → 0; index.json:53 subtitle sutampa su moduliu.""",
│ +    "new_lesson": "LL-61 — Negyva konfigūracija: sim.config raktas, kurio komponentas neskaito (16-vandens-busenos sim.config.words; pasaulis.js:862 mount be config, grep config|words → 0, žodžiai kieti :859/:979/:1048-1050)",
│ +    "proposals": [
│ +        "agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json (normal, struktura)",
│ +        "agents/proposals/2026-11-08-kalbu-redaktorius-sim-virs-lašais.json (low, simulacija — sim pastaboje „virs" nestandartinė forma)"
│      ],
│ -    'log': 'agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md',
│ -    'remaining': 'Modulio check_language info 1 („Jis" — aiški antecedentė, audit modelis #9 paliko). Įrankio akluomės: nežodžiai, klydos formos, dalyviniai konstrukcijai, hint'asmenis/kryptis, outcomes vartai (LL-52/LL-53 šeima; atviras #5827). Kitų modulių auditiniai radiniai (#1–#41 lentelė, išskyrus 16-vandens-busenos ir #144/#140/#147/#148 užtaisytus) — kitiems paleidimams. Sim dead config ir „virs" — atviri pasiūlymai (simuliacijų inžinieriaus/kūrėjo sprendimas).',
│ -    'concurrency': 'Darbinėje kopijoje liko run 140–145 likučiai (kalbos-auditas.md, pamokos.md, gretasienis pasiūlymas) — neliesti; prie tų pačių failų pridėti šio paleidimo įrašai. Paleidimo metu git status rodė tik 2 modifikuotus turinio failus (modulio JSON + index.json subtitle).',
│ -    'notes': 'Garso nepergeneruota: pakeisti laukai (subtitle, outcomes, concept.*, tasks[2].q) niekada neturi įrašų — generate_audio.collect() renka tik sim.config raktus (generate_audio.py:157-175), o config.words paliktas (negyvas — pasiūlymas, ne mano sritis). index.json subtitle sinchronizuotas (be jo modulio kortelėje liktų „neprapuola"). check_view matuotas prieš ir po — identiškai (tekstas trumpesnis, geometrija nepakijo). agents/state.json yra .gitignore; ataskaita agents/log/*.md — tracked (#484).',
│ -    'touched': 'content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json (6 vietos); content/lt/grade-01/index.json (1 vieta); research/wiki/guidelines/pamokos.md (LL-61); research/wiki/guidelines/kalbos-auditas.md (#149 įrašas); agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json; agents/proposals/2026-11-08-kalbu-redaktorius-sim-virs-lašais.json; agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md; agents/state.json'
│ +    "log": "agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md",
│ +    "remaining": """Modulio check_language info 1 („Jis" — aiški antecedentė, audit modelis #9 paliko). Įrankio akluomės: nežodžiai, klydos formos, dalyviniai konstrukcijai, hint'o asmuo/kryptis, outcomes vartai (LL-52/LL-53 šeima; atviras #5827). Kitų modulių auditiniai radiniai (#1–#41 lentelė, išskyrus 16-vandens-busenos ir #144/#140/#147/#148 užtaisytus) — kitiems paleidimams. Sim dead config ir „virs" — atviri pasiūlymai (simuliacijų inžinieriaus/kūrėjo sprendimas).""",
│ +    "concurrency": """Darbinėje kopijoje liko run 140–145 likučiai (kalbos-auditas.md, pamokos.md, gretasienis pasiūlymas) — neliesti; prie tų pačių failų pridėti šio paleidimo įrašai. Paleidimo metu git status rodė tik 2 modifikuotus turinio failus (modulio JSON + index.json subtitle).""",
│ +    "notes": """Garso nepergeneruota: pakeisti laukai (subtitle, outcomes, concept.*, tasks[2].q) niekada neturi įrašų — generate_audio.collect() renka tik sim.config raktus (generate_audio.py:157-175), o config.words paliktas (negyvas — pasiūlymas, ne mano sritis). index.json subtitle sinchronizuotas (be jo modulio kortelėje liktų „neprapuola"). check_view matuotas prieš ir po — identiškai (tekstas trumpesnis, geometrija nepakijo). agents/state.json yra .gitignore; ataskaita agents/log/*.md — tracked (#484).""",
│ +    "touched": "content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json (6 vietos); content/lt/grade-01/index.json (1 vieta); research/wiki/guidelines/pamokos.md (LL-61); research/wiki/guidelines/kalbos-auditas.md (#149 įrašas); agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json; agents/proposals/2026-11-08-kalbu-redaktorius-sim-virs-lašais.json; agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md; agents/state.json"
│  }
│
│ -data['updated'] = '2026-11-08T10:36:34'
│ +data['updated'] = "2026-11-08T10:36:34"
│
│  STATE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
│  print('state.json updated: roles.kalbu-redaktorius, last_language_fix (run 149), updated')
│ profiles/ling31flash/cache/scratch/update_state149.py
│ @@ -19,21 +19,21 @@
│      "run_id": 149,
│      "module": "16-vandens-busenos",
│      "target": "content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json",
│ -    "type": "kalbos taisymas pagal auditą #137 (radiniai #2, #3, #7, #8) + fresh-eyes big_idea vertiniai",
│ +    "type": """kalbos taisymas pagal auditą #137 (radiniai #2, #3, #7, #8) + fresh-eyes big_idea vertiniai""",
│      "what_changed": """6 vietos modulio JSON + 1 index.json sinonchronizavimo: (1) subtitle „neprapuola" → „neišnyksta" (+ index.json:53 kopija); (2) outcomes[0] „neprapuola" → „neišnyksta"; (3) concept.big_idea 2-asis sakinys „Šildomas jis kyla į orą, o vėsdamas vėl tampa lašais." → „Kai pakaiti, kyla į orą, o kai atvėsta, tampa lašais." (du dalyviniai konstrukcijai → „kai" sakiniai, 10 žodžių, prasmė nepakito); (4) concept.example „aprasojęs" → „užparęs"; (5) concept.steps[3] „nubyra" → „nubėga"; (6) tasks[2].q „aprasojo" → „užparojo". answer indeksai (0,1,2,1), options, hint'ai, why, optional, sim (component + negyvas config.words — paliktas, pasiūlymu), teacher, sources, svietimas1, reflect, title, minutes neliesti.""",
│      "measure_before": """check_language (modulis): 0 klaida / 0 įspėjimas / 1 info (tasks[0].why „Jis ne dingo…" — aiški antecedentė); klasė: 0/4/21. validate_content --grade 1 ir visi: 0/0. check_view desktop,tablet,phone: checked 3, problems [], overflow 0/0/0, smallCount 0, tasksVisible 4/4, minTaskFont 21.44/21.44/19.14, simVisibleControls 4, clipped [], errors 0.""",
│      "measure_after": """check_language (modulis): 0/0/1 (identiškai — visi 5 radiniai buvo įrankio akluose: nežodžiai, retas žodis, dalyviniai konstrukcijai; LL-52 šeima); žmogaus akių radiniai 5 → 0. Klasė: 0/4/21 (4 warn kituose moduliuose, buvo ir prieš). validate_content 0/0 (--grade 1 ir visi). check_view 3 plotai: rodikliai identiški prieš/po, 0 problemų, exit 0. DOM zondas probe149_dom.py (Chromium 1440, .venv Playwright, google-chrome, BRAVE_INIT): RESULT OK — 7 nauji teiginiai matomi (subtitle, big_idea ×2, outcomes[0] per <details> — textContent, example, steps[3], tasks[2].q), 5 seni neberendinami, sim readout gyvas, 4 užduotys, 3 outcomes, 0 console/page klaidų. check_audio: 463 tekstai × 2, Piper, exit 0 (pakeisti laukai garso grandinėje nebuvo — collect() renka tik sim.config).""",
│      "verified": """validate_content.py --grade 1 ir be parametrų → 0/0; check_language.py --grade 1 → 0 klaidų, 4 warn (buvo ir prieš), 21 info; check_view.py --module 16-vandens-busenos --viewports desktop,tablet,phone → 3 patikros, 0 problemų (prieš ir po); probe149_dom.py → RESULT OK; grep neprapuola|aprasoj|nubyra content/ → 0; index.json:53 subtitle sutampa su moduliu.""",
│ -    "new_lesson": "LL-61 — Negyva konfigūracija: sim.config raktas, kurio komponentas neskaito (16-vandens-busenos sim.config.words; pasaulis.js:862 mount be config, grep config|words → 0, žodžiai kieti :859/:979/:1048-1050)",
│ +    "new_lesson": """LL-61 — Negyva konfigūracija: sim.config raktas, kurio komponentas neskaito (16-vandens-busenos sim.config.words; pasaulis.js:862 mount be config, grep config|words → 0, žodžiai kieti :859/:979/:1048-1050)""",
│      "proposals": [
│ -        "agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json (normal, struktura)",
│ -        "agents/proposals/2026-11-08-kalbu-redaktorius-sim-virs-lašais.json (low, simulacija — sim pastaboje „virs" nestandartinė forma)"
│ +        """agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json (normal, struktura)""",
│ +        """agents/proposals/2026-11-08-kalbu-redaktorius-sim-virs-lašais.json (low, simulacija — sim pastaboje „virs" nestandartinė forma)"""
│      ],
│      "log": "agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md",
│      "remaining": """Modulio check_language info 1 („Jis" — aiški antecedentė, audit modelis #9 paliko). Įrankio akluomės: nežodžiai, klydos formos, dalyviniai konstrukcijai, hint'o asmuo/kryptis, outcomes vartai (LL-52/LL-53 šeima; atviras #5827). Kitų modulių auditiniai radiniai (#1–#41 lentelė, išskyrus 16-vandens-busenos ir #144/#140/#147/#148 užtaisytus) — kitiems paleidimams. Sim dead config ir „virs" — atviri pasiūlymai (simuliacijų inžinieriaus/kūrėjo sprendimas).""",
│      "concurrency": """Darbinėje kopijoje liko run 140–145 likučiai (kalbos-auditas.md, pamokos.md, gretasienis pasiūlymas) — neliesti; prie tų pačių failų pridėti šio paleidimo įrašai. Paleidimo metu git status rodė tik 2 modifikuotus turinio failus (modulio JSON + index.json subtitle).""",
│      "notes": """Garso nepergeneruota: pakeisti laukai (subtitle, outcomes, concept.*, tasks[2].q) niekada neturi įrašų — generate_audio.collect() renka tik sim.config raktus (generate_audio.py:157-175), o config.words paliktas (negyvas — pasiūlymas, ne mano sritis). index.json subtitle sinchronizuotas (be jo modulio kortelėje liktų „neprapuola"). check_view matuotas prieš ir po — identiškai (tekstas trumpesnis, geometrija nepakijo). agents/state.json yra .gitignore; ataskaita agents/log/*.md — tracked (#484).""",
│ -    "touched": "content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json (6 vietos); content/lt/grade-01/index.json (1 vieta); research/wiki/guidelines/pamokos.md (LL-61); research/wiki/guidelines/kalbos-auditas.md (#149 įrašas); agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json; agents/proposals/2026-11-08-kalbu-redaktorius-sim-virs-lašais.json; agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md; agents/state.json"
│ +    "touched": """content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json (6 vietos); content/lt/grade-01/index.json (1 vieta); research/wiki/guidelines/pamokos.md (LL-61); research/wiki/guidelines/kalbos-auditas.md (#149 įrašas); agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json; agents/proposals/2026-11-08-kalbu-redaktorius-sim-virs-lašais.json; agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md; agents/state.json"""
│  }
│
│  data['updated'] = "2026-11-08T10:36:34"
Paleidimas 149 baigtas. Modulis **16-vandens-busenos** — 6 formuluočių vietos pakeistos, visos patikros žalios.

**Prieš → po:**
1. subtitle: „Vanduo **neprapuola**" → „Vanduo **neišnyksta**" (+ sinonchronizavau `index.json:53` kopiją — be to modulio kortelėje liktų nežodis)
2. outcomes[0]: „…vanduo **neprapuola**…" → „…vanduo **neišnyksta**…"
3. concept.big_idea: „**Šildomas** jis kyla… o **vėsdamas** tampa" (du dalyviniai konstrukcijai — 6–7 m. vaikui neperskaitomi) → „**Kai pakaiti, kyla** į orą, o **kai atvėsta, tampa** lašais" (10 žodžių, prasmė nepakito)
4. concept.example: „būna **aprasojęs**" (nežodis) → „būna **užparęs**"
5. concept.steps[3]: „Lašai **nubyra**" (retas) → „Lašai **nubėga**"
6. tasks[2].q: „veidrodis **aprasojo**" (nežodis) → „veidrodis **užparojo**"

**Matavimai:** check_language — modulis 0 klaida/0 įspėjimas/1 info → 0/0/1 (įspėjimai 0→0, nes visi 5 audit radiniai buvo įrankio akluose — nežodžius/dalyvius jis nemato; žmogaus akių radiniai 5→0); klasė 0/4/21 nepakito (4 warn kituose moduliuose, buvo ir prieš). validate_content 0/0 (--grade 1 ir visi). check_view desktop/tablet/phone: prieš = po — overflow 0/0/0, smallCount 0, tasks 4/4, minTaskFont 21.44/21.44/19.14, 0 problemų, console errors 0. check_audio 463×2 Piper. DOM zondas (Brave skydų blokada): 7 nauji teiginiai matomi, 5 seni neberendinami, sim readout gyvas, RESULT OK. Garso nereikėjo pergeneruoti — pakeisti laukai niekada neturi įrašų (collect() renka tik sim.config).

**Nauja pamoka LL-61** (pamokos.md): negyva `sim.config` — šio modulio `sim.config.words` niekur neskaitomas (`pasaulis.js:862` mount be config, grep → 0, žodžiai kieti :859/:979/:1048-1050). Užregistruota 2 pasiūlymais: dead config (normal) ir sim pastabos „virs lašais" nestandartinė forma (low).

**Sąmoningai nekeista:** answer indeksai/variantai/hint'ai/why (aiškūs, LL-22 patikrinta), tasks[0].why „Jis ne dingo…" (info — antecedentė aiški, audit modelis #9), steps[1] „Jo nematome" (audit modelis #6), big_idea „arba" (tikra enumeracija), teacher/sources/svietimas1, sim kodas (dead config — pasiūlymu, ne tiesioginis taisymas).

**Bėgikliui:** mano turinio pakeitimai jau atsidūrė HEAD commit'e e626657 („kalbu-redaktorius: atgal į deepseek41flash" — žinutės modelio teksto, ne pakeitimų, #5190 atviras); darbo medyje liko nekomituoti wiki įrašai, 2 pasiūlymai, ataskaita (agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md) ir state.json. `agents/scope.json` modifikuotas kito agento — neliestas. Commit/push nevedu (LL-09).

## klaidos

```
session_id: local-c3d9d90615c7c115f4edaf4412470a2a78089faaa6d6fabef2f2855eafef96e7
```
