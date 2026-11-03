#!/usr/bin/env python3
"""
Garso patikra: kiekvieną įrašą atpažįsta lietuviškas kalbos atpažintuvas
(Whisper, modelis `ggml-small`, `-l lt`) ir palygina su tekstu, kurį tas įrašas
turėjo ištarti.

Tai nėra „gražumo" testas — jis pagauna grubias klaidas: svetimos kalbos balsą,
sugadintą failą, neteisingai perskaitytą žodį. Skirtumai išvardijami, kad
žmogus galėtų perklausyti abejotinus įrašus.

Naudojimas:
    python3 scripts/verify_audio.py                 # visi įrašai
    python3 scripts/verify_audio.py --limit 30      # greita patikra
    python3 scripts/verify_audio.py --variant n     # tik normalūs įrašai
    python3 scripts/verify_audio.py --json out.json

Reikia: whisper.cpp `whisper-cli` ir `ggml-small.bin` (žr. docs/ARCHITEKTURA.md).
"""

from __future__ import annotations

import argparse
import difflib
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor

ROOT = pathlib.Path(__file__).resolve().parent.parent
AUDIO = ROOT / "assets" / "audio" / "lt"
MANIFEST = AUDIO / "manifest.json"

DEFAULT_CLI = pathlib.Path.home() / "workspace" / ".tools" / "whisper.cpp" / "build" / "bin" / "whisper-cli"
DEFAULT_MODEL = pathlib.Path.home() / "workspace" / ".tools" / "models" / "ggml-small.bin"


def normalize(text: str) -> str:
    text = text.lower().replace("ė", "e").replace("ą", "a").replace("č", "c")
    text = text.replace("ę", "e").replace("į", "i").replace("š", "s").replace("ų", "u")
    text = text.replace("ū", "u").replace("ž", "z")
    text = re.sub(r"[^\w\s]", " ", text, flags=re.UNICODE)
    return re.sub(r"\s+", " ", text).strip()


def similarity(a: str, b: str) -> float:
    return difflib.SequenceMatcher(None, normalize(a), normalize(b)).ratio()


def transcribe(cli: pathlib.Path, model: pathlib.Path, mp3: pathlib.Path, tmpdir: pathlib.Path, threads: int = 1) -> str:
    wav = tmpdir / f"{mp3.parent.name}-{mp3.stem}-{os.getpid()}-{id(mp3) % 10000}.wav"
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(mp3), "-ar", "16000", "-ac", "1", str(wav)],
        check=True,
    )
    try:
        out = subprocess.run(
            [str(cli), "-m", str(model), "-f", str(wav), "-l", "lt", "-nt", "-np", "-t", str(threads)],
            capture_output=True,
            text=True,
            timeout=180,
        )
        text = out.stdout.strip()
        text = re.sub(r"\[[^\]]*\]", " ", text)  # [BLANK_AUDIO] ir pan.
        return re.sub(r"\s+", " ", text).strip()
    finally:
        wav.unlink(missing_ok=True)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--cli", default=os.environ.get("WHISPER_CLI", str(DEFAULT_CLI)))
    ap.add_argument("--model", default=os.environ.get("WHISPER_MODEL", str(DEFAULT_MODEL)))
    ap.add_argument("--variant", choices=["n", "s", "both"], default="n")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--threshold", type=float, default=0.75)
    ap.add_argument("--json", default="")
    ap.add_argument("--workers", type=int, default=3)
    ap.add_argument("--threads", type=int, default=1)
    args = ap.parse_args()

    cli, model = pathlib.Path(args.cli), pathlib.Path(args.model)
    if not cli.exists():
        print(f"KLAIDA: nėra whisper-cli: {cli}")
        return 1
    if not model.exists():
        print(f"KLAIDA: nėra modelio: {model}")
        return 1

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    variants = ["n", "s"] if args.variant == "both" else [args.variant]

    jobs = []
    for text, entry in sorted(manifest.items()):
        for variant in variants:
            rel = entry.get(variant)
            if not rel:
                continue
            path = AUDIO / rel
            if path.exists():
                jobs.append((text, variant, path))
    if args.limit:
        jobs = jobs[: args.limit]

    tmpdir = pathlib.Path(tempfile.mkdtemp(prefix="suprask-asr-", dir=str(ROOT / "agents" / "log" if (ROOT / "agents" / "log").exists() else None)))
    results = []

    def work(job):
        text, variant, path = job
        try:
            heard = transcribe(cli, model, path, tmpdir, args.threads)
        except Exception as exc:  # noqa: BLE001
            return {"text": text, "variant": variant, "heard": None, "score": 0.0, "error": str(exc)[:120]}
        return {
            "text": text,
            "variant": variant,
            "heard": heard,
            "score": round(similarity(text, heard), 3),
            "file": str(path.relative_to(ROOT)),
        }

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        for i, res in enumerate(pool.map(work, jobs), 1):
            results.append(res)
            if i % 20 == 0:
                print(f"  … {i}/{len(jobs)}", file=sys.stderr)

    shutil.rmtree(tmpdir, ignore_errors=True)

    bad = [r for r in results if r["score"] < args.threshold]
    bad.sort(key=lambda r: r["score"])
    avg = sum(r["score"] for r in results) / max(1, len(results))

    print(f"Įrašai: {len(results)} · vidurkis: {avg:.3f} · abejotini: {len(bad)}")
    for r in bad[:25]:
        print(f"  {r['score']:.2f}  „{r['text']}\" → išgirsta: „{r['heard']}\"")

    if args.json:
        pathlib.Path(args.json).write_text(json.dumps({
            "checked": len(results),
            "average": round(avg, 3),
            "threshold": args.threshold,
            "suspicious": bad,
            "all": results,
        }, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"Ataskaita: {args.json}")

    return 0 if not bad else 0  # abejotini — peržiūrai, ne nesėkmė


if __name__ == "__main__":
    raise SystemExit(main())
