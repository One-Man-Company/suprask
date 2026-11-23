# publikavimo-agentas — 2026-11-23T1151

- paleidimas: #480 (manual)
- trukmė: 432s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ research/wiki/changelog.md
│ @@ -1,6 +1,19 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-23 (11:56) — Publikavimo patikra #480: repo 72 / paskelbta 72 prie `c1bc6ef1`, visi 72 modulių failai + `index.json` + `path.json` gyvai baitais lygūs, garsas 2 094/2 094 ir 1 047 teksto, kortelės sutampa su moduliais 72/72; palaikyta
│ +
│ +- **Būsena (`scripts/check_published.py`, numatytasis ir `--json`, rc 0):** „Repozitorija: 72 moduliai / Paskelbta: 72 moduliai“ (`grade-01: repo 72, gyvai 72`, „Deploy pasivijo per 10 s — baitai lyginti su HEAD `c1bc6ef1`“); `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `stale`, `stale_unknown`, `stale_unmeasured`, `live_missing`, `live_gone`, `missing_in_repo`, `aux_stale`, `aux_absent`, `aux_gone`, `shell_stale`, `shell_gone`, `shell_unreachable` — visi `[]`; `path_differs` false, `shell_count` 19, garsas **2 094/2 094** (`sampled: false`, `missing`/`empty`/`unreachable` `[]`), garso vardai **2 094/2 094** (`mismatch` 0, `text_mismatch` 0, `unverified` 0, `absent` 0), `live_version` = `repo_version` = `deploy_live_version` = `c1bc6ef1`, `deploy_pending` false, `unpushed_commits` 0, `bytes_checked` true, `verdict.label` = „sutampa“. `vanished_ids` 1 — `03-sakinio-tvarka` → `03-sakinio-zodziai`, `last_rev a2ad497`, `resolved: true`, `alias_ok: true`.
│ +- **Augimas 62 → 72 patvirtintas failui atskirai, ne vienu skaičiumi:** kiekvieno iš 72 `index.json` įrašo `file` **ir** `grade-01/index.json`, `grade-01/path.json` gyvas sha256 = repo sha256 — **74/74**, `mismatch` 0 (`urllib` + `hashlib`). Nė vienas iš dešimties šiandien praleistų modulių (per #476–#479) svetainėje nepasenęs. Niekas nešalinta, joks ID nepernumeruotas, senas pervadinimo raktas tebegyvas — vaiko `localStorage` žymos nepraranda adresato.
│ +- **Kortelė = modulio puslapis, 72/72:** kiekvieno modulio `id`, `title`, `subtitle`, `minutes`, `sim` (kortelėje `sim` eilutė ↔ modulyje `sim.component`), `grade` ir `strand` palyginti tarp `index.json` ir failo — **0 nesutapimų**. Tai pasiūlymo #16892 stebimas defektas (kortelė skelbia vieną pavadinimą, puslapis kitą); šiandien jo platformoje nėra, tad taisyti nereikėjo.
│ +- **3 realios gyvos patikros (HTTP kodai, ne atmintis):** `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` → **200**; `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → **200**; `content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json` → **200**; **neigiama kontrolė** `content/lt/grade-01/matematika/99-nera.json` → **404** (tad 200 aukščiau kažką reiškia). Papildomai `content/lt/grade-01/index.json` ir `path.json` → **200**.
│ +- **Garsas (`scripts/check_audio.py`, ne `check_published` vidinis):** „Garsas pilnas: **1 047 tekstų** (iš jų 6 — tiesioginės `api.speak` eilutės simuliacijų kode), **2 094 įrašų**, visi iš Piper balso, naudojama 2 094 iš 2 094 mp3“. Tekstų skaičius 883 → 1 047 augo kartu su dešimčia naujų modulių; tai ne manifestas, o turinio tekstų ↔ garso failų atitikimas, kurio `check_published` nematuoja.
│ +- **Seka (`path.json`):** `sequence` 72 įrašai, aibė lygi `index.json` 72 moduliams, dublikatų 0, `not_in_path` `[]`. Tvarka sąmoningai **nesutampa** su `index.json` eilės tvarka (69 pozicijos) — tai pedagoginis maršrutas, o ne regresija; nauji moduliai pridėti į pabaigą (`07-elektronika`, `37-energijos-reikia-visiems`, `39-bendri-gyvu-organizmu-pozymiai`, `40-as-ir-mano-seima`), esama tvarka nepajudyta, todėl „Tęsk nuo čia“ vaikui nešokinėja.
│ +- **Vartai po patikros:** `validate_content.py --grade 1 --strict` → 0 klaidų / 0 įspėjimų, rc 0; `check_registry.py --grade 1` → „kryptys 9 · index 72 · failai 72 · užduotys 316 (optional 72) · sim 72 · path 72 · našlaičiai 0 / PROBLEMŲ: 0“, SIMS raktai kode 102; `check_docs_facts.py` → 0/0 (README, `grades.json`, `grades/01/index.md`, `grades/README.md` skelbia 72 / 9 — sutampa su failais).
│ +- **Nepadaryta ir pasakyta (LL-36):** naršyklės matavimo (360 px, 200 %) šiame paleidime nėra — `playwright` aplinkoje neįdiegtas (tas pats kaip #464). Publikavimo sprendimas nuo to nepriklauso, bet teiginio „veikia telefone“ šiandien nepakartoju.
│ +- **Eilėje liekantis darbas (ne šio vaidmens sprendimas):** `agents/proposals/2026-11-20-publikavimo-agentas-ci-registry.json` (`#411`) tebėra `status: new`, nors `.github/workflows/validate.yml:33` jau paleidžia `check_registry.py`. Tai LL-21 kartojimasis — statusus uždaro bėgiklis, ne šis vaidmuo; užfiksuota, kad kitas paleidimas nepradėtų nuo nulio.
│ +- **Sprendimas: sutampa.** Jokio atsukimo, jokio taisymo nereikėjo: 72/72 abiejose pusėse, 74/74 baitais, garsas ir vardai pilni, kortelės sutampa, gyva versija = `HEAD`, 0 neišstumtų commit'ų. Neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `.github/workflows/**`; joks modulio ID nepernumeruotas, nieko nešalinta, jokio `git push` iš agento.
│
│  ## 2026-11-23 (08:35) — Metodininkas #468: M-15 „Jungiklis lieka, mygtukas grįžta“ (programos pozicija D:elektronika)
│
│ research/wiki/changelog.md
│ @@ -9,7 +9,7 @@
│  - **Kortelė = modulio puslapis, 72/72:** kiekvieno modulio `id`, `title`, `subtitle`, `minutes`, `sim` (kortelėje `sim` eilutė ↔ modulyje `sim.component`), `grade` ir `strand` palyginti tarp `index.json` ir failo — **0 nesutapimų**. Tai pasiūlymo #16892 stebimas defektas (kortelė skelbia vieną pavadinimą, puslapis kitą); šiandien jo platformoje nėra, tad taisyti nereikėjo.
│  - **3 realios gyvos patikros (HTTP kodai, ne atmintis):** `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` → **200**; `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → **200**; `content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json` → **200**; **neigiama kontrolė** `content/lt/grade-01/matematika/99-nera.json` → **404** (tad 200 aukščiau kažką reiškia). Papildomai `content/lt/grade-01/index.json` ir `path.json` → **200**.
│  - **Garsas (`scripts/check_audio.py`, ne `check_published` vidinis):** „Garsas pilnas: **1 047 tekstų** (iš jų 6 — tiesioginės `api.speak` eilutės simuliacijų kode), **2 094 įrašų**, visi iš Piper balso, naudojama 2 094 iš 2 094 mp3“. Tekstų skaičius 883 → 1 047 augo kartu su dešimčia naujų modulių; tai ne manifestas, o turinio tekstų ↔ garso failų atitikimas, kurio `check_published` nematuoja.
│ -- **Seka (`path.json`):** `sequence` 72 įrašai, aibė lygi `index.json` 72 moduliams, dublikatų 0, `not_in_path` `[]`. Tvarka sąmoningai **nesutampa** su `index.json` eilės tvarka (69 pozicijos) — tai pedagoginis maršrutas, o ne regresija; nauji moduliai pridėti į pabaigą (`07-elektronika`, `37-energijos-reikia-visiems`, `39-bendri-gyvu-organizmu-pozymiai`, `40-as-ir-mano-seima`), esama tvarka nepajudyta, todėl „Tęsk nuo čia“ vaikui nešokinėja.
│ +- **Seka (`path.json`) — esama tvarka nepajudyta, tai išmatuota, ne palinkėta:** `sequence` 72 įrašai, aibė lygi `index.json` 72 moduliams, dublikatų 0, `not_in_path` `[]`. Palyginus su #464 būsena (`git show 7f346d9:content/lt/grade-01/path.json`, 62 įrašai): visi 62 seni ID tebėra, jų **santykinė tvarka nepakitusi** (`True`), o 10 naujų įterpti temos kaimyno kaimynystėje — `13-pasakojimo-vidurys` ir `12-zinute-skaitytojui` iškart po `11-teksto-supratimas` (poz. 12–13), `38-traumu-prevencija` po `25-traumu-prevencija` (56), `36-zmoniu-ivairove` po `34-bendruomenes` (59), `35-gamtos-istekliai-tarsa-tausojimas` (65), o `33-trukstamas-demuo`, `40-as-ir-mano-seima`, `37-energijos-reikia-visiems`, `07-elektronika`, `39-bendri-gyvu-organizmu-pozymiai` — pabaigoje (68–72). Nė vienas senas modulis neperstumtas kito atžvilgiu, tad vaiko „Tęsk nuo čia“ nešokinėja per jau nueitus žingsnius; `index.json` eilės tvarka ir `path.json` maršrutas skiriasi sąmoningai (tai pedagoginis maršrutas, ne regresija).
│  - **Vartai po patikros:** `validate_content.py --grade 1 --strict` → 0 klaidų / 0 įspėjimų, rc 0; `check_registry.py --grade 1` → „kryptys 9 · index 72 · failai 72 · užduotys 316 (optional 72) · sim 72 · path 72 · našlaičiai 0 / PROBLEMŲ: 0“, SIMS raktai kode 102; `check_docs_facts.py` → 0/0 (README, `grades.json`, `grades/01/index.md`, `grades/README.md` skelbia 72 / 9 — sutampa su failais).
│  - **Nepadaryta ir pasakyta (LL-36):** naršyklės matavimo (360 px, 200 %) šiame paleidime nėra — `playwright` aplinkoje neįdiegtas (tas pats kaip #464). Publikavimo sprendimas nuo to nepriklauso, bet teiginio „veikia telefone“ šiandien nepakartoju.
│  - **Eilėje liekantis darbas (ne šio vaidmens sprendimas):** `agents/proposals/2026-11-20-publikavimo-agentas-ci-registry.json` (`#411`) tebėra `status: new`, nors `.github/workflows/validate.yml:33` jau paleidžia `check_registry.py`. Tai LL-21 kartojimasis — statusus uždaro bėgiklis, ne šis vaidmuo; užfiksuota, kad kitas paleidimas nepradėtų nuo nulio.
│ agents/proposals/2026-11-23-publikavimo-agentas-path-tvarka.json
│ @@ -0,0 +1,19 @@
│ +{
│ +  "role": "publikavimo-agentas",
│ +  "run_id": 480,
│ +  "created": "2026-11-23T11:58:00+02:00",
│ +  "type": "struktura",
│ +  "title": "Naujas modulis įterpiamas į maršruto vidurį, o check_published nemato, ar senų ID tvarka nepajudėta",
│ +  "body": "Šiandien per keturis kūrėjo paleidimus į 1 klasę atėjo 10 modulių, ir 4 iš jų buvo įterpti ne į pabaigą, o į maršruto vidurį: 13-pasakojimo-vidurys ir 12-zinute-skaitytojui iškart po 11-teksto-supratimas (12–13 poz.), 38-traumu-prevencija po 25-traumu-prevencija (56), 36-zmoniu-ivairove po 34-bendruomenes (59). Tai teisingas pedagoginis sprendimas, bet jis tyliai perstumia kiekvieną po jo einantį žingsnį, o vaiko „Tęsk nuo čia“ taškas nustatomas pagal poziciją sekoje. check_published.py šiandien tikrina aibę (not_in_path, path_differs) — ar visi ID yra, — bet ne santykinę tvarką, todėl maršruto perstatymas, priešingas AGENTS.md taisyklei „esama tvarka nesikeistų“, praeitų vartus žalias. Šiandien tvarka tikrai nepajudyta (išmatuota `git show 7f346d9:content/lt/grade-01/path.json` → visi 62 seni ID, santykinė tvarka `True`), bet tai patvirtino rankinis skriptas, o ne įrankis, kuriuo remiasi publikavimo sprendimas. Siūloma: check_published pridėti patikrą, kuri lygina `path.json` su paskutine paskelbta versija (ar su `origin/main`) ir į `--json` išveda `path_reordered: [id, ...]` bei `path_inserted_midsequence: [id, ...]`; perstatymas — raudonas, įterpimas viduryje — geltonas su sąrašu, kad žmogus matytų, kam pasikeitė „kitas žingsnis“. Tai uždaro LL-19 šeimos defektą publikavimo pusėje: grupės viduje tvarka keičiasi ne dėl turinio, o dėl leidimo tvarkos.",
│ +  "target": "scripts/check_published.py",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "content/lt/grade-01/path.json — 72 įrašai, 10 naujų: poz. 12, 13, 56, 59, 65, 68–72 (2026-11-23)",
│ +    "git show 7f346d9:content/lt/grade-01/path.json — 62 įrašai, visi yra naujame, santykinė tvarka nepakitusi",
│ +    "scripts/check_published.py --json — laukai not_in_path, path_differs, stale; santykinės tvarkos lauko nėra",
│ +    "docs/SVIETIMAS-1-GAIRES.md T3.6 — perėjimas tarp temų niekada nepraranda konteksto",
│ +    "AGENTS.md — „Naują modulį pradėk nuo index.json įrašo…“ ir publikavimo vaidmens taisyklė „esama tvarka nesikeistų“",
│ +    "research/wiki/changelog.md — 2026-11-23 (11:56) Publikavimo patikra #480, seka išmatuota rankiniu skriptu"
│ +  ]
│ +}
│ research/wiki/changelog.md
│ @@ -2,7 +2,7 @@
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│
│ -## 2026-11-23 (11:56) — Publikavimo patikra #480: repo 72 / paskelbta 72 prie `c1bc6ef1`, visi 72 modulių failai + `index.json` + `path.json` gyvai baitais lygūs, garsas 2 094/2 094 ir 1 047 teksto, kortelės sutampa su moduliais 72/72; palaikyta
│ +## 2026-11-23 (11:56) — Publikavimo patikra #480: repo 72 / paskelbta 72 prie `c1bc6ef1`, visi 72 modulių failai + `index.json` + `path.json` gyvai baitais lygūs, garsas 2 094/2 094 įrašų ir 1 047 tekstai be spragų, kortelės sutampa su moduliais 72/72; palaikyta
│
│  - **Būsena (`scripts/check_published.py`, numatytasis ir `--json`, rc 0):** „Repozitorija: 72 moduliai / Paskelbta: 72 moduliai“ (`grade-01: repo 72, gyvai 72`, „Deploy pasivijo per 10 s — baitai lyginti su HEAD `c1bc6ef1`“); `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `stale`, `stale_unknown`, `stale_unmeasured`, `live_missing`, `live_gone`, `missing_in_repo`, `aux_stale`, `aux_absent`, `aux_gone`, `shell_stale`, `shell_gone`, `shell_unreachable` — visi `[]`; `path_differs` false, `shell_count` 19, garsas **2 094/2 094** (`sampled: false`, `missing`/`empty`/`unreachable` `[]`), garso vardai **2 094/2 094** (`mismatch` 0, `text_mismatch` 0, `unverified` 0, `absent` 0), `live_version` = `repo_version` = `deploy_live_version` = `c1bc6ef1`, `deploy_pending` false, `unpushed_commits` 0, `bytes_checked` true, `verdict.label` = „sutampa“. `vanished_ids` 1 — `03-sakinio-tvarka` → `03-sakinio-zodziai`, `last_rev a2ad497`, `resolved: true`, `alias_ok: true`.
│  - **Augimas 62 → 72 patvirtintas failui atskirai, ne vienu skaičiumi:** kiekvieno iš 72 `index.json` įrašo `file` **ir** `grade-01/index.json`, `grade-01/path.json` gyvas sha256 = repo sha256 — **74/74**, `mismatch` 0 (`urllib` + `hashlib`). Nė vienas iš dešimties šiandien praleistų modulių (per #476–#479) svetainėje nepasenęs. Niekas nešalinta, joks ID nepernumeruotas, senas pervadinimo raktas tebegyvas — vaiko `localStorage` žymos nepraranda adresato.
ATASKAITA — publikavimo-agentas, paleidimas #480

check_published.py (numatytasis ir --json, rc 0):
  Repozitorija: 72 moduliai · Paskelbta: 72 · grade-01: repo 72, gyvai 72
  missing_on_live, hidden_locally, not_in_path, orphan_files, stale, stale_unknown,
  stale_unmeasured, live_missing, live_gone, missing_in_repo, aux_stale, aux_absent,
  aux_gone, shell_stale, shell_gone, shell_unreachable — visi []
  path_differs false · shell_count 19 · unpushed_commits 0 · deploy_pending false
  bytes_checked true · live_version = repo_version = deploy_live_version = c1bc6ef1
  garsas 2094/2094 (sampled false) · garso vardai 2094/2094 (mismatch 0, text_mismatch 0)
  vanished_ids 1: 03-sakinio-tvarka → 03-sakinio-zodziai, resolved true, alias_ok true
  verdict {"ok": true, "label": "sutampa"}

Neišstumta: 0 commit'ų.

3 gyvi adresai (curl, HTTP kodai):
  200 content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json
  200 content/lt/grade-01/matematika/04-skaiciu-tiese.json
  200 content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
  404 content/lt/grade-01/matematika/99-nera.json   (neigiama kontrolė)
  200 index.json · 200 path.json

Papildomi matavimai, kurių check_published nedaro po vieną:
  - 72 modulių failų + index.json + path.json gyvas sha256 = repo sha256: 74/74, mismatch 0.
    Augimas 62 → 72 patvirtintas failui atskirai, ne vienu skaičiumi.
  - Kortelė ↔ modulio failas (id, title, subtitle, minutes, sim, grade, strand): 72/72, 0 nesutapimų.
  - path.json 72 įrašai; palyginus su #464 (git show 7f346d9): visi 62 seni ID tebėra ir jų
    santykinė tvarka nepakitusi (True). 10 naujų įterpti temos kaimyno kaimynystėje
    (12–13, 56, 59, 65, 68–72), niekas neperstumtas kito atžvilgiu.
  - check_audio.py: 1047 tekstų, 2094 įrašų, visi iš Piper, naudojama 2094/2094 mp3.
  - Vartai: validate_content --grade 1 --strict 0/0 rc 0 · check_registry 9/72/72/316(72)/72/72,
    našlaičiai 0 · check_docs_facts 0/0.

Sprendimas: sutampa. Taisyti nieko nereikėjo; nieko nešalinau, ID nepernumeravau, content/assets/docs/
AGENTS.md/workflows neliesti, git push nedariau.

Failai, pakeisti šiame paleidime:
  research/wiki/changelog.md — įrašas „2026-11-23 (11:56) — Publikavimo patikra #480…“
  agents/proposals/2026-11-23-publikavimo-agentas-path-tvarka.json — pasiūlymas (normal,
  target scripts/check_published.py): įrankis neturi lauko, kuris pasakytų, ar path.json
  santykinė senų ID tvarka nepajudėta. Šiandien tai teko matuoti rankiniu skriptu; siūloma
  path_reordered / path_inserted_midsequence laukai, nes naujas modulis, įterptas į maršruto
  vidurį, tyliai perstumia vaiko „Tęsk nuo čia“ žingsnį (LL-19 šeima, gairės T3.6).

Nepadaryta ir pasakyta: naršyklės matavimo (360 px / 200 %) nėra — playwright aplinkoje neįdiegtas.
Naujos pamokos nepridėjau: rastas neatitikimas atitinka jau įrašytą LL-21 (pasiūlymas #411 tebėra
status new, nors validate.yml:33 jau paleidžia check_registry.py; statusus uždaro bėgiklis).

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-faf16823a2f9901ea162e67b925091d1ceef8dc6af1e40de1640eae488c869a3
```
