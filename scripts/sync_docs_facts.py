#!/usr/bin/env python3
"""Dokumentų skaičių sinchronizavimas su failais (#5400).

Kodėl: `check_docs_facts.py` perskaičiuoja tikrovę iš failų ir pasako, kad
dokumentai atsilieka — bet neparašo, kuo juos pakeisti. Todėl kiekvienas modulio
commit'as palikdavo 5–7 pasenusius skaičius (README 4, ARCHITEKTURA 1, wiki 2),
ir juos turėjo perrašyti žmogus arba agentas iš atminties (LL-21). Šis įrankis
tikrovę ima iš tų pačių `facts()`, kuriuos naudoja vartai, ir perrašo TIK
skaičius bei modulių sąrašus. Jokio teksto jis neperrašinėja: sakinio forma,
stilius ir eiliškumas lieka žmogaus.

Ką keičia:
  - `README.md` — pajėgumo sakinys, krypties lentelės modulių sąrašas, garso
    eilutė, „Parengta“ būsenos eilutė, agentų skaičius žodžiu;
  - `docs/ARCHITEKTURA.md` — `**Live:**` eilutė;
  - `content/lt/grades.json` — 1 klasės `modules`;
  - `research/wiki/grades/01/index.md` — `**Live.**` eilutė ir krypties
    lentelės eilutės (modulių sąrašas ir „N — gyva“);
  - `research/wiki/grades/README.md` — „Live — N modulių“.

Tvirtinimas yra atskiras žingsnis: po perrašymo įrankis paleidžia
`check_docs_facts.py` patikrą tame pačiame procese. Jei lieka neatitikimų, kurių
jis nemoka taisyti (pvz. trūksta vaidmens README lentelėje), išėjimo kodas 1 ir
kiekvienas likęs neatitikimas išvardijamas — tylaus „pataisyta“ nebūna (LL-37).

Naudojimas:
    python3 scripts/sync_docs_facts.py              # sausa eiga: ką keistų
    python3 scripts/sync_docs_facts.py --apply      # perrašyti dokumentus
    python3 scripts/sync_docs_facts.py --apply --json

Išėjimo kodas: 0 — dokumentai sutampa su failais; 1 — liko netaisomų
neatitikimų.
"""

from __future__ import annotations

import argparse
import contextlib
import io
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import check_docs_facts as factsmod  # noqa: E402

ROOT = factsmod.ROOT
GRADE = factsmod.GRADE

# Skaičiai žodžiu — README sakinys „nuolat vysto penkiolika agentų“.
# `check_docs_facts.NUMERALS` yra atvirkštinė kryptis (žodis → skaičius) ir
# baigiasi ties 15, nes tiek vaidmenų buvo tada. Augant sistemai žodis turi būti
# parašomas, ne paliekamas pasenęs, todėl lentelė platesnė.
WORDS = {
    1: "vienas", 2: "du", 3: "trys", 4: "keturi", 5: "penki", 6: "šeši",
    7: "septyni", 8: "aštuoni", 9: "devyni", 10: "dešimt", 11: "vienuolika",
    12: "dvylika", 13: "trylika", 14: "keturiolika", 15: "penkiolika",
    16: "šešiolika", 17: "septyniolika", 18: "aštuoniolika",
    19: "devyniolika", 20: "dvidešimt",
}

STRAND_ROW_RE = re.compile(r"^\|\s*(?P<title>[^|]+?)\s*\|\s*(?P<items>.+?)\s*\|\s*(?P<count>\d+)\s*—\s*gyva\s*\|")


def key(title: str) -> str:
    """Pirmas reikšmingas žodis — taip pat, kaip lygina `check_docs_facts`."""
    return re.split(r"[:\s,]", title)[0].rstrip(":").lower()


