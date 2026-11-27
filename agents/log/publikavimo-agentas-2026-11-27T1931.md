# publikavimo-agentas — 2026-11-27T1931

- paleidimas: #588 (manual)
- trukmė: 4442s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_published.py
│ @@ -1061,6 +1061,109 @@
│          return {}, (f"git istorijos nepavyko perskaityti: nė viena iš "
│                      f"{len(revs)} revizijų neperskaityta"), False
│      return seen, "", True
│ +
│ +
│ +def historical_grades() -> tuple[dict[int, str], str, bool]:
│ +    """Klasės, kada nors buvusios `status: live`, su **naujausia** revizija.
│ +
│ +    Kodėl klasės lygmenyje, o ne tik modulio (žr. `vanished()`). `vanished()`
│ +    saugo garantiją „vaiko žyma nelieka be modulio“, bet ji galioja tik toms
│ +    klasėms, kurios **šiandien** yra `live`: `check_grade()` kviečiamas tik
│ +    joms (`grade_scope()`). Jei klasė išjungiama ir **jos katalogas
│ +    ištrinamas**, nei `validate_content.py` (eina per `live` klases), nei
│ +    `check_registry.py`, nei `--scope` (`undeclared_grades` reikalauja
│ +    egzistuojančio katalogo su moduliais), nei `--path-order` (to paties
│ +    `live` rėmo) jos nebemato — o visi jos modulių ID dingsta iš repo
│ +    negrįžtamai. Matuota 2026-11-27 (#588) laikiname repo: 2 klasės `live`,
│ +    paskui `grade-01` katalogas pašalintas ir `grades.json` pakeistas —
│ +    `report()` grąžino `verdict ok True`, „sutampa“, rc 0,
│ +    `history_unchecked []`.
│ +
│ +    Trečias narys `checked` — ta pati taisyklė kaip `historical_ids()`:
│ +    neperskaityta istorija nėra „dingusių nėra“ (LL-37 / LL-221).
│ +    """
│ +    path = "content/lt/grades.json"
│ +    try:
│ +        probe = subprocess.run(
│ +            ["git", "rev-parse", "--is-shallow-repository"],
│ +            cwd=ROOT, capture_output=True, text=True, timeout=20,
│ +        )
│ +        if probe.returncode != 0:
│ +            return {}, "git istorijos nepavyko perskaityti (`git rev-parse`)", False
│ +        if probe.stdout.strip() == "true":
│ +            return {}, "git istorija sekli — klasių istorijos patikra neįmanoma", False
│ +        log = subprocess.run(
│ +            ["git", "log", "--format=%h", "--", path],
│ +            cwd=ROOT, capture_output=True, text=True, timeout=120,
│ +        )
│ +        if log.returncode != 0:
│ +            return {}, "git istorijos nepavyko perskaityti (`git log`)", False
│ +        revs = [r for r in log.stdout.split() if r]
│ +    except Exception as exc:  # noqa: BLE001
│ +        return {}, f"git istorijos nepavyko perskaityti ({type(exc).__name__})", False
│ +    if not revs:
│ +        return {}, ("git log negrąžino nė vienos `grades.json` revizijos — "
│ +                    "klasių istorijos patikra neatlikta"), False
│ +    if len(revs) > HISTORY_LIMIT:
│ +        return {}, (f"`grades.json` istorija didesnė už {HISTORY_LIMIT} revizijų — "
│ +                    "klasių istorijos patikra neatlikta"), False
│ +
│ +    blobs, err = _batch_blobs([f"{rev}:{path}" for rev in revs])
│ +    if err:
│ +        return {}, f"git istorijos nepavyko perskaityti: {err}", False
│ +    seen: dict[int, str] = {}
│ +    unreadable = 0
│ +    for rev, blob in zip(revs, blobs):
│ +        if blob is None:
│ +            continue
│ +        try:
│ +            doc = json.loads(blob.decode("utf-8"))
│ +        except Exception:  # noqa: BLE001
│ +            unreadable += 1
│ +            continue
│ +        for entry in doc.get("grades") or []:
│ +            if not isinstance(entry, dict) or entry.get("status") != "live":
│ +                continue
│ +            try:
│ +                num = int(entry["grade"])
│ +            except (KeyError, TypeError, ValueError):
│ +                continue
│ +            seen.setdefault(num, rev)
│ +    if revs and not seen and unreadable == len(revs):
│ +        return {}, (f"`grades.json` istorijos nepavyko perskaityti: nė viena iš "
│ +                    f"{len(revs)} revizijų neperskaityta"), False
│ +    return seen, "", True
│ +
│ +
│ +def lost_grades(current_live: list[int]) -> dict:
│ … omitted 31 diff line(s) across 1 additional file(s)/section(s)
│ scripts/check_published.py
│ @@ -2573,6 +2573,16 @@
│      # nepasiekiama, nes kalbama apie repo failus. Būtent ji paverčia HEAD
│      # patikrą „yra toks failas“ į „yra tie baitai“ (#426).
│      audio_name = audio_name_digest()
│ +
│ +    # Klasių lygmuo (žr. `historical_grades()`). Kiekvienas modulio ID yra
│ +    # saugomas `vanished()` — bet tik toms klasėms, kurios šiandien `live`.
│ +    # Klasė, išjungta IR ištrinta, iškrenta iš visų vartų rėmų, o su ja —
│ +    # visi jos modulių ID ir vaiko žymos pagal juos.
│ +    lost = lost_grades(grades)
│ +    out["lost_grades"] = lost["items"]
│ +    out["grades_history_checked"] = lost["checked"]
│ +    if lost["note"]:
│ +        out["grades_history_note"] = lost["note"]
│
│      # Neišsiųsti commit'ai jau perskaityti prieš laukimą (žr. `report()`):
│      # git klaida anksčiau atrodė kaip „0 neišsiųstų“ (žr. funkcijos docstring).
│ scripts/check_published.py
│ @@ -2577,12 +2577,9 @@
│      # Klasių lygmuo (žr. `historical_grades()`). Kiekvienas modulio ID yra
│      # saugomas `vanished()` — bet tik toms klasėms, kurios šiandien `live`.
│      # Klasė, išjungta IR ištrinta, iškrenta iš visų vartų rėmų, o su ja —
│ -    # visi jos modulių ID ir vaiko žymos pagal juos.
│ +    # visi jos modulių ID ir vaiko žymos pagal juos. Matuojama prieš
│ +    # `out = {...}`, nes šis skaitomas į jį.
│      lost = lost_grades(grades)
│ -    out["lost_grades"] = lost["items"]
│ -    out["grades_history_checked"] = lost["checked"]
│ -    if lost["note"]:
│ -        out["grades_history_note"] = lost["note"]
│
│      # Neišsiųsti commit'ai jau perskaityti prieš laukimą (žr. `report()`):
│      # git klaida anksčiau atrodė kaip „0 neišsiųstų“ (žr. funkcijos docstring).
│ scripts/check_published.py
│ @@ -2610,6 +2610,11 @@
│          "not_in_path": merge("not_in_path"),
│          "orphan_files": merge("orphan_files"),
│          "vanished_ids": merge("vanished_ids"),
│ +        # Klasių lygmuo: buvusi `live`, o katalogo repo nebėra. `checked`
│ +        # atskirai, nes neperskaityta istorija nė

