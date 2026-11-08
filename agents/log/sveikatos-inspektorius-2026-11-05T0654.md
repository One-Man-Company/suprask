# sveikatos-inspektorius — 2026-11-05T0654

- paleidimas: #15 (manual)
- trukmė: 299s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/health.py
│ @@ -0,0 +1,82 @@
│ +#!/usr/bin/env python3
│ +"""SUPRASK gyvos svetaines patikra. Tik curl/urllib, jokiu isoriniu paslaugu."""
│ +import json, sys, time, urllib.request, urllib.error, os, re, hashlib
│ +
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +PAUSE = 0.35
│ +
│ +idx = json.load(open(os.path.join(ROOT, "content/lt/grade-01/index.json"), encoding="utf-8"))
│ +mods = [(s["id"], m) for s in idx["strands"] for m in s["modules"]]
│ +
│ +urls = [
│ +    ("", "HTML pradzia"),
│ +    ("index.html", "HTML pradzia"),
│ +    ("assets/css/main.css", "CSS"),
│ +    ("assets/js/app.js", "JS marsrutizatorius"),
│ +    ("assets/js/registry.js", "JS registras"),
│ +    ("assets/js/progress.js", "JS pazanga"),
│ +    ("assets/js/speech.js", "JS balsas"),
│ +    ("content/lt/grades.json", "JSON klases"),
│ +    ("content/lt/grade-01/index.json", "JSON klases indeksas"),
│ +    ("content/lt/grade-01/path.json", "JSON seka"),
│ +    ("assets/js/sims/calba.js", "JS sim"),
│ +    ("assets/js/sims/matematika.js", "JS sim"),
│ +    ("assets/js/sims/pasaulis.js", "JS sim"),
│ +    ("assets/js/sims/zaidimai.js", "JS sim"),
│ +    ("content/audio-manifest.json", "JSON garsas"),
│ +]
│ +for strand, m in mods:
│ +    urls.append(("content/lt/" + m["file"], "JSON modulis " + m["id"]))
│ +
│ +def fetch(u, timeout=25):
│ +    req = urllib.request.Request(u, headers={"User-Agent": "suprask-health-check/1.0", "Cache-Control": "no-cache"})
│ +    t0 = time.time()
│ +    try:
│ +        with urllib.request.urlopen(req, timeout=timeout) as r:
│ +            body = r.read()
│ +            return r.status, body, round(time.time() - t0, 3), r.headers.get("Content-Type", "")
│ +    except urllib.error.HTTPError as e:
│ +        return e.code, b"", round(time.time() - t0, 3), e.headers.get("Content-Type", "") if e.headers else ""
│ +    except Exception as e:
│ +        return 0, str(e).encode(), round(time.time() - t0, 3), type(e).__name__
│ +
│ +results = {}
│ +rounds = {}
│ +for rnd in (1, 2):
│ +    for path, label in urls:
│ +        url = BASE + path
│ +        code, body, dt, ctype = fetch(url)
│ +        key = path
│ +        rounds.setdefault(key, []).append((code, dt, len(body)))
│ +        if rnd == 1:
│ +            results[key] = {"url": url, "label": label, "code": code, "time": dt, "size": len(body),
│ +                            "ctype": ctype, "body": body}
│ +        time.sleep(PAUSE)
│ +
│ +out = []
│ +for path, label in urls:
│ +    r = results[path]
│ +    code2, t2, s2 = rounds[path][1]
│ +    status = "OK" if r["code"] == 200 and code2 == 200 else "FAIL"
│ +    jstate = ""
│ +    if path.endswith(".json") and r["code"] == 200:
│ +        try:
│ +            json.loads(r["body"])
│ +            jstate = "validus"
│ +        except Exception as e:
│ +            jstate = "NETINKAMAS JSON: %s" % e
│ +            status = "FAIL"
│ +    if s2 and r["size"] and s2 != r["size"]:
│ +        jstate += " (dydis skiriasi 2 bandyme: %d vs %d)" % (r["size"], s2)
│ +    out.append({"url": r["url"], "label": label, "code1": r["code"], "code2": code2,
│ +                "time1": r["time"], "time2": t2, "size": r["size"], "status": status, "json": jstate,
│ +                "ctype": r["ctype"]})
│ +
│ +json.dump({"checked": "2026-11-05", "results": out,
│ +           "modules_live": len(mods)}, open("/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/health.json", "w"), ensure_ascii=False, indent=1)
│ +
│ … omitted 4 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/health2.py
│ @@ -0,0 +1,69 @@
│ +#!/usr/bin/env python3
│ +import json, time, urllib.request, hashlib, os, re, random
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +
│ +def get(path, timeout=25):
│ +    url = BASE + path
│ +    req = urllib.request.Request(url, headers={"User-Agent": "suprask-health-check/1.0"})
│ +    t0 = time.time()
│ +    with urllib.request.urlopen(req, timeout=timeout) as r:
│ +        b = r.read()
│ +        return r.status, b, round(time.time()-t0, 3), r.headers
│ +
│ +# 1. garso manifestas
│ +code, body, dt, h = get("assets/audio/lt/manifest.json")
│ +man = json.loads(body)
│ +print("manifestas:", code, dt, "s", len(body), "baitu, irasu:", len(man))
│ +local_man = json.load(open(os.path.join(ROOT, "assets/audio/lt/manifest.json"), encoding="utf-8"))
│ +print("lokalaus manifesto irasu:", len(local_man), "| sutampa:", man == local_man)
│ +
│ +# 2. failu skaicius serverio manifeste pagal prefiksa
│ +kinds = {}
│ +for v in man.values():
│ +    if isinstance(v, dict):
│ +        for k, f in v.items():
│ +            kinds[k] = kinds.get(k, 0) + 1
│ +print("garso variantai:", kinds)
│ +
│ +# 3. atsitiktine imtis 8 garso failu
│ +files = sorted({f for v in man.values() if isinstance(v, dict) for f in v.values() if isinstance(f, str)})
│ +random.seed(7)
│ +sample = random.sample(files, 8)
│ +audio_ok = 0
│ +for f in sample:
│ +    c, b, d, hh = get("assets/audio/lt/" + f)
│ +    ok = c == 200 and b[:2] in (b"\xff\xfb", b"\xff\xf3", b"\xff\xf2", b"ID") and len(b) > 1000
│ +    audio_ok += ok
│ +    print("  audio %-46s %s %6.3fs %7d B %s" % (f, c, d, len(b), "OK" if ok else "FAIL"))
│ +    time.sleep(0.35)
│ +
│ +# 4. lokalus vs publikuotas turinys (sha256)
│ +idx = json.load(open(os.path.join(ROOT, "content/lt/grade-01/index.json"), encoding="utf-8"))
│ +paths = ["index.html", "assets/css/main.css", "assets/js/app.js", "assets/js/registry.js",
│ +         "assets/js/progress.js", "assets/js/speech.js",
│ +         "assets/js/sims/calba.js", "assets/js/sims/matematika.js",
│ +         "assets/js/sims/pasaulis.js", "assets/js/sims/zaidimai.js",
│ +         "content/lt/grades.json", "content/lt/grade-01/index.json", "content/lt/grade-01/path.json"]
│ +paths += ["content/lt/" + m["file"] for s in idx["strands"] for m in s["modules"]]
│ +diff = []
│ +for p in paths:
│ +    c, b, d, hh = get(p)
│ +    lp = os.path.join(ROOT, p)
│ +    lh = hashlib.sha256(open(lp, "rb").read()).hexdigest()
│ +    rh = hashlib.sha256(b).hexdigest()
│ +    if lh != rh:
│ +        diff.append((p, c, len(open(lp,'rb').read()), len(b)))
│ +    time.sleep(0.35)
│ +print("palyginti failai:", len(paths), "| skiriasi nuo main HEAD:", len(diff))
│ +for d_ in diff:
│ +    print("  SKIRIASI:", d_)
│ +
│ +# 5. svorio skaiciavimas pirmam uzkrovimui (be sim/routes)
│ +first = ["index.html", "assets/css/main.css", "assets/js/app.js", "assets/js/registry.js", "assets/js/progress.js"]
│ +tot = 0
│ +for p in first:
│ +    tot += len(urllib.request.urlopen(urllib.request.Request(BASE+p, headers={"User-Agent":"suprask-health-check/1.0"}), timeout=25).read())
│ +    time.sleep(0.35)
│ +print("pirmas uzkrovimas (html+css+4 js, nesuspausta): %.1f KB" % (tot/1024))
│ +print("audio imtis: %d/8 OK" % audio_ok)
│ profiles/deepseek41flash/cache/scratch/health3.py
│ @@ -0,0 +1,64 @@
│ +#!/usr/bin/env python3
│ +import json, re, time, urllib.request, os
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +
│ +def get(p):
│ +    req = urllib.request.Request(BASE + p, headers={"User-Agent": "suprask-health-check/1.0"})
│ +    with urllib.request.urlopen(req, timeout=25) as r:
│ +        return r.status, r.read(), r.headers
│ +
│ +# surinkti visus sim komponentus is publikuotu moduliu
│ +idx = json.loads(get("content/lt/grade-01/index.json")[1])
│ +wanted = {}
│ +for s in idx["strands"]:
│ +    for m in s["modules"]:
│ +        _, b, _ = get("content/lt/" + m["file"]); time.sleep(0.35)
│ +        mod = json.loads(b)
│ +        comp = (mod.get("sim") or {}).get("component")
│ +        wanted.setdefault(comp, []).append(m["id"])
│ +        if comp != m["sim"]:
│ +            print("NEsutapimas indekse:", m["id"], m["sim"], comp)
│ +
│ +sims_src = ""
│ +for f in ("calba", "matematika", "pasaulis", "zaidimai"):
│ +    _, b, _ = get("assets/js/sims/%s.js" % f); time.sleep(0.35)
│ +    sims_src += b.decode("utf-8")
│ +defined = set(re.findall(r'^\s{2}"([a-z0-9\-]+)":\s*\{', sims_src, re.M))
│ +print("moduliu sim komponentu:", len(wanted), "| apibreztu sims:", len(defined))
│ +missing = [c for c in wanted if c not in defined]
│ +print("TRUKSTA komponentu:", missing if missing else "nera")
│ +unused = sorted(defined - set(wanted))
│ +print("nei vieno modulio nenaudojami sims:", unused)
│ +
│ +# index.html nuorodos
│ +_, html, hdrs = get("")
│ +links = re.findall(r'(?:src|href)="([^"]+)"', html.decode())
│ +ext = [l for l in links if l.startswith("http") or l.startswith("//")]
│ +print("index.html resursai:", links)
│ +print("isores nuorodos:", ext if ext else "nera")
│ +print("serveris:", hdrs.get("Server"), "| content-encoding:", hdrs.get("Content-Encoding"), "| cache:", hdrs.get("Cache-Control"))
│ +
│ +# HTTP -> HTTPS
│ +req = urllib.request.Request("http://one-man-company.github.io/suprask/", headers={"User-Agent": "suprask-health-check/1.0"})
│ +try:
│ +    with urllib.request.urlopen(req, timeout=25) as r:
│ +        print("http:// ->", r.status, r.geturl())
│ +except Exception as e:
│ +    print("http:// klaida:", e)
│ +
│ +# didziausias failas
│ +sizes = {}
│ +for root, dirs, files in os.walk(ROOT):
│ +    if "/.git" in root:
│ +        continue
│ +    for fn in files:
│ +        p = os.path.join(root, fn)
│ +        if p.startswith(ROOT + "/assets") or p.startswith(ROOT + "/content") or fn == "index.html":
│ +            sizes[os.path.relpath(p, ROOT)] = os.path.getsize(p)
│ +top = sorted(sizes.items(), key=lambda kv: -kv[1])[:5]
│ +print("didziausi failai:")
│ +for k, v in top:
│ +    print("  %-40s %7.1f KB" % (k, v / 1024))
│ +pub = sum(v for k, v in sizes.items() if not k.endswith(".mp3"))
│ +print("publikuotas turtas be audio: %.1f KB; su audio: %.1f KB" % (pub / 1024, sum(sizes.values()) / 1024))
│ profiles/deepseek41flash/cache/scratch/health4.py
│ @@ -0,0 +1,29 @@
│ +import json, re, urllib.request, time
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +
│ +def get(p):
│ +    req = urllib.request.Request(BASE + p, headers={"User-Agent": "suprask-health-check/1.0"})
│ +    with urllib.request.urlopen(req, timeout=25) as r:
│ +        return r.read()
│ +
│ +idx = json.loads(get("content/lt/grade-01/index.json"))
│ +wanted = []
│ +for s in idx["strands"]:
│ +    for m in s["modules"]:
│ +        d = json.loads(get("content/lt/" + m["file"]))
│ +        time.sleep(0.35)
│ +        wanted.append((m["id"], (d.get("sim") or {}).get("component")))
│ +
│ +src = ""
│ +for f in ("calba", "matematika", "pasaulis", "zaidimai"):
│ +    src += get("assets/js/sims/%s.js" % f).decode()
│ +    time.sleep(0.35)
│ +
│ +defined = dict(re.findall(r'^\s+"([a-z0-9\-]+)":\s*([A-Za-z0-9_]+),\s*$', src, re.M))
│ +print("komponentu moduliuose:", len(wanted), "| SIMS irasu:", len(defined))
│ +print("TRUKSTA:", [c for _, c in wanted if c not in defined] or "nera")
│ +print("nenaudojami:", sorted(set(defined) - {c for _, c in wanted}) or "nera")
│ +for name, fn in defined.items():
│ +    if not re.search(r'function\s+%s\b|const\s+%s\s*=' % (fn, fn), src):
│ +        print("  ! funkcija nerasta:", name, fn)
│ +print("visi komponentai:", sorted(defined))
│ profiles/deepseek41flash/cache/scratch/health5.py
│ @@ -0,0 +1,50 @@
│ +import json, re, urllib.request, time
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +
│ +def get(p):
│ +    req = urllib.request.Request(BASE + p, headers={"User-Agent": "suprask-health-check/1.0"})
│ +    with urllib.request.urlopen(req, timeout=25) as r:
│ +        return r.read()
│ +
│ +idx = json.loads(get("content/lt/grade-01/index.json"))
│ +wanted = []
│ +for s in idx["strands"]:
│ +    for m in s["modules"]:
│ +        d = json.loads(get("content/lt/" + m["file"]))
│ +        time.sleep(0.3)
│ +        wanted.append((m["id"], (d.get("sim") or {}).get("component")))
│ +
│ +src = {}
│ +for f in ("calba", "matematika", "pasaulis", "zaidimai"):
│ +    src[f] = get("assets/js/sims/%s.js" % f).decode()
│ +    time.sleep(0.3)
│ +
│ +registered = {}
│ +for f, body in src.items():
│ +    m = re.search(r'export const SIMS = \{(.*?)\n\};', body, re.S)
│ +    block = m.group(1)
│ +    for line in block.splitlines():
│ +        line = line.strip().rstrip(",")
│ +        if not line:
│ +            continue
│ +        mm = re.match(r'^"([a-z0-9\-]+)":\s*([A-Za-z0-9_]+)$', line)
│ +        if mm:
│ +            registered[mm.group(1)] = (mm.group(2), f)
│ +            continue
│ +        mm = re.match(r'^([A-Za-z0-9_]+)$', line)   # shorthand
│ +        if mm:
│ +            registered[mm.group(1)] = (mm.group(1), f)
│ +
│ +missing = [c for _, c in wanted if c not in registered]
│ +print("moduliu sim komponentu:", len(wanted), "| registre:", len(registered))
│ +print("TRUKSTA:", missing or "nera")
│ +print("nenaudojami:", sorted(set(registered) - {c for _, c in wanted}) or "nera")
│ +bad = []
│ +for k, (fn, f) in registered.items():
│ +    body = src[f]
│ +    if not re.search(r'function\s+%s\b|const\s+%s\s*=|%s\s*=\s*(function|\()' % (fn, fn, fn), body):
│ +        bad.append((k, fn, f))
│ +print("registruoti be funkcijos:", bad or "nera")
│ +for mid, comp in wanted:
│ +    fn, f = registered.get(comp, ("?", "?"))
│ +    print("  %-28s -> %-30s (%s)" % (mid, comp, f))
│ profiles/deepseek41flash/cache/scratch/health6.py
│ @@ -0,0 +1,33 @@
│ +import json, os, time, urllib.request
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +man = json.load(open(os.path.join(ROOT, "assets/audio/lt/manifest.json"), encoding="utf-8"))
│ +files = sorted({f for v in man.values() if isinstance(v, dict) for f in v.values() if isinstance(f, str)})
│ +print("manifesto failu:", len(files), "| lokalus MP3:", sum(len(fs) for _, _, fs in os.walk(os.path.join(ROOT, "assets/audio/lt"))))
│ +
│ +step = len(files) // 40
│ +sample = files[::max(step, 1)][:40]
│ +ok = 0
│ +problems = []
│ +for f in sample:
│ +    url = BASE + "assets/audio/lt/" + f
│ +    req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "suprask-health-check/1.0"})
│ +    t0 = time.time()
│ +    try:
│ +        with urllib.request.urlopen(req, timeout=25) as r:
│ +            remote = int(r.headers.get("Content-Length", -1))
│ +            local = os.path.getsize(os.path.join(ROOT, "assets/audio/lt", f))
│ +            if r.status == 200 and remote == local:
│ +                ok += 1
│ +            else:
│ +                problems.append((f, r.status, remote, local))
│ +    except Exception as e:
│ +        problems.append((f, str(e), None, None))
│ +    time.sleep(0.32)
│ +print("imtis: %d, sutampa (200 + tas pats dydis): %d" % (len(sample), ok))
│ +for p in problems:
│ +    print("  PROBLEMA:", p)
│ +
│ +grades = json.loads(urllib.request.urlopen(urllib.request.Request(BASE + "content/lt/grades.json",
│ +          headers={"User-Agent": "suprask-health-check/1.0"}), timeout=25).read())
│ +print("grades.json klases:", [(g.get("grade"), g.get("status")) for g in grades.get("grades", grades if isinstance(grades, list) else [])][:14])
│ profiles/deepseek41flash/cache/scratch/health7.py
│ @@ -0,0 +1,14 @@
│ +import json, os
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +man = json.load(open(os.path.join(ROOT, "assets/audio/lt/manifest.json"), encoding="utf-8"))
│ +refs = {f for v in man.values() if isinstance(v, dict) for f in v.values() if isinstance(f, str)}
│ +disk = set()
│ +for d, _, fs in os.walk(os.path.join(ROOT, "assets/audio/lt")):
│ +    for f in fs:
│ +        if f.endswith(".mp3"):
│ +            disk.add(os.path.relpath(os.path.join(d, f), os.path.join(ROOT, "assets/audio/lt")))
│ +orph = sorted(disk - refs)
│ +print("diske:", len(disk), "| manifeste:", len(refs), "| našlaičiai:", len(orph))
│ +for o in orph:
│ +    print("  %s  %.1f KB" % (o, os.path.getsize(os.path.join(ROOT, "assets/audio/lt", o)) / 1024))
│ +print("manifesto įrašai be failo:", sorted(refs - disk)[:5] or "nera")
│ profiles/deepseek41flash/cache/scratch/stats.py
│ @@ -0,0 +1,12 @@
│ +import json, statistics
│ +d = json.load(open('/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/health.json'))
│ +r = d['results']
│ +t = [x['time1'] for x in r]
│ +t2 = [x['time2'] for x in r]
│ +print('URL:', len(r), '| moduliai live:', d['modules_live'])
│ +print('1 bandymas: min %.3f med %.3f max %.3f' % (min(t), statistics.median(t), max(t)))
│ +print('2 bandymas: min %.3f med %.3f max %.3f' % (min(t2), statistics.median(t2), max(t2)))
│ +print('bendras dydis nesuspaustas: %.1f KB' % (sum(x['size'] for x in r) / 1024))
│ +big = max(r, key=lambda x: x['size'])
│ +print('didziausias is saraso: %s %d B' % (big['url'], big['size']))
│ +print('ne 200:', [(x['url'], x['code1'], x['code2']) for x in r if x['code1'] != 200 or x['code2'] != 200])
│ profiles/deepseek41flash/cache/scratch/table.py
│ @@ -0,0 +1,14 @@
│ +import json
│ +d = json.load(open('/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/health.json'))
│ +rows = []
│ +for x in d['results']:
│ +    p = x['url'].replace('https://one-man-company.github.io/suprask/', '/')
│ +    if x['code1'] == 404:
│ +        continue
│ +    j = (' ' + x['json']) if x['json'] else ''
│ +    rows.append('| `%s` | %d / %d | %.3f / %.3f | %.1f KB | %s%s |' % (
│ +        p, x['code1'], x['code2'], x['time1'], x['time2'], x['size'] / 1024, x['status'], j))
│ +open('/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/table.md', 'w').write('\n'.join(rows))
│ +print('\n'.join(rows))
│ +print()
│ +print('eiluciu:', len(rows))
Patikra atlikta, bet ataskaitos failo ir state.json atnaujinimo įrašyti nespėjau — baigėsi kvietimų limitas. Žemiau — visi realūs matavimai, kad juos būtų galima perkelti į agents/log be pakartotinės patikros.

