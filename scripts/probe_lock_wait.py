#!/usr/bin/env python3
"""Zondas užrakto laukimo taisyklei (#516) — pakartojamas, be tinklo, < 5 s.

Kodėl šis failas egzistuoja (LL-36). Iki šio paleidimo `agents/run.py` laukė
užrakto VISADA 900 s, nors eilės vaidmens vienas darbas trunka iki 2098 s
(p95, `runs.db` 2026-11-24). Todėl grafinis vaidmuo, atėjęs eilės lango metu,
dūsdavo po 15 min ir visas jo dienos darbas virsdavo `skipped`. Matuota:
6 `skipped` paleidimai, 5 iš jų — `Užraktas užimtas ilgiau nei 900 s`;
`kritikas` neteko 2 iš 7 paleidimų (28 %) būtent taip (2026-11-20 #408,
2026-11-24 #511 — abu kartus kaltas `kalbu-redaktorius` eilė).

Taisyklės, kurias šis zondas laiko gyvas:

  Z1–Z4  `lock_wait_budget()` — laukiama ilgiau, kai laiko EILĖS vaidmuo, o
         `SUPRASK_LOCK_WAIT` visada laimi (rankinis paleidimas turi savo ribą).
  Z5–Z7  laukimo žymė `agents/.wait.<role>`: šviežia matoma, pasenusi ne
         (lūžęs procesas neturi amžinai blokuoti eilės), savas vaidmuo
         neskaičiuojamas.
  Z8–Z10 `yield_to_waiting()`: eilė užleidžia vietą laukiančiam ir pasako, kam;
         kai laukiančių nėra — negaišta nė sekundės.
  Z11–Z13 žymė NĖRA turinys: `RUNTIME_RE` ją atpažįsta, `.gitignore` ją ignoruoja,
         o publikuojamų failų sąrašas jos neima (kitaip žymė patektų į commit'ą
         kaip LL-45 atvejis su `.run.ideator.lock`).

Naudojimas:
    python3 scripts/probe_lock_wait.py      # 0 — visi lūkesčiai išsipildė
"""

from __future__ import annotations

import os
import pathlib
import sys
import tempfile
import time

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(ROOT / "agents"))

import run as runner  # noqa: E402

results: list[tuple[str, bool, str]] = []


def expect(name: str, got, want) -> None:
    results.append((name, got == want, f"gauta {got!r}, laukta {want!r}"))


tmp = pathlib.Path(tempfile.mkdtemp(prefix="probe-lock-"))
_orig_marker = runner.role_wait_marker
runner.role_wait_marker = lambda role: tmp / f".wait.{role}"  # type: ignore[assignment]
_orig_lock = runner.LOCK_FILE


def marker(role: str, age_s: float = 0.0) -> None:
    path = runner.role_wait_marker(role)
    path.write_text("x", encoding="utf-8")
    if age_s:
        stamp = time.time() - age_s
        os.utime(path, (stamp, stamp))


