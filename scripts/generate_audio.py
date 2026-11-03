#!/usr/bin/env python3
"""
Generuoja lietuvišką garsą SUPRASK platformai (neural TTS, ne naršyklės balsas).

Kiekvienas tekstas → `assets/audio/lt/<variantas>/<sha256-prefix>.mp3`.
Failai idempotentiški: jei failas jau yra, jis negeneruojamas dar kartą.

Naudojimas:
    .venv/bin/python scripts/generate_audio.py                # viskas, balsas Ona
    .venv/bin/python scripts/generate_audio.py --voice leonas
    .venv/bin/python scripts/generate_audio.py --only-missing  # numatyta
    .venv/bin/python scripts/generate_audio.py --prune         # pašalinti našlaičius

Reikalavimai: `edge-tts` (nemokamas, be rakto). Žr. docs/ARCHITEKTURA.md.
"""

from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "lt"
AUDIO = ROOT / "assets" / "audio" / "lt"
MANIFEST = AUDIO / "manifest.json"

VOICES = {"ona": "lt-LT-OnaNeural", "leonas": "lt-LT-LeonasNeural"}
RATES = {"n": "-6%", "s": "-16%"}  # n = normalus, s = lėtas (skiemenims, raidėms)

# Simuliacijų ir sąsajos tekstai, kurių nėra modulių JSON (jie gyvena JS kode)
EXTRA = [
    # skaičiai
    *[str(i) for i in range(0, 101)],
    # metų laikai
    "Pavasaris", "Vasara", "Ruduo", "Žiema",
    "Sniegas tirpsta, paukščiai grįžta, medžiai žydi.",
    "Šilta, daug lapų, obuoliai noksta, bitės dūzgia.",
    "Lapai gelsta ir krinta. Paukščiai ruošiasi skrydžiui.",
    "Šalta, sniegas, medžiai be lapų, vanduo užšąla.",
    # figūros
    "Trikampis", "Keturkampis", "Apskritimas", "Kvadratas",
    # augalas
    "Sėkla dar nemirkusi", "Daigas", "Jaunas augalas", "Augalas su lapais", "Žydi!",
    # gyvūnai
    "Karvė", "Lapė", "Kiškis", "Varnas", "Antis", "Pelėda", "Ešerys", "Karosas", "Pūslėtoji žuvis",
    "Žinduoliai", "Paukščiai", "Žuvys",
    # žaidimų teorija
    "Akmenėlis", "Žirklės", "Popierius",
    "Laimėjai", "Pralaimėjai", "Lygiosios",
    "Sąžininga!", "Tiltas pastatytas — perėjo abu!",
    # grįžtamasis ryšys ir sąsaja
    "Teisingai!", "Puiku!", "Pabandyk dar kartą.", "Paklausyk dar kartą.",
    "Pabandyk pats", "Pasitikrink", "Ką suprasi", "Pagalvok ir pasakyk",
    "Garsas įjungtas", "Garsas išjungtas", "Skaityk kartu", "Kitas žodis",
    "Spausk paveikslėlį ir paklausyk žodžio.",
    "Kiek trūksta iki 10?", "Pilnas dešimtukas!",
    "Kuris elementas eina toliau?",
    "Kiek savo blokų duosi draugui?",
    "Spausk dalis: pirmas spausdinimas — tau, antras — draugui.",
]


def sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]


def walk_strings(obj, keys: set[str]):
    """Renka tekstus iš modulio JSON pagal raktų pavadinimus."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in keys and isinstance(v, str):
                yield v
            elif k in keys and isinstance(v, list):
                for item in v:
                    if isinstance(item, str):
                        yield item
            elif k == "items" and isinstance(v, list):
                for item in v:
                    if isinstance(item, dict):
                        for kk in ("word", "letter", "label"):
                            if isinstance(item.get(kk), str):
                                yield item[kk]
            else:
                yield from walk_strings(v, keys)
    elif isinstance(obj, list):
        for v in obj:
            yield from walk_strings(v, keys)


def collect() -> list[str]:
    texts: set[str] = set(EXTRA)
    keys = {"word", "syllables", "words", "sentences", "label"}
    for path in sorted(CONTENT.glob("grade-*/**/*.json")):
        if path.name == "index.json":
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        config = (data.get("sim") or {}).get("config") or {}
        for t in walk_strings(config, keys):
            if t and len(t) <= 120:
                texts.add(t.strip())
        # „sentences“ yra sąrašas sąrašų — visas sakinys sujungiamas atskirai
        for sent in config.get("sentences") or []:
            if isinstance(sent, list) and all(isinstance(w, str) for w in sent):
                texts.add(" ".join(sent).strip())
    return sorted(t for t in texts if t.strip())


async def synth(voice: str, text: str, rate: str, out: pathlib.Path) -> bool:
    import edge_tts

    for attempt in range(3):
        try:
            comm = edge_tts.Communicate(text, voice, rate=rate)
            await comm.save(str(out))
            if out.exists() and out.stat().st_size > 800:
                return True
        except Exception as exc:  # noqa: BLE001
            if attempt == 2:
                print(f"  FAIL {text!r}: {exc}")
        await asyncio.sleep(1.2 * (attempt + 1))
    return False


async def run(voice_key: str, only_missing: bool, prune: bool, workers: int = 4) -> int:
    voice = VOICES[voice_key]
    texts = collect()
    AUDIO.mkdir(parents=True, exist_ok=True)
    for variant in RATES:
        (AUDIO / variant).mkdir(exist_ok=True)

    manifest: dict[str, dict[str, str]] = {}
    if MANIFEST.exists():
        try:
            manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            manifest = {}

    jobs = []
    for text in texts:
        entry = manifest.setdefault(text, {})
        for variant, rate in RATES.items():
            rel = f"{variant}/{sha(text)}.mp3"
            dest = AUDIO / rel
            entry[variant] = rel
            if only_missing and dest.exists() and dest.stat().st_size > 800:
                continue
            jobs.append((text, rate, dest))

    print(f"Balsas: {voice} · tekstų: {len(texts)} · generuoti: {len(jobs)}")
    sem = asyncio.Semaphore(workers)
    done = 0
    failed = 0

    async def one(text: str, rate: str, dest: pathlib.Path):
        nonlocal done, failed
        async with sem:
            ok = await synth(voice, text, rate, dest)
            if ok:
                done += 1
                if done % 25 == 0:
                    print(f"  … {done}/{len(jobs)}")
            else:
                failed += 1

    await asyncio.gather(*(one(t, r, d) for t, r, d in jobs))

    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=1, sort_keys=True), encoding="utf-8")

    if prune:
        keep = {str(AUDIO / p) for e in manifest.values() for p in e.values()}
        removed = 0
        for f in AUDIO.glob("*/*.mp3"):
            if str(f) not in keep:
                f.unlink()
                removed += 1
        print(f"Pašalinta našlaičių: {removed}")

    total = sum(f.stat().st_size for f in AUDIO.glob("*/*.mp3"))
    print(f"Baigta: sugeneruota {done}, nepavyko {failed}. Bendra apimtis: {total / 1024 / 1024:.1f} MB")
    return 1 if failed else 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", choices=sorted(VOICES), default="ona")
    ap.add_argument("--all", action="store_true", help="pergeneruoti ir esamus")
    ap.add_argument("--prune", action="store_true")
    ap.add_argument("--workers", type=int, default=4)
    args = ap.parse_args()
    try:
        return asyncio.run(run(args.voice, not args.all, args.prune, args.workers))
    except KeyboardInterrupt:
        return 130


if __name__ == "__main__":
    sys.exit(main())
