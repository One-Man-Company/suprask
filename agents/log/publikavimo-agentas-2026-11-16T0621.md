# publikavimo-agentas — 2026-11-16T0621

- paleidimas: #310 (manual)
- trukmė: 349s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/p310_unpushed_probe.py
│ @@ -0,0 +1,47 @@
│ +"""#310 zondas: ar unpushed() po #308 taisymo atskiria „0 neišsiųstų“ nuo „nepatikrinta“.
│ +
│ +Scenarijus tikras, ne imituotas: šviežias git repo be `origin/main` (taip atrodo
│ +bet kuris klonas, kuriame nuotolinė šaka dar nenuskaityta). Tikrinama, ką grąžina
│ +funkcija ir ką pasako verdict(), jei toks įrašas ateitų iš check().
│ +"""
│ +import pathlib
│ +import shutil
│ +import subprocess
│ +import sys
│ +
│ +SRC = pathlib.Path("/home/zoltanas/workspace/suprask/scripts/check_published.py")
│ +BASE = pathlib.Path.home() / ".hermes/profiles/deepseek41flash/cache/scratch/unpushed310"
│ +
│ +if BASE.exists():
│ +    shutil.rmtree(BASE)
│ +(BASE / "scripts").mkdir(parents=True)
│ +shutil.copy(SRC, BASE / "scripts" / "check_published.py")
│ +
│ +subprocess.run(["git", "init", "-q", str(BASE)], check=True)
│ +subprocess.run(["git", "-C", str(BASE), "config", "user.email", "zondas@example.invalid"], check=True)
│ +subprocess.run(["git", "-C", str(BASE), "config", "user.name", "zondas"], check=True)
│ +(BASE / "x.txt").write_text("x\n")
│ +subprocess.run(["git", "-C", str(BASE), "add", "x.txt"], check=True)
│ +subprocess.run(["git", "-C", str(BASE), "commit", "-qm", "x"], check=True)
│ +
│ +raw = subprocess.run(
│ +    ["git", "-C", str(BASE), "rev-list", "origin/main..HEAD"], capture_output=True, text=True
│ +)
│ +print("git rev-list rc:", raw.returncode, "stdout:", repr(raw.stdout), "stderr:", raw.stderr.strip()[:120])
│ +
│ +sys.path.insert(0, str(BASE / "scripts"))
│ +import check_published as cp  # noqa: E402
│ +
│ +print("ROOT:", cp.ROOT)
│ +commits, checked = cp.unpushed()
│ +print("unpushed() -> commits:", commits, "checked:", checked)
│ +
│ +v = cp.verdict({"unpushed_commits": len(commits), "unpushed_checked": checked})
│ +print("verdict:", v)
│ +
│ +# Palyginimas: kaip atrodytų senasis elgesys (klaida -> []) jei kas nors vėl
│ +# nuskaitytų tik pirmąjį narį ir pamestų `checked`.
│ +old_style = {"unpushed_commits": 0}
│ +print("senoji forma (be unpushed_checked):", cp.verdict(old_style))
│ +print("checked == True ?", checked is True)
│ +sys.exit(0 if (commits == [] and checked is False and v["ok"] is False) else 1)
│ scripts/check_published.py
│ @@ -680,7 +680,12 @@
│          reasons.append(f"{len(audio['empty'])} tuščias garso failas")
│      if audio.get("unreachable"):
│          reasons.append(f"{len(audio['unreachable'])} nepasiekiamas garso failas")
│ -    if not data.get("unpushed_checked", True):
│ +    # Numatytasis `False`, ne `True`: nežinoma būsena neturi atrodyti kaip
│ +    # išmatuotas nulis. `check()` visada įrašo raktą, tad šis kelias liečia tik
│ +    # svetimus dict'us (senas snapshot'as, rankinis zondas) — jiems saugiau
│ +    # pasakyti „nepatikrinta“ negu „0 neišsiųstų“ (#310 zondas: `verdict({})`
│ +    # anksčiau grąžino žalią „sutampa“).
│ +    if not data.get("unpushed_checked", False):
│          reasons.append("neišsiųstų commit'ų patikra neįvyko")
│      elif data.get("unpushed_commits"):
│          reasons.append(f"{data['unpushed_commits']} neišsiųstas commit")
│ scripts/check_published.py
│ @@ -783,8 +783,7 @@
│          print(f"Garsas: {audio['note']}")
│      if data["unpushed_commits"]:
│          print(f"Neišstumta commit'ų: {data['unpushed_commits']}")
│ -    if not data.get("unpushed_checked", True):
│ -        print("Neišstumtų commit'ų patikra NEĮVYKO — git negalėjo palyginti su origin/main "
│ +    if not data.get("unpushed_checked", False):
│                "(tai ne „0“, o nežinoma; patikrink `git fetch`).")
│      if not problems(data):
│          print(f"✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, "
│ scripts/check_published.py
│ @@ -784,6 +784,7 @@
│      if data["unpushed_commits"]:
│          print(f"Neišstumta commit'ų: {data['unpushed_commits']}")
│      if not data.get("unpushed_checked", False):
│ +        print("Neišstumtų commit'ų patikra NEĮVYKO — git negalėjo palyginti su origin/main "
│                "(tai ne „0“, o nežinoma; patikrink `git fetch`).")
│      if not problems(data):
│          print(f"✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, "
│ profiles/deepseek41flash/cache/scratch/p310_verdict_probe.py
│ @@ -0,0 +1,24 @@
│ +"""#310 zondas B: ar `verdict()` nežinomą būseną vadina nežinoma, o ne nuliu.
│ +
│ +Naudojami tik rankiniu būdu sudaryti dict'ai — t. y. kelias, kuriuo eina senas
│ +snapshot'as arba kitas įrankis, nuskaityti tik `unpushed_commits`.
│ +"""
│ +import sys
│ +
│ +sys.path.insert(0, "/home/zoltanas/workspace/suprask/scripts")
│ +import check_published as cp  # noqa: E402
│ +
│ +cases = {
│ +    "be rakto": {},
│ +    "senasis formatas (0)": {"unpushed_commits": 0},
│ +    "patikrinta, 0": {"unpushed_commits": 0, "unpushed_checked": True},
│ +    "patikrinta, 2": {"unpushed_commits": 2, "unpushed_checked": True},
│ +    "nepatikrinta, 0": {"unpushed_commits": 0, "unpushed_checked": False},
│ +}
│ +for name, data in cases.items():
│ +    v = cp.verdict(data)
│ +    print(f"{name:24s} -> ok={v['ok']!s:5s} label={v['label']}")
│ +
│ +# Tikimasi: nežinoma (be rakto / senasis formatas) NĖRA žalia.
│ +sys.exit(0 if not cp.verdict({})["ok"] and not cp.verdict({"unpushed_commits": 0})["ok"]
│ +         and cp.verdict({"unpushed_commits": 0, "unpushed_checked": True})["ok"] else 1)
│ profiles/deepseek41flash/cache/scratch/p310_shell_probe.py
│ @@ -0,0 +1,34 @@
│ +"""#310 zondas C: ar vartų failų sąrašas sutampa su tuo, ką publikuoja pages.yml.
│ +
│ +Ne spėjimas iš katalogo: sąrašas `SHELL_GLOBS` lyginamas su `pages.yml` keliais,
│ +kurie realiai nukopijuojami į `_site`.
│ +"""
│ +import json
│ +import pathlib
│ +import re
│ +import sys
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +sys.path.insert(0, str(ROOT / "scripts"))
│ +import check_published as cp  # noqa: E402
│ +
│ +files = cp.shell_files()
│ +print(f"shell_files(): {len(files)}")
│ +for f in files:
│ +    print("  ", f)
│ +
│ +yml = (ROOT / ".github/workflows/pages.yml").read_text(encoding="utf-8")
│ +copied = sorted({m for m in re.findall(r"cp\s+(?:-\w+\s+)*([^\s;]+)\s+_site", yml)})
│ +print("pages.yml cp šaltiniai:", copied)
│ +
│ +must = ["index.html", "404.html"]
│ +missing = [m for m in must if m not in files]
│ +print("privalomi ir sąraše:", {m: (m in files) for m in must})
│ +
│ +# 404.html baitai: repo vs gyva svetainė (jei tinklas leidžia)
│ +live = cp.fetch(cp.LIVE_ROOT + "404.html")
│ +repo = (ROOT / "404.html").read_bytes()
│ +print("404.html: repo", len(repo), "B, gyvai", (len(live) if live else None), "B, lygūs:",
│ +      (live == repo))
│ +
│ +sys.exit(0 if not missing and live == repo else 1)
Stabdau darbą ties iteracijų limitu — pateikiu sąžiningą būseną.

## Ką realiai išmatavau (šis paleidimas #310)

**`check_published.py` (po visų taisymų, gyva svetainė, rc 0):**

```
Repozitorija: 39 moduliai
Paskelbta:    39 moduliai
  · grade-01: repo 39, gyvai 39
Pervadinti ID, priimta ir užregistruota (1):
  - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai (žyma už seno ID LIEKA — alias nėra)
Garsas: patikrinta 1138 iš 1138 (visi) — visi pasiekiami
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai,
  svetainės kodas 18 failų, versija cb4476b5)
FINAL RC=0
```

`missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `aux_stale` 0, `path_differs` [], neišstumta 0 (HEAD = origin/main = cb4476b5). Pirmas šio paleidimo bėgimas rodė versiją `b22f5e9f` (deploy dar nebuvo pasibaigęs); po jo gyvas `index.html` jau neša `main.css?v=cb4476b5` = HEAD, todėl antras bėgimas — švarus.

**3 HTTP kodai (gyva svetainė):**
- `matematika/25-ilgis-ir-vienetas.json` — 200, 8 812 B
- `lietuviu-kalba/01-garsas-ir-raide.json` — 200, 5 044 B
- `pasaulio-pazinimas/16-vandens-busenos.json` — 200, 4 932 B
- papildomai `404.html` — 200, 563 B = repo baitai (lygūs baitiškai)

## Ką pakeičiau

1. **`scripts/check_published.py` — `verdict()` ir `report()` nežinomą būseną vadina nežinoma.** Numatytasis `data.get("unpushed_checked", True)` pakeistas į `False` (2 vietos, 683 ir 786 eilutės). Zondas: prieš — `verdict({"unpushed_commits": 0})` grąžino žalią „sutampa"; dabar — `ok=False, label=neišsiųstų commit'ų patikra neįvyko`. `check()` visada įrašo raktą, tad elgesys su tikru išėjimu nepakito (`patikrinta, 0 → ok=True`). `py_compile` OK.
2. **Šio paleidimo pradžioje atlikau #308 paliktą darbą:** `python3 -m py_compile` ir pilnas `check_published.py` paleidimas — abu žali (rc 0, 18 kodo failų). Tai buvo pirmas #308 sąrašo punktas.
3. **Įrodžiau #308 antrą taisymą neigiamai** (tai, ko #308 nespėjo): šviežias git repo be `origin/main` → `git rev-list` rc 128, `unpushed()` → `([], False)`, `verdict` → `ok=False, „neišsiųstų commit'ų patikra neįvyko"`. Prieš taisymą tas pats kelias būtų davęs „0" ir žalią.
4. **Patvirtinau #308 pirmą taisymą:** `shell_files()` = 18 failų, `404.html` jame yra; sąrašas atitinka `pages.yml:26–27` kopijavimo šaltinius (`index.html`, `404.html`, `assets/`, `content/`) kodo failų atžvilgiu. Gyvas `404.html` = repo baitai.

Nieko nešalinau, jokio ID nepernumeravau; `content/**`, `assets/**`, CSS, `docs/**`, `AGENTS.md` neliesti. `git status` rodo tik ` M scripts/check_published.py`.

## Sprendimas

**sutampa** (39/39, visi baitai, seka, 1 138/1 138 garso, 18/18 kodo failų, gyva versija = HEAD).

## Kas liko nepadaryta (privalu kitam paleidimui)

1. **Changelog eilutė neįrašyta.** `research/wiki/changelog.md` naujausias įrašas tebėra `2026-11-15 (16:40)` — #308 savo eilutės taip pat nepaliko (nors jo ataskaita `agents/log/publikavimo-agentas-2026-11-15T2300.md` repo yra ir `state.json` atnaujintas — #308 ataskaitos „kas liko" tame punkte buvo netiksli).
2. **Pamoka neužfiksuota.** `research/wiki/guidelines/pamokos.md` turi 96 įrašus; du paruošti kandidatai (tekstas žemiau) neįrašyti — darbą nutraukiau būtent ties šiuo žingsniu.
3. **Ataskaitos failas `agents/log/publikavimo-agentas-2026-11-16T0626.md` neįrašytas** ir `agents/state.json` (`roles.publikavimo-agentas`, `last_publish_check_310`) neatnaujintas.
4. **Vaikui matoma skola nepaliesta:** žyma už senojo ID `03-sakinio-tvarka` lieka našlaite (`progress.js` alias mechanizmo nėra; atviras high pasiūlymas `2026-11-13-publikavimo-agentas-progreso-alias.json` — ne mano failas).
5. **Naujas radinys, netikrintas:** `content/audio-overrides.json` publikuojamas (`pages.yml` kopijuoja visą `content/`), bet nėra `AUX_FILES` sąraše. Kliento pusėje jo nenaudoja (`generate_audio.py` — statybos įrankis), tad tai ne defektas, o neužfiksuotas faktas.

## Du paruošti pamokų tekstai (įrašyti į `pamokos.md` tuo pačiu formatu)

**LL-97 — Failas, kurį naršyklė įkelia, liko už vartų sąrašo ribų (`404.html`)**
- Simptomas: vartai lygino 17 kodo failų, o `pages.yml` publikuoja ir `404.html`. Veidrodis su 563 B → 594 B `404.html` davė rc 0 ir „sutampa", nors gyvas failas buvo kitas; tai puslapis, kurį vaikas realiai pamato radęs neteisingą adresą.
- Priežastis: sąrašas buvo sudarytas pagal importų grafą („kas įkeliama iš `app.js`"), o ne pagal publikavimo žingsnio kopijavimo sąrašą. Failas, kurio niekas neimportuoja, į sąrašą nepateko.
- Taisyklė: vartų failų sąrašas imamas iš publikavimo žingsnio (`cp … _site`), o ne iš importų; kiekvienas kopijuojamas šaltinis turi atitikmenį varte arba aiškiai įvardytą taisyklę, kuri jį lygina kitaip (turinys, garsas).
- Patikra: `shell_files()` (18) išvardytas prieš `pages.yml:26–27` — 2 html + 15 js + 1 css; veidrodis su kitu `404.html` → rc 1, `PASENĘS KODAS: 404.html`.

**LL-98 — Įrankio klaida, virtusi išmatuotu nuliu (`unpushed()`)**
- Simptomas: `git rev-list origin/main..HEAD` rc 128 (šviežias repo be `origin/main`) → tuščia stdout → funkcija grąžino `[]`, vartai pranešė „0 neišsiųstų" ir žalią „sutampa".
- Priežastis: `subprocess.run` rezultate buvo skaitoma tik `stdout`, `returncode` netikrintas; `except` virto tuščiu sąrašu. „Nėra commit'ų" ir „negalėjau palyginti" suplakti į vieną reikšmę.
- Taisyklė: įrankis privalo atskirti „nieko neradau" nuo „nepadariau patikros"; funkcija grąžina abu faktus, `verdict()` nežinomą įvardija žodžiais, o nežinomos būsenos numatytasis įvertis yra ne žalias.
- Patikra: #310 trys zondai — (A) repo be `origin/main` → `([], False)` + `ok=False`; (B) `verdict({})` ir `verdict({"unpushed_commits": 0})` → `ok=False` (prieš taisymą abu žali); (C) `{"unpushed_commits": 0, "unpushed_checked": True}` → `ok=True`.

## klaidos

```
session_id: local-ad5588f5958b4873f11dad3b1ce685529abe05139241eff3f69cc3db0322014e
```
