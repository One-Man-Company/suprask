#!/usr/bin/env python3
"""
Tikrina, ar kiekvienas tekstas, kurį vaikas gali išgirsti, turi garso įrašą.

Kodėl tai būtina: jei įrašo nėra, `speech.js` nebegroja nieko (arba, senesnėse
versijose, skaitydavo svetimos kalbos balsu). Todėl trūkstamas įrašas yra
klaida, o ne įspėjimas.

Patikra ėjo tik viena kryptimi: manifestas → diskas. Atvirkštinė kryptis
(diskas → manifestas) nebuvo tikrinama, todėl diske ir git istorijoje likę
įrašai, kurių niekas nebegroja, buvo nematomi, o žinutė „Garsas pilnas“
skambėjo taip, lyg būtų panaudotas kiekvienas failas. Šiandien (2026-11-09):
500 tekstų = 1000 įrašų, diske 1014 mp3, t. y. 14 našlaičių. Našlaitis nėra
klaida (vaikui nieko netrūksta ir CI neturi kristi dėl istorijos), bet skaičius
turi būti pasakytas teisingai, o failus turi būti galima pašalinti sąmoningai.

Naudojimas:
    python3 scripts/check_audio.py            # tikrina, grąžina 1 jei trūksta
    python3 scripts/check_audio.py --list      # išvardija trūkstamus ir našlaičius
    python3 scripts/check_audio.py --json      # dashboard'ui / būsenos generatoriui
    python3 scripts/check_audio.py --prune     # šalina manifeste neminimus mp3
"""

from __future__ import annotations

import argparse
import json
import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

import generate_audio  # noqa: E402

AUDIO = ROOT / "assets" / "audio" / "lt"


def referenced(manifest: dict) -> set[str]:
    """Įrašai, kuriuos manifestas realiai nurodo (abi variantai)."""
    refs: set[str] = set()
    for entry in manifest.values():
        if not isinstance(entry, dict):
            continue
        for variant in ("n", "s"):
            rel = entry.get(variant)
            if rel:
                refs.add(rel)
    return refs


def on_disk() -> set[str]:
    return {str(p.relative_to(AUDIO)) for p in AUDIO.glob("*/*.mp3")}


def check(probe_engine: bool = True) -> dict:
    manifest_path = AUDIO / "manifest.json"
    if not manifest_path.exists():
        return {"ok": False, "fatal": "nėra assets/audio/lt/manifest.json"}

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    texts = generate_audio.collect()
    literals = generate_audio.spoken_literals()
    refs = referenced(manifest)
    disk = on_disk()

    missing: list[str] = []
    for text in texts:
        entry = manifest.get(text)
        if not entry:
            missing.append(text)
            continue
        for variant in ("n", "s"):
            rel = entry.get(variant)
            if not rel or not (AUDIO / rel).exists():
                missing.append(f"{text} [{variant}]")

    # Vienas variklis visame korpuse. Skirtingų variklių mišinys atsiranda
    # tyliai (pvz. senas įrašas nepakeičiamas, nes failas jau yra), o vaikas
    # tada girdi du skirtingus balsus. Piper balsas — 22 050 Hz.
    wrong_engine: list[str] = []
    if probe_engine and shutil.which("ffprobe"):
        for text in texts:
            entry = manifest.get(text) or {}
            for variant in ("n", "s"):
                rel = entry.get(variant)
                if not rel:
                    continue
                path = AUDIO / rel
                if not path.exists():
                    continue
                out = subprocess.run(
                    ["ffprobe", "-v", "error", "-select_streams", "a:0",
                     "-show_entries", "stream=sample_rate", "-of", "csv=p=0", str(path)],
                    capture_output=True, text=True,
                ).stdout.strip()
                if out and out != "22050":
                    wrong_engine.append(f"{text} [{variant}] → {out} Hz")

    orphans = sorted(disk - refs)

    return {
        "ok": not missing and not wrong_engine,
        "texts": len(texts),
        "literals": len(literals),
        "referenced": len(refs),
        "on_disk": len(disk),
        "orphans": orphans,
        "missing": missing,
        "wrong_engine": wrong_engine,
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--list", action="store_true", help="išvardija trūkstamus ir našlaičius")
    ap.add_argument("--json", action="store_true", help="mašininė išvestis")
    ap.add_argument("--prune", action="store_true",
                    help="pašalina mp3, kurių manifestas nenurodo (tik našlaičius)")
    ap.add_argument("--no-engine", action="store_true", help="praleidžia ffprobe patikrą")
    args = ap.parse_args()

    data = check(probe_engine=not args.no_engine)
    if data.get("fatal"):
        print(f"KLAIDA: {data['fatal']}")
        return 1

    pruned: list[str] = []
    if args.prune and data["orphans"]:
        for rel in data["orphans"]:
            (AUDIO / rel).unlink(missing_ok=True)
            pruned.append(rel)
        data["pruned"] = pruned
        data["orphans"] = []
        data["on_disk"] = len(on_disk())

    if args.json:
        print(json.dumps(data, ensure_ascii=False))
        return 0 if data["ok"] else 1

    if data["missing"] or data["wrong_engine"]:
        if data["missing"]:
            print(f"KLAIDA: {len(data['missing'])} tekstų be garso įrašo:")
            for m in data["missing"][:40]:
                print("  -", m)
        if data["wrong_engine"]:
            print(f"KLAIDA: {len(data['wrong_engine'])} įrašų ne iš Piper balso (laukta 22 050 Hz):")
            for m in data["wrong_engine"][:20]:
                print("  -", m)
        print("\nSugeneruok iš naujo: .venv/bin/python scripts/generate_audio.py --all")
        return 1

    used = data["referenced"]
    total = data["on_disk"]
    print(f"✔ Garsas pilnas: {data['texts']} tekstų (iš jų {data['literals']} — tiesioginės "
          f"api.speak eilutės simuliacijų kode), {used} įrašų, visi iš Piper balso, "
          f"naudojama {used} iš {total} mp3.")

    if data["orphans"]:
        print(f"ĮSPĖJIMAS: {len(data['orphans'])} našlaičių — failai, kurių manifestas nebemini "
              f"(niekas jų negroja):")
        for o in (data["orphans"] if args.list else data["orphans"][:6]):
            print("  -", o)
        if not args.list and len(data["orphans"]) > 6:
            print(f"  … ir dar {len(data['orphans']) - 6} (--list išvardija visus)")
        print("Pašalinti sąmoningai: python3 scripts/check_audio.py --prune")
    if pruned:
        print(f"Pašalinta našlaičių: {len(pruned)}; liko {data['on_disk']} mp3.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