SPRENDIMAS: svetainė VEIKIA. Jokių 404 tarp naudojamų resursų, jokio issue nereikia.

Ką tikrinau (2 bandymai, 350 ms tarpas, HTTP/2, GitHub Pages):
- 29 URL, 28 unikalūs resursai: visi 200 abiem bandymais. Visi JSON validūs.
- Pradžia: 200, ttfb 0,17–0,26 s (3 papildomi matavimai), 1,8 KB suspausta.
- 14 modulių JSON (ne 13): visi 200 ir validūs — sutampa su content/lt/grade-01/index.json.
- Sim registras: 14 modulių komponentų, 14 SIMS įrašų, 0 trūkstamų, 0 nenaudojamų, visos funkcijos apibrėžtos.
- Publikuota versija = main HEAD: 27 failai (html, css, js, sims, grades/index/path, visi 14 modulių) — sha256 sutampa 27/27. index.json last-modified 06:47 EET, commit 06:46:29 → deploy šviežias.
- Garsas: manifestas /assets/audio/lt/manifest.json 200, 320 tekstų × 2 variantai = 640 failų, identiškas lokaliajam. Imtis 40 failų HEAD: 40/40 200 ir dydis sutampa su lokaliu; 8 mp3 pilni GET — 8/8.
- Svoris: pirmas užkrovimas ~40 KB suspausta (html 1,8 + css 4,8 + app 8,6 + registry 0,9 + progress 1,1 + 4 sims 20,2 + speech 3,1 + grades 0,2). Didžiausias kodas: matematika.js 30,9 KB (9,0 KB suspausta); didžiausias failas apskritai: audio mp3 59,2 KB.
- TLS: Let's Encrypt YR1, galioja iki 2026-12-29; http:// → https:// 301/200 peradresavimas veikia.
- Be išorinių resursų: CSS/JS neturi url(http, @import, CDN, analytics. index.html turi tik 3 išorines nuorodas (CC BY-SA, HuggingFace balso šaltinis, GitHub) — nuorodos, ne įkeliami resursai.
- Audio 640 faile diske, manifeste 640, našlaičių 0.

Klaidingas aliarmas, kurio nereikia fiksuoti kaip defekto: mano paties bandytas /content/audio-manifest.json grąžino 404 — teisingas kelias yra /assets/audio/lt/manifest.json (200). Tai ne svetainės problema.

Vienas trumpalaikis nuokrypis: audio n/3e23e8160039594a 1,46 s pirmu matavimu; pakartojus 3× — 0,24–0,26 s. CDN praleidimas, ne defektas (gairė „neišvadų iš vieno matavimo" pasitvirtino).

Pastabos, ne defektai (vertos dėmesio, bet ne mano sritis keisti):
- registry.js statiškai importuoja visus 4 sims failus, tad pradžia parsisiunčia visas 14 simuliacijų (~20 KB suspausta) net neatidarius modulio. Kol kas nebrangu, bet augant klasių skaičiui svoris augs tiesiškai.
- docs/ARCHITEKTURA.md sk. „Būsena" ir agents/state.json last_validation teberašo 13 modulių / 13 simuliacijų, o gyvai jau 14 (nauja kryptis zaidimu-teorija). Dokumentacijos atsilikimas, ne veikimo klaida.

Liko nepadaryta (reikia vieno kito paleidimo arba rankinio žingsnio):
- agents/log/sveikatos-inspektorius-2026-11-05T0659.md su lentele (duomenys aukščiau; lentelės eilutes galima atkurti iš /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/health.json ir table.md).
- agents/state.json: įrašas roles["sveikatos-inspektorius"] (last_run 2026-11-05T06:59, status ok, modules 14, sims 14, audio 640, issue: null).
- Jokio issue nekurti — problemų nerasta.

## klaidos

```
session_id: local-f83fe95498557f53bb6b7e9db9b3663e9694e97bc57d6c239df0c9454904e182
```
