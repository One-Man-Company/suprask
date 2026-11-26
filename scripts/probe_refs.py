#!/usr/bin/env python3
"""Zondas `check_refs.py` — paleidžiamas įrodymas, kad vartai tikrai gaudo (LL-167).

Kodėl atskiras failas: teiginys „nuoroda į neegzistuojantį failą dabar raudona“
neturi likti docstring'e. Kiekvienas atvejis paleidžiamas per **tikrą** įrankio
`main()` kelią (`--root` veidrodis, `--json` išvestis), o ne per vidinę funkciją,
nes būtent išėjimo kodas yra tai, ką mato CI.

K1–K9:
  K1 švarus veidrodis → rc 0, `ok: true`
  K2 lūžęs statinis importas (vienguba kabutė) → rc 1, įvardytas failas ir eilutė
  K3 lūžęs dinaminis `import("…")` → rc 1
  K4 lūžęs CSS `url(...)` → rc 1
  K5 lūžęs `href` HTML faile → rc 1
  K6 dinaminis importas su šablonu → rc 0, bet `dynamic_template_refs` = 1
     (neišmatuota pasakyta skaičiumi, o ne nutylėta — LL-37)
  K7 tuščias veidrodis be nuorodų → rc 1 „NEIŠMATUOTA“ (tyli žalia draudžiama)
  K8 JS failas, kurio niekas neimportuoja → rc 0, bet įspėjimas + sąraše
  K9 `https:`, `data:` ir `#…` nuorodos nesugeneruoja klaidų (klaidingų signalų nėra)

Naudojimas:
    python3 scripts/probe_refs.py            # 0 — visi lūkesčiai išsipildė
"""

from __future__ import annotations

import json
import pathlib
import shutil
import subprocess
import sys
import tempfile

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
CHECKER = HERE / "check_refs.py"

results: list[tuple[str, bool, str]] = []


def run(root: pathlib.Path) -> tuple[int, dict]:
    proc = subprocess.run(
        [sys.executable, str(CHECKER), "--root", str(root), "--json"],
        capture_output=True,
        text=True,
    )
    try:
        data = json.loads(proc.stdout)
    except json.JSONDecodeError:
        data = {"raw": proc.stdout.strip(), "err": proc.stderr.strip()}
    return proc.returncode, data


def mirror(tmp: pathlib.Path) -> pathlib.Path:
    """Veidrodis: HTML šaknyje bei assets/js ir assets/css — tiek, kiek reikia."""
    dst = tmp / "site"
    dst.mkdir(parents=True, exist_ok=True)
    for html in ROOT.glob("*.html"):
        shutil.copy2(html, dst / html.name)
    for part in ("js", "css"):
        src = ROOT / "assets" / part
        if src.is_dir():
            shutil.copytree(src, dst / "assets" / part)
    return dst


