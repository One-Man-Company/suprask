#!/usr/bin/env python3
"""
Kalbos ir užduoties aiškumo tikrinimas (1–12 klasei).

Tikslas: užduotį perskaitęs vaikas turi suprasti ją VIENAREIKŠMIŠKAI. Skriptas
pagauna tai, ką galima patikrinti mechaniškai:

  - per ilgus sakinius konkrečiai klasei (visuose vaikui skaitomuose laukuose:
    `title`, `subtitle`, `concept.*`, `reflect`, `tasks[].q/hint/why/options`),
  - dviprasmiškus jungtukus („arba“ be „vienas iš“), dvigubą neigimą,
  - sakinius, prasidedančius „Tai/Šis/Jis“ be prieš tai buvusio daikto,
  - ilgus sudurtinius žodžius, kurių pirmokas neperskaito,
  - pasikartojančius žodžius tame pačiame sakinyje,
  - atsakymų variantų defektus (dublikatai, „visi“, „nei vienas“),
  - `answer` indekso klaidas.

Sakinio ilgio ribos (`MAX_WORDS`) yra ne šio failo išradimas, o
`docs/KURINIO-STANDARTAS.md` 6 skyriaus taisyklė („Sakinio ilgis 1–2 klasei —
iki 10 žodžių; 3–4 — iki 14; 5–6 — iki 18“). Todėl paleidimo pradžioje
tikrinama, ar lentelė vis dar sutampa su dokumentu: jei kas nors pakeičia
standartą ar lentelę atskirai, gaunama klaida, o ne tyliai švelnesnė riba.

Naudojimas:
    python3 scripts/check_language.py                 # 1 klasė
    python3 scripts/check_language.py --grade 1 --json
    python3 scripts/check_language.py --strict        # grąžina 1, jei yra klaidų

Pastaba dėl lygių: sakinio ilgis yra `warn`, o ne `error`, nes standarto
pažeidimas turinyje taisomas atskiru turinio darbu; `--strict` failina tik
`error` (neteisingas `answer`, variantų defektai). `info` — klausimas
peržiūrai (įvardis sakinio pradžioje), ne pažeidimas.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
STANDARD_DOC = ROOT / "docs" / "KURINIO-STANDARTAS.md"

# Kiek žodžių sakinyje dar įskaitoma atitinkamos klasės vaikui.
# Šaltinis: docs/KURINIO-STANDARTAS.md, 6 skyrius (Kalbos taisyklės).
# 7–12 klasei standartas sakinio ilgio ribos nenustato — lieka DEFAULT_MAX_WORDS.
MAX_WORDS = {1: 10, 2: 10, 3: 14, 4: 14, 5: 18, 6: 18}
DEFAULT_MAX_WORDS = 24
MAX_WORD_LEN = {1: 13, 2: 14, 3: 16, 4: 18}
DEFAULT_MAX_WORD_LEN = 20

# Ta pati taisyklė dokumente, iš kurios imamos ribos. Leidžiami brūkšniai – — -.
_DASH = r"(?:–|—|-)"
STANDARD_RULE_RE = re.compile(
    rf"Sakinio ilgis\s+1{_DASH}2\s+klasei\s+{_DASH}\s+iki\s+(\d+)\s+žodžių;"
    rf"\s*3{_DASH}4\s+{_DASH}\s+iki\s+(\d+);"
    rf"\s*5{_DASH}6\s+{_DASH}\s+iki\s+(\d+)"
)


def standard_limits(text: str) -> dict[int, int] | None:
    """Iš standarto dokumento išskaito klasių grupių ribas (None — nepavyko)."""
    m = STANDARD_RULE_RE.search(text or "")
    if not m:
        return None
    one_two, three_four, five_six = (int(g) for g in m.groups())
    return {1: one_two, 2: one_two, 3: three_four, 4: three_four, 5: five_six, 6: five_six}


def check_limits_against_standard(out: list[dict]) -> None:
    """Saugiklis nuo dviejų normų: lentelė turi sutapti su standartu.

    Be šio saugiklio ribos gali išsiskirti tyliai (taip ir atsirado 12/14/16/18/20/22
    vietoj 10/10/14/14/18/18) — tikrintuvas žalias, o sakinys per ilgas vaikui.
    """
    try:
        text = STANDARD_DOC.read_text(encoding="utf-8")
    except OSError as exc:
        out.append({"severity": "error", "where": str(STANDARD_DOC.relative_to(ROOT)),
                    "issue": "neperskaitomas standartas",
                    "detail": f"sakinio ilgio ribų patikrinti negalima: {exc}", "text": ""})
        return
    limits = standard_limits(text)
    if limits is None:
        out.append({"severity": "error", "where": str(STANDARD_DOC.relative_to(ROOT)),
                    "issue": "nerasta sakinio ilgio taisyklės",
                    "detail": "dokumente nebeliko formuluotės „Sakinio ilgis 1–2 klasei — iki N žodžių“",
                    "text": ""})
        return
    if limits != MAX_WORDS:
        diff = ", ".join(f"{g}: {MAX_WORDS.get(g)}≠{limits.get(g)}" for g in sorted(limits)
                         if MAX_WORDS.get(g) != limits.get(g))
        out.append({"severity": "error", "where": "scripts/check_language.py:MAX_WORDS",
                    "issue": "ribos nesutampa su standartu",
                    "detail": f"lentelėje {MAX_WORDS}, standarte {limits} ({diff})", "text": ""})

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


def check_readability(text: str, grade: int, where: str, out: list[dict]) -> None:
    """Sakinio ilgis ir žodžio ilgis — tai, ką vaikas turi perskaityti pats.

    Taikoma ir paaiškinimui (`concept`, `reflect`): standartas riboja vaikui
    skaitomą sakinį, ne tik užduoties klausimą.
    """
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
        for word in words:
            if len(word) > max_len:
                out.append({
                    "severity": "warn", "where": where, "issue": "ilgas žodis",
                    "detail": f"{word} ({len(word)} raidžių, riba {max_len})", "text": sentence,
                })


def check_text(text: str, grade: int, where: str, out: list[dict]) -> None:
    """Užduoties formuluotė: perskaitomumas + aiškumas (pasirinkimas, nuoroda)."""
    if not text:
        return
    check_readability(text, grade, where, out)

    for sentence in sentences(text):
        words = WORD_RE.findall(sentence)
        for m in re.finditer(r"\b(\w{4,})\b(\W+\1\b)+", sentence, re.I):
            out.append({
                "severity": "warn", "where": where, "issue": "kartojasi žodis",
                "detail": m.group(1), "text": sentence,
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


def check_concept(data: dict, grade: int, rel: str, out: list[dict]) -> None:
    """Vaikui skaitomi `concept` ir `reflect` laukai — perskaitomumo taisyklė galioja ir jiems.

    Anksčiau tikrinti tik `tasks`, todėl ilgas `concept.big_idea` sakinys likdavo
    nematomas: tikrintuvas žalias, o vaikas skaito 13 žodžių sakinį.
    `teacher.*` sąmoningai netikrinamas — tai suaugusiojo tekstas.
    """
    concept = data.get("concept") or {}
    for key in ("title", "big_idea", "example"):
        value = concept.get(key)
        if isinstance(value, str):
            check_readability(value, grade, f"{rel}:concept.{key}", out)
    steps = concept.get("steps") or []
    if isinstance(steps, list):
        for i, step in enumerate(steps, 1):
            if isinstance(step, str):
                check_readability(step, grade, f"{rel}:concept.steps[{i}]", out)
    reflect = data.get("reflect")
    if isinstance(reflect, str):
        check_readability(reflect, grade, f"{rel}:reflect", out)


def check_sim_config(data: dict, grade: int, rel: str, out: list[dict]) -> None:
    """`sim.config` tekstai — tai, ką simuliacija sako garsiai ir rodo ekrane.

    `scripts/generate_audio.py` renka būtent šiuos tekstus, tad vaikas juos
    išgirsta; standarto sakinio riba galioja ir jiems.
    """
    def walk(node, path: str):
        if isinstance(node, str):
            yield path, node
        elif isinstance(node, dict):
            for key, value in node.items():
                yield from walk(value, f"{path}.{key}")
        elif isinstance(node, list):
            for i, value in enumerate(node, 1):
                yield from walk(value, f"{path}[{i}]")

    sim = data.get("sim") or {}
    config = sim.get("config") if isinstance(sim, dict) else None
    if not isinstance(config, dict):
        return
    for path, text in walk(config, "config"):
        check_readability(text, grade, f"{rel}:sim.{path}", out)


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
    check_concept(data, grade, rel, out)
    check_sim_config(data, grade, rel, out)

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
    check_limits_against_standard(issues)
    for f in files:
        check_module(f, issues)

    errors = [i for i in issues if i["severity"] == "error"]
    warns = [i for i in issues if i["severity"] == "warn"]
    infos = [i for i in issues if i["severity"] == "info"]

    if args.json:
        print(json.dumps({"grade": args.grade, "modules": len(files), "max_words":
                          level(args.grade, MAX_WORDS, DEFAULT_MAX_WORDS), "issues": issues},
                         ensure_ascii=False))
    else:
        print(f"Moduliai: {len(files)} · klaidos: {len(errors)} · įspėjimai: {len(warns)}"
              f" · pastabos: {len(infos)} · sakinio riba: "
              f"{level(args.grade, MAX_WORDS, DEFAULT_MAX_WORDS)} ž.")
        shown = (errors + warns)[:40]
        for issue in shown:
            print(f"  [{issue['severity']}] {issue['where']}: {issue['issue']} — {issue['detail']}")
            if issue["text"]:
                print(f"        „{issue['text'][:110]}“")
        hidden = len(errors) + len(warns) - len(shown)
        if hidden > 0:
            print(f"  … rodoma {len(shown)} iš {len(errors) + len(warns)}, "
                  f"{hidden} nerodyta — žr. --json")
        if not errors and not warns:
            print("✔ Užduočių formuluotės švarios.")

    return 1 if (args.strict and errors) else 0


if __name__ == "__main__":
    raise SystemExit(main())