def main() -> int:
    # ── Užrakinimo biudžetas ────────────────────────────────────────────────
    expect("Z1 eilė laiko → ilgesnis laukimas",
           runner.lock_wait_budget(None, ["kurejas"], runner.LOCK_WAIT_DEFAULT),
           runner.LOCK_WAIT_QUEUE)
    expect("Z2 ne eilė laiko → bazinė riba",
           runner.lock_wait_budget(None, ["kritikas"], runner.LOCK_WAIT_DEFAULT),
           runner.LOCK_WAIT_DEFAULT)
    expect("Z3 ENV laimi prieš eilę",
           runner.lock_wait_budget("120", ["kurejas"], runner.LOCK_WAIT_DEFAULT), 120)
    expect("Z4 biudžetas niekada nemažėja",
           runner.lock_wait_budget(None, ["kritikas"], runner.LOCK_WAIT_QUEUE),
           runner.LOCK_WAIT_QUEUE)

    # ── Laukimo žymė ───────────────────────────────────────────────────────
    marker("kritikas")
    expect("Z5 švieži žymė matoma", runner.waiting_roles(exclude="kurejas"), ["kritikas"])
    expect("Z6 savas vaidmuo neskaičiuojamas", runner.waiting_roles(exclude="kritikas"), [])

    marker("sistemos-architektas", age_s=runner.WAIT_MARKER_FRESH_S + 60)
    expect("Z7 pasenusi žymė ignoruojama",
           runner.waiting_roles(exclude="kurejas"), ["kritikas"])

    # ── Eilė užleidžia vietą ───────────────────────────────────────────────
    # Z8–Z9: laukiantis vaidmuo atpažįstamas, o eilė NEGAIŠTA laukdama amžinai —
    # lubos (max_wait_s) grąžina tekstą su kaltuoju, o ne tildo įvykį.
    started = time.time()
    msg = runner.yield_to_waiting("kurejas", max_wait_s=1, step_s=0.05, give_s=0)
    results.append(("Z8 laukiantis atpažintas ir pavadintas",
                    "kritikas" in msg, f"pranešimas: {msg!r}"))
    results.append(("Z9 laukimas laikosi savo lubų", time.time() - started < 5,
                    f"{time.time() - started:.2f} s"))

    # Z8b: kai laukiantis paleidimas paima užraktą (žymė dingsta), eilė grąžina
    # „užleista“ — tai šaka, kuri realiai saugo grafinį vaidmenį.
    import threading
    marker("kritikas")
    threading.Timer(0.2, lambda: runner.role_wait_marker("kritikas").unlink(missing_ok=True)).start()
    msg = runner.yield_to_waiting("kurejas", max_wait_s=10, step_s=0.05, give_s=0)
    results.append(("Z8b užleista, kai žymė dingsta",
                    msg.startswith("užleista") and "kritikas" in msg, f"pranešimas: {msg!r}"))

    for role in ("kritikas", "sistemos-architektas"):
        runner.role_wait_marker(role).unlink(missing_ok=True)
    started = time.time()
    msg = runner.yield_to_waiting("kurejas", step_s=0.02, give_s=0)
    expect("Z10 kai laukiančių nėra — tuščia ir greitai",
           (msg, time.time() - started < 2), ("", True))

    # ── Žymė nėra turinys ──────────────────────────────────────────────────
    expect("Z11 RUNTIME_RE pažįsta žymę",
           runner.is_runtime_artifact("agents/.wait.kritikas"), True)
    expect("Z12 RUNTIME_RE nepažįsta modulio",
           runner.is_runtime_artifact("content/lt/grade-01/matematika/14-pinigai.json"),
           False)
    ignored = (ROOT / ".gitignore").read_text(encoding="utf-8")
    expect("Z13 .gitignore ignoruoja žymes",
           any(line.strip() == "agents/.wait.*" for line in ignored.splitlines()), True)

    # ── Kas laiko užraktą (#516) ───────────────────────────────────────────
    # Z14–Z16: iki šio pakeitimo `active_role_locks()` skaitė
    # `agents/.run.<role>.lock`, kurių niekas neužrakina nuo 378dbd8, todėl
    # VISADA grąžindavo []. Todėl žurnalas sakė „laukia, kad baigs kitas
    # agentas“ be vardo, o eilės biudžetas negalėdavo sužinoti, kad laukiama
    # būtent eilės vaidmens. Čia paleidžiamas tikras vaidmens procesas, kuris
    # laiko bendrą užraktą, ir tikrinama, ar jis matomas.
    import subprocess
    work = pathlib.Path(tempfile.mkdtemp(prefix="probe-holder-"))
    fake = work / "agents" / "run.py"
    fake.parent.mkdir(parents=True)
    fake.write_text(
        "import fcntl, os, sys, time\n"
        "h = open(os.environ['LOCK'], 'w')\n"
        "fcntl.flock(h, fcntl.LOCK_EX)\n"
        "print('ready', flush=True)\n"
        "time.sleep(30)\n",
        encoding="utf-8",
    )
    lock_path = work / ".run.lock"
    lock_path.touch()
    child = subprocess.Popen(
        [sys.executable, str(fake), "kritikas"],
        env=dict(os.environ, LOCK=str(lock_path)),
        stdout=subprocess.PIPE, text=True,
    )
    try:
        assert child.stdout is not None
        child.stdout.readline()          # „ready“ — užraktas tikrai laikomas
        runner.LOCK_FILE = lock_path     # type: ignore[assignment]
        expect("Z14 laikytojas atpažįstamas pagal PID",
               runner.lock_holder_role(), "kritikas")
        expect("Z15 laikytojas matomas sąraše",
               "kritikas" in runner.active_role_locks(), True)
        expect("Z16 savas vaidmuo atskiriamas",
               runner.lock_holder_role(exclude="kritikas"), None)
    finally:
        runner.LOCK_FILE = _orig_lock  # type: ignore[assignment]
        child.kill()
        child.wait(timeout=5)
        for leftover in work.rglob("*"):
            if leftover.is_file():
                leftover.unlink(missing_ok=True)
        for d in sorted(work.rglob("*"), reverse=True):
            if d.is_dir():
                d.rmdir()
        work.rmdir()

    runner.role_wait_marker = _orig_marker  # type: ignore[assignment]
    for leftover in tmp.glob("*"):
        leftover.unlink(missing_ok=True)
    tmp.rmdir()

    ok = sum(1 for _, passed, _ in results if passed)
    for name, passed, detail in results:
        print(f"{'✔' if passed else '✘'} {name}" + ("" if passed else f" — {detail}"))
    print(f"\n{ok}/{len(results)}")
    return 0 if ok == len(results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
