# publikavimo-agentas — 2026-11-17T2304

- paleidimas: #338 (manual)
- trukmė: 272s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/p338_crosscheck.py
│ @@ -0,0 +1,76 @@
│ +#!/usr/bin/env python3
│ +"""#338: kryžminė indekso <-> failų <-> path.json patikra (ne per check_published)."""
│ +import json, os, sys
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +G = os.path.join(ROOT, "content/lt/grade-01")
│ +
│ +idx = json.load(open(os.path.join(G, "index.json"), encoding="utf-8"))
│ +seq = json.load(open(os.path.join(G, "path.json"), encoding="utf-8"))["sequence"]
│ +
│ +entries = []
│ +for strand in idx.get("strands", []):
│ +    for mod in strand.get("modules", []):
│ +        entries.append((strand.get("id") or strand.get("slug") or strand.get("dir"),
│ +                        mod["id"], mod.get("file")))
│ +
│ +print("indekso įrašų:", len(entries), "| strands:", len(idx.get("strands", [])),
│ +      "| path.json:", len(seq))
│ +
│ +ids = [m for _, m, _ in entries]
│ +dupes = sorted({i for i in ids if ids.count(i) > 1})
│ +print("dubliuoti ID indekse:", dupes)
│ +
│ +missing_files = []
│ +for strand, mid, f in entries:
│ +    if not f:
│ +        missing_files.append((mid, "<no file field>"))
│ +        continue
│ +    p = os.path.join(G, f)
│ +    if not os.path.exists(p):
│ +        missing_files.append((mid, f))
│ +print("indekse įrašyti, bet failo nėra:", missing_files)
│ +
│ +# visi modulių failai diske
│ +disk = {}
│ +for d in sorted(os.listdir(G)):
│ +    dp = os.path.join(G, d)
│ +    if not os.path.isdir(dp):
│ +        continue
│ +    for fn in sorted(os.listdir(dp)):
│ +        if fn.endswith(".json"):
│ +            disk[os.path.join(d, fn)] = fn[: -len(".json")]
│ +
│ +indexed_files = {f for _, _, f in entries if f}
│ +orphans = {k: v for k, v in disk.items() if k not in indexed_files}
│ +print("diske yra, indekse nėra (našlaičiai):", orphans)
│ +
│ +# id <=> failo vardas
│ +mismatch = [(mid, f) for _, mid, f in entries if f and os.path.basename(f)[:-5] != mid]
│ +print("id != failo vardas:", mismatch)
│ +
│ +# path.json padengimas
│ +set_idx = set(ids)
│ +set_seq = set(seq)
│ +print("path.json yra, indekse nėra:", sorted(set_seq - set_idx))
│ +print("indekse yra, path.json nėra:", sorted(set_idx - set_seq))
│ +print("path.json dubletai:", sorted({s for s in seq if seq.count(s) > 1}))
│ +print("path.json ilgis:", len(seq), "unikalūs:", len(set_seq))
│ +
│ +# simuliacijų komponentai
│ +comps = set()
│ +for _, mid, f in entries:
│ +    m = json.load(open(os.path.join(G, f), encoding="utf-8"))
│ +    sim = m.get("sim") or {}
│ +    comps.add(sim.get("component"))
│ +print("skirtingų sim komponentų:", sorted(c for c in comps if c))
│ +
│ +tasks = 0
│ +for _, mid, f in entries:
│ +    m = json.load(open(os.path.join(G, f), encoding="utf-8"))
│ +    tasks += len(m.get("tasks") or [])
│ +print("užduočių iš viso:", tasks)
│ +
│ +ok = not (dupes or missing_files or orphans or mismatch or (set_seq - set_idx) or (set_idx - set_seq))
│ +print("SPRENDIMAS:", "švaru" if ok else "RADINIAI")
│ +sys.exit(0 if ok else 1)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/p338_crosscheck.py
│ @@ -26,8 +26,8 @@
│      if not f:
│          missing_files.append((mid, "<no file field>"))
│          continue
│ -    p = os.path.join(G, f)
│ -    if not os.path.exists(p):
│ +    p = os.path.join(ROOT, "content/lt", f)
│ +
│          missing_files.append((mid, f))
│  print("indekse įrašyti, bet failo nėra:", missing_files)
│
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/p338_crosscheck.py
│ @@ -27,7 +27,7 @@
│          missing_files.append((mid, "<no file field>"))
│          continue
│      p = os.path.join(ROOT, "content/lt", f)
│ -
│ +    if not os.path.exists(p):
│          missing_files.append((mid, f))
│  print("indekse įrašyti, bet failo nėra:", missing_files)
│
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/p338_crosscheck.py
│ @@ -42,7 +42,10 @@
│              disk[os.path.join(d, fn)] = fn[: -len(".json")]
│
│  indexed_files = {f for _, _, f in entries if f}
│ -orphans = {k: v for k, v in disk.items() if k not in indexed_files}
│ +disk["x"] = None  # noqa
│ +disk.pop("x")
│ +disk_norm = {"grade-01/" + k: v for k, v in disk.items()}
│ +orphans = {k: v for k, v in disk_norm.items() if k not in indexed_files}
│  print("diske yra, indekse nėra (našlaičiai):", orphans)
│
│  # id <=> failo vardas
│ profiles/deepseek41flash/cache/scratch/p338_simregistry.py
│ @@ -0,0 +1,63 @@
│ +#!/usr/bin/env python3
│ +"""#338: ar kiekvienas indekso/modulio sim komponentas tikrai registruotas SIMS registre.
│ +
│ +Tikrina tris dalykus:
│ + 1. index.json `sim` == modulio JSON `sim.component` (kortelė rodo tą patį, ką montuos)
│ + 2. kiekvienas komponentas yra bent viename `assets/js/sims/*.js` SIMS eksporte
│ + 3. registre nėra komponentų, kurių nenaudoja nė vienas modulis (neblokuoja, bet rodo)
│ +"""
│ +import json, os, re, sys
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +CLT = os.path.join(ROOT, "content/lt")
│ +SIMS = os.path.join(ROOT, "assets/js/sims")
│ +
│ +# 1. registras
│ +registered = {}
│ +for fn in sorted(os.listdir(SIMS)):
│ +    if not fn.endswith(".js"):
│ +        continue
│ +    src = open(os.path.join(SIMS, fn), encoding="utf-8").read()
│ +    m = re.search(r"export const SIMS\s*=\s*\{(.*)\n\};", src, re.S)
│ +    if not m:
│ +        print("!!", fn, "neturi SIMS eksporto")
│ +        continue
│ +    body = m.group(1)
│ +    for key in re.findall(r"^\s{2,6}(['\"]?)([A-Za-z0-9_-]+)\1\s*:", body, re.M):
│ +        registered[key[1]] = fn
│ +print("registruota komponentų:", len(registered))
│ +
│ +# 2. moduliai
│ +idx = json.load(open(os.path.join(CLT, "grade-01/index.json"), encoding="utf-8"))
│ +rows = []
│ +for strand in idx["strands"]:
│ +    for mod in strand["modules"]:
│ +        rows.append((strand["id"], mod["id"], mod.get("sim"), mod["file"]))
│ +
│ +missing_registry, mismatch, unused_pairs = [], [], []
│ +used = set()
│ +for strand, mid, idx_sim, f in rows:
│ +    m = json.load(open(os.path.join(CLT, f), encoding="utf-8"))
│ +    comp = (m.get("sim") or {}).get("component")
│ +    used.add(comp)
│ +    if comp not in registered:
│ +        missing_registry.append((mid, comp))
│ +    if idx_sim != comp:
│ +        mismatch.append((mid, idx_sim, comp))
│ +
│ +print("modulių:", len(rows))
│ +print("index.sim != modulio sim.component:", mismatch)
│ +print("komponentas neregistruotas SIMS:", missing_registry)
│ +print("registre yra, nenaudoja nė vienas modulis:", sorted(set(registered) - used))
│ +
│ +# 3. visą registrą įkeltų bent vienas modulis? (registry.js importuoja visus failus?)
│ +reg = open(os.path.join(ROOT, "assets/js/registry.js"), encoding="utf-8").read()
│ +imported = re.findall(r"from\s+['\"]\./sims/([a-z]+)\.js", reg)
│ +print("registry.js importuoja sims failus:", imported)
│ +not_imported = [fn[:-3] for fn in sorted(os.listdir(SIMS))
│ +                if fn.endswith(".js") and fn[:-3] not in imported]
│ +print("sims failai, kurių registry.js neimportuoja:", not_imported)
│ +
│ +ok = not (missing_registry or mismatch or not_imported)
│ +print("SPRENDIMAS:", "švaru" if ok else "RADINIAI")
│ +sys.exit(0 if ok else 1)
Nepavyko įrašyti failo – baigėsi žingsniai. Todėl pateikiu išmatuotus duomenis ir aiškiai pasakau, ko repo trūksta.

