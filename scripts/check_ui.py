#!/usr/bin/env python3
"""
Sąsajos (UI/UX) patikra be naršyklės.

Tikrina dalykus, kurie dažniausiai lūžta tyliai: mobilaus viewport, absoliutūs
keliai, lietimo taikiniai, horizontali slinktis, animacijų išjungimas.

Naudojimas: python3 scripts/check_ui.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSS = ROOT / "assets" / "css" / "main.css"
HTML = ROOT / "index.html"

errors: list[str] = []
warnings: list[str] = []


def main() -> int:
    html = HTML.read_text(encoding="utf-8")
    css = CSS.read_text(encoding="utf-8")

    # 1. Mobilus viewport
    if 'name="viewport"' not in html or "width=device-width" not in html:
        errors.append("index.html: trūksta mobilaus viewport meta")

    # 2. Absoliutūs keliai (GitHub Pages projektų puslapyje jie lūžta)
    for m in re.finditer(r'(?:src|href)="(/[^/][^"]*)"', html):
        errors.append(f'index.html: absoliutus kelias „{m.group(1)}" — turi būti santykinis')

    # 3. Lietimo taikinys
    tap = re.search(r"--tap:\s*(\d+)px", css)
    if not tap:
        errors.append("main.css: nėra --tap kintamojo")
    elif int(tap.group(1)) < 44:
        errors.append(f"main.css: --tap {tap.group(1)}px < 44px")
    elif int(tap.group(1)) < 48:
        warnings.append(f"main.css: --tap {tap.group(1)}px — rekomenduojama ≥ 48px vaikams")

    # 4. Breakpointai: telefonas + planšetė/desktopas
    if not re.search(r"@media\s*\(max-width", css):
        errors.append("main.css: nėra nei vieno @media (max-width) — mobilus išdėstymas nepakoreguotas")
    if not re.search(r"clamp\(", css):
        warnings.append("main.css: nenaudojamas clamp() — tipografika gali nelankstėti")

    # 5. Animacijų išjungimas
    if "prefers-reduced-motion" not in css:
        errors.append("main.css: nėra prefers-reduced-motion — animacijos negerbia naudotojo nustatymo")

    # 6. Fiksuoti dideli pločiai (rizika horizontaliai slinkčiai telefone)
    for m in re.finditer(r"(?<!max-)(?<!min-)width:\s*(\d{4,})px", css):
        errors.append(f"main.css: fiksuotas plotis {m.group(1)}px — gali sukelti horizontalią slinktį")

    # 7. Sąsajos kalba: anglicizmai matomame HTML
    for w in ("skill", "level", "streak", "challenge", "score", "badge"):
        if re.search(rf"\b{w}\b", html, re.I):
            errors.append(f"index.html: anglicizmas „{w}“ vartotojo sąsajoje")

    # 8. Simuliacijų failai: kiekvienas turi grąžinti valymą arba bent neturėti intervalų
    for f in sorted((ROOT / "assets" / "js" / "sims").glob("*.js")):
        text = f.read_text(encoding="utf-8")
        if "setInterval(" in text and "return () =>" not in text:
            warnings.append(f"{f.name}: setInterval be valymo funkcijos")

    for e in errors:
        print(f"KLAIDA: {e}")
    for w in warnings:
        print(f"ĮSPĖJIMAS: {w}")
    print(f"\nRezultatas: {len(errors)} klaidų, {len(warnings)} įspėjimų")
    if not errors:
        print("✔ Sąsaja atitinka pagrindines taisykles.")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
