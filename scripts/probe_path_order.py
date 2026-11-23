#!/usr/bin/env python3
"""Zondas `check_published.py` ėjimo tvarkos patikrai — pakartojamas, be tinklo.

Kodėl šis failas egzistuoja (LL-36, LL-21). #41652 prašė, kad įrankis matytų
ne tik `path.json` **aibę**, bet ir **santykinę tvarką**: kai modulis
perkeliamas, visi skaičiai pranešime sutampa, o vaiko „Tęsk nuo čia“ taškas
persikelia. Tokios patikros negalima palikti vien docstring'e: teiginys
„perstatymas dabar raudonas“ turi turėti paleidžiamą įrodymą, kuris išlieka
repo (todėl `scratch/` zondai čia netinka — jų repo istorijoje nėra).

Zondas tikrina `reordered_ids()`, `inserted_midsequence()`,
`path_order_baseline()` ir `path_order_check()` su **laikinu** užfiksuotos
tvarkos failu. Repo failai nekeičiami, tinklo užklausų nėra.

Naudojimas:
    python3 scripts/probe_path_order.py      # 0 — visi lūkesčiai išsipildė
"""

from __future__ import annotations

import json
import pathlib
import sys
import tempfile

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))

import check_published as cp  # noqa: E402

results: list[tuple[str, bool, str]] = []


def check(name: str, ok: bool, detail: str) -> None:
    results.append((name, ok, detail))
    print(f"{'OK  ' if ok else 'KLAIDA'} {name} — {detail}")


def write_pin(path: pathlib.Path, grade: int, seq: list[str],
              when: str = "2026-11-23T00:00:00+02:00") -> None:
    data = {"note": "zondo laikina seka", "grades": {str(grade): {
        "accepted_at": when, "note": "zondas", "sequence": seq}}}
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")


def ordered(seq: list[str], subset: list[str]) -> bool:
    """Ar `subset` ID pasirodo `seq` tokia pačia santykine tvarka."""
    pos = {m: i for i, m in enumerate(seq)}
    got = [pos[m] for m in subset if m in pos]
    return got == sorted(got)


BASE = ["a-01", "a-02", "a-03", "a-04", "a-05", "a-06"]


