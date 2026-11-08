# sistemos-architektas — 2026-11-08T2023

- paleidimas: #174 (manual)
- trukmė: 571s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/q2.py
│ @@ -0,0 +1,7 @@
│ +import sqlite3, sys
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +print([r[1] for r in c.execute("PRAGMA table_info(runs)")])
│ +q = sys.argv[1] if len(sys.argv) > 1 else "SELECT id,role,status,started,substr(coalesce(detail,''),1,200) d FROM runs WHERE status NOT IN ('published','ok') ORDER BY id DESC LIMIT 30"
│ +for r in c.execute(q):
│ +    print(' | '.join(str(r[k]) for k in r.keys()))
│ profiles/deepseek41flash/cache/scratch/prop_targets.py
│ @@ -0,0 +1,16 @@
│ +import sqlite3, pathlib, re, collections
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +c = sqlite3.connect(ROOT / 'agents/runs.db'); c.row_factory = sqlite3.Row
│ +rows = [dict(r) for r in c.execute("SELECT id,type,priority,target,title,status,created FROM proposals WHERE status='new' ORDER BY id")]
│ +print('new:', len(rows))
│ +own = collections.Counter()
│ +for r in rows:
│ +    t = (r['target'] or '').strip()
│ +    exact = (ROOT / t).exists()
│ +    kind = 'exact-file' if exact else ('system-path' if re.match(r'^(agents|scripts|deploy|dashboard|docs)/', t) else 'nepaprastas')
│ +    own[kind] += 1
│ +    print(f"#{r['id']:5} {kind:12} {t[:90]}")
│ +print(own)
│ +print('\n-- visi statusai --')
│ +for r in c.execute("SELECT status, COUNT(*) n FROM proposals GROUP BY status ORDER BY n DESC"):
│ +    print(tuple(r))
│ agents/run.py
│ @@ -165,6 +165,11 @@
│      "publikavimo-agentas": {
│          "file": "roles/publikavimo-agentas.md", "profile": "deepseek41flash", "toolsets": "terminal,file",
│          "max_turns": 26, "budget": 1000, "timeout": 1200,
│ +        # `inspect` — vaidmuo, kurio rezultatas yra ATASKAITA, ne failai. Tik
│ +        # tokiems paleidimams „failų nepakeista“ virsta `checked` (žr. main()).
│ +        # Kūrėjui tas pats virsdavo klaidinga sėkme: 37 pasiūlymai per 40 s
│ +        # buvo „patikrinti“ nieko nepadarius (#117 serija).
│ +        "inspect": True,
│          "cadence": "kasdien 5 kartus (06:20, 11:40, 16:00, 19:30, 23:00)",
│          # Laikai parinkti taip, kad iki artimiausio kito agento būtų ≥20 min, o
│          # nuo kritiko (14:00) — 2 h. Anksčiau 14:10 krisdavo ant kritiko.
│ agents/run.py
│ @@ -179,7 +179,7 @@
│      },
│      "tikrintojas": {
│          "file": "roles/tikrintojas.md", "profile": "deepseek41flash", "toolsets": "terminal,file,web",
│ -        "max_turns": 30, "budget": 900, "timeout": 1200,
│ +        "max_turns": 30, "budget": 900, "timeout": 1200, "inspect": True,
│          "cadence": "kasdien", "on_calendar": "*-*-* 05:50:00",
│          "description": "Validuoja turinį ir sąsają, registruoja klaidas",
│      },
│ agents/run.py
│ @@ -185,7 +185,7 @@
│      },
│      "sveikatos-inspektorius": {
│          "file": "roles/sveikatos-inspektorius.md", "profile": "deepseek41flash", "toolsets": "terminal,file,web",
│ -        "max_turns": 30, "budget": 900, "timeout": 1200,
│ +        "max_turns": 30, "budget": 900, "timeout": 1200, "inspect": True,
│          "cadence": "ketvirtadieniais", "on_calendar": "Thu *-*-* 06:50:00",
│          "description": "Tikrina gyvą svetainę, nuorodas ir našumą",
│      },
│ agents/run.py
│ @@ -197,7 +197,7 @@
│      },
│      "kuratorius": {
│          "file": "roles/kuratorius.md", "profile": "deepseek41flash", "toolsets": "terminal,file,web",
│ -        "max_turns": 30, "budget": 900, "timeout": 1200,
│ +        "max_turns": 30, "budget": 900, "timeout": 1200, "inspect": True,
│          "cadence": "sekmadieniais", "on_calendar": "Sun *-*-* 18:00:00",
│          "description": "Savaitės suvestinė, changelog, atviri klausimai",
│      },
│ agents/run.py
│ @@ -783,6 +783,38 @@
│                  pass
│
│
│ +def target_paths(target: str) -> list[str]:
│ +    """Pasiūlymo `target` tekstas → failų keliai, kuriuos jis iš tikrųjų nurodo.
│ +
│ +    Pasiūlymo formate `target` buvo laisvas tekstas, todėl kritikas rašė
│ +    „assets/js/sims/geometrija.js:112 (sim pastaba); alternatyva — sim.config
│ +    raktas“ arba „…16-vandens-busenos.json (sim.config.words) + assets/js/sims/
│ +    pasaulis.js“. Toks target NIEKADA nesutapdavo su publikavimo `files`, todėl
│ +    sėkmingai paskelbtas darbas likdavo neuždarytas, o eilė jį pavadindavo
│ +    `blocked` — 2026-11-08 visi 6 blokuoti pasiūlymai buvo „paleidimas nepavyko:
│ +    kurejas #N: **published**“. Tai ne pasiūlymų klaida, o bėgiklio aklumas.
│ +    """
│ +    out: list[str] = []
│ +    for token in re.split(r"\s*(?:\+|;|,)\s*", target or ""):
│ +        token = token.strip().strip("`'\"")
│ +        token = re.sub(r":\d+(?:[-–]\d+)?$", "", token)          # …:112
│ +        token = re.sub(r"\s*\([^()]*\)\s*$", "", token)          # … (sim.config.words)
│ +        token = token.strip().strip("`'\"")
│ +        if not token:
│ +            continue
│ +        if " " in token:
│ +            head = token.split(" ", 1)[0]
│ +            if "/" in head:
│ +                token = head
│ +            elif " — " in token or " – " in token:
│ +                continue
│ +            else:
│ +                continue
│ +        if "/" in token and "." in token.rsplit("/", 1)[-1] and token not in out:
│ +            out.append(token)
│ +    return out
│ +
│ +
│  def mark_implemented(proposal_id: int | None, files: list[str], commit_sha: str) -> bool:
│      """Pažymi įgyvendintą TIK tą pasiūlymą, kurį paleidimas ėmėsi vykdyti.
│
│ agents/run.py
│ @@ -832,7 +832,11 @@
│      if not row:
│          return False
│      target = (row.get("target") or "").strip()
│ -    if target and target not in set(files):
│ +    wanted = target_paths(target)
│ +    # Pakeistas turi būti BENT VIENAS tikslo failas; jei tikslo iš teksto
│ +    # ištraukti nepavyksta (`wanted` tuščias) — pasiūlymas lieka atviras:
│ +    # neįrodyto darbo neuždarome.
│ +    if wanted and not (set(wanted) & set(files)):
│          return False
│      try:
│          db.set_proposal_status(int(proposal_id), "done", f"įgyvendinta commit {commit_sha[:7]}")
│ agents/run.py
│ @@ -833,10 +833,12 @@
│          return False
│      target = (row.get("target") or "").strip()
│      wanted = target_paths(target)
│ -    # Pakeistas turi būti BENT VIENAS tikslo failas; jei tikslo iš teksto
│ -    # ištraukti nepavyksta (`wanted` tuščias) — pasiūlymas lieka atviras:
│ -    # neįrodyto darbo neuždarome.
│ +    # Pakeistas turi būti BENT VIENAS tikslo failas. Jei tikslas ne tuščias, bet
│ +    # failo kelio iš jo ištraukti nepavyksta („docs/“), laikome neįrodyta ir
│ +    # pasiūlymo neuždarome.
│      if wanted and not (set(wanted) & set(files)):
│ +        return False
│ +    if target and not wanted:
│          return False
│      try:
│          db.set_proposal_status(int(proposal_id), "done", f"įgyvendinta commit {commit_sha[:7]}")
│ agents/run.py
│ @@ -1481,10 +1481,15 @@
│                           foreign_roles=foreign, notes=notes)
│          if status in ("ok", "partial"):
│              status = result["status"]
│ -        # Patikros vaidmenys (tikrintojas, publikavimo-agentas, kuratorius) iš
│ -        # esmės failų nekeičia — jų rezultatas yra ataskaita. „empty“ klaidingai
│ -        # atrodydavo kaip „nieko nepadarė“, todėl skiriame „checked“.
│ -        if status == "empty" and len((out or "").strip()) > 400:
│ +        # Patikros vaidmenys (tikrintojas, publikavimo-agentas, kuratorius,
│ +        # sveikatos inspektorius) iš esmės failų nekeičia — jų rezultatas yra
│ +        # ataskaita. „empty“ klaidingai atrodydavo kaip „nieko nepadarė“, todėl
│ +        # jiems skiriame „checked“.
│ +        # KŪRĖJUI toks paaukštinimas yra klaidinga sėkmė: 2026-11-07 eilė per
│ +        # 40 s „patikrino“ 37 pasiūlymus, kurių nė vienas nebuvo liestas, o
│ +        # statistika rodė 3 % nenaudingų paleidimų. Todėl `checked` — tik tiems
│ +        # vaidmenims, kurių ROLES įraše yra `inspect`.
│ +        if status == "empty" and len((out or "").strip()) > 400 and cfg.get("inspect"):
│              status = "checked"
│
│          if proposal:
│ agents/run.py
│ @@ -717,6 +717,17 @@
│      if any(f.startswith(("content/", "assets/audio/")) for f in files) or not files:
│          checks.append(("turinys", [sys.executable, "scripts/validate_content.py"]))
│          checks.append(("garsas", [venv_python(), "scripts/check_audio.py"]))
│ +        # LL-52 / #5544: kalbos tikrintuvas buvo CI vartuose, bet ne bėgiklyje,
│ +        # todėl publikavimas galėjo aplenkti amžiaus ir formuluočių patikrą.
│ +        # `--strict` krenta tik dėl KLAIDŲ (įspėjimai neblokuoja).
│ +        grades = sorted({
│ +            m.group(1) for f in files
│ +            if (m := re.match(r"content/[^/]+/grade-(\\d+)/", f))
│ +        })
│ +        for grade_no in grades or []:
│ +            checks.append((f"kalba (grade {grade_no})",
│ +                           [sys.executable, "scripts/check_language.py",
│ +                            "--grade", grade_no, "--strict"]))
│      if any(f.startswith(("agents/", "deploy/", "scripts/")) for f in files) or not files:
│          # Sistemos vientisumas: po architekto pakeitimų neturi likti vaidmens be
│          # timer'io, modelio ar baigties sąlygos.
│ agents/run.py
│ @@ -722,7 +722,7 @@
│          # `--strict` krenta tik dėl KLAIDŲ (įspėjimai neblokuoja).
│          grades = sorted({
│              m.group(1) for f in files
│ -            if (m := re.match(r"content/[^/]+/grade-(\\d+)/", f))
│ +            if (m := re.match(r"content/[^/]+/grade-(\d+)/", f))
│          })
│          for grade_no in grades or []:
│              checks.append((f"kalba (grade {grade_no})",
│ agents/profiles.py
│ @@ -43,10 +43,24 @@
│      return out
│
│
│ +def calendar_key(cal) -> str:
│ +    """`on_calendar` → palyginama eilutė.
│ +
│ +    `publikavimo-agentas` turi PENKIS laikus (sąrašą), visi kiti — vieną
│ +    eilutę. Rikiavimas tiesiog `sorted(..., key=on_calendar)` virsdavo
│ +    `TypeError: '<' not supported between instances of 'list' and 'str'`, todėl
│ +    `system_report.py` modelių lentelė NIEKADA nebuvo parodoma — kas paleidžia
│ +    kiekvieną agentą, nebuvo matoma nė vienoje ataskaitoje (2026-11-08).
│ +    """
│ +    if isinstance(cal, (list, tuple)):
│ +        return min((str(c) for c in cal), default="")
│ +    return str(cal or "")
│ +
│ +
│  def for_roles(roles: dict) -> list[dict]:
│      """ROLES → eilutės lentelei."""
│      rows = []
│ -    for role, cfg in sorted(roles.items(), key=lambda kv: (kv[1].get("on_calendar") or "", kv[0])):
│ +    for role, cfg in sorted(roles.items(), key=lambda kv: (calendar_key(kv[1].get("on_calendar")), kv[0])):
│          info = resolve(cfg.get("profile", ""))
│          rows.append({
│              "role": role,
│ agents/profiles.py
│ @@ -84,7 +84,7 @@
│      keys = ["role", "profile", "provider", "model", "on_calendar"]
│      data = []
│      for r in rows:
│ -        cal = r["on_calendar"] or ""
│ +        cal = calendar_key(r["on_calendar"])
│          when = cal.split(" ")[-1].rsplit(":", 1)[0] if ":" in cal else cal
│          days = cal.split(" ")[0] if " " in cal else ""
│          days = "" if days == "*-*-*" else days.replace(",", ", ")
│ scripts/kurejas_queue.py
│ @@ -30,8 +30,21 @@
│  sys.path.insert(0, str(ROOT / "agents"))
│  import db  # noqa: E402
│  import pause as system_pause  # noqa: E402
│ +import run as runner  # noqa: E402
│
│  PRIORITY_ORDER = {"high": 0, "normal": 1, "low": 2}
│ +
│ +# Pasiūlymai, kurių tikslas — sistemos failas (agentų bėgiklis, skriptai,
│ +# publikavimas, dashboard, normatyviniai dokumentai), NE kūrėjo darbas. Kūrėjo
│ +# vaidmuo jų neliesti negali (ribos), todėl kiekvienas toks bandymas = iki
│ +# 20 min darbo ir vis tiek `blocked`. 2026-11-08 tokie buvo 9 iš 21 eilės
│ +# pasiūlymų — eilės galva buvo `agents/run.py`, o ne pamoka vaikui.
│ +SYSTEM_PREFIXES = ("agents/", "scripts/", "deploy/", "dashboard/", "docs/")
│ +
│ +# Trumpesnis paleidimas laikomas „nebandymu“: modelis nepradėjo darbo (tuščias
│ +# ciklas, neįkeltas profilis). Toks paleidimas neturi sudeginti pasiūlymo —
│ +# 2026-11-07 eilė per 40 s taip sudegino 37 pasiūlymus (3 s kiekvienas).
│ +MIN_ATTEMPT_S = 120
│
│  # „tema“ tipo pasiūlymas, kurio failas JAU yra, reiškia, kad modulis jau
│  # sukurtas (pasiūlymas pasenęs) — jo kurti antrą kartą nereikia.
│ scripts/kurejas_queue.py
│ @@ -118,14 +118,36 @@
│      return obsolete, duplicates
│
│
│ +def is_system_work(prop: dict) -> bool:
│ +    """Ar pasiūlymas skirtas sistemos failui, ne pamokos turiniui."""
│ +    paths = runner.target_paths(prop.get("target") or "")
│ +    return bool(paths) and all(p.startswith(SYSTEM_PREFIXES) for p in paths)
│ +
│ +
│  def queue() -> list[dict]:
│ -    rows = [r for r in db.proposals(500, status="new")]
│ +    rows = [r for r in db.proposals(500, status="new") if not is_system_work(r)]
│      rows.sort(key=lambda r: (PRIORITY_ORDER.get((r.get("priority") or "normal").lower(), 1), int(r["id"])))
│      return rows
│
│
│ -def run_one(proposal_id: int) -> tuple[str, str]:
│ -    """Paleidžia vieną kūrėjo darbą. Grąžina (statusas, eilutė)."""
│ +def system_queue() -> list[dict]:
│ +    """Sisteminiai pasiūlymai — rodomi, bet kūrėjui neduodami."""
│ +    rows = [r for r in db.proposals(500, status="new") if is_system_work(r)]
│ +    rows.sort(key=lambda r: (PRIORITY_ORDER.get((r.get("priority") or "normal").lower(), 1), int(r["id"])))
│ +    return rows
│ +
│ +
│ +def _last_run_id() -> int:
│ +    try:
│ +        rows = db.recent_runs(1)
│ +        return int(rows[0]["id"]) if rows else 0
│ +    except Exception:  # noqa: BLE001
│ +        return 0
│ +
│ +
│ +def run_one(proposal_id: int) -> tuple[str, str, dict | None]:
│ +    """Paleidžia vieną kūrėjo darbą. Grąžina (pasiūlymo būsena, eilutė, run įrašas)."""
│ +    before_run = _last_run_id()
│      cmd = [
│          sys.executable, str(ROOT / "agents" / "run.py"), "kurejas",
│          "--proposal", str(proposal_id), "--trigger", "queue",
│ @@ -140,7 +162,16 @@
│          status = rows[0]["status"] if rows else "unknown"
│      except Exception:  # noqa: BLE001
│          status = "unknown"
│ -    return status, line
│ +
│ +    # Paleidimo įrašas: be jo negalima atskirti „nepavyko“ nuo „net nepradėjo“.
│ +    run_row = None
│ +    try:
│ +        fresh = [r for r in db.recent_runs(8)
│ +                 if int(r["id"]) > before_run and r.get("role") == "kurejas"]
│ +        run_row = fresh[0] if fresh else None
│ +    except Exception:  # noqa: BLE001
│ +        pass
│ +    return status, line, run_row
│
│
│  def main() -> int:
│ scripts/kurejas_queue.py
│ @@ -193,7 +193,12 @@
│              print(f"Tvarkyklė: pasenę {obsolete}, dubliai {duplicates}")
│
│      pending = queue()
│ +    system = system_queue()
│      print(f"Eilėje: {len(pending)} pasiūlymų (imsiu iki {args.max_items}, iki {args.max_minutes} min)")
│ +    if system:
│ +        print(f"  Sisteminių (ne kūrėjo darbas): {len(system)} — "
│ +              + ", ".join(f"#{p['id']}" for p in system[:6])
│ +              + (" …" if len(system) > 6 else ""))
│
│      if args.dry_run:
│          for p in pending[: args.max_items]:
│ @@ -201,8 +206,7 @@
│          return 0
│
│      started = time.time()
│ -    done = blocked = 0
│ -    processed = 0
│ +    done = blocked = review = processed = 0
│
│      while processed < args.max_items and (time.time() - started) / 60 < args.max_minutes:
│          pending = queue()
│ @@ -214,9 +218,9 @@
│          print(f"→ #{prop['id']} [{prop.get('priority')}] {prop.get('title')[:60]}")
│
│          # Jei kitas agentas laiko užraktą, palaukiam (bet ne amžinai).
│ -        status, line = "unknown", ""
│ +        status, line, run_row = "unknown", "", None
│          for _ in range(6):
│ -            status, line = run_one(int(prop["id"]))
│ +            status, line, run_row = run_one(int(prop["id"]))
│              if "jau dirba" not in line:
│                  break
│              time.sleep(60)
│ @@ -228,18 +232,41 @@
│              # agentams (kalbų redaktoriui, architektui): užraktas globalus,
│              # todėl be šio lango ilga eilė niekada neužleidžia vietos.
│              time.sleep(25)
│ -        else:
│ -            blocked += 1
│ -            if status == "new":
│ -                # Paleidimas nepakeitė būsenos — žymim, kad eilė nekilų amžinai.
│ -                db.set_proposal_status(int(prop["id"]), "blocked", f"paleidimas nepavyko: {line[:120]}")
│ -            # Du iš eilės nepavykę — sustojam, kad nekęstume be galo.
│ -            if blocked >= 2 and done == 0:
│ -                print("Du nepavykę iš eilės — stabdau šį paleidimą.")
│ -                break
│ +            continue
│ +
│ +        # Ar paleidimas apskritai ėmėsi darbo? 3 s paleidimas su 0 failų yra
│ +        # sugedusi aplinka, o ne pasiūlymo kaltė. Tokiu atveju pasiūlymas
│ +        # NEPAŽYMIMAS blocked (kitaip jis prarandamas visam laikui) — stabdome
│ +        # visą eilę ir paliekame tai, ką reikia sutvarkyti žmogui/architektui.
│ +        duration = int((run_row or {}).get("duration_s") or 0)
│ +        artifacts = (run_row or {}).get("artifacts") or "[]"
│ +        run_status = (run_row or {}).get("status") or "—"
│ +        if run_row is not None and duration < MIN_ATTEMPT_S and artifacts in ("[]", "", None):
│ +            db.set_proposal_status(int(prop["id"]), "new",
│ +                                   f"bandymas neįvyko: {run_status} per {duration}s, 0 failų")
│ +            print(f"   Paleidimas truko {duration}s ir nepakeitė nė vieno failo — "
│ +                  f"tai ne bandymas. Pasiūlymas lieka new, stabdau eilę.")
│ +            break
│ +
│ +        if run_status == "published":
│ +            # Darbas paskelbtas, bet pasiūlymas neuždarytas: tikslas nepaliestas
│ +            # arba jo nesutvarkė `mark_implemented`. Tai PERŽIŪROS, o ne eilės
│ +            # gedimo atvejis — 2026-11-08 taip buvo visi 6 blokuoti.
│ +            review += 1
│ +            db.set_proposal_status(int(prop["id"]), "blocked",
│ +                                   f"paskelbta, bet tikslas nepakeistas — reikia peržiūros ({line[:80]})")
│ +            continue
│ +
│ +        blocked += 1
│ +        db.set_proposal_status(int(prop["id"]), "blocked", f"paleidimas nepavyko: {line[:120]}")
│ +        # Du nepavykę iš eilės — stabdome, kad nekęstume be galo.
│ +        if blocked >= 2 and done == 0:
│ +            print("Du nepavykę iš eilės — stabdau šį paleidimą.")
│ +            break
│ … omitted 8 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/probe_targets.py
│ @@ -0,0 +1,26 @@
│ +import sys, pathlib, sqlite3, shutil, tempfile
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +sys.path.insert(0, str(ROOT / 'agents'))
│ +import run as runner
│ +import db
│ +
│ +print('== target_paths (gyvi pasiūlymai) ==')
│ +c = sqlite3.connect(ROOT / 'agents/runs.db'); c.row_factory = sqlite3.Row
│ +for r in c.execute("SELECT id,target,status FROM proposals WHERE status IN ('new','blocked') ORDER BY id"):
│ +    print(f"#{r['id']:5} {r['status']:8} {runner.target_paths(r['target'] or '')}")
│ +
│ +print('\n== mark_implemented (DB kopija) ==')
│ +tmp = pathlib.Path(tempfile.mkdtemp()) / 'runs.db'
│ +shutil.copy(ROOT / 'agents/runs.db', tmp)
│ +db.DB_PATH = tmp
│ +
│ +# #5826: sudėtinis tikslas, pakeistas antrasis failas
│ +print('5826 geometrija.js ->', runner.mark_implemented(5826, ['assets/js/sims/geometrija.js'], 'deadbee'))
│ +# #4802: paprastas, bet pakeistas kitas failas
│ +print('4802 kitas failas ->', runner.mark_implemented(4802, ['assets/js/sims/matematika.js'], 'deadbee'))
│ +# #5986: target su :1082
│ +print('5986 pasaulis.js ->', runner.mark_implemented(5986, ['assets/js/sims/pasaulis.js'], 'deadbee'))
│ +# #5400: target scripts/sync_docs_facts.py (neegzistuojantis), tinkamas kelias
│ +print('5400 sync_docs_facts.py ->', runner.mark_implemented(5400, ['scripts/sync_docs_facts.py'], 'deadbee'))
│ +# 0 pasiūlymas
│ +print('None ->', runner.mark_implemented(None, ['x'], 'deadbee'))
│ agents/run.py
│ @@ -808,8 +808,8 @@
│      out: list[str] = []
│      for token in re.split(r"\s*(?:\+|;|,)\s*", target or ""):
│          token = token.strip().strip("`'\"")
│ +        token = re.sub(r"\s*\([^()]*\)\s*$", "", token)          # … (sim.config.words)
│          token = re.sub(r":\d+(?:[-–]\d+)?$", "", token)          # …:112
│ -        token = re.sub(r"\s*\([^()]*\)\s*$", "", token)          # … (sim.config.words)
│          token = token.strip().strip("`'\"")
│          if not token:
│              continue
│ scripts/system_report.py
│ @@ -64,6 +64,7 @@
│      rows = db.proposals(500)
│      by_status: dict[str, int] = {}
│      oldest_new = None
│ +    blocked: list[dict] = []
│      for r in rows:
│          st = r.get("status") or "?"
│          by_status[st] = by_status.get(st, 0) + 1
│ @@ -71,6 +72,9 @@
│              created = r.get("created") or ""
│              if created and (oldest_new is None or created < oldest_new):
│                  oldest_new = created
│ +        elif st == "blocked":
│ +            blocked.append({"id": int(r["id"]), "title": (r.get("title") or "")[:70],
│ +                            "note": (r.get("note") or "")[:80]})
│      age_days = None
│      if oldest_new:
│          try:
│ @@ -79,7 +83,11 @@
│              age_days = (now - stamp).days
│          except ValueError:
│              age_days = None
│ -    return {"by_status": by_status, "oldest_new_days": age_days, "total": len(rows)}
│ +    # `blocked` yra kapinės: eilė jų nebeliеčia, niekas jų nebeatidaro. Todėl
│ +    # ataskaita privalo jas parodyti vardais, o ne vienu skaičiumi (2026-11-08
│ +    # visi 6 blokuoti buvo realūs defektai, kurių niekas nebetaisys).
│ +    return {"by_status": by_status, "oldest_new_days": age_days, "total": len(rows),
│ +            "blocked": sorted(blocked, key=lambda x: x["id"])}
│
│
│  def timers() -> list[dict]:
│ scripts/system_report.py
│ @@ -198,6 +198,10 @@
│      print(f"\nPasiūlymai: {p['total']} · " + ", ".join(f"{k} {v}" for k, v in sorted(p["by_status"].items())))
│      if p["oldest_new_days"] is not None:
│          print(f"Seniausias neapdorotas: prieš {p['oldest_new_days']} d.")
│ +    if p.get("blocked"):
│ +        print(f"Blokuoti (niekas nebeatidaro — reikia sprendimo): {len(p['blocked'])}")
│ +        for b in p["blocked"][:6]:
│ +            print(f"  #{b['id']} {b['title']} · {b['note']}")
│
│      print("\nPatikros:")
│      for name, c in data["checks"].items():
│ scripts/system_report.py
│ @@ -83,7 +83,7 @@
│              age_days = (now - stamp).days
│          except ValueError:
│              age_days = None
│ -    # `blocked` yra kapinės: eilė jų nebeliеčia, niekas jų nebeatidaro. Todėl
│ +    # `blocked` yra kapinės: eilė jų nebeliečia, niekas jų nebeatidaro. Todėl
│      # ataskaita privalo jas parodyti vardais, o ne vienu skaičiumi (2026-11-08
│      # visi 6 blokuoti buvo realūs defektai, kurių niekas nebetaisys).
│      return {"by_status": by_status, "oldest_new_days": age_days, "total": len(rows),
│ profiles/deepseek41flash/cache/scratch/probe_checks.py
│ @@ -0,0 +1,12 @@
│ +import sys, pathlib
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +sys.path.insert(0, str(ROOT / 'agents'))
│ +import run as runner
│ +
│ +ok, rep = runner.run_checks(['content/lt/grade-01/matematika/14-pinigai.json'])
│ +print('CONTENT ok=', ok)
│ +print(rep)
│ +print('---')
│ +ok2, rep2 = runner.run_checks(['agents/profiles.py'])
│ +print('AGENTS ok=', ok2)
│ +print(rep2)
│ scripts/kurejas_queue.py
│ @@ -185,7 +185,20 @@
│      ap.add_argument("--max-minutes", type=int, default=720)
│      ap.add_argument("--dry-run", action="store_true")
│      ap.add_argument("--no-triage", action="store_true", help="nepažymėti pasenusių/dubliuojančių")
│ +    ap.add_argument("--retry-blocked", type=int, default=0, metavar="N",
│ +                    help="atidaryti N blokuotų pasiūlymų (blocked → new) ir bandyti iš naujo")
│      args = ap.parse_args()
│ +
│ +    if args.retry_blocked and not args.dry_run:
│ +        reopened = 0
│ +        for row in sorted(db.proposals(500, status="blocked"), key=lambda r: int(r["id"])):
│ +            if reopened >= args.retry_blocked:
│ +                break
│ +            db.set_proposal_status(int(row["id"]), "new",
│ +                                   f"pakartotinai atidaryta (buvo: {(row.get('note') or '')[:60]})")
│ +            reopened += 1
│ +        if reopened:
│ +            print(f"Atidaryta iš naujo: {reopened} blokuotų pasiūlymų")
│
│      if not args.dry_run and not args.no_triage:
│          obsolete, duplicates = triage()
│ profiles/deepseek41flash/cache/scratch/probe_retry.py
│ @@ -0,0 +1,17 @@
│ +import sys, pathlib, shutil, tempfile, sqlite3
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +sys.path.insert(0, str(ROOT / 'agents'))
│ +sys.path.insert(0, str(ROOT / 'scripts'))
│ +import db
│ +tmp = pathlib.Path(tempfile.mkdtemp()) / 'runs.db'
│ +shutil.copy(ROOT / 'agents/runs.db', tmp)
│ +db.DB_PATH = tmp
│ +import kurejas_queue as q
│ +
│ +sys.argv = ['kurejas_queue.py', '--retry-blocked', '2', '--max-items', '0', '--no-triage']
│ +q.main()
│ +c = sqlite3.connect(tmp)
│ +print('blocked liko:', c.execute("SELECT COUNT(*) FROM proposals WHERE status='blocked'").fetchone()[0])
│ +print('new dabar:', c.execute("SELECT COUNT(*) FROM proposals WHERE status='new'").fetchone()[0])
│ +for r in c.execute("SELECT id,status,substr(note,1,70) FROM proposals WHERE id IN (331,451) ORDER BY id"):
│ +    print(r)
│ profiles/deepseek41flash/cache/scratch/fix_proposals.py
│ @@ -0,0 +1,21 @@
│ +import sys, pathlib, subprocess
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +sys.path.insert(0, str(ROOT / 'agents'))
│ +import db
│ +
│ +# 1) #451 buvo ištirtas paleidime #117: eilė deterministinė, Math.random po
│ +#    įkėlimo — 0 kvietimų. Tai ne darbas, o jau sutvarkytas dalykas.
│ +db.set_proposal_status(451, "obsolete",
│ +                       "patikrinta paleidime #117: tvarka fiksuota (pasaulis.js:591–601), Math.random 0 kvietimų")
│ +
│ +# 2) Likusieji blokuoti — realūs defektai, kurių niekas nebeatidarė.
│ +for pid in (331, 4199, 4516, 4563, 4739):
│ +    db.set_proposal_status(pid, "new", "atidaryta iš naujo: paleidimas paskelbė kitą failą, tikslas liko nepaliestas")
│ +
│ +# 3) #5544 — kalbos tikrintuvas bėgiklio vartuose (šio paleidimo darbas).
│ +db.set_proposal_status(5544, "done",
│ +                       "įgyvendinta paleidime #174: run_checks() paleidžia check_language --strict turinio pakeitimams")
│ +
│ +for r in db.proposals(500):
│ +    if int(r["id"]) in (331, 4199, 451, 4516, 4563, 4739, 5544):
│ +        print(r["id"], r["status"], "|", (r["note"] or "")[:80])
Ataskaita — sistemos architektas, paleidimas #174 (2026-11-08)

## Matavimai (prieš / po)

`system_report.py`, 171 paleidimai per 7 d.:
- kurejas 96 paleid. / 52 publ. / 3 % nenaudingų, vid. 8,0 min
- metodininkas 60 %, simuliaciju-inzinierius 40 %, tikrintojas 40 %, ideator 36 %, leidejas 33 %, kritikas 33 % nenaudingų
- pasiūlymai: 82 · new 21, done 48, obsolete 7, blocked 6 · seniausias neapdorotas 4 d.
- modelių lentelė: **neveikė** (`TypeError: '<' not supported between list and str`)
- eilės galva: 21 pasiūlymas, iš jų 9 rodo į `agents/`/`scripts/` failus, kurių kūrėjas liesti negali

Po pakeitimų: modelių lentelė rodo visus 15 vaidmenų; eilė — 12 kūrėjo darbų + 9 sisteminiai; blokuoti 1 (buvo 6); `new` 16 (5 atidaryti iš naujo + #5544 uždarytas).

## Ką pakeičiau (sisteminiai failai)

1. **`agents/profiles.py`** — `calendar_key()`: `publikavimo-agentas` turi 5 laikus (sąrašą), kiti — eilutę; `sorted()` virsdavo `TypeError`, todėl „kas paleidžia kiekvieną agentą“ nebuvo matoma nė vienoje ataskaitoje. Dabar lentelė veikia.
2. **`agents/run.py`**
   - `target_paths()` + `mark_implemented()`: tikslas skaidomas į failų kelius (atmetama `:112`, `(paaiškinimas)`, `+`). Sudėtiniai tikslai (#5826, #5986, #5984) dabar uždaromi; neįrodytas darbas — ne.
   - `checked` statusas tik `inspect: True` vaidmenims (tikrintojas, publikavimo-agentas, kuratorius, sveikatos-inspektorius). Kūrėjo 3 s „sėkmė“ nebeužmaskuojama.
   - `run_checks()` paleidžia `check_language.py --strict` turinio pakeitimams (įgyvendintas #5544 — kalbos vartai buvo CI, bet ne bėgiklyje).
3. **`scripts/kurejas_queue.py`** — sisteminiai pasiūlymai (`agents/`, `scripts/`, `deploy/`, `dashboard/`, `docs/`) nebeduodami kūrėjui; paleidimas <120 s su 0 failų — „nebandymas“: pasiūlymas lieka `new`, eilė stabdoma (anksčiau 37 pasiūlymai sudeginti per 40 s); „paskelbta, bet tikslas nepakeistas“ atskirta nuo gedimo; naujas `--retry-blocked N`.
4. **`scripts/system_report.py`** — blokuoti pasiūlymai rodomi vardais su priežastimi (buvo tik skaičius).
5. **`research/wiki/guidelines/pamokos.md`** — LL-62 („paleidimas, kuris pavyko nieko nepadaręs“, su skaičiais 76–87) ir LL-63 („tikslas, kuris niekada nesutaps su failu“).
6. **Duomenų taisymas DB**: #451 → `obsolete` (patikrinta: `pasaulis.js` tvarka fiksuota, `Math.random` 0 kvietimų); #331, #4199, #4516, #4563, #4739 atidaryti iš naujo (realūs defektai, kurių niekas nebeatidarė); #5544 → `done`.

## Patikra

`py_compile` OK; `check_agents` 15 vaidmenų ✔; `check_lessons` 63 įrašai ✔; `validate_content` 0 klaidų ✔; `check_ui` ✔; `check_language --grade 1 --strict` 0 klaidų; zondai: `target_paths` teisingai išsprendžia visus 21 gyvus tikslus, `mark_implemented` True/False kaip tikėtasi (DB kopijoje), `run_checks` turiniui paleidžia „kalba (grade 01): OK“, `--retry-blocked` veikia DB kopijoje; `gen_timers.py --install` + `daemon-reload` atlikta (15 timerių).

## Neišspręsta sąmoningai

- **`blocked` neturi grąžinimo politikos** — pridėjau `--retry-blocked`, bet automatinio peržiūros ciklo nėra; blokuotus turi peržiūrėti žmogus arba kuratorius.
- **#4516** (`check_language --strict` sakinio riba lieka įspėjimu) ir **#4808, #4921, #5047, #5190, #5342, #5400, #5827** — sisteminiai pasiūlymai, dabar teisingai nukreipti, bet dar neįgyvendinti.
- **Dokumentacijos skaičiai** (`docs/ARCHITEKTURA.md`: 31 modulis) ir **`agents/system-journal.md` įrašas** bei **`agents/state.json`** — nepadaryti: baigėsi įrankių limitas. Dienoraščio įrašą reikia įrašyti prieš kitą paleidimą; bėgiklis ataskaitą į `agents/log/` įrašys pats.
- **Du vaidmenys viename darbiniame kataloge** — ta pati problema, kuri lėmė `interrupted: sustabdyta keičiant užraktą` seriją 09:22–09:43; reikia atskiro sprendimo (worktree arba griežtesnis užrakto perdavimas), ne vienos eilutės.

⚠️ File-mutation verifier: 1 file edit(s) FAILED this turn despite any wording above that may suggest otherwise. Run `git status` or `read_file` to confirm what actually landed.
  • `/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/q.py` — [write_file] Refusing to overwrite `/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/q.py`: `/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/q.py` exists but this task h…

## klaidos

```
session_id: local-417de0dd12528ddb15cde35ce08686fab030e6dd70fa9ba157e65161ca721b8f
```
