# publikavimo-agentas — 2026-11-23T2303

- paleidimas: #491 (manual)
- trukmė: 818s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_refs.py
│ @@ -0,0 +1,246 @@
│ +#!/usr/bin/env python3
│ +"""Vidinių nuorodų patikra: ar tai, į ką nurodo puslapis ir kodas, tikrai yra.
│ +
│ +Defekto klasė (nauja, iki šio įrankio nematyta). `scripts/check_published.py`
│ +lygina **failus, kurie repo yra**, su gyva svetaine. Tai reiškia: jei `index.html`
│ +nurodo `./assets/js/app.js`, o `app.js` importuoja `./registry.js` — abu failai
│ +lyginami ir sutampa. Bet jei importas parašytas su klaida (`./registrys.js`) arba
│ +į failą, kurio niekas nesukūrė, tai **nelyginama su niekuo**: trūkstamas failas
│ +tiesiog nepatenka į sąrašą, o esamas lieka baitiškai lygus. Rezultatas: deploy
│ +žalias, `check_published` sako „sutampa“, o vaikas naršyklėje gauna baltą
│ +puslapį, nes modulio grafas lūžta ties pirmu importu.
│ +
│ +Tas pats galioja CSS (`url(...)` į paveikslą, kurio nėra) ir `404.html`
│ +nuorodoms. `.github/workflows/pages.yml` rašo `?v=` prie importų ir neturi
│ +varto, kuris patikrintų, ar pats importo taikinys egzistuoja — ten patikra
│ +vyksta **po** merge, kai taisyti jau vėlu.
│ +
│ +Ką įrankis daro:
│ +  1. skaito `index.html`, `404.html` ir visus `*.html` šaknyje — `href`/`src`;
│ +  2. skaito `assets/**/*.js` — statinius `import … from "x"`, `export … from "x"`
│ +     ir dinaminius `import("x")`;
│ +  3. skaito `assets/**/*.css` — `url(...)`;
│ +  4. palieka tik **vietines** nuorodas (ne `http(s):`, ne `data:`, ne `#…`);
│ +  5. kiekvieną išsprendžia to failo katalogo atžvilgiu ir patikrina, kad failas
│ +     yra. Trūkstamas — klaida (rc 1), su failu ir eilute.
│ +
│ +Papildomai (įspėjimas, ne klaida): JS failai, kurių nepasiekia jokia nuoroda
│ +iš `index.html` — paskelbtas, bet nevykdomas kodas; jis gali slėpti pasenusią
│ +simuliacijos versiją.
│ +
│ +Naudojimas:
│ +    python3 scripts/check_refs.py             # rc 0 — visos nuorodos veda į failą
│ +    python3 scripts/check_refs.py --json      # ta pati informacija mašinai
│ +    python3 scripts/check_refs.py --root DIR  # zondas: veidrodis su defektu
│ +"""
│ +
│ +from __future__ import annotations
│ +
│ +import argparse
│ +import json
│ +import pathlib
│ +import re
│ +import sys
│ +
│ +ROOT = pathlib.Path(__file__).resolve().parent.parent
│ +
│ +# `href="x"` ir `src='x'` — abi kabutės, nes HTML leidžia abi.
│ +MARKUP_REF = re.compile(r"""\b(?:href|src)\s*=\s*["']([^"']+)["']""")
│ +# `import a from "x"`, `import {a, b} from "x"`, `import "x"`, `export … from "x"`.
│ +# Kabutė imama kaip grupė, o ne rašoma dviem raštais: LL-38 šeima — vartai,
│ +# kurie atpažįsta vieną formą ir tyliai praleidžia kitą.
│ +STATIC_REF = re.compile(
│ +    r"""\b(?:import|export)\s+(?:[^"';\n]*?\bfrom\s*)?["']([^"']+)["']"""
│ +)
│ +DYNAMIC_REF = re.compile(r"""\bimport\s*\(\s*["']([^"']+)["']\s*\)""")
│ +# Dinaminis importas su šablonu (``import(`./x.js`)``) — ne klaida, bet
│ +# neišmatuota: toks taikinys surenkamas vykdymo metu. Skaičiuojamas atskirai,
│ +# kad aprėptis būtų pasakyta skaičiumi, o ne nutylėta (LL-37).
│ +DYNAMIC_TEMPLATE = re.compile(r"""\bimport\s*\(\s*`""")
│ +CSS_URL = re.compile(r"""url\(\s*["']?([^"')]+)["']?\s*\)""")
│ +
│ +SCHEME = re.compile(r"^[a-zA-Z][a-zA-Z0-9+.\-]*:")
│ +
│ +
│ +def is_local(ref: str) -> bool:
│ +    ref = ref.strip()
│ +    if not ref or ref.startswith("#") or ref.startswith("//"):
│ +        return False
│ +    if ref.startswith("/"):
│ +        # Absoliutus kelias svetainės šaknyje — `pages.yml` publikuoja tik
│ +        # `index.html`, `assets/`, `content/`, tad toks kelias taip pat
│ +        # tikrinamas, tik iš repo šaknies.
│ +        return True
│ +    return not SCHEME.match(ref)
│ +
│ +
│ +def rel_target(raw: str) -> str | None:
│ +    """Nuoroda be `?v=` žymos ir `#fragmento`. `None` — nuoroda ne į failą."""
│ … omitted 168 diff line(s) across 1 additional file(s)/section(s)
│ scripts/probe_refs.py
│ @@ -0,0 +1,189 @@
│ +#!/usr/bin/env python3
│ +"""Zondas `check_refs.py` — paleidžiamas įrodymas, kad vartai tikrai gaudo (LL-168).
│ +
│ +Kodėl atskiras failas: teiginys „nuoroda į neegzistuojantį failą dabar raudona“
│ +neturi likti docstring'e. Kiekvienas atvejis paleidžiamas per **tikrą** įrankio
│ +`main()` kelią (`--root` veidrodis, `--json` išvestis), o ne per vidinę funkciją,
│ +nes būtent išėjimo kodas yra tai, ką mato CI.
│ +
│ +K1–K9:
│ +  K1 švarus veidrodis → rc 0, `ok: true`
│ +  K2 lūžęs statinis importas (vienguba kabutė) → rc 1, įvardytas failas ir eilutė
│ +  K3 lūžęs dinaminis `import("…")` → rc 1
│ +  K4 lūžęs CSS `url(...)` → rc 1
│ +  K5 lūžęs `href` HTML faile → rc 1
│ +  K6 dinaminis importas su šablonu → rc 0, bet `dynamic_template_refs` = 1
│ +     (neišmatuota pasakyta skaičiumi, o ne nutylėta — LL-37)
│ +  K7 tuščias veidrodis be nuorodų → rc 1 „NEIŠMATUOTA“ (tyli žalia draudžiama)
│ +  K8 JS failas, kurio niekas neimportuoja → rc 0, bet įspėjimas + sąraše
│ +  K9 `https:`, `data:` ir `#…` nuorodos nesugeneruoja klaidų (klaidingų signalų nėra)
│ +
│ +Naudojimas:
│ +    python3 scripts/probe_refs.py            # 0 — visi lūkesčiai išsipildė
│ +"""
│ +
│ +from __future__ import annotations
│ +
│ +import json
│ +import pathlib
│ +import shutil
│ +import subprocess
│ +import sys
│ +import tempfile
│ +
│ +HERE = pathlib.Path(__file__).resolve().parent
│ +ROOT = HERE.parent
│ +CHECKER = HERE / "check_refs.py"
│ +
│ +results: list[tuple[str, bool, str]] = []
│ +
│ +
│ +def run(root: pathlib.Path) -> tuple[int, dict]:
│ +    proc = subprocess.run(
│ +        [sys.executable, str(CHECKER), "--root", str(root), "--json"],
│ +        capture_output=True,
│ +        text=True,
│ +    )
│ +    try:
│ +        data = json.loads(proc.stdout)
│ +    except json.JSONDecodeError:
│ +        data = {"raw": proc.stdout.strip(), "err": proc.stderr.strip()}
│ +    return proc.returncode, data
│ +
│ +
│ +def mirror(tmp: pathlib.Path) -> pathlib.Path:
│ +    """Veidrodis: HTML šaknyje bei assets/js ir assets/css — tiek, kiek reikia."""
│ +    dst = tmp / "site"
│ +    dst.mkdir(parents=True, exist_ok=True)
│ + 

