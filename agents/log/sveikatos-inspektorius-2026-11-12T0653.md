# sveikatos-inspektorius — 2026-11-12T0653

- paleidimas: #242 (manual)
- trukmė: 454s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/health242.py
│ @@ -0,0 +1,185 @@
│ +#!/usr/bin/env python3
│ +"""SUPRASK sveikatos inspektorius #242 — gyvos svetaines zondas (stdlib)."""
│ +import gzip
│ +import hashlib
│ +import json
│ +import os
│ +import sys
│ +import time
│ +import urllib.request
│ +import urllib.error
│ +
│ +BASE = "https://one-man-company.github.io/suprask"
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +DELAY = 0.35
│ +UA = "suprask-health-probe/242 (+stdlib urllib)"
│ +
│ +
│ +def fetch(url, timeout=30):
│ +    req = urllib.request.Request(url, headers={
│ +        "User-Agent": UA,
│ +        "Accept-Encoding": "gzip",
│ +        "Accept": "*/*",
│ +    })
│ +    t0 = time.time()
│ +    try:
│ +        with urllib.request.urlopen(req, timeout=timeout) as r:
│ +            raw = r.read()
│ +            ttfb = time.time() - t0
│ +            code = r.status
│ +            enc = r.headers.get("Content-Encoding", "")
│ +            ctype = r.headers.get("Content-Type", "")
│ +            lm = r.headers.get("Last-Modified", "")
│ +            cache = r.headers.get("Cache-Control", "")
│ +            body = gzip.decompress(raw) if enc == "gzip" else raw
│ +            return {
│ +                "code": code, "ttfb": ttfb, "wire": len(raw),
│ +                "body": len(body), "bytes": body, "ctype": ctype,
│ +                "last_modified": lm, "cache_control": cache,
│ +                "encoding": enc, "ok": True, "error": None,
│ +            }
│ +    except urllib.error.HTTPError as e:
│ +        body = b""
│ +        try:
│ +            body = e.read()
│ +        except Exception:
│ +            pass
│ +        return {"code": e.code, "ttfb": time.time() - t0, "wire": len(body),
│ +                "body": len(body), "bytes": body, "ctype": "",
│ +                "last_modified": "", "cache_control": "", "encoding": "",
│ +                "ok": False, "error": "HTTP %s" % e.code}
│ +    except Exception as e:  # noqa: BLE001
│ +        return {"code": 0, "ttfb": time.time() - t0, "wire": 0, "body": 0,
│ +                "bytes": b"", "ctype": "", "last_modified": "",
│ +                "cache_control": "", "encoding": "", "ok": False,
│ +                "error": "%s: %s" % (type(e).__name__, e)}
│ +
│ +
│ +def local_sha(relpath):
│ +    p = os.path.join(ROOT, relpath)
│ +    if not os.path.exists(p):
│ +        return None
│ +    h = hashlib.sha256()
│ +    with open(p, "rb") as f:
│ +        for chunk in iter(lambda: f.read(65536), b""):
│ +            h.update(chunk)
│ +    return h.hexdigest()
│ +
│ +
│ +def main():
│ +    idx = json.load(open(os.path.join(ROOT, "content/lt/grade-01/index.json")))
│ +    mods = []
│ +    for s in idx["strands"]:
│ +        for m in s["modules"]:
│ +            mods.append((s["id"], m["id"], m["file"]))
│ +
│ +    core = [
│ +        ("", "index.html (root)"),
│ +        ("/index.html", "index.html"),
│ … omitted 107 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/verify242.py
│ @@ -0,0 +1,184 @@
│ +#!/usr/bin/env python3
│ +"""#242 antra dalis: versijos žymos normalizavimas, skaičiai, garso imtis, svoris."""
│ +import gzip
│ +import hashlib
│ +import json
│ +import os
│ +import re
│ +import time
│ +import urllib.request
│ +import urllib.error
│ +
│ +BASE = "https://one-man-company.github.io/suprask"
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +DELAY = 0.35
│ +STAMP = re.compile(rb"\?v=[0-9a-f]{8}")
│ +UA = "suprask-health-probe/242 (+stdlib urllib)"
│ +
│ +
│ +def fetch(url, head=False):
│ +    req = urllib.request.Request(url, headers={
│ +        "User-Agent": UA, "Accept-Encoding": "gzip", "Accept": "*/*"},
│ +        method="HEAD" if head else "GET")
│ +    t0 = time.time()
│ +    try:
│ +        with urllib.request.urlopen(req, timeout=30) as r:
│ +            raw = b"" if head else r.read()
│ +            enc = r.headers.get("Content-Encoding", "")
│ +            body = gzip.decompress(raw) if enc == "gzip" else raw
│ +            return {"code": r.status, "t": time.time() - t0, "bytes": body,
│ +                    "wire": len(raw), "cl": r.headers.get("Content-Length", ""),
│ +                    "ctype": r.headers.get("Content-Type", ""), "err": None}
│ +    except urllib.error.HTTPError as e:
│ +        return {"code": e.code, "t": time.time() - t0, "bytes": b"", "wire": 0,
│ +                "cl": "", "ctype": "", "err": "HTTP %s" % e.code}
│ +    except Exception as e:  # noqa: BLE001
│ +        return {"code": 0, "t": time.time() - t0, "bytes": b"", "wire": 0,
│ +                "cl": "", "ctype": "", "err": str(e)}
│ +
│ +
│ +def sha(b):
│ +    return hashlib.sha256(b).hexdigest()
│ +
│ +
│ +head_sha = os.popen("git -C %s rev-parse HEAD" % ROOT).read().strip()
│ +log = []
│ +log.append("HEAD %s" % head_sha)
│ +
│ +# 1. Versijos žymos normalizavimas tiems failams, kurie skyrėsi
│ +stamped = ["index.html", "assets/js/app.js", "assets/js/registry.js",
│ +           "assets/js/sims/daile.js", "assets/js/sims/dorinis.js",
│ +           "assets/js/sims/geometrija.js", "assets/js/sims/gyvenimas.js",
│ +           "assets/js/sims/pasaulis.js", "assets/js/sims/technologijos.js",
│ +           "assets/js/sims/zaidimai.js", "assets/js/sims/matematika.js",
│ +           "assets/js/sims/muzika.js", "assets/js/sims/calba.js",
│ +           "assets/js/progress.js", "assets/js/speech.js",
│ +           "assets/js/sims/art.js"]
│ +print("--- normalizuotas palyginimas (nuimta ?v=<sha8>) ---")
│ +norm_ok = norm_bad = 0
│ +for rel in stamped:
│ +    r = fetch(BASE + "/" + rel)
│ +    time.sleep(DELAY)
│ +    live_n = STAMP.sub(b"", r["bytes"])
│ +    with open(os.path.join(ROOT, rel), "rb") as f:
│ +        loc = f.read()
│ +    same = sha(live_n) == sha(loc)
│ +    stamps = set(STAMP.findall(r["bytes"]))
│ +    if same:
│ +        norm_ok += 1
│ +    else:
│ +        norm_bad += 1
│ +    print("%-32s %s  zyma=%s" % (rel, "MATCH" if same else "DIFF", sorted(s.decode() for s in stamps)))
│ +print("normalizuota: %d/%d sutampa, %d skiriasi" % (norm_ok, norm_ok + norm_bad, norm_bad))
│ +
│ +# 2. Gyvas index.json vs lokalus
│ +print("--- turinio skaiciai ---")
│ +live_idx = json.loads(fetch(BASE + "/content/lt/grade-01/index.json")["bytes"])
│ +time.sleep(DELAY)
│ +loc_idx = json.load(open(os.path.join(ROOT, "content/lt/grade-01/index.json")))
│ … omitted 106 diff line(s) across 1 additional file(s)/section(s)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/verify242.py
│ @@ -83,9 +83,9 @@
│      live_ids == loc_ids))
│  live_grades = json.loads(fetch(BASE + "/content/lt/grades.json")["bytes"])
│  time.sleep(DELAY)
│ -g1 = [x for x in live_grades if x.get("grade") == 1]
│ +g1 = [x for x in live_grades["grades"] if x.get("grade") == 1]
│  print("grades.json 1 klase:", g1[0].get("modules"), "moduliai, status",
│ -      g1[0].get("status"), "| viso irasu", len(live_grades))
│ +      g1[0].get("status"), "| viso irasu", len(live_grades["grades"]))
│  live_path = json.loads(fetch(BASE + "/content/lt/grade-01/path.json")["bytes"])
│  time.sleep(DELAY)
│  seq = live_path.get("sequence", [])
│ profiles/deepseek41flash/cache/scratch/audio242.py
│ @@ -0,0 +1,60 @@
│ +#!/usr/bin/env python3
│ +"""#242 garso imtis per HTTPS — kelias /assets/audio/lt/<raktas>.mp3."""
│ +import gzip
│ +import json
│ +import os
│ +import time
│ +import urllib.request
│ +import urllib.error
│ +
│ +BASE = "https://one-man-company.github.io/suprask"
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +DELAY = 0.35
│ +UA = "suprask-health-probe/242 (+stdlib urllib)"
│ +
│ +
│ +def head(url):
│ +    req = urllib.request.Request(url, headers={"User-Agent": UA}, method="HEAD")
│ +    t0 = time.time()
│ +    try:
│ +        with urllib.request.urlopen(req, timeout=30) as r:
│ +            r.read()
│ +            return r.status, r.headers.get("Content-Length", ""), time.time() - t0
│ +    except urllib.error.HTTPError as e:
│ +        return e.code, "", time.time() - t0
│ +    except Exception:  # noqa: BLE001
│ +        return 0, "", time.time() - t0
│ +
│ +
│ +man = json.load(open(os.path.join(ROOT, "assets/audio/lt/manifest.json")))
│ +keys = sorted(man)
│ +sample = []
│ +step = max(1, len(keys) // 20)
│ +for k in keys[::step][:20]:
│ +    for v in ("n", "s"):
│ +        sample.append(man[k][v])
│ +print("manifest raktai", len(keys), "| imtis", len(sample))
│ +ok = bad = 0
│ +sizes_bad = []
│ +times = []
│ +for rel in sample:
│ +    url = BASE + "/assets/audio/lt/" + rel
│ +    code, cl, t = head(url)
│ +    times.append(t)
│ +    time.sleep(DELAY)
│ +    if code == 200:
│ +        ok += 1
│ +        lp = os.path.join(ROOT, "assets/audio/lt", rel)
│ +        ls = os.path.getsize(lp) if os.path.exists(lp) else None
│ +        if not ls:
│ +            sizes_bad.append((rel, "nera lokaliai"))
│ +        elif cl and int(cl) != ls:
│ +            sizes_bad.append((rel, cl, ls))
│ +    else:
│ +        bad += 1
│ +        print("BAD", code, rel)
│ +print("%d/%d 200 | dydzio neatitikimu %d | tarp %d-%d varzybos %.2f-%.2f s" % (
│ +    ok, len(sample), len(sizes_bad), min(step, len(keys)), min(step * 20, len(keys)),
│ +    min(times), max(times)))
│ +if sizes_bad:
│ +    print("SIZE", sizes_bad[:5])
│ profiles/deepseek41flash/cache/scratch/numbers242.py
│ @@ -0,0 +1,80 @@
│ +#!/usr/bin/env python3
│ +"""#242 turinio skaiciai ir sim registras (gyva vs lokalu)."""
│ +import gzip
│ +import json
│ +import os
│ +import re
│ +import time
│ +import urllib.request
│ +
│ +BASE = "https://one-man-company.github.io/suprask"
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +DELAY = 0.35
│ +UA = "suprask-health-probe/242 (+stdlib urllib)"
│ +
│ +
│ +def get(path):
│ +    req = urllib.request.Request(BASE + path, headers={
│ +        "User-Agent": UA, "Accept-Encoding": "gzip"})
│ +    with urllib.request.urlopen(req, timeout=30) as r:
│ +        raw = r.read()
│ +        enc = r.headers.get("Content-Encoding", "")
│ +        return json.loads((gzip.decompress(raw) if enc == "gzip" else raw).decode("utf-8"))
│ +
│ +
│ +idx = json.load(open(os.path.join(ROOT, "content/lt/grade-01/index.json")))
│ +loc_ids = [m["id"] for s in idx["strands"] for m in s["modules"]]
│ +live_idx = get("/content/lt/grade-01/index.json")
│ +time.sleep(DELAY)
│ +live_ids = [m["id"] for s in live_idx["strands"] for m in s["modules"]]
│ +print("index.json: live %d kryptys / %d moduliai | local %d / %d | id sutampa: %s" % (
│ +    len(live_idx["strands"]), len(live_ids), len(idx["strands"]), len(loc_ids),
│ +    live_ids == loc_ids))
│ +
│ +g = get("/content/lt/grades.json")
│ +time.sleep(DELAY)
│ +g1 = [x for x in g["grades"] if x["grade"] == 1][0]
│ +print("grades.json: 1 kl. %s, %s moduliai, atnaujinta %s" % (
│ +    g1["status"], g1.get("modules"), g.get("updated")))
│ +
│ +p = get("/content/lt/grade-01/path.json")
│ +time.sleep(DELAY)
│ +seq = p["sequence"]
│ +print("path.json: %d zingsniai | ne indekse %s | indekse ne kelyje %s" % (
│ +    len(seq), sorted(set(seq) - set(live_ids)), sorted(set(live_ids) - set(seq))))
│ +
│ +m = get("/assets/audio/lt/manifest.json")
│ +time.sleep(DELAY)
│ +lm = json.load(open(os.path.join(ROOT, "assets/audio/lt/manifest.json")))
│ +print("manifest: live %d raktai, local %d, identiskas %s" % (len(m), len(lm), m == lm))
│ +disk_n = len(os.listdir(os.path.join(ROOT, "assets/audio/lt/n")))
│ +disk_s = len(os.listdir(os.path.join(ROOT, "assets/audio/lt/s")))
│ +print("garso failai diske: n %d + s %d = %d" % (disk_n, disk_s, disk_n + disk_s))
│ +
│ +src = ""
│ +for f in sorted(os.listdir(os.path.join(ROOT, "assets/js/sims"))):
│ +    if f.endswith(".js"):
│ +        src += open(os.path.join(ROOT, "assets/js/sims", f), encoding="utf-8").read()
│ +keys = set(re.findall(r'^\s{2}"([a-z0-9-]+)":\s*\{', src, re.M))
│ +used = {}
│ +for s in idx["strands"]:
│ +    for e in s["modules"]:
│ +        mod = json.load(open(os.path.join(ROOT, "content/lt", e["file"])))
│ +        c = (mod.get("sim") or {}).get("component")
│ +        if c:
│ +            used.setdefault(c, []).append(e["id"])
│ +missing = [(v, k) for k, v in used.items() if k not in keys]
│ +print("SIMS raktai %d | registruota sim %d moduliuose, %d unikalus | truksta %s | nenaudojami %s" % (
│ +    len(keys), sum(len(v) for v in used.values()), len(used), missing or "0",
│ +    sorted(keys - set(used)) or "0"))
│ +
│ +tasks = 0
│ +for s in idx["strands"]:
│ +    for e in s["modules"]:
│ +        mod = json.load(open(os.path.join(ROOT, "content/lt", e["file"])))
│ +        tasks += len(mod["tasks"])
│ +print("uzduotys (local):", tasks)
│ +bykey = {}
│ +for s in idx["strands"]:
│ … omitted 2 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/sims242.py
│ @@ -0,0 +1,61 @@
│ +#!/usr/bin/env python3
│ +"""#242 sim registras: SIMS raktai (ir trumpieji identifikatoriai) vs moduliu sim.component."""
│ +import json
│ +import os
│ +import re
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +SIMS_DIR = os.path.join(ROOT, "assets/js/sims")
│ +
│ +keys = {}
│ +for fname in sorted(os.listdir(SIMS_DIR)):
│ +    if not fname.endswith(".js"):
│ +        continue
│ +    text = open(os.path.join(SIMS_DIR, fname), encoding="utf-8").read()
│ +    start = text.find("export const SIMS = {")
│ +    if start < 0:
│ +        continue
│ +    i = text.index("{", start)
│ +    depth = 0
│ +    for j in range(i, len(text)):
│ +        if text[j] == "{":
│ +            depth += 1
│ +        elif text[j] == "}":
│ +            depth -= 1
│ +            if depth == 0:
│ +                block = text[i + 1:j]
│ +                break
│ +    else:
│ +        block = ""
│ +    for line in block.splitlines():
│ +        s = line.strip().rstrip(",")
│ +        if not s or s.startswith("//"):
│ +            continue
│ +        m = re.match(r'^"([\w-]+)"\s*:', s)
│ +        if m:
│ +            keys[m.group(1)] = fname
│ +            continue
│ +        m = re.match(r"^'([\w-]+)'\s*:", s)
│ +        if m:
│ +            keys[m.group(1)] = fname
│ +            continue
│ +        m = re.match(r"^([A-Za-z_$][\w$]*)\s*,?$", s)
│ +        if m:
│ +            keys[m.group(1)] = fname
│ +
│ +idx = json.load(open(os.path.join(ROOT, "content/lt/grade-01/index.json")))
│ +used = {}
│ +for s in idx["strands"]:
│ +    for e in s["modules"]:
│ +        mod = json.load(open(os.path.join(ROOT, "content/lt", e["file"])))
│ +        c = (mod.get("sim") or {}).get("component")
│ +        if c:
│ +            used[c] = e["id"]
│ +missing = {k: v for k, v in used.items() if k not in keys}
│ +print("SIMS raktai", len(keys), "| moduliai su sim", len(used),
│ +      "| truksta", len(missing), "| nenaudojami", sorted(set(keys) - set(used)))
│ +for k, v in missing.items():
│ +    print("MISSING", k, "->", v)
│ +for k, f in sorted(keys.items()):
│ +    if k not in used:
│ +        print("UNUSED", k, f)
Neigiu iteracijų limitą — bet darbo rezultatai jau gauti, tik ataskaitos failas ir state.json liko neįrašyti. Pateikiu viską, ką išmatavau, kad niekas neprapultų.

## SPRENDIMAS: gyva svetainė VEIKIA. Jokių 404, jokio issue kurti nereikia.

Tikrinta 2026-11-12 ~06:54–07:02 EET, HTTP/2, GitHub Pages, po 2 bandymus kas 350 ms.

### Ką tikrinau (visi 200 abiem bandymais, JSON validus)
- 59 URL: pradžia, index.html, main.css, app.js, registry.js, progress.js, speech.js, art.js, grades.json, grade-01/index.json, path.json, audio manifest, visi 10 sim failų, visi 37 modulių JSON.
- 37 modulių JSON per HTTPS: 200, validus JSON, baitai sutampa su disku (sha256).
- Sim registras: 37 SIMS raktų, 37 modulių su sim, 0 trūkstamų, 0 nenaudojamų.
- 543 manifest raktai × 2 = 1086 mp3; imtis 40 failų HEAD: 40/40 200, dydis sutampa su lokaliu.
- check_view.py prieš GYVĄ bazę: phone+small 74 patikros (37×2), 0 problemų; desktop 37 patikros, 0 problemų.
- Pradžia: 200, ttfb 5 matavimai 0,168 / 0,199 / 0,203 / 0,197 / 0,448 s (0,675 s pirmas šaltas CDN praėjimas — ne defektas).
- Publikuota = main HEAD: `?v=5dc02ae2` = HEAD `5dc02ae2`; po `?v=` nuėmimo 16/16 failų sha256 sutampa; deploy last-modified 04:27:37 GMT, commit 06:27:10 → 27 s. index.json 11209 B, grades.json 1126 B — kaip publikavimo ataskaitoje.
- Turinys gyvai: 9 kryptys / 37 moduliai / 161 užduotis / path.json 37 žingsnių (0 už indekso, 0 indekse ne kelyje), grades.json „live, 37". Manifest identiškas lokaliajam.
- Svoris: pirmas užkrovimas 17 failų = 159 374 B gzip / 530 753 B raw (matematika.js 42,0 gzip / 159,0 raw — didžiausias kodas; css 10,3 gzip). Modulio JSON vid. 5736 B. Didžiausias failas apskritai — mp3 72 140 B (`n/e21d097bc4fb939d-ec6b99c3.mp3`).
- TLS: Let's Encrypt YR1, galioja iki 2026-12-29; http:// → https:// 301. Jokių išorinių resursų: CSS be url(http)/@import; JS „http" — tik SVG NS ir teksto nuorodos.

### Mano paties zondo klaida (ne svetainės defektas)
Pirmas garso zondas statė `/n/...` vietoj `/assets/audio/lt/n/...` → 40/40 404. Tai buvo zondo adreso klaida; pataisius 40/40 200. Fiksuoti kaip defektą būtų LL-45 šeimos klaida (kaltinti svetainę dėl zondo).

### LIKO NEPADARYTA (vienas žingsnis, reikia kito paleidimo arba rankinio įrašymo)
1. `agents/log/sveikatos-inspektorius-2026-11-12T0654.md` — lentelė su visais 59 URL (duomenys: `/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/health242.json`, `audio242.py` išvestis, `numbers242.py`, `sims242.py`).
2. `agents/state.json` → `roles["sveikatos-inspektorius"]`: last_run `2026-11-12T07:02`, status `published`, log aukščiau, modules 37, sims 37, audio 1086, issue null.
3. Jokio issue nekurti.

### Pastabos, ne defektai
- Registro `registry.js` statinis importas reiškia, kad pradžia parsisiunčia visas 10 simuliacijų (159 KB gzip) net neatidarius modulio — augant klasėms svoris augs tiesiškai.
- `check_published.py` vis dar nelygina index/path/grades/manifest baitų (atviras #8716) — šiandien tai padariau atskiru zond'u, sutapo 1:1.

Naujų pamokų nepridėjau: rasti defektai ne egzistuoja, o mano zondo adreso klaida jau padengta esamų pamokų (zondo, o ne sistemos matavimas).

## klaidos

```
session_id: local-bf1fae6237ce897249c328ed57fdf268f048ea8a918e85c0a8f4280faab81316
```
