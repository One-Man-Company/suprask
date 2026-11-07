---
title: "1 klasės metodai"
tipas: metodai
klase: 1
amzius: "6–7"
atnaujinta: 2026-11-07
---

# 1 klasės metodai

## Kognityvinis profilis

Pirmas susidūrimas su raide, skaičiumi ir pasauliu. Viskas pradedama nuo konkretaus daikto, garso ir veiksmo.

## Ką tai reiškia dizainui

- **Simuliacijos tipas:** tiesioginis manipuliavimas (bakstelėjimas, tempimas), garsas + vaizdas, vienas kintamasis, jokių laikmačių
- **Tekstas ekrane:** pagal amžiaus lentelę `docs/SVIETIMAS-1-GAIRES.md` (5 skyrius).
- **Grįžtamasis ryšys:** trumpas, apie veiksmą, be palyginimo su kitais.
- **Vertinimas:** savikontrolė ir refleksija; jokių pažymių.

## Ko vengti

- ilgo teksto, kelių kintamųjų iš karto, abstrakčių simbolių be vaizdo, bet kokio vertinimo balais

## Metodai

### M-01 — Laikas: vienas ratas, vienas žingsnis

**Data:** 2026-11-04 · **Tema:** `agents/proposals/2026-11-03-ideator-laikas.json` · **Tikslas:** `content/lt/grade-01/matematika/15-laikas.json`

**Viena didelė idėja.** Ilgoji rodyklė apeina vieną ratą — trumpoji pasislenka vienu skaičiumi. Pilną valandą skaitome pagal trumpąją, kai ilgoji stovi ties 12.

Minučių skaičius šiame metode nemokomas. Programa 1 klasei prašo „nusakyti laiką **pilnomis valandomis** (val., h)“ (`matematika-1-klase.md:129`), o minutės yra antra sąvoka. Modelis ilgąją rodyklę vadina „vienu ratu“, ne „60 minučių“, ir ciferblate sąmoningai nėra minučių brūkšnelių.

**Klaidingos nuostatos.**

1. **„Valandas rodo ilgoji rodyklė“** — ji ilgesnė, labiau matoma ir labiau juda, todėl vaikas ją laiko svarbiausia. Klaida pasireiškia kaip atsakymas „12 valandų“, kai ilgoji stovi ties 12, o trumpoji ties 7.
2. **„Rodyklės nepriklausomos“** — piešinyje kiekvieną rodyklę galima pastatyti kur nori, todėl vaikas nesitiki, kad viena priklauso nuo kitos. Tikrame laikrodyje jos sujungtos mechaniškai.
3. **Artimiausio skaičiaus strategija** (Williams, 2012): valanda nuskaitoma pagal artimiausią skaičių, todėl 2:50 skaitoma kaip 3:50, nes trumpoji rodyklė jau prie 3. Šiame modulyje rodomos tik pilnos valandos, bet **tarpinė padėtis parodoma sąmoningai** — kad vaikas matytų, jog tarp skaičių valanda dar nepasikeitė, ir nuostata nesusidarytų.

**Seka (konkretumas → simbolis → perkėlimas).**

1. **Kūnas.** Vaikas apeina kėdę — tai vienas ratas. Po kiekvieno rato mokytojas paslenka popierinę rodyklę per vieną skaičių ant kartono laikrodžio. Ratas jaučiamas kojomis, žingsnis — akimis.
2. **Ekranas.** Dvi sujungtos rodyklės. Vaikas traukia ilgąją; trumpoji slenka lygiai dvylika kartų lėčiau ir tik užsidarius ratui sustoja ties skaičiumi.
3. **Simbolis.** Ratui užsidarius pasirodo užrašas „3 val.“ — skaičius ir vienetas. Vaikas pasako „3 valandos“ ir parodo, kuri rodyklė tą skaičių parodė.
4. **Perkėlimas.** Rodyklių atpažinimas pagal judėjimą (kai spalvos ir užrašai nematomi) ir valandos skaičiavimas įvykių sekoje: „Išvyko 9 valandą, važiavo vieną ratą — kelintą atvyko?“

**Privalomas žingsnis prieš pirmą sukimo judesį.** `api.readout`: „Ką pasidarys trumpoji, kai ilgoji apeis visą ratą? Pasakyk, tada suk.“ Vaikas spėja žodžiu, tada tikrina. Tai ne puošmena: Earnest, Gonzales ir Plant (2017) nustatė, kad mechaniškai sujungtos rodyklės pagerina padėties tikslumą, bet dalis vaikų teisingai pastato rodykles „nesvarstydami mato struktūros“. Sujungtas modelis pats išsprendžia uždavinį už vaiką — todėl spėjimas ir perkėlimo užduotis yra būtini, o teisinga padėtis nelaikoma supratimo įrodymu.

**Simuliacijos specifikacija.** Komponentas `laikrodis-sujungtos-rodykles`, `assets/js/sims/matematika.js`, `config: { "startHour": 12 }`.

| Būsena | Ką rodo | `readout` |
|---|---|---|
| 0 ratų | abi rodyklės ties 12 | „12 valandų“ |
| ratas nebaigtas | ilgoji tarp skaičių, trumpoji pasislinkusi mažiau nei per skaičių | „Ratas nebaigtas“ |
| ratas baigtas | ilgoji lygiai ties 12, trumpoji lygiai ties skaičiumi | „1 valanda“ |

- **Vienas kintamasis:** `t` ∈ [0; 1] — kiek rato pasukta. `ilgoji = t · 360°`, `trumpoji = (valanda % 12) · 30° + t · 30°`. Nieko daugiau vaikas nekeičia.
- **Valdymas:** tempti ilgąją rodyklę (veikia visame ratlankio plote, ne tik ant rodyklės), `←`/`→` po 30°, mygtukas „Pasūk vieną ratą“ (≥ 48 px). Trys įėjimai, viena būsena — taip patenkamas ir 48 px reikalavimas, ir klaviatūra.
- **Skirtumas be spalvos:** trumpoji — stora ir buka, ilgoji — plona su rodykle. Spalva niekada nėra vienintelis informacijos nešėjas.
- **Tikslas matomas:** žalias žiedas ties 12 (target), rodyklė — oranžinė (active), visa kita neutralu.
- **Garsas:** uždaras 12 frazių rinkinys („1 valanda“, „2 valandos“ … „12 valandų“), kad `scripts/check_audio.py` manifestas liktų mažas. Gramatika — viena funkcija: 1 → *valanda*, 2–9 → *valandos*, 10–12 → *valandų*.
- **`prefers-reduced-motion`:** rodyklės nejuda tolygiai, būsena pasikeičia iš karto.
- **Be laikmačių, be ėjimų limito, be „game over“.** Ratas sukasi tiek kartų, kiek vaikas nori; 12 → 1 persisuka be klaidos pranešimo.

**Užduotys.**

