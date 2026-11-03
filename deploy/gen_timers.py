#!/usr/bin/env python3
"""
Generuoja systemd --user timerius iš agents/run.py ROLES lentelės.

Taip grafikas niekada neišsiderina su agentų sąrašu: vienas šaltinis tiesos.

Naudojimas:
    python3 deploy/gen_timers.py            # įrašyti į deploy/systemd/
    python3 deploy/gen_timers.py --install  # ir įdiegti į ~/.config/systemd/user
"""

from __future__ import annotations

import argparse
import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "deploy" / "systemd"
USER_UNITS = pathlib.Path.home() / ".config" / "systemd" / "user"

sys.path.insert(0, str(ROOT / "agents"))
import run as runner  # noqa: E402

TIMER = """[Unit]
Description=SUPRASK — {role} ({cadence})

[Timer]
# Sugeneruota iš agents/run.py ROLES. Nekeisk ranka — paleisk deploy/gen_timers.py.
OnCalendar={on_calendar}
Persistent=true
RandomizedDelaySec=240
Unit=suprask-agent@{role}.service

[Install]
WantedBy=timers.target
"""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--install", action="store_true")
    args = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    written = []
    for role, cfg in sorted(runner.ROLES.items()):
        path = OUT / f"suprask-{role}.timer"
        path.write_text(TIMER.format(role=role, cadence=cfg["cadence"], on_calendar=cfg["on_calendar"]), encoding="utf-8")
        written.append(path)

    print(f"Sugeneruota timerių: {len(written)}")

    if args.install:
        USER_UNITS.mkdir(parents=True, exist_ok=True)
        for f in [OUT / "suprask-agent@.service", OUT / "suprask-dashboard.service", *written]:
            if f.exists():
                shutil.copy2(f, USER_UNITS / f.name)
        subprocess.run(["systemctl", "--user", "daemon-reload"], check=False)
        units = [f"suprask-{r}.timer" for r in runner.ROLES]
        subprocess.run(["systemctl", "--user", "enable", "--now", *units], check=False)
        print("Įdiegta ir įjungta:", ", ".join(units))
    return 0


if __name__ == "__main__":
    sys.exit(main())
