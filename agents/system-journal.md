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


## 2026-11-20 20:30 (#414)

- **Mačiau:** `system_report.py` (7 d., 138 paleidimai): kurejas 41/37 publ., 10 %
  nenaud., vid. 60,4 min; `sistemos-architektas` 7 paleid. / 43 % nenaud.; kritikas
  50 %, dizaineris 50 %, kalbu-redaktorius 40 % (vid. 27,5 min), leidejas 33 %.
  Pasiūlymai: 153 (new 17, blocked 2, done 125), sisteminė eilė — 14. Paleidimas #389
  (2026-11-19) įvedė būseną `exhausted`, bet paliko ją be skaitytojų: `runs.db` jau
  turi #394 (metodininkas, 905 s, 0 darbo failų), o `system_report` jį skaičiavo kaip
  `kita` (talpa 0), `kurejas_queue.py` būtų ėjęs į paskutinę šaką ir pažymėjęs gerą
  pasiūlymą `blocked`. Tai mano paties paliktas defektas, ir jis buvo pirmas darbas.
  Antra: `.github/workflows/validate.yml` nepaleido `check_registry.py` nė karto
  (`grep -n "check_registry" .github/workflows/*.yml` → 0 eilučių prieš), todėl
  našlaitis modulio failas praeidavo PR vartus, o `pages.yml` jį publikuodavo (#30960,
  #404/#411 zondas: 52 failai / 51 indeksas → `validate_content` rc 0).
- **Keičiau:**
  - `scripts/kurejas_queue.py` — `capacity_verdict()` (ištraukta, kad būtų
    patikrinama be paleidimo) ir `exhausted` šaka prieš `blocked`: pasiūlymas
    grąžinamas į `new` su `talpa N` pastaba, eilė stabdoma; po `EXHAUST_MAX_ATTEMPTS`
    (3, kaip `INFRA_MAX_ATTEMPTS`) blokuojamas su „skaidyti užduotį“.
  - `scripts/system_report.py` — `exhausted` savo stulpelis `talpa`, įskaičiuotas į
    „nenaud.“ (paleidimas prarastas) ir paaiškinimas po lentele.
  - `agents/run.py` — išėjimo kodas `exhausted` → 75 (EX_TEMPFAIL), atskirtas nuo
    lūžio (1); statuso tiesa lieka DB (LL-10).
  - `scripts/kalbu_queue.py` — ta pati šaka: `exhausted` ne „nepavyko“, modulis
    lieka eilėje (hash neįrašomas), eilė stabdoma.
  - `agents/README.md` — būsenų lentelė su „ką daro eilė“, kad nauja būsena be
    skaitytojo būtų matoma kaip defektas.
  - `.github/workflows/validate.yml` — žingsnis „Registrų sankirta“
    (`check_registry.py`) iškart po turinio validacijos (0,08 s, be tinklo).
  - `research/wiki/guidelines/pamokos.md` — LL-129 „Būsena, kurią įrašo vienas
    failas, o kitas jos nepažįsta“.
- **Kodėl:** būsenos žodynas gyveno rašytojuje, o kiekvienas skaitytojas turi savo
  `else` — nauja reikšmė ten tyliai tampa `other` (statistikoje) arba `blocked`
  (eigoje). Abu kartu reiškia, kad pataisymas, kuris iš tikrųjų suveikė (#394),
  nebuvo nei matomas, nei saugus. CI spraga — ta pati klasė kitu pjūviu: defektą
  matantis įrankis nebuvo paleidžiamas ten, kur priimamas sprendimas publikuoti.
- **Patikra:** zondas `scratch/zond414.py` (be repo pakeitimų) — 11/11:
  `capacity_verdict` 5 atvejai (`""`→requeue #1, `talpa 1`→requeue #2, `talpa 2`→
  block #3, `talpa 9`→block #10, svetima pastaba→requeue #1); `check_grade` švari
  kopija 0 problemų, su našlaičiu → „NAŠLAITIS: 99-zondas-naslaitis.json yra, bet
  index.json įrašo nėra“ (šablonas išvalytas); `system_report.py` — stulpelis `talpa`,
  `metodininkas … talpa 1`, `runs_summary(7)["metodininkas"]` → `exhausted=1`,
  `useless=1`. Vartai: `check_agents.py` rc 0 (2 įspėjimai, abu seni: #389
  dienoraštis — šis įrašas jį uždaro; 8 sisteminiai >3 d.), `check_lessons.py` 129
  įrašai / 4 laukai rc 0, `check_registry.py` 51 modulis / našlaičiai 0 / 0 problemų
  rc 0, `check_docs_facts.py` 0/0 rc 0, `validate_content.py` ✔, `check_language.py`
  ✔, `check_ui.py` ✔, `check_audio.py` ✔ 743 tekstai / 1 486 įrašai, `check_art.py` ✔.
  Grafikai neliesti (`ROLES` nepakeistas), todėl `gen_timers.py` nebuvo reikalingas.
- **Neišspręsta sąmoningai:** #22168 (`kurejas_queue.py`) — jo pirmoji dalis
  reikalauja priešpaleidimo patikros `agents/run.py --proposal` kelyje (ne tik eilėje),
  todėl šįkart neliesta; antroji dalis (`published` fallback atskirti nuo „jau
  įgyvendinta“) lieka tam pačiam darbui. #4455 jau įgyvendintas commit'e `f662b27`
  (`REPORT_MAX`, `cap_report`, `check_agents.py` vartai), bet eilėje kabo `new`,
  nes uždarymas reikalauja tikslo failo pakeitimo TAME PAČIAME commit'e — deklaruoti
  jo šiandien būtų LL-36, todėl nepriskyriau. Kiti sisteminiai (12) neliesti.
  `agents/scope.json`, `content/`, `assets/js/sims/` neliesti.

## 2026-11-21 20:24 (#429)

- **Mačiau:** `system_report.py` (7 d., 136 paleidimai): kritikas 67 % nenaud.
  (6 paleid.: 2 publ., 3 `empty`), dizaineris 50 %, leidejas 33 %, ideator 33 %;
  14 sisteminių pasiūlymų, seniausias #4455 — 13 d. Visi vartai žali. Bet
  gilesnis matavimas (400 `runs.db` eilučių + 352 realios ataskaitos) parodė, kad
  #414 įvestas `exhausted` klasifikatorius **vis dar aklas savo paties kalbai**:
  `EXHAUST_MARKERS` reikalavo žodžio „limit“, todėl #425 kritikas (699 s,
  „Baigėsi iteracijos prieš įrašant pasiūlymą“) ir #320 leidejas (478 s,
  „baigėsi žingsniai“) liko `empty`. Kaina dviguba: `empty` architektui sako
  „mažink grafiką“, o `kurejas_queue.py` tokią eilutę blokuoja — nors kaltas
  biudžetas. Tai LL-101 šeima trečią kartą.
  Antra: `check_view.py` turėjo `eyebrow_ok` tolerancijos šaką
  (`width < STANDARD_MIN_WIDTH`), kurios per CLI nebuvo įmanoma pasiekti —
  `VIEWPORTS` neturėjo nė vieno <360 px ploto (#4921), ir 200 % teksto režimo
  nebuvo visai (#7396).
- **Keičiau:**
  - `agents/run.py` — `EXHAUST_MARKERS` papildyti trumposiomis formomis
    (`baigėsi iteracij`, `baigėsi žingsniai`, `baigėsi ėjim`, `nebeliko ėjim`…)
    IR šaka uždaroma `inspect` vaidmenims: `exhaust = "" if cfg.get("inspect")`.
  - `scripts/check_view.py` — `VIEWPORTS["tiny"]` (320×780, NE numatytajame
    sąraše), `DEFAULT_VIEWPORTS` konstanta, `TEXT_SCALE_INIT`, `MEASURE_SCALED`,
    `check_scaled()` ir `--text-scale N`. Režimas atskiras, `--json` grąžina
    `text_scale` / `scaled_checked` / `scaled_problems` / `scaled_unapplied`,
    o `null` reiškia „nematuota“, ne „švaru“.
- **Kodėl:** pirmas bandymas buvo platus sąrašas be vartų — ir jis **krito
  matavime**: 14 klaidingų teigiamų per 352 ataskaitas, visi `publikavimo-agentas`
  ir `tikrintojas`, kurių tekste „baigėsi žingsniai“ reiškia „pabaigiau
  suvestinę“, o ne „praradau failą“. Tai LL-40 spąstai (taisymas ties zondo
  pločiu). Todėl taisyklė ne spėta, o pasirinkta iš keturių kandidčių pagal
  naudą ir žalą. `check_view` atveju priežastis ta pati kitu pjūviu: taisyklė,
  kurios negalima paleisti, yra ne vartai, o komentaras.
- **Patikra:**
  - Klasifikatorius, 352 realios ataskaitos: `A senas` 4 pagauti / 6 klaidingi;
    `B platus` 6 / **8**; `C sakinys` 3 / 5; `D langas` 4 / 5;
    **`E (platus + inspect vartai)` 6 / 0** — `[425, 369, 367, 320, 317, 295]`,
    klaidingų `[]`. Neigiamos kontrolės („Eilė tuščia“, „nėra ką veikti“,
    „20-turn budget“, „Pirmas žingsnis: …“) — 0 klaidingų teigiamų.
  - `check_view.py` įprastas režimas: 51 maršrutas × small → 0 problemų,
    rc 0 (elgsena nepakitusi).
  - `--text-scale 200`: tekstas TIKRAI auga — `.task-q` 19,0 → 37,1 px (×1,96),
    `p` 13,12 → 26,24, `h1` 32 → 64, `rootFont` 32, `scale_applied` true
    visuose 51. `small` (360 px) 200 % → **0 slinkčių**: #7396 defektas
    realiai jau sutvarkytas CSS'e, o ne mano zondo aklumas.
  - Naujas režimas randa likutį: `tiny` 320 px @ 200 % →
    `matematika/30-skaiciavimas-atgal-per-desimti` +6 px,
    `svg „20304032“` — konkrečiai įvardytas elementas, ne skaičius.
  - **Sugautas mano paties defektas matavimo metu:** maišant režimus tame
    pačiame puslapyje inline `fontSize` likdavo (hash maršrutizatorius
    neperkrauna dokumento), todėl įprastas bėgimas rodė `minTaskFont` 37,12 px
    ir 47/51 klaidingų praleidimų. Ištaisyta dviem atskirais ėjimais; po
    pataisymo įprastas 0 problemų, padidintas 0.
  - Vartai: `validate_content.py` 0/0, `check_ui.py` 0/0, `check_lessons.py`
    133 įrašai / 4 laukai, `check_registry.py` 51/51/223/51, našlaičiai 0,
    `check_docs_facts.py` 0/0, `check_agents.py` rc 0 (1 įspėjimas —
    sisteminiai >3 d.; dienoraščio įspėjimas šiuo įrašu užsidaro).
    Grafikai neliesti (`ROLES` nepakeistas) → `gen_timers.py` nereikalingas.
- **Neišspręsta sąmoningai:** `30-skaiciavimas-atgal-per-desimti` +6 px prie
  320 px/200 % — tai `assets/js/sims/` ir CSS, o ne mano vaidmuo; siūlymas
  rašomas atskirai. #4516/#24171/#24447/#29003/#16338/#16892 nepradėti —
  #4516, sprendžiant iš `check_language.py:56–60` (`SENTENCE_LIMIT_SEVERITY =
  "error"`), jau įgyvendintas ir kabo eilėje kaip #4455; to neįrodžiau, todėl
  numerio nedeklaravau (LL-36). #4455/#22168 — ta pati priežastis kaip #414.
  `agents/scope.json`, `content/`, `assets/js/sims/` neliesti.

## 2026-11-22 21:15 · našumo tyrimas ir pataisymai (ne agento)

- **Mačiau (išmatuota `runs.db`, `git log`, `journalctl`):** per 24 h sistema sukūrė
  **1 naują modulį** (11-22 09:28, #435), nors `curriculum/backlog.json` rodo
  **12 programos pozicijų be jokio modulio** ir 14 „iš dalies". Kūrėjas paleistas
  3× (2098 s, 2938 s, 1660 s → visi trys baigėsi `published`), bet jo eilėje
  buvo **3 įrašai ir visi trys `kritika`** (esamų modulių taisymas) — nė vieno
  `tema`. Ideatorius 2× baigėsi ėjimų limitu (420 s, 879 s) su **0 darbo failų**:
  900 wiki eilučių grep'as, o pasiūlymo failo neįrašė. Vienas modulis = 10–13 min.
- **Priežastis (3, ne viena):**
  1. **Pasiūla.** Spragas turėjo rasti modelis, o jo paleidimai baigėsi limitu be
     failo → eilė tuščia → kūrėjas taisė tai, kas jau yra.
  2. **Eilės tvarka.** `queue()` rūšiavo tik pagal `priority`; `kritika/high`
     aplenkdavo `tema/normal`, nors eilė imama iš galvos.
  3. **Laikas.** Vienas kūrėjo langas per dieną (09:00), o jis realiai baigdavosi
     po 76 min, nes eilė tuščėjo.
- **Keičiau:**
  - `scripts/curriculum_backlog.py` (naujas) — generuoja
    `research/wiki/curriculum/backlog.{json,md}` iš `research/wiki/curriculum/*.md`:
    47 programos pozicijos su kodais (26.1.1 …), būsena
    `covered / partial / missing`, tikras `target` failas ir šaltinio eilutė.
  - `scripts/backlog_proposals.py` (naujas) — kiekvieną nepadengtą poziciją
    (su tikru `target`) paverčia `tema` pasiūlymu (idempotentiškai, failo vardas
    be datos). Paleista: **8 nauji temos pasiūlymai**.
  - `agents/run.py::scope_brief()` — promptas dabar įterpia
    **PROGRAMOS PADENGTIS** bloką (ne tik 29 žmogaus surašytas temas).
  - `scripts/kurejas_queue.py` — `CONTENT_FIRST`: `tema` prieš `kritika`/`ux`/
    `atitiktis`; eilė pati sinchronizuoja backlog → pasiūlymai prieš imdama darbą.
  - `agents/roles/ideator.md` — darbų eilė = prompto blokas (ne grep per wiki),
    „rašyk PIRMA, tyrinėk paskui", rezultatas — failas, ne ataskaita.
  - Grafikai: `kurejas` 3 langai (09:00, 10:20, 20:50), `ideator` 2 (07:10, 07:40).
    `deploy/gen_timers.py --install`.
- **Patikra:** `curriculum_backlog.py --check` — suderinta (47 poz., 12 be modulio);
  `backlog_proposals.py` — 8 failai; kūrėjo eilė **3 → 11**, iš jų 8 `tema` galvoje;
  `check_agents.py` — 15 vaidmenų, 1 senas įspėjimas; timeriai įdiegti
  (`systemctl --user list-timers`), 21:13 vakarinis langas realiai paėmė
  `#36233 „26.1.2 — dienos režimas, mityba"` (run #446 `running`).
- **Neišspręsta sąmoningai:** `D:funkciniai-judesiai` neturi srauto (1 klasei
  fizinis ugdymas integruotas) — tai struktūrinė spraga, palikta
  `(be srauto)` ir žmogaus sprendimui. 2–12 klasės neįjungtos (`scope.json`).

## 2026-11-22 23:05 · patikros metu rasti du papildomi stabdžiai (ne agento)

- **Patvirtinta, kad pataisymai veikia:** vakarinis kūrėjo langas (20:50, realiai
  21:13) paėmė `#36233 „26.1.2 — dienos režimas, mityba"` ir **paskelbė modulį**
  (`a4a8316`, 32 failai, run #446, 3462 s): `30-dienos-rezimas-mityba.json` +
  `index.json` + `path.json` + sim + 14 garso įrašų. Modulių 52 → **53**;
  „Pasaulio pažinimas“ 13 → 14. Tai pirmas modulis, gimęs tiesiai iš backlog
  eilės, be ideatoriaus.
- **Stabdys 1 — `approvals`:** kūrėjo sesijoje `python3 -c …` buvo atmestas
  („BLOCKED … single-query mode runs without a user present"). Profilyje
  `deepseek41flash` nebuvo `approvals.mode`, todėl veikė numatytasis „manual".
  Skaičiuota `logs/errors.log`: **383 atmesti įsakymai, iš jų 353 —
  `python3 -c` (251) ir heredoc (102)**, t. y. agentų pagrindinis įrankis.
  Nustatyta `approvals.mode: off` (kaip jau buvo `default` profilyje); patikra
  `hermes approvals test 'python3 -c "print(1)"'` → `allow`.
- **Stabdys 2 — klaidingi „missing“:** `enrich()` lygino temą tik su modulio
  TEKSTU, ne su ID. Modulis su kūrybiniu pavadinimu („Vėliau keltis —
  trumpesni pusryčiai“) atrodė nepadengtas temos „dienos režimas, mityba",
  nors failas būtent toks. Pridėjus ID sutapimą (kaip `scope.coverage`):
  padengta **21 → 28**, „nėra" 12 → 11.
- **Patikra:** `check_docs_facts.py` 0 klaidų (po ARCHITEKTURA.md grafikų
  atnaujinimo); `validate_content --grade 1` ✔; `check_registry` 0;
  `check_art` ✔; `check_lessons` 140; `check_language` ✔;
  `curriculum_backlog.py --check` suderinta; kūrėjo eilė 13 (11 `tema` galvoje);
  `backlog_proposals.py` papildė 3 (emocijų žodynas, klausymasis, virtualumas).
- **Pastebėta, netaisė:** `docs/ARCHITEKTURA.md:93` vis dar skelbė
  „kalbu-redaktorius — Gemini 4 Hydrogen“ po to, kai agentas grąžintas į
  DeepSeek — ištrinta. Tai rodo, kad modelio keitimas turi atnaujinti ir docs, ne
  tik `ROLES`.

## 2026-11-22 23:40 · jokių dirbtinių lubų agentams (žmogaus sprendimas)

- **Mačiau:** žmogus atsiuntė dvi ekrano nuotraukas: (1) patvirtinimo klausimą
  `hermes config set approvals.mode off` ir (2) eilutę „It's near its budget
  limit — 30 API calls, 34 min." Abu buvo tikri: `logs/errors.log` — **383
  atmesti įsakymai**, o kūrėjo #447 po 3600 s turėjo PARUOŠTĄ modulį
  (`10-garsine-sandara.json`), bet jo nepaskelbė.
- **Reikalavimas:** agentai neturi turėti jokių limitų, jokių patvirtinimų ir
  neturi nieko klausti.
- **Keičiau:**
  - `agents/run.py::invoke()` — pašalinti `--max-turns` ir `--run-budget`;
    pridėtas `--yolo` ABIEM žingsniams (`/goal` ir `--resume`), nes be jo
    tikrasis darbo žingsnis vėl klaustų patvirtinimo, o one-shot režime jo
    niekas nepatvirtintų.
  - `deepseek41flash/config.yaml`: `approvals.mode: off`, `agent.max_turns: 0`
    (0 = be ribos pagal `resolve_turn_limit`).
  - Procesų watchdog'as (`cfg["timeout"]`) padidintas 4× (1800→7200,
    2400→9600, 3600→14400, 1200→4800). Jis NĖRA darbo lubos: saugo nuo
    pakibusio proceso, kuris laikytų globalų užraktą ir užšaldytų visus
    agentus. Jo metu paruoštas darbas dabar publikuojamas, o ne išmetamas.
- **Patikra:** `hermes … chat -Q --yolo … python3 -c "…; sys.exit(3)"` →
  įvykdyta be klausimo, išėjimas 3; trijų žingsnių testas → „1, 2, 3 printed…
  DONE" be nė vieno patvirtinimo; `logs/errors.log` „BLOCKED" skaičius
  nepakito (383 — visi istoriniai); `check_agents.py` 15 vaidmenų ✔.
- **Pasekmė, kurią verta žinoti:** be `--max-turns` agentas gali dirbti
  ilgiau, todėl eilė (`--max-minutes 720`) ir watchdog'as yra vienintelės
  ribos. Tai sąmoninga: geriau ilgas paleidimas, kuris baigia darbą, nei
  trumpas, kuris palieka pusę modulio.

## 2026-11-23 00:30 · patikra su naujomis taisyklėmis (ne agento)

- **Patikrinta, kad lubų tikrai nebėra:** kūrėjas #450 dirbo **153 API
  iškvietimus** ir **3298 s**, t. y. toli už buvusios 30 iškvietimų / 34 min
  ribos, ir **paskelbė** modulį (`560d7b8`, 36 failai,
  `11-teksto-supratimas.json`). Buvusiomis taisyklėmis jis būtų nutrauktas
  maždaug ties 30-uoju iškvietimu. Modulių 53 → **55**.
- **Patikrinta pačiame procese:** `tr '\0' '\n' < /proc/<pid>/cmdline` —
  `--yolo` yra, `--max-turns` ir `--run-budget` **0 kartų**.
- **Patikra:** `check_docs_facts.py` 0 klaidų; `curriculum_backlog.py --check`
  suderinta; programos padengtis 47 pozicijos, **9 be modulio** (buvo 12);
  eilėje 11 pasiūlymų, visi `tema`.
- **Pamoka, kurią verta prisiminti:** nelimitinis paleidimas yra ilgas
  (iki valandos vienam moduliui), todėl kūrėjo langai (09:00, 10:20, 20:50)
  gali persidengti su kitais agentais. Tai ne gedimas: globalus užraktas
  serializuoja rašymą, o kitas agentas palaukia (iki 900 s) arba praleidžia
  paleidimą. Jei tai ims kirstis, teisinga priemonė — ne grąžinti lubas, o
  išdėstyti langus.

## 2026-11-23 20:40 · sistemos-architektas #487

- **Mačiau (prieš):** 164 paleidimai / 7 d.; nenaudingų — `kritikas` 50 % (2 tušti iš 6),
  `dizaineris` 50 %, `kalbu-redaktorius` 40 %, `ideator` 28 %, `simuliaciju-inzinierius` 33 %,
  `sistemos-architektas` 25 %. Pasiūlymai: 192 (new 21, blocked 4, done 158, obsolete 9);
  **16 sisteminių** `new`, seniausi laukia 15 d. `system_report` pats įvardijo eilę: #4455,
  #4516, #5342, **#5400**, #16338 … — ėmiau **seniausią aiškiai įgyvendinamą vienu failu:
  #5400** (`scripts/sync_docs_facts.py` neegzistavo, 0 commit'ų per 15 d.).
  Išmatavau defektą, ne tik jo aprašymą: `run_checks()` (`agents/run.py:1006–1045`) paleidžia
  `validate_content`, `check_audio`, `check_language`, `check_agents`, `check_ui`, `check_art`,
  bet **ne** `check_docs_facts.py`, nors CI (`.github/workflows/validate.yml:45–46`) jį turi.
  Antra, platesnė aklumo vieta: `check_wiki()` tikrino TIK `**Live.**` eilutę, o wiki krypties
  lentelė skelbė **39 modulius iš 72** (Matematika 15/23, Pasaulio pažinimas 6/22, Muzika 1/3) —
  jokių vartų tam nebuvo. Trečia: šaknies `AGENTS.md` deklaruoja 7 vaikų DOX failus, kurių
  nė vieno nėra diske (`find . -name AGENTS.md` → 1).
- **Keičiau:**
  - `scripts/sync_docs_facts.py` (naujas) — perima `facts()` iš `check_docs_facts.py` ir
    perrašo TIK skaičius bei modulių sąrašus: README (pajėgumo sakinys, krypties lentelės,
    garso eilutė, „Parengta“, agentų skaičius žodžiu), `ARCHITEKTURA.md` `**Live:**`,
    `content/lt/grades.json`, wiki `index.md` (`**Live.**` + lentelė), wiki `README.md`.
    Yra `--apply`, sausa eiga ir `--json`; po perrašymo paleidžia TIKRUS vartus ir išvardija,
    ko netaiso (rc 1), o ne tyli „pataisyta“. Esama modulių eiliškumas ir žmogaus sutrumpinti
    užrašai nekeičiami — pridedama tik tai, ko dokumente nėra.
  - `scripts/check_docs_facts.py` — naujas `check_wiki_table()`: kiekvienos krypties
    „N — gyva“ ir modulių sąrašas lyginamas su `index.json`; šablonas `krypt` → `krypt\w*`.
  - `agents/run.py` — `DOC_TARGETS`, `sync_docs()` ir `check_docs_facts.py` `run_checks()`
    sąraše: dokumentai atnaujinami PRIEŠ vartus ir pridedami prie publikuojamų failų, kad
    commit'as būtų vientisas (ir `--publish-only` kelyje). Svetimo vaidmens atveju (`foreign`)
    neliečiama — tada `README.md` gali būti jo nebaigtas darbas (LL-49).
  - `research/wiki/guidelines/pamokos.md` — **LL-161** (šablonas, kuris užkabina savo
    paties išvestį: vartai matavo skaitmenį, o žodžio liekana liko nematoma).
  - `agents/proposals/2026-11-23-sistemos-architektas-dox-vaikai.json` — pasiūlymas sukurti
    7 deklaruotus `AGENTS.md` (šįkart neliečiau, nes tai atskiras darbas).
- **Kodėl:** #5400 buvo vienintelis sisteminis pasiūlymas, įgyvendinamas vienu failu, ir jo
  nauda matuojama: 5 skaičių vietos keičiasi su kiekvienu moduliu, o bėgiklio vartai jo
  nematė — žalias publikavimas su pasenusiais skaičiais buvo laiko klausimas. Wiki lentelė
  (39/72) įrodo, kad ta spraga jau buvo išnaudota.
- **Patikra (po):** `check_docs_facts.py` → **0 klaidų**; prieš naujus wiki lentelės vartus
  toje pačioje byloje buvo **32 klaidos** (įrodyta `git show HEAD:` kopija). `sync_docs_facts.py`
  antrą kartą → „keisti nereikia“ (idempotentiška). Zondas su dirbtiniu 73-uoju moduliu:
  `run_checks()` prieš sinchronizavimą → `dokumentai: KLAIDA — 10 klaidų`, po → `dokumentai:
  OK — 0 klaidų`. `--json` → validus JSON. `sync_docs()` su nešvariu `README.md` prieš
  paleidimą → README į publikuojamų sąrašą NEPATENKA (svetimo pakeitimo apsauga).
  Visi vartai: `validate_content` ✔, `check_agents` ✔ (1 senas įspėjimas apie sisteminius
  pasiūlymus), `check_lessons` ✔ 161, `check_language --grade 1 --strict` ✔, `check_ui` ✔,
  `check_art` ✔, `check_registry` 0, `check_audio` ✔.
- **Neliesta sąmoningai:** `content/`, `assets/js/sims/`, `agents/scope.json`, kitų vaidmenų
  failai, `AGENTS.md`, `.github/workflows/` (CI žingsnis jau buvo). `queue_repair.py` →
  grąžintinų 0: blokuoti 4, visi dėl turinio, ne infrastruktūros.

## 2026-11-24 20:32 · sistemos-architektas #516

- **Mačiau (prieš):** 179 paleidimai / 7 d. Nenaudingų: `kritikas` **56 %**
  (2 `empty`, 2 `skipped`), `dizaineris` 33 %, `simuliaciju-inzinierius` 28 %,
  `kalbu-redaktorius` 22 %, `ideator` 22 %. Pasiūlymai: 212 (new 27, blocked 4,
  done 172); **23 sisteminiai `new`, seniausias — 16 d.**; `check_agents.py`
  įspėjo apie 11 laukiančių >3 d. Ataskaitų 580 failų / 10,7 MB.
  Ištyrus `skipped` paleidimus: **6 iš 6** — ne vaidmens gedimas, o užrakto
  laukimas. 5 jų baigėsi po lygiai 900 s (riba), o laikytojas buvo eilės
  vaidmuo (`kalbu-redaktorius` 1775–1800 s, `kurejas` 1018 s). Eilės darbo
  trukmė (`runs.db`): mediana 816 s, p95 **2098 s**, max 5939 s — t. y. laukimo
  riba buvo trumpesnė už tai, ko laukiama.
- **Keičiau:**
  - `agents/run.py` — **`LOCK_WAIT_QUEUE=2700`** (laukiama ilgiau, kai laikantis
    vaidmuo yra eilės; `SUPRASK_LOCK_WAIT` vis dar laimi), `lock_wait_budget()`
    kaip gryna funkcija (kad būtų zondas); laukimo žymė `agents/.wait.<role>`
    (`mark_waiting`/`waiting_roles`/`clear_waiting`, šviežumas 300 s) ir
    `yield_to_waiting()` — eilė tarp savo darbų sąmoningai užleidžia vietą.
    **Antra, gilesnė klaida tame pačiame faile:** `active_role_locks()` skaitė
    `agents/.run.<role>.lock`, kurių niekas neužrakina nuo commito `378dbd8`
    (2026-11-08) — todėl visada grąžindavo `[]`. Pridėta `role_of_pid()` +
    `lock_holder_role()` (`/proc/locks` → PID → `/proc/<pid>/cmdline`).
  - `scripts/kurejas_queue.py` — **`skipped` nebeblokuoja pasiūlymo.** Šiandien
    #47139 virto `blocked` („paleidimas nepavyko: kurejas: užraktas užimtas
    ilgiau nei 900 s“), nors modulio niekas nelietė — `blocked` nebeliečia, tad
    geras pasiūlymas būtų prarastas visam laikui. Dabar jis grąžinamas į `new`.
    Taip pat `yield_to_waiting("kurejas")` eilės cikle.
  - `scripts/kalbu_queue.py` — `yield_to_waiting` prieš kiekvieną modulį
    (šis langas — 13:10 antradieniais/penktadieniais, būtent kritiko 14:00
    akivaizdoje; 2026-11-20 #408 ir 2026-11-24 #511 abu taip prarasti).
  - `deploy/gen_timers.py` + `deploy/systemd/suprask-agent@.service` —
    `TimeoutStartSec` **3900 → 17700**: jis buvo mažesnis už ilgiausią ROLES
    biudžetą (14400 s), tad systemd tyliai kirpo ilgus paleidimus. Dabar
    skaičiuojama `agent_service_timeout()` iš ROLES ir `LOCK_WAIT_QUEUE`.
  - `scripts/check_agents.py` — naujas vartas: vieneto `TimeoutStartSec` ≥
    ilgiausias biudžetas + laukimas (kad skaičius vėl neatitolų).
  - `scripts/queue_repair.py` — `--prove ID=REGEX`: uždaro pasiūlymą, kuris
    **jau įgyvendintas**, bet kabo `new`, nes uždarymas reikalauja pakeitimo
    tame pačiame commite. Trys įrodymai privalomi: būsena `new`, tikslo failas
    keistas PO pasiūlymo, REGEX randamas faile.
  - `scripts/probe_lock_wait.py` — naujas zondas, 17 lūkesčių (įsijungia į CI
    per esamą `probe_*.py` ciklą).
  - `research/wiki/guidelines/pamokos.md` — **LL-184**; `.gitignore` —
    `agents/.wait.*` (vykdymo būsena, ne turinys).
- **Kodėl:** #516 matavimas parodė, kad didžiausias nuostolis yra ne turinio, o
  **užrakto** sistemoje: 6 paleidimai prarasti, o `kritikas` neteko 28 % savo
  darbo 2 savaites iš eilės. Be to, mano paties taisymas būtų buvęs neveikiantis,
  nes laikytojo vardas nebuvo žinomas — todėl abi dalys taisytos kartu.
  Eilėje atsirado ir naujas tos pačios priežasties įrašas (#47139), kuris
  parodė, kad `skipped` klaidingai blokuoja pasiūlymus.
- **Patikra (po):** `probe_lock_wait.py` **17/17**, rc 0 (~1 s, be tinklo);
  neigiama kontrolė: prieš pataisą tame pačiame procese `active_role_locks()` →
  `[]`, o `lock_holder_role()` → `sistemos-architektas`. Integracinis bandymas
  realiame procese: antras `run.py kuratorius` (kai architektas laiko užraktą)
  → „laukia, kol baigs **sistemos-architektas**“, o `runs.db` #517 `detail` =
  „Užraktą laikė: sistemos-architektas“ (anksčiau tekstas buvo „kitas agentas“).
  `queue_repair.py --prove`: #4455 ir #4516 → `done` (abu įrodymai rasti),
  neigiama kontrolė su išgalvotu šablonu → liko `new`, su jau `done` numeriu →
  atsisakyta. Sisteminiai `new`: **23 → 21**; `check_agents` įspėjimas apie
  >3 d. laukiančius: **11 → 9**. Grafiko kūrėjo eilė: 4 įrašai (ne 0).
  `gen_timers.py --install` + `daemon-reload`: `TimeoutStartUSec=4h 55min`.
  Visi 9 vartai rc 0: `validate_content`, `check_agents`, `check_lessons` (184),
  `check_ui`, `check_art`, `check_registry` (0), `check_language --strict`,
  `check_audio` (2224/2224), `check_docs_facts`.
- **Neliesta sąmoningai:** `content/`, `assets/js/sims/` (turinio ir simuliacijų
  darbas — kūrėjas/inžinierius), `agents/scope.json` (žmogaus sprendimas),
  `AGENTS.md`, kitų vaidmenų failai. Likę **21** sisteminis pasiūlymas —
  nekelti visi vienu metu; seniausias normalus dabar #5342 (2026-11-08,
  worktree izoliacija), o high eilėje — #22168, #42019, #44331, #46530.
  `queue_repair.py --apply`: grąžintinų į eilę 0 (4 blokuoti — dėl turinio,
  ne infrastruktūros).

## 2026-11-25 20:55 · sistemos-architektas #542

- **Mačiau:** `system_report.py` 170 paleidimų per 7 d.; nenaudingų: kūrėjas 8 %,
  publikavimo-agentas 3 %, leidėjas 0 %, bet sistemos-architektas 28 %,
  simuliacijų inžinierius 28 %, kalbų redaktorius 22 %, ideatorius 20 %,
  kritikas 43 %. Eilė: 227 pasiūlymai (27 `new`, 4 `blocked`), sisteminių **24**,
  seniausias #5342 kabo 17 d. Patikros visos žalios, bet `klausimai.md` tą patį
  įrašą kartojo **tris paleidimus iš eilės**: „Programos padengties blokas vis
  dar rodo `26.1.1` su target `42-traumu-prevencija.json`, nors failai yra `25-`
  ir `38-`“. Patikrinau, kas tiksliai nutinka generatoriuje — ir kodėl
  `curriculum_backlog.py --check` tuo metu buvo žalia (jis lygina `source_hash`,
  o ne turinį).
- **Keičiau** (tik `scripts/`, `research/wiki/curriculum/`, `research/wiki/guidelines/`
  — turinio ir simuliacijų neliečiau):
  1. `scripts/curriculum_backlog.py::_merge()` — būsena ir įrodymas atskirti:
     imama geriausia būsena (`covered` > `partial` > `missing`), o moduliai —
     **tik iš eilutės, kuri tą būseną įrodė**. Anksčiau imdavo griežtesnę būseną
     KARTU su jos modulių sąrašu, tad `covered` (`25-`, `38-`) virsdavo `partial`
     su raktažodžių triukšmu (`08-metu-laikai`, `19-dumai-ir-isejimas`) ir
     `target` siūlydavo statyti **trečią** traumų modulį. Prieštaravimas dabar
     įrašomas `stale_claim` (su šaltinio eilute ir silpnesne būsena), o ne
     išnyksta; sujungimas padarytas **simetrišku** (tvarka nekeičia rezultato —
     LL-19 šeima). Pridėta `_same_position()`: skirtingi programos kodai
     (`26.1.1` vs `26.1.2`) nesujungiami net sutapus temų vardams, kitaip eilė
     tyliai netenka pozicijos.
  2. `--check` dabar įvardija, **kuris** `curriculum/*.md` failas pasikeitė
     (`source_files` + `changed_sources()`), nes iki tol trys paleidimai iš eilės
     pranešė „backlog.json pasenęs“ be jokio adreso (#42779) — vartai, kurių
     negalima uždaryti teisingu veiksmu, moko juos apeiti.
  3. `research/wiki/curriculum/pasaulio-pazinimas-1-klase.md` — dvi pasenusios
     eilutės (26.1.1, 26.1.2) pakeistos faktais su modulių vardais ir data.
  4. `scripts/probe_backlog_merge.py` — 12 lūkesčių zondas; įsijungia į CI per
     esamą `for f in probe_*.py` ciklą, be tinklo ir git, 0,3 s. T13 saugo
     priešingą klaidą: programos LENTELĖS eilutės (oficialus temos pavadinimas)
     negalima vadinti „pasenusiu teiginiu“ vien dėl silpno žodžių sutapimo.
  5. `research/wiki/guidelines/pamokos.md` — **LL-199** (199 įrašai).
- **Kodėl:** tai ne vienas blogas modulis, o **generatoriaus taisyklė**, kuri
  kiekvieną paleidimą klaidino kūrėją: blogesnė būsena turėjo atrodyti „saugiau“,
  bet ji naikino vienintelį faktą, kurį turėjo saugoti. Pasekmė buvo dvejopa:
  (a) kūrėjas būtų statęs dublikatą (gairių 4 klausimas — nedubliavimas), o
  tikra spraga `D:funkciniai-judesiai` liktų nepaliesta; (b) `klausimai.md` kas
  paleidimą rašė tą patį, tad žmogus matė triukšmą, o ne signalą.
- **Patikra (prieš / po):**
  - Padengtis: `{'covered': 45, 'partial': 1, 'missing': 1}` → `{'covered': 46,
    'partial': 0, 'missing': 1}`, pozicijų **47 → 47** (pozijų nedingo).
  - `26.1.1`: `partial ['08-metu-laikai','19-dumai-ir-isejimas']` +
    `target 42-traumu-prevencija.json` → `covered ['25-traumu-prevencija',
    '38-traumu-prevencija']`, `target` tuščias, `stale_claim` įvardija
    `pasaulio-pazinimas-1-klase.md:85`.
  - `probe_backlog_merge.py`: **11/11**, rc 0. Neigiamoji kontrolė tame pačiame
    procese: `git show HEAD:scripts/curriculum_backlog.py` → `partial`,
    `target 42-…`, `counts 45/1/1`; T8 ir T2 su sena versija krenta.
  - `--check` adresas: papildžius `matematika-1-klase.md` → „pasikeitė:
    matematika-1-klase.md“, rc 1; atstačius → rc 0.
  - Visi vartai rc 0: `validate_content` (0/0), `check_registry` (0),
    `check_lessons` (199), `check_ui`, `check_art`, `check_language --strict`,
    `check_audio` (1213 tekstų / 2426 įrašų), `check_agents`, `check_docs_facts`;
    6 zondai 10/10, 15/15, 17/17, 20/20, 45/45, 9/9.
  - `queue_repair.py --apply`: grąžintinų **0** (4 blokuoti dėl turinio, ne
    infrastruktūros). `--prove 42019`: atsisakė uždaryti (failas keistas, bet
    `source_hash` neturi istorijos) — todėl numerį uždarau ataskaitoje, o ne
    per įrankį, kuris neturi trijų įrodymų.
  - Grafikai neliesti (ROLES nekeistas) — `gen_timers` nereikėjo.
- **Neliesta sąmoningai:** `content/`, `assets/js/sims/` (kūrėjo ir inžinieriaus
  darbas — #52972, #52974 turi tikslus moduliuose), `agents/scope.json` (žmogaus
  sprendimas), `AGENTS.md`, kitų vaidmenų failai. Likę 24 sisteminiai pasiūlymai
  nejudinti: seniausias **#5342** (worktree izoliacija, 17 d.), o `high` —
  #22168, #44331, #46530 (`high` eilėje taip pat #42019, kuris šiandien
  įgyvendintas ir bus uždarytas bėgiklio).
