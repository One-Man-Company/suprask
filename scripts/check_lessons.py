#!/usr/bin/env python3
"""
Pamokų registro patikra.

`research/wiki/guidelines/pamokos.md` yra vienintelis būdas, kuriuo platforma
nebekartoja tų pačių defektų. Kad jis neirtų, kiekviena pamoka privalo turėti
keturis laukus: Simptomas, Priežastis, Taisyklė, Patikra.

Naudojimas: python3 scripts/check_lessons.py [--strict]
"""

from __future__ import annotations

import argparse
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
LESSONS = ROOT / "research" / "wiki" / "guidelines" / "pamokos.md"

FIELDS = ("Simptomas", "Priežastis", "Taisyklė", "Patikra")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--strict", action="store_true")
    args = ap.parse_args()

    if not LESSONS.exists():
        print("KLAIDA: nėra research/wiki/guidelines/pamokos.md")
        return 1

    text = LESSONS.read_text(encoding="utf-8")
    blocks = re.split(r"\n## (LL-\d+[^\n]*)\n", text)
    # blocks: [preamble, title1, body1, title2, body2, ...]
    errors: list[str] = []
    count = 0
    for i in range(1, len(blocks), 2):
        title, body = blocks[i], blocks[i + 1]
        count += 1
        missing = [f for f in FIELDS if not re.search(rf"\*\*{f}:?\*\*", body)]
        if missing:
            errors.append(f"{title}: trūksta {', '.join(missing)}")

    if count == 0:
        errors.append("nerasta nė viena pamoka (LL-NN)")

    if errors:
        print(f"KLAIDA: {len(errors)} pamokų su trūkumais:")
        for e in errors[:20]:
            print("  -", e)
        return 1

    print(f"✔ Pamokos: {count} įrašai, visi su {len(FIELDS)} laukais.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
