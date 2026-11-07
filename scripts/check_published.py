#!/usr/bin/env python3
"""
Publikavimo būklė: kiek turinio yra repo ir kiek realiai pasiekė gyvą svetainę.

Skirtumas tarp „sukurta“ ir „paskelbta“ anksčiau nebuvo matomas: dashboard
skaičiavo failus diske, o svetainėje modulių buvo mažiau. Šis įrankis lygina
abi puses ir, svarbiausia, tikrina, ar nepradingo nė vienas modulio ID —
nuo to priklauso vaiko `localStorage` pažanga.

Naudojimas:
    python3 scripts/check_published.py          # žmogui
    python3 scripts/check_published.py --json   # dashboard'ui
"""

from __future__ import annotations

import argparse
import json
import pathlib
import subprocess
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = ROOT / "content" / "lt" / "grade-01" / "index.json"
PATH_DOC = ROOT / "content" / "lt" / "grade-01" / "path.json"
LIVE_INDEX = "https://one-man-company.github.io/suprask/content/lt/grade-01/index.json"
LIVE_ROOT = "https://one-man-company.github.io/suprask/"


def local_modules() -> tuple[dict, list[str]]:
    data = json.loads(INDEX.read_text(encoding="utf-8"))
    ids = [m["id"] for s in data.get("strands", []) for m in s.get("modules", [])]
    return data, ids


def live_modules(timeout: int = 20) -> tuple[dict | None, list[str], str]:
    try:
        req = urllib.request.Request(LIVE_INDEX, headers={"User-Agent": "suprask-check/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        ids = [m["id"] for s in data.get("strands", []) for m in s.get("modules", [])]
        return data, ids, ""
    except Exception as exc:  # noqa: BLE001
        return None, [], f"{type(exc).__name__}: {exc}"


def unpushed() -> list[str]:
    try:
        out = subprocess.run(
            ["git", "rev-list", "origin/main..HEAD"], cwd=ROOT, capture_output=True, text=True, timeout=30
        ).stdout.split()
        return [c for c in out if c]
    except Exception:  # noqa: BLE001
        return []


def last_commit() -> str:
    try:
        return subprocess.run(
            ["git", "log", "--oneline", "-1"], cwd=ROOT, capture_output=True, text=True, timeout=20
        ).stdout.strip()
    except Exception:  # noqa: BLE001
        return ""


def report() -> dict:
    _, local_ids = local_modules()
    _, live_ids, live_err = live_modules()
    seq = []
    try:
        seq = list(json.loads(PATH_DOC.read_text(encoding="utf-8")).get("sequence", []))
    except (OSError, json.JSONDecodeError):
        pass

    missing_on_live = [m for m in local_ids if m not in live_ids]
    hidden_locally = [m for m in live_ids if m not in local_ids]
    not_in_path = [m for m in local_ids if m not in seq]

    return {
        "local": len(local_ids),
        "published": len(live_ids),
        "missing_on_live": missing_on_live,
        "hidden_locally": hidden_locally,   # dingo iš repo — pavojus pažangai
        "not_in_path": not_in_path,
        "unpushed_commits": len(unpushed()),
        "last_commit": last_commit(),
        "live_error": live_err,
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    data = report()

    if args.json:
        print(json.dumps(data, ensure_ascii=False))
    else:
        print(f"Repozitorija: {data['local']} moduliai")
        print(f"Paskelbta:    {data['published']} moduliai")
        if data["live_error"]:
            print(f"Gyvos svetainės klaida: {data['live_error']}")
        if data["missing_on_live"]:
            print(f"NESKELBTA ({len(data['missing_on_live'])}): {', '.join(data['missing_on_live'])}")
        if data["hidden_locally"]:
            print(f"PAVOJUS PAŽANGAI — svetainėje yra, repo ne ({len(data['hidden_locally'])}): {', '.join(data['hidden_locally'])}")
        if data["not_in_path"]:
            print(f"NĖRA path.json sekoje ({len(data['not_in_path'])}): {', '.join(data['not_in_path'])}")
        if data["unpushed_commits"]:
            print(f"Neišstumta commit'ų: {data['unpushed_commits']}")
        if not any([data["missing_on_live"], data["hidden_locally"], data["not_in_path"], data["unpushed_commits"]]):
            print("✔ Repo ir gyva svetainė sutampa.")

    problems = bool(data["missing_on_live"] or data["hidden_locally"] or data["not_in_path"] or data["unpushed_commits"] or data["live_error"])
    return 1 if problems else 0


if __name__ == "__main__":
    raise SystemExit(main())
