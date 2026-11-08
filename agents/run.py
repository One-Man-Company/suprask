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
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import time
from contextlib import contextmanager
from pathlib import Path

import db
import scope as grade_scope

ROOT = Path(__file__).resolve().parent.parent
AGENTS = ROOT / "agents"
LOG_DIR = AGENTS / "log"
WORK_DIR = AGENTS / "work"
PROPOSALS = AGENTS / "proposals"
STATE_FILE = AGENTS / "state.json"
LOCK_FILE = AGENTS / ".run.lock"      # bendras (istorinis) – nebeimamas
GIT_LOCK = AGENTS / ".git.lock"       # trumpas: git operacijos

def role_lock_file(role: str) -> Path:
    """Kiekvienas vaidmuo turi savo užraktą.

    Anksčiau buvo vienas bendras užraktas: kol kūrėjas dirbdavo ilgą eilę,
    visi kiti agentai tiesiog praleisdavo savo laiką. Dabar dubliuojasi tik
    tas pats vaidmuo, o git operacijos serializuojamos atskiru GIT_LOCK.
    """
    return AGENTS / f".run.{role}.lock"


@contextmanager
def git_lock(timeout: int = 900):
    """Leidžia vienu metu atlikti tik vieną git veiksmą (commitas + push)."""
    handle = open(GIT_LOCK, "w")
    deadline = time.time() + timeout
    try:
        while True:
            try:
                fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
                break
            except BlockingIOError:
                if time.time() > deadline:
                    raise TimeoutError("git užraktas užimtas ilgiau nei laukta")
                time.sleep(5)
        yield
    finally:
        try:
            fcntl.flock(handle, fcntl.LOCK_UN)
        finally:
            handle.close()

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
        "cadence": "kasdien", "on_calendar": "*-*-* 09:00:00",
        "description": "Eilės darbuotojas: ima pasiūlymus po vieną ir įgyvendina, kol eilė tuščia",
        # Eilės režimas: vienas paleidimas apdoroja iki N pasiūlymų, po kiekvieno
        # publikuoja ir atleidžia užraktą. Žr. scripts/kurejas_queue.py.
        # Kiekvienas eilės darbas paleidžiamas per `/goal` su baigties kontraktu,
        # kad agentas dirbtų, kol darbas tikrai baigtas, o ne kol baigsis ėjimai.
        "goal": True,  # du žingsniai: /goal sesijoje → --resume su užduotimi
        "queue": {"command": "scripts/kurejas_queue.py", "max_items": 60, "max_minutes": 720},
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
        "file": "roles/kritikas.md", "profile": "deepseek41flash", "toolsets": "terminal,file,web",
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
    "kalbu-redaktorius": {
        "file": "roles/kalbu-redaktorius.md", "profile": "ling31flash", "toolsets": "terminal,file",
        "max_turns": 30, "budget": 1200, "timeout": 1800,
        "cadence": "antradieniais, penktadieniais", "on_calendar": "Tue,Fri *-*-* 13:10:00",
        "description": "Kalbos ir UX redaktorius: formuluočių vienareikšmiškumas + ką vaikas mato desktop/planšetėje/telefone su Brave skydais",
    },
    "sistemos-architektas": {
        "file": "roles/sistemos-architektas.md", "profile": "deepseek41flash", "toolsets": "terminal,file,web",
        "max_turns": 60, "budget": 2400, "timeout": 3600,
        "cadence": "kasdien", "on_calendar": "*-*-* 20:20:00",
        "description": "Sistemos architektas: matuoja visų agentų darbą, taiso sistemines problemas, "
                       "keičia grafikus ir promptus, prireikus prideda agentų",
    },
    "publikavimo-agentas": {
        "file": "roles/publikavimo-agentas.md", "profile": "deepseek41flash", "toolsets": "terminal,file",
        "max_turns": 26, "budget": 1000, "timeout": 1200,
        "cadence": "kas 4 h (06,10,14,18,22)", "on_calendar": "*-*-* 06,10,14,18,22:10:00",
        "description": "Užtikrina, kad sukurtas turinys būtų paskelbtas ir neprarastų ankstesnių modulių",
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
mokymosi platforma Lietuvos 1–12 klasei. {headline}

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

--- PAMOKOS IŠ ANKSTESNIŲ DEFEKTŲ (privaloma) ---
{lessons}

Prieš kurdamas ar taisydamas prisimink: šios pamokos atsirado iš realių vaiko
matytų klaidų. Jei tavo darbas galėtų pakartoti kurią nors — sustok ir daryk
kitaip. Jei randi NAUJĄ defekto tipą, kurio sąraše nėra, darbo pabaigoje
pridėk pamoką į research/wiki/guidelines/pamokos.md tokiu pačiu formatu
(Simptomas / Priežastis / Taisyklė / Patikra) ir įrašyk tai ataskaitoje.

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


def platform_stats() -> dict:
    try:
        return db.content_stats()
    except Exception:  # noqa: BLE001
        return {}


def headline(stats: dict) -> str:
    """Viena eilutė apie platformos dydį — imama iš failų, ne iš kodo.

    Buvo įrašyta ranka („13 modulių, 13 simuliacijų“) ir atsiliko nuo tikrovės:
    kiekvienas agentas kiekvieną paleidimą skaitė melagingą skaičių ir galėjo
    siūlyti tai, kas jau yra.
    """
    if not stats:
        return "Šiuo metu gyva 1 klasė."
    return (f"Šiuo metu gyva {stats.get('grades_live', 0)} klasė "
            f"({stats.get('modules', 0)} modulių, {stats.get('sims', 0)} simuliacijų).")


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



LESSONS_FILE = ROOT / "research" / "wiki" / "guidelines" / "pamokos.md"


def lessons_brief(limit: int = 40) -> str:
    """Trumpas pamokų sąrašas — agentas mato jas kiekvieną paleidimą."""
    try:
        text = LESSONS_FILE.read_text(encoding="utf-8")
    except OSError:
        return "(pamokų registro nėra)"
    items = re.findall(r"^## (LL-\d+ — [^\n]+)", text, re.M)
    return "\n".join(items[:limit]) or "(pamokų dar nėra)"


def goal_query(proposal: dict) -> str:
    """Trumpas `/goal` tekstas su baigties kontraktu.

    Svarbu: `/goal` one-shot režime TIK nustato tikslą ir baigia darbą per kelias
    sekundes. Todėl tikslas nustatomas atskiru paleidimu, o pats darbas atliekamas
    `--resume <sesija>` paleidime — tada tikslas jau įkeltas ir teisėjas tikrina
    kiekvieną ėjimą.
    """
    target = (proposal.get("target") or "").strip()
    title = (proposal.get("title") or "").strip()
    checks = ("python3 scripts/validate_content.py; python3 scripts/check_audio.py; "
              "python3 scripts/check_art.py; python3 scripts/check_agents.py")
    return "\n".join([
        f"/goal Įgyvendink pasiūlymą #{proposal.get('id')}: „{title}“.",
        f"outcome: {target or title} įgyvendintas ir paskelbtas, visos patikros žalios",
        f"verification: {checks}",
        "constraints: neliesk kitų modulių, nekeisk agentų ar scope failų, nesilpnink kokybės vartų",
        f"boundaries: {target or 'tik šio pasiūlymo failai'}",
        "stop when: pasiūlymas netinka arba po dviejų bandymų patikros nepraeina — parašyk ataskaitą ir sustok",
    ])


def scope_brief() -> str:
    """Kurias klases žmogus įjungė ir kokias minimalias temas reikia padengti."""
    data = grade_scope.report()
    enabled = [g for g in data["grades"] if g["enabled"]]
    if not enabled:
        return ("\n--- KLASIŲ APIMTIS (privaloma) ---\n"
                "Šiuo metu **nė viena klasė neįjungta**. Nekurk turinio; rašyk ataskaitoje, "
                "kad lauki žmogaus sprendimo dashboard'e.\n")

    lines = ["\n--- KLASIŲ APIMTIS (privaloma) ---",
             "Žmogus dashboard'e įjungė šias klases: " + ", ".join(f"{g['grade']} kl." for g in enabled),
             "Kitų klasių NEliesti: jų turinys nekuriamas, net jei tema atrodo tinkama.",
             ""]
    for g in enabled:
        lines.append(f"{g['grade']} klasė ({g['age']}): modulių dabar {g['modules']}.")
        if g["min_topics"]:
            lines.append("  Minimalios temos, kurios PRIVALO būti padengtos:")
            for c in g["coverage"]:
                mark = "jau yra" if c["covered"] else "DAR NĖRA"
                lines.append(f"    - {c['topic']} — {mark}")
        else:
            lines.append("  Minimalių temų sąrašas tuščias — vadovaukis programos žemėlapiu.")
    lines += [
        "",
        "TAISYKLĖS:",
        "1. Minimalus sąrašas yra APATINĖ RIBA, ne visas darbas. Kurk žymiai daugiau turinio,",
        "   apimančio ir kitas tos klasės programos temas.",
        "2. Vienai temai gali būti KELI moduliai, o jų skaičius NERIBOJAMAS, jei temai",
        "   išnagrinėti reikia kelių žingsnių (pvz., skirtingi to paties reiškinio aspektai).",
        "3. Kiekviena tema turi būti išnagrinėta visapusiškai: kas tai, kodėl taip, kaip atpažinti,",
        "   kur gyvenime sutinkama, ką daryti kitaip — tiek, kiek leidžia klasės amžius.",
        "4. Kalba ir uždavinių sudėtingumas — tos klasės vaikui, ne vyresniam.",
        "",
    ]
    return "\n".join(lines)


def build_prompt(role: str, cfg: dict, run_id: int, proposal: dict | None = None, focus: str = "") -> str:
    role_text = read(AGENTS / cfg["file"])
    if not role_text:
        raise SystemExit(f"Nerastas vaidmens failas: {cfg['file']}")
    dod = ""
    for line in role_text.splitlines():
        if line.lower().startswith("## baigties sąlyga"):
            dod = role_text.split(line, 1)[1].strip()
            break
    st = platform_stats()
    body = HEADER.format(
        root=ROOT,
        today=dt.date.today().isoformat(),
        run_id=run_id,
        headline=headline(st),
        stats=json.dumps(st, ensure_ascii=False),
        recent=recent_runs_text(),
        proposals=open_proposals_text(),
        role=role,
        role_text=role_text.strip(),
        last_log=last_log_excerpt(role),
        lessons=lessons_brief(),
        definition_of_done=dod or "Įrašyk ataskaitą ir grąžink trumpą santrauką.",
    )
    body += scope_brief()
    if "PASIŪLYMŲ FORMATAS" in role_text or cfg.get("proposals", True):
        body += PROPOSAL_RULES
    if focus:
        body += ("\n--- ŠIO PALEIDIMO UŽDUOTIS (privaloma) ---\n"
                 f"{focus.strip()}\n"
                 "Šis blokas viršesnis už bendrą vaidmens aprašą: jei jie nesutaria, laikykis šio bloko.\n")
    if proposal:
        body += (
            "\n--- ŠIO PALEIDIMO UŽDUOTIS (privaloma) ---\n"
            f"Įgyvendink TIK pasiūlymą #{proposal['id']}: „{proposal.get('title', '')}“.\n"
            f"Tikslas (failas): {proposal.get('target') or '(nepasakyta)'}\n"
            f"Kodėl: {(proposal.get('body') or '')[:600]}\n"
            f"Įrodymai: {(proposal.get('evidence') or '')[:400]}\n"
            "Nepradėk kitų pasiūlymų. Jei šis pasiūlymas netinka (pasenęs, prieštarauja gairėms), "
            "paaiškink ataskaitoje ir NIEKO nekurki — bėgiklis jį pažymės kaip blocked.\n"
        )
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


RUNTIME_RE = re.compile(r"^agents/\.(?:git|run[^/]*)\.lock$")


def is_runtime_artifact(rel: str) -> bool:
    """Ar kelias yra vykdymo būsena, o ne turinys.

    Užraktų failai (`agents/.run.<role>.lock`, `agents/.git.lock`) sukuriami
    kiekvieną paleidimą ir visada tušti — jie nieko nesako apie pakeitimą.
    2026-11-08 būtent toks tuščias `agents/.run.ideator.lock` pateko į
    `[sistema]` commit'ą e4a924b, o su nauja žinute jis atrodytų kaip turinys,
    kurį kažkas pakeitė. Todėl jie nepatenka nei į `changed_files()`, nei į
    likučio commit'ą (LL-45).
    """
    return bool(RUNTIME_RE.match(rel))


def foreign_role_of_file(rel: str) -> str | None:
    """Kuriam vaidmeniui failas PRIKLAUSO pagal patį kelią (arba `None`).

    Tai ne spėjimas „pagal laiką“: tikrinamos tik tos vietos, kuriose vaidmuo
    įrašytas į patį failo vardą — `agents/log/<role>-<laikas>.md` ir
    `agents/work/<role>/…`. Toks failas fiziškai negali būti šio paleidimo
    darbas, kad ir kada jis atsirado (LL-49).

    Netyčia priskyrus svetimą ataskaitą, ji patektų į ne to vaidmens commit'ą,
    o tikrasis savininkas savo `changed_files()` sąraše jos neberastų — todėl
    šis atskyrimas yra saugus tik viena kryptimi: jis gali atmesti tik tai, ką
    galima įrodyti esant svetima, ir niekada neatmeta to, kas galėtų būti sava.
    """
    for other in ROLES:
        if rel.startswith(f"agents/log/{other}-") or rel.startswith(f"agents/work/{other}/"):
            return other
    return None


def proposal_author(rel: str) -> str | None:
    """`agents/proposals/*.json` autorystė pagal failo lauką `role`.

    Pasiūlymo formate `role` yra privalomas, todėl pusiau parašytas failas
    dažniausiai jau turi autorių. Jei failo perskaityti nepavyksta (agentas dar
    rašo), grąžinamas `None` — abejotino failo NEatmetame: geriau įspėjimas
    negu tyliai pamestas darbas.
    """
    if not (rel.startswith("agents/proposals/") and rel.endswith(".json")):
        return None
    try:
        data = json.loads((ROOT / rel).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError, UnicodeDecodeError):
        return None
    role = data.get("role") if isinstance(data, dict) else None
    return role if isinstance(role, str) and role in ROLES else None


def file_owner(rel: str) -> str | None:
    """Vienas įrodytas savininkas, jei jį galima nustatyti iš failo."""
    return foreign_role_of_file(rel) or proposal_author(rel)


def publication_plan(files: list[str], role: str, foreign: list[str]) -> tuple[list[str], dict[str, list[str]], list[str]]:
    """Ką šis paleidimas tikrai gali publikuoti, o ką — ne.

    `changed_files(before)` lygina tik laiko tarpą, todėl tame pačiame sąraše
    atsiduria ir kito vaidmens darbas, jei jis ėjo tuo pačiu metu (LL-49).
    Autorystės iš turinio atkurti negalima, todėl čia daromi du dalykai:

    1. **Įrodyta svetimybė** — failai, kurių savininkas matomas iš kelio arba iš
       pasiūlymo `role` lauko, pašalinami iš publikavimo sąrašo ir paliekami jų
       vaidmens paleidimui. Tai vienintelė kryptis, kurioje klaida saugi.
    2. **Neįrodyta autorystė** — jei per paleidimą dirbo kitas vaidmuo, apie tai
       pasakoma žodžiu (grąžinami įspėjimai), o ne tyliai priskiriama sau.

    Grąžina `(publikuotini, svetimi_pagal_vaidmenį, įspėjimai)`.
    """
    own: list[str] = []
    foreign_files: dict[str, list[str]] = {}
    for f in files:
        owner = file_owner(f)
        if owner and owner != role:
            foreign_files.setdefault(owner, []).append(f)
        else:
            own.append(f)

    warnings: list[str] = []
    if foreign_files:
        count = sum(len(v) for v in foreign_files.values())
        parts = ", ".join(f"{r}: {len(v)}" for r, v in sorted(foreign_files.items()))
        warnings.append(
            f"{count} failų priklauso kitiems vaidmenims ({parts}) — jų neimame, "
            f"paliekame tų vaidmenų paleidimams"
        )
    if foreign:
        warnings.append(
            f"per šį paleidimą dirbo ir {', '.join(foreign)}: {len(own)} failų autorystė "
            f"neįrodyta (bendras darbinis katalogas), tad gali būti ir jų pakeitimų"
        )
    return own, foreign_files, warnings


class RoleWatch:
    """Stebi, kurie kiti vaidmenys ėjo per šio paleidimo laiką.

    Vieno patikrinimo paleidimo pradžioje neužtenka: kitas vaidmuo gali pradėti
    ir baigti visiškai mūsų viduje, ir tada pabaigoje jo užraktas jau būtų
    atlaisvintas. Todėl imame ėminius kas kelias sekundes per visą paleidimą;
    `agents/.run.<role>.lock` laikomas nuo `main()` pradžios iki `finally`,
    todėl ėminio pakanka, kad užfiksuotume faktą „dirbo“.
    """

    def __init__(self, role: str, interval: float = 5.0):
        self.role = role
        self.interval = interval
        self._seen: dict[str, str] = {}
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None

    def _sample(self) -> None:
        try:
            for other in active_role_locks(exclude=self.role):
                self._seen.setdefault(other, dt.datetime.now().isoformat(timespec="seconds"))
        except Exception:  # noqa: BLE001 — stebėjimas neturi griauti paleidimo
            pass

    def _loop(self) -> None:
        while not self._stop.wait(self.interval):
            self._sample()

    def start(self) -> "RoleWatch":
        self._sample()
        self._thread = threading.Thread(target=self._loop, name=f"role-watch-{self.role}", daemon=True)
        self._thread.start()
        return self

    def stop(self) -> None:
        self._stop.set()
        if self._thread is not None:
            self._thread.join(timeout=5)
            self._thread = None

    def roles(self) -> list[str]:
        """Kiti vaidmenys, kurių užraktas buvo laikomas bent per vieną ėminį."""
        return sorted(self._seen)


def changed_files(before: str) -> list[str]:
    """Failai, kuriuos pakeitė ŠIS paleidimas (ne buvę prieš jį).

    Sąrašas NĖRA kerpamas. Anksčiau čia buvo `[:40]`, ir tai tyliai atmesdavo
    likusius: kai ataskaitos nustojo būti `.gitignore` (#484), vienas paleidimas
    turėjo paskelbti 141 failą, o paskelbė 40 — 101 ataskaita liko darbinėje
    kopijoje ir nukeliavo į kito vaidmens `[sistema]` commit'ą (#4454, LL-37).
    Tikrų failų skaičių riboja pats commit'as, todėl ribos nereikia; `stage()`
    deda failus dalimis, kad ilgas sąrašas neužkimštų argumentų eilutės.

    `-uall` būtinas: be jo `git status` nesutrackintą katalogą rodo viena
    eilute („agents/log/“), ir sąraše atsiranda katalogas vietoj failų — tada
    nei komituojamų failų skaičius, nei ataskaita nemato tikrovės.
    """
    try:
        after = subprocess.run(["git", "status", "--porcelain", "-uall"], cwd=ROOT, capture_output=True, text=True, timeout=20).stdout
    except Exception:  # noqa: BLE001
        return []
    before_paths = set(parse_porcelain(before))
    return [f for f in parse_porcelain(after)
            if f not in before_paths and not is_runtime_artifact(f)]


def git_snapshot() -> str:
    try:
        return subprocess.run(["git", "status", "--porcelain", "-uall"], cwd=ROOT, capture_output=True, text=True, timeout=20).stdout
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


def _tracked(rel: str) -> bool:
    """Ar failas jau yra repo istorijoje (ištrintas failas lieka trackinamas)."""
    return git("ls-files", "--error-unmatch", rel).returncode == 0


def stage(paths: list[str], chunk: int = 400) -> None:
    """`git add -A` konkrečiais keliais, dalimis.

    `-A` būtinas, kad ištrintas failas būtų komituotas kaip trynimas, o ne
    tyliai praleistas. Dalimis — kad sąrašas be `[:40]` ribos (#4454) netilptų
    į argumentų eilutės limitą, kai pakeitimų šimtai ar tūkstančiai.
    """
    for i in range(0, len(paths), chunk):
        git("add", "-A", "--", *paths[i:i + chunk])


def changed_list() -> list[str]:
    """Visi pakeisti ir nauji failai (be ignoruojamų ir be užraktų)."""
    try:
        return [f for f in parse_porcelain(git("status", "--porcelain", "-uall").stdout)
                if not is_runtime_artifact(f)]
    except Exception:  # noqa: BLE001
        return []


def run_checks(files: list[str], allow_audio_repair: bool = True) -> tuple[bool, str]:
    """Paleidžia validatorius, susijusius su pakeistais failais.

    Jei garso patikra krenta dėl NAUJŲ tekstų, bandom vieną kartą sugeneruoti
    trūkstamus įrašus (`generate_audio.py`) ir tikrinam iš naujo. Be to naujo
    modulio niekada nepavyktų paskelbti — jo žodžiai dar neturi garso.
    """
    checks: list[tuple[str, list[str]]] = []
    if any(f.startswith(("content/", "assets/audio/")) for f in files) or not files:
        checks.append(("turinys", [sys.executable, "scripts/validate_content.py"]))
        checks.append(("garsas", [sys.executable, "scripts/check_audio.py"]))
    if any(f.startswith(("agents/", "deploy/", "scripts/")) for f in files) or not files:
        # Sistemos vientisumas: po architekto pakeitimų neturi likti vaidmens be
        # timer'io, modelio ar baigties sąlygos.
        checks.append(("agentai", [sys.executable, "scripts/check_agents.py"]))
    if any(f.startswith("assets/") for f in files) or not files:
        checks.append(("sąsaja", [sys.executable, "scripts/check_ui.py"]))
        # LL-13: iliustracijos scenos privalo naudoti art.js — be šito agentas
        # galėtų paskelbti plokščių stačiakampių pamoką.
        checks.append(("iliustracijos", [sys.executable, "scripts/check_art.py"]))
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
            if name == "garsas" and allow_audio_repair:
                repair = subprocess.run(
                    [sys.executable, "scripts/generate_audio.py", "--engine", "piper"],
                    cwd=ROOT, capture_output=True, text=True, timeout=1800,
                )
                if repair.returncode == 0:
                    again = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, timeout=900)
                    tail2 = (again.stdout or again.stderr).strip().splitlines()
                    report.append(f"garsas (po generavimo): {'OK' if again.returncode == 0 else 'KLAIDA'} — {' | '.join(tail2[-1:])[:200]}")
                    if again.returncode == 0:
                        ok = True
    return ok, "\n".join(report)


