#!/usr/bin/env python3
"""
Sistemos pauzė: laikinai sustabdo visus agentus iki nurodytos datos.

Kodėl atskiras failas, o ne scope.json: pauzė yra **laikina būsena**, o ne
turinio apimtis. Ji neturi maišytis su tuo, ką žmogus nusprendė apie klases.

Failas: agents/pause.json
    {"until": "2026-11-11", "set_at": "2026-11-08T10:00", "note": ""}

`is_paused()` grąžina True, kol šiandien < `until`: data reiškia „iki šios
dienos pradžios“, t. y. tą dieną sistema jau dirba.
"""

from __future__ import annotations

import datetime as dt
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAUSE = ROOT / "agents" / "pause.json"


def load() -> dict:
    if PAUSE.exists():
        try:
            data = json.loads(PAUSE.read_text(encoding="utf-8"))
            if isinstance(data, dict):
                return {"until": data.get("until"), "set_at": data.get("set_at"), "note": data.get("note") or ""}
        except json.JSONDecodeError:
            pass
    return {"until": None, "set_at": None, "note": ""}


def save(data: dict) -> None:
    PAUSE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def default_until() -> str:
    """Numatytoji data dashboard'e: einamojo mėnesio 11-oji (dinamiškai)."""
    return dt.date.today().replace(day=11).isoformat()


def set_until(date_str: str, note: str = "") -> dict:
    dt.date.fromisoformat(date_str)  # blogas formatas → ValueError
    data = {"until": date_str, "set_at": dt.datetime.now().isoformat(timespec="seconds"), "note": note}
    save(data)
    return data


def clear() -> None:
    save({"until": None, "set_at": None, "note": ""})


def status() -> dict:
    data = load()
    until = data.get("until")
    base = {"until": None, "days_left": 0, "set_at": data.get("set_at"), "note": data.get("note") or "",
            "default_date": default_until(), "paused": False}
    if not until:
        return base
    try:
        target = dt.date.fromisoformat(str(until))
    except ValueError:
        return base
    days = (target - dt.date.today()).days
    return {**base, "paused": days > 0, "until": str(until), "days_left": max(0, days)}


def is_paused() -> tuple[bool, str]:
    st = status()
    return st["paused"], (st.get("until") or "")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] in ("resume", "start", "clear"):
        clear()
    elif len(sys.argv) > 1:
        set_until(sys.argv[1])
    print(json.dumps(status(), ensure_ascii=False, indent=2))
