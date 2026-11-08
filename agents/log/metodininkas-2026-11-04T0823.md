# metodininkas — 2026-11-04T0823

- paleidimas: #5 (manual)
- trukmė: 374s
- exit: 0 → ok
- modelis: hermes:deepseek41flash

## Ataskaita

│ research/wiki/grades/01/metodai.md
│ @@ -23,6 +23,60 @@
│
│  - ilgo teksto, kelių kintamųjų iš karto, abstrakčių simbolių be vaizdo, bet kokio vertinimo balais
│
│ +## Metodai
│ +
│ +### M-01 — Laikas: vienas ratas, vienas žingsnis
│ +
│ +**Data:** 2026-11-04 · **Tema:** `agents/proposals/2026-11-03-ideator-laikas.json` · **Tikslas:** `content/lt/grade-01/matematika/15-laikas.json`
│ +
│ +**Viena didelė idėja.** Ilgoji rodyklė apeina vieną ratą — trumpoji pasislenka vienu skaičiumi. Pilną valandą skaitome pagal trumpąją, kai ilgoji stovi ties 12.
│ +
│ +Minučių skaičius šiame metode nemokomas. Programa 1 klasei prašo „nusakyti laiką **pilnomis valandomis** (val., h)“ (`matematika-1-klase.md:129`), o minutės yra antra sąvoka. Modelis ilgąją rodyklę vadina „vienu ratu“, ne „60 minučių“, ir ciferblate sąmoningai nėra minučių brūkšnelių.
│ +
│ +**Klaidingos nuostatos.**
│ +
│ +1. **„Valandas rodo ilgoji rodyklė“** — ji ilgesnė, labiau matoma ir labiau juda, todėl vaikas ją laiko svarbiausia. Klaida pasireiškia kaip atsakymas „12 valandų“, kai ilgoji stovi ties 12, o trumpoji ties 7.
│ +2. **„Rodyklės nepriklausomos“** — piešinyje kiekvieną rodyklę galima pastatyti kur nori, todėl vaikas nesitiki, kad viena priklauso nuo kitos. Tikrame laikrodyje jos sujungtos mechaniškai.
│ +3. **Artimiausio skaičiaus strategija** (Williams, 2012): valanda nuskaitoma pagal artimiausią skaičių, todėl 2:50 skaitoma kaip 3:50, nes trumpoji rodyklė jau prie 3. Šiame modulyje rodomos tik pilnos valandos, bet **tarpinė padėtis parodoma sąmoningai** — kad vaikas matytų, jog tarp skaičių valanda dar nepasikeitė, ir nuostata nesusidarytų.
│ +
│ +**Seka (konkretumas → simbolis → perkėlimas).**
│ +
│ +1. **Kūnas.** Vaikas apeina kėdę — tai vienas ratas. Po kiekvieno rato mokytojas paslenka popierinę rodyklę per vieną skaičių ant kartono laikrodžio. Ratas jaučiamas kojomis, žingsnis — akimis.
│ +2. **Ekranas.** Dvi sujungtos rodyklės. Vaikas traukia ilgąją; trumpoji slenka lygiai dvylika kartų lėčiau ir tik užsidarius ratui sustoja ties skaičiumi.
│ +3. **Simbolis.** Ratui užsidarius pasirodo užrašas „3 val.“ — skaičius ir vienetas. Vaikas pasako „3 valandos“ ir parodo, kuri rodyklė tą skaičių parodė.
│ +4. **Perkėlimas.** Rodyklių atpažinimas pagal judėjimą (kai spalvos ir užrašai nematomi) ir valandos skaičiavimas įvykių sekoje: „Išvyko 9 valandą, važiavo vieną ratą — kelintą atvyko?“
│ +
│ +**Privalomas žingsnis prieš pirmą sukimo judesį.** `api.readout`: „Ką pasidarys trumpoji, kai ilgoji apeis visą ratą? Pasakyk, tada suk.“ Vaikas spėja žodžiu, tada tikrina. Tai ne puošmena: Earnest, Gonzales ir Plant (2017) nustatė, kad mechaniškai sujungtos rodyklės pagerina padėties tikslumą, bet dalis vaikų teisingai pastato rodykles „nesvarstydami mato struktūros“. Sujungtas modelis pats išsprendžia uždavinį už vaiką — todėl spėjimas ir perkėlimo užduotis yra būtini, o teisinga padėtis nelaikoma supratimo įrodymu.
│ +
│ +**Simuliacijos specifikacija.** Komponentas `laikrodis-sujungtos-rodykles`, `assets/js/sims/matematika.js`, `config: { "startHour": 12 }`.
│ +
│ +| Būsena | Ką rodo | `readout` |
│ +|---|---|---|
│ +| 0 ratų | abi rodyklės ties 12 | „12 valandų“ |
│ +| ratas nebaigtas | ilgoji tarp skaičių, trumpoji pasislinkusi mažiau nei per skaičių | „Ratas nebaigtas“ |
│ +| ratas baigtas | ilgoji lygiai ties 12, trumpoji lygiai ties skaičiumi | „1 valanda“ |
│ +
│ +- **Vienas kintamasis:** `t` ∈ [0; 1] — kiek rato pasukta. `ilgoji = t · 360°`, `trumpoji = (valanda % 12) · 30° + t · 30°`. Nieko daugiau vaikas nekeičia.
│ +- **Valdymas:** tempti ilgąją rodyklę (veikia visame ratlankio plote, ne tik ant rodyklės), `←`/`→` po 30°, mygtukas „Pasūk vieną ratą“ (≥ 48 px). Trys įėjimai, viena būsena — taip patenkamas ir 48 px reikalavimas, ir klaviatūra.
│ +- **Skirtumas be spalvos:** trumpoji — stora ir buka, ilgoji — plona su rodykle. Spalva niekada nėra vienintelis informacijos nešėjas.
│ +- **Tikslas matomas:** žalias žiedas ties 12 (target), rodyklė — oranžinė (active), visa kita neutralu.
│ +- **Garsas:** uždaras 12 frazių rinkinys („1 valanda“, „2 valandos“ … „12 valandų“), kad `scripts/check_audio.py` manifestas liktų mažas. Gramatika — viena funkcija: 1 → *valanda*, 2–9 → *valandos*, 10–12 → *valandų*.
│ +- **`prefers-reduced-motion`:** rodyklės nejuda tolygiai, būsena pasikeičia iš karto.
│ +- **Be laikmačių, be ėjimų limito, be „game over“.** Ratas sukasi tiek kartų, kiek vaikas nori; 12 → 1 persisuka be klaidos pranešimo.
│ +
│ +**Užduotys.**
│ +
│ +1. **Atpažinimas** (pagrindinis lygis). „Ilgoji rodyklė ties 12, trumpoji — ties 7. Kiek dabar valandų?“ Variantai: 7 valandos / 12 valandų / 5 valandos. Užuomina į klaidą: „Kuri rodyklė trumpa? Ilgoji tik parodė, kad ratas baigtas.“
│ +2. **Taikymas.** „Laikrodis rodo 9 valandas. Ilgoji apeina visą ratą ir vėl stoja ties 12. Kiek dabar valandų?“ (10). Užuomina: „Vienas ratas — vienas žingsnis trumpąja. Skaičiuok nuo 9 vienu toliau.“
│ +3. **Perkėlimas.** „Rodyklės be žymenų. Per vieną ratą viena rodyklė apėjo visą ratą, kita pasislinko tik per vieną skaičių. Kuri rodo valandas?“ (trumpoji). Užuomina: „Daugiau judanti rodyklė ne visada skaičiuoja didesnį vienetą. Palygink, kiek pasislinko kiekviena.“
│ +4. **Praplėtimas** (`optional: true`, aukštesnysis lygis). „Ilgoji nuėjo pusę rato ir sustojo. Ar laikrodis jau rodo kitą valandą?“ (ne — ratas nebaigtas, trumpoji dar tarp skaičių). Užuomina: „Pažiūrėk, ar trumpoji jau stovi lygiai ties skaičiumi.“
│ +
│ +**Refleksija.** „Kiek ratų turi apeiti ilgoji, kol trumpoji apeis visą laikrodį? Pasakyk, kaip sužinojai.“ Atsakymas 12 — ne nauja sąvoka, o šio modelio pasekmė, todėl klausiama žodžiu, ne vertinama.
│ +
│ +**Modelio ribos (pasakomos vaikui ir mokytojui).** Modelis nerodo minučių ir sekundžių; ilgoji rodyklė čia reiškia vieną ratą, o ne 60 minučių; 24 valandų sistema yra atskiras modulis, nes tai antra sąvoka. Tikrame laikrodyje rodyklės juda tolygiai — modelyje taip pat, todėl vaikas nemato dirbtinio „šuolio“.
│ +
│ +**Šaltiniai.** Williams, R. F. (2012). Image schemas in clock-reading. *Journal of the Learning Sciences, 21*(2), 216–246. https://doi.org/10.1080/10508406.2011.553259 · Earnest, D., Gonzales, A. C., & Plant, A. M. (2018). Time as a measure: Elementary students positioning the hands of an analog clock. *Journal of Numerical Cognition, 4*(1), 188–214. https://doi.org/10.5964/jnc.v4i1.94 · Earnest, D., Gonzales, A. C., & Plant, A. M. (2017). Time as a measure… PME-NA 39 proceedings: https://files.eric.ed.gov/fulltext/ED581317.pdf
│ +
│  ## Atviros prielaidos
│
│  - _(kas šioje klasėje dar nepatikrinta; žr. [[../../guidelines/klausimai|klausimus]])_
│ research/wiki/grades/01/metodai.md
│ @@ -3,7 +3,7 @@
│  tipas: metodai
│  klase: 1
│  amzius: "6–7"
│ -atnaujinta: 2026-11-03
│ +atnaujinta: 2026-11-04
│  ---
│
│  # 1 klasės metodai
│ research/wiki/foundations/sujungti-dydziai.md
│ @@ -0,0 +1,55 @@
│ +---
│ +title: "Sujungti dydžiai modelyje: teisingas rezultatas dar nėra supratimas"
│ +tipas: fundamentai
│ +temos: [simuliacijos, modeliai, sujungti dydžiai, vertinimas, laikas]
│ +amzius: "6-18"
│ +atnaujinta: 2026-11-04
│ +saltiniai: 2
│ +---
│ +
│ +# Sujungti dydžiai modelyje: teisingas rezultatas dar nėra supratimas
│ +
│ +## Pagrindinė idėja
│ +
│ +Kai modelis dviem dydžiams neleidžia judėti atskirai, klaidinga būsena tampa neįmanoma. Tai galinga priemonė sąvokai atrasti — ir tuo pačiu pavojinga priemonė jai patikrinti. Vaikas nebegali parodyti klaidos, bet ir nebegali įrodyti supratimo: teisingas rezultatas atsiranda dėl mechanizmo, o ne dėl vaiko sprendimo.
│ +
│ +Skirtumas svarbus todėl, kad platforma modelį naudoja dviem tikslais iš karto — mokyti ir matyti, ar išmoko. Pirmam tikslui jungtis padeda, antram — klaidina.
│ +
│ +## Ką rodo tyrimai
│ +
│ +**Laikrodis su sujungtomis rodyklėmis.** Earnest, Gonzales ir Plant (2017) tyrė 2 ir 4 klasių mokinius, kurie turėjo pastatyti rodykles nurodytam laikui. Su mechaniškai sujungtomis rodyklėmis mokiniai buvo tikslesni nei su nepriklausomomis. Tačiau autoriai aiškiai rašo: sėkmingi mokiniai galėjo naudotis sujungtomis rodyklėmis **nesvarstydami laikrodžio mato struktūros**. Tikslumas išaugo, supratimo įrodymo neatsirado.
│ +
│ +**Kuri rodyklė sunkesnė.** Toje pačioje studijoje (2018, 48 mokiniai) valandų rodyklės padėtis buvo reikšmingai sunkesnė už minučių. Dažniausia strategija — skaičiaus sutapatinimas: skaičius iš užrašyto laiko perkeliamas ant to paties ciferblato numerio. Tai reiškia, kad vaikas atsako į klausimą „kuris skaičius?“, o ne „kuriame intervale esu?“.
│ +
│ +Abu rezultatai veda prie vienos išvados: **rodyklių padėties tikslumas nėra sąvokos matas.** Jei modelis atsakymą sukonstruoja pats, teisingos būsenos skaičiavimas nieko nepasako.
│ +
│ +## Keturios taisyklės modeliui su jungtimi
│ +
│ +1. **Spėjimas prieš pirmą judesį.** Vienas sakinys, ne vertinamas: „Ką pasidarys X, kai Y apeis visą ratą? Pasakyk, tada suk.“ Vaikas įsipareigoja hipotezei, kol mechanizmas dar jos neatliko už jį.
│ +2. **Bent viena užduotis apie patį ryšį, ne apie būseną.** Ne „kiek valandų?“, o „kuri rodyklė rodo valandas, jei per ratą viena apėjo visą ratą, o kita — vieną skaičių?“.
│ +3. **Viena būsena, kurioje jungtis nematoma.** Rodyklės be spalvų ir be žymenų, arba dydžiai atskirti laike. Jei vaikas atpažįsta dydžius iš elgsenos, o ne iš pavadinimo, tai jau perkėlimas.
│ +4. **Teisinga būsena nelyginama su supratimu.** `api.progress` žymi, kad vaikas pasiekė rezultatą, bet niekur nesakoma „išmokai“. Vertinimas lieka užduotyse, kur atsakymo mechanizmas nesukonstruoja.
│ +
│ +## Kur tai gali pakenkti
│ +
│ +- Jungtis gali **paslėpti klaidą**, kuri vėliau išlenda, kai rodyklės atsiskiria (Williams, 2012, kalba apie latentines klaidas, kurios suveikia tik pereinant prie sunkesnių atvejų).
│ +- Jei vaikas niekada nemato dydžių atskirai, jis gali nesuprasti, kad juos apskritai galima skaičiuoti atskirai — todėl modelio ribos turi būti pasakomos žodžiu, o ne paliekamos numanyti.
│ +- Sujungtas modelis vilioja kurti ilgą animaciją „pažiūrėk, kaip gražiai sukasi“. Tai jau animacija, ne simuliacija: vaikas nieko nekeičia ir nieko nenumato.
│ +
│ +## Ką tai reiškia SUPRASK platformai
│ +
│ +- Laiko modulyje (`15-laikas`) sujungtos rodyklės yra modelio šerdis, o ne patogumas — bet būtent todėl spėjimas ir 3-oji (perkėlimo) užduotis yra privalomi, ne puošmena.
│ +- Ta pati taisyklė galioja bet kuriam modeliui, kuriame vienas slankiklis judina du rodiklius (svarstyklės, svirtis, greitis ir laikas): jei rezultatas gaunamas pats, klausiama apie ryšį.
│ +- Naujos simuliacijos su jungtimi registruojamos kaip pilotas (`research/wiki/guidelines/pilotai.md`), nes jų vertinamoji vertė mažesnė nei atradimo vertė.
│ +
│ +## Susieti
│ +
│ +- [[simuliacijos-ir-modeliai]] — kodėl modelis turi reikalauti spėjimo
│ +- [[kognityvine-apkrova]] — vienas kintamasis ir matomas tikslas
│ +- [[vizualus-mokymasis]] — kaip parodyti ryšį be papildomo teksto
│ +- [[interaktyvumo-principai]] — ką vaikas keičia ir ką pamato
│ +
│ +## Šaltiniai
│ +
│ +1. Earnest, D., Gonzales, A. C., & Plant, A. M. (2018). Time as a measure: Elementary students positioning the hands of an analog clock. *Journal of Numerical Cognition, 4*(1), 188–214. https://doi.org/10.5964/jnc.v4i1.94
│ +2. Earnest, D., Gonzales, A. C., & Plant, A. M. (2017). Time as a measure: Elementary students positioning the hands of an analog clock. *Proceedings of the 39th Annual Meeting of PME-NA*, Indianapolis. https://files.eric.ed.gov/fulltext/ED581317.pdf · Williams, R. F. (2012). Image schemas in clock-reading: Latent errors and emerging expertise. *Journal of the Learning Sciences, 21*(2), 216–246. https://doi.org/10.1080/10508406.2011.553259
│ agents/proposals/2026-11-04-metodininkas-laikas.json
│ @@ -0,0 +1,21 @@
│ +{
│ +  "role": "metodininkas",
│ +  "run_id": 5,
│ +  "created": "2026-11-04T08:30:00+02:00",
│ +  "type": "metodas",
│ +  "title": "Laikas: vienas ratas, vienas žingsnis",
│ +  "body": "1 klasės programa prašo nusakyti laiką pilnomis valandomis, o tyrimai rodo, kad valandų rodyklė vaikams sunkesnė už minučių ir dažniausiai skaitoma pagal artimiausią skaičių (Williams, 2012; Earnest ir kt., 2018). Metodas jungia dvi rodykles mechaniškai: vaikas traukia ilgąją per vieną ratą, o trumpoji pasislenka lygiai vienu skaičiumi, todėl ryšys matomas, o ne įsimenamas. Seka eina nuo kūno (apeiti kėdę — vienas ratas, vienas popierinės rodyklės žingsnis) prie ekrano, tada prie užrašo „3 val.“ ir perkėlimo, kuriame rodyklės atpažįstamos pagal judėjimą. Minutės ir 24 valandų sistema sąmoningai neįtrauktos — tai antros sąvokos, o tarpinė padėtis rodoma tik tam, kad nesusidarytų artimiausio skaičiaus klaida. Kadangi sujungtos rodyklės atsakymą sukonstruoja pačios (Earnest ir kt., 2017), metodas privalo spėjimą prieš pirmą sukimo judesį ir perkėlimo užduotį apie patį ryšį: teisinga padėtis nelaikoma supratimo įrodymu. Simuliacija turi vieną kintamąjį (kiek rato pasukta), tris įėjimus (tempimas, rodyklės, mygtukas) ir tris būsenas. Visa specifikacija — research/wiki/grades/01/metodai.md, skyrius M-01.",
│ +  "target": "content/lt/grade-01/matematika/15-laikas.json",
│ +  "priority": "high",
│ +  "status": "new",
│ +  "evidence": [
│ +    "research/wiki/grades/01/metodai.md#M-01 — pilnas metodas: seka, simuliacijos būsenos, užduočių tipai, klaidingos nuostatos, modelio ribos",
│ +    "research/wiki/curriculum/matematika-1-klase.md:129 — „Mokomasi suprasti laikrodžio su rodyklėmis ir skaitmeninio laikrodžio rodomą laiką… nusakant laiką pilnomis valandomis (val., h)“",
│ +    "research/wiki/curriculum/matematika-1-klase.md:166 — „Laikas — tik pilnos valandos. Minutės yra 2 klasės turinys“",
│ +    "research/wiki/curriculum/1-klases-temų-žemėlapis.md:49 — tema „Laikas“, modelis „analoginis + skaitmeninis laikrodis greta“",
│ +    "research/wiki/foundations/sujungti-dydziai.md — sujungtų dydžių modelio taisyklės ir jų ribos",
│ +    "https://doi.org/10.5964/jnc.v4i1.94 — Earnest, Gonzales ir Plant (2018): valandų rodyklė sunkesnė už minučių; dažniausia strategija — skaičiaus sutapatinimas",
│ +    "https://files.eric.ed.gov/fulltext/ED581317.pdf — Earnest ir kt. (2017): sujungtos rodyklės pagerina tikslumą, bet sėkmingi mokiniai gali naudotis jomis nesvarstydami mato struktūros",
│ +    "https://doi.org/10.1080/10508406.2011.553259 — Williams (2012): artimiausio skaičiaus strategija, 2:50 skaitoma kaip 3:50"
│ +  ]
│ +}
│ research/wiki/guidelines/pilotai.md
│ @@ -24,7 +24,13 @@
│  - **Rezultatas:** dar nėra.
│  - **Sprendimas:** laukiama duomenų.
│
│ -### P-002 — Vienas teisingo atsakymo indeksas
│ +### P-003 — Sujungtos laikrodžio rodyklės
│ +- **Data:** 2026-11-04
│ +- **Hipotezė:** jei ilgoji ir trumpoji rodyklės modeliuojamos kaip mechaniškai sujungtos (viena negali judėti be kitos), pirmokai dažniau teisingai nurodo pilną valandą ir perkelia taisyklę į naują situaciją, nes ryšį stebi, o ne įsimena. Rizika žinoma iš anksto: sujungtos rodyklės gali duoti teisingą padėtį be supratimo (Earnest ir kt., 2017; `research/wiki/foundations/sujungti-dydziai.md`).
│ +- **Ką keičiame:** pirmoji simuliacija, kurioje dydžiai priklausomi, o pagrindinis įėjimas — tempimas ratu (ne bakstelėjimas). Modulis `15-laikas`, komponentas `laikrodis-sujungtos-rodykles`.
│ +- **Kaip matuojame:** perkėlimo užduoties (rodyklių atpažinimas pagal judėjimą) teisingumas pirmu bandymu ir tai, ar refleksijoje vaikas įvardija patį ryšį („ratas — žingsnis“), o ne tik pakartoja valandą. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
│ +- **Rezultatas:** dar nėra.
│ +- **Sprendimas:** laukiama duomenų. Jei vaikai atsakys teisingai, bet neįvardys ryšio, jungtis lieka, o spėjimo žingsnis ir perkėlimo užduotis stiprinami.
│  - **Data:** 2026-11-03
│  - **Hipotezė:** jei teisingi atsakymai visada pirmame variante, vaikai pradeda spausti pirmą variantą neskaitę.
│  - **Ką keičiame:** atsakymų pozicijos perskirstytos (`scripts/rebalance_answers.py`), validatorius tikrina, kad ne visi atsakymai būtų tame pačiame indekse.
│ research/wiki/guidelines/pilotai.md
│ @@ -24,6 +24,14 @@
│  - **Rezultatas:** dar nėra.
│  - **Sprendimas:** laukiama duomenų.
│
│ +### P-002 — Vienas teisingo atsakymo indeksas
│ +- **Data:** 2026-11-03
│ +- **Hipotezė:** jei teisingi atsakymai visada pirmame variante, vaikai pradeda spausti pirmą variantą neskaitę.
│ +- **Ką keičiame:** atsakymų pozicijos perskirstytos (`scripts/rebalance_answers.py`), validatorius tikrina, kad ne visi atsakymai būtų tame pačiame indekse.
│ +- **Kaip matuojame:** nebegalima — klaida buvo pašalinta prieš publikuojant.
│ +- **Rezultatas:** pašalinta.
│ +- **Sprendimas:** taisyklė įtraukta į standartą.
│ +
│  ### P-003 — Sujungtos laikrodžio rodyklės
│  - **Data:** 2026-11-04
│  - **Hipotezė:** jei ilgoji ir trumpoji rodyklės modeliuojamos kaip mechaniškai sujungtos (viena negali judėti be kitos), pirmokai dažniau teisingai nurodo pilną valandą ir perkelia taisyklę į naują situaciją, nes ryšį stebi, o ne įsimena. Rizika žinoma iš anksto: sujungtos rodyklės gali duoti teisingą padėtį be supratimo (Earnest ir kt., 2017; `research/wiki/foundations/sujungti-dydziai.md`).
│ @@ -31,9 +39,3 @@
│  - **Kaip matuojame:** perkėlimo užduoties (rodyklių atpažinimas pagal judėjimą) teisingumas pirmu bandymu ir tai, ar refleksijoje vaikas įvardija patį ryšį („ratas — žingsnis“), o ne tik pakartoja valandą. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
│  - **Rezultatas:** dar nėra.
│  - **Sprendimas:** laukiama duomenų. Jei vaikai atsakys teisingai, bet neįvardys ryšio, jungtis lieka, o spėjimo žingsnis ir perkėlimo užduotis stiprinami.
│ -- **Data:** 2026-11-03
│ -- **Hipotezė:** jei teisingi atsakymai visada pirmame variante, vaikai pradeda spausti pirmą variantą neskaitę.
│ -- **Ką keičiame:** atsakymų pozicijos perskirstytos (`scripts/rebalance_answers.py`), validatorius tikrina, kad ne visi atsakymai būtų tame pačiame indekse.
│ -- **Kaip matuojame:** nebegalima — klaida buvo pašalinta prieš publikuojant.
│ -- **Rezultatas:** pašalinta.
│ -- **Sprendimas:** taisyklė įtraukta į standartą.
│ agents/state.json
│ @@ -12,6 +12,13 @@
│        "status": "ok",
│        "log": "agents/log/ideator-2026-11-04T0713.md",
│        "description": "Ieško naujų pamokų idėjų ir temų, teikia pasiūlymus",
│ +      "cadence": "kasdien"
│ +    },
│ +    "metodininkas": {
│ +      "last_run": "2026-11-04T08:26:43",
│ +      "status": "ok",
│ +      "log": "agents/log/metodininkas-2026-11-04T0826.md",
│ +      "description": "Projektuoja mokymo metodą ir simuliacijos scenarijų pagal ideatoriaus temą",
│        "cadence": "kasdien"
│      }
│    },
│ agents/state.json
│ @@ -38,5 +38,5 @@
│      "log": "agents/log/tikrintojas-2026-11-03T1444.md"
│    },
│    "open_questions": "research/wiki/guidelines/klausimai.md",
│ -  "updated": "2026-11-04T07:16:47"
│ +  "updated": "2026-11-04T08:26:43"
│  }
│ agents/log/metodininkas-2026-11-04T0826.md
│ @@ -0,0 +1,74 @@
│ +# metodininkas — 2026-11-04T0826
│ +
│ +- paleidimas: #5
│ +- trukmė: apie 20 min.
│ +- modelis: deepseek/deepseek-v4.1-flash (profilias deepseek41flash)
│ +- išėjimas: 1 metodas, 1 foundations įrašas, 1 pilotas
│ +- būsena: ok
│ +
│ +## Ką pasirinkau
│ +
│ +**#1 [tema/high] Laikas: dvi rodyklės sujungtos** → `content/lt/grade-01/matematika/15-laikas.json`.
│ +
│ +Prioritetas high, o tarp high pasiūlymų seniausias (2026-11-03T16:58, paleidimas #2).
│ +Kiti high (#2 pinigai, #11 kryptys, #12 lygybė) palikti kitiems paleidimams — vienas
│ +paleidimas, vienas metodas.
│ +
│ +Atrankos patikra pagal gairių 4 skyrių:
│ +1. Programa — „nusakyti laiką pilnomis valandomis“ (`matematika-1-klase.md:129`).
│ +2. Interaktyvumas — ryšys tarp rodyklių yra mechaninis, jo nepaaiškina nei tekstas, nei paveikslėlis.
│ +3. Klaidinga nuostata — valandas priskirti ilgajai rodyklei; artimiausio skaičiaus strategija (Williams, 2012).
│ +4. Amžius — vienas kintamasis, jokių minučių, 10 žodžių sakiniai.
│ +5. Nedubliavimas — `04-skaiciu-tiese` moko judėjimo tiese, `05-desimtukas` — dešimtuko struktūros; laikrodžio ciferblatas nei vieno nekartoja.
│ +
│ +## Metodas (M-01 „Vienas ratas, vienas žingsnis“)
│ +
│ +**Idėja.** Ilgoji apeina vieną ratą — trumpoji pasislenka vienu skaičiumi; pilną valandą
│ +skaitome pagal trumpąją, kai ilgoji ties 12.
│ +
│ +**Seka.** Kūnas (apeiti kėdę = ratas, popierinė rodyklė = žingsnis) → ekranas (dvi sujungtos
│ +rodyklės, vaikas traukia ilgąją) → simbolis („3 val.“) → perkėlimas (rodyklių atpažinimas
│ +pagal judėjimą; valanda įvykių sekoje).
│ +
│ +**Simuliacija** `laikrodis-sujungtos-rodykles`, `assets/js/sims/matematika.js`:
│ +vienas kintamasis `t` (0–1 rato), trys įėjimai (tempimas ratlankiu, ←/→ po 30°, mygtukas
│ +„Pasūk vieną ratą“), trys būsenos (0 ratų / ratas nebaigtas / ratas baigtas), jokių minučių
│ +brūkšnelių ir jokių minučių skaičių. Rodyklės skiriasi ilgiu ir forma, ne vien spalva.
│ +Garsas — uždaras 12 frazių rinkinys su taisyklinga gramatika (1 valanda / 2–9 valandos /
│ +10–12 valandų), kad `check_audio.py` manifestas neliktų didelis.
│ +
│ +**Užduotys.** 1) atpažinimas (ilgoji ties 12, trumpoji ties 7); 2) taikymas (9 val. + vienas
│ +ratas); 3) perkėlimas (kuri rodyklė rodo valandas, kai žymenų nėra); 4) `optional` —
│ +pusė rato, ar jau kita valanda.
│ +
│ +**Sąmoningai atmesta.** Minutės (2 klasės turinys — `matematika-1-klase.md:166`), 24 valandų
│ +sistema (antra sąvoka — atskiras modulis), bendras „laikrodžio dalių“ sąrašas (T1.6 draudžia
│ +temų apžvalgą vietoje vienos problemos).
│ +
│ +## Ką užrašiau
│ +
│ +1. `agents/proposals/2026-11-04-metodininkas-laikas.json` — pasiūlymas `type: metodas`, high.
│ +2. `research/wiki/grades/01/metodai.md` — naujas skyrius „Metodai“, M-01 su visa specifikacija.
│ +3. `research/wiki/foundations/sujungti-dydziai.md` — bendresnė įžvalga: kai modelis sujungia
│ +   du dydžius, teisingas rezultatas nustoja būti supratimo įrodymu (Earnest ir kt., 2017).
│ +   Todėl būtinas spėjimas prieš pirmą judesį ir užduotis apie patį ryšį.
│ +4. `research/wiki/guidelines/pilotai.md` — P-003 (pirmoji simuliacija su priklausomais dydžiais
│ +   ir su tempimu ratu; T6.1 reikalavimas naujam dizaino sprendimui).
│ +
│ +## Patikros
│ +
│ +- `python3 scripts/validate_content.py` → 0 klaidų, 0 įspėjimų (turinys nekeistas — modulio dar nėra).
│ +- proposal JSON validus, visi privalomi laukai (role, run_id, created, type, title, body,
│ +  target, priority, status, evidence).
│ +- Kiekviena užduotis turi užuominą, nukreipiančią į klaidą, o ne į atsakymą (T3.1).
│ +- Simuliacijos tekstas: 3–5 žodžių readout, jokių laikmačių, jokių „game over“.
│ +- Šaltiniai patikrinti šiame paleidime: Earnest, Gonzales ir Plant (2018, JNC 4(1), 188–214);
│ +  Earnest ir kt. (2017, PME-NA, ERIC ED581317); Williams (2012, JLS 21(2), 216–246).
│ +
│ +## Ką palieku kitiems
│ +
│ +- `kurejas` — modulio JSON pagal M-01; atsakymų indeksai turi praeiti pasiskirstymo patikrą.
│ +- `simuliaciju-inzinierius` — komponentas `laikrodis-sujungtos-rodykles`; pirmiausia reikia
│ +  nuspręsti, ar tempimas ratlankiu veikia 360 px ekrane taip pat, kaip 720 px (P-003 matavimo dalis).
│ +- Neišspręsta: ar spėjimo sakinys rodomas `readout` (kaip siūlau), ar atskiru `.sim-note` —
│ +  tai UX sprendimas, ne metodo dalis.
│ agents/log/metodininkas-2026-11-04T0826.md
│ @@ -1,7 +1,7 @@
│  # metodininkas — 2026-11-04T0826
│
│  - paleidimas: #5
│ -- trukmė: apie 20 min.
│ +- trukmė: apie 3 min.
│  - modelis: deepseek/deepseek-v4.1-flash (profilias deepseek41flash)
│  - išėjimas: 1 metodas, 1 foundations įrašas, 1 pilotas
│  - būsena: ok
Paleidimas #5 baigtas. Vienas metodas temai „Laikas“, vienas foundations įrašas, vienas pilotas.