def revert(files: list[str]) -> None:
    """Atmeta agento pakeitimus (kad blogas turinys nepatektų į repo)."""
    tracked = [f for f in files if git("ls-files", "--error-unmatch", f).returncode == 0]
    for i in range(0, len(tracked), 400):
        git("checkout", "--", *tracked[i:i + 400])
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


def mark_implemented(proposal_id: int | None, files: list[str], commit_sha: str) -> bool:
    """Pažymi įgyvendintą TIK tą pasiūlymą, kurį paleidimas ėmėsi vykdyti.

    Anksčiau (`close_proposals`) užtekdavo, kad pasiūlymo `target` failas patektų
    į commit'ą: pirmas sėkmingas publikavimas tylomis uždarydavo visas atviras
    kritikos pastabas tam pačiam failui, nors jų niekas netaisė (#486). Todėl dabar
    reikia dviejų dalykų: aiškaus pasiūlymo numerio IR pakeisto jo tikslo.
    """
    if not proposal_id:
        return False
    try:
        row = next((r for r in db.proposals(500) if int(r["id"]) == int(proposal_id)), None)
    except Exception:  # noqa: BLE001
        return False
    if not row:
        return False
    target = (row.get("target") or "").strip()
    if target and target not in set(files):
        return False
    try:
        db.set_proposal_status(int(proposal_id), "done", f"įgyvendinta commit {commit_sha[:7]}")
        return True
    except Exception:  # noqa: BLE001
        return False


