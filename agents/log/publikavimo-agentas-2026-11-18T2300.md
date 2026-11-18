# publikavimo-agentas — 2026-11-18T2300

- paleidimas: #372 (manual)
- trukmė: 185s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_published.py
│ @@ -203,16 +203,20 @@
│      return list(dict.fromkeys(picked)), total
│
│
│ -def _audio_state(rel: str) -> tuple[str, int]:
│ -    """("ok"|"missing"|"empty"|"unreachable", baitai). HEAD, ne GET: turinys
│ -    čia neįdomus — įdomu, ar failas yra ir ar jis ne tuščias."""
│ -    url = AUDIO_URL_PREFIX + rel
│ +def head_state(url_rel: str) -> tuple[str, int]:
│ +    """"ok"|"missing"|"unreachable" ir baitai. HEAD, ne GET: turinys čia
│ +    neįdomus — įdomu, ar failas yra svetainėje.
│ +
│ +    `missing` reiškia **atsakymą** (404/410), `unreachable` — kad atsakymo
│ +    negavome nė po dviejų bandymų. Šios dvi būsenos skiriasi: pirmoji yra
│ +    faktas apie svetainę, antroji — apie ryšį. Sumaišytos jos praneštų
│ +    „failo nėra“ apie failą, kurio niekas nematė (LL-37).
│ +    """
│      for attempt in (0, 1):
│          try:
│ -            req = urllib.request.Request(LIVE_ROOT + url, headers=UA, method="HEAD")
│ +            req = urllib.request.Request(LIVE_ROOT + url_rel, headers=UA, method="HEAD")
│              with urllib.request.urlopen(req, timeout=20) as resp:
│ -                size = int(resp.headers.get("Content-Length") or 0)
│ -                return ("ok" if size > 0 else "empty"), size
│ +                return "ok", int(resp.headers.get("Content-Length") or 0)
│          except urllib.error.HTTPError as exc:
│              if exc.code in (404, 410):
│                  return "missing", -1
│ @@ -226,6 +230,14 @@
│                  continue
│              return "unreachable", -1
│      return "unreachable", -1
│ +
│ +
│ +def _audio_state(rel: str) -> tuple[str, int]:
│ +    """("ok"|"missing"|"empty"|"unreachable", baitai) — žr. `head_state()`."""
│ +    state, size = head_state(AUDIO_URL_PREFIX + rel)
│ +    if state == "ok" and size <= 0:
│ +        return "empty", size
│ +    return state, size
│
│
│  def check_audio(sample: int | None = None) -> dict:
│ scripts/check_published.py
│ @@ -204,7 +204,7 @@
│
│
│  def head_state(url_rel: str) -> tuple[str, int]:
│ -    """"ok"|"missing"|"unreachable" ir baitai. HEAD, ne GET: turinys čia
│ +    """"ok" | "missing" | "unreachable" ir baitai. HEAD, ne GET: turinys čia
│      neįdomus — įdomu, ar failas yra svetainėje.
│
│      `missing` reiškia **atsakymą** (404/410), `unreachable` — kad atsakymo
│ scripts/check_published.py
│ @@ -204,7 +204,7 @@
│
│
│  def head_state(url_rel: str) -> tuple[str, int]:
│ -    """"ok" | "missing" | "unreachable" ir baitai. HEAD, ne GET: turinys čia
│ +    """Būsena („ok“, „missing“, „unreachable“) ir baitai. HEAD, ne GET: turinys čia
│      neįdomus — įdomu, ar failas yra svetainėje.
│
│      `missing` reiškia **atsakymą** (404/410), `unreachable` — kad atsakymo
│ scripts/check_published.py
│ @@ -467,9 +467,15 @@
│      pataisyti indeksą (LL-21, LL-37).
│      """
│      if not local_path.exists():
│ -        # Gyvo failo dydis čia sąmoningai nematuojamas: be repo pusės lyginti
│ -        # nėra su kuo, o užklausa tikėtųsi atsakymo apie failą, kurio klausimas
│ -        # dar neaiškus. Grąžinama „nėra“, o ne „0 baitų“.
│ +        # Repo pusės nėra, bet gyva pusė **išmatuojama** ir tai keičia
│ +        # pranešimą: jei svetainėje failas yra, defektas yra tik indeksas
│ +        # (repo failą reikia grąžinti), o jei nėra — failo nėra niekur.
│ +        # #370 klaida buvo priešinga: grįžtant be matavimo pranešime
│ +        # atsirasdavo „repo 0 B, gyvai 0 B“, nors nė vienas dydis nebuvo
│ +        # matuotas (LL-21, LL-37).
│ +        state, live_size = head_state(url_rel)
│ +        if state == "ok":
│ +            return "absent", -1, live_size
│          return "absent", -1, -1
│      local = local_path.read_bytes()
│      live = fetch(LIVE_ROOT + url_rel)
│ scripts/check_published.py
│ @@ -726,8 +726,7 @@
│      def merge(key: str) -> list:
│          out: list = []
│          for g in per_grade:
│ -            for item in g.get(key, []):
│ -                out.append(item if isinstance(item, str) else item)
│ +            out.extend(g.get(key, []))
│          return out
│
│      live_errors = [f"{grade_dir(g['grade'])}: {g['live_error']}" for g in per_grade if g.get("live_error")]
│ scripts/check_published.py
│ @@ -734,11 +734,23 @@
│      # Svarbiausias failas, kurio modulio baitų ciklas neapima: garso manifestas.
│      # Jo stagnacija reiškia 404 naujo modulio garsui, o visi kiti vartai žali.
│      aux_stale = list(merge("aux_stale"))
│ +    aux_absent = list(merge("aux_absent"))
│      if compare_bytes:
│          for url_rel, local_path in AUX_FILES:
│ -            ok, local_size, live_size = compare(local_path, url_rel)
│ -            if not ok:
│ -                aux_stale.append({"file": url_rel, "repo_bytes": local_size, "live_bytes": live_size})
│ +            # Kontraktas yra būsena, ne boolean: `compare()` grąžina
│ +            # "ok"|"differs"|"absent"|"unreachable". Iki #372 čia buvo
│ +            # `if not ok:` — o ne tuščia būsena visada teisinga, tad
│ +            # pasenęs `manifest.json` / `grades.json` būdavo tyliai
│ +            # nerodomas (tyli žalia, blogiau nei prieš #370 darbą).
│ +            state, local_size, live_size = compare(local_path, url_rel)
│ +            if state == "ok":
│ +                continue
│ +            item = {"file": url_rel, "state": state,
│ +                    "repo_bytes": local_size, "live_bytes": live_size}
│ +            if state == "absent":
│ +                aux_absent.append(item)
│ +            else:
│ +                aux_stale.append(item)
│
│      # Svetainės kodas: ką vaikas iš tikrųjų įkelia, o ne tik ką rodo turinio JSON.
│      shell = check_shell() if compare_bytes else {
│ scripts/check_published.py
│ @@ -784,7 +784,10 @@
│          "history_unchecked": [g["grade"] for g in per_grade if g.get("history_checked") is False],
│          "stale": merge("stale"),
│          "stale_unknown": merge("stale_unknown"),
│ +        "stale_unmeasured": merge("stale_unmeasured"),
│ +        "miss

… PRALEISTA 2696 SIMBOLIŲ IŠ 20696 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00372/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

│          print(f"NĖRA path.json sekoje ({len(data['not_in_path'])}): {', '.join(data['not_in_path'])}")
│      accepted = [v for v in data.get("vanished_ids", []) if v.get("resolved")]
│ scripts/check_published.py
│ @@ -927,11 +927,13 @@
│          # nerodo todėl, kad repo indeksas rodo į failą, kurio nėra (LL-21).
│          print(f"LŪŽĘS INDEKSAS — įrašas yra, failo repo nėra ({len(data['missing_in_repo'])}):")
│          for item in data["missing_in_repo"]:
│ -            if item["live_bytes"] > 0:
│ -                live = f"svetainėje failas YRA ({item['live_bytes']} B) — repo kopija dingo"
│ -            elif item["live_bytes"] == -1:
│ -                live = "svetainėje failo taip pat nėra (arba nepasiektas)"
│ -            live = live if item["live_bytes"] > 0 else "svetainėje failo taip pat nėra"
│ +            size = item["live_bytes"]
│ +            if size > 0:
│ +                live = f"svetainėje failas yra ({size} B) — dingo repo kopija"
│ +            elif size == 0:
│ +                live = "svetainėje failas yra, bet tuščias (0 B)"
│ +            else:
│ +                live = "svetainėje jo nėra arba jis nepasiektas (neišmatuota)"
│              print(f"  - {item['id']} ({item['file']}): {live}. Taisyk indeksą, "
│                    f"ne publikavimą.")
│      if data.get("stale_unmeasured"):
│ scripts/check_published.py
│ @@ -973,6 +973,12 @@
│          for s in data["aux_stale"]:
│              live = "nepasiektas" if s["live_bytes"] < 0 else f"gyvai {s['live_bytes']} B"
│              print(f"  - {s['file']}: repo {s['repo_bytes']} B, {live}")
│ +    if data.get("aux_absent"):
│ +        print(f"PAGRINDINIO FAILO NĖRA REPO ({len(data['aux_absent'])}) — "
│ +              f"svetainė jį skaito prieš kiekvieną modulį:")
│ +        for s in data["aux_absent"]:
│ +            live = "neišmatuota" if s["live_bytes"] < 0 else f"gyvai {s['live_bytes']} B"
│ +            print(f"  - {s['file']}: repo failo nėra, {live}")
│      if data.get("shell_stale"):
│          print(f"PASENĘS KODAS — naršyklė vykdo kitą failą ({len(data['shell_stale'])}):")
│          for s in data["shell_stale"]:
│ scripts/check_published.py
│ @@ -93,6 +93,22 @@
│    `scratch/pub368/zondas_503.py` — veidrodis, kuris pirmą užklausą atsako 503,
│    o antrą 200, anksčiau davė raudoną, dabar žalią; veidrodis, kuris 503 atsako
│    visada, lieka raudonas.
│ +
│ +2026-11-18 (paleidimas #372): #370 palikta pusė darbo užbaigta ir tyli žalia uždaryta.
│ +  #370 `compare()` perdarė į būsenas (`ok|differs|absent|unreachable`) ir atskyrė
│ +  „indeksas rodo į failą, kurio repo nėra“ nuo „failas pasenęs“, bet trys
│ +  vartotojai liko su senu boolean kontraktu. Blogiausias — `report()` AUX_FILES
│ +  ciklas: `ok, _, _ = compare(...)`; `if not ok:` — o ne tuščia **eilutė**
│ +  visada teisinga, tad pasenęs `grades.json` / garso `manifest.json` nebūtų
│ +  parodytas nė karto (tyli žalia). Be to `missing_in_repo`, `aux_absent` ir
│ +  `stale_unmeasured` buvo surenkami `check_grade()` viduje ir **numetami**
│ +  `report()` išvestyje, o `verdict()` jų nepažino: zondas
│ +  (`scratch/pub370/zondas_trukstamas_failas.py`, veidrodis be modulio failo,
│ +  gyva svetainė jį turi) davė `verdict: sutampa, ok=True`. Dabar visi trys
│ +  būsenų vartotojai (AUX ciklas, `verdict()`, spausdintuvas) skaito būseną,
│ +  o trūkstamas repo failas rodomas kaip `LŪŽĘS INDEKSAS` su gyvos pusės
│ +  matavimu (`head_state()`): ar svetainėje failas yra. Neišmatuotas dydis
│ +  lieka `-1` ir pranešamas žodžiais, ne kaip „0 B“.
│
│  Naudojimas:
│      python3 scripts/check_published.py               # žmogui
│ profiles/deepseek41flash/cache/scratch/pub372/zondas_372.py
│ @@ -0,0 +1,143 @@
│ +"""Zondas #372: ar `check_published.py` mato tris skirtingus dalykus atskirai.
│ +
│ +Fone: #370 perdarė `compare()` į būsenas (`ok|differs|absent|unreachable`), bet
│ +`report()` AUX_FILES ciklas liko su senu boolean (`if not ok:` — o ne tuščia
│ +eilutė visada teisinga), o `missing_in_repo` / `aux_absent` buvo numetami iš
│ +`report()` išvesties, `verdict()` jų nepažino. Rezultatas buvo TYLI ŽALIA:
│ +`verdict: sutampa, ok=True`, nors repo trūksta modulio failo, į kurį rodo indeksas.
│ +
│ +Scenarijai (kiekvienas su savo veidrodžiu, gyva pusė — tikras repo per
│ +`http.server`, kad „svetainė failą turi“ būtų tikra, o ne prielaida):
│ +
│ +  A. veidrodis be `04-skaiciu-tiese.json`         → LŪŽĘS INDEKSAS, rc 1
│ +  B. veidrodis su pakeistu `manifest.json`         → PASENĘS PAGRINDINIS FAILAS, rc 1
│ +  C. veidrodis su pakeistu klasės `index.json`     → PASENĘS PAGRINDINIS FAILAS, rc 1
│ +  D. švarus veidrodis                              → sutampa, rc 0 (kad vartai
│ +     nemokėtų būti raudoni visada — toks vartas tas pats kaip joks, LL-37)
│ +
│ +Paleidimas: python3 zondas_372.py
│ +"""
│ +import contextlib
│ +import importlib.util
│ +import io
│ +import json
│ +import pathlib
│ +import shutil
│ +import sys
│ +import threading
│ +from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +SCRATCH = pathlib.Path(__file__).resolve().parent
│ +MIRROR = SCRATCH / "veidrodis"
│ +TARGET_REL = "content/lt/grade-01/matematika/04-skaiciu-tiese.json"
│ +MANIFEST_REL = "assets/audio/lt/manifest.json"
│ +GRADES_REL = "content/lt/grades.json"
│ +INDEX_REL = "content/lt/grade-01/index.json"
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
│ +def build_mirror() -> pathlib.Path:
│ +    if MIRROR.exists():
│ +        shutil.rmtree(MIRROR)
│ +    shutil.copytree(ROOT / "content" / "lt", MIRROR / "content" / "lt")
│ +    (MIRROR / MANIFEST_REL).parent.mkdir(parents=True, exist_ok=True)
│ +    shutil.copy2(ROOT / MANIFEST_REL, MIRROR / MANIFEST_REL)
│ +    return MIRROR
│ +
│ +
│ +def load(mirror: pathlib.Path, port: int):
│ +    spec = importlib.util.spec_from_file_location("cp", ROOT / "scripts" / "check_published.py")
│ +    mod = importlib.util.module_from_spec(spec)
│ +    spec.loader.exec_module(mod)
│ +    mod.CONTENT = mirror / "content" / "lt"
│ +    mod.GRADES = mirror / GRADES_REL
│ +    mod.AUX_FILES = [(GRADES_REL, mirror / GRADES_REL), (MANIFEST_REL, mirror / MANIFEST_REL)]
│ +    mod.LIVE_ROOT = f"http://127.0.0.1:{port}/"
│ +    return mod
│ +
│ +
│ +def run(mirror: pathlib.Path, port: int):
│ +    cp = load(mirror, port)
│ +    data = cp.report([1], compare_bytes=True, audio_sample=1)
│ +    sys.argv = ["check_published.py", "--grade", "1", "--audio-sample", "1"]
│ +    buf = io.StringIO()
│ +    with contextlib.redirect_stdout(buf):
│ +        rc = cp.main()
│ +    return data, buf.getvalue(), rc
│ +
│ +
│ +def scenario(name: str, mutate, expect_key: str, expect_text: str) -> bool:
│ +    mirror = build_mirror()
│ … omitted 65 diff line(s) across 1 additional file(s)/section(s)
│ scripts/check_published.py
│ @@ -664,7 +664,8 @@
│                  # nieko nepakeis, kol indeksas netaisytas. Vaidmens taisyklė
│                  # šį atvejį vadina lūžusiu indeksu ir reikalauja jį įvardyti
│                  # atskirai, o ne sumaišyti su publikavimo defektais.
│ -                missing_in_repo.append({"id": mid, "file": rel, "grade": grade})
│ +                missing_in_repo.append({"id": mid, "file": rel, "grade": grade,
│ +                                        "repo_bytes": local_size, "live_bytes": live_size})
│              elif state == "unreachable":
│                  stale_unknown.append(mid)
│              elif live_size < 0 or local_size < 0:
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub372/zondas_372.py
│ @@ -21,6 +21,7 @@
│  import importlib.util
│  import io
│  import json
│ +import os
│  import pathlib
│  import shutil
│  import sys
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub372/zondas_372.py
│ @@ -29,6 +29,10 @@
│  from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
│
│  ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +# CP_FILE leidžia paleisti tą patį zondą prieš seną versiją (neigiama kontrolė):
│ +#   git show HEAD:scripts/check_published.py > senas/check_published.py
│ +#   CP_FILE=$PWD/senas/check_published.py python3 zondas_372.py
│ +CP_FILE = pathlib.Path(os.environ.get("CP_FILE", ROOT / "scripts" / "check_published.py"))
│  SCRATCH = pathlib.Path(__file__).resolve().parent
│  MIRROR = SCRATCH / "veidrodis"
│  TARGET_REL = "content/lt/grade-01/matematika/04-skaiciu-tiese.json"
Nebaigta — bet pagrindinis darbas įrašytas į failą, ne tik ataskaita.

ĮGYVENDINTA: (nėra — šis paleidimas neturėjo eilės pasiūlymo numerio, darbas yra #370 likučio užbaigimas)

## Ką radau
HEAD (93bc123, #370 commitas) paliko `scripts/check_published.py` su dviem tyliomis žaliomis, blogesnėmis nei prieš tą darbą:
- `report()` AUX_FILES cikle `ok, _, _ = compare(...)` → `if not ok:` — `compare()` dabar grąžina **būseną** (ne tuščią eilutę), tad sąlyga visada teisinga ir pasenęs `grades.json` / garso `manifest.json` nebūtų parodytas nė karto.
- `missing_in_repo`, `aux_absent`, `stale_unmeasured` buvo surenkami `check_grade()` viduje, bet `report()` jų nemergino, `verdict()` nepažino, spausdintuvas neturėjo.

Empirinis įrodymas prieš taisymą (`zondas_trukstamas_failas.py`): veidrodis be `04-skaiciu-tiese.json`, gyva svetainė failą turi → `verdict: sutampa, ok=True`. Tai tyli žalia, nors repo indeksas rodo į neegzistuojantį failą.

## Ką pakeičiau (`scripts/check_published.py`)
- `compare()` kai repo failo nėra: dabar **matuoja gyvą pusę** per naują `head_state()` (HEAD su 404/410 kaip galutiniu atsakymu, `unreachable` atskirai) — `live_bytes > 0` reiškia „svetainėje yra, dingo repo kopija“.
- `_audio_state()` perdarytas ant `head_state()` (ne dubliuoja kodo).
- `check_grade()`: `missing_in_repo` įrašai gauna `repo_bytes`/`live_bytes`.
- `report()`: būsenų kontraktas AUX cikle, `stale_unmeasured`/`missing_in_repo`/`aux_absent` patenka į išvestį.
- `verdict()`: trys naujos priežastys („indekso įrašas be failo repo“, „pagrindinis failas be repo kopijos“, „modulis su neišmatuotu dydžiu“).
- Spausdintuvas: `LŪŽĘS INDEKSAS` blokas su gyvos pusės matavimu, `PAGRINDINIO FAILO NĖRA REPO`, `NEIŠMATUOTAS DYDIS`; neišmatuotas dydis niekada nerodomas kaip „0 B“.
- Docstring: #372 skyrius su priežastimi.

## Įrodymas (realus paleidimas)
`zondas_372.py` — 4 scenarijai, gyva pusė per `http.server` iš tikro repo:
- A (veidrodis be modulio failo): `missing_in_repo` 1 įrašas, `live_bytes: 3636`, `verdict ok=False`, rc 1, tekste `LŪŽĘS INDEKSAS` → GERAI
- B (pakeistas `manifest.json`): `aux_stale` 1, rc 1, `PASENĘS PAGRINDINIS FAILAS` → GERAI
- C (pakeistas klasės `index.json`): `aux_stale` 1, rc 1 → GERAI
- D (švarus veidrodis): `sutampa`, rc 0 → GERAI
- Rezultatas: **4/4**, 10,2 s. Pirmas zondo bėgimas rado `KeyError: 'live_bytes'` spausdintuve — tai įrodo, kad senoji būsena žmogaus kelio nebuvo išbandyta nė karto; sutaisyta.

## LIKO NEĮRAŠYTA (baigėsi žingsniai, ne failas)
1. Neigiama kontrolė: `git show HEAD:scripts/check_published.py > senas/…` ir `CP_FILE=… python3 zondas_372.py` (zondas jau paruoštas tam, bet paleidimas neįvyko).
2. Tikras bėgimas prieš gyvą svetainę: `python3 scripts/check_published.py --grade 1` (repo/paskelbta/neišstumta skaičiai, 3 HTTP kodai) + `validate_content.py --grade 1 --strict`.
3. `research/wiki/changelog.md` — #372 eilutė su skaičiais.
4. `research/wiki/guidelines/pamokos.md` — **LL-119** (LL-118 jau užimta #337 pamoka): „Būsena, paleista kaip boolean“ — Simptomas/Priežastis/Taisyklė/Patikra, įrodymas `zondas_372.py` 4/4 ir senos versijos `verdict: sutampa`.
5. `agents/state.json` blokas `last_publish_check_372` (failas `.gitignore`, repo nepatenka).

NIEKO nešalinau, jokio modulio ID nepernumeravau, `content/**`, `assets/**`, `docs/**`, `AGENTS.md` neliečiau. Pakeistas vienas failas: `scripts/check_published.py`.

## klaidos

```
session_id: local-9a22e7aef2c117f5b700c297c9cbdccda34a793e46ca99a0fe379ffa9603063b
```
