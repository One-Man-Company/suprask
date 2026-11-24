# kalbu-redaktorius — 2026-11-24T1337

- paleidimas: #509 (queue)
- trukmė: 1295s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

[atsarginis profilis deepseek41flash]

│ content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
│ @@ -3,7 +3,7 @@
│    "grade": 1,
│    "strand": "pasaulio-pazinimas",
│    "title": "Kas gyvena tvarte?",
│ -  "subtitle": "Naminis ar laukinis — tai pasako maistas, o ne vieta",
│ +  "subtitle": "Naminis ar laukinis — tai parodo maistas, o ne vieta",
│    "minutes": 9,
│    "outcomes": [
│      "Skiriu naminius ir laukinius pagal tai, kas duoda maistą.",
│ content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
│ @@ -12,11 +12,11 @@
│    ],
│    "concept": {
│      "title": "Kas duoda maistą?",
│ -    "big_idea": "Naminis gyvūnas maistą ir pastogę gauna iš žmogaus. Laukinis susiranda pats. Todėl grupę pasako ne vieta, o tai, kas gyvūnu rūpinasi.",
│ +    "big_idea": "Naminis gyvūnas maisto gauna iš žmogaus. Laukinis maisto susiranda pats. Todėl grupę parodo maistas, o ne vieta.",
│      "steps": [
│        "Pasirink gyvūną ir pažiūrėk, kur jis gyvena.",
│        "Atsakyk, kas jam duoda maistą: žmogus ar jis pats.",
│ -      "Paspausk „Žiema“ ir palygink, kas lieka, o kas išeina."
│ +      "Paspausk „Žiema“ ir pažiūrėk, kas pasikeitė."
│      ],
│      "example": "Karvė gyvena tvarte, o šieną jai duoda ūkininkas. Gandras suka lizdą ant tvarto stogo, bet varles gaudo pats. Žiemą jis išskrenda."
│    },
│ content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
│ @@ -74,11 +74,11 @@
│    },
│    "tasks": [
│      {
│ -      "q": "Karvė gyvena tvarte, o gandras ant tvarto stogo. Kuris gyvūnas yra naminis?",
│ +      "q": "Karvė gyvena tvarte. Gandras gyvena ant tvarto stogo. Kuris gyvūnas yra naminis?",
│        "options": [
│          "Gandras, nes jis gyvena ant tvarto",
│          "Karvė, nes jai maistą duoda žmogus",
│ -        "Abu, nes jie gyvena viename kieme"
│ +        "Abu, nes jie gyvena prie to paties tvarto"
│        ],
│        "answer": 1,
│        "hint": "Pagalvok, kas gyvūną šeria kiekvieną dieną.",
│ content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
│ @@ -85,14 +85,14 @@
│        "why": "Karvei maistą duoda žmogus, o gandras varles gaudo pats."
│      },
│      {
│ -      "q": "Žmogus katiną maitina ir juo rūpinasi. Kodėl katinas yra naminis gyvūnas?",
│ +      "q": "Žmogus katiną maitina ir juo rūpinasi. Ar katinas naminis, ar laukinis? Kodėl?",
│        "options": [
│          "Laukinis, nes gyvena lauke",
│          "Naminis, nes jis moka gaudyti peles",
│          "Naminis, nes juo rūpinasi žmogus"
│        ],
│        "answer": 2,
│ -      "hint": "Kodėl žmogus pila jam pieno?",
│ +      "hint": "Pagalvok, kas katinui duoda maisto.",
│        "why": "Katinui maistą duoda žmogus, todėl jis naminis, nors miega lauke."
│      },
│      {
│ content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
│ @@ -96,11 +96,11 @@
│        "why": "Katinui maistą duoda žmogus, todėl jis naminis, nors miega lauke."
│      },
│      {
│ -      "q": "Lapė atbėgo į kiemą pažiūrėti vištų. Ar ji dabar naminė?",
│ +      "q": "Lapė atbėgo į kiemą pas vištas. Ar ji dabar naminė?",
│        "options": [
│          "Taip, nes ji atbėgo į kiemą",
│          "Ne, ji pati susiranda maistą",
│ -        "Taip, nes ji ieško maisto kieme"
│ +        "Taip, nes ji moka gaudyti vištas"
│        ],
│        "answer": 1,
│        "hint": "Lapė tik įbėgo į kiemą. Kas jai duoda maisto?",
│ content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
│ @@ -110,12 +110,12 @@
│        "q": "Žiemą po ledu nebeliko varlių. Kur gandras randa maistą?",
│        "options": [
│          "Skrenda į šiltus kraštus, kur varlių dar yra",
│ -        "Lieka tvarte ir lesa šieną su karve",
│ +        "Žmogus atneša jam maisto į tvartą",
│          "Įminga ir miega iki pavasario"
│        ],
│        "answer": 0,
│        "hint": "Pažiūrėk, ką gandras gaudo vasarą.",
│ -      "why": "Gandras laukinis, todėl maisto ieško kitur. Karvei šieną duoda žmogus."
│ +      "why": "Gandras laukinis, todėl maisto ieško kitur. Karvė lieka, nes jai šieną duoda žmogus."
│      },
│      {
│        "q": "Šuo gyveno prieglaudoje. Ten juo rūpinosi daug žmonių. Paskui jį paėmė viena šeima. Kas šuniui pasikeitė?",
│ content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
│ @@ -118,14 +118,14 @@
│        "why": "Gandras laukinis, todėl maisto ieško kitur. Karvė lieka, nes jai šieną duoda žmogus."
│      },
│      {
│ -      "q": "Šuo gyveno prieglaudoje. Ten juo rūpinosi daug žmonių. Paskui jį paėmė viena šeima. Kas šuniui pasikeitė?",
│ +      "q": "Šuo gyveno prieglaudoje. Prieglauda — tai namai, kur šunys laukia šeimos. Juo rūpinosi daug žmonių. Paskui jį paėmė viena šeima. Kas šuniui pasikeitė?",
│        "options": [
│          "Šuo tapo laukiniu, nes paliko prieglaudą",
│          "Dabar jam nebereikia žmogaus",
│          "Dabar jis turi savo namus ir vieną šeimininką"
│        ],
│        "answer": 2,
│ -      "hint": "Prieglaudoje jau rūpinosi žmonės. Kas visai kitaip?",
│ +      "hint": "Prieglaudoje šunį šėrė žmonės. Ar jis ten buvo laukinis?",
│        "why": "Šuo visą laiką buvo naminis. Dabar jis turi savo namus ir vieną šeimininką.",
│        "optional": true
│      }
│ content/lt/grade-01/index.json
│ @@ -338,7 +338,7 @@
│      {
│       "id": "10-gyvunu-grupes",
│       "title": "Kas gyvena tvarte?",
│ -     "subtitle": "Naminis ar laukinis — tai pasako maistas, o ne vieta",
│ +     "subtitle": "Naminis ar laukinis — tai parodo maistas, o ne vieta",
│       "file": "grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json",
│       "minutes": 9,
│       "sim": "gyvunu-grupes"
│ content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
│ @@ -103,7 +103,7 @@
│          "Taip, nes ji moka gaudyti vištas"
│        ],
│        "answer": 1,
│ -      "hint": "Lapė tik įbėgo į kiemą. Kas jai duoda maisto?",
│ +      "hint": "Lapė tik įbėgo į kiemą. Kas ją šeria?",
│        "why": "Lapė maisto ieško pati, todėl ji laukinė. Kiemas to nekeičia."
│      },
│      {
│ profiles/deepseek41flash/cache/scratch/probe_g

… PRALEISTA 2554 SIMBOLIŲ IŠ 20554 (įrankių išklotinės) — visa ataskaita: agents/work/kalbu-redaktorius/00509/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

 page.wait_for_timeout(300)
│ +        out["after_place_msg"] = page.inner_text("#gg-msg")[:200]
│ +        out["tray_after"] = len(page.query_selector_all("#gg-tray button"))
│ +        # sudėk likusius pagal bin
│ +        cfg = json.load(open("content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json"))
│ +        for a in cfg["sim"]["config"]["animals"][1:]:
│ +            page.click(f'#gg-tray button[aria-label^="{a["label"]}."]')
│ +            page.wait_for_timeout(120)
│ +            page.click(f'#gg-bins button[data-bin="{a["bin"]}"]')
│ +            page.wait_for_timeout(180)
│ +        out["all_placed_msg"] = page.inner_text("#gg-msg")[:200]
│ +        out["winter_hint_after"] = page.inner_text("#gg-winter-hint")
│ +        out["winter_aria_after"] = page.get_attribute("#gg-winter-btn", "aria-disabled")
│ +        page.click("#gg-winter-btn")
│ +        page.wait_for_timeout(400)
│ +        out["winter_note"] = page.inner_text("#gg-winter")[:400]
│ +        out["note_after_winter"] = page.inner_text(".sim-note, #sim-note")[:200] if page.query_selector(".sim-note, #sim-note") else None
│ +
│ +    # užduoties sprendimas: 2-oji užduotis, teisingas variantas
│ +    opts = page.query_selector_all("[data-option], .option, .variantas")
│ +    out["option_nodes"] = len(opts)
│ +    out["errors"] = errors
│ +    b.close()
│ +
│ +print(json.dumps(out, ensure_ascii=False, indent=1))
│ content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
│ @@ -66,7 +66,7 @@
│          "lock": "Pirma sudėk visus gyvūnus. Tada „Žiema“ parodys, kas pasikeis.",
│          "done": "Visi gyvūnai savo vietose.",
│          "rule": "Grupę parodo maistas, o ne vieta.",
│ -        "winter": "Žiema. Pažiūrėk, kas lieka, o kas išeina.",
│ +        "winter": "Žiema. Pažiūrėk, kas pasikeitė.",
│          "summer": "Vasara. Grįžk prie gyvūnų.",
│          "winterNote": "Vieta pasikeitė, o grupė liko ta pati. Karvė vis dar naminė, o gandras — laukinis."
│        }
│ content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
│ @@ -68,7 +68,7 @@
│          "rule": "Grupę parodo maistas, o ne vieta.",
│          "winter": "Žiema. Pažiūrėk, kas pasikeitė.",
│          "summer": "Vasara. Grįžk prie gyvūnų.",
│ -        "winterNote": "Vieta pasikeitė, o grupė liko ta pati. Karvė vis dar naminė, o gandras — laukinis."
│ +        "winterNote": "Atėjo žiema, o grupė liko ta pati. Karvė vis dar naminė, o gandras — laukinis."
│        }
│      }
│    },
│ agents/proposals/2026-11-24-kalbu-redaktorius-sim-kieti-tekstai-12px.json
│ @@ -0,0 +1,18 @@
│ +{
│ +  "role": "kalbu-redaktorius",
│ +  "run_id": 509,
│ +  "created": "2026-11-24T14:10:00+02:00",
│ +  "type": "ux",
│ +  "title": "10-gyvunu-grupes: simuliacijos tekstas 12,8 px ir 4 kietos eilutės, kurių nemato nei kalbos, nei garso vartai",
│ +  "body": "Modulio 10-gyvunu-grupes simuliacijoje mažiausias vaikui rodomas tekstas yra 12,8 px (0,8rem) ir toks pats visuose trijuose plotuose — tai žemiau bet kokios 1 klasei skaitomos ribos, o check_view.py jį rodo kaip pastabą, nes docs/ standarte sim teksto minimumo dar nėra (#44331). Be to, dalis šio modulio sim teksto gyvena ne sim.config, o kode: „Pirma pasirink gyvūną.“ (pasaulis.js:795), „Paspausk „Žiema“ ir pažiūrėk, kas pasikeis.“ (816), „Ne šitaip. …“ (839) ir „Paaiškės, kai visi gyvūnai bus savo vietose.“ (892). Todėl jų nemato scripts/check_language.py (jis tikrina tik sim.config) ir scripts/generate_audio.py (jis renka sim.config) — vaikas jų negirdi, o sakinio ilgio vartai jų netikrina. Siūloma: šias eilutes perkelti į sim.config.sentences (nauji raktai, pvz. pickFirst, hintLocked, wrongBin, hintWaiting), o #gg-winter-hint dydį kelti bent iki 0,95rem — taip pats mažiausias sim tekstas sutaptų su užduočių tekstu, o tekstas taptų ir tariamas, ir tikrinamas.",
│ +  "target": "assets/js/sims/pasaulis.js",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "assets/js/sims/pasaulis.js:716 — <p id=\"gg-winter-hint\" style=\"…font-size:.8rem…\"> (12,8 px 16 px šaknyje)",
│ +    "assets/js/sims/pasaulis.js:795, 816, 839, 892 — vaikui rodomi sakiniai įrašyti kode, ne sim.config",
│ +    "python3 scripts/check_view.py --base http://127.0.0.1:8972/ --module 10-gyvunu-grupes --viewports desktop,tablet,phone → sim_fonts.min = 12.8 visuose trijuose plotuose (worst: p „Paaiškės, kai visi gyvūnai bus s“)",
│ +    "scripts/check_language.py:check_sim_config() — tikrina tik sim.config; scripts/generate_audio.py:collect() — renka tik sim.config",
│ +    "docs/KURINIO-STANDARTAS.md — sim teksto minimumo nėra (atviras #44331)"
│ +  ]
│ +}
│ agents/proposals/2026-11-24-kalbu-redaktorius-teacher-pastoges-kriterijus.json
│ @@ -0,0 +1,18 @@
│ +{
│ +  "role": "kalbu-redaktorius",
│ +  "run_id": 509,
│ +  "created": "2026-11-24T14:12:00+02:00",
│ +  "type": "kritika",
│ +  "title": "10-gyvunu-grupes: suaugusiojo blokas tebemoko pastogės kriterijaus, kurį modelis pats paneigia",
│ +  "body": "Šiame paleidime vaikui skaitoma didžioji idėja susiaurinta iki vieno kriterijaus — maisto („Naminis gyvūnas maisto gauna iš žmogaus… Todėl grupę parodo maistas, o ne vieta.“), nes pastogė modelyje neveikia: gandras suka lizdą ant žmogaus tvarto stogo, tad turi žmogaus pastogę, ir vis tiek yra laukinis, o katė miega kieme. Tačiau teacher.goal vis dar sako „sąvoką „naminis“ sieti su žmogaus duodamu maistu ir pastoge“ — mokytojas, kuris laikosi šios instrukcijos, vaikui duoda taisyklę, kurią pritaikęs vaikas gandą priskirtų naminiams ir simuliacija tą priskyrimą atmestų. Siūloma teacher.goal perrašyti taip pat, kaip vaikui skaitomą dalį (kriterijus — kas duoda maistą), o pastogę minėti tik kaip augintinio poreikį, ne kaip grupės požymį. Tas pats blokas galėtų pataisyti ir katės `trait` („žmogus jai pila pieno“) — pienas nėra tinkamas katinų maistas, tad modelio pavyzdys moko netikslaus fakto; saugiau „žmogus jai duoda maisto“.",
│ +  "target": "content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json:135 — teacher.goal „…sieti su žmogaus duodamu maistu ir pastoge“",
│ +    "content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json:47 — gandras „ant tvarto stogo“, bin „laukinis“ (žmogaus pastogė, laukinis gyvūnas)",
│ +    "content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json:15 — nauja big_idea (maistas, ne pastogė)",
│ +    "content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json:38 — katė „žmogus jai pila pieno“",
│ +    "research/wiki/guidelines/pamokos.md — LL-179 (kriterijus, kurį paneigia pats modelis)"
│ +  ]
│ +}
Modulis `10-gyvunu-grupes` — darbas baigtas; visi vartai žali.

