# simuliaciju-inzinierius — 2026-11-04 (paleidimas #7) — struktūrizuota ataskaita

Bėgiko suvestinė šiam paleidimui (`simuliaciju-inzinierius-2026-11-04T1104.md`) yra jo paties surinktas žurnalas su `exit 1 → partial`. Šis failas yra to paties paleidimo rezultatų santrauka; žurnalas neperrašytas.

## Darbas

**Simuliacija:** `figuros` (`assets/js/sims/matematika.js`, modulis `content/lt/grade-01/matematika/06-figuros.json`).

Pasirinkta pagal vaidmens 2(c) punktą: auditorius (`agents/log/tikrintojas-2026-11-04T0643.md`) užfiksavo, kad `#/modulis/1/matematika/06-figuros` turi 41 px horizontalų slinkimą 360 px ekrane.

### Klaidinga nuostata

„Trikampis yra tai, kas atrodo kaip trikampis paveikslėlyje.“ Modulio `teacher.misconceptions[0]` sako, kad pasukta figūra neatpažįstama. Ankstesnė simuliacija to negriovė: visos figūros stovėjo viena orientacija, dėžės buvo pavadintos figūros vardu (žodžio atpažinimas vietoj savybės), figūros skirtingų spalvų (spalva apie figūrą nieko nesako).

### Kas pakeista

1. Figūros rodomos pasuktos: trys trikampiai (0°, 155°, 265°), stačiakampis, kvadratas 45° (rombas), trapecija, du skirtingo dydžio apskritimai. Fiksuota tvarka, modelis deterministinis (anksčiau `Math.random`).
2. Dėžės vadinamos savybe: „3 kampai / 4 kampai / 0 kampų“, su figūros kontūru ir kampų taškais — skaitoma ir be sklandaus skaitymo.
3. Naujas parametras **„Pasuk pasirinktą“** (+30°): vaikas sukasi figūrą ir mato, kad kampų skaičius nesikeičia.
4. Naujas jungiklis **„Rodyk kampus“**: kampai žymimi taškais, ištariamas skaičius (temiamas iš `scripts/generate_audio.py` `EXTRA`, naujų garso failų nereikia).
5. Klaidingas bandymas įvardija savybę, ne atsakymą: „Dar ne: figūra turi 3 kampus, o dėžėje — 4.“
6. Techninės pataisos: `flex` su `min-width:70px` → `grid` su `minmax(0,1fr)` (slinkimas 41 px → 0); `aria-label` visiems figūrų mygtukams (anksčiau jokio vardo); „Iš naujo“ nebeperkrauna komponento, o atstato būseną; `mount` grąžina valymo funkciją, kuri sustabdo laikmačius.

### Ribos

Nekeisti: turinio JSON (`sim.component`/`config` liko `figuros`/`{}`), `app.js`, `registry.js`, `main.css`, kiti sim failai. `#/klase/1` 34 px slinkimas sąmoningai neliestas — `app.js` + `.grid-2`, dizainerio sritis; pasiūlymas įrašytas.

## Patikra (realūs rezultatai)

- `python3 scripts/validate_content.py` → 0 klaidų, 0 įspėjimų; `--strict` taip pat 0/0.
- `python3 scripts/check_audio.py` → 308 tekstai, visi su `n` ir `s` įrašais, visi 22 050 Hz.
- `node` importas → `SIMS: skaiciu-tiese, desimtukas, figuros, desningumai`; `figuros.mount` yra funkcija. Registro raktai nepakitę.
- Chrome headless per CDP, `#/modulis/1/matematika/06-figuros`:
  - 360 px: `scrollWidth == clientWidth`, **0 px** slinkimo (prieš: 41 px). 320 px ir 414 px — taip pat 0.
  - 14 interaktyvių taikinių scenoje; nė vieno < 48 px (figūros 69×69, dėžės 95×112, valdikliai 48 px aukščio).
  - Konsolės klaidų: 0. Visi 15 maršrutų (`#/`, `#/klase/1`, 13 modulių): 0 konsolės klaidų, moduliuose 0 slinkimo.
  - Seka: pasirinkimas → pasukimas 0°→30° → 3 kampų taškai → klaidinga dėžė → teisinga → 8/8 figūrų įdėtos, `simDone: true` → „Iš naujo“ atstato 8 figūras ir tuščias dėžes.
  - Klaviatūra: `Tab` eiliškumas (8 figūros → 3 dėžės → 3 valdikliai), `Enter` pasirenka, `Space` įdeda; įdėta figūra tikrai paslepiama (`display:none`, plotis 0, nefokusuojama) — aptikta ir ištaisyta savybė: įterptas `display:grid` nustelbdavo `[hidden]{display:none}`.
  - Geometrija: visos figūros telpa į `viewBox` (`getBBox` 0–100), pasuktas 155° trikampis 84×80.
- Pilotas: `research/wiki/guidelines/pilotai.md` P-003 (hipotezė + matavimo kriterijus, pagal gairių T6.1).

## PR

- Šaka `agent/sim-2026-11-04` (atskiras `git worktree`, kad `kurejas` nebaigti pakeitimai nelįstų į PR).
- PR #1: https://github.com/One-Man-Company/suprask/pull/1 — 2 failai, +283/−68.
- CI `validate`: **pass** (run 41806072388).
- Commit: `a45e896 Figūros: rūšiavimas pagal kampus, pasukimas ir 360 px slinkimo pataisa`.

## Pasiūlymai (3)

1. `2026-11-04-simuliaciju-inzinierius-klase-1-slinkimas.json` — `#/klase/1` 34 px slinkimas (matuota; dizaineriui).
2. `2026-11-04-simuliaciju-inzinierius-gyvunu-dezes.json` — `gyvunu-grupes` dėžės tekstinės, ta pati defektų klasė (pasaulio pažinimas).
3. `2026-11-04-simuliaciju-inzinierius-metu-laikai.json` — `metu-laikai` yra iliustracija su mygtukais, ne modelis (§4.1).

## Kas liko

- Niekas iš vaidmens baigties sąlygos: PR yra, validatorius praeina, PR aprašyme yra klaidinga nuostata ir patikra, ataskaita įrašyta, `state.json` atnaujintas.
- Ne mano sritis, bet fiksuota: `#/klase/1` slinkimas, `metu-laikai` ir `gyvunu-grupes` trūkumai (pasiūlymuose).