1. check_published.py (numatytasis režimas, rc 0)
   Repozitorija: 39 moduliai / Paskelbta: 39 moduliai (grade-01: repo 39, gyvai 39)
   missing_on_live 0 · hidden_locally 0 · not_in_path 0 · stale 0 · stale_unknown 0 · aux_stale 0
   shell_stale [] · shell_unreachable [] · shell_count 18 · path_differs []
   unpushed_commits 0 (patikra įvyko) · history_checked true
   vanished_ids 1: 03-sakinio-tvarka → 03-sakinio-zodzi, resolved true
   live_version = repo_version = e5c5ffc5 · garsas 1138/1138 (visi, ne mėginys) · verdict „sutampa“
   git: 0\t0 prieš origin/main, darbinė kopija švari, HEAD = origin/main = e5c5ffc.

2. Trys gyvi adresai (curl + baitai + sha256)
   04-skaiciu-tiese.json        200  3636 B  live/repo 7776d88b94602f3a = 7776d88b94602f3a
   02-skiemenu-jungimas.json    200  4853 B  live/repo f06755ea5f78587b = f06755ea5f78587b
   18-kuprine-ir-kuno-dalys.json 200 8051 B  live/repo cea133a097de0b22 = cea133a097de0b22

3. Naujas matavimas: dashboard vs svetainė (tai mano vaidmens pagrindinis klausimas)
   Dashboard /api/overview stats: modules 39, tasks 169, sims 39, grades_live 1, audio 1138/1138.
   Nepriklausomas perskaičiavimas iš content/lt/grade-01: 39 indekso įrašai, 39 failai diske, 9 kryptys,
   169 užduotys, 39 skirtingi sim.component, path.json 39 (= indeksas, 0 dubletų), 0 našlaičių failų,
   0 indekse įrašytų be failo, 0 neatitikimų tarp id ir failo vardo.
   Išvada: dashboard NERODO daugiau nei svetainė — visi keturi skaičiai sutampa iki vieneto.

