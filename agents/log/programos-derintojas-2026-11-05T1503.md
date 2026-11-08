# programos-derintojas — 2026-11-05T1503

- paleidimas: #22 (manual)
- trukmė: 284s
- exit: 0 → ok
- modelis: hermes:deepseek41flash

## Ataskaita

│ research/wiki/curriculum/matematika-1-klase.md
│ @@ -90,7 +90,18 @@
│  > „**1 klasė. Sekos.** Tyrinėjamos objektų sekos iš **2–3 pasikartojančių narių grupių** (pvz. **ABAB…, AABAAB…**), mokomasi jas **atpažinti ir apibūdinti, pratęsti, rasti trūkstamus narius, sudaryti seką pagal nurodytą taisyklę, sukurti savo**.“
│  > — *9 skyrius; taip pat Matematika, Modeliai ir sąryšiai, 1–2 klasė*
│
│ -Tai **nauja tema** atnaujintoje programoje („Atnaujintoje programoje išskirta nauja tema „Dėsningumai““). 1 klasėje — tik 2–3 narių pasikartojančios grupės; sudėtingesnės sekos, skaičių sekos — 2 klasėje.
│ +Tai **nauja tema** atnaujintoje programoje („Atnaujintoje programoje išskirta nauja tema „Dėsningumai““). 1 klasėje — tik pasikartojančios grupės; sudėtingesnės sekos — vėlesnėse klasėse.
│ +
│ +> **Tikslumas (2026-11-05, programos derintojo patikra).** Du pirminio teksto liudijimai skiriasi:
│ +> 1 klasės aprašas sako „**2–3** pasikartojančių narių grupių“ (`sources/pradinio-bp-rekomendacijos-2024.txt:33563`),
│ +> o 1–2 klasių lentelė — „objektų sekas iš **2–4** pasikartojančių narių grupių“ (ten pat, `:12297`).
│ +> Saugi platformos riba — 2–3 narių grupė (siauresnė iš dviejų), 4 narių grupę galima naudoti tik kaip
│ +> mokytojo pasirinktą praplėtimą. Augančios sekos programoje įvardytos ne 1-oje, o **3–4 klasėje**
│ +> („kai kiekvieną kitą sekos objektą sudaro vis daugiau (mažiau) elementų“, `:12321–12322`), todėl
│ +> 1 klasei jos netinka. Ankstesnis šio įrašo sakinys „skaičių sekos — 2 klasėje“ pirminiame tekste
│ +> tiesiogiai nepasakytas ir lieka **[PATIKRINTI]** (2 klasės sekų aprašo rekomendacijose nėra atskirai).
│ +> Privalomas, bet platformoje dar nepanaudotas elementas — **„rasti trūkstamus narius“** (trūkstamas narys
│ +> ne sekos gale, o viduryje).
│
│  ## 4. Geometrija, orientacija, transformacijos
│
│ research/wiki/curriculum/matematika-1-klase.md
│ @@ -176,6 +176,22 @@
│  4. **Matavimas = spėjimas prieš matavimą.** Kiekviename matavimo modelyje pirmas žingsnis: „tavo nuomone, kiek?“.
│  5. **Laikas — tik pilnos valandos.** Minutės yra 2 klasės turinys.
│
│ +## 9. Modulių atitikties patikra — 2026-11-05
│ +
│ +Patikrinti visi 6 gyvi matematikos moduliai (paleidimas #22, `programos-derintojas`). Nuorodos `:N` — eilutės
│ +faile `sources/pradinio-bp-rekomendacijos-2024.txt`; modulių eilutės — failo eilutės.
│ +
│ +| Modulis | Verdiktas | Programa (`sources/…txt`) | Pastaba |
│ +|---|---|---|---|
│ +| `04-skaiciu-tiese` | **iš dalies** | „1 klasė. Skaičiai nuo 0 iki 100… Tyrinėjama, kaip sudaryta 100-o skaičių lentelė, skaičių tiesė“ (`:33739–33740`); trys sudėties/atimties atvejai (`:33520–33521`) | Tema teisinga, apimtis ne: sim `max: 20`, nė vienos užduoties su perėjimu per dešimtį (8 + 5; 16 + 7; 16 + 12) |
│ +| `05-desimtukas` | **iš dalies** | „2-oje klasėje mokiniai susipažins su vieneto sąvoka, aiškinsis, ką reiškia pusė, trečdalis…“ (`:795–800`) | Dešimtuko sandara 1 klasei tinka, bet „pusė dešimtuko“ (`concept.steps[2]`, `tasks[1]`) — 2 klasės sąvoka |
│ +| `06-figuros` | **neatitinka** | 1 kl.: „taško, tiesės, spindulio, atkarpos – vaizdavimo brėžinyje…“ (`:1030–1033`); 2 kl.: „uždara laužtė, kampas, daugiakampis, daugiakampio kampas, daugiakampio kraštinė… jis turi tiek kampų, kiek ir kraštinių“ (`:1033–1037`) | Visas modulis (kampai, kraštinės, „trikampis turi tris kampus“) — 2 klasės turinys; trūksta 1 kl. branduolio |
│ +| `07-desningumai` | **iš esmės atitinka** | 1 kl.: „objektų sekos iš 2–3 pasikartojančių narių grupių“ (`:33563`); augančios sekos — 3–4 kl. (`:12321–12322`) | `tasks[3]` (2, 4, 6, 8…) yra auganti skaičių seka, ne 1 kl. tipas; trūksta „trūkstamo nario“ viduryje |
│ +| `15-laikas` | **neatitinka apimties** | „1 klasė. Masė, laikas… laiką pilnomis valandomis (val., h), 12 val. ir 24 val. laiko sistemose“ (`:33894–33895`) | 24 val. sistema programoje privaloma 1 klasei, o modulis `svietimas1` teigia ją „sąmoningai neįtraukusią“; ideator #135 jau siūlo temą |
│ +| `16-lygybe-svarstykles` | **atitinka** | „Mokomasi lygybėse a + b = c, a – b = c nustatyti trūkstamą skaičių“ (`:33521`) | Svarstyklės — modelis tai pačiai sąvokai; visos užduotys ≤ 10, `optional` 4 + 3 = 5 + 2 neprieštarauja programai |
│ +
│ +Naujausi pasiūlymai: `agents/proposals/2026-11-05-programos-derintojas-*.json`.
│ +
│  Susiję: [[lietuviu-kalba-1-klase]] · [[pasaulio-pazinimas-1-klase]] · [[kti-dalykai-1-klase]] · [[1-klases-temų-žemėlapis]]
│
│  ## Šaltiniai
│ agents/proposals/2026-11-05-programos-derintojas-figuros-2-klase.json
│ @@ -0,0 +1,19 @@
│ +{
│ +  "role": "programos-derintojas",
│ +  "run_id": 22,
│ +  "created": "2026-11-05T15:06:30+02:00",
│ +  "type": "atitiktis",
│ +  "title": "Figūrų modulis moko 2 klasės geometrijos, o 1 klasės branduolio trūksta",
│ +  "body": "Modulis „Figūros aplink mus“ kaip rezultatą skelbia „Skiriu figūras pagal kraštines ir kampus“, o jo žingsniai moko, kad „trikampis turi tris kampus“, „keturkampis — keturis“, „kvadratas — keturkampis, kurio visos kraštinės lygios“. Programa šias sąvokas priskiria antrai klasei: „2-oje klasėje mokiniai išsiaiškins, ką reiškia tokios sąvokos, kaip uždara laužtė, kampas, daugiakampis, daugiakampio kampas, daugiakampio kraštinė“ ir „jis turi tiek kampų, kiek ir kraštinių“ (rekomendacijų 1033–1037 eilutės). Pirmai klasei programa skiria kitą branduolį: „Pažintį su plokščiomis geometrinėmis figūromis 1-oje klasėje mokiniai pradės nuo paprasčiausių figūrų – taško, tiesės, spindulio, atkarpos – vaizdavimo brėžinyje ir mokymosi apibūdinti šių figūrų padėtį viena kitos atžvilgiu“ (1030–1033). Taigi modulis ne tik peržengia į kitą klasę — jis kartu palieka neišmokytą privalomą pirmos klasės temą, kuri turi akivaizdų interaktyvumo potencialą (taško padėtis tiesėje, ar taškas priklauso spinduliui, taškas dalija tiesę į du spindulius, atkarpa kerta tiesę). Siūlau vieną iš dviejų kelių, ne abu: (a) 06 modulį performuoti į pirmos klasės geometrijos branduolį (taškas, tiesė, spindulys, atkarpa ir jų padėtis), o kampų ir daugiakampių turinį perkelti į 2 klasės planą; arba (b) modulį palikti kaip figūrų atpažinimą, bet iš `outcomes` ir `concept.steps` pašalinti kampų skaičiavimą ir kraštinių lyginimą bei uždėti žymą, kad jis perkeliamas į 2 klasę. Pirmasis kelias uždarytų ir ideator #137 spragą, todėl atskiro 18-ojo modulio tam pačiam dalykui nereikėtų.",
│ +  "target": "content/lt/grade-01/matematika/06-figuros.json",
│ +  "priority": "high",
│ +  "status": "new",
│ +  "evidence": [
│ +    "content/lt/grade-01/matematika/06-figuros.json:10 — outcomes: „Skiriu figūras pagal kraštines ir kampus“",
│ +    "content/lt/grade-01/matematika/06-figuros.json:15 — big_idea: „trikampis turi tris kampus, keturkampis — keturis“",
│ +    "content/lt/grade-01/matematika/06-figuros.json:17-19 — concept.steps: kraštinių ir kampų skaičiavimas, kvadrato apibrėžimas",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:1033-1037 — „2-oje klasėje mokiniai išsiaiškins, ką reiškia tokios sąvokos, kaip uždara laužtė, kampas, daugiakampis, daugiakampio kampas, daugiakampio kraštinė… jis turi tiek kampų, kiek ir kraštinių“",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:1030-1033 — „Pažintį su plokščiomis geometrinėmis figūromis 1-oje klasėje mokiniai pradės nuo paprasčiausių figūrų – taško, tiesės, spindulio, atkarpos“",
│ +    "docs/SVIETIMAS-1-GAIRES.md:75 — temos vartai: „Programos sąsaja“ ir „Amžiaus tinkamumas“ turi atsakyti „taip“"
│ +  ]
│ +}
│ agents/proposals/2026-11-05-programos-derintojas-puse-desimtuko.json
│ @@ -0,0 +1,18 @@
│ +{
│ +  "role": "programos-derintojas",
│ +  "run_id": 22,
│ +  "created": "2026-11-05T15:06:40+02:00",
│ +  "type": "atitiktis",
│ +  "title": "„Pusė dešimtuko“ — 2 klasės sąvoka 1 klasės modulyje",
│ +  "body": "Modulyje „Dešimtukas“ trečias žingsnis skelbia „Pusė dešimtuko — 5. Tai padeda atpažinti skaičių akimis“, o antra užduotis klausia „Kiek yra pusė dešimtuko?“. Programa dalies sąvoką priskiria antrai klasei ir tai sako tiesiogiai: „Kaip ir anksčiau, 2-oje klasėje mokiniai susipažins su vieneto sąvoka, aiškinsis, ką reiškia pusė, trečdalis, ketvirtadalis, aštuntadalis“ (rekomendacijų 795–800 eilutės). Pirmos klasės skaičių turinyje dalies nėra, o „pusė“ čia dar ir dviprasmė: dešimtuke ji reiškia dvi eiles po penkis, ne vienodo dydžio dalis. Antra problema tos pačios užduoties tipo: „Kiek yra pusė dešimtuko?“ yra apibrėžimo atsiminimas, o ne supratimo patikra naujoje situacijoje, todėl ji prieštarauja gairių T2.2. Dešimtuko sandaros branduolys (kiek pilna, kiek trūksta, du penketai) 1 klasei tinka ir yra vertingas — siūlau jį palikti, o „pusės“ formuluotę pakeisti penketų struktūra: žingsnį perrašyti kaip „Dešimtukas — dvi eilės po penkis. Penki ir penki — visada dešimt“, o antrą užduotį pakeisti į perėjimo tipo klausimą, pvz. į dvi eiles po penkis sukrauti 8 kubeliai — kiek jų antroje eilėje (atsakymas 3, o ne atsiminta „5“).",
│ +  "target": "content/lt/grade-01/matematika/05-desimtukas.json",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "content/lt/grade-01/matematika/05-desimtukas.json:19 — concept.steps[2]: „Pusė dešimtuko — 5…“",
│ +    "content/lt/grade-01/matematika/05-desimtukas.json:42-50 — tasks[1]: „Kiek yra pusė dešimtuko?“ (answer 1 = „5“)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:795-800 — „2-oje klasėje mokiniai susipažins su vieneto sąvoka, aiškinsis, ką reiškia pusė, trečdalis, ketvirtadalis, aštuntadalis“",
│ +    "research/wiki/curriculum/matematika-1-klase.md:71 — „Trupmenų — propedeutika 2 kl., sąvoka apibrėžiama 3 kl.“",
│ +    "docs/SVIETIMAS-1-GAIRES.md:37 — T2.2: savikontrolės užduotys vertina supratimą naujoje situacijoje, ne įsimintą formuluotę"
│ +  ]
│ +}
│ agents/proposals/2026-11-05-programos-derintojas-auganti-seka.json
│ @@ -0,0 +1,18 @@
│ +{
│ +  "role": "programos-derintojas",
│ +  "run_id": 22,
│ +  "created": "2026-11-05T15:06:50+02:00",
│ +  "type": "atitiktis",
│ +  "title": "Dėsningumų modulyje — auganti skaičių seka ir nėra trūkstamo nario viduryje",
│ +  "body": "Modulio „Dėsningumai“ praplėtimo užduotis yra „Seka: 2, 4, 6, 8, … Kas toliau?“ su paaiškinimu „Kiekvieną kartą pridedama po 2“. Tai auganti skaičių seka su aritmetine taisykle, o ne pirmos klasės sekos tipas: programa pirmai klasei aprašo „objektų sekas iš 2–3 pasikartojančių narių grupių (pvz. ABAB.., AABAAB…)“ (rekomendacijų 33563 eilutė), o augančias sekas, kuriose „kiekvieną kitą sekos objektą sudaro vis daugiau (mažiau) elementų“, įvardija 3–4 klasės skiltyje (12321–12322 eilutės). Be to, ši užduotis prieštarauja paties modulio rezultatui „Pastebiu pasikartojančią seką ir ją tęsiu“ — joje niekas nesikartoja, o veiksmas yra sudėtis. Antra spraga toje pačioje programos citatoje: reikalaujama mokėti „rasti trūkstamus narius“, o visos modulio sekos turi klausimą tik gale („?“ paskutinėje vietoje). Siūlau praplėtimo užduotį pakeisti perkėlimo tipo užduotimi, kuri lieka pirmos klasės ribose: ilgesnė AABAAB seka, kurioje trūksta vidurinio nario (pvz. 🔺🔺🔻 🔺▢🔻 …), ir klausti, kas turi stovėti tuščioje vietoje; tai patikrina tą pačią sąvoką naujoje situacijoje ir uždaro programos reikalavimą, kurio dabar nedengia nė viena užduotis.",
│ +  "target": "content/lt/grade-01/matematika/07-desningumai.json",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "content/lt/grade-01/matematika/07-desningumai.json:134-143 — tasks[3]: „Seka: 2, 4, 6, 8, … Kas toliau?“, why: „Kiekvieną kartą pridedama po 2“",
│ +    "content/lt/grade-01/matematika/07-desningumai.json:9 — outcomes: „Pastebiu pasikartojančią seką ir ją tęsiu“",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:33563-33564 — „1 klasė. Sekos… Tyrinėjamos objektų sekos iš 2–3 pasikartojančių narių grupių… pratęsti, rasti trūkstamus narius“",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:12321-12322 — 3–4 klasė: „kai kiekvieną kitą sekos objektą sudaro vis daugiau (mažiau) elementų“",
│ +    "research/wiki/curriculum/matematika-1-klase.md — 2026-11-05 tikslumo pastaba dėl 2–3 vs 2–4 narių grupių"
│ +  ]
│ +}
│ agents/log/programos-derintojas-2026-11-05T1500.md
│ @@ -0,0 +1,74 @@
│ +# programos-derintojas — 2026-11-05T1500
│ +
│ +- paleidimas: #22
│ +- trukmė: ~630 s
│ +- exit: 0
│ +- modelis: deepseek/deepseek-v4.1-flash
│ +- šaka: agent/kritikas-2026-11-05 (nepakeista; kitų vaidmenų failai neliesti)
│ +- patikros sritis: **1 klasė, matematika** (6 moduliai)
│ +
│ +## Ką tikrinau
│ +
│ +1. Visus 6 gyvus matematikos modulius (`content/lt/grade-01/matematika/*.json`) — `outcomes`,
│ +   `concept.steps`, `concept.big_idea`, `tasks[].q` ir `teacher.goal` — prieš pirminį programos tekstą.
│ +2. Pirminį šaltinį `sources/pradinio-bp-rekomendacijos-2024.txt`, ne wiki santrauką. Cituojamos eilutės
│ +   patikrintos `sed`/`read_file`, o ne atmintimi.
│ +3. `research/wiki/curriculum/matematika-1-klase.md` teiginius, kurie remiasi tomis pačiomis eilutėmis —
│ +   ieškota, ar wiki ko nėra pasakiusi daugiau, nei sako šaltinis.
│ +
│ +## Modulių atitiktis (su citatomis)
│ +
│ +| Modulis | Verdiktas | Pagrindas (`sources/…txt`) |
│ +|---|---|---|
│ +| `04-skaiciu-tiese` | iš dalies | Tema: „1 klasė. Skaičiai nuo 0 iki 100… 100-o skaičių lentelė, skaičių tiesė“ (`:33739–33740`). Apimtis: sim `max: 20`, užduotys tik 8+2, 15−4, 12 tarp 11 ir 13 — nė vieno iš trijų privalomų atvejų (`:33520–33521`: vienaženklis+vienaženklis per 10, dviženklis+vienaženklis per 10, dviženklis+dviženklis neper 10). |
│ +| `05-desimtukas` | iš dalies | Dešimtuko sandara atitinka. „Pusė dešimtuko“ (`:19`, `:42–50`) — 2 kl. sąvoka: „2-oje klasėje… ką reiškia pusė, trečdalis…“ (`:795–800`). |
│ +| `06-figuros` | **neatitinka** | 1 kl. branduolys — „taško, tiesės, spindulio, atkarpos – vaizdavimo brėžinyje…“ (`:1030–1033`); 2 kl. — „uždara laužtė, kampas, daugiakampis… jis turi tiek kampų, kiek ir kraštinių“ (`:1033–1037`). Modulio `outcomes[1]` „Skiriu figūras pagal kraštines ir kampus“ yra būtent 2 kl. turinys. |
│ +| `07-desningumai` | iš esmės atitinka | 1 kl.: „objektų sekos iš 2–3 pasikartojančių narių grupių… rasti trūkstamus narius“ (`:33563`). `tasks[3]` (2, 4, 6, 8…) — auganti seka, kurią programa įvardija 3–4 kl. (`:12321–12322`). |
│ +| `15-laikas` | **neatitinka apimties** | „1 klasė. Masė, laikas… 12 val. ir 24 val. laiko sistemose“ (`:33894–33895`). Modulio `svietimas1` teigia 24 val. sistemą „sąmoningai neįtraukusią“, t. y. sąmoningai praleidžiamas privalomas elementas. |
│ +| `16-lygybe-svarstykles` | atitinka | „lygybėse a + b = c, a – b = c nustatyti trūkstamą skaičių“ (`:33521`). Svarstyklės — tos pačios sąvokos modelis; visos užduotys ≤ 10. |
│ +
│ +## Pasiūlymai (3, visi `status: new`)
│ +
│ +1. `agents/proposals/2026-11-05-programos-derintojas-figuros-2-klase.json` — **high**.
│ +   06 modulis moko 2 klasės geometrijos (kampai, kraštinės, daugiakampio pavadinimas), o 1 kl. branduolio
│ +   (taškas, tiesė, spindulys, atkarpa ir jų padėtis) platformoje nėra. Siūlyti du keliai: performuoti 06 arba
│ +   perkelti jį į 2 kl. planą. Pirmasis uždarytų ir ideator #137 spragą be naujo 18-ojo modulio.
│ +2. `agents/proposals/2026-11-05-programos-derintojas-puse-desimtuko.json` — **normal**.
│ +   05 modulyje „pusė dešimtuko“ (žingsnis + 2 užduotis) yra 2 kl. sąvoka; be to, užduotis — apibrėžimo
│ +   atsiminimas (prieš gairių T2.2). Siūlyta penketų struktūra ir perkėlimo klausimas.
│ +3. `agents/proposals/2026-11-05-programos-derintojas-auganti-seka.json` — **normal**.
│ +   07 praplėtimo užduotis — auganti skaičių seka (2, 4, 6, 8), kuri prieštarauja ir modulio rezultatui, ir
│ +   1 kl. sekos tipui; vietoj jos siūlyta AABAAB seka su trūkstamu **viduriniu** nariu (programos reikalavimas,
│ +   kurio nedengia nė viena užduotis).
│ +
│ +## Wiki pataisymas
│ +
│ +`research/wiki/curriculum/matematika-1-klase.md`:
│ +
│ +- §3 — įrašyta tikslumo pastaba: 1 kl. aprašas sako „2–3“ narių grupių (`:33563`), o 1–2 kl. lentelė — „2–4“ (`:12297`).
│ +  Ankstesnis teiginys „skaičių sekos — 2 klasėje“ pirminiame tekste nepasakytas → pažymėtas **[PATIKRINTI]**.
│ +  Augančios sekos susietos su 3–4 kl. (`:12321–12322`).
│ +- Naujas §9 — 6 modulių atitikties lentelė su eilutėmis; ja gali naudotis `kurejas` ir `ideator` be pakartotinės
│ +  šaltinio paieškos.
│ +
│ +## Ką patikrinau ir kas buvo tvarkoje
│ +
│ +- `python3 scripts/validate_content.py` → **0 klaidų, 0 įspėjimų** (turinio nekeičiau — tik wiki ir pasiūlymus).
│ +- Visi trys pasiūlymų failai — validus JSON.
│ +- `15-laikas`: 12 val. sistema, pilnos valandos, rodyklių priklausomybė — atitinka programą; trūksta tik 24 val. dalies.
│ +- `16-lygybe-svarstykles`: trūkstamas dėmuo, lygybės skaitymas abiem kryptimis — atitinka `:33521`; `optional`
│ +  užduotis (4 + 3 = 5 + 2) yra perkėlimas toje pačioje klasėje, ne nauja sąvoka.
│ +
│ +## Ko nepavyko patikrinti / ko nedariau
│ +
│ +- **2 klasės programos teksto atskirai netikrinau** — rekomendacijose 2 kl. turinys pateiktas tik per 1–2 kl.
│ +  lenteles, todėl „2 kl.“ priskirimas remiasi 1 klasės aprašo priešprieša („2-oje klasėje mokiniai išsiaiškins…“),
│ +  ne atskiru 2 kl. skyriumi.
│ +- **Nesprendžiau, ar siūlyti 15 modulio 24 val. dalį** — ideator #135 (`20-laikas-12-ir-24-val.json`) jau dengia
│ +  šią temą, o gairių P1 draudžia dvi idėjas viename modulyje. Todėl radinys paliktas lentelėje, ne pasiūlymuose.
│ +- **04 modulio apimties (sim `max: 20`)** neįrašiau atskiru pasiūlymu dėl 3 įrašų limito ir to, kad tam pačiam
│ +  failui jau yra #224 (hint) — radinys fiksuotas lentelėje; jei #224 bus uždarytas, verta grįžti.
│ +- Kitų dalykų (lietuvių kalba, pasaulio pažinimas, žaidimų teorija) šiame paleidime netikrinau — vienas
│ +  paleidimas, viena sritis.
│ +- Turinio modulių, `assets/`, `docs/`, `AGENTS.md` ir kitų vaidmenų failų neliečiau. Necommitinau: šakoje jau
│ +  yra `dizaineris` ir `kritikas` necommitintų pakeitimų.
│ agents/state.json
│ @@ -62,7 +62,34 @@
│        "log": "agents/log/dizaineris-2026-11-05T1236.md",
│        "description": "Tobulina klasių struktūrą ir sąsają (desktop/tablet pirmiausia)",
│        "cadence": "antradieniais, ketvirtadieniais, šeštadieniais"
│ +    },
│ +    "programos-derintojas": {
│ +      "last_run": "2026-11-05T15:09:00",
│ +      "status": "proposed",
│ +      "log": "agents/log/programos-derintojas-2026-11-05T1500.md",
│ +      "description": "Derina turinį su oficialia programa ir amžiaus ribomis",
│ +      "cadence": "pirmadieniais, ketvirtadieniais"
│      }
│ +  },
│ +  "last_curriculum_check": {
│ +    "date": "2026-11-05",
│ +    "run_id": 22,
│ +    "scope": "1 klasė, matematika (6 moduliai)",
│ +    "source": "sources/pradinio-bp-rekomendacijos-2024.txt (cituotos eilutės: 795–800, 1030–1037, 12321–12322, 33520–33521, 33563, 33739–33740, 33894–33895)",
│ +    "verdicts": {
│ +      "atitinka": ["16-lygybe-svarstykles"],
│ +      "is_dalies": ["04-skaiciu-tiese", "05-desimtukas", "07-desningumai"],
│ +      "neatitinka": ["06-figuros", "15-laikas"]
│ +    },
│ +    "key_finding": "06-figuros moko 2 klasės geometrijos (kampai, kraštinės, daugiakampio pavadinimas), o 1 kl. branduolio (taškas, tiesė, spindulys, atkarpa) platformoje nėra; 15-laikas sąmoningai praleidžia 24 val. sistemą, kuri programoje privaloma 1 klasei",
│ +    "proposals": [
│ +      "agents/proposals/2026-11-05-programos-derintojas-figuros-2-klase.json",
│ +      "agents/proposals/2026-11-05-programos-derintojas-puse-desimtuko.json",
│ +      "agents/proposals/2026-11-05-programos-derintojas-auganti-seka.json"
│ +    ],
│ +    "wiki_updated": "research/wiki/curriculum/matematika-1-klase.md (§3 tikslumo pastaba, §9 modulių lentelė)",
│ +    "verified": "validate_content.py 0 klaidų, 0 įspėjimų; 3 pasiūlymai — validus JSON",
│ +    "notes": "2 klasės programa rekomendacijose atskirai neaprašyta — priskyrimas remiasi 1 kl. aprašo priešprieša. 04 apimtis (sim max 20) fiksuota lentelėje, ne pasiūlymu, nes tam pačiam failui jau yra #224."
│    },
│    "last_ui_work": {
│      "date": "2026-11-05",
│ agents/state.json
│ @@ -133,5 +133,5 @@
│      "log": "agents/log/tikrintojas-2026-11-03T1444.md"
│    },
│    "open_questions": "research/wiki/guidelines/klausimai.md",
│ -  "updated": "2026-11-05T14:06:08"
│ +  "updated": "2026-11-05T15:09:00"
│  }
Paleidimas #22 — patikrinta 1 klasės matematika (6 moduliai) prieš pirminį programos tekstą, ne prieš wiki santrauką.

