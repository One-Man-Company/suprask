# metodininkas — 2026-11-05T0822

- paleidimas: #17 (manual)
- trukmė: 539s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ research/wiki/grades/01/metodai.md
│ @@ -3,7 +3,7 @@
│  tipas: metodai
│  klase: 1
│  amzius: "6–7"
│ -atnaujinta: 2026-11-04
│ +atnaujinta: 2026-11-05
│  ---
│
│  # 1 klasės metodai
│ research/wiki/grades/01/metodai.md
│ @@ -77,6 +77,66 @@
│
│  **Šaltiniai.** Williams, R. F. (2012). Image schemas in clock-reading. *Journal of the Learning Sciences, 21*(2), 216–246. https://doi.org/10.1080/10508406.2011.553259 · Earnest, D., Gonzales, A. C., & Plant, A. M. (2018). Time as a measure: Elementary students positioning the hands of an analog clock. *Journal of Numerical Cognition, 4*(1), 188–214. https://doi.org/10.5964/jnc.v4i1.94 · Earnest, D., Gonzales, A. C., & Plant, A. M. (2017). Time as a measure… PME-NA 39 proceedings: https://files.eric.ed.gov/fulltext/ED581317.pdf
│
│ +### M-02 — Lygybė: abi pusės sveria tiek pat
│ +
│ +**Data:** 2026-11-05 · **Tema:** `agents/proposals/2026-11-04-ideator-lygybe.json` · **Tikslas:** `content/lt/grade-01/matematika/16-lygybe-svarstykles.json` · **Šaltinis:** `research/wiki/foundations/zenklas-kaip-busena.md`
│ +
│ +**Viena didelė idėja.** Lygybės ženklas sako, kad abiejose pusėse tiek pat. Jis neįsako skaičiuoti. Svarstyklės nustoja svyruoti tik vienoje vietoje — ten, kur abi pusės lygios, todėl „=“ vaikui tampa būsena, o ne veiksmu.
│ +
│ +**Kodėl modelis, o ne sakinys.** Sakinį „abi pusės lygios“ pirmokas perskaito kaip nurodymą skaičiuoti, nes taip jau yra įpratęs: Baroody ir Ginsburg (1983) po septynių mėnesių sistemingo mokymo tik 20 % pirmokų ženklą apibūdino kaip „tas pats“, o likusieji — kaip „atsakymas“. McNeil ir Alibali (2005) parodė, kad šie ankstyvi operaciniai šablonai ne tik išlieka, bet ir trukdo vėliau mokytis lygčių: vaikai linkę atlikti visus veiksmus su visais duotais skaičiais, laikyti, kad po ženklo turi būti atsakymas, ir suprasti „=“ kaip „viso“. Todėl reikia modelio, kuriame klaidinga būsena yra fiziškai matoma, o ne paaiškinama žodžiais.
│ +
│ +**Klaidingos nuostatos ir kaip jos paneigiamos.**
│ +
│ +1. **„= reiškia suskaičiuok ir parašyk atsakymą.“** Į `5 + ▢ = 8` vaikas atsako 13, nes sudeda abu duotus skaičius (operacinis šablonas, McNeil ir Alibali, 2005). Paneigiama ne aiškinimu, o sija: įdėjus 13 kubelių kairė lėkštė nusileidžia daug žemiau už dešinę. Lygiai yra tik viena dėžutės būsena.
│ +2. **„Atsakymas visada dešinėje.“** Stephens ir kt. (2022), dirbę su darželinukais ir 1–2 klasių mokiniais, pastebėjo, kad vaikai dažnai nekreipia dėmesio į lygybės puses: `6 = 3 + 2` jie dėliojo 3 vienoje lėkštėje, o 6 ir 2 — kitoje, arba ieškojo 11 („sudėk viską“). Paneigiama tuo, kad ta pati lygi sija perskaitoma dviem kryptimis: `5 + 3 = 8` ir `8 = 5 + 3`; sija nejuda, vadinasi, abu užrašai teisingi.
│ +3. **„Lygios svarstyklės reiškia vienodus skaičius.“** Paneigiama perkėlimo užduotimi `4 + 3 = 5 + 2`: abiejose pusėse skirtingi skaičiai, o kiekiai lygūs.
│ +
│ +**Seka (konkretumas → modelis → simbolis → perkėlimas).**
│ +
│ +1. **Kūnas.** Du vienodi puodeliai, pakabinti ant rėmelio (arba dvi vaiko rankos). Vaikas deda vienodus daiktus po vieną, kol abi pusės pajuntamos vienodai, tada skaičiuoja: daiktų skaičius gali skirtis, svoris — ne. Tikslas: lygybė yra būsena, kurią galima pajusti ir patikrinti.
│ +2. **Ekranas.** Kairėje lėkštėje 5 kubeliai ir uždara dėžutė su `▢`, dešinėje — 8 kubeliai. Vaikas įdeda arba išima po vieną kubelį; sija palinksta į sunkesnę pusę. Tikslas: rasti vienintelį skaičių, kuriam esant sija lygi, ir pamatyti, kad ir per mažai, ir per daug yra matoma.
│ +3. **Simbolis.** Kai sija lygi, po ja atsiranda kortelė `5 + 3 = 8`. Mygtukas „Perskaityk kitaip“ apverčia kortelę į `8 = 5 + 3`, o sija nejuda. Tikslas: ženklas įvardija būseną, o ne nurodo, kur rašyti atsakymą.
│ +4. **Perkėlimas.** Lygi sija, kurios nė vienoje pusėje nėra vieno skaičiaus (`4 + 3 = 5 + 2`), ir kortelė, kurioje visas skaičius yra kairėje. Tikslas: skaityti „=“ kaip santykį ten, kur nėra įprasto „veiksmas = atsakymas“ vaizdo.
│ +
│ +**Privalomas žingsnis prieš pirmą judesį.** `api.readout`: „Kiek kubelių reikia įdėti? Pasakyk, tada dėk.“ Kol vaikas nepaspaudė „Pradedu dėti“, „Įdėk 1“ ir „Išimk 1“ neaktyvūs. Be spėjimo sija tampa generatoriumi: vaikas spaudžia tol, kol atsistoja, ir teisinga būsena atsiranda be sprendimo (tas pats pavojus kaip M-01, žr. `foundations/sujungti-dydziai.md`).
│ +
│ +**Simuliacijos specifikacija.** Komponentas `svarstykles-lygybe`, `assets/js/sims/matematika.js`, `config: { "known": 5, "whole": 8, "maxBox": 10 }`.
│ +
│ +| Būsena | Ką rodo | `readout` |
│ +|---|---|---|
│ +| dėžutė tuščia (`box = 0`) | kairėje 5, dešinėje 8, sija palinkusi į dešinę | „Dešinė sunkesnė“ |
│ +| per mažai (`1–2`) | tas pats, kampas mažesnis | „Dešinė sunkesnė“ |
│ +| lygiai (`3`) | sija horizontali, po ja kortelė `5 + 3 = 8` | „Abi pusės lygios“ |
│ +| per daug (`4–10`) | sija palinkusi į kairę | „Kairė sunkesnė“ |
│ +| perskaityta kitaip (tik kai lygiai) | kortelė `8 = 5 + 3`, sija nepakitusi | „Ta pati lygybė“ |
│ +
│ +- **Vienas kintamasis:** `box` ∈ [0; `maxBox`] — kubelių dėžutėje skaičius. Daugiau nieko vaikas nekeičia. Kairė pusė `known + box`, skirtumas `diff = known + box − whole`. „Perskaityk kitaip“ keičia ne kiekį, o užrašo kryptį — tai ne antras kintamasis, o tos pačios būsenos skaitymas.
│ +- **Pakrypimas:** `1,6° × diff`, ribojama ±12°. Kampas proporcingas skirtumui, todėl „šiek tiek per daug“ ir „daug per daug“ skiriasi. `prefers-reduced-motion` — be perėjimo, būsena pasikeičia iš karto.
│ +- **Įėjimai:** bakstelėjimas į dėžutę (`+1`), mygtukai „Įdėk 1“ / „Išimk 1“ (≥ 48 px), klaviatūra `→`/`↑` (`+1`), `←`/`↓` (`−1`), „Perskaityk kitaip“ (tik kai `diff = 0`), „Iš naujo“.
│ +- **Grįžtamasis ryšys** — iškart po kiekvieno bakstelėjimo (≤ 1 kadras), be animacijos įžangos. `api.progress({correct:true})` — vieną kartą, kai pirmą kartą pasiekiama `diff = 0`.
│ +- **Garsas** — keturios nustatytos frazės: „Dešinė sunkesnė.“, „Kairė sunkesnė.“, „Abi pusės lygios.“, „Ta pati lygybė.“ Skaičiai neskaitomi garsiai (mažas `check_audio.py` manifestas, jokių gramatikos sprendimų simuliacijoje).
│ +- **Skirtumas be spalvos:** pakrypimo kampas, dėžutė su `▢` ir brūkšniuotu kontūru, tekstas `readout`. Kubelių spalva — tik papildoma.
│ +- **Prieinamumas:** SVG `role="img"`, `aria-label` atnaujinamas („Kairėje 5 ir 3, dešinėje 8. Abi pusės lygios.“); dėžutė — `[role=button]` su `aria-label` („Dėžutė su 3 kubeliais“); visi mygtukai su `aria-label`.
│ +- **Dydžiai 360 px:** dvi lėkštės po 128 px ir 40 px tarpas = 296 px, telpa į 328 px turinio plotį. Kubeliai 12 px su 2 px tarpu, lėkštėje dvi eilutės po 5 — telpa 10.
│ +- **Be laikmačių, be ėjimų limito, be „game over“.** Perpildyta dėžutė — informacija, ne bauda: vaikas išima kubelius ir bando toliau.
│ +
│ +**Užduotys.**
│ +
│ +| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
│ +|---|---|---|---|---|---|
│ +| 1 | atpažinimas | „Kairėje 5 kubeliai ir uždara dėžutė, dešinėje 8 kubeliai. Svarstyklės lygios. Kiek kubelių dėžutėje?“ — 13 / 3 / 8 | 3 (indeksas 1) | 13 — sudeda abu duotus skaičius | „Tu sudejai abi puses. Kiek kairiajai trūksta iki dešinės?“ |
│ +| 2 | taikymas | „Kairėje 6 kubeliai ir dėžutė, dešinėje 10 kubelių. Kuri kortelė tiksliai pasako, kas padėta?“ — `6 + ▢ = 10` / `10 + ▢ = 6` / `6 + 10 = ▢` | `6 + ▢ = 10` (0) | trečias variantas — vėl „sudėk viską“; antras — sumaišytos pusės | „Kurioje pusėje stovi dėžutė? Toje pusėje rašyk `▢`.“ |
│ +| 3 | perkėlimas | „Kortelė sako: `8 = 5 + ▢`. Kiek kubelių dėžutėje, kad svarstyklės būtų lygios?“ — 13 / 5 / 3 | 3 (2) | 13, arba „taip negalima, nes atsakymas turi būti dešinėje“ | „Skaičius prieš ženklą irgi gali būti visas kiekis. Įsivaizduok abi puses kaip lėkštes.“ |
│ +| 4 | praplėtimas (`optional: true`) | „`4 + 3 = 5 + 2`. Ar ši lygybė teisinga?“ — „Taip, abi pusės lygios“ / „Ne, nes dešinėje nėra vieno skaičiaus“ / „Ne, nes 4 + 3 = 7“ | „Taip…“ (0) | antras — lygybė priimama tik kaip „veiksmas = atsakymas“ | „Nelygink pusės su atsakymu. Pažiūrėk į abi puses kaip į du atskirus kiekius.“ |
│ +
│ +**Refleksija.** „Kai svarstyklės lygios, ar abiejose pusėse visada vienodi skaičiai? Papasakok pavyzdį.“ Atsakymas — ne, pvz., `4 + 3 = 5 + 2`; klausiama žodžiu, nevertinama.
│ +
│ +**Modelio ribos (pasakomos vaikui ir mokytojui).** Svarstyklės lygina **kiekį**, o ne reiškinį: visi kubeliai vienodi, todėl svoris čia reiškia skaičių. Modelis rodo tik sudėtį su teigiamais skaičiais; atimties ir neigiamų skaičių jis neatvaizduoja, nes tai ta pati lygybė, perskaityta iš kitos pusės, ir atskira sąvoka (`Otten ir kt., 2019`, kur aprašytos 8 straipsnių nurodytos modelio ribos). Sija parodo, kad abi pusės lygios, bet nepaaiškina, kodėl `5 + 3` ir `8` yra tas pats skaičius — tą ryšį vaikas turi pasakyti pats. Todėl teisinga sijos padėtis nelaikoma supratimo įrodymu: reikia ir perskaitymo kita kryptimi, ir užduoties be vieno skaičiaus pusėje.
│ +
│ +**Ką tai reiškia modulio autoriui.** `title` — „Lygybė: abi pusės sveria tiek pat“ (32 simboliai); `subtitle` — „Ženklas sako, kad abiejose pusėse tiek pat“ (42); `minutes` — 9; trys `outcomes` (atpažįstu, paaiškinu, nustatau trūkstamą skaičių); `concept.steps` — 3 žingsniai iš aukščiau pateiktos sekos 2–4; `teacher.offline` — pakaba su dviem puodeliais ir vienodais daiktais, vienas puodelis uždengiamas. `teacher.misconceptions` — trys nuostatos iš šio skyriaus. `sim` — `{ "component": "svarstykles-lygybe", "config": { "known": 5, "whole": 8, "maxBox": 10 } }`. Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/path.json` `sequence` (dizainerio arba leidėjo darbas, ne metodo dalis).
│ +
│ +**Šaltiniai.** Baroody, A. J., & Ginsburg, H. P. (1983). The effects of instruction on children's understanding of the "equals" sign. *The Elementary School Journal, 84*(2), 199–212. https://doi.org/10.1086/461356 · McNeil, N. M., & Alibali, M. W. (2005). Why won't you change your mind? Knowledge of operational patterns hinders learning and performance on equations. *Child Development, 76*(4), 883–899. https://doi.org/10.1111/j.1467-8624.2005.00884.x · Falkner, K. P., Levi, L., & Carpenter, T. P. (1999). Children's understanding of equality: A foundation for algebra. *Teaching Children Mathematics, 6*(4), 232–236. https://doi.org/10.5951/TCM.6.4.0232 · Stephens, A., Sung, Y., Strachota, S., Torres, R. V., Morton, K., Gardiner, A. M., Blanton, M., Knuth, E., & Stroud, R. (2022). The role of balance scales in supporting productive thinking about equations among diverse learners. *Mathematical Thinking and Learning, 24*(1), 1–18. https://doi.org/10.1080/10986065.2020.1793055 · Otten, M., Van den Heuvel-Panhuizen, M., & Veldhuis, M. (2019). The balance model for teaching linear equations: A systematic literature review. *International Journal of STEM Education, 6*(1). https://doi.org/10.1186/s40594-019-0183-2
│ +
│  ## Atviros prielaidos
│
│  - _(kas šioje klasėje dar nepatikrinta; žr. [[../../guidelines/klausimai|klausimus]])_
│ research/wiki/grades/01/metodai.md
│ @@ -133,7 +133,7 @@
│
│  **Modelio ribos (pasakomos vaikui ir mokytojui).** Svarstyklės lygina **kiekį**, o ne reiškinį: visi kubeliai vienodi, todėl svoris čia reiškia skaičių. Modelis rodo tik sudėtį su teigiamais skaičiais; atimties ir neigiamų skaičių jis neatvaizduoja, nes tai ta pati lygybė, perskaityta iš kitos pusės, ir atskira sąvoka (`Otten ir kt., 2019`, kur aprašytos 8 straipsnių nurodytos modelio ribos). Sija parodo, kad abi pusės lygios, bet nepaaiškina, kodėl `5 + 3` ir `8` yra tas pats skaičius — tą ryšį vaikas turi pasakyti pats. Todėl teisinga sijos padėtis nelaikoma supratimo įrodymu: reikia ir perskaitymo kita kryptimi, ir užduoties be vieno skaičiaus pusėje.
│
│ -**Ką tai reiškia modulio autoriui.** `title` — „Lygybė: abi pusės sveria tiek pat“ (32 simboliai); `subtitle` — „Ženklas sako, kad abiejose pusėse tiek pat“ (42); `minutes` — 9; trys `outcomes` (atpažįstu, paaiškinu, nustatau trūkstamą skaičių); `concept.steps` — 3 žingsniai iš aukščiau pateiktos sekos 2–4; `teacher.offline` — pakaba su dviem puodeliais ir vienodais daiktais, vienas puodelis uždengiamas. `teacher.misconceptions` — trys nuostatos iš šio skyriaus. `sim` — `{ "component": "svarstykles-lygybe", "config": { "known": 5, "whole": 8, "maxBox": 10 } }`. Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/path.json` `sequence` (dizainerio arba leidėjo darbas, ne metodo dalis).
│ +**Ką tai reiškia modulio autoriui.** `title` — „Lygybė: abi pusės sveria tiek pat“ (33 simboliai); `subtitle` — „Ženklas sako, kad abiejose pusėse tiek pat“ (42); `minutes` — 9; trys `outcomes` (atpažįstu, paaiškinu, nustatau trūkstamą skaičių); `concept.steps` — 3 žingsniai iš aukščiau pateiktos sekos 2–4; `teacher.offline` — pakaba su dviem puodeliais ir vienodais daiktais, vienas puodelis uždengiamas. `teacher.misconceptions` — trys nuostatos iš šio skyriaus. `sim` — `{ "component": "svarstykles-lygybe", "config": { "known": 5, "whole": 8, "maxBox": 10 } }`. Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/path.json` `sequence` (dizainerio arba leidėjo darbas, ne metodo dalis).
│
│  **Šaltiniai.** Baroody, A. J., & Ginsburg, H. P. (1983). The effects of instruction on children's understanding of the "equals" sign. *The Elementary School Journal, 84*(2), 199–212. https://doi.org/10.1086/461356 · McNeil, N. M., & Alibali, M. W. (2005). Why won't you change your mind? Knowledge of operational patterns hinders learning and performance on equations. *Child Development, 76*(4), 883–899. https://doi.org/10.1111/j.1467-8624.2005.00884.x · Falkner, K. P., Levi, L., & Carpenter, T. P. (1999). Children's understanding of equality: A foundation for algebra. *Teaching Children Mathematics, 6*(4), 232–236. https://doi.org/10.5951/TCM.6.4.0232 · Stephens, A., Sung, Y., Strachota, S., Torres, R. V., Morton, K., Gardiner, A. M., Blanton, M., Knuth, E., & Stroud, R. (2022). The role of balance scales in supporting productive thinking about equations among diverse learners. *Mathematical Thinking and Learning, 24*(1), 1–18. https://doi.org/10.1080/10986065.2020.1793055 · Otten, M., Van den Heuvel-Panhuizen, M., & Veldhuis, M. (2019). The balance model for teaching linear equations: A systematic literature review. *International Journal of STEM Education, 6*(1). https://doi.org/10.1186/s40594-019-0183-2
│
│ research/wiki/foundations/zenklas-kaip-busena.md
│ @@ -0,0 +1,53 @@
│ +---
│ +title: "Ženklas kaip būsena: kodėl modelis turi parodyti abi lygybės kryptis"
│ +tipas: fundamentai
│ +temos: [lygybė, modeliai, grįžtamasis ryšys, simuliacijos, algebra]
│ +amzius: "6-10"
│ +atnaujinta: 2026-11-05
│ +saltiniai: 5
│ +---
│ +
│ +# Ženklas kaip būsena: kodėl modelis turi parodyti abi lygybės kryptis
│ +
│ +## Pagrindinė idėja
│ +
│ +Kai modelio grįžtamasis ryšys yra **santykis** (sija palinksta, rodyklė pasislenka, abi pusės lygios), o ne įvertinimas, vaikas ženklą gali perskaityti kaip būseną. Bet modelis turi ir antrą, tylesnę mokymo pusę: **išdėstymą**. Jei nežinomasis visada prieš ženklą, o atsakymas visada po jo, modelis per savo išdėstymą moko to paties operacinio šablono, kurį tariamai griovė. Todėl modeliui, kuriame yra lygybės ženklas, būtina mažiausia patikra: **perskaitymas kita kryptimi** ir bent viena būsena, kurioje nė vienoje pusėje nėra vieno skaičiaus.
│ +
│ +Tai ne estetikos klausimas. Vaikas, kuris priima `5 + 3 = 8`, bet atmeta `8 = 5 + 3`, neskaito ženklo kaip santykio — jis skaito jį kaip instrukciją „skaičiuok iki šito“.
│ +
│ +## Ką rodo tyrimai
│ +
│ +**Operacinis skaitymas yra norma, ne išimtis.** Baroody ir Ginsburg (1983) septynis mėnesius sistemingai mokė pirmokus, antrokus ir trečiokus reliacinės „=“ reikšmės. Po to tik 20 % pirmokų ženklą apibūdino kaip „tas pats“; kiti liko prie „atsakymas“. Reliacinis skaitymas yra mokymo, o ne brandos rezultatas — bet ir mokymas vien žodžiais jo neįtvirtina.
│ +
│ +**Ankstyvi šablonai trukdo vėliau.** McNeil ir Alibali (2005) aprašė tris aritmetikoje įgytus operacinius šablonus: atlikti visus veiksmus su visais duotais skaičiais, laikyti, kad uždavinio struktūra yra „veiksmai = atsakymas“, ir suprasti „=“ kaip „viso“. Kuo labiau vaikas jų laikosi, tuo prasčiau mokosi lygčių — ir šie šablonai aktyvuojasi net suaugusiesiems.
│ +
│ +**Modelis padeda, bet ir atskleidžia klaidą.** Stephens ir kt. (2022) stebėjo darželinukus ir 1–2 klasių mokinius, dirbusius su dviem svarstyklių tipais. Svarstyklės padėjo vaikams prieiti prie „ženklas reiškia dviejų kiekių lygybę“ ir prie bandymo bei taisymo kaip metodo. Tačiau tos pačios svarstyklės atskleidė, kad dauguma vaikų nekreipė dėmesio į lygybės **puses**: `6 = 3 + 2` jie dėliojo 3 vienoje lėkštėje, o 6 ir 2 — kitoje; `7 = 3 + 2` atvaizdavo kaip 7 prieš 3; `6 = 3 + 2` sprendė „sudėk viską“ ir ieškojo 11. Modelis nepašalino klaidos — jis ją padarė matomą.
│ +
│ +**Modelis nėra savaiminis sprendimas.** Otten, Van den Heuvel-Panhuizen ir Veldhuis (2019), išnagrinėję 34 straipsnius, padarė išvadą, kad „paprastai atrodantis“ svarstyklių modelis iš tikrųjų yra sudėtinga didaktinė priemonė, apie kurią trūksta išsamių žinių; aštuoniuose straipsniuose nurodytos ribos (pvz., atimtis ir neigiami skaičiai sunkiai atvaizduojami). Teigiamas poveikis dažnesnis jaunesniems mokiniams be algebrinės patirties.
│ +
│ +## Ką tai reiškia SUPRASK platformai
│ +
│ +1. **Kiekvienas modelis, kuriame yra „=“, privalo turėti perskaitymą kita kryptimi.** Ne atskirą modulį, o vieną būseną: ta pati sija, ta pati suma, apversta kortelė. Be to, ženklas lieka vienu simboliu, o ne dviem taisyklėmis.
│ +2. **Bent viena būsena ar užduotis be vieno skaičiaus pusėje.** `4 + 3 = 5 + 2` yra pigiausias testas, ar vaikas skaito santykį, ar ieško „atsakymo po lygybės“. Jo negali išspręsti operacinis šablonas, nes nėra ko „suskaičiuoti į vieną skaičių“.
│ +3. **Grįžtamasis ryšys formuluojamas kaip santykis.** „Kairė sunkesnė“, „Abi pusės lygios“ — ne „teisingai“. Taip vaikas mato pasekmę, o ne nuosprendį (T2.3, T5.1).
│ +4. **Teisinga modelio būsena nelaikoma supratimo įrodymu.** Tai ta pati taisyklė kaip `sujungti-dydziai`: jei modelis pats sukonstruoja teisingą rezultatą, reikia spėjimo prieš judesį ir užduoties apie patį ryšį.
│ +5. **Modelio ribos pasakomos.** Svarstyklės lygina kiekį, ne reiškinį; jos neatvaizduoja atimties ir neigiamų skaičių. Jei to nepasakome, vaikas modelį pradeda laikyti lygybės apibrėžimu.
│ +
│ +## Ko šis įrašas nedaro
│ +
│ +Jis nepateisina svarstyklių kaip universalaus lygybės modelio. Įrodymai apie modelio poveikį yra nevienalyčiai (Otten ir kt., 2019), o Stephens ir kt. (2022) duomenys yra kokybiniai, iš nedidelės imties. Įrašas nustato tik **mažiausią dizaino sąlygą**: jei modelis moko „=“, jis turi parodyti abi kryptis ir bent vieną atvejį be vieno skaičiaus pusėje.
│ +
│ +## Susieti
│ +
│ +- [[sujungti-dydziai]] — kodėl teisingas modelio rezultatas dar nėra supratimas
│ +- [[simuliacijos-ir-modeliai]] — modelio ribų pasakymas, konkretybės nykimas
│ +- [[interaktyvumo-principai]] — grįžtamasis ryšys per 100–200 ms, be baudimo
│ +- [[../grades/01/metodai|1 klasės metodai]] — M-02 „Lygybė: abi pusės sveria tiek pat“
│ +
│ +## Šaltiniai
│ +
│ +1. Baroody, A. J., & Ginsburg, H. P. (1983). The effects of instruction on children's understanding of the "equals" sign. *The Elementary School Journal, 84*(2), 199–212. https://doi.org/10.1086/461356
│ +2. McNeil, N. M., & Alibali, M. W. (2005). Why won't you change your mind? Knowledge of operational patterns hinders learning and performance on equations. *Child Development, 76*(4), 883–899. https://doi.org/10.1111/j.1467-8624.2005.00884.x
│ +3. Falkner, K. P., Levi, L., & Carpenter, T. P. (1999). Children's understanding of equality: A foundation for algebra. *Teaching Children Mathematics, 6*(4), 232–236. https://doi.org/10.5951/TCM.6.4.0232
│ +4. Stephens, A., Sung, Y., Strachota, S., Torres, R. V., Morton, K., Gardiner, A. M., Blanton, M., Knuth, E., & Stroud, R. (2022). The role of balance scales in supporting productive thinking about equations among diverse learners. *Mathematical Thinking and Learning, 24*(1), 1–18. https://doi.org/10.1080/10986065.2020.1793055
│ +5. Otten, M., Van den Heuvel-Panhuizen, M., & Veldhuis, M. (2019). The balance model for teaching linear equations: A systematic literature review. *International Journal of STEM Education, 6*(1). https://doi.org/10.1186/s40594-019-0183-2
│ research/wiki/foundations/README.md
│ @@ -10,6 +10,7 @@
│  | [[kognityvine-apkrova]] | darbinė atmintis, pavyzdžiai, perteklius | vienas kintamasis simuliacijoje, tikslas visada matomas |
│  | [[simuliacijos-ir-modeliai]] | PhET, konkretybės nykimas, produktyvi nesėkmė | veiksmas prieš paaiškinimą, modelio ribos pasakomos |
│  | [[interaktyvumo-principai]] | UI 6–7 metų vaikams, taikiniai, grįžtamasis ryšys | ≥48 px, jokių laikmačių, klaida ne aklavietė |
│ +| [[zenklas-kaip-busena]] | lygybės ženklas kaip būsena, operaciniai šablonai, modelio išdėstymas | modelis rodo abi lygybės kryptis ir bent vieną atvejį be vieno skaičiaus pusėje |
│  | [[ivertinimas-ir-growth-mindset]] | grįžtamasis ryšys, augimo mąstysena ir jos ribos | `hint` + `why` privalomi, jokių balų |
│
│  ## Žaidimų teorijos dalis
│ research/wiki/guidelines/pilotai.md
│ @@ -45,5 +45,10 @@
│  - **Hipotezė:** jei ilgoji ir trumpoji rodyklės modeliuojamos kaip mechaniškai sujungtos (viena negali judėti be kitos), pirmokai dažniau teisingai nurodo pilną valandą ir perkelia taisyklę į naują situaciją, nes ryšį stebi, o ne įsimena. Rizika žinoma iš anksto: sujungtos rodyklės gali duoti teisingą padėtį be supratimo (Earnest ir kt., 2017; `research/wiki/foundations/sujungti-dydziai.md`).
│  - **Ką keičiame:** pirmoji simuliacija, kurioje dydžiai priklausomi, o pagrindinis įėjimas — tempimas ratu (ne bakstelėjimas). Modulis `15-laikas`, komponentas `laikrodis-sujungtos-rodykles`.
│  - **Kaip matuojame:** perkėlimo užduoties (rodyklių atpažinimas pagal judėjimą) teisingumas pirmu bandymu ir tai, ar refleksijoje vaikas įvardija patį ryšį („ratas — žingsnis“), o ne tik pakartoja valandą. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
│ +### P-005 — Svarstyklės su uždara dėžute ir perskaitymu kita kryptimi
│ +- **Data:** 2026-11-05
│ +- **Hipotezė:** jei modelis grįžtamąjį ryšį duoda kaip santykį (sija palinksta į sunkesnę pusę), o tą pačią lygią būseną galima perskaityti abiem kryptimis (`5 + 3 = 8` ir `8 = 5 + 3`), tai daugiau pirmokų priims apverstą lygybės formą ir teisingai atsakys į užduotį be vieno skaičiaus pusėje, nes ženklas mokomas kaip būsena, o ne kaip nurodymas rašyti atsakymą (McNeil ir Alibali, 2005; Stephens ir kt., 2022; `research/wiki/foundations/zenklas-kaip-busena.md`).
│ +- **Ką keičiame:** pirmoji simuliacija su uždara nežinomojo dėžute ir pirmoji, kurios grįžtamasis ryšys yra tolydus santykis (pakrypimo kampas), o ne diskreti būsena. Modulis `16-lygybe-svarstykles`, komponentas `svarstykles-lygybe`. Mygtukas „Perskaityk kitaip“ — pirmas atvejis platformoje, kai tas pats modelis parodomas dviem užrašo kryptimis.
│ +- **Kaip matuojame:** perkėlimo užduoties (`8 = 5 + ▢`) ir praplėtimo užduoties (`4 + 3 = 5 + 2`) teisingumas pirmu bandymu; ar refleksijoje vaikas pasako, kad lygiose pusėse skaičiai gali skirtis; ar vaikas naudojasi „Perskaityk kitaip“ (jei nenaudoja — ar mygtukas pastebimas). Duomenys nerenkami automatiškai, tik savanoriškas mokytojo stebėjimas.
│  - **Rezultatas:** dar nėra.
│ -- **Sprendimas:** laukiama duomenų. Jei vaikai atsakys teisingai, bet neįvardys ryšio, jungtis lieka, o spėjimo žingsnis ir perkėlimo užduotis stiprinami.
│ +- **Sprendimas:** laukiama duomenų. Jei vaikai sprendžia siją, bet neatmeta operacinio skaitymo, stiprinamas spėjimo žingsnis ir apverstos formos užduotis; jei „Perskaityk kitaip“ lieka nepastebėtas, mygtukas keliamas virš sijos, o ne šalinamas.
│ research/wiki/guidelines/pilotai.md
│ @@ -45,6 +45,9 @@
│  - **Hipotezė:** jei ilgoji ir trumpoji rodyklės modeliuojamos kaip mechaniškai sujungtos (viena negali judėti be kitos), pirmokai dažniau teisingai nurodo pilną valandą ir perkelia taisyklę į naują situaciją, nes ryšį stebi, o ne įsimena. Rizika žinoma iš anksto: sujungtos rodyklės gali duoti teisingą padėtį be supratimo (Earnest ir kt., 2017; `research/wiki/foundations/sujungti-dydziai.md`).
│  - **Ką keičiame:** pirmoji simuliacija, kurioje dydžiai priklausomi, o pagrindinis įėjimas — tempimas ratu (ne bakstelėjimas). Modulis `15-laikas`, komponentas `laikrodis-sujungtos-rodykles`.
│  - **Kaip matuojame:** perkėlimo užduoties (rodyklių atpažinimas pagal judėjimą) teisingumas pirmu bandymu ir tai, ar refleksijoje vaikas įvardija patį ryšį („ratas — žingsnis“), o ne tik pakartoja valandą. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
│ +- **Rezultatas:** dar nėra.
│ +- **Sprendimas:** laukiama duomenų. Jei vaikai atsakys teisingai, bet neįvardys ryšio, jungtis lieka, o spėjimo žingsnis ir perkėlimo užduotis stiprinami.
│ +
│  ### P-005 — Svarstyklės su uždara dėžute ir perskaitymu kita kryptimi
│  - **Data:** 2026-11-05
│  - **Hipotezė:** jei modelis grįžtamąjį ryšį duoda kaip santykį (sija palinksta į sunkesnę pusę), o tą pačią lygią būseną galima perskaityti abiem kryptimis (`5 + 3 = 8` ir `8 = 5 + 3`), tai daugiau pirmokų priims apverstą lygybės formą ir teisingai atsakys į užduotį be vieno skaičiaus pusėje, nes ženklas mokomas kaip būsena, o ne kaip nurodymas rašyti atsakymą (McNeil ir Alibali, 2005; Stephens ir kt., 2022; `research/wiki/foundations/zenklas-kaip-busena.md`).
│ research/wiki/changelog.md
│ @@ -1,6 +1,14 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-05 — Lygybės metodas M-02
│ +
│ +- **`grades/01/metodai.md`** — naujas metodas M-02 „Lygybė: abi pusės sveria tiek pat“: seka, simuliacijos `svarstykles-lygybe` būsenos, keturios užduotys su tipinėmis klaidomis, modelio ribos.
│ +- **`foundations/zenklas-kaip-busena.md`** — naujas įrašas: kai modelio grįžtamasis ryšys yra santykis, ženklas mokomas kaip būsena, bet modelio išdėstymas gali tyliai įtvirtinti operacinį skaitymą; todėl būtinas perskaitymas kita kryptimi ir užduotis be vieno skaičiaus pusėje.
│ +- **`guidelines/pilotai.md`** — P-005 (svarstyklės su uždara dėžute ir apversta lygybės forma).
│ +- **Šaltinis:** Baroody & Ginsburg (1983) https://doi.org/10.1086/461356 · McNeil & Alibali (2005) https://doi.org/10.1111/j.1467-8624.2005.00884.x · Falkner, Levi & Carpenter (1999) https://doi.org/10.5951/TCM.6.4.0232 · Stephens ir kt. (2022) https://doi.org/10.1080/10986065.2020.1793055 · Otten ir kt. (2019) https://doi.org/10.1186/s40594-019-0183-2
│ +- **Poveikis platformai:** būsimas modulis `16-lygybe-svarstykles`; taisyklė „modelis, kuriame yra „=“, rodo abi kryptis“ taikoma ir kitiems lygybės ar palyginimo modeliams.
│
│  ## 2026-11-03 — Bazės sukūrimas
│
│ agents/proposals/2026-11-05-metodininkas-lygybe.json
│ @@ -0,0 +1,23 @@
│ +{
│ +  "role": "metodininkas",
│ +  "run_id": 17,
│ +  "created": "2026-11-05T08:31:00+02:00",
│ +  "type": "metodas",
│ +  "title": "Lygybė: abi pusės sveria tiek pat",
│ +  "body": "1 klasės programa prašo lygybėse a + b = c rasti trūkstamą skaičių, o rekomendacijos tai vadina prioritetu, nes pratimas ugdo lygybės struktūros, o ne skaičiavimo supratimą. Tyrimai rodo, kad pirmokai ženklą dažniausiai skaito operaciškai („suskaičiuok ir parašyk“), o šis šablonas ne tik išlieka, bet ir trukdo vėliau mokytis lygčių (Baroody ir Ginsburg, 1983; McNeil ir Alibali, 2005). Metodas M-02 griauja šį skaitymą sija: kairėje 5 kubeliai ir uždara dėžutė su ▢, dešinėje 8 kubeliai, o vaikas įdeda arba išima po vieną, kol sija atsistoja lygiai. Kai sija lygi, po ja pasirodo kortelė „5 + 3 = 8“, o mygtukas „Perskaityk kitaip“ apverčia ją į „8 = 5 + 3“ — sija nejuda, todėl abi kryptys matomos kaip ta pati būsena, o ne kaip dvi taisyklės. Grįžtamąjį ryšį duoda pati sija („Kairė sunkesnė“ / „Dešinė sunkesnė“ / „Abi pusės lygios“), ne „teisingai / neteisingai“, o perpildyta dėžutė yra informacija, ne bauda. Kadangi modelis pats gali sukonstruoti teisingą būseną, prieš pirmą judesį vaikas spėja žodžiu, o perkėlimo užduotis klausia apie formą be vieno skaičiaus pusėje (4 + 3 = 5 + 2) — būtent tokiais atvejais Stephens ir kt. (2022) matė, kad vaikai praleidžia lygybės puses ir sprendžia „sudėk viską“. Visa specifikacija su būsenomis, keturiomis užduotimis, užuominomis ir modelio ribomis — research/wiki/grades/01/metodai.md, skyrius M-02.",
│ +  "target": "content/lt/grade-01/matematika/16-lygybe-svarstykles.json",
│ +  "priority": "high",
│ +  "status": "new",
│ +  "evidence": [
│ +    "research/wiki/grades/01/metodai.md#M-02 — pilnas metodas: seka, simuliacijos būsenos, keturios užduotys su tipinėmis klaidomis, modelio ribos",
│ +    "research/wiki/foundations/zenklas-kaip-busena.md — bendresnė įžvalga: modelio išdėstymas gali įtvirtinti operacinį lygybės skaitymą, todėl būtinas perskaitymas kita kryptimi",
│ +    "research/wiki/curriculum/matematika-1-klase.md:45 — „Mokomasi lygybėse a + b = c, a – b = c nustatyti trūkstamą skaičių (žymimą pvz. langeliu), kai kiti du skaičiai žinomi“",
│ +    "research/wiki/curriculum/matematika-1-klase.md:164 — „Trūkstamo dėmens pratimai — prioritetas. Jie ugdo lygybės struktūros supratimą, ne tik atsakymo skaičiavimą“",
│ +    "agents/proposals/2026-11-04-ideator-lygybe.json — ideatoriaus pasiūlymas #12 (tema/high), kurio pagrindu metodas sukurtas",
│ +    "https://doi.org/10.1086/461356 — Baroody ir Ginsburg (1983): po septynių mėnesių mokymo tik 20 % pirmokų ženklą apibūdino kaip „tas pats“",
│ +    "https://doi.org/10.1111/j.1467-8624.2005.00884.x — McNeil ir Alibali (2005): operaciniai šablonai (visi veiksmai su visais skaičiais, „veiksmai = atsakymas“, „=“ kaip „viso“) trukdo mokytis lygčių",
│ +    "https://doi.org/10.5951/TCM.6.4.0232 — Falkner, Levi ir Carpenter (1999): 8 + 4 = __ + 5 vaikai atsako 12",
│ +    "https://doi.org/10.1080/10986065.2020.1793055 — Stephens ir kt. (2022): K–2 vaikai su svarstyklėmis; 6 = 3 + 2 dėlioja puses neteisingai arba ieško 11",
│ +    "https://doi.org/10.1186/s40594-019-0183-2 — Otten, Van den Heuvel-Panhuizen ir Veldhuis (2019): 34 straipsnių apžvalga, modelio ribos (atimtis, neigiami skaičiai)"
│ +  ]
│ +}
│ research/wiki/grades/01/metodai.md
│ @@ -111,13 +111,14 @@
│  | perskaityta kitaip (tik kai lygiai) | kortelė `8 = 5 + 3`, sija nepakitusi | „Ta pati lygybė“ |
│
│  - **Vienas kintamasis:** `box` ∈ [0; `maxBox`] — kubelių dėžutėje skaičius. Daugiau nieko vaikas nekeičia. Kairė pusė `known + box`, skirtumas `diff = known + box − whole`. „Perskaityk kitaip“ keičia ne kiekį, o užrašo kryptį — tai ne antras kintamasis, o tos pačios būsenos skaitymas.
│ +- **Dėžutė uždara:** kubelių joje nesimato, ant šono — `▢`. Šalia dėžutės vertikali 10 taškų juosta, kurioje užsidega tiek taškų, kiek įdėta. Juosta reikalinga ne puošmenai: be jos vaikas turėtų atmintinai skaičiuoti, kiek įdėjo, o tai 6–7 m. vaikui yra papildoma darbinė apkrova (`foundations/kognityvine-apkrova.md`). Dėžutė lieka „nežinomasis“, apie kurį klausia užduotys.
│  - **Pakrypimas:** `1,6° × diff`, ribojama ±12°. Kampas proporcingas skirtumui, todėl „šiek tiek per daug“ ir „daug per daug“ skiriasi. `prefers-reduced-motion` — be perėjimo, būsena pasikeičia iš karto.
│  - **Įėjimai:** bakstelėjimas į dėžutę (`+1`), mygtukai „Įdėk 1“ / „Išimk 1“ (≥ 48 px), klaviatūra `→`/`↑` (`+1`), `←`/`↓` (`−1`), „Perskaityk kitaip“ (tik kai `diff = 0`), „Iš naujo“.
│ -- **Grįžtamasis ryšys** — iškart po kiekvieno bakstelėjimo (≤ 1 kadras), be animacijos įžangos. `api.progress({correct:true})` — vieną kartą, kai pirmą kartą pasiekiama `diff = 0`.
│ +- **Grįžtamasis ryšys** — iškart po kiekvieno bakstelėjimo (≤ 1 kadras), be animacijos įžangos. `readout` įvardija tik santykį, o `api.note` po sija pasako vieną sakinį apie veiksmą: `box = 0` — „Dėžutė tuščia. Įdėk kubelį.“; `1–2` — „Dar trūksta.“; `4–10` — „Per daug. Išimk po vieną.“; `3` — „Penki ir trys yra aštuoni.“ `api.progress({correct:true})` — vieną kartą, kai pirmą kartą pasiekiama `diff = 0`.
│  - **Garsas** — keturios nustatytos frazės: „Dešinė sunkesnė.“, „Kairė sunkesnė.“, „Abi pusės lygios.“, „Ta pati lygybė.“ Skaičiai neskaitomi garsiai (mažas `check_audio.py` manifestas, jokių gramatikos sprendimų simuliacijoje).
│  - **Skirtumas be spalvos:** pakrypimo kampas, dėžutė su `▢` ir brūkšniuotu kontūru, tekstas `readout`. Kubelių spalva — tik papildoma.
│ -- **Prieinamumas:** SVG `role="img"`, `aria-label` atnaujinamas („Kairėje 5 ir 3, dešinėje 8. Abi pusės lygios.“); dėžutė — `[role=button]` su `aria-label` („Dėžutė su 3 kubeliais“); visi mygtukai su `aria-label`.
│ -- **Dydžiai 360 px:** dvi lėkštės po 128 px ir 40 px tarpas = 296 px, telpa į 328 px turinio plotį. Kubeliai 12 px su 2 px tarpu, lėkštėje dvi eilutės po 5 — telpa 10.
│ +- **Prieinamumas:** SVG `role="img"`, `aria-label` atnaujinamas („Kairėje 5 ir 3, dešinėje 8. Abi pusės lygios.“); dėžutė — `[role=button]` su `aria-label` („Dėžutė: įdėta 3 kubeliai“); visi mygtukai su `aria-label`.
│ +- **Dydžiai 360 px:** dvi lėkštės po 128 px ir 40 px tarpas = 296 px, telpa į 328 px turinio plotį. Kubeliai 12 px su 2 px tarpu. Kairėje lėkštėje pirmoje eilutėje 5 kubeliai, antroje — dėžutė (36 × 40 px); dešinėje — 5 ir 3 kubeliai. Lėkštė 128 × 64 px.
│  - **Be laikmačių, be ėjimų limito, be „game over“.** Perpildyta dėžutė — informacija, ne bauda: vaikas išima kubelius ir bando toliau.
│
│  **Užduotys.**
Baigta. Štai ką padariau ir ko nepaspėjau.

## Pasirinkimas

Ėmiau seniausią `high` prioriteto `new` pasiūlymą — **#12 Lygybė: abi pusės sveria tiek pat** (`agents/proposals/2026-11-04-ideator-lygybe.json`, 2026-11-04T07:15). Kiti `high` palikti kitiems paleidimams: #78 elektra (11-04 19:19), #137 taškas/tiesė (11-05 07:16).

## Metodas M-02

Viena idėja: „=“ sako, kad abiejose pusėse tiek pat, o ne „skaičiuok“. Sija su kairėje 5 kubeliais ir uždara dėžute, dešinėje 8 kubeliais; vaikas įdeda/išima po vieną, kol sija atsistoja. Tada po ja pasirodo kortelė `5 + 3 = 8`, o mygtukas „Perskaityk kitaip“ apverčia ją į `8 = 5 + 3` — sija nejuda.

Specifikacija padaryta taip, kad inžinierius neklausinėtų: vienas kintamasis `box` (0–10), keturios būsenos su `readout` ir `api.note` tekstais, pakrypimas `1,6° × diff` (ribojamas ±12°), keturios garso frazės, 360 px išmatavimai (lėkštės 128 px, tarpas 40 → 296 px iš 328; eilutė 68 px iš 120), klaviatūra, `prefers-reduced-motion`, `api.progress` vieną kartą. Užduotys (indeksai 1, 0, 2, 0): atpažinimas (13/3/8), taikymas (kuri kortelė atitinka), perkėlimas (`8 = 5 + ▢`), `optional` (`4 + 3 = 5 + 2`). Kiekviena turi tipinę klaidą ir užuominą į klaidą, ne į atsakymą.

## Failai

- `research/wiki/grades/01/metodai.md` — M-02, `atnaujinta: 2026-11-05`
- `research/wiki/foundations/zenklas-kaip-busena.md` — naujas įrašas: modelio išdėstymas gali tyliai įtvirtinti operacinį skaitymą, todėl būtinas perskaitymas kita kryptimi
- `research/wiki/foundations/README.md` — indekso eilutė
- `research/wiki/guidelines/pilotai.md` — P-005 (pataisiau ir P-004 rezultato eilutes, kurias buvau užgavęs)
- `research/wiki/changelog.md` — 2026-11-05 įrašas
- `agents/proposals/2026-11-05-metodininkas-lygybe.json` — `type: metodas`, high, target `content/lt/grade-01/matematika/16-lygybe-svarstykles.json`

## Šaltiniai (patikrinti per Crossref šiame paleidime)

Baroody & Ginsburg 1983, DOI 10.1086/461356 (po 7 mėn. mokymo tik 20 % pirmokų — „tas pats“) · McNeil & Alibali 2005, 10.1111/j.1467-8624.2005.00884.x · Falkner, Levi & Carpenter 1999, 10.5951/TCM.6.4.0232 · Stephens ir kt. 2022, 10.1080/10986065.2020.1793055 (K–2 su svarstyklėmis: `6 = 3 + 2` dėliojamas neteisingai, ieškoma 11) · Otten ir kt. 2019, 10.1186/s40594-019-0183-2 (34 straipsniai, modelio ribos: atimtis, neigiami skaičiai).

## Patikros

`validate_content.py --grade 1` → 0 klaidų, 0 įspėjimų. Pasiūlymo JSON validus. Metodo tekstas ir skaičiai (5+▢=8 → 3; pakrypimas; 360 px geometrija; pavadinimo ilgis 33) patikrinti terminalu.

## Nepaspėjau

`agents/log/metodininkas-2026-11-05T0831.md` ir `agents/state.json` (metodininko `last_run`/`status: ok`/`log`) — laikas baigėsi prieš pat įrašant. Tai vienintelė likusi baigties sąlygos dalis; turinys ir pasiūlymas jau diske.

## klaidos

```
session_id: local-46315d12c7761f880d04a01b15f33196b43ffc544c18485b29bab261e8c0698c
```