1. **Atpažinimas** (pagrindinis lygis). „Ilgoji rodyklė ties 12, trumpoji — ties 7. Kiek dabar valandų?“ Variantai: 7 valandos / 12 valandų / 5 valandos. Užuomina į klaidą: „Kuri rodyklė trumpa? Ilgoji tik parodė, kad ratas baigtas.“
2. **Taikymas.** „Laikrodis rodo 9 valandas. Ilgoji apeina visą ratą ir vėl stoja ties 12. Kiek dabar valandų?“ (10). Užuomina: „Vienas ratas — vienas žingsnis trumpąja. Skaičiuok nuo 9 vienu toliau.“
3. **Perkėlimas.** „Rodyklės be žymenų. Per vieną ratą viena rodyklė apėjo visą ratą, kita pasislinko tik per vieną skaičių. Kuri rodo valandas?“ (trumpoji). Užuomina: „Daugiau judanti rodyklė ne visada skaičiuoja didesnį vienetą. Palygink, kiek pasislinko kiekviena.“
4. **Praplėtimas** (`optional: true`, aukštesnysis lygis). „Ilgoji nuėjo pusę rato ir sustojo. Ar laikrodis jau rodo kitą valandą?“ (ne — ratas nebaigtas, trumpoji dar tarp skaičių). Užuomina: „Pažiūrėk, ar trumpoji jau stovi lygiai ties skaičiumi.“

**Refleksija.** „Kiek ratų turi apeiti ilgoji, kol trumpoji apeis visą laikrodį? Pasakyk, kaip sužinojai.“ Atsakymas 12 — ne nauja sąvoka, o šio modelio pasekmė, todėl klausiama žodžiu, ne vertinama.

**Modelio ribos (pasakomos vaikui ir mokytojui).** Modelis nerodo minučių ir sekundžių; ilgoji rodyklė čia reiškia vieną ratą, o ne 60 minučių; 24 valandų sistema yra atskiras modulis, nes tai antra sąvoka. Tikrame laikrodyje rodyklės juda tolygiai — modelyje taip pat, todėl vaikas nemato dirbtinio „šuolio“.

**Šaltiniai.** Williams, R. F. (2012). Image schemas in clock-reading. *Journal of the Learning Sciences, 21*(2), 216–246. https://doi.org/10.1080/10508406.2011.553259 · Earnest, D., Gonzales, A. C., & Plant, A. M. (2018). Time as a measure: Elementary students positioning the hands of an analog clock. *Journal of Numerical Cognition, 4*(1), 188–214. https://doi.org/10.5964/jnc.v4i1.94 · Earnest, D., Gonzales, A. C., & Plant, A. M. (2017). Time as a measure… PME-NA 39 proceedings: https://files.eric.ed.gov/fulltext/ED581317.pdf

### M-02 — Lygybė: abi pusės sveria tiek pat

**Data:** 2026-11-05 · **Tema:** `agents/proposals/2026-11-04-ideator-lygybe.json` · **Tikslas:** `content/lt/grade-01/matematika/16-lygybe-svarstykles.json` · **Šaltinis:** `research/wiki/foundations/zenklas-kaip-busena.md`

**Viena didelė idėja.** Lygybės ženklas sako, kad abiejose pusėse tiek pat. Jis neįsako skaičiuoti. Svarstyklės nustoja svyruoti tik vienoje vietoje — ten, kur abi pusės lygios, todėl „=“ vaikui tampa būsena, o ne veiksmu.

**Kodėl modelis, o ne sakinys.** Sakinį „abi pusės lygios“ pirmokas perskaito kaip nurodymą skaičiuoti, nes taip jau yra įpratęs: Baroody ir Ginsburg (1983) po septynių mėnesių sistemingo mokymo tik 20 % pirmokų ženklą apibūdino kaip „tas pats“, o likusieji — kaip „atsakymas“. McNeil ir Alibali (2005) parodė, kad šie ankstyvi operaciniai šablonai ne tik išlieka, bet ir trukdo vėliau mokytis lygčių: vaikai linkę atlikti visus veiksmus su visais duotais skaičiais, laikyti, kad po ženklo turi būti atsakymas, ir suprasti „=“ kaip „viso“. Todėl reikia modelio, kuriame klaidinga būsena yra fiziškai matoma, o ne paaiškinama žodžiais.

**Klaidingos nuostatos ir kaip jos paneigiamos.**

1. **„= reiškia suskaičiuok ir parašyk atsakymą.“** Į `5 + ▢ = 8` vaikas atsako 13, nes sudeda abu duotus skaičius (operacinis šablonas, McNeil ir Alibali, 2005). Paneigiama ne aiškinimu, o sija: įdėjus 13 kubelių kairė lėkštė nusileidžia daug žemiau už dešinę. Lygiai yra tik viena dėžutės būsena.
2. **„Atsakymas visada dešinėje.“** Stephens ir kt. (2022), dirbę su darželinukais ir 1–2 klasių mokiniais, pastebėjo, kad vaikai dažnai nekreipia dėmesio į lygybės puses: `6 = 3 + 2` jie dėliojo 3 vienoje lėkštėje, o 6 ir 2 — kitoje, arba ieškojo 11 („sudėk viską“). Paneigiama tuo, kad ta pati lygi sija perskaitoma dviem kryptimis: `5 + 3 = 8` ir `8 = 5 + 3`; sija nejuda, vadinasi, abu užrašai teisingi.
3. **„Lygios svarstyklės reiškia vienodus skaičius.“** Paneigiama perkėlimo užduotimi `4 + 3 = 5 + 2`: abiejose pusėse skirtingi skaičiai, o kiekiai lygūs.

**Seka (konkretumas → modelis → simbolis → perkėlimas).**

1. **Kūnas.** Du vienodi puodeliai, pakabinti ant rėmelio (arba dvi vaiko rankos). Vaikas deda vienodus daiktus po vieną, kol abi pusės pajuntamos vienodai, tada skaičiuoja: daiktų skaičius gali skirtis, svoris — ne. Tikslas: lygybė yra būsena, kurią galima pajusti ir patikrinti.
2. **Ekranas.** Kairėje lėkštėje 5 kubeliai ir uždara dėžutė su `▢`, dešinėje — 8 kubeliai. Vaikas įdeda arba išima po vieną kubelį; sija palinksta į sunkesnę pusę. Tikslas: rasti vienintelį skaičių, kuriam esant sija lygi, ir pamatyti, kad ir per mažai, ir per daug yra matoma.
3. **Simbolis.** Kai sija lygi, po ja atsiranda kortelė `5 + 3 = 8`. Mygtukas „Perskaityk kitaip“ apverčia kortelę į `8 = 5 + 3`, o sija nejuda. Tikslas: ženklas įvardija būseną, o ne nurodo, kur rašyti atsakymą.
4. **Perkėlimas.** Lygi sija, kurios nė vienoje pusėje nėra vieno skaičiaus (`4 + 3 = 5 + 2`), ir kortelė, kurioje visas skaičius yra kairėje. Tikslas: skaityti „=“ kaip santykį ten, kur nėra įprasto „veiksmas = atsakymas“ vaizdo.

**Privalomas žingsnis prieš pirmą judesį.** `api.readout`: „Kiek kubelių reikia įdėti? Pasakyk, tada dėk.“ Kol vaikas nepaspaudė „Pradedu dėti“, „Įdėk 1“ ir „Išimk 1“ neaktyvūs. Be spėjimo sija tampa generatoriumi: vaikas spaudžia tol, kol atsistoja, ir teisinga būsena atsiranda be sprendimo (tas pats pavojus kaip M-01, žr. `foundations/sujungti-dydziai.md`).

**Simuliacijos specifikacija.** Komponentas `svarstykles-lygybe`, `assets/js/sims/matematika.js`, `config: { "known": 5, "whole": 8, "maxBox": 10 }`.

