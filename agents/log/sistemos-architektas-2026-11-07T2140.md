# sistemos-architektas — 2026-11-07T2140

- paleidimas: #48 (manual)
- trukmė: 672s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

[atsarginis profilis deepseek41flash]

│ profiles/deepseek41flash/cache/scratch/probe48_db.py
│ @@ -0,0 +1,17 @@
│ +import sqlite3, json, sys
│ +
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +print("tables:", [r[0] for r in c.execute("select name from sqlite_master where type='table'")])
│ +print("--- last 20 runs ---")
│ +for r in c.execute("select id,role,status,started,finished,duration_s,substr(coalesce(note,''),1,60) note,substr(coalesce(validation,''),1,80) val from runs order by id desc limit 20"):
│ +    print(dict(r))
│ +print("--- role/status counts ---")
│ +for r in c.execute("select role,status,count(*) n from runs group by role,status order by role, status"):
│ +    print(tuple(r))
│ +print("--- proposals by status ---")
│ +for r in c.execute("select status,count(*) from proposals group by status"):
│ +    print(tuple(r))
│ +print("--- conflicts detail ---")
│ +for r in c.execute("select id,role,started,substr(coalesce(validation,''),1,300) v from runs where status='conflict' order by id desc"):
│ +    print(dict(r))
│ profiles/deepseek41flash/cache/scratch/probe48_overlap.py
│ @@ -0,0 +1,44 @@
│ +import sqlite3, datetime as dt
│ +
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +
│ +
│ +def p(s):
│ +    return dt.datetime.fromisoformat(s)
│ +
│ +
│ +rows = [dict(r) for r in c.execute("select id,role,status,started,finished from runs order by id")]
│ +print(f"{'id':>3} {'role':<26} {'status':<10} {'dur':>5} overlap")
│ +for r in rows:
│ +    if not r['finished']:
│ +        print(f"{r['id']:>3} {r['role']:<26} {r['status']:<10} {'-':>5} (running)")
│ +        continue
│ +    a, b = p(r['started']), p(r['finished'])
│ +    ov = []
│ +    for o in rows:
│ +        if o['id'] == r['id'] or not o['finished']:
│ +            continue
│ +        oa, ob = p(o['started']), p(o['finished'])
│ +        if oa < b and a < ob:
│ +            ov.append(f"#{o['id']}:{o['role']}")
│ +    dur = int((b - a).total_seconds())
│ +    print(f"{r['id']:>3} {r['role']:<26} {r['status']:<10} {dur:>5} {len(ov)} {','.join(ov[:4])}")
│ +
│ +print()
│ +conf = [r for r in rows if r['status'] == 'conflict' and r['finished']]
│ +pub = [r for r in rows if r['status'] == 'published' and r['finished']]
│ +
│ +
│ +def avg_overlap(group):
│ +    tot = 0
│ +    for r in group:
│ +        a, b = p(r['started']), p(r['finished'])
│ +        n = sum(1 for o in rows if o['id'] != r['id'] and o['finished']
│ +                and p(o['started']) < b and a < p(o['finished']))
│ +        tot += n
│ +    return tot / len(group) if group else 0
│ +
│ +
│ +print(f"conflict runs: {len(conf)}  avg overlapping runs: {avg_overlap(conf):.1f}")
│ +print(f"published runs: {len(pub)}  avg overlapping runs: {avg_overlap(pub):.1f}")
│ profiles/deepseek41flash/cache/scratch/probe48_queue.py
│ @@ -0,0 +1,38 @@
│ +import pathlib
│ +import shutil
│ +import sys
│ +
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +sys.path.insert(0, str(ROOT / 'agents'))
│ +
│ +db = __import__('db')
│ +copy = pathlib.Path('/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe48.db')
│ +shutil.copy(ROOT / 'agents' / 'runs.db', copy)
│ +db.DB_PATH = copy
│ +
│ +import importlib.util
│ +spec = importlib.util.spec_from_file_location('queue', ROOT / 'scripts' / 'kurejas_queue.py')
│ +q = importlib.util.module_from_spec(spec)
│ +spec.loader.exec_module(q)
│ +
│ +def counts():
│ +    rows = db.proposals(1000)
│ +    out = {}
│ +    for r in rows:
│ +        out[r['status']] = out.get(r['status'], 0) + 1
│ +    return out
│ +
│ +print('pries triage:', counts())
│ +print('eilėje (new):', len(q.queue()))
│ +print('eilės pirmi 3:', [(r['id'], r['type'], r['target']) for r in q.queue()[:3]])
│ +
│ +obs, dup = q.triage()
│ +print(f'triage: pasenę {obs}, dubliai {dup}')
│ +print('po triage:', counts())
│ +print('eilėje (new):', len(q.queue()))
│ +
│ +# Tai, ką daro run.py kiekvieno paleidimo pabaigoje:
│ +db.upsert_proposals(sorted((ROOT / 'agents' / 'proposals').glob('*.json')))
│ +print('po upsert_proposals:', counts())
│ +print('eilėje (new) po upsert:', len(q.queue()))
│ +print('pirmi 3 po upsert:', [(r['id'], r['type'], r['target']) for r in q.queue()[:3]])
│ profiles/deepseek41flash/cache/scratch/probe48_props.py
│ @@ -0,0 +1,11 @@
│ +import pathlib, sys
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +sys.path.insert(0, str(ROOT / 'agents'))
│ +import db
│ +
│ +rows = db.proposals(1000, status='new')
│ +print(len(rows), 'new')
│ +for r in sorted(rows, key=lambda r: int(r['id'])):
│ +    tgt = r['target'] or ''
│ +    exists = (ROOT / tgt).exists() if tgt else False
│ +    print(f"#{r['id']:<5} {r['type']:<11} {r['role']:<20} exist={str(exists):<5} {tgt[:58]}")
│ profiles/deepseek41flash/cache/scratch/probe48_dates.py
│ @@ -0,0 +1,30 @@
│ +import pathlib, sys, subprocess, datetime as dt
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +sys.path.insert(0, str(ROOT / 'agents'))
│ +import db
│ +
│ +
│ +def file_added(path: str):
│ +    out = subprocess.run(
│ +        ['git', 'log', '--diff-filter=A', '--format=%ct', '--', path],
│ +        cwd=ROOT, capture_output=True, text=True, timeout=20)
│ +    stamps = sorted(int(x) for x in out.stdout.split() if x.strip().isdigit())
│ +    return stamps[0] if stamps else None
│ +
│ +
│ +rows = [r for r in db.proposals(1000, status='new') if r['target']]
│ +for r in sorted(rows, key=lambda r: int(r['id'])):
│ +    tgt = r['target']
│ +    if not (ROOT / tgt).exists():
│ +        continue
│ +    added = file_added(tgt)
│ +    created = None
│ +    try:
│ +        created = dt.datetime.fromisoformat(r['created']).timestamp() if r['created'] else None
│ +    except ValueError:
│ +        pass
│ +    if added is None or created is None:
│ +        print(f"#{r['id']:<5} {r['type']:<11} (nežinoma: added={added} created={r['created']})")
│ +        continue
│ +    when = 'modulis VĖLIAU nei pasiūlymas' if added > created else 'modulis JAU buvo'
│ +    print(f"#{r['id']:<5} {r['type']:<11} {r['role']:<20} {dt.datetime.fromtimestamp(added):%m-%d %H:%M} vs {dt.datetime.fromtimestamp(created):%m-%d %H:%M}  {when}")
│ scripts/kurejas_queue.py
│ @@ -35,6 +35,39 @@
│  # „tema“ tipo pasiūlymas, kurio failas JAU yra, reiškia, kad modulis jau
│  # sukurtas (pasiūlymas pasenęs) — jo kurti antrą kartą nereikia.
│  OBSOLETE_TYPES = ("tema",)
│ +
│ +# „metodas“ su egzistuojančiu tikslu gali reikšti du skirtingus dalykus:
│ +#   - metodas, pagal kurį modulis jau sukurtas (panaudotas → nebe darbas),
│ +#   - metodo pastaba apie jau esamą modulį (dar darbas).
│ +# Skiriamės pagal git istoriją: jei failas atsirado PO pasiūlymo, metodas
│ +# buvo panaudotas jam kurti. Be šios taisyklės eilės galva amžinai rodo
│ +# jau įgyvendintą darbą ir kūrėjas eikvoja paleidimą „jau yra“ atsakymui (#1071).
│ +METHOD_TYPE = "metodas"
│ +
│ +
│ +def _module_added_at(rel: str) -> int | None:
│ +    """Kada failas atsirado repo istorijoje (Unix laikas) arba None."""
│ +    try:
│ +        out = subprocess.run(
│ +            ["git", "log", "--diff-filter=A", "--format=%ct", "--", rel],
│ +            cwd=ROOT, capture_output=True, text=True, timeout=20,
│ +        )
│ +    except Exception:  # noqa: BLE001
│ +        return None
│ +    stamps = sorted(int(s) for s in out.stdout.split() if s.strip().isdigit())
│ +    return stamps[0] if stamps else None
│ +
│ +
│ +def _method_already_used(created: str, added: int | None) -> bool:
│ +    """Ar modulis sukurtas jau po to, kai pasiūlymas parašytas."""
│ +    if added is None:
│ +        return False
│ +    try:
│ +        made = dt.datetime.fromisoformat(created).timestamp()
│ +    except (TypeError, ValueError):
│ +        return False
│ +    return added > made
│ +
│
│
│  def triage() -> tuple[int, int]:
│ scripts/kurejas_queue.py
│ @@ -84,6 +84,14 @@
│
│          if target and (ROOT / target).exists() and kind in OBSOLETE_TYPES:
│              db.set_proposal_status(int(r["id"]), "obsolete", "modulis jau sukurtas")
│ +            obsolete += 1
│ +            continue
│ +
│ +        # Metodas, pagal kurį modulis jau sukurtas po pasiūlymo — panaudotas.
│ +        if (target and kind == METHOD_TYPE and (ROOT / target).exists()
│ +                and _method_already_used(r.get("created") or "", _module_added_at(target))):
│ +            db.set_proposal_status(int(r["id"]), "obsolete",
│ +                                   "metodas panaudotas — modulis sukurtas po pasiūlymo")
│              obsolete += 1
│              continue
│
│ agents/run.py
│ @@ -260,11 +260,24 @@
│      return read(logs[-1])[-limit:]
│
│
│ -def platform_stats() -> str:
│ -    try:
│ -        return json.dumps(db.content_stats(), ensure_ascii=False)
│ +def platform_stats() -> dict:
│ +    try:
│ +        return db.content_stats()
│      except Exception:  # noqa: BLE001
│ -        return "{}"
│ +        return {}
│ +
│ +
│ +def headline(stats: dict) -> str:
│ +    """Viena eilutė apie platformos dydį — imama iš failų, ne iš kodo.
│ +
│ +    Buvo įrašyta ranka („13 modulių, 13 simuliacijų“) ir atsiliko nuo tikrovės:
│ +    kiekvienas agentas kiekvieną paleidimą skaitė melagingą skaičių ir galėjo
│ +    siūlyti tai, kas jau yra.
│ +    """
│ +    if not stats:
│ +        return "Šiuo metu gyva 1 klasė."
│ +    return (f"Šiuo metu gyva {stats.get('grades_live', 0)} klasė "
│ +            f"({stats.get('modules', 0)} modulių, {stats.get('sims', 0)} simuliacijų).")
│
│
│  def recent_runs_text(limit: int = 12) -> str:
│ agents/run.py
│ @@ -366,11 +366,13 @@
│          if line.lower().startswith("## baigties sąlyga"):
│              dod = role_text.split(line, 1)[1].strip()
│              break
│ +    st = platform_stats()
│      body = HEADER.format(
│          root=ROOT,
│          today=dt.date.today().isoformat(),
│          run_id=run_id,
│ -        stats=platform_stats(),
│ +        headline=headline(st),
│ +        stats=json.dumps(st, ensure_ascii=False),
│          recent=recent_runs_text(),
│          proposals=open_proposals_text(),
│          role=role,
│ agents/run.py
│ @@ -185,7 +185,7 @@
│  }
│
│  HEADER = """Tu esi SUPRASK platformos agentas. SUPRASK — atvira, nemokama, interaktyvi vizualinio
│ -mokymosi platforma Lietuvos 1–12 klasei. Šiuo metu gyva 1 klasė (13 modulių, 13 simuliacijų).
│ +mokymosi platforma Lietuvos 1–12 klasei. {headline}
│
│  PRIVALOMA TVARKA
│  1. Perskaityk: docs/SVIETIMAS-1-GAIRES.md, docs/KURINIO-STANDARTAS.md, docs/ARCHITEKTURA.md.
│ agents/run.py
│ @@ -539,23 +539,35 @@
│              pass
│
│
│ -def close_proposals(files: list[str], commit_sha: str) -> int:
│ -    """Pažymi įgyvendintus pasiūlymus, kurių tikslas pateko į commit'ą."""
│ -    closed = 0
│ -    try:
│ -        rows = db.proposals(200, status="new")
│ +def mark_implemented(proposal_id: int | None, files: list[str], commit_sha: str) -> bool:
│ +    """Pažymi įgyvendintą TIK tą pasiūlymą, kurį paleidimas ėmėsi vykdyti.
│ +
│ +    Anksčiau (`close_proposals`) užtekdavo, kad pasiūlymo `target` failas patektų
│ +    į commit'ą: pirmas sėkmingas publikavimas tylomis uždarydavo visas atviras
│ +    kritikos pastabas tam pačiam failui, nors jų niekas netaisė (#486). Todėl dabar
│ +    reikia dviejų dalykų: aiškaus pasiūlymo numerio IR pakeisto jo tikslo.
│ +    """
│ +    if not proposal_id:
│ +        return False
│ +    try:
│ +        row = next((r for r in db.proposals(500) if int(r["id"]) == int(proposal_id)), None)
│      except Exception:  # noqa: BLE001
│ -        return 0
│ -    changed = set(files)
│ -    for row in rows:
│ -        target = (row.get("target") or "").strip()
│ -        if target and target in changed:
│ -            try:
│ -                db.set_proposal_status(row["id"], "done", f"įgyvendinta commit {commit_sha[:7]}")
│ -                closed += 1
│ -            except Exception:  # noqa: BLE001
│ -                pass
│ -    return closed
│ +        return False
│ +    if not row:
│ +        return False
│ +    target = (row.get("target") or "").strip()
│ +    if target and target not in set(files):
│ +        return False
│ +    try:
│ +        db.set_proposal_status(int(proposal_id), "done", f"įgyvendinta commit {commit_sha[:7]}")
│ +        return True
│ +    except Exception:  # noqa: BLE001
│ +        return False
│ +
│ +
│ +def close_proposals(files: list[str], commit_sha: str, implemented_id: int | None = None) -> int:
│ +    """Suderinamumo apvalkalas: grąžina, kiek pasiūlymų uždaryta (0 arba 1)."""
│ +    return 1 if mark_implemented(implemented_id, files, commit_sha) else 0
│
│
│  def _union_markdown(path: Path) -> None:
│ agents/run.py
│ @@ -681,12 +681,14 @@
│      return f"išstumta {len(pending)} commit'ų"
│
│
│ -def publish(role: str, run_id: int, files: list[str], summary: str, allow_revert: bool = True) -> dict:
│ +def publish(role: str, run_id: int, files: list[str], summary: str, allow_revert: bool = True,
│ +            implemented_id: int | None = None) -> dict:
│      with git_lock():
│ -        return _publish(role, run_id, files, summary, allow_revert)
│ -
│ -
│ -def _publish(role: str, run_id: int, files: list[str], summary: str, allow_revert: bool = True) -> dict:
│ +        return _publish(role, run_id, files, summary, allow_revert, implemented_id)
│ +
│ +
│ +def _publish(role: str, run_id: int, files: list[str], summary: str, allow_revert: bool = True,
│ +             implemented_id: int | None = None) -> dict:
│      """Validuoja ir paskelbia agento pakeitimus. Grąžina rezultatą."""
│      if not files:
│          return {"status": "empty", "detail": "Agentas failų nepakeitė — rezultato nėra.", "sha": "", "validation": ""}
│ agents/run.py
│ @@ -757,7 +757,7 @@
│      # Lokalus `main` turi sekti paskutinį paskelbtą commit'ą. Be to `git push
│      # origin main` (rankinis ar iš kito vaidmens) atsimušė kaip non-fast-forward.
│      git("branch", "-f", "main", "HEAD")
│ -    closed = close_proposals(files, sha)
│ +    closed = close_proposals(files, sha, implemented_id)
│
│      detail = f"Paskelbta {len(files)} failų" + (f", uždaryti {closed} pasiūlymai" if closed else "")
│      return {"status": "published", "detail": detail, "sha": sha, "validation": validation}
│ agents/run.py
│ @@ -905,7 +905,8 @@
│          db.upsert_proposals(sorted(PROPOSALS.glob("*.json")))
│
│          # Paskelbimas — bėgiklio, ne agento, darbas.
│ -        result = publish(args.role, run_id, files, out or args.role)
│ +        result = publish(args.role, run_id, files, out or args.role,
│ +                         implemented_id=int(proposal["id"]) if proposal else None)
│          if status in ("ok", "partial"):
│              status = result["status"]
│          # Patikros vaidmenys (tikrintojas, publikavimo-agentas, kuratorius) iš
│ @@ -916,13 +917,13 @@
│
│          if proposal:
│              if status == "published":
│ -                db.set_proposal_status(int(proposal["id"]), "done", f"įgyvendinta commit {result['sha'][:7]}")
│ +                mark_implemented(int(proposal["id"]), files, result["sha"])
│              elif status in ("rejected", "conflict", "unpushed", "failed", "timeout"):
│                  db.set_proposal_status(int(proposal["id"]), "blocked", f"{status}: {result['detail'][:120]}")
│
│          db.finish_run(
│              run_id, status, code, elapsed, str(log_path.relative_to(ROOT)), out, files,
│ -            commit_sha=result["sha"], validation=result["validation"],
│ +            commit_sha=result["sha"], validation=result["validation"], detail=result["detail"],
│          )
│          update_state(args.role, cfg, status, log_path)
│
│ agents/run.py
│ @@ -818,7 +818,7 @@
│          result = publish(args.role, run_id, files, f"atkurtas {args.role} darbas", allow_revert=False)
│          db.upsert_proposals(sorted(PROPOSALS.glob("*.json")))
│          db.finish_run(run_id, result["status"], 0, 0, "", result["detail"], files,
│ -                      commit_sha=result["sha"], validation=result["validation"])
│ +                      commit_sha=result["sha"], validation=result["validation"], detail=result["detail"])
│          print(f"{args.role} #{run_id}: {result['status']} — {result['detail']}"
│                + (f" (commit {result['sha'][:7]})" if result["sha"] else ""))
│          return 0 if result["status"] == "published" else 1
│ agents/run.py
│ @@ -940,7 +940,8 @@
│              f"# {args.role} — {stamp}\n\n- paleidimas: #{run_id}\n- Baigėsi laikas ({timeout}s).\n",
│              encoding="utf-8",
│          )
│ -        db.finish_run(run_id, "timeout", 124, elapsed, str(log_path.relative_to(ROOT)), f"Baigėsi laikas ({timeout}s).")
│ +        db.finish_run(run_id, "timeout", 124, elapsed, str(log_path.relative_to(ROOT)),
│ +                      f"Baigėsi laikas ({timeout}s).", detail=f"Baigėsi laikas ({timeout}s).")
│          update_state(args.role, cfg, "timeout", log_path)
│          print(f"{args.role} #{run_id}: timeout")
│          return 124
│ agents/run.py
│ @@ -681,6 +681,29 @@
│      return f"išstumta {len(pending)} commit'ų"
│
│
│ +ANSI_RE = re.compile(r"\x1b\[[0-9;]*[A-Za-z]")
│ +BOX_RE = re.compile(r"^[\s│┃┆┊╎╏|┌┐└┘├┤┬┴┼─━═╭╮╰╯▏▕]+")
│ +# Eilutės, kurios yra įrankio išklotinė, o ne agento išvada.
│ +NOISE_RE = re.compile(r'(^\s*[{}]|": |^\+|^@@|^diff |^\+\+\+|^---)')
│ +
│ +
│ +def summary_line(text: str, limit: int = 90) -> str:
│ +    """Pirmoji prasminga atsakymo eilutė — commit'o žinutei.
│ +
│ +    Hermes TUI rašo į stdout ir rėmelį, ir įrankių išklotines, todėl anksčiau
│ +    commit'o žinutė būdavo „│ assets/js/app.js“, o git istorija — neįskaitoma:
│ +    pagal ją neįmanoma pasakyti, ką paleidimas pakeitė. Imame pirmą eilutę,
│ +    kuri turi bent tris žodžius ir nėra išklotinės fragmentas.
│ +    """
│ +    for line in (text or "").splitlines():
│ +        clean = BOX_RE.sub("", ANSI_RE.sub("", line)).strip()
│ +        clean = clean.lstrip("#>*-+ ").strip()
│ +        if len(clean) < 12 or len(clean.split()) < 3 or NOISE_RE.search(line):
│ +            continue
│ +        return clean[:limit]
│ +    return ""
│ +
│ +
│  def publish(role: str, run_id: int, files: list[str], summary: str, allow_revert: bool = True,
│              implemented_id: int | None = None) -> dict:
│      with git_lock():
│ agents/run.py
│ @@ -735,7 +735,7 @@
│      branch = f"agent/{role}-{dt.date.today().isoformat()}"
│      git("checkout", "-B", branch)
│
│ -    first_line = (summary or role).strip().splitlines()[0][:90]
│ +    first_line = summary_line(summary) or role
│      msg = f"[{role}] #{run_id}: {first_line}\n\nPaskelbta automatiškai po validacijos."
│
│      # Komituojame TIK šio paleidimo failus: `git add -A` kartą įtraukė ir
│ agents/db.py
│ @@ -22,6 +22,10 @@
│      ("runs", "commit_sha", "TEXT"),
│      ("runs", "pr_url", "TEXT"),
│      ("runs", "validation", "TEXT"),
│ +    # Bėgiklio sprendimas („Paskelbta 2 failų“, „Konfliktas su origin/main: …“).
│ +    # Be jo konflikto priežastis likdavo tik stdout'e ir dingdavo su terminalu:
│ +    # 18 paleidimų iš eilės krito, o kodėl — niekur nebuvo užrašyta.
│ +    ("runs", "detail", "TEXT"),
│      ("proposals", "note", "TEXT"),
│  )
│
│ agents/db.py
│ @@ -120,14 +120,16 @@
│      commit_sha: str = "",
│      pr_url: str = "",
│      validation: str = "",
│ +    detail: str = "",
│  ) -> None:
│      with connect() as conn:
│          conn.execute(
│              """UPDATE runs SET status=?, finished=?, exit_code=?, duration_s=?, log_path=?, summary=?, artifacts=?,
│ -                               commit_sha=?, pr_url=?, validation=?
│ +                               commit_sha=?, pr_url=?, validation=?, detail=?
│                 WHERE id=?""",
│              (status, now(), exit_code, duration_s, log_path, summary[:4000],
│ -             json.dumps(artifacts or [], ensure_ascii=False), commit_sha, pr_url, validation[:2000], run_id),
│ +             json.dumps(artifacts or [], ensure_ascii=False), commit_sha, pr_url, validation[:2000],
│ +             detail[:500], run_id),
│          )
│
│
│ scripts/system_report.py
│ @@ -50,7 +50,8 @@
│          cell["duration_s"] += int(r.get("duration_s") or 0)
│          started = r.get("started") or ""
│          if cell["last"] is None or started > (cell["last"].get("started") or ""):
│ -            cell["last"] = {"started": started, "status": st, "summary": (r.get("summary") or "")[:160]}
│ +            cell["last"] = {"started": started, "status": st, "summary": (r.get("summary") or "")[:160],
│ +                            "detail": (r.get("detail") or "")[:200]}
│      for cell in per_role.values():
│          cell["avg_min"] = round(cell["duration_s"] / max(1, cell["runs"]) / 60, 1)
│          cell["useless_ratio"] = round(
│ scripts/system_report.py
│ @@ -200,7 +200,17 @@
│      for t in data["timers"]:
│          print(f"  {t['activates']:<46} next {t['next']}")
│
│ -    print("\nĮjungtos klasės:", data["scope"]["enabled"])
│ +    # Diagnostika: paskutiniai nepavykę paleidimai kartu su bėgiklio priežastimi.
│ +    # Be šio bloko konfliktų priežastis matydavo tik tas, kuris tą akimirką žiūrėjo į terminalą.
│ +    broken = ("conflict", "rejected", "unpushed", "failed", "timeout")
│ +    problems = [r for r in rows if (r.get("status") or "") in broken]
│ +    if problems:
│ +        print("\nPaskutinės problemos (bėgiklio žodžiais):")
│ +        for r in problems[:5]:
│ +            print(f"  #{r['id']} {r['role']} · {r['status']}: {(r.get('detail') or '— priežastis neužrašyta')[:150]}")
│ +
│ +    enabled = data["scope"]["enabled"]
│ +    print("\nĮjungtos klasės:", enabled)
│      return 0
│
│
│ profiles/deepseek41flash/cache/scratch/probe48_prompt.py
│ @@ -0,0 +1,32 @@
│ +import pathlib
│ +import sys
│ +
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +sys.path.insert(0, str(ROOT / 'agents'))
│ +
│ +import run  # noqa: E402
│ +
│ +cfg = run.ROLES['sistemos-architektas']
│ +prompt = run.build_prompt('sistemos-architektas', cfg, 48)
│ +lines = prompt.splitlines()
│ +print('PROMPT pradžia:')
│ +for line in lines[:8]:
│ +    print('  ', line)
│ +print()
│ +print('ar liko neišpildytų vietų:', '{' in prompt.split('--- PLATFORMOS BŪKLĖ ---')[0])
│ +
│ +print('\nsummary_line bandymai:')
│ +cases = [
│ +    '│ assets/js/sims/matematika.js',
│ +    '│ @@ -0,0 +1,19 @@',
│ +    '{',
│ +    '## 1. Ką radau',
│ +    'Modulis 15-laikas jau yra repo ir jo simuliacija veikia.',
│ +    '"title": "Laikas: dvi rodyklės sujungtos",',
│ +    '',
│ +]
│ +for c in cases:
│ +    print(f'  {c[:50]!r:55} -> {run.summary_line(c)!r}')
│ +
│ +print('\nheadline:', run.headline(run.platform_stats()))
│ +print('platform_stats:', run.platform_stats())
│ agents/run.py
│ @@ -698,7 +698,9 @@
│      for line in (text or "").splitlines():
│          clean = BOX_RE.sub("", ANSI_RE.sub("", line)).strip()
│          clean = clean.lstrip("#>*-+ ").strip()
│ -        if len(clean) < 12 or len(clean.split()) < 3 or NOISE_RE.search(line):
│ +        if len(clean) < 12 or len(clean.split()) < 3:
│ +            continue
│ +        if NOISE_RE.search(line) or NOISE_RE.search(clean):
│              continue
│          return clean[:limit]
│      return ""
│ profiles/deepseek41flash/cache/scratch/probe48_mark.py
│ @@ -0,0 +1,28 @@
│ +import pathlib
│ +import shutil
│ +import sys
│ +
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +sys.path.insert(0, str(ROOT / 'agents'))
│ +
│ +import db  # noqa: E402
│ +import run  # noqa: E402
│ +
│ +copy = pathlib.Path('/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe48_mark.db')
│ +shutil.copy(ROOT / 'agents' / 'runs.db', copy)
│ +db.DB_PATH = copy
│ +db.init()
│ +
│ +
│ +def st(pid):
│ +    return next(r['status'] for r in db.proposals(1000) if int(r['id']) == pid)
│ +
│ +
│ +T = 'content/lt/grade-01/matematika/04-skaiciu-tiese.json'
│ +print('#224 prieš:', st(224))
│ +print("be numerio      ->", run.mark_implemented(None, [T], 'abc1234'), st(224))
│ +print("kitas failas    ->", run.mark_implemented(224, ['assets/js/app.js'], 'abc1234'), st(224))
│ +print("tikslas pakeistas ->", run.mark_implemented(224, [T], 'abc1234'), st(224))
│ +print("kiti high liko new:", sum(1 for r in db.proposals(1000) if r['status'] == 'new'),
│ +      "done:", [r['id'] for r in db.proposals(1000) if r['status'] == 'done'])
│ +print("note:", next((r['note'] for r in db.proposals(1000) if int(r['id']) == 224), ''))
│ agents/README.md
│ @@ -1,6 +1,6 @@
│  # Agentai
│
│ -Dvylika agentų, kurie nuolat vysto SUPRASK. Kiekvienas paleidimas — vienas vaidmuo, vienas įrašas `agents/runs.db`, vienas žurnalas `agents/log/`.
│ +Penkiolika agentų, kurie nuolat vysto SUPRASK. Kiekvienas paleidimas — vienas vaidmuo, vienas įrašas `agents/runs.db`, vienas žurnalas `agents/log/`.
│
│  ## Ciklas
│
│ agents/README.md
│ @@ -29,6 +29,9 @@
│  | `kritikas` | deepseekv4flashlatest | nepriklausoma kritika | kritika, blokavimai |
│  | `programos-derintojas` | deepseek41flash | atitiktis programai | atitikties pasiūlymai |
│  | `leidejas` | deepseek41flash | PR sujungimas | sujungti PR |
│ +| `publikavimo-agentas` | deepseek41flash | sukurtas turinys pasiekia `main` ir svetainę | išstumti commit'ai |
│ +| `kalbu-redaktorius` | deepseek41flash | formuluočių vienareikšmiškumas, ką vaikas mato ekrane | pataisyti moduliai |
│ +| `sistemos-architektas` | deepseekpro | agentų sistemos matavimas ir taisymas | pakeisti vaidmenys, grafikai, skriptai |
│  | `sveikatos-inspektorius` | deepseek41flash | gyvos svetainės patikra | ataskaita |
│  | `kuratorius` | deepseek41flash | savaitės suvestinė | suvestinė |
│
│ agents/README.md
│ @@ -52,7 +52,7 @@
│  3. įrašo žurnalą, DB įrašą (statusas, trukmė, pakeisti failai), atnaujina `state.json`;
│  4. suindexuoja `agents/proposals/*.json` į DB.
│
│ -Užraktas (`agents/.run.lock`) neleidžia dviem agentams dirbti vienu metu.
│ +Užraktai: kiekvienas vaidmuo turi savo `.run.<vaidmuo>.lock`, todėl kūrėjo eilė neblokuoja kitų agentų; git operacijos (commit + merge + push) serializuojamos atskiru `.git.lock`. Du skirtingi vaidmenys vis tiek dirba viename darbiniame kataloge, todėl prieš paleidimą bėgiklis sutvarko paliktus pakeitimus (`[sistema]` commit'as).
│
│  ## Pasiūlymai
│
│ @@ -71,6 +71,12 @@
│    "evidence": ["research/wiki/curriculum/matematika-1-klase.md"]
│  }
│  ```
│ +
│ +**Būsena gyvena DB, ne JSON faile.** Faile beveik visada parašyta `"status": "new"` — tai šablonas. `upsert_proposals()` `new` iš failo ignoruoja, kad triage (`obsolete`) ir publikavimas (`done`) nebūtų nunulinami kiekvieno paleidimo pabaigoje. Jei nori, kad būsena pasikeistų iš failo, įrašyk ją aiškiai (`done`, `blocked`, `obsolete`).
│ +
│ +**Įgyvendintas pasiūlymas uždaromas tik tada, kai jis buvo aiškiai duotas ir pasikeitė jo `target`.** Anksčiau užtekdavo, kad tas failas patektų į bet kokį commit'ą — ir vienas publikavimas tylomis uždarydavo visas atviras pastabas tam pačiam failui (#486).
│ +
│ +Eilę (`scripts/kurejas_queue.py`) prieš darbą tvarko triage: `tema`, kurios failas jau yra, ir `metodas`, kurio modulis sukurtas **po** pasiūlymo, žymimi `obsolete` — kitaip eilės galva amžinai rodo jau įgyvendintą darbą (#1071).
│
│  Kritikas gali blokuoti PR: `agents/proposals/blocks/pr-<n>.json`. `leidejas` tokio PR nesujungs.
│
│ agents/README.md
│ @@ -96,7 +96,7 @@
│  ## Taisyklės agentams
│
│  - Visi agentai privalo laikytis `docs/SVIETIMAS-1-GAIRES.md`. Prieštaraujantis turinys atmetamas.
│ -- `kurejas` ir `simuliaciju-inzinierius` niekada necommitina į `main` — tik PR.
│ +- `kurejas` ir `simuliaciju-inzinierius` patys į `main` necommitina: jų pakeitimus validuoja ir publikuoja bėgiklis (`publish()`), o nepavykus patikrai — atmeta.
│  - `kritikas` nieko netaiso — tik fiksuoja ir blokuoja.
│  - `leidejas` neautorius: sujungia tik tai, kas praėjo validatorius ir neturi blokų.
│  - Joks agentas nerenka asmens duomenų ir nenaudoja mokamų paslaugų.
│ research/wiki/guidelines/pamokos.md
│ @@ -117,3 +117,10 @@
│  - **Priežastis:** spėjimas buvo naudojamas kaip „durų“ mechanizmas (atrakinti monetoms), o ne kaip duomuo: reikšmė įrašyta, bet rezultato tekstas jos neperskaitė.
│  - **Taisyklė:** jei modelis prašo spėjimo, jis privalo jį **palyginti su tuo, kas įvyko** pirmos baigties metu („Spėjai 3, o lėkštėje 2“). Jei spėjimas nesutampa — pasakyk, kuo skyrėsi, bet neatskleisk teisingo atsakymo. Spėjimas be palyginimo yra dekoracija, o ne mokymasis.
│  - **Patikra:** zondas, kuris įrašo spėjimą (`api.ask` laukas), atlieka veiksmą ir tikrina, kad `#sim-readout` tekste būtų spėjimo skaičius. `check_view.py` to nepagauna — jis matuoja išdėstymą, ne pranešimų turinį. Tas pats trūkumas lieka `16-lygybe-svarstykles` simuliacijoje (`sv-*`), todėl jis įrašytas pasiūlymu simuliacijų inžinieriui.
│ +
│ +## LL-16 — Būsena, kuri grįžta atgal per importą
│ +
│ +- **Simptomas:** kūrėjo eilė kiekvieną dieną prasidėdavo tuo pačiu jau įgyvendintu pasiūlymu; 41 pasiūlymas „naujas“ kabėjo 4 dienas, o per tą laiką eilė įgyvendino 0. Tie patys 5–9 pasiūlymai buvo žymimi pasenusiais, bet po kelių minučių vėl atsirasdavo eilės galvoje.
│ +- **Priežastis:** būsena saugoma dviejose vietose — DB (`new` / `done` / `obsolete` / `blocked`) ir pasiūlymo JSON faile, kuriame visada parašyta `"status": "new"`. `upsert_proposals()` kiekvieno paleidimo pabaigoje imdavo `status` iš failo, todėl triage ir publikavimo sprendimai buvo nunulinami, o eilė vėl imdavo tą patį darbą (pasiūlymai #1071, #486).
│ +- **Taisyklė:** **kiekvienas būsenos laukas turi vieną savininką.** Jei įrašas importuojamas iš šablono, importas gali kurti naują įrašą, bet negali atstatyti jau priimto sprendimo: `new` iš šaltinio reiškia „nieko nesakau“, o ne „atstatyk“. Prieš rašydami `UPDATE … SET status=excluded.status`, paklausk, kas yra to lauko savininkas.
│ +- **Patikra:** zondas, kuris (1) paleidžia triage, (2) užrašo būsenų kiekius, (3) pakartoja importą ir (4) palygina: jei po importo `done`/`obsolete` skaičius sumažėjo — defektas. Šiame pataisyme: prieš 43 new → po triage 38 new + 5 obsolete → po importo **vėl 45 new**, 0 obsolete.
## Ką radau (matuota, ne spėliota)

`python3 scripts/system_report.py` prieš darbą — 48 paleidimai, 13 vaidmenų:

```
kurejas 9 (33% nenaud.) · ideator 8 (50%) · tikrintojas 5 (60%) · leidejas 4 (50%)
kritikas 4 (50%) · simuliaciju-inzinierius 4 (50%) · metodininkas 4 (75%)
pasiūlymai: 44 · done 3, new 41 · seniausias neapdorotas prieš 4 d.
```

Perskaičius DB paleidimų intervalus paaiškėjo, kad tie procentai yra **istoriniai**: 18 paleidimų iš eilės (11-05 07:12 → 11-07 09:42) krito su `conflict`, o paskutiniai 11 paleidimų — 0 konfliktų. Konfliktai nebuvo konkurencijos pasekmė (persidengiančių paleidimų vidurkis konfliktų grupėje 0,0) — tai buvo užsikimšusi publikavimo būsena, kurią 11-07 ~10:50 išsprendė atskiri commit'ai. **Šiandien konfliktų problema nebeegzistuoja, todėl jos „netaisiau“.**

Tikroji gyva sistema — pasiūlymų eilė. Radau ir įrodžiau šakninę priežastį: `triage()` pažymėdavo 5 pasiūlymus `obsolete`, o `db.upsert_proposals()` kiekvieno paleidimo pabaigoje grąžindavo visus į `new`, nes ėmė `status` iš JSON šablono, kuriame visada `"status": "new"`. Išmatuota: 43 new → po triage 38 new + 5 obsolete → po importo **vėl 45 new, 0 obsolete**. Todėl eilė amžinai prasidėdavo #1/#2/#11 — jau egzistuojančiais moduliais — ir per 4 dienas įgyvendino 0.

## Ką pakeičiau

1. **`scripts/kurejas_queue.py`** — triage dabar atpažįsta ir „panaudotą metodą“: `metodas`, kurio modulis sukurtas **po** pasiūlymo (data imama iš `git log --diff-filter=A`), žymimas `obsolete`; `#187` (metodas apie jau seniai esantį modulį) sąmoningai lieka darbu. Rezultatas zonde: triage 5 → **9 pasenę**, eilės galva — **#137** (pirmas realus turinio darbas), nebe #19.
2. **`agents/run.py`** — `close_proposals()` pakeistas į `mark_implemented()`: pasiūlymas uždaromas tik jei jis buvo aiškiai duotas (`--proposal`) **ir** pasikeitė jo `target` (#486 — vienas publikavimas nebeuždaro svetimų kritikų); antraštė „13 modulių, 13 simuliacijų“ keičiama skaičiais iš failų (dabar 18/18) — kiekvienas agentas kiekvieną paleidimą skaitė melagingą platformos dydį; commit'o žinutė imama iš pirmos prasmingos eilutės, ne iš TUI rėmelio (`│ assets/js/app.js` → normalus sakinys).
3. **`agents/db.py`** — naujas `runs.detail` stulpelis: bėgiklio sprendimas („Konfliktas su origin/main: …“) nebedingsta su terminalu. Būtent todėl 18 konfliktų liko nediagnozuoti — priežastis niekur nebuvo užrašyta.
4. **`scripts/system_report.py`** — ataskaita rodo paskutines problemas su bėgiklio priežastimi.
5. **`agents/README.md`** — 12→15 vaidmenų, užraktų aprašas (buvo neteisingas), nauja taisyklė: būsena gyvena DB, JSON — šablonas.
6. **`research/wiki/guidelines/pamokos.md`** — LL-16 „Būsena, kuri grįžta atgal per importą“ (4 laukai, su skaičiais).

Patikrinta: `py_compile` OK; prompto zondas rodo `(18 modulių, 18 simuliacijų)` ir jokių neišpildytų `{}`; `summary_line` atmeta rėmelį/diff'ą ir parenka sakinį; `mark_implemented` (DB kopijoje): be numerio → False, kitas failas → False, tikslas pakeistas → True; `db.py` migracija pridėjo `detail`.

## Neišspręsta sąmoningai

- **`db.py` statuso pataisą jau buvo įtraukęs kūrėjas (#47, commit 94e4358)** — aš pridėjau tik triage taisyklę ir `detail`; pasiūlymų #1071/#486 DB žymėjimo ir `check_agents`/`gen_timers` (ROLES neliečiau) bei dienoraščio įrašo **nepadariau**, nes pasiekiau įrankių limitą. Liko: `python3 scripts/check_agents.py`, `check_lessons.py`, triage paleidimas ties gyva DB (41 → ~33), įrašas `agents/system-journal.md`, `agents/state.json`.
- **Du vaidmenys dirba viename darbiniame kataloge** — kūrėjo eilė veikė visą laiką, kol aš dirbau: mano paleidimo `ensure_clean` į commit'ą įtraukė kūrėjo nebaigtą `db.py` pataisymą kaip `[sistema]`, o jo `ensure_clean` gali įtraukti mano failus. Tai realus defektas (prarandama autorystė, gali būti publikuojamas pusiau parašytas failas), bet jam reikia atskiro sprendimo — ne vieno pataisymo.
- **`#768`** (kalbos tikrintuvas leidžia 2 žodžiais ilgesnius sakinius) ir **`#223`** (README/ARCHITEKTŪRA skaičiai) — kitų vaidmenų darbas.

## klaidos

```
session_id: local-2d00c2daae27a3b67ec6becacfe13d049a9abe131d816ed2f5849d137ae905d0
```
