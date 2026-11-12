# publikavimo-agentas — 2026-11-12T2301

- paleidimas: #255 (manual)
- trukmė: 159s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub255a/show.py
│ @@ -0,0 +1,15 @@
│ +#!/usr/bin/env python3
│ +"""Suskaito check_published.py --json failą ir atspausdina svarbiausius raktus."""
│ +import json
│ +import sys
│ +
│ +path = sys.argv[1]
│ +d = json.load(open(path, encoding="utf-8"))
│ +keys = (
│ +    "local", "published", "missing_on_live", "hidden_locally", "not_in_path",
│ +    "stale", "stale_unknown", "aux_stale", "shell_stale", "shell_unreachable",
│ +    "shell_count", "live_version", "repo_version", "path_differs",
│ +    "unpushed_commits", "live_error",
│ +)
│ +print(json.dumps({k: d.get(k) for k in keys}, ensure_ascii=False, indent=1))
│ +print("verdict:", json.dumps(d.get("verdict"), ensure_ascii=False))
Stabdau darbą dėl ėjimų limito. Toliau – sąžininga būsena: kas realiai išmatuota, kas liko nebaigta.

## 1. check_published.py išvestis (tikra, paleista)

```
Repozitorija: 37 moduliai
Paskelbta:    37 moduliai
  · grade-01: repo 37, gyvai 37
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai,
  svetainės kodas 17 failų, versija 3f05969b). RC=0
```

- `HEAD` = `origin/main` = `3f05969b`, `git rev-list --left-right --count origin/main...HEAD` → `0 0`, darbinė kopija švari (`git status --porcelain -uall` → 0 eilučių). Neišstumtų commit'ų: **0**.
- Gyva versija `3f05969b` = HEAD → svetainė pastatyta iš paskutinio paskelbto commit'o.
- `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0, `aux_stale` 0, `shell_stale` 0, `shell_unreachable` 0, `live_error` tuščias, `verdict.label` = `sutampa`.

## 2. HTTP kodai (4 realūs `curl`, ne iš atminties)

```
matematika/25-ilgis-ir-vienetas.json          200  8812 B
lietuviu-kalba/01-garsas-ir-raide.json        200  5044 B
pasaulio-pazinimas/16-vandens-busenos.json    200  4946 B
muzika/02-ritmas-ir-perkusija.json            200  7902 B
```

Vartai: `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų, rc 0; `check_docs_facts.py` → 0 klaidų, 0 įspėjimų (9 kryptys, 37 moduliai, 37 sim, 161 užduotis, 543 garso tekstai), rc 0.

## 3. Nauja, šiame paleidime atlikta patikra

Uždengiau #253 paliktą spragą (a): lokalus veidrodis `scratch/pub255a/mir` (index.html + 404.html + `assets/js` 15 failų + `assets/css` + `manifest.json` + `content/lt`), serveris `http://127.0.0.1:8975/`, SHA žymė `3f05969b`.

- **Kontrolė (veidrodis identiškas repui, be `?v=`):** rc **0**, `shell_count` 17, `live_version` tuščias, `verdict` = `sutampa`. Įrankis su `SUPRASK_LIVE_ROOT` veikia ir nebeprisiriša prie GitHub Pages.
- **Scenarijus A paruoštas:** `mirA/assets/js/sims/muzika.js` 23 086 → 23 121 B (prirašyta eilutė) → tikėtina `PASENĘS KODAS`, rc 1.
- **Scenarijus B paruoštas:** `mirB` faile `assets/js/sims/muzika.js` iš viso nėra (repo yra) → tikėtina `NEPASIEKIAMI svetainės kodo failai`, rc 1.
- **Scenarijus C paruoštas:** `mirC` perrašytas **tomis pačiomis** `sed` komandomis kaip `.github/workflows/pages.yml` (SHA `3f05969b`): `index.html` 2 žymos (`main.css?v=`, `app.js?v=`), JS importuose 40 eilučių (`registry.js:35` → `import * as calba from "./sims/calba.js?v=3f05969b";`) → tikėtina rc **0** (normalizavimas veikia).

A/B/C serveriai (8976/8977/8978) **paleisti, bet patikros nepaleistos** — trūko ėjimų. Todėl apie #253 įrankio pakeitimą negaliu rašyti „ištaisyta“; rašau „įgyvendinta, teigiamas kelias patvirtintas, neigiami scenarijai paruošti, bet neišmatuoti“.

## 4. Sprendimas

**SUTAMPA.** Repo 37 / paskelbta 37, baitai ir seka sutampa, svetainės kodas 17 failų sutampa, `pages.yml` žymė = HEAD, 4/4 HTTP 200, visi vartai žali. Nieko nešalinau, ID nepernumeravau, `index.json` / `path.json` / `grades.json` / garso neliečiau.

## 5. Kas liko nebaigta (sąžiningai, kitam paleidimui)

1. **A/B/C patikros nepaleistos** — komandos paruoštos: `SUPRASK_LIVE_ROOT=http://127.0.0.1:8976/ python3 scripts/check_published.py --json` (ir 8977, 8978). Be jų negalima rašyti „ištaisyta“.
2. **`agents/log/publikavimo-agentas-2026-11-12T2*.md` neįrašytas** — šio paleidimo ataskaita repo dar nėra.
3. **`agents/state.json` neatnaujintas** — `publikavimo-agentas.last_run` tebėra `2026-11-12T19:38:40`.
4. **`research/wiki/changelog.md` eilutė neįrašyta** — paskutinis įrašas yra 16:37 (#252 leidėjas); #253 ir #255 įrašų nėra.
5. **Pamoka neįrašyta** — planuota LL-83 numerį jau užėmė sistemos-architektas (`LL-83 — Vartai, kuriuos matuoja vykstantį įrašą`), tad mano pamoka turi būti **LL-84**: „Vartai lygina turinį, o naršyklė vykdo kodą; `?v=` žymė nėra turinio skirtumas“. `grep` rodo, kad `pamokos.md` apie `shell_stale` / `NEPASIEKIAMI` neturi nė vieno įrašo.
6. **Pasiūlymas #12895 (dashboard kortelė) jau uždarytas kito vaidmens** — #254 pridėjo `verdict()` į `check_published.py` ir `dashboard/server.py` skaito `p.verdict.label`; LL-82 Papildymas tai fiksuoja. Mano siūlyti nereikia.
7. Veidrodžių serveriai (8975–8978) tebėra paleisti procesai `scratch/pub255a` kataloge — juos reikia sustabdyti (`process_manage`), katalogas yra scratch, ne repo, tad publikavimui įtakos neturi.

## klaidos

```
session_id: local-3803c341c16c6ff243ad4b05b7a198b8d8aed9b858e970b2b854c2ae8cc0c410
```
