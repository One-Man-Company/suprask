# publikavimo-agentas — 2026-11-20T1602

- paleidimas: #411 (manual)
- trukmė: 316s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub404/neg_ctl.py
│ @@ -0,0 +1,67 @@
│ +#!/usr/bin/env python3
│ +"""Neigiama kontrolė po #404/#411 pataisymo.
│ +
│ +Tikslas: įrodyti, kad nauji vartai nekuria klaidingo raudono. Grąžiname
│ +veidrodį į sveiką būseną (našlaitis pašalintas, grades.json 51) ir tikimės,
│ +kad ir `check_registry.py`, ir `check_published.py` vėl duos rc 0.
│ +
│ +Šis scenarijus svarbus todėl, kad pataisa, kuri visada raudona, yra tokia pat
│ +nenaudinga kaip pataisa, kuri visada žalia (LL-10).
│ +"""
│ +from __future__ import annotations
│ +
│ +import json
│ +import pathlib
│ +import shutil
│ +import subprocess
│ +import sys
│ +
│ +import probe_orphan as P
│ +
│ +
│ +def main() -> int:
│ +    # 1. našlaitį iškeliam (neištrinam — įrodymui reikia failo turinio)
│ +    orphan = P.REPO / P.ORPHAN_REL
│ +    parked = P.REPO / "52-tikrinimo-modulis.json.parked"
│ +    if orphan.exists():
│ +        shutil.move(str(orphan), str(parked))
│ +    # 2. grades.json skelbiamas skaičius atgal 51
│ +    path = P.REPO / "content/lt/grades.json"
│ +    data = json.loads(path.read_text(encoding="utf-8"))
│ +    for g in data["grades"]:
│ +        if int(g["grade"]) == 1 and "modules" in g:
│ +            g["modules"] = 51
│ +    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
│ +
│ +    site = P.build_site()
│ +    httpd, live = P.serve(site)
│ +    try:
│ +        print(f"--- negatyvi kontrolė: veidrodis {live}")
│ +        print(f"    failų content/lt/grade-01: {len(list((P.REPO / 'content/lt/grade-01').glob('*/*.json')))}")
│ +        print(f"    grades.json skelbia: "
│ +              f"{[g.get('modules') for g in json.loads((P.REPO / 'content/lt/grades.json').read_text(encoding='utf-8'))['grades'] if int(g['grade']) == 1]}")
│ +
│ +        rc, out = P.run([sys.executable, "scripts/check_registry.py", "--grade", "1"], live)
│ +        print(f"\n[check_registry.py --grade 1] rc={rc}")
│ +        for line in out.splitlines():
│ +            print("   " + line)
│ +
│ +        rc, out = P.run([sys.executable, "scripts/check_published.py"], live)
│ +        print(f"\n[check_published.py] rc={rc}")
│ +        for line in out.splitlines():
│ +            print("   " + line)
│ +
│ +        rc, out = P.run([sys.executable, "scripts/check_published.py", "--json"], live)
│ +        try:
│ +            d = json.loads(out[out.index("{"):out.rindex("}") + 1])
│ +            print(f"   verdict: {d['verdict']}")
│ +            print(f"   orphan_files: {d.get('orphan_files', 'NERA LAUKO')}")
│ +        except (ValueError, KeyError) as exc:
│ +            print(f"   (json neperskaitytas: {exc})")
│ +        return 0
│ +    finally:
│ +        httpd.shutdown()
│ +
│ +
│ +if __name__ == "__main__":
│ +    raise SystemExit(main())
│ research/wiki/changelog.md
│ @@ -1,6 +1,17 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-20 — Publikavimo patikra #411: repo 51 / paskelbta 51 prie `dd31fbbe`, garsas 1 486/1 486, kodas 19 failų; našlaitis failas pagaliau raudonas abiejuose vartuose
│ +
│ +- **Būsena:** `check_published.py` (numatytasis režimas) rc 0 — „Repozitorija: 51 moduliai / Paskelbta: 51 moduliai“ (`grade-01: repo 51, gyvai 51`); `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `orphan_files` 0, `vanished_ids` 1 (`03-sakinio-tvarka → 03-sakinio-zodzi` aliasas priimtas, `resolved: true`); garsas 1 486/1 486, svetainės kodas 19 failų, gyva versija = `HEAD` = `dd31fbbe`, neišstumtų commit'ų 0. Darbinė kopija prieš darbą švari.
│ +- **3 gyvi adresai (HTTP kodai):** `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → **200**, 3 636 B; `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` → **200**, 5 313 B; `content/lt/grade-01/pasaulio-pazinimas/08-metu-laikai.json` → **200**, 4 411 B. Neigiama kontrolė: `content/lt/grade-01/matematika/99-nera.json` → **404**, tad 200 kažką reiškia.
│ +- **#404 likutis įrodytas paleidimu, ne skaitymu.** Numatytasis bėgimas VARTUOSE dar nebuvo paleistas: `scratch/pub404/probe_orphan.py after` (veidrodis su 52 failais, indekse 51 įrašas, `grades.json` 52) → `validate_content.py --grade 1 --strict` **rc 0** (skaičius sutampa su failų skaičiumi — šis įrankis šios klasės defekto nemato ir neturi matyti), `check_registry.py --grade 1` **rc 1** „NAŠLAITIS: 52-tikrinimo-modulis.json yra, bet index.json įrašo nėra“, `check_published.py` **rc 1**, blokas „FAILAS BE INDEKSO ĮRAŠO — svetainėje jis yra, bet vaikas jo nepasieks (1)“, `orphan_files` laukas su `{grade:1, id:'52-tikrinimo-modulis', file:'grade-01/matematika/52-tikrinimo-modulis.json'}`, `verdict.label` = „1 modulio failo be indekso įrašo“.
│ +- **Neigiama kontrolė (`scratch/pub404/neg_ctl.py`):** našlaitis iškeltas, `grades.json` grąžintas 51 → `check_registry.py` **rc 0** („failai 51 · našlaičiai 0 · PROBLEMŲ: 0“), `check_published.py` **rc 0**, `verdict` = `sutampa`, `orphan_files` = `[]`. Taigi pataisa nekuria klaidingo raudono (LL-10): abi pusės raudonos būtent tada, kai failas yra be indekso įrašo.
│ +- **Kas liko neuždaryta:** CI (`.github/workflows/validate.yml`) `check_registry.py` nepaleidžia nė karto (patikrinta `grep -n "check_registry" .github/workflows/*.yml` → 0 eilučių), todėl PR su našlaičiu praeitų žalias, o publikuotų jį `pages.yml` (kopijuoja visą `content/`). Workflow failo šis vaidmuo savavališkai neliečia — įrašytas pasiūlymas `agents/proposals/2026-11-20-publikavimo-agentas-ci-registry.json`.
│ +- **Pamoka:** LL-128 `research/wiki/guidelines/pamokos.md` — „Defektas, kurį įrankis išspausdina, bet neįskaičiuoja“ (matoma eilutė be rc pasekmės).
│ +- **Kas neliesta:** joks modulio ID nepernumeruotas, nieko nešalinta; `content/**`, `assets/**`, `docs/**`, `AGENTS.md` neliesti; jokio `git push` iš agento.
│ +- **Sprendimas:** **sutampa** (repo 51 / paskelbta 51) ir **ištaisyta** (`scripts/check_published.py`, `scripts/check_registry.py` — įrodyta zondais į abi puses).
│
│  ## 2026-11-19 — Publikavimo patikra #388: repo 48 / paskelbta 48 prie `371b5815`, garsas 1 432/1 432, kodas 19 failų; klasės indekso 404 atskirtas nuo „svetainė nepasiekiama“
│
│ research/wiki/changelog.md
│ @@ -4,7 +4,7 @@
│
│  ## 2026-11-20 — Publikavimo patikra #411: repo 51 / paskelbta 51 prie `dd31fbbe`, garsas 1 486/1 486, kodas 19 failų; našlaitis failas pagaliau raudonas abiejuose vartuose
│
│ -- **Būsena:** `check_published.py` (numatytasis režimas) rc 0 — „Repozitorija: 51 moduliai / Paskelbta: 51 moduliai“ (`grade-01: repo 51, gyvai 51`); `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `orphan_files` 0, `vanished_ids` 1 (`03-sakinio-tvarka → 03-sakinio-zodzi` aliasas priimtas, `resolved: true`); garsas 1 486/1 486, svetainės kodas 19 failų, gyva versija = `HEAD` = `dd31fbbe`, neišstumtų commit'ų 0. Darbinė kopija prieš darbą švari.
│ +- **Būsena:** `check_published.py` (numatytasis režimas) rc 0 — „Repozitorija: 51 moduliai / Paskelbta: 51 moduliai“ (`grade-01: repo 51, gyvai 51`); `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `orphan_files` 0, `vanished_ids` 1 (`03-sakinio-tvarka → 03-sakinio-zodziai` aliasas priimtas, `resolved: true`); garsas 1 486/1 486, svetainės kodas 19 failų, gyva versija = `HEAD` = `dd31fbbe`, neišstumtų commit'ų 0. Darbinė kopija prieš darbą švari.
│  - **3 gyvi adresai (HTTP kodai):** `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → **200**, 3 636 B; `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` → **200**, 5 313 B; `content/lt/grade-01/pasaulio-pazinimas/08-metu-laikai.json` → **200**, 4 411 B. Neigiama kontrolė: `content/lt/grade-01/matematika/99-nera.json` → **404**, tad 200 kažką reiškia.
│  - **#404 likutis įrodytas paleidimu, ne skaitymu.** Numatytasis bėgimas VARTUOSE dar nebuvo paleistas: `scratch/pub404/probe_orphan.py after` (veidrodis su 52 failais, indekse 51 įrašas, `grades.json` 52) → `validate_content.py --grade 1 --strict` **rc 0** (skaičius sutampa su failų skaičiumi — šis įrankis šios klasės defekto nemato ir neturi matyti), `check_registry.py --grade 1` **rc 1** „NAŠLAITIS: 52-tikrinimo-modulis.json yra, bet index.json įrašo nėra“, `check_published.py` **rc 1**, blokas „FAILAS BE INDEKSO ĮRAŠO — svetainėje jis yra, bet vaikas jo nepasieks (1)“, `orphan_files` laukas su `{grade:1, id:'52-tikrinimo-modulis', file:'grade-01/matematika/52-tikrinimo-modulis.json'}`, `verdict.label` = „1 modulio failo be indekso įrašo“.
│  - **Neigiama kontrolė (`scratch/pub404/neg_ctl.py`):** našlaitis iškeltas, `grades.json` grąžintas 51 → `check_registry.py` **rc 0** („failai 51 · našlaičiai 0 · PROBLEMŲ: 0“), `check_published.py` **rc 0**, `verdict` = `sutampa`, `orphan_files` = `[]`. Taigi pataisa nekuria klaidingo raudono (LL-10): abi pusės raudonos būtent tada, kai failas yra be indekso įrašo.
│ research/wiki/guidelines/pamokos.md
│ @@ -917,4 +917,12 @@
│  - **Taisyklė:** simuliacijos išdėstymas neturi priklausyti nuo to, kurie žodžiai rodomi dabar. Tinklelio takelis, kuriame tekstas keičiasi pagal būseną (jausmai, įvertinimai, būdvardžiai, skaičiai žodžiais), visada rašomas `minmax(0,1fr)`, o jo vaikai turi `min-width:0; max-width:100%`. Matuojama ne „ar puslapis įkeliamas tvarkingai“, o **kiekviena pasiekiama būsena atskirai**: pradinė, po kiekvieno valdiklio, po „Iš naujo“. Jei bent viena būsena slenka, defektas yra ten, net jei pradinė švari — ir atvirkščiai, švari pradinė būsena nėra įrodymas.
│  - **Patikra:** zondas eina per fiksuotą būsenų sąrašą (`pradinis → Sakau → atidaryta → noras pakeistas → … → iš naujo`) ir kiekvienoje matuoja dokumento `scrollWidth`, kiekvieno `#sim-stage` vaiko `getBoundingClientRect().right` prieš `innerWidth` ir prieš kortelės dėžę, apkarpymą (`scrollWidth − clientWidth`) ir taikinių ≥ 48 px. Šiame darbe: 5 pločiai × 3 šaknys (16/24/32 px) × 8 būsenos = 120 matavimų, prieš — 3 būsenos slinko (@360/32), po — 0 defektų, 0 konsolės klaidų; prie 16 px `#sim-stage` liko 298×369 kaip buvęs, tad įprastas vaizdas nepakito. Bendrai: ieškoti `1fr 1fr` (`grep -n "1fr 1fr" assets/js/sims/*.js`) ir kiekvieną jų paleisti per būsenų zondą, ne per vieną įkėlimą.
│
│ -
│ +## LL-128 — Defektas, kurį įrankis išspausdina, bet neįskaičiuoja
│ +
│ +- **Simptomas:** 2026-11-20 (#404, patikrinta #411) `content/lt/grade-01/matematika/` buvo modulio failas, kurio `index.json` nematė, o `grades.json` skelbė 52. Visi trys vartai liko žali: `validate_content.py --grade 1 --strict` rc 0 (skaičius sutapo su failų skaičiumi diske), `check_registry.py --grade 1` rc 0, o jo išvestyje **buvo** eilutė „našlaičiai 1“, `check_published.py` — „repo 51, gyvai 51, sutampa“. Vaikas modulio nepasiekė, dashboard'as jį skaičiavo.
│ +- **Priežastis:** įrankis defektą **matė ir išvardijo**, bet įtraukė jį į atskirą spausdinamą lauką, o ne į `problems`, iš kurių skaičiuojamas išėjimo kodas. Skaičiavimas buvo atliktas (`orphans = files - listed`), tik jo rezultatas nepateko į sprendimą. Tai LL-10 (statusas pagal rezultatą) atmaina: statusas imamas ne iš to sąrašo, kuriame defektas įrašytas, o iš kito, trumpesnio. Kuo įrankis „draugiškesnis“ (spausdina daug diagnostikos), tuo lengviau ši spraga lieka nepastebėta — graži išvestis atrodo kaip patikra.
│ +- **Taisyklė:** kiekvienas diagnostinis laukas, kuris reiškia defektą, privalo būti toje pačioje aibėje, iš kurios skaičiuojamas rc, arba turėti aiškiai atskirą paskirtį, įvardytą toje pačioje eilutėje („informacija, ne klaida“). Nekompromisuojama forma: `problems.append(...)` toje pačioje vietoje, kur randamas įrašas, o ne `print(...)` šalia. Pataisa laikoma įrodyta tik tada, kai paleistas zondas duoda rc 1 su defektu ir rc 0 be jo.
│ +- **Patikra:** veidrodis su 52 failais ir 51 indekso įrašu: `check_registry.py --grade 1` → rc 1, `PROBLEMŲ: 1`, eilutė „NAŠLAITIS: 52-tikrinimo-modulis.json yra, bet index.json įrašo nėra“; `check_published.py` → rc 1, `verdict.label` „1 modulio failo be indekso įrašo“, `orphan_files` su failo keliu. Neigiama kontrolė (failas iškeltas, `grades.json` 51) → abu rc 0, `orphan_files: []`. Bendrai: `grep -n "print(" scripts/check_*.py` ir kiekvienam spausdinamam defektui patikrinti, ar jis patenka į `problems` / rc.
│ +
│ +
│ +
│ agents/proposals/2026-11-20-publikavimo-agentas-ci-registry.json
│ @@ -0,0 +1,19 @@
│ +{
│ +  "role": "publikavimo-agentas",
│ +  "run_id": 411,
│ +  "created": "2026-11-20T16:07:00+02:00",
│ +  "type": "struktura",
│ +  "title": "CI nepaleidžia check_registry.py: našlaitis modulio failas praeina visus PR vartus ir publikuojamas",
│ +  "body": "`check_registry.py` yra vienintelis įrankis, kuris lygina keturias vietas iš karto: `index.json` įrašus, modulių failus diske, `path.json` seką ir `SIMS` registrą. `.github/workflows/validate.yml` jo nepaleidžia nė karto (patikrinta `grep -n \"check_registry\" .github/workflows/*.yml` → 0 eilučių), todėl CI mato tik `validate_content.py`, o šis lygina `grades.json` deklaruotą skaičių su failų skaičiumi — abiem pusėms sutarus, failas be indekso įrašo praeina žalias. #404/#411 zondas tą įrodė: 52 failai, 51 indekso įrašas, `grades.json` 52 → `validate_content.py --grade 1 --strict` rc 0, `check_registry.py` rc 1 (po šio paleidimo pataisymo), `check_published.py` rc 1. Kadangi `pages.yml` kopijuoja visą `content/`, toks failas atsiduria svetainėje, bet naršyklė jo neprašo: vaikas modulio nepasiekia, o dashboard'as jį skaičiuoja — būtent vaidmens klausimas „kodėl dashboard rodo daugiau nei svetainė“. Siūloma į `validate.yml` pridėti žingsnį `python3 scripts/check_registry.py` (be `--grade`, kad apimtų visas paleistas klases) iškart po `Turinio validacija`. Įrankis veikia be tinklo ir be naršyklės, tik skaito failus, tad CI laikas beveik nekinta; jis taip pat uždaro #16892 (kortelės ir modulio puslapio pavadinimų nesutapimas) ir `path.json` sekos pilnumą. Dabar šis žingsnis liko tik publikavimo agente, kuris paleidžiamas 5 kartus per parą — per vėlai, kad sustabdytų PR, ir per retai, kad pastebėtų pirmą minutę.",
│ +  "target": ".github/workflows/validate.yml",
│ +  "priority": "high",
│ +  "status": "new",
│ +  "evidence": [
│ +    "grep -n \"check_registry\" .github/workflows/*.yml → 0 eilučių (validate.yml 72 eilutės, 12 žingsnių, nė vieno registro patikros)",
│ +    ".github/workflows/pages.yml — „Surinkti tik svetainės failus“ kopijuoja visą content/, tad našlaitis failas svetainėje atsiranda, nors indeksas jo nerodo",
│ +    "scratch/pub404/probe_orphan.py after: 52 failai / 51 įrašas / grades.json 52 → validate_content.py rc 0, check_registry.py rc 1 „NAŠLAITIS: 52-tikrinimo-modulis.json“, check_published.py rc 1 „1 modulio failo be indekso įrašo“",
│ +    "scratch/pub404/neg_ctl.py: 51 failas / 51 įrašas / grades.json 51 → abu rc 0, orphan_files [] (pataisa nekuria klaidingo raudono)",
│ +    "scripts/check_registry.py:81-92 — našlaitis dabar įtraukiamas į problems (rc 1), o ne tik spausdinamas",
│ +    "research/wiki/guidelines/pamokos.md — LL-128 (nauja, šis paleidimas)"
│ +  ]
│ +}
REZULTATAS: sutampa (repo 51 / paskelbta 51) + ištaisyta (įrodyta zondais į abi puses)

check_published.py (numatytasis režimas, rc 0):
  Repozitorija: 51 moduliai · Paskelbta: 51 moduliai (grade-01: repo 51, gyvai 51)
  missing_on_live 0 · hidden_locally 0 · not_in_path 0 · stale 0 · orphan_files 0
  audio 1486/1486 · kodas 19 failų · gyva versija = HEAD = dd31fbbe · neišstumta 0

3 gyvi adresai (HTTP kodai):
  200 (3 636 B)  content/lt/grade-01/matematika/04-skaiciu-tiese.json
  200 (5 313 B)  content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json
  200 (4 411 B)  content/lt/grade-01/pasaulio-pazinimas/08-metu-laikai.json
  neigiama kontrolė: 99-nera.json → 404

#404 likutis pagaliau įrodytas paleidimu, ne skaitymu:
  scratch/pub404/probe_orphan.py after (52 failai / 51 indekso įrašas / grades.json 52):
    validate_content.py --grade 1 --strict → rc 0 (šio defekto nemato ir neturi matyti)
    check_registry.py --grade 1 → rc 1 „NAŠLAITIS: 52-tikrinimo-modulis.json yra, bet index.json įrašo nėra“
    check_published.py → rc 1, blokas „FAILAS BE INDEKSO ĮRAŠO“, orphan_files su failo keliu
  scratch/pub404/neg_ctl.py (naujas, 51/51/51) → abu rc 0, orphan_files [] — klaidingo raudono nėra.

Failai, įrašyti šiame darbe:
  research/wiki/changelog.md — įrašas „Publkavimo patikra #411“ su visais skaičiais, zondų rezultatais ir 3 HTTP kodais
  research/wiki/guidelines/pamokos.md — nauja LL-128 „Defektas, kurį įrankis išspausdina, bet neįskaičiuoja“ (Simptomas/Priežastis/Taisyklė/Patikra)
  agents/proposals/2026-11-20-publikavimo-agentas-ci-registry.json — siūloma į validate.yml įtraukti check_registry.py (CI jo nepaleidžia nė karto, todėl našlaitis PR praeina žalias)

Vartai po pakeitimų: validate_content.py 0/0 · check_lessons.py 128 įrašai/4 laukai · check_docs_facts.py 0/0 · check_registry.py „PROBLEMŲ: 0“ · check_published.py rc 0.

Neliesta: joks modulio ID nepernumeruotas, nieko nešalinta; content/**, assets/**, docs/**, AGENTS.md, .github/workflows/** neliesti; jokio git push iš agento.

## klaidos

```
session_id: local-67d27764e58a6811d19ac90cb5478de3f6cd0b56656408b16c073bb42842b773
```
