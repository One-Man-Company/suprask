#!/usr/bin/env python3
"""
Kalbos ir užduoties aiškumo tikrinimas (1–12 klasei).

Tikslas: užduotį perskaitęs vaikas turi suprasti ją VIENAREIKŠMIŠKAI. Skriptas
pagauna tai, ką galima patikrinti mechaniškai:

  - per ilgus sakinius konkrečiai klasei,
  - dviprasmiškus jungtukus („arba“ be „vienas iš“), dvigubą neigimą,
  - sakinius, prasidedančius „Tai/Šis/Jis“ be prieš tai buvusio daikto,
  - ilgus sudurtinius žodžius, kurių pirmokas neperskaito,
  - pasikartojančius žodžius tame pačiame sakinyje,
  - atsakymų variantų defektus (dublikatai, „visi“, „nei vienas“),
  - `answer` indekso klaidas.

Naudojimas:
    python3 scripts/check_language.py                 # 1 klasė
    python3 scripts/check_language.py --grade 1 --json
    python3 scripts/check_language.py --strict        # grąžina 1, jei yra klaidų
"""

from __future__ import annotations

import argparse
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Kiek žodžių sakinyje dar įskaitoma atitinkamos klasės vaikui
MAX_WORDS = {1: 12, 2: 14, 3: 16, 4: 18, 5: 20, 6: 22}
DEFAULT_MAX_WORDS = 24
MAX_WORD_LEN = {1: 13, 2: 14, 3: 16, 4: 18}
DEFAULT_MAX_WORD_LEN = 20

AMBIGUOUS = (
    (r"\barba\b", "„arba“ — ar vaikas turi pasirinkti vieną, ar bet kuris tinka?"),
    (r"\bir\s*/\s*arba\b", "„ir/arba“ — dviprasmis pasirinkimas"),
    (r"\bnebūtinai\b", "„nebūtinai“ — neigimas su modaline reikšme, pirmokui per sunku"),
    (r"\bnebent\b", "„nebent“ — sudėtinga sąlyga"),
    (r"\bne\s+\w+\s+ne\b", "dvigubas neigimas"),
    (r"\btiek\s*\.\.\.\s*tiek\b", "nebaigtas „tiek… tiek“"),
)

VAGUE_START = re.compile(r"^(tai|šis|ši|šie|šios|jis|ji|jie|jos|tas|ta|tie|tos)\b", re.I)

FORBIDDEN_OPTIONS = ("visi atsakymai", "visi variantai", "nei vienas", "viskas tinka", "jokio")

WORD_RE = re.compile(r"[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+")


def sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text or "") if s.strip()]


def level(value: int, table: dict[int, int], default: int) -> int:
    return table.get(value, default)


def check_text(text: str, grade: int, where: str, out: list[dict]) -> None:
    if not text:
        return
    max_words = level(grade, MAX_WORDS, DEFAULT_MAX_WORDS)
    max_len = level(grade, MAX_WORD_LEN, DEFAULT_MAX_WORD_LEN)

    for sentence in sentences(text):
        words = WORD_RE.findall(sentence)
        if len(words) > max_words:
            out.append({
                "severity": "warn", "where": where, "issue": "per ilgas sakinys",
                "detail": f"{len(words)} žodžių (riba {max_words})", "text": sentence,
            })
        for m in re.finditer(r"\b(\w{4,})\b(\W+\1\b)+", sentence, re.I):
            out.append({
                "severity": "warn", "where": where, "issue": "kartojasi žodis",
                "detail": m.group(1), "text": sentence,
            })
        for word in words:
            if len(word) > max_len:
                out.append({
                    "severity": "warn", "where": where, "issue": "ilgas žodis",
                    "detail": f"{word} ({len(word)} raidžių, riba {max_len})", "text": sentence,
                })
        for pattern, why in AMBIGUOUS:
            if re.search(pattern, sentence, re.I):
                out.append({
                    "severity": "warn", "where": where, "issue": "dviprasmybė",
                    "detail": why, "text": sentence,
                })
        if VAGUE_START.match(sentence) and len(words) > 3:
            out.append({
                "severity": "info", "where": where, "issue": "neaiški nuoroda pradžioje",
                "detail": "sakinys prasideda įvardžiu — ar aišku, į ką jis rodo?",
                "text": sentence,
            })


