# programos-derintojas — 2026-11-12T1502

- paleidimas: #250 (manual)
- trukmė: 311s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ agents/proposals/2026-11-12-programos-derintojas-sakinio-tvarka.json
│ @@ -0,0 +1,19 @@
│ +{
│ +  "role": "programos-derintojas",
│ +  "run_id": 250,
│ +  "created": "2026-11-12T15:06:00+02:00",
│ +  "type": "atitiktis",
│ +  "title": "„Sakinio tvarka“ moko taisyklės, kurios lietuvių kalboje nėra, o programoje — ne tos temos",
│ +  "body": "Modulio branduolys „Sakinyje žodžiai eina tam tikra tvarka. Sumaišius juos, sakinys praranda prasmę“ prieštarauja ir programai, ir pačiam moduliui: jo pavyzdys pripažįsta, kad „Pieną katė geria“ suprantama, o pirmoji užduotis tą pačią konstrukciją („Knygą berniukas skaito“) laiko neteisinga. 1–2 klasės programoje sakinys aprašomas ne žodžių eile, o klausimais žodžiams: „Nagrinėjant neilgus spausdintus sakinius, mokomasi kelti sakinio žodžiams klausimus ir suprasti, kad sakinio žodžiai vieni su kitais susiję ir yra derinami tarpusavyje“, o pasiekimai D.3.3.1–D.3.3.4 prašo „rasti žodžius, atsakančius į klausimus kas?, ką veikia?“. Žodžių tvarkos temos šiame dokumente nėra (paieška „žodžių tvarka“ — 0 atvejų), o lietuvių kalboje žodžių eilė yra informacinė, ne gramatinė, todėl dabartinė užduotis moko klaidingos taisyklės ir atitinka LL-18 tipą (neteisingas variantas, kuris gyvenime teisingas). Siūlau perkelti modulį į D.3.3.1–D.3.3.4 ir pakeisti simuliaciją: vaikas ne dėlioja žodžių eilę, o žymi sakinio žodį, atsakantį į „kas?“, paskui į „ką veikia?“. Būtent tokį veiksmą aprašo ir pati rekomendacijų skaitmeninės užduoties instrukcija: „Pirmiausia rask žodį atsakantį į klausimą kas?, po to – ką veikia? Likęs žodis užbaigs sakinį.“ Taip teisingas atsakymas yra vienas ir nepriklauso nuo to, kokia tvarka sakinys perskaitytas.",
│ +  "target": "content/lt/grade-01/lietuviu-kalba/03-sakinio-tvarka.json",
│ +  "priority": "high",
│ +  "status": "new",
│ +  "evidence": [
│ +    "content/lt/grade-01/lietuviu-kalba/03-sakinio-tvarka.json:15 (big_idea: „Sakinyje žodžiai eina tam tikra tvarka. Sumaišius juos, sakinys praranda prasmę.“)",
│ +    "content/lt/grade-01/lietuviu-kalba/03-sakinio-tvarka.json:21 (example: „Pieną katė geria“ — taip pat suprantama) — prieštarauja :15; užduotis :53–61 (answer 0, „Knygą berniukas skaito“ laikoma neteisinga)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:39790–39796 („1-2 klasės. Sakinys. … mokomasi kelti sakinio žodžiams klausimus ir suprasti, kad sakinio žodžiai vieni su kitais susiję ir yra derinami tarpusavyje“)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:39798–39809 (D.3.3.1 „Pagal pavyzdį sakinyje randa žodžius, atsakančius į klausimus kas?, ką veikia?“ … D.3.3.4)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:39815–39822 (skaitmeninės užduoties instrukcija: „Pirmiausia rask žodį atsakantį į klausimą kas?, po to – ką veikia? Likęs žodis užbaigs sakinį.“)",
│ +    "assets/js/sims/calba.js:243 (chosen.join(\" \") === current().join(\" \") — lyginama tiksli žodžių eilė, todėl „Ryte saulė šviečia“ gauna „Dar ne“, nors sakinys taisyklingas)"
│ +  ]
│ +}
│ agents/proposals/2026-11-12-programos-derintojas-plakatas-ir-informacija.json
│ @@ -0,0 +1,20 @@
│ +{
│ +  "role": "programos-derintojas",
│ +  "run_id": 250,
│ +  "created": "2026-11-12T15:06:30+02:00",
│ +  "type": "tema",
│ +  "title": "Skaitymo sritis B be modulio: informacijos paieška plakate (B.1.2 + B.3.1)",
│ +  "body": "Platformoje visi keturi lietuvių kalbos moduliai dengia D sritį (kalbos pažinimą), o skaitymo srities B.1.2 „Skaito savo poreikius ir galimybes atitinkančius tekstus, randa tekste aiškiai pateiktą informaciją“ ir B.3.1 „Remiasi iliustracijomis skaitydamas tekstą“ nedengia nė vienas. Rekomendacijose yra ištisas oficialus 1 klasės veiklos pavyzdys „Mokausi rasti man svarbią informaciją“: vaikai skaito plakatus (saugus eismas, rankų plovimas, rūšiavimas), ieško informacijos ir užrašuose, ir piešiniuose, o klausimai formuluojami kaip paieška — „Kurioje pusėje atšvaitas segamas?“, „Kuri plakato dalis bus svarbi vaikui, norinčiam sužinoti apie atšvaitus?“. Tai paruoštas interaktyvaus modelio scenarijus: ekrane plakatas ir vienas klausimas, o vaikas paspaudžia tą plakato dalį (užrašą ar piešinį), kuri atsako. Modelio vertė — atsakymo negalima žinoti iš atminties: jis turi būti surastas pačiame plakate, todėl paveikslėlis be veiksmo čia netinka. Antra dalis — perkėlimas, kaip ir dokumente: pateikiama situacija („Draugė per gatvę eina su ausinukais. Kuri plakato dalis jai naudinga?“), o vaikas rodo tą pačią vietą kitame kontekste. Sąmoningai neimu veikėjo apibūdinimo (B.2.1.1) į tą patį modulį: tai antra didelė idėja, jai reikėtų atskiro modulio (T1.2).",
│ +  "target": "content/lt/grade-01/lietuviu-kalba/05-plakatas-ir-informacija.json",
│ +  "priority": "high",
│ +  "status": "new",
│ +  "evidence": [
│ +    "content/lt/grade-01/index.json:12–17 (lietuvių kalbos kryptis turi 4 modulius: 01-garsas-ir-raide, 02-skiemenu-jungimas, 03-sakinio-tvarka, 04-kaip-zmones-sveikinasi — visi D srities)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:7604 (B.1.2 „Skaito savo poreikius ir galimybes atitinkančius tekstus, randa tekste aiškiai pateiktą informaciją“)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:7607 (B.3.1 „Remiasi iliustracijomis skaitydamas tekstą“)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:16553 („1-2 klasė. Veikla „Mokausi rasti man svarbią informaciją““ — 1 pav. plakatas apie saugų eismą, 2 pav. apie rankų plovimą, 3 pav. apie rūšiavimą)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:16620–16629 (klausimai: „Kurioje pusėje atšvaitas segamas? Kokiame aukštyje jis turi būti? Kuri plakato dalis bus svarbi vaikui, įsigijusiam dviratį?“)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:16643–16650 (perkėlimo užduotis su situacijų lapeliais: „Mano draugė Agnė mėgsta klausytis muzikos ausinuku… Kuri plakato dalis jai būtų naudinga?“)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:32449 (B.1.2.1 slenkstinis lygis: „Skaito nedidelės apimties tekstus, randa tekste bent dalį aiškiai pateiktos informacijos“ — 1 klasei pakanka dalies informacijos, ne visumos apibendrinimo)"
│ +  ]
│ +}
│ agents/proposals/2026-11-12-programos-derintojas-plakatas-ir-informacija.json
│ @@ -13,8 +13,8 @@
│      "sources/pradinio-bp-rekomendacijos-2024.txt:7604 (B.1.2 „Skaito savo poreikius ir galimybes atitinkančius tekstus, randa tekste aiškiai pateiktą informaciją“)",
│      "sources/pradinio-bp-rekomendacijos-2024.txt:7607 (B.3.1 „Remiasi iliustracijomis skaitydamas tekstą“)",
│      "sources/pradinio-bp-rekomendacijos-2024.txt:16553 („1-2 klasė. Veikla „Mokausi rasti man svarbią informaciją““ — 1 pav. plakatas apie saugų eismą, 2 pav. apie rankų plovimą, 3 pav. apie rūšiavimą)",
│ -    "sources/pradinio-bp-rekomendacijos-2024.txt:16620–16629 (klausimai: „Kurioje pusėje atšvaitas segamas? Kokiame aukštyje jis turi būti? Kuri plakato dalis bus svarbi vaikui, įsigijusiam dviratį?“)",
│ -    "sources/pradinio-bp-rekomendacijos-2024.txt:16643–16650 (perkėlimo užduotis su situacijų lapeliais: „Mano draugė Agnė mėgsta klausytis muzikos ausinuku… Kuri plakato dalis jai būtų naudinga?“)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:16627–16631 (klausimai: „Kuri plakato dalis bus svarbi vaikui, kuris nori sužinoti apie atšvaitus? Kurioje pusėje atšvaitas segamas?“; „Kuri plakato dalis bus svarbi vaikui, įsigijusiam dviratį?“)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:16652–16656 (perkėlimo užduotis su situacijų lapeliais: „Mano draugė Agnė mėgsta klausytis muzikos ausinuku… Kuri plakato dalis jai būtų naudinga?“)",
│      "sources/pradinio-bp-rekomendacijos-2024.txt:32449 (B.1.2.1 slenkstinis lygis: „Skaito nedidelės apimties tekstus, randa tekste bent dalį aiškiai pateiktos informacijos“ — 1 klasei pakanka dalies informacijos, ne visumos apibendrinimo)"
│    ]
│  }
│ agents/proposals/2026-11-12-programos-derintojas-skiemens-sasaja.json
│ @@ -0,0 +1,20 @@
│ +{
│ +  "role": "programos-derintojas",
│ +  "run_id": 250,
│ +  "created": "2026-11-12T15:07:00+02:00",
│ +  "type": "atitiktis",
│ +  "title": "„Skiemenų jungimas“ remiasi pasiekimu, kurio programoje 1–2 klasei nėra",
│ +  "body": "Modulio sources teigia, kad jis remiasi „skaitymo ir teksto suvokimo pasiekimais“, tačiau skiemens kaip 1–2 klasės lietuvių kalbos pasiekimo šiame šaltinyje nėra. Visas 1,8 MB dokumentas žodį su šaknimi „skiem-“ turi lygiai 16 kartų, ir nė vienas atvejis nėra 1–2 klasės lietuvių kalbos pasiekimas: 8 atvejai yra muzikos ritmo turinys, 3 — muzikos integracijos sąsaja (tarp jų :10809 „skiemenys (kirčiuoti ir nekirčiuoti)“), 1 — skaitmeninės priemonės pavadinimas („Žodžių sudarymas iš skiemenų“, :14532), o :17002 yra bendras pradinio ugdymo pažinimo kompetencijos aprašas („Raides jungia, sudaro skiemenis, žodžius, sakinius“), ne konkrečios klasės pasiekimas. 1–2 klasės D.1.3 lygiai eina kita seka — balsiai → priebalsiai → dvibalsiai (:39747–39774), o skiemens ten nėra. Modulio naikinti nesiūlau: skiemeninis skaitymas pagrįstai remia B.1.2 („skaito savo poreikius ir galimybes atitinkančius tekstus“), t.y. skaitymo technikos prielaidą, ne atskirą pasiekimą. Siūlau pataisyti sources ir svietimas1 taip, kad sąsaja eitų per B.1.2 netiesiogiai, o neįrodytą teiginį pažymėti [PATIKRINTI] pilname BP tekste, kurio vietiniame kataloge nėra. Kartu tame pačiame faile yra formuluotės defektas, kurį verta taisyti tuo pačiu metu: antros užduoties abu neteisingi variantai yra to paties tipo (skiemenuotas užrašas), tad skiriasi tik tarpais ir vaikui nesuteikia jokio pasirinkimo.",
│ +  "target": "content/lt/grade-01/lietuviu-kalba/02-skiemenu-jungimas.json",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "content/lt/grade-01/lietuviu-kalba/02-skiemenu-jungimas.json:132–135 (sources: „…skaitymo ir teksto suvokimo pasiekimai, 1–2 kl.“)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt — paieška „skiem“: 16 atvejų (3518, 3522, 3758, 3804, 3807, 3808, 10809, 11354, 13864, 13868, 13890, 14532, 17002, 19885, 25331, 25346), nė vienas nėra 1–2 kl. lietuvių kalbos pasiekimas",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:10809 („Gimtoji kalba … sąsajas ilgieji ir trumpieji garsai, skiemenys (kirčiuoti ir nekirčiuoti; akcentas, stiprioji takto dalis)“ — muzikos integracija)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:14532 („Žodžių sudarymas iš skiemenų“ — skaitmeninės priemonės (Google Play programėlės) pavadinimas sąraše)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:17002 („Rašo dailyraščiu. Raides jungia, sudaro skiemenis, žodžius, sakinius.“ — pažinimo kompetencijos aprašas, ne klasės pasiekimas)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:39747–39774 (D.1.3.1–D.1.3.4: balsiai, priebalsiai, dvibalsiai — skiemens lygmenyje nėra)",
│ +    "content/lt/grade-01/lietuviu-kalba/02-skiemenu-jungimas.json:86–96 (T2 „Kuris variantas yra vientisas žodis?“: neteisingi variantai „mo-kyk-la“ ir „mok- yk - la“ skiriasi tik tarpais)"
│ +  ]
│ +}
│ agents/proposals/2026-11-12-programos-derintojas-skiemens-sasaja.json
│ @@ -4,7 +4,7 @@
│    "created": "2026-11-12T15:07:00+02:00",
│    "type": "atitiktis",
│    "title": "„Skiemenų jungimas“ remiasi pasiekimu, kurio programoje 1–2 klasei nėra",
│ -  "body": "Modulio sources teigia, kad jis remiasi „skaitymo ir teksto suvokimo pasiekimais“, tačiau skiemens kaip 1–2 klasės lietuvių kalbos pasiekimo šiame šaltinyje nėra. Visas 1,8 MB dokumentas žodį su šaknimi „skiem-“ turi lygiai 16 kartų, ir nė vienas atvejis nėra 1–2 klasės lietuvių kalbos pasiekimas: 8 atvejai yra muzikos ritmo turinys, 3 — muzikos integracijos sąsaja (tarp jų :10809 „skiemenys (kirčiuoti ir nekirčiuoti)“), 1 — skaitmeninės priemonės pavadinimas („Žodžių sudarymas iš skiemenų“, :14532), o :17002 yra bendras pradinio ugdymo pažinimo kompetencijos aprašas („Raides jungia, sudaro skiemenis, žodžius, sakinius“), ne konkrečios klasės pasiekimas. 1–2 klasės D.1.3 lygiai eina kita seka — balsiai → priebalsiai → dvibalsiai (:39747–39774), o skiemens ten nėra. Modulio naikinti nesiūlau: skiemeninis skaitymas pagrįstai remia B.1.2 („skaito savo poreikius ir galimybes atitinkančius tekstus“), t.y. skaitymo technikos prielaidą, ne atskirą pasiekimą. Siūlau pataisyti sources ir svietimas1 taip, kad sąsaja eitų per B.1.2 netiesiogiai, o neįrodytą teiginį pažymėti [PATIKRINTI] pilname BP tekste, kurio vietiniame kataloge nėra. Kartu tame pačiame faile yra formuluotės defektas, kurį verta taisyti tuo pačiu metu: antros užduoties abu neteisingi variantai yra to paties tipo (skiemenuotas užrašas), tad skiriasi tik tarpais ir vaikui nesuteikia jokio pasirinkimo.",
│ +  "body": "Modulio sources teigia, kad jis remiasi „skaitymo ir teksto suvokimo pasiekimais“, tačiau skiemens kaip 1–2 klasės lietuvių kalbos pasiekimo šiame šaltinyje nėra. Visas 1,8 MB dokumentas žodį su šaknimi „skiem-“ turi lygiai 16 kartų, ir nė vienas atvejis nėra 1–2 klasės lietuvių kalbos pasiekimas: 13 atvejų yra muzikos turinys (eiluotės ritmas, kūno perkusija, skiemeniniai natų pavadinimai), 1 — muzikos integracijos sąsaja su gimtąja kalba (:10809 „skiemenys (kirčiuoti ir nekirčiuoti)“), 1 — skaitmeninės priemonės pavadinimas („Žodžių sudarymas iš skiemenų“, :14532), o :17002 yra bendras pradinio ugdymo pažinimo kompetencijos aprašas („Raides jungia, sudaro skiemenis, žodžius, sakinius“), ne konkrečios klasės pasiekimas. 1–2 klasės D.1.3 lygiai eina kita seka — balsiai → priebalsiai → dvibalsiai (:39747–39774), o skiemens ten nėra. Modulio naikinti nesiūlau: skiemeninis skaitymas pagrįstai remia B.1.2 („skaito savo poreikius ir galimybes atitinkančius tekstus“), t.y. skaitymo technikos prielaidą, ne atskirą pasiekimą. Siūlau pataisyti sources ir svietimas1 taip, kad sąsaja eitų per B.1.2 netiesiogiai, o neįrodytą teiginį pažymėti [PATIKRINTI] pilname BP tekste, kurio vietiniame kataloge nėra. Kartu tame pačiame faile yra formuluotės defektas, kurį verta taisyti tuo pačiu metu: antros užduoties abu neteisingi variantai yra to paties tipo (skiemenuotas užrašas), tad skiriasi tik tarpais ir vaikui nesuteikia jokio pasirinkimo.",
│    "target": "content/lt/grade-01/lietuviu-kalba/02-skiemenu-jungimas.json",
│    "priority": "normal",
│    "status": "new",
│ research/wiki/curriculum/lietuviu-kalba-1-klase.md
│ @@ -32,7 +32,7 @@
│  1. **Garsas kalbos sraute.** „Skiria lietuvių kalbos garsus kalbos sraute“ (D.1.1, *1–2 klasės pasiekimai*, 2 pavyzdys). Vaikas išmoksta išgirsti garsą žodyje, atskirti kalbos garsus nuo triukšmo, muzikos, gamtos garsų.
│  2. **Garsas ↔ raidė.** Ta pati D.1.1 formuluotė: „užrašo juos atitinkamomis raidėmis; paaiškina, kuo raidė skiriasi nuo garso“. Tai 1 klasės kertinis supratimas, ne tik techninis raidžių atpažinimas.
│  3. **Garsinė žodžio sandara.** „Žinos lietuvių kalbos garsinę sandarą: balsius, priebalsius, dvibalsius“ (*4. Kalbinių gebėjimų ugdymas, 1 lentelė, „Garsas“*).
│ -4. **Skiemuo → žodis.** Dokumente skiemuo minimas tik kaip skaitmeninės priemonės turinys („Žodžių sudarymas iš skiemenų“, *1 lentelė*), o ne kaip atskiras programos reikalavimas. Skiemens kaip **privalomo** 1 klasės turinio elemente statusas — [PATIKRINTI] BP tekste.
│ +4. **Skiemuo → žodis.** Visame rekomendacijų tekste žodis su šaknimi „skiem-“ sutinkamas tik 16 kartų, ir nė vienas atvejis nėra 1–2 klasės lietuvių kalbos pasiekimas: 13 — muzikos turinys (eiluotės ritmas, kūno perkusija, skiemeniniai natų pavadinimai, pvz. :3518, :11354, :25331), 1 — muzikos integracijos su gimtąja kalba sąsaja („skiemenys (kirčiuoti ir nekirčiuoti)“, :10809), 1 — skaitmeninės priemonės pavadinimas („Žodžių sudarymas iš skiemenų“, :14532), 1 — bendras pradinio ugdymo pažinimo kompetencijos aprašas („Raides jungia, sudaro skiemenis, žodžius, sakinius“, :17002). Pasiekimų lygmenyje 1–2 klasė eina kita seka: D.1.3.1 balsiai → D.1.3.3 dvibalsiai (:39747–39774), skiemens lygmens nėra. Skiemens kaip **privalomo** 1 klasės turinio elemento statusas lieka [PATIKRINTI] pilname BP tekste (vietiniame kataloge jo nėra); platformai skiemeninis skaitymas pagrįstas netiesiogiai — kaip B.1.2 skaitymo technikos prielaida.
│  5. **Sakinys → tekstas.** „Iš pradžių derinant žodžius su paveikslėliais, o išmokus rašyti visas raides – reikšti mintis sakiniais“ (*1 lentelė, „Teksto kūrimas“*). Ši formuluotė netiesiogiai patvirtina, kad **visos raidės** įgyjamos būtent 1–2 klasių koncentre.
│
│  ## 3. Skaitymo technika
│ research/wiki/curriculum/lietuviu-kalba-1-klase.md
│ @@ -32,7 +32,7 @@
│  1. **Garsas kalbos sraute.** „Skiria lietuvių kalbos garsus kalbos sraute“ (D.1.1, *1–2 klasės pasiekimai*, 2 pavyzdys). Vaikas išmoksta išgirsti garsą žodyje, atskirti kalbos garsus nuo triukšmo, muzikos, gamtos garsų.
│  2. **Garsas ↔ raidė.** Ta pati D.1.1 formuluotė: „užrašo juos atitinkamomis raidėmis; paaiškina, kuo raidė skiriasi nuo garso“. Tai 1 klasės kertinis supratimas, ne tik techninis raidžių atpažinimas.
│  3. **Garsinė žodžio sandara.** „Žinos lietuvių kalbos garsinę sandarą: balsius, priebalsius, dvibalsius“ (*4. Kalbinių gebėjimų ugdymas, 1 lentelė, „Garsas“*).
│ -4. **Skiemuo → žodis.** Visame rekomendacijų tekste žodis su šaknimi „skiem-“ sutinkamas tik 16 kartų, ir nė vienas atvejis nėra 1–2 klasės lietuvių kalbos pasiekimas: 13 — muzikos turinys (eiluotės ritmas, kūno perkusija, skiemeniniai natų pavadinimai, pvz. :3518, :11354, :25331), 1 — muzikos integracijos su gimtąja kalba sąsaja („skiemenys (kirčiuoti ir nekirčiuoti)“, :10809), 1 — skaitmeninės priemonės pavadinimas („Žodžių sudarymas iš skiemenų“, :14532), 1 — bendras pradinio ugdymo pažinimo kompetencijos aprašas („Raides jungia, sudaro skiemenis, žodžius, sakinius“, :17002). Pasiekimų lygmenyje 1–2 klasė eina kita seka: D.1.3.1 balsiai → D.1.3.3 dvibalsiai (:39747–39774), skiemens lygmens nėra. Skiemens kaip **privalomo** 1 klasės turinio elemento statusas lieka [PATIKRINTI] pilname BP tekste (vietiniame kataloge jo nėra); platformai skiemeninis skaitymas pagrįstas netiesiogiai — kaip B.1.2 skaitymo technikos prielaida.
│ +4. **Skiemuo → žodis.** Visame rekomendacijų tekste žodis su šaknimi „skiem-“ sutinkamas tik 16 kartų, ir nė vienas atvejis nėra 1–2 klasės lietuvių kalbos pasiekimas: 13 — muzikos turinys (eiluotės ritmas, kūno perkusija, skiemeniniai natų pavadinimai, pvz. :3518, :11354, :25331), 1 — muzikos integracijos su gimtąja kalba sąsaja („skiemenys (kirčiuoti ir nekirčiuoti)“, :10809), 1 — skaitmeninės priemonės pavadinimas („Žodžių sudarymas iš skiemenų“, :14532), 1 — bendras pradinio ugdymo pažinimo kompetencijos aprašas („Raides jungia, sudaro skiemenis, žodžius, sakinius“, :17002). Pasiekimų lygmenyje 1–2 klasė eina kita seka: D.1.3.1 balsiai → D.1.3.4 dvibalsiai (:39749–39774), skiemens lygmens nėra. Skiemens kaip **privalomo** 1 klasės turinio elemento statusas lieka [PATIKRINTI] pilname BP tekste (vietiniame kataloge jo nėra); platformai skiemeninis skaitymas pagrįstas netiesiogiai — kaip B.1.2 skaitymo technikos prielaida.
│  5. **Sakinys → tekstas.** „Iš pradžių derinant žodžius su paveikslėliais, o išmokus rašyti visas raides – reikšti mintis sakiniais“ (*1 lentelė, „Teksto kūrimas“*). Ši formuluotė netiesiogiai patvirtina, kad **visos raidės** įgyjamos būtent 1–2 klasių koncentre.
│
│  ## 3. Skaitymo technika
│ agents/proposals/2026-11-12-programos-derintojas-sakinio-tvarka.json
│ @@ -11,7 +11,7 @@
│    "evidence": [
│      "content/lt/grade-01/lietuviu-kalba/03-sakinio-tvarka.json:15 (big_idea: „Sakinyje žodžiai eina tam tikra tvarka. Sumaišius juos, sakinys praranda prasmę.“)",
│      "content/lt/grade-01/lietuviu-kalba/03-sakinio-tvarka.json:21 (example: „Pieną katė geria“ — taip pat suprantama) — prieštarauja :15; užduotis :53–61 (answer 0, „Knygą berniukas skaito“ laikoma neteisinga)",
│ -    "sources/pradinio-bp-rekomendacijos-2024.txt:39790–39796 („1-2 klasės. Sakinys. … mokomasi kelti sakinio žodžiams klausimus ir suprasti, kad sakinio žodžiai vieni su kitais susiję ir yra derinami tarpusavyje“)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:39795–39796 („1-2 klasės. Sakinys. … mokomasi kelti sakinio žodžiams klausimus ir suprasti, kad sakinio žodžiai vieni su kitais susiję ir yra derinami tarpusavyje“)",
│      "sources/pradinio-bp-rekomendacijos-2024.txt:39798–39809 (D.3.3.1 „Pagal pavyzdį sakinyje randa žodžius, atsakančius į klausimus kas?, ką veikia?“ … D.3.3.4)",
│      "sources/pradinio-bp-rekomendacijos-2024.txt:39815–39822 (skaitmeninės užduoties instrukcija: „Pirmiausia rask žodį atsakantį į klausimą kas?, po to – ką veikia? Likęs žodis užbaigs sakinį.“)",
│      "assets/js/sims/calba.js:243 (chosen.join(\" \") === current().join(\" \") — lyginama tiksli žodžių eilė, todėl „Ryte saulė šviečia“ gauna „Dar ne“, nors sakinys taisyklingas)"
│ agents/proposals/2026-11-12-programos-derintojas-skiemens-sasaja.json
│ @@ -14,7 +14,7 @@
│      "sources/pradinio-bp-rekomendacijos-2024.txt:10809 („Gimtoji kalba … sąsajas ilgieji ir trumpieji garsai, skiemenys (kirčiuoti ir nekirčiuoti; akcentas, stiprioji takto dalis)“ — muzikos integracija)",
│      "sources/pradinio-bp-rekomendacijos-2024.txt:14532 („Žodžių sudarymas iš skiemenų“ — skaitmeninės priemonės (Google Play programėlės) pavadinimas sąraše)",
│      "sources/pradinio-bp-rekomendacijos-2024.txt:17002 („Rašo dailyraščiu. Raides jungia, sudaro skiemenis, žodžius, sakinius.“ — pažinimo kompetencijos aprašas, ne klasės pasiekimas)",
│ -    "sources/pradinio-bp-rekomendacijos-2024.txt:39747–39774 (D.1.3.1–D.1.3.4: balsiai, priebalsiai, dvibalsiai — skiemens lygmenyje nėra)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:39749–39774 (D.1.3.1–D.1.3.4: balsiai, priebalsiai, dvibalsiai — skiemens lygmenyje nėra)",
│      "content/lt/grade-01/lietuviu-kalba/02-skiemenu-jungimas.json:86–96 (T2 „Kuris variantas yra vientisas žodis?“: neteisingi variantai „mo-kyk-la“ ir „mok- yk - la“ skiriasi tik tarpais)"
│    ]
│  }
│ research/wiki/curriculum/lietuviu-kalba-1-klase.md
│ @@ -120,6 +120,21 @@
│
│  Susiję: [[matematika-1-klase]] · [[pasaulio-pazinimas-1-klase]] · [[kti-dalykai-1-klase]] · [[1-klases-temų-žemėlapis]]
│
│ +## 9. Modulių atitiktis programai (patikra 2026-11-12, paleidimas #250)
│ +
│ +Tikrinti visi keturi 1 klasės lietuvių kalbos moduliai pagal `sources/pradinio-bp-rekomendacijos-2024.txt`. Eilutės numeriai — šio failo.
│ +
│ +| Modulis | Pasiekimas programoje | Sprendimas |
│ +|---|---|---|
│ +| `01-garsas-ir-raide` | D.1.1 („Skiria lietuvių kalbos garsus kalbos sraute, užrašo juos atitinkamomis raidėmis; paaiškina, kuo raidė skiriasi nuo garso“, :382–386) + oficialus 1 kl. veiklos pavyzdys „Kuo raidė skiriasi nuo garso?“ (:374) | **atitinka** |
│ +| `02-skiemenu-jungimas` | Atskiro pasiekimo nėra; sąsaja tik netiesioginė per B.1.2 (:7604). Skiemuo tekste — muzikos turinys (:3518, :10809, :11354, :25331), skaitmeninės priemonės pavadinimas (:14532), kompetencijos aprašas (:17002) | **iš dalies** — taisyti `sources`/`svietimas1`, žymėti [PATIKRINTI]; modulio nenaikinti |
│ +| `03-sakinio-tvarka` | Modulio branduolys — žodžių eilė, kurios programoje nėra (paieška „žodžių tvarka“ — 0). 1–2 kl. sakinys = klausimai žodžiams ir jų derinimas, D.3.3.1–D.3.3.4 (:39795–39809) | **neatitinka** — siūloma perkelti į D.3.3 ir keisti simuliaciją (žr. `agents/proposals/2026-11-12-programos-derintojas-sakinio-tvarka.json`) |
│ +| `04-kaip-zmones-sveikinasi` | D.5.2 + oficialus 1 kl. veiklos pavyzdys „Kaip žmonės sveikinasi?“ (:317) | **atitinka** |
│ +| *(nėra modulio)* | B.1.2 „randa tekste aiškiai pateiktą informaciją“ (:7604), B.3.1 „Remiasi iliustracijomis skaitydamas tekstą“ (:7607); oficiali veikla „Mokausi rasti man svarbią informaciją“ (:16553) | **spraga** — siūlomas modulis `05-plakatas-ir-informacija` (B sritis platformoje neturi nė vieno modulio; C sritis taip pat) |
│ +
│ +Pastaba: 1–2 kl. D.3.3.1 formuluotė yra „Pagal pavyzdį sakinyje randa žodžius…“, t. y. pirmoje klasėje pakanka paieškos pagal pavyzdį, o savarankiška paieška (D.3.3.2) — jau kitas lygis.
│ +
│ +
│  ## Šaltiniai
│
│  1. **Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos (projektas)**. Nacionalinė švietimo agentūra (NŠA), 2024. 864 p.
│ research/wiki/curriculum/lietuviu-kalba-1-klase.md
│ @@ -118,8 +118,6 @@
│  4. **Grįžtamasis ryšys turi būti momentinis** — dokumentas pabrėžia, kad mokiniai „tuojau pat gauna grįžtamąjį ryšį“ (*skaitymo dalis*).
│  5. **Nerašyti ilgų instrukcijų.** 1 klasės mokinys skaito dar lėtai; instrukciją reikia įgarsinti.
│
│ -Susiję: [[matematika-1-klase]] · [[pasaulio-pazinimas-1-klase]] · [[kti-dalykai-1-klase]] · [[1-klases-temų-žemėlapis]]
│ -
│  ## 9. Modulių atitiktis programai (patikra 2026-11-12, paleidimas #250)
│
│  Tikrinti visi keturi 1 klasės lietuvių kalbos moduliai pagal `sources/pradinio-bp-rekomendacijos-2024.txt`. Eilutės numeriai — šio failo.
│ research/wiki/curriculum/lietuviu-kalba-1-klase.md
│ @@ -132,6 +132,8 @@
│
│  Pastaba: 1–2 kl. D.3.3.1 formuluotė yra „Pagal pavyzdį sakinyje randa žodžius…“, t. y. pirmoje klasėje pakanka paieškos pagal pavyzdį, o savarankiška paieška (D.3.3.2) — jau kitas lygis.
│
│ +Susiję: [[matematika-1-klase]] · [[pasaulio-pazinimas-1-klase]] · [[kti-dalykai-1-klase]] · [[1-klases-temų-žemėlapis]]
│ +
│
│  ## Šaltiniai
│
│ research/wiki/curriculum/lietuviu-kalba-1-klase.md
│ @@ -2,7 +2,7 @@
│  title: "Lietuvių kalba ir literatūra, 1 klasė"
│  tipas: curriculum
│  klase: 1
│ -atnaujinta: 2026-11-03
│ +atnaujinta: 2026-11-12
│  saltinis: "Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos (NŠA, 2024)"
│  ---
│
ATLIKTA: 1 klasės lietuvių kalbos atitikties patikra (paleidimas #250) — užbaigta tai, ką #206 nutraukė ties žingsnių limitu.

PATIKROS REZULTATAS (šaltinis `sources/pradinio-bp-rekomendacijos-2024.txt`, eilutės patikrintos grep'u)

  atitinka
  01-garsas-ir-raide — D.1.1 (:382–386) + oficialus 1 kl. veiklos pavyzdys „Kuo raidė skiriasi nuo garso?“ (:374).
  04-kaip-zmones-sveikinasi — D.5.2 + pavyzdys „Kaip žmonės sveikinasi?“ (:317).

  iš dalies
  02-skiemenu-jungimas — skiemens kaip 1–2 kl. pasiekimo nėra. Visas dokumentas šaknį „skiem-“ turi lygiai 16 kartų: 13 — muzikos turinys, 1 — muzikos integracija (:10809), 1 — skaitmeninės priemonės pavadinimas (:14532), 1 — kompetencijos aprašas (:17002). D.1.3.1–D.1.3.4 eina balsiai → priebalsiai → dvibalsiai (:39749–39774).

  neatitinka
  03-sakinio-tvarka — branduolys „žodžių tvarka keičia prasmę“ programoje neegzistuoja (paieška „žodžių tvarka“ — 0 atvejų) ir prieštarauja paties modulio pavyzdžiui (:21). Programa 1–2 kl. sakinį aprašo klausimais žodžiams: D.3.3.1–D.3.3.4 (:39795–39809). Simuliacija lygina tikslią eilę (`assets/js/sims/calba.js:243`), todėl „Ryte saulė šviečia“ gauna „Dar ne“ — LL-18 tipas.

ĮRAŠYTA
  agents/proposals/2026-11-12-programos-derintojas-sakinio-tvarka.json (atitiktis, high) — perkelti modulį į D.3.3.1–D.3.3.4, simuliaciją keisti į žodžių žymėjimą; cituota ir pati rekomendacijų skaitmeninės užduoties instrukcija (:39815–39822).
  agents/proposals/2026-11-12-programos-derintojas-plakatas-ir-informacija.json (tema, high) — naujas 05-plakatas-ir-informacija pagal B.1.2 + B.3.1 ir oficialią veiklą „Mokausi rasti man svarbią informaciją“ (:16553, klausimai :16627–16631, perkėlimas :16652–16656). B sritis platformoje neturi nė vieno modulio.
  agents/proposals/2026-11-12-programos-derintojas-skiemens-sasaja.json (atitiktis, normal) — taisyti `sources`/`svietimas1`, žymėti [PATIKRINTI]; papildomai T2 abu neteisingi variantai skiriasi tik tarpais (:86–96).
  research/wiki/curriculum/lietuviu-kalba-1-klase.md — §2.4 perrašyta tiksliais skaičiais ir eilutėmis (anksčiau teigta „minimas tik kaip priemonės turinys“ — netikslu), pridėta §9 modulių atitikties lentelė, atnaujinta data.

PATIKRA: `python3 scripts/validate_content.py --grade 1` → 0 klaidų, 0 įspėjimų, exit 0. Neliesti: modulių turinys, assets/, docs/, AGENTS.md.

LIKO NEĮRAŠYTA (nutrūko ties žingsnių limitu — padaryti kitame paleidime)
  agents/log/programos-derintojas-2026-11-12T1505.md — ataskaita (šis tekstas yra jos turinys).
  agents/state.json — `roles.programos-derintojas.last_run` ir `last_curriculum_check` (dabar ten run 22, 2026-11-05, matematika — lietuvių kalbos patikra niekada neužfiksuota).
  Commit nepadarytas; darbinėje kopijoje — 3 nauji pasiūlymų failai ir pakeistas vienas wiki failas.

## klaidos

```
session_id: local-478ce918b8bb987aee688058c4c0e3655cb9bc26abab4b4f683bf51215323e62
```
