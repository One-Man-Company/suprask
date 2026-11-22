#!/usr/bin/env python3
"""Programos padengties eilė: ką programa reikalauja ir ko platformoje dar nėra.

Kodėl šis failas egzistuoja
---------------------------
Agentas matė tik `agents/scope.json` `min_topics` — 29 eilutes, kurias žmogus
surašė ranka dashboard'e. Tai NE programa: 1 klasės temų žemėlapyje yra 40
mokymosi vienetų, pasaulio pažinime — 10 pozicijų su kodais (26.1.1 … 26.5.1),
o lietuvių kalboje ištisa C sritis (rašymas) neturi nė vieno modulio. Todėl
agentas, kuriam liepta „kurk žymiai daugiau turinio“, sąraše matė tik 29
temos ir 7 „DAR NĖRA“ — po jų eilė atrodydavo tuščia, nors darbo buvo dešimtys
valandų.

Šis skriptas sugeneruoja `research/wiki/curriculum/backlog.json` ir
`backlog.md`: kiekviena programos pozicija su būsena
`covered` / `partial` / `missing`, kodais ir šaltinio eilute. Agentų promptas
(`agents/run.py::scope_brief`) įterpia trūkstamų pozicijų sąrašą, todėl
ideatorius nebeieško spragų rankiniu grep'u per 900 eilučių wiki, o renkasi
iš eilės.

Naudojimas:
    python3 scripts/curriculum_backlog.py            # perrašyti backlog.{json,md}
    python3 scripts/curriculum_backlog.py --check     # tik parodyti, rc=1 jei pasenęs
    python3 scripts/curriculum_backlog.py --json      # atspausdinti į stdout
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CURRICULUM = ROOT / "research" / "wiki" / "curriculum"
CONTENT = ROOT / "content" / "lt"
OUT_JSON = CURRICULUM / "backlog.json"
OUT_MD = CURRICULUM / "backlog.md"

sys.path.insert(0, str(ROOT / "agents"))
import scope  # noqa: E402  (modulių tekstai ir žodžių kamienų lyginimas)

# Temų žemėlapio skyrius → turinio srautas (kryptis repo).
SECTION_STRAND = {
    "A": "lietuviu-kalba",
    "B": "matematika",
    "C": "pasaulio-pazinimas",
}

# „Sritis" stulpelio reikšmė → srautas. 1 klasėje fizinis ugdymas ir
# informatika turi būti integruoti (programa), o savo srauto repo dar neturi —
# todėl jie grąžinami kaip `None`, o ne spėjami. Tai pati spraga, kurią verta
# matyti, o ne užmaskuoti netinkamu keliu.
SUBJECT_STRAND = {
    "lietuvių kalba": "lietuviu-kalba",
    "matematika": "matematika",
    "gamtos mokslai": "pasaulio-pazinimas",
    "visuomeninis ugdymas": "pasaulio-pazinimas",
    "gamtamokslinis komunikavimas": "pasaulio-pazinimas",
    "dailė": "daile",
    "muzika": "muzika",
    "technologijos": "technologijos",
    "gyvenimo įgūdžiai": "gyvenimo-igudziai",
    "etika": "dorinis-ugdymas",
    "fizinis ugdymas": None,
    "informatika": None,
}

GRADE = 1


def _slug(text: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", scope._norm(text))).strip("-")[:48]


def _next_number(grade: int, strand: str, state: dict[str, int] | None = None) -> int:
    """Kitas laisvas modulio numeris sraute.

    `state` — vieno generavimo skaitliukas: be jo visoms to paties srauto
    eilutėms buvo paskiriamas TAS PATS numeris (08, 08, 08…), o `target`
    turi būti tikras kelias, kurio dar nėra.
    """
    if state is not None and strand in state:
        state[strand] += 1
        return state[strand]
    gdir = CONTENT / f"grade-{grade:02d}" / strand
    used = []
    if gdir.exists():
        for f in gdir.glob("*.json"):
            m = re.match(r"(\d+)-", f.name)
            if m:
                used.append(int(m.group(1)))
    nxt = (max(used) + 1) if used else 1
    if state is not None:
        state[strand] = nxt
    return nxt


def _map_rows() -> list[dict]:
    """`1-klases-temų-žemėlapis.md` lentelės eilutės su skyriaus raide."""
    path = CURRICULUM / "1-klases-temų-žemėlapis.md"
    out: list[dict] = []
    section = ""
    section_letter = ""
    for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if line.startswith("## "):
            head = line[3:].strip()
            m = re.match(r"([A-Z])\.\s*(.+)$", head)
            if m:
                section_letter, section = m.group(1), m.group(2).strip()
            continue
        if not line.startswith("|") or "---" in line:
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) < 6 or cells[1] == "Tema" or "Mokymosi rezultatas" in line:
            continue
        sritis, tema, rezultatas, lygis, interaktyvumas, svietimas = cells[:6]
        key = f"{section_letter}:{_slug(tema)}"
        out.append({
            "key": key,
            "section": f"{section_letter}. {section}" if section else section_letter,
            "sritis": sritis,
            "topic": tema,
            "outcome": rezultatas,
            "level": lygis,
            "interactivity": interaktyvumas,
            "svietimas": svietimas,
            "source": f"research/wiki/curriculum/1-klases-temų-žemėlapis.md:{lineno}",
        })
    return out


def _code_rows() -> list[dict]:
    """`pasaulio-pazinimas-1-klase.md` §2.2 — 10 pozicijų su kodais 26.x.x."""
    path = CURRICULUM / "pasaulio-pazinimas-1-klase.md"
    out: list[dict] = []
    for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) < 4 or not re.match(r"^\d+\.\d+\.\d+$", cells[0]):
            continue
        code, tema, val, veikla = cells[:4]
        out.append({
            "key": code,
            "section": "C. Pasaulio pažinimas",
            "sritis": "Gamtos mokslai / Visuomeninis ugdymas",
            "topic": re.sub(r"\*\*", "", tema),
            "outcome": re.sub(r"\*\*", "", veikla),
            "level": "",
            "interactivity": "",
            "svietimas": "",
            "hours": val,
            "source": f"research/wiki/curriculum/pasaulio-pazinimas-1-klase.md:{lineno}",
        })
    return out


def _clean_topic(text: str) -> str:
    """`**26.1.1 traumų prevencija**` → `traumų prevencija` (kad sutaptų su žemėlapiu)."""
    text = re.sub(r"\*\*|`|\[\[|\]\]", "", text).strip()
    text = re.sub(r"^\d+\.\d+\.\d+\s*", "", text)
    return text.strip(" .;:—-")


def _gaps() -> list[dict]:
    """Skyriai, kurie vardija, ko platformoje NĖRA („Ko platformoje nėra").

    Srautas imamas iš failo vardo (`pasaulio-pazinimas-1-klase.md` →
    `pasaulio-pazinimas`): kitaip spragos eilutė lieka be `target` ir agentas
    negali jos imti, nors failo vieta akivaizdi. Jei eilutė turi programos kodą
    (26.1.1), kodas lieka raktu — tada ji susilieja su ta pačia pozicija iš
    pagrindinės lentelės, o ne atsiranda trečia eilutė ta pačia tema.
    """
    out: list[dict] = []
    for path in sorted(CURRICULUM.glob("*1-klase*.md")):
        base = path.name.split("-1-klase")[0]
        strand = SUBJECT_STRAND.get(base.replace("-", " "), None)
        if strand is None:
            strand = {"lietuviu-kalba": "lietuviu-kalba", "matematika": "matematika",
                      "pasaulio-pazinimas": "pasaulio-pazinimas"}.get(base)
        text = path.read_text(encoding="utf-8").splitlines()
        in_gap = False
        for lineno, line in enumerate(text, 1):
            if line.startswith("###") and re.search(r"ko (platformoje )?n[ėe]ra", line, re.I):
                in_gap = True
                continue
            if in_gap and line.startswith("## "):
                in_gap = False
                continue
            if not in_gap:
                continue
            raw = None
            if line.startswith("|"):
                cells = [c.strip() for c in line.strip("|").split("|")]
                if len(cells) >= 2 and "---" not in line and "Tema" not in line:
                    raw = (_clean_topic(cells[0]), _clean_topic(cells[1]))
            else:
                m = re.match(r"^[-*]\s+\*\*(.+?)\*\*\s*[—-]+\s*(.*)$", line.strip())
                if m:
                    raw = (_clean_topic(m.group(1)), _clean_topic(m.group(2)))
            if not raw or not raw[0]:
                continue
            topic, outcome = raw
            # Kodas ieškomas NUO EILUTĖS PRADŽIOS PO lentelės brūkšnio ir
            # paryškinimo: `| 26.1.1 **traumų prevencija** | …` ir
            # `- **26.2.3 medžiai** — …`. Be to eilutė su kodu susilieja su
            # ta pačia pozicija iš pagrindinės lentelės, o ne atsiranda trečia.
            head = re.sub(r"^[\s|*-]+", "", line)
            code = re.match(r"(\d+\.\d+\.\d+)", head)
            out.append({
                "key": code.group(1) if code else f"gap:{_slug(topic)}",
                "section": "Ko platformoje nėra",
                "sritis": "",
                "topic": topic,
                "outcome": outcome,
                "strand": strand,
                "level": "", "interactivity": "", "svietimas": "",
                "source": f"research/wiki/curriculum/{path.name}:{lineno}",
            })
    return out


def _module_blobs(grade: int) -> list[tuple[str, str]]:
    return scope._module_texts(grade)


def _matches(topic: str, blob: str) -> int:
    words = [w for w in scope._norm(topic).split() if len(w) >= 4] or scope._norm(topic).split()
    return sum(1 for w in words if scope._word_hits(w, blob))


def enrich(rows: list[dict], grade: int) -> list[dict]:
    """Prideda būseną: covered / partial / missing ir esamus modulius."""
    modules = _module_blobs(grade)
    numbers: dict[str, int] = {}
    for r in rows:
        words = [w for w in scope._norm(r["topic"]).split() if len(w) >= 4] or scope._norm(r["topic"]).split()
        scored = []
        for mid, blob in modules:
            hit = _matches(r["topic"], blob)
            if hit:
                scored.append((hit, mid))
        scored.sort(reverse=True)
        need = max(1, -(-len(words) * 6 // 10))  # 60 %
        strong = [mid for m, mid in scored if m >= need]
        weak = [mid for m, mid in scored if m < need]
        r["modules"] = (strong + weak)[:4]
        r["status"] = "covered" if strong else ("partial" if weak else "missing")
        # `target` suteikiamas TIK po sujungimo (build()), kad dvi eilutės
        # niekada negautų to paties failo numerio.
        r["target"] = ""
    return rows


def _strand_for(row: dict) -> str | None:
    section = row.get("section", "")
    letter = section[:1]
    if letter in SECTION_STRAND and row.get("sritis", "").lower().startswith(("dailė", "muzika",
            "technologijos", "gyvenimo", "etika", "fizinis", "informatika")):
        letter = "D"
    if letter in SECTION_STRAND:
        return SECTION_STRAND[letter]
    sritis = row.get("sritis", "").split("(")[0].strip().lower()
    return SUBJECT_STRAND.get(sritis)


def build(grade: int = GRADE) -> dict:
    rows = _gaps() + _code_rows() + _map_rows()  # eilės tvarka = vyresnumas
    for r in rows:
        if not r.get("strand"):  # spragų įrašas jau žino savo failą
            r["strand"] = _strand_for(r)
    rows = enrich(rows, grade)

    order = {"missing": 0, "partial": 1, "covered": 2}

    def _merge(dst: dict, src: dict) -> None:
        if order[src["status"]] < order[dst["status"]]:
            dst["status"], dst["modules"] = src["status"], src["modules"]
        if src.get("section") == "Ko platformoje nėra" and src.get("outcome"):
            extra = src["outcome"]
            if extra and extra not in (dst.get("gap") or ""):
                dst["gap"] = ((dst.get("gap", "") + " " + extra).strip()
                              if dst.get("gap") else extra)
        for field in ("strand", "sritis", "outcome", "source", "level",
                      "interactivity", "hours"):
            if not dst.get(field) and src.get(field):
                dst[field] = src[field]

    # 1 praėjimas — pagal temos vardą („Saugus elgesys" iš žemėlapio ir iš
    # spragų lentelės yra viena pozicija, net jei viena turi kodą, o kita ne).
    by_name: dict[str, dict] = {}
    for r in rows:
        key = _slug(re.sub(r"^\d+\.\d+\.\d+\s*", "", r["topic"]))
        have = by_name.get(key)
        if have is None:
            by_name[key] = r
            continue
        _merge(have, r)

    # 2 praėjimas — pagal kodą: numeruota pozicija nugali be kodo, o jei dvi
    # eilutės turi tą patį kodą (26.1.1 „Saugus elgesys" / „traumų
    # prevencija"), tai TA PATI programos pozicija — imame griežtesnę būseną
    # ir vieną `target`, kad agentas negautų dviejų failų tam pačiam darbui.
    by_code: dict[str, dict] = {}
    rest: list[dict] = []
    for r in by_name.values():
        if re.match(r"^\d+\.\d+\.\d+$", r["key"]):
            have = by_code.get(r["key"])
            if have is not None:
                _merge(have, r)
                continue
            by_code[r["key"]] = r
        else:
            rest.append(r)
    rows = list(by_code.values()) + rest
    # Target — po sujungimo, kad nebūtų dviejų eilučių su tuo pačiu numeriu.
    numbers: dict[str, int] = {}
    for r in rows:
        strand = r.get("strand")
        if strand and r["status"] != "covered" and not r.get("target") and strand:
            r["target"] = (f"content/lt/grade-{grade:02d}/{strand}/"
                           f"{_next_number(grade, strand, numbers):02d}-{_slug(r['topic'])}.json")
    counts = {"covered": 0, "partial": 0, "missing": 0}
    for r in rows:
        counts[r["status"]] = counts.get(r["status"], 0) + 1
    return {
        "grade": grade,
        "generated": dt.datetime.now().isoformat(timespec="seconds"),
        "source_hash": _source_hash(),
        "curriculum_positions": len(rows),
        "counts": counts,
        "modules_now": len(_module_blobs(grade)),
        "rows": rows,
    }


def _source_hash() -> str:
    """Pirštų atspaudas TIK tų failų, iš kurių generuojama (ne backlog.md!)."""
    h = hashlib.sha256()
    for p in sorted(CURRICULUM.glob("*.md")):
        if p.name == OUT_MD.name:  # savo paties išvestis — kitaip --check niekada nepraeitų
            continue
        h.update(p.name.encode())
        h.update(p.read_bytes())
    return h.hexdigest()[:16]


def to_markdown(data: dict) -> str:
    lines = [
        "---",
        'title: "1 klasės programos padengties eilė"',
        "tipas: padengtis",
        f"atnaujinta: {data['generated'][:10]}",
        "saltinis: \"sugeneruota `scripts/curriculum_backlog.py` iš research/wiki/curriculum/\"",
        "---",
        "",
        "# 1 klasės programos padengties eilė",
        "",
        "**Sugeneruota automatiškai — nekeisk ranka.** Šaltinis: `research/wiki/curriculum/*.md`.",
        "Šį failą agentų promptui paduoda `agents/run.py::scope_brief`.",
        "",
        f"- Programos pozicijų: **{data['curriculum_positions']}**",
        f"- Modulių dabar: **{data['modules_now']}**",
        f"- Padengta / iš dalies / nėra: **{data['counts']['covered']} / "
        f"{data['counts']['partial']} / {data['counts']['missing']}**",
        "",
        "## Ko dar nėra (prioritetas)",
        "",
        "| Būsena | Tema | Kodas | Rezultatas | Šaltinis |",
        "|---|---|---|---|---|",
    ]
    order = {"missing": 0, "partial": 1, "covered": 2}
    for r in sorted(data["rows"], key=lambda r: (order[r["status"]], r["section"], r["topic"])):
        src = r["source"].split("/")[-1]
        note = f" — {r['gap'][:90]}" if r.get("gap") else ""
        lines.append(
            f"| {r['status']} | {r['topic']}{note} | {r['key']} | {r['outcome'][:110]} | `{src}` |"
        )
    lines += ["", "## Kaip tai naudoti", "",
              "1. Imk `missing` eilutę, kurios `target` tuščias arba kurios srauto repo dar neturi —",
              "   tai struktūrinė spraga, kurią reikia užrašyti `research/wiki/guidelines/klausimai.md`,",
              "   o ne kurti modulį netinkamoje vietoje.",
              "2. Vienas modulis dengia VIENĄ poziciją; ta pati pozicija gali turėti kelis modulius",
              "   skirtingiems aspektams — tai leidžiama, bet `covered` dar nereiškia „išnagrinėta“.",
              ""]
    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--grade", type=int, default=GRADE)
    ap.add_argument("--check", action="store_true", help="rc=1, jei backlog.json pasenęs")
    ap.add_argument("--json", action="store_true", help="spausdinti JSON į stdout")
    args = ap.parse_args()

    data = build(args.grade)
    if args.json:
        print(json.dumps(data, ensure_ascii=False, indent=1))
        return 0
    if args.check:
        try:
            old = json.loads(OUT_JSON.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            print("KLAIDA: backlog.json nėra — paleisk be --check")
            return 1
        if old.get("source_hash") != data["source_hash"]:
            print("KLAIDA: backlog.json pasenęs (pasikeitė curriculum/*.md) — paleisk be --check")
            return 1
        print(f"✔ Padengties eilė suderinta: {data['curriculum_positions']} pozicijų, "
              f"{data['counts']['missing']} be modulio")
        return 0

    OUT_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    OUT_MD.write_text(to_markdown(data) + "\n", encoding="utf-8")
    c = data["counts"]
    print(f"✔ {OUT_JSON.relative_to(ROOT)} — {data['curriculum_positions']} pozicijų: "
          f"padengta {c['covered']}, iš dalies {c['partial']}, nėra {c['missing']}")
    print(f"✔ {OUT_MD.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
