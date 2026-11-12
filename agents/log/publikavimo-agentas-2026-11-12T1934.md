# publikavimo-agentas — 2026-11-12T1934

- paleidimas: #253 (manual)
- trukmė: 245s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/probe_history.py
│ @@ -0,0 +1,24 @@
│ +import json, subprocess, pathlib
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +rel = "content/lt/grade-01/index.json"
│ +commits = subprocess.run(["git","log","--format=%H","--",rel], cwd=ROOT, capture_output=True, text=True).stdout.split()
│ +print("commits touching index:", len(commits))
│ +ever = {}
│ +for c in commits:
│ +    blob = subprocess.run(["git","show",f"{c}:{rel}"], cwd=ROOT, capture_output=True, text=True)
│ +    if blob.returncode != 0:
│ +        continue
│ +    try:
│ +        d = json.loads(blob.stdout)
│ +    except json.JSONDecodeError:
│ +        continue
│ +    ids = [m["id"] for s in d.get("strands",[]) for m in s.get("modules",[])]
│ +    for i in ids:
│ +        ever.setdefault(i, c[:7])
│ +cur = json.loads((ROOT/rel).read_text(encoding="utf-8"))
│ +cur_ids = {m["id"] for s in cur.get("strands",[]) for m in s.get("modules",[])}
│ +live_ids = set(json.loads(__import__("urllib.request",fromlist=["x"]).urlopen("https://one-man-company.github.io/suprask/content/lt/grade-01/index.json").read().decode()).get and []) if False else None
│ +gone = {i:c for i,c in ever.items() if i not in cur_ids}
│ +print("ever ids:", len(ever), "current:", len(cur_ids), "gone:", len(gone))
│ +for i,c in sorted(gone.items()):
│ +    print("  gone:", i, "last seen", c)
│ profiles/deepseek41flash/cache/scratch/probe_shell.py
│ @@ -0,0 +1,20 @@
│ +import re, urllib.request, pathlib, hashlib
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +V = re.compile(r"\?v=[0-9a-f]{6,40}")
│ +def live(rel):
│ +    with urllib.request.urlopen(BASE + rel, timeout=30) as r:
│ +        return r.read()
│ +files = ["index.html"] + [str(p.relative_to(ROOT)) for p in sorted((ROOT/"assets"/"js").rglob("*.js"))] + \
│ +        [str(p.relative_to(ROOT)) for p in sorted((ROOT/"assets"/"css").rglob("*.css"))]
│ +for rel in files:
│ +    local = (ROOT/rel).read_text(encoding="utf-8")
│ +    try:
│ +        lv = live(rel).decode("utf-8")
│ +    except Exception as e:
│ +        print("ERR", rel, e); continue
│ +    a = V.sub("", local); b = V.sub("", lv)
│ +    tag = "OK " if a == b else "DIFF"
│ +    print(tag, rel, len(local), len(lv), "strip", len(a), len(b))
│ +m = re.search(r"\?v=([0-9a-f]{6,40})", live("index.html").decode())
│ +print("live version:", m.group(1) if m else None)
│ scripts/check_published.py
│ @@ -23,6 +23,19 @@
│  prieš modulį — `grades.json`, klasės `index.json`, `path.json` ir
│  `assets/audio/lt/manifest.json`. Anksčiau moduliai galėjo būti 200, o gyvas
│  manifestas pasenęs: naujo modulio garsas 404, o visi vartai žali (LL-78).
│ +
│ +2026-11-12 (paleidimas #253): lyginamas ir svetainės **kodas**, ne tik
│ +turinys — `index.html`, `assets/js/**/*.js`, `assets/css/*.css`. Anksčiau
│ +įrankis tikrino vien `content/lt/**` ir du pagalbinius failus, todėl
│ +nepaskelbtas simuliacijos pataisymas buvo nematomas: modulių baitai sutampa,
│ +o vaikas vykdo seną `assets/js/sims/*.js` (LL-83).
│ +
│ +Dėmesio: `?v=<commit>` — ne turinio skirtumas. `.github/workflows/pages.yml`
│ +prieš publikavimą prirašo commit'o trumpinį prie CSS/JS nuorodų, kad
│ +naršyklė nepaimtų iš GitHub Pages tarpinės atminties seno failo. Todėl
│ +svetainės failai lyginami **nuėmus `?v=`**, o pati versija perskaitoma ir
│ +palyginama su `git HEAD` — kitu atveju įrankis klaidingai skelbtų „pasenęs
│ +kodas“ po kiekvieno publikavimo.
│
│  Naudojimas:
│      python3 scripts/check_published.py               # žmogui
│ scripts/check_published.py
│ @@ -51,6 +51,7 @@
│  import json
│  import os
│  import pathlib
│ +import re
│  import subprocess
│  import sys
│  import time
│ scripts/check_published.py
│ @@ -72,6 +72,19 @@
│      ("content/lt/grades.json", CONTENT / "grades.json"),
│      ("assets/audio/lt/manifest.json", ROOT / "assets" / "audio" / "lt" / "manifest.json"),
│  ]
│ +
│ +# Svetainės kodas, kuris vykdomas naršyklėje. `content/` baitai sako, ką vaikas
│ +# turėtų matyti, bet ne ką jis iš tikrųjų vykdo: simuliacijos, maršrutizatorius
│ +# ir stilius gyvena `assets/`. Nepaskelbtas `assets/js/sims/*.js` pataisymas
│ +# anksčiau likdavo nematomas — visi modulių baitai sutapdavo (LL-83).
│ +SHELL_GLOBS = [
│ +    ("index.html", None),
│ +    ("assets/js", "*.js"),
│ +    ("assets/css", "*.css"),
│ +]
│ +# `?v=<commit>` prirašo `.github/workflows/pages.yml`. Tai ne turinio skirtumas,
│ +# todėl prieš lyginimą žymė nuimama, o versija perskaitoma atskirai.
│ +VERSION_PARAM = re.compile(r"\?v=[0-9a-f]{6,40}")
│
│
│
│ scripts/check_published.py
│ @@ -148,6 +148,88 @@
│  def same_bytes(rel: str) -> tuple[bool, int, int]:
│      """(ar gyvas failas baitais lygus repo failui, repo baitai, gyvi baitai)."""
│      return compare(CONTENT / rel, "content/lt/" + rel)
│ +
│ +
│ +def shell_files() -> list[str]:
│ +    """Svetainės kodo failai, kuriuos naršyklė įkelia (`index.html`, JS, CSS).
│ +
│ +    Sąrašas imamas iš katalogų, ne įrašomas ranka: nauja simuliacija
│ +    `assets/js/sims/` faile atsiranda be įrankio pakeitimo.
│ +    """
│ +    out: list[str] = []
│ +    for name, pattern in SHELL_GLOBS:
│ +        path = ROOT / name
│ +        if pattern is None:
│ +            if path.exists():
│ +                out.append(name)
│ +            continue
│ +        if path.is_dir():
│ +            out += [str(p.relative_to(ROOT)) for p in sorted(path.rglob(pattern))]
│ +    return out
│ +
│ +
│ +def strip_version(text: str) -> str:
│ +    """Nuima `?v=<commit>` — publikavimo žymą, ne turinio skirtumą."""
│ +    return VERSION_PARAM.sub("", text)
│ +
│ +
│ +def _shell_state(rel: str) -> tuple[str, int, int]:
│ +    """("ok"|"differs"|"unreachable", repo baitai, gyvi baitai)."""
│ +    local_path = ROOT / rel
│ +    if not local_path.exists():
│ +        return "ok", 0, 0
│ +    local = local_path.read_bytes()
│ +    live = fetch(LIVE_ROOT + rel)
│ +    if live is None:
│ +        return "unreachable", len(local), -1
│ +    for attempt in (0, 1):
│ +        if strip_version(live.decode("utf-8", "replace")) == strip_version(local.decode("utf-8", "replace")):
│ +            return "ok", len(local), len(live)
│ +        if attempt == 0:
│ +            # LL-76: pirmomis sekundėmis po deploymento kraštas gali būti mišrus.
│ +            time.sleep(2.5)
│ +            live = fetch(LIVE_ROOT + rel)
│ +            if live is None:
│ +                return "unreachable", len(local), -1
│ +    return "differs", len(local), len(live)
│ +
│ +
│ +def repo_version() -> str:
│ +    try:
│ +        return subprocess.run(
│ +            ["git", "rev-parse", "--short=8", "HEAD"], cwd=ROOT, capture_output=True, text=True, timeout=20
│ +        ).stdout.strip()
│ +    except Exception:  # noqa: BLE001
│ +        return ""
│ +
│ +
│ +def live_version() -> str:
│ +    """Commit'as, iš kurio sukurta gyva svetainė (`?v=` žymė `index.html`)."""
│ +    blob = fetch(LIVE_ROOT + "index.html")
│ +    if blob is None:
│ +        return ""
│ +    match = VERSION_PARAM.search(blob.decode("utf-8", "replace"))
│ +    return match.group(0)[3:] if match else ""
│ +
│ +
│ +def check_shell() -> dict:
│ +    files = shell_files()
│ +    with ThreadPoolExecutor(max_workers=6) as pool:
│ +        results = list(pool.map(lambda rel: (rel, _shell_state(rel)), files))
│ +    stale: list[dict] = []
│ +    unreachable: list[str] = []
│ +    for rel, (state, local_size, live_size) in results:
│ +        if state == "differs":
│ +            stale.append({"file": rel, "repo_bytes": local_size, "live_bytes": live_size})
│ +        elif state == "unreachable":
│ +            unreachable.append(rel)
│ … omitted 10 diff line(s) across 1 additional file(s)/section(s)
│ scripts/check_published.py
│ @@ -348,6 +348,12 @@
│              if not ok:
│                  aux_stale.append({"file": url_rel, "repo_bytes": local_size, "live_bytes": live_size})
│
│ +    # Svetainės kodas: ką vaikas iš tikrųjų įkelia, o ne tik ką rodo turinio JSON.
│ +    shell = check_shell() if compare_bytes else {
│ +        "shell_stale": [], "shell_unreachable": [], "shell_count": 0,
│ +        "live_version": "", "repo_version": "",
│ +    }
│ +
│      return {
│          "grades": per_grade,
│          "live_grades": grades,
│ @@ -360,6 +366,11 @@
│          "stale": merge("stale"),
│          "stale_unknown": merge("stale_unknown"),
│          "aux_stale": aux_stale,
│ +        "shell_stale": shell["shell_stale"],
│ +        "shell_unreachable": shell["shell_unreachable"],
│ +        "shell_count": shell["shell_count"],
│ +        "live_version": shell["live_version"],
│ +        "repo_version": shell["repo_version"],
│          "path_differs": [g["grade"] for g in per_grade if g.get("path_differs")],
│          "unpushed_commits": len(unpushed()),
│          "last_commit": last_commit(),
│ scripts/check_published.py
│ @@ -382,7 +382,8 @@
│      return bool(
│          data["missing_on_live"] or data["hidden_locally"] or data["not_in_path"]
│          or data["stale"] or data["stale_unknown"] or data["path_differs"]
│ -        or data.get("aux_stale") or data["unpushed_commits"] or data["live_error"]
│ +        or data.get("aux_stale") or data.get("shell_stale") or data.get("shell_unreachable")
│ +        or data["unpushed_commits"] or data["live_error"]
│      )
│
│
│ scripts/check_published.py
│ @@ -426,10 +426,21 @@
│          for s in data["aux_stale"]:
│              live = "nepasiektas" if s["live_bytes"] < 0 else f"gyvai {s['live_bytes']} B"
│              print(f"  - {s['file']}: repo {s['repo_bytes']} B, {live}")
│ +    if data.get("shell_stale"):
│ +        print(f"PASENĘS KODAS — naršyklė vykdo kitą failą ({len(data['shell_stale'])}):")
│ +        for s in data["shell_stale"]:
│ +            print(f"  - {s['file']}: repo {s['repo_bytes']} B, gyvai {s['live_bytes']} B")
│ +        if data.get("live_version") or data.get("repo_version"):
│ +            print(f"  gyvai versija {data.get('live_version') or '?'}, repo HEAD {data.get('repo_version') or '?'}")
│ +    if data.get("shell_unreachable"):
│ +        print(f"NEPASIEKIAMI svetainės kodo failai ({len(data['shell_unreachable'])}): "
│ +              f"{', '.join(data['shell_unreachable'])}")
│      if data["unpushed_commits"]:
│          print(f"Neišstumta commit'ų: {data['unpushed_commits']}")
│      if not problems(data):
│ -        print("✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai).")
│ +        print(f"✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, "
│ +              f"svetainės kodas {data.get('shell_count', 0)} failų"
│ +              f"{', versija ' + data['live_version'] if data.get('live_version') else ''}).")
│
│      return 1 if problems(data) else 0
│
│ profiles/deepseek41flash/cache/scratch/show_json.py
│ @@ -0,0 +1,6 @@
│ +import json, sys
│ +d = json.load(open(sys.argv[1]))
│ +for k, v in d.items():
│ +    if k == "grades":
│ +        continue
│ +    print(k, "=", len(v) if isinstance(v, list) else v)
Sustojau dėl ėjimų limito — todėl ataskaita čia pat, o ne `agents/log/` faile. Žemiau aiškiai atskirta, kas patikrinta, kas įgyvendinta ir kas liko nebaigta.

1. PRIVALOMAS PALEIDIMAS: `python3 scripts/check_published.py`

  Repozitorija: 37 moduliai
  Paskelbta:    37 moduliai
    · grade-01: repo 37, gyvai 37
  ✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, svetainės kodas 17 failų, versija 50c3c6ed).
  rc = 0 (7,6 s)

  Neišstumtų commit'ų eilutė nepasirodė → `unpushed_commits = 0`. Nieko nešalinta, ID nepernumeruoti, `index.json` / `path.json` / `grades.json` / garsas neliesti. Tad turinio sprendimas: SUTAMPA.

