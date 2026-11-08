#!/usr/bin/env python3
"""
Modelių profilių skaitymas: koks provider ir modelis stovi už kiekvieno agento.

Hermes profilio konfigūracija yra YAML (`~/.hermes/profiles/<prof>/config.yaml`),
bet mums reikia tik dviejų laukų, todėl skaitome be papildomų priklausomybių.
"""

from __future__ import annotations

import pathlib
import re

PROFILES_DIR = pathlib.Path.home() / ".hermes" / "profiles"


def _field(text: str, key: str) -> str:
    """Paima `key: value` iš `model:` bloko (pirma tokia eilutė)."""
    m = re.search(rf"^\s*{key}:\s*(\S+)\s*$", text, re.MULTILINE)
    return m.group(1) if m else ""


def resolve(profile: str) -> dict:
    """Grąžina {profile, provider, model, base_url}."""
    out = {"profile": profile, "provider": "—", "model": "—", "base_url": ""}
    if not profile:
        return out
    cfg = PROFILES_DIR / profile / "config.yaml"
    if not cfg.exists():
        out["model"] = "nėra profilio"
        return out
    try:
        text = cfg.read_text(encoding="utf-8")
    except OSError:
        return out

    # model: blokas
    m = re.search(r"^model:\s*$\n((?:\s+.*\n)+)", text, re.MULTILINE)
    block = m.group(1) if m else text
    out["model"] = _field(block, "default") or _field(block, "name") or "—"
    out["provider"] = _field(block, "provider") or "—"
    out["base_url"] = _field(block, "base_url")
    return out


def calendar_key(cal) -> str:
    """`on_calendar` → palyginama eilutė.

    `publikavimo-agentas` turi PENKIS laikus (sąrašą), visi kiti — vieną
    eilutę. Rikiavimas tiesiog `sorted(..., key=on_calendar)` virsdavo
    `TypeError: '<' not supported between instances of 'list' and 'str'`, todėl
    `system_report.py` modelių lentelė NIEKADA nebuvo parodoma — kas paleidžia
    kiekvieną agentą, nebuvo matoma nė vienoje ataskaitoje (2026-11-08).
    """
    if isinstance(cal, (list, tuple)):
        return min((str(c) for c in cal), default="")
    return str(cal or "")


def for_roles(roles: dict) -> list[dict]:
    """ROLES → eilutės lentelei."""
    rows = []
    for role, cfg in sorted(roles.items(), key=lambda kv: (calendar_key(kv[1].get("on_calendar")), kv[0])):
        info = resolve(cfg.get("profile", ""))
        rows.append({
            "role": role,
            "profile": info["profile"],
            "provider": info["provider"],
            "model": info["model"],
            "cadence": cfg.get("cadence", ""),
            "on_calendar": cfg.get("on_calendar", ""),
            "queue": bool(cfg.get("queue")),
        })
    return rows


if __name__ == "__main__":
    import sys
    sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
    import run as runner

    rows = for_roles(runner.ROLES)
    cols = ["agentas", "profilis", "provider", "modelis", "grafikas"]
    keys = ["role", "profile", "provider", "model", "on_calendar"]
    data = []
    for r in rows:
        cal = calendar_key(r["on_calendar"])
        when = cal.split(" ")[-1].rsplit(":", 1)[0] if ":" in cal else cal
        days = cal.split(" ")[0] if " " in cal else ""
        days = "" if days == "*-*-*" else days.replace(",", ", ")
        label = f"{days + ' ' if days else 'kasdien '}{when}" + (" · eilė" if r["queue"] else "")
        data.append([r["role"], r["profile"], r["provider"], r["model"], label])

    widths = [max(len(str(row[i])) for row in [cols] + data) for i in range(len(cols))]
    line = "  ".join(c.ljust(w) for c, w in zip(cols, widths))
    print(line)
    print("  ".join("-" * w for w in widths))
    for row in data:
        print("  ".join(str(c).ljust(w) for c, w in zip(row, widths)))
