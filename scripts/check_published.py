#!/usr/bin/env python3
"""
Publikavimo būklė: kiek turinio yra repo ir kiek realiai pasiekė gyvą svetainę.

Skirtumas tarp „sukurta“ ir „paskelbta“ anksčiau nebuvo matomas: dashboard
skaičiavo failus diske, o svetainėje modulių buvo mažiau. Šis įrankis lygina
abi puses ir, svarbiausia, tikrina, ar nepradingo nė vienas modulio ID —
nuo to priklauso vaiko `localStorage` pažanga.

2026-11-09 išplėsta (pasiūlymas #8716). Anksčiau:
  - klasė buvo įrašyta kieta (`grade-01`) — kai bus paleista 2 klasė, įrankis
    jos nematytų ir vėl sakytų „sutampa“;
  - lyginamos tik ID aibės, tad gyva svetainė su tais pačiais ID, bet pasenusiu
    failo turiniu, būdavo pavadinta suderinta. Baitų lygybę agentai turėjo
    įrodinėti atskirais zondais kiekvieną publikavimo paleidimą.
Dabar: klasės imamos iš `grades.json` (`status: live`), kiekvienas gyvas
modulio failas lyginamas baitais (sha256) su repo failu, o pranešime
atskiriama „trūksta ID“ nuo „ID yra, turinys pasenęs“. Nesutapimas
patikrinamas antrą kartą — GitHub Pages pirmomis sekundėmis po deploymento
gali grąžinti mišrią krašto būseną (LL-76).

2026-11-12 (paleidimas #247): lyginami ir failai, kuriuos svetainė skaito
prieš modulį — `grades.json`, klasės `index.json`, `path.json` ir
`assets/audio/lt/manifest.json`. Anksčiau moduliai galėjo būti 200, o gyvas
manifestas pasenęs: naujo modulio garsas 404, o visi vartai žali (LL-78).

Naudojimas:
    python3 scripts/check_published.py               # žmogui
    python3 scripts/check_published.py --json        # dashboard'ui
    python3 scripts/check_published.py --grade 1     # viena klasė
    python3 scripts/check_published.py --no-bytes    # greita: tik ID ir seka
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import pathlib
import subprocess
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "lt"
GRADES = CONTENT / "grades.json"
LIVE_ROOT = os.environ.get("SUPRASK_LIVE_ROOT", "https://one-man-company.github.io/suprask/")
UA = {"User-Agent": "suprask-check/1.2"}

# Failai, kuriuos svetainė skaito prieš bet kurį modulį. Jie nelyginami modulio
# baitų cikle (jis eina tik per `content/lt/<klase>/`), todėl pasenęs gyvas
# `manifest.json` anksčiau likdavo nepastebėtas: visi moduliai 200, visi vartai
# žali, o naujo modulio garso įrašo svetainėje nėra (404). LL-78.
AUX_FILES = [
    ("content/lt/grades.json", CONTENT / "grades.json"),
    ("assets/audio/lt/manifest.json", ROOT / "assets" / "audio" / "lt" / "manifest.json"),
]



def grade_dir(grade: int) -> str:
    return f"grade-{grade:02d}"


def live_grades() -> list[int]:
    try:
        data = json.loads(GRADES.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return [1]
    out = [int(g["grade"]) for g in data.get("grades", []) if g.get("status") == "live"]
    return out or [1]


def local_index(grade: int) -> tuple[dict, dict[str, str]]:
    path = CONTENT / grade_dir(grade) / "index.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    files: dict[str, str] = {}
    for strand in data.get("strands", []):
        for mod in strand.get("modules", []):
            if mod.get("file"):
                files[mod["id"]] = mod["file"]
    return data, files


def fetch(url: str, timeout: int = 20) -> bytes | None:
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read()
    except Exception:  # noqa: BLE001
        return None


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def compare(local_path: pathlib.Path, url_rel: str) -> tuple[bool, int, int]:
    """(ar gyvas failas baitais lygus repo failui, repo baitai, gyvi baitai).

    -1 gyvuose reiškia „nepasiektas“, 0 — „repo failo nėra“.
    """
    if not local_path.exists():
        return False, 0, 0
    local = local_path.read_bytes()
    live = fetch(LIVE_ROOT + url_rel)
    if live is None:
        return False, len(local), -1
    if sha(live) != sha(local):
        # LL-76: pirmomis sekundėmis po deploymento kraštas gali būti mišrus.
        time.sleep(1.5)
        live = fetch(LIVE_ROOT + url_rel)
        if live is None:
            return False, len(local), -1
    return sha(live) == sha(local), len(local), len(live)


def same_bytes(rel: str) -> tuple[bool, int, int]:
    """(ar gyvas failas baitais lygus repo failui, repo baitai, gyvi baitai)."""
    return compare(CONTENT / rel, "content/lt/" + rel)



def check_grade(grade: int, compare_bytes: bool = True) -> dict:
    gd = grade_dir(grade)
    out: dict = {"grade": grade, "live_error": ""}

    try:
        data, files = local_index(grade)
    except (OSError, json.JSONDecodeError) as exc:
        out["live_error"] = f"repo index: {type(exc).__name__}: {exc}"
        return out
    local_ids = [m["id"] for s in data.get("strands", []) for m in s.get("modules", [])]

    live_ids: list[str] = []
    live_seq: list[str] = []
    for name in ("index.json", "path.json"):
        blob = fetch(f"{LIVE_ROOT}content/lt/{gd}/{name}")
        if blob is None:
            out["live_error"] = out["live_error"] or f"gyvas {gd}/{name} nepasiekiamas"
            break
        if name == "index.json":
            live_data = json.loads(blob.decode("utf-8"))
            live_ids = [m["id"] for s in live_data.get("strands", []) for m in s.get("modules", [])]
        else:
            live_seq = list(json.loads(blob.decode("utf-8")).get("sequence", []))

    out["local"] = len(local_ids)
    out["published"] = len(live_ids)
    out["missing_on_live"] = [m for m in local_ids if m not in live_ids]
    out["hidden_locally"] = [m for m in live_ids if m not in local_ids]

    try:
        local_seq = list(json.loads((CONTENT / gd / "path.json").read_text(encoding="utf-8")).get("sequence", []))
    except (OSError, json.JSONDecodeError):
        local_seq = []
    out["not_in_path"] = [m for m in local_ids if m not in local_seq]
    out["path_differs"] = bool(live_seq) and live_seq != local_seq
    if out["path_differs"]:
        out["path_missing"] = [m for m in local_seq if m not in live_seq]
        out["path_extra"] = [m for m in live_seq if m not in local_seq]

    stale: list[dict] = []
    stale_unknown: list[str] = []
    if compare_bytes:
        todo = [(mid, files[mid]) for mid in local_ids if mid in files]
        with ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(lambda pair: (pair[0], pair[1], same_bytes(*pair[1:])), todo))
        for mid, rel, (ok, local_size, live_size) in results:
            if not ok:
                if live_size < 0:
                    stale_unknown.append(mid)
                else:
                    stale.append({"id": mid, "file": rel, "repo_bytes": local_size,
                                  "live_bytes": live_size})
    out["stale"] = stale
    out["stale_unknown"] = stale_unknown

    # LL-78: klasės indeksas ir seka skaitomi prieš modulį, todėl jų baitai
    # lyginami atskirai — kitaip „ID yra“ dar nereiškia „svetainė rodo tą patį“.
    aux_stale: list[dict] = []
    if compare_bytes:
        for name in ("index.json", "path.json"):
            url_rel = f"content/lt/{gd}/{name}"
            ok, local_size, live_size = compare(CONTENT / gd / name, url_rel)
            if not ok:
                aux_stale.append({"file": url_rel, "repo_bytes": local_size, "live_bytes": live_size})
    out["aux_stale"] = aux_stale
    return out


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


def report(grades: list[int] | None = None, compare_bytes: bool = True) -> dict:
    grades = grades or live_grades()
    per_grade = [check_grade(g, compare_bytes) for g in grades]

    def merge(key: str) -> list:
        out: list = []
        for g in per_grade:
            for item in g.get(key, []):
                out.append(item if isinstance(item, str) else item)
        return out

    live_errors = [f"{grade_dir(g['grade'])}: {g['live_error']}" for g in per_grade if g.get("live_error")]

    # Svarbiausias failas, kurio modulio baitų ciklas neapima: garso manifestas.
    # Jo stagnacija reiškia 404 naujo modulio garsui, o visi kiti vartai žali.
    aux_stale = list(merge("aux_stale"))
    if compare_bytes:
        for url_rel, local_path in AUX_FILES:
            ok, local_size, live_size = compare(local_path, url_rel)
            if not ok:
                aux_stale.append({"file": url_rel, "repo_bytes": local_size, "live_bytes": live_size})

    return {
        "grades": per_grade,
        "live_grades": grades,
        # Suderinta su senuoju formatu (changelog'ai ir dashboard'as skaito šiuos raktus).
        "local": sum(g.get("local", 0) for g in per_grade),
        "published": sum(g.get("published", 0) for g in per_grade),
        "missing_on_live": merge("missing_on_live"),
        "hidden_locally": merge("hidden_locally"),
        "not_in_path": merge("not_in_path"),
        "stale": merge("stale"),
        "stale_unknown": merge("stale_unknown"),
        "aux_stale": aux_stale,
        "path_differs": [g["grade"] for g in per_grade if g.get("path_differs")],
        "unpushed_commits": len(unpushed()),
        "last_commit": last_commit(),
        "live_error": "; ".join(live_errors),
    }


def problems(data: dict) -> bool:
    return bool(
        data["missing_on_live"] or data["hidden_locally"] or data["not_in_path"]
        or data["stale"] or data["stale_unknown"] or data["path_differs"]
        or data.get("aux_stale") or data["unpushed_commits"] or data["live_error"]
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--grade", type=int, default=0, help="tikrinti vieną klasę")
    ap.add_argument("--no-bytes", action="store_true", help="greita: tik ID ir seka")
    args = ap.parse_args()

    grades = [args.grade] if args.grade else None
    data = report(grades, compare_bytes=not args.no_bytes)

    if args.json:
        print(json.dumps(data, ensure_ascii=False))
        return 1 if problems(data) else 0

    print(f"Repozitorija: {data['local']} moduliai")
    print(f"Paskelbta:    {data['published']} moduliai")
    for g in data["grades"]:
        print(f"  · {grade_dir(g['grade'])}: repo {g.get('local', 0)}, gyvai {g.get('published', 0)}")
    if data["live_error"]:
        print(f"Gyvos svetainės klaida: {data['live_error']}")
    if data["missing_on_live"]:
        print(f"NESKELBTA ({len(data['missing_on_live'])}): {', '.join(data['missing_on_live'])}")
    if data["hidden_locally"]:
        print(f"PAVOJUS PAŽANGAI — svetainėje yra, repo ne ({len(data['hidden_locally'])}): {', '.join(data['hidden_locally'])}")
    if data["stale"]:
        print(f"PASENĘS TURINYS — ID yra, failas gyvai kitas ({len(data['stale'])}):")
        for s in data["stale"]:
            print(f"  - {s['id']} ({s['file']}): repo {s['repo_bytes']} B, gyvai {s['live_bytes']} B")
    if data["stale_unknown"]:
        print(f"NEPASIEKIAMI gyvi failai ({len(data['stale_unknown'])}): {', '.join(data['stale_unknown'])}")
    if data["not_in_path"]:
        print(f"NĖRA path.json sekoje ({len(data['not_in_path'])}): {', '.join(data['not_in_path'])}")
    if data["path_differs"]:
        print(f"path.json seka skiriasi: klasė {', '.join(map(str, data['path_differs']))}")
    if data["aux_stale"]:
        print(f"PASENĘS PAGRINDINIS FAILAS — moduliai 200, bet svetainė skaito kitą ({len(data['aux_stale'])}):")
        for s in data["aux_stale"]:
            live = "nepasiektas" if s["live_bytes"] < 0 else f"gyvai {s['live_bytes']} B"
            print(f"  - {s['file']}: repo {s['repo_bytes']} B, {live}")
    if data["unpushed_commits"]:
        print(f"Neišstumta commit'ų: {data['unpushed_commits']}")
    if not problems(data):
        print("✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai).")

    return 1 if problems(data) else 0


if __name__ == "__main__":
    raise SystemExit(main())
