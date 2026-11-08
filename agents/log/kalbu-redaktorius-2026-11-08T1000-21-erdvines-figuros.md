# Kalbos redaktorius — paleidimas #147

- **Modulis:** 21-erdvines-figuros (`content/lt/grade-01/matematika/21-erdvines-figuros.json`) — užduoties bloko viršesnumas, žmogaus nurodytas modulis.
- **Data:** 2026-11-08T10:00+02:00
- **Būsena darbo pradžioje:** modulis jau perrašytas paleidimuose #137/#140/#141/#143 (outcomes[0], subtitle, tasks[0].hint, tasks[3].hint/why). `check_language.py` modulyje — 0 įrašų. Šiame paleidime rasta **5 naujų defektų**, kurių nebuvo 41 radinių auditinėje lentelėje (visi — įrankio akluose).

## Pakeitimai (prieš → po)

| # | Vieta | Prieš | Po | Kodėl |
|---|---|---|---|---|
| 1 | concept.steps[0] | „Pasirink kūną ir žvilgsnį. Žiūrėk iš priekio, iš viršaus ar nuo šono." | „Pasirink kūną. Žiūrėk iš priekio, iš viršaus ar nuo šono." | „Žvilgsnis" — abstraktus žodis 6–7 m. vaikui; frazė dabar žodis į žodį atitinka simuliacijos mygtukus „Iš priekio / Iš viršaus / Nuo šono" (geometrija.js VIEWS); viena veiksmo forma — vienas sakinys |
| 2 | concept.steps[2] | „Pakeisk žvilgsnį. Forma keisis, o kūnas liks tas pats." | „Žiūrėk iš kitos pusės. Forma keisis, o kūnas liks tas pats." | Ta pati priežastis; simuliacijos promptas jau vartoja „žiūri" („Ką matai iš priekio, kai žiūri į kūgį?") — vienoda kalbų |
| 3 | tasks[1].hint | „Palygink dėžutę su kauliuku. Ar dėžutė turi kampus?" | „Palygink dėžutę su kubu. Ar dėžutė turi kampus?" | Priekinė nuoroda: „kauliukas" modulyje pirmą kartą pasirodo tik tasks[2].q — 1 užduotyje žemiau vaikas žodžio dar neturi; „Kubas" yra pačioje užduoties variante ir sim mygtuke |
| 4 | tasks[2].hint | „Pažiūrėk į kauliuką simuliacijoje iš viršaus." | „Pažiūrėk į kubą simuliacijoje iš viršaus." | Neteisinga nuoroda: simuliacijoje kauliuko nėra (BODIES: Kūgis, Ritinys, Kubas, Gretasienis, Rutulys) — vaikas ieško die, užuomina nevykdoma. Nauja pamoka LL-57 |
| 5 | tasks[3].options[0] | „Kamuolys didesnis" | „Kamuolys plokščias" | Nesusietas kiekis + LL-18: dydžio palyginimas be atskaitos — gyvenime gali būti teisingas (didelis kamuolys vs maža lėkštė), vaikas gali pagrįstai atsakyti „taip" ir gauti klaidą. Naujas variantas visada klaidingas ir tikrina módulio branduolio painiavą (plokščias ≠ apvalus iš visų pusių); ilgis, registro ir gramatika kaip buvo |

`answer` indeksai (1, 2, 0, 1, 0), teisingieji variantai, `optional` žyma, hint/why kitose vietose — nepakito (`git diff` — tik 5 eilutės).

## Ko sąmoningai NEkeičiau ir kodėl

