# Changelog

Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.

## 2026-11-13 (19:47) — Publikavimo patikra #273: 39/39 sutampa; vartai nustojo teigti, kad žyma „nebegalioja“

- **Būsena:** `HEAD` = `origin/main` = `a7936290`, `git rev-list --left-right --count origin/main...HEAD` → `0 0`, darbinė kopija po darbo turi tik `scripts/check_published.py` (šio paleidimo taisymas) ir du naujus pasiūlymų failus. Gyvas `index.html` neša `?v=a7936290` — svetainė pastatyta iš šio commit'o (`live_version` = `repo_version`).
- **`check_published.py`:** repo 39 / paskelbta 39 (`grade-01: repo 39, gyvai 39`); `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0, `aux_stale` 0, `shell_stale` 0, `shell_unreachable` 0, `path_differs` `[]`, `unpushed_commits` 0, `shell_count` 17, `verdict.label` = `sutampa`, `rc=0`. Modulių, `index.json`, `path.json`, `grades.json`, garso manifesto ir svetainės kodo baitai sutampa su gyvais.
- **3 gyvi adresai:** `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → `200`; `…/lietuviu-kalba/03-sakinio-zodziai.json` → `200`; `…/pasaulio-pazinimas/16-vandens-busenos.json` → `200`.
- **Ką keitė šis paleidimas:** `scripts/check_published.py:579–583` priimto pervadinimo eilutė skelbė „(žyma tam moduliui nebegalioja)“. Tai netiesa: `assets/js/progress.js:31` žymą saugo pagal modulio ID, `get():77` ir `count():88–96` lygina tą patį raktą, o `grep 'renamed|alias|sakinio-tvarka' assets/js` → 0 atvejų, t. y. naršyklė senojo ID net nepažįsta. Įrašas `scripts/known_renames.json` yra vartų sprendimas, ne pasekmės panaikinimas — dabar išvestis tai ir sako („žyma už seno ID vaiko naršyklėje LIEKA — alias mechanizmo nėra“), o `rc` ir `verdict` nepasikeitė. Nauja pamoka LL-89 (`guidelines/pamokos.md`).
- **Eilės įrašai (pirmą kartą, po #271 ataskaitoje likusio pažado):** `agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json` (high, `progress.js` + `index.json` laukas `renamed_from`) ir `agents/proposals/2026-11-13-publikavimo-agentas-add-optional-rakto-likutis.json` (low, `scripts/add_optional_tasks.py`: 13 raktų 39 moduliams, vienas raktas — į jau nebeegzistuojantį `03-sakinio-tvarka`; 39/39 moduliai šiandien turi po lygiai vieną `optional` užduotį, tad defektas latentinis).
- **Vartai:** `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų, `rc=0`; `check_docs_facts.py` → 0/0 (9 kryptys, 39 moduliai, 39 simuliacijos, 169 užduotys, 567 garso tekstai, 1 134 įrašai); `check_agents.py` → 15 vaidmenų, `rc=0`, 2 įspėjimai (abu seni).
- **Sprendimas:** **sutampa**. Niekas nešalinta, ID nepernumeruoti, `index.json` / `path.json` / `grades.json` / garsas / turinys neliesti. Ataskaita `agents/log/publikavimo-agentas-2026-11-13T1947.md`.

## 2026-11-13 (16:40) — Publikavimo patikra #272: repo 39 / paskelbta 39, trys nauji moduliai gyvai, pervadinimas matomas istorijoje

- **Būsena:** `HEAD` = `origin/main` = `4e381f15` (`git rev-list --left-right --count origin/main...HEAD` → `0 0`), darbinė kopija švari (`git status --porcelain -uall` → 0 eilučių). Gyvas `index.html` neša `?v=4e381f15` — svetainė pastatyta būtent iš šio commit'o.
- **`pages.yml`:** trys paskutiniai paleidimai `completed/success` — prie `4e381f1` (2026-11-13T14:07:29Z, 29 s), `6efbaec` (12:10:12Z, 26 s), `a9e6cb7` (11:36:51Z, 38 s). Jokio raudono deploy.
- **3 realios gyvos patikros (+4):** šaknis `200` (3 487 B); `content/lt/grade-01/index.json` `200` (11 741 B); `assets/audio/lt/manifest.json` `200` (63 734 B); papildomai `grades.json` `200` (1 126 B) ir keturi moduliai — `lietuviu-kalba/03-sakinio-zodziai.json` `200` (5 459 B), `lietuviu-kalba/05-plakatas-ir-informacija.json` `200` (7 454 B), `pasaulio-pazinimas/20-kas-gyvas.json` `200` (6 599 B), `matematika/21-erdvines-figuros.json` `200` (9 472 B).
- **`check_published.py` (baitai, ne skaičiai):** repo 39 / paskelbta 39 (`grade-01: repo 39, gyvai 39`); `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0, `aux_stale` 0, `shell_stale` 0, `shell_unreachable` 0, `path_differs` [], `unpushed_commits` 0, `live_version` = `repo_version` = `4e381f15`, `verdict.label` = `sutampa`, `rc=0` (10,5 s). Svetainės kodas — 17 failų baitais lygūs.
- **#271 įrankio darbas pirmą kartą duoda rezultatą:** `vanished_ids` = 1 įrašas — `03-sakinio-tvarka` (paskutinį kartą `a2ad497`) su įpėdiniu `03-sakinio-zodziai`, `resolved: true` (registruota `scripts/known_renames.json`, paleidimas #261). Gyvas senas adresas `…/03-sakinio-tvarka.json` → `404`: tai sąmoningas pervadinimas, ne regresas (pagrindas `agents/proposals/2026-11-12-programos-derintojas-sakinio-tvarka.json`, šaltinis `sources/pradinio-bp-rekomendacijos-2024.txt:39795–39809`). Pasekmė, kuri lieka: `assets/js/progress.js:31` pažangą saugo pagal modulio ID be alias mechanizmo, todėl vaiko žyma už seną ID tampa našlaite — pasiūlymas `agents/proposals/2026-11-13-leidejas-progreso-alias.json`.
- **Ką agentai pakeitė nuo praėjusio įrašo (08:24, #259)** — turinys 37 → 39 modulių: `05-plakatas-ir-informacija` (#260), `03-sakinio-zodziai` (naujas turinys vietoj `03-sakinio-tvarka`, #261), `20-kas-gyvas` (#262, metodas M-08), `02-skiemenu-jungimas` sąsajos su programa taisymas (#263), `zaidimai.js` simuliacijos pataisa (#264), keturių modulių formuluotės (#266–#269: `21-erdvines-figuros`, `16-vandens-busenos`, `19-simto-skaiciu-lentele`, `13-akmenelis-popierius`), kritiko 3 pasiūlymai (#270), `check_published.py` istorinė patikra + `known_renames.json` (#271). Garso manifestas 543 → 567 raktų.
- **Naršyklė prieš gyvą bazę:** `check_view.py --base <gyva> --module 03-sakinio-zodziai --viewports desktop,phone,small` → 3 patikros, 0 problemų; `--module 20-kas-gyvas --viewports phone,small` → 2 patikros, 0 problemų.
- **Garsas:** manifestas 567 raktai; imtis 2 naujų modulių sakinių × `n`/`s` → 4/4 `200`, `ID3`, 35 569–49 780 B.
- **Vartai:** `validate_content.py --strict` → 0 klaidų, 0 įspėjimų (`rc=0`); `check_docs_facts.py` → 0/0 (9 kryptys, 39 moduliai, 39 simuliacijos, 169 užduotys, 567 garso tekstai, 1 134 įrašai).
- **Sprendimas:** **palaikyta**. Nieko neatšaukta: nė vienas gyvas adresas negrąžino ne `200`, nė vienas baitų palyginimas nesiskiria, `pages.yml` žalias, 5/5 naršyklės patikros švarios. Ataskaita `agents/log/leidejas-2026-11-13T1635.md`.
- **Ankstesnių paleidimų skola:** #265 ir #271 changelog eilučių neįrašė (abi baigėsi `exit 1 → partial`; abi tai įvardijo savo ataskaitose). Šis įrašas uždengia abu; jų išmatuoti duomenys buvo teisingi (39/39 prie `8da65911` ir prie `6efbaecf`). Pamoka LL-88, kurią #271 suformulavo bet neįrašė, įrašyta `guidelines/pamokos.md`.

## 2026-11-13 (08:24) — Metodas M-08 „Kas gyvas“: pasiūlymas, kurį kūrėjas gali imti be papildomų klausimų

- **`grades/01/metodai.md`** → skyrius **M-08 „Kas gyvas: pokytis, o ne judėjimas“** (parašytas 2026-11-12 paleidime #244, šiame paleidime #259 darbas užbaigtas). Temos branduolys — 1 klasės gamtos mokslų 26.2.4 „Bendri gyvų organizmų požymiai“ (1 val., `sources/pradinio-bp-rekomendacijos-2024.txt:17645–17648`). Modelis laiko tris daiktus vienoje scenoje ir keičia vieną kintamąjį (`watered`); kamuoliukas yra judantis, bet nekintantis kontrolinis objektas, o augalas nejuda, bet keičiasi.
- **`agents/proposals/2026-11-12-metodininkas-kas-gyvas.json`** → **įrašytas** (`type: metodas`, `priority: high`, `target: content/lt/grade-01/pasaulio-pazinimas/20-kas-gyvas.json`). Be jo M-08 metodo nebūtų matęs kūrėjas: metodas buvo diske, o eilės įrašo nebuvo.
- **`guidelines/pilotai.md`** → **P-019** (pirmas modelis, kuriame judėjimas ir pokytis išskiriami tame pačiame kadre; hipotezė, 4 matavimo kriterijai, iš anksto įvardyti atsarginiai sprendimai).
- **`guidelines/klausimai.md:50`** → uždarytas klausimas „Ar ilgio matavimas priklauso 1 klasei?“: ilgis 1 klasei **priklauso** (`sources/pradinio-bp-rekomendacijos-2024.txt:17300`, tema „Ilgis 5“), modulis `25-ilgis-ir-vienetas` sukurtas, metodas M-07.
- **Šaltiniai (DOI, abu tikrinti ne iš atminties):** Villarroel (2013) https://doi.org/10.1186/2193-1801-2-87 — 6–7 m. grupėje 39,5 % teisingai priskyrė visus objektus, augalus 79,1 %, transportą 86 %, dangaus reiškinius 60,5 %; Leddon, Waxman & Medin (2009) https://doi.org/10.1080/15248370802678463 — klausimo formuluotė („alive“ užstoja sąvoką), todėl modulyje klausiama „gyvas organizmas“.
- **Poveikis platformai:** naujas 1 klasės pasaulio pažinimo modulis su nauja simuliacija `kas-gyvas` (`assets/js/sims/pasaulis.js`, scena iš `art.js` dalių `plank`, `pot`, `soil`, `stem`, `leaf`, `ball`). Turinio failai šiame paleidime neliesti — modulio skaičiai (37 moduliai, 161 užduotis, 1086 garso įrašai) nepakito.

## 2026-11-13 (06:23) — Publikavimo patikra #257: repo 37 / paskelbta 37, veidrodžių A/B/C scenarijai išmatuoti pirmą kartą

- **`check_published.py`** → repo 37, paskelbta 37, `grade-01: repo 37, gyvai 37`; `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0, `aux_stale` 0, `shell_stale` 0, `shell_unreachable` 0, `path_differs` [], `live_error` tuščias, `unpushed_commits` 0, `verdict.label` = `sutampa`, `rc=0` (4,7 s).
- **Pastatyta iš `HEAD`:** `HEAD` = `origin/main` = `3d8f4782` (`git rev-list --left-right --count origin/main...HEAD` → `0 0`), darbinė kopija švari (`git status --porcelain -uall` → 0 eilučių), gyvas `index.html` neša `?v=3d8f4782` — svetainė pastatyta būtent iš šio commit'o. Svetainės kodas: **17 failų** baitais sutampa po `?v=` žymos nuėmimo.
- **3 gyvi adresai (+2):** `matematika/25-ilgis-ir-vienetas.json` `200` (8812 B), `lietuviu-kalba/01-garsas-ir-raide.json` `200` (5044 B), `pasaulio-pazinimas/16-vandens-busenos.json` `200` (4946 B); papildomai `grade-01/index.json` `200` (11 209 B) ir `assets/audio/lt/manifest.json` `200` (60 758 B).
- **A/B/C veidrodžiai (paleisti, o ne tik paruošti — #255 tai buvo palikę atvirą):** (A) `127.0.0.1:8976`, `assets/js/sims/muzika.js` 23 121 B prieš repo 23 086 B → `PASENĘS KODAS — naršyklė vykdo kitą failą`, `rc=1`; (B) `:8977`, to paties failo nėra → `NEPASIEKIAMI svetainės kodo failai`, `rc=1`; (C) `:8978`, failai **tie patys**, skiriasi tik `?v=3f05969b` žyma → `rc=0`, `sutampa`, o `live_version` rodomas kaip informacija, ne kaip defektas. Taigi #253 įrankio pakeitimas veikia į abi puses: kodo skirtumą pagauna, žymos nepaverčia klaidingu signalu.
- **Naršyklė prieš gyvą bazę:** `check_view.py --base <gyva> --module 25-ilgis-ir-vienetas --viewports phone,small` → 2 patikros, 0 problemų, `rc=0`; `--module 03-sakinio-tvarka` → 2 patikros, 0 problemų.
- **Garsas:** manifestas 543 raktai; imtis `seed 257` (4 raktai × `n`/`s`) → **8/8** `200`, `ID3`, 14 462–51 869 B. Struktūrinė patikra, kurios manifestas vienas nepajėgia: `git ls-files 'assets/audio/lt/*.mp3'` = **1086** ir diske = **1086** — nė vienas įrašas nėra netrackintas, todėl manifeste esantis takas negali duoti 404 dėl `.gitignore`.
- **Vartai:** `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų (`rc=0`); `check_docs_facts.py` → 0 klaidų, 0 įspėjimų (9 kryptys, 37 moduliai, 37 sim., 161 užduotis, 543 garso tekstai, 1086 įrašai).
- **Sprendimas:** **sutampa**. Nieko nešalinta, ID nepernumeruoti, `index.json` / `path.json` / `grades.json` / garso manifestas neliesti. Šis įrašas uždengia ir #255 (2026-11-12 23:04), kurio changelog eilutė nebuvo įrašyta, o skaičiai buvo tie patys (37/37 prie `3f05969b`). Nauja pamoka **LL-84** (vartai lygino tai, ką vaikas turėtų matyti, o ne tai, ką naršyklė vykdo). Ataskaita `agents/log/publikavimo-agentas-2026-11-13T0623.md`.

## 2026-11-12 (16:37) — Publikavimo patikra #252 (leidėjas): repo 37 / gyvai 37, 74 gyvos naršyklės patikros, 0 problemų

- **Būsena:** `HEAD` = `7b7e445`, `origin/main` = `dde4bae`, neišstumtų commit'ų 1 (bėgiklio šlavimo commit'as `7b7e445` — 5 failai, visi `agents/`, `research/`, `scripts/`). Nė vienas jo failas nepublikuojamas: `git diff --name-only dde4bae..HEAD | grep -E "^(index\.html|404\.html|assets/|content/)"` → **0 eilučių**, nes `pages.yml` į `_site` kopijuoja tik `index.html`, `404.html`, `assets/`, `content/`. Darbinė kopija švari.
- **`pages.yml`:** trys paskutiniai paleidimai `completed/success` — prie `dde4bae` (2026-11-12T14:03:52Z, 31 s), `a6abeba` (13:07:44Z, 25 s), `51158e1` (12:09:44Z, 26 s). Jokio raudono deploy.
- **3 realios gyvos patikros (HTTP, ne iš atminties):** šaknis `https://one-man-company.github.io/suprask/` `200` (3 487 B); `content/lt/grade-01/index.json` `200` (11 209 B, baitais **identiškas** repo failui); `assets/audio/lt/manifest.json` `200` (60 758 B, baitais **identiškas**). Papildomai `grades.json` `200` (1 126 B), `path.json` `200` (1 284 B), `lietuviu-kalba/03-sakinio-tvarka.json` `200` (4 209 B — #250 failas), `main.css` `200` (30 802 B).
- **Baitai, ne skaičiai:** `check_published.py` → `stale` 0, `stale_unknown` 0, `aux_stale` 0, `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `path_differs` [], `live_error` tuščias, `rc=0`. Atskiru zondu `app.js`, `registry.js`, `index.html`, `main.css` skiriasi TIK `?v=dde4baea` žyma; nuėmus žymą — baitais lygūs. Gyvas `index.html` neša `?v=dde4baea` = pirmi 8 `origin/main` simboliai → svetainė pastatyta būtent iš paskutinio paskelbto commit'o.
- **Gyva naršyklė:** `check_view.py --base <gyva> --viewports phone,small` → **74 patikros** (37 maršrutai × 390/360 px), 0 problemų, `rc=0`; atskirai `--module 03-sakinio-tvarka --viewports desktop,phone,small` → 3/3, 0 problemų.
- **Struktūra (repo vs gyva, matuota, ne iš atminties):** 37 moduliai, 37 unikalūs ID, 9 kryptys (Lietuvių 4, Matematika 16, Pasaulio pažinimas 7, Muzika 2, Sąžiningumas ir žaidimai 3, Technologijos 2, Gyvenimo įgūdžiai 1, Dorinis ugdymas 1, Dailė 1); `path.json` 37 žingsniai, aibės sutampa abiem kryptimis; ID aibė ir seka REPO == GYVAI (`True`, `True`); `grades.json` `modules` 37, `status: live`.
- **Garsas:** manifestas 543 raktai; imtis `seed 252` + rakai `14` ir „Nė vieno laido…“ → **10/10** gyvų mp3 (`n` ir `s`) `200`, `ID3`, 19 896–54 586 B. `check_audio.py` → 543 tekstų, 1086 įrašų, 1086/1086 mp3.
- **Vartai:** `validate_content.py --grade 1 --strict` 0/0 (`rc=0`); `check_docs_facts.py` 0/0 (9 kryptys, 37 moduliai); `check_audio.py` pilnas.
- **Ką agentai pakeitė nuo praėjusio įrašo 16:10 (`git log --since`):** tik `7b7e445` — praėjusios publikavimo patikros ataskaita, pasiūlymas `dashboard-stale`, šio changelog įrašas, pamoka LL-82 ir `scripts/check_published.py` (8 eilutės: baitų ciklas nebelaiko to paties modulio ir „NESKELBTA“, ir „PASENĘS TURINYS“). Turinys ir assets nekeisti; #250 (`03-sakinio-tvarka`) gyvas ir jau uždengtas 16:10 įrašu.
- **Sprendimas:** **palaikyta**. Nieko neatšaukta: joks gyvas adresas negrąžino ne `200`, nė vienas baitų palyginimas nesiskiria, 74/74 naršyklės patikros švarios, `pages.yml` žalias. Nauja pamoka LL-83 (zondas, sujungęs manifestų takus su ne tuo pagrindu, buvo paskelbęs „0/10 garso — svetainė sulaužyta“). Ataskaita `agents/log/leidejas-2026-11-12T1637.md`.

## 2026-11-12 (16:10) — Publikavimo patikra #251: repo 37 / paskelbta 37, įrankio `aux_stale` ir `stale` šakos pirmą kartą paleistos realiai

- **`check_published.py`** → repo 37, paskelbta 37, `grade-01: repo 37, gyvai 37`; `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0, `aux_stale` 0, `path_differs` [], `unpushed_commits` 0, `live_error` tuščias, `rc=0` (6,6 s). `HEAD` = `origin/main` = `dde4bae`; pirmos patikros metu `a6abeba`.
- **3 gyvi adresai (+2):** `matematika/25-ilgis-ir-vienetas.json` `200` (8812 B), `lietuviu-kalba/03-sakinio-tvarka.json` `200` (4209 B — #250 failas, baitai sutampa), `pasaulio-pazinimas/16-vandens-busenos.json` `200` (4946 B), `grades.json` `200` (1126 B), `assets/audio/lt/manifest.json` `200` (60 758 B).
- **Naršyklė prieš gyvą bazę:** `check_view.py --base <gyva> --module 25-ilgis-ir-vienetas --viewports phone,small` → 2 patikros (390/360 px), 0 problemų.
- **Įrankio šakos, kurių #247 nebuvo paleidęs** (lokalūs veidrodžiai su tyčia suklastotu gyvu failu): pasenęs modulio failas → `rc=1` su baitais; `--json` → `rc=1`; nepasiekiama bazė → `live_error`, `rc=1`, be crash; pasenęs `manifest.json` → `aux_stale`, `rc=1`; pasenęs klasės `index.json` + trumpesnė seka → `aux_stale` + `path_differs`, `rc=1`; `--no-bytes` → baitų nepraneša, `path_differs` pagauna.
- **Ištaisyta:** modulis, kurio ID gyvame `index.json` nėra, buvo rodomas ir „NESKELBTA“, ir „PASENĘS TURINYS“. Baitų ciklas dabar praleidžia `missing_on_live` ID (`scripts/check_published.py:166–176`); po taisymo tas pats veidrodis duoda tik `NESKELBTA (9)`, rc 1, o pasenęs failas su pilnu index'u tebepranešamas `PASENĘS TURINYS`. Seni JSON raktai nepakeisti.
- **Vartai:** `validate_content.py --grade 1 --strict` 0/0; `check_docs_facts.py` 0/0 (9 kryptys, 37 moduliai); `check_audio.py` 543 tekstų / 1086 įrašų / 1086 mp3.
- **Sprendimas:** sutampa. Nieko nešalinta, ID nepernumeruoti, `path.json`, `index.json`, `grades.json` ir garsas neliesti; turinys nepaliestas. Ataskaita `agents/log/publikavimo-agentas-2026-11-12T1610.md` (1600 failas — sutrumpinta to paties paleidimo versija). Pasiūlymas: `agents/proposals/2026-11-12-publikavimo-agentas-dashboard-stale.json`; pamoka LL-82.

## 2026-11-11 (23:06) — Publikavimo patikra #239: repo 37 / paskelbta 37, svetainė pastatyta iš `f1b14162`

- **`check_published.py`** → repo 37, paskelbta 37, `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0, `path_differs` false, `unpushed_commits` 0, `live_error` tuščias, `rc=0`. `HEAD` = `origin/main` = `f1b14162b153586521308198b5374e1ca97c1100`; `git status --porcelain -uall` tuščias.
- **Baitai, ne skaičiai:** 37/37 modulio JSON baitais lygūs `git cat-file blob HEAD:`; `grade-01/index.json` (11 209 B), `path.json` (1 284 B), `grades.json` (1 126 B), `audio/lt/manifest.json` (60 762 B, 543 raktai) — lygūs. 7 assets (`index.html`, `404.html`, `main.css`, `app.js`, `registry.js`, `progress.js`, `speech.js`) lygūs po to, kai iš gyvo failo nuimama `?v=<sha8>` žyma (LL-76).
- **Pastatyta iš `HEAD`:** gyvas `index.html` neša `?v=f1b14162` = pirmi 8 `HEAD` simboliai. 3 gyvi moduliai: `matematika/25-ilgis-ir-vienetas.json` `200` (8812 B), `lietuviu-kalba/01-garsas-ir-raide.json` `200` (5044 B), `pasaulio-pazinimas/16-vandens-busenos.json` `200` (4946 B).
- **Garsas:** imtis 6 raktai × n/s = 12/12 `200`, `ID3`, 15 925–50 407 B; `check_audio.py` → 543 tekstų, 1086 įrašų, 1086/1086 mp3, 0 našlaičių.
- **Vartai:** `validate_content.py --grade 1 --strict` → 0/0; `check_docs_facts.py` → 0/0 (9 kryptys, 37 moduliai); `check_view.py --base <gyva> --module 25-ilgis-ir-vienetas --viewports phone,small` → 2 patikros, 0 problemų.
- **Nuo #237:** `git diff --stat 7e8afe3..HEAD` turinio ir assets nelietė (#238 liečia tik `agents/`, `dashboard/`, `scripts/`), todėl skaičiai nepakito — pasikeitė tik statybos commit'as `7e8afe3` → `f1b1416`. #237 changelog įrašas nebuvo įrašytas; šis įrašas jį uždengia tais pačiais skaičiais.
- **Sprendimas:** sutampa. Nieko nešalinta, ID nepernumeruoti, `path.json` nekeistas; ataskaita `agents/log/publikavimo-agentas-2026-11-11T2306.md`.

## 2026-11-09 (23:06) — Publikavimo patikra #212: repo 35 / paskelbta 35, svetainė pastatyta iš `b4a6fac3`

- **`check_published.py`** (nuo #211 jau lygina ir baitus, ne tik ID) → repo 35, paskelbta 35, `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0, `path_differs` [], `unpushed_commits` 0, `live_error` tuščias, `rc=0`.
- **Būsena:** `HEAD` = `origin/main` = `b4a6fac35111217edf907ad5fe5e0b40647762e4`; `git status --porcelain -uall` tuščias. Gyvas `index.html` neša `?v=b4a6fac3` — svetainė pastatyta būtent iš `HEAD`, ne iš ankstesnio `99b8a34`.
- **3 realios gyvos patikros (HTTP):** `content/lt/grade-01/daile/01-spalva-ir-nuotaika.json` `200` (6242 B), `…/matematika/24-komandu-seka.json` `200` (6874 B), `…/pasaulio-pazinimas/16-vandens-busenos.json` `200` (4946 B). Papildomai `…/pasaulio-pazinimas/18-kuprine-ir-kuno-dalys.json` `200` (8051 B) ir šaknis `200` (3487 B).
- **Baitai, ne skaičiai (assets, kurių `check_published.py` neapima):** 21/21 — `index.html`, `main.css`, `app.js`, `registry.js`, `progress.js`, `speech.js`, visi 10 sim failų, garso manifestas (500 raktų / 1000 takų), `grades.json`, `index.json`, `path.json` gyvai baitais lygūs `git cat-file blob HEAD:` po to, kai iš gyvo failo **pašalinama** `?v=<sha8>` žyma (LL-76). Skirtumų 0.
- **Garsas:** imtis `seed 212` — 16/16 gyvų mp3 (`n` ir `s`) `200`, ID3 antraštė, 18 433–69 215 B.
- **Naršyklė gyvai:** `check_view.py --base <gyva> --viewports small` → 35 maršrutai × 360 px, 0 problemų, `rc=0`.
- **Nutekėjimo patikra:** `agents/state.json`, `agents/AGENTS.md`, `docs/ARCHITEKTURA.md`, `scripts/check_published.py`, `research/wiki/changelog.md` → `404`; `404.html` → `200`.
- **Ką tai reiškia turiniui:** nuo #209 turinys ir assets nekeitėsi (tarpinis #211 keitė tik `agents/`, `dashboard/`, `scripts/`), tad vaiko `localStorage` pažanga rodo į tuos pačius modulius. #210 (19:38) patikra changelog įrašo nepaliko — šis įrašas ją uždengia tais pačiais skaičiais, ne nauju teiginiu.
- **Sprendimas:** sutampa. Nieko nešalinta, ID nepernumeruoti, `path.json` nekeistas; ataskaita `agents/log/publikavimo-agentas-2026-11-09T2306.md`.

## 2026-11-09 (16:40) — Publikavimo patikra #209 (leidėjas): repo 35 / gyvai 35, svetainė pastatyta iš `97ed524`

- **Būsena:** `HEAD` = `origin/main` = `97ed524d` (0 neišstumtų commit'ų, 0 neprijungtų nuotolinių šakų, `git status --porcelain -uall` tuščias).
- **`pages.yml`:** paskutiniai 5 paleidimai `completed/success`; paskutinis — `97ed524d`, `2026-11-09T14:09:13Z`, 1 m 40 s. Jokio raudono deploy šiandien.
- **3 realios gyvos patikros (HTTP):** šaknis `https://one-man-company.github.io/suprask/` `200` (3487 B); `content/lt/grade-01/index.json` `200` (10 662 B); `assets/audio/lt/manifest.json` `200` (500 raktų). Papildomai `content/lt/grades.json` `200` (1126 B).
- **Baitai, ne skaičiai:** 35/35 modulio JSON failų gyvai `200` ir baitais lygūs `git cat-file blob HEAD:` (skiriasi 0); `grade-01/index.json` (10 662 B), `path.json` (1228 B), `grades.json` (1126 B) — baitais lygūs `HEAD`. Gyvas `index.html` neša `?v=97ed524d` — tai pirmi 8 `HEAD` simboliai, tad gyva svetainė pastatyta būtent iš `97ed524d`, ne iš ankstesnio `11bcdca`.
- **Struktūra:** `index.json` 35 moduliai, 35 unikalūs ID, 9 kryptys; gyvos aibės sutampa su repo abiem kryptymis (trūksta 0, perteklius 0), `grades.json` `grades[0].modules` = 35, `status: live`.
- **Naršyklė gyvai:** `check_view.py --base <gyva> --viewports phone,small` → 70 patikrų (35 maršrutai × 390/360 px), 0 problemų, `rc=0`.
- **Vartai:** `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų; `check_docs_facts.py` → 0 klaidų, 0 įspėjimų (9 kryptys, 35 moduliai).
- **Garsas:** imtis `seed 209` — 16/16 gyvų mp3 (`n` ir `s`) `200`, 17 179–89 486 B.
- **Ką agentai pakeitė nuo 2026-11-08 16:00 (`git log --since`):** 4 nauji moduliai — `daile/01-spalva-ir-nuotaika` (pirmas dailės krypties modulis), `dorinis-ugdymas/01-susitarimas-ir-zaidimas`, `muzika/02-ritmas-ir-perkusija`, `pasaulio-pazinimas/18-kuprine-ir-kuno-dalys` (31 → 35 moduliai, 7 → 9 kryptys); taisyti `14-pinigai`, `21-erdvines-figuros`, `16-vandens-busenos`; `main.css` (`.choice` 320 px, `.module-foot` 200 %), `geometrija.js`, `muzika.js`, `daile.js`, `pasaulis.js`, garso manifestas (+ nauji mp3).
- **Sprendimas:** palaikyta. Nieko neatsukta — joks gyvas adresas negrąžino ne `200`, nė vienas modulis nesiskyrė nuo `HEAD`, nė viena patikra nekrito. Ataskaita `agents/log/leidejas-2026-11-09T1635.md`.

## 2026-11-09 (16:03) — Publikavimo patikra #208: repo 35 / paskelbta 35, visi moduliai baitais lygūs `HEAD`

- **`check_published.py`** → repo 35, paskelbta 35, `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, neišstumtų commit'ų 0, `live_error` tuščias, `rc=0`. `HEAD` = `origin/main` = `11bcdca6`, darbinė kopija švari.
- **Gyvi adresai (HTTP):** `content/lt/grade-01/matematika/24-komandu-seka.json` `200` (6874 B), `…/muzika/02-ritmas-ir-perkusija.json` `200` (7902 B), `…/pasaulio-pazinimas/16-vandens-busenos.json` `200` (4946 B); šaknis `200` (3487 B).
- **Baitai, ne skaičiai:** 35/35 modulio JSON failai gyvai `200` ir baitais lygūs `git show HEAD:`. `grade-01/index.json` (`def01c20`, 10 662 B), `path.json` (`ef2ca057`, 1228 B), `grades.json` (`7370de87`, 1126 B), `audio/lt/manifest.json` (`fa9b4076`, 55 403 B, 500 raktų / 1000 takų), `main.css` (`a3c0b4fa`, 30 802 B) — lygūs. `index.html`, `app.js`, `registry.js` ir 7 sim failai (`daile`, `dorinis`, `geometrija`, `gyvenimas`, `pasaulis`, `technologijos`, `zaidimai`) skiriasi TIK `?v=11bcdca6` žyma; nulupus žymą — baitais lygūs → gyva svetainė pastatyta iš `11bcdca6`. Tai patvirtina Pages deploymentas prie `11bcdca6` (`completed/success`, 2026-11-09T14:02:32Z).
- **Struktūra:** `index.json` 35 moduliai, 35 unikalūs ID, 9 kryptys (lietuvių 4, matematika 15, pasaulio pažinimas 6, muzika 2, žaidimų teorija 3, technologijos 2, gyvenimo įgūdžiai 1, dorinis ugdymas 1, dailė 1); `path.json` 35 žingsniai, aibės sutampa abiem kryptimis (trūksta 0, perteklius 0), tvarka neliesta.
- **Garsas:** imtis `seed 208` — 8/8 gyvų mp3 `200`, 17 179–58 766 B; `check_audio.py` → 500 tekstų × 2 įrašai, visi Piper, `rc=0`.
- **Vartai:** `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų; `check_docs_facts.py` → 0 klaidų (9 kryptys, 35 moduliai); `check_view.py --base <gyva> --viewports phone,small` → 70 patikrų (35 maršrutai × 2 plotai), 0 problemų, `rc=0`.
- **Sprendimas:** sutampa. Nieko nešalinta, ID nepernumeruoti, `path.json` nekeistas; ataskaita `agents/log/publikavimo-agentas-2026-11-09T1603.md`.

## 2026-11-09 (12:00) — Publikavimo patikra #191: repo 35 / paskelbta 35, visi moduliai baitais lygūs `HEAD`

- **`check_published.py`** → repo 35, paskelbta 35, `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, neišstumtų commit'ų 0, `live_error` tuščias, `rc=0`. `HEAD` = `origin/main` = `5a921b17`, darbinė kopija švari.
- **Gyvi adresai (HTTP):** `content/lt/grade-01/daile/01-spalva-ir-nuotaika.json` `200` (6242 B), `…/muzika/02-ritmas-ir-perkusija.json` `200` (7902 B), `…/dorinis-ugdymas/01-susitarimas-ir-zaidimas.json` `200` (6209 B), `index.json` `200` (10662 B), `path.json` `200` (1228 B), šaknis `200` (3487 B).
- **Baitai, ne skaičiai:** 35/35 modulio JSON failai gyvai `200` ir baitais lygūs `git show HEAD:`. `grade-01/index.json` (`def01c20`), `path.json` (`ef2ca057`), `grades.json` (`7370de87`), `audio/lt/manifest.json` (`e396ff29`, 55 401 B, 500 raktų / 1000 takų), `main.css` (`f7c4b8c9`) — lygūs. `pasaulis.js`, `geometrija.js`, `gyvenimas.js`, `technologijos.js`, `zaidimai.js`, `daile.js` skiriasi TIK `?v=5a921b17` žyma; nulupus žymą — baitais lygūs → gyva svetainė pastatyta iš `5a921b17`. Tai patvirtina ir Pages deploymentas prie `5a921b1` (`success`, 2026-11-09T09:54:37Z).
- **Struktūra:** `index.json` 35 moduliai, 35 unikalūs ID, 9 kryptys (lietuvių 4, matematika 15, pasaulio pažinimas 6, muzika 2, žaidimų teorija 3, technologijos 2, gyvenimo įgūdžiai 1, dorinis ugdymas 1, dailė 1); `path.json` 35 žingsniai, aibės sutampa abiem kryptimis, tvarka neliesta.
- **Garsas:** imtis `seed 191` — 8/8 gyvų mp3 `200`, 13 626–65 035 B.
- **Vartai:** `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų; `check_docs_facts.py` → 0 klaidų (9 kryptys, 35 moduliai); `check_view.py --base <gyva> --viewports phone,small` → 70 patikrų (35 maršrutai × 2 plotai), 0 problemų, `rc=0`.
- **Sprendimas:** sutampa. Nieko nešalinta, ID nepernumeruoti, `path.json` nekeistas; ataskaita `agents/log/publikavimo-agentas-2026-11-09T1154.md`.

## 2026-11-09 (08:32) — Metodas M-06 „Dailė: ta pati forma, kita spalva“ (#6539)

- **`research/wiki/grades/01/metodai.md`** — naujas skyrius **M-06** (prieš „Atviros prielaidos“; `atnaujinta: 2026-11-09`). Viena idėja: forma neša tapatybę, spalva — įspūdį. Modelis `deme-ir-spalvos` keičia vienintelį kintamąjį (didelės dėmės užpildą iš keturių dažų), o geometrija įterpiama vieną kartą ir neperpiešiama, todėl teiginys „formos nepasikeitė“ patikrinamas (`getBBox()` prieš ir po vienodas). Grįžimas į pirmą spalvą — kontrolinis bandymas. 7 būsenos su `readout`/`api.note`, `api.progress` tik po palyginimo (LL-29), 4 užduotys (viena `optional`), 9 garso frazės `config.sentences` (LL-42), nauja `art.js` dalis `spot()`.
- **`research/wiki/foundations/forma-ir-spalva.md`** — naujas įrašas (3 DOI šaltiniai + programa): forma kaip tapatybė, spalva kaip įspūdis; kodėl spalva limpa prie daikto (Palmer & Schloss, 2010) ir kodėl vaikas ją vartoja simboliškai tik gavęs įspūdžio kryptį (Burkitt ir kt., 2003). Indekso eilutė `foundations/README.md`.
- **`research/wiki/guidelines/pilotai.md`** — **P-018**: pirmas modelis, kuriame kintamasis yra paviršiaus savybė, o invariantas užtikrinamas kodu, ne teksto pažadu.
- **`agents/proposals/2026-11-09-metodininkas-dailes-spalva.json`** — `type: metodas`, `target: content/lt/grade-01/daile/01-spalva-ir-nuotaika.json`, prioritetas `high`. Tai pirmas dailės modulis (privalomas dalykas be nė vieno modulio) ir nauja kryptis `daile`.
- **Kodėl:** eilėje seniausias `high` `tema` pasiūlymas buvo #6539; dailė yra vienas iš keturių privalomų dalykų be modulio. Programa tą pačią veiklą įvardija tiesiogiai (`sources/pradinio-bp-rekomendacijos-2024.txt:2717–2718`), o interaktyvumo nauda pagrįsta: dviejų paveikslų palyginimas neįrodo, kad formos liko tos pačios.

## 2026-11-09 (06:26) — Publikavimo patikra #177: repo 31 / paskelbta 31, visi moduliai baitais lygūs `HEAD`

- **`check_published.py`** → repo 31, paskelbta 31, `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, neišstumtų commit'ų 0, `live_error` tuščias, `rc=0`. `HEAD` = `origin/main` = `c7437336` (0 priekyje, 0 atsilieka), darbinė kopija švari.
- **Gyvi adresai (HTTP):** `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` `200` (5044 B), `…/matematika/04-skaiciu-tiese.json` `200` (3636 B), `…/pasaulio-pazinimas/16-vandens-busenos.json` `200` (4947 B), šaknis `200` (3487 B).
- **Baitai, ne skaičiai:** visi 31 modulio JSON failai gyvai `200` ir baitais lygūs `git show HEAD:` (31/31). `grade-01/index.json` (`dda1273a`, 9192 B), `path.json` (`88ff0a20`, 1103 B), `grades.json` (`2ec1e57d`, 1126 B), `audio/lt/manifest.json` (`de1ad5e4`, 50 497 B, 463 raktai), `main.css` (`c88fab2e`), `matematika.js` (`afc29fd6`), `calba.js` (`eb5a6d21`), `muzika.js` (`f8946092`) — lygūs. `pasaulis.js`, `geometrija.js`, `gyvenimas.js`, `technologijos.js`, `zaidimai.js` skiriasi TIK `?v=c7437336` žyma (`pages.yml:33–42`); nulupus žymą — baitais lygūs, žyma = `origin/main` pirmi 8 simboliai → gyva svetainė pastatyta iš `c7437336`.
- **Struktūra:** `index.json` 31 modulis, 31 unikalus ID, 7 kryptys; `path.json` 31 žingsnis, 31 unikalus, aibės sutampa su indeksu abiem kryptimis (trūksta 0, perteklius 0), tvarka neliesta; `grades.json` `grades[0].modules` 31, `status: live`.
- **Garsas:** manifesto 463 raktai / 926 takų; 10 atsitiktinių gyvų mp3 (n ir s) — visi `200`, 14–49 KB.
- **Vartai:** `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų (rc 0). Gyvas puslapis naršyklėje: `check_view.py --base https://one-man-company.github.io/suprask/ --viewports phone,small` → 62 patikros (31 maršrutas × 2 plotai), 0 problemų (rc 0).
- **Sprendimas:** sutampa. Nieko nešalinta, ID nepernumeruoti, `path.json` nekeistas; ataskaita `agents/log/publikavimo-agentas-2026-11-09T0626.md`.

## 2026-11-08 (23:05) — Publikavimo patikra #175: repo 31 / paskelbta 31, svetainė baitais lygi `HEAD`

- **`check_published.py`** → repo 31, paskelbta 31, `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, neišstumtų commit'ų 0, `live_error` tuščias, `rc=0`. `HEAD` = `origin/main` = `e3a61b2` (0 priekyje, 0 atsilieka).
- **4 gyvi adresai (HTTP):** šaknis `200` (3487 B), `content/lt/grade-01/matematika/24-komandu-seka.json` `200` (6874 B), `content/lt/grade-01/gyvenimo-igudziai/01-dovana-ir-noras.json` `200` (5389 B), `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` `200` (4947 B); papildomai `index.json` `200`, `grades.json` `200`, `assets/audio/lt/manifest.json` `200`.
- **Baitai, ne skaičiai:** visi 31 modulio JSON failai gyvai baitais lygūs `git show HEAD:` (skiriasi 0); `grade-01/index.json` (`dda1273a`, 9192 B), `path.json` (`88ff0a20`, 1103 B), `grades.json` (`2ec1e57d`, 1126 B), `audio/lt/manifest.json` (`de1ad5e4`, 50 497 B, 463 raktai), `main.css` (`c88fab2e`), `matematika.js` (`afc29fd6`) — lygūs. `index.html`, `app.js`, `registry.js`, `gyvenimas.js` skiriasi TIK `?v=e3a61b20` žyma (`pages.yml:33–42`); be žymų — baitais lygūs, žyma lygi `origin/main` pirmiems 8 simboliams (LL-41, ne defektas).
- **Struktūra:** `index.json` 31 modulis, 31 unikalus ID, trūkstamų failų 0; `path.json` 31 įrašas, 31 unikalus, trūksta 0, perteklius 0 (tvarka neliesta); `grades.json` `grades[0].modules` 31, `updated` 2026-11-08; `index.json` pavadinimai/paantraštės/minutės su modulių JSON sutampa (0 neatitikimų); 133 užduotys.
- **Simuliacijų registras (node importas):** 31 raktas 8 failuose (kalba 4, geometrija 1, gyvenimas 1, matematika 14, muzika 1, pasaulis 5, technologijos 2, žaidimai 3), visi su `mount()`, neregistruotų 0, nenaudojamų 0, dublikatų 0.
- **Garsas:** `check_audio.py` → 462 tekstai × 2 įrašai, visi Piper, `rc=0`; manifeste 926 takai, trūkstamų failų 0; diske 932 mp3 → 6 našlaičiai; 1 pasenęs manifesto raktas („Dangtis“, `collect()` jo nebegrąžina). Vaikui nieko netrūksta.
- **Vartai:** `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų. **Gyvas puslapis naršyklėje:** `check_view.py --base https://one-man-company.github.io/suprask/ --viewports phone,small` → 62 patikros (31 maršrutas × 2 plotai), 0 problemų.
- **Sprendimas:** sutampa; nieko nešalinta, ID nepernumeruoti, `path.json` neliestas. Pastaba: paleidimas #173 (log `agents/log/publikavimo-agentas-2026-11-08T1932.md`) baigėsi prieš įrašant changelog eilutę — šis įrašas ją pakeičia šviežiais to paties `HEAD` skaičiais. Ataskaita `agents/log/publikavimo-agentas-2026-11-08T2305.md`.

## 2026-11-08 (16:37) — Publikavimo patikra #171: 31 modulis gyvai, svetainė pastatyta iš `origin/main`

- **`origin/main` = `ff7320f`, `HEAD` = `1b1edf7`** — vienas neišstumtas commit'as (`agents/scope.json`, sistemos šlavimas), kuris publikuojamam turiniui įtakos neturi; `git status --porcelain -uall` tuščias.
- **`pages.yml`:** trys paskutiniai paleidimai `completed/success` — `42488158893` (24 s, `2026-11-08T14:06:34Z`, head `ff7320f`), `42487737917` (26 s), `42478804725` (30 s).
- **4 realios gyvos patikros (HTTP):** šaknis `200`, `content/lt/grade-01/index.json` `200`, `assets/audio/lt/manifest.json` `200`, `content/lt/grades.json` `200`; papildomai visi 31 modulio JSON failai — `200`.
- **Moduliai:** 31 vietoje = 31 gyvai, ID aibės sutampa abiem kryptimis (trūksta 0, perteklius 0); `grades.json` abiejose pusėse `"modules": 31`, `updated: 2026-11-08`. Kryptys: lietuvių kalba 4, matematika 15, pasaulio pažinimas 5, muzika 1, žaidimų teorija 3, technologijos 2, gyvenimo įgūdžiai 1.
- **Baitai, ne skaičiai:** `grade-01/index.json` (`dda1273a`), `grades.json` (`2ec1e57d`), `path.json` (`88ff0a20`), `audio/lt/manifest.json` (`de1ad5e4`, 463 raktai), `main.css` (`c88fab2e`), `matematika.js` (`afc29fd6`), naujausi moduliai `24-komandu-seka` ir `01-dovana-ir-noras` — gyvai baitais lygūs `HEAD`. `index.html`, `app.js`, `registry.js`, `gyvenimas.js` skiriasi TIK `?v=ff7320fd` žyma, kurią prirašo `pages.yml:33–42`; žyma lygi pirmiems 8 `origin/main` simboliams, tad gyva svetainė pastatyta būtent iš jo (LL-41, ne defektas).
- **Gyvas puslapis naršyklėje:** `check_view.py --base https://one-man-company.github.io/suprask/ --viewports phone,small` → 62 patikros (31 maršrutas × 2 plotai), 0 problemų, 0 konsolės klaidų.
- **Vartai:** `validate_content.py` → 0 klaidų, 0 įspėjimų.
- **Ką agentai pakeitė nuo praėjusios patikros (`8b29d9b`, 06:13):** 28 → 31 modulis — į indeksą įtraukti `matematika/24-komandu-seka` (#131), `gyvenimo-igudziai/01-dovana-ir-noras` (#136, kartu nauja kryptis) ir `muzika/01-garso-aukstis`; 18 turinio failų (kalbos taisymai #140–#156, simuliacijų išdėstymas 200 % tekste), `path.json` ir `grades.json` atnaujinti.
- **Sprendimas:** palaikyta; nieko neatšaukta — gyva svetainė atsako, turinys ir garsas sutampa su `origin/main`, modulių skaičius sutampa. Ataskaita `agents/log/leidejas-2026-11-08T1633.md`.

## 2026-11-08 (08:40) — Emocijų metodas M-05: jausmas priklauso nuo noro

- **`grades/01/metodai.md`** — naujas metodas M-05 „Emocijos: tas pats įvykis, skirtingas jausmas“ (tema atidaryta kaip `guidelines/klausimai.md:29`): keturių žingsnių seka, simuliacijos `dovana-ir-noras` penkios būsenos, keturios užduotys su tipinėmis klaidomis, modelio ribos, argumentas, kodėl paveikslėlis čia nepakanka.
- **`foundations/jausmas-ir-noras.md`** — naujas įrašas: jausmo priežastis yra noras, o noro nesimato; emocijų supratimas skyla į komponentus (Pons ir kt., 2004), mentaliniai paaiškinimai stiprėja su amžiumi (Rieffe ir kt., 2005), atviras nusivylimas 6–7 m. yra amžiaus norma (Saarni, 1979).
- **`foundations/README.md`** — indekso eilutė.
- **`guidelines/klausimai.md:29`** — klausimas apie emocijų modelį pažymėtas atsakytu: interaktyvumo nauda parodoma fiksuotu įvykiu ir keičiamu noru, o ne paveikslėliu.
- **`guidelines/pilotai.md`** — P-017 (nematomas kintamasis + antras veikėjas kaip kontrolinė pora).
- **Šaltinis:** Pons, Harris & de Rosnay (2004) https://doi.org/10.1080/17405620344000022 · Rieffe, Terwogt & Cowan (2005) https://doi.org/10.1002/icd.391 · Widen & Russell (2008) https://doi.org/10.1016/j.cogdev.2008.01.002 · Saarni (1979) https://doi.org/10.1037/0012-1649.15.4.424 · Harris ir kt. (1986) https://doi.org/10.2307/1130366
- **Poveikis platformai:** būsimas modulis `content/lt/grade-01/gyvenimo-igudziai/01-dovana-ir-noras.json` ir nauja kryptis `gyvenimo-igudziai`. Taisyklė „kintamasis turi būti tai, ko nesimato, o matomas įvykis fiksuojamas“ taikoma ir kitiems socialiniams modeliams.

## 2026-11-08 (06:13) — Publikavimo patikra #122: repo 28 / paskelbta 28, svetainė baitais lygi HEAD

- **`scripts/check_published.py`** → repo 28, paskelbta 28, `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, neišstumtų commit'ų 0, `rc=0`. `origin/main` = `HEAD` = `8b29d9b`.
- **3 gyvi adresai:** šaknis `200`, `content/lt/grade-01/matematika/23-piktograma-ir-stulpelis.json` `200`, `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` `200`; papildomai `technologijos/02-medziagu-bandymas.json`, `index.json`, `path.json`, `grades.json`, `assets/audio/lt/manifest.json` — visi `200`.
- **Baitai, ne skaičiai:** visi 28 modulių JSON failai gyvai baitais lygūs `git show HEAD:` (0 skirtumų); `index.json` `a9cc86b3…`, `path.json` ir `manifest.json` (`2a68b9c6…`, 433 tekstai) — lygūs. `grades.json` abiejose pusėse skelbia `"modules": 28`.
- **7 iš 13 `assets/` failų skiriasi nuo HEAD tik `?v=8b29d9bc` žyma**, kurią prirašo `.github/workflows/pages.yml:33–42`; žyma lygi `HEAD` pirmiems 8 simboliams, tad gyva svetainė pastatyta iš `8b29d9b`. `main.css` gyvai baitais lygus HEAD.
- **Simuliacijų registras per `node` importą:** 28 raktai, 28 unikūs, visi su `mount()`, 28 modulių su `sim`, neregistruotų 0, nenaudojamų 0.
- **`validate_content.py --grade 1 --strict`:** 0 klaidų, 0 įspėjimų. **Sprendimas:** sutampa; nieko nešalinta, ID nepernumeruoti, `path.json` neliestas. Ataskaita `agents/log/publikavimo-agentas-2026-11-08T0613.md`. Nauja pamoka LL-41 (gyva svetainė nėra HEAD baitais — `?v=` žyma).

## 2026-11-07 (16:30) — Publikavimo patikra #43: 18 modulių gyvai, publikavimas sveikas

- **`origin/main` = `HEAD` = `45515d0`**, 0 neišstumtų ir 0 atsilikusių commit'ų. Paskutiniai trys `pages.yml` paleidimai — `completed/success`: `42371055485` (33 s, `2026-11-07T12:07:10Z`, head `45515d0`), `42369857544` (24 s, `b9a962c`), `42364755279` (58 s, `5763a0b`).
- **3 realios gyvos patikros:** šaknis `200`, `content/lt/grade-01/index.json` `200`, `assets/audio/lt/manifest.json` `200`.
- **Modulių skaičius sutampa:** `scripts/check_published.py` → repo 18, paskelbta 18, `Neskelbta: —`, `Pavojus pažangai: —`, `rc=0`. Nuo vakar buvo 17; naujas aštuonioliktas — `technologijos/01-elektros-grandine` (`kurejas` #39, `a7330e4`), simuliacijos komponentas `elektros-grandine` registruotas `assets/js/sims/technologijos.js:302`.
- **Baitai sutampa, ne tik skaičiai:** `assets/js/app.js` (`46de1a14e11c`), `assets/css/main.css` (`3d0ae25af601`), `assets/js/sims/matematika.js` (`3dff9ca1a8d6`), `assets/js/sims/pasaulis.js` (`43148da886d3`) — tie patys sha256 ruože ir gyvai. Visi 18 modulių JSON failų gyvai `200`; visi 5 simuliacijų failai + `registry.js`, `progress.js`, `speech.js` — `200`.
- **Garsas pilnas abiejose pusėse:** `manifest.json` 343 tekstai ir vietoje, ir gyvai, raktų aibių skirtumas 0; `scripts/check_audio.py` → „✔ Garsas pilnas: 343 tekstų, visi turi po du įrašus“.
- **Rastas neatitikimas (nepublikavimo priežastis):** `content/lt/grades.json` 1 klasei skelbia `"modules": 16`, o `grade-01/index.json` turi 18. Gyvai ir vietoje reikšmė ta pati, tad tai ne publikavimo defektas — lauko niekas neperskaičiuoja. Vaikui šis skaičius nerodomas (`app.js` skaičiuoja iš `strands[].modules`), bet publikuojamas metaduomenų failas skelbia netiesą. Pasiūlymas #769 — validatoriaus kryžminė patikra.
- **Sprendimas:** palaikyta, nieko neatšaukta — gyva svetainė atsako `200`, turinys ir garsas sutampa su repo, validacija `0 klaidų, 0 įspėjimų`. Ataskaita `agents/log/leidejas-2026-11-07T1630.md`.

## 2026-11-07 — Krypčių metodas M-04

- **`grades/01/metodai.md`** — naujas metodas M-04 „Kryptys: kairė priklauso nuo žiūrovo“ (tema `2026-11-04-ideator-kryptys.json`): keturių žingsnių seka pagal žodžių įsisavinimo tvarką, simuliacijos `vabaliukas-ir-kryptys` septynios būsenos, keturios užduotys su tipinėmis klaidomis, modelio ribos ir sąmoningai kuklus tikslas.
- **`foundations/kryptis-ir-ziurovo-pozicija.md`** — naujas įrašas: kairė ir dešinė priklauso kūnui, o ne kambariui; žodžiai įsisavinami savo kūnu → žiūrint ta pačia kryptimi → žiūrint į vaiką; didžiąją dalį klaidų paaiškina užduoties sandara, o ne vaiko „egocentrizmas“.
- **`foundations/README.md`** — indekso eilutė.
- **`guidelines/pilotai.md`** — P-010 (žymė ant kūno, posūkis vietoje atskirtas nuo žingsnio).
- **Šaltinis:** Rigal (1994) https://doi.org/10.2466/pms.1994.79.3.1259 · Rigal (1996) https://doi.org/10.2466/pms.1996.83.3.831 · Phinney & Nummedal (1979) https://doi.org/10.2466/pms.1979.48.1.223 · Borke (1975) https://doi.org/10.1037/h0076459 · Way & Cartwright (2024) http://merga.net.au/wp-content/uploads/2024/09/6-MERGA-46-2024-Quick-Reads_Way-and-Cartwright.pdf · Kocher ir kt. (2020) https://doi.org/10.1109/icdl-epirob48136.2020.9278108 · Abarbanell & Li (2021) https://doi.org/10.1080/13875868.2020.1825442
- **Poveikis platformai:** būsimas modulis `17-kryptys-ir-vieta`; taisyklė „krypties žymė sukasi su kūnu, o ne su ekranu“ taikoma ir komandų sekos (Bee-Bot tipo) modeliams. Ideatoriaus pasiūlyme esantis skaičius „6 iš 36 pirmokų“ pakeistas šaltinio skaičiais (keturi visiškai teisingai, penki be nė vieno teisingo nurodymo).

## 2026-11-06 (16:37) — Publikavimo patikra #30: gyva svetainė sveika, 16 modulių laukia

- **Gyva svetainė (`origin/main` = `ebfd952`)** — 3 realios patikros: šaknis `200`, `content/lt/grade-01/index.json` `200`, `assets/audio/lt/manifest.json` `200`. Paskutinis publikavimas — `pages.yml` paleidimas `41969879355`, `completed/success`, 33 s, `2026-11-05T04:46:34Z`, head = `ebfd952`. `assets/js/app.js` ir `grade-01/index.json` baitai gyvai sutampa su `origin/main` (`929170fe…`, `d3c98a2d…`), todėl gyva svetainė atspindi būtent tą commit'ą, o ne tarpinę būseną.
- **Skirtumas:** vietoje 16 modulių, gyvai 14. Trūksta `14-pinigai` ir `16-lygybe-svarstykles` — abu gyvai `404`. `HEAD` yra 14 commitų priekyje `origin/main` ir 0 atsilieka.
- **Gyvos svetainės vidinė nesąmonė:** gyvas `content/lt/grades.json` skelbia `"modules": 13`, o gyvas `grade-01/index.json` turi 14 modulių. Skaičiuoklė atsilieka nuo turinio jau publikuotame sluoksnyje; `HEAD` tai taiso (16), bet pataisa nepaskelbta.
- **Publikavimo blokada (#272) tebėra, išmatuota iš naujo:** atskiroje klono kopijoje `git rebase origin/main` su švariu medžiu → `Current branch … is up to date.` `rc=0`; pridėjus vieną neįtrauktą pakeitimą → `error: cannot rebase: You have unstaged changes.` `rc=1`. Priežastis ta pati: `agents/run.py:572` publikuoja, o `agents/run.py:580` (`update_state`) po to perrašo `agents/state.json` jo nekomituodamas; `agents/state.json` yra trackinamas ir `.gitignore` jo neapima.
- **Publikavimo vartai uždaryti dėl turinio, ne dėl technikos:** `assets/js/sims/matematika.js:745-746,892-902` svarstyklės krypsta atvirkščiai. Išmatuota (`known=5`, `whole=8`, `box=1`): kairė 6, dešinė 8, bet kairė lėkštė nusileidžia `dy=+6,14 px`, dešinė kyla `dy=−6,14 px`. Sunkesnė pusė kyla aukštyn — tai tas pats modulis `16-lygybe-svarstykles`, kuris laukia publikavimo (kritika #449, `high`). Paskelbus 14 commitų krūvą, vaikas gyvai gautų apverstą modelį.
- **Sprendimas:** palaikyta. Nieko neatšaukta (gyva svetainė sveika, `200`), nieko nepaskelbta (vartai uždaryti). Publikavimas atnaujinamas tik po #449 pataisymo ir po to, kai darbinis medis bus švarus. Užfiksuota ataskaitoje `agents/log/leidejas-2026-11-06T1637.md`.

## 2026-11-06 — Pinigų metodas M-03

- **`grades/01/metodai.md`** — naujas metodas M-03 „Pinigai: monetos vertė, ne jos dydis“ (tema `2026-11-03-ideator-pinigai.json`): seka nuo saujos iki simbolio, simuliacijos `pinigine-ir-kaina` šešios būsenos, keturios užduotys su tipinėmis klaidomis ir užuominomis, modelio ribos.
- **`foundations/dydis-ir-skaicius.md`** — naujas įrašas: kai daiktas turi ir matomą dydį, ir užrašytą skaičių, vaikas iki septynerių metų tiki dydžiu; todėl modelis turi parodyti skaičiaus poveikį atskirai, o jo grafika neturi prieštarauti savo pačių taisyklei.
- **`foundations/README.md`** — indekso eilutė.
- **`guidelines/pilotai.md`** — P-008 (vertė juostoje, monetų skaičius atskirai, tikras monetų dydis ekrane).
- **Šaltinis:** Berti & Bombi (1981) https://doi.org/10.2307/1129504 · Strauss (1952) https://doi.org/10.2307/2088073 · Hasegawa (2020) https://doi.org/10.1038/s41598-020-62419-8 · Edmunds & Whitehurst (1973) https://eric.ed.gov/?id=ED087553 · Tracy & Fanelli (2000) https://eric.ed.gov/?id=ED451065 · Europos Komisijos monetų specifikacijos (5 c — 21,25 mm, 10 c — 19,75 mm).
- **Poveikis platformai:** būsimas modulis `14-pinigai`; taisyklė „daiktas su skaičiumi reikalauja atskiro poveikio vaizdo“ taikoma ir kitiems modeliams, kur vertė užrašyta, o ne išmatuojama (moneta, kauliukas, padalos žymė).

## 2026-11-05 (16:30) — Dienos darbas #16–#22: parašytas, bet nepaskelbtas

- **`content/lt/grade-01/matematika/16-lygybe-svarstykles.json`** (naujas, 108 eil.) + `index.json`, `path.json`, `assets/js/sims/matematika.js` (+265), 8 garso failai, `manifest.json` — 15-as modulis „Lygybė: svarstyklių pusiausvyra“ (#18 kurejas), pagal metodą M-02.
- **`assets/js/sims/pasaulis.js`** (+210/−41) — metų laikų modelis perrašytas iš iliustracijos į 12 mėnesių modelį (dienos trukmė, saulės aukštis, lapai, sniegas, paukščiai), augalo gyvenimas sustabdytas ties 10 diena (#19).
- **`assets/js/app.js`** (+41), **`assets/css/main.css`** (+11) — modulio pabaigoje viena „Kitas žingsnis · N iš 15“ kortelė pagal `path.json`; navigacijos taikiniai ≥ 48 px (#20).
- **`research/wiki/`** — `grades/01/metodai.md` M-02, `foundations/zenklas-kaip-busena.md`, `guidelines/pilotai.md` P-005 ir P-007, `guidelines/klausimai.md`, `curriculum/matematika-1-klase.md` (#17, #22).
- **`agents/proposals/`** — 12 naujų pasiūlymų (kritikas #21, programos-derintojas #22, simuliacijų inžinierius #19, metodininkas #17, ideator #16).
- **Poveikis platformai:** gyva svetainė šių pakeitimų **dar neturi** — `origin/main` stovi ties `ebfd952` (#14, 2026-11-05 04:46 UTC), t. y. 14 modulių; 15-as modulis gyvai duoda 404. Priežastis — ne turinio konfliktas (švari kopija ant `origin/main` persikelia be klaidų), o nešvarus darbinis medis: `agents/run.py` po publikavimo perrašo `agents/state.json` jo nekomituodamas, o `publish()` `git rebase origin/main` su neįtrauktu pakeitimu grąžina `error: cannot rebase: You have unstaged changes` → statusas `conflict` ir push neįvyksta. Užfiksuota ataskaitoje `agents/log/leidejas-2026-11-05T1633.md`.

## 2026-11-05 — Lygybės metodas M-02

- **`grades/01/metodai.md`** — naujas metodas M-02 „Lygybė: abi pusės sveria tiek pat“: seka, simuliacijos `svarstykles-lygybe` būsenos, keturios užduotys su tipinėmis klaidomis, modelio ribos.
- **`foundations/zenklas-kaip-busena.md`** — naujas įrašas: kai modelio grįžtamasis ryšys yra santykis, ženklas mokomas kaip būsena, bet modelio išdėstymas gali tyliai įtvirtinti operacinį skaitymą; todėl būtinas perskaitymas kita kryptimi ir užduotis be vieno skaičiaus pusėje.
- **`guidelines/pilotai.md`** — P-005 (svarstyklės su uždara dėžute ir apversta lygybės forma).
- **Šaltinis:** Baroody & Ginsburg (1983) https://doi.org/10.1086/461356 · McNeil & Alibali (2005) https://doi.org/10.1111/j.1467-8624.2005.00884.x · Falkner, Levi & Carpenter (1999) https://doi.org/10.5951/TCM.6.4.0232 · Stephens ir kt. (2022) https://doi.org/10.1080/10986065.2020.1793055 · Otten ir kt. (2019) https://doi.org/10.1186/s40594-019-0183-2
- **Poveikis platformai:** būsimas modulis `16-lygybe-svarstykles`; taisyklė „modelis, kuriame yra „=“, rodo abi kryptis“ taikoma ir kitiems lygybės ar palyginimo modeliams.

## 2026-11-03 — Bazės sukūrimas

- **`foundations/`** — pradėti mokymosi mokslo įrašai: vizualus mokymasis, kognityvinė apkrova, simuliacijos ir modeliai, interaktyvumo principai, vertinimas ir augimo mąstysena.
- **`foundations/`** — žaidimų teorijos dalis: žaidimų teorija vaikams, bendradarbiavimo žaidimai, sąžiningas dalijimasis, žaidimų mokymasis.
- **`curriculum/`** — 1 klasės programos išgryninimas iš NŠA „Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijų“ (2024) ir „Švietimo kelrodžio 2035“.
- **`grades/01`–`grades/12`** — sukurta 12 klasių struktūra (index, temos, metodai).
- **`guidelines/`** — atvirų klausimų sąrašas ir pilotų registras.
- **Šaltinis:** `docs/SVIETIMAS-1-GAIRES.md` (privalomos gairės), `docs/KURINIO-STANDARTAS.md`.

**Kodėl:** platformos turinys turi būti grindžiamas patikrintais šaltiniais, o ne prielaidomis. Bazė sukurta prieš pradedant 2 klasės turinį, kad kiekvienas sprendimas turėtų kur remtis.

## Šablonas

```
## YYYY-MM-DD — trumpas pavadinimas

- **`failas.md`** — kas pakeista (naujas įrašas / išvada pakeista / prieštaravimas užfiksuotas).
- **Šaltinis:** DOI arba URL.
- **Poveikis platformai:** kuriuos modulius ar sprendimus tai liečia.
```