| Būsena | Ką rodo | `readout` |
|---|---|---|
| dėžutė tuščia (`box = 0`) | kairėje 5, dešinėje 8, sija palinkusi į dešinę | „Dešinė sunkesnė“ |
| per mažai (`1–2`) | tas pats, kampas mažesnis | „Dešinė sunkesnė“ |
| lygiai (`3`) | sija horizontali, po ja kortelė `5 + 3 = 8` | „Abi pusės lygios“ |
| per daug (`4–10`) | sija palinkusi į kairę | „Kairė sunkesnė“ |
| perskaityta kitaip (tik kai lygiai) | kortelė `8 = 5 + 3`, sija nepakitusi | „Ta pati lygybė“ |

- **Vienas kintamasis:** `box` ∈ [0; `maxBox`] — kubelių dėžutėje skaičius. Daugiau nieko vaikas nekeičia. Kairė pusė `known + box`, skirtumas `diff = known + box − whole`. „Perskaityk kitaip“ keičia ne kiekį, o užrašo kryptį — tai ne antras kintamasis, o tos pačios būsenos skaitymas.
- **Dėžutė uždara:** kubelių joje nesimato, ant šono — `▢`. Šalia dėžutės vertikali 10 taškų juosta, kurioje užsidega tiek taškų, kiek įdėta. Juosta reikalinga ne puošmenai: be jos vaikas turėtų atmintinai skaičiuoti, kiek įdėjo, o tai 6–7 m. vaikui yra papildoma darbinė apkrova (`foundations/kognityvine-apkrova.md`). Dėžutė lieka „nežinomasis“, apie kurį klausia užduotys.
- **Pakrypimas:** `1,6° × diff`, ribojama ±12°. Kampas proporcingas skirtumui, todėl „šiek tiek per daug“ ir „daug per daug“ skiriasi. `prefers-reduced-motion` — be perėjimo, būsena pasikeičia iš karto.
- **Įėjimai:** bakstelėjimas į dėžutę (`+1`), mygtukai „Įdėk 1“ / „Išimk 1“ (≥ 48 px), klaviatūra `→`/`↑` (`+1`), `←`/`↓` (`−1`), „Perskaityk kitaip“ (tik kai `diff = 0`), „Iš naujo“.
- **Grįžtamasis ryšys** — iškart po kiekvieno bakstelėjimo (≤ 1 kadras), be animacijos įžangos. `readout` įvardija tik santykį, o `api.note` po sija pasako vieną sakinį apie veiksmą: `box = 0` — „Dėžutė tuščia. Įdėk kubelį.“; `1–2` — „Dar trūksta.“; `4–10` — „Per daug. Išimk po vieną.“; `3` — „Penki ir trys yra aštuoni.“ `api.progress({correct:true})` — vieną kartą, kai pirmą kartą pasiekiama `diff = 0`.
- **Garsas** — keturios nustatytos frazės: „Dešinė sunkesnė.“, „Kairė sunkesnė.“, „Abi pusės lygios.“, „Ta pati lygybė.“ Skaičiai neskaitomi garsiai (mažas `check_audio.py` manifestas, jokių gramatikos sprendimų simuliacijoje).
- **Skirtumas be spalvos:** pakrypimo kampas, dėžutė su `▢` ir brūkšniuotu kontūru, tekstas `readout`. Kubelių spalva — tik papildoma.
- **Prieinamumas:** SVG `role="img"`, `aria-label` atnaujinamas („Kairėje 5 ir 3, dešinėje 8. Abi pusės lygios.“); dėžutė — `[role=button]` su `aria-label` („Dėžutė: įdėta 3 kubeliai“); visi mygtukai su `aria-label`.
- **Dydžiai 360 px:** dvi lėkštės po 128 px ir 40 px tarpas = 296 px, telpa į 328 px turinio plotį. Kubeliai 12 px su 2 px tarpu. Kairėje lėkštėje pirmoje eilutėje 5 kubeliai, antroje — dėžutė (36 × 40 px); dešinėje — 5 ir 3 kubeliai. Lėkštė 128 × 64 px.
- **Be laikmačių, be ėjimų limito, be „game over“.** Perpildyta dėžutė — informacija, ne bauda: vaikas išima kubelius ir bando toliau.

**Užduotys.**

| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
|---|---|---|---|---|---|
| 1 | atpažinimas | „Kairėje 5 kubeliai ir uždara dėžutė, dešinėje 8 kubeliai. Svarstyklės lygios. Kiek kubelių dėžutėje?“ — 13 / 3 / 8 | 3 (indeksas 1) | 13 — sudeda abu duotus skaičius | „Tu sudejai abi puses. Kiek kairiajai trūksta iki dešinės?“ |
| 2 | taikymas | „Kairėje 6 kubeliai ir dėžutė, dešinėje 10 kubelių. Kuri kortelė tiksliai pasako, kas padėta?“ — `6 + ▢ = 10` / `10 + ▢ = 6` / `6 + 10 = ▢` | `6 + ▢ = 10` (0) | trečias variantas — vėl „sudėk viską“; antras — sumaišytos pusės | „Kurioje pusėje stovi dėžutė? Toje pusėje rašyk `▢`.“ |
| 3 | perkėlimas | „Kortelė sako: `8 = 5 + ▢`. Kiek kubelių dėžutėje, kad svarstyklės būtų lygios?“ — 13 / 5 / 3 | 3 (2) | 13, arba „taip negalima, nes atsakymas turi būti dešinėje“ | „Skaičius prieš ženklą irgi gali būti visas kiekis. Įsivaizduok abi puses kaip lėkštes.“ |
| 4 | praplėtimas (`optional: true`) | „`4 + 3 = 5 + 2`. Ar ši lygybė teisinga?“ — „Taip, abi pusės lygios“ / „Ne, nes dešinėje nėra vieno skaičiaus“ / „Ne, nes 4 + 3 = 7“ | „Taip…“ (0) | antras — lygybė priimama tik kaip „veiksmas = atsakymas“ | „Nelygink pusės su atsakymu. Pažiūrėk į abi puses kaip į du atskirus kiekius.“ |

**Refleksija.** „Kai svarstyklės lygios, ar abiejose pusėse visada vienodi skaičiai? Papasakok pavyzdį.“ Atsakymas — ne, pvz., `4 + 3 = 5 + 2`; klausiama žodžiu, nevertinama.

**Modelio ribos (pasakomos vaikui ir mokytojui).** Svarstyklės lygina **kiekį**, o ne reiškinį: visi kubeliai vienodi, todėl svoris čia reiškia skaičių. Modelis rodo tik sudėtį su teigiamais skaičiais; atimties ir neigiamų skaičių jis neatvaizduoja, nes tai ta pati lygybė, perskaityta iš kitos pusės, ir atskira sąvoka (`Otten ir kt., 2019`, kur aprašytos 8 straipsnių nurodytos modelio ribos). Sija parodo, kad abi pusės lygios, bet nepaaiškina, kodėl `5 + 3` ir `8` yra tas pats skaičius — tą ryšį vaikas turi pasakyti pats. Todėl teisinga sijos padėtis nelaikoma supratimo įrodymu: reikia ir perskaitymo kita kryptimi, ir užduoties be vieno skaičiaus pusėje.

