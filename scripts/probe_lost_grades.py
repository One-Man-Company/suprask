#!/usr/bin/env python3
"""Zondas: ar `check_published.py` pamato **klasės katalogo** dingimą?

Kodėl šis failas egzistuoja (LL-36). Šio įrankio vienintelė garantija —
„vaiko `localStorage` žyma nelieka be modulio“ — iki #588 galiojo tik toms
klasėms, kurios **šiandien** `live`: `check_grade()` kviečiamas tik joms.
Klasė, išjungta `grades.json`e IR ištrinta iš `content/lt/`, iškrenta iš
visų vartų rėmų vienu metu, o `report()` sako „sutampa“. Tai ne teorija:
matuota laikiname repo (žr. žemiau, A2) — 2 klasės `live`, paskui
`grade-01` pašalinta, ir įrankis grąžino `verdict ok True`, rc 0.

Šis zondas stato tikrą git repo (su `origin/main`, kad `unpushed()` būtų
matavimas) ir gyvos svetainės veidrodį, patiekiamą vietiniu `http.server`,
tada per patį `report()` tikrina:

  A1  sveika būsena (abi klasės vietoje) → „sutampa“ (kontrolinė);
  A2  `grade-01` katalogas ištrintas ir `grades.json` pakeistas →
      `lost_grades` = grade-01, `verdict()` raudonas ir įvardija klasę;
  A3  neigiama kontrolė: ta pati būsena be `lost_grades()` (t. y. iki #588)
      yra žalia — defektas realus, o ne įsivaizduojamas;
  B1  klasė tik **išjungta** (`status: planned`), katalogas vietoje →
      `lost_grades` tuščias (tai ne dingimas; matuoja `undeclared_grades`);
  B2  išjungimas vis tiek raudonas per `undeclared_grades` — atskiras
      defektas, ne šio zondo sritis, bet turi likti matomas;
  C1  sąmoningas pašalinimas `known_lost_grades.json`e → lieka sąraše su
      `resolved: true`, o `verdict()` žalias (kitaip vartai amžinai raudoni);
  C2  įrašas **be `reason`** neatleidžia — pašalinimas be priežasties yra
      būtent tai, ką vartas saugo;
  D1  neperskaityta `grades.json` istorija (ne git katalogas) →
      `grades_history_checked False` ir rc 1, o ne „dingusių klasių nėra“.

Be tinklo (tik `127.0.0.1`), < 5 s, įsijungia į CI `probe_*.py` ciklą be
workflow pakeitimo.

Naudojimas:
    python3 scripts/probe_lost_grades.py     # 0 — visi lūkesčiai išsipildė
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

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

import check_published as cp  # noqa: E402

results: list[tuple[str, bool, str]] = []

# Globalai, kuriuos zondas perjungia į laikiną repo; grąžinami `finally`.
PATCHED = ("ROOT", "CONTENT", "GRADES", "RENAMES", "LOST_GRADES", "PATH_ORDER",
           "AUDIO_MANIFEST", "AUX_FILES", "LIVE_ROOT", "DEPLOY_WAIT",
           "RETRY_PAUSE")


def check(name: str, ok: bool, detail: str) -> None:
    results.append((name, ok, detail))
    print(f"{'OK  ' if ok else 'KLAIDA'} {name} — {detail}")


class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):  # noqa: A002 - bazinės klasės vardas
        pass


def serve(base: pathlib.Path):
    handler = functools.partial(_Quiet, directory=str(base))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, f"http://127.0.0.1:{httpd.server_address[1]}/"


def write(path: pathlib.Path, obj) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=1), encoding="utf-8")


def build(repo: pathlib.Path) -> None:
    """Dvi klasės, abi `live`, po vieną modulį — mažiausia būsena, kurioje
    klasės dingimas matomas."""
    for grade, mid in ((1, "01-a"), (2, "01-b")):
        gd = f"grade-{grade:02d}"
        write(repo / "content" / "lt" / gd / "matematika" / f"{mid}.json",
              {"id": mid, "title": mid, "grade": grade, "strand": "matematika"})
        write(repo / "content" / "lt" / gd / "index.json",
              {"grade": grade, "strands": [{"id": "matematika", "grade": grade,
                                            "modules": [{"id": mid, "title": mid,
                                                         "file": f"{gd}/matematika/{mid}.json"}]}]})
        write(repo / "content" / "lt" / gd / "path.json", {"sequence": [mid]})
    write(repo / "content" / "lt" / "grades.json",
          {"grades": [{"grade": 1, "status": "live"}, {"grade": 2, "status": "live"}]})
    (repo / "index.html").write_text(
        '<!doctype html><title>zondas</title>'
        '<link rel="stylesheet" href="./assets/css/main.css">'
        '<script type="module" src="./assets/js/app.js"></script>',
        encoding="utf-8")
    # `404.html` turi būti palyginamas su `main.css` tokenais (kitaip zondas
    # matuoja ne tą defektą — LL-40: matuok tai, ką vaikas gauna).
    (repo / "404.html").write_text(
        '<!doctype html><a href="/">Į pradžią</a>'
        "<style>body{background:#fdf8ef;color:#23201c}.eyebrow{color:#6f665a}"
        ".lede{color:#5f574d}.btn{background:#ff8a3d;color:#23201c}</style>",
        encoding="utf-8")
    (repo / "assets" / "css" / "main.css").parent.mkdir(parents=True, exist_ok=True)
    (repo / "assets" / "css" / "main.css").write_text(
        ":root {\n"
        "  --paper: #fdf8ef;\n  --ink: #23201c;\n  --ink-soft: #5f574d;\n"
        "  --ink-faint: #6f665a;\n  --accent: #ff8a3d;\n  --on-accent: #23201c;\n"
        "}\n", encoding="utf-8")
    (repo / "assets" / "js").mkdir(parents=True, exist_ok=True)
    (repo / "assets" / "js" / "app.js").write_text("export const x = 1;\n", encoding="utf-8")
    (repo / "assets" / "audio" / "lt").mkdir(parents=True, exist_ok=True)
    (repo / "assets" / "audio" / "lt" / "manifest.json").write_text("{}", encoding="utf-8")
    (repo / "content" / "audio-overrides.json").write_text("{}", encoding="utf-8")
    write(repo / "scripts" / "known_renames.json", {})
    write(repo / "scripts" / "known_path_order.json", {"grades": {}})


def git(repo: pathlib.Path, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], cwd=repo, capture_output=True, text=True)


def init_git(repo: pathlib.Path) -> None:
    git(repo, "init", "-q")
    git(repo, "symbolic-ref", "HEAD", "refs/heads/main")
    git(repo, "config", "user.email", "zondas@example.invalid")
    git(repo, "config", "user.name", "zondas")
    git(repo, "add", "-A")
    git(repo, "commit", "-qm", "abi klasės live")
    bare = repo.parent / "origin.git"
    subprocess.run(["git", "init", "--bare", "-q", str(bare)], capture_output=True)
    git(repo, "remote", "add", "origin", str(bare))
    git(repo, "push", "-q", "-u", "origin", "main")


def publish(repo: pathlib.Path, live: pathlib.Path) -> None:
    """Tai, ką `pages.yml` įkelia: `content/`, `assets/`, abu puslapiai."""
    if live.exists():
        shutil.rmtree(live)
    for name in ("content", "assets"):
        shutil.copytree(repo / name, live / name)
    for name in ("index.html", "404.html"):
        shutil.copyfile(repo / name, live / name)
    sha = git(repo, "rev-parse", "--short=8", "HEAD").stdout.strip()
    html = (repo / "index.html").read_text(encoding="utf-8")
    html = html.replace('src="./assets/js/app.js"', f'src="./assets/js/app.js?v={sha}"')
    html = html.replace('href="./assets/css/main.css"', f'href="./assets/css/main.css?v={sha}"')
    (live / "index.html").write_text(html, encoding="utf-8")


def patch(repo: pathlib.Path, url: str) -> None:
    cp.ROOT = repo
    cp.CONTENT = repo / "content" / "lt"
    cp.GRADES = cp.CONTENT / "grades.json"
    cp.RENAMES = repo / "scripts" / "known_renames.json"
    cp.LOST_GRADES = repo / "scripts" / "known_lost_grades.json"
    cp.PATH_ORDER = repo / "scripts" / "known_path_order.json"
    cp.AUDIO_MANIFEST = repo / "assets" / "audio" / "lt" / "manifest.json"
    cp.AUX_FILES = [
        ("content/lt/grades.json", cp.GRADES),
        ("assets/audio/lt/manifest.json", cp.AUDIO_MANIFEST),
        ("content/audio-overrides.json", repo / "content" / "audio-overrides.json"),
    ]
    cp.LIVE_ROOT = url
    cp.DEPLOY_WAIT = 0        # veidrodis atsako iš karto — laukti nėra ko
    cp.RETRY_PAUSE = 0.02


def run_cli(argv: list[str]) -> tuple[int, str]:
    """`main()` su tuo pačiu laikinu repo; rc turi sekti `verdict()`."""
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
    # 0 — neigiama kontrolė: senasis įrankis neturi nei `LOST_GRADES`, nei
    # `lost_grades()`. Be šios patikros zondas senajame kode kristų
    # `AttributeError`, o tai nebūtų „raudonas su priežastimi“ (LL-10).
    missing = [name for name in PATCHED if not hasattr(cp, name)]
    if not hasattr(cp, "lost_grades"):
        missing.append("lost_grades()")
    if missing:
        check("0: įrankis turi `LOST_GRADES` ir `lost_grades()`", False,
              f"nėra: {', '.join(missing)} — tai būsena iki #588, kai klasės "
              f"dingimas nebuvo matuojamas")
        print()
        print(f"0/{len(results)} lūkesčių išsipildė; nepraėjo: 0")
        return 1

    tmp = pathlib.Path(tempfile.mkdtemp(prefix="probe_lost_"))
    saved = {name: getattr(cp, name) for name in PATCHED}
    httpd = None
    try:
        repo, live = tmp / "repo", tmp / "live"
        repo.mkdir()
        build(repo)
        init_git(repo)
        publish(repo, live)
        httpd, url = serve(live)
        patch(repo, url)

        # A1 — kontrolinė: abi klasės vietoje ir `live`.
        data = cp.report(None)
        check("A1: abi klasės vietoje → „sutampa“, lost_grades tuščias",
              data["verdict"]["ok"] and data.get("lost_grades") == []
              and data.get("grades_history_checked") is True,
              f"verdict {data['verdict']['label']}, "
              f"lost {data.get('lost_grades')}, "
              f"checked {data.get('grades_history_checked')}")

        # A2 — klasė buvo `live`, katalogas ištrintas (85 modulių atvejis
        #      sumažintas iki 1, kad zondas liktų < 5 s).
        shutil.rmtree(repo / "content" / "lt" / "grade-01")
        write(repo / "content" / "lt" / "grades.json",
              {"grades": [{"grade": 2, "status": "live"}]})
        git(repo, "add", "-A")
        git(repo, "commit", "-qm", "grade-01 pašalinta")
        git(repo, "push", "-q", "origin", "main")
        publish(repo, live)
        data = cp.report(None)
        lost = data.get("lost_grades") or []
        check("A2: dingęs klasės katalogas įvardytas",
              [g["dir"] for g in lost] == ["grade-01"]
              and lost[0].get("resolved") is False
              and lost[0].get("module_files") == 0,
              f"lost_grades {lost}")
        check("A2: `verdict()` raudonas ir įvardija klasę bei modulių skaičių",
              not data["verdict"]["ok"]
              and any("grade-01" in r and "dingo iš repo" in r
                      for r in data["verdict"]["reasons"]),
              f"reasons {data['verdict']['reasons']}")
        rc, out = run_cli([])
        check("A2: CLI rc 1 ir eilutė „KLASĖS KATALOGAS DINGO“",
              rc == 1 and "KLASĖS KATALOGAS DINGO IŠ REPO" in out,
              f"rc {rc}, eilutė {'yra' if 'KLASĖS KATALOGAS DINGO' in out else 'NĖRA'}")

        # A3 — neigiama kontrolė: ta pati būsena be `lost_grades()`, t. y.
        #      lygiai tai, ką įrankis darė iki #588. Būtent ji įrodo, kad
        #      defektas realus, o ne įsivaizduojamas.
        saved_lost = data.get("lost_grades") or []
        stripped = dict(data)
        stripped["lost_grades"] = []
        stripped["verdict"] = cp.verdict(stripped)
        check("A3: be `lost_grades()` būsena buvo žalia (defektas realus)",
              bool(stripped["verdict"]["ok"]) and bool(saved_lost),
              f"sena būsena verdict {stripped['verdict']['label']!r}, "
              f"o tikrasis sąrašas {[g['dir'] for g in saved_lost]}")

        # B1 — klasė tik **išjungta**, katalogas vietoje: tai ne dingimas.
        build(repo)
        write(repo / "content" / "lt" / "grades.json",
              {"grades": [{"grade": 1, "status": "planned"},
                          {"grade": 2, "status": "live"}]})
        git(repo, "add", "-A")
        git(repo, "commit", "-qm", "grade-01 išjungta, katalogas vietoje")
        git(repo, "push", "-q", "origin", "main")
        publish(repo, live)
        data = cp.report(None)
        check("B1: išjungta klasė su katalogu — NE dingimas",
              data.get("lost_grades") == [],
              f"lost_grades {data.get('lost_grades')}")
        check("B2: išjungimas vis tiek matomas per `undeclared_grades`",
              # Atskiras, jau egzistuojantis vartas; be jo išjungta klasė
              # būtų tyliai nelyginama (šio zondo sritis — ne jis, bet
              # teiginys turi likti teisingas).
              [u["dir"] for u in data.get("undeclared_grades") or []] == ["grade-01"],
              f"undeclared {data.get('undeclared_grades')}")

        # C1 — sąmoningas pašalinimas užrašytas: lieka matomas, bet rc žalias.
        shutil.rmtree(repo / "content" / "lt" / "grade-01")
        write(repo / "content" / "lt" / "grades.json",
              {"grades": [{"grade": 2, "status": "live"}]})
        write(repo / "scripts" / "known_lost_grades.json",
              {"grades": [{"grade": 1, "reason": "zondo sprendimas: katalogas perkeltas",
                           "run": 0, "date": "2026-11-27"}]})
        git(repo, "add", "-A")
        git(repo, "commit", "-qm", "grade-01 pašalinta sąmoningai")
        git(repo, "push", "-q", "origin", "main")
        publish(repo, live)
        data = cp.report(None)
        lost = data.get("lost_grades") or []
        check("C1: priimtas pašalinimas lieka sąraše su `resolved`",
              [g["dir"] for g in lost] == ["grade-01"] and lost[0].get("resolved") is True
              and lost[0].get("reason", "").startswith("zondo sprendimas"),
              f"lost_grades {lost}")
        check("C1: priimtas pašalinimas neverčia rc 1 (vartai, kurių neįmanoma "
              "praeiti, yra tas pats kaip jokių)",
              data["verdict"]["ok"],
              f"reasons {data['verdict']['reasons']}")

        # C2 — įrašas be priežasties NEatleidžia.
        write(repo / "scripts" / "known_lost_grades.json",
              {"grades": [{"grade": 1, "reason": "   "}]})
        data = cp.report(None)
        check("C2: įrašas be `reason` neatileidžia",
              [g["dir"] for g in data.get("lost_grades") or []] == ["grade-01"]
              and not data["verdict"]["ok"],
              f"lost {data.get('lost_grades')}, reasons {data['verdict']['reasons']}")

        # D1 — neperskaityta `grades.json` istorija nėra „dingusių nėra“.
        plain = tmp / "ne-git"
        build(plain)
        patch(plain, url)
        data = cp.report(None, compare_bytes=False)
        check("D1: ne git katalogas → `grades_history_checked False` ir rc 1",
              data.get("grades_history_checked") is False
              and any("klasių istorijos patikra neįvyko" in r
                      for r in data["verdict"]["reasons"]),
              f"checked {data.get('grades_history_checked')}, "
              f"note {(data.get('grades_history_note') or '')[:70]!r}")

        # E1 — `--grade` yra tikrinimo rėmas, o ne teiginys apie kitas
        # klases. Jei 1 klasė skelbiama `live` ir jos katalogas ištrintas,
        # `--grade 2` privalo vis tiek ją įvardyti; kitaip defektas būtų
        # matomas tik tada, kai tikrinama būtent ta klasė (LL-40 atvirkštinė
        # pusė: matuok būseną, o ne zondo rėmą).
        patch(repo, url)
        build(repo)
        shutil.rmtree(repo / "content" / "lt" / "grade-01")
        write(repo / "content" / "lt" / "grades.json",
              {"grades": [{"grade": 2, "status": "live"},
                          {"grade": 1, "status": "planned"}]})
        git(repo, "add", "-A")
        git(repo, "commit", "-qm", "grade-01 dingo, tikrinama grade-02")
        git(repo, "push", "-q", "origin", "main")
        publish(repo, live)
        data = cp.report([2])
        check("E1: `--grade 2` vis tiek įvardija dingusią grade-01",
              [g["dir"] for g in data.get("lost_grades") or []] == ["grade-01"]
              and not data["verdict"]["ok"],
              f"lost {[g['dir'] for g in data.get('lost_grades') or []]}, "
              f"reasons {data['verdict']['reasons']}")
    finally:
        if httpd is not None:
            httpd.shutdown()
        for name, value in saved.items():
            setattr(cp, name, value)
        shutil.rmtree(tmp, ignore_errors=True)

    failed = [name for name, ok, _ in results if not ok]
    print()
    print(f"{len(results) - len(failed)}/{len(results)} lūkesčių išsipildė"
          + (f"; nepraėjo: {', '.join(failed)}" if failed else ""))
    return 0 if not failed else 1


if __name__ == "__main__":
    raise SystemExit(main())
