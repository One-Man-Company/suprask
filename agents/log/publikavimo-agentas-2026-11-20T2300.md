# publikavimo-agentas — 2026-11-20T2300

- paleidimas: #415 (manual)
- trukmė: 427s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_published.py
│ @@ -240,6 +240,19 @@
│  # `?v=<commit>` prirašo `.github/workflows/pages.yml`. Tai ne turinio skirtumas,
│  # todėl prieš lyginimą žymė nuimama, o versija perskaitoma atskirai.
│  VERSION_PARAM = re.compile(r"\?v=[0-9a-f]{6,40}")
│ +
│ +# Deploy'aus langas. GitHub Pages pastato svetainę per 1–2 min. po push, o
│ +# bėgikas išstumia backlog'ą **prieš** šio vaidmens darbą. Todėl pirmas
│ +# `check_published.py` bėgimas matuoja repo HEAD prieš dar nestatytą svetainę.
│ +# 2026-11-20 (paleidimas #415) tas pats commit'as davė du skirtingus atsakymus:
│ +# 35 „pasenę“ moduliai + 1 pagrindinis failas, o po minutės — „sutampa“, be
│ +# jokio pakeitimo. Tai ne turinio defektas, o teiginys apie priežastį
│ +# („nepaskelbta“), kurios neperskaitė nė vienas matavimas (LL-21): gyva
│ +# versija tiesiog buvo ankstesnė už HEAD. Dabar prieš baitų ciklą palaukiama,
│ +# kol `?v=` pasivys HEAD, o jei nepasiveja — pranešama kaip „deploy
│ +# nepasivijo“, o ne kaip N pasenusių failų, kuriuos „reikia taisyti“.
│ +DEPLOY_WAIT = int(os.environ.get("SUPRASK_DEPLOY_WAIT", "150"))
│ +DEPLOY_POLL = max(1, int(os.environ.get("SUPRASK_DEPLOY_POLL", "10")))
│
│  # Priimti modulių pervadinimai. Failas yra įrankio duomenys, ne turinio schema:
│  # jis nekeičia modulio formato, tik pasako, kad dingęs ID turi įpėdinį ir kad
│ scripts/check_published.py
│ @@ -690,8 +690,38 @@
│      return match.group(0)[3:] if match else ""
│
│
│ +def await_deploy(live: str, repo: str, skip: bool = False) -> tuple[str, int, bool]:
│ +    """Laukia, kol gyva svetainė bus pastatyta iš `repo` (HEAD).
│ +
│ +    Grąžina `(gyva versija po laukimo, laukta sekundžių, ar deploy nepasivijo)`.
│ +
│ +    Kodėl laukti, o ne tik pranešti: baitų lyginimas HEAD atžvilgiu per
│ +    deploy'aus langą kiekvieną neseniai pakeistą failą vadina „pasenusiu
│ +    turiniu“. Tas pats atsitiko 2026-11-20 (#415): pirmas bėgimas — 35
│ +    pasenę moduliai, antras (be jokio pakeitimo) — „sutampa“. Vaikui skirtas
│ +    sprendimas buvo „taisyk turinį“, nors reikėjo tik palaukti.
│ +
│ +    `skip` — yra neišsiųstų commit'ų: HEAD svetainėje negali pasirodyti, kol
│ +    jie nepaskelbti, tad laukimas būtų tuščias (ir atrodytų kaip sulėtėjęs
│ +    įrankis). Tuomet grąžinama išmatuota versija be laukimo.
│ +
│ +    Jei gyvos versijos perskaityti nepavyko (tuščia), laukiama taip pat
│ +    negalima — nežinomas dydis nėra „nepasivijo“ (LL-37): grąžinama tuščia
│ +    versija ir `False`, o spręsti paliekama `verdict()`.
│ +    """
│ +    if skip or not live or not repo or live == repo or DEPLOY_WAIT <= 0:
│ +        return live, 0, bool(live and repo and live != repo)
│ +    started = time.monotonic()
│ +    current = live
│ +    while time.monotonic() - started < DEPLOY_WAIT:
│ +        time.sleep(min(DEPLOY_POLL, max(1, int(DEPLOY_WAIT - (time.monotonic() - started)))))
│ +        current = live_version() or current
│ +        if current == repo:
│ +            return current, int(time.monotonic() - started), False
│ +    return current, int(time.monotonic() - started), current != repo
│ +
│ +
│  def site_reachable() -> bool:
│ -    """Ar gyva svetainė iš viso atsako (HEAD į `index.html`).
│
│      Vienas pigus matavimas prieš visus kitus. Be jo kiekviena gyva patikra
│      atskirai aiškinosi tą patį gedimą ir kiekviena jo rezultatą pranešdavo
│ scripts/check_published.py
│ @@ -722,6 +722,7 @@
│
│
│  def site_reachable() -> bool:
│ +    """Ar gyva svetainė iš viso atsako (HEAD į `index.html`).
│
│      Vienas pigus matavimas prieš visus kitus. Be jo kiekviena gyva patikra
│      atskirai aiškinosi tą patį gedimą ir kiekviena jo rezultatą pranešdavo
│ scripts/check_published.py
│ @@ -1002,6 +1002,17 @@
│      # Matuojama kartą, o pranešime pasakoma, kas NETIKRINTA (#382).
│      live_reachable = site_reachable()
│      live_bytes_ok = compare_bytes and live_reachable
│ +    # Neišsiųsti commit'ai skaičiuojami **prieš** laukimą: jei HEAD dar
│ +    # neišstumtas, svetainė jo net negauna, tad laukti būtų be prasmės.
│ +    unpushed_list, unpushed_ok = unpushed()
│ +    # Deploy'aus langas: svetainė gali būti dar pastatyta iš ankstesnio
│ +    # commit'o (bėgikas išstumia backlog'ą prieš šį darbą). Tuomet baitų
│ +    # skirtumai yra laiko, ne turinio defektas — laukiama, kol `?v=` pasivys
│ +    # HEAD. `--no-bytes` režime baitai nelyginami, tad ir laukti nereikia.
│ +    live_v = live_version() if live_bytes_ok else ""
│ +    repo_v = repo_version()
│ +    live_v, deploy_waited, deploy_pending = await_deploy(
│ +        live_v, repo_v, skip=(not live_bytes_ok) or bool(unpushed_list))
│      per_grade = [check_grade(g, compare_bytes) for g in grades]
│
│      def merge(key: str) -> list:
│ scripts/check_published.py
│ @@ -1073,9 +1073,8 @@
│              "note": "garso patikra neįvyko — svetainė nepasiekiama",
│          }
│
│ -    # Neišsiųsti commit'ai. `unpushed()` grąžina ir tai, ar patikra įvyko:
│ +    # Neišsiųsti commit'ai jau perskaityti prieš laukimą (žr. `report()`):
│      # git klaida anksčiau atrodė kaip „0 neišsiųstų“ (žr. funkcijos docstring).
│ -    unpushed_list, unpushed_ok = unpushed()
│
│      out = {
│          "grades": per_grade,
│ scripts/check_published.py
│ @@ -1105,6 +1105,13 @@
│          "shell_count": shell["shell_count"],
│          "live_version": shell["live_version"],
│          "repo_version": shell["repo_version"],
│ +        # Deploy'aus langas. `deploy_pending` reiškia: gyva svetainė pastatyta
│ +        # iš kito commit'o nei repo HEAD, tad baitų skirtumai gali būti laiko,
│ +        # ne turinio. Be šio lauko #415 tas pats commit'as davė „35 pasenę
│ +        # moduliai“ ir „sutampa“ — priklausomai nuo to, kada bėgimas įvyko.
│ +        "deploy_pending": deploy_pending,
│ +        "deploy_live_version": live_v,
│ +        "deploy_waited": deploy_waited,
│          "path_differs": [g["grade"] for g in per_grade if g.get("path_differs")],
│          "unpushed_commits": len(unpushed_list),
│          "unpushed_checked": unpushed_ok,
│ scripts/check_published.py
│ @@ -1167,6 +1167,16 @@
│      if (data.get("published_measured") is False and not data.get("live_error")
│              and not data.get("live_gone")):
│          reasons.append("paskelbtų modulių skaičius neišmatuotas")
│ +    # Deploy'aus langas — prieš visas baitų priežastis: kai svetainė pastatyta
│ +    # iš ankstesnio commit'o, „N pasenęs modulis“ yra to pasekmė, o taisymas
│ +    # ne toks (reikia palaukti / paleisti publikavimą, ne taisyti turinį).
│ +    # #415: tas pats commit'as davė ir 35, ir 0 — skirtumas buvo tik laikas.
│ +    if data.get("deploy_pending"):
│ +        live = data.get("deploy_live_version") or data.get("live_version") or "?"
│ +        repo = data.get("repo_version") or "?"
│ +        reasons.append(
│ +            f"svetainė pastatyta iš {live}, o repo HEAD {repo} — deploy nepasivijo "
│ +            f"per {data.get('deploy_waited', 0)} s")
│      if data.get("missing_on_live"):
│          reasons.append(f"{len(data['missing_on_live'])} neskelbta")
│      if data.get("hidden_locally"):
│ scripts/check_published.py
│ @@ -1309,6 +1309,19 @@
│          print(f"SVETAINĖJE NĖRA KLASĖS FAILO — svetainė atsakė 404 "
│                f"({len(data['live_gone'])}): {', '.join(data['live_gone'])}")
│          print("  Publikuok klasę — kiti adresai svetainėje atsakė, tad tai ne ryšio gedimas.")
│ +    if data.get("deploy_pending"):
│ +        # Ne „pasenęs turinys“: skirtumas yra laiko, ne failo. Vaikui skirtas
│ +        # sprendimas kitas — laukti arba paleisti publikavimą (#415).
│ +        print(f"PUBLIKAVIMAS NEPASIVIJO — svetainė pastatyta iš "
│ +              f"{data.get('deploy_live_version') or '?'}, repo HEAD "
│ +              f"{data.get('repo_version') or '?'}, laukta {data.get('deploy_waited', 0)} s.")
│ +        print("  Žemiau esantys baitų skirtumai yra to pasekmė, o ne atskiri turinio "
│ +              "defektai: neliesk failų, paleisk publikavimą (arba pakartok patikrą).")
│ +    elif data.get("deploy_waited"):
│ +        # Tylus laukimas būtų tas pats kaip tyli riba (LL-37): pasakoma, ką
│ +        # įrankis veikė ir kad baitai lyginti jau su HEAD.
│ +        print(f"Deploy pasivijo per {data['deploy_waited']} s — baitai lyginti su HEAD "
│ +              f"({data.get('deploy_live_version') or '?'}).")
│      if data["missing_on_live"]:
│          print(f"NESKELBTA ({len(data['missing_on_live'])}): {', '.join(data['missing_on_live'])}")
│      if data["hidden_locally"]:
Nepavyko pabaigti testavimo — baigėsi žingsniai. Toliau — ką tiksliai padariau ir kas liko nebaigta.

BŪSENA (išmatuota, ne spėta)

`python3 scripts/check_published.py` (pilnas režimas, commit d8ac8632):
- Repo 51 moduliai, paskelbta 51 (grade-01: repo 51, gyvai 51)
- missing_on_live 0 · hidden_locally 0 · not_in_path 0 · orphan_files 0 · stale 0 · aux_stale 0 · shell_stale 0 · path_differs false · unpushed_commits 0 (unpushed_checked true)
- Garsas 1486/1486 (visi, ne mėginys)
- live_version = repo_version = d8ac8632, bytes_checked true
- vanished_ids 1: 03-sakinio-tvarka → 03-sakinio-zodziai, resolved true, alias_ok true
- verdict.label = "sutampa"

3 gyvi adresai + neigiama kontrolė:
- 200 content/lt/grade-01/matematika/04-skaiciu-tiese.json (3629 B = repo)
- 200 content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json (5319 B = repo)
- 200 content/lt/grade-01/pasaulio-pazinimas/08-metu-laikai.json (4389 B = repo)
- 404 content/lt/grade-01/matematika/99-nera.json (neigiama kontrolė, 563 B = 404.html)
- Gyvas index.html neša ?v=d8ac8632 = repo HEAD.

Rastas ir IŠTAISYTAS realus defektas (failas pakeistas: scripts/check_published.py)

Šiame paleidime pirmas `check_published.py` bėgimas tame pačiame commit'e davė „PASENĘS TURINYS (35)" + „PASENĘS PAGRINDINIS FAILAS: index.json repo 15011 B / gyvai 15002 B", o antras bėgimas be jokio pakeitimo — „sutampa". Priežastis: bėgikas išstumia backlog'ą prieš mano darbą, o GitHub Pages stato 1–2 min.; įrankis lygino repo HEAD su dar nestatyta svetaine ir kiekvieną neseniai pakeistą failą vadino „pasenusiu turiniu", t. y. siūlė taisyti turinį, kai reikėjo palaukti (LL-21/LL-37 šeima).

Pakeitimai scripts/check_published.py:
- naujos konstantos DEPLOY_WAIT (150 s) ir DEPLOY_POLL (10 s), perrašomos SUPRASK_DEPLOY_WAIT / SUPRASK_DEPLOY_POLL;
- nauja `await_deploy()` — prieš baitų ciklą laukia, kol gyvas `?v=` pasivys HEAD; nelaukia, jei yra neišsiųstų commit'ų arba jei versija neišmatuota (nežinomas dydis nėra „nepasivijo");
- `report()` skaičiuoja `unpushed()` prieš laukimą ir grąžina `deploy_pending`, `deploy_live_version`, `deploy_waited`;
- `verdict()` įrašo priežastį „svetainė pastatyta iš X, o repo HEAD Y — deploy nepasivijo per N s" PRIEŠ „N pasenęs modulis", tad sprendimas nebėra „taisyk 35 failus";
- pranešime atskira eilutė „PUBLIKAVIMAS NEPASIVIJO…" (ar „Deploy pasivijo per N s"), kad tylaus laukimo nebūtų.

