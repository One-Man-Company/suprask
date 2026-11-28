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

# Programos pozicijos kodas (`26.1.1`). Skiria programos poziciją nuo temos,
# kuri turi tik vardą (`C:saugus-elgesys`).
_CODE_RE = re.compile(r"^\d+\.\d+\.\d+$")

# Būsenų eilė: kuo didesnis, tuo daugiau įrodymo. Sujungiant dvi tos pačios
# pozicijos eilutes imama DIDŽIAUSIA reikšmė, nes modulis repo yra faktas, o
# wiki eilutė „nėra“ — tik teiginys, kuris gali būti pasenęs.
_STATUS_ORDER = {"missing": 0, "partial": 1, "covered": 2}

# Teiginys, kad medžiagos NĖRA. Tik toks tekstas gali būti pasenęs, kai modulis
# repo jau yra; temos pavadinimas („Saugus elgesys“) niekada nelaikomas
# pasenusiu teiginiu (LL-199, T13).
_ABSENCE_RE = re.compile(r"\bn[ėe]ra\b|\btrūksta\b|\bneturi\b", re.I)


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
    """Prideda būseną: covered / partial / missing ir esamus modulius.

    Lyginama ir su modulio TEKSTU, ir su jo ID (failo vardu). Be ID dalies
    modulis su kūrybiniu pavadinimu atrodydavo nepadengtas: 53-asis modulis
    `30-dienos-rezimas-mityba` vadinasi „Vėliau keltis — trumpesni pusryčiai",
    o jo outcome'ai kalba apie kėlimąsi ir pusryčius — žodžių „dienos",
    „režimas", „mityba" ten nėra, nors modulis būtent ta tema. `scope.coverage`
    ID sutapimą skaičiuoja atskirai ir vertina jį daugiau, todėl darome taip pat.
    """
    modules = _module_blobs(grade)
    numbers: dict[str, int] = {}
    for r in rows:
        words = [w for w in scope._norm(r["topic"]).split() if len(w) >= 4] or scope._norm(r["topic"]).split()
        scored = []
        for mid, blob in modules:
            hit = _matches(r["topic"], blob)
            id_hit = _matches(r["topic"], scope._norm(mid))
            total = hit + id_hit
            if total:
                scored.append((id_hit, total, mid))
        # ID sutapimas vertesnis už atsitiktinį žodį outcomes tekste.
        scored.sort(key=lambda x: (-x[0], -x[1], x[2]))
        need = max(1, -(-len(words) * 6 // 10))  # 60 %
        strong = [mid for _idh, m, mid in scored if m >= need]
        weak = [mid for _idh, m, mid in scored if m < need]
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


def _merge(dst: dict, src: dict) -> None:
    """Sujungia DVI tos pačios programos pozicijos eilutes.

    Būsena imama **geriausia**, o moduliai — TOS eilutės, kuri tą būseną
    įrodė. Anksčiau čia buvo imama blogesnė būsena ir kartu jos modulių
    sąrašas, todėl padengties įrodymas buvo numetamas: 26.1.1 „traumų
    prevencija“ iš spragų lentelės turėjo `covered` [`25-traumu-prevencija`,
    `38-traumu-prevencija`], o 26.1.1 „Saugus elgesys“ iš žemėlapio —
    `partial` [`08-metu-laikai`, `19-dumai-ir-isejimas`]; po sujungimo
    likdavo `partial` BE įrodžiusių modulių, o `target` nukreipdavo į dar
    vieną (trečią) traumų modulį. Kiekvienas agento promptas tą klaidingą
    darbo užsakymą gaudavo kasdien (LL-199).

    Moduliai imami tik iš laimėjusios eilutės. Silpnesnės eilutės sąrašas
    yra raktažodžių triukšmas (26.1.2 „Sveikas gyvenimas“ atsinešė
    `04-kaip-zmones-sveikinasi`), o įrodymas turi būti įrodymas, ne sąrašo
    ilgis (LL-37). Kai būsenos LYGIOS, lieka pirmosios eilutės sąrašas —
    `_gaps()` eina pirma, tad tai ta eilutė, kuri cituoja programos kodą ir
    spragos pastabą; antroji tik pakartoja tą pačią poziciją kitu vardu.

    Prieštaravimas neužmaskuojamas: jis įrašomas į `stale_claim`, kad
    programos derintojas matytų, kurią wiki eilutę reikia atnaujinti.

    Iškelta iš `build()` į modulio lygį, kad zondas
    (`scripts/probe_backlog_merge.py`) tikrintų TĄ PAČIĄ funkciją, o ne jos
    kopiją — kopija žaliuotų savaime ir neįrodytų nieko (LL-36).
    """
    dst_rank, src_rank = _STATUS_ORDER[dst["status"]], _STATUS_ORDER[src["status"]]

    def _claim(weaker: dict, stronger_modules: list[str]) -> str:
        return (f"{weaker.get('source', '')}: „{weaker.get('topic', '')}“ "
                f"šią poziciją rodo kaip `{weaker['status']}`, o moduliai "
                f"{', '.join(stronger_modules)} ją moko")

    def _asserts_absence(r: dict) -> bool:
        """Ar eilutė tvirtina, kad medžiagos NĖRA (tik tokia gali būti pasenusi)?

        Programos lentelės eilutė (`| 26.1.1 | Saugus elgesys | 3 | …`) yra
        oficialus temos PAVADINIMAS, ne teiginys apie platformos būklę. Jos
        būsena `partial` reiškia, kad žodžių sutapimas silpnas, o ne kad
        kažkas pasenę — todėl tokios eilutės negalima vadinti „pasenusiu
        teiginiu“ ir siųsti žmogaus taisyti (kitaip vartai siūlytų taisyti
        teisingą eilutę, t. y. LL-21 atvirkščia kryptimi).
        """
        return (r.get("section") == "Ko platformoje nėra"
                or bool(r.get("gap")))

    # Prieštaravimas registruojamas NEPRIKLAUSOMAI nuo to, kuri eilutė eina
    # pirma: sujungimas turi duoti tą patį rezultatą abiem kryptimis (LL-19
    # šeima — taisymas, kurio rezultatas priklauso nuo grupės eilės).
    if src_rank > dst_rank:
        if dst.get("modules") and _asserts_absence(dst):
            dst["stale_claim"] = _claim(dst, list(src.get("modules") or []))
        dst["status"], dst["modules"] = src["status"], list(src.get("modules") or [])
    elif src_rank == dst_rank:
        if not dst.get("modules"):
            dst["modules"] = list(src.get("modules") or [])
    else:  # src_rank < dst_rank
        # silpnesnė eilutė: įrodymo nekeičia, bet pasenęs teiginys lieka matomas
        if _asserts_absence(src):
            dst["stale_claim"] = _claim(src, list(dst.get("modules") or []))
    if src.get("section") == "Ko platformoje nėra" and src.get("outcome"):
        extra = src["outcome"]
        if extra and extra not in (dst.get("gap") or ""):
            dst["gap"] = ((dst.get("gap", "") + " " + extra).strip()
                          if dst.get("gap") else extra)
    # Užpildyta pozicija negali nešti „ko trūksta“ pastabos: jei moduliai
    # ją moko, ta pastaba yra pasenęs wiki teiginys, o ne darbo užsakymas.
    # Ji prijungiama prie `stale_claim` (o ne užrašoma vietoj jo), kad liktų
    # matoma ir būtų taisoma šaltinyje, o ne skaitoma kaip dar neatliktas
    # darbas (LL-37).
    if dst["status"] == "covered" and dst.get("gap"):
        gap = dst.pop("gap")
        have = dst.get("stale_claim") or ""
        dst["stale_claim"] = f"{have} (šaltinis rašo: „{gap}“)".strip() if have else gap
    for field in ("strand", "sritis", "outcome", "source", "level",
                  "interactivity", "hours"):
        if not dst.get(field) and src.get(field):
            dst[field] = src[field]


def _same_position(dst: dict, src: dict) -> bool:
    """Ar dvi eilutės žymi TĄ PAČIĄ programos poziciją?

    SKIRTINGI programos kodai yra skirtingos pozicijos, net jei temų
    pavadinimai sutampa: sujungus juos dingtų viena pozicija iš eilės
    („47 pozicijos“ taptų 46) ir niekas to nepastebėtų.
    """
    a, b = dst.get("key", ""), src.get("key", "")
    return not (_CODE_RE.match(a) and _CODE_RE.match(b) and a != b)


def clear_stale_absence(rows: list[dict]) -> int:
    """Pašalina „nėra“ teiginį iš pozicijų, kurias moduliai jau moko.

    Grąžina pataisytų eilučių skaičių. Ištraukta iš `build()`, kad zondas
    galėtų patikrinti TĄ PAČIĄ funkciją su sukurta eilute: realiame repo
    šiandien tokių eilučių nebėra (šaltinis sutvarkytas), todėl be šito
    apsauga atrodytų kaip nieko neveikianti.

    Tai ne vien 26.1.1 atvejis: 26.2.3, 26.3.1, 26.2.1 ir 26.5.1 taip pat
    turėjo modulį repo, o jų `outcome` (iš spragų lentelės) vis dar sakė
    „modulio nėra“. Agentas tą eilutę skaito kaip užduotį, tad teiginys
    keliamas į `stale_claim`, o `outcome` lieka tuščias, o ne klaidinantis.
    Taisyklė taikoma VISOMS eilutėms, ne tam vienai, ant kurios pastebėta
    (LL-40: taisyk priežastį, ne ruožą).
    """
    fixed = 0
    for r in rows:
        if r.get("status") != "covered":
            continue
        outcome = (r.get("outcome") or "").strip()
        if _ABSENCE_RE.search(outcome):
            r.setdefault("stale_claim", f"„{r['topic']}“: šaltinis teigia „{outcome[:120]}“")
            r["outcome"] = ""
            fixed += 1
    return fixed


def build(grade: int = GRADE) -> dict:
    rows = _gaps() + _code_rows() + _map_rows()  # eilės tvarka = vyresnumas
    for r in rows:
        if not r.get("strand"):  # spragų įrašas jau žino savo failą
            r["strand"] = _strand_for(r)
    rows = enrich(rows, grade)

    # 1 praėjimas — pagal temos vardą („Saugus elgesys" iš žemėlapio ir iš
    # spragų lentelės yra viena pozicija, net jei viena turi kodą, o kita ne).
    # Du SKIRTINGI kodai lieka dviem pozicijomis: temos vardas sutampa
    # atsitiktinai, o sujungus eilė netektų vieno programos punkto.
    by_name: dict[str, dict] = {}
    for r in rows:
        key = _slug(re.sub(r"^\d+\.\d+\.\d+\s*", "", r["topic"]))
        have = by_name.get(key)
        if have is None:
            by_name[key] = r
            continue
        if not _same_position(have, r):
            by_name[f"{key}#{r['key']}"] = r
            continue
        _merge(have, r)

    # 2 praėjimas — pagal kodą: numeruota pozicija nugali be kodo, o jei dvi
    # eilutės turi tą patį kodą (26.1.1 „Saugus elgesys" / „traumų
    # prevencija"), tai TA PATI programos pozicija — imame GERIAUSIĄ būseną su
    # visais įrodytais moduliais ir vieną `target`, kad agentas negautų dviejų
    # failų tam pačiam darbui. Blogesnė būsena čia nėra „saugesnė": ji siųsdavo
    # kurti trečią modulį temai, kurią jau moko du (LL-199).
    by_code: dict[str, dict] = {}
    rest: list[dict] = []
    for r in by_name.values():
        if _CODE_RE.match(r["key"]):
            have = by_code.get(r["key"])
            if have is not None:
                _merge(have, r)
                continue
            by_code[r["key"]] = r
        else:
            rest.append(r)
    rows = list(by_code.values()) + rest
    # Po sujungimo: nė viena `covered` pozicija negali nešti „nėra“ teksto
    # (žr. `clear_stale_absence()` — taisyklė taikoma visoms eilutėms).
    clear_stale_absence(rows)
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
    sources = _source_files()
    return {
        "grade": grade,
        "generated": dt.datetime.now().isoformat(timespec="seconds"),
        "source_hash": _source_hash(sources),
        # Kiekvieno šaltinio pirštų atspaudas atskirai: be jo vartai žino TIK,
        # kad kažkas pasikeitė, o ne kurį failą reikia pergeneruoti (#42779).
        "source_files": sources,
        "curriculum_positions": len(rows),
        "counts": counts,
        "modules_now": len(_module_blobs(grade)),
        "rows": rows,
    }


def _source_files() -> dict[str, str]:
    """Kiekvieno šaltinio failo pirštų atspaudas atskirai.

    `_source_hash()` pasako TIK tai, kad kažkas pasikeitė, bet ne KAS — todėl
    raudoni vartai „backlog.json pasenęs“ neįvardija failo, kurį reikia
    pergeneruoti, ir trys paleidimai iš eilės pranešė tą patį neuždaromą
    įspėjimą (#42779). Vartai, kurių negalima uždaryti teisingu veiksmu, moko
    juos apeiti (LL-159/LL-160).
    """
    out: dict[str, str] = {}
    for p in sorted(CURRICULUM.glob("*.md")):
        if p.name == OUT_MD.name:  # savo paties išvestis
            continue
        out[p.name] = hashlib.sha256(p.read_bytes()).hexdigest()[:16]
    return out


def _source_hash(files: dict[str, str] | None = None) -> str:
    """Pirštų atspaudas TIK tų failų, iš kurių generuojama (ne backlog.md!)."""
    if files is None:
        files = _source_files()
    h = hashlib.sha256()
    for name, digest in sorted(files.items()):
        h.update(name.encode())
        h.update(digest.encode())
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
    stale = [r for r in data["rows"] if r.get("stale_claim")]
    if stale:
        lines += ["", "## Pasenę wiki teiginiai (taisyti šaltinyje, ne kurti modulį)", "",
                  "Padengtis imama iš modulių, o ne iš wiki sakinio: jei modulis poziciją",
                  "moko, o `curriculum/*.md` vis dar rašo „nėra“, teisingas sprendimas yra",
                  "pataisyti tą eilutę, o ne statyti antrą modulį tai pačiai temai.", ""]
        for r in sorted(stale, key=lambda r: r["key"]):
            lines.append(f"- **{r['key']} {r['topic']}** — {r['stale_claim']}")
    lines += ["", "## Kaip tai naudoti", "",
              "1. Imk `missing` eilutę, kurios `target` tuščias arba kurios srauto repo dar neturi —",
              "   tai struktūrinė spraga, kurią reikia užrašyti `research/wiki/guidelines/klausimai.md`,",
              "   o ne kurti modulį netinkamoje vietoje.",
              "2. Vienas modulis dengia VIENĄ poziciją; ta pati pozicija gali turėti kelis modulius",
              "   skirtingiems aspektams — tai leidžiama, bet `covered` dar nereiškia „išnagrinėta“.",
              ""]
    return "\n".join(lines)


def changed_sources(old: dict, now: dict) -> list[str]:
    """Kurie šaltinio failai pasikeitė tarp dviejų generavimų.

    Ištraukta iš `main() --check`, kad zondas tikrintų TĄ PAČIĄ funkciją, kuri
    sudaro pranešimą. #42779: vartai sakydavo tik „pasenęs“, tad trys
    paleidimai iš eilės kartojo neuždaromą įspėjimą ir niekas nežinojo, kurį
    `curriculum/*.md` failą pergeneruoti (LL-159/LL-160).
    """
    old = old or {}
    now = now or {}
    return sorted(n for n in set(old) | set(now) if old.get(n) != now.get(n))


def row_identity(row: dict) -> tuple[str, str, str]:
    """Stabili eilutės tapatybė tarp dviejų generavimų.

    `key` vienas nėra unikalus: žemėlapio eilutė gali turėti kodą, o spragų
    lentelės tos pačios temos eilutė — ne. Todėl imama (sekcija, kodas, tema).
    """
    return (row.get("section") or "", row.get("key") or "", row.get("topic") or "")


def derived_drift(old: dict, now: dict) -> list[str]:
    """Laukai, kurie skaičiuojami iš `content/`, o ne iš `curriculum/*.md`.

    Kodėl tai būtina: `--check` iki šiol lygino TIK `source_hash`, o tas maišas
    imamas iš `research/wiki/curriculum/*.md`. Todėl `modules_now`, `counts` ir
    `rows[].status/modules` galėjo atsilikti kiek nori — o `modules_now` yra
    vienintelis šio failo kiekis, kurį `agents/run.py` `_backlog_brief()` įdeda
    į kiekvieno agento promptą. Agentas gaudavo du skirtingus to paties kiekio
    skaičius (paleidimo antraštė 87, backlog 84) ir negalėjo žinoti, kuris
    teisingas (LL-21, LL-37). Vartai, kurių vienintelė paskirtis „eilė
    suderinta“, negali tylėti apie išvestinį lauką, kuris nesuderintas.

    Grąžina žmogiškus pranešimus; tuščias sąrašas — laukai sutampa.
    """
    out: list[str] = []
    for field in ("modules_now", "curriculum_positions"):
        if old.get(field) != now.get(field):
            out.append(f"{field}: faile {old.get(field)!r}, dabar {now.get(field)!r}")
    if old.get("counts") != now.get("counts"):
        out.append(f"counts: faile {old.get('counts')!r}, dabar {now.get('counts')!r}")

    was = {row_identity(r): r for r in (old.get("rows") or [])}
    now_rows = {row_identity(r): r for r in (now.get("rows") or [])}
    for ident in sorted(set(was) | set(now_rows)):
        a, b = was.get(ident), now_rows.get(ident)
        if a is None:
            out.append(f"eilutė atsirado: {ident[1] or '—'} {ident[2]}")
        elif b is None:
            out.append(f"eilutė išnyko: {ident[1] or '—'} {ident[2]}")
        else:
            for field in ("status", "modules", "target"):
                if a.get(field) != b.get(field):
                    out.append(f"{ident[1] or '—'} {ident[2]} · {field}: "
                               f"faile {a.get(field)!r}, dabar {b.get(field)!r}")
    return out


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
        drift = derived_drift(old, data)
        if drift:
            print("KLAIDA: backlog.json išvestiniai laukai atsiliko nuo content/ —")
            for line in drift[:12]:
                print(f"       · {line}")
            if len(drift) > 12:
                print(f"       · … ir dar {len(drift) - 12}")
            print("       Spręsk: python3 scripts/curriculum_backlog.py")
            return 1
        if old.get("source_hash") != data["source_hash"]:
            # Įvardyk KURIS failas pasikeitė: be to raudoni vartai praneša tik
            # „pasenęs“ ir trys paleidimai iš eilės kartoja tą patį neuždaromą
            # įspėjimą (#42779). LL-159/LL-160: vartai, kurių negalima uždaryti
            # teisingu veiksmu, moko juos apeiti.
            was = old.get("source_files") or {}
            now = data["source_files"]
            changed = changed_sources(was, now)
            print("KLAIDA: backlog.json pasenęs — pasikeitė: " + ", ".join(changed or ["nežinoma"]))
            if not changed:
                print("       (backlog.json neturi `source_files` — pergeneruok jį vieną kartą)")
            print("       Spręsk: python3 scripts/curriculum_backlog.py")
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
