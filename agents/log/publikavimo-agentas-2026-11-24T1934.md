# publikavimo-agentas — 2026-11-24T1934

- paleidimas: #515 (manual)
- trukmė: 3472s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_published.py
│ @@ -1127,13 +1127,92 @@
│      return 0 if ok else 1
│
│
│ -def live_grades() -> list[int]:
│ +def grade_scope() -> dict:
│ +    """Kurias klases svetainė skelbia `live` IR ar tas sąrašas perskaitytas.
│ +
│ +    Tai **visų** šio įrankio skaičių rėmas: `grades.json` yra vienintelis
│ +    šaltinis, iš kurio ir `app.js:110` (`g.status === "live"`), ir šis įrankis
│ +    sužino, kurias klases apskritai rodyti. Todėl jo negalima „atsarginio
│ +    varianto“ paversti matavimu:
│ +
│ +    - Iki šiol `live_grades()` bet kokią klaidą (`OSError`, sugadintas JSON,
│ +      tuščias sąrašas) paversdavo `[1]`. Pasekmė matuota 2026-11-24: sugadintas
│ +      `grades.json` **abiejose** pusėse (repo ir gyvai) davė `sutampa`,
│ +      `ok=True` — nes baitai sutapo, o sąrašas buvo tylus. Bet naršyklė
│ +      `registry.js:loadGrades()` tokio failo neįkelia, tad vaikas nemato nė
│ +      vienos klasės: vartai žali, svetainė tuščia (LL-37 — riba, kuri neša
│ +      „viskas gerai“).
│ +    - Antra pusė: klasės katalogas, kurio `grades.json` neskelbia `live`, į
│ +      matavimą nepatenka **nė karto** — nei `local`, nei `published`, nei
│ +      baitai. Dashboard'as (`validate_content.py:404`) skaičiuoja failus
│ +      diske, tad jis rodo daugiau negu svetainė, o įrankis, kurio vienintelis
│ +      klausimas yra „kodėl dashboard rodo daugiau nei svetainė“, apie tai
│ +      tyli. Tai tas pats vaidmens klausimas, tik klases lygmenyje (LL-175).
│ +
│ +    Grąžinama:
│ +      - `grades` — klasės su `status: live` (be atsarginio `[1]`);
│ +      - `checked` — ar sąrašą perskaitėme (be jo jokia išvada negalioja);
│ +      - `error` — kodėl neperskaitė;
│ +      - `missing_index` — `live` klasė be `index.json` repo;
│ +      - `undeclared` — katalogo klasė su moduliais, kurios sąrašas neskelbia.
│ +    """
│ +    out: dict = {"grades": [], "checked": False, "error": "",
│ +                 "missing_index": [], "undeclared": []}
│      try:
│          data = json.loads(GRADES.read_text(encoding="utf-8"))
│ -    except (OSError, json.JSONDecodeError):
│ -        return [1]
│ -    out = [int(g["grade"]) for g in data.get("grades", []) if g.get("status") == "live"]
│ -    return out or [1]
│ +    except (OSError, json.JSONDecodeError) as exc:
│ +        out["error"] = f"content/lt/grades.json: {type(exc).__name__}: {exc}"
│ +        return out
│ +    entries = [g for g in data.get("grades", []) if isinstance(g, dict)]
│ +    if not entries:
│ +        out["error"] = "content/lt/grades.json: sąrašas tuščias"
│ +        return out
│ +    grades: list[int] = []
│ +    for entry in entries:
│ +        try:
│ +            num = int(entry["grade"])
│ +        except (KeyError, TypeError, ValueError):
│ +            out["error"] = out["error"] or (
│ +                f"content/lt/grades.json: įrašas be skaitinio „grade“: {entry!r}")
│ +            continue
│ +        if entry.get("status") == "live":
│ +            grades.append(num)
│ +    out["grades"] = sorted(set(grades))
│ +    # Sąrašas perskaitytas, bet nė viena klasė nei `live`: tai ne „nieko
│ +    # netikrinti“, o svetainė, kurioje nėra ko atidaryti (app.js:110).
│ +    if not out["grades"]:
│ +        out["error"] = out["error"] or (
│ +            "content/lt/grades.json: nė viena klasė neskelbiama „live“")
│ +    out["checked"] = True
│ +    out["missing_index"] = [
│ +        grade_dir(g) for g in out["grades"]
│ +        if not (CONTENT / grade_dir(g) / "index.json").exists()]
│ +    live_set = set(out["grades"])
│ +    for index_path in sorted(CONTENT.glob("grade-*/index.json")):
│ +        name = index_path.parent.name
│ +        try:
│ +            num = int(name.split("-")[1])
│ +        except (IndexError, ValueError):
│ +            continue
│ +        if num in live_set:
│ +            continue
│ +        # Kiek modulių tas katalogas iš tikrųjų turi. Imama iš `index.json`,
│ … omitted 19 diff line(s) across 1 additional file(s)/section(s)
│ scripts/check_published.py
│ @@ -1736,7 +1736,13 @@
│  def report(grades: list[int] | None = None, compare_bytes: bool = True,
│             audio_sample: int | None = None) -> dict:
│      RETRIES["count"] = 0
│ -    grades = grades or live_grades()
│ +    # Kurių klasių apskritai ieškoma — iš `grades.json`, ir tai yra
│ +    # **matavimas**, ne atsarginis variantas (`grade_scope()`). Anksčiau
│ +    # neperskaitytas sąrašas virdavo `[1]`, tad sugadintas `grades.json`
│ +    # abiejose pusėse davė žalią „sutampa“ apie svetainę, kurios naršyklė
│ +    # neįkelia nė vienos klasės.
│ +    scope = grade_scope()
│ +    grades = grades or scope["grades"]
│      # Vienas pigus HEAD prieš viską: jei svetainė neatsiliepia, likusios gyvos
│      # patikros (pagrindiniai failai, svetainės kodas, 1432 garso įrašai) duotų
│      # tik ilgą „nepasiekiama“ sąrašą — vieną gedimą, pakartotą 1451 kartą.
│ scripts/check_published.py
│ @@ -1831,6 +1831,15 @@
│      out = {
│          "grades": per_grade,
│          "live_grades": grades,
│ +        # Klasės sąrašo matavimas (žr. `grade_scope()`). Be jo trys skaičiai
│ +        # (repo / paskelbta / neišstumta) galioja tik sąrašui, kurio niekas
│ +        # neperskaitė: `accounted: False` reiškia, kad rėmas nežinomas, o
│ +        # `undeclared` — kad kataloge yra klasė, kurios sąrašas neskelbia ir
│ +        # kuri į `local`/`published` nepatenka nė karto.
│ +        "scope_checked": scope["checked"],
│ +        "scope_error": scope["error"],
│ +        "grade_scope_missing_index": scope["missing_index"],
│ +        "undeclared_grades": scope["undeclared"],
│          # Suderinta su senuoju formatu (changelog'ai ir dashboard'as skaito šiuos raktus).
│          "local": sum(g.get("local", 0) for g in per_grade),
│          "published": sum(g.get("published", 0) for g in per_grade),
│ scripts/check_published.py
│ @@ -1927,6 +1927,27 @@
│      # atvejis virsdavo „gyva svetainė nepasiekiama“ ir siuntė taisyti ne to.
│      if data.get("repo_error"):
│       

… PRALEISTA 40500 SIMBOLIŲ IŠ 58500 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00515/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

“ tame pačiame `validate.yml`; tas pats laikinas repo dabar duoda rc 1 ir „NESKELBIAMA KLASĖ — grade-02“.
│  - **Įrodymas repo (`scripts/probe_publish_sets.py` → 29/29, rc 0, ~8 s, be tinklo):** N sugadintas sąrašas abiejose pusėse → `scope_checked False`, `live_grades []`, rc 1, išvestyje nėra „Repozitorija: 0“ / „Paskelbta: 0“; O neskelbta klasė su moduliu → `undeclared_grades` ir „grade-02 (1 moduliai)“; P `live` klasė be `index.json` → `missing_index`; Q nė viena `live` → `--path-order` rc 1. Neigiama kontrolė: tas pats zondas prie seno `HEAD` (`git show HEAD:scripts/check_published.py`) N davė `verdict sutampa, klasės [1]`, rc 0, o O krito `KeyError: 'undeclared_grades'` — t. y. lūkesčiai matuoja būtent pataisymą.
│  - **Vartai po pakeitimo:** `validate_content.py --grade 1 --strict` 0/0; `check_registry.py` 0 problemų (index 77 · failai 77 · užduotys 339 · sim 77 · path 77 · našlaičiai 0); `check_refs.py` 27 nuorodos rc 0; `check_docs_facts.py` „Sutampa su failais“; `check_agents.py` rc 0; `check_language.py --grade 1 --strict` 0/0; `check_lessons.py` 183 įrašai (nauja LL-183); zondai 29/29, 20/20, 15/15, 9/9 — visi rc 0; `check_published.py --path-order` rc 0 (77 žingsnių, 4 įterpti į vidurį).
│  - **Kas nepaliesta:** `content/**`, `assets/**`, `docs/**`, `AGENTS.md`; joks modulio ID nepernumeruotas, nieko nešalinta, git push nedarytas (tai bėgiklio darbas).
│ research/wiki/changelog.md
│ @@ -9,8 +9,8 @@
│  - **Defektas — rėmas, kurio niekas neperskaitė (LL-183).** Visi įrankio skaičiai renkami pagal klasių sąrašą iš `content/lt/grades.json`, ir tą patį failą skaito naršyklė (`app.js:110`). Iki šiol `live_grades()` bet kurią klaidą paversdavo atsarginiu `[1]`: matuota 2026-11-24 prieš pataisą — sugadintas `grades.json` **abiejose** pusėse davė `klasės [1], verdict sutampa, ok True` ir rc 0, nors vaikas nematytų nė vienos klasės; katalogas `grade-02` su 1 moduliu, kurio sąrašas neskelbia `live`, į `local`/`published` nepatikdavo nė karto, tad dashboard'as (`validate_content.py:404` skaičiuoja failus diske) rodė daugiau negu svetainė, o įrankis tylėjo — būtent šio vaidmens klausimas, tik klases lygmenyje. Dabar `grade_scope()` matuoja `checked`, `error`, `missing_index` ir `undeclared`; `verdict()` turi keturias naujas priežastis (sąrašas neperskaitytas, `live` klasė be indekso, neskelbiamas katalogas, sąrašo tekstas); `published_measured` nebelieka `True` iš `all([])`; pranešimas pirmiausia sako, koks buvo rėmas (ir ar jį nurodė `--grade N`), o kai sąrašo nėra — „neišmatuota“, ne „0 modulių“.
│  - **Defektas — `--path-order` be nė vienos `live` klasės grąžindavo rc 0 (LL-37).** `rows = [path_order_gate(g) for g in []]`, o `all([])` yra `True`: CI žingsnis „Maršruto tvarka“ būtų praėjęs kiekvieną PR, nieko nematuodamas. Dabar rc 1 su sakinio priežastimi.
│  - **Defektas — ta pati akloji zona prieš push (matuota).** Visi PR vartai eina per `live_grades()`, todėl laikinas repo su `content/lt/grade-02/` (1 modulis, savas indeksas ir `path.json`) praėjo: `validate_content.py --grade 2` rc 1 (tos klasės netikrina), `check_registry.py` rc 0 (eilutę išspausdina, „PROBLEMŲ: 0“), `check_published.py --path-order` rc 0. Toks PR pasiektų svetainę be vieno vartų. Dabar yra `check_published.py --scope` (be tinklo, be git) ir CI žingsnis „Klasės rėmas“ tame pačiame `validate.yml`; tas pats laikinas repo dabar duoda rc 1 ir „NESKELBIAMA KLASĖ — grade-02“.
│ -- **Įrodymas repo (`scripts/probe_publish_sets.py` → 29/29, rc 0, ~8 s, be tinklo):** N sugadintas sąrašas abiejose pusėse → `scope_checked False`, `live_grades []`, rc 1, išvestyje nėra „Repozitorija: 0“ / „Paskelbta: 0“; O neskelbta klasė su moduliu → `undeclared_grades` ir „grade-02 (1 moduliai)“; P `live` klasė be `index.json` → `missing_index`; Q nė viena `live` → `--path-order` rc 1. Neigiama kontrolė: tas pats zondas prie seno `HEAD` (`git show HEAD:scripts/check_published.py`) N davė `verdict sutampa, klasės [1]`, rc 0, o O krito `KeyError: 'undeclared_grades'` — t. y. lūkesčiai matuoja būtent pataisymą.
│ -- **Vartai po pakeitimo:** `validate_content.py --grade 1 --strict` 0/0; `check_registry.py` 0 problemų (index 77 · failai 77 · užduotys 339 · sim 77 · path 77 · našlaičiai 0); `check_refs.py` 27 nuorodos rc 0; `check_docs_facts.py` „Sutampa su failais“; `check_agents.py` rc 0; `check_language.py --grade 1 --strict` 0/0; `check_lessons.py` 183 įrašai (nauja LL-183); zondai 29/29, 20/20, 15/15, 9/9 — visi rc 0; `check_published.py --path-order` rc 0 (77 žingsnių, 4 įterpti į vidurį).
│ +- **Įrodymas repo (`scripts/probe_publish_sets.py` → 31/31, rc 0, ~9 s, be tinklo):** N sugadintas sąrašas abiejose pusėse → `scope_checked False`, `live_grades []`, rc 1, išvestyje nėra „Repozitorija: 0“ / „Paskelbta: 0“; O neskelbta klasė su moduliu → `undeclared_grades` ir „grade-02 (1 moduliai)“, O2 tas pats per `--scope` → rc 1 ir „NESKELBIAMA KLASĖ — grade-02“; P `live` klasė be `index.json` → `missing_index`; Q nė viena `live` → `--path-order` rc 1. Neigiama kontrolė: tas pats zondas prie seno `HEAD` (`git show HEAD:scripts/check_published.py`) N davė `verdict sutampa, klasės [1]`, rc 0 (3 klaidos), o O2 režimo sename įrankyle nėra — t. y. lūkesčiai matuoja būtent pataisymą.
│ +- **Vartai po pakeitimo:** `validate_content.py --grade 1 --strict` 0/0; `check_registry.py` 0 problemų (index 77 · failai 77 · užduotys 339 · sim 77 · path 77 · našlaičiai 0); `check_refs.py` 27 nuorodos rc 0; `check_docs_facts.py` „Sutampa su failais“; `check_agents.py` rc 0; `check_language.py --grade 1 --strict` 0/0; `check_lessons.py` 183 įrašai (nauja LL-183); `curriculum_backlog.py --check` rc 0; zondai 31/31, 20/20, 15/15, 9/9 — visi rc 0; `check_published.py --path-order` rc 0 (77 žingsnių, 4 įterpti į vidurį); `check_published.py --scope` rc 0.
│  - **Kas nepaliesta:** `content/**`, `assets/**`, `docs/**`, `AGENTS.md`; joks modulio ID nepernumeruotas, nieko nešalinta, git push nedarytas (tai bėgiklio darbas).
│  - **Sprendimas: `sutampa`.** Repo 77 / paskelbta 77, visi baitai ir garsas 2 224/2 224 abiejose pusėse, gyva versija = `HEAD` = `0793e83d`, 0 neišstumtų commit'ų.
│
│ scripts/check_published.py
│ @@ -426,6 +426,7 @@
│      python3 scripts/check_published.py --grade 1     # viena klasė
│      python3 scripts/check_published.py --no-bytes    # greita: tik ID ir seka
│      python3 scripts/check_published.py --path-order   # be tinklo: tik maršruto tvarka (CI)
│ +    python3 scripts/check_published.py --scope        # be tinklo: tik klasių rėmas (CI)
│      python3 scripts/check_published.py --audio-full  # tas pats kaip numatyta
│      python3 scripts/check_published.py --audio-sample 48   # greitas, aklas
│  """
│ agents/proposals/2026-11-24-publikavimo-agentas-neskelbiama-klase-registry.json
│ @@ -0,0 +1,19 @@
│ +{
│ +  "role": "publikavimo-agentas",
│ +  "run_id": 515,
│ +  "created": "2026-11-24T20:25:00+02:00",
│ +  "type": "struktura",
│ +  "title": "check_registry.py išspausdina neskelbiamos klasės eilutę, bet „PROBLEMŲ: 0“ — modulis svetainėje yra, o vaikas jo nepasieks",
│ +  "body": "`scripts/check_registry.py` eina per visus `content/lt/grade-*/index.json` katalogus, tad neskelbiamą klasę jis mato ir išspausdina (matuota 2026-11-24 laikiname repo su `content/lt/grade-02/`: eilutė „grade-02: kryptys 1 · index 1 · failai 1 · užduotys 1 (optional 1) · sim 1 · path 1 · našlaičiai 0“), bet `PROBLEMŲ: 0` ir rc 0, nes į `problems` įtraukiami tik trūkstami failai, ID neatitikimai, našlaičiai ir `path.json` aibė. Tuo tarpu `validate_content.py` tokios klasės nepatikrina visai (ciklas eina tik per `status: live`, `validate_content.py:409`), o `check_published.py` iki #515 ėjo per tą patį sąrašą. Pasekmė: PR, kuris atneša naujos klasės katalogą nepakeitęs `grades.json`, praeina visus vartus, `pages.yml` nukopijuoja visą `content/`, ir moduliai svetainėje yra, bet naršyklė jų niekada neprašo — vaikas jų nepasieks, o dashboard'as (`validate_content.py:404` skaičiuoja failus diske) juos skaičiuos. #515 uždėjo atskirą vartą (`check_published.py --scope` ir CI žingsnį „Klasės rėmas“), bet pats `check_registry.py` tebėra tyli žalia apie tą patį faktą. Siūloma: kai `grade_dir.name` klasė nėra `grades.json` `status: live` (ar `planned`), o kataloge yra modulių, `check_registry.py` turi tai rašyti į `problems` su sakiniu, ką daryti (įrašyti į `grades.json` arba nelaikyti katalogo `content/`) — kitaip įrankis, kurio eilutė jau rodo defektą, moko skaityti tik skaičių „PROBLEMŲ“. Tai ta pati šeima kaip #404 (našlaitis buvo spausdinamas, bet neįtrauktas į `problems`) ir LL-37.",
│ +  "target": "scripts/check_registry.py",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "Matuota 2026-11-24 laikiname repo (git archive HEAD + grade-02 su 1 moduliu, savu index.json ir path.json): check_registry.py → rc 0, „grade-02: kryptys 1 · index 1 … našlaičiai 0“, „PROBLEMŲ: 0“",
│ +    "Tas pats laikinas repo: check_published.py --path-order → rc 0 (77 žingsnių, grade-01)",
│ +    "scripts/validate_content.py:409 — `live_grades` ėmimas, ciklas eina tik per `status: live`, tad grade-02 nepatikrinta visai",
│ +    "scripts/check_registry.py:86–95 — našlaitis įtraukiamas į `problems` (#404 pataisa), o klasės deklaracijos patikros nėra",
│ +    "scripts/check_published.py (#515) — `grade_scope()` ir `--scope` CI žingsnis matuoja tą patį faktą, bet kitame įrankyje",
│ +    "docs/SVIETIMAS-1-GAIRES.md T3.6 / AGENTS.md — publikavimas neturi prarasti nė vieno modulio; nematomas modulis prarandamas tyliai"
│ +  ]
│ +}
Done. Decision: **sutampa** — and I closed a real silent-green in my own tool while confirming it.

WHAT WAS VERIFIED (real tool output, not narration)

check_published.py (rc 0)
  Repozitorija: 77 moduliai · Klasės: grade-01 (status „live“) · Paskelbta: 77
  visi sąrašai [] (missing_on_live, hidden_locally, not_in_path, orphan_files,
  missing_in_repo, live_missing, stale*, aux_*, shell_*); path_reordered []
  path_inserted_midsequence 4 (14-veikejas-pagal-teksta, 41-augalo-dalys,
  08-avalynes-dziovinimas, 09-austinis-ir-megztas-audinys — įterpti į vidurį,
  leidžiama); garsas 2 224/2 2 224 · vardai 2 224/2 224 · dydžiai 2 224/2 224;
  svetainės kodas 19; live_version = repo_version = 0793e83d; neišstumta 0

3 gyvi adresai (curl)
  matematika/04-skaiciu-tiese.json → 200
  lietuviu-kalba/03-sakinio-zodziai.json → 200
  pasaulio-pazinimas/10-gyvunu-grupes.json → 200

DEFECT FOUND AND FIXED (scripts/check_published.py)

The frame every number hangs on — the class list from `content/lt/grades.json`,
which `app.js:110` also reads — was never measured. Measured before the fix:
a corrupted `grades.json` on *both* sides gave `klasės [1], verdict sutampa,
ok True`, rc 0, though the browser would open no class at all; and a
`content/lt/grade-02/` catalog with a module that `grades.json` doesn't declare
`live` was outside every count — dashboard shows it, site doesn't, tool silent.
That is literally this role's question, one level up.

Now: `grade_scope()` (checked/error/missing_index/undeclared), four new verdict
reasons, `published_measured` no longer `True` from `all([])`, report states its
frame and says "neišmatuota" instead of "0 modulių", and a network-free
`--scope` mode wired into CI ("Klasės rėmas" in validate.yml) — because I
measured that a PR adding a whole undeclared class passed every pre-push gate
(check_registry rc 0, --path-order rc 0).

Evidence: probe_publish_sets.py 31/31 rc 0 (N, O, O2, P, Q new). Same probe
against `git show HEAD:scripts/check_published.py` fails N with
`verdict sutampa, klasės [1]`, rc 0. LL-183 added to pamokos.md; changelog entry
written. Gates after: validate 0/0, registry 0 problems, refs 27 rc 0,
docs_facts "Sutampa", agents rc 0, lessons 183, language 0/0, backlog rc 0,
CI imitation rc 0.

Untouched: content/**, assets/**, docs/**, AGENTS.md; no ID renumbered, nothing
deleted, no push (runner's job). One proposal filed: check_registry.py prints the
undeclared-class line yet reports "PROBLEMŲ: 0".

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-ce0c14b6111c6f3890feb02ff648f9f878c63e2e7780a13f6f07360faefff408
```