… PRALEISTA 27228 SIMBOLIŲ IŠ 45228 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00588/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

ngusių nėra“ (LL-221 aukštesniame lygmenyje). (6) CLI eilutė „KLASĖS KATALOGAS DINGO IŠ REPO“ su paskutine `live` revizija ir modulių skaičiumi.
│ +- **Ką pakeičiau (`scripts/check_published.py`, tik įrankio kodas).** (1) `historical_grades()` — `grades.json` `status: live` istorija, skaitoma tuo pačiu `git cat-file --batch` keliu kaip `historical_ids()` (išmatuota: 0,019 s prie 70 `grades.json` revizijų); `HISTORY_LIMIT` galioja ir jai, viršijus → `checked False`. (2) `lost_grades()` — klasė, kuri buvo `live`, o `content/lt/grade-NN/index.json` repo nebėra; klasė su išlikusiu katalogu **nepatenka** (tai išjungimas — matuoja `undeclared_grades`; dublikato nekuriama, LL-129). (3) `known_lost_grades.json` — priimtų klasių pašalinimų failas to paties pobūdžio kaip `known_renames.json`; įrašas **be `reason` negalioja**. Be jo vartai būtų amžinai raudoni, o tokie vartai yra tas pats kaip jokių. (4) `verdict()` įvardija klasę ir modulių skaičių, o priimtas pašalinimas rc nekeičia (lieka matomas žodžiais). (5) Neįvykusi istorijos patikra → `grades_history_checked: false` → rc 1 su priežastimi „klasių istorijos patikra neįvyko“ — ne „dingusių nėra“ (LL-221 aukštesniame lygmenyje). (6) CLI eilutė „KLASĖS KATALOGAS DINGO IŠ REPO“ su paskutine `live` revizija ir modulių skaičiumi.
│  - **Naujas vartas (`scripts/probe_lost_grades.py`, be tinklo, 1,1 s, įsijungia į CI `probe_*.py` ciklą be workflow pakeitimo).** Tikras git repo su `origin/main` ir gyvos svetainės veidrodis per `http.server`; 12 lūkesčių: A1 sveika būsena → „sutampa“; A2 katalogas ištrintas → `lost_grades = [grade-01]`, `verdict()` raudonas, CLI rc 1; **A3 neigiama kontrolė** — ta pati būsena be `lost_grades()` yra žalia (`verdict ok True`), tad defektas realus, o ne įsivaizduojamas; B1/B2 išjungta klasė su katalogu — ne dingimas, bet išlieka matoma per `undeclared_grades`; C1 sąmoningas pašalinimas su `reason` → `resolved: true`, rc žalias; C2 įrašas be `reason` neatleidžia; D1 ne git katalogas → `grades_history_checked False` ir rc 1; E1 `--grade 2` vis tiek įvardija dingusią `grade-01` (tikrinimo rėmas nėra teiginys apie kitas klases). Senajame kode zondas raudonas (sąmoningai: „0: įrankis turi `LOST_GRADES`…“, rc 1), pataisytame — 12/12, rc 0.
│  - **Vartai po pakeitimo.** `validate_content.py --grade 1 --strict` 0/0 · `check_registry.py` index 85 · failai 85 · užduotys 374 · sim 85 · path 85 · našlaičiai 0 · `check_language --grade 1 --strict` 0/0 · `check_refs` 26/26 · `check_ui` 0/0 · `check_docs_facts` sutampa · `check_audio` 1 275 tekstų · 2 550/2 550 · `check_art` ✔ · `check_lessons` **228** · `check_agents` rc 0 · `curriculum_backlog --check` ✔ · `check_published --scope` ir `--path-order` rc 0 · visi **25** `probe_*.py` rc 0 (`probe_publish_sets` 63/63, `probe_check_published` 15/15, `probe_published_history` 11/11, `probe_path_order` 20/20, naujas `probe_lost_grades` 12/12).
│  - **Sprendimas: ištaisyta.** Turinys, `index.json`, `path.json`, simuliacijos, `docs/*`, `AGENTS.md` ir `.github/*` neliesti; joks modulio ID nepernumeruotas, nieko nešalinta, `localStorage` raktai ir eilė nepajudėti; `known_renames.json` nepakeistas. Failai: `scripts/check_published.py`, `scripts/probe_lost_grades.py` (naujas), `scripts/known_lost_grades.json` (naujas, „grades“ tuščias — šiandien nėra ko priimti), `scripts/probe_publish_sets.py` (vienas patchuojamų globalų įrašas), `research/wiki/guidelines/pamokos.md` (LL-228), `research/wiki/changelog.md`. Push nedarytas (bėgiklio darbas).
│ research/wiki/changelog.md
│ @@ -4,7 +4,7 @@
│
│  ## 2026-11-27 — Publikavimo patikra #588: repo **85 / paskelbta 85** prie `1f403686`, 3 adresai 200/200/200 ir neigiama kontrolė 404; rastas ir ištaisytas klasių lygmens aklumas — ištrynus klasės katalogą įrankis sakydavo „sutampa“ (LL-228, naujas vartas `probe_lost_grades.py`)
│
│ -- **Būsena (`python3 scripts/check_published.py`, 132 s).** „Repozitorija: 85 moduliai / Klasės: grade-01 (statusas „live“ iš content/lt/grades.json) / Paskelbta: 85 moduliai“; `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `missing_in_repo`, `live_missing`, `stale`, `stale_unknown`, `aux_*` — visi `[]`; neišstumta 0, atsilikta 0; `verdict` — **`sutampa`**, rc 0. Garsas 2 550/2 550 pasiekiami, dydžiai 2 550/2 550 = `Content-Length`, vardo maišas 2 550/2 550 = baitai IR tekstas. Rėmas 2 659 publikuojami failai — visi matuoti; svetainės kodas 19 failų baitais lygus; gylio nuorodos 2 tikrintos; versija `1f403686` abiejose pusėse. `path.json`: 85 žingsnių, senų ID santykinė tvarka nepajudėta (lyginta su `scripts/known_path_order.json`, 2026-11-23), 11 naujų įterpti į vidurį — leidžiama ir pasakyta. Priimtas pervadinimas vienas: `grade-01 03-sakinio-tvarka → 03-sakinio-zodziai`, `index.json` turi `renamed_from`, `progress.js` migruoja — vaiko žyma perkeliama.
│ +- **Būsena (`python3 scripts/check_published.py`, 139 s).** „Repozitorija: 85 moduliai / Klasės: grade-01 (statusas „live“ iš content/lt/grades.json) / Paskelbta: 85 moduliai“; `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `missing_in_repo`, `live_missing`, `stale`, `stale_unknown`, `aux_*` — visi `[]`; neišstumta 0, atsilikta 0; `verdict` — **`sutampa`**, rc 0. Garsas 2 550/2 550 pasiekiami, dydžiai 2 550/2 550 = `Content-Length`, vardo maišas 2 550/2 550 = baitai IR tekstas. Rėmas 2 659 publikuojami failai — visi matuoti; svetainės kodas 19 failų baitais lygus; gylio nuorodos 2 tikrintos; versija `1f403686` abiejose pusėse. `path.json`: 85 žingsnių, senų ID santykinė tvarka nepajudėta (lyginta su `scripts/known_path_order.json`, 2026-11-23), 11 naujų įterpti į vidurį — leidžiama ir pasakyta. Priimtas pervadinimas vienas: `grade-01 03-sakinio-tvarka → 03-sakinio-zodziai`, `index.json` turi `renamed_from`, `progress.js` migruoja — vaiko žyma perkeliama.
│  - **3+ gyvi adresai (`curl`).** `content/lt/grade-01/index.json` → **200** (26 183 B); `content/lt/grade-01/lietuviu-kalba/16-pokalbio-eile.json` → **200** (7 071 B); `content/lt/grade-01/pasaulio-pazinimas/41-augalo-dalys.json` → **200** (8 282 B); `assets/js/sims/calba.js` → **200** (179 718 B). **Neigiama kontrolė:** `content/lt/grade-01/matematika/99-nera.json` → **404** (4 290 B — atsarginis `404.html`, ne tuščias atsakymas). Gyvas `index.json` perskaitytas ir palygintas su repo: 85 ID, ta pati tvarka, ta pati `path.json` seka — ne vien baitai, bet ir struktūra.
│  - **Defektas, kurio nė vienas vartas nematė (LL-228).** Įrankio vienintelė garantija yra „vaiko `localStorage` žyma nelieka be modulio“, bet ji buvo matuojama **tik toms klasėms, kurios šiandien `live`**: `check_grade()` kviečiamas per `grade_scope()`. Matuota laikiname git repo (2 klasės `live`): paskui `grade-01` katalogas pašalintas ir `grades.json` pakeistas — `report()` grąžino `verdict ok True`, „sutampa“, rc 0, `history_unchecked []`. Dingsta ne vienas modulis, o **85** ir visos vaiko žymos pagal juos. Priežastis ta pati visuose vartuose: rėmas („kas `live`“) imamas iš **to paties failo**, kurį defektas keičia. `validate_content.py` eina per `live`, `check_registry.py` per egzistuojančius katalogus, `--scope` `undeclared_grades` reikalauja katalogo su moduliais, `--path-order` — to paties rėmo. Kiekvienas teisingas atskirai, o kartu aklas. Tai LL-37 šeima, bet pjūvis kitas: nukerpamas ne rezultatų sąrašas ir ne istorija, o pats **matavimo rėmas**.
│  - **Ką pakeičiau (`scripts/check_published.py`, tik įrankio kodas).** (1) `historical_grades()` — `grades.json` `status: live` istorija, skaitoma tuo pačiu `git cat-file --batch` keliu kaip `historical_ids()` (išmatuota: 0,019 s prie 70 `grades.json` revizijų); `HISTORY_LIMIT` galioja ir jai, viršijus → `checked False`. (2) `lost_grades()` — klasė, kuri buvo `live`, o `content/lt/grade-NN/index.json` repo nebėra; klasė su išlikusiu katalogu **nepatenka** (tai išjungimas — matuoja `undeclared_grades`; dublikato nekuriama, LL-129). (3) `known_lost_grades.json` — priimtų klasių pašalinimų failas to paties pobūdžio kaip `known_renames.json`; įrašas **be `reason` negalioja**. Be jo vartai būtų amžinai raudoni, o tokie vartai yra tas pats kaip jokių. (4) `verdict()` įvardija klasę ir modulių skaičių, o priimtas pašalinimas rc nekeičia (lieka matomas žodžiais). (5) Neįvykusi istorijos patikra → `grades_history_checked: false` → rc 1 su priežastimi „klasių istorijos patikra neįvyko“ — ne „dingusių nėra“ (LL-221 aukštesniame lygmenyje). (6) CLI eilutė „KLASĖS KATALOGAS DINGO IŠ REPO“ su paskutine `live` revizija ir modulių skaičiumi.
Viskas sutvarkyta ir patikrinta. Darbas baigtas.

