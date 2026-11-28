#!/usr/bin/env python3
"""Zondas: ar šaknies HTML puslapiai imami iš disko, o ne iš ranka rašyto sąrašo.

Kodėl šis failas egzistuoja (LL-36, LL-242). Iki #609 dviejų puslapių sąrašas
(`index.html`, `404.html`) buvo parašytas ranka **trijose** vietose:
`check_published.PUBLISHED_SINGLE`, `check_published.SHELL_GLOBS` ir
`.github/workflows/pages.yml` `cp index.html 404.html _site/`. Trys kopijos
reiškia, kad trečias puslapis (`apie.html`, spausdinimo versija) būtų:

  1. repo — ir `check_refs.py` jį matytų;
  2. **ne** svetainėje — `pages.yml` surinkimo žingsnis jo nekopijuotų;
  3. nematomas visiems vartams — `code_pages()` ir `published_files()` jo
     neįtrauktų, tad `coverage().unmeasured` liktų `[]`, o `check_published.py`
     toliau rašytų „sutampa“.

Matuota 2026-11-28 prieš pataisymą: įdėjus `apie-zondas.html` (34 B),
`code_pages()` grąžino `['index.html', '404.html']`, `published_files()`
failo neturėjo, `coverage().unmeasured` buvo `[]`, `published_count` liko
2843, o surinkimo žingsnis į `_site` įkėlė **2 puslapius iš 3**. Tai ta pati
tylios ribos šeima kaip #607 (LL-240), tik ne žymėse, o pačiame puslapių
sąraše.

Zondas neturi tinklo: jis stato laikiną repo, paleidžia **tikrą** `pages.yml`
surinkimo žingsnį (`bash -euo pipefail`) ir tikrina, ką mato **tikri** vartai.

Naudojimas:
    python3 scripts/probe_root_pages.py     # 0 — visi lūkesčiai išsipildė
"""

from __future__ import annotations

import pathlib
import shutil
import subprocess
import sys
import tempfile

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))

import check_published as cp  # noqa: E402

results: list[tuple[str, bool, str]] = []


def check(name: str, ok: bool, detail: str) -> None:
    results.append((name, ok, detail))
    print(f"{'OK  ' if ok else 'KLAIDA'} {name} — {detail}")


def workflow_step(step_name: str) -> str | None:
    """`pages.yml` žingsnio `run:` blokas — taip, kaip jį paleistų GitHub.

    Imama iš **workflow failo**, ne perrašoma zonde: kitaip zondas tikrintų
    savo kopiją, o defektas „workflow ir vartai nesutaria“ liktų nematomas
    (LL-38 šeima, tas pats argumentas kaip `probe_shell_version.py:84`).
    """
    path = ROOT / ".github" / "workflows" / "pages.yml"
    if not path.is_file():
        return None
    lines = path.read_text(encoding="utf-8").splitlines()
    start = None
    for i, line in enumerate(lines):
        if line.strip() == "run: |" and step_name in lines[i - 1]:
            start = i
            break
    if start is None:
        return None
    first = lines[start + 1]
    indent = len(first) - len(first.lstrip())
    body: list[str] = []
    for line in lines[start + 1:]:
        if line.strip() and (len(line) - len(line.lstrip())) < indent:
            break
        body.append(line[indent:] if line.strip() else "")
    return "\n".join(body)


def run_collect(site: pathlib.Path) -> tuple[int, str]:
    """Paleidžia workflow surinkimo žingsnį kaip `bash -euo pipefail`."""
    script = workflow_step("Surinkti tik svetainės failus")
    if script is None:
        return 127, "pages.yml surinkimo žingsnio nepavyko perskaityti"
    proc = subprocess.run(
        ["bash", "-euo", "pipefail", "-c", script],
        cwd=str(site), capture_output=True, text=True, timeout=120,
    )
    return proc.returncode, (proc.stdout or "") + (proc.stderr or "")