**Ką tai reiškia modulio autoriui.** `title` — „Lygybė: abi pusės sveria tiek pat“ (33 simboliai); `subtitle` — „Ženklas sako, kad abiejose pusėse tiek pat“ (42); `minutes` — 9; trys `outcomes` (atpažįstu, paaiškinu, nustatau trūkstamą skaičių); `concept.steps` — 3 žingsniai iš aukščiau pateiktos sekos 2–4; `teacher.offline` — pakaba su dviem puodeliais ir vienodais daiktais, vienas puodelis uždengiamas. `teacher.misconceptions` — trys nuostatos iš šio skyriaus. `sim` — `{ "component": "svarstykles-lygybe", "config": { "known": 5, "whole": 8, "maxBox": 10 } }`. Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/path.json` `sequence` (dizainerio arba leidėjo darbas, ne metodo dalis).

**Šaltiniai.** Baroody, A. J., & Ginsburg, H. P. (1983). The effects of instruction on children's understanding of the "equals" sign. *The Elementary School Journal, 84*(2), 199–212. https://doi.org/10.1086/461356 · McNeil, N. M., & Alibali, M. W. (2005). Why won't you change your mind? Knowledge of operational patterns hinders learning and performance on equations. *Child Development, 76*(4), 883–899. https://doi.org/10.1111/j.1467-8624.2005.00884.x · Falkner, K. P., Levi, L., & Carpenter, T. P. (1999). Children's understanding of equality: A foundation for algebra. *Teaching Children Mathematics, 6*(4), 232–236. https://doi.org/10.5951/TCM.6.4.0232 · Stephens, A., Sung, Y., Strachota, S., Torres, R. V., Morton, K., Gardiner, A. M., Blanton, M., Knuth, E., & Stroud, R. (2022). The role of balance scales in supporting productive thinking about equations among diverse learners. *Mathematical Thinking and Learning, 24*(1), 1–18. https://doi.org/10.1080/10986065.2020.1793055 · Otten, M., Van den Heuvel-Panhuizen, M., & Veldhuis, M. (2019). The balance model for teaching linear equations: A systematic literature review. *International Journal of STEM Education, 6*(1). https://doi.org/10.1186/s40594-019-0183-2

### M-03 — Pinigai: monetos vertė, ne jos dydis

**Data:** 2026-11-06 · **Tema:** `agents/proposals/2026-11-03-ideator-pinigai.json` · **Tikslas:** `content/lt/grade-01/matematika/14-pinigai.json` · **Šaltinis:** `research/wiki/foundations/dydis-ir-skaicius.md`

**Viena didelė idėja.** Monetos vertė yra ant jos parašytas skaičius. Pinigų suma — tų skaičių suma. Nei monetų dydis, nei monetų skaičius sumos nepasako.

**Kodėl modelis, o ne sakinys.** Šešeriamečiai vertę skaito iš to, ką mato: didesnė moneta atrodo vertingesnė, daugiau monetų — daugiau pinigų. Edmunds ir Whitehurst (1973) tyrė 80 vaikų nuo 2 iki 8 metų: sąvokai „daugiau“ vaikai naudojo monetos **dydį**, o ne vertę, ir toks pasirinkimas išliko iki septynerių metų, nors santykinės vertės supratimas ėmė ryškėti apie šešerius. Berti ir Bombi (1981), kas 12 mėnesių kartodami tyrimą su 80 vaikų (3–8 m.), aprašė šešias pakopas: pirmosiose vaikas pinigus skiria pagal **fizinį dydį ar pavadinimą**, o tiksli vertės ir kainos atitiktis susidaro tik penktoje pakopoje — po to, kai vaikas jau žino, kad mokėti reikia sumą, kuri ne mažesnė už kainą. Savo rezultatus autoriai palygino su Strauss (1952) gautais atsakymais kitos šalies vaikams — pakopos pasikartojo. Ši sąsaja nedingsta ir vėliau: Hasegawa (2020) eksperimentuose dalyviai apie monetos dydį sprendė lėčiau ir klysdavo dažniau, kai mažesnės vertės moneta buvo pavaizduota didesnė — „didesnis yra daugiau“ veikia automatiškai, net kai žmogus prieš tai laikė tikras monetas. Todėl raginimas „žiūrėk į skaičių“ konkuruoja su tuo, ką vaikas mato, ir pralaimi. Reikia modelio, kuriame **vertė atsiskiria nuo dydžio fiziškai**: mažesnė moneta gali pripildyti daugiau juostos, o kelios monetos — mažiau.

**Klaidingos nuostatos ir kaip jos paneigiamos.**

1. **„Didesnė moneta verta daugiau.“** Paneigiama tikru euro atveju: 5 centų moneta yra 21,25 mm skersmens, o 10 centų — 19,75 mm, tad 5 c moneta **didesnė**, nors verta perpus mažiau (Europos Komisijos ir EUR-Lex techninės specifikacijos). Modelis šio skirtumo neįrodo paveikslu ir to neslepia: 1,5 mm ekrane yra apie 2 px, todėl po to, kai vaikas įdeda abi monetas, `api.note` pasako vieną sakinį („Penkių centų moneta didesnė, bet verta mažiau.“), o **juosta** parodo dvigubą skirtumą. Skaičius ir juosta, ne akių matas.
2. **„Daugiau monetų — daugiau pinigų.“** Modelis skaičių ir sumą rodo atskirai ir niekada nesujungia: „Monetų: 6“ stovi kitoje eilutėje negu „Suma: 60 c“. Paneigiama veiksmu: 1 × 50 c + 1 × 10 c ir 6 × 10 c duoda tą pačią sumą su skirtingu monetų skaičiumi, o užduotis prašo palyginti du rinkinius, kurių monetų skaičius skiriasi. Programa pati skiria šiuos du klausimus: 1 klasės pasiekimų pavyzdyje klausiama atskirai „Kiek monetų turi…?“ ir „Kiek pinigų turi…?“ (`sources/pradinio-bp-rekomendacijos-2024.txt:33957–33959`). Kad atskyrimas būtinas, rodo ir Tracy bei Fanelli (2000): iš 35 pirmokų tik 7 teisingai suskaičiavo **mišrų** monetų rinkinį, o vertės tvarka monetas išdėliojo 34 %.
3. **„Monetos vertė — tai, ką už ją galima nupirkti.“** Tracy ir Fanelli (2000) užfiksavo vaikų atsakymus, kur moneta vertinama preke („verta ledinuko“). Ši nuostata modeliu nepaneigiama, nes modelis rodo kainą, o ne pasirinkimą parduotuvėje; ji įrašoma į `teacher.misconceptions` ir aptariama su mokytoju, o ne vaizduojama simuliacijoje.

**Seka (konkretumas → modelis → simbolis → perkėlimas).**

1. **Sauja.** Du vienodi maišeliai ar dvi saujos: vienoje viena 50 c moneta, kitoje penkios 10 c monetos. Vaikas pasveria abi saujas ir pasako, kur, jo nuomone, daugiau pinigų. Tikslas: pajusti, kad **sunkesnė sauja nėra turtingesnė** — svoris ir kiekis yra kitas matmuo negu suma. (Mokytojas sumos dar nepasako.)
2. **Ekranas.** Parduotuvės kortelė su kaina 60 c ir kainos juosta. Piniginėje keturios monetos — 50, 20, 10 ir 5 c — nupieštos **tikru santykiu**, su skaičiumi viduje. Vaikas baksteli monetą, ji nukeliauja į lėkštę, o juosta pailgėja tiek, kiek ta moneta verta. Tikslas: pamatyti, kad juostą ilgina **skaičius ant monetos**, o ne monetos dydis ar jų skaičius.
3. **Simbolis.** Kai juosta pasiekia kainos žymą, po lėkšte atsiranda eilutė `50 c + 10 c = 60 c`, o virš jos lieka atskira eilutė `Monetų: 2`. Vaikas perskaito sumą balsu. Tikslas: suma yra užrašytų skaičių suma; monetų skaičius yra kitas klausimas ir į eilutę nepatenka.
4. **Perkėlimas.** Ta pati kaina 60 c surenkama **kitaip** (20 + 20 + 20 arba 10 + 10 + 10 + 10 + 10 + 10): atsiranda tekstas „Ta pati suma, kitos monetos“, o `Monetų:` skaičius pasikeičia, suma — ne. Tada du vaikai moka už 80 c prekę: vienas 50 + 20 + 10, kitas keturiomis 20 c monetomis. Tikslas: atpažinti, kad skirtingi rinkiniai gali reikšti tą pačią sumą, ir perkelti taisyklę į situaciją be modelio.

**Privalomas žingsnis prieš pirmą judesį.** `api.readout`: „Kiek monetų prireiks 60 centų? Pasakyk, tada dėk.“ Kol vaikas nepasakė (paspaudė „Sakau“), monetos neaktyvios. Be spėjimo modelis tampa generatoriumi: vaikas baksto tol, kol juosta prisipildo, ir teisinga būsena atsiranda be sprendimo — tas pats pavojus kaip M-01 ir M-02 (`foundations/sujungti-dydziai.md`). Spėjimas čia skirtas **monetų skaičiui**, nes būtent skaičių vaikas linkęs painioti su suma.

**Simuliacijos specifikacija.** Komponentas `pinigine-ir-kaina`, `assets/js/sims/matematika.js`, `config: { "price": 60, "coins": [50, 20, 10, 5] }`.

| Būsena | Ką rodo | `readout` | `api.note` |
|---|---|---|---|
| lėkštė tuščia (`sum = 0`) | juosta tuščia, kainos žyma ties 60 c | „Kaina 60 c. Įdėk monetą.“ | „Dar nieko nesumokėta.“ |
| per mažai (`sum < price`) | juosta trumpesnė už žymą | „Dar ne visa kaina.“ | „Juosta dar nesiekia kainos žymos.“ |
| lygiai (`sum = price`) | juosta lygiai ties žyma, eilutė `50 c + 10 c = 60 c` | „Apmokėta. 60 c.“ | „50 ir 10 yra 60.“ |
| per daug (`sum > price`) | juosta peržengusi žymą, perteklius — brūkšniuotas | „Per daug.“ | „Juosta peržengė kainos žymą. Nuimk monetą.“ |
| ta pati suma kitaip (po pirmo `sum = price`) | ta pati juosta, kitas monetų rinkinys | „Ta pati suma, kitos monetos.“ | „Monetų skaičius kitas, suma ta pati.“ |
| įdėta 5 c ir 10 c kartu (vieną kartą) | abi monetos lėkštėje, jų juostos skiriasi dvigubai | ta pati būsena | „Penkių centų moneta didesnė, bet verta mažiau.“ |

- **Vienas kintamasis:** monetų rinkinys lėkštėje. Suma — deterministinė: `sum = 50a + 20b + 10c + 5d`. Daugiau vaikas nieko nekeičia; kaina fiksuota konfigūracijoje, monetų rinkinys fiksuotas (jokių „pasirink valiutą“).
- **Juosta:** 3,2 px už centą → 100 c = 320 px, telpa į 328 px turinio plotį; kaina 60 c — 192 px žyma; didžiausia įmanoma suma 85 c — 272 px. Juostos ilgis keičiasi iškart (be perėjimo, jei `prefers-reduced-motion`).
- **Monetų piešimas:** tikras santykis, 1,85 px/mm — 50 c ≈ 45 px, 20 c ≈ 41 px, 10 c ≈ 36,5 px, 5 c ≈ 39 px. Skaičius rašomas monetos viduje („50“, „c“), spalva — papildoma (5 c vario, 10–50 c aukso). **Lėkštėje** monetos rodomos vienodo 28 px dydžio, nes ten rodoma vertė, o ne dydis; tai sąmoninga modelio supaprastinimas, įvardytas žemiau.
- **Įėjimai:** keturi piniginės mygtukai 56 × 56 px (moneta 45 px viduje, `aria-label` „50 centų moneta“), lėkštėje monetos su 48 × 48 px lietimo sritimi (nuima monetą), mygtukai „Nuimk paskutinę“ ir „Iš naujo“ (≥ 48 px), „Sakau“ (spėjimo žingsnis). Klaviatūra: `Tab` tarp mygtukų, `Enter`/`Space` įdeda arba nuima, `←`/`→` perkelia pasirinkimą lėkštėje, `Backspace` nuima paskutinę.
- **Lėkštė:** `flex-wrap`, 28 px monetos su 4 px tarpu; eilutėje telpa 10 (316 px), dvi eilutės padengia 20 monetų — daugiausia, kiek reikia 95 c iš 5 c monetų. Perpildymas nebaudžiamas: monetų tiesiog daugiau, o eilutė vyniojama.
- **Grįžtamasis ryšys** — iškart po kiekvieno bakstelėjimo; `readout` įvardija tik santykį („Dar ne visa kaina“, „Per daug“), `api.note` — vieną sakinį apie veiksmą, ne apie vaiką. `api.progress({ correct: true })` — vieną kartą, kai pirmą kartą sumokama tiksliai.
- **Garsas** — penkios nustatytos frazės: „Dar ne visa kaina.“, „Apmokėta.“, „Per daug. Nuimk monetą.“, „Penkių centų moneta didesnė, bet verta mažiau.“, „Ta pati suma, kitos monetos.“ Skaičiai garsiai neskaitomi (mažas `scripts/check_audio.py` manifestas); generuojant garso failus reikia abiejų variantų (`n`, `s`).
- **Prieinamumas:** scenos SVG `role="img"` su `aria-label`, atnaujinamu po kiekvieno veiksmo („Lėkštėje dvi monetos: 50 ir 10. Suma 60 centų. Kaina 60 centų.“); `readout` turi `aria-live="polite"`; spalva niekada nėra vienintelis informacijos nešėjas — perteklius žymimas brūkšniu, ne tik raudonai; visi mygtukai turi `aria-label`.
- **Be laikmačių, be ėjimų limito, be „game over“.** Per didelė suma — informacija, ne bauda: vaikas nuima monetą ir bando toliau.

**Užduotys.**

| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
|---|---|---|---|---|---|
| 1 | atpažinimas | „Ant stalo trys monetos: 50 c, 10 c ir 10 c. Kiek tai pinigų?“ — 3 c / 30 c / 70 c | 70 c (indeksas 2) | 3 c — skaičiuoja monetas, ne vertes | „Skaičiuok, kas parašyta ant kiekvienos monetos, o ne kiek monetų yra.“ |
| 2 | taikymas | „Kaina 60 c. Kuris rinkinys sumokės tiksliai — nei per mažai, nei per daug?“ — `50 c + 10 c` / `50 c + 20 c` / `20 c + 20 c + 10 c` | `50 c + 10 c` (0) | antras — 70 c, per daug; trečias — 50 c, per mažai | „Sudėk abu skaičius ir palygink su kaina. Ar rinkinys didesnis už 60?“ |
| 3 | perkėlimas | „Už tą pačią 80 c prekę vienas vaikas davė 50 + 20 + 10, kitas — keturias 20 c monetas. Kuris sumokėjo daugiau?“ — Pirmas / Antras / Abu sumokėjo tiek pat | Abu sumokėjo tiek pat (2) | „Pirmas“ (didžiausios monetos) arba „Antras“ (daugiau monetų) | „Monetų skaičius ir monetų dydis čia nieko nesako. Sudėk abu rinkinius.“ |
| 4 | praplėtimas (`optional: true`) | „Kaina 95 c. Kuris rinkinys sumokės šią kainą mažiausiai monetų?“ — `50 + 20 + 20 + 5` / `50 + 20 + 10 + 10 + 5` / `20 + 20 + 20 + 20 + 10 + 5` | `50 + 20 + 20 + 5` (1) | trečias — ima daug smulkių, nes „kuo daugiau monetų, tuo saugiau“; antras — nešioja po 10 c, nors 20 c verta daugiau | „Viena didesnė moneta gali pakeisti kelias mažesnes. Skaičiuok, kiek monetų lieka kiekviename rinkinyje.“ |

**Refleksija.** „Kai dvi monetos skiriasi dydžiu, kaip sužinai, kuri verta daugiau? Papasakok, kur žiūri.“ Klausiama žodžiu, nevertinama; laukiamas atsakymas — į užrašytą skaičių, o dydis gali ir apgauti.

**Modelio ribos (pasakomos vaikui ir mokytojui).** Modelis rodo tik monetas iki 1 euro; banknotai (5, 10 €) ir 1 €, 2 € monetos lieka mokytojo veiklai su tikrais pinigais, nes jų įtraukimas reikalautų euro ir centų sąryšio — tai antra sąvoka. Modelis pats suskaičiuoja sumą, todėl tiksliai sumokėta juosta **nėra supratimo įrodymas**: dėl to yra spėjimo žingsnis ir užduotys be modelio. Ekrane monetų dydžiai tikri, bet 5 c ir 10 c skirtumas — 1,5 mm (apie 2 px), tad jį įvardija tekstas ir juosta, o ne akis; lėkštėje monetos sąmoningai vienodo dydžio. Kainos laikomos iki 95 c, kad vaiko aritmetika liktų 100 ribose (1 klasės skaičių sritis).

**Ką tai reiškia modulio autoriui.** `title` — „Pinigai: monetos vertė, ne jos dydis“ (36 simboliai); `subtitle` — „Sumą sudaro užrašyti skaičiai, ne monetų skaičius“ (49); `minutes` — 9; trys `outcomes` (atpažįstu monetą pagal užrašytą vertę; sudedu sumą iš kelių monetų; paaiškinu, kodėl didesnė moneta ne visada verta daugiau); `concept.example` — „Parduotuvėje 60 centų kainuojantį ledinuką gali sumokėti viena 50 c ir viena 10 c moneta arba šešiomis 10 c monetomis.“; `teacher.offline` — du maišeliai su ta pačia suma (50 c prieš penkias 10 c), po to tikrų monetų rūšiavimas pagal užrašą, ne pagal dydį; `teacher.misconceptions` — trys nuostatos iš šio skyriaus; `sim` — `{ "component": "pinigine-ir-kaina", "config": { "price": 60, "coins": [50, 20, 10, 5] } }`. Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/index.json` ir `path.json` (dizainerio arba leidėjo darbas, ne metodo dalis); numeris `14-` laisvas (15 ir 16 jau užimti).

