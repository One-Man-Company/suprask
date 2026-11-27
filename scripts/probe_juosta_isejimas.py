#!/usr/bin/env python3
"""Juostos likutis: ar rytas telpa iki išėjimo, ar neigiamas likutis atmetamas.

Kodėl šis failas egzistuoja
---------------------------
Kritika #52972: `30-dienos-rezimas-mityba` simuliacijoje išėjimas fiksuotas
8:00, pastovūs ruožai (keltis 5 + rengtis 25 + kelias 10) = 40 min., tad
pusryčiai = 8:00 − kėlimasis − 0:40. Su trečiuoju laiku 7:25 likutis yra
−5 min.; simuliacija jį kirpo (`Math.max(0, bf)`), todėl juosta baigėsi 8:05
ir **pravažiavo** „Išeinu 8:00“ liniją, o 4 užduotis prašė paaiškinti 40 min.
skirtumą, kai pusryčių teduvo 35.

Tikrina tris dalykus, kurių nelygina nė vienas turinio vartas:
  T1  kiekvienas `sim.config.wakeTimes` laikas palieka likutį >= 0;
  T2  modulio ketvirta užduotis skiriasi būtent per pusryčių minutes
      (ne daugiau — kitaip likutis nepaskirstytas, LL-01/LL-20 šeima);
  T3  simuliacijoje dar yra garsi likučio patikra (ne tylus nukerpimas),
      t. y. `problems` sąraše minima `DR_FIXED` ir nėra `Math.max(0, bf)`.

Bėga be tinklo ir be naršyklės (< 0,1 s), skaito tuos pačius failus, kuriuos
įkelia vaikas.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MODULE = ROOT / "content" / "lt" / "grade-01" / "pasaulio-pazinimas" / "30-dienos-rezimas-mityba.json"
SIM = ROOT / "assets" / "js" / "sims" / "pasaulis.js"

DEPART = 8 * 60          # išėjimas — tas pats kodas kaip simuliacijoje
FIXED = 5 + 25 + 10      # keltis + rengimasis + kelias


def parse_clock(text: str) -> int:
    h, m = text.split(":")
    return int(h) * 60 + int(m)


def breakfast(wake: str) -> int:
    return DEPART - parse_clock(wake) - FIXED


def check() -> list[str]:
    problems: list[str] = []
    data = json.loads(MODULE.read_text(encoding="utf-8"))
    config = (data.get("sim") or {}).get("config") or {}
    wakes = [str(w) for w in (config.get("wakeTimes") or [])]

    if len(wakes) < 3:
        problems.append(f"T1: kėlimosi laikų {len(wakes)}, o modelis piešia tris")
    for w in wakes:
        left = breakfast(w)
        if left < 0:
            problems.append(f"T1: kėlimasis {w} palieka {left} min. pusryčiams — "
                            "konfigūracija neįmanoma, o simuliacija ją piešia")

    # T2: 4 užduotis turi skirtis per pusryčių minutes, o ne per likutį
    tasks = data.get("tasks") or []
    if len(tasks) < 4:
        problems.append(f"T2: užduočių {len(tasks)} — ketvirtos (perkėlimo) nėra")
    else:
        q = str(tasks[3].get("q") or "")
        times = re.findall(r"\b(\d{1,2}:\d{2})\b", q)
        # Klausime du kėlimosi laikai ir vienas išėjimas — išėjimas modelio
        # nekinta, tad jo skirtumas su kėlimusi būtų klaidingas palyginimas.
        wake_times = [t for t in times if parse_clock(t) != DEPART]
        if DEPART not in [parse_clock(t) for t in times]:
            problems.append(f"T2: 4 užduotyje nėra išėjimo {DEPART // 60}:00 — "
                            f"laikai {times}")
        if len(wake_times) != 2:
            problems.append(f"T2: 4 užduotyje kėlimosi laikų {wake_times} — tikėta du")
        else:
            gap = abs(parse_clock(wake_times[1]) - parse_clock(wake_times[0]))
            first = breakfast(wake_times[0])
            if first < 0:
                problems.append(f"T2: ankstesnis laikas {wake_times[0]} duoda {first} min. pusryčių")
            elif gap != first:
                problems.append(f"T2: {wake_times[0]} → {wake_times[1]} skirtumas {gap} min., "
                                f"o pusryčių buvo {first} min. — {gap - first} min. "
                                "nepaskirstytos (LL-01/LL-20 šeima)")

    # T3: likutis atmetamas garsiai, o ne kerpamas
    code = SIM.read_text(encoding="utf-8")
    if "Math.max(0, bf)" in code:
        problems.append("T3: `Math.max(0, bf)` tebėra — neigiamas likutis tyliai kerpamas")
    if not re.search(r"DR_DEPART - w\.min - DR_FIXED < 0", code):
        problems.append("T3: `problems` sąraše nėra likučio ženklo patikros")
    return problems


def main() -> int:
    problems = check()
    print(f"Kėlimosi laikai: "
          f"{[f'{w}→{breakfast(w)} min.' for w in (json.loads(MODULE.read_text())['sim']['config']['wakeTimes'])]}")
    if problems:
        print(f"KLAIDA: {len(problems)} problema(s)")
        for p in problems:
            print("  -", p)
        return 1
    print("✔ Juosta telpa iki išėjimo, užduotis skiriasi per pusryčius, likutis tikrinamas garsiai.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
