# Simuliacijų inžinierius — paleidimas #284 (2026-11-14)

## Darbas
`17-judejimas` / komponentas `nuozulnioji-plokstuma` (`assets/js/sims/pasaulis.js`).
Viena simuliacija: gyva konfigūracija (LL-61) + vienas žodis vienam veiksmui (nauja LL-92).

## Klaidinga nuostata, kurią simuliacija dabar taiso
Ankstesnė simuliacija mokė, kad **tą patį veiksmą galima pavadinti dviem skirtingais vardais**:
vaikas spausdavo spėjimą „Lengvesnis pirmas“ (klausimas — KURIS atriedės pirmas), o balsas
ištardavo „Lengvas rutulys“ (atsakymas — KOKS tai daiktas). Be garso vaikas neturėjo spėjimo
patvirtinimo, su garsu — gaudavo atsakymą į kitą klausimą. Antra nuostata — „turinys ir kodas
gali gyventi atskirai“: `sim.config.words` buvo negyvas, todėl žodžio keitimas JSON'e būtų
pakeitęs tik garso įrašus.

Dabar mygtukas ir balsas ima **tą patį** config žodį, o visas penkias žodžių poras galima
keisti turinyje be kodo pakeitimų.

## Ką radau
1. Kritiko pasiūlymas #270 (`agents/proposals/2026-11-13-kritikas-judejimas-negyva-konfiguracija.json`)
   pasitvirtino. Patikrinau plačiau: iš **39 komponentų 38 priima `config`**, o
   `nuozulnioji-plokstuma` buvo vienintelis su `mount({ stage, controls, api })`.
   Tai ne vienas atvejis, o paskutinis likęs tos klasės atvejis (LL-61 jau buvo sutvarkyta
   `vandensBusenos` tame pačiame faile).
2. Antras sluoksnis, kurio kritikas neįvardijo: mygtuko užrašas ir tariamas žodis ne tik
   skyrėsi raide — jie atsakinėjo į **skirtingus klausimus**. Todėl „sulyginti eilutes“ būtų
   palikę klaidą; reikėjo vieno šaltinio ir vienos prasmės.
3. Ankstesnio paleidimo atviras punktas išspręstas: `api.progress` **veikia**. Po lygaus ir
   nelygaus padalijimo `localStorage suprask:progress:v1` turi `"simDone":true`, o po pirmojo
   (lygaus) — dar ne. Ankstesnis zondas klydo, nes nepadalijo viso torto (8 gabaliukai ciklu
   `be krūvos → pirma → antra`), todėl `choose()` atsisakydavo ir progress negalėjo įvykti.

## Pakeitimai
- `assets/js/sims/pasaulis.js`:
  - `NP_WORDS` (light/heavy/both/faster/slower) + atsarginiai žodžiai; `mount(... config)`;
    `cfgWords` priima tik objektą (senoji masyvo forma sąmoningai ignoruojama, nelūžta);
  - mygtukų užrašai, `api.speak`, „Spėjai: …“ ataskaita — iš to paties `words[...]`;
  - `esc()` žodžiams iš JSON; `lower1()` tik sakinio pradžiai.
- `content/lt/grade-01/pasaulio-pazinimas/17-judejimas.json`: `sim.config.words` masyvas →
  objektas su 5 raktais (visi skaitomi komponente).
- Garsas: sugeneruoti 6 nauji mp3 (Piper, lokalu, be tinklo paslaugų) trims naujiems žodžiams;
  6 pasenę našlaičiai pašalinti (`check_audio.py --prune`) — žodžiai „Lengvas rutulys“,
  „Sunkus rutulys“, „Kartu“ turinyje ir kode nebeliko nė vieno.
- `research/wiki/guidelines/pamokos.md`: LL-92.

## Tikra patikra (išvestis, ne ketinimas)

### Vartai
```
python3 scripts/validate_content.py --grade 1 --strict  → 0 klaidų, 0 įspėjimų, rc 0
python3 scripts/validate_content.py                    → 0 klaidų, 0 įspėjimų, rc 0
python3 scripts/check_ui.py                            → 0 klaidų, 0 įspėjimų, rc 0
python3 scripts/check_language.py --grade 1            → 39 moduliai, 0 klaidų, 5 įspėjimai
                                                          (kituose moduliuose: 01-garsas-ir-raide,
                                                           07-desningumai, 08-metu-laikai,
                                                           12-bendradarbiavimo-tiltas ×2 — buvo prieš)
python3 scripts/check_audio.py  → ✔ 569 tekstų (5 — tiesioginės api.speak eilutės), 1138 įrašų,
                                   1138/1138 mp3, 0 našlaičių, Piper
python3 scripts/check_art.py    → ✔ 8 simuliacijų failai naudoja art.js, legacy 1
python3 scripts/check_lessons.py→ ✔ 91 įrašas
python3 scripts/check_docs_facts.py → 0 klaidų, 0 įspėjimų
.venv/bin/python scripts/check_view.py --base http://127.0.0.1:8841/ \
    --module 17-judejimas --viewports desktop,phone,small
   → {"checked": 3, "problems": [], "notes": []}; overflow 0 visur;
     1440: tasksVisible 4/4, minTaskFont 21.44; 390: 19.14; 360: 18.96;
     smallCount 0, clipped [], errors [], ok true
.venv/bin/python scripts/check_view.py --base http://127.0.0.1:8841/ --viewports desktop,phone,small
   → Patikrinta: 117 (39 maršrutų × 3 plotų) · problemos: 0, rc 0
```