**Būsena** (`python3 scripts/check_published.py`, 139 s): Repozitorija **85** / Paskelbta **85** / neišstumta **0** / atsilikta **0**, `verdict` = `sutampa`, rc 0. Garsas 2 550/2 550 pasiekiami, dydžiai 2 550/2 550 = Content-Length, vardo maišas 2 550/2 550 = baitai IR tekstas; svetainės kodas 19 failų baitais lygus, rėmas 2 659 publikuojami failai visi matuoti, versija `1f403686` abiejose pusėse. Gyvas `index.json` ir `path.json` perskaityti ir palyginti su repo — 85 ID, ta pati tvarka.

**3 gyvi adresai + neigiama kontrolė:** `content/lt/grade-01/index.json` → **200** (26 183 B) · `…/lietuviu-kalba/16-pokalbio-eile.json` → **200** (7 071 B) · `…/pasaulio-pazinimas/41-augalo-dalys.json` → **200** (8 282 B) · `assets/js/sims/calba.js` → **200** (179 718 B) · `…/matematika/99-nera.json` → **404** (4 290 B — atsarginis `404.html`, ne tuščias atsakymas).

**Sprendimas: ištaisyta.** Rastas klasių lygmens aklumas: įrankio garantija „vaiko žyma nelieka be modulio“ buvo matuojama tik klasėms, kurios **šiandien** `live`, tad klasę išjungus ir jos katalogą ištrynus visi 85 ID dingdavo, o `report()` sakydavo `sutampa`, rc 0 — matuota laikiname git repo, ne teorija. Tai ne vienas modulis, kurį gaudo `vanished()`, o 85 iš karto; rėmas („kas `live`“) buvo imamas iš to paties failo, kurį defektas keičia.

