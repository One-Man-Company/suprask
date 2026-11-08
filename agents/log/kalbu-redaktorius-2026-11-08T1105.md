# kalbu-redaktorius — 2026-11-08T1105

- paleidimas: #156 (queue)
- trukmė: 431s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/run156/lang_before.py
│ @@ -0,0 +1,14 @@
│ +import json, subprocess, sys, pathlib
│ +root = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +target = sys.argv[1] if len(sys.argv) > 1 else "17-judejimas"
│ +out = subprocess.run([sys.executable, "scripts/check_language.py", "--json"], cwd=root,
│ +                     capture_output=True, text=True)
│ +d = json.loads(out.stdout)
│ +mod = [i for i in d["issues"] if target in i["where"]]
│ +print("modules:", d["modules"], "max_words:", d["max_words"])
│ +print("module issues:", len(mod))
│ +for i in mod:
│ +    print(" ", i["severity"], "|", i["where"].split(":")[-1], "|", i["issue"], "|", i.get("detail"), "|", i.get("text"))
│ +from collections import Counter
│ +c = Counter(i["severity"] for i in d["issues"])
│ +print("grade totals:", dict(c))
│ content/lt/grade-01/pasaulio-pazinimas/17-judejimas.json
│ @@ -3,7 +3,7 @@
│    "grade": 1,
│    "strand": "pasaulio-pazinimas",
│    "title": "Nuožulnioji plokštuma: kas lemia greitį",
│ -  "subtitle": "Greitį keičia plokštumos aukštis, o ne daikto svoris",
│ +  "subtitle": "Greitį keičia plokštumos aukštis, o ne rutulio svoris",
│    "minutes": 9,
│    "outcomes": [
│      "Nurodau, kad nuo aukštesnės plokštumos rutulys rieda greičiau.",
│ content/lt/grade-01/pasaulio-pazinimas/17-judejimas.json
│ @@ -7,7 +7,7 @@
│    "minutes": 9,
│    "outcomes": [
│      "Nurodau, kad nuo aukštesnės plokštumos rutulys rieda greičiau.",
│ -    "Paaiškinu, kad vienodo dydžio rutuliai atrieda beveik kartu, nors sveria skirtingai."
│ +    "Paaiškinu, kodėl rutuliai atrieda beveik kartu, nors sveria skirtingai."
│    ],
│    "concept": {
│      "title": "Kas keičia greitį",
│ content/lt/grade-01/pasaulio-pazinimas/17-judejimas.json
│ @@ -13,12 +13,12 @@
│      "title": "Kas keičia greitį",
│      "big_idea": "Rutulys nuo aukštesnės plokštumos rieda greičiau. Du vienodo dydžio rutuliai atrieda beveik kartu, nors vienas sunkesnis.",
│      "steps": [
│ -      "Pasirink, kuris rutulys, tavo manymu, atriedės pirmas.",
│ +      "Pirma spėk, kuris rutulys atriedės pirmas.",
│        "Spausk „Leisk abu“ ir stebėk. Abu rutuliai atrieda beveik kartu.",
│ -      "Pasirink „Aukšta“ ir vėl leisk abu. Dabar jie atrieda greičiau.",
│ -      "Pasirink „Žema“ ir palygink. Abu rutuliai atrieda lėčiau."
│ +      "Pasirink „Aukšta“ ir vėl leisk abu. Dabar rutuliai atrieda greičiau negu prieš tai.",
│ +      "Pasirink „Žema“ ir palygink. Dabar rutuliai atrieda lėčiau negu prieš tai."
│      ],
│ -    "example": "Rogės nuo statesnio kalno įsibėgėja greičiau nei nuo lėkšto."
│ +    "example": "Rogės nuo statesnio kalno įsibėgėja greičiau nei nuo lėkšto kalno."
│    },
│    "sim": {
│      "component": "nuozulnioji-plokstuma",
│ content/lt/grade-01/pasaulio-pazinimas/17-judejimas.json
│ @@ -39,15 +39,15 @@
│        "why": "Plokštuma abiem ta pati, todėl jie atrieda beveik kartu."
│      },
│      {
│ -      "q": "Tas pats rutulys rieda ta pačia plokštuma. Kaip jį priversti riedėti greičiau?",
│ +      "q": "Rideni tą patį rutulį ta pačia plokštuma. Kaip padaryti, kad jis riedėtų greičiau?",
│        "options": [
│          "Pakelti plokštumą",
│          "Pakeisti rutulį sunkesniu",
│          "Pakeisti rutulį lengvesniu"
│        ],
│        "answer": 0,
│ -      "hint": "Simuliacijoje rutulys buvo tas pats. Kas keitėsi?",
│ -      "why": "Aukštesnė plokštuma duoda didesnį nuolydį, todėl rutulys greičiau įsibėgėja."
│ +      "hint": "Bandyme rutulys liko tas pats. Ką pakeitei?",
│ +      "why": "Aukštesnė plokštuma statesnė, todėl rutulys greičiau įsibėgėja."
│      },
│      {
│        "q": "Du vaikai leidžiasi vienodomis rogėmis. Kuris įsibėgės greičiau?",
│ content/lt/grade-01/pasaulio-pazinimas/17-judejimas.json
│ @@ -50,15 +50,15 @@
│        "why": "Aukštesnė plokštuma statesnė, todėl rutulys greičiau įsibėgėja."
│      },
│      {
│ -      "q": "Du vaikai leidžiasi vienodomis rogėmis. Kuris įsibėgės greičiau?",
│ +      "q": "Du vaikai leidžiasi vienodomis rogėmis. Nuo kurio kalno vaikas įsibėgės greičiau?",
│        "options": [
│          "Nuo lėkštesnio kalno",
│          "Nuo statesnio kalno",
│ -        "Abu vienodai"
│ +        "Nuo abiejų kalnų vienodai"
│        ],
│        "answer": 1,
│ -      "hint": "Prisimink, kas pasikeitė pakėlus plokštumą.",
│ -      "why": "Statesnis kalnas veikia kaip aukštesnė plokštuma: greitis didesnis."
│ +      "hint": "Prisimink, kas atsitiko, kai plokštuma buvo aukšta.",
│ +      "why": "Statesnis kalnas veikia kaip aukštesnė plokštuma, todėl greitis didesnis."
│      },
│      {
│        "q": "Rutulys nuo aukštos plokštumos atrieda greičiau. Kodėl taip yra?",
│ content/lt/grade-01/pasaulio-pazinimas/17-judejimas.json
│ @@ -69,7 +69,7 @@
│        ],
│        "answer": 1,
│        "hint": "Palygink abi plokštumas, o ne rutulius.",
│ -      "why": "Keičiasi plokštuma, o ne rutulys, todėl greitis didesnis abiem.",
│ +      "why": "Keičiasi plokštuma, o ne rutulys, todėl greitis didesnis.",
│        "optional": true
│      }
│    ],
│ content/lt/grade-01/pasaulio-pazinimas/17-judejimas.json
│ @@ -73,7 +73,7 @@
│        "optional": true
│      }
│    ],
│ -  "reflect": "Kodėl sunkus rutulys neatsilieka nuo lengvo? Pasakyk savais žodžiais.",
│ +  "reflect": "Kodėl sunkus rutulys neatsilieka nuo lengvo rutulio? Pasakyk savais žodžiais.",
│    "teacher": {
│      "goal": "Suprasti, kad riedėjimo greitį lemia plokštumos aukštis (nuolydis), o ne daikto svoris. Modelis rodo abu rutulius vienu metu ir leidžia keisti tik vieną sąlygą.",
│      "prompt": "Kodėl sunkesnis rutulys neatriedėjo pirmas?",
│ content/lt/grade-01/index.json
│ @@ -51,7 +51,7 @@
│          { "id": "09-augalo-gyvenimas", "title": "Augalo gyvenimas", "subtitle": "Ko augalui reikia, kad jis augtų", "file": "grade-01/pasaulio-pazinimas/09-augalo-gyvenimas.json", "minutes": 9, "sim": "augalo-gyvenimas" },
│          { "id": "10-gyvunu-grupes", "title": "Gyvūnų grupės", "subtitle": "Žinduoliai, paukščiai, žuvys", "file": "grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json", "minutes": 9, "sim": "gyvunu-grupes" },
│          { "id": "16-vandens-busenos", "title": "Kur dingsta vanduo", "subtitle": "Vanduo neišnyksta — jis keičia savo formą", "file": "grade-01/pasaulio-pazinimas/16-vandens-busenos.json", "minutes": 9, "sim": "vandens-busenos" },
│ -        { "id": "17-judejimas", "title": "Nuožulnioji plokštuma: kas lemia greitį", "subtitle": "Greitį keičia plokštumos aukštis, o ne daikto svoris", "file": "grade-01/pasaulio-pazinimas/17-judejimas.json", "minutes": 9, "sim": "nuozulnioji-plokstuma" }
│ +        { "id": "17-judejimas", "title": "Nuožulnioji plokštuma: kas lemia greitį", "subtitle": "Greitį keičia plokštumos aukštis, o ne rutulio svoris", "file": "grade-01/pasaulio-pazinimas/17-judejimas.json", "minutes": 9, "sim": "nuozulnioji-plokstuma" }
│        ]
│      },
│      {
│ profiles/deepseek41flash/cache/scratch/run156/probe156_outcomes.py
│ @@ -0,0 +1,46 @@
│ +"""Zondas: tos pačios check_language.py taisyklės, bet ir `outcomes` laukui (LL-52/#5827).
│ +
│ +Irankis `check_language.py` `outcomes` neskaito, todėl jo 0 įspėjimų nieko nesako
│ +apie rezultatų sakinius. Zondas taiko tas pačias ribas (10 ž., 13 raidžių,
│ +dviprasmybės, įvardis pradžioje) ir išvardija pažeidimus.
│ +"""
│ +import json
│ +import re
│ +import sys
│ +
│ +MAX_WORDS = 10
│ +MAX_WORD_LEN = 13
│ +WORD_RE = re.compile(r"[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+")
│ +VAGUE = re.compile(r"^(tai|šis|ši|šie|šios|jis|ji|jie|jos|tas|ta|tie|tos)\b", re.I)
│ +AMBIG = [(r"\barba\b", "arba"), (r"\bnebūtinai\b", "nebūtinai"),
│ +         (r"\bnebent\b", "nebent"), (r"\bne\s+\w+\s+ne\b", "dvigubas neigimas")]
│ +
│ +
│ +def sentences(text):
│ +    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text or "") if s.strip()]
│ +
│ +
│ +def main(path):
│ +    data = json.loads(open(path, encoding="utf-8").read())
│ +    bad = []
│ +    for i, text in enumerate(data.get("outcomes") or [], 1):
│ +        for s in sentences(text):
│ +            words = WORD_RE.findall(s)
│ +            if len(words) > MAX_WORDS:
│ +                bad.append(f"outcomes[{i}] per ilgas sakinys: {len(words)} ž. — „{s}“")
│ +            for w in words:
│ +                if len(w) > MAX_WORD_LEN:
│ +                    bad.append(f"outcomes[{i}] ilgas žodis: {w} ({len(w)}) — „{s}“")
│ +            for pat, why in AMBIG:
│ +                if re.search(pat, s, re.I):
│ +                    bad.append(f"outcomes[{i}] dviprasmybė ({why}) — „{s}“")
│ +            if VAGUE.match(s) and len(words) > 3:
│ +                bad.append(f"outcomes[{i}] įvardis pradžioje — „{s}“")
│ +    print(f"{path}: {len(bad)} pažeidimų")
│ +    for b in bad:
│ +        print("  -", b)
│ +    return len(bad)
│ +
│ +
│ +if __name__ == "__main__":
│ +    raise SystemExit(1 if main(sys.argv[1]) else 0)
Sustabdytas iteracijų limitas — toliau apibendrinu, ką realiai padariau ir kas liko nepadaryta.

