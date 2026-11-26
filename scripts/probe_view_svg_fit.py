#!/usr/bin/env python3
"""Zondas: ar `check_view.py` tikrai mato scenos, kerpamos savo SVG rėme.

Kodėl atskiras zondas, o ne pasitikėjimas kodu: `check_svg_fit.py` defektą matė
nuo #475, bet jo nepaleido nė vienas kelias (LL-207). Šiandien tas pats
matavimas atliekamas kiekvieno `check_view.py` modulio patikros metu, o šis
zondas įrodo, kad sprendimas (`svg_fit_verdict`) tikrai atskiria kerpamą sceną
nuo telpančios ir nuo deklaruotos išimties — be naršyklės, tad veikia ir CI.

Tikrinama:
  1. `overflow:hidden` + perteklius 31,1 px (tikrasis #55708 skaičius) → KLAIDA;
  2. tas pats, bet modulis yra `EXCEPTIONS` sąraše → pastaba, ne klaida;
  3. `overflow:visible` → nieko (vaikas mato visą piešinį);
  4. perteklius 2 px (≤ tolerancija) → nieko;
  5. `MEASURE` JS tikrai renka `svgClip` (matavimas yra naršyklės pusėje);
  6. `check_svg_fit.py` ir `check_view.py` naudoja TĄ PATĮ slenkstį (LL-38).

Naudojimas:
    python3 scripts/probe_view_svg_fit.py        # be tinklo, < 1 s, rc 0/1
"""
from __future__ import annotations

import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

import check_svg_fit  # noqa: E402
import check_view  # noqa: E402

FAILS: list[str] = []
TOTAL = 0


def expect(name: str, cond: bool, detail: str = "") -> None:
    global TOTAL
    TOTAL += 1
    print(("  ✔ " if cond else "  ✗ ") + name + (f" — {detail}" if detail and not cond else ""))
    if not cond:
        FAILS.append(name)


def main() -> int:
    clip_hidden = {"over": 31.1, "tag": "circle", "w": 634, "h": 337, "overflowStyle": "hidden"}
    clip_visible = dict(clip_hidden, overflowStyle="visible")
    clip_small = {"over": 2.0, "tag": "line", "w": 320, "h": 170, "overflowStyle": "hidden"}
    exception_id = next(iter(check_svg_fit.EXCEPTIONS))

    print("1–2. Tikrasis #55708 perteklius ir deklaruota išimtis")
    bad, notes = check_view.svg_fit_verdict("12-zinute-skaitytojui", [clip_hidden])
    expect("kerpama scena tampa klaida", len(bad) == 1 and not notes, f"bad={bad} notes={notes}")
    bad, notes = check_view.svg_fit_verdict(exception_id, [clip_hidden])
    expect("EXCEPTIONS modulis — pastaba, ne klaida", not bad and len(notes) == 1,
           f"bad={bad} notes={notes}")

    print("3–4. Ribos, kurių negalima suversti klaida")
    bad, notes = check_view.svg_fit_verdict("bet-kuris", [clip_visible])
    expect("overflow:visible ne klaida", not bad and not notes)
    bad, notes = check_view.svg_fit_verdict("bet-kuris", [clip_small])
    expect("perteklius ≤ tolerancija ne klaida", not bad and not notes)

    print("5. Matavimas yra naršyklės pusėje, ne vien Python filtras")
    expect("MEASURE renka svgClip", "svgClip" in check_view.MEASURE)
    expect("kiekvienas #sim-stage svg matuojamas", "#sim-stage svg" in check_view.MEASURE)

    print("6. Slenkstis — vienas šaltinis")
    expect("check_view naudoja check_svg_fit.TOL", check_view.SVG_TOL == check_svg_fit.TOL,
           f"{check_view.SVG_TOL} vs {check_svg_fit.TOL}")
    expect("EXCEPTIONS tos pačios", check_view.SVG_FIT_EXCEPTIONS is check_svg_fit.EXCEPTIONS)

    print(f"\nLūkesčiai: {TOTAL - len(FAILS)}/{TOTAL}")
    return 0 if not FAILS else 1


if __name__ == "__main__":
    sys.exit(main())
