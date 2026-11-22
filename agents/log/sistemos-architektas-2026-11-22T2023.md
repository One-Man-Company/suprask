# sistemos-architektas — 2026-11-22T2023

- paleidimas: #445 (manual)
- trukmė: 1221s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/q445.py
│ @@ -0,0 +1,14 @@
│ +import sqlite3, json, sys
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +cols = [r[1] for r in c.execute("PRAGMA table_info(proposals)")]
│ +print(cols)
│ +ids = [int(x) for x in sys.argv[1:]]
│ +for pid in ids:
│ +    r = c.execute("SELECT * FROM proposals WHERE id=?", (pid,)).fetchone()
│ +    if not r:
│ +        print(pid, 'MISSING'); continue
│ +    d = dict(r)
│ +    print('=== ', pid)
│ +    for k, v in d.items():
│ +        print(f"  {k}: {str(v)[:2000]}")
│ profiles/deepseek41flash/cache/scratch/runs.py
│ @@ -0,0 +1,14 @@
│ +import sqlite3, sys
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +role = sys.argv[1] if len(sys.argv) > 1 else None
│ +q = "select id,role,status,duration_s,exit_code,started,log_path,substr(summary,1,300) as sum300 from runs"
│ +args = ()
│ +if role:
│ +    q += " where role=? and started >= '2026-11-15'"
│ +    args = (role,)
│ +q += " order by id desc limit 40"
│ +for r in c.execute(q, args):
│ +    print(r['id'], r['role'], r['status'], r['duration_s'], r['exit_code'], r['started'], (r['log_path'] or '')[-40:])
│ +    if r['sum300']:
│ +        print('    ', r['sum300'].replace('\n', ' | ')[:300])
│ profiles/deepseek41flash/cache/scratch/m445_stale.py
│ @@ -0,0 +1,49 @@
│ +"""Measure: proposals whose target file already exists (metodas/tema) and how stale they are."""
│ +import sqlite3, subprocess, datetime as dt, pathlib, sys
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +c = sqlite3.connect(ROOT / 'agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +
│ +def added_at(rel):
│ +    out = subprocess.run(['git', 'log', '--diff-filter=A', '--format=%ct', '--', rel],
│ +                         cwd=ROOT, capture_output=True, text=True, timeout=30)
│ +    st = sorted(int(s) for s in out.stdout.split() if s.strip().isdigit())
│ +    return st[0] if st else None
│ +
│ +rows = [dict(r) for r in c.execute("select id,role,type,title,target,status,created,note from proposals")]
│ +print('total proposals:', len(rows))
│ +for st in ('new', 'blocked', 'running', 'done', 'obsolete'):
│ +    print(f'  {st}: {sum(1 for r in rows if r["status"]==st)}')
│ +
│ +# status new + target exists
│ +hits = []
│ +for r in rows:
│ +    t = (r['target'] or '').strip()
│ +    if r['status'] not in ('new', 'blocked'):
│ +        continue
│ +    if not t or not (ROOT / t).exists():
│ +        continue
│ +    a = added_at(t)
│ +    if a is None:
│ +        continue
│ +    try:
│ +        made = dt.datetime.fromisoformat(r['created']).timestamp()
│ +    except Exception:
│ +        continue
│ +    if a > made:
│ +        hits.append((r['id'], r['role'], r['type'], r['status'], r['created'], t,
│ +                     dt.datetime.fromtimestamp(a).isoformat(timespec='minutes'), (r['note'] or '')[:70]))
│ +print(f'\ntarget created AFTER proposal (still open): {len(hits)}')
│ +kind = {}
│ +for h in hits:
│ +    kind[(h[2], h[3])] = kind.get((h[2], h[3]), 0) + 1
│ +print('  by (type,status):', kind)
│ +for h in sorted(hits)[:30]:
│ +    print('  ', h)
│ +
│ +print('\nblocked notes containing "tikslas nepakeistas":',
│ +      sum(1 for r in rows if r['status'] == 'blocked' and 'tikslas nepakeistas' in (r['note'] or '')))
│ +print('\nsystem-target open proposals (new/blocked):')
│ +for r in rows:
│ +    if r['status'] in ('new', 'blocked') and r['target'] and r['target'].startswith(('agents/','scripts/','deploy/','dashboard/','docs/')):
│ +        print('  ', r['id'], r['status'], r['priority'] if 'priority' in r else '', r['created'][:10], r['target'], '|', r['title'][:60])
│ profiles/deepseek41flash/cache/scratch/m445_runs.py
│ @@ -0,0 +1,8 @@
│ +import sqlite3
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +for rid in (425, 369, 367, 320, 317, 408, 440, 442):
│ +    r = c.execute("select id,role,status,duration_s,exit_code,artifacts,substr(detail,1,200) d from runs where id=?", (rid,)).fetchone()
│ +    if not r:
│ +        print(rid, 'MISSING'); continue
│ +    print(r['id'], r['role'], r['status'], r['duration_s'], 'artifacts=', r['artifacts'], '|', (r['d'] or '')[:160])
│ profiles/deepseek41flash/cache/scratch/m445_run1.py
│ @@ -0,0 +1,11 @@
│ +import sqlite3, sys
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +for rid in sys.argv[1:]:
│ +    r = c.execute("select id,role,status,duration_s,exit_code,started,log_path,artifacts,detail,validation from runs where id=?", (int(rid),)).fetchone()
│ +    if not r:
│ +        print(rid, 'MISSING'); continue
│ +    print('===', r['id'], r['role'], r['status'], r['duration_s'], r['started'], r['log_path'])
│ +    print('  artifacts:', r['artifacts'])
│ +    print('  detail:', (r['detail'] or '')[:900])
│ +    print('  validation:', (r['validation'] or '')[:1200])
│ profiles/deepseek41flash/cache/scratch/m445_classify.py
│ @@ -0,0 +1,24 @@
│ +"""Classify the reports of the runs system_report.py counts as `empty`."""
│ +import pathlib, sys, datetime as dt
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +sys.path.insert(0, str(ROOT / 'agents'))
│ +import run as runner
│ +
│ +cases = {425: 'kritikas-2026-11-21T1401.md', 367: 'kritikas-2026-11-18T1401.md',
│ +         317: 'kritikas-2026-11-16T1402.md', 369: 'leidejas-2026-11-18T1630.md',
│ +         320: 'leidejas-2026-11-16T1634.md'}
│ +for rid, name in cases.items():
│ +    p = ROOT / 'agents/log' / name
│ +    text = p.read_text(encoding='utf-8') if p.exists() else ''
│ +    role_cfg = {}
│ +    marker = runner.exhausted_reason(text)
│ +    print(f'{rid} {name}: {len(text)} B · exhausted_marker={marker!r}'
│ +          f' · work_files_claim={"Pakeista tik paleidimo ataskaita" in text}')
│ +
│ +# Does the deliverable exist in those runs' reports (proposal written / cha

… PRALEISTA 4676 SIMBOLIŲ IŠ 22676 (įrankių išklotinės) — visa ataskaita: agents/work/sistemos-architektas/00445/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

58]}")
│ profiles/deepseek41flash/cache/scratch/m445_audit.py
│ @@ -0,0 +1,42 @@
│ +"""Audit: for every `done` proposal, was its target file really changed in the closing commit?"""
│ +import sqlite3, pathlib, subprocess, sys, re
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +sys.path.insert(0, str(ROOT / 'agents'))
│ +import run as runner
│ +
│ +c = sqlite3.connect(ROOT / 'agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +rows = c.execute("select id,role,title,target,note from proposals where status='done' order by id").fetchall()
│ +
│ +def commit_files(short):
│ +    for rev in (short, 'origin/main'):
│ +        pass
│ +    out = subprocess.run(['git', 'show', '--name-only', '--format=%s', short],
│ +                         cwd=ROOT, capture_output=True, text=True, timeout=30)
│ +    if out.returncode != 0:
│ +        return None, None
│ +    lines = out.stdout.splitlines()
│ +    subject = lines[0] if lines else ''
│ +    return subject, set(ln.strip() for ln in lines[1:] if ln.strip())
│ +
│ +bad, unknown = [], []
│ +for r in rows:
│ +    m = re.search(r'commit ([0-9a-f]{7,40})', r['note'] or '')
│ +    if not m:
│ +        unknown.append((r['id'], 'no commit in note', r['note']))
│ +        continue
│ +    sha = m.group(1)
│ +    subject, files = commit_files(sha)
│ +    if files is None:
│ +        unknown.append((r['id'], f'commit {sha} not in repo', r['note']))
│ +        continue
│ +    wanted = set(runner.target_paths(r['target'] or ''))
│ +    if wanted and not (wanted & files):
│ +        bad.append((r['id'], r['role'], sha, subject[:52], sorted(wanted), sorted(files)[:4], r['title'][:50]))
│ +
│ +print(f'done={len(rows)} · closed-commit-does-NOT-touch-target={len(bad)} · unverifiable={len(unknown)}')
│ +for b in bad:
│ +    print('  ✘', b)
│ +print()
│ +for u in unknown[:10]:
│ +    print('  ?', u)
│ profiles/deepseek41flash/cache/scratch/m445_risk.py
│ @@ -0,0 +1,52 @@
│ +"""Risk chain: a negated 'ĮGYVENDINTA' line + a leftover sweep commit = false closure.
│ +
│ +For every report whose ĮGYVENDINTA line is a NEGATION (contains "nėra", "jokio", "neįgyvendin"),
│ +take the ids `declared_proposals()` extracts and check whether that run's commit touched
│ +those ids' target files — that is exactly what mark_implemented() requires.
│ +"""
│ +import sqlite3, pathlib, subprocess, sys, re
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +sys.path.insert(0, str(ROOT / 'agents'))
│ +import run as runner
│ +
│ +NEG = ("nėra", "nera", "jokio", "neįgyvendin", "nieko", "none")
│ +
│ +c = sqlite3.connect(ROOT / 'agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +props = {int(r['id']): dict(r) for r in c.execute("select id,target,title,status,note from proposals")}
│ +
│ +def files_of(sha):
│ +    out = subprocess.run(['git', 'show', '--name-only', '--format=', sha],
│ +                         cwd=ROOT, capture_output=True, text=True, timeout=30)
│ +    return set(ln.strip() for ln in out.stdout.splitlines() if ln.strip()) if out.returncode == 0 else None
│ +
│ +checked = risky = closed_wrongly = 0
│ +for run in c.execute("select id,role,status,log_path,commit_sha from runs where commit_sha is not null and log_path is not null order by id").fetchall():
│ +    p = ROOT / run['log_path']
│ +    if not p.exists():
│ +        continue
│ +    text = p.read_text(encoding='utf-8', errors='replace')
│ +    lines = [ln for ln in text.splitlines() if runner.DECLARED_RE.match(runner.LEAD_MARKUP_RE.sub('', runner.BOX_RE.sub('', ln).strip()))]
│ +    if not lines:
│ +        continue
│ +    neg = [ln for ln in lines if any(n in ln.lower() for n in NEG)]
│ +    if not neg:
│ +        continue
│ +    ids = [i for i in runner.declared_proposals(text) if i in props]
│ +    checked += 1
│ +    if not ids:
│ +        continue
│ +    files = files_of(run['commit_sha'])
│ +    if not files:
│ +        continue
│ +    for pid in ids:
│ +        wanted = set(runner.target_paths(props[pid]['target'] or ''))
│ +        if wanted & files:
│ +            risky += 1
│ +            print(f"  RISK run #{run['id']} ({run['role']}) commit {run['commit_sha'][:7]} "
│ +                  f"negated line → id #{pid} ({props[pid]['status']}) target {sorted(wanted)} "
│ +                  f"in files; proposal title: {props[pid]['title'][:50]}")
│ +            if props[pid]['status'] == 'done' and props[pid]['note'] and run['commit_sha'][:7] in props[pid]['note']:
│ +                closed_wrongly += 1
│ +                print('     ^ AND it is closed by THIS commit → false closure')
│ +print(f'\nreports with a negated declaration: {checked} · dangerous id+file overlaps: {risky} · actually mis-closed: {closed_wrongly}')
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/m445_risk.py
│ @@ -23,7 +23,7 @@
│  checked = risky = closed_wrongly = 0
│  for run in c.execute("select id,role,status,log_path,commit_sha from runs where commit_sha is not null and log_path is not null order by id").fetchall():
│      p = ROOT / run['log_path']
│ -    if not p.exists():
│ +    if not p.is_file():
│          continue
│      text = p.read_text(encoding='utf-8', errors='replace')
│      lines = [ln for ln in text.splitlines() if runner.DECLARED_RE.match(runner.LEAD_MARKUP_RE.sub('', runner.BOX_RE.sub('', ln).strip()))]
│ profiles/deepseek41flash/cache/scratch/m445_sysq.py
│ @@ -0,0 +1,36 @@
│ +"""For each open system proposal: was its target file touched after the proposal date?"""
│ +import sqlite3, pathlib, subprocess, sys, datetime as dt
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +sys.path.insert(0, str(ROOT / 'agents'))
│ +import run as runner
│ +
│ +c = sqlite3.connect(ROOT / 'agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +SYS = ("agents/", "scripts/", "deploy/", "dashboard/", "docs/")
│ +
│ +def commits_of(path):
│ +    out = subprocess.run(['git', 'log', '--format=%h %ct %s', '--', path],
│ +                         cwd=ROOT, capture_output=True, text=True, timeout=30)
│ +    rows = []
│ +    for ln in out.stdout.splitlines():
│ +        sha, ct, *subj = ln.split(' ', 2)
│ +        rows.append((sha, int(ct), subj[0] if subj else ''))
│ +    return rows
│ +
│ +open_rows = [dict(r) for r in c.execute(
│ +    "select id,title,target,created,priority,status from proposals where status='new'")]
│ +sysrows = [r for r in open_rows if r['target'] and runner.target_paths(r['target'])
│ +           and all(p.startswith(SYS) for p in runner.target_paths(r['target']))]
│ +print(f'open system proposals: {len(sysrows)}')
│ +now = dt.datetime.now().timestamp()
│ +for r in sorted(sysrows, key=lambda r: r['created']):
│ +    made = dt.datetime.fromisoformat(r['created']).timestamp()
│ +    age = (now - made) / 86400
│ +    paths = runner.target_paths(r['target'])
│ +    print(f"\n#{r['id']} [{r['priority']}] {age:.1f} d. → {r['target']}")
│ +    print('   ', r['title'][:90])
│ +    for p in paths:
│ +        cs = commits_of(p)
│ +        after = [x for x in cs if x[1] > made and (ROOT / p).exists()]
│ +        print(f'    {p}: {len(cs)} commits total, {len(after)} after proposal date'
│ +              + (f' — newest: {after[0][0]} {after[0][2][:58]}' if after else ' — UNTOUCHED since'))
Šis paleidimas baigėsi anksčiau, nei įrašiau darbo failą. Pagal taisykles tai reiškia tuščią paleidimą: repo nepakeistas nė vienas failas, `git status` švarus, jokių commit'ų. To neslėpsiu ir neteigsiu, kad pataisymas įgyvendintas. Žemiau — tai, kas išmatuota, kad kitas paleidimas nepradėtų to paties iš nulio.

MATAVIMAI (system_report, 2026-11-22 20:24, 7 d.)

    Paleidimai 136. Nenaudingų dalis pagal vaidmenį: kurejas 39/3 %, publikavimo-agentas 31/0 %, sistemos-architektas 7/14 %, leidejas 6/33 %, kritikas 6/67 %, simuliaciju-inzinierius 6/33 %, metodininkas 6/17 %, ideator 6/33 %, kalbu-redaktorius 5/40 %, dizaineris 2/50 %.
    Pasiūlymai: 159 · new 15, blocked 2, done 133, obsolete 9. Seniausias neapdorotas — prieš 14 d.
    Sisteminiai pasiūlymai: 12 (check_agents įspėja apie 11 >3 d.).
    Vartai: visi žali (turinys 0/0, garsas 757 tekstų/1514 įrašų, pamokos 139, sąsaja 0/0, agentai rc 0 su 1 įspėjimu).

KETURI RADINIAI, KURIUOS REIKIA UŽBAIGTI

1. Du pasiūlymai eilėje jau įgyvendinti, bet negali būti uždaryti.
   #4455: `cap_report()` + `REPORT_MAX = 18000` gyvena agents/run.py:262–283, o check_agents.py:158–181 turi 32 KB vartus; `find agents/log -name '*.md' -size +32k -newermt 2026-11-17` → 0 failų, t. y. po ribos įvedimo defekto nebėra. #4516: `SENTENCE_LIMIT_SEVERITY = "error"` (check_language.py:60) ir `run_checks()` tikrai kviečia `check_language.py --grade N --strict` (agents/run.py:955–965); šiandien `--grade 1 --strict` → rc 0, 0 klaidų, 0 įspėjimų.
   Kodėl jie vis tiek kabo: `mark_implemented()` reikalauja, kad TAME PAČIAME commite būtų pakeistas tikslo failas. Tai #22168 branduolys — ne „eilė duoda antrą kartą“, o „įgyvendinto įrašo negalima uždaryti be dirbtinio failo lietimo“. Sprendimas (neįgyvendintas): leisti uždaryti deklaraciją, jei tikslo failo turinys jau tenkina pasiūlymo sąlygą (arba pridėti `--mark-done` su įrodymu). Be to, `agents/run.py` ir `scripts/check_language.py` buvo liesti PO pasiūlymų datų 25 ir 3 kartus — tai ir yra priežastis, kodėl tai sisteminė, o ne vienkartinė klaida.

2. Biudžeto praradimai vis dar skaitomi kaip tyla — 5 iš 69.
   `exhausted_reason()` savo žymes RANDA visose penkiose ataskaitose: #425 `baigėsi iteracij`, #367 `žingsnių limit`, #317 `iteracijų limit`, #369 `iteracijų limit`, #320 `baigėsi žingsniai`. `runs.db` jas vis tiek laiko `empty`: #425 (kritikas, 699 s, artifacts []), #369 (leidejas, 724 s), #367, #320, #317. Tai 7 % visų ne-darbo paleidimų ir būtent tie, kuriuos statistika siunčia architektui „mažinti grafiką“.
   Nustatyta, bet neįrodyta: ar žymės nebuvo modelio `out` (tada klasifikatorius teisus), ar šaka buvo praleista dėl `classify()` grąžinto `failed` (tada tai klaida). Įrodymas reikalauja `agents/work/*/ataskaita-visa.md` — šiame paleidime to nepradėjau.

3. `declared_proposals()` skaito NEIGIAMAS deklaracijas kaip teigiamas — latentinis.
   `publikavimo-agentas-2026-11-20T0623.md` eilutė „ĮGYVENDINTA: — (jokio pasiūlymo iš eilės šiame paleidime neįgyvendinau; #386 ir #388 jau…“ duoda `ids=[386, 388]`; `2026-11-18T2300.md` duoda `[370]`. Šiandien žalos nėra — išmatuota: 6 ataskaitos su neigiama deklaracija, 0 atvejų, kur to paleidimo commit'as liestų tų ID tikslą, 0 klaidingai uždarytų (IDs 370/386/388 proposals lentelėje net neegzistuoja). Bet taisyklė „numerį pasako modelis“ be „ar jis pasakė TAIP“ yra vienas commit'as nuo klaidingo uždarymo. Taisymas: reikalauti, kad po `ĮGYVENDINTA:` eilutės numeris būtų pirmas simbolis, o ne bet kur eilutėje.

4. `check_docs_facts.py` neturi sinchronizavimo — #5400, seniausias realiai nepaliestas sisteminis darbas (`scripts/sync_docs_facts.py` — 0 commit'ų, failas neegzistuoja).
   Tai vienintelis iš 12 sisteminių pasiūlymų, kuris yra aiškiai įgyvendinamas vienu failu, ir jo nauda išmatuota: kiekvienas modulio commit'as keičia 5 skaičių vietas (README 4, ARCHITEKTURA, wiki 2), o `run_checks()` `check_docs_facts.py` nepaleidžia — žalias publikavimas su pasenusiais skaičiais yra tik laiko klausimas.

KITAS PALEIDIMAS TURĖTŲ imti #5400 (naujas scripts/sync_docs_facts.py perimant `facts()` iš check_docs_facts.py) arba #22168 (stale-closure kelias, kuris uždarų #4455 ir #4516). Abiem atvejais tikslo failas bus pakeistas, tad deklaracija `ĮGYVENDINTA: #<nr>` tikrai užsidarys.

NELIESTA SĄMONINGAI: `content/`, `assets/js/sims/`, `agents/scope.json`, kitų vaidmenų failai, AGENTS.md, `.github/workflows/`. `queue_repair.py` paleistas — 2 blokuoti pasiūlymai (#5834, #14726) teisingai lieka `blocked`: jų priežastis „paskelbta, bet tikslas nepakeistas“, ne infrastruktūra, tad grąžintinų 0.

SKOLA, KURIĄ PALIEKU: `agents/system-journal.md` įrašo nėra (be jo check_agents įspėjimas apie architektą lieka), ir paleidimo prompto įspėjimas apie `hermes-dashboard.service` restartą neišspręstas.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-3a63d97242734af4f292a5a1ff8bdec9212828b9511ec4bebd1774d600e0b16e
```
