# simuliaciju-inzinierius — 2026-11-05 (paleidimas #19)

## Darbas

**Simuliacija:** `metu-laikai` (`assets/js/sims/pasaulis.js`), modulis `content/lt/grade-01/pasaulio-pazinimas/08-metu-laikai.json`.

Pasirinkta pagal savo paties pasiūlymą `agents/proposals/2026-11-04-simuliaciju-inzinierius-metu-laikai.json` (jis liko neatliktas po paleidimo #7). Tai ne estetikos, o sutarties pažeidimas: `KURINIO-STANDARTAS` §4.1 reikalauja modelio, o senoji versija turėjo keturis mygtukus, kurie tik perjungdavo paruoštą paveikslėlį ir ištardavo sezono vardą. Vaikas nieko nekeitė ir negalėjo nieko numatyti.

### Klaidinga nuostata

Modulio `teacher.misconceptions[1]`: „Metų laikai siejami tik su oru, nepastebint šviesos trukmės pokyčio.“ Senoji versija šios nuostatos net nesiekė liesti — visi keturi „sezonai“ buvo vienodai šviesūs, dienos ilgis niekur neegzistavo, o perėjimas buvo akimirksnis (mygtukas → kitas paveikslas). Vaikas iš tokios iliustracijos galėjo išmokti priešingai: kad metų laikai persijungia staiga ir yra tik oro reikalas.

### Kas pakeista

1. **Vienas kintamasis — mėnuo (1–12)** su slankikliu ir dviem 48 px žingsnio mygtukais. Vietoj keturių lygiaverčių pasirinkimų yra viena ašis, kurią galima tempti į abi puses.
2. **Deterministinė lentelė `MENUO`** (12 eilučių): kiekvienam mėnesiui — dienos trukmė minutėmis (Vilniaus platumai, 435–1045 min.), saulės vidurdienio aukštis, lapų etapas, sniegas, paukščiai, vienas sakinys vaikui. Jokio atsitiktinumo, jokio laikmačio, jokios animacijos.
3. **Trys išvestys iš vieno parametro:** saulės lanko plotis ir aukštis (`M…Q…` kreivė), tas pats medis penkiuose etapuose (pumpurai → lapai → auksiniai → be lapų), dienos ilgio juosta su pastoviomis gruodžio ir birželio žymomis. Vaikas mato, kad pokytis laipsniškas, o ne „įjungiamas“ tam tikrą dieną.
4. **Palyginimas su praėjusiu mėnesiu** tekstu: „↗ ilgesnė nei gruodį“, „↘ trumpesnė nei lapkritį“ — rodyklė ir žodis, ne spalva.
5. **`api.progress` tik už palyginimą**, o ne už mėnesių „surinkimą“: rezultatas pažymimas, kai vaikas pamatė ir birželį, ir gruodį. Tai atitinka modulio didžiąją idėją (ciklas turi du galus), o ne skatina braukyti slankiklį.
6. **Modelio riba pasakyta tekste** po scena: „Tai supaprastintas modelis: tikras oras kasdien būna įvairus.“ (`simuliacijos-ir-modeliai.md` reikalavimas).
7. **Kontrasto pataisa:** juostos žymų užrašai iš pradžių ėjo su `--ink-faint` (3,76:1 šviesioje temoje — žemiau 4,5:1), pakeisti į `--ink-soft` (6,99:1).
8. **Garso sutartis nepaliesta:** tariami tik jau egzistuojantys tekstai (`Žiema`, `Pavasaris`, `Vasara`, `Ruduo`), ir tik pasikeitus sezonui, o ne kiekvienam slankiklio žingsniui.

### Ribos

Nekeisti: `app.js`, `registry.js`, `main.css`, kiti sim failai, kitų vaidmenų failai. Modulio JSON neliestas (`sim.component` liko `metu-laikai`, `config` liko `{}`). `SIMS` eksporto raktai nepakitę. Be sim failo įrašyti tik du dalykai, kurių reikalauja gairės: pilotų įrašas P-006 (`research/wiki/guidelines/pilotai.md`, T6.1) ir pasiūlymai (`agents/proposals/`).

## Patikra (realūs rezultatai)

- `python3 scripts/validate_content.py` → **0 klaidų, 0 įspėjimų**; `--strict` → **0/0**.
- `python3 scripts/check_ui.py` → **0 klaidų, 0 įspėjimų**.
- `python3 scripts/check_audio.py` → **324 tekstai, visi su dviem įrašais, visi 22 050 Hz** (naujų garso failų nereikėjo).
- `node` importas (`import-probe.mjs`) → `SIMS: metu-laikai, augalo-gyvenimas, gyvunu-grupes`; lentelėje 12 mėnesių, dienos trukmės `475,575,705,845,970,1045,1005,885,750,625,500,435`.
- Chrome headless per CDP, `#/modulis/1/pasaulio-pazinimas/08-metu-laikai`:
  - **320 px:** `scrollWidth = clientWidth = 320`, horizontali slinktis **0 px**; scena 258 px, jokių elementų už scenos ribų, jokio teksto persidengimo (`scrollWidth > clientWidth` sąrašas tuščias).
  - **360 px:** 0 px slinkimo, scena 298 px. **414 px:** 0 px, scena 351 px.
  - Taikiniai: slankiklis 258×48 / 298×48 / 351×48, „◀ Ankstesnis“ 171×48, „Kitas ▶“ 116×48 — **nė vieno < 48 px**, nė vieno už ekrano.
  - Konsolės klaidų: **0** (ir `08`, ir `09`, ir `10` moduliuose, ir `#/klase/1`).
  - Visų 12 mėnesių išvestis (realūs tekstai): Sausis 7 val. 55 min. „↗ ilgesnė nei gruodį“; Vasaris 9 val. 35 min.; Kovas 11 val. 45 min.; Balandis 14 val. 05 min.; Gegužė 16 val. 10 min.; Birželis **17 val. 25 min.** („↗ ilgesnė nei gegužę“, lanko plotis 85–345); Liepa 16 val. 45 min. „↘ trumpesnė nei birželį“; Rugpjūtis 14 val. 45 min.; Rugsėjis 12 val. 30 min.; Spalis 10 val. 25 min.; Lapkritis 8 val. 20 min.; Gruodis **7 val. 15 min.** („↘ trumpesnė nei lapkritį“, lankas 175–255).
  - Pažangos sąlyga patikrinta nuo švarios `localStorage`: po kovo — `simDone: false`, po birželio — `simDone: false`, po gruodžio — `simDone: true`.
  - Klaviatūra: `Tab` iš slankiklio → „◀ Ankstesnis“ → „Kitas ▶“; `ArrowRight` ant slankiklio perveda sausis → vasaris ir atnaujina `readout`; `Enter` ant „Kitas ▶“ perveda vasaris → kovas; `Space` ant „◀ Ankstesnis“ grąžina atgal.
  - `aria-valuetext` keičiasi kartu su būsena („Birželis, šviesu 17 val. 25 min.“), `svg` `aria-label` ir juostos `aria-label` — taip pat.

## PR

Neatidaryta. Pakeitimai palikti darbinėje kopijoje (`assets/js/sims/pasaulis.js`, `agents/proposals/…`, `research/wiki/guidelines/pilotai.md`, `agents/log/…`, `agents/state.json`) — commit ir publikavimą atlieka bėgiklis. Šaka: `agent/kurejas-2026-11-05`.

## Pasiūlymai (2)

1. `2026-11-05-simuliaciju-inzinierius-metu-laikai-uzduotys.json` — modulyje nėra užduoties apie šviesos trukmę, nors būtent tą klaidingą nuostatą modelis dabar parodo (perduoti metodininkui).
2. `2026-11-05-simuliaciju-inzinierius-augalo-dienos.json` — `augalo-gyvenimas` po 10 dienos nebereaģuoja į „Diena →“.

## Kas liko

- Pasiūlymas #44 (`metu-laikai` kaip iliustracija) šiuo darbu įgyvendintas; failo `status` lauke palikta `new`, nes statusų keitimą tvarko bėgiklis.
- Pasiūlymas #42 (`gyvunu-grupes` tekstinės dėžės) liko neatliktas — sąmoningai, nes vienas paleidimas skirtas vienai simuliacijai.
- `#/klase/1` 34 px slinkimas nepaliestas (ne mano vaidmens failai, matuota anksčiau).
