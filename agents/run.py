#!/usr/bin/env python3
"""
SUPRASK agentų bėgiklis (v2).

Vienas paleidimas = vienas vaidmuo = vienas įrašas `agents/runs.db`.
Registras yra vienintelis tiesos šaltinis dashboard'ui.

    python3 agents/run.py kritikas
    python3 agents/run.py ideator --trigger dashboard
    python3 agents/run.py kurejas --dry-run

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

import db

ROOT = Path(__file__).resolve().parent.parent
AGENTS = ROOT / "agents"
LOG_DIR = AGENTS / "log"
WORK_DIR = AGENTS / "work"
PROPOSALS = AGENTS / "proposals"
STATE_FILE = AGENTS / "state.json"
LOCK_FILE = AGENTS / ".run.lock"

HERMES = os.environ.get("SUPRASK_HERMES_BIN") or shutil.which("hermes") or "/home/zoltanas/.local/bin/hermes"

# Atsarginis profilis, jei pagrindinio providerio raktas atmetamas (401/429).
FALLBACK_PROFILE = os.environ.get("SUPRASK_FALLBACK_PROFILE", "deepseek41flash")

# Požymiai, kad tai providerio klaida, o ne atsakymas.
FAIL_MARKERS = (
    "rejected your api key",
    "http 401",
    "http 429",
    "can't be reached",
    "provider said",
    "rate limit",
)

# Vaidmuo → failas, profilis, įrankių rinkinys, limitai, grafikas
ROLES: dict[str, dict] = {
    "ideator": {
        "file": "roles/ideator.md", "profile": "deepseek41flash", "toolsets": "terminal,file,web",
        "max_turns": 30, "budget": 1200, "timeout": 1800,
        "cadence": "kasdien", "on_calendar": "*-*-* 07:10:00",
        "description": "Ieško naujų pamokų idėjų ir temų, teikia pasiūlymus",
    },
    "metodininkas": {
        "file": "roles/metodininkas.md", "profile": "deepseek41flash", "toolsets": "terminal,file,web",
        "max_turns": 40, "budget": 1500, "timeout": 2400,
        "cadence": "kasdien", "on_calendar": "*-*-* 08:20:00",
        "description": "Kuria vaizdavimo metodus ir simuliacijų scenarijus pasiūlymams",
    },
    "kurejas": {
        "file": "roles/kurejas.md", "profile": "deepseek41flash", "toolsets": "terminal,file,web",
        "max_turns": 60, "budget": 2400, "timeout": 3600,
        "cadence": "kasdien", "on_calendar": "*-*-* 09:30:00",
        "description": "Kuria po vieną modulį pagal patvirtintus metodus, atidaro PR",
    },
    "simuliaciju-inzinierius": {
        "file": "roles/simuliaciju-inzinierius.md", "profile": "deepseek41flash", "toolsets": "terminal,file,web",
        "max_turns": 60, "budget": 2400, "timeout": 3600,
        "cadence": "kasdien", "on_calendar": "*-*-* 11:00:00",
        "description": "Kuria ir tobulina interaktyvias simuliacijas, atidaro PR",
    },
    "dizaineris": {
        "file": "roles/dizaineris.md", "profile": "deepseek41flash", "toolsets": "terminal,file,web",
        "max_turns": 30, "budget": 1200, "timeout": 1800,
        "cadence": "antradieniais, ketvirtadieniais, šeštadieniais", "on_calendar": "Tue,Thu,Sat *-*-* 12:30:00",
        "description": "Tobulina klasių struktūrą ir sąsają (desktop/tablet pirmiausia)",
    },
    "kritikas": {
        "file": "roles/kritikas.md", "profile": "deepseekv4flashlatest", "toolsets": "terminal,file,web",
        "max_turns": 40, "budget": 1800, "timeout": 2400,
        "cadence": "kasdien", "on_calendar": "*-*-* 14:00:00",
        "description": "Nepriklausoma kritika: pedagogika, UX, turinio teiginiai, gairių laikymasis",
    },
    "programos-derintojas": {
        "file": "roles/programos-derintojas.md", "profile": "deepseek41flash", "toolsets": "terminal,file,web",
        "max_turns": 40, "budget": 1500, "timeout": 2400,
        "cadence": "pirmadieniais, ketvirtadieniais", "on_calendar": "Mon,Thu *-*-* 15:00:00",
        "description": "Derina turinį su oficialia programa ir amžiaus tinkamumu",
    },
    "leidejas": {
        "file": "roles/leidejas.md", "profile": "deepseek41flash", "toolsets": "terminal,file,web",
        "max_turns": 30, "budget": 1200, "timeout": 1800,
        "cadence": "kasdien", "on_calendar": "*-*-* 16:30:00",
        "description": "Sujungia patvirtintus PR, atnaujina changelog ir publikavimą",
    },
    "tikrintojas": {
        "file": "roles/tikrintojas.md", "profile": "deepseek41flash", "toolsets": "terminal,file,web",
        "max_turns": 30, "budget": 900, "timeout": 1200,
        "cadence": "kasdien", "on_calendar": "*-*-* 06:40:00",
        "description": "Validuoja turinį ir sąsają, registruoja klaidas",
    },
    "sveikatos-inspektorius": {
        "file": "roles/sveikatos-inspektorius.md", "profile": "deepseek41flash", "toolsets": "terminal,file,web",
        "max_turns": 30, "budget": 900, "timeout": 1200,
        "cadence": "ketvirtadieniais", "on_calendar": "Thu *-*-* 06:50:00",
        "description": "Tikrina gyvą svetainę, nuorodas ir našumą",
    },
    "tyrejas": {
        "file": "roles/tyrejas.md", "profile": "deepseek41flash", "toolsets": "terminal,file,web",
        "max_turns": 40, "budget": 1500, "timeout": 2400,
        "cadence": "pirmadieniais", "on_calendar": "Mon *-*-* 07:00:00",
        "description": "Tiria naujus metodus ir tyrimus, papildo research/wiki/",
    },
    "kuratorius": {
        "file": "roles/kuratorius.md", "profile": "deepseek41flash", "toolsets": "terminal,file,web",
        "max_turns": 30, "budget": 900, "timeout": 1200,
        "cadence": "sekmadieniais", "on_calendar": "Sun *-*-* 18:00:00",
        "description": "Savaitės suvestinė, changelog, atviri klausimai",
    },
}

HEADER = """Tu esi SUPRASK platformos agentas. SUPRASK — atvira, nemokama, interaktyvi vizualinio
mokymosi platforma Lietuvos 1–12 klasei. Šiuo metu gyva 1 klasė (13 modulių, 13 simuliacijų).

