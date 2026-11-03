#!/usr/bin/env python3
"""
Perskirsto užduočių atsakymų pozicijas, kad teisingas atsakymas nebūtų
visada tame pačiame indekse. Turinys nekeičiamas — tik variantų tvarka.

Naudojimas:
    python3 scripts/rebalance_answers.py            # peržiūra (dry run)
    python3 scripts/rebalance_answers.py --write    # įrašyti pakeitimus
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "lt"


def rotate(options: list, answer: int, target: int) -> tuple[list, int]:
    """Pasuka variantų sąrašą taip, kad teisingas atsakymas atsidurtų `target`."""
    n = len(options)
    correct = options[answer]
    rest = [o for i, o in enumerate(options) if i != answer]
    new = rest[:target] + [correct] + rest[target:]
    return new, target


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true")
    args = ap.parse_args()

    changed = 0
    for path in sorted(CONTENT.glob("grade-*/**/*.json")):
        if path.name == "index.json":
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        tasks = data.get("tasks") or []
        if not tasks:
            continue
        answers = [t.get("answer", 0) for t in tasks]
        if len(set(answers)) > 1:
            continue  # jau įvairu
        touched = False
        for i, t in enumerate(tasks):
            opts = t.get("options") or []
            ans = t.get("answer", 0)
            if not opts or not isinstance(ans, int) or not 0 <= ans < len(opts):
                continue
            target = i % len(opts)
            if target == ans:
                continue
            t["options"], t["answer"] = rotate(opts, ans, target)
            touched = True
        if touched:
            changed += 1
            print(f"{path.relative_to(ROOT)}: {answers} -> {[t['answer'] for t in tasks]}")
            if args.write:
                path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\n{'Pakeista' if args.write else 'Keistų'} failų: {changed}")
    if not args.write:
        print("Sausas bėgimas. Įrašymui pridėk --write")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
