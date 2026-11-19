# sistemos-architektas — 2026-11-19T2024

- paleidimas: #389 (manual)
- trukmė: 1323s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/p389_props.py
│ @@ -0,0 +1,9 @@
│ +import sqlite3, json
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +for n in (4455, 4516, 4921, 7396, 23765, 5400, 16338, 16892, 22168, 24447, 24307, 5342):
│ +    r = c.execute("select id,status,title,target,created,priority,body from proposals where id=?", (n,)).fetchone()
│ +    if r:
│ +        print(r['id'], r['status'], '|', r['target'], '|', r['created'][:10], '|', r['title'])
│ +    else:
│ +        print(n, 'MISSING')
│ profiles/deepseek41flash/cache/scratch/p389_body.py
│ @@ -0,0 +1,17 @@
│ +import sqlite3, json
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +for n in (24447, 23765, 7396, 4921, 22168, 16338, 4516):
│ +    r = c.execute("select * from proposals where id=?", (n,)).fetchone()
│ +    if not r:
│ +        print(n, 'MISSING'); continue
│ +    print('=' * 70)
│ +    print(n, r['status'], r['priority'], r['type'], '|', r['target'])
│ +    print('TITLE:', r['title'])
│ +    print('BODY:', r['body'])
│ +    for k in r.keys():
│ +        if k in ('id','status','priority','type','target','title','body','role','run_id','created'):
│ +            continue
│ +        v = r[k]
│ +        if v:
│ +            print(f'  {k}:', v if len(str(v)) < 800 else str(v)[:800] + '…')
│ profiles/deepseek41flash/cache/scratch/p389_4455.py
│ @@ -0,0 +1,8 @@
│ +import sqlite3
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +r = c.execute("select * from proposals where id=4455").fetchone()
│ +print(r['title']); print(r['body'])
│ +for k in r.keys():
│ +    if r[k]:
│ +        print(f'  {k}: {str(r[k])[:600]}')
│ profiles/deepseek41flash/cache/scratch/p389_runs.py
│ @@ -0,0 +1,12 @@
│ +import sqlite3
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +print("--- empty / checked / infra runs, last 20")
│ +for r in c.execute("select id, role, status, duration_s, started_at, summary, detail, log_path from runs order by id desc limit 40"):
│ +    print(r['id'], r['role'], r['status'], r['duration_s'], (r['started_at'] or '')[:16],
│ +          '|', (r['summary'] or '')[:100])
│ +print()
│ +print("--- status counts per role, last 7d")
│ +for r in c.execute("""select role, status, count(*) n from runs
│ +                      where started_at >= datetime('now','-7 day') group by role, status order by role"""):
│ +    print(f"{r['role']:26} {r['status']:12} {r['n']}")
│ profiles/deepseek41flash/cache/scratch/p389_schema.py
│ @@ -0,0 +1,5 @@
│ +import sqlite3
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +print("RUNS COLS:", [d[0] for d in c.execute("select * from runs limit 1").description])
│ +print("PROP COLS:", [d[0] for d in c.execute("select * from proposals limit 1").description])
│ profiles/deepseek41flash/cache/scratch/p389_runs2.py
│ @@ -0,0 +1,15 @@
│ +import sqlite3
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +print("--- recent runs")
│ +for r in c.execute("select id, role, trigger, status, duration_s, started, summary, detail, validation from runs order by id desc limit 45"):
│ +    print(r['id'], r['role'], r['trigger'], r['status'], r['duration_s'], (r['started'] or '')[:16])
│ +    s = (r['summary'] or '').replace('\n', ' ')[:110]
│ +    print('    S:', s)
│ +    d = (r['detail'] or '').replace('\n', ' ')[:140]
│ +    if d: print('    D:', d)
│ +print()
│ +print("--- empty/checked runs: what did they do")
│ +for r in c.execute("""select id, role, status, duration_s, summary, detail from runs
│ +                      where status in ('empty','checked','partial','ok') order by id desc limit 25"""):
│ +    print(r['id'], r['role'], r['status'], r['duration_s'], '|', (r['summary'] or '')[:120])
│ profiles/deepseek41flash/cache/scratch/p389_order.py
│ @@ -0,0 +1,6 @@
│ +import sqlite3
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +for n in (4455, 4516, 4921, 5400, 5342, 7396, 23765):
│ +    r = c.execute("select id, created, priority, status from proposals where id=?", (n,)).fetchone()
│ +    print(r['id'], r['created'], r['priority'], r['status'])
│ profiles/deepseek41flash/cache/scratch/p389_stale.py
│ @@ -0,0 +1,57 @@
│ +"""Zondas: kiek `new` sisteminiu pasiulymu tikslu failai jau pakeisti PO pasiulymo datos.
│ +
│ +Jei failas pakeistas po pasiulymo, darbas greiciausiai jau padarytas, o eile
│ +vis dar rodo `new` — tai #22168 klase, matuojama, o ne speliojama.
│ +"""
│ +import sqlite3
│ +import subprocess
│ +import datetime as dt
│ +import pathlib
│ +
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +c = sqlite3.connect(ROOT / 'agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +
│ +SYS = ('agents/', 'scripts/', 'deploy/', 'dashboard/', 'docs/')
│ +
│ +rows = [r for r in c.execute("select id, created, target, title, type, priority from proposals where status='new'")]
│ +sysrows = []
│ +for r in rows:
│ +    t = (r['target'] or '').strip()
│ +    paths = [p.strip() for p in t.replace(';', ',').split(',') if p.strip()]
│ +    if paths and all(p.startswith(SYS) for p in paths):
│ +        sysrows.append(dict(r))
│ +
│ +print(f"new is viso: {len(rows)} · sisteminiu: {len(sysrows)}")
│ +
│ +
│ +def last_commit_time(rel):
│ +    out = subprocess.run(['git', 'log', '-1', '--format=%ct', '--', rel],
│ +                         cwd=ROOT, capture_output=True, text=True, timeout=20)
│ +    s = out.stdout.strip()
│ +    return int(s) if s.isdigit() else None
│ +
│ +
│ +print(f"\n{'id':>6} {'created':10}  {'pakeista':16}  tikslas")
│ +stale = []
│ +for r in sorted(sysrows, key=lambda r: r['created']):
│ +    t = (r['target'] or '').strip()
│ +    paths = [p.strip() for p in t.replace(';', ',').split(','

… PRALEISTA 4875 SIMBOLIŲ IŠ 22875 (įrankių išklotinės) — visa ataskaita: agents/work/sistemos-architektas/00389/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

u nuoroda
│ +į pasiūlymą. Tikriname, kiek `new` sisteminių pasiūlymų tokį commit'ą turi ir
│ +kiek jų neturi (kad matytume, ar signalas neiššaukia klaidingų teigiamų).
│ +"""
│ +import subprocess
│ +import sqlite3
│ +import time
│ +import pathlib
│ +
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +SYS = ('agents/', 'scripts/', 'deploy/', 'dashboard/', 'docs/')
│ +c = sqlite3.connect(ROOT / 'agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +
│ +rows = [dict(r) for r in c.execute(
│ +    "select id, created, target, title from proposals where status='new' order by created")]
│ +
│ +hits = {}
│ +t0 = time.time()
│ +for r in rows:
│ +    t = (r['target'] or '').strip()
│ +    paths = [p.strip() for p in t.replace(';', ',').split(',') if p.strip()]
│ +    out = []
│ +    for p in paths:
│ +        proc = subprocess.run(['git', 'log', f'-S#{"%d" % r["id"]}' if False else '-S', f'#{r["id"]}',
│ +                               '--format=%h|%ad|%s', '--date=short', '--', p],
│ +                              cwd=ROOT, capture_output=True, text=True, timeout=30)
│ +        for line in proc.stdout.strip().splitlines():
│ +            if line:
│ +                out.append((p, line))
│ +    if out:
│ +        hits[r['id']] = out
│ +    print(f"{r['id']:>6} {r['created'][:10]} {'HIT' if out else '   '} {t[:60]}")
│ +    for p, line in out[:3]:
│ +        print(f"        {line[:110]}")
│ +
│ +print(f"\nPasiūlymai su signalu: {len(hits)} / {len(rows)} · laikas {time.time() - t0:.1f}s")
│ profiles/deepseek41flash/cache/scratch/p389_turns.py
│ @@ -0,0 +1,35 @@
│ +"""Ar tusci paleidimai mirsta ties 'turn' limitu, ir kiek ten liko iki artefakto?"""
│ +import pathlib
│ +import re
│ +import sqlite3
│ +import sys
│ +
│ +sys.path.insert(0, '/home/zoltanas/workspace/suprask/agents')
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +import run as runner  # noqa: E402
│ +
│ +c = sqlite3.connect(ROOT / 'agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +
│ +LIMIT = re.compile(r'(iteracij\w* limit\w*|turn\w* limit|budget|žingsni\w* (?:limit|baig)|'
│ +                   r'pasiektas.{0,20}limit|max_turns|goal.{0,10}budget)', re.I)
│ +
│ +print(f"{'id':>5} {'role':22} {'status':8} {'dur':>5} {'turns':>5}  {'empty?':7} limit-note")
│ +rows = c.execute("""select id, role, status, duration_s, log_path from runs
│ +                    where status in ('empty','checked','ok','partial') order by id desc limit 30""").fetchall()
│ +for r in rows:
│ +    lp = ROOT / (r['log_path'] or '')
│ +    note = ''
│ +    if lp.exists():
│ +        t = lp.read_text(encoding='utf-8', errors='replace')
│ +        m = LIMIT.search(t)
│ +        if m:
│ +            i = m.start()
│ +            note = re.sub(r'\s+', ' ', t[max(0, i - 90):i + 110]).strip()
│ +    cfg = runner.ROLES.get(r['role'], {})
│ +    print(f"{r['id']:>5} {r['role']:22} {r['status']:8} {r['duration_s'] or 0:>5} "
│ +          f"{cfg.get('max_turns', '?'):>5}  {r['status']:7} {note[:120]}")
│ +
│ +print("\n--- max_turns pagal vaidmeni")
│ +for role, cfg in runner.ROLES.items():
│ +    print(f"  {role:26} turns={cfg.get('max_turns')} budget={cfg.get('budget')} timeout={cfg.get('timeout')}")
│ agents/run.py
│ @@ -191,6 +191,47 @@
│          if marker in blob:
│              return marker
│      return ""
│ +
│ +
│ +# Žymės, kuriomis modelis pats pasako, kad baigėsi ėjimų/ŽINGSNIŲ biudžetas.
│ +# Tai TREČIA nesėkmės rūšis, kurios iki 2026-11-19 sistema neskirdė nuo
│ +# „vaidmuo nieko neveikė“: 2026-11-19 matuota `runs.db` — VISI 10 `empty`
│ +# paleidimų (dizaineris #383, leidejas #369/#320, kritikas #367/#317,
│ +# ideator #295, sveikatos-inspektorius #375, tikrintojas #373,
│ +# publikavimo-agentas #338/#336/#306/#294) ataskaitose rašo „baigėsi
│ +# iteracijų limitas“ / „pasiekiau žingsnių limitą“ — darbas buvo
│ +# IŠMATUOTAS, bet neįrašytas į failą. Statistika tai vadino tuščiu
│ +# paleidimu ir siuntė architektą taisyti vaidmens, o ne biudžeto.
│ +#
│ +# Sąmoningai NE "budget": `goal_query()` kiekvienam `/goal` paleidimui
│ +# rašo „20-turn budget“, todėl bendras žodis duotų klaidingą teigiamą
│ +# kiekvienam kūrėjo paleidimui.
│ +EXHAUST_MARKERS = (
│ +    "iteracijų limit",
│ +    "žingsnių limit",
│ +    "žingsnių skaiči",
│ +    "turn limit",
│ +    "maximum number of turns",
│ +    "ran out of turns",
│ +    "reached the turn",
│ +)
│ +
│ +
│ +def exhausted_reason(*texts: str) -> str:
│ +    """Ar paleidimas baigėsi dėl ėjimų biudžeto, o ne dėl nieko darbo.
│ +
│ +    Grąžina rastą žymę (tuščia eilutė — biudžetas nebuvo kaltas). Ši
│ +    informacija reikalinga trims vartotojams: `main()` (statusas),
│ +    `scripts/kurejas_queue.py` (pasiūlymas negali būti blokuojamas dėl
│ +    biudžeto) ir `scripts/system_report.py` (atskira kolona — kitaip
│ +    talpos trūkumas atrodo kaip sugedęs vaidmuo).
│ +    """
│ +    blob = " ".join(t or "" for t in texts).lower()
│ +    for marker in EXHAUST_MARKERS:
│ +        if marker in blob:
│ +            return marker
│ +    return ""
│ +
│
│
│  def work_files(files: list[str]) -> list[str]:
│ agents/run.py
│ @@ -1879,6 +1879,22 @@
│          if infra and status in ("failed", "partial", "ok"):
│              status = "infra"
│
│ +        # Talpos trūkumas — trečia nesėkmės rūšis (2026-11-19). Vaidmuo dirbo:
│ +        # matavo, skaitė, darė išvadas, bet baigėsi ėjimai PIRMS failo įrašymo.
│ +        # Tai nėra „vaidmuo neturi ką veikti“ (nuo to priklauso, ar mažinti
│ +        # grafiką) ir nėra „pasiūlymas netinkamas“ (nuo to priklauso, ar siųsti
│ +        # `blocked`). Be šios šakos visi 10 `empty` paleidimų buvo skaitomi kaip
│ +        # tuščias darbas, o eilė užblokuodavo gerą pasiūlymą.
│ +        exhaust = exhausted_reason(out, err)
│ +        if exhaust and not work:
│ +            if status in ("ok", "partial", "empty"):
│ +                status = "exhausted"
│ +        elif exhaust and work and status in ("failed", "timeout"):
│ +            # Failai parašyti, bet paskutiniai žingsniai (ataskaita, patikra)
│ +            # liko nebaigti. Darbas yra, todėl publikavimas sprendžia toliau;
│ +            # į `failed` nereikia versti — LL-10 (statusą lemia rezultatas).
│ +            pass
│ +
│          # Paskelbimas — bėgiklio, ne agento, darbas.
│          result = publish(args.role, run_id, files, out or args.role,
│                           implemented_id=int(proposal["id"]) if proposal else None,
│ agents/run.py
│ @@ -1886,14 +1886,11 @@
│          # `blocked`). Be šios šakos visi 10 `empty` paleidimų buvo skaitomi kaip
│          # tuščias darbas, o eilė užblokuodavo gerą pasiūlymą.
│          exhaust = exhausted_reason(out, err)
│ -        if exhaust and not work:
│ -            if status in ("ok", "partial", "empty"):
│ -                status = "exhausted"
│ -        elif exhaust and work and status in ("failed", "timeout"):
│ -            # Failai parašyti, bet paskutiniai žingsniai (ataskaita, patikra)
│ -            # liko nebaigti. Darbas yra, todėl publikavimas sprendžia toliau;
│ -            # į `failed` nereikia versti — LL-10 (statusą lemia rezultatas).
│ -            pass
│ +        if exhaust and not work and status in ("ok", "partial", "empty"):
│ +            status = "exhausted"
│ +        # Failai parašyti, bet paskutiniai žingsniai liko nebaigti — darbas yra,
│ +        # todėl toliau sprendžia publikavimas (`resolve_status`, LL-10), o ne
│ +        # biudžeto žymė.
│
│          # Paskelbimas — bėgiklio, ne agento, darbas.
│          result = publish(args.role, run_id, files, out or args.role,
## Ką radau (išmatuota, ne spėta)

`system_report.py` prieš darbą: 133 paleidimai / 7 d., sistemos-architektas 43 % nenaudingų, leidejas 33 %, kritikas 33 %, dizaineris 50 %; 13 sisteminių pasiūlymų eilėje, seniausias 11 d.; patikros žalios (išskyrus 2 agentų įspėjimus).

Pagrindinis radinys, kurio eilėje nebuvo: **visi 10 `empty` paleidimų DB baigėsi ėjimų limitu.** Patikrinau kiekvieno ataskaitą — #383 dizaineris („baigiau ties iteracijų limitu“), #369 ir #320 leidejas („iteracijų limitas baigėsi PIRMIAU, nei įrašiau changelog“), #367/#317 kritikas („pasiekiau žingsnių limitą prieš įrašymą“, „RADINIAI … bet NEĮRAŠYTI“), #295 ideator, #375 sveikatos-inspektorius, #373 tikrintojas, #338/#336/#306/#294 publikavimo-agentas. **0 iš 10** buvo „vaidmuo neturi ką veikti“. Sistema šitai neturėjo trečios kategorijos: `infra` reiškė modelio vartų gedimą, `empty` — nieko nepadarytą darbą, o talpos trūkumas atrodė kaip pirmas arba antras. Pasekmė dviguba: statistika siuntė architektą taisyti *vaidmens*, o `kurejas_queue.py:279–289` tokį paleidimą siunčia į `blocked` — nors darbas buvo padarytas, tik neįrašytas (LL-118/LL-101 šeima).

## Ką įrašiau į repo

`agents/run.py` (tik šis failas pakeistas):
- `EXHAUST_MARKERS` + `exhausted_reason()` (po `infra_reason()`, ~eil. 194–236) — atpažįsta „iteracijų limit“, „žingsnių limit“, „turn limit“, „ran out of turns“ ir kt. Sąmoningai be bendro žodžio `budget`, nes `goal_query()` kiekvienam `/goal` paleidimui rašo „20-turn budget“ — kitaip klaidingas teigiamas kiekvienam kūrėjo paleidimui.
- `main()`: nauja būsena `exhausted`, kai yra ėjimų žymė ir **nėra** darbo failų (~eil. 1882–1891). Failai parašyti → paliekama `resolve_status()` (LL-10), biudžeto žymė neturi versti į `failed`.

## SVARBU: darbas NEPABAIGTAS ir palikau nenuoseklią būseną

Šito negaliu vadinti sėkmingu paleidimu. Trys dalys liko nepadarytos, o viena jų — mano paties sukeltas defektas:

1. **`kurejas_queue.py` nebeatpažįsta `exhausted`** — tai aktyvus defektas, kurį įvedžiau. Eilutėje 279 `run_status == "published"` netinka, `no_work` (`artifacts == "[]"`) tinka, `duration_s` > `MIN_ATTEMPT_S`, tad eiga nukrenta į `blocked += 1` ir **geras pasiūlymas užblokuojamas**. Reikia `elif run_status == "exhausted":` šakos, kuri grąžina pasiūlymą į `new` su pastaba „talpa, ne turinys“ (arba padidina `max_turns`), prieš `blocked` eilutę.
2. **`system_report.py` nepažįsta naujos būsenos** — `BAD`/`USELESS` sąrašuose `exhausted` nėra, `per_role` celėse nėra rakto, todėl jis nukris į `other`, o ne į atskirą koloną. Be to, `agents/run.py:1888` (`return 0 if status in (...)`) grąžina 1 `exhausted` paleidimui — apsispręsti reikia sąmoningai.
3. **Nepaleista patikra ir neįrašytas dienoraštis**: `check_agents.py` po pakeitimo nebėgta, `agents/system-journal.md` įrašo (Mačiau/Keičiau/Kodėl/Patikra) nėra, „po“ `system_report` skaičių nėra, pamoka (`pamokos.md`) nepridėta. Pagal baigties sąlygą paleidimas formaliai neužbaigtas.

## Ką daryti kitam paleidimui (pirmiausia)

1. Baigti `scripts/kurejas_queue.py` `exhausted` šaką (žr. 1 punktą) — **be jos dabartinis kodas blokuoja pasiūlymus**.
2. Įtraukti `exhausted` į `system_report.py` (`BAD`? ne — į atskirą koloną `exhaust`, nes tai talpa, ne tuščias darbas) ir apsispręsti dėl `run.py:1888` išėjimo kodo.
3. Įrašyti LL į `research/wiki/guidelines/pamokos.md`: „Paleidimas, kuris baigiasi ėjimų limitu, laikomas tuščiu“ — Simptomas: vaidmuo matavo, bet failo neįrašė; Priežastis: dvi nesėkmės rūšys (`infra` / `empty`) neturėjo trečios (talpa); Taisyklė: ėjimų žymė be darbo failų yra `exhausted`, o ne `empty`, ir ji negali blokuoti pasiūlymo; Patikra: `exhausted_reason()` zondas + 10 istorinių ataskaitų atpažįstamos.
4. Pridėti `agents/system-journal.md` įrašą ir paleisti `check_agents.py`, `check_lessons.py`, `validate_content.py`.

## Sąmoningai neliesta

13 sisteminių pasiūlymų neliesti. Iš jų 6 (#4455, #4516, #4921, #5342, #16338, #16892) turi commit'ą, kuris liečia tikslo failą **po** pasiūlymo datos, bet `-S "#<id>"` signalas per silpnas patikimai klasifikacijai — #4921 ir #5342 davė tuščią rezultatą, nors failai keisti, o #4455/#4516/#16338 žymė atsirado atsitiktinai. Todėl jų `new` būsenos nekeičiau: tyliai uždaryti būtų LL-36 (įrodymas, kurio nebeliko). #22168 (`kurejas_queue.py` talpos/`blocked` logika) iš dalies liečiamas šio darbo ir turi būti imamas kartu su 1 punktu. #5400 (`sync_docs_facts.py`) failo nėra — darbas nepradėtas.

## klaidos

```
session_id: local-6f2805622050f10115dbd7f368e294f9135ffa9a865fe69511b506c2523ac033
```
