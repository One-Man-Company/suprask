#!/usr/bin/env python3
"""Zondas: ar „04-deme-ir-fonas“ konfigūracija sako TĄ PATĮ, ką rodo?

Kodėl atskiras failas: modelio teiginys yra skaičius (4 → 2 → 1 matomų pusių),
o jį saugo dvi nepriklausomos vietos — `sim.config.grounds[].same` (langeliai
paveiksle) ir `sim.config.grounds[].sides` (skaičius, kurį skelbia sakinys).
Jei jas kas nors pakeis atskirai, vaikas matys vieną, o perskaitys kitą
(LL-33: paaiškinimas įrašytas pagal pirmą pavyzdį; LL-21: skaičius, kurio
niekas neperskaičiuoja).

Taisyklė (komponente ta pati, `assets/js/sims/daile.js`):
    kraštas paslėptas ⇔ VISI langeliai, esantys už tos dėmės pusės, yra tos
    pačios spalvos kaip dėmė.
Langelis, dengiantis pusę DALINAI, yra defektas: vaikas negalėtų suskaičiuoti
pusių pirštais (taip ir buvo pirmoje M-18 versijoje — 2 iš 3 langelių).

Naudojimas:
    python3 scripts/probe_deme_ir_fonas.py           # skaito modulio JSON
    python3 scripts/probe_deme_ir_fonas.py --json
Išėjimo kodas: 0 — sutampa, 1 — defektas.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MODULE = ROOT / "content" / "lt" / "grade-01" / "daile" / "04-deme-ir-fonas.json"
SIDES = ("virsus", "apacia", "kaire", "desine")


def outside(side: str, sc: dict) -> list[tuple[int, int]]:
    """Langeliai, esantys UŽ dėmės atitinkamos pusės."""
    col, row, cols, rows = sc["col"], sc["row"], sc["cols"], sc["rows"]
    if side == "virsus":
        return [(c, row - 1) for c in range(col, col + cols)]
    if side == "apacia":
        return [(c, row + rows) for c in range(col, col + cols)]
    if side == "kaire":
        return [(col - 1, r) for r in range(row, row + rows)]
    return [(col + cols, r) for r in range(row, row + rows)]


def analyse(cfg: dict) -> dict:
    sc = cfg["spotCells"]
    cols, rows = cfg["sheet"]["cols"], cfg["sheet"]["rows"]
    problems: list[str] = []
    grounds: list[dict] = []

    if not (1 <= sc["col"] and sc["col"] + sc["cols"] <= cols - 1):
        problems.append("dėmė turi likti bent vieno langelio atstumu nuo lapo krašto (horizontaliai)")
    if not (1 <= sc["row"] and sc["row"] + sc["rows"] <= rows - 1):
        problems.append("dėmė turi likti bent vieno langelio atstumu nuo lapo krašto (vertikaliai)")

    for g in cfg["grounds"]:
        same = {tuple(c) for c in g.get("same", [])}
        for (c, r) in same:
            if not (0 <= c < cols and 0 <= r < rows):
                problems.append(f"{g['id']}: langelis ({c}, {r}) yra už lapo")
            if sc["col"] <= c < sc["col"] + sc["cols"] and sc["row"] <= r < sc["row"] + sc["rows"]:
                problems.append(
                    f"{g['id']}: langelis ({c}, {r}) dengia pačią dėmę — "
                    "fonas dedamas ŠALIA, o ne ant dėmės (LL-27)"
                )
        hidden, partial = [], []
        for side in SIDES:
            cells = outside(side, sc)
            hits = [cell in same for cell in cells]
            if all(hits):
                hidden.append(side)
            elif any(hits):
                partial.append(side)
        if partial:
            problems.append(
                f"{g['id']}: pusė dengiama dalinai ({', '.join(partial)}) — "
                "vaikas nesuskaičiuos pusių. Požymis turi būti VISAS arba NIEKO"
            )
        visible = [s for s in SIDES if s not in hidden]
        declared = g.get("sides")
        if declared != len(visible):
            problems.append(
                f"{g['id']}: sakinys skelbia {declared} pusių, o geometrija duoda {len(visible)} "
                f"({', '.join(visible) or 'nė vienos'})"
            )
        grounds.append({
            "id": g["id"], "visible": visible, "sides": len(visible),
            "declared": declared, "hidden": hidden, "partial": partial,
            "cells": len(same),
        })
    if len(grounds) < 3:
        problems.append(f"lapų per mažai ({len(grounds)}) — modeliui reikia trijų")
    counts = [g["sides"] for g in grounds]
    if len(set(counts)) != len(counts):
        problems.append(f"pusių skaičiai nesiskiria ({counts}) — modelis nieko neparodo")
    return {"grounds": grounds, "counts": counts, "problems": problems}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    if not MODULE.exists():
        print(f"KLAIDA: nėra {MODULE.relative_to(ROOT)}")
        return 1
    data = json.loads(MODULE.read_text(encoding="utf-8"))
    cfg = (data.get("sim") or {}).get("config") or {}
    if not cfg.get("grounds"):
        print("KLAIDA: modulis neturi sim.config.grounds")
        return 1

    result = analyse(cfg)
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=1))
    else:
        for g in result["grounds"]:
            vis = ", ".join(g["visible"]) or "nė vienos"
            print(f"{g['id']:<10} skelbia {g['declared']} · geometrija {g['sides']} "
                  f"(matomos: {vis}; langelių: {g['cells']})")
        print(f"Pusių skaičiai: {' → '.join(str(c) for c in result['counts'])}")
        if result["problems"]:
            print("✘ Defektai:")
            for p in result["problems"]:
                print("  -", p)
        else:
            print("✔ Tekstas ir geometrija sutampa, dalinai dengtų pusių nėra.")
    return 1 if result["problems"] else 0


if __name__ == "__main__":
    sys.exit(main())