… PRALEISTA 2988 SIMBOLIŲ IŠ 20988 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00491/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

šybos klaida),
│ +      # nelyginamas su niekuo, tad deploy žalias, o vaikui lūžta visas JS
│ +      # grafas — baltas puslapis. Tas pats galioja CSS `url(...)` ir `404.html`
│ +      # nuorodoms. Patikra yra be tinklo: tik repo failų egzistavimas.
│ +      - name: Vidaus nuorodos
│ +        run: python3 scripts/check_refs.py
│
│        - name: Dokumentų skaičiai
│          run: python3 scripts/check_docs_facts.py
│ scripts/probe_refs.py
│ @@ -1,5 +1,5 @@
│  #!/usr/bin/env python3
│ -"""Zondas `check_refs.py` — paleidžiamas įrodymas, kad vartai tikrai gaudo (LL-168).
│ +"""Zondas `check_refs.py` — paleidžiamas įrodymas, kad vartai tikrai gaudo (LL-167).
│
│  Kodėl atskiras failas: teiginys „nuoroda į neegzistuojantį failą dabar raudona“
│  neturi likti docstring'e. Kiekvienas atvejis paleidžiamas per **tikrą** įrankio
│ .github/workflows/pages.yml
│ @@ -53,6 +53,14 @@
│            fi
│            echo "versija: $SHA"; grep -o "main.css?v=[a-f0-9]*" _site/index.html | head -1
│
│ +      # Vidinės nuorodos — **surinktame artefakte**, ne repo. `check_published`
│ +      # lygina failus, kurie yra; importas į nieką neturi su kuo lygintis, tad
│ +      # praeitų visus vartus, o vaikui lūžtų JS grafas (baltas puslapis, LL-167).
│ +      # Tikrinama po `?v=` injekcijos, nes būtent šį katalogą įkelia Pages:
│ +      # jei žyma kada nors pakeistų nuorodos formą, vartas tai pamatys.
│ +      - name: Vidaus nuorodos
│ +        run: python3 scripts/check_refs.py --root _site
│ +
│        - uses: actions/configure-pages@v5
│
│        - uses: actions/upload-pages-artifact@v3
│ research/wiki/changelog.md
│ @@ -1,6 +1,20 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-23 (23:20) — Publikavimo patikra #491: repo 73 / paskelbta 73 prie `72736a3e`, visi 73 modulių failai gyvai `200`, garsas 2 124/2 124, deploy run `success`; naujas vartas „Vidaus nuorodos“ (`check_refs.py`) — importas į nieką anksčiau buvo nematomas; sutampa
│ +
│ +- **Būsena (`scripts/check_published.py`, numatytasis ir `--json`, rc 0):** „Repozitorija: 73 moduliai / Paskelbta: 73 moduliai“ (`grade-01: repo 73, gyvai 73`); `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `stale`, `stale_unknown`, `stale_unmeasured`, `live_missing`, `live_gone`, `missing_in_repo`, `aux_stale`, `aux_absent`, `aux_gone`, `shell_stale`, `shell_gone`, `shell_unreachable` — visi `[]`; `path_differs` false, `path_reordered` `[]`, `path_inserted_midsequence` `[]`, `path_order_checked` true (`grade-01 scripts/known_path_order.json (2026-11-23T15:40:00+02:00)`), `shell_count` 19, garsas **2 124/2 124** (`sampled: false`), garso vardai **2 124/2 124** (`mismatch` 0, `text_mismatch` 0), `live_version` = `repo_version` = `72736a3e`, `deploy_pending` false, `unpushed_commits` 0, `bytes_checked` true, `verdict.label` = „sutampa“. Pervadintas ID vienas ir sutvarkytas: `03-sakinio-tvarka` → `03-sakinio-zodziai`, `alias_ok: true`.
│ +- **73 failai, ne vienas skaičius:** kiekvienas `index.json` `file` adresas gyvai tikrintas atskirai (`urllib` HEAD, 8 gijų, 3 bandymai, 404 laikomas galutiniu) → **73 × 200, 0 × 404**. Tai apima ir tris naujausius modulius iš #488–#490 (`23-ismestas-daiktas-nedingsta`, `25-ilgis-ir-vienetas`, `07-elektronika`).
│ +- **3 realios gyvos patikros (`curl`, HTTP kodai):** `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → **200**; `content/lt/grade-01/pasaulio-pazinimas/23-ismestas-daiktas-nedingsta.json` → **200**; `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` → **200** (šiandien įvardytas pervadinimo įpėdinis); **neigiama kontrolė** `content/lt/grade-01/matematika/99-nera.json` → **404**.
│ +- **Deploy ne iš išvedimo, o iš API:** `pages.yml` paleidimas `45265770161` — `completed/success`, `headSha` `72736a3e` = `HEAD`, `2026-11-23T21:03:48Z`; prieš jį `45264441502` (`3bc0288f`) taip pat `success`. Vietinė šaka = `origin/main`, 0 priekyje / 0 atsilieka.
│ +- **Naujas defektas, kurio nė vienas vartas nematė (LL-167): nuoroda į failą, kurio nėra.** `check_published` lygina **repo esančius** failus su gyva svetaine. Importas į nieką (`from "./art-nera.js"`, rašybos klaida `./registrys.js`) todėl nepatenka į jokį sąrašą: trūkstamo failo nėra, esantys lieka baitiškai lygūs → deploy žalias, „sutampa“, o vaikui naršyklėje lūžta JS grafas ir lieka baltas puslapis. `pages.yml` `?v=` žingsnis importus perrašo, bet netikrina, ar taikinys egzistuoja, o `validate.yml` (16 žingsnių) neskaitė nė vienos `import` eilutės.
│ +- **Ką pakeičiau:** `scripts/check_refs.py` (naujas, be tinklo) — skaito `*.html` (`href`/`src`), `assets/**/*.js` (`import … from`, `export … from`, `import("…")`) ir `assets/**/*.css` (`url(...)`), palieka tik vietines nuorodas (`http(s):`, `data:`, `//`, `#…` neliečiamos), sprendžia kiekvieną to failo katalogo atžvilgiu ir klaidingą įvardija **failu ir eilute**; nulis rastų nuorodų = „NEIŠMATUOTA“ ir rc 1 (LL-37); šabloniniai `` import(`…`) `` skaičiuojami atskirai; atskirai įspėjama apie JS failus, kurių nepasiekia jokia nuoroda. `.github/workflows/validate.yml` — žingsnis „Vidaus nuorodos“ iškart po „Maršruto tvarka“ (PR laikas, 16 žingsnių). `.github/workflows/pages.yml` — tas pats vartas **surinktame `_site` po `?v=` injekcijos**: jei nuoroda lūžusi, deploy nenueina ir svetainė lieka ankstesnė, o ne balta.
│ +- **Teiginys turi paleidžiamą įrodymą (LL-36):** `scripts/probe_refs.py` → **9/9**, rc 0: K1 švarus veidrodis rc 0 (29 nuorodos); K2 lūžęs statinis importas **vienguboje kabutėje** → rc 1, `assets/js/sims/calba.js:6`; K3 lūžęs `import()` → rc 1; K4 lūžęs CSS `url()` → rc 1 (`main.css:657`); K5 lūžęs `404.html` `href` → rc 1; K6 šabloninis importas → rc 0 ir `dynamic_template_refs: 1`; K7 tuščias veidrodis → rc 1 „NEIŠMATUOTA“; K8 niekam nereikalingas `pamirstas.js` → rc 0 su įspėjimu; K9 `https:`/`data:`/`#` klaidų nesugeneruoja. CI imitacija šviežiame `git archive` kataloge: 27 nuorodos → rc 0; įvedus `from "./art-nera.js"` → rc **1**, įvardyta `assets/js/sims/zaidimai.js:1`; atstačius → 9/9 ir rc 0.
│ +- **Tikras artefaktas, ne tik repo:** surinktas `_site` (kaip `pages.yml`: `cp index.html 404.html`, `cp -r assets content`, `?v=aaaa1111` injekcija I ir II formoms) → `check_refs.py --root _site` rc 0 (27 nuorodos, 16 JS, 2 HTML); `?v=` nuimamas prieš sprendžiant, tad žyma netampa klaidingu signalu (LL-84 pamoka pakartota).
│ +- **Vartai po pakeitimo:** `validate_content.py --grade 1 --strict` → 0 klaidų / 0 įspėjimų, rc 0; `check_registry.py` → „kryptys 9 · index 73 · failai 73 · užduotys 321 (optional 73) · sim 73 · path 73 · našlaičiai 0 / PROBLEMŲ: 0“; `check_docs_facts.py` → „Sutampa su failais.“; `check_agents.py` rc 0 (15 vaidmenų, 1 senas įspėjimas apie sisteminius pasiūlymus); `check_lessons.py` → **167** įrašai (nauja LL-167); `check_language.py --grade 1 --strict` → „švarios“; `check_audio.py` → 1 062 tekstai, 2 124 įrašai, 2 124/2 124 mp3, rc 0; `check_art.py` rc 0; `check_published.py --path-order` rc 0; `curriculum_backlog.py --check` rc 0 (šįkart suderinta — #483 pasekmė sutvarkyta); abu workflow YAML parsuoti (`validate` 16 žingsnių, `pages` build 6).
│ +- **Nepadaryta ir pasakyta (LL-36):** naršyklės matavimo (360 px / 200 % teksto) šiame paleidime nėra — `playwright` aplinkoje neįdiegtas; šis darbas keitė tik `scripts/` ir du workflow failus, tad geometrijos neteigiu.
│ +- **Sprendimas: sutampa.** 73/73 abiejose pusėse, visi 73 modulių failai gyvai `200` (+ neigiama kontrolė `404`), garsas 2 124/2 124, gyva versija = `HEAD`, 0 neišstumtų commit'ų, joks modulio ID nepernumeruotas, nieko nešalinta. Papildomai uždaryta defekto klasė, kuri šiandien nepasireiškė: nuoroda į neegzistuojantį failą dabar krenta PR vartuose ir stabdo deploy. Neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`.
│
│  ## 2026-11-23 (17:00) — Publikavimo patikra #486: repo 72 / paskelbta 72 prie `b43f208f`; maršruto tvarkos vartai perkelti į CI (pasiūlymas #42399), o ne tik į paleidimą po push; sutampa
│
│ scripts/check_refs.py
│ @@ -85,6 +85,17 @@
│          # `href="./"` — šaknis, ne failas; katalogai netikrinami.
│          return None
│      return ref
│ +
│ +
│ +def root_html(root: pathlib.Path) -> list[pathlib.Path]:
│ +    """Šaknies HTML failai, kuriuos `pages.yml` publikuoja.
│ +
│ +    Paslėpti failai (`.probe-*.html`) praleidžiami sąmoningai: jie yra zondų
│ +    likučiai darbo kopijoje, į svetainę nepatenka (`pages.yml` kopijuoja
│ +    `index.html` ir `404.html`), o jų nuorodos iškreiptų matuojamą skaičių —
│ +    tas pats principas kaip „matuok artefaktą, ne katalogą“ (LL-167).
│ +    """
│ +    return [p for p in sorted(root.glob("*.html")) if not p.name.startswith(".")]
│
│
│  def scan(root: pathlib.Path) -> tuple[list[dict], int, int]:
SPRENDIMAS: sutampa (papildomai uždarytas nematomas defektas — neegzistuojančio failo nuoroda).

check_published.py (repo / paskelbta / neišstumta)
- Repo: 73 moduliai · Paskelbta: 73 (`grade-01: repo 73, gyvai 73`), versija `72736a3e`, `unpushed_commits` 0, `deploy_pending` false
- `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `stale*`, `live_missing`, `aux_*`, `shell_*` — visi `[]`; `path_reordered` `[]`, `path_differs` false
- Garsas 2124/2124 · garso vardai 2124/2124 (vardo maišas = baitų maišas IR priekis = teksto maišas)
- Pervadintas ID vienas, sutvarkytas: `03-sakinio-tvarka` → `03-sakinio-zodziai`, `alias_ok: true`

HTTP kodai (curl, gyva svetainė)
- `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → 200
- `content/lt/grade-01/pasaulio-pazinimas/23-ismestas-daiktas-nedingsta.json` → 200
- `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` → 200
- neigiama kontrolė `.../matematika/99-nera.json` → 404
- papildomai: visi 73 `index.json` `file` adresai gyvai atskirai → 73×200, 0×404; `pages.yml` paleidimas `45265770161` = `success`, `head_sha` `72736a3e` = HEAD

Ką pakeičiau (failai)
- `scripts/check_refs.py` (naujas, be tinklo) — skaito `*.html` `href`/`src`, `assets/**/*.js` (`import … from`, `export … from`, `import()`), `assets/**/*.css` (`url(...)`), sprendžia vietines nuorodas failo katalogo atžvilgiu; lūžusi įvardijama failu + eilute; 0 rastų nuorodų = „NEIŠMATUOTA“ rc 1; šabloniniai importai skaičiuojami atskirai; įspėjimas apie niekam neprieinamus JS.
- `.github/workflows/validate.yml` — žingsnis „Vidaus nuorodos“ (PR laikas; 16 žingsnių, YAML validus).
- `.github/workflows/pages.yml` — tas pats vartas surinktame `_site` po `?v=` injekcijos: lūžusi nuoroda stabdo deploy, svetainė lieka ankstesnė, o ne balta.
- `scripts/probe_refs.py` — zondas 9/9 (K1 švarus, K2 lūžęs statinis importas vienguboj kabutėj, K3 `import()`, K4 CSS `url()`, K5 `404.html` href, K6 šabloninis importas, K7 tuščias veikrodis → rc 1, K8 našlaitis JS, K9 svetimos nuorodos). CI imitacija šviežiame `git archive`: 27 nuorodos rc 0; įvedus `from "./art-nera.js"` → rc 1 su `assets/js/sims/zaidimai.js:1`.
- `research/wiki/guidelines/pamokos.md` — nauja **LL-167** („Vartai, kurie lygina tai, kas yra, o ne tai, į ką nurodoma“); `check_lessons` 167 įrašai.
- `research/wiki/changelog.md` — įrašas „2026-11-23 (23:20) — Publikavimo patikra #491…“.

Vartai po pakeitimo
validate_content --grade 1 --strict 0/0 rc 0 · check_registry 0 problemų (index 73 · failai 73 · užduotys 321 · sim 73 · path 73 · našlaičiai 0) · check_docs_facts „Sutampa su failais“ · check_agents rc 0 · check_lessons 167 · check_language --grade 1 --strict švaru · check_audio 1062 tekstai / 2124 mp3 rc 0 · check_art rc 0 · check_published --path-order rc 0 · curriculum_backlog --check rc 0 (šįkart suderinta) · check_refs 27/27 rc 0.

NEPADARYTA IR PASAKYTA
- Naršyklės matavimo (360 px / 200 %) nėra — `playwright` aplinkoje neįdiegtas; keistas tik `scripts/` ir du workflow, geometrijos neteigiu.
- `git push` nedarytas (bėgiklio darbas). Neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`; joks modulio ID nepernumeruotas, nieko nešalinta.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-58ca5e2aecf81f7bd6aeefdfb27522b74fd2cc439cfd9fd859b75b11e52fb724
```
