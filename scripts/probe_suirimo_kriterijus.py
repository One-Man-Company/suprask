#!/usr/bin/env python3
"""Suirimo kriterijus: ar sakinys, užduotis ir modelis sprendžia pagal TĄ PAČIĄ taisyklę.

Kodėl šis failas egzistuoja
---------------------------
Kritika #55710: modulis `35-gamtos-istekliai-tarsa-tausojimas` skelbė taisyklę
„gamta suyra tai, kas **išaugo**, o tai, kas pagaminta, lieka“. Sakinys
neteisingas (graužas niekada neišaugo — išaugo obuolys), o kriterijus
neišsamus: graužas nė neišaugęs, nė pagamintas, o vis tiek suyra; akmuo
neišaugęs ir nepagamintas, o nesuyra. Vaikas, pritaikęs taisyklę naujam
daiktui, gautų atsakymą, priešingą tikrovei (LL-18, LL-28).

Nė vienas vartas to nematė: `validate_content.py` tikrina laukus,
`check_language.py` — sakinio ilgį, `check_view.py` — išdėstymą. Nė vienas
neklausia, ar **sakinio išvada** išvedama iš modelio daiktų.

Tikrinama (be tinklo, be naršyklės, < 0,1 s):

  T1  `concept.big_idea` įvardija kriterijų žodžiu „gyv…“ (buvo gyvas) ir
      neteigia, kad graužas ar lapas „išaugo“;
  T2  sakinys mini tuos pačius daiktus, kuriuos modelis piešia, — ir tuos,
      kurie suyra, ir tuos, kurie lieka (LL-33: užrašas ir paveikslas sutaria);
  T3  modelyje yra PRIEŠTARAUJANTIS pavyzdys: užduotis, kurios klaidingas
      variantas teigia „viskas, kas iš gamtos, suyra“ (akmuo), o teisingas
      paaiškinimas remiasi tuo, kad daiktas nebuvo gyvas;
  T4  `teacher.misconceptions` įvardija klaidą „graužas išaugo“, kad mokytojas
      žinotų, ko klausytis vaikų pokalbio.

Naudojimas:
    python3 scripts/probe_suirimo_kriterijus.py      # 0 — visi lūkesčiai išsipildė
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MODULE = (ROOT / "content" / "lt" / "grade-01" / "pasaulio-pazinimas"
          / "35-gamtos-istekliai-tarsa-tausojimas.json")

LIVING_WORD = re.compile(r"\bgyv\w*", re.I)
GREW_CLAIM = re.compile(r"\bišaug\w*", re.I)


def _stem(label: str) -> str:
    """„Obuolio graužas“ → „grauž“, kad sakinys galėtų vartoti kitą linksnį."""
    word = label.split()[-1] if label else ""
    return word[: max(4, len(word) - 2)].lower()


def check() -> list[str]:
    problems: list[str] = []
    data = json.loads(MODULE.read_text(encoding="utf-8"))
    concept = data.get("concept") or {}
    big_idea = str(concept.get("big_idea") or "")
    config = (data.get("sim") or {}).get("config") or {}
    items = [it for it in (config.get("items") or []) if isinstance(it, dict)]

    # T1: kriterijus įvardytas, o neteisinga „išaugo“ formuluotė pašalinta.
    if not LIVING_WORD.search(big_idea):
        problems.append(
            "T1: `concept.big_idea` neįvardija kriterijaus („buvo gyvas“) — "
            f"vaikas negali išvesti, kodėl vieni daiktai suyra: {big_idea!r}"
        )
    where_text = [big_idea, str(concept.get("example") or "")]
    where_text += [str(t.get("why") or "") for t in data.get("tasks") or []]
    where_text += [str(s) for s in data.get("svietimas1") or []]
    for text in where_text:
        for sentence in re.split(r"(?<=[.!?])\s+", text):
            if GREW_CLAIM.search(sentence) and not re.search(r"\bobuol\w*", sentence, re.I):
                problems.append(
                    f"T1: sakinys teigia „išaugo“ apie tai, kas neauga: {sentence.strip()!r}"
                )

    # T2: sakinys ir scena kalba apie tuos pačius daiktus.
    if len(items) < 3:
        problems.append(f"T2: modelio daiktų {len(items)}, o vartas tikisi bent trijų")
    for it in items:
        label = str(it.get("label") or "")
        stem = _stem(label)
        if stem and stem not in big_idea.lower():
            problems.append(
                f"T2: modelis piešia „{label}“, o `big_idea` jo nemini — "
                "užrašas ir paveikslas nesutaria"
            )

    # T3: prieštaraujantis pavyzdys, kuris taisyklę padaro išvedamą.
    counterexample = None
    for task in data.get("tasks") or []:
        options = [str(o) for o in (task.get("options") or [])]
        answer = task.get("answer")
        if not isinstance(answer, int) or not 0 <= answer < len(options):
            continue
        wrong = [o for i, o in enumerate(options) if i != answer]
        if (any(re.search(r"iš gamtos", o, re.I) and re.search(r"suirs|suyra", o, re.I) for o in wrong)
                and re.search(r"nesuyra|liks", options[answer], re.I)
                and re.search(r"gyv", str(task.get("why") or ""), re.I)):
            counterexample = task
            break
    if counterexample is None:
        problems.append(
            "T3: nė vienas klaidingas variantas neteigia „viskas, kas iš gamtos, suyra“ "
            "ir nė vienas teisingas paaiškinimas nesiremia „nebuvo gyvas“ — "
            "taisyklė modelyje neturi prieštaraujančio pavyzdžio (LL-28)"
        )

    # T4: mokytojas įspėtas žodžiais.
    misconceptions = ((data.get("teacher") or {}).get("misconceptions") or [])
    if not any(re.search(r"grauž\w*", m, re.I) and re.search(r"išaug\w*", m, re.I)
               for m in misconceptions):
        problems.append("T4: `teacher.misconceptions` neįvardija klaidos „graužas išaugo“")

    return problems


def main() -> int:
    problems = check()
    if problems:
        print(f"NEPAVYKO ({len(problems)}):")
        for p in problems:
            print("  -", p)
        return 1
    print("✔ Suirimo kriterijus vienas: sakinys, scena ir užduotis remiasi „buvo gyvas“.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
