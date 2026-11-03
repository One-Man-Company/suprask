#!/usr/bin/env python3
"""
Sukuria 12 klasių wiki struktūrą: research/wiki/grades/NN/{index,temos,metodai}.md

Kiekviena klasė turi savo amžių, programos koncentrą, kognityvinį fokusą ir
leidžiamus sąveikos tipus. Tai karkasas — turinys pildomas pagal
docs/SVIETIMAS-1-GAIRES.md ir research/wiki/curriculum/.

Naudojimas:
    python3 scripts/scaffold_grades.py           # sukurti trūkstamus
    python3 scripts/scaffold_grades.py --force   # perrašyti viską
"""

from __future__ import annotations

import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WIKI = ROOT / "research" / "wiki" / "grades"

GRADES = [
    {
        "n": 1, "age": "6–7", "band": "1–2 klasių koncentras",
        "focus": "Pirmas susidūrimas su raide, skaičiumi ir pasauliu. Viskas pradedama nuo konkretaus daikto, garso ir veiksmo.",
        "subjects": "lietuvių kalba ir literatūra, matematika, pasaulio pažinimas (visuomeninis ugdymas + gamtos mokslai), dailė, muzika, technologijos, fizinis ugdymas, gyvenimo įgūdžiai, informatika (integruotai)",
        "sims": "tiesioginis manipuliavimas (bakstelėjimas, tempimas), garsas + vaizdas, vienas kintamasis, jokių laikmačių",
        "avoid": "ilgo teksto, kelių kintamųjų iš karto, abstrakčių simbolių be vaizdo, bet kokio vertinimo balais",
    },
    {
        "n": 2, "age": "7–8", "band": "1–2 klasių koncentras",
        "focus": "Skaitymo technikos įtvirtinimas ir savarankiškas skaičiavimas. Sąvokos plečiamos, bet dar remiasi konkrečiu modeliu.",
        "subjects": "tie patys dalykai, didėja teksto ir savarankiškumo dalis",
        "sims": "to paties tipo modeliai su daugiau variantų; pirmieji dviejų žingsnių uždaviniai",
        "avoid": "staigaus abstrakcijos šuolio; greičio kaip motyvacijos",
    },
    {
        "n": 3, "age": "8–9", "band": "3–4 klasių koncentras",
        "focus": "Nuo „ką matau“ prie „kokia taisyklė“. Pradedama matuoti, lyginti, daryti išvadas.",
        "subjects": "atsiranda ryškesnis dalykų atskyrimas; daugyba ir dalyba, teksto analizė, gamtos stebėjimai",
        "sims": "taisyklės atradimas, matavimas, kelių bandymų palyginimas",
        "avoid": "vienos teisingos procedūros demonstravimo; per ilgų instrukcijų",
    },
    {
        "n": 4, "age": "9–10", "band": "3–4 klasių koncentras",
        "focus": "Savarankiškas darbas su tekstu ir duomenimis. Pirmos trupmenos, pirmos diagramos.",
        "subjects": "kalba ir literatūra, matematika, gamta, visuomenė, menai, technologijos",
        "sims": "duomenų rinkimas ir vaizdavimas, trupmenų modeliai, kelių kintamųjų palyginimas",
        "avoid": "spėlionių vietoj duomenų; neaiškaus mastelio",
    },
    {
        "n": 5, "age": "10–11", "band": "5–6 klasių koncentras",
        "focus": "Dalykai atsiskiria. Atsiranda abstraktesnės sąvokos ir sisteminis požiūris.",
        "subjects": "lietuvių kalba, matematika, gamta ir žmogus, istorija, geografija, užsienio kalba, menai, technologijos, informatika",
        "sims": "parametrų keitimas, dviejų kintamųjų sąveika, modelio ribų klausimas",
        "avoid": "vieno teisingo atsakymo iliuzijos sudėtingose temose",
    },
    {
        "n": 6, "age": "11–12", "band": "5–6 klasių koncentras",
        "focus": "Modeliai su keliais kintamaisiais. Mokinys mokosi kelti hipotezę ir ją tikrinti.",
        "subjects": "tie patys, didėja gamtos mokslų ir matematikos abstrakcija",
        "sims": "hipotezė → bandymas → išvada; grafikų skaitymas",
        "avoid": "animacijų, kurios pakeičia mokinio sprendimą",
    },
    {
        "n": 7, "age": "12–13", "band": "7–8 klasių koncentras",
        "focus": "Algebros, fizikos ir chemijos pradmenys. Sąvoka tampa įrankiu, ne objektu.",
        "subjects": "matematika, fizika, chemija, biologija, istorija, geografija, kalbos",
        "sims": "formalaus modelio vizualizacija, klaidų šaltinių analizė",
        "avoid": "formulės be prasmės; gražaus, bet neteisingo modelio",
    },
    {
        "n": 8, "age": "13–14", "band": "7–8 klasių koncentras",
        "focus": "Sisteminis mąstymas ir argumentacija. Mokinys gali vertinti modelio prielaidas.",
        "subjects": "tie patys, daugiau tarpdalykinių ryšių",
        "sims": "scenarijų palyginimas, jautrumo analizė, priešingų argumentų svėrimas",
        "avoid": "vienpusiško pateikimo; duomenų be šaltinio",
    },
    {
        "n": 9, "age": "14–15", "band": "9–10 klasių koncentras",
        "focus": "Funkcijos, statistika, pilietinis mąstymas. Mokomasi vertinti šaltinį ir įrodymą.",
        "subjects": "matematika, gamtos mokslai, istorija, geografija, kalbos, socialiniai mokslai",
        "sims": "duomenų analizė, statistinių teiginių patikra, modelių palyginimas",
        "avoid": "koreliacijos pateikimo kaip priežastingumo",
    },
    {
        "n": 10, "age": "15–16", "band": "9–10 klasių koncentras",
        "focus": "Taikymas naujose situacijose. Pasirengimas brandos egzaminams ir savarankiškiems projektams.",
        "subjects": "brandos programos dalykai",
        "sims": "sudėtingų sistemų modeliai, eksperimentų planavimas",
        "avoid": "egzamino treniruoklio be supratimo",
    },
    {
        "n": 11, "age": "16–17", "band": "11–12 klasių koncentras",
        "focus": "Kritinis vertinimas ir savarankiškas tyrimas. Mokymasis tampa specializuotas.",
        "subjects": "pasirenkami kursai, brandos egzaminai",
        "sims": "modelių ribų tyrimas, argumentuota diskusija, tyrimo dizainas",
        "avoid": "supaprastinimų, kurie klaidina apie mokslo neapibrėžtumą",
    },
    {
        "n": 12, "age": "17–18", "band": "11–12 klasių koncentras",
        "focus": "Savarankiškas projektas ir pasirengimas aukštajam mokslui ar darbui.",
        "subjects": "brandos kursai, projektinis darbas",
        "sims": "sistemų modeliavimas, sprendimų padarinių vertinimas, duomenų etika",
        "avoid": "turiniu, kuris dubliuoja vadovėlį be interaktyvios vertės",
    },
]