PRIVALOMA TVARKA
1. Perskaityk: docs/SVIETIMAS-1-GAIRES.md, docs/KURINIO-STANDARTAS.md, docs/ARCHITEKTURA.md.
2. Perskaityk savo vaidmens failą (įtrauktas žemiau), agents/state.json ir agents/proposals/.
3. Dirbk TIK savo vaidmens ribose. Nekeisk kitų vaidmenų failų, nekeisk AGENTS.md.
4. NENAUDOK mokamų paslaugų, CDN, išorinių API. Niekur nerašyk asmens duomenų.
5. Baigęs įrašyk ataskaitą į agents/log/ ir atnaujink agents/state.json.

PROJEKTO KATALOGAS: {root}
ŠIANDIEN: {today}
PALEIDIMO NR.: {run_id}

--- PLATFORMOS BŪKLĖ ---
{stats}

--- PASKUTINIAI PALEIDIMAI ---
{recent}

--- ATVIRI PASIŪLYMAI ---
{proposals}

--- VAIDMUO: {role} ---
{role_text}

--- PASKUTINĖ TAVO ATASKAITA (ištrauka) ---
{last_log}

--- BAIGTIES SĄLYGA ---
{definition_of_done}
"""

PROPOSAL_RULES = """
--- PASIŪLYMŲ FORMATAS ---
Jei tavo vaidmuo teikia pasiūlymus, rašyk juos į `agents/proposals/<data>-<vaidmuo>-<slug>.json`:

