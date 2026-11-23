# publikavimo-agentas — 2026-11-23T0623

- paleidimas: #464 (manual)
- trukmė: 246s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ research/wiki/changelog.md
│ @@ -1,6 +1,17 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-23 (06:27) — Publikavimo patikra #464: repo 62 / paskelbta 62 prie `3fb8f725`, visi 62 modulių failai gyvai baitais lygūs, garsas 1 766/1 766 ir vardai 1 766/1 766; palaikyta
│ +
│ +- **Būsena (`scripts/check_published.py`, numatytasis ir `--json`, rc 0):** „Repozitorija: 62 moduliai / Paskelbta: 62 moduliai“ (`grade-01: repo 62, gyvai 62`); `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `stale`, `stale_unknown`, `stale_unmeasured`, `live_missing`, `live_gone`, `missing_in_repo`, `aux_stale`, `aux_absent`, `aux_gone`, `shell_stale`, `shell_gone`, `shell_unreachable`, `path_differs` — visi `[]` / `false`; `shell_count` 19, garsas **1 766/1 766** (`sampled: false`), garso vardai **1 766/1 766** (`mismatch` 0, `text_mismatch` 0, `unverified` 0, `absent` 0), `live_version` = `repo_version` = `deploy_live_version` = `3fb8f725`, `deploy_pending` false, `unpushed_commits` 0, `bytes_checked` true, `verdict.label` = „sutampa“. `vanished_ids` 1 — `03-sakinio-tvarka` → `03-sakinio-zodziai`, `last_rev a2ad497`, `resolved: true`, `alias_ok: true` (vaiko žyma perkeliama, ne pametama).
│ +- **Ne skaičiai, o baitai — visi 62, ne pavyzdys:** kiekvieno `index.json` įrašo `file` gyvas sha256 = repo sha256 (`urllib` + `hashlib`, 62/62, `mismatch` 0). Tad 52→62 augimas ne „praneštas“, o patvirtintas kiekvienam failui atskirai; nė vienas modulis svetainėje nepasenęs.
│ +- **3 realios gyvos patikros (HTTP kodai, ne atmintis):** `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` → **200**; `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → **200**; `content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json` → **200**; **neigiama kontrolė** `content/lt/grade-01/matematika/99-nera.json` → **404** (tad 200 aukščiau kažką reiškia). Papildomai `content/lt/grade-01/index.json` ir `path.json` → **200**.
│ +- **Seka (`path.json`):** `sequence` 62 įrašai, `index.json` 62 moduliai / 9 kryptys; `not_in_path` `[]`, „sekoje, bet ne modulis“ `[]`, dublikatų 0 abiejose pusėse — tvarkyti nereikėjo.
│ +- **Vartai po patikros:** `validate_content.py --grade 1 --strict` → 0 klaidų / 0 įspėjimų, rc 0; `check_registry.py --grade 1` → „kryptys 9 · index 62 · failai 62 · užduotys 273 (optional 62) · sim 62 · path 62 · našlaičiai 0 / PROBLEMŲ: 0“, rc 0; `check_docs_facts.py` → 0/0 (README ir `grades/01/index.md` skelbia 62 modulius / 9 kryptis — sutampa su failais).
│ +- **#411 pasiūlymas įgyvendintas, bet eilėje (LL-21):** `agents/proposals/2026-11-20-publikavimo-agentas-ci-registry.json` prašė įtraukti `check_registry.py` į CI. Išmatuota šiame paleidime: `.github/workflows/validate.yml:33` tą žingsnį **turi** (`f58dd22`, sistemos-architektas #414) — 4,5 val. po pasiūlymo. Pasiūlymo `status` tebėra `new`, tad eilė rodo darbą, kurio nebereikia. Statusų šis vaidmuo neliečia (uždarymą valdo bėgiklis/DB) — užfiksuota čia, kad kitas paleidimas nepradėtų nuo nulio.
│ +- **Nepadaryta ir pasakyta (LL-36):** naršyklės patikros (360 px / 200 %) šiame paleidime nėra — `python3 -c "import playwright"` → `ModuleNotFoundError`. Tai ankstesnių paleidimų matavimas, ne šios dienos; publikavimo sprendimas nuo to nepriklauso, bet teiginio „veikia telefone“ šiandien nepakartoju.
│ +- **Sprendimas: sutampa.** Jokio atsukimo, jokio taisymo nereikėjo: 62/62 abiejose pusėse, 62/62 baitais, garsas ir vardai pilni, gyva versija = `HEAD` = `origin/main`, 0 neišstumtų commit'ų. Neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `.github/workflows/**`; joks modulio ID nepernumeruotas, nieko nešalinta; jokio `git push` iš agento.
│
│  ## 2026-11-22 (18:35) — Publikavimo patikra #442: repo 52 / gyvai 52 prie `828e6127`, 7 šiandien keisti failai baitais lygūs, garsas 1 514/1 514; palaikyta
│
Sprеndimas: **sutampa** — repo 62 / paskelbta 62, visi moduliai gyvai baitais lygūs.