def close_proposals(files: list[str], commit_sha: str, implemented_id: int | None = None) -> int:
    """Suderinamumo apvalkalas: grąžina, kiek pasiūlymų uždaryta (0 arba 1)."""
    return 1 if mark_implemented(implemented_id, files, commit_sha) else 0


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


def _locked_inodes() -> dict[int, int] | None:
    """`inode → pid` iš `/proc/locks`, arba `None`, jei sąrašo nėra.

    Skaitome, o NE bandome užrakinti: `flock(LOCK_EX|LOCK_NB)` zondas
    užrakina svetimą failą kelioms mikrosekundėms, ir jei būtent tą akimirką
    tas vaidmuo bando pradėti darbą, jo `main()` pamato `BlockingIOError` ir
    paleidimas praleidžiamas („toks pats agentas jau dirba“). Vienam
    patikrinimui tai buvo teorinis atvejis, bet stebėjimas kas 5 s per valandos
    paleidimą daro jį realų. `/proc/locks` atsako į tą patį klausimą nieko
    neliesdamas.
    """
    try:
        text = Path("/proc/locks").read_text(encoding="utf-8")
    except OSError:
        return None
    holders: dict[int, int] = {}
    for line in text.splitlines():
        parts = line.split()
        if len(parts) < 6 or parts[1] == "->":  # „->“ eilutė = laukiantis, ne laikantis
            continue
        try:
            pid = int(parts[4])
            inode = int(parts[5].rsplit(":", 1)[1])
        except (ValueError, IndexError):
            continue
        holders[inode] = pid
    return holders


