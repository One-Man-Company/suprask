#!/usr/bin/env python3
"""
Tikrina, ar kiekvienas tekstas, kurį vaikas gali išgirsti, turi garso įrašą.

Kodėl tai būtina: jei įrašo nėra, `speech.js` nebegroja nieko (arba, senesnėse
versijose, skaitydavo svetimos kalbos balsu). Todėl trūkstamas įrašas yra
klaida, o ne įspėjimas.

Naudojimas:
    python3 scripts/check_audio.py            # tikrina, grąžina 1 jei trūksta
    python3 scripts/check_audio.py --list      # išvardija trūkstamus
"""

from __future__ import annotations

import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

import generate_audio  # noqa: E402


def main() -> int:
    manifest_path = ROOT / "assets" / "audio" / "lt" / "manifest.json"
    if not manifest_path.exists():
        print("KLAIDA: nėra assets/audio/lt/manifest.json")
        return 1

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    texts = generate_audio.collect()

    missing = []
    for text in texts:
        entry = manifest.get(text)
        if not entry:
            missing.append(text)
            continue
        for variant in ("n", "s"):
            rel = entry.get(variant)
            if not rel or not (ROOT / "assets" / "audio" / "lt" / rel).exists():
                missing.append(f"{text} [{variant}]")

    if missing:
        print(f"KLAIDA: {len(missing)} tekstų be garso įrašo:")
        for m in missing[:40]:
            print("  -", m)
        if len(missing) > 40:
            print(f"  … ir dar {len(missing) - 40}")
        print("\nSugeneruok: .venv/bin/python scripts/generate_audio.py")
        return 1

    print(f"✔ Garsas pilnas: {len(texts)} tekstų, visi turi po du įrašus.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
