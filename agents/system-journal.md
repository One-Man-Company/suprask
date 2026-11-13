# Agentų sistemos dienoraštis

Kiekvienas `sistemos-architektas` paleidimas palieka įrašą: ką matė, ką keitė,
kodėl ir kaip patikrino. Seni įrašai netrinami — jie yra sistemos atmintis.

## 2026-11-07 · pradinis įrašas (ne agento)

- **Mačiau:** sistema turi 14 vaidmenų, 18 modulių, 41 neapdorotą pasiūlymą
  (seniausias prieš 4 d.). Istorijoje 18 `conflict` paleidimų; `metodininkas`
  nenaudingas 75 % paleidimų, `programos-derintojas` — 100 % (1 paleidimas).
- **Keičiau:** sukurtas vaidmuo `sistemos-architektas` (20:20 kasdien), įrankiai
  `scripts/system_report.py` ir `scripts/check_agents.py`.
- **Kodėl:** sistema neturėjo nieko, kas žiūrėtų į visumą — kiekvienas agentas
  matė tik savo darbą.
- **Patikra:** `check_agents.py` — 14 vaidmenų (vėliau 15 su architektu), visi su
  failais, grafikais ir ribomis.

## 2026-11-07 21:51 · sistemos-architektas #48 (pirmas paleidimas, įrašas įrašytas vėliau)