**Šaltiniai.** Berti, A. E., & Bombi, A. S. (1981). The development of the concept of money and its value: A longitudinal study. *Child Development, 52*(4), 1179–1182. https://doi.org/10.2307/1129504 · Strauss, A. L. (1952). The development and transformation of monetary meanings in the child. *American Sociological Review, 17*(3), 275–286. https://doi.org/10.2307/2088073 · Hasegawa, K. (2020). The size-value compatibility effect. *Scientific Reports, 10*, 62419. https://doi.org/10.1038/s41598-020-62419-8 · Edmunds, G. J., & Whitehurst, K. (1973). *The emergence and development of monetary concepts in young children* (ERIC ED087553). https://eric.ed.gov/?id=ED087553 · Tracy, D. M., & Fanelli, B. H. (2000). *Teaching money concepts: Are we shortchanging our kids?* (ERIC ED451065). https://eric.ed.gov/?id=ED451065 · Europos Komisija. *Common sides of euro coins* (techninės specifikacijos). https://economy-finance.ec.europa.eu/euro/euro-coins-and-notes/euro-coins/common-sides-euro-coins_en · EUR-Lex. *Denominations and technical specifications of euro coins*. https://eur-lex.europa.eu/EN/legal-content/summary/denominations-and-technical-specifications-of-euro-coins.html