KĄ PAKEIČIAU (prieš → po)

    vieta                      | prieš                                                            | po
    subtitle (+index.json)     | …tai pasako maistas, o ne vieta                                  | …tai parodo maistas, o ne vieta
    concept.big_idea           | maistą ir pastogę gauna… Laukinis susiranda pats. Todėl grupę    | maisto gauna iš žmogaus. Laukinis maisto susiranda pats.
                               | pasako ne vieta, o tai, kas gyvūnu rūpinasi.                     | Todėl grupę parodo maistas, o ne vieta.
    concept.steps[2]           | Paspausk „Žiema“ ir palygink, kas lieka, o kas išeina.            | …ir pažiūrėk, kas pasikeitė.
    tasks[1].q                 | Karvė gyvena tvarte, o gandras ant tvarto stogo.                  | Karvė gyvena tvarte. Gandras gyvena ant tvarto stogo.
    tasks[1].options[2]        | Abu, nes jie gyvena viename kieme                                 | Abu, nes jie gyvena prie to paties tvarto
    tasks[2].q                 | Kodėl katinas yra naminis gyvūnas?                                | Ar katinas naminis, ar laukinis? Kodėl?
    tasks[2].hint              | Kodėl žmogus pila jam pieno?                                      | Pagalvok, kas katinui duoda maisto.
    tasks[3].q                 | …į kiemą pažiūrėti vištų                                           | …į kiemą pas vištas
    tasks[3].options[2]        | Taip, nes ji ieško maisto kieme                                   | Taip, nes ji moka gaudyti vištas
    tasks[3].hint              | Kas jai duoda maisto?                                             | Kas ją šeria?
    tasks[4].options[1]        | Lieka tvarte ir lesa šieną su karve                               | Žmogus atneša jam maisto į tvartą
    tasks[4].why               | Karvei šieną duoda žmogus.                                        | Karvė lieka, nes jai šieną duoda žmogus.
    tasks[5].q                 | Šuo gyveno prieglaudoje. Ten juo rūpinosi…                        | + Prieglauda — tai namai, kur šunys laukia šeimos.
    tasks[5].hint              | …Kas visai kitaip?                                                | …Ar jis ten buvo laukinis?
    sim.sentences.winter       | Žiema. Pažiūrėk, kas lieka, o kas išeina.                          | Žiema. Pažiūrėk, kas pasikeitė.
    sim.sentences.winterNote   | Vieta pasikeitė, o grupė liko ta pati.                            | Atėjo žiema, o grupė liko ta pati.

