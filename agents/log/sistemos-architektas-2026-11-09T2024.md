# sistemos-architektas — 2026-11-09T2024

- paleidimas: #211 (manual)
- trukmė: 566s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/runs_probe.py
│ @@ -0,0 +1,9 @@
│ +import sqlite3, sys
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +print([r[1] for r in c.execute('PRAGMA table_info(runs)')])
│ +q = """select id,role,status,started_at,finished_at,substr(coalesce(detail,''),1,140)
│ +from runs where role in ('metodininkas','tikrintojas','ideator','programos-derintojas',
│ +'dizaineris','sveikatos-inspektorius','sistemos-architektas','leidejas')
│ +order by id desc limit 40"""
│ +for r in c.execute(q):
│ +    print(' | '.join(str(x) for x in r))
│ profiles/deepseek41flash/cache/scratch/runs_probe.py
│ @@ -1,9 +1,18 @@
│ -import sqlite3, sys
│ +import sqlite3
│  c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ -print([r[1] for r in c.execute('PRAGMA table_info(runs)')])
│ -q = """select id,role,status,started_at,finished_at,substr(coalesce(detail,''),1,140)
│ +q = """select id,role,status,started,duration_s,substr(coalesce(detail,''),1,150)
│  from runs where role in ('metodininkas','tikrintojas','ideator','programos-derintojas',
│  'dizaineris','sveikatos-inspektorius','sistemos-architektas','leidejas')
│ -order by id desc limit 40"""
│ +order by id desc limit 45"""
│  for r in c.execute(q):
│      print(' | '.join(str(x) for x in r))
│ +print('--- conflicts/empty/rejected all:')
│ +q2 = """select role,status,count(*) from runs group by role,status
│ +order by role"""
│ +for r in c.execute(q2):
│ +    print(' | '.join(str(x) for x in r))
│ +print('--- last empty/conflict details:')
│ +q3 = """select id,role,status,started,substr(coalesce(detail,''),1,300) from runs
│ +where status in ('conflict','empty','rejected') order by id desc limit 12"""
│ +for r in c.execute(q3):
│ +    print(' | '.join(str(x) for x in r))
│ profiles/deepseek41flash/cache/scratch/audio_orphans.py
│ @@ -0,0 +1,15 @@
│ +import json, pathlib
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +man = json.loads((ROOT/'assets/audio/lt/manifest.json').read_text(encoding='utf-8'))
│ +refs = set()
│ +for txt, e in man.items():
│ +    for v in ('n','s'):
│ +        if e.get(v):
│ +            refs.add(e[v])
│ +disk = {str(p.relative_to(ROOT/'assets/audio/lt')) for p in (ROOT/'assets/audio/lt').rglob('*.mp3')}
│ +orph = sorted(disk - refs)
│ +print('manifest keys', len(man), 'refs', len(refs), 'disk', len(disk), 'orphans', len(orph))
│ +for o in orph:
│ +    p = ROOT/'assets/audio/lt'/o
│ +    print(' ', o, p.stat().st_size if p.exists() else '-')
│ +print('missing on disk:', len(refs - disk))
│ scripts/check_audio.py
│ @@ -6,13 +6,24 @@
│  versijose, skaitydavo svetimos kalbos balsu). Todėl trūkstamas įrašas yra
│  klaida, o ne įspėjimas.
│
│ +Patikra ėjo tik viena kryptimi: manifestas → diskas. Atvirkštinė kryptis
│ +(diskas → manifestas) nebuvo tikrinama, todėl diske ir git istorijoje likę
│ +įrašai, kurių niekas nebegroja, buvo nematomi, o žinutė „Garsas pilnas“
│ +skambėjo taip, lyg būtų panaudotas kiekvienas failas. Šiandien (2026-11-09):
│ +500 tekstų = 1000 įrašų, diske 1014 mp3, t. y. 14 našlaičių. Našlaitis nėra
│ +klaida (vaikui nieko netrūksta ir CI neturi kristi dėl istorijos), bet skaičius
│ +turi būti pasakytas teisingai, o failus turi būti galima pašalinti sąmoningai.
│ +
│  Naudojimas:
│      python3 scripts/check_audio.py            # tikrina, grąžina 1 jei trūksta
│ -    python3 scripts/check_audio.py --list      # išvardija trūkstamus
│ +    python3 scripts/check_audio.py --list      # išvardija trūkstamus ir našlaičius
│ +    python3 scripts/check_audio.py --json      # dashboard'ui / būsenos generatoriui
│ +    python3 scripts/check_audio.py --prune     # šalina manifeste neminimus mp3
│  """
│
│  from __future__ import annotations
│
│ +import argparse
│  import json
│  import pathlib
│  import shutil
│ @@ -24,17 +35,37 @@
│
│  import generate_audio  # noqa: E402
│
│ +AUDIO = ROOT / "assets" / "audio" / "lt"
│
│ -def main() -> int:
│ -    manifest_path = ROOT / "assets" / "audio" / "lt" / "manifest.json"
│ +
│ +def referenced(manifest: dict) -> set[str]:
│ +    """Įrašai, kuriuos manifestas realiai nurodo (abi variantai)."""
│ +    refs: set[str] = set()
│ +    for entry in manifest.values():
│ +        if not isinstance(entry, dict):
│ +            continue
│ +        for variant in ("n", "s"):
│ +            rel = entry.get(variant)
│ +            if rel:
│ +                refs.add(rel)
│ +    return refs
│ +
│ +
│ +def on_disk() -> set[str]:
│ +    return {str(p.relative_to(AUDIO)) for p in AUDIO.glob("*/*.mp3")}
│ +
│ +
│ +def check(probe_engine: bool = True) -> dict:
│ +    manifest_path = AUDIO / "manifest.json"
│      if not manifest_path.exists():
│ -        print("KLAIDA: nėra assets/audio/lt/manifest.json")
│ -        return 1
│ +        return {"ok": False, "fatal": "nėra assets/audio/lt/manifest.json"}
│
│      manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
│      texts = generate_audio.collect()
│ +    refs = referenced(manifest)
│ +    disk = on_disk()
│
│ -    missing = []
│ +    missing: list[str] = []
│      for text in texts:
│          entry = manifest.get(text)
│          if not entry:
│ @@ -42,21 +73,21 @@
│              continue
│          for variant in ("n", "s"):
│              rel = entry.get(variant)
│ -            if not rel or not (ROOT / "assets" / "audio" / "lt" / rel).exists():
│ +            if not rel or not (AUDIO / rel).exists():
│                  missing.append(f"{text} [{variant}]")
│
│      # Vienas variklis visame korpuse. Skirtingų variklių mišinys atsiranda
│      # tyliai (pvz. senas įrašas nepakeičiamas, nes failas jau yra), o vaikas
│ … omitted 98 diff line(s) across 1 additional file(s)/section(s)
│ agents/db.py
│ @@ -228,13 +228,33 @@
│          tasks += len(d.get("tasks") or [])
│          if (d.get("sim") or {}).get("component"):
│              sims.add(d["sim"]["component"])
│ -    audio = list((ROOT / "assets" / "audio" / "lt").glob("*/*.mp3"))
│ +    audio_dir = ROOT / "assets" / "audio" / "lt"
│ +    audio = list(audio_dir.glob("*/*.mp3"))
│ +    # „Įrašų“ skaičius turi reikšti tai, ką vaikas gali išgirsti. Diske gali
│ +    # likti failų, kurių manifestas nebemini (2026-11-09: 14 iš 1014); jei
│ +    # rodomas vien disko skaičius, jis atrodo kaip panaudotas turtas, nors
│ +    # dalis jo negrojama nė viename modulyje.
│ +    used = len(audio)
│ +    try:
│ +        manifest = json.loads((audio_dir / "manifest.json").read_text(encoding="utf-8"))
│ +        refs = {entry.get(v) for entry in manifest.values() if isinstance(entry, dict)
│ +                for v in ("n", "s") if entry.get(v)}
│ +        used = len(refs)
│ +    except (OSError, json.JSONDecodeError):
│ +        pass
│ +    live = 0
│ +    try:
│ +        grades = json.loads((ROOT / "content" / "lt" / "grades.json").read_text(encoding="utf-8"))
│ +        live = sum(1 for g in grades.get("grades", []) if g.get("status") == "live")
│ +    except (OSError, json.JSONDecodeError):
│ +        live = 0
│      return {
│          "modules": modules,
│          "tasks": tasks,
│          "sims": len(sims),
│ -        "grades_live": 1,
│ -        "audio_files": len(audio),
│ +        "grades_live": live,
│ +        "audio_files": used,
│ +        "audio_total": len(audio),
│          "audio_mb": round(sum(a.stat().st_size for a in audio) / 1024 / 1024, 1),
│      }
│
│ scripts/check_published.py
│ @@ -7,42 +7,155 @@
│  abi puses ir, svarbiausia, tikrina, ar nepradingo nė vienas modulio ID —
│  nuo to priklauso vaiko `localStorage` pažanga.
│
│ +2026-11-09 išplėsta (pasiūlymas #8716). Anksčiau:
│ +  - klasė buvo įrašyta kieta (`grade-01`) — kai bus paleista 2 klasė, įrankis
│ +    jos nematytų ir vėl sakytų „sutampa“;
│ +  - lyginamos tik ID aibės, tad gyva svetainė su tais pačiais ID, bet pasenusiu
│ +    failo turiniu, būdavo pavadinta suderinta. Baitų lygybę agentai turėjo
│ +    įrodinėti atskirais zondais kiekvieną publikavimo paleidimą.
│ +Dabar: klasės imamos iš `grades.json` (`status: live`), kiekvienas gyvas
│ +modulio failas lyginamas baitais (sha256) su repo failu, o pranešime
│ +atskiriama „trūksta ID“ nuo „ID yra, turinys pasenęs“. Nesutapimas
│ +patikrinamas antrą kartą — GitHub Pages pirmomis sekundėmis po deploymento
│ +gali grąžinti mišrią krašto būseną (LL-76).
│ +
│  Naudojimas:
│ -    python3 scripts/check_published.py          # žmogui
│ -    python3 scripts/check_published.py --json   # dashboard'ui
│ +    python3 scripts/check_published.py               # žmogui
│ +    python3 scripts/check_published.py --json        # dashboard'ui
│ +    python3 scripts/check_published.py --grade 1     # viena klasė
│ +    python3 scripts/check_published.py --no-bytes    # greita: tik ID ir seka
│  """
│
│  from __future__ import annotations
│
│  import argparse
│ +import hashlib
│  import json
│  import pathlib
│  import subprocess
│  import sys
│ +import time
│  import urllib.request
│ +from concurrent.futures import ThreadPoolExecutor
│
│  ROOT = pathlib.Path(__file__).resolve().parent.parent
│ -INDEX = ROOT / "content" / "lt" / "grade-01" / "index.json"
│ -PATH_DOC = ROOT / "content" / "lt" / "grade-01" / "path.json"
│ -LIVE_INDEX = "https://one-man-company.github.io/suprask/content/lt/grade-01/index.json"
│ +CONTENT = ROOT / "content" / "lt"
│ +GRADES = CONTENT / "grades.json"
│  LIVE_ROOT = "https://one-man-company.github.io/suprask/"
│ -
│ -
│ -def local_modules() -> tuple[dict, list[str]]:
│ -    data = json.loads(INDEX.read_text(encoding="utf-8"))
│ -    ids = [m["id"] for s in data.get("strands", []) for m in s.get("modules", [])]
│ -    return data, ids
│ -
│ -
│ -def live_modules(timeout: int = 20) -> tuple[dict | None, list[str], str]:
│ -    try:
│ -        req = urllib.request.Request(LIVE_INDEX, headers={"User-Agent": "suprask-check/1.0"})
│ +UA = {"User-Agent": "suprask-check/1.1"}
│ +
│ +
│ +def grade_dir(grade: int) -> str:
│ +    return f"grade-{grade:02d}"
│ +
│ +
│ +def live_grades() -> list[int]:
│ +    try:
│ +        data = json.loads(GRADES.read_text(encoding="utf-8"))
│ +    except (OSError, json.JSONDecodeError):
│ +        return [1]
│ +    out = [int(g["grade"]) for g in data.get("grades", []) if g.get("status") == "live"]
│ +    return out or [1]
│ +
│ +
│ +def local_index(grade: int) -> tuple[dict, dict[str, str]]:
│ +    path = CONTENT / grade_dir(grade) / "index.json"
│ +    data = json.loads(path.read_text(encoding="utf-8"))
│ +    files: dict[str, str] = {}
│ +    for strand in data.get("strands", []):
│ +        for mod in strand.get("modules", []):
│ +            if mod.get("file"):
│ +                files[mod["id"]] = mod["file"]
│ … omitted 221 diff line(s) across 1 additional file(s)/section(s)
│ scripts/check_published.py
│ @@ -111,6 +111,8 @@
│          return out
│      local_ids = [m["id"] for s in data.get("strands", []) for m in s.get("modules", [])]
│
│ +    live_ids: list[str] = []
│ +    live_seq: list[str] = []
│      for name in ("index.json", "path.json"):
│          blob = fetch(f"{LIVE_ROOT}content/lt/{gd}/{name}")
│          if blob is None:
│ @@ -121,9 +123,6 @@
│              live_ids = [m["id"] for s in live_data.get("strands", []) for m in s.get("modules", [])]
│          else:
│              live_seq = list(json.loads(blob.decode("utf-8")).get("sequence", []))
│ -    else:
│ -        live_ids = []
│ -        live_seq = []
│
│      out["local"] = len(local_ids)
│      out["published"] = len(live_ids)
│ scripts/system_report.py
│ @@ -65,6 +65,31 @@
│      by_status: dict[str, int] = {}
│      oldest_new = None
│      blocked: list[dict] = []
│ +    # Sisteminiai pasiūlymai (tikslas `agents/`, `scripts/`, `deploy/`,
│ +    # `dashboard/`, `docs/`) kūrėjui sąmoningai neduodami — jų neįgyvendina
│ +    # niekas, kol architektas nepaima. Todėl jie turi būti ataskaitoje
│ +    # sąrašu, o ne bendru „new“ skaičiumi: 2026-11-09 tokių buvo 8, o
│ +    # kiekvienas jų yra vartų aklumas, kuris liks nematomas visą savaitę.
│ +    system_queue: list[dict] = []
│ +    now = dt.datetime.now().astimezone()
│ +    for r in rows:
│ +        if (r.get("status") or "") != "new":
│ +            continue
│ +        target = (r.get("target") or "").strip()
│ +        paths = [p.strip() for p in target.replace(";", ",").split(",") if p.strip()]
│ +        if not paths or not all(p.startswith(SYSTEM_PREFIXES) for p in paths):
│ +            continue
│ +        created = r.get("created") or ""
│ +        age = None
│ +        if created:
│ +            try:
│ +                stamp = dt.datetime.fromisoformat(created)
│ +                age = (now - (stamp if stamp.tzinfo else stamp.replace(tzinfo=now.tzinfo))).days
│ +            except ValueError:
│ +                age = None
│ +        system_queue.append({"id": int(r["id"]), "title": (r.get("title") or "")[:80],
│ +                             "target": target[:80], "age_days": age})
│ +
│      for r in rows:
│          st = r.get("status") or "?"
│          by_status[st] = by_status.get(st, 0) + 1
│ @@ -79,15 +104,17 @@
│      if oldest_new:
│          try:
│              stamp = dt.datetime.fromisoformat(oldest_new)
│ -            now = dt.datetime.now(stamp.tzinfo) if stamp.tzinfo else dt.datetime.now()
│ -            age_days = (now - stamp).days
│ +            now2 = dt.datetime.now(stamp.tzinfo) if stamp.tzinfo else dt.datetime.now()
│ +            age_days = (now2 - stamp).days
│          except ValueError:
│              age_days = None
│      # `blocked` yra kapinės: eilė jų nebeliečia, niekas jų nebeatidaro. Todėl
│      # ataskaita privalo jas parodyti vardais, o ne vienu skaičiumi (2026-11-08
│      # visi 6 blokuoti buvo realūs defektai, kurių niekas nebetaisys).
│      return {"by_status": by_status, "oldest_new_days": age_days, "total": len(rows),
│ -            "blocked": sorted(blocked, key=lambda x: x["id"])}
│ +            "blocked": sorted(blocked, key=lambda x: x["id"]),
│ +            "system_queue": sorted(system_queue, key=lambda x: (-(x["age_days"] or 0), x["id"]))}
│ +
│
│
│  def timers() -> list[dict]:
│ profiles/deepseek41flash/cache/scratch/import_probe.py
│ @@ -0,0 +1,7 @@
│ +import sys
│ +sys.path.insert(0, '/home/zoltanas/workspace/suprask/scripts')
│ +sys.path.insert(0, '/home/zoltanas/workspace/suprask/agents')
│ +import time
│ +t = time.time()
│ +import kurejas_queue
│ +print('ok', kurejas_queue.SYSTEM_PREFIXES, round(time.time() - t, 2), 's')
│ scripts/system_report.py
│ @@ -23,9 +23,18 @@
│
│  ROOT = pathlib.Path(__file__).resolve().parent.parent
│  sys.path.insert(0, str(ROOT / "agents"))
│ +sys.path.insert(0, str(ROOT / "scripts"))
│
│  import db  # noqa: E402
│  import scope as grade_scope  # noqa: E402
│ +
│ +# Klasifikacija „šis pasiūlymas — sisteminis, ne kūrėjo darbas“ gyvena vienoje
│ +# vietoje (`kurejas_queue.py`). Ataskaita ją importuoja, o ne kartoja: jei
│ +# sąrašas išsiskirs, ataskaita rodys vieną eilę, o kūrėjo eilė gyvuos pagal kitą.
│ +try:
│ +    from kurejas_queue import SYSTEM_PREFIXES  # noqa: E402
│ +except Exception:  # noqa: BLE001
│ +    SYSTEM_PREFIXES = ("agents/", "scripts/", "deploy/", "dashboard/", "docs/")
│
│  BAD = ("empty", "conflict", "rejected", "timeout", "failed", "skipped", "blocked")
│
│ scripts/system_report.py
│ @@ -238,6 +238,11 @@
│          print(f"Blokuoti (niekas nebeatidaro — reikia sprendimo): {len(p['blocked'])}")
│          for b in p["blocked"][:6]:
│              print(f"  #{b['id']} {b['title']} · {b['note']}")
│ +    if p.get("system_queue"):
│ +        print(f"\nSisteminiai pasiūlymai (kūrėjas jų neima — tai architekto eilė): {len(p['system_queue'])}")
│ +        for s in p["system_queue"]:
│ +            age = f", prieš {s['age_days']} d." if s.get("age_days") else ""
│ +            print(f"  #{s['id']} {s['title']} → {s['target']}{age}")
│
│      print("\nPatikros:")
│      for name, c in data["checks"].items():
│ scripts/check_agents.py
│ @@ -122,6 +122,35 @@
│      except Exception:  # noqa: BLE001
│          pass
│
│ +    # Sisteminiai pasiūlymai neturi savininko eilėje: kūrėjas jų sąmoningai
│ +    # neima, o architektas paleidžiamas kartą per dieną. 2026-11-09 tokių buvo
│ +    # 8, seniausias — 1 d.; jei jie laukia ilgiau nei 3 d., tai jau ne eilė, o
│ +    # pamirštas darbas, kuris tyliai palieka vartus aklus.
│ +    try:
│ +        import db as _db2
│ +        from kurejas_queue import SYSTEM_PREFIXES as _sys_prefixes
│ +
│ +        cutoff = dt.datetime.now().astimezone() - dt.timedelta(days=3)
│ +        waiting: list[str] = []
│ +        for r in _db2.proposals(500, status="new"):
│ +            target = (r.get("target") or "").strip()
│ +            paths = [p.strip() for p in target.replace(";", ",").split(",") if p.strip()]
│ +            if not paths or not all(p.startswith(_sys_prefixes) for p in paths):
│ +                continue
│ +            try:
│ +                stamp = dt.datetime.fromisoformat(r.get("created") or "")
│ +            except ValueError:
│ +                continue
│ +            if stamp.tzinfo is None:
│ +                stamp = stamp.replace(tzinfo=cutoff.tzinfo)
│ +            if stamp < cutoff:
│ +                waiting.append(f"#{r['id']} {(r.get('title') or '')[:60]}")
│ +        if waiting:
│ +            warnings.append(f"sisteminiai pasiūlymai laukia >3 d. ({len(waiting)}): "
│ +                            + "; ".join(waiting[:4]))
│ +    except Exception:  # noqa: BLE001
│ +        pass
│ +
│      if args.json:
│          print(json.dumps({"ok": not problems, "problems": problems, "warnings": warnings,
│                            "roles": len(roles)}, ensure_ascii=False, indent=2))
│ dashboard/server.py
│ @@ -581,7 +581,7 @@
│      <div class="card"><h2>Šiuo metu dirba</h2><div class="big" id="runCount">—</div>
│        <div id="runList" class="kv" style="display:block"></div></div>
│      <div class="card"><h2>Moduliai</h2><div class="big">${st.modules}</div><div class="kv"><span>užduotys</span><b>${st.tasks}</b></div><div class="kv"><span>simuliacijos</span><b>${st.sims}</b></div></div>
│ -    <div class="card"><h2>Garsas</h2><div class="big">${st.audio_files}</div><div class="kv"><span>įrašai</span><b>${st.audio_mb} MB</b></div><div class="kv"><span>kalba</span><b>lt-LT</b></div></div>
│ +    <div class="card"><h2>Garsas</h2><div class="big">${st.audio_files}</div><div class="kv"><span>naudojami iš</span><b>${st.audio_total ?? st.audio_files}</b></div><div class="kv"><span>apimtis</span><b>${st.audio_mb} MB</b></div><div class="kv"><span>kalba</span><b>lt-LT</b></div></div>
│      <div class="card"><h2>Šiandien</h2><div class="big">${d.runs_today}</div><div class="kv"><span>paleidimai</span><b>${d.runs_today}</b></div><div class="kv"><span>atviri pasiūlymai</span><b id="openProp">—</b></div></div>
│      <div class="card" id="pubCard"><h2>Publikavimas</h2><div class="big" id="pubBig">—</div>
│        <div class="kv"><span>repo</span><b id="pubLocal">—</b></div>
│ agents/system-journal.md
│ @@ -39,3 +39,59 @@
│  - **Nepadaryta:** dienoraščio įrašo negeneravo pats (šis įrašas įrašytas ranka);
│    dėl to `check_agents.py` dabar įspėja, jei po architekto darbo dienoraštis
│    nepapildytas.
│ +
│ +## 2026-11-09 20:31 · sistemos-architektas #211
│ +
│ +- **Mačiau:** 208 paleidimai per 7 d.; nenaudingų paleidimų dabar daugiausia
│ +  istorinėse šakose (`sveikatos-inspektorius` 100 % iš 1, `metodininkas` 50 %,
│ +  `dizaineris` ir `programos-derintojas` po 50 %), o naujausi paleidimai (nuo
│ +  11-08) — be konfliktų. Pasiūlymai: 93 (new 12, blocked 1, done 71, obsolete 9).
│ +  **Visi 12 `new` yra sisteminiai** (`scripts/`, `agents/`, `docs/`, `dashboard/`) —
│ +  kūrėjas jų sąmoningai neima, o sąrašo, kuriuo kas nors jais eitų, nebuvo:
│ +  kiekvienas toks pasiūlymas yra vartų aklumas, kuris laukia savaitę.
│ +  Konkretūs įrodymai: `check_audio.py` sakė „500 tekstų, visi turi po du įrašus“
│ +  (tiesa), bet diske 1014 mp3, manifestas nurodo 1000 — 14 našlaičių nematomi;
│ +  `check_published.py` sakė „sutampa 35/35“, nors lygino tik ID aibes vienoje
│ +  kietai įrašytoje klasėje, o publikavimo agentas baitų lygybę ėjo įrodinėti
│ +  atskirais zondais du paleidimus iš eilės (#208, #210).
│ +- **Keičiau:**
│ +  - `scripts/check_audio.py` — atvirkštinė kryptis (diskas → manifestas):
│ +    našlaičiai išvardijami, skaičius skelbiamas kaip „naudojama N iš M“, yra
│ +    `--json` ir `--prune`; našlaitis lieka įspėjimu, ne klaida, kad CI nekristų
│ +    dėl istorinių failų.
│ +  - `scripts/check_published.py` — klasės imamos iš `grades.json`
│ +    (`status: live`), kiekvienas modulio failas lyginamas baitais (sha256) su
│ +    repo failu lygiagrečiai, pranešime atskirta „trūksta ID“ / „ID yra, turinys
│ +    pasenęs“; nesutapimas patikrinamas antrą kartą (LL-76).
│ +  - `agents/db.py` — bendra būsena skelbia naudojamų įrašų skaičių, ne disko
│ +    failų (`audio_files` = naudojami, `audio_total` = viso), o `grades_live`
│ +    imamas iš `grades.json`, ne įrašytas ranka.
│ +  - `scripts/system_report.py` — naujas blokas „Sisteminiai pasiūlymai
│ +    (architekto eilė)“ su amžiumi; klasifikacija importuojama iš
│ +    `kurejas_queue.py`, kad nebūtų antro sąrašo.
│ +  - `scripts/check_agents.py` — įspėjimas, kai sisteminis pasiūlymas laukia
│ +    ilgiau nei 3 d.
│ +  - `dashboard/server.py` — garso kortelė rodo „naudojami / viso“.
│ +- **Kodėl:** visi trys pataisymai yra ta pati klasė — **vartai matavo dalį, o
│ +  pranešdavo apie visumą**. Tai ne kosmetika: publikavimo vartai, kurie nemato
│ +  pasenusio failo, palieka vaikui seną turinį su „viskas sutampa“ ataskaita, o
│ +  garso vartai, kurie nemato našlaičių, leidžia manyti, kad 1014 failų yra
│ +  panaudoti. Trečiasis pakeitimas gydo priežastį, dėl kurios tokie pasiūlymai
│ +  užsiguli: eilė buvo, bet jos niekas nematė vienoje vietoje.
│ +- **Patikra:** `py_compile` ✔; `check_published.py` → 35/35, 5,1 s,
│ +  „✔ Repo ir gyva svetainė sutampa (ID, seka ir failų baitai)“; zondas su
│ +  vienu pridėtu baitu modulyje `01-garsas-ir-raide` → „PASENĘS TURINYS … repo
│ +  5045 B, gyvai 5044 B“, `rc=1`, failas grąžintas (`git checkout --`);
│ +  `check_audio.py` → „naudojama 1000 iš 1014 mp3“, 14 našlaičių išvardyti,
│ +  `rc=0`; `check_agents.py` 15 vaidmenų, 0 įspėjimų; `validate_content.py` 0/0;
│ +  `check_ui.py` ✔; `check_lessons.py` 77 įrašai ✔; `check_art.py` ✔;
│ +  `check_language.py --grade 1 --strict` rc 0; dashboard
│ +  `try-restart` + `/api/overview` → `audio_files 1000, audio_total 1014`,
│ +  HTML 200, kortelėje „naudojami iš“.
│ +- **Neišspręsta sąmoningai:** #7396 (`check_view.py` neturi 200 % teksto
│ +  režimo), #4921 (nė vieno <360 px ploto), #5827 (`check_language.py` nemato
│ +  `outcomes`), #4808 (atsarginiai simuliacijų sakiniai), #4516 (sakinio ilgis
│ +  lieka įspėjimu), #4455 (ataskaitų dydis), #5047, #5190, #5342, #5400 —
│ +  visos dabar matomos architekto eilėje su amžiumi. #5834 lieka `blocked`:
│ +  reikia žmogaus sprendimo, ar toliau vertinti kaip neįgyvendintą.
│ +
Paleidimas #211 — sistemos-architektas. Ką mačiau ir ką pakeičiau (viskas, kas pateikta žemiau, patikrinta realiais paleidimais):

