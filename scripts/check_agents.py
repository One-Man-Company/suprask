#!/usr/bin/env python3
"""
Agentų sistemos vientisumo patikra.

Sistemininkas (sistemos-architektas) keičia vaidmenis, grafikus ir promptus —
šis skriptas neleidžia tyliai suletinti sistemos: kiekvienas ROLES įrašas turi
turėti failą, modelį, grafiką ir ribas, o sugeneruoti systemd unit'ai turi
atitikti ROLES.

Naudojimas:
    python3 scripts/check_agents.py
    python3 scripts/check_agents.py --json
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "agents"))

REQUIRED = ("file", "profile", "toolsets", "cadence", "on_calendar",
            "max_turns", "budget", "timeout", "description")
UNITS = ROOT / "deploy" / "systemd"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    problems: list[str] = []
    warnings: list[str] = []

    try:
        import run as runner
    except Exception as exc:  # noqa: BLE001
        print(f"✘ Nepavyksta įkelti agents/run.py: {exc}")
        return 1

    roles = runner.ROLES
    if not roles:
        problems.append("ROLES tuščias")

    profiles = set()
    try:
        profiles = {p.name for p in (pathlib.Path.home() / ".hermes" / "profiles").iterdir() if p.is_dir()}
    except OSError:
        warnings.append("nepavyko perskaityti ~/.hermes/profiles — modelių patikra praleista")

    for role, cfg in roles.items():
        for key in REQUIRED:
            if not cfg.get(key):
                problems.append(f"{role}: trūksta „{key}“")

        role_file = ROOT / "agents" / cfg.get("file", "")
        if not role_file.is_file():
            problems.append(f"{role}: nėra vaidmens failo {cfg.get('file')}")
        else:
            text = role_file.read_text(encoding="utf-8")
            if len(text) < 400:
                problems.append(f"{role}: vaidmens failas per trumpas ({len(text)} simb.)")
            if "## Baigties sąlyga" not in text:
                problems.append(f"{role}: trūksta skilties „## Baigties sąlyga“")

        raw_cal = cfg.get("on_calendar")
        entries = raw_cal if isinstance(raw_cal, list) else [raw_cal] if raw_cal else []
        if isinstance(raw_cal, list) and not raw_cal:
            problems.append(f"{role}: on_calendar sąrašas tuščias")
        for cal in entries:
            cal = str(cal)
            if not re.match(r"^(\*|[0-9A-Za-z*/,:-]+)(\s+[0-9A-Za-z*/:,-]+){1,4}$", cal):
                warnings.append(f"{role}: neįprastas on_calendar formatas: {cal}")

        prof = cfg.get("profile")
        if profiles and prof and prof not in profiles:
            problems.append(f"{role}: modelio profilis „{prof}“ nerastas")

        queue = cfg.get("queue")
        if queue:
            cmd = ROOT / str(queue.get("command") or "")
            if not cmd.is_file():
                problems.append(f"{role}: eilės komanda nerasta: {queue.get('command')}")
            for key in ("max_items", "max_minutes"):
                if not isinstance(queue.get(key), int) or queue[key] <= 0:
                    problems.append(f"{role}: queue.{key} turi būti teigiamas sveikasis skaičius")

        timer = UNITS / f"suprask-{role}.timer"
        if not timer.is_file():
            problems.append(f"{role}: nėra timer failo {timer.relative_to(ROOT)}")
        else:
            unit_line = [l for l in timer.read_text(encoding="utf-8").splitlines() if l.startswith("Unit=")]
            expected = f"suprask-{role}-queue.service" if queue else f"suprask-agent@{role}.service"
            if unit_line and unit_line[0].strip() != f"Unit={expected}":
                problems.append(f"{role}: timer paleidžia {unit_line[0].strip()}, o turėtų Unit={expected}")
            if queue and not (UNITS / expected).is_file():
                problems.append(f"{role}: nėra {expected} failo")

    # timer'iai be vaidmens
    for f in sorted(UNITS.glob("suprask-*.timer")):
        role = f.stem.replace("suprask-", "")
        if role not in roles:
            warnings.append(f"{f.name}: timer'is be atitinkamo vaidmens ROLES")

    # Dienoraštis: architektas privalo palikti įrašą po kiekvieno darbo.
    journal = ROOT / "agents" / "system-journal.md"
    try:
        import db as _db
        arch = [r for r in _db.recent_runs(80) if r.get("role") == "sistemos-architektas"]
        if arch and journal.exists():
            last = arch[0]
            finished = last.get("finished") or ""
            if last.get("status") in ("published", "partial", "ok", "checked") and finished:
                stamp = dt.datetime.fromisoformat(finished).timestamp()
                if journal.stat().st_mtime < stamp - 5:
                    warnings.append("sistemos-architektas baigė darbą, bet agents/system-journal.md nepapildytas")
    except Exception:  # noqa: BLE001
        pass

    if args.json:
        print(json.dumps({"ok": not problems, "problems": problems, "warnings": warnings,
                          "roles": len(roles)}, ensure_ascii=False, indent=2))
        return 0 if not problems else 1

    if problems:
        print("✘ Agentų sistema nesutvarkyta:")
        for p in problems:
            print("  -", p)
        for w in warnings:
            print("  ! ", w)
        return 1

    note = f", įspėjimų {len(warnings)}" if warnings else ""
    print(f"✔ Agentai: {len(roles)} vaidmenų, visi su failais, grafikais ir ribomis{note}")
    for w in warnings:
        print("  ! ", w)
    return 0


if __name__ == "__main__":
    sys.exit(main())