def align_items(listed: list[str], titles: list[str]) -> tuple[list[str], list[str], list[str]]:
    """Sąrašas, kuriame kiekvienas modulis turi LYGIAI vieną įrašą.

    Trys taisyklės:

    1. **Esama tvarka ir formuluotė nekeičiama.** Dokumente esantys įrašai
       lieka savo vietoje su savo žodžiais („Figūros“ vietoje „Figūros aplink
       mus“, „Bendradarbiavimo tiltas“ vietoj „Tiltas: kai dirbame kartu“) — tai
       žmogaus parašytas tekstas, o ne pasenęs skaičius. Susiejimo sąlyga
       sąmoningai ta pati, kurią tikrina `check_docs_facts.py`
       (`key(title) in item.lower()`): jei vartas įrašą laikytų teisingu, o
       sinchronizavimas jį pervadintų, dokumentas būtų taisomas be priežasties.
    2. **Modulio, kurio sąraše nėra, įrašas pridedamas gale** — su tikru
       pavadinimu iš `index.json`.
    3. **Įrašas, kurio rakto tarp modulių nebėra, išimamas** (modulis
       pervadintas ar pašalintas) ir pasakomas ataskaitoje.

    2026-11-28 (LL-227) taisyklė 1 turėjo išimtį, kuri nebuvo užrašyta:
    jei įrašas turi žodį, kurio tikrame pavadinime nebėra („Bendradarbiavimo
    tiltas“ → „Tiltas: kai dirbame kartu“), tai NE žmogaus formuluotė, o senas
    vardas. Toks įrašas perrašomas tikruoju pavadinimu — kitaip
    sinchronizatorius praneša „Dokumentai jau sutampa“, o wiki lieka
    antruoju, nelyginamu pavadinimo šaltiniu.

    Grąžina (sąrašas, pridėti, išimti).
    """
    wanted = [(title, key(title)) for title in titles]
    used: set[int] = set()
    kept: list[str] = []
    for item in listed:
        low = item.strip().lower()
        hit = next((i for i, (title, _) in enumerate(wanted)
                    if i not in used and title.strip().lower() == low), None)
        if hit is None:
            hit = next((i for i, (_, needle) in enumerate(wanted)
                        if i not in used and needle in low), None)
        if hit is None:
            continue  # pasenęs įrašas — patenka į `dropped`
        used.add(hit)
        title = wanted[hit][0]
        # Seno vardo pėdsakas: įrašas turi žodį, kurio pavadinime nebėra.
        if factsmod.title_words(item) - factsmod.title_words(title):
            kept.append(title)
        else:
            kept.append(item)
    added = [title for i, (title, _) in enumerate(wanted) if i not in used]
    dropped = [item for item in listed if item not in kept]
    return kept + added, added, dropped


def sync_readme(text: str, f: dict) -> tuple[str, list[str]]:
    changes: list[str] = []

    header = re.search(
        r"1 klasė — (\d+) krypt\w*, (\d+) modul\w*, (\d+) interaktyv\w* simuliacij\w*", text
    )
    if header:
        new = (f"1 klasė — {f['strand_count']} kryptys, {f['module_count']} modulių, "
               f"{f['sim_count']} interaktyvių simuliacijų")
        if new != header.group(0):
            text = text.replace(header.group(0), new, 1)
            changes.append(f"pajėgumo sakinys → {new}")

    lines = text.splitlines()
    for strand in f["strands"]:
        for i, line in enumerate(lines):
            if not line.startswith("|") or strand["title"] not in line:
                continue
            cells = line.strip().strip("|").split("|")
            if len(cells) < 2:
                continue
            listed = [c.strip() for c in cells[-1].split("·") if c.strip()]
            merged, added, dropped = align_items(listed, strand["modules"])
            if merged == listed:
                continue
            cells[-1] = " " + " · ".join(merged) + " "
            lines[i] = "|" + "|".join(cells) + "|"
            changes.append(
                f"„{strand['title']}“ modulių sąrašas: {len(listed)} → {len(merged)}"
                + (f"; pridėta: {', '.join(added)}" if added else "")
                + (f"; pašalinta: {', '.join(dropped)}" if dropped else "")
            )
            break
    text = "\n".join(lines) + ("\n" if text.endswith("\n") else "")

    text, note = _replace_line(
        text, lambda ln: "įraš" in ln and "MB" in ln,
        lambda ln: _sync_audio_line(ln, f),
    )
    if note:
        changes.append(note)

    def status(ln: str) -> str:
        nums = [int(n) for n in re.findall(r"\d+", ln)]
        want = [f["strand_count"], f["module_count"], f["sim_count"], f["task_count"]]
        if nums[-4:] == want:
            return ln
        head = ln[: ln.index("|", ln.index("|") + 1) + 1]
        return f"{head} 1 klasė — {want[0]} kryptys, {want[1]} modulių, {want[2]} simuliacijų, {want[3]} užduočių |"

    text, note = _replace_line(text, lambda ln: ln.startswith("| Parengta"), status)
    if note:
        changes.append(f"būsenos eilutė: {note}")

    agents = re.search(r"nuolat vysto ([a-ząčęėįšųūž]+) agentų", text)
    if agents:
        want = WORDS.get(len(f["roles"]))
        if want and agents.group(1) != want:
            text = text.replace(agents.group(0), f"nuolat vysto {want} agentų", 1)
            changes.append(f"agentų skaičius: {agents.group(1)} → {want}")
    return text, changes


