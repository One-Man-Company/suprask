# sistemos-architektas — 2026-11-26T2031

- paleidimas: #561 (manual)
- trukmė: 1819s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ agents/run.py
│ @@ -1003,6 +1003,104 @@
│      return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, timeout=timeout)
│
│
│ +def head_sha() -> str:
│ +    """Dabartinis HEAD. `""`, jei git neatsako (šviežias klonas be istorijos)."""
│ +    try:
│ +        out = git("rev-parse", "HEAD", timeout=20).stdout.strip()
│ +        return out if re.fullmatch(r"[0-9a-f]{7,40}", out) else ""
│ +    except Exception:  # noqa: BLE001
│ +        return ""
│ +
│ +
│ +# Commit'o antraštė, kurią bėgiklis laiko ĮRODYTU šio paleidimo darbu:
│ +# `[vaidmuo] #<paleidimas>: …`. Modelis, kuris nusprendžia sukomituoti pats
│ +# (o taip nutiko bent du kartus — #516 ir #542), rašo būtent tokią antraštę,
│ +# nes ją mato kiekvieno ankstesnio commit'o žinutėje.
│ +OWN_COMMIT_RE = re.compile(r"^\[(?P<role>[a-z0-9-]+)\]\s+#(?P<run>\d+):")
│ +
│ +
│ +def own_commits_since(base_head: str, role: str, run_id: int) -> tuple[list[str], list[str], str]:
│ +    """Ką modelis sukomitavo PATS per šį paleidimą → (failai, sha, pastaba).
│ +
│ +    Kodėl tai būtina (#516, #542): `changed_files()` matuoja `git status`, t. y.
│ +    tik NEKOMITUOTUS pakeitimus. Jei modelis darbo pabaigoje padaro
│ +    `git commit` (jam niekas to nedraudžia, o commit'o antraštę jis mato
│ +    kiekviename `git log`), darbinė kopija tampa švari, `changed_files()`
│ +    grąžina tuščią sąrašą, o bėgiklis paleidimą įrašo „empty / Pakeista tik
│ +    paleidimo ataskaita“ — nors darbas JAU yra istorijoje.
│ +
│ +    Pasekmės buvo trys, visos matuojamos:
│ +      1. statistika tokius paleidimus skaičiavo kaip nenaudingus (architektas
│ +         43 %), nors jie paskelbė 5 commit'us;
│ +      2. `publish()` negavo failų sąrašo, todėl **nė vienas vartas nebuvo
│ +         paleistas** — modulio/scenarijaus turinys galėjo patekti į `main`
│ +         be `validate_content.py`, be garso ir kalbos patikros (LL-211);
│ +      3. pasiūlymai liko `new`, tad eilė tą patį darbą būtų davusi antrą kartą.
│ +
│ +    Autorystė imama TIK iš antraštės `[role] #<run_id>:` — tai vienintelis
│ +    įrodymas, kurį galima perskaityti be spėjimo (LL-49 principas: atmesti
│ +    galima tik tai, kas įrodyta). Kito vaidmens ar kito paleidimo commit'as
│ +    neįtraukiamas, kad svetimas darbas nebūtų priskirtas (LL-45).
│ +    """
│ +    if not base_head:
│ +        return [], [], ""
│ +    try:
│ +        raw = git("log", "--format=%H%x00%s", "--no-merges", f"{base_head}..HEAD",
│ +                  timeout=30).stdout
│ +    except Exception:  # noqa: BLE001
│ +        return [], [], ""
│ +    shas: list[str] = []
│ +    for line in raw.splitlines():
│ +        if "\x00" not in line:
│ +            continue
│ +        sha, subject = line.split("\x00", 1)
│ +        found = OWN_COMMIT_RE.match(subject.strip())
│ +        if found and found.group("role") == role and int(found.group("run")) == run_id:
│ +            shas.append(sha.strip())
│ +    if not shas:
│ +        return [], [], ""
│ +    files: list[str] = []
│ +    for sha in shas:
│ +        try:
│ +            names = git("show", "--name-only", "--format=", sha, timeout=30).stdout
│ +        except Exception:  # noqa: BLE001
│ +            continue
│ +        for name in names.splitlines():
│ +            name = name.strip()
│ +            if name and not is_runtime_artifact(name) and name not in files:
│ +                files.append(name)
│ +    if not files:
│ +        return [], shas, ""
│ +    note = (f"modelis pats sukomitavo {len(shas)} commit'ą (-us) "
│ +            f"({', '.join(s[:7] for s in shas[:3])}{' …' if len(shas) > 3 else ''}): "
│ +            f"{len(files)} failų įtraukti į patikrą, nors darbinė kopija švari")
│ +    return files, shas, note
│ +
│ +
│ +def undo_own_commits(base_head: str, shas: list[str]) -> str:
│ … omitted 26 diff line(s) across 1 additional file(s)/section(s)
│ agents/run.py
│ @@ -2243,6 +2243,10 @@
│      fd, query_path = tempfile.mkstemp(prefix=f"suprask-{args.role}-", suffix=".txt")
│      goal_path = query_path + ".goal"
│      before = git_snapshot()
│ +    # HEAD prieš paleidimą — tam, kad pabaigoje pamatytume ir commit'us, kuriuos
│ +    # modelis padarė PATS (žr. `own_commits_since`, #516/#542/LL-211). Be šito
│ +    # savarankiškas `git commit` padarydavo paleidimą „empty“ ir apeidavo vartus.
│ +    head_before = head_sha()
│      # Stebėjimas prasideda TĄ PAČIĄ akimirką kaip ir `before` nuotrauka: tik
│      # tada laiko tarpas ir „kas dar dirbo“ matuojami tais pačiais rėmais (LL-49).
│      watch = RoleWatch(args.role).start()
│ agents/run.py
│ @@ -2370,9 +2370,17 @@
│          )
│
│          files = changed_files(before)
│ +        # Modelio pačio commit'ai: `changed_files()` jų nemato (darbinė kopija
│ +        # švari), todėl be šito paleidimas liktų „empty“ ir vartai nebūtų
│ +        # paleisti (#516, #542, LL-211).
│ +        own_files, own_shas, own_note = own_commits_since(head_before, args.role, run_id)
│ +        if own_files:
│ +            files = sorted(set(files) | set(own_files))
│          watch.stop()
│          foreign = watch.roles()
│          files, foreign_files, notes = publication_plan(files, args.role, foreign)
│ +        if own_note:
│ +            notes = notes + [own_note]
│          # #5400: dokumentų skaičiai atnaujinami PRIEŠ publikavimą, kad vartai
│          # tikrintų tai, kas bus išstumta. Svetimo vaidmens atveju neliečiama —
│          # tada shared failas gali būti jo nebaigtas darbas (LL-49).
│ agents/run.py
│ @@ -1083,8 +1083,12 @@
│      Reikia tik tada, kai tokio commit'o turinys NEpraeina vartų: įprastas
│      `revert()` atstato failus iš HEAD, o jei darbas jau HEAD'e — jis nieko
│      nepakeistų, ir ataskaita meluotų („pakeitimai atmesti“, nors jie liko).
│ -    Sąlyga griežta sąmoningai: atsukama tik tada, kai tarp `base_head..HEAD`
│ -    nėra NĖ VIENO kito commit'o — kitaip atsukimas numestų ir svetimą darbą.
│ +
│ +    Dvi sąlygos, abi būtinos:
│ +      1. tarp `base_head..HEAD` nėra NĖ VIENO kit