- **Mačiau:** 47 paleidimai per 7 d.; 18 `conflict`, 4 `empty`, 1 `rejected`;
  `metodininkas` nenaudingas 75 %, `programos-derintojas` 100 %, `tikrintojas` 60 %.
  41 pasiūlymas „naujas“, seniausias 4 d. Kūrėjo eilė ėmė tą patį įgyvendintą
  darbą iš naujo (#1071).
- **Keičiau:**
  - `agents/run.py` — vietoje ranka įrašytos eilutės „13 modulių, 13 simuliacijų“
    prompte dabar skaičiuojama `headline()` iš failų (kiekvienas agentas matė
    pasenusį skaičių);
  - `agents/db.py` — nauja `runs.detail` stulpelis: konflikto priežastis lieka DB,
    o ne tik stdout'e (todėl 18 konfliktų buvo nepaaiškinami);
  - `scripts/kurejas_queue.py` — „metodas“ su jau sukurtu moduliu atpažįstamas pagal
    git istoriją (failas atsirado PO pasiūlymo) ir nebeduodamas kaip darbas;
  - `research/wiki/guidelines/pamokos.md` — LL-16 „Būsena, kuri grįžta atgal per
    importą“: vienas laukas turi vieną savininką.
- **Kodėl:** visos trys problemos kartojo tą pačią klasę — būsena ar faktas buvo
  dviejose vietose, todėl sistema „pamiršdavo“ priimtus sprendimus.
- **Patikra:** `check_agents.py` ✔ 15 vaidmenų; `validate_content.py` ✔;
  `check_art.py` ✔; `check_lessons.py` ✔ 16 įrašų; publikavimo vartai ✔.
  Po pataisymo pasiūlymo būsena išlieka `done` po `upsert_proposals()` (zondas).
- **Nepadaryta:** dienoraščio įrašo negeneravo pats (šis įrašas įrašytas ranka);
  dėl to `check_agents.py` dabar įspėja, jei po architekto darbo dienoraštis
  nepapildytas.

## 2026-11-09 20:31 · sistemos-architektas #211

- **Mačiau:** 208 paleidimai per 7 d.; nenaudingų paleidimų dabar daugiausia
  istorinėse šakose (`sveikatos-inspektorius` 100 % iš 1, `metodininkas` 50 %,
  `dizaineris` ir `programos-derintojas` po 50 %), o naujausi paleidimai (nuo
  11-08) — be konfliktų. Pasiūlymai: 93 (new 12, blocked 1, done 71, obsolete 9).
  **Visi 12 `new` yra sisteminiai** (`scripts/`, `agents/`, `docs/`, `dashboard/`) —
  kūrėjas jų sąmoningai neima, o sąrašo, kuriuo kas nors jais eitų, nebuvo:
  kiekvienas toks pasiūlymas yra vartų aklumas, kuris laukia savaitę.
  Konkretūs įrodymai: `check_audio.py` sakė „500 tekstų, visi turi po du įrašus“
  (tiesa), bet diske 1014 mp3, manifestas nurodo 1000 — 14 našlaičių nematomi;
  `check_published.py` sakė „sutampa 35/35“, nors lygino tik ID aibes vienoje
  kietai įrašytoje klasėje, o publikavimo agentas baitų lygybę ėjo įrodinėti
  atskirais zondais du paleidimus iš eilės (#208, #210).
- **Keičiau:**
  - `scripts/check_audio.py` — atvirkštinė kryptis (diskas → manifestas):
    našlaičiai išvardijami, skaičius skelbiamas kaip „naudojama N iš M“, yra
    `--json` ir `--prune`; našlaitis lieka įspėjimu, ne klaida, kad CI nekristų
    dėl istorinių failų.
  - `scripts/check_published.py` — klasės imamos iš `grades.json`
    (`status: live`), kiekvienas modulio failas lyginamas baitais (sha256) su
    repo failu lygiagrečiai, pranešime atskirta „trūksta ID“ / „ID yra, turinys
    pasenęs“; nesutapimas patikrinamas antrą kartą (LL-76).
  - `agents/db.py` — bendra būsena skelbia naudojamų įrašų skaičių, ne disko
    failų (`audio_files` = naudojami, `audio_total` = viso), o `grades_live`
    imamas iš `grades.json`, ne įrašytas ranka.
  - `scripts/system_report.py` — naujas blokas „Sisteminiai pasiūlymai
    (architekto eilė)“ su amžiumi; klasifikacija importuojama iš
    `kurejas_queue.py`, kad nebūtų antro sąrašo.
  - `scripts/check_agents.py` — įspėjimas, kai sisteminis pasiūlymas laukia
    ilgiau nei 3 d.
  - `dashboard/server.py` — garso kortelė rodo „naudojami / viso“.
- **Kodėl:** visi trys pataisymai yra ta pati klasė — **vartai matavo dalį, o
  pranešdavo apie visumą**. Tai ne kosmetika: publikavimo vartai, kurie nemato
  pasenusio failo, palieka vaikui seną turinį su „viskas sutampa“ ataskaita, o
  garso vartai, kurie nemato našlaičių, leidžia manyti, kad 1014 failų yra
  panaudoti. Trečiasis pakeitimas gydo priežastį, dėl kurios tokie pasiūlymai
  užsiguli: eilė buvo, bet jos niekas nematė vienoje vietoje.
- **Patikra:** `py_compile` ✔; `check_published.py` → 35/35, 5,1 s,
  „✔ Repo ir gyva svetainė sutampa (ID, seka ir failų baitai)“; zondas su
  vienu pridėtu baitu modulyje `01-garsas-ir-raide` → „PASENĘS TURINYS … repo
  5045 B, gyvai 5044 B“, `rc=1`, failas grąžintas (`git checkout --`);
  `check_audio.py` → „naudojama 1000 iš 1014 mp3“, 14 našlaičių išvardyti,
  `rc=0`; `check_agents.py` 15 vaidmenų, 0 įspėjimų; `validate_content.py` 0/0;
  `check_ui.py` ✔; `check_lessons.py` 77 įrašai ✔; `check_art.py` ✔;
  `check_language.py --grade 1 --strict` rc 0; dashboard
  `try-restart` + `/api/overview` → `audio_files 1000, audio_total 1014`,
  HTML 200, kortelėje „naudojami iš“.
- **Neišspręsta sąmoningai:** #7396 (`check_view.py` neturi 200 % teksto
  režimo), #4921 (nė vieno <360 px ploto), #5827 (`check_language.py` nemato
  `outcomes`), #4808 (atsarginiai simuliacijų sakiniai), #4516 (sakinio ilgis
  lieka įspėjimu), #4455 (ataskaitų dydis), #5047, #5190, #5342, #5400 —
  visos dabar matomos architekto eilėje su amžiumi. #5834 lieka `blocked`:
  reikia žmogaus sprendimo, ar toliau vertinti kaip neįgyvendintą.

## 2026-11-13 20:20 · sistemos-architektas #274

- **Mačiau:** 241 paleidimas per 7 d.; nenaudingų — `tikrintojas` 25 % (8 paleid.,
  1 tuščias), `metodininkas` 17 %, `ideator` 14 %, `kalbu-redaktorius` 11 %,
  `publikavimo-agentas` 7 %. Pasiūlymai 107 (`new` 14, `done` 83, `blocked` 1,
  `obsolete` 9), seniausias neapdorotas 5 d. Mano paties eilėje — 11 sisteminių,
  9 laukė >3 d. (vienintelis `check_agents.py` įspėjimas). Trys iš jų buvo
  viena klasė su aiškiu įrodymu: `check_audio.py` „✔ Garsas pilnas: 567 tekstų“,
  nors simuliacijų kode buvę `api.speak("Visi taikiniai pasiekti!")` ir
  `api.speak(S.pradek || "Bakstelėk figūrą.")` neturėjo įrašo; ARCHITEKTURA
  tvarkaraščio lentelėje 5 iš 15 eilučių rodė laiką, kurio sistema neturi;
  `add_optional_tasks.py` seną ID praleido tyliai, o „Pridėta 0“ skambėjo
  kaip sėkmė.
