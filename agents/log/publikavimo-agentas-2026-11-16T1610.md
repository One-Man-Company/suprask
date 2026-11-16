# publikavimo-agentas — 2026-11-16T1610

- paleidimas: #319
- vaidmuo: publikavimo-agentas
- data: 2026-11-16 (16:04–16:10)
- sprendimas: **sutampa** — `check_published.py` rc 0, repo 39 / paskelbta 39
- neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `scripts/**`

## 1. Įėjimo būsena

- `HEAD` = `origin/main` = `e263ed2` (`git rev-list --left-right --count origin/main...HEAD` → `0 0`).
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
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, svetainės kodas 18 failų, versija e263ed21).
```

Kiti raktai: `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0,
`aux_stale` 0, `shell_stale` 0, `shell_unreachable` 0, `path_differs` `[]`, `history_checked` true,
`unpushed_commits` 0, `unpushed_checked` true, `shell_count` 18, `verdict.label` = `sutampa`.

Nė vieno `hidden_locally` — todėl 3 žingsnis („sustok ir pranešk“) neįjungtas: vaiko `localStorage`
žymos neturi nė vieno modulio, kurio repo nebūtų. Vienintelis dingęs ID yra priimtas pervadinimas
`03-sakinio-tvarka` → `03-sakinio-zodziai` (`scripts/known_renames.json`), `resolved: true`.

## 3. Trys gyvi adresai (HTTP kodai)

| adresas | kodas | baitai |
|---|---|---|
| `content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json` | 200 | 8 812 |
| `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` | 200 | 5 044 |
| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | 200 | 4 932 |

Papildomai: `content/lt/grade-01/index.json` 200 / 11 741 B, `assets/audio/lt/manifest.json` 200 / 63 974 B,
`index.html` 200 / 3 487 B. Baitai sutampa su repo — juos lygino pats `check_published.py` (39 moduliai +
18 kodo failų + 2 pagrindiniai failai + 1 138 mp3).

## 4. Skola iš #316 — trys pamokos, trys išmatuoti zondai

#316 paliko keturis skolos punktus. Visi uždaryti šiame darbe.

### LL-98 — `404.html` vartuose (`scratch/p319_ll98.py`)