def edit(path: pathlib.Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    assert old in text, f"zondo klaida: {path.name} neturi {old[:40]!r}"
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


def case(name: str, ok: bool, detail: str) -> None:
    results.append((name, ok, detail))


def main() -> int:
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp = pathlib.Path(tmpdir)

        # K1 — švarus veidrodis.
        site = mirror(tmp)
        rc, data = run(site)
        case(
            "K1 švarus",
            rc == 0 and data.get("ok") is True and data.get("refs_checked", 0) > 0,
            f"rc {rc}, nuorodų {data.get('refs_checked')}, trūksta {len(data.get('missing', []))}",
        )
        base_refs = data.get("refs_checked", 0)

        # K2 — lūžęs statinis importas vienguboje kabutėje (kabutės forma
        # sąmoningai kitokia, nei rašo dauguma repo failų: LL-38).
        broken = tmp / "k2"
        shutil.copytree(site, broken)
        edit(broken / "assets" / "js" / "sims" / "calba.js", 'from "./art.js"', "from './art-new.js'")
        rc, data = run(broken)
        hit = [m for m in data.get("missing", []) if "art-new.js" in m.get("ref", "")]
        case(
            "K2 lūžęs statinis importas",
            rc == 1 and bool(hit) and hit[0]["line"] > 0 and hit[0]["file"].endswith("calba.js"),
            f"rc {rc}, radinys {hit[0] if hit else '—'}",
        )

        # K3 — lūžęs dinaminis importas.
        broken = tmp / "k3"
        shutil.copytree(site, broken)
        edit(broken / "assets" / "js" / "app.js", 'import("./speech.js")', 'import("./speech2.js")')
        rc, data = run(broken)
        hit = [m for m in data.get("missing", []) if "speech2.js" in m.get("ref", "")]
        case("K3 lūžęs dinaminis importas", rc == 1 and bool(hit), f"rc {rc}, radinys {hit[:1]}")

        # K4 — lūžęs CSS url().
        broken = tmp / "k4"
        shutil.copytree(site, broken)
        css = broken / "assets" / "css" / "main.css"
        with css.open("a", encoding="utf-8") as fh:
            fh.write("\n.zondas { background: url('./nera-tokio.svg'); }\n")
        rc, data = run(broken)
        hit = [m for m in data.get("missing", []) if "nera-tokio.svg" in m.get("ref", "")]
        case("K4 lūžęs CSS url()", rc == 1 and bool(hit), f"rc {rc}, radinys {hit[:1]}")

        # K5 — lūžęs href HTML faile (404.html: puslapis, kurį vaikas pamato,
        # kai adresas neteisingas). Nuoroda **įrašoma**, o ne ieškoma
        # esamos: pirmoji zondo versija keitė `./assets/css/main.css`, o kai
        # #560 puslapį perrašė, ta eilutė liko tik komentare — zondas toliau
        # „ėjo“ ir nebetikrino nieko (K5 rc 0). Fixture'is, priklausantis nuo
        # tikslinio teksto, yra LL-36 atmaina: jis tyliai nustoja matuoti.
        broken = tmp / "k5"
        shutil.copytree(site, broken)
        page = broken / "404.html"
        page.write_text(
            page.read_text(encoding="utf-8")
            + '\n<link rel="stylesheet" href="/assets/css/nera-tokio.css">\n',
            encoding="utf-8")
        rc, data = run(broken)
        hit = [m for m in data.get("missing", []) if "nera-tokio.css" in m.get("ref", "")]
        case("K5 lūžęs href", rc == 1 and bool(hit) and hit[0]["file"] == "404.html", f"rc {rc}, radinys {hit[:1]}")

        # K6 — dinaminis importas su šablonu: ne klaida, bet neišmatuota.
        broken = tmp / "k6"
        shutil.copytree(site, broken)
        edit(broken / "assets" / "js" / "app.js", 'import("./speech.js")', "import(`./speech.js`)")
        rc, data = run(broken)
        case(
            "K6 šabloninis importas",
            rc == 0 and data.get("dynamic_template_refs") == 1,
            f"rc {rc}, neišmatuota {data.get('dynamic_template_refs')}",
        )

        # K7 — veidrodis be nuorodų: turi būti „neišmatuota“, ne žalia.
        empty = tmp / "k7"
        (empty / "assets" / "js").mkdir(parents=True)
        (empty / "index.html").write_text("<!doctype html><title>tuščias</title>", encoding="utf-8")
        rc, data = run(empty)
        case(
            "K7 be nuorodų",
            rc == 1 and data.get("refs_checked") == 0 and data.get("ok") is False,
            f"rc {rc}, nuorodų {data.get('refs_checked')}",
        )

        # K8 — JS failas, kurio niekas neimportuoja: įspėjimas, ne klaida.
        broken = tmp / "k8"
        shutil.copytree(site, broken)
        (broken / "assets" / "js" / "pamirstas.js").write_text("export const x = 1;\n", encoding="utf-8")
        rc, data = run(broken)
        case(
            "K8 nepasiekiamas JS",
            rc == 0 and data.get("js_files_unreachable") == ["assets/js/pamirstas.js"],
            f"rc {rc}, našlaičiai {data.get('js_files_unreachable')}",
        )

        # K9 — svetimos ir vidinės (fragmento) nuorodos neliečiamos.
        broken = tmp / "k9"
        shutil.copytree(site, broken)
        edit(
            broken / "index.html",
            "<head>",
            '<head>\n  <link rel="icon" href="https://example.org/x.svg">\n'
            '  <link rel="preload" href="data:image/svg+xml,%3Csvg%3E%3C/svg%3E">\n'
            '  <a href="#/apie">nuoroda</a>',
        )
        rc, data = run(broken)
        case(
            "K9 svetimos nuorodos",
            rc == 0 and data.get("refs_checked") == base_refs,
            f"rc {rc}, nuorodų {data.get('refs_checked')} (buvo {base_refs})",
        )

    ok = sum(1 for _, good, _ in results if good)
    for name, good, detail in results:
        print(f"{'✔' if good else '✘'} {name} — {detail}")
    print(f"\n{ok}/{len(results)} lūkesčių išsipildė")
    return 0 if ok == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())
