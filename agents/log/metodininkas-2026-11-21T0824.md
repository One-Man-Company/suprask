# metodininkas — 2026-11-21T0824

- paleidimas: #419 (manual)
- trukmė: 1525s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/m419/db.py
│ @@ -0,0 +1,7 @@
│ +import sqlite3, json
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +tabs = [r[0] for r in c.execute("select name from sqlite_master where type='table'")]
│ +print(tabs)
│ +for t in tabs:
│ +    cols = [r[1] for r in c.execute(f"PRAGMA table_info({t})")]
│ +    print(t, cols)
│ profiles/deepseek41flash/cache/scratch/m419/new.py
│ @@ -0,0 +1,8 @@
│ +import sqlite3
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +print("=== NEW proposals with priority high, then oldest ===")
│ +for r in c.execute("select id, file, role, type, title, target, priority, status, created from proposals where status='new' order by case priority when 'high' then 0 when 'normal' then 1 else 2 end, created asc"):
│ +    print(r['id'], '|', r['role'], '|', r['type'], '|', r['priority'], '|', r['created'], '|', r['title'], '->', r['target'])
│ +print()
│ +print("counter per status:", list(c.execute("select status, count(*) from proposals group by status")))
│ profiles/deepseek41flash/cache/scratch/m419/q2.py
│ @@ -0,0 +1,14 @@
│ +import sqlite3
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +print("=== by type/status ===")
│ +for r in c.execute("select type, status, count(*) n from proposals group by type, status order by type, status"):
│ +    print(f"{r['type']:12} {r['status']:10} {r['n']}")
│ +print()
│ +print("=== new type=tema ===")
│ +for r in c.execute("select id, created, priority, title, target, file from proposals where status='new' and type='tema' order by created"):
│ +    print(r['id'], r['created'], r['priority'], r['title'], '->', r['target'])
│ +print()
│ +print("=== metodas proposals ever ===")
│ +for r in c.execute("select id, created, status, title, target, file from proposals where type='metodas' order by created desc limit 20"):
│ +    print(r['id'], r['created'], r['status'], r['title'], '->', r['target'])
│ profiles/deepseek41flash/cache/scratch/m419/mods.py
│ @@ -0,0 +1,7 @@
│ +import json, pathlib
│ +root = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +d = json.load(open(root/'content/lt/grade-01/index.json', encoding='utf-8'))
│ +for s in d['strands']:
│ +    print(f"== {s['id']} ({len(s['modules'])})")
│ +    for m in s['modules']:
│ +        print(f"   {m['id']:32} | {m['title']:38} | sim={m.get('sim')}")
│ profiles/deepseek41flash/cache/scratch/m419/draft.json
│ @@ -0,0 +1,106 @@
│ +{
│ +  "id": "31-dvizenkliai-neper-desimties",
│ +  "grade": 1,
│ +  "strand": "matematika",
│ +  "title": "Sudėtis be naujo dešimtuko",
│ +  "subtitle": "16 + 12: dešimtys prie dešimčių, vienetai prie vienetų",
│ +  "minutes": 9,
│ +  "outcomes": [
│ +    "Sudedu du dviženklius skaičius, kai vienetai nesudaro dešimtuko.",
│ +    "Paaiškinu, kodėl dešimčių skaičius priklauso nuo abiejų dėmenų.",
│ +    "Pasakau, kada vienetai jau sudarytų naują dešimtuką."
│ +  ],
│ +  "concept": {
│ +    "title": "Dešimtys prie dešimčių",
│ +    "big_idea": "Kai vienetų suma mažesnė už dešimt, naujas dešimtukas nesusidaro. Dešimtys susideda, o vienetai lieka vienetais.",
│ +    "steps": [
│ +      "Suskaičiuok pirmo skaičiaus strypelius ir kubelius.",
│ +      "Padėk antro skaičiaus strypelius prie strypelių.",
│ +      "Padėk jo kubelius prie kubelių. Jų lieka mažiau nei dešimt.",
│ +      "Perskaityk sumą: dvi dešimtys ir aštuoni vienetai."
│ +    ],
│ +    "example": "Klasėje 16 pieštukų. Mokytoja atneša dar 12. Dabar klasėje jų 28."
│ +  },
│ +  "sim": {
│ +    "component": "strypeliai-ir-suma",
│ +    "config": {
│ +      "first": { "tens": 1, "ones": 6 },
│ +      "second": { "tens": 1, "ones": 2 },
│ +      "labels": {
│ +        "tensPlace": "Dešimtys",
│ +        "onesPlace": "Vienetai",
│ +        "groupSecond": "Antras skaičius",
│ +        "less": "viena mažiau",
│ +        "more": "viena daugiau",
│ +        "add": "Sudėk",
│ +        "reset": "Iš naujo",
│ +        "sumWord": "Suma",
│ +        "rodsAria": "Dešimčių strypeliai, kiekvienas po dešimt kubelių",
│ +        "onesAria": "Vienetų kubeliai"
│ +      },
│ +      "sentences": {
│ +        "start": "Pasirink antrą skaičių ir pažiūrėk į krūveles.",
│ +        "guess": "Kiek dešimčių bus sumoje?",
│ +        "merged": "Dešimtys prie dešimčių. Vienetai prie vienetų.",
│ +        "count": "Vienetų mažiau nei dešimt, todėl dešimtukas nesusidaro.",
│ +        "limit": "Daugiau vienetų jau sudarytų dešimtuką.",
│ +        "again": "Pakeisk antrą skaičių ir sudėk dar kartą.",
│ +        "resetNote": "Pradedam iš naujo."
│ +      }
│ +    }
│ +  },
│ +  "tasks": [
│ +    {
│ +      "q": "Simuliacijoje 16 + 12. Kiek bus dešimčių?",
│ +      "options": ["Trys", "Dvi", "Viena"],
│ +      "answer": 1,
│ +      "hint": "Suskaičiuok strypelius abiejose krūvelėse.",
│ +      "why": "Po vieną dešimtį kiekvienoje krūvelėje — viso dvi."
│ +    },
│ +    {
│ +      "q": "Kiek yra 23 + 14?",
│ +      "options": ["27", "47", "37"],
│ +      "answer": 2,
│ +      "hint": "Skaičių 14 sudaro viena dešimtis ir keturi vienetai.",
│ +      "why": "Dvi dešimtys ir dar viena duoda tris dešimtis, todėl 37."
│ +    },
│ +    {
│ +      "q": "Ant lentynos 31 knyga. Dar 25. Kiek knygų iš viso?",
│ +      "options": ["56", "46", "66"],
│ +      "answer": 0,
│ +      "hint": "Lentynoje trys dešimtys, o kitoje krūvoje dvi.",
│ +      "why": "Trys dešimtys ir dvi duoda penkias. Vienetai susideda atskirai."
│ +    },
│ +    {
│ +      "q": "Vienas vaikas turi 3 dešimtis ir 6 vienetus. Kitas turi 2 dešimtis ir 2 vienetus. Kiek jų iš viso?",
│ +      "options": ["48", "58", "68"],
│ +      "answer": 1,
│ +      "hint": "Suskaičiuok, kiek dešimčių turi abu vaikai.",
│ … omitted 28 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/m419/probe.py
│ @@ -0,0 +1,69 @@
│ +"""Abu vartai juodraštiniam moduliui. Failas trinamas po patikros."

… PRALEISTA 12656 SIMBOLIŲ IŠ 30656 (įrankių išklotinės) — visa ataskaita: agents/work/metodininkas/00419/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

ai.“ | „Vienetų mažiau nei dešimt, todėl dešimtukas nesusidaro.“ |
│ +| spėjimas nepataikė | tas pats vaizdas, spėjimas lieka matomas | „Tu sakei: trys. Gavosi dvi.“ | „Dešimtys susideda iš dėmenų dešimčių.“ |
│ +| vienetų riba | kubelių tiek pat, `+` nepasikeičia | „Vienetų daugiau nebus.“ | „Daugiau vienetų jau sudarytų dešimtuką.“ |
│ +| trečias sudėjimas | trys sumos eilutės viena po kitos | „Trys krūvelės, viena taisyklė.“ | „Visur dešimčių tiek, kiek jų dėmenyse.“ |
│ +| „Iš naujo“ | krūvelės atstatytos, sumos eilutė tuščia | „Pradedam iš naujo.“ | „Pakeisk antrą skaičių ir sudėk dar kartą.“ |
│ +
│ +Septynios savybės, kurių negalima praleisti:
│ +
│ +- **Vienas kintamasis:** `second` (antras dėmuo). Pirmas dėmuo nepajudinamas — jis yra kontrolinis atvejis, kaip lenta M-07 ir puodelis M-12 prototipe (kieta vandens forma). Vaikas keičia vieną dėmenį, todėl pasekmę gali priskirti būtent jam.
│ +- **Geometrija 360 px:** scena `container-type:inline-size`, `--u: clamp(14px, 3.8cqw, 24px)` (ta pati formulė kaip `skaicius-ir-skaitmuo`, `matematika.js:3991–3995`). Strypas — 10 segmentų juosta `var(--u)` pločio ir `calc(var(--u) * 4.2)` aukščio; kubeliai — `repeat(3, var(--u))` tinklelis. Prie 360 px `--u = 14 px`: keturi strypai ir trys kubeliai telpa į 250 px, abi krūvelės ir sumos eilutė — į 328 px su tarpais. Jokio horizontalaus slinkimo; 200 % tekste `cqw` laiko tuos pačius matmenis, didėja tik užrašai (`min-width:0` ant tėvų, LL-125).
│ +- **Įėjimai ir klaviatūra:** `Tab` tarp valdiklių, `Enter`/`Space` aktyvuoja, `←`/`→` keičia pasirinktą skaitmenį, `R` atstato. Taikiniai: dešimčių ±, vienetų ±, spėjimo trys mygtukai ir „Sudėk“ — visi ≥ 48 px.
│ +- **Fokusas** (LL-32): po sudėjimo fokusas lieka „Sudėk“ ir `readout` pasikeičia; po „Iš naujo“ — į pirmą vienetų valdiklį, o ne į paslėptą elementą; atsiradus spėjimo mygtukams — į pirmą iš jų.
│ +- **Grįžtamasis ryšys** — `readout` po sudėjimo, `api.note` sako **kodėl**, niekada „teisingai“ ir niekada apie vaiką (T5.1). `api.progress({ correct: true })` — vieną kartą, po trečio sudėjimo (ne po pirmo, LL-29), ir tikrinama dabartinė būsena, ne istorija (LL-17). „Iš naujo“ pažangos netrina (LL-16).
│ +- **Garsas:** tariamos tik instrukcijos (`config.sentences`, 7 frazės × 2 įrašai = 14 naujų mp3). Sumos skaičius **netariamas** — jis keičiasi kiekvieną sudėjimą (LL-14); jį perskaito `api.readout` ekrane.
│ +- **Be laikmačių, be ėjimų limito, be „game over“.** Sudėti galima tiek kartų, kiek vaikas nori.
│ +
│ +**Užduotys.**
│ +
│ +| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
│ +|---|---|---|---|---|---|
│ +| 1 | atpažinimas | „Simuliacijoje 16 + 12. Kiek bus dešimčių?“ — Trys / Dvi / Viena | Dvi (1) | „Trys“ — pernešimo overgeneralizacija iš `22` | „Suskaičiuok strypelius abiejose krūvelėse.“ |
│ +| 2 | taikymas | „Kiek yra 23 + 14?“ — 27 / 47 / 37 | 37 (2) | 27 — sudėjo vienetus ir vieną dešimtį | „Skaičių 14 sudaro viena dešimtis ir keturi vienetai.“ |
│ … omitted 26 diff line(s) across 1 additional file(s)/section(s)
│ research/wiki/grades/01/metodai.md
│ @@ -1040,7 +1040,7 @@
│
│  Septynios savybės, kurių negalima praleisti:
│
│ -- **Vienas kintamasis:** `second` (antras dėmuo). Pirmas dėmuo nepajudinamas — jis yra kontrolinis atvejis, kaip lenta M-07 ir puodelis M-12 prototipe (kieta vandens forma). Vaikas keičia vieną dėmenį, todėl pasekmę gali priskirti būtent jam.
│ +- **Vienas kintamasis:** `second` (antras dėmuo). Pirmas dėmuo nepajudinamas — jis yra kontrolinis atvejis, kaip lenta M-07 (įterpiama vieną kartą) ir puodelis su žyma vandens formos metode. Vaikas keičia vieną dėmenį, todėl pasekmę gali priskirti būtent jam.
│  - **Geometrija 360 px:** scena `container-type:inline-size`, `--u: clamp(14px, 3.8cqw, 24px)` (ta pati formulė kaip `skaicius-ir-skaitmuo`, `matematika.js:3991–3995`). Strypas — 10 segmentų juosta `var(--u)` pločio ir `calc(var(--u) * 4.2)` aukščio; kubeliai — `repeat(3, var(--u))` tinklelis. Prie 360 px `--u = 14 px`: keturi strypai ir trys kubeliai telpa į 250 px, abi krūvelės ir sumos eilutė — į 328 px su tarpais. Jokio horizontalaus slinkimo; 200 % tekste `cqw` laiko tuos pačius matmenis, didėja tik užrašai (`min-width:0` ant tėvų, LL-125).
│  - **Įėjimai ir klaviatūra:** `Tab` tarp valdiklių, `Enter`/`Space` aktyvuoja, `←`/`→` keičia pasirinktą skaitmenį, `R` atstato. Taikiniai: dešimčių ±, vienetų ±, spėjimo trys mygtukai ir „Sudėk“ — visi ≥ 48 px.
│  - **Fokusas** (LL-32): po sudėjimo fokusas lieka „Sudėk“ ir `readout` pasikeičia; po „Iš naujo“ — į pirmą vienetų valdiklį, o ne į paslėptą elementą; atsiradus spėjimo mygtukams — į pirmą iš jų.
│ research/wiki/grades/01/metodai.md
│ @@ -1069,9 +1069,9 @@
│  4. **Suma niekada neviršija 100.** Pirmas dėmuo 16, antras iki 43, todėl sumos iki 59; 1 klasės programa leidžia iki 100, bet modelis sąmoningai nesiekia ribos — šimto lentelė yra `19-simto-skaiciu-lentele`.
│  5. **Spalva nėra informacijos nešėja.** Strypai ir kubeliai skiriasi forma ir padėtimi, ne spalva (T5.5); spėjimas ir sumos eilutės sunumeruotos.
│
│ -**Ką tai reiškia modulio autoriui.** `id` — `31-dvizenkliai-neper-desimties` (numeris 31 matematikoje laisvas, užimti 04–07 ir 14–30); `title` — „Sudėtis be naujo dešimtuko“ (26 simboliai iš 42); `subtitle` — „16 + 12: dešimtys prie dešimčių, vienetai prie vienetų“ (52 iš 80); `minutes` — 9; trys `outcomes`; `concept.title` — „Dešimtys prie dešimčių“ (20 iš 40); `concept.big_idea` — 131 simbolis; `concept.steps` — keturi žingsniai; `concept.example` — 16 pieštukų klasėje. Įrašius modulį jis turi patekti į `content/lt/grade-01/index.json` (matematikos kryptis, po `30-skaiciavimas-atgal-per-desimti`) ir į `path.json` — **po `22-sudetis-per-desimti`**, nes ten vaikas jau moka papildyti iki dešimtuko, o čia pamato, kad jo papildyti nereikia. Failo numeris ir eilė kelyje neprivalo sutapti (`path.json` tvarką gali keisti dizaineris).
│ -
│ -**Patikra.** Metodo specifikacija surašyta kaip juodraštinis modulis scratch kataloge (ne `content/`) ir paleisti abu vartai — `validate_content.check_module` ir `check_language.check_module`. Rezultatas įrašytas šio darbo ataskaitoje; `content/` neliestas.
│ +**Ką tai reiškia modulio autoriui.** `id` — `31-dvizenkliai-neper-desimties` (numeris 31 matematikoje laisvas, užimti 04–07 ir 14–30); `title` — „Sudėtis be naujo dešimtuko“ (26 simboliai iš 42); `subtitle` — „16 + 12: dešimtys prie dešimčių, vienetai prie vienetų“ (54 iš 80); `minutes` — 9; trys `outcomes` (8/8/7 žodžių); `concept.title` — „Dešimtys prie dešimčių“ (22 iš 40); `concept.big_idea` — 112 simbolių (9 + 6 žodžių sakiniai); `concept.steps` — keturi žingsniai (6/6/10/7 žodžių, 51/48/59/50 simbolių); `concept.example` — 16 pieštukų klasėje (11 žodžių). Įrašius modulį jis turi patekti į `content/lt/grade-01/index.json` (matematikos kryptis, po `30-skaiciavimas-atgal-per-desimti`) ir į `path.json` — **po `22-sudetis-per-desimti`**, nes ten vaikas jau moka papildyti iki dešimtuko, o čia pamato, kad jo papildyti nereikia. Failo numeris ir eilė kelyje neprivalo sutapti (`path.json` tvarką gali keisti dizaineris).
│ +
│ +**Patikra tikru įrankiu (2026-11-21).** Metodo specifikacija surašyta kaip juodraštinis modulis scratch kataloge (ne `content/`, todėl `git status` švarus) ir paleisti abu vartai su tuo pačiu keliu, kuriuo tikrina CI: `validate_content.check_module` → **0 klaidų, 1 įspėjimas** („nepavyko perskaityti simuliacijos „strypeliai-ir-suma“ kūno — sim.config gyvumas nepatikrintas“ — sąžininga, kol komponento nėra registre), `check_language.check_module` → **0 klaidų, 0 įspėjimų, 0 pastabų**. Aritmetika perskaičiuota skriptu, ne mintyse: 16 + 12 = 28 (dvi dešimtys), 23 + 14 = 37, 31 + 25 = 56, 36 + 22 = 58; atsakymų indeksai 1 / 2 / 0 / 1. Ilgiai matuoti skriptu (`len()` simboliams, `validate_content.word_count` žodžiams), ne akimis. Juodraštis po patikros pašalintas (`finally`), failo `content/` kataloge neliko.
│
│  **Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, matematika — trys 1 klasės sudėties ir atimties atvejai (`sources/pradinio-bp-rekomendacijos-2024.txt:33520–33521`), pasiekimas A1 (`:692–699`). Fuson, K. C. (1990). Conceptual structures for multiunit numbers: Implications for learning and teaching multidigit addition, subtraction, and place value. *Cognition and Instruction, 7*(4), 343–403. https://doi.org/10.1207/s1532690xci0704_4 · Fuson, K. C., & Briars, D. J. (1990). Using a base-ten blocks learning/teaching approach for first- and second-grade place-value and multidigit addition and subtraction. *Journal for Research in Mathematics Education, 21*(3), 180–206. https://doi.org/10.5951/jresematheduc.21.3.0180 · Hiebert, J., & Wearne, D. (1996). Instruction, understanding, and skill in multidigit addition and subtraction. *Cognition and Instruction, 14*(3), 251–283. https://doi.org/10.1207/s1532690xci1403_1 · Fuson, K. C. (1990). A forum for researchers: Issues in place-value and multidigit addition and subtraction learning and teaching. *Journal for Research in Mathematics Education, 21*(4), 273–280. https://doi.org/10.5951/jresematheduc.21.4.0273
│
Paleidimas #419 baigtas. Įrašytas vienas failas, turintis tikrąjį rezultatą.

**Ką įrašiau**

`research/wiki/grades/01/metodai.md` — naujas skyrius **M-12 — Dviženklis ir dviženklis: dešimtys prie dešimčių, vienetai prie vienetų** (98 eilutės, +2 eilutės pataisytos).

Metodas dengia programos trečią 1 klasės sudėties atvejį, kurio platformoje nėra: `sources/pradinio-bp-rekomendacijos-2024.txt:33520–33521` („dviženklių skaičių neperžengiant dešimties“) ir pasiekimas A1 (`:692–699`). `22-sudetis-per-desimti` moko per dešimtį, `29` — atimties per dešimtį, `27` — skaitmens vietos, `30` — skaičiavimo atgal. Paieška `content/lt/grade-01` rado `16 + 12` / `neperžengiant` tik `sources` citatose, ne užduotyje.

**M-12 turinys**
- 5 žingsnių seka: ryšulėliai → ekranas su vienu kintamuoju → sudėjimas su paaiškinimu → trys dėmenys → perkėlimas į simbolį.
- Simuliacijos specifikacija: `strypeliai-ir-sumа` (`matematika.js` — LEGACY failas, todėl `check_art.py` neliečiamas), 7 būsenų lentelė su `readout`/`api.note`, geometrija 360 px per `cqw`, fokaso taisyklės, `api.progress` tik po trečio sudėjimo (LL-29/LL-17).
- 4 užduotys su tipinėmis klaidomis (indeksai 1/2/0/1), 4 klaidingos nuostatos su paneigimo mechanizmu, 5 modelio ribos.
- 4 šaltiniai su DOI (Fuson 1990 ×2, Fuson & Briars 1990, Hiebert & Wearne 1996) — visi patvirtinti Crossref metaduomenų, tekstų neskaičiau, todėl necitavau rezultatų skaičių.

**Patikra tikru įrankiu.** Juodraštinis modulis (scratch, `content/` neliestas, `finally` pašalintas) praėjo abu vartus: `validate_content.check_module` → **0 klaidų, 1 įspėjimas** (sąžiningas: komponento dar nėra registre, tad `sim.config` gyvumo patikrinti negalima), `check_language.check_module` → **0 klaidų, 0 įspėjimų, 0 pastabų**. Aritmetika ir ilgiai perskaičiuoti skriptu: 16+12=28, 23+14=37, 31+25=56, 36+22=58; title 26/42, subtitle 54/80, big_idea 112/240.

**Ką sąmoningai susiaurinau.** Ideatorius (#418) siūlė bendrą „dviženklių sudėtį“; metodas laiko pirmą dėmenį nepajudinamą ir vienetų sumą po devyniais, nes pernešimas yra vyresnės klasės sąvoka (LL-23), o du dalykai viename modulyje pažeistų T1.2.

**Ko nepadariau:** `agents/proposals/2026-11-21-metodininkas-dvizenkliai-neper-desimties.json` (metodas tipo pasiūlymas), `research/wiki/foundations/` papildymas apie vietos vertę, `agents/state.json` `last_methodologist_work` blokas, `pilotai.md` P-022 įrašas, ataskaita `agents/log/`. Šių failų rašymas liko neįvykdytas dėl pasibaigusio žingsnių biudžeto — pats metodas repo yra, o juodraštis ir zondas diske: `/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/m419/draft.json` ir `probe.py` (pakartojama abiejų vartų patikra).

Naujų pamokų (`pamokos.md`) nepridėjau — įrodyto naujo defekto tipo nebuvo; visi sprendimai vadovavosi esamomis LL-04, LL-14, LL-15, LL-16, LL-17, LL-23, LL-29, LL-32, LL-125.

## klaidos

```
session_id: local-be2bcd237610365b572317324ffe2e96f8148386792ca08d69e268f4aa1fad8b
```