### M-04 — Kryptys: kairė priklauso nuo žiūrovo

**Data:** 2026-11-07 · **Tema:** `agents/proposals/2026-11-04-ideator-kryptys.json` · **Tikslas:** `content/lt/grade-01/matematika/17-kryptys-ir-vieta.json` · **Šaltinis:** `research/wiki/foundations/kryptis-ir-ziurovo-pozicija.md`

**Viena didelė idėja.** Kairė ir dešinė priklauso ne kambariui, o kūnui. Kai žmogus atsisuka į tave, jo kairė atsiduria tavo dešinėje.

**Kodėl modelis, o ne sakinys.** Sakinys „kito žmogaus kairė yra tavo dešinėje“ reikalauja žodžių, kurių pirmokas dar neturi. Rigal (1994), tyręs 406 vaikus, rado tokią tvarką: žodžius „kairė“ ir „dešinė“ vaikai pradeda teisingai taikyti savo kūnui apie septintus metus, paskui — žmogui, žiūrinčiam ta pačia kryptimi, ir tik 8–9 metais — žmogui, žiūrinčiam į juos. Net vienuolikos metų pusė tiriamųjų žodžių kitiems žmonėms dar netaikė tinkamai. Paveikslėlis čia nepadės: jame nematyti, kad pusė priklauso nuo to, kas žiūri. Tai parodo tik veikėjas, kurį vaikas pats pasuka.

**Tikslas sąmoningai kuklus.** Modulis nesiekia, kad pirmokas be klaidų nustatytų kito žmogaus kairę. Rigal (1996), tyręs 406 vaikus nuo 5 iki 11 metų, parodė, kad net 11-mečiai, kai žmogus žiūri į juos, teisingai atsako tik pusėje atvejų, o mažiausi atsakinėja taip, tarsi kitas matytų iš jų pačių pozicijos. Modulio tikslas — kad vaikas **pastebėtų priklausomybę** ir turėtų būdą pasitikrinti (atsisukti, įsivaizduoti save kito vietoje).

**Klaidingos nuostatos ir kaip jos paneigiamos.**

1. **„Kairė visiems ta pati pusė.“** Vaikas savo kairę perkelia veikėjui, kuris žiūri į jį. Rigal (1996) šį atsakymo būdą aprašo kaip būdingą mažiausiems ir nykstantį su amžiumi. Paneigiama pačiu modeliu: vabaliukui atsisukus į vaiką, žymė „kairė“ persoka į kitą ekrano pusę. Jei kairė būtų kambario savybė, posūkis jos nepajudintų.
2. **„Pasukti į kairę visada reiškia į kairę ekrano pusę.“** Tai ta pati klaida, tik apie komandą. Kai vabaliukas žiūri į vaiką, „Pasuk kairėn“ veda į dešinę ekrano pusę. Paneigiama dviem būsenomis, kurias vaikas pasiekia pats.
3. **„Pasukti reiškia žengti į šoną.“** Way ir Cartwright (2024) individualiai kalbino 36 pirmokus: tik keturi visiškai teisingai atliko abi užduotis, penki negalėjo įvykdyti nė vieno krypties nurodymo, o ne daugelis robotui apskritai davė komandas „kairėn“/„dešinėn“ — dažniau rodė gestais arba sakė „eik ten“. Tą patį žodį „pasuk“ vaikai suprato skirtingai: vieni pasisuko vietoje, kiti žengė į šoną. Todėl modelyje posūkis vyksta **vietoje** (vabaliukas lieka tame pačiame langelyje), o žingsnis yra atskiras mygtukas su atskiru sakiniu.
4. **„Jei nemoka, vadinasi, dar per mažas.“** Borke (1975) parodė, kad supaprastinus perspektyvos užduotį net trejų metų vaikai atsako ne vien iš savo pozicijos. Nesėkmė labiau priklauso nuo užduoties sandaros negu nuo vaiko savybės, todėl modelis sąmoningai paprastas: vienas veikėjas, viena sąsaja, trys ant trijų langeliai.