def plant(root: pathlib.Path) -> None:
    """Šaknis su trimis puslapiais, vienu slaptu zondo failu ir publikuojamais katalogais."""
    (root / "index.html").write_text(
        '<!doctype html><link rel="stylesheet" href="./assets/css/main.css">',
        encoding="utf-8")
    (root / "404.html").write_text(
        '<!doctype html><script>css.href = root + "assets/css/main.css";</script>',
        encoding="utf-8")
    # Trečias puslapis — būtent tas, kurio nematė nė vienas vartas.
    (root / "apie.html").write_text(
        '<!doctype html><h1>Apie</h1>', encoding="utf-8")
    # Zondų artefaktas: `.gitignore` `.probe-*`, tad į svetainę jis nekeliamas.
    (root / ".probe-x.html").write_text("<!doctype html><title>zondas</title>",
                                        encoding="utf-8")
    (root / "assets" / "css").mkdir(parents=True, exist_ok=True)
    (root / "assets" / "css" / "main.css").write_text(":root{--paper:#fdf8ef}\n",
                                                      encoding="utf-8")
    (root / "assets" / "js").mkdir(parents=True, exist_ok=True)
    (root / "assets" / "js" / "app.js").write_text("export const x = 1;\n",
                                                   encoding="utf-8")
    (root / "content" / "lt").mkdir(parents=True, exist_ok=True)
    (root / "content" / "lt" / "grades.json").write_text('{"grades":[]}',
                                                         encoding="utf-8")


