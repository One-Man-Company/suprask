#!/usr/bin/env python3
"""
Sistemos ataskaita sistemininkui (sistemos-architektas).

Vienas šaltinis, iš kurio matosi, ar agentų sistema dirba efektyviai: kiek
paleidimų baigėsi tuščiai, kiek konfliktų, kur stringa pasiūlymai, ar grafikai
sutampa su ROLES, ar turinio patikros žalios.

Naudojimas:
    python3 scripts/system_report.py            # žmogui
    python3 scripts/system_report.py --json     # JSON agentui
    python3 scripts/system_report.py --days 7
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "agents"))

import db  # noqa: E402
import scope as grade_scope  # noqa: E402

BAD = ("empty", "conflict", "rejected", "timeout", "failed", "skipped", "blocked")


def runs_summary(days: int) -> tuple[dict, list[dict]]:
    since = (dt.datetime.now() - dt.timedelta(days=days)).isoformat()
    rows = [r for r in db.recent_runs(400) if (r.get("started") or "") >= since]
    per_role: dict[str, dict] = {}
    for r in rows:
        role = r.get("role") or "?"
        cell = per_role.setdefault(role, {
            "runs": 0, "published": 0, "ok": 0, "empty": 0, "conflict": 0,
            "rejected": 0, "timeout": 0, "skipped": 0, "other": 0,
            "duration_s": 0, "last": None,
        })
        cell["runs"] += 1
        st = (r.get("status") or "other").lower()
        if st in cell:
            cell[st] += 1
        else:
            cell["other"] += 1
        cell["duration_s"] += int(r.get("duration_s") or 0)
        started = r.get("started") or ""
        if cell["last"] is None or started > (cell["last"].get("started") or ""):
            cell["last"] = {"started": started, "status": st, "summary": (r.get("summary") or "")[:160]}
    for cell in per_role.values():
        cell["avg_min"] = round(cell["duration_s"] / max(1, cell["runs"]) / 60, 1)
        cell["useless_ratio"] = round(
            sum(cell[k] for k in ("empty", "conflict", "rejected", "timeout", "skipped")) / max(1, cell["runs"]), 2
        )
    return per_role, rows


def proposals_summary() -> dict:
    rows = db.proposals(500)
    by_status: dict[str, int] = {}
    oldest_new = None
    for r in rows:
        st = r.get("status") or "?"
        by_status[st] = by_status.get(st, 0) + 1
        if st == "new":
            created = r.get("created") or ""
            if created and (oldest_new is None or created < oldest_new):
                oldest_new = created
    age_days = None
    if oldest_new:
        try:
            stamp = dt.datetime.fromisoformat(oldest_new)
            now = dt.datetime.now(stamp.tzinfo) if stamp.tzinfo else dt.datetime.now()
            age_days = (now - stamp).days
        except ValueError:
            age_days = None
    return {"by_status": by_status, "oldest_new_days": age_days, "total": len(rows)}


def timers() -> list[dict]:
    try:
        out = subprocess.run(
            ["systemctl", "--user", "list-timers", "suprask*", "--all", "--no-pager", "--output=json"],
            capture_output=True, text=True, timeout=15,
        ).stdout
        data = json.loads(out) if out.strip().startswith("[") else []
    except Exception:  # noqa: BLE001
        return []
    def iso(usec) -> str:
        try:
            n = int(usec)
        except (TypeError, ValueError):
            return "—"
        if n <= 0:
            return "—"
        return dt.datetime.fromtimestamp(n / 1_000_000).strftime("%Y-%m-%d %H:%M")

    result = []
    for t in data:
        result.append({
            "timer": t.get("unit", ""),
            "activates": t.get("activates", ""),
            "next": iso(t.get("next")),
            "last": iso(t.get("last")),
        })
    return result


def checks() -> dict:
    """Lengvos patikros — be naršyklės."""
    scripts = {
        "turinys": "scripts/validate_content.py",
        "garsas": "scripts/check_audio.py",
        "iliustracijos": "scripts/check_art.py",
        "pamokos": "scripts/check_lessons.py",
        "sąsaja": "scripts/check_ui.py",
        "agentai": "scripts/check_agents.py",
    }
    out = {}
    for name, rel in scripts.items():
        path = ROOT / rel
        if not path.exists():
            out[name] = {"ok": None, "line": "nėra failo"}
            continue
        try:
            proc = subprocess.run([sys.executable, str(path)], cwd=ROOT, capture_output=True, text=True, timeout=300)
            tail = (proc.stdout or proc.stderr).strip().splitlines()
            out[name] = {"ok": proc.returncode == 0, "line": (tail[-1] if tail else "")[:200]}
        except Exception as exc:  # noqa: BLE001
            out[name] = {"ok": False, "line": str(exc)[:200]}
    return out


def roles_config() -> dict:
    try:
        import run as runner
    except Exception as exc:  # noqa: BLE001
        return {"error": str(exc)}
    return {
        r: {
            "cadence": c.get("cadence"),
            "on_calendar": c.get("on_calendar"),
            "profile": c.get("profile"),
            "queue": c.get("queue"),
            "timeout": c.get("timeout"),
            "max_turns": c.get("max_turns"),
        }
        for r, c in runner.ROLES.items()
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--days", type=int, default=7)
    args = ap.parse_args()

    per_role, rows = runs_summary(args.days)
    data = {
        "generated": dt.datetime.now().isoformat(timespec="seconds"),
        "days": args.days,
        "runs": {"total": len(rows), "per_role": per_role},
        "proposals": proposals_summary(),
        "timers": timers(),
        "checks": checks(),
        "roles": roles_config(),
        "scope": {
            "enabled": grade_scope.enabled_grades(),
            "report": grade_scope.report(),
        },
    }

    if args.json:
        print(json.dumps(data, ensure_ascii=False, indent=2))
        return 0

    print(f"AGENTŲ SISTEMOS ATASKAITA · {data['generated']} · paskutinės {args.days} d.")
    print(f"\nPaleidimai: {len(rows)}")
    print(f"{'vaidmuo':<24}{'paleid.':>8}{'publ.':>7}{'tušti':>7}{'konfl.':>7}{'atm.':>6}{'vid.m':>7}{'nenaud.':>9}")
    for role, c in sorted(per_role.items(), key=lambda kv: -kv[1]["runs"]):
        print(f"{role:<24}{c['runs']:>8}{c['published']:>7}{c['empty']:>7}{c['conflict']:>7}"
              f"{c['rejected']:>6}{c['avg_min']:>7}{int(c['useless_ratio'] * 100):>8}%")

    p = data["proposals"]
    print(f"\nPasiūlymai: {p['total']} · " + ", ".join(f"{k} {v}" for k, v in sorted(p["by_status"].items())))
    if p["oldest_new_days"] is not None:
        print(f"Seniausias neapdorotas: prieš {p['oldest_new_days']} d.")

    print("\nPatikros:")
    for name, c in data["checks"].items():
        mark = "✔" if c["ok"] else ("…" if c["ok"] is None else "✘")
        print(f"  {mark} {name}: {c['line']}")

    print("\nGrafikai:")
    for t in data["timers"]:
        print(f"  {t['activates']:<46} next {t['next']}")

    print("\nĮjungtos klasės:", data["scope"]["enabled"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
