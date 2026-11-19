# metodininkas — 2026-11-19T0821

- paleidimas: #377 (manual)
- trukmė: 583s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ content/lt/grade-01/matematika/29-atimtis-per-desimti.json.draft
│ @@ -0,0 +1,98 @@
│ +{
│ +  "id": "29-atimtis-per-desimti",
│ +  "grade": 1,
│ +  "strand": "matematika",
│ +  "title": "Atimtis per dešimtį: imk iš dešimtuko",
│ +  "subtitle": "Kai laisvų neužtenka, dalis imama iš dešimtuko",
│ +  "minutes": 9,
│ +  "outcomes": [
│ +    "Išimu dėmes iš dešimtuko, kai laisvų neužtenka.",
│ +    "Pasakau, kiek vienetų imti iš dešimtuko.",
│ +    "Suskaičiuoju, kiek liko po atėmimo."
│ +  ],
│ +  "concept": {
│ +    "title": "Dešimtukas yra dešimt vienetų",
│ +    "big_idea": "Dešimtukas yra dešimt atskirų vienetų. Kai laisvų neužtenka, vienetą imi iš dešimtuko. Skaičius nuo to nesikeičia.",
│ +    "steps": [
│ +      "Dešimtuke dešimt dėmių, šalia trys. Viso trylika.",
│ +      "Atimk devynias. Laisvų trys — neužtenka.",
│ +      "Imk šešias dėmes iš dešimtuko. Dabar laisvų devynios.",
│ +      "Atėmęs devynias matai: liko keturios."
│ +    ],
│ +    "example": "Dėžutėje dešimt obuolių, šalia trys. Parduodi devynis. Iš dėžutės imi šešis, o trys buvo šalia."
│ +  },
│ +  "sim": {
│ +    "component": "desimtukas-ir-atimtis",
│ +    "config": {
│ +      "whole": 13,
│ +      "take": 9,
│ +      "ten": 10,
│ +      "guess": [3, 6, 9],
│ +      "sentences": {
│ +        "start": "Dešimtuke dešimt dėmių, šalia trys.",
│ +        "predict": "Kiek dėmių imsi iš dešimtuko?",
│ +        "empty": "Laisvų nebėra. Iš kur imti devynias?",
│ +        "taken": "Dėmė iš dešimtuko atsidūrė šalia.",
│ +        "same": "Skaičius nepakito: trylika.",
│ +        "done": "Atėmei devynias. Liko keturios.",
│ +        "again": "Pradedam iš naujo. Bandyk kitaip."
│ +      }
│ +    }
│ +  },
│ +  "tasks": [
│ +    {
│ +      "q": "Dešimtuke dešimt dėmių, šalia dvi. Atimk aštuonias. Kiek liks?",
│ +      "options": ["6", "4", "10"],
│ +      "answer": 1,
│ +      "hint": "Laisvų dvi. Kiek dėmių paimti iš dešimtuko?",
│ +      "why": "Dvi laisvos ir šešios iš dešimtuko yra aštuonios. Liko keturios."
│ +    },
│ +    {
│ +      "q": "Dešimtuke dešimt dėmių, šalia keturios. Atimk aštuonias. Kiek liks?",
│ +      "options": ["6", "2", "12"],
│ +      "answer": 0,
│ +      "hint": "Kiek liktų vien iš dešimtuko? Nepamiršk keturių šalia.",
│ +      "why": "Keturios laisvos ir keturios iš dešimtuko yra aštuonios. Liko šešios."
│ +    },
│ +    {
│ +      "q": "Viena mergaitė išėmė šešias dėmes, kita — dešimt. Abi atėmė devynias iš trylikos. Kiek liko kiekvienai?",
│ +      "options": ["Pirmai keturios, antrai nulis", "Abiem liko keturios", "Pirmai keturios, antrai viena"],
│ +      "answer": 1,
│ +      "hint": "Dešimtuko atidarymas skaičiaus nekeičia.",
│ +      "why": "Kiek dėmių atidarysi, viso lieka tiek pat."
│ +    },
│ +    {
│ +      "q": "Šešiolika dėmių: dešimtukas ir šešios šalia. Atimk devynias. Kiek liks?",
│ +      "options": ["7", "3", "13"],
│ +      "answer": 0,
│ +      "hint": "Laisvų šešios. Kiek dėmių paiimti iš dešimtuko?",
│ +      "why": "Šešios laisvos ir trys iš dešimtuko yra devynios. Liko septynios.",
│ +      "optional": true
│ +    }
│ +  ],
│ +  "reflect": "Kaip žinai, kad atėmus devynias liko keturios? Papasakok.",
│ +  "teacher": {
│ +    "goal": "Suprasti, kad dešimtukas yra dešimt atskirų vienetų, todėl atimant per dešimtį dalis imama iš jo; atlikti 13 − 9 ir 14 − 8.",
│ +    "prompt": "Kodėl atimant devynias iš trylikos nepakanka trijų laisvų dėmių?",
│ +    "offline": "Į nedidelį popierinį maišelį įdėkite dešimt pupelių ir perriškite siūlu, šalia padėkite tris laisvas. Paprašykite vaiko duoti devynias. Trys laisvos neužteks — tegul atriša maišelį ir ima iš jo. Skaičiuokite kartu: viso trylika, atėmėme devynias, liko keturios. Tą patį pakartokite su 14 − 8, naudodami kiaušinių dėtuvę.",
│ +    "misconceptions": [
│ … omitted 20 diff line(s) across 1 additional file(s)/section(s)
│ content/lt/grade-01/matematika/29-atimtis-per-desimti.json.draft
│ @@ -65,7 +65,7 @@
│        "q": "Šešiolika dėmių: dešimtukas ir šešios šalia. Atimk devynias. Kiek liks?",
│        "options": ["7", "3", "13"],
│        "answer": 0,
│ -      "hint": "Laisvų šešios. Kiek dėmių paiimti iš dešimtuko?",
│ +      "hint": "Laisvų šešios. Kiek dėmių paimti iš dešimtuko?",
│        "why": "Šešios laisvos ir trys iš dešimtuko yra devynios. Liko septynios.",
│        "optional": true
│      }
│ profiles/deepseek41flash/cache/scratch/probe_m12.py
│ @@ -0,0 +1,76 @@
│ +#!/usr/bin/env python3
│ +"""Zondas M-12 (atimtis per dešimtį): juodraštinis modulis per abu vartus.
│ +
│ +Paleidžia validate_content.check_module ir check_language.check_module
│ +laikinam failui, kuris guli content/lt/grade-01/matematika/ kataloge
│ +(kitaip failo vietos patikra neįveikiama). Simuliacijos registro sąrašas
│ +papildomas laikinai, nes komponento dar nėra (LL-07: be jo vartai pagrįstai
│ +kristų). Skaito ilgius ir spausdina viską, ką rado.
│ +"""
│ +import json
│ +import sys
│ +from pathlib import Path
│ +
│ +ROOT = Path("/home/zoltanas/workspace/suprask")
│ +sys.path.insert(0, str(ROOT / "scripts"))
│ +
│ +import validate_content as vc          # noqa: E402
│ +import check_language as cl            # noqa: E402
│ +
│ +DRAFT = ROOT / "content/lt/grade-01/matematika/29-atimtis-per-desimti.json.draft"
│ +data = json.loads(DRAFT.read_text(encoding="utf-8"))
│ +
│ +sims = vc.registered_sims() | {"desimtukas-ir-atimtis"}
│ +rep = vc.Report()
│ +vc.check_module(DRAFT, data, rep, sims, {})
│ +
│ +out = []
│ +cl.check_module(DRAFT, out)
│ +
│ +print("== validate_content.check_module")
│ +print("  klaidos :", len(rep.errors))
│ +for e in rep.errors:
│ +    print("   E", e)
│ +print("  įspėjimai:", len(rep.warnings))
│ +for w in rep.warnings:
│ +    print("   W", w)
│ +
│ +print("== check_language.check_module")
│ +print("  įrašai:", len(out))
│ +for o in out:
│ +    print(f"   [{o['severity']}] {o['issue']} — {o.get('detail','')} :: {o.get('where','')}")
│ +
│ +print("== ilgiai")
│ +def chars(label, text):
│ +    print(f"  {label}: {len(text)} simb.")
│ +
│ +chars("title", data["title"])
│ +chars("subtitle", data["subtitle"])
│ +chars("concept.title", data["concept"]["title"])
│ +chars("big_idea", data["concept"]["big_idea"])
│ +chars("example", data["concept"]["example"])
│ +for i, s in enumerate(data["concept"]["steps"], 1):
│ +    chars(f"step{i}", s)
│ +for i, o in enumerate(data["outcomes"], 1):
│ +    chars(f"outcome{i}", o)
│ +
│ +print("== žodžiai sakiniuose")
│ +word = vc.word_count
│ +import re
│ +def per_sentence(text):
│ +    return [(s, len(re.findall(r"[\wąčęėįšųūžĄČĘĖĮŠŲŪŽ'-]+", s))) for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
│ +
│ +for name, text in [("big_idea", data["concept"]["big_idea"]),
│ +                   ("example", data["concept"]["example"]),
│ +                   ("reflect", data["reflect"])]:
│ +    for s, n in per_sentence(text):
│ +        print(f"  {name}: {n} ž. :: {s}")
│ +for i, s in enumerate(data["concept"]["steps"], 1):
│ +    print(f"  step{i}: {word(s)} ž.")
│ +for i, t in enumerate(data["tasks"], 1):
│ +    for s, n in per_sentence(t["q"]) + per_sentence(t["hint"]) + per_sentence(t["why"]):
│ +        if n > 10:
│ +            print(f"  !! task{i} per ilgas: {n} ž :: {s}")
│ +
│ +print("== atsakymų indeksai")
│ +print(" ", [t["answer"] for t in data["tasks"]])
│ content/lt/grade-01/matematika/29-atimtis-per-desimti.json.draft
│ @@ -33,7 +33,7 @@
│          "predict": "Kiek dėmių imsi iš dešimtuko?",
│          "empty": "Laisvų nebėra. Iš kur imti devynias?",
│          "taken": "Dėmė iš dešimtuko atsidūrė šalia.",
│ -        "same": "Skaičius nepakito: trylika.",
│ +        "same": "Skaičius nepakito.",
│          "done": "Atėmei devynias. Liko keturios.",
│          "again": "Pradedam iš naujo. Bandyk kitaip."
│        }
Aš pasiekiau žingsnių limitą prieš įrašydamas pagrindinį darbo failą. Toliau — ką tikrai padariau ir kas liko.

## Kas jau padaryta (diske)

1. **`content/lt/grade-01/matematika/29-atimtis-per-desimti.json.draft`** — juodraštinis modulis, surašytas pagal būsimą M-12 metodą (13 − 9 modelis, 4 užduotys, `optional` ketvirta). Jis **numatytas ištrinti** — tai zondo failas, ne turtas; šiame kataloge jo neturi likti.

2. **Patikra tikrais įrankiais** (ne mintimis), per `scripts/validate_content.check_module` ir `scripts/check_language.check_module` su laikinai papildytu simuliacijų sąrašu:
   - `validate_content` → **0 klaidų**, 1 pagrįstas įspėjimas „nepavyko perskaityti simuliacijos `desimtukas-ir-atimtis` kūno“ (komponento dar nėra — tai inžinieriaus darbas);
   - `check_language` → **0 įrašų** (0 klaidų, 0 įspėjimų, 0 pastabų);
   - ilgiai skriptu: title 37, subtitle 46, concept.title 29, big_idea 114, žingsniai 49/40/53/37; visi sakiniai ≤ 10 žodžių (ilgiausias 8);
   - atsakymų indeksai 1/0/1/0 — ne visi tame pačiame.

3. **Patikrinti šaltiniai Crossref** (visi grąžino tikslius metaduomenis, ne iš atminties):
   - Hiebert & Wearne 1992, JRME 23(2) 98–122 — `10.5951/jresematheduc.23.2.0098` (abstraktas: 1 klasės „conceptually based“ dešimtuko struktūros mokymas pagerino ir pergrupavimo uždavinius);
   - Fuson 1990, Cognition and Instruction 7(4) 343–403 — `10.1207/s1532690xci0704_4`;
   - Baroody 1984, JRME 15(3) 203–213 — `10.5951/jresematheduc.15.3.0203` (skaičiavimas atgal ir „take away“ samprata);
   - Fuson & Willis 1988, JRME 19(5) 402–420 — `10.5951/jresematheduc.19.5.0402` (skaičiavimas aukštyn — natūralus ir mokomas 1–2 kl.);
   - Vermeulen, Béguin, Scheltens & Eggen 2020, Frontiers in Education 5, 537531 — `10.3389/feduc.2020.537531` („smaller-from-larger“ tilto klaida = nepilna dešimtuko samprata).
   - Programos citatos perskaitytos faile: `sources/pradinio-bp-rekomendacijos-2024.txt:692–699` ir `:33520–33522`.

## Suprojektuotas metodas (parengtas, bet neįrašytas)

Viena idėja: **dešimtukas yra dešimt atskirų vienetų; kai laisvų neužtenka, imi iš jo, o skaičius nesikeičia.**

- Modelis `desimtukas-ir-atimtis` (`matematika.js`): dešimtukas (2 × 5 langeliai, toks pat kaip `05-desimtukas`) + 3 laisvos dėmės + dėžė. **Vienas kintamasis** — kiek dėmių išimta iš dešimtuko (`k`); dėžė ima tik laisvas, todėl po trijų ėjimų vaikas atsimuša į medžiagos sieną be jokio klaidos pranešimo. Spėjimas prieš veiksmą: 3 / 6 / 9 (teisingas 6), palyginamas su įvykiu ir nepametamas. Pažanga — tik įdėjus devintą dėmę į dėžę.
- Atrasta ir pataisyta reali modelio klaida: pirmoji frazė „Skaičius nepakito: trylika“ būtų neteisinga, jei dėmių jau įdėta į dėžę (LL-33 šeima) — pakeista į „Skaičius nepakito.“
- Atrasta antroji problema: klausimas „kiek dėmių imti iš dešimtuko“ turi **kelis teisingus atsakymus** (užtenka bet kurio k ≥ 6), todėl užduotys perrašytos klausti **likučio** (12 − 8, 14 − 8, 16 − 9), o klaidingi variantai sąmoningai imti iš dokumentuotų klaidų: 6 (= 8 − 2 atvirkščiai), 2 (= 10 − 8, pamirštos laisvos), 13 (= 16 − 9 „smaller-from-larger“).

## Ko nepadariau

Neįrašyti trys failai, kurie yra tikrasis rezultatas: `research/wiki/grades/01/metodai.md` M-12 įrašas, `agents/proposals/2026-11-19-metodininkas-atimtis-per-desimti.json` (`type: metodas`, target `.../29-atimtis-per-desimti.json`), `research/wiki/foundations/desimtukas-kaip-vienetas.md` + README eilutė, changelog įrašas ir `agents/state.json` blokas. **Taip pat nepašalintas `.draft` failas** — jį reikia ištrinti, kad neliktų šiukšlės turinio kataloge. Todėl šis paleidimas pagal bėgiklio taisyklę laikytinas tuščiu, ir `ĮGYVENDINTA:` eilutės rašyti negalima: #26106 lieka eilėje.

Visa surinkta medžiaga (juodraštis su užduotimis, patikros išvestis, citatos, DOI) yra diske — kitas paleidimas gali užbaigti darbą be pakartotinės analizės.

## klaidos

```
session_id: local-537324c087ac784a6ec2f10c6b0c2f38c4c5dca66d1bf05bd56d8d35b3799610
```
