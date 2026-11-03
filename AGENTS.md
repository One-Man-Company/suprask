# SUPRASK — DOX šaknis

Šis failas yra privaloma darbo sutartis visam repo. Prieš keisdamas bet kurį failą, perskaityk šį dokumentą ir visus `AGENTS.md` failus kelyje nuo šaknies iki tavo tikslo.

## Paskirtis

Atvira, nemokama, interaktyvi vizualinio mokymosi platforma Lietuvos 1–12 klasei. Statinė svetainė (GitHub Pages), turinys — JSON, simuliacijos — savarankiški JS komponentai. Jokių išorinių priklausomybių, jokio surinkimo žingsnio, jokio duomenų rinkimo.

## Nuosavybė

- Platformos kodas ir turinio schema — `assets/`, `scripts/`, `docs/`.
- Mokymosi turinys — `content/lt/grade-XX/`.
- Tyrimų ir metodų bazė — `research/wiki/`.
- Automatizuoti agentai — `agents/`.

## Vietinės sutartys (privalomos)

1. **Gairės viršuje.** Bet koks turinio ar funkcijos sprendimas turi atitikti `docs/SVIETIMAS-1-GAIRES.md`. Prieštaraujantis turinys atmetamas, o ne „pritaikomas“.
2. **Schema nepajudinama be dokumento.** Modulio JSON laukai keičiami tik kartu atnaujinant `docs/KURINIO-STANDARTAS.md` ir `scripts/validate_content.py`.
3. **Jokių išorinių resursų.** Joks CDN, web font, analitika, sekimo skriptas, nuotolinis API iš kliento pusės.
4. **Jokių asmens duomenų.** Jokia forma nerenkama, nesiunčiama, neloginama. Pažanga — tik `localStorage`.
5. **Kalba.** Vartotojo sąsaja ir turinys — lietuvių kalba, oficiali terminija (pvz. *skaičių tiesė*, ne *linija*).
6. **Be vykdymo žingsnio.** `index.html` + `assets/` + `content/` turi veikti tiesiogiai iš GitHub Pages.
7. **Prieinamumas ne pasirinkimas.** ≥48 px taikiniai, kontrastas ≥4,5:1, klaviatūra, `aria-label`, garso išjungimas.

## Darbo gairės

- Naują modulį pradėk nuo `content/lt/grade-XX/index.json` įrašo, tada failo, tada validatoriaus.
- Naują simuliaciją pridėk tik tada, kai ji prideda supratimo, kurio neprideda tekstas ar paveikslėlis.
- Nekeisk kelių klasių vienu metu. Viena klasė — vienas vertikalus pjūvis (turinys + tyrimai + metodai).
- Jei kažko trūksta — užrašyk į `research/wiki/guidelines/klausimai.md`, o ne spėk.
- Destruktyvūs veiksmai (trynimas, pervardijimas) — tik su aiškiu pagrindimu ir atnaujintais indeksais.

## Patikra

- `python3 scripts/validate_content.py` — privaloma prieš kiekvieną turinio commit.
- `python3 scripts/validate_content.py --grade N` — vienos klasės patikra.
- Svetainė turi įsikelti be konsolės klaidų; simuliacija turi reaguoti į įvestį 360 px pločio ekrane.
- CI (`.github/workflows/validate.yml`) kartoja validatorių kiekviename PR.

## Vaikų DOX indeksas

| Failas | Ką apima | Ką palieka šiam (šaknies) failui |
|---|---|---|
| `content/AGENTS.md` | modulių JSON, indeksai, klasių struktūra | schemos stabilumą, kalbos taisykles |
| `assets/AGENTS.md` | HTML, CSS, JS maršrutizatorius, pažanga, garsas | bendruosius principus, publikavimą |
| `assets/js/sims/AGENTS.md` | simuliacijų komponentai ir jų API | turinio formatą, vertinimo taisykles |
| `research/AGENTS.md` | wiki vault, tyrimai, gairių gyvoji versija | privalomą gairių dokumentą `docs/` |
| `agents/AGENTS.md` | agentų vaidmenys, grafikai, būsena | gaires, kurias agentai privalo vykdyti |
| `docs/AGENTS.md` | normatyviniai dokumentai | kodo ir turinio failus |
| `scripts/AGENTS.md` | validatorius, pagalbiniai įrankiai | turinio turinį |

## Vartotojo pageidavimai (ilgalaikiai)

- Projektas turi likti **visiškai nemokamas ir atviras**; jokių mokamų paslaugų, domenų ar API raktų priklausomybių.
- Turinys pradedamas **lietuvių kalba**, bet struktūra turi leisti pridėti kitas kalbas be kodo pakeitimų.
- Platforma turi būti **modulinė**: nauja klasė, kryptis ar simuliacija pridedama be esamo kodo perrašymo.
- Kiekviena klasė turi turėti **savo** turinio ir metodų struktūrą, atitinkančią to amžiaus galimybes.
