#!/usr/bin/env python3
"""
SUPRASK turinio validatorius.

Tikrina modulių JSON pagal docs/KURINIO-STANDARTAS.md ir
docs/SVIETIMAS-1-GAIRES.md. Naudojamas CI ir agentų (tikrintojas).

Naudojimas:
    python3 scripts/validate_content.py
    python3 scripts/validate_content.py --grade 1
    python3 scripts/validate_content.py --strict
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "lt"
SIMS_DIR = ROOT / "assets" / "js" / "sims"

REQUIRED_MODULE = [
    "id", "grade", "strand", "title", "subtitle", "minutes",
    "outcomes", "concept", "tasks", "reflect", "teacher", "sources", "svietimas1",
]
REQUIRED_TEACHER = ["goal", "prompt", "offline", "misconceptions"]

FORBIDDEN_UI_WORDS = [
    "skill", "level", "streak", "challenge", "score", "badge", "leaderboard",
    "reward", "unlock", "checkpoint", "quest",
]

LITHUANIAN_CHARS = set("ąčęėįšųūžĄČĘĖĮŠŲŪŽ")

SIMPLIFIED_MAX = {1: 60, 2: 70, 3: 90, 4: 100}


class Report:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def err(self, msg: str) -> None:
        self.errors.append(msg)

    def warn(self, msg: str) -> None:
        self.warnings.append(msg)


def registered_sims() -> set[str]:
    """Renka simuliacijų ID iš assets/js/sims/*.js SIMS eksportų."""
    ids: set[str] = set()
    for f in SIMS_DIR.glob("*.js"):
        text = f.read_text(encoding="utf-8")
        block = re.search(r"export const SIMS\s*=\s*\{(.*?)\n\};", text, re.S)
        if not block:
            continue
        for m in re.finditer(r'^\s*(?:"([a-z0-9][a-z0-9-]+)"|([a-z0-9][a-z0-9-]+))\s*[:,]', block.group(1), re.M):
            ids.add(m.group(1) or m.group(2))
    return ids


# --- sim.config gyvumas (LL-61, #14726, #16338) ---------------------------
# `sim.config` yra vienintelis turinio kelias į simuliacijos žodžius: tą patį
# tekstą rodo mygtukas ir tą patį taria balsas, o `scripts/generate_audio.py`
# iš jo surenka garso manifestą. Jei komponentas config neima arba jo rakto
# neskaito, turinys tampa negyvas: JSON'e pakeistas žodis pakeičia garso
# įrašą, bet ekrane lieka sena kietai įrašyta eilutė — vaikas mato viena,
# girdi kita. Būtent taip 10 dienų gyvavo 17-judejimas (LL-61, #14726).
# Todėl tai klaida, o ne įspėjimas: negyva konfigūracija neša klaidingą
# informaciją vaikui ir jos niekas nepastebi be šios taisyklės.
_SIM_BODIES: dict[str, tuple[str, str]] | None = None


def _obj_body(src: str, start: int) -> str:
    """Objekto literalas nuo `const X = {` iki jį uždarančio skliausto."""
    if start < 0:
        return ""
    i = src.find("{", start)
    if i < 0:
        return ""
    depth = 0
    for j in range(i, len(src)):
        if src[j] == "{":
            depth += 1
        elif src[j] == "}":
            depth -= 1
            if depth == 0:
                return src[i:j + 1]
    return ""


def _mount_params(body: str) -> set[str] | None:
    """`mount({ ... })` raktų sąrašas. Skliaustai skaičiuojami, nes
    numatytoji reikšmė (`config = {}`) turi savo skliaustus."""
    m = re.search(r"mount\s*\(\s*\{", body)
    if not m:
        return None
    start = m.end() - 1
    depth = 0
    end = -1
    for j in range(start, len(body)):
        if body[j] == "{":
            depth += 1
        elif body[j] == "}":
            depth -= 1
            if depth == 0:
                end = j
                break
    if end < 0:
        return None
    parts, depth, cur = [], 0, ""
    for ch in body[start + 1:end]:
        if ch in "{[(":
            depth += 1
        elif ch in "}])":
            depth -= 1
        if ch == "," and depth == 0:
            parts.append(cur)
            cur = ""
        else:
            cur += ch
    parts.append(cur)
    return {p.split("=", 1)[0].strip() for p in parts if p.split("=", 1)[0].strip()}


def sim_component_bodies() -> dict[str, tuple[str, str]]:
    """SIMS raktas -> (failas, komponento objekto tekstas). Skaitoma kartą."""
    global _SIM_BODIES
    if _SIM_BODIES is not None:
        return _SIM_BODIES
    bodies: dict[str, tuple[str, str]] = {}
    for f in sorted(SIMS_DIR.glob("*.js")):
        src = f.read_text(encoding="utf-8")
        block = re.search(r"export const SIMS\s*=\s*\{(.*?)\n\};", src, re.S)
        if not block:
            continue
        reg = block.group(1)
        for key, var in re.findall(r'^\s*"([a-z0-9-]+)"\s*:\s*([A-Za-z_$][\w$]*)', reg, re.M):
            body = _obj_body(src, src.find(f"const {var} = {{"))
            if body:
                bodies[key] = (f.name, body)
        # Trumpasis registras (`desimtukas,` — matematika.js) leidžia raktą
        # sutapatinti su to paties vardo konstanta.
        for key in re.findall(r"^\s*([a-z][a-z0-9-]*)\s*,\s*$", reg, re.M):
            body = _obj_body(src, src.find(f"const {key} = {{"))
            if body:
                bodies[key] = (f.name, body)
    _SIM_BODIES = bodies
    return bodies


def check_sim_config(rel, comp: str, cfg, rep: Report) -> None:
    """Tikrina, ar modulio `sim.config` tikrai pasiekia simuliaciją.

    Ribos (sąmoningos): raktas ieškomas komponento kūne kaip žodis, todėl
    paminėjimas komentare taisyklę apgauna, o rakto reikšmės panaudojimo
    teisingumo ji nevertina. Ji gaudo visišką negyvumą (config neimamas arba
    raktas nenaudojamas) — būtent tą atvejį, kai vaikas mato viena, o girdi
    kita. Elgsenos zondas (kad config eilutė atsirastų DOM'e) liktų
    check_view.py pusėje.
    """
    if not isinstance(cfg, dict):
        rep.err(
            f"{rel}: „sim.config“ turi būti objektas, o yra {type(cfg).__name__} — "
            "komponentas masyvo nepriima ir žodžiai liktų nepanaudoti (#14726)"
        )
        return
    if not cfg:
        return
    entry = sim_component_bodies().get(comp)
    if entry is None:
        # Jei kūno rasti nepavyko, tyliai nepraeikime (LL-37): pasakome, kad
        # šio modulio gyvumo patikrinti negalėjome.
        rep.warn(f"{rel}: nepavyko perskaityti simuliacijos „{comp}“ kūno — sim.config gyvumas nepatikrintas")
        return
    fname, body = entry
    params = _mount_params(body)
    if not params or "config" not in params:
        rep.err(
            f"{rel}: simuliacija „{comp}“ ({fname}) montuojasi be „config“ "
            f"(mount({', '.join(sorted(params or []))})), todėl modulio raktai "
            f"({', '.join(map(str, cfg))}) į ekraną ir balsą nepatenka — prijunk config (LL-61)"
        )
        return
    # Komponentas, kuris config skaito bendrai (Object.entries/values/keys),
    # raktų vardų kode nemini sąmoningai — tada raktų tikrinti negalima.
    if re.search(r"Object\.(?:entries|values|keys)\(\s*config\b", body):
        return
    for key in cfg:
        if not re.search(rf"\b{re.escape(str(key))}\b", body):
            rep.err(
                f"{rel}: „sim.config.{key}“ simuliacija „{comp}“ ({fname}) nenaudoja — "
                "turinys keistų garso įrašą, bet ne ekraną (#14726)"
            )


def word_count(text: str) -> int:
    return len(re.findall(r"[\wąčęėįšųūžĄČĘĖĮŠŲŪŽ'-]+", text))


def normalize_for_match(text: str) -> str:
    """Sutvarko tekstą palyginimui: mažosios raidės, vientisi tarpai, vienodi brūkšniai."""
    text = str(text).lower().replace("−", "-").replace("–", "-").replace("—", "-")
    return re.sub(r"\s+", " ", text).strip()


def _significant_words(text: str) -> list[str]:
    """Turininiai žodžiai, kuriuos užuomina galėtų perskaityti vietoj vaiko."""
    return [w for w in re.findall(r"[a-ząčęėįšųūž0-9]+", normalize_for_match(text)) if len(w) >= 5]


def _word_stem(word: str) -> str:
    """Kamienas be galūnės: penkių raidžių žodis duoda keturias, ilgesnis — dviem mažiau."""
    return word[: max(4, len(word) - 2)]


def hint_leaks_option(options: list, answer: int, hint: str, question: str) -> list[str]:
    """Užuominos žodžiai, kurie išduoda būtent teisingą variantą (LL-22, LL-111, #18246).

    Vartas lygina ne visą varianto tekstą (tai jau daro klaida aukščiau), o atskirus
    žodžius kitu linksniu: „Į viršų“ ir „eik per viršų“ yra tas pats atsakymas vaikui.
    Kad įspėjimas nešauktų be reikalo, žodis skaitomas išdaviku tik tada, kai jis
    vartojamas **viename** variante (jei jį turi keli variantai, jis varianto
    nepasirenka) ir jo nėra klausime (ką klausimas pasakė, to užuomina nebeišduoda).
    """
    hint_n = normalize_for_match(hint)
    question_n = normalize_for_match(question)
    leaks = []
    for word in _significant_words(options[answer]):
        stem = _word_stem(word)
        pattern = rf"(?<!\w){re.escape(stem)}\w*"
        if not re.search(pattern, hint_n):
            continue
        if re.search(pattern, question_n):
            continue
        if any(re.search(pattern, normalize_for_match(other)) for i, other in enumerate(options) if i != answer):
            continue
        leaks.append(word)
    return leaks


def check_module(path: Path, data: dict, rep: Report, sims: set[str], grades_meta: dict) -> None:
    rel = path.relative_to(ROOT)
    for field in REQUIRED_MODULE:
        if field not in data or data[field] in (None, "", [], {}):
            rep.err(f"{rel}: trūksta privalomo lauko „{field}“")
    if rep.errors and any(str(rel) in e for e in rep.errors[-len(REQUIRED_MODULE):]):
        return

    grade = data.get("grade")
    if not isinstance(grade, int) or not 1 <= grade <= 12:
        rep.err(f"{rel}: „grade“ turi būti 1–12")

    if not re.fullmatch(r"\d{2}-[a-z0-9-]+", str(data.get("id", ""))):
        rep.err(f"{rel}: „id“ turi atitikti NN-slug formatą")

    minutes = data.get("minutes")
    if not isinstance(minutes, int) or not 8 <= minutes <= 12:
        rep.warn(f"{rel}: „minutes“ rekomenduojama 8–12 (dabar {minutes})")

    outcomes = data.get("outcomes") or []
    if not (1 <= len(outcomes) <= 3):
        rep.err(f"{rel}: „outcomes“ turi būti 1–3 (dabar {len(outcomes)})")
    for o in outcomes:
        if not re.match(r"^[A-ZĄČĘĖĮŠŲŪŽ]", str(o)):
            rep.warn(f"{rel}: rezultatas turėtų prasidėti didžiąja raide")
        if len(o) > 160:
            rep.warn(f"{rel}: rezultatas ilgesnis nei 160 simbolių")

    concept = data.get("concept") or {}
    for key in ("title", "big_idea", "steps"):
        if not concept.get(key):
            rep.err(f"{rel}: trūksta „concept.{key}“")
    if len(concept.get("big_idea", "")) > 260:
        rep.warn(f"{rel}: „big_idea“ ilgesnė nei 260 simbolių")
    steps = concept.get("steps") or []
    if not (2 <= len(steps) <= 4):
        rep.warn(f"{rel}: „concept.steps“ rekomenduojama 2–4 (dabar {len(steps)})")

    sim = data.get("sim")
    if sim:
        comp = sim.get("component")
        if comp not in sims:
            rep.err(f"{rel}: simuliacija „{comp}“ neegzistuoja registre (yra: {', '.join(sorted(sims))})")
        elif sim.get("config") is not None:
            check_sim_config(rel, comp, sim.get("config"), rep)

    tasks = data.get("tasks") or []
    if not (3 <= len(tasks) <= 5):
        rep.err(f"{rel}: užduočių turi būti 3–5 (dabar {len(tasks)})")
    answers = []
    transfer = False
    for i, t in enumerate(tasks, 1):
        for key in ("q", "options", "answer", "hint", "why"):
            if key not in t:
                rep.err(f"{rel}: {i} užduotis neturi „{key}“")
        opts = t.get("options") or []
        if len(opts) < 3:
            rep.err(f"{rel}: {i} užduotis turi mažiau nei 3 atsakymo variantus")
        ans = t.get("answer")
        if not isinstance(ans, int) or not 0 <= ans < max(len(opts), 1):
            rep.err(f"{rel}: {i} užduoties „answer“ už ribų")
        else:
            answers.append(ans)
        if not str(t.get("hint", "")).strip():
            rep.err(f"{rel}: {i} užduotis neturi užuominos")
        if len(str(t.get("hint", ""))) > 200:
            rep.warn(f"{rel}: {i} užduoties užuomina ilga (>200)")
        hint_norm = normalize_for_match(t.get("hint", ""))
        if isinstance(ans, int) and 0 <= ans < len(opts):
            correct = normalize_for_match(opts[ans])
            leaked = hint_leaks_option(opts, ans, t.get("hint", ""), t.get("q", ""))
            if len(correct) >= 2 and re.search(rf"(?<!\w){re.escape(correct)}(?!\w)", hint_norm):
                rep.err(
                    f"{rel}: {i} užduoties užuomina pasako teisingą atsakymą („{opts[ans]}“) — "
                    "nukreipk į klaidą, ne į atsakymą (gairės T3.1)"
                )
            elif leaked:
                rep.warn(
                    f"{rel}: {i} užduoties užuomina kartoja teisingo varianto žodį kitu linksniu "
                    f"(„{leaked[0]}“ iš „{opts[ans]}“) — vaikas perskaito atsakymą, o ne sprendžia (LL-22)"
                )

        if t.get("optional"):
            transfer = True
        q = str(t.get("q", "")).lower()
        if "kuris teiginys teisingas" in q or "ką atsimeni" in q or "įsimink" in q:
            rep.err(f"{rel}: {i} užduotis tikrina įsiminimą, ne supratimą")

    if answers and len(set(answers)) == 1 and len(answers) >= 3:
        rep.err(f"{rel}: visi teisingi atsakymai tame pačiame indekse ({answers[0]}) — perrašyk variantus")

    if isinstance(grade, int) and grade >= 1 and not transfer:
        rep.err(f"{rel}: trūksta praplėtimo užduoties („optional“) — reikalinga kiekviename modulyje")

    teacher = data.get("teacher") or {}
    for key in REQUIRED_TEACHER:
        if not teacher.get(key):
            rep.err(f"{rel}: trūksta „teacher.{key}“")
    if not isinstance(teacher.get("misconceptions"), list) or len(teacher.get("misconceptions", [])) < 2:
        rep.warn(f"{rel}: rekomenduojamos bent 2 dažnos klaidos")

    if not data.get("sources"):
        rep.err(f"{rel}: trūksta šaltinių")
    if not data.get("svietimas1"):
        rep.err(f"{rel}: trūksta sąsajos su Švietimas #1")

    # teksto kiekis pagal klasę
    limit = SIMPLIFIED_MAX.get(grade, 10**6)
    body = " ".join([str(data.get("subtitle", ""))] + list(concept.get("steps") or []) + [str(concept.get("big_idea", ""))])
    if word_count(body) > limit * 3:
        rep.warn(f"{rel}: teksto kiekis ({word_count(body)} ž.) didokas {grade} klasei")

    # kalba
    blob = json.dumps(data, ensure_ascii=False).lower()
    for w in FORBIDDEN_UI_WORDS:
        if re.search(rf"\b{w}\b", blob):
            rep.err(f"{rel}: vartotojo sąsajoje rastas anglicizmas „{w}“")

    # failo vieta turi atitikti klasę ir kryptį
    expected_dir = CONTENT / f"grade-{grade:02d}" / str(data.get("strand"))
    if path.parent != expected_dir:
        rep.err(f"{rel}: failas turi būti {expected_dir.relative_to(ROOT)}/{path.name}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--grade", type=int, default=None)
    ap.add_argument("--strict", action="store_true", help="įspėjimai laikomi klaidomis")
    args = ap.parse_args()

    rep = Report()
    sims = registered_sims()
    if not sims:
        rep.err("Nerasta nė viena simuliacija (assets/js/sims/*.js)")

    grades_file = CONTENT / "grades.json"
    if not grades_file.exists():
        rep.err("Trūksta content/lt/grades.json")
        print_report(rep, args)
        return 1

    try:
        grades_meta = json.loads(grades_file.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        rep.err(f"grades.json: neteisingas JSON: {e}")
        print_report(rep, args)
        return 1

    meta_by_grade = {g["grade"]: g for g in grades_meta.get("grades", [])}
    if len(meta_by_grade) != 12:
        rep.err(f"grades.json: turi būti 12 klasių (dabar {len(meta_by_grade)})")

    # grades.json turi rodyti TIKRĄ modulių skaičių, kitaip dashboard ir
    # svetainė rodo pasenusius skaičius (taip jau buvo: 16, kai buvo 18).
    for g, m in meta_by_grade.items():
        gdir = CONTENT / f"grade-{g:02d}"
        real = len(list(gdir.glob("*/*.json"))) if gdir.exists() else 0
        declared = m.get("modules")
        if declared is not None and int(declared) != real:
            rep.err(f"grades.json: {g} klasė skelbia {declared} modulių, o yra {real}")

    total_modules = 0
    live_grades = [g for g, m in meta_by_grade.items() if m.get("status") == "live"]

    # Visi platformos modulių ID su klase. Reikia `renamed_from` patikrai:
    # senas ID negali likti gyvas NEI kitoje klasėje, kitaip naršyklė perkeltų
    # vienos klasės žymą į kitos klasės modulį.
    global_ids: dict[str, int] = {}
    for idx_path in sorted(CONTENT.glob("grade-*/index.json")):
        try:
            idx_doc = json.loads(idx_path.read_text(encoding="utf-8"))
            idx_grade = int(idx_doc.get("grade"))
        except (json.JSONDecodeError, TypeError, ValueError):
            continue
        for strand in idx_doc.get("strands", []):
            for entry in strand.get("modules", []) or []:
                mid = entry.get("id")
                if isinstance(mid, str):
                    global_ids.setdefault(mid, idx_grade)

    for grade in (live_grades if args.grade is None else [args.grade]):
        index_path = CONTENT / f"grade-{grade:02d}" / "index.json"
        if not index_path.exists():
            rep.err(f"{index_path.relative_to(ROOT)}: nėra klasės indekso")
            continue
        try:
            index = json.loads(index_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            rep.err(f"{index_path.relative_to(ROOT)}: neteisingas JSON: {e}")
            continue

        seen_ids: set[str] = set()
        renames: list[tuple[str, list[str]]] = []
        for strand in index.get("strands", []):
            for key in ("id", "title", "emoji", "modules"):
                if not strand.get(key):
                    rep.err(f"{index_path.relative_to(ROOT)}: krypčiai trūksta „{key}“")
            for m in strand.get("modules", []):
                total_modules += 1
                mid = m.get("id")
                if mid in seen_ids:
                    rep.err(f"{index_path.relative_to(ROOT)}: pasikartojantis modulio ID „{mid}“")
                seen_ids.add(mid)
                rf = m.get("renamed_from")
                if rf is not None:
                    if not isinstance(rf, list) or not rf:
                        rep.err(
                            f"{index_path.relative_to(ROOT)}: „{mid}“ laukas „renamed_from“ "
                            "turi būti netuščias senų ID sąrašas"
                        )
                    else:
                        for old in rf:
                            if not isinstance(old, str) or not re.fullmatch(r"\d{2}-[a-z0-9-]+", old):
                                rep.err(
                                    f"{index_path.relative_to(ROOT)}: „{mid}“ renamed_from "
                                    f"turi NN-slug formato ID (dabar {old!r})"
                                )
                            elif old == mid:
                                rep.err(
                                    f"{index_path.relative_to(ROOT)}: „{mid}“ renamed_from "
                                    "nurodo patį save — senas ID turi būti kitas"
                                )
                        if len({str(x) for x in rf}) != len(rf):
                            rep.err(
                                f"{index_path.relative_to(ROOT)}: „{mid}“ renamed_from "
                                "kartoja tą patį seną ID"
                            )
                        renames.append((mid, [x for x in rf if isinstance(x, str)]))
                mod_path = CONTENT / str(m.get("file", ""))
                if not mod_path.exists():
                    rep.err(f"{index_path.relative_to(ROOT)}: modulio failas nerastas: {m.get('file')}")
                    continue
                try:
                    data = json.loads(mod_path.read_text(encoding="utf-8"))
                except json.JSONDecodeError as e:
                    rep.err(f"{mod_path.relative_to(ROOT)}: neteisingas JSON: {e}")
                    continue
                if data.get("id") != mid:
                    rep.err(f"{mod_path.relative_to(ROOT)}: „id“ ({data.get('id')}) nesutampa su indeksu ({mid})")
                if data.get("strand") != strand.get("id"):
                    rep.err(f"{mod_path.relative_to(ROOT)}: „strand“ nesutampa su katalogo kryptimi")
                check_module(mod_path, data, rep, sims, meta_by_grade)

        # `renamed_from` yra ne komentaras, o duomenys, kuriuos skaito naršyklė
        # (`assets/js/progress.js` → `renameMap`). Todėl jis turi būti
        # vienareikšmis: senas ID negyvas, grandinė baigtinė, o įrašas
        # `scripts/known_renames.json` negali likti be atitikmens čia — kitaip
        # vartai žali, o vaiko žyma vis tiek prarandama (LL-89 šeima).
        alias: dict[str, str] = {}
        for mid, olds in renames:
            for old in olds:
                if old in global_ids and global_ids[old] != grade:
                    rep.err(
                        f"{index_path.relative_to(ROOT)}: „{mid}“ renamed_from nurodo „{old}“, "
                        f"kuris vis dar gyvas {global_ids[old]} klasėje — žyma nukeliautų ne į tą modulį"
                    )
                elif old in seen_ids:
                    rep.err(
                        f"{index_path.relative_to(ROOT)}: „{mid}“ renamed_from nurodo „{old}“, "
                        "bet toks modulis vis dar gyvas — senas ID turi būti nebegyvas"
                    )
                if old in alias and alias[old] != mid:
                    rep.err(
                        f"{index_path.relative_to(ROOT)}: senas ID „{old}“ priskirtas dviem "
                        "moduliams — nežinia, kur kelti vaiko žymą"
                    )
                else:
                    alias[old] = mid
        for mid, _ in renames:
            chain = {mid}
            cur = mid
            while cur in alias:
                if cur in chain:
                    rep.err(
                        f"{index_path.relative_to(ROOT)}: renamed_from grandinė uždara "
                        f"(ciklas ties „{cur}“) — pažangos migracija negalėtų baigtis"
                    )
                    break
                chain.add(cur)
                cur = alias[cur]

        renames_file = ROOT / "scripts" / "known_renames.json"
        if renames_file.exists():
            try:
                known = json.loads(renames_file.read_text(encoding="utf-8")).get("renames") or []
            except json.JSONDecodeError:
                known = []
                rep.err(f"{renames_file.relative_to(ROOT)}: neteisingas JSON")
            declared = {old for _, olds in renames for old in olds}
            for r in known:
                if not isinstance(r, dict) or r.get("grade") != grade:
                    continue
                old, new = r.get("from"), r.get("to")
                if old and old not in declared:
                    rep.err(
                        f"{index_path.relative_to(ROOT)}: „{old}“ registruotas "
                        f"{renames_file.relative_to(ROOT)}, bet nė vienas modulis neturi "
                        f"renamed_from su šiuo ID — naršyklė seno ID nepažįsta, vaiko žyma liktų našlaite"
                    )
                if new and new not in seen_ids:
                    rep.err(
                        f"{renames_file.relative_to(ROOT)}: „{old}“ įpėdinis „{new}“ "
                        "klasės indekse neegzistuoja"
                    )

        # rekomenduojamas kelias (path.json) — neprivalomas, bet jei yra, turi būti nuoseklus
        path_file = index_path.parent / "path.json"
        if path_file.exists():
            try:
                path_doc = json.loads(path_file.read_text(encoding="utf-8"))
            except json.JSONDecodeError as e:
                rep.err(f"{path_file.relative_to(ROOT)}: neteisingas JSON: {e}")
                path_doc = {}
            seq = path_doc.get("sequence") or []
            if not isinstance(seq, list):
                rep.err(f"{path_file.relative_to(ROOT)}: „sequence“ turi būti sąrašas")
            else:
                unknown = [s for s in seq if s not in seen_ids]
                if unknown:
                    rep.err(f"{path_file.relative_to(ROOT)}: nežinomi moduliai: {', '.join(unknown)}")
                if len(seq) != len(set(seq)):
                    rep.err(f"{path_file.relative_to(ROOT)}: pasikartojantys moduliai sekoje")
                missing = [m for m in seen_ids if m not in seq]
                if missing:
                    rep.warn(f"{path_file.relative_to(ROOT)}: sekoje nėra {len(missing)} modulių: {', '.join(sorted(missing))}")

    print_report(rep, args)
    if rep.errors:
        return 1
    if args.strict and rep.warnings:
        return 1
    return 0


def print_report(rep: Report, args) -> None:
    for e in rep.errors:
        print(f"KLAIDA: {e}")
    if not args.strict:
        for w in rep.warnings:
            print(f"ĮSPĖJIMAS: {w}")
    print(f"\nRezultatas: {len(rep.errors)} klaidų, {len(rep.warnings)} įspėjimų")
    if not rep.errors:
        print("✔ Turinys atitinka standartą.")


if __name__ == "__main__":
    sys.exit(main())