Esminiai — ne stiliaus — pataisymai trys:
- big_idea mokė dviejų kriterijų (maistas + pastogė), o modelio gandras turi žmogaus pastogę (lizdas ant tvarto stogo) ir yra laukinis. Vaikas, taikęs duotą taisyklę, gaudavo sim klaidą. Liko vienas kriterijus — maistas (dabar sutampa su `sim.config.sentences.rule`).
- „kas lieka, o kas išeina“ netiko 2 iš 6 atvejų (ežys įminga, lapė ateina arčiau) — pakeista į „kas pasikeitė“ ir tekstuose, ir sim sakinyje.
- tasks[3] variantai 0 ir 2 buvo ta pati mintis (vieta); dabar 0 — vieta, 2 — įgūdis, 1 — kriterijus.

SKAIČIAI
- check_language.py --grade 1: klaidos 0 → 0, įspėjimai 0 → 0 (modulyje 0 įrašų ir prieš, ir po — visi 16 radinių buvo žmogaus akių lauke, LL-52/LL-53 šeima). Žmogaus akių radiniai 16 → 0.
- validate_content.py (ir --grade 1): 0 klaidų, 0 įspėjimų. Naujas LL-22 įspėjimas, atsiradęs po variantų pakeitimo („maisto“ liko tik teisingame variante), buvo pagautas ir pašalintas perrašius užuominą.
- check_view.py (390/1024/1440, Brave skydų imitacija; prieš ir po vienodai): overflow 0 / 0 / 0, smallCount 0 / 0 / 0, minTaskFont 21,44 / 21,44 / 19,14 px, tasksVisible 5/5, clipped [], problems [].
- check_audio.py: 1112 tekstų / 2224 įrašų — skaičiai nepakito; 2 pakeisti sakiniai pergeneruoti lokaliu Piper balsu (4 mp3), 4 našlaičiai pašalinti.
- Kiti CI vartai: check_registry, check_published --path-order, check_refs, check_docs_facts, check_lessons (179 pamokos), curriculum_backlog --check, check_agents — visi 0 problemų.

