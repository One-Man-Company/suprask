# publikavimo-agentas — 2026-11-09T1932

- paleidimas: #210 (manual)
- trukmė: 413s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub210.py
│ @@ -0,0 +1,91 @@
│ +#!/usr/bin/env python3
│ +"""#210 publikavimo zondas: kiekvienas gyvas turinio failas baitais lygus repo HEAD.
│ +
│ +Skaito repo failus per `git cat-file blob HEAD:<kelias>` ir lygina su gyvais
│ +baitais. Nenaudoja kešo apejimo (be ?v=), kad matuotų tai, ką gauna vaikas.
│ +"""
│ +import hashlib
│ +import json
│ +import pathlib
│ +import subprocess
│ +import sys
│ +import time
│ +import urllib.request
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +UA = {"User-Agent": "suprask-pub-check/2.0"}
│ +
│ +
│ +def repo_blob(path: str) -> bytes | None:
│ +    r = subprocess.run(["git", "cat-file", "blob", f"HEAD:{path}"], cwd=ROOT, capture_output=True)
│ +    return r.stdout if r.returncode == 0 else None
│ +
│ +
│ +def live(path: str, timeout: int = 30):
│ +    req = urllib.request.Request(BASE + path, headers=UA)
│ +    try:
│ +        with urllib.request.urlopen(req, timeout=timeout) as r:
│ +            return r.getcode(), r.read()
│ +    except urllib.error.HTTPError as e:
│ +        return e.code, b""
│ +    except Exception as e:  # noqa: BLE001
│ +        return None, f"{type(e).__name__}: {e}".encode()
│ +
│ +
│ +def index_files() -> list[str]:
│ +    idx = json.loads((ROOT / "content/lt/grade-01/index.json").read_text(encoding="utf-8"))
│ +    return [m["file"] for s in idx["strands"] for m in s["modules"]]
│ +
│ +
│ +def main() -> int:
│ +    paths = ["index.html", "assets/js/registry.js", "assets/css/main.css",
│ +             "content/lt/grades.json", "content/lt/grade-01/index.json",
│ +             "content/lt/grade-01/path.json", "assets/audio/lt/manifest.json"]
│ +    paths += ["content/lt/" + f for f in index_files()]
│ +
│ +    ok = diff = 0
│ +    problems = []
│ +    for p in paths:
│ +        blob = repo_blob(p)
│ +        code, body = live(p)
│ +        if blob is None:
│ +            problems.append(f"{p}: nėra repo HEAD")
│ +            continue
│ +        if code != 200:
│ +            problems.append(f"{p}: HTTP {code}")
│ +            continue
│ +        if body == blob:
│ +            ok += 1
│ +        else:
│ +            diff += 1
│ +            problems.append(f"{p}: DIFF repo {len(blob)} B / gyvas {len(body)} B "
│ +                            f"sha {hashlib.sha256(blob).hexdigest()[:8]} vs {hashlib.sha256(body).hexdigest()[:8]}")
│ +
│ +    print(f"Failai: {len(paths)} | lygūs: {ok} | skiriasi: {diff}")
│ +    for p in problems:
│ +        print("  !", p)
│ +
│ +    # ?v= žyma gyvame index.html
│ +    ver = subprocess.run(["grep", "-o", "?v=[a-f0-9]*", "-m1"], input=b"", capture_output=True)
│ +    code, html = live("index.html")
│ +    marker = ""
│ +    if code == 200:
│ +        import re
│ +        m = re.search(r"\?v=([a-f0-9]+)", html.decode("utf-8", "replace"))
│ +        marker = m.group(1) if m else ""
│ +    head = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
│ +    print(f"index.html ?v={marker or '—'} | HEAD {head[:8]} | sutampa: {marker[:8] == head[:8]}")
│ … omitted 13 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/pub210.py
│ @@ -2,24 +2,38 @@
│  """#210 publikavimo zondas: kiekvienas gyvas turinio failas baitais lygus repo HEAD.
│
│  Skaito repo failus per `git cat-file blob HEAD:<kelias>` ir lygina su gyvais
│ -baitais. Nenaudoja kešo apejimo (be ?v=), kad matuotų tai, ką gauna vaikas.
│ +baitais be kešo apejimo. Publikavimo workflow (.github/workflows/pages.yml)
│ +SĄMONINGAI perrašo index.html ir assets/js/*.js — prirašo ?v=<sha8> prie CSS/JS
│ +nuorodų, kad naršyklė nepaimtų pasenusio failo. Todėl JS/HTML lyginami PO
│ +normalizavimo: ?v=<sha8> pašalinamas iš abiejų pusių, o žyma atskirai
│ +patikrinama, ar lygi HEAD pirmiems 8 simboliams.
│ +
│ +Rezultatas: „lygūs“ reiškia baitus, kuriuos vaikas realiai gauna.
│  """
│  import hashlib
│  import json
│  import pathlib
│ +import re
│  import subprocess
│  import sys
│  import time
│ +import urllib.error
│  import urllib.request
│
│  ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│  BASE = "https://one-man-company.github.io/suprask/"
│ -UA = {"User-Agent": "suprask-pub-check/2.0"}
│ +UA = {"User-Agent": "suprask-pub-check/2.1"}
│ +VER = re.compile(rb"\?v=[a-f0-9]{7,40}")
│
│
│  def repo_blob(path: str) -> bytes | None:
│      r = subprocess.run(["git", "cat-file", "blob", f"HEAD:{path}"], cwd=ROOT, capture_output=True)
│      return r.stdout if r.returncode == 0 else None
│ +
│ +
│ +def head_sha() -> str:
│ +    return subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT,
│ +                          capture_output=True, text=True).stdout.strip()
│
│
│  def live(path: str, timeout: int = 30):
│ @@ -38,53 +52,82 @@
│      return [m["file"] for s in idx["strands"] for m in s["modules"]]
│
│
│ +def compare(path: str, normalize: bool):
│ +    blob = repo_blob(path)
│ +    code, body = live(path)
│ +    if blob is None:
│ +        return False, f"{path}: nėra repo HEAD"
│ +    if code != 200:
│ +        return False, f"{path}: HTTP {code}"
│ +    b, g = (VER.sub(b"?v=X", blob), VER.sub(b"?v=X", body)) if normalize else (blob, body)
│ +    if b == g:
│ +        return True, ""
│ +    return False, (f"{path}: DIFF repo {len(blob)} B / gyvas {len(body)} B "
│ +                   f"sha {hashlib.sha256(b).hexdigest()[:8]} vs {hashlib.sha256(g).hexdigest()[:8]}")
│ +
│ +
│  def main() -> int:
│ -    paths = ["index.html", "assets/js/registry.js", "assets/css/main.css",
│ -             "content/lt/grades.json", "content/lt/grade-01/index.json",
│ -             "content/lt/grade-01/path.json", "assets/audio/lt/manifest.json"]
│ -    paths += ["content/lt/" + f for f in index_files()]
│ +    sha = head_sha()
│ +    js = ["index.html", "assets/js/registry.js", "assets/js/app.js",
│ +          "assets/js/progress.js", "assets/js/speech.js"]
│ +    data = ["content/lt/grades.json", "content/lt/grade-01/index.json",
│ +            "content/lt/grade-01/path.json", "assets/audio/lt/manifest.json"]
│ +    data += ["content/lt/" + f for f in index_files()]
│
│ -    ok = diff = 0
│ +    ok = 0
│      problems = []
│ -    for p in paths:
│ -        blob = repo_blob(p)
│ -        code, body = live(p)
│ -        if blob is None:
│ -            problems.append(f"{p}: nėra repo HEAD")
│ … omitted 78 diff line(s) across 1 additional file(s)/section(s)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub210.py
│ @@ -59,7 +59,8 @@
│          return False, f"{path}: nėra repo HEAD"
│      if code != 200:
│          return False, f"{path}: HTTP {code}"
│ -    b, g = (VER.sub(b"?v=X", blob), VER.sub(b"?v=X", body)) if normalize else (blob, body)
│ +    b = VER.sub(b"", blob)
│ +    g = VER.sub(b"", body) if normalize else body
│      if b == g:
│          return True, ""
│      return False, (f"{path}: DIFF repo {len(blob)} B / gyvas {len(body)} B "
│ profiles/deepseek41flash/cache/scratch/audio210.py
│ @@ -0,0 +1,23 @@
│ +#!/usr/bin/env python3
│ +"""#210 garso higiena: kiek mp3 diske neturi nuorodos manifeste (ir atvirkščiai)."""
│ +import json
│ +import pathlib
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask/assets/audio/lt")
│ +man = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
│ +refs = set()
│ +for k, v in man.items():
│ +    for t in ("n", "s"):
│ +        if isinstance(v, dict) and v.get(t):
│ +            refs.add(v[t])
│ +disk = {str(p.relative_to(ROOT)) for p in ROOT.rglob("*.mp3")}
│ +print(f"manifesto raktai: {len(man)} | unikalūs takai: {len(refs)}")
│ +print(f"diske mp3: {len(disk)}")
│ +orph = sorted(disk - refs)
│ +missing = sorted(refs - disk)
│ +print(f"be nuorodos (našlaičiai): {len(orph)}")
│ +for p in orph:
│ +    print("  ", p, (ROOT / p).stat().st_size, "B")
│ +print(f"manifeste, bet diske nėra: {len(missing)}")
│ +for p in missing[:10]:
│ +    print("  ", p)
Nepavyko užbaigti iki galo: pasiekiau įrankių kvotą prieš įrašydamas ataskaitą. Bet patikra atlikta ir rezultatas vienareikšmis.

## Ką patikrinau (realūs paleidimai)

**check_published.py** (RC=0):
```
Repozitorija: 35 moduliai
Paskelbta:    35 moduliai
✔ Repo ir gyva svetainė sutampa.
```
JSON: `missing_on_live 0`, `hidden_locally 0`, `not_in_path 0`, `unpushed_commits 0`, `live_error ""`. `HEAD` = `origin/main` = `8d1b1f3f`, darbinė kopija švari, neprijungtų šakų 0.

**3 gyvi adresai (HTTP):**
- `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` → **200**, 5 044 B
- `content/lt/grade-01/matematika/23-piktograma-ir-stulpelis.json` → **200**, 6 420 B
- `content/lt/grade-01/daile/01-spalva-ir-nuotaika.json` → **200**, 6 242 B

Papildomai: **visi 35 modulių failai → 200** (0 kitų kodų).

**Baitai, ne ID** (zondas `pub210.py`, 44 failai): 44/44 lygūs `git cat-file blob HEAD` — 35 modulio JSON + `index.json`, `path.json`, `grades.json`, garso manifestas (500 raktų / 1000 takų), `main.css`, `app.js`, `registry.js`, `index.html`. Gyvas `index.html` neša `?v=8d1b1f3f` = pirmi 8 `HEAD` simboliai → svetainė pastatyta būtent iš `8d1b1f3f`; Pages deploymentas prie to paties SHA `completed/success` (14:41:13–14:43:45Z).

Zondo niuansas, kainavęs du klaidingus DIFF: `pages.yml:34–41` sąmoningai prirašo `?v=<sha8>` prie CSS/JS nuorodų, todėl `index.html`, `registry.js`, `app.js` niekada nebūna baitais lygūs repo. Po žymos pašalinimo (ne pakeitimo žymekliu — pirmoji mano versija paliko `?v=X` ir vėl rodė 3 skirtumus) — 44/44. Importų žymos gyvi: app.js 3/3, registry.js 10/10.

**Kiti vartai (gyva svetainė, ne baitai):**
- `check_view.py --base <gyva> --viewports phone,small` → 70 patikrų (35 × 390/360 px), **0 problemų**, RC=0
- `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų
- `check_docs_facts.py` → 0 klaidų, 0 įspėjimų (9 kryptys, 35 moduliai)
- Garsas: 16/16 gyvų mp3 (n+s) → 200 ir ID3, 14 462–72 976 B; `check_audio.py` → 500 tekstų × 2, Piper
- Nutekėjimo patikra: `agents/state.json`, `agents/AGENTS.md`, `docs/`, `scripts/`, `research/wiki/`, `README.md` → **404**; `404.html` → 200

## Sprendimas: **sutampa**

Nieko nešalinta, ID nepernumeruoti, `path.json` neliestas, joks failas netaisytas.

## Kas liko nepadaryta (dėl kvotos)

1. `research/wiki/changelog.md` įrašas (2026-11-09 19:38, #210) — neįrašytas.
2. `agents/log/publikavimo-agentas-2026-11-09T1938.md` — neataskaita neparašyta.
3. `agents/state.json` `last_publish_check` — neatnaujintas.

Duomenys tiems įrašams: repo 35 / paskelbta 35, HEAD `8d1b1f3f`, 44/44 baitai, 35/35 HTTP 200, 3 adresai 200, 70/0 check_view, 16/16 garso imtis, deployment success, sprendimas „sutampa“.

## Radiniai, verti dėmesio (ne publikavimo defektai)

- **Garso našlaičiai: 14, ne 6** (7 tekstai × n/s, 16 761–56 467 B) — auga, bet priešinga kryptis švari: manifeste nurodytų, bet diske trūkstamų takų **0**. Vaikui tai negresia tyla; atviras #7397 (`check_audio.py` vienkryptis) skaičių pasenęs.
- **`check_published.py` riba** patvirtinta dar kartą: šiandien „sutampa“ reiškė tik ID aibes — baitų lygybę įrodė scratch zondas, ne įrankis. Tai jau turi atvirus #8716 ir `2026-11-09-publikavimo-agentas-patikra-baitais.json` (run 191, status `new`), tad naujo pasiūlymo neteikiau. Verta į tą pasiūlymą įtraukti `?v=` normalizavimą, kitaip įgyvendintojas gaus tuos pačius 3 klaidingus DIFF.
- Naujos pamokos nepridėjau: `?v=` žymos taisyklė jau fiksuota LL-76 (`research/wiki/guidelines/pamokos.md:549–554`), o mano klaida buvo žymos pakeitimas vietoj pašalinimo — implementacijos, ne naujo defekto tipo, klaida.

## klaidos

```
session_id: local-76554779852904dda2338b8cf1b33cc59cf8a8ee6cacaed8ef5ff4ca178a4476
```
