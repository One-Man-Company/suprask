#!/usr/bin/env python3
"""
Kalbos taisymo eilė: po vieną modulį, kol sąrašas baigsis.

Kodėl eilė: `kalbu-redaktorius` pagal sutartį dirba su VIENU moduliu per paleidimą.
31 moduliui reikia 31 paleidimo, o ne vieno „perrašyk viską“ — kitaip ataskaita
būna graži, o pakeitimai paviršutiniški.

Sąrašo tvarka:
  1. jei yra `research/wiki/guidelines/kalbos-auditas.md` — moduliai imami ta
     tvarka, kokia minima ataskaitoje (ji surikiuota pagal sunkumą);
  2. kitaip — pagal `scripts/check_language.py` įspėjimų skaičių.

Naudojimas:
    python3 scripts/kalbu_queue.py --dry-run
    python3 scripts/kalbu_queue.py --max-items 5
"""

from __future__ import annotations

import argparse
import json
import os
import pathlib
import re
import subprocess
import sys
import time

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "agents"))
import db  # noqa: E402

AUDIT = ROOT / "research" / "wiki" / "guidelines" / "kalbos-auditas.md"
STATE = ROOT / "agents" / "kalbos-queue.json"


def all_modules() -> list[dict]:
    index = json.loads((ROOT / "content/lt/grade-01/index.json").read_text(encoding="utf-8"))
    out = []
    for strand in index.get("strands", []):
        for m in strand.get("modules", []):
            path = ROOT / "content" / "lt" / "grade-01" / strand["id"] / f"{m['id']}.json"
            out.append({"id": m["id"], "strand": strand["id"], "path": str(path.relative_to(ROOT))})
    return out


def order_from_audit(mods: list[dict]) -> list[dict]:
    if not AUDIT.exists():
        return []
    text = AUDIT.read_text(encoding="utf-8")
    seen, out = set(), []
    for m in mods:
        pos = text.find(m["id"])
        if pos >= 0 and m["id"] not in seen:
            seen.add(m["id"])
            out.append((pos, m))
    return [m for _, m in sorted(out, key=lambda x: x[0])]


import hashlib


def module_hash(module: dict) -> str:
    """Turinio maiša: modulis „sutvarkytas“ tik tol, kol failas nepasikeitė.

    Taip naujas ar pakeistas modulis (pvz. kūrėjo perrašytas) vėl patenka į
    eilę, o jau peržiūrėtas ir nepakitęs — ne. Tai atsakymas į klausimą
    „ar kas nors peržiūrės viską iš naujo kiekvieną kartą?“ — ne.
    """
    try:
        return hashlib.sha256((ROOT / module["path"]).read_bytes()).hexdigest()[:16]
    except OSError:
        return ""


def load_state() -> dict:
    if STATE.exists():
        try:
            data = json.loads(STATE.read_text(encoding="utf-8"))
            if "modules" not in data:  # sena forma {"done": [...]}
                data = {"modules": {m: {"hash": ""} for m in data.get("done", [])}}
            return data
        except json.JSONDecodeError:
            pass
    return {"modules": {}}


def save_state(state: dict) -> None:
    STATE.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def focus_for(module: dict) -> str:
    return (
        f"Modulis: **{module['id']}** (`{module['path']}`).\n"
        "Šį paleidimą dirbk TIK su šiuo moduliu.\n"
        "1. Perskaityk failą ir `research/wiki/guidelines/kalbos-auditas.md` (jei yra) — ten šio modulio radiniai.\n"
        "2. Perrašyk tas vietas, kur 6–7 metų vaikas gali suprasti ne taip, kaip sumanyta:\n"
        "   klausimas be klausiamojo žodžio, nesusietas kiekis, beveik tapačios reikšmės variantai,\n"
        "   dvigubas neigiamas, netaisyklinga „arba“, vertiniai, ilgas/retas žodis.\n"
        "3. Turinio prasmės ir teisingo atsakymo Nekeisk; jei atsakymas atrodo neteisingas — rašyk pasiūlymą.\n"
        "4. Paleisk `python3 scripts/check_language.py` ir `python3 scripts/validate_content.py` — 0 klaidų.\n"
        "5. Ataskaitoje: ką pakeitei (prieš → po) ir ką palikai bei kodėl."
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--max-items", type=int, default=8)
    ap.add_argument("--max-minutes", type=int, default=180)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--all", action="store_true", help="nepaisyti jau padarytų")
    args = ap.parse_args()

    mods = all_modules()
    ordered = order_from_audit(mods)
    queue = ordered + [m for m in mods if m not in ordered]

    state = load_state()
    reviewed = state.get("modules", {})
    if not args.all:
        queue = [m for m in queue
                 if reviewed.get(m["id"], {}).get("hash") != module_hash(m)]

    print(f"Modulių iš viso: {len(mods)} · audito tvarka: {'taip' if ordered else 'ne'} · eilėje: {len(queue)}")
    if args.dry_run:
        for m in queue[: args.max_items]:
            print(f"  {m['id']}  ({m['strand']})")
        return 0

    started = time.time()
    done = failed = 0
    for m in queue:
        if done >= args.max_items or (time.time() - started) / 60 > args.max_minutes:
            break
        print(f"→ {m['id']}")
        before_id = max([int(r["id"]) for r in db.recent_runs(5)] or [0])
        env = dict(os.environ, SUPRASK_LOCK_WAIT=os.environ.get("SUPRASK_LOCK_WAIT", "3600"))
        proc = subprocess.run(
            [sys.executable, str(ROOT / "agents" / "run.py"), "kalbu-redaktorius",
             "--trigger", "queue", "--note", focus_for(m)],
            cwd=ROOT, capture_output=True, text=True, env=env,
        )
        line = ((proc.stdout or "").strip().splitlines() or [""])[-1]
        print("  ", line[:140])
        # Būsena — BŪTENT šio paleidimo, ne „paskutinio kalbos redaktoriaus“:
        # kol laukiama užrakto, paskutinis įrašas gali būti kito proceso.
        rows = [r for r in db.recent_runs(60, "kalbu-redaktorius") if int(r["id"]) > before_id]
        status = (rows[0]["status"] if rows else "unrun")
        # „empty“ = agentas dirbo, bet keisti nereikėjo — tai sėkmė, ne klaida.
        if status in ("published", "ok", "partial", "checked", "empty"):
            done += 1
            state.setdefault("modules", {})[m["id"]] = {
                "hash": module_hash(m),
                "at": time.strftime("%Y-%m-%dT%H:%M"),
            }
            save_state(state)
        else:
            failed += 1
            if failed >= 2 and done == 0:
                print("Du nepavykę iš eilės — stabdau.")
                break

    print(f"\nBaigta: sutvarkyta {done}, nepavyko {failed}, liko {len(queue) - done}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
