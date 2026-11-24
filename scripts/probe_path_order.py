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

K1–K6 (paleidimas #486, pasiūlymas #42399) tikrina patį CI režimą
`path_order_gate()`. Jam neužtenka „funkcija grąžina sąrašą“: vartai, kurie
šviežiame klone lygintų su `HEAD`, būtų žali visada (ten `HEAD` **yra** darbinė
kopija). Todėl zondas tikrina ir rc, ir tai, kad be užfiksuotos sekos rezultatas
yra „neišmatuota“ su rc 1, o ne tyli žalia.

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

        # B2. Riba, nuo kurios priklauso visas skirtumas: naujas ID **prieš**
        #     paskutinį seną yra „viduryje“, **po** jo — „gale“. Be šio
        #     lūkesčio J galėtų būti žalias ir tada, kai įrankis traktuoja
        #     paskutinę poziciją kaip vidurį.
        before_last = BASE[:-1] + ["a-98"] + BASE[-1:]
        after_last = BASE + ["a-97"]
        mid_out = cp.path_order_check(1, before_last)
        tail_out = cp.path_order_check(1, after_last)
        check("B2 riba prie paskutinio seno ID: prieš — viduryje, po — gale",
              mid_out["path_inserted_midsequence"] == ["a-98"]
              and tail_out["path_inserted_midsequence"] == [],
              f"prieš={mid_out['path_inserted_midsequence']} "
              f"po={tail_out['path_inserted_midsequence']}")

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

        # J. Tikras repo: užfiksuota seka egzistuoja, o path.json gali turėti
        # naujų ID, įterptų sąmoningai (pagal AGENTS.md leidžiama, jei esama
        # tvarka nesikeičia). Todėl tikrinama: visi užfiksuoti ID yra, nė vienas
        # nepajudėtas, o kiekvienas papildomas **viduryje** įvardytas kaip
        # įterptas. Skaičių lyginti negalima — po užfiksavimo (2026-11-23)
        # kūrėjas į 1 klasę įdėjo 5 modulius, tad lygybė tapo neteisingu
        # lūkesčiu, o raudoni vartai dėl teisingo darbo moko juos apeiti
        # (LL-38 — slenkstis, nuslinkęs nuo duomenų).
        #
        # Lūkestis skaičiuojamas TOMIS PAČIOMIS taisyklėmis kaip įrankis:
        # `inserted_midsequence()` matuoja **poziciją** (naujas ID prieš
        # paskutinį seną), o ne aibės skirtumą. 2026-11-24 būtent čia zondas
        # ir supuvo: 5 nauji ID, 4 jų viduryje, 1 gale, o lūkestis ėmė visą
        # aibės skirtumą (5) — zondas tapo raudonas dėl teisingo repo, o kad
        # jo niekas nepaleido CI, to niekas nematė (LL-182).
        cp.PATH_ORDER = original
        real_pin = json.loads(original.read_text(encoding="utf-8"))
        real_seq = list((real_pin.get("grades") or {}).get("1", {}).get("sequence") or [])
        path_seq = json.loads((ROOT / "content/lt/grade-01/path.json").read_text(encoding="utf-8"))["sequence"]
        out = cp.path_order_check(1, path_seq)
        new_ids = [m for m in path_seq if m not in set(real_seq)]
        pos = {m: i for i, m in enumerate(path_seq)}
        last_old = max((pos[m] for m in real_seq if m in pos), default=-1)
        expected_mid = [m for m in new_ids if pos[m] < last_old]
        expected_tail = [m for m in new_ids if pos[m] > last_old]
        check("J repo 1 klasės seka užfiksuota, seni ID nepajudėti",
              bool(real_seq) and out["path_order_checked"] is True
              and out["path_reordered"] == []
              and sorted(out["path_inserted_midsequence"]) == sorted(expected_mid)
              and set(real_seq) <= set(path_seq),
              f"pin={len(real_seq)} path={len(path_seq)} "
              f"viduryje={len(out['path_inserted_midsequence'])}/{len(expected_mid)} "
              f"gale={len(expected_tail)} "
              f"label={out['path_order_baseline'][:40]!r}")

        # J2. Ta pati riba neigiamai: ID, prirašytas **gale**, neturi būti
        #     įvardytas kaip įterptas į vidurį. Būtent šios dvi krūvos
        #     sumaišymas ir padarė J raudoną (aibė ≠ pozicija).
        check("J2 prirašytas gale nėra „įterptas į vidurį“",
              all(m not in out["path_inserted_midsequence"] for m in expected_tail),
              f"gale={expected_tail or '—'} "
              f"viduryje={sorted(out['path_inserted_midsequence'])}")

        # K. CI režimas `--path-order` (pasiūlymas #42399). Lyginama TIK su
        #    užfiksuota seka: šviežiame klone `HEAD` yra darbinė kopija, tad
        #    HEAD fallback'as duotų žalią visada.
        import contextlib
        import io

        cp.PATH_ORDER = pin
        gate_seq = json.loads(
            (ROOT / "content/lt/grade-01/path.json").read_text(encoding="utf-8"))["sequence"]
        write_pin(pin, 1, gate_seq)
        gate = cp.path_order_gate(1)
        check("K1 užfiksuota seka = path.json → ok, išmatuota",
              gate["ok"] is True and gate["checked"] is True
              and gate["reordered"] == [] and not gate["error"]
              and gate["sequence_len"] == len(gate_seq),
              f"ok={gate['ok']} checked={gate['checked']} n={gate['sequence_len']}")

        moved_seq = gate_seq[:]
        moved_id = moved_seq.pop(40)
        moved_seq.insert(3, moved_id)
        write_pin(pin, 1, moved_seq)
        gate = cp.path_order_gate(1)
        check("K2 realus perstatymas → ok False, įvardytas būtent jis",
              gate["ok"] is False and gate["checked"] is True
              and moved_id in gate["reordered"],
              f"ok={gate['ok']} reordered={gate['reordered']} perkeltas={moved_id}")

        pin.unlink()
        gate = cp.path_order_gate(1)
        check("K3 nėra užfiksuotos sekos → ok False, o ne tyli žalia",
              gate["ok"] is False and gate["checked"] is False
              and "NEIŠMATUOTA" in gate["note"],
              f"ok={gate['ok']} checked={gate['checked']} note={gate['note'][:50]!r}")

        write_pin(pin, 1, gate_seq)
        gate = cp.path_order_gate(99)
        check("K4 nėra path.json → ok False su priežastimi, ne išimtis",
              gate["ok"] is False and "neperskaitytas" in gate["error"],
              f"ok={gate['ok']} error={gate['error'][:50]!r}")

        # K5. rc yra tai, kuo remiasi CI (LL-10 — statusas pagal išėjimo kodą).
        write_pin(pin, 1, gate_seq)
        buf_ok = io.StringIO()
        with contextlib.redirect_stdout(buf_ok):
            rc_ok = cp.path_order_main(1, False)
        write_pin(pin, 1, moved_seq)
        buf_bad = io.StringIO()
        with contextlib.redirect_stdout(buf_bad):
            rc_bad = cp.path_order_main(1, False)
        check("K5 rc 0 kai tvarka gera, rc 1 kai pajudėta (ir ID pranešime)",
              rc_ok == 0 and rc_bad == 1 and moved_id in buf_bad.getvalue()
              and "NEIŠMATUOTA" not in buf_ok.getvalue(),
              f"rc_ok={rc_ok} rc_bad={rc_bad} id_pranešime={moved_id in buf_bad.getvalue()}")

        # K6. Režimas turi būti BE git ir BE tinklo — kitaip jis CI klone matuotų
        #     ne tą patį. Zondas uždraudžia abu kvietimus ir tikisi rc 0.
        write_pin(pin, 1, gate_seq)

        def boom(*a, **k):
            raise AssertionError("maršruto tvarkos režimas palietė git arba tinklą")

        real_run, real_urlopen = cp.subprocess.run, cp.urllib.request.urlopen
        cp.subprocess.run, cp.urllib.request.urlopen = boom, boom
        try:
            buf = io.StringIO()
            with contextlib.redirect_stdout(buf):
                rc_offline = cp.path_order_main(1, False)
        finally:
            cp.subprocess.run, cp.urllib.request.urlopen = real_run, real_urlopen
        check("K6 režimas be git ir be tinklo → rc 0, visi žingsniai",
              rc_offline == 0 and f"{len(gate_seq)} žingsnių" in buf.getvalue(),
              f"rc={rc_offline} laukta {len(gate_seq)} žingsnių, "
              f"išvestis={buf.getvalue().strip()[:60]!r}")
    finally:
        cp.PATH_ORDER = original

    failed = [name for name, ok, _ in results if not ok]
    print(f"\n{len(results) - len(failed)}/{len(results)} lūkesčių išsipildė")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
