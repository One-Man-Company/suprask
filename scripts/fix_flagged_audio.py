#!/usr/bin/env python3
"""
Perklausos metu pažymėtų įrašų taisymas.

`dashboard/garsas.py` leidžia lietuviškai kalbančiam žmogui pažymėti neteisingai
ištartus žodžius (`agents/audio-flags.json`, būsena "bloga"). Šis skriptas
kiekvienam pažymėtam tekstui:

  1. sugeneruoja alternatyvas skirtingais balso šaltiniais
     (edge „Ona", edge „Leonas", Google lt);
  2. kiekvieną alternatyvą perskaito atpažintuvas (Whisper, `-l lt`);
  3. palieka tą, kurią atpažintuvas perskaito tiksliausiai;
  4. jei nė viena nepakankamai gera — įrašo į ataskaitą, kad reikia žmogaus.

Naudojimas:
    python3 scripts/fix_flagged_audio.py --dry-run
    python3 scripts/fix_flagged_audio.py
"""

from __future__ import annotations

import argparse
import asyncio
import difflib
import hashlib
import json
import os
import pathlib
import re
import subprocess
import sys
import tempfile
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
AUDIO = ROOT / "assets" / "audio" / "lt"
MANIFEST = AUDIO / "manifest.json"
FLAGS = ROOT / "agents" / "audio-flags.json"
REPORT = ROOT / "agents" / "log" / "audio-fix.json"

WHISPER_CLI = pathlib.Path.home() / "workspace" / ".tools" / "whisper.cpp" / "build" / "bin" / "whisper-cli"
WHISPER_MODEL = pathlib.Path.home() / "workspace" / ".tools" / "models" / "ggml-small.bin"

EDGE_VOICES = {"ona": "lt-LT-OnaNeural", "leonas": "lt-LT-LeonasNeural"}
RATES = {"n": "-4%", "s": "-12%"}


def sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]


def normalize(text: str) -> str:
    table = str.maketrans("ėąčęįšųūž", "eaceisuuz")
    text = text.lower().translate(table)
    text = re.sub(r"[^\w\s]", " ", text, flags=re.UNICODE)
    return re.sub(r"\s+", " ", text).strip()


def score(text: str, heard: str | None) -> float:
    if not heard:
        return 0.0
    return difflib.SequenceMatcher(None, normalize(text), normalize(heard)).ratio()


def transcribe(mp3: pathlib.Path, tmp: pathlib.Path) -> str | None:
    if not (WHISPER_CLI.exists() and WHISPER_MODEL.exists()):
        return None
    wav = tmp / (mp3.stem + ".wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mp3), "-ar", "16000", "-ac", "1", str(wav)], check=True)
    try:
        out = subprocess.run(
            [str(WHISPER_CLI), "-m", str(WHISPER_MODEL), "-f", str(wav), "-l", "lt", "-nt", "-np", "-t", "2"],
            capture_output=True, text=True, timeout=120,
        )
        text = re.sub(r"\[[^\]]*\]", " ", out.stdout)
        return re.sub(r"\s+", " ", text).strip() or None
    finally:
        wav.unlink(missing_ok=True)


async def edge(text: str, voice: str, rate: str, out: pathlib.Path) -> bool:
    import edge_tts

    try:
        await edge_tts.Communicate(text, voice, rate=rate).save(str(out))
        return out.exists() and out.stat().st_size > 800
    except Exception:  # noqa: BLE001
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
    except Exception:  # noqa: BLE001
        return False


def slow_down(src: pathlib.Path, dst: pathlib.Path, factor: float = 0.9) -> bool:
    res = subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(src), "-filter:a", f"atempo={factor}", "-b:a", "48k", str(dst)],
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

    print(f"Taisomi įrašai: {len(targets)}")
    results = []

    with tempfile.TemporaryDirectory(prefix="suprask-fix-") as td:
        tmp = pathlib.Path(td)
        for i, text in enumerate(sorted(targets), 1):
            candidates: list[tuple[str, pathlib.Path, str]] = []  # (pavadinimas, failas, variantas)

            for vname, voice in EDGE_VOICES.items():
                for variant, rate in RATES.items():
                    stage = tmp / f"{i}-{vname}-{variant}.mp3"
                    if await edge(text, voice, rate, stage):
                        candidates.append((f"edge:{vname}", stage, variant))

            g = tmp / f"{i}-google.mp3"
            if google(text, g):
                candidates.append(("google", g, "n"))
                slow = tmp / f"{i}-google-s.mp3"
                if slow_down(g, slow, 0.88):
                    candidates.append(("google", slow, "s"))

            scored = []
            for name, path, variant in candidates:
                heard = transcribe(path, tmp)
                scored.append((score(text, heard), name, path, variant, heard))
            scored.sort(key=lambda x: x[0], reverse=True)

            best = scored[0] if scored else None
            entry = manifest[text]
            if best and not args.dry_run:
                keep = {}
                for variant in ("n", "s"):
                    pick = next((s for s in scored if s[3] == variant), best)
                    rel = f"{variant}/{sha(text)}.mp3"
                    dest = AUDIO / rel
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    dest.write_bytes(pick[2].read_bytes())
                    keep[variant] = rel
                entry.update(keep)
                flags.pop(text, None)

            results.append({
                "text": text,
                "best": {"source": best[1], "score": round(best[0], 3), "heard": best[4]} if best else None,
                "candidates": [{"source": s[1], "variant": s[3], "score": round(s[0], 3), "heard": s[4]} for s in scored],
            })
            print(f"  {i}/{len(targets)} „{text}\" → {(best[1] + ' ' + format(best[0], '.2f')) if best else '—'}")

    if not args.dry_run:
        MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=1, sort_keys=True), encoding="utf-8")
        FLAGS.write_text(json.dumps(flags, ensure_ascii=False, indent=1, sort_keys=True), encoding="utf-8")

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding="utf-8")
    weak = [r for r in results if not r["best"] or r["best"]["score"] < 0.6]
    print(f"\nAtaskaita: {REPORT}")
    if weak:
        print(f"DĖMESIO: {len(weak)} įrašų nepakankamai geri — reikia žmogaus balso:")
        for r in weak:
            print(f"  - „{r['text']}\"")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--text", action="append", default=[], help="taisyti tik šį tekstą (galima kartoti)")
    args = ap.parse_args()
    return asyncio.run(main_async(args))


if __name__ == "__main__":
    raise SystemExit(main())
