#!/usr/bin/env python3
"""
Klasių apimtis: kurias klases agentai gali vystyti ir kokios minimalios temos.

Kodėl atskiras failas: anksčiau visi agentai buvo prikalti prie 1 klasės.
Dabar žmogus dashboard'e (Tailscale viduje) įjungia/išjungia kiekvieną klasę
atskirai ir įrašo minimalų temų sąrašą. Tai **minimalus** sąrašas: agentai privalo
padengti šias temas, bet turi kurti žymiai daugiau turinio; vienai temai gali būti
keli moduliai ir jų skaičius neribojamas, kad tema būtų išnagrinėta visapusiškai.

Failas: agents/scope.json
    {
      "grades": {
        "1": {"enabled": true, "min_topics": ["pinigai", "laikas"], "updated": "..."},
        ...
      }
    }
"""

from __future__ import annotations

import json
import pathlib
import re
import unicodedata

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCOPE = ROOT / "agents" / "scope.json"
CONTENT = ROOT / "content" / "lt"
GRADES = 12


def _default() -> dict:
    return {
        "grades": {
            str(g): {"enabled": g == 1, "min_topics": [], "updated": None}
            for g in range(1, GRADES + 1)
        }
    }


def load() -> dict:
    data = _default()
    if SCOPE.exists():
        try:
            raw = json.loads(SCOPE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            raw = {}
        for k, v in (raw.get("grades") or {}).items():
            g = str(int(k))
            if g in data["grades"] and isinstance(v, dict):
                data["grades"][g]["enabled"] = bool(v.get("enabled", False))
                topics = v.get("min_topics")
                if isinstance(topics, list):
                    data["grades"][g]["min_topics"] = [str(t).strip() for t in topics if str(t).strip()]
                data["grades"][g]["updated"] = v.get("updated")
    return data


def save(data: dict) -> None:
    SCOPE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def set_grade(grade: int, *, enabled: bool | None = None, min_topics: list[str] | None = None) -> dict:
    if not 1 <= int(grade) <= GRADES:
        raise ValueError(f"klasė turi būti 1–{GRADES}")
    data = load()
    cell = data["grades"][str(int(grade))]
    if enabled is not None:
        cell["enabled"] = bool(enabled)
    if min_topics is not None:
        seen, clean = set(), []
        for t in min_topics:
            t = str(t).strip().strip("•-—").strip()
            if t and t.lower() not in seen:
                seen.add(t.lower())
                clean.append(t)
        cell["min_topics"] = clean
    import datetime as dt
    cell["updated"] = dt.datetime.now().isoformat(timespec="seconds")
    save(data)
    return data["grades"][str(int(grade))]


def enabled_grades() -> list[int]:
    return sorted(int(g) for g, v in load()["grades"].items() if v["enabled"])


def is_enabled(grade: int) -> bool:
    return bool(load()["grades"].get(str(int(grade)), {}).get("enabled"))


def grade_of_target(target: str) -> int | None:
    m = re.search(r"content/lt/grade-(\d{2})/", target or "")
    return int(m.group(1)) if m else None


def _norm(text: str) -> str:
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", text)


def _module_texts(grade: int) -> list[tuple[str, str]]:
    """(modulio id, tekstas) kiekvienam tos klasės moduliui."""
    gdir = CONTENT / f"grade-{grade:02d}"
    out: list[tuple[str, str]] = []
    if not gdir.exists():
        return out
    for f in sorted(gdir.glob("*/*.json")):
        try:
            d = json.loads(f.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        blob = " ".join(str(d.get(k, "")) for k in ("title", "subtitle", "strand"))
        blob += " " + " ".join(str(o) for o in (d.get("outcomes") or []))
        out.append((str(d.get("id") or f.stem), _norm(blob)))
    return out


def coverage(grade: int) -> list[dict]:
    """Ar minimalios temos jau turi bent vieną modulį.

    Tai apytikrė patikra (žodžių sutapimas), ne semantinė: ji skirta parodyti,
    ko dar niekas nelietė, o ne pakeisti žmogaus sprendimą.
    """
    data = load()
    cell = data["grades"].get(str(int(grade)), {})
    modules = _module_texts(grade)
    result = []
    for topic in cell.get("min_topics", []):
        words = [w for w in _norm(topic).split() if len(w) >= 4] or _norm(topic).split()
        hits = []
        for mid, blob in modules:
            matched = sum(1 for w in words if w in blob)
            if words and matched >= max(1, -(-len(words) * 6 // 10)):  # 60 %
                hits.append(mid)
        result.append({"topic": topic, "covered": bool(hits), "modules": hits[:4]})
    return result


def ages() -> dict[int, str]:
    """Amžiaus intervalai iš content/lt/grades.json (jei yra)."""
    try:
        meta = json.loads((CONTENT / "grades.json").read_text(encoding="utf-8"))
        return {int(g["grade"]): str(g.get("age") or "") for g in meta.get("grades", [])}
    except (json.JSONDecodeError, OSError, KeyError, ValueError):
        return {}


def report() -> dict:
    data = load()
    age_map = ages()
    out = []
    for g in range(1, GRADES + 1):
        cell = data["grades"][str(g)]
        cov = coverage(g)
        out.append({
            "grade": g,
            "age": age_map.get(g, ""),
            "enabled": cell["enabled"],
            "min_topics": cell["min_topics"],
            "updated": cell["updated"],
            "coverage": cov,
            "covered": sum(1 for c in cov if c["covered"]),
            "modules": len(_module_texts(g)),
        })
    return {"grades": out}


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--enable", type=int, nargs="*")
    ap.add_argument("--disable", type=int, nargs="*")
    ap.add_argument("--topics", type=int, help="klasė, kuriai įrašyti temas iš stdin")
    args = ap.parse_args()
    if args.enable:
        for g in args.enable:
            set_grade(g, enabled=True)
    if args.disable:
        for g in args.disable:
            set_grade(g, enabled=False)
    if args.topics:
        import sys
        lines = [l for l in sys.stdin.read().splitlines() if l.strip()]
        set_grade(args.topics, min_topics=lines)
    print(json.dumps(report(), ensure_ascii=False, indent=2))
