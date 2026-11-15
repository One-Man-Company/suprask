# publikavimo-agentas — 2026-11-15T2300

- paleidimas: #308 (manual)
- trukmė: 319s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/p308_probe.py
│ @@ -0,0 +1,16 @@
│ +"""#308 zondas: ką check_published.py laiko „svetainės kodu“ ir ar unpushed() tyli."""
│ +import subprocess, sys
│ +sys.path.insert(0, "scripts")
│ +import check_published as cp
│ +
│ +print("unpushed():", cp.unpushed())
│ +r = subprocess.run(["git", "rev-parse", "--short=8", "HEAD"], capture_output=True, text=True)
│ +print("HEAD:", r.stdout.strip(), r.stderr.strip())
│ +r2 = subprocess.run(["git", "rev-parse", "--short=8", "origin/main"], capture_output=True, text=True)
│ +print("origin/main:", r2.stdout.strip(), r2.stderr.strip())
│ +print("repo_version:", cp.repo_version(), "live_version:", cp.live_version())
│ +print("SHELL_GLOBS:", cp.SHELL_GLOBS)
│ +print("shell_files(%d):" % len(cp.shell_files()))
│ +for f in cp.shell_files():
│ +    print("  ", f)
│ +print("404.html in shell_files:", "404.html" in cp.shell_files())
│ scripts/check_published.py
│ @@ -103,6 +103,12 @@
│  # anksčiau likdavo nematomas — visi modulių baitai sutapdavo (LL-83).
│  SHELL_GLOBS = [
│      ("index.html", None),
│ +    # `404.html` irgi įkeliamas naršyklės: tai puslapis, kurį vaikas pamato,
│ +    # kai modulio adresas neteisingas arba failas nepaskelbtas. Jis kopijuojamas
│ +    # į svetainę (`pages.yml`: `cp index.html 404.html _site/`), bet nebuvo nė
│ +    # viename varte — #306 paliko tai atviru, #308 įrodė zondą: veidrodis su
│ +    # 563 B → 594 B `404.html` davė rc 0 ir „sutampa“, nors gyvas failas kitas.
│ +    ("404.html", None),
│      ("assets/js", "*.js"),
│      ("assets/css", "*.css"),
│  ]
│ profiles/deepseek41flash/cache/scratch/p308_unpushed.py
│ @@ -0,0 +1,34 @@
│ +"""#308 zondas B: ar unpushed() tyliai grąžina 0, kai git negali atsakyti.
│ +
│ +Scenarijus: šviežias repo be `origin/main` (taip atrodo bet koks klonas, kuriame
│ +nuotolinė šaka dar nenuskaityta, arba veidrodis be remote). Tikras git, ne
│ +imituotas iškvietimas.
│ +"""
│ +import pathlib
│ +import shutil
│ +import subprocess
│ +import sys
│ +
│ +base = pathlib.Path.home() / ".hermes/profiles/deepseek41flash/cache/scratch/unpushed308"
│ +if base.exists():
│ +    shutil.rmtree(base)
│ +(base / "scripts").mkdir(parents=True)
│ +shutil.copy("/home/zoltanas/workspace/suprask/scripts/check_published.py", base / "scripts")
│ +
│ +subprocess.run(["git", "init", "-q", str(base)], check=True)
│ +subprocess.run(["git", "-C", str(base), "config", "user.email", "a@b"], check=True)
│ +subprocess.run(["git", "-C", str(base), "config", "user.name", "a"], check=True)
│ +(base / "x.txt").write_text("x")
│ +subprocess.run(["git", "-C", str(base), "add", "x.txt"], check=True)
│ +subprocess.run(["git", "-C", str(base), "commit", "-qm", "x"], check=True)
│ +
│ +raw = subprocess.run(["git", "-C", str(base), "rev-list", "origin/main..HEAD"],
│ +                     capture_output=True, text=True)
│ +print("git rc:", raw.returncode, "stdout:", repr(raw.stdout), "stderr:", raw.stderr.strip())
│ +
│ +sys.path.insert(0, str(base / "scripts"))
│ +import check_published as cp  # noqa: E402
│ +print("ROOT:", cp.ROOT)
│ +print("unpushed() ->", cp.unpushed())
│ +print("HEAD:", subprocess.run(["git", "-C", str(base), "log", "--oneline", "-1"],
│ +                              capture_output=True, text=True).stdout.strip())
│ scripts/check_published.py
│ @@ -523,14 +523,26 @@
│      return out
│
│
│ -def unpushed() -> list[str]:
│ -    try:
│ -        out = subprocess.run(
│ +def unpushed() -> tuple[list[str], bool]:
│ +    """(commit'ai, kurių nėra `origin/main`, ar patikra įvyko).
│ +
│ +    Anksčiau bet kokia git klaida (`origin/main` dar nenuskaitytas, veidrodis be
│ +    remote, sulūžęs indeksas) virsdavo tuščiu sąrašu — t. y. „0 neišsiųstų“ ir
│ +    žaliu „sutampa“. 2026-11-15 (#308) šviežias repo be `origin/main`: tikras
│ +    `git rev-list` grąžino rc 128 ir tuščią stdout, o įrankis pranešė 0. Tai ta
│ +    pati LL-37/LL-10 šeima: skaičius, kuris atrodo išmatuotas, bet nėra.
│ +    Antrasis reikšmės narys eina į `verdict()`, kad „nepatikrinta“ būtų
│ +    pasakyta žodžiais, o ne tylėtų.
│ +    """
│ +    try:
│ +        proc = subprocess.run(
│              ["git", "rev-list", "origin/main..HEAD"], cwd=ROOT, capture_output=True, text=True, timeout=30
│ -        ).stdout.split()
│ -        return [c for c in out if c]
│ +        )
│      except Exception:  # noqa: BLE001
│ -        return []
│ +        return [], False
│ +    if proc.returncode != 0:
│ +        return [], False
│ +    return [c for c in proc.stdout.split() if c], True
│
│
│  def last_commit() -> str:
│ scripts/check_published.py
│ @@ -613,7 +613,8 @@
│          "live_version": shell["live_version"],
│          "repo_version": shell["repo_version"],
│          "path_differs": [g["grade"] for g in per_grade if g.get("path_differs")],
│ -        "unpushed_commits": len(unpushed()),
│ +        "unpushed_commits": len(unpushed_list),
│ +        "unpushed_checked": unpushed_ok,
│          "last_commit": last_commit(),
│          "live_error": "; ".join(live_errors),
│      }
│ scripts/check_published.py
│ @@ -591,8 +591,11 @@
│          "note": "garso patikra praleista (--no-bytes)",
│      }
│
│ +    # Neišsiųsti commit'ai. `unpushed()` grąžina ir tai, ar patikra įvyko:
│ +    # git klaida anksčiau atrodė kaip „0 neišsiųstų“ (žr. funkcijos docstring).
│ +    unpushed_list, unpushed_ok = unpushed()
│ +
│      out = {
│ -        "grades": per_grade,
│          "live_grades": grades,
│          # Suderinta su senuoju formatu (changelog'ai ir dashboard'as skaito šiuos raktus).
│          "local": sum(g.get("local", 0) for g in per_grade),
│ scripts/check_published.py
│ @@ -596,6 +596,7 @@
│      unpushed_list, unpushed_ok = unpushed()
│
│      out = {
│ +        "grades": per_grade,
│          "live_grades": grades,
│          # Suderinta su senuoju formatu (changelog'ai ir dashboard'as skaito šiuos raktus).
│          "local": sum(g.get("local", 0) for g in per_grade),
│ scripts/check_published.py
│ @@ -671,7 +671,9 @@
│          reasons.append(f"{len(audio['empty'])} tuščias garso failas")
│      if audio.get("unreachable"):
│          reasons.append(f"{len(audio['unreachable'])} nepasiekiamas garso failas")
│ -    if data.get("unpushed_commits"):
│ +    if not data.get("unpushed_checked", True):
│ +        reasons.append("neišsiųstų commit'ų patikra neįvyko")
│ +    elif data.get("unpushed_commits"):
│          reasons.append(f"{data['unpushed_commits']} neišsiųstas commit")
│      return {"ok": not reasons, "reasons": reasons,
│              "label": "sutampa" if not reasons else reasons[0]}
│ scripts/check_published.py
│ @@ -769,6 +769,9 @@
│          print(f"Garsas: {audio['note']}")
│      if data["unpushed_commits"]:
│          print(f"Neišstumta commit'ų: {data['unpushed_commits']}")
│ +    if not data.get("unpushed_checked", True):
│ +        print("Neišstumtų commit'ų patikra NEĮVYKO — git negalėjo palyginti su origin/main "
│ +              "(tai ne „0“, o nežinoma; patikrink `git fetch`).")
│      if not problems(data):
│          print(f"✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, "
│                f"svetainės kodas {data.get('shell_count', 0)} failų"
│ scripts/check_published.py
│ @@ -57,6 +57,15 @@
│  sugedusiais mp3 iš 1138 duoda rc 0 — tyli žalia, nors vaikas girdi nieko.
│  `--audio-sample N` paliktas greitam rankiniam bėgimui; jis išvestyje visada
│  sako „mėginys“ ir niekada nepranešamas kaip pilnas (LL-37).
│ +
│ +2026-11-15 (paleidimas #308): dvi tylios žalios uždarytos.
│ +  - `404.html` įtrauktas į `SHELL_GLOBS`: jį naršyklė realiai įkelia (tai
│ +    puslapis, kurį vaikas pamato radęs neteisingą adresą ar nepaskelbtą
│ +    modulį), o `pages.yml` jį kopijuoja į svetainę. Veidrodis su 563 B → 594 B
│ +    failu anksčiau davė rc 0 ir „sutampa“; dabar — `PASENĘS KODAS: 404.html`.
│ +  - `unpushed()` grąžina ir tai, ar patikra įvyko. Git klaida (šviežias klonas
│ +    be `origin/main`) anksčiau virsdavo „0 neišsiųstų“; dabar `verdict()` sako
│ +    „neišsiųstų commit'ų patikra neįvyko“ ir rc lieka 1.
│
│  Naudojimas:
│      python3 scripts/check_published.py               # žmogui
Veiksmai nutrūko ties iteracijų limitu — pateikiu sąžiningą būseną. Ataskaitos failai **neįrašyti**, `state.json` neatnaujintas, changelog eilutė neįrašyta.

## Ką realiai išmatavau

**check_published.py (prieš mano pakeitimus, gyva svetainė, 1 m 18 s):**

```
Repozitorija: 39 moduliai
Paskelbta:    39 moduliai
  · grade-01: repo 39, gyvai 39
Pervadinti ID, priimta ir užregistruota (1):
  - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai
Garsas: patikrinta 1138 iš 1138 (visi) — visi pasiekiami
✔ Repo ir gyva svetainė sutampa (... svetainės kodas 17 failų, versija 0e269bf0)
rc 0
```

`missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `aux_stale` 0, `path_differs` [], neišstumta 0 (HEAD = origin/main = 04c3523).

**3 HTTP kodai (gyva svetainė):**
- `matematika/25-ilgis-ir-vienetas.json` — 200, 8 812 B
- `lietuviu-kalba/01-garsas-ir-raide.json` — 200, 5 044 B
- `pasaulio-pazinimas/16-vandens-busenos.json` — 200, 4 932 B

Papildomai: gyvas `404.html` sha256 `3fbdd06f…` = repo baitai; gyvas `index.html` neša `main.css?v=04c35237` = HEAD.

## Ką pakeičiau (scripts/check_published.py, 2 taisymai)

1. **`404.html` įtrauktas į `SHELL_GLOBS`.** Vartai jo nematė, nors `pages.yml` jį publikuoja ir naršyklė jį realiai įkelia (tai puslapis, kurį vaikas pamato radęs neteisingą adresą). Įrodyta neigiamai: veidrodis `scratch/mirror308a` su `404.html` 563 B → 594 B davė **rc 0 „sutampa“**; po taisymo — `PASENĘS KODAS: 404.html: repo 563 B, gyvai 594 B`, **rc 1**. Veidrodis atstatytas → rc 0, 18 kodo failų.
2. **`unpushed()` nebe tyli.** Tikras git šviežiam repo be `origin/main`: `git rev-list` rc 128, stdout tuščias → funkcija grąžino `[]`, t. y. „0 neišsiųstų“ ir žalias „sutampa“. Dabar grąžina `(sąrašas, ar_patikra_įvyko)`, `verdict()` prideda „neišsiųstų commit'ų patikra neįvyko“, žmogui spausdinama atskira eilutė. (Paskutinis `py_compile`/paleidimas po šio antro taisymo **dar neatliktas** — tai pirmas kitos eilės darbas.)

## Sprendimas

**sutampa** (39/39, visi baitai, seka, 1 138/1 138 garso, kodas) — bet su mano dviem įrankio taisymais, kurių **nereikėjo** publikavimui šiandien: jie uždaro latentines žalias, ne esamą defektą. Nieko nešalinau, jokio ID nepernumeravau, `content/**`, `assets/**`, CSS, `docs/**`, `AGENTS.md` neliesti.

## Kas liko nepadaryta (privalu kitam paleidimui)

1. `python3 scripts/check_published.py` po antro taisymo nepaleistas — reikia patvirtinti rc 0 prieš gyvą svetainę ir `py_compile`.
2. **Ataskaita `agents/log/publikavimo-agentas-2026-11-15T2300.md` neįrašyta**, `agents/state.json` neatnaujintas, `research/wiki/changelog.md` eilutė neįrašyta (ta pati skola kartojasi antrą paleidimą iš eilės — #306 jos taip pat nepaliko).
3. Pamoka neužfiksuota: kandidatas — *„Failas, kurį naršyklė įkelia, bet sąrašas imamas iš katalogo, o ne iš publikavimo žingsnio“* (`404.html`) ir *„git klaida, virtusi nuliu“* (`unpushed`). Abu jau aprašyti kodo komentaruose, bet ne `research/wiki/guidelines/pamokos.md`.
4. Vaikui matoma skola nepaliesta: žyma už senojo ID `03-sakinio-tvarka` lieka našlaite (`progress.js` alias mechanizmo nėra; atviras high pasiūlymas `2026-11-13-publikavimo-agentas-progreso-alias.json` — ne mano failas).

## klaidos

```
session_id: local-e438ac9e4a94e5b9ce2319aa31924178637676318f596c91dbcbf080eed8f2bb
```
