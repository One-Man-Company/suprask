# publikavimo-agentas — 2026-11-16T1938

- paleidimas: **#321**
- vaidmuo: publikavimo-agentas
- data: 2026-11-16 (19:30–19:45)
- sprendimas: **sutampa** — `check_published.py` rc 0, repo 39 / paskelbta 39
- neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `scripts/**`

## 1. Įėjimo būsena

- `HEAD` = `origin/main` = `0636eef3` (`git rev-list --left-right --count origin/main...HEAD` → `0 0`).
- Darbinė kopija prieš darbą švari (`git status --porcelain -uall` → 0 eilučių).
- Platformos būsena (paleidimo antraštė): 39 moduliai, 169 užduotys, 39 sim, 1 klasė gyva, 1 138 garso failų (32,9 MB).

## 2. `check_published.py` išvestis (numatytasis režimas, rc 0)

```
Repozitorija: 39 moduliai
Paskelbta:    39 moduliai
  · grade-01: repo 39, gyvai 39
Pervadinti ID, priimta ir užregistruota (1):
  - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai (registruota; žyma už seno ID vaiko naršyklėje LIEKA — alias mechanizmo nėra, žr. agents/proposals/)
Garsas: patikrinta 1138 iš 1138 (visi) — visi pasiekiami
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, svetainės kodas 18 failų, versija 0636eef3).
```

Kiti raktai (`--json`, rc 0): `local` 39, `published` 39, `missing_on_live` `[]`, `hidden_locally` `[]`,
`not_in_path` `[]`, `stale` `[]`, `stale_unknown` `[]`, `aux_stale` `[]`, `path_differs` `[]`,
`shell_stale` `[]`, `shell_unreachable` `[]`, `shell_count` 18, `live_version` = `repo_version` = `0636eef3`,
`unpushed_checked` true / `unpushed_commits` 0, `history_unchecked` `[]`, `history_note` `''`,
garsas `total` 1138 / `checked` 1138 / `sampled` false / `missing` `[]` / `empty` `[]` / `unreachable` `[]`,
`verdict` = `{"ok": true, "reasons": [], "label": "sutampa"}`.

`vanished_ids` 1: `03-sakinio-tvarka` → `03-sakinio-zodziai`, `last_rev` `a2ad497`, `resolved: true`.
Kadangi `hidden_locally` tuščias, vaidmens 3 žingsnis („sustok ir pranešk“) nejungiamas — vaiko
`localStorage` žymos niekur neturi modulio, kurio repo neturėtų.

## 3. Trys gyvi adresai (HTTP kodai)

| adresas | kodas | baitai |
|---|---|---|
| `content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json` | 200 | 8 812 |
| `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` | 200 | 5 044 |
| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | 200 | 4 932 |

Papildomai: `content/lt/grade-01/index.json` 200 / 11 741 B, `content/lt/grades.json` 200 / 1 126 B,
`assets/audio/lt/manifest.json` 200 / 63 974 B, `index.html` 200 / 3 487 B (`?v=0636eef3`).

## 4. Kas nepaskelbta — patikrinta priešinga kryptimi

`pages.yml` (eil. 23–29) iš repo ima tik `index.html`, `404.html`, `assets/`, `content/` ir ištrina
katalogų `AGENTS.md`. Tai patikrinta ne skaitant YAML, o klausiant svetainės:

| adresas | kodas |
|---|---|
| `README.md` | 404 (563 B — 404 puslapis) |
| `AGENTS.md` | 404 |
| `scripts/check_published.py` | 404 |
| `agents/state.json` | 404 |
| `dashboard/server.py` | 404 |
| `sources/` | 404 |
| `.probe-krit41.html`, `.probe-krit41b.html` | 404 |

Dirbtuvės (agents, scripts, dashboard, sources, docs) į svetainę nepatenka. `assets/` neturi kitų
failų tipų (tik `css/`, `js/`, `audio/`), todėl `SHELL_GLOBS` (18 failų: `index.html`, `404.html`,
15 × `assets/js/**/*.js`, 1 × `assets/css/*.css` — perskaičiuota `find`, ne iš atminties) padengia viską, ką naršyklė įkelia.
`.probe-krit41*.html` yra `.gitignore` (`:34` `.probe-*`) ir netrackinti — ne publikavimo rizika,
tik darbo likutis medyje; neliesti.

## 5. Neigiami zondai — ar trys pažangos signalai tikrai įsižiebia

Zondas `scratch/p321_gates.py` (ne repo): laikinas repo `T` (ROOT imamas iš įrankio vietos) +
laikinas veidrodis `L` kaip „gyva svetainė“ per `http.server`; `assets/audio` — kietosios nuorodos
(tik skaitoma), visa kita — tikros kopijos, tad **joks tikro repo failas nebuvo rašomas**.

