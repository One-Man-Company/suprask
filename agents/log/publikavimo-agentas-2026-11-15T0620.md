# publikavimo-agentas — 2026-11-15T0620

- paleidimas: #294 (manual)
- trukmė: 264s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub294_http.py
│ @@ -0,0 +1,48 @@
│ +import hashlib, urllib.request, pathlib, sys
│ +
│ +base = "https://one-man-company.github.io/suprask/"
│ +mods = [("grade-01/matematika", "25-ilgis-ir-vienetas"),
│ +        ("grade-01/lietuviu-kalba", "03-sakinio-zodziai"),
│ +        ("grade-01/pasaulio-pazinimas", "16-vandens-busenos")]
│ +root = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +for d, m in mods:
│ +    rel = f"content/lt/{d}/{m}.json"
│ +    repo = (root / rel).read_bytes()
│ +    url = base + rel
│ +    code = None
│ +    data = b""
│ +    attempts = 0
│ +    for attempt in range(3):
│ +        attempts = attempt + 1
│ +        try:
│ +            with urllib.request.urlopen(url, timeout=30) as r:
│ +                code = r.status
│ +                data = r.read()
│ +            if code == 200:
│ +                break
│ +        except Exception as e:
│ +            code = f"ERR {e}"
│ +    same = code == 200 and hashlib.sha256(data).hexdigest() == hashlib.sha256(repo).hexdigest()
│ +    print(f"{m}: HTTP {code}, live {len(data)} B / repo {len(repo)} B, "
│ +          f"sha256 {hashlib.sha256(repo).hexdigest()[:16]}, LYGUS={same}, bandymai={attempts}")
│ +
│ +# auxiliary files
│ +for rel in ["content/lt/grade-01/index.json", "content/lt/grade-01/path.json",
│ +            "content/lt/grades.json", "assets/audio/lt/manifest.json"]:
│ +    repo = (root / rel).read_bytes()
│ +    url = base + rel
│ +    code = None
│ +    data = b""
│ +    attempts = 0
│ +    for attempt in range(3):
│ +        attempts = attempt + 1
│ +        try:
│ +            with urllib.request.urlopen(url, timeout=30) as r:
│ +                code = r.status
│ +                data = r.read()
│ +            if code == 200:
│ +                break
│ +        except Exception as e:
│ +            code = f"ERR {e}"
│ +    same = code == 200 and hashlib.sha256(data).hexdigest() == hashlib.sha256(repo).hexdigest()
│ +    print(f"{rel}: HTTP {code}, live {len(data)} B / repo {len(repo)} B, LYGUS={same}, bandymai={attempts}")
│ profiles/deepseek41flash/cache/scratch/pub294_audio.py
│ @@ -0,0 +1,80 @@
│ +import hashlib, json, pathlib, urllib.request, urllib.error, re
│ +from concurrent.futures import ThreadPoolExecutor
│ +
│ +root = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +base = "https://one-man-company.github.io/suprask/"
│ +
│ +
│ +def get(url, attempts=3, timeout=30):
│ +    """GET with retries; returns (status, bytes, attempts). Never raises."""
│ +    last = None
│ +    for i in range(attempts):
│ +        try:
│ +            req = urllib.request.Request(url, headers={"User-Agent": "suprask-publish-check/294"})
│ +            with urllib.request.urlopen(req, timeout=timeout) as r:
│ +                return r.status, r.read(), i + 1
│ +        except urllib.error.HTTPError as e:
│ +            last = (e.code, b"", i + 1)
│ +        except Exception as e:
│ +            last = (f"ERR {type(e).__name__}: {e}", b"", i + 1)
│ +    return last
│ +
│ +
│ +# 1. shell code that #293 changed
│ +for rel in ["assets/js/sims/matematika.js", "assets/js/app.js", "assets/css/main.css"]:
│ +    repo = (root / rel).read_bytes()
│ +    code, data, attempts = get(base + rel)
│ +    same = code == 200 and hashlib.sha256(data).hexdigest() == hashlib.sha256(repo).hexdigest()
│ +    print(f"{rel}: HTTP {code}, live {len(data)} / repo {len(repo)} B, LYGUS={same}, bandymai={attempts}")
│ +
│ +# 2. live index.html version tag
│ +code, html, attempts = get(base + "index.html")
│ +vers = re.findall(rb"\?v=([0-9a-f]{6,40})", html)
│ +print(f"index.html: HTTP {code}, {len(html)} B, ?v= reikšmės: {sorted(set(v.decode() for v in vers))}, bandymai={attempts}")
│ +
│ +man = json.loads((root / "assets/audio/lt/manifest.json").read_text(encoding="utf-8"))
│ +files = sorted({v for entry in man.values() for v in ([entry] if isinstance(entry, str) else entry)}) \
│ +    if isinstance(next(iter(man.values())), (str, list)) else []
│ +# manifest shape may be {text: [f1, f2]} or {text: f} - handle both
│ +paths = set()
│ +for k, v in man.items():
│ +    if isinstance(v, list):
│ +        paths.update(v)
│ +    elif isinstance(v, str):
│ +        paths.add(v)
│ +    elif isinstance(v, dict):
│ +        for vv in v.values():
│ +            if isinstance(vv, list):
│ +                paths.update(vv)
│ +            elif isinstance(vv, str):
│ +                paths.add(vv)
│ +paths = sorted(paths)
│ +disk = {str(p.relative_to(root)) for p in (root / "assets/audio/lt").glob("*.mp3")}
│ +print(f"manifestas: {len(man)} raktų, {len(paths)} unikalių kelių; diske {len(disk)} mp3")
│ +print(f"manifeste bet ne diske: {len(set(paths) - disk)}; diske bet ne manifeste: {len(disk - set(paths))}")
│ +
│ +missing = []
│ +bad = []
│ +done = [0]
│ +
│ +
│ +def check(rel):
│ +    url = base + rel
│ +    code, data, attempts = get(url, attempts=3)
│ +    done[0] += 1
│ +    if code != 200:
│ +        missing.append((rel, code, attempts))
│ +        return
│ +    if len(data) != (root / rel).stat().st_size:
│ +        bad.append((rel, len(data), (root / rel).stat().st_size))
│ +
│ +
│ +rels = ["assets/audio/lt/" + pathlib.Path(p).name if not p.startswith("assets/audio/lt/") else p for p in paths]
│ +with ThreadPoolExecutor(max_workers=8) as ex:
│ +    list(ex.map(check, rels))
│ +
│ +print(f"gyvai patikrinta {done[0]} mp3: 200 = {done[0]-len(missing)}, ne 200 = {len(missing)}, dydis nesutampa = {len(bad)}")
│ +for m in missing[:20]:
│ +    print("  NERA:", m)
│ … omitted 2 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/pub294_audio.py
│ @@ -6,7 +6,6 @@
│
│
│  def get(url, attempts=3, timeout=30):
│ -    """GET with retries; returns (status, bytes, attempts). Never raises."""
│      last = None
│      for i in range(attempts):
│          try:
│ @@ -16,62 +15,45 @@
│          except urllib.error.HTTPError as e:
│              last = (e.code, b"", i + 1)
│          except Exception as e:
│ -            last = (f"ERR {type(e).__name__}: {e}", b"", i + 1)
│ +            last = (f"ERR {type(e).__name__}", b"", i + 1)
│      return last
│
│
│ -# 1. shell code that #293 changed
│  for rel in ["assets/js/sims/matematika.js", "assets/js/app.js", "assets/css/main.css"]:
│      repo = (root / rel).read_bytes()
│      code, data, attempts = get(base + rel)
│      same = code == 200 and hashlib.sha256(data).hexdigest() == hashlib.sha256(repo).hexdigest()
│      print(f"{rel}: HTTP {code}, live {len(data)} / repo {len(repo)} B, LYGUS={same}, bandymai={attempts}")
│
│ -# 2. live index.html version tag
│  code, html, attempts = get(base + "index.html")
│ -vers = re.findall(rb"\?v=([0-9a-f]{6,40})", html)
│ -print(f"index.html: HTTP {code}, {len(html)} B, ?v= reikšmės: {sorted(set(v.decode() for v in vers))}, bandymai={attempts}")
│ +vers = sorted({v.decode() for v in re.findall(rb"\?v=([0-9a-f]{6,40})", html)})
│ +print(f"index.html: HTTP {code}, {len(html)} B, ?v= {vers}, bandymai={attempts}")
│
│  man = json.loads((root / "assets/audio/lt/manifest.json").read_text(encoding="utf-8"))
│ -files = sorted({v for entry in man.values() for v in ([entry] if isinstance(entry, str) else entry)}) \
│ -    if isinstance(next(iter(man.values())), (str, list)) else []
│ -# manifest shape may be {text: [f1, f2]} or {text: f} - handle both
│  paths = set()
│  for k, v in man.items():
│ -    if isinstance(v, list):
│ -        paths.update(v)
│ -    elif isinstance(v, str):
│ -        paths.add(v)
│ -    elif isinstance(v, dict):
│ -        for vv in v.values():
│ -            if isinstance(vv, list):
│ -                paths.update(vv)
│ -            elif isinstance(vv, str):
│ -                paths.add(vv)
│ +    for vv in v.values():
│ +        paths.add("assets/audio/lt/" + vv)
│  paths = sorted(paths)
│ -disk = {str(p.relative_to(root)) for p in (root / "assets/audio/lt").glob("*.mp3")}
│ +disk = {str(p.relative_to(root)) for p in (root / "assets/audio/lt").rglob("*.mp3")}
│  print(f"manifestas: {len(man)} raktų, {len(paths)} unikalių kelių; diske {len(disk)} mp3")
│ -print(f"manifeste bet ne diske: {len(set(paths) - disk)}; diske bet ne manifeste: {len(disk - set(paths))}")
│ +print(f"manifeste bet ne diske: {len(set(paths)-disk)}; diske bet ne manifeste: {len(disk-set(paths))}")
│
│ -missing = []
│ -bad = []
│ +missing, bad = [], []
│  done = [0]
│
│
│  def check(rel):
│ -    url = base + rel
│ -    code, data, attempts = get(url, attempts=3)
│ +    code, data, attempts = get(base + rel, attempts=3)
│      done[0] += 1
│      if code != 200:
│          missing.append((rel, code, attempts))
│ -        return
│ -    if len(data) != (root / rel).stat().st_size:
│ +    elif len(data) != (root / rel).stat().st_size:
│          bad.append((rel, len(data), (root / rel).stat().st_size))
│
│
│ -rels = ["assets/audio/lt/" + pathlib.Path(p).name if not p.startswith("assets/audio/lt/") else p for p in paths]
│  with ThreadPoolExecutor(max_workers=8) as ex:
│ -    list(ex.map(check, rels))
│ +    list(ex.map(check, paths))
│ … omitted 3 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/pub294_appdiff.py
│ @@ -0,0 +1,26 @@
│ +import pathlib, urllib.request, difflib, hashlib
│ +
│ +root = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +url = "https://one-man-company.github.io/suprask/assets/js/app.js"
│ +req = urllib.request.Request(url, headers={"User-Agent": "suprask-publish-check/294"})
│ +with urllib.request.urlopen(req, timeout=30) as r:
│ +    live = r.read()
│ +repo = (root / "assets/js/app.js").read_bytes()
│ +out = pathlib.Path("/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/live_app294.js")
│ +out.write_bytes(live)
│ +outr = pathlib.Path("/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/repo_app294.js")
│ +outr.write_bytes(repo)
│ +print("live", len(live), hashlib.sha256(live).hexdigest()[:16])
│ +print("repo", len(repo), hashlib.sha256(repo).hexdigest()[:16])
│ +
│ +a = live.decode("utf-8").splitlines()
│ +b = repo.decode("utf-8").splitlines()
│ +diff = list(difflib.unified_diff(b, a, fromfile="repo/app.js", tofile="live/app.js", lineterm="", n=2))
│ +print(f"diff eilučių: {len(diff)}")
│ +print("\n".join(diff[:80]))
│ +
│ +# also compare with git versions
│ +import subprocess
│ +for rev in ["HEAD", "b545ef2", "0fa0df8"]:
│ +    blob = subprocess.run(["git", "show", f"{rev}:assets/js/app.js"], cwd=root, capture_output=True).stdout
│ +    print(rev, len(blob), hashlib.sha256(blob).hexdigest()[:16], "== live:", blob == live)
│ profiles/deepseek41flash/cache/scratch/pub294_imports.py
│ @@ -0,0 +1,19 @@
│ +import re, urllib.request, pathlib
│ +
│ +root = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +base = "https://one-man-company.github.io/suprask/"
│ +files = ["assets/js/app.js", "assets/js/registry.js", "assets/js/progress.js",
│ +         "assets/js/speech.js", "index.html"]
│ +pat = re.compile(r'(?:from\s*|import\s*\(\s*)["\'](\./[^"\']+)["\']')
│ +for rel in files:
│ +    req = urllib.request.Request(base + rel, headers={"User-Agent": "suprask-publish-check/294"})
│ +    with urllib.request.urlopen(req, timeout=30) as r:
│ +        txt = r.read().decode("utf-8")
│ +    refs = pat.findall(txt)
│ +    bare = [x for x in refs if "?v=" not in x]
│ +    print(f"{rel}: nuorodų {len(refs)}, be ?v= {len(bare)}")
│ +    for b in bare:
│ +        print("   BE VERSIJOS:", b)
│ +    vv = sorted({m for m in re.findall(r"\?v=([0-9a-f]{6,40})", txt)})
│ +    if vv:
│ +        print(f"   ?v= reikšmės: {vv}")
│ profiles/deepseek41flash/cache/scratch/pub294_index.py
│ @@ -0,0 +1,16 @@
│ +import re, urllib.request
│ +
│ +base = "https://one-man-company.github.io/suprask/"
│ +req = urllib.request.Request(base + "index.html", headers={"User-Agent": "suprask-publish-check/294"})
│ +html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8")
│ +refs = re.findall(r'(?:href|src)="([^"]+)"', html)
│ +for r in refs:
│ +    local = not (r.startswith("http") or r.startswith("#") or r.startswith("mailto") or r.startswith("data:"))
│ +    flag = ""
│ +    if local and r.endswith((".css", ".js")) and "?v=" not in r:
│ +        flag = "  <-- BE VERSIJOS"
│ +    print(f"{r}{flag}")
│ +for m in re.findall(r'<link[^>]+rel="manifest"[^>]*>', html):
│ +    print("manifest:", m)
│ +for m in re.findall(r'<script[^>]*type="module"[^>]*>', html):
│ +    print("module script:", m)
│ profiles/deepseek41flash/cache/scratch/pub294_live_sim.py
│ @@ -0,0 +1,47 @@
│ +"""#294: patikrina, ar #293 taisymas (svg.style.overflow po cssText) pasiekė GYVĄ svetainę
│ +ir ar didžiosios figūros tikrai nelieka nukirptos. Matuoja tikrą atvaizdavimą."""
│ +import sys
│ +from playwright.sync_api import sync_playwright
│ +
│ +URL = "https://one-man-company.github.io/suprask/#/modulis/1/matematika/06-figuros"
│ +
│ +JS = r"""
│ +() => {
│ +  const out = {svgs: [], boxes: []};
│ +  document.querySelectorAll('#sim-stage svg').forEach((s) => {
│ +    const cs = getComputedStyle(s);
│ +    const r = s.getBoundingClientRect();
│ +    out.svgs.push({
│ +      overflow: cs.overflow, ox: cs.overflowX, oy: cs.overflowY,
│ +      inline: s.style.overflow || "(tuščias)",
│ +      w: Math.round(r.width), h: Math.round(r.height),
│ +      size: s.getAttribute('width') || null,
│ +    });
│ +  });
│ +  return out;
│ +}
│ +"""
│ +
│ +with sync_playwright() as p:
│ +    b = p.chromium.launch()
│ +    for w, h in [(360, 780), (1440, 900)]:
│ +        pg = b.new_page(viewport={"width": w, "height": h})
│ +        errs = []
│ +        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
│ +        pg.on("pageerror", lambda e: errs.append(str(e)))
│ +        pg.goto(URL, wait_until="networkidle", timeout=60000)
│ +        pg.wait_for_selector("#sim-stage svg", timeout=20000)
│ +        info = pg.evaluate(JS)
│ +        print(f"--- {w}x{h} ---")
│ +        print(f"svg elementų: {len(info['svgs'])}")
│ +        for s in info["svgs"]:
│ +            print(f"  size={s['size']} w={s['w']} overflow={s['overflow']} "
│ +                  f"(x={s['ox']}, y={s['oy']}) inline={s['inline']}")
│ +        print(f"konsolės klaidos: {len(errs)}")
│ +        for e in errs[:5]:
│ +            print("   ", e)
│ +        # ar kuri nors didžioji figūra (width atributas) turi hidden
│ +        hidden = [s for s in info["svgs"] if s["size"] and s["overflow"] != "visible"]
│ +        print(f"didžiosios figūros su overflow != visible: {len(hidden)}")
│ +        pg.close()
│ +    b.close()
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub294_live_sim.py
│ @@ -23,7 +23,7 @@
│  """
│
│  with sync_playwright() as p:
│ -    b = p.chromium.launch()
│ +    b = p.chromium.launch(executable_path="/home/zoltanas/.local/bin/google-chrome")
│      for w, h in [(360, 780), (1440, 900)]:
│          pg = b.new_page(viewport={"width": w, "height": h})
│          errs = []
ATASKAITA NEPARAŠYTA FAILIKE — baigiau ties iteracijų limitu. Žemiau — visa, ką realiai išmatavau, ir tiksliai tai, kas liko neįrašyta.

SPRENDIMAS: sutampa (repo 39 / paskelbta 39; jokio neatitikimo nė vienoje patikroje)

1. check_published.py — išvestis (rc 0)
   Repozitorija: 39 moduliai
   Paskelbta:    39 moduliai
     · grade-01: repo 39, gyvai 39
   Pervadinti ID (1): 03-sakinio-tvarka → 03-sakinio-zodziai (registruota; žyma už seno ID vaiko naršyklėje lieka — alias mechanizmo nėra, atviras pasiūlymas jau yra)
   ✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, svetainės kodas 17 failų, versija 662d3144)
   Git: HEAD = origin/main = 662d3144, darbinė kopija švari, neišstumtų commit'ų 0.

2. Trys gyvi adresai (HTTP kodas + baitai, 1 bandymas, be pakartojimo reikalo)
   25-ilgis-ir-vienetas → 200, 8812 B / repo 8812 B, sha 34bfc3a0… LYGUS
   03-sakinio-zodziai    → 200, 5459 B / repo 5459 B, sha f267ae9d… LYGUS
   16-vandens-busenos   → 200, 4932 B / repo 4932 B, sha 462f9ed4… LYGUS
   Papildomai: grade-01/index.json 11741 B LYGUS, path.json 1339 B LYGUS, grades.json 1126 B LYGUS, assets/audio/lt/manifest.json 63974 B LYGUS.

3. Svetainės kodas ir #293 taisymas
   assets/js/sims/matematika.js → 200, 159864 B, LYGUS repo (t. y. #293 „overflow po cssText“ taisymas GYVAS, ne tik repo). main.css LYGUS.
   app.js gyvai 31813 B vs repo 31780 B — skirtumas 33 B yra statybos metu įterptas ?v=662d3144 prie 3 importų (pages.yml), ne turinio skirtumas. Patikrinta: app.js 3/3, registry.js 10/10, index.html 1/1 vidinės nuorodos turi ?v=662d3144 = HEAD; nuorodų be versijos 0. #16448 (sed ir viengubos kabutės) šiandien materialiai nepasireiškia.

4. Garsas (vienintelė sritis, kurios jokie vartai netikrina)
   Manifestas 569 raktų → 1138 unikalių kelių; diske 1138 mp3; manifeste-be-disko 0, diske-be-manifesto 0.
   Visi 1138 gyvai: 200 = 1138, ne 200 = 0, dydis nesutampa = 0, visi iš pirmo bandymo. Trukmė 86 s.

5. Kas pasikeitė nuo #290 (b545ef2..HEAD)
   Tik assets/js/sims/matematika.js (+4/−1, #293) ir agents/log/*. Joks content/ JSON, index.json, path.json, grades.json, garsas — nepakito, todėl joks ID ir pažangos raktas nejudėjo.

6. Vartai: validate_content.py --grade 1 --strict → 0 klaidų / 0 įspėjimų rc 0; check_docs_facts.py → 0/0 rc 0 (9 kryptys, 39 moduliai, 39 sim, 169 užduotys, 569 garso tekstai, 1138 įrašai, 15 agentų).

7. Radinys, kurio neįrašiau: #292 ataskaitoje įvardytas pasiūlymas „gyvas garsas vartuose“ NEBUVO įrašytas — agents/proposals/ kataloge tokio failo nėra (patikrinta). Tai trečias rankinis 1138 failų sąvartas (#288, #292, #294).

KAS LIKO NEĮRAŠYTA (dėl mano iteracijų limito, ne dėl kliūties):
   - agents/log/publikavimo-agentas-2026-11-15T0620.md — ši ataskaita
   - research/wiki/changelog.md — eilutė „2026-11-15 (06:20) — Publikavimo patikra #294: repo 39 / paskelbta 39, versija 662d3144, garsas 1138/1138“
   - agents/state.json → last_publish_check (run_id 294, head/main 662d3144, 39/39, decision sutampa)
   - agents/proposals/2026-11-15-publikavimo-agentas-gyvas-garsas-vartuose.json (target scripts/check_published.py, struktura/normal; įrodymas: #288, #292, #294 — 1138/1138 gyvai, 86 s, jokie vartai to nemato)

8. Neįvykdyta ir kita: gyvo puslapio zondas (ar #293 taisymas matomas vaikui 360 ir 1440 px) nepaleistas — Playwright naršyklės dėžė /home/zoltanas/.cache/ms-playwright tuščia. Radau /home/zoltanas/.local/bin/google-chrome ir zondą jau buvau perdaręs jam, bet iki paleidimo nebeliko iteracijų.

Neliesta: content/**, assets/**, scripts/**, docs/**, AGENTS.md, index.json, path.json, grades.json, garsas. Joks ID nepernumeruotas, nieko nešalinta, git push nedarytas. Naujos pamokos nepridėjau — vaiko matomo naujo defekto tipo neradau; 503 atvejis iš #292 nepasikartojo (šįkart 1138/1138 iš pirmo karto).

## klaidos

```
session_id: local-07445fb573a1f8417d16ff4b381c5a49b37ecc13f2d7e84ac8e5b900c52d56e3
```
