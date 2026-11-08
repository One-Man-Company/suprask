# publikavimo-agentas — 2026-11-08T1231

- paleidimas: #168 (manual)
- trukmė: 196s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub168.py
│ @@ -0,0 +1,101 @@
│ +"""Run 168 publikavimo patikra: repo vs gyva svetaine, baitais, ne tik ID sąrašais."""
│ +import hashlib
│ +import json
│ +import pathlib
│ +import subprocess
│ +import urllib.request
│ +
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +LIVE = "https://one-man-company.github.io/suprask/"
│ +
│ +
│ +def get(url):
│ +    req = urllib.request.Request(url, headers={"User-Agent": "suprask-check/1.0"})
│ +    with urllib.request.urlopen(req, timeout=25) as r:
│ +        return r.status, r.read()
│ +
│ +
│ +def head_bytes(rel):
│ +    return subprocess.run(['git', 'show', 'HEAD:' + rel], cwd=ROOT, capture_output=True).stdout
│ +
│ +
│ +idx = json.loads((ROOT / 'content/lt/grade-01/index.json').read_text(encoding='utf-8'))
│ +mods = [m for s in idx['strands'] for m in s['modules']]
│ +print("--- 1. indeksas ---")
│ +print("krypčių:", len(idx['strands']), "modulių:", len(mods), "unikalūs ID:", len({m['id'] for m in mods}))
│ +for s in idx['strands']:
│ +    print(f"  {s['id']}: {len(s['modules'])}")
│ +
│ +print("--- 2. failai ---")
│ +missing, bad_id, bad_strand, bad_grade = [], [], [], []
│ +strand_of = {m['id']: s['id'] for s in idx['strands'] for m in s['modules']}
│ +for m in mods:
│ +    p = ROOT / 'content' / 'lt' / m['file']
│ +    if not p.exists():
│ +        missing.append(m['id'])
│ +        continue
│ +    d = json.loads(p.read_text(encoding='utf-8'))
│ +    if d.get('id') != m['id']:
│ +        bad_id.append((m['id'], d.get('id')))
│ +    if d.get('strand') != strand_of[m['id']]:
│ +        bad_strand.append((m['id'], d.get('strand'), strand_of[m['id']]))
│ +    if d.get('grade') != 1:
│ +        bad_grade.append((m['id'], d.get('grade')))
│ +print("nėra failo:", missing)
│ +print("ID nesutampa su failo vardu:", bad_id)
│ +print("strand nesutampa su indeksu:", bad_strand)
│ +print("grade != 1:", bad_grade)
│ +print("failų pavadinimų unikalumas:", len({m['file'] for m in mods}) == len(mods))
│ +
│ +print("--- 3. path.json ---")
│ +seq = json.loads((ROOT / 'content/lt/grade-01/path.json').read_text(encoding='utf-8'))['sequence']
│ +ids = {m['id'] for m in mods}
│ +print("įrašų:", len(seq), "unikalūs:", len(set(seq)))
│ +print("indekse bet ne kelyje:", [m['id'] for m in mods if m['id'] not in seq])
│ +print("kelyje bet ne indekse:", [s for s in seq if s not in ids])
│ +print("path.json lygus HEAD:", (ROOT / 'content/lt/grade-01/path.json').read_bytes() == head_bytes('content/lt/grade-01/path.json'))
│ +
│ +print("--- 4. HEAD medis ---")
│ +head_set = set(subprocess.run(['git', 'ls-tree', '-r', '--name-only', 'HEAD'], cwd=ROOT,
│ +                              capture_output=True, text=True).stdout.split('\n'))
│ +print("HEAD'e nėra modulio failo:", [m['file'] for m in mods if 'content/lt/' + m['file'] not in head_set])
│ +
│ +print("--- 5. gyvi failai baitais vs HEAD ---")
│ +diff, fail = [], []
│ +for m in mods:
│ +    rel = 'content/lt/' + m['file']
│ +    try:
│ +        st, b = get(LIVE + rel)
│ +    except Exception as e:  # noqa: BLE001
│ +        fail.append((m['id'], type(e).__name__, str(e)[:60]))
│ +        continue
│ +    if b != head_bytes(rel):
│ +        diff.append(m['id'])
│ +print("gyvai nepavykę:", fail)
│ +print("gyvi baitai skiriasi nuo HEAD:", diff)
│ +
│ +print("--- 6. index/path/grades gyvai ---")
│ +for rel in ('content/lt/grade-01/index.json', 'content/lt/grade-01/path.json', 'content/lt/grades.json'):
│ … omitted 23 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/sims168.mjs
│ @@ -0,0 +1,43 @@
│ +import fs from "node:fs";
│ +import path from "node:path";
│ +
│ +const SIMDIR = "/home/zoltanas/workspace/suprask/assets/js/sims";
│ +const files = fs.readdirSync(SIMDIR).filter(f => f.endsWith(".js"));
│ +const sims = {};
│ +const noExport = [];
│ +for (const f of files) {
│ +  const m = await import(path.join(SIMDIR, f));
│ +  if (!m.SIMS) { noExport.push(f); continue; }
│ +  for (const [k, v] of Object.entries(m.SIMS)) {
│ +    if (sims[k]) console.log("DUBLIUOJASI raktas:", k, "(", sims[k].file, "ir", f, ")");
│ +    sims[k] = { file: f, mount: typeof v?.mount };
│ +  }
│ +}
│ +console.log("sim failai:", files.length, files.join(", "));
│ +console.log("be SIMS eksporto:", noExport);
│ +const keys = Object.keys(sims);
│ +console.log("registre raktų:", keys.length, "unikalūs:", new Set(keys).size);
│ +console.log("be mount():", keys.filter(k => sims[k].mount !== "function"));
│ +
│ +const idx = JSON.parse(fs.readFileSync("/home/zoltanas/workspace/suprask/content/lt/grade-01/index.json", "utf8"));
│ +const used = [];
│ +const unreg = [];
│ +const perFile = {};
│ +for (const s of idx.strands) for (const mod of s.modules) {
│ +  const d = JSON.parse(fs.readFileSync("/home/zoltanas/workspace/suprask/content/lt/" + mod.file, "utf8"));
│ +  const c = d.sim && d.sim.component;
│ +  if (!c) { console.log("BE sim:", mod.id); continue; }
│ +  used.push(c);
│ +  if (!sims[c]) unreg.push([mod.id, c]);
│ +  else perFile[sims[c].file] = (perFile[sims[c].file] || 0) + 1;
│ +}
│ +console.log("modulių su sim:", used.length, "unikalūs sim:", new Set(used).size);
│ +console.log("NEREGISTRUOTA:", unreg);
│ +console.log("registre bet nenaudojama:", keys.filter(k => !used.includes(k)));
│ +console.log("pagal failą:", perFile);
│ +
│ +// registry.js importų sąrašas
│ +const reg = fs.readFileSync("/home/zoltanas/workspace/suprask/assets/js/registry.js", "utf8");
│ +const imported = [...reg.matchAll(/from\s+"[^"]*sims\/([a-z]+)\.js"/g)].map(m => m[1] + ".js");
│ +console.log("registry.js importuoja:", imported.join(", "));
│ +console.log("sim failai, kurių registry.js neimportuoja:", files.filter(f => f !== "art.js" && !imported.includes(f)));
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/sims168.mjs
│ @@ -1,5 +1,14 @@
│  import fs from "node:fs";
│  import path from "node:path";
│ +
│ +// minimalus naršyklės stub'as: muzika.js skaito window.AudioContext modulio lygmenyje
│ +globalThis.window = globalThis;
│ +globalThis.document = {
│ +  createElement: () => ({ style: {}, setAttribute() {}, appendChild() {}, addEventListener() {}, remove() {} }),
│ +  addEventListener() {}, removeEventListener() {}, querySelector: () => null, body: {},
│ +};
│ +globalThis.AudioContext = class { constructor() {} };
│ +globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
│
│  const SIMDIR = "/home/zoltanas/workspace/suprask/assets/js/sims";
│  const files = fs.readdirSync(SIMDIR).filter(f => f.endsWith(".js"));
│ profiles/deepseek41flash/cache/scratch/assets168.py
│ @@ -0,0 +1,48 @@
│ +"""assets/ ir index.html: gyvi failai vs HEAD baitais, su ?v=<sha> normalizavimu (LL-41)."""
│ +import pathlib
│ +import re
│ +import subprocess
│ +import urllib.request
│ +
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +LIVE = "https://one-man-company.github.io/suprask/"
│ +V = re.compile(rb'\?v=[0-9a-f]{6,40}')
│ +
│ +
│ +def get(url):
│ +    req = urllib.request.Request(url, headers={"User-Agent": "suprask-check/1.0"})
│ +    with urllib.request.urlopen(req, timeout=30) as r:
│ +        return r.status, r.read()
│ +
│ +
│ +files = subprocess.run(['git', 'ls-tree', '-r', '--name-only', 'HEAD'], cwd=ROOT,
│ +                       capture_output=True, text=True).stdout.split()
│ +targets = [f for f in files if f == 'index.html' or f.startswith('assets/js/') or f.startswith('assets/css/')]
│ +
│ +head_sha = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=ROOT, capture_output=True, text=True).stdout.strip()
│ +print("HEAD:", head_sha, "| tikrinamų failų:", len(targets))
│ +
│ +diff_raw, diff_norm, err = [], [], []
│ +versions = set()
│ +for rel in targets:
│ +    head = subprocess.run(['git', 'show', 'HEAD:' + rel], cwd=ROOT, capture_output=True).stdout
│ +    try:
│ +        st, b = get(LIVE + rel)
│ +    except Exception as e:  # noqa: BLE001
│ +        err.append((rel, type(e).__name__, str(e)[:50]))
│ +        continue
│ +    versions.update(m.group(0) for m in V.finditer(b))
│ +    if b == head:
│ +        continue
│ +    diff_raw.append(rel)
│ +    if V.sub(b'', b) == V.sub(b'', head):
│ +        diff_norm.append(rel)
│ +    else:
│ +        print("  TURINYS SKIRIASI (ne tik ?v=):", rel, len(head), "->", len(b))
│ +
│ +print("baitais identiški:", len(targets) - len(diff_raw) - len(err))
│ +print("skiriasi tik ?v= žyma:", diff_norm)
│ +print("skiriasi turiniu:", [d for d in diff_raw if d not in diff_norm])
│ +print("klaidos:", err)
│ +print("gyvos ?v= reikšmės:", sorted(v.decode() for v in versions))
│ +print("ar ?v= atitinka HEAD prefiksą:", all(head_sha.startswith(v.decode().split('=')[1]) for v in versions))
│ profiles/deepseek41flash/cache/scratch/audio168.py
│ @@ -0,0 +1,45 @@
│ +"""Garsas: manifestas gyvai vs HEAD, raktų aibės, mp3 failų pasiekiamumas."""
│ +import json
│ +import subprocess
│ +import urllib.request
│ +from pathlib import Path
│ +
│ +ROOT = Path('/home/zoltanas/workspace/suprask')
│ +LIVE = "https://one-man-company.github.io/suprask/"
│ +REL = "assets/audio/lt/manifest.json"
│ +
│ +
│ +def get(url):
│ +    req = urllib.request.Request(url, headers={"User-Agent": "suprask-check/1.0"})
│ +    with urllib.request.urlopen(req, timeout=30) as r:
│ +        return r.status, r.read()
│ +
│ +
│ +st, live_b = get(LIVE + REL)
│ +head_b = subprocess.run(['git', 'show', 'HEAD:' + REL], cwd=ROOT, capture_output=True).stdout
│ +disk_b = (ROOT / REL).read_bytes()
│ +live = json.loads(live_b)
│ +head = json.loads(head_b)
│ +print(f"manifestas: HTTP {st}, {len(live_b)} B; = HEAD {live_b == head_b}; = diskas {live_b == disk_b}")
│ +print("raktų: live", len(live), "head", len(head), "skirtumas:", set(live) ^ set(head) or "0")
│ +
│ +mp3 = sorted(ROOT.glob("assets/audio/lt/*/*.mp3"))
│ +tracked = subprocess.run(['git', 'ls-tree', '-r', '--name-only', 'HEAD', 'assets/audio/'],
│ +                         cwd=ROOT, capture_output=True, text=True).stdout.split()
│ +print("mp3 diske:", len(mp3), "trackinta HEAD:", len([t for t in tracked if t.endswith('.mp3')]))
│ +missing = [p for p in mp3 if str(p.relative_to(ROOT)) not in set(tracked)]
│ +print("diske bet ne HEAD:", [str(p.relative_to(ROOT)) for p in missing])
│ +
│ +# trys garsiniai adresai
│ +sample = [mp3[0], mp3[len(mp3) // 2], mp3[-1]]
│ +for p in sample:
│ +    rel = str(p.relative_to(ROOT))
│ +    try:
│ +        st2, b = get(LIVE + rel)
│ +        hb = subprocess.run(['git', 'show', 'HEAD:' + rel], cwd=ROOT, capture_output=True).stdout
│ +        print(f"  {st2} {len(b)} B = HEAD {b == hb}  {rel}")
│ +    except Exception as e:  # noqa: BLE001
│ +        print(f"  ERR {rel} {type(e).__name__}")
│ +for v in ("n", "s"):
│ +    n = len([k for k in live if k.startswith(v + "/") or k.startswith(v)])
│ +    print(f"  '{v}' prefikso raktų: {n}")
│ profiles/deepseek41flash/cache/scratch/manifest168.py
│ @@ -0,0 +1,13 @@
│ +import json
│ +from pathlib import Path
│ +
│ +ROOT = Path('/home/zoltanas/workspace/suprask')
│ +m = json.loads((ROOT / "assets/audio/lt/manifest.json").read_text(encoding='utf-8'))
│ +print("tipas:", type(m).__name__, "raktų:", len(m))
│ +ks = list(m.keys())
│ +print("pirmi 5 raktai:", ks[:5])
│ +print("reikšmė pirmo:", json.dumps(m[ks[0]], ensure_ascii=False)[:200])
│ +short = [k for k in ks if not k.startswith(("n/", "s/"))]
│ +print("raktai be n/ ar s/ prefikso:", short[:10], "… iš viso:", len(short))
│ +from collections import Counter
│ +print("prefiksų skaičius:", Counter(k.split('/')[0] for k in ks if '/' in k))
│ profiles/deepseek41flash/cache/scratch/manifest168b.py
│ @@ -0,0 +1,29 @@
│ +import json
│ +from pathlib import Path
│ +
│ +ROOT = Path('/home/zoltanas/workspace/suprask')
│ +m = json.loads((ROOT / 'assets/audio/lt/manifest.json').read_text(encoding='utf-8'))
│ +idx = json.loads((ROOT / 'content/lt/grade-01/index.json').read_text(encoding='utf-8'))
│ +
│ +texts = set()
│ +
│ +
│ +def walk(o):
│ +    if isinstance(o, str):
│ +        texts.add(o)
│ +    elif isinstance(o, dict):
│ +        for v in o.values():
│ +            walk(v)
│ +    elif isinstance(o, list):
│ +        for v in o:
│ +            walk(v)
│ +
│ +
│ +for s in idx['strands']:
│ +    for mod in s['modules']:
│ +        d = json.loads((ROOT / 'content/lt' / mod['file']).read_text(encoding='utf-8'))
│ +        walk((d.get('sim') or {}).get('config') or {})
│ +
│ +print('config tekstų:', len(texts), '| manifesto raktų:', len(m))
│ +print('manifeste, bet ne config:', [k for k in m if k not in texts])
│ +print('config, bet ne manifeste:', [k for k in texts if k not in m])
│ profiles/deepseek41flash/cache/scratch/audio_orphans168.py
│ @@ -0,0 +1,27 @@
│ +"""Našlaičiai garse: manifesto raktai be config teksto ir mp3 failai be manifesto įrašo."""
│ +import json
│ +import sys
│ +from pathlib import Path
│ +
│ +ROOT = Path('/home/zoltanas/workspace/suprask')
│ +sys.path.insert(0, str(ROOT / 'scripts'))
│ +import generate_audio  # noqa: E402
│ +
│ +manifest = json.loads((ROOT / 'assets/audio/lt/manifest.json').read_text(encoding='utf-8'))
│ +texts = set(generate_audio.collect())
│ +print("config tekstų:", len(texts), "| manifesto raktų:", len(manifest))
│ +
│ +orphan_keys = [k for k in manifest if k not in texts]
│ +print("manifesto raktai be config teksto:", orphan_keys)
│ +
│ +referenced = set()
│ +for k, v in manifest.items():
│ +    for var in ('n', 's'):
│ +        if v.get(var):
│ +            referenced.add('assets/audio/lt/' + v[var])
│ +
│ +disk = {str(p.relative_to(ROOT)) for p in (ROOT / 'assets/audio/lt').glob('*/*.mp3')}
│ +print("mp3 diske:", len(disk), "| manifeste referencuota:", len(referenced))
│ +print("failai be manifesto įrašo:", sorted(disk - referenced))
│ +print("manifeste referencuoti, bet diske nėra:", sorted(referenced - disk)[:10])
│ +print("reikia (2 × tekstų):", len(texts) * 2, "| perteklius diske:", len(disk) - len(texts) * 2)
## Publikavimo agento ataskaita — paleidimas #168 (2026-11-08)

### 1. `check_published.py` išvestis

```
Repozitorija: 31 moduliai
Paskelbta:    31 moduliai
✔ Repo ir gyva svetainė sutampa.
```

`--json`: `local 31`, `published 31`, `missing_on_live []`, `hidden_locally []`, `not_in_path []`, `unpushed_commits 0`, `live_error ""`. Darbinė kopija švari, `git rev-list origin/main..HEAD` = 0 ir `HEAD..origin/main` = 0, HEAD = `49952b1`.

### 2. Trys gyvi adresai (HTTP kodai)

```
200  .../content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json      (5044 B)
200  .../content/lt/grade-01/matematika/21-erdvines-figuros.json         (8130 B)
200  .../content/lt/grade-01/gyvenimo-igudziai/01-dovana-ir-noras.json   (5389 B)
```

### 3. Gilesnė patikra (ne tik ID sąrašai — įrankis lygina tik juos)

- **Indeksas:** 7 kryptys, 31 modulis, 31 unikalus ID (lietuvių 4, matematika 15, pasaulio pažinimas 5, muzika 1, žaidimų teorija 3, technologijos 2, gyvenimo įgūdžiai 1).
- **Failai:** visi 31 egzistuoja, `id` sutampa su failo vardu, `strand` su indeksu, `grade` = 1 — 0 neatitikimų. Failų vardai unikalūs.
- **path.json:** 31 įrašas, 31 unikalus; indekse bet ne kelyje — 0; kelyje bet ne indekse — 0. Tvarkos neliečiau.
- **Visi 31 modulių JSON gyvai 200 ir baitais lygūs `git show HEAD:` — 0 skirtumų.** `index.json` (dda1273a…), `path.json` (88ff0a20…), `grades.json` (2ec1e57d…) gyvai = HEAD = diskas; `grades.json` skelbia `"modules": 31`.
- **`assets/` + `index.html`:** 15 failų; 7 baitais identiški, 8 skiriasi **tik** `?v=49952b17` žyma (LL-41), turiniu — 0 skirtumų; žyma = pirmi 8 HEAD simboliai, t. y. gyva svetainė pastatyta būtent iš `49952b1`.
- **Simuliacijų registras — importu per `node`, ne `grep` (LL-13):** 9 sim failai (be `art.js`), registre 31 raktas, 31 unikalus, visi su `mount()`; modulių su `sim` — 31 (31 unikalus komponentas), neregistruotų 0, registre bet nenaudojamų 0, `registry.js` importuoja visus 8 sim failus.
- **Garsas:** `assets/audio/lt/manifest.json` 200, 50 497 B, = HEAD = diskas, 463 tekstai abiejose pusėse (skirtumas 0); mp3 diske 932 = trackinta HEAD 932; trys atsitiktiniai mp3 gyvai 200 ir baitais = HEAD.
- **Vartai:** `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų (rc 0); `check_audio.py` → 462 tekstai, po du įrašus, visi Piper (rc 0).

### 4. Sprendimas

**SUTAMPA** — repo 31 / paskelbta 31, 0 neišstumtų commit'ų, visi 31 moduliai gyvai baitais lygūs HEAD, visi 15 `assets/`/`index.html` failai atitinka HEAD (8 — tik su publikavimo `?v=` žyma), sims 31/31, garsas 463/463.

Nieko nešalinau, ID nepernumeravau, `path.json` nekeičiau, `git push` nedariau, turinio/CSS/simuliacijų neliečiau.

### 5. Pastaba už vaidmens ribų

Garso manifeste 463 raktai, o `generate_audio.collect()` renka 462 tekstus, ir diske 932 mp3 prie 924 reikalingų (462 × 2) — vadinasi, yra ~1 negrojančio manifesto rakto pora ir ~6 failai, kurių manifestas nereferencija. Tai nepakenkia vaikui (visi 462 reikalingi įrašai yra), bet `check_audio.py` našlaičių nemato — jis tikrina tik trūkstamus. Tikslią aibių sudėtį tikrinantis zondas (`audio_orphans168.py`) buvo parengtas, bet paleistas nebuvo: sesijos žingsnių limitas. Ataskaita į `agents/log/`, `research/wiki/changelog.md` eilutė ir `agents/state.json` taip pat neįrašyti dėl tos pačios priežasties — juos reikia užbaigti kitame paleidime (arba aš tai padarysiu, jei leisite dar vieną žingsnį). Viskas, kas čia teigiama apie repo ir gyvą svetainę, remiasi realia `check_published.py`, `pub168.py`, `sims168.mjs`, `assets168.py`, `audio168.py` išvestimi.

## klaidos

```
session_id: local-a43d303f62a8e5f4b66d1419bf019b97b2156fb9f077994897df158eca34272f
```
