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
{on_calendar_lines}
Persistent=true
RandomizedDelaySec=240
Unit=suprask-agent@{role}.service

[Install]
WantedBy=timers.target
"""

# Vienas šablonas visiems grafikos vaidmenims. `TimeoutStartSec` NEGALI būti
# mažesnis už ilgiausią vaidmens biudžetą, nes systemd nužudo procesą tyliai
# (`SIGTERM`), o `run.py` apie tai neparašo nieko — ataskaita atrodo kaip
# nutrūkusi be priežasties. Iki 2026-11-24 čia buvo 3900 s, nors ROLES
# `sistemos-architektas` ir `simuliaciju-inzinierius` turi 14400 s biudžetą:
# kiekvienas ilgesnis nei 65 min paleidimas buvo perkirpamas viduryje darbo.
# Skaičiuojama iš ROLES (`timeout`) + užrakto laukimo (`LOCK_WAIT_QUEUE`).
AGENT_SERVICE = """[Unit]
Description=SUPRASK agentas: %i
Documentation=file:{root}/agents/README.md
After=network-online.target
Wants=network-online.target
StartLimitIntervalSec=0

[Service]
Type=oneshot
WorkingDirectory={root}
# hermes lives in ~/.local/bin, which systemd's default PATH omits.
Environment="PATH=/home/zoltanas/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
Environment="SUPRASK_HERMES_BIN=/home/zoltanas/.local/bin/hermes"
ExecStart=/usr/bin/python3 {root}/agents/run.py %i
# Ilgiausias vaidmens biudžetas + laukimas užrakto + rezervas publikavimui.
# Skaičius skaičiuojamas žemiau iš ROLES ir LOCK_WAIT_QUEUE — ne rašomas ranka.
TimeoutStartSec={timeout}
Nice=10
StandardOutput=journal
StandardError=journal
"""


def agent_service_timeout() -> int:
    """`TimeoutStartSec` grafikos vaidmenims: ilgiausias biudžetas + laukimas."""
    longest = max((int(c["timeout"]) for c in runner.ROLES.values() if not c.get("queue")),
                  default=3600)
    return longest + runner.LOCK_WAIT_QUEUE + 600


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
            TIMER.format(
                role=role,
                cadence=cfg["cadence"],
                on_calendar_lines="\n".join(
                    f"OnCalendar={c}" for c in
                    (cfg["on_calendar"] if isinstance(cfg["on_calendar"], list) else [cfg["on_calendar"]])
                ),
            )
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

    # Šablonas `suprask-agent@.service` generuojamas taip pat, kad jo
    # `TimeoutStartSec` negalėtų atsilikti nuo ROLES (žr. AGENT_SERVICE).
    agent_unit = OUT / "suprask-agent@.service"
    agent_unit.write_text(
        AGENT_SERVICE.format(root=ROOT, timeout=agent_service_timeout()),
        encoding="utf-8",
    )
    print(f"Šablonas: {agent_unit.relative_to(ROOT)} "
          f"(TimeoutStartSec={agent_service_timeout()})")

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