_PROC_LOCKS_OK: bool | None = None


def _proc_locks_usable() -> bool:
    """Ar `/proc/locks` tikrai rodo `flock` užraktus (patikrinama vieną kartą).

    Tuščias ar nepilnas `/proc/locks` (kita OS, kita izoliuota aplinka) atrodytų
    kaip „nė vienas vaidmuo nedirba“ — ir `ensure_clean()` vėl imtų svetimą
    darbą. Todėl pirmą kartą užrakiname savo laikiną failą ir patikriname, ar jis
    tame sąraše atsirado; jei ne, naudojamas senasis `flock` zondas.
    """
    global _PROC_LOCKS_OK
    if _PROC_LOCKS_OK is not None:
        return _PROC_LOCKS_OK
    ok = False
    path: Path | None = None
    try:
        fd, name = tempfile.mkstemp(prefix="suprask-lockprobe-")
        path = Path(name)
        with os.fdopen(fd, "a", encoding="utf-8") as fh:
            fcntl.flock(fh, fcntl.LOCK_EX)
            holders = _locked_inodes() or {}
            ok = holders.get(path.stat().st_ino) == os.getpid()
            fcntl.flock(fh, fcntl.LOCK_UN)
    except OSError:
        ok = False
    finally:
        if path is not None:
            path.unlink(missing_ok=True)
    _PROC_LOCKS_OK = ok
    return ok


