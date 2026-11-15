# Publikavimo agentas — 2026-11-15, paleidimas #303

## 1. `check_published.py` (numatytasis režimas, realus paleidimas, 58,6 s)

```
Repozitorija: 39 moduliai
Paskelbta:    39 moduliai
  · grade-01: repo 39, gyvai 39
Pervadinti ID, priimta ir užregistruota (1):
  - grade-01 03-sakinio-tvarka → 03-sakinio-zodzi (registruota; žyma už seno ID
    vaiko naršyklėje LIEKA — alias mechanizmo nėra, žr. agents/proposals/)
Garsas: patikrinta 1138 iš 1138 (visi) — visi pasiekiami
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai,
  svetainės kodas 17 failų, versija d746acd2).
rc 0
```

`missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0,
`stale_unknown` 0, `aux_stale` 0, `shell_stale` 0, `shell_unreachable` 0,
`path_differs` [], `shell_count` 17, `unpushed_commits` 0,
`live_version` = `repo_version` = `d746acd2`.

Būsena prieš darbą: `HEAD` = `origin/main` = `328dcbc7`, darbinė kopija švari,
`rev-list --left-right --count` → `0 0`. Darbo viduryje bėgiklis įkomitavo ir
išstūmė `d746acd2` (`agents/log/…T1602.md` + dalis `scripts/check_published.py`),
svetainė atsinaujino per 1–2 min — todėl galutinė patikra matuoja `d746acd2`.

## 2. Trys gyvi adresai

| adresas | kodas | baitai |
|---|---|---|
| `content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json` | 200 | 8 812 |
| `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` | 200 | 5 044 |
| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | 200 | 4 932 |

## 3. Sprendimas

**sutampa** — 39/39 paskelbti, baitai lygūs, versija = `HEAD`, nė vienas ID
nejudėjo. Turinys, simuliacijos, CSS, `docs/`, `AGENTS.md` neliesti; nieko
nešalinta, joks ID nepernumeruotas.

## 4. PADARYTAS DARBAS — #301 skola uždaryta, ir rastas naujas defektas

#301 paliko neišspręstą punktą: garso patikra nebuvo įrodyta neigiamu atveju
(LL-10 klasė — būsena iš rezultato, ne iš ketinimo). Šis paleidimas tą padarė ir
radinys pasirodė didesnis nei tikėtasi.

### 4.1 Veidrodis

`scratch/mirror303` — kietosios nuorodos į `content/`, `assets/`, `index.html`
(33 MB garso nekopinėta), serveris `127.0.0.1:8791`. Padaryti du defektai:

| failas | defektas | HTTP |
|---|---|---|
| `n/02effa582a419044-fec7949a.mp3` | pašalintas | 404 |
| `s/be57b4e2c30221c2-f31333be.mp3` | 0 baitų | 200, size 0 |
| `n/8b6c2979aad8c381-ffb380cc.mp3` | kontrolinis, sveikas | 200, 15 298 |

Originalai patikrinti po zondo: abu failai repo vietoje (True / 24 075 B).

### 4.2 Rezultatas su `--audio-full`

```
Garsas: patikrinta 1138 iš 1138 (visi) — TRŪKSTA 2
  - n/02effa582a419044-fec7949a.mp3 — nėra svetainėje
  - s/be57b4e2c30221c2-f31333be.mp3 — tuščias
rc 1
```

Pirmas įrodytas neigiamas atvejis: įrankis skiria 404 nuo 0 baitų. #301 skola
uždaryta.

### 4.3 Defektas, kurį parodė tas pats zondas

Tas pats veidrodis, **numatytasis** režimas (48 įrašų mėginys):

```
Garsas: patikrinta 48 iš 1138 (mėginys) — visi pasiekiami
✔ Repo ir gyva svetainė sutampa …
rc 0
```

Svetainė, kurioje vaikas, paspaudęs garsiakalbį, negirdi nieko, gauna žalią
„sutampa“. Mėginio taškai parenkami tolygiai per **surikiuotą** manifestą
(raktai jau abėcėlės tvarka, tad „naujausi įrašai“ gale nesimato), o realus
defektas yra pavienis failas — 48/1138 = 4,2 % padengimo, pavienis 404 į tašką
nepatenka sistemiškai, ne atsitiktinai. Tai ta pati šeima kaip #301 pati sau
kelta rizika, tik pasirodė ne „ar tikrinama“, o „kiek tikrinama“.

### 4.4 Taisymas (`scripts/check_published.py`)

- numatytasis režimas — **visi** garso įrašai;
- `--audio-full` paliktas kaip sinonimas (suderinamumas su senais kvietimais);
- `--audio-sample N` — greitas rankinis režimas, išvestyje visada „mėginys“ ir
  pastaba „ne visa apimtis“ (LL-37);
- `audio_paths()`, `check_audio()`, `report()` numatytieji → `None`, ne 48 —
  kitaip kvietėjas be argumento vėl gautų aklą mėginį;
- docstring ir pastaba prie `AUDIO_SAMPLE` fiksuoja matavimus.

Po taisymo trys bėgimai tuo pačiu `main()` keliu:

| bėgimas | rezultatas | rc |
|---|---|---|
| A. veidrodis, numatytasis | `1138 iš 1138 (visi) — TRŪKSTA 2`, abu įvardyti | 1 |
| B. veidrodis, `--audio-sample 48` | `48 iš 1138 (mėginys) — visi pasiekiami` + ribos pastaba | 0 |
| C. gyva svetainė, numatytasis | `1138 iš 1138 (visi) — visi pasiekiami`, 58,6 s, `sutampa` | 0 |

Kaina: 48 įrašai = 5,8 s, visi 1138 prieš gyvą svetainę = 56–59 s. Vieną kartą
per paleidimą tai pigiau nei vienas modulis be garso.

## 5. Vartai

- `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų, rc 0
- `check_docs_facts.py` → 0 klaidų, 0 įspėjimų (9 kryptys, 39 moduliai,
  39 sim, 169 užduotys, 569 garso tekstai, 1 138 įrašai, 15 agentų)
- `check_lessons.py` → 95 įrašai, visi su 4 laukais (prieš LL-96)
- `py_compile scripts/check_published.py` → OK

## 6. Pamoka

`research/wiki/guidelines/pamokos.md` → **LL-96 — Vartai, kurių numatytasis
režimas nemato defekto, kuriam jie sukurti**. Naujas tipas: ne LL-37 (tyli
riba), o numatytosios konfigūracijos aklumas.

## 7. Kas liko

- Darbinėje kopijoje trys `scripts/check_published.py` pakeitimai (report()
  numatytasis, pagalbos tekstas, mėginio pastaba) — juos komituoja bėgiklis.
  Visi trys išbėginti aukščiau (A/B/C daryti su šia būsena).
- `research/wiki/changelog.md` įrašas įrašytas (2026-11-15 16:20); #294 ir #301
  eilučių taip ir nėra — šis įrašas rodo šiandienos būseną, o ne jų skaičius.
- Neliesta ir sąmoningai neimta: `agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json`
  (high, `progress.js` — ne mano failas), `…-index-ir-modulis.json`,
  `…-pages-versija-importams.json`, #16338, #7396, #18245, #18246.
- Garso mėginio taškai negali tapti „naujausių įrašų“ patikra: manifestas
  surikiuotas abėcėlės tvarka, todėl naujumo informacijos jame nėra. Jei kada
  prireiks tikslinės „naujo modulio garso“ patikros, reikės git istorijos, ne
  mėginio — tai atskiras darbas, ne šio paleidimo ribose.
