# publikavimo-agentas — 2026-11-25T1932

- paleidimas: #541 (manual)
- trukmė: 2248s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_published.py
│ @@ -1914,6 +1914,19 @@
│      return out
│
│
│ +def _rev_range(spec: str) -> tuple[list[str], bool]:
│ +    """(commit'ai pagal `git rev-list <spec>`, ar patikra įvyko)."""
│ +    try:
│ +        proc = subprocess.run(
│ +            ["git", "rev-list", spec], cwd=ROOT, capture_output=True, text=True, timeout=30
│ +        )
│ +    except Exception:  # noqa: BLE001
│ +        return [], False
│ +    if proc.returncode != 0:
│ +        return [], False
│ +    return [c for c in proc.stdout.split() if c], True
│ +
│ +
│  def unpushed() -> tuple[list[str], bool]:
│      """(commit'ai, kurių nėra `origin/main`, ar patikra įvyko).
│
│ @@ -1925,15 +1938,29 @@
│      Antrasis reikšmės narys eina į `verdict()`, kad „nepatikrinta“ būtų
│      pasakyta žodžiais, o ne tylėtų.
│      """
│ -    try:
│ -        proc = subprocess.run(
│ -            ["git", "rev-list", "origin/main..HEAD"], cwd=ROOT, capture_output=True, text=True, timeout=30
│ -        )
│ -    except Exception:  # noqa: BLE001
│ -        return [], False
│ -    if proc.returncode != 0:
│ -        return [], False
│ -    return [c for c in proc.stdout.split() if c], True
│ +    return _rev_range("origin/main..HEAD")
│ +
│ +
│ +def behind() -> tuple[list[str], bool]:
│ +    """(commit'ai, kurie yra `origin/main`, o šioje kopijoje jų nėra, ar įvyko).
│ +
│ +    `unpushed()` matuoja **vieną** skirtumo kryptį: ko neturi `origin/main`.
│ +    Priešingos krypties niekas neskaitė, o skirtumas lygiai toks pat svarbus
│ +    (LL-198). Jei darbinė kopija yra už `origin/main` (paleidimas vyksta iš
│ +    senesnio commit'o arba iš šakos, kuri dar nesujungta), gyva svetainė
│ +    pastatyta iš **naujesnio** commit'o, tad `live_version != repo_version`
│ +    visai ne dėl to, kad deploy nepasivijo. Įrankis vis dėlto laukdavo
│ +    `DEPLOY_WAIT` sekundžių ir pranešdavo „deploy nepasivijo per N s“, o
│ +    šiam vaidmeniui tai reiškia „paleisk publikavimą“ — veiksmas, kuris
│ +    kopiją nuo `origin/main` tik dar labiau atitolintų.
│ +
│ +    Matuota 2026-11-25 (#541) laikiname repo: HEAD atsuktas dviem commit'ais
│ +    (`HEAD~2`), gyva svetainė pastatyta iš `origin/main`; `unpushed` 0,
│ +    `deploy_pending` True, laukta 2 s (tikrasis `DEPLOY_WAIT` — 150 s),
│ +    `verdict` — „svetainė pastatyta iš X, o repo HEAD Y — deploy nepasivijo“
│ +    + „1 pasenęs modulis“. Tikroji priežastis: `HEAD..origin/main` = 2.
│ +    """
│ +    return _rev_range("HEAD..origin/main")
│
│
│  def last_commit() -> str:
│ scripts/check_published.py
│ @@ -1996,6 +1996,13 @@
│      # Neišsiųsti commit'ai skaičiuojami **prieš** laukimą: jei HEAD dar
│      # neišstumtas, svetainė jo net negauna, tad laukti būtų be prasmės.
│      unpushed_list, unpushed_ok = unpushed()
│ +    # Priešingos krypties skirtumas (LL-198). `unpushed()` atsako „ko neturi
│ +    # `origin/main`“, o čia — „ką turi `origin/main`, o ši kopija ne“. Abi
│ +    # kryptys reiškia, kad `live_version != repo_version` gali būti teisingas
│ +    # atsakymas, o ne deploy vėlavimas. Be šio matavimo `await_deploy()`
│ +    # laukdavo `DEPLOY_WAIT` sekundžių dėl commit'o, kurio laukti neįmanoma
│ +    # (jis jau senesnis), ir pranešdavo priežastį, kurios niekas neperskaitė.
│ +    behind_list, behind_ok = behind()
│      # Deploy'aus langas: svetainė gali būti dar pastatyta iš ankstesnio
│      # commit'o (bėgikas išstumia backlog'ą prieš šį darbą). Tuomet baitų
│      # skirtumai yra laiko, ne turinio defektas — laukiama, kol `?v=` pasivys
│ scripts/check_published.py
│ @@ -2010,7 +2010,8 @@
│      live_v = live_version() if live_bytes_ok else ""
│      repo_v = repo_version()
│      live_v, deploy_waited, deploy_pending = await_deploy(
│ -        live_v, repo_v, skip=(not live_bytes_ok) or bool(unpushed_list))
│ +        live_v, repo_v,
│ +        skip=(not live_bytes_ok) or bool(unpushed_list) or bool(behind_list))
│      per_grade = [check_grade(g, compare_bytes) for g in grades]
│
│      def merge(key: str) -> list:
│ scripts/check_published.py
│ @@ -2149,6 +2149,12 @@
│              g["path_order_note"] for g in per_grade if g.get("path_order_note")),
│          "unpushed_commits": len(unpushed_list),
│          "unpushed_checked": unpushed_ok,
│ +        # Priešingos krypties skirtumas (LL-198): kiek commit'ų yra
│ +        # `origin/main`, o šioje kopijoje ne. Atskiras raktas nuo
│ +        # `unpushed_commits`, nes priežastis ir veiksmas kiti: ten reikia
│ +        # publikavimo, čia — sujungti / persikelti, o ne publikuoti.
│ +        "behind_commits": len(behind_list),
│ +        "behind_checked": behind_ok,
│          "retried_requests": RETRIES["count"],
│          # Kiek 404 pasirodė buvę krašto neigiama kopija (#50319). Atskiras
│          # raktas, nes tai nėra pakartojimas po laikinos klaidos: pirmas
│ scripts/check_published.py
│ @@ -2248,7 +2248,19 @@
│      # iš ankstesnio commit'o, „N pasenęs modulis“ yra to pasekmė, o taisymas
│      # ne toks (reikia palaukti / paleisti publikavimą, ne taisyti turinį).
│      # #415: tas pats commit'as davė ir 35, ir 0 — skirtumas buvo tik laikas.
│ -    if data.get("deploy_pending"):
│ +    #
│ +    # LL-198: čia pati priežastis negali būti „deploy nepasivijo“, kai
│ +    # gyva versija **naujesnė** už HEAD. Tada laukta nebuvo (laukiama tik
│ +    # tada, kai `live != repo` ir nėra neišstumtų commit'ų), o baitų skirtumas
│ +    # reiškia, kad lyginama su senesne kopija. Taisymas kitas — sujungti su
│ +    # `origin/main`, o ne publikuoti: publikavimas atitolintų dar labiau.
│ +    if data.get("behind_commits"):
│ +        reasons.append(
│ +            f"{data['behind_commits']} commit'ų yra origin/main, o šioje kopijoje ne "
│ +            f"(HEAD {data.get('repo_version') or '?'}, gyva "
│ +            f"{data.get('deploy_live_version') or data.get('live_version') or '?'}) — "
│ +            f"baitai lyginti su senesne kopija")
│ +    elif data.get("deploy_pending"):
│          live = data.get("deploy_live_version") or 