… PRALEISTA 18794 SIMBOLIŲ IŠ 36794 (įrankių išklotinės) — visa ataskaita: agents/work/sistemos-architektas/00561/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

asakys. Tai LL-21 klasė (skaičius, kurio niekas
│ +    neperskaičiuoja), tik ne dokumente, o dviejuose turinio failuose.
│ +
│ +    Nesutapimas yra KLAIDA, o ne įspėjimas: tai ne stilius, o du skirtingi
│ +    teiginiai tam pačiam vaikui. `sim` lyginamas atsargiai — indekse jis yra
│ +    komponento ID (tekstas), modulyje — `sim.component`.
│ +    """
│ +    rel = mod_path.relative_to(ROOT)
│ +    for key in ("title", "subtitle", "minutes"):
│ +        if key not in entry or key not in data:
│ +            continue
│ +        if entry.get(key) != data.get(key):
│ +            rep.err(
│ +                f"{rel}: „{key}“ nesutampa su klasės indeksu "
│ +                f"(indeksas: {entry.get(key)!r}, modulis: {data.get(key)!r}) — "
│ +                "vaikas sąraše ir modulyje matytų skirtingą teiginį (#16892)"
│ +            )
│ +    sim_entry = entry.get("sim")
│ +    sim_component = (data.get("sim") or {}).get("component") if isinstance(data.get("sim"), dict) else None
│ +    if sim_entry and sim_component and sim_entry != sim_component:
│ +        rep.err(
│ +            f"{rel}: „sim“ nesutampa su klasės indeksu "
│ +            f"(indeksas: {sim_entry!r}, modulis: {sim_component!r}) — "
│ +            "registro patikra ir sąrašas rodytų skirtingą simuliaciją (#16892)"
│ +        )
│
│
│  def check_module(path: Path, data: dict, rep: Report, sims: set[str], grades_meta: dict) -> None:
│ scripts/probe_index_fields.py
│ @@ -0,0 +1,138 @@
│ +#!/usr/bin/env python3
│ +"""Zondas `validate_content.check_index_matches_module()` (#16892, LL-21 šeima).
│ +
│ +Kodėl šis failas egzistuoja
│ +---------------------------
│ +Klasės sąrašo kortelė (`assets/js/app.js: title, subtitle, minutes`) ima laukus
│ +iš `index.json`, o modulio puslapis tuos pačius laukus ima iš modulio JSON. Tai
│ +dvi to paties teiginio kopijos, kurių iki šiol niekas nesulygino: validatorius
│ +tikrino `id` ir `strand`, o `check_published.py` lygina failus su gyva
│ +svetaine — ne failus tarpusavyje.
│ +
│ +Pasiūlymas #16892 užregistruotas 2026-11-14, kai skirtumo nebuvo (82 moduliai,
│ +0 nesutapimų). Tai latentinis, o ne šiandien matomas defektas — bet jei kas
│ +nors pataisys trukmę tik modulio faile, vaikas sąraše matys „8 min.“, o
│ +modulyje „10 min.“, ir nė vieni vartai to nepasakys.
│ +
│ +Zondas tikrina ABEM kryptimis: ir tai, kad nesutapimas gaudomas, ir tai, kad
│ +sutampantys laukai NĖRA klaidingai vadinami klaida (kitaip vartai būtų
│ +triukšmas, o triukšmą agentai išmoksta apeiti).
│ +
│ +  B1 sutampantys laukai → 0 klaidų (kontrolinė)
│ +  B2 `minutes` skiriasi → klaida, įvardytas laukas ir abi reikšmės
│ +  B3 `title` skiriasi → klaida
│ +  B4 `subtitle` skiriasi → klaida
│ +  B5 `sim` skiriasi (indekse tekstas, modulyje `sim.component`) → klaida
│ +  B6 `sim` sutampa → 0 klaidų
│ +  B7 trūkstamas laukas indekse → NE klaida (tai ne nesutapimas, o schema,
│ +     kurią tikrina kitas vartas — vienas defektas, viena eilutė, LL-37)
│ +  B8 tikras repo: visi klasės indekso įrašai lyginami su savo moduliais ir
│ +     gaunama 0 klaidų (šiandien 82 moduliai) — įrodo, kad vartas įsijungia be
│ +     triukšmo esamam turiniui
│ +
│ +Naudojimas:
│ +    python3 scripts/probe_index_fields.py     # 0 — visi lūkesčiai išsipildė
│ +"""
│ +
│ +from __future__ import annotations
│ +
│ +import json
│ +import pathlib
│ +import sys
│ +
│ +HERE = pathlib.Path(__file__).resolve().parent
│ +ROOT = HERE.parent
│ +sys.path.insert(0, str(HERE))
│ +
│ +import validate_content as vc  # noqa: E402
│ +
│ +results: list[tuple[str, bool, str]] = []
│ +
│ +
│ +def case(name: str, ok: bool, detail: str) -> None:
│ +    results.append((name, ok, detail))
│ +    print(f"{'✔' if ok else 'KLAIDA'} {name} — {detail}")
│ +
│ +
│ +class FakePath:
│ +    """Pakaitinis kelias: `relative_to(ROOT)` be tikro failo."""
│ +
│ +    def __init__(self, rel: str) -> None:
│ +        self.rel = rel
│ +
│ +    def relative_to(self, other):  # noqa: ANN001, D401 — atkartoja pathlib API
│ +        return self.rel
│ +
│ +
│ +def run(entry: dict, data: dict) -> vc.Report:
│ +    rep = vc.Report()
│ +    vc.check_index_matches_module(entry, data, FakePath("content/lt/grade-01/x/y.json"), rep)
│ +    return rep
│ +
│ +
│ +def main() -> int:
│ +    base_entry = {"id": "01-x", "title": "Garsas", "subtitle": "Kuo skiriasi",
│ +                  "minutes": 8, "sim": "garso-raides"}
│ +    base_mod = {"id": "01-x", "title": "Garsas", "subtitle": "Kuo skiriasi",
│ +                "minutes": 8, "sim": {"component": "garso-raides"}}
│ +
│ … omitted 60 diff line(s) across 1 additional file(s)/section(s)
│ docs/AGENTU-SISTEMA.md
│ @@ -92,6 +92,24 @@
│
│  Agentui **draudžiama** daryti `git commit`, `git push`, `gh pr create` — tai buvo pagrindinė priežastis, kodėl per parą 9 paleidimai nedavė nė vieno pokyčio svetainėje.
│
│ +Draudimas yra taisyklė, o ne vartas: modelis turi terminalą ir kartais commit'ą
│ +padaro vis tiek (2026-11-24 #516, 2026-11-25 #542 — 5 commit'ai). Iki
│ +2026-11-26 bėgiklis tokį darbą laikė **nematomu**: `changed_files()` matuoja
│ +`git status`, o sukomitavus darbinė kopija švari, tad paleidimas įrašomas
│ +`empty`/`exhausted` su `artifacts = []`, nors commit'ai jau `main`. Pasekmės
│ +buvo trys: nenaudingų procentas melavo (architektas 43 %), **vartai nebuvo
│ +paleisti** (turinys galėjo patekti į `main` be `validate_content.py`), o
│ +pasiūlymai liko `new`, tad eilė tą patį darbą būtų davusi antrą kartą.
│ +
│ +Nuo 2026-11-26 bėgiklis (`agents/run.py: own_commits_since`) lygina HEAD prieš
│ +paleidimą ir po jo: commit'ai, kurių antraštė `[vaidmuo] #<paleidimas>:`, yra
│ +įtraukiami į failų sąrašą, todėl jiems paleidžiami vartai, o nepavykus —
│ +`undo_own_commits()` atsuka juos (tik jei tarp jų nėra svetimo commit'o ir nė
│ +vienas nėra pasiekęs `origin/main`). `scripts/system_report.py` tuo pačiu
│ +lygina `runs.db` statusą su git istorija ir rodo „Sąskaita nesutampa su git
│ +istorija“ — jei matavimas vėl ims meluoti, tai bus matoma kiekvieną paleidimą
│ +(LL-211).
│ +
│  ## Statusai (`agents/runs.db`)
│
│  | Statusas | Reikšmė |
│ agents/proposals/2026-11-26-sistemos-architektas-push-backlog-be-vartu.json
│ @@ -0,0 +1,17 @@
│ +{
│ +  "role": "sistemos-architektas",
│ +  "run_id": 561,
│ +  "created": "2026-11-26T21:02:00+02:00",
│ +  "type": "struktura",
│ +  "title": "push_backlog() išstumia commit'us į main be jokių vartų",
│ +  "body": "Šiandien išmatavau, kad #516 ir #542 darbas (5 commit'ai) atsidūrė origin/main, nors tų paleidimų statusas buvo exhausted/empty — t. y. jų turinys nebuvo validuotas nei bėgiklio, nei CI (CI tikrina tik push į main, o lokalus commit'as prieš push'ą jau fiksuoja turinį). Bėgiklio pusę sutvarkiau (#561): own_commits_since() įtraukia tokius commit'us į failų sąrašą, todėl run_checks() paleidžiamas, o nepavykus — undo_own_commits(). Lieka antroji pusė: publikavimo agentas savo darbo pradžioje kviečia push_backlog(), kuris ima rev-list origin/main..HEAD ir tiesiog push'ina — be jokio turinio vartų. Jei kuris nors paleidimas bus atmestas po to, kai modelis jau sukomitavo (arba commit'as liks iš nutrūkusio paleidimo), push_backlog() jį vis tiek išstums į main. Siūloma: push_backlog() prieš push paleidžia bent validate_content.py ir check_registry.py toms failų grupėms, kurias liečia laukiantys commit'ai, o nepavykus — NEpushina ir grąžina sąrašą commit'ų su priežastimi, kad sprendimą priimtų žmogus arba atitinkamas vaidmuo. Tai ta pati LL-10/LL-211 šeima: „paskelbta“ turi reikšti „praėjo vartus“, o ne „buvo git istorijoje“.",
│ +  "target": "agents/run.py",
│ +  "priority": "high",
│ +  "status": "new",
│ +  "evidence": [
│ +    "git log --all --format='%h %s' --grep='#542' — 5568018, cc061be, f886b7e, fe39073 yra origin/main, o agents/runs.db #542 statusas 'empty', artifacts='[]'",
│ +    "agents/runs.db #516 statusas 'exhausted', commit_sha='', o 5fe3e90 yra origin/main",
│ +    "agents/run.py: push_backlog() (1752–1784) daro git rev-list origin/main..HEAD ir git push be run_checks()",
│ +    "scripts/system_report.py: nauja skiltis 'Sąskaita nesutampa su git istorija' rodo būtent #516 ir #542 — matavimas pats randa atvejus"
│ +  ]
│ +}
ĮGYVENDINTA: #16892, #16338

Mačiau (77 d. → 7 d. ataskaita, prieš pakeitimus): 171 paleidimas, `sistemos-architektas` 43 % nenaudingų (7 paleidimai: 3 published, 1 `empty`, 2 `exhausted`, 1 kita) — didžiausias nuostolis sistemoje. Patikrinau paleidimus, ne skaičių: **#516** (2741 s) ir **#542** (3486 s) įrašyti `exhausted`/`empty` su „Pakeista tik paleidimo ataskaita“ ir `artifacts = []`, o `git log origin/main` turi **penkis jų commit'us** (`5fe3e90`, `5568018`, `cc061be`, `f886b7e`, `fe39073`). Sisteminiai pasiūlymai 23, seniausias 18 d.

Priežastis: bėgiklis apie darbą spręsdavo tik iš `git status` (`changed_files()`). Modelis, kuris pats padaro `git commit`, palieka švarią kopiją → statusas `empty`, `artifacts = []`, **vartai nepaleisti**, pasiūlymai lieka `new`. Tai ne vienas atvejis: per visą istoriją 6 tokie paleidimai.

Keičiau
- `agents/run.py` — `head_sha()`, `own_commits_since()` (commit'as priskiriamas paleidimui TIK pagal antraštę `[vaidmuo] #<paleidimas>:`), `undo_own_commits()` (atsuka savo commit'us, jei tarp jų nėra svetimo ir nė vienas nepasiekė `origin/main`). `main()` dabar renka failus iš dviejų šaltinių — `git status` + savo commit'ai — ir abiem atvejais paleidžia vartus; tai galioja ir timeout keliui.
- `scripts/system_report.py` — nauja skiltis „Sąskaita nesutampa su git istorija“ (`ledger_gap()`): lygina `runs.db` statusą su git istorija. Matavimas nebėra vienas šaltinis.
- `scripts/validate_content.py` — `check_index_matches_module()` (#16892): `title`, `subtitle`, `minutes`, `sim` lyginami tarp `index.json` ir modulio JSON, nesutapimas — klaida.
- `scripts/probe_own_commits.py` (15 lūkesčių), `scripts/probe_index_fields.py` (8) — įsijungia į CI per esamą `probe_*.py` ciklą.
- `docs/AGENTU-SISTEMA.md`, `pamokos.md` (LL-211), `agents/system-journal.md` įrašas.
- `queue_repair.py --apply --prove '#16338=check_sim_config'` — #16338 buvo įgyvendintas, bet 12 d. kabėjo `new`; uždarytas su trimis įrodymais.

Patikra (po)
- `probe_own_commits.py` **15/15** rc 0 (be tinklo, laikinas repo su tikru git), įsk. tikrą #542 scenarijų: `changed_files()` → `[]`, su commit'ais → 2 failai, o `work_files()` turi darbo failą. Neigiamos kontrolės: kito vaidmens / kito numerio / `[sistema]` commit'ai nepriskirti; svetimas commit'as tarp savų → „atsukti negalima“; išstumtas → „jau yra origin/main“.
- `probe_index_fields.py` **8/8**, B8 tikrame repo — 82 moduliai, 0 klaidų (vartas įsijungia be triukšmo); B2–B5 klaida įvardija lauką ir abi reikšmes, B7 trūkstamas laukas — ne klaida.
- `system_report` rodo skiltį su **#516 (1 commit)** ir **#542 (4 commit'ai)** — matavimas pats randa atvejus, dėl kurių buvo pataisytas.
- Sisteminiai pasiūlymai **23 → 22**, `new` **32 → 31**, `done` **191 → 192**.
- 9 vartai rc 0: `validate_content` (0/0), `check_registry`, `check_lessons` (211), `check_ui`, `check_art`, `check_audio`, `check_agents` (įspėjimas tik apie eilės amžių), `check_docs_facts`, `check_refs`, `check_language --strict`; 10 zondų (9, 15, 15, 8, 17, 15, 7, 20, 63, 9 lūkesčių) visi rc 0.
- Grafikai neliesti (ROLES nekeistas), dashboard neliestas.

Neišspręsta (sąmoningai)
- **#5342** (worktree izoliacija, 18 d.) — daugiaetapis darbas: be `.venv` nuorodos ir `agents/runs.db` adreso sprendimo jis lūžtų ne vienu žingsniu.
- **push_backlog() be vartų** — užregistravau pasiūlymą `agents/proposals/2026-11-26-sistemos-architektas-push-backlog-be-vartu.json` (high): publikavimo agentas vis dar išstumia laukiančius commit'us be `validate_content`.
- **#42973** (šaknies `AGENTS.md` deklaruoja 7 vaikų DOX failus, kurių nė vieno nėra) — `AGENTS.md` man draudžiamas, tik užregistruota.
- `kritikas` 43 % (1 `empty`, 2 `skipped` po 900 s — užrakto laukimas), `kalbu-redaktorius` 22 % — nelieta.
- `content/`, `assets/js/sims/`, `agents/scope.json`, kitų vaidmenų failai — neliesti.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-425afb0892f9ea6c6591e979d9788ead7646523b555fb3b778134bb60634431e
```
