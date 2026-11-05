---
title: "1 klasės metodai"
tipas: metodai
klase: 1
amzius: "6–7"
atnaujinta: 2026-11-05
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

## Atviros prielaidos

- _(kas šioje klasėje dar nepatikrinta; žr. [[../../guidelines/klausimai|klausimus]])_

## Šaltiniai

- Oficiali programa: `research/wiki/curriculum/`
- Metodų bazė: `research/wiki/foundations/`
