#!/usr/bin/env python3
"""Zondas: ar wiki krypties lentelė nustoja tylėti apie pervardintą modulį, ir ar
`curriculum_backlog.py --check` mato išvestinius laukus, ne tik šaltinio maišą.

Be tinklo, < 0,2 s; įsijungia į CI `probe_*.py` ciklą.

Būsena iki #594. Du atskiri vartai buvo žali prieš akivaizdų defektą:

1. `check_docs_facts.check_wiki_table()` susiedavo wiki įrašą su moduliu tik
   pagal PIRMĄ pavadinimo žodį. Todėl „Bendradarbiavimo tiltas“ buvo laikomas
   modulio „Tiltas: kai dirbame kartu“ įrašu, o „Komandų seka: viena klaida
   pakreipia kelią“ — modulio „…nuveda ne ten“. Pervadinimas po dvitaškio
   vartams buvo nematomas, o wiki liko antruoju pavadinimo šaltiniu.
2. `curriculum_backlog.py --check` lygino TIK `source_hash`, o tas maišas
   imamas iš `research/wiki/curriculum/*.md`. Todėl `modules_now` (vienintelis
   šio failo kiekis, kurį `agents/run.py` `_backlog_brief()` įdeda į agento
   promptą) galėjo skirtis nuo `content/` tiek, kiek nori — ir vartas sakydavo
   „✔ eilė suderinta“.

Kiekvienas lūkesnis turi neigiamą kontrolę: defektas privalo būti pagautas,
švarus atvejis — ne. Zondas krenta (rc 1), jei bent vienas lūkesnis neišsipildo.
"""
from __future__ import annotations

import copy
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import check_docs_facts as docs  # noqa: E402
import curriculum_backlog as backlog  # noqa: E402

fails: list[str] = []
runs = 0


def check(name: str, ok: bool, detail: str = "") -> None:
    global runs
    runs += 1
    print(("✔" if ok else "✗"), name, ("— " + detail if detail else ""))
    if not ok:
        fails.append(name)


# ---------------------------------------------------------------- 1. wiki lentelė

STRAND = {
    "title": "Sąžiningumas ir žaidimai",
    "modules": ["Sąžiningas dalijimasis", "Tiltas: kai dirbame kartu"],
}


def wiki_report(items: str) -> docs.Check:
    text = f"| Kryptis | Moduliai | Būsena |\n|---|---|---|\n| Sąžiningumas ir žaidimai | {items} | 2 — gyva |\n"
    rep = docs.Check()
    import contextlib
    import io
    with contextlib.redirect_stdout(io.StringIO()):
        docs.check_wiki_table(rep, "wiki", text, {"strands": [STRAND]})
    return rep


# W1 — tikras (naujas) vardas praeina. Teigiama kontrolė.
rep = wiki_report("Sąžiningas dalijimasis · Tiltas: kai dirbame kartu")
check("W1 tikri vardai praeina", not rep.errors,
      rep.errors[0] if rep.errors else "0 klaidų")

# W2 — senas vardas TURI būti pagautas. Iki #594 buvo tyla.
rep = wiki_report("Sąžiningas dalijimasis · Bendradarbiavimo tiltas")
check("W2 senas vardas „Bendradarbiavimo tiltas“ pagautas",
      len(rep.errors) == 1 and "bendradarbiavimo" in rep.errors[0],
      rep.errors[0][:110] if rep.errors else "tyla — senas vardas liko amžinai")

# W3 — žmogaus santrumpa (tikro vardo POAIBIS) ir toliau praeina: vartas neturi
# priversti perrašyti žmogaus formuluotės, tik seną vardą.
STRAND_SHORT = {"title": "Matematika", "modules": ["Figūros aplink mus"]}
text = "| Matematika | Figūros | 1 — gyva |\n"
import contextlib
import io
rep = docs.Check()
with contextlib.redirect_stdout(io.StringIO()):
    docs.check_wiki_table(rep, "wiki", text, {"strands": [STRAND_SHORT]})
check("W3 santrumpa „Figūros“ (poaibis) praeina", not rep.errors,
      rep.errors[0] if rep.errors else "0 klaidų")

# W4 — vardas su žodžiu, kurio PAVADINIME nėra, net jei pirmas žodis sutampa.
STRAND_CS = {"title": "Matematika", "modules": ["Komandų seka: viena klaida nuveda ne ten"]}
text = "| Matematika | Komandų seka: viena klaida pakreipia kelią | 1 — gyva |\n"
rep = docs.Check()
with contextlib.redirect_stdout(io.StringIO()):
    docs.check_wiki_table(rep, "wiki", text, {"strands": [STRAND_CS]})
