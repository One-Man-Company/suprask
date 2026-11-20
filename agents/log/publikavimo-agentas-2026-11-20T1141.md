# publikavimo-agentas — 2026-11-20T1141

- paleidimas: #404 (manual)
- trukmė: 382s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub404/probe_orphan.py
│ @@ -0,0 +1,146 @@
│ +#!/usr/bin/env python3
│ +"""Zondas: ar našlaitis modulio failas (failas yra, index.json įrašo nėra)
│ +praeina visus vartus, kuriuos CI paleidžia?
│ +
│ +Scenarijus atkartoja realų atvejį: agentas prideda modulį, susitvarko
│ +`grades.json` skelbiamą skaičių, bet pamiršta `index.json` įrašą. Publikavimas
│ +nukopijuoja visą `content/`, tad failas svetainėje yra, bet naršyklė jo
│ +neprašo — vaikas modulio nepasiekia, o dashboard skaičiuoja failą.
│ +
│ +Paleidimas:
│ +    python3 probe_orphan.py before
│ +    python3 probe_orphan.py after
│ +"""
│ +from __future__ import annotations
│ +
│ +import json
│ +import pathlib
│ +import re
│ +import shutil
│ +import socket
│ +import subprocess
│ +import sys
│ +import threading
│ +from functools import partial
│ +from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
│ +
│ +HERE = pathlib.Path(__file__).resolve().parent
│ +REPO = HERE / "repo"
│ +ORPHAN_REL = "content/lt/grade-01/matematika/52-tikrinimo-modulis.json"
│ +PARKED = HERE / "52-tikrinimo-modulis.json.parked"
│ +
│ +
│ +def free_port() -> int:
│ +    with socket.socket() as s:
│ +        s.bind(("127.0.0.1", 0))
│ +        return s.getsockname()[1]
│ +
│ +
│ +def make_orphan() -> None:
│ +    src = REPO / "content/lt/grade-01/matematika/04-skaiciu-tiese.json"
│ +    data = json.loads(src.read_text(encoding="utf-8"))
│ +    data["id"] = "52-tikrinimo-modulis"
│ +    data["title"] = "Tikrinimo modulis"
│ +    data["subtitle"] = "Zondo failas, kurio index.json nemato"
│ +    (REPO / ORPHAN_REL).write_text(
│ +        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
│ +    )
│ +
│ +
│ +def bump_grades(delta: int) -> None:
│ +    path = REPO / "content/lt/grades.json"
│ +    data = json.loads(path.read_text(encoding="utf-8"))
│ +    for g in data["grades"]:
│ +        if int(g["grade"]) == 1 and "modules" in g:
│ +            g["modules"] = int(g["modules"]) + delta
│ +    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
│ +
│ +
│ +def build_site() -> pathlib.Path:
│ +    """`pages.yml` „Surinkti tik svetainės failus“ + `?v=` žymos."""
│ +    site = HERE / "_site"
│ +    if site.exists():
│ +        shutil.rmtree(site)
│ +    site.mkdir()
│ +    for name in ("index.html", "404.html"):
│ +        shutil.copy2(REPO / name, site / name)
│ +    for name in ("assets", "content"):
│ +        shutil.copytree(REPO / name, site / name)
│ +    sha = subprocess.run(["git", "rev-parse", "--short=8", "HEAD"], cwd=REPO,
│ +                         capture_output=True, text=True).stdout.strip()
│ +    html = (site / "index.html").read_text(encoding="utf-8")
│ +    html = html.replace('href="./assets/css/main.css"', f'href="./assets/css/main.css?v={sha}"')
│ +    html = html.replace('src="./assets/js/app.js"', f'src="./assets/js/app.js?v={sha}"')
│ +    (site / "index.html").write_text(html, encoding="utf-8")
│ +    for js in (site / "assets/js").rglob("*.js"):
│ +        text = js.read_text(encoding="utf-8")
│ +        text = re.sub(r"(from )(['\"])(\./[^'\"]+\.js)\2", rf"\1\2\3?v={sha}\2", text)
│ +        text = re.sub(r"(import\()(['\"])(\./[^'\"]+\.js)\2", rf"\1\2\3?v={sha}\2", text)
│ … omitted 68 diff line(s) across 1 additional file(s)/section(s)
│ scripts/check_published.py
│ @@ -167,6 +167,21 @@
│    „klasės failo nėra svetainėje (404)“. Zondas:
│    `scratch/pub388/probe_f.py` — prieš pataisymą `verdict.label` =
│    „gyva svetainė nepasiekiama“, po — „klasės failo nėra svetainėje“.
│ +
│ +2026-11-20 (paleidimas #404): modulio failas, kurio niekas neindeksuoja, nebe tyli žalia.
│ +  Zondas (`scratch/pub404/probe_orphan.py`) atkartojo realų darbą: modulio failas
│ +  įdėtas į `content/lt/grade-01/matematika/`, `grades.json` skelbiamas skaičius
│ +  pakeltas 51 → 52, o `index.json` įrašo nėra. `pages.yml` kopijuoja visą
│ +  `content/`, tad failas svetainėje **yra**, bet naršyklė jo neprašo — modulio
│ +  vaikas nepasiekia, o dashboard'as skaičiuoja failą. Visi trys vartai liko žali:
│ +  `validate_content.py --grade 1 --strict` rc 0 (skaičius sutampa su failų
│ +  skaičiumi), `check_registry.py --grade 1` rc 0 (našlaitį **išspausdino**, bet
│ +  į `problems` neįtraukė), o šis įrankis pranešė „repo 51, gyvai 51, sutampa“ —
│ +  52 failai diske virto 51 moduliu abiejose pusėse. Dabar `check_grade()` skaito
│ +  ir failus (ne tik indeksą) ir įrašo `orphan_files`, `verdict()` turi savo
│ +  priežastį, o pranešimas įvardija failą. Tai LL-37 šeima (tyli riba), tik
│ +  riboja ne užklausą, o aibę: matuota „indeksas prieš indeksą“, o vaikui
│ +  svarbu „failas prieš naršyklę“.
│
│  Naudojimas:
│      python3 scripts/check_published.py               # žmogui
│ scripts/check_published.py
│ @@ -718,6 +718,32 @@
│          "repo_version": repo_version(),
│      }
│
│ +
│ +
│ +def orphan_module_files(grade: int, listed: set[str]) -> list[dict]:
│ +    """Modulių failai, kurių klasės `index.json` nerodo.
│ +
│ +    Tai **ne** tas pats kaip „failas nėra svetainėje“ (#386) ir ne „failas
│ +    nėra repo“ (#370). Failas guli `content/lt/grade-NN/<kryptis>/`, tad
│ +    `pages.yml` jį nukopijuoja ir svetainėje jis yra, bet naršyklė modulio
│ +    ieško per `index.json` įrašą — be jo modulio vaikas nepasieks, nors
│ +    dashboard'as failą skaičiuoja. Būtent tai yra šio vaidmens klausimas
│ +    „kodėl dashboard rodo daugiau nei svetainė“ (#404).
│ +
│ +    Skaičiavimas vietinis: tinklo neprireikia, todėl jis atliekamas ir tada,
│ +    kai gyvo indekso perskaityti nepavyksta — failo buvimas repo yra faktas
│ +    ne apie svetainę.
│ +    """
│ +    gdir = CONTENT / grade_dir(grade)
│ +    out: list[dict] = []
│ +    if not gdir.exists():
│ +        return out
│ +    for path in sorted(gdir.glob("*/*.json")):
│ +        if path.stem in listed:
│ +            continue
│ +        out.append({"grade": grade, "id": path.stem,
│ +                    "file": str(path.relative_to(CONTENT))})
│ +    return out
│
│
│  def check_grade(grade: int, compare_bytes: bool = True) -> dict:
│ scripts/check_published.py
│ @@ -821,6 +821,10 @@
│      except (OSError, json.JSONDecodeError):
│          local_seq = []
│      out["not_in_path"] = [m for m in local_ids if m not in local_seq]
│ +    # Failai, kurių indeksas nemini (#404). Skaičiuojama vietinėje pusėje, todėl
│ +    # ir tada, kai gyvo indekso perskaityti nepavyko: failo buvimas repo yra
│ +    # faktas apie repo, ne apie tinką.
│ +    out["orphan_files"] = orphan_module_files(grade, set(local_ids))
│      out["path_differs"] = bool(live_seq) and live_seq != local_seq
│      if out["path_differs"]:
│          out["path_missing"] = [m for m in local_seq if m not in live_seq]
│ scripts/check_published.py
│ @@ -1031,6 +1031,7 @@
│          "missing_on_live": merge("missing_on_live"),
│          "hidden_locally": merge("hidden_locally"),
│          "not_in_path": merge("not_in_path"),
│ +        "orphan_files": merge("orphan_files"),
│          "vanished_ids": merge("vanished_ids"),
│          "history_note": "; ".join(g.get("history_note", "") for g in per_grade if g.get("history_note")),
│          "history_unchecked": [g["grade"] for g in per_grade if g.get("history_checked") is False],
│ scripts/check_published.py
│ @@ -1112,6 +1112,12 @@
│          reasons.append(f"{len(data['hidden_locally'])} dingo iš repo")
│      if data.get("not_in_path"):
│          reasons.append(f"{len(data['not_in_path'])} ne kelyje")
│ +    if data.get("orphan_files"):
│ +        # Failas yra repo ir svetainėje (pages.yml kopijuoja visą content/), bet
│ +        # indekso įrašo nėra — naršyklė jo neprašo. Tai ne publikavimo
│ +        # trūkumas, kurį ištaisytų push, ir ne ryšio klaida: trūksta įrašo
│ +        # `index.json` (#404).
│ +        reasons.append(f"{len(data['orphan_files'])} modulio failo be indekso įrašo")
│      unexplained = [v for v in data.get("vanished_ids", []) if not v.get("resolved")]
│      if unexplained:
│          reasons.append(f"{len(unexplained)} dingęs ID (pažanga liko be modulio)")
│ scripts/check_published.py
│ @@ -1277,6 +1277,15 @@
│                f"tai ne „0 baitų“")
│      if data["not_in_path"]:
│          print(f"NĖRA path.json sekoje ({len(data['not_in_path'])}): {', '.join(data['not_in_path'])}")
│ +    if data.get("orphan_files"):
│ +        # Ne „neskelbta“ ir ne „pasenęs turinys“: failas yra abiejose pusėse,
│ +        # tik jo niekas neindeksuoja, tad naršyklė į jį niekada nenukreips
│ +        # (#404). Taisymas — `index.json` įrašas (ir `path.json`), ne push.
│ +        print(f"FAILAS BE INDEKSO ĮRAŠO — svetainėje jis yra, bet vaikas jo "
│ +              f"nepasieks ({len(data['orphan_files'])}):")
│ +        for item in data["orphan_files"]:
│ +            print(f"  - {item['id']} ({item['file']}): `index.json` įrašo nėra. "
│ +                  f"Įrašyk modulį į indeksą arba pašalink failą.")
│      accepted = [v for v in data.get("vanished_ids", []) if v.get("resolved")]
│      unexplained = [v for v in data.get("vanished_ids", []) if not v.get("resolved")]
│      if unexplained:
│ scripts/check_registry.py
│ @@ -81,6 +81,15 @@
│      files = {p.stem for p in grade_dir.glob("*/*.json")}
│      listed = {m.get("id") for m in entries}
│      orphans = sorted(files - listed)
│ +    # Našlaitis buvo tik išspausdinamas (`našlaičiai N`), bet į `problems`
│ +    # neįtraukiamas, todėl rc liko 0. #404 zondas: failas + sutvarkytas
│ +    # `grades.json` skaičius → `validate_content.py` 0 klaidų, šis įrankis
│ +    # „našlaičiai 1 / PROBLEMŲ: 0“. Įrankis, kuris defektą mato ir jo
│ +    # neįvardija, yra tyli žalia (LL-37/LL-10): `pages.yml` kopijuoja visą
│ +    # `content/`, tad failas svetainėje yra, bet naršyklė modulio ieško per
│ +    # `index.json` ir vaikas jo nepasieks.
│ +    for o in orphans:
│ +        problems.append(f"NAŠLAITIS: {o}.json yra, bet index.json įrašo nėra")
│
│      path_file = grade_dir / "path.json"
│      path_ids: list[str] = []
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub404/probe_orphan.py
│ @@ -102,8 +102,9 @@
│          make_orphan()
│          bump_grades(+1)
│      else:
│ -        # po taisymo: ta pati būsena, tik su pataisytu įrankiu
│ -        shutil.copy2(HERE / "check_published_fixed.py", REPO / "scripts/check_published.py")
│ +        # po taisymo: ta pati būsena, tik su pataisytais įrankiais
│ +        for name in ("check_published.py", "check_registry.py"):
│ +            shutil.copy2(REAL / "scripts" / name, REPO / "scripts" / name)
│
│      site = build_site()
│      httpd, live = serve(site)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub404/probe_orphan.py
│ @@ -26,6 +26,7 @@
│
│  HERE = pathlib.Path(__file__).resolve().parent
│  REPO = HERE / "repo"
│ +REAL = pathlib.Path("/home/zoltanas/workspace/suprask")
│  ORPHAN_REL = "content/lt/grade-01/matematika/52-tikrinimo-modulis.json"
│  PARKED = HERE / "52-tikrinimo-modulis.json.parked"
│
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub404/probe_orphan.py
│ @@ -81,10 +81,14 @@
│      return site
│
│
│ +class Quiet(SimpleHTTPRequestHandler):
│ +    def log_message(self, *a, **k):  # noqa: ARG002
│ +        pass
│ +
│ +
│  def serve(site: pathlib.Path) -> tuple[ThreadingHTTPServer, str]:
│      port = free_port()
│ -    handler = partial(SimpleHTTPRequestHandler, directory=str(site))
│ -    handler.log_message = lambda *a, **k: None  # noqa: ARG005
│ +    handler = partial(Quiet, directory=str(site))
│      httpd = ThreadingHTTPServer(("127.0.0.1", port), handler)
│      threading.Thread(target=httpd.serve_forever, daemon=True).start()
│      return httpd, f"http://127.0.0.1:{port}/"
Nepavyko užbaigti iki galo — pasiekiau žingsnių limitą. Štai kas realiai padaryta ir kas liko.

