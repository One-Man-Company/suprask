#!/usr/bin/env python3
"""Zondas: ar `check_field_limits()` ir `check_field_limits_against_standard()`
gaudo standarto §2 simbolių ribų defektą, o svarus modulis praeina.

Be tinklo, < 0,1 s; įsijungia į CI `probe_*.py` ciklą.

Būsena iki #572: `validate_content.py` tikrino `concept.big_idea` prie **260**
simbolių, o standartas §2 sako **240**, ir netikrino nė vieno kito §2 lauko
ribos: `title` (42), `subtitle` (80), `concept.title` (40),
`concept.steps[i]` (200), `title` be taško gale. Todėl modulis, kurio
`subtitle` 90 simbolių, praeidavo visus vartus — nors tą patį `subtitle` vaikas
skaito klasės sąraše, o standartas jį atmeta (LL-38 šeima: riba gyvavo dviem
egzemplioriais ir nuslinko).

Kiekvienas lūkesnis turi ir **neigiamą** kontrolę: defektas privalo būti
pagautas, švarus įrašas — ne. Zondas krenta (rc 1), jei bent vienas lūkesnis
neišsipildo.
"""
from __future__ import annotations

import copy
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import validate_content as vc  # noqa: E402

fails: list[str] = []
runs = 0


def check(name: str, ok: bool, detail: str = "") -> None:
    global runs
    runs += 1
    print(("✔" if ok else "✗"), name, ("— " + detail if detail else ""))
    if not ok:
        fails.append(name)


def clean_report(data: dict) -> vc.Report:
    """`check_field_limits` be jokio kito varto triukšmo."""
    rep = vc.Report()
    vc.check_field_limits("content/lt/grade-01/matematika/x.json", data, rep)
    return rep


BASE = json.loads(
    (ROOT / "content/lt/grade-01/matematika/04-skaiciu-tiese.json").read_text(encoding="utf-8")
)


# P1 — tikras modulis praeina (teigiama kontrolė: vartas ne šaukia be reikalo).
rep = clean_report(BASE)
check("P1 tikras modulis be pažeidimų", not rep.errors, f"{len(rep.errors)} klaidų")


# P2 — `subtitle` viena simbolių virš ribos (80). Iki #572 jo netikrino niekas.
data = copy.deepcopy(BASE)
data["subtitle"] = "Ž" * (vc.FIELD_LIMITS["subtitle"] + 1)
rep = clean_report(data)
check(
    "P2 subtitle virš 80 pagautas",
    len(rep.errors) == 1 and "subtitle" in rep.errors[0],
    rep.errors[0][:90] if rep.errors else "tyla",
)

# P3 — lygiai ties riba praleidžiamas (riba yra ≤, ne <).
data = copy.deepcopy(BASE)
data["subtitle"] = "Ž" * vc.FIELD_LIMITS["subtitle"]
rep = clean_report(data)
check("P3 lygiai ties riba praeina", not rep.errors, f"{len(rep.errors)} klaidų")


# P4 — `title` 43 simboliai ir taškas gale, abu pagauti.
data = copy.deepcopy(BASE)
data["title"] = "Ž" * (vc.FIELD_LIMITS["title"] + 1) + "."
rep = clean_report(data)
check(
    "P4 title virš 42 ir taškas gale — dvi klaidos",
    len(rep.errors) == 2 and any("tašku" in e for e in rep.errors),
    "; ".join(e.split(": ", 1)[-1] for e in rep.errors)[:110],
)


# P5 — `concept.big_idea` 241 simbolis (senoji riba 260 jo nepagautų).
data = copy.deepcopy(BASE)
data["concept"]["big_idea"] = "Ž" * (vc.FIELD_LIMITS["concept.big_idea"] + 1)
rep = clean_report(data)
check(
    "P5 big_idea 241 pagautas (senoji 260 — ne)",
    len(rep.errors) == 1 and "concept.big_idea" in rep.errors[0],
    rep.errors[0].split(": ", 1)[-1][:90] if rep.errors else "tyla",
)


