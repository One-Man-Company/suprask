#!/usr/bin/env python3
"""Zondas `check_published.py` svetainės kodo žymų patikrai — be tinklo.

Kodėl šis failas egzistuoja (LL-36, LL-21). 2026-11-28 (#595) rastas defektas,
kurio nematė nė vienas vartas: `.github/workflows/pages.yml` prirašo
`?v=<commit>` dviem **kietai įrašytiems** raštams (`main.css`, `app.js`), o
likęs to paties žingsnio vartas skaito tik `assets/js` **importus**. Trečia
kodo nuoroda `index.html` (naujas stilius, antras scenarijų failas) todėl
likdavo be žymės, o naršyklė jai taiko GitHub Pages tarpinę atmintį (~10 min.)
— vaikas mato seną failą.

Vartai to nematė dviem atžvilgiais ir abu yra `check_published.py` kode:
  1. `_shell_state()` prieš lyginimą žymę **nuima**, tad trūkstama žymė repo
     ir gyvo failo skirtumo nepadaro;
  2. `_version_of()` ima **pirmą** rastą žymę ir skelbia ją visos svetainės
     versija, tad `deploy_pending` lieka `False`, o sėkmės eilutė rašo
     „versija <sha>“ — teiginį apie vieną nuorodą, tarsi jis galiotų visoms.

Zondas tikrina gryną funkciją `shell_version_stamps()` ir `verdict()` —
be tinklo, be laikinų serverių, < 0,2 s. HTTP kelias (`shell_version_check()`)
tikrinamas atskirai žemiau, per `http.server` vienam katalogui.

Naudojimas:
    python3 scripts/probe_check_published.py   # žr. ten esančius G–I
    python3 scripts/probe_shell_version.py     # 0 — visi lūkesčiai išsipildė
"""

from __future__ import annotations

import functools
import http.server
import pathlib
import sys
import tempfile
import threading

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))

import check_published as cp  # noqa: E402

results: list[tuple[str, bool, str]] = []


def check(name: str, ok: bool, detail: str) -> None:
    results.append((name, ok, detail))
    print(f"{'OK  ' if ok else 'KLAIDA'} {name} — {detail}")


def html(*refs: str) -> bytes:
    """`index.html` fragmentas su duotomis nuorodomis (kiekviena — jau su žyme ar be)."""
    body = "\n".join(f'<link href="{r}" />' for r in refs)
    return f"<!doctype html><html><head>\n{body}\n</head></html>".encode("utf-8")


SHA = "cdd8c73e"


class _QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):  # noqa: A002
        pass


def serve(base: pathlib.Path):
    handler = functools.partial(_QuietHandler, directory=str(base))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, f"http://127.0.0.1:{httpd.server_address[1]}/"


def verdict_shell(stamps: dict) -> dict:
    """`verdict()` su tik žymų teiginiu — kiti raktai sveiki, kad klaida būtų viena."""
    return cp.verdict({
        "shell_version_unstamped": stamps["unstamped"],
        "shell_version_values": stamps["versions"],
        "shell_version_measured": True,
        "unpushed_checked": True,
        "published_measured": True,
        "bytes_checked": True,
    })


def workflow_stamp_script() -> str | None:
    """`pages.yml` žymų žingsnio `run:` blokas — taip, kaip jį paleistų GitHub.

    Imama iš **workflow failo**, ne perrašoma zonde: kitaip zondas tikrintų
    savo kopiją, o defektas „workflow raštas ir vartas nesutaria“ (LL-38
    šeima) liktų nematomas. GitHub blokinį skaliarą atiduoda su bendra
    įtrauka, kurią numeta; čia daroma tas pats.
    """
    path = ROOT / ".github" / "workflows" / "pages.yml"
    if not path.is_file():
        return None
    lines = path.read_text(encoding="utf-8").splitlines()
    start = None
    for i, line in enumerate(lines):
        if line.strip() == "run: |" and "Prirašyti versiją" in lines[i - 1]:
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


