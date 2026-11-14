# metodininkas — 2026-11-14T0823

- paleidimas: #279 (manual)
- trukmė: 724s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/probe_props.py
│ @@ -0,0 +1,23 @@
│ +import json, glob, sqlite3
│ +
│ +for f in sorted(glob.glob('agents/proposals/*.json')):
│ +    d = json.load(open(f))
│ +    print(d.get('status'), '|', d.get('priority'), '|', d.get('type'), '|', d.get('title')[:70], '|', f)
│ +
│ +print('\n=== DB ===')
│ +c = sqlite3.connect('agents/runs.db')
│ +print([r[0] for r in c.execute("select name from sqlite_master where type='table'")])
│ +for t in ('proposals', 'runs'):
│ +    try:
│ +        cols = [d[1] for d in c.execute('pragma table_info(%s)' % t)]
│ +        n = c.execute('select count(*) from %s' % t).fetchone()[0]
│ +        print(t, n, cols)
│ +    except Exception as e:
│ +        print(t, 'ERR', e)
│ +print('\n--- proposals in DB, status new, type metodas/tema ---')
│ +try:
│ +    rows = c.execute("select id, type, priority, status, substr(title,1,70), target from proposals where status='new' order by id").fetchall()
│ +    for r in rows:
│ +        print(r)
│ +except Exception as e:
│ +    print('ERR', e)
│ profiles/deepseek41flash/cache/scratch/show_strand.py
│ @@ -0,0 +1,7 @@
│ +import json
│ +d = json.load(open('content/lt/grade-01/index.json'))
│ +for s in d['strands']:
│ +    if s['id'] == 'pasaulio-pazinimas':
│ +        print(json.dumps(s, ensure_ascii=False, indent=1))
│ +p = json.load(open('content/lt/grade-01/path.json'))
│ +print(json.dumps(p, ensure_ascii=False, indent=1)[:2500])
│ profiles/deepseek41flash/cache/scratch/m09_check.py
│ @@ -0,0 +1,101 @@
│ +import re
│ +
│ +def words(t):
│ +    return len(re.findall(r"[\wąčęėįšųūžĄČĘĖĮŠŲŪŽ'-]+", t))
│ +
│ +def sentences(t):
│ +    return [s for s in re.split(r"(?<=[.!?])\s+", t.strip()) if s]
│ +
│ +def norm(t):
│ +    return re.sub(r"\s+", " ", str(t).lower().replace("−", "-").replace("–", "-").replace("—", "-")).strip()
│ +
│ +module = {
│ +    "title": "Kas sukūrė šį daiktą: kelias iki gamtos",
│ +    "subtitle": "Popierius prasideda miške, o stiklinė — smėlyje",
│ +    "concept.title": "Daiktas prasideda gamtoje",
│ +    "concept.big_idea": "Popierius prasideda ąžuole, stiklinė — smėlyje. Kiekvienas daiktas turi kelią iki gamtos. Parduotuvė yra to kelio gale, o ne pradžioje.",
│ +    "concept.steps.1": "Spėk, kur prasideda popieriaus kelias.",
│ +    "concept.steps.2": "Rink šaltinį po vieną ir statyk grandinę atgal.",
│ +    "concept.steps.3": "Kai šaltinis netinka, grandinė nenueina iki gamtos.",
│ +    "concept.steps.4": "Pabandyk su stikline: ar jos kelias irgi baigiasi gamtoje?",
│ +    "concept.example": "Popieriaus lapas guli parduotuvėje. Jo kelias: ąžuolas, mediena, popierius.",
│ +    "reflect": "Iš ko atsirado tavo pieštukas? Papasakok kelią iki gamtos.",
│ +    "outcomes.1": "Nurodau, iš ko padarytas daiktas.",
│ +    "outcomes.2": "Nustatau, kur prasideda daikto kelias gamtoje.",
│ +    "outcomes.3": "Paaiškinu, kodėl parduotuvė yra kelio gale, o ne pradžioje.",
│ +    "teacher.goal": "Suprasti, kad kiekvienas daiktas prasideda gamtoje: popierius — ąžuole, stiklinė — smėlyje. Modelis leidžia vaikui pačiam statyti grandinę atgal ir matyti, kad netinkamas šaltinis grandinės nebaigia.",
│ +    "teacher.prompt": "Iš ko atsirado tavo pieštukas?",
│ +    "teacher.offline.1": "Ant stalo padėkite popieriaus lapą, medinę liniuotę ir stiklinę.",
│ +    "teacher.offline.2": "Duokite tris korteles: ąžuolas, mediena, smėlis.",
│ +    "teacher.offline.3": "Vaikai prie lapo ir stiklinės dėlioja, iš ko jie atsirado.",
│ +    "teacher.offline.4": "Tada korteles dėkite į eilę ir pasakykite kelią balsu.",
│ +}
│ +
│ +limits = {"title": 42, "subtitle": 80, "concept.title": 40, "concept.big_idea": 240}
│ +for k, v in module.items():
│ +    lim = limits.get(k)
│ +    flag = "" if not lim else ("OK" if len(v) <= lim else "VIRŠ RIBA")
│ +    per = [words(s) for s in sentences(v)]
│ +    print(f"{k:22} chars={len(v):3} limit={str(lim or '-'):>3} words/sentence={per} {flag}")
│ +
│ +print("\n--- tasks ---")
│ +tasks = [
│ +    dict(q="Parduotuvėje ant lentynos guli popieriaus lapas. Iš ko jis padarytas?",
│ +         options=["Iš medienos", "Iš lapų", "Iš smėlio"], answer=0,
│ +         hint="Medžio lapas žalias ir plonas. Ar popierius toks pat?",
│ +         why="Popierius daromas iš medienos, o ne iš lapų."),
│ +    dict(q="Stiklinė padaryta iš stiklo. Iš ko atsiranda stiklas?",
│ +         options=["Iš naftos", "Iš medienos", "Iš smėlio"], answer=2,
│ +         hint="Nafta tamsi, mediena turi rieves. Stiklas skaidrus.",
│ +         why="Stiklas lydomas iš smėlio, todėl jo kelias baigiasi smėlyje."),
│ +    dict(q="Knyga padaryta iš popieriaus. Kur prasideda knygos kelias?",
│ +         options=["Parduotuvėje", "Spaustuvėje", "Miške"], answer=2,
│ +         hint="Spaustuvė spausdina popierių. Kas popierių padaro?",
│ +         why="Popierius daromas iš medienos, o mediena auga miške."),
│ +    dict(q="Plastikinis butelis padarytas iš plastiko. Kur prasideda jo kelias?",
│ +         options=["Naftoje", "Parduotuvėje", "Smėlyje"], answer=0,
│ +         hint="Plastikas lankstus ir lengvas. Stiklas kietas, smėlis birus.",
│ +         why="Plastikas daromas iš naftos, kuri išgaunama iš žemės gelmių.", optional=True),
│ +]
│ +for i, t in enumerate(tasks, 1):
│ +    qs = [words(s) for s in sentences(t["q"])]
│ +    hs = [words(s) for s in sentences(t["hint"])]
│ +    ws = [words(s) for s in sentences(t["why"])]
│ +    correct = norm(t["options"][t["answer"]])
│ +    leak = bool(re.search(rf"(?<!\w){re.escape(correct)}(?!\w)", norm(t["hint"])))
│ +    print(f"{i}: q={qs} hint={hs} ({len(t['hint'])} ch) why={ws} ats={t['answer']} leak={leak}")
│ +print("answer indices:", [t["answer"] for t in tasks])
│ +
│ +print("\n--- sim sentences ---")
│ +sim = {
│ + "predict": "Kur prasideda popieriaus kelias? Spėk.",
│ + "guessed": "Spėjimas įrašytas. Dabar statyk kelią.",
│ + "step1": "Popierius iš medienos. Iš ko mediena?",
│ + "wrong": "Grandinė čia nenueina.",
│ + "done1": "Popierius prasideda miške.",
│ + "compare_miske": "Tu sakei miške. Taip ir yra.",
│ + "compare_parduotuve": "Tu sakei parduotuvėje. Grandinė baigėsi miške.",
│ + "compare_gamykla": "Tu sakei gamykloje. Grandinė baigėsi miške.",
│ … omitted 23 diff line(s) across 1 additional file(s)/section(s)
│ research/wiki/grades/01/metodai.md
│ @@ -593,6 +593,159 @@
│
│  **Pastaba dėl wiki.** `research/wiki/curriculum/pasaulio-pazinimas-1-klase.md:82–88` temų lentelėje 26.2.4 nėra — ji yra ilgalaikiame plane (`:17645`), todėl lentelė tyrėjui papildytina; šiame faile curriculum įrašas neliestas (ne mano vaidmens failas).
│
│ +### M-09 — Kas sukūrė šį daiktą: grandinė nuo daikto iki gamtos
│ +
│ +**Data:** 2026-11-14 · **Tema:** `agents/proposals/2026-11-14-ideator-kas-sukure-dailka.json` (#15581) · **Tikslas:** `content/lt/grade-01/pasaulio-pazinimas/21-kas-sukure-daikta.json` · **Šaltinis:** [[../../foundations/kilme-ir-grandine|kilme-ir-grandine]]
│ +
│ +**Viena didelė idėja.** Kiekvienas daiktas prasideda gamtoje: popierius — ąžuole, stiklinė — smėlyje. Parduotuvė yra kelio gale, o ne pradžioje.
│ +
│ +**Ką sako programa.** 1 klasės gamtos mokslų ilgalaikiame plane yra **26.3.1 „Gamtos ištekliai, jų tarša ir tausojimas“ (2 val.)**, o veikla įvardyta pažodžiui — „darbas grupėse ar porose (pvz., žaidimas „Kas sukūrė šį daiktą?“)“ (`sources/pradinio-bp-rekomendacijos-2024.txt:17649–17656`; ta pati eilutė integracijos lentelėje `:8452–8458`). To paties dokumento „5 temos su įgyvendinimo rekomendacijomis“ lentelėje 26.3.1 nėra (`research/wiki/curriculum/pasaulio-pazinimas-1-klase.md:82–88`, ten pat `[PATIKRINTI]` apie numeracijos spragas). Tai dokumento spraga, o ne temos nebuvimas: planas jai skiria dvi valandas, todėl modulis remiasi ilgalaikiu planu, o ne penkių temų sąrašu (žr. „Pastaba dėl wiki“).
│ +
│ +**Kodėl modelis, o ne paveikslėlis.** Paveikslėlyje, kuriame nupiešta grandinė, vaikas mato rezultatą, bet negali patikrinti dviejų dalykų, kurie ir yra sąvoka. Pirma, jis negali pamatyti, kad **klaidingas šaltinis grandinės nebaigia**: piešinyje visos kortelės jau sudėtos teisingai, todėl ryšys atrodo kaip iliustracija, o ne kaip taisyklė. Antra, jis negali grįžti atgal: paveikslėlis neatsako, kas nutinka, jei popierius būtų daromas iš smėlio. Modelis leidžia rinktis šaltinį ir pamatyti, kad pasirinkus netinkamą kortelę grandinė sustoja vienu žingsniu anksčiau, o `api.note` pasako, kokia **savybė** nesutampa. Be to, prieš pirmą pasirinkimą prašoma spėjimo apie kelio pradžią — tai ne puošmena, o būdas pamatyti nuostatą, kurią modelis turi paneigti (LL-15).
│ +
│ +**Ką rodo tyrimai.** Anderson, Ellis ir Jones (2014) tyrė 182 darželinukus ir pirmokus (K–1 klasės) JAV pietryčiuose ir klausė, ar kasdieniai daiktai yra augalai. **89 % darželinukų ir 85 % pirmokų nepripažino, kad telefono stulpai daromi iš medžių kamienų**; paklausti, iš kur stulpas, dažniausiai atsakė „iš telefono kompanijos“. **80 % darželinukų ir 87 % pirmokų nesiejo popieriaus su medžiais** (lentelėje popierių kaip augalą įvardijo 20 % darželinukų ir 13 % pirmokų). Tai tiksli formuluotė tos nuostatos, kurią turi paneigti modelis: daiktas turi **gamintoją**, bet neturi **šaltinio** — kol kas nors nepamoko jo ieškoti.
│ +
│ +Bjørgen, Moe, Wold ir Melis (2023) kalbino 56 penkerių–šešerių metų vaikus Norvegijoje apie aštuonių maisto produktų kilmę. Vaikai gerai žinojo, iš kur pienas (94 %), mėsa (79 %), duona (67 %) ir miltai (67 %), bet prasčiau — sūrį (30 %), makaronus (30 %) ir dešrą (33 %). Autoriams svarbiausia išvada: sunkiausia ten, kur tarp žaliavos ir produkto yra **keli nematomi žingsniai**. Todėl modelis kiekvieną žingsnį rodo atskirai ir neleidžia jo praleisti.
│ +
│ +Joshi, Azuma ir Feenstra (2008) apžvalgoje aprašytas programos vertinimas, kuriame vaikai dėliojo korteles „nuo ūkio iki stalo“: teisingai seką sudėjo 12 % prieš ir 52 % po programos. Tai ne 1 klasės ir ne Lietuvos duomenys, todėl jie naudojami tik kaip veiklos formos precedentas — kortelių seka yra išmatuojamai veiksminga, bet pati savaime dar neįrodo supratimo.
│ +
│ +**Klaidingos nuostatos ir kaip jos paneigiamos.**
│ +
│ +1. **„Daiktas atsiranda parduotuvėje.“** Tai pagrindinė nuostata, kurią fiksuoja Anderson ir kt. (2014): vaikas įvardija matomą agentą (parduotuvę, įmonę, gamyklą), o ne medžiagos šaltinį. Paneigiama ne tekstu, o veiksmu: vaikas pats stato grandinę atgal, o spėjimas „parduotuvėje“ lieka matomas viršuje ir pabaigoje lyginamas su grandinės galu („Tu sakei: parduotuvėje. Grandinė baigėsi miške.“).
│ +2. **„Gamta — tai tik miškas.“** Antras daiktas yra stiklinė, o jos grandinė baigiasi **smėlyje**. Jei gamta būtų tik žaluma, stiklinės kelias neturėtų kur baigtis; modelis rodo, kad gamta yra ir negyvoji.
│ +3. **„Gamykla sukuria medžiagą iš nieko.“** Kiekvienas žingsnis turi savo šaltinį, o netinkama kortelė grandinės nepratęsia. Paaiškinimas remiasi savybe, ne autoritetu: smėlis birus, popierius lankstosi; mediena turi kamieną, smėlis — ne.
│ +4. **„Jei daiktas pirktas, jis jau ne iš gamtos.“** Tai ta pati pirmoji nuostata, pasakyta iš kitos pusės, todėl modelis jos atskirai neįvardija: parduotuvė grandinėje yra, tik paskutinė. Parduotuvės kortelė atsiranda peržiūros pabaigoje („Popierius atvežamas į parduotuvę.“), kad vieta būtų parodyta, o ne neigiama.
│ +
│ +**Tikslas sąmoningai kuklus.** Modulis nesiekia, kad vaikas žinotų, iš ko padarytas kiekvienas daiktas. Jis siekia vieno įgūdžio: **paklausti „iš ko?“ ir eiti atgal, kol kelias baigiasi gamtoje**. Todėl modelio grandinė trumpa — du žingsniai nuo daikto iki gamtos (popierius → mediena → ąžuolas; stiklinė → stiklas → smėlis), o ne visa gamybos grandinė su transportu ir pakuote. Darbinė atmintis 6–7 metų vaikui laiko du–tris elementus; ilgesnė grandinė pavirstų sekos įsiminimu, o ne kilmės supratimu (`foundations/kognityvine-apkrova.md`).
│ +
│ +**Seka (konkretumas → modelis → simbolis → perkėlimas).**
│ +
│ +1. **Stalas ir kortelės.** Mokytojas padeda popieriaus lapą, medinę liniuotę ir stiklinę, o vaikams duoda tris korteles: ąžuolas, mediena, smėlis. Prašoma prie lapo padėti tai, iš ko jis atsirado, o prie stiklinės — savo. Vaikai ginčijasi; mokytojas atsakymo neteikia. Tikslas: iškelti kasdienį paaiškinimą („iš parduotuvės“) į kalbą, kad modelis turėtų ką griauti.
│ +2. **Ekranas, spėjimas.** Ekrane dešinėje guli popierius, į kairę — du tušti langeliai. Klausimas: „Kur prasideda popieriaus kelias?“ Trys mygtukai: Miške / Parduotuvėje / Gamykloje. Spėjimas įrašomas ir lieka matomas visą laiką. Tikslas: įsipareigoti nuostatai, kol modelis jos nepaneigė.
│ +3. **Ekranas, grandinė atgal.** Atsiranda pirmas klausimas: „Iš ko padarytas popierius?“ Trys kortelės: mediena / lapai / smėlis. Teisinga kortelė atsiranda kairėje, tarp jos ir lapo nutįsta rodyklė. Tada antras klausimas: „Iš ko atsirado mediena?“ (ąžuolas / pieštukas / smėlis). Netinkama kortelė lieka langelyje su brūkšniuotu rėmeliu ir trūkusia rodykle, o `api.note` pasako, kokia savybė nesutampa. Tikslas: pamatyti, kad grandinė gali **nenueiti iki gamtos**, ir kodėl.
│ +4. **Simbolis.** Kai popieriaus grandinė baigiasi, kairiausia kortelė apibrėžiama rėmeliu ir gauna žodį „GAMTA“, o `api.readout` sako: „Popierius prasideda miške.“ Mygtukas „Peržiūrėk kelią“ veda per grandinę iš kairės į dešinę po vieną žingsnį, be laikmačio, kiekvieną kartą tardamas vieną sakinį („Ąžuolas auga miške.“ → „Iš medienos daromas popierius.“ → „Popierius atvežamas į parduotuvę.“). Vaikas perskaito užrašą ir pasako, kas pasikeitė kiekviename žingsnyje. Tikslas: grandinė tampa užrašu, o ne paveikslėliu, ir parduotuvė atsiduria gale.
│ +5. **Perkėlimas.** Antras daiktas — stiklinė. Prieš statant: „Ar stiklinės kelias irgi baigsis gamtoje?“ (Taip / Ne). Spėjimas lyginamas su grandinės galu: „Tu sakei taip. Gamta yra ir smėlis.“ Grandinė: stiklinė → stiklas → smėlis. Tada ekrane lieka abi grandinės kaip dvi eilutės, o to paties klausimo atvejai be modelio sprendžiami užduotyse: knyga (miškas), plastikinis butelis (nafta).
│ +
│ +**Privalomas spėjimo žingsnis prieš pirmą pasirinkimą.** Du spėjimai, abu palyginami su įvykiu (LL-15). Pirmasis — vieta (miške / parduotuvėje / gamykloje), antrasis — ar antro daikto kelias irgi baigsis gamtoje (taip / ne). Kol vaikas nepasirinko pirmojo spėjimo, šaltinio kortelės neaktyvios; jų `aria-label` sako „Pirma pasirink spėjimą“. Be spėjimo modelis virsta kortelių rinkimu bandymų būdu: vaikas baksto tol, kol grandinė sueina, ir nuostatos nepastebi — tas pats pavojus kaip M-01–M-08 (`foundations/sujungti-dydziai.md`).
│ +
│ +**Simuliacijos specifikacija.** Komponentas `daikto-grandine`, failas `assets/js/sims/pasaulis.js` (jis jau importuoja `art.js`, o `scripts/check_art.py:31` LEGACY sąraše yra tik `matematika.js`). Grandinė yra **duomenys**, o ne trys atskiri ekranai: komponentas eina per `objects[].steps[]`, todėl trečias daiktas pridedamas konfigūracija, be kodo pakeitimų. `config`:
│ +
│ +```json
│ +{ "cards": {
│ +    "popierius": { "name": "popierius", "icon": "popierius" },
│ +    "mediena":   { "name": "mediena",   "icon": "mediena" },
│ +    "lapai":     { "name": "lapai",     "icon": "lapai" },
│ +    "smelis":    { "name": "smėlis",    "icon": "smelis" },
│ +    "azuolas":   { "name": "ąžuolas",   "icon": "azuolas" },
│ +    "piestukas": { "name": "pieštukas", "icon": "piestukas" },
│ +    "stikline":  { "name": "stiklinė",  "icon": "stikline" },
│ +    "stiklas":   { "name": "stiklas",   "icon": "stiklas" },
│ +    "nafta":     { "name": "nafta",     "icon": "nafta" } },
│ +  "objects": [
│ +    { "id": "popierius",
│ +      "predict": { "say": "predict", "options": [
│ +        { "id": "miske", "label": "Miške", "say": "compare_miske" },
│ +        { "id": "parduotuveje", "label": "Parduotuvėje", "say": "compare_parduotuve" },
│ +        { "id": "gamykloje", "label": "Gamykloje", "say": "compare_gamykla" } ] },
│ +      "steps": [
│ +        { "card": "mediena", "ask": "ask_mediena",
│ +          "options": ["mediena", "lapai", "smelis"],
│ +          "no": { "lapai": "Lapai ploni ir žali. Popierius baltas ir sausas.",
│ +                  "smelis": "Smėlis birus. Popierius lankstosi ir plyšta." } },
│ +        { "card": "azuolas", "ask": "ask_azuolas", "end": "done1",
│ +          "options": ["azuolas", "piestukas", "smelis"],
│ +          "no": { "piestukas": "Pieštukas daromas iš medienos, ne atvirkščiai.",
│ +                  "smelis": "Smėlis neturi kamieno ir žievės." } } ],
│ +      "replay": ["replay_azuolas", "replay_mediena", "replay_parduotuve"] },
│ +    { "id": "stikline",
│ +      "predict": { "say": "ask2", "options": [
│ +        { "id": "taip", "label": "Taip", "say": "compare_taip" },
│ +        { "id": "ne", "label": "Ne", "say": "compare_ne" } ] },
│ +      "steps": [
│ +        { "card": "stiklas", "ask": "ask_stiklas",
│ +          "options": ["stiklas", "mediena", "smelis"],
│ +          "no": { "mediena": "Stiklinė permatoma. Mediena nepermatoma.",
│ +                  "smelis": "Smėlis birus. Stiklinė kieta ir vientisa." } },
│ +        { "card": "smelis", "ask": "ask_smelis", "end": "done2",
│ +          "options": ["smelis", "azuolas", "nafta"],
│ … omitted 81 diff line(s) across 1 additional file(s)/section(s)
│ research/wiki/grades/01/metodai.md
│ @@ -3,7 +3,7 @@
│  tipas: metodai
│  klase: 1
│  amzius: "6–7"
│ -atnaujinta: 2026-11-10
│ +atnaujinta: 2026-11-14
│  ---
│
│  # 1 klasės metodai
│ research/wiki/grades/01/metodai.md
│ @@ -707,7 +707,7 @@
│  - **Išdėstymas 360 px:** scena `viewBox="0 0 328 200"`, `width:100%`, `max-width:328px`. Trys kortelės po 92 × 104 px ir du 26 px tarpai = 328 px (rodyklė telpa į tarpą). Kortelės vidus: 56 px piktograma, 32 px užrašas (dvi eilutės po 16 px), 16 px „GAMTA“ juosta = 104 px. Spėjimo žymė viršuje 0–36 px. Suvestinė (abi grandinės) — dvi eilutės po tris 60 × 36 px korteles su 10 px tarpais = 200 px iš 328 px; eilutės 40 ir 104 px aukštyje.
│  - **Valdikliai:** trys šaltinio mygtukai 100 × 72 px + du 8 px tarpai = 316 px iš 328 px; kiekvienas turi piktogramą ir užrašą, `min-height:72px`, `height:auto`, `overflow-wrap:anywhere` (200 % tekste užrašas gali užimti tris eilutes). „Peržiūrėk kelią“ ir „Kitas daiktas“ — 100 % × 56 px, „Iš naujo“ ≥ 96 × 48 px. „Kitas daiktas“ neaktyvus, kol grandinė nebaigta, ir `aria-label` pasako kodėl. Klaviatūra: `Tab`, `Enter`/`Space`, `←`/`→` perjungia variantus, `R` atstato.
│  - **Fokusas** (LL-32): po spėjimo — į pirmą šaltinio mygtuką; po teisingo žingsnio — į pirmą kito žingsnio mygtuką; po grandinės pabaigos — į „Peržiūrėk kelią“; paspaudus „Kitas daiktas“ — į pirmą spėjimo mygtuką; kai mygtukas išjungiamas, fokusas niekada nelieka ant jo.
│ -- **Piktogramos:** viena nauja `art.js` dalis `pictogram(kind, x, y, s)` su dešimčia rūšių (`popierius`, `mediena`, `lapai`, `smelis`, `azuolas`, `piestukas`, `stikline`, `stiklas`, `nafta`), kuri viduje naudoja jau esančias dalis (`plank`, `tree`, `leaf`, `drops`) ir prideda tris naujas formas: lapas su užlenktu kampu, svarstiklinė su atviru viršumi ir šviesos ruožu, smėlio kauburys iš grūdelių. Kortelės skiriasi **forma**, ne vien spalva (LL-13): popierius — stačiakampis su užlenktu kampu, mediena — lenta su rievėmis, smėlis — kauburys, stiklas — plokštė su įstrižu blizgesiu, stiklinė — taurelė.
│ +- **Piktogramos:** viena nauja `art.js` dalis `pictogram(kind, x, y, s)` su devyniomis rūšimis (`popierius`, `mediena`, `lapai`, `smelis`, `azuolas`, `piestukas`, `stikline`, `stiklas`, `nafta`), kuri viduje naudoja jau esančias dalis (`plank`, `tree`, `leaf`, `drops`) ir prideda tris naujas formas: lapas su užlenktu kampu, svarstiklinė su atviru viršumi ir šviesos ruožu, smėlio kauburys iš grūdelių. Kortelės skiriasi **forma**, ne vien spalva (LL-13): popierius — stačiakampis su užlenktu kampu, mediena — lenta su rievėmis, smėlis — kauburys, stiklas — plokštė su įstrižu blizgesiu, stiklinė — taurelė.
│  - **Prieinamumas:** scenos SVG `role="img"`, `aria-label` atnaujinamas po kiekvieno veiksmo ir neperpasakoja `readout` žodis į žodį: „Popieriaus grandinė: lapas, mediena, tuščias langelis. Spėjimas: parduotuvėje.“ Netinkama kortelė `aria-label` žymima žodžiu „netinka“, ne vien brūkšniuotu rėmeliu. „GAMTA“ — žodis, ne vien žalia spalva. `readout` turi `aria-live="polite"`.
│  - **Jokių laikmačių, ėjimų limito, „game over“.** Netinkamų kortelių skaičius neribojamas ir neskaičiuojamas; grįžimas prie jau atmestos kortelės niekada nelaikomas klaida.
│
│ research/wiki/grades/01/metodai.md
│ @@ -732,7 +732,7 @@
│  | 3 | perkėlimas | „Knyga padaryta iš popieriaus. Kur prasideda knygos kelias?“ — Parduotuvėje / Spaustuvėje / Miške | Miške (2) | „Spaustuvėje“ — artimiausias matomas žmogaus žingsnis laikomas pradžia; „Parduotuvėje“ — pirmoji nuostata | „Spaustuvė spausdina popierių. Kas popierių padaro?“ |
│  | 4 | perkėlimas (`optional: true`) | „Plastikinis butelis padarytas iš plastiko. Kur prasideda jo kelias?“ — Naftoje / Parduotuvėje / Smėlyje | Naftoje (0) | „Smėlyje“ — stiklo šaltinis perkeliamas plastikui; „Parduotuvėje“ — pirmoji nuostata | „Plastikas lankstus ir lengvas. Stiklas kietas, smėlis birus.“ |
│
│ -Atsakymų indeksai 0 / 2 / 2 / 0 — nė vienas nėra vienintelis, o trečiasis sąmoningai ne viduryje. Kiekviena užuomina pasakyta 4–5 žodžių sakiniais ir nė viena nekartoja teisingo varianto (`validate_content.py` tai tikrina).
│ +Atsakymų indeksai 0 / 2 / 2 / 0 — pasiskirstę, todėl vaikas negali spėti pagal varianto vietą. Kiekviena užuomina pasakyta trumpais sakiniais ir nė viena nekartoja teisingo varianto (`validate_content.py` tai tikrina).
│
│  **Refleksija.** „Iš ko atsirado tavo pieštukas? Papasakok kelią iki gamtos.“ Klausiama žodžiu, nevertinama; laukiamas atsakymas — pieštukas → mediena → medis, o ne „iš parduotuvės“.
│
│ research/wiki/foundations/kilme-ir-grandine.md
│ @@ -0,0 +1,55 @@
│ +---
│ +title: "Kilmė ir grandinė: kodėl vaikas daiktą aiškina parduotuve"
│ +tipas: fundamentai
│ +temos: [gamtos ištekliai, daikto kilmė, medžiagos, tvarumas, ankstyvasis gamtamokslinis ugdymas]
│ +amzius: "6-7"
│ +atnaujinta: 2026-11-14
│ +saltiniai: 3
│ +---
│ +
│ +# Kilmė ir grandinė: kodėl vaikas daiktą aiškina parduotuve
│ +
│ +## Pagrindinė idėja
│ +
│ +Paklaustas, iš kur popierius, šešiametis atsako „iš parduotuvės“ arba „iš gamyklos“. Tai ne žinių spraga, o **taisyklė**: vaikas įvardija matomą veikėją, kuris daiktą atnešė, o ne medžiagą, iš kurios daiktas atsirado. Kadangi parduotuvė ir gamykla tikrai yra kelyje, atsakymas atrodo teisingas, ir vienas sakinys „iš medžio“ jo nepakeičia.
│ +
│ +Kilmė suprantama tik kaip **grandinė**, ir grandinė turi tris savybes, kurių vienas paveikslėlis neduoda:
│ +
│ +1. **Kryptis.** Grandinė turi pradžią (gamta) ir galą (parduotuvė). Vaikas, žinantis tik galą, grandinės neatpažįsta.
│ +2. **Tęstinumas.** Kiekvienas žingsnis turi savo šaltinį. Jei žingsnis praleidžiamas, grandinė nutrūksta — ir tai turi būti matoma, o ne pasakyta.
│ +3. **Baigtis vietoje, o ne medžiagoje.** Mediena dar nėra gamta; ąžuolas yra. Skirtumas svarbus todėl, kad „gamta“ vaikui dažnai reiškia tik mišką — o stiklas prasideda smėlyje, negyvojoje gamtoje.
│ +
│ +## Ką rodo tyrimai
│ +
│ +**Kasdieniai daiktai ir jų augalinė kilmė.** Anderson, Ellis ir Jones (2014) tyrė 182 darželinukus ir pirmokus (K–1) JAV pietryčių mokykloje ir klausė, ar nuotraukoje pavaizduotas daiktas yra augalas. **89 % darželinukų ir 85 % pirmokų nepripažino, kad telefono stulpai daromi iš medžių kamienų**; dažniausias jų atsakymas, iš kur stulpas, buvo „iš telefono kompanijos“. **80 % darželinukų ir 87 % pirmokų nesiejo popieriaus su medžiais.** Lentelėje popierių kaip augalą įvardijo 20 % darželinukų ir 13 % pirmokų. Autoriai tai aiškina tuo, kad kasdieniai produktai programoje su augalais nesiejami: vaikas mokosi augalo dalių, bet ne to, kad daiktas iš jų daromas.
│ +
│ +**Nematomi žingsniai yra sunkiausia vieta.** Bjørgen, Moe, Wold ir Melis (2023) kalbino 56 penkerių–šešerių metų vaikus devyniuose Norvegijos darželiuose. Vaikai gerai žinojo, iš kur pienas (94 %), mėsa (79 %), duona (67 %) ir miltai (67 %), bet prasčiau — sūris (30 %), makaronai (30 %) ir dešra (33 %). Autoriams svarbiausia išvada: skirtumas ne tarp „gamtinių“ ir „dirbtinių“ produktų, o tarp vieno žingsnio ir kelių žingsnių. Ten, kur tarp žaliavos ir produkto yra keli nematomi veiksmai, vaikas kilmės nebeatseka.
│ +
│ +**Seka kaip veikla yra išmatuojama.** Joshi, Azuma ir Feenstra (2008) apžvalgoje apie „nuo ūkio iki mokyklos“ programas cituojamas vertinimas, kuriame vaikai dėliojo korteles maisto kelio tvarka: teisingai seką sudėjo 12 % prieš ir 52 % po programos. Tai ne 1 klasės ir ne Lietuvos duomenys, todėl rodiklis naudojamas kaip veiklos formos precedentas, o ne kaip šio modelio efekto įrodymas.
│ +
│ +## Ką tai reiškia SUPRASK platformai
│ +
│ +1. **Grandinė statoma atgal, nuo daikto.** Vaikas pradeda nuo to, ką mato (popierius, stiklinė), ir kiekvieną kartą klausia „iš ko?“. Kita kryptis reikalautų iš anksto žinoti pradžią — būtent to vaikas ir neturi.
│ +2. **Grandinė baigiama konkrečia vieta, ne žodžiu „gamta“.** „Miškas“ ir „smėlis“ yra patikrinami; „gamta“ — ne. Be to, antroji vieta (smėlis) paneigia nuostatą, kad gamta yra tik žaluma.
│ +3. **Klaidingas žingsnis parodomas kaip nutrūkusi grandis.** Netinkama kortelė lieka matoma su brūkšniuotu rėmeliu ir trūkusia rodykle, o paaiškinimas remiasi **savybe** (smėlis birus, popierius lankstosi), ne autoritetu. Taip vaikas mato, kodėl jo pasirinkimas grandinės nepratęsia, o ne tik tai, kad jis neteisingas.
│ +4. **Vienas žingsnis rodomas vienu metu, grandinė trumpa.** Du žingsniai nuo daikto iki gamtos telpa į 6–7 metų darbinę atmintį; ilgesnė grandinė virsta sekos įsiminimu. Kiekvieną žingsnį galima peržiūrėti atskirai, be laikmačio.
│ +5. **Spėjimas prieš pirmą pasirinkimą yra privalomas.** Spėjimas apie kelio pradžią (miške / parduotuvėje / gamykloje) pamato nuostatą ekrane ir pabaigoje lyginamas su grandinės galu. Be spėjimo modelis virsta kortelių rinkimu bandymų būdu, o nuostata lieka nepaliesta.
│ +6. **Parduotuvė nerodoma kaip priešprieša.** Ji yra grandinės paskutinė kortelė, o ne klaida: vaikas turi pamatyti, kad parduotuvė tikrai yra kelyje, tik ne pradžioje. Neigti tai, ką vaikas mato kasdien, reikštų mokyti nepaisyti stebėjimo.
│ +
│ +## Ko šis įrašas nedaro
│ +
│ +Jis nepretenduoja, kad viena grandinė pakeis kilmės supratimą. Anderson ir kt. ėmė vieną JAV kaimišką mokyklą, Bjørgen ir kt. — 56 vaikus viename Norvegijos regione, o abu tyrimai klausė apie **maistą ar augalus**, ne apie stiklą ar plastiką; perkėlimas į Lietuvą ir į negyvosios gamtos medžiagas yra prielaida, kurią reikia tikrinti mokytojo stebėjimu. Grandinė taip pat nėra visas gyvavimo ciklas: joje nėra transporto, pakuotės, atliekų ir perdirbimo. Tausojimas yra atskira sąvoka, o ne šios grandinės tęsinys.
│ +
│ +## Susieti
│ +
│ +- [[kognityvine-apkrova]] — kodėl grandinė trumpa ir kodėl vienas žingsnis rodomas vienu metu
│ +- [[simuliacijos-ir-modeliai]] — modelis, jo ribos ir produktyvi nesėkmė
│ +- [[gyvybe-ir-judesys]] — kas gyva: ta pati gamtos samprata iš kitos pusės
│ +- [[../grades/01/metodai|1 klasės metodai]] — M-09 „Kas sukūrė šį daiktą: grandinė nuo daikto iki gamtos“
│ +- [[../curriculum/pasaulio-pazinimas-1-klase|1 klasės pasaulio pažinimas]] — 26.3.1 „Gamtos ištekliai, jų tarša ir tausojimas“
│ +
│ +## Šaltiniai
│ +
│ +1. Anderson, J. L., Ellis, J. P., & Jones, A. M. (2014). Understanding early elementary children's conceptual knowledge of plant structure and function through drawings. *CBE—Life Sciences Education, 13*(3), 375–386. https://doi.org/10.1187/cbe.13-12-0230 (atvira prieiga, CC BY-NC-SA; imtis ir metodai — Methods; telefono stulpų 11 % / 15 % ir popieriaus 20 % / 13 % — Table 6; 89 % / 85 %, 80 % / 87 % ir „from the telephone company“ — Results)
│ +2. Bjørgen, K., Moe, B., Wold, P.-A., & Melis, C. (2023). Children's knowledge about the origins of food in early childhood education and care institutions (ECEC) in Norway. *Education 3-13, 51*(7), 1118–1129. https://doi.org/10.1080/03004279.2022.2049839 (imtis 56 vaikai, 5–6 m., devyni darželiai; procentai — Results)
│ +3. Joshi, A., Azuma, A. M., & Feenstra, G. (2008). Do farm-to-school programs make a difference? Findings and future research needs. *Journal of Hunger & Environmental Nutrition, 3*(2–3), 229–246. https://doi.org/10.1080/19320240802244025 (kortelių sekos vertinimas 12 % → 52 % — apžvalgoje cituojamas programos vertinimas, ne šio straipsnio eksperimentas)
Perėjau kvotą, todėl darbas nebaigtas. Realiai atlikta tiek:

**Padaryta ir įrašyta diske**

1. `research/wiki/grades/01/metodai.md` — naujas **M-09 "Kas sukūrė šį daiktą: grandinė nuo daikto iki gamtos"** (eilutės ~596–750), front matter data atnaujinta į 2026-11-14. Skyriuje yra visa baigties sąlyga:
   - viena didelė idėja, programos pagrindas (26.3.1, 2 val., veikla pažodžiui),
   - kodėl modelis, o ne paveikslėlis,
   - trys tyrimai su skaičiais (Anderson 89 %/85 %, 80 %/87 %; Bjørgen 94…30 %; Joshi 12 %→52 %),
   - keturios klaidingos nuostatos su paneigimu,
   - 5 žingsnių seka (stalas → spėjimas → grandinė atgal → simbolis → perkėlimas),
   - privalomas dvigubas spėjimas,
   - pilnas `config` JSON (9 kortelės, 2 daiktai, 22 garso frazės), 12 nepraleidžiamų techninių savybių, 9 būsenų lentelė su `readout`/`api.note`,
   - 4 užduotys (indeksai 0/2/2/0, 4-a `optional`) su tipinėmis klaidomis ir užuominomis,
   - modelio ribos, tikslūs modulio laukų ilgiai (title 39/42, subtitle 47/80, big_idea 135/240 — perskaičiuoti skriptu),
   - ideatoriaus grandinės taisymas: "lenta" → **mediena** (popierius daromas iš plaušų, ne lentų),
   - šaltiniai su DOI ir pastaba dėl curriculum lentelės spragos.

2. `research/wiki/foundations/kilme-ir-grandine.md` — naujas fundamentų įrašas (pagrindinė idėja, trys tyrimai, 6 pasekmės platformai, ribos, sąsajos, 3 šaltiniai).

**Nebaigta (liko be įrašymo)**

- `agents/proposals/2026-11-14-metodininkas-kas-sukure-daikta.json` — **pats svarbiausias trūkstamas failas**: be jo kūrėjas M-09 nematys (tai ta pati LL-85 situacija, kurią praėjęs paleidimas taisė).
- `research/wiki/foundations/README.md` — indekso eilutė naujam įrašui.
- `research/wiki/guidelines/pilotai.md` — P-020 (naujas modelio tipas: grandinė statoma atrinkimu, klaida rodoma kaip nutrūkusi grandis).
- `research/wiki/changelog.md` — įrašas.
- `agents/state.json` — `roles.metodininkas` + `last_method_work` (senąjį reikia išsaugoti kaip `last_method_work_259`).
- `agents/log/metodininkas-2026-11-14T0820.md` — ataskaita.
- Vartai nepaleisti: `validate_content.py --grade 1 --strict`, `check_language.py --grade 1`, `check_lessons.py`, `check_agents.py`, `check_docs_facts.py`, `check_art.py`. Turinio failai neliesti, todėl jie turėtų būti žali, bet tai **nepatvirtinta**, o ne "0 problemų".
- Commit nepadarytas.

Kitas paleidimas turėtų pradėti būtent nuo pasiūlymo failo (`type: "metodas"`, `run_id: 279`, `target: content/lt/grade-01/pasaulio-pazinimas/21-kas-sukure-daikta.json`, `priority: "high"`, `status: "new"`, evidence su `sources/pradinio-bp-rekomendacijos-2024.txt:17649–17656` ir trimis DOI), tada ataskaita ir `state.json`.

## klaidos

```
session_id: local-2484fb5f246b9569f3963f67d5a94d2436d928f0020062066766494ef8d74f71
```
