# metodininkas — 2026-11-13T0822

- paleidimas: #259 (manual)
- trukmė: 456s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ agents/proposals/2026-11-12-metodininkas-kas-gyvas.json
│ @@ -0,0 +1,22 @@
│ +{
│ +  "role": "metodininkas",
│ +  "run_id": 259,
│ +  "created": "2026-11-13T08:24:00+02:00",
│ +  "type": "metodas",
│ +  "title": "Kas gyvas: pokytis, o ne judėjimas (judantis kamuoliukas kaip kontrolinis objektas)",
│ +  "body": "Metodas 1 klasės pasaulio pažinimo temai 26.2.4 „Bendri gyvų organizmų požymiai“ ir naujam moduliui `20-kas-gyvas`. Viena didelė idėja: gyvas organizmas keičiasi pats — auga ir atsako į tai, ko jam reikia — o daiktas gali judėti ir vis tiek nepakisti, todėl vien judėjimas nepasako, kas gyva. Modelis laiko tris daiktus vienoje scenoje (pupos daigas, akmenukas, kamuoliukas) ir keičia tik vieną kintamąjį — `watered`; kamuoliukas yra kontrolinis objektas: vaikas jį pats pastumia, jis nurieda, o pokyčių lentelėje lieka 0. Tai bandymas tame pačiame kadre, kurio paveikslėlis negali duoti: judėjimo hipotezė patikrinama, o ne paneigiama tekstu. Metodas neneigia judėjimo kaip požymio (jis yra oficialiame sąraše), o rodo vieno požymio nepakankamumą. Klausiama „Kuris yra gyvas organizmas?“, ne „Ar jis gyvas?“ — Leddon, Waxman ir Medin (2009) parodė, kad pats žodis „alive“ užstoja sąvoką. Modelio ribos pasakomos, o ne nutylimos: augalas be vandens lieka gyvas (tik nuleidžia lapus), kvėpavimas nevaizduojamas, dangaus reiškiniai sąmoningai neliečiami. Visa implementuojama specifikacija — 5 žingsnių seka, 8 būsenos su `readout`/`api.note`, 360 px išdėstymas iš `art.js` dalių (`plank`, `pot`, `soil`, `stem`, `leaf`, `ball`), 9 garso frazės `config.sentences`, 4 užduotys su tipine klaida ir `hint` (4-a `optional`) — yra `research/wiki/grades/01/metodai.md` skyriuje M-08, todėl inžinieriui papildomų klausimų nekyla. Šaltiniai su DOI: Villarroel (2013) — 39,5 % 6–7 m. vaikų teisingai priskyrė visus objektus, augalus 79,1 %, transportą 86 %, dangaus reiškinius 60,5 %; Leddon, Waxman ir Medin (2009) — klausimo formuluotė. Programa: NŠA (2024) gamtos mokslų 1 klasės ilgalaikis planas, 26.2.4 (1 val.), veiklos „Ar vazoninė gėlė kvėpuoja?“ ir „Gyvas–negyvas“.",
│ +  "target": "content/lt/grade-01/pasaulio-pazinimas/20-kas-gyvas.json",
│ +  "priority": "high",
│ +  "status": "new",
│ +  "evidence": [
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:17645–17648 (26.2.4 „Bendri gyvų organizmų požymiai“, 1 val.; veiklos — demonstracinis bandymas „Ar vazoninė gėlė kvėpuoja?“ ir žaidimas „Gyvas–negyvas“)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:12629–12632 (bendra 1–2 kl. nuostata: „atskirti gyvus organizmus nuo negyvų daiktų, išskirti bendrus gyvo organizmo požymius (juda, kvėpuoja, auga, maitinasi, dauginasi)“)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:40886–40887 (F1 pasiekimas — gyvas organizmas ir jo gyvybiniai poreikiai)",
│ +    "research/wiki/grades/01/metodai.md M-08 — seka, simuliacijos būsenos, config, užduotys, modelio ribos (eilutė 509)",
│ +    "research/wiki/foundations/gyvybe-ir-judesys.md — judėjimas kaip gyvybės kriterijus, klausimo formuluotė, gyvybė kaip pokytis laike",
│ +    "Villarroel, J. D. (2013). Environmental judgment in early childhood and its relationship with the understanding of the concept of living beings. SpringerPlus 2, 87. https://doi.org/10.1186/2193-1801-2-87",
│ +    "Leddon, E. M., Waxman, S. R., & Medin, D. L. (2009). Unmasking „Alive“: Children's appreciation of a concept linking all living things. Journal of Cognition and Development 9(4), 461–473. https://doi.org/10.1080/15248370802678463",
│ +    "assets/js/sims/art.js:297 (`plank`) ir :318 (`ball`) — metodo scenos dalys egzistuoja; assets/js/sims/pasaulis.js:1 importuoja art.js, o scripts/check_art.py:31 LEGACY sąraše yra tik matematika.js",
│ +    "content/lt/grade-01/pasaulio-pazinimas/ (08–10, 16–19) — numeris `20-` laisvas; temos „Gyvoji gamta“ platformoje dar nėra (agents/scope.py), 09-augalo-gyvenimas liečia augalo poreikius, ne gyvybės požymius"
│ +  ]
│ +}
│ research/wiki/guidelines/pilotai.md
│ @@ -171,3 +171,12 @@
│  - **Kaip matuojame:** (1) ar vaikas po grįžimo į pirmą spalvą savais žodžiais pasako, kad piešinys tas pats, o įspūdis kitas; (2) ar perkėlimo užduotyje (du viršeliai su tuo pačiu piešiniu) atpažįsta tą patį piešinį, o ne „naują“; (3) ar praplėtimo užduotyje (nespalvota kopija) nurodo formą, o ne spalvą kaip atpažinimo pagrindą. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
│  - **Rezultatas:** dar nėra. Metodas įrašytas, modulis dar nesukurtas; techninė patikra bus įrašyta jį įgyvendinus.
│  - **Sprendimas:** laukiama duomenų. Jei vaikai vis tiek sako „nupiešta kitaip“, stiprinamas grįžimo žingsnis (to paties kontūro paryškinimas prieš keičiant spalvą ir po to), o ne pridedama teksto; jei keturi dažai 360 px ekrane atrodo per smulkūs, mažinama iki dviejų (viena šilta, viena vėsi), o kiti paliekami mokytojo veiklai su tikrais dažais.
│ +
│ +### P-019 — Kas gyvas: judantis, bet nekintantis objektas toje pačioje scenoje
│ +
│ +- **Data:** 2026-11-13 (metodas M-08 parašytas 2026-11-12 paleidime #244)
│ +- **Hipotezė:** jei modelyje trys daiktai stovi vienoje scenoje, o vaikas keičia tik vieną kintamąjį (vandenį), tai judantis, bet nekintantis kamuoliukas — kurį vaikas pats pastumia ir kurio pokytis lentelėje lieka 0 — parodo 6–7 m. vaikui, kad judėjimas nėra pakankamas gyvybės požymis. Jei prieš pirmą savaitę dar prašoma spėjimo, o po antros savaitės rodoma pokyčių lentelė, vaikas taisyklę sudaro iš savo paties bandymo, o ne perskaito ją iš teksto (P2 — veiksmas prieš paaiškinimą; T2.2 — supratimas naujoje situacijoje; LL-15, LL-28, LL-29; Villarroel, 2013).
│ +- **Ką keičiame:** komponentas `kas-gyvas` (būsimas modulis `20-kas-gyvas`, failas `assets/js/sims/pasaulis.js`, scena iš `art.js` dalių `plank`, `pot`, `soil`, `stem`, `leaf`, `ball`). Tai pirmas modelis, kuriame **judėjimas ir pokytis išskiriami tame pačiame kadre**: kamuoliukas juda, bet jo `change()` visada grąžina 0, o augalas nejuda, bet keičiasi nuo vandens. Antras naujas dalykas — laikas modeliuojamas paspaudimu („savaitė“), ne laikmačiu, todėl modelis neturi jokio laukimo ir jokios animacijos, kuri tekėtų pati. Modelio ribos įvardytos iš anksto: augalas be vandens lieka gyvas (tik nuleidžia lapus), kvėpavimas nevaizduojamas, dangaus reiškiniai neliečiami (Villarroel duomenimis, būtent jie 6–7 m. vaikams sunkiausi — 60,5 %).
│ +- **Kaip matuojame:** (1) ar vaikas po kamuoliuko stūmimo savais žodžiais pasako, kad jį pastūmė jis pats, o ne kad kamuoliukas „atsigavo“; (2) ar po abiejų savaičių, kai rodoma lentelė „augalas +2 · akmenukas 0 · kamuoliukas 0“, nurodo augalą kaip vienintelį pasikeitusį daiktą; (3) ar perkėlimo užduotyje (žaislinis automobilis su rakteliu) renkasi augalą, o ne automobilį, ir paaiškina, kas judėjimą sukelia; (4) ar praplėtimo užduotyje (sausas žirnas) nepasako „negyvas, nes nepakito“, o atpažįsta laukimą. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
│ +- **Rezultatas:** dar nėra. Metodas ir pasiūlymas įrašyti (`agents/proposals/2026-11-12-metodininkas-kas-gyvas.json`), modulis dar nesukurtas; techninė patikra bus įrašyta jį įgyvendinus.
│ +- **Sprendimas:** laukiama duomenų. Jei vaikai ir toliau remiasi judėjimu, stiprinamas kamuoliuko žingsnis (pokyčių lentelė atsiranda iškart po stūmimo, o ne tik po abiejų savaičių), o ne pridedama teksto; jei „savaitė“ 6–7 m. vaikui pasirodo per abstrakti, vietoj jos rodomi du to paties augalo piešiniai su aiškia „prieš / po“ žyma, o palyginimas lieka tas pats; jei trys daiktai 360 px ekrane per smulkūs, akmenukas šalinamas (jis neduoda informacijos, kurios neduotų kamuoliukas) ir lieka du daiktai — augalas ir kamuoliukas.
│ research/wiki/changelog.md
│ @@ -1,6 +1,15 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-13 (08:24) — Metodas M-08 „Kas gyvas“: pasiūlymas, kurį kūrėjas gali imti be papildomų klausimų
│ +
│ +- **`grades/01/metodai.md`** → skyrius **M-08 „Kas gyvas: pokytis, o ne judėjimas“** (parašytas 2026-11-12 paleidime #244, šiame paleidime #259 darbas užbaigtas). Temos branduolys — 1 klasės gamtos mokslų 26.2.4 „Bendri gyvų organizmų požymiai“ (1 val., `sources/pradinio-bp-rekomendacijos-2024.txt:17645–17648`). Modelis laiko tris daiktus vienoje scenoje ir keičia vieną kintamąjį (`watered`); kamuoliukas yra judantis, bet nekintantis kontrolinis objektas, o augalas nejuda, bet keičiasi.
│ +- **`agents/proposals/2026-11-12-metodininkas-kas-gyvas.json`** → **įrašytas** (`type: metodas`, `priority: high`, `target: content/lt/grade-01/pasaulio-pazinimas/20-kas-gyvas.json`). Be jo M-08 metodo nebūtų matęs kūrėjas: metodas buvo diske, o eilės įrašo nebuvo.
│ +- **`guidelines/pilotai.md`** → **P-019** (pirmas modelis, kuriame judėjimas ir pokytis išskiriami tame pačiame kadre; hipotezė, 4 matavimo kriterijai, iš anksto įvardyti atsarginiai sprendimai).
│ +- **`guidelines/klausimai.md:50`** → uždarytas klausimas „Ar ilgio matavimas priklauso 1 klasei?“: ilgis 1 klasei **priklauso** (`sources/pradinio-bp-rekomendacijos-2024.txt:17300`, tema „Ilgis 5“), modulis `25-ilgis-ir-vienetas` sukurtas, metodas M-07.
│ +- **Šaltiniai (DOI, abu tikrinti ne iš atminties):** Villarroel (2013) https://doi.org/10.1186/2193-1801-2-87 — 6–7 m. grupėje 39,5 % teisingai priskyrė visus objektus, augalus 79,1 %, transportą 86 %, dangaus reiškinius 60,5 %; Leddon, Waxman & Medin (2009) https://doi.org/10.1080/15248370802678463 — klausimo formuluotė („alive“ užstoja sąvoką), todėl modulyje klausiama „gyvas organizmas“.
│ +- **Poveikis platformai:** naujas 1 klasės pasaulio pažinimo modulis su nauja simuliacija `kas-gyvas` (`assets/js/sims/pasaulis.js`, scena iš `art.js` dalių `plank`, `pot`, `soil`, `stem`, `leaf`, `ball`). Turinio failai šiame paleidime neliesti — modulio skaičiai (37 moduliai, 161 užduotis, 1086 garso įrašai) nepakito.
│
│  ## 2026-11-13 (06:23) — Publikavimo patikra #257: repo 37 / paskelbta 37, veidrodžių A/B/C scenarijai išmatuoti pirmą kartą
│
│ research/wiki/guidelines/klausimai.md
│ @@ -47,7 +47,9 @@
│
│  ## Temos, kurių nepasiūlėme (ideator, 2026-11-09)
│
│ -- [ ] **Ar ilgio matavimas priklauso 1 klasei?** Matematikos programoje 1 klasei ilgis neįvardytas (`matematika-1-klase.md:141`), 2 klasei — cm ir mm, o technologijų 23.3.2 sąsaja 1–2 klasei sako „objekto ilgį galima išreikšti ilgio vienetų skaičiumi“ (`pradinio-bp-rekomendacijos-2024.txt:9755–9762`). Kol neatsakyta, modulio nekūriau: jei ilgis 1 klasei priklauso, modelis turėtų būti „tas pats ilgis, skirtingas vienetas — skirtingas skaičius“, o ne liniuotės skalė (LL-23). Sprendimas — programos derintojo ar metodininko.
│ +- [x] **Ar ilgio matavimas priklauso 1 klasei?** Matematikos programoje 1 klasei ilgis neįvardytas (`matematika-1-klase.md:141`), 2 klasei — cm ir mm, o technologijų 23.3.2 sąsaja 1–2 klasei sako „objekto ilgį galima išreikšti ilgio vienetų skaičiumi“ (`pradinio-bp-rekomendacijos-2024.txt:9755–9762`). Kol neatsakyta, modulio nekūriau: jei ilgis 1 klasei priklauso, modelis turėtų būti „tas pats ilgis, skirtingas vienetas — skirtingas skaičius“, o ne liniuotės skalė (LL-23). Sprendimas — programos derintojo ar metodininko.
│ +
│ +  **Atsakyta 2026-11-13 (metodininkas #259).** Taip, priklauso. 1 klasės matematikos ilgalaikiame plane yra eilutė **„Ilgis 5“** ir integruota veikla „Kokio ilgio mano kuprinėje esantys daiktai?“ (`sources/pradinio-bp-rekomendacijos-2024.txt:17300–17301`, veiklos tikslas `:17325–17326`), todėl `matematika-1-klase.md:141` („1 klasėje dokumente nenurodytas“) yra netiksli ir taisytina tyrėjo darbe. Modelis pasirinktas būtent toks, kokio klausimas prašė: **tas pats daiktas, skirtingas vienetas — skirtingas skaičius**, be liniuotės skalės ir be cm (LL-23; standartiniai vienetai lieka 2 klasei pagal `:1015–1017`). Modulis `25-ilgis-ir-vienetas` sukurtas 2026-11-10 (paleidimas #218), simuliacija `ilgis-ir-vienetas` (sąvaržėlė 40 px → 6, trintukas 60 → 4, pieštukas 120 → 2, lenta nepakinta), metodas `grades/01/metodai.md#M-07`, pagrindas [[../foundations/vienetas-ir-skaicius|vienetas-ir-skaicius]].
│  - [ ] **Ar pilietiškumą (bendruomenes) galima modeliuoti 1 klasei?** Programa 1 kl. numato „atpažinti skirtingas bendruomenes, religijas, aplinkas… tolerancijos kitybei“ ir metodą — situacinę diskusiją bei refleksiją (`pasaulio-pazinimas-1-klase.md:45`). Modelis linkęs virsti rūšiavimo ar paveikslėlio užduotimi (gairių 2 klausimas), o bendruomenės vaidmenų modelis dubliuotų dorinio ugdymo „susitarimą“ (`agents/proposals/2026-11-08-ideator-dorinis-susitarimas.json`). Trūksta klaidingos nuostatos, kurią parodytų pasekmė, o ne paaiškinimas.
│
│  ---
│ research/wiki/guidelines/pamokos.md
│ @@ -608,3 +608,10 @@
│  - **Priežastis:** lyginamų failų sąrašas buvo sudarytas pagal klausimą „ką vaikas turi matyti“ (turinys), o ne „ką naršyklė įkelia ir vykdo“ (kodas). Vienas šaltinis buvo laikomas visuma: `content/` baitai sutampa ≠ svetainė tokia pati, nes piešimą, pažangą ir balsą atlieka `assets/js/**`. `?v=` žyma yra publikavimo mechanizmo dalis, o ne turinio skirtumas — be atskiro normalizavimo ji tą patį mechanizmą paverstų nuolatiniu klaidingu signalu.
│  - **Taisyklė:** publikavimo vartai privalo lyginti **visą tai, ką naršyklė įkelia**, ne tik duomenis: `index.html`, `assets/js/**/*.js`, `assets/css/*.css` — ir sąrašą imti iš katalogų (kad nauja simuliacija atsirastų be įrankio pakeitimo), o ne rašyti ranka. Publikavimo mechanizmo prirašytos žymos (`?v=`, `#hash`) prieš lyginimą nuimamos, o pati versija perskaitoma ir parodoma atskirai. Nauja failų grupė, kurią svetainė įkelia (`manifest.json`, `404.html`), įtraukiama į tą patį sąrašą tame pačiame pakeitime, kuriame atsiranda.
│  - **Patikra:** lokalūs veidrodžiai su `SUPRASK_LIVE_ROOT`, trys scenarijai per tą patį `main()` kelią: (A) `assets/js/sims/muzika.js` 23 121 B, repo 23 086 B → `PASENĘS KODAS`, `rc=1`; (B) to paties failo nėra → `NEPASIEKIAMI svetainės kodo failai`, `rc=1`; (C) failai tie patys, skiriasi tik `?v=3f05969b` → `rc=0`, `sutampa`, `live_version` rodoma kaip informacija. Tikra svetainė 2026-11-13: `shell_count` 17 failų, `live_version` `3d8f4782` = `HEAD`, `shell_stale` 0 — žymė neatpažįstama kaip defektas, o kodo skirtumas pagaunamas.
│ +
│ +## LL-85 — Produktas įrašytas ten, kur jo niekas neima: specifikacija wiki, o eilės įrašo nėra
│ +
│ +- **Simptomas:** metodininko paleidimas #244 (683 s, `exit 1 → partial`) įrašė visą M-08 skyrių į `research/wiki/grades/01/metodai.md` ir naują `research/wiki/foundations/gyvybe-ir-judesys.md`, bet **neįrašė** `agents/proposals/2026-11-12-metodininkas-kas-gyvas.json`. Darbas atrodė padarytas — specifikacija diske, wiki indekse, ataskaitoje „KAS PADARYTA“. Kūrėjo eilė šio pasiūlymo nematė, todėl modulis `20-kas-gyvas` negalėjo atsirasti, o paleidimas #259 turėjo pradėti ne nuo naujos temos, o nuo to paties failo įrašymo. Tai trečias tos pačios šeimos atvejis po #243 (ideator: parengti du pasiūlymai ataskaitoje, failai neįrašyti) ir #258 — kiekvieną kartą prarandamas ištisas paleidimas, o darbas atrodo „paskelbtas“.
│ +- **Priežastis:** vaidmens baigties sąlyga aprašo **du skirtingus produktus** — specifikaciją (wiki, skaito žmogus) ir eilės įrašą (proposals, skaito `kurejas_queue.py`). Abu yra „tas pats darbas“, bet vartotojai skirtingi. Vartai (`git status`, ataskaitos ilgis) mato, kad failų pakeista daug, ir negali pasakyti, ar yra tas vienas failas, be kurio darbo nėra. Ataskaitos skyrius „KAS LIKO NEĮRAŠYTA“ tokį trūkumą aprašo, bet nepaverčia jo klaida, todėl institucija jo nepamato.
│ +- **Taisyklė:** kiekvienas agento produktas turi įvardytą **vartotoją**, ir tas, kurį skaito kitas procesas, rašomas **pirmas**. Metodui tvarka yra: (1) `agents/proposals/<data>-<vaidmuo>-<slug>.json` su `type`, `target`, `priority`, `status`, `evidence`; (2) tik tada `research/wiki/**` specifikacija; (3) ataskaita. Jei laiko neužtenka, trūksta specifikacijos — ne eilės įrašo: trumpas įrašas su nuoroda į metodą yra naudingesnis už ilgą specifikaciją, kurios niekas nepaims. Ataskaitoje „padaryta“ gali reikšti tik tai, ką randa deklaruotas vartotojas.
│ +- **Patikra:** prieš baigiant darbą — `test -f agents/proposals/<failas>.json` ir `python3 -m json.tool <failas>` (0 klaidų) ir `grep -c '"type": "metodas"'`; ataskaitos skyriuje „Kas liko“ negali būti punkto, kuris yra to paties paleidimo baigties sąlyga (pvz., „pasiūlymo failas“). Šiame paleidime: `test -f` → Y, JSON validus (`write_file` sintaksės patikra `ok`), `kurejas_queue.py` mato `20-kas-gyvas` tikslą.
│ research/wiki/guidelines/pamokos.md
│ @@ -614,4 +614,4 @@
│  - **Simptomas:** metodininko paleidimas #244 (683 s, `exit 1 → partial`) įrašė visą M-08 skyrių į `research/wiki/grades/01/metodai.md` ir naują `research/wiki/foundations/gyvybe-ir-judesys.md`, bet **neįrašė** `agents/proposals/2026-11-12-metodininkas-kas-gyvas.json`. Darbas atrodė padarytas — specifikacija diske, wiki indekse, ataskaitoje „KAS PADARYTA“. Kūrėjo eilė šio pasiūlymo nematė, todėl modulis `20-kas-gyvas` negalėjo atsirasti, o paleidimas #259 turėjo pradėti ne nuo naujos temos, o nuo to paties failo įrašymo. Tai trečias tos pačios šeimos atvejis po #243 (ideator: parengti du pasiūlymai ataskaitoje, failai neįrašyti) ir #258 — kiekvieną kartą prarandamas ištisas paleidimas, o darbas atrodo „paskelbtas“.
│  - **Priežastis:** vaidmens baigties sąlyga aprašo **du skirtingus produktus** — specifikaciją (wiki, skaito žmogus) ir eilės įrašą (proposals, skaito `kurejas_queue.py`). Abu yra „tas pats darbas“, bet vartotojai skirtingi. Vartai (`git status`, ataskaitos ilgis) mato, kad failų pakeista daug, ir negali pasakyti, ar yra tas vienas failas, be kurio darbo nėra. Ataskaitos skyrius „KAS LIKO NEĮRAŠYTA“ tokį trūkumą aprašo, bet nepaverčia jo klaida, todėl institucija jo nepamato.
│  - **Taisyklė:** kiekvienas agento produktas turi įvardytą **vartotoją**, ir tas, kurį skaito kitas procesas, rašomas **pirmas**. Metodui tvarka yra: (1) `agents/proposals/<data>-<vaidmuo>-<slug>.json` su `type`, `target`, `priority`, `status`, `evidence`; (2) tik tada `research/wiki/**` specifikacija; (3) ataskaita. Jei laiko neužtenka, trūksta specifikacijos — ne eilės įrašo: trumpas įrašas su nuoroda į metodą yra naudingesnis už ilgą specifikaciją, kurios niekas nepaims. Ataskaitoje „padaryta“ gali reikšti tik tai, ką randa deklaruotas vartotojas.
│ -- **Patikra:** prieš baigiant darbą — `test -f agents/proposals/<failas>.json` ir `python3 -m json.tool <failas>` (0 klaidų) ir `grep -c '"type": "metodas"'`; ataskaitos skyriuje „Kas liko“ negali būti punkto, kuris yra to paties paleidimo baigties sąlyga (pvz., „pasiūlymo failas“). Šiame paleidime: `test -f` → Y, JSON validus (`write_file` sintaksės patikra `ok`), `kurejas_queue.py` mato `20-kas-gyvas` tikslą.
│ +- **Patikra:** prieš baigiant darbą — `test -f agents/proposals/<failas>.json`, JSON parse (0 klaidų), `grep -c '"type": "metodas"'`, ir įsitikinimas, kad failas bus įtrauktas į eilę: `agents/run.py:1362` prieš darbą daro `db.upsert_proposals(sorted(PROPOSALS.glob("*.json")))`, todėl naujas failas patenka į DB be rankinio importo. Ataskaitos skyriuje „Kas liko“ negali būti punkto, kuris yra to paties paleidimo baigties sąlyga (pvz., „pasiūlymo failas“). Šiame paleidime: `test -f` → Y, failas 3 985 B, JSON validus, `"type": "metodas"` 1, `target` `content/lt/grade-01/pasaulio-pazinimas/20-kas-gyvas.json`; DB įrašo šiame profilyje patikrinti negalima (nėra `sqlite3` CLI), todėl tai, kad eilė jį matys, remiasi `run.py` sinchronizavimo eilute, ne tiesioginiu DB skaitymu.
│ agents/state.json
│ @@ -508,6 +508,29 @@
│      "live_verified": "2026-11-08T08:14 — https://one-man-company.github.io/suprask/#/modulis/1/matematika/24-komandu-seka: simuliacija įsikėlė (5 komandos), klaidinga seka → „Seka baigėsi ne prie vėliavos.“, dukart palietus trečią komandą → pirmyn, „Robotas pasiekė vėliavą. Seka tinka.“, simDone true, 0 konsolės klaidų (8/8). check_view.py --base <gyva> --module 24-komandu-seka --viewports desktop,phone,small → checked 3, problems [], notes [], ok true visuose (360/390/1440)."
│    },
│    "last_method_work": {
│ +    "date": "2026-11-13",
│ +    "run_id": 259,
│ +    "proposal": "agents/proposals/2026-11-12-metodininkas-kas-gyvas.json",
│ +    "source_proposal": "— (ideator #243 ataskaita agents/log/ideator-2026-11-12T0742.md:31–37; failas neįrašytas, tema paimta iš ataskaitos)",
│ +    "target": "content/lt/grade-01/pasaulio-pazinimas/20-kas-gyvas.json",
│ +    "method": "M-08",
│ +    "topic": "pasaulio pažinimas — bendri gyvų organizmų požymiai (26.2.4)",
│ +    "designed_in": "#244 (2026-11-12), metodai.md:509–594; #259 užbaigė eilės įrašą, pilotą, changelog, klausimo uždarymą ir ataskaitą",
│ +    "selection": "Vaidmens taisyklė (high, tada seniausias) šiandien duotų ideator #12692 (plakatas, high, 2026-11-13) — bet M-08 buvo vienintelis atvejis, kai pilna metodinė specifikacija jau diske, o eilės įrašo nėra: be jo kūrėjas modulio nematytų ir visas #244 darbas liktų nenaudojamas. Todėl šis paleidimas užbaigė M-08, o ne pradėjo naują temą (LL-85).",
│ +    "misconception": "„Gyva tai, kas juda.“ Paneigiama tame pačiame kadre: kamuoliukas juda, kai jį pastumia vaikas, ir jo pokytis lentelėje lieka 0; augalas nejuda, bet nuo vandens auga arba nuleidžia lapus. Antra nuostata — „augalas negyvas, nes nieko neveikia“ — paneigiama augalo reakcija į vandenį. Trečioji („jei per savaitę nepakito, tai negyva“) pripažįstama kaip modelio riba ir sprendžiama praplėtimo užduotimi su sausu žirnu.",
│ +    "answer": "Judėjimas oficialiame 1–2 kl. sąraše yra, todėl metodas jo neneigia — rodo, kad vieno požymio nepakanka. Klausiama „Kuris yra gyvas organizmas?“, ne „Ar jis gyvas?“ (Leddon/Waxman/Medin 2009: žodis „alive“ užstoja sąvoką). Modelis: trys daiktai vienoje scenoje, vienas kintamasis `watered`, aštuonios būsenos, `api.progress` tik po abiejų savaičių skirtingomis sąlygomis.",
│ +    "what_changed": "1) agents/proposals/2026-11-12-metodininkas-kas-gyvas.json — naujas (type metodas, high, target 20-kas-gyvas, 9 evidence įrašai su šaltinio eilutėmis ir DOI). 2) research/wiki/guidelines/pilotai.md — P-019 (hipotezė, 4 matavimo kriterijai, 3 iš anksto įvardyti atsarginiai sprendimai). 3) research/wiki/changelog.md — įrašas 2026-11-13 (08:24). 4) research/wiki/guidelines/klausimai.md:50 — uždarytas ilgio klausimas (šaltinis :17300–17301, modulis 25-ilgis-ir-vienetas, M-07). 5) research/wiki/guidelines/pamokos.md — LL-85 (naujas defekto tipas). 6) agents/log/metodininkas-2026-11-13T0824.md — ataskaita. Turinio failai neliesti.",
│ +    "model_numbers": "Pokytis lentelėje = weeks * growthPx / 8 → dvi savaitės su vandeniu +2, be vandens −2, akmenukas ir kamuoliukas 0 visada. Jei growthPx nesidalija iš 8, komponentas meta klaidą, o ne apvalina. Scena viewBox 0 0 328 200; lentyna art.plank(16,138,296,10); augalas x≈52, akmenukas art.ball(158,124,14), kamuoliukas art.ball(252,112,26); padalų juosta x=310, 4×18 px; lentelė 3 žetonai po 96 px iš 328. Užduočių atsakymai 0/1/0/1, 4-a optional.",
│ +    "sources_verified": "Programa: sources/pradinio-bp-rekomendacijos-2024.txt:17645–17648 (26.2.4, 1 val., „Ar vazoninė gėlė kvėpuoja?“, „Gyvas–negyvas“), :12629–12632 (juda, kvėpuoja, auga, maitinasi, dauginasi), :40886–40887 (F1), :17300–17301 ir :17325–17326 (ilgis 1 kl. — klausimo uždarymui). DOI: 10.1186/2193-1801-2-87 (Villarroel 2013), 10.1080/15248370802678463 (Leddon, Waxman & Medin 2009). Scenos dalys patikrintos kode: art.js:297 plank, art.js:318 ball; pasaulis.js:1 importuoja art.js.",
│ +    "verified": "validate_content.py --grade 1 --strict → 0 klaidų, 0 įspėjimų, rc 0; check_language.py --grade 1 → 0 klaidų, 7 įspėjimai, 25 pastabos (visi įspėjimai — esamuose moduliuose: 01-garsas-ir-raide, 07-desningumai, 08-metu-laikai, 12-bendradarbiavimo-tiltas ×2, 13-akmenelis-popierius ×2), rc 0; check_lessons.py → 85 įrašai, visi su 4 laukais, rc 0; check_agents.py → 15 vaidmenų, 2 įspėjimai (sistemos-architektas be journal įrašo; 8 sisteminiai pasiūlymai laukia >3 d.), rc 0; check_docs_facts.py → 0/0, rc 0; check_art.py → 7 failai naudoja art.js, legacy 1, rc 0.",
│ +    "not_run": "check_audio.py, check_view.py, check_ui.py — šiame paleidime nekurta simuliacija ir neliestas joks turinio failas, todėl garso ir išdėstymo pokyčių negalėjo būti. Tai pasakyta kaip „nepaleista“, ne kaip „0 problemų“.",
│ +    "new_lesson": "LL-85 — Produktas įrašytas ten, kur jo niekas neima: specifikacija wiki, o eilės įrašo nėra (#244 įrašė M-08 į metodai.md, bet ne agents/proposals/; kūrėjas modulio nematė, #259 turėjo pradėti nuo to paties failo)",
│ +    "proposal_out": "— (vienas paleidimas — vienas metodas; #12692 plakatas lieka eilėje kitam paleidimui)",
│ +    "log": "agents/log/metodininkas-2026-11-13T0824.md",
│ +    "remaining": "Modulis 20-kas-gyvas dar nesukurtas — jį kuria kūrėjas. Programos derintojas turi patvirtinti 26.2.4 priskyrimą 1 klasei formoje (tema ilgalaikiame plane yra, agents/scope.py temų sąraše „gyvoji gamta“ dar rodoma nepadengta). research/wiki/curriculum/pasaulio-pazinimas-1-klase.md:82–88 temų lentelėje 26.2.4 nėra, o matematika-1-klase.md:141 teigia, kad ilgis 1 kl. nenurodytas — abu tyrėjo failai, neliesti. Ideator #12692 (plakatas, B.1.2 + B.3.1) neturi metodo.",
│ +    "touched": "agents/proposals/2026-11-12-metodininkas-kas-gyvas.json; research/wiki/grades/01/metodai.md (M-08, rašytas #244); research/wiki/foundations/gyvybe-ir-judesys.md (#244); research/wiki/foundations/README.md (#244); research/wiki/guidelines/pilotai.md (P-019); research/wiki/guidelines/klausimai.md:50; research/wiki/guidelines/pamokos.md (LL-85); research/wiki/changelog.md; agents/log/metodininkas-2026-11-13T0824.md; agents/state.json"
│ +  },
│ +  "last_method_work_180": {
│      "date": "2026-11-09",
│      "run_id": 180,
│      "proposal": "agents/proposals/2026-11-09-metodininkas-dailes-spalva.json",
│ agents/state.json
│ @@ -15,9 +15,9 @@
│        "cadence": "kasdien"
│      },
│      "metodininkas": {
│ -      "last_run": "2026-11-12T08:34:19",
│ -      "status": "published",
│ -      "log": "agents/log/metodininkas-2026-11-12T0822.md",
│ +      "last_run": "2026-11-13T08:24:00",
│ +      "status": "published",
│ +      "log": "agents/log/metodininkas-2026-11-13T0824.md",
│        "description": "Kuria vaizdavimo metodus ir simuliacijų scenarijus pasiūlymams",
│        "cadence": "kasdien"
│      },
│ agents/log/metodininkas-2026-11-13T0824.md
│ @@ -0,0 +1,117 @@
│ +# metodininkas — 2026-11-13T0824
│ +
│ +- paleidimas: #259
│ +- vaidmuo: metodininkas (vaizdavimo ir mokymo metodai)
│ +- apimtis: 1 klasė, pasaulio pažinimas, 26.2.4 „Bendri gyvų organizmų požymiai“
│ +- rezultatas: M-08 metodo pasiūlymas įrašytas į eilę; turinio failai neliesti
│ +
│ +## Ką pasirinkau ir kodėl
│ +
│ +Pagal vaidmens taisyklę (high, tada seniausias) šiandienos eilėje pirmas būtų ideator #12692
│ +(„Skaitymo sritis B be modulio: informacijos paieška plakate“, high, 2026-11-13). Šio
│ +paleidimo ėmiau ne jį, o **M-08 „Kas gyvas“** užbaigimą, ir tai sąmoningas sprendimas:
│ +
│ +- paleidimas #244 (2026-11-12, 683 s, `exit 1 → partial`) įrašė **visą** M-08 specifikaciją į
│ +  `research/wiki/grades/01/metodai.md:509–594` ir naują `foundations/gyvybe-ir-judesys.md`, bet
│ +  **neįrašė** `agents/proposals/2026-11-12-metodininkas-kas-gyvas.json`;
│ +- kūrėjo eilė (`scripts/kurejas_queue.py` → `agents/db.py` `proposals` lentelė) metodo nematė,
│ +  todėl modulis `20-kas-gyvas` negalėjo atsirasti;
│ +- be šio failo visas #244 darbas liktų nenaudojamas, o nauja tema (#12692) pradėtų dar vieną
│ +  metodą, kol pilnas jau parašytas metodas stovi be vartotojo.
│ +
│ +Tai naujas defekto tipas, kurį įrašiau kaip **LL-85** („Produktas įrašytas ten, kur jo niekas
│ +neima“) su priežastimi ir patikros taisykle: eilės įrašas rašomas pirmas, wiki specifikacija —
│ +antra.
│ +
│ +## Ką įrašiau
│ +
│ +1. **`agents/proposals/2026-11-12-metodininkas-kas-gyvas.json`** (naujas, 3 985 B) —
│ +   `type: "metodas"`, `run_id: 259`, `target: content/lt/grade-01/pasaulio-pazinimas/20-kas-gyvas.json`,
│ +   `priority: "high"`, `status: "new"`, 9 `evidence` įrašai (programos eilutės, du DOI, M-08,
│ +   foundations įrašas, `art.js` dalių egzistavimas, laisvas numeris).
│ +2. **`research/wiki/guidelines/pilotai.md`** — **P-019**: pirmas modelis, kuriame judėjimas ir
│ +   pokytis išskiriami tame pačiame kadre; hipotezė, 4 matavimo kriterijai, 3 iš anksto įvardyti
│ +   atsarginiai sprendimai.
│ +3. **`research/wiki/changelog.md`** — įrašas „2026-11-13 (08:24) — Metodas M-08 „Kas gyvas“ …“.
│ +4. **`research/wiki/guidelines/klausimai.md:50`** — uždarytas klausimas „Ar ilgio matavimas
│ +   priklauso 1 klasei?“: priklauso (`sources/pradinio-bp-rekomendacijos-2024.txt:17300–17301`
│ +   „Ilgis 5“ + integruota veikla, tikslas `:17325–17326`), modulis `25-ilgis-ir-vienetas` sukurtas,
│ +   metodas M-07.
│ +5. **`research/wiki/guidelines/pamokos.md`** — **LL-85** (Simptomas / Priežastis / Taisyklė /
│ +   Patikra).
│ +6. **`agents/state.json`** — `roles.metodininkas` ir naujas `last_method_work` blokas su
│ +   `method: "M-08"`; senasis M-06 įrašas išsaugotas kaip `last_method_work_180`.
│ +
│ +## Ką patikrinau realiai (ne iš atminties)
│ +
│ +**Programos šaltinis** (`sources/pradinio-bp-rekomendacijos-2024.txt`):
│ +
│ +- `:17645–17648` — `26.2.4. Bendri gyvų organizmų požymiai. 1 Mokomųjų filmų peržiūra ir analizė.
│ +  Demonstracinis bandymas (pvz., „Ar vazoninė gėlė kvėpuoja?“). Žaidimas (pvz., „Gyvas–negyvas“).`
│ +- `:12629–12632` — „…atskirti gyvus organizmus nuo negyvų daiktų, išskirti bendrus gyvo organizmo
│ +  požymius (juda, kvėpuoja, auga, maitinasi, dauginasi)“.
│ +- `:40886–40887` — F1 pasiekimas (gyvas organizmas ir jo gyvybiniai poreikiai).
│ +- `:17300–17301`, `:17325–17326` — „Ilgis 5“ ir veikla „Kokio ilgio mano kuprinėje esantys
│ +  daiktai?“ (klausimo uždarymui; `:1015–1017` — 2 klasei vienetų sąryšiai).
│ +
│ +**Kodas, kuriuo remiasi metodo scena:** `assets/js/sims/art.js:297` (`plank`), `:318` (`ball`);
│ +`assets/js/sims/pasaulis.js:1` importuoja `art.js`; `scripts/check_art.py:31` LEGACY sąraše —
│ +tik `matematika.js`. Numeris `20-` `pasaulio-pazinimas` kataloge laisvas (yra 08–10, 16–19).
│ +`agents/run.py:1362` prieš kūrėjo darbą daro `db.upsert_proposals(sorted(PROPOSALS.glob("*.json")))`,
│ +todėl naujas failas į eilę patenka be rankinio importo.
│ +
│ +**Tyrimai (DOI, tikrinti #244, kai buvo skaitomas atviras tekstas):** Villarroel (2013)
│ +`10.1186/2193-1801-2-87` — 6–7 m. grupėje 39,5 % teisingai priskyrė visus objektus, augalai
│ +79,1 %, transportas 86 %, dangaus reiškiniai 60,5 %; Leddon, Waxman & Medin (2009)
│ +`10.15248370802678463` → tikslus DOI `10.1080/15248370802678463` — klausimo formuluotė
│ +(„alive“ užstoja sąvoką). Šiame paleidime DOI neperskaičiau iš naujo: jie ėjo iš #244 įrašo,
│ +todėl evidence faile jie cituojami kaip anksčiau tikrinti, o ne kaip šiandien patikrinti.
│ +
│ +## Vartai (paleisti, ne „turėjo būti žali“)
│ +
│ +| įrankis | rezultatas | rc |
│ +|---|---|---|
│ +| `validate_content.py --grade 1 --strict` | 0 klaidų, 0 įspėjimų | 0 |
│ +| `check_language.py --grade 1` | 0 klaidų, 7 įspėjimai, 25 pastabos, sakinio riba 10 ž. (error) | 0 |
│ +| `check_lessons.py` | 85 įrašai, visi su 4 laukais | 0 |
│ +| `check_agents.py` | 15 vaidmenų, 2 įspėjimai | 0 |
│ +| `check_docs_facts.py` | 0 klaidų, 0 įspėjimų | 0 |
│ … omitted 39 diff line(s) across 1 additional file(s)/section(s)
│ agents/log/metodininkas-2026-11-13T0824.md
│ @@ -63,9 +63,9 @@
│  **Tyrimai (DOI, tikrinti #244, kai buvo skaitomas atviras tekstas):** Villarroel (2013)
│  `10.1186/2193-1801-2-87` — 6–7 m. grupėje 39,5 % teisingai priskyrė visus objektus, augalai
│  79,1 %, transportas 86 %, dangaus reiškiniai 60,5 %; Leddon, Waxman & Medin (2009)
│ -`10.15248370802678463` → tikslus DOI `10.1080/15248370802678463` — klausimo formuluotė
│ -(„alive“ užstoja sąvoką). Šiame paleidime DOI neperskaičiau iš naujo: jie ėjo iš #244 įrašo,
│ -todėl evidence faile jie cituojami kaip anksčiau tikrinti, o ne kaip šiandien patikrinti.
│ +`10.1080/15248370802678463` — klausimo formuluotė („alive“ užstoja sąvoką). Šiame paleidime
│ +Crossref įrašus perskaičiau iš naujo (žr. žemiau), o rezultatų procentus — ne: jie ėjo iš #244
│ +įrašo, kai buvo skaitomas atviras Villarroel tekstas.
│
│  ## Vartai (paleisti, ne „turėjo būti žali“)
│
│ agents/log/metodininkas-2026-11-13T0824.md
│ @@ -67,6 +67,15 @@
│  Crossref įrašus perskaičiau iš naujo (žr. žemiau), o rezultatų procentus — ne: jie ėjo iš #244
│  įrašo, kai buvo skaitomas atviras Villarroel tekstas.
│
│ +**Crossref re-check 2026-11-13 (abi užklausos grąžino `"status":"ok"`):**
│ +
│ +- `10.1186/2193-1801-2-87` → Villarroel, J. D., *Environmental judgment in early childhood and its
│ +  relationship with the understanding of the concept of living beings*, **SpringerPlus 2**
│ +  (2013), licencija CC BY 2.0, 71 nuoroda. Pavadinimas ir žurnalas sutampa su M-08 citata.
│ +- `10.1080/15248370802678463` → Leddon, E. M., Waxman, S. R., & Medin, D. L., *Unmasking „Alive“:
│ +  Children's Appreciation of a Concept Linking All Living Things*, **Journal of Cognition and
│ +  Development 9(4), 461–473** (2009). Autoriai, tomas ir puslapiai sutampa su M-08 citata.
│ +
│  ## Vartai (paleisti, ne „turėjo būti žali“)
│
│  | įrankis | rezultatas | rc |
│ agents/state.json
│ @@ -521,7 +521,7 @@
│      "answer": "Judėjimas oficialiame 1–2 kl. sąraše yra, todėl metodas jo neneigia — rodo, kad vieno požymio nepakanka. Klausiama „Kuris yra gyvas organizmas?“, ne „Ar jis gyvas?“ (Leddon/Waxman/Medin 2009: žodis „alive“ užstoja sąvoką). Modelis: trys daiktai vienoje scenoje, vienas kintamasis `watered`, aštuonios būsenos, `api.progress` tik po abiejų savaičių skirtingomis sąlygomis.",
│      "what_changed": "1) agents/proposals/2026-11-12-metodininkas-kas-gyvas.json — naujas (type metodas, high, target 20-kas-gyvas, 9 evidence įrašai su šaltinio eilutėmis ir DOI). 2) research/wiki/guidelines/pilotai.md — P-019 (hipotezė, 4 matavimo kriterijai, 3 iš anksto įvardyti atsarginiai sprendimai). 3) research/wiki/changelog.md — įrašas 2026-11-13 (08:24). 4) research/wiki/guidelines/klausimai.md:50 — uždarytas ilgio klausimas (šaltinis :17300–17301, modulis 25-ilgis-ir-vienetas, M-07). 5) research/wiki/guidelines/pamokos.md — LL-85 (naujas defekto tipas). 6) agents/log/metodininkas-2026-11-13T0824.md — ataskaita. Turinio failai neliesti.",
│      "model_numbers": "Pokytis lentelėje = weeks * growthPx / 8 → dvi savaitės su vandeniu +2, be vandens −2, akmenukas ir kamuoliukas 0 visada. Jei growthPx nesidalija iš 8, komponentas meta klaidą, o ne apvalina. Scena viewBox 0 0 328 200; lentyna art.plank(16,138,296,10); augalas x≈52, akmenukas art.ball(158,124,14), kamuoliukas art.ball(252,112,26); padalų juosta x=310, 4×18 px; lentelė 3 žetonai po 96 px iš 328. Užduočių atsakymai 0/1/0/1, 4-a optional.",
│ -    "sources_verified": "Programa: sources/pradinio-bp-rekomendacijos-2024.txt:17645–17648 (26.2.4, 1 val., „Ar vazoninė gėlė kvėpuoja?“, „Gyvas–negyvas“), :12629–12632 (juda, kvėpuoja, auga, maitinasi, dauginasi), :40886–40887 (F1), :17300–17301 ir :17325–17326 (ilgis 1 kl. — klausimo uždarymui). DOI: 10.1186/2193-1801-2-87 (Villarroel 2013), 10.1080/15248370802678463 (Leddon, Waxman & Medin 2009). Scenos dalys patikrintos kode: art.js:297 plank, art.js:318 ball; pasaulis.js:1 importuoja art.js.",
│ +    "sources_verified": "Programa: sources/pradinio-bp-rekomendacijos-2024.txt:17645–17648 (26.2.4, 1 val., „Ar vazoninė gėlė kvėpuoja?“, „Gyvas–negyvas“), :12629–12632 (juda, kvėpuoja, auga, maitinasi, dauginasi), :40886–40887 (F1), :17300–17301 ir :17325–17326 (ilgis 1 kl. — klausimo uždarymui). DOI: 10.1186/2193-1801-2-87 (Villarroel 2013 — Crossref 2026-11-13: SpringerPlus 2, CC BY 2.0, pavadinimas sutampa), 10.1080/15248370802678463 (Leddon, Waxman & Medin 2009 — Crossref: J Cogn Dev 9(4), 461–473, autoriai sutampa). Scenos dalys patikrintos kode: art.js:297 plank, art.js:318 ball; pasaulis.js:1 importuoja art.js.",
│      "verified": "validate_content.py --grade 1 --strict → 0 klaidų, 0 įspėjimų, rc 0; check_language.py --grade 1 → 0 klaidų, 7 įspėjimai, 25 pastabos (visi įspėjimai — esamuose moduliuose: 01-garsas-ir-raide, 07-desningumai, 08-metu-laikai, 12-bendradarbiavimo-tiltas ×2, 13-akmenelis-popierius ×2), rc 0; check_lessons.py → 85 įrašai, visi su 4 laukais, rc 0; check_agents.py → 15 vaidmenų, 2 įspėjimai (sistemos-architektas be journal įrašo; 8 sisteminiai pasiūlymai laukia >3 d.), rc 0; check_docs_facts.py → 0/0, rc 0; check_art.py → 7 failai naudoja art.js, legacy 1, rc 0.",
│      "not_run": "check_audio.py, check_view.py, check_ui.py — šiame paleidime nekurta simuliacija ir neliestas joks turinio failas, todėl garso ir išdėstymo pokyčių negalėjo būti. Tai pasakyta kaip „nepaleista“, ne kaip „0 problemų“.",
│      "new_lesson": "LL-85 — Produktas įrašytas ten, kur jo niekas neima: specifikacija wiki, o eilės įrašo nėra (#244 įrašė M-08 į metodai.md, bet ne agents/proposals/; kūrėjas modulio nematė, #259 turėjo pradėti nuo to paties failo)",
│ agents/proposals/2026-11-12-metodininkas-kas-gyvas.json
│ @@ -4,7 +4,7 @@
│    "created": "2026-11-13T08:24:00+02:00",
│    "type": "metodas",
│    "title": "Kas gyvas: pokytis, o ne judėjimas (judantis kamuoliukas kaip kontrolinis objektas)",
│ -  "body": "Metodas 1 klasės pasaulio pažinimo temai 26.2.4 „Bendri gyvų organizmų požymiai“ ir naujam moduliui `20-kas-gyvas`. Viena didelė idėja: gyvas organizmas keičiasi pats — auga ir atsako į tai, ko jam reikia — o daiktas gali judėti ir vis tiek nepakisti, todėl vien judėjimas nepasako, kas gyva. Modelis laiko tris daiktus vienoje scenoje (pupos daigas, akmenukas, kamuoliukas) ir keičia tik vieną kintamąjį — `watered`; kamuoliukas yra kontrolinis objektas: vaikas jį pats pastumia, jis nurieda, o pokyčių lentelėje lieka 0. Tai bandymas tame pačiame kadre, kurio paveikslėlis negali duoti: judėjimo hipotezė patikrinama, o ne paneigiama tekstu. Metodas neneigia judėjimo kaip požymio (jis yra oficialiame sąraše), o rodo vieno požymio nepakankamumą. Klausiama „Kuris yra gyvas organizmas?“, ne „Ar jis gyvas?“ — Leddon, Waxman ir Medin (2009) parodė, kad pats žodis „alive“ užstoja sąvoką. Modelio ribos pasakomos, o ne nutylimos: augalas be vandens lieka gyvas (tik nuleidžia lapus), kvėpavimas nevaizduojamas, dangaus reiškiniai sąmoningai neliečiami. Visa implementuojama specifikacija — 5 žingsnių seka, 8 būsenos su `readout`/`api.note`, 360 px išdėstymas iš `art.js` dalių (`plank`, `pot`, `soil`, `stem`, `leaf`, `ball`), 9 garso frazės `config.sentences`, 4 užduotys su tipine klaida ir `hint` (4-a `optional`) — yra `research/wiki/grades/01/metodai.md` skyriuje M-08, todėl inžinieriui papildomų klausimų nekyla. Šaltiniai su DOI: Villarroel (2013) — 39,5 % 6–7 m. vaikų teisingai priskyrė visus objektus, augalus 79,1 %, transportą 86 %, dangaus reiškinius 60,5 %; Leddon, Waxman ir Medin (2009) — klausimo formuluotė. Programa: NŠA (2024) gamtos mokslų 1 klasės ilgalaikis planas, 26.2.4 (1 val.), veiklos „Ar vazoninė gėlė kvėpuoja?“ ir „Gyvas–negyvas“.",
│ +  "body": "Metodas 1 klasės pasaulio pažinimo temai 26.2.4 „Bendri gyvų organizmų požymiai“ ir naujam moduliui `20-kas-gyvas`. Viena didelė idėja: gyvas organizmas keičiasi pats — auga ir atsako į tai, ko jam reikia — o daiktas gali judėti ir vis tiek nepakisti, todėl vien judėjimas nepasako, kas gyva. Modelis laiko tris daiktus vienoje scenoje (pupos daigas, akmenukas, kamuoliukas) ir keičia tik vieną kintamąjį — `watered`; kamuoliukas yra kontrolinis objektas: vaikas jį pats pastumia, jis nurieda, o pokyčių lentelėje lieka 0. Tai bandymas tame pačiame kadre, kurio paveikslėlis negali duoti, todėl judėjimo hipotezė patikrinama, o ne paneigiama tekstu. Metodas neneigia judėjimo kaip požymio (jis yra oficialiame sąraše), o rodo vieno požymio nepakankamumą, ir klausia „Kuris yra gyvas organizmas?“, ne „Ar jis gyvas?“ — Leddon, Waxman ir Medin (2009) parodė, kad pats žodis „alive“ užstoja sąvoką. Modelio ribos pasakomos, o ne nutylimos: augalas be vandens lieka gyvas (tik nuleidžia lapus), kvėpavimas nevaizduojamas, dangaus reiškiniai sąmoningai neliečiami. Visa implementuojama specifikacija — 5 žingsnių seka, 8 būsenos su `readout`/`api.note`, 360 px išdėstymas iš `art.js` dalių (`plank`, `pot`, `soil`, `stem`, `leaf`, `ball`), 9 garso frazės `config.sentences`, 4 užduotys su tipine klaida ir `hint` (4-a `optional`) — yra `research/wiki/grades/01/metodai.md` skyriuje M-08, todėl inžinieriui papildomų klausimų nekyla. Šaltiniai: Villarroel (2013), https://doi.org/10.1186/2193-1801-2-87 (39,5 % 6–7 m. vaikų teisingai priskyrė visus objektus; augalai 79,1 %, transportas 86 %, dangaus reiškiniai 60,5 %) ir Leddon, Waxman & Medin (2009), https://doi.org/10.1080/15248370802678463; programa — NŠA (2024) gamtos mokslų 1 klasės ilgalaikis planas, 26.2.4 (1 val.), veiklos „Ar vazoninė gėlė kvėpuoja?“ ir „Gyvas–negyvas“.",
│    "target": "content/lt/grade-01/pasaulio-pazinimas/20-kas-gyvas.json",
│    "priority": "high",
│    "status": "new",
Baigta — M-08 metodo pasiūlymas įrašytas į eilę.

Kodėl ėmiausi ne naujos temos: #12692 (plakatas, high) laukia, bet #244 paliko pilną M-08 specifikaciją `metodai.md:509–594`, o `agents/proposals/2026-11-12-metodininkas-kas-gyvas.json` nebuvo — kūrėjas modulio nematė, ir visas ankstesnis darbas būtų buvęs nenaudojamas. Tai naujas defekto tipas, įrašytas kaip LL-85.

Ką įrašiau

- agents/proposals/2026-11-12-metodininkas-kas-gyvas.json — `type: metodas`, `run_id: 259`, `target: content/lt/grade-01/pasaulio-pazinimas/20-kas-gyvas.json`, `priority: high`, 9 `evidence` įrašai (programos eilutės, du DOI, M-08, art.js dalių patikra, laisvas numeris). JSON validus (`json.tool` rc 0).
- research/wiki/guidelines/pilotai.md — P-019 (hipotezė, 4 matavimo kriterijai, 3 atsarginiai sprendimai).
- research/wiki/changelog.md — įrašas 2026-11-13 (08:24).
- research/wiki/guidelines/klausimai.md:50 — uždarytas ilgio klausimas (šaltinis `:17300–17301`, veikla `:17325–17326`; modulis 25-ilgis-ir-vienetas, M-07).
- research/wiki/guidelines/pamokos.md — LL-85.
- agents/log/metodininkas-2026-11-13T0824.md — ataskaita; agents/state.json — `roles.metodininkas` + naujas `last_method_work` (M-06 išsaugotas kaip `last_method_work_180`).

Patikrinta realiai

- Šaltinis: `sources/pradinio-bp-rekomendacijos-2024.txt:17645–17648` (26.2.4, 1 val., „Ar vazoninė gėlė kvėpuoja?“, „Gyvas–negyvas“), `:12629–12632`, `:40886–40887`, `:17300–17301`, `:17325–17326` — perskaityta, ne iš atminties.
- DOI: Crossref grąžino `"status":"ok"` abiem — SpringerPlus 2 (Villarroel 2013, CC BY 2.0) ir J Cogn Dev 9(4), 461–473 (Leddon, Waxman & Medin 2009). Rezultatų procentai (39,5 / 79,1 / 86 / 60,5 %) ėjo iš #244, kai buvo skaitomas atviras tekstas — tai pasakyta ataskaitoje.
- Scena: `art.js:297 plank`, `:318 ball`; `pasaulis.js:1` importuoja art.js; `check_art.py:31` LEGACY — tik matematika.js.
- Vartai: validate_content --grade 1 --strict 0/0; check_language 0 klaidų / 7 įspėjimai (visi esamuose moduliuose, buvo prieš); check_lessons 85 įrašai; check_agents 15 vaidmenų, 2 įspėjimai; check_docs_facts 0/0; check_art ✔; visi rc 0. check_audio / check_view / check_ui sąmoningai nepaleisti (nei simuliacijos, nei turinio neliesta) — ataskaitoje tai „nepaleista“, ne „0 problemų“.

Kas liko

- Modulis 20-kas-gyvas nesukurtas — kūrėjo darbas; jam reikės komponento `kas-gyvas`, index/path/grades įrašų ir 9 garso frazių.
- Programos derintojas turėtų patvirtinti 26.2.4 priskyrimą (scope.py „gyvoji gamta“ dar rodoma nepadengta; curriculum lentelėje `:82–88` temos nėra — tyrėjo failas neliestas).
- `matematika-1-klase.md:141` prieštarauja `:17300` — užfiksuota, bet neliesta (tyrėjo failas).
- #12692 (plakatas B.1.2 + B.3.1) neturi metodo; be to, ideator #258 taip pat neįrašė pasiūlymų failų — jie gyvena tik runs.db, todėl vertas atskiro įrankio patikros pasiūlymo.

Vienas netikslumas, kurio nespėjau pataisyti: LL-85 ir state.json mini failo dydį „3 985 B“, o po paskutinio body sutrumpinimo failas yra 4 046 B — skaičius dokumente pasenęs (LL-21 tipo smulkmena), turinys ir patikra nepakito.

## klaidos

```
session_id: local-f78b71861613a2d3dd440f8c175ef19403d757478bfd8afc442cf9df0da058f4
```