… PRALEISTA 7799 SIMBOLIŲ IŠ 25799 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00541/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

naujesnė už HEAD**, tad palaukti neįmanoma iš principo. Vaidmens taisyklei „deploy nepasivijo“ reiškia „paleisk publikavimą“ — veiksmą, kuris atsilikusią kopiją nuo `origin/main` tik dar labiau atitolintų ir galėtų sukelti `conflict` (bėgiklio `push_backlog()` pirmiausia daro `git merge origin/main`).
│ +- **Priežastis:** repo ir svetainės skirtumas buvo matuojamas **viena kryptimi**. `unpushed()` klausia „ko neturi `origin/main`“ (`origin/main..HEAD`), o priešingos krypties (`HEAD..origin/main`) neskaitė niekas. Abu atvejai duoda tą patį požymį — `live_version != repo_version` — todėl ženklas apie skirtumą buvo, o priežastis apie jį buvo spėjama iš konteksto („nes bėgikas stumia prieš darbą, tad deploy dar nepastatytas“). Tai ta pati šeima kaip LL-21/LL-37 (teiginys apie priežastį, kurios niekas neperskaitė), tik skirtumo ašis: matuota `A \ B`, o pranešta apie `B \ A`. LL-197 yra tos pačios šeimos trečias atvejis (matuota be žymės, pranešta apie turinį).
│ +- **Taisyklė:** kiekvienas „repo vs gyva svetainė“ skirtumas matuojamas **abiem kryptimis** ir abi turi savo raktą (`unpushed_commits` / `behind_commits`) bei savo priežastį `verdict()`e. Kai gyva versija naujesnė už HEAD: (1) nelaukiama — `await_deploy()` praleidžiamas, nes laukiamas commit'as jau senesnis; (2) `deploy_pending` nepranešamas kaip priežastis (jis lieka faktu `report()`e, bet į `verdict()` neina per `elif`); (3) pranešama žodžiais „DARBINĖ KOPIJA ATSILIĖKĖ“ su veiksmu „sujunk su `origin/main`“, o ne „publikuok“. Baitų skirtumas šiuo atveju yra lyginimo su senesne kopija pasekmė, todėl lieka matomas (`stale`), bet jo priežastis įvardijama pirma.
│ +- **Patikra:** `scripts/probe_publish_sets.py` W — laikinas repo: commit'as išstumiamas į `origin/main`, gyva svetainė perpublikuojama su kitu `?v=deadbeef`, tada `git reset --hard HEAD~1`. Laukiama: `behind_commits` 1 (`behind_checked` True), `deploy_waited` 0, `verdict` neša „origin/main … su senesne kopija“ ir **neturi** „deploy nepasivijo“, o CLI spausdina „ATSILIĖKĖ“, ne „NEPUBLIKAVIMAS NEPASIVIJO“. W2 (neigiama kontrolė) — ta pati būsena be `reset`: `behind_commits` 0 ir „deploy nepasivijo“ **lieka**, tad pataisa tikro vėlavimo neužmaskuoja. Prieš pataisą tas pats zondas rodė `waited 150`, `deploy_pending` True ir priežastį „deploy nepasivijo“; po pataisos 45/45, rc 0.
│ +
│ research/wiki/changelog.md
│ @@ -1,6 +1,15 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-25 (19:5x) — Publikavimo patikra #541: repo 82 / paskelbta 82 prie `e1541604`, garsas 2 426/2 426; „deploy nepasivijo“ nebepranešamas, kai kopija atsilieka nuo `origin/main` (LL-198), sutampa
│ +
│ +- **Būsena (`python3 scripts/check_published.py`, rc 0, po pataisymo):** „Repozitorija: 82 moduliai / Klasės: grade-01 (statusas „live“ iš content/lt/grades.json) / Paskelbta: 82 moduliai“ (`grade-01`: repo 82, gyvai 82); `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `missing_in_repo`, `live_missing`, `live_gone`, `stale*`, `aux_*`, `shell_*` — visi `[]`; garsas **2 426/2 426**, vardai 2 426/2 426, dydžiai 2 426/2 426; svetainės kodas 19 failų; `live_version` = `repo_version` = `e1541604`, `deploy_pending` false, `unpushed_commits` 0, `behind_commits` 0; pervedamas ID vienas (`03-sakinio-tvarka` → `03-sakinio-zodziai`, `alias_ok: true`); `verdict` = „sutampa“. Laukta 0 s — pataisa nepridėjo nė vienos užklausos, kai kopija `origin/main` nevejasi.
│ +- **3 gyvi adresai (`curl`, kodas ir baitai):** `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → **200** (4 972 B); `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` → **200** (5 459 B); `content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json` → **200** (8 685 B). **Neigiama kontrolė:** `content/lt/grade-01/matematika/99-nera.json` → **404** (563 B). Papildomai savarankiškas perskaičiavimas be įrankio: **82/82** modulių JSON gyvai **baitas į baitą** lygūs repo (`urllib`, 8 gijos, 0 neatitikimų); `index.json`, `path.json`, `grades.json`, `manifest.json`, `404.html`, `speech.js`, `main.css` — baitai sutampa.
│ +- **Defektas ir taisymas (LL-198).** #537/#539 taisė krašto kopijas (404 iš neigiamos, 200 su senu kūnu). Liko trečia tos pačios šeimos atmaina, bet ne krašte — **git kryptyje**. `unpushed()` matavo tik `origin/main..HEAD` („ko neturi `origin/main`“), o priešingos krypties `HEAD..origin/main` neskaitė niekas. Kai darbinė kopija atsilieka (paleidimas iš senesnio commit'o arba iš nesujungtos šakos), gyva svetainė pastatyta iš **naujesnio** commit'o, tad `live_version != repo_version` — ir įrankis laukdavo `DEPLOY_WAIT` (150 s tikrame bėgime), o `verdict` skelbdavo „deploy nepasivijo“. Vaidmens taisyklei tai reiškia „paleisk publikavimą“, t. y. veiksmą, kuris kopiją nuo `origin/main` atitolintų dar labiau (bėgiklio `push_backlog()` pradeda `git merge origin/main` → `conflict`). Dabar `scripts/check_published.py` turi `behind()` / `_rev_range()`: `report()` matuoja abi kryptis, `await_deploy()` praleidžiamas kai `behind` netuščias, `verdict()` turi **savo** priežastį („N commit'ų yra origin/main, o šioje kopijoje ne … baitai lyginti su senesne kopija“), o CLI spausdina „DARBINĖ KOPIJA ATSILIĖKĖ … sujunk su origin/main“, o ne „PUBLIKAVIMAS NEPASIVIJO“.
│ +- **Įrodymas repo (`scripts/probe_publish_sets.py` → 45/45, rc 0, be interneto).** W: laikinas repo — commit'as išstumiamas į `origin/main`, gyva svetainė perpublikuojama su kitu `?v=deadbeef`, tada `git reset --hard HEAD~1` → `behind_commits` 1, `deploy_waited` **0** (prieš pataisą 150), `verdict` neša „origin/main“, o ne „deploy nepasivijo“, CLI spausdina „ATSILIĖKĖ“. W2 (neigiama kontrolė): ta pati būsena be `reset` → `behind_commits` 0 ir „deploy nepasivijo“ **lieka**, tad pataisa tikro vėlavimo neužmaskuoja. U/V (krašto kopijos) ir visi A–T išliko žali — pataisa nepakeitė nė vieno ankstesnio sprendimo.
│ +- **Vartai po pakeitimo:** `validate_content.py --grade 1 --strict` 0 klaidų / 0 įspėjimų; `check_registry.py --grade 1` „kryptys 9 · index 82 · failai 82 · užduotys 359 (optional 82) · sim 82 · path 82 · našlaičiai 0 / PROBLEMŲ: 0“; `check_language.py --grade 1 --strict` 0/0 (55 pastabos); `check_refs.py` 27 nuorodos rc 0; `check_docs_facts.py` sutampa; `check_lessons.py` 197 įrašai; `check_audio.py` 1 213 tekstų / 2 426 įrašų; `check_published.py --path-order` rc 0; `--scope` rc 0; `probe_check_published.py` 15/15; `probe_publish_sets.py` 45/45.
│ +- **Sprendimas: sutampa.** `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, modulių ID, `path.json` seka ir vaiko `localStorage` raktai neliesti; push nedarytas (bėgiklio darbas). Failai repo: `scripts/check_published.py`, `scripts/probe_publish_sets.py`, `research/wiki/guidelines/pamokos.md` (LL-198), `research/wiki/changelog.md`.
│
│  ## 2026-11-25 (16:39) — Publikavimo patikra #540: repo 82 / paskelbta 82 prie `7a4787e7`, garsas 2 426/2 426, sim komponentai gyvame kode 82/82; palaikyta, nieko neatšaukta
│
│ research/wiki/changelog.md
│ @@ -2,7 +2,7 @@
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│
│ -## 2026-11-25 (19:5x) — Publikavimo patikra #541: repo 82 / paskelbta 82 prie `e1541604`, garsas 2 426/2 426; „deploy nepasivijo“ nebepranešamas, kai kopija atsilieka nuo `origin/main` (LL-198), sutampa
│ +## 2026-11-25 (20:07) — Publikavimo patikra #541: repo 82 / paskelbta 82 prie `e1541604`, garsas 2 426/2 426; „deploy nepasivijo“ nebepranešamas, kai kopija atsilieka nuo `origin/main` (LL-198), sutampa
│
│  - **Būsena (`python3 scripts/check_published.py`, rc 0, po pataisymo):** „Repozitorija: 82 moduliai / Klasės: grade-01 (statusas „live“ iš content/lt/grades.json) / Paskelbta: 82 moduliai“ (`grade-01`: repo 82, gyvai 82); `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `missing_in_repo`, `live_missing`, `live_gone`, `stale*`, `aux_*`, `shell_*` — visi `[]`; garsas **2 426/2 426**, vardai 2 426/2 426, dydžiai 2 426/2 426; svetainės kodas 19 failų; `live_version` = `repo_version` = `e1541604`, `deploy_pending` false, `unpushed_commits` 0, `behind_commits` 0; pervedamas ID vienas (`03-sakinio-tvarka` → `03-sakinio-zodziai`, `alias_ok: true`); `verdict` = „sutampa“. Laukta 0 s — pataisa nepridėjo nė vienos užklausos, kai kopija `origin/main` nevejasi.
│  - **3 gyvi adresai (`curl`, kodas ir baitai):** `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → **200** (4 972 B); `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` → **200** (5 459 B); `content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json` → **200** (8 685 B). **Neigiama kontrolė:** `content/lt/grade-01/matematika/99-nera.json` → **404** (563 B). Papildomai savarankiškas perskaičiavimas be įrankio: **82/82** modulių JSON gyvai **baitas į baitą** lygūs repo (`urllib`, 8 gijos, 0 neatitikimų); `index.json`, `path.json`, `grades.json`, `manifest.json`, `404.html`, `speech.js`, `main.css` — baitai sutampa.
Done. Report:

`check_published.py` (rc 0, po pataisymo)
- Repo 82 / paskelbta 82 / neišstumta 0 · `live_version` = `repo_version` = `e1541604`
- `behind_commits` 0 · `deploy_pending` false · laukta 0 s
- `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `missing_in_repo`, `live_missing`, `live_gone`, `stale*`, `aux_*`, `shell_*` — visi `[]`
- garsas 2 426/2 426 (vardai 2 426/2 426, dydžiai 2 426/2 426), kodas 19 failų
- pervedamas ID vienas (`03-sakinio-tvarka` → `03-sakinio-zodziai`, alias_ok)