MODULIŲ ATITIKTIS (citatos — sources/pradinio-bp-rekomendacijos-2024.txt eilutės)

  neatitinka
  06-figuros — modulis moko 2 klasės geometrijos. Jo outcomes[1] „Skiriu figūras pagal kraštines ir kampus“
    ir žingsnis „trikampis turi tris kampus“ atitinka :1033–1037 („2-oje klasėje mokiniai išsiaiškins, ką
    reiškia… uždara laužtė, kampas, daugiakampis… jis turi tiek kampų, kiek ir kraštinių“). 1 klasei programa
    skiria kitą branduolį :1030–1033 (taškas, tiesė, spindulys, atkarpa ir jų padėtis) — jo platformoje nėra.
  15-laikas — :33894–33895 reikalauja 1 kl. „12 val. ir 24 val. laiko sistemose“, o modulio svietimas1
    deklaruoja 24 val. sistemą sąmoningai neįtraukusią.

  iš dalies
  04-skaiciu-tiese — tema teisinga (:33739–33740), bet sim max: 20 ir nė vienos užduoties su perėjimu per
    dešimtį iš trijų privalomų atvejų (:33520–33521).
  05-desimtukas — „pusė dešimtuko“ (žingsnis + 2 užduotis) yra 2 kl. sąvoka (:795–800); be to, ta užduotis —
    apibrėžimo atsiminimas (prieš T2.2).
  07-desningumai — praplėtimo užduotis 2, 4, 6, 8… yra auganti seka, kurią programa įvardija 3–4 kl.
    (:12321–12322); 1 kl. — „objektų sekos iš 2–3 pasikartojančių narių grupių“ (:33563). Trūksta ir
    programos reikalaujamo „trūkstamo nario“ viduryje.

  atitinka
  16-lygybe-svarstykles — trūkstamas skaičius lygybėje (:33521), svarstyklės yra tos sąvokos modelis.