{
  "role": "ideator",
  "run_id": <paleidimo nr.>,
  "created": "<ISO laikas>",
  "type": "tema|metodas|simuliacija|struktura|ux|kritika|atitiktis",
  "title": "trumpas pavadinimas",
  "body": "kas siūloma ir kodėl (lietuviškai, 3–8 sakiniai)",
  "target": "content/lt/grade-XX/... arba assets/js/sims/...",
  "priority": "high|normal|low",
  "status": "new",
  "evidence": ["šaltinis arba failas, kuriuo remiamasi"]
}
Vienas paleidimas — ne daugiau kaip 3 pasiūlymai. Pasiūlymas be šaltinio arba be konkretaus tikslo yra atmestas.
"""


def read(path: Path, default: str = "") -> str:
    try:
        return path.read_text(encoding="utf-8")
    except OSError:
        return default


def last_log_excerpt(role: str, limit: int = 3000) -> str:
    logs = sorted(LOG_DIR.glob(f"{role}-*.md"))
    if not logs:
        return "(dar nėra)"
    return read(logs[-1])[-limit:]


def platform_stats() -> str:
    try:
        return json.dumps(db.content_stats(), ensure_ascii=False)
    except Exception:  # noqa: BLE001
        return "{}"


def recent_runs_text(limit: int = 12) -> str:
    try:
        rows = db.recent_runs(limit)
    except Exception:  # noqa: BLE001
        return "(nėra duomenų)"
    if not rows:
        return "(dar nėra paleidimų)"
    lines = ["id | vaidmuo | statusas | trukmė | baigta"]
    for r in rows:
        lines.append(f"{r['id']} | {r['role']} | {r['status']} | {r['duration_s'] or '-'}s | {r['finished'] or '-'}")
    return "\n".join(lines)


def open_proposals_text(limit: int = 10) -> str:
    try:
        rows = db.proposals(limit, status="new")
    except Exception:  # noqa: BLE001
        return "(nėra duomenų)"
    if not rows:
        return "(atvirų pasiūlymų nėra)"
    out = []
    for r in rows:
        out.append(f"#{r['id']} [{r['type']}/{r['priority']}] {r['title']} → {r['target']}")
    return "\n".join(out)


def build_prompt(role: str, cfg: dict, run_id: int) -> str:
    role_text = read(AGENTS / cfg["file"])
    if not role_text:
        raise SystemExit(f"Nerastas vaidmens failas: {cfg['file']}")
    dod = ""
    for line in role_text.splitlines():
        if line.lower().startswith("## baigties sąlyga"):
            dod = role_text.split(line, 1)[1].strip()
            break
    body = HEADER.format(
        root=ROOT,
        today=dt.date.today().isoformat(),
        run_id=run_id,
        stats=platform_stats(),
        recent=recent_runs_text(),
        proposals=open_proposals_text(),
        role=role,
        role_text=role_text.strip(),
        last_log=last_log_excerpt(role),
        definition_of_done=dod or "Įrašyk ataskaitą ir grąžink trumpą santrauką.",
    )
    if "PASIŪLYMŲ FORMATAS" in role_text or cfg.get("proposals", True):
        body += PROPOSAL_RULES
    return body


def update_state(role: str, cfg: dict, status: str, log_path: Path) -> None:
    try:
        state = json.loads(read(STATE_FILE, "{}") or "{}")
    except json.JSONDecodeError:
        state = {}
    state.setdefault("roles", {})[role] = {
        "last_run": dt.datetime.now().isoformat(timespec="seconds"),
        "status": status,
        "log": str(log_path.relative_to(ROOT)),
        "description": cfg["description"],
        "cadence": cfg["cadence"],
    }
    state["updated"] = dt.datetime.now().isoformat(timespec="seconds")
    STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_porcelain(text: str) -> list[str]:
    """`git status --porcelain` eilutės → gryni failų keliai."""
    files: list[str] = []
    for line in text.splitlines():
        if not line.strip():
            continue
        path = line[3:].strip()
        if " -> " in path:
            path = path.split(" -> ", 1)[1]
        path = path.strip('"')
        if path:
            files.append(path)
    return files


def changed_files(before: str) -> list[str]:
    """Failai, kuriuos pakeitė ŠIS paleidimas (ne buvę prieš jį)."""
    try:
        after = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True, timeout=20).stdout
    except Exception:  # noqa: BLE001
        return []
    before_paths = set(parse_porcelain(before))
    return [f for f in parse_porcelain(after) if f not in before_paths][:40]


def git_snapshot() -> str:
    try:
        return subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True, timeout=20).stdout
    except Exception:  # noqa: BLE001
        return ""



# ---------------------------------------------------------------------------
# PUBLIKAVIMAS
#
# Anksčiau bėgiklis tik užrašydavo, kad agentas kažką pakeitė, ir palikdavo
# pakeitimus darbinėje kopijoje — todėl svetainėje niekas nesikeitė (agentas
# paprastai neturi laiko atlikti commit/push/PR). Dabar paskelbimas yra BĖGIKLIO
# darbas: jis validuoja, commituoja ir stumia į `main`, o jei patikra krenta —
# pakeitimus atmeta.
# ---------------------------------------------------------------------------

PROTECTED = ("docs/SVIETIMAS-1-GAIRES.md",)


def git(*args: str, timeout: int = 180) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, timeout=timeout)


def changed_list() -> list[str]:
    """Visi pakeisti ir nauji failai (be ignoruojamų)."""
    try:
        return parse_porcelain(git("status", "--porcelain").stdout)
    except Exception:  # noqa: BLE001
        return []


def run_checks(files: list[str]) -> tuple[bool, str]:
    """Paleidžia validatorius, susijusius su pakeistais failais."""
    checks: list[tuple[str, list[str]]] = []
    if any(f.startswith(("content/", "assets/audio/")) for f in files) or not files:
        checks.append(("turinys", [sys.executable, "scripts/validate_content.py"]))
        checks.append(("garsas", [sys.executable, "scripts/check_audio.py"]))
    if any(f.startswith("assets/") for f in files) or not files:
        checks.append(("sąsaja", [sys.executable, "scripts/check_ui.py"]))
    if not checks:
        return True, "validatoriai nereikalingi (pakeitimai tik docs/research/agents)"

    report = []
    ok = True
    for name, cmd in checks:
        try:
            proc = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, timeout=600)
        except Exception as exc:  # noqa: BLE001
            report.append(f"{name}: NEPAVYKO paleisti ({exc})")
            ok = False
            continue
        tail = (proc.stdout or proc.stderr).strip().splitlines()
        line = " | ".join(tail[-2:]) if tail else ""
        report.append(f"{name}: {'OK' if proc.returncode == 0 else 'KLAIDA'} — {line[:300]}")
        if proc.returncode != 0:
            ok = False
    return ok, "\n".join(report)


def revert(files: list[str]) -> None:
    """Atmeta agento pakeitimus (kad blogas turinys nepatektų į repo)."""
    tracked = [f for f in files if git("ls-files", "--error-unmatch", f).returncode == 0]
    if tracked:
        git("checkout", "--", *tracked)
    untracked = [f for f in files if f not in tracked]
    for f in untracked:
        if f.startswith(("agents/log/", "agents/work/")):
            continue
        target = ROOT / f
        try:
            if target.is_file():
                target.unlink()
        except OSError:
            pass


def close_proposals(files: list[str], commit_sha: str) -> int:
    """Pažymi įgyvendintus pasiūlymus, kurių tikslas pateko į commit'ą."""
    closed = 0
    try:
        rows = db.proposals(200, status="new")
    except Exception:  # noqa: BLE001
        return 0
    changed = set(files)
    for row in rows:
        target = (row.get("target") or "").strip()
        if target and target in changed:
            try:
                db.set_proposal_status(row["id"], "done", f"įgyvendinta commit {commit_sha[:7]}")
                closed += 1
            except Exception:  # noqa: BLE001
                pass
    return closed


