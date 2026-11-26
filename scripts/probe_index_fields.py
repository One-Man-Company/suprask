#!/usr/bin/env python3
"""Zondas `validate_content.check_index_matches_module()` (#16892, LL-21 šeima).

Kodėl šis failas egzistuoja
---------------------------
Klasės sąrašo kortelė (`assets/js/app.js: title, subtitle, minutes`) ima laukus
iš `index.json`, o modulio puslapis tuos pačius laukus ima iš modulio JSON. Tai
dvi to paties teiginio kopijos, kurių iki šiol niekas nesulygino: validatorius
tikrino `id` ir `strand`, o `check_published.py` lygina failus su gyva
svetaine — ne failus tarpusavyje.

Pasiūlymas #16892 užregistruotas 2026-11-14, kai skirtumo nebuvo (82 moduliai,
0 nesutapimų). Tai latentinis, o ne šiandien matomas defektas — bet jei kas
nors pataisys trukmę tik modulio faile, vaikas sąraše matys „8 min.“, o
modulyje „10 min.“, ir nė vieni vartai to nepasakys.

Zondas tikrina ABEM kryptimis: ir tai, kad nesutapimas gaudomas, ir tai, kad
sutampantys laukai NĖRA klaidingai vadinami klaida (kitaip vartai būtų
triukšmas, o triukšmą agentai išmoksta apeiti).

  B1 sutampantys laukai → 0 klaidų (kontrolinė)
  B2 `minutes` skiriasi → klaida, įvardytas laukas ir abi reikšmės
  B3 `title` skiriasi → klaida
  B4 `subtitle` skiriasi → klaida
  B5 `sim` skiriasi (indekse tekstas, modulyje `sim.component`) → klaida
  B6 `sim` sutampa → 0 klaidų
  B7 trūkstamas laukas indekse → NE klaida (tai ne nesutapimas, o schema,
     kurią tikrina kitas vartas — vienas defektas, viena eilutė, LL-37)
  B8 tikras repo: visi klasės indekso įrašai lyginami su savo moduliais ir
     gaunama 0 klaidų (šiandien 82 moduliai) — įrodo, kad vartas įsijungia be
     triukšmo esamam turiniui

Naudojimas:
    python3 scripts/probe_index_fields.py     # 0 — visi lūkesčiai išsipildė
"""

from __future__ import annotations

import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))

import validate_content as vc  # noqa: E402

results: list[tuple[str, bool, str]] = []


def case(name: str, ok: bool, detail: str) -> None:
    results.append((name, ok, detail))
    print(f"{'✔' if ok else 'KLAIDA'} {name} — {detail}")


class FakePath:
    """Pakaitinis kelias: `relative_to(ROOT)` be tikro failo."""

    def __init__(self, rel: str) -> None:
        self.rel = rel

    def relative_to(self, other):  # noqa: ANN001, D401 — atkartoja pathlib API
        return self.rel


def run(entry: dict, data: dict) -> vc.Report:
    rep = vc.Report()
    vc.check_index_matches_module(entry, data, FakePath("content/lt/grade-01/x/y.json"), rep)
    return rep


def main() -> int:
    base_entry = {"id": "01-x", "title": "Garsas", "subtitle": "Kuo skiriasi",
                  "minutes": 8, "sim": "garso-raides"}
    base_mod = {"id": "01-x", "title": "Garsas", "subtitle": "Kuo skiriasi",
                "minutes": 8, "sim": {"component": "garso-raides"}}

    rep = run(base_entry, base_mod)
    case("B1 sutampantys laukai → 0 klaidų", not rep.errors,
         f"errors={len(rep.errors)}")

    entry = dict(base_entry, minutes=10)
    rep = run(entry, base_mod)
    case("B2 minutes skiriasi → klaida su abiem reikšmėm",
         len(rep.errors) == 1 and "minutes" in rep.errors[0] and "10" in rep.errors[0]
         and "8" in rep.errors[0],
         rep.errors[0][:80] if rep.errors else "klaidų nėra")

    entry = dict(base_entry, title="Garsai ir raidės")
    rep = run(entry, base_mod)
    case("B3 title skiriasi → klaida", len(rep.errors) == 1 and "title" in rep.errors[0],
         rep.errors[0][:70] if rep.errors else "klaidų nėra")

    entry = dict(base_entry, subtitle="Kita antraštė")
    rep = run(entry, base_mod)
    case("B4 subtitle skiriasi → klaida", len(rep.errors) == 1 and "subtitle" in rep.errors[0],
         rep.errors[0][:70] if rep.errors else "klaidų nėra")

    entry = dict(base_entry, sim="kita-simuliacija")
    rep = run(entry, base_mod)
    case("B5 sim skiriasi → klaida", len(rep.errors) == 1 and "sim" in rep.errors[0],
         rep.errors[0][:70] if rep.errors else "klaidų nėra")

    rep = run(dict(base_entry, sim="garso-raides"), base_mod)
    case("B6 sim sutampa → 0 klaidų", not rep.errors, f"errors={len(rep.errors)}")

    entry = {k: v for k, v in base_entry.items() if k != "subtitle"}
    rep = run(entry, base_mod)
    case("B7 trūkstamas laukas → NE klaida (schema — kito varto reikalas)",
         not rep.errors, f"errors={len(rep.errors)}")

    # B8: tikras repo — visi indekso įrašai prieš savo modulius.
    total = 0
    bad: list[str] = []
    for idx_path in sorted(vc.CONTENT.glob("grade-*/index.json")):
        index = json.loads(idx_path.read_text(encoding="utf-8"))
        for strand in index.get("strands", []):
            for m in strand.get("modules", []):
                mod_path = vc.CONTENT / str(m.get("file", ""))
                if not mod_path.exists():
                    bad.append(f"{m.get('id')}: modulio failo nėra")
                    continue
                data = json.loads(mod_path.read_text(encoding="utf-8"))
                total += 1
                rep = vc.Report()
                vc.check_index_matches_module(m, data, mod_path, rep)
                bad.extend(rep.errors)
    case("B8 tikras repo: 0 nesutapimų", total > 0 and not bad,
         f"modulių={total} klaidų={len(bad)}" + (f" · {bad[0][:70]}" if bad else ""))

    failed = [r for r in results if not r[1]]
    print(f"\n{len(results) - len(failed)}/{len(results)} lūkesčių išsipildė")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
