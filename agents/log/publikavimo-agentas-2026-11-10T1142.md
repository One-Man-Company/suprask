# publikavimo-agentas — 2026-11-10T1142

- paleidimas: #220 (manual)
- trukmė: 203s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/assets220.py
│ @@ -0,0 +1,67 @@
│ +#!/usr/bin/env python3
│ +"""Palygina gyvus assets failus su repo failais PO tos pačios ?v=<sha8>
│ +transformacijos, kurią daro .github/workflows/pages.yml. Tik skaito."""
│ +import hashlib
│ +import pathlib
│ +import re
│ +import subprocess
│ +import sys
│ +import urllib.request
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +LIVE = "https://one-man-company.github.io/suprask/"
│ +UA = {"User-Agent": "suprask-check/1.1"}
│ +
│ +sha = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True).stdout.strip()[:8]
│ +print("sha8:", sha)
│ +
│ +JS_FROM = re.compile(r'(from "\./[^"]+\.js)"')
│ +JS_IMPORT = re.compile(r'(import\("\./[^"]+\.js)")')
│ +
│ +
│ +def transform_js(text: str) -> str:
│ +    text = JS_FROM.sub(lambda m: f'{m.group(1)}?v={sha}"', text)
│ +    text = JS_IMPORT.sub(lambda m: f'{m.group(1)}?v={sha}")', text)
│ +    return text
│ +
│ +
│ +def transform_html(text: str) -> str:
│ +    text = text.replace('href="./assets/css/main.css"', f'href="./assets/css/main.css?v={sha}"')
│ +    text = text.replace('src="./assets/js/app.js"', f'src="./assets/js/app.js?v={sha}"')
│ +    return text
│ +
│ +
│ +def fetch(url: str) -> bytes | None:
│ +    try:
│ +        req = urllib.request.Request(url, headers=UA)
│ +        with urllib.request.urlopen(req, timeout=25) as r:
│ +            return r.read()
│ +    except Exception as exc:  # noqa: BLE001
│ +        print("  ! fetch error", url, exc)
│ +        return None
│ +
│ +
│ +targets = []
│ +for name in ("index.html", "404.html"):
│ +    targets.append((name, transform_html))
│ +targets.append(("assets/css/main.css", lambda t: t))
│ +for p in sorted((ROOT / "assets/js").rglob("*.js")):
│ +    targets.append((str(p.relative_to(ROOT)), transform_js))
│ +
│ +same = 0
│ +diff = []
│ +for rel, fn in targets:
│ +    local = (ROOT / rel).read_bytes().decode("utf-8", "replace")
│ +    expected = fn(local).encode("utf-8")
│ +    live = fetch(LIVE + rel)
│ +    if live is None:
│ +        diff.append((rel, "unreachable"))
│ +    elif hashlib.sha256(live).hexdigest() == hashlib.sha256(expected).hexdigest():
│ +        same += 1
│ +    else:
│ +        diff.append((rel, f"repo {len(expected)} B vs live {len(live)} B"))
│ +
│ +print(f"assets: {same}/{len(targets)} sutampa")
│ +for d in diff:
│ +    print("  SKIRIASI:", d[0], d[1])
│ +sys.exit(0 if not diff else 1)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/assets220.py
│ @@ -16,7 +16,7 @@
│  print("sha8:", sha)
│
│  JS_FROM = re.compile(r'(from "\./[^"]+\.js)"')
│ -JS_IMPORT = re.compile(r'(import\("\./[^"]+\.js)")')
│ +JS_IMPORT = re.compile(r'(import\("\./[^"]+\.js)"\)')
│
│
│  def transform_js(text: str) -> str:
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/assets220.py
│ @@ -42,8 +42,9 @@
│
│
│  targets = []
│ -for name in ("index.html", "404.html"):
│ -    targets.append((name, transform_html))
│ +# .github/workflows/pages.yml sed'ina TIK index.html — 404.html lieka toks, koks yra.
│ +targets.append(("index.html", transform_html))
│ +targets.append(("404.html", lambda t: t))
│  targets.append(("assets/css/main.css", lambda t: t))
│  for p in sorted((ROOT / "assets/js").rglob("*.js")):
│      targets.append((str(p.relative_to(ROOT)), transform_js))
│ profiles/deepseek41flash/cache/scratch/audio220.py
│ @@ -0,0 +1,53 @@
│ +#!/usr/bin/env python3
│ +"""Gyvo garso zondas: ima manifest'o raktus tolygiai ir tikrina n/ ir s/ mp3."""
│ +import json
│ +import pathlib
│ +import urllib.request
│ +from concurrent.futures import ThreadPoolExecutor
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +LIVE = "https://one-man-company.github.io/suprask/assets/audio/lt/"
│ +UA = {"User-Agent": "suprask-check/1.1"}
│ +
│ +manifest = json.loads((ROOT / "assets/audio/lt/manifest.json").read_text(encoding="utf-8"))
│ +print("manifest tipas:", type(manifest).__name__, "įrašų:", len(manifest))
│ +if isinstance(manifest, list):
│ +    keys = [e["key"] if isinstance(e, dict) and "key" in e else e for e in manifest]
│ +else:
│ +    keys = list(manifest)
│ +print("pavyzdys:", keys[:2])
│ +
│ +N = 12
│ +step = max(1, len(keys) // N)
│ +picked = [keys[i] for i in range(0, len(keys), step)][:N]
│ +print("imta raktų:", len(picked))
│ +
│ +
│ +def probe(item):
│ +    key, variant = item
│ +    if isinstance(manifest, dict):
│ +        h = manifest[key]["n" if variant == "n" else "s"]
│ +    else:
│ +        entry = next(e for e in manifest if (e.get("key") if isinstance(e, dict) else e) == key)
│ +        h = entry[variant]
│ +    url = LIVE + f"{variant}/{h}.mp3"
│ +    try:
│ +        req = urllib.request.Request(url, headers=UA)
│ +        with urllib.request.urlopen(req, timeout=25) as r:
│ +            body = r.read()
│ +            return variant, h[:8], r.status, len(body), body[:3] == b"ID3"
│ +    except Exception as exc:  # noqa: BLE001
│ +        return variant, h[:8], 0, 0, str(exc)
│ +
│ +
│ +items = [(k, v) for k in picked for v in ("n", "s")]
│ +with ThreadPoolExecutor(max_workers=8) as pool:
│ +    rows = list(pool.map(probe, items))
│ +
│ +ok = sum(1 for r in rows if r[2] == 200 and r[0] == "n" and r[4] is True)
│ +ok_s = sum(1 for r in rows if r[2] == 200 and r[0] == "s" and r[4] is True)
│ +for r in rows:
│ +    if r[2] != 200 or r[4] is not True:
│ +        print("  SKIRIASI:", r)
│ +sizes = [r[3] for r in rows if r[3]]
│ +print(f"n/{ok}/{len(picked)}  s/{ok_s}/{len(picked)}  kūnas {min(sizes)}–{max(sizes)} B  ID3 ok")
│ profiles/deepseek41flash/cache/scratch/audio220.py
│ @@ -1,5 +1,5 @@
│  #!/usr/bin/env python3
│ -"""Gyvo garso zondas: ima manifest'o raktus tolygiai ir tikrina n/ ir s/ mp3."""
│ +"""Gyvo garso zondas: manifest'o raktai tolygiai -> n/ ir s/ mp3. Tik skaito."""
│  import json
│  import pathlib
│  import urllib.request
│ @@ -10,44 +10,48 @@
│  UA = {"User-Agent": "suprask-check/1.1"}
│
│  manifest = json.loads((ROOT / "assets/audio/lt/manifest.json").read_text(encoding="utf-8"))
│ -print("manifest tipas:", type(manifest).__name__, "įrašų:", len(manifest))
│ -if isinstance(manifest, list):
│ -    keys = [e["key"] if isinstance(e, dict) and "key" in e else e for e in manifest]
│ -else:
│ -    keys = list(manifest)
│ -print("pavyzdys:", keys[:2])
│ +print("manifest įrašų (tekstų):", len(manifest))
│
│ +refs = set()
│ +for entry in manifest.values():
│ +    for v in ("n", "s"):
│ +        if entry.get(v):
│ +            refs.add(entry[v])
│ +print("manifest nuorodų į mp3:", len(refs))
│ +
│ +disk = {str(p.relative_to(ROOT / "assets/audio/lt")) for p in (ROOT / "assets/audio/lt").rglob("*.mp3")}
│ +print("diske mp3:", len(disk))
│ +missing = sorted(refs - disk)
│ +orphans = sorted(disk - refs)
│ +print("manifest -> diske NĖRA:", len(missing), missing[:5])
│ +print("diske -> manifeste NĖRA (našlaičiai, NETRINAMI):", len(orphans), orphans[:5])
│ +
│ +keys = list(manifest)
│  N = 12
│  step = max(1, len(keys) // N)
│  picked = [keys[i] for i in range(0, len(keys), step)][:N]
│ -print("imta raktų:", len(picked))
│
│
│  def probe(item):
│      key, variant = item
│ -    if isinstance(manifest, dict):
│ -        h = manifest[key]["n" if variant == "n" else "s"]
│ -    else:
│ -        entry = next(e for e in manifest if (e.get("key") if isinstance(e, dict) else e) == key)
│ -        h = entry[variant]
│ -    url = LIVE + f"{variant}/{h}.mp3"
│ +    h = manifest[key][variant]
│      try:
│ -        req = urllib.request.Request(url, headers=UA)
│ +        req = urllib.request.Request(LIVE + h, headers=UA)
│          with urllib.request.urlopen(req, timeout=25) as r:
│              body = r.read()
│ -            return variant, h[:8], r.status, len(body), body[:3] == b"ID3"
│ +            return variant, h, r.status, len(body), body[:3] == b"ID3"
│      except Exception as exc:  # noqa: BLE001
│ -        return variant, h[:8], 0, 0, str(exc)
│ +        return variant, h, 0, 0, str(exc)
│
│
│  items = [(k, v) for k in picked for v in ("n", "s")]
│  with ThreadPoolExecutor(max_workers=8) as pool:
│      rows = list(pool.map(probe, items))
│
│ -ok = sum(1 for r in rows if r[2] == 200 and r[0] == "n" and r[4] is True)
│ -ok_s = sum(1 for r in rows if r[2] == 200 and r[0] == "s" and r[4] is True)
│ -for r in rows:
│ -    if r[2] != 200 or r[4] is not True:
│ -        print("  SKIRIASI:", r)
│ +bad = [r for r in rows if r[2] != 200 or r[4] is not True]
│ +for r in bad:
│ +    print("  SKIRIASI:", r)
│  sizes = [r[3] for r in rows if r[3]]
│ -print(f"n/{ok}/{len(picked)}  s/{ok_s}/{len(picked)}  kūnas {min(sizes)}–{max(sizes)} B  ID3 ok")
│ +okn = sum(1 for r in rows if r[0] == "n" and not (r[2] != 200 or r[4] is not True))
│ +oks = sum(1 for r in rows if r[0] == "s" and not (r[2] != 200 or r[4] is not True))
│ +print(f"gyvi: n {okn}/{len(picked)}, s {oks}/{len(picked)}; kūnas {min(sizes)}–{max(sizes)} B; visi ID3: {not bad}")
SUMMARY / ATASKAITA — publikavimo-agentas, paleidimas #220 (2026-11-10)

check_published.py (repo / paskelbta / neišstumta)
  Repozitorija: 37 moduliai
  Paskelbta:    37 moduliai
  · grade-01: repo 37, gyvai 37
  missing_on_live: []   hidden_locally: []   not_in_path: []
  stale: []   stale_unknown: []   path_differs: []
  Neišstumta commit'ų: 0   →  rc=0
  HEAD = origin/main = 6999827ae8d67dc1fbc981df1434cf885920a727
  Gyvas index.html neša ?v=6999827a = HEAD pirmi 8 simboliai → svetainė pastatyta būtent iš HEAD.

3 HTTP kodai (prašyta)
  content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json        200 (8812 B)
  content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json       200 (5044 B)
  content/lt/grade-01/daile/01-spalva-ir-nuotaika.json             200 (6242 B)
Papildomai: index.json 200 (11209), path.json 200 (1284), grades.json 200 (1126), manifest.json 200 (60762).

Ką dar patikrinau (skaitymui, be jokių pakeitimų)
  Assets baitais (check_published.py jų neapima): 18/18 — index.html, 404.html, main.css, app.js, registry.js, progress.js, speech.js ir visi 11 sim failų sutampa su repo po tos pačios ?v=<sha8> transformacijos, kurią daro .github/workflows/pages.yml. Skirtumų 0. (Pirmas mano zondo variantas klaidingai taikė transformaciją ir 404.html — pages.yml sed'ina TIK index.html; pataisius 18/18.)
  Garsas: manifest 543 tekstai → 1086 nuorodos; diske 1086 mp3; manifest→diske trūksta 0, našlaičių 0. Gyvas zondas 12 raktų × n/s = 24/24 HTTP 200, ID3, 15925–73603 B. manifest.json gyvas = repo baitais.
  Vartai: validate_content.py --grade 1 --strict → 0 klaidų / 0 įspėjimų (rc 0); check_docs_facts.py → 0/0, visi skaičiai (9 kryptys, 37 moduliai, 37 sim, 161 užduotis, 543 tekstai, 1086 įrašai) sutampa su failais.

Dėl praeito paleidimo 14 mp3
Jų dabar NĖRA (n=0, s=0, manifest_hits=0) — vadinasi `git checkout -- assets/audio/lt` buvo atliktas ir tada failai vėl dingo teisėtai: manifestas jų nebeminėja, o diske našlaičių 0. Medis švarus, trynimo pėdsakų nėra. Tai buvo manifest pasikeitimas, ne prarasti įrašai.

Pašalinis pastebėjimas (ne mano sprendimas, nekeista)
  content/audio-overrides.json yra trackintas ir pages.yml jį nukopijuoja į _site, nors jį skaito tik scripts/generate_audio.py (serverio pusė), ne klientas. Pirmas GET davė 404, trys pakartoti — 200 (563/365 B) → krašto tarpinė būsena (LL-76 šeima), ne publikavimo defektas. Verta pasiūlymo „nepublikuoti generatoriaus konfigūracijos", bet tai ne publikavimo agento sprendimas.

SPRENDIMAS: sutampa
  Repo 37 / paskelbta 37, 0 neišstumtų commit'ų, 0 stale, ID nepasikeitę, baitai sutampa (moduliai, index/path, assets, manifest), garsas gyvas. Vaiko localStorage pažangai niekas negresia.

NEBAIGTA (sąžiningai)
  Neparašiau ataskaitos į agents/log/, neįrašiau eilutės į research/wiki/changelog.md ir neatnaujinau agents/state.json — baigėsi įrankių kvotos. Duomenys aukščiau yra visi, kurių tiems trims įrašams reikia (repo 37 / paskelbta 37 / neišstumta 0; 3×200; assets 18/18; garsas 24/24; vartai 0/0). Kitas veiksmas: įrašyti `agents/log/publikavimo-agentas-2026-11-10T1120.md` su šiuo turiniu, pridėti changelog eilutę „2026-11-10 (11:2x) — publikavimas: repo 37 / paskelbta 37, 0 neišstumtų, baitai sutampa", ir agents/state.json last_publish_check → decision „sutampa".

## klaidos

```
session_id: local-93ec2b89510ddaca922da50622d3a32479815d9e441db2566c90bf71e01f04d9
```