3 gyvi adresai (curl, kodas ir baitai)
- `matematika/04-skaiciu-tiese.json` → 200 (4 972 B)
- `lietuviu-kalba/03-sakinio-zodziai.json` → 200 (5 459 B)
- `pasaulio-pazinimas/10-gyvunu-grupes.json` → 200 (8 685 B)
- neigiama kontrolė `matematika/99-nera.json` → 404 (563 B)

Papildomai, be įrankio: savarankiškas `urllib` perskaičiavimas — visi 82/82 modulių JSON gyvai baitas į baitą lygūs repo (0 neatitikimų); `index.json`, `path.json`, `grades.json`, `manifest.json`, `404.html`, `speech.js`, `main.css` — baitai sutampa.

Ką pakeičiau (defektas mano paties įrankyje, vaikui nematomas, bet siuntė taisyti ne to)
#537/#539 taisė krašto kopijas. Liko trečia tos pačios šeimos atmaina, tik ne krašte — git kryptyje: `unpushed()` matavo tik `origin/main..HEAD`, o `HEAD..origin/main` neskaitė niekas. Kai kopija atsilieka (paleidimas iš senesnio commit'o arba iš nesujungtos šakos), svetainė pastatyta iš naujesnio commit'o, tad įrankis laukdavo 150 s ir skelbė „deploy nepasivijo“ — o vaidmens taisyklei tai reiškia „paleisk publikavimą“, veiksmą, kuris atotrūkį nuo `origin/main` tik padidintų (bėgiklis pradeda `git merge origin/main` → `conflict`).
- `scripts/check_published.py` — `behind()` / `_rev_range()`; `report()` matuoja abi kryptis; `await_deploy()` praleidžiamas, kai `behind` netuščias; `verdict()`, CLI ir JSON turi savo raktą bei priežastį („DARBINĖ KOPIJA ATSILIĖKĖ … sujunk su origin/main“).
- `scripts/probe_publish_sets.py` — W (atsilikusi kopija → `behind_commits` 1, laukta 0 s, jokio „deploy nepasivijo“) ir W2 (neigiama kontrolė: be atotrūkio tikras vėlavimas lieka matomas). **45/45, rc 0**; A–V nepakito.
- `research/wiki/guidelines/pamokos.md` — LL-198 (naujas tipas: skirtumas matuotas viena kryptimi, praneštas kaip priešingas).
- `research/wiki/changelog.md` — #541 įrašas.

Vartai po pakeitimo
`validate_content.py` 0/0 · `check_registry.py` index 82 / užduotys 359 / sim 82 / path 82 / PROBLEMŲ 0 · `check_language.py` 0/0 · `check_audio.py` 1 213 tekstų / 2 426 įrašų · `check_lessons.py` 198 · `check_refs.py` 27/27 · `check_docs_facts.py` sutampa · `--path-order` rc 0 · `--scope` rc 0 · `probe_check_published.py` 15/15 · `probe_publish_sets.py` 45/45 · `py_compile` OK.

Sprendimas: **sutampa** (nereikėjo nieko atšaukti; pataisyta tik savo įrankio diagnostika). Neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, modulių ID, `path.json` seka, vaiko `localStorage` raktai; push nedarytas (bėgiklio darbas).

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-591ec8c62c823fb15061550718044642b1fd8d9e7c531dc850eb17681587022c
```
