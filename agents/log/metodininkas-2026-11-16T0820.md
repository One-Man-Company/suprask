# metodininkas — 2026-11-16T0820

- paleidimas: #313 (manual)
- trukmė: 673s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/m10-draft.json
│ @@ -0,0 +1,127 @@
│ +{
│ +  "id": "22-medziai-krumai-zoles",
│ +  "grade": 1,
│ +  "strand": "pasaulio-pazinimas",
│ +  "title": "Medžiai, krūmai, žolės: grupę rodo stiebas",
│ +  "subtitle": "Aukštis klaidina: grupę pasako stiebas",
│ +  "minutes": 9,
│ +  "outcomes": [
│ +    "Skiriu medį, krūmą ir žolę pagal stiebą.",
│ +    "Paaiškinu, kodėl aukštas augalas gali būti krūmas.",
│ +    "Pasakau, kiek stiebų kyla iš žemės."
│ +  ],
│ +  "concept": {
│ +    "title": "Grupę rodo stiebas",
│ +    "big_idea": "Medis turi vieną sumedėjusį kamieną. Krūmas turi kelis stiebus nuo žemės. Žolės stiebas minkštas. Aukštis apie grupę nieko nesako.",
│ +    "steps": [
│ +      "Ąžuoliukas 30 cm – jau medis: jo kamienas vienas.",
│ +      "Alyva 2,5 m – dar krūmas: stiebai keli.",
│ +      "Kiaulpienė žema, bet stiebas minkštas: tai žolė.",
│ +      "Grupę rodo stiebas, o aukštis nieko nesako."
│ +    ],
│ +    "example": "Kieme auga mažas ąžuoliukas ir aukšta alyva. Mažesnis augalas yra medis."
│ +  },
│ +  "sim": {
│ +    "component": "augalu-grupes",
│ +    "config": {
│ +      "plants": [
│ +        {
│ +          "id": "azuoliukas",
│ +          "name": "ąžuoliukas",
│ +          "stems": 1,
│ +          "woody": true,
│ +          "height": { "start": 30, "min": 30, "max": 300, "step": 10 }
│ +        },
│ +        {
│ +          "id": "alyva",
│ +          "name": "alyva",
│ +          "stems": 3,
│ +          "woody": true,
│ +          "height": { "start": 120, "min": 40, "max": 250, "step": 10 }
│ +        },
│ +        {
│ +          "id": "kiaulpiene",
│ +          "name": "kiaulpienė",
│ +          "stems": 1,
│ +          "woody": false,
│ +          "height": { "start": 25, "min": 10, "max": 40, "step": 5 }
│ +        }
│ +      ],
│ +      "groups": {
│ +        "medis": { "name": "medis", "plural": "medžiai" },
│ +        "krūmas": { "name": "krūmas", "plural": "krūmai" },
│ +        "žolė": { "name": "žolė", "plural": "žolės" }
│ +      },
│ +      "heightBar": { "maxCm": 300, "tickCm": 50 },
│ +      "sentences": {
│ +        "start": "Ąžuoliukas 30 cm. Ar jis jau medis?",
│ +        "guess": "Tu sakei: {label}. Dabar keisk aukštį.",
│ +        "compareMedis": "Tu sakei taip. Jis liko medis.",
│ +        "compareNeMedis": "Tu sakei ne. Jis yra medis.",
│ +        "grow": "Aukštis didesnis, o stiebas tas pats.",
│ +        "one": "Vienas kamienas, todėl medis.",
│ +        "ask2": "Alyva aukštesnė už mažą ąžuoliuką. Ar ji bus medis?",
│ +        "compareAlyvaTaip": "Tu sakei taip. Alyva liko krūmas.",
│ +        "compareAlyvaNe": "Tu sakei ne. Alyva tikrai krūmas.",
│ +        "few": "Keli stiebai, todėl krūmas.",
│ +        "soft": "Minkštas stiebas, todėl žolė.",
│ +        "all": "Trys augalai, trys grupės.",
│ +        "rule": "Grupę rodo stiebas, ne aukštis.",
│ +        "again": "Pradedam iš naujo."
│ +      }
│ +    }
│ +  },
│ +  "tasks": [
│ +    {
│ +      "q": "Sode auga ąžuoliukas, alyva ir kiaulpienė. Kuris jų yra krūmas?",
│ +      "options": ["Ąžuoliukas", "Alyva", "Kiaulpienė"],
│ +      "answer": 1,
│ … omitted 49 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/probe_m10.py
│ @@ -0,0 +1,48 @@
│ +#!/usr/bin/env python3
│ +"""M-10 zondas: ar metodo juodrastis praeina abu vartus.
│ +
│ +Draftas laikinai idedamas i content/lt/grade-01/pasaulio-pazinimas/, nes
│ +validate_content.check_module tikrina ir failo vieta. Po patikros failas
│ +panaikinamas (finally), kad repo liktu svarus.
│ +"""
│ +import json
│ +import pathlib
│ +import shutil
│ +import sys
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +sys.path.insert(0, str(ROOT / "scripts"))
│ +
│ +import validate_content as vc  # noqa: E402
│ +import check_language as cl  # noqa: E402
│ +
│ +DRAFT = pathlib.Path("/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/m10-draft.json")
│ +TARGET = ROOT / "content" / "lt" / "grade-01" / "pasaulio-pazinimas" / "zz-probe-m10.json"
│ +
│ +shutil.copyfile(DRAFT, TARGET)
│ +try:
│ +    data = json.loads(TARGET.read_text(encoding="utf-8"))
│ +    rep = vc.Report()
│ +    vc.check_module(TARGET, data, rep, vc.registered_sims(), {})
│ +    print("validate_content.check_module: klaidos", len(rep.errors), "įspėjimai", len(rep.warnings))
│ +    for e in rep.errors:
│ +        print("  ERR", e)
│ +    for w in rep.warnings:
│ +        print("  WARN", w)
│ +
│ +    issues = []
│ +    cl.check_module(TARGET, issues)
│ +    errs = [i for i in issues if i["severity"] == "error"]
│ +    warns = [i for i in issues if i["severity"] == "warn"]
│ +    infos = [i for i in issues if i["severity"] == "info"]
│ +    print("check_language.check_module: klaidos", len(errs), "įspėjimai", len(warns), "pastabos", len(infos))
│ +    for i in issues:
│ +        print(f"  [{i['severity']}] {i['where']}: {i['issue']} — {i['detail']}")
│ +
│ +    # ilgiai, kuriuos metodas teigia
│ +    print("ilgiai: title", len(data["title"]), "subtitle", len(data["subtitle"]),
│ +          "concept.title", len(data["concept"]["title"]),
│ +          "big_idea", len(data["concept"]["big_idea"]))
│ +finally:
│ +    TARGET.unlink(missing_ok=True)
│ +    print("juodrastis panaikintas:", not TARGET.exists())
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe_m10.py
│ @@ -38,6 +38,8 @@
│      print("check_language.check_module: klaidos", len(errs), "įspėjimai", len(warns), "pastabos", len(infos))
│      for i in issues:
│          print(f"  [{i['severity']}] {i['where']}: {i['issue']} — {i['detail']}")
│ +        if i.get("text"):
│ +            print("        „" + i["text"][:150] + "“")
│
│      # ilgiai, kuriuos metodas teigia
│      print("ilgiai: title", len(data["title"]), "subtitle", len(data["subtitle"]),
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe_m10.py
│ @@ -23,7 +23,8 @@
│  try:
│      data = json.loads(TARGET.read_text(encoding="utf-8"))
│      rep = vc.Report()
│ -    vc.check_module(TARGET, data, rep, vc.registered_sims(), {})
│ +    sims = vc.registered_sims() | {"augalu-grupes"}
│ +    vc.check_module(TARGET, data, rep, sims, {})
│      print("validate_content.check_module: klaidos", len(rep.errors), "įspėjimai", len(rep.warnings))
│      for e in rep.errors:
│          print("  ERR", e)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/m10-draft.json
│ @@ -87,7 +87,7 @@
│        "why": "Alyvos stiebai keli ir sumedėję, tad ji krūmas."
│      },
│      {
│ -      "q": "Žiemą medis ir krūmas neturi lapų. Pagal ką juos atskirsi?",
│ +      "q": "Žiemą medis ir krūmas neturi lapų. Kaip juos atskirsi?",
│        "options": ["Pagal kamieną ir stiebų skaičių", "Pagal augalo aukštį", "Pagal lapų spalvą"],
│        "answer": 0,
│        "hint": "Lapų žiemą nėra. Kas augale lieka visą laiką?",
│ research/wiki/grades/01/metodai.md
│ @@ -747,6 +747,121 @@
│
│  **Pastaba dėl wiki.** `research/wiki/curriculum/pasaulio-pazinimas-1-klase.md:82–88` temų lentelėje 26.3.1 nėra, nors ilgalaikiame plane ji yra su 2 valandomis; lentelė pati tai žymi `[PATIKRINTI]`. Tai tyrėjo failas, šiame darbe neliestas. `agents/scope.py` temų sąraše „Gamtos ištekliai“ taip pat dar nerodoma kaip padengta — tai programos derintojo ir tyrėjo darbas, ne metodo.
│
│ +### M-10 — Medžiai, krūmai, žolės: grupę rodo stiebas, o ne aukštis
│ +
│ +**Data:** 2026-11-16 · **Tema:** `agents/proposals/2026-11-16-ideator-medziai-krumai-zoles.json` (#19399) · **Tikslas:** `content/lt/grade-01/pasaulio-pazinimas/22-medziai-krumai-zoles.json` · **Šaltinis:** [[../../foundations/pozymis-ir-dydis|pozymis-ir-dydis]]
│ +
│ +**Viena didelė idėja.** Augalo grupę pasako jo stiebas: medis turi vieną sumedėjusį kamieną, krūmas — kelis sumedėjusius stiebus nuo žemės, žolė — minkštą stiebą. Aukštis apie grupę nieko nesako: mažas ąžuoliukas jau yra medis, o aukšta alyva tebėra krūmas.
│ +
│ +**Ką sako programa.** 1 klasės gamtos mokslų programoje 26.2.3 formuluotė yra pažodinė: „Mokomasi skirti medžius, krūmus ir žoles, atpažinti artimiausius aplinkos medžius (klevą, ąžuolą, beržą, eglę, pušį ir 3−4 kitus iš savo aplinkos)“ (`sources/pradinio-bp-rekomendacijos-2024.txt:35165–35166`). Ilgalaikiame plane tai 4 valandos tiriamosios veiklos — ekskursija į mokyklos kiemą, parką ar mišką, tyrimas „Medžių lapų tyrimas“ (`:17641–17643`), o metų pabaigos reikalavimas tą patį kartoja: „Skiria medžius, krūmus ir žoles“ (`research/wiki/curriculum/pasaulio-pazinimas-1-klase.md:124`). Platformoje šios temos nėra: paieška „krūm|žol[ėe]|kamien“ visuose 39 moduliuose duoda **0 atvejų** (patikrinta 2026-11-16), o artimiausias modulis `09-augalo-gyvenimas` kalba apie tai, ko augalui reikia, ne apie grupes.
│ +
│ +**Kodėl modelis, o ne paveikslėlis.** Paveikslėlyje augalas turi vieną aukštį, todėl jis negali parodyti to, kas ir yra sąvoka: kad aukštis grupės nekeičia. Net du paveikslai greta to neįrodo — vaikas neturi būdo patikrinti, ar antrame paveiksle augalas tas pats. Modelyje augalas lieka tas pats (jo stiebas neperpiešiamas), keičiasi tik vienas skaičius — aukštis, o grupės etiketė nejuda nė karto. Tada vaikas pereina prie antro augalo ir pamato priešingą porą: aukštesnis augalas, o grupė „žemesnė“. Tai kontrolinis bandymas, kurio paveikslėlis negali duoti, ir jis atliekamas vienu paspaudimu.
│ +
│ +**Ką rodo tyrimai.**
│ +
│ +Gatt, Tunnicliffe, Borg ir Lautier (2007) individualiai kalbino 50 Maltos vaikų (25 — antri ikimokyklinio ugdymo metai, 4 m.; 25 — pirmi privalomojo ugdymo metai, 5 m.) apie augalus. Vaikų sąvoka pasirodė siaura: „augalas“ jiems reiškė **mažą** augalą su **plonu stiebu**, lapais ir žiedu. Medžiai, kaktusai ir dilgėlės į „augalo“ kategoriją nepateko. Tai tiksli tos nuostatos formuluotė, kurią turi griauti modelis: grupę lemia ne stiebo sandara, o **įprastas mažo augalo pavyzdys**.
│ +
│ +Tull (1992) ištyrė devynis šeštos klasės vaikus (11–12 m.) JAV ir klausė, kaip jie skiria medį nuo krūmo. Vaikų kriterijai buvo formos ir dydžio: „A bush is smaller (than a tree), more in a round shape with more leaves“, „Adults are usually taller than bushes. Trees are usually taller than adults“, „If it was a tree, you could definitely see the trunk“. Autoriaus išvada: vaikų kategorijos nesutampa su botanikų, bet sutampa su **liaudies** kategorijomis, o jose aukštis yra vienas iš požymių (per Tull cituojamas Brown, 1984: *tree* — dideli sumedėję augalai, *bush* — „intermediate height“). Tai svarbu dviem būdais: ji patvirtina, kad aukštis yra realus vaiko kriterijus, ir įspėja, kad jis nėra vien vaiko išmislas — ta pati logika gyva ir suaugusiųjų kalboje. Todėl modelis savo taisyklės nepateikia kaip „vienintelės tiesos apie gamtą“ (žr. „Modelio ribos“).
│ +
│ +Tunnicliffe ir Reiss (2000) pateikė 5, 8, 10 ir 14 metų mokiniams šešis augalų pavyzdžius ir klausė, kas jie tokie. Visų amžiaus grupių mokiniai augalus įvardijo ir aiškino daugiausia pagal **anatominius** požymius, o su amžiumi prisidėjo buveinės požymiai. Išvada modeliui: vaikas jau žiūri į augalo sandarą, tad nereikia jo mokyti „žiūrėti į augalą“ — reikia, kad apibrėžiamasis požymis (stiebų skaičius ir kietumas) būtų **ryškesnis už aukštį**, kitaip jis rinksis tai, kas labiau krinta į akis.
│ +
│ +**Klaidingos nuostatos ir kaip jos paneigiamos.**
│ +
│ +1. **„Krūmas yra mažas medis.“** Tai ta pati prototipo taisyklė, kurią fiksuoja Gatt ir kt. (2007) ir Tull (1992). Paneigiama alyva: ji užauginama iki 2,5 m — aukštesnė už mažą ąžuoliuką, — o grupės etiketė lieka „krūmas“, nes stiebai buvo ir lieka keli. Jei grupę lemtų aukštis, etiketė būtų pasikeitusi.
│ +2. **„Žolė yra bet kas žema ir žalia.“** Paneigiama ąžuoliuku: 0,3 m aukščio daigas turi vieną sumedėjusį kamieną, todėl jis medis. Žema ir žalia yra ir jis.
│ +3. **„Aukštis yra geras požymis, nes jį galima pamatuoti.“** Modelis tyčia duoda aukščiui atskirą matuoklį — juostą su padalomis, nes skaičius turi būti matomas sąžiningai (`foundations/dydis-ir-skaiciai.md` analogija). Bet ta juosta niekada neliečia etiketės: ji ilgėja, o grupė nejuda. Paneigiama ne tekstu, o tuo, kad vienintelis kintantis matmuo prie etiketės neprisijungia.
│ +4. **„Grupę rodo lapai ar žiedas.“** Šios nuostatos modelis ekrane nepaneigia ir to neslepia: lapai ir žiedai yra nepastovus požymis (Dougherty 1979 ir Tull 1992 jį vadina *unstable criteria* — žiedas nukrinta, lapai iškrinta). Ji sprendžiama trečia užduotimi apie žiemą ir mokytojo veikla, o ne simuliacija.
│ +
│ +**Tikslas sąmoningai kuklus.** Modulis nemoko atpažinti rūšių: programos gairė tam reikalauja realių nuotraukų, o ne iliustracijų (`research/wiki/curriculum/pasaulio-pazinimas-1-klase.md:140`), todėl klevas, beržas, eglė ir pušis lieka mokytojo ekskursijai su tikrais lapais (T8.3 — veikla be ekrano). Modulis siekia vieno įgūdžio: **pažiūrėti, kiek stiebų kyla iš žemės ir ar jie kieti**, ir tuo pasitikrinti, kai aukštis klaidina.
│ +
│ +**Seka (konkretumas → modelis → simbolis → perkėlimas).**
│ +
│ +1. **Kiemas, trys augalai rankoje.** Mokytojas sustabdo klasę prie medžio, krūmo ir žolės. Vaikai lietimo tvarka atsako į du klausimus: kiek stiebų kyla iš žemės ir ar stiebas kietas. Tikslas: grupės požymis pajuntamas pirštais, o ne įsimenamas iš paveikslėlio. Mokytojas nepasako, kuris augalas „tikrasis“ medis, ir neklausia, kuris aukščiausias.
│ +2. **Ekranas, ąžuoliukas.** Ekrane ąžuoliukas, po juo — 0,3 m žyma ir aukščio juosta. Prieš pirmą judesį spėjimas: „Ąžuoliukas 30 cm. Ar jis jau medis?“ (Taip / Ne). Vaikas augina jį iki 3 m. Etiketė „medis“ lieka, o `api.note` sako: „Tu sakei: taip. Jis liko medis.“ Tikslas: pamatyti, kad aukštis pasikeitė keliolika kartų, o grupė — nulis kartų.
│ +3. **Ekranas, alyva.** Antras augalas, antras spėjimas: „Alyva aukštesnė už mažą ąžuoliuką. Ar ji bus medis?“ Vaikas augina alyvą iki 2,5 m — ji aukštesnė už mažą ąžuoliuką, bet etiketė „krūmas“. `api.note`: „Tu sakei: taip. Alyva liko krūmas.“ Tikslas: paneigti pirmą nuostatą priešinga pora, o ne tuo pačiu pavyzdžiu.
│ +4. **Simbolis, trys kortelės.** Trečias augalas — kiaulpienė (0,25 m, vienas minkštas stiebas). Tada po scena atsiranda trys kortelės su išsaugotais aukščiais: „ąžuoliukas 0,3 m · medis“, „alyva 2,5 m · krūmas“, „kiaulpienė 0,25 m · žolė“ ir vienas sakinys: „Grupę rodo stiebas, ne aukštis.“ Vaikas jį perskaito ir pasako, kuri kortelė jam buvo netikėčiausia. Tikslas: taisyklę įvardyti žodžiu, kai ji jau matyta tris kartus.
│ +5. **Perkėlimas.** Tos pačios taisyklės atvejai be modelio: sode 30 cm ąžuoliukas ir 2 m alyva (kuris medis?); žiema be lapų (pagal ką skirti?); mokyklos kieme aukštas lazdynas. Tikslas: atpažinti, kad požymis lieka ir tada, kai aukštis ar lapai klaidina.
│ +
│ +**Privalomas spėjimo žingsnis prieš pirmą auginimą ir prieš antrą augalą.** Du spėjimai, abu palyginami su įvykiu (LL-15). Spėjimas niekada nevadinamas klaida ir niekada neištrinamas: jis lieka matomas viršuje, o `api.note` tik palygina. Be jo modelis virsta auginimo žaislu: vaikas spaudžia „+“ tol, kol juosta prisipildo, ir sąryšio nepastebi — tas pats pavojus kaip M-01–M-09 (`foundations/sujungti-dydziai.md`). Atsakymo variantų spėjime yra tik du (Taip / Ne), nes spėjimas turi būti apie **vieną** pasikeitimą, o ne apie grupę.
│ +
│ +**Simuliacijos specifikacija.** Komponentas `augalu-grupes`, failas `assets/js/sims/pasaulis.js` (jis jau importuoja `art.js`, o `scripts/check_art.py:31–33` LEGACY sąraše yra tik `matematika.js`). Registracija: `SIMS` sąraše (`assets/js/sims/pasaulis.js:2563–2572`) pridedama eilutė `"augalu-grupes": augaluGrupes,`. `config`:
│ +
│ +```json
│ +{ "plants": [
│ +    { "id": "azuoliukas", "name": "ąžuoliukas", "stems": 1, "woody": true,
│ +      "height": { "start": 30, "min": 30, "max": 300, "step": 10 } },
│ +    { "id": "alyva",     "name": "alyva",     "stems": 3, "woody": true,
│ +      "height": { "start": 120, "min": 40, "max": 250, "step": 10 } },
│ +    { "id": "kiaulpiene", "name": "kiaulpienė", "stems": 1, "woody": false,
│ +      "height": { "start": 25, "min": 10, "max": 40, "step": 5 } } ],
│ +  "groups": {
│ +    "medis":  { "name": "medis",  "plural": "medžiai" },
│ +    "krūmas": { "name": "krūmas", "plural": "krūmai" },
│ +    "žolė":   { "name": "žolė",   "plural": "žolės" } },
│ +  "heightBar": { "maxCm": 300, "tickCm": 50 },
│ +  "sentences": { "start": "…", "guess": "…", "grow": "…", "one": "…", "few": "…",
│ +                 "soft": "…", "all": "…", "rule": "…", "again": "…",
│ +                 "compareMedis": "…", "compareNeMedis": "…",
│ +                 "compareAlyvaTaip": "…", "compareAlyvaNe": "…" } }
│ +```
│ +
│ +**Grupė išvedama, o ne įrašyta.** `config.plants[]` sąmoningai neturi `group` laukelio: etiketė apskaičiuojama `groupOf(p) = p.woody ? (p.stems === 1 ? "medis" : "krūmas") : "žolė"`. Jei `stems` nėra sveikas teigiamas skaičius arba `woody` nėra loginis, komponentas rašo `console.error` ir rodo „Augalai nesuderinti su grupėmis.“, o ne tyliai praleidžia. Tai ta pati taisyklė kaip M-07 (`kiekis = board.px / unit.px`) ir M-09 (grandinė — duomenys): modelio teiginys turi būti išvestas iš tų pačių duomenų, kuriuos mato vaikas.
│ +
│ +| Būsena | Ką vaikas mato | `readout` | `api.note` |
│ +|---|---|---|---|
│ +| pradžia | ąžuoliukas, juosta ties 0,3 m, spėjimo mygtukai aktyvūs, „+“ neaktyvus | „Ąžuoliukas 30 cm. Ar jis jau medis?“ | „Pirma spėk, tada augink.“ |
│ +| spėjimas | spėjimas kortelėje virš scenos, „+“ aktyvus | „Tu sakei: taip. Dabar keisk aukštį.“ | „Spėjimas liks viršuje iki galo.“ |
│ +| ąžuoliukas 1,5 m | juosta ilgesnė, kamienas vienas, etiketė „medis“ | „Ąžuoliukas 1,5 m. Tai medis.“ | „Aukštis didesnis, o stiebas tas pats.“ |
│ +| ąžuoliukas 3 m | juosta iki galo, etiketė ta pati | „Ąžuoliukas 3 m. Tai medis.“ | „Tu sakei: taip. Jis liko medis.“ |
│ +| alyva, spėjimas dar nepasirinktas | alyva, trys stiebai nuo žemės, 1,2 m | „Alyva aukštesnė už mažą ąžuoliuką. Ar ji bus medis?“ | „Pasirink: taip arba ne.“ |
│ +| alyva 2,5 m | juosta ilgesnė už mažo ąžuoliuko, etiketė „krūmas“ | „Alyva 2,5 m. Tai krūmas.“ | „Tu sakei: taip. Alyva liko krūmas.“ |
│ +| kiaulpienė 0,25 m | vienas minkštas stiebas, žiedas | „Kiaulpienė 25 cm. Tai žolė.“ | „Minkštas stiebas, todėl žolė.“ |
│ +| visi trys auginti | trys kortelės su aukščiais ir grupėmis | „Trys augalai, trys grupės.“ | „Grupę rodo stiebas, ne aukštis.“ |
│ +| „Iš naujo“ | pradinė būsena, spėjimai neištrinti, augalų aukščiai atstatyti | „Pradedam iš naujo.“ | „Gali bandyti dar kartą.“ |
│ +
│ +Dešimt savybių, kurių negalima praleisti (kiekviena atitinka pamoką):
│ +
│ +- **Vienas kintamasis:** `height` — dabartinio augalo aukštis centimetrais. Augalo pasirinkimas yra žingsnis, o ne antras kintamasis: keičiant augalą aukštis nekeičiamas tuo pačiu metu, o kiekvienas augalas **atsimena savo paskutinį aukštį** (grįžus atgal būsena grąžinama ta pati, o ne `start` — LL-16 atmaina).
│ … omitted 43 diff line(s) across 1 additional file(s)/section(s)
│ research/wiki/grades/01/metodai.md
│ @@ -769,7 +769,7 @@
│
│  1. **„Krūmas yra mažas medis.“** Tai ta pati prototipo taisyklė, kurią fiksuoja Gatt ir kt. (2007) ir Tull (1992). Paneigiama alyva: ji užauginama iki 2,5 m — aukštesnė už mažą ąžuoliuką, — o grupės etiketė lieka „krūmas“, nes stiebai buvo ir lieka keli. Jei grupę lemtų aukštis, etiketė būtų pasikeitusi.
│  2. **„Žolė yra bet kas žema ir žalia.“** Paneigiama ąžuoliuku: 0,3 m aukščio daigas turi vieną sumedėjusį kamieną, todėl jis medis. Žema ir žalia yra ir jis.
│ -3. **„Aukštis yra geras požymis, nes jį galima pamatuoti.“** Modelis tyčia duoda aukščiui atskirą matuoklį — juostą su padalomis, nes skaičius turi būti matomas sąžiningai (`foundations/dydis-ir-skaiciai.md` analogija). Bet ta juosta niekada neliečia etiketės: ji ilgėja, o grupė nejuda. Paneigiama ne tekstu, o tuo, kad vienintelis kintantis matmuo prie etiketės neprisijungia.
│ +3. **„Aukštis yra geras požymis, nes jį galima pamatuoti.“** Modelis tyčia duoda aukščiui atskirą matuoklį — juostą su padalomis, nes skaičius turi būti matomas sąžiningai (`foundations/dydis-ir-skaicius.md` analogija). Bet ta juosta niekada neliečia etiketės: ji ilgėja, o grupė nejuda. Paneigiama ne tekstu, o tuo, kad vienintelis kintantis matmuo prie etiketės neprisijungia.
│  4. **„Grupę rodo lapai ar žiedas.“** Šios nuostatos modelis ekrane nepaneigia ir to neslepia: lapai ir žiedai yra nepastovus požymis (Dougherty 1979 ir Tull 1992 jį vadina *unstable criteria* — žiedas nukrinta, lapai iškrinta). Ji sprendžiama trečia užduotimi apie žiemą ir mokytojo veikla, o ne simuliacija.
│
│  **Tikslas sąmoningai kuklus.** Modulis nemoko atpažinti rūšių: programos gairė tam reikalauja realių nuotraukų, o ne iliustracijų (`research/wiki/curriculum/pasaulio-pazinimas-1-klase.md:140`), todėl klevas, beržas, eglė ir pušis lieka mokytojo ekskursijai su tikrais lapais (T8.3 — veikla be ekrano). Modulis siekia vieno įgūdžio: **pažiūrėti, kiek stiebų kyla iš žemės ir ar jie kieti**, ir tuo pasitikrinti, kai aukštis klaidina.
│ research/wiki/grades/01/metodai.md
│ @@ -854,7 +854,7 @@
│  4. **Žolė ≠ veja.** Programos terminas „žolės“ reiškia žolinius augalus (kiaulpienė, dobilas), o ne veją. Tai pasakoma mokytojo bloke, nes žodis kasdienėje kalboje turi antrą reikšmę.
│  5. **Rūšių atpažinimas ne šio modelio dalis.** Klevas, ąžuolas, beržas, eglė ir pušis reikalauja realių lapų ar nuotraukų (`pasaulio-pazinimas-1-klase.md:140`), todėl modelis vartoja tik tris augalus, kurių grupė akivaizdi, ir nepretenduoja mokyti rūšių.
│
│ -**Ką tai reiškia modulio autoriui.** `title` — „Medžiai, krūmai, žolės: grupę rodo stiebas“ (42 simboliai iš 42); `subtitle` — „Aukštis klaidina: grupę pasako stiebas“ (38 iš 80); `minutes` — 9; trys `outcomes`: „Skiriu medį, krūmą ir žolę pagal stiebą.“, „Paaiškinu, kodėl aukštas augalas gali būti krūmas.“, „Pasakau, kiek stiebų kyla iš žemės.“; `concept.title` — „Grupę rodo stiebas“ (18 iš 40); `concept.big_idea` — „Medis turi vieną sumedėjusį kamieną. Krūmas turi kelis stiebus nuo žemės. Žolės stiebas minkštas. Aukštis apie grupę nieko nesako.“ (130 iš 240); `concept.steps` — keturi žingsniai iš sekos 2–4; `concept.example` — „Kieme auga mažas ąžuoliukas ir aukšta alyva. Mažesnis augalas yra medis.“; `teacher.goal` / `teacher.prompt` / `teacher.offline` — kaip žemiau; `teacher.misconceptions` — keturios nuostatos iš šio skyriaus (ketvirtoji įrašoma kaip modelio riba, ne kaip klaida); `sim` — `{ "component": "augalu-grupes", "config": { … } }`. Numeris `22-` laisvas (pasaulio pažinime užimti 08, 09, 10, 16, 17, 18, 19, 20; `21-` rezervuotas M-09 pasiūlymui `21-kas-sukure-daikta`, kurio `index.json` dar neturi). Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/index.json` ir `path.json` (kūrėjo arba dizainerio darbas, ne metodo dalis); siūloma vieta kelyje — po `20-kas-gyvas`: ten vaikas jau atskyrė gyvą nuo negyvo, o čia klausiama, kokia tvarka tie gyvieji augalai skirstomi.
│ +**Ką tai reiškia modulio autoriui.** `title` — „Medžiai, krūmai, žolės: grupę rodo stiebas“ (42 simboliai iš 42); `subtitle` — „Aukštis klaidina: grupę pasako stiebas“ (38 iš 80); `minutes` — 9; trys `outcomes`: „Skiriu medį, krūmą ir žolę pagal stiebą.“, „Paaiškinu, kodėl aukštas augalas gali būti krūmas.“, „Pasakau, kiek stiebų kyla iš žemės.“; `concept.title` — „Grupę rodo stiebas“ (18 iš 40); `concept.big_idea` — „Medis turi vieną sumedėjusį kamieną. Krūmas turi kelis stiebus nuo žemės. Žolės stiebas minkštas. Aukštis apie grupę nieko nesako.“ (130 iš 240); `concept.steps` — keturi žingsniai iš sekos 2–4; `concept.example` — „Kieme auga mažas ąžuoliukas ir aukšta alyva. Mažesnis augalas yra medis.“; `teacher.goal` — „Suprasti, kad augalo grupę rodo stiebas, o ne aukštis. Modelis laiko vieną augalą ir keičia tik aukštį, todėl grupės etiketė nejuda.“; `teacher.prompt` — „Kodėl mažas ąžuoliukas yra medis, o aukšta alyva – krūmas?“; `teacher.offline` — „Kieme vaikai liečia tris augalus: medžio kamieną, krūmo stiebus ir žolės stiebą. Kiekvienas pasako, kiek stiebų kyla iš žemės ir ar stiebas kietas.“; `teacher.misconceptions` — keturios nuostatos iš šio skyriaus (ketvirtoji įrašoma kaip modelio riba, ne kaip klaida); `sim` — `{ "component": "augalu-grupes", "config": { … } }`. Numeris `22-` laisvas (pasaulio pažinime užimti 08, 09, 10, 16, 17, 18, 19, 20; `21-` rezervuotas M-09 pasiūlymui `21-kas-sukure-daikta`, kurio `index.json` dar neturi). Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/index.json` ir `path.json` (kūrėjo arba dizainerio darbas, ne metodo dalis); siūloma vieta kelyje — po `20-kas-gyvas`: ten vaikas jau atskyrė gyvą nuo negyvo, o čia klausiama, kokia tvarka tie gyvieji augalai skirstomi.
│
│  **Patikra tikru įrankiu (2026-11-16).** Šio metodo specifikacija surašyta kaip juodraštinis modulis ir paleisti abu vartai: `validate_content.check_module` → **0 klaidų, 0 įspėjimų** (su sąlyga, kad `augalu-grupes` įrašytas registre — kol komponento nėra, validatorius teisingai meta „simuliacija neegzistuoja registre“), `check_language.check_module` → **0 klaidų, 0 įspėjimų, 0 pastabų**. Lauko ilgiai perskaičiuoti, ne apskaičiuoti mintyse: title 42, subtitle 38, concept.title 18, big_idea 130. Vienintelis pataisymas per zondą: klausimas „Pagal ką juos atskirsi?“ davė `neaiškus klausimas`, nes `check_language.py` klausiamųjų žodžių sąraše neturi „pagal ką“; sakinys pakeistas į „Kaip juos atskirsi?“ (prasmė ta pati), o žodyno spraga įrašyta kaip pamoka LL-97, o ne tylėta.
│
│ research/wiki/foundations/pozymis-ir-dydis.md
│ @@ -0,0 +1,52 @@
│ +---
│ +title: "Požymis ir dydis: kodėl grupė nustatoma ne pagal tai, kas didžiausia"
│ +tipas: fundamentai
│ +temos: [klasifikavimas, augalų grupės, dydis, prototipas, klaidingos nuostatos, modeliai]
│ +amzius: "6-7"
│ +atnaujinta: 2026-11-16
│ +saltiniai: 4
│ +---
│ +
│ +# Požymis ir dydis: kodėl grupė nustatoma ne pagal tai, kas didžiausia
│ +
│ +## Pagrindinė idėja
│ +
│ +Kai kategoriją apibrėžia vienas požymis, o vaikas mato kitą, ryškų **dydį**, jis renkasi dydį — ir ne todėl, kad nemoka, o todėl, kad dydis matuojamas iškart, o požymį reikia atpažinti. Tai ta pati struktūra, kuri jau aprašyta trijuose kituose įrašuose: moneta su skaičiumi (`dydis-ir-skaicius`), vienetas matuojant ilgį (`vienetas-ir-skaicius`), judėjimas kaip gyvybės požymis (`gyvybe-ir-judesys`). Augalų grupės atvejis yra ketvirtas, ir jis aiškiausias, nes dydis ir požymis iš tiesų prieštarauja: 30 cm ąžuoliukas yra medis, o 2,5 m alyva — krūmas.
│ +
│ +## Ką rodo tyrimai
│ +
│ +**Prototipas, o ne apibrėžimas.** Gatt, Tunnicliffe, Borg ir Lautier (2007) kalbino 50 Maltos vaikų (4 ir 5 m.). Vaikų sąvoka „augalas“ buvo siaura: **mažas** augalas su **plonu stiebu**, lapais ir žiedu. Medžiai, kaktusai ir dilgėlės į ją nepateko. Vadinasi, vaikas kategoriją nustato pagal panašumą į vieną įprastą pavyzdį, o ne pagal požymį, kuris tą kategoriją apibrėžia.
│ +
│ +**Dydis yra realus kriterijus ir jis neišnyksta.** Tull (1992) klausė devynių šeštos klasės vaikų (11–12 m.), kaip jie skiria medį nuo krūmo. Atsakymai rėmėsi dydžiu ir forma: „A bush is smaller (than a tree), more in a round shape with more leaves“; „Adults are usually taller than bushes. Trees are usually taller than adults“; „If it was a tree, you could definitely see the trunk“. Tai reiškia, kad klaida nėra ikimokyklinė ir „išaugama“: tas pats kriterijus veikia ir vėliau, jei niekas jo nepakeičia.
│ +
│ +**Liaudies kategorija nėra klaida, o kitas žodynas.** Ta pati Tull analizė rodo, kad vaikų kategorijos sutampa su **liaudies** (angl. *folk*) kategorijomis, kurias aprašo Brown (1984): *tree* — dideli sumedėję augalai, *bush* — „intermediate height“, *grerb* — maži nežoliniai augalai. Tull cituoja ir Kempton (1981) bei Rosch ir Mervis (1975): liaudies kategorijos remiasi **prototipu** ir neturi būtinų bei pakankamų sąlygų, todėl „medis“ negali būti apibrėžtas vien „mediena ir vienu aukštu kamienu“. Tai svarbiausia šio įrašo išvada dizainui: modelis, kuris vaikui sako „taip sakyti neteisinga“, paneigia ir jo patirtį, ir kalbą. Modelis turi neigti ne žodį, o **sprendimą pagal dydį ten, kur grupė turi būti nustatyta pagal požymį**.
│ +
│ +**Vaikas jau žiūri į sandarą.** Tunnicliffe ir Reiss (2000) pateikė 5, 8, 10 ir 14 metų mokiniams šešis augalų pavyzdžius. Visų amžiaus grupių mokiniai augalus įvardijo ir aiškino daugiausia pagal **anatominius** požymius (su amžiumi prisidėjo buveinė). Taigi nereikia mokyti „žiūrėti į augalą“ — reikia, kad apibrėžiamasis požymis būtų ryškesnis už dydį, kitaip vaikas rinksis tai, kas labiau krinta į akis.
│ +
│ +## Ką tai reiškia SUPRASK platformai
│ +
│ +1. **Požymis turi būti matomas ir pastovus tame pačiame kadre.** Jei grupę rodo stiebų skaičius, stiebai piešiami vieną kartą ir neperpiešiami nė vienoje būsenoje. Jei jie persibraižo, sakinys „grupė ta pati“ tampa neteisingas.
│ +2. **Dydį reikia duoti atskirai ir matuojamai.** Augalo aukštis modeliuojamas kaip skaičius su vienetu ir juosta, o ne kaip piešinio dydis. Be to vaikas dydį skaito iš paveikslėlio ir negali jo atskirti nuo grupės.
│ +3. **Vaikas turi turėti ką keisti pačiu dydžiu.** Ne paveikslai „prieš / po“, o vienas augalas, kurį vaikas pats padidina tris kartus, ir etiketė, kuri nejuda.
│ +4. **Reikia abiejų priešingų porų.** Viena pora (mažas medis) paneigia tik pusę nuostatos; antra (aukštas krūmas) — kitą. Viena pora be antros palieka vaikui galimybę manyti, kad „šis augalas tiesiog išimtis“.
│ +5. **Modelio ribos įvardijamos, o ne slepiamos.** Tikrame gyvenime pasitaiko keliastiebių medžių ir nupjautų medžių, išleidžiančių kelis stiebus; be to, mokyklos taisyklė yra **praktinė**, o ne gamtos apibrėžimas. Tai pasakoma mokytojui ir, vienu sakiniu, vaikui.
│ +
│ +## Ko šis įrašas nedaro
│ +
│ +Jis neįrodo, kad visi 6–7 m. vaikai klysta dėl augalų grupių: Gatt ir kt. tyrė 4–5 m. vaikus, o Tull — 11–12 m., tad tiksli amžiaus riba tarp jų lieka neišmatuota, ir tai yra atvira prielaida. Tull imtis maža (9 vaikai, vienas miestas, JAV), o kategorijų analizė kokybinė. Brown (1984) apibendrina daugelio kalbų duomenis, bet ne lietuvių. Įrašas nustato tik **mažiausią dizaino sąlygą**: jei modelis moko kategorijos, kurią vaikas linkęs nustatyti pagal dydį, modelyje dydis turi būti keičiamas atskirai, o požymis — matomas ir pastovus.
│ +
│ +## Susieti
│ +
│ +- [[dydis-ir-skaicius]] — dydis ir skaičius monetose: ta pati struktūra, kitas dalykas
│ +- [[vienetas-ir-skaicius]] — tas pats daiktas, kitas vienetas, kitas skaičius
│ +- [[gyvybe-ir-judesys]] — judėjimas kaip gyvybės kriterijus
│ +- [[kognityvine-apkrova]] — kodėl vienas kintamasis, o ne du
│ +- [[simuliacijos-ir-modeliai]] — modelio ribos ir konkretybės nykimas
│ +- [[../grades/01/metodai|1 klasės metodai]] — M-10 „Medžiai, krūmai, žolės: grupę rodo stiebas“
│ +
│ +## Šaltiniai
│ +
│ +1. Gatt, S., Tunnicliffe, S. D., Borg, K., & Lautier, K. (2007). Young Maltese children's ideas about plants. *Journal of Biological Education, 41*(3), 117–122. https://doi.org/10.1080/00219266.2007.9656080 (n = 50, 4 ir 5 m.; santrauka: „something small, with a thin stalk, leaves and a flower. Trees, cacti and nettles were not classified as plants“)
│ +2. Tull, D. (1992). *Social constructivism: Botanical classification schemes of elementary school children* (AERA 1992; ERIC ED357968). https://eric.ed.gov/?id=ED357968 (n = 9, 6 klasė; vaikų citatos apie krūmą ir aukštį; liaudies kategorijos per Brown, 1984; prototipas per Kempton, 1981 ir Rosch & Mervis, 1975)
│ +3. Tunnicliffe, S. D., & Reiss, M. J. (2000). Building a model of the environment: how do children see plants? *Journal of Biological Education, 34*(4), 172–177. https://doi.org/10.1080/00219266.2000.9655714 (5, 8, 10, 14 m.; anatomijos požymiai visose grupėse)
│ +4. NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, Gamtos mokslai, 26.2.3 „Augalai“ (`sources/pradinio-bp-rekomendacijos-2024.txt:35165–35166`)
│ research/wiki/foundations/README.md
│ @@ -14,6 +14,7 @@
│  | [[dydis-ir-skaicius]] | dydis ir kiekis prieš užrašytą vertę, moneta kaip pavyzdys | jei daiktas neša skaičių, modelis parodo jo poveikį atskirai; grafika neprieštarauja taisyklei |
│  | [[vienetas-ir-skaicius]] | ilgis kaip vienetų skaičius; atvirkštinis vieneto dydžio ir skaičiaus ryšys | skaičius rodomas tik su vienetu; daiktas fiksuojamas mechaniškai, keičiamas tik vienetas |
│  | [[gyvybe-ir-judesys]] | judėjimas kaip gyvybės kriterijus; klausimo formuluotė; gyvybė kaip pokytis laike | klausiama „gyvas organizmas“; modelyje yra judantis, bet nekintantis daiktas |
│ +| [[pozymis-ir-dydis]] | kategorija pagal požymį, o ne pagal dydį; prototipas ir liaudies kategorijos | dydis keičiamas atskirai, požymis matomas ir pastovus; abi priešingos poros; ribos įvardijamos |
│  | [[kryptis-ir-ziurovo-pozicija]] | kairė/dešinė kaip kūno, o ne kambario savybė; įsisavinimo tvarka | seka: savo kūnas → veikėjas žiūri ta pačia kryptimi → žiūri į vaiką; žymė sukasi su kūnu |
│  | [[forma-ir-spalva]] | forma kaip tapatybė, spalva kaip įspūdis; spalvos prisirišimas prie daikto | forma fiksuojama mechaniškai, keičiamas tik užpildas; grįžimas į ankstesnę spalvą kaip kontrolė |
│  | [[jausmas-ir-noras]] | jausmo priežastis yra noras, o noro nesimato; emocijų komponentai | įvykis fiksuotas, noras keičiamas; antras veikėjas kaip kontrolė; nieko neklausiama apie vaiko jausmus |
│ agents/proposals/2026-11-16-metodininkas-medziai-krumai-zoles.json
│ @@ -0,0 +1,23 @@
│ +{
│ +  "role": "metodininkas",
│ +  "run_id": 313,
│ +  "created": "2026-11-16T08:10:00+02:00",
│ +  "type": "metodas",
│ +  "title": "M-10 — Medžiai, krūmai, žolės: grupę rodo stiebas, o ne aukštis",
│ +  "body": "Metodas ideatoriaus temai #19399 (26.2.3 „Augalai“). Viena didelė idėja: augalo grupę pasako stiebas — medis turi vieną sumedėjusį kamieną, krūmas kelis stiebus nuo žemės, žolė minkštą stiebą; aukštis apie grupę nieko nesako. Modelis laiko vieną augalą ir leidžia vaikui keisti tik jo aukštį: ąžuoliukas auginamas nuo 0,3 m iki 3 m, o etiketė „medis“ nejuda; alyva auginama iki 2,5 m, o etiketė lieka „krūmas“. Taip gaunamos abi priešingos poros, kurių viena be kitos neįtikina. Du privalomi spėjimai („Ar ąžuoliukas jau medis?“ ir „Ar alyva bus medis?“) palyginami su įvykiu, o ne vadinami klaida. Grupė išvedama iš stiebų skaičiaus ir kietumo, o ne įrašoma konfigūracijoje; aukščio juosta (0–300 cm, 1 px/cm) yra vienintelis dydžio nešėjas, nes trijų augalų negalima parodyti vienu masteliu ir įskaitomai. Užduotys: atpažinimas (kuris krūmas), taikymas (2,5 m alyva), perkėlimas (žiema be lapų), praplėtimas (30 cm ąžuoliukas ir 2 m alyva). Klaidinga nuostata „krūmas yra mažas medis“ fiksuota Gatt ir kt. (2007) ir Tull (1992); Tull taip pat rodo, kad liaudies kategorijos remiasi prototipu, todėl modelis savo taisyklės nepateikia kaip gamtos apibrėžimo ir ribas įvardija. Pilna specifikacija — research/wiki/grades/01/metodai.md, M-10 skyrius; bendresnė įžvalga — research/wiki/foundations/pozymis-ir-dydis.md.",
│ +  "target": "content/lt/grade-01/pasaulio-pazinimas/22-medziai-krumai-zoles.json",
│ +  "priority": "high",
│ +  "status": "new",
│ +  "evidence": [
│ +    "research/wiki/grades/01/metodai.md — M-10 skyrius (seka, simuliacijos būsenos, 4 užduotys, modelio ribos)",
│ +    "research/wiki/foundations/pozymis-ir-dydis.md — bendresnė įžvalga: kategorija pagal požymį, o ne pagal dydį",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:35165–35166 — 26.2.3 „Augalai“ (skirti medžius, krūmus ir žoles)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:17641–17643 — 1 klasės planas: 4 val. tiriamoji veikla, ekskursija, „Medžių lapų tyrimas“",
│ +    "Gatt, S., Tunnicliffe, S. D., Borg, K., & Lautier, K. (2007). Young Maltese children's ideas about plants. Journal of Biological Education, 41(3), 117–122. https://doi.org/10.1080/00219266.2007.9656080",
│ +    "Tull, D. (1992). Social constructivism: Botanical classification schemes of elementary school children (ERIC ED357968). https://eric.ed.gov/?id=ED357968",
│ +    "Tunnicliffe, S. D., & Reiss, M. J. (2000). Building a model of the environment: how do children see plants? Journal of Biological Education, 34(4), 172–177. https://doi.org/10.1080/00219266.2000.9655714",
│ +    "content/lt/grade-01 — paieška „krūm|žol[ėe]|kamien“ visuose 39 moduliuose: 0 atvejų (2026-11-16)",
│ +    "assets/js/sims/pasaulis.js:2563–2572 — SIMS sąrašas, į kurį pridedamas „augalu-grupes“; art.js:177 stem, :231 tree, :283 grass, :131 soil",
│ +    "agents/proposals/2026-11-16-ideator-medziai-krumai-zoles.json — šaltinio pasiūlymas #19399"
│ +  ]
│ +}
│ research/wiki/guidelines/pamokos.md
│ @@ -693,6 +693,13 @@
│  - **Taisyklė:** vartų **numatytasis** režimas turi pagauti tą defektą, dėl kurio vartai sukurti; mėginys leidžiamas tik kaip sąmoningai pasirinktas greitas režimas, ir tada išvestis turi sakyti, kad tai mėginys (LL-37). Jei mėginys negali pagauti pavienio defekto, jis neturi būti numatytasis. Spartos argumentas skaičiuojamas nuo pilnos patikros laiko, o ne nuo mėginio laiko.
│  - **Patikra:** trys bėgimai per tą patį `main()` kelią: (A) veidrodis su 2 sugedusiais mp3, numatytasis režimas → `TRŪKSTA 2`, rc 1; (B) tas pats veidrodis, `--audio-sample 48` → „mėginys, ne visa apimtis“, rc 0 (žinoma riba, įvardyta išvestyje); (C) gyva svetainė, numatytasis režimas → `1138 iš 1138 (visi) — visi pasiekiami`, rc 0, 58,6 s, `verdict` = `sutampa`, versija `d746acd2` = `HEAD`. Prieš taisymą tas pats (A) davė rc 0.
│
│ -
│ -
│ -
│ +## LL-97 — Klausimo žodynas, kuris atmeta taisyklingą klausimą, ir tekstas, kuris dėl to prastėja
│ +
│ +- **Simptomas:** `check_language.py` rašo `neaiškus klausimas — nėra klausiamojo/veiksmo žodžio` užduočiai „Žiemą medis ir krūmas neturi lapų. **Pagal ką** juos atskirsi?“, nors klausimas vienareikšmis ir atsakymo variantai prasideda „Pagal…“. Ankstesnis paleidimas tą patį gavo su „**Iš ko** atsiranda stiklas?“ (`agents/log/metodininkas-2026-11-15T0820.md`): abu kartus autorius pataisė **gerą sakinį**, o ne įrankį.
│ +- **Priežastis:** `check_language.py:266–271` klausiamuosius žodžius tikrina fiksuotu sąrašu (`kiek\w*|kur\w*|kaip\w*|kodėl|kuo|kada|į\s+ką|apie\s+ką|…|kas|ar`). Sąraše yra „į ką“ ir „apie ką“, bet nėra „pagal ką“, „iš ko“, „su kuo“ — tad taisyklingos konstrukcijos, kurių pirmokui reikia („Pagal ką atskirsi?“), patenka į įspėjimą. Kadangi įspėjimas atrodo kaip trūkumas, autorius renkasi silpnesnį sakinį vien tam, kad vartai būtų žali — ir vaikas gauna ne tokį tikslų klausimą.
│ +- **Taisyklė:** kai vartai atmeta taisyklingą formuluotę, pirmiausia tikrinama, ar formuluotė tikrai netaisyklinga; jei taisyklinga — taisomas **įrankis** (sąrašas papildomas žodžių grupėmis „pagal ką“, „iš ko“, „su kuo“, „už ką“), o ne prastesnis tekstas. Jei įrankio keisti šiame darbe negalima, sprendimas įvardijamas sąmoningu („sakinys pakeistas, žodyno spraga užrašyta“), o ne tyliu.
│ +- **Patikra:** prieš keičiant sakinį — paleisti `check_language.check_module` ant to paties juodraščio dviem variantais (originalus ir pakeistas) ir palyginti, ar pasikeitė tik įspėjimas, o ne prasmė; po sąrašo papildymo — tie patys du variantai turi būti be įspėjimų, o esami 39 moduliai — be naujų įspėjimų (`python3 scripts/check_language.py --grade 1`).
│ +
│ +
│ +
│ +
│ research/wiki/guidelines/pilotai.md
│ @@ -180,3 +180,12 @@
│  - **Kaip matuojame:** (1) ar vaikas po kamuoliuko stūmimo savais žodžiais pasako, kad jį pastūmė jis pats, o ne kad kamuoliukas „atsigavo“; (2) ar po abiejų savaičių, kai rodoma lentelė „augalas +2 · akmenukas 0 · kamuoliukas 0“, nurodo augalą kaip vienintelį pasikeitusį daiktą; (3) ar perkėlimo užduotyje (žaislinis automobilis su rakteliu) renkasi augalą, o ne automobilį, ir paaiškina, kas judėjimą sukelia; (4) ar praplėtimo užduotyje (sausas žirnas) nepasako „negyvas, nes nepakito“, o atpažįsta laukimą. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
│  - **Rezultatas:** dar nėra. Metodas ir pasiūlymas įrašyti (`agents/proposals/2026-11-12-metodininkas-kas-gyvas.json`), modulis dar nesukurtas; techninė patikra bus įrašyta jį įgyvendinus.
│  - **Sprendimas:** laukiama duomenų. Jei vaikai ir toliau remiasi judėjimu, stiprinamas kamuoliuko žingsnis (pokyčių lentelė atsiranda iškart po stūmimo, o ne tik po abiejų savaičių), o ne pridedama teksto; jei „savaitė“ 6–7 m. vaikui pasirodo per abstrakti, vietoj jos rodomi du to paties augalo piešiniai su aiškia „prieš / po“ žyma, o palyginimas lieka tas pats; jei trys daiktai 360 px ekrane per smulkūs, akmenukas šalinamas (jis neduoda informacijos, kurios neduotų kamuoliukas) ir lieka du daiktai — augalas ir kamuoliukas.
│ +
│ +### P-020 — Augalų grupė: augalas neperpiešiamas, keičiamas tik aukštis
│ +
│ +- **Data:** 2026-11-16
│ +- **Hipotezė:** jei modelyje augalas lieka tas pats, o vaikas keičia tik jo aukštį, tai 6–7 m. vaikas pamato, kad grupės etiketė nuo aukščio nepriklauso: ąžuoliukas nuo 0,3 m iki 3 m lieka medis, o alyva iki 2,5 m lieka krūmas. Dvi priešingos poros (mažas medis ir aukštas krūmas) reikalingos todėl, kad viena pora paneigia tik pusę nuostatos. Jei prieš kiekvieną auginimą dar prašoma spėjimo, vaikas sąryšį sudaro pats, o ne perskaito jį iš ekrano (P2 — veiksmas prieš paaiškinimą; T2.2 — supratimas naujoje situacijoje; LL-15, LL-28, LL-29; Gatt ir kt., 2007; Tull, 1992).
│ +- **Ką keičiame:** komponentas `augalu-grupes` (būsimas modulis `22-medziai-krumai-zoles`, failas `assets/js/sims/pasaulis.js`, scena iš `art.js` dalių `soil`, `stem`, `leaf`, `flower`, `tree`). Tai pirmas modelis, kuriame **požymis ir dydis išskiriami ne dviem kintamaisiais, o tuo, kad dydis neturi įtakos etiketei**: aukštis keičiamas, o grupė išvedama iš stiebų skaičiaus ir kietumo, todėl etiketė nejuda nė vienoje būsenoje. Antras naujas dalykas — piešinys sąmoningai nekeičiamas keičiant aukštį: 3 m medis ir 20 cm žolė negali būti vieno mastelio įskaitomi tame pačiame kadre, todėl dydį neša atskira juosta su padalomis ir skaičius su vienetu, o modelis tą supaprastinimą pasako, o ne slepia.
│ +- **Kaip matuojame:** (1) ar vaikas po ąžuoliuko auginimo savais žodžiais pasako, kad pasikeitė aukštis, o grupė liko; (2) ar po alyvos auginimo iki 2,5 m nepasako „dabar tai medis“ ir paaiškina stiebais; (3) ar perkėlimo užduotyje apie žiemą renkasi stiebų skaičių, o ne aukštį; (4) ar praplėtimo užduotyje (30 cm ąžuoliukas ir 2 m alyva) nurodo ąžuoliuką kaip medį. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
│ +- **Rezultatas:** dar nėra. Metodas ir pasiūlymas įrašyti (`agents/proposals/2026-11-16-metodininkas-medziai-krumai-zoles.json`), modulis dar nesukurtas. Techninė patikra, kurią galima padaryti be modulio: metodo specifikacija surašyta kaip juodraštinis modulis ir abu vartai praėjo (`validate_content.check_module` 0/0 su registre įrašytu komponentu, `check_language.check_module` 0/0/0).
│ +- **Sprendimas:** laukiama duomenų. Jei vaikai vis tiek sako „aukštas, vadinasi medis“, pirmiausia stiprinamas ne tekstas, o priešingos poros matomumas (alyvos ir mažo ąžuoliuko kortelės rodomos greta ilgiau, kol vaikas pasako skirtumą); jei juosta 360 px ekrane pasirodo per smulki (300 px į 328 px plotį), ji trumpinama iki 0–300 cm su 2 px/cm ir dedama po augalu, o skaičius lieka toks pat; jei trys augalai per sunkiai atskiriami, kiaulpienė šalinama pirmoji (jos grupė akivaizdi), o lieka būtent priešinga pora — mažas ąžuoliukas ir aukšta alyva.
Nepabaigiau viso darbo, bet pagrindinis rezultatas — metodas — diske ir patikrintas.

## Kas padaryta

**Metodas M-10 įrašytas** — `research/wiki/grades/01/metodai.md` (naujas skyrius prieš „Atviros prielaidos“, 121 eilutė).

Tema: `#19399` (high, ideator #312) — 26.2.3 „Augalai“. Viena didelė idėja: grupę pasako stiebas (vienas sumedėjęs kamienas / keli stiebai / minkštas stiebas), o aukštis — ne.

- **Seka 5 žingsniai** su kiekvieno tikslu: kiemas (lietimas) → ąžuoliukas 0,3→3 m → alyva →2,5 m → trys kortelės (simbolis) → perkėlimas.
- **Simuliacija** `augalu-grupes` (`pasaulis.js`): vienas kintamasis `height`, 9 būsenų lentelė su `readout`/`api.note`, 10 privalomų savybių, grupė **išvedama** iš `stems`/`woody` (ne įrašyta konfigūracijoje), aukščio juosta 0–300 cm kaip vienintelis dydžio nešėjas.
- **4 užduotys**: atpažinimas / taikymas / perkėlimas (žiema) / praplėtimas (30 cm ąžuoliukas ir 2 m alyva); atsakymai 1/1/0/0; užuominos nekartoja teisingo varianto.
- **3 nuostatos paneigiamos modeliu**, ketvirtoji (lapai/žiedas) įvardyta kaip sprendžiama užduotimi, o ne simuliacija.
- **Modelio ribos** įvardytos atvirai: piešinys schemiškas (dydį neša juosta), taisyklė praktinė, o ne gamtos apibrėžimas (Tull 1992 — liaudies kategorijos remiasi prototipu), „žolė ≠ veja“.

**Patikra tikru įrankiu.** Specifikacija surašyta kaip juodraštinis modulis ir paleisti abu vartai: `validate_content.check_module` → 0 klaidų, 0 įspėjimų; `check_language.check_module` → 0/0/0 pastabų. Ilgiai perskaičiuoti: title 42, subtitle 38, concept.title 18, big_idea 130. Zondas pagavo vieną realų dalyką: „Pagal ką…?“ atmetamas žodyno, todėl sakinys pakeistas į „Kaip…“, o spraga įrašyta kaip pamoka.

**Kiti failai:**
- `agents/proposals/2026-11-16-metodininkas-medziai-krumai-zoles.json` — `type: metodas`, high, 10 evidence įrašų.
- `research/wiki/foundations/pozymis-ir-dydis.md` — naujas fundamentų įrašas + eilutė `README.md` lentelėje.
- `research/wiki/guidelines/pamokos.md` — **LL-97** (klausimo žodynas atmeta taisyklingą klausimą, o autorius prastina tekstą).
- `research/wiki/guidelines/pilotai.md` — **P-020** (hipotezė, 4 matavimo kriterijai, 3 atsarginiai sprendimai).

**Šaltiniai su DOI, patikrinti Crossref:** Gatt, Tunnicliffe, Borg & Lautier 2007 (10.1080/00219266.2007.9656080), Tunnicliffe & Reiss 2000 (10.1080/00219266.2000.9655714), Tull 1992 (ERIC ED357968, tekstas perskaitytas). Programos citatos patvirtintos: `sources/…:35165–35166` ir `:17641–17643`.

## Ko nepadariau

- **`research/wiki/changelog.md` įrašo nėra.**
- **`agents/state.json` neatnaujintas** (`roles.metodininkas`, `last_method_work`).
- **Ataskaitos `agents/log/metodininkas-2026-11-16*.md` nėra.**
- **Repo vartai nepaleisti** (`validate_content.py --grade 1 --strict`, `check_language.py --grade 1`, `check_agents.py`, `check_lessons.py`, `check_docs_facts.py`) — turinio failų neliečiau, bet tai nepatvirtinta.
- **Commit nepadarytas.** Darbinė kopija turi 6 pakeistus/naujus failus.

## Kitas paleidimas turi pradėti nuo

changelog įrašas (2026-11-16) → `state.json` (`roles.metodininkas.last_run`, `last_method_work` su M-10, target `22-medziai-krumai-zoles.json`, proposal keliu) → ataskaita `agents/log/metodininkas-2026-11-16T0810.md` → vartai → commit.

Juodraštis ir zondas pakartotinei patikrai: `/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/m10-draft.json` ir `probe_m10.py`.

Vienas dalykas, kurį verta žinoti: `22-` numeris laisvas, bet `21-` jau rezervuotas M-09 (`21-kas-sukure-daikta`), kurio modulio ir simuliacijos (`daikto-grandine`) iki šiol nėra — M-09 specifikacija diske, o įgyvendinimo ne.

## klaidos

```
session_id: local-eaf1efe85f8641ce9d299784ed67a59223d50d751d209f19ce1837aad3f84ad5
```