2. KĄ RADAU IR PADARIAU (failas: scripts/check_published.py)

  Radinys: įrankis iki šiol lygino tik `content/lt/**` JSON ir du pagalbinius failus, bet ne svetainės kodą. Vaikas vykdo `index.html`, `assets/js/**/*.js`, `assets/css/*.css` — nepaskelbtas simuliacijos pataisymas būtų buvęs nematomas (modulių baitai sutampa, o kodas gyvai senas). Tai LL-83 tipo defektas: vartai matuoja duomenis, o ne kodą.

  Antras, svarbesnis radinys: tiesioginis `assets/` baitų lyginimas BŪTŲ klaidingas. `.github/workflows/pages.yml:37–41` prieš publikavimą prirašo `?v=<commit>` prie CSS/JS nuorodų. Mano zondas parodė: `index.html` repo 3465 B, gyvai 3487 B; `app.js` 30713 / 30746; `registry.js` 3621 / 3731 — skirtumas vien `?v=` žymė. Todėl paprastas baitų palyginimas būtų klykęs po kiekvieno publikavimo ir vartai būtų tapę triukšmu.

  Įgyvendinta: `SHELL_GLOBS` + `shell_files()` (sąrašas imamas iš katalogų, tad nauja simuliacija įtraukiama be įrankio pakeitimo), `strip_version()` (nuima `?v=`), `_shell_state()` (lygina normalizuotą tekstą, pasikartoja po 2,5 s pagal LL-76), `live_version()` (perskaito gyvą `?v=` žymę), `repo_version()` (git HEAD), `check_shell()`. Nauji JSON raktai: `shell_stale`, `shell_unreachable`, `shell_count`, `live_version`, `repo_version`. `problems()` ir žmogui skirta išvestis papildyti.

  Teigiamas kelias patikrintas realiai: 17/17 svetainės failų sutampa po normalizavimo, gyva versija `50c3c6ed` = HEAD `50c3c6e`, rc 0.

