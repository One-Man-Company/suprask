# sistemos-architektas — 2026-11-24T2032

- paleidimas: #516 (manual)
- trukmė: 2741s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ agents/run.py
│ @@ -170,6 +170,24 @@
│  # kaip pakeistas failas, 5 s gedimas atrodė kaip „paskelbta 1 failų“, o eilės
│  # apsauga („0 failų = ne bandymas“) niekada negalėjo suveikti.
│  LOG_PREFIX = "agents/log/"
│ +
│ +# Laukimo užraktui ribos (#516). Viena bendra 900 s riba buvo trumpesnė už tai,
│ +# ko laukiama: eilės vaidmens vienas darbas trunka iki 2098 s (p95, `runs.db`
│ +# 2026-11-24), o `kurejas` eilė laiko užraktą dar ilgiau. Todėl paleidimas,
│ +# atėjęs eilės lango metu, dūsdavo po 15 min ir visas jo dienos darbas dingdavo:
│ +# 6 `skipped` paleidimai, 5 iš jų — būtent `Užraktas užimtas ilgiau nei 900 s`.
│ +# `kritikas` (14:00) krisdavo į `kalbu-redaktorius` eilę (13:10, iki 4 modulių)
│ +# kiekvieną antradienį/penktadienį — 2 iš 7 paleidimų = 28 % jo darbo.
│ +#
│ +# Dabar laukiama tiek, kiek realiai gali trukti tai, ko laukiama: paprastas
│ +# rašymas — 900 s, o jei užraktą laiko EILĖS vaidmuo (jo paleidimai ilgi, bet
│ +# baigtiniai) — `LOCK_WAIT_QUEUE`. Skaičius paimtas su rezervu virš p95.
│ +LOCK_WAIT_DEFAULT = 900
│ +LOCK_WAIT_QUEUE = 2700
│ +
│ +# Kiek laiko žymė `agents/.wait.<role>` laikoma galiojančia. Žymė atnaujinama
│ +# kas 10 s, kol paleidimas laukia; pasenusi (lūžusio proceso) ignoruojama.
│ +WAIT_MARKER_FRESH_S = 300
│
│  # Dokumentai, kuriuose kiekvienas modulis keičia skaičių (#5400). Juos perrašo
│  # `scripts/sync_docs_facts.py`; bėgiklis prideda juos prie publikuojamų failų,
│ agents/run.py
│ @@ -1448,7 +1448,6 @@
│
│
│  def active_role_locks(exclude: str = "") -> list[str]:
│ -    """Vaidmenys, kurių paleidimas šiuo metu vyksta (jų užraktas laikomas).
│
│      Užraktas `agents/.run.<role>.lock` laikomas visą paleidimą (nuo `main()`
│      iki `finally`), todėl jo būsena — vienintelis patikimas požymis, kad kitas
│ agents/run.py
│ @@ -1448,6 +1448,7 @@
│
│
│  def active_role_locks(exclude: str = "") -> list[str]:
│ +    """Vaidmenys, kurių paleidimas šiuo metu vyksta (jų užraktas laikomas).
│
│      Užraktas `agents/.run.<role>.lock` laikomas visą paleidimą (nuo `main()`
│      iki `finally`), todėl jo būsena — vienintelis patikimas požymis, kad kitas
│ agents/run.py
│ @@ -1490,7 +1490,80 @@
│      return active
│
│
│ -def ensure_clean(role: str) -> str:
│ +def queue_roles() -> set[str]:
│ +    """Vaidmenys, kurių paleidimas yra EILĖ (vienas procesas, daug darbų)."""
│ +    return {r for r, c in ROLES.items() if c.get("queue")}
│ +
│ +
│ +def role_wait_marker(role: str) -> Path:
│ +    """Žymė `agents/.wait.<role>`: šis vaidmuo šiuo metu laukia užrakto.
│ +
│ +    Reikalinga tam, kad eilės vaidmuo (kuris laiko užraktą ilgiausiai) galėtų
│ +    UŽLEISTI kelią grafikiniui vaidmeniui. Be šios žymės abu procesai lenktyniauja
│ +    `flock(LOCK_NB)` kas 10 s ir laimi tas, kuris anksčiau paklausė — taip
│ +    `kritikas` (14:00) pralaimėdavo `kalbu-redaktorius` eilės darbams, o po
│ +    900 s būdavo paleidžiamas kaip `skipped` (2026-11-24 #511, 2026-11-20 #408).
│ +    """
│ +    return AGENTS / f".wait.{role}"
│ +
│ +
│ +def mark_waiting(role: str) -> None:
│ +    """Įrašo/atnaujina laukimo žymę (kviečiama kas 10 s, kol laukiama)."""
│ +    try:
│ +        role_wait_marker(role).write_text(dt.datetime.now().isoformat(timespec="seconds"),
│ +                                          encoding="utf-8")
│ +    except OSError:
│ +        pass
│ +
│ +
│ +def clear_waiting(role: str) -> None:
│ +    try:
│ +        role_wait_marker(role).unlink(missing_ok=True)
│ +    except OSError:
│ +        pass
│ +
│ +
│ +def waiting_roles(exclude: str = "") -> list[str]:
│ +    """Kiti vaidmenys, kurie DABAR laukia užrakto (žymė šviežia).
│ +
│ +    Pasenusi žymė (procesas lūžo, kol laukė) ignoruojama — kitaip eilė amžinai
│ +    užleistų kelią vaidmeniui, kurio nebėra.
│ +    """
│ +    now = dt.datetime.now().timestamp()
│ +    found: list[str] = []
│ +    for other in sorted(ROLES):
│ +        if other == exclude:
│ +            continue
│ +        path = role_wait_marker(other)
│ +        try:
│ +            if now - path.stat().st_mtime <= WAIT_MARKER_FRESH_S:
│ +                found.append(other)
│ +        except OSError:
│ +            continue
│ +    return found
│ +
│ +
│ +def yield_to_waiting(role: str, max_wait_s: int = 1800) -> str:
│ +    """Eilės vaidmuo palaukia, kol grafikinis vaidmuo paims užraktą.
│ +
│ +    Kviečiama tarp eilės darbų (užrakto nelaikant). Grąžina žmogui skaitomą
│ +    priežastį arba tuščią eilutę, jei užleisti nereikėjo. Tai vienintelė vieta,
│ +    kur eilė savanoriškai atsisako pirmumo: jos darbas gali laukti kito lango,
│ +    o grafikinis vaidmuo (kritikas, architektas) kito šanso šiandien neturi.
│ +    """
│ +    others = waiting_roles(exclude=role)
│ +    if not others:
│ +        return ""
│ +    started = time.time()
│ +    while others and time.time() - started < max_wait_s:
│ +        time.sleep(5)
│ +        others = waiting_roles(exclude=role)
│ +        if not others:
│ +            # Užraktas atsilaisvino — duodam laukiančiam jo paimti.
│ +            time.sleep(15)
│ +            return "užleista laukiančiam: " + ", ".join(others or [])
│ +    return ("laukiama " + ", ".join(others)) if others else ""
│ +
│ … omitted 3 diff line(s) across 1 additional file(s)/section(s)
│ agents/run.py
│ @@ -1554,16 +1554,18 @@
│      others = waiting_roles(exclude=role)
│      if not others:
│          return ""
│ +    who = ", ".join(others)
│      started = time.time()
│ -    while others and time.time() - started < max_wait_s:
│ +    while waiting_roles(exclude=role) and time.time() - started < max_wait_s:
│          time.sleep(5)
│ -        others = waiting_roles(exclude=role)
│ -        if not others:
│ -            # Užraktas atsilaisvino — duodam laukiančiam jo paimti.
│ -            time.sleep(15)
│ -            return "užleista laukiančiam: " + ", ".join(others or [])
│ -    return ("laukiama " + ", ".join(others)) if others else ""
│ -
│ +    if not waiting_roles(exclude=role):
│ +        # Užraktas atsilaisvino — duodam 