KO SĄMONINGAI NEKEIČIAU
- title „Kas gyvena tvarte?“ — kabliukas; keitimas reikalautų index.json ir maršruto antraščių.
- sim.sentences.wrong („Pažiūrėk ne į vietą, o į tai, kas duoda maistą.“) — kontrastinis, ne dvigubas neiginys; 8 žodžiai; perrašymas būtų stilius, ne defektas.
- concept.example „ūkininkas“ — konkretus, pažįstamas žodis, ne vertinys.
- teacher.* — suaugusiojo tekstas; teacher.goal tebemoko pastogės kriterijaus, todėl tai atskiras pasiūlymas, ne savavališkas keitimas.
- answer indeksai ir variantų tvarka (tasks[1..5]) — neliesti nė viename; joks atsakymas nepasikeitė.

PASIŪLYMAI / PAMOKA
- agents/proposals/2026-11-24-kalbu-redaktorius-sim-kieti-tekstai-12px.json — sim tekstas 12,8 px visuose plotuose ir 4 sakiniai, įrašyti kode (pasaulis.js:795/816/839/892), kurių nemato nei check_language, nei generate_audio.
- agents/proposals/2026-11-24-kalbu-redaktorius-teacher-pastoges-kriterijus.json — teacher.goal prieštarauja naujam kriterijui ir modeliui.
- research/wiki/guidelines/pamokos.md — nauja LL-179 „Kriterijus, kurį paneigia pats modelis“.
- research/wiki/guidelines/kalbos-auditas.md — pridėta paleidimo #509 lentelė su skaičiais.

Eilėje esančių pasiūlymų šiame paleidime neįgyvendinau (nė vienas netaikė šiam moduliui). Serveris 127.0.0.1:8972 sustabdytas; commit/push — bėgiklio.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-37c2c00a66fa939fb8a5b058e91e0b9b4be18605196a881b9137043196130e96
```