def active_role_locks(exclude: str = "") -> list[str]:
    """Vaidmenys, kurių paleidimas šiuo metu vyksta (jų užraktas laikomas).

    Užraktas `agents/.run.<role>.lock` laikomas visą paleidimą (nuo `main()`
    iki `finally`), todėl jo būsena — vienintelis patikimas požymis, kad kitas
    vaidmuo dar dirba tame pačiame darbiniame kataloge.

    Savas vaidmuo praleidžiamas (`exclude`): `flock` užraktas priklauso failo
    aprašui, ne procesui, todėl bandymas užrakinti savo paties failą per antrą
    deskriptorių atrodytų kaip svetimas užraktas.

    Pirmiausia skaitomas `/proc/locks` (nieko neužrakina). Jei jis netinka,
    naudojamas senasis `flock` zondas su jo varžybų kaina.
    """
    holders = _locked_inodes() if _proc_locks_usable() else None
    active: list[str] = []
    for other in sorted(ROLES):
        if other == exclude:
            continue
        path = role_lock_file(other)
        if not path.exists():  # neužrakintas paleidimas dar nesukūrė failo
            continue
        if holders is not None:
            try:
                inode = path.stat().st_ino
            except OSError:
                continue
            if holders.get(inode, os.getpid()) != os.getpid():
                active.append(other)
            continue
        try:
            with open(path, "a", encoding="utf-8") as fh:
                try:
                    fcntl.flock(fh, fcntl.LOCK_EX | fcntl.LOCK_NB)
                except BlockingIOError:
                    active.append(other)
                else:
                    fcntl.flock(fh, fcntl.LOCK_UN)
        except OSError:
            continue
    return active


def ensure_clean(role: str) -> str:
    """Prieš paleidimą darbinė kopija turi būti švari.

    Būtent nešvarūs likučiai iš ankstesnių paleidimų blokuodavo `git merge`
    („local changes would be overwritten“), todėl publikavimas krisdavo su
    `conflict`, o commit'ai likdavo neišstumti — 18 commit'ų, 3 moduliai.

    Tačiau visi vaidmenys dalijasi VIENA darbine kopija, todėl „nešvaru“ dar
    nereiškia „likutis“. 2026-11-08 `ideator` paleidimas šitaip pasisavino dar
    nebaigtą kūrėjo darbą (`agents/run.py`, `research/wiki/guidelines/pamokos.md`)
    į `[sistema]` commit'ą e4a924b: žinutė nebepasakė nei kas, nei kodėl, o
    kūrėjo `changed_files()` po to teturėjo vieną ataskaitos failą (LL-45).
    Todėl aktyvaus kito vaidmens atveju medis NELIEČIAMAS, o paleidimas gauna
    aiškų pranešimą: sąžiningas `conflict` vėliau yra pigesnis už svetimą darbą
    commit'e dabar.
    """
    try:
        if not git("status", "--porcelain", "-uall").stdout.strip():
            return ""
    except Exception:  # noqa: BLE001
        return ""

    # `git add` + `commit` privalo būti serializuoti su publikavimu: du vaidmenys
    # gali pradėti tą pačią sekundę, o be užrakto jų indeksai susipina.
    # Laukimas trumpas: likutis nėra skubus, o `publish()` gali laikyti užraktą
    # ilgai (validacija + garso generavimas), todėl verčiau pranešti, o ne
    # užblokuoti visą paleidimą.
    try:
        with git_lock(timeout=180):
            dirty = [f for f in parse_porcelain(git("status", "--porcelain", "-uall").stdout)
                     if not is_runtime_artifact(f)]
            if not dirty:  # kol laukėme užrakto, kitas paleidimas jau sutvarkė medį
                return ""
            busy = active_role_locks(exclude=role)
            if busy:
                return (f"darbinė kopija nešvari ({len(dirty)} failų), bet dirba "
                        f"{', '.join(busy)} — svetimo darbo nekomituoju, palieku jį "
                        f"tam paleidimui")
            stage(dirty)
            listed = ", ".join(dirty[:12]) + (" …" if len(dirty) > 12 else "")
            body = (f"Likutį rado „{role}“ paleidimas prieš pradėdamas savo darbą.\n\n"
                    f"Kas: {len(dirty)} failų — {listed}\n"
                    f"Kodėl likutis: nė vienas kitas vaidmuo nebuvo aktyvus "
                    f"(`agents/.run.*.lock` neužimti), tad tai nutrūkusio ar rankinio "
                    f"paleidimo likutis, o ne vykstantis darbas (LL-45).")
            # Neutralus prefiksas: tai NĖRA agento darbas, tik darbinės kopijos likutis.
            if git("commit", "-m", f"[sistema] darbinės kopijos likutis prieš {role} paleidimą",
                   "-m", body).returncode == 0:
                return f"sutvarkytas darbinės kopijos likutis ({len(dirty)} failų, commit [sistema])"
            return ""
    except TimeoutError:
        return "darbinės kopijos likučio netvarkau: git užraktą laiko kitas paleidimas"