# P6 — `concept.steps[i]` 201 simbolis; klaida turi rodyti indeksą.
data = copy.deepcopy(BASE)
data["concept"]["steps"] = list(data["concept"]["steps"])
data["concept"]["steps"][1] = "Ž" * (vc.FIELD_LIMITS["concept.steps"] + 1)
rep = clean_report(data)
check(
    "P6 steps[2] virš 200 pagautas su indeksu",
    len(rep.errors) == 1 and "concept.steps[2]" in rep.errors[0],
    rep.errors[0].split(": ", 1)[-1][:90] if rep.errors else "tyla",
)


# P7 — normos susilyginimas su standartu: lentelė šiandien sutampa.
rep = vc.Report()
vc.check_field_limits_against_standard(rep)
check("P7 FIELD_LIMITS sutampa su standartu §2", not rep.errors,
      rep.errors[0][:120] if rep.errors else "sutampa")


# P8 — neigiama norma: laikinai senoji `big_idea` riba (260) privalo būti
# pranešta kaip klaida, o ne tyliai priimta. Failo neliečiame — keičiame
# modulio lygio žodyną ir jį atstatome.
saved = dict(vc.FIELD_LIMITS)
try:
    vc.FIELD_LIMITS["concept.big_idea"] = 260
    rep = vc.Report()
    vc.check_field_limits_against_standard(rep)
    caught = bool(rep.errors) and "nesutampa su standartu" in rep.errors[0]
finally:
    vc.FIELD_LIMITS.clear()
    vc.FIELD_LIMITS.update(saved)
check("P8 senoji riba 260 pranešta kaip klaida", caught,
      rep.errors[0][:120] if rep.errors else "tyla — norma nuslinktų nepastebėta")


# P9 — standarto eilutės dingimas (`Laukas` išimtas) turi būti klaida, ne tuščia
# lentelė: kitaip vartas tyliai nustoja tikrinti lauką (LL-37).
saved_doc = vc.STANDARD_DOC
tmp = pathlib.Path(sys.argv[0]).resolve().parent.parent / "docs/_probe_limits_tmp.md"
try:
    text = saved_doc.read_text(encoding="utf-8").replace("| `subtitle` |", "| `subtitleX` |")
    tmp.write_text(text, encoding="utf-8")
    vc.STANDARD_DOC = tmp
    rep = vc.Report()
    vc.check_field_limits_against_standard(rep)
    caught_doc = bool(rep.errors) and "nerasta visų" in rep.errors[0]
finally:
    vc.STANDARD_DOC = saved_doc
    if tmp.exists():
        tmp.unlink()
check("P9 dingusi §2 eilutė pranešta", caught_doc,
      rep.errors[0][:110] if rep.errors else "tyla")


# P10 — klaidų sluoksniavimas: `index.json` nesutapimas negali nuslopinti
# likusios modulio patikros. Iki #572 `check_module()` grįždavo, jei paskutinėse
# klaidose buvo bet kokia šio failo eilutė, tad viena indekso klaida slėpė
# subtitle ribą, trukmę ir užduočių skaičių (LL-37).
mod = ROOT / "content/lt/grade-01/matematika/04-skaiciu-tiese.json"
data = copy.deepcopy(BASE)
data["subtitle"] = "Ž" * (vc.FIELD_LIMITS["subtitle"] + 10)
data["tasks"] = data["tasks"][:2]
rep = vc.Report()
vc.check_index_matches_module(
    {"id": data["id"], "title": data["title"], "subtitle": "Senas",
     "minutes": data["minutes"], "sim": (data.get("sim") or {}).get("component")},
    data, mod, rep,
)
n_index = len(rep.errors)
vc.check_module(mod, data, rep, vc.registered_sims(), {})
later = rep.errors[n_index:]
check(
    "P10 indekso klaida neslopina kitų patikrų",
    n_index >= 1 and any("subtitle" in e and "simbolių" in e for e in later)
    and any("užduočių" in e for e in later),
    f"vėlesnių klaidų {len(later)}",
)

print()
if fails:
    print(f"NEPAVYKO ({len(fails)}/{runs}): " + "; ".join(fails))
    sys.exit(1)
print(f"Zondas: 0 nepavykę lūkesniai iš {runs}")
