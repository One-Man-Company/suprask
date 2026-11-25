#!/usr/bin/env python3
"""Zondas `run.already_built()` — paleidžiamas įrodymas (LL-36, #22168).

Kodėl šis failas egzistuoja
---------------------------
2026-11-18 eilė davė kūrėjui #347 pasiūlymą #19519 (metodas, tikslas
`22-medziai-krumai-zoles`), nors tą patį modulį jau sukūrė #346 (commit
4b411ea), o ideatoriaus tema #19399 jau buvo `done`. Modulis buvo vietoje,
visi vartai žali — vienintelis to paleidimo trūkumas buvo tai, kad eilė to
paties paprašė antrą kartą. Kūrėjas, norėdamas nepadaryti žalos, turėjo
rinktis tarp dublikato (gairių 4 klausimas — nedubliavimas) ir tuščio
paleidimo, o eilė abiem atvejais liko tokia pati.

Priežastis: būseną `new` keitė trys vietos, bet „ar jau padaryta“ tikrino tik
`kurejas_queue.triage()` — eilės kelias. Tiesioginis `--proposal` paleidimas
(dashboard, rankinis) tos patikros neturėjo, o `mark_implemented()` reikalauja
pakeisto tikslo TAME PAČIAME commite, kurio jau padarytam darbui nėra.

Zondas tikrina **abiem kryptimis**, nes taisyklė gali pakenkti dviem būdais:

  A1 „tema“ su tikslu, sukurtu PO prašymo → laikoma įgyvendinta
  A2 „metodas“ — taip pat (tai buvo tikrasis #22168 atvejis)
  A3 „kritika“ su egzistuojančiu tikslu → NElaikoma įgyvendinta (ji taiso,
     o ne kuria; be šito visos kritikos pastabos užsidarytų vien todėl,
     kad failas yra)
  A4 „ux“ — taip pat ne
  A5 tikslo failo nėra → niekada ne „jau įgyvendinta“
  A6 tikslas sukurtas PRIEŠ prašymą → ne „jau įgyvendinta“ (kritika gali
     ateiti vėliau už modulį ir būti teisinga)
  A7 tuščias / neįskaitomas tikslas ar data → saugus „ne“, ne klaida
  A8 reali repo data: `22-medziai-krumai-zoles.json` su #19519 data → taip
     (tai įrodo, kad taisyklė tikrai išsprendžia užregistruotą atvejį)

Be tinklo. Naudoja `git log --diff-filter=A`, kuris veikia vietiniame repo;
kai istorijos nėra (šviežias klonas be `.git`), grąžinama „ne“ su priežastimi,
o ne klaida.

Naudojimas:
    python3 scripts/probe_already_built.py      # 0 — visi lūkesčiai išsipildė
"""

from __future__ import annotations

import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(ROOT / "agents"))

import run as runner  # noqa: E402

results: list[tuple[str, bool, str]] = []


def case(name: str, ok: bool, detail: str) -> None:
    results.append((name, ok, detail))
    print(f"{'✔' if ok else 'KLAIDA'} {name} — {detail}")


def main() -> int:
    real = "content/lt/grade-01/pasaulio-pazinimas/22-medziai-krumai-zoles.json"
    # Data sąmoningai ankstyva: bet kuris repo modulis po jos yra „sukurtas po“.
    early = "2026-11-01T00:00:00+02:00"
    # Data, kuri yra po visų repo commit'ų — nieko negali būti sukurta po jos.
    late = "2030-01-01T00:00:00+02:00"

    got, why = runner.already_built(real, early, "tema")
    case("A1 tema su vėliau sukurtu tikslu — įgyvendinta", got, why)

    got, why = runner.already_built(real, early, "metodas")
    case("A2 metodas — tas pats (#22168 atvejis)", got, why)

    got, why = runner.already_built(real, early, "kritika")
    case("A3 kritika NElaikoma įgyvendinta", not got, why)

    got, why = runner.already_built(real, early, "ux")
    case("A4 ux NElaikomas įgyvendintu", not got, why)

    got, why = runner.already_built("content/lt/grade-01/pasaulio-pazinimas/99-nera.json",
                                   early, "tema")
    case("A5 nesamo tikslo niekada nelaiko įgyvendintu", not got, why)

    got, why = runner.already_built(real, late, "tema")
    case("A6 tikslas sukurtas PRIEŠ prašymą — ne", not got, why)

    bad = [
        runner.already_built("", early, "tema"),
        runner.already_built(real, "", "tema"),
        runner.already_built(real, "ne-data", "tema"),
        runner.already_built(real, early, ""),
    ]
    case("A7 tuščias tikslas/data ir nežinomas tipas — saugus 'ne'",
         all(not ok for ok, _ in bad),
         "; ".join(w[:60] for _, w in bad))

    # A8 — tikrasis #22168 atvejis su tikra pasiūlymo data.
    got, why = runner.already_built(real, "2026-11-16T08:10:00+02:00", "metodas")
    case("A8 #19519 data + 22-medziai → įgyvendinta", got, why)

    # A9 — simetrija su eilės keliu: `kurejas_queue` naudoja TĄ PAČIĄ funkciją,
    # o ne savo kopiją. Tai vienintelis būdas, kuriuo abu keliai negali išsiskirti.
    sys.path.insert(0, str(ROOT / "scripts"))
    try:
        import kurejas_queue as kq
        src = pathlib.Path(kq.__file__).read_text(encoding="utf-8")
        same = "runner.already_built" in src
    except Exception as exc:  # noqa: BLE001
        same, src = False, str(exc)
    case("A9 eilė kviečia tą pačią funkciją", same,
         "kurejas_queue.triage() naudoja runner.already_built()" if same else "kopija!")

    ok = sum(1 for _, good, _ in results if good)
    print(f"\n{ok}/{len(results)} lūkesčių išsipildė")
    return 0 if ok == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())
