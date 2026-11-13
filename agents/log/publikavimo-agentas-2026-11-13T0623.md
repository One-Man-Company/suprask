# Publikavimo agentas — paleidimas #257 (2026-11-13 06:20)

## 1. `check_published.py` išvestis (paleista, ne iš atminties)

```
Repozitorija: 37 moduliai
Paskelbta:    37 moduliai
  · grade-01: repo 37, gyvai 37
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai,
  svetainės kodas 17 failų, versija 3d8f4782).
rc=0   (4,7 s)
```

Raktai: `missing_on_live` 0 · `hidden_locally` 0 · `not_in_path` 0 · `stale` 0 ·
`stale_unknown` 0 · `aux_stale` 0 · `shell_stale` 0 · `shell_unreachable` 0 ·
`path_differs` [] · `unpushed_commits` 0 · `live_error` tuščias · `verdict.label` = `sutampa`.

**Būsena:** `HEAD` = `origin/main` = `3d8f4782` (`git rev-list --left-right --count
origin/main...HEAD` → `0 0`); `git status --porcelain -uall` → 0 eilučių. Gyvas
`index.html` neša `?v=3d8f4782`, t. y. pirmus 8 `HEAD` simbolius — svetainė pastatyta
būtent iš šito commit'o, ne iš ankstesnio.

## 2. Trys gyvi adresai (HTTP, tikra užklausa)

| adresas | kodas | baitai |
|---|---|---|
| `content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json` | **200** | 8 812 |
| `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` | **200** | 5 044 |
| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | **200** | 4 946 |
| `content/lt/grade-01/index.json` (papildomai) | 200 | 11 209 |
| `assets/audio/lt/manifest.json` (papildomai) | 200 | 60 758 |

## 3. A/B/C veidrodžiai — #255 palikimas uždarytas

#255 paruošė tris veidrodžius, bet patikrų nepaleido. Šįkart paleistos per tą patį
`main()` kelią (`SUPRASK_LIVE_ROOT`, `python3 -m http.server` 8976–8978):

| scenarijus | kas suklastota | rezultatas |
|---|---|---|
| **A** `:8976` | `assets/js/sims/muzika.js` 23 121 B (repo 23 086 B) | `PASENĘS KODAS — naršyklė vykdo kitą failą (1)`, **rc=1** |
| **B** `:8977` | to paties failo svetainėje nėra | `NEPASIEKIAMI svetainės kodo failai (1)`, **rc=1** |
| **C** `:8978` | failai tie patys, tik `?v=3f05969b` žyma | `rc=0`, `sutampa`, `live_version` 3f05969b parodytas kaip informacija |

Išvada: #253 įrankio pakeitimas veikia į abi puses — kodo skirtumą pagauna, o
publikavimo žymos nepaverčia klaidingu signalu (be normalizavimo kiekvienas deploy
atrodytų „pasenęs“). Nuo šiol apie tą pakeitimą galima rašyti „išmatuota“, ne „paruošta“.

## 4. Naršyklė prieš gyvą bazę

- `check_view.py --base https://one-man-company.github.io/suprask/ --module
  25-ilgis-ir-vienetas --viewports phone,small` → 2 patikros (390/360 px), 0 problemų, rc 0.
- `--module 03-sakinio-tvarka --viewports phone,small` → 2 patikros, 0 problemų, rc 0.

## 5. Garsas

- Manifestas 543 raktai; imtis `seed 257` (4 raktai × `n`/`s`) → **8/8** `200`, `ID3`,
  14 462–51 869 B.
- Struktūrinė patikra, kurios manifestas vienas nepajėgia: `git ls-files
  'assets/audio/lt/*.mp3'` = **1086** ir diske = **1086**. Nė vienas įrašas netrackintas,
  todėl manifeste esantis takas negali duoti 404 dėl `.gitignore` — šios klasės atskiro
  vartų papildymo nereikia (manifesto baitai jau lyginami kaip `aux_stale`).

## 6. Vartai

- `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų, rc 0.
- `check_docs_facts.py` → 0 klaidų, 0 įspėjimų (9 kryptys, 37 moduliai, 37 sim.,
  161 užduotis, 543 garso tekstai, 1086 įrašai).
- `404.html`: gyvas 200, 563 B, SHA-256 lygus repo failui (`3fbdd06f…`). Įrankis jo
  nelygina (į `SHELL_GLOBS` įeina tik `index.html`), bet skirtumo nėra — defekto
  įrodymo neturiu, todėl įrankio neliečiau, tik užrašau ribą.

## 7. Sprendimas

**SUTAMPA.** Repo 37 / paskelbta 37, baitai ir seka sutampa, svetainės kodas (17 failų)
sutampa, `pages.yml` žymė = `HEAD`, 5/5 HTTP 200, 4/4 naršyklės patikros švarios,
8/8 garso imtis, visi vartai žali.

Nieko nešalinau, ID nepernumeravau, `index.json` / `path.json` / `grades.json` / garso
manifesto neliečiau. `hidden_locally` tuščias — joks modulis neiškrito.

## 8. Ką įrašiau

- `research/wiki/changelog.md` — įrašas 2026-11-13 (06:23); jis uždengia ir #255
  (2026-11-12 23:04), kurio eilutė nebuvo įrašyta, o skaičiai buvo tie patys (37/37 prie `3f05969b`).
- `research/wiki/guidelines/pamokos.md` — **LL-84** (vartai lygino tai, ką vaikas turėtų
  matyti, o ne tai, ką naršyklė vykdo; `?v=` žyma nėra turinio skirtumas).
- `agents/state.json` — `publikavimo-agentas` įrašas.

## 9. Kas liko atvira (ne mano vaidmens)

1. **`404.html` nelyginamas** `check_published.py`. Šiandien baitai sutampa, tad tai
   teorinė spraga; jei kada skirsis, įrankis tylės. Taisyti verta tik tada, kai bus
   įrodymas — kitaip tai būtų vartų plėtimas be defekto.
2. **#5190 / #5342 / #5400** (bėgiklio commit'o žinutė, worktree izoliacija, dokumentų
   skaičių sinchronizavimas) — `agents/run.py` ir `scripts/`, kitų vaidmenų failai.
   Šio paleidimo commit'o žinutė vėl imta iš modelio teksto, ne iš pakeitimų.
3. **#11235 / #4808** (`check_audio.py` nemato tiesioginių `api.speak` eilučių) —
   `scripts/check_audio.py`, ne publikavimo failas.
4. Veidrodžių serveriai 8975–8978 sustabdyti po matavimų; katalogas `scratch/pub255a`
   yra scratch, ne repo.
