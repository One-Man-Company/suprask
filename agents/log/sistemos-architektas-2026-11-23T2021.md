# sistemos-architektas — 2026-11-23T2021

- paleidimas: #487 (manual)
- trukmė: 2344s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/sync_docs_facts.py
│ @@ -0,0 +1,302 @@
│ +#!/usr/bin/env python3
│ +"""Dokumentų skaičių sinchronizavimas su failais (#5400).
│ +
│ +Kodėl: `check_docs_facts.py` perskaičiuoja tikrovę iš failų ir pasako, kad
│ +dokumentai atsilieka — bet neparašo, kuo juos pakeisti. Todėl kiekvienas modulio
│ +commit'as palikdavo 5–7 pasenusius skaičius (README 4, ARCHITEKTURA 1, wiki 2),
│ +ir juos turėjo perrašyti žmogus arba agentas iš atminties (LL-21). Šis įrankis
│ +tikrovę ima iš tų pačių `facts()`, kuriuos naudoja vartai, ir perrašo TIK
│ +skaičius bei modulių sąrašus. Jokio teksto jis neperrašinėja: sakinio forma,
│ +stilius ir eiliškumas lieka žmogaus.
│ +
│ +Ką keičia:
│ +  - `README.md` — pajėgumo sakinys, krypties lentelės modulių sąrašas, garso
│ +    eilutė, „Parengta“ būsenos eilutė, agentų skaičius žodžiu;
│ +  - `docs/ARCHITEKTURA.md` — `**Live:**` eilutė;
│ +  - `content/lt/grades.json` — 1 klasės `modules`;
│ +  - `research/wiki/grades/01/index.md` — `**Live.**` eilutė ir krypties
│ +    lentelės eilutės (modulių sąrašas ir „N — gyva“);
│ +  - `research/wiki/grades/README.md` — „Live — N modulių“.
│ +
│ +Tvirtinimas yra atskiras žingsnis: po perrašymo įrankis paleidžia
│ +`check_docs_facts.py` patikrą tame pačiame procese. Jei lieka neatitikimų, kurių
│ +jis nemoka taisyti (pvz. trūksta vaidmens README lentelėje), išėjimo kodas 1 ir
│ +kiekvienas likęs neatitikimas išvardijamas — tylaus „pataisyta“ nebūna (LL-37).
│ +
│ +Naudojimas:
│ +    python3 scripts/sync_docs_facts.py              # sausa eiga: ką keistų
│ +    python3 scripts/sync_docs_facts.py --apply      # perrašyti dokumentus
│ +    python3 scripts/sync_docs_facts.py --apply --json
│ +
│ +Išėjimo kodas: 0 — dokumentai sutampa su failais; 1 — liko netaisomų
│ +neatitikimų.
│ +"""
│ +
│ +from __future__ import annotations
│ +
│ +import argparse
│ +import json
│ +import re
│ +import sys
│ +from pathlib import Path
│ +
│ +sys.path.insert(0, str(Path(__file__).resolve().parent))
│ +
│ +import check_docs_facts as factsmod  # noqa: E402
│ +
│ +ROOT = factsmod.ROOT
│ +GRADE = factsmod.GRADE
│ +
│ +# Skaičiai žodžiu — README sakinys „nuolat vysto penkiolika agentų“.
│ +# `check_docs_facts.NUMERALS` yra atvirkštinė kryptis (žodis → skaičius) ir
│ +# baigiasi ties 15, nes tiek vaidmenų buvo tada. Augant sistemai žodis turi būti
│ +# parašomas, ne paliekamas pasenęs, todėl lentelė platesnė.
│ +WORDS = {
│ +    1: "vienas", 2: "du", 3: "trys", 4: "keturi", 5: "penki", 6: "šeši",
│ +    7: "septyni", 8: "aštuoni", 9: "devyni", 10: "dešimt", 11: "vienuolika",
│ +    12: "dvylika", 13: "trylika", 14: "keturiolika", 15: "penkiolika",
│ +    16: "šešiolika", 17: "septyniolika", 18: "aštuoniolika",
│ +    19: "devyniolika", 20: "dvidešimt",
│ +}
│ +
│ +STRAND_ROW_RE = re.compile(r"^\|\s*(?P<title>[^|]+?)\s*\|\s*(?P<items>.+?)\s*\|\s*(?P<count>\d+)\s*—\s*gyva\s*\|")
│ +
│ +
│ +def key(title: str) -> str:
│ +    """Pirmas reikšmingas žodis — taip pat, kaip lygina `check_docs_facts`."""
│ +    return re.split(r"[:\s,]", title)[0].rstrip(":").lower()
│ +
│ +
│ +def merge_items(listed: list[str], titles: list[str]) -> list[str]:
│ +    """Modulių sąrašas: esami užrašai lieka, trūkstami pridedami, svetimi išeina.
│ +
│ +    Sąmoningai NEperrašoma esamų įrašų formuluotė: README ir wiki vartoja
│ +    trumpesnius pavadinimus („Figūros“ vietoje „Figūros aplink mus“), ir tai yra
│ +    žmogaus parašytas tekstas, o ne pasenęs skaičius. Keičiasi tik tai, ko
│ +    dokumente nebeliko arba dar nėra.
│ +    """
│ +    wanted = {key(t): t for t in titles}
│ … omitted 224 diff line(s) across 1 additional file(s)/section(s)
│ scripts/sync_docs_facts.py
│ @@ -67,22 +67,33 @@
│      return re.split(r"[:\s,]", title)[0].rstrip(":").lower()
│
│
│ -def merge_items(listed: list[str], titles: list[str]) -> list[str]:
│ -    """Modulių sąrašas: esami užrašai lieka, trūkstami pridedami, svetimi išeina.
│ -
│ -    Sąmoningai NEperrašoma esamų įrašų formuluotė: README ir wiki vartoja
│ -    trumpesnius pavadinimus („Figūros“ vietoje „Figūros aplink mus“), ir tai yra
│ -    žmogaus parašytas tekstas, o ne pasenęs skaičius. Keičiasi tik tai, ko
│ -    dokumente nebeliko arba dar nėra.
│ +def align_items(listed: list[str], titles: list[str]) -> tuple[list[str], list[str], list[str]]:
│ +    """Sąrašas, kuriame kiekvienas modulis turi LYGIAI vieną įrašą.
│ +
│ +    Susiejimas eina pagal pirmą reikšmingą žodį (`key`), o ne pagal visą
│ +    pavadinimą — dokumentai sąmoningai vartoja trumpesnius užrašus
│ +    („Figūros“ vietoje „Figūros aplink mus“), ir tai yra žmogaus parašytas
│ +    tekstas, kurio perrašinėti nereikia. Įrašas, kurio rakto tarp modulių
│ +    nebėra, yra pasenęs (modulis pervadintas) ir keičiamas modulio
│ +    pavadinimu; modulio, kurio dokumente dar nėra, įrašas pridedamas toje
│ +    vietoje, kurią jam duoda `index.json` tvarka.
│ +
│ +    Grąžina (sąrašas, pridėti, pašalinti).
│      """
│ -    wanted = {key(t): t for t in titles}
│ -    kept = [item for item in listed if key(item) in wanted]
│ -    have = {key(item) for item in kept}
│ +    pool: dict[str, list[str]] = {}
│ +    for item in listed:
│ +        pool.setdefault(key(item), []).append(item)
│ +    kept: list[str] = []
│ +    added: list[str] = []
│      for title in titles:
│ -        if key(title) not in have:
│ +        bucket = pool.get(key(title))
│ +        if bucket:
│ +            kept.append(bucket.pop(0))
│ +        else:
│              kept.append(title)
│ -            have.add(key(title))
│ -    return kept
│ +            added.append(title)
│ +    dropped = [item for bucket in pool.values() for item in bucket]
│ +    return kept, added, dropped
│
│
│  def sync_readme(text: str, f: dict) -> tuple[str, list[str]]:
│ scripts/sync_docs_facts.py
│ @@ -118,12 +118,16 @@
│              if len(cells) < 2:
│                  continue
│              listed = [c.strip() for c in cells[-1].split("·") if c.strip()]
│ -            merged = merge_items(listed, strand["modules"])
│ + 

… PRALEISTA 24432 SIMBOLIŲ IŠ 42432 (įrankių išklotinės) — visa ataskaita: agents/work/sistemos-architektas/00487/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

) if quiet else None
│ +    stream = contextlib.redirect_stdout(sink) if sink else contextlib.nullcontext()
│ +    with stream:
│ +        factsmod.check_readme(check, (ROOT / "README.md").read_text(encoding="utf-8"), f)
│ +        factsmod.check_architektura(check, (ROOT / "docs" / "ARCHITEKTURA.md").read_text(encoding="utf-8"), f)
│ +        factsmod.check_grades_json(check, f)
│ +        factsmod.check_wiki(check, f)
│
│      return {"changed": report, "errors": check.errors, "warnings": check.warnings,
│              "facts": {k: f[k] for k in ("strand_count", "module_count", "sim_count",
│ scripts/check_docs_facts.py
│ @@ -313,12 +313,14 @@
│      """Wiki klasių puslapiai taip pat kartoja skaičių — 2026-11-07 jie tebėjo „13 modulių“."""
│      grade_page = "research/wiki/grades/01/index.md"
│      text = (ROOT / grade_page).read_text(encoding="utf-8")
│ -    live = re.search(r"\*\*Live\.\*\* (\d+) modul\w*, (\d+) krypt", text)
│ +    live = re.search(r"\*\*Live\.\*\* (\d+) modul\w*, (\d+) krypt\w*", text)
│      if not live:
│          check.fail(f"{grade_page}: nerastas „Live.“ statuso sakinys")
│      else:
│          check.expect(f"{grade_page}:{line_of(text, '**Live.**')}", "modulių", int(live.group(1)), f["module_count"])
│          check.expect(f"{grade_page}:{line_of(text, '**Live.**')}", "krypčių", int(live.group(2)), f["strand_count"])
│ +
│ +    check_wiki_table(check, grade_page, text, f)
│
│      list_page = "research/wiki/grades/README.md"
│      text = (ROOT / list_page).read_text(encoding="utf-8")
│ scripts/check_docs_facts.py
│ @@ -335,6 +335,42 @@
│          check.expect(f"{list_page}:{line_of(text, '[[01/index')}", "modulių", int(found.group(1)), f["module_count"])
│
│
│ +def check_wiki_table(check: Check, where: str, text: str, f: dict) -> None:
│ +    """Wiki krypties lentelė: modulių sąrašas ir „N — gyva“ turi atitikti indeksą.
│ +
│ +    2026-11-23 matuota: lentelė skelbė 39 modulius iš 72 (Matematika 15/23,
│ +    Pasaulio pažinimas 6/22), o `check_wiki()` tikrino TIK `**Live.**` eilutę.
│ +    Tai ta pati aklumo klasė kaip LL-52 (laukas, kurio vartai neskaito): skaičius
│ +    yra, jis kartoja indeksą, bet jo niekas nelygina. Pasekmė ne kosmetinė —
│ +    wiki yra vieta, kur žmogus ir agentas ieško, „kas jau padaryta“, todėl
│ +    trūkstamas modulis atrodo kaip nepadarytas darbas ir eilė kuria jį antrą
│ +    kartą (LL-19, #19519 atvejis).
│ +    """
│ +    row_re = re.compile(r"^\|\s*(?P<title>[^|]+?)\s*\|\s*(?P<items>.+?)\s*\|\s*(?P<count>\d+)\s*—\s*gyva\s*\|")
│ +    rows = {}
│ +    for line in text.splitlines():
│ +        m = row_re.match(line)
│ +        if m:
│ +            rows[m.group("title").strip()] = (m.group("items"), int(m.group("count")), line)
│ +
│ +    for strand in f["strands"]:
│ +        title = strand["title"]
│ +        if title not in rows:
│ +            check.fail(f"{where}: krypties lentelėje nėra „{title}“")
│ +            continue
│ +        items, count, line = rows[title]
│ +        listed = [x.strip() for x in items.split("·") if x.strip()]
│ +        at = line_of(text, line.strip())
│ +        check.expect(f"{where}:{at}", f"„{title}“ modulių lentelėje", count, len(strand["modules"]))
│ +        for module in strand["modules"]:
│ +            needle = re.split(r"[:\s,]", module)[0].rstrip(":").lower()
│ +            if not any(needle in item.lower() for item in listed):
│ +                check.fail(
│ +                    f"{where}:{at}: „{title}“ eilutėje trūksta modulio „{module}“ "
│ +                    f"(laukiama bent žodžio „{needle}“)"
│ +                )
│ +
│ +
│  def main() -> int:
│      parser = argparse.ArgumentParser(description="Tikrina, ar README ir ARCHITEKTURA atitinka failus")
│      parser.add_argument("--json", action="store_true", help="išvesti rezultatą JSON formatu")
│ agents/run.py
│ @@ -170,6 +170,17 @@
│  # kaip pakeistas failas, 5 s gedimas atrodė kaip „paskelbta 1 failų“, o eilės
│  # apsauga („0 failų = ne bandymas“) niekada negalėjo suveikti.
│  LOG_PREFIX = "agents/log/"
│ +
│ +# Dokumentai, kuriuose kiekvienas modulis keičia skaičių (#5400). Juos perrašo
│ +# `scripts/sync_docs_facts.py`; bėgiklis prideda juos prie publikuojamų failų,
│ +# kad commit'as būtų vientisas (modulis + teisingi skaičiai).
│ +DOC_TARGETS = (
│ +    "README.md",
│ +    "docs/ARCHITEKTURA.md",
│ +    "content/lt/grades.json",
│ +    "research/wiki/grades/01/index.md",
│ +    "research/wiki/grades/README.md",
│ +)
│
│  # Ataskaitos dydžio riba (#4455). Iki šios datos ataskaita buvo VISAS modelio
│  # stdout su įrankių išklotinėmis: 2026-11-08 — 139 failai / 2,9 MB, 2026-11-17 —
│ agents/run.py
│ @@ -1014,6 +1014,39 @@
│      return str(candidate) if candidate.exists() else sys.executable
│
│
│ +def sync_docs(files: list[str]) -> tuple[list[str], str]:
│ +    """Sugeneruoja dokumentų skaičius prieš juos tikrinant (#5400).
│ +
│ +    Kodėl ne atskiras vaidmuo: `check_docs_facts.py` yra CI vartuose
│ +    (`.github/workflows/validate.yml`), bet ne bėgiklyje, todėl kiekvienas
│ +    modulio commit'as galėjo išstumti pasenusius skaičius ir palikti raudoną CI.
│ +    Įtraukti vartus be sinchronizavimo reikštų ką kita: kūrėjas, kuris neturi
│ +    teisės rašyti `README.md`, būtų atmetamas dėl failo, kurio nelietė (LL-19
│ +    šeima — pataisa grupės viduje, kuri negali pakeisti grupės būsenos).
│ +    """
│ +    if not files or not any(f.startswith(("content/", "assets/js/sims/")) for f in files):
│ +        return files, ""
│ +    before = set(parse_porcelain(git_snapshot()))
│ +    try:
│ +        proc = subprocess.run([sys.executable, "scripts/sync_docs_facts.py", "--apply"],
│ +                              cwd=ROOT, capture_output=True, text=True, timeout=120)
│ +    except Exception as exc:  # noqa: BLE001
│ +        return files, f"dokumentų sinchronizavimas nepavyko: {exc}"
│ +    # Tik tai, ką pakeitė SINCHRONIZAVIMAS. Jei `README.md` jau buvo nešvarus
│ +    # prieš jį (žmogaus nebaigtas darbas), jis nepatenka į sąrašą — kitaip
│ +    # agento commit'as pasisavintų svetimą pakeitimą (LL-45 šeima, ta pati
│ +    # priežastis, dėl kurios `_publish` nenaudoja `git add -A`).
│ +    touched = [f for f in parse_porcelain(git_snapshot())
│ +               if f in DOC_TARGETS and f not in files and f not in before]
│ +    note = ""
│ +    if proc.returncode != 0:
│ +        tail = (proc.stdout or proc.stderr).strip().splitlines()[-1:] or [""]
│ +        note = f"dokumentų sinchronizavimas baigėsi klaida ({tail[0][:120]})"
│ +    if touched:
│ +        note = (note + "; " if note else "") + f"dokumentai atnaujinti: {', '.join(touched)}"
│ +    return files + touched, note
│ +
│ +
│  def run_checks(files: list[str], allow_audio_repair: bool = True) -> tuple[bool, str]:
│      """Paleidžia validatorius, susijusius su pakeistais failais.
│
│ agents/run.py
│ @@ -1073,6 +1073,14 @@
│          # Sistemos vientisumas: po architekto pakeitimų neturi likti vaidmens be
│          # timer'io, modelio ar baigties sąlygos.
│          checks.append(("agentai", [sys.executable, "scripts/check_agents.py"]))
│ +    if any(f.startswith(("content/", "assets/js/sims/")) for f in files) or not files:
│ +        # #5400: dokumentų skaičiai (README, ARCHITEKTURA, wiki, grades.json)
│ +        # atsilieka po KIEKVIENO modulio, o CI šis žingsnis yra
│ +        # (`.github/workflows/validate.yml`) — bėgiklyje jo nebuvo, todėl
│ +        # publikavimas galėjo išstumti commit'ą su pasenusiais skaičiais ir
│ +        # raudoną CI. Dokumentus prieš tai atnaujina `sync_docs()`; šis vartas
│ +        # tikrina tai, kas tikrai bus išstumta.
│ +        checks.append(("dokumentai", [sys.executable, "scripts/check_docs_facts.py"]))
│      if any(f.startswith("assets/") for f in files) or not files:
│          checks.append(("sąsaja", [sys.executable, "scripts/check_ui.py"]))
│          # LL-13: iliustracijos scenos privalo naudoti art.js — be šito agentas
│ agents/run.py
│ @@ -2014,6 +2014,13 @@
│          watch.stop()
│          foreign = watch.roles()
│          files, foreign_files, notes = publication_plan(files, args.role, foreign)
│ +        # #5400: dokumentų skaičiai atnaujinami PRIEŠ publikavimą, kad vartai
│ +        # tikrintų tai, kas bus išstumta. Svetimo vaidmens atveju neliečiama —
│ +        # tada shared failas gali būti jo nebaigtas darbas (LL-49).
│ +        if not foreign:
│ +            files, doc_note = sync_docs(files)
│ +            if doc_note:
│ +                notes = notes + [doc_note]
│          work = work_files(files)
│          if foreign_files or foreign:
│              print(f"{args.role}: " + "; ".join(notes))
│ agents/run.py
│ @@ -1858,6 +1858,13 @@
│
│      if args.publish_only:
│          files = changed_list()
│ +        # #5400: tas pats sinchronizavimas kaip įprastame kelyje. Be jo
│ +        # `--publish-only` (publikavimo agento atkūrimo kelias) atsimuštų į
│ +        # dokumentų vartus dėl skaičių, kurių niekas neatnaujino — ir paruoštas
│ +        # modulis liktų nepaskelbtas (LL-09).
│ +        files, doc_note = sync_docs(files)
│ +        if doc_note:
│ +            print(f"{args.role}: {doc_note}")
│          result = publish(args.role, run_id, files, f"atkurtas {args.role} darbas", allow_revert=False)
│          db.upsert_proposals(sorted(PROPOSALS.glob("*.json")))
│          db.finish_run(run_id, result["status"], 0, 0, "", result["detail"], files,
ĮGYVENDINTA: #5400

## Ką mačiau (prieš)

`scripts/system_report.py`: 164 paleidimai / 7 d., nenaudingų — `kritikas` 50 %, `dizaineris` 50 %, `kalbu-redaktorius` 40 %, `ideator` 28 %, `simuliaciju-inzinierius` 33 %. Pasiūlymai: 192 (new 21, blocked 4, done 158). 16 sisteminių `new`, seniausi 15 d.

Išmatuoti trys defektai, ne vien aprašyti:

1. `run_checks()` (`agents/run.py:1006`) paleidžia 7 validatorius, bet ne `check_docs_facts.py` — nors CI jį turi (`.github/workflows/validate.yml:45`). Publikavimas galėjo išstumti pasenusius skaičius ir raudoną CI.
2. `check_wiki()` tikrino TIK `**Live.**` eilutę. Wiki krypties lentelė skelbė **39 modulius iš 72** (Matematika 15/23, Pasaulio žinimas 6/22, Muzika 1/3). Jokių vartų.
3. Šaknies `AGENTS.md` deklaruoja 7 vaikų DOX failus — `find . -name AGENTS.md` grąžina vieną.

## Ką keičiau

- `scripts/sync_docs_facts.py` (naujas) — perima `facts()` iš vartų ir perrašo tik skaičius bei modulių sąrašus 5 dokumentuose. `--apply`, sausa eiga, `--json`; po perrašymo paleidžia tikrus vartus ir išvardija, ko netaiso. Esama eiliškumas ir žmogaus sutrumpinti užrašai nekeičiami.
- `scripts/check_docs_facts.py` — naujas `check_wiki_table()`; šablonas `krypt` → `krypt\w*`.
- `agents/run.py` — `DOC_TARGETS`, `sync_docs()`, vartas `run_checks()` sąraše. Dokumentai atnaujinami PRIEŠ vartus ir pridedami prie publikuojamų failų, kad commit'as būtų vientisas (ir `--publish-only` kelyje). Svetimo vaidmens atveju neliečiama.
- `pamokos.md` — LL-161; `system-journal.md` — įrašas; 1 pasiūlymas (7 AGENTS.md).

## Patikra

- `check_docs_facts.py` → 0 klaidų. Prieš naujus lentelės vartus toje pačioje byloje buvo **32 klaidos** (`git show HEAD:` kopija).
- Sinchronizavimas antrą kartą → „keisti nereikia“ (idempotentiškas).
- Zondas su 73-uoju moduliu: `run_checks()` prieš → `dokumentai: KLAIDA — 10 klaidų`; po → `dokumentai: OK — 0 klaidų`.
- Nešvarus `README.md` prieš paleidimą → į publikuojamų sąrašą nepatenka.
- Visi 9 vartai rc0. `queue_repair.py`: grąžintinų 0 (blokuoti 4 — dėl turinio, ne infrastruktūros).

## Neužbaigta sąmoningai

- 7 vaikų `AGENTS.md` nesukurti — atskiras darbas, įrašytas pasiūlymu.
- Likę 15 sisteminių pasiūlymų (`#4455`, `#4516`, `#5342`, `#22168` …) neliesti.
- `hermes-dashboard.service` (pid 561537) laukia restarto — tai Hermes profilio, ne repo, būsena; neliečiau.

Viena klaida mano paties darbe: `git checkout -- .` numetė šio paleidimo pakeitimus, juos įrašiau iš naujo ir patikras paleidau iš naujo. LL-161 gimė iš pirmo `--apply` įrašyto „9 kryptysys“ — vartai to nematė, nes lygino skaitmenį, ne žodį.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-54c3ba3a4fa58ab9bf03fc03e8eaa70e82ccb53f3a68eb6a7d7f9dbfbf8a9de3
```
