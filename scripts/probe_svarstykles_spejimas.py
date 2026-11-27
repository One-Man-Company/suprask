#!/usr/bin/env python3
"""Vartas: svarstyklių spėjimas yra sąlyga ir palyginamas su rezultatu.

Kodėl šis failas egzistuoja
---------------------------
`16-lygybe-svarstykles` modulis `svietimas1` teigia „spėjimas prieš pirmą
judesį“, o simuliacija ilgai darė du dalykus kitaip, ir nė vienas vartas to
nematė (LL-15, LL-110):

  1. mygtukas „Pradedu dėti“ atrakindavo kubelius, nei vieno spėjimo
     neprašęs — spėjimas buvo laisvas veiksmas, tad jo galima nepadaryti;
  2. spėjimas buvo įrašomas į `api.note`, bet pirmos lygybės metu su niekuo
     nepaliginamas: vaikas nebepamatydavo, ar prognozė buvo teisinga.

Elgseną (kad spėjimas tikrai palyginamas ekrane) matuoja naršyklės zondas
`scratch/probe_sv578.py`; čia tikrinamos tos kodo formos, kurių
sugrąžinimas vėl įjungtų defektą. Bėga be tinklo ir be naršyklės (< 0,1 s),
todėl įsijungia į CI `probe_*.py` ciklą be workflow pakeitimo.
"""

from __future__ import annotations

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SIM = ROOT / "assets" / "js" / "sims" / "matematika.js"
MODULE = ROOT / "content" / "lt" / "grade-01" / "matematika" / "16-lygybe-svarstykles.json"

# Sim objekto ribos: nuo `const svarstyklesLygybe = {` iki sekančio `const`.
START = "const svarstyklesLygybe = {"


def sim_block(text: str) -> str:
    i = text.find(START)
    if i < 0:
        return ""
    nxt = text.find("\nconst ", i + len(START))
    return text[i:nxt if nxt > 0 else len(text)]


def strip_comments(text: str) -> str:
    """Komentarus šalinam: juose sąmoningai rašomi senų formų pavyzdžiai
    („`startAdding(NaN)` jo nebeleidžia“), ir zondas neturi jų skaityti kaip
    kodo. Be to, be šio žingsnio zondas baustų komentarą, o ne elgseną."""
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    return re.sub(r"//[^\n]*", "", text)


def check() -> list[str]:
    problems: list[str] = []
    src = SIM.read_text(encoding="utf-8")
    block = strip_comments(sim_block(src))
    if not block:
        return [f"nėra sim objekto `{START}` — zondas neturi ko tikrinti"]

    # T1: spėjimo negalima praleisti — nėra atrakinimo be reikšmės.
    if re.search(r"startAdding\(\s*NaN\s*\)", block):
        problems.append("T1: `startAdding(NaN)` tebėra — spėjimą galima praleisti (LL-110)")
    if re.search(r"startAdding\((?:undefined|null)\)", block):
        problems.append("T1: `startAdding(undefined/null)` — spėjimas nebūtinas")
    if not re.search(r"function startAdding\(n\)\s*\{[^}]{0,400}Number\.isFinite\(n\)", block, re.S):
        problems.append("T1: `startAdding()` netikrina, ar spėjimas tikrai duotas")

    # T2: spėjimas saugomas ir palyginamas su tuo, kas įvyko.
    if "let guess = null" not in block:
        problems.append("T2: nėra `guess` būsenos — spėjimas nepamenuojamas")
    if "function guessResult()" not in block:
        problems.append("T2: nėra `guessResult()` — spėjimas su rezultatu nepalyginamas (LL-15)")
    if not re.search(r"guessResult\(\)", block.split("function guessResult")[-1]):
        problems.append("T2: `guessResult()` apibrėžtas, bet ekrane nekviečiamas")
    if not re.search(r"\$\{guess\}", block):
        problems.append("T2: pranešime nėra vaiko spėjimo skaičiaus")
    if not re.search(r"box\}", block):
        problems.append("T2: palyginime nėra dėžutės skaičiaus — nėra su kuo lyginti")

    # T3: palyginimas vienkartinis (ne kas kadrą) ir tik pasiekus lygybę.
    if "let compared = false" not in block or "compared = true" not in block:
        problems.append("T3: palyginimas nekartojamas vieną kartą — trūksta `compared` vėliavėlės")
    if not re.search(r"if \(compared \|\| guess === null[^{]*\) return", block):
        problems.append("T3: `guessResult()` nepaiso `compared`/`guess` — sakinys kartosis")

    # T4: tuščias laukas nėra spėjimas 0 (`Number("") === 0`).
    if not re.search(r"if \(!String\(value \|\| \"\"\)\.trim\(\)\)", block):
        problems.append("T4: tuščias skaičiaus laukas priimamas kaip spėjimas 0")

    # T5: modulis teigia spėjimą — sąlyga ir toliau turi būti jo svietimas1.
    import json
    data = json.loads(MODULE.read_text(encoding="utf-8"))
    if not any("spėjim" in s.lower() for s in (data.get("svietimas1") or [])):
        problems.append("T5: modulis nebetvirtina spėjimo, o simuliacija jo reikalauja")
    return problems


def main() -> int:
    problems = check()
    if problems:
        print(f"KLAIDA: {len(problems)} problema(s)")
        for p in problems:
            print("  -", p)
        return 1
    print("✔ Spėjimas yra sąlyga, saugomas ir palyginamas su tuo, kas įvyko (vieną kartą).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
