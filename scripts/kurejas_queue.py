#!/usr/bin/env python3
"""
Kūrėjo eilė: apdoroja pasiūlymus vieną po kito, kol eilė tuščia.

Anksčiau `kurejas` viename paleidime įgyvendindavo VIENĄ pasiūlymą per dieną —
37 pasiūlymų eilė būtų valyta mėnesį. Dabar vienas paleidimas ima pasiūlymus
eilės tvarka ir po kiekvieno:
  1. kviečia `agents/run.py kurejas --proposal <id>` (atskiras DB įrašas, log),
  2. tas paleidimas pats validuoja, commituoja ir publikuoja,
  3. pasiūlymas pažymimas `done` (arba `blocked`, jei nepavyko).

Užraktas imamas ir atleidžiamas KIEKVIENAM pasiūlymui atskirai, todėl kūrėjas
nebeblokuoja kitų agentų visai darbo dienai.

Naudojimas:
    python3 scripts/kurejas_queue.py --dry-run
    python3 scripts/kurejas_queue.py --max-items 8 --max-minutes 180
"""

from __future__ import annotations

import argparse
import datetime as dt
import pathlib
import subprocess
import sys
import time

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "agents"))
import db  # noqa: E402

PRIORITY_ORDER = {"high": 0, "normal": 1, "low": 2}

# „tema“ tipo pasiūlymas, kurio failas JAU yra, reiškia, kad modulis jau
# sukurtas (pasiūlymas pasenęs) — jo kurti antrą kartą nereikia.
OBSOLETE_TYPES = ("tema",)

# „metodas“ su egzistuojančiu tikslu gali reikšti du skirtingus dalykus:
#   - metodas, pagal kurį modulis jau sukurtas (panaudotas → nebe darbas),
#   - metodo pastaba apie jau esamą modulį (dar darbas).
# Skiriamės pagal git istoriją: jei failas atsirado PO pasiūlymo, metodas
# buvo panaudotas jam kurti. Be šios taisyklės eilės galva amžinai rodo
# jau įgyvendintą darbą ir kūrėjas eikvoja paleidimą „jau yra“ atsakymui (#1071).
METHOD_TYPE = "metodas"


def _module_added_at(rel: str) -> int | None:
    """Kada failas atsirado repo istorijoje (Unix laikas) arba None."""
    try:
        out = subprocess.run(
            ["git", "log", "--diff-filter=A", "--format=%ct", "--", rel],
            cwd=ROOT, capture_output=True, text=True, timeout=20,
        )
    except Exception:  # noqa: BLE001
        return None
    stamps = sorted(int(s) for s in out.stdout.split() if s.strip().isdigit())
    return stamps[0] if stamps else None


def _method_already_used(created: str, added: int | None) -> bool:
    """Ar modulis sukurtas jau po to, kai pasiūlymas parašytas."""
    if added is None:
        return False
    try:
        made = dt.datetime.fromisoformat(created).timestamp()
    except (TypeError, ValueError):
        return False
    return added > made



def triage() -> tuple[int, int]:
    """Pažymi pasenusius ir pasikartojančius pasiūlymus. Grąžina (pasenę, dubliai)."""
    rows = [r for r in db.proposals(500, status="new")]
    obsolete = 0
    seen: dict[tuple, int] = {}
    duplicates = 0

    for r in sorted(rows, key=lambda r: int(r["id"])):
        target = (r.get("target") or "").strip()
        kind = (r.get("type") or "").strip().lower()
        key = (kind, target, (r.get("title") or "").strip().lower()[:60])

        if target and (ROOT / target).exists() and kind in OBSOLETE_TYPES:
            db.set_proposal_status(int(r["id"]), "obsolete", "modulis jau sukurtas")
            obsolete += 1
            continue

        # Metodas, pagal kurį modulis jau sukurtas po pasiūlymo — panaudotas.
        if (target and kind == METHOD_TYPE and (ROOT / target).exists()
                and _method_already_used(r.get("created") or "", _module_added_at(target))):
            db.set_proposal_status(int(r["id"]), "obsolete",
                                   "metodas panaudotas — modulis sukurtas po pasiūlymo")
            obsolete += 1
            continue

        if key in seen:
            db.set_proposal_status(int(r["id"]), "obsolete", f"dubliuoja ##{seen[key]}")
            duplicates += 1
            continue
        seen[key] = int(r["id"])

    return obsolete, duplicates


