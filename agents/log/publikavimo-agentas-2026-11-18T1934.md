# publikavimo-agentas — 2026-11-18T1934

- paleidimas: #370 (manual)
- trukmė: 635s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub370/zondas_trukstamas_failas.py
│ @@ -0,0 +1,94 @@
│ +"""Zondas #370: ka `check_published.py` sako, kai indeksas rodo į failą, kurio repo nėra.
│ +
│ +Situacija, kurią vaidmens instrukcija vadina „lūžęs indeksas": `content/lt/grade-01/
│ +index.json` turi modulio įrašą, bet paties failo repo nėra. Tai nutinka, kai failas
│ +ištrinamas arba pervadinamas nepataisius indekso.
│ +
│ +Tikro repo neliečiame: `cp.CONTENT` nukreipiamas į veidrodį be vieno modulio failo,
│ +o `LIVE_ROOT` — į `http.server`, serve iš TIKRO repo (t. y. gyva svetainė failą turi).
│ +Taip matuojama būtent tai, kas svarbu: ar vartai pamato, kad repo failo nėra, ir ar
│ +jų pranešimas apie tai teisingas.
│ +
│ +Paleidimas: python3 zondas_trukstamas_failas.py
│ +"""
│ +import importlib.util
│ +import json
│ +import pathlib
│ +import shutil
│ +import threading
│ +from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +SCRATCH = pathlib.Path(__file__).resolve().parent
│ +MIRROR = SCRATCH / "veidrodis"
│ +TARGET_ID = "04-skaiciu-tiese"
│ +TARGET_REL = "grade-01/matematika/04-skaiciu-tiese.json"
│ +
│ +
│ +class Handler(SimpleHTTPRequestHandler):
│ +    def __init__(self, *a, **kw):
│ +        super().__init__(*a, directory=str(ROOT), **kw)
│ +
│ +    def log_message(self, *a):
│ +        pass
│ +
│ +
│ +def build_mirror() -> None:
│ +    if MIRROR.exists():
│ +        shutil.rmtree(MIRROR)
│ +    (MIRROR / "content").mkdir(parents=True)
│ +    shutil.copytree(ROOT / "content" / "lt", MIRROR / "content" / "lt")
│ +    (MIRROR / "content" / "lt" / TARGET_REL).unlink()
│ +
│ +
│ +def load():
│ +    spec = importlib.util.spec_from_file_location("cp", ROOT / "scripts" / "check_published.py")
│ +    mod = importlib.util.module_from_spec(spec)
│ +    spec.loader.exec_module(mod)
│ +    mod.CONTENT = MIRROR / "content" / "lt"
│ +    return mod
│ +
│ +
│ +def main() -> None:
│ +    build_mirror()
│ +    srv = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
│ +    port = srv.server_port
│ +    threading.Thread(target=srv.serve_forever, daemon=True).start()
│ +    try:
│ +        cp = load()
│ +        cp.LIVE_ROOT = f"http://127.0.0.1:{port}/"
│ +        data = cp.report([1], compare_bytes=True, audio_sample=1)
│ +    finally:
│ +        srv.shutdown()
│ +
│ +    live_exists = (ROOT / "content" / "lt" / TARGET_REL).exists()
│ +    print(f"Gyva svetainė failą turi: {live_exists}")
│ +    print(f"Repo failo nėra: {not (MIRROR / 'content' / 'lt' / TARGET_REL).exists()}")
│ +    print()
│ +    print("Ką sako vartai:")
│ +    print(f"  local={data['local']} published={data['published']}")
│ +    print(f"  missing_on_live: {data['missing_on_live']}")
│ +    print(f"  hidden_locally:  {data['hidden_locally']}")
│ +    print(f"  stale:           {json.dumps(data['stale'], ensure_ascii=False)}")
│ +    print(f"  stale_unknown:   {data['stale_unknown']}")
│ +    print(f"  verdict:         {data['verdict']['label']} | ok={data['verdict']['ok']}")
│ +    print()
│ +    for s in data["stale"]:
│ +        print(f"  PRANEŠIMAS: „{s['id']} ({s['file']}): repo {s['repo_bytes']} B,"
│ +              f" gyvai {s['live_bytes']} B“")
│ … omitted 16 diff line(s) across 1 additional file(s)/section(s)
│ scripts/check_published.py
│ @@ -440,28 +440,40 @@
│      return hashlib.sha256(data).hexdigest()
│
│
│ -def compare(local_path: pathlib.Path, url_rel: str) -> tuple[bool, int, int]:
│ -    """(ar gyvas failas baitais lygus repo failui, repo baitai, gyvi baitai).
│ -
│ -    -1 gyvuose reiškia „nepasiektas“, 0 — „repo failo nėra“.
│ +def compare(local_path: pathlib.Path, url_rel: str) -> tuple[str, int, int]:
│ +    """(būsena, repo baitai, gyvi baitai).
│ +
│ +    Būsena: `"ok"` | `"differs"` | `"absent"` | `"unreachable"`.
│ +
│ +    Baitų reikšmės: `-1` reiškia **neišmatuota**, ne 0. Tai svarbu, nes 0 baitų
│ +    yra tikras matavimas (tuščias failas), o trūkstamas failas neturi jokio
│ +    dydžio. Iki #370 abu atvejai rašė 0, todėl pranešimas apie failą, kurio
│ +    repo nėra, skambėjo kaip matavimas: „repo 0 B, gyvai 0 B“ — nors gyvo failo
│ +    dydis nebuvo matuotas net vieną kartą (`fetch()` net nebuvo iškviestas, nes
│ +    funkcija grįždavo anksčiau). Vaikas tokiu atveju nematė nieko, o vartai
│ +    pranešdavo „pasenęs turinys“, t. y. siūlė perkrauti publikavimą vietoj
│ +    pataisyti indeksą (LL-21, LL-37).
│      """
│      if not local_path.exists():
│ -        return False, 0, 0
│ +        # Gyvo failo dydis čia sąmoningai nematuojamas: be repo pusės lyginti
│ +        # nėra su kuo, o užklausa tikėtųsi atsakymo apie failą, kurio klausimas
│ +        # dar neaiškus. Grąžinama „nėra“, o ne „0 baitų“.
│ +        return "absent", -1, -1
│      local = local_path.read_bytes()
│      live = fetch(LIVE_ROOT + url_rel)
│      if live is None:
│ -        return False, len(local), -1
│ +        return "unreachable", len(local), -1
│      if sha(live) != sha(local):
│          # LL-76: pirmomis sekundėmis po deploymento kraštas gali būti mišrus.
│          time.sleep(1.5)
│          live = fetch(LIVE_ROOT + url_rel)
│          if live is None:
│ -            return False, len(local), -1
│ -    return sha(live) == sha(local), len(local), len(live)
│ -
│ -
│ -def same_bytes(rel: str) -> tuple[bool, int, int]:
│ -    """(ar gyvas failas baitais lygus repo failui, repo baitai, gyvi baitai)."""
│ +            return "unreachable", len(local), -1
│ +    return ("ok" if sha(live) == sha(local) else "differs"), len(local), len(live)
│ +
│ +
│ +def same_bytes(rel: str) -> tuple[str, int, int]:
│ +    """(būsena, repo baitai, gyvi baitai) — žr. `compare()`."""
│      return compare(CONTENT / rel, "content/lt/" + rel)
│
│
│ scripts/check_published.py
│ @@ -609,6 +609,8 @@
│
│      stale: list[dict] = []
│      stale_unknown: list[str] = []
│ +    missing_in_repo: list[dict] = []
│ +    unmeasured: list[str] = []
│      if compare_bytes:
│          # Modulys, kurio ID gyvame `index.json` nėra, jau įvardytas kaip
│          # NESKELBTA — jo baitų skirtumas nieko neprideda, o pranešime atrodytų
│ @@ -619,26 +621,50 @@
│          todo = [(mid, files[mid]) for mid in local_ids if mid in files and mid not in missing]
│          with ThreadPoolExecutor(max_workers=8) as pool:
│              results = list(pool.map(lambda pair: (pair[0], pair[1], same_bytes(*pair[1:])), todo))
│ -        for mid, rel, (ok, local_size, live_size) in results:
│ -            if not ok:
│ -                if live_size < 0:
│ -                    stale_unknown.append(mid)
│ -                else:
│ -                    stale.append({"id": mid, "file": rel, "repo_bytes": local_size,
│ -                                  "live_bytes": live_size})
│ +        for mid, rel, (state, local_size, live_size) in results:
│ +            if state == "ok":
│ +                continue
│ +            if state == "absent":
│ +                # Indeksas rodo į failą, kurio repo nėra (#370). Tai ne
│ +                # „pasenęs turinys“ ir ne „nepasiekiamas“: publikavimas čia
│ +                # nieko nepakeis, kol indeksas netaisytas. Vaidmens taisyklė
│ +                # šį atvejį vadina lūžusiu indeksu ir reikalauja jį įvardyti
│ +                # atskirai, o ne sumaišyti su publikavimo defektais.
│ +                missing_in_repo.append({"id": mid, "file": rel, "grade": grade})
│ +            elif state == "unreachable":
│ +                stale_unknown.append(mid)
│ +            elif live_size < 0 or local_size < 0:
│ +                # Būsena „differs“, bet vienas dydis neišmatuotas — tokio
│ +                # derinio būti neturėtų; jei atsiranda, sakome tai žodžiais,
│ +                # o ne spausdiname -1 kaip baitus (LL-37).
│ +                unmeasured.append(mid)
│ +            else:
│ +                stale.append({"id": mid, "file": rel, "repo_bytes": local_size,
│ +                              "live_bytes": live_size})
│      out["stale"] = stale
│      out["stale_unknown"] = stale_unknown
│ +    out["missing_in_repo"] = missing_in_repo
│ +    if unmeasured:
│ +        out["stale_unmeasured"] = unmeasured
│
│      # LL-78: klasės indeksas ir seka skaitomi prieš modulį, todėl jų baitai
│ -    # lyginami atskirai — kitaip „ID yra“ dar nereiškia „svetainė rodo tą patį“.
│ +    # lyginami atskirai — kitaip „ID yra“ nereiškia „svetainė rodo tą patį“.
│      aux_stale: list[dict] = []
│ +    aux_absent: list[dict] = []
│      if compare_bytes:
│          for name in ("index.json", "path.json"):
│              url_rel = f"content/lt/{gd}/{name}"
│ -            ok, local_size, live_size = compare(CONTENT / gd / name, url_rel)
│ -            if not ok:
│ -                aux_stale.append({"file": url_rel, "repo_bytes": local_size, "live_bytes": live_size})
│ +            state, local_size, live_size = compare(CONTENT / gd / name, url_rel)
│ +            if state == "ok":
│ +                continue
│ +            item = {"file": url_rel, "state": state,
│ +                    "repo_bytes": local_size, "live_bytes": live_size}
│ +            if state == "absent":
│ +                aux_absent.append(item)
│ +            else:
│ +                aux_stale.append(item)
│      out["aux_stale"] = aux_stale
│ +    out["aux_absent"] = aux_absent
│      return out
│
│
SUSTABDYTA — ir tai svarbiausia žinia: darbinėje kopijoje liko **nebaigtas** `scripts/check_published.py` pakeitimas, kuris šiuo metu yra nenuoseklus. Jo komituoti negalima.

PASKELBIMO BŪKLĖ (išmatuota, rc 0)

  python3 scripts/check_published.py → „Repozitorija: 45 moduliai / Paskelbta: 45 moduliai“
  grade-01: repo 45, gyvai 45
  missing_on_live 0 · hidden_locally 0 · not_in_path 0 · path_differs [] · stale 0
  stale_unknown 0 · aux_stale 0 · shell_stale 0 · shell_unreachable 0 · shell_count 18
  live_version = repo_version = ff833393 (neišstumta commit'ų: 0)
  retried_requests 0 · garsas 1332/1332 (visi, sampled false) — visi pasiekiami
  vanished_ids: 03-sakinio-tvarka → 03-sakinio-zodziai, resolved true, alias_ok true
  verdict: sutampa

3 GYVI ADRESAI (curl, HTTP kodas / baitai)

  content/lt/grade-01/matematika/04-skaiciu-tiese.json         200 / 3636
  content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json    200 / 5459
  content/lt/grade-01/pasaulio-pazinimas/22-medziai-krumai-zoles.json  200 / 7064

Pastaba: #340 ataskaitoje šis trečiasis buvo 404. Dabar jis gyvas — tai kito vaidmens darbas, ne publikavimo defektas; skolą uždarau.

VARTAI
  validate_content.py --grade 1 --strict → 0 klaidų, 0 įspėjimų, rc 0
  check_docs_facts.py → 0/0
  check_registry.py → 9 kryptys · 45 moduliai · 197 užduotys (optional 45) · 45 sim · našlaičiai 0 · PROBLEMŲ 0

SPRENDIMAS DĖL PUBLIKAVIMO: **sutampa** (45/45, 0 neišstumtų, garsas 1332/1332).

RADINYS — defektas mano paties vartuose (naujas, sąraše jo nėra)

Zondas `scratch/pub370/zondas_trukstamas_failas.py` (veidrodis be `04-skaiciu-tiese.json`, gyva svetainė failą turi) parodė:

  stale: [{"id":"04-skaiciu-tiese","repo_bytes":0,"live_bytes":0}]
  pranešimas: „repo 0 B, gyvai 0 B“

Tikrovė: repo failo NĖRA (ne 0 B), o gyvo failo dydis nebuvo matuotas nė karto — `compare()` grįžo anksčiau, `fetch()` net nebuvo iškviestas. Vartai raudoni (gerai), bet pranešimas siūlo „perkrauk publikavimą“ vietoj „taisyk indeksą“ — o vaidmens taisyklė šį atvejį vadina lūžusiu indeksu ir reikalauja jį įvardyti atskirai. Tai ta pati šeima kaip LL-21 (skaičius, kurio niekas neperskaičiavo) ir LL-37 (neišmatuota reikšmė rodoma kaip rezultatas).

KĄ SPĖJAU PADARYTI (ir kodėl tai nebaigta)

`compare()` dabar grąžina būseną (`ok|differs|absent|unreachable`) ir `-1` kaip „neišmatuota“, o `check_grade()` jau skiria `missing_in_repo` / `aux_absent` nuo `stale`. BET `report()` (eil. ~719–724, AUX_FILES ciklas) ir `verdict()` / spausdintuvas dar dirba su SENU boolean kontraktu. Kol tai nepataisyta:

  `ok, local_size, live_size = compare(...)` → `ok` yra ne-tuščia eilutė → `if not ok:` niekada netiesa
  → pasenęs `manifest.json` / `grades.json` būtų TYLIAI nerodomas (nauja tyli žalia, blogiau nei prieš darbą).

TODĖL: šios būklės komituoti negalima. Du saugūs keliai:
  1. užbaigti (4 vietos: report() AUX ciklas, verdict() `missing_in_repo`/`aux_absent`, spausdintuvas, docstring) ir paleisti zondą + tikrą bėgimą;
  2. `git checkout -- scripts/check_published.py` ir grąžinti defektą į eilę kaip pasiūlymą.

LIKO NEĮRAŠYTA (žingsniai baigėsi)
  1. `research/wiki/changelog.md` — #370 eilutė (repo 45 / paskelbta 45, versija ff833393, garsas 1332/1332).
  2. `research/wiki/guidelines/pamokos.md` — LL-118 „Neišmatuotas dydis, parodytas kaip 0 baitų“ (Simptomas / Priežastis / Taisyklė / Patikra; įrodymas — zondo išvestis aukščiau).
  3. `agents/state.json` blokas `last_publish_check_370` (failas `.gitignore`, todėl repo nepatenka).
  4. Pasiūlymas `agents/proposals/2026-11-18-publikavimo-agentas-neismatuotas-dydis.json`.

NIEKO NEŠALINAU, jokio ID nepernumeravau, `content/**`, `assets/**`, `docs/**` ir `AGENTS.md` neliečiau.

## klaidos

```
session_id: local-17474607c917ce2fb5f653e12082c666598e287b42b938182ff835d0d164c535
```