def main() -> int:
    tmp = pathlib.Path(tempfile.mkdtemp(prefix="suprask-path-order-"))
    pin = tmp / "known_path_order.json"
    original = cp.PATH_ORDER
    cp.PATH_ORDER = pin  # zondas kalba su laikinu failu, ne su repo

    try:
        # A. Užfiksuota seka = dabartinė seka → jokio trūkumo.
        write_pin(pin, 1, BASE)
        out = cp.path_order_check(1, BASE)
        check("A tvarka sutampa su užfiksuota",
              out["path_reordered"] == [] and out["path_inserted_midsequence"] == []
              and out["path_order_checked"] is True,
              f"reordered={out['path_reordered']} inserted={out['path_inserted_midsequence']}")

        # B. Naujas modulis prirašytas gale → aibė auga, tvarka nepajudėta.
        grown = BASE + ["a-07"]
        out = cp.path_order_check(1, grown)
        check("B prirašymas gale nėra perstatymas",
              out["path_reordered"] == [] and out["path_inserted_midsequence"] == [],
              f"reordered={out['path_reordered']} inserted={out['path_inserted_midsequence']}")

        # C. Naujas modulis įterptas į vidurį → geltona, bet ne raudona.
        out = cp.path_order_check(1, BASE[:3] + ["a-99"] + BASE[3:])
        check("C įterpimas viduryje matomas kaip inserted_midsequence",
              out["path_reordered"] == [] and out["path_inserted_midsequence"] == ["a-99"],
              f"reordered={out['path_reordered']} inserted={out['path_inserted_midsequence']}")

        # D. Du gretimi seni ID sukeisti → raudona, įvardytas bent vienas.
        swapped = BASE[:]
        swapped[2], swapped[3] = swapped[3], swapped[2]
        out = cp.path_order_check(1, swapped)
        check("D gretimų ID sukeitimas yra perstatymas",
              len(out["path_reordered"]) == 1
              and out["path_reordered"][0] in ("a-03", "a-04"),
              f"reordered={out['path_reordered']}")

        # E. Modulis perkeltas iš galo į vidurį → įvardytas būtent jis.
        moved = BASE[:2] + ["a-06"] + BASE[2:5]
        out = cp.path_order_check(1, moved)
        check("E perkeltas ID įvardytas tiksliai",
              out["path_reordered"] == ["a-06"],
              f"reordered={out['path_reordered']}")

        # F. Išėmus vieną seną ID, likusių tvarka nesikeičia → ne perstatymas.
        removed = [m for m in BASE if m != "a-03"]
        out = cp.path_order_check(1, removed)
        check("F pašalintas ID nėra perstatymas",
              out["path_reordered"] == [] and out["path_inserted_midsequence"] == [],
              f"reordered={out['path_reordered']} inserted={out['path_inserted_midsequence']}")

        # G. Teiginio invariantas: pašalinus `path_reordered`, likusi seka
        #    tikrai atitinka užfiksuotą — kitaip pranešimas kaltintų ne tuos.
        shuffled = ["a-04", "a-01", "a-06", "a-02", "a-05", "a-03"]
        bad = cp.reordered_ids(shuffled, BASE)
        rest = [m for m in shuffled if m not in set(bad)]
        ok = ordered(BASE, rest) and len(bad) > 0
        check("G „pašalinus įvardytus ID tvarka atitinka ankstesnę“",
              ok, f"reordered={bad} likę={rest}")

        # H. Sekos failo nėra → patikra neapsimeta švaria: arba lyginama su
        #    HEAD ir tai pasakoma, arba `checked` lieka False su priežastimi.
        pin.unlink()
        real_path_seq = json.loads(
            (ROOT / "content/lt/grade-01/path.json").read_text(encoding="utf-8"))["sequence"]
        out = cp.path_order_check(1, real_path_seq)
        note_h = out.get("path_order_note", "")
        check("H1 be užfiksuotos sekos pasakoma, kad apsauga neįjungta",
              out["path_order_checked"] is True
              and "known_path_order" in note_h
              and "HEAD" in out["path_order_baseline"],
              f"label={out['path_order_baseline']!r} note={note_h[:60]!r}")
        shuffled_real = real_path_seq[:]
        shuffled_real[3], shuffled_real[4] = shuffled_real[4], shuffled_real[3]
        out = cp.path_order_check(1, shuffled_real)
        check("H2 necommitintas pakeitimas lyginamas su HEAD",
              out["path_order_checked"] is True
              and "HEAD" in out["path_order_baseline"]
              and len(out["path_reordered"]) > 0,
              f"label={out['path_order_baseline']!r} reordered={len(out['path_reordered'])}")
        out = cp.path_order_check(99, BASE)
        check("H3 nėra nei sekos, nei HEAD failo → checked False, ne „gera“",
              out["path_order_checked"] is False and "neužfiksuota" in out.get("path_order_note", ""),
              f"checked={out['path_order_checked']} note={out.get('path_order_note', '')[:60]!r}")

        # I. Sugadintas sekos failas nesugriauna įrankio.
        pin.write_text("{ ne json", encoding="utf-8")
        out = cp.path_order_check(1, BASE)
        check("I sugadintas sekos failas neša išimtį",
              isinstance(out, dict) and out["path_reordered"] == [],
              f"checked={out['path_order_checked']} note={out.get('path_order_note', '')[:60]!r}")

        # J. Tikras repo: užfiksuota seka egzistuoja ir sutampa su path.json.
        cp.PATH_ORDER = original
        real_pin = json.loads(original.read_text(encoding="utf-8"))
        real_seq = list((real_pin.get("grades") or {}).get("1", {}).get("sequence") or [])
        path_seq = json.loads((ROOT / "content/lt/grade-01/path.json").read_text(encoding="utf-8"))["sequence"]
        out = cp.path_order_check(1, path_seq)
        check("J repo 1 klasės seka užfiksuota ir sutampa",
              bool(real_seq) and out["path_order_checked"] is True
              and out["path_reordered"] == [] and out["path_inserted_midsequence"] == []
              and len(real_seq) == len(path_seq),
              f"pin={len(real_seq)} path={len(path_seq)} label={out['path_order_baseline'][:40]!r}")
    finally:
        cp.PATH_ORDER = original

    failed = [name for name, ok, _ in results if not ok]
    print(f"\n{len(results) - len(failed)}/{len(results)} lūkesčių išsipildė")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
