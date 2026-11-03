#!/usr/bin/env python3
"""
Perklausos metu pažymėtų įrašų pakeitimas kitu varikliu.

Taisyklė paprasta: apie lietuvišką tartį sprendžia žmogus, ne algoritmas.
Joks atpažintuvas negali pasakyti, ar kirtis padėtas teisingai — tai girdi tik
gimtakalbis. Todėl `dashboard/garsas.py` leidžia pažymėti neteisingai ištartą
žodį, o šis skriptas jam sugeneruoja įrašą KITU varikliu
(Edge „Ona" → Edge „Leonas" → Google lt) ir įrašo jį vietoje senojo.
Žmogus perklauso iš naujo: jei vis dar neteisingai — pažymi vėl, ir imamas
sekantis variklis. Taip ciklas baigiasi tik tada, kai tartį patvirtina ausis.

Naudojimas:
    python3 scripts/fix_flagged_audio.py --dry-run
    python3 scripts/fix_flagged_audio.py
    python3 scripts/fix_flagged_audio.py --engine google
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import pathlib
import subprocess
import tempfile
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
AUDIO = ROOT / "assets" / "audio" / "lt"
MANIFEST = AUDIO / "manifest.json"
FLAGS = ROOT / "agents" / "audio-flags.json"
REPORT = ROOT / "agents" / "log" / "audio-fix.json"

RATES = {"n": "-4%", "s": "-12%"}
SOURCES = [
    ("ona", "lt-LT-OnaNeural"),
    ("leonas", "lt-LT-LeonasNeural"),
]


def sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]


async def edge(text: str, voice: str, rate: str, out: pathlib.Path) -> bool:
    import edge_tts

    try:
        await edge_tts.Communicate(text, voice, rate=rate).save(str(out))
        return out.exists() and out.stat().st_size > 800
    except Exception as exc:  # noqa: BLE001
        print(f"  FAIL edge {text!r}: {exc}")
        return False


def google(text: str, out: pathlib.Path) -> bool:
    url = "https://translate.google.com/translate_tts?" + urllib.parse.urlencode(
        {"ie": "UTF-8", "q": text, "tl": "lt", "client": "tw-ob"}
    )
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
        if len(data) < 800:
            return False
        out.write_bytes(data)
        return True
    except Exception as exc:  # noqa: BLE001
        print(f"  FAIL google {text!r}: {exc}")
        return False


def slow_down(src: pathlib.Path, dst: pathlib.Path, factor: float = 0.9) -> bool:
    res = subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(src), "-filter:a", f"atempo={factor}", "-b:a", "64k", str(dst)],
        capture_output=True,
    )
    return res.returncode == 0 and dst.exists()


async def main_async(args) -> int:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    try:
        flags = json.loads(FLAGS.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        flags = {}

    targets = [t for t, st in flags.items() if st == "bloga" and t in manifest]
    if args.text:
        targets = [t for t in targets if t in set(args.text)]
    if not targets:
        print("Nėra pažymėtų įrašų.")
        return 0

    print(f"Keičiami įrašai: {len(targets)}")
    results: list[dict] = []

    with tempfile.TemporaryDirectory(prefix="suprask-fix-") as td:
        tmp = pathlib.Path(td)
        for i, text in enumerate(sorted(targets), 1):
            chosen: tuple[str, dict[str, pathlib.Path]] | None = None
            sources = SOURCES if not args.engine else [s for s in SOURCES if s[0] == args.engine]

            for name, voice in sources:
                files: dict[str, pathlib.Path] = {}
                for variant, rate in RATES.items():
                    stage = tmp / f"{i}-{name}-{variant}.mp3"
                    if await edge(text, voice, rate, stage):
                        files[variant] = stage
                    else:
                        files = {}
                        break
                if len(files) == 2:
                    chosen = (f"edge:{name}", files)
                    break

            if chosen is None and args.engine != "google":
                g = tmp / f"{i}-google.mp3"
                if google(text, g):
                    slow = tmp / f"{i}-google-s.mp3"
                    files = {"n": g, "s": slow if slow_down(g, slow) else g}
                    chosen = ("google", files)

            if chosen is None:
                results.append({"text": text, "status": "nepavyko"})
                print(f"  {i}/{len(targets)} „{text}\" → nepavyko")
                continue

            name, files = chosen
            if not args.dry_run:
                for variant, src in files.items():
                    rel = f"{variant}/{sha(text)}.mp3"
                    dest = AUDIO / rel
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    dest.write_bytes(src.read_bytes())
                    manifest[text][variant] = rel
                flags.pop(text, None)

            results.append({"text": text, "status": "pakeista", "source": name})
            print(f"  {i}/{len(targets)} „{text}\" → {name}")

    if not args.dry_run:
        MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=1, sort_keys=True), encoding="utf-8")
        FLAGS.write_text(json.dumps(flags, ensure_ascii=False, indent=1, sort_keys=True), encoding="utf-8")
        version = hashlib.sha256(json.dumps(manifest, sort_keys=True).encode("utf-8")).hexdigest()[:10]
        (AUDIO / "version.json").write_text(json.dumps({"v": version}), encoding="utf-8")

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding="utf-8")
    failed = [r for r in results if r["status"] != "pakeista"]
    print(f"\nAtaskaita: {REPORT}")
    if failed:
        print(f"DĖMESIO: {len(failed)} žodžių nepavyko pakeisti — reikia žmogaus balso.")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--engine", choices=["ona", "leonas", "google"], help="naudoti tik šį šaltinį")
    ap.add_argument("--text", action="append", default=[], help="taisyti tik šį tekstą (galima kartoti)")
    args = ap.parse_args()
    return asyncio.run(main_async(args))


if __name__ == "__main__":
    raise SystemExit(main())