def push_backlog() -> str:
    """Išstumia tai, kas jau sucommituota, bet dar nepasiekė `main`.

    Publikavimo agentui tai pagrindinis veiksmas: jo darbas prasideda nuo to,
    kad repo ir svetainė sutaptų.
    """
    git("fetch", "origin")
    pending = [c for c in git("rev-list", "origin/main..HEAD").stdout.split() if c]
    if not pending:
        return "backlog'o nėra"
    merge = git("merge", "--no-edit", "origin/main")
    if merge.returncode != 0:
        conflicts = [c for c in git("diff", "--name-only", "--diff-filter=U").stdout.split() if c]
        ok = bool(conflicts)
        for rel in conflicts:
            target = ROOT / rel
            if rel.endswith(".md"):
                _union_markdown(target)
            elif rel.endswith(("index.json", "path.json")) and _merge_json_union(rel, target):
                pass
            else:
                ok = False
                break
            git("add", rel)
        if not ok:
            git("merge", "--abort")
            return f"konfliktas: {', '.join(conflicts[:3])}"
        git("commit", "--no-edit")
    push = git("push", "origin", "HEAD:refs/heads/main", timeout=300)
    if push.returncode != 0:
        return f"push nepavyko: {push.stderr.strip()[:120]}"
    git("branch", "-f", "main", "HEAD")
    return f"išstumta {len(pending)} commit'ų"


ANSI_RE = re.compile(r"\x1b\[[0-9;]*[A-Za-z]")
BOX_RE = re.compile(r"^[\s│┃┆┊╎╏|┌┐└┘├┤┬┴┼─━═╭╮╰╯▏▕]+")
# Eilutės, kurios yra įrankio išklotinė, o ne agento išvada.
NOISE_RE = re.compile(r'(^\s*[{}]|": |^\+|^@@|^diff |^\+\+\+|^---)')


def summary_line(text: str, limit: int = 90) -> str:
    """Pirmoji prasminga atsakymo eilutė — commit'o žinutei.

    Hermes TUI rašo į stdout ir rėmelį, ir įrankių išklotines, todėl anksčiau
    commit'o žinutė būdavo „│ assets/js/app.js“, o git istorija — neįskaitoma:
    pagal ją neįmanoma pasakyti, ką paleidimas pakeitė. Imame pirmą eilutę,
    kuri turi bent tris žodžius ir nėra išklotinės fragmentas.
    """
    for line in (text or "").splitlines():
        clean = BOX_RE.sub("", ANSI_RE.sub("", line)).strip()
        clean = clean.lstrip("#>*-+ ").strip()
        if len(clean) < 12 or len(clean.split()) < 3:
            continue
        if NOISE_RE.search(line) or NOISE_RE.search(clean):
            continue
        return clean[:limit]
    return ""


def publish(role: str, run_id: int, files: list[str], summary: str, allow_revert: bool = True,
            implemented_id: int | None = None, foreign_roles: list[str] | None = None,
            notes: list[str] | None = None) -> dict:
    with git_lock():
        return _publish(role, run_id, files, summary, allow_revert, implemented_id,
                        foreign_roles or [], notes or [])


