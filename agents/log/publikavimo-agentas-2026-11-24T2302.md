# publikavimo-agentas — 2026-11-24T2302

- paleidimas: #524 (manual)
- trukmė: 326s
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
│ +## 2026-11-24 (23:07) — Publikavimo patikra #524: repo 77 / paskelbta 77 prie `12fddc0f`, garsas 2 224/2 224 (vardai ir dydžiai 2 224/2 224); paskutinis sim pataisymas (#523) svetainėje baitas į baitą; sutampa
│ +
│ +- **Būsena (`python3 scripts/check_published.py`, rc 0):** „Repozitorija: 77 moduliai / Klasės: grade-01 (statusas „live“ iš content/lt/grades.json) / Paskelbta: 77 moduliai“ (`grade-01`: repo 77, gyvai 77); `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `missing_in_repo`, `live_missing`, `live_gone`, `stale*`, `aux_*`, `shell_*` — visi `[]`; `path_reordered` `[]`, `path_inserted_midsequence` 4 (`14-veikejas-pagal-teksta`, `41-augalo-dalys`, `08-avalynes-dziovinimas`, `09-austinis-ir-megztas-audinys` — įterpti į maršruto vidurį, leidžiama, įvardyta); `undeclared_grades` `[]`, `grade_scope_missing_index` `[]`, `scope_checked` true; garsas **2 224/2 224** (visi, ne mėginys), garso vardai **2 224/2 224** (vardo maišas = baitų maišas IR priekis = teksto maišas), garso dydžiai **2 224/2 224** (diskas = `Content-Length`); svetainės kodas 19 failų; `live_version` = `repo_version` = `12fddc0f`, `deploy_pending` false, `unpushed_commits` 0; pervedamas ID vienas ir sutvarkytas (`03-sakinio-tvarka` → `03-sakinio-zodziai`, `alias_ok: true`); `verdict` = „sutampa“.
│ +- **3 gyvi adresai (`curl`, HTTP kodas ir baitai):** `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → **200** (4 972 B); `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` → **200** (5 459 B, pervadinimo įpėdinis); `content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json` → **200** (8 685 B = repo failo dydis baitas į baitą). **Neigiama kontrolė:** `content/lt/grade-01/matematika/99-nera.json` → **404** (563 B klaidos puslapis, ne tuščias 200).
│ +- **Paskutinis kūrėjo darbas svetainėje, ne tik repo.** #523 pakeitė `assets/js/sims/matematika.js` — tai kodas, kurį vaikas įkelia, o ne turinio JSON. Gyvas failas lygintas su repo: `sha256 0669c76641d8d6ce98ca9da0cd6192ea5f834bd70673072550a0a225959c5768` abiejose pusėse; gyvas `index.html` neša `?v=12fddc0f`, t. y. podėlio versija = `HEAD` = gyva versija, tad sim pataisymas tikrai pasiekė naršyklę, o ne liko laukelyje. `check_published.py` tą patvirtina ir savo `shell_*` sąrašais (19 failų, 0 pasenusių).
│ +- **CI ir deploy (`gh run list`):** prie `12fddc0f` — `Publikuoti svetainę` **completed/success** ir `Tikrinti turinį` **completed/success** (2026-11-24T20:46:57Z); prieš tai `41fed90b` (#522) ir `e4786907` (#521) — abu workflow `success`. Nė vienas paskutinis commit'as neliko nepaskelbtas, darbinė kopija švari (0 pakeitimų).
│ +- **Ką patikrinau papildomai, ko šiame bėgime niekas nekeitė:** `scripts/probe_publish_sets.py` → **31/31 lūkesčių, rc 0** (įskaitant #515 pridėtus N/O/O2/P/Q), t. y. publikavimo įrankio sprendimai tebėra matuojami, o ne tik žali; `check_published.py --scope` rc 0. Jokio naujo defekto nerasta — šis bėgimas yra palaikymo patikra, ne taisymas.
│ +- **Vartai po patikros:** `validate_content.py` 0 klaidų / 0 įspėjimų; `check_registry.py` „kryptys 9 · index 77 · failai 77 · užduotys 339 (optional 77) · sim 77 · path 77 · našlaičiai 0 / PROBLEMŲ: 0“; `check_language.py` 0 klaidų / 0 įspėjimų (77 moduliai, pastabos 53).
│ +- **Sprendimas: `sutampa`.** 77/77 abiejose pusėse, visi modulių baitai ir 19 kodo failų lygūs, garsas 2 224/2 224 ir dydžiai 2 224/2 224, gyva versija = `HEAD` = `12fddc0f`, 0 neišstumtų commit'ų. Neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`; joks modulio ID nepernumeruotas, nieko nešalinta, push nedarytas (bėgiklio darbas).
│
│  ## 2026-11-24 (20:08) — Publikavimo patikra #515: repo 77 / paskelbta 77 prie `0793e83d`, garsas 2 224/2 224 ir dydžiai 2 224/2 224; klasės sąrašas tapo matavimu (N/O/P/Q zondai), sutampa
│
Įrašyta: `research/wiki/changelog.md` — naujas 2026-11-24 (23:07) įrašas apie #524, commit `7fcb6e6` (be push — tai bėgiklio darbas).

check_published.py (rc 0)
  Repozitorija: 77 moduliai · Klasės: grade-01 („live“ iš grades.json) · Paskelbta: 77
  grade-01: repo 77, gyvai 77; visi sąrašai [] (missing_on_live, hidden_locally,
  not_in_path, orphan_files, missing_in_repo, live_missing, live_gone, stale*,
  aux_*, shell_*); path_reordered []; path_inserted_midsequence 4 (į vidurį, leidžiama);
  undeclared_grades []; garsas 2 224/2 224 · vardai 2 224/2 224 · dydžiai 2 224/2 224;
  svetainės kodas 19 failų; live_version = repo_version = 12fddc0f;
  deploy_pending false; neišstumta 0; verdict „sutampa“

3 gyvi adresai (curl)
  matematika/04-skaiciu-tiese.json → 200 (4 972 B)
  lietuviu-kalba/03-sakinio-zodziu.json → 200 (5 459 B)
  pasaulio-pazinimas/10-gyvunu-grupes.json → 200 (8 685 B = repo dydis)
  neigiama kontrolė matematika/99-nera.json → 404 (563 B)

Papildomai, nes #523 keitė ne turinį, o kodą: gyvas assets/js/sims/matematika.js sha256 sutampa su repo (0669c766…), gyvas index.html neša ?v=12fddc0f, abu workflow prie 12fddc0f — success. probe_publish_sets.py 31/31 rc 0, --scope rc 0. Naujo defekto nerasta, todėl naujos pamokos nepridėjau.

Sprendimas: sutampa (repo 77 / paskelbta 77, visi baitai ir garsas abiejose pusėse, 0 neišstumtų).

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-7e701248deb666e3c6a8edc4359be4fb41171a6f268611c45874f9e3e1b1c1b2
```