| scenarijus | pakeista | rc | eilutė |
|---|---|---|---|
| A0 | nieko (repo = veidrodis) | 0 | „sutampa (… kodas 18 failų)“ |
| A1 `hidden_locally` | **tik veidrodis**: į `index.json` pridėtas `99-dinges-modulis` | 1 | `PAVOJUS PAŽANGAI — svetainėje yra, repo ne (1): 99-dinges-modulis`, repo 39 / gyvai 40 |
| B1 `not_in_path` | **tik repo**: iš `path.json` išimtas `08-metu-laikai` | 1 | `NĖRA path.json sekoje (1): 08-metu-laikai` |
| C1 `missing_on_live` | **tik veidrodis**: iš `index.json` išimtas `03-sakinio-zodziai` | 1 | `NESKELBTA (1): 03-sakinio-zodziai`, repo 39 / gyvai 38 |
| A2 | abi pusės atstatytos | 0 | „sutampa (… kodas 18 failų)“ |

Žalias rezultatas grįžta, kai defektas pašalinamas — vartai ne tik raudoni, bet ir atvirkščiai
teisingi. Šalutinis pastebėjimas (ne defektas): kai keičiamas `index.json` ar `path.json`, tas pats
įvykis papildomai pranešamas ir kaip `PASENĘS PAGRINDINIS FAILAS` — viena priežastis, du signalai;
`verdict.label` vis tiek ima pirmą (ID) priežastį, todėl žmogus nemalonės.

**Kiek tai nauja (sąžiningai):** `hidden_locally` ir `missing_on_live` jau buvo neigiamai įrodyti #306
(`agents/log/publikavimo-agentas-2026-11-15T1930.md:94–96`, veidrodis `scratch/mirror306-*`) — šiandien
tai pakartojimas kitame medyje, kaip reikalauja LL-98. **`not_in_path` neigiamai įrodytas pirmą kartą:**
`grep -rn "NĖRA path.json" agents/log/` iki šiol rado tik įrankio išeities kodo eilutes, o ne matavimą.

## 6. Vartai

| įrankis | rezultatas |
|---|---|
| `validate_content.py --grade 1 --strict` | 0 klaidų, 0 įspėjimų, rc 0 |
| `check_docs_facts.py` | 0/0 — 9 kryptys, 39 moduliai, 39 sim, 169 užduotys, 569 garso tekstai, 1 138 įrašai |
| `check_lessons.py` | 100 įrašų, visi su 4 laukais |
| `check_audio.py --no-engine` | 569 tekstų / 1 138 įrašų / 1 138 mp3, rc 0 |
| `check_published.py` | rc 0, `sutampa` |

`check_view.py` nepaleistas sąmoningai: `content/**` ir `assets/**` šiame darbe neliesti, o gyvą
svetainę jau tikrino `check_published.py` (18 kodo failų baitai + 39 moduliai + 1 138 mp3). Tai
praleidimas, ne užmirštas žingsnis.

## 7. Ką palietė šis darbas

- `research/wiki/changelog.md` — įrašas 2026-11-16 (19:38).
- `agents/log/publikavimo-agentas-2026-11-16T1938.md` — ši ataskaita.
- `agents/state.json` — `roles.publikavimo-agentas` + `last_publish_check_321`; atkurtas #319 paliktas
  `last_publish_check_319` su `source` nuoroda į #319 ataskaitą (ne išgalvotas matavimas).

Zondas liko už repo: `~/.hermes/profiles/deepseek41flash/cache/scratch/p321_gates.py` (12,8 s visas
ciklas) ir `p321_json.py`. Trinti nereikia.

Naujos pamokos nepridėta: defekto nebuvo, o `research/wiki/guidelines/pamokos.md` taisyklė —
„pamoka iš realaus defekto, ne iš teorijos“. `not_in_path` įrodymas yra patikra, ne defektas.

## 8. Kas lieka atvira (ne šio vaidmens failai)

1. **Pažangos alias už pervadinto `03-sakinio-tvarka`** — `progress.js` ne mano failas; pasiūlymas
   `agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json` (high) tebegalioja. Kol jo
   nėra, vaiko žyma už seno ID lieka be modulio (kiekvieną paleidimą tai matoma `vanished_ids`).
2. **`check_audio.py` manifestas abiem kryptimis** — pasiūlymas
   `agents/proposals/2026-11-16-publikavimo-agentas-garsas-abiem-kryptim.json` (high, `scripts/`).
   Šiandien manifestas švarus (refs 1 138 = disk 1 138), bet `check_published.py` tą klasę pagaus tik
   svetainėje, ne lokaliame CI.
3. **`index.json` kortelės laukai vs modulio laukai** — palyginimo nėra (`validate_content.py`
   lygina tik `id` ir `strand`); #290 zondas rodė 0 nesutapimų iš 156, tad latentinis. Pasiūlymas
   `2026-11-14-publikavimo-agentas-index-ir-modulis.json` tebegalioja.
4. **Mėginio režimas** (`--audio-sample N`) lieka aklas pavieniam 404 — išvestyje tai pasakoma
   žodžiais, bet rankinis bėgimas gali apgauti. Numatytasis režimas yra pilnas, todėl CI ir bėgiklis
   saugūs.
