# publikavimo-agentas — 2026-11-28T1601

- paleidimas: #607 (manual)
- trukmė: 2594s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_published.py
│ @@ -2371,17 +2371,39 @@
│
│
│  # `href="…"` / `src='…'` reikšmė — su kabute, kuri ją atidarė (kad nesugriebtų
│ -# kito atributo). Naudojama tik `index.html` kodo nuorodoms.
│ +# kito atributo). Naudojama tik HTML puslapių kodo nuorodoms.
│  REF_ATTR = re.compile(r"""(?:href|src)\s*=\s*(["'])([^"']+)\1""")
│  # Nuoroda yra „svetainės kodas“, jei rodo į `assets/css/*.css` arba
│  # `assets/js/*.js`. Paveikslai, `data:` URI ir garso manifestas čia neįeina:
│  # jiems `pages.yml` žymos nededa ir nereikia — jie neimportuojami, o prašomi
│  # tiesiogiai.
│  CODE_REF = re.compile(r"assets/(?:css|js)/[^?#]+\.(?:css|js)$")
│ -
│ -
│ -def shell_version_stamps(blob: bytes | None) -> dict:
│ -    """Ar **kiekviena** kodo nuoroda `index.html` turi `?v=<commit>` (LL-233).
│ +# Kodo nuoroda, sudaryta **scenarijumi**, o ne atributu: `css.href = root +
│ +# "assets/css/main.css"` (`404.html`). Atributo `href`/`src` ten nėra, tad
│ +# `REF_ATTR` jos nemato, o `pages.yml` du kietai įrašyti `sed` raštai — irgi.
│ +# Skaitoma tik kabutėse esanti eilutė, kuri **baigiasi** failo plėtiniu:
│ +# komentare esanti `./assets/css/main.css` (404.html tokią turi) neturi
│ +# kabučių ir į skaičių neįeina (LL-38: vartas neturi matyti mažiau formų, bet
│ +# ir daugiau — klaidingai raudonas vartas moko jį apeiti).
│ +CODE_LITERAL = re.compile(
│ +    r"""(["'])((?:\./)?assets/(?:css|js)/[^"'?#\s]+\.(?:css|js))((?:\?v=[0-9a-f]{6,40})?)\1""")
│ +
│ +
│ +def code_pages() -> list[str]:
│ +    """HTML puslapiai, kuriuos naršyklė įkelia su kodu (šiuo metu 2).
│ +
│ +    Imami iš `SHELL_GLOBS`, ne įrašomi ranka: naujas HTML puslapis įsijungia
│ +    į patikrą tame pačiame pakeitime, kuriame atsiranda (LL-84 taisyklė).
│ +    Iki #607 ši patikra ėjo tik per `index.html` — vardiklis „2/2“ buvo
│ +    teisingas tik todėl, kad antras įkeliamas puslapis (`404.html`) neįėjo
│ +    nė į skaičių.
│ +    """
│ +    return [name for name, pattern in SHELL_GLOBS
│ +            if pattern is None and name.endswith(".html")]
│ +
│ +
│ +def shell_version_stamps(blob: bytes | None, page: str = "index.html") -> dict:
│ +    """Ar **kiekviena** puslapio kodo nuoroda turi `?v=<commit>` (LL-233).
│
│      Kodėl to reikia. `_version_of()` grąžina **pirmą** rastą žymę ir vadina ją
│      „svetainės versija“. Tai tiesa tik tada, kai žymų tiek pat, kiek kodo
│ scripts/check_published.py
│ @@ -2433,22 +2433,89 @@
│      stamped: list[str] = []
│      unstamped: list[str] = []
│      versions: set[str] = set()
│ -    for match in REF_ATTR.finditer(text):
│ -        url = match.group(2).strip()
│ -        path = url.split("?", 1)[0].split("#", 1)[0]
│ -        if not CODE_REF.search(path):
│ -            continue
│ +    seen: set[str] = set()
│ +
│ +    def note(path: str, url: str) -> None:
│ +        # Ta pati nuoroda, rasta du kartus (atributas + literalas), skaičiuojama
│ +        # kartą: kitaip vardiklis „N/M“ išpūstas, o vaikas failą įkelia vieną.
│ +        if path in seen:
│ +            return
│ +        seen.add(path)
│          ver = VERSION_PARAM.search(url)
│          if ver:
│              stamped.append(path)
│              versions.add(ver.group(0)[3:])
│          else:
│              unstamped.append(path)
│ -    return {
│ +
│ +    for match in REF_ATTR.finditer(text):
│ +        url = match.group(2).strip()
│ +        path = url.split("?", 1)[0].split("#", 1)[0]
│ +        if not CODE_REF.search(path):
│ +            continue
│ +        note(path, url)
│ +    # Scenarijumi sudarytos kodo nuorodos (`404.html`: `root + "assets/…"`).
│ +    # `pages.yml` jų nepažymi NĖ VIENA savo `sed` raštu, tad jos privalo būti
│ +    # skaitomos čia — kitaip „2/2“ yra teiginys apie vieną puslapį iš dviejų.
│ +    # Be `?v=` tokia nuoroda duoda **404**, ne seną failą (kabutėje eilutė
│ +    # baigiasi plėtiniu, tad prirašyti `?v=` tiesiog nėra vietos) — todėl
│ +    # būsena pranešama kaip trūkstama žymė, o taisymas — `pages.yml` raštas,
│ +    # kuris ją mato.
│ +    for match in CODE_LITERAL.finditer(text):
│ +        path = match.group(2)
│ +        if match.group(3):
│ +            path = f"{path}{match.group(3)}"
│ +        note(match.group(2), path)
│ +    out = {
│          "stamped": stamped,
│          "unstamped": unstamped,
│          "versions": sorted(versions),
│          "refs": len(stamped) + len(unstamped),
│ +    }
│ +    if page != "index.html":
│ +        # Kiekviena būsena turi pasakyti, KURIAME puslapyje — kitaip pranešimas
│ +        # „1 kodo nuoroda be ?v=“ nepasako, kur jos ieškoti (LL-21).
│ +        out["page"] = page
│ +        out["stamped"] = [f"{page}: {p}" for p in stamped]
│ +        out["unstamped"] = [f"{page}: {p}" for p in unstamped]
│ +    return out
│ +
│ +
│ +def shell_versions_all() -> dict:
│ +    """`shell_version_stamps()` visiems įkeliamiems HTML puslapiams (LL-239).
│ +
│ +    Kodėl atskira funkcija, o ne vienas kvietimas. Vardiklis „kodo nuorodos su
│ +    `?v=`: N/M“ yra **teiginys apie svetainę**, o iki #607 jis ėjo per vieną
│ +    failą (`index.html`). Bet naršyklė įkelia ir `404.html` — tą, kurį vaikas
│ +    pamato neteisingu adresu, — o jo CSS nuoroda sudaryta scenarijumi. Du
│ +    duomenys (refs, stamped) sumuojami per puslapius, `pages` žemėlapis lieka
│ +    tam, kas turi žinoti, kur defektas. `measured` — visi puslapiai perskaityti:
│ +    jei vieno nepavyko, vardiklis nėra teiginys apie visą svetainę (LL-37).
│ +    """
│ +    pages: dict[str, dict] = {}
│ +    measured = True
│ +    refs = 0
│ +    stamped = 0
│ +    unstamped: list[str] = []
│ +    versions: set[str] = set()
│ +    for page in code_pages():
│ +        st, blob = fetch_answer(cache_busted(LIVE_ROOT + page), attempts=1)
│ +        if st != "ok":
│ +            measured = False
│ … omitted 17 diff line(s) across 1 additional file(s)/section(s)
│ scripts/check_published.py
│ @@ -2520,18 +2520,17 @@
│
│
│  def shell_version_check() -> dict:
│ -    """`shell_version_stamps()` prieš gyvą `index.html

… PRALEISTA 17733 SIMBOLIŲ IŠ 35733 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00607/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

E_ROOT = url2
│              got = cp.shell_version_check()
│ scripts/probe_shell_version.py
│ @@ -196,7 +196,9 @@
│              cp.LIVE_ROOT = original
│
│          # 10. TIKRAS workflow žingsnis → visos 3 žymėtos, viena versija.
│ -        rc, out = run_workflow_stamp(site, SHA)
│ +        #     `cwd` — repo šaknis, nes `pages.yml` žymų žingsnis rašo į
│ +        #     `_site/…` santykiniu keliu (ne į katalogą, kuriame failas guli).
│ +        rc, out = run_workflow_stamp(site.parent, SHA)
│          check("10: pages.yml žymų žingsnis — rc 0", rc == 0,
│                f"rc {rc}: {(out.strip().splitlines() or [''])[-1][:160]}")
│          stamped_404 = cp.shell_version_stamps((site / "404.html").read_bytes())
│ scripts/probe_shell_version.py
│ @@ -216,7 +216,7 @@
│                else "komentaras nepaliestas")
│          # Antras bėgimas nebesudvigubina žymės (idempotentiškumas): publikavimas
│          # gali būti pakartotas, o `?v=X?v=X` būtų 404.
│ -        run_workflow_stamp(site, SHA)
│ +        run_workflow_stamp(site.parent, SHA)
│          check("10: pakartotas žymėjimas nebesudvigubina",
│                (site / "404.html").read_text(encoding="utf-8").count("?v=") == 1
│                and (site / "index.html").read_text(encoding="utf-8").count("?v=") == 2,
│ scripts/probe_shell_version.py
│ @@ -182,7 +182,7 @@
│              cp.LIVE_ROOT = url
│              got = cp.shell_version_check()
│              check("9: be žymių → 3 nuorodos iš 2 puslapių (senasis sakė 2/2)",
│ -                  got["refs"] == 3 and got["stamped"] == 0
│ +                  got["refs"] == 3 and not got["stamped"]
│                    and got["measured"] is True,
│                    f"refs {got['refs']}, stamped {got['stamped']}, "
│                    f"pages {sorted(got.get('pages') or {})}")
│ scripts/probe_shell_version.py
│ @@ -159,6 +159,14 @@
│      Zondas matuoja abu dalykus per **tikrą** workflow žingsnį ir **tikrą**
│      vartą: jei raštas ir skaitymas kada nors išsiskirs, kris čia.
│      """
│ +    if not hasattr(cp, "shell_versions_all"):
│ +        # Senasis įrankis skaitė tik `index.html` ir tik atributus — 404.html
│ +        # nuoroda buvo už matavimo ribos. Tai KLAIDA, ne praleista patikra:
│ +        # kitaip „25/25“ būtų teiginys apie patikrą, kurios nebuvo (LL-37).
│ +        check("8: įrankis matuoja VISUS įkeliamus puslapius (`code_pages`)",
│ +              False, "check_published.py neturi `shell_versions_all` — "
│ +                     "matuojamas tik index.html")
│ +        return
│      check("8: `code_pages()` ima ABI įkeliamus puslapius (ne ranka rašytą sąrašą)",
│            cp.code_pages() == ["index.html", "404.html"], f"{cp.code_pages()}")
│
│ scripts/probe_shell_version.py
│ @@ -342,7 +342,7 @@
│      #    tai matuoja HTTP kelią, ne puslapių sąrašą (tai — 8 zondas).
│      tmp = pathlib.Path(tempfile.mkdtemp(prefix="probe_sv_"))
│      httpd = None
│ -    original_pages = cp.code_pages
│ +    original_pages = getattr(cp, "code_pages", None)
│      try:
│          (tmp / "index.html").write_bytes(html(f"./assets/css/main.css?v={SHA}"))
│          httpd, url = serve(tmp)
│ scripts/probe_shell_version.py
│ @@ -366,7 +366,8 @@
│          finally:
│              cp.LIVE_ROOT = original
│      finally:
│ -        cp.code_pages = original_pages
│ +        if original_pages is not None:
│ +            cp.code_pages = original_pages
│          if httpd is not None:
│              httpd.shutdown()
│              httpd.server_close()
│ scripts/probe_shell_version.py
│ @@ -126,23 +126,25 @@
│
│
│  def site_from_repo(tmp: pathlib.Path) -> tuple[pathlib.Path, pathlib.Path]:
│ -    """Publikavimo sutartis (`pages.yml`): `index.html 404.html`, `assets`,
│ -    `content` → `_site`, kuris ir atiduodamas.
│ +    """Publikavimo sutartis (`pages.yml`): HTML puslapiai + `assets/`, kuriuos
│ +    žymi žymų žingsnis → `_site`, kuris ir atiduodamas.
│ +
│ +    Kopijuojama tik tai, ko zondas **skaito**: šaknyje atiduodami `*.html`,
│ +    `assets/css` ir `assets/js`. `pages.yml` kopijuoja visą `assets/` ir
│ +    `content/`, bet `assets/audio` (94 MB) nėra šios patikros objektas —
│ +    garsą jau matuoja `check_audio()`, o zondo sąlyga yra < 5 s.
│
│      Grąžina (`_site`, šaknis, kurią atiduoda serveris): GitHub Pages atiduoda
│      `_site` **turinį** projekto šaknyje, tad žymų žingsnis (`cwd=_site`) ir
│ -    serveris (`directory=_site`) žiūri į tuos pačius failus. Zondas iki #607
│ -    čia skyrėsi ir dėl to krito `sed: can't read _site/index.html` — tai buvo
│ -    zondo, ne workflow defektas, bet būtent taip zondas ir atskleidžia, kad
│ -    katalogai turi sutapti.
│ +    serveris (`directory=_site`) žiūri į tuos pačius failus.
│      """
│      import shutil
│      site = tmp / "_site"
│      site.mkdir(parents=True, exist_ok=True)
│      for name in ("index.html", "404.html"):
│          shutil.copy2(ROOT / name, site / name)
│ -    for name in ("assets", "content"):
│ -        shutil.copytree(ROOT / name, site / name, dirs_exist_ok=True)
│ +    for rel in ("assets/css", "assets/js"):
│ +        shutil.copytree(ROOT / rel, site / rel, dirs_exist_ok=True)
│      return site, site
│
│
│ scripts/check_published.py
│ @@ -2386,7 +2386,7 @@
│  # kabučių ir į skaičių neįeina (LL-38: vartas neturi matyti mažiau formų, bet
│  # ir daugiau — klaidingai raudonas vartas moko jį apeiti).
│  CODE_LITERAL = re.compile(
│ -    r"""(["'])((?:\./)?assets/(?:css|js)/[^"'?#\s]+\.(?:css|js))((?:\?v=[0-9a-f]{6,40})?)\1""")
│ +    r"""(["'])((?:\./|/)?assets/(?:css|js)/[^"'?#\s]+\.(?:css|js))((?:\?v=[0-9a-f]{6,40})?)\1""")
│
│
│  def code_pages() -> list[str]:
│ scripts/check_published.py
│ @@ -2386,7 +2386,7 @@
│  # kabučių ir į skaičių neįeina (LL-38: vartas neturi matyti mažiau formų, bet
│  # ir daugiau — klaidingai raudonas vartas moko jį apeiti).
│  CODE_LITERAL = re.compile(
│ -    r"""(["'])((?:\./|/)?assets/(?:css|js)/[^"'?#\s]+\.(?:css|js))((?:\?v=[0-9a-f]{6,40})?)\1""")
│ +    r"""(["'])((?:\./)?assets/(?:css|js)/[^"'?#\s]+\.(?:css|js))((?:\?v=[0-9a-f]{6,40})?)\1""")
│
│
│  def code_pages() -> list[str]:
│ scripts/probe_publish_sets.py
│ @@ -158,7 +158,14 @@
│          encoding="utf-8")
│      (root / "404.html").write_text(
│          '<!doctype html><title>nera</title>'
│ -        '<link rel="stylesheet" href="/assets/css/main.css">'
│ +        # Scenarijumi sudaryta nuoroda — KAIP TIKRAME `404.html`. HTML
│ +        # atributas čia netinka: šis veidrodis atiduodamas bet kuriame gylyje,
│ +        # tad santykinė nuoroda lūžtų (LL-210), o būtent šitą formą turi ir
│ +        # `pages.yml` žymų žingsnis (`root + "assets/css/main.css"`).
│ +        '<script>var root = "/";'
│ +        'var css = document.createElement("link");'
│ +        'css.href = root + "assets/css/main.css";'
│ +        'document.head.appendChild(css);</script>'
│          '<a id="i-pradzia" href="/">Į pradžią</a>'
│          # Atsarginio puslapio spalvos — `main.css` tokenų kopija (be CSS
│          # `var(--paper)` neveikia). Vartas `depth_palette_check()` lygina jas
│ scripts/probe_publish_sets.py
│ @@ -232,6 +232,12 @@
│      html = html.replace('src="./assets/js/app.js"', f'src="./assets/js/app.js?v={sha}"')
│      html = html.replace('href="./assets/css/main.css"', f'href="./assets/css/main.css?v={sha}"')
│      (live / "index.html").write_text(html, encoding="utf-8")
│ +    # `404.html` — irgi žymimas: `pages.yml` žymų žingsnis pažymi ir
│ +    # scenarijumi sudarytas nuorodas, tad veidrodis be žymės matuotų būseną,
│ +    # kurios svetainėje nebūna (tas pats argumentas kaip `index.html` aukščiau).
│ +    n404 = (live / "404.html").read_text(encoding="utf-8")
│ +    n404 = n404.replace('"assets/css/main.css"', f'"assets/css/main.css?v={sha}"')
│ +    (live / "404.html").write_text(n404, encoding="utf-8")
│
│
│  def patch(root: pathlib.Path, url: str) -> None:
│ scripts/check_published.py
│ @@ -2457,10 +2457,10 @@
│      # Scenarijumi sudarytos kodo nuorodos (`404.html`: `root + "assets/…"`).
│      # `pages.yml` jų nepažymi NĖ VIENA savo `sed` raštu, tad jos privalo būti
│      # skaitomos čia — kitaip „2/2“ yra teiginys apie vieną puslapį iš dviejų.
│ -    # Be `?v=` tokia nuoroda duoda **404**, ne seną failą (kabutėje eilutė
│ -    # baigiasi plėtiniu, tad prirašyti `?v=` tiesiog nėra vietos) — todėl
│ -    # būsena pranešama kaip trūkstama žymė, o taisymas — `pages.yml` raštas,
│ -    # kuris ją mato.
│ +    # Be `?v=` tokiai nuorodai galioja GitHub Pages tarpinė atmintis (matuota:
│ +    # `assets/css/main.css` → 200, `cache-control: max-age=600`), tad vaikas
│ +    # iki 10 min. neteisingu adresu mato seną stilių. Būsena pranešama kaip
│ +    # trūkstama žymė, o taisymas — `pages.yml` raštas, kuris ją mato.
│      for match in CODE_LITERAL.finditer(text):
│          path = match.group(2)
│          if match.group(3):
Ataskaita #607

check_published.py (galutinė išvestis)
  Repozitorija: 89 moduliai
  Paskelbta:    89 moduliai · grade-01: repo 89, gyvai 89
  Neišstumta:   0 · seka 89/89 žingsnių · garsas 2730/2730 · kodas 19 failų
  SPRENDIMAS: nepublikuota (rc 1) — 1 svetainės kodo nuoroda be `?v=`:
              `404.html: assets/css/main.css`

Gyvi adresai (curl)
  pasaulio-pazinimas/42-transporto-priemone-marsrutui.json → 200
  lietuviu-kalba/03-sakinio-zodziai.json                  → 200
  matematika/04-skaiciu-tiese.json                        → 200
  404.html                                                → 200
  neigiama kontrolė matematika/99-nera.json               → 404 (4 290 B)

Sprendimas: IŠTAISYTA (scripts/check_published.py, .github/workflows/pages.yml,
scripts/probe_shell_version.py, scripts/probe_publish_sets.py,
research/wiki/guidelines/pamokos.md, research/wiki/changelog.md)

Kodėl rc 1, o ne „sutampa“: turinys sutampa 89/89 — raudona eilutė yra apie
kodą. `shell_version_stamps()` skaitė tik `href`/`src` atributus **viename**
faile, o `404.html` savo `main.css` nuorodą stata scenarijumi
(`css.href = root + "assets/css/main.css"`). To failo nepasiekė nė vienas iš
trijų matavimų: `pages.yml` du kietai įrašyti `sed` raštai, to paties žingsnio
vartas (skaitė tik `_site/index.html`) ir `check_published.py` vardiklis
„2/2“ (skaičiavo tik `index.html`). Matuota: nuoroda be žymės, o
`assets/css/main.css` atsako 200 su `cache-control: max-age=600` — tad iki
10 min. vaikas neteisingu adresu gauna seną stilių. (Pirmą kartą parašiau
„404“ — matavimas parodė 200; pasekmės sakinys pataisytas pagal matavimą.)

Ką pakeičiau
  1. `code_pages()` — puslapiai imami iš `SHELL_GLOBS`, ne rašomi ranka;
     `shell_versions_all()` matuoja visus; būsena įvardija **puslapį**;
     neperskaitytas puslapis → `measured False`.
  2. `shell_version_stamps()` skaito ir scenarijaus literalus (`CODE_LITERAL`).
  3. `pages.yml`: naujas `sed` raštas pažymi literalus visuose šaknies HTML
     puslapiuose (idempotentiškas); jo vartas skaito visus puslapius ir abi
     nuorodų formas.
  4. `probe_publish_sets.py`: veidrodis turėjo HTML atributą ten, kur tikrame
     `404.html` yra scenarijus — padaryta kaip tikrame faile (63/63).

Įrodymas: `probe_shell_version.py` 25/25, rc 0, 1,7 s, be tinklo — paleidžia
**tikrą** `pages.yml` žymų žingsnį prieš veidrodį, tada **tikrą** vartą:
9 → be žymių mato 3 nuorodas iš 2 puslapių (senasis sakė 2/2); 10 → po
žymėjimo `404.html` pažymėtas, komentaras nepaliestas, pakartojimas
nesudvigubina; 11 → 3/3 žalias; 12 → trūkstamas puslapis → `measured False`.
Neigiama kontrolė: su `git show HEAD:scripts/check_published.py` → rc 1 ir
`KLAIDA 8: įrankis matuoja VISUS įkeliamus puslapius`. Gyvai: prieš — rc 0
„2/2“, po — rc 1 „404.html: assets/css/main.css“.

Nauja pamoka: LL-240 (matavimo vardiklis skaičiuoja vieną puslapį, o naršyklė
įkelia du). Visi 31 `probe_*.py` rc 0; validate_content, check_language,
check_ui, check_art, check_refs, check_docs_facts, check_lessons,
check_agents, curriculum_backlog, --scope ir --path-order — visi žali.
`git push` nedarytas (bėgiklio darbas).

## klaidos

```
session_id: local-8601b16f3893e4f23d98a0b1781592ca38dbd7d6e7dfda1af66ba4eefa0abc38
```
