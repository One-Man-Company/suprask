# publikavimo-agentas — 2026-11-18T0621

- paleidimas: #340 (manual)
- trukmė: 177s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ research/wiki/changelog.md
│ @@ -1,6 +1,16 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-18 (06:23) — Publikavimo patikra #340: repo 39 / paskelbta 39, gyvas kodas = `e2d31cf2`, garsas 1 138/1 138, #338 paliktas registruotas signalas uždarytas kaip zondo artefaktas
│ +
│ +- **Būsena:** `HEAD` = `origin/main` = `e2d31cf2`, `git rev-list --left-right --count origin/main...HEAD` → `0 0`; darbinė kopija prieš darbą švari (`git status --porcelain -uall` → 0 eilučių). Gyvas `index.html` → `200`, 3 487 B, neša `?v=e2d31cf2`; `live_version` = `repo_version` = `e2d31cf2`.
│ +- **`check_published.py` (numatytasis režimas, `--json`, rc 0):** „Repozitorija: 39 moduliai / Paskelbta: 39 moduliai“ (`grade-01: repo 39, gyvai 39`); `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `path_differs` `[]`, `stale` 0, `stale_unknown` 0, `aux_stale` 0, `shell_stale` 0, `shell_unreachable` 0, `shell_count` 18, `history_checked` true, `unpushed_checked` true / `unpushed_commits` 0, `Garsas: patikrinta 1138 iš 1138 (visi)` su `sampled: false`, `verdict.label` = `sutampa`. `vanished_ids` 1 — `03-sakinio-tvarka` → `03-sakinio-zodziai`, `resolved: true` (žyma už seno ID vaiko naršyklėje lieka; alias pasiūlymas jau eilėje, `agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json`).
│ +- **3 gyvi adresai:** `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → `200`, 3 636 B; `content/lt/grade-01/matematika/05-desimtukas.json` → `200`, 3 668 B; `content/lt/grade-01/dorinis-ugdymas/01-susitarimas-ir-zaidimas.json` → `200`, 6 214 B. Papildomai trys vaikui būtini indeksai: `content/lt/grade-01/index.json` `200` 11 741 B, `content/lt/grade-01/path.json` `200` 1 339 B, `content/lt/grades.json` `200` 1 126 B.
│ +- **Uždarytas #338 paliktas nepatvirtintas signalas (LL-36 klasė: įrodymas be patikros neturi tapti defektu):** #338 ataskaitoje liko nepatikrinta, kad trys matematikos komponentai (`desimtukas`, `figuros`, `desningumai`) neva nerasti simuliacijų registre — tai buvo ad-hoc regexo per `SIMS` eksportų blokus artefaktas. #339 pridėjo `scripts/check_registry.py`; paleistas šiandien: „SIMS raktai kode: 55 / grade-01: kryptys 9 · index 39 · failai 39 · užduotys 169 (optional 39) · sim 39 · path 39 · našlaičiai 0 / PROBLEMŲ: 0“, rc 0. Vadinasi, moduliai registre yra; joks `sim.component` nekeistas (tai turinio failas, ne publikavimo sprendimas).
│ +- **Vartai:** `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų, rc 0; `check_docs_facts.py` → 0 klaidų, 0 įspėjimų (9 kryptys, 39 moduliai, 39 sim, 169 užduotys, 569 garso tekstai, 1 138 įrašai, 15 agentų); `check_audio.py --no-engine` → 569 tekstų / 1 138 įrašų / 1 138 mp3, rc 0; `check_registry.py` → 0 problemų, rc 0.
│ +- **Sprendimas:** **sutampa**. Nieko nešalinta, joks ID nepernumeruotas, `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `scripts/**` neliesti; medyje — tik šis įrašas ir `agents/state.json` blokas `last_publish_check_340` (šis failas `.gitignore`).
│ +- **Ankstesnių paleidimų skola:** prieš šį įrašą changelog viršuje buvo #321 (2026-11-16 19:38), t. y. #336, #338 ir #339 savo eilučių neįrašė. Šis įrašas rodo šiandien išmatuotą būseną, o ne atkuria jų skaičius; jų ataskaitos lieka `agents/log/`.
│
│  ## 2026-11-16 (19:38) — Publikavimo patikra #321: repo 39 / paskelbta 39, kodas 18 failų prie `0636eef3`, garsas 1 138/1 138; pirmą kartą neigiamai įrodytas `not_in_path` signalas
│
│ agents/state.json
│ @@ -1425,6 +1425,36 @@
│      "remaining": "Alias mechanizmo nėra — vaiko žyma už 03-sakinio-tvarka lieka be modulio, kol neįgyvendintas progreso-alias pasiūlymas. Dashboard'o kortelė nepaleista (ne šio vaidmens failas). 9 sisteminiai pasiūlymai laukia >3 d. — eilės klausimas.",
│      "notes": "Turinys, ID, index.json, path.json, grades.json, manifestas ir assets neliesti. Du pasiūlymų failai — skola iš #271, kur ataskaitoje suformuluoti, bet neįrašyti (LL-85). agents/state.json yra .gitignore."
│    },
│ +  "last_publish_check_340": {
│ +    "date": "2026-11-18T06:23:17+02:00",
│ +    "run_id": 340,
│ +    "role": "publikavimo-agentas",
│ +    "head_sha": "e2d31cf2",
│ +    "main_sha": "e2d31cf2",
│ +    "unpublished_commits": 0,
│ +    "worktree": "prieš darbą švarus (0 eilučių); po darbo — research/wiki/changelog.md, agents/state.json (šis failas .gitignore)",
│ +    "modules_local": 39,
│ +    "modules_live": 39,
│ +    "ids": "missing_on_live 0, hidden_locally 0, not_in_path 0, path_differs [], stale 0, stale_unknown 0, aux_stale 0, shell_stale 0, shell_unreachable 0 — rc 0",
│ +    "live_version": "e2d31cf2 (repo HEAD e2d31cf2); shell_count 18",
│ +    "vanished_ids": "1 įrašas — 03-sakinio-tvarka → 03-sakinio-zodziai, resolved true",
│ +    "http_codes": {
│ +      "content/lt/grade-01/matematika/04-skaiciu-tiese.json": "200 (3 636 B)",
│ +      "content/lt/grade-01/matematika/05-desimtukas.json": "200 (3 668 B)",
│ +      "content/lt/grade-01/dorinis-ugdymas/01-susitarimas-ir-zaidimas.json": "200 (6 214 B)",
│ +      "content/lt/grade-01/index.json": "200 (11 741 B)",
│ +      "content/lt/grade-01/path.json": "200 (1 339 B)",
│ +      "content/lt/grades.json": "200 (1 126 B)"
│ +    },
│ +    "audio": "check_published.py patikrino VISUS 1 138 įrašus (sampled false) — visi pasiekiami; check_audio.py --no-engine → 569 tekstų / 1 138 įrašų / 1 138 mp3",
│ +    "closed_signal": "#338 paliktas nepatvirtintas signalas (desimtukas, figuros, desningumai „nerasti“ SIMS registre) uždarytas: tai buvo ad-hoc regexo artefaktas. scripts/check_registry.py (pridėtas #339) → SIMS raktai 55, index 39, failai 39, užduotys 169 (optional 39), sim 39, path 39, našlaičiai 0, PROBLEMŲ 0, rc 0",
│ +    "gates": "validate_content --grade 1 --strict 0/0 rc0; check_docs_facts 0/0 rc0; check_audio --no-engine 569/1138/1138 rc0; check_registry 0 problemų rc0",
│ +    "decision": "sutampa",
│ +    "changelog": "research/wiki/changelog.md — įrašas 2026-11-18 (06:23)",
│ +    "closed_debt": "#336, #338, #339 changelog eilučių neįrašė (viršuje buvo #321); šis įrašas rodo šiandienos būseną, jų skaičių neperrašo",
│ +    "remaining": "Alias mechanizmo nėra — žyma už 03-sakinio-tvarka lieka našlaite, kol neįgyvendintas progreso-alias pasiūlymas. Atviras pasiūlymas #19519 rodo į content/lt/grade-01/pasaulio-pazinimas/22-medziai-krumai-zoles.json, kurio repo nėra (gyvas 404) — tai kito vaidmens darbas, ne publikavimo defektas.",
│ +    "notes": "Turinys, ID, index.json, path.json, grades.json, manifestas, assets ir docs neliesti. agents/state.json yra .gitignore."
│ +  },
│    "last_publish_check_285": {
│      "date": "2026-11-14T11:48:33+02:00",
│      "run_id": 285,
Darbas įrašytas: `research/wiki/changelog.md` (naujas #340 įrašas viršuje) + `agents/state.json` blokas `last_publish_check_340`.

1. `python3 scripts/check_published.py` (rc 0, `--json`)

      Repozitorija: 39 moduliai
      Paskelbta:    39 moduliai
        · grade-01: repo 39, gyvai 39
      Garsas: patikrinta 1138 iš 1138 (visi) — visi pasiekiami
      ✔ Repo ir gyva svetainė sutampa

   Detalės: `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `path_differs` [], `stale` 0, `aux_stale` 0, `shell_stale` 0, `shell_unreachable` 0, `shell_count` 18, `history_checked` true, `unpushed_checked` true / `unpushed_commits` 0, `sampled: false`, `verdict.label` = `sutampa`. `HEAD` = `origin/main` = `e2d31cf2`, `git rev-list --left-right --count origin/main...HEAD` → `0 0`; gyvas `index.html` 200 / 3 487 B su `?v=e2d31cf2`.

2. Trys gyvi adresai

      04-skaiciu-tiese.json            200  3 636 B
      05-desimtukas.json               200  3 668 B
      01-susitarimas-ir-zaidimas.json  200  6 214 B
   Papildomai: `grade-01/index.json` 200 / 11 741 B, `path.json` 200 / 1 339 B, `grades.json` 200 / 1 126 B.

3. Sprendimas: **sutampa**. Nieko nešalinau, jokio ID nepernumeravau, `content/**`, `assets/**`, `docs/**`, `scripts/**`, `AGENTS.md` neliesti (git status: tik `M research/wiki/changelog.md`).

Ką dar uždarė šis paleidimas:
- #338 paliktas nepatvirtintas signalas (trys matematikos komponentai „nerasti“ SIMS registre) — #339 pridėtas `scripts/check_registry.py` paleistas: 55 SIMS raktai, index 39, failai 39, užduotys 169 (optional 39), sim 39, path 39, našlaičiai 0, PROBLEMŲ 0, rc 0. Tai buvo zondo regexo artefaktas, ne lūžęs modulis.
- Changelogo skola: viršuje buvęs įrašas buvo #321 — #336, #338, #339 eilučių neįrašė. Šis įrašas rodo šiandienos būseną, jų skaičių neatkuria, ir tai jame pasakyta atvirai.
- Vartai: `validate_content.py --grade 1 --strict` 0/0 rc 0; `check_docs_facts.py` 0/0 rc 0; `check_audio.py --no-engine` 569 tekstų / 1 138 įrašų / 1 138 mp3 rc 0.

Likęs dalykas, kuris ne mano ribose: atviras pasiūlymas #19519 rodo į `content/lt/grade-01/pasaulio-pazinimas/22-medziai-krumai-zoles.json`, kurio repo nėra (gyvas 404) — tai ideatoriaus/metodininko eilė, ne publikavimo defektas. Naujų pasiūlymų šiame paleidime neteikiau: defekto nebuvo, o pasiūlymas be įrodymo būtų triukšmas.

## klaidos

```
session_id: local-764adb169b078fcf10463fa29a1ec1402498a7f9c1a13e15bf05d32d4bb24683
```
