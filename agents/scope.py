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

# ---------------------------------------------------------------------------
# DALYKAI (kursai) — oficialus sąrašas ir numatytosios reikšmės
#
# Šaltinis: Pradinio, pagrindinio ir vidurinio ugdymo bendrosios programos bei
# Eurydice/Eurypedia „Teaching and learning" puslapiai (2025–2026 m. ugdymo
# planas). Tai MINIMALUS privalomų dalykų sąrašas, kurį žmogus gali keisti:
# mokyklos ugdymo planas skiriasi, o platforma gali sąmoningai apimti ir
# pasirenkamuosius dalykus.
# ---------------------------------------------------------------------------

SUBJECTS: dict[str, str] = {
    "lietuviu-kalba": "Lietuvių kalba ir literatūra",
    "uzsienio-kalba-1": "Pirmoji užsienio kalba",
    "uzsienio-kalba-2": "Antroji užsienio kalba",
    "matematika": "Matematika",
    "informatika": "Informatika",
    "gamtos-mokslai": "Gamtos mokslai (pasaulio pažinimas)",
    "biologija": "Biologija",
    "chemija": "Chemija",
    "fizika": "Fizika",
    "geografija": "Geografija",
    "istorija": "Istorija",
    "pilietiskumas": "Pilietiškumo pagrindai",
    "ekonomika": "Ekonomika ir verslumas",
    "dorinis-ugdymas": "Dorinis ugdymas (etika / tikyba)",
    "daile": "Dailė",
    "muzika": "Muzika",
    "teatras": "Teatras",
    "sokis": "Šokis",
    "technologijos": "Technologijos",
    "kunas": "Kūno kultūra",
    "gyvenimo-igudziai": "Gyvenimo įgūdžiai",
    "filosofija": "Filosofija",
    "psichologija": "Psichologija",
}

_PIRMAS = ["dorinis-ugdymas", "lietuviu-kalba", "pilietiskumas", "gamtos-mokslai",
           "matematika", "technologijos", "daile", "muzika", "kunas", "gyvenimo-igudziai"]

DEFAULT_SUBJECTS: dict[int, list[str]] = {
    1: _PIRMAS,
    2: _PIRMAS + ["uzsienio-kalba-1"],
    3: _PIRMAS + ["uzsienio-kalba-1"],
    4: _PIRMAS + ["uzsienio-kalba-1"],
    5: ["dorinis-ugdymas", "lietuviu-kalba", "uzsienio-kalba-1", "matematika", "informatika",
        "gamtos-mokslai", "technologijos", "geografija", "istorija", "daile", "muzika",
        "kunas", "gyvenimo-igudziai"],
    6: ["dorinis-ugdymas", "lietuviu-kalba", "uzsienio-kalba-1", "uzsienio-kalba-2",
        "matematika", "informatika", "gamtos-mokslai", "technologijos", "geografija",
        "istorija", "daile", "muzika", "kunas", "gyvenimo-igudziai"],
    7: ["dorinis-ugdymas", "lietuviu-kalba", "uzsienio-kalba-1", "uzsienio-kalba-2",
        "matematika", "informatika", "biologija", "fizika", "geografija", "istorija",
        "technologijos", "daile", "muzika", "kunas"],
    8: ["dorinis-ugdymas", "lietuviu-kalba", "uzsienio-kalba-1", "uzsienio-kalba-2",
        "matematika", "informatika", "biologija", "chemija", "fizika", "geografija",
        "istorija", "technologijos", "daile", "muzika", "kunas"],
    9: ["dorinis-ugdymas", "lietuviu-kalba", "uzsienio-kalba-1", "uzsienio-kalba-2",
        "matematika", "informatika", "biologija", "chemija", "fizika", "geografija",
        "istorija", "pilietiskumas", "ekonomika", "technologijos", "kunas"],
    10: ["dorinis-ugdymas", "lietuviu-kalba", "uzsienio-kalba-1", "uzsienio-kalba-2",
         "matematika", "informatika", "biologija", "chemija", "fizika", "geografija",
         "istorija", "pilietiskumas", "ekonomika", "technologijos", "kunas"],
    11: ["lietuviu-kalba", "matematika", "istorija", "uzsienio-kalba-1", "kunas",
         "dorinis-ugdymas"],
    12: ["lietuviu-kalba", "matematika", "istorija", "uzsienio-kalba-1", "kunas",
         "dorinis-ugdymas"],
}