PASIŪLYMAI (3, status new)
  agents/proposals/2026-11-05-programos-derintojas-figuros-2-klase.json   high
  agents/proposals/2026-11-05-programos-derintojas-puse-desimtuko.json    normal
  agents/proposals/2026-11-05-programos-derintojas-auganti-seka.json      normal

WIKI
  research/wiki/curriculum/matematika-1-klase.md
  - §3: tikslumo pastaba — 1 kl. aprašas sako „2–3“ narių grupių (:33563), 1–2 kl. lentelė „2–4“ (:12297);
    ankstesnis teiginys „skaičių sekos — 2 klasėje“ šaltinyje nepasakytas → [PATIKRINTI].
  - naujas §9: 6 modulių atitikties lentelė su eilutėmis.

PATIKRA
  python3 scripts/validate_content.py → 0 klaidų, 0 įspėjimų. state.json ir 3 pasiūlymai — validus JSON.
  Ataskaita: agents/log/programos-derintojas-2026-11-05T1500.md (katalogas .gitignore'intas).

NEĮRAŠYTA KAIP PASIŪLYMAI
  15-laikas 24 val. dalis — ideator #135 jau dengia, o P1 draudžia dvi idėjas viename modulyje; radinys liko
  lentelėje. 04 apimtis — tam pačiam failui jau yra #224, todėl 3 įrašų limito neeikvojau.
  2 klasės programa rekomendacijose atskirai neaprašyta: priskyrimas remiasi 1 kl. aprašo priešprieša.

Turinio modulių, assets/, docs/, AGENTS.md ir kitų vaidmenų failų neliečiau; necommitinau, nes šakoje jau yra
dizainerio ir kritiko necommitintų pakeitimų.

## klaidos

```
session_id: local-16291707b15a3d555a7e4a30b6ac3e158f7714c4f61e3925bd67f438de1b676c
```
