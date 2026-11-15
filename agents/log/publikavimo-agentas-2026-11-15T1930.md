# publikavimo-agentas — 2026-11-15T1930

- paleidimas: #306 (manual)
- trukmė: 300s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/probe306_mirror.py
│ @@ -0,0 +1,23 @@
│ +"""Zondas #306: ar check_published.py pamato `hidden_locally` (svetainėje yra, repo ne).
│ +
│ +Sukuria veidrodžio index.json su vienu papildomu moduliu. Originalus repo failas
│ +neliečiamas: veidrodis yra atskiras katalogas, o content/ nukopijuotas, ne
│ +kietai susietas.
│ +"""
│ +import json
│ +import pathlib
│ +import sys
│ +
│ +mirror = pathlib.Path(sys.argv[1])
│ +p = mirror / "content/lt/grade-01/index.json"
│ +d = json.loads(p.read_text(encoding="utf-8"))
│ +d["strands"][0]["modules"].append({
│ +    "id": "99-tik-svetaineje",
│ +    "title": "Tik svetainėje",
│ +    "subtitle": "Zondo modulis, kurio repo neturi",
│ +    "file": "grade-01/matematika/25-ilgis-ir-vienetas.json",
│ +    "minutes": 9,
│ +    "sim": "ilgis-ir-vienetas",
│ +})
│ +p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
│ +print("veidrodžio index.json modulių:", sum(len(s["modules"]) for s in d["strands"]))
│ profiles/deepseek41flash/cache/scratch/probe306_variants.py
│ @@ -0,0 +1,29 @@
│ +"""Zondas #306 (B/C): ar check_published.py pamato NESKELBTA ir kelio sekos skirtumą.
│ +
│ +B — gyvas index.json neturi modulio, kurį repo turi (svetainė pastatyta iš senesnio indekso).
│ +C — gyvas path.json neturi vieno žingsnio (seka sutrumpėjo).
│ +Kiekvieną kartą veidrodžio index.json/path.json atstatomi iš repo kopijos.
│ +"""
│ +import json
│ +import pathlib
│ +import sys
│ +
│ +repo = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +mirror = pathlib.Path(sys.argv[1])
│ +variant = sys.argv[2]
│ +
│ +idx = mirror / "content/lt/grade-01/index.json"
│ +path = mirror / "content/lt/grade-01/path.json"
│ +idx.write_text((repo / "content/lt/grade-01/index.json").read_text(encoding="utf-8"), encoding="utf-8")
│ +path.write_text((repo / "content/lt/grade-01/path.json").read_text(encoding="utf-8"), encoding="utf-8")
│ +
│ +d = json.loads(idx.read_text(encoding="utf-8"))
│ +if variant == "B":
│ +    dropped = d["strands"][0]["modules"].pop()["id"]
│ +    idx.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
│ +    print("B: iš gyvo index.json išimtas", dropped)
│ +elif variant == "C":
│ +    p = json.loads(path.read_text(encoding="utf-8"))
│ +    dropped = p["sequence"].pop()
│ +    path.write_text(json.dumps(p, ensure_ascii=False, indent=2), encoding="utf-8")
│ +    print("C: iš gyvo path.json išimtas", dropped, "— liko", len(p["sequence"]), "žingsnių")
Sustabdyta dėl iteracijų limito — bet pagrindinis darbas atliktas ir išmatuotas. Ataskaitos failo bei changelog įrašo įrašyti nespėjau; tai lieka kaip likutis (žemiau).

## Ką parodė patikra (realūs išvedimai)

`python3 scripts/check_published.py` (numatytasis režimas, 61,3 s, rc 0):

    Repozitorija: 39 moduliai
    Paskelbta:    39 moduliai
      · grade-01: repo 39, gyvai 39
    Garsas: patikrinta 1138 iš 1138 (visi) — visi pasiekiami
    ✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai,
      svetainės kodas 17 failų, versija 0e269bf0).

