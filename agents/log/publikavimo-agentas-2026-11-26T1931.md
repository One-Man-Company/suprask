# publikavimo-agentas — 2026-11-26T1931

- paleidimas: #560 (manual)
- trukmė: 3641s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/probe560_404depth.py
│ @@ -0,0 +1,56 @@
│ +"""Zondas #560: ar 404.html CSS ir nuorodos veikia tame gylyje, kuriame ji rodoma.
│ +
│ +GitHub Pages 404.html atiduoda **bet kuriame** neteisingame adrese, t.y. puslapis
│ +renderinamas to URL gylio atžvilgiu. Failo nuorodos yra santykinės (`./assets/...`),
│ +tad `content/lt/grade-01/matematika/99-nera.json` atveju naršyklė ieško
│ +`content/lt/grade-01/matematika/assets/css/main.css`.
│ +
│ +Matuojama gyvoje svetainėje: CSS atsakymas, kompiuterinis stilius (body background
│ +skiriasi nuo naršyklės numatytojo), „Į pradžią“ taikinio atsakymas, konsolės klaidos.
│ +"""
│ +from __future__ import annotations
│ +
│ +import sys
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +CASES = [
│ +    "/content/lt/grade-01/matematika/99-nera.json",
│ +    "/klase/9/nieko",
│ +    "/",
│ +]
│ +fail = 0
│ +with sync_playwright() as p:
│ +    b = p.chromium.launch()
│ +    ctx = b.new_context(viewport={"width": 390, "height": 800})
│ +    for path in CASES:
│ +        pg = ctx.new_page()
│ +        errs, reqs = [], []
│ +        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
│ +        pg.on("requestfailed", lambda r: reqs.append((r.url, r.failure)))
│ +        pg.goto(BASE.lstrip("/") + path.lstrip("/"), wait_until="load")
│ +        status = pg.evaluate("() => document.title")
│ +        bg = pg.evaluate("() => getComputedStyle(document.body).backgroundColor")
│ +        head = pg.evaluate("() => getComputedStyle(document.querySelector('main')).textAlign")
│ +        link = pg.evaluate("""() => {
│ +            const a = document.querySelector('main a');
│ +            return a ? a.href : null;
│ +        }""")
│ +        css_status = pg.evaluate("""async () => {
│ +            const r = await fetch('./assets/css/main.css', {cache:'no-store'});
│ +            return r.status;
│ +        }""")
│ +        print(f"--- {path}")
│ +        print(f"    title            : {status}")
│ +        print(f"    body background  : {bg}")
│ +        print(f"    main text-align  : {head}")
│ +        print(f"    CTA href         : {link}")
│ +        print(f"    ./assets CSS     : {css_status}")
│ +        print(f"    console errors   : {errs}")
│ +        print(f"    failed requests  : {reqs}")
│ +        ok = css_status == 200 and bg not in ("rgba(0, 0, 0, 0)", "rgb(255, 255, 255)")
│ +        if not ok:
│ +            fail += 1
│ +    b.close()
│ +print(f"\nNEVEIKIA: {fail}/{len(CASES)}")
│ +sys.exit(1 if fail else 0)
│ 404.html
│ @@ -4,14 +4,70 @@
│  <meta charset="utf-8">
│  <meta name="viewport" content="width=device-width, initial-scale=1">
│  <title>Suprask! — puslapis nerastas</title>
│ -<link rel="stylesheet" href="./assets/css/main.css">
│ +<!--
│ +  Šis failas atiduodamas BET KURIAME neteisingame adrese, o naršyklė jį
│ +  renderina to adreso gylio atžvilgiu. Todėl santykinės nuorodos čia lūžta:
│ +  adresu /suprask/content/lt/grade-01/matematika/99-nera.json `./assets/css/main.css`
│ +  virsta /suprask/content/lt/grade-01/matematika/assets/css/main.css → 404, o
│ +  `./` mygtukas — /suprask/content/lt/grade-01/matematika/ → 404. Matuota
│ +  2026-11-26 gyvoje svetainėje (Chromium, 390 px): 2 iš 3 adresų davė baltą
│ +  nestiliuotą puslapį su neveikiančiu mygtuku (3–4 konsolės klaidos).
│ +  Todėl nuorodos surenkamos iš svetainės ŠAKNIES, o šaknis ne spėjama:
│ +  tikrinami kelio priešai, kol randa tą, kuriame yra index.html (LL-210).
│ +-->
│  </head>
│  <body>
│ -<main style="text-align:center;padding-top:4rem">
│ +<main id="nera" style="text-align:center;padding:4rem 1.2rem">
│    <p class="eyebrow">404</p>
│    <h1>Čia nieko nėra</h1>
│ -  <p class="lede" style="color:var(--ink-soft);margin-inline:auto">Puslapis nerastas. Gal jis dar nesukurtas — arba adresas pasikeitė.</p>
│ -  <a class="btn" href="./">Į pradžią</a>
│ +  <p class="lede">Puslapis nerastas. Gal jis dar nesukurtas — arba adresas pasikeitė.</p>
│ +  <p><a class="btn" id="i-pradzia" href="/">Į pradžią</a></p>
│ +  <noscript>
│ +    <p><strong>Grįžk į pradžią.</strong> Šiame puslapyje nuoroda įjungiama
│ +    scenarijumi; adreso juostoje įrašyk svetainės adresą ir spausk „Enter“.</p>
│ +  </noscript>
│  </main>
│ +<script>
│ +/* Šaknis ieškoma klausiant serverio, o ne spėjant pagal domeną: projektinis
│ +   puslapis (`…github.io/suprask/`) ir savas domenas turi skirtingą šaknį, o
│ +   404 puslapis nežino, kuriame gylyje jis atsidūrė. Kandidatai — kelio priešai
│ +   nuo ilgiausio iki trumpiausio; pirmas, kuriame yra index.html, ir yra šaknis.
│ +   Be scenarijaus puslapis lieka be stiliaus, bet tekstas perskaitomas, o
│ +   `<noscript>` pasako, ką daryti. */
│ +(function () {
│ +  var link = document.getElementById("i-pradzia");
│ +  if (location.protocol === "file:") return;
│ +
│ +  var parts = location.pathname.split("/").filter(Boolean);
│ +  var candidates = [];
│ +  for (var i = parts.length; i >= 0; i--) {
│ +    var base = "/" + parts.slice(0, i).join("/") + (i ? "/" : "");
│ +    if (candidates.indexOf(base) === -1) candidates.push(base);
│ +  }
│ +
│ +  function apply(root) {
│ +    var css = document.createElement("link");
│ +    css.rel = "stylesheet";
│ +    css.href = root + "assets/css/main.css";
│ +    document.head.appendChild(css);
│ +    if (link) link.href = root;
│ +  }
│ +
│ +  function next(n) {
│ +    if (n >= candidates.length) {
│ +      /* Nė vienas kandidatas neatsakė (pvz., be tinklo). Mygtukas vis tiek
│ +         turi vesti kažkur — į šaknį, o ne likti miręs. */
│ +      if (link) link.href = "/";
│ +      return;
│ +    }
│ +    var base = candidates[n];
│ +    fetch(base + "index.html", { method: "HEAD", cache: "no-store" })
│ +      .then(function (r) { return r.ok ? base : next(n + 1); })
│ +      .catch(function () { next(n + 1); });
│ +  }
│ +
│ +  next(0);
│ +})();
│ +</script>
│  </body>
│  </html>
│ 404.html
│ @@ -3,37 +