3. HTTP kodai

  Tikrinti: `index.html` 200 (3487 B), `assets/js/app.js` 200 (30746 B), `assets/css/main.css` 200 (30802 B), `assets/js/registry.js` 200 (3731 B). Trijų modulių JSON adresų atskirai `curl` nebuvau paleidęs — bet `check_published.py` sėkmingai parsisiuntė ir baitais sulygino visus 37 modulius, tad visi jie gyvai pasiekiami ir identiški.

4. KAS LIKO NEBAIGTA (kitam paleidimui, sąžiningai)

  a) Neigiami scenarijai naujam kodo patikrinimui neįrodyti: reikia veidrodžio (`SUPRASK_LIVE_ROOT`), kuriame (A) vienas `assets/js/sims/*.js` tyčia pasenęs → tikėtina `PASENĘS KODAS`, rc 1; (B) naujas sim failas repo yra, veidrodyje jo nėra → `NEPASIEKIAMI svetainės kodo failai`, rc 1; (C) veidrodis su įterptomis `?v=` žymėmis → vėl rc 0 (normalizavimas veikia). Be šių trijų paleidimų negaliu rašyti „ištaisyta“ — tik „įgyvendinta, teigiamas kelias patikrintas“.
  b) `agents/log/publikavimo-agentas-2026-11-12T2*.md` neįrašytas.
  c) `agents/state.json` neatnaujintas (run #253 paliktas `running`).
  d) `research/wiki/changelog.md` eilutė neįrašyta.
  e) Nauja pamoka LL-83 („Vartai lygina turinį, o naršyklė vykdo kodą; publikavimo žymė `?v=` nėra turinio skirtumas“) neįrašyta į `research/wiki/guidelines/pamokos.md`.
  f) Pasiūlymas #12895 (dashboard kortelė) tebėra atviras: `dashboard/server.py:719` vis dar skaičiuoja „sutampa“ iš 2 iš dabar jau 10 `problems()` raktų. `dashboard/server.py` pagal `agents/roles/sistemos-architektas.md:34` yra kito vaidmens failas, todėl neliečiau. Dabar tai lengviau ištaisyti: pakanka, kad kortelė skaitytų `/api/publish-status` raktus `shell_stale`/`shell_unreachable`/`live_version`, o ne perrašytų taisyklę.

Sprendimas: turinio atžvilgiu SUTAMPA (repo 37 / paskelbta 37, baitai ir seka sutampa, rc 0). Įrankio atžvilgiu — pakeitimas įgyvendintas ir teigiamas kelias patikrintas, bet neigiami veidrodžių scenarijai ir visa ataskaitos/žurnalo dalis liko nebaigti dėl ėjimų limito; nebaigtų dalykų sąrašas — 4 skyriuje.

## klaidos

```
session_id: local-de6b1be304bdac1cb02c98009b9787074091aa72638bba6f502d57129d5b16c6
```
