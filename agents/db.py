#!/usr/bin/env python3
"""
SUPRASK agentų registro duomenų bazė (SQLite, be išorinių priklausomybių).

Viena vieta, kur matosi: kas paleista, kada, kuo baigėsi, ką palietė ir kokius
pasiūlymus pateikė. Dashboard skaito tik iš čia.
"""

from __future__ import annotations

import json
import pathlib
import sqlite3
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "agents" / "runs.db"


# Stulpeliai, atsirandantys vėliau — pridedami saugiai, jei jų dar nėra.
_EXTRA_COLUMNS = (
    ("runs", "commit_sha", "TEXT"),
    ("runs", "pr_url", "TEXT"),
    ("runs", "validation", "TEXT"),
    # Bėgiklio sprendimas („Paskelbta 2 failų“, „Konfliktas su origin/main: …“).
    # Be jo konflikto priežastis likdavo tik stdout'e ir dingdavo su terminalu:
    # 18 paleidimų iš eilės krito, o kodėl — niekur nebuvo užrašyta.
    ("runs", "detail", "TEXT"),
    ("proposals", "note", "TEXT"),
)


def _migrate(conn) -> None:
    for table, column, ctype in _EXTRA_COLUMNS:
        have = {r[1] for r in conn.execute(f"PRAGMA table_info({table})")}
        if column not in have:
            conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {ctype}")

SCHEMA = """
CREATE TABLE IF NOT EXISTS runs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    role        TEXT NOT NULL,
    trigger     TEXT NOT NULL DEFAULT 'manual',
    status      TEXT NOT NULL DEFAULT 'running',
    started     TEXT NOT NULL,
    finished    TEXT,
    exit_code   INTEGER,
    duration_s  INTEGER,
    log_path    TEXT,
    summary     TEXT,
    artifacts   TEXT,
    model       TEXT,
    note        TEXT
);
CREATE INDEX IF NOT EXISTS idx_runs_role ON runs(role);
CREATE INDEX IF NOT EXISTS idx_runs_started ON runs(started DESC);

CREATE TABLE IF NOT EXISTS proposals (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    file        TEXT UNIQUE NOT NULL,
    role        TEXT,
    run_id      INTEGER,
    created     TEXT,
    type        TEXT,
    title       TEXT,
    body        TEXT,
    target      TEXT,
    priority    TEXT,
    status      TEXT DEFAULT 'new',
    evidence    TEXT
);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);

CREATE TABLE IF NOT EXISTS schedule (
    role        TEXT PRIMARY KEY,
    cadence     TEXT,
    on_calendar TEXT,
    enabled     INTEGER DEFAULT 1,
    last_run    TEXT,
    next_run    TEXT
);
"""


def now() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")


def connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=20)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init() -> None:
    with connect() as conn:
        conn.executescript(SCHEMA)
        _migrate(conn)


def start_run(role: str, trigger: str, model: str, note: str = "") -> int:
    with connect() as conn:
        cur = conn.execute(
            "INSERT INTO runs (role, trigger, status, started, model, note) VALUES (?, ?, 'running', ?, ?, ?)",
            (role, trigger, now(), model, note),
        )
        return int(cur.lastrowid)


def finish_run(
    run_id: int,
    status: str,
    exit_code: int | None,
    duration_s: int,
    log_path: str,
    summary: str,
    artifacts: list[str] | None = None,
    commit_sha: str = "",
    pr_url: str = "",
    validation: str = "",
    detail: str = "",
) -> None:
    with connect() as conn:
        conn.execute(
            """UPDATE runs SET status=?, finished=?, exit_code=?, duration_s=?, log_path=?, summary=?, artifacts=?,
                               commit_sha=?, pr_url=?, validation=?, detail=?
               WHERE id=?""",
            (status, now(), exit_code, duration_s, log_path, summary[:4000],
             json.dumps(artifacts or [], ensure_ascii=False), commit_sha, pr_url, validation[:2000],
             detail[:500], run_id),
        )


def recent_runs(limit: int = 50, role: str | None = None) -> list[dict]:
    q = "SELECT * FROM runs"
    args: list = []
    if role:
        q += " WHERE role=?"
        args.append(role)
    q += " ORDER BY id DESC LIMIT ?"
    args.append(limit)
    with connect() as conn:
        return [dict(r) for r in conn.execute(q, args)]