… PRALEISTA 31009 SIMBOLIŲ IŠ 49009 (įrankių išklotinės) — visa ataskaita: agents/work/sistemos-architektas/00516/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

 "--format=%ct", "--", rel],
│ +                                 cwd=ROOT, capture_output=True, text=True, timeout=20)
│ +            stamp = out.stdout.strip()
│ +            if stamp.isdigit() and int(stamp) > created:
│ +                changed_after.append(rel)
│ +        except (OSError, subprocess.SubprocessError):
│ +            continue
│ +    if not found_in:
│ +        return {"prove": False, "why": f"šablono nėra nė viename tikslо faile: {', '.join(paths)}"}
│ +    if not changed_after:
│ +        return {"prove": False,
│ +                "why": f"tikslo failas nepakeistas po {prop.get('created')} — "
│ +                       f"įrodymas galėjo būti ir prieš prašymą"}
│ +    return {"prove": True, "files": found_in, "changed_after": changed_after,
│ +            "why": f"šablonas rastas: {', '.join(found_in)}; failas keistas po prašymo"}
│ +
│ +
│  def main() -> int:
│      ap = argparse.ArgumentParser()
│      ap.add_argument("--apply", action="store_true", help="įrašo pakeitimus į agents/runs.db")
│      ap.add_argument("--json", action="store_true", help="mašininė išvestis")
│ +    ap.add_argument("--prove", action="append", default=[], metavar="ID=REGEX",
│ +                    help="uždaryti pasiūlymą, jei REGEX jau yra tikslo faile (kartojamas)")
│      args = ap.parse_args()
│
│      db.init()
│ scripts/queue_repair.py
│ @@ -179,6 +179,41 @@
│      args = ap.parse_args()
│
│      db.init()
│ +
│ +    # ── Antra rūšis: jau įgyvendinti, bet neuždaryti pasiūlymai (#4455, #4516)
│ +    proven: list[dict] = []
│ +    for spec in args.prove:
│ +        if "=" not in spec:
│ +            proven.append({"id": spec, "prove": False,
│ +                           "why": "formatas turi būti ID=REGEX"})
│ +            continue
│ +        raw_id, pattern = spec.split("=", 1)
│ +        try:
│ +            pid = int(raw_id.strip().lstrip("#"))
│ +        except ValueError:
│ +            proven.append({"id": raw_id, "prove": False, "why": "numeris ne skaičius"})
│ +            continue
│ +        row = next((r for r in db.proposals(1000) if int(r["id"]) == pid), None)
│ +        if not row:
│ +            proven.append({"id": pid, "prove": False, "why": "pasiūlymo nėra"})
│ +            continue
│ +        verdict = prove_done(row, pattern)
│ +        proven.append({"id": pid, "title": row.get("title"), **verdict})
│ +        if verdict["prove"] and args.apply:
│ +            db.set_proposal_status(pid, "done",
│ +                                   f"įrodyta, kad jau yra: {verdict['files'][0]} "
│ +                                   f"({pattern[:40]}) — darbas padarytas kitame commite")
│ +            proven[-1]["closed"] = True
│ +
│ +    if proven and not args.json:
│ +        print(f"Jau įgyvendinti (‑‑prove): {sum(1 for v in proven if v['prove'])} "
│ +              f"iš {len(proven)}")
│ +        for v in proven:
│ +            mark = "→ done" if v["prove"] else "  likti new"
│ +            print(f"  #{v['id']} {mark}: {v['why']}")
│ +            if v.get("closed"):
│ +                print("      uždaryta agents/runs.db")
│ +
│      verdicts = []
│      for prop in db.proposals(1000, status="blocked"):
│          diag = diagnose(prop)
│ @@ -187,7 +222,7 @@
│      fixable = [v for v in verdicts if v["repair"]]
│      if args.json:
│          print(json.dumps({"checked": len(verdicts), "fixable": fixable,
│ -                          "apply": args.apply}, ensure_ascii=False))
│ +                          "proven": proven, "apply": args.apply}, ensure_ascii=False))
│          if not fixable:
│              return 0
│      else:
│ scripts/kurejas_queue.py
│ @@ -392,6 +392,22 @@
│                    f"pasiūlymas lieka new, stabdau eilę (naujas laiko limitas 4× didesnis).")
│              break
│
│ +        if run_status == "skipped":
│ +            # Užraktas buvo užimtas ilgiau nei laukimo riba — paleidimas net
│ +            # nepradėjo darbo. Tai NĖRA pasiūlymo kaltė ir ne turinio gedimas:
│ +            # 2026-11-24 #47139 taip virto `blocked` („paleidimas nepavyko:
│ +            # kurejas: užraktas užimtas ilgiau nei 900 s"), nors modulio niekas
│ +            # net nebandė liesti — ilgą užraktą laikė architekto paleidimas.
│ +            # `blocked` nebeliečia, tad geras pasiūlymas būtų prarastas visam
│ +            # laikui. Grąžiname į `new` ir stabdome eilę: kol užraktas toks
│ +            # ilgas, kitas darbas tik pakartotų tą patį.
│ +            db.set_proposal_status(int(prop["id"]), "new",
│ +                                   f"nebandyta: užraktas užimtas >{duration}s — "
│ +                                   f"pasiūlymas nepradėtas, lieka eilėje")
│ +            print(f"   Užraktas buvo užimtas visą laukimą ({duration}s) — pasiūlymas "
│ +                  f"net nebandytas, lieka new. Stabdau eilę.")
│ +            break
│ +
│          if run_status == "published":
│              # Darbas paskelbtas, bet pasiūlymas neuždarytas: tikslas nepaliestas
│              # arba jo nesutvarkė `mark_implemented`. Tai PERŽIŪROS, o ne eilės
│ docs/AGENTU-SISTEMA.md
│ @@ -21,8 +21,21 @@
│  pakeitimus (taip atsitiko commit'e `5b58476`). Todėl:
│
│  - `agents/.run.lock` imamas **visiems vaidmenims** viso paleidimo metu;
│ -- antrasis agentas **laukia** (`SUPRASK_LOCK_WAIT`, numatyta 900 s), o ne
│ -  praleidžia — kitaip jis tyliai praranda savo dienos paleidimą;
│ +- antrasis agentas **laukia**, o ne praleidžia — kitaip jis tyliai praranda
│ +  savo dienos paleidimą. Laukimo riba priklauso nuo to, kas užraktą laiko:
│ +  paprastas vaidmuo — `LOCK_WAIT_DEFAULT` (900 s), **eilės vaidmuo**
│ +  (`kurejas`, `kalbu-redaktorius`) — `LOCK_WAIT_QUEUE` (2700 s), nes vienas
│ +  eilės darbas trunka iki 2098 s (p95). `SUPRASK_LOCK_WAIT` visada laimi.
│ +  Riba iki 2026-11-24 buvo viena (900 s), todėl grafinis vaidmuo, atėjęs eilės
│ +  lango metu, dūsdavo po 15 min (`kritikas` neteko 2 iš 7 paleidimų);
│ +- laukdamas vaidmuo rašo žymę `agents/.wait.<role>` (šviežumas 300 s), o eilės
│ +  procesas tarp savo darbų ją pamato ir **sąmoningai užleidžia vietą**
│ +  (`yield_to_waiting()`): eilė turi daug langų, grafinis vaidmuo — vieną;
│ +- kas laiko užraktą, nustatoma iš `/proc/locks` (PID) ir
│ +  `/proc/<pid>/cmdline` (vaidmuo) — `lock_holder_role()`. Nuo 2026-11-08 iki
│ +  2026-11-24 čia buvo skaitomi `agents/.run.<role>.lock`, kurių niekas
│ +  nebeužrakina, todėl atsakymas visada buvo tuščias, o `RoleWatch` nematė
│ +  svetimo vaidmens (LL-184);
│  - git operacijos papildomai saugomos trumpu `.git.lock`;
│  - failas, kuris buvo nešvarus **prieš** paleidimą, niekada nepatenka į to
│    paleidimo commit'ą.
│ docs/AGENTU-SISTEMA.md
│ @@ -101,9 +101,32 @@
│  | `rejected` | validacija nepraėjo, pakeitimai atmesti (žr. `validation`) |
│  | `conflict` | susidūrė su `origin/main`, reikia žmogaus |
│  | `unpushed` | commit yra, bet push nepavyko |
│ -| `failed` / `timeout` | modelio klaida arba laikas baigėsi |
│ +| `failed` / `timeout` | modelio klauda arba laikas baigėsi |
│ +| `skipped` | užraktas buvo užimtas visą laukimo ribą — paleidimas net neprasidėjo |
│ +| `exhausted` | baigėsi ėjimų biudžetas PIRMS įrašant failą (talpa, ne turinys) |
│
│  Anksčiau statusas priklausė nuo `exit` kodo, todėl „partial“ atrodė kaip sėkmė, nors repo nepasikeitė.
│ +
│ +`skipped` **nėra** turinio gedimas: jo negali sukelti pasiūlymas, ir
│ +`scripts/kurejas_queue.py` tokio paleidimo nebeblokuoja — pasiūlymas grąžinamas
│ +į `new` (2026-11-24 #47139 buvo prarastas būtent taip).
│ +
│ +## Jau įgyvendinti, bet neuždaryti pasiūlymai
│ +
│ +Pasiūlymas uždaromas tik tada, kai jo tikslo failas pakeistas TAME PAČIAME
│ +commite (apsauga nuo #486). Jei darbas padarytas vėliau, o numeris nebuvo
│ +deklaruotas (`ĮGYVENDINTA: #N`), įrašas lieka `new` amžinai ir
│ +`check_agents.py` kiekvieną paleidimą įspėja apie „laukiančius >3 d.“.
│ +Patikrinti ir uždaryti su įrodymu:
│ +
│ +```bash
│ +python3 scripts/queue_repair.py --prove '4455=REPORT_MAX'          # sausa eiga
│ +python3 scripts/queue_repair.py --apply --prove '4455=REPORT_MAX'  # uždaro
│ +```
│ +
│ +Uždaroma tik su trimis įrodymais: būsena dar `new`, tikslo failas keistas PO
│ +pasiūlymo sukūrimo, ir `REGEX` randamas dabartiniame faile. Be vieno iš jų
│ +atsisakoma ir pasakoma kodėl.
│
│  ## Rankinis įstrigusio darbo paskelbimas
│
Paleidimas baigtas. Commit `5fe3e90`, išstumtas į `origin/agent/publikavimo-agentas-2026-11-24`.

**Ką mačiau (prieš)** — `scripts/system_report.py`: 179 paleidimai/7 d. Nenaudingi: `kritikas` 56 % (2 empty + 2 skipped), `dizaineris` 33 %, `simuliaciju-inzinierius` 28 %, `kalbu-redaktorius` ir `ideator` po 22 %. 212 pasiūlymų, 23 sisteminiai `new`, seniausias 16 d., `check_agents` įspėjo apie 11 laukiančių >3 d.

Ištyrus visus 6 `skipped` paleidimus: 5 baigėsi po lygiai 900 s (riba), o laikytojas buvo eilės vaidmuo (1775–1800 s). Eilės darbo trukmė `runs.db`: mediana 816 s, p95 **2098 s** — laukimo riba buvo trumpesnė už tai, ko laukiama.

**Trys rasti defektai, ne vienas:**

1. **Laukimo riba viena visiems.** `SUPRASK_LOCK_WAIT=900`, nors eilės darbas trunka iki 2098 s (p95) → `kritikas` (14:00) krisdavo į `kalbu-redaktorius` eilę (13:10) kiekvieną antradienį/penktadienį: 2 iš 7 paleidimų = 28 % darbo.
2. **Gilesnis:** `active_role_locks()` skaitė `agents/.run.<role>.lock`, kurių **niekas neužrakina nuo commito `378dbd8` (2026-11-08)**. Funkcija visada grąžindavo `[]` — todėl žurnalas sakė „laukia, kol baigs *kitas agentas*" be vardo, `RoleWatch` (LL-49 autorystės apsauga) niekada nematė svetimo vaidmens, o mano paties taisymas būtų buvęs neveikiantis.
3. **`suprask-agent@.service` `TimeoutStartSec=3900`**, nors ROLES biudžetas iki 14400 s — systemd tyliai kirpo ilgus paleidimus.

**Ką keičiau** (`agents/`, `scripts/`, `deploy/`, `docs/` — turinio ir simuliacijų neliečiau):
- `agents/run.py`: `LOCK_WAIT_QUEUE=2700` + `lock_wait_budget()`; laukimo žymė `agents/.wait.<role>` ir `yield_to_waiting()` (eilė užleidžia vietą tarp savo darbų); `role_of_pid()`/`lock_holder_role()` — laikytojas iš `/proc/locks` → PID → `/proc/<pid>/cmdline`.
- `scripts/kurejas_queue.py` + `kalbu_queue.py`: užleidimas; **`skipped` nebeblokuoja pasiūlymo** — šiandien #47139 virto `blocked` („užraktas užimtas >900 s"), nors modulio niekas nelietė; grąžintas į `new`.
- `deploy/gen_timers.py` + vienetas: `TimeoutStartSec` skaičiuojamas (17700), `check_agents.py` — vartas, kad neatitolų.
- `scripts/queue_repair.py --prove ID=REGEX`: uždaro jau įgyvendintus, bet neuždarytus pasiūlymus su trim įrodymais (būsena `new`, tikslo failas keistas PO prašymo, REGEX faile). #4455 ir #4516 kabojo 16 d. — dabar `done`.
- `scripts/probe_lock_wait.py` (17 lūkesčių, 1,3 s, įsijungia į CI per esamą `probe_*.py` ciklą), LL-184, `docs/AGENTU-SISTEMA.md`, `.gitignore`.

**Patikra** — 9 vartai rc 0 (`validate_content`, `check_agents`, `check_lessons` 184, `check_ui`, `check_art`, `check_registry` 0, `check_language --strict`, `check_audio` 2224/2224, `check_docs_facts`); 5 zondai 15/15, 17/17, 20/20, 31/31, 9/9. Neigiama kontrolė: prieš pataisą tame pačiame procese `active_role_locks()` → `[]`, `lock_holder_role()` → `sistemos-architektas`. Integracinis bandymas: antras `run.py kuratorius` realiai atspausdino „laukia, kol baigs **sistemos-architektas**". `queue_repair --prove` su išgalvotu šablonu → liko `new`; su jau `done` numeriu → atsisakyta. Grafikai sinchronizuoti (`gen_timers --install` + `daemon-reload`, `TimeoutStartUSec=4h 55min`). Sisteminiai pasiūlymai **23 → 21**, >3 d. įspėjimai **11 → 9**.

**Sąmoningai neliesta:** `content/`, `assets/js/sims/`, `agents/scope.json`, `AGENTS.md`, kitų vaidmenų failai. Likę 21 sisteminis pasiūlymas nejudinti (seniausias normalus — #5342 worktree izoliacija; high — #22168, #42019, #44331, #46530). `queue_repair.py --apply` (infra blokams): grąžintinų 0 — 4 blokuoti dėl turinio.

Vienas dalykas, kurio nepadariau: naujo `state.json` bloko nerašiau — vaidmens failas jo neprašo, o bėgiklis `roles.sistemos-architektas` įrašo pats.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-709e1a0cbbf428bc4fcc01d1ef16cf70a3fda46d5d189253862338b00740dce0
```
