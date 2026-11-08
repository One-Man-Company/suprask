# Kalbu-redaktorius — paleidimas 149 — 16-vandens-busenos

- **Data:** 2026-11-08T10:36:34+02:00
- **Modulis:** 16-vandens-busenos (`content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json`) — pasirinktas pagal užduoties bloką (audito #137 prasčiausias modulis: 4 radiniai).
- **Pagrindas:** `research/wiki/guidelines/kalbos-auditas.md` radiniai #2, #3 (rimti), #7, #8 (vidutiniai) + šio paleidimo fresh-eyes radinys (big_idea vertiniai).

## Prieš → po (formuluotės)

| # | Laukas | Prieš | Po |
|---|---|---|---|
| 1 | subtitle (eil. 6) + index.json:53 | „Vanduo **neprapuola** — jis keičia savo formą" | „Vanduo **neišnyksta** — jis keičia savo formą" |
| 2 | outcomes[0] (eil. 9) | „…išgaravęs vanduo **neprapuola**, o būna ore kaip garas." | „…išgaravęs vanduo **neišnyksta**, o būna ore kaip garas." |
| 3 | concept.big_idea (eil. 15, 2 sakinys) | „…**Šildomas jis** kyla į orą, o **vėsdamas vėl** tampa lašais." | „…**Kai pakaiti, kyla** į orą, o **kai atvėsta, tampa** lašais." |
| 4 | concept.example (eil. 22) | „veidrodis būna **aprasojęs**" (nežodis) | „veidrodis būna **užparęs**" |
| 5 | concept.steps[3] (eil. 20) | „Lašai **nubyra** atgal į puodą." (retas žodis) | „Lašai **nubėga** atgal į puodą." |
| 6 | tasks[2].q (eil. 54) | „veidrodis **aprasojo**" (nežodis) | „veidrodis **užparojo**" |

Iš viso 6 vietų modulio JSON + 1 sinonchronizavimo vieta index.json (subtitle kopija — be jos modulio kortelėje liktų nežodis „neprapuola"; LL-05/LL-21 šeima). Teisingo atsakymo, `answer` indeksų (0, 1, 2, 1), variantų prasmės nepakito.

## Matavimai

- **check_language.py:** modulis — 0 klaida / 0 įspėjimas / 1 info → **0 / 0 / 1** (info tas pats: `tasks[0].why` „Jis ne dingo, tik pakeitė formą." — antecedentė „Vanduo" aiški; audit modelis #9 paliko). **Įspėjimai 0 → 0** dėl to, kad visi 5 radiniai buvo įrankio akluose (nežodžiai, retas žodis, dalyviniai konstrukcijai — `check_language.py` tokio netikrina, auditas #137 dokumentavo; LL-52 šeima). Žmogaus akių radiniai: **5 → 0**. Klasė: 0 klaida, 4 įspėjimai, 21 info → **0 / 4 / 21** (4 warn — 08-metu-laikai, 12-bendradarbiavimo-tiltas, 13-akmenelis-popierius ×2 — kiti moduliai, buvo ir prieš darbą).
- **validate_content.py:** `--grade 1` ir be parametrų → **0 klaidų, 0 įspėjimų** (prieš ir po).
- **check_view.py** (`--base http://127.0.0.1:8941/`, Brave skydų blokada `BRAVE_INIT`, desktop 1440 / tablet 1024 / phone 390): **prieš = po** — `checked` 3, `problems` [], `notes` [], exit 0. `overflow` 0/0/0, `smallCount` 0, `tasksVisible` 4/4, `clipped` [], `simVisibleControls` 4, `loading` false, `fatal` false, console/page errors 0. `minTaskFont` 21.44 / 21.44 / 19.14 px — identiškai (tekstai trumpesni, geometrija nepakito).
- **check_audio.py:** 463 tekstai × 2 įrašai, Piper, exit 0. Garso nepergeneruota ir reikėjo: `generate_audio.collect()` renka tik `sim.config` + UI EXTRA tekstus (`generate_audio.py:157-175`); subtitle/outcomes/concept/tasks niekada neturi įrašų (manifest grep → 0 hitų net seni tekstai), `sim.config.words` nepakeistas.
- **DOM zondas** (`probe149_dom.py`, scratch, Chromium 1440 px, `.venv` Playwright, `google-chrome`, Brave skydų blokada): **RESULT OK** — 7 nauji teiginiai matomi (`subtitle`, `big_idea` ×2, `outcomes[0]`, `concept.example`, `concept.steps[3]`, `tasks[2].q`), 5 seni neberendinami (`neprapuola`, `aprasoj`, `nubyra`, `Šildomas`, `vėsdamas`), sim readout gyvas („Vandens lygis 5 iš 5 · dangtis nuimtas"), 4 užduotys, 3 outcomes `<li>`, 0 console/page klaidų.

## Sąmoningai nekeista (su priežastimi)

- **`answer` indeksai, `options`, `optional`** — vaidmens riba; variantų prasmės nepakito, jie skiriasi esmiškai (garavimas / nutekėjimas / sienos / dulkės / dažai / lietus; ledas→garas/skystis/dingimas).
- **4 `hint` ir 4 `why`** — aiškūs, ≤10 žodžių, nukreipia į stebėjimą, neatskleidžia atsakymo (LL-22 patikrinta).
- **`tasks[0].why` 2-asis sakinys „Jis ne dingo, tik pakeitė formą."** — vienintelis `check_language` info; įvardžio antecedentė („Vanduo") aiški, audit modelis #9 visus tokius įvardžius peržiūrėjo ir paliko.
- **`concept.steps[1]` „Jo nematome."** — audit modelis #6: priimtina bendrinė pastaboja („žmonės nemato"), palikta.
- **`big_idea` 1-asis sakinys „…ledas, vanduo arba garas"** — „arba" čia tikrasis (bet kuris iš trijų būsenų tinka), tai ne pasirinkimo klausimas — vaidmens taisyklės „arba" atvejis neegzistuoja.
- **`reflect`, `teacher.*`, `sources`, `svietimas1`** — nekeičiama pagal ribas (teacher — suaugusiojo tekstas; likę — ne kalbinio redagavimo sritis).
- **`sim.component` ir `sim.config.words`** — `config.words` yra negyvas (simuliacija jo neskaito), bet tai simuliacijos/kūrėjo sritis → **pasiūlymas**, ne tiesioginis taisymas (LL-03/LL-34 šeima: nelįsti į sim logiką).
- **`title`, `minutes`, `concept.title`, `outcomes[1..2]`, `tasks[].hint`** — neatitiko jau nė vienos run kategorijos (klausiamasis žodis yra, kiekiai susieti, variantai ne tapačios, dvigubo neigimo nėra).
- **CSS, simuliacijos kodas, `scripts/`, kiti moduliai, 2–12 klasės** — neliesti (nė vieno išdėstymo defekto nerasta: `check_view` 0 problemų).

## Nauja pamoka

**LL-61 — Negyva konfigūracija: `sim.config` raktas, kurio komponentas neskaito** (`research/wiki/guidelines/pamokos.md`). Šiame modulyje `sim.config.words` niekur neskaitomas (`pasaulis.js:862` mount neturi config; faile 0 „config"/„words" atitikmenų; žodžiai kieti :859/:979/:1048-1050). LL-42 atvirkščinis atvejis: vietoj dviejų gyvų šaltinių — vienas gyvas, vienas negyvas nuo pat pradžios.

## Pasiūlymai (2)

1. `agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json` — `sim.config.words` negyvas (normal, struktura). Įrodymas: mount parašas, grep 0, kieti žodžiai sim'e, garso našlaičiai.
2. `agents/proposals/2026-11-08-kalbu-redaktorius-sim-virs-lašais.json` — sim pastaboje „virs lašais" nestandartinė forma (low, simulacija). Įrodymas: `pasaulis.js:1082`, modulyje visur „virto".

## Kliūtys / pastatymai bėgikliui

1. `check_language.py` nemato nežodžių, klydų veiksmažodžio formų ir dalyvinių konstrukcijų — visi 5 šio modulio radiniai (ir big_idea vertiniai) liko įrankio akluose. Toks pats limitas kaip LL-52/LL-53 šeimoje; atviras #5827 (`outcomes` vartai).
2. DOM zondo detalė: `outcomes` rendrinami suglaustame `<details>` (`app.js:392-394`), todėl `innerText` jų nemata — zonde naudojamas `textContent` (LL-31 šeima: matavimas turi atitikti tiek vaizdą, tiek DOM).
3. Garso grandinė nepakito ir negalėjo: pakeisti laukai niekada nebėra tariami (collect() → tik `sim.config`), `config.words` nepakeistas.
4. Darbinėje kopijoje liko run 140–145 likučiai (`kalbos-auditas.md`, `pamokos.md`, gretasienis pasiūlymas) — neliesti; prie tų pačių failų pridėti šio paleidimo įrašai.
5. `git commit`/`push` nevedu — bėgiklio darbas (LL-09). Autorystės rizikų nekėlė: `git status` parodė tik 2 turinio failus (modulio JSON + `index.json` sinonchronizacijai); wiki/log/proposal/state — šio paleidimo deliverable'ai.

## Touched

- `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` (6 vietos: subtitle, outcomes[0], concept.big_idea, concept.example, concept.steps[3], tasks[2].q)
- `content/lt/grade-01/index.json` (1 vieta: 16-vandens-busenos subtitle)
- `research/wiki/guidelines/pamokos.md` (LL-61)
- `research/wiki/guidelines/kalbos-auditas.md` (#149 taisymo būsena)
- `agents/proposals/2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json`
- `agents/proposals/2026-11-08-kalbu-redaktorius-sim-virs-lašais.json`
- `agents/log/kalbu-redaktorius-2026-11-08T1036-16-vandens-busenos.md` (šis failas)
- `agents/state.json`

2–12 klasės, kiti moduliai, `assets/css/main.css`, `assets/js/sims/*`, `scripts/*`, garso failai — neliesti.
