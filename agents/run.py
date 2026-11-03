#!/usr/bin/env python3
"""
SUPRASK agentų bėgiklis.

Paleidžia vieną agento vaidmenį per Hermes profilį, įrašo žurnalą ir
atnaujina būseną. Skirtas systemd timeriams ir rankiniam paleidimui.

    python3 agents/run.py kuratorius
    python3 agents/run.py tyrejas --dry-run

Kiekvienas agentas privalo laikytis docs/SVIETIMAS-1-GAIRES.md.
"""

from __future__ import annotations

import argparse
import datetime as dt
import fcntl
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AGENTS = ROOT / "agents"
LOG_DIR = AGENTS / "log"
STATE_FILE = AGENTS / "state.json"
LOCK_FILE = AGENTS / ".run.lock"

HERMES = os.environ.get("SUPRASK_HERMES_BIN") or shutil.which("hermes") or "/home/zoltanas/.local/bin/hermes"

ROLES = {
    "tyrejas": {
        "file": "roles/tyrejas.md",
        "profile": "deepseekpro",
        "toolsets": "terminal,file,web",
        "max_turns": 40,
        "budget": 1500,
        "description": "Tiria naujus metodus ir tyrimus, papildo research/wiki/",
    },
    "kurejas": {
        "file": "roles/kurejas.md",
        "profile": "deepseekpro",
        "toolsets": "terminal,file,web",
        "max_turns": 60,
        "budget": 2400,
        "description": "Kuria vieną naują modulį pagal gaires ir atidaro PR",
    },
    "tikrintojas": {
        "file": "roles/tikrintojas.md",
        "profile": "deepseek41flash",
        "toolsets": "terminal,file,web",
        "max_turns": 30,
        "budget": 900,
        "description": "Validuoja turinį ir sąsają, registruoja klaidas",
    },
    "sveikatos-inspektorius": {
        "file": "roles/sveikatos-inspektorius.md",
        "profile": "deepseek41flash",
        "toolsets": "terminal,file,web",
        "max_turns": 30,
        "budget": 900,
        "description": "Tikrina gyvą svetainę, nuorodas ir našumą",
    },
    "kuratorius": {
        "file": "roles/kuratorius.md",
        "profile": "deepseek41flash",
        "toolsets": "terminal,file,web",
        "max_turns": 30,
        "budget": 900,
        "description": "Apibendrina savaitę, atnaujina būseną ir changelog",
    },
}

HEADER = """Tu esi SUPRASK platformos agentas. SUPRASK — atvira, nemokama interaktyvi vizualinio mokymosi
platforma Lietuvos 1–12 klasei (šiuo metu parengta 1 klasė, 13 modulių).

PRIVALOMA TVARKA
1. Perskaityk: docs/SVIETIMAS-1-GAIRES.md, docs/KURINIO-STANDARTAS.md, docs/ARCHITEKTURA.md.
2. Perskaityk savo vaidmens failą (jis įtrauktas žemiau) ir agents/state.json.
3. Dirbk TIK savo vaidmens ribose. Nekeisk kitų vaidmenų failų.
4. NENAUDOK išorinių paslaugų, mokamų API, CDN. Niekur nerašyk asmens duomenų.
5. Baigęs įrašyk ataskaitą į agents/log/ ir atnaujink agents/state.json.

PROJEKTO KATALOGAS: {root}
ŠIANDIEN: {today}

--- VAIDMUO: {role} ---
{role_text}

--- BŪSENA (agents/state.json) ---
{state}

--- PASKUTINĖS ATASKAITOS IŠTRAUKA ---
{last_log}

--- BAIGTIES SĄLYGA ---
{definition_of_done}
"""


def read(path: Path, default: str = "") -> str:
    try:
        return path.read_text(encoding="utf-8")
    except OSError:
        return default


def last_log_excerpt(role: str, limit: int = 4000) -> str:
    logs = sorted(LOG_DIR.glob(f"{role}-*.md"))
    if not logs:
        return "(dar nėra)"
    return read(logs[-1])[-limit:]


