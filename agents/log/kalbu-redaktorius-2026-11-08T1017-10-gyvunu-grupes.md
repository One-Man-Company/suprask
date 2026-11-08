# Kalbu-redaktorius #148 — 10-gyvunu-grupes (fresh-eyes peržiūra)

- **Data:** 2026-11-08T10:17 (+02:00)
- **Vaidmuo:** kalbu-redaktorius
- **Modulis:** 10-gyvunu-grupes (`content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json`)
- **Snapshotas:** HEAD 38d35ec, darbinė kopija švari (iki mano pakeitimo). `10-gyvunu-grupes` — vienintelis šio paleidimo keistas failas.
- **Kontekstas:** auditas #137 šiam moduliui rado vieną radinį (#1, hint'o kryptis) — jis užtaisytas paleidimu #144. Šis paleidimas — pakartotinė žmogaus akų peržiūra tų pačių tekstų.

## Radinys ir pataisa

| Vieta | Prieš | Po | Kodėl |
|---|---|---|---|
| `tasks[3].hint` (eil. 69) | „Paukštį atpažįstame ne pagal skrydį." | „Ne visi paukščiai skraido." | 1-asis asmuo daugiskaita („atpažįstame" = mes) vaikui, kuris puslapį skaito vienas — „mes" neturi veikėjo. Tai buvo vienintelis 1-asmens formulys modulyje: kiti hint'ai rašyti 2-uoju („Pagalvok…", tasks[2]) arba 3-uoju (klausimai, tasks[0–1]). Naujasis hint'as sako tą pačią mintį (skrydis nėra paukščio požymis), 5 žodžiais, visi žodžiai žinomi 1 klasei, neatskleidžia atsakymo „Pingvinas" ir neišplėšia iš `why` požymių (plunksnos, kiaušiniai). Nauja pamoka LL-60. |

Sakinio ilgis 5 → 5 žodžiai; `answer` indeksas (0), variantai, `q`, `why`, `optional` — neliesti.

## Ko sąmoningai nekeitau (su priežastimi)

- **tasks[1].hint „Jos gyvena vandenyje — kuo jos ima deguonį iš vandens?"** — vienintelis likęs `check_language` info („neaiški nuoroda pradžioje"). Antecedentė („žuvys" pačioje klausime) aiški, hint'as rodomas tame pačiame uždavinio kortelėje; auditas #137 visus 21 tokių info peržiūrėjo ir paliko. Keisti tik dėl skaičiaus būtų metric gaming (LL-38 šeima).
- **tasks[2].q „Kuris požymis būdingas paukščiams?"** — „būdingas" bookiškesnis, bet tai moduliu dėstomo žodžio „požymis" porinis sąvokinis žodis; keičiant į „tinka" būtų stiliaus churnas be supratimo prasmės.
- **concept.steps[0] „kailį arba plaukus"** — „arba" tikras: abu variantai tinka (žinduoliai turi kailį arba plaukus). Taisyklės „arba tik kai tikrai bet kuris tinka" atvejis.
- **tasks[3] variantas „Varnas"** — paviršiai klaidingas (varnas yra paukštis), bet klausimas turi kvalifikatorių „nors neskraido": variantas tikrina, ar vaikas perdirba kvalifikatorių. Tai sąmoningas iššūkis optional užduotyje ir atitinka `teacher.misconceptions[2]` (pingvinas laikomas „ne paukščiu", nes neskraido). Atsakymas (0 = Pingvinas) teisingas — pasiūlymo nebuvo už ką rašyti.
- **„skraido" / „neskraido"** — teisingos iteratyvinio veiksmažodžio „skraidyti" formos (palyg. 08-metu-laikai: „paukščiai skrenda" — vienkartinis skrydis). Auditas #137, kuris specialiai ieškojo neegzistuojančių formų (Pakėlei, pasėji, dalijai…), čia nerado klaidos.
- **`teacher.*`, `sources`, `svietimas1`, `outcomes`, `concept`, `sim.config` ({})** — vaidmens ribos (ne vaikui skaitomi arba neliečiamų sričių failai).
- **Garso nepergeneruota ir nereikia:** `generate_audio.collect()` renka tik `sim.config` raktus (scripts/generate_audio.py:157–159); `sim.config` čia tuščias ir neliestas.

## Patikra (prieš → po)

- **check_language.py (modulis):** 0 klaida / 0 įspėjimas / 1 info → **0 / 0 / 1** (nepakito — įrankis nemato hint'o asmens; tai LL-60/LL-53 šeimos riba, ne atsitraukimas). Klasė viso: 0 klaidų, 4 įspėjimai, 21 info → 0/4/21 (4 warn yra kituose moduliuose ir buvo ir prieš darbą: 08-metu-laikai, 12-bendradarbiavimo-tiltas, 13-akmenelis-popierius ×2).
- **validate_content.py:** `--grade 1` ir be parametrų → 0 klaidų, 0 įspėjimų (ir prieš, ir po).
- **check_view.py** (`--base http://127.0.0.1:8940/`, Brave skydų blokada `BRAVE_INIT`, plotai desktop/tablet/phone): **prieš = po** — `checked` 3, `problems` [], `notes` [], exit 0. `overflow` 0/0/0, `smallCount` 0, `tasksVisible` 4/4, `clipped` [], `simVisibleControls` 13, `loading` false, `fatal` false, console errors 0. `minTaskFont`: 21.44 / 21.44 / 19.14 px (desktop/tablet/phone) — identiškai prieš ir po (teksto ilgis sutrumpėjo, dydis nepakito).
- **DOM zondas** (`probe148_dom.py`, scratch; Chromium 1440 px, `.venv` Playwright, `google-chrome`): 4 užduotys DOM'e; 4-oje užduotyje klaidingas atsakymas „Varnas" → `.task-feedback.try` = „Ne visi paukščiai skraido."; seno hint'o teksto puslapyje nebeliko; #144 hint'as (3 užduotis) nepakito; `why` rodomas tik teisingo atsakymo metu (app.js:480 — elgesys nepakito); console/page errors 0. Rezultatas: OK.

## Nauja pamoka

**LL-60 — Hint'as rašytas „mes" asmens forma vaikui, kuris skaito vienas** (įtraukta į `research/wiki/guidelines/pamokos.md`): hint'as prielaikė suaugusįjį palydą („mes atpažįstame"). Taisyklė: hint'uose tik 2-asis (liepiamasis) arba 3-asis asmuo; 1-asis daugiskaitos formas (atpažįstame, žiūrime, matome) nevartoti. Patikra: grep `content/lt/grade-01/` → 0 atitikimų; hint'as perskaitymas vaiko vietoje.

## Pasiūlymai

Nenurodyti (0 iš 3): atsakymas teisingas (pasiūlymo nebuvo už ką rašyti); variantų design sąmoningas; simuliacijos/CSS/architektūros defektų nerasta (`check_view` 0 problemų, sim 13 valdiklių matomi). Įrankio akluomės (hint'o asmuo, hint'o kryptis, `outcomes` vartai) jau turi atvirus pasiūlymus (#143 outcomes-vartai, LL-52/LL-53 šeima).

## Kliūtys / pastatymai bėgikliui

1. `check_language.py` nemato hint'o asmens (kaip ir hint'o krypties — LL-53): hint'o kokybė lieka žmogaus audito sritis.
2. Darbinėje kopijoje liko run 140–145 likučiai (`kalbos-auditas.md`, `pamokos.md`, gretasienis pasiūlymas) — neliesti; prie tų pačių failų pridėti šio paleidimo įrašai.
3. `git commit`/`push` nevedu — bėgiklio darbas (LL-09). Autorystės rizikų nekėlė: vienintelis pakeistas failas — šio modulio JSON.

## Touched

- `content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json` (1 vieta: tasks[3].hint)
- `research/wiki/guidelines/pamokos.md` (LL-60)
- `research/wiki/guidelines/kalbos-auditas.md` (#148 įrašas)
- `agents/log/kalbu-redaktorius-2026-11-08T1017-10-gyvunu-grupes.md` (šis failas)
- `agents/state.json`

2–12 klasės, kiti moduliai, CSS, simuliacijų kodas, `index.json`/`path.json`/`grades.json`, garso failai — neliesti.