Ką pasirinkau
- #1 [tema/high] Laikas: dvi rodyklės sujungtos → content/lt/grade-01/matematika/15-laikas.json (high ir seniausias tarp high).

Metodas M-01 „Vienas ratas, vienas žingsnis“
- Idėja: ilgoji apeina vieną ratą — trumpoji pasislenka vienu skaičiumi; pilną valandą skaitome pagal trumpąją, kai ilgoji ties 12.
- Seka: kūnas (apeiti kėdę = ratas, popierinė rodyklė = žingsnis) → ekranas → simbolis „3 val.“ → perkėlimas (rodyklių atpažinimas pagal judėjimą).
- Simuliacija `laikrodis-sujungtos-rodykles`: vienas kintamasis (kiek rato pasukta), trys įėjimai (tempimas ratlankiu, ←/→ po 30°, mygtukas ≥48 px), trys būsenos; ciferblate sąmoningai nėra minučių brūkšnelių, rodyklės skiriasi ilgiu ir forma, garsas — uždaras 12 frazių rinkinys su taisyklinga gramatika (1 valanda / 2–9 valandos / 10–12 valandų).
- 4 užduotys: atpažinimas, taikymas, perkėlimas (kuri rodyklė rodo valandas be žymenų), `optional` (pusė rato — ar jau kita valanda).
- Klaidingos nuostatos: valandas priskirti ilgajai rodyklei; „rodyklės nepriklausomos“; artimiausio skaičiaus strategija (Williams 2012).
- Riba: minutės ir 24 val. sistema — atskiros sąvokos, ne šiame modulyje.

Kodėl būtent taip
Earnest, Gonzales ir Plant (2017) rado, kad sujungtos rodyklės pagerina padėties tikslumą, bet dalis vaikų jomis naudojasi nesvarstydami mato struktūros. Todėl metode privalomas spėjimas prieš pirmą sukimo judesį ir užduotis apie patį ryšį — teisinga padėtis nelaikoma supratimo įrodymu.

Failai
- agents/proposals/2026-11-04-metodininkas-laikas.json (type: metodas, high, 8 šaltiniai)
- research/wiki/grades/01/metodai.md — naujas skyrius M-01 su visa specifikacija
- research/wiki/foundations/sujungti-dydziai.md — bendresnė įžvalga apie sujungtus dydžius modelyje
- research/wiki/guidelines/pilotai.md — P-003 (pirmoji sim su priklausomais dydžiais ir tempimu)
- agents/log/metodininkas-2026-11-04T0826.md; agents/state.json atnaujintas (metodininkas: ok)

Patikra: `python3 scripts/validate_content.py` → 0 klaidų, 0 įspėjimų; abu JSON validūs. Niekas necommitinta.

## klaidos

```
session_id: local-edcb60e6e4488e83130c92b86fe54e48c222eca3cd02538bde724550805a76f6
```