# Srauto (strand) → dalyko sąsaja. Be jos padengtis būtų matuojama niekaip.
STRAND_SUBJECT = {
    "lietuviu-kalba": "lietuviu-kalba",
    "matematika": "matematika",
    "pasaulio-pazinimas": "gamtos-mokslai",
    "muzika": "muzika",
    "technologijos": "technologijos",
    "gyvenimo-igudziai": "gyvenimo-igudziai",
    "zaidimu-teorija": "pilietiskumas",
    "dailė": "daile",
    "daile": "daile",
    "kunas": "kunas",
    "informatika": "informatika",
    "istorija": "istorija",
    "geografija": "geografija",
    "biologija": "biologija",
    "chemija": "chemija",
    "fizika": "fizika",
}




def _default() -> dict:
    return {
        "grades": {
            str(g): {"enabled": g == 1, "min_topics": [],
                     "min_subjects": list(DEFAULT_SUBJECTS.get(g, [])), "updated": None}
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
                subjects = v.get("min_subjects")
                if isinstance(subjects, list):
                    data["grades"][g]["min_subjects"] = [str(s).strip() for s in subjects if str(s).strip()]
                data["grades"][g]["updated"] = v.get("updated")
    return data


def save(data: dict) -> None:
    SCOPE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _label(key: str) -> str:
    return SUBJECTS.get(key, key)


def normalise_subject(text: str) -> str:
    """Įveda žmogus: gali būti raktas (matematika) arba pavadinimas (Matematika).
    Grąžiname raktą, jei atpažįstame; kitaip paliekame įvestą tekstą — sąrašas
    nėra uždaras, mokytojas gali turėti savo dalyką."""
    raw = text.strip()
    low = raw.lower().replace("ė", "e").replace("ų", "u").replace("ū", "u")
    for key, label in SUBJECTS.items():
        if raw == key or low == key:
            return key
        lab_low = label.lower().replace("ė", "e").replace("ų", "u").replace("ū", "u")
        if low == lab_low:
            return key
    slug = re.sub(r"[^a-z0-9]+", "-", low).strip("-")
    for key, label in SUBJECTS.items():
        if slug and (slug in key or key in slug):
            return key
    return raw


def set_grade(grade: int, *, enabled: bool | None = None, min_topics: list[str] | None = None,
              min_subjects: list[str] | None = None) -> dict:
    if not 1 <= int(grade) <= GRADES:
        raise ValueError(f"klasė turi būti 1–{GRADES}")
    data = load()
    cell = data["grades"][str(int(grade))]
    if enabled is not None:
        cell["enabled"] = bool(enabled)
    if min_subjects is not None:
        seen, clean = set(), []
        for s in min_subjects:
            key = normalise_subject(str(s))
            if key and key.lower() not in seen:
                seen.add(key.lower())
                clean.append(key)
        cell["min_subjects"] = clean
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


def subject_coverage(grade: int) -> list[dict]:
    """Kurie privalomi dalykai jau turi bent vieną modulį.

    Modulis priskiriamas dalykui pagal savo `subject` lauką arba pagal srautą
    (STRAND_SUBJECT). Tai apytikrė, bet sąžininga patikra: ji rodo, ko dar
    nėra, o ne ką nors „įskaito“ už žmogų.
    """
    cell = load()["grades"].get(str(int(grade)), {})
    gdir = CONTENT / f"grade-{grade:02d}"
    by_subject: dict[str, list[str]] = {}
    if gdir.exists():
        index = {}
        try:
            index = json.loads((gdir / "index.json").read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            index = {}
        strand_titles = {s["id"]: (s.get("title") or "") for s in index.get("strands", [])}
        for f in sorted(gdir.glob("*/*.json")):
            try:
                d = json.loads(f.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                continue
            subj = str(d.get("subject") or "").strip()
            if not subj:
                strand = str(d.get("strand") or f.parent.name)
                subj = STRAND_SUBJECT.get(strand, "") or strand_titles.get(strand, "")
                subj = normalise_subject(subj) if subj else ""
            for key in {subj} if subj else set():
                by_subject.setdefault(key, []).append(str(d.get("id") or f.stem))
    out = []
    for raw in cell.get("min_subjects", []):
        key = normalise_subject(raw)
        mods = by_subject.get(key, [])
        out.append({"subject": key, "label": _label(key), "covered": bool(mods), "modules": mods[:4]})
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
            "min_subjects": cell.get("min_subjects", []),
            "subjects": subject_coverage(g),
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
