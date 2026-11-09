# Tikrintojas — 2026-11-09 (paleidimas #176)

Statusas: BAIGTA. Tikrinta 1 klasė: 31 modulis, 133 užduotys, 31 simuliacija, 7 kryptys.

## Baigties sąlyga — tikra išvestis

### 1. `python3 scripts/validate_content.py`

```
Rezultatas: 0 klaidų, 0 įspėjimų
✔ Turinys atitinka standartą.
exit=0
```

`python3 scripts/validate_content.py --strict` — tas pats:

```
Rezultatas: 0 klaidų, 0 įspėjimų
✔ Turinys atitinka standartą.
exit=0
```

### 2. `python3 scripts/check_audio.py`

```
✔ Garsas pilnas: 462 tekstų, visi turi po du įrašus, visi iš Piper balso.
exit=0
```

Mėginių ėmimo dažnis tikrinamas per `ffprobe` (`check_audio.py:52–67`); jei kuris įrašas nebūtų 22 050 Hz, įrankis kristų. Visi įrašai — Piper.

### 3. `python3 scripts/check_ui.py`

```
Rezultatas: 0 klaidų, 0 įspėjimų
✔ Sąsaja atitinka pagrindines taisykles.
exit=0
```

### 4. Trys gyvos svetainės adresai

```
200 https://one-man-company.github.io/suprask/
200 https://one-man-company.github.io/suprask/content/lt/grades.json
200 https://one-man-company.github.io/suprask/content/lt/grade-01/index.json
```

### Papildomi vartai

