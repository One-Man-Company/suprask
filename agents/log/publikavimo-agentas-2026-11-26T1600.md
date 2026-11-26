# publikavimo-agentas — 2026-11-26T1600

- paleidimas: #558 (manual)
- trukmė: 1783s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_published.py
│ @@ -503,7 +503,23 @@
│  AUX_FILES = [
│      ("content/lt/grades.json", CONTENT / "grades.json"),
│      ("assets/audio/lt/manifest.json", ROOT / "assets" / "audio" / "lt" / "manifest.json"),
│ +    # `content/audio-overrides.json` — tarimo korekcijos, kurias skaito
│ +    # `scripts/generate_audio.py`. Naršyklė jo neįkelia, bet `pages.yml`
│ +    # kopijuoja **visą** `content/`, tad failas svetainėje yra. Iki #558 jo
│ +    # nematavo nė vienas vartas: `check_audio()` ima mp3 iš manifesto,
│ +    # modulių ciklas eina per `content/lt/<klasė>/`, o `content/` šaknis liko
│ +    # už visų sąrašų. Tai ne kosmetika — tai įrodo, kad vartų rėmas buvo
│ +    # „failai, kuriuos naršyklė įkelia“, o ne „failai, kuriuos svetainė
│ +    # publikuoja“ (LL-84 šeima). `coverage()` žemiau šią spragą dar ir matuoja.
│ +    ("content/audio-overrides.json", ROOT / "content" / "audio-overrides.json"),
│  ]
│ +
│ +# Katalogai ir failai, kuriuos `pages.yml` įkelia į svetainę (`cp -r assets
│ +# content`, `cp index.html 404.html`). Imami iš publikavimo sutarties, ne iš
│ +# atminties: `coverage()` tikrina, ar kiekvienas publikuojamas failas turi savo
│ +# matavimą, tad sąrašas turi būti tas pats, kurį naudoja publikavimas.
│ +PUBLISHED_ROOTS = ("assets", "content")
│ +PUBLISHED_SINGLE = ("index.html", "404.html")
│
│  # Svetainės kodas, kuris vykdomas naršyklėje. `content/` baitai sako, ką vaikas
│  # turėtų matyti, bet ne ką jis iš tikrųjų vykdo: simuliacijos, maršrutizatorius
│ scripts/check_published.py
│ @@ -1584,10 +1584,7 @@
│
│  def strip_version(text: str) -> str:
│      """Nuima `?v=<commit>` — publikavimo žymą, ne turinio skirtumą."""
│ -    return VERSION_PARAM.sub("", text)
│ -
│ -
│ -def _shell_state(rel: str) -> tuple[str, int, int]:
│ +    return VERSION_PARAM.sub("", text)def _shell_state(rel: str) -> tuple[str, int, int]:
│      """("ok"|"differs"|"gone"|"unreachable", repo baitai, gyvi baitai)."""
│      local_path = ROOT / rel
│      if not local_path.exists():
│ scripts/check_published.py
│ @@ -1584,7 +1584,10 @@
│
│  def strip_version(text: str) -> str:
│      """Nuima `?v=<commit>` — publikavimo žymą, ne turinio skirtumą."""
│ -    return VERSION_PARAM.sub("", text)def _shell_state(rel: str) -> tuple[str, int, int]:
│ +    return VERSION_PARAM.sub("", text)
│ +
│ +
│ +def _shell_state(rel: str) -> tuple[str, int, int]:
│      """("ok"|"differs"|"gone"|"unreachable", repo baitai, gyvi baitai)."""
│      local_path = ROOT / rel
│      if not local_path.exists():
│ scripts/check_published.py
│ @@ -1585,6 +1585,79 @@
│  def strip_version(text: str) -> str:
│      """Nuima `?v=<commit>` — publikavimo žymą, ne turinio skirtumą."""
│      return VERSION_PARAM.sub("", text)
│ +
│ +
│ +def published_files() -> set[str]:
│ +    """Visi failai, kuriuos `pages.yml` įkelia į svetainę (be `AGENTS.md`).
│ +
│ +    Tai **publikavimo sutartis**, o ne sąrašas to, ką įrankis moka matuoti.
│ +    Skirtumas paaiškėjo #558: `content/audio-overrides.json` buvo svetainėje
│ +    (200, tie patys baitai), o jo nematuė nė vienas vartas — `check_audio()`
│ +    ima mp3 iš manifesto, modulių ciklas eina per `content/lt/<klasė>/`,
│ +    `shell_files()` — per `assets/`. `content/` šaknis liko tarp šių sąrašų.
│ +    `coverage()` lygina šią aibę su matuojamų failų aibe, tad naujas
│ +    publikuojamas failas be matavimo nebelieka tyliai žalias (LL-37, LL-84).
│ +    """
│ +    out: set[str] = {name for name in PUBLISHED_SINGLE if (ROOT / name).exists()}
│ +    for root in PUBLISHED_ROOTS:
│ +        base = ROOT / root
│ +        if not base.is_dir():
│ +            continue
│ +        for path in base.rglob("*"):
│ +            if not path.is_file():
│ +                continue
│ +            rel = path.relative_to(ROOT).as_posix()
│ +            # `pages.yml` išmeta AGENTS.md (`find _site -name "AGENTS.md" -delete`).
│ +            if rel.rsplit("/", 1)[-1] == "AGENTS.md":
│ +                continue
│ +            out.add(rel)
│ +    return out
│ +
│ +
│ +def measured_files(grades: list[int]) -> set[str]:
│ +    """Failai, kurių **baitus** šis įrankis tikrina svetainėje.
│ +
│ +    Sąrašas sudaromas iš tų pačių šaltinių, iš kurių `report()` stato
│ +    matavimus, o ne rašomas ranka: kitaip vartas lygintų savo sąrašą su savimi
│ +    ir visada būtų žalias (LL-202 — vartas su atšaka, kuri negali suveikti).
│ +    """
│ +    out: set[str] = set(shell_files())
│ +    out |= {url_rel for url_rel, _ in AUX_FILES}
│ +    for grade in grades:
│ +        gd = grade_dir(grade)
│ +        out.add(f"content/lt/{gd}/index.json")
│ +        out.add(f"content/lt/{gd}/path.json")
│ +        try:
│ +            _, files = local_index(grade)
│ +        except (OSError, json.JSONDecodeError):
│ +            files = {}
│ +        for rel in files.values():
│ +            out.add(f"content/lt/{rel}")
│ +    out |= {AUDIO_URL_PREFIX + rel for rel, _ in audio_entries(None)[0]}
│ +    return out
│ +
│ +
│ +def coverage(grades: list[int] | None = None) -> dict:
│ +    """Ar kiekvienas publikuojamas failas turi savo matavimą.
│ +
│ +    `unmeasured` — failai, kuriuos `pages.yml` įkelia, o įrankis jų baitų
│ +    netikrina. Tai **ne** „failo nėra svetainėje“ ir ne „pasenęs turinys“:
│ +    tai teiginys apie pačius vartus, todėl jis ir pranešamas atskirai — kitaip
│ +    „sutampa“ galėtų reikšti „sutampa tai, ką išmatavau“ (LL-37).
│ +
│ +    `not_published` — priešingas atvejis: įrankis tikrina failą, kurio
│ +    publikavimas neįkelia. Tai irgi klaida, tik kitoje pusėje: vartas matuoja
│ +    tai, ko vaikas niekada negaus, tad žalias jis būtų apie nieką.
│ +    """
│ +    published = published_files()
│ +    measured = measured_files(grades if grades is not None else live_grades())
│ +    return {
│ +        "published_count": len(published),
│ +        "unmeasured": sorted(published - measured),
│ +        # `assets/audio/` manifestas lyginamas kaip AUX, bet patys mp3 — per
│ +        # `check_audio()`; jie ab

… PRALEISTA 2533 SIMBOLIŲ IŠ 20533 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00558/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

AMAS FAILAS BE MATAVIMO ({len(cov['unmeasured'])}) — "
│ +              f"svetainė jį įkelia, o baitų niekas nelygina:")
│ +        for rel in cov["unmeasured"][:10]:
│ +            print(f"  - {rel}: įrašyk į `AUX_FILES` arba `shell_files()`, "
│ +                  f"kitaip „sutampa“ jo neapima.")
│ +    if cov.get("not_published"):
│ +        print(f"MATUOJAMAS FAILAS, KURIO PUBLIKAVIMAS NEĮKELIA "
│ +              f"({len(cov['not_published'])}): "
│ +              f"{', '.join(cov['not_published'][:5])} — vartas matuoja tai, "
│ +              f"ko vaikas niekada negaus.")
│      if data.get("shell_stale"):
│          print(f"PASENĘS KODAS — naršyklė vykdo kitą failą ({len(data['shell_stale'])}):")
│          for s in data["shell_stale"]:
│ scripts/check_published.py
│ @@ -3038,6 +3038,7 @@
│                    f"{stale_tail}"
│                    f"{version_tail}"
│                    f"{order_tail}"
│ +                  f"{', rėmas ' + str((data.get('coverage') or {}).get('published_count', 0)) + ' publikuojami failai visi matuoti' if (data.get('coverage') or {}).get('published_count') else ''}"
│                    f"{', versija ' + data['live_version'] if data.get('live_version') else ''}).")
│          else:
│              # `--no-bytes` sąmoningai nelygina baitų, kodo ir garso. Iki #374
│ scripts/probe_publish_sets.py
│ @@ -160,6 +160,10 @@
│                                     encoding="utf-8")
│      (root / "assets" / "audio" / "lt").mkdir(parents=True, exist_ok=True)
│      (root / "assets" / "audio" / "lt" / "manifest.json").write_text("{}", encoding="utf-8")
│ +    # Publikuojamas, o naršyklės neįkeliamas failas — `pages.yml` kopijuoja
│ +    # visą `content/`. Būtent tokio failo be matavimo iki #558 niekas nematė.
│ +    (root / "content" / "audio-overrides.json").write_text('{"Ruduo": "rud\\u02c8uo"}',
│ +                                                           encoding="utf-8")
│      (root / "scripts").mkdir(exist_ok=True)
│      (root / "scripts" / "known_renames.json").write_text("{}", encoding="utf-8")
│      (root / "scripts" / "known_path_order.json").write_text(
│ scripts/probe_publish_sets.py
│ @@ -218,6 +218,8 @@
│      cp.AUX_FILES = [
│          ("content/lt/grades.json", cp.CONTENT / "grades.json"),
│          ("assets/audio/lt/manifest.json", root / "assets" / "audio" / "lt" / "manifest.json"),
│ +        # #558: publikuojamas failas, kurį iki tol matavo nė vienas vartas.
│ +        ("content/audio-overrides.json", root / "content" / "audio-overrides.json"),
│      ]
│      cp.RENAMES = root / "scripts" / "known_renames.json"
│      cp.PATH_ORDER = root / "scripts" / "known_path_order.json"
│ scripts/probe_publish_sets.py
│ @@ -271,6 +271,50 @@
│          check("A: rc 0 ir išvestis be klaidų", rc == 0 and "sutampa" in out,
│                f"rc {rc}, {out.strip().splitlines()[0] if out.strip() else 'tuščia'}")
│
│ +        # Y. Vartų rėmas (#558): kiekvienas publikuojamas failas turi matavimą.
│ +        #    Be šio bloko `coverage()` būtų vartas, kurio niekas nepaleidžia —
│ +        #    LL-207 (vartas, kurį pamoka vadina privalomu, o nepaleidžia nė
│ +        #    vienas kelias).
│ +        check("Y: sveikame veidrodyje nėra neišmatuotų publikuojamų failų",
│ +              data.get("coverage", {}).get("unmeasured") == []
│ +              and data.get("coverage", {}).get("not_published") == []
│ +              and data["coverage"]["published_count"] >= 5,
│ +              f"coverage {data.get('coverage')}")
│ +        # Y2. Neigiama kontrolė: failas publikuojamas, o matavimo nėra.
│ +        saved_aux = list(cp.AUX_FILES)
│ +        cp.AUX_FILES = [a for a in cp.AUX_FILES
│ +                        if a[0] != "content/audio-overrides.json"]
│ +        data = cp.report([1])
│ +        rc, out = run_cli(["--grade", "1"])
│ +        check("Y2: publikuojamas failas be matavimo → raudona ir įvardytas",
│ +              not data["verdict"]["ok"]
│ +              and data["coverage"]["unmeasured"] == ["content/audio-overrides.json"]
│ +              and any("be matavimo" in r for r in data["verdict"]["reasons"])
│ +              and rc == 1 and "PUBLIKUOJAMAS FAILAS BE MATAVIMO" in out,
│ +              f"unmeasured {data['coverage']['unmeasured']}, rc {rc}, "
│ +              f"reasons {data['verdict']['reasons']}")
│ +        check("Y2: sena būsena (be `coverage()`) būtų buvusi žalia — defektas "
│ +              "realus, o ne įsivaizduojamas",
│ +              "content/audio-overrides.json" in cp.measured_files([1]) or True,
│ +              "matuojamas po įrašymo į AUX_FILES")
│ +        cp.AUX_FILES = saved_aux
│ +        # Y3. Naujasis AUX įrašas tikrai lygina baitus: pakeitus gyvą kopiją,
│ +        #     turi atsirasti `aux_stale` su tuo failu.
│ +        live_over = live / "content" / "audio-overrides.json"
│ +        original = live_over.read_bytes()
│ +        live_over.write_bytes(original + b"\n")
│ +        data = cp.report([1])
│ +        check("Y3: pakitęs `content/audio-overrides.json` → `aux_stale`",
│ +              any(i["file"] == "content/audio-overrides.json"
│ +                  for i in data.get("aux_stale", []))
│ +              and not data["verdict"]["ok"],
│ +              f"aux_stale {[i['file'] for i in data.get('aux_stale', [])]}, "
│ +              f"reasons {data['verdict']['reasons']}")
│ +        live_over.write_bytes(original)
│ +        data = cp.report([1])
│ +        check("Y3b: atstačius failą — vėl „sutampa“", data["verdict"]["ok"],
│ +              f"verdict {data['verdict']['label']}")
│ +
│          # B. Gyvame indekse trūksta vieno repo modulio.
│          write_index(live, ["01-a"])
│          data = cp.report([1])
│ scripts/probe_publish_sets.py
│ @@ -293,10 +293,13 @@
│                and rc == 1 and "PUBLIKUOJAMAS FAILAS BE MATAVIMO" in out,
│                f"unmeasured {data['coverage']['unmeasured']}, rc {rc}, "
│                f"reasons {data['verdict']['reasons']}")
│ -        check("Y2: sena būsena (be `coverage()`) būtų buvusi žalia — defektas "
│ -              "realus, o ne įsivaizduojamas",
│ -              "content/audio-overrides.json" in cp.measured_files([1]) or True,
│ -              "matuojamas po įrašymo į AUX_FILES")
│ +        check("Y2: sena būsena (be įrašo `AUX_FILES`) būtų buvusi žalia — "
│ +              "defektas realus, o ne įsivaizduojamas",
│ +              "content/audio-overrides.json" not in cp.measured_files([1])
│ +              and data["coverage"]["published_count"]
│ +              > len(cp.measured_files([1]) & cp.published_files()) - 1,
│ +              "failas publikuojamas, bet ne matuojamas — iki #558 niekas "
│ +              "nepasakydavo")
│          cp.AUX_FILES = saved_aux
│          # Y3. Naujasis AUX įrašas tikrai lygina baitus: pakeitus gyvą kopiją,
│          #     turi atsirasti `aux_stale` su tuo failu.
│ scripts/check_published.py
│ @@ -1620,19 +1620,23 @@
│      Sąrašas sudaromas iš tų pačių šaltinių, iš kurių `report()` stato
│      matavimus, o ne rašomas ranka: kitaip vartas lygintų savo sąrašą su savimi
│      ir visada būtų žalias (LL-202 — vartas su atšaka, kuri negali suveikti).
│ +
│ +    Modulių failai imami **iš disko**, ne iš indekso įrašų (`index.json`
│ +    reikalauja egzistuojančio failo; kitaip indekso įrašas be failo atrodytų
│ +    kaip „matuojamas, o nepublikuojamas“ ir tą patį defektą praneštų du
│ +    kartus — LL-129). Failas, kuris yra diske ir nepaminėtas indekse, čia
│ +    skaitomas kaip padengtas: jį atskirai įvardija `orphan_module_files()`,
│ +    tad jis nėra tylus.
│      """
│      out: set[str] = set(shell_files())
│      out |= {url_rel for url_rel, _ in AUX_FILES}
│      for grade in grades:
│ -        gd = grade_dir(grade)
│ -        out.add(f"content/lt/{gd}/index.json")
│ -        out.add(f"content/lt/{gd}/path.json")
│ -        try:
│ -            _, files = local_index(grade)
│ -        except (OSError, json.JSONDecodeError):
│ -            files = {}
│ -        for rel in files.values():
│ -            out.add(f"content/lt/{rel}")
│ +        gdir = CONTENT / grade_dir(grade)
│ +        out.add(f"content/lt/{grade_dir(grade)}/index.json")
│ +        out.add(f"content/lt/{grade_dir(grade)}/path.json")
│ +        if gdir.is_dir():
│ +            for path in gdir.glob("*/*.json"):
│ +                out.add(f"content/lt/{path.relative_to(CONTENT).as_posix()}")
│      out |= {AUDIO_URL_PREFIX + rel for rel, _ in audio_entries(None)[0]}
│      return out
│
Darbas baigtas. Rezultatas — 4 failai repo, ne ataskaita.

**`check_published.py` išvestis (rc 0, 86 s)**
```
Repozitorija: 82 moduliai
Klasės:       grade-01 (statusas „live“ iš content/lt/grades.json)
Paskelbta:    82 moduliai
  · grade-01: repo 82, gyvai 82
Neišstumta commit'ų: 0   ·   behind_commits 0   ·   deploy_pending false
missing_on_live/hidden_locally/not_in_path/orphan_files/stale*/aux_*/shell_* — visi []
Garsas: 2426/2426, dydžiai 2426/2426 = Content-Length, vardai 2426/2426
✔ rėmas 2532 publikuojami failai visi matuoti, versija da3b7256
```

**3 gyvi adresai (kodas ir baitai)**
```
matematika/04-skaiciu-tiese.json          200  4 972 B
lietuviu-kalba/03-sakinio-zodziai.json    200  5 459 B
pasaulio-pazinimas/10-gyvunu-grupes.json  200  8 685 B
neigiama kontrolė matematika/99-nera.json 404    563 B
```

**Ką pakeičiau** (defektas mano paties įrankyje; vaikui nematomas)

Vartų rėmas buvo sudarytas pagal klausimą „ką naršyklė įkelia“, o ne „ką publikavimas įkelia“. Sąjunga nebuvo palyginta su publikavimo sutartimi nė karto, todėl `content/audio-overrides.json` — failas, kurį `pages.yml` kopijuoja ištisai su visu `content/` — buvo svetainėje (200 / 365 B, baitai sutapo), o jo nematavo **nulis** vartų: `check_audio()` ima mp3 iš manifesto, modulių ciklas eina per `content/lt/<klasė>/`, `shell_files()` — per `assets/`. Žala šiandien nulinė (failą skaito `generate_audio.py`, ne klientas), bet ta pati spraga būtų praleidusi ir kliento failą: bet kuris naujas `content/*.json` taptų publikuojamas be vartų.

- `scripts/check_published.py` — `published_files()` (išvedama iš `pages.yml` elgsenos, su `AGENTS.md` išmetimu), `measured_files()` (išvedama iš tų pačių šaltinių, iš kurių `report()` stato matavimus — ne ranka, kitaip vartas lygintų save su savimi), `coverage()` su **abiem** kryptimis: `unmeasured` ir `not_published`; failas įtrauktas į `AUX_FILES`, `verdict()` turi savo priežastį, CLI — „PUBLIKUOJAMAS FAILAS BE MATAVIMO“, sėkmės eilutė — „rėmas 2532 … visi matuoti“.
- `scripts/probe_publish_sets.py` — Y/Y2/Y3/Y3b (4 nauji lūkesčiai, be interneto), **55/55 rc 0**. Y2 yra neigiama kontrolė: išėmus įrašą — raudona ir įvardyta, rc 1.
- `research/wiki/guidelines/pamokos.md` — LL-208 (naujas tipas: failas publikuojamas, o vartų rėmas jo nelaukia).
- `research/wiki/changelog.md` — #558 įrašas.

**Du dalykai, kuriuos pasigavau savo pačiame darbe:** pirmoji Y2 versija buvo su `or True` (negalėjo nukristi — LL-202) — pakeista į tikrą kontrolę; pirmoji `measured_files()` ėmė modulius iš `index.json`, todėl lūžęs indeksas virto ir „matuojamas, o nepublikuojamas“ ir vienas defektas buvo praneštas dviem eilutėmis (LL-129) — zondas tai parodė, dabar imama iš disko.

**Vartai po pakeitimo**
`validate_content.py --strict` 0/0 · `check_registry.py` index 82 / užduotys 359 / sim 82 / path 82 / PROBLEMŲ 0 · `check_language.py --strict` 0/0 · `check_audio.py` 1 213 tekstų / 2 426 įrašų · `check_lessons.py` 208 įrašai · `check_docs_facts.py` sutampa · `check_refs.py` 27/27 · `check_ui.py` 0/0 · `check_art.py` 9 failai · `check_agents.py` rc 0 · `--path-order` rc 0 · `--scope` rc 0 · `probe_check_published.py` 15/15 · `py_compile` OK.
Savarankiškas perskaičiavimas be įrankio logikos (12 gijų): **2 532/2 532** publikuojami failai baitiškai lygūs gyvai svetainei.

**Sprendimas: sutampa.** Nereikėjo nieko atšaukti. Neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, modulių ID, `path.json` seka, vaiko `localStorage` raktai. Push nedarytas (bėgiklio darbas).

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-a38ee8974755627595ddfd58398bdb6668eae5a65ce58b551a18812524d9f8ee
```
