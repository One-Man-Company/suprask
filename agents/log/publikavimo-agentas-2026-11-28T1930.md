# publikavimo-agentas — 2026-11-28T1930

- paleidimas: #609 (manual)
- trukmė: 3328s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_published.py
│ @@ -612,12 +612,34 @@
│      ("content/audio-overrides.json", ROOT / "content" / "audio-overrides.json"),
│  ]
│
│ -# Katalogai ir failai, kuriuos `pages.yml` įkelia į svetainę (`cp -r assets
│ -# content`, `cp index.html 404.html`). Imami iš publikavimo sutarties, ne iš
│ -# atminties: `coverage()` tikrina, ar kiekvienas publikuojamas failas turi savo
│ -# matavimą, tad sąrašas turi būti tas pats, kurį naudoja publikavimas.
│ +# Katalogai, kuriuos `pages.yml` įkelia į svetainę (`cp -r assets content`).
│ +# Imami iš publikavimo sutarties, ne iš atminties: `coverage()` tikrina, ar
│ +# kiekvienas publikuojamas failas turi savo matavimą, tad sąrašas turi būti tas
│ +# pats, kurį naudoja publikavimas.
│  PUBLISHED_ROOTS = ("assets", "content")
│ -PUBLISHED_SINGLE = ("index.html", "404.html")
│ +
│ +
│ +def root_pages() -> list[str]:
│ +    """Šaknies HTML puslapiai — iš disko, ne iš ranka rašyto sąrašo.
│ +
│ +    Kodėl funkcija, o ne konstanta. Iki #609 sąrašas buvo dvi eilutės
│ +    (`("index.html", "404.html")`) trijose vietose: `PUBLISHED_SINGLE`,
│ +    `SHELL_GLOBS` ir `pages.yml` `cp`. Matuota 2026-11-28: įdėjus trečią
│ +    šaknies puslapį (`apie-zondas.html`, 34 B), `code_pages()` jo nematė,
│ +    `published_files()` ir `measured_files()` — irgi, `coverage().unmeasured`
│ +    liko `[]`, `published_count` liko 2843, o `pages.yml` surinkimo žingsnis
│ +    (`cp index.html 404.html _site/`) jo į `_site` neįkėlė nė vienu failu.
│ +    Tai trejopai tyli spraga: failas yra repo, jo **nėra** svetainėje, ir
│ +    nė vienas vartas apie jį nieko nesako (LL-242).
│ +
│ +    Imama iš `ROOT` kiekvieną kvietimą, ne importo metu: zondai perjungia
│ +    `cp.ROOT` į laikiną repo, ir importo metu sustingusi konstanta matuotų
│ +    tikrą repo (LL-36 atvirkštinė pusė). Slapti failai (`.probe-*.html`,
│ +    `.gitignore`) praleidžiami: `pages.yml` jų neįkelia, nes `cp ./*.html`
│ +    jų nesugriebia.
│ +    """
│ +    return sorted(p.name for p in ROOT.glob("*.html")
│ +                  if p.is_file() and not p.name.startswith("."))
│
│  # Svetainės kodas, kuris vykdomas naršyklėje. `content/` baitai sako, ką vaikas
│  # turėtų matyti, bet ne ką jis iš tikrųjų vykdo: simuliacijos, maršrutizatorius
│ scripts/check_published.py
│ @@ -646,13 +646,18 @@
│  # ir stilius gyvena `assets/`. Nepaskelbtas `assets/js/sims/*.js` pataisymas
│  # anksčiau likdavo nematomas — visi modulių baitai sutapdavo (LL-83).
│  SHELL_GLOBS = [
│ -    ("index.html", None),
│ -    # `404.html` irgi įkeliamas naršyklės: tai puslapis, kurį vaikas pamato,
│ -    # kai modulio adresas neteisingas arba failas nepaskelbtas. Jis kopijuojamas
│ -    # į svetainę (`pages.yml`: `cp index.html 404.html _site/`), bet nebuvo nė
│ -    # viename varte — #306 paliko tai atviru, #308 įrodė zondą: veidrodis su
│ -    # 563 B → 594 B `404.html` davė rc 0 ir „sutampa“, nors gyvas failas kitas.
│ -    ("404.html", None),
│ +    # Šaknies HTML puslapiai — iš disko (`root_pages()`), ne trys ranka
│ +    # įrašytos eilutės. `404.html` taip pat įkeliamas naršyklės: tai puslapis,
│ +    # kurį vaikas pamato, kai modulio adresas neteisingas arba failas
│ +    # nepaskelbtas. Jis kopijuojamas į svetainę, bet nebuvo nė viename varte —
│ +    # #306 paliko tai atviru, #308 įrodė zondą: veidrodis su 563 B → 594 B
│ +    # `404.html` davė rc 0 ir „sutampa“, nors gyvas failas kitas.
│ +    #
│ +    # Nuo #609 sąrašas imamas iš disko: naujas šaknies puslapis („Apie“,
│ +    # spausdinimo versija) įsijungia į matavimą tame pačiame commit'e, kuriame
│ +    # atsiranda. Ranka rašytas dviejų eilučių sąrašas buvo toje pačioje
│ +    # spragoje, kurią #607 taisė kodo žymėms (LL-240, LL-242).
│ +    *((name, None) for name in root_pages()),
│      ("assets/js", "*.js"),
│      ("assets/css", "*.css"),
│  ]
│ scripts/check_published.py
│ @@ -646,18 +646,16 @@
│  # ir stilius gyvena `assets/`. Nepaskelbtas `assets/js/sims/*.js` pataisymas
│  # anksčiau likdavo nematomas — visi modulių baitai sutapdavo (LL-83).
│  SHELL_GLOBS = [
│ -    # Šaknies HTML puslapiai — iš disko (`root_pages()`), ne trys ranka
│ -    # įrašytos eilutės. `404.html` taip pat įkeliamas naršyklės: tai puslapis,
│ -    # kurį vaikas pamato, kai modulio adresas neteisingas arba failas
│ -    # nepaskelbtas. Jis kopijuojamas į svetainę, bet nebuvo nė viename varte —
│ -    # #306 paliko tai atviru, #308 įrodė zondą: veidrodis su 563 B → 594 B
│ -    # `404.html` davė rc 0 ir „sutampa“, nors gyvas failas kitas.
│ +    # Šaknies HTML puslapiai čia **neišvardijami** — jie imami `root_pages()`
│ +    # kiekvieną kvietimą (žr. `shell_files()` ir `code_pages()`). Konstanta
│ +    # importo metu užšaldytų sąrašą, o zondai perjungia `ROOT` į laikiną repo:
│ +    # sustingusi reikšmė matuotų tikrą repo (LL-36 atvirkštinė pusė).
│      #
│ -    # Nuo #609 sąrašas imamas iš disko: naujas šaknies puslapis („Apie“,
│ -    # spausdinimo versija) įsijungia į matavimą tame pačiame commit'e, kuriame
│ -    # atsiranda. Ranka rašytas dviejų eilučių sąrašas buvo toje pačioje
│ -    # spragoje, kurią #607 taisė kodo žymėms (LL-240, LL-242).
│ -    *((name, None) for name in root_pages()),
│ +    # `404.html` taip pat įkeliamas naršyklės: tai puslapis, kurį vaikas
│ +    # pamato, kai modulio adresas neteisingas arba failas nepaskelbtas. Jis
│ +    # kopijuojamas į svetainę, bet nebuvo nė viename varte — #306 paliko tai
│ +    # atviru, #308 įrodė zondą: veidrodis su 563 B → 594 B `404.html` davė
│ +    # rc 0 ir „sutampa“, nors gyvas failas kitas.
│      ("assets/js", "*.js"),
│      ("assets/css", "*.css"),
│  ]
│ scripts/check_published.py
│ @@ -2107,10 +2107,11 @@
│
│
│  def shell_files() -> list[str]:
│ -    """Svetainės failai, kuriuos naršyklė įkelia (`index.html`, JS, CSS, kiti `assets/`).
│ +    """Svetainės failai, kuriuos naršyklė įkelia (HTML puslapiai, JS, CSS, kiti `assets/`).
│
│      Sąrašas imamas iš katalogų, ne įrašomas ranka: nauja simuliacija
│ -    `assets/js/si

… PRALEISTA 26326 SIMBOLIŲ IŠ 44326 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00609/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

disko kiekvieną kvietimą** (ne importo metu: zondai perjungia `ROOT`), slapti `.probe-*` neįtraukiami; `SHELL_GLOBS` nebeturi puslapių, `shell_files()` ir `code_pages()` prideda `root_pages()`, `published_files()` irgi; `PUBLISHED_SINGLE` pašalintas. (2) `.github/workflows/pages.yml`: surinkimo žingsnis kopijuoja **visus** šaknies `*.html` (`find . -maxdepth 1 -name "*.html" -not -name ".*"`), ne du vardus — tas pats šablonas, kurį skaito įrankis. (3) naujas `scripts/probe_root_pages.py`.
│ -- **Įrodymas (`scripts/probe_root_pages.py`, 14/14, rc 0, < 0,5 s, be tinklo).** Zondas stato laikiną repo su trimis puslapiais ir slaptu `.probe-x.html`, paleidžia **tikrą** `pages.yml` surinkimo žingsnį (`bash -euo pipefail`) ir tikrina **tikrus** vartus: 1 — `root_pages()` `['index.html','404.html']`; 2 — `code_pages()` mato trečią, slapto nemato; 3 — `published_files()`, `measured_files()`, `coverage().unmeasured == []` sutaria; 4 — į `_site` pateko visi trys ir `assets`/`content`; 5 — **neigiama kontrolė**: senasis `cp index.html 404.html` pameta trečią; 6 — ketvirtas puslapis įsijungia **be kodo pakeitimo**, o surinkimas jį įkelia; 7 — po zondo `ROOT` grąžintas ir matuojama kaip anksčiau. **Dvi neigiamos kontrolės prieš seną kodą:** su `git show HEAD:scripts/check_published.py` → rc 1 („neturi `root_pages`“); su nauju įrankiu ir senu `pages.yml` → **10/14**, krenta būtent 1, 4, 6 ir 7 lūkesčiai (t. y. defektas buvo realus, ne teorinis).
│ +- **Įrodymas (`scripts/probe_root_pages.py`, 14/14, rc 0, < 0,5 s, be tinklo).** Zondas stato laikiną repo su trimis puslapiais ir slaptu `.probe-x.html`, paleidžia **tikrą** `pages.yml` surinkimo žingsnį (`bash -euo pipefail`) ir tikrina **tikrus** vartus: 1 — `root_pages()` `['index.html','404.html']`; 2 — `code_pages()` mato trečią, slapto nemato; 3 — `published_files()`, `measured_files()`, `coverage().unmeasured == []` sutaria; 4 — į `_site` pateko visi trys ir `assets`/`content`; 5 — **neigiama kontrolė**: senasis `cp index.html 404.html` pameta trečią; 6 — ketvirtas puslapis įsijungia **be kodo pakeitimo**, o surinkimas jį įkelia; 7 — po zondo `ROOT` grąžintas ir matuojama kaip anksčiau. **Dvi neigiamos kontrolės prieš seną kodą:** su `git show HEAD:scripts/check_published.py` → rc 1 („neturi `root_pages`“); su nauju įrankiu ir senu `pages.yml` → **12/14**, krenta būtent 4 ir 6 lūkesčiai (trečias ir ketvirtas puslapis į `_site` nepatenka, t. y. defektas buvo realus, ne teorinis).
│  - **Vartai po pakeitimo.** `validate_content.py --grade 1 --strict` **0/0** rc 0 · `check_registry.py --grade 1` index 89 / failai 89 / užduotys 394 / sim 89 / path 89 / našlaičiai 0, **PROBLEMŲ 0** · `check_docs_facts.py` **0 klaidų, 0 įspėjimų** „Sutampa su failais“ · `check_lessons.py` **242 įrašai** (LL-242) · `check_language.py --grade 1 --strict` 89 moduliai, 0/0 · `check_refs.py` 26 nuorodos, visos į esantį failą · `check_ui.py` 0/0 · `check_art.py` 9 sim failai + legacy 1 · `check_audio.py` 1 365 tekstų / 2 730 įrašų / 2 730 mp3 · `check_agents.py` rc 0 (1 senas įspėjimas) · `curriculum_backlog.py --check` 47 pozicijų, 1 be modulio · `check_published.py --scope` ir `--path-order` ✔ · **visi 31** `probe_*.py` rc 0 (`probe_root_pages` 14/14, `probe_shell_version` 25/25, `probe_publish_sets` 63/63, `probe_path_order` 31/31).
│  - **Sprendimas: IŠTAISYTA** (`scripts/check_published.py`, `.github/workflows/pages.yml`, `scripts/probe_root_pages.py`, `research/wiki/guidelines/pamokos.md`, `research/wiki/changelog.md`). Turinys sutampa 89/89 prieš ir po — raudona nebuvo; pataisyta tai, kad **trečias puslapis** būtų likęs repo ir nepatekęs į svetainę be nė vieno varto. Ko neteigiu: kad svetainėje yra toks puslapis — jo nėra, tai buvo spragos matavimas, ne defektas vaikui šiandien.
│  - **Neliesta.** `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, modulio ID, `index.json` / `path.json` / `grades.json`, garsas, kitų vaidmenų failai. Niekas nešalinta, joks ID nepernumeruotas, jokio `git push` iš agento (bėgiklio darbas). `agents/state.json` — `.gitignore`.
│ research/wiki/changelog.md
│ @@ -10,7 +10,7 @@
│  - **Defektas, kurio nematė nė vienas vartas, ir jis platesnis nei #607 (LL-242).** #607 sutvarkė `?v=` žymes ir vardiklį „N/M“, bet abu rėmėsi **ranka rašytu** puslapių sąrašu, pakartotu trijose vietose: `PUBLISHED_SINGLE`, `SHELL_GLOBS`, `pages.yml` `cp index.html 404.html _site/`. Matuota šiame darbe laikiname repo: įdėjus trečią šaknies puslapį (`apie.html`, 34 B) — `code_pages()` grąžino `['404.html', 'index.html']`, `published_files()` ir `measured_files()` jo neturėjo, `coverage().unmeasured` liko `[]`, `published_count` liko **2843**, o surinkimo žingsnis į `_site` įkėlė **2 puslapius iš 3**. Trys teiginiai apie tą pačią aibę ir nė vienas nemato failo: `coverage()` lygino ranka rašytą aibę su ja pačia sudaryta aibe (LL-202 atmaina), o `pages.yml` kopijavo du vardus.
│  - **Ką pakeičiau (turinio, `index.json`, `path.json`, simuliacijų, CSS, garso nelietęs).** (1) `scripts/check_published.py`: `root_pages()` — šaknies `*.html` skaitomi **iš disko kiekvieną kvietimą** (ne importo metu: zondai perjungia `ROOT`), slapti `.probe-*` neįtraukiami; `SHELL_GLOBS` nebeturi puslapių, `shell_files()` ir `code_pages()` prideda `root_pages()`, `published_files()` irgi; `PUBLISHED_SINGLE` pašalintas. (2) `.github/workflows/pages.yml`: surinkimo žingsnis kopijuoja **visus** šaknies `*.html` (`find . -maxdepth 1 -name "*.html" -not -name ".*"`), ne du vardus — tas pats šablonas, kurį skaito įrankis. (3) naujas `scripts/probe_root_pages.py`.
│  - **Įrodymas (`scripts/probe_root_pages.py`, 14/14, rc 0, < 0,5 s, be tinklo).** Zondas stato laikiną repo su trimis puslapiais ir slaptu `.probe-x.html`, paleidžia **tikrą** `pages.yml` surinkimo žingsnį (`bash -euo pipefail`) ir tikrina **tikrus** vartus: 1 — `root_pages()` `['index.html','404.html']`; 2 — `code_pages()` mato trečią, slapto nemato; 3 — `published_files()`, `measured_files()`, `coverage().unmeasured == []` sutaria; 4 — į `_site` pateko visi trys ir `assets`/`content`; 5 — **neigiama kontrolė**: senasis `cp index.html 404.html` pameta trečią; 6 — ketvirtas puslapis įsijungia **be kodo pakeitimo**, o surinkimas jį įkelia; 7 — po zondo `ROOT` grąžintas ir matuojama kaip anksčiau. **Dvi neigiamos kontrolės prieš seną kodą:** su `git show HEAD:scripts/check_published.py` → rc 1 („neturi `root_pages`“); su nauju įrankiu ir senu `pages.yml` → **12/14**, krenta būtent 4 ir 6 lūkesčiai (trečias ir ketvirtas puslapis į `_site` nepatenka, t. y. defektas buvo realus, ne teorinis).
│ -- **Vartai po pakeitimo.** `validate_content.py --grade 1 --strict` **0/0** rc 0 · `check_registry.py --grade 1` index 89 / failai 89 / užduotys 394 / sim 89 / path 89 / našlaičiai 0, **PROBLEMŲ 0** · `check_docs_facts.py` **0 klaidų, 0 įspėjimų** „Sutampa su failais“ · `check_lessons.py` **242 įrašai** (LL-242) · `check_language.py --grade 1 --strict` 89 moduliai, 0/0 · `check_refs.py` 26 nuorodos, visos į esantį failą · `check_ui.py` 0/0 · `check_art.py` 9 sim failai + legacy 1 · `check_audio.py` 1 365 tekstų / 2 730 įrašų / 2 730 mp3 · `check_agents.py` rc 0 (1 senas įspėjimas) · `curriculum_backlog.py --check` 47 pozicijų, 1 be modulio · `check_published.py --scope` ir `--path-order` ✔ · **visi 31** `probe_*.py` rc 0 (`probe_root_pages` 14/14, `probe_shell_version` 25/25, `probe_publish_sets` 63/63, `probe_path_order` 31/31).
│ +- **Vartai po pakeitimo.** `validate_content.py --grade 1 --strict` **0/0** rc 0 · `check_registry.py --grade 1` index 89 / failai 89 / užduotys 394 / sim 89 / path 89 / našlaičiai 0, **PROBLEMŲ 0** · `check_docs_facts.py` **0 klaidų, 0 įspėjimų** „Sutampa su failais“ · `check_lessons.py` **242 įrašai** (LL-242) · `check_language.py --grade 1 --strict` 89 moduliai, 0/0 · `check_refs.py` 26 nuorodos, visos į esantį failą · `check_ui.py` 0/0 · `check_art.py` 9 sim failai + legacy 1 · `check_audio.py` 1 365 tekstų / 2 730 įrašų / 2 730 mp3 · `check_agents.py` rc 0 (1 senas įspėjimas) · `curriculum_backlog.py --check` 47 pozicijų, 1 be modulio · `check_published.py --scope` ir `--path-order` ✔ · **visi 32** `probe_*.py` rc 0 (`probe_root_pages` 14/14, `probe_shell_version` 25/25, `probe_publish_sets` 63/63, `probe_path_order` 31/31).
│  - **Sprendimas: IŠTAISYTA** (`scripts/check_published.py`, `.github/workflows/pages.yml`, `scripts/probe_root_pages.py`, `research/wiki/guidelines/pamokos.md`, `research/wiki/changelog.md`). Turinys sutampa 89/89 prieš ir po — raudona nebuvo; pataisyta tai, kad **trečias puslapis** būtų likęs repo ir nepatekęs į svetainę be nė vieno varto. Ko neteigiu: kad svetainėje yra toks puslapis — jo nėra, tai buvo spragos matavimas, ne defektas vaikui šiandien.
│  - **Neliesta.** `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, modulio ID, `index.json` / `path.json` / `grades.json`, garsas, kitų vaidmenų failai. Niekas nešalinta, joks ID nepernumeruotas, jokio `git push` iš agento (bėgiklio darbas). `agents/state.json` — `.gitignore`.
│
Baigta. Rezultatas — failai repo; `git push` nedarytas (bėgiklio darbas).

check_published.py (numatytasis režimas, rc 0)
  Repozitorija: 89 moduliai · Paskelbta: 89 (grade-01: repo 89, gyvai 89)
  Neišstumta commit'ų: 0 · missing_on_live 0 · hidden_locally 0 · not_in_path 0
  · orphan_files 0 · stale 0 · seka 89/89 · versija 02293808 abiejose pusėse
  · kodo nuorodos su ?v=: 3/3 · garsas 2730/2730 (dydžiai = Content-Length,
  vardo maišas = baitai ir tekstas) · rėmas 2843 failai
  Sprendimas: sutampa

Gyvi adresai (curl)
  42-transporto-priemone-marsrutui.json → 200 (10 034 B)
  03-sakinio-zodziai.json              → 200 (5 459 B)
  04-skaiciu-tiese.json                → 200 (4 972 B)
  404.html → 200 · index.html → 200
  neigiama kontrolė 99-nera.json       → 404 (4 301 B)
  Chromium @390/@1440: abu puslapiai stilingi, `main.css?v=02293808`, 0 pageerror,
  horizontali slinktis 0.

Sprendimas: IŠTAISYTA (scripts/check_published.py, .github/workflows/pages.yml,
scripts/probe_root_pages.py, research/wiki/guidelines/pamokos.md,
research/wiki/changelog.md)

Kodėl, nors turinys sutapo: #607 sutvarkė `?v=` žymes, bet puslapių sąrašas
liko ranka rašytas TRIJOSE vietose (`PUBLISHED_SINGLE`, `SHELL_GLOBS`,
`pages.yml` `cp index.html 404.html`). Matuota laikiname repo: įdėjus trečią
šaknies puslapį (`apie.html`, 34 B), `code_pages()` jo nematė, `published_files()`
ir `measured_files()` neturėjo, `coverage().unmeasured` liko `[]`,
`published_count` liko 2843, o surinkimas į `_site` įkėlė 2 puslapius iš 3.
Failas repo → nėra svetainėje → nė vienas vartas nesako.

Kas pakeista
  1. `root_pages()` — šaknies `*.html` skaitomi iš disko kiekvieną kvietimą
     (ne importo metu: zondai perjungia `ROOT`); slapti `.probe-*` neįtraukiami.
     `shell_files()`, `code_pages()`, `published_files()` visi naudoja ją.
  2. `pages.yml` surinkimas: `find . -maxdepth 1 -name "*.html" -not -name ".*"`
     — tas pats šablonas, kurį skaito įrankis, tad surinkimas ir matavimas
     nebegali išsiskirti.
  3. Naujas `scripts/probe_root_pages.py`.

Įrodymas: `probe_root_pages.py` 14/14, rc 0, <0,5 s, be tinklo — paleidžia
TIKRĄ `pages.yml` surinkimo žingsnį ir TIKRUS vartus; 5-as lūkestis yra
neigiama kontrolė (senasis `cp` pameta trečią puslapį), 6-as — ketvirtas
puslapis įsijungia be kodo pakeitimo. Prieš seną kodą: su
`git show HEAD:scripts/check_published.py` → rc 1 („neturi `root_pages`");
su senu `pages.yml` → 12/14 (krenta 4 ir 6).

Vartai: validate_content --grade 1 --strict 0/0 · check_registry PROBLEMŲ 0
(89/89/394/89/89) · check_docs_facts 0/0 · check_lessons 242 (LL-242) ·
check_language --strict 0/0 · check_refs 26/26 · check_ui 0/0 · check_art ✔ ·
check_audio 1365/2730/2730 · check_agents rc 0 · curriculum_backlog ✔ ·
--scope ✔ · --path-order ✔ · visi 32 probe_*.py rc 0.

Nauja pamoka: LL-242 — sąrašas, kuris sutampa trijose vietose, bet nė viena jo
neskaito iš disko. Neliesta: content/**, assets/**, docs/**, AGENTS.md, modulio
ID, index/path/grades, garsas, kitų vaidmenų failai.

## klaidos

```
session_id: local-c563da754a39eee11dfc88d432bcd56a41293fdb5e6a67f2b23d15d4fa8cdfce
```