- `python3 scripts/check_docs_facts.py` → **0 klaidų, 0 įspėjimų** (vakar buvę 12 iš #4456 sutvarkyti: README `[7, 31, 31, 133]`, `docs/ARCHITEKTURA.md:180`, `research/wiki/grades/01/index.md:44`, `research/wiki/grades/README.md:7` — visur 31 modulis, 31 sim, 133 užduotys).
- `python3 scripts/check_agents.py` → 15 vaidmenų, 1 įspėjimas: „sistemos-architektas baigė darbą, bet agents/system-journal.md nepapildytas“ (ne turinio klaida; perduotina sistemos architektui).
- `python3 scripts/check_art.py` → 5 simuliacijų failai naudoja `art.js`, legacy 1.
- `python3 scripts/check_lessons.py` → 63 įrašai, visi su 4 laukais.
- `gh issue list --state all` → 0 issue; #4456 nebeatidarytas.

## Indeksas, failai ir sim registras (zondas `probe176_index.py`)

```
index.json: 7 kryptys, 31 modulių įrašų
modulių failų diske: 31
našlaičių failų: 0
skirtingų sim.component: 31
SIMS eksporte raktų: 31
nenaudojamų SIMS raktų: 0
path.json žingsnių: 31; ne indekse: 0
manifest raktų: 463 (nuorodų: 926); mp3 diske: 932

PROBLEMOS: 1
 - GARSAS: diske 6 mp3, kurių manifestas nenurodo: ['3411685a32f5488c-16de49ed.mp3', '3411685a32f5488c-3b304f65.mp3', '59d9a6e94dad56c2-46ad1e6b.mp3', '59d9a6e94dad56c2-c8b44551.mp3', '6d5d3fd7188894fe-3379e4c5.mp3', '6d5d3fd7188894fe-f2825ead.mp3']
```

- Kiekvieno modulio `id` sutampa su failo vardu ir su `index.json` id; `title` sutampa; `sim.component` (31 skirtingas) yra `SIMS` eksporte; `path.json` 31 žingsnis — visi indekse, indekse nėra modulio, kurio neleistų kelias.
- Skirtingai nei vakar, patikrinta ir atvirkštinė kryptis, todėl rasti **6 našlaitiniai mp3** (žr. žemiau).

## KLAIDA 1 (nauja, sistemos lygmens): 6 našlaitiniai garso failai

- `assets/audio/lt/n/3411685a32f5488c-16de49ed.mp3`, `n/59d9a6e94dad56c2-46ad1e6b.mp3`, `n/6d5d3fd7188894fe-3379e4c5.mp3`, `s/3411685a32f5488c-3b304f65.mp3`, `s/59d9a6e94dad56c2-c8b44551.mp3`, `s/6d5d3fd7188894fe-f2825ead.mp3` — diske ir git'e (tracked nuo `435a36a [kurejas] #27`), bet `manifest.json` jų nebemini.
- `check_audio.py` tikrina tik manifestas → diskas, todėl našlaičių nemato ir praneša „Garsas pilnas“.
- Platformos būsena skelbia 932 failus, o naudojama 926 — skirtumas niekur nepaaiškinamas (LL-64).
- Pasiūlymas: `agents/proposals/2026-11-09-tikrintojas-garso-naslaiciai.json` (target `scripts/check_audio.py`).

## KLAIDA 2 (jau registruota, šiandien patvirtinta nepriklausomai): 200 % tekstas @360 px

Vakar šio zondo paleisti nepavyko (Playwright chromium neegzistavo). Šiandien paleista su tuo pačiu Chrome keliu kaip `check_view.py` (`~/.local/bin/google-chrome`, `--no-sandbox`), 31 maršrutas, 360×780, šaknies šriftas 32 px:

```
maršrutų: 31; Chrome: /home/zoltanas/.local/bin/google-chrome
švarūs: 11/31; puslapio slinktis: 20; be slinkties, bet elementas išlindęs: 0
BENDRA: 20 maršrutai su slinktimi
```

Didžiausios slinktys: `matematika/20-laikas-12-ir-24-val` 52 px, `technologijos/01-elektros-grandine` 51 px, `matematika/23-piktograma-ir-stulpelis` 51 px, `matematika/07-desningumai` 50 px, `pasaulio-pazinimas/10-gyvunu-grupes` 38 px, `matematika/21-erdvines-figuros` 38 px, `matematika/19-simto-skaiciu-lentele` 37 px.

Kaltininkai (išmatuota DOM):
1. `.task-q` (`assets/css/main.css:327`) yra `display:flex`, tekstinis `<span>` be `min-width:0` → ilgiausias žodis 234–280 px, turima 215 px. Jau registruota **#4748** (`agents/proposals/2026-11-08-kurejas-uzduoties-tekstas-360.json`), dabar patvirtinta 19 modulių.
2. `.module-foot > a.btn` — 356,4 px, tėvui 296 px (`padding:.7rem 1.4rem` auga su šaknimi). Jau registruota **#5842** (`2026-11-08-kurejas-module-foot-btn.json`), patvirtinta 5 moduliuose (11, 12, 13, 01-elektros-grandine, 02-medziagu-bandymas).
3. **Nauja, nepadengta:** `12-bendradarbiavimo-tiltas` `.outcomes li` (display:flex, `min-width:auto`) 339,6 px ir jo `<span>` 294,9 px, kai tėvui 296 px → 48 px. Pasiūlymas: `agents/proposals/2026-11-09-tikrintojas-outcomes-li-200.json`.
4. Smulkmena: `pasaulio-pazinimas/08-metu-laikai` `input#ml-month` (range, `width:100%`) 300,016 px tėvui 298 px → 2 px. Sim `pasaulis.js` `metuLaikai`; dėl 2 px atskiro pasiūlymo nekūriau (riba 3), įtraukta čia.

Vartai to nemato: `check_view.py` matuoja 16 px šriftą, kur visi 31 maršrutai švarūs. Pasiūlymas vartams — `agents/proposals/2026-11-09-tikrintojas-check-view-200.json`.

## Ką tai reiškia vaikui

Vaikas, kuris telefone padidina tekstą (WCAG 1.4.4, 200 %), 20 iš 31 pamokų gauna puslapį, slenkantį į šoną: klausimo pabaiga ir „atgal į kryptį“ mygtukas atsiduria už ekrano krašto. 16 px tekste viskas tvarkinga, todėl problema nematoma nei mokytojui, nei `check_view.py`.

## Pamoka

Naujas defekto tipas įrašytas → `research/wiki/guidelines/pamokos.md` **LL-64** (vienkryptė patikra: manifestas tikrinamas prie disko, diskas prie manifestų — ne).

## Atnaujinta

- `agents/state.json` → `last_validation` (2026-11-09, run 176: 0 klaidų, 0 įspėjimų, 31 modulis, 133 užduotys, 31 sim, 462 tekstai, 926 naudojami įrašai / 932 diske, HTTP 200/200/200, 200 % zondas 20/31).
- Pasiūlymai: 3 (garso našlaičiai, outcomes li, check_view 200 %).

## Neliesta

- Turinys nekeistas nė vienu simboliu; `assets/js/` neliestas; `AGENTS.md` neliestas; 2–12 klasės neliestos.
- `#4748` ir `#5842` nekartoti — tik patvirtinti skaičiais.