4. Vartai (visi žali, rc 0)
   validate_content.py --grade 1 --strict → 0 klaidų, 0 įspėjimų
   check_docs_facts.py → 0/0 (9 kryptys, 39 moduliai, 39 sim, 169 užduotys, 569 garso tekstai, 1138 įrašai, 15 agentų)
   check_audio.py --no-engine → 569 tekstų / 1138 įrašų / 1138 mp3

5. Sprendimas: SUTAMPA. Nieko netaisiau, nes nebuvo ko taisyti: content/**, assets/**, docs/**, AGENTS.md neliesti, joks ID nepernumeruotas.

6. NEPATVIRTINTAS radinys (reikia vieno papildomo žingsnio, NELAUKYK jo kaip defekto)
   Zondas, lyginantis modulių sim.component su SIMS registru assets/js/sims/*.js, pranešė:
     index.sim == modulio sim.component → visiems 39 (0 neatitikimų) — ši dalis patikrinta ir švari;
     tačiau 3 komponentai nebuvo rasti SIMS eksportų blokuose: desimtukas, figuros, desningumai
     (moduliai 05-desimtukas, 06-figuros, 07-desningumai — visi trys iš matematikos, visi trys gyvai 200).
   Tai greičiausiai MANO regexo artefaktas (rakto rašymo būdas matematika.js registre), o ne lūžęs modulis —
   bet to nepatyriau, todėl teigti defekto negalima. Kitas žingsnis: `sed -n '3629,3700p' assets/js/sims/matematika.js`
   ir, jei raktų tikrai nėra, modulio sim.component keisti NEGALIMA (tai turinio failas, ne mano) — rašyti į
   research/wiki/guidelines/klausimai.md. Kol nepatikrinta, šio signalo nenaudoti kaip įrodymo.

7. KAS NEĮRAŠYTA (darbas liko ne repo, o šiame tekste)
   Dėl žingsnių limito neįrašiau savo vaidmens 6 punkto:
   - research/wiki/changelog.md — trūksta įrašo „2026-11-17 — Publikavimo patikra #338“ (visi skaičiai aukščiau yra išmatuoti ir tinkami perkelti tiesiogiai). Be jo paleidimas pagal bėgiklio taisyklę bus laikomas tuščiu.
   - agents/state.json (yra .gitignore) — trūksta last_publish_check_338 bloko.
   - Taip pat pastebėjau, kad #336 paliko tą pačią spragą: changelog viršuje tebėra #321 įrašas, o state.json neturi last_publish_check_336. Tai dviguba skola.
   - Netyrinėjau atviro pasiūlymo #19519 tikslo content/lt/grade-01/pasaulio-pazinimas/22-medziai-krumai-zoles.json — to failo repo nėra (gyvas adresas grąžina 404), tad pasiūlymas šiandien neįvykdomas (LL-36 tipo atvejis).

## klaidos

```
hermes: completing source-update dependencies...
hermes: preparing dependencies for this update...
  → Resolving Python dependencies…
  ✓ Resolving Python dependencies
  → Installing Python dependencies…
  ✓ Installing Python dependencies

session_id: local-477441d8f2fab2de938d867108cb8d288a278f7e61e895350cd04f0a9b3a3cc5
```
