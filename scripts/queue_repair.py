#!/usr/bin/env python3
"""Grąžina į eilę pasiūlymus, kuriuos užblokavo infrastruktūros gedimas.

Kodėl tai reikalinga: 2026-11-14 trys kūrėjo paleidimai (#281–#283) truko po
5 s. Modelio vartai atsakė „runtime_draining“ / „update_paused“, modelis
užduoties net negavo, bet kiekvienas paleidimas „paskelbė“ savo paties žurnalą
(1 failas), todėl eilė jį palaikė įrodymu ir užblokavo tris pasiūlymus
(#14726, #15045, #15581). Nuo tada bėgiklis tokią klaidą vadina `infra`
(`agents/run.py`, INFRA_MARKERS) ir pasiūlymą grąžina į eilę, BET jau
užblokuoti įrašai liko „kapinėse“: `blocked` eilė nebeliečia, o `--retry-blocked`
yra rankinis veiksmas, kurio niekas nekviečia.

Todėl šis įrankis tikrina ne būseną, o PRIEŽASTĮ — tris sąlygas kartu:

1. pasiūlymo `note` rodo konkretų paleidimą („paleidimas nepavyko: <vaidmuo> #N“);
2. tas paleidimas truko ≤ `SHORT_RUN` sekundžių ir baigėsi klaida;
3. jo darbo failai buvo tik `agents/log/` ataskaita, o išvestyje yra
   infrastruktūros žymė (INFRA_MARKERS iš `agents/run.py`).

Tik tada pasiūlymas grąžinamas į `new` tuo pačiu keliu, kuriuo grąžina bėgiklis
(`reopen_after_infra`), kad bandymų skaitiklis liktų vienas.

Naudojimas:
    python3 scripts/queue_repair.py             # sausa bėga: ką pakeistų
    python3 scripts/queue_repair.py --apply     # įrašo pakeitimus
    python3 scripts/queue_repair.py --json      # mašininė išvestis
"""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "agents"))

import db  # noqa: E402
import run as runner  # noqa: E402  (INFRA_MARKERS, reopen_after_infra, LOG_PREFIX)

# Paleidimas, trumpesnis už šitiek sekundžių, negalėjo atlikti turinio darbo.
# Ilgiausias žinomas infra gedimas — 5 s (#281–#283); 90 s palieka rezervą
# lėtam tinklui, bet neatleidžia nė vieno realaus bandymo (trumpiausias turinio
# darbas istorijoje — 167 s).
SHORT_RUN = 90

NOTE_RE = re.compile(r"paleidimas nepavyko:\s*[\w-]+\s*#(\d+)")


def run_row(run_id: int) -> dict | None:
    con = db.connect()
    con.row_factory = sqlite3.Row
    row = con.execute(
        "select id, role, status, duration_s, exit_code, artifacts, summary, "
        "detail, log_path from runs where id = ?", (run_id,)
    ).fetchone()
    con.close()
    return dict(row) if row else None


def work_artifacts(row: dict) -> list[str]:
    try:
        files = json.loads(row.get("artifacts") or "[]")
    except json.JSONDecodeError:
        return ["<artifacts nesuprantamas>"]
    return [f for f in files if not str(f).startswith(runner.LOG_PREFIX)]


def diagnose(prop: dict) -> dict:
    """Ar pasiūlymo blokavimas įvyko dėl infrastruktūros, o ne dėl turinio."""
    note = prop.get("note") or ""
    found = NOTE_RE.search(note)
    if not found:
        return {"repair": False, "why": "blokavimo priežastis nenurodo paleidimo"}
    run_id = int(found.group(1))
    row = run_row(run_id)
    if not row:
        return {"repair": False, "why": f"paleidimo #{run_id} įrašo nėra"}
    if row["status"] not in ("failed", "empty", "infra", "timeout"):
        return {"repair": False, "why": f"paleidimas #{run_id} baigėsi {row['status']}"}
    duration = row.get("duration_s")
    if duration is None or duration > SHORT_RUN:
        return {"repair": False, "why": f"paleidimas #{run_id} truko {duration}s "
                                        f"(> {SHORT_RUN}s) — galėjo pamatyti užduotį"}
    work = work_artifacts(row)
    if work:
        return {"repair": False, "why": f"paleidimas #{run_id} palietė darbo failus: "
                                        f"{', '.join(work[:3])}"}
    reason = runner.infra_reason(row.get("summary") or "", row.get("detail") or "", note)
    if not reason:
        return {"repair": False, "why": f"paleidimo #{run_id} išvestyje nėra "
                                        f"infrastruktūros žymės"}
    return {"repair": True, "run_id": run_id, "reason": reason,
            "why": f"paleidimas #{run_id} truko {duration}s, be darbo failų, "
                   f"žymė „{reason}“"}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="įrašo pakeitimus į agents/runs.db")
    ap.add_argument("--json", action="store_true", help="mašininė išvestis")
    args = ap.parse_args()

    db.init()
    verdicts = []
    for prop in db.proposals(1000, status="blocked"):
        diag = diagnose(prop)
        verdicts.append({"id": int(prop["id"]), "title": prop.get("title"), **diag})

    fixable = [v for v in verdicts if v["repair"]]
    if args.json:
        print(json.dumps({"checked": len(verdicts), "fixable": fixable,
                          "apply": args.apply}, ensure_ascii=False))
        if not fixable:
            return 0
    else:
        print(f"Blokuotų pasiūlymų: {len(verdicts)} · grąžintinų į eilę: {len(fixable)}")
        for v in verdicts:
            mark = "→ new" if v["repair"] else "  likti blocked"
            print(f"  #{v['id']} {mark}: {v['why']}")
            if v["repair"]:
                print(f"      {v['title']}")

    if not fixable:
        return 0
    if not args.apply:
        print("\nTai sausa bėga. Įrašyti: python3 scripts/queue_repair.py --apply")
        return 0

    for v in fixable:
        reopened, attempt = runner.reopen_after_infra(v["id"], v["reason"])
        print(f"  #{v['id']}: {'grąžintas į eilę' if reopened else 'BLOKUOTAS'} "
              f"(bandymas {attempt}/{runner.INFRA_MAX_ATTEMPTS})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
