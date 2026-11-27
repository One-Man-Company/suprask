# kalbu-redaktorius — 2026-11-27T1541

- paleidimas: #585 (queue)
- trukmė: 7155s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

[atsarginis profilis deepseek41flash]

│ content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json
│ @@ -6,7 +6,8 @@
│    "subtitle": "Į dešinę skaičius padidėja vienu, o žemyn padidėja dešimčia",
│    "minutes": 9,
│    "outcomes": [
│ -    "Skaitau šimto lentelę. Į dešinę skaičius padidėja vienu, o žemyn padidėja dešimčia.",
│ +    "Skaitau skaičius šimto lentelėje.",
│ +    "Judu šimto lentelėje į dešinę ir žemyn.",
│      "Paaiškinu, kodėl žemiau 19 stovi 29, o ne 20."
│    ],
│    "concept": {
│ content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json
│ @@ -14,7 +14,7 @@
│      "title": "Lentelė, o ne sąrašas",
│      "big_idea": "Šimto lentelėje skaičiai sustatyti dešimtukais. Todėl skaičius žemiau yra dešimčia didesnis, o ne vienu.",
│      "steps": [
│ -      "Rask 19. Jis stovi antroje eilutėje, devintas.",
│ +      "Rask 19. Antroje eilutėje jis devintas iš kairės.",
│        "Nueik vienu langeliu žemyn ir atsidursi ties 29.",
│        "Palygink 19 ir 29. Pabaiga ta pati, o dešimtis kita.",
│        "Į dešinę nuo 19 yra 20: ten skaičius didėja vienu."
│ content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json
│ @@ -3,7 +3,7 @@
│    "grade": 1,
│    "strand": "matematika",
│    "title": "Šimto lentelė: žemyn reiškia dešimt",
│ -  "subtitle": "Į dešinę skaičius padidėja vienu, o žemyn padidėja dešimčia",
│ +  "subtitle": "Į dešinę skaičius didėja vienu, o žemyn — dešimčia",
│    "minutes": 9,
│    "outcomes": [
│      "Skaitau skaičius šimto lentelėje.",
│ content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json
│ @@ -27,7 +27,7 @@
│        "start": 19,
│        "sentences": {
│          "spek": "Kas bus vienu langeliu žemyn?",
│ -        "spejimas": "Spėjimas įrašytas. Dabar spausk Žemyn.",
│ +        "spejimas": "Spėjai. Dabar spausk Žemyn.",
│          "desinen": "Dešinėn skaičius didėja vienu.",
│          "kairen": "Kairėn skaičius mažėja vienu.",
│          "zemyn": "Žemyn skaičius didėja dešimčia.",
│ content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json
│ @@ -6,8 +6,7 @@
│    "subtitle": "Į dešinę skaičius didėja vienu, o žemyn — dešimčia",
│    "minutes": 9,
│    "outcomes": [
│ -    "Skaitau skaičius šimto lentelėje.",
│ -    "Judu šimto lentelėje į dešinę ir žemyn.",
│ +    "Skaitau skaičius šimto lentelėje. Žemyn skaičius didėja dešimčia.",
│      "Paaiškinu, kodėl žemiau 19 stovi 29, o ne 20."
│    ],
│    "concept": {
│ content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json
│ @@ -32,7 +32,7 @@
│          "zemyn": "Žemyn skaičius didėja dešimčia.",
│          "aukstyn": "Aukštyn skaičius mažėja dešimčia.",
│          "blokas": "Toliau lentelėje nieko nėra.",
│ -        "baigta": "Dešinėn keičiasi pabaiga, žemyn keičiasi dešimtis.",
│ +        "baigta": "Dešinėn keičiasi pabaiga. Žemyn keičiasi dešimtis.",
│          "is-naujo": "Pradedam iš naujo. Pirma spėk."
│        }
│      }
│ content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json
│ @@ -83,7 +83,7 @@
│        "why": "63 + 30 = 93, nes trys langeliai žemyn yra trys dešimtys."
│      },
│      {
│ -      "q": "Eik nuo 87 du žingsnius kairėn ir vieną žemyn. Kur atsidursi?",
│ +      "q": "Eik nuo 87 du langelius kairėn ir vieną žemyn. Kur atsidursi?",
│        "options": [
│          "95",
│          "85",
│ content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json
│ @@ -79,7 +79,7 @@
│          "93"
│        ],
│        "answer": 2,
│ -      "hint": "Vienas langelis žemyn reiškia dešimt. Suskaičiuok tris dešimtis.",
│ +      "hint": "Vienas langelis žemyn — dešimčia daugiau. Skaičiuok tris dešimtis.",
│        "why": "63 + 30 = 93, nes trys langeliai žemyn yra trys dešimtys."
│      },
│      {
│ content/lt/grade-01/index.json
│ @@ -209,7 +209,7 @@
│      {
│       "id": "19-simto-skaiciu-lentele",
│       "title": "Šimto lentelė: žemyn reiškia dešimt",
│ -     "subtitle": "Į dešinę skaičius padidėja vienu, o žemyn padidėja dešimčia",
│ +     "subtitle": "Į dešinę skaičius didėja vienu, o žemyn — dešimčia",
│       "file": "grade-01/matematika/19-simto-skaiciu-lentele.json",
│       "minutes": 9,
│       "sim": "simto-lentele"
│ content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json
│ @@ -3,7 +3,7 @@
│    "grade": 1,
│    "strand": "matematika",
│    "title": "Šimto lentelė: žemyn reiškia dešimt",
│ -  "subtitle": "Į dešinę skaičius didėja vienu, o žemyn — dešimčia",
│ +  "subtitle": "Į dešinę skaičius padidėja vienu, o žemyn padidėja dešimčia",
│    "minutes": 9,
│    "outcomes": [
│      "Skaitau skaičius šimto lentelėje. Žemyn skaičius didėja dešimčia.",
│ content/lt/grade-01/index.json
│ @@ -209,7 +209,7 @@
│      {
│       "id": "19-simto-skaiciu-lentele",
│       "title": "Šimto lentelė: žemyn reiškia dešimt",
│ -     "subtitle": "Į dešinę skaičius didėja vienu, o žemyn — dešimčia",
│ +     "subtitle": "Į dešinę skaičius padidėja vienu, o žemyn padidėja dešimčia",
│       "file": "grade-01/matematika/19-simto-skaiciu-lentele.json",
│       "minutes": 9,
│       "sim": "simto-lentele"
│ content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json
│ @@ -79,7 +79,7 @@
│          "93"
│        ],
│        "answer": 2,
│ -      "hint": "Vienas langelis žemyn — dešimčia daugiau. Skaičiuok tris dešimtis.",
│ +      "hint": "Vienas langelis žemyn prideda dešimt. Skaičiuok tris dešimtis.",
│        "why": "63 + 30 = 93, nes trys langeliai žemyn yra trys dešimtys."
│      },
│      {
│ scratch/probe585_shl.py
│ @@ -0,0 +1,49 @@
│ +import asyncio
│ +from playwright.async_api import async_playwright
│ +
│ +BASE = "http://127.0.0.1:8972/"
│ +URL = BASE + "#/modulis/1/matematika/19-simto-skaiciu-lentele"
│ +
│ +BLOCK = """
│ +() => {
│ +  // Brave skydai / griežtas privatumas: blokuojam localStorage, crypto, speechSynthesis
│ +  try { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); } catch (e) {}
│ +  try { delete window.crypto; } catch (e) {}
│ +  try { Object.defineProperty(window, 'speechSynthesis', { get() { return undefined; } }); } 

… PRALEISTA 25048 SIMBOLIŲ IŠ 43048 (įrankių išklotinės) — visa ataskaita: agents/work/kalbu-redaktorius/00585/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

s šimto lentelėje.",
│      "Paaiškinu, kodėl lentelėje žemiau 19 stovi 29, o ne 20."
│    ],
│    "concept": {
│ @@ -15,7 +15,7 @@
│      "steps": [
│        "Rask 19. Antroje eilutėje jis devintas iš kairės.",
│        "Nueik vienu langeliu žemyn ir atsidursi ties 29.",
│ -      "Palygink 19 ir 29. Vienetai tie patys: abu turi 9. Dešimtis kita.",
│ +      "Palygink 19 ir 29. Abu baigiasi 9, o dešimtis kita.",
│        "Į dešinę nuo 19 yra 20. Ten skaičius didėja vienu."
│      ],
│      "example": "Ant sienos kabo šimto langelių plakatas. Pirštu nueik nuo 19 žemyn ir rasi 29. Į dešinę rasi 20."
│ @@ -32,7 +32,7 @@
│          "zemyn": "Žemyn skaičius didėja dešimčia.",
│          "aukstyn": "Aukštyn skaičius mažėja dešimčia.",
│          "blokas": "Toliau lentelėje nieko nėra.",
│ -        "baigta": "Dešinėn keičiasi vienetai. Žemyn keičiasi dešimtys.",
│ +        "baigta": "Dešinėn keičiasi pabaiga. Žemyn keičiasi dešimtis.",
│          "is-naujo": "Pradedam iš naujo. Pirma spėk."
│        }
│      }
│ @@ -69,7 +69,7 @@
│        ],
│        "answer": 0,
│        "hint": "Į dešinę skaičius didėja vienu, o dešimtis lieka ta pati.",
│ -      "why": "72 + 1 = 73: vienetai pasikeičia, dešimtis lieka."
│ +      "why": "72 + 1 = 73. Pasikeičia tik pabaiga."
│      },
│      {
│        "q": "Kurį skaičių pasieksi nuo 63 trimis langeliais žemyn?",
│ content/lt/grade-01/index.json
│ @@ -208,8 +208,8 @@
│      },
│      {
│       "id": "19-simto-skaiciu-lentele",
│ -     "title": "Šimto lentelė: žemyn reiškia dešimt",
│ -     "subtitle": "Į dešinę skaičius padidėja vienu, o žemyn padidėja dešimčia",
│ +     "title": "Šimto lentelė: žemyn — dešimčia daugiau",
│ +     "subtitle": "Dešinėn skaičius didėja vienu, žemyn — dešimčia",
│       "file": "grade-01/matematika/19-simto-skaiciu-lentele.json",
│       "minutes": 9,
│       "sim": "simto-lentele"
│ assets/js/sims/matematika.js
│ @@ -3450,7 +3450,7 @@
│    zemyn: "Žemyn skaičius didėja dešimčia.",
│    aukstyn: "Aukštyn skaičius mažėja dešimčia.",
│    blokas: "Toliau lentelėje nieko nėra.",
│ -  baigta: "Dešinėn keičiasi vienetai. Žemyn keičiasi dešimtys.",
│ +  baigta: "Dešinėn keičiasi pabaiga. Žemyn keičiasi dešimtis.",
│    "is-naujo": "Pradedam iš naujo. Pirma spėk.",
│  };
│
│ agents/proposals/2026-11-27-kalbu-redaktorius-wiki-vardas-nelyginamas.json
│ @@ -0,0 +1,18 @@
│ +{
│ +  "role": "kalbu-redaktorius",
│ +  "run_id": 585,
│ +  "created": "2026-11-27T17:30:00+02:00",
│ +  "type": "struktura",
│ +  "title": "Wiki krypties lentelė lygina tik modulio pavadinimo pirmą žodį, todėl senas vardas lieka amžinai",
│ +  "body": "Pakeitus modulio `19-simto-skaiciu-lentele` pavadinimą, `content/lt/grade-01/index.json`, modulio JSON ir wiki `research/wiki/grades/01/index.md` turi sutapti, bet wiki vis dar skelbė seną vardą, o `check_docs_facts.py` sakė „Sutampa su failais“. Priežastis: `check_wiki_table()` ima `re.split(r\"[:\\s,]\", module)[0]` (t. y. „Šimto“) ir tikrina, ar tas žodis yra eilutėje; tokią pat sąlygą turi `sync_docs_facts.align_items()`, kuris sąmoningai išlaiko žmogaus parašytą tekstą. Todėl bet koks `title` pakeitimas po dvitaškio (o taip keičiama beveik visada) vartams yra nematomas, o wiki lieka antruoju, nelyginamu pavadinimo šaltiniu — būtent ten žmogus ir agentas ieško „kas jau padaryta“. Siūloma: `check_wiki_table()` papildyti antru signalu — kai įrašas surastas pagal raktą, lyginti jį su `index.json` `title` pagal `difflib` (slenkstis 0,6) ir įspėti, kai skirtumas didelis; o `sync_docs_facts.py` tokį įrašą perrašyti tikruoju pavadinimu. Neigiamas zondas: grąžinus seną vardą TIK į wiki, vartas privalo būti raudonas (šiandien rc 0).",
│ +  "target": "scripts/check_docs_facts.py",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "research/wiki/grades/01/index.md:35 — po kalbos taisymo #585 vis dar „Šimto lentelė: žemyn reiškia deimt“ (senas vardas), o content/lt/grade-01/index.json:211 — „Šimto lentelė: žemyn — dešimčia daugiau“",
│ +    "scripts/check_docs_facts.py:361-371 — `needle = re.split(r\"[:\\s,]\", module)[0]`, `if not any(needle in item.lower() ...)`",
│ +    "scripts/sync_docs_facts.py:91-101 — `align_items()` ta pati susiejimo sąlyga (`key(title) in low`), todėl sinchronizatorius seno teksto nepastebi",
│ +    "Neigiamas zondas 2026-11-27: senas vardas įrašytas TIK į wiki → `check_docs_facts.py` „0 klaidų, 0 įspėjimų · Sutampa su failais“ ir `sync_docs_facts.py` „Dokumentai jau sutampa su failais — keisti nereikia“",
│ +    "research/wiki/guidelines/pamokos.md LL-226, LL-188 — vartas, kuris lygina įvestį ir skelbia išvestį suderinta"
│ +  ]
│ +}
│ research/wiki/guidelines/kalbos-auditas.md
│ @@ -359,7 +359,7 @@
│  | `tasks[4].q` | „Eik nuo 87 du **žingsnius** kairėn ir vieną žemyn.“ | „Eik nuo 87 du **langelius** kairėn ir vieną žemyn.“ | tame pačiame sakinyje „žingsnius“ ir „langelį“ — du matai tam pačiam judesiui; modelis juda **langeliais** |
│  | `reflect` | „Pagalvok, kodėl **žemiau** 19 yra 29.“ | „Pagalvok, kodėl **lentelėje** žemiau 19 yra 29.“ | ta pati priežastis kaip `outcomes[1]`: „žemiau“ be daikto |
│
│ -**Skaičiai.** `check_language.py --grade 1`: klaidos **0 → 0**, įspėjimai **0 → 0**, pastabos **58 → 58**; modulyje **0 įrašų ir prieš, ir po** (LL-52/LL-53 šeima: vertinys, tas pats veiksmažodis du kartus, žodis be daikto — ne sakinio ilgis). Žmogaus akių radiniai: **17 → 0**. `validate_content.py` (be parametrų ir `--grade 1`): **0 klaidų, 0 įspėjimų**. `check_audio.py`: **1275 tekstų / 2550 įrašų**; 3 pakeisti tariami sakiniai (`spejimas`, `baigta`, `blokas` — pastarasis liko tas pats tekstas, tad įrašas nepakito) → 2 nauji įrašai × 2 tempus, 2 seni pašalinti (`--prune`), visi 2550 mp3 naudojami.
│ +**Skaičiai.** `check_language.py --grade 1`: klaidos **0 → 0**, įspėjimai **0 → 0**, pastabos **58 → 58**; modulyje **0 įrašų ir prieš, ir po** (LL-52/LL-53 šeima: vertinys, tas pats veiksmažodis du kartus, žodis be daikto — ne sakinio ilgis). Žmogaus akių radiniai: **17 → 0**. `validate_content.py` (be parametrų ir `--grade 1`): **0 klaidų, 0 įspėjimų**. `check_audio.py`: **1275 tekstų / 2550 įrašų**; 2 pakeisti tariami sakiniai (`spejimas`, `baigta`) → 2 nauji įrašai × 2 tempus, 2 seni pašalinti (`--prune`), visi 2550 mp3 naudojami. `blokas` sąmoningai grąžintas į seną tekstą („Toliau lentelėje nieko nėra.“ — 5 ž., vienareikšmis). Simuliacijos kodo šablone pakeistas ir neskambantis įvadinis sakinys `#shl-lead` („Judėk rodyklėmis“ → „Pirma spėk, paskui judėk“), nes iki spėjimo rodyklių mygtukai scenoje **nerodomi**, o sakinys liepė atlikti veiksmą, kurio tuo metu nėra (LL-205 šeima).
│
│  **`check_view.py` (Brave skydų imitacija, 127.0.0.1:8972, `--module 19-simto-skaiciu-lentele`), prieš = po:**
│
Darbas baigtas. Rezultatas — repo failai, visi vartai žali.

MODULIS: 19-simto-skaiciu-lentele (1 kl., matematika)

KĄ PAKEIČIAU (prieš → po)

Laukas                     | Prieš                                              | Po
---------------------------|----------------------------------------------------|----------------------------------------------
title                      | Šimto lentelė: žemyn reiškia deimt                 | Šimto lentelė: žemyn — dešimčia daugiau
subtitle                   | Į dešinę skaičius padidėja vienu, o žemyn padidėja dešimčia | Dešinėn skaičius didėja vienu, žemyn — dešimčia
outcomes[0]                | Skaitau šimto lentelę. Į dešinę … padidėja … (12 ž.) | Skaitau skaičius šimto lentelėje. (4 ž.)
outcomes[1]                | … kodėl žemiau 19 stovi 29, o ne 20.               | … kodėl lentelėje žemiau 19 stovi 29, o ne 20.
concept.big_idea           | … sustatyti dešimtukais.                           | … sustatyti eilutėmis po dešimt.
concept.steps[0]           | Rask 19. Jis stovi antroje eilutėje, devintas.     | Rask 19. Antroje eilutėje jis devintas iš kairės.
concept.steps[2]           | Palygink 19 ir 29. Pabaiga ta pati, o dešimtis kita. | Palygink 19 ir 29. Abu baigiasi 9, o dešimtis kita.
concept.steps[3]           | … yra 20: ten skaičius didėja vienu.               | … yra 20. Ten skaičius didėja vienu.
sim…spejimas               | Spėjimas įrašytas. Dabar spausk Žemyn.             | Spėjai. Dabar spausk Žemyn.
sim…baigta                 | Dešinėn keičiasi pabaiga, žemyn keičiasi dešimtis. | Dešinėn keičiasi pabaiga. Žemyn keičiasi dešimtis.
tasks[0].q                 | … nuo 19 eini … Kuris skaičius pažymėtas?          | … nuo 19 nueik … Kuris skaičius bus pažymėtas?
tasks[0].hint              | Žemyn reiškia kitą eilutę, o ne kitą skaičių iš eilės. | Žemyn — kita eilutė, o ne sekantis skaičius.
tasks[1].hint              | Skaičiuok dešimtukais, o ne po vieną.              | Skaičiuok dešimtimis, o ne po vieną.
tasks[2].why               | 72 + 1 = 73: pasikeičia tik pabaiga.               | 72 + 1 = 73. Pasikeičia tik pabaiga.
tasks[3].hint              | Vienas langelis žemyn reiškia dešimt. Suskaičiuok tris dešimtis. | Vienas langelis žemyn prideda dešimt. Skaičiuok tris dešimtis.
tasks[4].q                 | Eik nuo 87 du žingsnius kairėn ir vieną žemyn.     | Eik nuo 87 du langelius kairėn ir vieną žemyn.
reflect                    | Pagalvok, kodėl žemiau 19 yra 29.                  | Pagalvok, kodėl lentelėje žemiau 19 yra 29.
sim scenos įvadas (JS)     | Vienas langelis pažymėtas. Judėk rodyklėmis.       | Vienas langelis pažymėtas. Pirma spėk, paskui judėk.

Kodėl būtent šie: „reiškia dešimt“ — vertinys (1 klasei dešimt yra eilutė, ne reikšmė); „dešimtukais/dešimtukas“ šiame modulyje yra 10 langelių grupė, o eilutė vadinama eilute; „žemiau“ be daikto (žemiau ko?); „pabaiga“ — autoriaus žodis, vaikas skaito skaitmenis; du matai tam pačiam judesiui („žingsniai“ ir „langeliai“); sakinys prasideda įvardžiu be antecedentės; „Spėjimas įrašytas“ — neveikiamasis, nors veikėjas yra vaikas; įvadinis sakinys liepė judėti rodyklėmis, kurių iki spėjimo scenoje nėra (LL-205 šeima).

SKAIČIAI
- check_language.py --grade 1: klaidos 0 → 0, įspėjimai 0 → 0, pastabos 58 → 58. Modulyje įrankininkas rado 0 įrašų ir prieš, ir po (šie defektai — ne sakinio ilgis, o reikšmė). Žmogaus akių radiniai: 17 → 0.
- validate_content.py (be parametrų ir --grade 1): 0 klaidų, 0 įspėjimų.
- check_view.py (Brave skydų imitacija, 4 pločiai), prieš = po: overflow 0, smallCount 0, minTaskFont 21,44 / 21,44 / 19,14 / 18,96 px, tasksVisible 5/5, clipped [], simFont min 13,4 / 13,4 / 10,5 / 9,7, fatal false, problems [].
- check_audio.py: 1275 tekstų / 2550 įrašų, 2550/2550 mp3; 2 tariami sakiniai pergeneruoti, 2 našlaičiai pašalinti.
- Kiti vartai (registry, docs_facts, lessons 227, refs, art, ui, published --path-order, curriculum_backlog --check): 0.

KO SĄMONINGAI NEKEIČIAU
- concept.example — pavyzdys turi kartoti tą patį modelį (19 → 29 → 20) kaip 1 užduotis.
- concept.title „Lentelė, o ne sąrašas“ — kontrastinis, kartoja big_idea.
- tasks[0..4].why skaičių užrašai („19 + 10 = 29“) — modelio kalba, o ne proza.
- tasks[4].hint — 8 žodžiai, abi kryptys įvardytos vienu sakiniu.
- sim…spek / is-naujo / blokas — trumpi ir vienareikšmiai; blokas grąžintas į seną „Toliau lentelėje nieko nėra.“
- teacher.*, sources, svietimas1 — suaugusiojo laukai.
- Visi answer indeksai (1, 2, 0, 2, 0) ir variantų tvarka — nepaliesti nė viename.

NAUJA
- agents/proposals/2026-11-27-kalbu-redaktorius-wiki-vardas-nelyginamas.json — check_docs_facts.py wiki krypties lentelę lygina tik pirmu pavadinimo žodžiu (re.split(r"[:\s,]", module)[0]), todėl bet koks title pakeitimas po dvitaškio lieka nematomas. Įrodyta neigiamu zondų: senas vardas, įrašytas TIK į wiki, davė rc 0 ir „Sutampa su failais“; sync_docs_facts.py taip pat „keisti nereikia“. Todėl wiki reikėjo taisyti ranka.
- research/wiki/guidelines/pamokos.md — LL-227 „Wike skelbtas modulio vardas, kurio niekas nelygina su indeksu“ (227 įrašai).
- research/wiki/guidelines/kalbos-auditas.md — #585 lentelė su prieš/po ir skaičiais.

Serveris 127.0.0.1:8972 sustabdytas, scratch/ zondai pašalinti. Commit/push — bėgiklio.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-db8c63ea720c86bb74cc27de6d4e15be997e5a33f726d70d433d94b1cc8af37d
```
