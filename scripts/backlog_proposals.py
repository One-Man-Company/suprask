#!/usr/bin/env python3
"""Backlog → pasiūlymai: kiekviena nepadengta programos pozicija tampa `tema` eilės įrašu.

Problema, kurią tai sprendžia
---------------------------
Šiandien (2026-11-22) sistema sukūrė VIENĄ modulį, nors programoje buvo
12 pozicijų be jokio modulio ir 14 „iš dalies". Kūrėjo eilė nebuvo tuščia —
joje buvo 3 kritikos įrašai ir NĖ VIENO temos įrašo, todėl kūrėjas 76 min
taisė esamus modulius, o naujo turinio neaugo. Spragas turėjo pastebėti
ideatorius, bet jis dukart baigėsi ėjimų limitu net neįrašęs pasiūlymų failo
(420 s ir 879 s, 0 darbo failų): jo darbas buvo 900 eilučių wiki grep'as.

Todėl spragos NUSTATYMAS nebepriklauso nuo modelio: `curriculum_backlog.py`
jas sugeneruoja iš programos, o šis skriptas kiekvieną jų paverčia pasiūlymu
su tikru `target`, programos kodu ir šaltinio eilute. Modelio (ideatoriaus,
metodininko) darbas lieka tai, kam modelio tikrai reikia — klaidingos
nuostatos, metodo sekos, simuliacijos specifikacijos.

Naudojimas:
    python3 scripts/backlog_proposals.py              # sukurti trūkstamus (idempotentiškai)
    python3 scripts/backlog_proposals.py --dry-run    # parodyti, ką sukurtų
    python3 scripts/backlog_proposals.py --max 6      # ne daugiau kaip 6 per paleidimą

Idempotentiškumas: pasiūlymo failo vardas nustatomas iš programos kodo, o
`agents/db.py::upsert_proposals` jau turimą failą atnaujina, o ne dubliuoja.
Todėl paleidus 10 kartų eilėje neatsiras 10 tų pačių įrašų.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
BACKLOG = ROOT / "research" / "wiki" / "curriculum" / "backlog.json"
PROPOSALS = ROOT / "agents" / "proposals"

sys.path.insert(0, str(ROOT / "agents"))
import db  # noqa: E402

# Prioritetas iš programos valandų: daug valandų = branduolio tema.
PRIORITY_BY_HOURS = ((3, "high"), (2, "normal"))


def _slug(text: str) -> str:
    import unicodedata
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", text)).strip("-")[:52]


def _priority(row: dict) -> str:
    try:
        hours = int(row.get("hours") or 0)
    except (TypeError, ValueError):
        hours = 0
    for floor, label in PRIORITY_BY_HOURS:
        if hours >= floor:
            return label
    return "low" if row.get("status") == "partial" else "normal"


def _body(row: dict, grade: int) -> str:
    status = row.get("status")
    what = ("Modulio šiai programos pozicijai NĖRA." if status == "missing"
            else "Modulis temą liečia, bet temos branduolio dar nėra.")
    parts = [
        f"{grade} klasės programos pozicija {row.get('key', '')} — {row.get('topic', '')}.",
        what,
        f"Programos reikalavimas: {re.sub(r'\s+', ' ', row.get('outcome') or '')[:400]}",
    ]
    if row.get("gap"):
        parts.append(f"Kodėl to neužtenka: {re.sub(r'\s+', ' ', row['gap'])[:400]}")
    if row.get("status") == "partial" and row.get("modules"):
        parts.append("Esami moduliai, kuriuos perskaityti prieš kuriant (nekartoti jų modelio): "
                     + ", ".join(row["modules"][:3]) + ".")
    if row.get("hours"):
        parts.append(f"Programoje šiai temai skirta {row['hours']} val.")
    parts.append("Kūrėjas: sukurk VIENĄ modulį šiam tikslui pagal docs/KURINIO-STANDARTAS.md; "
                 "viena didelė idėja, 3–5 užduotys su „why“, viena klaidinga nuostata, "
                 "kurią modelis parodo.")
    return " ".join(parts)


def plan(grade: int, limit: int) -> list[dict]:
    try:
        data = json.loads(BACKLOG.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        raise SystemExit("Nėra research/wiki/curriculum/backlog.json — "
                         "paleisk scripts/curriculum_backlog.py")
    today = dt.date.today().isoformat()
    out: list[dict] = []
    rows = [r for r in data.get("rows", [])
            if r.get("grade", grade) == grade and r.get("status") != "covered"]
    # `missing` pirmiau už `partial`; tada daugiausia programos valandų.
    rows.sort(key=lambda r: ({"missing": 0, "partial": 1}.get(r.get("status"), 2),
                              -int(r.get("hours") or 0), r.get("key", "")))
    for row in rows:
        target = (row.get("target") or "").strip()
        if not target:
            continue  # struktūrinė spraga: neturi kelio, kur modulis gyventų
        key = row.get("key", "")
        slug = _slug(f"{key}-{row.get('topic', '')}" if not re.match(r"^\d+\.\d+\.\d+$", key)
                     else f"{key}-{row.get('topic', '')}")
        name = f"backlog-{slug}.json"
        out.append({
            "file": PROPOSALS / name,
            "payload": {
                "role": "sistemos-architektas",
                "run_id": 0,
                "created": dt.datetime.now().isoformat(timespec="seconds"),
                "type": "tema",
                "title": f"{key} — {row.get('topic', '')}",
                "body": _body(row, grade),
                "target": target,
                "priority": _priority(row),
                "status": "new",
                "evidence": [
                    f"{row.get('source', '')} — programos pozicija {key}",
                    f"research/wiki/curriculum/backlog.json — būsena „{row.get('status')}“, "
                    f"padengta {data.get('counts', {}).get('covered')}/"
                    f"{data.get('curriculum_positions')}",
                ],
            },
        })
        if len(out) >= limit:
            break
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--grade", type=int, default=1)
    ap.add_argument("--max", type=int, default=6,
                    help="kiek daugiausia pasiūlymų sukurti per paleidimą")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    items = plan(args.grade, args.max)
    if not items:
        print("Nėra nepadengtų programos pozicijų su tikslu — eilė neturėtų ko duoti.")
        return 0

    PROPOSALS.mkdir(parents=True, exist_ok=True)
    written, existing = [], []
    for it in items:
        path = it["file"]
        if path.exists():
            existing.append(path.name)
            continue
        if args.dry_run:
            print(f"  + {path.name} → {it['payload']['target']}")
            continue
        path.write_text(json.dumps(it["payload"], ensure_ascii=False, indent=2) + "\n",
                        encoding="utf-8")
        written.append(path.name)

    if written:
        db.upsert_proposals([PROPOSALS / n for n in written])
        print(f"✔ Sukurta {len(written)} temų pasiūlymų iš programos spragų:")
        for n in written:
            print(f"  + {n}")
    if existing:
        print(f"  (jau buvo: {len(existing)})")
    if not written and not existing and not args.dry_run:
        print("Nieko naujo — visos spragos jau turi pasiūlymą.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
