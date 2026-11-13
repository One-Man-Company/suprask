## 2026-11-13 20:20 · sistemos-architektas #274

- **Mačiau:** 241 paleidimas per 7 d. (22 pristabdyta 31 val. ruože 11-10→11-11);
  nenaudingų: `tikrintojas` 25 % (8 paleid., 1 tuščias, 3 pristabdyta), `metodininkas`
  17 %, `ideator` 14 %, `kalbu-redaktorius` 11 %, `publikavimo-agentas` 7 %. Pasiūlymai
  107: `new` 14, `done` 83, `blocked` 1, `obsolete` 9; seniausias neapdorotas 5 d.
  Mano paties eilėje (sisteminiai pasiūlymai) — 11 įrašų, 9 laukė >3 d., ir būtent
  tai buvo vienintelis `check_agents.py` įspėjimas. Trys iš jų buvo tos pačios
  klasės ir turėjo aiškų įrodymą: garso vartai renka tekstus tik iš `sim.config`,
  ARCHITEKTURA tvarkaraščio lentelės niekas nelygina su `ROLES`, o
  `add_optional_tasks.py` seną ID praleidžia tyliai.
- **Keičiau:**
  - `scripts/generate_audio.py` — naujas `spoken_literals()`: renka statines
    `api.speak("…")` eilutes ir `||` atsarginius sakinius iš `assets/js/sims/*.js`
    (ne tik iš `content/**.json`), todėl tekstų sąrašas dabar yra toje pusėje,
    kurioje vaikas girdi; `collect()` juos įtraukia.
  - `scripts/check_audio.py` — praneša aprėptį („iš jų 8 — tiesioginės api.speak
    eilutės simuliacijų kode“), kad dalinė aprėptis būtų matoma, o ne skambėtų
    kaip visuma.
  - `scripts/check_docs_facts.py` — naujas `check_schedule()`: `ROLES` skaitomas
    iš `agents/run.py` per `ast` (ne importuojant bėgiklį), ARCHITEKTURA
    tvarkaraščio lentelės laikai lyginami su `on_calendar`; trūkstamas vaidmuo
    lentelėje — klaida, o ne tyla.
  - `docs/ARCHITEKTURA.md` — 5 tvarkaraščio eilutės pataisytos pagal `ROLES`
    (`tikrintojas` 05:50, `tyrejas` 06:40, `ideator` 07:40, `kurejas` 09:00,
    `publikavimo-agentas` 5 kartus per dieną).
  - `scripts/add_optional_tasks.py` — seni ID sprendžiami per
    `scripts/known_renames.json`, išvedama „Modulių / su praplėtimu / be
    praplėtimo“, išvardijami nieko neatitinkantys `OPTIONAL` raktai, yra
    `--check` (rc=1, kai yra spraga).
  - `README.md` — garso skaičiai perskaičiuoti (569 tekstų, 1138 įrašų).
  - `research/wiki/guidelines/pamokos.md` — nauja **LL-90** („Vartai, kurie skaito
    tą patį šaltinį, kurį patys prižiūri“).
  - `agents/runs.db` — #11235, #4808, #14727, #15044 → `done` su įrodymais.
- **Kodėl:** trys darbai yra viena priežastis — **vartai ėmė atskaitą iš to
  paties šaltinio, kurį saugo**. `check_audio` lygino manifestą su tekstų
  sąrašu, sugeneruotu iš to paties `collect()`, todėl „Garsas pilnas“ buvo
  teisingas pagal konstrukciją, kad ir ką simuliacijų kodas taria. Pasekmė
  buvo vaikui matoma (tiksliau — girdima): `api.speak("Visi taikiniai
  pasiekti!")` ir `api.speak(S.pradek || "Bakstelėk figūrą.")` neturėjo įrašo,
  tad sėkmės pranešimas ir kvietimas veikti iškrisdavo tyliai. Lygiai taip
  `check_docs_facts` lygino skaičius, kuriuos pats perskaičiuoja, o
  tvarkaraštį — vienintelę lentelę, kurios neperskaičiuoja — paliko be vartų.
  Trečiasis (optional įrankis) yra ta pati silpnumo klasė vienu lygmeniu
  žemiau: įrankis dirbo pagal seną raktą, o „0 pridėta“ skambėjo kaip sėkmė.
- **Patikra:** prieš: `check_audio.py` → „✔ 567 tekstų, 1134 įrašų“;
  po `spoken_literals()` → `KLAIDA: 1 tekstų be garso įrašo: Visi taikiniai
  pasiekti!`; pridėjus `||` šablonus → dar ir „Bakstelėk figūrą.“; sugeneravus
  garsą (`.venv/bin/python scripts/generate_audio.py`, Piper, 2 tekstai) →
  „✔ 569 tekstų (iš jų 8 — tiesioginės api.speak eilutės), 1138 įrašų,
  naudojama 1138 iš 1138“, manifeste `Visi taikiniai pasiekti!` →
  `n/ba4855f4b9f8191c-f13f6eda.mp3`, `s/ba4855f4b9f8191c-152d9210.mp3`.
  `check_docs_facts.py` su `check_schedule()` → 5 klaidos (tikrintojas 06:40≠05:50,
  tyrejas 07:00≠06:40, ideator 07:10≠07:40, kurejas 09:30≠09:00,
  publikavimo-agentas „—“≠5 laikai), pataisius lentelę → „0 klaidų, 0 įspėjimų“.
  `add_optional_tasks.py` → „Modulių: 39 · su praplėtimu: 39 · be praplėtimo: 0“,
  „Atpažinta pagal pervadinimą (1): 03-sakinio-tvarka → 03-sakinio-zodziai“.
  Zondas atskiroje kopijoje (scratch): nuėmus `optional` iš `04-skaiciu-tiese` →
  `--write` grąžina užduotį (1 → 0 → 1), o `--check` su moduliu `21-erdvines-figuros`
  be praplėtimo → `rc=1`. Kiti vartai: `validate_content.py --grade 1` 0/0,
  `check_language.py --grade 1` 0 klaidų (7 įspėjimai — buvę), `check_ui.py` 0/0,
  `check_art.py` ✔, `check_lessons.py` ✔ 90 įrašų, `check_docs_facts.py` 0/0,
  `check_agents.py` 15 vaidmenų, 1 įspėjimas (7 seni sisteminiai pasiūlymai).
  `system_report.py` po: pasiūlymai 107 (new 14→10, done 83→87, sisteminė eilė
  11→7).
- **Neišspręsta sąmoningai:** #4455 (ataskaitų dydis), #4516 (sakinio ilgis lieka
  įspėjimu — tai turinio sprendimas, ne vartų), #5190 (commit žinutė iš modelio
  teksto), #5342 (worktree izoliacija), #5400 (`sync_docs_facts.py`),
  #7396/#4921 (`check_view.py` 200 % tekstas ir <360 px — reikia Playwright
  matavimo, ne vieno pataisymo), #15045 (alias žemėlapis `progress.js` — kito
  vaidmens failas), #5834 (`blocked`, reikia žmogaus sprendimo).
  `agents/scope.json`, `content/`, `assets/js/sims/`, CSS ir kitos klasės neliestos.
