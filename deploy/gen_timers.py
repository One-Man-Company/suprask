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

QUEUE_SERVICE = """[Unit]
Description=SUPRASK — {role} eilė ({cadence})
After=network-online.target
Wants=network-online.target
StartLimitIntervalSec=0

[Service]
Type=oneshot
WorkingDirectory={root}
Environment="PATH=/home/zoltanas/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
Environment="SUPRASK_HERMES_BIN=/home/zoltanas/.local/bin/hermes"
ExecStart=/usr/bin/python3 {root}/{command} --max-items {max_items} --max-minutes {max_minutes}
TimeoutStartSec={timeout}
Nice=10
StandardOutput=journal
StandardError=journal
"""

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
        queue = cfg.get("queue")
        unit = f"suprask-{role}-queue.service" if queue else f"suprask-agent@{role}.service"
        path.write_text(
            TIMER.format(role=role, cadence=cfg["cadence"], on_calendar=cfg["on_calendar"])
            .replace(f"Unit=suprask-agent@{role}.service", f"Unit={unit}"),
            encoding="utf-8",
        )
        written.append(path)
        if queue:
            (OUT / unit).write_text(
                QUEUE_SERVICE.format(role=role, cadence=cfg["cadence"], root=ROOT,
                                     command=queue["command"], max_items=queue["max_items"],
                                     max_minutes=queue["max_minutes"],
                                     timeout=int(queue["max_minutes"]) * 60 + 3600),
                encoding="utf-8",
            )

    print(f"Sugeneruota timerių: {len(written)}")

    if args.install:
        USER_UNITS.mkdir(parents=True, exist_ok=True)
        for f in [OUT / "suprask-agent@.service", OUT / "suprask-dashboard.service", *written, *OUT.glob("suprask-*-queue.service")]:
            if f.exists():
                shutil.copy2(f, USER_UNITS / f.name)
        subprocess.run(["systemctl", "--user", "daemon-reload"], check=False)
        units = [f"suprask-{r}.timer" for r in runner.ROLES]
        subprocess.run(["systemctl", "--user", "enable", "--now", *units], check=False)
        print("Įdiegta ir įjungta:", ", ".join(units))
    return 0


if __name__ == "__main__":
    sys.exit(main())