check("W4 pirmas žodis tas pats, bet senas vardas pagautas",
      len(rep.errors) == 1 and "pakreipia" in rep.errors[0],
      rep.errors[0][:110] if rep.errors else "tyla")

# W5 — keli kandidatai su tuo pačiu pirmu žodžiu: artimesnis turi būti
# pasirinktas, o ne pirmas sąraše.
STRAND_MANY = {"title": "Pasaulio pažinimas",
               "modules": ["Kas gyvena tvarte?", "Kas gyvas: auga ir reaguoja, ne tik juda"]}
text = ("| Pasaulio pažinimas | Kas gyvena tvarte? · Kas gyvas: auga ir reaguoja, "
        "ne tik juda | 2 — gyva |\n")
rep = docs.Check()
with contextlib.redirect_stdout(io.StringIO()):
    docs.check_wiki_table(rep, "wiki", text, {"strands": [STRAND_MANY]})
check("W5 artimiausias kandidatas pasirenkamas", not rep.errors,
      rep.errors[0][:110] if rep.errors else "0 klaidų")


# ------------------------------------------------- 1b. README lentelė (#64267)
# Ta pati lentelės forma, kitas dokumentas. Iki taisymo `check_readme()` lygino
# TIK pirmą žodį, tad pervardinto modulio pėdsakas README likdavo amžinai
# (LL-239). Sąlyga dabar iškelta į `docs.table_entry()` — vienas šaltinis
# abiem skaitytojams, o lūkesniai privalo įrodyti, kad abu jį naudoja.

README_FIXED = {
    "strands": [STRAND],
    "strand_count": 1, "module_count": 2, "sim_count": 1,
    "task_count": 1, "task_min": 1, "task_max": 1,
    "audio_texts": 1, "audio_files": 1, "audio_mb": 1,
    # Vaidmenų skaičius turi sutapti su žodžiu (README rašo žodžiu), todėl
    # imamas devynių vaidmenų sąrašas ir devynios lentelės eilutės.
    "roles": ["kurejas", "metodininkas", "ideator", "kritikas", "tikrintojas",
              "tyrejas", "leidejas", "dizaineris", "kuratorius"],
}


def readme_text(items: str, modules: str = "2") -> str:
    return (
        f"1 klasė — 1 kryptis, {modules} moduliai, 1 interaktyvi simuliacija\n"
        "| Kryptis | Moduliai |\n|---|---|\n"
        f"| Sąžiningumas ir žaidimai | {items} |\n"
        "Modulio aprašymas: 1 užduotys\n"
        f"| Parengta | 1 | {modules} | 1 | 1 |\n"
        "Garso: 1 tekstų, 1 įrašų, ~1 MB · lt_LT-reginute1 · CC BY 4.0 · LIEPA · "
        "Robertas Tarasevičius\n"
        "Platformą nuolat vysto devyni agentų\n"
        + "".join(f"| `{role}` |\n" for role in README_FIXED["roles"])
    )


def readme_report(items: str, modules: str = "2") -> docs.Check:
    rep = docs.Check()
    import contextlib
    import io
    with contextlib.redirect_stdout(io.StringIO()):
        docs.check_readme(rep, readme_text(items, modules),
                          {**README_FIXED, "module_count": int(modules)})
    return rep


# R1 — tikri vardai praeina (teigiama kontrolė: taisymas neturi kelti triukšmo).
rep = readme_report("Sąžiningas dalijimasis · Tiltas: kai dirbame kartu")
check("R1 README: tikri vardai praeina", not rep.errors,
      rep.errors[0][:110] if rep.errors else "0 klaidų")

# R2 — senas vardas README TURI būti pagautas. Iki #64267 buvo tyla.
rep = readme_report("Sąžiningas dalijimasis · Bendradarbiavimo tiltas")
check("R2 README: senas vardas „Bendradarbiavimo tiltas“ pagautas",
      any("bendradarbiavimo" in e or "seno vardo" in e for e in rep.errors),
      rep.errors[0][:110] if rep.errors else "tyla — README liko senas vardas")

# R3 — žmogaus santrumpa (poaibis) ir README praeina. NEGALI praeiti dėl kitos
# priežasties: jei eilutė nerasta, `check_readme()` praneša „lentelėje nėra
# krypties“ — todėl lūkesnis reikalauja, kad klaidų būtų NULIS, o poaibio
# įrašas būtų surastas (`table_entry` grąžina patį įrašą).
STRAND_ONE = {"title": "Sąžiningumas ir žaidimai", "modules": ["Figūros aplink mus"]}
rep = docs.Check()
import contextlib
import io
with contextlib.redirect_stdout(io.StringIO()):
    docs.check_readme(rep, readme_text("Figūros", "1"),
                      {**README_FIXED, "strands": [STRAND_ONE],
                       "module_count": 1, "strand_count": 1})