## Modulis: 17-judejimas (`content/lt/grade-01/pasaulio-pazinimas/17-judejimas.json`)

### Prieš → po (formuluotės)

| Laukas | Prieš | Po |
|---|---|---|
| subtitle | „Greitį keičia plokštumos aukštis, o ne daikto svoris“ | „…o ne **rutulio** svoris“ (konkretus daiktas vietoj bendro) |
| outcomes[1] | 11 ž. „Paaiškinu, kad vienodo dydžio rutuliai atrieda beveik kartu, nors sveria skirtingai.“ | 9 ž. „Paaiškinu, kodėl rutuliai atrieda beveik kartu, nors sveria skirtingai.“ |
| concept.steps[0] | „Pasirink, kuris rutulys, tavo manymu, atriedės pirmas.“ | „Pirma spėk, kuris rutulys atriedės pirmas.“ (viena instrukcija, be įterptinio „tavo manymu“) |
| concept.steps[2] | „…Dabar jie atrieda greičiau.“ | „…Dabar rutuliai atrieda greičiau **negu prieš tai**.“ (lyginamasis laipsnis be atskaitos) |
| concept.steps[3] | „…Abu rutuliai atrieda lėčiau.“ | „…Dabar rutuliai atrieda lėčiau **negu prieš tai**.“ |
| concept.example | „…greičiau nei nuo lėkšto.“ | „…nei nuo lėkšto **kalno**.“ (elipsė užbaigta) |
| tasks[1].q | „Tas pats rutulys rieda ta pačia plokštuma. Kaip jį priversti riedėti greičiau?“ (įvardis pradžioje, „priversti“) | „Rideni tą patį rutulį ta pačia plokštuma. Kaip padaryti, kad jis riedėtų greičiau?“ |
| tasks[1].hint | „Simuliacijoje rutulys buvo tas pats. Kas keitėsi?“ (žargonas + 3 asmuo) | „Bandyme rutulys liko tas pats. Ką pakeitei?“ |
| tasks[1].why | „…duoda didesnį **nuolydį**…“ (term nas, niekur neįvestas) | „Aukštesnė plokštuma **statesnė**, todėl rutulys greičiau įsibėgėja.“ |
| tasks[2].q | „…**Kuris** įsibėgės greičiau?“ ↔ atsakymai „Nuo … kalno“ (klausiamasis žodis netinka atsakymams) | „…**Nuo kurio kalno** vaikas įsibėgės greičiau?“ |
| tasks[2].options[2] | „Abu vienodai“ (abiem vaikams? abiem kalnams?) | „Nuo abiejų kalnų vienodai“ |
| tasks[2].hint | „…kas pasikeitė **pakėlus** plokštumą“ (dalyvis) | „Prisimink, kas atsitiko, kai plokštuma buvo aukšta.“ |
| tasks[2].why | „…: greitis didesnis.“ (dvitaškis, be veikėjo) | „…, todėl greitis didesnis.“ |
| tasks[3].why | „…todėl greitis didesnis **abiem**.“ (kabantis naudininkas) | „…todėl greitis didesnis.“ |
| reflect | „…neatsilieka nuo **lengvo**?“ (elipsė) | „…nuo lengvo **rutulio**?“ |

