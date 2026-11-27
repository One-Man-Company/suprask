#!/usr/bin/env python3
"""Zondas `check_published.py` aibių sprendimams — pakartojamas, be interneto.

Kodėl šis failas egzistuoja (LL-36, LL-21). `check_published.py` docstring'e
kelios neigiamos kontrolės cituojamos kaip `scratch/pubNNN/*.py`, o
`git log --all -- scratch` rodo 0 commit'ų: tie failai niekada nebuvo repo,
tad teiginį „zondas rodė taip“ skaitytojas turėjo priimti tikėjimu. Blogiausia
ne tai, kad dokumentas neturi įrodymo, o tai, kad **nebuvo ko paleisti iš
naujo** — regresija būtų likusi nepastebėta.

Šis zondas stato laikiną repo (su tikru `git` ir `origin/main`, kad
`unpushed()` ir istorijos patikra veiktų taip pat, kaip darbe) ir atskirą
gyvos svetainės veidrodį, patiekiamą vietiniu `http.server`. Tada per patį
`report()` tikrina sprendimus, nuo kurių priklauso vaiko pažanga:

  A  sveika būsena → „sutampa“, rc 0 (kontrolinė; be jos neigiami atvejai
     nieko neįrodytų);
  B  gyvame indekse trūksta repo modulio → `missing_on_live`, rc 1, o tas
     pats ID ne kartojamas kaip „pasenęs“ (LL-37 — vienas defektas, viena
     eilutė);
  C  gyvame indekse yra modulis, kurio repo nebėra → `hidden_locally`
     („dingo iš repo“): tai vaidmens taisyklės „sustok ir pranešk“ atvejis —
     vaiko žyma rodo į modulį, kurio daugiau niekas nekuria;
  D  repo yra modulio failas be indekso įrašo → `orphan_files`
     (publikavimas jį įkelia, o naršyklė jo niekada neprašo);
  E  indeksas rodo į failą, kurio repo nėra → `missing_in_repo` (lūžęs
     indeksas: publikavimas čia nieko nepakeis);
  F  modulio failas gyvai 404, nors indeksas jį rodo → `live_missing`
     (nepasibaigęs publikavimas, ne „bandyk dar kartą“);
  G  pirma užklausa 503, antra 200 → žalia ir `RETRIES` skaičius matomas
     (#368 teiginys „laikina klaida kartojama“, dabar paleidžiamas);
  H  visada 503 → `unreachable`, o pranešimas sako „nepasiekiama“, ne
     „nėra“ (#386/#388 atskyrimas);
  I  ne git katalogas → istorijos patikra **nepavyko**, rc 1 (iki #506
     `historical_ids()` grąžindavo `checked = True`, tad dingęs ID likdavo
     žalias — LL-175);
  J  atkūrus sveiką būseną → vėl žalia (patikra „neįsimena“ klaidos);
  N  sugadintas `grades.json` **abiejose** pusėse → NE „sutampa“, o priežastis
     ir rc 1. Iki #515 `live_grades()` klaidą paversdavo `[1]`, tad įrankis
     matavo vieną klasę ir skelbė žalią apie svetainę, kurios naršyklė
     neįkelia nė vienos klasės (`app.js:110`) — LL-37 atvirkštinė pusė;
  O  kataloge klasė su moduliais, kurios `grades.json` neskelbia `live` →
     `undeclared_grades` ir rc 1. Anksčiau ji į `local`/`published`
     nepatikdavo nė karto, tad dashboard'as rodė daugiau negu svetainė, o
     įrankis tylėjo — tas pats vaidmens klausimas klases lygmenyje;
     O2 — tas pats per `--scope` (be tinklo, be git), t. y. prieš push:
     CI vartai, kurie anksčiau šio katalogo nematė;
  P  `live` klasė be `index.json` repo → `missing_index` su vardu;
  Q  nė viena klasė `live` → `--path-order` rc 1 (anksčiau `all([])` davė
     rc 0, t. y. CI žingsnis „praeidavo“ nieko nematuodamas);
  R  failas atsakė 404 be žymės, o su `?cb=` — 200 ir tie patys baitai →
     „sutampa“, rc 0, o pranešime įvardyta priežastis („CDN neigiama
     kopija“). Iki #537 toks atvejis virsdavo `live_missing` ir
     „sustabdyta“, tad sekantis agentas eidavo ieškoti ištrinto turinio;
  S  tas pats kelias 404 **ir su žyme** → vis dar `live_missing`, rc 1:
     pakartojimas negali paversti tikro nebuvimo žalia;
  T  baitai skiriasi, o LL-76 pakartojimas atsako 404 → `gone`, o ne
     `unreachable`: 404 lieka atsakymu ir antru matavimu;
  U  tas pats adresas be žymės atsako **200, bet senais baitais** (krašto
     teigiama kopija), o su `?cb=` — repo baitai → „sutampa“, rc 0, `stale`
     tuščias, o pranešime įvardyta „CDN SENA KOPIJA“. Iki #539 tai virsdavo
     `stale` + „sustabdyta“, tad agentas eidavo ieškoti turinio skirtumo,
     kurio repo neturi;
  V  seni baitai ir be žymės, ir su ja → vis dar `stale`, rc 1: pataisa
     negali tikro deploy atsilikimo paversti žaliu (neigiama U kontrolė).

Repo failai nekeičiami: viskas vyksta `tempfile` kataloge, kuris ištrinamas.
Zondą galima paleisti bet kada, taip pat kaip regresijos patikrą.

Naudojimas:
    python3 scripts/probe_publish_sets.py     # 0 — visi lūkesčiai išsipildė
"""

from __future__ import annotations

import contextlib
import functools
import http.server
import io
import json
import pathlib
import shutil
import subprocess
import sys
import tempfile
import threading

HERE = pathlib.Path(__file__).resolve().parent
REAL_ROOT = HERE.parent
sys.path.insert(0, str(HERE))

import check_published as cp  # noqa: E402

results: list[tuple[str, bool, str]] = []

# Globalai, kuriuos zondas perjungia į laikiną repo. Grąžinami `finally`, kad
# po zondo šiame procese liktų tikrasis repo (kitaip vėlesnis `report()` šiame
# procese matuotų ištrintą katalogą — LL-36 atvirkštinė pusė).
PATCHED = ("ROOT", "CONTENT", "GRADES", "AUX_FILES", "RENAMES", "PATH_ORDER",
           "LOST_GRADES", "AUDIO_MANIFEST", "LIVE_ROOT", "DEPLOY_WAIT", "RETRY_PAUSE")


def check(name: str, ok: bool, detail: str) -> None:
    results.append((name, ok, detail))
    print(f"{'OK  ' if ok else 'KLAIDA'} {name} — {detail}")


class _QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):  # noqa: A002 - bazinės klasės vardas
        pass


def serve(base: pathlib.Path):
    handler = functools.partial(_QuietHandler, directory=str(base))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, f"http://127.0.0.1:{httpd.server_address[1]}/"