… PRALEISTA 71250 SIMBOLIŲ IŠ 89250 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00560/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

usas, `body` fonas `rgb(253, 248, 239)`, `.btn` 48 px su `border-radius: 999px`, „Į pradžią“ taikinys **200**, 0 nepavykusių užklausų. Prieš taisymą toje pačioje matuoklėje — **0/4**. Kontrastas (T5.5): tekstas 15,33:1, lede 6,71:1, mygtukas 6,92:1, tamsi tema 15,35:1 / 9,67:1 — visi ≥ 4,5:1.
│ research/wiki/changelog.md
│ @@ -10,7 +10,7 @@
│  - **Ką pakeičiau.** `404.html`: (1) nuorodos — nuo šaknies, o šaknis nustatoma pagal publikavimo sutartį (`*.github.io` → `/<repo>/`, savas domenas → `/`), be tinklo užklausų: pirmoji versija bandė protėvius po vieną ir palikdavo 5 konsolės klaidas, kurios užgožia tikras; (2) apatiniai stiliai įrašyti tiesiai `<style>` bloke — puslapis perskaitomas, kai `main.css` neįsikelia (be scenarijų, be tinklo, su senu kešu), o `main.css` vėliau tik perima tas pačias deklaracijas; (3) ta pati `data:` favicona kaip `index.html` — be jos naršyklė prašo `/favicon.ico`, gauna 404 ir palieka antrą klaidą; (4) `<noscript>` pasako, ką daryti be scenarijų.
│  - **Vartas (`scripts/check_published.py`).** `DEPTH_SERVED` + `depth_refs()` + `depth_served_check()`: puslapis, atiduodamas bet kuriame gylyje, privalo naudoti tik nuo gylio nepriklausančias nuorodas (`/…`, `http(s):`, `data:`). `report()` gauna `depth_relative` / `depth_checked` / `depth_skipped`; `verdict()` turi savo priežastį („N santykinė nuoroda puslapyje, atiduodamame bet kuriame gylyje“), CLI — atskirą eilutę su failu ir eilute, sėkmės eilutė — „gylio nuorodos N tikrintos, visos absoliučios“. Trūkstamas failas duoda `depth_skipped` (ne „švaru“, LL-37). Antras vartas tame pačiame kelyje — `depth_palette_check()`: atsarginis `<style>` blokas yra `main.css` tokenų **vertimų kopija**, tad jo reikšmės lyginamos su `:root` kiekvieną bėgimą (`palette_mismatch`, `palette_checked`); kitaip dizaineriui pakeitus tokeną puslapis tyliai liktų „šiek tiek kitoks“ (LL-21 šeima).
│  - **Pirmoji varto versija buvo neteisinga, ir tai parodė zondas prieš commit'ą:** `ABSOLUTE_REF` reikalavo `/` + ne-`/` simbolio, tad `href="/"` buvo klaidingai raudonas (60/60 vietoj žalios). Pataisyta, bet pamoka ta pati: vartas, kurio pirmas bėgimas raudonas dėl savo paties rašto, yra LL-202 šeima — todėl zondas privalo turėti ir teigiamą, ir neigiamą atvejį.
│ -- **Įrodymas repo (`scripts/probe_publish_sets.py` → 60/60, rc 0, be interneto).** Z: `depth_relative []`, `depth_checked 2`, `depth_skipped []`; Z2 (neigiama kontrolė): `href="./"` → raudona su `404.html:<eilutė> „./“`, CLI spausdina „SANTYKINĖ NUORODA … BET KURIAME GILYJE“, rc 1; Z3: atstačius → vėl žalia; Z4: trūkstamas failas → `depth_skipped`, rc 1. A–Y išliko žali (tame tarpe S, U, V, W, X, X2, kurių priežasčių sąrašas prieš tai buvo užterštas mano rašto klaida).
│ +- **Įrodymas repo (`scripts/probe_publish_sets.py` → 63/63, rc 0, be interneto).** Z: `depth_relative []`, `depth_checked 2`, `depth_skipped []`; Z2 (neigiama kontrolė): `href="./"` → raudona su `404.html:<eilutė> „./“`, CLI spausdina „SANTYKINĖ NUORODA … BET KURIAME GILYJE“, rc 1; Z3: atstačius → vėl žalia; Z4: trūkstamas failas → `depth_skipped`, rc 1; Z5: `main.css --paper` → `#abc123` → `palette_mismatch`, CLI „NEBEATITINKA main.css“, rc 1; Z6: atstačius → vėl žalia. A–Y išliko žali (tame tarpe S, U, V, W, X, X2, kurių priežasčių sąrašas prieš tai buvo užterštas mano rašto klaida).
│  - **Įrodymas naršyklėje (Chromium, 390 px, vietinis serveris su Pages 404 sutartimi).** Abi publikavimo formos — `/suprask/` ant `*.github.io` (per `--host-resolver-rules`) ir savas domenas ties `/`: 5 adresų × 2 formas = **10/10** — 404 statusas, `body` fonas `rgb(253, 248, 239)`, `.btn` 48 px su `border-radius: 999px`, „Į pradžią“ taikinys **200**, 0 nepavykusių užklausų. Prieš taisymą toje pačioje matuoklėje — **0/4**. Kontrastas (T5.5): tekstas 15,33:1, lede 6,71:1, mygtukas 6,92:1, tamsi tema 15,35:1 / 9,67:1 — visi ≥ 4,5:1.
│  - **Antras radinys, ištaisytas tame pačiame darbe (LL-36 atmaina).** `scripts/probe_refs.py` K5 keitė `./assets/css/main.css` `404.html` faile. Man perrašius puslapį ta eilutė liko tik **komentare**, o `edit()` assert'as ėjo per tekstą, ne per reikšmę — todėl zondas toliau „ėjo“, tik nieko nebetikrino (K5 rc 0, radinys `[]`, bendras 8/9). Dabar K5 nuorodą **įrašo** (`<link href="/assets/css/nera-tokio.css">`), o ne ieško esamos; 9/9. Tai ta pati klasė kaip LL-36 (pasiūlymo įrodymas, kurio faile nebeliko), tik zondo fixture'e.
│  - **Vartai po pakeitimo:** `validate_content.py --grade 1 --strict` 0/0; `check_registry.py --grade 1` index 82 / užduotys 359 / sim 82 / path 82 / PROBLEMŲ 0; `check_language.py --grade 1 --strict` 0/0 (55 pastabos); `check_refs.py` 26 nuorodos (anksčiau 27 — `404.html` nebeturi santykinės CSS nuorodos); `check_ui.py` 0/0; `check_docs_facts.py` sutampa; `check_audio.py` 1 213 tekstų / 2 426 įrašų; `check_lessons.py` **210** įrašų (LL-210); `check_agents.py` rc 0; `check_published.py --path-order` rc 0; `--scope` rc 0; `probe_publish_sets.py` 60/60; `probe_refs.py` 9/9; `py_compile` OK.
│ research/wiki/changelog.md
│ @@ -13,7 +13,7 @@
│  - **Įrodymas repo (`scripts/probe_publish_sets.py` → 63/63, rc 0, be interneto).** Z: `depth_relative []`, `depth_checked 2`, `depth_skipped []`; Z2 (neigiama kontrolė): `href="./"` → raudona su `404.html:<eilutė> „./“`, CLI spausdina „SANTYKINĖ NUORODA … BET KURIAME GILYJE“, rc 1; Z3: atstačius → vėl žalia; Z4: trūkstamas failas → `depth_skipped`, rc 1; Z5: `main.css --paper` → `#abc123` → `palette_mismatch`, CLI „NEBEATITINKA main.css“, rc 1; Z6: atstačius → vėl žalia. A–Y išliko žali (tame tarpe S, U, V, W, X, X2, kurių priežasčių sąrašas prieš tai buvo užterštas mano rašto klaida).
│  - **Įrodymas naršyklėje (Chromium, 390 px, vietinis serveris su Pages 404 sutartimi).** Abi publikavimo formos — `/suprask/` ant `*.github.io` (per `--host-resolver-rules`) ir savas domenas ties `/`: 5 adresų × 2 formas = **10/10** — 404 statusas, `body` fonas `rgb(253, 248, 239)`, `.btn` 48 px su `border-radius: 999px`, „Į pradžią“ taikinys **200**, 0 nepavykusių užklausų. Prieš taisymą toje pačioje matuoklėje — **0/4**. Kontrastas (T5.5): tekstas 15,33:1, lede 6,71:1, mygtukas 6,92:1, tamsi tema 15,35:1 / 9,67:1 — visi ≥ 4,5:1.
│  - **Antras radinys, ištaisytas tame pačiame darbe (LL-36 atmaina).** `scripts/probe_refs.py` K5 keitė `./assets/css/main.css` `404.html` faile. Man perrašius puslapį ta eilutė liko tik **komentare**, o `edit()` assert'as ėjo per tekstą, ne per reikšmę — todėl zondas toliau „ėjo“, tik nieko nebetikrino (K5 rc 0, radinys `[]`, bendras 8/9). Dabar K5 nuorodą **įrašo** (`<link href="/assets/css/nera-tokio.css">`), o ne ieško esamos; 9/9. Tai ta pati klasė kaip LL-36 (pasiūlymo įrodymas, kurio faile nebeliko), tik zondo fixture'e.
│ -- **Vartai po pakeitimo:** `validate_content.py --grade 1 --strict` 0/0; `check_registry.py --grade 1` index 82 / užduotys 359 / sim 82 / path 82 / PROBLEMŲ 0; `check_language.py --grade 1 --strict` 0/0 (55 pastabos); `check_refs.py` 26 nuorodos (anksčiau 27 — `404.html` nebeturi santykinės CSS nuorodos); `check_ui.py` 0/0; `check_docs_facts.py` sutampa; `check_audio.py` 1 213 tekstų / 2 426 įrašų; `check_lessons.py` **210** įrašų (LL-210); `check_agents.py` rc 0; `check_published.py --path-order` rc 0; `--scope` rc 0; `probe_publish_sets.py` 60/60; `probe_refs.py` 9/9; `py_compile` OK.
│ +- **Vartai po pakeitimo:** `validate_content.py --grade 1 --strict` 0/0; `check_registry.py --grade 1` index 82 / užduotys 359 / sim 82 / path 82 / PROBLEMŲ 0; `check_language.py --grade 1 --strict` 0/0 (55 pastabos); `check_refs.py` 26 nuorodos (anksčiau 27 — `404.html` nebeturi santykinės CSS nuorodos); `check_ui.py` 0/0; `check_docs_facts.py` sutampa; `check_audio.py` 1 213 tekstų / 2 426 įrašų; `check_lessons.py` **210** įrašų (LL-210); `check_agents.py` rc 0; `check_published.py --path-order` rc 0; `--scope` rc 0; `probe_publish_sets.py` 63/63; `probe_refs.py` 9/9; `py_compile` OK.
│  - **Sprendimas: ištaisyta.** `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, modulių ID, `path.json` seka ir vaiko `localStorage` raktai neliesti; nieko nešalinta, joks ID nepernumeruotas; push nedarytas (bėgiklio darbas). Failai repo: `404.html`, `scripts/check_published.py`, `scripts/probe_publish_sets.py`, `scripts/probe_refs.py`, `research/wiki/guidelines/pamokos.md` (LL-210), `research/wiki/changelog.md`, `agents/proposals/2026-11-26-publikavimo-agentas-404-gylio-nuorodos.json` (pasiūlymas `check_refs.py` savininkui).
│
│  ## 2026-11-26 (17:02) — Publikavimo patikra #559: repo 82 / paskelbta 82 prie `cf6f1ee8`, garsas 2 426/2 426, 82/82 modulių puslapiai realioje naršyklėje be klaidų; palaikyta, bet rastas NE ŠIO COMMIT'O gedimas — seno `localStorage` įrašo forma palieka pradžią, klasę ir kryptį be modulių sąrašo (LL-209, pasiūlymas #55901)
Sprendimas: **ištaisyta** (failas `404.html` + vartas `scripts/check_published.py`).

**`check_published.py` (165 s, rc 1):** repo 82 / paskelbta 82 (`grade-01`: repo 82, gyvai 82). `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `missing_in_repo`, `live_missing`, `live_gone`, `stale*`, `aux_*` — visi `[]`. Garsas 2 426/2 426, dydžiai 2 426 = Content-Length, vardo maišas 2 426/2 426 = baitai IR tekstas. Rėmas 2 532 publikuojami failai, `unmeasured []`. `live_version` = `repo_version` = `1c7b7bb2`, `unpushed` 0, `behind` 0. Vienintelė rc 1 priežastis: `1 pasenęs kodas` — `404.html` repo 4 290 B, gyvai 563 B. Tai **šis** pakeitimas; bėgiklis jį išstums po commit'o.

