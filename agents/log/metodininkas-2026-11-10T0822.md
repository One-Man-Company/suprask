# metodininkas — 2026-11-10T0822

- paleidimas: #216 (manual)
- trukmė: 682s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/ilgis_measure.py
│ @@ -0,0 +1,146 @@
│ +#!/usr/bin/env python3
│ +"""Mato M-07 (ilgis) vaikui rodomų tekstų ilgius. LL-21: skaičiai imami iš failo."""
│ +import json
│ +import re
│ +
│ +F = {
│ +    "title": "Ilgis: tas pats daiktas, skirtingi vienetai",
│ +    "subtitle": "Tas pats ilgis, kitas vienetas — kitas skaičius",
│ +    "concept.title": "Skaičius su vienetu",
│ +    "concept.big_idea": "Tas pats daiktas, matuojamas skirtingais vienetais, gauna skirtingus skaičius. Jo ilgis nepakinta. Skaičius pasako ilgį tik tada, kai pasakai vienetą.",
│ +    "concept.example": "Klasė matuoja suolą. Viena grupė matuoja trintukais, kita pieštukais. Skaičiai skirsis, suolas liks tas pats.",
│ +    "reflect": "Kaip paaiškintum, kodėl Jonas gavo 6, o Rūta 2?",
│ +    "teacher.goal": "Vaikas pamato, kad ilgis yra vienetų skaičius, o skaičius priklauso nuo vieneto dydžio.",
│ +    "teacher.prompt": "Paklausk: „Kodėl tas pats suolas vienam buvo 3, kitam 9?“",
│ +    "teacher.offline": "Du vaikai matuoja tą patį suolą. Vienas deda trintukus, kitas pieštukus. Abu pasako skaičių su vienetu, tada keičiasi vienetais.",
│ +}
│ +
│ +STEPS = [
│ +    "Vienetą dėk prie vieneto, be tarpų. Skaičiuok, kiek jų telpa.",
│ +    "Skaičius su vienetu pasako ilgį: 6 sąvaržėlės.",
│ +    "Didesnis vienetas telpa mažiau kartų. Mažesnis — daugiau.",
│ +    "Todėl ta pati lenta turi kelis skaičius.",
│ +]
│ +
│ +OUTCOMES = [
│ +    "Išmatuoju daiktą pasirinktu vienetu ir pasakau skaičių su vienetu.",
│ +    "Palyginu to paties daikto matavimus skirtingais vienetais.",
│ +    "Paaiškinu, kodėl mažesnis vienetas duoda didesnį skaičių.",
│ +]
│ +
│ +TASKS = [
│ +    {
│ +        "q": "Ant lentos telpa 6 sąvaržėlės arba 2 pieštukai. Kuri eilutė pasako lentos ilgį?",
│ +        "options": ["6", "2", "6 sąvaržėlės arba 2 pieštukai"],
│ +        "answer": 2,
│ +        "hint": "Skaičius vienas nieko nesako. Pažiūrėk, kuo matuota.",
│ +        "why": "Tas pats ilgis turi du skaičius, todėl skaičius rašomas su vienetu.",
│ +    },
│ +    {
│ +        "q": "Lenta yra 6 sąvaržėlės. Trintukas ilgesnis už sąvaržėlę. Kiek trintukų telpa?",
│ +        "options": ["2", "8", "4"],
│ +        "answer": 2,
│ +        "hint": "Trintukas didesnis už sąvaržėlę, tad skaičius turi būti mažesnis už 6.",
│ +        "why": "Didesnis vienetas telpa mažiau kartų, todėl trintukų yra 4.",
│ +    },
│ +    {
│ +        "q": "Močiutė matavo kilimą savo pėdomis ir gavo 8. Anūkas turi mažesnes pėdas. Kiek pėdų suskaičiuos anūkas?",
│ +        "options": ["Mažiau nei 8", "Daugiau nei 8", "Taip pat 8"],
│ +        "answer": 1,
│ +        "hint": "Mažesnė pėda telpa daugiau kartų į tą patį kilimą.",
│ +        "why": "Mažesnis vienetas telpa daugiau kartų, todėl anūkas gaus daugiau nei 8.",
│ +    },
│ +    {
│ +        "q": "Du vaikai matavo tą patį suolą. Vienas gavo 3, kitas 9. Ar taip gali būti?",
│ +        "options": [
│ +            "Ne, tas pats suolas duoda tą patį skaičių",
│ +            "Taip, jei vienas matavo trumpesniu vienetu",
│ +            "Ne, 9 yra per daug",
│ +        ],
│ +        "answer": 1,
│ +        "hint": "Skaičius priklauso nuo vieneto, ne nuo suolo.",
│ +        "why": "Tas pats suolas turi skirtingus skaičius, kai vienetai skirtingi.",
│ +    },
│ +]
│ +
│ +READOUT = [
│ +    "Kiek sąvaržėlių telpa ant lentos? Pasirink skaičių.",
│ +    "Tu sakei 8. Dabar matuok.",
│ +    "Ant lentos 3 sąvaržėlės.",
│ +    "Lenta baigėsi. 6 sąvaržėlės.",
│ +    "Trintukas ilgesnis už sąvaržėlę. Ar trintukų bus daugiau ar mažiau?",
│ +    "Lenta baigėsi. 4 trintukai.",
│ +    "Lenta baigėsi. 2 pieštukai.",
│ +    "Vėl 6 sąvaržėlės. Lenta ta pati.",
│ +    "Trys skaičiai, viena lenta.",
│ +]
│ +
│ +NOTES = [
│ … omitted 68 diff line(s) across 1 additional file(s)/section(s)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/ilgis_measure.py
│ @@ -4,9 +4,9 @@
│  import re
│
│  F = {
│ -    "title": "Ilgis: tas pats daiktas, skirtingi vienetai",
│ -    "subtitle": "Tas pats ilgis, kitas vienetas — kitas skaičius",
│ -    "concept.title": "Skaičius su vienetu",
│ +    "title": "Ilgis: tas pats daiktas, kitas skaičius",
│ +    "subtitle": "Skaičius priklauso nuo vieneto, kuriuo matuoji",
│ +    "concept.title": "Ilgis yra vienetų skaičius",
│      "concept.big_idea": "Tas pats daiktas, matuojamas skirtingais vienetais, gauna skirtingus skaičius. Jo ilgis nepakinta. Skaičius pasako ilgį tik tada, kai pasakai vienetą.",
│      "concept.example": "Klasė matuoja suolą. Viena grupė matuoja trintukais, kita pieštukais. Skaičiai skirsis, suolas liks tas pats.",
│      "reflect": "Kaip paaiškintum, kodėl Jonas gavo 6, o Rūta 2?",
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/ilgis_measure.py
│ @@ -10,7 +10,7 @@
│      "concept.big_idea": "Tas pats daiktas, matuojamas skirtingais vienetais, gauna skirtingus skaičius. Jo ilgis nepakinta. Skaičius pasako ilgį tik tada, kai pasakai vienetą.",
│      "concept.example": "Klasė matuoja suolą. Viena grupė matuoja trintukais, kita pieštukais. Skaičiai skirsis, suolas liks tas pats.",
│      "reflect": "Kaip paaiškintum, kodėl Jonas gavo 6, o Rūta 2?",
│ -    "teacher.goal": "Vaikas pamato, kad ilgis yra vienetų skaičius, o skaičius priklauso nuo vieneto dydžio.",
│ +    "teacher.goal": "Vaikas pamato, kad skaičius priklauso nuo vieneto dydžio.",
│      "teacher.prompt": "Paklausk: „Kodėl tas pats suolas vienam buvo 3, kitam 9?“",
│      "teacher.offline": "Du vaikai matuoja tą patį suolą. Vienas deda trintukus, kitas pieštukus. Abu pasako skaičių su vienetu, tada keičiasi vienetais.",
│  }
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/ilgis_measure.py
│ @@ -34,7 +34,7 @@
│          "options": ["6", "2", "6 sąvaržėlės arba 2 pieštukai"],
│          "answer": 2,
│          "hint": "Skaičius vienas nieko nesako. Pažiūrėk, kuo matuota.",
│ -        "why": "Tas pats ilgis turi du skaičius, todėl skaičius rašomas su vienetu.",
│ +        "why": "Tas pats ilgis turi du skaičius. Todėl skaičius rašomas su vienetu.",
│      },
│      {
│          "q": "Lenta yra 6 sąvaržėlės. Trintukas ilgesnis už sąvaržėlę. Kiek trintukų telpa?",
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/ilgis_measure.py
│ @@ -40,7 +40,7 @@
│          "q": "Lenta yra 6 sąvaržėlės. Trintukas ilgesnis už sąvaržėlę. Kiek trintukų telpa?",
│          "options": ["2", "8", "4"],
│          "answer": 2,
│ -        "hint": "Trintukas didesnis už sąvaržėlę, tad skaičius turi būti mažesnis už 6.",
│ +        "hint": "Trintukas didesnis už sąvaržėlę. Skaičius turi būti mažesnis už 6.",
│          "why": "Didesnis vienetas telpa mažiau kartų, todėl trintukų yra 4.",
│      },
│      {
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/ilgis_measure.py
│ @@ -48,7 +48,7 @@
│          "options": ["Mažiau nei 8", "Daugiau nei 8", "Taip pat 8"],
│          "answer": 1,
│          "hint": "Mažesnė pėda telpa daugiau kartų į tą patį kilimą.",
│ -        "why": "Mažesnis vienetas telpa daugiau kartų, todėl anūkas gaus daugiau nei 8.",
│ +        "why": "Mažesnis vienetas telpa daugiau kartų. Anūkas gaus daugiau nei 8.",
│      },
│      {
│          "q": "Du vaikai matavo tą patį suolą. Vienas gavo 3, kitas 9. Ar taip gali būti?",
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/ilgis_measure.py
│ @@ -68,7 +68,7 @@
│      "Tu sakei 8. Dabar matuok.",
│      "Ant lentos 3 sąvaržėlės.",
│      "Lenta baigėsi. 6 sąvaržėlės.",
│ -    "Trintukas ilgesnis už sąvaržėlę. Ar trintukų bus daugiau ar mažiau?",
│ +    "Trintukas ilgesnis už sąvaržėlę. Ar trintukų bus daugiau, ar mažiau?",
│      "Lenta baigėsi. 4 trintukai.",
│      "Lenta baigėsi. 2 pieštukai.",
│      "Vėl 6 sąvaržėlės. Lenta ta pati.",
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/ilgis_measure.py
│ @@ -98,7 +98,7 @@
│      "Kiek sąvaržėlių telpa ant lentos? Pasakyk, tada matuok.",
│      "Dėk toliau, kol lenta baigsis.",
│      "Lenta baigėsi. Štai kiek vienetų.",
│ -    "Naujas vienetas. Ar jo bus daugiau ar mažiau?",
│ +    "Naujas vienetas. Ar jo bus daugiau, ar mažiau?",
│      "Daugiau vienetų, tas pats ilgis.",
│      "Mažiau vienetų, tas pats ilgis.",
│      "Tas pats ilgis, kitas skaičius.",
│ research/wiki/grades/01/metodai.md
│ @@ -412,7 +412,101 @@
│
│  **Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, „Dailė“: 1–2 klasių amžiaus ypatumai (`sources/pradinio-bp-rekomendacijos-2024.txt:2622–2625`) ir 2 pavyzdys 1 klasei „Kaip susikūrė pasaulis“ (`:2714–2719`). `research/wiki/curriculum/kti-dalykai-1-klase.md` — dailės pasiekimų sritys (`:13`) ir oficialus 1 klasės ciklas (`:22`). Burkitt, E., Barrett, M., & Davis, A. (2003). Children's colour choices for completing drawings of affectively characterised topics. *Journal of Child Psychology and Psychiatry, 44*(3), 445–455. https://doi.org/10.1111/1469-7610.00134 · Zentner, M. R. (2001). Preferences for colours and colour–emotion combinations in early childhood. *Developmental Science, 4*(4), 389–398. https://doi.org/10.1111/1467-7687.00180 · Palmer, S. E., & Schloss, K. B. (2010). An ecological valence theory of human color preference. *PNAS, 107*(19), 8877–8882. https://doi.org/10.1073/pnas.0906172107
│
│ -## Atviros prielaidos
│ +### M-07 — Ilgis: tas pats daiktas, kitas vienetas — kitas skaičius
│ +
│ +**Data:** 2026-11-10 · **Tema:** `agents/proposals/2026-11-10-ideator-ilgis-ir-vienetas.json` (#10854) · **Tikslas:** `content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json` · **Šaltinis:** `research/wiki/foundations/vienetas-ir-skaičius.md`
│ +
│ +**Viena didelė idėja.** Ilgis yra vienetų skaičius. Tas pats daiktas, matuojamas skirtingais vienetais, gauna skirtingus skaičius, o jo ilgis nepakinta. Todėl skaičius pasako ilgį tik tada, kai pasakytas ir vienetas.
│ +
│ +**Kodėl modelis, o ne paveikslėlis.** Paveikslėlyje matomas vienas matavimas: lenta ir, tarkime, šešios sąvaržėlės. Iš jo vaikas negali sužinoti, kad toje pačioje lentoje telpa ir dvi pieštukų — o būtent tai ir yra sąvoka. Du paveikslai greta parodytų du skaičius, bet neįrodytų, kad lenta ta pati: vaikas neturi būdo patikrinti, ar antrame paveiksle lenta nepasikeitė. Modelis laiko lentą vienoje vietoje (jos stačiakampis įterpiamas vieną kartą ir nejuda), o vaikas keičia tik vienetą ir grįžta prie jau matyto — todėl lenta lieka ta pati mechaniškai, o ne iš teksto. Grįžimas į ankstesnį vienetą grąžina lygiai tą patį vaizdą: tai kontrolinis bandymas, kurio paveikslėlis negali duoti.
│ +
│ +**Kodėl būtent vienetas, o ne liniuotė.** Programa 1 klasei ilgiui skiria 5 pamokas ir integruotą veiklą „Kokio ilgio mano kuprinėje esantys daiktai?“, kurios tikslas — „mokytis formuluoti matematinius klausimus ir į juos atsakyti pagal gautus matavimo rezultatus“ (`sources/pradinio-bp-rekomendacijos-2024.txt:17300–17301, 17325–17326`). Bendras programos posūkis — nuo skaičiavimų prie „mato jausmo“ ir metodo „spėti ir tikrinti“ (`:1010–1014`). Standartiniai vienetai (cm, mm) ir jų sąryšiai programoje priskirti antrai klasei (`:1015–1017`), todėl modelyje jų nėra: liko sąlyginiai vienetai ir viena taisyklė. Tai ir T1.2 — viena nauja sąvoka, o ne matavimo priemonių apžvalga.
│ +
│ +**Ką rodo tyrimai.** Carpenter ir Lewis (1976), plėsdami ankstesnį Carpenter (1975) tyrimą, rašo: kai vaikai matavo lygius kiekius skirtingo dydžio vienetais, **daugiau kaip pusė** tiriamųjų tvirtino, kad didesnis vienetų skaičius reiškia didesnį kiekį — nors prieš matuodami buvo matę, kad kiekiai lygūs. Autoriai tai aiškina kaip konservavimo uždavinio atmainą: vaikas susitelkia į vieną dominuojantį matmenį (skaičių) ir nemato kompensuojančio ryšio tarp vieneto dydžio ir vienetų skaičiaus. Būtent šis ryšys ir yra modelio šerdis.
│ +
│ +Sarama, Clements, Barrett, van Dine ir McDonel (2011) patikrino ir patikslino ilgio matavimo mokymosi trajektoriją; vėlesniame tos pačios grupės darbe aprašytas trečias lygis — *Length Unit Relater and Repeater*: vaikas matuoja kartodamas vieną vienetą, supranta, kad vienetai turi būti vienodo ilgio, ir **sąsają tarp vieneto dydžio ir vienetų skaičiaus (atvirkštinį ryšį)**. Antras lygis (*End-to-End*) dar gali neatpažinti vienodų vienetų reikalingumo. 1 klasės vaikai būna abiejuose lygiuose, todėl modulis nepretenduoja „įveikti“ trajektorijos — jis duoda vieną patirtį, kurioje atvirkštinis ryšys matomas, o ne pasakomas.
│ +
│ +Hiebert (1981) parodė, kad ilgio konservavimas ir tranzityvumas reikalingi kai kuriems matavimo supratimams, bet poveikis priklauso nuo užduoties, o ne nuo bendro pasirengimo. Todėl modelis nereikalauja, kad vaikas mintyse lygintų du skirtingus daiktus: jis rodo **tą patį** daiktą du kartus, o palyginimas vyksta ekrane, ne atmintyje.
│ +
│ +**Klaidingos nuostatos ir kaip jos paneigiamos.**
│ +
│ +1. **„Daugiau vienetų reiškia ilgesnį daiktą.“** Tai pagrindinė nuostata, kurią fiksuoja Carpenter ir Lewis (1976): skaičius yra vienintelis matomas matmuo, o vieneto dydis — ne. Paneigiama modeliu: lenta nejuda, jos dešinysis galas pažymėtas ta pačia brūkšniuota linija, o prie jos parašoma 6 sąvaržėlės, paskui 4 trintukai, paskui 2 pieštukai. Trys skaičiai, vienas galas. Jei skaičius reikštų ilgį, lenta turėtų pailgėti tris kartus — to neįvyksta.
│ +2. **„Skaičius vienas pasako ilgį.“** Vaikas, paklaustas „kiek ilgio?“, atsako „6“. Paneigiama tuo, kad ta pati lenta turi ir 6, ir 2, ir 4: skaičius be vieneto negali atskirti net to paties daikto matavimų. Todėl modelis niekada nerodo nuogo skaičiaus — kiekviena eilutė yra „6 sąvaržėlės“, o įrašų juostoje trys matavimai stovi greta.
│ +3. **„Mažesnis vienetas duoda mažesnį skaičių.“** Priešinga klaida, kuri išlenda perkėlimo užduotyse (anūko pėdos). Paneigiama tvarka: sąvaržėlė (mažiausia) duoda 6, trintukas — 4, pieštukas (didžiausias) — 2. Trys žingsniai ta pačia kryptimi, todėl taisyklė matoma, o ne įsimenama.
│ +4. **„Vienetus galima maišyti.“** Modelis šios nuostatos nepaneigia, o neleidžia jai atsirasti: matuojama tik vieno rūšies vienetais, o maišymas aptariamas mokytojo veikloje. Tai pasakyta modelio ribose, o ne nutylėta.
│ +
│ +**Seka (konkretumas → modelis → simbolis → perkėlimas).**
│ +
│ +1. **Du suolai, viena lazdelė.** Mokytojas duoda dvi vienodo ilgio popieriaus juostas ir dviem vaikams — skirtingas matavimo priemones: vienam trintuką, kitam pieštuką. Abu matuoja **tą pačią** juostą ir pasako skaičių su vienetu („4 trintukai“, „2 pieštukai“). Tikslas: pajusti, kad tas pats daiktas davė skirtingus skaičius, o juostos nepakeitė. Mokytojas neklausia, kuris teisus.
│ +2. **Ekranas, pirmas matavimas.** Lenta su brūkšniuotu galu. Vaikas pirma spėja, kiek sąvaržėlių tilps (6 / 4 / 8), tada deda jas po vieną mygtuku „Dėk vieną“. Kiekviena sąvaržėlė atsiranda prie ankstesnės, be tarpų, o skaitiklis rodo „3 sąvaržėlės“. Tikslas: pamatyti, kad matavimas yra **kartojimas**, o skaičius — padėtų vienetų skaičius.
│ +3. **Ekranas, kitas vienetas.** Vaikas pasirenka trintuką. Modelis paklausia: „Trintukas ilgesnis už sąvaržėlę. Ar trintukų bus daugiau, ar mažiau?“ Vaikas paspaudžia „Daugiau“ arba „Mažiau“, tada matuoja. Tikslas: įsipareigoti spėjimui, kol modelis jo neatliko už jį, ir pamatyti, ar spėjimas pasitvirtino.
│ +4. **Simbolis.** Po trečio matavimo po lenta atsiranda įrašų juosta: „6 sąvaržėlės · 4 trintukai · 2 pieštukai — tas pats ilgis“. Vaikas perskaito ir pasako, kodėl skaičiai skiriasi. Tikslas: skaičių sieti su vienetu žodžiu, o ne vien matyti.
│ +5. **Perkėlimas.** Ta pati taisyklė be modelio: močiutės ir anūko pėdos toje pačioje kilime; du vaikai, gavę 3 ir 9 matuodami tą patį suolą; kuprinės daiktai, išmatuoti sąvaržėlėmis ir pieštukais (programos integruota veikla). Tikslas: atpažinti, kad skirtingi skaičiai gali reikšti tą patį ilgį.
│ +
│ +**Privalomas spėjimo žingsnis prieš pirmą matavimą ir prieš antrą vienetą.** Du spėjimai, abu palyginami su įvykiu (LL-15). Pirmasis — skaičius iš trijų variantų (6 / 4 / 8; teisingas variantas sąmoningai ne viduryje), ir po matavimo modelis pasako: „Tu sakei 8. Tilpo 6.“ Antrasis — kryptis („daugiau“ / „mažiau“), ir po matavimo: „Tu sakei daugiau, o gavosi mažiau: 4.“ Spėjimas niekada nėra vadinamas klaida ir niekada neištrinamas; jis tik palyginamas. Be jo modelis virsta demonstracija: vaikas spaudžia „Dėk vieną“ tol, kol lenta baigiasi, ir atvirkštinio ryšio nesudaro — tas pats pavojus kaip M-01–M-06 (`foundations/sujungti-dydziai.md`).
│ +
│ +**Simuliacijos specifikacija.** Komponentas `ilgis-ir-vienetas`, failas `assets/js/sims/matematika.js` (registracija nereikia keisti — `registry.js` jau importuoja `matematika.js`). `config`:
│ +
│ +```json
│ +{ "board": { "name": "lenta", "px": 240 },
│ +  "units": [
│ +    { "id": "savarzele", "name": "sąvaržėlė", "sg": "sąvaržėlė", "pl": "sąvaržėlės", "px": 40 },
│ +    { "id": "trintukas", "name": "trintukas", "sg": "trintukas", "pl": "trintukai", "px": 60 },
│ +    { "id": "piestukas", "name": "pieštukas", "sg": "pieštukas", "pl": "pieštukai", "px": 120 } ],
│ +  "start": "savarzele",
│ +  "firstGuess": [6, 4, 8],
│ +  "sentences": { "start": "…", "place": "…", "full": "…", "ask": "…",
│ +                 "more": "…", "less": "…", "same": "…", "back": "…", "all": "…",
│ +                 "counts": { "savarzele": ["Viena sąvaržėlė", "…"], "trintukas": ["…"], "piestukas": ["…"] } } }
│ +```
│ +
│ +Skaičius visada išvedamas, ne įrašytas: `kiekis = board.px / unit.px` (240/40 = 6, 240/60 = 4, 240/120 = 2). Jei dalyba ne sveikoji, komponentas meta klaidą į `console` ir rodo „Vienetai nesuderinti su lenta.“ — tylus apvalinimas būtų neteisingas modelis.
│ +
│ +| Būsena | Ką vaikas mato | `readout` | `api.note` |
│ +|---|---|---|---|
│ +| pradžia | tuščia lenta, brūkšniuotas galas, trys skaičiai 6 / 4 / 8, vienetų mygtukai neaktyvūs | „Kiek sąvaržėlių telpa ant lentos? Pasirink skaičių.“ | „Pirma spėk, tada matuok.“ |
│ +| spėjimas 8 | tas pats, spėjimas pažymėtas, mygtukai aktyvūs | „Tu sakei 8. Dabar matuok.“ | „Dėk sąvaržėles vieną po kitos.“ |
│ +| matuojama, k = 1–5 | k sąvaržėlių prie kairiojo galo, skaitiklis „k sąvaržėlės“ | „Ant lentos 3 sąvaržėlės.“ | „Dėk toliau, kol lenta baigsis.“ |
│ +| sąvaržėlė pilna (6) | 6 vienetai lygiai iki brūkšniuoto galo | „Lenta baigėsi. 6 sąvaržėlės.“ | „Tu sakei 8. Tilpo 6.“ |
│ +| perjungimas į trintuką | tuščia lenta, du mygtukai „Daugiau“ / „Mažiau“ | „Trintukas ilgesnis už sąvaržėlę. Ar trintukų bus daugiau, ar mažiau?“ | „Pasakyk, tada matuok.“ |
│ +| trintukas pilnas (4) | 4 vienetai iki to paties galo | „Lenta baigėsi. 4 trintukai.“ | „Tu sakei mažiau. Gavosi mažiau: 4.“ (arba „Tu sakei daugiau, o gavosi mažiau: 4.“) |
│ +| pieštukas pilnas (2) | 2 vienetai iki to paties galo | „Lenta baigėsi. 2 pieštukai.“ | „Dar mažiau. Tas pats ilgis.“ |
│ +| grįžimas į jau matuotą vienetą | ta pati būsena kaip anksčiau, taškas į tašką | „Vėl 6 sąvaržėlės. Lenta ta pati.“ | „Skaičius grįžo, lenta nepakito.“ |
│ +| visi trys išmatuoti | įrašų juosta „6 sąvaržėlės · 4 trintukai · 2 pieštukai — tas pats ilgis“ | „Trys skaičiai, viena lenta.“ | „Skaičius kitas, ilgis tas pats.“ |
│ +
│ +- **Vienas kintamasis:** `unitId` ∈ {`savarzele`, `trintukas`, `piestukas`}. Vaikas keičia tik vienetą. Lenta, jos ilgis, brūkšniuotas galas ir vienetų dydžiai yra konfigūracijoje ir vaiko nekeičiami. Spėjimas ir „Dėk vieną“ yra matavimo veiksmas, o ne antras kintamasis.
│ +- **Lentos geometrija užrakinta mechaniškai.** `art.plank(44, 148, 240, 22)` įterpiamas vieną kartą `mount()` metu; keičiant vienetą keičiasi tik vienetų sluoksnis (`<g id="iv-tokens">`), o lentos `getBBox()` prieš ir po visų trijų vienetų yra vienodas (x, y, width, height iki paskutinio skaitmens). Tai ne estetikos reikalavimas: jei lenta bent kartą persibraižo, sakinys „lenta ta pati“ tampa neteisingas.
│ +- **Skaičius niekada ne vienas.** Skaitiklis, `readout` ir įrašų juosta visada rašo skaičių su vienetu („3 sąvaržėlės“, ne „3“). Formos: 1 → `sg`, 2–6 → `pl`; funkcija `ltForm(n)` grąžina formą pagal paskutinį skaitmenį (10–20 — daugiskaitos kilmininkas, bet modelyje tokių skaičių nepasitaiko).
│ +- **Išdėstymas 360 px:** scena `viewBox="0 0 328 160"`, `width:100%`, `max-width:328px`. Lenta x 44–284 (240 px), vienetų eilutė ta pačia pradžia, aukštis 24 px; brūkšniuotas galas x = 284 nuo y = 88 iki 152. Vienetai: 40 / 60 / 120 px — 6 × 40 = 4 × 60 = 2 × 120 = 240. Vienetų juosta valdikliuose: trys mygtukai po 72 × 56 px + 2 × 8 px tarpai = 232 px iš 328 px. Jokio horizontalaus slinkimo.
│ +- **Vienetų piešinys:** kiekvienas vienetas — savo pločio žetonas (24 px aukščio) su atpažįstamu ženklu: sąvaržėlė — dviguba U formos linija, trintukas — stačiakampis su šviesia juosta viename gale, pieštukas — juosta su smailiu galu ir tamsiu švinu. Tai schematiški ženklai, ne tikro dydžio piešiniai (žr. modelio ribas), bet jie skiriasi **forma**, ne vien spalva. Scenoje nėra dangaus, žemės ar lapų, todėl `art.js` dalys nenaudojamos, išskyrus lentai skirtą `art.plank()`.
│ +- **Įėjimai:** trys vienetų mygtukai 72 × 56 px su matomu pavadinimu ir `aria-label` („Matuoti sąvaržėlėmis“), `aria-pressed`; „Dėk vieną“ 100 % × 56 px; spėjimo mygtukai 6 / 4 / 8 ir „Daugiau“ / „Mažiau“ po 96 × 56 px; „Iš naujo“ ≥ 96 × 48 px. Klaviatūra: `Tab` tarp taikinių, `Enter`/`Space` aktyvuoja, `←`/`→` perjungia vienetus, `R` atstato. Fokusas po veiksmo: į „Dėk vieną“, kai matuojama; į pirmą vienetą, kai matavimas baigtas; į pirmą spėjimo variantą, kai rodomas spėjimas (LL-32).
│ +- **Grįžtamasis ryšys** — iškart po paspaudimo (≤ 1 kadras), be perėjimo ir be garso įžangos. `readout` įvardija būseną, `api.note` — vieną sakinį apie veiksmą, niekada apie vaiką. `api.progress({ correct: true })` — vieną kartą, kai **visi trys** vienetai išmatuoti iki galo, o ne po pirmo matavimo (LL-29). „Iš naujo“ pažangos netrina (LL-16).
│ +- **Perjungimas matavimo viduryje:** pasirinkus kitą vienetą, padėtų vienetų skaičius atstatomas į 0, `api.note`: „Naujas vienetas. Matuok iš naujo.“ Tai ne klaida ir ne bauda.
│ +- **Perpildymas:** kai lenta pilna, „Dėk vieną“ tampa neaktyvus, `api.note`: „Daugiau netelpa. Lenta baigėsi.“ Jokio klaidos pranešimo.
│ +- **Garsas** — devynios nustatytos frazės (`start`, `place`, `full`, `ask`, `more`, `less`, `same`, `back`, `all`) ir dvylika skaičių frazių (`sentences.counts`: 6 + 4 + 2), visos laikomos `config.sentences`, o ne simuliacijos kode (LL-42). `walk_strings()` renka ir įdėtas `counts` reikšmes (`scripts/generate_audio.py:130–155`), todėl `check_audio.py` jas matys. `api.note` garsiai neskaitomas (mažas manifestas). Generuojant reikia abiejų variantų (`n`, `s`).
│ +- **Prieinamumas:** scenos SVG `role="img"`, `aria-label` atnaujinamas po kiekvieno veiksmo („Lenta, ant jos trys sąvaržėlės. Lentos galas pažymėtas.“) ir nekartoja `readout` žodis į žodį. `readout` turi `aria-live="polite"`. Vienetai skiriasi forma ir pavadinimu, ne vien spalva; spėjimo būsena žymima `aria-pressed`.
│ +- **Jokių laikmačių, ėjimų limito, „game over“.** Matuoti galima tiek kartų, kiek vaikas nori; grįžimas prie ankstesnio vieneto niekada nelaikomas klaida.
│ … omitted 24 diff line(s) across 1 additional file(s)/section(s)
│ research/wiki/grades/01/metodai.md
│ @@ -506,6 +506,7 @@
│
│  **Pastaba dėl wiki.** `research/wiki/curriculum/matematika-1-klase.md:141` teigia, kad 1 klasėje ilgis „dokumente nenurodytas“; metų plano eilutė `:17300` tam prieštarauja („Ilgis 5“). Metodas remiasi šaltiniu, o wiki eilutė taisytina atskirame tyrėjo darbe — šiame faile ji neliesta.
│
│ +## Atviros prielaidos
│
│
│  - _(kas šioje klasėje dar nepatikrinta; žr. [[../../guidelines/klausimai|klausimus]])_
│ research/wiki/grades/01/metodai.md
│ @@ -437,7 +437,7 @@
│
│  **Seka (konkretumas → modelis → simbolis → perkėlimas).**
│
│ -1. **Du suolai, viena lazdelė.** Mokytojas duoda dvi vienodo ilgio popieriaus juostas ir dviem vaikams — skirtingas matavimo priemones: vienam trintuką, kitam pieštuką. Abu matuoja **tą pačią** juostą ir pasako skaičių su vienetu („4 trintukai“, „2 pieštukai“). Tikslas: pajusti, kad tas pats daiktas davė skirtingus skaičius, o juostos nepakeitė. Mokytojas neklausia, kuris teisus.
│ +1. **Dvi juostos, skirtingi vienetai.** Mokytojas duoda dvi vienodo ilgio popieriaus juostas ir dviem vaikams — skirtingas matavimo priemones: vienam trintuką, kitam pieštuką. Abu matuoja **tą pačią** juostą ir pasako skaičių su vienetu („4 trintukai“, „2 pieštukai“). Tikslas: pajusti, kad tas pats daiktas davė skirtingus skaičius, o juostos nepakeitė. Mokytojas neklausia, kuris teisus.
│  2. **Ekranas, pirmas matavimas.** Lenta su brūkšniuotu galu. Vaikas pirma spėja, kiek sąvaržėlių tilps (6 / 4 / 8), tada deda jas po vieną mygtuku „Dėk vieną“. Kiekviena sąvaržėlė atsiranda prie ankstesnės, be tarpų, o skaitiklis rodo „3 sąvaržėlės“. Tikslas: pamatyti, kad matavimas yra **kartojimas**, o skaičius — padėtų vienetų skaičius.
│  3. **Ekranas, kitas vienetas.** Vaikas pasirenka trintuką. Modelis paklausia: „Trintukas ilgesnis už sąvaržėlę. Ar trintukų bus daugiau, ar mažiau?“ Vaikas paspaudžia „Daugiau“ arba „Mažiau“, tada matuoja. Tikslas: įsipareigoti spėjimui, kol modelis jo neatliko už jį, ir pamatyti, ar spėjimas pasitvirtino.
│  4. **Simbolis.** Po trečio matavimo po lenta atsiranda įrašų juosta: „6 sąvaržėlės · 4 trintukai · 2 pieštukai — tas pats ilgis“. Vaikas perskaito ir pasako, kodėl skaičiai skiriasi. Tikslas: skaičių sieti su vienetu žodžiu, o ne vien matyti.
│ research/wiki/grades/01/metodai.md
│ @@ -3,7 +3,7 @@
│  tipas: metodai
│  klase: 1
│  amzius: "6–7"
│ -atnaujinta: 2026-11-09
│ +atnaujinta: 2026-11-10
│  ---
│
│  # 1 klasės metodai
│ research/wiki/grades/01/metodai.md
│ @@ -502,7 +502,7 @@
│
│  **Ką tai reiškia modulio autoriui.** `title` — „Ilgis: tas pats daiktas, kitas skaičius“ (39 simboliai); `subtitle` — „Skaičius priklauso nuo vieneto, kuriuo matuoji“ (46); `minutes` — 9; trys `outcomes`: „Išmatuoju daiktą pasirinktu vienetu ir pasakau skaičių su vienetu.“, „Palyginu to paties daikto matavimus skirtingais vienetais.“, „Paaiškinu, kodėl mažesnis vienetas duoda didesnį skaičių.“; `concept.title` — „Ilgis yra vienetų skaičius“ (26); `concept.big_idea` — „Tas pats daiktas, matuojamas skirtingais vienetais, gauna skirtingus skaičius. Jo ilgis nepakinta. Skaičius pasako ilgį tik tada, kai pasakai vienetą.“ (150); `concept.steps` — keturi žingsniai iš sekos 2–5; `concept.example` — „Klasė matuoja suolą. Viena grupė matuoja trintukais, kita pieštukais. Skaičiai skirsis, suolas liks tas pats.“; `teacher.offline` — dvi vienodo ilgio popieriaus juostos, vienas vaikas matuoja trintuku, kitas pieštuku, abu pasako skaičių su vienetu, tada keičiasi vienetais; `teacher.misconceptions` — trys nuostatos iš šio skyriaus (1–3), o ketvirtoji („vienetus galima maišyti“) įrašoma kaip modelio riba; `sim` — `{ "component": "ilgis-ir-vienetas", "config": { … } }`. Numeris `25-` laisvas (24 jau užimtas). Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/index.json` ir `path.json` (kūrėjo ar dizainerio darbas, ne metodo dalis); siūloma vieta kelyje — po `18-taskas-tiese-spindulys-atkarpa`, nes ten jau kalbama apie atkarpą ir jos ilgį, o prieš `21-erdvines-figuros`.
│
│ -**Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, Matematikos ilgalaikis (metų) planas 1 klasei — „Ilgis 5“ ir integruota veikla „Kokio ilgio mano kuprinėje esantys daiktai?“ (`sources/pradinio-bp-rekomendacijos-2024.txt:17300–17301`, veiklos tikslas `:17325–17326`), matavimo principas `:1010–1014`, 2 klasės vienetų sąryšiai `:1015–1017`. Carpenter, T. P., & Lewis, R. (1976). The development of the concept of a standard unit of measure in young children. *Journal for Research in Mathematics Education, 7*(1), 53–58. https://doi.org/10.5951/jresematheduc.7.1.0053 · Sarama, J., Clements, D. H., Barrett, J., van Dine, D. W., & McDonel, J. S. (2011). Evaluation of a learning trajectory for length in the early years. *ZDM Mathematics Education, 43*(5), 667–680. https://doi.org/10.1007/s11858-011-0326-5 · Sarama, J., Clements, D. H., Barrett, J. E., Cullen, C. J., Hudyma, A., & Vanegas, Y. (2022). Length measurement in the early years: Teaching and learning with learning trajectories. *Mathematical Thinking and Learning, 24*(4), 267–290. https://doi.org/10.1080/10986065.2021.1896273 · Hiebert, J. (1981). Cognitive development and learning linear measurement. *Journal for Research in Mathematics Education, 12*(3), 197–211. https://doi.org/10.5951/jresematheduc.12.3.0197
│ +**Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, Matematikos ilgalaikis (metų) planas 1 klasei — „Ilgis 5“ ir integruota veikla „Kokio ilgio mano kuprinėje esantys daiktai?“ (`sources/pradinio-bp-rekomendacijos-2024.txt:17300–17301`, veiklos tikslas `:17325–17326`), matavimo principas `:1010–1014`, 2 klasės vienetų sąryšiai `:1015–1017`. Carpenter, T. P., & Lewis, R. (1976). The development of the concept of a standard unit of measure in young children. *Journal for Research in Mathematics Education, 7*(1), 53–58. https://doi.org/10.5951/jresematheduc.7.1.0053 · Sarama, J., Clements, D. H., Barrett, J., van Dine, D. W., & McDonel, J. S. (2011). Evaluation of a learning trajectory for length in the early years. *ZDM Mathematics Education, 43*(5), 667–680. https://doi.org/10.1007/s11858-011-0326-5 · Sarama, J., Clements, D. H., Barrett, J. E., Cullen, C. J., Hudyma, A., & Vanegas, Y. (2022). Length measurement in the early years: Teaching and learning with learning trajectories. *Mathematical Thinking and Learning, 24*(4), 267–290. https://doi.org/10.1080/10986065.2020.1858245 · Hiebert, J. (1981). Cognitive development and learning linear measurement. *Journal for Research in Mathematics Education, 12*(3), 197–211. https://doi.org/10.5951/jresematheduc.12.3.0197
│
│  **Pastaba dėl wiki.** `research/wiki/curriculum/matematika-1-klase.md:141` teigia, kad 1 klasėje ilgis „dokumente nenurodytas“; metų plano eilutė `:17300` tam prieštarauja („Ilgis 5“). Metodas remiasi šaltiniu, o wiki eilutė taisytina atskirame tyrėjo darbe — šiame faile ji neliesta.
│
Darbas nebaigtas — sustabdytas pasiekus įrankių kreipinių limitą. Toliau — kas realiai padaryta ir kas liko.

**Padaryta ir patikrinta**

1. Perskaityti privalomi dokumentai (`docs/SVIETIMAS-1-GAIRES.md`, `docs/KURINIO-STANDARTAS.md`, `docs/ARCHITEKTURA.md`), `agents/state.json`, vaidmens failas, atviri pasiūlymai, `research/wiki/grades/01/metodai.md` (M-01–M-06), `foundations/dydis-ir-skaicius.md`, `sujungti-dydziai.md`, `curriculum/matematika-1-klase.md`, `assets/js/sims/daile.js`, `art.js`, `generate_audio.py`, `validate_content.py`, `rebalance_answers.py`.

2. Pasirinktas pasiūlymas pagal vaidmens taisyklę: du `high` `tema` pasiūlymai (#10854 ilgis 07:48, #10853 dūmai 07:53) — imtas seniausias, #10854.

3. **Metodas M-07 įrašytas į `research/wiki/grades/01/metodai.md`** (prieš `## Atviros prielaidos`, antraštė atstatyta). Jame: viena didelė idėja (ilgis = vienetų skaičius; skaičius priklauso nuo vieneto), 5 žingsnių seka (dvi juostos → ekranas → kitas vienetas → simbolis → perkėlimas), 9 simuliacijos būsenos su `readout`/`api.note`, specifikuotas komponentas `ilgis-ir-vienetas` su `config` (lenta 240 px; vienetai 40/60/120 px → 6/4/2, dalyba tikrinama, ne apvalinama), 360 px išdėstymas, 9 + 12 garso frazių `config.sentences` (LL-42), `api.progress` tik po visų trijų matavimų (LL-29), 4 užduotys (indeksai 2,2,1,1; ketvirta `optional`) su tipine klaida ir `hint`, 4 klaidingos nuostatos, modulio laukų reikšmės ir siūloma vieta kelyje, modelio ribos.

4. **Teksto ilgiai matuoti skriptu** (`cache/scratch/ilgis_measure.py`, LL-21): pirmoji versija turėjo `title` 43 simb. (riba 42) ir tris 11 žodžių sakinius — pataisyta prieš įrašant. Galutinis matavimas: `title` 39, `subtitle` 46, visi vaikui rodomi sakiniai ≤10 žodžių, `concept.steps` ≤200 simb. — įspėjimų 0.

5. **Šaltiniai patikrinti per Crossref:** Carpenter & Lewis (1976), JRME 7(1), 53–58, DOI 10.5951/jresematheduc.7.1.0053 (abstraktas: daugiau kaip pusė vaikų didesnį vienetų skaičių laikė didesniu kiekiu); Sarama ir kt. (2011), ZDM 43(5), 667–680, DOI 10.1007/s11858-011-0326-5; Sarama ir kt. (2022), MTL 24(4), 267–290 — **DOI pirmoje versijoje buvo neteisingas (10.1080/10986065.2021.1896273), pakeistas į teisingą 10.1080/10986065.2020.1858245**; Hiebert (1981), JRME 12(3), 197–211, DOI 10.5951/jresematheduc.12.3.0197. Programos citatos patikrintos šaltinyje (`sources/...:17300–17301`, `:17325–17326`, `:1010–1017`).

6. Trajektorijos lygio aprašymas (`Length Unit Relater and Repeater` — atvirkštinis vieneto dydžio ir skaičiaus ryšys) paimtas iš atviro AERA Open straipsnio lentelės, ne iš atminties.

**Kas liko nepadaryta (darbas nutrūko)**

1. `research/wiki/foundations/vienetas-ir-skaičius.md` — naujas įrašas, į kurį M-07 jau nurodo (`**Šaltinis:**` eilutė). **Nuoroda kol kas „pakibusi“** — failo nėra. Tai pirmas dalykas, kurį reikia padaryti.
2. `research/wiki/foundations/README.md` — indekso eilutė.
3. `research/wiki/guidelines/pilotai.md` — P-019 (dvejetainė krypties prognozė prieš antrą matavimą).
4. `research/wiki/changelog.md` — įrašas.
5. `agents/proposals/2026-11-10-metodininkas-ilgis-ir-vienetas.json` — `type: "metodas"`, `target` `content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json`, `priority: "high"`, `status: "new"`, `evidence` (šaltinio eilutės + DOI + M-07).
6. `agents/log/metodininkas-2026-11-10.md` — ataskaita.
7. `agents/state.json` — `roles.metodininkas` (`last_run`, `status`, `log`) ir `last_method_work`.
8. **Nepaleisti jokie vartai** — `validate_content.py --grade 1 --strict`, `check_language.py`, `check_lessons.py`, `check_agents.py`, `check_docs_facts.py`. Modulis dar nesukurtas, tad turinio vartai nepakito, bet ataskaitoje tai turi būti pasakyta kaip „nepaleista“, ne „0 klaidų“.
9. Pasiūlymo indeksavimas į `agents/runs.db` — ankstesniame paleidime tai liko nepadaryta; tikėtina, kad ir šįkart reikės atskiro žingsnio arba bėgiklio.

**Sąmoningi sprendimai, kuriuos verta žinoti perimant darbą**

- Modelis sąmoningai nerodo centimetrų/liniuotės (2 klasės turinys) ir neleidžia maišyti vienetų — tai įrašyta kaip modelio riba, o ne nutylėta.
- Lenta padalijama be liekanos (240 px), o nesveikos dalybos atvejis komponente turi kelti klaidą, ne tylų apvalinimą.
- Skaičius ekrane niekada nerodomas vienas — visada su vienetu; tai testuojama sąlyga, ne pageidavimas.
- `curriculum/matematika-1-klase.md:141` prieštarauja metų plano eilutei `:17300`; tai įrašyta metodo pastaboje, bet pats wiki failas neliestas (ne mano vaidmens failas).
- Naujo defekto tipo neradau, todėl `pamokos.md` nepildytas.

## klaidos

```
session_id: local-c5b1ffd64c803bed78a607892a7d9451d140400c2533448158ddb204e7dd3828
```