Patikra: `python3 -m py_compile` (per patch lint) — syntax OK. Funkcinis zondas NEBAIGTAS: lokalus veidrodis (127.0.0.1:8899) paleistas, bet `http.server` per simlinkintą `assets/` atsakė 404 (`/assets/js/app.js`, `/content/.../index.json`), tad palyginimas su veidrodžiu neduoda prasmingo rezultato. Reikia veidrodį daryti su `cp -r assets` (be simlinko) ir tada paleisti: seną versiją (`git show HEAD:scripts/check_published.py`) ir naują su SUPRASK_LIVE_ROOT=http://127.0.0.1:8899/ SUPRASK_DEPLOY_WAIT=3 — tikėtina: sena → „pasenęs modulis", nauja → „deploy nepasivijo"; o scena, kai po ~3 s `?v=` pasikeičia į HEAD, turi duoti „sutampa" su `deploy_waited > 0`.

KAS DAR NEPADARYTA
- Research/wiki/changelog.md įrašas už #415 neįrašytas (failo nepakeičiau) — be jo šis paleidimas neturi savo turinio rezultato, nors scripts/check_published.py jau pakeistas.
- Funkcinis zondas su veidrodžiu (aukščiau) nepaleistas.
- `agents/work/` ataskaita nerašyta; `agents/state.json` blokų nerašiau.
- Eilutės „ĮGYVENDINTA: #…" nėra: nė vienas eilės pasiūlymas (#30349, #30200, #29003, #24447, #24307, #24171, #23765, #22168, #16892, #16338) neįgyvendintas — jie visi skirti kitų vaidmenų failams (validate_content.py, calba.js, docs, check_language.py, kurejas_queue.py).

## klaidos

```
session_id: local-cae2124b3f484ae21e03e3d061f8421b21a44f7c086d054c92b27554e42bca89
```