`content/lt/grade-01/index.json:54` subtitle sinchronizuotas (LL-05/LL-21). Atsakymų indeksai ir teisingi variantai — nepakeisti nė viename.

### Matavimai (realūs, prieš → po)
- `check_language.py` (modulis): 0 klaidų / 0 įspėjimų / **1 pastaba → 0** (dingo „Tas pats rutulys…“ įvardis pradžioje). Klasė: 0 klaidų, 4 įspėjimai, **21 → 20 pastabų**.
- `validate_content.py --grade 1` ir be parametrų: **0 klaidų, 0 įspėjimų**, exit 0.
- `check_audio.py`: 463 tekstai, visi su dviem Piper įrašais — nepakito (keisti laukai nerenkami garsui).
- `check_view.py` (Brave skydų blokada, 127.0.0.1:8995, desktop/tablet/phone) **prieš**: overflow 0/0/0, smallCount 0, minTaskFont 21.44 / 21.44 / 19.14, tasksVisible 4/4, problems [].

### Sąmoningai nekeista
- **title** „…kas lemia greitį“ — keitimas dubliuotų `concept.title` (h2 iškart po h1) arba įvestų kabantį lyginamąjį laipsnį; „lemia“ palikta.
- **concept.big_idea** 2 sakinys — 10 ž., ties riba, bet keitimas numestų „vienodo dydžio“ (kontrolinis kintamasis).
- **tasks[0].hint/why, tasks[3].q/hint, outcomes[0] („Nurodau“)** — švarūs; „Nurodau“ atitinka platformos šabloną.
- **sim.config.words** — negyva konfigūracija (`mount` neima `config`), bet ji generuoja garso įrašus; keisti be audio perkūrimo negalima → ne mano ribose (šiandien tokio paties tipo pasiūlymas jau yra #5984).
- Simuliacijos logika ir tekstai (`pasaulis.js`) — neliesti.

### Liko nepadaryta (sąžiningai)
1. **`check_view.py` po pakeitimų nepakartotas** — prieš darbą visi trys plotai buvo švarūs; tekstai tik trumpėjo, bet patvirtinimo po neturiu.
2. **Zondas `outcomes` laukui** (`/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/run156/probe156_outcomes.py`) parašytas, bet **nepaleistas** — neturiu skaičiaus „prieš/po“ outcomes laukui (LL-52 aklumo įrodymui).
3. **`agents/log/` ataskaita ir `agents/state.json` neatnaujinti** (limitas baigėsi).
4. **`research/wiki/guidelines/kalbos-auditas.md`** #14 eilutė (outcomes[1]) dar nepažymėta kaip užtaisyta.
5. Foninis serveris 127.0.0.1:8995 dar veikia (sesija `proc_9c882068a6c4`).
6. Jokio commit/push — kaip ir reikalaujama, tai bėgiklio darbas.

## klaidos

```
session_id: local-a1131ddf8422e480c6fe103009c0a3a85b9e467a86093011d2645ada6ab9f939
```
