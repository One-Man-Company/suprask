# kalbu-redaktorius — 2026-11-20T1312

- paleidimas: #405 (queue)
- trukmė: 1115s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:education41-gemini

## Ataskaita

│ content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
│ @@ -12,7 +12,7 @@
│    ],
│    "concept": {
│      "title": "Kas duoda maistą?",
│ -    "big_idea": "Naminis gyvūnas maistą ir pastogę gauna iš žmogaus. Laukinis susiranda pats. Todėl grupę pasako ne vieta, o tai, kas juo rūpinasi.",
│ +    "big_idea": "Naminis gyvūnas maistą ir pastogę gauna iš žmogaus. Laukinis susiranda pats. Todėl grupę pasako ne vieta, o tai, kas gyvūnu rūpinasi.",
│      "steps": [
│        "Pasirink gyvūną ir pažiūrėk, kur jis gyvena.",
│        "Atsakyk, kas jam duoda maistą: žmogus ar jis pats.",
│ content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
│ @@ -34,7 +34,7 @@
│            "winter": "Lieka tvarte. Šieną atneša žmogus."
│          },
│          {
│ -          "label": "Katė", "emoji": "🐈", "place": "kieme po namu", "bin": "naminis",
│ +          "label": "Katė", "emoji": "🐈", "place": "kieme prie namo", "bin": "naminis",
│            "trait": "žmogus jai pila pieno",
│            "winter": "Lieka prie namo. Pieną duoda žmogus."
│          },
│ content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
│ @@ -74,25 +74,25 @@
│    },
│    "tasks": [
│      {
│ -      "q": "Gandras susisuko lizdą ant tvarto stogo. Kuris gyvūnas yra naminis?",
│ +      "q": "Karvė gyvena tvarte, o gandras ant tvarto stogo. Kuris gyvūnas yra naminis?",
│        "options": [
│ -        "Gandras, nes jis gyvena prie tvarto",
│ +        "Gandras, nes jis gyvena ant tvarto",
│          "Karvė, nes jai maistą duoda žmogus",
│          "Abu, nes jie gyvena viename kieme"
│        ],
│        "answer": 1,
│ -      "hint": "Kas rūpinasi gyvūnu kasdien: pats gyvūnas ar kas kitas?",
│ +      "hint": "Pagalvok, kas gyvūną šeria kiekvieną dieną.",
│        "why": "Karvei maistą duoda žmogus, o gandras varles gaudo pats."
│      },
│      {
│ -      "q": "Katinas miega kieme po namu. Žmogus jam pila pieno. Katinas yra…",
│ +      "q": "Katinas miega kieme prie namo. Žmogus jam pila pieno. Kuris paaiškinimas apie katiną teisingas?",
│        "options": [
│          "Laukinis, nes gyvena lauke",
│          "Naminis, nes jis moka gaudyti peles",
│          "Naminis, nes juo rūpinasi žmogus"
│        ],
│        "answer": 2,
│ -      "hint": "Kodėl tas žmogus neša jam pieną?",
│ +      "hint": "Kodėl žmogus pila jam pieno?",
│        "why": "Katinui maistą duoda žmogus, todėl jis naminis, nors miega lauke."
│      },
│      {
│ @@ -100,10 +100,10 @@
│        "options": [
│          "Taip, nes ji atbėgo į kiemą",
│          "Ne, ji pati susiranda maistą",
│ -        "Taip, nes ji gyvena prie namo"
│ +        "Taip, nes ji ieško maisto kieme"
│        ],
│        "answer": 1,
│ -      "hint": "Kiemas dar ne namai. Iš kur lapė gauna ėdalo?",
│ +      "hint": "Lapė tik įbėgo į kiemą. Kas jai duoda maisto?",
│        "why": "Lapė maisto ieško pati, todėl ji laukinė. Kiemas to nekeičia."
│      },
│      {
│ @@ -114,15 +114,15 @@
│          "Karvei maistą duoda žmogus, o gandrui — niekas"
│        ],
│        "answer": 2,
│ -      "hint": "Kas žiemą atneša šieno, o kas turi skristi jo ieškoti?",
│ +      "hint": "Pagalvok, iš kur žiemą maisto gauna karvė ir gandras.",
│        "why": "Naminį gyvūną žmogus šeria ir žiemą. Laukinis maisto ieško pats."
│      },
│      {
│        "q": "Šuo ilgai gyveno prieglaudoje, o paskui rado naujus namus. Kas jam pasikeitė?",
│        "options": [
│          "Atsirado žmogus, kuris duoda maisto ir rūpinasi",
│ -        "Jis tapo laukiniu",
│ -        "Jis išmoko pats susirasti maisto"
│ +        "Šuo tapo laukiniu gyvūnu",
│ +        "Šuo išmoko pats susirasti maisto"
│        ],
│        "answer": 0,
│        "hint": "Ko šuniui labiausiai trūko, kol jis laukė naujų namų?",
│ agents/proposals/2026-11-20-kalbu-redaktorius-gyvunu-grupes-uzduociu-faktai.json
│ @@ -0,0 +1,16 @@
│ +{
│ +  "role": "kalbu-redaktorius",
│ +  "run_id": 405,
│ +  "created": "2026-11-20T12:00:00+02:00",
│ +  "type": "kritika",
│ +  "title": "10-gyvunu-grupes: prieglaudos užduoties atsakymas ir faktas apie karvės skraidymą",
│ +  "body": "Modulyje 10-gyvunu-grupes penktoje užduotyje klausiama: „Šuo ilgai gyveno prieglaudoje, o paskui rado naujus namus. Kas jam pasikeitė?“ Teisingas atsakymas yra „Atsirado žmogus, kuris duoda maisto ir rūpinasi“. Tačiau gyvūnų prieglaudoje šunį taip pat šeria ir juo rūpinasi darbuotojai ar savanoriai, todėl 6–7 metų vaikas gali pagrįstai suabejoti tokiu atsakymu (užduoties situacija labiau tiktų benamiam šuniui be šeimininko arba atsakymui apie nuolatinius namus ir pastovų šeimininką). Be to, ketvirtoje užduotyje neteisingas variantas „Karvė nemoka skraidyti“ yra gyvenime teisingas faktas (LL-18) — tai viena iš realių priežasčių, kodėl karvė neišskrenda žiemą, todėl vaikui sunku atmesti teiginį, kuris pats savaime yra tiesa.",
│ +  "target": "content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json:112 — tasks[3].options[0] „Karvė nemoka skraidyti“ (gyvenime teisingas teiginys, LL-18)",
│ +    "content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json:121–128 — tasks[4] „Šuo ilgai gyveno prieglaudoje…“ / „Atsirado žmogus, kuris duoda maisto ir rūpinasi“ (prieglaudoje gyvūną taip pat šeria žmonės)",
│ +    "research/wiki/guidelines/pamokos.md — LL-18 „Klaidingas variantas, kuris gyvenime teisingas“"
│ +  ]
│ +}
│ content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
│ @@ -114,7 +114,7 @@
│          "Karvei maistą duoda žmogus, o gandrui — niekas"
│        ],
│        "answer": 2,
│ -      "hint": "Pagalvok, iš kur žiemą maisto gauna karvė ir gandras.",
│ +      "hint": "Šieną žiemą atneša ūkininkas. O kur tada dingsta varlės?",
│        "why": "Naminį gyvūną žmogus šeria ir žiemą. Laukinis maisto ieško pats."
│      },
│      {
Atlikti kalbos ir aiškumo taisymai modulyje content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json bei pateiktas pasiūlymas agents/proposals/2026-11-20-kalbu-redaktorius-gyvunu-grupes-uzduociu-faktai.json.

Pakeistos formuluotės (prieš -> po)

1. concept.big_idea
   Prieš: „Naminis gyvūnas maistą ir pastogę gauna iš žmogaus. Laukinis susiranda pats. Todėl grupę pasako ne vieta, o tai, kas juo rūpinasi.“
   Po: „Naminis gyvūnas maistą ir pastogę gauna iš žmogaus. Laukinis susiranda pats. Todėl grupę pasako ne vieta, o tai, kas gyvūnu rūpinasi.“
   Priežastis: įvardis „juo“ ėjo iš karto po „Laukinis susiranda pats“, tad nebuvo aišku, į ką rodo.

2. sim.config.animals[1].place (Katė)
   Prieš: „kieme po namu“
   Po: „kieme prie namo“
   Priežastis: „po namu“ lietuviškai reiškia po pamatais/apačia, o winter ir kiti modulio laukai kalba apie vietą „prie namo“. Laukas place garsui nerenkamas, todėl garsas nepakito.

3. tasks[0].q ir tasks[0].options[0]
   Prieš q: „Gandras susisuko lizdą ant tvarto stogo. Kuris gyvūnas yra naminis?“
   Po q: „Karvė gyvena tvarte, o gandras ant tvarto stogo. Kuris gyvūnas yra naminis?“
   Prieš options[0]: „Gandras, nes jis gyvena prie tvarto“
   Po options[0]: „Gandras, nes jis gyvena ant tvarto“
   Priežastis: sąlygoje buvo minimas tik gandras, o variantuose atsirado karvė ir „Abu, nes jie gyvena viename kieme“ — trūko antrojo gyvūno.

4. tasks[0].hint
   Prieš: „Kas rūpinasi gyvūnu kasdien: pats gyvūnas ar kas kitas?“
   Po: „Pagalvok, kas gyvūną šeria kiekvieną dieną.“
   Priežastis: „gyvūnu … pats gyvūnas“ kartojo tą patį žodį ir buvo griozdiška konstrukcija pirmokui.

5. tasks[1].q ir tasks[1].hint
   Prieš q: „Katinas miega kieme po namu. Žmogus jam pila pieno. Katinas yra…“
   Po q: „Katinas miega kieme prie namo. Žmogus jam pila pieno. Kuris paaiškinimas apie katiną teisingas?“
   Prieš hint: „Kodėl tas žmogus neša jam pieną?“
   Po hint: „Kodėl žmogus pila jam pieno?“
   Priežastis: „kieme po namu“ pataisyta į „kieme prie namo“; užbaigiamasis sakinys be klausiamojo žodžio pakeistas į tikrą klausimą su „Kuris“; užuominoje suvienodintas veiksmas („pila pieno“, be „tas žmogus“).

6. tasks[2].options[2] ir tasks[2].hint
   Prieš options[2]: „Taip, nes ji gyvena prie namo“
   Po options[2]: „Taip, nes ji ieško maisto kieme“
   Prieš hint: „Kiemas dar ne namai. Iš kur lapė gauna ėdalo?“
   Po hint: „Lapė tik įbėgo į kiemą. Kas jai duoda maisto?“
   Priežastis: sąlygoje lapė tik atbėgo į kiemą, ji negyvena prie namo, be to, senasis variantas dubliavo options[0] (vietos klaidą); užuominoje vienkartinis žodis „ėdalo“ suvienodintas su visame modulyje vartojamu „maisto“.

7. tasks[3].hint
   Prieš: „Kas žiemą atneša šieno, o kas turi skristi jo ieškoti?“
   Po: „Šieną žiemą atneša ūkininkas. O kur tada dingsta varlės?“
   Priežastis: įvardis „jo“ gramatiškai rodė į „šieno“ (išėjo, kad gandras skrenda ieškoti šieno). Nauja užuomina nenaudoja teisingo varianto žodžių (LL-22).

8. tasks[4].options[1] ir tasks[4].options[2]
   Prieš: „Jis tapo laukiniu“ / „Jis išmoko pats susirasti maisto“
   Po: „Šuo tapo laukiniu gyvūnu“ / „Šuo išmoko pats susirasti maisto“
   Priežastis: sakiniai prasidėjo įvardžiu „Jis“ (check_language.py info pastaba pašalinta), be to, „Šuo tapo laukiniu gyvūnu“ aiškiau pirmokui nei vienas būdvardis „laukiniu“.

Sąmoningai nepakeista (su priežastimi)

- tasks[3].options[0] („Karvė nemoka skraidyti“): gyvenime teisingas faktas (LL-18), dėl kurio vaikui gali būti sunku atmesti šį distraktorių, tačiau distraktoriaus prasmės keitimas yra pedagoginis/turinio sprendimas — pateiktas pasiūlymas.
- tasks[4] („Šuo ilgai gyveno prieglaudoje…“ / teisingas atsakymas „Atsirado žmogus, kuris duoda maisto ir rūpinasi“): prieglaudoje gyvūną taip pat šeria žmonės, tad atsakymas gali atrodyti netikslus, bet pagal užduoties 3 punktą teisingo atsakymo ir prasmės keisti negalima — įtraukta į tą patį pasiūlymą agents/proposals/2026-11-20-kalbu-redaktorius-gyvunu-grupes-uzduociu-faktai.json.
- sim.config.sentences, bins[].label, animals[].label ir trait/winter: trumpi, aiškūs, o sentences ir label yra susieti su iš anksto sugeneruotu Piper garsu.
- concept.title, concept.steps, concept.example, outcomes, reflect, title, subtitle: visi sakiniai <= 10 žodžių, aiškūs 6–7 m. vaikui.
- teacher.*, sources, svietimas1: suaugusiesiems skirtas tekstas, ne vaikui; nepaliesta pagal vaidmens ribas.

Patikros rezultatai (prieš -> po)

1. check_language.py --grade 1 --strict:
   - modulis 10-gyvunu-grupes: 0 klaidų / 0 įspėjimų / 1 pastaba (info) -> 0 klaidų / 0 įspėjimų / 0 pastabų (exit 0).
   - visa 1 klasė (51 modulis): 0 klaidų, 4 įspėjimai (kituose moduliuose, buvo prieš), 35 -> 34 pastabos.
2. validate_content.py ir validate_content.py --grade 1 --strict:
   - 0 klaidų, 0 įspėjimų (exit 0).
3. check_audio.py --no-engine:
   - 743 tekstai, 1486 įrašai, 1486 iš 1486 mp3 (exit 0).
4. check_ui.py:
   - 12 simuliacijų failų, 0 klaidų, 0 įspėjimų (exit 0).
5. check_view.py --module 10-gyvunu-grupes --viewports desktop,tablet,phone,small --json (su Brave skydų blokada):
   - Prieš: checked 4, problems [], notes []; overflow 0/0/0/0; smallCount 0/0/0/0; tasksVisible 5/5 visur; minTaskFont 21.44 / 21.44 / 19.14 / 18.96 px; simVisibleControls 10; eyebrowLines 1; loading/fatal false; errors [].
   - Po: checked 4, problems [], notes []; overflow 0/0/0/0; smallCount 0/0/0/0; tasksVisible 5/5 visur; minTaskFont 21.44 / 21.44 / 19.14 / 18.96 px; simVisibleControls 10; eyebrowLines 1; loading/fatal false; errors [].
6. DOM zondas (Playwright + google-chrome @360x780 su Brave skydų blokada):
   - #gg-tray rodo „kieme prie namo“, senųjų frazių DOM'e neliko (stale_found: []), visos 7 tikrintos naujos formuluotės matomos, paspaudus klaidingus variantus 1–4 užduotyse rodomos naujos užuominos, teisingus — atitinkami why tekstai, overflow @360 = 0, konsolės/page klaidų = 0.

## klaidos

```
session_id: local-54fb529854af40f341a0ed98ce16cb2a206355021b7d7a8785372a3523fae625
```