**Seka (konkretumas → modelis → simbolis → perkėlimas).**

1. **Kūnas.** Ant vaiko kairiojo riešo užmaunama popierinė apyrankė. Vaikas pasisuka vietoje 180 laipsnių kampu ir atsako: „Ar apyrankė liko toje pačioje kambario pusėje?“ Ne — ranka liko ta pati, pasikeitė tik kambario pusė. Tikslas: žodis priklauso kūnui, o kūnas turi priekį.
2. **Ekranas, lengvas atvejis.** Vabaliukas 3 × 3 tinklelyje žiūri nuo vaiko (aukštyn). Ant kairės priekinės kojos — apyrankė, šalia — žymė „kairė“. Vaikas spaudžia „Pasuk kairėn“ / „Pasuk dešinėn“; žymė sukasi kartu su kūnu, o vabaliukas lieka tame pačiame langelyje. Tikslas: pamatyti, kad žymė pritvirtinta prie kūno, o ne prie ekrano, ir kad posūkis neperkelia.
3. **Simbolis, sunkus atvejis.** Vaikas pasuka vabaliuką į save. Žymė atsiduria dešinėje ekrano pusėje, o `api.readout` pasako: „Vabaliukas žiūri į tave. Jo kairė — tavo dešinėje.“ Vaikas pakartoja sakinį balsu ir parodydamas. Tikslas: santykį įvardyti žodžiais, kai jis jau matytas.
4. **Perkėlimas.** Mokytoja stovi priešais klasę ir prašo pakelti dešinę ranką; du vaikai, stovintys vienas priešais kitą, abu pasuka į savo kairę. Tikslas: taikyti taisyklę be modelio, kai žiūrovas yra tikras žmogus.

**Privalomas spėjimo žingsnis prieš pirmą judesį.** `api.readout` pradžioje: „Vabaliukas žiūri nuo tavęs. Kur bus jo kairė, kai jis atsisuks į tave? Pasakyk, tada pasuk.“ Vaikas atsako balsu, tada sukasi. Be spėjimo vaikas gali sukti tol, kol žymė „atrodys teisingai“, ir sąryšio nesudaryti — tas pats pavojus kaip M-01–M-03 (`research/wiki/foundations/sujungti-dydziai.md`). Atsakymo variantų ekrane nėra: kintamasis turi likti vienas, o spėjimas tikrinamas žodžiu ir vėliau — užduotyse be modelio.

**Simuliacijos specifikacija.** Komponentas `vabaliukas-ir-kryptys`, `assets/js/sims/matematika.js`, `config: { "size": 3, "start": { "col": 1, "row": 1, "facing": "up" }, "leaf": { "col": 0, "row": 0 }, "sentences": { ... } }`.

| Būsena | Ką rodo | `readout` | `api.note` |
|---|---|---|---|
| pradžia (`facing = up`) | vabaliukas viduriniame langelyje, atgręžtas nugara, apyrankė kairėje kojoje, žymė „kairė“ kairėje | „Vabaliukas žiūri nuo tavęs. Jo kairė — kairėje.“ | „Pasukimas vyksta vietoje: jis lieka tame pačiame langelyje.“ |
| `facing = right` | žymė viršuje | „Vabaliukas žiūri į dešinę. Jo kairė — viršuje.“ | „Kairė pasisuko kartu su juo.“ |
| `facing = down` (į vaiką) | žymė dešinėje ekrano pusėje | „Vabaliukas žiūri į tave. Jo kairė — tavo dešinėje.“ | „Jis žiūri į tave, todėl jo kairė yra kitoje pusėje.“ |
| `facing = left` | žymė apačioje | „Vabaliukas žiūri į kairę. Jo kairė — apačioje.“ | „Ta pati kairė, tik kita kryptis.“ |
| žingsnis atliktas | naujas langelis, kryptis ta pati, apyrankė toje pačioje kūno pusėje | „Žengė vieną langelį į priekį.“ | „Žingsnis eina į priekį, ne į šoną.“ |
| kraštas | vabaliukas nejuda, „Žingsnis“ neaktyvus | „Toliau tinklelio nėra.“ | „Pasuk ir bandyk kita kryptimi.“ |
| lapas pasiektas | lapas po vabaliuku | „Pasiekei lapą.“ | „Dabar pasuk jį į save ir pasakyk, kur jo kairė.“ |

- **Vienas kintamasis:** `facing` ∈ {`up`, `right`, `down`, `left`}. Vaikas keičia tik tai, į ką vabaliukas žiūri. `Žingsnis` kintamojo nekeičia — jis parodo krypties pasekmę; pozicija atstatoma mygtuku „Iš naujo“.
- **Tinklelis:** 3 × 3, langelis 88 px, tarpas 8 px → 280 px, telpa į 328 px turinio plotį. Vabaliukas 48 px, krypties rodyklė 12 px.
- **Kairės žymė:** užpildytas žiedas ant kairės priekinės kojos (forma, ne vien spalva) ir kortelė „kairė“, pritvirtinta prie kūno. Kortelė sukasi kartu su vabaliuku; spalva niekada nėra vienintelis informacijos nešėjas.
- **Įėjimai:** „Pasuk kairėn“ ir „Pasuk dešinėn“ po 104 × 56 px, „Žingsnis pirmyn“ 328 × 56 px, „Iš naujo“ ≥ 48 px. Klaviatūra: `←`/`→` sukasi, `↑`/`Space` žengia, `R` atstato. Visiems mygtukams `aria-label`.
- **Posūkis:** 200 ms sukimasis vietoje; `prefers-reduced-motion` — būsena pasikeičia iš karto. Jokių laikmačių, ėjimų limito, „game over“; kraštas yra informacija, ne bauda.
- **Grįžtamasis ryšys** — iškart po veiksmo (≤ 1 kadras). `readout` įvardija tik būseną, `api.note` — vieną sakinį apie veiksmą. `api.progress({ correct: true })` — vieną kartą, kai pasiektas lapas **ir** vabaliukas bent kartą žiūrėjo į vaiką (bet kokia tvarka).
- **Garsas** — septynios nustatytos frazės, lygiai tokios kaip `readout` lentelėje. `api.note` garsiai neskaitomas (mažas `scripts/check_audio.py` manifestas). Generuojant reikia abiejų variantų (`n`, `s`).
- **Prieinamumas:** scenos SVG `role="img"`, `aria-label` aprašo padėtį ir apyrankę, bet nekartoja `readout` sakinio: „Vabaliukas viduriniame langelyje, žiūri į tave. Apyrankė ant kairės priekinės kojos.“ `readout` turi `aria-live="polite"`.
- **Modelio sąžiningumas ekrane:** vabaliukas turi aiškų priekį (galva ir krypties rodyklė), o jo kūnas simetriškas — todėl kairę parodo tik apyrankė ir žymė. Be jų modelis būtų dviprasmis, todėl žymė rodoma visada, taip pat ir tada, kai vabaliukas pasuktas į vaiką.

