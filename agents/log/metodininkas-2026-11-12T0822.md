# metodininkas — 2026-11-12T0822

- paleidimas: #244 (manual)
- trukmė: 683s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ research/wiki/grades/01/metodai.md
│ @@ -506,6 +506,93 @@
│
│  **Pastaba dėl wiki.** `research/wiki/curriculum/matematika-1-klase.md:141` teigia, kad 1 klasėje ilgis „dokumente nenurodytas“; metų plano eilutė `:17300` tam prieštarauja („Ilgis 5“). Metodas remiasi šaltiniu, o wiki eilutė taisytina atskirame tyrėjo darbe — šiame faile ji neliesta.
│
│ +### M-08 — Kas gyvas: pokytis, o ne judėjimas
│ +
│ +**Data:** 2026-11-12 · **Tema:** `agents/proposals/2026-11-12-metodininkas-kas-gyvas.json` (idėja parengta ideator paleidime #243, bet pasiūlymo failas neįrašytas; metodas ją paima iš `agents/log/ideator-2026-11-12T0742.md:31–37`) · **Tikslas:** `content/lt/grade-01/pasaulio-pazinimas/20-kas-gyvas.json` · **Šaltinis:** [[../../foundations/gyvybe-ir-judesys|gyvybe-ir-judesys]]
│ +
│ +**Viena didelė idėja.** Gyvas organizmas keičiasi pats: auga ir atsako į tai, ko jam reikia. Daiktas gali judėti ir vis tiek nepakisti. Todėl vien judėjimas nepasako, kas gyva.
│ +
│ +**Ką sako programa.** 1 klasės gamtos mokslų ilgalaikiame plane yra atskira tema **26.2.4 „Bendri gyvų organizmų požymiai“** (1 val.), o veiklos — demonstracinis bandymas „Ar vazoninė gėlė kvėpuoja?“ ir žaidimas „Gyvas–negyvas“ (`sources/pradinio-bp-rekomendacijos-2024.txt:17645–17648`). Bendra 1–2 kl. nuostata tuos požymius vardija taip: „juda, kvėpuoja, auga, maitinasi, dauginasi“ (`:12629–12632`). Todėl modelis **neneigia** judėjimo kaip požymio: jis rodo, kad vienas judesys sprendimo nepadaro, o augimas ir reakcija — padaro. Tai LL-18 atvejis, kurio apeiti negalima: „juda“ oficialiame sąraše yra, tad ginčijamas ne jo statusas, o vieno požymio pakankamumas. Tema neperžengia 1 klasės ribos: augalo dalių funkcijos ir „gyvybės“ apibrėžimas moksliniu lygmeniu (27.2.1) neimamos.
│ +
│ +**Kodėl modelis, o ne paveikslėlis.** Gyvybė pasireiškia laike: augalas per savaitę paauga, akmenukas nepakinta. Viename paveikslėlyje to nėra. Dviejų paveikslų greta vaikas negali patikrinti, kad akmenukas ir kamuoliukas tikrai stovėjo toje pačioje vietoje ir su jais nieko neatsitiko — trūksta to paties kadro. Modelyje visi trys daiktai stovi vienoje scenoje, o vaikas keičia tik vieną dalyką (vandenį) ir gali bet kada pastumti kamuoliuką: kamuoliukas nurieda, o jo pokytis lentelėje lieka 0. Tai bandymas, kurio paveikslėlis negali duoti — judėjimo hipotezė patikrinama tame pačiame ekrane, o ne paneigiama tekstu.
│ +
│ +**Ką rodo tyrimai.** Villarroel (2013) individualiai apklausė 118 vaikų (4–5, 5–6 ir 6–7 m. grupės) ir prašė kiekvieną nuotraukoje pavaizduotą objektą (medis, gėlės, šuo, paukštis, motociklas, automobilis, debesys, saulė) priskirti gyviems ar negyviems. **6–7 m. grupėje 39,5 % teisingai priskyrė visus objektus**; augalus teisingai priskyrė 79,1 %, transporto priemones — 86 %, dangaus reiškinius (saulę, debesis) — 60,5 %. 4–5 m. grupėje vaikai transporto priemonėms gyvybę priskyrė **dažniau nei atsitiktinai** (`:733–735`, `:751–753`, `:848–853`). Tai reiškia, kad judėjimas kaip kriterijus nėra atsitiktinė vaiko klaida, o sistema, kuri nyksta lėtai — ir kad augalas yra sunkiausias atvejis, nes jis nejuda.
│ +
│ +Leddon, Waxman ir Medin (2009) parodė, kad pats klausimo žodis klaidina: kai vaikų klausiama „ar tai gyva?“ („alive“), jie augalus priskiria gyviems rečiau, o pakeitus klausimą mažiau dviprasmišku („ar tai gyvas padaras?“) vaikai parodo turį bendrą sąvoką, siejančią augalus su gyvūnais. Villarroel savo tyrime šią metodinę išvadą pritaikė tiesiogiai (`:470–479`). Praktinė pasekmė moduliui: **klausiama „Kuris yra gyvas organizmas?“, ne „Ar jis gyvas?“**, ir vartojamas programos terminas „gyvas organizmas“, o ne kasdienis „gyvas“.
│ +
│ +**Klaidingos nuostatos ir kaip jos paneigiamos.**
│ +
│ +1. **„Gyva tai, kas juda.“** Paneigiama kamuoliuku: jis juda tik tada, kai jį pastumi, ir po to nurieda bei sustoja, o pokyčių lentelėje lieka 0. Antras prieštaraujantis pavyzdys tame pačiame ekrane — augalas, kuris nejuda, bet auga (LL-28).
│ +2. **„Augalas negyvas, nes nejuda ir nieko neveikia.“** Paneigiama augalu: per savaitę su vandeniu jis paauga, be vandens — nuleidžia lapus. Abu pokyčiai yra reakcija į tai, ko jam reikia; nei akmenukas, nei kamuoliukas į vandenį nereaguoja.
│ +3. **„Jei per savaitę nepakito, tai negyva.“** Šios nuostatos modelis nepaneigia, o pripažįsta kaip savo ribą: praplėtimo užduotis klausia apie sausą žirną lentynoje, o mokytojo skiltyje pasakyta, kad sėkla gali ilgai laukti vandens. Modelis nevaizduoja ramybės būsenos, bet jos neignoruoja.
│ +4. **„Gyvybę rodo kvėpavimas, o jo nesimato.“** Modelis kvėpavimo nevaizduoja ir to neslepia: tai atskiras programos bandymas „Ar vazoninė gėlė kvėpuoja?“ mokytojo veikloje, o ne simuliacijos apgavystė.
│ +
│ +**Seka (konkretumas → modelis → simbolis → perkėlimas).**
│ +
│ +1. **Trys daiktai ant stalo.** Mokytojas padeda ant stalo pupos daigą vazone, akmenuką ir kamuoliuką. Klausimas: „Kuris iš jų yra gyvas organizmas?“ Vaikai ginčijasi; kas nors pastumia kamuoliuką, ir jis nurieda. Atsakymo mokytojas neteikia. Tikslas: iškelti kasdienį kriterijų — judėjimą — į kalbą, kad modelis turėtų ką griauti.
│ +2. **Spėjimas ir pirma savaitė ekrane.** Vaikas paspaudžia vieną iš trijų spėjimų („augalas / akmenukas / kamuoliukas pasikeis“), tada „Palaistyk“ ir „Po savaitės“. Augalas paauga dvi padalas, lapai pasisuka į šviesą; akmenukas ir kamuoliukas lieka tokie patys. `readout` lygina spėjimą su įvykiu. Tikslas: įsipareigoti spėjimui ir pamatyti pirmą pokytį (LL-15).
│ +3. **Kamuoliuko stūmimas.** Vaikas spaudžia „Pastumk kamuoliuką“: kamuoliukas nurieda ir sustoja, o lentelėje jo pokytis lieka 0. `api.note`: „Jį pastūmei tu. Pats jis nejuda ir neauga.“ Tikslas: atskirti judėjimą nuo pokyčio tame pačiame kadre.
│ +4. **Antra savaitė be vandens.** Vaikas perjungia į „Nelaistyk“ ir paspaudžia „Po savaitės“. Augalo lapai nuleisti, spalva blankesnė; akmenukas ir kamuoliukas vėl nepakito. `api.note`: „Augalas atsakė į tai, ko jam trūko.“ Tikslas: parodyti, kad gyvybė yra reakcija, o ne tik augimas.
│ +5. **Simbolis ir perkėlimas.** Po abiejų savaičių atsiranda pokyčių lentelė („augalas +2 · akmenukas 0 · kamuoliukas 0“) ir vienas sakinys: „Gyvas organizmas keičiasi pats.“ Vaikas jį perskaito ir pasako, kodėl kamuoliukas nepateko į lentelę. Tada — tos pačios taisyklės atvejai be modelio: žaislinis automobilis su rakteliu, medis žiemą, sausas žirnas. Tikslas: perkelti taisyklę į situacijas, kurių ekrane nebuvo.
│ +
│ +**Simuliacijos specifikacija.** Komponentas `kas-gyvas`, failas `assets/js/sims/pasaulis.js` (šis failas jau importuoja `art.js`, o `check_art.py` LEGACY sąraše yra tik `matematika.js`, todėl sceną privaloma rinkti iš `art.js` dalių: `plank`, `pot`, `soil`, `stem`, `leaf`, `ball`). `config`:
│ +
│ +```json
│ +{ "objects": [
│ +    { "id": "augalas", "name": "pupos daigas", "art": "plant" },
│ +    { "id": "akmenukas", "name": "akmenukas", "art": "pebble" },
│ +    { "id": "kamuoliukas", "name": "kamuoliukas", "art": "ball" } ],
│ +  "weeks": 2,
│ +  "growthPx": 16,
│ +  "guess": ["augalas", "akmenukas", "kamuoliukas"],
│ +  "sentences": { "guess": "…", "watered": "…", "grew": "…", "dry": "…",
│ +                 "drooped": "…", "push": "…", "pushNote": "…", "table": "…", "done": "…" } }
│ +```
│ +
│ +Skaičiai išvedami, ne įrašyti: pokytis lentelėje = `weeks * growthPx / 8` (dvi savaitės su vandeniu → +2; be vandens → −2; akmenukas ir kamuoliukas → 0 visada, nes jų `change()` grąžina 0). Jei `growthPx` nesidalija iš 8, komponentas meta klaidą į `console` ir rodo „Augimas nesuderintas su padalomis.“ — tylus apvalinimas būtų neteisingas modelis.
│ +
│ +| Būsena | Ką vaikas mato | `readout` | `api.note` |
│ +|---|---|---|---|
│ +| pradžia | trys daiktai ant lentynos, spėjimo mygtukai aktyvūs, „Po savaitės“ neaktyvus | „Kuris daiktas per savaitę pasikeis? Spėk.“ | „Pirma spėk, tada laistyk.“ |
│ +| spėjimas | spėjimas pažymėtas, atsirado „Palaistyk / Nelaistyk“ | „Tu sakei: augalas. Dabar pasirink vandenį.“ | „Augalas gali gauti vandens arba ne.“ |
│ +| pirma savaitė, laistyta | augalas aukštesnis dviem padalom, lapai pasisukę | „Augalas paaugo. Kiti du nepakito.“ | „Tu sakei augalas. Taip ir įvyko.“ |
│ +| pirma savaitė, nelaistyta | augalo lapai nuleisti, spalva blanki | „Augalo lapai nuleisti. Kiti du nepakito.“ | „Augalas atsakė į tai, ko jam trūko.“ |
│ +| kamuoliukas pastumtas | kamuoliukas pasislinkęs į dešinę ir stovi; kiti nejuda | „Kamuoliukas nuriedėjo ir sustojo.“ | „Jį pastūmei tu. Pats jis nejuda ir neauga.“ |
│ +| antra savaitė (priešinga sąlyga) | augalas keičiasi priešinga kryptimi; lentelėje −2 | „Antra savaitė. Augalas vėl pasikeitė.“ | „Vanduo keičia augalą, o ne akmenuką.“ |
│ +| abi savaitės | pokyčių lentelė „augalas +2 · akmenukas 0 · kamuoliukas 0“ | „Trys daiktai, vienas pasikeitė.“ | „Gyvas organizmas keičiasi pats.“ |
│ +| „Iš naujo“ | pradinė būsena, spėjimas neištrintas | „Vėl trys daiktai.“ | „Gali bandyti iš naujo.“ |
│ +
│ +- **Vienas kintamasis:** `watered` ∈ {`true`, `false`}. Jis vienintelis keičia augalo būseną ir lentelės skaičių. Stūmimas yra parodomasis veiksmas: `pushBall()` keičia tik kamuoliuko `cx` ir sąmoningai neliečia jokio skaičiaus — tai turi būti užtikrinta kodu, o ne teksto pažadu.
│ +- **Laikas be laikmačio:** „savaitė“ yra vienas paspaudimas, o ne laukimas. Jokių `setInterval`, jokio „po 3 sekundžių“. Jei animacijai naudojamas `setTimeout`, `mount()` grąžina valymo funkciją (KURINIO-STANDARTAS §4.7).
│ +- **Išdėstymas 360 px:** scena `viewBox="0 0 328 200"`, `width:100%`, `max-width:328px`. Lentyna — `art.plank(16, 138, 296, 10)`. Augalas x ≈ 52 (vazonas 34×28, stiebas iki 46 px, du lapai), akmenukas — `art.ball(158, 124, 14)`, kamuoliukas — `art.ball(252, 112, 26)`. Dešinėje 0–4 padalų juosta x = 310, aukštis 4 × 18 px. Pokyčių lentelė — trys žetonai po 96 px (×3 = 288 iš 328). Pavadinimai po daiktais 13 px, nekertami (`scrollWidth == clientWidth`).
│ +- **Įėjimai:** trys spėjimo mygtukai 96 × 56 px su `aria-label` („Spėju: augalas“); „Palaistyk / Nelaistyk“ 100 % × 56 px su `aria-pressed`; „Po savaitės“ 100 % × 56 px; „Pastumk kamuoliuką“ 100 % × 56 px; „Iš naujo“ ≥ 96 × 48 px. Klaviatūra: `Tab`, `Enter`/`Space`, `←`/`→` perjungia spėjimo variantus, `W` perjungia vandenį, `R` atstato. Fokusas po veiksmo: į „Po savaitės“, kai pasirinktas vanduo; į „Pastumk kamuoliuką“, kai pasirodo lentelė (LL-32).
│ +- **Grįžtamasis ryšys** — iškart po paspaudimo, be garso įžangos. `readout` įvardija būseną ir palygina su spėjimu, `api.note` sako **kodėl**, niekada „teisingai“ ir niekada apie vaiką (T5.1). `api.progress({ correct: true })` — vieną kartą, kai **abi savaitės** praėjusios skirtingomis sąlygomis, o ne po pirmos (LL-29). „Iš naujo“ pažangos netrina (LL-16).
│ +- **Augalas nenumiršta.** Net dvi savaites be vandens jis lieka gyvas, tik nuleidęs lapus: modelis nebaudžia ir nevaizduoja mirties, o `readout` sako „Augalas laukia vandens.“ Jei po antros sausos savaitės lapai virsta rudi, tekstas vis tiek sako „gyvas, bet ištroškęs“ — 6–7 m. vaikui mirtis modelyje nereikalinga, o neteisinga būsena būtų blogesnė už supaprastinimą.
│ +- **Garsas** — devynios frazės `config.sentences` (LL-42), visos trumpesnės nei 10 žodžių; `api.note` garsiai neskaitomas. Generuojami abu variantai (`n`, `s`), `check_audio.py` privalo matyti visas devynias.
│ +- **Prieinamumas:** scenos SVG `role="img"` su `aria-label`, atnaujinamu po kiekvieno veiksmo („Lentynoje pupos daigas, akmenukas ir kamuoliukas. Augalas aukštesnis.“); `readout` — `aria-live="polite"`. Daiktai skiriasi forma ir pavadinimu, ne vien spalva; spėjimo būsena — `aria-pressed`. Visi taikiniai ≥ 48 px.
│ +- **Jokio laiko limito, ėjimų limito, „game over“.**
│ +
│ +**Užduotys.**
│ +
│ +| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
│ +|---|---|---|---|---|---|
│ +| 1 | atpažinimas | „Po savaitės augalas paaugo, akmenukas ir kamuoliukas liko tokie patys. Kuris yra gyvas organizmas?“ — Augalas / Kamuoliukas / Akmenukas | Augalas (0) | Kamuoliukas — judėjimas laikomas gyvybės požymiu | „Pažiūrėk, kas pasikeitė, o kas tik pajudėjo.“ |
│ +| 2 | taikymas | „Kamuoliuką pastūmei ir jis nuriedėjo. Ar jis dėl to tapo gyvas?“ — Taip, nes juda / Ne, jis juda tik tada, kai jį stumi / Ne, nes jis kvėpuoja | Ne, juda tik kai stumi (1) | pirmas — judėjimas priskiriamas pačiam daiktui | „Kas jį pajudino? Ar jis pajudėtų pats?“ |
│ +| 3 | perkėlimas | „Žaislinis automobilis važiuoja, kai pasuki raktelį. Augalas nejuda. Kuris gyvas organizmas?“ — Augalas, nes auga ir reaguoja į vandenį / Automobilis, nes juda / Abu | Augalas (0) | antras — „juda“ painiojamas su „gyvas“ | „Judėjimą sukelia raktelis, o augimą — vanduo.“ |
│ +| 4 | perkėlimas (`optional: true`) | „Sausas žirnas guli lentynoje ir per savaitę nepakito. Ar jis gyvas organizmas?“ — Ne, nes nepasikeitė / Taip, jis tik laukia vandens / Ne, nes nejuda | Taip, laukia vandens (1) | pirmas — nepakitusi būsena laikoma negyva | „Palaistyk jį ir palauk ilgiau.“ |
│ +
│ … omitted 15 diff line(s) across 1 additional file(s)/section(s)
│ research/wiki/foundations/vienetas-ir-skaicius.md
│ @@ -0,0 +1,48 @@
│ +---
│ +title: "Vienetas ir skaičius: kodėl ilgis yra vienetų skaičius"
│ +tipas: fundamentai
│ +temos: [ilgis, matavimas, vienetas, skaičius, ankstyvoji matematika]
│ +amzius: "6-9"
│ +atnaujinta: 2026-11-12
│ +saltiniai: 4
│ +---
│ +
│ +# Vienetas ir skaičius: kodėl ilgis yra vienetų skaičius
│ +
│ +## Pagrindinė idėja
│ +
│ +Matuoti reiškia **kartoti tą patį vienetą** ir suskaičiuoti, kiek kartų jis telpa. Todėl ilgis nėra savybė, kurią daiktas turi pats savaime, o santykis: tas pats daiktas, matuojamas skirtingo dydžio vienetais, gauna skirtingus skaičius, o jo ilgis nepakinta. Iš to išeina dvi taisyklės, kurios 1 klasėje dar nėra savaime suprantamos: (1) skaičius be vieneto ilgio nepasako, ir (2) kuo mažesnis vienetas, tuo didesnis skaičius. Antroji yra **atvirkštinis ryšys**, ir būtent jis klaidingiausiai atrodo akivaizdus suaugusiajam.
│ +
│ +## Ką rodo tyrimai
│ +
│ +**Matavimo samprata tirta kaip atskira sąvoka, ne kaip skaičiavimo priedas.** Carpenter ir Lewis (1976) kėlė klausimą, kiek mažamečiai vaikai pripažįsta, kad matavimo veiksme vienetas turi likti pastovus, ir kaip jie įgyja žinią, kad **matuotų vienetų skaičius atvirkščiai susijęs su vieneto dydžiu** (Crossref abstraktas). Tai rodo, kad tyrimo lauke ši sąsaja laikyta ne savaime suprantama, o atskirai išmokstama.
│ +
│ +**Mokymosi trajektorija turi pakopas.** Sarama, Clements, Barrett, Van Dine ir McDonel (2011) patikrino ilgio matavimo trajektoriją ankstyvajame amžiuje; vėlesniame tos pačios grupės darbe (Sarama ir kt., 2022) aprašytas trečias lygis — *Length Unit Relater and Repeater*: vaikas kartoja vieną vienetą, supranta, kad visi vienetai turi būti vienodo ilgio, ir **suvokia atvirkštinį vieneto dydžio ir vienetų skaičiaus ryšį**. Ankstesnis lygis (*End-to-End*) dar gali neatpažinti vienodų vienetų būtinumo. 1 klasės vaikai būna abiejuose lygiuose, todėl vienas modulis negali „įveikti“ trajektorijos — jis gali duoti vieną patirtį, kurioje ryšys matomas.
│ +
│ +**Konservavimas padeda, bet ne viską lemia.** Hiebert (1981) nagrinėjo ilgio konservavimo ir tranzityvumo sąsają su matavimo supratimu; jo išvada, kad poveikis priklauso nuo užduoties, o ne nuo bendro vaiko pasirengimo, reiškia, kad modelis neturi tikėtis, jog vaikas mintyse palygins du daiktus. Jis turi parodyti **tą patį** daiktą du kartus, o palyginimą atlikti ekrane.
│ +
│ +## Ką tai reiškia SUPRASK platformai
│ +
│ +1. **Skaičius ekrane niekada nerodomas vienas.** Kiekviena eilutė yra „6 sąvaržėlės“, o ne „6“. Tai ne stiliaus, o sąvokos reikalavimas: nuogas skaičius modelį paverčia skaičiavimo pratybomis.
│ +2. **Kintamasis yra vienetas, o ne daiktas.** Jei vaikas keistų matuojamą daiktą, jis negalėtų atskirti, kas pasikeitė. Modelis laiko daiktą mechaniškai nepajudinamą (įterpiamas vieną kartą), o keičia tik vienetą.
│ +3. **Grįžimas į ankstesnį vienetą yra kontrolinis bandymas.** Tas pats ekranas turi grąžinti lygiai tą patį vaizdą ir tą patį skaičių; tai įrodo, kad daiktas nepakito, ko dviejų paveikslų palyginimas neduoda.
│ +4. **Dalyba turi būti tiksli arba modelio nėra.** Jei daikto ilgis nesidalija iš vieneto, likutis yra antra sąvoka (2 klasės turinys). Tylus apvalinimas modelį padarytų neteisingą, todėl komponentas tokį atvejį turi atvirai atmušti, o ne apeiti.
│ +5. **Standartiniai vienetai (cm, mm) neimami.** Programa jų sąryšius priskiria antrai klasei; 1 klasėje lieka sąlyginiai vienetai ir vienodo vieneto taisyklė (LL-23).
│ +
│ +## Ko šis įrašas nedaro
│ +
│ +Jis neįrodo, kad visi pirmokai klysta, ir necituoja Carpenter ir Lewis rezultatų skaičių: šiame darbe turėtas tik Crossref abstraktas, kuriame įvardytas tyrimo tikslas, o ne rezultatų lentelė, todėl rezultatų neperpasakoju. Sarama ir kt. trajektorija aprašo **tipišką** eigą, ne kiekvieno vaiko kelią. Įrašas nustato tik mažiausią dizaino sąlygą: jei modelis matuoja, jis turi rodyti vienetą, skaičių ir įrodymą, kad daiktas nepakito.
│ +
│ +## Susieti
│ +
│ +- [[dydis-ir-skaicius]] — ta pati problema kitoje srityje: matoma savybė prieštarauja užrašytai vertei
│ +- [[sujungti-dydziai]] — kodėl teisinga modelio būsena dar nėra supratimas
│ +- [[simuliacijos-ir-modeliai]] — modelio ribos ir konteksčio nykimas
│ +- [[../grades/01/metodai|1 klasės metodai]] — M-07 „Ilgis: tas pats daiktas, kitas vienetas — kitas skaičius“
│ +
│ +## Šaltiniai
│ +
│ +1. Carpenter, T. P., & Lewis, R. (1976). The development of the concept of a standard unit of measure in young children. *Journal for Research in Mathematics Education, 7*(1), 53–58. https://doi.org/10.5951/jresematheduc.7.1.0053
│ +2. Sarama, J., Clements, D. H., Barrett, J., Van Dine, D. W., & McDonel, J. S. (2011). Evaluation of a learning trajectory for length in the early years. *ZDM Mathematics Education, 43*(5), 667–680. https://doi.org/10.1007/s11858-011-0326-5
│ +3. Sarama, J., Clements, D. H., Barrett, J. E., Cullen, C. J., Hudyma, A., & Vanegas, Y. (2022). Length measurement in the early years: Teaching and learning with learning trajectories. *Mathematical Thinking and Learning, 24*(4), 267–290. https://doi.org/10.1080/10986065.2020.1858245
│ +4. Hiebert, J. (1981). Cognitive development and learning linear measurement. *Journal for Research in Mathematics Education, 12*(3), 197–211. https://doi.org/10.5951/jresematheduc.12.3.0197
│ research/wiki/foundations/gyvybe-ir-judesys.md
│ @@ -0,0 +1,48 @@
│ +---
│ +title: "Gyvybė ir judėjimas: kodėl „juda“ dar nepasako „gyvas“"
│ +tipas: fundamentai
│ +temos: [gyvoji gamta, gyvas organizmas, judėjimas, animizmas, ankstyvasis gamtamokslinis ugdymas]
│ +amzius: "6-7"
│ +atnaujinta: 2026-11-12
│ +saltiniai: 3
│ +---
│ +
│ +# Gyvybė ir judėjimas: kodėl „juda“ dar nepasako „gyvas“
│ +
│ +## Pagrindinė idėja
│ +
│ +Vaikas gyvybę atpažįsta iš to, ką gali pamatyti iš karto: kas juda, tas atrodo gyvas; kas stovi, tas ne. Tai nėra atsitiktinė klaida — tai nuosekli strategija, kuri laikosi kelerius metus ir nyksta lėtai. Suaugusiam akivaizdus požymis (auga, reaguoja į vandenį, kvėpuoja) vaikui nėra matomas per vieną akimirką, o judėjimas — matomas. Todėl modelis, kuris nori parodyti gyvybę, privalo parodyti **pokytį laike**, o ne judesį; ir privalo turėti bent vieną daiktą, kuris juda, bet nepakinta.
│ +
│ +## Ką rodo tyrimai
│ +
│ +**Judėjimas kaip gyvybės kriterijus.** Villarroel (2013) individualiai apklausė 118 vaikų (4–5, 5–6 ir 6–7 m. grupės; trys valstybinės mokyklos Biskajos regione) ir prašė kiekvieną nuotraukoje pavaizduotą objektą — medį, gėles, šunį, paukštį, motociklą, automobilį, debesis, saulę — priskirti gyviems ar negyviems. **6–7 m. grupėje 39,5 % teisingai priskyrė visus objektus.** Pagal kategorijas 6–7 m. grupėje: gyvūnai 100 %, transporto priemonės 86 %, augalai 79,1 %, dangaus reiškiniai (saulė, debesys) 60,5 %. 4–5 m. grupėje vaikai transporto priemonėms gyvybę priskyrė **dažniau nei būtų galima laukti atsitiktinai** (binominis testas, p < 0,05) — tai reiškia, kad judėjimas kaip kriterijus yra sistema, o ne vienkartinė klaida.
│ +
│ +**Augalas yra sunkiausias atvejis.** Tame pačiame tyrime augalai buvo antra sunkiausia kategorija po dangaus reiškinių, nors vaikai juos mato kasdien. Priežastis ta pati: augalas nejuda. Literatūroje aprašyta ir „gyvybės suteikimo“ seka — pirmiausia žmogui, paskui gyvūnams, vėliausiai augalams (Yorek ir kt., 2009, cituojama Villarroel).
│ +
│ +**Klausimo žodis pats klaidina.** Leddon, Waxman ir Medin (2009) parodė, kad kai vaikų klausiama „ar tai gyva?“ („alive“), jie augalus gyviems priskiria rečiau; pakeitus klausimą mažiau dviprasmišku variantu („ar tai gyvas padaras?“), vaikai parodo turį bendrą sąvoką, siejančią augalus su gyvūnais. Jų išvada: pats žodis „alive“ paradoksaliai užstoja sąvoką, kurią turėtų įvardyti. Villarroel šią metodinę išvadą pritaikė savo tyrime (klausė „X bizidunada?“ / „¿Es X un ser vivo?“).
│ +
│ +## Ką tai reiškia SUPRASK platformai
│ +
│ +1. **Klausiama „gyvas organizmas“, ne „gyvas“.** Tai ne stiliaus pasirinkimas: dviprasmis žodis pats sukelia dalį klaidos, kurią modelis turėtų taisyti. Programa vartoja terminą „gyvi organizmai“, tad ir modulis jo laikosi.
│ +2. **Modelis turi turėti judantį, bet nekintantį objektą.** Be jo judėjimo hipotezė lieka tekstu. Kamuoliukas, kurį vaikas pats pastumia, yra bandymas tame pačiame kadre: jis nurieda, o pokytis lieka 0.
│ +3. **Gyvybė rodoma kaip pokytis laike, o ne kaip poza.** Augalas auga arba nuleidžia lapus; akmenukas ir kamuoliukas ne. Laikas modeliuojamas vienu paspaudimu („savaitė“), be laikmačio ir be laukimo.
│ +4. **Bent vienas prieštaraujantis pavyzdys privalomas.** Jei visi trys daiktai elgtųsi taip, kaip tikisi vaikas, modelis tik patvirtintų klaidingą nuostatą (LL-28). Todėl judantis kamuoliukas ir nejudantis, bet augantis augalas yra toje pačioje scenoje.
│ +5. **Gyvybė modelyje nesibaigia mirtimi.** Augalas be vandens nuleidžia lapus ir lieka gyvas; 6–7 m. vaikui neteisinga būsena (negyvas augalas, kuris iš tikrųjų gyvas) būtų blogesnė už supaprastinimą.
│ +6. **Ribos pasakomos, o ne nutylimos.** Augalo ramybė (sėkla, medis žiemą), nematomas kvėpavimas ir dangaus reiškiniai, kurie juda ir keičia pavidalą, bet nėra organizmai, yra trys vietos, kurių modelis negali išspręsti. Jos įvardijamos mokytojo skiltyje, o ne paliekamos vaikui kaip prieštaravimas.
│ +
│ +## Ko šis įrašas nedaro
│ +
│ +Jis nepretenduoja, kad vienas modelis pakeis animistinį mąstymą: Villarroel duomenys rodo, kad net 6–7 m. grupėje daugiau nei pusė vaikų nepriskyrė visų objektų teisingai, o tai, kad klaida nyksta su amžiumi, nereiškia, kad ją pašalina viena pamoka. Imtis nedidelė (118 vaikų, vienas regionas, baskų mokymo kalba), o augalų ir dangaus reiškinių rezultatai paremti dviem nuotraukomis kiekvienai kategorijai, todėl procentai yra orientyras, ne norma. Leddon ir kt. tyrimas aiškina klausimo formuluotės poveikį, o ne mokymo metodo efektyvumą.
│ +
│ +## Susieti
│ +
│ +- [[simuliacijos-ir-modeliai]] — modelio ribos ir konkretybės nykimas
│ +- [[interaktyvumo-principai]] — spėjimas prieš veiksmą, grįžtamasis ryšys
│ +- [[../grades/01/metodai|1 klasės metodai]] — M-08 „Kas gyvas: pokytis, o ne judėjimas“
│ +- [[../curriculum/pasaulio-pazinimas-1-klase|1 klasės pasaulio pažinimas]] — 26.2.4 „Bendri gyvų organizmų požymiai“
│ +
│ +## Šaltiniai
│ +
│ +1. Villarroel, J. D. (2013). Environmental judgment in early childhood and its relationship with the understanding of the concept of living beings. *SpringerPlus, 2*, 87. https://doi.org/10.1186/2193-1801-2-87 (atvira prieiga, CC BY 2.0; imtis ir grupės — Methods; 39,5 % ir kategorijų procentai — Results, Table 6; transporto priemonės 4–5 m. grupėje — Results)
│ +2. Leddon, E. M., Waxman, S. R., & Medin, D. L. (2009). Unmasking „Alive“: Children's appreciation of a concept linking all living things. *Journal of Cognition and Development, 9*(4), 461–473. https://doi.org/10.1080/15248370802678463 · PMID 19319203 · PMCID PMC2659632
│ +3. NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, Gamtos mokslai, 1 klasės ilgalaikis planas: 26.2.4 „Bendri gyvų organizmų požymiai“ (1 val.), veiklos — „Ar vazoninė gėlė kvėpuoja?“, žaidimas „Gyvas–negyvas“ (`sources/pradinio-bp-rekomendacijos-2024.txt:17645–17648`)
│ research/wiki/foundations/README.md
│ @@ -12,6 +12,8 @@
│  | [[interaktyvumo-principai]] | UI 6–7 metų vaikams, taikiniai, grįžtamasis ryšys | ≥48 px, jokių laikmačių, klaida ne aklavietė |
│  | [[zenklas-kaip-busena]] | lygybės ženklas kaip būsena, operaciniai šablonai, modelio išdėstymas | modelis rodo abi lygybės kryptis ir bent vieną atvejį be vieno skaičiaus pusėje |
│  | [[dydis-ir-skaicius]] | dydis ir kiekis prieš užrašytą vertę, moneta kaip pavyzdys | jei daiktas neša skaičių, modelis parodo jo poveikį atskirai; grafika neprieštarauja taisyklei |
│ +| [[vienetas-ir-skaicius]] | ilgis kaip vienetų skaičius; atvirkštinis vieneto dydžio ir skaičiaus ryšys | skaičius rodomas tik su vienetu; daiktas fiksuojamas mechaniškai, keičiamas tik vienetas |
│ +| [[gyvybe-ir-judesys]] | judėjimas kaip gyvybės kriterijus; klausimo formuluotė; gyvybė kaip pokytis laike | klausiama „gyvas organizmas“; modelyje yra judantis, bet nekintantis daiktas |
│  | [[kryptis-ir-ziurovo-pozicija]] | kairė/dešinė kaip kūno, o ne kambario savybė; įsisavinimo tvarka | seka: savo kūnas → veikėjas žiūri ta pačia kryptimi → žiūri į vaiką; žymė sukasi su kūnu |
│  | [[forma-ir-spalva]] | forma kaip tapatybė, spalva kaip įspūdis; spalvos prisirišimas prie daikto | forma fiksuojama mechaniškai, keičiamas tik užpildas; grįžimas į ankstesnę spalvą kaip kontrolė |
│  | [[jausmas-ir-noras]] | jausmo priežastis yra noras, o noro nesimato; emocijų komponentai | įvykis fiksuotas, noras keičiamas; antras veikėjas kaip kontrolė; nieko neklausiama apie vaiko jausmus |
│ research/wiki/foundations/vienetas-ir-skaicius.md
│ @@ -37,7 +37,7 @@
│
│  - [[dydis-ir-skaicius]] — ta pati problema kitoje srityje: matoma savybė prieštarauja užrašytai vertei
│  - [[sujungti-dydziai]] — kodėl teisinga modelio būsena dar nėra supratimas
│ -- [[simuliacijos-ir-modeliai]] — modelio ribos ir konteksčio nykimas
│ +- [[simuliacijos-ir-modeliai]] — modelio ribos ir konteksto nykimas
│  - [[../grades/01/metodai|1 klasės metodai]] — M-07 „Ilgis: tas pats daiktas, kitas vienetas — kitas skaičius“
│
│  ## Šaltiniai
Darbas nutrūko ties failų įrašymu — bet didžioji dalis jau padaryta ir įrašyta.

**KAS PADARYTA (įrašyta į diską, patikrinta)**

1. `research/wiki/grades/01/metodai.md` — naujas skyrius **M-08 „Kas gyvas: pokytis, o ne judėjimas“** (prieš „Atviros prielaidos“). Jame: viena didelė idėja, programos pagrindas (26.2.4 „Bendri gyvų organizmų požymiai“, `sources/pradinio-bp-rekomendacijos-2024.txt:17645–17648`, bendra nuostata `:12629–12632`), 5 žingsnių seka su kiekvieno tikslu, 8 simuliacijos būsenos su `readout`/`api.note`, komponento `kas-gyvas` `config` (`assets/js/sims/pasaulis.js`, scena iš `art.js` dalių — apeitas `check_art.py` LEGACY spąstas, dėl kurio kūrėjas anksčiau turėjo perrašyti M-07), vienas kintamasis `watered`, 4 užduotys (indeksai 0/1/0/1, 4-a `optional`), modelio ribos ir tikslūs modulio laukų ilgiai.

2. **Tyrimai patikrinti realiai, ne iš atminties:** Crossref DOI 10.1186/2193-1801-2-87 (Villarroel 2013) ir 10.1080/15248370802678463 (Leddon/Waxman/Medin 2009); perskaičiau atviro Villarroel teksto rezultatus: 6–7 m. grupėje **39,5 %** teisingai priskyrė visus objektus, augalai 79,1 %, transportas 86 %, dangaus reiškiniai 60,5 %; 4–5 m. grupėje transportui gyvybė priskirta dažniau nei atsitiktinai. Leddon išvada (žodis „alive“ užstoja sąvoką) panaudota kaip reikalavimas klausti „gyvas organizmas“, ne „gyvas“.

3. `research/wiki/foundations/gyvybe-ir-judesys.md` — naujas įrašas (3 šaltiniai, „Ką tai reiškia SUPRASK platformai“ 6 punktai, „Ko šis įrašas nedaro“).

4. `research/wiki/foundations/vienetas-ir-skaicius.md` — **užtaisyta pakibusi M-07 nuoroda** (LL-36): failas, į kurį M-07 nurodė, bet kurio nebuvo, dabar yra; Carpenter & Lewis rezultatų skaičių sąmoningai necituoju, nes turėjau tik abstraktą — tai pasakyta įraše.

5. `research/wiki/foundations/README.md` — dvi indekso eilutės.

**KAS LIKO NEĮRAŠYTA (būtina kitam paleidimui)**

1. `agents/proposals/2026-11-12-metodininkas-kas-gyvas.json` — `type: "metodas"`, `run_id: 244`, `target: content/lt/grade-01/pasaulio-pazinimas/20-kas-gyvas.json`, `priority: "high"`, `status: "new"`, `evidence` (26.2.4 eilutė, abu DOI, M-08).
2. `research/wiki/guidelines/pilotai.md` — **P-019** (pirmas modelis su judančiu, bet nekintančiu kontroliniu objektu; hipotezė + matavimo kriterijus).
3. `research/wiki/changelog.md` — įrašas „2026-11-12 (08:33) — Metodas M-08 …“.
4. `research/wiki/guidelines/klausimai.md:50` — uždaryti ilgio klausimą (šaltinis `:17300–17305`, modulis `25-ilgis-ir-vienetas`, M-07).
5. `agents/log/metodininkas-2026-11-12T0833.md` — ataskaita.
6. `agents/state.json` — `roles.metodininkas` ir `last_method_work` (naujas blokas su `method: "M-08"`).
7. **Nepaleisti jokie vartai** — `validate_content.py --grade 1 --strict`, `check_language.py`, `check_lessons.py`, `check_agents.py`, `check_docs_facts.py`, `check_art.py`. Turinio failų neliečiau, tad modulių skaičiai neturėjo kisti, bet ataskaitoje tai turi būti pasakyta kaip „nepaleista“, ne „0 klaidų“.

**Pastebėjimai, kuriuos verta perimti**

- Visi 23 `ideator` temos pasiūlymai turi `status: "new"`, nors jų moduliai jau sukurti (`test -f` kiekvienam tikslui → Y). Tai ta pati `klausimai.md:44` problema; dėl jos kūrėjas gali vėl daryti jau padarytą darbą.
- Ideator paleidimas #243 buvo sustojęs prieš pat įrašant du pasiūlymus; A variantas („Kas gyvas“) buvo parengtas jo ataskaitoje (`agents/log/ideator-2026-11-12T0742.md:31–37`) — metodas jį paėmė ir išplėtė iki implementuojamo lygio, todėl temų eilė nepražuvo.
- `research/wiki/curriculum/pasaulio-pazinimas-1-klase.md:82–88` temų lentelėje trūksta 26.2.4 — tai tyrėjo failas, neliestas; pastaba įrašyta M-08 gale.
- Naujo defekto tipo neradau, todėl `pamokos.md` nepildžiau.

## klaidos

```
session_id: local-4ba6f3050f96f105055d5e7a7d9ec2921c9bd3c063705922d1d62eee051a1ecd
```
