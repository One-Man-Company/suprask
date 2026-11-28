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

    # 7. HTTP kelias: neperskaitytas `index.html` nėra „visos pažymėtos“ (LL-37).
    tmp = pathlib.Path(tempfile.mkdtemp(prefix="probe_sv_"))
    httpd = None
    try:
        (tmp / "index.html").write_bytes(html(f"./assets/css/main.css?v={SHA}"))
        httpd, url = serve(tmp)
        original = cp.LIVE_ROOT
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
        if httpd is not None:
            httpd.shutdown()
            httpd.server_close()
        import shutil
        shutil.rmtree(tmp, ignore_errors=True)

    passed = sum(1 for _, ok_, _ in results if ok_)
    print(f"\n{passed}/{len(results)} lūkesčių išsipildė")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
