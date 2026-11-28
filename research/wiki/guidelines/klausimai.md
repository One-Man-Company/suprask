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
- [x] **Ar pilietiškumą (bendruomenes) galima modeliuoti 1 klasei?** Programa 1 kl. numato „atpažinti skirtingas bendruomenes, religijas, aplinkas… tolerancijos kitybei“ ir metodą — situacinę diskusiją bei refleksiją (`pasaulio-pazinimas-1-klase.md:45`). Modelis linkęs virsti rūšiavimo ar paveikslėlio užduotimi (gairių 2 klausimas), o bendruomenės vaidmenų modelis dubliuotų dorinio ugdymo „susitarimą“ (`agents/proposals/2026-11-08-ideator-dorinis-susitarimas.json`). Trūksta klaidingos nuostatos, kurią parodytų pasekmė, o ne paaiškinimas.

  **Atsakyta 2026-11-23 (kurejas #452).** Taip, modeliuoti galima, ir klaidinga nuostata rasta: **„bendruomenė — tai tik tie, kurie tokie patys kaip aš“**. Modelis `bendruomenes` (modulis `34-bendruomenes`) turi vieną kintamąjį — pasirinktą bendruomenę — ir du matomas pasekmes: tas pats žmogus (Emilis) pažymimas keliose bendruomenėse, o vienoje būna skirtingų žmonių (mokytoja ir vaikai, Ajus, kurio šeimoje namuose kalbama kita kalba). Tai ne rūšiavimas ir ne paveikslėlis: vaikas keičia pasirinkimą ir mato, kas keičiasi. Dorinio ugdymo „susitarimo“ modelis neliečiamas — čia klausiama, **kas priklauso būriui**, o ne kaip susitarti. Pagrindas: `sources/pradinio-bp-rekomendacijos-2024.txt:7060–7066` (1 kl. — „vaikas suprastų bendruomenių skirtingumus“); tolerancijos formuluotė tame pačiame šaltinyje priskirta 2 kl., todėl modulyje ji imama tik kaip atpažinimas per konkretų pavyzdį, be religijų lyginimo.

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

  **Atsakyta 2026-11-23 (kurejas #478).** Taip, modelis įmanomas, jei sąvoka susiaurinama iki **„kiekvienas turi savo šaltinį“**, o ne „energija apskritai“. Klaidinga nuostata rasta: **„energijos reikia tik tiems, kas juda“** (ir jos atmaina „energija — tai elektra iš kištuko“). Modelis `energijos-saltiniai` (modulis `37-energijos-reikia-visiems`) turi vieną veiksmą — „Atimk energiją“ visiems trims iš karto — ir tris matomas pasekmes: augalas palinksta ir nebeauga, vaiko kamuolys nukrenta ant žemės, mašinėlė sustoja. Augalas vietoje nejudėjo, o vis tiek sustojo; būtent tai, o ne paaiškinimas, paneigia nuostatą. Šaltiniai grąžinami po vieną (saulė, maistas, baterija), todėl kiekvienas dalyvis atgyja savo šaltinio dėka. Abstrakcijos išvengta trimis ribomis: nėra energijos rūšių sąrašo, nėra „mechaninis / elektrinis“ klasifikacijos (grandinė lieka `01-elektros-grandine`) ir nėra augalo sąlygų modelio — `09-augalo-gyvenimas` jau rodo šviesą→augimą, todėl čia augalas imamas tik kaip trečias liudytojas, kad energijos reikia ir tam, kas nejuda. Pagrindas: `sources/pradinio-bp-rekomendacijos-2024.txt:17665–17670` (26.5.1, 2 val., demonstracinis bandymas ir mechaninių/elektrinių daiktų palyginimas).
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

## Temos, kurių nepasiūlėme (ideator, 2026-11-19)

**Pasiūlyta:** žodinis uždavinys — klausimas, o ne skaičiai, pasako veiksmą (`agents/proposals/2026-11-19-ideator-uzdavinio-klausimas.json`, `:765–780`, `:33520–33522`); atimtis peržengiant dešimtį (`agents/proposals/2026-11-19-ideator-atimtis-per-desimti.json`, `:692–699`, `:33520–33521`); gamtos išteklių tausojimas — „išmestas daiktas nedingsta“ (`agents/proposals/2026-11-19-ideator-ismestas-daiktas-nedingsta.json`, 26.3.1, `:8452–8463`, `:17649–17656`).

- **Spalvų maišymas (dailė)** — programa jį įvardija pažodžiui („maišyti dažų spalvas ir išgauti naujų spalvų“), bet oficialiame pavyzdyje tai **2 klasė** (`:2820–2827`, „4 pavyzdys. 2 klasė“). 1 klasei tai būtų LL-23 (modelio kriterijus — vyresnės klasės sąvoka). Dashboard'o žyma „Pirminės spalvos — iš dalies“ klaidina: 1 kl. spalva lieka nuotaikos ir raiškos klausimas (`01-spalva-ir-nuotaika`), o maišymas — 2 kl.
- **Drabužių sezoniškumas (23.2.1)** — programa prašo remtis pluoštų „fizinėmis (laidumas orui, šilumai…) savybėmis“ (`:9433–9443`), o temperatūra 1 klasei nepriskirta (2 kl. ir vėliau, `matematika-1-klase.md:142`). Vienintelis garbingas modelis būtų termometras po sluoksniu → LL-23; be jo lieka rūšiavimas pagal paveikslėlį (gairių 2 klausimas).
- **Mityba / „Sveiko maisto užkandžių dėžutė“ (26.1.2, 23.1)** — grupavimas (augaliniai/gyvuliniai, perdirbti/natūralūs) yra žymėjimas, o pasekmės modelio nėra; „natūralus = sveikas“ modelis virstų moralizavimu, kurį draudžia T5.1.
- **Trintis (26.4.1)** — 1 kl. plane veikla įvardyta („sunkio, tamprumo, trinties jėgų tyrinėjimas“, `:17830–17832`), bet tai 4 kl. plano eilutė (29.3.1), o 1 kl. `17-judejimas` jau sprendžia „kas lemia greitį/atstumą“ vieno kintamojo modeliu → gairių 5 klausimas.

**Patikra, kad pasiūlytų temų dar nėra** (`content/lt/grade-01/index.json`): matematikoje 18 modulių (04–07, 14–27), nė vieno apie žodinį uždavinį (grep „uždavin“ → 0 susijusių atvejų) ir nė vieno apie atimtį per dešimtį (`22-sudetis-per-desimti` — tik sudėtis; `04` užduotys 8+2, 15−4 neperžengia dešimties); pasaulio pažinime 10 modulių, grep „išmes|išmest|šiukšl|sąvart“ → 0 atvejų.

---

*Įrašyta: 2026-11-03. Šaltinis: sprendimai, kurių negalėjome pagrįsti esama baze.*

## Du įrašai apie tą pačią teksto supratimo poziciją (2026-11-22, #450)

`research/wiki/curriculum/backlog.json` turi **dvi** eilutes, nusakančias tą patį dalyką: `A:teksto-supratimas` („Teksto supratimas“, B.1.2, target `11-teksto-supratimas.json`) ir `gap:teksto-skaitymas-su-supratimu-b-1-2-tiesiogine-p` (target `11-teksto-skaitymas-su-supratimu-b-1-2-tiesiogine-p.json`). Abi buvo `missing`/`partial`, abi rodo į tą pačią programos poziciją ir tą patį supratimo klausimą, o `11-` numerį naudoja abi. Modulis `11-teksto-supratimas` sukurtas pagal `A:teksto-supratimas` target'ą; `gap:` eilutė po pergeneravimo automatiškai tapo `covered`, nes jos žodžių kamienai sutapo su nauju moduliu. **Klausimas kuratoriui:** ar `gap:` eilutę reikia šalinti iš `research/wiki/curriculum/lietuviu-kalba-1-klase.md:145`, ar ji turėtų rodyti į būsimą atskirą modulį su kitu failo numeriu? Kol neatsakyta, naujo modulio su `11-teksto-skaitymas-...` kurti nereikia — jis dubliuotų esamą.

## Temos, kurių nepasiūlėme (ideator, 2026-11-23)

**Pasiūlyta trys:** „Aš ir mano šeima“ — giminystė kaip ryšys, ne amžius (`agents/proposals/2026-11-23-ideator-mociute-yra-rysys.json`, C.1.2); trūkstamas dėmuo su keliais sprendiniais — `▢ + ▢ = 18` (`agents/proposals/2026-11-23-ideator-keli-teisingi-atsakymai.json`, B:trukstamas-demuo); elektronikos valdiklio skirtumas — mygtukas vs jungiklis (`agents/proposals/2026-11-23-ideator-mygtukas-ir-jungiklis.json`, 23.4.1).

Atmesta šiame paleidime:

- **Orų reiškiniai, asmens higiena, dienos režimas, nusiraminimo būdai** — jau atsakyta `:63–:65`, `:69`; 1 kl. plane jų nėra.
- **Žmonių įvairovė (26.2.1)** — atvejo analizė ir „Atspėk, kurį draugą apibūdinau“ (`:8411–8412`, `:17632–17635`) lieka pokalbio metodu, o draugų apibūdinimas liečia asmens duomenis (`:73`).
- **Energija (26.5.1)** — `:72`; 1 kl. plane tik demonstracinis bandymas, gairių 2 klausimas krenta.
- **Gamtos ištekliai (26.3.1, target 35)** — programos veikla „Kaip tausoti daiktus klasėje?“ (`:8458–:8462`) yra klasės taisyklių aptarimas; modelį jau duoda `21-kas-sukure-dailka` ir `23-ismestas-daiktas-nedingsta`, trečias modulis kartotų tą pačią pasekmę (gairių 5 klausimas).
- **Bendri gyvų organizmų požymiai (26.2.4, target 39)** — `20-kas-gyvas` jau sprendžia „gyvybę rodo pokytis, ne judėjimas“, o oficiali veikla „Ar vazoninė gėlė kvėpuoja?“ (`:8445–8448`) reikalauja matuoti kvėpavimą, ko 1 klasės modelis sąžiningai parodyti negali (LL-23 šeima).
- **Veikėjas / B.2.1.1** ir **piešinys linija-taškas-dėmė** — atitinkamai `:95` ir potencialus dubliavimas su `21-erdvines-figuros`; laisvo teksto lauko nėra.
- **Fizinis ugdymas (funkciniai judesiai)** — backlog eilutė turi `(be srauto)`, nes platforma neturi fizinio ugdymo krypties: programos tekstas (`research/wiki/curriculum/kti-dalykai-1-klase.md:75–83`) prašo „susipažinti su mokinių turimais ir trūkstamais judėjimo gebėjimais“ ir „abi kūno pusės dirbtų tolygiai“, o tai individualios ūgties stebėjimas, ne modelis. Pagal taisyklę tai struktūrinė spraga (reikia sprendimo dėl naujos krypties ir vertinimo be palyginimo), o ne modulis.

**Dvi struktūrinės pastabos, kurias reikia sutvarkyti prieš generuojant eilę iš naujo:**

1. **`26.1.1` rodoma `partial`, nors modulis yra.** `content/lt/grade-01/pasaulio-pazinimas/25-traumu-prevencija.json` sukurtas ir atitinka M-13. Patikrinta paleidžiant `curriculum_backlog.build(1)` tiesiai: eilutė „traumų prevencija“ (iš spragų lentelės) išeina `covered`, modules `['25-traumu-prevencija']`, o eilutė „Saugus elgesys“ (tą patį kodą turinti žemėlapio eilutė) — `partial` su `['08-metu-laikai','19-dumai-ir-isejimas']`. Po sujungimo pagal kodą `_merge()` ima **griežtesnę** būseną kartu su jos modulių sąrašu (`order = missing 0, partial 1, covered 2`), todėl `covered` eilutės įrodymas (modulis 25) išmetamas, o target lieka `38-traumu-prevencija.json`. Vartai `--check` to nemato (jis lygina tik `source_hash`). Kol nepataisyta, kūrėjas gali pastatyti antrą traumų modulį tam pačiam pasiekimui.
2. **D:elektronika turi du skirtingus target numerius.** `backlog.json` sako `technologijos/07-elektronika.json`, o `agents/proposals/backlog-d-elektronika-elektronika.json` (run_id 0) — `technologijos/04-elektronika.json`. Abu failai neegzistuoja, o esamas `01-elektros-grandine` jau dengia 23.4.1 grandinės branduolį. Reikia vieno sprendimo: ar 23.4.1 laikoma padengta (tada eilutė taisytina), ar kuriamas antras modulis (tada target vienas).

## Išspręsta: drabužių priežiūros modelis (2026-11-23, #454)

2026-11-16 įrašas aukščiau teigė, kad drabužių ir avalynės priežiūrai „vienintelis garbingas modelis yra seka išskalbk → išdžiovink → išlygink“, todėl temos kurti negalima (gairių 3 klausimas krenta). Tai nebuvo teisinga: modelis gali būti ne seka, o **rūšiavimas prieš skalbimą** su matoma pasekme. Sukurtas modulis `content/lt/grade-01/technologijos/06-drabuziu-prieziura.json` (sim „drabuziu-prieziura“): vaikas skirsto baltus ir spalvotus drabužius į dvi pintines, spaudžia „Skalbti“ ir mato, kad balti marškiniai bendrame skalbyne parausta, o purvo dėmės dingo abiem atvejais. Klaidinga nuostata „mašina viską išskalbia, todėl spalva nesvarbi“ turi tiesioginį įrodymą ekrane (LL-143). Avalynė palikta atskirai temai: 23.2.2 programos sakinyje „Praktiškai išbandomi avalynės sutvarkymo būdai“ (`sources/pradinio-bp-rekomendacijos-2024.txt:40061`) — kitas modulis, ne šio modelio išvada.

## Kryptis, kurios nėra backlog'e: lietuvių kalbos C sritis (2026-11-23, #467)

Paleidime #467 programos eilė 1 klasei buvo tuščia: likusios devynios `backlog.json` pozicijos jau turi sprendimą — 26.1.1 yra modulyje `25-traumu-prevencija` (eilės `_merge()` klaida, žr. aukščiau), 26.2.1 (`:73`), 26.5.1 (`:72`) ir 26.3.1 (`:132`) atmestos su priežastimis, 26.2.4 atmesta 2026-11-23 įraše (kvėpavimo modelio 1 kl. negalima parodyti sąžiningai), o `B:trukstamas-demuo`, `C:as-ir-mano-seima` ir `D:elektronika` pasiūlymai (2026-11-23, #466) tebeeilėje. Todėl imta sritis, kurios nėra nė viename backlog'e, bet kurią pati curriculum wiki vadina didžiausia dalyko spraga: **lietuvių kalbos C (rašymas ir teksto kūrimas) neturi nė vieno modulio** (`lietuviu-kalba-1-klase.md:142`, ten pat prašyta atskiro ideatoriaus pasiūlymo su patikrintu 1–2 kl. C kodu).

Pasiūlyti du moduliai su patikrintais kodais:

1. `agents/proposals/2026-11-23-ideator-zinute-skaitytojui.json` → `content/lt/grade-01/lietuviu-kalba/12-zinute-skaitytojui.json` (C.1.2.1, `:33185`). Modelis: žinutė „Ateik!“ ir skaitytojas, kuris elgiasi tik pagal užrašytas korteles. Nuostata „skaitytojas jau žino, ką turiu galvoje“; pagrindas — Glucksberg, Krauss & Weisberg (1966), per mažai informatyvios vaikų žinutės.
2. `agents/proposals/2026-11-23-ideator-pasakojimo-vidurys.json` → `content/lt/grade-01/lietuviu-kalba/13-pasakojimo-vidurys.json` (C.2.1.1, `:33153–33155`). Modelis: trys įvykio kadrai, išėmus vidurinį močiutė telefonu negali perpasakoti. Nuostata „vidurys savaime aiškus“.

Abiem atvejais sąmoningai nenaudojamas laisvo teksto laukas (platformoje jo nėra): kortelės yra vientisi žodžiai su garsu, o tai atitinka C.1.2.1 formuluotę „naudodamasis pagalba arba pavyzdžiu“. Programos pavyzdys „Kokias žinutes siunčiame telefonu?“ yra 2 klasės (`:477–478`), todėl 1 klasei imamas tik informacijos branduolys (kam, kada, kur), o pasirašymas ir skyryba lieka veiklai be ekrano. Pasakojimo modulis taip pat nereikalauja pradžios ir pabaigos, nes pats C.2.1.1 lygis sako „pradžia ir pabaiga sunkiai įžvelgiamos“ — trijų dalių karkasas yra C.2.1.2 (patenkinamas, `:33119–33121`).

Atmesta tame pačiame paleidime (visos priežastys jau buvo aukščiau, kartoji nebuvo): orų reiškiniai (`:63`), asmens higiena (`:64`), saugus eismas (`:75`), gamtos ištekliai 26.3.1 (`:132`), augalo dalys (`:71`), 26.2.4 kvėpavimas (modelis negali sąžiningai parodyti kvėpavimo 1 kl.), energija (26.5.1) ir žmonių įvairovė (26.2.1).

## Išspręsta: 26.2.4 „Bendri gyvų organizmų požymiai“ (2026-11-23, #479)

Ankstesnis įrašas (aukščiau) atmetė 26.2.4 todėl, kad „oficiali veikla ‚Ar vazoninė gėlė kvėpuoja?‘ reikalauja matuoti kvėpavimą, ko 1 klasės modelis sąžiningai parodyti negali“. Tai teisinga tik tada, jei modelis turi **įrodyti** kvėpavimą. Šiandien sukurtas modulis `content/lt/grade-01/pasaulio-pazinimas/39-bendri-gyvu-organizmu-pozymiai.json` (sim `gyvybes-zenklai`, `assets/js/sims/pasaulis.js`) to nedaro ir vis tiek atsako į programos reikalavimą:

- **Viena didelė idėja** — visi gyvi organizmai turi tuos pačius **penkis** programos sąrašo ženklus (`juda, kvėpuoja, auga, maitinasi, dauginasi`, `:12629–12632`), o mašina — ne. Ne „kas yra gyvybė“, o „ar ženklai tie patys“.
- **Kvėpavimas rodomas kaip požymis, ne kaip matavimas.** Scenoje prie lapo atsiranda oro kreivės, o sakinys sako tiesą, kurią galima patikrinti stikline: „Lape yra oro.“ Mokytojo veikla tai patikrina šiltu vandeniu (burbuliukai iš lapo). Modelis niekur neteigia, kad matuoja dujų mainus; anglies dioksido sąvoka 1 klasėje nesakoma ir tai įrašyta `teacher.misconceptions`.
- **Judėjimas neliečiamas iš naujo.** `20-kas-gyvas` jau sprendžia „pokytis, o ne judėjimas“, todėl naujasis modulis judėjimą ima kaip vieną iš penkių ženklų: robotas jį turi (1/5), gėlė — lėtai (lapai pasisuka į šviesą, 5/5). Tai ne prieštaravimas `20-kas-gyvas`, o to paties sąrašo panaudojimas kitam klausimui.
- **Klaidinga nuostata, kurią modelis parodo:** „gėlė nekvėpuoja ir nevalgo, nes neturi burnos“ — gėlė surenka penkis ženklus tame pačiame kadre, kur robotas surenka vieną.

## Skaičių nesutarimas tarp `backlog.json` ir failų (2026-11-23, #479)

Paleidimo prompte esantis „PROGRAMOS PADENGTIS“ blokas teigia „Modulių dabar 69“ ir siūlo target numerius `41-gamtos-istekliai…`, `42-energijos…`, `43-traumu…`, `44-bendri-gyvu…`, o repo failai yra `35-gamtos-istekliai-tarsa-tausojimas.json`, `37-energijos-reikia-visiems.json`, `38-traumu-prevencija.json`; modulių 1 klasėje — 72 (po šio darbo). Pasiūlymo `backlog-26-2-4-…json` target `39-bendri-gyvu-organizmu-pozymiai.json` su failų numeriais sutapo, todėl imtas jis. Skaičių neatitikimas yra generavimo eilės (`curriculum_backlog`) problema, o ne turinio: `check_docs_facts.py` ir `check_registry.py` rodo 72/72, tad viešas skaičius teisingas. Eilės generavimą reikia atnaujinti prieš kitą kūrėjo paleidimą, kitaip jis vėl siūlys failus, kurie jau egzistuoja su kitu numeriu.

Tas pats įrašas liečia ir 26.2.4 padengtį: `backlog.json` iki šiol rodo `partial` su moduliais `['20-kas-gyvas']`, nors dabar tą programos poziciją dengia du moduliai — `20-kas-gyvas` (pokytis, o ne judėjimas) ir `39-bendri-gyvu-organizmu-pozymiai` (penki bendri ženklai). Kol `curriculum_backlog` nepergeneruotas, eilė gali vėl pasiūlyti tą pačią temą; tai programos-derintojo darbas, ne turinio taisymas.

## Maršruto tvarkos keitimas kūrimo commit'e (2026-11-23, #484)

#481 (`kurejas`) perkėlė esamą modulį `07-elektronika` iš 70 į 48 `path.json` poziciją (prie `01-elektros-grandine`). Perkėlimas buvo sąmoningas (`agents/log/kurejas-2026-11-23T1159.md:361`), bet atliktas **kūrimo** commit'e, kuriame nebuvo nė vieno maršruto pakeitimui skirto žingsnio, ir praėjo visus vartus, nes `check_published.py` tuo metu matavo tik aibių sutapimą.

Klausimai, į kuriuos šis vaidmuo neatsako pats:
1. **Kas turi teisę keisti esamų modulių tvarką?** AGENTS.md sako „esama tvarka nesikeistų“, o `ARCHITEKTURA.md` „Struktūros kaita“ leidžia `dizaineris` keisti tvarką (ne daugiau 2 pakeitimų per paleidimą). Ar kūrėjas, įterpdamas modulį į temos kaimynystę, tuo pačiu gali perkelti jau esamą modulį, ar tai turi būti atskiras `path.json` pakeitimas su savo pagrindimu?
2. **Ar `scripts/known_path_order.json` turi būti dokumentuotas kaip sutartis?** Šiandien jis elgiasi kaip `known_renames.json` (įrankio duomenys), bet nuo jo priklauso, ar vaiko „Tęsk nuo čia“ nešokinėja. Ar įrašyti jį į `docs/KURINIO-STANDARTAS.md` §7 (prie `renamed_from`), ar palikti `scripts/` lygmenyje?
3. **Ar priimti #481 perkėlimą, ar grąžinti?** Šiandien tvarka užfiksuota tokia, kokia gyvai (`scripts/known_path_order.json`, 72 ID, `accepted_at` 2026-11-23), nes atšaukimas vėl pajudintų tą patį žingsnį. Jei pedagoginis sprendimas laikomas klaida, jis keičiamas sąmoningu `path.json` + `known_path_order.json` pakeitimu, o ne tyliai.

## Programos eilė tuščia, bet `backlog.json` melagingai rodo `covered` (2026-11-24, #496)

Paleidime #496 „PROGRAMOS PADENGTIS“ blokas 1 klasei rodė 45 padengtas, 1 dalinę (26.1.1) ir 1 be modulio (D:funkciniai-judesiai). Abi likusios eilutės jau turi atsakymą: 26.1.1 turi du modulius `25-traumu-prevencija` ir `38-traumu-prevencija` (eilės `_merge()` klaida, žr. aukščiau), o funkciniai judesiai neturi krypties (`:137`). Todėl imta sritis, kurią pati curriculum wiki įvardija kaip neuždengtą.

**Rastas eilės defektas, svarbus programos-derintojui.** `research/wiki/curriculum/backlog.json` eilutė `A:veikejas` (tema „Veikėjas“, pasiekimas B.2.1.1) turi `status: covered` ir `modules: ['01-dovana-ir-noras', '17-kryptys-ir-vieta']`. Abi vietos neteisingos: `01-dovana-ir-noras` yra gyvenimo įgūdžių modulis apie norą ir jausmą, `17-kryptys-ir-vieta` — matematikos modulis apie kairę/dešinę, o veikėjas ten tepaminėtas kaip figūrėlė. Tai ne padengtis, o raktažodžio „veikėjas“ sugavimas. `lietuviu-kalba-1-klase.md:144` tą pačią spragą vadina atvira: „B.2 … nė vieno modulio“. Kol eilė nepergeneruota, kūrėjas šios temos iš eilės negaus, nors ji yra paskutinė neuždengta lietuvių kalbos sritis. Tai programos-derintojo darbas, ne turinio.

## Temos, kurių nepasiūlėme (ideator, 2026-11-24, #496)

**Pasiūlyta:** šlapių batų džiovinimas (`agents/proposals/2026-11-24-ideator-avalynes-dziovinimas.json`, 23.2.2, `:40061`) ir veikėjo apibūdinimas pagal tekstą (`agents/proposals/2026-11-24-ideator-veikejas-pagal-teksta.json`, B.2.1.1, `:32536–32545`).

- **Maisto laikymo temperatūra (23.1.1)** — programa ją įvardija („pavojus maisto produktams … kintančiame temperatūrų režime (šaldiklyje, šaldytuve, kambario temperatūroje, karštyje)“, `:9545–9558`), bet temperatūra kaip dydis 1 klasei nepriskirta (2 kl. ir vėliau, `matematika-1-klase.md:142`), o garbingas modelis be jos lieka „kur pastatyti puodą“ — žymėjimas be pasekmės (gairių 2 klausimas). Ankstesnį atmetimą (`:112`) tai patvirtina kitu kampu: grupavimas ir „natūralu = sveika“ jau atmesti kaip moralizavimas (T5.1).
- **Funkciniai judesiai (D:funkciniai-judesiai, vienintelė `missing` eilutė)** — `(be srauto)`: platforma neturi fizinio ugdymo krypties, o programa prašo „susipažinti su mokinių turimais ir trūkstamais judėjimo gebėjimais“ — individualios ūgties stebėjimas be kameros ir be palyginimo. Tai struktūrinis sprendimas (nauja kryptis + vertinimas be palyginimo), jau užrašytas `:137`; modulio netinkamoje vietoje nekūriau.
- **Muzikos garsumas ir tembras** — blokuoja atviras klausimas `:15` (kiek modulių keturioms garso savybėms). Nekartojau.
- **Spalvų maišymas, erdvinės raidės (dailė)** — abu atsakyti `:96` ir `:110`; naujo modelio, kuris nepakartotų `01-spalva-ir-nuotaika` ar `21-erdvines-figuros`, neradau.
- **Orų reiškiniai, asmens higiena, saugus eismas, dienos režimas, nusiraminimo būdai** — atsakyti `:63–:65`, `:69`, `:77`; 1 kl. plane jų nėra arba modelis neįmanomas be asmens duomenų.
- **Tekstilės furnitūra (23.2.3)** — programa ją numato, bet modelis „kuri užsegimo priemonė kur“ yra rūšiavimas pagal paveikslą; klaidingos nuostatos su matoma pasekme neradau (gairių 3 klausimas).

## Temos, kurių nepasiūlėme (ideator, 2026-11-24, #497)

**Pasiūlyta:** augalo dalių atpažinimas kaip vieta augale, o ne kaip išvaizda (`agents/proposals/2026-11-24-ideator-augalo-dalys.json`, 26.2.3, `:39581–39582`) ir austo bei megzto audinio struktūra (`agents/proposals/2026-11-24-ideator-austinis-ir-megztas-audinys.json`, 23.2.1, `:9444`, `:6217–6243`).

- **Ritminis pritarimas / ostinatas (muzika, aranžavimas)** — programa 1–2 klasei jį įvardija tiesiogiai („paprasto ritminio pritarimo (pulso ar paprasto ritminio ostinato) pritaikymas dainai“, `:13844`; taip pat `:3559`), bet gairių 5 klausimas krenta: `03-klausymasis` jau turi rezultatą „Pasakau, kuris balsas veda melodiją, o kuris pritaria“, o `02-ritmas-ir-perkusija` simuliacija groja du sluoksnius kartu („Klausyk abiejų sluoksnių kartu. Pulsas žemai, plojimai aukštai“). Trečias dviejų sluoksnių modelis būtų „daugiau to paties“.
- **Sekos kūrimas pagal savo taisyklę (matematika)** — programa prašo „sudaryti seką pagal nurodytą taisyklę, sukurti savo“ (`matematika-1-klase.md:90`), bet tai jau yra: `07-desningumai` trečias rezultatas — „Sugalvoju savo seką ir ją užrašau“.
- **26.1.1 traumų prevencija (vienintelė `partial` eilutė)** — poziciją jau dengia du moduliai `25-traumu-prevencija` ir `38-traumu-prevencija`; trečias dubliuotų. Tai eilės `_merge()` klaida, o ne turinio spraga.
- **D: funkciniai judesiai (vienintelė `missing` eilutė)** — `(be srauto)`, jau užrašyta `:137`: platforma neturi fizinio ugdymo krypties, o programa prašo individualios ūgties be palyginimo.
- **Trintis / „kas priverčia daiktą judėti“ (26.4.1)** — 1 kl. plane minima kaip „sunkio, tamprumo, trinties jėgų tyrinėjimas“, bet tai 4 kl. eilutė (29.3.1) → LL-23; be to, `17-judejimas` jau sprendžia greitį vieno kintamojo modeliu.
- **Dailė** (platformoje vienas modulis) — spalvų maišymas, erdvinės raidės ir simetrija jau atsakyti `:96` ir `:110`; simetrija papildomai yra 2 kl. ir dubliuotų `03-lankstymas-ir-karpiniai`. Naujo modelio su matoma pasekme, kuris nepakartotų `01-spalva-ir-nuotaika`, neradau — tai atviras klausimas dailės krypčiai, ne modulio trūkumas.
- **Maisto laikymas, drabužių sezonas, orai, asmens higiena, saugus eismas** — atsakyti `:60–:75`; 1 kl. plane jų nėra (higiena — 3 kl. 28.1.2, orai — 2 kl. 27.1.1).

**Rasti neatitikimai, kuriuos turi pataisyti tyrėjas / programos derintojas:**

1. `:63–:65` sako, kad dienos režimas atmestas („vienintelis garbingas modelis būtų 24 val. biudžetas“), bet platformoje yra `content/lt/grade-01/pasaulio-pazinimas/30-dienos-rezimas-mityba.json`. Žyma pasenusi — kitas paleidimas neturi šios temos atmesti iš naujo.
2. `pasaulio-pazinimas-1-klase.md` §2.6 (2026-11-16) teigia „26.2.3 medžiai, krūmai, žolės — modulio nėra“, nors `22-medziai-krumai-zoles.json` sukurtas, o §2.5 tikrina tik 8 modulius (dabar jų 22). Ta pati lentelė teigia „26.1.1 traumų — temos nėra“, nors yra du moduliai.
3. Prompt'o „KLASIŲ APIMTIS“ sąrašas mini „Dienos rėžimas — DAR NĖRA“ ir „Orų reiškiniai — DAR NĖRA“. Pirmas neteisingas (`30-dienos-rezimas-mityba`), antras teisingas kaip modulis, bet 1 kl. programoje orų temos nėra (`:63`). Sąrašas generuojamas ne iš `backlog.json`, todėl jo „DAR NĖRA“ žymos negali būti vienintelis darbo šaltinis.

## `backlog.json` eilutė `covered`, nors padengta tik pusė temos (2026-11-24, #498)

`research/wiki/curriculum/backlog.json` eilutė `D:drabuziu-prieziura` turi `status: covered` ir `modules: ["06-drabuziu-prieziura"]`, o jos `outcome` yra „1 klasė. Drabužių, avalynės priežiūra“, `interactivity` — „Sekos pratimas: kaip prižiūri avalynę“. Tai netiesa: modulis `06-drabuziu-prieziura` moko tik drabužių (balti skalbsis atskirai), o avalynę pats atsisako: `:98` sources — „— avalynė paliekama atskiram moduliui, kad modulyje liktų viena idėja“, `:85` `teacher.goal` — „Avalynės priežiūra (batų valymas ir džiovinimas) sąmoningai neįtraukta — tai atskiras modulis“. `grep -rin "avalyn" content/lt/grade-01/` randa **3** eilutes, ir visos trys yra to paties modulio tekstuose; programos 9 skyriaus C3 (`sources/pradinio-bp-rekomendacijos-2024.txt:40061`) avalynę įvardija atskiru sakiniu, o 23.2.2 (`:9458–9468`) — atskiru punktu.

**Kodėl tai svarbu.** „PROGRAMOS PADENGTIS“ blokas generuojamas iš šio failo ir yra eilė, iš kurios kūrėjas ima darbą. Eilutė, pažymėta `covered`, į eilę negrįš, todėl avalynės temos negali uždaryti nė vienas turinio vaidmuo — spraga tampa nematoma, o ne uždaryta. Tai ta pati šeima kaip `:193` (eilutė `A:veikejas` pažymėta `covered` pagal raktažodį, nors B.2.1.1 neturi modulio), bet pjūvis kitas: ten modulis netinkamas, čia modulis tinkamas, tik **vienai iš dviejų temos dalių**.

**Ką siūlome programos derintojui:** (1) skaidyti tokią eilutę į dvi (`D:drabuziu-prieziura` ir `D:avalynes-prieziura`, po atskirą `outcome` ir `interactivity`) arba (2) palikti vieną eilutę ir įrašyti lauką `parts: ["drabužiai", "avalynė"]` su `modules` susiejimu, kad padengtis būtų skaičiuojama **daliai**, o ne eilutei. Kol to nėra, rankinė taisyklė: jei `outcome` mini du daiktus su „ir“ / kableliu, o `modules` yra vienas, eilutė tikrinama žmogaus.

Šiame paleidime eilutės neliečiau (tai ne metodininko failas) — tema tik užrašyta ir su ja susijęs metodas M-16 `/research/wiki/grades/01/metodai.md` (tikslas `content/lt/grade-01/technologijos/08-avalynes-dziovinimas.json`).

## Išspręsta: B.2.1.1 turi modulį (2026-11-24, #500)

`content/lt/grade-01/lietuviu-kalba/14-veikejas-pagal-teksta.json` uždaro `:144` įvardytą spragą. Modelis: paveikslėlis (vaikas, katė, krepšys) lieka **tas pats** visuose trijuose sakiniuose, keičiasi tik sakinys — „pasidalijo“ duoda dosnumą, „paslėpė“ — gobšumą, „neša vandens“ — rūpestingumą. Tai atsako į ankstesnį atmetimą (`:97`): ten paveikslėlis buvo atsakymo šaltinis, čia jis yra kontrolinis dydis. `03-sakinio-zodziai` neliečiamas — jis randa, kas veikia, o naujasis modulis sprendžia, koks veikėjas.

**Programos derintojui:** `backlog.json` eilutė `A:veikejas` vis dar rodo `modules: ['01-dovana-ir-noras', '17-kryptys-ir-vieta']`. Abu neteisingi (žr. `:189`). Taisyklingas susiejimas — `14-veikejas-pagal-teksta`; jei eilutė nepergeneruota, kūrėjas vėl gaus temą kaip `covered`, o `lietuviu-kalba-1-klase.md:144` tebeteigs, kad modulio nėra.

**Matuoklio pastaba (ne turinio defektas).** Rašant ketvirtą užduotį paaiškėjo, kad `check_language.py` sakinio skaidymas (`re.split(r"(?<=[.!?])\s+")`) nematė ribos, kai kabutėse esantis sakinys baigiasi `.“` ir po jo eina tarpas: `„Padavė kamuolį draugui.“ Antras: …` buvo suskaičiuotas kaip vienas 12 žodžių sakinys. Turinys perrašytas taip, kad kiekvienas sakinys baigtųsi skyrybos ženklu be kabutės, bet pats skaidytuvas vertas pataisos — kitaip autorius, rašantis trumpus sakinius kabutėse, gauna klaidingą „per ilgo sakinio“ klaidą ir taiso ne tą dalyką (LL-35 šeima).

## Ideator, 2026-11-25 (#527): trys pasiūlymai ir trys eilės defektai

**Pasiūlyta:** loginės operacijos NE/IR/ARBA su dviem jungikliais ir viena lempa (`2026-11-25-ideator-logines-operacijos-ir-arba.json`, B2.3, `sources:12284` — eilutė stovi 1–2 kl. stulpelyje), maisto laikymo vieta ir laikas (`2026-11-25-ideator-maisto-laikymas.json`, 23.1.1, `sources:9544–9560`) ir raidės forma iš dalių (`2026-11-25-ideator-erdvines-raides.json`, dailės 1 kl. ciklas, `sources:2635`).

**Kodėl dvi iš jų siūlomos iš naujo** (abi jau atmestos — `:195`, `:198`, `:211`) — pasikeitė modelis, ne formuluotė. Maisto laikymo atmetimas rėmėsi tuo, kad be termometro lieka žymėjimas; naujasis modelis termometro nenaudoja, o lygina **tą patį laiką** skirtingose vietose (šaldiklis, šaldytuvas, stalas, palangė), todėl pasekmė matoma be skaičių. Dailės raidės atmetimas rėmėsi dviem kitais modeliais (erdvė/plokštuma ir „ta pati raidė kitoje medžiagoje“); naujasis keičia ne spalvą ir ne medžiagą, o **dalis** — įdėjus kilpą P virsta R, o papuošimas raidės nekeičia.

**Atmesta šiame paleidime (nekartokite be naujo modelio):**

- **Laiko kryptis „vakar / šiandien / rytoj“** — 1–2 kl. ilgalaikio plano pavyzdys ją įvardija (`sources:22941`: „laiko kaitos sąvokas: vakar, šiandien, rytoj; praeityje, dabar, ateityje“), bet `matematika-1-klase.md:150` tą pačią „parą“ priskiria „2 klasei ir vėliau“. Kol tyrėjas neišsprendė, kuri eilutė galioja 1 klasei, modulio nekūriau (LL-23 rizika). Tai atviras klausimas tyrėjui.
- **Melodinis instrumentas (dūdelė, skylutė keičia aukštį)** — programa grojimą nuo 1 kl. rekomenduoja (`kti-dalykai-1-klase.md:35`), bet modelio branduolys būtų tas pats „aukštis ≠ garsumas“, kurį jau sprendžia `01-garso-aukstis` → gairių 5 klausimas.
- **Sekos trūkstamas narys grupės viduryje** — `07-desningumai` ketvirta užduotis jau prašo užpildyti tuščią langelį sekos viduryje, todėl atskiro modulio nereikia.
- **Maisto grupavimas (augaliniai/gyvuliniai, perdirbti/natūralūs)** — liko prie ankstesnio atmetimo (`:199`): tai žymėjimas, o „natūralu = sveika“ moralizuoja (T5.1).
- **Orų, asmens higienos, saugaus eismo, nusiraminimo būdų, dienos režimo** — jau atsakyta (`:60–:77`); šiame paleidime nekartota.

**Eilės defektai, kuriuos turi pataisyti programos derintojas / tyrėjas:**

1. `research/wiki/curriculum/backlog.md:61` eilutė `gap:teksto-skaitymas-su-supratimu-b-1-2-tiesiogine-p` sako „nė vienas modulis nepateikia kelių sakinių teksto“, bet `content/lt/grade-01/lietuviu-kalba/11-teksto-supratimas.json` `sim.config` turi penkių sakinių tekstą („Rytas prie mokyklos“, `sentences` ilgis 5) ir penkis klausimus su kiekvieno sakinio paaiškinimu. Žyma pasenusi — eilutė turi būti uždaryta.
2. `backlog.md:55` eilutė „Erdvinės raidės“ (`D:erdvines-raides`) pažymėta `covered`, nors nė viename dailės ar technologijų modulyje raidės forma nemodeliuojama: `grep -rn "raid" content/lt/grade-01/{daile,technologijos}/` → 0, o vienintelis „raidės formos“ paminėjimas (`assets/js/sims/calba.js:1551`) yra garsų trukmės simuliacijos sakinys. Tai ta pati šeima kaip `:193` ir `:220`: eilutė uždaryta be modulio, todėl spraga eilėje nematoma. Kai atsiras `02-erdvines-raides`, susiejimas turi būti įrašytas į eilutę, kitaip dailė liks „padengta“ su vienu moduliu apie spalvą.
3. `matematika-1-klase.md:103` teiginys „privalomas, bet platformoje dar nepanaudotas elementas — rasti trūkstamus narius“ nebegalioja: `07-desningumai` ketvirta užduotis („Seka: 🔵🔵▢ 🔵🔵⭐ … Kas turi stovėti tuščiame langelyje?“) prašo būtent to.

## Ideator, 2026-11-25 (#528): dvi temos, programa be eilės

**Pasiūlyta:** dailės kūrybos įrankiai — tas pats piešinys pieštuku, flomasteriu ir kreidele (`agents/proposals/2026-11-25-ideator-piesimo-priemones.json`, target `content/lt/grade-01/daile/03-piesimo-priemones.json`, A2, `sources:2655–2661`, `:2669–2671`) ir nežinomo žodžio strategija — paveikslėlis padeda ne visada (`agents/proposals/2026-11-25-ideator-nezinomas-zodis.json`, target `content/lt/grade-01/lietuviu-kalba/15-nezinomas-zodis.json`, `sources:233–234`, B.3.1 `:7610`).

Eilė šiame paleidime buvo tuščia: vienintelė `partial` eilutė (26.1.1) turi du modulius (`25-traumu-prevencija`, `38-traumu-prevencija`), o vienintelė `missing` (D:funkciniai-judesiai) neturi krypties (`:137`). Todėl imtos dvi sritys, kuriose programos tekstas įvardija gebėjimą, o modulio nėra: dailė turi vieną modulį visam dalykui, o nežinomo žodžio strategija yra vienintelė skaitymo dalies eilutė, kurią programa įvardija tiesiogiai ir kurios nekartoja nė vienas modulis.

**Atmesta šiame paleidime (nekartokite be naujo modelio):**

- **Elemento (baterijos) kryptis žibintuvėlyje (23.4.1).** 1–2 kl. eilutė tik įvardija „nuolatinės elektros srovės šaltinius: elementas, elementų baterija, akumuliatorius“ (`:9789–9791`), o *jungimas* („Jungiama elementų baterija“) yra **24.4.3 — 3–4 kl.** (`:10141`). Modelis „įdėk atvirkščiai ir neveiks“ keltų LL-23 (modelio kriterijus — vyresnės klasės sąvoka), todėl 1 klasei nekurtas.
- **„Klausk taip, kad tekstas atsakytų“ (klausimo kėlimas tekstui).** Šaltinis tai remia („patys užduoda klausimus, susijusius su tekstu“, `:236–237`), bet mechanika būtų ta pati kaip `11-teksto-supratimas`: ten klausimas jau ieško sakinio, o čia sakinys ieškotų klausimo — skirtųsi tik kryptis (gairių 5 klausimas).
- **Muzikos temos** (garsumas, tembras, dainos forma, ostinatas) — blokuoja atviras klausimas `:15` (kiek modulių keturioms garso savybėms); ostinatas papildomai kartotų `02-ritmas-ir-perkusija`, kuri jau groja du sluoksnius (pulsą ir plojimus) kartu.
- **Skaičių palyginimas / dėmenų tvarka (matematika).** `16-lygybe-svarstykles` jau rodo, kad 5 + 3 ir 8 yra tas pats kiekis, o 1 kl. programos eilutėse (`:33520–:33740`) palyginimas kaip atskira tema neįvardytas — trūksta įrodymo, ne modelio.
- **Maisto laikymas, erdvinės raidės, loginės operacijos** — jau eilėje (`#50536`, `#50534`, `#50535`); šiame paleidime nekartota.

**Rasti eilės ir wiki defektai (ne turinio taisymai):**

1. `research/wiki/curriculum/lietuviu-kalba-1-klase.md:143` teigia „D.1.3.1 tikrąja prasme (balsiai ≠ priebalsiai be terminų) — nė vieno modulio“. Netiesa: `content/lt/grade-01/lietuviu-kalba/07-balsiai-ir-priebalsiai.json` rezultatai — „Skiriu garsus pagal tai, ar kelyje yra kliūtis“ ir „Paaiškinu, kad garso ilgis nepasako, ar kelyje yra kliūtis“ (sim `oro-kelias`). Būtent tai yra D.1.3.1 branduolys be terminų. Eilutė pasenusi ir gali nusiųsti kūrėją statyti dublikato.
2. `:144` teiginys „B.2 … nė vieno modulio“ taip pat pasenęs: `14-veikejas-pagal-teksta` sukurtas (#500, žr. `:230`). Kol eilutė nepataisyta, kūrėjas gali gauti tą pačią temą antrą kartą.
3. `backlog.md:55` (erdvinės raidės) ir `backlog.md:61` (teksto supratimas) — jau užrašyti `:254–:255`, bet eilutės vis dar sako „covered, modulio nėra“ / „nė vienas modulis nepateikia kelių sakinių teksto“. Šiame paleidime patikrinta dar kartą: `11-teksto-supratimas` `sim.config` turi 5 sakinius ir 5 klausimus, o dailėje raidės formos nemodeliuoja nė vienas modulis.
4. Programos padengties blokas vis dar rodo `26.1.1` su target `42-traumu-prevencija.json`, nors failai yra `25-` ir `38-`. Tai ta pati `_merge()` klaida, aprašyta `:141`; naujo modulio tam kurti negalima.

**Patikra, kad pasiūlytų temų nėra** (`content/lt/grade-01/index.json`): dailė — 1 modulis (`01-spalva-ir-nuotaika`), numeris `03` laisvas; `grep -rn "pieštuk\|flomaster\|kreidel" content/lt/grade-01/daile/` randa **2** eilutes, abi tame pačiame `01-spalva-ir-nuotaika.json` (4-a užduotis apie piešinį be spalvų ir `teacher.offline` veikla), nė viena nemodeliuoja linijos storio. Lietuvių kalba — 12 modulių, numeris `15` laisvas; `grep -rn "nežinom" content/lt/grade-01/` randa **2** eilutes, abi `gyvenimo-igudziai/02-emociju-zodynas.json` (`silent` tekstas ir užduoties paaiškinimas apie nežinojimą), o lietuvių kalbos moduliuose — 0.

## Metodininkas, 2026-11-25 (#529): B2.3 loginės operacijos neturi pozicijos programos eilėje

`research/wiki/curriculum/backlog.json` turi 47 pozicijas, ir nė viena iš jų neapima B2.3 antros dalies — „skiria logines operacijas: NE, IR, ARBA“ (`sources/pradinio-bp-rekomendacijos-2024.txt:12284`, 1–2 klasių stulpelis `:12278`; 1–2 kl. metų plano tema `:22786–22792`; `research/wiki/curriculum/kti-dalykai-1-klase.md:115`). Patikra: `grep -o "operacij[a-z]*" research/wiki/curriculum/backlog.json` → **0** atitikmenų, `grep -rin "logines operacij\|loginių operacij" content/lt/grade-01/` → **0**.

Pasekmė: modulis gali atsirasti tik iš ideatoriaus pasiūlymo (šįkart #50535), o padengties skaičiuoklė jo niekada neprašys ir po įrašymo neužskaitys — eilė liks „45 padengta, 1 iš dalies, 1 be modulio“ nepriklausomai nuo to, ar modulis yra. Tai ne metodininko failas, todėl nieko nekeitė: sprendimas priklauso programos derintojui (`scripts/curriculum_backlog.py` šaltinis — `research/wiki/curriculum/*.md`, o ne `backlog.json` ranka).

**Ką reikia padaryti (programos derintojui):** įtraukti poziciją iš `kti-dalykai-1-klase.md:115` (informacijos kompetencija B2.3, integruojama per matematikos „Modeliai ir sąryšiai“) su `strand: "matematika"`, `modules: []` iki modulio įrašymo ir `modules: ["35-logines-operacijos-ir-arba-ne"]` po jo, tada paleisti `python3 scripts/curriculum_backlog.py --check`. Kol to nėra, siūloma modulio nepernumeruoti pagal eilę (numeris `35-` laisvas matematikoje).

**Antra pastaba tam pačiam derintojui.** Padengties blokas vis dar rodo `26.1.1` su `target: content/lt/grade-01/pasaulio-pazinimas/42-traumu-prevencija.json`, nors repo yra `25-traumu-prevencija` ir `38-traumu-prevencija` (ta pati `_merge()` klaida, aprašyta aukščiau ir ideatoriaus #528 įraše). Ji kartojasi ne pirmą paleidimą, todėl modulio kurti pagal šį `target` negalima — tikrinti `ls content/lt/grade-01/pasaulio-pazinimas/ | grep traumu`.

## Kūrėjas, 2026-11-25 (#532): #50534 įgyvendintas, bet vartai atmetė teisingą klausimą

**Padaryta.** `content/lt/grade-01/daile/02-erdvines-raides.json` — „Dailė: raidė iš dalių“, sim `raide-is-daliu` (`assets/js/sims/daile.js`). Modelis: trys dalys (lazdelė, kilpa, kojelė) su fiksuotomis vietomis, raidė skaičiuojama TIK iš dalių rinkinio (lazdelė → I, +kilpa → P, +kojelė → R), o puošyba (taškeliai, spiralė) piešiama atskiru sluoksniu ir skaitytojo kortelės nekeičia. Šios kombinacijos kortelėje skaitomos „dar ne raidė“ — modelis turi ir prieštaraujančių pavyzdžių (LL-28).

**Sąmoningas nukrypimas nuo pasiūlymo:** pasiūlyme buvo „tiesė, lenkta, ratas ir kilpa“. Rato (apskritimo) atsisakyta, nes jis tame pačiame lauke su lazdele duoda dviprasmišką formą (b/d/p/q priklausomai nuo padėties), o tai jau kita tema (raidžių b/d skyrimas) ir keltų LL-18. Raidė O lieka atskiram moduliui apie apvalias raides.

**Vartų defektas (LL-22 šeima, bet kita priežastis).** `scripts/check_language.py:266–269` klausimo „aiškumą“ tikrina baltuoju sąrašu (`kiek|kur|kaip|kodėl|kuo|kada|kas|ar|įdėk|…`). Sąraše nėra `koks/kokia/kuris` šaknų, nors `kur\w*` pagaudavo tik „kuri/kuris“ atvejus, o „kokia“ — ne. Todėl teisingai suformuluotas klausimas „Raidė papuošta taškeliais ir spirale. **Kokia** raidė skaitoma?“ gavo įspėjimą „neaiškus klausimas — nėra klausiamojo/veiksmo žodžio“, o `--strict` jį paverčia publikavimo kliūtimi. Turinys buvo perrašytas į „Kuri raidė dabar skaitoma?“, bet vartas turi būti taisomas, ne apeinamas: į baltąjį sąrašą reikia įtraukti `kok\w*` (ir `kur\w*` jau yra). Kitaip tas pats įspėjimas grįš kiekvienam moduliui, kuris klausia „kokia spalva / kokia forma“.

**Pasenusi wiki eilutė.** `research/wiki/curriculum/backlog.md:55` (erdvinės raidės) sako „covered, modulio nėra“. Dabar modulis yra, o eilutė vis dar tvirtina priešingai — tą pačią eilutę ideatorius buvo pažymėjęs #528 (`:254–:255`). Kol eilutė nepataisyta, padengties skaičiuoklė apie šią temą nieko nepasako.

## Ideator, 2026-11-26 (#549): dvi temos iš dailės ir matematikos reikšminių žodžių

**Pasiūlyta:**
1. `agents/proposals/2026-11-26-ideator-deme-ir-fonas.json` → `content/lt/grade-01/daile/04-deme-ir-fonas.json`. Ta pati dėmė ant trijų fonų: dėmė matoma tik tiek, kiek skiriasi nuo fono. Nuostata „dėmė matoma dėl savo spalvos“. Evidence: `sources:13558` (dailės „Reikšminiai žodžiai. 1-2 klasės“), `:13571` (dėmė), `:13576` (fonas).
2. `agents/proposals/2026-11-26-ideator-grupavimas-pagal-pozymi.json` → `content/lt/grade-01/matematika/36-grupavimas-pagal-pozymi.json`. Ta pati krūva, trys požymiai (forma / spalva / dydis): grupė priklauso nuo klausimo, ne nuo daikto. Nuostata „daiktas priklauso vienai grupei“. Evidence: A2.1 slenkstinis 1–2 kl. lygis `sources:33537–33544` (`:33492` — blokas „1–2 klasės“).

**Atmesta šiame paleidime (nekartokite be naujo modelio):**

- **Muzikos kvėpavimas („gėlės žiedo uostymas, žvakės pūtimas“, `sources:3369–3373`, 1–2 kl. blokas `:3361`).** Programos eilutė reali ir 1 klasei priklauso, bet garbingo modelio nėra: ekranas gali parodyti tik liepsnos reakciją į oro srovę, o pati žaidimo prasmė yra vaiko kūno pojūtis (ilgas tolygus iškvėpimas), kurio bakstelėjimas nepakeičia. Tai ta pati šeima kaip `:69` („kvėpavimo tempas yra tempomatis, ne modelis“). Jei kas nors imsis, turi pateikti pasekmę, kuri būtų **ne** liepsnos animacija.
- **26.4.1 „daiktai juda skirtingai (tiesiai, lanku)“** (`sources:1560–1563` — oficiali 1 kl. tyrimo eiga su ritiniu, rutuliu ir kiaušinio formos daiktu). Tai reali sprąga (`17-judejimas` sprendžia tik greitį ir plokštumos aukštį), bet modelio scena būtų ta pati nuožulnioji plokštuma, o kintamasis — daikto forma. Kol nėra kito sprendimo, siūlyti trečią tos pačios scenos modulį reiškia gairių 5 klausimo riziką. Sprendimas — metodo autoriaus, ne ideatoriaus.
- **Sakinio pabaigos ženklas („.“ ir „?“).** Programoje tai **3–4 klasės** rašymo lygis (`sources:33481–33483`, blokas „3–4 KLASĖS RAŠYMO PASIEKIMUS ILIUSTRUOJANTYS PAVYZDŽIAI“ `:32980`), ne 1–2 kl. → LL-23.

**Patikra, kad temų nėra** (`content/lt/grade-01/index.json`): dailėje 3 moduliai (`01-spalva-ir-nuotaika`, `02-erdvines-raides`, `03-piesimo-priemones`), numeris `04` laisvas; `grep -rn "fonas\|foną\|fone" content/lt/grade-01/daile/` → **0**. Matematikoje 25 moduliai (04–07, 14–30, 32–35), numeris `36` laisvas; `grep -rn "grupav\|grupuo\|pagal požym" content/lt/grade-01/matematika/` → **0** (žodis „rūšiuoja“ yra tik `teacher.offline` veiklose ir `06-figuros` užduotyse su iš anksto duotomis dėžėmis). `validate_content.py --grade 1`: 0 klaidų, 0 įspėjimų.

**Dashboard'o žymos, kurios klaidina ideatorių.** Žmogaus sąrašas paleidimo prompte vis dar rašo „Orų reiškiniai — DAR NĖRA“, „Asmens higiena — DAR NĖRA“, „Nusiraminimo būdai — DAR NĖRA“ ir „Dienos rėžimas — DAR NĖRA“, nors trys pirmosios atmestos su priežastimis (`:63`, `:64`, `:69`), o dienos režimas jau turi modulį `30-dienos-rezimas-mityba`. Jei sąrašas nebus taisomas, ideatorius gaus tas pačias tris temas iš naujo ir vėl turės jas atmesti.

## Ideator, 2026-11-27 (#574): adresas ir pokalbio eilė — dvi sritys, kuriose programos tekstas įvardija gebėjimą, o modelio nėra

**Pasiūlyta:**
1. `agents/proposals/2026-11-27-ideator-tinklelio-adresas.json` → `content/lt/grade-01/matematika/37-tinklelio-adresas.json`. Vienas ženklas (raidė arba skaičius) paryškina visą eilutę arba stulpelį; du ženklai — vieną langelį. Nuostata „vieno ženklo užtenka pasakyti, kur daiktas“. Evidence: `sources:34020–34023` (oficialus 1 kl. Transformacijų pavyzdys „Varlytė nupiešta langelyje B1… C3 langelyje“), `:34017–34018` (1 kl. Transformacijų aprašas), `:17306` (metų planas „Transformacijos 4“).
2. `agents/proposals/2026-11-27-ideator-pokalbio-eile.json` → `content/lt/grade-01/lietuviu-kalba/16-pokalbio-eile.json`. Dvi žodžių juostos: įjungtos abi iš karto — neįskaitomas ruožas, eina pakaitomis — sakinys susidaro. Nuostata „kad tave suprastų, reikia kalbėti daugiau“. Evidence: `sources:40703` (A.2.3), `:40708–40713` (I lygis A.2.3.1 — 1 kl. reikia būtent jo), `:40838–40841` (1–2 kl. kalbėjimo ir klausymo turinys).

**Kodėl antroji tema — ne dublikatas.** Tai pirma A srities (kalbėjimas, klausymasis ir sąveika) pozicija platformoje: visų 13 lietuvių kalbos modulių `sources` koduose yra tik B, C ir D sritys (patikrinta ieškant `[ABCD]\.\d+` modulių `sources`). `04-kaip-zmones-sveikinasi` renka pastebėjimus (D.5.2), `02-virtualumas` klausia, kaip žodis pasiekia žmogų — abu liečia kalbą, bet ne pokalbio tvarką.

**Atmesta šiame paleidime (nekartokite be naujo modelio):**

- **Simetrija tiesės (ašies) atžvilgiu.** Programa ją 1–2 kl. įvardija ne vieną kartą (`sources:996–1003` — programos pokyčių lentelė, `:1023–1026`, `:1073`, `:22730–22732` — metų plano eilutė). Bet `:1021–1022` ir `:12347–12356` tą pačią temą priskiria 2 klasei („2-oje klasėje ši tema bus plėtojama plačiau“), o `matematika-1-klase.md:124` oficialų pavyzdį skaito kaip tinklelio adresą, o ne simetriją. Kol tyrėjas neatsakė, ar 1 kl. simetrija yra branduolys, ar 2 kl. tema, modulio nekūriau — LL-23 rizika. **Klausimas tyrėjui:** kuri eilutė galioja 1 klasei — `:996–1003` (1–2 kl. blokas) ar `:1021–1022` („2-oje klasėje“)?
- **Asmenvardžių rašyba didžiąja raide (D.2.2).** `sources:40836`, `:40842–40860` — 1–2 kl. pasiekimas, o `:40879–40880` („parašyk žodžius, kurie visada rašomi didžiąja raide“) yra kartu su asmens duomenų užduotimis (`:40862–40883` — „vardas ir pavardė“, „asmens duomenys“). Modulis reikalautų tikrų vardų sąrašo, o AGENTS.md 4 taisyklė draudžia asmens duomenis; be to, `:41154` tą pačią rašybą skiria 3 klasei. Atmesta dviem pagrindais.
- **Plokščios figūros 1 klasei plačiau.** `06-figuros` jau moko formos pastovumo, o `matematika-1-klase.md` §9 rodo, kad kampas, daugiakampis ir kraštinė yra 2 kl. (`sources:1033–1036`). Naujo modelio, kuris nepakartotų sukimo invarianto, neradau.
- **Garso savybių likusios ašys (garsumas, tembras).** Blokuoja atviras klausimas `:15` (kiek modulių keturioms garso savybėms) — klausimas vis dar neatsakytas, todėl nekartojau.
- **Funkciniai judesiai (vienintelė `missing` eilutė).** `(be srauto)` — fizinio ugdymo krypties platforma neturi; tai struktūrinis sprendimas, jau užrašytas `:137`, `:198`. Modulio netinkamoje vietoje nekūriau.

**Patikra, kad temų nėra** (`content/lt/grade-01/index.json`): matematikoje 26 moduliai, numeris `37` laisvas; `grep -rn "tinklelio adres\|langelio adres\|B1\|C3" content/lt/grade-01/matematika/` → tik `14-pinigai` (kaina) ir `16-lygybe-svarstykles` (A1.1 kodas šaltinyje), 0 modelių. Lietuvių kalboje 13 modulių, numeris `16` laisvas; A srities kodų moduliuose **0**; `grep -rn "pokalb\|pašnekov\|pakaitom" content/lt/grade-01/` → tik `15-nezinomas-zodis` `teacher.offline` tekste. `python3 scripts/validate_content.py --grade 1`: 0 klaidų, 0 įspėjimų.

**Eilės defektai (kartojasi, ne mano taisymo sritis).** `research/wiki/curriculum/backlog.json` turi 47 eilutes ir tarp jų **nė vienos lietuvių kalbos A srities pozicijos** — `grep "kalbėj" research/wiki/curriculum/backlog.json` → 0. Todėl A.2.3 modulis, net įrašytas, padengties skaičiuoklėje nepasirodys (ta pati šeima kaip `:281` apie B2.3). Antra: prompt'o „KLASIŲ APIMTIS“ ir toliau rašo „Asmens higiena — DAR NĖRA“, „Orų reiškiniai — DAR NĖRA“, „Nusiraminimo būdai — DAR NĖRA“ ir „Dienos rėžimas — DAR NĖRA“, nors trys pirmosios atmestos su priežastimis (`:63` — orai ir higiena; `:69` — nusiraminimo būdai), o dienos režimas jau turi modulį `30-dienos-rezimas-mityba` (žr. `:191`).

## Ideator, 2026-11-27 (#575): muzikos dermė, transporto maršrutas, du požymiai

**Pasiūlyta trys:**

1. `agents/proposals/2026-11-27-ideator-dermes-garsai.json` → `content/lt/grade-01/muzika/04-dermes-garsai.json`. Trys fiksuotos gaidos, vaikas jas perstato, modelis pagroja ir skaičiuoja rastas eiles iš šešių. Nuostata „jei gaidos tos pačios, tai ir daina ta pati“. Evidence: `sources:3508–3512` (1–2 kl. komponavimas pagal sąlygą), `:3526–3536` („Žaidimai dermės garsais… 2–3 skirtingų gaidų… tris skirtingas gaidas išdėstyti šešiais nepasikartojančiais būdais“), `:13871–13875` (ta pati formuluotė turinio skyriuje), `kti-dalykai-1-klase.md:36–38`.
2. `agents/proposals/2026-11-27-ideator-transporto-priemone-marsrutui.json` → `content/lt/grade-01/pasaulio-pazinimas/42-transporto-priemone-marsrutui.json`. Trys tikslai (kiemas, upė, kitas miestas) ir trys priemonės; vaikas priskiria ir mato, ar kelias įveikiamas. Nuostata „visur reikia greičiausios priemonės“. Evidence: `sources:1564–1567` (oficialus 1 kl. žaidimas „Kelionių agentūra“ ir reikalavimas pasirinkimą *pagrįsti*), `:14985–14987` (1 kl. projektas „TRANSPORTO PRIEMONĖS“), `:22944–22946` (integracijos lentelė: „parinkti transporto priemonę skirtingam atstumui įveikti“).
3. `agents/proposals/2026-11-27-ideator-du-pozymiai-paieska.json` → `content/lt/grade-01/matematika/38-du-pozymiai-paieska.json`. Du nepriklausomi požymiai, skaičiuojama, kiek daiktų lieka. Nuostata „jei pažymėjau raudoną, tai visi raudoni tinka“. Evidence: `sources:22934–22938` („atrinks duomenis pagal vieną ar du nurodytus požymius… grupuoti pagal vieną ar kelis nurodytus požymius“), `:22614–22615` (1–2 kl. blokas). `36-grupavimas-pagal-pozymi` keičia požymį po vieną ir krūvą *padalija*, o naujasis modelis požymius taiko kartu ir *atrenka* dalį.

**Atmesta šiame paleidime (nekartokite be naujo modelio):**

- **Dailės kompozicija horizontaliame ir vertikaliame lape** (`sources:2718–2719`, `:2793–2795`, oficialus 1 kl. ciklas „Kaip susikūrė pasaulis“). Programos sakinys realus, bet garbingo modelio neradau: „lapo kryptis“ ekrane yra ta pati plokštuma, tik pasukta, o tai dubliuotų `21-erdvines-figuros` (tas pats daiktas iš skirtingų pusių). Rizika — gairių 5 klausimas.
- **Meninės raiškos „ritmas“ dailėje** (`:2718`, `:2793`) — tai pasikartojimo įspūdis, o ne skaičiuojamas dydis; modelis be paveikslo virstų „pasirink gražesnį“, t. y. vertinimu, kurį draudžia T5.1 ir T2.5.
- **Laiko kryptis „vakar / šiandien / rytoj“** — tebegalioja `:246` užrašytas klausimas tyrėjui (`:22941` 1–2 kl. blokas vs `matematika-1-klase.md:150` „2 kl. ir vėliau“). Nekartota.
- **Ketvirtoji garso savybė (garsumas, tembras)** — blokuoja atviras klausimas `:15` (kiek modulių keturioms savybėms). Dermės garsų modulis sąmoningai nėra apie garso savybę: jis keičia *eilių tvarką*, o gaidų aukštį laiko fiksuotą.
- **Transporto priemonių rūšiavimas oro / sausumos / vandens** kaip atskiras modulis — tai žymėjimas be pasekmės (gairių 2 klausimas). Maršruto modelis imtas būtent todėl, kad pasirinkimas turi matomą padarinį.
- **Skaičių rikiavimas didėjimo tvarka** (`:13267`, darbo lapo pavyzdys su 10 skaičių, blokas 3–4 kl. — `:13230–13237` kalba apie „seniausias/vyriausias“ ir metus) — LL-23 rizika, be to `04-skaiciu-tiese` ir `30-skaiciavimas-atgal-per-desimti` jau naudoja tvarką tiesėje.

**Patikra, kad temų nėra** (`content/lt/grade-01/index.json`): muzikoje 3 moduliai (`01`–`03`), numeris `04` laisvas, `grep -rn "gaid" content/lt/grade-01/` → **0**; pasaulio pažinime 22 moduliai (08–41), numeris `42` laisvas, `grep -rn "transporto priemon" content/lt/grade-01/` → 1 (`20-kas-gyvas` tyrimo citata), `grep "maršrut"` → 0; matematikoje 26 moduliai, `37` skirtas #574 eilės pasiūlymui, todėl `38`, `grep -rn "du požym\|abu požym"` → 0. `python3 scripts/validate_content.py --grade 1`: 0 klaidų, 0 įspėjimų; `check_agents.py` — be naujų įspėjimų (11 sisteminių pasiūlymų — seni, ne šio paleidimo).

**Eilės defektas, kuris kartoja tą pačią šeimą kaip `:281` ir `:574` įrašas (#575).** `research/wiki/curriculum/backlog.json` neturi nė vienos muzikos komponavimo pozicijos (`grep -o "kompon[a-z]*\|derm[a-zē]*" backlog.json` → 0), nors programos tekstas 1–2 klasei duoda du savarankiškus žaidimus (`:3520–3536`) ir tai yra visa B sritis („Muzikos kūryba“). Taip pat nėra pozicijos transporto maršruto gebėjimui (`:22945–22946`) ir dviejų požymių atrankai (`:22934–22938`) — pastaroji yra ilgalaikio plano *pavyzdyje*, o ne 26.x temų lentelėje, todėl generuoklis jos nemato. Kol eilutė nepergeneruota, trys #575 dienos moduliai padengties skaičiuoklėje nepasirodys; tai programos derintojo darbas (`scripts/curriculum_backlog.py` šaltinis — `research/wiki/curriculum/*.md`, ne `backlog.json` ranka).

## Ideator, 2026-11-28 (#596): seka pagal taisyklę, muzikos tempas

**Pasiūlyta du:**

1. `agents/proposals/2026-11-28-ideator-seka-pagal-taisykle.json` → `content/lt/grade-01/matematika/39-seka-pagal-taisykle.json`. Vaikas stato seką pagal duotą taisyklę, o modelis jo statinį pratęsia ir parodo, ar taisyklė laikosi *kiekvienoje* grupėje. Nuostata „seka teisinga, jei pirmoji grupė atitinka taisyklę“. Evidence: `sources:918–921`, `:12296–12300`, `:33560–33564` (visos trys vietos: „pratęsti… **sudaryti seką pagal nurodytą taisyklę, sukurti savo“**). Eilė pati tai įvardija: `backlog.json` `B:sekos-desningumai` interaktyvumas — „Sekos „tęsėjas“ + **savos taisyklės kūrimas**“, o `07-desningumai` config turi tik `seq/options/answer`.
2. `agents/proposals/2026-11-28-ideator-lopsine-marsas-sokis.json` → `content/lt/grade-01/muzika/05-lopsine-marsas-sokis.json`. Ta pati melodija grojama lėtu / tolygiu / greitu pulsu, o vaikas pasirenka judesį. Nuostata „lopšinė tyli, maršas garsus“ (paskirtį pasako melodija, ne tempas). Evidence: `sources:13927–13930` (1–2 kl. sąvokos: „muzikos tempas (lėtai, ramiai, gyvai, greitai)… daina, šokis, maršas; lopšinė, sutartinė“), `kti-dalykai-1-klase.md:37–39` (aranžavimas 1–2 kl. — „judesių pritaikymas dainai“; klausymosi žanrai). Sąmoningai **ne** garso savybė: keturios savybės yra trukmė, stipris, aukštis, tembras (`:13802–13806`), tempas jų sąraše nėra, todėl atviras klausimas `:15` neliečiamas.

**Atmesta šiame paleidime:**

- **Dailės kompozicija horizontaliame / vertikaliame lape** (`:2717–2719`, `:2789–2795`) — kartoju ne: „lapo kryptis“ ekrane duotų `21-erdvines-figuros` modelį, o „ritmas“ dailėje virstų „pasirink gražesnį“ (T5.1, T2.5). Ta pati priežastis kaip `:159` ir #575 įraše.
- **Maisto produktų grupavimas augaliniai / gyvuliniai / perdirbti** (`:9545–9558`, 23.1.1) — tai žymėjimas be pasekmės, o „natūralus = sveika“ moralizuoja (T5.1); atsakyta `:112` ir `:195`.
- **Orų reiškiniai, asmens higiena, nusiraminimo būdai** — 1 kl. plane jų nėra (`:63–:69`), prompt'o „KLASIŲ APIMTIS“ žymos „DAR NĖRA“ vis dar klaidina.
- **Gyvūnai 26.2.2 „Mano augintinis“** — vienintelis šios temos modulis `10-gyvunu-grupes` jau dengia „naminis / laukinis“ ir prieglaudos diskusiją; „kaip rūpinuosi“ modelis kartotų `09-augalo-gyvenimas` (sąlyga → pasekmė), t. y. gairių 5 klausimas krenta (`:76`).
- **Ketvirtoji garso savybė (garsumas, tembras)** — ir toliau blokuoja `:15`.
- **D: funkciniai judesiai** — vienintelė `missing` eilutė, `(be srauto)`; struktūrinis sprendimas `:137`.

**Patikra, kad temų nėra** (`content/lt/grade-01/index.json`, 87 moduliai): matematika 27 (`35`–`37` aukščiausi; `38` rezervuotas #59753), `grep -rn "sudaryti seką\|savo seką"` → 0 modulių; muzika 4 (`01`–`04`), `05` laisvas, `grep -rn "maršas\|lopšin\|tempas" content/lt/grade-01/` → 0. `python3 scripts/validate_content.py --grade 1` → 0 klaidų, 0 įspėjimų; `check_language.py` → 0 klaidų; `check_agents.py` → be naujų įspėjimų (sisteminiai — seni).

**Pastebėtas defektas toje pačioje srityje (ne ideatoriaus taisymo sritis).** `07-desningumai` `outcomes[2]` deklaruoja „Sugalvoju savo seką ir ją užrašau.“, bet `sim.config.tasks` yra tik `seq / options / answer / prompt` (tęsinys ir trūkstamas vidurys), o nė viena iš 4 užduočių to rezultato netikrina. Tai LL-25 šeima („sąlyga, kurią modelis turi, o užduotis pamiršo“) atvirkščia kryptimi: rezultatas deklaruotas, modelio už jo nėra. Siūlomas `39-seka-pagal-taisykle` yra to rezultato įgyvendinimas, o ne nauja tema šalia jo.

**Eilės defektas (ne šio vaidmens taisymo sritis, kartoja `:281` / `:574` šeimą).** Abi šios dienos temos eilutėje atsiras tik pergeneravus `research/wiki/curriculum/backlog.json`: `B:sekos-desningumai` jau `covered` su `07-desningumai`, nors jo interaktyvumo aprašas prašo „savos taisyklės kūrimo“, o muzikos **tempo** pozicijos `backlog.json` neturi nė vienos (`grep -o "temp[a-z]*" backlog.json` → 0, nors `:13929` jį įvardija 1–2 kl. sąvokų sąraše). Kol `scripts/curriculum_backlog.py` nepergeneruotas, padengtis skaičiuoklėje šie du moduliai nepasirodys.
