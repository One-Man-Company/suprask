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
     rc 0, t. y. CI žingsnis „praeidavo“ nieko nematuodamas).

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
           "AUDIO_MANIFEST", "LIVE_ROOT", "DEPLOY_WAIT", "RETRY_PAUSE")


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
    (root / "index.html").write_text("<!doctype html><title>zondas</title>",
                                     encoding="utf-8")
    (root / "404.html").write_text("<!doctype html><title>nera</title>",
                                   encoding="utf-8")
    (root / "assets" / "audio" / "lt").mkdir(parents=True, exist_ok=True)
    (root / "assets" / "audio" / "lt" / "manifest.json").write_text("{}", encoding="utf-8")
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
    """Gyvos svetainės veidrodis: tai, ką `pages.yml` įkelia."""
    shutil.copytree(repo / "content", live / "content", dirs_exist_ok=True)
    shutil.copytree(repo / "assets", live / "assets", dirs_exist_ok=True)
    for name in ("index.html", "404.html"):
        shutil.copyfile(repo / name, live / name)


def patch(root: pathlib.Path, url: str) -> None:
    cp.ROOT = root
    cp.CONTENT = root / "content" / "lt"
    cp.GRADES = cp.CONTENT / "grades.json"
    cp.AUX_FILES = [
        ("content/lt/grades.json", cp.CONTENT / "grades.json"),
        ("assets/audio/lt/manifest.json", root / "assets" / "audio" / "lt" / "manifest.json"),
    ]
    cp.RENAMES = root / "scripts" / "known_renames.json"
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
