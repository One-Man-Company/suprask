# Klausimai, į kuriuos dar neturime atsakymo

Šis sąrašas — ne idėjų dėžė, o **darbų eilė tyrėjui**. Klausimas įrašomas tik tada, kai jo trūkumas jau trukdė priimti sprendimą. Atsakius — klausimas perkeliamas į atitinkamą `foundations/` ar `curriculum/` įrašą ir išbraukiamas.

## Amžiaus tinkamumas

- [ ] **Kiek interaktyvių elementų 6–7 metų vaikas gali valdyti vienu metu?** Reikia tyrimų apie vaikų darbinę atmintį ir UI sudėtingumą (ne suaugusiųjų standartus).
- [ ] **Ar garsas visada padeda, ar 1 klasėje gali trukdyti?** Naršyklės balso tempas ir kokybė skiriasi; reikia duomenų apie naudą pradedantiesiems skaitytojams.
- [ ] **Kiek laiko 6–7 metų vaikas išlaiko dėmesį viename modelyje?** Dabartinė prielaida 8–12 min. — ar pagrįsta?

## Sąveikos dizainas

- [ ] **Ar tempimas (drag) ar bakstelėjimas (tap) geriau 1–2 klasei?** Šiuo metu visur naudojamas bakstelėjimas — ar tai riboja?
- [ ] **Kiek klaidų toleruoti prieš parodant sprendimą?** Dabartinė tvarka: užuomina → modelio žingsnis → niekada neparodome atsakymo. Ar tai neper daug?
- [ ] **Keturios garso savybės (trukmė, aukštumas, garsumas, tembras) — vienas modulis ar keturi?** Gairės draudžia daugiau nei vieną naują sąvoką, o padalijus gaunasi keturi beveik identiški moduliai. Kol neatsakyta, garso savybių tema lieka ne kuriama (ideator, paleidimas #2). Paleidimas #128 pasiūlė trečią variantą — vienas modulis apie vieną ašį, aukštumą, su dokumentuota painiava „aukštas = garsus“ (`agents/proposals/2026-11-08-ideator-garso-aukstis.json`); klausimas lieka atviras, kol metodininkas ar žmogus nepatvirtina tokios aprėpties.
- [x] **Kaip ekrane perteikti masę, kai programa prašo ją „pajausti“?** 1 kl. matematikos programa („Masė“, `matematika-1-klase.md:139`) sako „mokomasi **pajausti**, kokių daiktų masę tinka/netinka apibūdinti kilogramu“. Ekranas negali duoti svorio pojūčio, o „spėti ir tikrinti“ be jo virsta spėlionėmis apie paveikslėlius. Kol neatsakyta, masės modulis ne kuriamas (ideator, paleidimas #4).
  **Atsakyta 2026-11-16 (ideator #312).** „Pajausti“ nereiškia rankos pojūčio ekrane: tas pats programos dokumentas `sources/pradinio-bp-rekomendacijos-2024.txt:1010–1014` „mato jausmą“ apibūdina kaip gebėjimą žinoti, kokiais vienetais apibūdinami aplinkos dydžiai ir kokie prietaisai tam naudojami, o metodą — „spėti ir tikrinti“: įvertinti „iš akies“, tada išmatuoti prietaisu ir aptarti rezultatą. Masės tema `:33783–33784` tą patį kartoja: kilogramas, tinkamumas vienetui, prietaisai. Todėl modeliui užtenka trijų dalių — vienodų matmenų, bet skirtingo turinio daiktų, svarstyklių su svarsčiu ir spėjimo prieš matavimą; rankos pojūtis lieka veiklai be ekrano (T8.3, teacher.offline). Gramai, tonos ir vienetų sąryšiai lieka 2 klasei (`:1015–1017`). Pasiūlymas: `agents/proposals/2026-11-16-ideator-mase-ir-kilogramas.json`.

## Technologijos (1 klasė)

- [ ] **Kaip 1 klasėje parodyti elektros grandinę, nepavaizdavus elektros kaip matomos medžiagos?** 23.4 sritis prašo jungiklio ir srovės, bet tyrimai rodo, kad maži vaikai elektrą linkę įsivaizduoti kaip daiktą, kurį galima pamatyti ir paimti (Cooke ir Howard, 2014). Kol neatsakyta, judančio „srauto“ animacijos nededame — lieka lemputė kaip vienintelis grįžtamasis ryšys (ideator, paleidimas #12).
- [ ] **Ar medžiagų tinkamumą 1 klasėje galima grįsti plaukimu, kai 23.3 prašo savybių (kieta, minkšta, plastiška, blizgi), o ne tankio?** Programa prašo nustatyti tinkamumą darbui, o tyrimai rodo, kad 6–8 m. vaikas plaukimą aiškina svoriu ir tankio sąvokos dar neturi (Piaget). Kol neatsakyta, modelis lieka ties „numatyk → nuleisk → rinkis“, be „kodėl“ (ideator, paleidimas #12).

## Pasaulio pažinimas (1 klasė)

- [x] **Ar augalų grupių moduliui (medžiai / krūmai / žolės) būtina vietinė realių nuotraukų biblioteka?** `pasaulio-pazinimas-1-klase.md:140` prašo atpažinti rūšis „su realiomis nuotraukomis“, o platforma neturi nei vieno nuotraukų rinkinio ir negali kviesti išorinių resursų (AGENTS.md taisyklė 3). Kol neatsakyta, grupavimo modulis ne kuriamas: pieštos iliustracijos parodytų požymį (vienas kamienas / keli stiebai / žolinis stiebas), bet ne rūšį, o būtent rūšies atpažinimo programa prašo. Klaidinga nuostata, kurią modelis griautų („krūmas — mažas medis“), lieka nefiksuota (ideator, paleidimas #16).
  **Atsakyta 2026-11-16 (ideator #312).** 26.2.3 (`sources/pradinio-bp-rekomendacijos-2024.txt:35165–35166`) turi du gebėjimus: (1) „skirti medžius, krūmus ir žoles“ ir (2) „atpažinti artimiausius aplinkos medžius (klevą, ąžuolą, beržą, eglę, pušį ir 3–4 kitus)“; nuotraukų reikia **antram**, o pirmas yra požymio klausimas (kamienas, stiebai, žolinis stiebas) ir jį galima modeliuoti pieštais augalais. Todėl siūlomas modulis sąmoningai nevartoja rūšių vardų, o antras gebėjimas lieka tam, kam jį skyrė ir pati programa — tiriamajai veiklai ir ekskursijai į mokyklos kiemą, parką ar mišką (`:17641`, „Tyrimas „Medžių lapų tyrimas““ `:17643`), su tikrais lapais (T8.3). Modulio `teacher.goal` ir `teacher.offline` privalo tą ribą pasakyti žodžiais, o modulio užduotys negali prašyti įvardyti rūšies. Pasiūlymas: `agents/proposals/2026-11-16-ideator-medziai-krumai-zoles.json`.

## Gyvenimo įgūdžiai (1 klasė)

- [x] **Ar emocijų atpažinimą galima parodyti modeliu, o ne paveikslėliu, ir neklausiant vaiko apie savo jausmus?** Paleidimas #2 atmetė formą „situacija → viena teisinga emocija“, nes ji pati kuria klaidingą nuostatą, o jausmo priskyrimas sau liečia asmens duomenis (`agents/log/ideator-2026-11-03T1655.md:116–117`). Neeilinis variantas, kurio dar nevertinome: tas pats įvykis dviem skirtingiems vaikams (vienas mėgsta šunis, kitas bijo) — modelis rodytų, kad įvykis jausmo neapsprendžia, ir nė vienas atsakymas nebūtų „neteisingas“. Abejonė ta pati, dėl kurios tema laikoma neatidaryta: gerai nupieštas paveikslėlis su abiem vaikais parodo tą patį, tad gairių 2 klausimas (interaktyvumo nauda) lieka neatsakytas, o be jo projekto „labai aukšta“ reitingas (`kti-dalykai-1-klase.md:150`) nepakanka. Kol neatsakyta, emocijų modulis ne kuriamas (ideator, paleidimas #128).
  **Atsakyta 2026-11-08 (metodininkas #133).** Paveikslėlis parodo **vieną** būseną, todėl iš jo negalima pasakyti, kas padarė skirtumą: dovana ar noras. Noras yra nematomas, tad jo negalima nei parodyti, nei pakeisti — modelis laiko įvykį tą patį ir keičia tik norą, o antras veikėjas (nekintantis noras) parodo, kad veidai kinta ne kartą su įvykiu (kontrolinė pora). Be to, modelis reikalauja spėjimo prieš veiksmą, ko paveikslėlis nereikalauja. Forma „situacija → viena teisinga emocija“ atsisakyta: modelyje du vaikai prie tos pačios dovanos jaučiasi priešingai ir abu teisūs, o vaiko apie jo paties jausmus niekas neklausia (užduotys apie veikėją, refleksija — apie veiksmą). Metodas: `grades/01/metodai.md#M-05`, pagrindas: [[../foundations/jausmas-ir-noras|jausmas-ir-noras]] (Pons ir kt., 2004; Rieffe ir kt., 2005; Widen ir Russell, 2008; Saarni, 1979; Harris ir kt., 1986).

## Žaidimų teorija

- [ ] **Ar „sąžiningumo“ sąvoka 6–7 metų vaikui suprantama be skaičių?** Kokia kalba tai paaiškinti?
- [ ] **Ar varžybos (laimėjau/pralaimėjau) kenkia bendradarbiavimo tikslui?** Reikia šaltinių apie kooperatyvinius žaidimus ir varžybų poveikį.

## Vertinimas

- [ ] **Kaip išmatuoti supratimą, o ne įsiminimą, 3–4 užduotyse?** Kokie užduočių tipai rodo transferą?
- [ ] **Ar savęs vertinimas 1 klasėje realus, ar tai tik suaugusiojo projektas?**

## Platforma

- [ ] **Kodėl pasiūlymų būsena grįžta į „new“ ir kodėl kūrėjas tą patį darbą daro kelis kartus?** 2026-11-07 `agents/runs.db`: 37 pasiūlymai `new`, 8 `done`; #1, #19, #137 ir #153 turi tą pačią pastabą „atblokuota: /goal one-shot neįvykdė darbo“, nors jų tikslai jau įgyvendinti (`content/lt/grade-01/matematika/15-laikas.json`, `16-lygybe-svarstykles.json`). `agents/db.py` `upsert_proposals()` būsenos sąmoningai neperrašo, `kurejas_queue.py` triage turi taisyklę „tema + egzistuojantis tikslas = obsolete“ — vadinasi, būseną atgal grąžina kitas procesas, ne šie du. Kol neatsakyta, eilė kūrėjui vėl duoda jau padarytą darbą (kurejas, paleidimas #88).
- [ ] **Ar pažangos rodymas vaikui motyvuoją, ar kuria spaudimą?** Šiuo metu rodoma tik „atlikta / ne".
- [ ] **Kokia minimali techninė aplinka mokyklose?** Kokie įrenginiai ir naršyklės realiai naudojami 1–4 klasėse?

## Temos, kurių nepasiūlėme (ideator, 2026-11-09)

- [x] **Ar ilgio matavimas priklauso 1 klasei?** Matematikos programoje 1 klasei ilgis neįvardytas (`matematika-1-klase.md:141`), 2 klasei — cm ir mm, o technologijų 23.3.2 sąsaja 1–2 klasei sako „objekto ilgį galima išreikšti ilgio vienetų skaičiumi“ (`pradinio-bp-rekomendacijos-2024.txt:9755–9762`). Kol neatsakyta, modulio nekūriau: jei ilgis 1 klasei priklauso, modelis turėtų būti „tas pats ilgis, skirtingas vienetas — skirtingas skaičius“, o ne liniuotės skalė (LL-23). Sprendimas — programos derintojo ar metodininko.

  **Atsakyta 2026-11-13 (metodininkas #259).** Taip, priklauso. 1 klasės matematikos ilgalaikiame plane yra eilutė **„Ilgis 5“** ir integruota veikla „Kokio ilgio mano kuprinėje esantys daiktai?“ (`sources/pradinio-bp-rekomendacijos-2024.txt:17300–17301`, veiklos tikslas `:17325–17326`), todėl `matematika-1-klase.md:141` („1 klasėje dokumente nenurodytas“) yra netiksli ir taisytina tyrėjo darbe. Modelis pasirinktas būtent toks, kokio klausimas prašė: **tas pats daiktas, skirtingas vienetas — skirtingas skaičius**, be liniuotės skalės ir be cm (LL-23; standartiniai vienetai lieka 2 klasei pagal `:1015–1017`). Modulis `25-ilgis-ir-vienetas` sukurtas 2026-11-10 (paleidimas #218), simuliacija `ilgis-ir-vienetas` (sąvaržėlė 40 px → 6, trintukas 60 → 4, pieštukas 120 → 2, lenta nepakinta), metodas `grades/01/metodai.md#M-07`, pagrindas [[../foundations/vienetas-ir-skaicius|vienetas-ir-skaicius]].
- [ ] **Ar pilietiškumą (bendruomenes) galima modeliuoti 1 klasei?** Programa 1 kl. numato „atpažinti skirtingas bendruomenes, religijas, aplinkas… tolerancijos kitybei“ ir metodą — situacinę diskusiją bei refleksiją (`pasaulio-pazinimas-1-klase.md:45`). Modelis linkęs virsti rūšiavimo ar paveikslėlio užduotimi (gairių 2 klausimas), o bendruomenės vaidmenų modelis dubliuotų dorinio ugdymo „susitarimą“ (`agents/proposals/2026-11-08-ideator-dorinis-susitarimas.json`). Trūksta klaidingos nuostatos, kurią parodytų pasekmė, o ne paaiškinimas.

## Temos, kurių nepasiūlėme (ideator, 2026-11-13 / 2026-11-14)

Pirmoji dalis — #258 parengti, bet neįrašyti atmetimai (pasiūlymo failas nebuvo sukurtas, todėl sprendimai būtų pamesti); antroji — #278 patikra.

- **Orų reiškiniai** — 1 kl. gamtos mokslų plane (26.1.1–26.5.1, `pradinio-bp-rekomendacijos-2024.txt:17616–17670`) tokios temos nėra; saugus elgesys žaibuojant, pučiant stipriam vėjui, esant plikledžiui — 2 kl. 27.1.1 (`:17679–17687`), o orų prognozė dokumente tepasirodo kaip lentelės pavyzdys vyresnėms klasėms.
- **Asmens higiena** — 1 kl. plane nėra; higienos plakatas „Asmens higienos taisyklių sudarymas“ yra 3 kl. 28.1.2 (`:8811–8818`).
- **Dienos rėžimas** — programa remia (`:1515–1530`, 26.1.2 „taikyti praktinį darbą parengiant savo poilsio ir mokymosi režimą“), bet gairių 2 klausimas krenta: vienintelis garbingas modelis būtų 24 val. „biudžetas“, kuris kartoja `14-pinigai` modelį, o vaiko pačio dienos aprašymas liečia asmens duomenis. Klausimas atviras.
- **Veiksmų algoritmas (JEI–TAI)** — šaltinis prieštaringas: 1–2 kl. pasiekimų lentelė mini pasirinkimo komandą (`:12279–12291`), o `:962–963` sako, kad su jei–tai mokiniai susipažįsta **2 klasėje** (LL-23).
- **Šeima ir giminės** — modelis silpnas, o klausimai apie šeimą liečia asmens duomenis.
- **Emocijos ir jausmai** — padengta `01-dovana-ir-noras` (M-05); dashboard'o žyma „DAR NĖRA“ pasenusi.
- **Nusiraminimo būdai** — nėra programos temos ir nėra klaidingos nuostatos su matoma pasekme: kvėpavimo tempas yra tempomatis, ne modelis.
- **Skiemuo / skiemenavimas** — nėra 1–2 kl. lietuvių kalbos pasiekimo (`lietuviu-kalba-1-klase.md:35`), tai jau fiksuoja #12694.
- **Augalo dalys** — 1 kl. programa prašo tik **atpažinti** dalis („šaknys, stiebas / kamienas, lapai, žiedas, vaisius, sėkla“, `:22766`, `:12437–12438`), o **dalių funkcijos** priskirtos 2 klasei: „27.2.1. Augalai. Nagrinėjamos pagrindinių augalo dalių funkcijos“ (`:35167`). Modelis „nuimk dalį ir pamatyk, kam ji buvo“ būtų 2 klasės sąvoka (LL-23), o etikečių klijavimas neatitinka gairių 2 klausimo → modulio nekuriu.
- **Energija (26.5.1)** — 1 kl. plane tik demonstracinis bandymas, pasakojimas ir minčių žemėlapis „Mechaninių ir elektrinių daiktų panašumai ir skirtumai“ (`:17665–17670`); sąvoka 6–7 m. vaikui abstrakti, o pats planas interaktyvumo nereikalauja → gairių 2 klausimas krenta.
- **Žmonių įvairovė (26.2.1)** — planas numato atvejo analizę ir kūrybinę užduotį „Atspėk, kurį draugą apibūdinau“ (`:17632–17635`): tai pokalbio metodas, o draugų apibūdinimas liečia asmens duomenis.
- **Gyvūnai / augintinis (26.2.2)** — „Kaip rūpinuosi savo augintiniu“ modelis kartotų `09-augalo-gyvenimas` ir `20-kas-gyvas` mechaniką (viena sąlyga → pasekmė, kontrolinis objektas) → gairių 5 klausimas krenta.
- **Saugaus eismo taisyklės** — 1 kl. plane (26.1.1–26.5.1) nėra; eilutė „Nagrinėjami kelio ženklai; gatvėje“ (`:8157`) yra vyresnių klasių integracijos lentelėje (prieš ją — partizanų istorija, KMI, kalorijos), o šviesoforo pavyzdys `:22801` iliustruoja pasirinkimo komandą, ne saugų eismą. Dashboard'o žyma „iš dalies“ klaidinanti.
- **Trūkstamas dėsningumų narys** — nereikia naujo modulio: `07-desningumai` jau turi trūkstamą narį grupės viduryje (sim 5-a užduotis, 4-a užduotis). Pastaba `matematika-1-klase.md:103–104` apie „platformoje dar nepanaudotą“ elementą nebegalioja.

### Klausimai tyrėjui (iš tos pačios patikros)

- [ ] **Ar sėklų išbarstymas priklauso 1 klasei?** 1–2 kl. bendrame stulpelyje ciklas baigiamas „vaisių brandinimu ir sėklų išbarstymu“ (`:12437–12439`), o 1 kl. plane (26.2.3, `:17641–17644`) teliko „Nuo sėklos iki sėklos“. Kol neatsakyta, ciklo modulio nekuriu: `09-augalo-gyvenimas` jau duoda seką iki žiedo.
- [ ] **`pasaulio-pazinimas-1-klase.md:82–88` lentelėje trūksta 26.2.1, 26.2.2, 26.2.4, 26.3.1 ir 26.5.1**, nors 1 kl. plane jie yra (`:17626–17670`). Dėl to dashboard'o žymos rodo temas, kurių 1 kl. programoje nėra (orai, saugus eismas), o tikras spragas (žmonių įvairovė, ištekliai, energija) slepia.

## Temos, kurių nepasiūlėme (ideator, 2026-11-16)

- **Muzikos tembras ir trukmė** — jau atviras klausimas apie keturias garso savybes (`klausimai.md:15`); atskiras modulis dubliuotų `01-garso-aukstis` ir `02-ritmas-ir-perkusija`, o be to klausimo sprendimo jo kurti negalima.
- **Drabužių ir avalynės priežiūra (23.3)** — programa temą numato (`research/wiki/curriculum/1-klases-temų-žemėlapis.md:76`), bet vienintelis garbingas modelis yra seka „išskalbk → išdžiovink → išlygink“, kuri kartoja `24-komandu-seka` mechaniką, o klaidingos nuostatos su matoma pasekme neturi (gairių 3 klausimas krenta).
- **Virtualumo etika** — 1 kl. etikos tema numato draugiško elgesio internete taisykles; tai taisyklių sąrašas, kurį geriau pasako mokytojas, o modelis virstų „pasirink, kas draugiška“ testu be pasekmės.
- **Skaičius ir skaitmuo** — šiame sąraše buvo atmesta 2026-11-15 („dubliuoja 19-simto-skaiciu-lentele“), bet patikrinus modulius tai netiesa: `19` moko lentelės krypčių, `05-desimtukas` — dešimtuko sandaros, o skaitmens vietos niekas nestato. Programa skaičiaus ir skaitmens sąvokas įvardija tiesiogiai (`sources/pradinio-bp-rekomendacijos-2024.txt:33739–33740`), todėl 2026-11-16 ji **pasiūlyta**: `agents/proposals/2026-11-16-ideator-skacius-ir-skaitmuo.json`.

## Temos, kurių nepasiūlėme (ideator, 2026-11-18)

**Pasiūlyta:** garsų trukmė / garsų skyrimas (`agents/proposals/2026-11-18-ideator-garso-trukme.json`, D.1.3.1) ir popieriaus lankstymas su karpiniais (`agents/proposals/2026-11-18-ideator-lankstymas-ir-karpiniai.json`, 23.3.1).

- **Dailė „Dekoruotos ir erdvinės raidės“** — oficialus 1 kl. pavyzdys (`:2635–2712`) platformoje nepanaudotas, bet abu garbingi modeliai krenta: erdvės ir plokštumos skyrimas kartotų `21-erdvines-figuros` (tas pats daiktas iš skirtingų pusių), o „ta pati raidė kitoje medžiagoje“ — `01-spalva-ir-nuotaika` („ta pati forma, kita spalva“). Gairių 5 klausimas.
- **Veikėjas (B.2.1.1)** — planuota forma „veikėjo kortelė: kas jis, ką daro, kaip jaučiasi“ (`1-klases-temų-žemėlapis.md:31`) yra žymėjimas, ne modelis: gerai nupieštas paveikslėlis duoda tą patį, o „kaip jaučiasi“ jau sprendžia `01-dovana-ir-noras`. Gairių 2 klausimas.
- **Naminiai ir laukiniai gyvūnai (26.2.2)** — spraga tikra (`pasaulio-pazinimas-1-klase.md:173`), bet tą patį modulį jau ima `agents/proposals/2026-11-16-programos-derintojas-gyvunu-grupes-4-klase.json` (#19997); antro pasiūlymo tam pačiam tikslui nerašau.
- **Muzikos trukmė ir tembras** — blokuoja atviras klausimas `:15` (kiek modulių garso savybėms).
- **Orų reiškiniai, asmens higiena, saugus eismas** — 1 kl. plane jų nėra (`:61–:62`, `:73`); **energija (26.5.1)** — atmesta `:70`; **bendruomenės** — atviras klausimas `:55`.

**Ankstesnis atmetimas panaikintas vienai daliai.** `agents/state.json` `last_ideator_work.rejected` (#179, 2026-11-09) atmetė popieriaus lankstymą dviem argumentais: „modeliuojama ašis dubliuoja `24-komandu-seka`“ ir „simetrija — 2 kl. tema“. Pirmasis netiesa (24 moko komandų tinklelyje, lankstymas neturi nei tinklelio, nei ėjimų), antrasis teisingas ir šiandienos pasiūlyme įvykdytas: ašies ir veidrodžio modulyje nėra, kriterijus — sluoksnių ir skylių skaičius. Todėl tema siūloma iš naujo kitu modeliu, o ne kartojama sena formuluotė.

**Dashboard'o žymos, kurios klaidingos:** „Gyvoji gamta“, „Emocijos ir jausmai“ (padengta `01-dovana-ir-noras`, `:66`), „Kūno dalys“ (26.1.2 dalis `18-kuprine-ir-kuno-dalys`), „Medžiagų savybės“ (`02-medziagu-bandymas`), „Skaičiai iki dvidešimties“ (programa 1 kl. — iki 100, `matematika-1-klase.md:17`).

---

*Įrašyta: 2026-11-03. Šaltinis: sprendimai, kurių negalėjome pagrįsti esama baze.*