def build_prompt(role: str, cfg: dict) -> str:
    role_text = read(AGENTS / cfg["file"])
    if not role_text:
        raise SystemExit(f"Nerastas vaidmens failas: {cfg['file']}")
    state = read(STATE_FILE, "{}")
    try:
        state_obj = json.loads(state)
        state_pretty = json.dumps(state_obj, ensure_ascii=False, indent=2)
    except json.JSONDecodeError:
        state_pretty = state
    dod = ""
    for line in role_text.splitlines():
        if line.lower().startswith("## baigties sąlyga"):
            dod = role_text.split(line, 1)[1].strip()
            break
    return HEADER.format(
        root=ROOT,
        today=dt.date.today().isoformat(),
        role=role,
        role_text=role_text.strip(),
        state=state_pretty[:6000],
        last_log=last_log_excerpt(role),
        definition_of_done=dod or "Įrašyk ataskaitą ir grąžink trumpą santrauką.",
    )


def update_state(role: str, cfg: dict, exit_code: int, log_path: Path) -> None:
    try:
        state = json.loads(read(STATE_FILE, "{}"))
    except json.JSONDecodeError:
        state = {}
    state.setdefault("roles", {})[role] = {
        "last_run": dt.datetime.now().isoformat(timespec="seconds"),
        "exit_code": exit_code,
        "log": str(log_path.relative_to(ROOT)),
        "description": cfg["description"],
    }
    state["updated"] = dt.datetime.now().isoformat(timespec="seconds")
    STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("role", choices=sorted(ROLES))
    ap.add_argument("--dry-run", action="store_true", help="tik parodyti promptą")
    ap.add_argument("--timeout", type=int, default=3600)
    args = ap.parse_args()

    cfg = ROLES[args.role]
    prompt = build_prompt(args.role, cfg)

    if args.dry_run:
        print(prompt)
        return 0

    LOG_DIR.mkdir(parents=True, exist_ok=True)
    stamp = dt.datetime.now().strftime("%Y-%m-%dT%H%M")
    log_path = LOG_DIR / f"{args.role}-{stamp}.md"

    LOCK_FILE.parent.mkdir(parents=True, exist_ok=True)
    lock_handle = open(LOCK_FILE, "w")
    try:
        fcntl.flock(lock_handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        print(f"{args.role}: kitas agentas jau dirba — praleidžiama")
        return 0

    fd, query_path = tempfile.mkstemp(prefix=f"suprask-{args.role}-", suffix=".txt")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(prompt)

        cmd = [
            HERMES, "-p", cfg["profile"], "chat",
            "--query-file", query_path,
            "-Q",
            "-t", cfg["toolsets"],
            "--max-turns", str(cfg["max_turns"]),
            "--run-budget", str(cfg["budget"]),
            "--in", str(ROOT),
        ]
        started = dt.datetime.now()
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=args.timeout)
        elapsed = (dt.datetime.now() - started).total_seconds()
        out = (proc.stdout or "").strip()
        err = (proc.stderr or "").strip()

        log_path.write_text(
            f"# {args.role} — {stamp}\n\n"
            f"- trukmė: {elapsed:.0f}s\n"
            f"- exit: {proc.returncode}\n"
            f"- modelis: hermes:{cfg['profile']}\n\n"
            f"## Ataskaita\n\n{out or '(tuščia)'}\n\n"
            + (f"## klaidos\n\n```\n{err[-2000:]}\n```\n" if err else ""),
            encoding="utf-8",
        )
        update_state(args.role, cfg, proc.returncode, log_path)
        print(f"{args.role}: baigta per {elapsed:.0f}s, exit={proc.returncode}, žurnalas {log_path.relative_to(ROOT)}")
        return 0 if proc.returncode == 0 else 1
    except subprocess.TimeoutExpired:
        log_path.write_text(f"# {args.role} — {stamp}\n\nBaigėsi laikas ({args.timeout}s).\n", encoding="utf-8")
        update_state(args.role, cfg, 124, log_path)
        print(f"{args.role}: baigėsi laikas")
        return 124
    finally:
        Path(query_path).unlink(missing_ok=True)
        fcntl.flock(lock_handle, fcntl.LOCK_UN)
        lock_handle.close()


if __name__ == "__main__":
    sys.exit(main())
