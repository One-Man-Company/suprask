# sveikatos-inspektorius — 2026-11-19T0651

- paleidimas: #375 (manual)
- trukmė: 374s
- modelio išėjimas: 1 (pirminis statusas: partial — baigėsi iteracijų limitas po matavimų)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash
- tikrinta: 2026-11-19 06:52–07:05 EET, HTTP/2, GitHub Pages
- repo HEAD: `08b79f4d851b82f2a608b016eb32ebd1485874cf`; darbinė kopija švari
- įrankiai: `curl`, `openssl`, `python3` (stdlib urllib), `scripts/check_view.py`, `scripts/check_docs_facts.py`; jokių mokamų stebėjimo paslaugų
- matavimo tvarka: kas 350 ms, kiekvienas URL du kartus (1 ir 2 ratas)
- žaliavos: `~/.hermes/profiles/deepseek41flash/cache/scratch/health375.json`, `view375_phonesmall.json`, `view375_desktop.json`
- pilna įrankių išklotinė: `agents/work/sveikatos-inspektorius/00375/ataskaita-visa.md` (katalogas `agents/work/` į repo neįtraukiamas)

## SPRENDIMAS: gyva svetainė VEIKIA. 0×404, 0 problemų, issue nekurtas.

## 1. Pagrindiniai resursai

| URL | kodas R1/R2 | baitai | ttfb |
|---|---|---|---|
| `/suprask/` (pradžia) | 200 / 200 | 3 487 | 0,228 / 0,220 / 0,247 / 0,251 / 0,336 s (5 matavimai) |
| `/index.html` | 200 / 200 | 3 487 | 0,21 s |
| `/assets/css/main.css` | 200 / 200 | 32 727 | 0,19 s |
| `/assets/js/app.js` | 200 / 200 | 32 808 | 0,24 s |
| `/assets/js/registry.js` | 200 / 200 | 5 071 | 0,20 s |
| `/assets/js/progress.js` | 200 / 200 | 11 664 | 0,22 s |
| `/assets/js/speech.js` | 200 / 200 | — | 0,98 s (šaltas CDN), R2 0,33 s |
| `/content/lt/grades.json` | 200 / 200 | 1 126 | 0,17 s |
| `/content/lt/grade-01/index.json` | 200 / 200 | 13 381 | 0,30 s |
| `/content/lt/grade-01/path.json` | 200 / 200 | 1 515 | 0,19 s |
| `/assets/audio/lt/manifest.json` | 200 / 200 | 63 974 (666 raktai) | 0,31 s |
| sim `art.js` | 200 / 200 | 51 153 | 0,22 s |
| sim `calba.js` | 200 / 200 | 75 486 | 0,24 s |
| sim `daile.js` | 200 / 200 | 9 554 | 0,19 s |
| sim `dorinis.js` | 200 / 200 | 13 692 | 0,18 s |
| sim `geometrija.js` | 200 / 200 | 47 415 | 0,21 s |
| sim `gyvenimas.js` | 200 / 200 | 11 126 | 0,19 s |
| sim `matematika.js` | 200 / 200 | 171 147 | 0,29 s |
| sim `muzika.js` | 200 / 200 | 23 086 | 0,20 s |
| sim `pasaulis.js` | 200 / 200 | 164 933 | 0,31 s |
| sim `technologijos.js` | 200 / 200 | 38 038 | 0,20 s |
| sim `zaidimai.js` | 200 / 200 | 21 014 | 0,20 s |

Visų 45 modulių JSON: **200 abiem ratams**, JSON validus, **sha256 sutampa su disku**. Lėčiausi atsakymai: `03-lankstymas-ir-karpiniai` 1,639 s (6 935 B, pirmas CDN praėjimas — R2 0,3 s), `18-kuprine-ir-kuno-dalys` 0,899 s, pradžia 0,757 s.

Suvestinė: **67 URL × 2 ratai = 134/134 200**; ratų skirtumų 0; baitų nesutapimų 0; JSON klaidų 0.

Neigiama kontrolė: `/content/lt/grade-01/matematika/99-nera.json` → **404** (svetainė nepamaskuoja trūkstamo failo).

## 2. Publikuota = repo = dokumentai

