# sistemos-architektas — 2026-11-20T2022

- paleidimas: #414 (manual)
- trukmė: 476s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/probe_status.py
│ @@ -0,0 +1,18 @@
│ +"""Zondas: kokie paleidimų statusai iš tikrųjų yra runs.db (2026-11-20)."""
│ +import sqlite3
│ +
│ +db = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +db.row_factory = sqlite3.Row
│ +print("-- statusai --")
│ +for r in db.execute("select status, count(*) c, max(started) last from runs group by status order by c desc"):
│ +    print(f"{r['status']:<14}{r['c']:>5}  {r['last']}")
│ +
│ +print("\n-- paleidimai be darbo failų (artifacts='[]'), paskutiniai 12 --")
│ +for r in db.execute("select id, role, status, duration_s, artifacts, substr(summary,1,90) s "
│ +                    "from runs where artifacts in ('[]','') order by id desc limit 12"):
│ +    print(f"#{r['id']:<5}{r['role']:<22}{r['status']:<12}{r['duration_s']:>4}s  {r['s']}")
│ +
│ +print("\n-- kurejas: tie patys, paskutiniai 15 --")
│ +for r in db.execute("select id, status, duration_s, substr(summary,1,80) s from runs "
│ +                    "where role='kurejas' and artifacts in ('[]','') order by id desc limit 15"):
│ +    print(f"#{r['id']:<5}{r['status']:<12}{r['duration_s']:>4}s  {r['s']}")
│ scripts/kurejas_queue.py
│ @@ -45,6 +45,13 @@
│  # ciklas, neįkeltas profilis). Toks paleidimas neturi sudeginti pasiūlymo —
│  # 2026-11-07 eilė per 40 s taip sudegino 37 pasiūlymus (3 s kiekvienas).
│  MIN_ATTEMPT_S = 120
│ +
│ +# Kiek kartų galima grąžinti pasiūlymą į eilę dėl ėjimų limito (`exhausted`).
│ +# Po tiek bandymų tai jau ne biudžeto atsitiktinumas, o per didelė užduotis
│ +# vienam paleidimui — toks įrašas blokuojamas peržiūrai, o ne sukasi amžinai.
│ +# Skaičius toks pat kaip `INFRA_MAX_ATTEMPTS` (`agents/run.py:166`), kad abi
│ +# nesėkmės rūšys elgtųsi vienodai.
│ +EXHAUST_MAX_ATTEMPTS = 3
│
│  # „tema“ tipo pasiūlymas, kurio failas JAU yra, reiškia, kad modulis jau
│  # sukurtas (pasiūlymas pasenęs) — jo kurti antrą kartą nereikia.
│ scripts/kurejas_queue.py
│ @@ -22,6 +22,7 @@
│  import argparse
│  import datetime as dt
│  import pathlib
│ +import re
│  import subprocess
│  import sys
│  import time
│ scripts/kurejas_queue.py
│ @@ -284,6 +284,30 @@
│                    f"{reason}. Pasiūlymas lieka new, stabdau eilę.")
│              break
│
│ +        if run_status == "exhausted" and no_work:
│ +            # Talpa, o ne turinys. Nuo 2026-11-19 `agents/run.py` skiria trečią
│ +            # nesėkmės rūšį: vaidmuo matavo ir skaitė, bet baigėsi ėjimai prieš
│ +            # įrašant failą. Toks paleidimas NEGALI blokuoti pasiūlymo — kitaip
│ +            # geras eilės įrašas prarandamas visam laikui dėl modelio biudžeto
│ +            # (LL-101 atvirkštinė pusė). Bet ir kartoti to paties su ta pačia
│ +            # riba neverta: stabdom eilę ir paliekam sprendimą architektui.
│ +            found = re.match(r"talpa (\d+)", (prop.get("note") or ""))
│ +            attempt = (int(found.group(1)) if found else 0) + 1
│ +            if attempt >= EXHAUST_MAX_ATTEMPTS:
│ +                db.set_proposal_status(
│ +                    int(prop["id"]), "blocked",
│ +                    f"talpa {attempt}: {EXHAUST_MAX_ATTEMPTS} paleidimai baigėsi ėjimų limitu "
│ +                    f"({duration}s, 0 darbo failų) — užduotis per didelė vienam paleidimui")
│ +                review += 1
│ +                print(f"   {EXHAUST_MAX_ATTEMPTS} bandymai iš eilės baigėsi ėjimų limitu — "
│ +                      f"#{prop['id']} blokuojamas peržiūrai (skaidyti užduotį).")
│ +                continue
│ +            db.set_proposal_status(int(prop["id"]), "new",
│ +                                   f"talpa {attempt}: ėjimų limitas per {duration}s, 0 darbo failų")
│ +            print(f"   Paleidimas baigėsi ėjimų limitu ({duration}s) — talpa, ne turinys. "
│ +                  f"Pasiūlymas lieka new (bandymas {attempt}/{EXHAUST_MAX_ATTEMPTS}), stabdau eilę.")
│ +            break
│ +
│          if run_status == "published":
│              # Darbas paskelbtas, bet pasiūlymas neuždarytas: tikslas nepaliestas
│              # arba jo nesutvarkė `mark_implemented`. Tai PERŽIŪROS, o ne eilės
│ scripts/system_report.py
│ @@ -68,7 +68,7 @@
│              "rejected": 0, "timeout": 0, "skipped": 0, "failed": 0, "infra": 0,
│              "interrupted": 0, "unpushed": 0, "checked": 0, "partial": 0,
│              "dry-run": 0, "running": 0, "other": 0, "paused": 0,
│ -            "duration_s": 0, "last": None,
│ +            "exhausted": 0, "duration_s": 0, "last": None,
│          })
│          st = (r.get("status") or "other").lower()
│          # Pristabdytas paleidimas NĖRA bandymas: jis įvyko tam, kad bėgiklis
│ scripts/system_report.py
│ @@ -44,7 +44,13 @@
│  # rezultatas (žr. `ROLES[…]["inspect"]`). Nekūrybiniam vaidmeniui `checked`
│  # reiškia tą patį kaip `empty`, todėl jis pridedamas atskirai.
│  USELESS = ("empty", "conflict", "rejected", "timeout", "skipped", "failed",
│ -           "infra", "interrupted", "unpushed", "other")
│ +           "infra", "interrupted", "unpushed", "other",
│ +           # `exhausted` (2026-11-19): vaidmuo dirbo, bet baigėsi ėjimai prieš
│ +           # įrašant failą. Paleidimas PRARASTAS, todėl jis priklauso šiai
│ +           # sumai — kitaip vaidmuo, kuris visada trenkiasi į ėjimų ribą,
│ +           # atrodytų su 0 % nenaudingų. Bet priežastis kita, todėl rodoma
│ +           # atskira kolona `talpa` (`kurejas_queue.py` grąžina pasiūlymą į eilę).
│ +           "exhausted")
│
│
│  def inspect_roles() -> set[str]:
│ scripts/system_report.py
│ @@ -321,13 +321,16 @@
│      pause_note = f" (dar {paused_n} pristabdyta — žr. žemiau)" if paused_n else ""
│      print(f"\nPaleidimai: {len(rows)}{pause_note}")
│      print(f"{'vaidmuo':<24}{'paleid.':>8}{'publ.':>7}{'tušti':>7}{'konfl.':>7}{'atm.':>6}"
│ -          f"{'nepav.':>7}{'kita':>6}{'vid.m':>7}{'nenaud.':>9}{'prist.':>7}")
│ +          f"{'nepav.':>7}{'talpa':>7}{'kita':>6}{'vid.m':>7}{'nenaud.':>9}{'prist.':>7}")
│      for role, c in sorted(per

… PRALEISTA 8546 SIMBOLIŲ IŠ 26546 (įrankių išklotinės) — visa ataskaita: agents/work/sistemos-architektas/00414/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

laitis paverstas problema", len(found) == 1, "; ".join(found) or "nepastebėtas")
│ +shutil.rmtree(SCRATCH)
│ +expect("šablonas išvalytas", not SCRATCH.exists())
│ +
│ +print("\n== 3. system_report ==")
│ +out = subprocess.run([sys.executable, str(ROOT / "scripts" / "system_report.py")],
│ +                     cwd=ROOT, capture_output=True, text=True).stdout
│ +head = next((ln for ln in out.splitlines() if ln.startswith("vaidmuo")), "")
│ +meta = next((ln for ln in out.splitlines() if ln.strip().startswith("sistemos-architektas")
│ +             or ln.strip().startswith("metodininkas")), "")
│ +expect("lentelėje yra `talpa` stulpelis", "talpa" in head, head)
│ +row = next((ln for ln in out.splitlines() if ln.strip().startswith("metodininkas")), "")
│ +expect("metodininkas #394 rodomas talpos stulpelyje",
│ +       bool(row) and row.split()[-6:-5] == ["1"], row)
│ +expect("paaiškinama, kas yra talpa",
│ +       "talpa = baigėsi ėjimų limitas" in out)
│ +
│ … omitted 8 diff line(s) across 1 additional file(s)/section(s)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/zond414.py
│ @@ -72,7 +72,7 @@
│  expect("lentelėje yra `talpa` stulpelis", "talpa" in head, head)
│  row = next((ln for ln in out.splitlines() if ln.strip().startswith("metodininkas")), "")
│  expect("metodininkas #394 rodomas talpos stulpelyje",
│ -       bool(row) and row.split()[-6:-5] == ["1"], row)
│ +       bool(row) and row.split()[-5:-4] == ["1"], row)
│  expect("paaiškinama, kas yra talpa",
│         "talpa = baigėsi ėjimų limitas" in out)
│
│ agents/README.md
│ @@ -52,6 +52,18 @@
│  3. įrašo žurnalą, DB įrašą (statusas, trukmė, pakeisti failai), atnaujina `state.json`;
│  4. suindexuoja `agents/proposals/*.json` į DB.
│
│ +**Paleidimo būsenos** (`runs.db`, `status`). Statuso tiesa yra DB, o ne modelio išėjimo kodas (LL-10), todėl kiekvienas skaitytojas (`system_report.py`, `kurejas_queue.py`, `kalbu_queue.py`) turi turėti savo šaką kiekvienai reikšmei — nauja būsena be skaitytojo tyliai nukrenta į `other` arba į `blocked`:
│ +
│ +| būsena | ką reiškia | ką daro eilė |
│ +|---|---|---|
│ +| `published` | failai paskelbti | pasiūlymas `done` |
│ +| `empty` | vaidmuo neturėjo ką veikti | pasiūlymas lieka `new` / peržiūra |
│ +| `infra` | modelio vartai neatsakė (0 darbo failų, trumpas paleidimas) | `new` iki `INFRA_MAX_ATTEMPTS`, paskui `blocked` |
│ +| `exhausted` | vaidmuo dirbo, bet baigėsi ėjimai prieš įrašant failą | `new` iki `EXHAUST_MAX_ATTEMPTS`, paskui `blocked` „skaidyti užduotį“; išėjimo kodas 75 |
│ +| `failed` / `rejected` / `conflict` / `timeout` | turinio arba git gedimas | `blocked` |
│ +
│ +`system_report.py` rodo `exhausted` atskira kolona `talpa`: paleidimas prarastas (todėl įskaičiuojamas į „nenaud.“), bet priežastis yra biudžetas, o ne tuščias darbas.
│ +
│  Užraktai: kiekvienas vaidmuo turi savo `.run.<vaidmuo>.lock`, todėl kūrėjo eilė neblokuoja kitų agentų; git operacijos (commit + merge + push) serializuojamos atskiru `.git.lock`. Du skirtingi vaidmenys vis tiek dirba viename darbiniame kataloge, todėl prieš paleidimą bėgiklis sutvarko paliktus pakeitimus (`[sistema]` commit'as).
│
│  ## Pasiūlymai
│ research/wiki/guidelines/pamokos.md
│ @@ -924,5 +924,13 @@
│  - **Taisyklė:** kiekvienas diagnostinis laukas, kuris reiškia defektą, privalo būti toje pačioje aibėje, iš kurios skaičiuojamas rc, arba turėti aiškiai atskirą paskirtį, įvardytą toje pačioje eilutėje („informacija, ne klaida“). Nekompromisuojama forma: `problems.append(...)` toje pačioje vietoje, kur randamas įrašas, o ne `print(...)` šalia. Pataisa laikoma įrodyta tik tada, kai paleistas zondas duoda rc 1 su defektu ir rc 0 be jo.
│  - **Patikra:** veidrodis su 52 failais ir 51 indekso įrašu: `check_registry.py --grade 1` → rc 1, `PROBLEMŲ: 1`, eilutė „NAŠLAITIS: 52-tikrinimo-modulis.json yra, bet index.json įrašo nėra“; `check_published.py` → rc 1, `verdict.label` „1 modulio failo be indekso įrašo“, `orphan_files` su failo keliu. Neigiama kontrolė (failas iškeltas, `grades.json` 51) → abu rc 0, `orphan_files: []`. Bendrai: `grep -n "print(" scripts/check_*.py` ir kiekvienam spausdinamam defektui patikrinti, ar jis patenka į `problems` / rc.
│
│ -
│ -
│ +## LL-129 — Būsena, kurią įrašo vienas failas, o kitas jos nepažįsta
│ +
│ +- **Simptomas:** 2026-11-19 (#389) `agents/run.py` atskyrė trečią nesėkmės rūšį `exhausted` (vaidmuo dirbo, bet baigėsi ėjimai prieš įrašant failą). Kitą dieną tokia būsena jau buvo reali (`runs.db` #394, metodininkas, 905 s), o ją skaitantys įrankiai jos nežinojo: `system_report.py` rodė 0 „talpa“ ir priskyrė paleidimą prie `other`, o `kurejas_queue.py` būtų nuėjęs į paskutinę šaką (`run_status == "published"` netinka, `no_work` tinka, trukmė 905 s > `MIN_ATTEMPT_S`) ir pažymėjęs gerą pasiūlymą `blocked` — kapinėse, iš kurių eilė nebeleidžia. Pati pataisa buvo teisinga; jos skaitytojai liko seni.
│ +- **Priežastis:** būsenos žodynas gyveno rašytojuje (`agents/run.py`), o kiekvienas skaitytojas (`system_report.py`, `kurejas_queue.py`, `kalbu_queue.py`) turi savo sąrašą ir savo `else`. Kai atsiranda nauja reikšmė, `else` jos neišskiria — ji arba susilieja su `other` (statistikoje tylu), arba nukrenta į paskutinę šaką (eigoje — `blocked`). Tai LL-128 šeima (skaičiavimas atliktas, bet rezultatas nepatenka į sprendimą), tik objektyvas — **būsenos žodynas**, ne vienas laukas.
│ +- **Taisyklė:** nauja būsena pridedama tame pačiame darbe kaip ir jos skaitytojai: `grep -rn "published\|infra\|empty" scripts/ agents/` prieš uždarant failą ir kiekviename skaitytojuje aiški šaka. Ataskaitoje kiekviena būsena turi savo koloną (ne „kita“), o eilėje skaitytojas be šakos negali eiti į `blocked` — paskutinė šaka yra sprendimas, ne numatytoji reikšmė. Neregistruota būsena yra paleidimo defektas, ne statistikos niuansas.
│ +- **Patikra:** zondas be repo pakeitimų (`scratch/zond414.py`): `capacity_verdict("")` → `requeue #1`, `"talpa 1: …"` → `requeue #2`, `"talpa 2: …"` → `block #3` (5 atvejai / 5 žali); `system_report.py` lentelėje stulpelis `talpa` ir realus #394 eilutėje `metodininkas … talpa 1`, `runs_summary(7)["metodininkas"]` → `exhausted=1`, `useless=1`. Bendrai: po kiekvienos naujos būsenos paleisti `python3 scripts/system_report.py` ir patikrinti, kad jos skaičius yra **savo** stulpelyje — jei „kita“ padidėjo, skaitytojas neatpažįsta.
│ +
│ +
│ +
│ +
│ profiles/deepseek41flash/cache/scratch/zond414_integr.py
│ @@ -0,0 +1,58 @@
│ +"""Integracinis zondas: ar `kurejas_queue.main()` tikrai grąžina pasiūlymą į eilę?
│ +
│ +`capacity_verdict()` patikrintas atskirai, bet šaka gyvena `main()` viduje.
│ +Šis zondas pakeičia `run_one()`, `queue()` ir DB įrašymą — jokio paleidimo, jokio
│ +repo pakeitimo, jokio `runs.db` įrašo — ir tikrina, KĄ eilė padarytų su
│ +`exhausted` paleidimu: ar pasiūlymas lieka `new`, ar eilė sustoja, ar nebuvo
│ +antras bandymas tame pačiame paleidime.
│ +"""
│ +from __future__ import annotations
│ +
│ +import pathlib
│ +import sys
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +sys.path.insert(0, str(ROOT / "scripts"))
│ +sys.path.insert(0, str(ROOT / "agents"))
│ +
│ +import kurejas_queue as q  # noqa: E402
│ +
│ +calls: list[tuple[int, str, str]] = []
│ +runs: list[int] = []
│ +pending = [{"id": 111, "priority": "high", "title": "pirmas", "note": "", "target": "content/x.json"},
│ +           {"id": 222, "priority": "high", "title": "antras", "note": "", "target": "content/y.json"}]
│ +
│ +
│ +def fake_queue():
│ +    return list(pending)
│ +
│ +
│ +def fake_run_one(pid):
│ +    runs.append(pid)
│ +    return "new", "talpa: ...", {"status": "exhausted", "duration_s": 905, "artifacts": "[]"}
│ +
│ +
│ +def fake_set(pid, status, note=""):
│ +    calls.append((int(pid), status, note))
│ +
│ +
│ +q.queue = fake_queue
│ +q.run_one = fake_run_one
│ +q.db.set_proposal_status = fake_set
│ +q.system_pause.is_paused = lambda: (False, None)
│ +sys.argv = ["kurejas_queue.py", "--no-triage", "--max-items", "5"]
│ +
│ +rc = q.main()
│ +
│ +print("\n-- rezultatas --")
│ +print("paleidimai:", runs)
│ +print("DB įrašymai:", calls)
│ +ok = (
│ +    rc == 0
│ +    and runs == [111]                                   # antras pasiūlymas neliestas
│ +    and len(calls) == 1
│ +    and calls[0][1] == "new"                            # NE blocked
│ +    and calls[0][2].startswith("talpa 1:")
│ +)
│ +print("ZONDAS:", "ŽALIAS" if ok else "RAUDONAS")
│ +sys.exit(0 if ok else 1)
**ĮGYVENDINTA: #30960**

Darbas baigtas. Šis paleidimas uždaro du dalykus: savo paties 2026-11-19 paliktą defektą (`exhausted` be skaitytojų) ir CI spragą, kurią publikavimo agentas paliko sąmoningai.

MATAVIMAS (prieš → po, ta pati 7 d. atkarpa, 138 paleidimai)

Prieš (20:22): `system_report.py` neturėjo talpos stulpelio; `runs.db` #394 (metodininkas, 905 s, 0 darbo failų) buvo rodomas kaip „kita“. `kurejas_queue.py` tokiam paleidimui būtų ėjęs į paskutinę šaką ir pažymėjęs pasiūlymą `blocked`. Sisteminių pasiūlymų 14.
Po (20:29): lentelėje stulpelis `talpa`, eilutė „metodininkas 6 5 0 0 0 0 1 0 10.7 17% 1“ — talpa=1, kita=0, nenaud. 17 % (paleidimas įskaičiuotas kaip prarastas). `runs_summary(7)["metodininkas"] → exhausted=1, useless=1`. Sisteminių 14 → 13 (kai bėgiklis uždarys #30960).

KĄ KEIČIAU (8 failai, visi mano vaidmens ribose)

- scripts/kurejas_queue.py — `capacity_verdict()` + `exhausted` šaka prieš `blocked`: pasiūlymas grąžinamas į `new` su „talpa N“, eilė stabdoma; po 3 bandymų (kaip `INFRA_MAX_ATTEMPTS`) blokuojamas su „skaidyti užduotį“.
- scripts/system_report.py — `exhausted` savo stulpelis `talpa`, įskaičiuotas į nenaudingus, paaiškinimas po lentele.
- agents/run.py — išėjimo kodas `exhausted` → 75 (EX_TEMPFAIL), atskirtas nuo lūžio; statuso tiesa lieka DB.
- scripts/kalbu_queue.py — ta pati šaka (brolio kelias turėjo tą patį defektą): `exhausted` nėra „nepavyko“, modulis lieka eilėje.
- agents/README.md — būsenų lentelė „ką daro eilė“.
- .github/workflows/validate.yml — žingsnis „Registrų sankirta“ (`check_registry.py`) iškart po turinio validacijos, kaip siūlė pasiūlymas (#30960).
- research/wiki/guidelines/pamokos.md — LL-129 „Būsena, kurią įrašo vienas failas, o kitas jos nepažįsta“.
- agents/system-journal.md — įrašas #414 (Mačiau / Keičiau / Kodėl / Patikra).

PATIKRA (tikra išvestis)

- Integracinis zondas `scratch/zond414_integr.py` (monkeypatch, jokio paleidimo, jokio DB įrašo): `paleidimai: [111] · DB įrašymai: [(111, 'new', 'talpa 1: ėjimų limitas per 905s, 0 darbo failų')]` → ŽALIAS; antras pasiūlymas neliestas, eilė sustojo, `blocked` neįvyko.
- Vienetinis zondas `scratch/zond414.py` 11/11: `capacity_verdict` penki atvejai (`""`→requeue #1, `talpa 1`→requeue #2, `talpa 2`→block #3, `talpa 9`→block #10, svetima pastaba→requeue #1); `check_grade` švari kopija 0 problemų, su našlaičiu → „NAŠLAITIS: 99-zondas-naslaitis.json yra, bet index.json įrašo nėra“, šablonas išvalytas.
- Vartai: `check_agents.py` rc 0 (1 įspėjimas — 8 seni sisteminiai >3 d.; #389 dienoraščio įspėjimas šiuo įrašu išnyko), `check_lessons.py` 129 įrašai / 4 laukai rc 0, `check_registry.py` 51 modulis / našlaičiai 0 / 0 problemų rc 0, `check_docs_facts.py` 0/0 rc 0, `validate_content.py` 0/0, `check_language.py --grade 1 --strict` 0/0, `check_ui.py` 0/0, `check_audio.py` 743 tekstai / 1 486 įrašai, `check_art.py` ✔.
- Grafikai neliesti (`ROLES` nepakeistas), todėl `gen_timers.py` nereikalingas. `git status` — lygiai tie 8 failai, jokių paliktų šiukšlių.

NEIŠSPRĘSTA SĄMONINGAI

- #22168 (kurejas_queue.py): pirmoji dalis reikalauja priešpaleidimo patikros `agents/run.py --proposal` kelyje, ne tik eilėje — tai atskiras pakeitimas, šįkart neliestas.
- #4455 jau įgyvendintas commit'e f662b27 (`REPORT_MAX`, `cap_report`, check_agents vartai), bet eilėje kabo `new`: uždarymas reikalauja tikslo failo pakeitimo tame pačiame commit'e, o deklaruoti jį šiandien būtų LL-36. Nepriskyriau.
- Kiti 12 sisteminių pasiūlymų neliesti (eilė judėjo per #30960). `agents/scope.json`, `content/`, `assets/js/sims/` neliesti.

## klaidos

```
session_id: local-7ecdc8d937e4b94a0d7af1fb93ae8fc86517b562f7d97d8476cdad92fccda724
```