def main() -> int:
    # 0. Senasis įrankis neturėjo `root_pages()` — sąrašas buvo ranka rašytos
    #    dvi eilutės. Tai KLAIDA, ne praleista patikra: kitaip „14/14“ būtų
    #    teiginys apie patikrą, kurios nebuvo (LL-37, tas pats kelias kaip
    #    `probe_shell_version.py:164`).
    if not hasattr(cp, "root_pages"):
        check("0: įrankis ima puslapius iš disko (`root_pages`)", False,
              "check_published.py neturi `root_pages` — sąrašas ranka rašytas, "
              "trečias puslapis liktų nematomas")
        print(f"\n0/{len(results)} lūkesčių išsipildė")
        return 1

    # 1. Tikras repo: sąrašas imamas iš disko (lyginama su nepriklausomu
    #    `pathlib` skaitymu, ne su dviem kietais vardais — kitaip zondas
    #    uždraustų teisingą darbą pridėti puslapį, LL-38).
    on_disk = sorted(p.name for p in ROOT.glob("*.html") if not p.name.startswith("."))
    real = cp.root_pages()
    check("1: repo `root_pages()` — visi šaknies puslapiai, index pirmas",
          bool(real) and sorted(real) == on_disk and real[0] == "index.html", f"{real}")

    tmp = pathlib.Path(tempfile.mkdtemp(prefix="probe_root_pages_"))
    original_root = cp.ROOT
    try:
        plant(tmp)
        cp.ROOT = tmp

        # 2. Vartai MATO trečią puslapį, o slapto — ne.
        pages = cp.code_pages()
        check("2: `code_pages()` mato trečią puslapį (ne ranka rašytas sąrašas)",
              pages == ["index.html", "404.html", "apie.html"], f"{pages}")
        check("2: slaptas `.probe-*.html` neįtraukiamas (pages.yml jo neįkelia)",
              ".probe-x.html" not in pages, f"{pages}")

        # 3. Publikavimo ir matavimo aibės sutampa — `coverage()` neturi ko
        #    pranešti. Būtent šis teiginys buvo melagingas iki #609: failas
        #    buvo repo, o abiejose aibėse jo nebuvo, tad `unmeasured` buvo
        #    tuščias ir žalia atrodė teisinga.
        published = cp.published_files()
        measured = cp.measured_files([])
        check("3: `published_files()` turi visus tris puslapius",
              {"index.html", "404.html", "apie.html"} <= published,
              f"turi {sorted(n for n in published if n.endswith('.html'))}")
        check("3: `measured_files()` turi trečią puslapį (baitai bus lyginami)",
              "apie.html" in measured,
              f"turi {sorted(n for n in measured if n.endswith('.html'))}")
        cov = cp.coverage([])
        check("3: `coverage().unmeasured` tuščias TIK todėl, kad matuojama",
              cov["unmeasured"] == [] and "apie.html" in published,
              f"unmeasured {cov['unmeasured']}, published_count {cov['published_count']}")

        # 4. TIKRAS `pages.yml` surinkimo žingsnis įkelia trečią puslapį.
        rc, out = run_collect(tmp)
        site = tmp / "_site"
        got = sorted(p.name for p in site.glob("*.html")) if site.is_dir() else []
        check("4: pages.yml surinkimo žingsnis — rc 0", rc == 0,
              f"rc {rc}: {(out.strip().splitlines() or [''])[-1][:160]}")
        check("4: į `_site` pateko VISI trys puslapiai",
              got == ["404.html", "apie.html", "index.html"], f"{got}")
        check("4: slaptas failas į `_site` nepateko",
              not (site / ".probe-x.html").exists(),
              "pateko" if (site / ".probe-x.html").exists() else "nepateko")
        check("4: `_site` turi ir publikuojamus katalogus",
              (site / "assets" / "css" / "main.css").is_file()
              and (site / "content" / "lt" / "grades.json").is_file(),
              f"{sorted(p.name for p in site.iterdir())}")

        # 5. NEIGIAMA KONTROLĖ: senasis surinkimo žingsnis (du vardai ranka)
        #    pameta trečią puslapį. Be šio žingsnio 4-as įrodytų tik tai, kad
        #    `find` veikia, o ne kad defektas buvo realus.
        old = tmp / "old_site"
        old.mkdir()
        subprocess.run(["bash", "-euo", "pipefail", "-c",
                        "cp index.html 404.html ."], cwd=str(tmp),
                       capture_output=True, text=True, timeout=60)
        shutil.copy2(tmp / "index.html", old / "index.html")
        shutil.copy2(tmp / "404.html", old / "404.html")
        old_pages = sorted(p.name for p in old.glob("*.html"))
        check("5: senasis `cp index.html 404.html` pameta trečią puslapį (defektas realus)",
              old_pages == ["404.html", "index.html"] and "apie.html" not in old_pages,
              f"{old_pages}")

        # 6. Ketvirtas puslapis atsiranda be įrankio pakeitimo — sąrašas tikrai
        #    dinaminis, o ne trijų vardų sąrašas, perkeltas į funkciją.
        (tmp / "spausdinti.html").write_text("<!doctype html>", encoding="utf-8")
        check("6: naujas puslapis įsijungia be kodo pakeitimo",
              cp.code_pages() == ["index.html", "404.html", "apie.html", "spausdinti.html"]
              and "spausdinti.html" in cp.published_files(),
              f"{cp.code_pages()}")
        rc, _ = run_collect(tmp)
        got = sorted(p.name for p in (tmp / "_site").glob("*.html"))
        check("6: ir jį įkelia tas pats surinkimo žingsnis",
              rc == 0 and got == ["404.html", "apie.html", "index.html",
                                  "spausdinti.html"], f"{got}")
    finally:
        cp.ROOT = original_root
        shutil.rmtree(tmp, ignore_errors=True)

    # 7. Tikras repo po zondo: ROOT grąžintas, sąrašas nepakitęs.
    after = cp.code_pages()
    check("7: po zondo tikras repo matuojamas kaip anksčiau",
          cp.ROOT == ROOT and bool(after) and sorted(after) == on_disk
          and after[0] == "index.html",
          f"ROOT {cp.ROOT.name}, {after}")

    passed = sum(1 for _, ok, _ in results if ok)
    print(f"\n{passed}/{len(results)} lūkesčių išsipildė")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
