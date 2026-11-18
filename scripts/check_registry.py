#!/usr/bin/env python3
"""Registrų sankirta: index.json ↔ modulių failai ↔ path.json ↔ SIMS.

`validate_content.py` tikrina `id`/`strand` ir simuliacijos egzistavimą, bet ne
`title/subtitle/minutes/sim` sutapimą tarp `index.json` ir modulio failo
(#16892), ne `path.json` sekos pilnumą ir ne našlaičius failus. Šis įrankis
tą spragą uždaro be playwright ir be tinklo — tik skaitymas.

Naudojimas:
    python3 scripts/check_registry.py            # visos klasės su index.json
    python3 scripts/check_registry.py --grade 1
    python3 scripts/check_registry.py --json
"""
from __future__ import annotations

import argparse
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "lt"
SIMS_DIR = ROOT / "assets" / "js" / "sims"

# SIMS registre raktas gali būti parašytas dviem būdais:
#   "raktas": { ... }      (įprastas)
#   raktas,                (trumpasis žymėjimas, matematika.js:3631)
# Todėl vien `"\w+":` grep praleidžia tris raktus ir duoda klaidingą
# „neregistruotas“ signalą (paleidimas #309).
KEY_FULL = re.compile(r'^\s{2}"([a-z0-9-]+)":', re.M)
KEY_SHORT = re.compile(r'^\s{2}([a-z][a-z0-9-]*),\s*$', re.M)


def sim_keys() -> set[str]:
    keys: set[str] = set()
    for path in sorted(SIMS_DIR.glob("*.js")):
        src = path.read_text(encoding="utf-8")
        keys |= set(KEY_FULL.findall(src))
        keys |= set(KEY_SHORT.findall(src))
    return keys


def check_grade(grade_dir: pathlib.Path, keys: set[str]) -> dict:
    index_path = grade_dir / "index.json"
    idx = json.loads(index_path.read_text(encoding="utf-8"))
    problems: list[str] = []
    entries: list[dict] = []
    tasks = optional = 0

    for strand in idx.get("strands", []):
        for m in strand.get("modules", []):
            entries.append(m)
            rel = m.get("file", "").split(f"{grade_dir.name}/", 1)[-1]
            f = grade_dir / rel
            if not f.exists():
                problems.append(f"TRŪKSTA FAILO: {m.get('file')}")
                continue
            data = json.loads(f.read_text(encoding="utf-8"))
            if data.get("id") != f.stem:
                problems.append(f"ID != failo vardas: {f.name} → {data.get('id')}")
            if data.get("id") != m.get("id"):
                problems.append(f"ID != index: {m.get('id')} → {data.get('id')}")
            for k in ("title", "subtitle", "minutes"):
                if m.get(k) != data.get(k):
                    problems.append(
                        f"NESUTAMPA {k}: {m.get('id')} index={m.get(k)!r} modulis={data.get(k)!r}"
                    )
            sim = (data.get("sim") or {}).get("component")
            if m.get("sim") != sim:
                problems.append(f"SIM nesutampa: {m.get('id')} index={m.get('sim')!r} modulis={sim!r}")
            if sim and sim not in keys:
                problems.append(f"SIM neregistruotas: {m.get('id')} → {sim}")
            t = data.get("tasks") or []
            tasks += len(t)
            opt = sum(1 for x in t if x.get("optional"))
            optional += opt
            if opt == 0:
                problems.append(f"BE optional užduoties: {m.get('id')}")

    files = {p.stem for p in grade_dir.glob("*/*.json")}
    listed = {m.get("id") for m in entries}
    orphans = sorted(files - listed)

    path_file = grade_dir / "path.json"
    path_ids: list[str] = []
    if path_file.exists():
        path = json.loads(path_file.read_text(encoding="utf-8"))
        path_ids = path.get("sequence") or [
            (p.get("id") or p.get("module")) for p in (path.get("steps") or path.get("modules") or [])
        ]
        listed = {str(m.get("id")) for m in entries}
        not_in_path = [i for i in listed if i not in path_ids]
        path_extra = [i for i in path_ids if i not in listed]
        if not_in_path:
            problems.append(f"path.json be įrašo: {', '.join(not_in_path)}")
        if path_extra:
            problems.append(f"path.json turi ne indekse: {', '.join(path_extra)}")

    return {
        "grade": grade_dir.name,
        "strands": len(idx.get("strands", [])),
        "entries": len(entries),
        "files": len(files),
        "tasks": tasks,
        "optional": optional,
        "sims": len({m.get("sim") for m in entries if m.get("sim")}),
        "path_steps": len(path_ids),
        "orphans": orphans,
        "problems": problems,
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--grade", type=int, default=0)
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    keys = sim_keys()
    if args.grade:
        dirs = [CONTENT / f"grade-{args.grade:02d}"]
    else:
        dirs = sorted(p for p in CONTENT.glob("grade-*") if (p / "index.json").exists())
    dirs = [d for d in dirs if (d / "index.json").exists()]
    if not dirs:
        print("KLAIDA: nerasta klasių su index.json", file=sys.stderr)
        return 2

    reports = [check_grade(d, keys) for d in dirs]
    total_problems = sum(len(r["problems"]) for r in reports)

    if args.json:
        print(json.dumps({"sim_keys": len(keys), "grades": reports}, ensure_ascii=False, indent=1))
    else:
        print(f"SIMS raktai kode: {len(keys)}")
        for r in reports:
            print(
                f"{r['grade']}: kryptys {r['strands']} · index {r['entries']} · failai {r['files']} · "
                f"užduotys {r['tasks']} (optional {r['optional']}) · sim {r['sims']} · "
                f"path {r['path_steps']} · našlaičiai {len(r['orphans'])}"
            )
            for p in r["problems"]:
                print("    " + p)
        print(f"PROBLEMŲ: {total_problems}")
    return 1 if total_problems else 0


if __name__ == "__main__":
    sys.exit(main())
