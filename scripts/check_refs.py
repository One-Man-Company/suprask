#!/usr/bin/env python3
"""Vidinių nuorodų patikra: ar tai, į ką nurodo puslapis ir kodas, tikrai yra.

Defekto klasė (nauja, iki šio įrankio nematyta). `scripts/check_published.py`
lygina **failus, kurie repo yra**, su gyva svetaine. Tai reiškia: jei `index.html`
nurodo `./assets/js/app.js`, o `app.js` importuoja `./registry.js` — abu failai
lyginami ir sutampa. Bet jei importas parašytas su klaida (`./registrys.js`) arba
į failą, kurio niekas nesukūrė, tai **nelyginama su niekuo**: trūkstamas failas
tiesiog nepatenka į sąrašą, o esamas lieka baitiškai lygus. Rezultatas: deploy
žalias, `check_published` sako „sutampa“, o vaikas naršyklėje gauna baltą
puslapį, nes modulio grafas lūžta ties pirmu importu.

Tas pats galioja CSS (`url(...)` į paveikslą, kurio nėra) ir `404.html`
nuorodoms. `.github/workflows/pages.yml` rašo `?v=` prie importų ir neturi
varto, kuris patikrintų, ar pats importo taikinys egzistuoja — ten patikra
vyksta **po** merge, kai taisyti jau vėlu.

Ką įrankis daro:
  1. skaito `index.html`, `404.html` ir visus `*.html` šaknyje — `href`/`src`;
  2. skaito `assets/**/*.js` — statinius `import … from "x"`, `export … from "x"`
     ir dinaminius `import("x")`;
  3. skaito `assets/**/*.css` — `url(...)`;
  4. palieka tik **vietines** nuorodas (ne `http(s):`, ne `data:`, ne `#…`);
  5. kiekvieną išsprendžia to failo katalogo atžvilgiu ir patikrina, kad failas
     yra. Trūkstamas — klaida (rc 1), su failu ir eilute.

Papildomai (įspėjimas, ne klaida): JS failai, kurių nepasiekia jokia nuoroda
iš `index.html` — paskelbtas, bet nevykdomas kodas; jis gali slėpti pasenusią
simuliacijos versiją.

Naudojimas:
    python3 scripts/check_refs.py             # rc 0 — visos nuorodos veda į failą
    python3 scripts/check_refs.py --json      # ta pati informacija mašinai
    python3 scripts/check_refs.py --root DIR  # zondas: veidrodis su defektu
"""

from __future__ import annotations

import argparse
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

# `href="x"` ir `src='x'` — abi kabutės, nes HTML leidžia abi.
MARKUP_REF = re.compile(r"""\b(?:href|src)\s*=\s*["']([^"']+)["']""")
# `import a from "x"`, `import {a, b} from "x"`, `import "x"`, `export … from "x"`.
# Kabutė imama kaip grupė, o ne rašoma dviem raštais: LL-38 šeima — vartai,
# kurie atpažįsta vieną formą ir tyliai praleidžia kitą.
STATIC_REF = re.compile(
    r"""\b(?:import|export)\s+(?:[^"';\n]*?\bfrom\s*)?["']([^"']+)["']"""
)
DYNAMIC_REF = re.compile(r"""\bimport\s*\(\s*["']([^"']+)["']\s*\)""")
# Dinaminis importas su šablonu (``import(`./x.js`)``) — ne klaida, bet
# neišmatuota: toks taikinys surenkamas vykdymo metu. Skaičiuojamas atskirai,
# kad aprėptis būtų pasakyta skaičiumi, o ne nutylėta (LL-37).
DYNAMIC_TEMPLATE = re.compile(r"""\bimport\s*\(\s*`""")
CSS_URL = re.compile(r"""url\(\s*["']?([^"')]+)["']?\s*\)""")

SCHEME = re.compile(r"^[a-zA-Z][a-zA-Z0-9+.\-]*:")


def is_local(ref: str) -> bool:
    ref = ref.strip()
    if not ref or ref.startswith("#") or ref.startswith("//"):
        return False
    if ref.startswith("/"):
        # Absoliutus kelias svetainės šaknyje — `pages.yml` publikuoja tik
        # `index.html`, `assets/`, `content/`, tad toks kelias taip pat
        # tikrinamas, tik iš repo šaknies.
        return True
    return not SCHEME.match(ref)


def rel_target(raw: str) -> str | None:
    """Nuoroda be `?v=` žymos ir `#fragmento`. `None` — nuoroda ne į failą."""
    ref = raw.strip()
    for sep in ("#", "?"):
        idx = ref.find(sep)
        if idx >= 0:
            ref = ref[:idx]
    if not ref or ref.endswith("/"):
        # `href="./"` — šaknis, ne failas; katalogai netikrinami.
        return None
    return ref


def root_html(root: pathlib.Path) -> list[pathlib.Path]:
    """Šaknies HTML failai, kuriuos `pages.yml` publikuoja.

    Paslėpti failai (`.probe-*.html`) praleidžiami sąmoningai: jie yra zondų
    likučiai darbo kopijoje, į svetainę nepatenka (`pages.yml` kopijuoja
    `index.html` ir `404.html`), o jų nuorodos iškreiptų matuojamą skaičių —
    tas pats principas kaip „matuok artefaktą, ne katalogą“ (LL-167).
    """
    return [p for p in sorted(root.glob("*.html")) if not p.name.startswith(".")]