entry, extra = docs.table_entry(["Figūros"], "Figūros aplink mus")
check("R3 README: santrumpa „Figūros“ (poaibis) praeina",
      not rep.errors and entry == "Figūros" and not extra,
      "; ".join(rep.errors)[:110] if rep.errors else f"įrašas {entry!r}, 0 klaidų")

# R4 — sinchronizatorius ir vartas renka TĄ PATĮ įrašą. Du moduliai su tuo
# pačiu pirmu žodžiu (`kas`), o dokumente — trumpesnis įrašas. Senasis
# `next(...)` ėmė PIRMĄ modulį („Kas gyvena tvarte?“) ir, matydamas, kad
# įraše yra žodžių, kurių tame pavadinime nėra, pervadintų jį — t. y.
# sinchronizatorius sugadintų teisingą eilutę. Dabar renkama pagal
# `title_similarity`, kaip vartas.
import sync_docs_facts as sync  # noqa: E402
kept, added, dropped = sync.align_items(
    ["Kas gyvas: auga ir reaguoja"],
    ["Kas gyvena tvarte?", "Kas gyvas: auga ir reaguoja, ne tik juda"],
)
check("R4 sync renka artimiausią įrašą, o ne pirmą",
      kept == ["Kas gyvas: auga ir reaguoja", "Kas gyvena tvarte?"]
      and added == ["Kas gyvena tvarte?"],
      f"{kept!r} + {added!r}")


# ------------------------------------------------------- 2. backlog --check

BASE = {
    "modules_now": 87,
    "curriculum_positions": 47,
    "counts": {"covered": 46, "partial": 0, "missing": 1},
    "rows": [
        {"section": "Programa", "key": "26.2.3", "topic": "medžiai",
         "status": "covered", "modules": ["22-medziai"], "target": ""},
    ],
}


# B1 — tas pats turinys: jokio dreifo (teigiama kontrolė).
check("B1 nesutrikęs backlog — 0 pranešimų",
      backlog.derived_drift(BASE, copy.deepcopy(BASE)) == [], "0")

# B2 — modules_now atsiliko (tai, ką proposal #60735 matavo: 84 vs 85).
stale = copy.deepcopy(BASE)
stale["modules_now"] = 84
drift = backlog.derived_drift(stale, BASE)
check("B2 modules_now 84 vs 87 pagautas",
      any("modules_now" in d and "84" in d for d in drift),
      "; ".join(drift)[:110] if drift else "tyla — agentas gauna du skaičius")

# B3 — eilutės statusas atsiliko (modulis sukurtas, backlog vis dar „missing“).
stale = copy.deepcopy(BASE)
stale["rows"][0]["status"] = "missing"
stale["counts"] = {"covered": 45, "partial": 0, "missing": 2}
drift = backlog.derived_drift(stale, BASE)
check("B3 eilutės statusas ir counts pagauti",
      any("status" in d for d in drift) and any("counts" in d for d in drift),
      "; ".join(drift)[:110] if drift else "tyla")

# B4 — eilutė atsirado / išnyko: negali likti nepastebėta (LL-37).
gone = copy.deepcopy(BASE)
gone["rows"] = []
drift = backlog.derived_drift(gone, BASE)
check("B4 išnykusi eilutė pagauta", any("atsirado" in d for d in drift),
      "; ".join(drift)[:110] if drift else "tyla")

# B5 — eilutės modulių sąrašas atsiliko.
stale = copy.deepcopy(BASE)
stale["rows"][0]["modules"] = ["22-medziai", "02-medziagu-bandymas"]
drift = backlog.derived_drift(stale, BASE)
check("B5 eilutės modulių sąrašas pagautas", any("modules" in d for d in drift),
      "; ".join(drift)[:110] if drift else "tyla")

# B6 — `--check` tikrai kviečia dreifo patikrą, o ne tik source_hash.
src = (ROOT / "scripts" / "curriculum_backlog.py").read_text(encoding="utf-8")
check("B6 main() --check kviečia derived_drift()",
      "drift = derived_drift(old, data)" in src, "rasta")

print()
if fails:
    print(f"NEPAVYKO ({len(fails)}/{runs}): " + "; ".join(fails))
    sys.exit(1)
print(f"Zondas: 0 nepavykę lūkesniai iš {runs}")