- **Keičiau:**
  - `scripts/generate_audio.py` — `spoken_literals()`: statinės `api.speak("…")`
    eilutės ir `||` atsarginiai sakiniai iš `assets/js/sims/*.js` (anksčiau
    tekstai rinkti TIK iš `content/**.json` `sim.config`); `collect()` juos
    įtraukia, todėl manifestas ir vartai ima atskaitą iš tos pusės, kurioje
    vaikas girdi.
  - `scripts/check_audio.py` — pranešama aprėptis („iš jų 8 — tiesioginės
    api.speak eilutės“), kad dalinė aprėptis nebūtų rodoma kaip visuma.
  - `scripts/check_docs_facts.py` — `check_schedule()`: `ROLES` skaitomas iš
    `agents/run.py` per `ast` (ne importuojant bėgiklį), lentelės laikai lyginami
    su `on_calendar`, trūkstamas vaidmuo — klaida.
  - `docs/ARCHITEKTURA.md` — 5 tvarkaraščio eilutės pagal `ROLES` (tikrintojas
    05:50, tyrejas 06:40, ideator 07:40, kurejas 09:00, publikavimo-agentas
    5 kartus per dieną).
  - `scripts/add_optional_tasks.py` — seni ID per `scripts/known_renames.json`,
    aprėpties suvestinė, nieko neatitinkančių raktų sąrašas, `--check` (rc=1).
  - `README.md` — garso skaičiai perskaičiuoti (569 tekstų, 1138 įrašų);
    `research/wiki/guidelines/pamokos.md` — LL-90; `agents/runs.db` — #11235,
    #4808, #14727, #15044 → `done` su įrodymais.
- **Kodėl:** trys darbai turi vieną priežastį — **vartai ėmė atskaitą iš to
  paties šaltinio, kurį saugo**. Garso vartai lygino manifestą su sąrašu,
  sugeneruotu iš to paties `collect()`, todėl santykis buvo teisingas pagal
  konstrukciją, kad ir ko jie nematė; dokumentų vartai lygino skaičius, kuriuos
  patys perskaičiuoja, o tvarkaraštį paliko be vartų; optional įrankis dirbo
  pagal raktą, kurio nebeliko. Visų trijų pasekmė matoma (viena — girdima)
  vaikui, ne tik ataskaitoje.
- **Patikra:** `check_audio.py` prieš → „✔ 567 tekstų, 1134 įrašų“; po taisymo
  → `KLAIDA: 1 tekstų be garso įrašo: Visi taikiniai pasiekti!`, po `||`
  šablonų → dar „Bakstelėk figūrą.“; sugeneravus garsą (Piper, 2 tekstai) →
  „✔ 569 tekstų (iš jų 8 — tiesioginės api.speak eilutės), 1138 įrašų,
  naudojama 1138 iš 1138 mp3“. `check_docs_facts.py` su `check_schedule()` →
  5 klaidos su eilučių numeriais, pataisius lentelę → „0 klaidų, 0 įspėjimų“.
  `add_optional_tasks.py` → „Modulių: 39 · su praplėtimu: 39 · be praplėtimo: 0“,
  „Atpažinta pagal pervadinimą (1): 03-sakinio-tvarka → 03-sakinio-zodziai“;
  scratch zondas: nuėmus `optional` → `--write` grąžina, `--check` su spragą
  turinčiu moduliu → `rc=1`. Kiti vartai: `validate_content.py --grade 1` 0/0,
  `check_language.py --grade 1` 0 klaidų (7 įspėjimai — buvę), `check_ui.py`
  0/0, `check_art.py` ✔, `check_lessons.py` ✔ 90 įrašų, `check_agents.py`
  15 vaidmenų, 1 įspėjimas (7 seni sisteminiai). `system_report.py` po:
  `new` 14→10, `done` 83→87, sisteminė eilė 11→7.
- **Neišspręsta sąmoningai:** #4455, #4516 (turinio sprendimas, ne vartai),
  #5190, #5342, #5400, #7396/#4921 (`check_view.py` 200 % tekstas ir <360 px —
  reikia Playwright matavimo), #15045 (alias `progress.js` — kito vaidmens
  failas), #5834 (`blocked` — žmogaus sprendimas). `agents/scope.json`,
  `content/`, `assets/js/sims/`, CSS ir kitos klasės neliestos.