def role_stats() -> list[dict]:
    with connect() as conn:
        rows = conn.execute(
            """SELECT role,
                      COUNT(*) AS total,
                      SUM(CASE WHEN status='ok' THEN 1 ELSE 0 END) AS ok,
                      SUM(CASE WHEN status IN ('failed','timeout') THEN 1 ELSE 0 END) AS bad,
                      MAX(finished) AS last_finished
               FROM runs GROUP BY role ORDER BY role"""
        ).fetchall()
        return [dict(r) for r in rows]


def upsert_proposals(files: list[pathlib.Path]) -> int:
    """Nuskaito agents/proposals/*.json ir įrašo į DB (idempotentiškai)."""
    count = 0
    with connect() as conn:
        for f in files:
            try:
                data = json.loads(f.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                continue
            rel = str(f.relative_to(ROOT))
            conn.execute(
                """INSERT INTO proposals (file, role, run_id, created, type, title, body, target, priority, status, evidence)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                   ON CONFLICT(file) DO UPDATE SET
                     title=excluded.title, body=excluded.body, target=excluded.target,
                     priority=excluded.priority, evidence=excluded.evidence
                   -- „status“ SAMONINGAI neperrašomas: pasiūlymo failas visada sako
                   -- „new“, o tikroji būsena (done / blocked / obsolete) gyvena DB.
                   -- Anksčiau ši eilutė grąžindavo įgyvendintus pasiūlymus į eilę.""",
                (
                    rel,
                    data.get("role"),
                    data.get("run_id"),
                    data.get("created") or now(),
                    data.get("type"),
                    data.get("title"),
                    data.get("body"),
                    data.get("target"),
                    data.get("priority", "normal"),
                    data.get("status", "new"),
                    json.dumps(data.get("evidence", []), ensure_ascii=False),
                ),
            )
            count += 1
    return count


def proposals(limit: int = 100, status: str | None = None) -> list[dict]:
    q = "SELECT * FROM proposals"
    args: list = []
    if status:
        q += " WHERE status=?"
        args.append(status)
    q += " ORDER BY id DESC LIMIT ?"
    args.append(limit)
    with connect() as conn:
        return [dict(r) for r in conn.execute(q, args)]


def set_proposal_status(proposal_id: int, status: str, note: str = "") -> None:
    with connect() as conn:
        conn.execute("UPDATE proposals SET status=?, note=? WHERE id=?", (status, note, proposal_id))


def content_stats() -> dict:
    """Skaičiuoja turinį tiesiai iš failų — dashboard rodo tikrovę, ne įrašus."""
    modules = 0
    tasks = 0
    sims = set()
    for f in (ROOT / "content" / "lt").glob("grade-*/**/*.json"):
        if f.name in ("index.json", "path.json"):
            continue
        try:
            d = json.loads(f.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        modules += 1
        tasks += len(d.get("tasks") or [])
        if (d.get("sim") or {}).get("component"):
            sims.add(d["sim"]["component"])
    audio_dir = ROOT / "assets" / "audio" / "lt"
    audio = list(audio_dir.glob("*/*.mp3"))
    # „Įrašų“ skaičius turi reikšti tai, ką vaikas gali išgirsti. Diske gali
    # likti failų, kurių manifestas nebemini (2026-11-09: 14 iš 1014); jei
    # rodomas vien disko skaičius, jis atrodo kaip panaudotas turtas, nors
    # dalis jo negrojama nė viename modulyje.
    used = len(audio)
    try:
        manifest = json.loads((audio_dir / "manifest.json").read_text(encoding="utf-8"))
        refs = {entry.get(v) for entry in manifest.values() if isinstance(entry, dict)
                for v in ("n", "s") if entry.get(v)}
        used = len(refs)
    except (OSError, json.JSONDecodeError):
        pass
    live = 0
    try:
        grades = json.loads((ROOT / "content" / "lt" / "grades.json").read_text(encoding="utf-8"))
        live = sum(1 for g in grades.get("grades", []) if g.get("status") == "live")
    except (OSError, json.JSONDecodeError):
        live = 0
    return {
        "modules": modules,
        "tasks": tasks,
        "sims": len(sims),
        "grades_live": live,
        "audio_files": used,
        "audio_total": len(audio),
        "audio_mb": round(sum(a.stat().st_size for a in audio) / 1024 / 1024, 1),
    }


if __name__ == "__main__":
    init()
    print(f"DB paruošta: {DB_PATH}")
    print(json.dumps(content_stats(), ensure_ascii=False, indent=1))
