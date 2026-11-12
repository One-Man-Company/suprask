# publikavimo-agentas — 2026-11-12T1600

- paleidimas: #251 (manual)
- trukmė: 203s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/make_stale_mirror.py
│ @@ -0,0 +1,26 @@
│ +"""Paruošia lokalų „gyvos svetainės" veidrodį su tyčia pasenusiu manifest.json.
│ +
│ +Naudojama check_published.py `aux_stale` šakai realiai paleisti (ne vien skaityti kodą).
│ +"""
│ +import json
│ +import pathlib
│ +import subprocess
│ +import sys
│ +
│ +repo = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +root = pathlib.Path(sys.argv[1])
│ +(root / "content").mkdir(parents=True, exist_ok=True)
│ +(root / "assets" / "audio" / "lt").mkdir(parents=True, exist_ok=True)
│ +link = root / "content" / "lt"
│ +if not link.exists():
│ +    link.symlink_to(repo / "content" / "lt")
│ +
│ +src = repo / "assets" / "audio" / "lt" / "manifest.json"
│ +data = json.loads(src.read_text(encoding="utf-8"))
│ +keys = sorted(data)
│ +dropped = keys[-1]
│ +del data[dropped]
│ +(root / "assets" / "audio" / "lt" / "manifest.json").write_text(
│ +    json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
│ +)
│ +print("repo manifest:", len(keys), "raktų; gyvame veidrodyje palikta", len(data), "; išmestas:", dropped)
│ profiles/deepseek41flash/cache/scratch/make_stale_modules.py
│ @@ -0,0 +1,34 @@
│ +"""Antras veidrodis: tikras content/lt kopija, vienas modulis tyčia kitoks + index.json be vieno ID.
│ +
│ +Tikrina check_published.py `stale` (modulio baitai), `missing_on_live` ir `not_in_path` šakas.
│ +"""
│ +import json
│ +import pathlib
│ +import shutil
│ +import sys
│ +
│ +repo = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +root = pathlib.Path(sys.argv[1])
│ +target = root / "content" / "lt"
│ +target.parent.mkdir(parents=True, exist_ok=True)
│ +shutil.copytree(repo / "content" / "lt", target)
│ +(root / "assets" / "audio" / "lt").mkdir(parents=True, exist_ok=True)
│ +shutil.copy2(repo / "assets" / "audio" / "lt" / "manifest.json", root / "assets" / "audio" / "lt" / "manifest.json")
│ +
│ +# 1) vieno modulio baitai kitokie (turinys tas pats, kitas formatavimas = pasenęs gyvas failas)
│ +mod = target / "grade-01" / "matematika" / "25-ilgis-ir-vienetas.json"
│ +raw = mod.read_text(encoding="utf-8")
│ +mod.write_text(raw.replace('"minutes"', '"minutes" ', 1), encoding="utf-8")
│ +
│ +# 2) index.json be paskutinio modulio ID (naujas modulis neišstumtas)
│ +idx_path = target / "grade-01" / "index.json"
│ +idx = json.loads(idx_path.read_text(encoding="utf-8"))
│ +last = None
│ +for strand in idx["strands"]:
│ +    if strand.get("modules"):
│ +        last = strand["modules"].pop()
│ +if last is None:
│ +    raise SystemExit("index.json tuščias")
│ +idx_path.write_text(json.dumps(idx, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
│ +print("išmestas iš gyvo index.json:", last["id"])
│ +print("pakeisti baitai:", mod.name, len(raw), "->", len(mod.read_text(encoding="utf-8")))
│ profiles/deepseek41flash/cache/scratch/make_mirror.py
│ @@ -0,0 +1,39 @@
│ +"""Trečias veidrodis: po VIENĄ pakeitimą, kad būtų aišku, kuri šaka ką praneša.
│ +
│ +Režimai: stale (modulio baitai), missing (ID nėra gyvame index.json), path (seka be ID).
│ +"""
│ +import json
│ +import pathlib
│ +import shutil
│ +import sys
│ +
│ +mode = sys.argv[1]
│ +root = pathlib.Path(sys.argv[2])
│ +repo = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +target = root / "content" / "lt"
│ +target.parent.mkdir(parents=True, exist_ok=True)
│ +shutil.copytree(repo / "content" / "lt", target)
│ +(root / "assets" / "audio" / "lt").mkdir(parents=True, exist_ok=True)
│ +shutil.copy2(repo / "assets" / "audio" / "lt" / "manifest.json", root / "assets" / "audio" / "lt" / "manifest.json")
│ +
│ +if mode == "stale":
│ +    mod = target / "grade-01" / "matematika" / "25-ilgis-ir-vienetas.json"
│ +    raw = mod.read_text(encoding="utf-8")
│ +    mod.write_text(raw.replace('"minutes"', '"minutes" ', 1), encoding="utf-8")
│ +    print("stale:", mod.name)
│ +elif mode == "missing":
│ +    idx_path = target / "grade-01" / "index.json"
│ +    idx = json.loads(idx_path.read_text(encoding="utf-8"))
│ +    strand = next(s for s in idx["strands"] if s.get("modules"))
│ +    dropped = strand["modules"].pop()["id"]
│ +    idx_path.write_text(json.dumps(idx, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
│ +    print("missing iš gyvo index.json (vienas):", dropped, "| kryptis:", strand["id"])
│ +elif mode == "path":
│ +    p = target / "grade-01" / "path.json"
│ +    data = json.loads(p.read_text(encoding="utf-8"))
│ +    removed = data["sequence"][0]
│ +    data["sequence"] = data["sequence"][1:]
│ +    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
│ +    print("path.json be pirmo žingsnio:", removed)
│ +else:
│ +    raise SystemExit("nežinomas režimas")
Paleidimas #251 — publikavimo agentas. Rezultatas: **sutampa**, bet su vienu rastu trūkumu, kurio nepataisiau.

## Būklė (realus `check_published.py` paleidimas, ne vien citata)

Repozitorija: 37 moduliai · Paskelbta: 37 · Neišstumta commit'ų: 0 · `missing_on_live` 0 · `hidden_locally` 0 · `not_in_path` 0 · `stale` 0 · `stale_unknown` 0 · `aux_stale` 0 · `path_differs` false · `live_error` "".

Vienos klasės išklotinė: `grade-01: repo 37, gyvai 37`. Išvestis baigiasi `✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai.)`, rc 0, 6,6 s.

## Gairių reikalaujami 3 HTTP kodai (ir 2 papildomi)

```
content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json        200  8812 B
content/lt/grade-01/lietuviu-kalba/03-sakinio-tvarka.json       200  4209 B   (#250 turinys gyvas)
content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json  200  4946 B
content/lt/grades.json                                          200  1126 B
assets/audio/lt/manifest.json                                   200 60758 B
```

`03-sakinio-tvarka` patikrintas sąmoningai — tai paskutinio turinio commit'o (a6abeba, #250) failas; baitai sutampa su HEAD, tad #250 tikrai pasiekė svetainę.

## Ką padariau, ko pernai nebuvau padaręs: realūs įrankio testai

Praeito paleidimo ataskaitoje buvo parašyta „neišbandyta" apie #247 kodo šakas. Šiandien jas paleidau prieš lokalius veidrodžius (`SUPRASK_LIVE_ROOT`, http.server 8977–8980), kiekvieną su tyčia suklastotu gyvu failu:

- A. pasenęs modulio failas → `PASENĘS TURINYS … 25-ilgis-ir-vienetas: repo 8812 B, gyvai 8813 B`, rc 1 ✔
- B. `--json` → rc 1 (pirmas matavimas rodė 0 — tai buvo `json.tool` išėjimo kodas, ne įrankio; perrinkta be pipe) ✔
- C. nepasiekiama gyva bazė → `live_error`, 37 nepasiekiami, rc 1, jokio crash ✔
- D. `aux_stale` manifestui → `assets/audio/lt/manifest.json: repo 60758 B, gyvai 63911 B`, rc 1 ✔ (būtent tai, ko #247 prisiekė nematyti)
- E. `aux_stale` klasės `index.json` → rc 1 ✔; `path_differs` → rc 1 su „path.json seka skiriasi: klasė 1" ✔
- F. `--no-bytes` → baitų nepraneša, `path_differs` vis tiek pagauna ✔

Vartai: `validate_content.py --grade 1 --strict` 0/0 (rc 0); `check_docs_facts.py` 0/0 (rc 0); `check_audio.py` 543 tekstų / 1086 įrašų / 1086 mp3 (rc 0).

## Kas liko nepadaryta (sąžiningai)

1. **Neįrašyta**: `research/wiki/changelog.md` eilutė, `agents/log/publikavimo-agentas-2026-11-12T…md`, `agents/state.json` (`last_publish_check`), LL pamoka ir pasiūlymo failas. Baigiau iteracijų limitą prieš šiuos įrašus — juos reikia padaryti kitame žingsnyje.
2. **Nepataisiau** dubliuoto pranešimo: kai modulio ID nėra gyvame `index.json`, jis rodomas ir „NESKELBTA", ir „PASENĘS TURINYS". Priežastis — baitų ciklas nefiltruoja `missing_on_live` (scripts/check_published.py:169). Žalos nedaro (rc vis tiek 1), bet kalba klaidina: turinys nepasenęs, jis tiesiog nepaskelbtas.
3. **Radinys kitam paleidimui**: `dashboard/server.py:719` sprendžia „sutampa" tik iš `missing_on_live` ir `unpushed_commits`; mano testas D/E įrodo, kad įrankis grąžina rc 1 su `stale`/`aux_stale`/`path_differs`, o dashboard'o kortelė vis tiek rašytų „sutampa". Ne mano failas — verta pasiūlymo su šio paleidimo skaičiais kaip įrodymu.

**Sprendimas: sutampa.** Niekas nešalinta, ID nepernumeruoti, `path.json`, `index.json`, `grades.json` ir garsas neliesti; darbinė kopija po darbų švari.

## klaidos

```
session_id: local-56083b48fb772f36252b2e8764f521d27464d178af0f4fc6c16381457cb0e431
```