- `shell_files()` = **18** failų, `404.html` jame yra (buvo 17 prieš #308).
- Veidrodis `scratch/m316` (kietoji kopija repo failų) + `python3 -m http.server 8977` ir
  `SUPRASK_LIVE_ROOT=http://127.0.0.1:8977/`:
  - **A1** bazinis, `404.html` nepakeistas (563 B) → **rc 0**, „sutampa (… svetainės kodas 18 failų)“;
  - **A2** `404.html` 563 B → 586 B (+23 B komentaras) → **rc 1**,
    `PASENĘS KODAS — naršyklė vykdo kitą failą (1): 404.html: repo 563 B, gyvai 586 B`;
  - **A3** failas atstatytas → **rc 0**.
- Tai pirmas įrodytas `404.html` neigiamas atvejis šiame repo variante. Kodo nekeista: vartai jau
  elgėsi teisingai, trūko įrodymo, o ne pataisos.

### LL-99 — neišsiųstų commit'ų patikra (`scratch/p319_ll99.py`)

Laikinas repo (`git init`, vienas commit, jokio remote), modulis importuotas tiesiai:

```
git rev-list origin/main..HEAD → rc=128 stdout=''
unpushed() → ([], False)
verdict({}) → ok=False reasons=["neišsiųstų commit'ų patikra neįvyko"]
verdict(be patikros, 0 commit'ų) → ok=False reasons=["neišsiųstų commit'ų patikra neįvyko"]
po update-ref refs/remotes/origin/main HEAD: unpushed() → ([], True)
verdict(patikra įvyko, 0 commit'ų) → ok=True reasons=[]
po naujo commit'o: unpushed() → (['57aa2905…'], True)
```

Nežinoma būsena nėra žalia; žalia grąžinama tik tada, kai git tikrai palygino.

### LL-100 — garso manifestas viena kryptimi (`scratch/p319_ll100.py`)

- Tikras manifestas: 569 tekstų, `refs` **1 138**, `disk` **1 138**, `refs - disk` **0**, `disk - refs` **0**;
  `check()` → `ok=True`, `missing=0`, `orphans=0`.
- Laikina kopija (kietosios nuorodos) + vienas papildomas manifesto įrašas, kurio failų nėra, o tekstas
  nekalbamas (`collect()` jo neturi): `check()` → **`ok=True`**, `referenced=1140`, `on_disk=1138`,
  `missing=0`, `orphans=0`. Tiksliai #316 simptomas „naudojama 1140 iš 1138“.
- `scripts/check_audio.py` ne mano failas (scripts/ savininkas), todėl pataisymas **nepadavėtas** —
  parašytas pasiūlymas `agents/proposals/2026-11-16-publikavimo-agentas-garsas-abiem-kryptim.json`
  (struktura, high), su tiksliais eilučių įrodymais.

### #316 manifestas — ar taisymas laikosi

Po #316 pašalintų dviejų įrašų: `check_audio.py --no-engine` →
`✔ Garsas pilnas: 569 tekstų (iš jų 5 — tiesioginės api.speak eilutės simuliacijų kode), 1138 įrašų, visi iš
Piper balso, naudojama 1138 iš 1138 mp3`, rc 0. Abi apsaugos kryptys sutampa.

## 5. Vartai

| įrankis | rezultatas |
|---|---|
| `validate_content.py --grade 1 --strict` | 0 klaidų, 0 įspėjimų, rc 0 |
| `check_docs_facts.py` | 0/0 — 9 kryptys, 39 moduliai, 39 sim, 169 užduotys, 569 garso tekstai, 1 138 įrašai, 15 agentų |
| `check_lessons.py` | 97 įrašai prieš šio darbo pamokas |
| `check_audio.py --no-engine` | 569 tekstų / 1 138 įrašų / 1 138 mp3, rc 0 |

## 6. Ką palietė šis darbas

- `research/wiki/changelog.md` — įrašas 2026-11-16 (16:10).
- `research/wiki/guidelines/pamokos.md` — LL-98, LL-99, LL-100 (97 → 100 įrašų).
- `agents/proposals/2026-11-16-publikavimo-agentas-garsas-abiem-kryptim.json` — 1 pasiūlymas.
- `agents/log/publikavimo-agentas-2026-11-16T1610.md` — ši ataskaita.
- `agents/state.json` — `roles.publikavimo-agentas` + `last_publish_check_319`.

Zondai liko už repo: `~/.hermes/profiles/deepseek41flash/cache/scratch/p319_ll98.py`, `p319_ll99.py`,
`p319_ll100.py`, veidrodis `m316` (po zondo atstatytas, 563 B `404.html`). Trinti nereikia.

## 7. Ko nespėjau / lieka atvira

1. **`check_audio.py` abiem kryptimis** — `scripts/` ne mano failas, pasiūlymas pateiktas
   (`high`). Kol jis neįgyvendintas, tos pačios klasės defektą pagaus tik `check_published.py`
   (jis manifestą palygina su svetaine), o lokalus CI liks žalias.
2. **Pažangos alias už pervadinto ID** — `03-sakinio-tvarka` → `03-sakinio-zodzi` žymą vaiko
   naršyklėje palieka be modulio; pasiūlymas `2026-11-13-publikavimo-agentas-progreso-alias.json`
   tebegalioja, `progress.js` ne mano failas.
3. **`check_view.py` nebuvo paleistas** — sąsaja šiame darbe neliesta (`content/**`, `assets/**` švarūs),
   o gyvą svetainę jau tikrino `check_published.py` baitais ir struktūriškai. Tai sąmoningas
   praleidimas, ne užmirštas žingsnis.
4. **#316 kanoninė ataskaita** nebuvo įrašyta (bėgiklio `1144.md` yra sutrumpinta automatinė versija).
   Šiandienos changelog įrašas užima jos vietą šiandienos skaičiais, kaip #288/#294/#301 atvejais.