def write_module(root: pathlib.Path, mid: str) -> None:
    path = root / "content" / "lt" / "grade-01" / "matematika" / f"{mid}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"id": mid, "title": mid, "grade": 1},
                               ensure_ascii=False), encoding="utf-8")


def write_index(root: pathlib.Path, ids: list[str], extra: list[str] | None = None) -> None:
    """Klasės `index.json`. `extra` — gyvos pusės įrašai be failų (C atvejis)."""
    modules = [{"id": mid, "title": mid, "file": f"grade-01/matematika/{mid}.json"}
               for mid in ids]
    modules += [{"id": mid, "title": mid, "file": f"grade-01/matematika/{mid}.json"}
                for mid in (extra or [])]
    data = {"grade": 1, "strands": [{"id": "matematika", "grade": 1,
                                     "modules": modules}]}
    path = root / "content" / "lt" / "grade-01" / "index.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")


def write_path(root: pathlib.Path, ids: list[str]) -> None:
    path = root / "content" / "lt" / "grade-01" / "path.json"
    path.write_text(json.dumps({"sequence": list(ids)}, ensure_ascii=False),
                    encoding="utf-8")


def build_repo(root: pathlib.Path) -> None:
    write_module(root, "01-a")
    write_module(root, "02-b")
    write_index(root, ["01-a", "02-b"])
    write_path(root, ["01-a", "02-b"])
    (root / "content" / "lt" / "grades.json").write_text(
        json.dumps({"grades": [{"grade": 1, "status": "live"}]}, ensure_ascii=False),
        encoding="utf-8")
    (root / "index.html").write_text(
        "<!doctype html><title>zondas</title>"
        '<link rel="stylesheet" href="./assets/css/main.css">'
        '<script type="module" src="./assets/js/app.js"></script>',
        encoding="utf-8")
    (root / "404.html").write_text(
        '<!doctype html><title>nera</title>'
        '<link rel="stylesheet" href="/assets/css/main.css">'
        '<a id="i-pradzia" href="/">Į pradžią</a>'
        # Atsarginio puslapio spalvos — `main.css` tokenų kopija (be CSS
        # `var(--paper)` neveikia). Vartas `depth_palette_check()` lygina jas
        # kiekvieną bėgimą, tad zondo veidrodis turi turėti abi puses.
        '<style>body{background:#fdf8ef;color:#23201c}'
        '.eyebrow{color:#6f665a}.lede{color:#5f574d}.btn{background:#ff8a3d;'
        'color:#23201c}</style>',
        encoding="utf-8")
    (root / "assets" / "css").mkdir(parents=True, exist_ok=True)
    (root / "assets" / "css" / "main.css").write_text(
        ":root {\n"
        "  --paper: #fdf8ef;\n  --ink: #23201c;\n  --ink-soft: #5f574d;\n"
        "  --ink-faint: #6f665a;\n  --accent: #ff8a3d;\n  --on-accent: #23201c;\n"
        "}\n",
        encoding="utf-8")
    (root / "assets" / "audio" / "lt").mkdir(parents=True, exist_ok=True)
    (root / "assets" / "audio" / "lt" / "manifest.json").write_text("{}", encoding="utf-8")
    # Publikuojamas, o naršyklės neįkeliamas failas — `pages.yml` kopijuoja
    # visą `content/`. Būtent tokio failo be matavimo iki #558 niekas nematė.
    (root / "content" / "audio-overrides.json").write_text('{"Ruduo": "rud\\u02c8uo"}',
                                                           encoding="utf-8")
    (root / "scripts").mkdir(exist_ok=True)
    (root / "scripts" / "known_renames.json").write_text("{}", encoding="utf-8")
    (root / "scripts" / "known_path_order.json").write_text(
        json.dumps({"grades": {"1": {"sequence": ["01-a", "02-b"],
                                     "accepted_at": "2026-11-24T00:00:00+02:00"}}},
                   ensure_ascii=False), encoding="utf-8")


def git(repo: pathlib.Path, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], cwd=repo, capture_output=True, text=True)


def init_git(repo: pathlib.Path) -> pathlib.Path:
    """Tikras repo su `origin/main`: be jo `unpushed()` sakytų „nepatikrinta“."""
    git(repo, "init", "-q")
    git(repo, "symbolic-ref", "HEAD", "refs/heads/main")
    git(repo, "config", "user.email", "zondas@example.invalid")
    git(repo, "config", "user.name", "zondas")
    git(repo, "add", "-A")
    git(repo, "commit", "-qm", "zondas: pradinė būsena")
    bare = repo.parent / "origin.git"
    subprocess.run(["git", "init", "--bare", "-q", str(bare)], capture_output=True)
    git(repo, "remote", "add", "origin", str(bare))
    git(repo, "push", "-q", "-u", "origin", "main")
    return bare


def publish(repo: pathlib.Path, live: pathlib.Path) -> None:
    """Gyvos svetainės veidrodis: tai, ką `pages.yml` įkelia.

    `index.html` **ne** kopijuojamas pažodžiui: `pages.yml` prieš įkeldama
    prirašo commit'o trumpinį prie CSS/JS nuorodų (`?v=<sha>`), ir būtent ta
    žymė yra vienintelis `deploy_pending` šaltinis. Veidrodis be jos matuotų
    būseną, kurios svetainėje niekada nebūna, tad zondas apie versiją
    neįrodytų nieko (#544, LL-201).
    """
    shutil.copytree(repo / "content", live / "content", dirs_exist_ok=True)
    shutil.copytree(repo / "assets", live / "assets", dirs_exist_ok=True)
    for name in ("404.html",):
        shutil.copyfile(repo / name, live / name)
    sha = git(repo, "rev-parse", "--short=8", "HEAD").stdout.strip()
    html = (repo / "index.html").read_text(encoding="utf-8")
    html = html.replace('src="./assets/js/app.js"', f'src="./assets/js/app.js?v={sha}"')
    html = html.replace('href="./assets/css/main.css"', f'href="./assets/css/main.css?v={sha}"')
    (live / "index.html").write_text(html, encoding="utf-8")


def patch(root: pathlib.Path, url: str) -> None:
    cp.ROOT = root
    cp.CONTENT = root / "content" / "lt"
    cp.GRADES = cp.CONTENT / "grades.json"
    cp.AUX_FILES = [
        ("content/lt/grades.json", cp.CONTENT / "grades.json"),
        ("assets/audio/lt/manifest.json", root / "assets" / "audio" / "lt" / "manifest.json"),
        # #558: publikuojamas failas, kurį iki tol matavo nė vienas vartas.
        ("content/audio-overrides.json", root / "content" / "audio-overrides.json"),
    ]
    cp.RENAMES = root / "scripts" / "known_renames.json"
    # Zondo veidrodis neturi skaityti TIKRO repo `known_lost_grades.json`:
    # kitaip zondas matuotų dviejų repo sankirtą, o ne savo būseną.
    cp.LOST_GRADES = root / "scripts" / "known_lost_grades.json"
    cp.PATH_ORDER = root / "scripts" / "known_path_order.json"
    cp.AUDIO_MANIFEST = root / "assets" / "audio" / "lt" / "manifest.json"
    cp.LIVE_ROOT = url
    cp.DEPLOY_WAIT = 0        # deploy lange nėra ko laukti: veidrodis atsako iš karto
    cp.RETRY_PAUSE = 0.02     # zondas tikrina, KIEK kartų kartojama, ne pauzę


