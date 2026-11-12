# publikavimo-agentas — 2026-11-12T0623

- paleidimas: #241 (manual)
- trukmė: 200s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/probe241_bytes.py
│ @@ -0,0 +1,95 @@
│ +#!/usr/bin/env python3
│ +"""#241 publikavimo zondas: gyvi failai vs HEAD baitai (index/path/grades/manifest + assets)."""
│ +import hashlib
│ +import subprocess
│ +import sys
│ +import urllib.request
│ +
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +REPO = "/home/zoltanas/workspace/suprask"
│ +
│ +FILES = [
│ +    "content/lt/grade-01/index.json",
│ +    "content/lt/grade-01/path.json",
│ +    "content/lt/grades.json",
│ +    "assets/audio/lt/manifest.json",
│ +    "index.html",
│ +    "404.html",
│ +    "assets/css/main.css",
│ +    "assets/js/app.js",
│ +    "assets/js/registry.js",
│ +    "assets/js/progress.js",
│ +    "assets/js/speech.js",
│ +]
│ +
│ +
│ +def blob_head(path):
│ +    return subprocess.run(
│ +        ["git", "-C", REPO, "cat-file", "blob", f"HEAD:{path}"],
│ +        capture_output=True, check=True).stdout
│ +
│ +
│ +def strip_version(body):
│ +    """index.html ir assetai i?kelia? ?v=<sha8> — nuimam, kad lygintume turini."""
│ +    out = []
│ +    for ln in body.split(b"\n"):
│ +        if b"?v=" in ln:
│ +            ln = ln.replace(b"?v=", b"?v=STRIPPED#")  # placeholder
│ +            parts = []
│ +            for chunk in ln.split(b"?v="):
│ +                if b"STRIPPED#" in chunk:
│ +                    pass
│ +                parts.append(chunk)
│ +            # paprasciau: regex
│ +        out.append(ln)
│ +    return b"\n".join(out)
│ +
│ +
│ +import re
│ +
│ +VRE = re.compile(rb"\?v=[0-9a-f]{7,40}")
│ +
│ +
│ +def main():
│ +    head = subprocess.run(["git", "-C", REPO, "rev-parse", "HEAD"],
│ +                          capture_output=True, text=True).stdout.strip()
│ +    print(f"HEAD: {head}  (sha8 {head[:8]})")
│ +    bad = 0
│ +    for path in FILES:
│ +        local = blob_head(path)
│ +        url = BASE + path
│ +        try:
│ +            with urllib.request.urlopen(url, timeout=30) as r:
│ +                code = r.status
│ +                live = r.read()
│ +        except Exception as exc:  # noqa: BLE001
│ +            print(f"  {path}: ERROR {exc}")
│ +            bad += 1
│ +            continue
│ +        live_n = VRE.sub(b"?v=GEN", live)
│ +        local_n = VRE.sub(b"?v=GEN", local)
│ +        same = hashlib.sha256(live_n).hexdigest() == hashlib.sha256(local_n).hexdigest()
│ +        if not same:
│ +            bad += 1
│ +        print(f"  {code} {path}: gyva {len(live)} B / HEAD {len(local)} B -> "
│ +              f"{'MATCH' if same else 'DIFF'}")
│ +
│ +    # kiek moduliu yra index.json ir kiek failu diske
│ +    import json
│ … omitted 17 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/probe241_bytes2.py
│ @@ -0,0 +1,102 @@
│ +#!/usr/bin/env python3
│ +"""#241 zondas: gyvi failai vs HEAD baitai po ?v=<sha8> nuemimo.
│ +
│ +GitHub Pages workflow (.github/workflows/pages.yml) prie kiekvienos CSS/JS
│ +nuorodos ir prie kiekvieno JS `from "./x.js"` / `import("./x.js")` priraso
│ +`?v=<GITHUB_SHA:0:8>`. Todėl baitai lyginami nuėmus šį žymeklį ABIEJOSE
│ +pusėse; pats žymeklis turi sutapti su HEAD pirmu aštuonetu.
│ +"""
│ +import hashlib
│ +import json
│ +import re
│ +import subprocess
│ +import sys
│ +import urllib.request
│ +
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +REPO = "/home/zoltanas/workspace/suprask"
│ +VRE = re.compile(rb"\?v=[0-9a-f]{6,40}")
│ +
│ +FILES = [
│ +    "content/lt/grade-01/index.json",
│ +    "content/lt/grade-01/path.json",
│ +    "content/lt/grades.json",
│ +    "assets/audio/lt/manifest.json",
│ +    "index.html",
│ +    "404.html",
│ +    "assets/css/main.css",
│ +    "assets/js/app.js",
│ +    "assets/js/registry.js",
│ +    "assets/js/progress.js",
│ +    "assets/js/speech.js",
│ +    "assets/js/sims/matematika.js",
│ +    "assets/js/sims/pasaulis.js",
│ +]
│ +
│ +
│ +def sha(b):
│ +    return hashlib.sha256(b).hexdigest()
│ +
│ +
│ +def norm(b):
│ +    return VRE.sub(b"?v=X", b)
│ +
│ +
│ +def head_blob(path):
│ +    return subprocess.run(["git", "-C", REPO, "cat-file", "blob", "HEAD:" + path],
│ +                          capture_output=True, check=True).stdout
│ +
│ +
│ +def fetch(path):
│ +    with urllib.request.urlopen(BASE + path, timeout=40) as r:
│ +        return r.status, r.read()
│ +
│ +
│ +def main():
│ +    head = subprocess.run(["git", "-C", REPO, "rev-parse", "HEAD"],
│ +                          capture_output=True, text=True).stdout.strip()
│ +    sha8 = head[:8].encode()
│ +    print("HEAD:", head, "sha8:", sha8.decode())
│ +    bad = 0
│ +    versions = set()
│ +    for path in FILES:
│ +        local = head_blob(path)
│ +        try:
│ +            code, live = fetch(path)
│ +        except Exception as exc:  # noqa: BLE001
│ +            print("  ERROR", path, exc)
│ +            bad += 1
│ +            continue
│ +        for v in VRE.findall(live):
│ +            versions.add(v.decode())
│ +        same = sha(norm(live)) == sha(norm(local))
│ +        if not same:
│ +            bad += 1
│ +        extra = ""
│ +        if not same:
│ +            a, b = norm(local), norm(live)
│ +            pos = next((i for i in range(min(len(a), len(b))) if a[i] != b[i]), None)
│ … omitted 24 diff line(s) across 1 additional file(s)/section(s)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe241_bytes2.py
│ @@ -15,7 +15,7 @@
│
│  BASE = "https://one-man-company.github.io/suprask/"
│  REPO = "/home/zoltanas/workspace/suprask"
│ -VRE = re.compile(rb"\?v=[0-9a-f]{6,40}")
│ +VRE = re.compile(rb"\?v=([0-9a-f]{6,40})")
│
│  FILES = [
│      "content/lt/grade-01/index.json",
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe241_bytes2.py
│ @@ -39,7 +39,7 @@
│
│
│  def norm(b):
│ -    return VRE.sub(b"?v=X", b)
│ +    return VRE.sub(b"", b)
│
│
│  def head_blob(path):
│ profiles/deepseek41flash/cache/scratch/probe241_audio_placeholder.txt
│ @@ -0,0 +1,2 @@
│ +#!/usr/bin/env python3
│ +"""#241: garso imtis is gyvo manifest'o — kas ~90-a raktas, n ir s."""import json
│ profiles/deepseek41flash/cache/scratch/probe241_audio.py
│ @@ -0,0 +1,39 @@
│ +#!/usr/bin/env python3
│ +"""#241: garso imtis is gyvo manifest'o — kas ~90-a raktas, abu variantai (n, s)."""
│ +import json
│ +import sys
│ +import urllib.request
│ +
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +MAN = "/home/zoltanas/workspace/suprask/assets/audio/lt/manifest.json"
│ +
│ +man = json.load(open(MAN, encoding="utf-8"))
│ +keys = list(man)
│ +print("manifesto raktu:", len(keys))
│ +step = max(1, len(keys) // 7)
│ +sample = keys[::step][:7]
│ +
│ +bad = 0
│ +for k in sample:
│ +    entry = man[k]
│ +    for variant in ("n", "s"):
│ +        rel = entry.get(variant) or entry
│ +        if isinstance(rel, dict):
│ +            rel = rel.get("path") or rel.get("n")
│ +        url = BASE + rel.lstrip("/")
│ +        try:
│ +            with urllib.request.urlopen(url, timeout=30) as r:
│ +                data = r.read()
│ +                code = r.status
│ +        except Exception as exc:  # noqa: BLE001
│ +            print(f"  ERROR {k}/{variant}: {exc}")
│ +            bad += 1
│ +            continue
│ +        head = data[:3]
│ +        ok = code == 200 and head == b"ID3"
│ +        if not ok:
│ +            bad += 1
│ +        print(f"  {code} {k}/{variant}: {len(data)} B, antraštė {head!r} -> "
│ +              f"{'OK' if ok else 'BLOGAI'}")
│ +print("klaidu:", bad)
│ +sys.exit(1 if bad else 0)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe241_audio.py
│ @@ -20,7 +20,7 @@
│          rel = entry.get(variant) or entry
│          if isinstance(rel, dict):
│              rel = rel.get("path") or rel.get("n")
│ -        url = BASE + rel.lstrip("/")
│ +        url = BASE + "assets/audio/lt/" + str(rel).lstrip("/")
│          try:
│              with urllib.request.urlopen(url, timeout=30) as r:
│                  data = r.read()
Nutraukta ties garso imtimi — pateikiu, kas jau patikrinta realiais įrankiais, ir kas liko nebaigta.

## Atlikta (realūs rezultatai)

**1. `check_published.py`**
```
Repozitorija: 37 moduliai
Paskelbta:    37 moduliai
  · grade-01: repo 37, gyvai 37
✔ Repo ir gyva svetainė sutampa (ID, seka ir failų baitai).  RC=0
```
Be to: `HEAD` = `origin/main` = `7ab5045e450f…` (neišstumtų commit'ų 0), `git status --porcelain -uall` tuščias.

**2. Baitai, ne skaičiai (zondas, 13 failų)** — visi MATCH po `?v=<sha8>` nuėmimo:
`grade-01/index.json` 11 209 B, `path.json` 1 284 B, `grades.json` 1 126 B, `audio/lt/manifest.json` 60 762 B (543 raktai), `index.html`, `404.html`, `main.css`, `app.js`, `registry.js`, `progress.js`, `speech.js`, `sims/matematika.js`, `sims/pasaulis.js`.

**3. Pastatyta iš HEAD:** gyvuose failuose vienintelis žymeklis `?v=7ab5045e` = pirmi 8 `HEAD` simboliai → sutampa. (Žymeklį įrašo `pages.yml` sed žingsnis, todėl baitai lyginami tik jį nuėmus — LL-76.)

**4. 3 gyvi adresai:** `matematika/25-ilgis-ir-vienetas.json` **200** (8812 B), `lietuviu-kalba/01-garsas-ir-raide.json` **200** (5044 B), `pasaulio-pazinimas/16-vandens-busenos.json` **200** (4946 B).

**5. Struktūra:** index.json 9 kryptys / 37 moduliai / 37 unikalūs ID; path.json 37 žingsniai, `ne indekse []`, `ne kelyje []`, dublikatų nėra; grades.json `1 → live, modules 37`; manifest 543 raktai.

**6. Vartai:** `validate_content.py --grade 1 --strict` → 0/0 (rc 0); `check_docs_facts.py` → 0/0, 9 kryptys / 37 moduliai (rc 0); `check_audio.py` → 543 tekstų, 1086 įrašų, 1086/1086 mp3, 0 našlaičių (rc 0).

**7. Nuo #239:** `git diff --stat f1b1416..HEAD -- content assets index.html docs research` → tik `research/wiki/changelog.md` (+10 eil.). Turinys ir assets nepakito; pasikeitė tik statybos commit'as `f1b1416` → `7ab5045`.

## Sprendimas: **sutampa**
Repo 37 / paskelbta 37, `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `path_differs` false. Niekas nešalinta, ID nepernumeruoti, `path.json` nekeistas.

## NEBAIGTA (sąžiningai)
- **Garso imtis nepavyko:** pirmas zondas ėmė klaidingą kelią (`n/…` be `assets/audio/lt/`), gavau 14×404 — tai zondo, ne svetainės klaida; pataisymą įrašiau, bet paleisti nebespėjau. `check_audio.py` vis dėlto patvirtino, kad repo pusėje visi 1086 įrašai yra.
- **Neįrašyta:** `research/wiki/changelog.md` įrašas #241, `agents/log/publikavimo-agentas-2026-11-12.md`, `agents/state.json` atnaujinimas.

## Radinys kitam paleidimui
`check_published.py` (`scripts/check_published.py:116–157`) lygina **modulių** baitus, bet `index.json`, `path.json`, `grades.json` ir `manifest.json` tik **parsina** — pasenęs gyvas `manifest.json` tyliai užmuštų naujo modulio garsą (404), o visi vartai liktų žali. #8716 trys punktai jau įgyvendinti (klasės iš `grades.json`, baitai, „trūksta ID“ vs „turinys pasenęs“), o DB jį vis dar rodo atvirą — verta užfiksuoti kaip pasiūlymą dėl likusio `manifest.json`/`index.json` baitų palyginimo.

## klaidos

```
session_id: local-9269803f12a7c029a3db7b0c7430e567dd2945f6cf5ea48f651ed62edf7e641d
```
