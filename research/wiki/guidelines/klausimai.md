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
- [ ] **Kaip ekrane perteikti masę, kai programa prašo ją „pajausti“?** 1 kl. matematikos programa („Masė“, `matematika-1-klase.md:128`) sako „mokomasi **pajausti**, kokių daiktų masę tinka/netinka apibūdinti kilogramu“. Ekranas negali duoti svorio pojūčio, o „spėti ir tikrinti“ be jo virsta spėlionėmis apie paveikslėlius. Kol neatsakyta, masės modulis ne kuriamas (ideator, paleidimas #4).

## Technologijos (1 klasė)

- [ ] **Kaip 1 klasėje parodyti elektros grandinę, nepavaizdavus elektros kaip matomos medžiagos?** 23.4 sritis prašo jungiklio ir srovės, bet tyrimai rodo, kad maži vaikai elektrą linkę įsivaizduoti kaip daiktą, kurį galima pamatyti ir paimti (Cooke ir Howard, 2014). Kol neatsakyta, judančio „srauto“ animacijos nededame — lieka lemputė kaip vienintelis grįžtamasis ryšys (ideator, paleidimas #12).
- [ ] **Ar medžiagų tinkamumą 1 klasėje galima grįsti plaukimu, kai 23.3 prašo savybių (kieta, minkšta, plastiška, blizgi), o ne tankio?** Programa prašo nustatyti tinkamumą darbui, o tyrimai rodo, kad 6–8 m. vaikas plaukimą aiškina svoriu ir tankio sąvokos dar neturi (Piaget). Kol neatsakyta, modelis lieka ties „numatyk → nuleisk → rinkis“, be „kodėl“ (ideator, paleidimas #12).

## Pasaulio pažinimas (1 klasė)

- [ ] **Ar augalų grupių moduliui (medžiai / krūmai / žolės) būtina vietinė realių nuotraukų biblioteka?** `pasaulio-pazinimas-1-klase.md:140` prašo atpažinti rūšis „su realiomis nuotraukomis“, o platforma neturi nei vieno nuotraukų rinkinio ir negali kviesti išorinių resursų (AGENTS.md taisyklė 3). Kol neatsakyta, grupavimo modulis ne kuriamas: pieštos iliustracijos parodytų požymį (vienas kamienas / keli stiebai / žolinis stiebas), bet ne rūšį, o būtent rūšies atpažinimo programa prašo. Klaidinga nuostata, kurią modelis griautų („krūmas — mažas medis“), lieka nefiksuota (ideator, paleidimas #16).

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

- [ ] **Ar ilgio matavimas priklauso 1 klasei?** Matematikos programoje 1 klasei ilgis neįvardytas (`matematika-1-klase.md:141`), 2 klasei — cm ir mm, o technologijų 23.3.2 sąsaja 1–2 klasei sako „objekto ilgį galima išreikšti ilgio vienetų skaičiumi“ (`pradinio-bp-rekomendacijos-2024.txt:9755–9762`). Kol neatsakyta, modulio nekūriau: jei ilgis 1 klasei priklauso, modelis turėtų būti „tas pats ilgis, skirtingas vienetas — skirtingas skaičius“, o ne liniuotės skalė (LL-23). Sprendimas — programos derintojo ar metodininko.
- [ ] **Ar pilietiškumą (bendruomenes) galima modeliuoti 1 klasei?** Programa 1 kl. numato „atpažinti skirtingas bendruomenes, religijas, aplinkas… tolerancijos kitybei“ ir metodą — situacinę diskusiją bei refleksiją (`pasaulio-pazinimas-1-klase.md:45`). Modelis linkęs virsti rūšiavimo ar paveikslėlio užduotimi (gairių 2 klausimas), o bendruomenės vaidmenų modelis dubliuotų dorinio ugdymo „susitarimą“ (`agents/proposals/2026-11-08-ideator-dorinis-susitarimas.json`). Trūksta klaidingos nuostatos, kurią parodytų pasekmė, o ne paaiškinimas.

---

*Įrašyta: 2026-11-03. Šaltinis: sprendimai, kurių negalėjome pagrįsti esama baze.*