def run_workflow_stamp(site: pathlib.Path, sha: str) -> tuple[int, str]:
    """Paleidžia workflow žymų žingsnį kaip `bash -euo pipefail`, grąžina (rc, išvestis)."""
    import subprocess
    script = workflow_stamp_script()
    if script is None:
        return 127, "pages.yml žymų žingsnio nepavyko perskaityti"
    env = {"PATH": "/usr/bin:/bin:/usr/local/bin", "GITHUB_SHA": sha,
           "HOME": str(pathlib.Path.home())}
    proc = subprocess.run(
        ["bash", "-euo", "pipefail", "-c", script],
        cwd=str(site), capture_output=True, text=True, timeout=300, env=env,
    )
    return proc.returncode, (proc.stdout or "") + (proc.stderr or "")


def site_from_repo(tmp: pathlib.Path) -> tuple[pathlib.Path, pathlib.Path]:
    """Publikavimo sutartis (`pages.yml`): HTML puslapiai + `assets/`, kuriuos
    žymi žymų žingsnis → `_site`, kuris ir atiduodamas.

    Kopijuojama tik tai, ko zondas **skaito**: šaknyje atiduodami `*.html`,
    `assets/css` ir `assets/js`. `pages.yml` kopijuoja visą `assets/` ir
    `content/`, bet `assets/audio` (94 MB) nėra šios patikros objektas —
    garsą jau matuoja `check_audio()`, o zondo sąlyga yra < 5 s.

    Grąžina (`_site`, šaknis, kurią atiduoda serveris): GitHub Pages atiduoda
    `_site` **turinį** projekto šaknyje, tad žymų žingsnis (`cwd=_site`) ir
    serveris (`directory=_site`) žiūri į tuos pačius failus.
    """
    import shutil
    site = tmp / "_site"
    site.mkdir(parents=True, exist_ok=True)
    for name in ("index.html", "404.html"):
        shutil.copy2(ROOT / name, site / name)
    for rel in ("assets/css", "assets/js"):
        shutil.copytree(ROOT / rel, site / rel, dirs_exist_ok=True)
    return site, site