def _sync_audio_line(line: str, f: dict) -> str:
    line = re.sub(r"\d+ tekst\w*", f"{f['audio_texts']} tekstų", line, count=1)
    line = re.sub(r"\d+ įraš\w*", f"{f['audio_files']} įrašai", line, count=1)
    line = re.sub(r"~\d+ MB", f"~{f['audio_mb']} MB", line, count=1)
    return line


def _replace_line(text: str, match, transform) -> tuple[str, str]:
    lines = text.splitlines()
    for i, line in enumerate(lines):
        if not match(line):
            continue
        new = transform(line)
        if new != line:
            lines[i] = new
            return "\n".join(lines) + ("\n" if text.endswith("\n") else ""), "atnaujinta"
        return text, ""
    return text, ""


def sync_architektura(text: str, f: dict) -> tuple[str, list[str]]:
    live = re.search(
        r"\*\*Live:\*\* 1 klasė — (\d+) krypt\w*, (\d+) modul\w*, (\d+) simuliac\w*(?:, (\d+) užduo\w*)?",
        text,
    )
    if not live:
        return text, []
    new = (f"**Live:** 1 klasė — {f['strand_count']} kryptys, {f['module_count']} modulių, "
           f"{f['sim_count']} simuliacijų, {f['task_count']} užduočių")
    if new == live.group(0):
        return text, []
    return text.replace(live.group(0), new, 1), [f"**Live:** → {new}"]


def sync_grades_json(f: dict) -> tuple[str, list[str]]:
    path = ROOT / "content" / "lt" / "grades.json"
    raw = path.read_text(encoding="utf-8")
    data = json.loads(raw)
    grade = next((g for g in data["grades"] if g.get("grade") == 1), None)
    if grade is None or grade.get("modules") == f["module_count"]:
        return raw, []
    grade["modules"] = f["module_count"]
    # Formatas išlaikomas toks pat kaip faile: vieno tarpo įtrauka, lietuviški
    # simboliai neperkoduojami, be naujos eilutės pabaigoje.
    return json.dumps(data, ensure_ascii=False, indent=1), [f"1 klasės modulių → {f['module_count']}"]


def sync_wiki_index(text: str, f: dict) -> tuple[str, list[str]]:
    changes: list[str] = []
    live = re.search(r"\*\*Live\.\*\* (\d+) modul\w*, (\d+) krypt\w*", text)
    if live:
        new = f"**Live.** {f['module_count']} modulių, {f['strand_count']} kryptys"
        if new != live.group(0):
            text = text.replace(live.group(0), new, 1)
            changes.append(f"**Live.** → {new}")

    lines = text.splitlines()
    for strand in f["strands"]:
        for i, line in enumerate(lines):
            m = STRAND_ROW_RE.match(line)
            if not m or m.group("title").strip() != strand["title"]:
                continue
            listed = [x.strip() for x in m.group("items").split("·") if x.strip()]
            merged, added, dropped = align_items(listed, strand["modules"])
            count = int(m.group("count"))
            if merged == listed and count == len(strand["modules"]):
                break
            lines[i] = f"| {strand['title']} | {' · '.join(merged)} | {len(strand['modules'])} — gyva |"
            changes.append(
                f"„{strand['title']}“ eilutė: {len(listed)} modulių / „{count} — gyva“ → "
                f"{len(strand['modules'])} / „{len(strand['modules'])} — gyva“"
                + (f"; pridėta: {', '.join(added)}" if added else "")
                + (f"; pašalinta: {', '.join(dropped)}" if dropped else "")
            )
            break
    text = "\n".join(lines) + ("\n" if text.endswith("\n") else "")
    return text, changes