Ką pakeičiau (turinio, `index.json`, `path.json`, simuliacijų, CSS, `docs/`, `AGENTS.md` nelietęs, jokio ID nepernumeravęs, nieko nešalinęs):
- `scripts/check_published.py` — `historical_grades()` (`grades.json` `live` istorija per `git cat-file --batch`, 0,019 s), `lost_grades()`, `known_lost_grades.json` (įrašas be `reason` negalioja — kitaip vartai amžinai raudoni), `verdict()` įvardija klasę ir modulių skaičių, neįvykusi istorijos patikra → `grades_history_checked: false` → rc 1, CLI eilutė „KLASĖS KATALOGAS DINGO IŠ REPO“. Klasė su išlikusiu katalogu sąmoningai nepatenka (tai išjungimas — matuoja `undeclared_grades`, dublikato nėra). Lyginama su skelbiamu sąrašu, ne su `--grade` rinkiniu, todėl `--grade 2` vis tiek įvardija dingusią `grade-01`.
- `scripts/probe_lost_grades.py` — naujas vartas, be tinklo, 1,1 s, 12/12: A1 sveika → „sutampa“; A2 katalogas ištrintas → raudona ir įvardyta; **A3 neigiama kontrolė** — ta pati būsena be `lost_grades()` yra žalia, tad defektas realus; B1/B2 išjungimas ≠ dingimas; C1 priimtas pašalinimas → `resolved: true`, rc žalias; C2 įrašas be `reason` neatleidžia; D1 ne git → `checked False`, rc 1; E1 `--grade` rėmas. Senajame kode zondas raudonas (rc 1), pataisytame 12/12 rc 0.
- `scripts/known_lost_grades.json` (naujas, `grades` tuščias — šiandien nėra ko priimti), `scripts/probe_publish_sets.py` (vienas patchuojamų globalų įrašas, kad zondas neskaitytų tikro repo failo), `research/wiki/guidelines/pamokos.md` (**LL-228**), `research/wiki/changelog.md` (#588 įrašas).

Vartai: `validate_content --grade 1 --strict` 0/0 · `check_registry` 85/85/374/85/85, našlaičiai 0 · `check_language --strict` 0/0 · `check_refs` 26/26 · `check_ui` 0/0 · `check_docs_facts` sutampa · `check_audio` 1 275 tekstų / 2 550 · `check_art` ✔ · `check_lessons` 228 · `check_agents` rc 0 · `curriculum_backlog --check` ✔ · `--scope` ir `--path-order` rc 0 · visi 25 `probe_*.py` rc 0 (`probe_publish_sets` 63/63, `probe_published_history` 11/11, `probe_path_order` 20/20).

`agents/state.json` blokas `last_publish_check_588` įrašytas (failas `.gitignore`); push nedarytas — bėgiklio darbas.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-4ce124287da5477cebddb620b48a6ff66518f12d6aab98d2ed14ecdd533a3bf2
```
