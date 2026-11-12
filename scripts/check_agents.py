#!/usr/bin/env python3
"""
Agentų sistemos vientisumo patikra.

Sistemininkas (sistemos-architektas) keičia vaidmenis, grafikus ir promptus —
šis skriptas neleidžia tyliai suletinti sistemos: kiekvienas ROLES įrašas turi
turėti failą, modelį, grafiką ir ribas, o sugeneruoti systemd unit'ai turi
atitikti ROLES.

Naudojimas:
    python3 scripts/check_agents.py
    python3 scripts/check_agents.py --json
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "agents"))

REQUIRED = ("file", "profile", "toolsets", "cadence", "on_calendar",
            "max_turns", "budget", "timeout", "description")
UNITS = ROOT / "deploy" / "systemd"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    problems: list[str] = []
    warnings: list[str] = []

    try:
        import run as runner
    except Exception as exc:  # noqa: BLE001
        print(f"✘ Nepavyksta įkelti agents/run.py: {exc}")
        return 1

    roles = runner.ROLES
    if not roles:
        problems.append("ROLES tuščias")

    profiles = set()
    try:
        profiles = {p.name for p in (pathlib.Path.home() / ".hermes" / "profiles").iterdir() if p.is_dir()}
    except OSError:
        warnings.append("nepavyko perskaityti ~/.hermes/profiles — modelių patikra praleista")

    for role, cfg in roles.items():
        for key in REQUIRED:
            if not cfg.get(key):
                problems.append(f"{role}: trūksta „{key}“")

        role_file = ROOT / "agents" / cfg.get("file", "")
        if not role_file.is_file():
            problems.append(f"{role}: nėra vaidmens failo {cfg.get('file')}")
        else:
            text = role_file.read_text(encoding="utf-8")
            if len(text) < 400:
                problems.append(f"{role}: vaidmens failas per trumpas ({len(text)} simb.)")
            if "## Baigties sąlyga" not in text:
                problems.append(f"{role}: trūksta skilties „## Baigties sąlyga“")

        raw_cal = cfg.get("on_calendar")
        entries = raw_cal if isinstance(raw_cal, list) else [raw_cal] if raw_cal else []
        if isinstance(raw_cal, list) and not raw_cal:
            problems.append(f"{role}: on_calendar sąrašas tuščias")
        for cal in entries:
            cal = str(cal)
            if not re.match(r"^(\*|[0-9A-Za-z*/,:-]+)(\s+[0-9A-Za-z*/:,-]+){1,4}$", cal):
                warnings.append(f"{role}: neįprastas on_calendar formatas: {cal}")

        prof = cfg.get("profile")
        if profiles and prof and prof not in profiles:
            problems.append(f"{role}: modelio profilis „{prof}“ nerastas")

        queue = cfg.get("queue")
        if queue:
            cmd = ROOT / str(queue.get("command") or "")
            if not cmd.is_file():
                problems.append(f"{role}: eilės komanda nerasta: {queue.get('command')}")
            for key in ("max_items", "max_minutes"):
                if not isinstance(queue.get(key), int) or queue[key] <= 0:
                    problems.append(f"{role}: queue.{key} turi būti teigiamas sveikasis skaičius")

        timer = UNITS / f"suprask-{role}.timer"
        if not timer.is_file():
            problems.append(f"{role}: nėra timer failo {timer.relative_to(ROOT)}")
        else:
            unit_line = [l for l in timer.read_text(encoding="utf-8").splitlines() if l.startswith("Unit=")]
            expected = f"suprask-{role}-queue.service" if queue else f"suprask-agent@{role}.service"
            if unit_line and unit_line[0].strip() != f"Unit={expected}":
                problems.append(f"{role}: timer paleidžia {unit_line[0].strip()}, o turėtų Unit={expected}")
            if queue and not (UNITS / expected).is_file():
                problems.append(f"{role}: nėra {expected} failo")

    # timer'iai be vaidmens
    for f in sorted(UNITS.glob("suprask-*.timer")):
        role = f.stem.replace("suprask-", "")
        if role not in roles:
            warnings.append(f"{f.name}: timer'is be atitinkamo vaidmens ROLES")

    # Dienoraštis: architektas privalo palikti įrašą po kiekvieno darbo.
    # Tikrinamas paskutinis BAIGTAS paleidimas, o ne pirmas sąraše: kol
    # architektas dirba, `recent_runs()` pirmas įrašas yra `running`, ir senoji
    # sąlyga (imamas arch[0], o jo statusas netinka) neįsijungdavo būtent tuo
    # metu, kai patikra daroma — t. y. vartai buvo akli visada, kai jų reikia.
    # Įrodymas: 2026-11-11 (#238) ir 2026-11-12 paleidimai dienoraščio
    # nepapildė, o check_agents.py rodė 0 įspėjimų apie dienoraštį.
    journal = ROOT / "agents" / "system-journal.md"
    try:
        import db as _db
        finished_ok = {"published", "partial", "ok", "checked"}
        arch = [r for r in _db.recent_runs(80)
                if r.get("role") == "sistemos-architektas" and r.get("status") in finished_ok]
        if arch and journal.exists():
            last = arch[0]
            started = last.get("started") or ""
            if started:
                # Įrašas rašomas paleidimo metu, todėl lyginama su PRADŽIA:
                # paleidimo pabaigos laikas dar nesurašytas, kai patikra bėga.
                stamp = dt.datetime.fromisoformat(started).timestamp()
                if journal.stat().st_mtime < stamp:
                    warnings.append(
                        "sistemos-architektas baigė darbą (#%s) be agents/system-journal.md įrašo"
                        % last.get("id"))
    except Exception:  # noqa: BLE001
        pass

    # Sisteminiai pasiūlymai neturi savininko eilėje: kūrėjas jų sąmoningai
    # neima, o architektas paleidžiamas kartą per dieną. 2026-11-09 tokių buvo
    # 8, seniausias — 1 d.; jei jie laukia ilgiau nei 3 d., tai jau ne eilė, o
    # pamirštas darbas, kuris tyliai palieka vartus aklus.
    try:
        import db as _db2
        from kurejas_queue import SYSTEM_PREFIXES as _sys_prefixes

        cutoff = dt.datetime.now().astimezone() - dt.timedelta(days=3)
        waiting: list[str] = []
        for r in _db2.proposals(500, status="new"):
            target = (r.get("target") or "").strip()
            paths = [p.strip() for p in target.replace(";", ",").split(",") if p.strip()]
            if not paths or not all(p.startswith(_sys_prefixes) for p in paths):
                continue
            try:
                stamp = dt.datetime.fromisoformat(r.get("created") or "")
            except ValueError:
                continue
            if stamp.tzinfo is None:
                stamp = stamp.replace(tzinfo=cutoff.tzinfo)
            if stamp < cutoff:
                waiting.append(f"#{r['id']} {(r.get('title') or '')[:60]}")
        if waiting:
            warnings.append(f"sisteminiai pasiūlymai laukia >3 d. ({len(waiting)}): "
                            + "; ".join(waiting[:4]))
    except Exception:  # noqa: BLE001
        pass

    # Turinio sastings: sistemos tikslas — pamoka vaikui, ne paleidimų skaičius.
    # Pauzė atrodė kaip sveika sistema (pristabdyti paleidimai skaitėsi kaip
    # eiliniai), todėl 2026-11-11 turinys neaugo 34 val., o jokia patikra to
    # nepasakė. Dabar tikriname du dalykus: ar sistema pristabdyta, ir ar yra
    # ką kurti (eilėje yra ne sisteminis pasiūlymas), o kūrėjas vis tiek tyli.
    try:
        import pause as _pause
        paused, until = _pause.is_paused()
        if paused:
            warnings.append(f"sistema pristabdyta iki {until} — agentai dirba tuščiai, turinys neauga")
    except Exception:  # noqa: BLE001
        pass

    try:
        import db as _db3
        from kurejas_queue import SYSTEM_PREFIXES as _sys_p

        def _takeable(rows: list[dict]) -> list[dict]:
            out = []
            for r in rows:
                target = (r.get("target") or "").strip()
                paths = [p.strip() for p in target.replace(";", ",").split(",") if p.strip()]
                if paths and all(p.startswith(_sys_p) for p in paths):
                    continue
                out.append(r)
            return out

        queue = _takeable(_db3.proposals(500, status="new"))
        published = [r for r in _db3.recent_runs(120)
                     if r.get("role") == "kurejas" and r.get("status") == "published"]
        if queue and published:
            last = dt.datetime.fromisoformat(published[0].get("finished") or published[0].get("started") or "")
            if last.tzinfo is None:
                last = last.replace(tzinfo=dt.datetime.now().astimezone().tzinfo)
            idle_h = (dt.datetime.now().astimezone() - last).total_seconds() / 3600
            if idle_h > 36:
                tail = "pasiūlymas" if len(queue) == 1 else "pasiūlymai"
                warnings.append(f"kūrėjas nepaskelbė naujo turinio {idle_h:.0f} val., o eilėje {len(queue)} {tail}"
                                " — turinys neauga, nors darbas yra")
    except Exception:  # noqa: BLE001
        pass

    if args.json:
        print(json.dumps({"ok": not problems, "problems": problems, "warnings": warnings,
                          "roles": len(roles)}, ensure_ascii=False, indent=2))
        return 0 if not problems else 1

    if problems:
        print("✘ Agentų sistema nesutvarkyta:")
        for p in problems:
            print("  -", p)
        for w in warnings:
            print("  ! ", w)
        return 1

    note = f", įspėjimų {len(warnings)}" if warnings else ""
    print(f"✔ Agentai: {len(roles)} vaidmenų, visi su failais, grafikais ir ribomis{note}")
    for w in warnings:
        print("  ! ", w)
    return 0


if __name__ == "__main__":
    sys.exit(main())