INDEX = """---
title: "{n} klasė"
tipas: klase
klase: {n}
amzius: "{age}"
koncentras: "{band}"
atnaujinta: 2026-11-03
---

# {n} klasė ({age} metai)

> {focus}

## Programa

- **Koncentras:** {band}
- **Dalykai:** {subjects}

## Ką platforma gali duoti šiai klasei

- **Tinkami sąveikos tipai:** {sims}
- **Viena didelė idėja modulyje**, 8–12 min., aiškūs 1–3 rezultatai.
- **Konkretu prieš abstraktu:** modelis parodo, tekstas paaiškina.

## Ko nedaryti

- {avoid}
- Nesiekti „aprėpti visos programos“ — platforma nėra vadovėlis.

## Modulių struktūra

| Kryptis | Moduliai | Būsena |
|---|---|---|
| _(pildoma pagal `content/lt/grade-{nn}/index.json`)_ | | |

## Statusas

{status}

## Susieti

- [[../../curriculum/README|Programos išgryninimas]]
- [[../README|Klasių sąrašas]]
- [[metodai|Šios klasės metodai]]
- [[temos|Temų eilė]]
"""

TEMOS = """---
title: "{n} klasės temos"
tipas: temu-eile
klase: {n}
atnaujinta: 2026-11-03
---

# {n} klasės temų eilė

Kandidatinės temos. **Kiekviena turi būti patikrinta** pagal oficialią programą (`research/wiki/curriculum/`) ir gaires (5 klausimai) prieš kuriant modulį.

## Prioritetas A — branduolys

- [ ] _(tema)_ — rezultatas: _(ką mokinys gebės)_ — simuliacijos idėja: _(kas keičiama)_

## Prioritetas B — gilinimas

- [ ] _(tema)_ — rezultatas: _(...)_ — simuliacijos idėja: _(...)_

## Prioritetas C — kontekstas

- [ ] _(tema, kuri jungia kelis dalykus)_

## Atmesta (su priežastimi)

- _(tema)_ — atmesta, nes _(nėra interaktyvumo naudos / dubliuoja / neatitinka amžiaus)_

## Taisyklės

1. Tema be aiškios klaidingos nuostatos nepatenka į A prioritetą.
2. Tema, kurią geriau paaiškina vienas paveikslėlis nei modelis, neplatforminė.
3. Temos numeris modulyje atsiranda tik tada, kai ji praeina validatoriu.
"""

METODAI = """---
title: "{n} klasės metodai"
tipas: metodai
klase: {n}
amzius: "{age}"
atnaujinta: 2026-11-03
---

# {n} klasės metodai

## Kognityvinis profilis

{focus}

## Ką tai reiškia dizainui

- **Simuliacijos tipas:** {sims}
- **Tekstas ekrane:** pagal amžiaus lentelę `docs/SVIETIMAS-1-GAIRES.md` (5 skyrius).
- **Grįžtamasis ryšys:** trumpas, apie veiksmą, be palyginimo su kitais.
- **Vertinimas:** savikontrolė ir refleksija; jokių pažymių.

## Ko vengti

- {avoid}

## Atviros prielaidos

- _(kas šioje klasėje dar nepatikrinta; žr. [[../../guidelines/klausimai|klausimus]])_

## Šaltiniai

- Oficiali programa: `research/wiki/curriculum/`
- Metodų bazė: `research/wiki/foundations/`
"""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    WIKI.mkdir(parents=True, exist_ok=True)
    created = 0
    for g in GRADES:
        d = WIKI / f"{g['n']:02d}"
        d.mkdir(exist_ok=True)
        status = (
            "**Live.** 13 modulių, 4 kryptys. Žr. `content/lt/grade-01/`."
            if g["n"] == 1
            else "**Rengiama.** Struktūra ir tyrimai ruošiami; modulių dar nėra."
        )
        files = {
            "index.md": INDEX.format(nn=f"{g['n']:02d}", status=status, **g),
            "temos.md": TEMOS.format(**g),
            "metodai.md": METODAI.format(**g),
        }
        for name, content in files.items():
            path = d / name
            if path.exists() and not args.force:
                continue
            path.write_text(content, encoding="utf-8")
            created += 1
    print(f"Sukurta failų: {created}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