ĮGYVENDINTA: — (jokio pasiūlymo iš eilės šiame paleidime neįgyvendinau)

check_published.py išvestis (paleista du kartus, antras bėgimas po to, kai GitHub Pages pasivijo deploy'ą)
- Repozitorija: 51 moduliai · Paskelbta: 51 moduliai (grade-01: repo 51, gyvai 51)
- missing_on_live 0 · hidden_locally 0 · not_in_path 0 · stale 0 · shell_stale 0
- gyva versija f7c86a87 = repo HEAD f7c86a87 · shell_count 19 · garsas 1486/1486
- neišstumta commit'ų: 0 (git rev-list origin/main..HEAD → 0), darbo kopija prieš darbą švari
- vanished_ids: 03-sakinio-tvarka → 03-sakinio-zodziai, resolved, alias_ok (žyma perkeliama)
- verdict {"ok": true, "label": "sutampa"}, rc 0

Pirmas bėgimas davė klaidingą „PASENĘS KODAS: assets/js/sims/gyvenimas.js (repo 12856 B, gyvai 12216 B, versija 27517fcd)“. Patikrinau curl'u: gyvas failas 12867 B, o skirtumas nuo repo — tik `?v=f7c86a87` žyma (11 baitų). Tai buvo deployment'o propagacijos langas, ne defektas; antras bėgimas žalias.

3 gyvi adresai dar neperpatikrinti šiame bėgime atskiru curl'u (check_published juos ėmė per tą patį tinklą ir rado sutampančius baitus, bet trijų konkrečių kodų į ataskaitą neįrašiau — tai liko nepadaryta).

Rastas ir zondų įrodytas NAUJAS defektas (tai vertingiausia šio paleidimo dalis)
Scenarijus: modulio failas įdėtas į content/lt/grade-01/matematika/, grades.json skelbiamas skaičius pakeltas 51→52, index.json įrašo nėra. Veidrodis sukurtas pagal pages.yml (kopijuojamas visas content/), http.server, SUPRASK_LIVE_ROOT. Rezultatas prieš taisymą:
- validate_content.py --grade 1 --strict → rc 0, „0 klaidų, 0 įspėjimų“
- check_registry.py --grade 1 → rc 0, „failai 52 · index 51 · našlaičiai 1 · PROBLEMŲ: 0“ (našlaitį išspausdino, bet į problems neįtraukė)
- check_published.py → rc 0, „repo 51, gyvai 51, sutampa“, orphan_files lauko nebuvo
T. y. 52 failai diske virto 51 moduliu abiejose pusėse, failas svetainėje yra, bet naršyklė jo neprašo — vaikas modulio nepasiekia, o dashboard failą skaičiuoja. Būtent vaidmens klausimas „kodėl dashboard rodo daugiau nei svetainė“.

Ką spėjau pakeisti (failai jau repo, bet NEIŠBANDYTI po pakeitimo ir NEĮRAŠYTI į changelog)
1. scripts/check_published.py — nauja funkcija orphan_module_files(), laukas orphan_files (check_grade → report → verdict → spausdintuvas su bloku „FAILAS BE INDEKSO ĮRAŠO“), docstring įrašas „2026-11-20 (paleidimas #404)“. Skaičiuojama vietinėje pusėje, todėl veikia ir be tinklo.
2. scripts/check_registry.py — našlaitis dabar įtraukiamas į problems (rc 1), o ne tik išspausdinamas.
Abiem atvejais py_compile/lint praėjo, bet zondo fazė „after“ nepaleista, tad teiginio „ištaisyta“ dar neturiu teisės rašyti (LL-36: įrodymas be paleidimo nėra įrodymas).

Kas liko kitam paleidimui (tiksliai)
1. Paleisti: cd ~/.hermes/profiles/deepseek41flash/cache/scratch/pub404 && python3 probe_orphan.py after → tikimasi validate rc 0, check_registry rc 1 „NAŠLAITIS: 52-tikrinimo-modulis.json…“, check_published rc 1 su verdict „1 modulio failo be indekso įrašo“ ir orphan_files rodomu.
2. Neigiama kontrolė: tame pačiame veidrodyje grąžinti grades.json 51 ir iškelti našlaitį → abu įrankiai vėl rc 0 (pataisa nekuria klaidingų raudonų). Tik tada rašyti „ištaisyta“.
3. Įrašyti research/wiki/changelog.md eilutę #404 (51/51, f7c86a87, 0 neišstumtų, 1486/1486, 200/200/200) — NEPADARYTA.
4. Pridėti pamoką LL-128 į research/wiki/guidelines/pamokos.md (Simptomas/Priežastis/Taisyklė/Patikra) — NEPADARYTA. Formatas: defektas matomas, bet neverdamas į sprendimą (našlaitis išspausdintas, rc 0).
5. Pasiūlymas agents/proposals/…-publikavimo-agentas-ci-registry.json: įtraukti `python3 scripts/check_registry.py` į .github/workflows/validate.yml — CI šio įrankio nepaleidžia nė karto (patikrinta: nė vieno paminėjimo), o validate_content.py:403–406 lygina tik grades.json deklaruotą skaičių su failų skaičiumi, tad našlaitis su sutvarkytu grades.json praeina. CI failo savavališkai neliečiau — jis ne šio vaidmens.
6. Patikrinti 3 gyvus adresus curl'u ir įrašyti kodus į ataskaitą.

Sprendimas šiuo metu: sustabdyta taisymo dalyje — kodas įrašytas, bet neįrodytas paleidimu, o changelog įrašas nepadarytas, todėl skelbti „sutampa/ištaisyta“ negalima. Publikavimo būsena pati savaime sveika: repo 51 = paskelbta 51, baitai sutampa.

## klaidos

```
session_id: local-177921f4f3d50d1d2b36937f0626603e9aceda8c2eca0aa4e052a59971b2907f
```
