# metodininkas — 2026-11-15T0820

- paleidimas: #296 (manual)
- trukmė: 365s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/scan_props.py
│ @@ -0,0 +1,19 @@
│ +import json, glob
│ +
│ +rows = []
│ +for f in sorted(glob.glob('agents/proposals/*.json')):
│ +    try:
│ +        d = json.load(open(f))
│ +    except Exception as e:
│ +        print("BAD", f, e)
│ +        continue
│ +    if d.get('status') == 'new':
│ +        rows.append((d.get('priority'), d.get('created'), d.get('role'),
│ +                     d.get('type'), d.get('title'), d.get('target'), f))
│ +
│ +print("NEW:", len(rows))
│ +order = {'high': 0, 'normal': 1, 'low': 2}
│ +for r in sorted(rows, key=lambda r: (order.get(r[0], 3), r[1] or '')):
│ +    print(f"{r[0]:7} {str(r[1])[:10]:10} {str(r[2]):22} {str(r[3]):12} {str(r[4])[:70]}")
│ +    print(f"        target={r[5]}")
│ +    print(f"        file={r[6]}")
│ profiles/deepseek41flash/cache/scratch/peek.py
│ @@ -0,0 +1,5 @@
│ +import json
│ +
│ +d = json.load(open('content/lt/grade-01/pasaulio-pazinimas/20-kas-gyvas.json'))
│ +print(list(d.keys()))
│ +print(json.dumps(d['sim'], ensure_ascii=False)[:1200])
│ profiles/deepseek41flash/cache/scratch/check_lengths.py
│ @@ -0,0 +1,20 @@
│ +import json
│ +
│ +m = json.load(open('content/lt/grade-01/pasaulio-pazinimas/20-kas-gyvas.json'))
│ +print("20-kas-gyvas keys ok:", m['sim']['component'])
│ +
│ +title = "Kas sukūrė šį daiktą: kelias iki gamtos"
│ +sub = "Popierius prasideda miške, o stiklinė — smėlyje"
│ +big = ("Popierius prasideda ąžuole, stiklinė — smėlyje. Kiekvienas daiktas turi kelią iki gamtos. "
│ +       "Parduotuvė yra to kelio gale, o ne pradžioje.")
│ +ct = "Daiktas prasideda gamtoje"
│ +outs = [
│ +    "Nurodau, iš ko padarytas daiktas.",
│ +    "Nustatau, kur prasideda daikto kelias gamtoje.",
│ +    "Paaiškinu, kodėl parduotuvė yra kelio gale, o ne pradžioje.",
│ +]
│ +for name, val, lim in [("title", title, 42), ("subtitle", sub, 80),
│ +                       ("concept.title", ct, 40), ("big_idea", big, 240)]:
│ +    print(f"{name}: {len(val)}/{lim}", "OK" if len(val) <= lim else "FAIL")
│ +for o in outs:
│ +    print("outcome", len(o), o)
│ profiles/deepseek41flash/cache/scratch/m09-draft.json
│ @@ -0,0 +1,184 @@
│ +{
│ +  "id": "21-kas-sukure-daikta",
│ +  "grade": 1,
│ +  "strand": "pasaulio-pazinimas",
│ +  "title": "Kas sukūrė šį daiktą: kelias iki gamtos",
│ +  "subtitle": "Popierius prasideda miške, o stiklinė — smėlyje",
│ +  "minutes": 9,
│ +  "outcomes": [
│ +    "Nurodau, iš ko padarytas daiktas.",
│ +    "Nustatau, kur prasideda daikto kelias gamtoje.",
│ +    "Paaiškinu, kodėl parduotuvė yra kelio gale, o ne pradžioje."
│ +  ],
│ +  "concept": {
│ +    "title": "Daiktas prasideda gamtoje",
│ +    "big_idea": "Popierius prasideda ąžuole, o stiklinė — smėlyje. Parduotuvė yra kelio gale, o ne pradžioje.",
│ +    "steps": [
│ +      "Padėk prie lapo tai, iš ko jis atsirado.",
│ +      "Ekrane spėk, kur prasideda popieriaus kelias.",
│ +      "Rink šaltinį ir eik atgal, kol pasieksi gamtą.",
│ +      "Pavadink, kur prasideda kiekvienas daiktas."
│ +    ],
│ +    "example": "Popieriaus lapas guli parduotuvėje. Jo kelias: ąžuolas, mediena, popierius."
│ +  },
│ +  "sim": {
│ +    "component": "daikto-grandine",
│ +    "config": {
│ +      "cards": {
│ +        "popierius": { "name": "popierius", "icon": "popierius" },
│ +        "mediena": { "name": "mediena", "icon": "mediena" },
│ +        "lapai": { "name": "lapai", "icon": "lapai" },
│ +        "smelis": { "name": "smėlis", "icon": "smelis" },
│ +        "azuolas": { "name": "ąžuolas", "icon": "azuolas" },
│ +        "piestukas": { "name": "pieštukas", "icon": "piestukas" },
│ +        "stikline": { "name": "stiklinė", "icon": "stikline" },
│ +        "stiklas": { "name": "stiklas", "icon": "stiklas" },
│ +        "nafta": { "name": "nafta", "icon": "nafta" }
│ +      },
│ +      "objects": [
│ +        {
│ +          "id": "popierius",
│ +          "predict": {
│ +            "say": "predict",
│ +            "options": [
│ +              { "id": "miske", "label": "Miške", "say": "compare_miske" },
│ +              { "id": "parduotuveje", "label": "Parduotuvėje", "say": "compare_parduotuve" },
│ +              { "id": "gamykloje", "label": "Gamykloje", "say": "compare_gamykla" }
│ +            ]
│ +          },
│ +          "steps": [
│ +            {
│ +              "card": "mediena",
│ +              "ask": "ask_mediena",
│ +              "options": ["mediena", "lapai", "smelis"],
│ +              "no": {
│ +                "lapai": "Lapai ploni ir žali. Popierius baltas ir sausas.",
│ +                "smelis": "Smėlis birus. Popierius lankstosi ir plyšta."
│ +              }
│ +            },
│ +            {
│ +              "card": "azuolas",
│ +              "ask": "ask_azuolas",
│ +              "end": "done1",
│ +              "options": ["azuolas", "piestukas", "smelis"],
│ +              "no": {
│ +                "piestukas": "Pieštukas daromas iš medienos, ne atvirkščiai.",
│ +                "smelis": "Smėlis neturi kamieno ir žievės."
│ +              }
│ +            }
│ +          ],
│ +          "replay": ["replay_azuolas", "replay_mediena", "replay_parduotuve"]
│ +        },
│ +        {
│ +          "id": "stikline",
│ +          "predict": {
│ +            "say": "ask2",
│ +            "options": [
│ +              { "id": "taip", "label": "Taip", "say": "compare_taip" },
│ +              { "id": "ne", "label": "Ne", "say": "compare_ne" }
│ … omitted 106 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/probe_m09.py
│ @@ -0,0 +1,55 @@
│ +"""M-09 juodraščio zondas: ar modulį galima įgyvendinti be papildomų klausimų.
│ +
│ +Tikrina tais pačiais įrankiais, kuriuos paleis kūrėjo vartai, bet ant juodraščio
│ +scratch kataloge (repo neliečiamas).
│ +"""
│ +import json
│ +import pathlib
│ +import sys
│ +
│ +REPO = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +sys.path.insert(0, str(REPO / "scripts"))
│ +
│ +import check_language as cl  # noqa: E402
│ +import validate_content as vc  # noqa: E402
│ +
│ +scratch = pathlib.Path(__file__).resolve().parent
│ +draft = scratch / "m09-draft.json"
│ +
│ +# Abi bibliotekos skaičiuoja `relative_to(ROOT)` — perjungiam į scratch šaknį.
│ +cl.ROOT = scratch
│ +vc.ROOT = scratch
│ +
│ +path = draft
│ +data = json.loads(draft.read_text(encoding="utf-8"))
│ +
│ +rep = vc.Report()
│ +sims = vc.registered_sims() | {"daikto-grandine"}
│ +vc.check_module(path, data, rep, sims, {})
│ +
│ +print("validate_content: errors", len(rep.errors), "warnings", len(rep.warnings))
│ +for e in rep.errors:
│ +    print("  ERR ", e)
│ +for w in rep.warnings:
│ +    print("  WARN", w)
│ +
│ +out = []
│ +cl.check_module(path, out)
│ +errors = [i for i in out if i["severity"] == "error"]
│ +warns = [i for i in out if i["severity"] == "warn"]
│ +infos = [i for i in out if i["severity"] == "info"]
│ +print("check_language: errors", len(errors), "warns", len(warns), "info", len(infos))
│ +for i in out:
│ +    print(f"  {i['severity']:5} {i['where']}: {i['issue']} — {i['detail']}")
│ +    if i.get("text"):
│ +        print(f"        „{i['text'][:120]}“")
│ +
│ +print()
│ +print("longest sentence per field:")
│ +for where, text in [
│ +    ("big_idea", data["concept"]["big_idea"]),
│ +    ("example", data["concept"]["example"]),
│ +    ("reflect", data["reflect"]),
│ +]:
│ +    for s in cl.sentences(text):
│ +        print(f"  {cl.level(1, cl.MAX_WORDS, cl.DEFAULT_MAX_WORDS)}w limit  {where}: {len(cl.WORD_RE.findall(s))}w  {s}")
│ profiles/deepseek41flash/cache/scratch/probe_m09.py
│ @@ -1,10 +1,7 @@
│ -"""M-09 juodraščio zondas: ar modulį galima įgyvendinti be papildomų klausimų.
│ -
│ -Tikrina tais pačiais įrankiais, kuriuos paleis kūrėjo vartai, bet ant juodraščio
│ -scratch kataloge (repo neliečiamas).
│ -"""
│ +"""M-09 juodraščio zondas: ar modulį galima įgyvendinti be papildomų klausimų."""
│  import json
│  import pathlib
│ +import shutil
│  import sys
│
│  REPO = pathlib.Path("/home/zoltanas/workspace/suprask")
│ @@ -14,14 +11,17 @@
│  import validate_content as vc  # noqa: E402
│
│  scratch = pathlib.Path(__file__).resolve().parent
│ -draft = scratch / "m09-draft.json"
│ +tree = scratch / "probe" / "content" / "lt" / "grade-01" / "pasaulio-pazinimas"
│ +tree.mkdir(parents=True, exist_ok=True)
│ +path = tree / "21-kas-sukure-daikta.json"
│ +shutil.copy(scratch / "m09-draft.json", path)
│
│ -# Abi bibliotekos skaičiuoja `relative_to(ROOT)` — perjungiam į scratch šaknį.
│ -cl.ROOT = scratch
│ -vc.ROOT = scratch
│ +# Bibliotekos skaičiuoja `relative_to(ROOT)` — perjungiam į scratch šaknį.
│ +cl.ROOT = scratch / "probe"
│ +vc.ROOT = scratch / "probe"
│ +vc.CONTENT = vc.ROOT / "content" / "lt"
│
│ -path = draft
│ -data = json.loads(draft.read_text(encoding="utf-8"))
│ +data = json.loads(path.read_text(encoding="utf-8"))
│
│  rep = vc.Report()
│  sims = vc.registered_sims() | {"daikto-grandine"}
│ @@ -45,11 +45,13 @@
│          print(f"        „{i['text'][:120]}“")
│
│  print()
│ -print("longest sentence per field:")
│ -for where, text in [
│ +print("sentence word counts:")
│ +for label, text in [
│      ("big_idea", data["concept"]["big_idea"]),
│      ("example", data["concept"]["example"]),
│      ("reflect", data["reflect"]),
│  ]:
│      for s in cl.sentences(text):
│ -        print(f"  {cl.level(1, cl.MAX_WORDS, cl.DEFAULT_MAX_WORDS)}w limit  {where}: {len(cl.WORD_RE.findall(s))}w  {s}")
│ +        print(f"  {label}: {len(cl.WORD_RE.findall(s))}w  {s}")
│ +for i, st in enumerate(data["concept"]["steps"], 1):
│ +    print(f"  step{i}: {len(cl.WORD_RE.findall(st))}w  {st}")
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/m09-draft.json
│ @@ -130,7 +130,7 @@
│    },
│    "tasks": [
│      {
│ -      "q": "Parduotuvėje ant lentynos guli popieriaus lapas. Iš ko jis padarytas?",
│ +      "q": "Parduotuvėje ant lentynos guli popieriaus lapas. Iš kur atsiranda popierius?",
│        "options": ["Iš medienos", "Iš lapų", "Iš smėlio"],
│        "answer": 0,
│        "hint": "Medžio lapas žalias ir plonas. Ar popierius toks pat?",
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/m09-draft.json
│ @@ -137,7 +137,7 @@
│        "why": "Popierius daromas iš medienos, ne iš lapų."
│      },
│      {
│ -      "q": "Stiklinė padaryta iš stiklo. Iš ko atsiranda stiklas?",
│ +      "q": "Stiklinė padaryta iš stiklo. Iš kur atsiranda stiklas?",
│        "options": ["Iš naftos", "Iš medienos", "Iš smėlio"],
│        "answer": 2,
│        "hint": "Tu galvoji apie plastiką. Stiklas ir plastikas skiriasi.",
│ research/wiki/grades/01/metodai.md
│ @@ -727,10 +727,10 @@
│
│  | # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
│  |---|---|---|---|---|---|
│ -| 1 | atpažinimas | „Parduotuvėje ant lentynos guli popieriaus lapas. Iš ko jis padarytas?“ — Iš medienos / Iš lapų / Iš smėlio | Iš medienos (0) | „Iš lapų“ — popieriaus lapas painiojamas su medžio lapu (tas pats žodis) | „Medžio lapas žalias ir plonas. Ar popierius toks pat?“ |
│ -| 2 | taikymas | „Stiklinė padaryta iš stiklo. Iš ko atsiranda stiklas?“ — Iš naftos / Iš medienos / Iš smėlio | Iš smėlio (2) | „Iš naftos“ — plastiko šaltinis priskiriamas stiklui | „Nafta tamsi, mediena turi rieves. Stiklas skaidrus.“ |
│ +| 1 | atpažinimas | „Parduotuvėje ant lentynos guli popieriaus lapas. Iš kur atsiranda popierius?“ — Iš medienos / Iš lapų / Iš smėlio | Iš medienos (0) | „Iš lapų“ — popieriaus lapas painiojamas su medžio lapu (tas pats žodis) | „Medžio lapas žalias ir plonas. Ar popierius toks pat?“ |
│ +| 2 | taikymas | „Stiklinė padaryta iš stiklo. Iš kur atsiranda stiklas?“ — Iš naftos / Iš medienos / Iš smėlio | Iš smėlio (2) | „Iš naftos“ — plastiko šaltinis priskiriamas stiklui | „Tu galvoji apie plastiką. Stiklas ir plastikas skiriasi.“ |
│  | 3 | perkėlimas | „Knyga padaryta iš popieriaus. Kur prasideda knygos kelias?“ — Parduotuvėje / Spaustuvėje / Miške | Miške (2) | „Spaustuvėje“ — artimiausias matomas žmogaus žingsnis laikomas pradžia; „Parduotuvėje“ — pirmoji nuostata | „Spaustuvė spausdina popierių. Kas popierių padaro?“ |
│ -| 4 | perkėlimas (`optional: true`) | „Plastikinis butelis padarytas iš plastiko. Kur prasideda jo kelias?“ — Naftoje / Parduotuvėje / Smėlyje | Naftoje (0) | „Smėlyje“ — stiklo šaltinis perkeliamas plastikui; „Parduotuvėje“ — pirmoji nuostata | „Plastikas lankstus ir lengvas. Stiklas kietas, smėlis birus.“ |
│ +| 4 | perkėlimas (`optional: true`) | „Plastikinis butelis padarytas iš plastiko. Kur prasideda jo kelias?“ — Naftoje / Parduotuvėje / Smėlyje | Naftoje (0) | „Smėlyje“ — stiklo šaltinis perkeliamas plastikui; „Parduotuvėje“ — pirmoji nuostata | „Tu galvoji apie stiklą. Butelis lankstus, o stiklas kietas.“ |
│
│  Atsakymų indeksai 0 / 2 / 2 / 0 — pasiskirstę, todėl vaikas negali spėti pagal varianto vietą. Kiekviena užuomina pasakyta trumpais sakiniais ir nė viena nekartoja teisingo varianto (`validate_content.py` tai tikrina).
│
│ research/wiki/grades/01/metodai.md
│ @@ -673,7 +673,7 @@
│        "replay": ["replay_smelis", "replay_stiklas"] } ],
│    "sentences": {
│      "predict": "Kur prasideda popieriaus kelias? Spėk.",
│ -    "guessed": "Spėjimas įrašytas. Dabar statyk kelią.",
│ +    "guessReadout": "Tu sakei: {label}. Dabar statyk kelią.",
│      "ask_mediena": "Iš ko padarytas popierius?",
│      "ask_azuolas": "Iš ko atsirado mediena?",
│      "ask_stiklas": "Iš ko padaryta stiklinė?",
│ research/wiki/grades/01/metodai.md
│ @@ -697,7 +697,6 @@
│  ```
│
│  Dvylika savybių, kurių negalima praleisti (kiekviena atitinka pamoką):
│ -
│  - **Vienas kintamasis:** kurią kortelę vaikas pasirenka dabartiniame žingsnyje. Daiktas keičiamas tik užbaigus grandinę („Kitas daiktas“), todėl du kintamieji niekada neveikia vienu metu. Spėjimas ir „Peržiūrėk kelią“ yra žingsniai, o ne papildomi kintamieji.
│  - **Grandinė — konfigūracija, ne kodas:** komponentas tikrina, kad `steps[].options` turi `card` ir kad **kiekviena neteisinga kortelė turi `no` paaiškinimą**. Jei trūksta — `console.error` ir ekrane „Grandinė nesuderinta su kortelėmis.“, o ne tylus bendras sakinys (LL-33). Jei `card` nėra `options` sąraše — ta pati klaida.
│  - **Kryptis matoma:** rodyklė visada iš kairės į dešinę (`Ąžuolas → mediena → popierius`), o ne atvirkščiai; todėl „atgal“ yra judėjimas prieš rodyklę, ir tai pasakoma vieną kartą `api.note`, o ne kiekviename žingsnyje.
│ research/wiki/grades/01/metodai.md
│ @@ -696,7 +696,8 @@
│      "replay_stiklas": "Iš smėlio lydomas stiklas." } }
│  ```
│
│ -Dvylika savybių, kurių negalima praleisti (kiekviena atitinka pamoką):
│ +Trylika savybių, kurių negalima praleisti (kiekviena atitinka pamoką):
│ +
│  - **Vienas kintamasis:** kurią kortelę vaikas pasirenka dabartiniame žingsnyje. Daiktas keičiamas tik užbaigus grandinę („Kitas daiktas“), todėl du kintamieji niekada neveikia vienu metu. Spėjimas ir „Peržiūrėk kelią“ yra žingsniai, o ne papildomi kintamieji.
│  - **Grandinė — konfigūracija, ne kodas:** komponentas tikrina, kad `steps[].options` turi `card` ir kad **kiekviena neteisinga kortelė turi `no` paaiškinimą**. Jei trūksta — `console.error` ir ekrane „Grandinė nesuderinta su kortelėmis.“, o ne tylus bendras sakinys (LL-33). Jei `card` nėra `options` sąraše — ta pati klaida.
│  - **Kryptis matoma:** rodyklė visada iš kairės į dešinę (`Ąžuolas → mediena → popierius`), o ne atvirkščiai; todėl „atgal“ yra judėjimas prieš rodyklę, ir tai pasakoma vieną kartą `api.note`, o ne kiekviename žingsnyje.
│ research/wiki/grades/01/metodai.md
│ @@ -703,6 +703,7 @@
│  - **Kryptis matoma:** rodyklė visada iš kairės į dešinę (`Ąžuolas → mediena → popierius`), o ne atvirkščiai; todėl „atgal“ yra judėjimas prieš rodyklę, ir tai pasakoma vieną kartą `api.note`, o ne kiekviename žingsnyje.
│  - **Netinkama kortelė lieka matoma** brūkšniuotu rėmeliu ir trūkusia rodykle, kol vaikas pasirenka kitą. Ji neišnyksta po laiko ir nėra vadinama klaida: `api.readout` sako „Grandinė čia nenueina.“, `api.note` — kodėl (savybė), `api.speak` — tą patį sakinį.
│  - **Grįžtamasis ryšys** — iškart po paspaudimo (≤ 1 kadras). `api.note` niekada nesako „teisingai“ ir niekada ne apie vaiką (T5.1). `api.speak` skaito tik `config.sentences` frazes (LL-42), o `api.note` garsiai neskaitomas.
│ +- **Vienas tekstų šaltinis:** spėjimo skelbimas statomas iš vienos frazės su vieta reikšmei — `sentences.guessReadout` su `{label}`, o ne iš kodo suklijuoto sakinio ir atskiros `sentences.guessed` eilutės. Kiekvienas `sentences` raktas privalo būti ištartas bent vienoje būsenoje; jei raktas liko neištartas arba frazėje trūksta `{label}`, komponentas rašo `console.error` ir rodo „Grandinė nesuderinta su tekstais.“ (LL-33 — vienas šaltinis, ne dvi tiesos).
│  - **`api.progress({ correct: true })`** — vieną kartą, kai **abi** grandinės baigtos **ir** antrasis spėjimas palygintas, t. y. tik pasiekus būseną „abi grandinės“ (LL-29). Po pirmos grandinės pažanga nežymima, nors grandinė baigta. „Iš naujo“ pažangos netrina (LL-16).
│  - **Išdėstymas 360 px:** scena `viewBox="0 0 328 200"`, `width:100%`, `max-width:328px`. Trys kortelės po 92 × 104 px ir du 26 px tarpai = 328 px (rodyklė telpa į tarpą). Kortelės vidus: 56 px piktograma, 32 px užrašas (dvi eilutės po 16 px), 16 px „GAMTA“ juosta = 104 px. Spėjimo žymė viršuje 0–36 px. Suvestinė (abi grandinės) — dvi eilutės po tris 60 × 36 px korteles su 10 px tarpais = 200 px iš 328 px; eilutės 40 ir 104 px aukštyje.
│  - **Valdikliai:** trys šaltinio mygtukai 100 × 72 px + du 8 px tarpai = 316 px iš 328 px; kiekvienas turi piktogramą ir užrašą, `min-height:72px`, `height:auto`, `overflow-wrap:anywhere` (200 % tekste užrašas gali užimti tris eilutes). „Peržiūrėk kelią“ ir „Kitas daiktas“ — 100 % × 56 px, „Iš naujo“ ≥ 96 × 48 px. „Kitas daiktas“ neaktyvus, kol grandinė nebaigta, ir `aria-label` pasako kodėl. Klaviatūra: `Tab`, `Enter`/`Space`, `←`/`→` perjungia variantus, `R` atstato.
Nebaigta — turiu sustoti ir pasakyti, kas iš tikrųjų padaryta, o kas ne. Nekviesiu įrankių toliau, todėl šis sąrašas yra būsena diske, o ne ketinimai.

**Ką radau (tai svarbiausia, ir tai neigia praėjusios ataskaitos prielaidą)**

M-09 metodas „Kas sukūrė šį daiktą“ `research/wiki/grades/01/metodai.md` tikrai yra ir jis išsamus. Bet jame buvo **trys defektai, kuriuos būtų paveldėjęs kūrėjas**:

1. `config.sentences.guessed` buvo raktas, kurio jokia būsena neištaria, o spėjimo skelbimas buvo dubliuojamas kode (`"Tu sakei: …"`). Tai ta pati „dvi tiesos“ klasė kaip proposal `2026-11-08-kurejas-pinigai-tekstas-du-saltiniai`.
2. 2 ir 4 užduočių užuominos atsakymą išvesdavo eliminacija („Nafta tamsi, mediena turi rieves. Stiklas skaidrus.“ → lieka smėlis). Tai LL-22.
3. 1 ir 2 užduočių klausimai „Iš ko jis padarytas?“ kėlė `check_language.py` įspėjimą „neaiškus klausimas“, nes tikrintuvo žodynas neturi „iš ko“.

**Ką įrašiau diske**

- `research/wiki/grades/01/metodai.md` (M-09 skyrius): pataisytos 1–4 užduočių eilutės (nauji klausimai „Iš kur atsiranda…“, naujos 2 ir 4 užuominos, nukreiptos į plastiko/stiklo painiavą, o ne į atsakymą), `guessed` → `guessReadout` su `{label}`, pridėta 13-a privaloma savybė „Vienas tekstų šaltinis“ su reikalavimu `console.error`, jei `sentences` raktas neištartas.

**Ką patikrinau tikru įrankiu (ne žodžiais)**

- Parašiau juodraštinį modulį scratch kataloge ir paleidau abu vartus ant jo: `validate_content.check_module` → **0 klaidų, 0 įspėjimų**; `check_language.check_module` → **0 klaidų, 0 įspėjimų, 0 info**. Visi sakiniai ≤ 10 žodžių.
- Patvirtinau cituojamus šaltinio ruožus: `sources/pradinio-bp-rekomendacijos-2024.txt:17649–17656` (26.3.1, 2 val., veikla „Kas sukūrė šį daiktą?“) ir `:8452–8458` — abu egzistuoja.
- Patvirtinau technines prielaidas: `assets/js/sims/pasaulio.js:1` importuoja `art.js`; `art.js` turi `plank:297`, `ball:318`, `tree:231`, `leaf:168`, `drops:397`; `check_art.py` LEGACY sąraše tik `matematika.js`; `pasaulio-pazinimas/` numeris `21-` laisvas (yra 08, 09, 10, 16–20); `20-kas-gyvas` registruotas `index.json:59`.
- Perskaičiavau laukų ilgius: title 39/42, subtitle 47/80, concept.title 25/40, big_idea 105/240, outcomes 33/46/59.

**Ko nepadariau (ir tai yra pagrindinis trūkumas)**

- **`agents/proposals/2026-11-15-metodininkas-kas-sukure-daikta.json` nesukurtas.** Be jo kūrėjas M-09 nemato — tai ta pati spraga, kurią praėjęs paleidimas paliko.
- `research/wiki/foundations/README.md` — nėra eilutės `[[kilme-ir-grandine]]` (patikrinau: grep randa tik `gyvybe-ir-judesys`).
- `research/wiki/guidelines/pilotai.md` — P-020 neįrašytas (failas baigiasi P-019).
- `research/wiki/changelog.md` — įrašo nėra.
- `agents/state.json` — `roles.metodininkas` neatnaujintas, `last_method_work` neįrašytas.
- `agents/log/metodininkas-2026-11-15*.md` — ataskaitos nėra.
- Repo vartai (`validate_content.py --grade 1 --strict`, `check_language.py --grade 1`, `check_lessons.py`, `check_agents.py`, `check_docs_facts.py`, `check_art.py`) **nepaleisti** — turinio failų neliečiau, bet tai nepatvirtinta.
- Commit nepadarytas. Darbinė kopija dabar turi vieną pakeistą failą: `research/wiki/grades/01/metodai.md`.

**Kitas paleidimas turi pradėti nuo** pasiūlymo failo (`run_id: 296`, `type: "metodas"`, `target: content/lt/grade-01/pasaulio-pazinimas/21-kas-sukure-daikta.json`, `priority: "high"`, `status: "new"`, `evidence` su `metodai.md` M-09, `foundations/kilme-ir-grandine.md` ir trimis DOI), tada README eilutė, P-020, changelog, `state.json`, ataskaita, vartai. Juodraštinis modulis ir zondo skriptas yra `~/.hermes/profiles/deepseek41flash/cache/scratch/m09-draft.json` ir `probe_m09.py` — juos galima panaudoti pakartotinai patikrai.

## klaidos

```
session_id: local-72c25c1732137e29212bc5a0bf222cccb5eddf85be0ac08480152632b11d0790
```