def queue() -> list[dict]:
    rows = [r for r in db.proposals(500, status="new")]
    rows.sort(key=lambda r: (PRIORITY_ORDER.get((r.get("priority") or "normal").lower(), 1), int(r["id"])))
    return rows


def run_one(proposal_id: int) -> tuple[str, str]:
    """Paleidžia vieną kūrėjo darbą. Grąžina (statusas, eilutė)."""
    cmd = [
        sys.executable, str(ROOT / "agents" / "run.py"), "kurejas",
        "--proposal", str(proposal_id), "--trigger", "queue",
    ]
    proc = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    out = (proc.stdout or "").strip().splitlines()
    line = out[-1] if out else (proc.stderr or "").strip()[-200:]

    # Tikrasis statusas — iš DB, ne iš teksto.
    try:
        rows = [r for r in db.proposals(500) if int(r["id"]) == proposal_id]
        status = rows[0]["status"] if rows else "unknown"
    except Exception:  # noqa: BLE001
        status = "unknown"
    return status, line


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--max-items", type=int, default=60)
    ap.add_argument("--max-minutes", type=int, default=720)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--no-triage", action="store_true", help="nepažymėti pasenusių/dubliuojančių")
    args = ap.parse_args()

    if not args.dry_run and not args.no_triage:
        obsolete, duplicates = triage()
        if obsolete or duplicates:
            print(f"Tvarkyklė: pasenę {obsolete}, dubliai {duplicates}")

    pending = queue()
    print(f"Eilėje: {len(pending)} pasiūlymų (imsiu iki {args.max_items}, iki {args.max_minutes} min)")

    if args.dry_run:
        for p in pending[: args.max_items]:
            print(f"  #{p['id']} [{p.get('priority')}] {p.get('title')[:70]} → {p.get('target')}")
        return 0

    started = time.time()
    done = blocked = 0
    processed = 0

    while processed < args.max_items and (time.time() - started) / 60 < args.max_minutes:
        pending = queue()
        if not pending:
            print("Eilė tuščia — baigiu.")
            break
        prop = pending[0]
        processed += 1
        print(f"→ #{prop['id']} [{prop.get('priority')}] {prop.get('title')[:60]}")

        # Jei kitas agentas laiko užraktą, palaukiam (bet ne amžinai).
        status, line = "unknown", ""
        for _ in range(6):
            status, line = run_one(int(prop["id"]))
            if "jau dirba" not in line:
                break
            time.sleep(60)

        print(f"   {status}: {line[:120]}")
        if status == "done":
            done += 1
            # Po kiekvieno darbo paliekam ~25 s langą kitiems rašantiems
            # agentams (kalbų redaktoriui, architektui): užraktas globalus,
            # todėl be šio lango ilga eilė niekada neužleidžia vietos.
            time.sleep(25)
        else:
            blocked += 1
            if status == "new":
                # Paleidimas nepakeitė būsenos — žymim, kad eilė nekilų amžinai.
                db.set_proposal_status(int(prop["id"]), "blocked", f"paleidimas nepavyko: {line[:120]}")
            # Du iš eilės nepavykę — sustojam, kad nekęstume be galo.
            if blocked >= 2 and done == 0:
                print("Du nepavykę iš eilės — stabdau šį paleidimą.")
                break

    elapsed = int((time.time() - started) / 60)
    print(f"\nBaigta per {elapsed} min: įgyvendinta {done}, užblokuota {blocked}, liko {len(queue())}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
