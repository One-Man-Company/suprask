#!/usr/bin/env python3
"""Dokumentų skaičių patikra: ar README ir ARCHITEKTURA teiginiai atitinka failus.

Kodėl: 2026-11-05..07 README ir docs/ARCHITEKTURA.md tris kartus teigė
skirtingus (13, 15, 17) modulių skaičius, nurodė ne tą balso variklį ir neturėjo
CC BY 4.0 atribucijos. Nė vienas validatorius to nepagavo, nes jis tikrina
turinį, o ne dokumentus. Šis įrankis tikrina būtent viešą platformos pajėgumo
teiginį: kiekvienas skaičius dokumente turi būti perskaičiuojamas iš failų.

Naudojimas:
    python3 scripts/check_docs_facts.py            # visi dokumentai
    python3 scripts/check_docs_facts.py --json     # mašininis išėjimas

Išėjimo kodas: 0 — visi teiginiai sutampa, 1 — bent vienas nesutampa.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GRADE = "grade-01"

NUMERALS = {
    "devyni": 9, "dešimt": 10, "vienuolika": 11, "dvylika": 12,
    "trylika": 13, "keturiolika": 14, "penkiolika": 15,
}


def facts() -> dict:
    """Perskaičiuoja tikrovę iš failų: kryptys, moduliai, simuliacijos, užduotys."""
    index_path = ROOT / "content" / "lt" / GRADE / "index.json"
    index = json.loads(index_path.read_text(encoding="utf-8"))

    strands = []
    for strand in index["strands"]:
        title = strand["title"]
        modules = [m["title"] for m in strand["modules"]]
        strands.append({"id": strand["id"], "title": title, "modules": modules})

    task_counts = []
    for module in (ROOT / "content" / "lt" / GRADE).glob("*/*.json"):
        if module.name == "index.json":
            continue
        data = json.loads(module.read_text(encoding="utf-8"))
        task_counts.append(len(data.get("tasks", [])))

    sims: set[str] = set()
    for sim_file in (ROOT / "assets" / "js" / "sims").glob("*.js"):
        text = sim_file.read_text(encoding="utf-8")
        block = re.search(r"export const SIMS\s*=\s*\{(.*?)\n\};", text, re.S)
        if not block:
            continue
        for match in re.finditer(r'^\s*(?:"([a-z0-9-]+)"|([a-z][A-Za-z0-9]*))\s*[:,]', block.group(1), re.M):
            sims.add(match.group(1) or match.group(2))

    manifest_path = ROOT / "assets" / "audio" / "lt" / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    audio_bytes = 0
    audio_files = 0
    for entry in manifest.values():
        for variant in ("n", "s"):
            rel = entry.get(variant)
            if rel:
                audio_files += 1
                audio_bytes += (ROOT / "assets" / "audio" / "lt" / rel).stat().st_size

    roles = sorted(p.stem for p in (ROOT / "agents" / "roles").glob("*.md"))

    return {
        "strands": strands,
        "strand_count": len(strands),
        "module_count": sum(len(s["modules"]) for s in strands),
        "sim_count": len(sims),
        "task_count": sum(task_counts),
        "task_min": min(task_counts) if task_counts else 0,
        "task_max": max(task_counts) if task_counts else 0,
        "audio_texts": len(manifest),
        "audio_files": audio_files,
        "audio_mb": round(audio_bytes / 1_000_000),
        "roles": roles,
    }


class Check:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def expect(self, where: str, what: str, found, expected) -> None:
        if found != expected:
            self.errors.append(f"{where}: {what} — dokumente {found!r}, failuose {expected!r}")
        else:
            print(f"✔ {where}: {what} = {expected}")

    def fail(self, message: str) -> None:
        self.errors.append(message)


def line_of(text: str, needle: str) -> str:
    for number, line in enumerate(text.splitlines(), 1):
        if needle in line:
            return f"{number} eil."
    return "?"


def check_readme(check: Check, text: str, f: dict) -> None:
    where = "README.md"

    header = re.search(
        r"1 klasė — (\d+) kryptys, (\d+) modulių, (\d+) interaktyvių simuliacijų", text
    )
    if not header:
        check.fail(f"{where}: nerastas pajėgumo sakinys „1 klasė — N kryptys, N modulių…“")
    else:
        check.expect(f"{where}:{line_of(text, header.group(0))}", "krypčių", int(header.group(1)), f["strand_count"])
        check.expect(f"{where}:{line_of(text, header.group(0))}", "modulių", int(header.group(2)), f["module_count"])
        check.expect(f"{where}:{line_of(text, header.group(0))}", "simuliacijų", int(header.group(3)), f["sim_count"])

    # Lentelė: kiekviena kryptis atskiroje eilutėje, modulių skaičius pagal „·“
    for strand in f["strands"]:
        row = next(
            (ln for ln in text.splitlines() if ln.startswith("|") and strand["title"] in ln),
            None,
        )
        if row is None:
            check.fail(f"{where}: lentelėje nėra krypties „{strand['title']}“")
            continue
        cells = [c.strip() for c in row.strip("|").split("|")]
        listed = [item.strip() for item in cells[-1].split("·") if item.strip()]
        check.expect(
            f"{where}:{line_of(text, strand['title'])}",
            f"„{strand['title']}“ modulių lentelėje",
            len(listed),
            len(strand["modules"]),
        )
        for title in strand["modules"]:
            key = re.split(r"[:\s,]", title)[0].rstrip(":")
            if not any(key.lower() in item.lower() for item in listed):
                check.fail(
                    f"{where}:{line_of(text, strand['title'])}: „{strand['title']}“ eilutėje trūksta modulio "
                    f"„{title}“ (laukiama bent žodžio „{key}“)"
                )

    tasks = re.search(r"(\d+)[–-](\d+) užduotys", text) or re.search(r"(\d+) užduotys", text)
    if not tasks:
        check.fail(f"{where}: nerastas užduočių skaičius modulio aprašyme")
    elif tasks.lastindex == 2:
        check.expect(f"{where}:{line_of(text, tasks.group(0))}", "užduočių nuo", int(tasks.group(1)), f["task_min"])
        check.expect(f"{where}:{line_of(text, tasks.group(0))}", "užduočių iki", int(tasks.group(2)), f["task_max"])
    else:
        single = int(tasks.group(1))
        if not f["task_min"] <= single <= f["task_max"]:
            check.fail(f"{where}: „{tasks.group(0)}“ neatitinka tikro intervalo {f['task_min']}–{f['task_max']}")

    status_row = next((ln for ln in text.splitlines() if ln.startswith("| Parengta")), None)
    if status_row is None:
        check.fail(f"{where}: nerasta „Parengta“ eilutė būsenos lentelėje")
    else:
        numbers = [int(n) for n in re.findall(r"\d+", status_row)]
        expected = [f["strand_count"], f["module_count"], f["sim_count"], f["task_count"]]
        if numbers[-4:] != expected:
            check.fail(
                f"{where}:{line_of(text, '| Parengta')}: būsenos eilutė {numbers[-4:]} != "
                f"[kryptys, moduliai, simuliacijos, užduotys] {expected}"
            )
        else:
            print(f"✔ {where}: būsenos eilutė = {expected}")

    audio_texts = re.search(r"(\d+) tekstai", text)
    audio_files = re.search(r"(\d+) įrašai", text)
    audio_mb = re.search(r"~(\d+) MB", text)
    audio_line = line_of(text, "Garsas")
    check.expect(f"{where}:{audio_line}", "garso tekstų", int(audio_texts.group(1)) if audio_texts else None, f["audio_texts"])
    check.expect(f"{where}:{audio_line}", "garso įrašų", int(audio_files.group(1)) if audio_files else None, f["audio_files"])
    if audio_mb is None:
        check.fail(f"{where}: nėra garso apimties („~N MB“)")
    elif abs(int(audio_mb.group(1)) - f["audio_mb"]) > 1:
        check.fail(f"{where}:{audio_line}: garso apimtis ~{audio_mb.group(1)} MB, failuose {f['audio_mb']} MB")

    # Balsas ir licencija — proposal #223: klaidingas variklis ir trūkstama CC BY
    if "OnaNeural" in text:
        check.fail(f"{where}:{line_of(text, 'OnaNeural')}: nurodytas nebe naudojamas Azure balsas lt-LT-OnaNeural")
    for needle in ("lt_LT-reginute1", "CC BY 4.0", "LIEPA", "Robertas Tarasevičius"):
        if needle not in text:
            check.fail(f"{where}: trūksta balso atribucijos elemento „{needle}“ (CC BY 4.0 reikalavimas)")

    agents = re.search(r"nuolat vysto ([a-ząčęėįšųūž]+) agentų", text)
    if not agents:
        check.fail(f"{where}: nerastas agentų skaičius")
    else:
        word = agents.group(1)
        if NUMERALS.get(word) != len(f["roles"]):
            check.fail(
                f"{where}:{line_of(text, 'agentų')}: „{word} agentų“, o agents/roles/ turi "
                f"{len(f['roles'])} vaidmenis"
            )
        else:
            print(f"✔ {where}: agentų = {len(f['roles'])}")
    for role in f["roles"]:
        if f"`{role}`" not in text:
            check.fail(f"{where}: agentų lentelėje trūksta vaidmens `{role}`")


def check_architektura(check: Check, text: str, f: dict) -> None:
    where = "docs/ARCHITEKTURA.md"
    live = re.search(
        r"\*\*Live:\*\* 1 klasė — (\d+) kryptys, (\d+) modulių, (\d+) simuliacijų(?:, (\d+) užduočių)?",
        text,
    )
    if not live:
        check.fail(f"{where}: nerastas Būsenos sakinys apie 1 klasę")
        return
    check.expect(f"{where}:{line_of(text, '**Live:**')}", "krypčių", int(live.group(1)), f["strand_count"])
    check.expect(f"{where}:{line_of(text, '**Live:**')}", "modulių", int(live.group(2)), f["module_count"])
    check.expect(f"{where}:{line_of(text, '**Live:**')}", "simuliacijų", int(live.group(3)), f["sim_count"])
    if live.group(4) is None:
        check.warnings.append(f"{where}:{line_of(text, '**Live:**')}: nenurodytas užduočių skaičius")
    else:
        check.expect(f"{where}:{line_of(text, '**Live:**')}", "užduočių", int(live.group(4)), f["task_count"])

    for sim_file in sorted((ROOT / "assets" / "js" / "sims").glob("*.js")):
        if sim_file.name not in text:
            check.fail(f"{where}: struktūros medyje trūksta assets/js/sims/{sim_file.name}")


def check_grades_json(check: Check, f: dict) -> None:
    where = "content/lt/grades.json"
    data = json.loads((ROOT / where).read_text(encoding="utf-8"))
    grade = next((g for g in data["grades"] if g["grade"] == 1), None)
    if grade is None:
        check.fail(f"{where}: nėra 1 klasės įrašo")
        return
    check.expect(where, "1 klasės modulių", grade.get("modules"), f["module_count"])
    check.expect(where, "1 klasės statusas", grade.get("status"), "live")


def check_wiki(check: Check, f: dict) -> None:
    """Wiki klasių puslapiai taip pat kartoja skaičių — 2026-11-07 jie tebėjo „13 modulių“."""
    grade_page = "research/wiki/grades/01/index.md"
    text = (ROOT / grade_page).read_text(encoding="utf-8")
    live = re.search(r"\*\*Live\.\*\* (\d+) modulių, (\d+) krypt", text)
    if not live:
        check.fail(f"{grade_page}: nerastas „Live.“ statuso sakinys")
    else:
        check.expect(f"{grade_page}:{line_of(text, '**Live.**')}", "modulių", int(live.group(1)), f["module_count"])
        check.expect(f"{grade_page}:{line_of(text, '**Live.**')}", "krypčių", int(live.group(2)), f["strand_count"])

    list_page = "research/wiki/grades/README.md"
    text = (ROOT / list_page).read_text(encoding="utf-8")
    row = next((ln for ln in text.splitlines() if ln.startswith("| [[01/index")), None)
    if row is None:
        check.fail(f"{list_page}: nėra 1 klasės eilutės lentelėje")
        return
    found = re.search(r"Live — (\d+) modulių", row)
    if not found:
        check.fail(f"{list_page}:{line_of(text, '[[01/index')}: 1 klasės eilutėje nėra „Live — N modulių“")
    else:
        check.expect(f"{list_page}:{line_of(text, '[[01/index')}", "modulių", int(found.group(1)), f["module_count"])


def main() -> int:
    parser = argparse.ArgumentParser(description="Tikrina, ar README ir ARCHITEKTURA atitinka failus")
    parser.add_argument("--json", action="store_true", help="išvesti rezultatą JSON formatu")
    args = parser.parse_args()

    f = facts()
    check = Check()
    check_readme(check, (ROOT / "README.md").read_text(encoding="utf-8"), f)
    check_architektura(check, (ROOT / "docs" / "ARCHITEKTURA.md").read_text(encoding="utf-8"), f)
    check_grades_json(check, f)
    check_wiki(check, f)

    if args.json:
        print(json.dumps({"facts": f, "errors": check.errors, "warnings": check.warnings},
                         ensure_ascii=False, indent=2))
    else:
        for warning in check.warnings:
            print(f"! {warning}")
        for error in check.errors:
            print(f"✘ {error}")
        print()
        print(f"Dokumentų skaičiai: {len(check.errors)} klaidų, {len(check.warnings)} įspėjimų")
        if check.errors:
            print("Taisymas: skaičius imk iš content/lt/grade-01/index.json, SIMS registrų ir "
                  "assets/audio/lt/manifest.json — ne iš atminties.")
        else:
            print("Sutampa su failais.")

    return 1 if check.errors else 0


if __name__ == "__main__":
    sys.exit(main())
