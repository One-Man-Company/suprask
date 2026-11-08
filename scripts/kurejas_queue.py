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
import pause as system_pause  # noqa: E402
import run as runner  # noqa: E402

PRIORITY_ORDER = {"high": 0, "normal": 1, "low": 2}

# Pasiūlymai, kurių tikslas — sistemos failas (agentų bėgiklis, skriptai,
# publikavimas, dashboard, normatyviniai dokumentai), NE kūrėjo darbas. Kūrėjo
# vaidmuo jų neliesti negali (ribos), todėl kiekvienas toks bandymas = iki
# 20 min darbo ir vis tiek `blocked`. 2026-11-08 tokie buvo 9 iš 21 eilės
# pasiūlymų — eilės galva buvo `agents/run.py`, o ne pamoka vaikui.
SYSTEM_PREFIXES = ("agents/", "scripts/", "deploy/", "dashboard/", "docs/")

# Trumpesnis paleidimas laikomas „nebandymu“: modelis nepradėjo darbo (tuščias
# ciklas, neįkeltas profilis). Toks paleidimas neturi sudeginti pasiūlymo —
# 2026-11-07 eilė per 40 s taip sudegino 37 pasiūlymus (3 s kiekvienas).
MIN_ATTEMPT_S = 120

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


def is_system_work(prop: dict) -> bool:
    """Ar pasiūlymas skirtas sistemos failui, ne pamokos turiniui."""
    paths = runner.target_paths(prop.get("target") or "")
    return bool(paths) and all(p.startswith(SYSTEM_PREFIXES) for p in paths)


def queue() -> list[dict]:
    rows = [r for r in db.proposals(500, status="new") if not is_system_work(r)]
    rows.sort(key=lambda r: (PRIORITY_ORDER.get((r.get("priority") or "normal").lower(), 1), int(r["id"])))
    return rows


def system_queue() -> list[dict]:
    """Sisteminiai pasiūlymai — rodomi, bet kūrėjui neduodami."""
    rows = [r for r in db.proposals(500, status="new") if is_system_work(r)]
    rows.sort(key=lambda r: (PRIORITY_ORDER.get((r.get("priority") or "normal").lower(), 1), int(r["id"])))
    return rows


def _last_run_id() -> int:
    try:
        rows = db.recent_runs(1)
        return int(rows[0]["id"]) if rows else 0
    except Exception:  # noqa: BLE001
        return 0


def run_one(proposal_id: int) -> tuple[str, str, dict | None]:
    """Paleidžia vieną kūrėjo darbą. Grąžina (pasiūlymo būsena, eilutė, run įrašas)."""
    before_run = _last_run_id()
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

    # Paleidimo įrašas: be jo negalima atskirti „nepavyko“ nuo „net nepradėjo“.
    run_row = None
    try:
        fresh = [r for r in db.recent_runs(8)
                 if int(r["id"]) > before_run and r.get("role") == "kurejas"]
        run_row = fresh[0] if fresh else None
    except Exception:  # noqa: BLE001
        pass
    return status, line, run_row


