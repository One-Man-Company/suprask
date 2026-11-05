# Pilotų registras

Kiekvienas naujas dizaino sprendimas laikomas pilotu (Švietimas #1, 6 žingsnis). Čia registruojama: hipotezė, ką keičiame, kaip matuosime, rezultatas. Sprendimai neplatinami tol, kol nėra rezultato.

## Šablonas

```
### P-000 — pavadinimas
- **Data:**
- **Hipotezė:** jei padarysime X, tai Y pagerės, nes Z (šaltinis).
- **Ką keičiame:**
- **Kaip matuojame:** (konkretus rodiklis, ne „geriau“)
- **Rezultatas:** (data, skaičiai)
- **Sprendimas:** plėsti / tobulinti / stabdyti
```

---

### P-001 — Simuliacija prieš paaiškinimą
- **Data:** 2026-11-03
- **Hipotezė:** jei modulyje simuliacija rodoma prieš išsamų paaiškinimą, vaikas ilgiau išbūna ir geriau atsako į perkėlimo užduotį, nes pirmiau įgyja konkrečios patirties (konkretumas prieš abstrakciją; produktyvios nesėkmės tyrimai).
- **Ką keičiame:** modulio puslapio tvarką — simuliacija iškelta virš „Kaip tai veikia“.
- **Kaip matuojame:** užduočių teisingumo dalis pirmame bandyme ir modulio užbaigimo dažnis. Duomenys nerenkami automatiškai — matuojama tik savanorišku mokytojo stebėjimu.
- **Rezultatas:** dar nėra.
- **Sprendimas:** laukiama duomenų.

### P-002 — Vienas teisingo atsakymo indeksas
- **Data:** 2026-11-03
- **Hipotezė:** jei teisingi atsakymai visada pirmame variante, vaikai pradeda spausti pirmą variantą neskaitę.
- **Ką keičiame:** atsakymų pozicijos perskirstytos (`scripts/rebalance_answers.py`), validatorius tikrina, kad ne visi atsakymai būtų tame pačiame indekse.
- **Kaip matuojame:** nebegalima — klaida buvo pašalinta prieš publikuojant.
- **Rezultatas:** pašalinta.
- **Sprendimas:** taisyklė įtraukta į standartą.

### P-003 — Figūra atpažįstama pagal kampus, ne pagal padėtį
- **Data:** 2026-11-04
- **Hipotezė:** jei rūšiavimo simuliacijoje figūros rodomos pasuktos ir vaikas gali jas sukti pats, o dėžės vadinamos kampų skaičiumi (ne figūros vardu), tai mažiau vaikų klysta su pasukta figūra ir dažniau vadovaujasi savybe, nes 1 klasės programoje figūra apibrėžiama kraštinėmis ir kampais, o dažna klaida — atpažinti tik „kaip paveikslėlyje“ (`06-figuros` `teacher.misconceptions`).
- **Ką keičiame:** `figuros` simuliacija (`assets/js/sims/matematika.js`): figūros pasuktos (0°, 155°, 265°, kvadratas 45°), dėžės žymimos „3 kampai / 4 kampai / 0 kampų“ su figūros kontūru, pridėtas parametras „Pasuk pasirinktą“ ir jungiklis „Rodyk kampus“ (kampai žymimi taškais). Be to, pašalintas 41 px horizontalus slinkimas 360 px ekrane ir figūrų mygtukams suteikti `aria-label`.
- **Kaip matuojame:** klaidų, kai pasukta figūra įdedama į neteisingą dėžę, dalis pirmame bandyme ir tai, ar vaikas savo žodžiais pasako, kad pasukus kampų skaičius nekinta (refleksijos klausimas). Stebėjimas savanoriškas, duomenys nerenkami.
- **Rezultatas:** dar nėra.
- **Sprendimas:** laukiama duomenų.

### P-004 — Sujungtos laikrodžio rodyklės
- **Data:** 2026-11-04
- **Hipotezė:** jei ilgoji ir trumpoji rodyklės modeliuojamos kaip mechaniškai sujungtos (viena negali judėti be kitos), pirmokai dažniau teisingai nurodo pilną valandą ir perkelia taisyklę į naują situaciją, nes ryšį stebi, o ne įsimena. Rizika žinoma iš anksto: sujungtos rodyklės gali duoti teisingą padėtį be supratimo (Earnest ir kt., 2017; `research/wiki/foundations/sujungti-dydziai.md`).
- **Ką keičiame:** pirmoji simuliacija, kurioje dydžiai priklausomi, o pagrindinis įėjimas — tempimas ratu (ne bakstelėjimas). Modulis `15-laikas`, komponentas `laikrodis-sujungtos-rodykles`.
- **Kaip matuojame:** perkėlimo užduoties (rodyklių atpažinimas pagal judėjimą) teisingumas pirmu bandymu ir tai, ar refleksijoje vaikas įvardija patį ryšį („ratas — žingsnis“), o ne tik pakartoja valandą. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
- **Rezultatas:** dar nėra.
- **Sprendimas:** laukiama duomenų. Jei vaikai atsakys teisingai, bet neįvardys ryšio, jungtis lieka, o spėjimo žingsnis ir perkėlimo užduotis stiprinami.

### P-005 — Svarstyklės su uždara dėžute ir perskaitymu kita kryptimi
- **Data:** 2026-11-05
- **Hipotezė:** jei modelis grįžtamąjį ryšį duoda kaip santykį (sija palinksta į sunkesnę pusę), o tą pačią lygią būseną galima perskaityti abiem kryptimis (`5 + 3 = 8` ir `8 = 5 + 3`), tai daugiau pirmokų priims apverstą lygybės formą ir teisingai atsakys į užduotį be vieno skaičiaus pusėje, nes ženklas mokomas kaip būsena, o ne kaip nurodymas rašyti atsakymą (McNeil ir Alibali, 2005; Stephens ir kt., 2022; `research/wiki/foundations/zenklas-kaip-busena.md`).
- **Ką keičiame:** pirmoji simuliacija su uždara nežinomojo dėžute ir pirmoji, kurios grįžtamasis ryšys yra tolydus santykis (pakrypimo kampas), o ne diskreti būsena. Modulis `16-lygybe-svarstykles`, komponentas `svarstykles-lygybe`. Mygtukas „Perskaityk kitaip“ — pirmas atvejis platformoje, kai tas pats modelis parodomas dviem užrašo kryptimis.
- **Kaip matuojame:** perkėlimo užduoties (`8 = 5 + ▢`) ir praplėtimo užduoties (`4 + 3 = 5 + 2`) teisingumas pirmu bandymu; ar refleksijoje vaikas pasako, kad lygiose pusėse skaičiai gali skirtis; ar vaikas naudojasi „Perskaityk kitaip“ (jei nenaudoja — ar mygtukas pastebimas). Duomenys nerenkami automatiškai, tik savanoriškas mokytojo stebėjimas.
- **Rezultatas:** dar nėra.
- **Sprendimas:** laukiama duomenų. Jei vaikai sprendžia siją, bet neatmeta operacinio skaitymo, stiprinamas spėjimo žingsnis ir apverstos formos užduotis; jei „Perskaityk kitaip“ lieka nepastebėtas, mygtukas keliamas virš sijos, o ne šalinamas.

### P-006 — Metų laikai kaip tolydus mėnesio modelis
- **Data:** 2026-11-05
- **Hipotezė:** jei metų laikai rodomi ne kaip keturi atskiri paveikslėliai, o kaip vienas kintamasis (mėnuo 1–12), iš kurio išvedama dienos trukmė, saulės kelio aukštis ir medžio būsena, tai daugiau pirmokų pastebi, kad kaita laipsniška ir siejasi su šviesos kiekiu, o ne tik su oru, nes pokytis matomas tiesiogiai tempiant, o ne įsimenant keturias korteles (`08-metu-laikai` `teacher.misconceptions[1]`; `research/wiki/foundations/simuliacijos-ir-modeliai.md`).
- **Ką keičiame:** `metu-laikai` simuliacija (`assets/js/sims/pasaulis.js`) perrašyta: vietoje keturių mygtukų, perjungiančių paruoštą paveikslą (tai buvo iliustracija, ne modelis pagal `KURINIO-STANDARTAS` §4.1), yra vienas slankiklis „mėnuo“ + du 48 px žingsnio mygtukai. Iš mėnesio deterministiškai išvedama: dienos trukmė (Vilniaus platumai, 7 val. 15 min. – 17 val. 25 min.), lanko plotis ir saulės aukštis, medžio lapų etapas, sniegas, paukščiai. Po scena — dienos ilgio juosta su pastoviomis gruodžio ir birželio žymomis ir palyginimas su praėjusiu mėnesiu („ilgesnė nei gruodį“).
- **Kaip matuojame:** ar vaikas, pajudinus slankiklį keliais mėnesiais, savo žodžiais pasako, kad diena ilgėja arba trumpėja, ir ar perkėlimo užduotyje („kuriuo metu šviesiausia“) atsako remdamasis šviesa, o ne oru; ar vaikas naudojasi slankikliu, o ne tik žingsnio mygtukais. Duomenys nerenkami automatiškai, tik savanoriškas mokytojo stebėjimas.
- **Rezultatas:** dar nėra.
- **Sprendimas:** laukiama duomenų. Jei slankiklis per sunkus 6–7 metų rankai, žingsnio mygtukai lieka pagrindiniu įėjimu, o slankiklis rodomas kaip santrauka; jei vaikai nepastebi palyginimo su praėjusiu mėnesiu, jis perkeliamas į `api.readout`, o ne šalinamas.