def _union_markdown(path: Path) -> None:
    """Sujungia `<<<<<<<` blokus palikdamas ABU variantus (žurnalų įrašai)."""
    import re

    text = path.read_text(encoding="utf-8")
    pattern = re.compile(r"<<<<<<< [^\n]*\n(.*?)\n=======\n(.*?)\n>>>>>>> [^\n]*\n", re.S)
    text = pattern.sub(lambda m: m.group(1).rstrip("\n") + "\n\n" + m.group(2).rstrip("\n") + "\n", text)
    path.write_text(text, encoding="utf-8")


def _merge_json_union(rel: str, path: Path) -> bool:
    """Sujungia index.json / path.json taip, kad NĖ VIENAS modulio ID nedingtų.

    Vartotojo pažanga saugoma `localStorage` pagal modulio ID. Jei ID dingtų ar
    pasikeistų, vaiko atliktos užduotys liktų be pamokos, todėl sąjunga, o ne
    „naujesnė versija laimi“.
    """
    try:
        theirs = json.loads(git("show", f"origin/main:{rel}").stdout)
    except (json.JSONDecodeError, Exception):  # noqa: BLE001
        return False
    try:
        ours = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return False

    if rel.endswith("index.json") and isinstance(theirs.get("strands"), list):
        merged = dict(theirs)
        by_id = {s.get("id"): s for s in theirs["strands"]}
        for strand in ours.get("strands", []):
            target = by_id.get(strand.get("id"))
            if target is None:
                target = {"id": strand.get("id"), "title": strand.get("title"),
                          "emoji": strand.get("emoji"), "modules": []}
                by_id[strand["id"]] = target
            have = {m.get("id") for m in target.get("modules", [])}
            target.setdefault("modules", [])
            for mod in strand.get("modules", []):
                if mod.get("id") not in have:
                    target["modules"].append(mod)
        merged["strands"] = list(by_id.values())
    elif rel.endswith("path.json") and isinstance(theirs.get("sequence"), list):
        merged = dict(theirs)
        seq = list(theirs["sequence"])
        for mid in ours.get("sequence", []):
            if mid not in seq:
                seq.append(mid)
        merged["sequence"] = seq
    else:
        return False

    path.write_text(json.dumps(merged, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return True


def ensure_clean(role: str) -> str:
    """Prieš paleidimą darbinė kopija turi būti švari.

    Būtent nešvarūs likučiai iš ankstesnių paleidimų blokuodavo `git merge`
    („local changes would be overwritten“), todėl publikavimas krisdavo su
    `conflict`, o commit'ai likdavo neišstumti — 18 commit'ų, 3 moduliai.
    """
    try:
        if not git("status", "--porcelain").stdout.strip():
            return ""
    except Exception:  # noqa: BLE001
        return ""
    git("add", "-A")
    if git("commit", "-m", f"[{role}] ankstesnio paleidimo likutis").returncode == 0:
        return "sutvarkyti ankstesni pakeitimai"
    return ""


def publish(role: str, run_id: int, files: list[str], summary: str, allow_revert: bool = True) -> dict:
    """Validuoja ir paskelbia agento pakeitimus. Grąžina rezultatą."""
    if not files:
        return {"status": "empty", "detail": "Agentas failų nepakeitė — rezultato nėra.", "sha": "", "validation": ""}

    protected = [f for f in files if f in PROTECTED]
    if protected:
        revert(files)
        return {"status": "rejected", "detail": f"Liečia apsaugotą failą: {', '.join(protected)}", "sha": "", "validation": ""}

    ok, validation = run_checks(files)
    if not ok:
        # `--publish-only` neturi ko atsukti: ten pakeitimai galėjo būti padaryti
        # žmogaus, ne agento. Todėl rankiniu atveju tik pranešame, o neatmetame.
        if allow_revert:
            revert(files)
            detail = "Validacija nepraėjo — pakeitimai atmesti."
        else:
            detail = "Validacija nepraėjo — pakeitimai PALIKTI darbinėje kopijoje (rankinis režimas)."
        return {"status": "rejected", "detail": detail, "sha": "", "validation": validation}

    branch = f"agent/{role}-{dt.date.today().isoformat()}"
    git("checkout", "-B", branch)

    first_line = (summary or role).strip().splitlines()[0][:90]
    msg = f"[{role}] #{run_id}: {first_line}\n\nPaskelbta automatiškai po validacijos."

    # Komituojame TIK šio paleidimo failus: `git add -A` kartą įtraukė ir
    # žmogaus nebaigtus pakeitimus į agento commit'ą.
    paths = [f for f in files if (ROOT / f).exists()]
    if not paths:
        return {"status": "empty", "detail": "Nėra ką commituoti.", "sha": "", "validation": validation}
    git("add", "--", *paths)
    commit = git("commit", "-m", msg)
    if commit.returncode != 0 and "nothing to commit" not in (commit.stdout + commit.stderr):
        return {"status": "rejected", "detail": f"Commit nepavyko: {commit.stderr.strip()[:200]}", "sha": "", "validation": validation}

    sha = git("rev-parse", "HEAD").stdout.strip()

    # Integracija: sujungiame su naujausiu origin/main ir stumiame į main.
    git("fetch", "origin")
    merge = git("merge", "--no-edit", "origin/main")
    if merge.returncode != 0:
        conflicts = [c for c in git("diff", "--name-only", "--diff-filter=U").stdout.split() if c]
        resolved_all = bool(conflicts)
        for rel in conflicts:
            target = ROOT / rel
            if rel.endswith(".md"):
                _union_markdown(target)
            elif rel.endswith(("index.json", "path.json")) and _merge_json_union(rel, target):
                pass
            else:
                resolved_all = False
                break
            git("add", rel)
        if not resolved_all:
            git("merge", "--abort")
            return {"status": "conflict", "detail": f"Konfliktas su origin/main: {', '.join(conflicts[:3])}", "sha": sha, "validation": validation}
        git("commit", "--no-edit")

    push = git("push", "origin", "HEAD:refs/heads/main", timeout=300)
    if push.returncode != 0:
        return {"status": "unpushed", "detail": f"Push nepavyko: {push.stderr.strip()[:200]}", "sha": sha, "validation": validation}

    git("push", "-f", "origin", f"HEAD:refs/heads/{branch}")  # šaka ateičiai / atsukimui

    # Lokalus `main` turi sekti paskutinį paskelbtą commit'ą. Be to `git push
    # origin main` (rankinis ar iš kito vaidmens) atsimušė kaip non-fast-forward.
    git("branch", "-f", "main", "HEAD")
    closed = close_proposals(files, sha)

    detail = f"Paskelbta {len(files)} failų" + (f", uždaryti {closed} pasiūlymai" if closed else "")
    return {"status": "published", "detail": detail, "sha": sha, "validation": validation}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("role", choices=sorted(ROLES))
    ap.add_argument("--dry-run", action="store_true", help="tik parodyti promptą")
    ap.add_argument("--trigger", default="manual", choices=["manual", "schedule", "dashboard"])
    ap.add_argument("--note", default="")
    ap.add_argument("--timeout", type=int, default=0)
    ap.add_argument("--publish-only", action="store_true",
                    help="nepaleisti modelio — tik validuoti ir paskelbti jau esančius pakeitimus")
    args = ap.parse_args()

    cfg = ROLES[args.role]
    db.init()
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    PROPOSALS.mkdir(parents=True, exist_ok=True)

    # Užraktas: vienu metu dirba vienas agentas (git ir turinio vientisumas)
    lock_handle = open(LOCK_FILE, "w")
    try:
        fcntl.flock(lock_handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        print(f"{args.role}: kitas agentas jau dirba — praleista")
        run_id = db.start_run(args.role, args.trigger, f"hermes:{cfg['profile']}", "skipped: lock")
        db.finish_run(run_id, "skipped", None, 0, "", "Kitas agentas jau dirba.")
        return 0

    run_id = db.start_run(args.role, args.trigger, f"hermes:{cfg['profile']}", args.note)

    if args.publish_only:
        files = changed_list()
        result = publish(args.role, run_id, files, f"atkurtas {args.role} darbas", allow_revert=False)
        db.upsert_proposals(sorted(PROPOSALS.glob("*.json")))
        db.finish_run(run_id, result["status"], 0, 0, "", result["detail"], files,
                      commit_sha=result["sha"], validation=result["validation"])
        print(f"{args.role} #{run_id}: {result['status']} — {result['detail']}"
              + (f" (commit {result['sha'][:7]})" if result["sha"] else ""))
        return 0 if result["status"] == "published" else 1

    cleaned = ensure_clean(args.role)
    if cleaned:
        print(f"{args.role}: {cleaned}")

    prompt = build_prompt(args.role, cfg, run_id)

    if args.dry_run:
        print(prompt)
        db.finish_run(run_id, "dry-run", None, 0, "", "Sausas bėgimas.")
        return 0

    stamp = dt.datetime.now().strftime("%Y-%m-%dT%H%M")
    log_path = LOG_DIR / f"{args.role}-{stamp}.md"
    work = WORK_DIR / args.role / f"{run_id:05d}"
    work.mkdir(parents=True, exist_ok=True)

    fd, query_path = tempfile.mkstemp(prefix=f"suprask-{args.role}-", suffix=".txt")
    before = git_snapshot()
    started = dt.datetime.now()
    timeout = args.timeout or cfg["timeout"]

    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(prompt)

        def invoke(profile: str):
            cmd = [
                HERMES, "-p", profile, "chat",
                "--query-file", query_path,
                "-Q",
                "-t", cfg["toolsets"],
                "--max-turns", str(cfg["max_turns"]),
                "--run-budget", str(cfg["budget"]),
                "--in", str(ROOT),
            ]
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
            return proc.returncode, (proc.stdout or "").strip(), (proc.stderr or "").strip()

        def classify(code: int, out: str, err: str) -> str:
            low = out.lower()
            if any(marker in low for marker in FAIL_MARKERS):
                return "failed"
            if code == 0:
                return "ok"
            # Hermes one-shot išeina su 1 po pilno atsakymo (stderr — tik session_id).
            if len(out) > 200 and "session_id" in err:
                return "partial"
            return "failed"

        code, out, err = invoke(cfg["profile"])
        status = classify(code, out, err)
        used_profile = cfg["profile"]

        # Provider failure (401/429) — bandome atsarginį profilį, kad ciklas nenutrūktų.
        if status == "failed" and FALLBACK_PROFILE and FALLBACK_PROFILE != cfg["profile"]:
            code2, out2, err2 = invoke(FALLBACK_PROFILE)
            status2 = classify(code2, out2, err2)
            if status2 in ("ok", "partial"):
                code, out, err, status = code2, out2, err2, status2
                used_profile = FALLBACK_PROFILE
                out = f"[atsarginis profilis {FALLBACK_PROFILE}]\n\n{out}"

        elapsed = int((dt.datetime.now() - started).total_seconds())

        log_path.write_text(
            f"# {args.role} — {stamp}\n\n"
            f"- paleidimas: #{run_id} ({args.trigger})\n"
            f"- trukmė: {elapsed}s\n"
            f"- exit: {code} → {status}\n"
            f"- modelis: hermes:{used_profile}\n\n"
            f"## Ataskaita\n\n{out or '(tuščia)'}\n\n"
            + (f"## klaidos\n\n```\n{err[-2000:]}\n```\n" if err else ""),
            encoding="utf-8",
        )

        files = changed_files(before)
        db.upsert_proposals(sorted(PROPOSALS.glob("*.json")))

        # Paskelbimas — bėgiklio, ne agento, darbas.
        result = publish(args.role, run_id, files, out or args.role)
        if status in ("ok", "partial"):
            status = result["status"]

        db.finish_run(
            run_id, status, code, elapsed, str(log_path.relative_to(ROOT)), out, files,
            commit_sha=result["sha"], validation=result["validation"],
        )
        update_state(args.role, cfg, status, log_path)

        print(
            f"{args.role} #{run_id}: {status} per {elapsed}s ({used_profile}), "
            f"failų: {len(files)}, {result['detail']}"
            + (f", commit {result['sha'][:7]}" if result["sha"] else "")
        )
        return 0 if status in ("ok", "partial", "published", "empty") else 1

    except subprocess.TimeoutExpired:
        elapsed = int((dt.datetime.now() - started).total_seconds())
        log_path.write_text(
            f"# {args.role} — {stamp}\n\n- paleidimas: #{run_id}\n- Baigėsi laikas ({timeout}s).\n",
            encoding="utf-8",
        )
        db.finish_run(run_id, "timeout", 124, elapsed, str(log_path.relative_to(ROOT)), f"Baigėsi laikas ({timeout}s).")
        update_state(args.role, cfg, "timeout", log_path)
        print(f"{args.role} #{run_id}: timeout")
        return 124
    finally:
        Path(query_path).unlink(missing_ok=True)
        fcntl.flock(lock_handle, fcntl.LOCK_UN)
        lock_handle.close()


if __name__ == "__main__":
    sys.exit(main())