def check_module(path: pathlib.Path, out: list[dict]) -> None:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        out.append({"severity": "error", "where": str(path), "issue": "neteisingas JSON",
                    "detail": str(exc), "text": ""})
        return

    grade = int(data.get("grade") or 1)
    rel = str(path.relative_to(ROOT))
    check_text(data.get("title", ""), grade, f"{rel}:title", out)
    check_text(data.get("subtitle", ""), grade, f"{rel}:subtitle", out)

    for i, task in enumerate(data.get("tasks") or [], 1):
        q = task.get("q") or ""
        where = f"{rel}:tasks[{i}]"
        check_text(q, grade, where + ":q", out)
        check_text(task.get("hint", ""), grade, where + ":hint", out)
        check_text(task.get("why", ""), grade, where + ":why", out)

        if q and not q.rstrip().endswith(("?", "!", ":", ".", "…", "...")):
            out.append({"severity": "warn", "where": where, "issue": "trūksta skyrybos",
                        "detail": "klausimas be skyrybos ženklo", "text": q})
        cloze = q.rstrip().endswith(("…", "..."))
        if q and not cloze and not re.search(r"\b(kiek\w*|kur\w*|kaip\w*|kodėl|kuo|kada|į\s+ką|apie\s+ką|"
                               r"už\s+ką|su\s+kuo|iš\s+kur|įdėk|pasakyk|parodyk|suskaičiuok|"
                               r"pridėk|atnešk|sudėliok|sugrupuok|pavadink|parašyk|pažymėk|surask|"
                               r"priskirk|palygink|apskaičiuok|paskaičiuok|pasirink|nuspalvink|apibrauk|kas|ar)\b", q, re.I):
            out.append({"severity": "warn", "where": where, "issue": "neaiškus klausimas",
                        "detail": "nėra klausiamojo/veiksmo žodžio", "text": q})

        options = task.get("options") or []
        if len(options) < 3 or len(options) > 4:
            out.append({"severity": "error", "where": where, "issue": "neteisingas variantų skaičius",
                        "detail": f"{len(options)} (turi būti 3–4)", "text": q})
        if len({o.strip() for o in options}) != len(options):
            out.append({"severity": "error", "where": where, "issue": "pasikartojantys variantai",
                        "detail": ", ".join(options), "text": q})
        for o in options:
            low = o.lower()
            if any(f in low for f in FORBIDDEN_OPTIONS):
                out.append({"severity": "error", "where": where, "issue": "variantas be prasmės",
                            "detail": o, "text": q})
            check_text(o, grade, where + ":option", out)

        answer = task.get("answer")
        if not isinstance(answer, int) or not (0 <= answer < max(1, len(options))):
            out.append({"severity": "error", "where": where, "issue": "neteisingas answer indeksas",
                        "detail": repr(answer), "text": q})


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--grade", type=int, default=1)
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--strict", action="store_true", help="grąžinti 1, jei yra klaidų")
    args = ap.parse_args()

    files = sorted((ROOT / "content" / "lt" / f"grade-{args.grade:02d}").glob("*/*.json"))
    files = [f for f in files if f.name not in ("index.json", "path.json")]

    issues: list[dict] = []
    for f in files:
        check_module(f, issues)

    errors = [i for i in issues if i["severity"] == "error"]
    warns = [i for i in issues if i["severity"] == "warn"]

    if args.json:
        print(json.dumps({"grade": args.grade, "modules": len(files), "issues": issues}, ensure_ascii=False))
    else:
        print(f"Moduliai: {len(files)} · klaidos: {len(errors)} · įspėjimai: {len(warns)}")
        for issue in (errors + warns)[:40]:
            print(f"  [{issue['severity']}] {issue['where']}: {issue['issue']} — {issue['detail']}")
            if issue["text"]:
                print(f"        „{issue['text'][:110]}“")
        if not errors and not warns:
            print("✔ Užduočių formuluotės švarios.")

    return 1 if (args.strict and errors) else 0


if __name__ == "__main__":
    raise SystemExit(main())