def sync_wiki_readme(text: str, f: dict) -> tuple[str, list[str]]:
    found = re.search(r"Live — (\d+) modul\w*", text)
    if not found:
        return text, []
    new = f"Live — {f['module_count']} modulių"
    if new == found.group(0):
        return text, []
    return text.replace(found.group(0), new, 1), [f"„Live — N modulių“ → {new}"]


TARGETS = (
    ("README.md", sync_readme),
    ("docs/ARCHITEKTURA.md", sync_architektura),
    ("research/wiki/grades/01/index.md", sync_wiki_index),
    ("research/wiki/grades/README.md", sync_wiki_readme),
)


def run(apply: bool, quiet: bool = False) -> dict:
    f = factsmod.facts()
    report: dict[str, list[str]] = {}

    for rel, sync in TARGETS:
        path = ROOT / rel
        text = path.read_text(encoding="utf-8")
        new, changes = sync(text, f)
        if changes:
            report[rel] = changes
            if apply and new != text:
                path.write_text(new, encoding="utf-8")

    path = ROOT / "content" / "lt" / "grades.json"
    raw = path.read_text(encoding="utf-8")
    new, changes = sync_grades_json(f)
    if changes:
        report["content/lt/grades.json"] = changes
        if apply and new != raw:
            path.write_text(new, encoding="utf-8")

    # Likę neatitikimai — tikrinama TIKRU vartu, o ne šio įrankio nuomone.
    # `Check.expect()` spausdina kiekvieną sėkmingą palyginimą į stdout, todėl
    # `--json` režime jis nukreipiamas į niekur: kitaip išvestis yra 40 eilučių
    # „✔ …“ ir JSON, kurio neįmanoma perskaityti mašiniškai (LL-37 šeima —
    # skelbiama mašininė forma, bet ji nėra tokia).
    check = factsmod.Check()
    sink = io.StringIO() if quiet else None
    stream = contextlib.redirect_stdout(sink) if sink else contextlib.nullcontext()
    with stream:
        factsmod.check_readme(check, (ROOT / "README.md").read_text(encoding="utf-8"), f)
        factsmod.check_architektura(check, (ROOT / "docs" / "ARCHITEKTURA.md").read_text(encoding="utf-8"), f)
        factsmod.check_grades_json(check, f)
        factsmod.check_wiki(check, f)

    return {"changed": report, "errors": check.errors, "warnings": check.warnings,
            "facts": {k: f[k] for k in ("strand_count", "module_count", "sim_count",
                                        "task_count", "audio_texts", "audio_files", "audio_mb")}}


def main() -> int:
    ap = argparse.ArgumentParser(description="Sinchronizuoja dokumentų skaičius su failais (#5400)")
    ap.add_argument("--apply", action="store_true", help="perrašyti dokumentus (be jo — sausa eiga)")
    ap.add_argument("--json", action="store_true", help="mašininis išėjimas")
    args = ap.parse_args()

    result = run(args.apply, quiet=args.json)

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        mode = "įrašyta" if args.apply else "būtų keista (sausa eiga)"
        if not result["changed"]:
            print("Dokumentai jau sutampa su failais — keisti nereikia.")
        for rel, changes in result["changed"].items():
            print(f"{rel} — {mode}:")
            for change in changes:
                print(f"  · {change}")
        for error in result["errors"]:
            print(f"✘ netaisoma: {error}")
        for warning in result["warnings"]:
            print(f"! {warning}")

    return 1 if result["errors"] else 0


if __name__ == "__main__":
    sys.exit(main())
