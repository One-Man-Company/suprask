# publikavimo-agentas — 2026-11-11T2306

- paleidimas: #239 (grafikas 23:00)
- šaknis: /home/zoltanas/workspace/suprask
- HEAD: `f1b14162b153586521308198b5374e1ca97c1100` = `origin/main` (0 neišstumtų commit'ų)
- darbinė kopija: `git status --porcelain -uall` → 0 eilučių (švari)

## 1. check_published.py (repo / paskelbta / neišstumta)

```
$ python3 scripts/check_published.py
Repozitorija: 37 moduliai
Paskelbta:    37 moduliai
  · grade-01: repo 37, gyvai 37
✔ Repo ir gyva svetainė sutampa (ID, seka ir failų baitai).
rc = 0
```

`--json`, grade 1: `local 37`, `published 37`, `missing_on_live []`,
`hidden_locally []`, `not_in_path []`, `stale []`, `stale_unknown []`,
`path_differs false`, `unpushed_commits 0`, `live_error ""`.
Platformos suvestinė: `local 37` / `published 37`, `live_grades [1]`.

## 2. Trys gyvi adresai (HTTP)

```
200  8812 B  content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json
200  5044 B  content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json
200  4946 B  content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json
```

## 3. Baitai, ne skaičiai

Zondas (`scratch/pub239_compare.py`) lygino kiekvieną gyvą failą su
`git cat-file blob HEAD:<kelias>`:

- **37/37 modulio JSON** — baitais lygūs, sutapimų 0 skirtumų.
- `content/lt/grade-01/index.json` — 200, 11 209 B, MATCH.
- `content/lt/grade-01/path.json` — 200, 1 284 B, MATCH.
- `content/lt/grades.json` — 200, 1 126 B, MATCH.
- `assets/audio/lt/manifest.json` — 200, 60 762 B, MATCH (543 raktai).
- Assets po `?v=<sha8>` nuėmimo: `index.html` (3 487 / 3 465 B), `404.html`
  (563 / 563), `main.css` (30 802 / 30 802), `app.js` (30 746 / 30 713),
  `registry.js` (3 731 / 3 621), `progress.js` (2 779 / 2 779), `speech.js`
  (7 565 / 7 565) — **7/7 MATCH**.

Ar svetainė pastatyta iš HEAD: gyvas `index.html` neša **`?v=f1b14162`**, o
`git rev-parse HEAD` pirmi 8 simboliai yra `f1b14162` → taip, iš `HEAD`.

## 4. Garsas

Imtis iš manifest'o (kas ~90-ą raktą, 6 raktai × n/s): **12/12 HTTP 200**,
visi su `ID3` antrašte, 15 925–50 407 B.
`check_audio.py` → 543 tekstų, 1 086 įrašų, visi Piper, naudojama 1 086 iš 1 086
(0 trūkstamų, 0 našlaičių), rc 0.

## 5. Vartai

- `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų, rc 0.
- `check_docs_facts.py` → 0 klaidų, 0 įspėjimų (9 kryptys, 37 moduliai), rc 0.
- `check_view.py --base https://one-man-company.github.io/suprask/
  --module 25-ilgis-ir-vienetas --viewports phone,small` → 2 patikros,
  0 problemų, rc 0 (gyva svetainė, ne lokalus serveris).

## 6. Kas pasikeitė nuo praėjusio changelog įrašo (2026-11-09 23:06, 35 moduliai)

- 35 → 37: `pasaulio-pazinimas/19-dumai-ir-isejimas` (commit 87c18e2, #217) ir
  `matematika/25-ilgis-ir-vienetas` (commit d781856, #218). Abu gyvai, baitais
  lygūs `HEAD`, kelyje (`path.json` 37 žingsniai, `not_in_path []`).
- `git diff --stat 7e8afe3..HEAD -- content assets index.html docs research` →
  tuščias: nuo #237 patikros turinio ir assets nekeitė **niekas** (#238 commit
  `f1b1416` liečia tik `agents/`, `dashboard/`, `scripts/` — 6 failai).
  Todėl #237 skaičiai (37/37) galioja ir šiandien, o pasikeitė tik tai, iš kurio
  commit'o statyta svetainė: `7e8afe3` → `f1b1416` (abu su tuo pačiu turiniu).

## 7. Sprendimas

**sutampa.**

- Repo 37 / paskelbta 37; `missing_on_live` 0, `hidden_locally` 0,
  `not_in_path` 0, `stale` 0, `path_differs` 0, neišstumtų commit'ų 0.
- `hidden_locally` tuščias → nė vienas vaiko `localStorage` pažangos žymeklis
  neveda į nieką; ID nepernumeruoti, `path.json` nekeistas, nieko nešalinta.
- Viskas, ką tikrinau, lyginta **baitais**, ne skaičiais: 37 moduliai +
  index/path/grades/manifest + 7 assets.

## 8. Pastabos kitam paleidimui

- **#237 ataskaitos trūkumas ištaisytas iš dalies:** jos log'as repo yra
  (`agents/log/publikavimo-agentas-2026-11-11T1933.md`, commit 8eeee20), bet
  changelog įrašas taip ir nepateko (`research/wiki/changelog.md` viršuje buvo
  2026-11-09 23:06). Šis paleidimas įrašė vieną įrašą su galiojančiais
  skaičiais; atskiro #237 įrašo nekuriu — jis būtų apie tuos pačius 37/37 ir
  dvi datas tam pačiam faktui.
- `check_published.py` lygina modulių baitus, bet ne `index.json`, `path.json`,
  `grades.json`, `manifest.json` baitus — šiandien juos tikrinau rankiniu
  zond'u. Tai #8716 tąsa (ne naujas defektas), naujo pasiūlymo neteikiu.
- `agents/state.json` yra `.gitignore`; ataskaita `agents/log/*.md` — tracked.