def main() -> int:
    paused, until = system_pause.is_paused()
    if paused:
        print(f"Sistema pristabdyta iki {until} — eilė nestartuojama.")
        return 0

    ap = argparse.ArgumentParser()
    ap.add_argument("--max-items", type=int, default=60)
    ap.add_argument("--max-minutes", type=int, default=720)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--no-triage", action="store_true", help="nepažymėti pasenusių/dubliuojančių")
    ap.add_argument("--retry-blocked", type=int, default=0, metavar="N",
                    help="atidaryti N blokuotų pasiūlymų (blocked → new) ir bandyti iš naujo")
    args = ap.parse_args()

    if args.retry_blocked and not args.dry_run:
        reopened = 0
        for row in sorted(db.proposals(500, status="blocked"), key=lambda r: int(r["id"])):
            if reopened >= args.retry_blocked:
                break
            db.set_proposal_status(int(row["id"]), "new",
                                   f"pakartotinai atidaryta (buvo: {(row.get('note') or '')[:60]})")
            reopened += 1
        if reopened:
            print(f"Atidaryta iš naujo: {reopened} blokuotų pasiūlymų")

    if not args.dry_run and not args.no_triage:
        obsolete, duplicates = triage()
        if obsolete or duplicates:
            print(f"Tvarkyklė: pasenę {obsolete}, dubliai {duplicates}")

    pending = queue()
    system = system_queue()
    print(f"Eilėje: {len(pending)} pasiūlymų (imsiu iki {args.max_items}, iki {args.max_minutes} min)")
    if system:
        print(f"  Sisteminių (ne kūrėjo darbas): {len(system)} — "
              + ", ".join(f"#{p['id']}" for p in system[:6])
              + (" …" if len(system) > 6 else ""))

    if args.dry_run:
        for p in pending[: args.max_items]:
            print(f"  #{p['id']} [{p.get('priority')}] {p.get('title')[:70]} → {p.get('target')}")
        return 0

    started = time.time()
    done = blocked = review = processed = 0

    while processed < args.max_items and (time.time() - started) / 60 < args.max_minutes:
        pending = queue()
        if not pending:
            print("Eilė tuščia — baigiu.")
            break
        prop = pending[0]
        processed += 1
        print(f"→ #{prop['id']} [{prop.get('priority')}] {prop.get('title')[:60]}")

        # Jei kitas agentas laiko užraktą, palaukiam (bet ne amžinai).
        status, line, run_row = "unknown", "", None
        for _ in range(6):
            status, line, run_row = run_one(int(prop["id"]))
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
            continue

        # Ar paleidimas apskritai ėmėsi darbo? 3 s paleidimas su 0 failų yra
        # sugedusi aplinka, o ne pasiūlymo kaltė. Tokiu atveju pasiūlymas
        # NEPAŽYMIMAS blocked (kitaip jis prarandamas visam laikui) — stabdome
        # visą eilę ir paliekame tai, ką reikia sutvarkyti žmogui/architektui.
        duration = int((run_row or {}).get("duration_s") or 0)
        artifacts = (run_row or {}).get("artifacts") or "[]"
        run_status = (run_row or {}).get("status") or "—"
        if run_row is not None and duration < MIN_ATTEMPT_S and artifacts in ("[]", "", None):
            db.set_proposal_status(int(prop["id"]), "new",
                                   f"bandymas neįvyko: {run_status} per {duration}s, 0 failų")
            print(f"   Paleidimas truko {duration}s ir nepakeitė nė vieno failo — "
                  f"tai ne bandymas. Pasiūlymas lieka new, stabdau eilę.")
            break

        if run_status == "published":
            # Darbas paskelbtas, bet pasiūlymas neuždarytas: tikslas nepaliestas
            # arba jo nesutvarkė `mark_implemented`. Tai PERŽIŪROS, o ne eilės
            # gedimo atvejis — 2026-11-08 taip buvo visi 6 blokuoti.
            review += 1
            db.set_proposal_status(int(prop["id"]), "blocked",
                                   f"paskelbta, bet tikslas nepakeistas — reikia peržiūros ({line[:80]})")
            continue

        blocked += 1
        db.set_proposal_status(int(prop["id"]), "blocked", f"paleidimas nepavyko: {line[:120]}")
        # Du nepavykę iš eilės — stabdome, kad nekęstume be galo.
        if blocked >= 2 and done == 0:
            print("Du nepavykę iš eilės — stabdau šį paleidimą.")
            break

    elapsed = int((time.time() - started) / 60)
    print(f"\nBaigta per {elapsed} min: įgyvendinta {done}, nepasisekė {blocked}, "
          f"peržiūrai {review}, liko {len(queue())} (+{len(system_queue())} sisteminių)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
