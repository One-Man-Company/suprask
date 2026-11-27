#!/usr/bin/env python3
"""Ar sakinys moko to, ką paveikslas parodo: „kvėpuoja“ ≠ „burbuliukai“.

Kodėl šis failas egzistuoja
---------------------------
Kritika #52974 turėjo dvi dalis: (1) scenoje nebuvo indo, o sakinys siuntė į
stiklinę; (2) bandymas rodo orą, kuris buvo lape, o ne patį kvėpavimą.
Pirmoji dalis buvo ištaisyta #553 (nupiešta stiklinė), ir tai matuojama
pikseliais naršyklėje. Antroji liko: modulis toliau skelbė taisyklę
„kvėpuoja = burbuliukai“, nors būtent tos taisyklės kritika prašė neteikti.

Geometrijos vartai to nepagauna (jų klausimas „ar indas yra“), o
`check_language.py` tikrina sakinio ilgį, ne jo išvadą. Todėl čia tikrinami
trys dalykai, kurių nelygina nė vienas kitas įrankis:

  T1  gėlės „kvepuoja“ sakinys mini **orą** ir nepaverčia burbuliukų
      kvėpavimo būdu (jokių „kvėpuoja burbuliukais“ formuluočių);
  T2  yra užduotis, kurios klaidingas variantas — ta pati nuostata
      („kvėpuoja būtent burbuliukais“), t. y. modelis turi prieštaraujantį
      pavyzdį, ne tik teisingą teiginį (LL-28);
  T3  `teacher.misconceptions` tą nuostatą įvardija žodžiais, kad mokytojas
      žinotų, ko klausytis vaikų pokalbio.

Bėga be tinklo ir be naršyklės (< 0,1 s), skaito tuos pačius failus, kuriuos
įkelia vaikas.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MODULE = (ROOT / "content" / "lt" / "grade-01" / "pasaulio-pazinimas"
          / "39-bendri-gyvu-organizmu-pozymiai.json")


def check() -> list[str]:
    problems: list[str] = []
    data = json.loads(MODULE.read_text(encoding="utf-8"))
    config = (data.get("sim") or {}).get("config") or {}

    beings = config.get("beings") or []
    flower = next((b for b in beings if b.get("art") == "gele"), None)
    if flower is None:
        return ["T1: nėra būtybės su piešiniu „gele“ — zondas neturi ko tikrinti"]

    line = ((flower.get("sentences") or {}).get("kvepuoja") or "").strip()
    if not line:
        problems.append("T1: gėlės sakinio „kvepuoja“ nėra")
    else:
        low = line.lower()
        if "oras" not in low:
            problems.append(f"T1: sakinyje nėra žodžio „oras“ — burbuliukai lieka be paaiškinimo: {line!r}")
        if re.search(r"kvėpuoja\s+(būtent\s+)?burbuliuk", low):
            problems.append(f"T1: sakinys burbuliukus vadina kvėpavimo būdu: {line!r}")
        if re.search(r"kvėpuoja\s+visu\s+lapu", low) and "oras" not in low:
            problems.append(f"T1: sakinys teigia kvėpavimą be įrodymo: {line!r}")

    bubble_wrong = False
    for task in data.get("tasks") or []:
        options = task.get("options") or []
        answer = task.get("answer")
        for i, opt in enumerate(options):
            if i == answer:
                continue
            if re.search(r"burbuliuk", opt, re.I) and re.search(r"kvėpuoja", opt, re.I):
                bubble_wrong = True
    if not bubble_wrong:
        problems.append("T2: nė vienas klaidingas variantas neteigia „kvėpuoja būtent burbuliukais“ "
                        "— modelyje nėra prieštaraujančio pavyzdžio")

    misconceptions = ((data.get("teacher") or {}).get("misconceptions") or [])
    if not any(re.search(r"burbuliuk", m, re.I) for m in misconceptions):
        problems.append("T3: teacher.misconceptions neįvardija burbuliukų nuostatos")

    return problems


def main() -> int:
    problems = check()
    if problems:
        print(f"NEPAVYKO ({len(problems)}):")
        for p in problems:
            print("  -", p)
        return 1
    print("✔ Sakinys ir paveikslas sutaria: burbuliukai rodo orą, o ne kvėpavimo būdą.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
