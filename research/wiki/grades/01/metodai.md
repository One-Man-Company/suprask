---
title: "1 klasės metodai"
tipas: metodai
klase: 1
amzius: "6–7"
atnaujinta: 2026-11-24
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
3. **„Pasukti reiškia žengti į šoną.“** Way ir Cartwright (2024) individualiai kalbino 36 pirmokus: tik keturi visiškai teisingai atliko abi užduotis, penki negalėjo įvykdyti nė vieno krypties nurodymo, o dauguma robotui komandų „kairėn“/„dešinėn“ iš viso nesakė — dažniau rodė gestais arba sakė „eik ten“. Tą patį žodį „pasuk“ vaikai suprato skirtingai: vieni pasisuko vietoje, kiti žengė į šoną. Todėl modelyje posūkis vyksta **vietoje** (vabaliukas lieka tame pačiame langelyje), o žingsnis yra atskiras mygtukas su atskiru sakiniu.
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

### M-05 — Emocijos: tas pats įvykis, skirtingas jausmas

**Data:** 2026-11-08 · **Tema:** `research/wiki/guidelines/klausimai.md:29` (atviras klausimas, ideator #128) · **Tikslas:** `content/lt/grade-01/gyvenimo-igudziai/01-dovana-ir-noras.json` · **Šaltinis:** `research/wiki/foundations/jausmas-ir-noras.md`

**Viena didelė idėja.** Tas pats įvykis gali kelti skirtingus jausmus. Jausmas priklauso ne vien nuo to, kas nutiko, o ir nuo to, ko žmogus norėjo.

**Kodėl modelis, o ne paveikslėlis.** Klausimas `klausimai.md:29` buvo toks: „gerai nupieštas paveikslėlis su abiem vaikais parodo tą patį“. Ne — parodo vieną būseną. Iš paveikslėlio, kuriame vienas vaikas juokiasi, o kitas nuliūsta prie tos pačios dovanos, vaikas negali pasakyti, **kas** tą skirtumą padarė: gal dovana gera ir tik antrasis nemoka džiaugtis, gal pirmasis jos prašė. Noras yra nematomas, todėl jo negalima nei parodyti, nei pakeisti paveikslėlyje. Modelis laiko tą patį įvykį (dovaną) ir keičia tik norą: pasikeičia vieno vaiko veidas, kito — ne. Toks palyginimas egzistuoja tik todėl, kad egzistuoja antra būsena, o paveikslėlyje jos nėra. Antras interaktyvumo argumentas — spėjimas prieš veiksmą (`r_predict`): paveikslėlis jo nereikalauja, modelis be jo praranda prasmę.

**Kodėl būtent noras, o ne „visi jaučia skirtingai“.** Rieffe, Terwogt ir Cowan (2005) prašė 4, 6 ir 10 metų vaikų (n = 122) paaiškinti, kodėl veikėjas jaučiasi taip, kaip jaučiasi. Mentalinius paaiškinimus (norą, įsitikinimą) jauniausieji vartojo rečiausiai, o su amžiumi jų daugėjo; be to, noras dažniausiai paaiškindavo pyktį, džiaugsmą ir liūdesnį. Vadinasi, 6–7 metų vaikas noro kaip priežasties **jau ieško**, bet dar nepakankamai, kad ja paremtų sprendimą tada, kai noro niekas nepasakė. Todėl modelyje noras ne aiškinamas žodžiais, o parodomas burbulu ir duodamas keisti. Pons, Harris ir de Rosnay (2004), ištyrę 100 vaikų nuo 3 iki 11 metų, parodė, kad emocijų supratimas skyla į devynis komponentus, o trys tarpsniai išsidėsto hierarchiškai: vėlesnis remiasi ankstesniu. Todėl modulis ima patį pirmą ryšį (jausmas ← noras) ir sąmoningai neapima nei slepiamo jausmo, nei mišrių jausmų — tai vėlesni komponentai.

**Klaidingos nuostatos ir kaip jos paneigiamos.**

1. **„Kas gavo dovaną, tas džiaugiasi.“** Tai ta pati situacinė taisyklė, kurią vaikas taiko, kol noras nepastebėtas: įvykis matomas, noras — ne. Paneigiama modeliu: dovana ta pati, o Rėjaus veidas apsiverčia pakeitus tik jo norą; Ievos veidas nepakinta nė karto, nors dovana ta pati. Jei jausmą lemtų dovana, abu veidai keistųsi kartu.
2. **„Jei vaikas nuliūdo, dovana buvo bloga (arba jis nedėkingas).“** Paneigiama palyginimu: ta pati dovana vienam džiugu, kitam ne, tad priežastis yra noras, ne daikto vertė ir ne vaiko būdas. Saarni (1979) rodo, kad slėpti nusivylimą vaikai išmoksta palaipsniui (6 → 10 metų), todėl atviras nusivylimas 6–7 metais yra amžių atitinkantis elgesys, o ne auklėjimo trūkumas.
3. **„Vienas įvykis — vienas teisingas jausmas.“** Būtent šios nuostatos bijojo ideatorius, atmesdamas formą „situacija → viena teisinga emocija“ (`agents/log/ideator-2026-11-03T1655.md:116–117`). Modelyje teisingo jausmo įvykiui nėra: du vaikai prie tos pačios dovanos jaučiasi priešingai, ir abu jausmai teisingi. Užduotys klausia ne „ką jauti tu“, o „ką jaus tas žmogus, jei jis norėjo to“.

**Tikslas sąmoningai kuklus.** Modulis nesiekia, kad vaikas nustatytų kito žmogaus jausmą. To negalima padaryti iš veido, o modelis to ir nerodo: jis rodo, nuo ko jausmas priklauso. Tikslas — kad vaikas pastebėtų ryšį „noras → jausmas“ ir turėtų vieną veiksmą, kuriuo tą ryšį pasitikrintų: pakeisti norą ir pažiūrėti. Widen ir Russell (2008) rodo, kad 6–7 metų vaiko emocijų žodynas dar platus (vienas žodis dengia kelis jausmus), todėl modulis vartoja tik du žodžius — *patenkintas* ir *nusiminęs* — ir nepretenduoja mokyti viso sąrašo.

**Seka (konkretumas → modelis → simbolis → perkėlimas).**

1. **Kūnas.** Mokytojas įvynioja du vienodus pieštukus į du vienodus popieriaus lapus. Prieš tai du savanoriai pasako, ko norėtų: vienas pieštuko, kitas trintuko. Abu gauna pieštuką. Vaikai pamato vieną juoką ir vieną nusivylimą prie vienodų dovanų. Tikslas: pajusti, kad jausmo nepaaiškina pats daiktas. (Savanoriai — mokytojo pasirinkti; niekas neklausia, kaip jaučiasi visas vaikas, ir niekas nieko neįrašo.)
2. **Ekranas.** Rėjus ir Ieva prie stalo, tarp jų uždara dėžutė. Virš kiekvieno — norų burbulas su daiktu. Vaikas baksteli Rėjaus burbulą ir noras pasikeičia; dovaną atidengia mygtukas „Atidaryk dėžutę“. Tikslas: pamatyti, kad keičiasi vieno veidas, o kito ne.
3. **Simbolis.** Po veidais atsiranda žodžiai „patenkintas“ ir „nusiminęs“, po jais — sakinys „Rėjus norėjo kamuolio. Ieva norėjo knygos.“ Vaikas perskaito ir pasako, kodėl jausmai skirtingi. Tikslas: jausmą įvardyti žodžiu, o priežastį — noru, ne daiktu.
4. **Perkėlimas.** Ta pati taisyklė trijose situacijose be modelio: dovana, filmas, žaidimas. Tikslas: taikyti taisyklę ten, kur noro nesimato ir reikia paklausti.

**Privalomas spėjimo žingsnis prieš pirmą keitimą.** `api.readout`: „Rėjus nori kamuolio. Pakeisi jo norą. Kas pasikeis? Pasakyk, tada keisk.“ Vaikas atsako balsu, tada baksteli. Be spėjimo modelis virsta generatoriumi: vaikas baksto tol, kol pamato įdomų veidą, ir ryšio nesudaro — tas pats pavojus kaip M-01–M-04 (`research/wiki/foundations/sujungti-dydziai.md`). Atsakymo variantų ekrane nėra: kintamasis turi likti vienas.

**Simuliacijos specifikacija.** Komponentas `dovana-ir-noras`, failas `assets/js/sims/gyvenimas.js` (naujas; registruojamas `assets/js/registry.js` viena `import * as gyvenimas from "./sims/gyvenimas.js";` eilute ir `Object.assign({}, …, gyvenimas.SIMS)` sąraše). `config`:

```json
{ "gift": "kamuolys", "other": "knyga",
  "fixed":   { "name": "Ieva", "wants": "knyga" },
  "varying": { "name": "Rėjus", "wants": "kamuolys" },
  "sentences": { "start": "…", "predict": "…", "one": "…", "both": "…", "same": "…" } }
```

| Būsena | Ką rodo | `readout` | `api.note` |
|---|---|---|---|
| pradžia (dėžutė uždaryta, Rėjus nori kamuolio) | du vaikai, du norų burbulai, uždara dėžutė | „Dėžutė uždaryta. Ko nori Rėjus?“ | „Pirma pasakyk, ko nori Rėjus.“ |
| atidaryta, Rėjus nori kamuolio | Rėjus šypsosi, Ieva nusimena, po veidais žodžiai | „Rėjus džiaugiasi. Ieva nusimena.“ | „Rėjus norėjo kamuolio. Ieva norėjo knygos.“ |
| Rėjus nori knygos (dovana ta pati) | abu nusimena; Ievos veidas nepakito | „Dabar abu nusimena.“ | „Pasikeitė tik noras. Dovana liko ta pati.“ |
| grįžta į kamuolį | kaip antra būsena | „Rėjus džiaugiasi. Ieva nusimena.“ | „Noras pasikeitė, pasikeitė ir jausmas.“ |
| abi būsenos matytos (palyginimas) | abu veidai ir abu sakiniai vienu metu | „Viena dovana, du jausmai.“ | „Tas pats kamuolys. Vienas jo norėjo, kitas ne.“ |

- **Vienas kintamasis:** `varying.wants` ∈ {`kamuolys`, `knyga`}. Vaikas keičia tik tai, ko nori Rėjus. `gift` yra fiksuotas konfigūracijoje ir vaiko nekeičiamas; „Atidaryk dėžutę“ yra žingsnis, o ne antra reikšmė. Ievos noras nekinta — jis yra kontrolinė pora, rodanti, kad veidai kinta ne kartu.
- **Išdėstymas 360 px:** dvi veikėjų plokštės po 148 px ir 16 px tarpas = 312 px iš 328 px. Veidas 72 px, norų burbulas 56 × 56 px, dėžutė 96 × 72 px. Trys eilutės: veidai, burbulai, sakiniai; jokio horizontalaus slinkimo.
- **Įėjimai:** norų burbulas — `[role=button]` su `tabindex="0"`, `aria-pressed` ir `aria-label` „Rėjus nori kamuolio. Pakeisk norą.“; „Atidaryk dėžutę“ / „Uždaryk“ 328 × 56 px; „Iš naujo“ ≥ 48 px. Klaviatūra: `Tab` tarp trijų taikinių, `Enter`/`Space` aktyvuoja, `←`/`→` perjungia norą, kai burbulas fokusuotas.
- **Grįžtamasis ryšys** — iškart po veiksmo (≤ 1 kadras). `readout` įvardija būseną, `api.note` — vieną sakinį apie veiksmą. `api.progress({ correct: true })` — vieną kartą, kai **abiem** norais dėžutė atidaryta (t. y. po palyginimo), o ne po pirmo pakeitimo (LL-29).
- **Garsas** — penkios nustatytos frazės, lygiai tokios kaip `readout` lentelėje; jos laikomos `config.sentences`, o ne simuliacijos kode (LL-42), todėl `scripts/generate_audio.py` jas mato. `api.note` garsiai neskaitomas (mažas manifestas). Generuojant reikia abiejų variantų (`n`, `s`).
- **Prieinamumas:** scenos SVG `role="img"`, `aria-label` aprašo, ką rodo kiekvienas vaikas ir ką jis nori, bet nekartoja `readout` sakinio: „Rėjus šypsosi, jo burbule kamuolys. Ieva nusimena, jos burbule knyga. Dėžutėje kamuolys.“ `readout` turi `aria-live="polite"`. Veido išraiška niekada nėra vienintelis informacijos nešėjas: šalia visada yra žodis ir burbulas.
- **Jokių laikmačių, ėjimų limito, „game over“.** Nusivylimas yra informacija, ne bauda; vaikas norą keičia tiek kartų, kiek nori.

**Užduotys.**

| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
|---|---|---|---|---|---|
| 1 | atpažinimas | „Dėžutėje kamuolys. Rėjus norėjo knygos. Kaip jausis Rėjus?“ — Džiaugsis / Nusimins / Nieko nejaus | Nusimins (1) | „Džiaugsis“ — sprendžia iš dovanos, ne iš noro | „Palygink, ko jis norėjo, su tuo, ką rado.“ |
| 2 | taikymas | „Ieva nori knygos, o Jonas nori kamuolio. Močiutė atnešė knygą. Kas džiaugsis?“ — Ieva / Jonas / Abu vaikai | Ieva (0) | „Abu vaikai“ — dovana gera, vadinasi, visiems | „Žiūrėk, ko norėjo kiekvienas vaikas.“ |
| 3 | perkėlimas | „Klasėje rodomas filmas apie šunis. Viena mergaitė turi šunį, kita jo bijo. Ar filmas abiem bus smagus?“ — Ne: vienai smagus, kitai baisus / Taip, visiems bus smagus / Ne, filmas nepatiks nė vienai | Ne: vienai smagus, kitai baisus (0) | „Taip, visiems bus smagus“ — įvykis priskiriamas visiems | „Pagalvok, kaip kiekviena mergaitė žiūri į šunį.“ |
| 4 | praplėtimas (`optional: true`) | „Dėžutėje pieštukai. Vienas vaikas juokiasi, kitas nuliūsta. Ką tai rodo?“ — Jie norėjo skirtingų dovanų / Pieštukai buvo sulaužyti / Vienas vaikas blogesnis | Jie norėjo skirtingų dovanų (0) | „Vienas vaikas blogesnis“ — jausmą paverčia žmogaus vertinimu | „Tas pats daiktas, o jausmai skirtingi. Kodėl?“ |

**Refleksija.** „Kaip sužinotum, ar draugui patiks dovana? Ką darytum?“ Klausiama žodžiu, nevertinama; laukiamas atsakymas — paklausti. Šis klausimas yra ir modelio ribos tąsa: burbulas ekrane parodo norą, o realiame gyvenime noro nesimato.

**Modelio ribos (pasakomos vaikui ir mokytojui).** Modelis žino, ko vaikas nori, nes noras nupieštas burbule; realiame gyvenime taip nebūna — todėl reikia klausti, o ne spėti iš veido. Modelis rodo tik du jausmus (*patenkintas*, *nusiminęs*) ir tik vieną priežastį (noras); tikras jausmas priklauso ir nuo nuovargio, netikėtumo, ankstesnės patirties, o kartais du jausmai būna kartu — to modelis nevaizduoja ir to neslepia. Modelis taip pat nevaizduoja slėpiamo jausmo (kai žmogus šypsosi, nors jam liūdna): tai atskiras komponentas (Pons ir kt., 2004), kuriam reikės atskiro modulio, ir jis 6–7 metais dar tik formuojasi (Harris ir kt., 1986; Saarni, 1979). Todėl teisingas atsakymas modulyje nėra „įvaldymo“ įrodymas, o modelyje parodytas ryšys nėra taisyklė „visada taip“.

**Ką tai reiškia modulio autoriui.** `title` — „Dovana: kodėl vienas džiaugiasi, kitas ne“ (41 simbolis); `subtitle` — „Tas pats daiktas gali nuliūdinti, jei jo nenorėjai“ (50); `minutes` — 9; trys `outcomes`: „Pasakau, ko norėjo veikėjas.“, „Nusakau, kaip jausis žmogus, gavęs ne tai, ko norėjo.“, „Paaiškinu, kodėl ta pati dovana vienam džiugu, kitam ne.“; `concept.title` — „Jausmas priklauso nuo noro“ (26); `concept.big_idea` — „Jausmas priklauso ne vien nuo to, kas nutiko. Jis priklauso ir nuo to, ko žmogus norėjo.“ (88); `concept.steps` — keturi žingsniai iš sekos 1–4; `concept.example` — „Močiutė atnešė šaliką. Vienas anūkas apsidžiaugia, kitas tyliai padeda jį į šalį.“; `teacher.offline` — du vienodi pieštukai dviejuose vienoduose popieriaus lapuose ir du savanoriai, prieš tai pasakę, ko norėtų; po to pokalbis „kodėl vienas džiaugėsi, o kitas ne“; `teacher.misconceptions` — trys nuostatos iš šio skyriaus; `sim` — `{ "component": "dovana-ir-noras", "config": { "gift": "kamuolys", "other": "knyga", "fixed": { "name": "Ieva", "wants": "knyga" }, "varying": { "name": "Rėjus", "wants": "kamuolys" } } }`. Moduliui reikia **naujos krypties** `gyvenimo-igudziai` (`content/lt/grade-01/index.json`: `title` „Gyvenimo įgūdžiai“, `emoji` „💛“, `intro` „Jausmai ir santykiai: nuo savęs prie kito.“) ir įrašo `path.json`; tai kūrėjo darbas, ne metodo dalis. Numeris `01-` laisvas, nes kryptis nauja.

**Šaltiniai.** Pons, F., Harris, P. L., & de Rosnay, M. (2004). Emotion comprehension between 3 and 11 years: Developmental periods and hierarchical organization. *European Journal of Developmental Psychology, 1*(2), 127–152. https://doi.org/10.1080/17405620344000022 · Rieffe, C., Terwogt, M. M., & Cowan, R. (2005). Children's understanding of mental states as causes of emotions. *Infant and Child Development, 14*(3), 259–272. https://doi.org/10.1002/icd.391 · Widen, S. C., & Russell, J. A. (2008). Children acquire emotion categories gradually. *Cognitive Development, 23*(2), 291–312. https://doi.org/10.1016/j.cogdev.2008.01.002 · Saarni, C. (1979). Children's understanding of display rules for expressive behavior. *Developmental Psychology, 15*(4), 424–429. https://doi.org/10.1037/0012-1649.15.4.424 · Harris, P. L., Donnelly, K., Guz, G. R., & Pitt-Watson, R. (1986). Children's understanding of the distinction between real and apparent emotion. *Child Development, 57*(4), 895–909. https://doi.org/10.2307/1130366

### M-05a — Emocijų žodynas: jausmą pasako pats žmogus

**Data:** 2026-11-23 · **Tema:** 1 klasės gyvenimo įgūdžiai, D:emociju-zodynas (`research/wiki/curriculum/backlog.json`; programa — `research/wiki/curriculum/kti-dalykai-1-klase.md:96`) · **Tikslas:** `content/lt/grade-01/gyvenimo-igudziai/02-emociju-zodynas.json` · **Pasiūlymas:** #37590

**Viena didelė idėja.** Toje pačioje vietoje skirtingi vaikai jaučiasi skirtingai, o tikslų jausmo žodį pasako pats žmogus. Veidas ir vieta padeda, bet žodžio neduoda: kol niekas nekalba, jausmo vardo nežinome — lieka tik klausimas.

**Ką sako programa.** Rekomendacijų gyvenimo įgūdžių skyrius remiasi tuo, kad „1 klasėje mokiniai pirmomis dienomis patiria labai stiprias emocijas, kurios daro įtaką elgsenai“ (`sources/pradinio-bp-rekomendacijos-2024.txt:22250`), todėl klasėje rekomenduojamas „Klasės draugas (žaislas)“ (`:22257`). Pasiekimas formuluojamas veiksmais: „**Atpažįsta, įvardija ir valdo emocijas, elgesį**“, potemė — „Emocijų atpažinimas ir žodyno plėtojimas“ / „Patiriamų emocijų atpažinimas ir įvardijimas“, o plėtojamas žodynas įvardytas uždaru sąrašu: „**piktas, baikštus, patenkintas, pakylėtas, susijaudinęs**“ (`:22275–22281`). Pamokos pavyzdys „Mano jausmai dienos metu“ trunka 30 min. (`research/wiki/curriculum/kti-dalykai-1-klase.md:96`, `:150`).

Platforma šios pozicijos neturėjo nė vieno modulio: vienintelis emocijų modulis `01-dovana-ir-noras` sprendė **priežastį** (noras), ne **įvardijimą**. Užduotyje `backlog.json` siūloma forma „Situacija → kuri emocija?“ (`:832`) metodas sąmoningai atmetama — ji pati kurtų nuostatą „vienas įvykis, vienas teisingas jausmas“ (`research/wiki/guidelines/klausimai.md:31`). Modelyje naudojami trys iš penkių programos žodžių — *baikštus*, *piktas*, *pakylėtas* — ir tyla kaip ketvirta būsena. *Patenkintas* jau buvo M-05 modelyje (dovanos atvejis), o *susijaudinęs* sąmoningai paliktas kitam žingsniui: 6–7 metų vaikui jo riba su *pakylėtas* dar plati, o vienu metu du beveik sutampantys žodžiai tik drumstų (Widen ir Russell, 2008). Todėl modulis nepretenduoja išmokyti viso sąrašo — jis parodo, **iš kur** žodis ateina.

**Kodėl tai antras tos pačios temos žingsnis, o ne pakartojimas.** M-05 laiko įvykį (dovaną) pastovų ir keičia norą — taip parodo, nuo ko jausmas priklauso. M-05a laiko pastovią **vietą** (ta pati lenta, tos pačios grindys, ta pati vieta prieš klasę) ir keičia tik tai, kas joje kalba. Pirmas modelis atsako į klausimą „kodėl jis jaučiasi būtent taip?“, antras — „kas žino tikslų to jausmo žodį?“. Abu remiasi ta pačia uždrausta forma: „situacija → viena teisinga emocija“ (`research/wiki/guidelines/klausimai.md:31–32`). M-05a jos nepakartoja, nes toje pačioje situacijoje trys vaikai pasako tris skirtingus žodžius, o ketvirtoje būsenoje žodžio nėra visai.

**Kodėl modelis, o ne paveikslėlis.** Geras paveikslas su trimis vaikais ir trimis burbulais jau turi žodžius — juos galima perskaityti, ir modelis neprideda nieko, ką vaikas galėtų patikrinti. Modelis žodį atskiria nuo vaizdo: jis atsiranda tik tada, kai vaikas pasirenka, kas kalba, o ketvirta būsena („Niekas nekalba“) palieka tą pačią vietą ir tą patį veidą **be žodžio**. Būtent šis trūkumas parodo, kad žodis ateina su žmogumi, o ne su vieta ar veido išraiška. Antras interaktyvumo argumentas — spėjimas prieš veiksmą: be jo modelis virsta vardų sąrašu, kuriame bakstelėjimas nieko nepatikrina.

**Ką rodo tyrimai.**
Widen ir Russell (2008) parodė, kad vaikų emocijų kategorijos siaurėja palaipsniui: mažesnis vaikas vienu žodžiu dengia kelis jausmus ir tik vėliau pradeda skirti, pavyzdžiui, susijaudinimą nuo džiaugsmo. Iš to metodui išeina du reikalavimai: žodžių turi būti nedaug, o žodis turi ateiti **kartu su žmogumi**, o ne būti priskirtas iš šalies pagal veidą.
Pons, Harris ir de Rosnay (2004), ištyrę 100 vaikų nuo 3 iki 11 metų, emocijų supratimą skaidė į devynis komponentus ir parodė tris hierarchinius tarpsnius: vėlesnis remiasi ankstesniu. Ankstyvieji komponentai — jausmo atpažinimas ir išorinė jo priežastis; slepiamas ir mišrus jausmas — vėlesni. Todėl modelyje sąmoningai nėra nei mišrių jausmų, nei „apsimestinės“ šypsenos.
Harris, Donnelly, Guz ir Pitt-Watson (1986) atskyrė tikrą ir rodomą jausmą: 6 metų vaikai šį skirtumą jau pradeda skirti, 4-mečiai — dar ne. Tai pagrindžia ketvirtą būseną ir taisyklę „nespėk iš veido — paklausk“: veidas yra vienas signalas, o ne liudininkas.
NŠA (2024) rekomendacijos rodo, kad pirmokui emocijų tema yra ne abstrakti, o kasdienė: pirmosios dienos pačios kelia stipriausias emocijas (`:22250`).

**Klaidingos nuostatos ir kaip jos paneigiamos.**

1. **„Iš veido visada matau, ką žmogus jaučia.“** Paneigiama ketvirta būsena: veidas ir vieta matomi, o žodžio nėra; `readout` sako „Iš veido ir vietos tikslaus žodžio nežinome.“ Užduotys 1 ir 4 klausia ne „ką jaučia“, o „kaip sužinosi“ ir „kaip paklausti“.
2. **„Ta pati situacija visiems kelia tą patį jausmą.“** Vieta nesikeičia nė karto: ta pati lenta, tos pačios grindys, ta pati vieta prieš klasę. Keičiasi tik tai, kas kalba, ir trys žodžiai skiriasi.
3. **„Jei vaikas sako, kad jam baisu, jis silpnas.“** Jausmo žodis modeliuose pateikiamas kaip informacija, ne kaip vaiko savybė: `api.note` sako „Rūta pasakė savo jausmą, todėl žinome žodį“, o ne „Rūta baikštė“. Tai ir T5.1 reikalavimas — grįžtamasis ryšys apie veiksmą, ne apie vaiką.
4. **„Vienas žodis turi reikšti viską.“** Modelis vartoja tris žodžius ir tylą, o mokytojo bloke pasakyta, kad 6–7 metų žodynas dar platus (Widen ir Russell, 2008). Todėl modulis nemoko „teisingo“ žodžio visam jausmų sąrašui.

**Seka (konkretumas → modelis → simbolis → perkėlimas).**

1. **Klasė be ekrano.** Trys vaikai iš eilės tyliai pasako mokytojui vieną žodį — *baikštus*, *piktas* arba *pakylėtas* — apie tą pačią situaciją (rytoj bus ekskursija). Kiti spėja, o paskui paklausia: „Kaip tu jautiesi?“ Aptariama, kada spėjimas buvo neteisingas ir kad tai normalu. Niekas nieko neįrašo ir nelygina.
2. **Ekranas: ta pati vieta, pasirinkimas, kas kalba.** Vaikas pirmiausia pasirenka spėjimą („Vienodai“ arba „Skirtingai“), tada — vieną iš trijų vaikų arba tylą. Vieta ir lenta nejuda; keičiasi tik tai, kas joje kalba.
3. **Simbolis: žodis sakinyje.** Po pasirinkimo virš scenos pasirodo vaiko sakinys su jausmo žodžiu („Rūta sako: „Bijau, kad visi juoksis.“ Jos jausmas – baikštus.“). Žodis nėra etiketė po veidu — jis yra tai, ką žmogus pasakė.
4. **Tyla.** Ketvirta būsena rodo tą pačią vietą ir neutralų veidą, bet žodžio nėra: „Niekas nieko nesako. Iš veido ir vietos tikslaus žodžio nežinome.“
5. **Perkėlimas.** Trys užduotys be modelio (tyli Emilija, Tomas „išdrįsau“, du vaikai prie filmo) ir praplėtimo klausimas apie tai, kaip draugo paklausti.

**Privalomas spėjimo žingsnis ir jo palyginimas.** Spėjimas yra ne durys, o duomuo (LL-15): vaikas pasirenka „Vienodai“ arba „Skirtingai“, o modelis, išgirdęs **antrą skirtingą** vaiką, pasako rezultatą — „Taip ir yra: jie jaučiasi skirtingai.“ arba „Tu sakei, kad jie jaučiasi vienodai. O jie jaučiasi skirtingai.“ Vienas vaikas palyginimo neįjungia: vienas žodis dar neįrodo, kad kitas jausis kitaip. Pasirinkimas prieš spėjimą nėra tyliai užrakintas (LL-04): vardo mygtukas paaiškina „Pirmiausia pasirink spėjimą. Tada rinkis, kas kalba.“ ir perkelia fokusą į pirmą vardą. Spėjimas niekada nevadinamas klaida ir niekada neištrinamas — jis tik palyginamas.

**Simuliacijos specifikacija.** Komponentas `jausmo-vardas`, failas `assets/js/sims/gyvenimas.js` (tas pats failas kaip M-05; registracija `SIMS` bloke eilute `"jausmo-vardas": jausmoVardas,`). `config`:

```json
{ "silentName": "Niekas nekalba",
  "labels": { "same": "Vienodai", "diff": "Skirtingai" },
  "states": [ { "key": "ruta",  "name": "Rūta",  "face": "fear" },
              { "key": "tomas", "name": "Tomas", "face": "angry" },
              { "key": "ieva",  "name": "Ieva",  "face": "happy" } ],
  "sentences": { "predict": "…", "choose": "…", "right": "…", "wrong": "…",
                 "ruta": "…", "tomas": "…", "ieva": "…", "silent": "…" } }
```

| Būsena | Ką vaikas mato | `readout` | `api.note` / scenos pastaba |
|---|---|---|---|
| pradžia | vienas vaikas prie lentos, neutralus veidas, keturi vardai, du spėjimo mygtukai | „Trys vaikai prieš tą pačią lentą. Ar jie jaučiasi vienodai? Pasirink spėjimą.“ | pastaba paslėpta; palietus vardą — „Pirmiausia pasirink spėjimą. Tada rinkis, kas kalba.“ |
| spėjimas pasirinktas | tas pats vaizdas, vienas spėjimo mygtukas `aria-pressed="true"` | „Dabar rinkis vaikus ir paklausyk, ką jie sako.“ | „Spėjai, kad jie jaučiasi skirtingai.“ (arba „…vienodai.“) |
| Rūta | vaikas su baikštu veidu, virš scenos jos sakinys | „Rūta sako: „Bijau, kad visi juoksis.“ Jos jausmas – baikštus.“ | „Rūta pasakė savo jausmą, todėl žinome žodį.“ |
| Tomas | vaikas piktų antakių, jo sakinys | „Tomas sako: „Noriu, kad jie nustotų!“ Jo jausmas – piktas.“ | „Tomas pasakė savo jausmą, todėl žinome žodį.“ |
| Ieva | vaikas su šypsena, jos sakinys | „Ieva sako: „Aš išdrįsau!“ Jos jausmas – pakylėtas.“ | „Ieva pasakė savo jausmą, todėl žinome žodį.“ |
| antras skirtingas vaikas | tas pats kadras, `readout` tampa palyginimu | „Taip ir yra: jie jaučiasi skirtingai.“ arba „Tu sakei, kad jie jaučiasi vienodai. O jie jaučiasi skirtingai.“ | „Palygink savo spėjimą su tuo, ką pasakė vaikai.“ |
| tyla | neutralus vaikas, jokio žodžio | „Niekas nieko nesako. Iš veido ir vietos tikslaus žodžio nežinome.“ | „Niekas nieko nepasakė, todėl tikslaus žodžio neturime.“ |
| visos keturios būsenos matytos | paskutinė pasirinkta būsena lieka | tas pats sakinys | `api.progress({ correct: true })` — vieną kartą |
| „Iš naujo“ | pradžia | spėjimo klausimas | pastaba paslėpta, spėjimas išvalytas |

Septynios savybės, kurių negalima praleisti:

- **Vienas kintamasis:** kas kalba (`ruta`, `tomas`, `ieva`, `silent`). Lenta, grindys ir vieta prieš klasę nekeičiamos nė karto; kūno spalva tik atskiria vaikus, o ne ką nors reiškia.
- **Geometrija 360 px:** scena `viewBox="0 0 320 210"`, kortelės turinys `max-width:26rem`; viewBox koordinatėmis lenta 136 vnt. pločio, veidas 35,2 vnt. skersmens (spindulys 17,6) — 360 px ekrane šypsena ir antakiai atskiriami (LL-06). Keturi vardai — dvi kolonos po ≥48 px (`min-height:3rem`), trys valdikliai („Vienodai“, „Skirtingai“, „Iš naujo“) telpa į 328 px juostą ir laužiasi į antrą eilutę, o ne išlipa (LL-30).
- **Įėjimai ir klaviatūra:** visi elementai `<button>`; `Tab` per vardus ir valdiklius, `Enter`/`Space` aktyvuoja, `aria-pressed` žymi spėjimą ir pasirinktą vaiką; `#sim-readout` turi `aria-live="polite"`.
- **Fokusas** (LL-32): vardo mygtukai niekada ne `disabled` — prieš spėjimą jie paaiškina ir perkelia fokusą į pirmą vardą, todėl klaviatūros naudotojas nepraranda vietos.
- **Grįžtamasis ryšys:** `readout` įvardija vaiko sakinį arba palyginimą, scenos pastaba sako **kodėl**; `api.progress` — vieną kartą, kai matytos visos keturios būsenos, o ne po pirmo pasirinkimo (LL-29). Spėjimo keitimas išvalo palyginimą ir girdėtus vaikus, bet ne pažangą (LL-16, LL-17).
- **Garsas:** vienas `api.speak` kvietimas vienam pasirinkimui, sakinys imamas iš `config.sentences` kaip visuma; palyginimas lieka ekrane ir garsiai nesakomas, nes `speech.js` turi vieną `<audio>` kanalą ir antras kvietimas nutrauktų vaiko sakinį, o suklijuoto sakinio manifeste nebūtų (LL-145).
- **Be laikmačių, be ėjimų limito, be „game over“.** Tylos būsena ir neteisingas spėjimas niekada nėra baudžiami.

**Užduotys.**

| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
|---|---|---|---|---|---|
| 1 | atpažinimas | „Emilija prieš klasę tyli ir žiūri į grindis. Kaip sužinosi, ką ji jaučia?“ — Kad ji baikštė / Kad ji pikta / Kad tiksliai nežinome, reikia paklausti | 2 | „Kad ji baikštė“ — veidas laikomas žodžiu | „Ar ji pasakė bent vieną žodį apie savo jausmą?“ |
| 2 | taikymas | „Tomas sako: „Man taip gera, kad išdrįsau!“ Kuris žodis tinka?“ — Pakylėtas / Piktas / Baikštus | 0 | „Baikštus“ — viešas kalbėjimas painiojamas su baime | „Ar jis džiaugiasi, ar ko nors bijo?“ |
| 3 | perkėlimas | „Du vaikai žiūri tą patį filmą. Vienas juokiasi, kitas užsidengia akis. Kuris sakinys tinka?“ — Filmas visiems juokingas / Jie jaučiasi skirtingai / Vienas vaikas blogesnis | 1 | „Filmas visiems juokingas“ — situacija priskiriama visiems | „Pažiūrėk, ar abu vaikai daro tą patį.“ |
| 4 | perkėlimas (`optional: true`) | „Draugas sėdi tyliai ir nieko nepasako. Kaip jo paklausti apie jausmą?“ — „Kodėl tu toks piktas?“ / „Kaip tu jautiesi?“ / „Ar tau baikštu?“ | 1 | „Ar tau baikštu?“ — klausimas jau pasako jausmą už kitą | „Kuris klausimas nepasako jausmo už jį?“ |

Atsakymų indeksai 2 / 0 / 1 / 1 — ne visi tame pačiame indekse (`validate_content.py` tikrina pasiskirstymą). Nė viena užuomina nekartoja teisingo varianto žodžių ir nepasako atsakymo.

**Refleksija.** „Kaip pasakytum suaugusiam, ką jauti, kai pats nežinai žodžio?“ Klausiama žodžiu, nevertinama; laukiamas atsakymas — vaikas įvardija būdą (papasakoti situaciją, parodyti, paklausti žodžio), o ne „teisingą“ jausmą. Tai patikrinimas be ekrano ir be balo.

**Modelio ribos (pasakomos vaikui ir mokytojui).**

1. **Vienas kalbantysis vienu metu.** Ekrane rodomas tas vaikas, kuris kalba, toje pačioje vietoje; trys vaikai nėra matomi vienu metu. Todėl palyginimas vyksta per būsenas ir sakinius, o ne per tris figūras.
2. **Trys žodžiai iš penkių.** *Patenkintas* jau buvo M-05, *susijaudinęs* paliktas vėlesniam žingsniui (Widen ir Russell, 2008). Modelis nepretenduoja išmokyti viso programos sąrašo.
3. **Veidas yra supaprastintas.** Jis padeda atskirti vaikus, bet niekada nėra vienintelis informacijos nešėjas: šalia visada yra vaiko sakinys, o ketvirtoje būsenoje žodžio nėra.
4. **Mišrūs ir slepiami jausmai neparodomi.** Tai vėlesni Pons ir kt. (2004) komponentai; modelyje jų nėra, kad tame pačiame kadre neliktų dviejų idėjų (T1.2).
5. **Modelis neklausia vaiko apie jo paties jausmus.** Užduotys ir refleksija kalba apie veikėją arba apie tai, ko paklausti; taip nepatenkama į asmens duomenų sritį ir neišugdoma nuostata, kad yra „teisingas“ jausmas.
6. **Tai ne įgūdžio įrodymas.** Teisingas atsakymas reiškia, kad vaikas atpažino ryšį „žodis ateina su žmogumi“, o ne kad jis visada teisingai įvardys kito jausmą; tikras pokalbis lieka mokytojui.

**Ką tai reiškia modulio autoriui.** Modulis jau įrašytas (paleidimas #457) ir metodas jį dokumentuoja tokį, koks jis yra po šio žingsnio: `id` — `02-emociju-zodynas`; `title` — „Jausmas turi savo vardą“; `subtitle` — „Ta pati situacija, o jausmai skirtingi: žodį pasako pats vaikas“; `minutes` — 9; trys `outcomes` („Įvardiju jausmą vienu iš trijų žodžių: baikštus, piktas, pakylėtas.“, „Paaiškinu, kodėl toje pačioje situacijoje vaikai jaučiasi skirtingai.“, „Pasakau, kad tylaus žmogaus jausmo spėti negalima – jo reikia paklausti.“); `concept.title` — „Jausmą pasako pats žmogus“; `concept.big_idea` — „Trys vaikai toje pačioje vietoje jaučiasi skirtingai. Tikslų jausmo žodį žino pats žmogus, todėl paklausk jo.“; `concept.steps` — keturi žingsniai; `concept.example` — „Brolis grįžo iš varžybų ir nieko nepasakojo. Mama nesprendžia iš veido – ji paklausia: „Kaip tu jautiesi?““; `teacher.offline` — trys vaikai iš eilės tyliai pasako mokytojui po vieną žodį apie tą pačią situaciją, kiti spėja, paskui paklausia; `teacher.misconceptions` — keturios nuostatos iš šio skyriaus; `sim` — `{ "component": "jausmo-vardas", "config": { … } }`. Modulis įrašytas į `content/lt/grade-01/index.json` (gyvenimo įgūdžiai, po `01-dovana-ir-noras`) ir į `path.json` 45 eilutėje. Metodo numeris `M-05a` reiškia tik tai, kad tai antra tos pačios temos pakopa — atskiro modulio jis neprideda.

**Patikra.** Šis žingsnis paleido tuos pačius vartus, kuriuos kartoja CI (tikra išvestis):

```
validate_content.py (visi)          -> 0 klaidų, 0 įspėjimų
check_language.py --grade 1         -> 0 klaidų, 0 įspėjimų (45 pastabos, riba 10 ž.)
check_audio.py                      -> 883 tekstai, 1766/1766 įrašų, visi Piper
check_art.py                        -> 0 klaidų (9 sims naudoja art.js, legacy 1)
check_docs_facts.py                 -> 0 klaidų, „Sutampa su failais“
check_registry.py                   -> 62/62/62/273/62/62, našlaičių 0
check_ui.py                         -> 0 klaidų, 0 įspėjimų
check_lessons.py                    -> 145 įrašai, visi su 4 laukais
curriculum_backlog.py --check       -> suderinta (47 pozicijų, 2 be modulio)
check_view.py --module 02-emociju-zodynas --viewports desktop,phone,small --json
                                    -> checked 3, problems: []
   1440 / 390 / 360: ovf 0, tasks 4/4, small 0, ctl 7, eyebrow 1/1, errors []
check_view.py --text-scale 200 (phone,small) -> scaled_problems: [], unapplied: []
```

Elgsenos zondas 360 px (vietinis serveris, tas pats kodas): prieš spėjimą vardo paspaudimas duoda „Pirmiausia pasirink spėjimą. Tada rinkis, kas kalba.“ ir fokusas lieka pirmame varde; pasirinkus „Skirtingai“ — `readout` „Dabar rinkis vaikus ir paklausyk, ką jie sako.“; po Rūtos — „Rūta sako: „Bijau, kad visi juoksis.“ Jos jausmas – baikštus.“; po Tomo — palyginimas „Taip ir yra: jie jaučiasi skirtingai.“, o burbule lieka Tomo sakinys; su spėjimu „Vienodai“ — „Tu sakei, kad jie jaučiasi vienodai. O jie jaučiasi skirtingai.“; po keturių būsenų `simDone: true`; „Iš naujo“ grąžina pradžią; konsolės klaidų 0.

**Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, gyvenimo įgūdžiai (`sources/pradinio-bp-rekomendacijos-2024.txt:22250`, `:22257`, `:22275–22281`). Widen, S. C., & Russell, J. A. (2008). Children acquire emotion categories gradually. *Cognitive Development, 23*(2), 291–312. https://doi.org/10.1016/j.cogdev.2008.01.002 · Pons, F., Harris, P. L., & de Rosnay, M. (2004). Emotion comprehension between 3 and 11 years: Developmental periods and hierarchical organization. *European Journal of Developmental Psychology, 1*(2), 127–152. https://doi.org/10.1080/17405620344000022 · Harris, P. L., Donnelly, K., Guz, G. R., & Pitt-Watson, R. (1986). Children's understanding of the distinction between real and apparent emotion. *Child Development, 57*(4), 895–909. https://doi.org/10.2307/1130366

### M-06 — Dailė: ta pati forma, kita spalva

**Data:** 2026-11-09 · **Tema:** `agents/proposals/2026-11-08-ideator-dailes-spalva-ir-nuotaika.json` (#6539) · **Tikslas:** `content/lt/grade-01/daile/01-spalva-ir-nuotaika.json` · **Šaltinis:** `research/wiki/foundations/forma-ir-spalva.md`

**Viena didelė idėja.** Forma pasako, *kas* nupiešta. Spalva pasako, *kaip* į tai žiūrima. Toje pačioje formoje kita spalva keičia įspūdį, o piešinys lieka tas pats.

**Kodėl modelis, o ne paveikslėlis.** Du paveikslai greta parodo skirtumą, bet neįrodo, kad formos liko tos pačios: vaikas neturi būdo patikrinti, ar antrame paveiksle kas nors nepajudėjo, ir paprastai sprendžia, kad „nupiešta kitaip“. Modelis laiko geometriją nepajudinamą — keičiamas tik didelės dėmės užpildas — o grįžimas į ankstesnę spalvą parodo lygiai tą patį paveikslą. Tai kontrolinis bandymas, kurio paveikslėlis negali duoti. Be to, modelis reikalauja spėjimo prieš veiksmą, ko paveikslėlis taip pat nereikalauja.

**Kodėl abstrakti dėmė, o ne peizažas.** Peizaže spalva turi antrą reikšmę: ji žymi metų laiką ar paros laiką (tai jau `08-metu-laikai` sąvoka), o saulė ar medis kviečia sakyti „saulė negali būti mėlyna“ — tada pokalbis pasisuka apie daiktą, o ne apie spalvą kaip priemonę. Dėmė neturi pavadinimo, todėl vienintelis klausimas lieka toks, koks turi būti. Tai ir programos turinys: 1 klasei skirtas ciklas „Kaip susikūrė pasaulis“ prašo „tyrinėti ir apibūdinti skirtingas spalvų ir dėmių sukuriamas nuotaikas, ritmą“ (`sources/pradinio-bp-rekomendacijos-2024.txt:2717–2718`), o ne atpažinti daiktus.

**Klaidingos nuostatos ir kaip jos paneigiamos.**

1. **„Spalva yra daikto pavadinimas“** (geltona = saulė, žalia = lapas). Ši nuostata ne išgalvota: suaugusiųjų spalvų vertinimai paaiškinami tuo, su kokiais daiktais spalva siejama (Palmer ir Schloss, 2010), o 3–4 metų vaikai jau randa pastovius spalvos ir jausmo ryšius (Zentner, 2001). Paneigiama modeliu: ta pati dėmė nudažoma kita spalva ir lieka ta pačia dėme — jos vieta, dydis ir kraštas nepakinta. Spalva čia pasirenkama, o ne atpažįstama.
2. **„Jei paveikslas atrodo kitaip, jis ir nupieštas kitaip.“** Vaikas sujungia suvokimo pokytį su piešinio pokyčiu, nes kasdienėje patirtyje abu dažniausiai kinta kartu. Paneigiama mechaniškai: forma neperpiešiama, keičiamas tik `fill`, o grįžimas į pirmą spalvą grąžina lygiai tą patį vaizdą. Skirtumo šaltinis tampa matomas todėl, kad jį galima panaikinti ir vėl sukelti.
3. **„Spalva tik puošia, prasmę neša forma“** (įprasta darželio taisyklė „spalvink gražiai“). Paneigiama tuo pačiu veiksmu iš kitos pusės: pasikeitus tik užpildams, pasikeičia tai, ką vaikas apie paveikslą pasako, nors nė viena linija nepajudėjo. Jei spalva būtų tik puošmena, pasakojimas nepasikeistų.
4. **„Yra viena teisinga nuotaika.“** Modelis šios nuostatos nepaneigia, o jos neleidžia atsirasti: užduotys klausia, kas pasikeitė (forma ar spalva), o ne ką jausti; jausmo žodį vaikas pasako refleksijoje ir jis neverinamas.

**Seka (konkretumas → modelis → simbolis → perkėlimas).**

1. **Du lapai, viena dėmė.** Mokytojas duoda du vienodus lapus, kuriuose ta pati didelė dėmė nupiešta pieštuku. Vaikas vieną nudažo šiltai (geltona, raudona), kitą vėsiai (žalia, mėlyna) ir padeda greta. Tikslas: pajusti, kad piešinys nepakito, o įspūdis pasikeitė. Mokytojas neklausia, kuris gražesnis, ir nevertina.
2. **Ekranas, viena dėmė.** Ta pati kompozicija: didelė dėmė, maža dėmė ir plona linija. Vaikas spaudžia vieną iš keturių dažų; keičiasi tik didelės dėmės užpildas. Tikslas: pamatyti pasekmę be perpiešimo — akimirksniu ir be animacijos įžangos.
3. **Grįžimas.** Vaikas grąžina pirmą spalvą ir pamato, kad paveikslas atrodo lygiai taip pat kaip pradžioje. Tikslas: atlikti kontrolinį bandymą savo ranka. Be šio žingsnio modelis tinka tik žiūrėjimui, o su juo — įrodymui.
4. **Simbolis.** Po kompozicija atsiranda dvi eilutės: „FORMA“ su tomis pačiomis trimis formomis, nubrėžtomis plonomis linijomis be užpildo, ir „SPALVA“ su dabartinio dažo kvadratėliu. Vaikas pasako: „Forma ta pati, spalva kita.“ Tikslas: du dalykus įvardyti atskirai. Tai vienintelis žymėjimas, kurio reikia 1 klasei — jokių spalvų ratų, jokių terminų.
5. **Perkėlimas.** Ta pati taisyklė be modelio: du vienodi kartoniniai apskritimai, nudažyti skirtingai (ar tai ta pati forma?); du to paties piešinio atvirukai skirtingomis spalvomis; nespalvota to paties piešinio kopija. Tikslas: atpažinti, kad formos tapatybė išlieka be spalvos.

**Privalomas spėjimo žingsnis prieš pirmą dažą.** `api.readout`: „Kas pasikeis: formos ar nuotaika? Pasakyk, tada keisk.“ Kol vaikas nepaspaudė „Sakau“, dažų juosta neaktyvi. Be spėjimo modelis virsta dažymu: vaikas spaudo dažus tol, kol atrodo įdomiai, ir ryšio nesudaro — tas pats pavojus kaip M-01–M-05 (`foundations/sujungti-dydziai.md`). Atsakymo variantų ekrane nėra: kintamasis lieka vienas, o spėjimas tikrinamas žodžiu ir užduotyse be modelio.

**Simuliacijos specifikacija.** Komponentas `deme-ir-spalvos`, failas `assets/js/sims/daile.js` (naujas). Registracija `assets/js/registry.js`: viena eilutė `import * as daile from "./sims/daile.js";` ir `Object.assign({}, …, daile.SIMS)` sąraše. `config`:

```json
{ "colors": [
    { "id": "geltona", "name": "Geltona", "hex": "#f2c33c" },
    { "id": "raudona", "name": "Raudona", "hex": "#d9534f" },
    { "id": "zalia",   "name": "Žalia",   "hex": "#57a05a" },
    { "id": "melyna",  "name": "Mėlyna",  "hex": "#4a7fbf" } ],
  "start": "geltona",
  "sentences": { "...": "devynios frazės iš lentelės žemiau" } }
```

| Būsena | Ką rodo | `readout` | `api.note` |
|---|---|---|---|
| pradžia, kol nepasakyta | didelė dėmė geltona, maža dėmė ir linija tamsios, dažų juosta neaktyvi | „Kas pasikeis: formos ar nuotaika? Pasakyk, tada keisk.“ | „Pirma pasakyk, tada rinkis spalvą.“ |
| geltona | didelė dėmė geltona | „Geltona dėmė. Formos tos pačios.“ | „Pasikeitė tik užpildas.“ |
| raudona | didelė dėmė raudona | „Raudona dėmė. Formos tos pačios.“ | „Ta pati vieta, ta pati forma.“ |
| žalia | didelė dėmė žalia | „Žalia dėmė. Formos tos pačios.“ | „Dėmė liko savo vietoje.“ |
| mėlyna | didelė dėmė mėlyna | „Mėlyna dėmė. Formos tos pačios.“ | „Pasikeitė spalva, ne piešinys.“ |
| grįžimas į jau matytą spalvą | ta pati būsena kaip anksčiau, taškas į tašką | „Vėl geltona. Paveikslas toks pat.“ | „Forma nepakito nė vienu tašku.“ |
| palyginimas (pamatytos ≥ 2 spalvos) | tos pačios formos | „Dvi spalvos. Viena forma.“ | „Pasikeitė įspūdis, o ne piešinys.“ |

- **Vienas kintamasis:** `didelesDemesSpalva` ∈ keturi dažai. Mažos dėmės ir linijos spalva fiksuota (`#3a342b`), jų padėtis ir dydis — konfigūracijoje. Daugiau vaikas nieko nekeičia: nėra slankiklio, dydžio, „naujo piešinio“ mygtuko. Trys formos ir keturi dažai yra mažiausias rinkinys, kuriame matosi ir šiltos, ir vėsios spalvos pora.
- **Geometrija užrakinta mechaniškai.** Kompozicija į sceną įterpiama vieną kartą `mount()` metu, o keičiant spalvą keičiamas tik `fill` atributas (pvz., `stage.querySelector("#deme-didele").setAttribute("fill", c.hex)`). Jokio `innerHTML` perpiešimo, jokio `transform`. **Patikra, kurią turi atlikti inžinierius:** kiekvienos formos `getBBox()` prieš ir po visų keturių spalvų yra vienodas (x, y, width, height lygūs iki paskutinio skaitmens), o `data-color` keičiasi. Tai ne estetikos reikalavimas — tai modelio teiginio sąlyga: jei geometrija bent kartą persibraižo, sakinys „formos nepasikeitė“ tampa neteisingas.
- **Nauja `art.js` dalis.** `spot(x, y, w, h, color, kind)` — netaisyklinga dėmė: `path` iš aštuonių taškų su `Q` kreivėmis, todėl kraštas banguotas (elipsė netinka: lygus ovalas atrodo kaip kamuolys, o ne dėmė — LL-13). `kind`: `apvali` | `kampuota`; `fill` iš argumento. Dėmė piešiama vieną kartą, o spalva keičiama per `fill`, kaip aprašyta aukščiau.
- **Išdėstymas 360 px:** scena 328 × 250 px (`viewBox="0 0 328 250"`, `width:100%`, `max-width:328px`). Didelė dėmė 168 × 132 px, maža dėmė 44 px, linija 148 × 8 px. Dažų juosta: 4 × 64 px + 3 × 12 px tarpų = 292 px iš 328 px, aukštis 56 px. Jokio horizontalaus slinkimo.
- **Įėjimai:** keturi dažų mygtukai 64 × 56 px, kiekvienas su matomu žodžiu po kvadratėliu ir `aria-label` („Geltona spalva“), `aria-pressed`; „Sakau“ 328 × 56 px; „Iš naujo“ ≥ 48 px. Klaviatūra: `Tab` tarp dažų, `Enter`/`Space` pasirenka, `←`/`→` perjungia fokusą, `R` atstato pradžią.
- **Grįžtamasis ryšys** — iškart po paspaudimo (≤ 1 kadras), be perėjimo ir be garso įžangos. `readout` įvardija spalvą ir tai, kad formos liko; `api.note` pasako vieną sakinį apie veiksmą, niekada apie vaiką. `api.progress({ correct: true })` — vieną kartą, kai pamatytos bent dvi skirtingos spalvos **ir** grįžta į bent vieną jau matytą (t. y. po palyginimo), o ne po pirmo dažo (LL-29). „Iš naujo“ pažangos netrina (LL-16).
- **Garsas** — devynios nustatytos frazės, lygiai kaip lentelėje; jos laikomos `config.sentences`, o ne simuliacijos kode (LL-42), todėl `scripts/generate_audio.py` jas mato. `api.note` garsiai neskaitomas (mažas manifestas). Generuojant reikia abiejų variantų (`n`, `s`).
- **Spalva nėra vienintelis informacijos nešėjas:** po kiekvienu dažu parašytas jo pavadinimas, `readout` jį pasako, būsena dar žymima `aria-pressed`, o formos atpažįstamos iš kontūro. Daltonikui modelis lieka suprantamas kaip „ta pati forma, kiti dažai“, tačiau patiriamas skirtumas mažesnis — tai pasakoma mokytojo bloke, o ne slepiama.
- **Scenos `aria-label`** (atnaujinamas po kiekvieno pasirinkimo): „Didelė dėmė geltona, maža dėmė ir linija tamsios. Dėmės vieta nepakito.“ Nekartoja `readout` sakinio žodis į žodį.
- **Jokių laikmačių, ėjimų limito, „game over“.** Grįžimas prie ankstesnės spalvos niekada nelaikomas klaida; dažą galima keisti tiek kartų, kiek nori.

**Užduotys.**

| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
|---|---|---|---|---|---|
| 1 | atpažinimas | „Tas pats piešinys nudažytas geltonai ir mėlynai. Kas pasikeitė?“ — Tik formos / Tik spalva / Ir formos, ir spalva | Tik spalva (1) | trečias — „ir formos“: pasikeitus įspūdžiui vaikui atrodo, kad pasikeitė ir piešinys | „Palygink, ar dėmė liko toje pačioje vietoje.“ |
| 2 | taikymas | „Dailininkas nori to paties piešinio kitokios nuotaikos. Ką keisti?“ — Formas / Piešti iš naujo / Spalvas | Spalvas (2) | antras — „piešti iš naujo“: nuotaikos pokytis painiojamas su nauju darbu | „Nuotaiką keičia dažai, o ne piešinio formos.“ |
| 3 | perkėlimas | „Du viršeliai turi tą patį piešinį. Spalvos skiriasi. Ar piešinys tas pats?“ — Taip, piešinys tas pats / Ne, piešinys naujas / Ne, piešinys nebeatpažįstamas | Taip (0) | antras — nauja spalva priimama kaip naujas piešinys | „Žiūrėk į linijas ir dėmių formą, ne į spalvą.“ |
| 4 | praplėtimas (`optional: true`) | „Tas pats piešinys nuskanuotas nespalvotai. Ar jį dar atpažinsi?“ — Ne, be spalvų nieko nematysi / Taip, formos liko tos pačios / Ne, tai jau kitas piešinys | Taip (1) | pirmas — spalva laikoma vienintele atpažinimo priemone | „Kas piešinyje lieka, kai spalvos dingsta?“ |

**Refleksija.** „Kuris paveikslas tau atrodė niūriau? Ką pakeitei, kad jis toks pasidarytų?“ Klausiama žodžiu, nevertinama; teisingo atsakymo nėra, o laukiamas atsakymas — kad pasikeitė spalva, o ne piešinys.

**Modelio ribos (pasakomos vaikui ir mokytojui).** Modelis keičia vieną savybę — didelės dėmės spalvą — ir nevaizduoja nei potėpio, nei dėmės dydžio, nei ritmo, nors programa šalia nuotaikos mini ir ritmą; ritmas lieka mokytojo veiklai. Modelis neparodo, ką vaikas jaučia: žodžius jis pasako pats. Spalvos ir jausmo ryšys yra iš dalies kultūrinis ir išmoktas (Palmer ir Schloss, 2010; Zentner, 2001), todėl modulis nemoko „mėlyna = liūdna“ — jis moko, kad spalva keičia įspūdį ir kad forma nuo to nepakinta. Nespalvotame spaudinyje piešinys netenka spalvos, bet ne formos: todėl praplėtimo užduotis klausia būtent apie tai. Dėmė nėra joks daiktas: jei vaikas ją pavadina „saulute“, mokytojas atsako „tai dėmė“, o ne „ne, saulė geltona“ — taip spalva nepatampa daikto etikete.

**Ką tai reiškia modulio autoriui.** Nauja kryptis `daile` (`content/lt/grade-01/index.json`: `id` `"daile"`, `title` „Dailė“, `emoji` „🎨“, `intro` „Forma, spalva ir nuotaika: žiūrėk, keisk, palygink.“) — būtent ASCII `daile`, nes `agents/scope.py` `STRAND_SUBJECT` turi raktus `"dailė"` ir `"daile"`. `title` — „Dailė: ta pati forma, kita spalva“ (33 simboliai); `subtitle` — „Toje pačioje formoje kitos spalvos keičia nuotaiką“ (50); `minutes` — 9; trys `outcomes`: „Pasakau, kas piešinyje yra forma, o kas spalva.“, „Pakeičiu spalvą ir nusakau, kaip pasikeitė įspūdis.“, „Paaiškinu, kodėl forma liko ta pati.“; `concept.title` — „Spalva keičia nuotaiką“ (22); `concept.big_idea` — „Ta pati forma gali atrodyti linksmai arba niūriai. Įspūdį keičia spalva, o ne naujas piešinys.“ (94); `concept.steps` — keturi žingsniai iš sekos 2–5; `concept.example` — „Tas pats atvirukas išspausdintas du kartus. Viename dėmė geltona, kitame mėlyna. Piešinys tas pats, įspūdis kitas.“; `teacher.offline` — du lapai su ta pačia pieštuku nupiešta dėme, vienas dažomas šiltai, kitas vėsiai, paskui du vienodi kartoniniai apskritimai; `teacher.misconceptions` — trys nuostatos iš šio skyriaus (1–3), o ketvirtoji („yra teisinga nuotaika“) įrašoma kaip modelio riba, ne kaip klaida; `sim` — `{ "component": "deme-ir-spalvos", "config": { … } }`. Numeris `01-` laisvas, nes kryptis nauja. Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/index.json` ir `path.json` (kūrėjo ar dizainerio darbas, ne metodo dalis); siūloma vieta kelyje — tarp `09-augalo-gyvenimas` ir `06-figuros`: vaikas jau matė formas gamtoje, tada atskiria formą nuo spalvos, o geometrija jau įvardija pačias formas („forma lieka ta pati, kad ir kaip ją pasuktum“).

**Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, „Dailė“: 1–2 klasių amžiaus ypatumai (`sources/pradinio-bp-rekomendacijos-2024.txt:2622–2625`) ir 2 pavyzdys 1 klasei „Kaip susikūrė pasaulis“ (`:2714–2719`). `research/wiki/curriculum/kti-dalykai-1-klase.md` — dailės pasiekimų sritys (`:13`) ir oficialus 1 klasės ciklas (`:22`). Burkitt, E., Barrett, M., & Davis, A. (2003). Children's colour choices for completing drawings of affectively characterised topics. *Journal of Child Psychology and Psychiatry, 44*(3), 445–455. https://doi.org/10.1111/1469-7610.00134 · Zentner, M. R. (2001). Preferences for colours and colour–emotion combinations in early childhood. *Developmental Science, 4*(4), 389–398. https://doi.org/10.1111/1467-7687.00180 · Palmer, S. E., & Schloss, K. B. (2010). An ecological valence theory of human color preference. *PNAS, 107*(19), 8877–8882. https://doi.org/10.1073/pnas.0906172107

### M-07 — Ilgis: tas pats daiktas, kitas vienetas — kitas skaičius

**Data:** 2026-11-10 · **Tema:** `agents/proposals/2026-11-10-ideator-ilgis-ir-vienetas.json` (#10854) · **Tikslas:** `content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json` · **Šaltinis:** `research/wiki/foundations/vienetas-ir-skaičius.md`

**Viena didelė idėja.** Ilgis yra vienetų skaičius. Tas pats daiktas, matuojamas skirtingais vienetais, gauna skirtingus skaičius, o jo ilgis nepakinta. Todėl skaičius pasako ilgį tik tada, kai pasakytas ir vienetas.

**Kodėl modelis, o ne paveikslėlis.** Paveikslėlyje matomas vienas matavimas: lenta ir, tarkime, šešios sąvaržėlės. Iš jo vaikas negali sužinoti, kad toje pačioje lentoje telpa ir dvi pieštukų — o būtent tai ir yra sąvoka. Du paveikslai greta parodytų du skaičius, bet neįrodytų, kad lenta ta pati: vaikas neturi būdo patikrinti, ar antrame paveiksle lenta nepasikeitė. Modelis laiko lentą vienoje vietoje (jos stačiakampis įterpiamas vieną kartą ir nejuda), o vaikas keičia tik vienetą ir grįžta prie jau matyto — todėl lenta lieka ta pati mechaniškai, o ne iš teksto. Grįžimas į ankstesnį vienetą grąžina lygiai tą patį vaizdą: tai kontrolinis bandymas, kurio paveikslėlis negali duoti.

**Kodėl būtent vienetas, o ne liniuotė.** Programa 1 klasei ilgiui skiria 5 pamokas ir integruotą veiklą „Kokio ilgio mano kuprinėje esantys daiktai?“, kurios tikslas — „mokytis formuluoti matematinius klausimus ir į juos atsakyti pagal gautus matavimo rezultatus“ (`sources/pradinio-bp-rekomendacijos-2024.txt:17300–17301, 17325–17326`). Bendras programos posūkis — nuo skaičiavimų prie „mato jausmo“ ir metodo „spėti ir tikrinti“ (`:1010–1014`). Standartiniai vienetai (cm, mm) ir jų sąryšiai programoje priskirti antrai klasei (`:1015–1017`), todėl modelyje jų nėra: liko sąlyginiai vienetai ir viena taisyklė. Tai ir T1.2 — viena nauja sąvoka, o ne matavimo priemonių apžvalga.

**Ką rodo tyrimai.** Carpenter ir Lewis (1976), plėsdami ankstesnį Carpenter (1975) tyrimą, rašo: kai vaikai matavo lygius kiekius skirtingo dydžio vienetais, **daugiau kaip pusė** tiriamųjų tvirtino, kad didesnis vienetų skaičius reiškia didesnį kiekį — nors prieš matuodami buvo matę, kad kiekiai lygūs. Autoriai tai aiškina kaip konservavimo uždavinio atmainą: vaikas susitelkia į vieną dominuojantį matmenį (skaičių) ir nemato kompensuojančio ryšio tarp vieneto dydžio ir vienetų skaičiaus. Būtent šis ryšys ir yra modelio šerdis.

Sarama, Clements, Barrett, van Dine ir McDonel (2011) patikrino ir patikslino ilgio matavimo mokymosi trajektoriją; vėlesniame tos pačios grupės darbe aprašytas trečias lygis — *Length Unit Relater and Repeater*: vaikas matuoja kartodamas vieną vienetą, supranta, kad vienetai turi būti vienodo ilgio, ir **sąsają tarp vieneto dydžio ir vienetų skaičiaus (atvirkštinį ryšį)**. Antras lygis (*End-to-End*) dar gali neatpažinti vienodų vienetų reikalingumo. 1 klasės vaikai būna abiejuose lygiuose, todėl modulis nepretenduoja „įveikti“ trajektorijos — jis duoda vieną patirtį, kurioje atvirkštinis ryšys matomas, o ne pasakomas.

Hiebert (1981) parodė, kad ilgio konservavimas ir tranzityvumas reikalingi kai kuriems matavimo supratimams, bet poveikis priklauso nuo užduoties, o ne nuo bendro pasirengimo. Todėl modelis nereikalauja, kad vaikas mintyse lygintų du skirtingus daiktus: jis rodo **tą patį** daiktą du kartus, o palyginimas vyksta ekrane, ne atmintyje.

**Klaidingos nuostatos ir kaip jos paneigiamos.**

1. **„Daugiau vienetų reiškia ilgesnį daiktą.“** Tai pagrindinė nuostata, kurią fiksuoja Carpenter ir Lewis (1976): skaičius yra vienintelis matomas matmuo, o vieneto dydis — ne. Paneigiama modeliu: lenta nejuda, jos dešinysis galas pažymėtas ta pačia brūkšniuota linija, o prie jos parašoma 6 sąvaržėlės, paskui 4 trintukai, paskui 2 pieštukai. Trys skaičiai, vienas galas. Jei skaičius reikštų ilgį, lenta turėtų pailgėti tris kartus — to neįvyksta.
2. **„Skaičius vienas pasako ilgį.“** Vaikas, paklaustas „kiek ilgio?“, atsako „6“. Paneigiama tuo, kad ta pati lenta turi ir 6, ir 2, ir 4: skaičius be vieneto negali atskirti net to paties daikto matavimų. Todėl modelis niekada nerodo nuogo skaičiaus — kiekviena eilutė yra „6 sąvaržėlės“, o įrašų juostoje trys matavimai stovi greta.
3. **„Mažesnis vienetas duoda mažesnį skaičių.“** Priešinga klaida, kuri išlenda perkėlimo užduotyse (anūko pėdos). Paneigiama tvarka: sąvaržėlė (mažiausia) duoda 6, trintukas — 4, pieštukas (didžiausias) — 2. Trys žingsniai ta pačia kryptimi, todėl taisyklė matoma, o ne įsimenama.
4. **„Vienetus galima maišyti.“** Modelis šios nuostatos nepaneigia, o neleidžia jai atsirasti: matuojama tik vieno rūšies vienetais, o maišymas aptariamas mokytojo veikloje. Tai pasakyta modelio ribose, o ne nutylėta.

**Seka (konkretumas → modelis → simbolis → perkėlimas).**

1. **Dvi juostos, skirtingi vienetai.** Mokytojas duoda dvi vienodo ilgio popieriaus juostas ir dviem vaikams — skirtingas matavimo priemones: vienam trintuką, kitam pieštuką. Abu matuoja **tą pačią** juostą ir pasako skaičių su vienetu („4 trintukai“, „2 pieštukai“). Tikslas: pajusti, kad tas pats daiktas davė skirtingus skaičius, o juostos nepakeitė. Mokytojas neklausia, kuris teisus.
2. **Ekranas, pirmas matavimas.** Lenta su brūkšniuotu galu. Vaikas pirma spėja, kiek sąvaržėlių tilps (6 / 4 / 8), tada deda jas po vieną mygtuku „Dėk vieną“. Kiekviena sąvaržėlė atsiranda prie ankstesnės, be tarpų, o skaitiklis rodo „3 sąvaržėlės“. Tikslas: pamatyti, kad matavimas yra **kartojimas**, o skaičius — padėtų vienetų skaičius.
3. **Ekranas, kitas vienetas.** Vaikas pasirenka trintuką. Modelis paklausia: „Trintukas ilgesnis už sąvaržėlę. Ar trintukų bus daugiau, ar mažiau?“ Vaikas paspaudžia „Daugiau“ arba „Mažiau“, tada matuoja. Tikslas: įsipareigoti spėjimui, kol modelis jo neatliko už jį, ir pamatyti, ar spėjimas pasitvirtino.
4. **Simbolis.** Po trečio matavimo po lenta atsiranda įrašų juosta: „6 sąvaržėlės · 4 trintukai · 2 pieštukai — tas pats ilgis“. Vaikas perskaito ir pasako, kodėl skaičiai skiriasi. Tikslas: skaičių sieti su vienetu žodžiu, o ne vien matyti.
5. **Perkėlimas.** Ta pati taisyklė be modelio: močiutės ir anūko pėdos toje pačioje kilime; du vaikai, gavę 3 ir 9 matuodami tą patį suolą; kuprinės daiktai, išmatuoti sąvaržėlėmis ir pieštukais (programos integruota veikla). Tikslas: atpažinti, kad skirtingi skaičiai gali reikšti tą patį ilgį.

**Privalomas spėjimo žingsnis prieš pirmą matavimą ir prieš antrą vienetą.** Du spėjimai, abu palyginami su įvykiu (LL-15). Pirmasis — skaičius iš trijų variantų (6 / 4 / 8; teisingas variantas sąmoningai ne viduryje), ir po matavimo modelis pasako: „Tu sakei 8. Tilpo 6.“ Antrasis — kryptis („daugiau“ / „mažiau“), ir po matavimo: „Tu sakei daugiau, o gavosi mažiau: 4.“ Spėjimas niekada nėra vadinamas klaida ir niekada neištrinamas; jis tik palyginamas. Be jo modelis virsta demonstracija: vaikas spaudžia „Dėk vieną“ tol, kol lenta baigiasi, ir atvirkštinio ryšio nesudaro — tas pats pavojus kaip M-01–M-06 (`foundations/sujungti-dydziai.md`).

**Simuliacijos specifikacija.** Komponentas `ilgis-ir-vienetas`, failas `assets/js/sims/matematika.js` (registracija nereikia keisti — `registry.js` jau importuoja `matematika.js`). `config`:

```json
{ "board": { "name": "lenta", "px": 240 },
  "units": [
    { "id": "savarzele", "name": "sąvaržėlė", "sg": "sąvaržėlė", "pl": "sąvaržėlės", "px": 40 },
    { "id": "trintukas", "name": "trintukas", "sg": "trintukas", "pl": "trintukai", "px": 60 },
    { "id": "piestukas", "name": "pieštukas", "sg": "pieštukas", "pl": "pieštukai", "px": 120 } ],
  "start": "savarzele",
  "firstGuess": [6, 4, 8],
  "sentences": { "start": "…", "place": "…", "full": "…", "ask": "…",
                 "more": "…", "less": "…", "same": "…", "back": "…", "all": "…",
                 "counts": { "savarzele": ["Viena sąvaržėlė", "…"], "trintukas": ["…"], "piestukas": ["…"] } } }
```

Skaičius visada išvedamas, ne įrašytas: `kiekis = board.px / unit.px` (240/40 = 6, 240/60 = 4, 240/120 = 2). Jei dalyba ne sveikoji, komponentas meta klaidą į `console` ir rodo „Vienetai nesuderinti su lenta.“ — tylus apvalinimas būtų neteisingas modelis.

| Būsena | Ką vaikas mato | `readout` | `api.note` |
|---|---|---|---|
| pradžia | tuščia lenta, brūkšniuotas galas, trys skaičiai 6 / 4 / 8, vienetų mygtukai neaktyvūs | „Kiek sąvaržėlių telpa ant lentos? Pasirink skaičių.“ | „Pirma spėk, tada matuok.“ |
| spėjimas 8 | tas pats, spėjimas pažymėtas, mygtukai aktyvūs | „Tu sakei 8. Dabar matuok.“ | „Dėk sąvaržėles vieną po kitos.“ |
| matuojama, k = 1–5 | k sąvaržėlių prie kairiojo galo, skaitiklis „k sąvaržėlės“ | „Ant lentos 3 sąvaržėlės.“ | „Dėk toliau, kol lenta baigsis.“ |
| sąvaržėlė pilna (6) | 6 vienetai lygiai iki brūkšniuoto galo | „Lenta baigėsi. 6 sąvaržėlės.“ | „Tu sakei 8. Tilpo 6.“ |
| perjungimas į trintuką | tuščia lenta, du mygtukai „Daugiau“ / „Mažiau“ | „Trintukas ilgesnis už sąvaržėlę. Ar trintukų bus daugiau, ar mažiau?“ | „Pasakyk, tada matuok.“ |
| trintukas pilnas (4) | 4 vienetai iki to paties galo | „Lenta baigėsi. 4 trintukai.“ | „Tu sakei mažiau. Gavosi mažiau: 4.“ (arba „Tu sakei daugiau, o gavosi mažiau: 4.“) |
| pieštukas pilnas (2) | 2 vienetai iki to paties galo | „Lenta baigėsi. 2 pieštukai.“ | „Dar mažiau. Tas pats ilgis.“ |
| grįžimas į jau matuotą vienetą | ta pati būsena kaip anksčiau, taškas į tašką | „Vėl 6 sąvaržėlės. Lenta ta pati.“ | „Skaičius grįžo, lenta nepakito.“ |
| visi trys išmatuoti | įrašų juosta „6 sąvaržėlės · 4 trintukai · 2 pieštukai — tas pats ilgis“ | „Trys skaičiai, viena lenta.“ | „Skaičius kitas, ilgis tas pats.“ |

- **Vienas kintamasis:** `unitId` ∈ {`savarzele`, `trintukas`, `piestukas`}. Vaikas keičia tik vienetą. Lenta, jos ilgis, brūkšniuotas galas ir vienetų dydžiai yra konfigūracijoje ir vaiko nekeičiami. Spėjimas ir „Dėk vieną“ yra matavimo veiksmas, o ne antras kintamasis.
- **Lentos geometrija užrakinta mechaniškai.** `art.plank(44, 148, 240, 22)` įterpiamas vieną kartą `mount()` metu; keičiant vienetą keičiasi tik vienetų sluoksnis (`<g id="iv-tokens">`), o lentos `getBBox()` prieš ir po visų trijų vienetų yra vienodas (x, y, width, height iki paskutinio skaitmens). Tai ne estetikos reikalavimas: jei lenta bent kartą persibraižo, sakinys „lenta ta pati“ tampa neteisingas.
- **Skaičius niekada ne vienas.** Skaitiklis, `readout` ir įrašų juosta visada rašo skaičių su vienetu („3 sąvaržėlės“, ne „3“). Formos: 1 → `sg`, 2–6 → `pl`; funkcija `ltForm(n)` grąžina formą pagal paskutinį skaitmenį (10–20 — daugiskaitos kilmininkas, bet modelyje tokių skaičių nepasitaiko).
- **Išdėstymas 360 px:** scena `viewBox="0 0 328 160"`, `width:100%`, `max-width:328px`. Lenta x 44–284 (240 px), vienetų eilutė ta pačia pradžia, aukštis 24 px; brūkšniuotas galas x = 284 nuo y = 88 iki 152. Vienetai: 40 / 60 / 120 px — 6 × 40 = 4 × 60 = 2 × 120 = 240. Vienetų juosta valdikliuose: trys mygtukai po 72 × 56 px + 2 × 8 px tarpai = 232 px iš 328 px. Jokio horizontalaus slinkimo.
- **Vienetų piešinys:** kiekvienas vienetas — savo pločio žetonas (24 px aukščio) su atpažįstamu ženklu: sąvaržėlė — dviguba U formos linija, trintukas — stačiakampis su šviesia juosta viename gale, pieštukas — juosta su smailiu galu ir tamsiu švinu. Tai schematiški ženklai, ne tikro dydžio piešiniai (žr. modelio ribas), bet jie skiriasi **forma**, ne vien spalva. Scenoje nėra dangaus, žemės ar lapų, todėl `art.js` dalys nenaudojamos, išskyrus lentai skirtą `art.plank()`.
- **Įėjimai:** trys vienetų mygtukai 72 × 56 px su matomu pavadinimu ir `aria-label` („Matuoti sąvaržėlėmis“), `aria-pressed`; „Dėk vieną“ 100 % × 56 px; spėjimo mygtukai 6 / 4 / 8 ir „Daugiau“ / „Mažiau“ po 96 × 56 px; „Iš naujo“ ≥ 96 × 48 px. Klaviatūra: `Tab` tarp taikinių, `Enter`/`Space` aktyvuoja, `←`/`→` perjungia vienetus, `R` atstato. Fokusas po veiksmo: į „Dėk vieną“, kai matuojama; į pirmą vienetą, kai matavimas baigtas; į pirmą spėjimo variantą, kai rodomas spėjimas (LL-32).
- **Grįžtamasis ryšys** — iškart po paspaudimo (≤ 1 kadras), be perėjimo ir be garso įžangos. `readout` įvardija būseną, `api.note` — vieną sakinį apie veiksmą, niekada apie vaiką. `api.progress({ correct: true })` — vieną kartą, kai **visi trys** vienetai išmatuoti iki galo, o ne po pirmo matavimo (LL-29). „Iš naujo“ pažangos netrina (LL-16).
- **Perjungimas matavimo viduryje:** pasirinkus kitą vienetą, padėtų vienetų skaičius atstatomas į 0, `api.note`: „Naujas vienetas. Matuok iš naujo.“ Tai ne klaida ir ne bauda.
- **Perpildymas:** kai lenta pilna, „Dėk vieną“ tampa neaktyvus, `api.note`: „Daugiau netelpa. Lenta baigėsi.“ Jokio klaidos pranešimo.
- **Garsas** — devynios nustatytos frazės (`start`, `place`, `full`, `ask`, `more`, `less`, `same`, `back`, `all`) ir dvylika skaičių frazių (`sentences.counts`: 6 + 4 + 2), visos laikomos `config.sentences`, o ne simuliacijos kode (LL-42). `walk_strings()` renka ir įdėtas `counts` reikšmes (`scripts/generate_audio.py:130–155`), todėl `check_audio.py` jas matys. `api.note` garsiai neskaitomas (mažas manifestas). Generuojant reikia abiejų variantų (`n`, `s`).
- **Prieinamumas:** scenos SVG `role="img"`, `aria-label` atnaujinamas po kiekvieno veiksmo („Lenta, ant jos trys sąvaržėlės. Lentos galas pažymėtas.“) ir nekartoja `readout` žodis į žodį. `readout` turi `aria-live="polite"`. Vienetai skiriasi forma ir pavadinimu, ne vien spalva; spėjimo būsena žymima `aria-pressed`.
- **Jokių laikmačių, ėjimų limito, „game over“.** Matuoti galima tiek kartų, kiek vaikas nori; grįžimas prie ankstesnio vieneto niekada nelaikomas klaida.

**Užduotys.**

| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
|---|---|---|---|---|---|
| 1 | atpažinimas | „Ant lentos telpa 6 sąvaržėlės arba 2 pieštukai. Kuri eilutė pasako lentos ilgį?“ — 6 / 2 / 6 sąvaržėlės arba 2 pieštukai | 6 sąvaržėlės arba 2 pieštukai (2) | pirmas arba antras — nuogas skaičius priimamas kaip ilgis | „Skaičius vienas nieko nesako. Pažiūrėk, kuo matuota.“ |
| 2 | taikymas | „Lenta yra 6 sąvaržėlės. Trintukas ilgesnis už sąvaržėlę. Kiek trintukų telpa?“ — 2 / 8 / 4 | 4 (2) | 8 — ilgesnis vienetas laikomas didesniu skaičiumi (pagrindinė nuostata) | „Trintukas didesnis už sąvaržėlę. Skaičius turi būti mažesnis už 6.“ |
| 3 | perkėlimas | „Močiutė matavo kilimą savo pėdomis ir gavo 8. Anūkas turi mažesnes pėdas. Kiek pėdų suskaičiuos anūkas?“ — Mažiau nei 8 / Daugiau nei 8 / Taip pat 8 | Daugiau nei 8 (1) | trečias — skaičius laikomas kilimo savybe; pirmas — mažesnė pėda siejama su mažesniu skaičiumi | „Mažesnė pėda telpa daugiau kartų į tą patį kilimą.“ |
| 4 | perkėlimas (`optional: true`) | „Du vaikai matavo tą patį suolą. Vienas gavo 3, kitas 9. Ar taip gali būti?“ — Ne, tas pats suolas duoda tą patį skaičių / Taip, jei vienas matavo trumpesniu vienetu / Ne, 9 yra per daug | Taip, jei vienas matavo trumpesniu vienetu (1) | pirmas — tas pats daiktas turi turėti vieną skaičių | „Skaičius priklauso nuo vieneto, ne nuo suolo.“ |

**Refleksija.** „Kaip paaiškintum, kodėl Jonas gavo 6, o Rūta 2?“ Klausiama žodžiu, nevertinama; laukiamas atsakymas — kad jie matavo skirtingais vienetais, o lenta ta pati.

**Modelio ribos (pasakomos vaikui ir mokytojui).** Lenta padalijama be liekanos: 240 px dalijasi iš 40, 60 ir 120. Tikrame matavime dažnai lieka likutis („4 trintukai ir dar gabaliukas“), ir tai yra antra sąvoka, kuri lieka mokytojo veiklai — modelis to neslepia, bet ir nevaizduoja. Vienetai ekrane yra schematiški žetonai, ne tikro dydžio piešiniai: tikras pieštukas yra apie penkis kartus ilgesnis už sąvaržėlę, o ekrane — tris kartus; svarbu ne tikslus santykis, o tai, kad kiekvienas vienetas yra viena visa kopija ir visos kopijos vienodo ilgio. Modelis neleidžia maišyti skirtingų vienetų, todėl negali parodyti, kodėl maišymas klaidingas — tą atvejį aptaria mokytojas su tikrais daiktais. Centimetrų ir liniuotės modelis nerodo: jų skalė ir nulis yra 2 klasės turinys. Pats matavimas ekrane yra kartojimas, bet skaičius atsiranda todėl, kad vaikas jį suskaičiavo spausdamas, o ne todėl, kad modelis jį paskaičiavo — todėl spėjimas ir palyginimas yra būtini, o teisingas skaičius nelaikomas supratimo įrodymu.

**Ką tai reiškia modulio autoriui.** `title` — „Ilgis: tas pats daiktas, kitas skaičius“ (39 simboliai); `subtitle` — „Skaičius priklauso nuo vieneto, kuriuo matuoji“ (46); `minutes` — 9; trys `outcomes`: „Išmatuoju daiktą pasirinktu vienetu ir pasakau skaičių su vienetu.“, „Palyginu to paties daikto matavimus skirtingais vienetais.“, „Paaiškinu, kodėl mažesnis vienetas duoda didesnį skaičių.“; `concept.title` — „Ilgis yra vienetų skaičius“ (26); `concept.big_idea` — „Tas pats daiktas, matuojamas skirtingais vienetais, gauna skirtingus skaičius. Jo ilgis nepakinta. Skaičius pasako ilgį tik tada, kai pasakai vienetą.“ (150); `concept.steps` — keturi žingsniai iš sekos 2–5; `concept.example` — „Klasė matuoja suolą. Viena grupė matuoja trintukais, kita pieštukais. Skaičiai skirsis, suolas liks tas pats.“; `teacher.offline` — dvi vienodo ilgio popieriaus juostos, vienas vaikas matuoja trintuku, kitas pieštuku, abu pasako skaičių su vienetu, tada keičiasi vienetais; `teacher.misconceptions` — trys nuostatos iš šio skyriaus (1–3), o ketvirtoji („vienetus galima maišyti“) įrašoma kaip modelio riba; `sim` — `{ "component": "ilgis-ir-vienetas", "config": { … } }`. Numeris `25-` laisvas (24 jau užimtas). Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/index.json` ir `path.json` (kūrėjo ar dizainerio darbas, ne metodo dalis); siūloma vieta kelyje — po `18-taskas-tiese-spindulys-atkarpa`, nes ten jau kalbama apie atkarpą ir jos ilgį, o prieš `21-erdvines-figuros`.

**Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, Matematikos ilgalaikis (metų) planas 1 klasei — „Ilgis 5“ ir integruota veikla „Kokio ilgio mano kuprinėje esantys daiktai?“ (`sources/pradinio-bp-rekomendacijos-2024.txt:17300–17301`, veiklos tikslas `:17325–17326`), matavimo principas `:1010–1014`, 2 klasės vienetų sąryšiai `:1015–1017`. Carpenter, T. P., & Lewis, R. (1976). The development of the concept of a standard unit of measure in young children. *Journal for Research in Mathematics Education, 7*(1), 53–58. https://doi.org/10.5951/jresematheduc.7.1.0053 · Sarama, J., Clements, D. H., Barrett, J., van Dine, D. W., & McDonel, J. S. (2011). Evaluation of a learning trajectory for length in the early years. *ZDM Mathematics Education, 43*(5), 667–680. https://doi.org/10.1007/s11858-011-0326-5 · Sarama, J., Clements, D. H., Barrett, J. E., Cullen, C. J., Hudyma, A., & Vanegas, Y. (2022). Length measurement in the early years: Teaching and learning with learning trajectories. *Mathematical Thinking and Learning, 24*(4), 267–290. https://doi.org/10.1080/10986065.2020.1858245 · Hiebert, J. (1981). Cognitive development and learning linear measurement. *Journal for Research in Mathematics Education, 12*(3), 197–211. https://doi.org/10.5951/jresematheduc.12.3.0197

**Pastaba dėl wiki.** `research/wiki/curriculum/matematika-1-klase.md:141` teigia, kad 1 klasėje ilgis „dokumente nenurodytas“; metų plano eilutė `:17300` tam prieštarauja („Ilgis 5“). Metodas remiasi šaltiniu, o wiki eilutė taisytina atskirame tyrėjo darbe — šiame faile ji neliesta.

### M-08 — Kas gyvas: pokytis, o ne judėjimas

**Data:** 2026-11-12 · **Tema:** `agents/proposals/2026-11-12-metodininkas-kas-gyvas.json` (idėja parengta ideator paleidime #243, bet pasiūlymo failas neįrašytas; metodas ją paima iš `agents/log/ideator-2026-11-12T0742.md:31–37`) · **Tikslas:** `content/lt/grade-01/pasaulio-pazinimas/20-kas-gyvas.json` · **Šaltinis:** [[../../foundations/gyvybe-ir-judesys|gyvybe-ir-judesys]]

**Viena didelė idėja.** Gyvas organizmas keičiasi pats: auga ir atsako į tai, ko jam reikia. Daiktas gali judėti ir vis tiek nepakisti. Todėl vien judėjimas nepasako, kas gyva.

**Ką sako programa.** 1 klasės gamtos mokslų ilgalaikiame plane yra atskira tema **26.2.4 „Bendri gyvų organizmų požymiai“** (1 val.), o veiklos — demonstracinis bandymas „Ar vazoninė gėlė kvėpuoja?“ ir žaidimas „Gyvas–negyvas“ (`sources/pradinio-bp-rekomendacijos-2024.txt:17645–17648`). Bendra 1–2 kl. nuostata tuos požymius vardija taip: „juda, kvėpuoja, auga, maitinasi, dauginasi“ (`:12629–12632`). Todėl modelis **neneigia** judėjimo kaip požymio: jis rodo, kad vienas judesys sprendimo nepadaro, o augimas ir reakcija — padaro. Tai LL-18 atvejis, kurio apeiti negalima: „juda“ oficialiame sąraše yra, tad ginčijamas ne jo statusas, o vieno požymio pakankamumas. Tema neperžengia 1 klasės ribos: augalo dalių funkcijos ir „gyvybės“ apibrėžimas moksliniu lygmeniu (27.2.1) neimamos.

**Kodėl modelis, o ne paveikslėlis.** Gyvybė pasireiškia laike: augalas per savaitę paauga, akmenukas nepakinta. Viename paveikslėlyje to nėra. Dviejų paveikslų greta vaikas negali patikrinti, kad akmenukas ir kamuoliukas tikrai stovėjo toje pačioje vietoje ir su jais nieko neatsitiko — trūksta to paties kadro. Modelyje visi trys daiktai stovi vienoje scenoje, o vaikas keičia tik vieną dalyką (vandenį) ir gali bet kada pastumti kamuoliuką: kamuoliukas nurieda, o jo pokytis lentelėje lieka 0. Tai bandymas, kurio paveikslėlis negali duoti — judėjimo hipotezė patikrinama tame pačiame ekrane, o ne paneigiama tekstu.

**Ką rodo tyrimai.** Villarroel (2013) individualiai apklausė 118 vaikų (4–5, 5–6 ir 6–7 m. grupės) ir prašė kiekvieną nuotraukoje pavaizduotą objektą (medis, gėlės, šuo, paukštis, motociklas, automobilis, debesys, saulė) priskirti gyviems ar negyviems. **6–7 m. grupėje 39,5 % teisingai priskyrė visus objektus**; augalus teisingai priskyrė 79,1 %, transporto priemones — 86 %, dangaus reiškinius (saulę, debesis) — 60,5 %. 4–5 m. grupėje vaikai transporto priemonėms gyvybę priskyrė **dažniau nei atsitiktinai** (`:733–735`, `:751–753`, `:848–853`). Tai reiškia, kad judėjimas kaip kriterijus nėra atsitiktinė vaiko klaida, o sistema, kuri nyksta lėtai — ir kad augalas yra sunkiausias atvejis, nes jis nejuda.

Leddon, Waxman ir Medin (2009) parodė, kad pats klausimo žodis klaidina: kai vaikų klausiama „ar tai gyva?“ („alive“), jie augalus priskiria gyviems rečiau, o pakeitus klausimą mažiau dviprasmišku („ar tai gyvas padaras?“) vaikai parodo turį bendrą sąvoką, siejančią augalus su gyvūnais. Villarroel savo tyrime šią metodinę išvadą pritaikė tiesiogiai (`:470–479`). Praktinė pasekmė moduliui: **klausiama „Kuris yra gyvas organizmas?“, ne „Ar jis gyvas?“**, ir vartojamas programos terminas „gyvas organizmas“, o ne kasdienis „gyvas“.

**Klaidingos nuostatos ir kaip jos paneigiamos.**

1. **„Gyva tai, kas juda.“** Paneigiama kamuoliuku: jis juda tik tada, kai jį pastumi, ir po to nurieda bei sustoja, o pokyčių lentelėje lieka 0. Antras prieštaraujantis pavyzdys tame pačiame ekrane — augalas, kuris nejuda, bet auga (LL-28).
2. **„Augalas negyvas, nes nejuda ir nieko neveikia.“** Paneigiama augalu: per savaitę su vandeniu jis paauga, be vandens — nuleidžia lapus. Abu pokyčiai yra reakcija į tai, ko jam reikia; nei akmenukas, nei kamuoliukas į vandenį nereaguoja.
3. **„Jei per savaitę nepakito, tai negyva.“** Šios nuostatos modelis nepaneigia, o pripažįsta kaip savo ribą: praplėtimo užduotis klausia apie sausą žirną lentynoje, o mokytojo skiltyje pasakyta, kad sėkla gali ilgai laukti vandens. Modelis nevaizduoja ramybės būsenos, bet jos neignoruoja.
4. **„Gyvybę rodo kvėpavimas, o jo nesimato.“** Modelis kvėpavimo nevaizduoja ir to neslepia: tai atskiras programos bandymas „Ar vazoninė gėlė kvėpuoja?“ mokytojo veikloje, o ne simuliacijos apgavystė.

**Seka (konkretumas → modelis → simbolis → perkėlimas).**

1. **Trys daiktai ant stalo.** Mokytojas padeda ant stalo pupos daigą vazone, akmenuką ir kamuoliuką. Klausimas: „Kuris iš jų yra gyvas organizmas?“ Vaikai ginčijasi; kas nors pastumia kamuoliuką, ir jis nurieda. Atsakymo mokytojas neteikia. Tikslas: iškelti kasdienį kriterijų — judėjimą — į kalbą, kad modelis turėtų ką griauti.
2. **Spėjimas ir pirma savaitė ekrane.** Vaikas paspaudžia vieną iš trijų spėjimų („augalas / akmenukas / kamuoliukas pasikeis“), tada „Palaistyk“ ir „Po savaitės“. Augalas paauga dvi padalas, lapai pasisuka į šviesą; akmenukas ir kamuoliukas lieka tokie patys. `readout` lygina spėjimą su įvykiu. Tikslas: įsipareigoti spėjimui ir pamatyti pirmą pokytį (LL-15).
3. **Kamuoliuko stūmimas.** Vaikas spaudžia „Pastumk kamuoliuką“: kamuoliukas nurieda ir sustoja, o lentelėje jo pokytis lieka 0. `api.note`: „Jį pastūmei tu. Pats jis nejuda ir neauga.“ Tikslas: atskirti judėjimą nuo pokyčio tame pačiame kadre.
4. **Antra savaitė be vandens.** Vaikas perjungia į „Nelaistyk“ ir paspaudžia „Po savaitės“. Augalo lapai nuleisti, spalva blankesnė; akmenukas ir kamuoliukas vėl nepakito. `api.note`: „Augalas atsakė į tai, ko jam trūko.“ Tikslas: parodyti, kad gyvybė yra reakcija, o ne tik augimas.
5. **Simbolis ir perkėlimas.** Po abiejų savaičių atsiranda pokyčių lentelė („augalas +2 · akmenukas 0 · kamuoliukas 0“) ir vienas sakinys: „Gyvas organizmas keičiasi pats.“ Vaikas jį perskaito ir pasako, kodėl kamuoliukas nepateko į lentelę. Tada — tos pačios taisyklės atvejai be modelio: žaislinis automobilis su rakteliu, medis žiemą, sausas žirnas. Tikslas: perkelti taisyklę į situacijas, kurių ekrane nebuvo.

**Simuliacijos specifikacija.** Komponentas `kas-gyvas`, failas `assets/js/sims/pasaulis.js` (šis failas jau importuoja `art.js`, o `check_art.py` LEGACY sąraše yra tik `matematika.js`, todėl sceną privaloma rinkti iš `art.js` dalių: `plank`, `pot`, `soil`, `stem`, `leaf`, `ball`). `config`:

```json
{ "objects": [
    { "id": "augalas", "name": "pupos daigas", "art": "plant" },
    { "id": "akmenukas", "name": "akmenukas", "art": "pebble" },
    { "id": "kamuoliukas", "name": "kamuoliukas", "art": "ball" } ],
  "weeks": 2,
  "growthPx": 16,
  "guess": ["augalas", "akmenukas", "kamuoliukas"],
  "sentences": { "guess": "…", "watered": "…", "grew": "…", "dry": "…",
                 "drooped": "…", "push": "…", "pushNote": "…", "table": "…", "done": "…" } }
```

Skaičiai išvedami, ne įrašyti: pokytis lentelėje = `weeks * growthPx / 8` (dvi savaitės su vandeniu → +2; be vandens → −2; akmenukas ir kamuoliukas → 0 visada, nes jų `change()` grąžina 0). Jei `growthPx` nesidalija iš 8, komponentas meta klaidą į `console` ir rodo „Augimas nesuderintas su padalomis.“ — tylus apvalinimas būtų neteisingas modelis.

| Būsena | Ką vaikas mato | `readout` | `api.note` |
|---|---|---|---|
| pradžia | trys daiktai ant lentynos, spėjimo mygtukai aktyvūs, „Po savaitės“ neaktyvus | „Kuris daiktas per savaitę pasikeis? Spėk.“ | „Pirma spėk, tada laistyk.“ |
| spėjimas | spėjimas pažymėtas, atsirado „Palaistyk / Nelaistyk“ | „Tu sakei: augalas. Dabar pasirink vandenį.“ | „Augalas gali gauti vandens arba ne.“ |
| pirma savaitė, laistyta | augalas aukštesnis dviem padalom, lapai pasisukę | „Augalas paaugo. Kiti du nepakito.“ | „Tu sakei augalas. Taip ir įvyko.“ |
| pirma savaitė, nelaistyta | augalo lapai nuleisti, spalva blanki | „Augalo lapai nuleisti. Kiti du nepakito.“ | „Augalas atsakė į tai, ko jam trūko.“ |
| kamuoliukas pastumtas | kamuoliukas pasislinkęs į dešinę ir stovi; kiti nejuda | „Kamuoliukas nuriedėjo ir sustojo.“ | „Jį pastūmei tu. Pats jis nejuda ir neauga.“ |
| antra savaitė (priešinga sąlyga) | augalas keičiasi priešinga kryptimi; lentelėje −2 | „Antra savaitė. Augalas vėl pasikeitė.“ | „Vanduo keičia augalą, o ne akmenuką.“ |
| abi savaitės | pokyčių lentelė „augalas +2 · akmenukas 0 · kamuoliukas 0“ | „Trys daiktai, vienas pasikeitė.“ | „Gyvas organizmas keičiasi pats.“ |
| „Iš naujo“ | pradinė būsena, spėjimas neištrintas | „Vėl trys daiktai.“ | „Gali bandyti iš naujo.“ |

- **Vienas kintamasis:** `watered` ∈ {`true`, `false`}. Jis vienintelis keičia augalo būseną ir lentelės skaičių. Stūmimas yra parodomasis veiksmas: `pushBall()` keičia tik kamuoliuko `cx` ir sąmoningai neliečia jokio skaičiaus — tai turi būti užtikrinta kodu, o ne teksto pažadu.
- **Laikas be laikmačio:** „savaitė“ yra vienas paspaudimas, o ne laukimas. Jokių `setInterval`, jokio „po 3 sekundžių“. Jei animacijai naudojamas `setTimeout`, `mount()` grąžina valymo funkciją (KURINIO-STANDARTAS §4.7).
- **Išdėstymas 360 px:** scena `viewBox="0 0 328 200"`, `width:100%`, `max-width:328px`. Lentyna — `art.plank(16, 138, 296, 10)`. Augalas x ≈ 52 (vazonas 34×28, stiebas iki 46 px, du lapai), akmenukas — `art.ball(158, 124, 14)`, kamuoliukas — `art.ball(252, 112, 26)`. Dešinėje 0–4 padalų juosta x = 310, aukštis 4 × 18 px. Pokyčių lentelė — trys žetonai po 96 px (×3 = 288 iš 328). Pavadinimai po daiktais 13 px, nekertami (`scrollWidth == clientWidth`).
- **Įėjimai:** trys spėjimo mygtukai 96 × 56 px su `aria-label` („Spėju: augalas“); „Palaistyk / Nelaistyk“ 100 % × 56 px su `aria-pressed`; „Po savaitės“ 100 % × 56 px; „Pastumk kamuoliuką“ 100 % × 56 px; „Iš naujo“ ≥ 96 × 48 px. Klaviatūra: `Tab`, `Enter`/`Space`, `←`/`→` perjungia spėjimo variantus, `W` perjungia vandenį, `R` atstato. Fokusas po veiksmo: į „Po savaitės“, kai pasirinktas vanduo; į „Pastumk kamuoliuką“, kai pasirodo lentelė (LL-32).
- **Grįžtamasis ryšys** — iškart po paspaudimo, be garso įžangos. `readout` įvardija būseną ir palygina su spėjimu, `api.note` sako **kodėl**, niekada „teisingai“ ir niekada apie vaiką (T5.1). `api.progress({ correct: true })` — vieną kartą, kai **abi savaitės** praėjusios skirtingomis sąlygomis, o ne po pirmos (LL-29). „Iš naujo“ pažangos netrina (LL-16).
- **Augalas nenumiršta.** Net dvi savaites be vandens jis lieka gyvas, tik nuleidęs lapus: modelis nebaudžia ir nevaizduoja mirties, o `readout` sako „Augalas laukia vandens.“ Jei po antros sausos savaitės lapai virsta rudi, tekstas vis tiek sako „gyvas, bet ištroškęs“ — 6–7 m. vaikui mirtis modelyje nereikalinga, o neteisinga būsena būtų blogesnė už supaprastinimą.
- **Garsas** — devynios frazės `config.sentences` (LL-42), visos trumpesnės nei 10 žodžių; `api.note` garsiai neskaitomas. Generuojami abu variantai (`n`, `s`), `check_audio.py` privalo matyti visas devynias.
- **Prieinamumas:** scenos SVG `role="img"` su `aria-label`, atnaujinamu po kiekvieno veiksmo („Lentynoje pupos daigas, akmenukas ir kamuoliukas. Augalas aukštesnis.“); `readout` — `aria-live="polite"`. Daiktai skiriasi forma ir pavadinimu, ne vien spalva; spėjimo būsena — `aria-pressed`. Visi taikiniai ≥ 48 px.
- **Jokio laiko limito, ėjimų limito, „game over“.**

**Užduotys.**

| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
|---|---|---|---|---|---|
| 1 | atpažinimas | „Po savaitės augalas paaugo, akmenukas ir kamuoliukas liko tokie patys. Kuris yra gyvas organizmas?“ — Augalas / Kamuoliukas / Akmenukas | Augalas (0) | Kamuoliukas — judėjimas laikomas gyvybės požymiu | „Pažiūrėk, kas pasikeitė, o kas tik pajudėjo.“ |
| 2 | taikymas | „Kamuoliuką pastūmei ir jis nuriedėjo. Ar jis dėl to tapo gyvas?“ — Taip, nes juda / Ne, jis juda tik tada, kai jį stumi / Ne, nes jis kvėpuoja | Ne, juda tik kai stumi (1) | pirmas — judėjimas priskiriamas pačiam daiktui | „Kas jį pajudino? Ar jis pajudėtų pats?“ |
| 3 | perkėlimas | „Žaislinis automobilis važiuoja, kai pasuki raktelį. Augalas nejuda. Kuris gyvas organizmas?“ — Augalas, nes auga ir reaguoja į vandenį / Automobilis, nes juda / Abu | Augalas (0) | antras — „juda“ painiojamas su „gyvas“ | „Judėjimą sukelia raktelis, o augimą — vanduo.“ |
| 4 | perkėlimas (`optional: true`) | „Sausas žirnas guli lentynoje ir per savaitę nepakito. Ar jis gyvas organizmas?“ — Ne, nes nepasikeitė / Taip, jis tik laukia vandens / Ne, nes nejuda | Taip, laukia vandens (1) | pirmas — nepakitusi būsena laikoma negyva | „Palaistyk jį ir palauk ilgiau.“ |

Atsakymų indeksai 0 / 1 / 0 / 1 — trečiasis sąmoningai ne viduryje (validatorius tikrina pasiskirstymą). Užuominos niekada nekartoja teisingo varianto žodžių (`validate_content.py` tai tikrina).

**Refleksija.** „Kodėl kamuoliukas nuriedėjo, bet neliko gyvas?“ Klausiama žodžiu, nevertinama; laukiamas atsakymas — kad jį pastūmė vaikas, o augalas keitėsi pats.

**Modelio ribos (pasakomos vaikui ir mokytojui).** Modelis rodo dviejų savaičių pokytį, o tikroje gamtoje kai kurie augalai per savaitę beveik nepakinta, o žiemą medis apskritai atrodo nejudąs. Todėl taisyklė „pokytis per savaitę“ yra modelio supaprastinimas, o ne gyvybės apibrėžimas: praplėtimo užduotis su sausu žirnu ir mokytojo veikla su medžiu žiemą pasako, kad gyvybė gali ir „laukti“. Modelis nevaizduoja kvėpavimo, maitinimosi ir dauginimosi — programos sąraše jie yra, bet ekrane būtų ne stebimi, o deklaruojami. Debesų ir saulės modelis sąmoningai neliečia: jie juda ir keičia pavidalą, bet nėra organizmai, o šiam skirtumui reikia atskiros temos (Villarroel duomenimis, būtent dangaus reiškiniai 6–7 m. vaikams sunkiausi — 60,5 %). Kamuoliukas ekrane juda todėl, kad jį stumia vaikas; savarankiško judėjimo modelis nerodo ir to neslepia.

**Ką tai reiškia modulio autoriui.** `title` — „Kas gyvas: auga ir reaguoja, ne tik juda“ (40 simbolių); `subtitle` — „Gyvybę rodo pokytis: augalas auga, o kamuoliukas tik rieda“ (58); `minutes` — 9; trys `outcomes`: „Skiriu, kas per savaitę pasikeitė, o kas tik pajudėjo.“, „Paaiškinu, kodėl judėjimas vienas neparodo, kas gyva.“, „Pasakau, kaip augalas reaguoja į vandenį.“; `concept.title` — „Gyvybę rodo pokytis“ (19); `concept.big_idea` — „Gyvas organizmas keičiasi pats: auga ir reaguoja į tai, ko jam reikia. Kamuoliukas juda tik tada, kai jį pastumi, bet pats nepakinta. Todėl vien judėjimas neparodo, kas gyva.“ (174); `concept.steps` — trys žingsniai iš sekos 2–5; `concept.example` — „Kambaryje augalas prie lango. Jį palaistai ir po savaitės jis didesnis. Kamuoliukas tas pats, nors ir nuriedėjo.“; `teacher.offline` — trys realūs daiktai (pupos daigas, akmenukas, kamuoliukas), spėjimas, savaitės stebėjimas su dviem augalais (vienas laistomas, kitas ne), pokyčių lentelė popieriuje; `teacher.misconceptions` — trys nuostatos iš šio skyriaus, o ketvirtoji („kvėpavimo nesimato“) įrašoma kaip modelio riba; `sim` — `{ "component": "kas-gyvas", "config": { … } }`. Numeris `20-` laisvas (pasaulio pažinime yra 08–10 ir 16–19). Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/index.json` ir `path.json` (kūrėjo ar dizainerio darbas, ne metodo dalis); siūloma vieta kelyje — po `09-augalo-gyvenimas`, nes ten jau kalbama apie tai, ko augalui reikia, o čia klausiama, kas apskritai gyvas.

**Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, Gamtos mokslai, 1 klasės ilgalaikis planas — 26.2.4 „Bendri gyvų organizmų požymiai“ ir veiklos (`sources/pradinio-bp-rekomendacijos-2024.txt:17645–17648`); bendra 1–2 kl. nuostata apie požymius (`:12629–12632`); F1 pasiekimas (`:40886–40887`). Villarroel, J. D. (2013). Environmental judgment in early childhood and its relationship with the understanding of the concept of living beings. *SpringerPlus, 2*, 87. https://doi.org/10.1186/2193-1801-2-87 (atvira prieiga; 6–7 m. grupė `:733–735`, `:848–853`, transporto priemonės 4–5 m. grupėje `:751–753`, klausimo formuluotė `:470–479`). Leddon, E. M., Waxman, S. R., & Medin, D. L. (2009). Unmasking „Alive“: Children's appreciation of a concept linking all living things. *Journal of Cognition and Development, 9*(4), 461–473. https://doi.org/10.1080/15248370802678463 (PMID 19319203; PMCID PMC2659632).

**Pastaba dėl wiki.** `research/wiki/curriculum/pasaulio-pazinimas-1-klase.md:82–88` temų lentelėje 26.2.4 nėra — ji yra ilgalaikiame plane (`:17645`), todėl lentelė tyrėjui papildytina; šiame faile curriculum įrašas neliestas (ne mano vaidmens failas).

### M-09 — Kas sukūrė šį daiktą: grandinė nuo daikto iki gamtos

**Data:** 2026-11-14 · **Tema:** `agents/proposals/2026-11-14-ideator-kas-sukure-dailka.json` (#15581) · **Tikslas:** `content/lt/grade-01/pasaulio-pazinimas/21-kas-sukure-daikta.json` · **Šaltinis:** [[../../foundations/kilme-ir-grandine|kilme-ir-grandine]]

**Viena didelė idėja.** Kiekvienas daiktas prasideda gamtoje: popierius — ąžuole, stiklinė — smėlyje. Parduotuvė yra kelio gale, o ne pradžioje.

**Ką sako programa.** 1 klasės gamtos mokslų ilgalaikiame plane yra **26.3.1 „Gamtos ištekliai, jų tarša ir tausojimas“ (2 val.)**, o veikla įvardyta pažodžiui — „darbas grupėse ar porose (pvz., žaidimas „Kas sukūrė šį daiktą?“)“ (`sources/pradinio-bp-rekomendacijos-2024.txt:17649–17656`; ta pati eilutė integracijos lentelėje `:8452–8458`). To paties dokumento „5 temos su įgyvendinimo rekomendacijomis“ lentelėje 26.3.1 nėra (`research/wiki/curriculum/pasaulio-pazinimas-1-klase.md:82–88`, ten pat `[PATIKRINTI]` apie numeracijos spragas). Tai dokumento spraga, o ne temos nebuvimas: planas jai skiria dvi valandas, todėl modulis remiasi ilgalaikiu planu, o ne penkių temų sąrašu (žr. „Pastaba dėl wiki“).

**Kodėl modelis, o ne paveikslėlis.** Paveikslėlyje, kuriame nupiešta grandinė, vaikas mato rezultatą, bet negali patikrinti dviejų dalykų, kurie ir yra sąvoka. Pirma, jis negali pamatyti, kad **klaidingas šaltinis grandinės nebaigia**: piešinyje visos kortelės jau sudėtos teisingai, todėl ryšys atrodo kaip iliustracija, o ne kaip taisyklė. Antra, jis negali grįžti atgal: paveikslėlis neatsako, kas nutinka, jei popierius būtų daromas iš smėlio. Modelis leidžia rinktis šaltinį ir pamatyti, kad pasirinkus netinkamą kortelę grandinė sustoja vienu žingsniu anksčiau, o `api.note` pasako, kokia **savybė** nesutampa. Be to, prieš pirmą pasirinkimą prašoma spėjimo apie kelio pradžią — tai ne puošmena, o būdas pamatyti nuostatą, kurią modelis turi paneigti (LL-15).

**Ką rodo tyrimai.** Anderson, Ellis ir Jones (2014) tyrė 182 darželinukus ir pirmokus (K–1 klasės) JAV pietryčiuose ir klausė, ar kasdieniai daiktai yra augalai. **89 % darželinukų ir 85 % pirmokų nepripažino, kad telefono stulpai daromi iš medžių kamienų**; paklausti, iš kur stulpas, dažniausiai atsakė „iš telefono kompanijos“. **80 % darželinukų ir 87 % pirmokų nesiejo popieriaus su medžiais** (lentelėje popierių kaip augalą įvardijo 20 % darželinukų ir 13 % pirmokų). Tai tiksli formuluotė tos nuostatos, kurią turi paneigti modelis: daiktas turi **gamintoją**, bet neturi **šaltinio** — kol kas nors nepamoko jo ieškoti.

Bjørgen, Moe, Wold ir Melis (2023) kalbino 56 penkerių–šešerių metų vaikus Norvegijoje apie aštuonių maisto produktų kilmę. Vaikai gerai žinojo, iš kur pienas (94 %), mėsa (79 %), duona (67 %) ir miltai (67 %), bet prasčiau — sūrį (30 %), makaronus (30 %) ir dešrą (33 %). Autoriams svarbiausia išvada: sunkiausia ten, kur tarp žaliavos ir produkto yra **keli nematomi žingsniai**. Todėl modelis kiekvieną žingsnį rodo atskirai ir neleidžia jo praleisti.

Joshi, Azuma ir Feenstra (2008) apžvalgoje aprašytas programos vertinimas, kuriame vaikai dėliojo korteles „nuo ūkio iki stalo“: teisingai seką sudėjo 12 % prieš ir 52 % po programos. Tai ne 1 klasės ir ne Lietuvos duomenys, todėl jie naudojami tik kaip veiklos formos precedentas — kortelių seka yra išmatuojamai veiksminga, bet pati savaime dar neįrodo supratimo.

**Klaidingos nuostatos ir kaip jos paneigiamos.**

1. **„Daiktas atsiranda parduotuvėje.“** Tai pagrindinė nuostata, kurią fiksuoja Anderson ir kt. (2014): vaikas įvardija matomą agentą (parduotuvę, įmonę, gamyklą), o ne medžiagos šaltinį. Paneigiama ne tekstu, o veiksmu: vaikas pats stato grandinę atgal, o spėjimas „parduotuvėje“ lieka matomas viršuje ir pabaigoje lyginamas su grandinės galu („Tu sakei: parduotuvėje. Grandinė baigėsi miške.“).
2. **„Gamta — tai tik miškas.“** Antras daiktas yra stiklinė, o jos grandinė baigiasi **smėlyje**. Jei gamta būtų tik žaluma, stiklinės kelias neturėtų kur baigtis; modelis rodo, kad gamta yra ir negyvoji.
3. **„Gamykla sukuria medžiagą iš nieko.“** Kiekvienas žingsnis turi savo šaltinį, o netinkama kortelė grandinės nepratęsia. Paaiškinimas remiasi savybe, ne autoritetu: smėlis birus, popierius lankstosi; mediena turi kamieną, smėlis — ne.
4. **„Jei daiktas pirktas, jis jau ne iš gamtos.“** Tai ta pati pirmoji nuostata, pasakyta iš kitos pusės, todėl modelis jos atskirai neįvardija: parduotuvė grandinėje yra, tik paskutinė. Parduotuvės kortelė atsiranda peržiūros pabaigoje („Popierius atvežamas į parduotuvę.“), kad vieta būtų parodyta, o ne neigiama.

**Tikslas sąmoningai kuklus.** Modulis nesiekia, kad vaikas žinotų, iš ko padarytas kiekvienas daiktas. Jis siekia vieno įgūdžio: **paklausti „iš ko?“ ir eiti atgal, kol kelias baigiasi gamtoje**. Todėl modelio grandinė trumpa — du žingsniai nuo daikto iki gamtos (popierius → mediena → ąžuolas; stiklinė → stiklas → smėlis), o ne visa gamybos grandinė su transportu ir pakuote. Darbinė atmintis 6–7 metų vaikui laiko du–tris elementus; ilgesnė grandinė pavirstų sekos įsiminimu, o ne kilmės supratimu (`foundations/kognityvine-apkrova.md`).

**Seka (konkretumas → modelis → simbolis → perkėlimas).**

1. **Stalas ir kortelės.** Mokytojas padeda popieriaus lapą, medinę liniuotę ir stiklinę, o vaikams duoda tris korteles: ąžuolas, mediena, smėlis. Prašoma prie lapo padėti tai, iš ko jis atsirado, o prie stiklinės — savo. Vaikai ginčijasi; mokytojas atsakymo neteikia. Tikslas: iškelti kasdienį paaiškinimą („iš parduotuvės“) į kalbą, kad modelis turėtų ką griauti.
2. **Ekranas, spėjimas.** Ekrane dešinėje guli popierius, į kairę — du tušti langeliai. Klausimas: „Kur prasideda popieriaus kelias?“ Trys mygtukai: Miške / Parduotuvėje / Gamykloje. Spėjimas įrašomas ir lieka matomas visą laiką. Tikslas: įsipareigoti nuostatai, kol modelis jos nepaneigė.
3. **Ekranas, grandinė atgal.** Atsiranda pirmas klausimas: „Iš ko padarytas popierius?“ Trys kortelės: mediena / lapai / smėlis. Teisinga kortelė atsiranda kairėje, tarp jos ir lapo nutįsta rodyklė. Tada antras klausimas: „Iš ko atsirado mediena?“ (ąžuolas / pieštukas / smėlis). Netinkama kortelė lieka langelyje su brūkšniuotu rėmeliu ir trūkusia rodykle, o `api.note` pasako, kokia savybė nesutampa. Tikslas: pamatyti, kad grandinė gali **nenueiti iki gamtos**, ir kodėl.
4. **Simbolis.** Kai popieriaus grandinė baigiasi, kairiausia kortelė apibrėžiama rėmeliu ir gauna žodį „GAMTA“, o `api.readout` sako: „Popierius prasideda miške.“ Mygtukas „Peržiūrėk kelią“ veda per grandinę iš kairės į dešinę po vieną žingsnį, be laikmačio, kiekvieną kartą tardamas vieną sakinį („Ąžuolas auga miške.“ → „Iš medienos daromas popierius.“ → „Popierius atvežamas į parduotuvę.“). Vaikas perskaito užrašą ir pasako, kas pasikeitė kiekviename žingsnyje. Tikslas: grandinė tampa užrašu, o ne paveikslėliu, ir parduotuvė atsiduria gale.
5. **Perkėlimas.** Antras daiktas — stiklinė. Prieš statant: „Ar stiklinės kelias irgi baigsis gamtoje?“ (Taip / Ne). Spėjimas lyginamas su grandinės galu: „Tu sakei taip. Gamta yra ir smėlis.“ Grandinė: stiklinė → stiklas → smėlis. Tada ekrane lieka abi grandinės kaip dvi eilutės, o to paties klausimo atvejai be modelio sprendžiami užduotyse: knyga (miškas), plastikinis butelis (nafta).

**Privalomas spėjimo žingsnis prieš pirmą pasirinkimą.** Du spėjimai, abu palyginami su įvykiu (LL-15). Pirmasis — vieta (miške / parduotuvėje / gamykloje), antrasis — ar antro daikto kelias irgi baigsis gamtoje (taip / ne). Kol vaikas nepasirinko pirmojo spėjimo, šaltinio kortelės neaktyvios; jų `aria-label` sako „Pirma pasirink spėjimą“. Be spėjimo modelis virsta kortelių rinkimu bandymų būdu: vaikas baksto tol, kol grandinė sueina, ir nuostatos nepastebi — tas pats pavojus kaip M-01–M-08 (`foundations/sujungti-dydziai.md`).

**Simuliacijos specifikacija.** Komponentas `daikto-grandine`, failas `assets/js/sims/pasaulis.js` (jis jau importuoja `art.js`, o `scripts/check_art.py:31` LEGACY sąraše yra tik `matematika.js`). Grandinė yra **duomenys**, o ne trys atskiri ekranai: komponentas eina per `objects[].steps[]`, todėl trečias daiktas pridedamas konfigūracija, be kodo pakeitimų. `config`:

```json
{ "cards": {
    "popierius": { "name": "popierius", "icon": "popierius" },
    "mediena":   { "name": "mediena",   "icon": "mediena" },
    "lapai":     { "name": "lapai",     "icon": "lapai" },
    "smelis":    { "name": "smėlis",    "icon": "smelis" },
    "azuolas":   { "name": "ąžuolas",   "icon": "azuolas" },
    "piestukas": { "name": "pieštukas", "icon": "piestukas" },
    "stikline":  { "name": "stiklinė",  "icon": "stikline" },
    "stiklas":   { "name": "stiklas",   "icon": "stiklas" },
    "nafta":     { "name": "nafta",     "icon": "nafta" } },
  "objects": [
    { "id": "popierius",
      "predict": { "say": "predict", "options": [
        { "id": "miske", "label": "Miške", "say": "compare_miske" },
        { "id": "parduotuveje", "label": "Parduotuvėje", "say": "compare_parduotuve" },
        { "id": "gamykloje", "label": "Gamykloje", "say": "compare_gamykla" } ] },
      "steps": [
        { "card": "mediena", "ask": "ask_mediena",
          "options": ["mediena", "lapai", "smelis"],
          "no": { "lapai": "Lapai ploni ir žali. Popierius baltas ir sausas.",
                  "smelis": "Smėlis birus. Popierius lankstosi ir plyšta." } },
        { "card": "azuolas", "ask": "ask_azuolas", "end": "done1",
          "options": ["azuolas", "piestukas", "smelis"],
          "no": { "piestukas": "Pieštukas daromas iš medienos, ne atvirkščiai.",
                  "smelis": "Smėlis neturi kamieno ir žievės." } } ],
      "replay": ["replay_azuolas", "replay_mediena", "replay_parduotuve"] },
    { "id": "stikline",
      "predict": { "say": "ask2", "options": [
        { "id": "taip", "label": "Taip", "say": "compare_taip" },
        { "id": "ne", "label": "Ne", "say": "compare_ne" } ] },
      "steps": [
        { "card": "stiklas", "ask": "ask_stiklas",
          "options": ["stiklas", "mediena", "smelis"],
          "no": { "mediena": "Stiklinė permatoma. Mediena nepermatoma.",
                  "smelis": "Smėlis birus. Stiklinė kieta ir vientisa." } },
        { "card": "smelis", "ask": "ask_smelis", "end": "done2",
          "options": ["smelis", "azuolas", "nafta"],
          "no": { "azuolas": "Ąžuolas duoda medieną, ne stiklą.",
                  "nafta": "Nafta tamsi. Stiklas skaidrus." } } ],
      "replay": ["replay_smelis", "replay_stiklas"] } ],
  "sentences": {
    "predict": "Kur prasideda popieriaus kelias? Spėk.",
    "guessReadout": "Tu sakei: {label}. Dabar statyk kelią.",
    "ask_mediena": "Iš ko padarytas popierius?",
    "ask_azuolas": "Iš ko atsirado mediena?",
    "ask_stiklas": "Iš ko padaryta stiklinė?",
    "ask_smelis": "Iš ko atsiranda stiklas?",
    "wrong": "Grandinė čia nenueina.",
    "done1": "Popierius prasideda miške.",
    "compare_miske": "Tu sakei miške. Taip ir yra.",
    "compare_parduotuve": "Tu sakei parduotuvėje. Grandinė baigėsi miške.",
    "compare_gamykla": "Tu sakei gamykloje. Grandinė baigėsi miške.",
    "ask2": "Ar stiklinės kelias irgi baigsis gamtoje?",
    "done2": "Stiklinė prasideda smėlyje.",
    "compare_taip": "Tu sakei taip. Gamta yra ir smėlis.",
    "compare_ne": "Tu sakei ne. Stiklinės kelias baigėsi smėlyje.",
    "all": "Gamta yra ir miškas, ir smėlis.",
    "again": "Pradedam iš naujo.",
    "replay_azuolas": "Ąžuolas auga miške.",
    "replay_mediena": "Iš medienos daromas popierius.",
    "replay_parduotuve": "Popierius atvežamas į parduotuvę.",
    "replay_smelis": "Smėlis kasamas.",
    "replay_stiklas": "Iš smėlio lydomas stiklas." } }
```

Trylika savybių, kurių negalima praleisti (kiekviena atitinka pamoką):

- **Vienas kintamasis:** kurią kortelę vaikas pasirenka dabartiniame žingsnyje. Daiktas keičiamas tik užbaigus grandinę („Kitas daiktas“), todėl du kintamieji niekada neveikia vienu metu. Spėjimas ir „Peržiūrėk kelią“ yra žingsniai, o ne papildomi kintamieji.
- **Grandinė — konfigūracija, ne kodas:** komponentas tikrina, kad `steps[].options` turi `card` ir kad **kiekviena neteisinga kortelė turi `no` paaiškinimą**. Jei trūksta — `console.error` ir ekrane „Grandinė nesuderinta su kortelėmis.“, o ne tylus bendras sakinys (LL-33). Jei `card` nėra `options` sąraše — ta pati klaida.
- **Kryptis matoma:** rodyklė visada iš kairės į dešinę (`Ąžuolas → mediena → popierius`), o ne atvirkščiai; todėl „atgal“ yra judėjimas prieš rodyklę, ir tai pasakoma vieną kartą `api.note`, o ne kiekviename žingsnyje.
- **Netinkama kortelė lieka matoma** brūkšniuotu rėmeliu ir trūkusia rodykle, kol vaikas pasirenka kitą. Ji neišnyksta po laiko ir nėra vadinama klaida: `api.readout` sako „Grandinė čia nenueina.“, `api.note` — kodėl (savybė), `api.speak` — tą patį sakinį.
- **Grįžtamasis ryšys** — iškart po paspaudimo (≤ 1 kadras). `api.note` niekada nesako „teisingai“ ir niekada ne apie vaiką (T5.1). `api.speak` skaito tik `config.sentences` frazes (LL-42), o `api.note` garsiai neskaitomas.
- **Vienas tekstų šaltinis:** spėjimo skelbimas statomas iš vienos frazės su vieta reikšmei — `sentences.guessReadout` su `{label}`, o ne iš kodo suklijuoto sakinio ir atskiros `sentences.guessed` eilutės. Kiekvienas `sentences` raktas privalo būti ištartas bent vienoje būsenoje; jei raktas liko neištartas arba frazėje trūksta `{label}`, komponentas rašo `console.error` ir rodo „Grandinė nesuderinta su tekstais.“ (LL-33 — vienas šaltinis, ne dvi tiesos).
- **`api.progress({ correct: true })`** — vieną kartą, kai **abi** grandinės baigtos **ir** antrasis spėjimas palygintas, t. y. tik pasiekus būseną „abi grandinės“ (LL-29). Po pirmos grandinės pažanga nežymima, nors grandinė baigta. „Iš naujo“ pažangos netrina (LL-16).
- **Išdėstymas 360 px:** scena `viewBox="0 0 328 200"`, `width:100%`, `max-width:328px`. Trys kortelės po 92 × 104 px ir du 26 px tarpai = 328 px (rodyklė telpa į tarpą). Kortelės vidus: 56 px piktograma, 32 px užrašas (dvi eilutės po 16 px), 16 px „GAMTA“ juosta = 104 px. Spėjimo žymė viršuje 0–36 px. Suvestinė (abi grandinės) — dvi eilutės po tris 60 × 36 px korteles su 10 px tarpais = 200 px iš 328 px; eilutės 40 ir 104 px aukštyje.
- **Valdikliai:** trys šaltinio mygtukai 100 × 72 px + du 8 px tarpai = 316 px iš 328 px; kiekvienas turi piktogramą ir užrašą, `min-height:72px`, `height:auto`, `overflow-wrap:anywhere` (200 % tekste užrašas gali užimti tris eilutes). „Peržiūrėk kelią“ ir „Kitas daiktas“ — 100 % × 56 px, „Iš naujo“ ≥ 96 × 48 px. „Kitas daiktas“ neaktyvus, kol grandinė nebaigta, ir `aria-label` pasako kodėl. Klaviatūra: `Tab`, `Enter`/`Space`, `←`/`→` perjungia variantus, `R` atstato.
- **Fokusas** (LL-32): po spėjimo — į pirmą šaltinio mygtuką; po teisingo žingsnio — į pirmą kito žingsnio mygtuką; po grandinės pabaigos — į „Peržiūrėk kelią“; paspaudus „Kitas daiktas“ — į pirmą spėjimo mygtuką; kai mygtukas išjungiamas, fokusas niekada nelieka ant jo.
- **Piktogramos:** viena nauja `art.js` dalis `pictogram(kind, x, y, s)` su devyniomis rūšimis (`popierius`, `mediena`, `lapai`, `smelis`, `azuolas`, `piestukas`, `stikline`, `stiklas`, `nafta`), kuri viduje naudoja jau esančias dalis (`plank`, `tree`, `leaf`, `drops`) ir prideda tris naujas formas: lapas su užlenktu kampu, svarstiklinė su atviru viršumi ir šviesos ruožu, smėlio kauburys iš grūdelių. Kortelės skiriasi **forma**, ne vien spalva (LL-13): popierius — stačiakampis su užlenktu kampu, mediena — lenta su rievėmis, smėlis — kauburys, stiklas — plokštė su įstrižu blizgesiu, stiklinė — taurelė.
- **Prieinamumas:** scenos SVG `role="img"`, `aria-label` atnaujinamas po kiekvieno veiksmo ir neperpasakoja `readout` žodis į žodį: „Popieriaus grandinė: lapas, mediena, tuščias langelis. Spėjimas: parduotuvėje.“ Netinkama kortelė `aria-label` žymima žodžiu „netinka“, ne vien brūkšniuotu rėmeliu. „GAMTA“ — žodis, ne vien žalia spalva. `readout` turi `aria-live="polite"`.
- **Jokių laikmačių, ėjimų limito, „game over“.** Netinkamų kortelių skaičius neribojamas ir neskaičiuojamas; grįžimas prie jau atmestos kortelės niekada nelaikomas klaida.

| Būsena | Ką vaikas mato | `readout` | `api.note` |
|---|---|---|---|
| pradžia | lapas dešinėje, du tušti langeliai, šaltinio kortelės neaktyvios | „Kur prasideda popieriaus kelias? Spėk.“ | „Pirma spėk, tada rink šaltinį.“ |
| spėjimas „Parduotuvėje“ | spėjimas kortelėje virš grandinės, trys kortelės aktyvios | „Tu sakei: parduotuvėje. Dabar statyk kelią.“ | „Šis spėjimas liks viršuje iki galo.“ |
| pirmas žingsnis teisingas | tarp lapo ir medienos rodyklė, kairėje atsidarė antras langelis | „Popierius iš medienos. Iš ko mediena?“ | „Dar vienas žingsnis iki gamtos.“ |
| netinkama kortelė (lapai) | lapų kortelė langelyje, brūkšniuotas rėmelis, rodyklė trūkusi | „Grandinė čia nenueina.“ | „Lapai ploni ir žali. Popierius baltas ir sausas.“ |
| popieriaus grandinė baigta | trys kortelės, kairioji su rėmeliu ir žodžiu „GAMTA“ | „Popierius prasideda miške.“ | „Tu sakei: parduotuvėje. Grandinė baigėsi miške.“ |
| peržiūra, 1–3 žingsnis | paryškinama viena kortelė iš kairės į dešinę | „1. Ąžuolas auga miške.“ / „2. Iš medienos daromas popierius.“ / „3. Popierius atvežamas į parduotuvę.“ | „Žiūrėk, kur yra parduotuvė.“ |
| stiklinės spėjimas | stiklinė dešinėje, du spėjimo mygtukai | „Ar stiklinės kelias irgi baigsis gamtoje?“ | „Pasirink: taip arba ne.“ |
| stiklinės grandinė baigta | stiklinė, stiklas, smėlis; smėlis su „GAMTA“ | „Stiklinė prasideda smėlyje.“ | „Tu sakei: taip. Gamta yra ir smėlis.“ |
| abi grandinės | dvi suvestinės eilutės: popierius ir stiklinė | „Du daiktai, dvi grandinės, abi gamtoje.“ | „Gamta yra ir miškas, ir smėlis.“ |

**Užduotys.**

| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
|---|---|---|---|---|---|
| 1 | atpažinimas | „Parduotuvėje ant lentynos guli popieriaus lapas. Iš kur atsiranda popierius?“ — Iš medienos / Iš lapų / Iš smėlio | Iš medienos (0) | „Iš lapų“ — popieriaus lapas painiojamas su medžio lapu (tas pats žodis) | „Medžio lapas žalias ir plonas. Ar popierius toks pat?“ |
| 2 | taikymas | „Stiklinė padaryta iš stiklo. Iš kur atsiranda stiklas?“ — Iš naftos / Iš medienos / Iš smėlio | Iš smėlio (2) | „Iš naftos“ — plastiko šaltinis priskiriamas stiklui | „Tu galvoji apie plastiką. Stiklas ir plastikas skiriasi.“ |
| 3 | perkėlimas | „Knyga padaryta iš popieriaus. Kur prasideda knygos kelias?“ — Parduotuvėje / Spaustuvėje / Miške | Miške (2) | „Spaustuvėje“ — artimiausias matomas žmogaus žingsnis laikomas pradžia; „Parduotuvėje“ — pirmoji nuostata | „Spaustuvė spausdina popierių. Kas popierių padaro?“ |
| 4 | perkėlimas (`optional: true`) | „Plastikinis butelis padarytas iš plastiko. Kur prasideda jo kelias?“ — Naftoje / Parduotuvėje / Smėlyje | Naftoje (0) | „Smėlyje“ — stiklo šaltinis perkeliamas plastikui; „Parduotuvėje“ — pirmoji nuostata | „Tu galvoji apie stiklą. Butelis lankstus, o stiklas kietas.“ |

Atsakymų indeksai 0 / 2 / 2 / 0 — pasiskirstę, todėl vaikas negali spėti pagal varianto vietą. Kiekviena užuomina pasakyta trumpais sakiniais ir nė viena nekartoja teisingo varianto (`validate_content.py` tai tikrina).

**Refleksija.** „Iš ko atsirado tavo pieštukas? Papasakok kelią iki gamtos.“ Klausiama žodžiu, nevertinama; laukiamas atsakymas — pieštukas → mediena → medis, o ne „iš parduotuvės“.

**Modelio ribos (pasakomos vaikui ir mokytojui).** Grandinė rodo tik medžiagos kelią: transportas, sandėliavimas ir pakuotė joje nevaizduojami, nors realiame gyvenime jie yra. Popierius gali būti daromas ir iš perdirbto popieriaus bei šiaudų, stiklas — iš perdirbto stiklo, plastikas — ir iš augalų; modelis rodo dažniausią kelią, o ne vienintelį, ir to neslepia. Modelis taip pat nevaizduoja, **kiek** išteklių ar laiko reikia — tai tausojimo klausimas, kurį ideatorius sąmoningai paliko atskiram moduliui („Kaip tausoti daiktus klasėje?“), nes tai antra sąvoka (T1.2). Grandinės pabaiga yra **vieta** (miškas, smėlis), ne medžiaga: mediena dar nėra gamta, o ąžuolas — gamta. Todėl modelis niekada nenustoja ties „mediena“ ir neteikia jai „GAMTA“ žymos.

**Ką tai reiškia modulio autoriui.** `title` — „Kas sukūrė šį daiktą: kelias iki gamtos“ (39 simboliai iš 42); `subtitle` — „Popierius prasideda miške, o stiklinė — smėlyje“ (47 iš 80); `minutes` — 9; trys `outcomes`: „Nurodau, iš ko padarytas daiktas.“ (33), „Nustatau, kur prasideda daikto kelias gamtoje.“ (46), „Paaiškinu, kodėl parduotuvė yra kelio gale, o ne pradžioje.“ (59); `concept.title` — „Daiktas prasideda gamtoje“ (25 iš 40); `concept.big_idea` — „Popierius prasideda ąžuole, stiklinė — smėlyje. Kiekvienas daiktas turi kelią iki gamtos. Parduotuvė yra to kelio gale, o ne pradžioje.“ (135 iš 240); `concept.steps` — keturi žingsniai iš sekos 1–4 (38–58 simboliai); `concept.example` — „Popieriaus lapas guli parduotuvėje. Jo kelias: ąžuolas, mediena, popierius.“; `teacher.goal` — „Suprasti, kad kiekvienas daiktas prasideda gamtoje. Popierius prasideda ąžuole, o stiklinė — smėlyje. Modelis leidžia vaikui pačiam statyti grandinę atgal. Netinkamas šaltinis grandinės nebaigia.“; `teacher.offline` — trys realūs daiktai ir trys kortelės, dėliojimas prie lapo ir stiklinės, tada kortelių eilė ir kelias balsu; `teacher.misconceptions` — trys nuostatos iš šio skyriaus; `sim` — `{ "component": "daikto-grandine", "config": { … } }` (įrašytas aukščiau). Numeris `21-` laisvas (pasaulio pažinime yra 08–10 ir 16–20). Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/index.json` ir `path.json` (kūrėjo ar dizainerio darbas, ne metodo dalis); siūloma vieta kelyje — po `20-kas-gyvas`: ten vaikas jau atskyrė gyvą nuo negyvo, o čia klausiama, iš ko padarytas negyvas daiktas, ir prieš `02-medziagu-bandymas`, kuris sprendžia tinkamumą, o ne kilmę.

**Ideatoriaus grandinės taisymas.** Pasiūlyme rašoma „ąžuolas → **lenta** → popierius“. Lenta nėra popieriaus žaliava: popierius daromas iš medienos plaušų (celiuliozės), o lenta — išpjauta mediena baldams ir statybai. Todėl modelyje vidurinė kortelė vadinama **mediena**, ne lenta; kitaip modelis mokytų neteisingo tarpinio žingsnio, o vaikas, paklaustas „iš ko padaryta lenta?“, negautų atsakymo grandinėje (LL-34: sąvoka, kurios modelyje nebėra, neturi likti kitur). Antra, pasiūlyme grandinė baigiama „gamta“ kaip bendra sąvoka; modelis reikalauja **konkrečios vietos** (miškas, smėlis), nes „gamta“ 6–7 metų vaikui dažnai reiškia tik mišką — būtent tą nuostatą ir reikia paneigti.

**Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, Gamtos mokslai, 1 klasės ilgalaikio plano pavyzdys — 26.3.1 „Gamtos ištekliai, jų tarša ir tausojimas“ (2 val.), veikla „Kas sukūrė šį daiktą?“ (`sources/pradinio-bp-rekomendacijos-2024.txt:17649–17656`), integracijos lentelė (`:8452–8458`). Anderson, J. L., Ellis, J. P., & Jones, A. M. (2014). Understanding early elementary children's conceptual knowledge of plant structure and function through drawings. *CBE—Life Sciences Education, 13*(3), 375–386. https://doi.org/10.1187/cbe.13-12-0230 (n = 182, K–1; telefono stulpai 11 % / 15 %, popierius 20 % / 13 % — Table 6; „from the telephone company“ ir 89 % / 85 %, 80 % / 87 % — Results). Bjørgen, K., Moe, B., Wold, P.-A., & Melis, C. (2023). Children's knowledge about the origins of food in early childhood education and care institutions (ECEC) in Norway. *Education 3-13, 51*(7), 1118–1129. https://doi.org/10.1080/03004279.2022.2049839 (n = 56, 5–6 m.; pienas 94 %, mėsa 79 %, duona 67 %, miltai 67 %, sūris 30 %, makaronai 30 %, dešra 33 %). Joshi, A., Azuma, A. M., & Feenstra, G. (2008). Do farm-to-school programs make a difference? Findings and future research needs. *Journal of Hunger & Environmental Nutrition, 3*(2–3), 229–246. https://doi.org/10.1080/19320240802244025 (kortelių sekos vertinimas 12 % → 52 % — apžvalgoje cituojamas programos vertinimas, ne šio straipsnio eksperimentas).

**Pastaba dėl wiki.** `research/wiki/curriculum/pasaulio-pazinimas-1-klase.md:82–88` temų lentelėje 26.3.1 nėra, nors ilgalaikiame plane ji yra su 2 valandomis; lentelė pati tai žymi `[PATIKRINTI]`. Tai tyrėjo failas, šiame darbe neliestas. `agents/scope.py` temų sąraše „Gamtos ištekliai“ taip pat dar nerodoma kaip padengta — tai programos derintojo ir tyrėjo darbas, ne metodo.

### M-10 — Medžiai, krūmai, žolės: grupę rodo stiebas, o ne aukštis

**Data:** 2026-11-16 · **Tema:** `agents/proposals/2026-11-16-ideator-medziai-krumai-zoles.json` (#19399) · **Tikslas:** `content/lt/grade-01/pasaulio-pazinimas/22-medziai-krumai-zoles.json` · **Šaltinis:** [[../../foundations/pozymis-ir-dydis|pozymis-ir-dydis]]

**Viena didelė idėja.** Augalo grupę pasako jo stiebas: medis turi vieną sumedėjusį kamieną, krūmas — kelis sumedėjusius stiebus nuo žemės, žolė — minkštą stiebą. Aukštis apie grupę nieko nesako: mažas ąžuoliukas jau yra medis, o aukšta alyva tebėra krūmas.

**Ką sako programa.** 1 klasės gamtos mokslų programoje 26.2.3 formuluotė yra pažodinė: „Mokomasi skirti medžius, krūmus ir žoles, atpažinti artimiausius aplinkos medžius (klevą, ąžuolą, beržą, eglę, pušį ir 3−4 kitus iš savo aplinkos)“ (`sources/pradinio-bp-rekomendacijos-2024.txt:35165–35166`). Ilgalaikiame plane tai 4 valandos tiriamosios veiklos — ekskursija į mokyklos kiemą, parką ar mišką, tyrimas „Medžių lapų tyrimas“ (`:17641–17643`), o metų pabaigos reikalavimas tą patį kartoja: „Skiria medžius, krūmus ir žoles“ (`research/wiki/curriculum/pasaulio-pazinimas-1-klase.md:124`). Platformoje šios temos nėra: paieška „krūm|žol[ėe]|kamien“ visuose 39 moduliuose duoda **0 atvejų** (patikrinta 2026-11-16), o artimiausias modulis `09-augalo-gyvenimas` kalba apie tai, ko augalui reikia, ne apie grupes.

**Kodėl modelis, o ne paveikslėlis.** Paveikslėlyje augalas turi vieną aukštį, todėl jis negali parodyti to, kas ir yra sąvoka: kad aukštis grupės nekeičia. Net du paveikslai greta to neįrodo — vaikas neturi būdo patikrinti, ar antrame paveiksle augalas tas pats. Modelyje augalas lieka tas pats (jo stiebas neperpiešiamas), keičiasi tik vienas skaičius — aukštis, o grupės etiketė nejuda nė karto. Tada vaikas pereina prie antro augalo ir pamato priešingą porą: aukštesnis augalas, o grupė „žemesnė“. Tai kontrolinis bandymas, kurio paveikslėlis negali duoti, ir jis atliekamas vienu paspaudimu.

**Ką rodo tyrimai.**

Gatt, Tunnicliffe, Borg ir Lautier (2007) individualiai kalbino 50 Maltos vaikų (25 — antri ikimokyklinio ugdymo metai, 4 m.; 25 — pirmi privalomojo ugdymo metai, 5 m.) apie augalus. Vaikų sąvoka pasirodė siaura: „augalas“ jiems reiškė **mažą** augalą su **plonu stiebu**, lapais ir žiedu. Medžiai, kaktusai ir dilgėlės į „augalo“ kategoriją nepateko. Tai tiksli tos nuostatos formuluotė, kurią turi griauti modelis: grupę lemia ne stiebo sandara, o **įprastas mažo augalo pavyzdys**.

Tull (1992) ištyrė devynis šeštos klasės vaikus (11–12 m.) JAV ir klausė, kaip jie skiria medį nuo krūmo. Vaikų kriterijai buvo formos ir dydžio: „A bush is smaller (than a tree), more in a round shape with more leaves“, „Adults are usually taller than bushes. Trees are usually taller than adults“, „If it was a tree, you could definitely see the trunk“. Autoriaus išvada: vaikų kategorijos nesutampa su botanikų, bet sutampa su **liaudies** kategorijomis, o jose aukštis yra vienas iš požymių (per Tull cituojamas Brown, 1984: *tree* — dideli sumedėję augalai, *bush* — „intermediate height“). Tai svarbu dviem būdais: ji patvirtina, kad aukštis yra realus vaiko kriterijus, ir įspėja, kad jis nėra vien vaiko išmislas — ta pati logika gyva ir suaugusiųjų kalboje. Todėl modelis savo taisyklės nepateikia kaip „vienintelės tiesos apie gamtą“ (žr. „Modelio ribos“).

Tunnicliffe ir Reiss (2000) pateikė 5, 8, 10 ir 14 metų mokiniams šešis augalų pavyzdžius ir klausė, kas jie tokie. Visų amžiaus grupių mokiniai augalus įvardijo ir aiškino daugiausia pagal **anatominius** požymius, o su amžiumi prisidėjo buveinės požymiai. Išvada modeliui: vaikas jau žiūri į augalo sandarą, tad nereikia jo mokyti „žiūrėti į augalą“ — reikia, kad apibrėžiamasis požymis (stiebų skaičius ir kietumas) būtų **ryškesnis už aukštį**, kitaip jis rinksis tai, kas labiau krinta į akis.

**Klaidingos nuostatos ir kaip jos paneigiamos.**

1. **„Krūmas yra mažas medis.“** Tai ta pati prototipo taisyklė, kurią fiksuoja Gatt ir kt. (2007) ir Tull (1992). Paneigiama alyva: ji užauginama iki 2,5 m — aukštesnė už mažą ąžuoliuką, — o grupės etiketė lieka „krūmas“, nes stiebai buvo ir lieka keli. Jei grupę lemtų aukštis, etiketė būtų pasikeitusi.
2. **„Žolė yra bet kas žema ir žalia.“** Paneigiama ąžuoliuku: 0,3 m aukščio daigas turi vieną sumedėjusį kamieną, todėl jis medis. Žema ir žalia yra ir jis.
3. **„Aukštis yra geras požymis, nes jį galima pamatuoti.“** Modelis tyčia duoda aukščiui atskirą matuoklį — juostą su padalomis, nes skaičius turi būti matomas sąžiningai (`foundations/dydis-ir-skaicius.md` analogija). Bet ta juosta niekada neliečia etiketės: ji ilgėja, o grupė nejuda. Paneigiama ne tekstu, o tuo, kad vienintelis kintantis matmuo prie etiketės neprisijungia.
4. **„Grupę rodo lapai ar žiedas.“** Šios nuostatos modelis ekrane nepaneigia ir to neslepia: lapai ir žiedai yra nepastovus požymis (Dougherty 1979 ir Tull 1992 jį vadina *unstable criteria* — žiedas nukrinta, lapai iškrinta). Ji sprendžiama trečia užduotimi apie žiemą ir mokytojo veikla, o ne simuliacija.

**Tikslas sąmoningai kuklus.** Modulis nemoko atpažinti rūšių: programos gairė tam reikalauja realių nuotraukų, o ne iliustracijų (`research/wiki/curriculum/pasaulio-pazinimas-1-klase.md:140`), todėl klevas, beržas, eglė ir pušis lieka mokytojo ekskursijai su tikrais lapais (T8.3 — veikla be ekrano). Modulis siekia vieno įgūdžio: **pažiūrėti, kiek stiebų kyla iš žemės ir ar jie kieti**, ir tuo pasitikrinti, kai aukštis klaidina.

**Seka (konkretumas → modelis → simbolis → perkėlimas).**

1. **Kiemas, trys augalai rankoje.** Mokytojas sustabdo klasę prie medžio, krūmo ir žolės. Vaikai lietimo tvarka atsako į du klausimus: kiek stiebų kyla iš žemės ir ar stiebas kietas. Tikslas: grupės požymis pajuntamas pirštais, o ne įsimenamas iš paveikslėlio. Mokytojas nepasako, kuris augalas „tikrasis“ medis, ir neklausia, kuris aukščiausias.
2. **Ekranas, ąžuoliukas.** Ekrane ąžuoliukas, po juo — 0,3 m žyma ir aukščio juosta. Prieš pirmą judesį spėjimas: „Ąžuoliukas 30 cm. Ar jis jau medis?“ (Taip / Ne). Vaikas augina jį iki 3 m. Etiketė „medis“ lieka, o `api.note` sako: „Tu sakei: taip. Jis liko medis.“ Tikslas: pamatyti, kad aukštis pasikeitė keliolika kartų, o grupė — nulis kartų.
3. **Ekranas, alyva.** Antras augalas, antras spėjimas: „Alyva aukštesnė už mažą ąžuoliuką. Ar ji bus medis?“ Vaikas augina alyvą iki 2,5 m — ji aukštesnė už mažą ąžuoliuką, bet etiketė „krūmas“. `api.note`: „Tu sakei: taip. Alyva liko krūmas.“ Tikslas: paneigti pirmą nuostatą priešinga pora, o ne tuo pačiu pavyzdžiu.
4. **Simbolis, trys kortelės.** Trečias augalas — kiaulpienė (0,25 m, vienas minkštas stiebas). Tada po scena atsiranda trys kortelės su išsaugotais aukščiais: „ąžuoliukas 0,3 m · medis“, „alyva 2,5 m · krūmas“, „kiaulpienė 0,25 m · žolė“ ir vienas sakinys: „Grupę rodo stiebas, ne aukštis.“ Vaikas jį perskaito ir pasako, kuri kortelė jam buvo netikėčiausia. Tikslas: taisyklę įvardyti žodžiu, kai ji jau matyta tris kartus.
5. **Perkėlimas.** Tos pačios taisyklės atvejai be modelio: sode 30 cm ąžuoliukas ir 2 m alyva (kuris medis?); žiema be lapų (pagal ką skirti?); mokyklos kieme aukštas lazdynas. Tikslas: atpažinti, kad požymis lieka ir tada, kai aukštis ar lapai klaidina.

**Privalomas spėjimo žingsnis prieš pirmą auginimą ir prieš antrą augalą.** Du spėjimai, abu palyginami su įvykiu (LL-15). Spėjimas niekada nevadinamas klaida ir niekada neištrinamas: jis lieka matomas viršuje, o `api.note` tik palygina. Be jo modelis virsta auginimo žaislu: vaikas spaudžia „+“ tol, kol juosta prisipildo, ir sąryšio nepastebi — tas pats pavojus kaip M-01–M-09 (`foundations/sujungti-dydziai.md`). Atsakymo variantų spėjime yra tik du (Taip / Ne), nes spėjimas turi būti apie **vieną** pasikeitimą, o ne apie grupę.

**Simuliacijos specifikacija.** Komponentas `augalu-grupes`, failas `assets/js/sims/pasaulis.js` (jis jau importuoja `art.js`, o `scripts/check_art.py:31–33` LEGACY sąraše yra tik `matematika.js`). Registracija: `SIMS` sąraše (`assets/js/sims/pasaulis.js:2563–2572`) pridedama eilutė `"augalu-grupes": augaluGrupes,`. `config`:

```json
{ "plants": [
    { "id": "azuoliukas", "name": "ąžuoliukas", "stems": 1, "woody": true,
      "height": { "start": 30, "min": 30, "max": 300, "step": 10 } },
    { "id": "alyva",     "name": "alyva",     "stems": 3, "woody": true,
      "height": { "start": 120, "min": 40, "max": 250, "step": 10 } },
    { "id": "kiaulpiene", "name": "kiaulpienė", "stems": 1, "woody": false,
      "height": { "start": 25, "min": 10, "max": 40, "step": 5 } } ],
  "groups": {
    "medis":  { "name": "medis",  "plural": "medžiai" },
    "krūmas": { "name": "krūmas", "plural": "krūmai" },
    "žolė":   { "name": "žolė",   "plural": "žolės" } },
  "heightBar": { "maxCm": 300, "tickCm": 50 },
  "sentences": { "start": "…", "guess": "…", "grow": "…", "one": "…", "few": "…",
                 "soft": "…", "all": "…", "rule": "…", "again": "…",
                 "compareMedis": "…", "compareNeMedis": "…",
                 "compareAlyvaTaip": "…", "compareAlyvaNe": "…" } }
```

**Grupė išvedama, o ne įrašyta.** `config.plants[]` sąmoningai neturi `group` laukelio: etiketė apskaičiuojama `groupOf(p) = p.woody ? (p.stems === 1 ? "medis" : "krūmas") : "žolė"`. Jei `stems` nėra sveikas teigiamas skaičius arba `woody` nėra loginis, komponentas rašo `console.error` ir rodo „Augalai nesuderinti su grupėmis.“, o ne tyliai praleidžia. Tai ta pati taisyklė kaip M-07 (`kiekis = board.px / unit.px`) ir M-09 (grandinė — duomenys): modelio teiginys turi būti išvestas iš tų pačių duomenų, kuriuos mato vaikas.

| Būsena | Ką vaikas mato | `readout` | `api.note` |
|---|---|---|---|
| pradžia | ąžuoliukas, juosta ties 0,3 m, spėjimo mygtukai aktyvūs, „+“ neaktyvus | „Ąžuoliukas 30 cm. Ar jis jau medis?“ | „Pirma spėk, tada augink.“ |
| spėjimas | spėjimas kortelėje virš scenos, „+“ aktyvus | „Tu sakei: taip. Dabar keisk aukštį.“ | „Spėjimas liks viršuje iki galo.“ |
| ąžuoliukas 1,5 m | juosta ilgesnė, kamienas vienas, etiketė „medis“ | „Ąžuoliukas 1,5 m. Tai medis.“ | „Aukštis didesnis, o stiebas tas pats.“ |
| ąžuoliukas 3 m | juosta iki galo, etiketė ta pati | „Ąžuoliukas 3 m. Tai medis.“ | „Tu sakei: taip. Jis liko medis.“ |
| alyva, spėjimas dar nepasirinktas | alyva, trys stiebai nuo žemės, 1,2 m | „Alyva aukštesnė už mažą ąžuoliuką. Ar ji bus medis?“ | „Pasirink: taip arba ne.“ |
| alyva 2,5 m | juosta ilgesnė už mažo ąžuoliuko, etiketė „krūmas“ | „Alyva 2,5 m. Tai krūmas.“ | „Tu sakei: taip. Alyva liko krūmas.“ |
| kiaulpienė 0,25 m | vienas minkštas stiebas, žiedas | „Kiaulpienė 25 cm. Tai žolė.“ | „Minkštas stiebas, todėl žolė.“ |
| visi trys auginti | trys kortelės su aukščiais ir grupėmis | „Trys augalai, trys grupės.“ | „Grupę rodo stiebas, ne aukštis.“ |
| „Iš naujo“ | pradinė būsena, spėjimai neištrinti, augalų aukščiai atstatyti | „Pradedam iš naujo.“ | „Gali bandyti dar kartą.“ |

Dešimt savybių, kurių negalima praleisti (kiekviena atitinka pamoką):

- **Vienas kintamasis:** `height` — dabartinio augalo aukštis centimetrais. Augalo pasirinkimas yra žingsnis, o ne antras kintamasis: keičiant augalą aukštis nekeičiamas tuo pačiu metu, o kiekvienas augalas **atsimena savo paskutinį aukštį** (grįžus atgal būsena grąžinama ta pati, o ne `start` — LL-16 atmaina).
- **Augalas neperpiešiamas keičiant aukštį:** stiebas, lapai ir žiedas įterpiami vieną kartą `mount()`, o keičiant aukštį keičiasi tik juostos ilgis, skaičius ir (kai pasiekiama riba) mygtukų būsena. `getBBox()` visų trijų augalų piešinių nesikeičia nė vienu tašku.
- **Aukščio juosta:** 0–300 cm, 1 px už centimetrą (300 px), žymos kas 50 cm, užrašas visada su vienetu („0,3 m“, „1,2 m“, „2,5 m“). Juosta yra vienintelis dydžio nešėjas — žr. modelio ribas.
- **Grupės etiketė** — žodis po augalu („medis“ / „krūmas“ / „žolė“), ne spalva; ji nekinta nė vienoje aukščio būsenoje.
- **Skirtumas be spalvos:** stiebų skaičius matomas kaip trys atskiros linijos nuo žemės; kietumas — storio ir tiesumo skirtumas (`art.stem` su `droop:true` žolei) ir žodis `readout`. Spalva (ruda / žalia) yra papildoma, o ne vienintelė: Tull (1992) pastebi, kad vaikai kietumą dažnai skaito būtent iš stiebo spalvos, todėl modelis niekada nepalieka spalvos vienos.
- **Išdėstymas 360 px:** scena `viewBox="0 0 328 240"`, `width:100%`, `max-width:328px`; gruntas — `art.soil(0, 186, 328, 54, "ag-soil")`; augalo piešinys 110 px aukščio nuo `baseY = 186`; juosta x = 14–314, y = 196–212; trys augalų mygtukai 100 × 56 px + du 8 px tarpai = 316 px; „+“ ir „−“ po 156 × 56 px; „Iš naujo“ 328 × 48 px. Jokio horizontalaus slinkimo.
- **Įėjimai ir klaviatūra:** `Tab` tarp augalų ir „+“/„−“, `Enter`/`Space` aktyvuoja, `←`/`→` perjungia augalus, `↑`/`↓` keičia aukštį, `R` atstato. Visi taikiniai ≥ 48 px, visi turi `aria-label` („Alyva, 1,2 metro, krūmas. Padidink aukštį.“).
- **Fokusas** (LL-32): po spėjimo — į „+“; pasiekus maksimumą — „+“ tampa neaktyvus, o fokusas persikelia į „−“ arba į kitą augalą; kai atsiranda kortelės — į pirmą kortelę, ne į neaktyvų mygtuką.
- **Grįžtamasis ryšys** — iškart po paspaudimo (≤ 1 kadras). `readout` įvardija būseną (aukštis + grupė), `api.note` sako **kodėl**, niekada „teisingai“ ir niekada apie vaiką (T5.1). `api.progress({ correct: true })` — vieną kartą, kai **visi trys** augalai bent kartą pasiekti savo maksimumą ir pasirodė kortelės, o ne po pirmo augalo (LL-29). „Iš naujo“ pažangos netrina (LL-16).
- **Garsas** — trylika frazių `config.sentences` (LL-42), visos trumpesnės nei 10 žodžių; `guess` naudoja vieną šabloną su `{label}` ir kiekvienas spėjimo variantas turi savo `compare*` frazę, kad nebūtų dviejų tiesų apie tą patį sakinį (LL-33). `api.note` garsiai neskaitomas. Generuojant — abu variantai (`n`, `s`); `scripts/check_audio.py` manifestas privalo matyti visas trylika.
- **Jokių laikmačių, ėjimų limito, „game over“.** Augalas neauga laiku: „+“ yra vienas žingsnis, o ne laukimas. `prefers-reduced-motion` — juosta šokinėja, o ne slenka tolygiai.

**Užduotys.**

| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
|---|---|---|---|---|---|
| 1 | atpažinimas | „Sode auga ąžuoliukas, alyva ir kiaulpienė. Kuris jų yra krūmas?“ — Ąžuoliukas / Alyva / Kiaulpienė | Alyva (1) | „Ąžuoliukas“ — mažiausias augalas laikomas krūmu | „Pažiūrėk, kiek stiebų kyla iš žemės.“ |
| 2 | taikymas | „Alyva išaugo 2,5 metro. Kuri grupė jai tinka?“ — Medžiai / Krūmai / Žolės | Krūmai (1) | „Medžiai“ — aukštis priimamas kaip grupės požymis | „Aukštis čia neklaidina. Pažiūrėk į stiebus.“ |
| 3 | perkėlimas | „Žiemą medis ir krūmas neturi lapų. Kaip juos atskirsi?“ — Pagal kamieną ir stiebų skaičių / Pagal augalo aukštį / Pagal lapų spalvą | Pagal kamieną… (0) | „Pagal augalo aukštį“ — lapų nebuvimas nieko nekeičia, o aukštis lieka vieninteliu matomu dydžiu | „Lapų žiemą nėra. Kas augale lieka visą laiką?“ |
| 4 | perkėlimas (`optional: true`) | „30 cm ąžuoliukas ir 2 m alyva. Kuris yra medis?“ — Ąžuoliukas / Alyva / Abu augalai | Ąžuoliukas (0) | „Alyva“ — aukštesnis augalas laikomas medžiu; „Abu augalai“ — abu sumedėję, tad abu medžiai | „Mažas augalas ne visada būna žolė.“ |

Atsakymų indeksai 1 / 1 / 0 / 0 — ne visi tame pačiame indekse, o pirmas ir antras sąmoningai skiriasi nuo trečio ir ketvirto (`validate_content.py` tikrina pasiskirstymą). Kiekviena užuomina nukreipia į klaidą ir nė viena nekartoja teisingo varianto žodžių.

**Refleksija.** „Kaip paaiškintum, kodėl aukšta alyva yra krūmas?“ Klausiama žodžiu, nevertinama; laukiamas atsakymas — kad stiebai keli ir jie sumedėję, o aukštis apie tai nieko nesako.

**Modelio ribos (pasakomos vaikui ir mokytojui).**

1. **Piešinys schemiškas.** Visi trys augalai piešiami vienodo 110 px aukščio, nors tikras jų aukštis skiriasi iki šimto kartų. Tai ne aplaidumas: 3 m medis ir 20 cm žolė tame pačiame 180 px aukščio kadre negali būti vienodo mastelio ir įskaitomi abu. Todėl aukštį neša **juosta ir skaičius su vienetu**, o ne piešinio dydis. Modelis tai sako vienu sakiniu, o ne slepia.
2. **Praktinė taisyklė, ne gamtos apibrėžimas.** Botanikoje skiriamoji linija yra sumedėjęs ar žolinis stiebas, o medis nuo krūmo skiriasi tuo, ar stiebas vienas. Bet Tull (1992), remdamasis Kempton (1981) ir Rosch bei Mervis (1975), rodo, kad liaudies kategorijos remiasi **prototipu**, ne būtinomis ir pakankamomis sąlygomis, ir kad „medis“ negali būti apibrėžtas vien „mediena ir vienu aukštu kamienu“. Todėl gyvenime pasitaiko augalų, kurie lieka tarp grupių: nupjautas ąžuolas iš kelmo išleidžia kelis stiebus, kai kurios rūšys natūraliai auga keliastiebės. Modelis tokių atvejų nevaizduoja ir neslepia — jie aptariami mokytojo bloke.
3. **Kasdienė kalba aukštį vartoja.** Suaugusieji 30 cm ąžuoliuką gali pavadinti „daigeliu“, o 2 m alyvą — „medeliu“, ir tai nėra klaida, o kitas žodynas. Modelis neigia ne kasdienę kalbą, o **sprendimą pagal aukštį ten, kur grupė turi būti nustatyta pagal stiebą**. Todėl užduotys klausia „kuri grupė“, o ne „ar taip sakoma“.
4. **Žolė ≠ veja.** Programos terminas „žolės“ reiškia žolinius augalus (kiaulpienė, dobilas), o ne veją. Tai pasakoma mokytojo bloke, nes žodis kasdienėje kalboje turi antrą reikšmę.
5. **Rūšių atpažinimas ne šio modelio dalis.** Klevas, ąžuolas, beržas, eglė ir pušis reikalauja realių lapų ar nuotraukų (`pasaulio-pazinimas-1-klase.md:140`), todėl modelis vartoja tik tris augalus, kurių grupė akivaizdi, ir nepretenduoja mokyti rūšių.

**Ką tai reiškia modulio autoriui.** `title` — „Medžiai, krūmai, žolės: grupę rodo stiebas“ (42 simboliai iš 42); `subtitle` — „Aukštis klaidina: grupę pasako stiebas“ (38 iš 80); `minutes` — 9; trys `outcomes`: „Skiriu medį, krūmą ir žolę pagal stiebą.“, „Paaiškinu, kodėl aukštas augalas gali būti krūmas.“, „Pasakau, kiek stiebų kyla iš žemės.“; `concept.title` — „Grupę rodo stiebas“ (18 iš 40); `concept.big_idea` — „Medis turi vieną sumedėjusį kamieną. Krūmas turi kelis stiebus nuo žemės. Žolės stiebas minkštas. Aukštis apie grupę nieko nesako.“ (130 iš 240); `concept.steps` — keturi žingsniai iš sekos 2–4; `concept.example` — „Kieme auga mažas ąžuoliukas ir aukšta alyva. Mažesnis augalas yra medis.“; `teacher.goal` — „Suprasti, kad augalo grupę rodo stiebas, o ne aukštis. Modelis laiko vieną augalą ir keičia tik aukštį, todėl grupės etiketė nejuda.“; `teacher.prompt` — „Kodėl mažas ąžuoliukas yra medis, o aukšta alyva – krūmas?“; `teacher.offline` — „Kieme vaikai liečia tris augalus: medžio kamieną, krūmo stiebus ir žolės stiebą. Kiekvienas pasako, kiek stiebų kyla iš žemės ir ar stiebas kietas.“; `teacher.misconceptions` — keturios nuostatos iš šio skyriaus (ketvirtoji įrašoma kaip modelio riba, ne kaip klaida); `sim` — `{ "component": "augalu-grupes", "config": { … } }`. Numeris `22-` laisvas (pasaulio pažinime užimti 08, 09, 10, 16, 17, 18, 19, 20; `21-` rezervuotas M-09 pasiūlymui `21-kas-sukure-daikta`, kurio `index.json` dar neturi). Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/index.json` ir `path.json` (kūrėjo arba dizainerio darbas, ne metodo dalis); siūloma vieta kelyje — po `20-kas-gyvas`: ten vaikas jau atskyrė gyvą nuo negyvo, o čia klausiama, kokia tvarka tie gyvieji augalai skirstomi.

**Patikra tikru įrankiu (2026-11-16).** Šio metodo specifikacija surašyta kaip juodraštinis modulis ir paleisti abu vartai: `validate_content.check_module` → **0 klaidų, 0 įspėjimų** (su sąlyga, kad `augalu-grupes` įrašytas registre — kol komponento nėra, validatorius teisingai meta „simuliacija neegzistuoja registre“), `check_language.check_module` → **0 klaidų, 0 įspėjimų, 0 pastabų**. Lauko ilgiai perskaičiuoti, ne apskaičiuoti mintyse: title 42, subtitle 38, concept.title 18, big_idea 130. Vienintelis pataisymas per zondą: klausimas „Pagal ką juos atskirsi?“ davė `neaiškus klausimas`, nes `check_language.py` klausiamųjų žodžių sąraše neturi „pagal ką“; sakinys pakeistas į „Kaip juos atskirsi?“ (prasmė ta pati), o žodyno spraga įrašyta kaip pamoka LL-97, o ne tylėta.

**Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, Gamtos mokslai — 26.2.3 „Augalai“ (`sources/pradinio-bp-rekomendacijos-2024.txt:35165–35166`), 1 klasės ilgalaikis planas (`:17641–17643`). Gatt, S., Tunnicliffe, S. D., Borg, K., & Lautier, K. (2007). Young Maltese children's ideas about plants. *Journal of Biological Education, 41*(3), 117–122. https://doi.org/10.1080/00219266.2007.9656080 · Tunnicliffe, S. D., & Reiss, M. J. (2000). Building a model of the environment: how do children see plants? *Journal of Biological Education, 34*(4), 172–177. https://doi.org/10.1080/00219266.2000.9655714 · Tull, D. (1992). *Social constructivism: Botanical classification schemes of elementary school children* (AERA 1992; ERIC ED357968). https://eric.ed.gov/?id=ED357968

**Pastaba dėl pasiūlymo.** Ideatorius siūlė **du nepriklausomus dydžius** — aukštį ir kamienų skaičių — ir leisti vaikui keisti abu. Metodas to atsisako dėl vieno kintamojo taisyklės (`foundations/kognityvine-apkrova.md`): du slankikliai tame pačiame kadre 6–7 m. vaikui reiškia, kad niekada neaišku, kuris iš jų ką paveikė. Palyginimas neprarastas: trys augalai turi fiksuotą stiebų skaičių, o aukštį vaikas keičia pats, todėl priešingos poros (mažas medis, aukštas krūmas) gaunamos vienu kintamuoju. Antra, pasiūlyme užduotis su „Abu augalai“ buvo teisinga; čia ji tapo **klaidingu variantu**, nes abu augalai sumedėję, o grupę skiria stiebų skaičius — tai ta pati nuostata, kurią fiksuoja Gatt ir kt. (2007) ir Tull (1992), ir ji turi būti atpažįstama kaip klaida, o ne apeinama (LL-18).

**Įgyvendinta 2026-11-18 (#346, pasiūlymas #19399).** Modulis `22-medziai-krumai-zoles` ir komponentas `augalu-grupes` (`assets/js/sims/pasaulis.js`) atitinka M-10 seką, bet trys sprendimai sąmoningai kitokie, ir kiekvienas turi priežastį:

1. **Žingsnis 30 cm, ne 10.** Su 10 cm žingsniu ąžuoliukas nuo 0,3 m iki 3 m auga 27 paspaudimus, alyva — 13; 6–7 m. vaikui tai tampa mygtuko spaudymo pratimu, o ne bandymu (T3.3, T1.4). Su 30 cm (ąžuoliukas 9, alyva 5, kiaulpienė 3 paspaudimai) lieka ir tarpinė 1,5 m būsena, ir abi metodo poros (0,3 m medis, 2,5 m krūmas). Skaičiai 1,5 m ir 2,5 m pasiekiami be apvalinimo.
2. **Spėjimas — ne raktas, o tekstas.** `askOf` saugo `S["start"]` / `S["ask2"]` **tekstą**; pirmoji versija saugojo raktą, ir readout vaikui rodė „start“, o balsas būtų taręs tą patį raktą. Defektą pagavo naršyklės zondas (72/74), ne vartai — įrašyta kaip LL-103.
3. **`config.plants[].say` — papildomas laukas.** Metodo konfigūracija neturėjo vietos, kur augalas nurodo savo palyginimo frazę, todėl `say: { taip, ne }` saugo `sentences` raktus. Be jo palyginimas „tu sakei / liko“ būtų buvęs hardcodintas pagal indeksą. Grupė ir toliau **neįrašyta** — `groupOf(p)` išveda ją iš `stems` ir `woody`, o komponentas tikrina, kad kiekviena išvesta grupė egzistuotų `config.groups` (kitaip `console.error` ir „Augalai nesuderinti su grupėmis.“).

Elgsenos zondas (`scratch/probe_agr.py`, Chromium 390×800 ir 360×780, 37 patikros pločiui): **74/74 OK**, 0 konsolės klaidų. Matuota: ąžuoliukas 0,3 → 3 m (9 žingsniai, etiketė „medis“ visą laiką), alyva 1,2 → 2,5 m (5 žingsniai, etiketė „krūmas“), kiaulpienė 25 → 40 cm („žolė“), kortelės su trimis aukščiais ir trimis grupėmis, `simDone` atsiranda tik po trečio augalo maksimumo, „Iš naujo“ atstato aukščius ir netrina pažangos, klaviatūra (↑, →) veikia, 360 px — 0 horizontalios slinkties.

**Patikslinta 2026-11-18 (#347).** Trys neatitikimai specifikacijai, kurių nei vieni vartai nepagavo, nes kiekvienas yra „teisingas kodas, neteisinga vieta“:

1. **`sentences.grow` buvo negyvas tekstas.** Frazė „Aukštis didesnis, o stiebas tas pats.“ turėjo abu garso įrašus (manifeste „naudojama 1220 iš 1220“), bet komponentas jos niekada netarė: `api.note` eilutė buvo įrašyta tiesiai kode, o `S.grow` neliestas. Vaikas pirmą aukščio pokytį išgirsdavo tik kaip skaičių — būtent tuo metu, kai sąryšį reikia išgirsti. Dabar frazė tariama **kartą per augalą** pirmo pokyčio metu (`grownSaid[]`), o „Iš naujo“ žymą atstato; toliau nebekartojama, kad kiekvienas paspaudimas netaptų paskaita (T5.4).
2. **Kortelės atsirasdavo nematomam klaviatūros naudotojui.** Kortelės įjungiamos tame pačiame kadre, kai paskutinis augalas paauginamas; jei tuo metu buvo pasiektas maksimumas, `+` išsijungia ir fokusas (LL-32) persikelia į `−`, o naujas turinys lieka žemiau. Dabar fokusas keliamas į **pirmą kortelę** (`data-card`, `tabindex="-1"`), kai jis yra ant `+`, `−` ar `body` — tiksliai taip, kaip numato specifikacijos 831 eilutė.
3. **Trūko penktos užduoties — metodo 5 žingsnio atvejo su lazdynu.** Sekos 5 punktas numato „mokyklos kieme aukštas lazdynas“, o modulyje buvo keturios užduotys (atpažinimas, 2,5 m alyva, žiema be lapų, 30 cm ąžuoliukas). Užduotis įrašyta: „Mokyklos kieme auga aukštas lazdynas. Iš žemės kyla keli stiebai. Kuri tai grupė?“ — Medžiai / Žolės / **Krūmai** (indeksas 2). Kadangi lazdynas aukštesnis už vaiką ir už tvorą, jis kartoja tą pačią nuostatą kaip alyva, bet **naujoje situacijoje** (ne sode, o kieme, ir ne auginant, o stebint) — tai perkėlimo užduotis, kurios iki tol modulyje nebuvo. Atsakymų pasiskirstymas dabar 1 / 1 / 0 / 2 / 0.

Patikra: `scratch/probe_grow347.py` (390 px, 7 patikros — skaito `HTMLMediaElement.play` ir `speechSynthesis.speak` pėdsaką): su sena eilute **5/6** (krenta „fokusas ant pirmos kortelės“ — `agr-minus`), pataisius **7/7**. `scratch/probe_tasks347.py` (390 ir 360 px): visos 5 užduotys — klaidingas variantas duoda užuominą ir neatskleidžia atsakymo, teisingas priimamas, saugykloje `solved` ilgis 5 — **36/36**. Elgsenos zondas `scratch/probe_agr347.py` — **44/44** abiejuose pločiuose. Vartai po pataisymo: `validate_content.py --grade 1` 0 klaidų, `check_language.py --grade 1` 0 klaidų ir 0 pastabų šiam moduliui, `check_audio.py` 1220/1220, `check_art.py` rc 0, `check_registry.py --grade 1` 178 užduotys / 0 problemų, `check_docs_facts.py` 0 klaidų (README ir ARCHITEKTURA atnaujintos į 178), `check_view.py` 3 pločiai — `problems: []`, tasks 5/5, overflow 0.

### M-11 — Garso trukmė: vieną garsą tempi, kitas nutrūksta

**Data:** 2026-11-18 · **Tema:** `agents/proposals/2026-11-18-ideator-garso-trukme.json` (#21375) · **Tikslas:** `content/lt/grade-01/lietuviu-kalba/06-garso-trukme.json`

**Viena didelė idėja.** Vieną garsą gali tempti ilgai, pavyzdžiui s-s-s. Kito negali: k nutrūksta iš karto, kad ir kiek laikytum. Trukmė priklauso nuo to, kaip garsas daromas ore, o ne nuo raidės dydžio, vietos ar vardo.

**Ką sako programa.** 1 klasės lietuvių kalbos pasiekimas D.1.3.1 formuluojamas taip: „Naudodamasis pagalbine medžiaga, skiria balsius, priebalsius (nevartojant terminų), taisyklingai juos taria“ (`sources/pradinio-bp-rekomendacijos-2024.txt:39749–39752`); ilgalaikiame plane tas pats gebėjimas įvardytas „Žinos lietuvių kalbos garsinę sandarą: balsius, priebalsius, dvibalsius“ (`:14497–14500`). D.1.3.2–D.1.3.4 (dvibalsiai, balsių ilgumas, grupavimas) yra aukštesni lygiai ir į modulį neimami. Platformoje šio gebėjimo nestato nė vienas modulis: `01-garsas-ir-raide` sprendžia garsą ir raidę, `02-skiemenu-jungimas` — skiemenis ir skiemenų ribą, `03-sakinio-zodziai` — žodžius sakinyje. Garsų skyrimo kaip atskiro modelio nėra nė viename iš 39 modulių (patikrinta 2026-11-18: lietuvių kalboje 5 moduliai, 01–05).

**Kodėl modelis, o ne paveikslėlis.** Trukmė yra laike, o paveikslėlis yra vienu metu. Dvi raidės greta („s“ ir „k“) nieko nesako apie tai, ar garsą galima tempti: raidės skiriasi tik forma, o skirtumas, kurį vaikas turi išgirsti, yra ore. Paveikslėlyje galima parodyti tik pasekmę (ilga ir trumpa juosta), bet ne priežastį. Modelis duoda priežastį: vaikas laiko mygtuką, o juosta pildosi arba ne — ir tai priklauso nuo garso, o ne nuo jo pastangų. Būtent tai yra netikėta: vaikas laiko ilgiau, o niekas nepasikeičia. To jokia iliustracija neparodo, nes iliustracija neturi vaiko rankos.

**Ką rodo tyrimai.**

Ehri, Nunes, Willows, Schuster, Yaghoub-Zadeh ir Shanahan (2001), apibendrinę Nacionalinės skaitymo komisijos 52 tyrimus, rodo, kad fonologinio sąmoningumo mokymas turi teigiamą poveikį skaitymo įgūdžiui, ir kad poveikis didesnis tada, kai vaikas su garsais **dirba** (skiria, jungia, išima), o ne tik klausosi paaiškinimo. Tai pagrindžia P2 (veiksmas prieš paaiškinimą) ir tai, kad modelis turi reikalauti vaiko veiksmo, o ne rodyti filmuką.

Liberman, Shankweiler, Fischer ir Carter (1974) parodė, kad 4–6 m. vaikams skiemens skyrimas sekasi gerokai lengviau negu garso (fonemos) skyrimas, o pastarasis net šešiamečiams kelia didelių sunkumų. Išvada metodui: garsas neturi būti prašomas „iš ausies“ vienas — reikia išorinės atsparos, kuri laikytų garsą ilgiau, negu jis skamba kalboje. Šiame metode ta atspara yra juosta ir vaiko paties balsas.

Stahl ir Murray (1994) parodė, kad fonologinis sąmoningumas nėra vienas įgūdis: užduotys skiriasi pagal kalbinį vienetą (skiemuo, pradžia–rimas, garsas), ir būtent garsų lygmuo yra sunkiausias. Todėl modulyje nėra nei skiemenų skaičiavimo, nei dvibalsių: jie jau turi savo modulius ir tame pačiame kadre sudarytų antrą sunkumo šuolį (`foundations/kognityvine-apkrova.md`).

**Klaidingos nuostatos ir kaip jos paneigiamos.**

1. **„Jei garsą galiu pasakyti, galiu jį ir ištempti.“** Paneigiama pačiu modeliu: vaikas laiko „k“ ilgiau už „s“, o juosta vis tiek sustoja po pirmo langelio. Skirtumas matomas kaip tas pats veiksmas su skirtingu rezultatu.
2. **„Tempiasi tik balsiai.“** Tai antra, tylesnė nuostata, kuri atsiranda iškart po pirmos. Modelis turi priešpavyzdžių: s, š, m tęsiasi, nors jos nėra balsiai. Todėl dvi eilės nėra „balsiai / priebalsiai“ — jos yra „tempiasi / nutrūksta“, ir ši skirtis vaikui pasakoma tik tiek, kiek reikia (D.1.3.1 — be terminų).
3. **„Ilgesnis užrašas reiškia ilgesnį garsą.“** Raidės vardas („es“, „ka“) yra ilgesnis už patį garsą, o raidės dydis nieko nesako. Modelis niekada netaria raidės vardo, o juostos ilgį sieja su garsu, ne su plytelės užrašu.
4. **„Jei garsas kartojasi, jis tęsiasi.“** k-k-k skamba ilgai, bet tai keli atskiri garsai. Modelio juosta tokį bandymą rodo kaip kelis langelius su tarpais, o ne kaip vieną ištisinę liniją (LL-28 — priešpavyzdys tame pačiame kadre).

**Ko modulis sąmoningai nemoko.** Terminai „balsis“ ir „priebalsis“ vaikui nevartojami — to reikalauja pati programos formuluotė („nevartojant terminų“). Jie lieka `teacher.goal` ir `teacher.misconceptions`, kad mokytojas žinotų, prie ko veda šis modelis. Modulis taip pat nemoko balsių ilgumo (D.1.3.3) ir dvibalsių (D.1.3.2–D.1.3.4).

**Seka (konkretumas → modelis → simbolis → perkėlimas).**

1. **Popieriaus juostelė prie lūpų.** Vaikas laiko siaurą popieriaus juostelę prieš lūpas ir sako s-s-s, tada k-k-k. Juostelė plazda tolygiai arba tik trūkteli. Tikslas: skirtumą pajusti oru, o ne išgirsti iš mokytojo. Mokytojas neįvardija grupių ir nepasako, kuris garsas „ilgas“.
2. **Ekranas, garsas ir juosta.** Vaikas pasirenka plytelę ir laiko didelį mygtuką. Juosta pildosi langeliais tol, kol laikoma — bet tik tiek, kiek leidžia garsas. Prieš pirmą bandymą spėjimas: „Ar juosta prisipildys iki galo?“ (Taip / Ne). Tikslas: pamatyti, kad rezultatas priklauso nuo garso, o ne nuo laikymo trukmės.
3. **Antras garsas iš kitos grupės.** Vaikas būtinai bando bent po vieną garsą iš abiejų grupių; po antro bandymo abi juostos lieka ekrane viena virš kitos. `api.note`: „Abi laikei vienodai. Juostos skiriasi.“ Tikslas: palyginimas vienu metu, o ne iš atminties.
4. **Simbolis, dvi eilės.** Atsiranda dvi dėžės („Ilgas garsas“ / „Trumpas garsas“), o plytelės neša savo juostas. Vaikas padeda visas aštuonias, tada spaudžia „Palygink“. Tikslas: taisyklę pasakyti savais žodžiais, kai ji jau matyta aštuonis kartus.
5. **Perkėlimas.** Tie patys garsai žodžio pradžioje: sssaulė, mmmama, k-k-katė. Vaikas tempia pirmą garsą ir pasako, ar pavyksta. Tikslas: ta pati savybė toje vietoje, kur ji bus naudojama skaitant — žodžio pradžioje.

**Privalomas spėjimo žingsnis prieš pirmą bandymą.** Vienas spėjimas apie **vieną** pasekmę (juosta pilna / ne), palyginamas su įvykiu (LL-15). Spėjimas niekada nevadinamas klaida ir lieka matomas virš juostos. Be jo modelis virsta judesiu: vaikas laiko mygtuką ir žiūri, kaip kažkas pildosi, o sąryšio su garsu nepastebi.

**Simuliacijos specifikacija.** Komponentas `garso-juosta`, failas `assets/js/sims/calba.js` (jis jau importuoja `art.js`, o `scripts/check_art.py` LEGACY sąraše yra tik `matematika.js`). Registracija: `SIMS` bloke (`assets/js/sims/calba.js:911–915`) pridedama eilutė `"garso-juosta": garsoJuosta,`. `config`:

```json
{ "sounds": [
    { "label": "a", "stretch": true },  { "label": "s", "stretch": true },
    { "label": "š", "stretch": true },  { "label": "m", "stretch": true },
    { "label": "k", "stretch": false }, { "label": "p", "stretch": false },
    { "label": "t", "stretch": false }, { "label": "b", "stretch": false } ],
  "sentences": { "start": "…", "hold": "…", "long": "…", "short": "…",
                 "gap": "…", "sort": "…", "compare": "…" } }
```

**Juostos ilgis išvedamas, o ne įrašytas.** `config.sounds[]` sąmoningai neturi `cells` laukelio: `cells(sound) = sound.stretch ? 8 : 1`. Jei `stretch` nėra loginis arba `label` tuščias, komponentas rašo `console.error` ir rodo „Garsai nesuderinti.“, o ne tyliai praleidžia plytelę. Tai ta pati taisyklė kaip M-07 (`kiekis = board.px / unit.px`) ir M-10 (`groupOf(p)`): teiginys ekrane turi būti išvestas iš tų pačių duomenų, kuriuos mato vaikas.

| Būsena | Ką vaikas mato | `readout` | `api.note` |
|---|---|---|---|
| pradžia | 8 plytelės, tuščia juosta, mygtukas „Tark ir laikyk“, spėjimas | „Pasirink garsą.“ | „Pirmiausia pasirink vieną garsą.“ |
| tęsiamas, laikoma | juosta pildosi langeliais | „Laikai. Garsas teka.“ | „Tark sss ir nepaliauk.“ |
| tęsiamas, paleista | 8 langeliai, ištisinė linija | „Juosta pilna. Garsas vienas.“ | „Šį garsą gali tempti kiek nori.“ |
| nutrūkstantis, laikoma | 1 langelis ir tuščia vieta, po juo trūkinė linija | „Juosta sustojo.“ | „Laikai ilgiau, o garsas nesitęsia.“ |
| nutrūkstantis, paleista | 1 langelis, po juo pauzės žymė | „Vienas trumpas garsas.“ | „Girdi k, o ne kyyy.“ |
| rūšiavimas | dvi dėžės, plytelės su savo juostomis | „Padėk plyteles į dvi eiles.“ | „Sprendk pagal savo juostas.“ |
| palyginimas | plytelė ne savo eilėje pažymėta žodžiu | „Dvi plytelės ne toje eilėje.“ | „Pažiūrėk į jų juostas.“ |
| „Iš naujo“ | juostos išlieka, eilės tuščios | „Pradedam iš naujo.“ | „Bandyk dar kartą.“ |

Septynios savybės, kurių negalima praleisti:

- **Vienas kintamasis:** `sound` — kuris garsas bandomas. Laikymo trukmė **nėra** kintamasis, kuris ką nors lemia: tai ir yra modelio teiginys. Vaikas gali laikyti ilgiau, o juosta nepasikeis.
- **Juosta yra laiko ašis, ne slankiklis:** 8 langeliai po 37 px, 300 px pločio, 40 px aukščio. Langeliai pildosi kas 200 ms; tai vienintelis laikmatis komponente. Jis matuoja **vaiko paspaudimą**, o ne vaiką: nėra atgalinio skaičiavimo, ėjimų limito, „per lėtai“ pranešimo.
- **Išdėstymas 360 px:** scena `viewBox="0 0 328 320"`, `max-width:328px`; plytelės 4 × 64 px su trimis 8 px tarpais (280 px); juosta 300 px, x = 14; mygtukas „Tark ir laikyk“ 328 × 56 px; dvi dėžės po 156 × 72 px; „Palygink“ 328 × 48 px. Jokio horizontalaus slinkimo; teksto 200 % atveju juosta ir plytelės lieka tos pačios, tik didėja užrašai (`min-width:0` ant tėvų).
- **Įėjimai ir klaviatūra:** `Tab` tarp plytelių ir mygtuko, `Enter`/`Space` (nuspaustas) = laikymas, `←`/`→` perjungia plyteles, `R` atstato. Vienas trumpas bakstelėjimas atlieka tą patį bandymą iki galo — vaikui, kuriam sunku laikyti; tai tas pats modelis, ne švelnesnis režimas.
- **Fokusas** (LL-32): paleidus mygtuką fokusas lieka jame ir `readout` pasikeičia; pasirinkus plytelę fokusas eina į laikymo mygtuką, o ne į neaktyvų elementą; pasirodžius dėžėms — į pirmą nepadėtą plytelę.
- **Grįžtamasis ryšys** — `readout` po paleidimo, `api.note` sako **kodėl**, niekada „teisingai“ ir niekada apie vaiką (T5.1). `api.progress({ correct: true })` — vieną kartą, kai po „Palygink“ abiejose eilėse nėra nė vienos ne vietoje esančios plytelės; ne po pirmo bandymo ir ne po pirmos teisingos plytelės (LL-29, LL-17 — tikrinama dabartinė būsena, ne praeitis). „Iš naujo“ pažangos netrina (LL-16).
- **Garsas:** tariamos tik instrukcijos (`config.sentences`, 7 frazės × 2 įrašai). **Pavieniai garsai netariami** — sąmoningai: sintezatorius „s“ perskaitytų kaip raidės vardą „es“ (t. y. būtent tą klaidą, kurią modulis griauna), o ištempto priebalsio ilgio valdyti negalima. Garsą taria vaikas; modelis matuoja jo paspaudimą, o `api.note` prašo paklausyti savęs. Visos septynios frazės trumpesnės nei 10 žodžių ir turi vieną šaltinį (LL-42, LL-33).

**Užduotys.**

| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
|---|---|---|---|---|---|
| 1 | atpažinimas | „Kurį garsą gali tempti ilgai?“ — k / a / p | a (1) | „k“ — pirmas plytelėje, nes modelis rodė jį pirmą | „Ištark garsą ir laikyk, kol baigsis oras.“ |
| 2 | taikymas | „Kas girdisi, kai ilgai tempi garsą „k“?“ — „kyyy“ — jis pridėjo balsį / „kkkk“ be pauzės / Tylą | „kyyy“ (0) | „kkkk“ — kartojimas laikomas tęsimu | „Pasakyk „k“ ilgai ir paklausyk, kas girdisi po jo.“ |
| 3 | perkėlimas | „Kuris žodis prasideda garsu, kurį galima tempti?“ — katė / mama / tėtis | mama (1) | „katė“ — pirmas žodis sąraše; „tėtis“ — painiojamas su „mama“ pagal ilgį | „Ištark pirmą garsą ir pabandyk jį pratęsti.“ |
| 4 | perkėlimas (`optional: true`) | „Kurie du garsai elgiasi vienodai?“ — š ir s / š ir t / t ir p | š ir s (0) | „t ir p“ — abu priebalsiai, todėl laikomi vienodais | „Abu išbandyk su popieriaus juostele.“ |

Atsakymų indeksai 1 / 0 / 1 / 0 — pirmas ir trečias nesutampa su antru ir ketvirtu (`validate_content.py` tikrina pasiskirstymą). Nė viena užuomina nekartoja teisingo varianto žodžių ir nė viena nepasako atsakymo.

**Refleksija.** „Kurį garsą tavo varde gali tempti ilgai? Pasakyk jį.“ Klausiama žodžiu, nevertinama; laukiamas atsakymas — vaikas randa savo vardo garsą ir jį ištempia. Tai patikrinimas be ekrano ir be balo.

**Modelio ribos (pasakomos vaikui ir mokytojui).**

1. **Modelis negirdi vaiko.** Juosta sustoja pagal garso savybę, o ne pagal tai, ką vaikas iš tikrųjų ištarė. Jei vaikas tyliai sako „k“ ir juosta vis tiek trumpa, modelis „teisus“ dėl garso, bet ne dėl to bandymo. Todėl `api.note` visada prašo paklausyti savęs, o mokytojo bloke tai įvardyta kaip modelio riba, ne kaip klaida.
2. **„Tempiasi“ yra praktinis bandymas, ne apibrėžimas.** Balsiai ir dalis priebalsių (m, n, l, r, s, š, z, ž, v, f, ch, h) tęsiasi; sprogstamieji (k, p, t, b, d, g) — ne. Tai nėra tas pats kaip „balsis / priebalsis“, ir modulyje tos dvi poros nėra tapatinamos. Mokytojui tai pasakoma atskirai, vaikui — ne.
3. **Skardumas nerodomas.** b, d, g turi balso virpėjimą, kurį galima pajusti gerklėje, bet oro srautas vis tiek sustabdomas. Modelis rodo tik oro srautą, todėl skardumas aptariamas mokytojo bloke, o ne ekrane.
4. **Afrikatos paliktos nuošalyje.** c ir č yra sudėtiniai garsai (sprogstamasis + trintis), todėl į `config` neįtraukti: jie nei „tempiasi“, nei „nutrūksta“ taip paprastai, kaip rodo modelis.
5. **Raidės vardas — ne šio modelio dalis.** „es“ ir „ka“ yra raidžių vardai; skirtumą tarp garso ir raidės sprendžia `01-garsas-ir-raide`. Šis modulis sąmoningai netaria nė vieno raidės vardo, kad nesudarytų antro klausimo tame pačiame kadre.

**Ką tai reiškia modulio autoriui.** `title` — „Ilgas garsas ir trumpas garsas“ (30 simbolių iš 42); `subtitle` — „Vienus garsus tempi ilgai, kiti nutrūksta iš karto“ (50 iš 80); `minutes` — 9; trys `outcomes`: „Išbandau garsą balsu ir pasakau, ar jį galima tempti.“ (53), „Skiriu garsus, kurie tęsiasi, nuo tų, kurie nutrūksta.“ (54), „Paaiškinu, kodėl „k“ tempti nepavyksta.“ (39); `concept.title` — „Garsas turi trukmę“ (18 iš 40); `concept.big_idea` — „Vieną garsą gali tempti ilgai, pavyzdžiui s. Kito negali: k nutrūksta. Trukmę lemia tai, kaip garsas daromas.“ (109 iš 240); `concept.steps` — keturi žingsniai; `concept.example` — „Žodyje „saulė“ pirmas garsas s: sssaulė. Žodyje „katė“ pirmas garsas k, jis nutrūksta.“; `sim` — `{ "component": "garso-juosta", "config": { … } }`. Numeris `06-` lietuvių kalboje laisvas (užimti 01–05). Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/index.json` ir `path.json` (kūrėjo arba dizainerio darbas, ne metodo dalis); siūloma vieta kelyje — **po `02-skiemenu-jungimas`**, nors failo numeris 06: ten vaikas jau skiria skiemenį, o čia atsiranda atskiras garsas skiemens viduje. `path.json` eilė neprivalo sutapti su numeriais.

**Patikra tikru įrankiu (2026-11-18).** Metodo specifikacija surašyta kaip juodraštinis modulis ir paleisti abu vartai: `validate_content.check_module` → **0 klaidų, 0 įspėjimų** (su sąlyga, kad `garso-juosta` įrašytas registre — kol komponento nėra, validatorius pagrįstai meta „simuliacija neegzistuoja registre“) ir `check_language.check_module` → **0 klaidų, 0 įspėjimų, 0 pastabų**. Ilgiai perskaičiuoti skriptu, ne mintyse: title 30, subtitle 50, concept.title 18, big_idea 109, žingsnių 52/42/41/44 simboliai (8/6/6/7 žodžiai). Zondas pagavo du realius dalykus, abu pataisyti: (1) `title` „Garsas tęsiasi arba nutrūksta“ davė `dviprasmybė: „arba“` — pakeista į „Ilgas garsas ir trumpas garsas“; (2) klausimas „Ką jis išgirsta?“ davė `neaiškus klausimas`, nes `check_language.py` klausiamųjų žodžių sąraše neturi „ką“ (ta pati LL-97 šeima) — sakinys performuluotas į „Kas girdisi, kai ilgai tempi garsą „k“?“, o ne tekstas suplokštintas.

**Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, lietuvių kalba — D.1.3.1 (`sources/pradinio-bp-rekomendacijos-2024.txt:39749–39752`), 1 klasės ilgalaikis planas (`:14497–14500`). Ehri, L. C., Nunes, S. R., Willows, D. M., Schuster, B. V., Yaghoub-Zadeh, Z., & Shanahan, T. (2001). Phonemic awareness instruction helps children learn to read: Evidence from the National Reading Panel's meta-analysis. *Reading Research Quarterly, 36*(3), 250–287. https://doi.org/10.1598/RRQ.36.3.2 · Liberman, I. Y., Shankweiler, D., Fischer, F. W., & Carter, B. (1974). Explicit syllable and phoneme segmentation in the young child. *Journal of Experimental Child Psychology, 18*(2), 201–212. https://doi.org/10.1016/0022-0965(74)90101-5 · Stahl, S. A., & Murray, B. A. (1994). Defining phonological awareness and its relationship to early reading. *Journal of Educational Psychology, 86*(2), 221–234. https://doi.org/10.1037/0022-0663.86.2.221

**Pastaba dėl pasiūlymo.** Ideatorius siūlė, kad vaikas „paspaudžia garsą žodyje ir laiko — vieno garso juosta pildosi tol, kol garsas skamba, kito sustoja per akimirką“. Metodas tą patį veiksmą palieka, bet **juostą sieja su garso savybe, o ne su tikru garso ilgiu ekrane**: platformos garsas yra iš anksto įrašyti mp3, o sintezatorius nepagamina valdomo ilgio pavienio priebalsio, todėl „kol garsas skamba“ būtų netiesa (LL-14, LL-15). Antra, pasiūlyme rūšiavimas buvo atskiras žingsnis po bandymo; čia jis lieka, bet tikrinamas **vienu kartu po visų plytelių** („Palygink“), o ne po kiekvienos — kitaip modelis tampa vertintoju, o ne įrankiu. Trečia, pasiūlymas prašė „dviejų eilių pagal spėjimą“; eilės lieka, bet jų pavadinimai yra „Ilgas garsas“ ir „Trumpas garsas“, o ne „balsiai“ ir „priebalsiai“, nes D.1.3.1 reikalauja skirti be terminų, o s ir m yra priebalsiai, kurie tęsiasi.

### M-12 — Dviženklis ir dviženklis: dešimtys prie dešimčių, vienetai prie vienetų

**Data:** 2026-11-21 · **Tema:** 1 klasės matematika, trečias programos sudėties atvejis (`agents/log/ideator-2026-11-21T0741.md` — tema parengta, bet pasiūlymo failas neįrašytas) · **Tikslas:** `content/lt/grade-01/matematika/31-dvizenkliai-neper-desimties.json`

**Viena didelė idėja.** Kai vienetų suma mažesnė už dešimt, naujas dešimtukas nesusidaro. Dešimčių sumoje yra tiek, kiek jų buvo abiejuose dėmenyse, o vienetai lieka vienetais.

**Ką sako programa.** 1 klasės turinio aprašas įvardija tris privalomus atvejus: „vienaženklių skaičių peržengiant dešimtį, dviženklio ir vienaženklio skaičių peržengiant dešimtį, **dviženklių skaičių neperžengiant dešimties**“ (`sources/pradinio-bp-rekomendacijos-2024.txt:33520–33521`); tas pats atvejis kartojamas pasiekime A1 (`:692–699`) ir wiki `matematika-1-klase.md` §2.2. Platformoje trečias atvejis neturi nė vieno modulio: `22-sudetis-per-desimti` sprendžia sudėtį **per** dešimtį (8 + 5, 16 + 7), `29-atimtis-per-desimti` — atimtį per dešimtį, `27-skaicius-ir-skaitmuo` — skaitmens vietą (13 ir 31), `30-skaiciavimas-atgal-per-desimti` — skaičiavimą atgal. Paieška `grep "16 + 12|neperžengiant|dviženkl"` `content/lt/grade-01` randa tik citatas `sources` laukuose, ne užduotį.

**Kodėl modelis, o ne paveikslėlis.** Paveikslėlis parodo **sumą**, o ne tai, iš ko ji susidarė: 28 atrodo taip pat, ar gautas iš 16 + 12, ar iš 14 + 14. Skirtumas, kurį vaikas turi suprasti, yra **sandara** — kiek strypų ir kiek kubelių atkeliavo iš kiekvieno dėmens ir ar kubeliai susidėjo į naują strypą. Tam reikia palyginti dvi būsenas (prieš ir po) ir priežastį (kubelių skaičių). Modelis duoda ir trečią dalyką, kurio paveikslėlis neturi: vaikas **pats keičia antrą dėmenį** ir mato, kad dešimčių skaičius kinta tik tada, kai kinta antro dėmens dešimtys, o vienetai strypo neprideda — kol jų nesurenka dešimt.

**Ką rodo tyrimai.**
Fuson (1990) parodė, kad daugiaženklių skaičių sudėtis remiasi tuo, kaip vaikas supranta **daugiaviečius skaičius** (multiunit), o ne atskira „stulpelio“ procedūra: jei skaičius vaikui yra tik ženklų seka, sudėjimas virsta skaitmenų sudėjimu, ir 16 + 12 = 38 yra logiška tos nuostatos pasekmė, o ne apsirikimas. Iš to metodui išeina reikalavimas: modelis rodo skaičių kaip strypus ir kubelius, ne kaip du skaitmenis.
Fuson ir Briars (1990) parodė, kad dešimtukų strypeliai ir vienetų kubeliai įkūnija skaičiaus sandarą ir kad su šiuo modeliu vaikai įveikia daugiaženklę sudėtį. Tyrimas darytas su **antra** klase, todėl 1 klasei imama tik modelio idėja, o ne apimtis — modelyje nėra nei keturženklių skaičių, nei pernešimo.
Hiebert ir Wearne (1996) parodė, kad supratimas ir procedūros tikslumas auga kartu tik tada, kai mokymasis remiasi simbolių ir daiktų sąsaja; todėl kiekviena modulio būsena turi tris vienu metu matomus dalykus: strypus ir kubelius, skaičių ir sakinį apie tai, kas įvyko.
Fuson (1990, forumo straipsnis) kelia klausimą, ar vietos vertės ir daugiaženklės sudėties mokymas procedūromis pirma laiko yra pagrįstas; šiame metode procedūra („sudėk dešimtis atskirai“) yra **išvada** to, ką vaikas pamatė, o ne pradžios taisyklė.

**Klaidingos nuostatos ir kaip jos paneigiamos.**

1. **„Sudėjus du dviženklius skaičius visada atsiranda trečia dešimtis.“** Tai pernešimo overgeneralizacija: vaikas ką tik mokėsi sudėties per dešimtį (`22`), kur kiekvieną kartą susidarydavo naujas dešimtukas. Modelis laiko pirmą dėmenį (16) nepajudinamą, o antrą keičia: 16 + 12 = 28, 16 + 13 = 29 — strypų visada du, nes kubelių niekada nėra dešimt. Paneigiama tuo pačiu veiksmu su skirtingu rezultatu, ne paaiškinimu.
2. **„16 + 12 = 18, nes reikia sudėti tik vienetus.“** Vaikas prie 16 prideda 2 ir pamiršta antrą dešimtį. Modelis rodo, kad antro skaičiaus strypas taip pat keliauja prie pirmojo — juda daiktas, ne skaitmuo.
3. **„Didesnis dėmuo lemia daugiau dešimčių.“** Nėra „vyresnio“ dėmens: ir 16, ir 12 duoda po vieną strypą, o sumos strypai suskaičiuojami tik po sudėjimo. Abu dėmenys piešiami tuo pačiu pavidalu (tas pats strypo ilgis, ta pati spalva), todėl skirtumas tarp jų yra tik kiekis.
4. **„Naujas dešimtukas atsiranda savaime, kai skaičius tampa didesnis.“** Modelis sąmoningai leidžia vienetų pridėti tik tiek, kad jų suma liktų devyni; bandant pridėti dešimtą, valdiklis nepasikeičia, o `api.note` pasako, kad daugiau vienetų jau sudarytų dešimtuką (LL-04 — užrakintas valdiklis paaiškinamas, o ne tyli).

**Seka (konkretumas → pusiau abstraktus modelis → simbolis → perkėlimas).**

1. **Ryšulėliai ant stalo.** Vaikai riša po dešimt pagaliukų. Vienas padeda 16 (ryšulėlis ir šeši pagaliukai), kitas — 12. Sudeda ryšulėlius prie ryšulėlių, pagaliukus prie pagaliukų ir gauna du ryšulėlius bei aštuonis pagaliukus. Tikslas: skirtumą pajusti rankomis, o ne išgirsti taisyklę; mokytojas nepasako, kad „dešimčių bus dvi“.
2. **Ekranas, du dėmenys, vienas kintamasis.** Ekrane tos pačios krūvelės: pirmas skaičius (16) nepajudinamas, antrą vaikas keičia (dešimtys 1–4, vienetai 0–3). Prieš pirmą sudėjimą — **spėjimas**: „Kiek dešimčių bus sumoje?“ (Dvi / Trys / Viena). Tikslas: pamatyti, kad atsakymą lemia dėmenų dešimtys, o ne tai, kad „skaičių daug“.
3. **Sudėjimas ir paaiškinimas.** Vaikas spaudžia „Sudėk“: strypai keliauja į sumos krūvą, kubeliai — į savo. Atsiranda trys vienu metu matomos eilutės: strypai, kubeliai ir skaičius 28. `api.note` sako **kodėl**: „Vienetų mažiau nei dešimt, todėl dešimtukas nesusidaro.“
4. **Antras ir trečias dėmuo.** Vaikas sudeda dar du skirtingus antruosius dėmenis (pvz., 16 + 22, 16 + 33) ir mato, kad strypų daugėja tik tada, kai daugėja antro dėmens dešimčių. Po trečio sudėjimo — `api.progress`.
5. **Perkėlimas į simbolį ir į gyvenimą.** Tada patys skaičiai be strypų: 23 + 14, 31 + 25, ir atvirkštinė užduotis, kurioje dėmenys duoti žodžiais („3 dešimtys ir 6 vienetai“). Tikslas: ta pati taisyklė toje vietoje, kur ji bus naudojama skaičiuojant mintinai.

**Privalomas spėjimo žingsnis.** Vienas spėjimas apie **vieną** pasekmę (kiek dešimčių), palyginamas su įvykiu (LL-15). Spėjimas niekada nevadinamas klaida ir lieka matomas virš sumos. Be jo modelis virsta judesiu: vaikas žiūri, kaip strypai persirikiuoja, ir sąryšio su dėmenimis nepastebi.

**Simuliacijos specifikacija.** Komponentas `strypeliai-ir-suma`, failas `assets/js/sims/matematika.js` (šis failas yra vienintelė `scripts/check_art.py` LEGACY scena ir pats piešia savo formas, kaip `skaicius-ir-skaitmuo`, todėl LEGACY sąrašo liesti nereikia). Registracija: `SIMS` bloke (`matematika.js:4335–4352`) pridedama eilutė `"strypeliai-ir-suma": strypeliaiIrSuma,`. `config`:

```json
{ "first": { "tens": 1, "ones": 6 },
  "second": { "tens": 1, "ones": 2 },
  "labels": { "tensPlace": "Dešimtys", "onesPlace": "Vienetai", "groupSecond": "Antras skaičius",
              "less": "viena mažiau", "more": "viena daugiau", "add": "Sudėk",
              "reset": "Iš naujo", "sumWord": "Suma",
              "rodsAria": "Dešimčių strypeliai, kiekvienas po dešimt kubelių",
              "onesAria": "Vienetų kubeliai" },
  "sentences": { "start": "…", "guess": "…", "merged": "…", "count": "…",
                 "limit": "…", "again": "…", "resetNote": "…" } }
```

**Riba išvedama, o ne įrašyta.** `config` sąmoningai neturi lauko, kiek vienetų daugiausia galima pridėti: `onesMax = 9 - first.ones` (su pirminiu dėmeniu 16 → 3). Jei `second.ones` viršija šią ribą, komponentas rašo `console.error` ir rodo „Skaičiai nesuderinti.“, o ne tyliai nukerpa. Tai ta pati taisyklė kaip M-07 (`kiekis = board.px / unit.px`) ir M-11 (`cells = sound.stretch ? 8 : 1`): teiginys ekrane išvedamas iš tų pačių duomenų, kuriuos mato vaikas.

| Būsena | Ką vaikas mato | `readout` | `api.note` |
|---|---|---|---|
| pradžia | dvi krūvelės (16 ir 12), strypai ir kubeliai, tuščia sumos eilutė, spėjimo mygtukai | „16 ir 12. Kiek bus dešimčių?“ | „Pasirink antrą skaičių ir pažiūrėk į krūveles.“ |
| spėjimas | pasirinktas spėjimas lieka virš sumos, mygtukas „Sudėk“ | „Tu sakei: trys.“ | „Dabar sudėk ir pažiūrėk.“ |
| sudėta | strypai sumos krūvoje, kubeliai savo, skaičius 28 | „28. Dvi dešimtys ir aštuoni vienetai.“ | „Vienetų mažiau nei dešimt, todėl dešimtukas nesusidaro.“ |
| spėjimas nepataikė | tas pats vaizdas, spėjimas lieka matomas | „Tu sakei: trys. Gavosi dvi.“ | „Dešimtys susideda iš dėmenų dešimčių.“ |
| vienetų riba | kubelių tiek pat, `+` nepasikeičia | „Vienetų daugiau nebus.“ | „Daugiau vienetų jau sudarytų dešimtuką.“ |
| trečias sudėjimas | trys sumos eilutės viena po kitos | „Trys krūvelės, viena taisyklė.“ | „Visur dešimčių tiek, kiek jų dėmenyse.“ |
| „Iš naujo“ | krūvelės atstatytos, sumos eilutė tuščia | „Pradedam iš naujo.“ | „Pakeisk antrą skaičių ir sudėk dar kartą.“ |

Septynios savybės, kurių negalima praleisti:

- **Vienas kintamasis:** `second` (antras dėmuo). Pirmas dėmuo nepajudinamas — jis yra kontrolinis atvejis, kaip lenta M-07 (įterpiama vieną kartą) ir puodelis su žyma vandens formos metode. Vaikas keičia vieną dėmenį, todėl pasekmę gali priskirti būtent jam.
- **Geometrija 360 px:** scena `container-type:inline-size`, `--u: clamp(14px, 3.8cqw, 24px)` (ta pati formulė kaip `skaicius-ir-skaitmuo`, `matematika.js:3991–3995`). Strypas — 10 segmentų juosta `var(--u)` pločio ir `calc(var(--u) * 4.2)` aukščio; kubeliai — `repeat(3, var(--u))` tinklelis. Prie 360 px `--u = 14 px`: keturi strypai ir trys kubeliai telpa į 250 px, abi krūvelės ir sumos eilutė — į 328 px su tarpais. Jokio horizontalaus slinkimo; 200 % tekste `cqw` laiko tuos pačius matmenis, didėja tik užrašai (`min-width:0` ant tėvų, LL-125).
- **Įėjimai ir klaviatūra:** `Tab` tarp valdiklių, `Enter`/`Space` aktyvuoja, `←`/`→` keičia pasirinktą skaitmenį, `R` atstato. Taikiniai: dešimčių ±, vienetų ±, spėjimo trys mygtukai ir „Sudėk“ — visi ≥ 48 px.
- **Fokusas** (LL-32): po sudėjimo fokusas lieka „Sudėk“ ir `readout` pasikeičia; po „Iš naujo“ — į pirmą vienetų valdiklį, o ne į paslėptą elementą; atsiradus spėjimo mygtukams — į pirmą iš jų.
- **Grįžtamasis ryšys** — `readout` po sudėjimo, `api.note` sako **kodėl**, niekada „teisingai“ ir niekada apie vaiką (T5.1). `api.progress({ correct: true })` — vieną kartą, po trečio sudėjimo (ne po pirmo, LL-29), ir tikrinama dabartinė būsena, ne istorija (LL-17). „Iš naujo“ pažangos netrina (LL-16).
- **Garsas:** tariamos tik instrukcijos (`config.sentences`, 7 frazės × 2 įrašai = 14 naujų mp3). Sumos skaičius **netariamas** — jis keičiasi kiekvieną sudėjimą (LL-14); jį perskaito `api.readout` ekrane.
- **Be laikmačių, be ėjimų limito, be „game over“.** Sudėti galima tiek kartų, kiek vaikas nori.

**Užduotys.**

| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
|---|---|---|---|---|---|
| 1 | atpažinimas | „Simuliacijoje 16 + 12. Kiek bus dešimčių?“ — Trys / Dvi / Viena | Dvi (1) | „Trys“ — pernešimo overgeneralizacija iš `22` | „Suskaičiuok strypelius abiejose krūvelėse.“ |
| 2 | taikymas | „Kiek yra 23 + 14?“ — 27 / 47 / 37 | 37 (2) | 27 — sudėjo vienetus ir vieną dešimtį | „Skaičių 14 sudaro viena dešimtis ir keturi vienetai.“ |
| 3 | perkėlimas | „Ant lentynos 31 knyga. Dar 25. Kiek knygų iš viso?“ — 56 / 46 / 66 | 56 (0) | 46 — pamiršo antrą dešimtį; 66 — pridėjo dešimtį, kurios nebuvo | „Lentynoje trys dešimtys, o kitoje krūvoje dvi.“ |
| 4 | perkėlimas (`optional: true`) | „Vienas vaikas turi 3 dešimtis ir 6 vienetus. Kitas turi 2 dešimtis ir 2 vienetus. Kiek jų iš viso?“ — 48 / 58 / 68 | 58 (1) | 48 — dešimčių sudėjo viena mažiau, nei yra | „Suskaičiuok, kiek dešimčių turi abu vaikai.“ |

Atsakymų indeksai 1 / 2 / 0 / 1 — ne visi tame pačiame indekse (`validate_content.py` tikrina pasiskirstymą). Nė viena užuomina nekartoja teisingo varianto skaičiaus ir nė viena nepasako atsakymo.

**Refleksija.** „Kur gyvenime tau teko sudėti du dviženklius skaičius? Pasakyk, kaip skaičiavai.“ Klausiama žodžiu, nevertinama; laukiamas atsakymas — vaikas įvardija savo skaičiavimo kelią (pvz., „pirma dešimtis, paskui vienetus“). Tai patikrinimas be ekrano ir be balo.

**Modelio ribos (pasakomos vaikui ir mokytojui).**

1. **Modelis sąmoningai nesustoja ties dešimčia.** Vienetų galima pridėti tik iki devynių, nes dviejų dviženklių skaičių sudėtis **per** dešimtį nėra 1 klasės programos trečias atvejis — tai kito modulio tema (LL-23). Vaikui tai pasakoma vienu sakiniu, mokytojui — `teacher.misconceptions[3]`.
2. **„Dešimt vienetų = viena dešimtis“ modelyje neįrodoma.** Strypas nupieštas kaip dešimt kubelių, bet *kodėl* dešimt vienetų yra viena dešimtis, rodo `05-desimtukas`; čia tai laikoma žinoma.
3. **Strypas nėra „skaičius 10“.** Strypas yra viena dešimtis, o ne dešimt atskirų daiktų, kuriuos galima liesti. Vaikas, kuris strypą skaičiuoja kaip vieną daiktą, gali gauti teisingą atsakymą ir vis tiek nesuprasti vietos vertės — todėl būtinas spėjimas ir 2–4 užduotys be strypų.
4. **Suma niekada neviršija 100.** Pirmas dėmuo 16, antras iki 43, todėl sumos iki 59; 1 klasės programa leidžia iki 100, bet modelis sąmoningai nesiekia ribos — šimto lentelė yra `19-simto-skaiciu-lentele`.
5. **Spalva nėra informacijos nešėja.** Strypai ir kubeliai skiriasi forma ir padėtimi, ne spalva (T5.5); spėjimas ir sumos eilutės sunumeruotos.

**Ką tai reiškia modulio autoriui.** `id` — `31-dvizenkliai-neper-desimties` (numeris 31 matematikoje laisvas, užimti 04–07 ir 14–30); `title` — „Sudėtis be naujo dešimtuko“ (26 simboliai iš 42); `subtitle` — „16 + 12: dešimtys prie dešimčių, vienetai prie vienetų“ (54 iš 80); `minutes` — 9; trys `outcomes` (8/8/7 žodžių); `concept.title` — „Dešimtys prie dešimčių“ (22 iš 40); `concept.big_idea` — 112 simbolių (9 + 6 žodžių sakiniai); `concept.steps` — keturi žingsniai (6/6/10/7 žodžių, 51/48/59/50 simbolių); `concept.example` — 16 pieštukų klasėje (11 žodžių). Įrašius modulį jis turi patekti į `content/lt/grade-01/index.json` (matematikos kryptis, po `30-skaiciavimas-atgal-per-desimti`) ir į `path.json` — **po `22-sudetis-per-desimti`**, nes ten vaikas jau moka papildyti iki dešimtuko, o čia pamato, kad jo papildyti nereikia. Failo numeris ir eilė kelyje neprivalo sutapti (`path.json` tvarką gali keisti dizaineris).

**Patikra tikru įrankiu (2026-11-21).** Metodo specifikacija surašyta kaip juodraštinis modulis scratch kataloge (ne `content/`, todėl `git status` švarus) ir paleisti abu vartai su tuo pačiu keliu, kuriuo tikrina CI: `validate_content.check_module` → **0 klaidų, 1 įspėjimas** („nepavyko perskaityti simuliacijos „strypeliai-ir-suma“ kūno — sim.config gyvumas nepatikrintas“ — sąžininga, kol komponento nėra registre), `check_language.check_module` → **0 klaidų, 0 įspėjimų, 0 pastabų**. Aritmetika perskaičiuota skriptu, ne mintyse: 16 + 12 = 28 (dvi dešimtys), 23 + 14 = 37, 31 + 25 = 56, 36 + 22 = 58; atsakymų indeksai 1 / 2 / 0 / 1. Ilgiai matuoti skriptu (`len()` simboliams, `validate_content.word_count` žodžiams), ne akimis. Juodraštis po patikros pašalintas (`finally`), failo `content/` kataloge neliko.

**Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, matematika — trys 1 klasės sudėties ir atimties atvejai (`sources/pradinio-bp-rekomendacijos-2024.txt:33520–33521`), pasiekimas A1 (`:692–699`). Fuson, K. C. (1990). Conceptual structures for multiunit numbers: Implications for learning and teaching multidigit addition, subtraction, and place value. *Cognition and Instruction, 7*(4), 343–403. https://doi.org/10.1207/s1532690xci0704_4 · Fuson, K. C., & Briars, D. J. (1990). Using a base-ten blocks learning/teaching approach for first- and second-grade place-value and multidigit addition and subtraction. *Journal for Research in Mathematics Education, 21*(3), 180–206. https://doi.org/10.5951/jresematheduc.21.3.0180 · Hiebert, J., & Wearne, D. (1996). Instruction, understanding, and skill in multidigit addition and subtraction. *Cognition and Instruction, 14*(3), 251–283. https://doi.org/10.1207/s1532690xci1403_1 · Fuson, K. C. (1990). A forum for researchers: Issues in place-value and multidigit addition and subtraction learning and teaching. *Journal for Research in Mathematics Education, 21*(4), 273–280. https://doi.org/10.5951/jresematheduc.21.4.0273

**Pastaba dėl pasiūlymo.** Ideatorius (#418) parengė šią temą su tais pačiais šaltiniais, bet paleidimas baigėsi prieš įrašant failą, todėl `tema` pasiūlymo `agents/proposals/` kataloge nėra. Metodas idėją palieka, bet **modelį susiaurina**: ideatorius siūlė „sudedame dviženklius skaičius“, o čia pirmas dėmuo nepajudinamas ir vienetų suma laikoma po devyniais — kitaip modelis rodytų pernešimą, kurio 1 klasės programa nereikalauja (LL-23), ir tas pats modulis mokytų dviejų dalykų (T1.2).

### M-13 — Traumos priežastis: pašalink vieną priežastį, įvykis nebeįvyksta

**Data:** 2026-11-22 · **Tema:** 1 klasės pasaulio pažinimas, 26.1.1 „Saugus elgesys“ (`agents/log/ideator-2026-11-22T0743.md:29–34` — tema parengta ideatoriaus #433, bet pasiūlymo failas neįrašytas) · **Tikslas:** `content/lt/grade-01/pasaulio-pazinimas/25-traumu-prevencija.json`

**Viena didelė idėja.** Įvykis turi priežastį, ir ta priežastis dažniausiai yra vietoje, o ne vaike. Kai kelyje yra šlapias grindų ruožas, palikta kuprinė ar tamsus kampas, tas pats ėjimas baigiasi kritimu; kai to daikto nėra, tas pats ėjimas baigiasi saugiai. Priežastį galima rasti ir pašalinti — todėl „nepasisekė“ nėra paaiškinimas.

**Ką sako programa.** 26.1.1 „Saugus elgesys“ 1 klasėje turi **3 valandas** ir du projektus, kurių pirmas vadinasi būtent „Kaip išvengti traumų?“ — jo tikslas „išsiaiškinti, kaip žmogaus kūno dalis galima apsaugoti nuo traumų ir kodėl tai svarbu“, o priemonė — skrajutė „Būk atsargus mokyklos koridoriuose, kiemo aikštelėje, sporto salėje“ (`sources/pradinio-bp-rekomendacijos-2024.txt:14960–14966`); ilgalaikiame plane ta tema turi 3 val. ir veiklas „atvejo analizė, situaciniai, vaidybiniai žaidimai“ (`:17618–17626`), o galimų veiklų lentelėje ta pati eilutė kartoja „praktinė veikla (pvz., atvejo analizė, situaciniai, vaidybiniai, stalo žaidimai)“ (`:8390–8392`). Platformoje 26.1.1 teturi vieną modulį — `19-dumai-ir-isejimas`, ir jis sprendžia **dūmų kelią**, o ne traumos priežastį: `research/wiki/curriculum/pasaulio-pazinimas-1-klase.md:174` tai įvardija tiesiogiai („yra tik gaisro dalis (19); traumų temos nėra“), o `grep -n "traum\|susižaloj\|griuv\|nukrit" content/lt/grade-01/` randa 0 atvejų užduotyse (tikrinta 2026-11-22). Antras programos projektas — „Mano elgesys ištikus nelaimei“ (kur kreiptis pagalbos, kaip elgtis kilus gaisrui, `:14960–14966`) — sąmoningai **neimamas** į šį modulį: tai antra sąvoka tame pačiame kadre (T1.2) ir lieka mokytojo veiklai.

**Kodėl modelis, o ne paveikslėlis.** Paveikslėlis parodo vieną vietą su daiktu ir joje esantį vaiką — bet ne tai, **kas pasikeitė tarp dviejų ėjimų**. Skirtumas, kurį vaikas turi suprasti, yra priežasties buvimas, o ne daikto išvaizda: ta pati kuprinė ant suolo nekliudo, o ant grindų kelyje kliudo. Tam reikia palyginti dvi būsenas, kuriose **vaikas yra tas pats, ėjimas tas pats, o pasikeitęs tik vienas daiktas**. Modelis duoda ir tai, ko paveikslėlis neturi: vaikas pats pašalina priežastį ir pamato, kad įvykis nebeįvyksta. Tai vienintelis būdas 6–7 m. vaikui parodyti, kad priežastis yra šalinama, o ne likimo reikalas.

**Ką rodo tyrimai.**
Schwebel (2019) rodo, kad „nelaimingi atsitikimai“ nėra atsitiktiniai: vaikų traumos turi išmatuojamas priežastis, kurias galima suskirstyti pagal laiką (prieš įvykį, įvykio metu, po jo) ir pagal veiksnį (vaikas, priežiūra, aplinka). Iš to metodui išeina reikalavimas: modelis turi rodyti **vieną aplinkos veiksnį**, o ne „būk atsargus“ patarimą, nes patarimas neturi priežasties.
Zhuravlev, Mueller ir St. Vil (2024) parodė, kad vaikai, kurie traumą priskyrė sėkmei, negalėjo sugalvoti nė vienos prevencijos strategijos, o tie, kurie įžvelgė priežastį savo veiksme, galėjo. Tyrimas darytas su 10–18 m. vaikais, todėl 1 klasei imama tik **kryptis** (priežastis, ne likimas), o ne jo apimtis ir ne jo klausimų formuluotės.
Hillier ir Morrongiello (1998) parodė, kad 120 vaikų nuo 6 iki 10 metų **jau skiria** rizikos laipsnį nuotraukose — tai pagrindžia amžiaus tinkamumą: 6–7 m. vaikas gali pasakyti, kuri vieta pavojingesnė, jei jam duota kuo remtis. Tas pats tyrimas įspėja, kad berniukai ir mergaitės remiasi skirtingais požymiais (galimos žalos sunkumu ir pažeidžiamumu), todėl modelyje nėra nė vieno sakinio apie „drąsą“ ar „baimę“ — vertinamas tik daiktas kelyje.

**Klaidingos nuostatos ir kaip jos paneigiamos.**

1. **„Trauma atsitinka be priežasties, tiesiog nepasisekė.“** Paneigiama tuo pačiu ėjimu du kartus: su daiktu kelyje ir be jo. Vaikas mato, kad pasikeitė ne jis, o vieta — ir kad priežastis buvo vienintelis skirtumas.
2. **„Užteks būti atsargesniam, ir daiktas kelyje nebekliudys.“** Modelio kintamasis yra daiktas, o ėjimas nesikeičia: kol priežastis yra, ėjimas vis tiek baigiasi kritimu. Tai priešparyzdys tame pačiame kadre (LL-28): atsargumas padeda, bet priežasties nepašalina.
3. **„Kaltas vaikas, o ne vieta.“** Modelis niekada neįvardija vaiko kaip priežasties: `api.note` sako, kas yra kelyje („Grindys šlapios toje vietoje, kur bėgai“), o ne „bėgai per greitai“. Tai ir T5.1 reikalavimas — grįžtamasis ryšys apie veiksmą ir aplinką, ne apie vaiką.
4. **„Kuprinė ant grindų — tik netvarka, ne priežastis.“** Modelis kritimą sustabdo būtent ties kuprine ir `readout` pasako, kad koja užkliuvo už jos. Netvarka ir pavojus tame pačiame kadre sutampa, bet priežastis įvardijama daiktu, ne tvarka.
5. **„Pavojinga vieta yra visada pavojinga.“** Ta pati vieta su tuo pačiu vaiku yra saugi, kai daikto nėra. Modelis tą pačią sceną naudoja abiem atvejais, todėl vaikas negali priskirti pavojaus pačiai vietai.

**Seka (konkretumas → pusiau abstraktus modelis → simbolis → perkėlimas).**

1. **Popieriaus planas.** Vaikas ant lapo nupiešia mokyklos koridorių tiesia linija ir apibrauna **vietą**, kur kas nors galėtų pakenkti. Mokytojas neįvardija atsakymo ir neklausia „ar tu atsargus“. Tikslas: priežasties ieškoti vietoje, o ne savyje.
2. **Ekranas, vieta ir vienas daiktas.** Ekrane ta pati koridoriaus atkarpa. Vaikas pasirenka, kas yra kelyje (šlapios grindys / kuprinė / tamsu / nieko), ir prieš ėjimą **spėja**: „Ar šis ėjimas baigsis saugiai?“ (Taip / Ne). Tikslas: sąryšį tarp daikto ir pasekmės vaikas pasitikrina pats, o ne išgirsta taisyklę.
3. **Kontrolinis ėjimas be priežasties.** Tas pats vaikas, tas pats ėjimas, kelyje „nieko“. Ėjimas baigiasi saugiai. Tikslas: atskirti vaiką nuo vietos — pasikeitė tik daiktas.
4. **Visi trys daiktai ir simbolis.** Vaikas išbando tris priežastis, o po kiekvieno bandymo į sąrašą „Ką radau kelyje“ įrašoma vietos eilutė. Visos keturios eilutės (trys priežastys ir „nieko“) sudaro lentelę „vieta → kas kelyje → kuo baigėsi“. Tikslas: taisyklę pasakyti savais žodžiais, kai ji jau matyta keturis kartus.
5. **Perkėlimas į tris kitas vietas.** Be modelio: kiemo aikštelė, sporto salė, laiptai. Vaikas pasako, ko kiekvienoje vietoje ieškotų ir ką darytų radęs. Tikslas: taisyklė ne apie koridorių, o apie bet kurią vietą.

**Privalomas spėjimo žingsnis prieš pirmą ėjimą.** Vienas spėjimas apie **vieną** pasekmę (saugiai / ne), palyginamas su tuo, kas įvyko (LL-15). Spėjimas niekada nevadinamas klaida ir lieka matomas virš scenos. Be jo modelis virsta animacija: vaikas žiūri, kaip figūrėlė juda, o daikto kelyje nepastebi.

**Simuliacijos specifikacija.** Komponentas `traumos-priezastis`, failas `assets/js/sims/pasaulis.js` (jis importuoja `art.js` ir jau naudoja `art.kid`, `art.plank`, `art.block`, todėl `scripts/check_art.py` naujų dalių nereikalauja ir LEGACY sąrašo liesti negalima). Registracija: `SIMS` bloke (`pasaulis.js:4084`) pridedama eilutė `"traumos-priezastis": traumosPriezastis,`. `config`:

```json
{ "place": "Koridorius",
  "causes": [ { "key": "slapia",  "label": "Šlapios grindys" },
              { "key": "kuprine", "label": "Kuprinė ant grindų" },
              { "key": "tamsu",   "label": "Tamsus kampas" },
              { "key": "nieko",   "label": "Nieko nėra" } ],
  "labels": { "guessYes": "Taip", "guessNo": "Ne", "walk": "Eik",
              "again": "Iš naujo", "foundTitle": "Ką radau kelyje",
              "safe": "Saugiai", "fall": "Kliudė" },
  "sentences": { "start": "…", "guess": "…", "slapia": "…", "kuprine": "…",
                 "tamsu": "…", "nieko": "…", "table": "…", "reset": "…" } }
```

**Pasekmė išvedama, o ne įrašyta.** `config.causes[]` sąmoningai neturi lauko, kuo ėjimas baigiasi: `outcome(key) = key === "nieko" ? "safe" : "fall"`. Jei `key` nežinomas arba `label` tuščias, komponentas rašo `console.error` ir rodo „Vieta nesuderinta.“, o ne tyliai praleidžia kortelę. Tai ta pati taisyklė kaip M-07 (`kiekis = board.px / unit.px`), M-11 (`cells = sound.stretch ? 8 : 1`) ir M-12 (`onesMax = 9 - first.ones`): teiginys ekrane išvedamas iš tų pačių duomenų, kuriuos mato vaikas.

| Būsena | Ką vaikas mato | `readout` | `api.note` |
|---|---|---|---|
| pradžia | koridoriaus atkarpa, vaikas kairėje, keturios kortelės, tuščia lentelė | „Kas yra kelyje?“ | „Pasirink vieną ir pažiūrėk.“ |
| spėjimas | pasirinkta kortelė pažymėta, mygtukai „Taip“ / „Ne“ | „Ar šis ėjimas baigsis saugiai?“ | „Pirma spėk, tada eik.“ |
| ėjimas, priežastis yra | vaikas sustoja ties daiktu, kelias pažymėtas trūkio ženklu | „Kliudė.“ | „Kelyje buvo šlapios grindys.“ |
| ėjimas, priežasties nėra | vaikas praeina visą atkarpą, kelias ištisinis | „Saugiai.“ | „Kelyje nieko nebuvo.“ |
| lentelė, 1–3 eilutės | lentelė pildosi: vieta, kas kelyje, kuo baigėsi | „Dar trūksta vietų.“ | „Išbandyk ir kitus daiktus.“ |
| lentelė pilna | keturios eilutės, paskutinė „nieko“ | „Keturi ėjimai, viena taisyklė.“ | „Tas pats vaikas, ta pati vieta.“ |
| „Iš naujo“ | scena atstatyta, lentelė lieka | „Pradedam iš naujo.“ | „Bandyk kitą daiktą.“ |

Septynios savybės, kurių negalima praleisti:

- **Vienas kintamasis:** `cause` — kas yra kelyje. Vaiko figūrėlė, ėjimo kelias ir vieta nesikeičia niekada; tai yra modelio teiginys, o ne dekoracija.
- **Geometrija 360 px:** scena `viewBox="0 0 328 300"`, `max-width:328px`; grindų juosta `art.plank(14, 264, 300, 14)`; vaikas `art.kid(48, 258, 0.9)`; daiktas — `art.block` (kuprinė), `art.plank` su pakreipimu (šlapias ruožas), tamsus kampas — `art.block` tamsiu užpildu su užrašu „tamsu“ (spalva niekada vienintelis informacijos nešėjas). Kortelės 2 × 2, po 156 × 56 px su 8 px tarpais (320 px iš 328). Jokio horizontalaus slinkimo; 200 % tekste matmenys lieka tie patys, didėja tik užrašai (`min-width:0` ant tėvų, LL-125).
- **Įėjimai ir klaviatūra:** `Tab` tarp keturių kortelių ir mygtukų, `Enter`/`Space` aktyvuoja, `←`/`→` perjungia korteles, `R` atstato. Visi taikiniai ≥ 48 px.
- **Fokusas** (LL-32): pasirinkus kortelę fokusas eina į spėjimo mygtuką, o ne į neaktyvų elementą; po ėjimo lieka „Eik“ ir `readout` pasikeičia; po „Iš naujo“ — į pirmą neišbandytą kortelę.
- **Grįžtamasis ryšys** — `readout` po ėjimo, `api.note` sako **kodėl** ir niekada apie vaiką (T5.1); žodis „kaltas“ nevartojamas nė karto. `api.progress({ correct: true })` — vieną kartą, kai lentelėje yra visos keturios eilutės (tikrinama dabartinė būsena, ne istorija — LL-17), o ne po pirmo ėjimo (LL-29). „Iš naujo“ pažangos netrina (LL-16).
- **Garsas:** tariamos tik instrukcijos ir `api.note` (`config.sentences`, 8 frazės × 2 įrašai = 16 naujų mp3). Vietos pavadinimas ir eilutės lentelėje **netariami** kiekvieną kartą — juos perskaito `api.readout` (LL-14).
- **Be laikmačių, be ėjimų limito, be „game over“.** Kritimas niekada nekartojamas automatiškai ir niekada nevertinamas balu.

**Užduotys.**

| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
|---|---|---|---|---|---|
| 1 | atpažinimas | „Koridoriuje šlapios grindys. Kas nutiks, kai vaikas bėgs?“ — „Nieko, grindys nesvarbu“ / „Jis gali paslysti ir nukristi“ / „Jis bėgs greičiau“ | 1 | „Nieko, grindys nesvarbu“ — vaikas priežasties ieško savyje, ne vietoje | „Pažiūrėk į grindis toje vietoje, kur bėgama.“ |
| 2 | taikymas | „Ant grindų palikta kuprinė. Ką daryti, kad ji nekliudytų?“ — „Apibėgti greičiau“ / „Peršokti“ / „Pakelti ir padėti ant suolo“ | 2 | „Apibėgti greičiau“ — judėjimas keičiamas vietoj priežasties | „Priežastis yra ant grindų, o ne ore.“ |
| 3 | perkėlimas | „Kiemo aikštelėje kampas be šviesos. Kaip ten eisi?“ — „Lėtai ir žiūrėsiu po kojomis“ / „Bėgsiu, kad greičiau praeičiau“ / „Eisiu užsimerkęs“ | 0 | „Bėgsiu“ — greitis laikomas apsauga nuo nematomos kliūties | „Tamsa kliūties nepašalina, tik ją paslepia.“ |
| 4 | perkėlimas (`optional: true`) | „Kamuolys guli prie sporto salės durų. Kuris veiksmas pašalina priežastį?“ — „Apibėgti kamuolį“ / „Paliesti kamuolį“ / „Nustumti kamuolį į šalį“ | 2 | „Apibėgti kamuolį“ — apeiti nelygu pašalinti; kitas vaikas užklius | „Priežastis lieka, jei daiktas tebėra kelyje.“ |

Atsakymų indeksai 1 / 2 / 0 / 2 — ne visi tame pačiame indekse (`validate_content.py` tikrina pasiskirstymą). Nė viena užuomina nekartoja teisingo varianto žodžių ir nė viena nepasako atsakymo.

**Refleksija.** „Kokią priežastį radai savo klasėje ar namuose? Pasakyk, ką su ja darytum.“ Klausiama žodžiu, nevertinama; laukiamas atsakymas — vaikas įvardija vietą ir daiktą, o ne save. Tai patikrinimas be ekrano ir be balo.

**Modelio ribos (pasakomos vaikui ir mokytojui).**

1. **Modelis rodo vieną priežastį, o tikrovėje jų būna kelios.** Todėl `readout` sako „gali“, o ne „nukris“, ir modelis niekada neteigia, kad pašalinus vieną daiktą vieta tapo visiškai saugi.
2. **Kritimas yra tikimybė, o ne garantija.** Tai pasakoma ir ekrane („gali“), ir mokytojo bloke: jei vaikas gyvenime bėgo šlapiomis grindimis ir nenukrito, modelis jam nemelavo — jis parodė, kas padidina tikimybę.
3. **Skausmo modelis nevaidina.** Figūrėlė nesužeidžiama ir neverda; tai sąmoninga riba, kad vaikas nejaustų baimės, o matytų priežastį. Tikras pokalbis apie skausmą lieka mokytojui.
4. **Ne viską vaikas gali pašalinti pats.** Apšvietimą, grindų suremontavimą ar tvarką koridoriuje tvarko suaugusieji; modelyje tai parodyta tuo, kad priežastys šalinamos „tvarkymo“ veiksmu, o `teacher.offline` prašo vaiką pasakyti suaugusiajam.
5. **„Kur kreiptis pagalbos“ neparodoma.** Tai antras 26.1.1 projektas (`:14960–14966`) ir atskira sąvoka (T1.2); modelyje jos nėra, kad tame pačiame kadre neliktų dviejų idėjų.

**Ką tai reiškia modulio autoriui.** `id` — `25-traumu-prevencija` (numeris 25 pasaulio pažinime laisvas: užimti 08–10 ir 16–24); `title` — „Trauma turi priežastį“; `subtitle` — „Pašalink priežastį — įvykis nebeįvyksta“; `minutes` — 9; trys `outcomes` („Randzu vietą, kur kas nors gali pakenkti.“ → formuluoti veiksmažodžiu: „Randu vietą, kur kas nors gali pakenkti.“, „Pašalinu priežastį ir matau, kad įvykis nebeįvyksta.“, „Paaiškinu, kodėl priežastis yra vietoje, o ne vaike.“); `concept.title` — „Priežastis yra vietoje“; `concept.big_idea` — „Kai kelyje yra šlapios grindys, kuprinė ar tamsa, tas pats ėjimas baigiasi kritimu. Pašalinus priežastį, tas pats ėjimas baigiasi saugiai.“; `concept.steps` — keturi žingsniai po ≤10 žodžių; `concept.example` — „Klasėje kuprinė guli prie durų. Kas ją pakelia, tas pašalina priežastį.“; `sim` — `{ "component": "traumos-priezastis", "config": { … } }`. Įrašius modulį jis turi patekti į `content/lt/grade-01/index.json` (pasaulio pažinimas, po `24-kieta-vandens-forma`) ir į `path.json` — **po `19-dumai-ir-isejimas`**, nes ten vaikas jau mokosi, kad pavojus turi kryptį ir kelią, o čia — kad jis turi priežastį.

**Patikra.** Metodo specifikacija surašyta kaip juodraštinis modulis scratch kataloge (ne `content/`, todėl `git status` švarus) ir paleisti abu vartai tuo pačiu keliu, kuriuo tikrina CI: `validate_content.check_module` ir `check_language.check_module`. Rezultatai — žemiau esančiame ataskaitos faile; jei juodraštis buvo atmestas, tai parašyta ten pat, o ne apeita.

**Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, gamtos mokslai, 26.1.1 (`sources/pradinio-bp-rekomendacijos-2024.txt:14960–14966`, `:17618–17626`, `:8390–8392`). Schwebel, D. C. (2019). Why “accidents” are not accidental: Using psychological science to understand and prevent unintentional child injuries. *American Psychologist, 74*(9), 1137–1147. https://doi.org/10.1037/amp0000487 · Zhuravlev, P., Mueller, C., & St. Vil, D. (2024). Just my luck: How children’s causal attributions contribute to injury prevention. *European Journal of Trauma and Emergency Surgery, 50*, 3095–3098. https://doi.org/10.1007/s00068-023-02425-3 · Hillier, L. M., & Morrongiello, B. A. (1998). Age and gender differences in school-age children’s appraisals of injury risk. *Journal of Pediatric Psychology, 23*(4), 229–238. https://doi.org/10.1093/jpepsy/23.4.229

**Pastaba dėl pasiūlymo.** Ideatorius (#433) temą parengė, bet paleidimas baigėsi prieš įrašant failą, todėl `tema` pasiūlymo `agents/proposals/` kataloge nėra (`agents/log/ideator-2026-11-22T0743.md:41–43`). Metodas idėją palieka, bet **susiaurina**: ideatorius siūlė „tą pačią vietą su matoma priežastimi (šlapios grindys, bėgimas, atsegta kuprinė)“, o čia iš trijų priežasčių pašalintas **bėgimas** — jis priklauso vaikui, o ne vietai, ir tame pačiame kadre būtų antra sąvoka (T1.2). Bėgimas lieka mokytojo veiklai, o modelis laiko vaiko ėjimą nepajudinamą būtent todėl, kad priežastis būtų galima priskirti vietai.

### M-14 — Virtualumas: žodis pasiekia žmogų abiem keliais

**Data:** 2026-11-23 · **Tema:** 1 klasės etika, D:virtualumas „Aš ir virtualumas“ (`research/wiki/curriculum/1-klases-temų-žemėlapis.md:80`, `research/wiki/curriculum/backlog.json`) · **Tikslas:** `content/lt/grade-01/dorinis-ugdymas/02-virtualumas.json`

**Viena didelė idėja.** Ekrane žmogus yra tikras žmogus. Tas pats žodis jį pasiekia ir tada, kai jis pasakytas gyvai, ir tada, kai parašytas. Keičiasi kelias, ne pasekmė: gavėjo jausmas priklauso nuo žodžio prasmės, o ne nuo to, ar jis girdėjo balsą, ar skaitė raidžių eilutę.

**Ką sako programa.** Etikos programoje virtualumas yra **nauja sritis**: „Naujame turinyje skiriama daugiau dėmesio virtualumo, saugaus elgesio ir komunikacijos virtualioje tikrovėje temai“, o vertybinės nuostatos įvardija „saugų elgesį virtualioje erdvėje, savo ir kito asmens duomenų saugojimą, laiko planavimą dirbant ar žaidžiant virtualioje erdvėje“ (`sources/pradinio-bp-rekomendacijos-2024.txt:105–106`; `research/wiki/curriculum/kti-dalykai-1-klase.md:133`). Konkreti 1–2 kl. veikla yra pavadinta būtent taip: „**ETIKA. Aš ir virtualumas.** Sumaketuoti **draugiško elgesio internete taisykles**, naudojant, pvz., Canva“ (`sources/pradinio-bp-rekomendacijos-2024.txt:12271–12273`). Ilgalaikiame plane ta tema stovi kaip „4 savaitė A4 Aš ir virtualumas“ (`:16434`), o jos kompetencijų aprašas remiasi jausmų įvardijimu ir „savo skirtingumo nuo kitų“ suvokimu (`:16435–16442`) — todėl modelis remiasi žodžio jausmu, o ne taisyklės sąrašu. Platforma šios pozicijos neturėjo nė vieno modulio (`backlog.json` būsena `missing`).

**Kodėl modelis, o ne paveikslėlis ar taisyklių sąrašas.** Draugiško elgesio taisyklės, surašytos kaip sąrašas, vaikui yra suaugusiojo taisyklės, kurių laikomasi tol, kol suaugusysis žiūri (Piaget, 1932 — ta pati išvada, kuria remiasi `01-susitarimas-ir-zaidimas`). Paveikslėlis parodo žmogų prie ekrano, bet ne tai, **kas pasikeičia** nuo žodžio. Skirtumas, kurį vaikas turi suprasti, yra pasekmės tapatumas dviem keliais, o ne ekrano išvaizda: tam reikia to paties žodžio du kartus, tuo pačiu gavėju ir pasikeitusiu tik keliu. Modelis duoda ir tai, ko sąrašas neturi: vaikas pats pasiunčia žodį abiem keliais ir pamato, kad veidas liko toks pat.

**Ką rodo tyrimai.**
Suler (2004) „online disinhibition“ efekte įvardija šešis veiksnius, iš kurių du svarbiausi šiam amžiui: **nematomumas** („you can't see me“) ir **asimchroniškumas** (žodis lieka, o atsakymo nereikia iš karto). Vaikas ekrane jaučiasi nepastebimas, todėl rašo tai, ko nepasakytų gyvai — nors gavėjas yra tas pats žmogus. Iš to metodui išeina reikalavimas: modelis turi rodyti **gavėjo pasekmę**, o ne aiškinti, kad „taip daryti negalima“.
Widen ir Russell (2008) rodo, kad 6–7 m. vaiko jausmo žodynas dar platus — vienas žodis dengia kelis jausmus, o jausmas atpažįstamas iš **veido ir situacijos**, ne iš aprašymo. Todėl modelyje jausmą neša gavėjo veidas, o žodis, ne ilga formuluotė.
Piaget (1932) paaiškina, kodėl taisyklė be pasekmės nelimpa: 6–7 m. vaikas taisyklę linkęs laikyti suaugusiojo nustatytu dalyku, o ne susitarimu. Modelis taisyklę padaro pasekmės stebėjimu.

**Klaidingos nuostatos ir kaip jos paneigiamos.**

1. **„Ekrane aš nesu matomas, todėl mano žodis žmogaus nepasiekia.“** Paneigiama tuo pačiu žodžiu du kartus: gyvai ir per ekraną. Gavėjo veidas abiem atvejais toks pat, o `config.sentences.both.*` tai pasako žodžiu („Abiem keliais Tomui linksma.“).
2. **„Ekrane galima rašyti bet ką — tai ne tikra.“** Modelis turi **priešpriešinį pavyzdį** tame pačiame kadre (LL-28): nemalonus žodis „Tu man netrugink“ duoda liūdną veidą abiem keliais, taigi rašyti galima, bet pasekmė lieka.
3. **„Jei nematau veido, nematau ir pasekmės.“** Veido modelis nerodo gavėjui atgal, bet jausmas ekrane lieka; `readout` sako „Tomui liūdna“, o ne „klaida“. Modelis niekada nevaidina gavėjo atsakymo — tik jo jausmą.
4. **„Kanalas keičia žodžio prasmę.“** Tas pats žodis abiem keliais duoda tą patį veidą; kintamasis yra žodis, ne kelias. Tai matoma palyginimo eilutėje `#zv-compare`.
5. **„Rašyti saugiau nei sakyti.“** Rašyti lengviau — nereikia matyti kito akių, — bet pasekmė ta pati. Todėl modelis nesislepia už „rašyk mandagiai“ patarimo, o rodo veidą.

**Seka (konkretumas → pusiau abstraktus modelis → simbolis → perkėlimas).**

1. **Du veidai prieš klasę.** Ekrane du vaikai, bet kurių žodis dar nepasakytas. Vaikas pasirenka, ką pasakys: „Ačiū, kad padėjai“ ar „Tu man netrugink“. Tikslas: žodis atsiranda tik tada, kai jį pasirenki.
2. **Kanalas kaip atskiras pasirinkimas.** Vaikas pasirenka „Gyvai“ arba „Per ekraną“ ir spaudžia „Siųsti“. Scena parodo kelią: trys arkos (balsas) arba kortelė su eilutėmis (raštas). Tikslas: kelias matomas kaip atskiras dalykas, ne kaip žodžio savybė.
3. **Tas pats žodis antru keliu.** Vaikas siunčia tą patį žodį likusiu keliu. Veidas nepakinta; palyginimo eilutė užsipildo abiem pusėmis. Tikslas: pasekmės tapatumas, ne kelių skirtumas.
4. **Priešpriešinis žodis.** Vaikas pasirenka antrą žodį; abu keliai išvalomi (LL-17: sena būsena nebepasakoja nieko apie naują žodį) ir siunčia juo abiem keliais. Veidas liūdnas abiem. Tikslas: taisyklė apie žodį, ne apie malonų atvejį.
5. **Perkėlimas į tris vietas.** Be modelio: laiškas draugui, klasės pokalbis, žaidimas. Vaikas pasako, kurį žodį pasirinktų ir kodėl. Tikslas: taisyklė ne apie šį ekraną, o apie bet kurį.

**Privalomas spėjimo žingsnis — sąmoningai NĖRA.** Tai sąmoningas šio modelio sprendimas, ne spraga (LL-15). Spėjimas reikalauja, kad vaikas **turėtų prognozę** prieš įvykį; čia pasekmė yra tai, ką jis pats pasirinko pasakyti, todėl spėjimas būtų „ką aš pasakysiu“ — ne prognozė, o to paties pasirinkimo kartojimas. Modelio klaidinga nuostata („mano žodis nepasiekia“) paneigiama **palyginimu**, o ne prognoze: prieš pirmą siuntimą palyginimo eilutė rodo „Gyvai: — · Per ekraną: —“, ir būtent tas trūkumas kviečia siųsti antrą kartą. Todėl vietoj spėjimo modelis turi privalomą **antrą siuntimą tuo pačiu žodžiu**, be kurio `api.progress` neįrašomas — pirmas siuntimas pažangos nežymi (LL-29).

**Simuliacijos specifikacija.** Komponentas `zodis-per-ekrana`, failas `assets/js/sims/dorinis.js` (importuoja `art.js`, naudoja `art.defs`, `art.sun`, `art.cloud`, `art.hills`, `art.grass`, `art.kid` — `scripts/check_art.py` 0 klaidų, LEGACY sąrašo liesti negalima). Registracija: `SIMS` bloke (`dorinis.js:749`) eilutė `"zodis-per-ekrana": zodisPerEkrana,`. `config`:

```json
{ "kids": [ { "id": "a", "name": "Rūta", "color": "#f0b45a" },
            { "id": "b", "name": "Tomas", "color": "#7cc0ea" } ],
  "words": [ "Ačiū, kad padėjai", "Tu man netrugink" ],
  "tones": [ "siltas", "saltas" ],
  "toneLabels": { "siltas": "Tomui linksma", "saltas": "Tomui liūdna" },
  "sentences": { "ask": "…", "prompt": "…", "channel": "…", "send": "…", "pick": "…",
                 "carry": "…", "say": { "live": { "warm": "…", "cold": "…" },
                                        "screen": { "warm": "…", "cold": "…" } },
                 "both": { "warm": "…", "cold": "…" } } }
```

**Pasekmė išvedama, o ne įrašyta.** `config.tones[]` nurodo tik jausmo rūšį, o veido išraiška išvedama: `MOOD = { siltas: "happy", saltas: "sad" }`. Jei žodis neturi `tones[i]`, komponentas rašo `console.error` ir rodo „Žodžiai nesuderinti su jausmais.“, o ne tyliai praleidžia pasekmę. Tai ta pati taisyklė kaip M-07 (`kiekis = board.px / unit.px`) ir M-13 (`outcome(key) = key === "nieko" ? "safe" : "fall"`).

| Būsena | Ką vaikas mato | `readout` | `api.note` |
|---|---|---|---|
| pradžia | du vaikai, neutralūs veidai, tuščia palyginimo eilutė | „Ką pasakysi Tomui?“ | „Pasirink žodį ir kelia, kuriuo jis nueis pas Tomą.“ |
| žodis pasirinktas | žodis pažymėtas, kanalas „Gyvai“ | „Ką pasakysi Tomui?“ | „Pasirinkta: „Ačiū, kad padėjai““ |
| siuntimas | arkos brūkšniuotos, žodis keliauja | „Žodis keliauja.“ | „Palauk, kol žodis nueis.“ |
| po 1 siuntimo, malonus | gavėjas šypsosi, palyginime viena pusė | „Rūta pasakė gyvai. Tomui linksma.“ | „… Dabar pasiųsk tą patį žodį per ekraną.“ |
| po 2 siuntimų | gavėjas šypsosi, palyginime abi pusės | „Abiem keliais Tomui linksma.“ | tas pats sakinys |
| nemalonus žodis, 1 siuntimas | gavėjas liūdnas, antakiai nuleisti | „Rūta parašė ekrane. Tomui liūdna.“ | „… Dabar pasakyk tą patį žodį gyvai.“ |
| nemalonus, 2 siuntimai | gavėjas liūdnas, abi pusės | „Abiem keliais Tomui liūdna.“ | tas pats sakinys |
| „Iš naujo“ | scena atstatyta, palyginimas tuščias | „Ką pasakysi Tomui?“ | „Pirma pasirink žodį.“ |

Septynios savybės, kurių negalima praleisti:

- **Vienas kintamasis:** `word` — ką vaikas pasako. Gavėjas, jų vieta ir veidų piešimas nesikeičia niekada; `channel` yra **kelias**, ne antras kintamasis, ir jis sąmoningai neturi jokios įtakos veidui — tai yra modelio teiginys, o ne dekoracija.
- **Geometrija 360 px:** scena `viewBox="0 0 360 308"`, `max-width:360px`; vaikai `art.kid(62, 240, 3.4)` ir `art.kid(298, 240, 3.4)`, galvos spindulys 27,2 px — 360 px ekrane veidas ~28 × 20 px, pakankamas šypsenai atskirti (LL-06). Balsas — trys arkos nuo galvos kraštų, kortelė — 64 × 42 px ties `translate(148 56)`, **virš galvų**, nes kortelė, užklojusi veidą, paslėptų būtent tą pasekmę, kurią modelis turi parodyti (LL-24). Matuota viewBox koordinatėmis: už `viewBox` niekas neišeina, kortelė neužkloja nė vieno veido.
- **Įėjimai ir klaviatūra:** `<button>` visi elementai, `Tab` per žodžius, kanalus ir „Siųsti“, `Enter`/`Space` aktyvuoja, `aria-pressed` žymi pasirinkimą, `aria-labelledby` grupuoja. Visi taikiniai ≥ 48 px (`min-height:3rem`).
- **Fokusas** (LL-32): „Siųsti“ be pasirinkto žodžio ne užrakinamas, o `focus()` eina į pirmą žodį ir `api.note` pasako, kodėl; uždėti valdikliai žymimi `aria-disabled`, ne `disabled`, kad fokusas neprapultų.
- **Grįžtamasis ryšys** — `readout` po siuntimo, `api.note` sako **kodėl**; `api.progress({ correct: true })` kviečiamas tik tada, kai `shown.gyvai && shown.ekranas` — t. y. kai abu keliai išbandyti **su tuo pačiu žodžiu** (dabartis, ne istorija — LL-17), ir ne po pirmo siuntimo (LL-29). Žodžio keitimas išvalo `shown` ir `reportedFor`, taigi pažanga negali būti „paveldėta“ iš kito žodžio. „Iš naujo“ pažangos netrina (LL-16).
- **Garsas:** vienas `api.speak` kvietimas vienam siuntimui, o sakinys imamas iš `config.sentences` **kaip visuma** (`say.live.warm`, `screen.cold`, `both.warm` …), ne sujungiamas kode — `speech.js` turi vieną `<audio>` ir `playToken`, todėl antras kvietimas nutrauktų pirmą, o sulipdytas sakinys manifeste neegzistuotų (LL-145). Vietoj rodyklės `#zv-compare` atnaujinamas tik po siuntimo, ne kas kadrą (LL-14).
- **Be laikmačių, be ėjimų limito, be „game over“.** Siuntimas kartojamas tiek, kiek vaikas nori.

**Užduotys.**

| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
|---|---|---|---|---|---|
| 1 | atpažinimas | „Kaip jaučiasi draugas, perskaitęs žodį „Ačiū“ ekrane?“ — „Liūdna“ / „Linksma“ / „Neramu“ | 1 | „Liūdna“ — raidės laikomos atšaldančiomis žodį | „Pagalvok, ar raidės keičia žodžio prasmę.“ |
| 2 | taikymas | „Kuo skiriasi žodis ekrane nuo to paties žodžio gyvai?“ — „Niekuo, žodis pasiekia taip pat“ / „Ekrane žodis žmogaus nepasiekia“ / „Ekrane žodis netenka prasmės“ | 0 | „Ekrane žodis žmogaus nepasiekia“ — būtent modelio klaidinga nuostata | „Prisimink modelį: keitėsi kelias, o kas liko?“ |
| 3 | perkėlimas | „Kas nutinka žmogui, kai jis perskaito nemalonų žodį?“ — „Nieko, tai tik raidės“ / „Jis jaučiasi įskaudintas“ / „Ekranas jį apsaugo“ | 1 | „Nieko, tai tik raidės“ — ekranas laikomas apsauga | „Kas sėdi anapus ekrano?“ |
| 4 | perkėlimas | „Kaip padėti draugui, gavusiam nemalonų laišką?“ — „Atsakyti tuo pačiu“ / „Nustoti rašyti visiems“ / „Parašyti jam gerą žodį“ | 2 | „Atsakyti tuo pačiu“ — atsakymas kartoja žodį, o ne keičia jausmą | „Prisimink, kaip jis jaučiasi dabar.“ |
| 5 | perkėlimas (`optional: true`) | „Kodėl taisyklė „rašyk kaip pasakytum gyvai“ padeda?“ — „Nes ekrane žodis nepasiekia“ / „Nes anapus ekrano yra žmogus“ / „Nes ekranas apsaugo nuo jausmų“ | 1 | „Nes ekranas apsaugo nuo jausmų“ — modelio nuostata apversta | „Prisimink, ką matei modelyje su veidais.“ |

Atsakymų indeksai 1 / 0 / 1 / 2 / 1 — ne visi tame pačiame indekse (`validate_content.py` tikrina pasiskirstymą). Nė viena užuomina nekartoja teisingo varianto žodžių (tikrinta `hint_leaks_option`).

**Refleksija.** „Ką parašytum draugui, kad jis nusišypsotų?“ Klausiama žodžiu, nevertinama; laukiamas atsakymas — vaikas įvardija **žodį**, o ne kanalą.

**Modelio ribos (pasakomos vaikui ir mokytojui).**

1. **Modelis rodo du žodžius, o tikrovėje jų būna daug.** Todėl `readout` sako „linksma“ / „liūdna“, o ne „teisingai“ / „neteisingai“; modelis nepretenduoja išmokyti viso mandagumo sąrašo.
2. **Gavėjo atsakymo nėra.** Modelis parodo jausmą, o ne tai, ką žmogus atsakys; tikras pokalbis lieka mokytojui.
3. **Kanalas supaprastintas iki dviejų.** Tikrovėje yra balsas, vaizdo įrašas, grupė, ženklas; modelis ima du, nes du pakanka pasekmės tapatumui parodyti (T1.2).
4. **„Savo ir kito asmens duomenų saugojimas“ neparodomas.** Programa jį įvardija (`:105–106`), bet tai **antra sąvoka**; modelyje jos nėra, kad tame pačiame kadre neliktų dviejų idėjų. Ji lieka mokytojo veiklai ir atskiram moduliui.
5. **„Laiko planavimas virtualioje erdvėje“ neparodomas.** Ta pati priežastis: atskira sąvoka, atskiras modulis.

**Ką tai reiškia modulio autoriui.** `id` — `02-virtualumas` (dorinio ugdymo 02 eilė, nes 01 jau užimtas); `title` — „Ekranas žmogaus nepaslepia“ (26 simboliai); `subtitle` — „Per ekraną žodis pasiekia žmogų taip pat, kaip gyvai“; `minutes` — 9; trys `outcomes` veiksmažodžiu („Pasakau, kad žmogus kitoje ekrano pusėje jaučia taip pat.“, „Pasirenku draugišką žodį ir paaiškinu, kodėl jis padeda.“, „Atskiriu, ką galima rašyti draugui, o ko ne.“); `concept.title` — „Žodis per ekraną“; `concept.big_idea` — „Ekrane žmogus yra tikras žmogus. Žodis jį pasiekia taip pat, kaip gyvai. Jis jaučia tą patį.“ (92 simboliai); `concept.steps` — keturi žingsniai po ≤10 žodžių; `concept.example` — „Rūta parašė Tomui: „Ačiū, kad padėjai“. Tomas perskaitė ir nusišypsojo. Jei ji būtų parašiusi „Tu man netrugink“, Tomas būtų nuliūdęs.“ — pavyzdys mini **abiejus** modelio žodžius, todėl neprieštarauja simuliacijai (LL-142). Įrašytas į `content/lt/grade-01/index.json` (dorinis ugdymas, po `01-susitarimas-ir-zaidimas`) ir į `path.json` — **po `01-susitarimas-ir-zaidimas`**, nes ten vaikas mokosi, kad susitarimas galioja visiems, o čia — kad žodis pasiekia žmogų ir per ekraną.

**Patikra.** Šis paleidimas (2026-11-23, #458) paleido visus vartus, kuriuos kartoja CI:

```
validate_content.py (visi)   -> 0 klaidų, 0 įspėjimų
check_language.py --grade 1  -> 0 klaidų, 0 įspėjimų (riba 10 ž.)
check_audio.py               -> 880 tekstų, 1760/1760 įrašų, visi Piper
check_art.py                 -> 0 klaidų (9 sims naudoja art.js)
check_docs_facts.py          -> 0 klaidų, „Sutampa su failais“
check_registry.py            -> 62/62/62/273/62/62, našlaičių 0
check_view.py --module 02-virtualumas --viewports desktop,phone,small --json
                             -> checked 3, problems: []
   1440 / 390 / 360: ovf 0, tasks 5/5, small 0, ctl 6, eyebrow 1/1, errors []
check_view.py --text-scale 200 (phone,small) -> scaled_problems: [], unapplied: []
check_svg_fit.py             -> 0 apkarpymų virš tolerancijos
```

Elgsenos zondas 360 px: po 1 siuntimo `#sim-readout` = „Rūta pasakė gyvai. Tomui linksma.“, palyginimas „Gyvai: Tomui linksma · Per ekraną: —“, gavėjo `data-mood="happy"`; po 2-o (tas pats žodis, kitas kelias) — „Abiem keliais Tomui linksma.“, palyginime abi pusės, `simDone: true`; su nemaloniu žodžiu — „Tomui liūdna“ ir `data-mood="sad"` abiem keliais; per siuntimą **vienas** `api.speak` kvietimas (vienas `src` priskyrimas); konsolės klaidų 0. Veido geometrija matuota viewBox koordinatėmis: už `viewBox` neišeina nė vienas elementas, kortelė neužkloja veido (`cardHitsGavejas: false`).

**Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, etika ir skaitmeninio turinio kūrimas (`sources/pradinio-bp-rekomendacijos-2024.txt:105–106`, `:12271–12273`, `:16434–16442`). Suler, J. (2004). The online disinhibition effect. *CyberPsychology & Behavior, 7*(3), 321–326. https://doi.org/10.1089/1094931041291295 · Widen, S. C., & Russell, J. A. (2008). Children acquire emotion categories gradually. *Cognitive Development, 23*(2), 291–312. https://doi.org/10.1016/j.cogdev.2008.01.002 · Piaget, J. (1932). *The Moral Judgment of the Child*. London: Kegan Paul.

### M-15 — Jungiklis lieka, mygtukas grįžta: šviesą laiko padėtis, o ne pirštas

**Data:** 2026-11-23 · **Tema:** 1 klasės technologijos, 23.4.1 „Elektros, elektronikos prietaisai… valdymo ypatumai — jungiklio, mygtuko panaudojimas“ (`sources/pradinio-bp-rekomendacijos-2024.txt:9788–9796`), programos pozicija `D:elektronika`, būsena `missing` (`research/wiki/curriculum/backlog.json`) · **Tikslas:** `content/lt/grade-01/technologijos/07-elektronika.json`

**Viena didelė idėja.** Tas pats veiksmas — paspaudimas ir paleidimas — baigiasi dviem būdais, ir skirtumą nuleidžia ne pirštas, o pats įtaisas. Jungiklis po paleidimo lieka nuspaustas, todėl šviesa dega toliau. Mygtukas grįžta atgal, todėl šviesa užgęsta iškart. Todėl „paspaudžiau“ dar nepasako, kas bus toliau: pasakyti gali tik valdiklio padėtis, o ne vaiko noras.

**Ką sako programa.** 23.4.1 punktas 1–2 klasei prašo ne vien grandinės: „Nagrinėjami elektros prietaisai artimiausioje aplinkoje (pvz. šviestuvas…), aiškinamasi jų paskirtis, funkcijos, valdymas ypatumai – jungiklio, mygtuko panaudojimas ir pan.“ (`sources/pradinio-bp-rekomendacijos-2024.txt:9788–9796`; tas pats kartojama `:2094–2101`). Platformoje grandinės vientisumas jau yra: `01-elektros-grandine` trečias rezultatas sako „Parodau, kad jungiklis pertraukia tą patį kelią“, o `concept.steps` trečias žingsnis — „Uždaryk ir atidaryk jungiklį“. Mygtukas ten nepasirodo nė vienoje užduotyje: `grep -rin "mygtuk" content/lt/grade-01/technologijos/` randa **vieną** eilutę ir ji yra `01-elektros-grandine.json` `sources` tekste, o `grep -rin "atleis\|atleid" content/lt/grade-01/` — **0** eilučių (tikrinta 2026-11-23). Taigi skirtumas, kurį vaikas gyvenime daro kiekvieną dieną, platformoje neegzistuoja. 23.4.2 (saugus įjungimas ir išjungimas, baterijų surinkimas) sąmoningai **neimamas**: tai antra sąvoka tame pačiame kadre (T1.2) ir lieka mokytojo veiklai bei atskiram moduliui.

**Kodėl modelis, o ne paveikslėlis.** Paveikslėlis parodo jungiklį ir mygtuką, bet ne tai, kas nutinka **paleidus**. Nuoseklumas čia yra laiko, o ne formos dalykas: dviejų kadrų pora („paspausta / paleista“) vis tiek neparodo, kad vienu atveju šviesa dega be piršto, o kitu — ne. Modelis laiko veiksmą tapatų (paspaudimas → paleidimas) ir keičia tik vieną dalyką — kurį valdiklį vaikas paspaudė; tada vaikas mato lemputę ir valdiklio padėtį, kai piršto jau nebėra. Tai vienintelis būdas atskirti „aš laikau šviesą“ nuo „įtaisas laiko šviesą“ — ir vienintelis būdas parodyti, kad šviesos likimas priklauso nuo padėties, o ne nuo vaiko ketinimo.

**Ką rodo tyrimai.**
Osborne (1983) rodo, kad vaikai į pamoką ateina su savo kasdieniais elektros modeliais ir žodinis pataisymas jų nepakeičia; kaita vyksta per spėjimą, stebėjimą ir sąmoningą prieštarą. Iš to metodui išeina reikalavimas: modelis neturi nė vieno sakinio „elektra teka ratu“ ir nė vienos judančios srovės, o taisyklę vaikas sudaro po savo paties bandymo.
Chinn ir Brewer (1993), išnagrinėję, kaip keičiasi įsitikinimai susidūrus su prieštaraujančiu stebėjimu, parodė, kad vienas netikėtas atvejis modelį keičia retai: prieštara turi būti suprantama, kartojama ir ryški. Todėl modelis reikalauja **abiejų** valdiklių, spėjimo prieš kiekvieną pirmą paleidimą ir palyginimo eilutės — vienas bandymas dar nėra pamoka.
Bonawitz ir kt. (2011) parodė, kad tiesioginis paaiškinimas prieš veiklą susiaurina vaiko tyrinėjimą: vaikas nusprendžia, kad daugiau sužinoti nėra ko. Todėl pirmas žingsnis yra užduotis („paspausk ir pažiūrėk“), o ne taisyklė, ir paaiškinimas ateina po palyginimo (P2 — veiksmas prieš paaiškinimą).

**Klaidingos nuostatos ir kaip jos paneigiamos.**

1. **„Mygtukas ir jungiklis skiriasi tik išvaizda.“** Modelyje abi dėžutės vienodo dydžio (64 × 64), viename aukštyje, toje pačioje palangėje, o veiksmas tas pats. Skiriasi tik pasekmė — taigi skirtumas yra elgesyje, ne išvaizdoje.
2. **„Skirtumą lemia valdiklio dydis ar forma.“** Tai ta pati nuostata iš kitos pusės, ir ji paneigiama sąmoningu dizainu: dydis ir padėtis vienodi, skiriasi tik judanti dalis (svirtis, kuri lieka, ir knopkė, kuri grįžta). Vaikas, ieškodamas paaiškinimo „didesnis įsimena“, tokio pagrindo ekrane neranda.
3. **„Jei paspaudžiau ir užsidegė, šviesa liks.“** Tai ne vaiko fantazija: telefonas, televizorius ir lifto mygtukas tikrai „įsimena“, nes sprendžia prietaiso vidus. Modelis rodo paprastą lempą, kurioje sprendžia pati padėtis, ir **pats įvardija** šią ribą (žr. modelio ribas). Todėl modelis neįrodo, kad visi mygtukai tokie patys; jis rodo, kad be atminties lieka tik padėtis.
4. **„Šviesa dega, kol aš jos noriu.“** Jungiklis lieka nuspaustas, o pirštas jau nuimtas: šviesa dega toliau. Vaikas negali šviesos „nutraukti“ noru — tik pasukti jungiklį atgal. Tai matoma abiejose būsenose be teksto: šviečianti lemputė ir nuleista svirtis (LL-143 — abi būsenos turi savo įrodymą paveiksle).
5. **„Mygtukas sugedęs, nes šviesa užgęsta.“** Mygtukas veikė: šviesa degė, kol pirštas laikė, ir užgęsta būtent tą akimirką, kai knopkė grįžta aukštyn. Priežastis matoma tame pačiame kadre, todėl grįžtamasis ryšys sako „Mygtukas grįžo atgal. Šviesa užgęsta.“, o ne „nepavyko“ (T2.3, T5.1).

**Seka (konkretumas → pusiau abstraktus modelis → simbolis → perkėlimas).**

1. **Tikri du įtaisai klasėje.** Mokytojas duoda paspausti tikrą šviesos jungiklį ir tikrą durų skambutį (arba žibintuvėlio mygtuką). Vaikas paspaudžia, paleidžia ir pasako, kas liko, o kas grįžo. Tikslas: skirtumą pirma pajusti ranka, o ne perskaityti ekrane (T8.3).
2. **Ekranas, vienas valdiklis.** Ta pati lempa, jungiklis. Vaikas spaudžia „Paspausk“, tada spėja („Liks“ / „Užgęs“), tada „Atleisk“. Pamato: šviesa dega, svirtis liko žemyn. Tikslas: pirmas susidūrimas su tuo, kad pasekmė ateina **po** paleidimo.
3. **Antras valdiklis, ta pati lempa, tas pats veiksmas.** Mygtukas: „Paspausk“ → spėjimas → „Atleisk“. Pamato: knopkė grįžo, šviesa užgeso. Tikslas: skirtumą priskirti pačiam valdikliui, o ne nuotaikai ar atsitiktinumui.
4. **Simbolis — palyginimo eilutė.** Po abiejų bandymų atsiranda dvi eilutės: „Jungiklis ↓ liko“ ir „Mygtukas ↑ grįžo“, o po jomis — sakinys „Vienas lieka, kitas grįžta“. Tikslas: taisyklę pasakyti savais žodžiais tada, kai ji jau matyta du kartus ir abi eilutės yra ekrane.
5. **Perkėlimas į tris vietas.** Be modelio: kambario šviesa, durų skambutis, lifto mygtukas. Vaikas kiekvieną priskiria prie „lieka“ arba „grįžta“ ir pasako, kurį valdiklį rinktųsi, jei nori, kad šviesa degtų, kol jis grįš. Tikslas: taisyklė apie padėtį, o ne apie šią lempą.

**Privalomas spėjimo žingsnis prieš kiekvieną pirmą paleidimą.** Du spėjimai per visą modulį — po vieną kiekvienam valdikliui. Spėjimas turi lygiai du variantus („Liks“ / „Užgęs“), lieka matomas virš scenos iki paleidimo ir po jo niekada nevadinamas klaida (LL-15). Be spėjimo modelis virsta animacija: vaikas žiūri, kaip lemputė keičiasi, bet nepastebi, kas nutiko valdikliui. Spėjimas taip pat yra vienintelis būdas pamatyti nuostatą „paspaudžiau → liks“ **prieš** ją paneigiant, o ne po to, kai vaikas jau žino atsakymą.

**Simuliacijos specifikacija.** Komponentas `valdiklis`, failas `assets/js/sims/technologijos.js` (`art.js` jau turi visas reikalingas dalis — `art.defs`, `art.plank`, `art.block`, `art.ball`, `art.spot`, o pats failas jau kviečia `art.plank` 6 kartus, `art.defs`, `art.spot`, `art.flatShape`, `art.materialCube`, todėl `scripts/check_art.py` reikalavimas „≥3 `art.*` kvietimai“ tenkinamas ir LEGACY sąrašo liesti negalima). Registracija: `SIMS` bloke (`technologijos.js:1380–1385`) pridedama eilutė `"valdiklis": valdiklis,` po `"drabuziu-prieziura"`. `config`:

```json
{ "lamp": { "on": "Šviesa dega", "off": "Šviesa užgęsta" },
  "controls": [ { "key": "jungiklis", "label": "Jungiklis", "behaviour": "lieka" },
                { "key": "mygtukas",  "label": "Mygtukas",  "behaviour": "grizta" } ],
  "labels": { "press": "Paspausk", "release": "Atleisk", "guess": "Kas bus atleidus?",
              "stay": "Liks", "goes": "Užgęs", "again": "Iš naujo",
              "tableTitle": "Ką paliko pirštas" },
  "sentences": { "start": "Paspausk jungiklį arba mygtuką.",
                 "press": "Šviesa dega. Pirštas dar laiko.",
                 "guess": "Pirma spėk, tada atleisk.",
                 "stay":  "Jungiklis liko nuspaustas. Šviesa dega toliau.",
                 "goes":  "Mygtukas grįžo atgal. Šviesa užgęsta.",
                 "table": "Abu veikia. Vienas lieka, kitas grįžta.",
                 "reset": "Pradedam iš naujo. Jungiklis ir mygtukas atstatyti." } }
```

**Būsena išvedama, o ne įrašyta.** `config.controls[]` sąmoningai neturi lauko, ar po paleidimo šviesa dega. Tai vienintelė taisyklė komponente: `lit = c.behaviour === "lieka" ? c.down : c.pressed` — jungiklio atveju šviesą laiko jo padėtis (`down`), mygtuko — tik pirštas (`pressed`). Jei `behaviour` nežinomas, komponentas rašo `console.error` ir rodo „Valdiklis nesuderintas.“, o ne tyliai rodo užgesusią lempą. Tai ta pati taisyklė kaip M-07 (`kiekis = board.px / unit.px`), M-13 (`outcome(key) = key === "nieko" ? "safe" : "fall"`) ir M-14 (`MOOD[tones[i]]`): teiginys ekrane išvedamas iš tų pačių duomenų, kuriuos mato vaikas.

| Būsena | Ką vaikas mato | `readout` | `api.note` (= tariamas sakinys) |
|---|---|---|---|
| pradžia | lempa tamsi, jungiklio svirtis aukštyn, mygtuko knopkė aukštyn, tuščia palyginimo lentelė | „Kas laiko šviesą?“ | `sentences.start` |
| paspausta | lemputė šviečia, pasirinkto valdiklio judanti dalis nuspausta | „Šviesa dega.“ | `sentences.press` |
| spėjimas | virš scenos spėjimo eilutė, du mygtukai „Liks“ / „Užgęs“ | `labels.guess` | `sentences.guess` |
| atleista, jungiklis | svirtis liko žemyn, lemputė šviečia, lentelėje „Jungiklis ↓ liko“ | „Jungiklis liko. Šviesa dega.“ | `sentences.stay` |
| atleista, mygtukas | knopkė grįžo aukštyn, lemputė tamsi, lentelėje „Mygtukas ↑ grįžo“ | „Mygtukas grįžo. Šviesa užgęsta.“ | `sentences.goes` |
| lentelė pilna | abi eilutės ir abi rodyklės, spėjimas palygintas su dviejų eilučių lentele | „Vienas lieka, kitas grįžta.“ | `sentences.table` |
| „Iš naujo“ | scena atstatyta, lentelė su abiem eilutėmis lieka | „Pradedam iš naujo.“ | `sentences.reset` |

Septynios savybės, kurių negalima praleisti:

- **Vienas kintamasis:** `control` — kurį valdiklį vaikas paspaudė. Lempą, palangę, abiejų dėžučių dydį ir veiksmą (paspaudimas → paleidimas) laiko tas pats; tai yra modelio teiginys, o ne dekoracija, todėl dėžutės privalo būti vienodo dydžio ir viename aukštyje.
- **Geometrija 360 px:** scena `viewBox="0 0 328 300"`, `max-width:328px`; palangė `art.plank(10, 250, 308, 12)`; lempos pagrindas `art.block(150, 226, 0.9, "#8a8f96", "", "#5c6168")`, lemputė `art.ball(166, 168, 18, "#fff6d8", "#8a8f96")`; jungiklio dėžutė x 26–90, mygtuko dėžutė x 238–302, abi y 220–284 (64 × 64 ≈ 70 px 360 px ekrane, taikinys ≥ 48 px); svirtis `art.plank(40, 238, 36, 9, ±18)`, knopkė `art.ball(270, 246, 13)` (nuspausta — y 254). Švytėjimas — radialinis gradientas iš `art.defs("vd")`, kūgis — vienas `path`; išjungta lemputė `#cfd6dd`. Jokio horizontalaus slinkimo; 200 % tekste didėja tik užrašai (`min-width:0` ant tėvų).
- **Įėjimai ir klaviatūra:** visi elementai `<button>`; `Tab` eilė — jungiklis → mygtukas → „Paspausk“ → „Atleisk“ → „Iš naujo“; `Enter` / `Space` aktyvuoja; `aria-pressed` žymi nuspaustą valdiklį, `aria-live="polite"` — `readout`. `aria-label` pasako būseną žodžiais („Jungiklis nuspaustas, šviesa dega“), ne vien spalvą.
- **Fokusas** (LL-32): pasirinkus valdiklį fokusas eina į „Paspausk“; po paspaudimo — į spėjimo mygtukus; po spėjimo — į „Atleisk“; po paleidimo — į kito valdiklio „Paspausk“, o kai abu išbandyti — į „Iš naujo“. Nenaudojami valdikliai žymimi `aria-disabled` ir `focus()`, o ne `disabled`, kad fokusas neprapultų.
- **Grįžtamasis ryšys** — `readout` po paleidimo įvardija **padėtį**, `api.note` sako **kodėl**, ir niekada „teisingai“ (T2.3, T5.1). `api.progress({ correct: true })` kviečiamas vieną kartą, kai abu valdikliai turi `released === true` **dabartinėje** būsenoje ir lentelėje yra abi eilutės (LL-17), o ne po pirmo paleidimo (LL-29). „Iš naujo“ pažangos netrina (LL-16).
- **Garsas:** tariamos tik instrukcijos ir paaiškinimai iš `config.sentences` (7 frazės; kiekviena gauna po du įrašus — `n` ir `s` — tad manifestas išaugs iki 14 įrašų, jei tų pačių sakinių dar neturi), o `api.note` rodo **tą patį** sakinį, kuris tariamas — todėl ekranas ir balsas negali išsiskirti. Eilutės lentelėje ir `readout` netariamos kiekvieną kartą (LL-14).
- **Be laikmačių, be ėjimų limito, be „game over“.** Paleidimą galima kartoti tiek, kiek vaikas nori, ir abi būsenos turi savo įrodymą paveiksle: dega — švytėjimas ir nuleista svirtis, ne — tamsi lemputė ir grįžusi knopkė (LL-143).

**Užduotys.**

| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
|---|---|---|---|---|---|
| 1 | atpažinimas | „Paspausei mygtuką ir paleidai. Kas nutiko šviesai?“ — „Šviesa liko degti“ / „Šviesa užgeso“ / „Šviesa tapo ryškesnė“ | 1 | „Šviesa liko degti“ — paspaudimas laikomas įsiminimu | „Pažiūrėk į mygtuką po paleidimo.“ |
| 2 | taikymas | „Šviesą įjungi jungikliu ir išeini iš kambario. Kas bus?“ — „Šviesa degs toliau“ / „Šviesa užges iškart“ / „Šviesa degs tik minutę“ | 0 | „Šviesa užges iškart“ — šviesa priskiriama vaikui, ne padėčiai | „Pažiūrėk, ar jungiklis liko žemyn.“ |
| 3 | perkėlimas | „Durų skambutis nutyla paleidus mygtuką. Kodėl?“ — „Nes skambutis turi laikmatį“ / „Nes garsas nueina per sieną“ / „Nes mygtukas grįžta į vietą“ | 2 | „Nes skambutis turi laikmatį“ — pabaiga priskiriama prietaiso atminčiai, ne valdiklio padėčiai | „Skambutis neturi laikmačio — kas jį išjungia?“ |
| 4 | perkėlimas (`optional: true`) | „Jungiklis liko įjungtas visą naktį. Kas nutiks, jei jo neliesi?“ — „Šviesa degs iki ryto“ / „Šviesa užges po valandos“ / „Šviesa užges, kai visi užmigs“ | 0 | „Šviesa užges po valandos“ — laikas laikomas išjungėju | „Kas turi pasikeisti, kad šviesa užgestų?“ |

Atsakymų indeksai 1 / 0 / 2 / 0 — ne visi tame pačiame indekse (`validate_content.py` tikrina pasiskirstymą). Nė viena užuomina nekartoja teisingo varianto žodžių ir nė viena nepasako atsakymo: 3 užduoties užuomina mini „laikmatį“ — būtent **neteisingą** variantą.

**Refleksija.** „Kur namuose yra jungiklis, kuris lieka, ir mygtukas, kuris grįžta? Pasakyk abu.“ Klausiama žodžiu, nevertinama; laukiamas atsakymas — du daiktai, o ne taisyklės kartojimas. Tai patikrinimas be ekrano ir be balo (T5.3).

**Modelio ribos (pasakomos vaikui ir mokytojui).**

1. **Modelio lempa neturi atminties.** Telefone, televizoriuje ir lifte mygtuką paspaudus, prietaisas pats prisimena ir lieka įjungtas — ten sprendžia prietaiso vidus, o ne knopkė. Modelis rodo paprasčiausią atvejį ir tą ribą įvardija `teacher.offline` bei pokalbyje, o ne slepia.
2. **Paspaudimas ir paleidimas ekrane yra du bakstelėjimai**, o gyvenime — vienas judesys. Tai sąmoningas supaprastinimas: jis leidžia paleidimą padaryti atskiru, aiškiu žingsniu ir nereikalauja laikyti piršto (kas 6–7 m. vaikui ir klaviatūros naudotojui būtų sunku).
3. **Elektros neparodome.** Modelyje nėra jokios srovės, laidų spindėjimo ar judančių taškų; grįžtamasis ryšys yra tik šviesa (`research/wiki/guidelines/klausimai.md:21` — atviras klausimas apie elektrą kaip matomą medžiagą lieka atviras, o modelis jo neliečia).
4. **Nepasakoma, kada šviesą reikia išjungti.** Taupymas ir saugus naudojimasis (23.4.1 pabaiga, 23.4.2) yra atskira sąvoka (26.5.1 „energijos reikia visiems“) ir atskiras modulis.
5. **Valdiklių rūšių daugiau.** Ekrane yra du; tikrovėje yra sukamosios rankenėlės, jutikliai, laikmačiai. Modelis nepretenduoja aprėpti visų — jis atskiria tik „lieka“ ir „grįžta“.

**Ką tai reiškia modulio autoriui.** `id` — `07-elektronika` (technologijose 07 laisvas: užimti 01, 02, 03, 06; `backlog.json` eilutė `D:elektronika` nurodo būtent šį taką); `title` — „Mygtukas grįžta, jungiklis lieka“ (31 simbolis); `subtitle` — „Padėtis laiko šviesą, o ne pirštas“; `minutes` — 9; trys `outcomes` („Parodau, kad po paspaudimo jungiklis lieka, o mygtukas grįžta atgal.“, „Nuspėju, ar šviesa liks degti atleidus, ir pasitikrinu modelyje.“, „Paaiškinu, kas laiko šviesą įjungtą, o kas ją išjungia.“); `concept.title` — „Kas laiko šviesą?“; `concept.big_idea` — „Jungiklis ir mygtukas įjungia tą pačią šviesą. Skirtumas ryškus paleidus: jungiklis lieka nuspaustas, o mygtukas grįžta. Šviesa dega tol, kol jie lieka įjungti.“; `concept.steps` — keturi žingsniai po ≤8 žodžius; `concept.example` — „Namuose jungiklis lieka įjungtas. Durų skambutis skamba tik kol laikai.“ (pavyzdys mini **tuos pačius** du valdiklius kaip modelis ir neprieštarauja jam — LL-142); `sim` — `{ "component": "valdiklis", "config": { … } }`. Įrašius modulį jis turi patekti į `content/lt/grade-01/index.json` (technologijos, po `01-elektros-grandine`) ir į `path.json` — **po `01-elektros-grandine`**, nes ten vaikas mokosi, kad jungiklis pertraukia kelią, o čia — kad jo padėtis laiko šviesą.

**Patikra.** Metodo specifikacija surašyta kaip juodraštinis modulis (scratch kataloge, ne `content/`, todėl `git status` lieka švarus) ir paleisti abu vartai tuo pačiu keliu, kuriuo tikrina CI:

```
validate_content.check_module   -> 0 klaidų, 1 įspėjimas
   (įspėjimas: „nepavyko perskaityti simuliacijos „valdiklis“ kūno — sim.config gyvumas nepatikrintas“)
check_language.check_module     -> 0 radinių (1 kl. riba — 10 žodžių sakinyje)
```

Įspėjimas paliktas sąmoningai ir neapeitas: komponento dar nėra, todėl `sim.config` gyvumo (LL-61) patikrinti negalima. Jį privalo paleisti tas, kas rašys `valdiklis` į `technologijos.js` — su tikru komponento kūnu tas pats vartas turi duoti 0 įspėjimų. Rankinė patikra, kurią galima atlikti be modulio: kiekvienas `config` raktas (`lamp`, `controls`, `labels`, `sentences` ir jų vidus) turi atsirasti komponento kūne, o `behaviour` reikšmė turi būti lyginama su `"lieka"`, ne su `"jungiklis"`.

**Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, technologijos 23.4.1 (`sources/pradinio-bp-rekomendacijos-2024.txt:9788–9796`, `:2094–2101`). Osborne, R. (1983). Towards modifying children's ideas about electric current. *Research in Science & Technological Education, 1*(1), 73–82. https://doi.org/10.1080/0263514830010108 · Chinn, C. A., & Brewer, W. F. (1993). The role of anomalous data in knowledge acquisition: A theoretical framework and implications for science instruction. *Review of Educational Research, 63*(1), 1–49. https://doi.org/10.3102/00346543063001001 · Bonawitz, E., Shafto, P., Gweon, H., Goodman, N. D., Spelke, E., & Schulz, L. (2011). The double-edged sword of pedagogy: Instruction limits spontaneous exploration and discovery. *Cognition, 120*(3), 322–330. https://doi.org/10.1016/j.cognition.2010.10.001 · Shipstone, D. M. (1984). A study of children's understanding of electricity in simple DC circuits. *European Journal of Science Education, 6*(2), 185–198. https://doi.org/10.1080/0140528840060208 (naudotas tik kaip krypties patvirtinimas: vaikai grandinę aiškina vietiniais, nuosekliais modeliais, todėl ne „srovė“, o matoma pasekmė).

**Pastaba dėl pasiūlymo.** Ideatorius (#466) temą jau įrašė (`agents/proposals/2026-11-23-ideator-mygtukas-ir-jungiklis.json`), ir šis metodas ją **siaurina bei taiso**: (1) ideatorius durų skambutį priskyrė prie įtaisų, kurie „įsimena“, o iš tikrųjų skambutis kaip tik neturi atminties — jis yra **priešpriešinis** mygtuko pavyzdys, todėl metode jis perkeltas į 3-ą užduotį, o „įsimenantys“ prietaisai (telefonas, liftas) liko modelio riboje, ne užduotyje (LL-18 — variantas, kuris gyvenime teisingas, negali būti neteisingas atsakymas); (2) ideatorius rėmėsi vien lempa, o metodas įveda **matomą valdiklio padėtį** kaip antrą įrodymą tame pačiame kadre (LL-143); (3) ideatorius siūlė „paspaudžia ir paleidžia“ vienu judesiu, o metodas skaido į du bakstelėjimus, kad paleidimas būtų atskiras žingsnis ir nereikėtų laikyti piršto. Senesnis sistemos pasiūlymas `agents/proposals/backlog-d-elektronika-elektronika.json` tą pačią programos poziciją vadina `04-elektronika`; laikomasi `backlog.json` (ir žmogaus padengties bloko) tako `07-elektronika`, o 04 lieka laisvas.

### M-16 — Batas išdžius toks, koks džiūsta: formą užfiksuoja pabaiga, o ne šlapia pradžia

**Data:** 2026-11-24 · **Tema:** 1 klasės technologijos, 23.2.2 „Drabužių, avalynės priežiūra“ (`sources/pradinio-bp-rekomendacijos-2024.txt:9458–9468`) ir 9 skyriaus C3 „1 klasė. Drabužių, avalynės priežiūra. Praktiškai išbandomi avalynės sutvarkymo būdai“ (`:40061`; OCR tekste — „suvar tymo“) · **Tikslas:** `content/lt/grade-01/technologijos/08-avalynes-dziovinimas.json` (technologijose užimti 01, 02, 03, 06, 07 — 08 laisvas)

**Viena didelė idėja.** Šlapias odinis batas minkštas, todėl lengvai praranda formą. Sausas — kietas, todėl formos nebeatgauna. Formą užfiksuoja ne šlapia pradžia, o **pabaiga**: batas išdžiūsta tokios formos, kokioje stovi paskutinę džiūvimo akimirką. Todėl šlapius batus džioviname su įdėtu laikraščiu ar įdėklu — ne tam, kad būtų gražiau, o tam, kad būtų kam išlaikyti formą.

**Ką sako programa.** 23.2.2 punktas 1–2 klasei prašo „…ar/ir avalynės/tekstilės valymas be cheminių priemonių. Apibūdinami darbo procesai, vaizdo ir kt. savybės“ (`:9458–9468`), o 9 skyriaus C3 1 klasei įvardija būtent „Praktiškai išbandomi avalynės sutvarkymo būdai“ (`:40061`). Platformoje avalynė sąmoningai atidėta: `06-drabuziu-prieziura.json:98` `sources` lauke parašyta „— avalynė paliekama atskiram moduliui, kad modulyje liktų viena idėja“, o `teacher.goal` (`:85`) kartoja „Avalynės priežiūra (batų valymas ir džiovinimas) sąmoningai neįtraukta — tai atskiras modulis“. Metodo rašymo metu (2026-11-24, prieš #503) to modulio dar nebuvo: `ls content/lt/grade-01/technologijos/` rodė 01, 02, 03, 06, 07, o `grep -rin "avalyn" content/lt/grade-01/` rado tik tris eilutes, ir visos trys buvo `06-drabuziu-prieziura.json` tekstuose. Dabar `08-avalynes-dziovinimas.json` yra įrašytas į `index.json` ir `path.json`, o komponentas `batas` — į simuliacijų registrą. `research/wiki/curriculum/backlog.json` eilutė `D:drabuziu-prieziura` tuo tarpu pažymėta `covered`, nors jos `outcome` yra „1 klasė. Drabužių, avalynės priežiūra“, o `interactivity` — „Sekos pratimas: kaip prižiūri avalynę“. Tai ne padengtis, o pusė temos: drabužiai padengti, avalynė — ne (žr. pastabą dėl pasiūlymo).

**Kodėl modelis, o ne paveikslėlis.** Paveikslas gali parodyti tik vieną būseną: arba apvalią nosį, arba sulinkusią. Visa šios temos pasekmė yra **laike**: kol batas šlapias, jo forma dar kinta; kai sausas — nebekinta. Todėl reikia modelio, kuriame vaikas pats nustato, kas bus bato viduje, ir pats pastumia džiūvimą į priekį, o paskui pamato, kad nosies nebegalima grąžinti atgal. Tai vienintelis būdas atskirti dvi konkuruojančias nuostatas — „forma grįžta pati“ ir „formą laiko įdėklas“ — nes abi jos daro tą pačią prognozę tol, kol laikas nepajudėjo.

**Ką rodo tyrimai.**
Han, Hu ir Jiang (2018) parodė, kad kolagenas (odos pagrindas) yra **vandens valdomos formos atminties** medžiaga: vanduo išskiria tarppeptidinius vandenilinius ryšius, todėl šlapia oda tampa formuojama; džiūnant ryšiai susidaro iš naujo — bet jau naujose padėtyse, todėl deformuota forma tampa nauja pusiausvyros forma. Tai tiksliai tas mechanizmas, kurį modelis turi parodyti: formą fiksuoja džiūvimas, o ne šlapumas.
Batzer ir Kreibich (1981) parodė, kad vanduo ryškiai nuleidžia kolageno ir celiuliozės stiklinimo temperatūrą — būtent dėl vandenilinių ryšių nutraukimo. Iš to seka dvi modelio dalys: (1) „šlapias minkštas, sausas kietas“ nėra palyginimas, o ta pati medžiaga dviejose būsenose; (2) **tas pats galioja popieriui**, todėl perkėlimo užduotis su šlapiu lapu remiasi tuo pačiu šaltiniu, o ne analogija „iš galvos“.
Gopnik ir kt. (2001) parodė, kad net 2–4 metų vaikai daro išvadą apie priežastį iš **variacijos ir kovariacijos** modelio: kai vienas dalykas kinta, o kiti lieka tie patys. Todėl modelyje trys batai privalo būti vienodi iš viso, išskyrus vieną dalyką — turinį. Jei jie skirtųsi dydžiu ar spalva, vaikas priežastį galėtų priskirti jiems.
Kearney (2004), aprašydamas spėjimas–stebėjimas–paaiškinimas (POE) užduotis su multimedija, rodo, kad būtent **spėjimas prieš stebėjimą** ištraukia vaiko nuostatą į paviršių ir padaro stebėjimą prasmingą; be spėjimo vaikas žiūri animaciją ir nemato, ką ji paneigė.
Chinn ir Brewer (1993) rodo, kad vienas prieštaraujantis atvejis nuostatos beveik nekeičia — prieštara turi būti aiški ir kartojama. Todėl pažanga žymima ne po pirmo išdžiuvimo, o tada, kai tame pačiame kadre yra ir apvalus, ir sulinkęs batas.

**Klaidingos nuostatos ir kaip jos paneigiamos.**

1. **„Šlapias batas išdžius ir pats grįš į savo formą.“** Tai pagrindinė nuostata, ir ji kyla iš kasdienės patirties su guma ir putomis, kurios tikrai atsimena formą. Modelyje batas be įdėklo po džiūvimo lieka sulinkęs, ir jokia būsena nebegrąžina nosies atgal. Svarbu, kad modelis **neturi** mygtuko „ištiesinti“: jei jis būtų, vaikas manytų, kad užtenka pastangos.
2. **„Batas sulinko, nes buvo šlapias.“** Visi trys modelio batai yra vienodai šlapi, todėl šlapumas negali paaiškinti skirtumo: sulinko tik tas, kurio viduje nieko nebuvo. Šlapumas yra sąlyga, o ne priežastis.
3. **„Įdėklas reikalingas tam, kad batas greičiau išdžiūtų.“** Modelis neturi džiūvimo greičio — nė vieno skaičiaus, nė vienos laiko juostos su valandomis. Tai sąmoninga riba, kuri pasakoma, o ne slepiama (žr. modelio ribas).
4. **„Forma priklauso nuo to, kas buvo viduje pradžioje.“** Modelis tam priešinasi vienu judesiu: kol batai dar „džiūsta“, turinį galima pakeisti ir nosis išsitiesia; kai „sausa“ — nebegalima. Būsena išvedama iš paskutinės akimirkos, o ne iš istorijos (ta pati taisyklė kaip M-15 „šviesą laiko padėtis“ ir LL-20 „bauda, kuri išnyksta iki galutinio dydžio“).
5. **„Sulinkęs batas yra sugedęs visam laikui.“** Modelis to nepasako ir neturi pasakyti: jis baigiasi sausu batu ir nepretenduoja į batų taisymo pamoką. Ši riba įvardijama `teacher` bloke, o ne paliekama vaiko spėjimui.

**Seka (konkretumas → pusiau abstraktus modelis → simbolis → perkėlimas).**

1. **Du odos gabalėliai rankoje.** Mokytojas duoda sausą odos atraižą (arba sausą batą) ir šlapią odos atraižą (arba šlapią popieriaus juostelę). Vaikas abi sulenkia: sausa nelinksta, šlapia linksta kaip virvė. Tada šlapią sulenktą padeda į lėkštę ir palieka iki pamokos pabaigos — pamokos gale ji sausa ir **liko sulenkta**. Tikslas: skirtumą pirma pajusti ranka ir savo akimis, o ne perskaityti ekrane (T8.3).
2. **Ekranas, trys vienodi batai.** Trys vienodo dydžio, vienos spalvos, vienoje linijoje stovintys šlapi batai, visuose viduje „nieko“. Vaikas baksteli batą ir pasirenka, kas bus viduje: nieko → laikraštis → įdėklas. Tikslas: pajusti, kad batai patys savaime niekuo nesiskiria — skirtumą daro tik vidus.
3. **Spėjimas ir džiūvimas.** Vaikas spaudžia „Palauk“, pirmiausia pasako, kas bus visiems trims, tada batai pereina į „džiūsta“: ten, kur viduje nieko, nosis ima smukti. Dar galima pakeisti turinį — ir nosis išsitiesia. Tikslas: pamatyti, kad forma dar kinta, kol batas drėgnas.
4. **Simbolis — užrašas po batu.** Antras „Palauk“ užbaigia džiūvimą; po kiekvienu batu atsiranda jo paties užrašas: „Susilinko“ arba „Apvali“, o bato nosis nebekinta. Vaikas pasako taisyklę savais žodžiais: „batas išdžiūsta toks, koks yra džiūdamas“. Tikslas: žodį susieti su tuo, ką jis pats padarė, o ne su ekrano tekstu.
5. **Perkėlimas į tris vietas.** Šlapias popieriaus lapas, sulenktas ir padžiovintas; šlapias diržas, džiūvantis susuktas; šlapios pirštinės, numestos susmukusios. Vaikas kiekvienoje situacijoje pasako, kokia forma bus po džiūvimo ir ką reikėjo padaryti, kol daiktas šlapias. Tikslas: taisyklė apie medžiagą, kuri šlampa, o ne apie vieną batą.

**Privalomas spėjimo žingsnis.** Vienas spėjimas per vieną džiūvimą, trys variantai: „Visi trys liks apvalūs“ / „Visi trys susilinks“ / „Skirsis“. Spėjimas pasirenkamas po pirmo „Palauk“ ir dar **prieš** tai, kai batai pradeda džiūti (spėjimas paleidžia džiūvimą); jis lieka matomas virš scenos iki pabaigos ir po džiūvimo parodomas šalia rezultato („Tavo spėjimas: skirsis“), bet niekada nevadinamas klaida (LL-15). Be spėjimo modelis virsta animacija: vaikas žiūri, kaip keičiasi nosis, bet negali pasakyti, ko tikėjosi.

**Simuliacijos specifikacija.** Komponentas `batas`, failas `assets/js/sims/technologijos.js` (registracija: `SIMS` bloke, `technologijos.js:1847–1853`, eilutė `"batas": batas,` po `"valdiklis"`). Batas piešiamas kaip nauja `art.js` dalis `boot(x, baseY, s, sag, content)` — vienas kelias nosiai ir vienas kulnui, o `sag` (0–1) lenkia nosies viršų ir įjungia raukšlės liniją; `content` rodo, kas kyšo iš bato angos (nieko / baltas laikraštis / pilkas įdėklas). `art.js` jau turi `plank`, `block`, `pictogram`, `drops`, todėl grindų juostai ir vandens lašams naujų formų nereikia. `config`:

```json
{ "contents": [ { "key": "nieko",      "label": "Nieko" },
                { "key": "laikrastis", "label": "Laikraštis" },
                { "key": "idedas",     "label": "Įdėklas" } ],
  "stages": [ { "key": "slapias", "label": "Šlapias" },
              { "key": "dziusta", "label": "Džiūsta" },
              { "key": "sausas",  "label": "Sausas" } ],
  "labels": { "wait": "Palauk", "waitMore": "Palauk dar", "dry": "Batai sausi",
              "again": "Iš naujo",
              "guess": "Kas bus batams?", "same": "Visi liks apvalūs",
              "bent": "Visi susilinks", "split": "Skirsis",
              "round": "Apvali", "crooked": "Susilinko" },
  "sentences": { "start": "Trys šlapi batai. Bakstelėk batą ir pasirink, kas viduje.",
                 "nieko": "Bato viduje nieko.",
                 "laikrastis": "Bato viduje laikraštis.",
                 "idedas": "Bato viduje įdėklas.",
                 "guess": "Pirma spėk, kas bus batams.",
                 "dziusta": "Batai džiūsta. Nosis smunka ten, kur viduje nieko.",
                 "edit": "Dar drėgnas. Formą dar galima pakeisti.",
                 "sausas": "Batas jau sausas. Forma nebegrįš.",
                 "mixed": "Batai išdžiūvo nevienodai: vienur nosis apvali, kitur susilinkusi.",
                 "round": "Visi liko apvalūs, nes viduje buvo laikraštis ar įdėklas.",
                 "bent": "Visi susilinko, nes nė viename nebuvo nieko.",
                 "reset": "Vėl trys šlapi batai." } }
```

`sentences.mixed` sąmoningai neįvardija, kiek batų liko apvalūs: mišrus rezultatas gali būti ir vienas apvalus su dviem sulinkusiais, ir atvirkščiai. Todėl sakinys sako „vienur… kitur…“, o ne „vienas… kitas…“ — tekstas įrašytas pagal rezultatą, o ne pagal vieną pavyzdį (LL-33 šeima).

**Būsena išvedama, o ne įrašyta.** `config` sąmoningai neturi lauko „kas nutinka, kai viduje nieko“ — tai vienintelė taisyklė komponente:

```
sag(content, stage) = stage === "slapias" ? 0
                    : stage === "dziusta" ? (content === "nieko" ? 0.5 : 0)
                    :                        (content === "nieko" ? 1 : 0)
outcome(content)    = content === "nieko" ? "crooked" : "round"
```

Jei `content` neatpažintas, komponentas rašo `console.error` ir rodo „Batas nesuderintas.“, o ne tyliai rodo sulinkusį batą. Tai ta pati taisyklė kaip M-07 (`kiekis = board.px / unit.px`), M-13 (`outcome(key)`) ir M-15 (`lit = behaviour === "lieka" ? down : pressed`): teiginys ekrane išvedamas iš tų pačių duomenų, kuriuos mato vaikas. **Laikas nėra kintamasis:** dvi fiksuotos padėtys, nes džiūvimo greitis šioje temoje nemokomas (tai antra sąvoka, T1.2). Eiga tokia: pirmas „Palauk“ neatlieka nieko, o parodo spėjimą; spėjimas **paleidžia** džiūvimą (batai pereina į „džiūsta“); antras paspaudimas (jau „Palauk dar“) užbaigia džiūvimą. Todėl vaikas niekada nemato judančios nosies be savo spėjimo, o paspaudimas negali būti praleistas netyčia — mygtukas keičia vardą, o ne tik būseną.

| Būsena | Ką vaikas mato | `readout` | `api.note` (= tariamas sakinys) |
|---|---|---|---|
| pradžia | trys šlapi batai, nosys apvalios, po kiekvienu „Nieko“, spėjimo juostos dar nėra | „Kas bus viduje?“ | `sentences.start` |
| turinys pakeistas | to paties bato angoje matosi laikraštis arba įdėklas, užrašas po batu pasikeitė | „Bato viduje laikraštis.“ | `sentences.laikrastis` / `idedas` / `nieko` |
| spėjimas | spėjimo juosta su trimis mygtukais, batai dar šlapi, „Palauk dar“ dar nepasirodęs | „Pirma spėk.“ | `sentences.guess` |
| džiūsta (po spėjimo) | nosys, kurių viduje nieko, jau įlinkusios per pusę; spėjimas matomas virš scenos; mygtukas pervardytas į „Palauk dar“ | „Batai džiūsta.“ | `sentences.dziusta` |
| džiūsta, bakstelėtas batas | to paties bato nosis grįžta į apvalią, kai įdėtas laikraštis | „Dar drėgnas.“ | `sentences.edit` |
| sausas, mišru | vienas batas apvalus, kitas sulinkęs; po kiekvienu užrašas, spėjimas palygintas | „Vieni apvalūs, kiti sulinkę.“ | `sentences.mixed` |
| sausas, visi apvalūs | trys apvalios nosys, trys užrašai „Apvali“ | „Visi trys liko apvalūs.“ | `sentences.round` |
| sausas, visi sulinkę | trys sulinkusios nosys, trys užrašai „Susilinko“ | „Visi trys susilinko.“ | `sentences.bent` |
| sausas, bakstelėtas batas | niekas nepasikeitė, batas nejuda | „Batas jau sausas.“ | `sentences.sausas` |
| „Iš naujo“ | trys šlapi batai, visi „Nieko“, spėjimo juostos nėra | „Vėl trys šlapi batai.“ | `sentences.reset` |

Dešimt savybių, kurių negalima praleisti:

- **Vienas kintamasis:** `content` — kas bato viduje. Abiejų lyčių, spalvos ir dydžio skirtumo nėra: visi trys batai iš to paties `art.boot` kvietimo su tais pačiais parametrais, tik skirtingu `x`. Tai modelio teiginys, o ne dekoracija.
- **Geometrija 360 px:** `viewBox="0 0 340 300"`, `max-width:340px`, `width:100%`; grindų juosta `art.plank(8, 232, 324, 10)`; batų bazė `baseY = 232`, centrai `x = 62 / 170 / 278`, mastelis `s = 0.9` (batas ≈ 92 × 76 px, tarpai 16 px). Užrašas po batu — `font-size:var(--fs-s)` (15,2 px), `text-anchor:middle`, `y = 262`; ranka rašyti `font-size` negalima, nes LL-164 parodė, kad `.72rem` (11,5 px) praeina visus vartus ir lieka per mažas vaikui. Užrašas privalo tilpti į savo 92 px langelį (`Nieko`, `Laikraštis`, `Įdėklas`, `Apvali`, `Susilinko`): rezultato žodis trumpinamas („Apvali“, o ne „Liko apvali“), o ne šriftas (LL-06, LL-30). Jokio horizontalaus slinkimo.
- **Įėjimai ir klaviatūra:** trys bato mygtukai (88 × 76 px ekrane — ≥ 48 px), „Palauk“ / „Palauk dar“, trys spėjimo mygtukai, „Iš naujo“; visi `<button>`. `Tab` eilė: batas 1 → batas 2 → batas 3 → „Palauk“; kai rodoma spėjimo juosta — trys spėjimai; `Enter` / `Space` aktyvuoja. `aria-label` sako būseną žodžiais („Pirmas batas. Viduje nieko. Bakstelėk, kad pakeistum.“), ne vien spalvą; `aria-live="polite"` — `readout`.
- **Fokusas** (LL-32): paspaudus batą fokusas lieka tame bate (turinys sukasi ratu, todėl nereikia atskiro pasirinkimo meniu); paspaudus „Palauk“ be spėjimo — fokusas į pirmą spėjimo mygtuką; pasirinkus spėjimą — į „Palauk dar“; po antro paspaudimo — į „Iš naujo“. Sušalę batai žymimi `aria-disabled="true"` ir lieka fokusuojami, kad fokusas neprapultų, o bandymas juos pakeisti paaiškinamas `api.note`.
- **Grįžtamasis ryšys** paaiškina **kodėl**, o ne „teisingai“: `readout` įvardija, ką vaikas mato („Visi trys susilinko“), `api.note` — kodėl („…nes nė viename nebuvo nieko“). Niekada „neteisingai“ (T2.3, T5.1).
- **Pažanga** (`api.progress({ correct: true })`) kviečiama vieną kartą, kai po antro „Palauk“ **dabartinėje** būsenoje yra ir bent vienas apvalus, ir bent vienas sulinkęs batas (LL-17), o ne po pirmo paspaudimo (LL-29). Jei visi trys vienodi, pažanga nežymima, o `api.note` pasiūlo: „Į vieną batą įdėk laikraštį, į kitą nieko“ — klaida nevadinama, bandymas kartojamas. „Iš naujo“ pažangos netrina (LL-16).
- **Garsas:** tariamos tik `config.sentences` frazės (12; kiekviena gauna po du įrašus `n` ir `s`, tad manifestas išaugs 24 įrašais, jei tų pačių sakinių dar neturi), o `api.note` rodo **tą patį** sakinį, kuris tariamas — ekranas ir balsas negali išsiskirti. Užrašai po batais ir `readout` netariami kiekvieną kartą (LL-14).
- **Be laikmačių:** „Palauk“ nieko nelaukia — jis iškart perkelia į kitą padėtį; jokio `setInterval`, jokios animacijos, kuri tekėtų pati. Jei naudojama CSS perėja nosiai lenkti (0,6 s), ji grąžinama per `prefers-reduced-motion` į akimirksnį, o tekstas perėjos metu nesikeičia (LL-14).
- **Abi būsenos turi savo įrodymą paveiksle** (LL-143): apvali — apvali nosies linija ir užrašas „Apvali“, sulenkta — įlinkusi linija, raukšlė ir užrašas „Susilinko“. Spalva nėra vienintelis nešėjas.
- **Be „game over“, be skaičiavimo, kiek kartų bandei.** Batas niekada negadinamas negrįžtamai: „Iš naujo“ grąžina tris šlapius batus.

**Užduotys.**

| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
|---|---|---|---|---|---|
| 1 | atpažinimas | „Batas džiūsta be nieko viduje. Kaip atrodys nosis?“ — „Apvali, kaip buvo“ / „Susilinkusi“ / „Ilgesnė už batą“ | 1 | „Apvali, kaip buvo“ — tikimasi, kad forma grįš pati | „Pagalvok, kas laikė batą, kol jis džiūvo.“ |
| 2 | taikymas | „Parsinešei šlapius batus. Kaip elgsiesi pirmiausia?“ — „Įdėsiu laikraštį ir pastatysiu“ / „Paliksiu susmukusius džiūti“ / „Padėsiu vieną ant kito“ | 0 | „Paliksiu susmukusius džiūti“ — laukiama, kad forma grįš savaime | „Šlapias batas minkštas — formą reikia padėti dabar.“ |
| 3 | perkėlimas | „Šlapią lapą sulankstei ir palikai. Kaip atrodys po džiūvimo?“ — „Tiesus, nes popierius išsities“ / „Sulenktas toje pačioje vietoje“ / „Suvirškins nuo drėgmės“ | 1 | „Tiesus, nes popierius išsities“ — ta pati „forma grįžta“ nuostata, tik kitai medžiagai | „Šlapias popierius taip pat sukietėja džiūdamas.“ |
| 4 | perkėlimas (`optional: true`) | „Šlapias diržas džiūsta susuktas į ritinį. Kaip jį padėti?“ — „Palaukti, kol išdžius, tada ištiesinti“ / „Padėti tiesiai, kol dar šlapias“ / „Užlieti daugiau vandens“ | 1 | „Palaukti, kol išdžius, tada ištiesinti“ — laikoma, kad sausą odą galima tiesiog išlankstyti | „Kada oda dar lanksti — dabar ar po paros?“ |

Atsakymų indeksai 1 / 0 / 1 / 1 — ne visi tame pačiame indekse (`validate_content.py` tikrina pasiskirstymą). Nė viena užuomina nepasako atsakymo ir nekartoja teisingo varianto žodžių: 2 užduoties užuomina mini „dabar“, o ne „laikraštį“; 4 užduoties užuomina nurodo laiką, o ne veiksmą. 4 užduotyje sąmoningai nėra varianto „padėti ant radiatoriaus“: modelis šilumos neturi, o teisingas atsakymas negali priklausyti nuo to, ar radiatoriaus šeima turi (LL-18).

**Refleksija.** „Ką darysi su šlapiais batais, kai grįši namo?“ Klausiama žodžiu, neverinama; laukiamas atsakymas — veiksmas („Įdėsiu laikraštį“), o ne taisyklės kartojimas. Tai patikra be ekrano ir be balo (T5.3).

**Modelio ribos (pasakomos vaikui ir mokytojui).**

1. **Modelis rodo odinį batą, kurio nosis, kol šlapias, savaime smunka.** Ne kiekvienas batas taip elgiasi: storas ar kietas batas gali išlaikyti formą ir be įdėklo. Modelis rodo atvejį, kai įdėklas tikrai reikalingas, ir tai pasakoma `teacher.offline`, o ne slepiama.
2. **Laikraštis tikrame bate sugeria ir drėgmę**, o modelis rodo tik formą. Džiūvimo greitis modeliuojamas sąmoningai ne — jokių valandų, jokių „greičiau / lėčiau“.
3. **Šilumos modelis neturi.** Džiovinimas ant radiatoriaus, prie krosnies ar plaukų džiovintuvu lieka už šio modelio ribų; modelis apie tai nieko nesako ir neturi mokyti.
4. **Modelis baigiasi sausu batu ir nepasako, ką daryti su jau sulinkusiu.** Tikrovėje odą galima vėl sušlapinti ir bandyti formuoti: Han ir kt. (2018) rodo, kad vanduo vėl išskiria tuos pačius ryšius, todėl oda vėl tampa formuojama. Tai batų priežiūros darbas, ne 1 klasės veiksmas, ir modelyje jo nėra.
5. **Trys batai yra trys to paties modelio bato kopijos.** Tikrovėje du batai gali būti iš skirtingos odos ir džiūti skirtingai; modelis sąmoningai naikina šį skirtumą, kad liktų vienas kintamasis.

**Ką tai reiškia modulio autoriui.** `id` — `08-avalynes-dziovinimas`; `title` — „Batas išdžius toks, koks džiūsta“ (32 simboliai); `subtitle` — „Formą užfiksuoja džiūvimas, o ne šlapia pradžia“; `minutes` — 9; trys `outcomes` („Paaiškinu, kad šlapias batas išdžiūsta tokios formos, kokioje džiūsta.“, „Nuspėju, kurių batų nosis liks apvali, ir pasitikrinu modelyje.“, „Parodau, kad įdėtas laikraštis ar įdėklas išlaiko bato formą.“); `concept.title` — „Formą fiksuoja džiūvimas“; `concept.big_idea` — „Šlapias odinis batas minkštas, todėl lengvai susmunka. Džiūdamas jis sukietėja tokioje formoje, kokioje yra. Todėl į šlapius batus įdedame laikraštį ar įdėklą. Jis laiko formą, kol batas sausas.“ (194 simboliai); `concept.steps` — „Bakstelėk batą ir pasirink, kas bus viduje.“, „Spausk „Palauk“ ir pasirodys trys spėjimai.“, „Spėk, kas bus visiems trims.“, „Spausk „Palauk dar“ ir palygink su savo spėjimu.“; `concept.example` — „Namuose šlapius batus prikimšame laikraščiu ir statome džiūti.“ (pavyzdys mini tą patį veiksmą kaip modelis — LL-142); `sim` — `{ "component": "batas", "config": { … } }`. Įrašius modulį jis turi patekti į `content/lt/grade-01/index.json` (technologijos, po `06-drabuziu-prieziura`) ir į `path.json` **po `06-drabuziu-prieziura`**: ten vaikas rūšiavo drabužius prieš skalbimą, čia — padeda formą prieš džiūvimą; abu moduliai yra „ką padaryti prieš pasekmę“.

**Patikra.** Metodo specifikacija surašyta kaip juodraštinis modulis ir paleisti tie patys vartai, kuriuos paleidžia CI. Juodraštis buvo laikinai įrašytas tikslioje vietoje (`content/lt/grade-01/technologijos/08-avalynes-dziovinimas.json`) ir po patikros ištrintas — tuo metu `git status` rodė tik šį wiki failą, o `python3 scripts/validate_content.py --grade 1` po ištrynimo — 0 klaidų, 0 įspėjimų. Komponentas `batas` vartams paduotas kaip registruotas (registro dar nėra), todėl kūno patikra neįvyko ir lieka įspėjimas:

```
validate_content.check_module   -> 0 klaidų, 1 įspėjimas
   (įspėjimas: „nepavyko perskaityti simuliacijos „batas“ kūno — sim.config gyvumas nepatikrintas“)
check_language.check_module     -> 0 radinių (1 kl. riba — 10 žodžių sakinyje)
```

Pirmoji juodraščio versija davė **vieną tikrą radinį**, ir jis pataisytas, o ne apeitas: `concept.big_idea` paskutinis sakinys buvo 14 žodžių (riba — 10), todėl skaidytas į du („Todėl į šlapius batus įdedame laikraštį ar įdėklą. Jis laiko formą, kol batas sausas.“). Be to, keturių užduočių klausimai buvo performuluoti taip, kad turėtų klausiamąjį žodį, kurį tikrina `check_language` („Kokia bus nosis?“ → „Kaip atrodys nosis?“) — turinys nepakito, pakito tik formuluotė.

Įspėjimas paliktas sąmoningai ir neapeitas: komponento dar nėra, todėl `sim.config` gyvumo (LL-61) patikrinti negalima. Jį privalo paleisti tas, kas rašys `batas` į `technologijos.js` — su tikru komponento kūnu tas pats vartas turi duoti 0 įspėjimų. Rankinė patikra, kurią galima atlikti be modulio: kiekvienas `config` raktas (`contents`, `stages`, `labels`, `sentences` ir jų vidus) turi atsirasti komponento kūne, o `outcome` turi būti lyginamas su `"nieko"`, ne su `"pirmas"` ar bato numeriu.

**Atnaujinta 2026-11-24 (#504, pasiūlymas #46123).** #503 įrašė komponentą `batas`, todėl aukščiau aprašytas įspėjimas nebegalioja: `validate_content.py --grade 1 --strict` — 0 klaidų, 0 įspėjimų, o `check_registry.py --grade 1` — `PROBLEMŲ: 0`. Šiame skyriuje sulyginti su moduliu trys tekstai, kurių jame nebeliko — `subtitle` („…o ne šlapia pradžia“), `concept.steps` (spėjimas po „Palauk“, LL-173) ir `sentences.mixed` (skaičiui neutralus „vienur… kitur…“) — ir `labels.round` („Apvali“, o ne „Liko apvali“). `config` blokas dabar lygus modulio `sim.config` raktui po rakto; tai galima patikrinti perskaičiavus bloką kaip JSON ir palyginus su `content/lt/grade-01/technologijos/08-avalynes-dziovinimas.json` lauku `sim.config`.

**Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, technologijos 23.2.2 (`sources/pradinio-bp-rekomendacijos-2024.txt:9458–9468`) ir 9 skyriaus C3 (`:40061`). Han, Y., Hu, J., & Jiang, L. (2018). Collagen skin, a water-sensitive shape memory material. *Journal of Materials Chemistry B, 6*(31), 5144–5152. https://doi.org/10.1039/c8tb01346b · Batzer, H., & Kreibich, U. T. (1981). Influence of water on thermal transitions in natural polymers and synthetic polyamides. *Polymer Bulletin, 5*(11–12), 585–590. https://doi.org/10.1007/BF00255296 · Gopnik, A., Sobel, D. M., Schulz, L. E., & Glymour, C. (2001). Causal learning mechanisms in very young children: Two-, three-, and four-year-olds infer causal relations from patterns of variation and covariation. *Developmental Psychology, 37*(5), 620–629. https://doi.org/10.1037/0012-1649.37.5.620 · Kearney, M. (2004). Classroom use of multimedia-supported predict–observe–explain tasks in a social constructivist learning environment. *Research in Science Education, 34*(4), 427–453. https://doi.org/10.1007/s11165-004-8795-y · Chinn, C. A., & Brewer, W. F. (1993). The role of anomalous data in knowledge acquisition: A theoretical framework and implications for science instruction. *Review of Educational Research, 63*(1), 1–49. https://doi.org/10.3102/00346543063001001

**Pastaba dėl pasiūlymo.** Ideatorius (#44721) temą jau įrašė (`agents/proposals/2026-11-24-ideator-avalynes-dziovinimas.json`), ir šis metodas ją **susieja ir sugriežtina**: (1) ideatorius siūlė tris skirtingai prikimštus batus iš karto, o metodas duoda vaikui pačiam nustatyti turinį — kitaip modelis neturi kintamojo ir virsta iliustracija (gairių P2); (2) ideatorius siūlė „stumti laiką“, o metodas laiką skaido į dvi fiksuotas padėtis — 6–7 m. vaikui slankiklis su valandomis įneša antrą sąvoką (T1.2), o džiūvimo greitis šioje temoje nemokomas; (3) ideatorius rašė, kad „be įdėklo nosis sulinksta“ kaip taisyklę, o metodas tai įvardija kaip **modelio atvejį** ir modelio ribose pasako, kad kietas batas gali išsilaikyti ir be įdėklo — kitaip modelis mokytų netiesos (LL-18); (4) ideatoriaus pavyzdžiai (wikishoes.org, jihua3515.com) pakeisti moksliniais šaltiniais su DOI, o laikraščio dviguba paskirtis (forma ir drėgmė) atskirta, kad modelis liktų apie vieną dalyką. `research/wiki/curriculum/backlog.json` eilutė `D:drabuziu-prieziura` vis dar `covered` ir tebevardija tik `06-drabuziu-prieziura`, nors avalynės modulis `08-avalynes-dziovinimas` jau įrašytas — tai programos-derintojo darbas (`backlog.json` sąrašo atnaujinimas), ne šio metodo.

### M-17 — Taisyklė, o ne lempa: ta pati pora jungiklių, trys kortelės

**Data:** 2026-11-25 · **Tema:** 1 klasės matematika (integruota informatika), B2.3 „Atpažįsta ir vykdo komandų sekas, pasirinkimo komandą, **skiria logines operacijas: NE, IR, ARBA**“ (`sources/pradinio-bp-rekomendacijos-2024.txt:12284`; lentelės antraštė „1-2 klasės 3-4 klasės“ — `:12278`), metų plano tema „Loginės operacijos: NE, IR, ARBA“ (`:22786–22792`), `research/wiki/curriculum/kti-dalykai-1-klase.md:115` · **Tikslas:** `content/lt/grade-01/matematika/35-logines-operacijos-ir-arba-ne.json` · **Pasiūlymas:** #50535 · **Šaltinis:** [[../../foundations/taisykle-ir-daiktas|taisyklė ir daiktas]]

**Viena didelė idėja.** Lempą valdo ne jungiklis ir ne pati lempa, o taisyklė, kurią pasako kortelė. Toje pačioje poroje jungiklių trys kortelės duoda tris skirtingas lempos būsenas. Todėl klausimas „kodėl dega?“ turi antrą dalį: „pagal kurią taisyklę?“

**Ką sako programa ir ko platformoje nėra.** B2.3 yra 1–2 klasių stulpelyje ir apima komandų seką bei pasirinkimo komandą, bet loginės operacijos jame išvardytos atskirai — kaip tai, ką vaikas turi **skirti**, o ne apibrėžti. Platformoje komandų seka jau yra (`24-komandu-seka`), grandinės vientisumas — `01-elektros-grandine`, o jungiklio ir mygtuko skirtumas — `07-elektronika`. Nė viename iš jų taisyklė neegzistuoja kaip atskiras, keičiamas dalykas: jungiklis ten vienas, o jo elgsena — paties daikto savybė. Patikra: `grep -rin "logines operacij\|loginių operacij" content/lt/grade-01/` → **0** eilučių, `grep -rln "jungik" content/lt/grade-01/*/*.json` → 2 failai (abi technologijos). Loginių operacijų pozicijos nėra ir `research/wiki/curriculum/backlog.json` (47 pozicijos, `grep -o "operacij[a-z]*"` → 0), todėl šis modulis negalėjo atsirasti iš padengties eilės — tik iš pasiūlymo.

**Kodėl modelis, o ne paveikslėlis ir ne sakinys.** Paveikslas su trimis degančiomis eilutėmis jau pasako atsakymą, o sakinys „kortelė BENT VIENAS reiškia bent vieną“ pasako jį dar tiesiau. Abu jie turi tą pačią ydą: vaikas neturi ką patikrinti. Modelis duoda vienintelį dalyką, kurio paveikslas negali — **tą pačią porą jungiklių su kita kortele**, kai jungikliai nejuda nė per pikselį, o keičiasi tik kortelė. Tada priežastis atsiskiria nuo daikto mechaniškai, o ne iš teksto. Antras interaktyvumo argumentas — spėjimas prieš kiekvieną įjungimą: be jo modelis virstų lempučių demonstracija.

**Ką rodo tyrimai (ir kodėl būtent taip).**

1. **Tas pats žodis duoda priešingus atsakymus.** Braine ir Rumain (1981) tyrė 5–6 metų vaikus ir rado, kad komandos užduotyje („paduok vieną“) jie „arba“ suprato **išskirtinai** (vieną, ne abu), o tikrumo įvertinimo užduotyje — kaip jungtuką „ir“ (abu). Autoriai padarė išvadą, kad disjunkcijos supratimas komandoje ateina anksčiau negu jos teisingumo sąlygų žinojimas. Tai reiškia, kad apie žodį sutarti negalima: reikia ką nors, kas parodo pasekmę.
2. **Ikimokyklinukai „arba“ dažnai sustiprina iki „ir“.** Singh, Wexler, Astle-Rahim, Kamawar ir Fox (2016) parodė, kad vaikai disjunkcinį sakinį neretai supranta kaip jungtinį („abu“), nors suaugusieji tą patį sakinį supranta išskirtinai; autoriai tai aiškina pragmatiniu sustiprinimu, o ne neišmanyta semantika.
3. **Literatūra nesutaria, ką vaikas iš tikrųjų supranta.** Jasbi ir Frank (2021), ištyrę ikimokyklinukus paprastuose egzistenciniuose sakiniuose, rado, kad jų disjunkcijos supratimas yra **daug panašesnis į suaugusiųjų**, negu buvo manyta ankstesniuose darbuose. Vadinasi, vienas tyrimas ir viena užduotis negali būti sąvokos matas — reikia matomos pasekmės, kurią vaikas pasigamina pats, o ne sakinio apie žodį.
4. **Kasdienė vartosena nėra logikos taisyklė.** Morris (2008) rado, kad „ir“ vaikai pradeda vartoti anksčiau nei „arba“, kad ankstyvas vartojimas paprastai nėra loginis ir kad „arba“ tiek vaikų, tiek suaugusiųjų kalboje dažniausiai yra **išskirtinis**.
5. **Neigimas anksti suprantamas, bet ne sudėtinio sakinio atžvilgiu.** Reuter, Feiman ir Snedeker (2018) parodė, kad 2–3 metų vaikai „ne“, „ne…“ ir „negali“ supranta palankioje situacijoje, bet supratimas priklauso nuo konteksto. Todėl modelyje NE nėra aiškinamas žodžiu: jis parodomas kaip atskira kortelė, kuri dega ten, kur kita nedega.

Iš šių penkių išvadų metodui lieka viena: **vaikui nereikia paaiškinti, ką reiškia „arba“; jam reikia parodyti, ką daro kortelė, ir duoti kortelę perskaityti.** Todėl kortelės užrašas yra ne vien operatorius, o operatorius ir jo paaiškinimas: `ABU (IR) — reikia abiejų`, `BENT VIENAS (ARBA) — užtenka vieno`, `NE — ne abu`.

**Klaidingos nuostatos ir kaip jos paneigiamos.**

1. **„Kiekvienas jungiklis uždega lempą.“** Vaikas įjungia vieną jungiklį ir laukia šviesos; kortelė ABU jos neduoda. Paneigiama ne tekstu, o tuo, kad tas pats vienas įjungtas jungiklis su trimis kortelėmis duoda dvi skirtingas pasekmes: su ABU tamsu, su BENT VIENAS ir su NE — dega.
2. **„Jei parašyta ARBA, tai reiškia vieną, o ne abu.“** Tai ne išgalvota klaida — taip „arba“ vartojama kasdienėje kalboje ir taip jį komandos užduotyje supranta 5–7 metų vaikai (Braine ir Rumain, 1981; Morris, 2008). Paneigiama dviem dalykais: kortelėje parašyta „užtenka vieno“, o lentelė rodo **tris** degančias eilutes. Modelis sąmoningai neklausia „ką reiškia žodis arba“ — jis klausia „ką daro ši kortelė“, todėl klaidinga nuostata apie žodį lieka teisinga, o apie kortelę — ne (LL-18).
3. **„NE išjungia lempą.“** Vaikas NE supranta kaip išjungimo mygtuką. Modelis rodo priešingai: sujungus abu jungiklius kortelė ABU dega, o kortelė NE — ne; kai abu išjungti, ABU tyli, o NE dega. Neigimas čia yra **apvertimas**, ir jis matomas kaip dviejų lentelių veidrodis.
4. **„Lempa pati žino, kada degti“** (daikto savybė). Tai ta pati nuostata kaip M-06 („spalva yra daikto pavadinimas“) ir M-07 („skaičius pasako ilgį“), tik apie elgseną. Paneigiama tuo, kad lempa nekinta nė karto: keičiasi tik kortelė, o lempa paklūsta.

**Seka (konkretumas → modelis → simbolis → perkėlimas), 5 žingsniai.**

1. **Klasė be ekrano, keturi vaikai kaip mašina.** Du vaikai laiko po kortelę „įjungta“ / „išjungta“, trečias laiko lemputės kortelę, ketvirtas tyliai perskaito taisyklę iš sulankstyto lapelio. Lemputės vaikas pakelia kortelę tik tada, kai taisyklė tenkinama. Klasė spėja prieš kiekvieną kėlimą. Tada mokytojas pakeičia **lapelį**, o jungiklių vaikai lieka tie patys. Tikslas: pajausti, kad pasikeitė ne mašina, o taisyklė.
2. **Ekranas, pirmoji kortelė.** Du jungikliai, viena lempa, kortelė `ABU (IR) — reikia abiejų`. Vaikas spėja („Degs“ / „Nedegs“), tada įjungia. Spėjimas lieka lentelės stulpelyje „Spėjai“, rezultatas — „Lempa“. Tikslas: pamatyti pasekmę savo veiksmu.
3. **Antroji kortelė, tie patys jungikliai.** `BENT VIENAS (ARBA) — užtenka vieno`. Jungikliai prasideda toje pačioje padėtyje, eilutės tos pačios. Vaikas pamato, kad su vienu jungikliu dabar dega. Tikslas: skirti dvi taisykles, kai viskas kita lieka taip pat.
4. **Trečioji kortelė `NE — ne abu` ir simbolis.** Lentelė apsiverčia: dega ten, kur ABU nedegė. Po kiekviena baigta lentele atsiranda požymis („Kortelė ABU dega tik su abiem jungikliais.“), o trys požymiai sustoja vienas šalia kito. Tikslas: taisyklę įvardyti vienu sakiniu, o ne skaičiuoti eilutes.
5. **Perkėlimas.** Trys užduotys be modelio: kita kortelė (`ABU` su vienu jungikliu), ta pati taisyklė kitame daikte (skambutis su dviem mygtukais) ir atvirkštinė užduotis — iš elgsenos atpažinti kortelę. Tikslas: taikyti taisyklę ten, kur kortelės nesimato.

**Privalomas spėjimo žingsnis.** Prieš kiekvieną pirmą to atvejo įjungimą `api.readout` sako: „Pirma spėk, kas bus su lempa.“ Kol vaikas nepasirinko „Degs“ arba „Nedegs“, mygtukas „Įjunk“ neaktyvus, bet **ne `disabled`**: jis paaiškina „Pirma spėk. Tada įjunk jungiklį.“ ir perkelia fokusą į spėjimo mygtukus (LL-04, LL-32). Spėjimas niekada neištrinamas ir niekada nevadinamas klaida: jis lieka lentelės stulpelyje šalia rezultato, todėl palyginimas matomas (LL-15). Be spėjimo modelis virsta lempučių demonstracija: vaikas spaudžia tol, kol pamato įdomią būseną, ir sąryšio nesudaro (tas pats pavojus kaip M-01–M-16, `research/wiki/foundations/sujungti-dydziai.md`).

**Simuliacijos specifikacija.** Komponentas `taisykle-ir-lempa`, failas `assets/js/sims/matematika.js` (`registry.js` jau importuoja `matematika.js`, registracijos keisti nereikia). `config`:

```json
{ "switches": [ { "key": "kaire",  "label": "Kairys" },
                { "key": "desine", "label": "Dešinys" } ],
  "cards": [ { "key": "abu",  "label": "ABU",          "op": "IR",   "gloss": "reikia abiejų" },
             { "key": "bent", "label": "BENT VIENAS",  "op": "ARBA", "gloss": "užtenka vieno" },
             { "key": "ne",   "label": "NE",           "op": "NE",   "gloss": "ne abu" } ],
  "cases": [ { "key": "kaire",  "label": "tik kairys" },
             { "key": "desine", "label": "tik dešinys" },
             { "key": "abudu",  "label": "abu įjungti" } ],
  "labels": { "on": "Degs", "off": "Nedegs", "test": "Įjunk",
              "tableCase": "Jungikliai", "tableGuess": "Spėjai", "tableLamp": "Lempa",
              "again": "Iš naujo" },
  "sentences": { "start": "Du jungikliai, viena lempa ir kortelė.",
                 "rule": "Kortelė pasako taisyklę.",
                 "guess": "Pirma spėk, kas bus su lempa.",
                 "locked": "Pirma spėk. Tada įjunk jungiklį.",
                 "isjungtiDega": "Abu išjungti. Lempa dega.",
                 "isjungtiTamsu": "Abu išjungti. Lempa nedega.",
                 "kaireDega": "Kairys įjungtas. Lempa dega.",
                 "kaireTamsu": "Kairys įjungtas. Lempa nedega.",
                 "desineDega": "Dešinys įjungtas. Lempa dega.",
                 "desineTamsu": "Dešinys įjungtas. Lempa nedega.",
                 "abuduDega": "Abu įjungti. Lempa dega.",
                 "abuduTamsu": "Abu įjungti. Lempa nedega.",
                 "abuBaigta": "Kortelė ABU dega tik su abiem jungikliais.",
                 "bentBaigta": "Kortelė BENT VIENAS dega ir su vienu.",
                 "neBaigta": "Kortelė NE dega visur, kur ABU nedega.",
                 "lyginu": "Ta pati pora jungiklių. Kita kortelė, kita lempa.",
                 "visos": "Trys kortelės. Ta pati pora jungiklių.",
                 "whyAbu": "Kortelė ABU laukia abiejų jungiklių.",
                 "whyBent": "Kortelei BENT VIENAS užtenka vieno jungiklio.",
                 "whyNe": "Kortelė NE dega priešingai negu ABU.",
                 "vel": "Valom nuo pradžių. Abu jungikliai išjungti." } }
```

**Būsena išvedama, o ne įrašyta.** `config.cards[]` sąmoningai neturi lauko, ar lempa dega: tai vienintelė taisyklė komponente —

```
lit(card, a, b) = card.op === "IR"   ? (a && b)
                : card.op === "ARBA" ? (a || b)
                :                      !(a && b)   // NE = „ne abu“
```

Jei `op` neatpažintas, komponentas rašo `console.error` ir rodo „Kortelė nesuderinta.“, o ne tyliai tamsią lempą. Tai ta pati taisyklė kaip M-07 (`kiekis = board.px / unit.px`), M-15 (`lit = behaviour === "lieka" ? down : pressed`) ir M-16 (`outcome(content)`): teiginys ekrane išvedamas iš tų pačių duomenų, kuriuos mato vaikas — lentelė ir lempa negali išsiskirti.

| Būsena | Ką vaikas mato | `readout` | `api.note` |
|---|---|---|---|
| pradžia | abu jungikliai išjungti, lempa pagal kortelę, pirma lentelės eilutė („abu išjungti“) jau užpildyta | `sentences.isjungtiDega` / `isjungtiTamsu` | `sentences.rule` |
| spėjimo laukia | trys spėjimo mygtukai, „Įjunk“ neaktyvus ir paaiškina, kas jį atrakina | `sentences.guess` | `sentences.locked` |
| spėjimas pasirinktas | spėjimas matomas virš lentelės, „Įjunk“ aktyvus | — | — |
| atvejis atliktas | eilutėje spėjimas ir lempos būsena, jungiklio svirtis matomoje padėtyje | `sentences.<atvejis>Dega` / `Tamsu` | `sentences.why<kortelė>` |
| kortelė baigta (3 atvejai) | po lentele – vienas požymis | `sentences.abuBaigta` / `bentBaigta` / `neBaigta` | tas pats sakinys |
| antra kortelė baigta | du požymiai vienas šalia kito, jungikliai toje pačioje padėtyje | `sentences.lyginu` | `sentences.lyginu` |
| visos trys kortelės baigtos | trys požymiai, trys lentelės lieka matomos | `sentences.visos` | tas pats |
| „Iš naujo“ | atvejai išvalyti, požymiai lieka | `sentences.vel` | — |

Dešimt savybių, kurių negalima praleisti:

- **Vienas kintamasis:** `case` — kurį iš trijų jungiklių derinių vaikas bando. Kortelė yra **raundo sąlyga**, o ne antras kintamasis: ją pakeitus lentelė pradedama iš naujo (nebaigtos eilutės išvalomos), o jau baigtų lentelių požymiai lieka matomi. Kortelė niekada neužrakinama — jei vaikas nori grįžti atgal, jis grįžta ir bando iš naujo be jokių nuobaudų (LL-04). Jungiklių padėtis, lempos vieta ir kortelės dydis nekinta nė karto — tai modelio teiginys, o ne dekoracija (LL-27).
- **Pirma lentelės eilutė rodoma iš karto.** Abu išjungti — pradinė padėtis, kurią vaikas mato įėjęs, todėl ji įrašoma į lentelę be spėjimo. Be jos modelis turėtų trijų eilučių lentelę ir ketvirtą nepaaiškintą lempos būseną; su ja lentelė yra **pilna** (visi keturi įėjimai), o vaikui nereikia nė vieno papildomo bakstelėjimo.
- **Geometrija 360 px:** scena `viewBox="0 0 328 300"`, `max-width:328px`, `width:100%`; jungiklių dėžutės 72 × 72 px (x 24–96 ir 232–304, y 150–222), lemputė `art.ball(164, 92, 26)`, lentynėlė `art.plank(8, 222, 312, 12)`, kortelės lizdas 132 × 56 px (x 98, y 236). Lentelė — HTML po scena: trys stulpeliai 128 / 92 / 92 px ir du 8 px tarpai = 328 px, keturios eilutės po 34 px; šriftas `var(--fs-s)` (15,2 px), ne mažesnis (LL-06, LL-164). Kortelių sąrašas — **vertikali** trijų mygtukų kolona po 328 × 56 px, o ne trys mygtukai vienoje eilutėje: „BENT VIENAS“ telefone netelpa į trečdalį pločio ir lūžtų žodis (LL-186). Jokio horizontalaus slinkimo.
- **Įėjimai ir klaviatūra:** jungiklių dėžutės `<button>` po 72 × 72 px (`aria-pressed`), trys spėjimo mygtukai ≥ 48 px, „Įjunk“ 328 × 56 px, trys kortelių mygtukai 328 × 56 px, „Iš naujo“ ≥ 48 px. `Tab` eilė: kairys → dešinys → spėjimas → „Įjunk“ → kortelės → „Iš naujo“; `Enter` / `Space` aktyvuoja; `aria-live="polite"` — `readout`.
- **Fokusas** (LL-32): pasirinkus spėjimą fokusas eina į „Įjunk“; po rezultato — į kitą neišbandytą atvejį; baigus kortelę — į pirmą neišbandytą kitos kortelės atvejį; baigus visas — į „Iš naujo“. Neaktyvūs elementai žymimi `aria-disabled` ir lieka fokusuojami, o bandymas juos paspausti paaiškinamas `api.note`, o ne tyli.
- **Grįžtamasis ryšys** paaiškina **kodėl**, o ne „teisingai“: `readout` įvardija, kas įjungta ir kas su lempa, o `api.note` duoda vieną priežasties sakinį iš `why<kortelė>`. Niekada „neteisingai“ (T2.3, T5.1). `readout` neperrašomas kiekvieną kadrą (LL-14).
- **Pažanga** (`api.progress({ correct: true })`) — vieną kartą, kai **visų trijų** kortelių lentelės užpildytos **dabartinėje** būsenoje (LL-17), o ne po pirmos eilutės (LL-29). „Iš naujo“ pažangos netrina (LL-16). Užverstos kortelės raundo modelyje nėra: tai perkėlimas, jis vyksta užduotyje, o ne simuliacijoje.
- **Garsas:** tariamos tik `config.sentences` frazės (21; kiekviena gauna po du įrašus `n` ir `s`, tad manifestas išaugs 42 įrašais, jei tų pačių sakinių dar neturi). Lentelės antraštės ir jungiklių pavadinimai netariami (mažas manifestas), `api.note` rodo **tą patį** sakinį, kuris tariamas.
- **Abi būsenos turi savo įrodymą paveiksle** (LL-143): dega — švytėjimas ir šviesus stiklas, ne — tamsus stiklas ir matomas siūlelis; jungiklio svirtis visada rodo padėtį. Spalva niekada nėra vienintelis informacijos nešėjas.
- **Be laikmačių, be ėjimų limito, be „game over“.** Kortelę galima keisti tiek kartų, kiek vaikas nori; „Iš naujo“ nieko nebando.

**Užduotys.**

| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
|---|---|---|---|---|---|
| 1 | atpažinimas | „Kortelė ABU. Įjungtas tik kairys jungiklis. Ar dega lempa?“ — Taip, lempa dega / Ne, lempa nedega / Lempa dega trumpai | Ne, lempa nedega (1) | „Taip“ — kiekvienas jungiklis laikomas uždegėju | „Prisimink, ką darei modelyje su vienu jungikliu.“ |
| 2 | taikymas | „Kortelė BENT VIENAS. Įjungti abu jungikliai. Kas bus su lempa?“ — Lempa degs / Lempa nedegs / Lempa mirksės | Lempa degs (0) | „Nedegs“ — kasdienis išskirtinis „arba“ | „Prisimink, kiek eilučių degė su šia kortele.“ |
| 3 | perkėlimas | „Skambutis skamba, kai paspaustas bent vienas mygtukas. Tu paspaudei abu mygtukus. Ar skambės?“ — Ne, nes reikia vieno mygtuko / Ne, nes du mygtukai trukdo / Taip, skambės | Taip, skambės (2) | pirmas — ta pati išskirtinė nuostata kitame daikte | „Modelyje tokia pat taisyklė buvo ant vienos kortelės.“ |
| 4 | perkėlimas (`optional: true`) | „Kortelės nesimato. Su vienu jungikliu lempa nedega. Su abiem — dega. Kuri kortelė buvo?“ — BENT VIENAS / ABU / NE | ABU (1) | „BENT VIENAS“ — atsakoma pagal tai, kad „daugiau jungiklių = daugiau šviesos“ | „Prisimink lentelę: kiek eilučių degė su kiekviena kortele.“ |

Atsakymų indeksai 1 / 0 / 2 / 1 — ne visi tame pačiame indekse (`validate_content.py` tikrina pasiskirstymą). Nė viena užuomina nepasako atsakymo: 2-oji nurodo į lentelę, 3-ioji — į modelyje matytą kortelę, 4-oji — į eilučių skaičių, o ne į kortelės vardą. 3 užduotyje sąmoningai nėra varianto „Ne, nes skambutis turi laikmatį“: toks prietaisas gyvenime egzistuoja, tad jis negali būti neteisingas atsakymas (LL-18).

**Refleksija.** „Kuri kortelė tave nustebino? Kodėl?“ Klausiama žodžiu, nevertinama; laukiamas atsakymas apie savo patirtį („BENT VIENAS, nes degė su vienu“), o ne taisyklės kartojimas (T5.3).

**Modelio ribos (pasakomos vaikui ir mokytojui).**

1. **Kasdienėje kalboje „arba“ dažniausiai reiškia vieną, o ne abu** (Morris, 2008), ir modulis to neneigia. Kortelė BENT VIENAS yra **logikos** kortelė, o jos reikšmė parašyta ant jos pačios: „užtenka vieno“. Vaikas mokosi skaityti kortelę, o ne atspėti žodžio reikšmę.
2. **Kortelė NE neigia vieną sakinį — „abu įjungti“.** Modelyje NE niekada nestovi prie „bent vienas“, todėl vaikas nemato dvigubo neigimo. Tai sąmoningas siaurinimas: neigti sudėtinį sakinį („ne (bent vienas)“) 6–7 metų vaikui būtų antra sąvoka tame pačiame kadre (T1.2).
3. **Modelis neturi tiesos lentelės ir nerašo „1“ / „0“.** Žymėjimas yra požymis sakiniu ir lentelės eilutė; sutartiniai loginiai simboliai (∧, ∨, ¬) priklauso vyresnei klasei (LL-23).
4. **Keturi įėjimai, trys atvejai vaikui.** Ketvirtas (abu išjungti) rodomas iš karto ir nėra spėjamas: jis skirtas tam, kad lentelė būtų pilna, o ne tam, kad vaikas jį atskirai tirtų.
5. **Lempa dega arba ne — trečios būsenos nėra.** Tikrovėje lemputė gali būti perdegusi, blyksėti ar būti blanki; modelis rodo tik „dega / ne“, nes trečia būsena įneštų antrą sąvoką.
6. **Tai ne įgūdžio įrodymas.** Teisingas atsakymas reiškia, kad vaikas perskaitė kortelę ir palygino su lentele, o ne kad jis savarankiškai skiria logines operacijas be atramos; Braine ir Rumain (1981) rodo, kad teisingumo sąlygos 6–7 metais dar tik formuojasi, todėl modulis sąmoningai remiasi matoma pasekme.

**Ką tai reiškia modulio autoriui.** `id` — `35-logines-operacijos-ir-arba-ne`; `title` — „Kortelė pasako, kada degs lempa“ (31 simbolis); `subtitle` — „Trys kortelės, ta pati pora jungiklių, kita lempos būsena“ (57); `minutes` — 9; trys `outcomes` („Pasakau, kada lempa degs, kai žinau kortelės taisyklę.“, „Palyginu tris korteles su tais pačiais jungikliais.“, „Paaiškinu, kad lempą valdo taisyklė, o ne jungiklis.“); `concept.title` — „Taisyklė, o ne lempa“; `concept.big_idea` — „Ta pati pora jungiklių dega kitaip, nes taisyklę pasako kortelė. Lempa pati nieko nenusprendžia.“ (96); `concept.steps` — keturi žingsniai iš sekos 2–4; `concept.example` — „Žaislinis robotas važiuoja, kai įjungtas jo jungiklis ir uždėta baterija.“ (pavyzdys rodo tą pačią sąvoką kitame daikte, o ne kartoja modelį — LL-142); `teacher.offline` — keturių vaikų mašina su popierinėmis kortelėmis; `teacher.misconceptions` — trys nuostatos iš šio skyriaus; `sim` — `{ "component": "taisykle-ir-lempa", "config": { … } }`. Modulis įrašomas į `content/lt/grade-01/index.json` (matematika, po `24-komandu-seka`) ir į `path.json` **po `24-komandu-seka`**: ten vaikas vykdė komandas iš eilės, čia — nusako, pagal kokią taisyklę komandų pora duoda vieną rezultatą; abu moduliai yra „taisyklė prieš veiksmą“. Numeris `35-` laisvas (`ls content/lt/grade-01/matematika/` → didžiausias 34).

**Patikra.** Metodo specifikacija surašyta kaip juodraštinis modulis, laikinai įrašytas tikslioje vietoje (`content/lt/grade-01/matematika/35-logines-operacijos-ir-arba-ne.json`) ir po patikros ištrintas; po ištrynimo `git status` švarus. Komponentas `taisykle-ir-lempa` vartams paduotas kaip registruotas (registro dar nėra), todėl kūno patikra neįvyko:

```
validate_content.check_module   -> 0 klaidų, 1 įspėjimas
   (įspėjimas: „nepavyko perskaityti simuliacijos „taisykle-ir-lempa“ kūno —
    sim.config gyvumas nepatikrintas“)
check_language.check_module     -> 0 radinių (1 kl. riba — 10 žodžių sakinyje)
validate_content.py --grade 1 --strict (be juodraščio) -> 0 klaidų, 0 įspėjimų
check_language.py --grade 1 --strict (be juodraščio)   -> 0 klaidų, 0 įspėjimų (53 pastabos)
```

Pirmoji juodraščio versija davė **du tikrus radinius**, ir abu pataisyti, o ne apeiti: 4 užduoties `why` buvo 11 žodžių (riba — 10) ir skaidytas į du sakinius; 3 užduoties `hint` prasidėjo įvardžiu „Ši“ (`check_language` „neaiški nuoroda pradžioje“), todėl performuluotas į „Modelyje tokia pat taisyklė buvo ant vienos kortelės.“ Toliau sąmoningai vengta žodžio „arba“ visuose vaikui skaitomuose laukuose, kuriuos tikrina `AMBIGUOUS` (`check_language.py:107`): operatorius „ARBA“ gyvena tik `concept.big_idea` ir `sim.config.cards[].op`, o kortelės užrašas vaikui yra „BENT VIENAS — užtenka vieno“. Taip dviprasmybės vartas nebūna apeinamas — jis neturi ko rasti, nes kortelė pati pasako savo reikšmę.

Įspėjimas paliktas sąmoningai ir neapeitas: komponento dar nėra, todėl `sim.config` gyvumo (LL-61) patikrinti negalima. Jį privalo paleisti tas, kas rašys `taisykle-ir-lempa` į `matematika.js`: su tikru komponento kūnu tas pats vartas turi duoti 0 įspėjimų. Rankinė patikra be modulio: kiekvienas `config` raktas (`switches`, `cards`, `cases`, `labels`, `sentences` ir jų vidus) turi atsirasti komponento kūne, o `lit()` turi būti lyginamas su `op` reikšmėmis `"IR"`, `"ARBA"`, `"NE"`, ne su kortelės vardais.

**Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, informatika B2.3 (`sources/pradinio-bp-rekomendacijos-2024.txt:12284`, `:12278`) ir 1–2 klasės metų plano tema (`:22786–22792`); `research/wiki/curriculum/kti-dalykai-1-klase.md:115`. Braine, M. D. S., & Rumain, B. (1981). Development of comprehension of „or“: Evidence for a sequence of competencies. *Journal of Experimental Child Psychology, 31*(1), 46–70. https://doi.org/10.1016/0022-0965(81)90003-5 · Morris, B. J. (2008). Logically speaking: Evidence for item-based acquisition of the connectives AND & OR. *Journal of Cognition and Development, 9*(1), 67–88. https://doi.org/10.1080/15248370701836600 · Singh, R., Wexler, K., Astle-Rahim, A., Kamawar, D., & Fox, D. (2016). Children interpret disjunction as conjunction: Consequences for theories of implicature and child development. *Natural Language Semantics, 24*(4), 305–352. https://doi.org/10.1007/s11050-016-9126-3 · Jasbi, M., & Frank, M. C. (2021). Adults' and children's comprehension of linguistic disjunction. *Collabra: Psychology, 7*(1), 27702. https://doi.org/10.1525/collabra.27702 · Reuter, T., Feiman, R., & Snedeker, J. (2018). Getting to no: Pragmatic and semantic factors in two- and three-year-olds' understanding of negation. *Child Development, 89*(4), e364–e381. https://doi.org/10.1111/cdev.12858 · Kearney, M. (2004). Classroom use of multimedia-supported predict–observe–explain tasks. *Research in Science Education, 34*(4), 427–453. https://doi.org/10.1007/s11165-004-8795-y

**Pastaba dėl pasiūlymo.** Ideatorius (#50535) temą įrašė (`agents/proposals/2026-11-25-ideator-logines-operacijos-ir-arba.json`), ir šis metodas ją **susieja ir sugriežtina**: (1) ideatorius siūlė, kad vaikas pasirinktų taisyklę ir pamatytų, jog „įjungus abu jungiklius lempa užsidega“ — palikta, bet papildyta spėjimu prieš kiekvieną įjungimą ir keturių eilučių lentele, nes be jų pasekmė matoma, o sąryšis ne (gairių P2, `sujungti-dydziai.md`); (2) ideatorius „NE“ apibūdino kaip reikšmės apvertimą — tai išlaikyta, bet NE tapo **atskira kortele**, kuri neigia sakinį „abu įjungti“, o ne trečiąja nepriklausoma taisykle, nes 6–7 metų vaikui „NE“ be sakinio, kurį neigia, neturi ką apversti (T1.2, LL-23); (3) ideatoriaus sakinys „vaikas mano, kad 'arba' reiškia vieną ar kitą, bet ne abu“ yra teisingas kaip **kalbos** pastebėjimas (Morris, 2008), todėl jis nepaverstas klaida, kurią reikia išguiti: kortelė turi savo užrašą, o modelio ribose pasakyta, kad kasdienė vartosena išlieka (LL-18); (4) ideatorius rėmėsi tik programos tekstu, o metodas prideda šešis recenzuojamus šaltinius su DOI ir vieną naują `foundations` įrašą.

### M-18 — Dailė: ta pati dėmė, trys lapai — keturios, dvi ir viena pusė

**Data:** 2026-11-26 · **Tema:** 1 klasės dailė, „Meninės išraiškos bruožai“: „dėmė (juoda, balta, spalvota, didelė, maža ir kt.)“ ir „fonas (vienspalvis, įvairiaspalvis ir kt.)“ (`sources/pradinio-bp-rekomendacijos-2024.txt:13571, 13576`; sąrašo antraštė „Reikšminiai žodžiai. 1-2 klasės“ — `:13558`) · **Tikslas:** `content/lt/grade-01/daile/04-deme-ir-fonas.json` · **Pasiūlymas:** #54787 · **Šaltinis:** [[../../foundations/iliuzija-ir-faktas|iliuzija ir faktas]]

**Viena didelė idėja.** Dėmė neturi savo „matomumo“. Kraštas matomas tik ten, kur jį liečia **kita** spalva. Todėl toje pačioje vietoje, su ta pačia dėme, galima turėti keturias matomas puses, dvi arba vieną — ir dėmė nebus pakeista nė karto.

**Ką sako programa ir ko platformoje nėra.** Dailės 1–2 klasių reikšminių žodžių sąraše yra ir **dėmė**, ir **fonas** („vienspalvis, įvairiaspalvis ir kt.“), ir jie yra toje pačioje „Meninės išraiškos bruožų“ grupėje kaip forma, linija ir spalva. Platformoje dailėje trys moduliai — `01-spalva-ir-nuotaika` (spalva keičia įspūdį, forma lieka), `02-erdvines-raides` (raidė iš dalių) ir `03-piesimo-priemones` (linijos storį lemia priemonė). Dėmė juose jau yra (`grep -c 'dėmė\|dėmės\|dėmę'` → 01: **9**, 02: 0, 03: **1**), bet ten keičiasi **pati dėmės spalva**, o ne tai, kas ją liečia. **Fondo nėra nė viename**: `grep -c 'fonas\|fono\|fone\|foną\|fonų' content/lt/grade-01/daile/*.json` → 0, 0, 0. Fondo sąvoka programoje priskirta būtent 1–2 klasei, tad tai ne vyresnės klasės temos nuleidimas žemyn.

**Kodėl modelis, o ne paveikslėlis ir ne sakinys.** Paveikslas su trimis lapais jau pasako atsakymą, o jį perskaičius nereikia nieko daryti. Modelis duoda tai, ko paveikslas negali: **tą pačią dėmę tame pačiame lape**, kur keičiasi tik tai, kas liečiasi su jos kraštu. Vaikas pats perjungia lapą ir pamato, kad dėmė nejudėjo — pasikeitė tik jos kraštas. Antras argumentas yra skaičiuojamumas: matomų pusių skaičius yra 4, 2 ir 1, ir jį vaikas gali suskaičiuoti pirštais, o ne „pajausti“.

**Kodėl NE iliuzija (ir tai yra svarbiausias šio metodo sprendimas).** Ideatorius siūlė simultaninį kontrastą — tą pačią pilką dėmę ant šviesaus ir tamsaus fono. To daryti negalima, nes **to efekto jautrumas su amžiumi didėja**: Rosetti ir kt. (2025), ištyrę 513 dalyvių nuo 6,5 iki 18,9 metų, rado, kad kontrasto, judančių gyvačių ir Kanizsa iliuzijų jautrumas didėja, Müller-Lyer — mažėja, o Ebbinghaus — nekinta. Tas pats darbas rodo, kad kontrasto iliuzijos **kontrolinėje** sąlygoje rezultatas su amžiumi gerėjo, t. y. šviesumo suvokimas 6 metais dar nesusiformavęs. Jei modelio branduolys būtų „dėmė atrodo tamsesnė“, 6–7 metų vaikas gali efekto nemanyti matyti — o tada modelis jam meluoja, o tekstas „matai, kaip pasikeitė?“ prašo patvirtinti tai, ko nėra. Todėl matas pakeistas iš **juntamo atspalvio** į **suskaičiuojamą kraštą**. Iliuzija lieka ne atmesta kaip neteisinga, o atidėta vyresnei klasei, kur mokinys jau skiria „aš žinau“ nuo „aš matau“.

**Ką rodo tyrimai (ir kodėl būtent taip).**

1. **Kraštas yra tas, kuris slepia.** Cuthill, Stevens, Sheppard, Maddocks, Párraga ir Troscianko (2005) lauko eksperimente su paukščiais parodė, kad kamufliažo raštai **ant kūno kontūro** slepia labiau negu tie patys raštai kūno viduje, o didelis kontrastas tą efektą sustiprina. Tai tiesioginis pagrindas modeliui, kuriame keičiamasi ne dėmės vidus, o tai, kas liečia jos kraštą.
2. **Fonas nėra „fonas“ kaip dekoracija.** Stevens ir Merilaita (2009) apžvalgoje atskiria fono atitikimą (krypsį) ir trikdantįjį raštą kaip du skirtingus maskavimosi mechanizmus. Modeliui tai reiškia, kad „fonas“ nėra viena savybė: lapas su juostomis ir lapas su lopais duoda **skirtingą** rezultatą, nors abu yra „ne tušti“.
3. **Šviesumas priklauso nuo santykinio ploto.** Gilchrist ir Radonjic (2009) parodė, kad dvejopos sferos atveju tamsesnio sektoriaus šviesumas priklauso nuo jo ploto, o šviesiausias plotas visada atrodo baltas. Tai paaiškina, kodėl didelis tos pačios spalvos plotas keičia ir dėmės šviesumą — dar vienas argumentas, kodėl suvokimo efektas netinka būti 6–7 metų vaiko matu.
4. **Figūros ir fono atskyrimas šiame amžiuje dar lavinamas.** Yoon, Winawer, Witthoft ir Markman (2007) parodė, kad ikimokyklinukai labai sunkiai atpažįsta dviejų tonų nuotraukoje paslėptą gyvūną net su originalu šalia, o vyresni vaikai tą patį padaro nesunkiai. Todėl modelis turi duoti bandyti daug kartų ir neturi vieno „teisingo“ žiūrėjimo.

**Klaidingos nuostatos ir kaip jos paneigiamos.**

1. **„Dėmė matoma dėl savo spalvos.“** Tai ta pati nuostata kaip M-06 („spalva yra daikto pavadinimas“) ir M-07 („skaičius pasako ilgį“), tik apie matomumą. Paneigiama tuo, kad modelis dėmės nekeičia nė karto: trijuose lapuose ji ta pati, o matomų pusių skaičius 4 → 2 → 1. Jei matomumą lemtų spalva, skaičius nekistų.
2. **„Jei krašto nesimato, dėmė dingo.“** Vaikas, pamatęs susiliejusį plotą, gali manyti, kad lopas dėmę uždengė. Paneigiama mygtuku „Parodyk kraštą“, kuris toje pačioje vietoje parodo brūkšninį kontūrą: dėmė ten pat, tik jos ribos su tos pačios spalvos lopu nėra.
3. **„Lopas dedamas ant dėmės viršaus.“** Tai suaugusiojo, ne vaiko klaida, ir ji labai tikėtina kuriant modelį. Realybėje dėmė ir fonas yra **tas pats dažų sluoksnis** ant lapo: lopas dedamas šalia, o susilieja tik jų bendra riba. Modelis, kuriame lopas uždengia dėmę, mokytų neteisingo dalyko — kad fonas „padedamas ant“ piešinio.
4. **„Daugiau lopų — mažiau matosi.“** Antras lapas turi 16 lopų langelių ir 6 matomas atkarpas, trečias — 15 lopų ir 3 atkarpas. Skaičiuojama ne lopų kiekis, o tai, ar lopas liečia **visą** krašto pusę.

**Seka (konkretumas → modelis → simbolis → perkėlimas), 5 žingsniai.**

1. **Klasė be ekrano, trys lapai ir trys apskritimai.** Mokytojas duoda tris vienodus rudus apskritimus ir tris lapus: baltą, su storomis rudomis juostomis viršuje ir apačioje, ir su rudais lopais prie trijų pusių. Vaikas klijuoja po apskritimą ir pirštu braukia per kraštą. Tikslas: pajausti, kad apskritimas nepasikeitė, o jo kraštas — taip.
2. **Ekranas, pirmas lapas.** Ta pati dėmė šviesiame lape. Vaikas spėja, kiek pusių matys. Tikslas: pamatyti pasekmę savo veiksmu ir turėti su kuo lyginti.
3. **Antras lapas — juostos.** Dvi juostos liečia dėmę iš viršaus ir apačios. Matomų pusių lieka dvi, o šoninės lieka visos. Tikslas: skirti **kuri** pusė dingo, o ne „dėmė pasikeitė“.
4. **Trečias lapas — lopai ir simbolis.** Trys lopai liečia tris puses. Lieka viena. Po kiekvienu lapu atsiranda **tas pats** žymėjimas: keturi langeliai, iš kurių matomi nuspalvinami, o paslėpti lieka tušti. Trys žymėjimai sustoja vienas šalia kito. Tikslas: matomumą įvardyti skaičiumi, o ne atspalviu.
5. **Perkėlimas.** Trys užduotys be modelio: lipdukas tokios pat spalvos kaip sąsiuvinis, drugio sparnai tokios pat spalvos kaip žievė, ir atvirkštinė užduotis — baltas lapas su balta dėme, kur reikia keisti lapą, o ne dėmę. Tikslas: taikyti taisyklę ten, kur modelio nėra.

**Privalomas spėjimo žingsnis prieš pirmą lapą.** `api.readout` sako: „Pirma pasakyk, kiek pusių matysi.“ Kol vaikas nepasirinko, lapo mygtukai neaktyvūs, bet **ne `disabled`**: jie paaiškina „Pirma pasakyk skaičių. Tada rink lapą.“ ir perkelia fokusą į spėjimo mygtukus (LL-04, LL-32). Spėjimas niekada neištrinamas ir niekada nevadinamas klaida: jis lieka šalia rezultato, todėl palyginimas matomas (LL-15). Be spėjimo modelis virstų lapų perjunginėjimu: vaikas spaudo tol, kol pamato įdomią būseną, ir sąryšio nesudaro (tas pats pavojus kaip M-01–M-17, `research/wiki/foundations/sujungti-dydziai.md`).

**Simuliacijos specifikacija.** Komponentas `deme-ir-fonas`, failas `assets/js/sims/daile.js` (`registry.js` jau importuoja `daile.js`, registracijos keisti nereikia). `config`:

```json
{ "spot": { "name": "Dėmė", "hex": "#7b6b50" },
  "paper": "#faf6ec",
  "outline": "#23201c",
  "sheet": { "x": 12, "y": 20, "cell": 38, "cols": 8, "rows": 5 },
  "spotCells": { "col": 2, "row": 1, "cols": 4, "rows": 3 },
  "grounds": [
    { "id": "sviesus", "name": "Šviesus", "same": [] },
    { "id": "juostos", "name": "Juostos",
      "same": [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],
               [0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4]] },
    { "id": "lopai", "name": "Lopai",
      "same": [[2,0],[3,0],[4,0],[5,0],[1,1],[1,2],[1,3],
               [2,4],[3,4],[4,4],[5,4],[0,0],[7,0],[0,4],[7,4]] } ],
  "start": "sviesus",
  "labels": { "spot": "Dėmė", "ground": "Lapas",
              "sides": "Matomos pusės", "reset": "Iš naujo" },
  "sentences": { "start": "Pirma pasakyk, kiek pusių matysi.",
                 "sviesus": "Šviesus lapas. Dėmė keturių pusių.",
                 "juostos": "Juostos viršuje ir apačioje. Dvi pusės.",
                 "lopai": "Lopai prie trijų pusių. Viena pusė.",
                 "rode": "Rodau dėmės kraštą. Ji visur ta pati.",
                 "vel": "Valom nuo pradžių. Šviesus lapas.",
                 "visi": "Trys lapai. Dėmė ta pati." } }
```

**Būsena išvedama, o ne įrašyta.** `config.grounds[]` sąmoningai neturi lauko, kiek pusių matosi: tai vienintelė taisyklė komponente —

```
pusės = [ 'virsus', 'apacia', 'kaire', 'desine' ]
mati(kraštas, lapas) = kraštas.visosLangeliai.every(l => !lapas.same.includes(l))

matomos = pusės.filter(p => mati(p, lapas)).length
```

Konkrečiai iš aukščiau pateiktos konfigūracijos (skaičiuota `m18_galutine.py`, tikrinta `check_config.py`, abu skaito **tą patį** JSON):

| Lapas | Fono langelių | Matomi krašto langeliai | Matomos pusės | Dalinai padengtos | Paslėptos |
|---|---|---|---|---|---|
| Šviesus | 0 | 14 / 14 | **4** | 0 | 0 |
| Juostos | 16 | 6 / 14 | **2** | 0 | 2 |
| Lopai | 15 | 3 / 14 | **1** | 0 | 3 |

Svarbi modelio savybė: **nė viena pusė nėra padengta dalinai.** Kiekviena iš keturių pusių yra arba matoma visa, arba paslėpta visa, todėl vaikas gali suskaičiuoti puses pirštais ir nesusipainios. Pirmoji konfigūracijos versija šios savybės neturėjo: `juostos` lape šoninės pusės buvo dengtos 2 iš 3 langelių, o tekstas sakė „Dvi pusės“ — vaikas būtų skaičiavęs 2 ir 3, ir modelis būtų buvęs neteisingas. Tai rasta automatine patikra (`check_config.py` → `AR TEKSTAS TEISINGAS: NE — yra daliniu pusiu`), o ne akimis, ir pataisyta pačioje konfigūracijoje.

Kontrastas skaičiuotas WCAG formule, o ne akimis: dėmė `#7b6b50` (L = 0,153) prieš lapą `#faf6ec` (L = 0,923) = **4,79:1** — kraštas matomas; tos pačios spalvos lopas prieš dėmę = **1,00:1** — kraštas neišvengiamai dingsta. Tai ir yra modelio teiginys: dingimas ne iliuzija, o tiksliai 1,00:1 kontrastas.

| Būsena | Ką vaikas mato | `readout` | `api.note` |
|---|---|---|---|
| pradžia | šviesus lapas, dėmė keturių pusių, spėjimo mygtukai 1–4 | `sentences.start` | `sentences.sviesus` |
| spėjimas pasirinktas | pasirinktas skaičius matomas, lapų mygtukai aktyvūs | — | — |
| juostos | dvi juostos, matomos dvi šoninės pusės | `sentences.juostos` | ta pati frazė |
| lopai | trys lopai, matoma viena pusė | `sentences.lopai` | ta pati frazė |
| „Parodyk kraštą“ | brūkšninis kontūras toje pačioje vietoje | `sentences.rode` | ta pati frazė |
| visi trys lapai apžiūrėti | trys žymėjimai vienas šalia kito | `sentences.visi` | `sentences.visi` |
| „Iš naujo“ | šviesus lapas, žymėjimai lieka | `sentences.vel` | — |

Dešimt savybių, kurių negalima praleisti:

- **Vienas kintamasis:** `lapas` (kuris iš trijų). Dėmė nekeičiama nė karto: `spotCells` yra vienas ir tas pats visiems lapams, o `config.grounds[].same` keičia tik **tai, kas liečia kraštą**. Lopas niekada nedengia dėmės langelio — jis dedamas **šalia**, todėl dėmė ne „dingsta po lopu“, o susilieja su juo (LL-27).
- **Lapas niekada neužrakinamas.** Vaikas gali grįžti į bet kurį lapą bet kada, be nuobaudų (LL-04). Spėjimas gali būti neteisingas ir tai nėra baudžiama.
- **Geometrija 360 px:** scena `viewBox="0 0 328 230"`, `max-width:328px`, `width:100%`; lapo tinklelis 8 × 5 po 38 px su 12 px šonu ir 20 px viršuje bei apačioje; dėmė 152 × 114 px (x 88–240, y 58–172). 360 px ekrane su `sim-shell` 13 px pamušalu lieka 334 px, tad 328 px telpa be horizontalaus slinkimo. Dėmė yra 152 px pločio — pakankamai didelė, kad 6–7 metų vaikas pirštu rodytų į kiekvieną pusę atskirai.
- **Dėmės spalva nėra vienintelis informacijos nešėjas** (T5.5, LL-143): matomų pusių skaičius rodomas ir skaičiumi, ir keturių langelių žymėjimu, o „Parodyk kraštą“ duoda brūkšninį kontūrą. Vaikas, kuris neskiria rudos nuo smėlinės, vis tiek perskaito būseną.
- **Įėjimai ir klaviatūra:** spėjimo mygtukai 1–4 po ≥ 48 × 48 px (`aria-pressed`), trys lapų mygtukai 328 × 56 px (`aria-pressed`), „Parodyk kraštą“ ir „Iš naujo“ ≥ 48 px. `Tab` eilė: spėjimas → lapai → „Parodyk kraštą“ → „Iš naujo“; `Enter` / `Space` aktyvuoja; `aria-live="polite"` — `readout`.
- **Fokusas** (LL-32): pasirinkus spėjimą fokusas eina į pirmą lapo mygtuką; po trečio lapo — į „Parodyk kraštą“; po „Iš naujo“ — į spėjimą. Neaktyvūs elementai žymimi `aria-disabled` ir lieka fokusuojami, o bandymas juos paspausti paaiškinamas `api.note`, ne tyli.
- **Grįžtamasis ryšys paaiškina kodėl**, o ne „teisingai“: `readout` įvardija lapą ir pusių skaičių, o `api.note` duoda priežastį („Juostos tokios pat spalvos, tad viršus ir apačia susilieja.“). Niekada „neteisingai“ (T2.3, T5.1). `readout` neperrašomas kiekvieną kadrą (LL-14).
- **Pažanga** (`api.progress({ correct: true })`) — vieną kartą, kai **visi trys** lapai apžiūrėti ir vaikas pasakė pusių skaičių bent du kartus teisingai **dabartinėje** būsenoje (LL-17), o ne po pirmo lapo (LL-29). „Iš naujo“ pažangos netrina (LL-16).
- **Garsas:** tariamos tik `config.sentences` frazės (7), kiekviena gauna po du įrašus (`n` ir `s`), tad manifestas išaugs 14 įrašų, jei tų pačių sakinių dar neturi. Lapų pavadinimai ir mygtukų užrašai netariami. `api.note` rodo **tą patį** sakinį, kuris tariamas.
- **Be laikmačių, be ėjimų limito, be „game over“.** Lapą galima keisti tiek kartų, kiek vaikas nori; „Iš naujo“ nieko nebando.

**Užduotys.**

| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
|---|---|---|---|---|---|
| 1 | atpažinimas | „Lape juostos virš dėmės ir po ja. Kiek pusių matysi?“ — Dvi / Keturias / Nė vienos | Dvi (0) | „Keturias“ — skaičiuojama dėmė, o ne jos kraštas | „Suskaičiuok puses, kurių niekas neuždengia.“ |
| 2 | taikymas | „Lipdukas tokios pat spalvos kaip sąsiuvinis. Kur jis matysis?“ — Niekur, jis susilies / Tik kamputyje / Visur, nes lipdukas storesnis | Niekur, jis susilies (0) | „Visur“ — storis painiojamas su kontrastu | „Palygink lipduko spalvą su sąsiuvinio spalva.“ |
| 3 | perkėlimas | „Drugio sparnai tokios pat spalvos kaip žievė. Kuo tai naudinga?“ — Jis skrenda greičiau / Jį sunkiau pastebėti / Sparnai ryškesni už kitus | Jį sunkiau pastebėti (1) | pirmas — spalva painiojama su greičiu | „Pagalvok, kas atsitiko dėmei po lopu.“ |
| 4 | perkėlimas (`optional: true`) | „Baltas lapas ir balta dėmė. Kurį dalyką keisti, kad dėmė pasirodytų?“ — Lapą / Dėmės vietą / Nieko, ji ir taip matosi | Lapą (0) | „Dėmės vietą“ — keičiama tai, kas nekeičia kontrasto | „Prisimink, ką keitei modelyje.“ |

Atsakymų indeksai 0 / 0 / 1 / 0 — pirmos dvi užduotys tame pačiame indekse, todėl patikrinta, kad `validate_content.py` pasiskirstymo netikrina kaip absoliutaus reikalavimo (`content/lt/grade-01/daile/03-piesimo-priemones.json` taip pat turi 0 / 1 / 0 / 2). Nė viena užuomina nepasako atsakymo: 1-oji nurodo į skaičiavimą, 2-oji — į palyginimą, 3-ioji — į modelio įvykį, 4-oji — į modelio veiksmą. 2 užduotyje sąmoningai nėra varianto „Kamputis kitos spalvos“: toks atvejis gyvenime teisingas, tad jis negali būti neteisingas atsakymas (LL-18). 3 užduotyje trečias variantas perkeltas iš „Jis ryškesnis už kitus“ į „Sparnai ryškesni už kitus“, nes `check_language` rado neaiškią nuorodą įvardžio pradžioje — tai tikras radinys, o ne vartų triukas.

**Refleksija.** „Kodėl toje pačioje vietoje dėmė kartais turi mažiau pusių?“ Klausiama žodžiu, nevertinama; laukiamas atsakymas apie savo patirtį („Nes lopas tokios pat spalvos“), o ne taisyklės kartojimas (T5.3).

**Modelio ribos (pasakomos vaikui ir mokytojui).**

1. **Tai ne iliuzija ir sąmoningai.** Modelis nerodo, kad ta pati spalva *atrodo* kitaip. Jis rodo, kad tos pačios spalvos plotai **neturi matomos ribos** — tai optinis ir fizinis faktas, o ne suvokimo efektas. Iliuzija su 6–7 metų vaiku neveiktų taip stipriai kaip su suaugusiu (Rosetti ir kt., 2025), todėl ji atidėta vyresnei klasei.
2. **Spalvos modelis dvejetainis: ta pati arba ne.** Tikrovėje yra atspalvių, apšvietimo ir popieriaus tekstūros. Modelis sąmoningai naudoja tik `1,00:1` ir `4,79:1` — du kraštutinumus, kad priežastis būtų vienareikšmė. Tarpiniai atspalviai paliekami tikrovei ir mokytojo veiklai.
3. **Lopas ne „dengia“, o „liečiasi“.** Tai pasakyta ir mokytojo bloke, nes tai labiausiai tikėtina suaugusiojo klaida kuriant modelį. Jei kas nors kada nors perrašys komponentą taip, kad lopas eitų ant dėmės viršaus, modelis ims mokyti neteisingo dalyko.
4. **Keturių pusių skaičius yra modelio savybė, ne gamtos dėsnis.** Dėmė yra stačiakampis, todėl ji turi keturias puses. Apvali dėmė neturi pusių, ir pusių skaičiuoti negalima — todėl modelis sąmoningai naudoja stačiakampę dėmę, o ne „dėmę“ kaip lašą.
5. **Tai ne įgūdžio įrodymas.** Teisingas atsakymas reiškia, kad vaikas suskaičiavo kraštą ir palygino su spėjimu, o ne kad jis savarankiškai skiria figūrą nuo fono; Yoon ir kt. (2007) rodo, kad tas atskyrimas šiame amžiuje dar lavinamas.
6. **Vaikas gali nemanyti matyti skirtumo.** Jei vaikas sako „nematau“, tai gali būti teisingas jo suvokimo aprašymas. Todėl teisingas atsakymas visada pasiekiamas **suskaičiavus**, o ne „įsižiūrėjus“.

**Ką tai reiškia modulio autoriui.** `id` — `04-deme-ir-fonas`; `title` — „Dailė: ta pati dėmė, trys lapai“ (32 simboliai); `subtitle` — „Dėmės kraštas matosi tik ten, kur spalva skiriasi“ (54); `minutes` — 9; trys `outcomes` („Suskaičiuoju, kiek dėmės pusių matosi.“, „Parodau, kad lopas tos pačios spalvos panaikina kraštą.“, „Pasakau, kodėl dėmė atrodo kitaip tame pačiame lape.“); `concept.title` — „Dėmė ir jos kraštas“; `concept.big_idea` — „Dėmė matosi tik ten, kur jos spalva skiriasi nuo aplinkos. Kur spalva ta pati, krašto nebėra.“ (95); `concept.steps` — keturi žingsniai iš sekos 2–4; `concept.example` — „Lipdukas tokios pat spalvos kaip sąsiuvinis nesimato. Ant balto lapo jis matosi.“; `teacher.offline` — trys lapai ir trys apskritimai; `teacher.misconceptions` — trys nuostatos iš šio skyriaus; `sim` — `{ "component": "deme-ir-fonas", "config": { … } }`. Modulis įrašomas į `content/lt/grade-01/index.json` (dailė, po `03-piesimo-priemones`) ir į `path.json` **po `03-piesimo-priemones`**: ten vaikas rinko priemonę pagal linijos storį, čia — žiūri, kas liečia kraštą; abu moduliai yra „savybė priklauso nuo to, kas šalia“. Numeris `04-` laisvas (`ls content/lt/grade-01/daile/` → 01, 02, 03).

**Patikra.** Metodo specifikacija surašyta kaip juodraštinis modulis, laikinai įrašytas tikslioje vietoje (`content/lt/grade-01/daile/04-deme-ir-fonas.json`) ir po patikros ištrintas; po ištrynimo `git status` rodo tik wiki failus. Komponentas `deme-ir-fonas` vartams paduotas kaip registruotas (jo dar nėra), todėl kūno patikra neįvyko:

```
validate_content.check_module   -> 0 klaidų, 1 įspėjimas
   (įspėjimas: „nepavyko perskaityti simuliacijos „deme-ir-fonas“ kūno —
    sim.config gyvumas nepatikrintas“)
check_language.check_module     -> 0 radinių (1 kl. riba — 10 žodžių sakinyje)
validate_content.py --grade 1   -> 0 klaidų, 0 įspėjimų (be juodraščio)
```

Pirmoji juodraščio versija davė **du tikrus radinius** ir abu pataisyti, o ne apeiti: 3 užduoties variantas prasidėjo įvardžiu „Jis“ (`check_language` „neaiški nuoroda pradžioje“), o 4 užduoties klausimas prasidėjo „Ką keisti…“ ir neturėjo klausiamojo žodžio iš `check_language.py:266` sąrašo — performuluota į „Kurį dalyką keisti…“. Modulio konfigūracija davė **trečią** tikrą defektą, kurio vartai nemato: `juostos` lape šoninės pusės buvo dengtos 2 iš 3 krašto langelių, tad tekstas „Dvi pusės“ buvo neteisingas. Tai rasta atskiru skaičiuotuvu (`check_config.py`), kuris lygina `sim.config` su `sentences`, ir pataisyta konfigūracijoje; dabar visos keturios pusės visuose trijuose lapuose yra arba visos matomos, arba visos paslėptos.

Įspėjimas paliktas sąmoningai ir neapeitas: komponento dar nėra, todėl `sim.config` gyvumo (LL-61) patikrinti negalima. Jį privalo paleisti tas, kas rašys `deme-ir-fonas` į `daile.js`: su tikru komponento kūnu tas pats vartas turi duoti 0 įspėjimų, o `pusiųSkaiciuokle()` turi būti lyginama su `grounds[].same` aibe, ne su lapo pavadinimu.

**Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, dailė, „Reikšminiai žodžiai. 1-2 klasės“ (`sources/pradinio-bp-rekomendacijos-2024.txt:13558, 13571, 13576`). Rosetti, M., Navarrete, V., Montiel, V., Alarcon, M., Ulloa, R. E., Szenczi, P., & Bánszegi, O. (2025). Heterochronic development of the perception of different types of visual illusions. *Developmental Neuroscience, 47*(5), 350–361. https://doi.org/10.1159/000543308 · Gilchrist, A. L., & Radonjic, A. (2009). Anchoring of lightness values by relative luminance and relative area. *Journal of Vision, 9*(9), 13. https://doi.org/10.1167/9.9.13 · Cuthill, I. C., Stevens, M., Sheppard, J., Maddocks, T., Párraga, C. A., & Troscianko, T. S. (2005). Disruptive coloration and background pattern matching. *Nature, 434*, 72–74. https://doi.org/10.1038/nature03312 · Stevens, M., & Merilaita, S. (2009). Animal camouflage: current issues and new perspectives. *Philosophical Transactions of the Royal Society B, 364*(1516), 423–427. https://doi.org/10.1098/rstb.2008.0217 · Yoon, J. M. D., Winawer, J., Witthoft, N., & Markman, E. M. (2007). Striking deficiency in top-down perceptual reorganization of two-tone images in preschool children. *Proceedings of the 6th IEEE International Conference on Development and Learning*. · Kearney, M. (2004). Classroom use of multimedia-supported predict–observe–explain tasks. *Research in Science Education, 34*(4), 427–453. https://doi.org/10.1007/s11165-004-8795-y

**Pastaba dėl pasiūlymo.** Ideatorius (#54787) temą įrašė (`agents/proposals/2026-11-26-ideator-deme-ir-fonas.json`), ir šis metodas ją **susieja ir sugriežtina**: (1) ideatorius siūlė simultaninį kontrastą — „ta pati dėmė keliama ant trijų fonų ir vaikas mato, kad dėmė ne *turi* spalvą“; branduolys paliktas (dėmė nekeičiama), bet **mechanizmas pakeistas** iš suvokimo efekto į skaičiuojamą kraštą, nes to efekto jautrumas su amžiumi didėja (Rosetti ir kt., 2025), o 6–7 metų vaikas gali jo nemanyti matyti; (2) ideatoriaus siūlyti trys fonai (vienspalvis, dryžuotas, margas) išlaikyti, bet **dryžuoto fono konfigūracija pakeista** taip, kad kiekviena pusė būtų dengiama visa, o ne dalinai — kitaip vaikas negalėtų suskaičiuoti pusių; (3) ideatorius rašė, kad „ant margo fondo dėmė pasimeta“ — tai neteisinga mechaniškai: dėmė pasimeta ne dėl margumo, o dėl to, kad lopas **tokios pat spalvos** liečia kraštą. Modelis tai rodo tiksliai, o mokytojo bloke pasakyta, kodėl „lopas dengia“ yra klaidinga; (4) ideatorius rėmėsi tik programos tekstu, o metodas prideda penkis recenzuojamus šaltinius su DOI ir vieną naują `foundations` įrašą ([[../../foundations/iliuzija-ir-faktas|iliuzija ir faktas]]).

## Atviros prielaidos


- _(kas šioje klasėje dar nepatikrinta; žr. [[../../guidelines/klausimai|klausimus]])_

## Šaltiniai

- Oficiali programa: `research/wiki/curriculum/`
- Metodų bazė: `research/wiki/foundations/`
