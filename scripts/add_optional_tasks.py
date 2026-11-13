#!/usr/bin/env python3
"""
Prideda po vieną praplėtimo („optional“) užduotį kiekvienam moduliui.
Pagal docs/SVIETIMAS-1-GAIRES.md T3.4 — greitesniems mokiniams turi būti
bent viena gilesnė užduotis.

Naudojimas: python3 scripts/add_optional_tasks.py [--write]
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "lt"

OPTIONAL = {
    "01-garsas-ir-raide": {
        "q": "Kuris žodis prasideda tuo pačiu garsu kaip „saulė“?",
        "options": ["siena", "žuvis", "medis"],
        "answer": 0,
        "hint": "Pasakyk abu žodžius garsiai ir klausykis pirmo garso.",
        "why": "„Saulė“ ir „siena“ prasideda garsu s.",
    },
    "02-skiemenu-jungimas": {
        "q": "Kuris žodis turi tris skiemenis?",
        "options": ["obuolys", "mama", "pilis"],
        "answer": 0,
        "hint": "Suplok žodį ir suskaičiuok plojimus.",
        "why": "O-buo-lys — trys skiemenys.",
    },
    "03-sakinio-tvarka": {
        "q": "Kuris sakinys parašytas tvarkingai?",
        "options": ["Vaikai žaidžia kieme.", "vaikai žaidžia kieme.", "Vaikai žaidžia kieme"],
        "answer": 0,
        "hint": "Pažiūrėk į pirmą raidę ir pabaigą.",
        "why": "Sakinys prasideda didžiąja raide ir baigiasi tašku.",
    },
    "04-skaiciu-tiese": {
        "q": "Pradedi nuo 15 ir atimi 4. Kur atsidursi?",
        "options": ["11", "19", "12"],
        "answer": 0,
        "hint": "Keturi žingsniai į kairę nuo 15.",
        "why": "15 − 4 = 11.",
    },
    "05-desimtukas": {
        "q": "Dešimtuke trys langeliai tušti. Kiek obuolių yra?",
        "options": ["7", "3", "10"],
        "answer": 0,
        "hint": "Suskaičiuok pilnus langelius, ne tuščius.",
        "why": "10 − 3 = 7.",
    },
    "06-figuros": {
        "q": "Kuri figūra turi keturias lygias kraštines?",
        "options": ["Kvadratas", "Trikampis", "Apskritimas"],
        "answer": 0,
        "hint": "Suskaičiuok kraštines ir palygink jų ilgį.",
        "why": "Kvadrato visos keturios kraštinės lygios.",
    },
    "07-desningumai": {
        "q": "Seka: 2, 4, 6, 8, … Kas toliau?",
        "options": ["10", "9", "12"],
        "answer": 0,
        "hint": "Kiek pridedama kiekvieną kartą?",
        "why": "Kiekvieną kartą pridedama po 2, todėl toliau 10.",
    },
    "08-metu-laikai": {
        "q": "Kodėl pavasarį paukščiai grįžta?",
        "options": ["Nes atšyla ir yra maisto", "Nes jie pavargo", "Nes žiema ilga"],
        "answer": 0,
        "hint": "Pagalvok, ko paukščiui reikia, kad galėtų perėti jauniklius.",
        "why": "Šiluma ir maistas leidžia perėti jauniklius.",
    },
    "09-augalo-gyvenimas": {
        "q": "Kodėl augalas prie lango auga geriau nei spintoje?",
        "options": ["Nes gauna daugiau šviesos", "Nes jis didesnis", "Nes jį dažniau liečia"],
        "answer": 0,
        "hint": "Palygink, kur šviesiau.",
        "why": "Šviesa reikalinga augalui gaminti maistą.",
    },
    "10-gyvunu-grupes": {
        "q": "Kuris gyvūnas yra paukštis, nors neskraido?",
        "options": ["Pingvinas", "Varnas", "Lapė"],
        "answer": 0,
        "hint": "Paukštį atpažįstame ne pagal skrydį.",
        "why": "Pingvinas turi plunksnas ir deda kiaušinius — jis paukštis.",
    },
    "11-saziningas-dalijimasis": {
        "q": "Du vaikai dalijasi 6 sausainius. Vienas nori visus. Kaip sąžininga?",
        "options": ["Po 3", "6 ir 0", "5 ir 1"],
        "answer": 0,
        "hint": "Padalink į dvi lygias dalis.",
        "why": "6 : 2 = 3, todėl po 3.",
    },
    "12-bendradarbiavimo-tiltas": {
        "q": "Tiltui reikia 6 blokų. Tu duodi 1, draugas 4. Kas nutinka?",
        "options": ["Trūksta 1 bloko", "Tiltas pastatytas", "Draugas stato vienas"],
        "answer": 0,
        "hint": "Sudėk: 1 + 4 = ? Kiek liko iki 6?",
        "why": "1 + 4 = 5, todėl trūksta vieno bloko.",
    },
    "13-akmenelis-popierius": {
        "q": "Kuris ėjimas nugali žirkles?",
        "options": ["Akmenėlis", "Popierius", "Žirklės"],
        "answer": 0,
        "hint": "Akmenėlis atbukina žirkles.",
        "why": "Akmenėlis nugali žirkles, žirklės — popierių, popierius — akmenėlį.",
    },
}


def rename_map() -> dict[str, str]:
    """Seno ID → naujo ID iš `scripts/known_renames.json`.

    Kodėl: 2026-11-13 `OPTIONAL` raktai ėjo pagal senus ID („03-sakinio-tvarka“),
    o modulis jau „03-sakinio-zodziai“. Toks modulis buvo tyliai praleidžiamas —
    įrankis pranešdavo „Pridėta 0“, lyg viskas būtų padaryta. Čia tas pats
    žemėlapis, kuriuo remiasi `check_published.py`, kad pervadinimas nebūtų
    kiekvieno įrankio problema atskirai.
    """
    path = ROOT / "scripts" / "known_renames.json"
    if not path.exists():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    return {entry["from"]: entry["to"] for entry in data.get("renames", []) if entry.get("from") and entry.get("to")}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--check", action="store_true",
                    help="grąžina 1, jei liko modulių be praplėtimo arba OPTIONAL raktas nieko neatitinka")
    args = ap.parse_args()

    aliases = rename_map()
    old_id = {new: old for old, new in aliases.items()}  # dabartinis ID → OPTIONAL raktas
    changed = 0
    seen = 0
    with_optional: list[str] = []
    without_optional: list[str] = []
    used_keys: set[str] = set()
    via_rename: list[str] = []

    for path in sorted(CONTENT.glob("grade-*/**/*.json")):
        if path.name in {"index.json", "path.json"}:
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        mid = str(data.get("id") or "")
        if not mid:
            print(f"{path.relative_to(ROOT)}: trūksta „id“ — praleista")
            continue
        seen += 1
        key = old_id.get(mid)
        extra = OPTIONAL.get(mid)
        if extra:
            used_keys.add(mid)
        elif key and key in OPTIONAL:
            # Modulis pervadintas: praplėtimo tekstas galioja ir toliau, tik
            # raktas likęs senas. Atpažįstama per `known_renames.json`, o ne
            # tyliai praleidžiama.
            extra = OPTIONAL[key]
            used_keys.add(key)
            via_rename.append(f"{key} → {mid}")

        tasks = data.setdefault("tasks", [])
        if any(t.get("optional") for t in tasks):
            with_optional.append(mid)
            continue
        if not extra:
            without_optional.append(mid)
            continue
        if len(tasks) >= 5:
            without_optional.append(mid)
            print(f"{mid}: jau 5 užduotys, praplėtimo nėra — praleista (reikia žmogaus sprendimo)")
            continue
        task = dict(extra)
        task["optional"] = True
        tasks.append(task)
        changed += 1
        with_optional.append(mid)
        print(f"{mid}: +1 praplėtimo užduotis (viso {len(tasks)})")
        if args.write:
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    unused = sorted(set(OPTIONAL) - used_keys)

    print(f"\nModulių: {seen} · su praplėtimu: {len(with_optional)} · be praplėtimo: {len(without_optional)}")
    if via_rename:
        print(f"Atpažinta pagal pervadinimą ({len(via_rename)}): " + "; ".join(via_rename))
        print("  → praplėtimo tekstas rastas, bet raktą verta pervadinti į dabartinį ID")
    if unused:
        print(f"OPTIONAL raktai, kurių né vienas modulis neatitinka ({len(unused)}): "
              + ", ".join(unused))
        print("  → tai seni ID: įrašyk juos į scripts/known_renames.json arba pašalink iš OPTIONAL")
    if without_optional:
        print("Moduliai be praplėtimo užduoties: " + ", ".join(without_optional))
        print("  → validate_content.py reikalauja „optional“ kiekviename modulyje")
    print(f"\n{'Pridėta' if args.write else 'Būtų pridėta'} užduočių: {changed}")
    if not args.write:
        print("Sausas bėgimas. Įrašymui pridėk --write")
    if args.check and (unused or without_optional or changed):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
