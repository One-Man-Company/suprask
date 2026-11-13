# sistemos-architektas — 2026-11-13T2021

- paleidimas: #274 (manual)
- trukmė: 661s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/list_new.py
│ @@ -0,0 +1,9 @@
│ +import json, glob, os
│ +rows = []
│ +for f in glob.glob('agents/proposals/*.json'):
│ +    d = json.load(open(f))
│ +    rows.append((d.get('status'), d.get('id') or os.path.basename(f), d.get('priority'),
│ +                 d.get('type'), d.get('title'), f))
│ +for r in sorted(rows, key=lambda x: str(x[0])):
│ +    if r[0] == 'new':
│ +        print(r[0], r[1], r[2], r[3], '|', str(r[4])[:95], '|', os.path.basename(r[5]))
│ profiles/deepseek41flash/cache/scratch/doc_rows.py
│ @@ -0,0 +1,9 @@
│ +import re
│ +from pathlib import Path
│ +
│ +ROOT = Path("/home/zoltanas/workspace/suprask")
│ +text = (ROOT / "docs" / "ARCHITEKTURA.md").read_text(encoding="utf-8")
│ +rows = [ln for ln in text.splitlines() if ln.startswith("| `")]
│ +for ln in rows:
│ +    cells = [c.strip() for c in ln.strip("|").split("|")]
│ +    print(cells[0], "||", cells[1])
│ profiles/deepseek41flash/cache/scratch/scan_speak.py
│ @@ -0,0 +1,17 @@
│ +import json
│ +import re
│ +from pathlib import Path
│ +
│ +ROOT = Path("/home/zoltanas/workspace/suprask")
│ +manifest = json.loads((ROOT / "assets/audio/lt/manifest.json").read_text(encoding="utf-8"))
│ +lits = {}
│ +pat = re.compile(r'api\.speak\(\s*"([^"\\]{2,120})"')
│ +for f in sorted((ROOT / "assets/js/sims").glob("*.js")):
│ +    src = f.read_text(encoding="utf-8")
│ +    for m in pat.finditer(src):
│ +        lits.setdefault(m.group(1), []).append(f.name)
│ +print("literal api.speak strings:", len(lits))
│ +missing = {t: v for t, v in lits.items() if t not in manifest}
│ +print("without audio:", len(missing))
│ +for t, v in missing.items():
│ +    print(" -", repr(t), v)
│ scripts/generate_audio.py
│ @@ -154,8 +154,39 @@
│              yield from _all_strings(x)
│
│
│ +SPEAK_LITERAL = re.compile(
│ +    r"""api\.speak\(\s*(?:"([^"\\\n]{2,120})"|'([^'\\\n]{2,120})'|`([^`\\$\n]{2,120})`)"""
│ +)
│ +
│ +
│ +def spoken_literals() -> set[str]:
│ +    """Sakiniai, kuriuos simuliacija taria tiesiogine eilute, o ne iš `sim.config`.
│ +
│ +    Kodėl tai reikia rinkti: `collect()` iki šiol ėmė tekstus TIK iš modulių JSON
│ +    (`sim.config` raktų) ir `EXTRA`. Simuliacijų kode likę `api.speak("…")`
│ +    sakiniai nebuvo renkami, todėl jų niekas nesugeneruodavo ir `check_audio.py`
│ +    jų nematė — vaikas paspaudęs mygtuką negirdėdavo nieko, o vartai sakydavo
│ +    „Garsas pilnas“. Šiandien (2026-11-13) toks buvo „Visi taikiniai pasiekti!“
│ +    (matematika.js) — sėkmės pranešimas, kuris tyliai iškrisdavo.
│ +
│ +    Imamos tik statinės eilutės: šablonai su `${…}` ir kintamieji (`String(x)`)
│ +    praleidžiami, nes jų teksto iš anksto sugeneruoti negalima. Tokių atvejų
│ +    skaičius grąžinamas atskirai (`dynamic`), kad spraga būtų matoma, o ne
│ +    nutylėta (LL-37).
│ +    """
│ +    texts: set[str] = set()
│ +    for path in sorted((ROOT / "assets" / "js" / "sims").glob("*.js")):
│ +        src = path.read_text(encoding="utf-8")
│ +        for match in SPEAK_LITERAL.finditer(src):
│ +            literal = next((g for g in match.groups() if g), "")
│ +            if literal.strip():
│ +                texts.add(literal.strip())
│ +    return texts
│ +
│ +
│  def collect() -> list[str]:
│      texts: set[str] = set(EXTRA)
│ +    texts |= spoken_literals()
│      keys = {"word", "syllables", "words", "sentences", "label"}
│      for path in sorted(CONTENT.glob("grade-*/**/*.json")):
│          if path.name == "index.json":
│ scripts/generate_audio.py
│ @@ -170,9 +170,9 @@
│      (matematika.js) — sėkmės pranešimas, kuris tyliai iškrisdavo.
│
│      Imamos tik statinės eilutės: šablonai su `${…}` ir kintamieji (`String(x)`)
│ -    praleidžiami, nes jų teksto iš anksto sugeneruoti negalima. Tokių atvejų
│ -    skaičius grąžinamas atskirai (`dynamic`), kad spraga būtų matoma, o ne
│ -    nutylėta (LL-37).
│ +    praleidžiami, nes jų teksto iš anksto sugeneruoti negalima. Tai žinoma
│ +    riba: kintamas tekstas lieka naršyklės balsui (arba tyla) ir į šį vartų
│ +    sąrašą nepatenka.
│      """
│      texts: set[str] = set()
│      for path in sorted((ROOT / "assets" / "js" / "sims").glob("*.js")):
│ scripts/check_audio.py
│ @@ -62,6 +62,7 @@
│
│      manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
│      texts = generate_audio.collect()
│ +    literals = generate_audio.spoken_literals()
│      refs = referenced(manifest)
│      disk = on_disk()
│
│ scripts/generate_audio.py
│ @@ -22,6 +22,7 @@
│  import json
│  import os
│  import pathlib
│ +import re
│  import subprocess
│  import sys
│
│ scripts/check_audio.py
│ @@ -104,6 +104,7 @@
│      return {
│          "ok": not missing and not wrong_engine,
│          "texts": len(texts),
│ +        "literals": len(literals),
│          "referenced": len(refs),
│          "on_disk": len(disk),
│          "orphans": orphans,
│ scripts/check_audio.py
│ @@ -154,7 +154,8 @@
│
│      used = data["referenced"]
│      total = data["on_disk"]
│ -    print(f"✔ Garsas pilnas: {data['texts']} tekstų, {used} įrašų, visi iš Piper balso, "
│ +    print(f"✔ Garsas pilnas: {data['texts']} tekstų (iš jų {data['literals']} — tiesioginės "
│ +          f"api.speak eilutės simuliacijų kode), {used} įrašų, visi iš Piper balso, "
│            f"naudojama {used} iš {total} mp3.")
│
│      if data["orphans"]:
│ profiles/deepseek41flash/cache/scratch/mf.py
│ @@ -0,0 +1,3 @@
│ +import json
│ +m = json.load(open('/home/zoltanas/workspace/suprask/assets/audio/lt/manifest.json'))
│ +print(m.get('Visi taikiniai pasiekti!'))
│ scripts/check_docs_facts.py
│ @@ -227,6 +227,75 @@
│          if sim_file.name not in text:
│              check.fail(f"{where}: struktūros medyje trūksta assets/js/sims/{sim_file.name}")
│
│ +    check_schedule(check, text)
│ +
│ +
│ +def role_schedule() -> dict[str, dict]:
│ +    """`ROLES` iš `agents/run.py` — perskaitomas iš AST, ne importuojant bėgiklį.
│ +
│ +    Importuoti negalima: `run.py` krauna `db`, `scope`, `pause`, t. y. daro
│ +    šalutinius veiksmus. AST skaitymas duoda tą patį sąrašą neįvykdęs nė eilutės,
│ +    ir nereikia antro sąrašo dokumentacijoje (LL-21: skaičius turi būti
│ +    perskaičiuojamas, ne perrašomas).
│ +    """
│ +    src = (ROOT / "agents" / "run.py").read_text(encoding="utf-8")
│ +    for node in ast.parse(src).body:
│ +        value = None
│ +        if isinstance(node, ast.AnnAssign) and isinstance(node.target, ast.Name):
│ +            if node.target.id == "ROLES":
│ +                value = node.value
│ +        elif isinstance(node, ast.Assign) and len(node.targets) == 1:
│ +            if isinstance(node.targets[0], ast.Name) and node.targets[0].id == "ROLES":
│ +                value = node.value
│ +        if value is not None:
│ +            return ast.literal_eval(value)
│ +    return {}
│ +
│ +
│ +def check_schedule(check: Check, text: str) -> None:
│ +    """Ar ARCHITEKTURA tvarkaraščio lentelė atitinka `ROLES` grafikus.
│ +
│ +    Kodėl: 2026-11-13 lentelėje 5 iš 15 eilučių rodė laiką, kurio sistema
│ +    nebeturi (tikrintojas 06:40, nors timeris 05:50; kurejas 09:30, nors 09:00;
│ +    publikavimo agentas „kas 4 h“, nors 5 kartus per dieną). Tai dokumentas,
│ +    kuriuo vadovaujasi ir žmonės, ir agentai, o `check_docs_facts.py` tikrino
│ +    tik modulių skaičius — tvarkaraštis buvo vienintelė lentelė be vartų.
│ +    """
│ +    where = "docs/ARCHITEKTURA.md"
│ +    roles = role_schedule()
│ +    if not roles:
│ +        check.fail(f"{where}: nepavyko perskaityti ROLES iš agents/run.py")
│ +        return
│ +
│ +    rows: dict[str, str] = {}
│ +    for line in text.splitlines():
│ +        match = re.match(r"^\|\s*`([a-z][a-z-]+)`\s*\|([^|]*)\|", line)
│ +        if match:
│ +            rows[match.group(1)] = line
│ +
│ +    for role in sorted(set(roles) - set(rows)):
│ +        check.fail(f"{where}: tvarkaraščio lentelėje trūksta vaidmens `{role}`")
│ +
│ +    for role, line in sorted(rows.items()):
│ +        if role not in roles:
│ +            continue
│ +        cell = line.split("|")[2]
│ +        calendar = roles[role].get("on_calendar") or ""
│ +        calendars = calendar if isinstance(calendar, list) else [calendar]
│ +        expected = sorted({
│ +            clock[:5]
│ +            for entry in calendars
│ +            for clock in re.findall(r"\d{2}:\d{2}:\d{2}", entry)
│ +        })
│ +        found = sorted(set(re.findall(r"\d{2}:\d{2}", cell)))
│ +        if expected != found:
│ +            check.fail(
│ +                f"{where}:{line_of(text, line.strip())}: `{role}` laikas lentelėje {', '.join(found) or '—'}, "
│ +                f"o agents/run.py ROLES.on_calendar → {', '.join(expected) or '—'}"
│ +            )
│ +        else:
│ +            print(f"✔ {where}:{line_of(text, line.strip())}: `{role}` laikas = {', '.join(found)}")
│ +
│
│  def check_grades_json(check: Check, f: dict) -> None:
│      where = "content/lt/grades.json"
│ scripts/check_docs_facts.py
│ @@ -17,6 +17,7 @@
│  from __future__ import annotations
│
│  import argparse
│ +import ast
│  import json
│  import re
│  import sys
│ README.md
│ @@ -109,7 +109,7 @@
│
│  ## Garsas
│
│ -Lietuviškas garsas — iš anksto sugeneruoti įrašai, ne naršyklės sintezė: 567 tekstų po du variantus (sakinys ir skiemuo) — 1134 įrašų, ~33 MB. Numatytasis variklis yra Piper (`lt_LT-reginute1`), nes jis kirtį ima iš 189 262 formų kirčio žodyno, o ne spėlioja; lietuvių kalboje kirtis keičia reikšmę. Azure/Edge balsas (`--engine edge`) paliktas atsarginiam perklausos variantui, o naršyklės balsas naudojamas tik tada, kai teksto nėra manifests ir yra lietuviškas balsas. Generavimas — `scripts/generate_audio.py`, pilnumas tikrinamas `scripts/check_audio.py`.
│ +Lietuviškas garsas — iš anksto sugeneruoti įrašai, ne naršyklės sintezė: 568 tekstų po du variantus (sakinys ir skiemuo) — 1136 įrašų, ~33 MB. Numatytasis variklis yra Piper (`lt_LT-reginute1`), nes jis kirtį ima iš 189 262 formų kirčio žodyno, o ne spėlioja; lietuvių kalboje kirtis keičia reikšmę. Azure/Edge balsas (`--engine edge`) paliktas atsarginiam perklausos variantui, o naršyklės balsas naudojamas tik tada, kai teksto nėra manifests ir yra lietuviškas balsas. Generavimas — `scripts/generate_audio.py`, pilnumas tikrinamas `scripts/check_audio.py`.
│
│  ## Licencijos
│
│ docs/ARCHITEKTURA.md
│ @@ -77,11 +77,11 @@
│
│  | vaidmuo | dažnis | ką daro | išėjimas |
│  |---|---|---|---|
│ -| `tikrintojas` | kasdien 06:40 | validuoja turinį, nuorodas, simuliacijų registrą | ataskaita, issue |
│ -| `tyrejas` | pirmadienis 07:00 | ieško tyrimų ir metodų | wiki įrašai |
│ -| `ideator` | kasdien 07:10 | ieško naujų pamokų idėjų pagal programos spragas | 1–3 pasiūlymai |
│ +| `tikrintojas` | kasdien 05:50 | validuoja turinį, nuorodas, simuliacijų registrą | ataskaita, issue |
│ +| `tyrejas` | pirmadienis 06:40 | ieško tyrimų ir metodų | wiki įrašai |
│ +| `ideator` | kasdien 07:40 | ieško naujų pamokų idėjų pagal programos spragas | 1–3 pasiūlymai |
│  | `metodininkas` | kasdien 08:20 | projektuoja mokymo metodą ir simuliacijos scenarijų | metodo pasiūlymas |
│ -| `kurejas` | kasdien 09:30 | kuria modulį pagal patvirtintą metodą | PR |
│ +| `kurejas` | kasdien 09:00 | kuria modulį pagal patvirtintą metodą | PR |
│  | `simuliaciju-inzinierius` | kasdien 11:00 | kuria ir tobulina simuliacijas | PR |
│  | `dizaineris` | II, IV, VI 12:30 | tobulina struktūrą (`path.json`) ir sąsają | PR + pilotas |
│  | `kritikas` | kasdien 14:00 | nepriklausoma kritika: pedagogika, UX, teiginiai, gairės | kritikos įrašai, blokavimai |
│ docs/ARCHITEKTURA.md
│ @@ -91,7 +91,7 @@
│  | `kuratorius` | sekmadienis 18:00 | savaitės suvestinė ir prioritetai | suvestinė |
│  | `kalbu-redaktorius` | II, V 13:10 | tikrina užduočių formuluotes: vienareikšmiškumas, žodžių ir sakinio ilgis | PR |
│  | `sistemos-architektas` | kasdien 20:20 | matuoja agentų darbą, taiso sistemines problemas, keičia grafikus ir promptus | PR, ataskaita |
│ -| `publikavimo-agentas` | kas 4 h (06, 10, 14, 18, 22) | užtikrina, kad sukurtas turinys būtų paskelbtas ir neprarastų ankstesnių modulių | publikavimas |
│ +| `publikavimo-agentas` | kasdien 5 kartus (06:20, 11:40, 16:00, 19:30, 23:00) | užtikrina, kad sukurtas turinys būtų paskelbtas ir neprarastų ankstesnių modulių | publikavimas |
│
│  Ciklas: **ieška → metodas → turinys → simuliacija → kritika → leidimas**. Kritikas ir leidėjas yra atskirti sąmoningai: kas kuria, tas nevertina; kas vertina, tas neleidžia; kas leidžia, tas nekuria.
│
│ scripts/add_optional_tasks.py
│ @@ -111,37 +111,98 @@
│  }
│
│
│ +def rename_map() -> dict[str, str]:
│ +    """Seno ID → naujo ID iš `scripts/known_renames.json`.
│ +
│ +    Kodėl: 2026-11-13 `OPTIONAL` raktai ėjo pagal senus ID („03-sakinio-tvarka“),
│ +    o modulis jau „03-sakinio-zodziai“. Toks modulis buvo tyliai praleidžiamas —
│ +    įrankis pranešdavo „Pridėta 0“, lyg viskas būtų padaryta. Čia tas pats
│ +    žemėlapis, kuriuo remiasi `check_published.py`, kad pervadinimas nebūtų
│ +    kiekvieno įrankio problema atskirai.
│ +    """
│ +    path = ROOT / "scripts" / "known_renames.json"
│ +    if not path.exists():
│ +        return {}
│ +    try:
│ +        data = json.loads(path.read_text(encoding="utf-8"))
│ +    except json.JSONDecodeError:
│ +        return {}
│ +    return {entry["from"]: entry["to"] for entry in data.get("renames", []) if entry.get("from") and entry.get("to")}
│ +
│ +
│  def main() -> int:
│      ap = argparse.ArgumentParser()
│      ap.add_argument("--write", action="store_true")
│ +    ap.add_argument("--check", action="store_true",
│ +                    help="grąžina 1, jei liko modulių be praplėtimo arba OPTIONAL raktas nieko neatitinka")
│      args = ap.parse_args()
│
│ +    aliases = rename_map()
│      changed = 0
│ +    seen = 0
│ +    with_optional: list[str] = []
│ +    without_optional: list[str] = []
│ +    used_keys: set[str] = set()
│ +    via_rename: list[str] = []
│ +
│      for path in sorted(CONTENT.glob("grade-*/**/*.json")):
│          if path.name == "index.json":
│              continue
│          data = json.loads(path.read_text(encoding="utf-8"))
│          mid = data.get("id")
│ +        if not mid:
│ +            print(f"{path.relative_to(ROOT)}: trūksta „id“ — praleista")
│ +            continue
│ +        seen += 1
│          extra = OPTIONAL.get(mid)
│ -        if not extra:
│ -            continue
│ +        if extra:
│ +            used_keys.add(mid)
│ +        elif aliases.get(mid) in OPTIONAL:
│ +            # Modulis pervadintas: praplėtimo tekstas galioja ir toliau, bet
│ +            # raktas turi būti atnaujintas, kad sąrašas neštų dabartinį ID.
│ +            extra = OPTIONAL[aliases[mid]]
│ +            used_keys.add(aliases[mid])
│ +            via_rename.append(f"{aliases[mid]} → {mid}")
│ +        elif mid in aliases and aliases[mid] in OPTIONAL:
│ +            used_keys.add(aliases[mid])
│ +
│          tasks = data.setdefault("tasks", [])
│          if any(t.get("optional") for t in tasks):
│ +            with_optional.append(mid)
│ +            continue
│ +        if not extra:
│ +            without_optional.append(mid)
│              continue
│          if len(tasks) >= 5:
│ -            print(f"{mid}: jau 5 užduotys — praleista")
│ +            without_optional.append(mid)
│ +            print(f"{mid}: jau 5 užduotys, praplėtimo nėra — praleista (reikia žmogaus sprendimo)")
│              continue
│          task = dict(extra)
│          task["optional"] = True
│          tasks.append(task)
│          changed += 1
│ +        with_optional.append(mid)
│          print(f"{mid}: +1 praplėtimo užduotis (viso {len(tasks)})")
│ … omitted 23 diff line(s) across 1 additional file(s)/section(s)
│ scripts/add_optional_tasks.py
│ @@ -158,13 +158,12 @@
│          if extra:
│              used_keys.add(mid)
│          elif aliases.get(mid) in OPTIONAL:
│ -            # Modulis pervadintas: praplėtimo tekstas galioja ir toliau, bet
│ -            # raktas turi būti atnaujintas, kad sąrašas neštų dabartinį ID.
│ +            # Modulis pervadintas: praplėtimo tekstas galioja ir toliau, tik
│ +            # raktas likęs senas. Atpažįstama per `known_renames.json`, o ne
│ +            # tyliai praleidžiama.
│              extra = OPTIONAL[aliases[mid]]
│              used_keys.add(aliases[mid])
│              via_rename.append(f"{aliases[mid]} → {mid}")
│ -        elif mid in aliases and aliases[mid] in OPTIONAL:
│ -            used_keys.add(aliases[mid])
│
│          tasks = data.setdefault("tasks", [])
│          if any(t.get("optional") for t in tasks):
│ scripts/add_optional_tasks.py
│ @@ -138,6 +138,7 @@
│      args = ap.parse_args()
│
│      aliases = rename_map()
│ +    old_id = {new: old for old, new in aliases.items()}  # dabartinis ID → OPTIONAL raktas
│      changed = 0
│      seen = 0
│      with_optional: list[str] = []
│ @@ -146,7 +147,7 @@
│      via_rename: list[str] = []
│
│      for path in sorted(CONTENT.glob("grade-*/**/*.json")):
│ -        if path.name == "index.json":
│ +        if path.name in {"index.json", "path.json"}:
│              continue
│          data = json.loads(path.read_text(encoding="utf-8"))
│          mid = data.get("id")
│ @@ -157,13 +158,14 @@
│          extra = OPTIONAL.get(mid)
│          if extra:
│              used_keys.add(mid)
│ -        elif aliases.get(mid) in OPTIONAL:
│ +        elif OPTIONAL.get(old_id.get(mid)):
│              # Modulis pervadintas: praplėtimo tekstas galioja ir toliau, tik
│              # raktas likęs senas. Atpažįstama per `known_renames.json`, o ne
│              # tyliai praleidžiama.
│ -            extra = OPTIONAL[aliases[mid]]
│ -            used_keys.add(aliases[mid])
│ -            via_rename.append(f"{aliases[mid]} → {mid}")
│ +            key = old_id[mid]
│ +            extra = OPTIONAL[key]
│ +            used_keys.add(key)
│ +            via_rename.append(f"{key} → {mid}")
│
│          tasks = data.setdefault("tasks", [])
│          if any(t.get("optional") for t in tasks):
│ scripts/add_optional_tasks.py
│ @@ -150,19 +150,19 @@
│          if path.name in {"index.json", "path.json"}:
│              continue
│          data = json.loads(path.read_text(encoding="utf-8"))
│ -        mid = data.get("id")
│ +        mid = str(data.get("id") or "")
│          if not mid:
│              print(f"{path.relative_to(ROOT)}: trūksta „id“ — praleista")
│              continue
│          seen += 1
│ +        key = old_id.get(mid)
│          extra = OPTIONAL.get(mid)
│          if extra:
│              used_keys.add(mid)
│ -        elif OPTIONAL.get(old_id.get(mid)):
│ +        elif key and key in OPTIONAL:
│              # Modulis pervadintas: praplėtimo tekstas galioja ir toliau, tik
│              # raktas likęs senas. Atpažįstama per `known_renames.json`, o ne
│              # tyliai praleidžiama.
│ -            key = old_id[mid]
│              extra = OPTIONAL[key]
│              used_keys.add(key)
│              via_rename.append(f"{key} → {mid}")
│ scripts/add_optional_tasks.py
│ @@ -192,6 +192,7 @@
│      print(f"\nModulių: {seen} · su praplėtimu: {len(with_optional)} · be praplėtimo: {len(without_optional)}")
│      if via_rename:
│          print(f"Atpažinta pagal pervadinimą ({len(via_rename)}): " + "; ".join(via_rename))
│ +        print("  → praplėtimo tekstas rastas, bet raktą verta pervadinti į dabartinį ID")
│      if unused:
│          print(f"OPTIONAL raktai, kurių né vienas modulis neatitinka ({len(unused)}): "
│                + ", ".join(unused))
│ profiles/deepseek41flash/cache/scratch/probe_optional.py
│ @@ -0,0 +1,48 @@
│ +"""Zondas: ar add_optional_tasks.py --check tikrai regi modulį be praplėtimo.
│ +
│ +Kopijuojama 39 modulių medis į scratch, viename modulyje nuimama `optional`
│ +užduotis, paleidžiamas įrankis. Tikrasis content/ neliečiamas.
│ +"""
│ +import json
│ +import shutil
│ +import subprocess
│ +import sys
│ +from pathlib import Path
│ +
│ +REAL = Path("/home/zoltanas/workspace/suprask")
│ +BASE = Path("/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe_optional")
│ +
│ +if BASE.exists():
│ +    shutil.rmtree(BASE)
│ +(BASE / "scripts").mkdir(parents=True)
│ +shutil.copytree(REAL / "content" / "lt", BASE / "content" / "lt")
│ +shutil.copy(REAL / "scripts" / "add_optional_tasks.py", BASE / "scripts" / "add_optional_tasks.py")
│ +shutil.copy(REAL / "scripts" / "known_renames.json", BASE / "scripts" / "known_renames.json")
│ +
│ +target = next((BASE / "content" / "lt").glob("grade-01/*/04-skaiciu-tiese.json"))
│ +data = json.loads(target.read_text(encoding="utf-8"))
│ +before = sum(1 for t in data["tasks"] if t.get("optional"))
│ +data["tasks"] = [t for t in data["tasks"] if not t.get("optional")]
│ +target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
│ +print(f"zondas: {target.name} praplėtimo užduočių buvo {before}, liko 0")
│ +
│ +run = subprocess.run([sys.executable, str(BASE / "scripts" / "add_optional_tasks.py"), "--write"],
│ +                     capture_output=True, text=True)
│ +print(run.stdout.strip())
│ +print("write rc =", run.returncode)
│ +
│ +run2 = subprocess.run([sys.executable, str(BASE / "scripts" / "add_optional_tasks.py"), "--check"],
│ +                      capture_output=True, text=True)
│ +print("check po --write rc =", run2.returncode)
│ +data = json.loads(target.read_text(encoding="utf-8"))
│ +print("po --write praplėtimo užduočių:", sum(1 for t in data["tasks"] if t.get("optional")))
│ +
│ +# antras zondas: modulis be jokio OPTIONAL įrašo (naujas ID, kurio žemėlapyje nėra)
│ +target2 = next((BASE / "content" / "lt").glob("grade-01/*/21-erdvines-figuros.json"))
│ +data2 = json.loads(target2.read_text(encoding="utf-8"))
│ +data2["tasks"] = [t for t in data2["tasks"] if not t.get("optional")]
│ +target2.write_text(json.dumps(data2, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
│ +run3 = subprocess.run([sys.executable, str(BASE / "scripts" / "add_optional_tasks.py"), "--check"],
│ +                      capture_output=True, text=True)
│ +print(run3.stdout.strip())
│ +print("check su moduliu be praplėtimo rc =", run3.returncode)
│ profiles/deepseek41flash/cache/scratch/scan_speak2.py
│ @@ -0,0 +1,22 @@
│ +import json
│ +import re
│ +from pathlib import Path
│ +
│ +ROOT = Path("/home/zoltanas/workspace/suprask")
│ +manifest = json.loads((ROOT / "assets/audio/lt/manifest.json").read_text(encoding="utf-8"))
│ +call = re.compile(r"api\.speak\((?:[^()]|\([^()]*\))*\)")
│ +lit = re.compile(r'"([^"\\\n]{2,120})"')
│ +seen = set()
│ +missing = []
│ +for f in sorted((ROOT / "assets/js/sims").glob("*.js")):
│ +    src = f.read_text(encoding="utf-8")
│ +    for m in call.finditer(src):
│ +        args = m.group(0)
│ +        for t in lit.findall(args):
│ +            seen.add(t)
│ +            if t not in manifest:
│ +                missing.append((f.name, t))
│ +print("literal strings inside api.speak calls:", len(seen))
│ +print("not in manifest:", len(missing))
│ +for f, t in missing:
│ +    print(" -", f, repr(t))
│ scripts/generate_audio.py
│ @@ -158,6 +158,11 @@
│  SPEAK_LITERAL = re.compile(
│      r"""api\.speak\(\s*(?:"([^"\\\n]{2,120})"|'([^'\\\n]{2,120})'|`([^`\\$\n]{2,120})`)"""
│  )
│ +# Atsarginis tekstas: `api.speak(S.pradek || "Bakstelėk figūrą.")`. Toks sakinys
│ +# tariamas tada, kai config reikšmės nėra, todėl jis taip pat yra vaikui
│ +# girdimas tekstas (proposal #4808). Skiriamas nuo `api.speak(line("tiese"))`,
│ +# kur „tiese“ yra config raktas, o ne sakinys.
│ +SPEAK_FALLBACK = re.compile(r"""api\.speak\([^;\n]{0,160}?\|\|\s*"([^"\\\n]{2,120})"\s*\)""")
│
│
│  def spoken_literals() -> set[str]:
│ scripts/generate_audio.py
│ @@ -187,6 +187,9 @@
│              literal = next((g for g in match.groups() if g), "")
│              if literal.strip():
│                  texts.add(literal.strip())
│ +        for match in SPEAK_FALLBACK.finditer(src):
│ +            if match.group(1).strip():
│ +                texts.add(match.group(1).strip())
│      return texts
│
│
│ README.md
│ @@ -109,7 +109,7 @@
│
│  ## Garsas
│
│ -Lietuviškas garsas — iš anksto sugeneruoti įrašai, ne naršyklės sintezė: 568 tekstų po du variantus (sakinys ir skiemuo) — 1136 įrašų, ~33 MB. Numatytasis variklis yra Piper (`lt_LT-reginute1`), nes jis kirtį ima iš 189 262 formų kirčio žodyno, o ne spėlioja; lietuvių kalboje kirtis keičia reikšmę. Azure/Edge balsas (`--engine edge`) paliktas atsarginiam perklausos variantui, o naršyklės balsas naudojamas tik tada, kai teksto nėra manifests ir yra lietuviškas balsas. Generavimas — `scripts/generate_audio.py`, pilnumas tikrinamas `scripts/check_audio.py`.
│ +Lietuviškas garsas — iš anksto sugeneruoti įrašai, ne naršyklės sintezė: 569 tekstų po du variantus (sakinys ir skiemuo) — 1138 įrašų, ~33 MB. Numatytasis variklis yra Piper (`lt_LT-reginute1`), nes jis kirtį ima iš 189 262 formų kirčio žodyno, o ne spėlioja; lietuvių kalboje kirtis keičia reikšmę. Azure/Edge balsas (`--engine edge`) paliktas atsarginiam perklausos variantui, o naršyklės balsas naudojamas tik tada, kai teksto nėra manifests ir yra lietuviškas balsas. Generavimas — `scripts/generate_audio.py`, pilnumas tikrinamas `scripts/check_audio.py`.
│
│  ## Licencijos
│
│ profiles/deepseek41flash/cache/scratch/close_props.py
│ @@ -0,0 +1,29 @@
│ +import sys
│ +sys.path.insert(0, "/home/zoltanas/workspace/suprask/agents")
│ +import db
│ +
│ +NOTE_AUDIO = ("Įgyvendinta #274: generate_audio.spoken_literals() renka statines api.speak() eilutes ir "
│ +              "|| atsarginius sakinius; check_audio.py praneša, kiek tekstų iš jų surasta. Sugeneruoti "
│ +              "„Visi taikiniai pasiekti!“ ir „Bakstelėk figūrą.“ → 569 tekstų / 1138 įrašų.")
│ +NOTE_DOCS = ("Įgyvendinta #274: check_docs_facts.check_schedule() lygina ARCHITEKTURA lentelę su "
│ +             "agents/run.py ROLES.on_calendar (AST, ne importas); 5 eilutės pataisytos. "
│ +             "check_docs_facts.py → 0 klaidų.")
│ +NOTE_OPT = ("Įgyvendinta #274: add_optional_tasks.py sprendžia senus ID per scripts/known_renames.json, "
│ +            "išvardija modulius be praplėtimo ir turi --check (rc=1). Zondas: nuėmus optional → rc=1.")
│ +
│ +targets = {
│ +    "Garso patikra nemato tiesioginių api.speak eilučių": NOTE_AUDIO,
│ +    "Simuliacijų atsarginiai sakiniai tariami, bet garso patikra jų nemato": NOTE_AUDIO,
│ +    "ARCHITEKTURA tvarkaraščio lentelė": NOTE_DOCS,
│ +    "Praplėtimo užduočių įrankis tyliai praleidžia modulius": NOTE_OPT,
│ +}
│ +
│ +rows = db.proposals(limit=500)
│ +done = 0
│ +for row in rows:
│ +    for needle, note in targets.items():
│ +        if needle in (row.get("title") or ""):
│ +            db.set_proposal_status(row["id"], "done", note)
│ +            print(f"#{row['id']} {row['status']} → done · {row['title'][:70]}")
│ +            done += 1
│ +print("pakeista:", done)
│ research/wiki/guidelines/pamokos.md
│ @@ -644,4 +644,11 @@
│  - **Taisyklė:** vartų išvestis gali registruoti **sprendimą**, bet negali skelbti, kad **pasekmė panaikinta**, jei to neįrodo served kodas. Priimto nukrypimo eilutė formuluojama taip, kad pasakytų, kas lieka: „registruota; žyma už seno ID vaiko naršyklėje LIEKA — alias mechanizmo nėra“. Kiekvienas žodis „nebegalioja“, „ištaisyta“, „sutvarkyta“ vartų išvestyje turi turėti atitikmenį, kurį galima `grep`-inti naršyklės kode; jei jo nėra, tai ne statusas, o ketinimas, ir vietą jam — `agents/proposals/`, ne spausdinama eilutė.
│  - **Patikra:** `grep -rn 'renamed\|alias' assets/js` → 0 (alias mechanizmo nėra, taigi ir „nebegalioja“ neteisinga). Po taisymo `python3 scripts/check_published.py` → ta pati eilutė su „žyma už seno ID vaiko naršyklėje LIEKA — alias mechanizmo nėra, žr. agents/proposals/“, `verdict.label` = `sutampa`, `rc=0` (sprendimas nepakito, pasikeitė tik tai, ką jis teigia). Darbas, kuris pasekmę pašalintų, atskirtas: `agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json`.
│
│ -
│ +## LL-90 — Vartai, kurie skaito tą patį šaltinį, kurį patys prižiūri: deklaracija sutampa su savimi
│ +
│ +- **Simptomas:** du vartai tuo pačiu metu buvo žali, o tikrovė kitokia. (A) `scripts/check_audio.py` 2026-11-13 skelbė „✔ Garsas pilnas: 567 tekstų, 1134 įrašų“, o simuliacijų kode buvę `api.speak("Visi taikiniai pasiekti!")` (`matematika.js:81`) ir `api.speak(S.pradek || "Bakstelėk figūrą.")` (`matematika.js:2487`) neturėjo nė vieno įrašo: vaikas paspaudęs mygtuką girdėdavo tylą, o vartai — „pilna“. (B) `docs/ARCHITEKTURA.md` tvarkaraščio lentelėje 5 iš 15 eilučių rodė laiką, kurio sistema neturi (`tikrintojas` 06:40, o timeris 05:50; `kurejas` 09:30, o 09:00; `ideator` 07:10, o 07:40; `tyrejas` 07:00, o 06:40; `publikavimo-agentas` „kas 4 h“, o 5 kartus per dieną), o `check_docs_facts.py` buvo žalias, nes tikrino tik modulių skaičius.
│ +- **Priežastis:** abu vartai ėmė atskaitą iš to paties šaltinio, kurį patys prižiūri. `generate_audio.collect()` rinko tekstus TIK iš `content/**.json` `sim.config`, o `check_audio.py` lygino su manifestu, sugeneruotu iš to paties `collect()` — santykis teisingas pagal konstrukciją, kad ir ką kodas taria. `check_docs_facts.py` lygino skaičius, kuriuos pats perskaičiuoja iš `index.json`, o tvarkaraščio lentelė buvo vienintelė, kurios niekas nelygino su `agents/run.py` `ROLES`. Kai vartai ir šaltinis yra tas pats failas, jie negali parodyti, kad šaltinis nepilnas.
│ +- **Taisyklė:** kiekvienas vartas privalo turėti bent vieną atskaitą iš tos pusės, kurioje **įvyksta poveikis**, o ne iš tos, kurią jis saugo: garsą vaikas girdi iš simuliacijų kodo → tekstų sąrašas imamas ir iš `assets/js/sims/*.js` (`api.speak` statinės eilutės ir `||` atsarginiai sakiniai), o tvarkaraštį vykdo `systemd` timer'iai → lentelė lyginama su `ROLES.on_calendar` (skaitoma AST, ne importuojant bėgiklį). Kiekvienas vartas išveda ir **aprėpties skaičių** („iš jų 8 — tiesioginės api.speak eilutės“), kad dalinė aprėptis būtų matoma; jei ko nustatyti negalima iš anksto (šablonai su `${…}`), tai pasakoma žodžiu, o ne nutylima.
│ +- **Patikra:** prieš taisymą `python3 scripts/check_audio.py` → „✔ 567 tekstų“; po `spoken_literals()` pridėjimo tas pats įrankis → `KLAIDA: 1 tekstų be garso įrašo: Visi taikiniai pasiekti!`, po `||` šablonų → dar ir „Bakstelėk figūrą.“; sugeneravus garsą → „✔ 569 tekstų (iš jų 8 — tiesioginės api.speak eilutės), 1138 įrašų“. Tvarkaraščiui: `python3 scripts/check_docs_facts.py` su nauju `check_schedule()` → 5 klaidos su tiksliais eilučių numeriais, pataisius lentelę → „0 klaidų, 0 įspėjimų“. Abiem atvejais skaičius dokumente perskaičiuojamas, o ne perrašomas ranka (LL-21).
│ +
│ +
│ agents/log/sistemos-architektas-2026-11-13T2020.md
│ @@ -0,0 +1,72 @@
│ +## 2026-11-13 20:20 · sistemos-architektas #274
│ +
│ +- **Mačiau:** 241 paleidimas per 7 d. (22 pristabdyta 31 val. ruože 11-10→11-11);
│ +  nenaudingų: `tikrintojas` 25 % (8 paleid., 1 tuščias, 3 pristabdyta), `metodininkas`
│ +  17 %, `ideator` 14 %, `kalbu-redaktorius` 11 %, `publikavimo-agentas` 7 %. Pasiūlymai
│ +  107: `new` 14, `done` 83, `blocked` 1, `obsolete` 9; seniausias neapdorotas 5 d.
│ +  Mano paties eilėje (sisteminiai pasiūlymai) — 11 įrašų, 9 laukė >3 d., ir būtent
│ +  tai buvo vienintelis `check_agents.py` įspėjimas. Trys iš jų buvo tos pačios
│ +  klasės ir turėjo aiškų įrodymą: garso vartai renka tekstus tik iš `sim.config`,
│ +  ARCHITEKTURA tvarkaraščio lentelės niekas nelygina su `ROLES`, o
│ +  `add_optional_tasks.py` seną ID praleidžia tyliai.
│ +- **Keičiau:**
│ +  - `scripts/generate_audio.py` — naujas `spoken_literals()`: renka statines
│ +    `api.speak("…")` eilutes ir `||` atsarginius sakinius iš `assets/js/sims/*.js`
│ +    (ne tik iš `content/**.json`), todėl tekstų sąrašas dabar yra toje pusėje,
│ +    kurioje vaikas girdi; `collect()` juos įtraukia.
│ +  - `scripts/check_audio.py` — praneša aprėptį („iš jų 8 — tiesioginės api.speak
│ +    eilutės simuliacijų kode“), kad dalinė aprėptis būtų matoma, o ne skambėtų
│ +    kaip visuma.
│ +  - `scripts/check_docs_facts.py` — naujas `check_schedule()`: `ROLES` skaitomas
│ +    iš `agents/run.py` per `ast` (ne importuojant bėgiklį), ARCHITEKTURA
│ +    tvarkaraščio lentelės laikai lyginami su `on_calendar`; trūkstamas vaidmuo
│ +    lentelėje — klaida, o ne tyla.
│ +  - `docs/ARCHITEKTURA.md` — 5 tvarkaraščio eilutės pataisytos pagal `ROLES`
│ +    (`tikrintojas` 05:50, `tyrejas` 06:40, `ideator` 07:40, `kurejas` 09:00,
│ +    `publikavimo-agentas` 5 kartus per dieną).
│ +  - `scripts/add_optional_tasks.py` — seni ID sprendžiami per
│ +    `scripts/known_renames.json`, išvedama „Modulių / su praplėtimu / be
│ +    praplėtimo“, išvardijami nieko neatitinkantys `OPTIONAL` raktai, yra
│ +    `--check` (rc=1, kai yra spraga).
│ +  - `README.md` — garso skaičiai perskaičiuoti (569 tekstų, 1138 įrašų).
│ +  - `research/wiki/guidelines/pamokos.md` — nauja **LL-90** („Vartai, kurie skaito
│ +    tą patį šaltinį, kurį patys prižiūri“).
│ +  - `agents/runs.db` — #11235, #4808, #14727, #15044 → `done` su įrodymais.
│ +- **Kodėl:** trys darbai yra viena priežastis — **vartai ėmė atskaitą iš to
│ +  paties šaltinio, kurį saugo**. `check_audio` lygino manifestą su tekstų
│ +  sąrašu, sugeneruotu iš to paties `collect()`, todėl „Garsas pilnas“ buvo
│ +  teisingas pagal konstrukciją, kad ir ką simuliacijų kodas taria. Pasekmė
│ +  buvo vaikui matoma (tiksliau — girdima): `api.speak("Visi taikiniai
│ +  pasiekti!")` ir `api.speak(S.pradek || "Bakstelėk figūrą.")` neturėjo įrašo,
│ +  tad sėkmės pranešimas ir kvietimas veikti iškrisdavo tyliai. Lygiai taip
│ +  `check_docs_facts` lygino skaičius, kuriuos pats perskaičiuoja, o
│ +  tvarkaraštį — vienintelę lentelę, kurios neperskaičiuoja — paliko be vartų.
│ +  Trečiasis (optional įrankis) yra ta pati silpnumo klasė vienu lygmeniu
│ +  žemiau: įrankis dirbo pagal seną raktą, o „0 pridėta“ skambėjo kaip sėkmė.
│ +- **Patikra:** prieš: `check_audio.py` → „✔ 567 tekstų, 1134 įrašų“;
│ +  po `spoken_literals()` → `KLAIDA: 1 tekstų be garso įrašo: Visi taikiniai
│ +  pasiekti!`; pridėjus `||` šablonus → dar ir „Bakstelėk figūrą.“; sugeneravus
│ +  garsą (`.venv/bin/python scripts/generate_audio.py`, Piper, 2 tekstai) →
│ +  „✔ 569 tekstų (iš jų 8 — tiesioginės api.speak eilutės), 1138 įrašų,
│ +  naudojama 1138 iš 1138“, manifeste `Visi taikiniai pasiekti!` →
│ +  `n/ba4855f4b9f8191c-f13f6eda.mp3`, `s/ba4855f4b9f8191c-152d9210.mp3`.
│ +  `check_docs_facts.py` su `check_schedule()` → 5 klaidos (tikrintojas 06:40≠05:50,
│ +  tyrejas 07:00≠06:40, ideator 07:10≠07:40, kurejas 09:30≠09:00,
│ +  publikavimo-agentas „—“≠5 laikai), pataisius lentelę → „0 klaidų, 0 įspėjimų“.
│ +  `add_optional_tasks.py` → „Modulių: 39 · su praplėtimu: 39 · be praplėtimo: 0“,
│ +  „Atpažinta pagal pervadinimą (1): 03-sakinio-tvarka → 03-sakinio-zodziai“.
│ +  Zondas atskiroje kopijoje (scratch): nuėmus `optional` iš `04-skaiciu-tiese` →
│ +  `--write` grąžina užduotį (1 → 0 → 1), o `--check` su moduliu `21-erdvines-figuros`
│ +  be praplėtimo → `rc=1`. Kiti vartai: `validate_content.py --grade 1` 0/0,
│ +  `check_language.py --grade 1` 0 klaidų (7 įspėjimai — buvę), `check_ui.py` 0/0,
│ +  `check_art.py` ✔, `check_lessons.py` ✔ 90 įrašų, `check_docs_facts.py` 0/0,
│ +  `check_agents.py` 15 vaidmenų, 1 įspėjimas (7 seni sisteminiai pasiūlymai).
│ +  `system_report.py` po: pasiūlymai 107 (new 14→10, done 83→87, sisteminė eilė
│ +  11→7).
│ +- **Neišspręsta sąmoningai:** #4455 (ataskaitų dydis), #4516 (sakinio ilgis lieka
│ +  įspėjimu — tai turinio sprendimas, ne vartų), #5190 (commit žinutė iš modelio
│ +  teksto), #5342 (worktree izoliacija), #5400 (`sync_docs_facts.py`),
│ +  #7396/#4921 (`check_view.py` 200 % tekstas ir <360 px — reikia Playwright
│ +  matavimo, ne vieno pataisymo), #15045 (alias žemėlapis `progress.js` — kito
│ +  vaidmens failas), #5834 (`blocked`, reikia žmogaus sprendimo).
│ +  `agents/scope.json`, `content/`, `assets/js/sims/`, CSS ir kitos klasės neliestos.
│ agents/system-journal.md
│ @@ -95,3 +95,62 @@
│    visos dabar matomos architekto eilėje su amžiumi. #5834 lieka `blocked`:
│    reikia žmogaus sprendimo, ar toliau vertinti kaip neįgyvendintą.
│
│ +## 2026-11-13 20:20 · sistemos-architektas #274
│ +
│ +- **Mačiau:** 241 paleidimas per 7 d.; nenaudingų — `tikrintojas` 25 % (8 paleid.,
│ +  1 tuščias), `metodininkas` 17 %, `ideator` 14 %, `kalbu-redaktorius` 11 %,
│ +  `publikavimo-agentas` 7 %. Pasiūlymai 107 (`new` 14, `done` 83, `blocked` 1,
│ +  `obsolete` 9), seniausias neapdorotas 5 d. Mano paties eilėje — 11 sisteminių,
│ +  9 laukė >3 d. (vienintelis `check_agents.py` įspėjimas). Trys iš jų buvo
│ +  viena klasė su aiškiu įrodymu: `check_audio.py` „✔ Garsas pilnas: 567 tekstų“,
│ +  nors simuliacijų kode buvę `api.speak("Visi taikiniai pasiekti!")` ir
│ +  `api.speak(S.pradek || "Bakstelėk figūrą.")` neturėjo įrašo; ARCHITEKTURA
│ +  tvarkaraščio lentelėje 5 iš 15 eilučių rodė laiką, kurio sistema neturi;
│ +  `add_optional_tasks.py` seną ID praleido tyliai, o „Pridėta 0“ skambėjo
│ +  kaip sėkmė.
│ +- **Keičiau:**
│ +  - `scripts/generate_audio.py` — `spoken_literals()`: statinės `api.speak("…")`
│ +    eilutės ir `||` atsarginiai sakiniai iš `assets/js/sims/*.js` (anksčiau
│ +    tekstai rinkti TIK iš `content/**.json` `sim.config`); `collect()` juos
│ +    įtraukia, todėl manifestas ir vartai ima atskaitą iš tos pusės, kurioje
│ +    vaikas girdi.
│ +  - `scripts/check_audio.py` — pranešama aprėptis („iš jų 8 — tiesioginės
│ +    api.speak eilutės“), kad dalinė aprėptis nebūtų rodoma kaip visuma.
│ +  - `scripts/check_docs_facts.py` — `check_schedule()`: `ROLES` skaitomas iš
│ +    `agents/run.py` per `ast` (ne importuojant bėgiklį), lentelės laikai lyginami
│ +    su `on_calendar`, trūkstamas vaidmuo — klaida.
│ +  - `docs/ARCHITEKTURA.md` — 5 tvarkaraščio eilutės pagal `ROLES` (tikrintojas
│ +    05:50, tyrejas 06:40, ideator 07:40, kurejas 09:00, publikavimo-agentas
│ +    5 kartus per dieną).
│ +  - `scripts/add_optional_tasks.py` — seni ID per `scripts/known_renames.json`,
│ +    aprėpties suvestinė, nieko neatitinkančių raktų sąrašas, `--check` (rc=1).
│ +  - `README.md` — garso skaičiai perskaičiuoti (569 tekstų, 1138 įrašų);
│ +    `research/wiki/guidelines/pamokos.md` — LL-90; `agents/runs.db` — #11235,
│ +    #4808, #14727, #15044 → `done` su įrodymais.
│ +- **Kodėl:** trys darbai turi vieną priežastį — **vartai ėmė atskaitą iš to
│ +  paties šaltinio, kurį saugo**. Garso vartai lygino manifestą su sąrašu,
│ +  sugeneruotu iš to paties `collect()`, todėl santykis buvo teisingas pagal
│ +  konstrukciją, kad ir ko jie nematė; dokumentų vartai lygino skaičius, kuriuos
│ +  patys perskaičiuoja, o tvarkaraštį paliko be vartų; optional įrankis dirbo
│ +  pagal raktą, kurio nebeliko. Visų trijų pasekmė matoma (viena — girdima)
│ +  vaikui, ne tik ataskaitoje.
│ +- **Patikra:** `check_audio.py` prieš → „✔ 567 tekstų, 1134 įrašų“; po taisymo
│ +  → `KLAIDA: 1 tekstų be garso įrašo: Visi taikiniai pasiekti!`, po `||`
│ +  šablonų → dar „Bakstelėk figūrą.“; sugeneravus garsą (Piper, 2 tekstai) →
│ +  „✔ 569 tekstų (iš jų 8 — tiesioginės api.speak eilutės), 1138 įrašų,
│ +  naudojama 1138 iš 1138 mp3“. `check_docs_facts.py` su `check_schedule()` →
│ +  5 klaidos su eilučių numeriais, pataisius lentelę → „0 klaidų, 0 įspėjimų“.
│ +  `add_optional_tasks.py` → „Modulių: 39 · su praplėtimu: 39 · be praplėtimo: 0“,
│ +  „Atpažinta pagal pervadinimą (1): 03-sakinio-tvarka → 03-sakinio-zodziai“;
│ +  scratch zondas: nuėmus `optional` → `--write` grąžina, `--check` su spragą
│ +  turinčiu moduliu → `rc=1`. Kiti vartai: `validate_content.py --grade 1` 0/0,
│ +  `check_language.py --grade 1` 0 klaidų (7 įspėjimai — buvę), `check_ui.py`
│ +  0/0, `check_art.py` ✔, `check_lessons.py` ✔ 90 įrašų, `check_agents.py`
│ +  15 vaidmenų, 1 įspėjimas (7 seni sisteminiai). `system_report.py` po:
│ +  `new` 14→10, `done` 83→87, sisteminė eilė 11→7.
│ +- **Neišspręsta sąmoningai:** #4455, #4516 (turinio sprendimas, ne vartai),
│ +  #5190, #5342, #5400, #7396/#4921 (`check_view.py` 200 % tekstas ir <360 px —
│ +  reikia Playwright matavimo), #15045 (alias `progress.js` — kito vaidmens
│ +  failas), #5834 (`blocked` — žmogaus sprendimas). `agents/scope.json`,
│ +  `content/`, `assets/js/sims/`, CSS ir kitos klasės neliestos.
│ +
│ profiles/deepseek41flash/cache/scratch/update_state.py
│ @@ -0,0 +1,26 @@
│ +import json
│ +from pathlib import Path
│ +
│ +p = Path("/home/zoltanas/workspace/suprask/agents/state.json")
│ +data = json.loads(p.read_text(encoding="utf-8"))
│ +role = data["roles"]["sistemos-architektas"]
│ +role.update({
│ +    "last_run": "2026-11-13T20:35:00",
│ +    "status": "published",
│ +    "log": "agents/log/sistemos-architektas-2026-11-13T2020.md",
│ +})
│ +data["last_system_work_274"] = {
│ +    "date": "2026-11-13",
│ +    "run_id": 274,
│ +    "before": "241 paleidimas/7 d.; pasiūlymai 107 (new 14, done 83, blocked 1, obsolete 9); sisteminiai 11 (9 laukė >3 d.); check_agents 1 įspėjimas",
│ +    "after": "pasiūlymai 107 (new 10, done 87, blocked 1, obsolete 9); sisteminiai 7; check_agents 1 įspėjimas (tie patys 7)",
│ +    "changed": "scripts/generate_audio.py (spoken_literals: statinės api.speak + || atsarginiai sakiniai iš sims/*.js); scripts/check_audio.py (aprėpties skaičius); scripts/check_docs_facts.py (check_schedule iš ROLES per ast); docs/ARCHITEKTURA.md (5 tvarkaraščio eilučių); scripts/add_optional_tasks.py (known_renames, aprėptis, --check); README.md (569 tekstų / 1138 įrašų); research/wiki/guidelines/pamokos.md (LL-90); agents/runs.db (#11235, #4808, #14727, #15044 → done)",
│ +    "why": "Vartai ėmė atskaitą iš to paties šaltinio, kurį saugo: garso tekstai rinkti tik iš sim.config, o vaikas girdi ir simuliacijų kodą; tvarkaraščio lentelė neturėjo jokio palyginimo su ROLES; optional įrankis dirbo pagal išnykusį ID ir praleidimą rodė kaip 0 pridėtų.",
│ +    "evidence": "check_audio: 567 → KLAIDA (2 tekstai) → 569 tekstų/1138 įrašų; check_docs_facts: 5 klaidos → 0/0; add_optional_tasks: 39/39, --check rc=1 su spragą turinčiu moduliu (scratch zondas)",
│ +    "gates": "validate_content --grade 1 0/0; check_language --grade 1 0 klaidų / 7 įspėjimai (buvę); check_ui 0/0; check_art ✔; check_lessons 90; check_docs_facts 0/0; check_agents 15 vaidmenų, 1 įspėjimas",
│ +    "new_lesson": "LL-90 — Vartai, kurie skaito tą patį šaltinį, kurį patys prižiūri",
│ +    "open": "#4455, #4516, #5190, #5342, #5400, #7396/#4921, #15045 (kito vaidmens failas), #5834 (blocked)",
│ +    "log": "agents/log/sistemos-architektas-2026-11-13T2020.md",
│ +}
│ +p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
│ +print("state.json atnaujintas:", role["last_run"], "| raktų:", len(data))
Paleidimas #274 baigtas. Ką radau ir ką pakeičiau:

Trys sisteminės problemos, viena priežastis — vartai ėmė atskaitą iš to paties šaltinio, kurį patys saugo:

1. Garso vartai buvo akli simuliacijų kodui (#11235, #4808). `generate_audio.collect()` rinkdavo tekstus TIK iš `content/**.json` `sim.config`, todėl `api.speak("Visi taikiniai pasiekti!")` (matematika.js:81) ir `api.speak(S.pradek || "Bakstelėk figūrą.")` (matematika.js:2487) neturėjo nė vieno įrašo — vaikas paspaudęs mygtuką girdėdavo tylą, o vartai skelbė „✔ Garsas pilnas: 567 tekstų“. Pridėtas `spoken_literals()` (statinės eilutės + `||` atsarginiai sakiniai), `check_audio.py` dabar rodo aprėptį. Sugeneruoti 2 trūkstami tekstai Piper balsu: 569 tekstų, 1138 įrašų, 1138/1138.

2. ARCHITEKTURA tvarkaraščio lentelė neturėjo jokių vartų (#14727). 5 iš 15 eilučių rodė laiką, kurio sistema neturi (tikrintojas 06:40 vs 05:50, kurejas 09:30 vs 09:00, ideator 07:10 vs 07:40, tyrejas 07:00 vs 06:40, publikavimo-agentas „kas 4 h“ vs 5 k./d.). Pridėtas `check_schedule()` — `ROLES` skaitomas iš `run.py` per `ast` (ne importuojant bėgiklį), lentelė pataisyta, `check_docs_facts.py` 0 klaidų.

3. `add_optional_tasks.py` seną ID praleisdavo tyliai (#15044). Dabar sprendžia per `known_renames.json`, išveda aprėptį (39/39), išvardija nieko neatitinkančius raktus, turi `--check` (rc=1). Zondas atskiroje kopijoje: nuėmus `optional` → `--write` grąžina užduotį, spragą turintis modulis → rc=1.

Pasiūlymai: #11235, #4808, #14727, #15044 → `done` su įrodymais. `new` 14→10, `done` 83→87, sisteminė eilė 11→7. Nauja pamoka LL-90 (pamokos.md, 90 įrašų, visi su 4 laukais). Įrašyti `agents/system-journal.md`, `agents/log/sistemos-architektas-2026-11-13T2020.md`, `agents/state.json`.

Patikros: validate_content --grade 1 0/0 · check_language --grade 1 0 klaidų (7 įspėjimai — buvę) · check_ui 0/0 · check_art ✔ · check_lessons ✔ 90 · check_docs_facts 0/0 · check_agents 15 vaidmenų, 1 įspėjimas (7 seni sisteminiai, sąmoningai neliesti). ROLES neliesti, tad `gen_timers.py` nereikalingas; dashboard neliestas.

Neišspręsta sąmoningai: #4455 (ataskaitų dydis), #4516 (sakinio ilgis lieka įspėjimu — turinio sprendimas), #5190 (commit žinutė), #5342 (worktree), #5400 (sync_docs_facts), #7396/#4921 (check_view 200 % ir <360 px — reikia Playwright matavimo), #15045 (alias `progress.js` — kito vaidmens failas), #5834 (blocked, reikia žmogaus). `agents/scope.json`, `content/`, `assets/js/sims/`, CSS ir kitos klasės neliestos.

Darbinėje kopijoje neįkomituota: `scripts/generate_audio.py`, `scripts/check_audio.py`, `scripts/check_docs_facts.py`, `scripts/add_optional_tasks.py`, `docs/ARCHITEKTURA.md`, `README.md`, `research/wiki/guidelines/pamokos.md`, `agents/system-journal.md`, `agents/log/sistemos-architektas-2026-11-13T2020.md`, `assets/audio/lt/manifest.json` + 4 nauji mp3.

## klaidos

```
session_id: local-d89e3bd710b5886208cdc384b10589080a658d9981b95c6f5ff4cddf6878fe9f
```
