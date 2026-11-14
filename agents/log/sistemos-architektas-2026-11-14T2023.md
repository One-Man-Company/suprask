# sistemos-architektas — 2026-11-14T2023

- paleidimas: #291 (manual)
- trukmė: 550s
- exit: 1 → failed
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/probe291.py
│ @@ -0,0 +1,11 @@
│ +import sqlite3, sys
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +print([r[1] for r in c.execute('PRAGMA table_info(runs)')])
│ +print('---')
│ +for r in c.execute('select id,role,status,duration_s,started_at,finished_at,error from runs order by id desc limit 14'):
│ +    print(r)
│ +print('--- proposals cols')
│ +print([r[1] for r in c.execute('PRAGMA table_info(proposals)')])
│ +print('--- blocked/new')
│ +for r in c.execute("select id,status,role,substr(title,1,60),created,attempts from proposals where status in ('blocked','new') order by status,id limit 30"):
│ +    print(r)
│ profiles/deepseek41flash/cache/scratch/probe291.py
│ @@ -1,11 +1,11 @@
│ -import sqlite3, sys
│ +import sqlite3
│  c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ -print([r[1] for r in c.execute('PRAGMA table_info(runs)')])
│ -print('---')
│ -for r in c.execute('select id,role,status,duration_s,started_at,finished_at,error from runs order by id desc limit 14'):
│ -    print(r)
│ +c.row_factory = sqlite3.Row
│ +print('--- runs')
│ +for r in c.execute('select id,role,trigger,status,exit_code,duration_s,started,finished,substr(note,1,120) as note,substr(summary,1,90) as summary,substr(validation,1,60) as val from runs order by id desc limit 14'):
│ +    print(dict(r))
│  print('--- proposals cols')
│ -print([r[1] for r in c.execute('PRAGMA table_info(proposals)')])
│ +print([x[1] for x in c.execute('PRAGMA table_info(proposals)')])
│  print('--- blocked/new')
│ -for r in c.execute("select id,status,role,substr(title,1,60),created,attempts from proposals where status in ('blocked','new') order by status,id limit 30"):
│ -    print(r)
│ +for r in c.execute("select id,status,role,substr(title,1,55) as t,created,attempts from proposals where status in ('blocked','new') order by id limit 30"):
│ +    print(dict(r))
│ profiles/deepseek41flash/cache/scratch/probe291b.py
│ @@ -0,0 +1,17 @@
│ +import sqlite3, datetime as dt
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +since = (dt.datetime.now() - dt.timedelta(days=7)).isoformat()
│ +rows = [dict(r) for r in c.execute("select * from runs where started >= ?", (since,))]
│ +print('runs in 7d:', len(rows))
│ +from collections import Counter, defaultdict
│ +per = defaultdict(Counter)
│ +for r in rows:
│ +    per[r['role']][(r['status'] or '?')] += 1
│ +for role, c2 in sorted(per.items(), key=lambda kv: -sum(kv[1].values())):
│ +    print(f"{role:26} {dict(c2)}")
│ +print()
│ +print('kurejas failed/non-published last 10:')
│ +for r in rows:
│ +    if r['role'] == 'kurejas' and r['status'] not in ('published',):
│ +        print(r['id'], r['status'], r['duration_s'], (r['summary'] or '')[:90].replace('\n', ' '))
│ profiles/deepseek41flash/cache/scratch/probe291c.py
│ @@ -0,0 +1,9 @@
│ +import sqlite3
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +c.row_factory = sqlite3.Row
│ +for r in c.execute("select id,status,role,type,priority,created,substr(title,1,70) as t,target,note from proposals where status='blocked' order by id"):
│ +    print(dict(r))
│ +    print()
│ +print('new:')
│ +for r in c.execute("select id,role,type,priority,created,substr(title,1,70) as t,target from proposals where status='new' order by id"):
│ +    print(dict(r))
│ agents/run.py
│ @@ -89,6 +89,56 @@
│      "provider said",
│      "rate limit",
│  )
│ +
│ +# Infrastruktūros, o NE turinio gedimas: modelio vartai atsisakė priimti užduotį
│ +# (`runtime_draining`, `update_paused`), ryšys nutrūko arba provideris prašė
│ +# palaukti. 2026-11-14 trys tokie paleidimai (#281–#283) truko po 5 s, bet
│ +# kiekvienas „paskelbė“ savo paties žurnalą (`agents/log/kurejas-…md`) ir taip
│ +# visam laikui užblokavo tris eilės pasiūlymus (#14726, #15045, #15581).
│ +# Toks gedimas negali būti verčiamas turinio sprendimu: jo metu modelis net
│ +# negavo užduoties, todėl pasiūlymas grąžinamas į eilę, o neblokuojamas.
│ +INFRA_MARKERS = (
│ +    "runtime_draining",
│ +    "update_paused",
│ +    "gateway draining",
│ +    "couldn't start the model connection",
│ +    "connection refused",
│ +    "connection reset",
│ +    "temporarily unavailable",
│ +    "http 502",
│ +    "http 503",
│ +    "http 504",
│ +)
│ +
│ +# Kiek kartų tas pats pasiūlymas grąžinamas į eilę po infrastruktūros gedimo,
│ +# kol sustojama. Be ribos eilė suktųsi amžinai, jei vartai neveikia visą dieną.
│ +INFRA_MAX_ATTEMPTS = 3
│ +
│ +# Šio paleidimo ataskaita. Ji nėra DARBAS: bėgiklis ją rašo pats, todėl ji
│ +# atsiranda ir tada, kai modelis nepradėjo darbo. Kol žurnalas buvo skaičiuojamas
│ +# kaip pakeistas failas, 5 s gedimas atrodė kaip „paskelbta 1 failų“, o eilės
│ +# apsauga („0 failų = ne bandymas“) niekada negalėjo suveikti.
│ +LOG_PREFIX = "agents/log/"
│ +
│ +
│ +def infra_reason(*texts: str) -> str:
│ +    """Trumpa infrastruktūros gedimo priežastis arba `""`, jei jo nebuvo."""
│ +    blob = " ".join(t or "" for t in texts).lower()
│ +    for marker in INFRA_MARKERS:
│ +        if marker in blob:
│ +            return marker
│ +    return ""
│ +
│ +
│ +def work_files(files: list[str]) -> list[str]:
│ +    """Failai, kurie yra šio paleidimo DARBAS (be jo paties ataskaitos).
│ +
│ +    Ataskaita (`agents/log/<role>-<laikas>.md`) rašoma visada, todėl ji negali
│ +    būti įrodymu, kad kažkas padaryta. Ji vis dar patenka į commit'ą, kai yra
│ +    ką publikuoti, bet ne į sprendimą „ar paleidimas ką nors nuveikė“.
│ +    """
│ +    return [f for f in files if not f.startswith(LOG_PREFIX)]
│ +
│
│  # Vaidmuo → failas, profilis, įrankių rinkinys, limitai, grafikas
│  ROLES: dict[str, dict] = {
│ agents/run.py
│ @@ -1224,6 +1224,16 @@
│              detail += " " + "; ".join(notes)
│          return {"status": "empty", "detail": detail, "sha": "", "validation": ""}
│
│ +    # Tik savo paties ataskaita pakeitęs paleidimas NĖRA darbas. 2026-11-14
│ +    # trys 5 s infrastruktūros gedimai taip „paskelbė“ po vieną žurnalą
│ +    # (commit bf25b86, 622c29e, 0a6be1f — kiekviename po vieną `agents/log/`
│ +    # failą), o eilė kiekvieną jų palaikė įrodymu ir užblokavo pasiūlymą.
│ +    if not work_files(files):
│ +        detail = "Pakeista tik paleidimo ataskaita — darbo rezultato nėra."
│ +        if notes:
│ +            detail += " " + "; ".join(notes)
│ +        return {"status": "empty", "detail": detail, "sha": "", "validation": ""}
│ +
│      protected = [f for f in files if f in PROTECTED]
│      if protected:
│          revert(files)
│ agents/run.py
│ @@ -1551,9 +1551,17 @@
│          watch.stop()
│          foreign = watch.roles()
│          files, foreign_files, notes = publication_plan(files, args.role, foreign)
│ +        work = work_files(files)
│          if foreign_files or foreign:
│              print(f"{args.role}: " + "; ".join(notes))
│          db.upsert_proposals(sorted(PROPOSALS.glob("*.json")))
│ +
│ +        # Infrastruktūros gedimas atskiriamas nuo turinio gedimo. Kai nėra nė
│ +        # vieno darbo failo, o modelio vartai atsakė „draining“, modelis
│ +        # užduoties net negavo — toks paleidimas neturi sudeginti pasiūlymo.
│ +        infra = infra_reason(out, err) if not work else ""
│ +        if infra and status in ("failed", "partial", "ok"):
│ +            status = "infra"
│
│          # Paskelbimas — bėgiklio, ne agento, darbas.
│          result = publish(args.role, run_id, files, out or args.role,
│ agents/run.py
│ @@ -1581,13 +1581,18 @@
│              status = "checked"
│
│          if proposal:
│ +            pid = int(proposal["id"])
│              if status == "published":
│ -                mark_implemented(int(proposal["id"]), files, result["sha"])
│ +                mark_implemented(pid, files, result["sha"])
│ +            elif status == "infra":
│ +                requeued, attempt = reopen_after_infra(pid, infra)
│ +                print(f"{args.role}: infrastruktūros klaida ({infra}) — pasiūlymas #{pid} "
│ +                      f"{'grąžintas į eilę' if requeued else 'BLOKUOTAS'} (bandymas {attempt}/{INFRA_MAX_ATTEMPTS})")
│              elif status in ("rejected", "conflict", "unpushed", "failed", "timeout"):
│ -                db.set_proposal_status(int(proposal["id"]), "blocked", f"{status}: {result['detail'][:120]}")
│ +                db.set_proposal_status(pid, "blocked", f"{status}: {result['detail'][:120]}")
│
│          db.finish_run(
│ -            run_id, status, code, elapsed, str(log_path.relative_to(ROOT)), out, files,
│ +            run_id, status, code, elapsed, str(log_path.relative_to(ROOT)), out, work,
│              commit_sha=result["sha"], validation=result["validation"], detail=result["detail"],
│          )
│          update_state(args.role, cfg, status, log_path)
│ agents/run.py
│ @@ -917,6 +917,31 @@
│          return False
│
│
│ +def reopen_after_infra(proposal_id: int, reason: str) -> tuple[bool, int]:
│ +    """Grąžina pasiūlymą į eilę po infrastruktūros gedimo.
│ +
│ +    `blocked` yra kapinės: eilė blokuotų nebeliečia, o `--retry-blocked` yra
│ +    rankinis veiksmas, kurio niekas nekviečia. Todėl modelio vartų gedimas
│ +    (paleidimas be nė vieno darbo failo) negali siųsti pasiūlymo ten — 2026-11-14
│ +    taip dingo trys eilės įrašai per 20 sekundžių (#14726, #15045, #15581).
│ +
│ +    Kartojimasis skaičiuojamas iš pasiūlymo `note`: po `INFRA_MAX_ATTEMPTS`
│ +    bandymų sustojama ir pasiūlymas blokuojamas, kad neveikiantys vartai
│ +    neleistų eilei suktis amžinai. Grąžina `(grąžintas į eilę?, bandymo nr.)`.
│ +    """
│ +    row = next((r for r in db.proposals(500) if int(r["id"]) == int(proposal_id)), None)
│ +    note = (row or {}).get("note") or ""
│ +    found = re.match(r"infrastruktūros klaida (\d+)", note)
│ +    attempt = (int(found.group(1)) if found else 0) + 1
│ +    if attempt >= INFRA_MAX_ATTEMPTS:
│ +        db.set_proposal_status(int(proposal_id), "blocked",
│ +                               f"infrastruktūros klaida {attempt}: {reason}")
│ +        return False, attempt
│ +    db.set_proposal_status(int(proposal_id), "new",
│ +                           f"infrastruktūros klaida {attempt}: {reason}")
│ +    return True, attempt
│ +
│ +
│  def close_proposals(files: list[str], commit_sha: str, implemented_id: int | None = None) -> int:
│      """Suderinamumo apvalkalas: grąžina, kiek pasiūlymų uždaryta (0 arba 1)."""
│      return 1 if mark_implemented(implemented_id, files, commit_sha) else 0
│ scripts/kurejas_queue.py
│ @@ -251,14 +251,21 @@
│          # sugedusi aplinka, o ne pasiūlymo kaltė. Tokiu atveju pasiūlymas
│          # NEPAŽYMIMAS blocked (kitaip jis prarandamas visam laikui) — stabdome
│          # visą eilę ir paliekame tai, ką reikia sutvarkyti žmogui/architektui.
│ +        #
│ +        # `artifacts` nuo 2026-11-14 nebeskaičiuoja paties paleidimo ataskaitos
│ +        # (`agents/log/<role>-…md`), todėl ši apsauga pagaliau pasiekiama:
│ +        # iki tol 5 s „runtime_draining“ gedimas atrodė kaip „paskelbta 1 failų“
│ +        # ir trys pasiūlymai (#14726, #15045, #15581) dingo į `blocked`.
│          duration = int((run_row or {}).get("duration_s") or 0)
│          artifacts = (run_row or {}).get("artifacts") or "[]"
│          run_status = (run_row or {}).get("status") or "—"
│ -        if run_row is not None and duration < MIN_ATTEMPT_S and artifacts in ("[]", "", None):
│ +        no_work = artifacts in ("[]", "", None)
│ +        if run_row is not None and no_work and (duration < MIN_ATTEMPT_S or run_status == "infra"):
│              db.set_proposal_status(int(prop["id"]), "new",
│ -                                   f"bandymas neįvyko: {run_status} per {duration}s, 0 failų")
│ -            print(f"   Paleidimas truko {duration}s ir nepakeitė nė vieno failo — "
│ -                  f"tai ne bandymas. Pasiūlymas lieka new, stabdau eilę.")
│ +                                   f"bandymas neįvyko: {run_status} per {duration}s, 0 darbo failų")
│ +            reason = "infrastruktūros gedimas (modelio vartai)" if run_status == "infra" else "nebandymas"
│ +            print(f"   Paleidimas truko {duration}s ir nepakeitė nė vieno darbo failo — "
│ +                  f"{reason}. Pasiūlymas lieka new, stabdau eilę.")
│              break
│
│          if run_status == "published":
│ scripts/system_report.py
│ @@ -36,18 +36,38 @@
│  except Exception:  # noqa: BLE001
│      SYSTEM_PREFIXES = ("agents/", "scripts/", "deploy/", "dashboard/", "docs/")
│
│ -BAD = ("empty", "conflict", "rejected", "timeout", "failed", "skipped", "blocked")
│ +BAD = ("empty", "conflict", "rejected", "timeout", "failed", "infra", "interrupted",
│ +       "unpushed", "skipped", "blocked")
│ +
│ +# Statusai, kurie NĖRA naudingas darbas. `checked` čia neįtrauktas: patikros
│ +# vaidmeniui (tikrintojas, publikavimo-agentas…) būtent ataskaita ir yra
│ +# rezultatas (žr. `ROLES[…]["inspect"]`). Nekūrybiniam vaidmeniui `checked`
│ +# reiškia tą patį kaip `empty`, todėl jis pridedamas atskirai.
│ +USELESS = ("empty", "conflict", "rejected", "timeout", "skipped", "failed",
│ +           "infra", "interrupted", "unpushed", "other")
│ +
│ +
│ +def inspect_roles() -> set[str]:
│ +    """Vaidmenys, kurių rezultatas yra ataskaita, o ne failų pakeitimas."""
│ +    try:
│ +        import run as runner
│ +    except Exception:  # noqa: BLE001
│ +        return set()
│ +    return {r for r, c in runner.ROLES.items() if c.get("inspect")}
│
│
│  def runs_summary(days: int) -> tuple[dict, list[dict]]:
│      since = (dt.datetime.now() - dt.timedelta(days=days)).isoformat()
│      rows = [r for r in db.recent_runs(400) if (r.get("started") or "") >= since]
│ +    inspectors = inspect_roles()
│      per_role: dict[str, dict] = {}
│      for r in rows:
│          role = r.get("role") or "?"
│          cell = per_role.setdefault(role, {
│              "runs": 0, "published": 0, "ok": 0, "empty": 0, "conflict": 0,
│ -            "rejected": 0, "timeout": 0, "skipped": 0, "other": 0, "paused": 0,
│ +            "rejected": 0, "timeout": 0, "skipped": 0, "failed": 0, "infra": 0,
│ +            "interrupted": 0, "unpushed": 0, "checked": 0, "partial": 0,
│ +            "dry-run": 0, "running": 0, "other": 0, "paused": 0,
│              "duration_s": 0, "last": None,
│          })
│          st = (r.get("status") or "other").lower()
│ scripts/system_report.py
│ @@ -91,9 +91,18 @@
│                              "detail": (r.get("detail") or "")[:200]}
│      for cell in per_role.values():
│          cell["avg_min"] = round(cell["duration_s"] / max(1, cell["runs"]) / 60, 1)
│ -        cell["useless_ratio"] = round(
│ -            sum(cell[k] for k in ("empty", "conflict", "rejected", "timeout", "skipped")) / max(1, cell["runs"]), 2
│ -        )
│ +        # `failed` ir `interrupted` anksčiau neįėjo į šią sumą, nors abu yra
│ +        # prarastas paleidimas: 2026-11-14 kurejas turėjo 124 paleidimus,
│ +        # 81 paskelbtą ir 43 niekur nematomus, o lentelė skelbė „0 % nenaudingų“.
│ +        # Skaičiuojame VISKĄ, kas nepagamino darbo, ir parodome atskirai.
│ +        useless = sum(cell[k] for k in USELESS)
│ +        if role not in inspectors:
│ +            useless += cell["checked"]
│ +        cell["useless"] = useless
│ +        cell["useless_ratio"] = round(useless / max(1, cell["runs"]), 2)
│ +        cell["failed_all"] = cell["failed"] + cell["infra"] + cell["interrupted"] + cell["timeout"]
│ +        cell["other_all"] = (cell["checked"] + cell["ok"] + cell["partial"]
│ +                             + cell["dry-run"] + cell["running"] + cell["other"])
│      return per_role, rows
│
│
│ scripts/system_report.py
│ @@ -314,10 +314,14 @@
│      print(f"AGENTŲ SISTEMOS ATASKAITA · {data['generated']} · paskutinės {args.days} d.")
│      pause_note = f" (dar {paused_n} pristabdyta — žr. žemiau)" if paused_n else ""
│      print(f"\nPaleidimai: {len(rows)}{pause_note}")
│ -    print(f"{'vaidmuo':<24}{'paleid.':>8}{'publ.':>7}{'tušti':>7}{'konfl.':>7}{'atm.':>6}{'vid.m':>7}{'nenaud.':>9}{'prist.':>7}")
│ +    print(f"{'vaidmuo':<24}{'paleid.':>8}{'publ.':>7}{'tušti':>7}{'konfl.':>7}{'atm.':>6}"
│ +          f"{'nepav.':>7}{'kita':>6}{'vid.m':>7}{'nenaud.':>9}{'prist.':>7}")
│      for role, c in sorted(per_role.items(), key=lambda kv: -kv[1]["runs"]):
│          print(f"{role:<24}{c['runs']:>8}{c['published']:>7}{c['empty']:>7}{c['conflict']:>7}"
│ -              f"{c['rejected']:>6}{c['avg_min']:>7}{int(c['useless_ratio'] * 100):>8}%{c['paused']:>7}")
│ +              f"{c['rejected']:>6}{c['failed_all']:>7}{c['other_all']:>6}{c['avg_min']:>7}"
│ +              f"{int(c['useless_ratio'] * 100):>8}%{c['paused']:>7}")
│ +    print("  nepav. = failed + infra + interrupted + timeout · kita = checked + ok + partial + dry-run · "
│ +          "nenaud. skaičiuoja ir failed/interrupted, ir `checked` ne patikros vaidmeniui")
│
│      if windows:
│          total_h = sum(w["hours"] for w in windows)
│ scripts/system_report.py
│ @@ -357,7 +357,7 @@
│
│      # Diagnostika: paskutiniai nepavykę paleidimai kartu su bėgiklio priežastimi.
│      # Be šio bloko konfliktų priežastis matydavo tik tas, kuris tą akimirką žiūrėjo į terminalą.
│ -    broken = ("conflict", "rejected", "unpushed", "failed", "timeout")
│ +    broken = ("conflict", "rejected", "unpushed", "failed", "timeout", "infra", "interrupted")
│      problems = [r for r in rows if (r.get("status") or "") in broken]
│      if problems:
│          print("\nPaskutinės problemos (bėgiklio žodžiais):")
│ scripts/system_report.py
│ @@ -89,7 +89,7 @@
│          if cell["last"] is None or started > (cell["last"].get("started") or ""):
│              cell["last"] = {"started": started, "status": st, "summary": (r.get("summary") or "")[:160],
│                              "detail": (r.get("detail") or "")[:200]}
│ -    for cell in per_role.values():
│ +    for role, cell in per_role.items():
│          cell["avg_min"] = round(cell["duration_s"] / max(1, cell["runs"]) / 60, 1)
│          # `failed` ir `interrupted` anksčiau neįėjo į šią sumą, nors abu yra
│          # prarastas paleidimas: 2026-11-14 kurejas turėjo 124 paleidimus,
│ dashboard/server.py
│ @@ -428,7 +428,7 @@
│  .status{padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700}
│  .ok{background:rgba(63,191,143,.15);color:var(--ok)}
│  .partial{background:rgba(240,180,41,.15);color:var(--warn)}
│ -.failed,.timeout{background:rgba(242,112,138,.15);color:var(--bad)}
│ +.failed,.timeout,.infra,.interrupted{background:rgba(242,112,138,.15);color:var(--bad)}
│  .running{background:rgba(90,169,230,.18);color:#8cc6f0}
│  .skipped,.dry-run{background:var(--panel2);color:var(--muted)}
│  button{background:var(--panel2);color:var(--fg);border:1px solid var(--line);border-radius:9px;padding:7px 12px;cursor:pointer;font:inherit;min-height:36px}
│ dashboard/server.py
│ @@ -571,7 +571,7 @@
│    return Math.round(h/24) + " d.";
│  }
│
│ -function statusClass(s){ return ["ok","partial","failed","timeout","running","skipped","dry-run"].includes(s) ? s : ""; }
│ +function statusClass(s){ return ["ok","partial","failed","timeout","infra","interrupted","running","skipped","dry-run"].includes(s) ? s : ""; }
│
│  async function loadOverview(){
│    const d = await j("/api/overview");
│ profiles/deepseek41flash/cache/scratch/probe291_runner.py
│ @@ -0,0 +1,85 @@
│ +#!/usr/bin/env python3
│ +"""Zondas #291: infrastruktūros gedimo atskyrimas nuo turinio gedimo.
│ +
│ +Tikrina TIK tas vietas, kurios šiandien pakeistos:
│ +  A. infra_reason() atpažįsta tris realias #281-#283 žinutes,
│ +  B. work_files() neįskaito paleidimo ataskaitos,
│ +  C. reopen_after_infra() grąžina į eilę, o po INFRA_MAX_ATTEMPTS blokuoja
│ +     (dirbama su DB KOPIJA — tikra `agents/runs.db` neliečiama),
│ +  D. _publish() su vien tik žurnalu grąžina „empty“, o git neliečiamas.
│ +"""
│ +import pathlib
│ +import shutil
│ +import sqlite3
│ +import subprocess
│ +import sys
│ +import tempfile
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +sys.path.insert(0, str(ROOT / "agents"))
│ +import db  # noqa: E402
│ +import run as runner  # noqa: E402
│ +
│ +ok = fail = 0
│ +
│ +
│ +def check(name, cond, extra=""):
│ +    global ok, fail
│ +    if cond:
│ +        ok += 1
│ +        print(f"OK   {name} {extra}")
│ +    else:
│ +        fail += 1
│ +        print(f"FAIL {name} {extra}")
│ +
│ +
│ +# --- A. realios žinutės iš runs.db -----------------------------------------
│ +real = sqlite3.connect(ROOT / "agents" / "runs.db")
│ +real.row_factory = sqlite3.Row
│ +msgs = {r["id"]: (r["summary"] or "") + " " + (r["detail"] or "")
│ +        for r in real.execute("select id,summary,detail from runs where id in (281,282,283)")}
│ +for rid, text in sorted(msgs.items()):
│ +    check(f"A.run{rid} atpažintas kaip infra", bool(runner.infra_reason(text)),
│ +          repr(runner.infra_reason(text)))
│ +check("A.turinio gedimas NE infra",
│ +      runner.infra_reason("Validacija nepraėjo: 3 klaidos") == "", "")
│ +
│ +# --- B. darbo failai --------------------------------------------------------
│ +check("B.žurnalas ne darbas", runner.work_files(["agents/log/kurejas-2026-11-14T0912.md"]) == [])
│ +check("B.turinys + žurnalas", runner.work_files(
│ +    ["agents/log/kurejas-x.md", "content/lt/grade-01/matematika/18-x.json"])
│ +    == ["content/lt/grade-01/matematika/18-x.json"])
│ +
│ +# --- C. DB kopija -----------------------------------------------------------
│ +tmp = pathlib.Path(tempfile.mkdtemp(prefix="zondas291-"))
│ +copy = tmp / "runs.db"
│ +src = sqlite3.connect(ROOT / "agents" / "runs.db")
│ +dst = sqlite3.connect(copy)
│ +src.backup(dst)
│ +src.close()
│ +dst.close()
│ +db.DB_PATH = copy
│ +pid = int(next(r["id"] for r in db.proposals(500) if r["id"] == 16892))
│ +db.set_proposal_status(pid, "new", "infrastruktūros klaida 1: runtime_draining")
│ +again, attempt = runner.reopen_after_infra(pid, "runtime_draining")
│ +row = next(r for r in db.proposals(500) if int(r["id"]) == pid)
│ +check("C.1 grąžintas į eilę", again is True and attempt == 2 and row["status"] == "new",
│ +      f"status={row['status']} note={row['note']}")
│ +again2, attempt2 = runner.reopen_after_infra(pid, "runtime_draining")
│ +row2 = next(r for r in db.proposals(500) if int(r["id"]) == pid)
│ +check("C.2 po 3 bandymų blokuotas", again2 is False and attempt2 == 3 and row2["status"] == "blocked",
│ +      f"status={row2['status']} note={row2['note']}")
│ +# lygiai 3 bandymai per tris paleidimus, ne daugiau
│ +check("C.3 blokavimo priežastis įrašyta", row2["note"].startswith("infrastruktūros klaida 3"), row2["note"])
│ +
│ +# --- D. žurnalo publikavimas ------------------------------------------------
│ +git_before = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True).stdout
│ +res = runner.publish("kurejas", 999999, ["agents/log/kurejas-2026-11-14T0912.md"], "Gateway draining", allow_revert=False)
│ +git_after = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True).stdout
│ … omitted 7 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/seed291.py
│ @@ -0,0 +1,25 @@
│ +#!/usr/bin/env python3
│ +"""Zondas #291 E2E: bėgiklis turi atskirti modelio vartų gedimą nuo turinio.
│ +
│ +Paleidžiamas IZOLIUOTAME git worktree su suklastotu `hermes`, kuris atsako
│ +lygiai taip, kaip atsakė #283 (`runtime_draining`). Tikrinama:
│ +  - run statusas „infra“, ne „failed“,
│ +  - artifacts (darbo failai) tuščias sąrašas,
│ +  - pasiūlymas GRĄŽINTAS į eilę (new), o ne palaidotas (blocked),
│ +  - commit'o nėra.
│ +"""
│ +import json
│ +import pathlib
│ +import subprocess
│ +import sys
│ +
│ +WT = pathlib.Path(sys.argv[1])
│ +sys.path.insert(0, str(WT / "agents"))
│ +import db  # noqa: E402
│ +
│ +n = db.upsert_proposals(sorted((WT / "agents" / "proposals").glob("*.json")))
│ +row = next(r for r in db.proposals(500) if int(r["id"]) == 16892)
│ +db.set_proposal_status(16892, "new", "")
│ +print(f"seed: pasiūlymų {n}; #16892 status={row['status']} target={row['target']}")
│ +print("head prieš:", subprocess.run(["git", "rev-parse", "HEAD"], cwd=WT,
│ +                                    capture_output=True, text=True).stdout.strip()[:7])
│ profiles/deepseek41flash/cache/scratch/fake-hermes291
│ @@ -0,0 +1,5 @@
│ +#!/usr/bin/env bash
│ +# Suklastotas hermes: atsako kaip 2026-11-14 #283 (modelio vartai uždaromi).
│ +echo "Hermes couldn't start the model connection: runtime_draining. Your message was not sent." >&2
│ +echo ""
│ +exit 1
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/seed291.py
│ @@ -17,6 +17,7 @@
│  sys.path.insert(0, str(WT / "agents"))
│  import db  # noqa: E402
│
│ +db.init()
│  n = db.upsert_proposals(sorted((WT / "agents" / "proposals").glob("*.json")))
│  row = next(r for r in db.proposals(500) if int(r["id"]) == 16892)
│  db.set_proposal_status(16892, "new", "")
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/seed291.py
│ @@ -19,7 +19,18 @@
│
│  db.init()
│  n = db.upsert_proposals(sorted((WT / "agents" / "proposals").glob("*.json")))
│ -row = next(r for r in db.proposals(500) if int(r["id"]) == 16892)
│ +rows = [r for r in db.proposals(500) if int(r["id"]) == 16892]
│ +if not rows:
│ +    print("seed: #16892 nėra šiame worktree — sukuriu iš tikros DB")
│ +    real = pathlib.Path("/home/zoltanas/workspace/suprask/agents/runs.db")
│ +    src = sqlite3.connect(real)
│ +    dst = sqlite3.connect(WT / "agents" / "runs.db")
│ +    src.backup(dst)
│ +    src.close()
│ +    dst.close()
│ +    db.init()
│ +    rows = [r for r in db.proposals(500) if int(r["id"]) == 16892]
│ +row = rows[0]
│  db.set_proposal_status(16892, "new", "")
│  print(f"seed: pasiūlymų {n}; #16892 status={row['status']} target={row['target']}")
│  print("head prieš:", subprocess.run(["git", "rev-parse", "HEAD"], cwd=WT,
│ profiles/deepseek41flash/cache/scratch/inspect291.py
│ @@ -0,0 +1,8 @@
│ +import sqlite3, sys, pathlib
│ +wt = pathlib.Path(sys.argv[1])
│ +c = sqlite3.connect(wt / "agents" / "runs.db")
│ +c.row_factory = sqlite3.Row
│ +r = dict(next(iter(c.execute("select id,role,status,duration_s,artifacts,detail,commit_sha from runs order by id desc limit 1"))))
│ +print("run:", r)
│ +p = dict(next(iter(c.execute("select id,status,note from proposals where id=16892"))))
│ +print("proposal:", p)
Nebaigta — verčia sustoti ties įrankių limitu. Sąžiningai: pakeitimai padaryti ir išmatuoti, bet dalis privalomų paleidimo veiksmų (dienoraštis, ataskaita, `check_agents.py`, blokuotų pasiūlymų atblokavimas) liko neatlikti.

KĄ RADAU (iš `system_report` ir `runs.db`)

1. Matuoklis melavo. `scripts/system_report.py:74` „nenaud.“ dalis sumuodavo tik `empty, conflict, rejected, timeout, skipped` — be `failed` ir `interrupted`. Todėl lentelė rodė kurejas 124 paleidimai / 81 publikuotas / **0 % nenaudingų**, nors 43 paleidimai buvo niekur nematomi. Po pataisymo tie patys duomenys rodo **35 %** (kurejas), 28 % (kalbų redaktorius), 12 % (tikrintojas).

2. Trys pasiūlymai dingo per 20 sekundžių. Paleidimai #281–#283 (09:12:30–09:12:50) krito per 5 s su „Gateway draining: update_paused“ / „runtime_draining“, bet kiekvienas „paskelbė“ po vieną failą — commit bf25b86, 622c29e, 0a6be1f — o tame commite buvo **tik jo paties žurnalas** `agents/log/kurejas-2026-11-14T0912.md`. Eilės apsauga (`MIN_ATTEMPT_S`, „0 failų = ne bandymas“) egzistavo, bet niekada negalėjo suveikti, nes žurnalas skaitomas kaip darbas. Pasekmė: #14726, #15045, #15581 → `blocked` (kapinės, kurių eilė nebeliečia).

KĄ PADARIAU

- `agents/run.py`: `INFRA_MARKERS` + `infra_reason()` (atskiria modelio vartų gedimą nuo turinio), `work_files()` (paleidimo ataskaita — ne darbas), `reopen_after_infra()` (pasiūlymas grąžinamas į `new`, po 3 bandymų — `blocked`), `_publish()` su vien žurnalu → `empty` be commit'o, `finish_run(artifacts=work)`.
- `scripts/kurejas_queue.py`: apsauga dabar pasiekiama — `run_status == "infra"` arba 0 darbo failų → pasiūlymas lieka `new`, eilė stabdoma.
- `scripts/system_report.py`: pilni statusų krepšeliai, `nenaud.` skaičiuoja `failed/infra/interrupted` ir `checked` ne patikros vaidmeniui, naujos `nepav.` ir `kita` stulpelio reikšmės.
- `dashboard/server.py`: `infra`/`interrupted` statusų spalva ir klasė.

PATIKRA (realiai paleista)

- `probe291_runner.py`: 12/12 OK (trys realios #281–#283 žinutės atpažįstamos; DB kopijoje: 1 bandymas → `new`, 2 → `new`, 3 → `blocked`; žurnalas ne darbas; `_publish` → `empty`, git neliestas).
- E2E izoliuotame git worktree su suklastotu `hermes`: run #292 → `status=infra`, `artifacts=[]`, `commit_sha=""`, #16892 `status=new`, „bandymas 1/3“; eilė (#293) → „Pasiūlymas lieka new, stabdau eilę“, ne `blocked`.
- `py_compile` 4 failai OK.

LIKO NEPADARYTA (privaloma pagal vaidmenį)

- `agents/system-journal.md` įrašas (Mačiau/Keičiau/Kodėl/Patikra) — **neįrašytas**.
- `agents/log/sistemos-architektas-2026-11-14T2023.md` ataskaita — **nesukurta**; `agents/state.json` neatnaujintas.
- `python3 scripts/check_agents.py`, `check_lessons.py`, `check_docs_facts.py` po pakeitimų — nepaleisti.
- Trys infrastruktūros klaida užblokuoti pasiūlymai (#14726, #15045, #15581) dar neatblokuoti į `new`.
- #5834 paliktas `blocked` (reikia žmogaus sprendimo); #16338, #16892, #7396, #4516, #5400, #5342, #5190, #4455, #4921, #16448 — sąmoningai neliesti.
- ROLES neliesti → `gen_timers.py` nereikalingas; dashboard HTML keistas, todėl `systemctl --user restart suprask-dashboard.service` ir `curl .../api/overview` dar neatlikti.

Darbinėje kopijoje neįkomituota: `agents/run.py`, `scripts/kurejas_queue.py`, `scripts/system_report.py`, `dashboard/server.py`. Worktree zondas — `~/.hermes/profiles/deepseek41flash/cache/scratch/wt291` (reikia `git worktree remove`).

## klaidos

```
session_id: local-fe274c20cdfb9a234b7126a205121df03a4079fc159b277b434023f248cff104
```
