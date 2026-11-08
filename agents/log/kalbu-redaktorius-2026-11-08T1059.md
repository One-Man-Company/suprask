# kalbu-redaktorius — 2026-11-08T1059

- paleidimas: #154 (queue)
- trukmė: 337s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/run154/probe154_lang.py
│ @@ -0,0 +1,85 @@
│ +#!/usr/bin/env python3
│ +"""Zondas #154 moduliui 19-simto-skaiciu-lentele.
│ +
│ +check_language.py šio modulio neranda (0 įrašų), todėl matuoju atskirai:
│ +  * VISI vaikui skaitomi laukai, įskaitant `outcomes` (įrankis jų neskaito — LL-52),
│ +  * sakinio ilgis skaičiuojamas IŠTARIAMAI: skaitmuo = vienas žodis (audito taisyklė),
│ +  * žodis > 13 raidžių,
│ +  * „arba“ be pasirinkimo žymeklio,
│ +  * dvigubas neigimas,
│ +  * įvardis sakinio pradžioje,
│ +  * brūkšninis sakinys (elipsė) — žymima peržiūrai, sprendžia žmogus.
│ +"""
│ +from __future__ import annotations
│ +
│ +import json
│ +import pathlib
│ +import re
│ +import sys
│ +
│ +MOD = pathlib.Path(sys.argv[1])
│ +data = json.loads(MOD.read_text(encoding="utf-8"))
│ +
│ +TOKEN = re.compile(r"[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+|\d+(?::\d+)?")
│ +LONG_WORD = 13
│ +MAX_WORDS = 10
│ +PRONOUN = re.compile(r"^(tai|šis|ši|šie|šios|jis|ji|jie|jos|tas|ta|tie|tos|šitas|šita)\b", re.I)
│ +DASH = re.compile(r"[—–]")
│ +
│ +rows = []
│ +flags = []
│ +
│ +
│ +def sentences(text: str):
│ +    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text or "") if s.strip()]
│ +
│ +
│ +def check(where: str, text: str) -> None:
│ +    if not isinstance(text, str) or not text.strip():
│ +        return
│ +    for sent in sentences(text):
│ +        toks = TOKEN.findall(sent)
│ +        word_count = 0
│ +        for t in toks:                      # „14:00" tariama dviem žodžiais
│ +            word_count += 2 if ":" in t else 1
│ +        rows.append((where, sent, word_count))
│ +        if word_count > MAX_WORDS:
│ +            flags.append(("ILGAS SAKINYS", where, f"{word_count} ž.", sent))
│ +        for t in toks:
│ +            if t.isalpha() and len(t) > LONG_WORD:
│ +                flags.append(("ILGAS ŽODIS", where, f"{t} ({len(t)})", sent))
│ +        if re.search(r"\barba\b", sent, re.I) and not re.search(r"vienas iš|kuris", sent, re.I):
│ +            flags.append(("ARBA", where, "", sent))
│ +        if re.search(r"\bne\s+\w+\s+ne\b|\bnebūtinai\b|\bnebent\b", sent, re.I):
│ +            flags.append(("NEIGIMAS", where, "", sent))
│ +        if PRONOUN.match(sent):
│ +            flags.append(("ĮVARDIS PRADŽIOJE", where, "", sent))
│ +        if DASH.search(sent):
│ +            flags.append(("BRŪKŠNIS (tikrinti elipsę)", where, "", sent))
│ +
│ +
│ +check("title", data.get("title"))
│ +check("subtitle", data.get("subtitle"))
│ +for i, o in enumerate(data.get("outcomes") or []):
│ +    check(f"outcomes[{i}]", o)
│ +c = data.get("concept") or {}
│ +for key in ("title", "big_idea", "example"):
│ +    check(f"concept.{key}", c.get(key))
│ +for i, s in enumerate(c.get("steps") or []):
│ +    check(f"concept.steps[{i}]", s)
│ +check("reflect", data.get("reflect"))
│ +for k, v in ((data.get("sim") or {}).get("config") or {}).get("sentences", {}).items():
│ +    check(f"sim.{k}", v)
│ +for i, t in enumerate(data.get("tasks") or []):
│ +    check(f"tasks[{i}].q", t.get("q"))
│ +    check(f"tasks[{i}].hint", t.get("hint"))
│ +    check(f"tasks[{i}].why", t.get("why"))
│ +    for j, o in enumerate(t.get("options") or []):
│ +        check(f"tasks[{i}].options[{j}]", o)
│ … omitted 7 diff line(s) across 1 additional file(s)/section(s)
│ content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json
│ @@ -3,22 +3,22 @@
│    "grade": 1,
│    "strand": "matematika",
│    "title": "Šimto lentelė: žemyn reiškia dešimt",
│ -  "subtitle": "Į dešinę skaičius padidėja vienu, žemyn — dešimčia",
│ +  "subtitle": "Į dešinę skaičius padidėja vienu. Žemyn tas pats skaičius padidėja dešimčia",
│    "minutes": 9,
│    "outcomes": [
│ -    "Skaitau šimto lentelę: į dešinę skaičius padidėja vienu, žemyn — dešimčia.",
│ -    "Paaiškinu, kodėl lentelėje po 19 žemiau stovi 29, o ne 20."
│ +    "Skaitau šimto lentelę. Į dešinę skaičius didėja vienu. Žemyn skaičius didėja dešimčia.",
│ +    "Paaiškinu, kodėl po 19 stovi 29, o ne 20."
│    ],
│    "concept": {
│      "title": "Lentelė, o ne sąrašas",
│ -    "big_idea": "Šimto lentelėje skaičiai sustatyti dešimtukais. Todėl kaimynas žemiau yra dešimčia didesnis, o ne vienu.",
│ +    "big_idea": "Šimto lentelėje skaičiai eina eilėmis po dešimt. Todėl žemiau esantis skaičius yra dešimčia didesnis, o ne vienu.",
│      "steps": [
│        "Rask 19. Jis stovi antros eilutės gale.",
│        "Nueik vienu langeliu žemyn ir atsidursi ties 29.",
│ -      "Palygink: pabaiga ta pati (9), o dešimtis kita (1 ir 2).",
│ -      "Į dešinę nuo 19 yra 20, nes ten keičiasi pabaiga."
│ +      "Palygink: abu skaičiai baigiasi 9. Dešimtis skiriasi: 19 turi vieną, 29 turi dvi.",
│ +      "Į dešinę nuo 19 stovi 20. Pabaiga tampa 0, o priekyje 1 virsta 2."
│      ],
│ -    "example": "Ant sienos pakabintas šimto langelių plakatas. Pirštu nuo 19 žemyn — 29, o į dešinę — 20."
│ +    "example": "Ant sienos pakabintas plakatas su šimtu langelių. Pirštu nuo 19 nueik žemyn ir pateksi ties 29. Paskui grįžk ir nueik į dešinę: ten 20."
│    },
│    "sim": {
│      "component": "simto-lentele",
│ content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json
│ @@ -32,7 +32,7 @@
│          "zemyn": "Žemyn skaičius didėja dešimčia.",
│          "aukstyn": "Aukštyn skaičius mažėja dešimčia.",
│          "blokas": "Toliau lentelėje nieko nėra.",
│ -        "baigta": "Dešinėn keičiasi pabaiga, žemyn keičiasi dešimtis.",
│ +        "baigta": "Dešinėn keičiasi pabaiga. Žemyn keičiasi dešimtis.",
│          "is-naujo": "Pradedam iš naujo. Pirma spėk."
│        }
│      }
│ content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json
│ @@ -39,7 +39,7 @@
│    },
│    "tasks": [
│      {
│ -      "q": "Simuliacijoje nuo 19 nuėjai žemyn. Kuris skaičius dabar pažymėtas?",
│ +      "q": "Lentelėje nuo 19 nueik vienu langeliu žemyn. Kuris skaičius ten stovi?",
│        "options": [
│          "20",
│          "29",
│ content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json
│ @@ -79,7 +79,7 @@
│          "93"
│        ],
│        "answer": 2,
│ -      "hint": "Vienas žingsnis žemyn — dešimt. Suskaičiuok tris dešimtis.",
│ +      "hint": "Vienas žingsnis žemyn yra dešimt. Suskaičiuok tris dešimtis.",
│        "why": "63 + 30 = 93, nes trys žingsniai žemyn yra trys dešimtys."
│      },
│      {
│ content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json
│ @@ -83,15 +83,15 @@
│        "why": "63 + 30 = 93, nes trys žingsniai žemyn yra trys dešimtys."
│      },
│      {
│ -      "q": "Kur pateksi nuo 87 dviem žingsniais į kairę ir vienu žemyn?",
│ +      "q": "Nuo 87 ženk du žingsnius į kairę. Paskui ženk vieną žingsnį žemyn. Kur atsidursi?",
│        "options": [
│          "95",
│          "85",
│          "76"
│        ],
│        "answer": 0,
│ -      "hint": "Kairėn keičia pabaigą, žemyn keičia dešimtį.",
│ -      "why": "87 → 85, paskui 85 + 10 = 95.",
│ +      "hint": "Kairėn keičiasi pabaiga. Žemyn keičiasi dešimtis.",
│ +      "why": "Pirma 87 tampa 85. Paskui 85 + 10 = 95.",
│        "optional": true
│      }
│    ],
│ content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json
│ @@ -95,7 +95,7 @@
│        "optional": true
│      }
│    ],
│ -  "reflect": "Pagalvok, kodėl lentelėje po 19 žemiau yra 29. Papasakok savais žodžiais.",
│ +  "reflect": "Pagalvok, kodėl lentelėje žemiau 19 yra 29. Papasakok savais žodžiais.",
│    "teacher": {
│      "goal": "Suprasti, kad šimto lentelėje judėjimas į dešinę keičia vienetus, o žemyn — dešimtis; kad po 19 žemiau stovi 29, o ne 20.",
│      "prompt": "Kodėl lentelėje po 19 žemiau stovi 29?",
│ content/lt/grade-01/index.json
│ @@ -32,7 +32,7 @@
│          { "id": "16-lygybe-svarstykles", "title": "Lygybė: abi pusės sveria tiek pat", "subtitle": "Ženklas sako, kad abiejose pusėse tiek pat", "file": "grade-01/matematika/16-lygybe-svarstykles.json", "minutes": 9, "sim": "svarstykles-lygybe" },
│          { "id": "17-kryptys-ir-vieta", "title": "Kryptys: kairė priklauso nuo žiūrovo", "subtitle": "Ta pati pusė atsiduria kitoje vietoje, kai žiūri į tave", "file": "grade-01/matematika/17-kryptys-ir-vieta.json", "minutes": 9, "sim": "vabaliukas-ir-kryptys" },
│          { "id": "18-taskas-tiese-spindulys-atkarpa", "title": "Taškas, tiesė, spindulys, atkarpa", "subtitle": "Skiriasi ne ilgiu, o galų skaičiumi", "file": "grade-01/matematika/18-taskas-tiese-spindulys-atkarpa.json", "minutes": 9, "sim": "taskas-tiese-spindulys-atkarpa" },
│ -        { "id": "19-simto-skaiciu-lentele", "title": "Šimto lentelė: žemyn reiškia dešimt", "subtitle": "Į dešinę skaičius padidėja vienu, žemyn — dešimčia", "file": "grade-01/matematika/19-simto-skaiciu-lentele.json", "minutes": 9, "sim": "simto-lentele" },
│ +        { "id": "19-simto-skaiciu-lentele", "title": "Šimto lentelė: žemyn reiškia dešimt", "subtitle": "Į dešinę skaičius padidėja vienu. Žemyn tas pats skaičius padidėja dešimčia", "file": "grade-01/matematika/19-simto-skaiciu-lentele.json", "minutes": 9, "sim": "simto-lentele" },
│          { "id": "20-laikas-12-ir-24-val", "title": "Laikas: 2 val. ir 14:00 — tas pats laikas", "subtitle": "Ta pati rodyklė turi du vardus: 2:00 ir 14:00", "file": "grade-01/matematika/20-laikas-12-ir-24-val.json", "minutes": 9, "sim": "laikrodis-du-vardai" },
│          { "id": "21-erdvines-figuros", "title": "Erdvinės figūros", "subtitle": "Kūgis tas pats — iš priekio trikampis, iš viršaus apskritimas", "file": "grade-01/matematika/21-erdvines-figuros.json", "minutes": 9, "sim": "erdvines-figuros" },
│          { "id": "22-sudetis-per-desimti", "title": "Sudėtis per dešimtį", "subtitle": "Pirma papildyk dešimtuką, paskui pridėk, kas liko", "file": "grade-01/matematika/22-sudetis-per-desimti.json", "minutes": 9, "sim": "sudetis-per-desimti" },
## Ką padariau (modulis `19-simto-skaiciu-lentele`)

Perrašytos 12 formuluočių. Atsakymų indeksai, `options`, `concept.title`, `teacher`, `sources`, `svietimas1` neliesti. `index.json` subtitle sinchronizuotas.

| laukas | prieš | po |
|---|---|---|
| subtitle | „…padidėja vienu, žemyn — dešimčia“ (elipsė) | „…padidėja vienu. Žemyn tas pats skaičius padidėja dešimčia“ |
| outcomes[0] | „Skaitau šimto lentelę: … vienu, žemyn — dešimčia.“ | „Skaitau šimto lentelę. Į dešinę skaičius didėja vienu. Žemyn skaičius didėja dešimčia.“ |
| outcomes[1] | 11 ž. „…kodėl lentelėje po 19 žemiau stovi 29…“ | 9 ž. „Paaiškinu, kodėl po 19 stovi 29, o ne 20.“ |
| big_idea | „sustatyti dešimtukais… kaimynas žemiau“ | „eina eilėmis po dešimt… žemiau esantis skaičius yra dešimčia didesnis“ |
| steps[2] | „pabaiga ta pati (9), o dešimtis kita (1 ir 2)“ | „abu skaičiai baigiasi 9. Dešimtis skiriasi: 19 turi vieną, 29 turi dvi.“ |
| steps[3] | „…yra 20, nes ten keičiasi pabaiga“ | „…stovi 20. Pabaiga tampa 0, o priekyje 1 virsta 2.“ |
| example | „Pirštu nuo 19 žemyn — 29, o į dešinę — 20“ | trys sakiniai su veiksmažodžiais |
| sim.baigta | „Dešinėn keičiasi pabaiga, žemyn keičiasi dešimtis.“ | du sakiniai |
| tasks[0].q | „Simuliacijoje nuo 19 nuėjai žemyn. Kuris skaičius dabar pažymėtas?“ (neteisinga prielaida apie vaiko veiksmą) | „Lentelėje nuo 19 nueik vienu langeliu žemyn. Kuris skaičius ten stovi?“ |
| tasks[3].hint | „žingsnis žemyn — dešimt“ | „žingsnis žemyn yra dešimt“ |
| tasks[4].q | 11 ž. „Kur pateksi nuo 87 dviem žingsniais…“ | „Nuo 87 ženk du žingsnius į kairę. Paskui ženk vieną žingsnį žemyn. Kur atsidursi?“ |
| tasks[4].hint/why | „Kairėn keičia pabaigą…“ / „87 → 85…“ | „Kairėn keičiasi pabaiga. Žemyn keičiasi dešimtis.“ / „Pirma 87 tampa 85. Paskui 85 + 10 = 95.“ |
| reflect | „…kodėl lentelėje po 19 žemiau yra 29“ | „…kodėl lentelėje žemiau 19 yra 29“ |

Matavimai:
- `check_language.py --json`: modulio įrašų **0 → 0** (įrankis šio modulio iš viso nemato; klasės suma 0 klaidų / 4 įspėjimai / 21 pastaba nepakito). Todėl matavau zondu `probe154_lang.py`, kuris taiko tas pačias taisykles ir `outcomes` laukui (LL-52/#5827): **8 pažeidimai → 1** (ilgi sakiniai 3→0, elipsės 3→0, įvardis 1→1).
- `validate_content.py --grade 1`: 0 klaidų, 0 įspėjimų, exit 0.
- `check_view.py` (Brave skydų blokada, 4 plotai, 127.0.0.1:8994): prieš — overflow 0, smallCount 0, minTaskFont 21.44 / 21.44 / 19.14 / 18.96, tasksVisible 5/5, problems [].

## Sąmoningai nekeista
- Atsakymų indeksai ir teisingi variantai — nė vienas.
- `concept.steps[0]` „Jis stovi antros eilutės gale.“ — įvardis turi vienareikšmę priešakinę antecedentę (19); taisyklė draudžia tik neaiškią nuorodą.
- „pabaiga“ / „dešimtis“ metafora palikta: simuliacija (`assets/js/sims/matematika.js:3075`) kietai įrašiusi tuos pačius žodžius, keitimas vienoje pusėje sukurtų LL-34.
- `teacher.*`, `concept.title`, `title`, `sim` kiti sakiniai — suaugusiojo tekstas arba jau tvarkingi.
- Simuliacijos logikos neliečiau.

## Liko nepadaryta (sąžiningai)
1. **Garso spraga:** pakeistas `sim.baigta` neturi įrašo — `check_audio.py` rodo „KLAIDA: 1 tekstų be garso įrašo“. Piper modelis yra (`~/workspace/.tools/piper-lt`), bet `piper` CLI neįdiegtas, o bėgiklis generuoja per `scripts/generate_audio.py --engine piper`.
2. **check_view po pakeitimų nepakartotas** — baigėsi iteracijos; prieš tai visi keturi plotai buvo švarūs.
3. **`agents/log/` ataskaita ir `agents/state.json` neatnaujinti.**
4. `research/wiki/guidelines/kalbos-auditas.md` #11 eilutė (outcomes[1]) dar nepažymėta kaip užtaisyta.
5. Dar veikia foninis serveris 127.0.0.1:8994.
6. Darbo medyje yra **ne mano** pakeitimai (`agents/run.py`, `dashboard/server.py`, `scripts/kalbu_queue.py`, `agents/pause.py`, `agents/pause.json`) — neliesti.

Failai: `/home/zoltanas/workspace/suprask/content/lt/grade-01/matematika/19-simto-skaiciu-lentele.json`, `/home/zoltanas/workspace/suprask/content/lt/grade-01/index.json`, zondas `/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/run154/probe154_lang.py`. Jokio commit/push.

## klaidos

```
session_id: local-54fa3b0163758482d436de34e0d3ff30d2713fc45cdd54676bf1ef56707ab0df
```