def check_page_stamps() -> None:
    """8. `?v=` žymės abiem įkeliamiems puslapiams (LL-240, #607).

    Iki #607 `shell_version_stamps()` skaitė tik **atributines** nuorodas ir
    tik `index.html`, o `404.html` CSS nuorodą stato scenarijus
    (`css.href = root + "assets/css/main.css"`). Todėl:
      1. vardiklis „kodo nuorodos su `?v=`: 2/2“ skaičiavo vieną puslapį iš
         dviejų — antras įkeliamas puslapis neįėjo nė į skaičių;
      2. `pages.yml` du kietai įrašyti `sed` raštai scenarijaus literalo
         nepasiekia, o žymų vartas skaitė tik `_site/index.html`.
    Zondas matuoja abu dalykus per **tikrą** workflow žingsnį ir **tikrą**
    vartą: jei raštas ir skaitymas kada nors išsiskirs, kris čia.
    """
    if not hasattr(cp, "shell_versions_all"):
        # Senasis įrankis skaitė tik `index.html` ir tik atributus — 404.html
        # nuoroda buvo už matavimo ribos. Tai KLAIDA, ne praleista patikra:
        # kitaip „25/25“ būtų teiginys apie patikrą, kurios nebuvo (LL-37).
        check("8: įrankis matuoja VISUS įkeliamus puslapius (`code_pages`)",
              False, "check_published.py neturi `shell_versions_all` — "
                     "matuojamas tik index.html")
        return
    check("8: `code_pages()` ima ABI įkeliamus puslapius (ne ranka rašytą sąrašą)",
          cp.code_pages() == ["index.html", "404.html"], f"{cp.code_pages()}")

    # Repo būsena: 404.html nuoroda scenarijuje PRIVALO būti atpažįstama —
    # tai neigiamos kontrolės prielaida, be jos zondas nieko neįrodytų.
    repo_404 = cp.shell_version_stamps((ROOT / "404.html").read_bytes())
    check("8: 404.html scenarijaus nuoroda atpažįstama (refs 1, unstamped)",
          repo_404["refs"] == 1 and repo_404["unstamped"] == ["assets/css/main.css"],
          f"refs {repo_404['refs']}, unstamped {repo_404['unstamped']}")

    tmp = pathlib.Path(tempfile.mkdtemp(prefix="probe_stamps_"))
    httpd = None
    try:
        site, served = site_from_repo(tmp)
        httpd, url = serve(served)
        original = cp.LIVE_ROOT

        # 9. NEPAŽYMĖTA: vartas turi matyti 3 nuorodas iš 2 puslapių ir būti
        #    raudonas. Senasis vartas šioje būsenoje skelbė „2/2“ ir rc 0.
        try:
            cp.LIVE_ROOT = url
            got = cp.shell_version_check()
            check("9: be žymių → 3 nuorodos iš 2 puslapių (senasis sakė 2/2)",
                  got["refs"] == 3 and not got["stamped"]
                  and got["measured"] is True,
                  f"refs {got['refs']}, stamped {got['stamped']}, "
                  f"pages {sorted(got.get('pages') or {})}")
            check("9: 404.html trūkstama žymė įvardijama PUSLAPIU",
                  any(u.startswith("404.html:") for u in got["unstamped"]),
                  f"unstamped {got['unstamped']}")
            check("9: verdict raudonas",
                  not verdict_shell({**got, "unstamped": got["unstamped"]})["ok"],
                  verdict_shell({**got, "unstamped": got["unstamped"]})["label"])
        finally:
            cp.LIVE_ROOT = original

        # 10. TIKRAS workflow žingsnis → visos 3 žymėtos, viena versija.
        #     `cwd` — repo šaknis, nes `pages.yml` žymų žingsnis rašo į
        #     `_site/…` santykiniu keliu (ne į katalogą, kuriame failas guli).
        rc, out = run_workflow_stamp(site.parent, SHA)
        check("10: pages.yml žymų žingsnis — rc 0", rc == 0,
              f"rc {rc}: {(out.strip().splitlines() or [''])[-1][:160]}")
        stamped_404 = cp.shell_version_stamps((site / "404.html").read_bytes())
        check("10: po workflow žingsnio 404.html NUORODA PAŽYMĖTA",
              stamped_404["unstamped"] == []
              and stamped_404["versions"] == [SHA],
              f"unstamped {stamped_404['unstamped']}, "
              f"versions {stamped_404['versions']}")
        # Komentaras (be kabučių) nepažymimas — kitaip `sed` keistų tekstą,
        # kurio vaikas neskaito, ir žymė atsirastų ten, kur nereikia (LL-38).
        text_404 = (site / "404.html").read_text(encoding="utf-8")
        check("10: komentare esanti nuoroda nepažymėta",
              "`./assets/css/main.css?v=" not in text_404,
              "komentaras paliestas" if "`./assets/css/main.css?v=" in text_404
              else "komentaras nepaliestas")
        # Antras bėgimas nebesudvigubina žymės (idempotentiškumas): publikavimas
        # gali būti pakartotas, o `?v=X?v=X` būtų 404.
        run_workflow_stamp(site.parent, SHA)
        check("10: pakartotas žymėjimas nebesudvigubina",
              (site / "404.html").read_text(encoding="utf-8").count("?v=") == 1
              and (site / "index.html").read_text(encoding="utf-8").count("?v=") == 2,
              f"404 ?v= {text_404.count('?v=')}, "
              f"index ?v= {(site / 'index.html').read_text(encoding='utf-8').count('?v=')}")

        # 11. Pažymėtoje svetainėje vartas ŽALIAS — ir matuoja 3/3.
        httpd2, url2 = serve(served)
        try:
            cp.LIVE_ROOT = url2
            got = cp.shell_version_check()
            check("11: po žymėjimo → 3/3 ir 2 puslapiai išmatuoti",
                  got["refs"] == 3 and len(got["stamped"]) == 3
                  and got["unstamped"] == [] and got["measured"] is True,
                  f"refs {got['refs']}, stamped {len(got['stamped'])}, "
                  f"unstamped {got['unstamped']}")
            check("11: verdict žalias ir vardiklis 3/3",
                  verdict_shell({**got, "unstamped": got["unstamped"],
                                 "versions": got["versions"]})["ok"],
                  verdict_shell({**got, "unstamped": got["unstamped"],
                                 "versions": got["versions"]})["label"])
        finally:
            cp.LIVE_ROOT = original
            httpd2.shutdown()
            httpd2.server_close()

        # 12. Vienas puslapis nepasiekiamas → `measured False`, o ne
        #     „visos pažymėtos“ (LL-37). Tikrinama, kad vardiklis nedingtų
        #     tyliai: be puslapio 3/3 būtų teiginys apie nematytą failą.
        original_pages = cp.code_pages
        cp.code_pages = lambda: ["index.html", "nera-tokio.html"]
        try:
            cp.LIVE_ROOT = url
            got = cp.shell_version_check()
            check("12: puslapio nepavykus perskaityti → measured False",
                  got["measured"] is False and got["refs"] == 2,
                  f"measured {got['measured']}, refs {got['refs']}")
        finally:
            cp.LIVE_ROOT = original
            cp.code_pages = original_pages
    finally:
        if httpd is not None:
            httpd.shutdown()
            httpd.server_close()
        import shutil
        shutil.rmtree(tmp, ignore_errors=True)