- `?v=08b79f4d` gyvame `index.html` = HEAD pirmi 8 simboliai. Visų shell failų baitai po `?v=<sha8>` nuėmimo sutampa su disku (0 skirtumų).
- Deploy: `last-modified` 2026-11-19 04:28:28 GMT, HEAD commit 06:27:57 EET (04:27:57 GMT) → **31 s**.
- Turinys gyvai: **9 kryptys / 45 moduliai / 197 užduotys** (4,38 vid.: 28 moduliai × 4, 17 × 5), `path.json` 45 žingsnių (0 už indekso, 0 indekse ne kelyje), `grades.json` 1 klasė „live", 45 moduliai, `updated 2026-11-18`.
- Sim registras: **45 SIMS raktų**, 45 modulių su `sim.component`, 0 trūkstamų, 0 nenaudojamų.
- Kortelė vs modulio puslapis (gyvas `index.json` × gyvas modulio JSON): **180 palyginimų** (title / subtitle / minutes / sim) → **0 nesutapimų**; `id`, `strand`, `grade` taip pat 0.
- `scripts/check_docs_facts.py` → **0 klaidų, 0 įspėjimų** (ARCHITEKTURA §Būsena „45 moduliai, 45 simuliacijos, 197 užduotys" atitinka failus).

## 3. Garsas

- Manifestas: 666 raktai = **1 332 mp3**, baitai identiški lokaliajam `manifest.json`.
- Imtis 40 failų (20 raktų × n/s, taisyklingas kelias `/assets/audio/lt/<rel>`): **40/40 200**, `Content-Length` sutampa su disku, 0 neatitikimų, HEAD 0,329–0,580 s.
- Diske: 1 332 mp3, vid. 32 000 B, mažiausias 12 999 B, didžiausias 90 531 B (`s/de6158f28323879e-5cd616a3.mp3`). Viso ~40,6 MB; nė vienas mp3 nepatenka į pirmą užkrovimą.

## 4. Sąsaja (`check_view.py --base https://one-man-company.github.io/suprask/`)

| plotis | patikros | problemos | overflow | smallTargets | tasksVisible | minTaskFont | eyebrowLines |
|---|---|---|---|---|---|---|---|
| phone 390 | 45 | 0 | 0 | 0 | 4/4 arba 5/5 | 19,14 | 1 |
| small 360 | 45 | 0 | 0 | 0 | 4/4 arba 5/5 | 18,96 | 1 |
| desktop 1440 | 45 | 0 | 0 | 0 | 4/4 arba 5/5 | 21,44 | 1 |

`voiceOnly` false visur; `simVisibleControls` ≥ 1 visur (mažiausiai 1 valdiklis — `04-kaip-zmones-sveikinasi`, `12-bendradarbiavimo-tiltas`); `clipped` 0; konsolės klaidos 0; `fatal`/`loading` false visur. Viso 135 patikros (45×3), 0 problemų, 0 pastabų.

Mažiausias sim aukštis `04-skaiciu-tiese` 78 px @360 (plona skaičių tiesė, 3 valdikliai, 4/4 užduotys, jokio kirpimo) — modelio forma, ne defektas. Didžiausias `05-plakatas-ir-informacija` 838 px @360.

## 5. Svoris (pirmas užkrovimas, 19 failų)

- **213 758 B gzip / 728 423 B raw.** Prieš 8 paleidimus (37 moduliai, 10 sim) buvo 159 374 B gzip — augimas +54,4 KB atėjo su didesniais sim failais.
- Didžiausias kodas: **`pasaulis.js` 47 590 gzip / 164 933 raw** (iki šiol didžiausias buvo `matematika.js` 44 943 / 171 147).
- CSS 11 040 gzip, `app.js` 10 808 gzip, `index.json` 3 784 gzip.
- Modulio JSON vid. 6 302 B, maks. 10 359 B, min. 3 595 B.

## 6. TLS ir išoriniai resursai

- Sertifikatas: Let's Encrypt **YR1**, `CN=*.github.io`, galioja 2026-09-30 – **2026-12-29**; `http://` → `https://` **301**.
- CSS: 0 `url(http…)`, 0 `@import` — jokių nuotolinių šriftų ar paveikslėlių.
- JS: „http" tik SVG namespace (`www.w3.org`) ir teksto nuorodos į `github.com/One-Man-Company/suprask`.
- HTML: nuorodos į `creativecommons.org`, `github.com`, `huggingface.co` — teksto nuorodos, ne resursai; po įkėlimo jokių tinklo užklausų.

## Pastabos (ne defektai, nieko netaisyta)

1. **Registro statinis importas**: `registry.js` įkelia visus 12 sim failų iš karto, todėl pradžia parsisiunčia 213 KB gzip net neatidarius modulio. Augant klasėms svoris augs tiesiškai (#242 fiksavo 159 KB). Architektūros sprendimas, ne gedimas; 2–12 klasėms reikės kodo skaidymo.
2. **Publikavimo ataskaitos versija**: #374 log'as matavo `?v=cc0225db`, o gyva dabar `08b79f4d` — po jo įvykęs `scripts/check_published.py` commit'as paleido naują deploy'ą. Svetainė vis tiek = HEAD.
3. `speech.js` pirmas atsakymas 0,98 s (šaltas CDN praėjimas), antras 0,33 s — modulis įkeliamas dinamiškai ir neprivalomai, sąsaja jo nelaukia.
4. Atviras #16892 (kortelės laukai nelyginami su moduliu) — išmatuota atskiru zond'u prieš gyvą bazę: 180/180 sutampa. Pasiūlymo uždarymas ne mano vaidmens.

## Ko nedariau

- Nekeista jokio turinio, kodo, dokumentų, `AGENTS.md`.
- Nekurtas issue: nė vieno ne 200, nė vieno JSON lūžio, nė vienos sąsajos problemos.
- Naujų pamokų nepridėjau: vaiko matomo defekto nerasta; ankstesnio paleidimo zondo adreso klaida (`/n/…` vietoj `/assets/audio/lt/n/…`) jau padengta esamų pamokų apie zondą, o ne apie sistemą.

## klaidos

```
session_id: local-ab3888cf82578482ebffeea41ea60b6edacda9b60aa41538415124c7b641c203
```
