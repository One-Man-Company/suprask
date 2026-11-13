# publikavimo-agentas — 2026-11-13T1603

- paleidimas: #271 (manual)
- trukmė: 250s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/vanish.py
│ @@ -0,0 +1,30 @@
│ +import json, subprocess
│ +
│ +def run(*a):
│ +    return subprocess.run(a, cwd="/home/zoltanas/workspace/suprask", capture_output=True, text=True).stdout
│ +
│ +log = run("git", "log", "--format=%h", "--", "content/lt/grade-01/index.json")
│ +revs = [l.strip() for l in log.split("\n") if l.strip()]
│ +print("revs", len(revs))
│ +
│ +def ids(rev):
│ +    blob = run("git", "show", f"{rev}:content/lt/grade-01/index.json")
│ +    try:
│ +        d = json.loads(blob)
│ +    except Exception:
│ +        return None
│ +    return {m["id"] for s in d.get("strands", []) for m in s.get("modules", [])}
│ +
│ +cur = ids("HEAD")
│ +print("current", len(cur))
│ +seen = {}
│ +for r in revs:
│ +    s = ids(r)
│ +    if s is None:
│ +        continue
│ +    for i in s:
│ +        seen.setdefault(i, []).append(r)
│ +gone = sorted(set(seen) - cur)
│ +print("vanished", len(gone))
│ +for g in gone:
│ +    print("  ", g, "last seen in", seen[g][0])
│ scripts/check_published.py
│ @@ -29,6 +29,15 @@
│  įrankis tikrino vien `content/lt/**` ir du pagalbinius failus, todėl
│  nepaskelbtas simuliacijos pataisymas buvo nematomas: modulių baitai sutampa,
│  o vaikas vykdo seną `assets/js/sims/*.js` (LL-83).
│ +
│ +2026-11-13 (paleidimas #271): tikrinama ir **git istorija**, ne tik dabartis.
│ +Modulis `03-sakinio-tvarka` pervadintas į `03-sakinio-zodziai` (#261): repo ir
│ +gyva svetainė po to sutapo 39/39, visi baitai lygūs, visi vartai žali — o vaiko
│ +`localStorage` žyma tam moduliui liko be modulio. Įrankis tokio įvykio nematė,
│ +nes lygino tik dvi dabarties būsenas. Dabar iš klasės `index.json` istorijos
│ +surenkami visi kada nors buvę ID; tie, kurių dabartiniame indekse nėra,
│ +pranešami kaip `vanished_ids`. Priimtas pervadinimas (su aiškiu įpėdiniu)
│ +registruojamas `scripts/known_renames.json` — kitaip vartai raudoni.
│
│  Dėmesio: `?v=<commit>` — ne turinio skirtumas. `.github/workflows/pages.yml`
│  prieš publikavimą prirašo commit'o trumpinį prie CSS/JS nuorodų, kad
│ scripts/check_published.py
│ @@ -94,6 +94,13 @@
│  # `?v=<commit>` prirašo `.github/workflows/pages.yml`. Tai ne turinio skirtumas,
│  # todėl prieš lyginimą žymė nuimama, o versija perskaitoma atskirai.
│  VERSION_PARAM = re.compile(r"\?v=[0-9a-f]{6,40}")
│ +
│ +# Priimti modulių pervadinimai. Failas yra įrankio duomenys, ne turinio schema:
│ +# jis nekeičia modulio formato, tik pasako, kad dingęs ID turi įpėdinį ir kad
│ +# sprendimas buvo peržiūrėtas. Be jo kiekvienas sąmoningas pervadinimas darytų
│ +# vartus amžinai raudonus, o amžinai raudoni vartai — tas pats kaip jokių (LL-37).
│ +RENAMES = ROOT / "scripts" / "known_renames.json"
│ +HISTORY_LIMIT = 400
│
│
│
│ scripts/check_published.py
│ @@ -106,6 +106,84 @@
│
│  def grade_dir(grade: int) -> str:
│      return f"grade-{grade:02d}"
│ +
│ +
│ +def known_renames() -> dict[tuple[int, str], str]:
│ +    """(klasė, senas ID) → naujas ID. Priimti pervadinimai, ne spėjimai."""
│ +    try:
│ +        data = json.loads(RENAMES.read_text(encoding="utf-8"))
│ +    except (OSError, json.JSONDecodeError):
│ +        return {}
│ +    out: dict[tuple[int, str], str] = {}
│ +    for item in data.get("renames", []):
│ +        if item.get("from") and item.get("to"):
│ +            out[(int(item.get("grade", 0)), str(item["from"]))] = str(item["to"])
│ +    return out
│ +
│ +
│ +def historical_ids(grade: int) -> tuple[dict[str, str], str]:
│ +    """Visi ID, kada nors buvę klasės `index.json`, ir pastaba apie ribą.
│ +
│ +    Dabarties lyginimas pervadinimo nemato: jei repo ir gyva svetainė pakeistos
│ +    kartu, abi pusės sutampa, o vaiko žyma vis tiek neteko modulio (LL-85).
│ +    Todėl imama git istorija. Kiekvienam ID įsimenama **naujausia** revizija,
│ +    kurioje jis buvo (`revs` eina nuo naujausios).
│ +    """
│ +    path = f"content/lt/{grade_dir(grade)}/index.json"
│ +    note = ""
│ +    try:
│ +        shallow = subprocess.run(
│ +            ["git", "rev-parse", "--is-shallow-repository"],
│ +            cwd=ROOT, capture_output=True, text=True, timeout=20,
│ +        ).stdout.strip()
│ +        if shallow == "true":
│ +            return {}, "git istorija sekli — dingusių ID patikra neįmanoma"
│ +        revs = subprocess.run(
│ +            ["git", "log", f"--max-count={HISTORY_LIMIT}", "--format=%h", "--", path],
│ +            cwd=ROOT, capture_output=True, text=True, timeout=120,
│ +        ).stdout.split()
│ +    except Exception as exc:  # noqa: BLE001
│ +        return {}, f"git istorijos nepavyko perskaityti ({type(exc).__name__})"
│ +
│ +    if len(revs) >= HISTORY_LIMIT:
│ +        note = f"istoriia ribota iki {HISTORY_LIMIT} revizijų — senesni ID nepatikrinti"
│ +
│ +    seen: dict[str, str] = {}
│ +    for rev in revs:
│ +        try:
│ +            blob = subprocess.run(
│ +                ["git", "show", f"{rev}:{path}"],
│ +                cwd=ROOT, capture_output=True, text=True, timeout=30,
│ +            ).stdout
│ +            data = json.loads(blob)
│ +        except Exception:  # noqa: BLE001
│ +            continue  # revizijoje indekso dar nebuvo arba jis ne JSON
│ +        for strand in data.get("strands", []):
│ +            for mod in strand.get("modules", []):
│ +                mid = mod.get("id")
│ +                if mid and mid not in seen:
│ +                    seen[mid] = rev
│ +    return seen, note
│ +
│ +
│ +def vanished(grade: int, current_ids: list[str]) -> dict:
│ +    """Dingę ID su įpėdiniu, jei pervadinimas priimtas ir užregistruotas."""
│ +    hist, note = historical_ids(grade)
│ +    known = known_renames()
│ +    cur = set(current_ids)
│ +    items: list[dict] = []
│ +    for mid, rev in sorted(hist.items()):
│ +        if mid in cur:
│ +            continue
│ +        successor = known.get((grade, mid), "")
│ +        items.append({
│ +            "grade": grade,
│ +            "id": mid,
│ +            "last_rev": rev,
│ +            "successor": successor,
│ … omitted 6 diff line(s) across 1 additional file(s)/section(s)
│ scripts/check_published.py
│ @@ -121,13 +121,16 @@
│      return out
│
│
│ -def historical_ids(grade: int) -> tuple[dict[str, str], str]:
│ -    """Visi ID, kada nors buvę klasės `index.json`, ir pastaba apie ribą.
│ +def historical_ids(grade: int) -> tuple[dict[str, str], str, bool]:
│ +    """Visi ID, kada nors buvę klasės `index.json`, pastaba ir ar patikra įvyko.
│
│      Dabarties lyginimas pervadinimo nemato: jei repo ir gyva svetainė pakeistos
│      kartu, abi pusės sutampa, o vaiko žyma vis tiek neteko modulio (LL-85).
│      Todėl imama git istorija. Kiekvienam ID įsimenama **naujausia** revizija,
│      kurioje jis buvo (`revs` eina nuo naujausios).
│ +
│ +    Trečias reikšmės narys `checked` saugo nuo tylios „0 dingusių“: jei istorijos
│ +    perskaityti nepavyksta, tai nėra švarus rezultatas (LL-37/LL-10).
│      """
│      path = f"content/lt/{grade_dir(grade)}/index.json"
│      note = ""
│ @@ -137,13 +140,13 @@
│              cwd=ROOT, capture_output=True, text=True, timeout=20,
│          ).stdout.strip()
│          if shallow == "true":
│ -            return {}, "git istorija sekli — dingusių ID patikra neįmanoma"
│ +            return {}, "git istorija sekli — dingusių ID patikra neįmanoma", False
│          revs = subprocess.run(
│              ["git", "log", f"--max-count={HISTORY_LIMIT}", "--format=%h", "--", path],
│              cwd=ROOT, capture_output=True, text=True, timeout=120,
│          ).stdout.split()
│      except Exception as exc:  # noqa: BLE001
│ -        return {}, f"git istorijos nepavyko perskaityti ({type(exc).__name__})"
│ +        return {}, f"git istorijos nepavyko perskaityti ({type(exc).__name__})", False
│
│      if len(revs) >= HISTORY_LIMIT:
│          note = f"istoriia ribota iki {HISTORY_LIMIT} revizijų — senesni ID nepatikrinti"
│ @@ -163,12 +166,12 @@
│                  mid = mod.get("id")
│                  if mid and mid not in seen:
│                      seen[mid] = rev
│ -    return seen, note
│ +    return seen, note, True
│
│
│  def vanished(grade: int, current_ids: list[str]) -> dict:
│      """Dingę ID su įpėdiniu, jei pervadinimas priimtas ir užregistruotas."""
│ -    hist, note = historical_ids(grade)
│ +    hist, note, checked = historical_ids(grade)
│      known = known_renames()
│      cur = set(current_ids)
│      items: list[dict] = []
│ @@ -183,7 +186,7 @@
│              "successor": successor,
│              "resolved": bool(successor) and successor in cur,
│          })
│ -    return {"items": items, "note": note}
│ +    return {"items": items, "note": note, "checked": checked}
│
│
│  def live_grades() -> list[int]:
│ scripts/check_published.py
│ @@ -149,7 +149,7 @@
│          return {}, f"git istorijos nepavyko perskaityti ({type(exc).__name__})", False
│
│      if len(revs) >= HISTORY_LIMIT:
│ -        note = f"istoriia ribota iki {HISTORY_LIMIT} revizijų — senesni ID nepatikrinti"
│ +        note = f"istorija ribota iki {HISTORY_LIMIT} revizijų — senesni ID nepatikrinti"
│
│      seen: dict[str, str] = {}
│      for rev in revs:
│ scripts/check_published.py
│ @@ -358,6 +358,14 @@
│      out["published"] = len(live_ids)
│      out["missing_on_live"] = [m for m in local_ids if m not in live_ids]
│      out["hidden_locally"] = [m for m in live_ids if m not in local_ids]
│ +
│ +    # LL-85: abi dabartys gali sutapti, o ID vis tiek gali būti dingęs.
│ +    # Nuo to priklauso vaiko `localStorage` žyma, todėl tikrinama ne tik
│ +    # „repo vs gyva“, bet ir „šiandien vs istorija“.
│ +    gone = vanished(grade, local_ids)
│ +    out["vanished_ids"] = gone["items"]
│ +    out["history_note"] = gone["note"]
│ +    out["history_checked"] = gone["checked"]
│
│      try:
│          local_seq = list(json.loads((CONTENT / gd / "path.json").read_text(encoding="utf-8")).get("sequence", []))
│ scripts/check_published.py
│ @@ -468,6 +468,9 @@
│          "missing_on_live": merge("missing_on_live"),
│          "hidden_locally": merge("hidden_locally"),
│          "not_in_path": merge("not_in_path"),
│ +        "vanished_ids": merge("vanished_ids"),
│ +        "history_note": "; ".join(g.get("history_note", "") for g in per_grade if g.get("history_note")),
│ +        "history_unchecked": [g["grade"] for g in per_grade if g.get("history_checked") is False],
│          "stale": merge("stale"),
│          "stale_unknown": merge("stale_unknown"),
│          "aux_stale": aux_stale,
│ scripts/check_published.py
│ @@ -509,6 +509,11 @@
│          reasons.append(f"{len(data['hidden_locally'])} dingo iš repo")
│      if data.get("not_in_path"):
│          reasons.append(f"{len(data['not_in_path'])} ne kelyje")
│ +    unexplained = [v for v in data.get("vanished_ids", []) if not v.get("resolved")]
│ +    if unexplained:
│ +        reasons.append(f"{len(unexplained)} dingęs ID (pažanga liko be modulio)")
│ +    if data.get("history_unchecked"):
│ +        reasons.append("dingusių ID patikra neįvyko")
│      if data.get("stale"):
│          reasons.append(f"{len(data['stale'])} pasenęs modulis")
│      if data.get("stale_unknown"):
│ scripts/check_published.py
│ @@ -568,6 +568,19 @@
│          print(f"NEPASIEKIAMI gyvi failai ({len(data['stale_unknown'])}): {', '.join(data['stale_unknown'])}")
│      if data["not_in_path"]:
│          print(f"NĖRA path.json sekoje ({len(data['not_in_path'])}): {', '.join(data['not_in_path'])}")
│ +    accepted = [v for v in data.get("vanished_ids", []) if v.get("resolved")]
│ +    unexplained = [v for v in data.get("vanished_ids", []) if not v.get("resolved")]
│ +    if unexplained:
│ +        print(f"DINGĘ ID — vaiko pažanga liko be modulio ({len(unexplained)}):")
│ +        for v in unexplained:
│ +            print(f"  - grade-{v['grade']:02d} {v['id']} (paskutinį kartą {v['last_rev']})")
│ +    if accepted:
│ +        print(f"Pervadinti ID, priimta ir užregistruota ({len(accepted)}):")
│ +        for v in accepted:
│ +            print(f"  - grade-{v['grade']:02d} {v['id']} → {v['successor']} "
│ +                  f"(žyma tam moduliui nebegalioja)")
│ +    if data.get("history_note"):
│ +        print(f"Dingusių ID patikros riba: {data['history_note']}")
│      if data["path_differs"]:
│          print(f"path.json seka skiriasi: klasė {', '.join(map(str, data['path_differs']))}")
│      if data["aux_stale"]:
│ scripts/known_renames.json
│ @@ -0,0 +1,13 @@
│ +{
│ +  "note": "Priimti (peržiūrėti, ne spėjami) modulių pervadinimai. Įrašas čia reiškia: senas ID dingo sąmoningai, naujas ID yra jo įpėdinis ir dabartiniame index.json egzistuoja. Tai NE atleidimas nuo pasekmės: vaiko localStorage žyma už seną ID lieka našlaitė, kol progress.js neturi alias mechanizmo (žr. agents/proposals/). Įrašo be įpėdinio rašyti negalima — dingęs ID be įpėdinio yra regresija, kurią check_published.py turi rodyti raudonai.",
│ +  "renames": [
│ +    {
│ +      "grade": 1,
│ +      "from": "03-sakinio-tvarka",
│ +      "to": "03-sakinio-zodziai",
│ +      "run": 261,
│ +      "date": "2026-11-13",
│ +      "reason": "Programos derintojas (#261): modulio pavadinimas keistas į programos terminą. Turinio sprendimas priimtas ir paskelbtas; publikavimo agentas ID negrąžina (tai ne jo vaidmuo), bet ir nešalina — fiksuoja įvykį, kad vartai jo nebematytų kaip naujo defekto."
│ +    }
│ +  ]
│ +}
│ profiles/deepseek41flash/cache/scratch/peek_json.py
│ @@ -0,0 +1,6 @@
│ +import json, sys
│ +d = json.load(sys.stdin)
│ +print("verdict:", d["verdict"])
│ +print("vanished_ids:", d["vanished_ids"])
│ +print("history_unchecked:", d["history_unchecked"], "| note:", repr(d["history_note"]))
│ +print("local/published:", d["local"], d["published"])
│ profiles/deepseek41flash/cache/scratch/bad_renames.json
│ @@ -0,0 +1 @@
│ +{"renames": [{"grade": 1, "from": "03-sakinio-tvarka", "to": "99-nebera"}]}
│ scripts/check_published.py
│ @@ -125,7 +125,7 @@
│      """Visi ID, kada nors buvę klasės `index.json`, pastaba ir ar patikra įvyko.
│
│      Dabarties lyginimas pervadinimo nemato: jei repo ir gyva svetainė pakeistos
│ -    kartu, abi pusės sutampa, o vaiko žyma vis tiek neteko modulio (LL-85).
│ +    kartu, abi pusės sutampa, o vaiko žyma vis tiek neteko modulio (LL-88).
│      Todėl imama git istorija. Kiekvienam ID įsimenama **naujausia** revizija,
│      kurioje jis buvo (`revs` eina nuo naujausios).
│
│ scripts/check_published.py
│ @@ -359,7 +359,7 @@
│      out["missing_on_live"] = [m for m in local_ids if m not in live_ids]
│      out["hidden_locally"] = [m for m in live_ids if m not in local_ids]
│
│ -    # LL-85: abi dabartys gali sutapti, o ID vis tiek gali būti dingęs.
│ +    # LL-88: abi dabartys gali sutapti, o ID vis tiek gali būti dingęs.
│      # Nuo to priklauso vaiko `localStorage` žyma, todėl tikrinama ne tik
│      # „repo vs gyva“, bet ir „šiandien vs istorija“.
│      gone = vanished(grade, local_ids)
## Publikavimo patikra #271 — kas padaryta ir ką radau

**`check_published.py` išvestis (repo / paskelbta / neišstumta):**

```
Repozitorija: 39 moduliai
Paskelbta:    39 moduliai
  · grade-01: repo 39, gyvai 39
Pervadinti ID, priimta ir užregistruota (1):
  - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai (žyma tam moduliui nebegalioja)
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai,
  svetainės kodas 17 failų, versija 6efbaecf).   rc=0
```
Neišstumtų commit'ų 0 (`git rev-list --count origin/main..HEAD` → 0). `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `aux_stale` 0, `shell_stale` 0, `path_differs` — ne.

**3 gyvi adresai (HTTP):**
- `content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json` → **200**, 8 812 B
- `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` → **200**, 5 459 B
- `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` → **200**, 4 932 B

**Vartai:** `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų, rc 0. `check_docs_facts.py` → 0/0. `check_agents.py` → 15 vaidmenų, rc 0 (2 įspėjimai, abu seni).

## Sprendimas: SUTAMPA (publikavimo būsena), su vienu įrankio taisymu

Vienintelis realus darbas šiame paleidime — **įrankio aklumas**, ne publikavimo defektas. `check_published.py` docstring'e žadėjo „svarbiausia, tikrina, ar nepradingo nė vienas modulio ID“, o realiai lygino dvi **dabartis** (repo vs gyva). Kai `03-sakinio-tvarka` pervadintas į `03-sakinio-zodziai` (#261), abi pusės pasikeitė kartu — 39/39, baitai lygūs, visi vartai žali, o vaiko `localStorage` žyma tam moduliui liko našlaitė (`progress.js:31` — `slot(d, moduleId)`, jokio alias).

Padaryta `scripts/check_published.py`:
- `historical_ids()` — iš git istorijos klasės `index.json` surenka visus kada nors buvusius ID (35 revizijos, `HISTORY_LIMIT=400`); sekli istorija / neperskaityta istorija **nėra** tyliai „0 dingusių“ (`history_checked=False` → raudona).
- `vanished()` → `vanished_ids` kiekviename modulyje, įpėdinis iš naujo `scripts/known_renames.json`.
- `verdict()` papildytas: nepaaiškintas dingęs ID = priežastis; priimtas pervadinimas = informacinė eilutė.
- Trys kryptys išmatuotos realiai: (A) be registro → `RC=1` + `DINGĘ ID — vaiko pažanga liko be modulio (1): grade-01 03-sakinio-tvarka (paskutinį kartą a2ad497)`; (B) įpėdinis `99-nebera` → `RC=1`; (C) su registru → `RC=0`, `vanished_ids[0].resolved=true`.

## Kas liko nepadaryta (sąžiningai)

1. **Neįrašyta ataskaita į `agents/log/` ir neatnaujintas `agents/state.json`** — baigties sąlyga formaliai neįvykdyta dėl iteracijų ribos. `agents/state.json` yra `.gitignore:36`, todėl jo pakeitimas į commit'ą nepatenka.
2. **Neįrašyta changelog eilutė** `research/wiki/changelog.md` (turėjo būti virš `## 2026-11-13 (08:24)`): 39/39, versija `6efbaecf`, 3×200, 1 pervadintas ID. Laikas fiksuotas: 2026-11-13T16:07+0200.
3. **Neįrašyta pamoka LL-88** į `research/wiki/guidelines/pamokos.md` (LL-85 jau užimta kitai pamokai; failas baigiasi LL-87, 632 eil.). Siūloma formuluotė: „Vartai, kurie lygina dvi dabartis — pervadinimas abiem pusėms judant kartu lieka nematomas, o tapatybės vartai privalo turėti istorinį atskaitos tašką“.
4. **Pasiūlymai neįrašyti.** Du pagrįsti: (a) `renamed_from`/alias migracija `progress.js` (`assets/js/progress.js:31` — įrodymas: šio paleidimo atvejis; `scripts/known_renames.json` yra įrankio duomenys, svetainė jo neskaito, tad alias turi būti served faile arba `index.json` lauke su `KURINIO-STANDARTAS` atnaujinimu); (b) `scripts/add_optional_tasks.py:34` — kietai įrašytas `"03-sakinio-tvarka"` raktas moduliui, kurio ID jau nebeegzistuoja, todėl papildoma užduotis tam moduliui niekada nebus pridėta.

Darbinėje kopijoje: `M scripts/check_published.py`, `?? scripts/known_renames.json` — nieko kito neliečiau (jokio turinio, ID, `index.json`, `path.json`, garso manifesto).

## klaidos

```
session_id: local-a6508f74d85b9ab47d88f2a2f161a946e97b7afd51543bd91f843fe4c4ca9266
```
