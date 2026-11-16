# sistemos-architektas — 2026-11-16T2022

- paleidimas: #322 (manual)
- trukmė: 653s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/q1.py
│ @@ -0,0 +1,9 @@
│ +import sqlite3
│ +db = sqlite3.connect('agents/runs.db')
│ +db.row_factory = sqlite3.Row
│ +print([r[1] for r in db.execute("PRAGMA table_info(runs)")])
│ +print()
│ +for r in db.execute("select id,role,status,duration_s,started_at,error,detail from runs where status in ('failed','interrupted','infra','timeout','rejected','empty') order by id desc limit 24"):
│ +    print(r['id'], r['role'], r['status'], r['duration_s'], r['started_at'])
│ +    print('  err:', (r['error'] or '')[:200])
│ +    print('  det:', (r['detail'] or '')[:400])
│ profiles/deepseek41flash/cache/scratch/q1.py
│ @@ -1,9 +1,9 @@
│  import sqlite3
│  db = sqlite3.connect('agents/runs.db')
│  db.row_factory = sqlite3.Row
│ -print([r[1] for r in db.execute("PRAGMA table_info(runs)")])
│ -print()
│ -for r in db.execute("select id,role,status,duration_s,started_at,error,detail from runs where status in ('failed','interrupted','infra','timeout','rejected','empty') order by id desc limit 24"):
│ -    print(r['id'], r['role'], r['status'], r['duration_s'], r['started_at'])
│ -    print('  err:', (r['error'] or '')[:200])
│ -    print('  det:', (r['detail'] or '')[:400])
│ +for r in db.execute("select id,role,status,duration_s,started,exit_code,summary,note,detail from runs where status in ('failed','interrupted','infra','timeout','rejected','empty') order by id desc limit 24"):
│ +    print(r['id'], r['role'], r['status'], r['duration_s'], r['started'], 'exit', r['exit_code'])
│ +    for k in ('summary', 'note', 'detail'):
│ +        v = (r[k] or '').replace('\n', ' | ')
│ +        if v:
│ +            print('   %s: %s' % (k, v[:350]))
│ profiles/deepseek41flash/cache/scratch/q2.py
│ @@ -0,0 +1,22 @@
│ +import sqlite3, textwrap
│ +db = sqlite3.connect('agents/runs.db')
│ +db.row_factory = sqlite3.Row
│ +print([r[1] for r in db.execute("PRAGMA table_info(proposals)")])
│ +print()
│ +
│ +def show(where, params=(), limit=12):
│ +    q = ("select id,role,type,priority,status,target,title,body,note,created "
│ +         "from proposals where " + where + " order by id limit " + str(limit))
│ +    for r in db.execute(q, params):
│ +        print('---', r['id'], r['role'], r['type'], r['priority'], r['status'], r['created'])
│ +        print('  title:', r['title'])
│ +        print('  target:', r['target'])
│ +        print('  body:', textwrap.shorten((r['body'] or '').replace('\n', ' '), 600))
│ +        if r['note']:
│ +            print('  note:', (r['note'] or '')[:300])
│ +
│ +print('=== BLOCKED ===')
│ +show("status='blocked'")
│ +print()
│ +print('=== NEW, systemic targets ===')
│ +show("status='new' and (target like 'agents/%' or target like 'scripts/%' or target like 'deploy/%' or target like 'dashboard/%' or target like 'research/%' or target like 'docs/%')")
│ profiles/deepseek41flash/cache/scratch/measure322.py
│ @@ -0,0 +1,32 @@
│ +"""Matavimai prieš sistemos-architekto pakeitimus (#322)."""
│ +import json, pathlib, re, sys
│ +sys.path.insert(0, 'scripts')
│ +import generate_audio
│ +from check_audio import referenced, on_disk, AUDIO
│ +
│ +manifest = json.loads((AUDIO / 'manifest.json').read_text(encoding='utf-8'))
│ +refs = referenced(manifest)
│ +disk = on_disk()
│ +dangling = sorted(refs - disk)
│ +print('manifest rasai (refs):', len(refs))
│ +print('diske mp3:', len(disk))
│ +print('refs - disk (nurodyti, bet failo nera):', len(dangling))
│ +for d in dangling[:10]:
│ +    print('   ', d)
│ +print('disk - refs (naslaiciai):', len(disk - refs))
│ +print('tekstai snd kalbami:', len(generate_audio.collect()))
│ +
│ +# kiek manifeste irasu, kuriu tekstas nebekalbamas
│ +texts = set(generate_audio.collect())
│ +stale = [t for t in manifest if t not in texts]
│ +print('manifeste tekstu, kuriu niekas nebekalba:', len(stale))
│ +
│ +# agentu logai: kiek paleidimu paliko ir agento, ir begiklio ataskaita
│ +logs = sorted(pathlib.Path('agents/log').glob('*.md'))
│ +print()
│ +print('logu is viso:', len(logs))
│ +pat = re.compile(r'(LIKO NE(?:Į|I)RAŠYTA|LIKO NEATLIKTA|Nespėjau įrašyti|Neįrašyti pasiūlymai)')
│ +hits = [p for p in logs if pat.search(p.read_text(encoding='utf-8', errors='replace'))]
│ +print('logu su "nebaigta / liko neįrašyta" fraze:', len(hits))
│ +for p in hits[-10:]:
│ +    print('   ', p.name)
│ scripts/check_audio.py
│ @@ -6,17 +6,25 @@
│  versijose, skaitydavo svetimos kalbos balsu). Todėl trūkstamas įrašas yra
│  klaida, o ne įspėjimas.
│
│ -Patikra ėjo tik viena kryptimi: manifestas → diskas. Atvirkštinė kryptis
│ +Patikra ilgai ėjo tik viena kryptimi: manifestas → diskas. Atvirkštinė kryptis
│  (diskas → manifestas) nebuvo tikrinama, todėl diske ir git istorijoje likę
│ -įrašai, kurių niekas nebegroja, buvo nematomi, o žinutė „Garsas pilnas“
│ -skambėjo taip, lyg būtų panaudotas kiekvienas failas. Šiandien (2026-11-09):
│ +įrašai, kurių niekas nebegroja, buvo nematomi, o žinutė „Garsas pilnas“ skambėjo
│ +taip, lyg būtų panaudotas kiekvienas failas. Šiandien (2026-11-09):
│  500 tekstų = 1000 įrašų, diske 1014 mp3, t. y. 14 našlaičių. Našlaitis nėra
│  klaida (vaikui nieko netrūksta ir CI neturi kristi dėl istorijos), bet skaičius
│  turi būti pasakytas teisingai, o failus turi būti galima pašalinti sąmoningai.
│
│ +2026-11-16 (#316, LL-100) paaiškėjo, kad trūko ir TREČIOS patikros: manifestas
│ +gali nurodyti įrašą, kurio failo nėra — jei to teksto šiandien niekas nekalba,
│ +jis nepateko nė į vieną aibę (`missing` eina per kalbamus tekstus, `orphans` —
│ +per diską). Tada įrankis rašė „naudojama 1140 iš 1138 mp3“ ir grąžino nulį, o
│ +`check_published.py` tą pačią dieną buvo raudonas dėl tų pačių failų. Todėl
│ +dabar `refs - disk` yra KLAIDA, o skaičius „naudojama“ skaičiuoja tik tuos
│ +įrašus, kurių failas tikrai yra.
│ +
│  Naudojimas:
│      python3 scripts/check_audio.py            # tikrina, grąžina 1 jei trūksta
│ -    python3 scripts/check_audio.py --list      # išvardija trūkstamus ir našlaičius
│ +    python3 scripts/check_audio.py --list      # išvardija trūkstamus, be failo ir našlaičius
│      python3 scripts/check_audio.py --json      # dashboard'ui / būsenos generatoriui
│      python3 scripts/check_audio.py --prune     # šalina manifeste neminimus mp3
│  """
│ scripts/check_audio.py
│ @@ -108,14 +108,24 @@
│                      wrong_engine.append(f"{text} [{variant}] → {out} Hz")
│
│      orphans = sorted(disk - refs)
│ +    # Trečia kryptis: manifestas → diskas, bet nepriklausomai nuo to, ar tekstas
│ +    # šiandien kalbamas. `missing` ciklas to nepagama: jis eina per
│ +    # generate_audio.collect(), tad įrašas, kurio tekstas nebekalbamas ir kurio
│ +    # failo nėra, anksčiau nepatekdavo nė į vieną aibę (LL-100, #20119).
│ +    dangling = sorted(refs - disk)
│ +    # „naudojama“ — tik tie manifestą nurodantys įrašai, kurie tikrai yra diske;
│ +    # kitaip skaičius gali viršyti mp3 skaičių („1140 iš 1138“, #316).
│ +    used = len(refs & disk)
│
│      return {
│ -        "ok": not missing and not wrong_engine,
│ +        "ok": not missing and not wrong_engine and not dangling,
│          "texts": len(texts),
│          "literals": len(literals),
│          "referenced": len(refs),
│ +        "used": used,
│          "on_disk": len(disk),
│          "orphans": orphans,
│ +        "dangling": dangling,
│          "missing": missing,
│          "wrong_engine": wrong_engine,
│      }
│ scripts/check_audio.py
│ @@ -158,23 +158,41 @@
│          print(json.dumps(data, ensure_ascii=False))
│          return 0 if data["ok"] else 1
│
│ -    if data["missing"] or data["wrong_engine"]:
│ +    if data["missing"] or data["wrong_engine"] or data["dangling"]:
│          if data["missing"]:
│              print(f"KLAIDA: {len(data['missing'])} tekstų be garso įrašo:")
│              for m in data["missing"][:40]:
│                  print("  -", m)
│ +        if data["dangling"]:
│ +            # Manifestas žada failą, kurio nėra. Vaikas šiandien gal ir negirdi
│ +            # nieko blogo (tekstas nekalbamas), bet manifestas meluoja, o grąžinus
│ +            # tą patį tekstą į modulį vaikas išgirstų tylą (LL-100).
│ +            print(f"KLAIDA: {len(data['dangling'])} manifesto įrašų nurodo failą, "
│ +                  f"kurio nėra diske (refs − disk):")
│ +            for d in (data["dangling"] if args.list else data["dangling"][:20]):
│ +                print("  -", d)
│ +            if not args.list and len(data["dangling"]) > 20:
│ +                print(f"  … ir dar {len(data['dangling']) - 20} (--list išvardija visus)")
│ +            print(f"  Manifestas: {data['referenced']} įrašų, diske: {data['on_disk']} mp3.")
│          if data["wrong_engine"]:
│              print(f"KLAIDA: {len(data['wrong_engine'])} įrašų ne iš Piper balso (laukta 22 050 Hz):")
│              for m in data["wrong_engine"][:20]:
│                  print("  -", m)
│          print("\nSugeneruok iš naujo: .venv/bin/python scripts/generate_audio.py --all")
│ +        if data["dangling"]:
│ +            print("Jei tekstas iš tikrųjų nebekalbamas — pašalink jo įrašą iš "
│ +                  "assets/audio/lt/manifest.json (failo neatkūrus).")
│          return 1
│
│ -    used = data["referenced"]
│ +    used = data["used"]
│      total = data["on_disk"]
│      print(f"✔ Garsas pilnas: {data['texts']} tekstų (iš jų {data['literals']} — tiesioginės "
│            f"api.speak eilutės simuliacijų kode), {used} įrašų, visi iš Piper balso, "
│            f"naudojama {used} iš {total} mp3.")
│ +    # Abi aibės lygios — tada teiginys „naudojama visi“ yra teisingas, o ne
│ +    # apvalintas (LL-100: manifestas tikrinamas abiem kryptimis).
│ +    if used != data["referenced"]:
│ +        print(f"  (manifeste {data['referenced']} nuorodų, iš jų {used} turi failą)")
│
│      if data["orphans"]:
│          print(f"ĮSPĖJIMAS: {len(data['orphans'])} našlaičių — failai, kurių manifestas nebemini "
│ profiles/deepseek41flash/cache/scratch/probe322_audio.py
│ @@ -0,0 +1,63 @@
│ +"""Neigiamas zondas #322: ar check_audio.py dabar mato 'refs - disk' (LL-100 / #20119).
│ +
│ +Bazinis atvejis — tikras manifestas ir tikras diskas.
│ +Neigiamas atvejis — veidrodis su vienu papildomu manifesto įrašu, kurio failų
│ +nėra ir kurio teksto šiandien niekas nekalba (t. y. `collect()` jo neturi).
│ +Originalai nepaliečiami: veidrodis — kietosios nuorodos.
│ +"""
│ +import json, pathlib, shutil, sys
│ +
│ +ROOT = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +sys.path.insert(0, str(ROOT / 'scripts'))
│ +MIRROR = pathlib.Path('/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/mirror322')
│ +
│ +import check_audio
│ +
│ +real_audio = check_audio.AUDIO
│ +if MIRROR.exists():
│ +    shutil.rmtree(MIRROR)
│ +MIRROR.mkdir(parents=True)
│ +for variant in ('n', 's'):
│ +    src = real_audio / variant
│ +    (MIRROR / variant).mkdir()
│ +    for p in src.glob('*.mp3'):
│ +        (MIRROR / variant / p.name).hardlink_to(p)
│ +shutil.copy2(real_audio / 'manifest.json', MIRROR / 'manifest.json')
│ +
│ +manifest = json.loads((MIRROR / 'manifest.json').read_text(encoding='utf-8'))
│ +manifest['zondas322 nekalbamas tekstas'] = {'n': 'n/zondas322.mp3', 's': 's/zondas322.mp3'}
│ +(MIRROR / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding='utf-8')
│ +
│ +results = {}
│ +
│ +# 1) bazinis — tikras repo katalogas
│ +check_audio.AUDIO = real_audio
│ +base = check_audio.check(probe_engine=False)
│ +results['base'] = dict(ok=base['ok'], referenced=base['referenced'], used=base['used'],
│ +                       on_disk=base['on_disk'], dangling=len(base['dangling']),
│ +                       orphans=len(base['orphans']))
│ +sys.argv = ['check_audio.py']
│ +rc_base = check_audio.main()
│ +results['base_rc'] = rc_base
│ +
│ +# 2) neigiamas — veidrodis su įrašu be failo
│ +check_audio.AUDIO = MIRROR
│ +bad = check_audio.check(probe_engine=False)
│ +results['mutated'] = dict(ok=bad['ok'], referenced=bad['referenced'], used=bad['used'],
│ +                          on_disk=bad['on_disk'], dangling=bad['dangling'],
│ +                          missing=len(bad['missing']), orphans=len(bad['orphans']))
│ +sys.argv = ['check_audio.py']
│ +rc_bad = check_audio.main()
│ +results['mutated_rc'] = rc_bad
│ +
│ +# 3) atstatyta — vėl tikras manifestas
│ +shutil.copy2(real_audio / 'manifest.json', MIRROR / 'manifest.json')
│ +check_audio.AUDIO = MIRROR
│ +back = check_audio.check(probe_engine=False)
│ +results['restored'] = dict(ok=back['ok'], dangling=len(back['dangling']))
│ +sys.argv = ['check_audio.py']
│ +results['restored_rc'] = check_audio.main()
│ +
│ +print()
│ +for k, v in results.items():
│ +    print(k, '=', v)
│ agents/run.py
│ @@ -1204,22 +1204,62 @@
│
│
│  def summary_line(text: str, limit: int = 90) -> str:
│ -    """Pirmoji prasminga atsakymo eilutė — commit'o žinutei.
│ +    """Pirmoji prasminga atsakymo eilutė — žinutės KŪNUI, ne antraštei.
│
│      Hermes TUI rašo į stdout ir rėmelį, ir įrankių išklotines, todėl anksčiau
│      commit'o žinutė būdavo „│ assets/js/app.js“, o git istorija — neįskaitoma:
│      pagal ją neįmanoma pasakyti, ką paleidimas pakeitė. Imame pirmą eilutę,
│      kuri turi bent tris žodžius ir nėra išklotinės fragmentas.
│ +
│ +    2026-11-16 paaiškėjo, kad šio filtro nepakanka antraštei: „import json,
│ +    glob, os“ ir „\"\"\"#319 zondas A …“ yra trys žodžiai be išklotinės ženklų,
│ +    tad patekdavo į `git log` (LL-47, #5190). Todėl antraštė imama iš pakeistų
│ +    failų (`commit_subject`), o šis tekstas lieka kūne kaip agento teiginys.
│      """
│      for line in (text or "").splitlines():
│          clean = BOX_RE.sub("", ANSI_RE.sub("", line)).strip()
│ -        clean = clean.lstrip("#>*-+ ").strip()
│ +        clean = clean.lstrip("#>*-+ \").strip()
│          if len(clean) < 12 or len(clean.split()) < 3:
│              continue
│          if NOISE_RE.search(line) or NOISE_RE.search(clean):
│              continue
│          return clean[:limit]
│      return ""
│ +
│ +
│ +def commit_subject(role: str, run_id: int, work: list[str], limit: int = 100) -> str:
│ +    """Commit'o antraštė iš TIKRAI pakeistų failų.
│ +
│ +    Failų sąrašas yra vienintelis dalykas, apie kurį `git` žino, kad pasikeitė;
│ +    modelio pirmoji eilutė gali būti kodo fragmentas arba šaltinio citata
│ +    (`[ideator] #312: sources/pradinio-bp-rekomendacijos-2024.txt:35165–35166`).
│ +    Antraštė turi atsakyti į „kas pasikeitė“, o „kodėl“ lieka kūne.
│ +    """
│ +    if not work:
│ +        return f"[{role}] #{run_id}"
│ +    core = work[0] if len(work) == 1 else f"{len(work)} failai — " + ", ".join(work)
│ +    subject = f"[{role}] #{run_id}: {core}"
│ +    if len(subject) > limit:
│ +        subject = subject[: limit - 1].rstrip(" ,—-") + "…"
│ +    return subject
│ +
│ +
│ +def commit_message(role: str, run_id: int, files: list[str], summary: str,
│ +                   notes: list[str] | None = None) -> str:
│ +    """Pilna commit'o žinutė: antraštė iš failų, kūne — kas ir kodėl."""
│ +    work = [f for f in files if not f.startswith(LOG_PREFIX)] or files
│ +    listed = ", ".join(files[:12]) + (" …" if len(files) > 12 else "")
│ +    claim = summary_line(summary)
│ +    msg = (f"{commit_subject(role, run_id, work)}\n\n"
│ +           f"Kas: {len(files)} failų — {listed}\n")
│ +    if claim:
│ +        msg += f"Kodėl (agento teiginys, nepatikrintas): {claim}\n"
│ +    msg += "Paskelbta automatiškai po validacijos."
│ +    if notes:
│ +        # Autorystės pastaba – commit'o žinutėje, nes `git log` yra vienintelis
│ +        # audito pėdsakas, kuris išlieka po to, kai `detail` pasensta (LL-49).
│ +        msg += "\n\n" + "\n".join(f"- {n}" for n in notes)
│ +    return msg
│
│
│  def publish(role: str, run_id: int, files: list[str], summary: str, allow_revert: bool = True,
│ agents/run.py
│ @@ -1218,7 +1218,7 @@
│      """
│      for line in (text or "").splitlines():
│          clean = BOX_RE.sub("", ANSI_RE.sub("", line)).strip()
│ -        clean = clean.lstrip("#>*-+ \").strip()
│ +        clean = clean.lstrip("#>*-+ ").strip()
│          if len(clean) < 12 or len(clean.split()) < 3:
│              continue
│          if NOISE_RE.search(line) or NOISE_RE.search(clean):
│ agents/run.py
│ @@ -1326,12 +1326,9 @@
│      branch = f"agent/{role}-{dt.date.today().isoformat()}"
│      git("checkout", "-B", branch)
│
│ -    first_line = summary_line(summary) or role
│ -    msg = f"[{role}] #{run_id}: {first_line}\n\nPaskelbta automatiškai po validacijos."
│ -    if notes:
│ -        # Autorystės pastaba – commit'o žinutėje, nes `git log` yra vienintelis
│ -        # audito pėdsakas, kuris išlieka po to, kai `detail` pasensta (LL-49).
│ -        msg += "\n\n" + "\n".join(f"- {n}" for n in notes)
│ +    # Antraštė — iš pakeistų failų, ne iš modelio pirmos eilutės. Modelio
│ +    # teiginys lieka kūne kaip „kodėl (nepatikrintas)“ (LL-47, #5190).
│ +    msg = commit_message(role, run_id, files, summary, notes)
│
│      # Komituojame TIK šio paleidimo failus: `git add -A` kartą įtraukė ir
│      # žmogaus nebaigtus pakeitimus į agento commit'ą. Ištrinti failai irgi yra
│ agents/run.py
│ @@ -261,7 +261,11 @@
│  2. Perskaityk savo vaidmens failą (įtrauktas žemiau), agents/state.json ir agents/proposals/.
│  3. Dirbk TIK savo vaidmens ribose. Nekeisk kitų vaidmenų failų, nekeisk AGENTS.md.
│  4. NENAUDOK mokamų paslaugų, CDN, išorinių API. Niekur nerašyk asmens duomenų.
│ -5. Baigęs įrašyk ataskaitą į agents/log/ ir atnaujink agents/state.json.
│ +5. Tavo rezultatas — FAILAS repo, ne ataskaita. Paleidimo ataskaitą į `agents/log/` ir
│ +   `agents/state.json` eilutę `roles.<vaidmuo>` rašo bėgiklis, todėl tau jų rašyti nereikia
│ +   (vaidmens faile prašomi kiti `state.json` blokai — tavo). Jei baigiasi žingsniai ar kvota,
│ +   PIRMIAU įrašyk savo darbo failą (pasiūlymą, modulį, taisymą, changelog įrašą), o ne ataskaitą:
│ +   paleidimas, kuriame pakeista tik ataskaita, laikomas tuščiu ir jo rezultatas neskelbiamas.
│
│  PROJEKTO KATALOGAS: {root}
│  ŠIANDIEN: {today}
│ profiles/deepseek41flash/cache/scratch/q3.py
│ @@ -0,0 +1,6 @@
│ +import sqlite3
│ +db = sqlite3.connect('agents/runs.db')
│ +db.row_factory = sqlite3.Row
│ +for rid in (281, 282, 283):
│ +    r = db.execute('select id,role,status,duration_s,artifacts,exit_code,log_path from runs where id=?', (rid,)).fetchone()
│ +    print(dict(r))
│ scripts/queue_repair.py
│ @@ -0,0 +1,140 @@
│ +#!/usr/bin/env python3
│ +"""Grąžina į eilę pasiūlymus, kuriuos užblokavo infrastruktūros gedimas.
│ +
│ +Kodėl tai reikalinga: 2026-11-14 trys kūrėjo paleidimai (#281–#283) truko po
│ +5 s. Modelio vartai atsakė „runtime_draining“ / „update_paused“, modelis
│ +užduoties net negavo, bet kiekvienas paleidimas „paskelbė“ savo paties žurnalą
│ +(1 failas), todėl eilė jį palaikė įrodymu ir užblokavo tris pasiūlymus
│ +(#14726, #15045, #15581). Nuo tada bėgiklis tokią klaidą vadina `infra`
│ +(`agents/run.py`, INFRA_MARKERS) ir pasiūlymą grąžina į eilę, BET jau
│ +užblokuoti įrašai liko „kapinėse“: `blocked` eilė nebeliečia, o `--retry-blocked`
│ +yra rankinis veiksmas, kurio niekas nekviečia.
│ +
│ +Todėl šis įrankis tikrina ne būseną, o PRIEŽASTĮ — tris sąlygas kartu:
│ +
│ +1. pasiūlymo `note` rodo konkretų paleidimą („paleidimas nepavyko: <vaidmuo> #N“);
│ +2. tas paleidimas truko ≤ `SHORT_RUN` sekundžių ir baigėsi klaida;
│ +3. jo darbo failai buvo tik `agents/log/` ataskaita, o išvestyje yra
│ +   infrastruktūros žymė (INFRA_MARKERS iš `agents/run.py`).
│ +
│ +Tik tada pasiūlymas grąžinamas į `new` tuo pačiu keliu, kuriuo grąžina bėgiklis
│ +(`reopen_after_infra`), kad bandymų skaitiklis liktų vienas.
│ +
│ +Naudojimas:
│ +    python3 scripts/queue_repair.py             # sausa bėga: ką pakeistų
│ +    python3 scripts/queue_repair.py --apply     # įrašo pakeitimus
│ +    python3 scripts/queue_repair.py --json      # mašininė išvestis
│ +"""
│ +
│ +from __future__ import annotations
│ +
│ +import argparse
│ +import json
│ +import re
│ +import sys
│ +from pathlib import Path
│ +
│ +ROOT = Path(__file__).resolve().parent.parent
│ +sys.path.insert(0, str(ROOT / "agents"))
│ +
│ +import db  # noqa: E402
│ +import run as runner  # noqa: E402  (INFRA_MARKERS, reopen_after_infra, LOG_PREFIX)
│ +
│ +# Paleidimas, trumpesnis už šitiek sekundžių, negalėjo atlikti turinio darbo.
│ +# Ilgiausias žinomas infra gedimas — 5 s (#281–#283); 90 s palieka rezervą
│ +# lėtam tinklui, bet neatleidžia nė vieno realaus bandymo (trumpiausias turinio
│ +# darbas istorijoje — 167 s).
│ +SHORT_RUN = 90
│ +
│ +NOTE_RE = re.compile(r"paleidimas nepavyko:\s*[\w-]+\s*#(\d+)")
│ +
│ +
│ +def run_row(run_id: int) -> dict | None:
│ +    con = db.connect()
│ +    con.row_factory = db.sqlite3.Row
│ +    row = con.execute(
│ +        "select id, role, status, duration_s, exit_code, artifacts, summary, "
│ +        "detail, log_path from runs where id = ?", (run_id,)
│ +    ).fetchone()
│ +    con.close()
│ +    return dict(row) if row else None
│ +
│ +
│ +def work_artifacts(row: dict) -> list[str]:
│ +    try:
│ +        files = json.loads(row.get("artifacts") or "[]")
│ +    except json.JSONDecodeError:
│ +        return ["<artifacts nesuprantamas>"]
│ +    return [f for f in files if not str(f).startswith(runner.LOG_PREFIX)]
│ +
│ +
│ +def diagnose(prop: dict) -> dict:
│ +    """Ar pasiūlymo blokavimas įvyko dėl infrastruktūros, o ne dėl turinio."""
│ +    note = prop.get("note") or ""
│ +    found = NOTE_RE.search(note)
│ +    if not found:
│ +        return {"repair": False, "why": "blokavimo priežastis nenurodo paleidimo"}
│ +    run_id = int(found.group(1))
│ +    row = run_row(run_id)
│ … omitted 62 diff line(s) across 1 additional file(s)/section(s)
│ scripts/queue_repair.py
│ @@ -31,6 +31,7 @@
│  import argparse
│  import json
│  import re
│ +import sqlite3
│  import sys
│  from pathlib import Path
│
│ scripts/queue_repair.py
│ @@ -52,7 +52,7 @@
│
│  def run_row(run_id: int) -> dict | None:
│      con = db.connect()
│ -    con.row_factory = db.sqlite3.Row
│ +    con.row_factory = sqlite3.Row
│      row = con.execute(
│          "select id, role, status, duration_s, exit_code, artifacts, summary, "
│          "detail, log_path from runs where id = ?", (run_id,)
│ profiles/deepseek41flash/cache/scratch/q4.py
│ @@ -0,0 +1,7 @@
│ +import sqlite3, pathlib
│ +db = sqlite3.connect('agents/runs.db')
│ +db.row_factory = sqlite3.Row
│ +for pid in (14726, 15045, 15581):
│ +    r = db.execute('select id,file,status,note from proposals where id=?', (pid,)).fetchone()
│ +    p = pathlib.Path(r['file']) if r['file'] else None
│ +    print(pid, r['status'], r['file'], 'exists' if p and p.exists() else 'MISSING', '|', (r['note'] or '')[:120])
│ profiles/deepseek41flash/cache/scratch/probe322_commit.py
│ @@ -0,0 +1,46 @@
│ +"""Zondas #322: ar commit'o antraštė imama iš failų, o ne iš modelio teksto (LL-47/#5190)."""
│ +import sys
│ +sys.path.insert(0, '/home/zoltanas/workspace/suprask/agents')
│ +import run as runner
│ +
│ +cases = [
│ +    ("#318 (tikra: 'import json, glob, os')",
│ +     'import json, glob, os\nsource = "content/lt"\n',
│ +     ['scripts/check_audio.py', 'agents/log/programos-derintojas-2026-11-16T1503.md']),
│ +    ("#321 (tikra: '\"\"\"#321 zondas…')",
│ +     '"""#321 zondas: ar trys svarbiausi publish vartų signalai tikrai įsižiebia.\nimport os\n',
│ +     ['scripts/check_published.py', 'agents/proposals/2026-11-16-x.json',
│ +      'agents/log/publikavimo-agentas-2026-11-16T1930.md']),
│ +    ("#312 (tikra: 'sources/…:35165–35166')",
│ +     'sources/pradinio-bp-rekomendacijos-2024.txt:35165–35166 („26.2.3. Augalai.\n',
│ +     ['agents/proposals/2026-11-16-ideator-augalu-grupes.json']),
│ +    ("daug failų (riba)",
│ +     'Sutvarkiau audio vartus.\n',
│ +     [f'content/lt/grade-01/matematika/{i:02d}-modulis.json' for i in range(1, 16)]),
│ +    ("tuščias modelio tekstas",
│ +     '',
│ +     ['scripts/queue_repair.py']),
│ +]
│ +
│ +bad = 0
│ +for name, summary, files in cases:
│ +    msg = runner.commit_message('sistemininkas', 322, files, summary)
│ +    subject = msg.splitlines()[0]
│ +    print('---', name)
│ +    print(subject)
│ +    print(msg.replace('\n', ' | ')[:300])
│ +    if len(subject) > 100:
│ +        print('  !! antraštė ilgesnė nei 100 simbolių'); bad += 1
│ +    first = subject.split(': ', 1)[1]
│ +    for token in ('import ', '"""', 'sources/', 'profile'):
│ +        if first.startswith(token):
│ +            print(f'  !! antraštė prasideda kodo fragmentu: {first[:40]}'); bad += 1
│ +    if not any(f in subject for f in (files[0].split('/')[-1],)):
│ +        print('  !! antraštė neįvardija nė vieno pakeisto failo'); bad += 1
│ +
│ +# Ar modelio teiginys vis dar patenka į kūną (audito pėdsakas neprapuola)
│ +msg = runner.commit_message('kurejas', 322, ['scripts/check_audio.py'], 'Patikrinau garsą abiem kryptimis.')
│ +print()
│ +print('kūnas turi teiginį:', 'Patikrinau garsą abiem kryptimis.' in msg)
│ +print('kūnas turi failų skaičių:', 'Kas: 1 failų' in msg)
│ +print('blogų atvejų:', bad)
│ profiles/deepseek41flash/cache/scratch/close322.py
│ @@ -0,0 +1,17 @@
│ +import sys
│ +sys.path.insert(0, '/home/zoltanas/workspace/suprask/agents')
│ +import db
│ +
│ +db.init()
│ +db.set_proposal_status(
│ +    20119, 'done',
│ +    'įgyvendinta #322: scripts/check_audio.py tikrina refs-disk (dangling) ir skaičiuoja used = refs∩disk; '
│ +    'zondas: bazinis rc 0 (1138/1138), veidrodis su įrašu be failo → rc 1 „2 manifesto įrašų nurodo failą, kurio nėra“, '
│ +    'atstačius → rc 0')
│ +db.set_proposal_status(
│ +    5190, 'done',
│ +    'įgyvendinta #322: agents/run.py commit_message() — antraštė iš pakeistų failų (commit_subject), modelio pirmoji eilutė '
│ +    'lieka kūne kaip „Kodėl (agento teiginys, nepatikrintas)“; zondas 5 atvejai, 0 blogų')
│ +for pid in (20119, 5190):
│ +    row = next(r for r in db.proposals(500) if int(r['id']) == pid)
│ +    print(pid, row['status'], '|', (row['note'] or '')[:100])
│ research/wiki/guidelines/pamokos.md
│ @@ -345,7 +345,8 @@
│  - **Simptomas:** paleidimas #129 paskelbė `[sistema]` taisymą (#4998) commit'u cdc5d6b, kurio žinutė — „[kurejas] #129: [goal local-47c24163660c5c] │ profiles/deepseek41flash/cache/scratch/probe_4998.py“. Commite 6 failai (`agents/run.py | 103 +-`, `.gitignore`, `pamokos.md`, ataskaita, pasiūlymas, kito paleidimo ataskaita), bet žinutė įvardija failą, kurio repo neturi ir kurio niekas nepaskelbė — pagal `git log` neįmanoma pasakyti, kas ir kodėl pakeista.
│  - **Priežastis:** `summary_line()` (`agents/run.py:743–759`) ima **pirmą modelio atsakymo eilutę** su bent trimis žodžiais, kuri nepanaši į įrankio išklotinę. Ji neturi jokio ryšio su `files` sąrašu, kurį bėgiklis ką tik pats sudarė: agento atsakymas prasideda tuo, apie ką jis kalbėjo pirmiausia (mano atveju — zondo kelias scratch kataloge), o ne tuo, ką jis pakeitė. Tai LL-45 „kas ir kodėl“ reikalavimo antra pusė: `[sistema]` žinutė sutvarkyta, o agento žinutė vis dar renkama iš teksto, kuris nėra apie pakeitimą.
│  - **Taisyklė:** commit'o žinutės pagrindas imamas iš to, ką bėgiklis **žino** (pakeisti failai, pasiūlymo numeris ir pavadinimas, tikslo failas), o modelio tekstas gali būti tik papildoma eilutė. Jei eilutė įvardija kelią, kurio nėra nei `files` sąraše, nei repo (scratch, `~/.hermes`, absoliutus kelias), ji žinutei netinka. Žinutė, kuri neįvardija nė vieno pakeisto failo, yra tokia pat tyli kaip `[:40]` riba (LL-37): rezultatas žalias, audito pėdsako nėra.
│ -- **Patikra:** tas pats atsakymo tekstas per `summary_line()` neturi grąžinti eilutės su `profiles/…/scratch/`, `~` ar `/home/`; žinutėje turi būti bent vienas kelias iš `files` arba pasiūlymo numeris. Konkretus įrodymas šiandien: `git log -1 --format=%s cdc5d6b` → žinutė su scratch keliu, o `git show --name-only cdc5d6b` → 6 repo failai, tarp jų `agents/run.py`.
│ +- **Patikra:** tas pats atsakymo tekstas per `summary_line()` neturi grąžinti eilutės su `profiles/…/scratch/`, `~` ar `/home/`; žinutėje turi būti bent vienas kelias iš `files` arba pasiūlymo numeris. Konkrečius įrodymas šiandien: `git log -1 --format=%s cdc5d6b` → žinutė su scratch keliu, o `git show --name-only cdc5d6b` → 6 repo failai, tarp jų `agents/run.py`.
│ +- **Įgyvendinta 2026-11-16 (#322, #5190):** antraštė nebėra modelio tekstas — `agents/run.py` `commit_subject()` ima pakeistų failų sąrašą (`[role] #N: <failas>` arba `<n> failai — f1, f2`), o `commit_message()` modelio pirmą eilutę įrašo kūne kaip „Kodėl (agento teiginys, nepatikrintas)“. Zondas `scratch/probe322_commit.py` su trimis tikromis sugadintomis žinutėmis (`import json, glob, os`, `"""#321 zondas…`, `sources/…:35165–35166`) ir dviem kraštiniais atvejais (15 failų, tuščias tekstas): antraštė visada iki 100 simbolių, prasideda failu, 0 kodo fragmentų.`
│
│
│  ## LL-48 — Sąlyga, kurios modelis neįvykdys: „pataisyk vieną komandą“ be nė vieno taisymo
│ research/wiki/guidelines/pamokos.md
│ @@ -345,8 +345,8 @@
│  - **Simptomas:** paleidimas #129 paskelbė `[sistema]` taisymą (#4998) commit'u cdc5d6b, kurio žinutė — „[kurejas] #129: [goal local-47c24163660c5c] │ profiles/deepseek41flash/cache/scratch/probe_4998.py“. Commite 6 failai (`agents/run.py | 103 +-`, `.gitignore`, `pamokos.md`, ataskaita, pasiūlymas, kito paleidimo ataskaita), bet žinutė įvardija failą, kurio repo neturi ir kurio niekas nepaskelbė — pagal `git log` neįmanoma pasakyti, kas ir kodėl pakeista.
│  - **Priežastis:** `summary_line()` (`agents/run.py:743–759`) ima **pirmą modelio atsakymo eilutę** su bent trimis žodžiais, kuri nepanaši į įrankio išklotinę. Ji neturi jokio ryšio su `files` sąrašu, kurį bėgiklis ką tik pats sudarė: agento atsakymas prasideda tuo, apie ką jis kalbėjo pirmiausia (mano atveju — zondo kelias scratch kataloge), o ne tuo, ką jis pakeitė. Tai LL-45 „kas ir kodėl“ reikalavimo antra pusė: `[sistema]` žinutė sutvarkyta, o agento žinutė vis dar renkama iš teksto, kuris nėra apie pakeitimą.
│  - **Taisyklė:** commit'o žinutės pagrindas imamas iš to, ką bėgiklis **žino** (pakeisti failai, pasiūlymo numeris ir pavadinimas, tikslo failas), o modelio tekstas gali būti tik papildoma eilutė. Jei eilutė įvardija kelią, kurio nėra nei `files` sąraše, nei repo (scratch, `~/.hermes`, absoliutus kelias), ji žinutei netinka. Žinutė, kuri neįvardija nė vieno pakeisto failo, yra tokia pat tyli kaip `[:40]` riba (LL-37): rezultatas žalias, audito pėdsako nėra.
│ -- **Patikra:** tas pats atsakymo tekstas per `summary_line()` neturi grąžinti eilutės su `profiles/…/scratch/`, `~` ar `/home/`; žinutėje turi būti bent vienas kelias iš `files` arba pasiūlymo numeris. Konkrečius įrodymas šiandien: `git log -1 --format=%s cdc5d6b` → žinutė su scratch keliu, o `git show --name-only cdc5d6b` → 6 repo failai, tarp jų `agents/run.py`.
│ -- **Įgyvendinta 2026-11-16 (#322, #5190):** antraštė nebėra modelio tekstas — `agents/run.py` `commit_subject()` ima pakeistų failų sąrašą (`[role] #N: <failas>` arba `<n> failai — f1, f2`), o `commit_message()` modelio pirmą eilutę įrašo kūne kaip „Kodėl (agento teiginys, nepatikrintas)“. Zondas `scratch/probe322_commit.py` su trimis tikromis sugadintomis žinutėmis (`import json, glob, os`, `"""#321 zondas…`, `sources/…:35165–35166`) ir dviem kraštiniais atvejais (15 failų, tuščias tekstas): antraštė visada iki 100 simbolių, prasideda failu, 0 kodo fragmentų.`
│ +- **Patikra:** tas pats atsakymo tekstas per `summary_line()` neturi grąžinti eilutės su `profiles/…/scratch/`, `~` ar `/home/`; žinutėje turi būti bent vienas kelias iš `files` arba pasiūlymo numeris. Konkretus įrodymas šiandien: `git log -1 --format=%s cdc5d6b` → žinutė su scratch keliu, o `git show --name-only cdc5d6b` → 6 repo failai, tarp jų `agents/run.py`.
│ +- **Įgyvendinta 2026-11-16 (#322, #5190):** antraštė nebėra modelio tekstas — `agents/run.py` `commit_subject()` ima pakeistų failų sąrašą (`[role] #N: <failas>` arba `<n> failai — f1, f2`), o `commit_message()` modelio pirmą eilutę įrašo kūne kaip „Kodėl (agento teiginys, nepatikrintas)“. Zondas `scratch/probe322_commit.py` su trimis tikromis sugadintomis žinutėmis (`import json, glob, os`, `"""#321 zondas…`, `sources/…:35165–35166`) ir dviem kraštiniais atvejais (15 failų, tuščias tekstas): antraštė visada iki 100 simbolių, prasideda failu, 0 kodo fragmentų.
│
│
│  ## LL-48 — Sąlyga, kurios modelis neįvykdys: „pataisyk vieną komandą“ be nė vieno taisymo
│ research/wiki/guidelines/pamokos.md
│ @@ -721,7 +721,8 @@
│  - **Priežastis:** `check_audio.py:69–78` `missing` ciklas eina per `generate_audio.collect()` tekstus, t. y. per tai, kas **šiandien kalbama**. Manifesto įrašas, kurio tekstas nebekalbamas, nepatenka nė į vieną patikrą, o `ok` (`:105`) skaičiuojamas tik iš `missing` ir `wrong_engine`. Skaičius „naudojama 1140 iš 1138“ buvo atspausdintas kaip informacija (`:155–159`), ne kaip klaida.
│  - **Taisyklė:** failų sąrašas (manifestas) tikrinamas **abiem kryptimis** ir žalias tik tada, kai abi aibės lygios: `disk - refs` (našlaitis, failas be įrašo) ir `refs - disk` (įrašas be failo, nepriklausomai nuo to, ar tekstas šiandien kalbamas). `referenced != on_disk` yra klaida, o ne įspėjimas.
│  - **Patikra:** 2026-11-16 (#319, `scratch/p319_ll100.py`): tikras manifestas — 569 tekstų, refs 1138, disk 1138, `refs - disk` 0, `disk - refs` 0, `check()` ok=True; laikina kopija su vienu papildomu įrašu, kurio failų nėra ir kurio tekstas nekalbamas (`collect()` jo neturi) — `check()` vis tiek `ok=True`, `referenced` 1140, `on_disk` 1138, `missing` 0, `orphans` 0. Rekomendacija — pasiūlymas `agents/proposals/2026-11-16-publikavimo-agentas-garsas-abiem-kryptim.md`.
│ -
│ -
│ -
│ -
│ +- **Įgyvendinta 2026-11-16 (#322, #20119):** `scripts/check_audio.py` `check()` grąžina `dangling` (`refs - disk`) ir `used` (`refs ∩ disk`); `ok` reikalauja, kad `dangling` būtų tuščias, o „naudojama X iš Y“ nebegali viršyti mp3 skaičiaus. Zondas `scratch/probe322_audio.py` (veidrodis — kietosios nuorodos, originalai nepalytėti): bazinis rc 0 „1138 iš 1138“; veidrodis su įrašu be failo → rc 1 „KLAIDA: 2 manifesto įrašų nurodo failą, kurio nėra diske“, įvardyti `n/…`, `s/…`; atstačius manifestą → rc 0. Sąmoningas nukrypimas nuo Taisyklės: `orphans` (failas be įrašo) lieka įspėjimu, ne klaida — jis neturi vaikui matomos pasekmės, o klaida stabdytų kiekvieną turinio PR, kol kas nors paleistų `--prune`.
│ +
│ +
│ +
│ +
│ research/wiki/guidelines/pamokos.md
│ @@ -723,6 +723,13 @@
│  - **Patikra:** 2026-11-16 (#319, `scratch/p319_ll100.py`): tikras manifestas — 569 tekstų, refs 1138, disk 1138, `refs - disk` 0, `disk - refs` 0, `check()` ok=True; laikina kopija su vienu papildomu įrašu, kurio failų nėra ir kurio tekstas nekalbamas (`collect()` jo neturi) — `check()` vis tiek `ok=True`, `referenced` 1140, `on_disk` 1138, `missing` 0, `orphans` 0. Rekomendacija — pasiūlymas `agents/proposals/2026-11-16-publikavimo-agentas-garsas-abiem-kryptim.md`.
│  - **Įgyvendinta 2026-11-16 (#322, #20119):** `scripts/check_audio.py` `check()` grąžina `dangling` (`refs - disk`) ir `used` (`refs ∩ disk`); `ok` reikalauja, kad `dangling` būtų tuščias, o „naudojama X iš Y“ nebegali viršyti mp3 skaičiaus. Zondas `scratch/probe322_audio.py` (veidrodis — kietosios nuorodos, originalai nepalytėti): bazinis rc 0 „1138 iš 1138“; veidrodis su įrašu be failo → rc 1 „KLAIDA: 2 manifesto įrašų nurodo failą, kurio nėra diske“, įvardyti `n/…`, `s/…`; atstačius manifestą → rc 0. Sąmoningas nukrypimas nuo Taisyklės: `orphans` (failas be įrašo) lieka įspėjimu, ne klaida — jis neturi vaikui matomos pasekmės, o klaida stabdytų kiekvieną turinio PR, kol kas nors paleistų `--prune`.
│
│ -
│ -
│ -
│ +## LL-101 — Blokavimas, kurio priežastis jau panaikinta
│ +
│ +- **Simptomas:** 2026-11-14 trys kūrėjo paleidimai (#281–#283) truko po 5 s, modelio vartai atsakė „runtime_draining“ / „update_paused“, modelis užduoties negavo, bet kiekvienas paleidimas „paskelbė“ savo paties žurnalą, todėl trys pasiūlymai (#14726, #15045, #15581) buvo užblokuoti. Bėgiklis netrukus ėmė tokią klaidą vadinti `infra` ir pasiūlymą grąžinti į eilę, o šie trys liko `blocked` dar dvi dienas: `system_report.py` kasdien rodė „Blokuoti (niekas nebeatidaro — reikia sprendimo): 4“, ir niekas nelygino blokavimo priežasties su tuo, ką įrankis šiandien daro.
│ +- **Priežastis:** būsena (`blocked`) buvo vienintelis strukturuotas įrašas apie įvykį, o priežastis liko laisvame `note` tekste („paleidimas nepavyko: kurejas #283: failed per 5s… failų: 1“). Pataisius klasifikatorių, jau įrašytos būsenos neperskaičiuojamos — nė vienas vartas nelygina „kodėl buvo užblokuota“ su „ką įrankis dabar daro“. Tai ta pati šeima kaip LL-96 (įrankio numatytasis režimas) ir LL-100 (matavimas viena kryptimi), tik laiko ašyje: taisymas galioja tik būsimiems įvykiams.
│ +- **Taisyklė:** pataisius gedimo klasifikavimą ar vartų taisyklę, tame pačiame darbe paleidžiama **migracija**, kuri peržiūri jau įrašytas pasekmes pagal priežastį, o ne pagal būseną. Migracija turi būti idempotentinė (pakartotas bėgimas nieko nekeičia) ir diagnozę sakyti žodžiais („likti blocked: blokavimo priežastis nenurodo paleidimo“). Sprendimas priimamas iš kelių sąlygų kartu, ne iš vienos: #322 `scripts/queue_repair.py` reikalauja, kad (1) `note` rodytų konkretų paleidimą, (2) tas paleidimas būtų ≤90 s ir klaida, (3) jo darbo failai būtų tik `agents/log/`, (4) išvestyje būtų `INFRA_MARKERS` žymė.
│ +- **Patikra:** 2026-11-16 (#322): sausas bėgimas → „Blokuotų pasiūlymų: 4 · grąžintinų į eilę: 3“ ir trys įvardyti su priežastimi; `--apply` → trys „grąžintas į eilę (bandymas 1/3)“; pakartotinis bėgimas → „Blokuotų: 1 · grąžintinų: 0“ (liko #5834, kurio priežastis „paskelbta, bet tikslas nepakeistas“ — turinio peržiūra, ne infra); `scripts/kurejas_queue.py --dry-run` → #15045, #15581, #14726 eilėje; pasiūlymų failai vietoje (`agents/proposals/2026-11-13-…json`).
│ +
│ +
│ +
│ +
│ agents/roles/sistemos-architektas.md
│ @@ -10,6 +10,10 @@
│    tušti/konfliktiniai/atmesti paleidimai, vidutinė trukmė, pasiūlymų eilė,
│    patikrų būsena, grafikų laikai, įjungtos klasės.
│  - `agents/runs.db` — kiekvieno paleidimo statusas, trukmė, commit'as.
│ +- `python3 scripts/queue_repair.py` — rodo, kurie `blocked` pasiūlymai užblokuoti
│ +  **infrastruktūros** gedimo (ne turinio), ir `--apply` grąžina juos į eilę.
│ +  `blocked` eilė nebeliečia, todėl be šio įrankio pataisytas klasifikatorius
│ +  lieka be pasekmių jau užblokuotiems įrašams (LL-101).
│  - `agents/log/*.md` — agentų ataskaitos (ką jie iš tikrųjų padarė).
│  - `agents/roles/*.md` — vaidmenų promptai ir taisyklės.
│  - `agents/run.py` — `ROLES` (grafikai, modeliai, ribos), `build_prompt()`.
│ agents/roles/sistemos-architektas.md
│ @@ -31,6 +31,14 @@
│     (`agents/log/`) ir nustatyk **priežastį**, ne simptomą.
│  3. **Išsirink 1–3 sistemines problemas.** Ne pavienius atvejus: „metodininkas
│     kas antrą kartą baigia konfliktu“ yra sistema, „vienas modulis buvo blogas“ — ne.
│ +   Pirmenybė: **sisteminių pasiūlymų eilė yra tavo eilė**. `system_report.py`
│ +   skiltis „Sisteminiai pasiūlymai (kūrėjas jų neima — tai architekto eilė)“
│ +   rodo darbus, kurių niekas kitas nepadarys; imk **seniausią** (ne įdomiausią),
│ +   nes kiekvieną paleidimą, kuriame eilė nepajudėjo, `check_agents.py` skaičiuoja
│ +   kaip įspėjimą. Naujų problemų ieškok tik tada, kai eilė tuščia arba kai
│ +   matavimas rodo didesnį nuostolį nei eilės laukimas.
│ +   Jei pataisei gedimo klasifikavimą — paleisk `python3 scripts/queue_repair.py`
│ +   ir įrašyk, kiek įrašų grąžinta (LL-101).
│  4. **Įgyvendink taisymą.** Gali keisti:
│     - vaidmenų promptus ir taisykles (`agents/roles/*.md`),
│     - grafikus, modelius, ribas (`ROLES` faile `agents/run.py`),
# sistemos-architektas — paleidimas #322 (2026-11-16)

Baigiau dalį darbo; toliau — kas realiai padaryta, kas išmatuota ir kas liko nebaigta. Paskutinis žingsnis (dienoraščio įrašas, `check_agents.py`, `system_report` „po“) neįvykdytas dėl iteracijų limito.

## Mačiau (matavimai prieš, `scripts/system_report.py` 20:22)

- 112 paleidimų / 7 d. Nenaudingi: **sistemos-architektas 28 %** (7 paleid., 2 failed), **kurejas 20 %** (15, 3 failed), leidejas 20 %, kritikas 20 %, ideator 17 %, simuliacijų inžinierius 17 %.
- Pasiūlymai: 122 — done 91, new 18, **blocked 4**, obsolete 9; seniausias neapdorotas prieš 8 d.; sisteminių eilėje 10, iš jų 7 laukia >3 d.
- Priežastys iš `runs.db` ir `agents/log/`: (a) #281–#283 — trys 5 s trukę provideriaus gedimai (`runtime_draining`, `update_paused`), kuriuos eilė palaikė turinio nesėkme ir **visam laikui užblokavo tris pasiūlymus**; (b) #317 kritikas / #320 leidejas / #295 ideator — 5–8 min darbo, bet pabaigoje „LIKO NEĮRAŠYTA: ataskaita, state.json“, statusas `empty`, radiniai prarasti; (c) `git log` antraštės — `import json, glob, os`, `"""#319 zondas…`, `sources/…:35165` (5 iš 12 paskutinių commit'ų).

## Keičiau (4 sisteminiai pataisymai, visi su zondais)

1. `scripts/check_audio.py` — manifestas tikrinamas **abiem kryptimis** (LL-100, #20119): naujas `dangling = refs − disk` yra klaida, `used = refs ∩ disk`, todėl „naudojama 1140 iš 1138“ nebegalima. Zondas veidrodyje (kietosios nuorodos, originalai neliesti): bazinis **rc 0** 1138/1138; įrašas be failo → **rc 1** „2 manifesto įrašų nurodo failą, kurio nėra diske“, įvardyti `n/…`, `s/…`; atstačius → **rc 0**.
2. `agents/run.py` — `commit_subject()` / `commit_message()`: commit'o antraštė iš **pakeistų failų**, modelio pirmoji eilutė — kūne kaip „Kodėl (agento teiginys, nepatikrintas)“ (LL-47, #5190). Zondas su trimis tikromis sugadintomis žinutėmis + 15 failų ir tuščio teksto atvejais: 0 kodo fragmentų, antraštė ≤100 simb.
3. `agents/run.py` HEADER 5 punktas — agentas nebešvaisto paskutinių žingsnių ataskaitai ir `state.json` (juos rašo bėgiklis); pirmiau įrašomas **darbo failas**, nes „pakeista tik ataskaita“ = `empty`.
4. `scripts/queue_repair.py` (naujas) + `agents/roles/sistemos-architektas.md` — migracija pagal **priežastį**, ne būseną (LL-101): 4 blokuoti → **3 grąžinti į eilę** (#14726, #15045, #15581, bandymas 1/3), pakartotas bėgimas idempotentinis (4→1, 0 grąžintinų). `kurejas_queue.py --dry-run` dabar rodo juos eilėje. #20119 ir #5190 pažymėti `done` su patikros įrašu.

Dokumentacija: `research/wiki/guidelines/pamokos.md` — LL-47 ir LL-100 papildytos „Įgyvendinta“, pridėta **LL-101** („Blokavimas, kurio priežastis jau panaikinta“).

## Patikra (įvykdyta)

`py_compile` OK; `validate_content.py --grade 1 --strict` → **0/0 rc 0**; `check_audio.py` → ✔ 569 tekstų / 1138 įrašų / 1138 iš 1138, **rc 0**; `check_art.py` → ✔, rc 0.

## Liko nebaigta (sąmoningai arba dėl limito)

- **Nepaleista:** `check_agents.py`, `check_lessons.py`, `check_ui.py`, `check_docs_facts.py`, `system_report.py` po pakeitimų, `agents/system-journal.md` įrašas (Mačiau/Keičiau/Kodėl/Patikra). ROLES grafikų neliečiau → `gen_timers.py` nereikia; dashboard neliestas.
- **Neišspręsta sąmoningai:** #5834 (blokuotas dėl „paskelbta, bet tikslas nepakeistas“ — reikia žmogaus/turinio peržiūros); #4455 (ataskaitų dydis), #4516 (sakinio ilgis `warn`), #5342 (worktree izoliacija), #5400 (`sync_docs_facts`), #7396/#4921 (`check_view.py` 200 % tekstas ir <360 px).
- **Naujas radinys, neregistruotas:** root `AGENTS.md` „Vaikų DOX indeksas“ nurodo 7 katalogų `AGENTS.md` (`content/`, `assets/`, `scripts/`, `agents/` …) — repo jų **nėra** (yra tik šaknies). Tai dokumentacijos spraga, kurią verta uždaryti atskiru paleidimu.
- **Stebėti:** ar HEADER pakeitimas sumažina `empty` dalį (kritikas/leidejas/ideator); jei ne — kelti `max_turns` tiems trims vaidmenims.

## klaidos

```
session_id: local-c01f1e928a12f2917b507f81c532ce6388fbdcdbfe6403d1acc84f17c62e036f
```
