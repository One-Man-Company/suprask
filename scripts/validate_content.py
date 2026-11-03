#!/usr/bin/env python3
"""
SUPRASK turinio validatorius.

Tikrina modulių JSON pagal docs/KURINIO-STANDARTAS.md ir
docs/SVIETIMAS-1-GAIRES.md. Naudojamas CI ir agentų (tikrintojas).

Naudojimas:
    python3 scripts/validate_content.py
    python3 scripts/validate_content.py --grade 1
    python3 scripts/validate_content.py --strict
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "lt"
SIMS_DIR = ROOT / "assets" / "js" / "sims"

REQUIRED_MODULE = [
    "id", "grade", "strand", "title", "subtitle", "minutes",
    "outcomes", "concept", "tasks", "reflect", "teacher", "sources", "svietimas1",
]
REQUIRED_TEACHER = ["goal", "prompt", "offline", "misconceptions"]

FORBIDDEN_UI_WORDS = [
    "skill", "level", "streak", "challenge", "score", "badge", "leaderboard",
    "reward", "unlock", "checkpoint", "quest",
]

LITHUANIAN_CHARS = set("ąčęėįšųūžĄČĘĖĮŠŲŪŽ")

SIMPLIFIED_MAX = {1: 60, 2: 70, 3: 90, 4: 100}


class Report:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def err(self, msg: str) -> None:
        self.errors.append(msg)

    def warn(self, msg: str) -> None:
        self.warnings.append(msg)


def registered_sims() -> set[str]:
    """Renka simuliacijų ID iš assets/js/sims/*.js SIMS eksportų."""
    ids: set[str] = set()
    for f in SIMS_DIR.glob("*.js"):
        text = f.read_text(encoding="utf-8")
        block = re.search(r"export const SIMS\s*=\s*\{(.*?)\n\};", text, re.S)
        if not block:
            continue
        for m in re.finditer(r'^\s*(?:"([a-z0-9][a-z0-9-]+)"|([a-z0-9][a-z0-9-]+))\s*[:,]', block.group(1), re.M):
            ids.add(m.group(1) or m.group(2))
    return ids


def word_count(text: str) -> int:
    return len(re.findall(r"[\wąčęėįšųūžĄČĘĖĮŠŲŪŽ'-]+", text))


def check_module(path: Path, data: dict, rep: Report, sims: set[str], grades_meta: dict) -> None:
    rel = path.relative_to(ROOT)
    for field in REQUIRED_MODULE:
        if field not in data or data[field] in (None, "", [], {}):
            rep.err(f"{rel}: trūksta privalomo lauko „{field}“")
    if rep.errors and any(str(rel) in e for e in rep.errors[-len(REQUIRED_MODULE):]):
        return

    grade = data.get("grade")
    if not isinstance(grade, int) or not 1 <= grade <= 12:
        rep.err(f"{rel}: „grade“ turi būti 1–12")

    if not re.fullmatch(r"\d{2}-[a-z0-9-]+", str(data.get("id", ""))):
        rep.err(f"{rel}: „id“ turi atitikti NN-slug formatą")

    minutes = data.get("minutes")
    if not isinstance(minutes, int) or not 8 <= minutes <= 12:
        rep.warn(f"{rel}: „minutes“ rekomenduojama 8–12 (dabar {minutes})")

    outcomes = data.get("outcomes") or []
    if not (1 <= len(outcomes) <= 3):
        rep.err(f"{rel}: „outcomes“ turi būti 1–3 (dabar {len(outcomes)})")
    for o in outcomes:
        if not re.match(r"^[A-ZĄČĘĖĮŠŲŪŽ]", str(o)):
            rep.warn(f"{rel}: rezultatas turėtų prasidėti didžiąja raide")
        if len(o) > 160:
            rep.warn(f"{rel}: rezultatas ilgesnis nei 160 simbolių")

    concept = data.get("concept") or {}
    for key in ("title", "big_idea", "steps"):
        if not concept.get(key):
            rep.err(f"{rel}: trūksta „concept.{key}“")
    if len(concept.get("big_idea", "")) > 260:
        rep.warn(f"{rel}: „big_idea“ ilgesnė nei 260 simbolių")
    steps = concept.get("steps") or []
    if not (2 <= len(steps) <= 4):
        rep.warn(f"{rel}: „concept.steps“ rekomenduojama 2–4 (dabar {len(steps)})")

    sim = data.get("sim")
    if sim:
        comp = sim.get("component")
        if comp not in sims:
            rep.err(f"{rel}: simuliacija „{comp}“ neegzistuoja registre (yra: {', '.join(sorted(sims))})")

    tasks = data.get("tasks") or []
    if not (3 <= len(tasks) <= 5):
        rep.err(f"{rel}: užduočių turi būti 3–5 (dabar {len(tasks)})")
    answers = []
    transfer = False
    for i, t in enumerate(tasks, 1):
        for key in ("q", "options", "answer", "hint", "why"):
            if key not in t:
                rep.err(f"{rel}: {i} užduotis neturi „{key}“")
        opts = t.get("options") or []
        if len(opts) < 3:
            rep.err(f"{rel}: {i} užduotis turi mažiau nei 3 atsakymo variantus")
        ans = t.get("answer")
        if not isinstance(ans, int) or not 0 <= ans < max(len(opts), 1):
            rep.err(f"{rel}: {i} užduoties „answer“ už ribų")
        else:
            answers.append(ans)
        if not str(t.get("hint", "")).strip():
            rep.err(f"{rel}: {i} užduotis neturi užuominos")
        if len(str(t.get("hint", ""))) > 200:
            rep.warn(f"{rel}: {i} užduoties užuomina ilga (>200)")
        if t.get("optional"):
            transfer = True
        q = str(t.get("q", "")).lower()
        if "kuris teiginys teisingas" in q or "ką atsimeni" in q or "įsimink" in q:
            rep.err(f"{rel}: {i} užduotis tikrina įsiminimą, ne supratimą")

    if answers and len(set(answers)) == 1 and len(answers) >= 3:
        rep.err(f"{rel}: visi teisingi atsakymai tame pačiame indekse ({answers[0]}) — perrašyk variantus")

    if grade >= 3 and not transfer:
        rep.warn(f"{rel}: nėra praplėtimo („optional“) užduoties")

    teacher = data.get("teacher") or {}
    for key in REQUIRED_TEACHER:
        if not teacher.get(key):
            rep.err(f"{rel}: trūksta „teacher.{key}“")
    if not isinstance(teacher.get("misconceptions"), list) or len(teacher.get("misconceptions", [])) < 2:
        rep.warn(f"{rel}: rekomenduojamos bent 2 dažnos klaidos")

    if not data.get("sources"):
        rep.err(f"{rel}: trūksta šaltinių")
    if not data.get("svietimas1"):
        rep.err(f"{rel}: trūksta sąsajos su Švietimas #1")

    # teksto kiekis pagal klasę
    limit = SIMPLIFIED_MAX.get(grade, 10**6)
    body = " ".join([str(data.get("subtitle", ""))] + list(concept.get("steps") or []) + [str(concept.get("big_idea", ""))])
    if word_count(body) > limit * 3:
        rep.warn(f"{rel}: teksto kiekis ({word_count(body)} ž.) didokas {grade} klasei")

    # kalba
    blob = json.dumps(data, ensure_ascii=False).lower()
    for w in FORBIDDEN_UI_WORDS:
        if re.search(rf"\b{w}\b", blob):
            rep.err(f"{rel}: vartotojo sąsajoje rastas anglicizmas „{w}“")

    # failo vieta turi atitikti klasę ir kryptį
    expected_dir = CONTENT / f"grade-{grade:02d}" / str(data.get("strand"))
    if path.parent != expected_dir:
        rep.err(f"{rel}: failas turi būti {expected_dir.relative_to(ROOT)}/{path.name}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--grade", type=int, default=None)
    ap.add_argument("--strict", action="store_true", help="įspėjimai laikomi klaidomis")
    args = ap.parse_args()

    rep = Report()
    sims = registered_sims()
    if not sims:
        rep.err("Nerasta nė viena simuliacija (assets/js/sims/*.js)")

    grades_file = CONTENT / "grades.json"
    if not grades_file.exists():
        rep.err("Trūksta content/lt/grades.json")
        print_report(rep, args)
        return 1

    try:
        grades_meta = json.loads(grades_file.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        rep.err(f"grades.json: neteisingas JSON: {e}")
        print_report(rep, args)
        return 1

    meta_by_grade = {g["grade"]: g for g in grades_meta.get("grades", [])}
    if len(meta_by_grade) != 12:
        rep.err(f"grades.json: turi būti 12 klasių (dabar {len(meta_by_grade)})")

    total_modules = 0
    live_grades = [g for g, m in meta_by_grade.items() if m.get("status") == "live"]
    for grade in (live_grades if args.grade is None else [args.grade]):
        index_path = CONTENT / f"grade-{grade:02d}" / "index.json"
        if not index_path.exists():
            rep.err(f"{index_path.relative_to(ROOT)}: nėra klasės indekso")
            continue
        try:
            index = json.loads(index_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            rep.err(f"{index_path.relative_to(ROOT)}: neteisingas JSON: {e}")
            continue

        seen_ids: set[str] = set()
        for strand in index.get("strands", []):
            for key in ("id", "title", "emoji", "modules"):
                if not strand.get(key):
                    rep.err(f"{index_path.relative_to(ROOT)}: krypčiai trūksta „{key}“")
            for m in strand.get("modules", []):
                total_modules += 1
                mid = m.get("id")
                if mid in seen_ids:
                    rep.err(f"{index_path.relative_to(ROOT)}: pasikartojantis modulio ID „{mid}“")
                seen_ids.add(mid)
                mod_path = CONTENT / str(m.get("file", ""))
                if not mod_path.exists():
                    rep.err(f"{index_path.relative_to(ROOT)}: modulio failas nerastas: {m.get('file')}")
                    continue
                try:
                    data = json.loads(mod_path.read_text(encoding="utf-8"))
                except json.JSONDecodeError as e:
                    rep.err(f"{mod_path.relative_to(ROOT)}: neteisingas JSON: {e}")
                    continue
                if data.get("id") != mid:
                    rep.err(f"{mod_path.relative_to(ROOT)}: „id“ ({data.get('id')}) nesutampa su indeksu ({mid})")
                if data.get("strand") != strand.get("id"):
                    rep.err(f"{mod_path.relative_to(ROOT)}: „strand“ nesutampa su katalogo kryptimi")
                check_module(mod_path, data, rep, sims, meta_by_grade)

    print_report(rep, args)
    if rep.errors:
        return 1
    if args.strict and rep.warnings:
        return 1
    return 0


def print_report(rep: Report, args) -> None:
    for e in rep.errors:
        print(f"KLAIDA: {e}")
    if not args.strict:
        for w in rep.warnings:
            print(f"ĮSPĖJIMAS: {w}")
    print(f"\nRezultatas: {len(rep.errors)} klaidų, {len(rep.warnings)} įspėjimų")
    if not rep.errors:
        print("✔ Turinys atitinka standartą.")


if __name__ == "__main__":
    sys.exit(main())