- **sim laukas (sim.config.sentences, „Gretasienis …")** — vaidmens riba: sim neliečiamas. Atviras pasiūlymas `2026-11-08-kalbu-redaktorius-gretasienis-pavadinimas.json` (run 143); keičiant reikėtų pergeneruoti garsą.
- **assets/js/sims/geometrija.js** — simuliacijos kodas (BODIES.name „Gretasienis", kieta pastaba :112 apie žvilgsnį). Neliestas; pastabos nesutapimas su naujais žingsniais užregistruotas nauju pasiūlymu `2026-11-08-kalbu-redaktorius-sim-uzrasas-zvilgsnis.json`.
- **teacher.*, sources, svietimas1** — ne vaikui skaitomi / riba.
- **title „Erdvinės figūros", outcomes „Įvardiju … stačiakampį gretasienį"** — oficiali programos terminija (audito modelis: terminą, kuris yra pačia sąvoka, palikti).
- **concept.big_idea, example, reflect, kiti q/options/why** — jau vienareikšmiški, sakiniai ≤10 ž., klausiamieji žodžiai ant viršaus.
- **tasks[3].options[2] „Lėkštė neturi krašto"** — aiškiai klaidingas (lėkštė turi kraštą), tinkamas distraktorius.
- **„ar" žvilgsnių sąraše** (steps[0]) — tikrai tinka bet kuris žvilgsnis, tai ne dviprasmė „arba" užduoties klausime.
- **CSS** — nereikėjo: check_view 0 problemų visuose plotuose.

## Matavimai (prieš → po)

- **check_language.py --grade 1:** 0 klaidų, 4 įspėjimai, 21 pastaba → **identiškai** (įspėjimai — kituose moduliuose: 08-metu-laikai, 12-bendradarbiavimo-tiltas, 13-akmenelis-popierius ×2). Modulio įrašas: **0 → 0**. Šio paleidimo 5 radiniai yra įrankio akluose (hint'o kryptis, varianto prasmė gyvenime, žingsnių abstraktumas — LL-52/LL-53 šeima): manualūs moduliniai radiniai **5 → 0**.
- **validate_content.py:** `--grade 1` → 0/0; visi moduliai → 0/0.
- **check_view.py** (--base http://127.0.0.1:8931/, Brave skydų blokada BRAVE_INIT, plotai desktop/tablet/phone/small): **prieš = po**: checked 4, problems [], notes []; `overflow` 0, `smallCount` 0, `tasksVisible` 5/5, `minTaskFont` 21.44 / 21.44 / 19.14 / 18.96 px, `clipped` [], `simVisibleControls` 14, `loading` false, `fatal` false, console errors 0.
- **DOM zondas** (Chromium 1440 px, .venv Playwright): naujos formuluotės matomos gyvai — steps, option „Kamuolys plokščias", abu hint'ai `.task-feedback` po klaingo atsakymo (app.js:486 rodo hint tik tada); senų tekstų (`kauliuk`, `Kamuolys didesnis`, `Pakeisk žvilgsnį`) puslapyje nebeliko; 5 užduotys, 0 console/page errors.
- **rebalance_answers.py:** keistų failų 0. **check_docs_facts.py:** 0/0. **check_audio.py:** 463 tekstai × 2 įrašai, Piper.
- **Garso nepergeneruota ir nereikia:** `generate_audio.collect()` renka tik `sim.config` raktus (scripts/generate_audio.py:157-159); `sim` laukas neliestas.

## Nauja pamoka

**LL-57 — Hint'o nuoroda į daiktą, kurio vaikas dar neturi** (įtraukta į `research/wiki/guidelines/pamokos.md`): hint'as siuntė į kauliuką, kurio simuliacijoje nėra, ir naudojo „kauliuką" anksčiau, ne sąvoka buvo pristatyta. Patikra: DOM zondas + hint'as skaitomas `.task-feedback` po klaingo sprendimo.

## Kliūtys / pastatymai bėgikliui

1. Darbinėje kopijoje jau buvo kitų bėgikliu sulaimintų likučių iš run 140–145 (`M` kalbos-auditas.md ir pamokos.md, `??` gretasienis pasiūlymas) — neliesti, prie tų pačių failų pridėti šio paleidimo įrašai.
2. `kalbos-auditas.md` buvo redaguojamas paraleliai (#144 įrašas atsirado per mano darbą) — mano #147 įrašas įterptas tarp #143 ir #144 skyrių; turinys pilnas.
3. `agents/run.py` vartų problema nepakito: `check_view.py` ir `check_language.py` hint'o krypties tikrinimas dar ne CI/bėgiklio vartuose (atviri #5544, #5544 šeima; LL-52/LL-53 ribos).
4. Nenurodytas `git commit`/`push` — bėgiklio darbas, kaip reikia.

## Patikra (komandos)

- `python3 scripts/check_language.py --grade 1` → 0 klaidų, 4 įspėjimai, 21 pastaba; `--json` modulis 21-erdvines-figuros: 0 įrašų.
- `python3 scripts/validate_content.py --grade 1` ir be parametrų → 0/0.
- `python3 scripts/check_view.py --base http://127.0.0.1:8931/ --module 21-erdvines-figuros --viewports desktop,tablet,phone,small --json` → 4 patikros, 0 problemų, 0 pastabų, exit 0 (prieš ir po).
- DOM zondas `probe_147_dom3.py` (scratch) → hint'ai nauji, senų nėra, errors 0.

## Touched

`content/lt/grade-01/matematika/21-erdvines-figuros.json` (5 vietos), `research/wiki/guidelines/pamokos.md` (LL-57), `research/wiki/guidelines/kalbos-auditas.md` (#147 įrašas), `agents/proposals/2026-11-08-kalbu-redaktorius-sim-uzrasas-zvilgsnis.json` (naujas), `agents/log/kalbu-redaktorius-2026-11-08T1000-21-erdvines-figuros.md` (šis failas), `agents/state.json`. 2–12 klasės, kiti moduliai, CSS, simuliacijų kodas — neliesti.