SKAIČIAI
- system_report prieš: 208 paleidimai / 7 d.; nenaudingi: sveikatos-inspektorius 100 % (1), metodininkas 50 %, dizaineris 50 %, programos-derintojas 50 %, tikrintojas 36 %; pasiūlymai 93 (new 12, blocked 1, done 71, obsolete 9), seniausias 1 d.
- system_report po: tie patys paleidimų skaičiai (naujų paleidimų nebuvo), bet pasiūlymų bloke atsirado naujas sąrašas — „Sisteminiai pasiūlymai (architekto eilė): 12“ su amžiumi. Tai įrodymas, kad iki šiol 12 `new` pasiūlymų neturėjo savininko matomoje vietoje: visi jie sisteminiai (scripts/, agents/, docs/, dashboard/), o kūrėjas jų sąmoningai neima.

SISTEMINĖ DIAGNOZĖ
Visos trys problemos yra viena klasė: vartai matavo dalį, o pranešdavo apie visumą.
1. check_audio.py sakė „500 tekstų, visi turi po du įrašus“ — tiesa, bet diske 1014 mp3, manifestas nurodo 1000, t. y. 14 našlaičių buvo nematomi, o skaičius skambėjo kaip panaudotas visas turtas.
2. check_published.py sakė „sutampa 35/35“, nors lygino tik ID aibes vienoje kietai įrašytoje klasėje (grade-01). Baitų lygybę publikavimo agentas turėjo įrodinėti atskirais zondais du paleidimus iš eilės (#208, #210).
3. Sisteminiai pasiūlymai neturėjo eilės: kiekvienas jų — vartų aklumas, kuris laukia savaitę.

ĮGYVENDINTI PATAISYMAI
- scripts/check_audio.py — atvirkštinė kryptis (diskas → manifestas), našlaičių sąrašas, „naudojama N iš M“, `--json`, `--prune`. Įspėjimas, ne klaida.
- scripts/check_published.py — klasės iš grades.json (`status: live`), kiekvieno modulio failo baitų (sha256) palyginimas lygiagrečiai, atskirta „trūksta ID“ nuo „ID yra, turinys pasenęs“, nesutapimas tikrinamas antrą kartą (LL-76). Veikia per 5,1 s.
- agents/db.py — `audio_files` = naudojami įrašai, `audio_total` = viso; `grades_live` imamas iš grades.json, ne įrašytas ranka.
- scripts/system_report.py — „Sisteminiai pasiūlymai (architekto eilė)“ su amžiumi; klasifikacija importuota iš kurejas_queue.py (vienas šaltinis, ne antras sąrašas).
- scripts/check_agents.py — įspėjimas, kai sisteminis pasiūlymas laukia >3 d.
- dashboard/server.py — garso kortelė „naudojami iš“; servisas perkrautas (`try-restart`), /api/overview → `audio_files 1000, audio_total 1014`, HTML 200.

PATIKRA (realūs rezultatai)
- check_published.py → 35/35, „✔ Repo ir gyva svetainė sutampa (ID, seka ir failų baitai)“, rc 0.
- Neigiamas zondas: pridėjus vieną baitą į 01-garsas-ir-raide.json → „PASENĘS TURINYS … repo 5045 B, gyvai 5044 B“, rc 1; failas grąžintas, git status švarus (tik mano 3 failai + dashboard).
- check_audio.py → „✔ … naudojama 1000 iš 1014 mp3“, 14 našlaičių išvardyti, rc 0.
- check_agents.py 15 vaidmenų, 0 įspėjimų; validate_content 0/0; check_ui ✔; check_art ✔; check_language --grade 1 --strict rc 0.
- agents/system-journal.md papildytas įrašu „Mačiau / Keičiau / Kodėl / Patikra“.

LIKO NEPADARYTA (ir kodėl)
- agents/log/sistemos-architektas-2026-11-09T2024.md neįrašytas ir agents/state.json neatnaujintas — baigėsi įrankių limitas. Tai turi būti padaryta prieš kitą paleidimą (dienoraštis jau yra, jo check_agents netikrina kaip ataskaitos).
- Pasiūlymų #7397 ir #8716 statusai DB dar nepakeisti į `done` (failai lieka `new` pagal projektinę taisyklę; būsena gyvena DB) — reikia `db.set_proposal_status(7397, "done", …)` ir `(8716, "done", …)`.
- LL-77 („vartai tik viena kryptimi: patikrinta dalis, pranešta apie visumą“) nesuįrašytas į pamokos.md — pamokų skaičius liko 76.
- #7396 (check_view 200 % režimas), #4921 (<360 px plotas), #5827 (outcomes laukas), #4808, #4516, #4455, #5047, #5190, #5342, #5400 — sąmoningai neliesti; dabar jie matomi architekto eilėje su amžiumi. #5834 paliktas `blocked` žmogaus sprendimui.
- Turinio, simuliacijų, CSS ir scope.json neliečiau.

## klaidos

```
session_id: local-084ab74c34f052b8d393f0374b6f542fa5c505edfce6802f3695c57181c24852
```