def main() -> int:
    # 1. Dabartinis repo `index.html` — tai, ką `pages.yml` turi pažymėti.
    real = (ROOT / "index.html").read_bytes()
    stamps = cp.shell_version_stamps(real)
    check("1: repo index.html — dvi kodo nuorodos atpažintos",
          stamps["refs"] == 2, f"refs {stamps['refs']}: {stamps['stamped'] or stamps['unstamped']}")
    # Repo failas žymos neturi (ją deda tik `pages.yml`), tad šiandien abi
    # nuorodos turi būti „be žymės“. Tai teiginys apie repo, ne apie svetainę.
    check("1: repo index.html žymos neturi (ją deda pages.yml)",
          len(stamps["unstamped"]) == 2 and not stamps["versions"],
          f"unstamped {stamps['unstamped']}, versions {stamps['versions']}")

    # 2. Sveika būsena — kontrolinė. Be jos neigiami atvejai nieko neįrodytų.
    ok = cp.shell_version_stamps(html(
        f"./assets/css/main.css?v={SHA}", f"./assets/js/app.js?v={SHA}"))
    check("2: abi nuorodos su ?v= → unstamped 0, viena versija",
          not ok["unstamped"] and ok["versions"] == [SHA] and ok["refs"] == 2,
          f"refs {ok['refs']}, unstamped {ok['unstamped']}, versions {ok['versions']}")
    check("2: verdict žalias", verdict_shell(ok)["ok"],
          verdict_shell(ok)["label"] or "(be priežasčių)")

    # 3. DEFEKTAS: trečia nuoroda be žymės — būtent tai, ką praleido du kietai
    #    įrašyti `sed`. Tai neigiama kontrolė: senasis `_version_of()` šioje
    #    būsenoje grąžintų `SHA` ir vartai liktų žali.
    bad = cp.shell_version_stamps(html(
        f"./assets/css/main.css?v={SHA}",
        "./assets/css/print.css",
        f"./assets/js/app.js?v={SHA}"))
    check("3: trečia nuoroda be ?v= → unstamped 1, įvardyta",
          bad["unstamped"] == ["./assets/css/print.css"] and bad["versions"] == [SHA],
          f"unstamped {bad['unstamped']}, versions {bad['versions']}")
    check("3: verdict raudonas ir įvardija failą",
          not verdict_shell(bad)["ok"] and "print.css" in verdict_shell(bad)["label"],
          verdict_shell(bad)["label"])
    check("3: senasis _version_of() šioje būsenoje būtų grąžinęs versiją (defektas realus)",
          cp._version_of(html(f"./assets/css/main.css?v={SHA}", "./assets/css/print.css")) == SHA,
          f"_version_of → {cp._version_of(html(f'./assets/css/main.css?v={SHA}', './assets/css/print.css'))!r}")

    # 4. Mišri versija: visos pažymėtos, bet skirtingais commit'ais. `_version_of()`
    #    ima pirmą, tad svetainė skelbtų vieną versiją, nors pusė failų — kita.
    mix = cp.shell_version_stamps(html(
        f"./assets/css/main.css?v={SHA}", "./assets/js/app.js?v=deadbeef"))
    check("4: dvi skirtingos žymės → versions 2",
          not mix["unstamped"] and len(mix["versions"]) == 2,
          f"versions {mix['versions']}")
    check("4: verdict raudonas (mišrus kodas)",
          not verdict_shell(mix)["ok"] and "mišrus" in verdict_shell(mix)["label"],
          verdict_shell(mix)["label"])

    # 5. Ne kodo nuorodos neįtraukiamos: kitaip vartas prašytų žymos ten, kur
    #    `pages.yml` jos nededa, ir būtų amžinai raudonas (LL-38).
    other = cp.shell_version_stamps(html(
        "./assets/img/x.png", "data:image/svg+xml;base64,AA==", "./assets/audio/lt/manifest.json"))
    check("5: paveikslas / data: URI / manifestas neįtraukiami",
          other["refs"] == 0 and not other["unstamped"],
          f"refs {other['refs']}")

    # 6. Viengubos kabutės ir `src` — `pages.yml` sed jas irgi turi matyti.
    single = cp.shell_version_stamps(html(
        f"./assets/css/main.css?v={SHA}", "./assets/js/app.js"))
    check("6: viengubų/dvigubų kabučių atvejai skaitomi vienodai",
          single["refs"] == 2 and single["unstamped"] == ["./assets/js/app.js"],
          f"refs {single['refs']}, unstamped {single['unstamped']}")

    # 7. HTTP kelias: neperskaitytas puslapis nėra „visos pažymėtos“ (LL-37).
    #    Veidrodis turi vieną puslapį, tad `code_pages()` laikinai susiaurinamas:
    #    tai matuoja HTTP kelią, ne puslapių sąrašą (tai — 8 zondas).
    tmp = pathlib.Path(tempfile.mkdtemp(prefix="probe_sv_"))
    httpd = None
    original_pages = getattr(cp, "code_pages", None)
    try:
        (tmp / "index.html").write_bytes(html(f"./assets/css/main.css?v={SHA}"))
        httpd, url = serve(tmp)
        original = cp.LIVE_ROOT
        cp.code_pages = lambda: ["index.html"]
        try:
            cp.LIVE_ROOT = url
            got = cp.shell_version_check()
            check("7: HTTP veidrodis → measured True, stamped 1",
                  got["measured"] and got["stamped"] == ["./assets/css/main.css"],
                  f"measured {got['measured']}, stamped {got['stamped']}")
        finally:
            cp.LIVE_ROOT = original
        # Nepasiekiamas adresas: turi būti `measured False`, o ne tyli žalia.
        cp.LIVE_ROOT = "http://127.0.0.1:1/"
        try:
            gone = cp.shell_version_check()
            check("7: nepasiekiama → measured False (ne „visos pažymėtos“)",
                  gone["measured"] is False,
                  f"measured {gone['measured']}, unstamped {gone['unstamped']}")
        finally:
            cp.LIVE_ROOT = original
    finally:
        if original_pages is not None:
            cp.code_pages = original_pages
        if httpd is not None:
            httpd.shutdown()
            httpd.server_close()
        import shutil
        shutil.rmtree(tmp, ignore_errors=True)

    check_page_stamps()

    passed = sum(1 for _, ok_, _ in results if ok_)
    print(f"\n{passed}/{len(results)} lūkesčių išsipildė")
    return 0 if passed == len(results) else 1

if __name__ == "__main__":
    raise SystemExit(main())