- `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0, `aux_stale` 0, `shell_stale` 0, `path_differs` `[]`, `shell_count` 17, `unpushed_commits` 0.
- `git rev-parse HEAD` = `0e269bf0` = `origin/main`, `rev-list --left-right --count origin/main...HEAD` → `0 0`, darbinė kopija švari (0 eilučių).

3 gyvi adresai (HTTP + baitai):

    matematika/25-ilgis-ir-vienetas.json      200  8 812 B
    lietuviu-kalba/01-garsas-ir-raide.json    200  5 044 B
    pasaulio-pazinimas/16-vandens-busenos.json 200  4 932 B
    content/lt/grade-01/index.json    gyvai bc8f40eb05cf (11 741 B) = repo
    assets/audio/lt/manifest.json     gyvai 68c786e110a0 (63 974 B) = repo

## Neigiami zondai — ar vartai mato tai, dėl ko egzistuoja

Veidrodis `scratch/mirror306-*` (assets — kietosios nuorodos, content — tikra kopija; originalai neliesti), 3 scenarijai per tą patį `main()`:

- **A (hidden_locally):** gyvas `index.json` su papildomu `99-tik-svetaineje` → `PAVOJUS PAŽANGAI — svetainėje yra, repo ne (1): 99-tik-svetaineje`, repo 39 / gyvai 40, **rc 1**. Pirmas kartas, kai ši sąlyga (vienintelė, dėl kurios vaidmuo privalo sustoti) įrodyta neigiamai.
- **B (missing_on_live):** iš gyvo indekso išimtas `05-plakatas-ir-informacija` → `NESKELBTA (1)`, repo 39 / gyvai 38, **rc 1**.
- **C (path_differs):** gyvas `path.json` be `02-ritmas-ir-perkusija` → `path.json seka skiriasi: klasė 1`, **rc 1**.

Papildomai gyva svetainė: visi 21 `app.js`/`registry.js` importo su `?v=0e269bf0`, 0 be žymos; `404.html` gyvai 563 B = repo 563 B.

Vartai: `validate_content.py --grade 1 --strict` → 0/0, rc 0; `check_docs_facts.py` → 0/0 (9 kryptys, 39 moduliai, 39 sim, 169 užduotys, 569 garso tekstai, 1 138 įrašai, 15 agentų); `check_view.py --base <gyva> --module 25-ilgis-ir-vienetas --viewports phone,small` → `Patikrinta: 2 · problemos: 0`, rc 0.

## Sprendimas

**sutampa** — repo ir gyva svetainė sutampa visose srityse (39/39 ID, seka, modulių baitai, `index.json`/`path.json`/`grades.json`, manifestas, 1 138/1 138 garso įrašų, 17 kodo failų, versija `0e269bf0` = HEAD). Nieko nešalinta, joks ID nepernumeruotas, `content/**`, `assets/**`, CSS, `docs/**`, `AGENTS.md` neliesti.

## Kas liko nepadaryta (sąžiningai)

1. **`agents/log/publikavimo-agentas-2026-11-15T1830.md` neįrašytas** ir **`agents/state.json` neatnaujintas**; `research/wiki/changelog.md` eilutė taip pat neįrašyta. Failai paruošti mintyse, bet ne ant disko — kitas paleidimas turės tai užbaigti.
2. **Vaikui matoma skola, kurios šis paleidimas nelietė:** žyma už senojo ID `03-sakinio-tvarka` vaiko naršyklėje lieka našlaite po pervadinimo į `03-sakinio-zodziai` — alias mechanizmo nėra (`progress.js`, atviras high pasiūlymas `agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json`, ne mano failas).
3. **Naujas pamokos tipas nefiksuotas.** Kandidatas, kurio neapima nei LL-37, nei LL-96: *sąrašas imamas iš katalogo (`index.html`, `assets/js`, `assets/css`), o ne iš to, ką naršyklė tikrai įkelia* — `404.html` yra vienintelis kitas naršyklei servisuojamas HTML ir nėra nė viename varte (šiandien sutampa, tad latentinis). Jei kitas paleidimas nori tai uždaryti, tai vienos eilutės `SHELL_GLOBS` pakeitimas + veidrodžio zondas.

## klaidos

```
session_id: local-755a9883ab6a2eea49f122175eb876d2e0b9d4b77398ce61dfcb9f1bbf8b639e
```