def scan(root: pathlib.Path) -> tuple[list[dict], int, int]:
    """Grąžina (trūkstami, patikrintų nuorodų skaičius, neišmatuotų dinaminių)."""
    missing: list[dict] = []
    checked = 0
    unmeasured = 0

    files: list[tuple[pathlib.Path, re.Pattern]] = []
    for html in root_html(root):
        files.append((html, MARKUP_REF))
    for js in sorted((root / "assets").rglob("*.js")):
        files.append((js, STATIC_REF))
        files.append((js, DYNAMIC_REF))
        # Šabloninius importus skaičiuojame **kartą** per failą, ne per raštą:
        # failas patenka į sąrašą du kartus (statinis + dinaminis), o dvigubas
        # skaičius praneštų aprėptį, kurios nėra (LL-21).
        try:
            text = js.read_text(encoding="utf-8")
        except OSError:
            continue
        unmeasured += len(DYNAMIC_TEMPLATE.findall(text))
    for css in sorted((root / "assets").rglob("*.css")):
        files.append((css, CSS_URL))

    for path, pattern in files:
        try:
            text = path.read_text(encoding="utf-8")
        except OSError as exc:  # sugadintas failas neturi tapti tylia žalia
            missing.append(
                {
                    "file": str(path.relative_to(root)),
                    "line": 0,
                    "ref": "",
                    "why": f"failo nepavyko perskaityti: {exc}",
                }
            )
            continue
        for m in pattern.finditer(text):
            raw = m.group(1)
            if not is_local(raw):
                continue
            target = rel_target(raw)
            if target is None:
                continue
            checked += 1
            base = root if target.startswith("/") else path.parent
            resolved = (base / target.lstrip("/")).resolve()
            if not resolved.exists():
                line = text.count("\n", 0, m.start()) + 1
                missing.append(
                    {
                        "file": str(path.relative_to(root)),
                        "line": line,
                        "ref": raw,
                        "why": "nėra tokio failo repo",
                    }
                )
    return missing, checked, unmeasured


def reachable_js(root: pathlib.Path) -> tuple[list[str], int]:
    """JS failai, pasiekiami nuo `index.html` per `import`/`src` grandinę."""
    graph: dict[pathlib.Path, list[pathlib.Path]] = {}
    js_files = sorted((root / "assets").rglob("*.js"))
    for js in js_files:
        text = js.read_text(encoding="utf-8", errors="replace")
        deps: list[pathlib.Path] = []
        for pattern in (STATIC_REF, DYNAMIC_REF):
            for m in pattern.finditer(text):
                raw = m.group(1)
                if not is_local(raw):
                    continue
                target = rel_target(raw)
                if target is None:
                    continue
                resolved = (js.parent / target).resolve()
                if resolved.suffix == ".js":
                    deps.append(resolved)
        graph[js.resolve()] = deps

    entries: list[pathlib.Path] = []
    for html in root_html(root):
        text = html.read_text(encoding="utf-8", errors="replace")
        for m in MARKUP_REF.finditer(text):
            raw = m.group(1)
            if not is_local(raw):
                continue
            target = rel_target(raw)
            if target is None:
                continue
            resolved = (root / target.lstrip("/")).resolve()
            if resolved.suffix == ".js":
                entries.append(resolved)

    seen: set[pathlib.Path] = set()
    stack = list(entries)
    while stack:
        cur = stack.pop()
        if cur in seen:
            continue
        seen.add(cur)
        stack.extend(graph.get(cur, []))

    orphan = [
        str(p.relative_to(root))
        for p in graph
        if p not in seen and p.exists()
    ]
    return sorted(orphan), len(seen)


def main() -> int:
    ap = argparse.ArgumentParser(description="Vidinių nuorodų patikra")
    ap.add_argument("--root", type=pathlib.Path, default=ROOT)
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--quiet", action="store_true", help="tik rc")
    args = ap.parse_args()
    root = args.root.resolve()

    if not (root / "assets").is_dir():
        print(f"KLAIDA: {root} neturi assets/ — netikrinta", file=sys.stderr)
        return 1

    missing, checked, unmeasured = scan(root)
    orphan, js_seen = reachable_js(root)

    if args.json:
        print(
            json.dumps(
                {
                    "root": str(root),
                    "refs_checked": checked,
                    "missing": missing,
                    "dynamic_template_refs": unmeasured,
                    "js_files_reachable": js_seen,
                    "js_files_unreachable": orphan,
                    "ok": not missing and checked > 0,
                },
                ensure_ascii=False,
            )
        )
    elif not args.quiet:
        if checked == 0:
            print("NEIŠMATUOTA: nerasta nė vienos vidinės nuorodos — patikra nieko nepasakė")
        if missing:
            print(f"KLAIDA: {len(missing)} vidinių nuorodų veda į nieką (LL-167):")
            for item in missing:
                print(f"  · {item['file']}:{item['line']} → {item['ref'] or '—'} ({item['why']})")
        else:
            print(
                f"✔ Vidaus nuorodos: {checked} nuorodų {js_seen} JS failuose ir "
                f"{len(root_html(root))} HTML — visos veda į esantį failą"
                + (f"; {unmeasured} dinaminės su šablonu neišmatuotos" if unmeasured else "")
            )
        if orphan:
            print(f"Įspėjimas: {len(orphan)} JS failų nepasiekia jokia nuoroda:")
            for name in orphan:
                print(f"  · {name}")

    return 1 if missing or checked == 0 else 0


if __name__ == "__main__":
    sys.exit(main())