def _publish(role: str, run_id: int, files: list[str], summary: str, allow_revert: bool = True,
             implemented_id: int | None = None, foreign_roles: list[str] | None = None,
             notes: list[str] | None = None) -> dict:
    """Validuoja ir paskelbia agento pakeitimus. Grąžina rezultatą.

    `foreign_roles` — kiti vaidmenys, kurie ėjo per tą patį laiką (LL-49).
    Jų buvimas keičia dvi vietas: commit'o žinutė pasako, kad failų autorystė
    neįrodyta, o nepavykusi validacija NIEKO neatmeta — atsukimas `git status`
    sąraše esančius failus grąžintų į HEAD ir taip ištrintų dar nebaigtą kito
    vaidmens darbą.
    """
    foreign = [r for r in (foreign_roles or []) if r != role]
    notes = list(notes or [])
    if not files:
        detail = "Agentas failų nepakeitė — rezultato nėra."
        if notes:
            detail += " " + "; ".join(notes)
        return {"status": "empty", "detail": detail, "sha": "", "validation": ""}

    protected = [f for f in files if f in PROTECTED]
    if protected:
        revert(files)
        return {"status": "rejected", "detail": f"Liečia apsaugotą failą: {', '.join(protected)}", "sha": "", "validation": ""}

    ok, validation = run_checks(files)
    if not ok:
        # `--publish-only` neturi ko atsukti: ten pakeitimai galėjo būti padaryti
        # žmogaus, ne agento. Todėl rankiniu atveju tik pranešame, o neatmetame.
        if allow_revert and not foreign:
            revert(files)
            detail = "Validacija nepraėjo — pakeitimai atmesti."
        elif allow_revert:
            detail = (
                "Validacija nepraėjo — pakeitimai PALIKTI darbinėje kopijoje, nes per "
                f"paleidimą dirbo {', '.join(foreign)}: atmetimas ištrintų ir jų nebaigtą "
                "darbą (LL-49)."
            )
        else:
            detail = "Validacija nepraėjo — pakeitimai PALIKTI darbinėje kopijoje (rankinis režimas)."
        if notes:
            detail += " " + "; ".join(notes)
        return {"status": "rejected", "detail": detail, "sha": "", "validation": validation}

    branch = f"agent/{role}-{dt.date.today().isoformat()}"
    git("checkout", "-B", branch)

    first_line = summary_line(summary) or role
    msg = f"[{role}] #{run_id}: {first_line}\n\nPaskelbta automatiškai po validacijos."
    if notes:
        # Autorystės pastaba – commit'o žinutėje, nes `git log` yra vienintelis
        # audito pėdsakas, kuris išlieka po to, kai `detail` pasensta (LL-49).
        msg += "\n\n" + "\n".join(f"- {n}" for n in notes)

    # Komituojame TIK šio paleidimo failus: `git add -A` kartą įtraukė ir
    # žmogaus nebaigtus pakeitimus į agento commit'ą. Ištrinti failai irgi yra
    # šio paleidimo pakeitimas — anksčiau `(ROOT / f).exists()` juos numesdavo
    # tyliai, o trynimas likdavo darbinėje kopijoje (ta pati LL-37 šeima).
    paths = [f for f in files if (ROOT / f).exists() or _tracked(f)]
    missing = [f for f in files if f not in paths]
    if not paths:
        detail = f"Nėra ką commituoti: pakeista {len(files)}, nė vieno failo nėra vietoje."
        return {"status": "empty", "detail": detail, "sha": "", "validation": validation}
    stage(paths)
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
    closed = close_proposals(files, sha, implemented_id)

    # Skaičiuojame tai, kas TIKRAI pateko, o ne tai, ką prašėme. Anksčiau
    # `detail` rodė `len(files)`, nors komituota būdavo mažiau (LL-37, LL-21).
    # Jei kas nors vis dar nešvaru po publikavimo — pasakome tai garsiai.
    dirty = set(parse_porcelain(git("status", "--porcelain", "-uall").stdout))
    left = [f for f in paths if f in dirty]
    detail = f"Paskelbta {len(paths)} failų"
    if missing:
        detail += f", {len(missing)} nebuvo vietoje ({', '.join(missing[:2])})"
    if left:
        detail += f", {len(left)} liko nešvarūs ({', '.join(left[:2])})"
    if closed:
        detail += f", uždaryti {closed} pasiūlymai"
    if notes:
        detail += "; " + "; ".join(notes)
    return {"status": "published", "detail": detail, "sha": sha, "validation": validation}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("role", choices=sorted(ROLES))
    ap.add_argument("--dry-run", action="store_true", help="tik parodyti promptą")
    ap.add_argument("--trigger", default="manual", choices=["manual", "schedule", "dashboard", "queue"])
    ap.add_argument("--note", default="")
    ap.add_argument("--timeout", type=int, default=0)
    ap.add_argument("--proposal", type=int, default=0,
                    help="įgyvendinti tik šį pasiūlymą (queue režimui)")
    ap.add_argument("--publish-only", action="store_true",
                    help="nepaleisti modelio — tik validuoti ir paskelbti jau esančius pakeitimus")
    args = ap.parse_args()

    cfg = ROLES[args.role]
    db.init()

    proposal = None
    if args.proposal:
        rows = [r for r in db.proposals(500) if int(r["id"]) == args.proposal]
        if not rows:
            print(f"Nerastas pasiūlymas #{args.proposal}")
            return 2
        proposal = rows[0]
        if proposal.get("status") in ("done", "blocked") and not args.publish_only:
            print(f"Pasiūlymas #{args.proposal} jau {proposal['status']} — praleista")
            return 0

        # Klasė, kurią žmogus išjungė dashboard'e, nekuriama — net jei pasiūlymas
        # jai jau buvo eilėje.
        pg = grade_scope.grade_of_target(proposal.get("target") or "")
        if pg is not None and not grade_scope.is_enabled(pg):
            db.set_proposal_status(int(proposal["id"]), "blocked", f"{pg} klasė išjungta")
            print(f"{pg} klasė išjungta — pasiūlymas #{args.proposal} praleistas")
            return 0
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    PROPOSALS.mkdir(parents=True, exist_ok=True)

    # Užraktas: vienu metu dirba vienas agentas (git ir turinio vientisumas)
    # RAŠYMO UŽRAKTAS — VIENAS VISIEMS VAIDMENIMS.
    #
    # Buvo po užraktą kiekvienam vaidmeniui, kad ilgas kūrėjo darbas neblokuotų
    # kitų. Bet visi agentai dirba TAME PAČIAME darbiniame kataloge, todėl du
    # rašantys agentai vienu metu reiškia, kad pirmasis publikuoja antrojo
    # nebaigtus pakeitimus (taip `pasaulis.js` pateko į kalbos redaktoriaus
    # commit'ą 5b58476). Serializuojam rašymą, o laukiame, o ne praleidžiame —
    # kitaip agentas tyliai praranda savo dienos paleidimą.
    lock_handle = open(LOCK_FILE, "w")
    wait_s = int(os.environ.get("SUPRASK_LOCK_WAIT", "900"))
    started_wait = time.time()
    notified = False
    while True:
        try:
            fcntl.flock(lock_handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
            break
        except BlockingIOError:
            others = active_role_locks(args.role)
            if not notified:
                print(f"{args.role}: laukia, kol baigs {', '.join(others) or 'kitas agentas'}"
                      f" (iki {wait_s} s)")
                notified = True
            if time.time() - started_wait > wait_s:
                run_id = db.start_run(args.role, args.trigger, f"hermes:{cfg['profile']}", "skipped: lock")
                db.finish_run(run_id, "skipped", None, int(time.time() - started_wait), "",
                              f"Užraktas užimtas ilgiau nei {wait_s} s.")
                print(f"{args.role}: užraktas užimtas ilgiau nei {wait_s} s — praleista")
                return 0
            time.sleep(10)

    run_id = db.start_run(args.role, args.trigger, f"hermes:{cfg['profile']}", args.note)

    if args.publish_only:
        files = changed_list()
        result = publish(args.role, run_id, files, f"atkurtas {args.role} darbas", allow_revert=False)
        db.upsert_proposals(sorted(PROPOSALS.glob("*.json")))
        db.finish_run(run_id, result["status"], 0, 0, "", result["detail"], files,
                      commit_sha=result["sha"], validation=result["validation"], detail=result["detail"])
        print(f"{args.role} #{run_id}: {result['status']} — {result['detail']}"
              + (f" (commit {result['sha'][:7]})" if result["sha"] else ""))
        return 0 if result["status"] == "published" else 1

    cleaned = ensure_clean(args.role)
    if cleaned:
        print(f"{args.role}: {cleaned}")

    if args.role == "publikavimo-agentas" and not args.dry_run:
        print(f"publikavimo-agentas: {push_backlog()}")

    prompt = build_prompt(args.role, cfg, run_id, proposal, args.note)

    if args.dry_run:
        print(prompt)
        db.finish_run(run_id, "dry-run", None, 0, "", "Sausas bėgimas.")
        return 0

    stamp = dt.datetime.now().strftime("%Y-%m-%dT%H%M")
    log_path = LOG_DIR / f"{args.role}-{stamp}.md"
    work = WORK_DIR / args.role / f"{run_id:05d}"
    work.mkdir(parents=True, exist_ok=True)

    fd, query_path = tempfile.mkstemp(prefix=f"suprask-{args.role}-", suffix=".txt")
    goal_path = query_path + ".goal"
    before = git_snapshot()
    # Stebėjimas prasideda TĄ PAČIĄ akimirką kaip ir `before` nuotrauka: tik
    # tada laiko tarpas ir „kas dar dirbo“ matuojami tais pačiais rėmais (LL-49).
    watch = RoleWatch(args.role).start()
    started = dt.datetime.now()
    timeout = args.timeout or cfg["timeout"]

    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(prompt)

        def run_cmd(cmd: list[str]):
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
            return proc.returncode, (proc.stdout or "").strip(), (proc.stderr or "").strip()

        def invoke(profile: str):
            """Vienas paleidimas. Jei vaidmuo turi `goal` ir yra pasiūlymas —
            pirmiausia nustatomas tikslas, po to tas pats darbas atliekamas
            `--resume`, kad veiktų `/goal` teisėjo ciklas."""
            base = [
                HERMES, "-p", profile, "chat",
                "-Q",
                "-t", cfg["toolsets"],
                "--max-turns", str(cfg["max_turns"]),
                "--run-budget", str(cfg["budget"]),
                "--in", str(ROOT),
            ]

            if not (cfg.get("goal") and proposal):
                return run_cmd(base + ["--query-file", query_path])

            # 1 žingsnis: tikslas (politika įrašoma sesijoje, todėl vėliau
            # --max-turns / --run-budget nebegalima perduoti).
            with open(goal_path, "w", encoding="utf-8") as fh:
                fh.write(goal_query(proposal))
            gcode, gout, gerr = run_cmd(base + ["--query-file", goal_path])
            session = ""
            for token in (gerr + " " + gout).split():
                if token.startswith("local-"):
                    session = token.strip()
                    break
            if "goal set" not in (gout + gerr).lower() or not session:
                print(f"{args.role}: /goal nepavyko ({gout.splitlines()[:1]}) — dirbu be tikslo")
                return run_cmd(base + ["--query-file", query_path])

            # 2 žingsnis: darbas toje pačioje sesijoje su įkeltu tikslu.
            work_cmd = [HERMES, "-p", profile, "--resume", session, "chat",
                        "-Q", "--query-file", query_path, "--in", str(ROOT)]
            code, out, err = run_cmd(work_cmd)
            return code, (f"[goal {session[:20]}] " + out), err

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
        watch.stop()
        foreign = watch.roles()
        files, foreign_files, notes = publication_plan(files, args.role, foreign)
        if foreign_files or foreign:
            print(f"{args.role}: " + "; ".join(notes))
        db.upsert_proposals(sorted(PROPOSALS.glob("*.json")))

        # Paskelbimas — bėgiklio, ne agento, darbas.
        result = publish(args.role, run_id, files, out or args.role,
                         implemented_id=int(proposal["id"]) if proposal else None,
                         foreign_roles=foreign, notes=notes)
        if status in ("ok", "partial"):
            status = result["status"]
        # Patikros vaidmenys (tikrintojas, publikavimo-agentas, kuratorius) iš
        # esmės failų nekeičia — jų rezultatas yra ataskaita. „empty“ klaidingai
        # atrodydavo kaip „nieko nepadarė“, todėl skiriame „checked“.
        if status == "empty" and len((out or "").strip()) > 400:
            status = "checked"

        if proposal:
            if status == "published":
                mark_implemented(int(proposal["id"]), files, result["sha"])
            elif status in ("rejected", "conflict", "unpushed", "failed", "timeout"):
                db.set_proposal_status(int(proposal["id"]), "blocked", f"{status}: {result['detail'][:120]}")

        db.finish_run(
            run_id, status, code, elapsed, str(log_path.relative_to(ROOT)), out, files,
            commit_sha=result["sha"], validation=result["validation"], detail=result["detail"],
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
        db.finish_run(run_id, "timeout", 124, elapsed, str(log_path.relative_to(ROOT)),
                      f"Baigėsi laikas ({timeout}s).", detail=f"Baigėsi laikas ({timeout}s).")
        update_state(args.role, cfg, "timeout", log_path)
        print(f"{args.role} #{run_id}: timeout")
        return 124
    finally:
        watch.stop()
        Path(query_path).unlink(missing_ok=True)
        Path(goal_path).unlink(missing_ok=True)
        fcntl.flock(lock_handle, fcntl.LOCK_UN)
        lock_handle.close()


if __name__ == "__main__":
    sys.exit(main())
