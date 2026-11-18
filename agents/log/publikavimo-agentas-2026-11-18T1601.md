# publikavimo-agentas — 2026-11-18T1601

- paleidimas: #368 (manual)
- trukmė: 298s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub368/zondas_503.py
│ @@ -0,0 +1,81 @@
│ +"""Zondas #368: ka vartai sako, kai VIENA uzklausa nutruksta, o failas yra.
│ +
│ +Tikro repo nelieciame: `SUPRASK_LIVE_ROOT` nukreipiamas i vietini veidrodi
│ +(`http.server`, serve is repo saknies). Veidrodis vienam moduliui pirma karta
│ +atsako 503, antra karta — 200. Tai ta pati situacija, kuri siandien (paleidimas
│ +#368) ivyko su `06-figuros`: pirmas pilnas `check_published.py` begimas dave
│ +rc 1 ir „NEPASIEKIAMI gyvi failai (1): 06-figuros“, o `curl` ta pati adresa
│ +tuoj pat atsake 200 / 4 712 B.
│ +"""
│ +import importlib.util
│ +import sys
│ +import threading
│ +from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +TARGET = "/content/lt/grade-01/matematika/06-figuros.json"
│ +
│ +state = {"hit": 0, "mode": "once"}
│ +
│ +
│ +class Handler(SimpleHTTPRequestHandler):
│ +    def __init__(self, *a, **kw):
│ +        super().__init__(*a, directory=ROOT, **kw)
│ +
│ +    def do_GET(self):
│ +        if self.path == TARGET:
│ +            state["hit"] += 1
│ +            fail = state["mode"] == "always" or (state["mode"] == "once" and state["hit"] == 1)
│ +            if fail:
│ +                self.send_response(503)
│ +                self.send_header("Content-Length", "0")
│ +                self.end_headers()
│ +                return
│ +        return super().do_GET()
│ +
│ +    def do_HEAD(self):
│ +        return self.do_GET()
│ +
│ +    def log_message(self, *a):
│ +        pass
│ +
│ +
│ +def load():
│ +    spec = importlib.util.spec_from_file_location("cp", f"{ROOT}/scripts/check_published.py")
│ +    mod = importlib.util.module_from_spec(spec)
│ +    spec.loader.exec_module(mod)
│ +    return mod
│ +
│ +
│ +def run(port, mode):
│ +    state["hit"] = 0
│ +    state["mode"] = mode
│ +    cp = load()
│ +    cp.LIVE_ROOT = f"http://127.0.0.1:{port}/"
│ +    data = cp.report([1], compare_bytes=True, audio_sample=1)
│ +    return cp, data
│ +
│ +
│ +srv = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
│ +port = srv.server_port
│ +threading.Thread(target=srv.serve_forever, daemon=True).start()
│ +
│ +cp, once = run(port, "once")
│ +print("A) pirma uzklausa 503, antra 200")
│ +print("   stale_unknown:", once["stale_unknown"])
│ +print("   verdict:", once["verdict"]["label"], "| ok:", once["verdict"]["ok"])
│ +print("   serverio hit:", state["hit"])
│ +a_bad = once["stale_unknown"] or not once["verdict"]["ok"]
│ +
│ +cp, always = run(port, "always")
│ +print("B) visos uzklausos 503 (failas tikrai nepasiekiamas)")
│ +print("   stale_unknown:", always["stale_unknown"])
│ +print("   verdict:", always["verdict"]["label"], "| ok:", always["verdict"]["ok"])
│ +print("   serverio hit:", state["hit"])
│ +b_ok = bool(always["stale_unknown"]) and not always["verdict"]["ok"]
│ +
│ +srv.shutdown()
│ +print()
│ … omitted 3 diff line(s) across 1 additional file(s)/section(s)
│ scripts/check_published.py
│ @@ -78,6 +78,21 @@
│    rado: „žyma perkeliama“ arba „DĖMESIO: žyma liktų našlaite“. Pervadinimas,
│    kuris yra `known_renames.json`, bet neturi `renamed_from` indekse, dabar
│    daro ir rc 1 (`verdict()`: „pervadintas ID be alias“).
│ +
│ +2026-11-18 (paleidimas #368): laikina tinklo klaida nebelaikoma „modulio nėra“.
│ +  Pirmas šio paleidimo `check_published.py` bėgimas davė rc 1 ir
│ +  „NEPASIEKIAMI gyvi failai (1): 06-figuros“, nors `curl` tą patį adresą tuoj
│ +  pat atsakė 200 / 4 712 B, o antras bėgimas — 45/45 ir rc 0. Priežastis:
│ +  `compare()` nutraukdavo po **vienos** nepavykusios užklausos (`fetch()` → None
│ +  → `live_size -1` → `stale_unknown` → raudona), o `_audio_state()` tą pačią
│ +  klaidą kartojo. Viena kryptis turėjo kartojimą, kita — ne, tad vartai apie
│ +  vaiko patirtį skelbė faktą („modulis nepasiekiamas“), kurio po vieno bandymo
│ +  pasakyti negalima. Dabar `fetch()` 404/410 laiko galutiniu atsakymu, o kitas
│ +  klaidas kartoja (2 bandymai, 1,5 s pertrauka); pakartojimų skaičius
│ +  išvedamas, kad tylaus kartojimo nebūtų (LL-37). Neigiamas zondas:
│ +  `scratch/pub368/zondas_503.py` — veidrodis, kuris pirmą užklausą atsako 503,
│ +  o antrą 200, anksčiau davė raudoną, dabar žalią; veidrodis, kuris 503 atsako
│ +  visada, lieka raudonas.
│
│  Naudojimas:
│      python3 scripts/check_published.py               # žmogui
│ scripts/check_published.py
│ @@ -402,13 +402,37 @@
│      return data, files
│
│
│ -def fetch(url: str, timeout: int = 20) -> bytes | None:
│ -    try:
│ -        req = urllib.request.Request(url, headers=UA)
│ -        with urllib.request.urlopen(req, timeout=timeout) as resp:
│ -            return resp.read()
│ -    except Exception:  # noqa: BLE001
│ -        return None
│ +RETRY_PAUSE = 1.5
│ +# Kiek užklausų teko kartoti po laikinos klaidos. Skaičius išvedamas, o ne
│ +# nuslopinamas: tylus kartojimas paslėptų flakuojančią svetainę (LL-37).
│ +RETRIES = {"count": 0}
│ +
│ +
│ +def fetch(url: str, timeout: int = 20, attempts: int = 2) -> bytes | None:
│ +    """Failo turinys arba `None`. 404/410 — galutinis atsakymas, nekartojama.
│ +
│ +    Anksčiau bet kokia klaida (503, ryšio nutrūkimas, timeout) virsdavo `None`
│ +    po **vieno** bandymo, o `compare()` tokią `None` reikšmę paversdavo
│ +    `stale_unknown` — t. y. vartai paskelbdavo „modulis nepasiekiamas“ apie
│ +    failą, kuris svetainėje yra. Paleidimas #368: pirmas bėgimas rc 1 su
│ +    `06-figuros`, `curl` tas pats adresas → 200 / 4 712 B, antras bėgimas rc 0.
│ +    Todėl laikinos klaidos kartojamos, o `_audio_state()` ir `_shell_state()`
│ +    turi tą patį kelią. 404/410 kartojami nėra: tai ne flakas, o atsakymas.
│ +    """
│ +    for attempt in range(max(1, attempts)):
│ +        try:
│ +            req = urllib.request.Request(url, headers=UA)
│ +            with urllib.request.urlopen(req, timeout=timeout) as resp:
│ +                return resp.read()
│ +        except urllib.error.HTTPError as exc:
│ +            if exc.code in (404, 410):
│ +                return None
│ +        except Exception:  # noqa: BLE001
│ +            pass
│ +        if attempt + 1 < max(1, attempts):
│ +            RETRIES["count"] += 1
│ +            time.sleep(RETRY_PAUSE)
│ +    return None
│
│
│  def sha(data: bytes) -> str:
│ scripts/check_published.py
│ @@ -662,6 +662,7 @@
│
│  def report(grades: list[int] | None = None, compare_bytes: bool = True,
│             audio_sample: int | None = None) -> dict:
│ +    RETRIES["count"] = 0
│      grades = grades or live_grades()
│      per_grade = [check_grade(g, compare_bytes) for g in grades]
│
│ scripts/check_published.py
│ @@ -726,6 +726,7 @@
│          "path_differs": [g["grade"] for g in per_grade if g.get("path_differs")],
│          "unpushed_commits": len(unpushed_list),
│          "unpushed_checked": unpushed_ok,
│ +        "retried_requests": RETRIES["count"],
│          "last_commit": last_commit(),
│          "live_error": "; ".join(live_errors),
│      }
│ scripts/check_published.py
│ @@ -841,7 +841,8 @@
│          for s in data["stale"]:
│              print(f"  - {s['id']} ({s['file']}): repo {s['repo_bytes']} B, gyvai {s['live_bytes']} B")
│      if data["stale_unknown"]:
│ -        print(f"NEPASIEKIAMI gyvi failai ({len(data['stale_unknown'])}): {', '.join(data['stale_unknown'])}")
│ +        print(f"NEPASIEKTA po 2 bandymų ({len(data['stale_unknown'])}): "
│ +              f"{', '.join(data['stale_unknown'])}")
│      if data["not_in_path"]:
│          print(f"NĖRA path.json sekoje ({len(data['not_in_path'])}): {', '.join(data['not_in_path'])}")
│      accepted = [v for v in data.get("vanished_ids", []) if v.get("resolved")]
│ scripts/check_published.py
│ @@ -902,8 +902,11 @@
│      if data["unpushed_commits"]:
│          print(f"Neišstumta commit'ų: {data['unpushed_commits']}")
│      if not data.get("unpushed_checked", False):
│ -        print("Neišstumtų commit'ų patikra NEĮVYKO — git negalėjo palyginti su origin/main "
│ +        print("Neišsiųstų commit'ų patikra NEĮVYKO — git negalėjo palyginti su origin/main "
│                "(tai ne „0“, o nežinoma; patikrink `git fetch`).")
│ +    if data.get("retried_requests"):
│ +        # Ne klaida, bet svarbu: jei svetainė flakuoja, skaičius auga.
│ +        print(f"Užklausos, kartotos po laikinos klaidos: {data['retried_requests']}")
│      if not problems(data):
│          print(f"✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, "
│                f"svetainės kodas {data.get('shell_count', 0)} failų"
│ scripts/check_published.py
│ @@ -902,7 +902,7 @@
│      if data["unpushed_commits"]:
│          print(f"Neišstumta commit'ų: {data['unpushed_commits']}")
│      if not data.get("unpushed_checked", False):
│ -        print("Neišsiųstų commit'ų patikra NEĮVYKO — git negalėjo palyginti su origin/main "
│ +        print("Neišstumtų commit'ų patikra NEĮVYKO — git negalėjo palyginti su origin/main "
│                "(tai ne „0“, o nežinoma; patikrink `git fetch`).")
│      if data.get("retried_requests"):
│          # Ne klaida, bet svarbu: jei svetainė flakuoja, skaičius auga.
│ scripts/check_published.py
│ @@ -403,12 +403,13 @@
│
│
│  RETRY_PAUSE = 1.5
│ +FETCH_ATTEMPTS = 2
│  # Kiek užklausų teko kartoti po laikinos klaidos. Skaičius išvedamas, o ne
│  # nuslopinamas: tylus kartojimas paslėptų flakuojančią svetainę (LL-37).
│  RETRIES = {"count": 0}
│
│
│ -def fetch(url: str, timeout: int = 20, attempts: int = 2) -> bytes | None:
│ +def fetch(url: str, timeout: int = 20, attempts: int = FETCH_ATTEMPTS) -> bytes | None:
│      """Failo turinys arba `None`. 404/410 — galutinis atsakymas, nekartojama.
│
│      Anksčiau bet kokia klaida (503, ryšio nutrūkimas, timeout) virsdavo `None`
│ scripts/check_published.py
│ @@ -842,7 +842,7 @@
│          for s in data["stale"]:
│              print(f"  - {s['id']} ({s['file']}): repo {s['repo_bytes']} B, gyvai {s['live_bytes']} B")
│      if data["stale_unknown"]:
│ -        print(f"NEPASIEKTA po 2 bandymų ({len(data['stale_unknown'])}): "
│ +        print(f"NEPASIEKTA po {FETCH_ATTEMPTS} bandymų ({len(data['stale_unknown'])}): "
│                f"{', '.join(data['stale_unknown'])}")
│      if data["not_in_path"]:
│          print(f"NĖRA path.json sekoje ({len(data['not_in_path'])}): {', '.join(data['not_in_path'])}")
SUSTABDYTA dėl žingsnių limito — bet darbas repo yra, ne ataskaita.

check_published.py IŠVESTIS (tikra, ne iš atminties)
- Repozitorija: 45 moduliai / Paskelbta: 45 moduliai (grade-01: repo 45, gyvai 45)
- missing_on_live 0 · hidden_locally 0 · not_in_path 0 · stale 0 · aux_stale 0 · shell_stale 0
- unpushed_commits 0 (patikra įvyko) · shell_count 18 · gyva versija 94ed0841 = repo HEAD
- Garsas: patikrinta 1332 iš 1332 (visi) — visi pasiekiami
- vanished_ids 1: 03-sakinio-tvarka → 03-sakinio-zodziai, alias_ok (index.json turi renamed_from, progress.js migruoja)
- rc 0, verdict „sutampa“

3 GYVI ADRESAI (curl, tikri kodai)
- content/lt/grade-01/matematika/06-figuros.json → 200, 4712 B
- content/lt/grade-01/matematika/07-desningumai.json → indekse yra (200 iš pirmo pilno bėgimo, atskirai netikrinta po paskutinio pakeitimo)
- content/lt/grade-01/index.json ir path.json → gyvi ir baitais lygūs (aux_stale 0)
- Pastaba: `geometrija/06-figuros.json` → 404 (563 B — 404.html); teisingas kelias yra `matematika/`

KĄ RADAU IR PATAISIAU (failas repo: scripts/check_published.py)
Pirmas šio paleidimo bėgimas davė rc 1 ir „NEPASIEKIAMI gyvi failai (1): 06-figuros“, nors `curl` tą patį adresą iškart atsakė 200/4712 B, o antras bėgimas — 45/45 rc 0. Priežastis: `compare()` nutraukdavo po VIENOS nepavykusios užklausos (`fetch()` → None → live_size −1 → stale_unknown → raudona), o `_audio_state()` tą pačią klaidą kartojo. Asimetrija: viena kryptis turėjo kartojimą, kita ne.
Pakeitimai:
- `fetch()` — 404/410 laikomi galutiniu atsakymu (nekartojama), kitos klaidos (503, timeout, ryšio nutrūkimas) kartojamos: FETCH_ATTEMPTS=2, 1,5 s pertrauka;
- `RETRIES` skaitiklis → `retried_requests` į JSON ir eilutė išvestyje (tylaus kartojimo nėra — LL-37);
- `stale_unknown` eilutė: „NEPASIEKTA po 2 bandymų …“ vietoj teiginio, kurio po vieno bandymo pasakyti negalima;
- modulio docstring — #368 įrašas su įrodymu.

ĮRODYMAS (neigiamas zondas, deterministinis veidrodis)
`scratch/pub368/zondas_503.py`: veidrodis, kuris pirmą užklausą atsako 503, antrą 200:
- PRIEŠ pataisymą: stale_unknown ['06-figuros'], verdict „1 nepasiekiamas modulis“, rc 1 — defektas atkurtas;
- PO pataisymo: stale_unknown [], verdict „sutampa“, serverio hit 2 — žalia;
- veidrodis, kuris 503 atsako visada: lieka raudonas (stale_unknown ['06-figuros'], rc 1) — kartojimas neužmaskuoja tikros problemos.
Taip pat įvykdžiau #356 paliktą zondą (`scratch/pub356/zondas.py`): visi 3 atvejai teisingi (be alias → raudona; alias į kitą ID → raudona; alias sutampa → žalia).

VARTAI PO PATAISYMO
- validate_content.py --grade 1 --strict: 0 klaidų, 0 įspėjimų, rc 0
- check_docs_facts.py: 0/0, rc 0
- check_registry.py: 9 kryptys · 45 moduliai · 197 užduotys (optional 45) · 45 sim · našlaičiai 0, rc 0
- check_published.py: 45/45, rc 0

LIKO NEĮRAŠYTA (žingsniai baigėsi)
1. research/wiki/changelog.md įrašas viršuje: „2026-11-18 — Publikavimo patikra #368: repo 45 / paskelbta 45, versija 94ed0841, garsas 1332/1332, laikinos klaidos nebevartojamos kaip faktas (fetch kartojimas, zondas 503→200)“.
2. research/wiki/guidelines/pamokos.md — LL-118 („Viena nepavykusi užklausa paskelbta faktu“: simptomas/kodėl/taisyklė/patikra). Tai naujas tipas — false red iš nežinomos būsenos, ne LL-37 (tyli riba) ir ne LL-10.
3. agents/state.json blokas `last_publish_check_368`.
4. Commit (be push — push daro bėgiklis).

SPRENDIMAS: **ištaisyta** (scripts/check_published.py — vartai nebelaiko laikinos tinklo klaidos modulio nebuvimu), o pati publikavimo būsena — **sutampa** (45/45, 0 neišstumtų, garsas 1332/1332). Sustabdymo priežastis — ne defektas, o pasibaigę žingsniai prieš changelog/pamokų įrašus.

## klaidos

```
session_id: local-c331e4a4a4edfd1975ea9ad40242f467ef546adea48dd32f8805a2848dd2b9e1
```
