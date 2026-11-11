# sistemos-architektas — 2026-11-11T2021

- paleidimas: #238 (manual)
- trukmė: 602s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/probe238_db.py
│ @@ -0,0 +1,17 @@
│ +import sqlite3, json, os
│ +os.chdir('/home/zoltanas/workspace/suprask')
│ +c = sqlite3.connect('agents/runs.db'); c.row_factory = sqlite3.Row
│ +print('TABLES:', [r[0] for r in c.execute("select name from sqlite_master where type='table'")])
│ +print('RUNS COLS:', [r[1] for r in c.execute("PRAGMA table_info(runs)")])
│ +print('PROPOSALS COLS:', [r[1] for r in c.execute("PRAGMA table_info(proposals)")])
│ +print('--- last 20 non-ok runs ---')
│ +for r in c.execute("select * from runs where status in ('empty','conflict','error','rejected','failed') order by id desc limit 20"):
│ +    d = dict(r)
│ +    print({k: (str(v)[:180] if v is not None else None) for k, v in d.items()})
│ +print('--- status counts by role (7d) ---')
│ +for r in c.execute("select role,status,count(*) n from runs where started_at >= date('now','-7 day') group by role,status order by role,n desc"):
│ +    print(tuple(r))
│ +print('--- proposals 7397, 8716, 11235 ---')
│ +for r in c.execute("select * from proposals where id in (7397,8716,11235,4455) "):
│ +    d = dict(r)
│ +    print({k: (str(v)[:200] if v is not None else None) for k, v in d.items()})
│ profiles/deepseek41flash/cache/scratch/probe238_db2.py
│ @@ -0,0 +1,9 @@
│ +import sqlite3, os
│ +os.chdir('/home/zoltanas/workspace/suprask')
│ +c = sqlite3.connect('agents/runs.db'); c.row_factory = sqlite3.Row
│ +print('--- status counts last 30 runs ---')
│ +for r in c.execute("select id,role,status,started,duration_s,detail from runs order by id desc limit 40"):
│ +    print(r['id'], r['role'], r['status'], r['started'], r['duration_s'], (r['detail'] or '')[:110])
│ +print('--- status distribution 7d ---')
│ +for r in c.execute("select role,status,count(*) n from runs where started >= datetime('now','-7 day') group by role,status order by role,n desc"):
│ +    print(tuple(r))
│ profiles/deepseek41flash/cache/scratch/probe238_db3.py
│ @@ -0,0 +1,15 @@
│ +import sqlite3, os, collections
│ +os.chdir('/home/zoltanas/workspace/suprask')
│ +c = sqlite3.connect('agents/runs.db'); c.row_factory = sqlite3.Row
│ +print('--- kurejas status by day ---')
│ +for r in c.execute("select substr(started,1,10) d, status, count(*) n from runs where role='kurejas' group by d,status order by d"):
│ +    print(tuple(r))
│ +print('--- checked runs sample ---')
│ +for r in c.execute("select id,started,duration_s,detail from runs where status='checked' order by id limit 3"):
│ +    print(dict(r))
│ +print('--- paused runs total/duration ---')
│ +for r in c.execute("select count(*) n, min(started) a, max(started) b from runs where status='paused'"):
│ +    print(dict(r))
│ +print('--- proposals new non-system ---')
│ +for r in c.execute("select id,role,created,type,priority,target,title from proposals where status='new' order by id"):
│ +    print(r['id'], r['role'], r['created'][:10], r['priority'], (r['target'] or '')[:60], '|', (r['title'] or '')[:70])
│ profiles/deepseek41flash/cache/scratch/probe238_scope_before.py
│ @@ -0,0 +1,13 @@
│ +import sys, json
│ +sys.path.insert(0, '/home/zoltanas/workspace/suprask/agents')
│ +import scope
│ +
│ +cov = scope.coverage(1)
│ +print('TOPICS', len(cov), 'covered', sum(1 for c in cov if c['covered']))
│ +for c in cov:
│ +    print(('OK ' if c['covered'] else '-- '), c['topic'], '->', c['modules'][:3])
│ +print()
│ +subs = scope.subject_coverage(1)
│ +print('SUBJECTS')
│ +for s in subs:
│ +    print(('OK ' if s['covered'] else '-- '), s['subject'], s['label'], '->', s['modules'][:3])
│ profiles/deepseek41flash/cache/scratch/probe238_modules.py
│ @@ -0,0 +1,5 @@
│ +import json, glob, os
│ +os.chdir('/home/zoltanas/workspace/suprask')
│ +for f in sorted(glob.glob('content/lt/grade-01/*/*.json')):
│ +    d = json.load(open(f))
│ +    print(d['strand'].ljust(20), d['id'].ljust(34), d['title'][:62])
│ agents/scope.py
│ @@ -162,16 +162,27 @@
│  def normalise_subject(text: str) -> str:
│      """Įveda žmogus: gali būti raktas (matematika) arba pavadinimas (Matematika).
│      Grąžiname raktą, jei atpažįstame; kitaip paliekame įvestą tekstą — sąrašas
│ -    nėra uždaras, mokytojas gali turėti savo dalyką."""
│ -    raw = text.strip()
│ -    low = raw.lower().replace("ė", "e").replace("ų", "u").replace("ū", "u")
│ +    nėra uždaras, mokytojas gali turėti savo dalyką.
│ +
│ +    Lyginama per `_norm()` (be diakritikų, be skyrybos), nes žmogus dashboard'e
│ +    rašo „gyvenimo-įgūdžiai“, o raktas yra ascii `gyvenimo-igudziai`. Anksčiau
│ +    buvo keičiamos tik trys raidės (ė/ų/ū), todėl „gyvenimo-įgūdžiai“,
│ +    „pilietiškumas“ ir panašūs įrašai likdavo neatpažinti ir padengtis
│ +    pranešdavo „DAR NĖRA“ apie dalyką, kurio modulis jau yra (2026-11-11
│ +    Žr. LL-82).
│ +    """
│ +    raw = str(text).strip()
│ +    if not raw:
│ +        return raw
│ +    slug = _norm(raw).replace(" ", "-")
│      for key, label in SUBJECTS.items():
│ -        if raw == key or low == key:
│ +        if slug == key or slug == _norm(label).replace(" ", "-"):
│              return key
│ -        lab_low = label.lower().replace("ė", "e").replace("ų", "u").replace("ū", "u")
│ -        if low == lab_low:
│ +    for key, label in SUBJECTS.items():
│ +        key_slug = key.replace("-", " ")
│ +        label_slug = _norm(label)
│ +        if slug and (slug in {key_slug, label_slug} or slug.replace("-", " ") in {key_slug, label_slug}):
│              return key
│ -    slug = re.sub(r"[^a-z0-9]+", "-", low).strip("-")
│      for key, label in SUBJECTS.items():
│          if slug and (slug in key or key in slug):
│              return key
│ agents/scope.py
│ @@ -292,11 +292,47 @@
│      return out
│
│
│ +def _word_matcher(word: str) -> re.Pattern[str] | None:
│ +    """Žodžio kamieno ieškotojas normalizuotame modulio tekste.
│ +
│ +    Lietuvių kalboje kinta galūnė, o kamienas lieka: tema „Garsai ir raidės“, o
│ +    modulis vadinasi „Garsas ir raidė“. Todėl lyginame ne visą žodį, o ilgiausią
│ +    prefiksą, kuris dar gali atstoti kitą to paties žodžio formą: „garsai“ →
│ +    „gars“, „skiemenavimas“ → „skiemen“, o tekstas turi „skiemenų“.
│ +
│ +    Prefiksas trumpinamas iki 5 raidžių ir ne trumpiau — 4 raidžių kamienas
│ +    („laik“ atstoja ir „laikas“, ir „laikrodis“) sujungtų skirtingas sąvokas.
│ +    Ieškoma tik žodžio pradžioje, kad „ras“ neatitiktų „paraše“.
│ +    """
│ +    if len(word) < 4:
│ +        return None
│ +    lengths = [n for n in range(len(word), 4, -1) if n >= 5] or [len(word)]
│ +    alts = "|".join(re.escape(word[:n]) for n in lengths)
│ +    return re.compile(rf"(?:^| )(?:{alts})")
│ +
│ +
│ +def _word_hits(word: str, blob: str) -> bool:
│ +    pattern = _word_matcher(word)
│ +    if pattern is None:
│ +        return word in blob
│ +    return pattern.search(blob) is not None
│ +
│ +
│  def coverage(grade: int) -> list[dict]:
│      """Ar minimalios temos jau turi bent vieną modulį.
│
│ -    Tai apytikrė patikra (žodžių sutapimas), ne semantinė: ji skirta parodyti,
│ -    ko dar niekas nelietė, o ne pakeisti žmogaus sprendimą.
│ +    Tai apytikrė patikra (žodžių kamienų sutapimas), ne semantinė: ji skirta
│ +    parodyti, ko dar niekas nelietė, o ne pakeisti žmogaus sprendimą. Todėl
│ +    atsakymas turi tris reikšmes, ne dvi:
│ +
│ +    - `covered` — tema pakankamai sutampa su moduliu (≥60 % temų žodžių),
│ +    - `partial` — modulis temą liečia, bet ne visus jos žodžius; tai DARBAS,
│ +      ne padengta tema (anksčiau toks atvejis atrodė kaip „DAR NĖRA“, o agentas
│ +      kūrė tai, kas jau buvo),
│ +    - nei viena, nei kita — temos nelietė niekas.
│ +
│ +    Vienas žodis modulio tekste skaitomas kaip dalis tik tada, kai jis rastas
│ +    žodžio pradžioje (žr. `_word_matcher`).
│      """
│      data = load()
│      cell = data["grades"].get(str(int(grade)), {})
│ @@ -304,12 +340,24 @@
│      result = []
│      for topic in cell.get("min_topics", []):
│          words = [w for w in _norm(topic).split() if len(w) >= 4] or _norm(topic).split()
│ -        hits = []
│ +        scored: list[tuple[int, str]] = []
│          for mid, blob in modules:
│ -            matched = sum(1 for w in words if w in blob)
│ -            if words and matched >= max(1, -(-len(words) * 6 // 10)):  # 60 %
│ -                hits.append(mid)
│ -        result.append({"topic": topic, "covered": bool(hits), "modules": hits[:4]})
│ +            matched = sum(1 for w in words if _word_hits(w, blob))
│ +            if matched:
│ +                scored.append((matched, mid))
│ +        scored.sort(key=lambda x: (-x[0], x[1]))
│ +        need = max(1, -(-len(words) * 6 // 10))  # 60 %
│ +        strong = [mid for m, mid in scored if m >= need]
│ +        weak = [mid for m, mid in scored if m < need]
│ +        hits = strong or weak
│ +        result.append({
│ +            "topic": topic,
│ +            "covered": bool(strong),
│ +            "partial": bool(weak) and not strong,
│ +            "modules": hits[:4],
│ +            "matched": max((m for m, _ in scored), default=0),
│ +            "words": len(words),
│ +        })
│      return result
│
│ … omitted 1 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/probe238_scope_after.py
│ @@ -0,0 +1,20 @@
│ +import sys, importlib
│ +sys.path.insert(0, '/home/zoltanas/workspace/suprask/agents')
│ +import scope
│ +importlib.reload(scope)
│ +
│ +cov = scope.coverage(1)
│ +print('TOPICS', len(cov), 'covered', sum(1 for c in cov if c['covered']),
│ +      'partial', sum(1 for c in cov if c['partial']),
│ +      'missing', sum(1 for c in cov if not c['covered'] and not c['partial']))
│ +for c in cov:
│ +    state = 'OK ' if c['covered'] else ('~  ' if c['partial'] else '-- ')
│ +    print(state, c['topic'].ljust(28), f"{c['matched']}/{c['words']}", c['modules'][:3])
│ +print()
│ +print('SUBJECTS')
│ +for s in scope.subject_coverage(1):
│ +    print(('OK ' if s['covered'] else '-- '), s['subject'].ljust(22), s['label'][:34], s['modules'][:3])
│ +print()
│ +print('normalise:', [scope.normalise_subject(x) for x in
│ +                     ['gyvenimo-įgūdžiai', 'pilietiškumas', 'Matematika', 'matematika',
│ +                      'Dorinis ugdymas (etika / tikyba)', 'dailė', 'daile', 'Kūno kultūra', 'Chemija']])
│ agents/scope.py
│ @@ -300,13 +300,15 @@
│      prefiksą, kuris dar gali atstoti kitą to paties žodžio formą: „garsai“ →
│      „gars“, „skiemenavimas“ → „skiemen“, o tekstas turi „skiemenų“.
│
│ -    Prefiksas trumpinamas iki 5 raidžių ir ne trumpiau — 4 raidžių kamienas
│ -    („laik“ atstoja ir „laikas“, ir „laikrodis“) sujungtų skirtingas sąvokas.
│ +    Prefiksas trumpinamas ne daugiau kaip 3 raidėmis ir ne trumpiau kaip iki
│ +    5 raidžių — kitaip „reiskiniai“ atitiktų „reiškia“ ir tema „Orų reiškiniai“
│ +    būtų paskelbta padengta moduliu apie skaičių tiesę (2026-11-11 zondas).
│      Ieškoma tik žodžio pradžioje, kad „ras“ neatitiktų „paraše“.
│      """
│      if len(word) < 4:
│          return None
│ -    lengths = [n for n in range(len(word), 4, -1) if n >= 5] or [len(word)]
│ +    floor = max(5, len(word) - 3)
│ +    lengths = [n for n in range(len(word), floor - 1, -1)] or [len(word)]
│      alts = "|".join(re.escape(word[:n]) for n in lengths)
│      return re.compile(rf"(?:^| )(?:{alts})")
│
│ agents/scope.py
│ @@ -351,7 +351,7 @@
│          need = max(1, -(-len(words) * 6 // 10))  # 60 %
│          strong = [mid for m, mid in scored if m >= need]
│          weak = [mid for m, mid in scored if m < need]
│ -        hits = strong or weak
│ +        hits = strong + weak
│          result.append({
│              "topic": topic,
│              "covered": bool(strong),
│ agents/run.py
│ @@ -384,7 +384,13 @@
│          if g["min_topics"]:
│              lines.append("  Minimalios temos, kurios PRIVALO būti padengtos:")
│              for c in g["coverage"]:
│ -                mark = "jau yra" if c["covered"] else "DAR NĖRA"
│ +                if c["covered"]:
│ +                    mark = "jau yra" + (f" ({', '.join(c['modules'][:2])})" if c.get("modules") else "")
│ +                elif c.get("partial"):
│ +                    near = ", ".join(c["modules"][:2]) or "—"
│ +                    mark = f"iš dalies ({near}) — temos branduolio dar nėra"
│ +                else:
│ +                    mark = "DAR NĖRA"
│                  lines.append(f"    - {c['topic']} — {mark}")
│          else:
│              lines.append("  Minimalių temų sąrašas tuščias — vadovaukis programos žemėlapiu.")
│ agents/run.py
│ @@ -404,6 +404,9 @@
│          "2a. Kiekvienas PRIVALOMAS DALYKAS turi turėti bent vieną modulį JAU DABAR; dalyko moduliai",
│          "    turi atitikti tos klasės bendrąją programą (ne vyresnės), o vienam dalykui gali būti",
│          "    keli moduliai pagal skirtingas pasiekimų sritis.",
│ +        "2b. Žyma „iš dalies“ NĖRA padengta tema: modulis temą paliečia, bet temos branduolio",
│ +        "    (vienos didelės idėjos, kurią vaikas supranta darydamas) dar nėra. Skaičius prie temos",
│ +        "    nurodo, kurį modulį verta skaityti prieš kuriant, kad nekartotum to paties modelio.",
│          "3. Kiekviena tema turi būti išnagrinėta visapusiškai: kas tai, kodėl taip, kaip atpažinti,",
│          "   kur gyvenime sutinkama, ką daryti kitaip — tiek, kiek leidžia klasės amžius.",
│          "4. Kalba ir uždavinių sudėtingumas — tos klasės vaikui, ne vyresniam.",
│ agents/run.py
│ @@ -405,8 +405,8 @@
│          "    turi atitikti tos klasės bendrąją programą (ne vyresnės), o vienam dalykui gali būti",
│          "    keli moduliai pagal skirtingas pasiekimų sritis.",
│          "2b. Žyma „iš dalies“ NĖRA padengta tema: modulis temą paliečia, bet temos branduolio",
│ -        "    (vienos didelės idėjos, kurią vaikas supranta darydamas) dar nėra. Skaičius prie temos",
│ -        "    nurodo, kurį modulį verta skaityti prieš kuriant, kad nekartotum to paties modelio.",
│ +        "    (vienos didelės idėjos, kurią vaikas supranta darydamas) dar nėra. Skliaustuose nurodytas",
│ +        "    modulis, kurį verta perskaityti prieš kuriant, kad nekartotum jau padaryto modelio.",
│          "3. Kiekviena tema turi būti išnagrinėta visapusiškai: kas tai, kodėl taip, kaip atpažinti,",
│          "   kur gyvenime sutinkama, ką daryti kitaip — tiek, kiek leidžia klasės amžius.",
│          "4. Kalba ir uždavinių sudėtingumas — tos klasės vaikui, ne vyresniam.",
│ dashboard/server.py
│ @@ -806,7 +806,7 @@
│          <div class="cov">${(g.subjects || []).map(s =>
│            `<span class="chip ${s.covered ? "mint" : ""}" title="${esc(s.modules.join(", "))}">${s.covered ? "✓" : "○"} ${esc(s.label)}</span>`).join("")}</div>
│            <div class="cov">${g.coverage.map(c =>
│ -            `<span class="chip ${c.covered ? "mint" : ""}">${c.covered ? "✓" : "○"} ${esc(c.topic)}</span>`).join("")}</div>
│ +            `<span class="chip ${c.covered ? "mint" : ""}" title="${esc((c.modules || []).join(", "))}">${c.covered ? "✓" : (c.partial ? "~" : "○")} ${esc(c.topic)}</span>`).join("")}</div>
│            <div class="row"><button data-save>Išsaugoti</button><span class="muted" data-msg></span></div>
│          </details>
│        </div>`).join("");
│ profiles/deepseek41flash/cache/scratch/probe238_brief.py
│ @@ -0,0 +1,5 @@
│ +import sys
│ +sys.path.insert(0, '/home/zoltanas/workspace/suprask/agents')
│ +sys.path.insert(0, '/home/zoltanas/workspace/suprask/scripts')
│ +import run
│ +print(run.scope_brief())
│ agents/scope.py
│ @@ -342,15 +342,21 @@
│      result = []
│      for topic in cell.get("min_topics", []):
│          words = [w for w in _norm(topic).split() if len(w) >= 4] or _norm(topic).split()
│ -        scored: list[tuple[int, str]] = []
│ +        scored: list[tuple[int, int, str]] = []  # (id sutapimai, teksto sutapimai, modulio id)
│          for mid, blob in modules:
│              matched = sum(1 for w in words if _word_hits(w, blob))
│ -            if matched:
│ -                scored.append((matched, mid))
│ -        scored.sort(key=lambda x: (-x[0], x[1]))
│ +            if not matched:
│ +                continue
│ +            # Modulio id (failo vardas) yra žmogaus duotas temos pavadinimas, todėl
│ +            # jo sutapimas vertesnis už atsitiktinį žodį outcomes tekste:
│ +            # „Sudėtis ir atimtis“ pirmiausia turi rodyti 22-sudetis-per-desimti,
│ +            # o ne modulį, kurio aprašyme žodis „sudėti“ pavartotas vieną kartą.
│ +            id_hit = sum(1 for w in words if _word_hits(w, _norm(mid)))
│ +            scored.append((id_hit, matched, mid))
│ +        scored.sort(key=lambda x: (-x[0], -x[1], x[2]))
│          need = max(1, -(-len(words) * 6 // 10))  # 60 %
│ -        strong = [mid for m, mid in scored if m >= need]
│ -        weak = [mid for m, mid in scored if m < need]
│ +        strong = [mid for _, m, mid in scored if m >= need]
│ +        weak = [mid for _, m, mid in scored if m < need]
│          hits = strong + weak
│          result.append({
│              "topic": topic,
│ agents/scope.py
│ @@ -363,7 +363,7 @@
│              "covered": bool(strong),
│              "partial": bool(weak) and not strong,
│              "modules": hits[:4],
│ -            "matched": max((m for m, _ in scored), default=0),
│ +            "matched": max((m for _, m, _ in scored), default=0),
│              "words": len(words),
│          })
│      return result
│ scripts/system_report.py
│ @@ -47,11 +47,19 @@
│          role = r.get("role") or "?"
│          cell = per_role.setdefault(role, {
│              "runs": 0, "published": 0, "ok": 0, "empty": 0, "conflict": 0,
│ -            "rejected": 0, "timeout": 0, "skipped": 0, "other": 0,
│ +            "rejected": 0, "timeout": 0, "skipped": 0, "other": 0, "paused": 0,
│              "duration_s": 0, "last": None,
│          })
│ +        st = (r.get("status") or "other").lower()
│ +        # Pristabdytas paleidimas NĖRA bandymas: jis įvyko tam, kad bėgiklis
│ +        # pasakytų „sistema pristabdyta“, ir truko 0 s. Jei jis skaičiuojamas kaip
│ +        # paleidimas, vidutinė trukmė krenta, o „nenaudingų“ dalis išsiskiedžia —
│ +        # 2026-11-11 sistema buvo sustojusi ~28 val., o lentelė rodė sveikus
│ +        # skaičius ir 0 % nenaudingų (LL-83).
│ +        if st == "paused":
│ +            cell["paused"] += 1
│ +            continue
│          cell["runs"] += 1
│ -        st = (r.get("status") or "other").lower()
│          if st in cell:
│              cell[st] += 1
│          else:
│ @@ -67,6 +75,49 @@
│              sum(cell[k] for k in ("empty", "conflict", "rejected", "timeout", "skipped")) / max(1, cell["runs"]), 2
│          )
│      return per_role, rows
│ +
│ +
│ +def _stamp(value: str) -> dt.datetime | None:
│ +    try:
│ +        return dt.datetime.fromisoformat(value)
│ +    except (TypeError, ValueError):
│ +        return None
│ +
│ +
│ +def pause_windows(rows: list[dict], gap_hours: float = 2.0) -> list[dict]:
│ +    """Kiek laiko sistema buvo pristabdyta (žmogaus sprendimas dashboard'e).
│ +
│ +    Pristabdymas yra teisėtas, bet jo trukmė iki šiol nebuvo niekur matuojama:
│ +    `paused` paleidimai liko sąraše kaip eiliniai, o turinys per tą laiką neaugo.
│ +    Todėl laiką skaičiuojame iš paleidimų laiko žymų: pristabdytų paleidimų
│ +    atkarpa baigiasi pirmu ne pristabdytu paleidimu po jos (arba dabartimi, jei
│ +    sistema vis dar pristabdyta).
│ +    """
│ +    items = sorted(((_stamp(r.get("started") or ""), (r.get("status") or "").lower()) for r in rows),
│ +                   key=lambda x: x[0] or dt.datetime.min.replace(tzinfo=dt.timezone.utc))
│ +    windows: list[dict] = []
│ +    cur: dict | None = None
│ +    for stamp, status in items:
│ +        if stamp is None:
│ +            continue
│ +        if status == "paused":
│ +            if cur and (stamp - cur["last"]) <= dt.timedelta(hours=gap_hours):
│ +                cur["last"] = stamp
│ +                cur["n"] += 1
│ +            else:
│ +                if cur:
│ +                    windows.append(cur)
│ +                cur = {"start": stamp, "last": stamp, "n": 1, "end": None}
│ +        elif cur:
│ +            cur["end"] = stamp
│ +            windows.append(cur)
│ +            cur = None
│ +    if cur:
│ +        windows.append(cur)
│ +    for w in windows:
│ +        end = w["end"] or (dt.datetime.now(tz=w["last"].tzinfo))
│ +        w["hours"] = round(max(0.0, (end - w["start"]).total_seconds()) / 3600, 1)
│ +    return windows
│
│
│  def proposals_summary() -> dict:
│ scripts/system_report.py
│ @@ -256,10 +256,15 @@
│      args = ap.parse_args()
│
│      per_role, rows = runs_summary(args.days)
│ +    paused_n = sum(c["paused"] for c in per_role.values())
│ +    windows = [w for w in pause_windows(rows) if w["hours"] >= 0.5]
│      data = {
│          "generated": dt.datetime.now().isoformat(timespec="seconds"),
│          "days": args.days,
│ -        "runs": {"total": len(rows), "per_role": per_role},
│ +        "runs": {"total": len(rows), "paused": paused_n, "per_role": per_role},
│ +        "pauses": [{"start": w["start"].isoformat(timespec="minutes"),
│ +                    "end": (w["end"] or w["last"]).isoformat(timespec="minutes"),
│ +                    "hours": w["hours"], "runs": w["n"]} for w in windows],
│          "proposals": proposals_summary(),
│          "timers": timers(),
│          "checks": checks(),
│ scripts/system_report.py
│ @@ -280,11 +280,21 @@
│          return 0
│
│      print(f"AGENTŲ SISTEMOS ATASKAITA · {data['generated']} · paskutinės {args.days} d.")
│ -    print(f"\nPaleidimai: {len(rows)}")
│ -    print(f"{'vaidmuo':<24}{'paleid.':>8}{'publ.':>7}{'tušti':>7}{'konfl.':>7}{'atm.':>6}{'vid.m':>7}{'nenaud.':>9}")
│ +    pause_note = f" (dar {paused_n} pristabdyta — žr. žemiau)" if paused_n else ""
│ +    print(f"\nPaleidimai: {len(rows)}{pause_note}")
│ +    print(f"{'vaidmuo':<24}{'paleid.':>8}{'publ.':>7}{'tušti':>7}{'konfl.':>7}{'atm.':>6}{'vid.m':>7}{'nenaud.':>9}{'prist.':>7}")
│      for role, c in sorted(per_role.items(), key=lambda kv: -kv[1]["runs"]):
│          print(f"{role:<24}{c['runs']:>8}{c['published']:>7}{c['empty']:>7}{c['conflict']:>7}"
│ -              f"{c['rejected']:>6}{c['avg_min']:>7}{int(c['useless_ratio'] * 100):>8}%")
│ +              f"{c['rejected']:>6}{c['avg_min']:>7}{int(c['useless_ratio'] * 100):>8}%{c['paused']:>7}")
│ +
│ +    if windows:
│ +        total_h = sum(w["hours"] for w in windows)
│ +        print(f"\nPristabdyta: {len(windows)} atkarp.(-os), iš viso {total_h:.1f} val. "
│ +              f"(pristabdyti paleidimai neskaičiuojami kaip bandymai)")
│ +        for w in windows:
│ +            end = w["end"] or w["last"]
│ +            tail = " (be pabaigos — galbūt dar pristabdyta)" if w["end"] is None else ""
│ +            print(f"  {w['start']:%Y-%m-%d %H:%M} → {end:%Y-%m-%d %H:%M} · {w['hours']:.1f} val. · {w['n']} paleid.{tail}")
│
│      p = data["proposals"]
│      print(f"\nPasiūlymai: {p['total']} · " + ", ".join(f"{k} {v}" for k, v in sorted(p["by_status"].items())))
│ scripts/system_report.py
│ @@ -84,7 +84,7 @@
│          return None
│
│
│ -def pause_windows(rows: list[dict], gap_hours: float = 2.0) -> list[dict]:
│ +def pause_windows(rows: list[dict]) -> list[dict]:
│      """Kiek laiko sistema buvo pristabdyta (žmogaus sprendimas dashboard'e).
│
│      Pristabdymas yra teisėtas, bet jo trukmė iki šiol nebuvo niekur matuojama:
│ @@ -92,6 +92,11 @@
│      Todėl laiką skaičiuojame iš paleidimų laiko žymų: pristabdytų paleidimų
│      atkarpa baigiasi pirmu ne pristabdytu paleidimu po jos (arba dabartimi, jei
│      sistema vis dar pristabdyta).
│ +
│ +    Atkarpa NEdalijama pagal tarpą tarp paleidimų: grafikas ir taip daro
│ +    kelių valandų pertraukas, o pauzės būsena tęsiasi iki pirmo realaus
│ +    paleidimo. 2026-11-11 pirmoji versija dalijo ties 2 val. ir vieną ~18 val.
│ +    pauzę suskaičiavo kaip 6 atkarpas / 107,7 val. (LL-83).
│      """
│      items = sorted(((_stamp(r.get("started") or ""), (r.get("status") or "").lower()) for r in rows),
│                     key=lambda x: x[0] or dt.datetime.min.replace(tzinfo=dt.timezone.utc))
│ @@ -101,12 +106,10 @@
│          if stamp is None:
│              continue
│          if status == "paused":
│ -            if cur and (stamp - cur["last"]) <= dt.timedelta(hours=gap_hours):
│ +            if cur:
│                  cur["last"] = stamp
│                  cur["n"] += 1
│              else:
│ -                if cur:
│ -                    windows.append(cur)
│                  cur = {"start": stamp, "last": stamp, "n": 1, "end": None}
│          elif cur:
│              cur["end"] = stamp
│ @@ -115,7 +118,7 @@
│      if cur:
│          windows.append(cur)
│      for w in windows:
│ -        end = w["end"] or (dt.datetime.now(tz=w["last"].tzinfo))
│ +        end = w["end"] or dt.datetime.now(tz=w["last"].tzinfo)
│          w["hours"] = round(max(0.0, (end - w["start"]).total_seconds()) / 3600, 1)
│      return windows
│
│ scripts/check_agents.py
│ @@ -151,6 +151,47 @@
│      except Exception:  # noqa: BLE001
│          pass
│
│ +    # Turinio sastings: sistemos tikslas — pamoka vaikui, ne paleidimų skaičius.
│ +    # Pauzė atrodė kaip sveika sistema (pristabdyti paleidimai skaitėsi kaip
│ +    # eiliniai), todėl 2026-11-11 turinys neaugo 34 val., o jokia patikra to
│ +    # nepasakė. Dabar tikriname du dalykus: ar sistema pristabdyta, ir ar yra
│ +    # ką kurti (eilėje yra ne sisteminis pasiūlymas), o kūrėjas vis tiek tyli.
│ +    try:
│ +        import pause as _pause
│ +        paused, until = _pause.is_paused()
│ +        if paused:
│ +            warnings.append(f"sistema pristabdyta iki {until} — agentai dirba tuščiai, turinys neauga")
│ +    except Exception:  # noqa: BLE001
│ +        pass
│ +
│ +    try:
│ +        import db as _db3
│ +        from kurejas_queue import SYSTEM_PREFIXES as _sys_p
│ +
│ +        def _takeable(rows: list[dict]) -> list[dict]:
│ +            out = []
│ +            for r in rows:
│ +                target = (r.get("target") or "").strip()
│ +                paths = [p.strip() for p in target.replace(";", ",").split(",") if p.strip()]
│ +                if paths and all(p.startswith(_sys_p) for p in paths):
│ +                    continue
│ +                out.append(r)
│ +            return out
│ +
│ +        queue = _takeable(_db3.proposals(500, status="new"))
│ +        published = [r for r in _db3.recent_runs(120)
│ +                     if r.get("role") == "kurejas" and r.get("status") == "published"]
│ +        if queue and published:
│ +            last = dt.datetime.fromisoformat(published[0].get("finished") or published[0].get("started") or "")
│ +            if last.tzinfo is None:
│ +                last = last.replace(tzinfo=dt.datetime.now().astimezone().tzinfo)
│ +            idle_h = (dt.datetime.now().astimezone() - last).total_seconds() / 3600
│ +            if idle_h > 36:
│ +                warnings.append(f"kūrėjas nepaskelbė naujo turinio {idle_h:.0f} val., o eilėje {len(queue)} pasiūlymai"
│ +                                " — turinys neauga, nors darbas yra")
│ +    except Exception:  # noqa: BLE001
│ +        pass
│ +
│      if args.json:
│          print(json.dumps({"ok": not problems, "problems": problems, "warnings": warnings,
│                            "roles": len(roles)}, ensure_ascii=False, indent=2))
│ profiles/deepseek41flash/cache/scratch/probe238_agents.py
│ @@ -0,0 +1,35 @@
│ +import sys, datetime as dt
│ +sys.path.insert(0, '/home/zoltanas/workspace/suprask/agents')
│ +sys.path.insert(0, '/home/zoltanas/workspace/suprask/scripts')
│ +
│ +import pause, db, check_agents
│ +
│ +print('=== A: pauzės zondas (is_paused → True) ===')
│ +real = pause.is_paused
│ +pause.is_paused = lambda: (True, '2026-11-12')
│ +check_agents.main()
│ +pause.is_paused = real
│ +
│ +print()
│ +print('=== B: sąstingio zondas (kūrėjo paskutinis publish prieš 40 val.) ===')
│ +real_runs = db.recent_runs
│ +
│ +def shifted(limit=100):
│ +    rows = real_runs(limit)
│ +    out = []
│ +    for r in rows:
│ +        r = dict(r)
│ +        if r.get('role') == 'kurejas' and r.get('status') == 'published':
│ +            t = dt.datetime.fromisoformat(r['finished'] or r['started']) - dt.timedelta(hours=40)
│ +            r['finished'] = t.isoformat()
│ +            r['started'] = t.isoformat()
│ +        out.append(r)
│ +    return out
│ +
│ +db.recent_runs = shifted
│ +check_agents.main()
│ +db.recent_runs = real_runs
│ +
│ +print()
│ +print('=== C: be pauzės ir be sąstingio (tikroji būsena) ===')
│ +check_agents.main()
│ scripts/check_agents.py
│ @@ -187,7 +187,8 @@
│                  last = last.replace(tzinfo=dt.datetime.now().astimezone().tzinfo)
│              idle_h = (dt.datetime.now().astimezone() - last).total_seconds() / 3600
│              if idle_h > 36:
│ -                warnings.append(f"kūrėjas nepaskelbė naujo turinio {idle_h:.0f} val., o eilėje {len(queue)} pasiūlymai"
│ +                tail = "pasiūlymas" if len(queue) == 1 else "pasiūlymai"
│ +                warnings.append(f"kūrėjas nepaskelbė naujo turinio {idle_h:.0f} val., o eilėje {len(queue)} {tail}"
│                                  " — turinys neauga, nors darbas yra")
│      except Exception:  # noqa: BLE001
│          pass
│ agents/scope.py
│ @@ -169,7 +169,7 @@
│      buvo keičiamos tik trys raidės (ė/ų/ū), todėl „gyvenimo-įgūdžiai“,
│      „pilietiškumas“ ir panašūs įrašai likdavo neatpažinti ir padengtis
│      pranešdavo „DAR NĖRA“ apie dalyką, kurio modulis jau yra (2026-11-11
│ -    Žr. LL-82).
│ +    Žr. LL-81).
│      """
│      raw = str(text).strip()
│      if not raw:
│ scripts/system_report.py
│ @@ -55,7 +55,7 @@
│          # pasakytų „sistema pristabdyta“, ir truko 0 s. Jei jis skaičiuojamas kaip
│          # paleidimas, vidutinė trukmė krenta, o „nenaudingų“ dalis išsiskiedžia —
│          # 2026-11-11 sistema buvo sustojusi ~28 val., o lentelė rodė sveikus
│ -        # skaičius ir 0 % nenaudingų (LL-83).
│ +        # skaičius ir 0 % nenaudingų (LL-82).
│          if st == "paused":
│              cell["paused"] += 1
│              continue
│ scripts/system_report.py
│ @@ -96,7 +96,7 @@
│      Atkarpa NEdalijama pagal tarpą tarp paleidimų: grafikas ir taip daro
│      kelių valandų pertraukas, o pauzės būsena tęsiasi iki pirmo realaus
│      paleidimo. 2026-11-11 pirmoji versija dalijo ties 2 val. ir vieną ~18 val.
│ -    pauzę suskaičiavo kaip 6 atkarpas / 107,7 val. (LL-83).
│ +    pauzę suskaičiavo kaip 6 atkarpas / 107,7 val. (LL-82).
│      """
│      items = sorted(((_stamp(r.get("started") or ""), (r.get("status") or "").lower()) for r in rows),
│                     key=lambda x: x[0] or dt.datetime.min.replace(tzinfo=dt.timezone.utc))
Neįvykdžiau baigties sąlygos iki galo — baigėsi įrankių limitas. Toliau — ką realiai padariau, su skaičiais, ir kas liko.

MAČIAU (system_report prieš, 2026-11-11 20:21)
- 222 paleidimai / 7 d.; nenaud. dalis: metodininkas 43 %, ideator 33 %, tikrintojas 27 %, sim-inž. 28 %, leidejas/kritikas 25 %.
- Pasiūlymai 97: 13 sisteminių laukia architekto eilėje, seniausi prieš 3 d.; #5834 blocked.
- Patikros žalios, išskyrus check_agents įspėjimą apie 9 pasiūlymus >3 d.

DVI SISTEMINĖS PRIEŽASTYS, KURIAS RADAU (ne simptomai)
1. `agents/scope.py` padengties ataskaita melavo į abi puses — ir tai yra TAS blokas, kuris įterpiamas į kiekvieno agento promptą. Išmatavau: 1 klasėje 29 minimalios temos, skriptas skelbė „padengta 2“, o realiai moduliai egzistuoja ~20 temų; „gyvenimo-įgūdžiai“ ir „pilietiškumas“ rodyti kaip DAR NĖRA, nors abiejų moduliai yra (9/9 dalykų iš tikrųjų padengti). Priežastis — lyginimas tikslios žodžio formos („garsai“ ≠ „garsas“) ir diakritikų keitimas tik trims raidėms (ė/ų/ū). Tai tiesiogiai kursto nenaudingus ideatoriaus/metodininko paleidimus: agentams sakoma „nieko nėra“ ten, kur modulis jau yra.
2. 31 val. sistemos pristabdymo buvo nematomi: `paused` paleidimai skaitėsi kaip eiliniai (0 s), todėl vidutinė trukmė krito, „nenaud.“ dalis išsiskiedė, o turinys neaugo nuo 11-10 09:24 iki dabar (kūrėjas paskutinį modulį paskelbė prieš ~35 val.). Jokia patikra to nepasakė.

ĮGYVENDINTA (failai pakeisti, dalis patikrinta)
- `agents/scope.py`: `normalise_subject()` lygina per NFD normalizaciją (diakritikai, brūkšniai) — dalykai dabar 9/9; `coverage()` — trijų būsenų (jau yra / iš dalies su modulio vardu / DAR NĖRA), kamieno prefikso matching (ne daugiau 3 raidžių trumpinimo, ≥5 raidžių), modulio id sutapimas vertinamas aukščiau už atsitiktinį žodį outcomes tekste. Išmatuota po: 6 padengtos, 15 „iš dalies“, 8 tikrai nėra.
- `agents/run.py` `scope_brief()`: rodo „iš dalies (modulis) — temos branduolio dar nėra“ ir jau yra su modulio vardu; pridėta taisyklė 2b, kad „iš dalies“ nėra padengta tema. Promptas perskaitytas realiai — tekstas teisingas.
- `scripts/system_report.py`: `paused` paleidimai nebelaikomi bandymais (atskira „prist.“ kolona, vid.m ir nenaud. skaičiuojami be jų), naujas `pause_windows()` ir blokas „Pristabdyta: 1 atkarp., 31,0 val. (11-10 12:32 → 11-11 19:33, 16 paleid.)“; `--json` gauna `runs.paused` ir `pauses`. Pirmoji versija klaidingai dalijo ties 2 val. ir suskaičiavo 107,7 val. — pataisyta ir permatuota.
- `scripts/check_agents.py`: du nauji įspėjimai — „sistema pristabdyta iki …“ ir „kūrėjas nepaskelbė naujo turinio N val., o eilėje 1 pasiūlymas“. Abu patikrinti zondais (A: pauzė → įspėjimas; B: publish pastumtas 40 val. atgal → įspėjimas; C: tikroji būsena → 1 įspėjimas, rc 0).
- `dashboard/server.py`: temos žetonai rodo tris būsenas (✓ / ~ / ○) su modulių sąrašu title.

LIKO NEPADARYTA (privalu prieš kitą paleidimą)
- NEĮrašytos pamokos LL-81 (padengtis pagal žodžio formą) ir LL-82 (pristabdymas kaip sveika statistika) į `research/wiki/guidelines/pamokos.md`, `check_lessons.py` nepaleistas.
- NEįrašyta ataskaita į `agents/log/`, NEatnaujintas `agents/state.json`, NEpapildytas `agents/system-journal.md` su „Mačiau / Keičiau / Kodėl / Patikra“ — baigties sąlygos 5 punktas neįvykdytas.
- Nepaleisti po pakeitimų: `validate_content.py`, `check_audio.py`, `check_ui.py`, `check_view.py`, `check_lessons.py`, dashboard perkrovimas ir `/api/overview` patikra. check_agents rc 0 patvirtintas, bet tai ne visa eilė.
- DB bookkeeping: #7397, #8716 (įgyvendinti praėjusiame paleidime) ir #5047 (įgyvendintas šiandien, plačiau nei siūlyta) vis dar `new` — reikia `set_proposal_status(..., "done")`, kitaip eilė juos paduos dar kartą.
- Sąmoningai neliesta: #7396 (check_view 200 %), #4921 (<360 px), #5827 (outcomes), #4808/#11235 (garso literalai), #4516 (sakinio ilgis), #4455, #5190, #5342, #5400, #11236 (turinys — kūrėjo darbas). `agents/scope.json`, turinys, sims, CSS neliesti.

## klaidos

```
session_id: local-a43be7342170413f55637437e0ad976fea01ba314489f2ca4f723669cb644cff
```