`scripts/check_published.py` (numatytasis ir `--json`, rc 0):
  Repozitorija: 62 moduliai · Paskelbta: 62 moduliai · grade-01: repo 62, gyvai 62
  missing_on_live, hidden_locally, not_in_path, orphan_files, stale, stale_unknown,
  stale_unmeasured, live_missing, live_gone, missing_in_repo, aux_* , shell_* — visi []
  path_differs false · shell_count 19 · unpushed_commits 0 · bytes_checked true
  garsas 1 766/1 766 (sampled false, missing/empty/unreachable [])
  garso vardai 1 766/1 766 (mismatch 0, text_mismatch 0, unverified 0, absent 0)
  live_version = repo_version = deploy_live_version = 3fb8f725 · deploy_pending false
  vanished_ids 1: 03-sakinio-tvarka → 03-sakinio-zodziai, resolved true, alias_ok true
  verdict: {"ok": true, "label": "sutampa"}

Papildomas matavimas, kurio check_published nedaro po vieną: kiekvieno iš 62 `index.json` įrašo failo gyvas sha256 = repo sha256 — 62/62, mismatch 0. Tai patvirtina 52→62 augimą failui atskirai, ne vienu skaičiumi.

3 gyvi adresai (curl, HTTP kodai):
  200 content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json
  200 content/lt/grade-01/matematika/04-skaiciu-tiese.json
  200 content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
  404 content/lt/grade-01/matematika/99-nera.json  (neigiama kontrolė — 200 viršuje kažką reiškia)
  200 index.json · 200 path.json

Vartai: validate_content --grade 1 --strict 0/0 rc 0 · check_registry 9 kryptys · index 62 · failai 62 · užduotys 273 · sim 62 · path 62 · našlaičiai 0 rc 0 · check_docs_facts 0/0 rc 0.

FAILAS, kuris pakeistas šiame paleidime:
  research/wiki/changelog.md — įrašas „2026-11-23 (06:27) — Publikavimo patikra #464: repo 62 / paskelbta 62 prie `3fb8f725`, visi 62 modulių failai gyvai baitais lygūs, garsas 1 766/1 766…“ (commit 7f346d9). Tai vienintelis pakeitimas; `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `.github/workflows/**` neliesti, joks ID nepernumeruotas, nieko nešalinta, jokio `git push` iš agento. Publikuojamų failų tarp pakeitimų 0, tad 62/62 ir 1 766/1 766 po šio commito negali pasikeisti.

Užfiksuoti radiniai (ne šio vaidmens sprendimas):
  #411 pasiūlymas (`2026-11-20-publikavimo-agentas-ci-registry.json`) prašo `check_registry.py` CI — išmatuota, kad `.github/workflows/validate.yml:33` tą žingsnį JAU turi nuo `f58dd22` (#414). Pasiūlymo `status` tebėra `new`, tad eilė rodo jau atliktą darbą; statusų neliečiau, nes uždarymą valdo bėgiklis.
  Naršyklės patikros (360 px / 200 %) šiame paleidime nėra: `playwright` modulio aplinkoje nėra. Pasakyta, o ne apeita.

Naujos pamokos nepridėjau — rastas neatitikimas atitinka jau įrašytą LL-21.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-f9c7e6f0ad4c46b02bf974d32099a0069ed86e5b2337ab6f7c4d1009e977c7e4
```
