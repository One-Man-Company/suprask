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

Antra taisymo rūšis (nuo 2026-11-24, #4455/#4516): pasiūlymas, kurio prašymas
JAU yra tikslo faile, bet kabo `new`, nes uždarymas reikalauja pakeitimo TAME
PAČIAME commite. `--prove ID=REGEX` uždaroma tik su trimis įrodymais: (1)
pasiūlymas dar `new`, (2) tikslo failas pakeistas PO pasiūlymo sukūrimo, (3)
`REGEX` randamas dabartiniame faile. Be vieno iš jų — atsisakoma ir pasakoma
kodėl, o ne uždaroma „nes atrodo padaryta“ (LL-36).
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import pathlib
import re
import subprocess
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


def prove_done(prop: dict, pattern: str) -> dict:
    """Ar pasiūlymo prašymas JAU yra tikslo faile? Grąžina sprendimą su įrodymais.

    Ką tai sprendžia (#4455, #4516): uždarymas reikalauja, kad tikslo failas
    būtų pakeistas TAME PAČIAME commite (`mark_implemented`, #486). Jei darbas
    padarytas vėliau kitame paleidime, o numeris nebuvo deklaruotas, pasiūlymas
    lieka `new` amžinai: #4455 (ataskaitų dydis) įgyvendintas commite f662b27,
    o eilėje kabėjo 16 dienų; #4516 (sakinio ilgis `error`) — nuo 2026-11-08.
    Todėl `check_agents.py` kiekvieną paleidimą įspėja apie „11 laukiančių
    sisteminių pasiūlymų“, nors dalis jų jau seniai padaryta, ir architektas
    eikvoja paleidimus jiems iš naujo.

    Trys sąlygos, visos privalomos:
      1. pasiūlymas dar `new` (žmogaus sprendimo neperrašome),
      2. bent vienas tikslo failas pakeistas PO pasiūlymo sukūrimo datos,
      3. `pattern` (įrodymas, kad būtent šis prašymas ten yra) randamas faile.
    """
    if (prop.get("status") or "") != "new":
        return {"prove": False, "why": f"būsena {prop.get('status')}, ne new"}
    target = (prop.get("target") or "").strip()
    paths = runner.target_paths(target)
    if not paths:
        return {"prove": False, "why": "tikslas nenurodo failo kelio"}
    try:
        created = dt.datetime.fromisoformat(prop.get("created") or "").timestamp()
    except (TypeError, ValueError):
        return {"prove": False, "why": "pasiūlymo data neperskaitoma"}
    try:
        regex = re.compile(pattern)
    except re.error as exc:
        return {"prove": False, "why": f"netinkamas šablonas: {exc}"}

    found_in: list[str] = []
    changed_after: list[str] = []
    for rel in paths:
        path = ROOT / rel
        if not path.is_file():
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        if regex.search(text):
            found_in.append(rel)
        try:
            out = subprocess.run(["git", "log", "-1", "--format=%ct", "--", rel],
                                 cwd=ROOT, capture_output=True, text=True, timeout=20)
            stamp = out.stdout.strip()
            if stamp.isdigit() and int(stamp) > created:
                changed_after.append(rel)
        except (OSError, subprocess.SubprocessError):
            continue
    if not found_in:
        return {"prove": False, "why": f"šablono nėra nė viename tikslо faile: {', '.join(paths)}"}
    if not changed_after:
        return {"prove": False,
                "why": f"tikslo failas nepakeistas po {prop.get('created')} — "
                       f"įrodymas galėjo būti ir prieš prašymą"}
    return {"prove": True, "files": found_in, "changed_after": changed_after,
            "why": f"šablonas rastas: {', '.join(found_in)}; failas keistas po prašymo"}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="įrašo pakeitimus į agents/runs.db")
    ap.add_argument("--json", action="store_true", help="mašininė išvestis")
    ap.add_argument("--prove", action="append", default=[], metavar="ID=REGEX",
                    help="uždaryti pasiūlymą, jei REGEX jau yra tikslo faile (kartojamas)")
    args = ap.parse_args()

    db.init()

    # ── Antra rūšis: jau įgyvendinti, bet neuždaryti pasiūlymai (#4455, #4516)
    proven: list[dict] = []
    for spec in args.prove:
        if "=" not in spec:
            proven.append({"id": spec, "prove": False,
                           "why": "formatas turi būti ID=REGEX"})
            continue
        raw_id, pattern = spec.split("=", 1)
        try:
            pid = int(raw_id.strip().lstrip("#"))
        except ValueError:
            proven.append({"id": raw_id, "prove": False, "why": "numeris ne skaičius"})
            continue
        row = next((r for r in db.proposals(1000) if int(r["id"]) == pid), None)
        if not row:
            proven.append({"id": pid, "prove": False, "why": "pasiūlymo nėra"})
            continue
        verdict = prove_done(row, pattern)
        proven.append({"id": pid, "title": row.get("title"), **verdict})
        if verdict["prove"] and args.apply:
            db.set_proposal_status(pid, "done",
                                   f"įrodyta, kad jau yra: {verdict['files'][0]} "
                                   f"({pattern[:40]}) — darbas padarytas kitame commite")
            proven[-1]["closed"] = True

    if proven and not args.json:
        print(f"Jau įgyvendinti (‑‑prove): {sum(1 for v in proven if v['prove'])} "
              f"iš {len(proven)}")
        for v in proven:
            mark = "→ done" if v["prove"] else "  likti new"
            print(f"  #{v['id']} {mark}: {v['why']}")
            if v.get("closed"):
                print("      uždaryta agents/runs.db")

    verdicts = []
    for prop in db.proposals(1000, status="blocked"):
        diag = diagnose(prop)
        verdicts.append({"id": int(prop["id"]), "title": prop.get("title"), **diag})

    fixable = [v for v in verdicts if v["repair"]]
    if args.json:
        print(json.dumps({"checked": len(verdicts), "fixable": fixable,
                          "proven": proven, "apply": args.apply}, ensure_ascii=False))
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