**Užduotys.**

| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
|---|---|---|---|---|---|
| 1 | atpažinimas | „Vabaliukas žiūri į tave. Kurioje ekrano pusėje yra jo kairė?“ — Kairėje / Dešinėje / Virš jo galvos | Dešinėje (1) | „Kairėje“ — savo kairę perkelia veikėjui | „Prisimink, kur atsidūrė apyrankė, kai jis atsisuko į tave.“ |
| 2 | taikymas | „Vabaliukas žiūri į dešinę. Jis pasisuka į kairę. Į kurią pusę jis dabar žiūri?“ — Į apačią / Į viršų / Į kairę | Į viršų (1) | „Į kairę“ — suka ekrano kryptimi, ne kūno atžvilgiu | „Pasisukimas vyksta vietoje. Įsivaizduok, kad stovi jo vietoje ir žiūri į dešinę.“ |
| 3 | perkėlimas | „Mokytoja stovi priešais klasę ir sako: „Pakelkite dešinę ranką.“ Kurioje klasės pusėje yra jos dešinė?“ — Mano dešinėje / Abiejose pusėse / Mano kairėje | Mano kairėje (2) | „Mano dešinėje“ — priskiria mokytojai savo pusę | „Ji žiūri į tave. Prisimink vabaliuką, kuris atsisuko į tave.“ |
| 4 | praplėtimas (`optional: true`) | „Du vaikai stovi vienas priešais kitą. Abu pasuka į savo kairę. Ar jie žiūri į tą pačią pasaulio pusę?“ — Ne, į priešingas puses / Taip, į tą pačią / Ne, vienas atsisuko atgal | Ne, į priešingas puses (0) | „Taip“ — kairę laiko pasaulio savybe | „Kiekvienas suka savo kūno atžvilgiu. Jie stovi priešingomis kryptimis.“ |

**Refleksija.** „Kaip sužinai, kuri pusė yra kito žmogaus kairė? Pasakyk, ką darai su savo kūnu.“ Klausiama žodžiu, nevertinama; laukiamas atsakymas — atsisukti, įsivaizduoti save kito vietoje arba sekti apyrankę.

**Modelio ribos (pasakomos vaikui ir mokytojui).** Modelis rodo vieną veikėją 3 × 3 tinklelyje ir tik kairę/dešinę. Priekis/atgal ir tinklelio adresas (B1, C3) sąmoningai neįtraukti — tai antros sąvokos, o Phinney ir Nummedal (1979) rodo, kad su vienu objektu kairės/dešinės apsukimas ir taip yra sunkiausias atvejis. Modelis neįrodo įgūdžio: Rigal (1994, 1996) duomenys rodo, kad kito žmogaus kairę vaikai pradeda taikyti 8–9 metais, o 11-mečiai tebeklysta. Todėl teisingas atsakymas modulyje nėra „įvaldymo“ įrodymas, o klaida — ne vaiko savybė: Borke (1975) parodė, kad perspektyvos užduoties sunkumas labiau priklauso nuo užduoties negu nuo vaiko.

**Ką tai reiškia modulio autoriui.** `title` — „Kryptys: kairė priklauso nuo žiūrovo“ (36 simboliai); `subtitle` — „Ta pati pusė atsiduria kitoje vietoje, kai žiūri į tave“ (55); `minutes` — 9; trys `outcomes`: „Parodau, kuri pusė yra mano kairė.“, „Pasuku veikėją ir pasakau, kur atsiduria jo kairė.“, „Paaiškinu, kodėl kito žmogaus kairė yra mano dešinėje.“; `concept.title` — „Kairė priklauso nuo žiūrovo“ (27); `concept.big_idea` — „Kairė ir dešinė priklauso ne kambariui, o kūnui. Kai žmogus atsisuka į tave, jo kairė atsiduria tavo dešinėje.“ (110); `concept.steps` — keturi žingsniai iš sekos 1–4; `concept.example` — „Mokytoja stovi priešais klasę. Jos dešinė ranka yra tavo kairėje pusėje.“; `teacher.offline` — apyrankė ant riešo, vaikai poromis atsisuka vienas į kitą ir rodo savo kairę, tada mokytoja priešais klasę kelia dešinę; `teacher.misconceptions` — keturios nuostatos iš šio skyriaus; `sim` — `{ "component": "vabaliukas-ir-kryptys", "config": { "size": 3, "start": { "col": 1, "row": 1, "facing": "up" }, "leaf": { "col": 0, "row": 0 } } }`. Numeris `17-` laisvas. Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/index.json` ir `path.json` (kūrėjo ar dizainerio darbas, ne metodo dalis); siūloma vieta kelyje — iškart po `06-figuros`, nes orientacija remiasi figūros padėtimi.

**Skaičių tikslinimas.** Ideatoriaus pasiūlyme rašoma „36 pirmokų tyrime 27–28 žinojo, kuri jų kairė, bet tik 6 teisingai nurodė robotui posūkius kairėn ir dešinėn“. Way ir Cartwright (2024) tekste tokių skaičių nėra: ten sakoma, kad tik **keturi** vaikai visiškai teisingai atliko abi užduotis, **penki** negalėjo įvykdyti nė vieno krypties nurodymo, o dauguma komandų kairėn/dešinėn robotui iš viso nesakė. Metodas remiasi šaltinio skaičiais, o ne pasiūlymo santrauka.

**Šaltiniai.** Rigal, R. (1994). Right-left orientation: Development of correct use of right and left terms. *Perceptual and Motor Skills, 79*(3), 1259–1278. https://doi.org/10.2466/pms.1994.79.3.1259 · Rigal, R. (1996). Right-left orientation, mental rotation, and perspective-taking. *Perceptual and Motor Skills, 83*(3), 831–842. https://doi.org/10.2466/pms.1996.83.3.831 · Phinney, J. S., & Nummedal, S. G. (1979). Effects of left-right orientation and position reversals on spatial perspective taking in young children. *Perceptual and Motor Skills, 48*(1), 223–227. https://doi.org/10.2466/pms.1979.48.1.223 · Borke, H. (1975). Piaget's mountains revisited. *Developmental Psychology, 11*(2), 240–243. https://doi.org/10.1037/h0076459 · Way, J., & Cartwright, K. (2024). Turn left, turn right. *MERGA 46 Quick Reads*. http://merga.net.au/wp-content/uploads/2024/09/6-MERGA-46-2024-Quick-Reads_Way-and-Cartwright.pdf · Kocher, D., Sarmiento, L., Heller, S., Yang, Y., Kushnir, T., & Green, K. E. (2020). No, your other left! *IEEE ICDL-EpiRob 2020*, 1–6. https://doi.org/10.1109/icdl-epirob48136.2020.9278108 · Abarbanell, L., & Li, P. (2021). Unraveling the contribution of left-right language on spatial perspective taking. *Spatial Cognition & Computation, 21*(1), 1–38. https://doi.org/10.1080/13875868.2020.1825442

## Atviros prielaidos

- _(kas šioje klasėje dar nepatikrinta; žr. [[../../guidelines/klausimai|klausimus]])_

## Šaltiniai

- Oficiali programa: `research/wiki/curriculum/`
- Metodų bazė: `research/wiki/foundations/`
