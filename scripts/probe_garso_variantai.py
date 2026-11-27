#!/usr/bin/env python3
"""Garso variantai: ar dokumentai ir generatorius kalba apie TUOS PAČIUS įrašus.

Kodėl šis failas egzistuoja
---------------------------
Pasiūlymas #52973: `README.md` skelbė „1262 tekstų po du variantus (sakinys ir
skiemuo) — 2524 įrašai“. Tai netiesa dviem prasmėmis:

  1. `scripts/generate_audio.py` generuoja ABI tempus KIEKVIENAM manifeste
     esančiam tekstui (`for text in texts: for variant, rate in rates.items()`),
     įskaitant ištisus sakinius. Manifesto raktas yra pats tekstas, tad `n` ir
     `s` negali būti skirtingi tekstai — jie yra tas pats tekstas dviem tempais.
  2. `assets/js/speech.js` renkasi variantą pagal PRAŠOMĄ tempą
     (`variantFor(rate) = rate <= 0.85 ? "s" : "n"`), o ne pagal teksto tipą.
     Išmatuota: „Lauke ilgai lijo lietus.“ `n` 3,80 s, `s` 4,56 s (santykis
     1,20) — tai lėtesnis to paties sakinio skaitymas, ne skiemenų skaidymas.

Pasekmė ne kosmetinė: mokytojas, perskaitęs README, pagrįstai tikėsis, kad
kiekvienam sakiniui yra skiemenų skaidymo įrašas, ir planuos veiklą, kurios
platforma neturi. Be to, `docs/ARCHITEKTURA.md:134` ir generatoriaus komentarai
kartojo tą pačią formuluotę, tad klaida buvo trys kartai ir viena šaknis.

Ką tikrina (be tinklo, be ffprobe, < 0,2 s):

  P1  trijuose šaltiniuose nėra teiginio, kuris `n` vadina sakiniu, o `s` —
      skiemenimis („sakinys ir skiemuo“, „skiemenys ir atskiri žodžiai“,
      „n = normalus (sakiniai)“);
  P2  manifestas: kiekvienas raktas turi ABI variantus, failai egzistuoja ir
      variantų skaičius = 2 × tekstų — t. y. įrašai priklauso TAM PAČIAM tekstui;
  P3  tempas tikrai skiriasi ir `s` yra lėtesnis (TEMPO["s"] < TEMPO["n"]), o
      `speech.js` renkasi pagal prašomą tempą, ne pagal teksto tipą;
  P4  README sakinys mini abu tempus ir tuos pačius skaičius, kuriuos rodo
      manifestas (LL-21: skaičius perskaičiuojamas, ne perrašomas);
  N1  neigiama kontrolė: senoji README eilutė turi būti pagauta (P1 raudonas) —
      kitaip vartas būtų žalias ir tada, kai defektas grįžta.

Naudojimas:
    python3 scripts/probe_garso_variantai.py      # 0 — dokumentai nemeluoja
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
README = ROOT / "README.md"
ARCH = ROOT / "docs" / "ARCHITEKTURA.md"
GEN = ROOT / "scripts" / "generate_audio.py"
SPEECH = ROOT / "assets" / "js" / "speech.js"
MANIFEST = ROOT / "assets" / "audio" / "lt" / "manifest.json"

# Formuluotės, kurios `n`/`s` vadina skirtingais TEKSTAIS. Kiekviena jų buvo
# repo 2026-11-27; jei grįžta — vartas raudonas.
FALSE_CLAIMS = [
    r"po du variant\w*",
    r"\(sakinys ir skiemuo\)",
    r"sakini\w*, 0,72× tempo\) ir `s` \(skiemen",
    r"skiemen\w* ir atskiri žodžiai, 0,58×",
    r"n = normalus \(sakiniai\)",
    r"n = sakiniai, s = skiemenys",
    r"sakiniai 0\.72, atskiri žodžiai ir skiemenys 0\.58",
]


def false_claims(text: str) -> list[str]:
    """Grąžina rastas neteisingas formuluotes (tuščias sąrašas — švaru)."""
    found: list[str] = []
    for pattern in FALSE_CLAIMS:
        for match in re.finditer(pattern, text, re.I):
            line = text.count("\n", 0, match.start()) + 1
            found.append(f"eil. {line}: „{match.group(0)}“")
    return found


def manifest_facts() -> tuple[int, list[str]]:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    problems: list[str] = []
    for text, entry in data.items():
        if not isinstance(entry, dict):
            problems.append(f"„{text}“: manifeste ne žodynas")
            continue
        for variant in ("n", "s"):
            rel = entry.get(variant)
            if not rel:
                problems.append(f"„{text}“: nėra varianto {variant!r} — tad įrašai nelygūs")
            elif not (MANIFEST.parent / rel).exists():
                problems.append(f"„{text}“ [{variant}]: failo nėra: {rel}")
    return len(data), problems


def check(readme_text: str | None = None) -> list[str]:
    problems: list[str] = []
    readme_text = readme_text if readme_text is not None else README.read_text(encoding="utf-8")

    # P1 — trys šaltiniai, viena formuluotė.
    sources = {
        "README.md": readme_text,
        "docs/ARCHITEKTURA.md": ARCH.read_text(encoding="utf-8"),
        "scripts/generate_audio.py": GEN.read_text(encoding="utf-8"),
    }
    for where, text in sources.items():
        for claim in false_claims(text):
            problems.append(
                f"P1 {where} {claim}: `n` ir `s` vadinami skirtingais tekstais, "
                "o tai tas pats tekstas dviem tempais"
            )

    # P2 — manifestas: įrašai priklauso tam pačiam tekstui (raktas = tekstas).
    texts, manifest_problems = manifest_facts()
    if texts < 100:
        problems.append(f"P2 manifeste tik {texts} tekstų — vartas tikisi viso korpuso")
    problems.extend(f"P2 {p}" for p in manifest_problems[:10])

    # P3 — tempas tikrai skiriasi ir pasirinkimas remiasi prašomu tempu.
    gen_src = sources["scripts/generate_audio.py"]
    tempo = re.search(r"TEMPO\s*=\s*\{\s*\"n\"\s*:\s*([\d.]+)\s*,\s*\"s\"\s*:\s*([\d.]+)", gen_src)
    if not tempo:
        problems.append("P3 nerastas `TEMPO = {\"n\": …, \"s\": …}` generatoriuje")
    elif not float(tempo.group(2)) < float(tempo.group(1)):
        problems.append(
            f"P3 TEMPO[\"s\"]={tempo.group(2)} nėra mažesnis už TEMPO[\"n\"]={tempo.group(1)} — "
            "lėtesnis variantas nebūtų lėtesnis"
        )
    speech = SPEECH.read_text(encoding="utf-8")
    if not re.search(r"variantFor\s*=\s*\(rate\)\s*=>\s*\(rate\s*<=\s*[\d.]+\s*\?\s*\"s\"\s*:\s*\"n\"\)", speech):
        problems.append(
            "P3 `speech.js` neberenkа varianto pagal prašomą tempą "
            "(`variantFor(rate) = rate <= 0.85 ? \"s\" : \"n\"`)"
        )

    # P4 — README mini abu variantus ir skaičių, kurį rodo manifestas (LL-21).
    readme_sentence = next(
        (ln for ln in readme_text.splitlines() if ln.startswith("Lietuviškas garsas")),
        "",
    )
    if not readme_sentence:
        problems.append("P4 README: nerastas garso sakinys")
    else:
        numbers = [int(n) for n in re.findall(r"\b(\d{3,4})\b", readme_sentence)]
        expected = [texts, 2 * texts]
        if not all(n in numbers for n in expected):
            problems.append(
                f"P4 README garso sakinyje nėra {expected[0]} tekstų ir {expected[1]} įrašų "
                f"(rasti skaičiai: {numbers})"
            )
        if not re.search(r"0,?72|įprast\w* temp", readme_sentence, re.I) or not re.search(
            r"0,?58|lėčiau", readme_sentence, re.I
        ):
            problems.append("P4 README garso sakinys neįvardija abiejų tempų (0,72× ir 0,58×)")
        if re.search(r"\bdu variant", readme_sentence, re.I) and not re.search(r"\bne du\b", readme_sentence, re.I):
            problems.append("P4 README garso sakinys vėl vadina tempus „variantais“, nejvardijant, kad tekstas tas pats")

    return problems


def main() -> int:
    problems = check()

    # N1 — neigiama kontrolė: senoji eilutė (2026-11-27) turi būti pagauta.
    old = "Lietuviškas garsas — iš anksto sugeneruoti įrašai, ne naršyklės sintezė: 1262 tekstų po du variantus (sakinys ir skiemuo) — 2524 įrašai, ~92 MB."
    if not false_claims(old):
        problems.append("N1 neigiama kontrolė nepavykusi: senoji formuluotė „po du variantus (sakinys ir skiemuo)“ nebepagaunama")
    old_arch = "- du variantai: `n` (sakiniai, 0,72× tempo) ir `s` (skiemenys ir atskiri žodžiai, 0,58× tempo);"
    if not false_claims(old_arch):
        problems.append("N1 neigiama kontrolė nepavykusi: ARCHITEKTURA formuluotė nebepagaunama")

    if problems:
        print(f"NEPAVYKO ({len(problems)}):")
        for p in problems:
            print("  -", p)
        return 1
    print("✔ Garso variantai: tas pats tekstas dviem tempais visur — README, ARCHITEKTURA ir generatoriuje.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
