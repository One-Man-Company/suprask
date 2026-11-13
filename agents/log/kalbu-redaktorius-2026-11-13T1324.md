# kalbu-redaktorius — 2026-11-13T1324

- paleidimas: #268 (queue)
- trukmė: 392s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/p268/summarize_view.py
│ @@ -0,0 +1,26 @@
│ +import json, sys
│ +
│ +path = sys.argv[1]
│ +d = json.load(open(path))
│ +print("base", d.get("base"), "checked", d.get("checked"),
│ +      "problems", len(d.get("problems", [])), "notes", len(d.get("notes", [])))
│ +for r in d.get("all", []):
│ +    print(
│ +        r.get("viewport"),
│ +        "ok", r.get("ok"),
│ +        "overflow", r.get("overflow"),
│ +        "small", r.get("smallCount"),
│ +        "font", r.get("minTaskFont"),
│ +        "tasks", r.get("tasksVisible"), "/", r.get("tasks"),
│ +        "clipped", r.get("clipped"),
│ +        "simCtl", r.get("simVisibleControls"),
│ +        "eyebrow", r.get("eyebrowLines"),
│ +        "loading", r.get("loading"),
│ +        "fatal", r.get("fatal"),
│ +    )
│ +    for e in (r.get("consoleErrors") or [])[:5]:
│ +        print("   console:", e)
│ +    for e in (r.get("pageErrors") or [])[:5]:
│ +        print("   pageerror:", e)
│ +for p in d.get("problems", []):
│ +    print("PROBLEM", p.get("viewport"), p.get("route"), p.get("problems"))
│ content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json
│ @@ -3,22 +3,22 @@
│    "grade": 1,
│    "strand": "matematika",
│    "title": "Šimto lentelė: žemyn reiškia dešimt",
│ -  "subtitle": "Į dešinę skaičius padidėja vienu, žemyn — dešimčia",
│ +  "subtitle": "Į dešinę skaičius padidėja vienu, o žemyn padidėja dešimčia",
│    "minutes": 9,
│    "outcomes": [
│ -    "Skaitau šimto lentelę: į dešinę skaičius padidėja vienu, žemyn — dešimčia.",
│ -    "Paaiškinu, kodėl lentelėje po 19 žemiau stovi 29, o ne 20."
│ +    "Skaitau šimto lentelę. Į dešinę skaičius padidėja vienu, o žemyn padidėja dešimčia.",
│ +    "Paaiškinu, kodėl žemiau 19 stovi 29, o ne 20."
│    ],
│    "concept": {
│      "title": "Lentelė, o ne sąrašas",
│ -    "big_idea": "Šimto lentelėje skaičiai sustatyti dešimtukais. Todėl kaimynas žemiau yra dešimčia didesnis, o ne vienu.",
│ +    "big_idea": "Šimto lentelėje skaičiai sustatyti dešimtukais. Todėl skaičius žemiau yra dešimčia didesnis, o ne vienu.",
│      "steps": [
│ -      "Rask 19. Jis stovi antros eilutės gale.",
│ +      "Rask 19. Jis stovi antroje eilutėje, devintas.",
│        "Nueik vienu langeliu žemyn ir atsidursi ties 29.",
│        "Palygink: pabaiga ta pati (9), o dešimtis kita (1 ir 2).",
│ -      "Į dešinę nuo 19 yra 20, nes ten keičiasi pabaiga."
│ +      "Į dešinę nuo 19 yra 20: ten skaičius didėja vienu."
│      ],
│ -    "example": "Ant sienos pakabintas šimto langelių plakatas. Pirštu nuo 19 žemyn — 29, o į dešinę — 20."
│ +    "example": "Ant sienos kabo šimto langelių plakatas. Pirštu nueik nuo 19 žemyn ir rasi 29. Į dešinę rasi 20."
│    },
│    "sim": {
│      "component": "simto-lentele",
│ content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json
│ @@ -39,7 +39,7 @@
│    },
│    "tasks": [
│      {
│ -      "q": "Simuliacijoje nuo 19 nuėjai žemyn. Kuris skaičius dabar pažymėtas?",
│ +      "q": "Simuliacijoje nuo 19 eini vienu langeliu žemyn. Kuris skaičius pažymėtas?",
│        "options": [
│          "20",
│          "29",
│ @@ -50,7 +50,7 @@
│        "why": "19 + 10 = 29, todėl žemiau stovi 29."
│      },
│      {
│ -      "q": "Kuris skaičius lentelėje stovi tiesiai po 46?",
│ +      "q": "Kuris skaičius yra vienu langeliu žemyn nuo 46?",
│        "options": [
│          "47",
│          "45",
│ @@ -58,7 +58,7 @@
│        ],
│        "answer": 2,
│        "hint": "Skaičiuok dešimtukais, o ne po vieną.",
│ -      "why": "46 + 10 = 56, todėl po 46 stovi 56."
│ +      "why": "46 + 10 = 56, todėl žemiau 46 stovi 56."
│      },
│      {
│        "q": "Kuris skaičius stovi vienu langeliu į dešinę nuo 72?",
│ @@ -68,34 +68,34 @@
│          "82"
│        ],
│        "answer": 0,
│ -      "hint": "Dešinėn skaičius didėja vienu, o dešimtis lieka ta pati.",
│ +      "hint": "Į dešinę skaičius didėja vienu, o dešimtis lieka ta pati.",
│        "why": "72 + 1 = 73: pasikeičia tik pabaiga."
│      },
│      {
│ -      "q": "Kurį skaičių pasieksi nuo 63 trimis žingsniais žemyn?",
│ +      "q": "Kurį skaičių pasieksi nuo 63 trimis langeliais žemyn?",
│        "options": [
│          "66",
│          "73",
│          "93"
│        ],
│        "answer": 2,
│ -      "hint": "Vienas žingsnis žemyn — dešimt. Suskaičiuok tris dešimtis.",
│ -      "why": "63 + 30 = 93, nes trys žingsniai žemyn yra trys dešimtys."
│ +      "hint": "Vienas langelis žemyn reiškia dešimt. Suskaičiuok tris dešimtis.",
│ +      "why": "63 + 30 = 93, nes trys langeliai žemyn yra trys dešimtys."
│      },
│      {
│ -      "q": "Kur pateksi nuo 87 dviem žingsniais į kairę ir vienu žemyn?",
│ +      "q": "Nuo 87 eik du langelius kairėn, paskui vieną langelį žemyn. Kurį skaičių pasieksi?",
│        "options": [
│          "95",
│          "85",
│          "76"
│        ],
│        "answer": 0,
│ -      "hint": "Kairėn keičia pabaigą, žemyn keičia dešimtį.",
│ -      "why": "87 → 85, paskui 85 + 10 = 95.",
│ +      "hint": "Judant kairėn keičiasi pabaiga, judant žemyn keičiasi dešimtis.",
│ +      "why": "87 − 2 = 85, paskui 85 + 10 = 95.",
│        "optional": true
│      }
│    ],
│ -  "reflect": "Pagalvok, kodėl lentelėje po 19 žemiau yra 29. Papasakok savais žodžiais.",
│ +  "reflect": "Pagalvok, kodėl žemiau 19 yra 29. Papasakok savais žodžiais.",
│    "teacher": {
│      "goal": "Suprasti, kad šimto lentelėje judėjimas į dešinę keičia vienetus, o žemyn — dešimtis; kad po 19 žemiau stovi 29, o ne 20.",
│      "prompt": "Kodėl lentelėje po 19 žemiau stovi 29?",
│ content/lt/grade-01/index.json
│ @@ -33,7 +33,7 @@
│          { "id": "16-lygybe-svarstykles", "title": "Lygybė: abi pusės sveria tiek pat", "subtitle": "Ženklas sako, kad abiejose pusėse tiek pat", "file": "grade-01/matematika/16-lygybe-svarstykles.json", "minutes": 9, "sim": "svarstykles-lygybe" },
│          { "id": "17-kryptys-ir-vieta", "title": "Kryptys: kairė priklauso nuo žiūrovo", "subtitle": "Ta pati pusė atsiduria kitoje vietoje, kai žiūri į tave", "file": "grade-01/matematika/17-kryptys-ir-vieta.json", "minutes": 9, "sim": "vabaliukas-ir-kryptys" },
│          { "id": "18-taskas-tiese-spindulys-atkarpa", "title": "Taškas, tiesė, spindulys, atkarpa", "subtitle": "Skiriasi ne ilgiu, o galų skaičiumi", "file": "grade-01/matematika/18-taskas-tiese-spindulys-atkarpa.json", "minutes": 9, "sim": "taskas-tiese-spindulys-atkarpa" },
│ -        { "id": "19-simto-skaiciu-lentele", "title": "Šimto lentelė: žemyn reiškia dešimt", "subtitle": "Į dešinę skaičius padidėja vienu, žemyn — dešimčia", "file": "grade-01/matematika/19-simto-skaiciu-lentele.json", "minutes": 9, "sim": "simto-lentele" },
│ +        { "id": "19-simto-skaiciu-lentele", "title": "Šimto lentelė: žemyn reiškia dešimt", "subtitle": "Į dešinę skaičius padidėja vienu, o žemyn padidėja dešimčia", "file": "grade-01/matematika/19-simto-skaiciu-lentele.json", "minutes": 9, "sim": "simto-lentele" },
│          { "id": "20-laikas-12-ir-24-val", "title": "Laikas: 2 val. ir 14:00 — tas pats laikas", "subtitle": "Ta pati rodyklė turi du vardus: 2:00 ir 14:00", "file": "grade-01/matematika/20-laikas-12-ir-24-val.json", "minutes": 9, "sim": "laikrodis-du-vardai" },
│          { "id": "21-erdvines-figuros", "title": "Erdvinės figūros", "subtitle": "Vienas kūgis: iš priekio trikampis, iš viršaus apskritimas", "file": "grade-01/matematika/21-erdvines-figuros.json", "minutes": 9, "sim": "erdvines-figuros" },
│          { "id": "22-sudetis-per-desimti", "title": "Sudėtis per dešimtį", "subtitle": "Pirma papildyk dešimtuką, paskui pridėk, kas liko", "file": "grade-01/matematika/22-sudetis-per-desimti.json", "minutes": 9, "sim": "sudetis-per-desimti" },
│ profiles/deepseek41flash/cache/scratch/p268/check_lengths.py
│ @@ -0,0 +1,70 @@
│ +"""Skaičiuoja ištariamus žodžius (skaitmuo = 1 žodis) 19-simto-skaiciu-lentele laukams."""
│ +import json
│ +import re
│ +import sys
│ +
│ +PATH = "content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json"
│ +MAX_W = 10
│ +MAX_LETTERS = 13
│ +
│ +mod = json.load(open(PATH, encoding="utf-8"))
│ +
│ +
│ +def sentences(text):
│ +    # sakinio riba: . ! ? ; dvitaškis ir brūkšnys laikomi to paties sakinio dalimis
│ +    parts = re.split(r"(?<=[.!?])\s+", text.strip())
│ +    return [p for p in parts if p.strip()]
│ +
│ +
│ +def words(s):
│ +    # skaitmuo / skaičių seka = 1 ištariamas žodis
│ +    return re.findall(r"\d+|[^\W\d_]+", s, flags=re.UNICODE)
│ +
│ +
│ +def check(label, text):
│ +    bad = 0
│ +    for s in sentences(text):
│ +        w = words(s)
│ +        long = [x for x in w if len(x) > MAX_LETTERS and not x.isdigit()]
│ +        flag = ""
│ +        if len(w) > MAX_W:
│ +            flag += f" ILGIS({len(w)})"
│ +            bad += 1
│ +        if long:
│ +            flag += " ILGAS_ZODIS(" + ",".join(long) + ")"
│ +            bad += 1
│ +        if flag:
│ +            print(f"  !! {label}: {len(w)} ž. :: {s}{flag}")
│ +    return bad
│ +
│ +
│ +total_bad = 0
│ +fields = [
│ +    ("title", mod["title"]),
│ +    ("subtitle", mod["subtitle"]),
│ +]
│ +for i, o in enumerate(mod["outcomes"]):
│ +    fields.append((f"outcomes[{i}]", o))
│ +fields += [
│ +    ("concept.title", mod["concept"]["title"]),
│ +    ("concept.big_idea", mod["concept"]["big_idea"]),
│ +]
│ +for i, s in enumerate(mod["concept"]["steps"]):
│ +    fields.append((f"concept.steps[{i}]", s))
│ +fields.append(("concept.example", mod["concept"]["example"]))
│ +for i, t in enumerate(mod["tasks"]):
│ +    fields.append((f"tasks[{i}].q", t["q"]))
│ +    fields.append((f"tasks[{i}].hint", t["hint"]))
│ +    fields.append((f"tasks[{i}].why", t["why"]))
│ +    for j, o in enumerate(t["options"]):
│ +        fields.append((f"tasks[{i}].options[{j}]", o))
│ +    if t.get("optional"):
│ +        fields.append((f"tasks[{i}].optional", "true"))
│ +fields.append(("reflect", mod["reflect"]))
│ +
│ +print("== ribos: sakinys <=", MAX_W, "ž., žodis <=", MAX_LETTERS, "raidžių ==")
│ +for label, text in fields:
│ +    total_bad += check(label, str(text))
│ +print("pažeidimų:", total_bad)
│ +print("atsakymų indeksai:", [t["answer"] for t in mod["tasks"]])
│ +print("optional:", [bool(t.get("optional")) for t in mod["tasks"]])
│ content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json
│ @@ -15,7 +15,7 @@
│      "steps": [
│        "Rask 19. Jis stovi antroje eilutėje, devintas.",
│        "Nueik vienu langeliu žemyn ir atsidursi ties 29.",
│ -      "Palygink: pabaiga ta pati (9), o dešimtis kita (1 ir 2).",
│ +      "Palygink 19 ir 29. Pabaiga ta pati, o dešimtis kita.",
│        "Į dešinę nuo 19 yra 20: ten skaičius didėja vienu."
│      ],
│      "example": "Ant sienos kabo šimto langelių plakatas. Pirštu nueik nuo 19 žemyn ir rasi 29. Į dešinę rasi 20."
│ profiles/deepseek41flash/cache/scratch/p268/probe268.py
│ @@ -0,0 +1,144 @@
│ +"""Zondas #268: 19-simto-skaiciu-lentele — nauji tekstai ekrane, seni dingo,
│ +užduotys teisingai vertina, simuliacija veikia 360 ir 1440 px su blokuotomis API."""
│ +import json
│ +import sys
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8991/"
│ +ROUTE = "#/modulis/1/matematika/19-simto-skaiciu-lentele"
│ +CHROME = "/home/zoltanas/.local/bin/google-chrome"
│ +
│ +BRAVE_INIT = """
│ +(() => {
│ +  try { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); } catch (e) {}
│ +  try { delete window.localStorage; } catch (e) {}
│ +  try { Object.defineProperty(navigator, 'sendBeacon', { value: undefined }); } catch (e) {}
│ +  try { window.speechSynthesis = undefined; } catch (e) {}
│ +  try { window.SpeechSynthesisUtterance = undefined; } catch (e) {}
│ +})();
│ +"""
│ +
│ +NEW = [
│ +    "Į dešinę skaičius padidėja vienu, o žemyn padidėja dešimčia",
│ +    "Skaitau šimto lentelę. Į dešinę skaičius padidėja vienu",
│ +    "Paaiškinu, kodėl žemiau 19 stovi 29, o ne 20.",
│ +    "Todėl skaičius žemiau yra dešimčia didesnis, o ne vienu.",
│ +    "Jis stovi antroje eilutėje, devintas.",
│ +    "Palygink 19 ir 29. Pabaiga ta pati, o dešimtis kita.",
│ +    "Į dešinę nuo 19 yra 20: ten skaičius didėja vienu.",
│ +    "Ant sienos kabo šimto langelių plakatas.",
│ +    "Pirštu nueik nuo 19 žemyn ir rasi 29. Į dešinę rasi 20.",
│ +    "Simuliacijoje nuo 19 eini vienu langeliu žemyn.",
│ +    "Kuris skaičius yra vienu langeliu žemyn nuo 46?",
│ +    "46 + 10 = 56, todėl žemiau 46 stovi 56.",
│ +    "Į dešinę skaičius didėja vienu, o dešimtis lieka ta pati.",
│ +    "Kurį skaičių pasieksi nuo 63 trimis langeliais žemyn?",
│ +    "Vienas langelis žemyn reiškia dešimt.",
│ +    "63 + 30 = 93, nes trys langeliai žemyn yra trys dešimtys.",
│ +    "Nuo 87 eik du langelius kairėn, paskui vieną langelį žemyn.",
│ +    "Judant kairėn keičiasi pabaiga, judant žemyn keičiasi dešimtis.",
│ +    "87 − 2 = 85, paskui 85 + 10 = 95.",
│ +    "Pagalvok, kodėl žemiau 19 yra 29. Papasakok savais žodžiais.",
│ +]
│ +
│ +OLD = [
│ +    "žemyn — dešimčia",
│ +    "kodėl lentelėje po 19 žemiau stovi 29",
│ +    "kaimynas žemiau",
│ +    "antros eilutės gale",
│ +    "nes ten keičiasi pabaiga",
│ +    "Ant sienos pakabintas",
│ +    "Pirštu nuo 19 žemyn — 29",
│ +    "nuo 19 nuėjai žemyn",
│ +    "tiesiai po 46",
│ +    "todėl po 46 stovi 56",
│ +    "Dešinėn skaičius didėja vienu",
│ +    "trimis žingsniais žemyn",
│ +    "Vienas žingsnis žemyn — dešimt",
│ +    "trys žingsniai žemyn",
│ +    "Kur pateksi nuo 87 dviem žingsniais",
│ +    "Kairėn keičia pabaigą",
│ +    "87 → 85",
│ +    "kodėl lentelėje po 19 žemiau yra 29",
│ +]
│ +
│ +def norm(s):
│ +    return " ".join(s.split())
│ +
│ +def run():
│ +    out = {"viewports": {}, "ok": True}
│ +    with sync_playwright() as pw:
│ +        browser = pw.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│ +        for w, h in ((360, 780), (1440, 900)):
│ +            ctx = browser.new_context(viewport={"width": w, "height": h})
│ +            ctx.add_init_script(BRAVE_INIT)
│ +            page = ctx.new_page()
│ +            errs = []
│ +            page.on("console", lambda m: errs.append("console:" + m.text) if m.type == "error" else None)
│ … omitted 66 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/p268/probe268b.py
│ @@ -0,0 +1,127 @@
│ +"""Zondas #268b: outcomes (atidarius <details>), hint po klaidos, why po teisingo,
│ +visi tekstai ekrane 360 ir 1440 px."""
│ +import json
│ +import sys
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8991/"
│ +ROUTE = "#/modulis/1/matematika/19-simto-skaiciu-lentele"
│ +CHROME = "/home/zoltanas/.local/bin/google-chrome"
│ +
│ +BRAVE_INIT = """
│ +(() => {
│ +  try { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); } catch (e) {}
│ +  try { delete window.localStorage; } catch (e) {}
│ +  try { window.speechSynthesis = undefined; } catch (e) {}
│ +  try { window.SpeechSynthesisUtterance = undefined; } catch (e) {}
│ +})();
│ +"""
│ +
│ +OUTCOMES = [
│ +    "Skaitau šimto lentelę. Į dešinę skaičius padidėja vienu, o žemyn padidėja dešimčia.",
│ +    "Paaiškinu, kodėl žemiau 19 stovi 29, o ne 20.",
│ +]
│ +
│ +HINTS = {
│ +    0: "Žemyn reiškia kitą eilutę, o ne kitą skaičių iš eilės.",
│ +    1: "Skaičiuok dešimtukais, o ne po vieną.",
│ +    2: "Į dešinę skaičius didėja vienu, o dešimtis lieka ta pati.",
│ +    3: "Vienas langelis žemyn reiškia dešimt. Suskaičiuok tris dešimtis.",
│ +    4: "Judant kairėn keičiasi pabaiga, judant žemyn keičiasi dešimtis.",
│ +}
│ +WHY = {
│ +    0: "19 + 10 = 29, todėl žemiau stovi 29.",
│ +    1: "46 + 10 = 56, todėl žemiau 46 stovi 56.",
│ +    2: "72 + 1 = 73: pasikeičia tik pabaiga.",
│ +    3: "63 + 30 = 93, nes trys langeliai žemyn yra trys dešimtys.",
│ +    4: "87 − 2 = 85, paskui 85 + 10 = 95.",
│ +}
│ +WRONG = {0: 0, 1: 0, 2: 1, 3: 0, 4: 1}
│ +RIGHT = {0: 1, 1: 2, 2: 0, 3: 2, 4: 0}
│ +
│ +
│ +def norm(s):
│ +    return " ".join((s or "").split())
│ +
│ +
│ +def run():
│ +    out = {"ok": True}
│ +    with sync_playwright() as pw:
│ +        browser = pw.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│ +        for w, h in ((360, 780), (1440, 900)):
│ +            ctx = browser.new_context(viewport={"width": w, "height": h})
│ +            ctx.add_init_script(BRAVE_INIT)
│ +            page = ctx.new_page()
│ +            errs = []
│ +            page.on("console", lambda m: errs.append("console:" + m.text) if m.type == "error" else None)
│ +            page.on("pageerror", lambda e: errs.append("pageerror:" + str(e)))
│ +            page.goto(BASE + ROUTE, wait_until="load")
│ +            page.wait_for_timeout(1000)
│ +
│ +            details = page.query_selector("details")
│ +            details.evaluate("d => d.open = true")
│ +            page.wait_for_timeout(150)
│ +            outcomes_text = norm(page.eval_on_selector("ul.outcomes", "el => el.textContent"))
│ +
│ +            vp = {
│ +                "outcomes_shown": [norm(o) in outcomes_text for o in OUTCOMES],
│ +                "outcomes_overflow": page.evaluate(
│ +                    "[...document.querySelectorAll('ul.outcomes li')].map(li => li.scrollWidth - li.clientWidth)"
│ +                ),
│ +                "docOverflow": page.evaluate("document.documentElement.scrollWidth - window.innerWidth"),
│ +                "tasks": {},
│ +            }
│ +
│ +            for i in range(5):
│ +                wrap = page.query_selector(f".task[data-task='{i}']")
│ +                btns = wrap.query_selector_all("button")
│ … omitted 49 diff line(s) across 1 additional file(s)/section(s)
Paleidimas #268 baigėsi iteracijų limitu. Pateikiu ataskaitą tokią, kokia ji realiai yra — su tuo, kas išmatuota, ir su tuo, kas liko nepadaryta. Ataskaitos į `agents/log/` ir `state.json` neįrašiau (žr. žemiau), todėl šis tekstas yra vienintelė kanoninė ataskaita.

## Ką pakeičiau (19-simto-skaiciu-lentele)

Prieš → po:

| Laukas | Prieš | Po |
|---|---|---|
| subtitle (+ `index.json`) | Į dešinę skaičius padidėja vienu, žemyn — dešimčia | Į dešinę skaičius padidėja vienu, o žemyn padidėja dešimčia |
| outcomes[0] | Skaitau šimto lentelę: į dešinę … vienu, žemyn — dešimčia. | Skaitau šimto lentelę. Į dešinę skaičius padidėja vienu, o žemyn padidėja dešimčia. |
| outcomes[1] | Paaiškinu, kodėl lentelėje po 19 žemiau stovi 29, o ne 20. (11 ištariamų ž.) | Paaiškinu, kodėl žemiau 19 stovi 29, o ne 20. (9–10 ž.) |
| big_idea | Todėl **kaimynas** žemiau yra dešimčia didesnis | Todėl **skaičius** žemiau yra dešimčia didesnis |
| steps[0] | Jis stovi **antros eilutės gale** | Jis stovi **antroje eilutėje, devintas** |
| steps[2] | Palygink: pabaiga ta pati (9), o dešimtis kita (1 ir 2). | Palygink 19 ir 29. Pabaiga ta pati, o dešimtis kita. |
| steps[3] | …yra 20, **nes ten keičiasi pabaiga** | …yra 20: ten skaičius didėja vienu |
| example | Pirštu nuo 19 žemyn — 29, o į dešinę — 20. | Pirštu nueik nuo 19 žemyn ir rasi 29. Į dešinę rasi 20. |
| tasks[0].q | …nuo 19 **nuėjai** žemyn. Kuris skaičius **dabar** pažymėtas? | …nuo 19 **eini vienu langeliu** žemyn. Kuris skaičius pažymėtas? |
| tasks[1].q | …lentelėje stovi **tiesiai po 46**? | Kuris skaičius yra vienu langeliu žemyn nuo 46? |
| tasks[1].why | todėl **po 46** stovi 56 | todėl **žemiau 46** stovi 56 |
| tasks[2].hint | **Dešinėn** skaičius didėja | **Į dešinę** skaičius didėja |
| tasks[3].q | trimis **žingsniais** žemyn | trimis **langeliais** žemyn |
| tasks[3].hint | Vienas žingsnis žemyn — dešimt. | Vienas langelis žemyn reiškia dešimt. |
| tasks[3].why | trys žingsniai žemyn yra trys dešimtys | trys langeliai žemyn yra trys dešimtys |
| tasks[4].q | Kur pateksi nuo 87 dviem žingsniais į kairę ir vienu žemyn? | Nuo 87 eik du langelius kairėn, paskui vieną langelį žemyn. Kurį skaičių pasieksi? |
| tasks[4].hint | Kairėn keičia pabaigą, žemyn keičia dešimtį. | Judant kairėn keičiasi pabaiga, judant žemyn keičiasi dešimtis. |
| tasks[4].why | 87 → 85, paskui 85 + 10 = 95. | 87 − 2 = 85, paskui 85 + 10 = 95. |
| reflect | …kodėl lentelėje po 19 žemiau yra 29 | …kodėl žemiau 19 yra 29 |

Svarbiausias radinys — **faktinė klaida**: `steps[0]` skelbė, kad 19 yra „antros eilutės gale“, nors toje eilutėje gale yra 20 (19 — devintas langelis), ir tai prieštaravo tam pačiam `steps[3]` („į dešinę nuo 19 yra 20“) bei simuliacijai (`colOf(19) = 9`). Antras — **dviprasmis „po 46“**: 47 buvo pasiūlytas kaip klaidingas variantas, nors „48 po 46“ sekoje yra būtent 47; vaikas galėjo būti teisus ir gauti užuominą.

Atsakymų indeksai **1/2/0/2/0 nepakeisti**, teisingi variantai tie patys, `optional` 5-oje užduotyje išliko.

## Ko sąmoningai nekeičiau

- `sim.config.sentences` (9 sakiniai) — keitimas reikalautų pergeneruoti garsą, o sakiniai be defektų; sim priklauso `simuliaciju-inzinierius` riboms.
- `teacher.*`, `sources`, `svietimas1` — suaugusiojo tekstas, ne vaiko ekranas.
- Simuliacijos `digitLine` „dešimtis kita (1 → 2)“ (`matematika.js`) — dėl to `steps[2]` palikau sąvoką „dešimtis“, o ne „skaitmuo“: keisti modulį atskirai nuo sim reikštų du terminus tam pačiam dalykui. Sim teksto taisymas — ne mano ribos, pasiūlymo neįrašiau.
- Sim langelių šriftas telefone (~11,8 px @360) — 10 stulpelių 360 px ekrane neišveda į 18 px; tai sim geometrijos klausimas, ne formuluotė.

## Išmatuota

- `check_language.py`: modulis **0/0/0 prieš ir po**; klasė 0 klaidų, **7 įspėjimai prieš ir 7 po** (visi kituose moduliuose: 01-garsas-ir-raide, 07-desningumai, 08-metu-laikai, 12-bendradarbiavimo-tiltas ×2, 13-akmenelis-popierius ×2), 27 pastabos.
  Sąžiningai: **įspėjimų skaičius nesumažėjo**, nes modulyje jų nebuvo — visi penki defektai yra įrankio aklosiose zonose (skaitmenys neskaičiuojami kaip žodžiai, elipsė, faktinė klaida, „po“ dviprasmybė).
- `validate_content.py --grade 1` ir be parametrų, taip pat `--strict`: **0 klaidų, 0 įspėjimų**, exit 0.
- Mano ilgio matuoklis (skaitmuo = 1 žodis, žodis ≤13 raidžių): prieš — `outcomes[1]` 11 ž., `steps[2]` 11 ž.; po — **0 pažeidimų**.
- `check_view.py` (Brave skydų blokada: `localStorage`, `speechSynthesis` išjungti; `--base http://127.0.0.1:8991/`), prieš → po:

| Plotas | overflow | smallCount | minTaskFont | tasksVisible |
|---|---|---|---|---|
| desktop 1440 | 0 → 0 | 0 → 0 | 21,44 → 21,44 | 5/5 → 5/5 |
| tablet 1024 | 0 → 0 | 0 → 0 | 21,44 → 21,44 | 5/5 → 5/5 |
| phone 390 | 0 → 0 | 0 → 0 | 19,14 → 19,14 | 5/5 → 5/5 |
| small 360 | 0 → 0 | 0 → 0 | 18,96 → 18,96 | 5/5 → 5/5 |

  `problems []`, `notes []`, `clipped []`, `loading/fatal false`, exit 0. CSS neliestas nė viena eilute.
- DOM zondas (Chromium, 360 ir 1440, blokuotos API): 0 konsolės klaidų, `documentElement` slinktis 0; **senų formuluočių puslapyje nebeliko** (`leftover_old []`); visos 5 užduotys su teisingu atsakymu duoda „Teisingai!“ su **nauju** `why`; klaidingas 2-os užduoties atsakymas duoda užuominą „Skaičiuok dešimtukais, o ne po vieną.“, atsakymo 56 ji neatskleidžia; sim veikia (19 → 29 → 30 → 20 → 19, spėjimas „29. Sutapo.“).

## Liko nepadaryta (sąžiningai)

1. **`agents/log/` ataskaita ir `agents/state.json` NEĮRAŠYTI** — baigėsi iteracijų limitas. Reikia įrašyti šią ataskaitą ir pažymėti paleidimą 268.
2. **`probe268b.py`** (outcomes atidarytame `<details>`, hint/why kiekvienai iš 5 užduočių, sim geometrija) parašytas, bet **nepaleistas** — liko nepatikrinta, ar `outcomes` tekstai telpa 360 px ir ar `steps[2]`/`hint`ai atvaizduojami be apkirpimo.
3. **`check_audio.py`** nepaleistas; keisti laukai (`subtitle`, `outcomes`, `concept.*`, `tasks.*`) garsui nerenkami (`generate_audio.collect()` ima tik `sim.config`), o `sim.config` nepaliestas — tai išvada iš kodo, ne matavimas.
4. **Naujos pamokos neįrašiau.** Formuluotė `research/wiki/guidelines/pamokos.md`: *„Vietos nuoroda, kuri prieštarauja tam pačiam moduliui: 19 vadinamas eilutės gale, o tame pačiame sąraše į dešinę nuo jo randamas 20“* (Simptomas / Priežastis: niekas nelygina `concept.steps` tarpusavyje su sim tinklelio geometrija / Taisyklė: kiekviena pozicijos žymą („gale“, „pradžioje“, „priešpaskutinis“) tikrinti pagal tinklelio indeksus / Patikra: `colOf(19) = 9`, eilutė 2 = 11–20).
5. **Pasiūlymo dėl sim teksto neįrašiau** (`assets/js/sims/matematika.js`, `digitLine`: „dešimtis kita (1 → 2)“ vs modulio „dešimtis“) — nors tai ir priežastis, kodėl `steps[2]` palikau su „dešimtis“.
6. **Foninis serveris `127.0.0.1:8991` dar veikia** (sesija `proc_cd44bd8b3ccd`, PID 831762) — reikia sustabdyti. Be to, nuo ankstesnio paleidimo tebeveikia `127.0.0.1:8987` (PID 822721).
7. Jokio `git commit` / `git push` — kaip ir reikalaujama. Darbinėje kopijoje liko pakeisti: `content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json`, `content/lt/grade-01/index.json`.

## klaidos

```
session_id: local-b4595c8aec63fd06345bde08b1a4e09fc7b2dc9b28b2afc727dfa28fd9b63b33
```