**HTTP kodai:** `34-dvizenklis-plius-dvizenklis.json` 200, `41-augalo-dalys.json` 200, `03-sakinio-zodziai.json` 200. Neigiama kontrolė: `99-nera.json` 404 (563 B).

**Defektas.** `404.html` yra vienintelis puslapis, kurį vaikas pamato, kai adresas neteisingas. GitHub Pages jį atiduoda bet kuriame neteisingame adrese **be peradresavimo**, o naršyklė dokumentą renderina *to adreso gylio* atžvilgiu. Nuorodos buvo santykinės (`./assets/css/main.css`, `./`). Matuota gyvai Chromium 390 px: 2 iš 3 adresų — baltas nestiliuotas puslapis (`body` bg `rgba(0,0,0,0)`), CSS 404, „Į pradžią" veda į dar vieną 404. Šaknyje tas pats failas atrodo sveikai, todėl `curl` 200 ir baitų lygybė to nematė.

**Ką pakeičiau** (nieko iš `content/`, `assets/`, `docs/`, `AGENTS.md`):
- `404.html` — nuorodos nuo šaknies (šaknis iš publikavimo sutarties: `*.github.io` → `/<repo>/`, savas domenas → `/`, be tinklo užklausų), apatiniai stiliai įrašyti tiesiai, `data:` favicona, `<noscript>`.
- `scripts/check_published.py` — `depth_refs()`/`depth_served_check()` + `depth_palette_check()`: puslapis, atiduodamas bet kuriame gylyje, privalo naudoti absoliučias nuorodas, o jo spalvos — sutapti su `main.css` tokenais.
- `scripts/probe_publish_sets.py` — Z/Z2/Z3/Z4/Z5/Z6, **63/63** (Z2/Z5 neigiamos kontrolės: `href="./"` ir pakeistas `--paper` duoda rc 1 ir įvardija failą).
- `scripts/probe_refs.py` — K5 fixture'is keitė tekstą, kurio mano perrašytame puslapyje nebėra; zondas toliau „ėjo", tik nieko nebetikrino (8/9). Dabar nuorodą įrašo — **9/9**.
- `research/wiki/guidelines/pamokos.md` — **LL-210**; `research/wiki/changelog.md` — #560 įrašas; pasiūlymas `check_refs.py` savininkui (jis sprendžia nuorodą failo vietos, o ne atidarymo gylio atžvilgiu).

**Du dalykus pagavau savo pačiame darbe:** pirmoji `ABSOLUTE_REF` versija `href="/"` laikė santykine (zondas parodė 60/60 vietoj žalios), o pirmoji `404.html` versija tikrino protėvius po vieną ir palikdavo 5 konsolės klaidas. Abu pataisyta prieš commit'ą.

**Vartai:** `validate_content --grade 1 --strict` 0/0 · `check_registry` index 82 / užduotys 359 / sim 82 / path 82 / PROBLEMŲ 0 · `check_language --strict` 0/0 · `check_refs` 26/26 · `check_ui` 0/0 · `check_docs_facts` sutampa · `check_audio` 1 213 tekstų / 2 426 įrašų · `check_lessons` 210 · `check_agents` rc 0 · `--path-order` rc 0 · `--scope` rc 0 · visi 8 `probe_*.py` rc 0 · `py_compile` OK · naršyklė 10/10 (abi publikavimo formos).

Push nedarytas (bėgiklio darbas). Modulių ID, `path.json` seka ir `localStorage` raktai neliesti.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-355cf1ac5a6c48f6454ebbd3b0751c377bbcd7cb87574d017080a8ca3e373d63
```