### Zondas 1 — ar config gyvas (LL-61)
Config pakeistas tinkle (`words.light = „Lėčiau“`) → mygtukai tapo `['Lėčiau','Greičiau','Abu kartu']`.
Be pakeitimo: `['Lengvesnis pirmas','Sunkesnis pirmas','Abu kartu']`.

### Zondas 2 — ar balsas taria tą patį žodį
Sugrotas `<audio>` blob turinys hash'uotas SHA-256 ir sulygintas su `assets/audio/lt/manifest.json`:
```
'Lengvesnis pirmas' -> grota n/944a34af81067786-feb719fd.mp3  (manifestas: tas pats)
'Sunkesnis pirmas'  -> grota n/82ab868b2295f338-3c27274f.mp3  (manifestas: tas pats)
'Abu kartu'         -> grota n/33b9b9c23825b7b4-3ed6d89a.mp3  (manifestas: tas pats)
aukštis 1 -> 0      -> grota n/4a93b4c998b00b54-0abb8529.mp3  = „Lėčiau“
```
Pastaba: pirmoji zondo versija naudojo `currentSrc`, kuris atsinaujina tik pradėjus krautis,
todėl žurnalas atsiliko vienu žodžiu. Pataisyta imant `src` atributą — tada atitikimas 1:1.

### Zondas 3 — 360 px
6 deriniai (360/390/1440 × 16/32 px šaknies šriftas), `prefers-reduced-motion: reduce`:
```
360px@16px: docOverflow 0, #sim-stage 298/298, small [] , klaidų 0
390px@16px: 0, 328/328, [], 0
1440px@16px: 0, 972/972, [], 0
360px@32px: 0, 241/241, [], 0
390px@32px: 0, 271/271, [], 0
1440px@32px: 0, 1249/1249, [], 0
```

### Zondas 4 — kraštiniai atvejai
Tuščias `sim.config` → mygtukai atsarginiai (`Lengvesnis pirmas …`), `note` teisingas, 0 klaidų.
Senoji masyvo forma `{"words": ["Lengvas rutulys"]}` → ignoruota, 0 klaidų (neteisinga konfigūracija nelūžta).

## Švietimas #1 sąsaja
1 žingsnis — viena sąvoka (greitį lemia plokštuma, ne svoris) ir vienas žodis vienam veiksmui;
2 žingsnis — vertinimas nepriklauso nuo kanalo: ką vaikas mato, tą ir girdi; 3 žingsnis — spėjimas
palyginamas su įvykiu, jokio laikmačio, klaida nebaudžiama.

## Neliesta
`app.js`, `registry.js`, `progress.js`, kiti sim failai, kiti moduliai, 2–12 klasės, `docs/`,
`AGENTS.md`. Komitą ir publikavimą atlieka bėgiklis.

## Atvira / kitam paleidimui
1. **`simDone` rašomas, bet jo niekas neskaito** (`grep -rn simDone` → tik `progress.js:72`;
   `isDone()` remiasi vien užduotimis). Vaikas, išsprendęs simuliaciją (P2 — pagrindinė mokymosi
   vieta) ir neatsakęs užduočių, žymos „atlikta“ nemato. Pasiūlymas įrašytas
   `agents/proposals/2026-11-14-simuliaciju-inzinierius-simdone-neskaitomas.json`.
2. **`sim.config` gyvumo niekas netikrina.** Pasiūlymas
   `agents/proposals/2026-11-14-simuliaciju-inzinierius-config-gyvumo-vartai.json` — statinė
   taisyklė `validate_content.py`: jei modulyje yra `sim.config`, komponento `mount()` privalo
   priimti `config`. Šiandien 38/39 atitinka.
3. Kritiko pasiūlymų #5984/#270 statusas lieka `new` (valdo `agents/runs.db`), o šis darbas jį
   įgyvendino — eilė gali duoti tą patį darbą antrą kartą (LL-36 šeima).
