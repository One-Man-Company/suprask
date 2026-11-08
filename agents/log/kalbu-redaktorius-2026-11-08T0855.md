# kalbu-redaktorius — 2026-11-08T0855

- paleidimas: #137 (manual)
- trukmė: 1633s
- exit: 0 → ok
- modelis: hermes:ling31flash

## Ataskaita

│ profiles/ling31flash/cache/scratch/audit_dump.py
│ @@ -0,0 +1,63 @@
│ +#!/usr/bin/env python3
│ +"""Dump all grade-01 modules' child-facing fields for manual language audit."""
│ +import json, glob, os, re
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +files = sorted(glob.glob(os.path.join(ROOT, "content/lt/grade-01/*/*.json")))
│ +files = [f for f in files if not os.path.basename(f) == "index.json"]
│ +out = []
│ +for f in files:
│ +    d = json.load(open(f, encoding="utf-8"))
│ +    out.append("=" * 100)
│ +    out.append(f"ID: {d.get('id')}  |  file: {os.path.relpath(f, ROOT)}")
│ +    out.append(f"title: {d.get('title')}")
│ +    out.append(f"subtitle: {d.get('subtitle')}")
│ +    out.append(f"minutes: {d.get('minutes')}")
│ +    out.append("outcomes:")
│ +    for o in d.get("outcomes", []):
│ +        out.append(f"  - {o}")
│ +    c = d.get("concept", {})
│ +    out.append(f"concept.title: {c.get('title')}")
│ +    out.append(f"concept.big_idea: {c.get('big_idea')}")
│ +    out.append("concept.steps:")
│ +    for s in c.get("steps", []):
│ +        out.append(f"  - {s}")
│ +    if c.get("example"):
│ +        out.append(f"concept.example: {c.get('example')}")
│ +    sim = d.get("sim") or {}
│ +    out.append(f"sim.component: {sim.get('component')}")
│ +    cfg = sim.get("config", {}) or {}
│ +    for k, v in cfg.items():
│ +        if isinstance(v, str):
│ +            out.append(f"sim.config.{k}: {v}")
│ +        elif isinstance(v, dict):
│ +            for k2, v2 in v.items():
│ +                if isinstance(v2, str):
│ +                    out.append(f"sim.config.{k}.{k2}: {v2}")
│ +                elif isinstance(v2, list):
│ +                    for i, item in enumerate(v2):
│ +                        if isinstance(item, str):
│ +                            out.append(f"sim.config.{k}.{k2}[{i}]: {item}")
│ +                        else:
│ +                            out.append(f"sim.config.{k}.{k2}[{i}]: {json.dumps(item, ensure_ascii=False)}")
│ +        elif isinstance(v, list):
│ +            for i, item in enumerate(v):
│ +                out.append(f"sim.config.{k}[{i}]: {json.dumps(item, ensure_ascii=False)}")
│ +        else:
│ +            out.append(f"sim.config.{k}: {json.dumps(v, ensure_ascii=False)}")
│ +    out.append(f"reflect: {d.get('reflect')}")
│ +    out.append("tasks:")
│ +    for i, t in enumerate(d.get("tasks", [])):
│ +        out.append(f"  [{i}] q: {t.get('q')}")
│ +        for j, opt in enumerate(t.get("options", [])):
│ +            mark = " <== ANSWER" if j == t.get("answer") else ""
│ +            out.append(f"      opt[{j}]: {opt}{mark}")
│ +        out.append(f"      answer: {t.get('answer')}  optional: {t.get('optional', False)}")
│ +        out.append(f"      hint: {t.get('hint')}")
│ +        out.append(f"      why:  {t.get('why')}")
│ +    out.append("")
│ +txt = "\n".join(out)
│ +dst = "/home/zoltanas/.hermes/profiles/ling31flash/cache/scratch/audit_dump.txt"
│ +open(dst, "w", encoding="utf-8").write(txt)
│ +print(f"modules: {len(files)}, chars: {len(txt)}, lines: {txt.count(chr(10))}")
│ +print("dst:", dst)
│ profiles/ling31flash/cache/scratch/lang_summary.py
│ @@ -0,0 +1,18 @@
│ +#!/usr/bin/env python3
│ +import json, collections
│ +d = json.load(open("/home/zoltanas/.hermes/profiles/ling31flash/cache/scratch/lang.json"))
│ +print("modules:", d.get("modules"), "| max_words:", d.get("max_words"), "| total issues:", len(d.get("issues", [])))
│ +per = collections.Counter()
│ +sev = collections.Counter()
│ +kind = collections.Counter()
│ +for it in d.get("issues", []):
│ +    w = it["where"]
│ +    mod = w.split("content/lt/grade-01/")[1].split("/")[1].replace(".json", "") if "grade-01" in w else w
│ +    per[mod] += 1
│ +    sev[it["severity"]] += 1
│ +    kind[it["issue"]] += 1
│ +print("severities:", dict(sev))
│ +print("kinds:", dict(kind))
│ +print("--- per module ---")
│ +for m, n in per.most_common():
│ +    print(f"{n:3d}  {m}")
│ profiles/ling31flash/cache/scratch/probe_outcomes.py
│ @@ -0,0 +1,65 @@
│ +#!/usr/bin/env python3
│ +"""Systematic scan of child-facing fields, incl. outcomes (which check_language.py skips).
│ +
│ +Word counting: spoken-word metric — numerals count as 1 word each (child says them).
│ +Tool metric (WORD_RE) excludes numerals; both shown where they differ.
│ +"""
│ +import json, glob, os, re
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask/content/lt/grade-01"
│ +WORD_RE = re.compile(r"[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+")
│ +NUM_RE = re.compile(r"\d+")
│ +
│ +def spoken_words(s):
│ +    return len(WORD_RE.findall(s)) + len(NUM_RE.findall(s))
│ +
│ +def tool_words(s):
│ +    return len(WORD_RE.findall(s))
│ +
│ +rows = []
│ +long_words = []
│ +for f in sorted(glob.glob(ROOT + "/*/*.json")):
│ +    if os.path.basename(f) in ("index.json", "path.json"):
│ +        continue
│ +    d = json.load(open(f, encoding="utf-8"))
│ +    mid = d.get("id", "?")
│ +    def add(field, text, kind):
│ +        if not isinstance(text, str) or not text.strip():
│ +            return
│ +        sw, tw = spoken_words(text), tool_words(text)
│ +        if sw > 10:
│ +            rows.append((mid, field, sw, tw, text))
│ +        for w in WORD_RE.findall(text):
│ +            if len(w) > 13:
│ +                long_words.append((mid, field, w, len(w)))
│ +    for i, o in enumerate(d.get("outcomes") or []):
│ +        add(f"outcomes[{i}]", o, "sakinys")
│ +    c = d.get("concept") or {}
│ +    add("concept.title", c.get("title"), "")
│ +    add("concept.big_idea", c.get("big_idea"), "")
│ +    for i, s in enumerate(c.get("steps") or []):
│ +        add(f"concept.steps[{i}]", s, "")
│ +    add("concept.example", c.get("example"), "")
│ +    add("subtitle", d.get("subtitle"), "")
│ +    add("reflect", d.get("reflect"), "")
│ +    for i, t in enumerate(d.get("tasks") or []):
│ +        add(f"tasks[{i}].q", t.get("q"), "")
│ +        for j, o in enumerate(t.get("options") or []):
│ +            add(f"tasks[{i}].opt[{j}]", o, "")
│ +        add(f"tasks[{i}].hint", t.get("hint"), "")
│ +        add(f"tasks[{i}].why", t.get("why"), "")
│ +
│ +print("=== SAKINIAI >10 ŽODŽIŲ (ištariamasis skaičius; įskaitant outcomes) ===")
│ +for mid, field, sw, tw, text in rows:
│ +    flag = " [įrankis nemato: outcomes]" if field.startswith("outcomes") else ""
│ +    print(f"{mid} | {field} | ištariamai {sw} / įrankis {tw}{flag} | {text}")
│ +print(f"\nViso per ilgių sakičių: {len(rows)}; iš jų outcomes: {sum(1 for r in rows if r[1].startswith('outcomes'))}")
│ +print("\n=== ŽODŽIAI >13 RAIDŽIŲ (visi vaikui skaitomi laukai) ===")
│ +seen = set()
│ +for mid, field, w, n in long_words:
│ +    k = (mid, w)
│ +    if k in seen:
│ +        continue
│ +    seen.add(k)
│ +    print(f"{mid} | {field} | {w} ({n})")
│ +print(f"\nIš viso ilgų žodžių atvejų: {len(long_words)}, unikalūs (modulis,žodis): {len(seen)}")
│ profiles/ling31flash/cache/scratch/lang_details.py
│ @@ -0,0 +1,13 @@
│ +#!/usr/bin/env python3
│ +import json
│ +d = json.load(open("/home/zoltanas/.hermes/profiles/ling31flash/cache/scratch/lang.json"))
│ +want = {"18-taskas-tiese-spindulys-atkarpa", "16-vandens-busenos", "17-judejimas",
│ +        "09-augalo-gyvenimas", "10-gyvunu-grupes", "13-akmenelis-popierius",
│ +        "12-bendradarbiavimo-tiltas", "04-kaip-zmones-sveikinasi"}
│ +for it in d.get("issues", []):
│ +    if any(w in it["where"] for w in want):
│ +        print(it["severity"].upper(), "|", it["where"], "|", it["issue"], "|", it.get("detail",""), "|", it.get("text",""))
│ +print("---- visi warn ----")
│ +for it in d.get("issues", []):
│ +    if it["severity"] == "warn":
│ +        print("WARN |", it["where"], "|", it["issue"], "|", it.get("detail",""), "|", it.get("text",""))
│ profiles/ling31flash/cache/scratch/probe_sentences.py
│ @@ -0,0 +1,72 @@
│ +#!/usr/bin/env python3
│ +"""Sentence-level scan (like check_language.py) BUT counting numerals as words,
│ +and covering outcomes (which the tool skips entirely).
│ +Shows only tool-blind findings: outcomes field, or spoken>10 where tool<=10."""
│ +import json, glob, os, re
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask/content/lt/grade-01"
│ +WORD_RE = re.compile(r"[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+")
│ +NUM_RE = re.compile(r"\d+")
│ +
│ +def sentences(text):
│ +    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text or "") if s.strip()]
│ +
│ +def spoken(s):
│ +    return len(WORD_RE.findall(s)) + len(NUM_RE.findall(s))
│ +
│ +def toolw(s):
│ +    return len(WORD_RE.findall(s))
│ +
│ +print("=== A) OUTCOMES: sakinys >10 žodžių (įrankis outcomes išvis netikrina) ===")
│ +n = 0
│ +for f in sorted(glob.glob(ROOT + "/*/*.json")):
│ +    if os.path.basename(f) in ("index.json", "path.json"):
│ +        continue
│ +    d = json.load(open(f, encoding="utf-8"))
│ +    for i, o in enumerate(d.get("outcomes") or []):
│ +        for sent in sentences(o):
│ +            if spoken(sent) > 10:
│ +                n += 1
│ +                print(f"{d['id']} | outcomes[{i}] | {spoken(sent)} ž. | {sent}")
│ +print(f"iš viso: {n}\n")
│ +
│ +print("=== B) SKAIČIŲ INFLIACIJA: įrankis ≤10, ištariamai >10 (skaičiai kaip žodžiai) ===")
│ +m = 0
│ +for f in sorted(glob.glob(ROOT + "/*/*.json")):
│ +    if os.path.basename(f) in ("index.json", "path.json"):
│ +        continue
│ +    d = json.load(open(f, encoding="utf-8"))
│ +    c = d.get("concept") or {}
│ +    fields = [("title", d.get("title")), ("subtitle", d.get("subtitle")),
│ +              ("concept.title", c.get("title")), ("concept.big_idea", c.get("big_idea")),
│ +              ("reflect", d.get("reflect"))]
│ +    fields += [(f"concept.steps[{i}]", s) for i, s in enumerate(c.get("steps") or [])]
│ +    if c.get("example"):
│ +        fields.append(("concept.example", c.get("example")))
│ +    for i, t in enumerate(d.get("tasks") or []):
│ +        fields += [(f"tasks[{i}].q", t.get("q")), (f"tasks[{i}].hint", t.get("hint")),
│ +                   (f"tasks[{i}].why", t.get("why"))]
│ +        for j, o in enumerate(t.get("options") or []):
│ +            fields.append((f"tasks[{i}].opt[{j}]", o))
│ +    for fname, text in fields:
│ +        if not isinstance(text, str):
│ +            continue
│ +        for sent in sentences(text):
│ +            tw, sw = toolw(sent), spoken(sent)
│ +            if tw <= 10 < sw:
│ +                m += 1
│ +                print(f"{d['id']} | {fname} | įr.{tw} / išt.{sw} | {sent}")
│ +print(f"iš viso: {m}\n")
│ +
│ +print("=== C) ILGI ŽODŽIAI (>13) OUTCOMESUOSE (įrankis nemato) ===")
│ +k = 0
│ +for f in sorted(glob.glob(ROOT + "/*/*.json")):
│ +    if os.path.basename(f) in ("index.json", "path.json"):
│ +        continue
│ +    d = json.load(open(f, encoding="utf-8"))
│ +    for i, o in enumerate(d.get("outcomes") or []):
│ +        for w in WORD_RE.findall(o):
│ +            if len(w) > 13:
│ +                k += 1
│ +                print(f"{d['id']} | outcomes[{i}] | {w} ({len(w)})")
│ +print(f"iš viso: {k}")
│ research/wiki/guidelines/kalbos-auditas.md
│ @@ -0,0 +1,94 @@
│ +# Kalbos auditas — 1 klasė (31 modulis)
│ +
│ +- **Data:** 2026-11-08
│ +- **Paleidimas:** #137 (kalbu-redaktorius, auditinis paleidimas — nieko neperrašyta)
│ +- **Apimtis:** visi 31 `content/lt/grade-01/*/*.json` moduliai, vaikui rodomi laukai: `title`, `subtitle`, `outcomes`, `concept.*`, `reflect`, `tasks[].q/options/hint/why`, `sim.config` tekstai. `teacher.*` — ne (suaugusiojo tekstas).
│ +- **Snapshotas:** HEAD `0504a80` (#136). Per auditują kitas agentas pervadino `21-erdvines-figuras.json` → `21-erdvines-figuros.json`; visi cituoti radiniai patikrinti iš naujo `grep`'ais jau po to commit'o (LL-36).
│ +- **Kaip vertinta:** iš 6–7 m. vaiko, kuris skaito lėtai, pusės. Sakinio ilgis matuojamas **ištariamai** (skaitmuo = 1 žodis, pvz. „14:00" tariama „keturiolika valandų"); įrankio (`check_language.py`) matavimas pateikiamas lygiai, kur skiriasi.
│ +
│ +## Įrankio akumos (svarbu, kol skaitote lentelę)
│ +
│ +`scripts/check_language.py` tikrina `title`, `subtitle`, `concept.*`, `reflect`, `sim.config`, `tasks[].q/options/hint/why`. **Jis visai netikrina `outcomes`** — o ten rasta 8 per ilgi (>10 ž.) sakiniai ir 3 žodžiai >13 raidžių. Be to:
│ +
│ +1. Skaitmenys ne skaičiuojami žodžiais (`WORD_RE` tik raidės) — 11 atvejų ištariamai >10 žodžių, įrankžiui rodant ≤10.
│ +2. Dviprasmiškumo taisyklės („arba", „nebūtinai") taikomos tik `tasks` laukams, ne `concept.steps`.
│ +3. Veiksmažodžio formos ir nežodžiai (`aprasojęs`, `Pakėlei`) — jokie įrankis nepažįsta; reikia žmogaus akių arba žodyno pagrindo.
│ +
│ +Dabartinė `check_language.py --grade 1` būsena: 0 klaidų, 4 įspėjimai (ilgi žodžiai), 22 pastabos (įvardis pradžioje). `validate_content.py --grade 1`: 0/0.
│ +
│ +## Lentelė (41 radinys)
│ +
│ +Sunkumas: **rimta** = vaikas supranta klaidingai ar nebegali skaityti; **vidutinė** = supranta, bet lėtas skaitytojas stoja; **smulki** = stilius/vieningumas. † — įrankis jau žymi (warn).
│ +
│ +| # | Modulis | Laukas | Problema | Siūloma formuluotė | Sunkumas |
│ +|---|---|---|---|---|---|
│ +| 1 | 10-gyvunu-grupes | tasks[2].hint (eil. 58) | Užuomina nukreipia nuo atsakymo: „bet ne apie jos turinį" — o atsakymas „plunksnos" būtent ir yra pagalvės turinys; vaikas gauna priešingą nuorodą | „Pagalvok, kuo dengtas paukštis — ne kailis, ne žvynai." | rimta |
│ +| 2 | 16-vandens-busenos | concept.example (eil. 22) | „būna aprasojęs" — tokio žodžio nėra (norėta „užparęs"); vaikas negali suprasti | „Ryte vonios veidrodis būna užparęs." | rimta |
│ +| 3 | 16-vandens-busenos | tasks[2].q (eil. 54) | „aprasojo" — taip pat nežodis | „Ryte vonios veidrodis užparojo. Kas jame?" | rimta |
│ +| 4 | 01-garso-aukstis (muzika) | tasks[0].q (eil. 48) | „Pakėlei … nelietei" — neegzistuoja šios formos (2 asm.: pakėlai, nepalietei) | „Pakėlai aukštį, o garsumo ratuko nepalietei. Kas pasikeitė?" | rimta |
│ +| 5 | 22-sudetis-per-desimti | concept.example (eil. 21) | „Du įdedi į pilną dešimtuką" — „du" skaitomas kaip skaičius arba kaip liepiamasis? Sakinys nelogiškas | „Dvi dėmes įdėk į pilną dešimtuką. Trys lieka." | rimta |
│ +| 6 | 21-erdvines-figuros | outcomes[0] | 15 žodžių viename sakinyje; įrankis outcomes netikrina | „Skiriu kūną nuo jo vaizdo. Kūgis iš priekio atrodo kitaip nei iš viršaus." | rimta |
│ +| 7 | 16-vandens-busenos | subtitle (eil. 6), outcomes[0] (eil. 9) | „neprapuola" — ne bendrinė forma, 2 vietose | subtitle: „Vanduo neišnyksta — jis keičia savo formą"; outcomes: „…vanduo neišnyksta, o būna ore kaip garas." | vidutinė |
│ +| 8 | 16-vandens-busenos | concept.steps[3] (eil. 20) | „nubyra" — retas, neaiškus žodis | „Lašai nubėga atgal į puodą." | vidutinė |
│ +| 9 | 04-skaiciu-tiese | outcomes[0] | 12 žodžių + „skaičių skaičių tiesėje" — netvarkinga | „Rodau skaičius skaičių tiesėje. Judu ja į dešinę arba į kairę." | vidutinė |
│ +| 10 | 04-skaiciu-tiese | outcomes[1] | 11 žodžių | „Paaiškinu, kad pridėti — judėti į dešinę, o atimti — į kairę." | vidutinė |
│ +| 11 | 19-simto-skaiciu-lentele | outcomes[1] | 11 žodžių | „Paaiškinu, kodėl po 19 žemiau stovi 29, o ne 20." | vidutinė |
│ +| 12 | 22-sudetis-per-desimti | outcomes[0] | 11 žodžių | „Sudedu per dešimtį. Pirma papildau dešimtuką, paskui pridedu likusį." | vidutinė |
│ +| 13 | 22-sudetis-per-desimti | outcomes[1] | 12 ištariamų žodžių (skaičiai) | „Paaiškinu, kodėl 8 + 5 patogu skaičiuoti per dešimtuką." | vidutinė |
│ +| 14 | 17-judejimas | outcomes[1] | 11 žodžių | „Paaiškinu, kodėl rutuliai atrieda beveik kartu, nors sveria skirtingai." | vidutinė |
│ +| 15 | 13-akmenelis-popierius | outcomes[2] | 11 žodžių | „Nustoju tikėti „karšta ranka". Rezultatas artėja prie trečdalio." | vidutinė |
│ +| 16 | 13-akmenelis-popierius | concept.title, concept.example † | „Atsitiktinumas" (14 raidžių) — sąvoka būtina moduliui, tai terminas, ne stiliaus klaida | Terminą palikti; įrankio warn priimtinas. Jei trumpinama — tik aplinkiniai sakiniai | vidutinė |
│ +| 17 | 07-desningumai | outcomes[0] (eil. 9) | „pasikartojančią" (15 raidžių); įrankis outcomes netikrina | „Pastebiu kartojančią seką, ją tęsiu ir randu trūkstamą narį." | vidutinė |
│ +| 18 | 07-desningumai | concept.steps[2] (eil. 19), tasks[2].hint (eil. 146) | „prognozė" — sunkus žodis 1 klasei; `big_idea` ir užduotys kitur naudoja „numatyti" | „Tai jau numatymas, o ne spėjimas." / hint: „Pagalvok apie numatymą." | vidutinė |
│ +| 19 | 01-garso-aukstis | concept.steps[2] (eil. 19) | „nebūtinai" — modalus neigimas, uždraustas 1 klasei (vaidmens taisyklė); tikrintuvas concept steps netikrina dviprasmiškumo | „Aukštas garsas gali būti tylus. Tylus garsas gali būti labai aukštas." | vidutinė |
│ +| 20 | 12-bendradarbiavimo-tiltas | outcomes[0] (eil. 9) | „bendradarbiavimas" (17 raidžių) + „pasilikimas sau" — abstraktu 6–7 m. vaikui | „Paaiškinu, kodėl draugo pagalba eina toliau nei vienam." | vidutinė |
│ +| 21 | 12-bendradarbiavimo-tiltas | title (eil. 5) † | „Bendradarbiavimo" (17 raidžių); keičiant reikia `index.json` title | Kūrėjo/dizainerio sprendimas: „Tiltas per upę" (3 ž.) | vidutinė |
│ +| 22 | 04-kaip-zmones-sveikinasi | outcomes[0] (eil. 9) | „nesudėtingą kalbos vartojimo tyrimą" — vertinys iš suaugusių kalbos | „Stebiu, kaip žmonės sveikinasi, ir rašau, ką pastebėjau." | vidutinė |
│ +| 23 | 02-medziagu-bandymas | tasks[1].q (eil. 55), tasks[3].q (eil. 77) | „…įmesti į vandenį" — dalyvis be pagalbinio veiksmažodžio; lėtas skaitytojas stoja | „Metalinį šaukštą ir medinę mentelę įmeta į vandenį. Kuri nusileis į dugną?" / „Mažą akmenuką ir didelį medinį rąstą įmeta į vandenį. Kas plauks?" | vidutinė |
│ +| 24 | 09-augalo-gyvenimas | tasks[2].hint (eil. 59) | „kai pasėji" — neteisinga forma (2 asm.: pasėjai) | „Kas atsitinka pirmiausia, kai pasėjai?" | vidutinė |
│ +| 25 | 11-saziningas-dalijimasis | tasks[1].opt[0] (eil. 42) | „tu dalijai" — neteisinga forma (refleksyvinė „dalijaisi" arba „padalinai") | „Sąžininga, nes tu padalinai." | vidutinė |
│ +| 26 | 11-saziningas-dalijimasis | tasks[1].hint (eil. 47) | „jaustumeisi" — neegzistuoja tokia forma (1 dgs. sąlyginė: jaustumės) | „Kaip jaustumės, jei tau liktų 2?" | vidutinė |
│ +| 27 | 01-garsas-ir-raide | tasks[1].opt[0] (eil. 111) | „Niekou" — rašyba (niekuo) | „Niekuo — tai tas pats." | vidutinė |
│ +| 28 | 23-piktograma-ir-stulpelis | tasks[2].q (eil. 59) | „Už mėlyną spalvą gavo 6 balsus" — trūksta veikėjo; lėtas skaitytojas neranda, kas gavo | „Už mėlyną spalvą buvo 6 balsai." | vidutinė |
│ +| 29 | 18-taskas-tiese-spindulys-atkarpa | tasks[3].opt[1] (eil. 76) | „Taip, bet tik pusiau" — be prasmės šioje situacijoje (taškas negali dalinti pusiau) | „Taip, jei jis būtų ant tiesės." | vidutinė |
│ +| 30 | 13-akmenelis-popierius | outcomes[0], outcomes[2] | 10 žodžių, bet 3 sunkūs žodžiai eilutėje (variantai lygūs, laimėjimas, atsitiktinumas) | „Paaiškinu, kodėl laimėjimas priklauso nuo atsitiktinumo." (8 ž.) | vidutinė |
│ +| 31 | 21-erdvines-figuros | tasks[3].hint (eil. 90) | „Ar kuri n os pusė plokščia?" — netvarkinga konstrukcija | „Ar nors viena pusė plokščia?" | smulki |
│ +| 32 | 21-erdvines-figuros | tasks[3].q → why (eil. 83, 91) | Sinonimas perpėtas be paaiškinimo: q „kamuolys", why „rutulys" | why: „Rutulys (kamuolys) apvalus iš visų pusių, o lėkštė plokščia." | smulki |
│ +| 33 | 18-taskas-tiese-spindulys-atkarpa | tasks[2].q (eil. 62) | „nematome" — asmuo nesutampa su kitomis užduotimis (visur 2 asm.) | „Kodėl nubrėžtos tiesės galas nematomas?" | smulki |
│ +| 34 | 18-taskas-tiese-spindulys-atkarpa | concept.example (eil. 22) | „ten, kur pakeli pieštuką" — kančiozna | „…ten, kur baigiasi piešimas." | smulki |
│ +| 35 | 06-figuros | concept.example (eil. 21) | Trūksta kablelio po dalyvio | „Plytelę pasukus, ji lieka tokia pati." | smulki |
│ +| 36 | 08-metu-laikai | tasks[2].why (eil. 60) | „migrantai" — spaudos žodis, ne vaikietiškas | „Žiemą skrendantys paukščiai rudenį išskrenda." | smulki |
│ +| 37 | 08-metu-laikai | reflect (eil. 86) † | „mėgstamiausias" (14 raidžių), superlatyvas | „Kurį metų laiką tu myli daugiausia?" | smulki |
│ +| 38 | 17-kryptys-ir-vieta | concept.steps[3] (eil. 20) | „Tikram žmogui" — šnekatinė forma | „Su tikru žmogiu kairę randi kitaip." | smulki |
│ +| 39 | 14-pinigai | tasks[1].q (eil. 58), tasks[3].q (eil. 80), tasks[0].why (eil. 55) | „rinkinys" — abstraktesnis nei modulyje kitur vartojami „pinigai" (4 vietos) | „Kuris būdas sumokės tiksliai?" / „Kuriame būde mažiausiai pinigų?" / „…tad pinigai verti 3 eurų." | smulki |
│ +| 40 | 20-laikas-12-ir-24-val | tasks[3].hint | „ką — po pietų" — elipsė su brūkšniu kančiozna | „Pagalvok, ką 2:00 reiškia naktį ir ką reiškia po pietų." | smulki |
│ +| 41 | 01-garsas-ir-raide | outcomes[2] (eil. 11) | „prasidedančius" (14 raidžių); įrankis outcomes netikrina | „Randu kelis žodžius su ta pačia pirmąja raide." | smulki |
│ +
│ +## Pasikartojantys modeliai
│ +
│ +1. **`outcomes` — įrankio akloji dėmė.** 8 sakiniai >10 žodžių, 3 žodžiai >13 raidžių, sunkūs žodžiai — visi liko nematimi, nes `check_language.py` lauko visai neskaito (LL-51).
│ +2. **Neegzistuojančios veiksmažodžio formos** (5 atvejai, 4 moduliai): „Pakėlei/nelietei", „pasėji", „tu dalijai", „jaustumeisi", „Niekou". Validatorius (diakritika, žodžiai) ir `check_language.py` (ilgis) juos nepagaužia — tik žmogaus akys arba žodyno pagrindas.
│ +3. **Nežodis sakinio vietoje:** „aprasojęs / aprasojo" (16-vandens-busenos, 2 vietos) — norėta „užparęs / užparojo".
│ +4. **Sunkus žodis ten, kur modulis turi kasdienį sinonimą:** „nebūtinai" (→ „gali būti tylus"), „prognozė" (→ „numatymas", kaip `big_idea`), „bendradarbiavimas" (→ „kartu"), „migrantai" (→ „žiemą skrendantys paukščiai"), „rinkinys" (→ „būdas / pinigai").
│ +5. **Skaičių infliacija:** įrankis ne skaito skaitmenų žodžiais; 11 atvejų ištariamai >10 žodžių, kai įrankis rodo ≤10 (daugiausia `20-laikas-12-ir-24-val`, `13-akmenelis-popierius`). Smulki, bet lėtai skaitantis vaikas skaičius taria. Pastaba: santrumpos taškas („2 val.") daro sakinį dviem įrankio matuose — LL-35 šeima.
│ +6. **Asmens nesutapimas:** klausime „…nematome?" (18-taskas) tarp 2 asm. liepiamųjų; „Jo nematome" (16-vandens steps) — priimtina bendrinė pastaboja, palikta.
│ +7. **Dalyvis be pagalbinio veiksmažodžio:** „…įmesti į vandenį" (02-medziagu-bandymas, 2 užduotys).
│ +8. **Hint'as, kuris nukreipia ne į klaidą, o į priešingybę** (10-gyvunu-grupes) — LL-22 šeima, atvirkščia kryptimi (LL-52).
│ +9. **Tikrintuvo 22 „neaiški nuoroda pradžioje" info** — peržiūrėta vienu metu: visų įvardžių (tas/jis/jie/ja) ateityje aiškus, keičiama nieko. Info lygis tinkamas.
│ +
│ … omitted 16 diff line(s) across 1 additional file(s)/section(s)
│ agents/log/kalbu-redaktorius-2026-11-08T0908-auditas.md
│ @@ -0,0 +1,54 @@
│ +# Kalbu-redaktorius, paleidimas #137 — 1 klasės kalbos auditas (31 modulis)
│ +
│ +**Data:** 2026-11-08T09:08–09:20 (+02:00) · **Vaidmuo:** kalbu-redaktorius · **Tipas:** auditinis paleidimas (užduoties blokas viršesnis: „šį paleidimą NIEKO neperrašyk — tik vertink ir rašyk ataskaitą").
│ +
│ +## Ką daryta
│ +
│ +1. Perskaityti privalomi dokumentai (`SVIETIMAS-1-GAIRES`, `KURINIO-STANDARTAS`, `ARCHITEKTURA`), vaidmens failas, `agents/state.json`, `agents/proposals/`.
│ +2. Perskaityti **visi 31** pirmos klasės moduliai (`content/lt/grade-01/*/*.json`) per terminalą (dumpas + `grep`), ne spėjant.
│ +3. Kiekvienas vaikui rodomas laukas įvertintas iš 6–7 m. vaiko, skaičiančio lėtai: `q` vienareikšmiškumas ir kiekiai, variantų prasmės skirtumas, `hint`/`why` padevumas, `subtitle`/`outcomes`/`reflect` žodynas ir ilgis, lietuvių kalbos klaidos (linksniai, veiksmažodžio formos, dvigubas neigimas, „arba", vertiniai).
│ +4. Sistemačiai išmatuoti sakinio ilgiai **ištariamajai** normai (skaitmuo = 1 žodis) ir palyginti su `check_language.py` aprėptimi.
│ +
│ +## Skaičiai
│ +
│ +- **Tikrinta modulių:** 31 (visos 7 kryptys + gyvenimo-igudziai).
│ +- **Radinių lentelėje:** **41** — **rimtų 6**, **vidutinių 24**, **smulkių 11**.
│ +- **Įrangos būsena dabar:** `check_language.py --grade 1` → 0 klaidų, 4 įspėjimai, 22 pastabos; `validate_content.py --grade 1` → 0/0 (abu išmatuoti šio paleidimo metu, HEAD `0504a80`).
│ +- **Įrangos aklos dėmės (nauja informacija):** `outcomes` laukas netikrinamas visai (8 sakiniai >10 ž., 3 žodžiai >13 raidžių liko nematomi); skaitmenys ne skaičiuojami žodžiais (11 atvejų ištariamai >10); „nebūtinai" taisyklė ne taikoma `concept.steps`; veiksmažodžio formų/„nežodžių" klaidas nei vienas įrankis nemato.
│ +
│ +## Rezultatai (deliverable'ai)
│ +
│ +- **`research/wiki/guidelines/kalbos-auditas.md`** — pilna lentelė (modulis | laukas | problema | siūloma formuluotė | sunkumas), 9 pasikartojantys modeliai, 5 prasčiausiai moduliai: **16-vandens-busenos** (2 nežodžiai „aprasojęs/aprasojo" + „neprapuola" ×2 + „nubyra"), **22-sudetis-per-desimti** (nelogiškas „Du įdedi" + 2 per ilgi outcome), **13-akmenelis-popierius** (abstrakcijos), **01-garso-aukstis** (neegzistuojančios formos „Pakėlei/nelietei" + „nebūtinai"), **10-gyvunu-grupes** (hint'as menkina — vienintelis radinys, bet blokuoja mokymąsi). Šeštas lauka eilės: 21-erdvines-figuros.
│ +- **`research/wiki/guidelines/pamokos.md`** — pridėtos **LL-51** (laukas be vartų: `outcomes`) ir **LL-52** (užuomina, nukreipianti į priešingybę nuo atsakymo).
│ +- **`agents/state.json`** — atnaujinta (`last_language_audit` + vaidmens įrašas).
│ +
│ +## Prieš/po
│ +
│ +Šis paleidimas **nieko neperrašė** — tai auditas. Turinys nepakito (`git status content/` tuščias). Prieš/po skaičiai čia netaikomi; jie bus kitame, taisymo paleidime, kuriam šis auditas yra pagrindas.
│ +
│ +## Ko sąmoningai neištaisytu (ir kodėl)
│ +
│ +- **`teacher.*`, `sources`, `svietimas1`** — ne vaikui skaitomi; vaidmens riba.
│ +- **Terminologija, kuri yra pačia sąvoka** („atsitiktinumas", „rutulys/kūgis", „spindulys/atkarpa", „dešimtukas") — nepakeista; auditas pastatė tik ten, kur sąvokai yra kasdienis sinonimas („prognozė"→„numatymas", „bendradarbiavimas"→„kartu").
│ +- **„kupiūra" vs „banknotas"** (14-pinigai) — jau atviras pasiūlymas #4802, nekartojau.
│ +- **Tikrintuvo 22 „neaiški nuoroda" info** — peržiūrėti visi: įvardžių ateitis aiški, keisti nereikia (info lygis tinkamas).
│ +- **Pedagoginiai ginčai** (06-figuros turinys, 15/20-laikas programos atitiktis, 21 modulyje „stačiakampis gretasienis") — metodininko/programos-derintojo sritis, ne kalbos redaktoriaus.
│ +- **12-bendradarbiavimo-tiltas title** — keičiant reikia `index.json`; palikta kūrėjui su pastatymu.
│ +
│ +## Kliūtys / pastatymai bėgikliui
│ +
│ +1. **Gyvas repo:** per auditują kitas agentas (#136) commit'o `0504a80` metu pervadino `21-erdvines-figuras.json` → `21-erdvines-figuros.json` ir redagavo kitus failus. Visi lentelės citatai patikrinti iš naujo `grep`'ais **po** to commit'o (LL-36 nesikartojo).
│ +2. **Radiniai #1–#6 (rimtūs) — pirmieji eilėje**; #1 (hint'as) ir #2/#3 (nežodžiai) blokuoja supratimą, ne tik lėtina skaitymą.
│ +3. **LL-51 reikalauja įrankio pataisos** (`scripts/check_language.py` pridėti `outcomes`) — tai sistemos-architekto/kalbu-redaktoriaus struktūrinis darbas, atskiras paleidimas; atitinka atvirą #4516 teminę sritį.
│ +4. Ataskaita ir `state.json` — `.gitignore` (#484); vieninteliai track'inami deliverable'ai: `kalbos-auditas.md` ir `pamokos.md` (papildymas).
│ +
│ +## Patikra
│ +
│ +- `python3 scripts/validate_content.py --grade 1` → 0 klaidų, 0 įspėjimų (09:03, tada HEAD ff27e06; po #136 commit'o turinys kito agento redaguotas — mano radiniai verifikuoti grep'ais iš naujo).
│ +- `python3 scripts/check_language.py --grade 1` → 0 klaidų, 4 įspėjimai, 22 pastabos.
│ +- `python3 scripts/check_language.py --json` → `max_words: 10`, 26 įrašų (22 info + 4 warn).
│ +- Sistemačiai probe'ai (scratch): sakinio ilgiai ištariamai, `outcomes` apžvalga, ilgų žodžių scan — visi radiniai lentelėje turi `grep` patvirtinimą iš dabartinių failų.
│ +
│ +## Touched
│ +
│ +`research/wiki/guidelines/kalbos-auditas.md` (naujas), `research/wiki/guidelines/pamokos.md` (LL-51, LL-52), `agents/state.json`, `agents/log/kalbu-redaktorius-2026-11-08T0908-auditas.md` (šis failas). **`content/` neliestas.**
│ agents/state.json
│ @@ -78,9 +78,9 @@
│        "cadence": "kas 4 h (06,10,14,18,22)"
│      },
│      "kalbu-redaktorius": {
│ -      "last_run": "2026-11-07T11:25:19",
│ -      "status": "published",
│ -      "log": "agents/log/kalbu-redaktorius-2026-11-07T1117.md",
│ +      "last_run": "2026-11-08T09:20:00",
│ +      "status": "checked",
│ +      "log": "agents/log/kalbu-redaktorius-2026-11-08T0908-auditas.md",
│        "description": "Tikrina užduočių formuluotes: vienareikšmiškumas, žodžių ilgis, sakinio ilgis",
│        "cadence": "antradieniais, penktadieniais"
│      },
│ research/wiki/guidelines/kalbos-auditas.md
│ @@ -66,7 +66,7 @@
│
│  ## Pasikartojantys modeliai
│
│ -1. **`outcomes` — įrankio akloji dėmė.** 8 sakiniai >10 žodžių, 3 žodžiai >13 raidžių, sunkūs žodžiai — visi liko nematimi, nes `check_language.py` lauko visai neskaito (LL-51).
│ +1. **`outcomes` — įrankio akloji dėmė.** 8 sakiniai >10 žodžių, 3 žodžiai >13 raidžių, sunkūs žodžiai — visi liko nematimi, nes `check_language.py` lauko visai neskaito (LL-52).
│  2. **Neegzistuojančios veiksmažodžio formos** (5 atvejai, 4 moduliai): „Pakėlei/nelietei", „pasėji", „tu dalijai", „jaustumeisi", „Niekou". Validatorius (diakritika, žodžiai) ir `check_language.py` (ilgis) juos nepagaužia — tik žmogaus akys arba žodyno pagrindas.
│  3. **Nežodis sakinio vietoje:** „aprasojęs / aprasojo" (16-vandens-busenos, 2 vietos) — norėta „užparęs / užparojo".
│  4. **Sunkus žodis ten, kur modulis turi kasdienį sinonimą:** „nebūtinai" (→ „gali būti tylus"), „prognozė" (→ „numatymas", kaip `big_idea`), „bendradarbiavimas" (→ „kartu"), „migrantai" (→ „žiemą skrendantys paukščiai"), „rinkinys" (→ „būdas / pinigai").
│ research/wiki/guidelines/kalbos-auditas.md
│ @@ -73,7 +73,7 @@
│  5. **Skaičių infliacija:** įrankis ne skaito skaitmenų žodžiais; 11 atvejų ištariamai >10 žodžių, kai įrankis rodo ≤10 (daugiausia `20-laikas-12-ir-24-val`, `13-akmenelis-popierius`). Smulki, bet lėtai skaitantis vaikas skaičius taria. Pastaba: santrumpos taškas („2 val.") daro sakinį dviem įrankio matuose — LL-35 šeima.
│  6. **Asmens nesutapimas:** klausime „…nematome?" (18-taskas) tarp 2 asm. liepiamųjų; „Jo nematome" (16-vandens steps) — priimtina bendrinė pastaboja, palikta.
│  7. **Dalyvis be pagalbinio veiksmažodžio:** „…įmesti į vandenį" (02-medziagu-bandymas, 2 užduotys).
│ -8. **Hint'as, kuris nukreipia ne į klaidą, o į priešingybę** (10-gyvunu-grupes) — LL-22 šeima, atvirkščia kryptimi (LL-52).
│ +8. **Hint'as, kuris nukreipia ne į klaidą, o į priešingybę** (10-gyvunu-grupes) — LL-22 šeima, atvirkščia kryptimi (LL-53).
│  9. **Tikrintuvo 22 „neaiški nuoroda pradžioje" info** — peržiūrėta vienu metu: visų įvardžių (tas/jis/jie/ja) ateityje aiškus, keičiama nieko. Info lygis tinkamas.
│
│  ## 5 prasčiausių modulių (taisyti pirmiausia)
│ agents/log/kalbu-redaktorius-2026-11-08T0908-auditas.md
│ @@ -19,7 +19,7 @@
│  ## Rezultatai (deliverable'ai)
│
│  - **`research/wiki/guidelines/kalbos-auditas.md`** — pilna lentelė (modulis | laukas | problema | siūloma formuluotė | sunkumas), 9 pasikartojantys modeliai, 5 prasčiausiai moduliai: **16-vandens-busenos** (2 nežodžiai „aprasojęs/aprasojo" + „neprapuola" ×2 + „nubyra"), **22-sudetis-per-desimti** (nelogiškas „Du įdedi" + 2 per ilgi outcome), **13-akmenelis-popierius** (abstrakcijos), **01-garso-aukstis** (neegzistuojančios formos „Pakėlei/nelietei" + „nebūtinai"), **10-gyvunu-grupes** (hint'as menkina — vienintelis radinys, bet blokuoja mokymąsi). Šeštas lauka eilės: 21-erdvines-figuros.
│ -- **`research/wiki/guidelines/pamokos.md`** — pridėtos **LL-51** (laukas be vartų: `outcomes`) ir **LL-52** (užuomina, nukreipianti į priešingybę nuo atsakymo).
│ +- **`research/wiki/guidelines/pamokos.md`** — pridėtos **LL-52** (laukas be vartų: `outcomes`) ir **LL-53** (užuomina, nukreipianti į priešingybę nuo atsakymo).
│  - **`agents/state.json`** — atnaujinta (`last_language_audit` + vaidmens įrašas).
│
│  ## Prieš/po
│ agents/log/kalbu-redaktorius-2026-11-08T0908-auditas.md
│ @@ -39,7 +39,7 @@
│
│  1. **Gyvas repo:** per auditują kitas agentas (#136) commit'o `0504a80` metu pervadino `21-erdvines-figuras.json` → `21-erdvines-figuros.json` ir redagavo kitus failus. Visi lentelės citatai patikrinti iš naujo `grep`'ais **po** to commit'o (LL-36 nesikartojo).
│  2. **Radiniai #1–#6 (rimtūs) — pirmieji eilėje**; #1 (hint'as) ir #2/#3 (nežodžiai) blokuoja supratimą, ne tik lėtina skaitymą.
│ -3. **LL-51 reikalauja įrankio pataisos** (`scripts/check_language.py` pridėti `outcomes`) — tai sistemos-architekto/kalbu-redaktoriaus struktūrinis darbas, atskiras paleidimas; atitinka atvirą #4516 teminę sritį.
│ +3. **LL-52 reikalauja įrankio pataisos** (`scripts/check_language.py` pridėti `outcomes`) — tai sistemos-architekto/kalbu-redaktoriaus struktūrinis darbas, atskiras paleidimas; atitinka atvirą #4516 teminę sritį.
│  4. Ataskaita ir `state.json` — `.gitignore` (#484); vieninteliai track'inami deliverable'ai: `kalbos-auditas.md` ir `pamokos.md` (papildymas).
│
│  ## Patikra
│ agents/state.json
│ @@ -420,7 +420,7 @@
│      "touched": "content/lt/grade-01/gyvenimo-igudziai/01-dovana-ir-noras.json; assets/js/sims/gyvenimas.js; assets/js/registry.js; content/lt/grade-01/index.json; content/lt/grade-01/path.json; content/lt/grades.json; README.md; docs/ARCHITEKTURA.md; research/wiki/grades/01/index.md; research/wiki/grades/README.md; assets/audio/lt/manifest.json (+10 mp3); agents/log/kurejas-2026-11-08T0904.md; agents/state.json"
│    },
│    "open_questions": "research/wiki/guidelines/klausimai.md",
│ -  "updated": "2026-11-08T09:07:08",
│ +  "updated": "2026-11-08T09:20:00",
│    "last_attribution_work": {
│      "date": "2026-11-08",
│      "run_id": 132,
│ research/wiki/guidelines/pamokos.md
│ @@ -375,3 +375,17 @@
│  - **Priežastis:** buvo matuojamas vienas skaičius — puslapio slanktis — o ne tai, ar tekstas telpa savo dėžėje. `overflow-wrap: break-word` (`assets/css/main.css:70`) leidžia laužyti žodį, todėl suspausta etiketė ne išsikiša, o subyra: vizualiai blogiau už slinktį, bet nė vienas vartas to nemato. Pasiūlymo autorius pats pažymėjo „reikia dar kartą pamatuoti prieš publikuojant“, bet matavimo kriterijus liko tas pats slanktis.
│  - **Taisyklė:** fiksuoto pločio bloko suspaudimas yra taisymas tik tada, kai po jo `scrollWidth == clientWidth` **trijose vietose**: dokumente, eilutėje ir pačioje etiketėje, o etiketės aukštis neauga (eilučių skaičius lieka toks pat). Jei to nepavyksta, etiketės negalima spausti žemiau savo ilgiausio žodžio: verčiau leisti sąmoningą eilučių lūžimą (valdikliai persikelia į antrą eilutę) negu žodžio lūžimą, nes eilučių lūžimas yra išdėstymas, o žodžio lūžimas — sugadintas tekstas.
│  - **Patikra:** zondas matuoja vienu metu: `documentElement.scrollWidth - clientWidth`, kiekvienos eilutės `scrollWidth/clientWidth`, kiekvienos etiketės `scrollWidth/clientWidth` ir aukštį (eilučių skaičių), taip pat ar vaikas neišsikiša iš eilutės. 16 px šaknyje geometrija lyginama su buvusia (etiketė 86,4 px, eilutė 331,3 px @414; 278,4 px @360), 200 % (32 px) — 0 px visuose trijuose sluoksniuose. Sprendimas priimtas tik tada, kai švarūs visi trys sluoksniai: #4739 variante A etiketė `sw/cw` 63/63, bet aukštis 133,9 px (3 eilutės) ir trečios eilutės `sw/cw` 274/259 — atmesta; pasirinktas variantas (etiketė `flex:0 1 5.4rem` be fiksuoto pločio, taškai ir mygtukai vienoje `flex` grupėje, eilučiai `flex-wrap:wrap`) davė 0 px visur, etiketė liko vienoje eilutėje (172,8×44,6 px), o 16 px šaknyje išdėstymas nepakito.
│ +
│ +## LL-52 — Laukas be vartų: `outcomes`
│ +
│ +- **Simptomas:** kalbos auditas (paleidimas #137, 31 modulis) rado 8 `outcomes` sakinius ilgesnius nei 10 žodžių (ilgiausias — 15 žodžių, `21-erdvines-figuros`) ir 3 žodžius ilgesnius nei 13 raidžių („pasikartojančią", „bendradarbiavimas", „prasidedančius"), nors `check_language.py --grade 1 --strict` buvo žalias. Outcome eilutę vaikas skaito modulinės kortelės metu — būtent čia lėtas skaitytojas labiausiai jaučia ilgį.
│ +- **Priežastis:** `check_module()` (`scripts/check_language.py:240-250`) skaito `title`, `subtitle`, `concept`, `reflect`, `sim.config` ir `tasks` laukus, bet `outcomes` sąrašo visai neperėjo. LL-38/LL-50 sutvarkė ribą ir sunkumą, bet patikrinamų laukų sąrašas liko nepilnas: naujas (arba pamirštas) laukas tyliai iškraipo aprėptį, o žalias vartas to niekada neparodo.
│ +- **Taisyklė:** kiekvienas vaikui skaitomas laukas turi būti įvardytas tikrintuvo skaitymo sąraše. Kai pridedamas naujas laukas (arba naujas modulio tipas), patikrinama, ar jis patenka bent į vieną įrankį (`check_language.py`, `validate_content.py`); jei ne — registruojama kaip atviras trūkumas, o ne paliekama tyliai.
│ +- **Patikra:** `grep -n "outcomes" scripts/check_language.py` turi grąžinti bent vieną skaitymo eilutę; zondas su 11 žodžių `outcomes` eilute → `warn`/`error`, ne tyla. Šiame darbe: prieš — 0 pranešimų apie 8 per ilgių outcome sakičių; rankinis auditas juos rado ir įrašė į `research/wiki/guidelines/kalbos-auditas.md`.
│ +
│ +## LL-53 — Užuomina, kuri nukreipia ne į klaidą, o į priešingybę
│ +
│ +- **Simptomas:** `10-gyvunu-grupes` tasks[2].hint: „Pagalvok apie pagalvę, bet ne apie jos turinį." — o teisingas variantas „Plunksnos" būtent ir yra pagalvės turinys. Vaikas, paklausęs užuominos, atmeta būtent teisingą atsakymą. `validate_content.py` ir `check_language.py` žali.
│ +- **Priežastis:** užuomina rašyta kaip žaidžiškas žodžių žaidimas (pagalvok/pagalvė), bet jos antra pusė („ne apie jos turinį") nukreipia nuo asocijacijos, kuri vedė prie atsakymo. LL-22 ir validatorius tikrina vieną kryptį — ar hint'as ATSKLEIDŽIA atsakymą (`options[answer]` vs `hint`); atvirkščio caso (hint'as prieštarauja atsakymui) niekas netikrina.
│ +- **Taisyklė:** prieš įrašant užuominą, perskaityk ją kartu su teisingu variantu kaip vieną sakinį. Jei užuominos nurodomas kelias atrodo vedantis nuo atsakymo — hint'as perrašomas, net jei jis nieko neatskleidžia. Užuomina turi rodyti į klaidą, į kurią vaikas tikriai nužengia, o ne į priešingą nuo atsakymo pusę.
│ +- **Patikra:** žmogaus peržiūra: kiekviename modulyje prie kiekvieno hint'o paklausimas — „ar šis kelias kerta teisingo varianto sąvoką?" Rasta per #137 auditą; fiksuota `research/wiki/guidelines/kalbos-auditas.md` lentelės eilutėje #1 (rimta).
│ agents/state.json
│ @@ -438,6 +438,39 @@
│      "notes": "Modulis nekuriamas (tik išdėstymas), todėl index.json, path.json ir garsas neliesti; check_docs_facts.py skaičiai nepasikeitė. check_view.py nematuoja padidinto teksto — prie 16 px jis buvo žalias ir prieš taisymą (LL-39/LL-40), todėl defekto įrodymas yra atskiras 200 % zondas. Matuota Chromium 155 (Playwright iš .venv) prieš vietinį python3 -m http.server 8991; šaknies šriftas keistas tik puslapyje. agents/state.json yra .gitignore; ataskaita agents/log/*.md — tracked.",
│      "touched": "assets/js/sims/pasaulis.js; research/wiki/guidelines/pamokos.md; agents/log/kurejas-2026-11-08T0919.md; agents/state.json"
│    },
│ +  "last_language_audit": {
│ +    "date": "2026-11-08",
│ +    "run_id": 137,
│ +    "type": "auditas (nieko neperrašyta; užduoties blokas viršesnis už vaidmens aprašą)",
│ +    "scope": "1 klasė, 31 modulis (visos 7 kryptys + gyvenimo-igudziai); vaikai rodomi laukai: title, subtitle, outcomes, concept.*, reflect, tasks[].q/options/hint/why, sim.config tekstai; teacher.* neliestas",
│ +    "snapshot": "HEAD 0504a80 (#136); per auditują kitas agentas pervadino 21-erdvines-figuras → 21-erdvines-figuros — visos citatos patikrintos grep'ais po commit'o (LL-36 nesikartojo)",
│ +    "findings": {"viso": 41, "rimta": 6, "vidutine": 24, "smulki": 11},
│ +    "worst_modules": ["16-vandens-busenos", "22-sudetis-per-desimti", "13-akmenelis-popierius", "01-garso-aukstis", "10-gyvunu-grupes"],
│ +    "top_findings": [
│ +      "16-vandens-busenos: nežodžiai aprasojęs (concept.example:22) ir aprasojo (tasks[2].q:54) — norėta užparęs/užparojo; neprapuola ×2, nubyra",
│ +      "10-gyvunu-grupes tasks[2].hint:58 — užuomina nukreipia nuo atsakymo (pagalvės turinys = plunksnos = atsakymas)",
│ +      "22-sudetis-per-desimti concept.example:21 — nelogiškas sakinys apie dvi dėmes įdedant į pilną dešimtuką",
│ +      "01-garso-aukstis tasks[0].q:48 — neegzistuoja formos Pakėlei/nelietei; concept.steps[2]:19 — nebūtinai (įrankis concept steps netikrina dviprasmiškumu)",
│ +      "21-erdvines-figuros outcomes[0] — 15 žodžių viename sakinyje"
│ +    ],
│ +    "tool_gaps": [
│ +      "check_language.py visai netikrina outcomes lauko: 8 sakiniai >10 ž., 3 žodžiai >13 raidžių liko nematomi (→ LL-52)",
│ +      "skaitmenys ne skaičiuojami žodžiais — 11 atvejų ištariamai >10 ž., įrankiui rodant ≤10",
│ +      "nebūtinai taisyklė ne taikoma concept.steps",
│ +      "veiksmažodžio formų klaidų (Pakėlei, pasėji, dalijai, jaustumeisi, Niekou) ir nežodžių (aprasojęs) nepažįsta joks įrankis"
│ +    ],
│ +    "deliverables": [
│ +      "research/wiki/guidelines/kalbos-auditas.md (41 radinio lentelė, 9 modeliai, 5 prasčiausiai moduliai)",
│ +      "research/wiki/guidelines/pamokos.md (LL-52, LL-53)",
│ +      "agents/log/kalbu-redaktorius-2026-11-08T0908-auditas.md"
│ +    ],
│ +    "content_changed": false,
│ +    "verified": "validate_content.py --grade 1 → 0/0; check_language.py --grade 1 → 0 klaidų, 4 warn, 22 info; visos 41 lentelės eilutės patvirtintos grep'u dabartiniuose failuose",
│ +    "proposals": "— (auditinis paleidimas: užduoties bloke numatyti tik ataskaita + wiki failai)",
│ +    "notes": "Normos konfliktas pastatytas ir sprendžiamas pagal KURINIO-STANDARTAS §6 (sakinis ≤10 ž., 1 kl.): vaidmens failo tekstas apie ≤12 ž. pasenęs, check_language.py jau suvienodintas su standartu (LL-38/LL-50). 22 tikrintuvo info neaiški nuoroda peržiūrėti vienu metu — visi įvardžiai aiškūs, keisti nebuvo. Rimtųjų radinių (#1–#6) eilėje pirmiausia 16-vandens-busenos (2 nežodžiai) ir 10-gyvunu-grupes (hint'as menkina). Taisymo paleidimas — kitas vykdymas; šiame nieko neperrašyta.",
│ +    "log": "agents/log/kalbu-redaktorius-2026-11-08T0908-auditas.md",
│ +    "touched": "research/wiki/guidelines/kalbos-auditas.md; research/wiki/guidelines/pamokos.md; agents/log/kalbu-redaktorius-2026-11-08T0908-auditas.md; agents/state.json"
│ +  },
│    "open_questions": "research/wiki/guidelines/klausimai.md",
│    "updated": "2026-11-08T09:19:00",
│    "last_attribution_work": {
│ profiles/ling31flash/cache/scratch/verify_state.py
│ @@ -0,0 +1,9 @@
│ +#!/usr/bin/env python3
│ +import json
│ +d = json.load(open("/home/zoltanas/workspace/suprask/agents/state.json", encoding="utf-8"))
│ +r = d["roles"]["kalbu-redaktorius"]
│ +print("roles.kalbu-redaktorius:", json.dumps(r, ensure_ascii=False))
│ +print("has last_language_audit:", "last_language_audit" in d)
│ +a = d.get("last_language_audit", {})
│ +print("audit run_id:", a.get("run_id"), "| findings:", a.get("findings"), "| content_changed:", a.get("content_changed"))
│ +print("top-level keys:", len(d.keys()), "| updated:", d.get("updated"))
│ agents/log/kalbu-redaktorius-2026-11-08T0908-auditas.md
│ @@ -51,4 +51,4 @@
│
│  ## Touched
│
│ -`research/wiki/guidelines/kalbos-auditas.md` (naujas), `research/wiki/guidelines/pamokos.md` (LL-51, LL-52), `agents/state.json`, `agents/log/kalbu-redaktorius-2026-11-08T0908-auditas.md` (šis failas). **`content/` neliestas.**
│ +`research/wiki/guidelines/kalbos-auditas.md` (naujas), `research/wiki/guidelines/pamokos.md` (LL-52, LL-53), `agents/state.json`, `agents/log/kalbu-redaktorius-2026-11-08T0908-auditas.md` (šis failas). **`content/` neliestas.**
Paleidimas #137 (kalbu-redaktorius, auditas) baigtas. Nieko neperrašyta — tik vertinta ir užfiksuota.

SKAIČIAI
- Perskaityta 31/31 pirmos klasės modulių (visos 7 kryptys + gyvenimo-igudziai).
- Radinių: 41 — rimtų 6, vidutinių 24, smulkių 11.
- Rimčiausi: 16-vandens-busenos (nežodžiai „aprasojęs"/„aprasojo" — norėta „užparęs"), 01-garso-aukstis (neegzistuoja formos „Pakėlei/nelietei" pačioje pirmaj užduotyje), 22-sudetis-per-desimti (nelogiškas „Du įdedi į pilną dešimtuką"), 10-gyvunu-grupes (hint'as nukreipia nuo atsakymo „plunksnos"), 21-erdvines-figuros (outcome 15 žodžių), 16-vandens dar kartą („neprapuola", „nubyra").
- 5 prasčiausiai moduliai: 16-vandens-busenos, 22-sudetis-per-desimti, 13-akmenelis-popierius, 01-garso-aukstis, 10-gyvunu-grupes.

ĮRANGOS AKLA DĖMĖ (nauja, sisteminė)
check_language.py visai neskaito `outcomes` lauko — 8 per ilgi (>10 ž.) sakiniai ir 3 žodžiai >13 raidžių liko nematomi ties žalia vartų spalva. Dar: skaitmenys ne skaičiuojami žodžiais (11 atvejų), „nebūtinai" netikrinama concept.steps, veiksmažodžio formų klaidų nepažįsta joks įrankis.

UŽRAŠYTA (4 failai)
- research/wiki/guidelines/kalbos-auditas.md — naujas: 41 eilučių lentelė (modulis | laukas | problema | siūloma formuluotė | sunkumas), 9 pasikartojantys modeliai, 5 prasčiausiai moduliai.
- research/wiki/guidelines/pamokos.md — LL-52 (laukas be vartų: outcomes) ir LL-53 (hint'as, nukreipiantis į priešingybę). Kito agento LL-51 atsirado per paleidimą — numeracija sutvarkyta.
- agents/log/kalbu-redaktorius-2026-11-08T0908-auditas.md — ataskaita su skaičiais, prieš/po (nepritaikoma — nieko nekeista), ko sąmoningai nelieta.
- agents/state.json — roles.kalbu-redaktorius (checked) + last_language_audit blokas.

PATIKRTA
- validate_content.py --grade 1 → 0/0; check_language.py --grade 1 → 0 klaidų, 4 warn, 22 info.
- Kiekviena iš 41 lentelės eilučių patvirtinta grep'u dabartiniame faile. Per auditują #136 commit'as pervadino 21 failą (figuras→figuros) — citatos peržiūrėtos po commit'o (LL-36 nesikartojo).
- state.json JSON teisingas, content/ neliestas (git content/ tuščias).

KAS LIEKA
- Taisymo paleidimas (formuluočių perrašymas modulis po modulį) — kitas vykdymas, pagal šį auditą; pirmiausia 6 rimtieji radiniai.
- `outcomes` pridėti į check_language.py — struktūrinis darbas (LL-52), atskiras paleidimas.

## klaidos

```
plugins update   (or turn on: hermes plugins auto-update on)
  → 1 plugin update(s) from the new catalog in glm53flash: advanced-delegation
    apply: hermes plugins update   (or turn on: hermes plugins auto-update on)
  → 1 plugin update(s) from the new catalog in ling31flash: advanced-delegation
    apply: hermes plugins update   (or turn on: hermes plugins auto-update on)

→ Syncing bundled skills...
  ~ 1 user-modified (kept)
    → see them: hermes skills list-modified  (diff/reset to resume updates)
  ✓ Skills are up to date

→ Syncing bundled skills to all profiles...
  default: up to date
  beam: up to date
  cmd: up to date
  cmd-deepseek-flash: up to date
  deepseek: ~1 user-modified
  deepseek41flash: up to date
  deepseekpro: up to date
  deepseekv4flashlatest: ~1 user-modified
  education41: ~1 user-modified
  glm53flash: up to date
  glmlatest: up to date
  ling31flash: up to date
  qwen38flash: up to date

→ Checking configuration for new options...

  ℹ Updating config format (v52 → v53)…
  ✓ Config format updated (no new settings to configure)
  ✓ Profile 'default': config format updated (v52 → v53)
  ✓ Profile 'beam': config format updated (v52 → v53)
  ✓ Profile 'cmd': config format updated (v52 → v53)
  ✓ Profile 'cmd-deepseek-flash': config format updated (v52 → v53)
  ✓ Profile 'deepseek': config format updated (v52 → v53)
  ✓ Profile 'deepseek41flash': config format updated (v52 → v53)
  ✓ Profile 'deepseekpro': config format updated (v52 → v53)
  ✓ Profile 'deepseekv4flashlatest': config format updated (v52 → v53)
  ✓ Profile 'glm53flash': config format updated (v52 → v53)
  ✓ Profile 'glmlatest': config format updated (v52 → v53)
  ✓ Profile 'ling31flash': config format updated (v52 → v53)
  ✓ Profile 'qwen38flash': config format updated (v52 → v53)

✓ Update complete! (v0.23.0+1232.g21ae0e1) [main @ 21ae0e1238]

→ Preparing pinned cua-driver (Computer Use)...

session_id: local-69fd640e04d13baca1d74957aab45bafc9e0250ede78e0f16e6ebde8c124a73a
```
