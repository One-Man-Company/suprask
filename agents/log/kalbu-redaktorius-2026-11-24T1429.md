# kalbu-redaktorius — 2026-11-24T1429

- paleidimas: #512 (queue)
- trukmė: 1634s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

[atsarginis profilis deepseek41flash]

│ content/lt/grade-01/matematika/22-sudetis-per-desimti.json
│ @@ -7,18 +7,18 @@
│    "minutes": 9,
│    "outcomes": [
│      "Sudedu du skaičius per dešimtį. Pirma papildau dešimtuką, paskui pridedu likusį.",
│ -    "Paaiškinu, kodėl 8 + 5 patogu skaičiuoti per dešimtį."
│ +    "Paaiškinu, kodėl 8 + 5 skaičiuoju per dešimtį."
│    ],
│    "concept": {
│      "title": "Kelias per dešimtį",
│ -    "big_idea": "Kai suma didesnė už dešimt, nereikia skaičiuoti po vieną. Pirma paimk tiek, kiek trūksta iki dešimties. Paskui pridėk, kas liko.",
│ +    "big_idea": "Kai suma didesnė už dešimt, nereikia skaičiuoti po vieną. Pirma paimk tiek dėmių, kiek trūksta iki dešimties. Paskui pridėk, kas liko.",
│      "steps": [
│ -      "Pirmas skaičius jau dešimtuke. Suskaičiuok tuščius langelius.",
│ -      "Iš antro skaičiaus paimk tiek dėmių, kiek trūksta. Dešimtukas prisipildo — tai dešimt.",
│ +      "Dešimtukas turi dešimt langelių. Pirmas skaičius jau jame. Suskaičiuok tuščius langelius.",
│ +      "Iš antro skaičiaus paimk tiek dėmių, kiek trūksta. Pilnas dešimtukas yra dešimt.",
│        "Prie dešimties pridėk dėmes, kurios liko ant stalo.",
│ -      "Pabandyk ir su kitais skaičiais: 7 + 5, 9 + 6. Kaskart trūksta kito skaičiaus."
│ +      "Pabandyk ir su kitais skaičiais: 7 + 5, 9 + 6. Kartais trūksta trijų dėmių, kartais vienos."
│      ],
│ -    "example": "Krepšyje 8 obuoliai. Draugas atneša dar 5. Paimk 2 obuolius ir įdėk į krepšį — bus dešimt. Liko 3 obuoliai. Viso 13."
│ +    "example": "Krepšyje 8 obuoliai. Draugas atneša dar 5. Iš tų penkių įdėk 2 obuolius į krepšį. Krepšyje bus dešimt obuolių. Liko 3 obuoliai. Viso 13 obuolių."
│    },
│    "sim": {
│      "component": "sudetis-per-desimti",
│ @@ -43,7 +43,7 @@
│    },
│    "tasks": [
│      {
│ -      "q": "Dešimtuke yra 8 dėmės. Kiek dėmių trūksta iki dešimties?",
│ +      "q": "Dešimtuke jau yra 8 dėmės. Kiek dėmių trūksta iki dešimties?",
│        "options": [
│          "2",
│          "3",
│ @@ -51,21 +51,21 @@
│        ],
│        "answer": 0,
│        "hint": "Suskaičiuok tuščius langelius dešimtuke.",
│ -      "why": "8 + 2 = 10, todėl dešimtukui trūksta dviejų dėmių."
│ +      "why": "8 + 2 = 10, todėl dar trūksta dviejų dėmių."
│      },
│      {
│        "q": "Kaip 8 + 5 skaičiuoti per dešimtį?",
│        "options": [
│          "Skaičiuoti po vieną: 9, 10, 11, 12, 13",
│          "8 + 2 = 10, paskui 10 + 3",
│ -        "Prie dešimties pridėti 5 ir gauti 15"
│ +        "Gauti dešimt, paskui pridėti visus 5"
│        ],
│        "answer": 1,
│        "hint": "Ar visus penkis reikia dėti į dešimtuką?",
│ -      "why": "Iš penkių paimk 2, gausi dešimt, o likusius 3 pridėk: 13."
│ +      "why": "Iš penkių paimk 2, gausi dešimt. Paskui pridėk likusius 3 ir gausi 13."
│      },
│      {
│ -      "q": "Yra 9 raudoni ir 6 mėlyni rutuliai. Kiek jų iš viso?",
│ +      "q": "Yra 9 raudoni ir 6 mėlyni kamuoliai. Kiek jų iš viso?",
│        "options": [
│          "14",
│          "15",
│ @@ -87,19 +87,19 @@
│        "why": "Iš penkių paimk 3, dešimtukas prisipildo, lieka 2. 10 + 2 = 12."
│      },
│      {
│ -      "q": "Dėžėje jau 16 kamuolių. Įdėjo dar 7. Kiek kamuolių dabar?",
│ +      "q": "Dėžėje jau 16 kamuolių. Įdėjo dar 7 kamuolius. Kiek kamuolių dabar dėžėje?",
│        "options": [
│          "22",
│          "23",
│          "24"
│        ],
│        "answer": 1,
│ -      "hint": "Papildyk 16 iki 20 taip, kaip pildei dešimtuką.",
│ -      "why": "16 + 4 = 20, o likusius 3 pridėk: 23.",
│ +      "hint": "Kiek trūksta nuo 16 iki 20?",
│ +      "why": "16 + 4 = 20, o likusius 3 pridėk ir gausi 23.",
│        "optional": true
│      }
│    ],
│ … omitted 5 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/probe512.py
│ @@ -0,0 +1,161 @@
│ +#!/usr/bin/env python3
│ +"""Paleidimo #512 zondas: ar nauji 22-sudetis-per-desimti tekstai tikrai rodomi vaikui.
│ +
│ +390 px, Brave skydų imitacija (localStorage / crypto.subtle / speechSynthesis
│ +užblokuoti), visi ne vietiniai URL nutraukiami. Tikrina:
│ +  * naujus tekstus (outcomes, concept, example, užduočių klausimus, užuominas, why),
│ +  * senų tekstų nebuvimą puslapyje,
│ +  * simuliacijos gyvumą (skaičių pasirinkimas, spėjimas, „Papildyk dešimtuką“),
│ +  * konsolės klaidas.
│ +"""
│ +import asyncio
│ +import json
│ +from playwright.async_api import async_playwright
│ +
│ +BASE = "http://127.0.0.1:8972/"
│ +ROUTE = "#/modulis/1/matematika/22-sudetis-per-desimti"
│ +
│ +BRAVE_INIT = """
│ +try { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('insecure', 'SecurityError'); } }); } catch (e) {}
│ +try { Object.defineProperty(Crypto.prototype, 'subtle', { get() { return undefined; } }); } catch (e) {}
│ +try { Object.defineProperty(window, 'speechSynthesis', { get() { return undefined; } }); } catch (e) {}
│ +"""
│ +
│ +NEW = [
│ +    "Paaiškinu, kodėl 8 + 5 skaičiuoju per dešimtį.",
│ +    "Pirma paimk tiek dėmių, kiek trūksta iki dešimties.",
│ +    "Dešimtukas turi dešimt langelių. Pirmas skaičius jau jame.",
│ +    "Pilnas dešimtukas yra dešimt.",
│ +    "Kartais trūksta trijų dėmių, kartais vienos.",
│ +    "Iš tų penkių įdėk 2 obuolius į krepšį.",
│ +    "Dešimtuke jau yra 8 dėmės.",
│ +    "todėl dar trūksta dviejų dėmių",
│ +    "Gauti dešimt, paskui pridėti visus 5",
│ +    "Paskui pridėk likusius 3 ir gausi 13.",
│ +    "9 raudoni ir 6 mėlyni kamuoliai",
│ +    "Įdėjo dar 7 kamuolius. Kiek kamuolių dabar dėžėje?",
│ +    "Kiek trūksta nuo 16 iki 20?",
│ +    "o likusius 3 pridėk ir gausi 23",
│ +    "Kuris kelias tau patogesnis: po vieną ar per dešimtį?",
│ +]
│ +
│ +OLD = [
│ +    "Paaiškinu, kodėl 8 + 5 patogu skaičiuoti per dešimtį.",
│ +    "Pirma paimk tiek, kiek trūksta iki dešimties.",
│ +    "Pirmas skaičius jau dešimtuke. Suskaičiuok tuščius langelius.",
│ +    "Dešimtukas prisipildo — tai dešimt.",
│ +    "Kaskart trūksta kito skaičiaus.",
│ +    "Paimk 2

… PRALEISTA 5278 SIMBOLIŲ IŠ 23278 (įrankių išklotinės) — visa ataskaita: agents/work/kalbu-redaktorius/00512/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

eš | Po | Priežastis |
│ +|---|---|---|---|
│ +| `outcomes[1]` | „Paaiškinu, kodėl 8 + 5 **patogu skaičiuoti** per dešimtį.“ | „Paaiškinu, kodėl 8 + 5 **skaičiuoju** per dešimtį.“ | audito #13: 12 ištariamų žodžių; „patogu“ yra vertinimas, o rezultatas prasideda „Paaiškinu, kodėl…“, tad sakinys liko trumpesnis ir veiksmažodinis |
│ +| `concept.big_idea` | „Pirma paimk **tiek**, kiek trūksta iki dešimties.“ | „Pirma paimk **tiek dėmių**, kiek trūksta iki dešimties.“ | „paimk tiek“ be daikto — vaikas ieško, ko imti (LL-01 šeima) |
│ +| `concept.steps[0]` | „Pirmas skaičius jau **dešimtuke**. Suskaičiuok tuščius langelius.“ | „**Dešimtukas turi dešimt langelių.** Pirmas skaičius jau **jame**. Suskaičiuok tuščius langelius.“ | sąvoka niekur neapibrėžta, o tas pats žodis modulyje reiškė ir skaičių 10, ir langelių rėmelį; „dešimtuke yra 8 dėmės“ skambėjo kaip prieštaravimas (nauja pamoka LL-181) |
│ +| `concept.steps[1]` | „Dešimtukas prisipildo **— tai dešimt**.“ | „**Pilname dešimtuke yra dešimt dėmių.**“ | brūkšninė elipsė be veiksmažodžio; naujasis sakinys tą pačią mintį pasako konkrečiai ir tikrinamai modelyje |
│ +| `concept.steps[3]` | „**Kaskart trūksta kito skaičiaus.**“ | „**Kartais trūksta trijų dėmių, kartais vienos.**“ | kiekio neįvardijo niekas: „kito skaičiaus“ nepasako, kiek; konkretūs skaičiai sutampa su 7 + 5 ir 9 + 6 tame pačiame žingsnyje |
│ +| `concept.example` | „Paimk 2 obuolius ir įdėk į krepšį **— bus dešimt**. Liko 3 obuoliai. Viso 13.“ | „**Iš tų penkių** įdėk 2 obuolius į krepšį. **Krepšyje** bus dešimt obuolių. Liko 3 obuoliai. Viso 13 obuolių.“ | audito #5 radinio likutis: nepasakyta, iš kur imti 2 ir ko liko 3 (vaikas mato du skaičių šaltinius); brūkšninė elipsė |
│ +| `tasks[0].q` | „Dešimtuke yra 8 dėmės.“ | „Dešimtuke **jau** yra 8 dėmės.“ | be apibrėžimo sakinys prieštaravo pats sau (dešimtyje aštuonių nėra); kartu su `steps[0]` dabar skaitomas kaip „rėmelyje jau 8, kiek dar trūksta“ |
│ +| `tasks[0].why` | „8 + 2 = 10, todėl **dešimtukui** trūksta dviejų dėmių.“ | „8 + 2 = 10, todėl **dar trūksta** dviejų dėmių.“ | trūksta ne daiktui, o iki skaičiaus; naudininkas klaidino |
│ +| `tasks[1].options[2]` | „Prie dešimties pridėti 5 ir gauti 15“ | „Gauti dešimt, paskui pridėti visus 5“ | klaidingas variantas rėmėsi dešimčia, kurios toje vietoje dar nėra; naujasis tiksliai nusako klaidą (pridedamas visas antras dėmuo), o ne kitą veiksmą |
│ +| `tasks[1].why` | „Iš penkių paimk 2, gausi dešimt, o likusius 3 pridėk: 13.“ | „Iš penkių paimk 2, gausi dešimt. Paskui pridėk likusius 3 ir gausi 13.“ | 10 ištariamų žodžių viename sakinyje su dvitaškiu — lėtas skaitytojas stoja ties dvitaškiu; mintis ta pati |
│ +| `tasks[2].q` | „…6 mėlyni **rutuliai**“ | „…6 mėlyni **kamuoliai**“ | tame pačiame modulyje tas pats daiktas buvo vadinamas dviem vardais (5 užduotis — „kamuoliai“); vaikas ieškojo, ar čia tas pats |
│ +| `tasks[4].q` | „Įdėjo dar 7. Kiek kamuolių **dabar**?“ | „Įdėjo dar 7 **kamuolius**. Kiek kamuolių dabar **dėžėje**?“ | objektas neįvardytas („7“ ko?), o „dabar“ nepasako, kur skaičiuoti |
│ +| `tasks[4].hint` | „Papildyk 16 iki 20 taip, **kaip pildei** dešimtuką.“ | „**Kiek trūksta nuo 16 iki 20?**“ | eigos būtasis „pildei“ + nurodymas „kaip“, kurio vaikas negali atlikti (jau praeityje); naujasis klausia to paties pirmo žingsnio ir neįvardija atsakymo |
│ +| `tasks[4].why` | „16 + 4 = 20, o likusius 3 pridėk: 23.“ | „16 + 4 = 20, o likusius 3 pridėk **ir gausi** 23.“ | dvitaškis vietoj veiksmažodžio, 10 ištariamų žodžių |
│ +| `reflect` | „Pagalvok, kaip skaičiuoji 8 + 5. **Kurį skaičių tau lengviausia papildyti iki dešimties?**“ | „**Kuris kelias tau patogesnis: po vieną ar per dešimtį? Kodėl?**“ | antrasis klausimas neturėjo vieno atsakymo (papildomas visada tas pats pirmas skaičius); naujasis prašo palyginti abu modulio kelius |
│ +
│ +**Skaičiai.** `check_language.py --grade 1`: klaidos **0 → 0**, įspėjimai **0 → 0**, pastabos **53 → 53**; modulyje **0 įrašų prieš ir po** (LL-52/LL-53 šeima: sakinio sandara, referentas, ne jo ilgis). Žmogaus akių radiniai: **15 → 0**. `validate_content.py` (be parametrų ir `--grade 1`): **0 klaidų, 0 įspėjimų**. `check_audio.py`: **1112 tekstų / 2224 įrašų — nepakito** (nė vienas pakeistas laukas netariamas; `sim.config` neliestas). Kiti CI vartai: `check_registry`, `check_published --path-order`, `check_refs`, `check_docs_facts`, `curriculum_backlog --check`, `check_agents`, `check_art`, `check_lessons` (180 pamokų) — 0 problemų, `check_language --strict` — ✔.
│ +
│ +**`check_view.py` (Brave skydų imitacija, 127.0.0.1:8972, `--module 22-sudetis-per-desimti`):** prieš ir po vienodai —
│ +
│ +| Plotis | overflow | smallCount | minTaskFont | tasksVisible | clipped | simFont min | loading/fatal | problems |
│ +|---|---|---|---|---|---|---|---|---|
│ +| 1440 | 0 | 0 | 21,44 px | 5/5 | [] | 15,2 px | false | [] |
│ +| 1024 | 0 | 0 | 21,44 px | 5/5 | [] | 15,2 px | false | [] |
│ +| 390 | 0 | 0 | 19,14 px | 5/5 | [] | 15,2 px | false | [] |
│ +| 360 | 0 | 0 | 18,96 px | 5/5 | [] | 15,2 px | false | [] |
│ +
│ +**DOM zondas** (`probe512.py`, 390 px, `localStorage`/`crypto.subtle`/`speechSynthesis` užblokuoti, ne vietiniai URL nutraukti): 11 naujų tekstų matomi (outcomes[1], big_idea 2 sakinys, steps[0] abu sakiniai su apibrėžimu, steps[1], steps[3], example, 1 užduoties klausimas, 2 užduoties trečias variantas, 3 užduoties klausimas su „kamuoliai“, 5 užduoties klausimas, reflect); senų tekstų puslapyje **0** (`Pirmas skaičius jau dešimtuke. Suskaičiuok…`, „Dešimtukas prisipildo — tai dešimt“, „Kaskart trūksta kito skaičiaus“, „Paimk 2 obuolius ir įdėk…“, „Prie dešimties pridėti 5 ir gauti 15“, „rutuliai“, „kaip pildei dešimtuką“, „Pagalvok, kaip skaičiuoji 8 + 5“). Grįžtamasis ryšys: 1 užduotis po „3“ → „Suskaičiuok tuščius langelius dešimtuke.“, po „2“ → „Teisingai! 8 + 2 = 10, todėl dar trūksta dviejų dėmių.“; 2 užduotis po klaidingo varianto → „Ar visus penkis reikia dėti į dešimtuką?“, po teisingo → „…Paskui pridėk likusius 3 ir gausi 13.“; 5 užduotis po „22“ → „Kiek trūksta nuo 16 iki 20?“, po „23“ → „Teisingai! 16 + 4 = 20, o likusius 3 pridėk ir gausi 23.“ Simuliacija gyva: 9 + 5, spėjimas 1 → „Į dešimtuką nuėjo 1 dėmė. Ant stalo liko 4. Tavo spėjimas sutapo: 1.“, readout „Dešimt ir dar 4. Viso 14.“, lygybė „9 + 1 = 10, paskui 10 + 4 = 14.“, antras paspaudimas → „Dešimtukas jau pilnas. Ant stalo liko 4.“ Konsolės klaidų **0**.
│ +
│ +**Palikta sąmoningai:** `title` („Sudėtis per dešimtį“) ir `subtitle` („Pirma papildyk dešimtuką, paskui pridėk, kas liko“ — indekso kopija, LL-05/LL-21; keitimas reikalautų `index.json` sinchronizacijos, o „papildyk dešimtuką“ sutampa su sim mygtuku ir po `steps[0]` apibrėžimo yra vienareikšmis); `sim.config.sentences` (visi 13 sakinių turi garso įrašus; `pradek` atitinka sim antraštę, o keitimas paliktų vaiką be balso iki pergeneravimo — dublikato klausimas perduotas pasiūlymu); `concept.steps[2]` „Prie dešimties pridėk dėmes, kurios liko ant stalo.“ (7 žodžiai, „kurios“ rodo į dėmes tame pačiame sakinyje); `tasks[1].hint` „Ar visus penkis reikia dėti į dešimtuką?“ (klausimas apie rėmelį, kuris dabar apibrėžtas; atsakymo neišduoda); `tasks[3]` klausimas ir `why` (7 + 5 kelias jau teisingas, „dešimtukas prisipildo“ — modelio žodis); `outcomes[0]` „Pirma papildau dešimtuką, paskui pridedu likusį.“ (sutampa su sim mygtuku, sąvoka apibrėžta `steps[0]`); `teacher.*`, `sources`, `svietimas1` (suaugusiojo tekstas ir šaltiniai — ne vaiko laukas); visi `answer` indeksai (0, 1, 1, 2, 1) ir teisingi variantai — nepaliesti nė viename.
│ +
│ +**Naujas pasiūlymas:** `agents/proposals/2026-11-24-kalbu-redaktorius-sim-antraste-dublikatas.json` (ta pati sim antraštė įrašyta ir `matematika.js:2940`, ir `sim.config.sentences.pradek` — tekstai jau išsiskyrė, o kodo sakinio nemato nei kalbos, nei garso vartai). Nauja pamoka: **LL-181** (terminas, kuris reiškia ir daiktą, ir skaičių).
Modulis 22-sudetis-per-desimti — perrašytos 15 formuluočių, atsakymai ir sim nepaliesti.

PAKEISTA (prieš → po)
- outcomes[1]: „…8 + 5 patogu skaičiuoti per dešimtį“ → „…8 + 5 skaičiuoju per dešimtį“ (12 → 7 ištariamų žodžių)
- big_idea: „Pirma paimk tiek, kiek trūksta…“ → „Pirma paimk tiek dėmių, kiek trūksta…“ (buvo be daikto)
- steps[0]: „Pirmas skaičius jau dešimtuke“ → „Dešimtukas turi dešimt langelių. Pirmas skaičius jau jame.“
- steps[1]: „Dešimtukas prisipildo — tai dešimt“ → „Pilname dešimtuke yra dešimt dėmių“
- steps[3]: „Kaskart trūksta kito skaičiaus“ → „Kartais trūksta trijų dėmių, kartais vienos“
- example: „Paimk 2 obuolius…— bus dešimt“ → „Iš tų penkių įdėk 2 obuolius į krepšį. Krepšyje bus dešimt obuolių…“
- tasks[0].q: „Dešimtuke yra 8 dėmės“ → „Dešimtuke jau yra 8 dėmės“
- tasks[0].why: „dešimtukui trūksta“ → „dar trūksta dviejų dėmių“
- tasks[1].options[2]: „Prie dešimties pridėti 5 ir gauti 15“ → „Gauti dešimt, paskui pridėti visus 5“
- tasks[1].why: dvitaškis „…pridėk: 13“ → „…Paskui pridėk likusius 3 ir gausi 13.“
- tasks[2].q: „rutuliai“ → „kamuoliai“ (tas pats daiktas modulyje buvo dviem vardais)
- tasks[4].q: „Įdėjo dar 7. Kiek kamuolių dabar?“ → „Įdėjo dar 7 kamuolius. Kiek kamuolių dabar dėžėje?“
- tasks[4].hint: „Papildyk 16 iki 20 taip, kaip pildei dešimtuką“ → „Kiek trūksta nuo 16 iki 20?“
- tasks[4].why: „…pridėk: 23“ → „…pridėk ir gausi 23“
- reflect: „…Kurį skaičių tau lengviausia papildyti iki dešimties?“ → „Kuris kelias tau patogesnis: po vieną ar per dešimtį? Kodėl?“

Pagrindinis radinys — žodis „dešimtukas“ modulyje žymėjo ir skaičių 10, ir dešimties langelių rėmelį, bet nebuvo niekur apibrėžtas, todėl „Dešimtuke yra 8 dėmės“ skambėjo kaip prieštaravimas. Apibrėžimas įdėtas į steps[0], prieš pirmą užduotį.

SKAIČIAI
- check_language.py --grade 1: klaidos 0 → 0, įspėjimai 0 → 0, pastabos 53 → 53. Modulyje 0 įrašų ir prieš, ir po (visi radiniai buvo žmogaus akių lauke: referentas, trūkstamas objektas, brūkšninė elipsė, dvitaškis). Žmogaus akių radiniai 15 → 0.
- validate_content.py (ir --grade 1): 0 klaidų, 0 įspėjimų.
- check_view.py (Brave skydų imitacija, 127.0.0.1:8972): prieš ir po vienodai — 1440/1024/390/360: overflow 0, smallCount 0, minTaskFont 21,44 / 21,44 / 19,14 / 18,96 px, tasksVisible 5/5, clipped [], sim teksto min 15,2 px, loading/fatal false, problems [].
- check_audio.py: 1112 tekstų / 2224 įrašų nepakito (sim.config neliestas; nė vienas pakeistas laukas netariamas).
- Kiti CI vartai: check_registry, check_published --path-order, check_refs, check_docs_facts, curriculum_backlog --check, check_agents, check_art, check_lessons (181), check_language --strict — visi 0.
- DOM zondas (probe512.py, 390 px, localStorage/crypto/speechSynthesis užblokuoti): 11 naujų tekstų matomi, senų 0; užuominos ir why rodomi po paspaudimų; sim gyva (9 + 5, spėjimas 1 → „Į dešimtuką nuėjo 1 dėmė. Ant stalo liko 4.“, readout „Dešimt ir dar 4. Viso 14.“); konsolės klaidų 0.

KO SĄMONINGAI NEKEIČIAU
- title ir subtitle — subtitle yra index.json kopija (LL-05/LL-21), o „papildyk dešimtuką“ sutampa su sim mygtuku ir po steps[0] apibrėžimo vienareikšmis.
- sim.config.sentences (13 sakinių) — turi garso įrašus; keitimas paliktų vaiką be balso iki pergeneravimo. Antraštės dublikatas (JS 2940 vs JSON pradek) perduotas pasiūlymu.
- steps[2], tasks[1].hint, tasks[3].q/why, outcomes[0] — skaitomi vienareikšmiškai, sąvoka dabar apibrėžta; tasks[3] „dešimtukas prisipildo“ yra modelio žodis.
- teacher.*, sources, svietimas1 — suaugusiojo tekstas ir šaltiniai, ne vaiko laukas.
- Visi answer indeksai (0, 1, 1, 2, 1) ir teisingi variantai — nepaliesti; sim lygybė ir pedagogika nepakeistos.

FAILAI
- content/lt/grade-01/matematika/22-sudetis-per-desimti.json (pakeistas)
- research/wiki/guidelines/kalbos-auditas.md (paleidimo #512 lentelė su skaičiais)
- research/wiki/guidelines/pamokos.md (nauja pamoka LL-181 „Terminas, kuris reiškia ir daiktą, ir skaičių“)
- agents/proposals/2026-11-24-kalbu-redaktorius-sim-antraste-dublikatas.json (naujas)
Serveris 127.0.0.1:8972 sustabdytas; commit/push — bėgiklio.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-b0b99f0c9a7e4a7e218a26c326e18a3c2bf9f0fef488a17242a361fbc9017340
```
