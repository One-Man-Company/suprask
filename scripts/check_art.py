#!/usr/bin/env python3
"""
Iliustracijų standarto patikra (pamoka LL-13).

Tikslas: naujos pamokų scenos nebegrįžtų prie savo stačiakampių. Scenos, kurios
piešia SVG, privalo naudoti `assets/js/sims/art.js` — ten sukaupta forma, spalva
ir šešėlis (gradientinis dangus, kalvos, tekstūruota žemė, medis, upė, tiltas).

Sąrašas LEGACY — tai scenos, kurios dar neperkeltos. Jis gali tik MAŽĖTI:
jei failas iš sąrašo pradeda importuoti art.js, jį reikia iš ten išbraukti
(patikra pati pasakys).

Naudojimas:
    python3 scripts/check_art.py            # tikrina
    python3 scripts/check_art.py --list     # kas dar legacy
"""

from __future__ import annotations

import argparse
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SIMS = ROOT / "assets" / "js" / "sims"
ART = SIMS / "art.js"

# Scenos, kurios piešia savo formas ir dar neperkeltos į art.js.
# Kiekviena eilutė turi priežastį — ir turi kada nors išnykti.
LEGACY = {
    "matematika.js": "skaičių tiesė, laikrodis, svarstyklės, figūros — perkeliama po vieną",
}

DRAWS_SVG = re.compile(r"<svg|svg\.innerHTML|<path|<rect|<circle|<ellipse")
USES_ART = re.compile(r'from\s+"\./art\.js"')
ART_CALL = re.compile(r"\bart\.\w+\(")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--list", action="store_true")
    args = ap.parse_args()

    problems: list[str] = []
    legacy_found: list[str] = []
    migrated = 0

    for f in sorted(SIMS.glob("*.js")):
        if f.name == "art.js":
            continue
        src = f.read_text(encoding="utf-8")
        if not DRAWS_SVG.search(src):
            continue

        uses_art = bool(USES_ART.search(src))
        calls = len(ART_CALL.findall(src))

        if uses_art and calls < 3:
            problems.append(
                f"{f.name}: importuoja art.js, bet naudoja tik {calls} art.* kvietimus — "
                "scena turi būti surenkama iš art.js dalių"
            )

        if uses_art:
            migrated += 1
            if f.name in LEGACY:
                problems.append(
                    f"{f.name}: jau naudoja art.js — išbrauk iš LEGACY sąrašo (jis turi tik mažėti)"
                )
            continue

        if f.name in LEGACY:
            legacy_found.append(f"{f.name} — {LEGACY[f.name]}")
            continue

        problems.append(
            f"{f.name}: piešia SVG savo formomis, bet nenaudoja art.js (LL-13). "
            "Sceną rink iš art.defs/sun/hills/soil/tree/river/bridge/block/kid…"
        )

    if args.list:
        print("Legacy scenos:" if legacy_found else "Legacy scenų nėra.")
        for line in legacy_found:
            print(" -", line)
        return 0

    if problems:
        print("✘ Iliustracijų standartas nesilaikomas:")
        for p in problems:
            print("  -", p)
        return 1

    note = f", legacy: {len(legacy_found)}" if legacy_found else ""
    print(f"✔ Iliustracijos: {migrated} simuliacijų failai naudoja art.js{note}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