def ids(items: list[dict] | list[str]) -> list[str]:
    return [i["id"] if isinstance(i, dict) else i for i in items]


def run_cli(argv: list[str]) -> tuple[int, str]:
    """`main()` su tuo pačiu laikinu repo — rc turi sekti `verdict()`, ne atvirkščiai."""
    buf = io.StringIO()
    saved_argv = sys.argv
    sys.argv = ["check_published.py", *argv]
    try:
        with contextlib.redirect_stdout(buf):
            rc = cp.main()
    finally:
        sys.argv = saved_argv
    return rc, buf.getvalue()


def main() -> int:
    tmp = pathlib.Path(tempfile.mkdtemp(prefix="probe_sets_"))
    saved = {name: getattr(cp, name) for name in PATCHED}
    httpd = None
    try:
        repo = tmp / "repo"
        live = tmp / "live"
        repo.mkdir()
        build_repo(repo)
        init_git(repo)
        publish(repo, live)
        httpd, url = serve(live)
        patch(repo, url)

        # A. Kontrolinė būsena.
        data = cp.report([1])
        check("A: sveikas veidrodis → „sutampa“",
              data["local"] == 2 and data["published"] == 2
              and data["verdict"]["ok"] and not data["verdict"]["reasons"],
              f"repo {data['local']} / gyvai {data['published']}, "
              f"verdict {data['verdict']['label']}")
        rc, out = run_cli(["--grade", "1"])
        check("A: rc 0 ir išvestis be klaidų", rc == 0 and "sutampa" in out,
              f"rc {rc}, {out.strip().splitlines()[0] if out.strip() else 'tuščia'}")

        # Y. Vartų rėmas (#558): kiekvienas publikuojamas failas turi matavimą.
        #    Be šio bloko `coverage()` būtų vartas, kurio niekas nepaleidžia —
        #    LL-207 (vartas, kurį pamoka vadina privalomu, o nepaleidžia nė
        #    vienas kelias).
        check("Y: sveikame veidrodyje nėra neišmatuotų publikuojamų failų",
              data.get("coverage", {}).get("unmeasured") == []
              and data.get("coverage", {}).get("not_published") == []
              and data["coverage"]["published_count"] >= 5,
              f"coverage {data.get('coverage')}")
        # Y2. Neigiama kontrolė: failas publikuojamas, o matavimo nėra.
        saved_aux = list(cp.AUX_FILES)
        cp.AUX_FILES = [a for a in cp.AUX_FILES
                        if a[0] != "content/audio-overrides.json"]
        data = cp.report([1])
        rc, out = run_cli(["--grade", "1"])
        check("Y2: publikuojamas failas be matavimo → raudona ir įvardytas",
              not data["verdict"]["ok"]
              and data["coverage"]["unmeasured"] == ["content/audio-overrides.json"]
              and any("be matavimo" in r for r in data["verdict"]["reasons"])
              and rc == 1 and "PUBLIKUOJAMAS FAILAS BE MATAVIMO" in out,
              f"unmeasured {data['coverage']['unmeasured']}, rc {rc}, "
              f"reasons {data['verdict']['reasons']}")
        check("Y2: sena būsena (be įrašo `AUX_FILES`) būtų buvusi žalia — "
              "defektas realus, o ne įsivaizduojamas",
              "content/audio-overrides.json" not in cp.measured_files([1])
              and data["coverage"]["published_count"]
              > len(cp.measured_files([1]) & cp.published_files()) - 1,
              "failas publikuojamas, bet ne matuojamas — iki #558 niekas "
              "nepasakydavo")
        cp.AUX_FILES = saved_aux
        # Y3. Naujasis AUX įrašas tikrai lygina baitus: pakeitus gyvą kopiją,
        #     turi atsirasti `aux_stale` su tuo failu.
        live_over = live / "content" / "audio-overrides.json"
        original = live_over.read_bytes()
        live_over.write_bytes(original + b"\n")
        data = cp.report([1])
        check("Y3: pakitęs `content/audio-overrides.json` → `aux_stale`",
              any(i["file"] == "content/audio-overrides.json"
                  for i in data.get("aux_stale", []))
              and not data["verdict"]["ok"],
              f"aux_stale {[i['file'] for i in data.get('aux_stale', [])]}, "
              f"reasons {data['verdict']['reasons']}")
        live_over.write_bytes(original)
        data = cp.report([1])
        check("Y3b: atstačius failą — vėl „sutampa“", data["verdict"]["ok"],
              f"verdict {data['verdict']['label']}")

        # B. Gyvame indekse trūksta vieno repo modulio.
        write_index(live, ["01-a"])
        data = cp.report([1])
        stale_ids = ids(data["stale"])
        check("B: `missing_on_live` = 02-b", ids(data["missing_on_live"]) == ["02-b"],
              f"missing_on_live {ids(data['missing_on_live'])}")
        check("B: tas pats ID ne kartojamas kaip „pasenęs“ (LL-37)",
              "02-b" not in stale_ids,
              f"stale {stale_ids}")
        check("B: verdict sako „1 neskelbta“",
              not data["verdict"]["ok"] and "1 neskelbta" in data["verdict"]["reasons"],
              f"reasons {data['verdict']['reasons']}")

        # C. Gyvame indekse yra modulis, kurio repo nebėra — „sustok“ atvejis.
        write_index(live, ["01-a", "02-b"], extra=["03-c"])
        data = cp.report([1])
        check("C: `hidden_locally` = 03-c", ids(data["hidden_locally"]) == ["03-c"],
              f"hidden_locally {ids(data['hidden_locally'])}")
        check("C: verdict „dingo iš repo“, rc 1",
              not data["verdict"]["ok"]
              and any("dingo iš repo" in r for r in data["verdict"]["reasons"])
              and run_cli(["--grade", "1"])[0] == 1,
              f"reasons {data['verdict']['reasons']}")

        # D. Repo turi modulio failą, kurio indeksas nemini.
        write_index(live, ["01-a", "02-b"])
        write_module(repo, "09-z")
        data = cp.report([1])
        check("D: `orphan_files` = 09-z", ids(data["orphan_files"]) == ["09-z"],
              f"orphan_files {ids(data['orphan_files'])}")
        check("D: verdict „modulio failo be indekso įrašo“",
              not data["verdict"]["ok"]
              and any("be indekso įrašo" in r for r in data["verdict"]["reasons"]),
              f"reasons {data['verdict']['reasons']}")
        (repo / "content" / "lt" / "grade-01" / "matematika" / "09-z.json").unlink()

        # E. Indeksas rodo į failą, kurio repo nėra (lūžęs indeksas).
        write_index(repo, ["01-a", "02-b", "10-y"])
        data = cp.report([1])
        check("E: `missing_in_repo` = 10-y", ids(data["missing_in_repo"]) == ["10-y"],
              f"missing_in_repo {ids(data['missing_in_repo'])}")
        check("E: verdict įvardija „indekso įrašas be failo repo“",
              any("indekso įrašas be failo repo" in r for r in data["verdict"]["reasons"]),
              f"reasons {data['verdict']['reasons']}")
        write_index(repo, ["01-a", "02-b"])

        # F. Failas gyvai 404, nors abu indeksai jį rodo.
        (live / "content" / "lt" / "grade-01" / "matematika" / "01-a.json").unlink()
        data = cp.report([1])
        check("F: `live_missing` = 01-a", ids(data["live_missing"]) == ["01-a"],
              f"live_missing {ids(data['live_missing'])}")
        check("F: verdict „modulio failo nėra svetainėje“",
              any("modulio failo nėra svetainėje" in r for r in data["verdict"]["reasons"]),
              f"reasons {data['verdict']['reasons']}")
        publish(repo, live)

        # G. Pirma užklausa 503, antra 200 — laikina klaida neturi virsti „nėra“.
        flaky = {"hits": 0}

        class _Flaky(_QuietHandler):
            def do_GET(self):  # noqa: N802 - bazinės klasės vardas
                flaky["hits"] += 1
                if flaky["hits"] == 1:
                    self.send_error(503)
                    return
                super().do_GET()

            def do_HEAD(self):  # noqa: N802 - bazinės klasės vardas
                flaky["hits"] += 1
                if flaky["hits"] == 1:
                    self.send_error(503)
                    return
                super().do_HEAD()

        httpd2 = http.server.ThreadingHTTPServer(
            ("127.0.0.1", 0), functools.partial(_Flaky, directory=str(live)))
        threading.Thread(target=httpd2.serve_forever, daemon=True).start()
        url2 = f"http://127.0.0.1:{httpd2.server_address[1]}/"
        cp.LIVE_ROOT = url2
        cp.RETRIES["count"] = 0
        state, blob = cp.fetch_answer(url2 + "content/lt/grade-01/index.json")
        check("G: 503 → 200 → `ok`, o pakartojimas suskaičiuotas",
              state == "ok" and blob is not None and cp.RETRIES["count"] >= 1,
              f"būsena {state}, pakartojimų {cp.RETRIES['count']}")
        httpd2.shutdown()
        httpd2.server_close()
        cp.LIVE_ROOT = url

        # H. Visada 503 — nepasiekiamumas, o ne „modulio nėra“.
        class _Down(_QuietHandler):
            def do_GET(self):  # noqa: N802
                self.send_error(503)

            def do_HEAD(self):  # noqa: N802
                self.send_error(503)

        httpd3 = http.server.ThreadingHTTPServer(
            ("127.0.0.1", 0), functools.partial(_Down, directory=str(live)))
        threading.Thread(target=httpd3.serve_forever, daemon=True).start()
        url3 = f"http://127.0.0.1:{httpd3.server_address[1]}/"
        state, blob = cp.fetch_answer(url3 + "content/lt/grade-01/index.json")
        check("H: visada 503 → `unreachable`, be baitų",
              state == "unreachable" and blob is None, f"būsena {state}")
        httpd3.shutdown()
        httpd3.server_close()

        # I. Ne git katalogas: istorijos patikra nepavyko, o ne „0 dingusių“.
        nogit = tmp / "repo-be-git"
        shutil.copytree(repo, nogit, ignore=shutil.ignore_patterns(".git"))
        patch(nogit, url)
        seen, note, checked = cp.historical_ids(1)
        check("I: be git → `checked` False ir priežastis įvardyta",
              checked is False and not seen and "git" in note,
              f"checked {checked}, pastaba „{note}“")
        data = cp.report([1])
        check("I: verdict „dingusių ID patikra neįvyko“, rc 1",
              not data["verdict"]["ok"]
              and any("dingusių ID patikra neįvyko" in r for r in data["verdict"]["reasons"])
              and run_cli(["--grade", "1"])[0] == 1,
              f"reasons {data['verdict']['reasons']}")

        # J. Atkūrimas: ta pati patikra vėl žalia.
        patch(repo, url)
        data = cp.report([1])
        check("J: atkūrus → vėl „sutampa“",
              data["verdict"]["ok"],
              f"verdict {data['verdict']['label']}")

        # L. Klasės indekso svetainėje nėra (404). Tai atsakymas, ne ryšio
        #    gedimas: pranešimas turi siųsti publikuoti, o ne kartoti užklausą
        #    (#388). Skirtumas vaikui: „bandyk dar kartą“ būtų netiesa.
        live_index = live / "content" / "lt" / "grade-01" / "index.json"
        blob = live_index.read_bytes()
        live_index.unlink()
        data = cp.report([1])
        check("L: gyvo indekso 404 → `live_gone`, ne „nepasiekiama“",
              bool(data["live_gone"]) and data["published_measured"] is False
              and any("klasės failo nėra svetainėje" in r
                      for r in data["verdict"]["reasons"])
              and not any("gyva svetainė nepasiekiama" in r
                          for r in data["verdict"]["reasons"]),
              f"reasons {data['verdict']['reasons']}")
        check("L: „Paskelbta“ nepranešama kaip 0 (LL-37)",
              data["published"] == 0 and data["published_measured"] is False,
              f"published {data['published']}, measured {data['published_measured']}")
        live_index.write_bytes(blob)
        data = cp.report([1])
        check("M: indeksą grąžinus → vėl „sutampa“",
              data["verdict"]["ok"], f"verdict {data['verdict']['label']}")

        # N. Klasės sąrašas sugadintas ABEJOSE pusėse — baitai sutampa, o
        #    naršyklė neįkelia nė vienos klasės (`app.js:110`). Iki šio
        #    pataisymo `live_grades()` klaidą paversdavo `[1]`, tad įrankis
        #    matavo vieną klasę ir skelbė „sutampa“: LL-37 riba, kuri neša
        #    „viskas gerai“ apie svetainę be turinio.
        grades_path = repo / "content" / "lt" / "grades.json"
        live_grades_path = live / "content" / "lt" / "grades.json"
        good_grades = grades_path.read_bytes()
        grades_path.write_text("{ ne json", encoding="utf-8")
        live_grades_path.write_text("{ ne json", encoding="utf-8")
        data = cp.report(None)
        check("N: sugadintas grades.json (abi pusės) → NE „sutampa“, o priežastis",
              not data["verdict"]["ok"] and data["scope_checked"] is False
              and data["live_grades"] == []
              and any("grades.json" in r for r in data["verdict"]["reasons"]),
              f"verdict {data['verdict']['label']}, klasės {data['live_grades']}")
        rc, out = run_cli([])
        check("N: rc 1, o ne 0 (skaičiai apie nieką neturi būti žali)", rc == 1,
              f"rc {rc}")
        check("N: pranešimas nesako „Repozitorija: 0“ / „Paskelbta: 0“",
              "neišmatuota" in out and "Repozitorija: 0" not in out
              and "Paskelbta:    0" not in out,
              "; ".join(line for line in out.splitlines()
                        if line.startswith(("Repozitorija", "Paskelbta"))))
        grades_path.write_bytes(good_grades)
        live_grades_path.write_bytes(good_grades)

        # O. Kataloge yra klasė su moduliais, kurios `grades.json` neskelbia
        #    `live` → ji nepatenka į `local`/`published` nė karto, tad
        #    dashboard'as rodo daugiau negu svetainė, o įrankis tylėjo.
        g2 = repo / "content" / "lt" / "grade-02" / "matematika"
        g2.mkdir(parents=True)
        (g2 / "01-a.json").write_text(json.dumps({"id": "01-a", "title": "a", "grade": 2}),
                                      encoding="utf-8")
        (g2.parent / "index.json").write_text(json.dumps(
            {"grade": 2, "strands": [{"id": "matematika", "grade": 2,
                                      "modules": [{"id": "01-a", "title": "a",
                                                   "file": "grade-02/matematika/01-a.json"}]}]},
            ensure_ascii=False), encoding="utf-8")
        data = cp.report(None)
        check("O: neskelbta klasė su moduliu → `undeclared_grades`, rc 1",
              data["undeclared_grades"] == [{"grade": 2, "dir": "grade-02", "modules": 1}]
              and not data["verdict"]["ok"]
              and any("neskelbiamas „live“" in r for r in data["verdict"]["reasons"])
              and data["local"] == 2,
              f"undeclared {data['undeclared_grades']}, local {data['local']}")
        check("O: pranešimas neša skaičių, kiek modulių liko už matavimo",
              "grade-02 (1" in (run_cli([])[1]), "išvestyje „grade-02 (1 moduliai)“")
        # O2. Tas pats defektas **prieš push**: CI vartai (be tinklo, be git)
        #     turi matyti neskelbiamą katalogą. Matuota: iki `--scope` režimo
        #     laikinas repo su grade-02 praeidavo `check_registry.py` rc 0,
        #     `validate_content.py --grade 2` rc 1 (nes jos netikrina) ir
        #     `check_published.py --path-order` rc 0.
        rc, out = run_cli(["--scope"])
        check("O2: `--scope` mato neskelbiamą klasę → rc 1, be tinklo",
              rc == 1 and "NESKELBIAMA KLASĖ — grade-02" in out,
              f"rc {rc}, {(out.strip().splitlines() or [''])[-1][:80]}")
        (g2.parent / "index.json").unlink()
        shutil.rmtree(repo / "content" / "lt" / "grade-02")
        rc, out = run_cli(["--scope"])
        check("O2: pašalinus katalogą → `--scope` rc 0 ir sakinys, kad rėmas vientisas",
              rc == 0 and "vientisas" in out,
              f"rc {rc}, {out.strip().splitlines()[-1][:80] if out.strip() else 'tuščia'}")

        # P. `live` klasė be `index.json` repo — svetainė jos neatidarys, o
        #    publikavimas nieko neįkeis. Tai ne tas pats kaip tuščia klasė.
        g1_index = repo / "content" / "lt" / "grade-01" / "index.json"
        index_blob = g1_index.read_bytes()
        g1_index.unlink()
        scope = cp.grade_scope()
        check("P: „live“ klasė be index.json → `missing_index` su vardu",
              scope["missing_index"] == ["grade-01"] and scope["checked"] is True,
              f"missing_index {scope['missing_index']}")
        g1_index.write_bytes(index_blob)

        # Q. Be nė vienos `live` klasės `--path-order` ciklas neturi žingsnių,
        #    o `all([])` yra True → rc 0. CI žingsnis tada „praeitų“ kiekvieną
        #    PR, nieko nematuodamas (LL-37).
        nolive = json.dumps({"grades": [{"grade": 1, "status": "planned"}]})
        grades_path.write_text(nolive, encoding="utf-8")
        live_grades_path.write_text(nolive, encoding="utf-8")
        rc, out = run_cli(["--path-order"])
        check("Q: nė viena „live“ klasė → --path-order rc 1, o ne 0",
              rc == 1 and "NEIŠMATUOTA" in out,
              f"rc {rc}, {(out.strip().splitlines() or [''])[0][:70]}")
        grades_path.write_bytes(good_grades)
        live_grades_path.write_bytes(good_grades)

        # R. Krašto neigiama kopija (#50319): pirmas GET be žymės → 404, tas
        #    pats adresas su `?cb=` → 200 ir tie patys baitai. Tai realus
        #    #526 atvejis po modulio pervadinimo: `x-cache: HIT`, `age: 42`.
        neg = {"get": 0, "head": 0}

        class _NegativeCache(_QuietHandler):
            """Vienas 404 be keitimo žymės, tada 200 — kaip kraštas."""

            def do_GET(self):  # noqa: N802 - bazinės klasės vardas
                if "01-a.json" in self.path and "cb=" not in self.path and not neg["get"]:
                    neg["get"] += 1
                    self.send_error(404)
                    return
                super().do_GET()

            def do_HEAD(self):  # noqa: N802 - bazinės klasės vardas
                if "01-a.json" in self.path and "cb=" not in self.path and not neg["head"]:
                    neg["head"] += 1
                    self.send_error(404)
                    return
                super().do_HEAD()

        httpd4 = http.server.ThreadingHTTPServer(
            ("127.0.0.1", 0), functools.partial(_NegativeCache, directory=str(live)))
        threading.Thread(target=httpd4.serve_forever, daemon=True).start()
        cp.LIVE_ROOT = f"http://127.0.0.1:{httpd4.server_address[1]}/"
        data = cp.report([1])
        check("R: 404 be žymės, 200 su žyme → „sutampa“, o ne `live_missing`",
              data["verdict"]["ok"] and not data["live_missing"]
              and data["cdn_refreshed_count"] >= 1
              and any(x.endswith("01-a.json") for x in data["cdn_refreshed"]),
              f"verdict {data['verdict']['label']}, live_missing "
              f"{ids(data['live_missing'])}, cdn {data['cdn_refreshed_count']}")
        neg["get"] = neg["head"] = 0
        rc, out = run_cli(["--grade", "1"])
        check("R: pranešimas įvardija priežastį (ne tyli žalia), rc 0",
              rc == 0 and "CDN NEIGIAMA KOPIJA" in out,
              f"rc {rc}, {(out.strip().splitlines() or [''])[0][:70]}")
        # HEAD kelias (garsas, `head_state()`) turi tą patį pakartojimą.
        neg["head"] = 0
        state, size = cp.head_state("content/lt/grade-01/matematika/01-a.json")
        check("R: `head_state()` 404 → 200 su žyme → `ok` ir dydis",
              state == "ok" and size > 0, f"būsena {state}, {size} B")
        httpd4.shutdown()
        httpd4.server_close()
        cp.LIVE_ROOT = url

        # S. Tas pats kelias atsako 404 ir **su** keitimo žyme: tai tikras
        #    nebuvimas, tad pakartojimas neturi paversti jo žaliu.
        class _AlwaysGone(_QuietHandler):
            def do_GET(self):  # noqa: N802
                if "01-a.json" in self.path:
                    self.send_error(404)
                    return
                super().do_GET()

        httpd5 = http.server.ThreadingHTTPServer(
            ("127.0.0.1", 0), functools.partial(_AlwaysGone, directory=str(live)))
        threading.Thread(target=httpd5.serve_forever, daemon=True).start()
        cp.LIVE_ROOT = f"http://127.0.0.1:{httpd5.server_address[1]}/"
        data = cp.report([1])
        check("S: 404 ir su žyme → vis dar `live_missing`, rc 1",
              ids(data["live_missing"]) == ["01-a"]
              and data["cdn_refreshed_count"] == 0
              and any("modulio failo nėra svetainėje" in r
                      for r in data["verdict"]["reasons"])
              and run_cli(["--grade", "1"])[0] == 1,
              f"live_missing {ids(data['live_missing'])}, cdn "
              f"{data['cdn_refreshed_count']}, reasons {data['verdict']['reasons']}")
        httpd5.shutdown()
        httpd5.server_close()
        cp.LIVE_ROOT = url

        # T. Skirtingi baitai pirmu matavimu, o antras matavimas — 404
        #    (LL-76 pakartojimas). Tai atsakymas, ne tinklo gedimas: būsena
        #    turi likti `gone`, o ne virsti `unreachable`.
        class _StaleThenGone(_QuietHandler):
            sent = {"n": 0}

            def do_GET(self):  # noqa: N802
                if "01-a.json" in self.path:
                    if self.sent["n"] == 0:
                        self.sent["n"] += 1
                        body = b'{"id": "01-a", "title": "senas"}'
                        self.send_response(200)
                        self.send_header("Content-Type", "application/json")
                        self.send_header("Content-Length", str(len(body)))
                        self.end_headers()
                        self.wfile.write(body)
                        return
                    self.send_error(404)
                    return
                super().do_GET()

        httpd6 = http.server.ThreadingHTTPServer(
            ("127.0.0.1", 0), functools.partial(_StaleThenGone, directory=str(live)))
        threading.Thread(target=httpd6.serve_forever, daemon=True).start()
        cp.LIVE_ROOT = f"http://127.0.0.1:{httpd6.server_address[1]}/"
        state, _, _ = cp.compare(
            repo / "content" / "lt" / "grade-01" / "matematika" / "01-a.json",
            "content/lt/grade-01/matematika/01-a.json")
        check("T: antro matavimo 404 → `gone`, ne `unreachable`",
              state == "gone", f"būsena {state}")
        httpd6.shutdown()
        httpd6.server_close()
        cp.LIVE_ROOT = url

        # U. Krašto **teigiama** kopija (#539): adresas be žymės atsako 200, bet
        #    senu kūnu, o su `?cb=` — repo baitais. Tai ne pasenęs turinys:
        #    failas paskelbtas, kraštas dar laiko ankstesnę kopiją. Iki pataisos
        #    du vienodi matavimai virsdavo `stale` + „sustabdyta“.
        new_bytes = (repo / "content" / "lt" / "grade-01" / "matematika" / "01-a.json").read_bytes()
        old_bytes = b'{"id": "01-a", "title": "senas"}'

        class _PositiveCache(_QuietHandler):
            """Be žymės — seni baitai, su žyme — repo baitai."""

            def do_GET(self):  # noqa: N802 - bazinės klasės vardas
                if "01-a.json" in self.path and "cb=" not in self.path:
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Content-Length", str(len(old_bytes)))
                    self.end_headers()
                    self.wfile.write(old_bytes)
                    return
                super().do_GET()

        httpd7 = http.server.ThreadingHTTPServer(
            ("127.0.0.1", 0), functools.partial(_PositiveCache, directory=str(live)))
        threading.Thread(target=httpd7.serve_forever, daemon=True).start()
        cp.LIVE_ROOT = f"http://127.0.0.1:{httpd7.server_address[1]}/"
        data = cp.report([1])
        check("U: 200 su senais baitais, o su žyme — repo baitai → „sutampa“",
              data["verdict"]["ok"] and not data["stale"]
              and data["cdn_stale_count"] >= 1
              and any(x.endswith("01-a.json") for x in data["cdn_stale"]),
              f"verdict {data['verdict']['label']}, stale {ids(data['stale'])}, "
              f"cdn_stale {data['cdn_stale_count']}")
        rc, out = run_cli(["--grade", "1"])
        check("U: pranešimas įvardija „CDN SENA KOPIJA“, rc 0",
              rc == 0 and "CDN SENA KOPIJA" in out
              and "ne pasenęs turinys" in out,
              f"rc {rc}, {(out.strip().splitlines() or [''])[0][:70]}")
        # Neigiama pusė: tie patys seni baitai ir su žyme — tai tikras
        # atsilikimas, todėl būsena turi likti `differs` / `stale`, rc 1.
        class _PositiveAndOriginStale(_QuietHandler):
            def do_GET(self):  # noqa: N802
                if "01-a.json" in self.path:
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Content-Length", str(len(old_bytes)))
                    self.end_headers()
                    self.wfile.write(old_bytes)
                    return
                super().do_GET()

        httpd8 = http.server.ThreadingHTTPServer(
            ("127.0.0.1", 0),
            functools.partial(_PositiveAndOriginStale, directory=str(live)))
        threading.Thread(target=httpd8.serve_forever, daemon=True).start()
        cp.LIVE_ROOT = f"http://127.0.0.1:{httpd8.server_address[1]}/"
        data = cp.report([1])
        check("V: seni baitai ir su žyme → vis dar `stale`, rc 1",
              ids(data["stale"]) == ["01-a"] and data["cdn_stale_count"] == 0
              and not data["verdict"]["ok"] and run_cli(["--grade", "1"])[0] == 1,
              f"stale {ids(data['stale'])}, cdn_stale {data['cdn_stale_count']}, "
              f"reasons {data['verdict']['reasons']}")
        check("V: baitai repo nebuvo pakeisti (zondas rašo tik į veidrodį)",
              new_bytes == (repo / "content" / "lt" / "grade-01" / "matematika" / "01-a.json").read_bytes(),
              f"repo {len(new_bytes)} B")

        # W. LL-198 — darbinė kopija **atsilieka** nuo `origin/main`.
        #    Matuota 2026-11-25 (#541): HEAD atsuktas atgal, gyva svetainė
        #    pastatyta iš naujesnio commit'o. Įrankis laukdavo `DEPLOY_WAIT`
        #    (tikrame bėgime 150 s), `deploy_pending` būdavo True ir
        #    `verdict` kaltindavo „deploy nepasivijo“ — nors laukti buvo
        #    neįmanoma, o veiksmas, kurį tai siūlė (publikuoti), kopiją nuo
        #    `origin/main` tik dar labiau atitolintų. Be `behind()` šios
        #    krypties neskaitė niekas: `unpushed()` matuoja tik priešingą.
        cp.LIVE_ROOT = url
        new_title = {"id": "02-b", "title": "naujesnis", "grade": 1}
        mod_b = repo / "content" / "lt" / "grade-01" / "matematika" / "02-b.json"
        mod_b.write_text(json.dumps(new_title, ensure_ascii=False), encoding="utf-8")
        git(repo, "add", "-A")
        git(repo, "commit", "-qm", "naujesnis turinys")
        git(repo, "push", "-q", "origin", "main")
        publish(repo, live)
        # Gyva svetainė neša kitą `?v=` — be to `await_deploy()` net
        # neįjungtų „deploy nepasivijo“ šakos ir zondas neįrodytų nieko.
        (live / "index.html").write_text(
            '<!doctype html><title>zondas</title><script src="./assets/js/app.js?v=deadbeef">',
            encoding="utf-8")
        git(repo, "reset", "-q", "--hard", "HEAD~1")
        data = cp.report([1])
        check("W: kopija atsilieka → `behind_commits` 1, o ne 0",
              data.get("behind_commits") == 1 and data.get("behind_checked") is True,
              f"behind {data.get('behind_commits')}, checked {data.get('behind_checked')}, "
              f"unpushed {data['unpushed_commits']}")
        check("W: nelaukta (0 s), nes laukti neįmanoma",
              data.get("deploy_waited") == 0,
              f"waited {data.get('deploy_waited')} s")
        check("W: priežastis įvardija origin/main, o ne „deploy nepasivijo“",
              any("origin/main" in r for r in data["verdict"]["reasons"])
              and not any("deploy nepasivijo" in r for r in data["verdict"]["reasons"]),
              f"reasons {data['verdict']['reasons']}")
        check("W: pranešimas įvardija „ATSILIĖKĖ“, o ne „NEPASIVIJO“",
              "ATSILIĖKĖ" in (out := run_cli(["--grade", "1"])[1])
              and "PUBLIKAVIMAS NEPASIVIJO" not in out,
              (out.strip().splitlines() or [""])[0][:70])
        # Neigiama kontrolė: kopija **nepr** atsilieka, o `?v=` vis tiek
        # kitas — tai tikras deploy vėlavimas ir jis turi likti matomas.
        git(repo, "reset", "-q", "--hard", "origin/main")
        publish(repo, live)
        (live / "index.html").write_text(
            '<!doctype html><title>zondas</title><script src="./assets/js/app.js?v=deadbeef">',
            encoding="utf-8")
        data = cp.report([1])
        check("W2: neatsiliekant → `behind_commits` 0, o „deploy nepasivijo“ lieka",
              data.get("behind_commits") == 0 and data.get("deploy_pending") is True
              and any("deploy nepasivijo" in r for r in data["verdict"]["reasons"]),
              f"behind {data.get('behind_commits')}, pending {data.get('deploy_pending')}, "
              f"reasons {data['verdict']['reasons']}")
        (live / "index.html").write_bytes((repo / "index.html").read_bytes())
        # LL-201: grąžinama per `publish()`, o ne pažodine repo kopija — be
        # `?v=` žymės veidrodis neatitiktų to, ką įkelia `pages.yml`, ir X
        # matuotų būseną, kurios svetainėje nebūna.
        publish(repo, live)

        # X. LL-201 — `?v=` žymė iš krašto **senos** `index.html` kopijos.
        #    `compare()` (LL-197), `_shell_state()` ir `head_state()` jau
        #    atskirdavo krašto kopiją nuo pasenusio turinio, o `live_version()`
        #    skaitė `index.html` be keitimo žymės — nors ši žymė yra vienintelis
        #    `deploy_pending` šaltinis. Matuota #544 laikiname veidrodyje: visi
        #    baitai `ok`, o `verdict` raudonas („deploy nepasivijo per 3 s“).
        #    Vaikui tai reiškė „paleisk publikavimą“, nors publikavimas jau
        #    įvyko. X — faktas turi likti matomas (`cdn_version_stale`), o
        #    X2 — tikras atsilikimas (ir be žymės, ir su ja sena versija) turi
        #    likti raudonas (neigiama kontrolė).
        stale_index = ('<!doctype html><title>zondas</title>'
                       '<script src="./assets/js/app.js?v=deadbeef">')

        class _EdgeStaleVersion(_QuietHandler):
            """Be žymės — sena `?v=`, su žyme — tikri `index.html` baitai."""

            def do_GET(self):  # noqa: N802 - bazinės klasės vardas
                if self.path.startswith("/index.html") and "cb=" not in self.path:
                    body = stale_index.encode()
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html")
                    self.send_header("Content-Length", str(len(body)))
                    self.end_headers()
                    self.wfile.write(body)
                    return
                super().do_GET()

        httpd9 = http.server.ThreadingHTTPServer(
            ("127.0.0.1", 0), functools.partial(_EdgeStaleVersion, directory=str(live)))
        threading.Thread(target=httpd9.serve_forever, daemon=True).start()
        cp.LIVE_ROOT = f"http://127.0.0.1:{httpd9.server_address[1]}/"
        data = cp.report([1])
        check("X: krašto sena `?v=`, baitai sutampa → NE „deploy nepasivijo“",
              data["verdict"]["ok"] and data.get("deploy_pending") is False
              and not data["shell_stale"] and not data["stale"],
              f"verdict {data['verdict']['label']}, pending {data.get('deploy_pending')}")
        check("X: faktas įvardytas `cdn_version_stale` (ne tyli žalia, LL-37)",
              data.get("cdn_version_stale_count") == 1
              and data["cdn_version_stale"][0].get("edge") == "deadbeef",
              f"cdn_version {data.get('cdn_version_stale')}")
        rc, out = run_cli(["--grade", "1"])
        check("X: pranešimas įvardija „CDN SENA VERSIJA“, rc 0",
              rc == 0 and "CDN SENA VERSIJA" in out,
              f"rc {rc}, {(out.strip().splitlines() or [''])[0][:70]}")
        # Skaičius turi atitikti matavimą, ne užklausų skaičių: `await_deploy()`
        # klausia kas `DEPLOY_POLL` sekundžių, tad dedupe tikrinamas pakartotiniu
        # skaitymu tame pačiame bėgime.
        before = data.get("cdn_version_stale_count")
        cp.live_version()
        check("X: pakartotinas skaitymas to paties fakto nedubliuoja (LL-21)",
              cp.CDN_VERSION["count"] == before,
              f"prieš {before}, po {cp.CDN_VERSION['count']}")

        # X2. Neigiama kontrolė: ir be žymės, ir su žyme — sena versija. Tai
        #     tikras deploy atsilikimas, todėl turi likti raudonas.
        class _AlwaysStaleVersion(_QuietHandler):
            def do_GET(self):  # noqa: N802
                if self.path.startswith("/index.html"):
                    body = stale_index.encode()
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html")
                    self.send_header("Content-Length", str(len(body)))
                    self.end_headers()
                    self.wfile.write(body)
                    return
                super().do_GET()

        httpd10 = http.server.ThreadingHTTPServer(
            ("127.0.0.1", 0), functools.partial(_AlwaysStaleVersion, directory=str(live)))
        threading.Thread(target=httpd10.serve_forever, daemon=True).start()
        cp.LIVE_ROOT = f"http://127.0.0.1:{httpd10.server_address[1]}/"
        data = cp.report([1])
        check("X2: ir su žyme sena versija → `deploy_pending` ir „deploy nepasivijo“ lieka",
              data.get("deploy_pending") is True
              and not data["verdict"]["ok"]
              and any("deploy nepasivijo" in r for r in data["verdict"]["reasons"])
              and data.get("cdn_version_stale_count") == 0,
              f"pending {data.get('deploy_pending')}, "
              f"cdn_version {data.get('cdn_version_stale_count')}, "
              f"reasons {data['verdict']['reasons']}")
        httpd9.shutdown()
        httpd9.server_close()
        httpd10.shutdown()
        httpd10.server_close()
        cp.LIVE_ROOT = url
        httpd7.shutdown()
        httpd7.server_close()
        httpd8.shutdown()
        httpd8.server_close()
        cp.LIVE_ROOT = url

        # Z. Puslapis, atiduodamas bet kuriame gylyje (#560, LL-210).
        #    `404.html` atsakydamas 404 atiduoda GitHub Pages, o naršyklė jį
        #    renderina **to adreso gylio** atžvilgiu. Santykinė `./assets/css/…`
        #    todėl veda į 404, o vaikas pamato baltą puslapį su mirusiu
        #    mygtuku. Baitų lygybė su gyva svetaine to nemato: failas
        #    paskelbtas teisingai, tik atiduodamas kitame gylyje.
        check("Z: 404.html su absoliučiomis nuorodomis → nėra `depth_relative`",
              data.get("depth_relative") == [] and data.get("depth_skipped") == []
              and data.get("depth_checked", 0) >= 1,
              f"relative {data.get('depth_relative')}, "
              f"checked {data.get('depth_checked')}, "
              f"skipped {data.get('depth_skipped')}")
        saved_404 = (repo / "404.html").read_text(encoding="utf-8")
        # Neigiama kontrolė: ta pati nuoroda, kuri buvo gyvoje svetainėje iki
        # #560 — santykinė. Būsena privalo būti raudona ir įvardyti eilutę.
        (repo / "404.html").write_text(
            saved_404.replace('href="/"', 'href="./"').replace(
                'id="i-pradzia" href="/"', 'id="i-pradzia" href="./"'),
            encoding="utf-8")
        data = cp.report([1])
        rel = data.get("depth_relative") or []
        check("Z2: santykinė nuoroda → raudona ir įvardyta failu bei eilute",
              bool(rel) and not data["verdict"]["ok"]
              and any("bet kuriame gylyje" in r for r in data["verdict"]["reasons"])
              and rel[0]["file"] == "404.html" and rel[0]["line"] > 0,
              f"relative {rel[:1]}, reasons {data['verdict']['reasons'][:2]}")
        rc, out = run_cli(["--grade", "1"])
        check("Z2: CLI spausdina „SANTYKINĖ NUORODA … BET KURIAME GILYJE“, rc 1",
              rc == 1 and "BET KURIAME GILYJE" in out
              and "taisyk nuorodą" in out,
              f"rc {rc}, {[l for l in out.splitlines() if 'GILYJE' in l][:1]}")
        (repo / "404.html").write_text(saved_404, encoding="utf-8")
        data = cp.report([1])
        check("Z3: atstačius → vėl žalia (patikra neįsimena klaidos)",
              data.get("depth_relative") == [] and data["verdict"]["ok"],
              f"relative {data.get('depth_relative')}, "
              f"verdict {data['verdict']['label']}")
        # Z4: failo repo nėra → tai NE „švaru“, o neįvykusi patikra (LL-37).
        saved_depth = cp.DEPTH_SERVED
        cp.DEPTH_SERVED = ("404.html", "nera-tokio.html")
        data = cp.report([1])
        check("Z4: trūkstamas failas → `depth_skipped`, o ne tyli žalia",
              data.get("depth_skipped") == ["nera-tokio.html"]
              and not data["verdict"]["ok"]
              and any("neįvyko" in r for r in data["verdict"]["reasons"]),
              f"skipped {data.get('depth_skipped')}, "
              f"reasons {data['verdict']['reasons'][:2]}")
        cp.DEPTH_SERVED = saved_depth
        # Z5: atsarginio puslapio spalva — `main.css` tokeno kopija. Kai
        #     dizainas keičiasi, kopija tyliai išsiskiria (LL-21 šeima), tad
        #     ji lyginama, o ne laikoma „maždaug ta“.
        saved_css = (repo / "assets" / "css" / "main.css").read_text(encoding="utf-8")
        saved_site = (repo / "404.html").read_text(encoding="utf-8")
        (repo / "assets" / "css" / "main.css").write_text(
            saved_css.replace("--paper: #fdf8ef;", "--paper: #abc123;"),
            encoding="utf-8")
        data = cp.report([1])
        check("Z5: main.css tokenas pakeistas → `palette_mismatch` ir raudona",
              any(m["token"] == "--paper" and m["css_value"] == "#abc123"
                  for m in data.get("palette_mismatch") or [])
              and not data["verdict"]["ok"]
              and any("nebeatitinka main.css" in r
                      for r in data["verdict"]["reasons"]),
              f"palette {data.get('palette_mismatch')}, "
              f"reasons {data['verdict']['reasons'][:2]}")
        rc, out = run_cli(["--grade", "1"])
        check("Z5: CLI spausdina „NEBEATITINKA main.css“, rc 1",
              rc == 1 and "NEBEATITINKA main.css" in out,
              f"rc {rc}")
        (repo / "assets" / "css" / "main.css").write_text(saved_css, encoding="utf-8")
        (repo / "404.html").write_text(saved_site, encoding="utf-8")
        data = cp.report([1])
        check("Z6: atstačius → palette švari ir verdiktas žalias",
              data.get("palette_mismatch") == [] and data["verdict"]["ok"],
              f"palette {data.get('palette_mismatch')}, "
              f"verdict {data['verdict']['label']}")
    finally:
        if httpd is not None:
            httpd.shutdown()
            httpd.server_close()
        for name, value in saved.items():
            setattr(cp, name, value)
        shutil.rmtree(tmp, ignore_errors=True)

    # K. Po zondo globalai grąžinti: šiame procese toliau matuotų tikras repo.
    check("K: `check_published` globalai atkurti į tikrą repo",
          cp.ROOT == REAL_ROOT and str(cp.LIVE_ROOT).startswith("https://"),
          f"ROOT {cp.ROOT}, LIVE_ROOT {cp.LIVE_ROOT}")

    passed = sum(1 for _, ok, _ in results if ok)
    print(f"\n{passed}/{len(results)} lūkesčių išsipildė")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
