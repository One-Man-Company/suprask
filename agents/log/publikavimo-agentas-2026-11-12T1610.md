# publikavimo-agentas — 2026-11-12T1610

- paleidimas: #251 (manual)
- ankstesnė šio paleidimo ataskaita: `agents/log/publikavimo-agentas-2026-11-12T1600.md` — sutrumpinta, parašyta bėgiklio darbo viduryje (joje liko „neįrašyta“ sąrašas). Šis failas ją užbaigia; skaičiai tie patys, sprendimas tas pats.

## 1. `check_published.py` — realus paleidimas

```
Repozitorija: 37 moduliai
Paskelbta:    37 moduliai
  · grade-01: repo 37, gyvai 37
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai).
rc=0, 6,6 s
```

Raktai iš `--json`: `local` 37, `published` 37, `missing_on_live` [], `hidden_locally` [], `not_in_path` [], `stale` [], `stale_unknown` [], `aux_stale` [], `path_differs` [], `unpushed_commits` 0, `live_error` "".

`HEAD` = `origin/main` = `dde4bae` (po bėgiklio commit'o; pirmos patikros metu buvo `a6abeba`), `git rev-list origin/main..HEAD` → 0.

## 2. Trys gyvi adresai (ir du papildomi)

```
content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json        200  8812 B
content/lt/grade-01/lietuviu-kalba/03-sakinio-tvarka.json       200  4209 B
content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json  200  4946 B
content/lt/grades.json                                          200  1126 B
assets/audio/lt/manifest.json                                   200 60758 B
```

`03-sakinio-tvarka` pasirinktas sąmoningai: tai paskutinio turinio commit'o (`a6abeba`, #250) failas. Baitai sutampa su repo, vadinasi #250 pasiekė svetainę.

Naršyklės zondas prieš gyvą bazę: `check_view.py --base https://one-man-company.github.io/suprask/ --module 25-ilgis-ir-vienetas --viewports phone,small` → 2 patikros (390 ir 360 px), 0 problemų, rc 0.

## 3. Įrankio šakų testai (tai, ko #247 nepaleido)

Praeitame paleidime #247 buvo įrašyta: „naujo kodo *paleidimo* testai — liko neišbandyta“. Šiandien kiekviena šaka paleista prieš lokalų veidrodį (`SUPRASK_LIVE_ROOT`, `python3 -m http.server` 8977–8980), kuriame vienas gyvas failas tyčia suklastotas:

| Scenarijus | Ką įrankis pasakė | rc |
|---|---|---|
| A. vieno modulio baitai kitokie | `PASENĘS TURINYS … 25-ilgis-ir-vienetas: repo 8812 B, gyvai 8813 B` | 1 |
| B. tas pats su `--json` | tie patys ką tik išvardyti raktai, be pipe | 1 |
| C. nepasiekiama gyva bazė | `Gyvos svetainės klaida: grade-01: gyvas grade-01/index.json nepasiekiamas`, 37 nepasiekiami, jokio crash | 1 |
| D. pasenęs `manifest.json` | `PASENĘS PAGRINDINIS FAILAS … manifest.json: repo 60758 B, gyvai 63911 B` | 1 |
| E. pasenęs klasės `index.json` + trumpesnė seka | `aux_stale` index.json + `path.json seka skiriasi: klasė 1` | 1 |
| F. tas pats su `--no-bytes` | baitų nepraneša, `path_differs` vis tiek pagauna | 1 |
| G. tikra gyva svetainė | `✔ … sutampa` | 0 |

Atvejis B pirmą kartą parodė rc 0 — tai buvo `python3 -m json.tool` išėjimo kodas, ne įrankio; matuota iš naujo be pipe. Užrašyta, nes tai zondo, ne platformos klaida.

## 4. Ištaisyta: vienas modulis, dvi priešingos eilutės

Pirmasis veidrodis (D/E tipo) atskleidė, kad modulis, kurio ID gyvame `index.json` nėra, rodomas **ir** „NESKELBTA“, **ir** „PASENĘS TURINYS“: baitų ciklas ėjo per visus repo ID, nežiūrėdamas, ar jie apskritai paskelbti. Vaizdas klaidino — turinys nepasenęs, jo svetainėje tiesiog nėra.

`scripts/check_published.py:166–176`: baitų lyginimas praleidžia ID, kurie jau įvardyti `missing_on_live` (komentaras faile paaiškina kodėl). Seni JSON raktai nepakeisti, dashboard'as skaito tuos pačius.

Po taisymo tas pats veidrodis: `NESKELBTA (9): …` ir **jokios** `PASENĘS TURINYS` eilutės, rc 1. Atskiras veidrodis su pasenusiu failu, bet pilnu index'u: `PASENĘS TURINYS (1): 25-ilgis-ir-vienetas … gyvai 8813 B`, rc 1 — tikroji šaka nepaliesta. Tikra svetainė: `sutampa`, rc 0.

## 5. Vartai

- `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų (rc 0)
- `check_docs_facts.py` → 0 klaidų, 0 įspėjimų; 9 kryptys, 37 moduliai, sutampa su failais (rc 0)
- `check_audio.py` → 543 tekstų, 1086 įrašų, 1086/1086 mp3, Piper (rc 0)

## 6. Sprendimas: **sutampa**

Repo 37 / paskelbta 37. Niekas nešalinta, ID nepernumeruoti, `path.json`, `index.json`, `grades.json` ir garsas neliesti. Vienintelis pakeitimas — įrankio pranešimo tikslumas (`scripts/check_published.py`), platformos turinys nepaliestas.

## 7. Kas liko kitam paleidimui

`dashboard/server.py:719` kortelė „sutampa“ sprendžia tik iš `missing_on_live` ir `unpushed_commits`. Šio paleidimo scenarijai D/E rodo, kad įrankis tada grąžina rc 1 (`stale`, `aux_stale`, `path_differs`), o kortelė vis tiek rašytų „sutampa“ — žmogus matytų žalią, kai vartai raudoni. Ne mano failas, todėl pasiūlymas: `agents/proposals/2026-11-12-publikavimo-agentas-dashboard-stale.json`.

Pamoka LL-82 įrašyta `research/wiki/guidelines/pamokos.md`.

## klaidos

```
session_id: local-56083b48fb772f36252b2e8764f521d27464d178af0f4fc6c16381457cb0e431
```
