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
import os
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "lt"
AUDIO = ROOT / "assets" / "audio" / "lt"
MANIFEST = AUDIO / "manifest.json"

VOICES = {"ona": "lt-LT-OnaNeural", "leonas": "lt-LT-LeonasNeural"}
# n = normalus (sakiniai), s = lėtas (skiemenys, pavieniai žodžiai).
# −4 % ir −12 % skamba natūraliau nei −6 %/−16 %, o vaikui vis dar aiškiau už įprastą tempą.
RATES = {"n": "-4%", "s": "-12%"}  # n = sakiniai, s = skiemenys / pavieniai žodžiai

# --------------------------------------------------------------------------
# Piper (lt_LT-reginute1) — PAGRINDINIS variklis.
#
# Kodėl ne debesų balsas: lietuvių kalboje kirtis yra leksinis („kártis" ir
# „kartìs" skiriasi), o debesų varikliai kirtį SPĖLIOJA. Piper balsas
# sugeneruotas iš Vilniaus universiteto LIEPA studijinio korpuso ir turi
# 189 262 žodžių formų kirčio žodyną — kirtis imamas iš žodyno, ne spėjamas.
# Tai vienintelis laisvai prieinamas balsas, kuris lietuvių kalbai kirtį
# nustato iš esmės teisingai (žr. docs/ARCHITEKTURA.md, „Garsas").
# Licencija: balsas CC BY 4.0 (atribucija būtina), kodas MIT.
# --------------------------------------------------------------------------
PIPER_DIR = pathlib.Path(os.environ.get("SUPRASK_PIPER_DIR") or (pathlib.Path.home() / "workspace" / ".tools" / "piper-lt"))
PIPER_MODEL = PIPER_DIR / "lt_LT-reginute1-medium.onnx"
# Recepto `length_scale` tempo beveik nekeičia (jis normalizuoja trukmę iki tikslo),
# todėl tempą valdome tiksliai, jau sugeneruotą garsą sulėtindami `atempo` filtru:
# 1.0 = kaip yra, 0.80 = 20 % lėčiau, 0.68 = 32 % lėčiau (aukštis išlieka).
# 6–7 metų vaikui: sakiniai 0.80, atskiri žodžiai ir skiemenys 0.68.
LENGTH_SCALE = 1.05
TEMPO = {"n": 0.80, "s": 0.68}
RATES_PIPER = {k: TEMPO[k] for k in TEMPO}
_PIPER = None

# Simuliacijų ir sąsajos tekstai, kurių nėra modulių JSON (jie gyvena JS kode)
EXTRA = [
    # lietuvių abėcėlės raidės (pavieniai ženklai tariami kaip raidės)
    *list("AĄBCČDEĘĖFGHIĮYJKLMNOPRSTUŲŪVZŽ"),
    *list("aąbcčdeęėfghiįyjklmnoprstuųūvzž"),
    # skaičiai
    *[str(i) for i in range(0, 101)],
    # dinaminiai simuliacijų tekstai (šablonai JS kode)
    *[f"Diena {i}" for i in range(1, 31)],
    *[f"{i} blokus" for i in range(1, 21)],
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
    "Dešimt. Puiku!", "Visos figūros savo vietose. Puiku!",
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
    """Renka tekstus iš modulio JSON pagal raktų pavadinimus.

    Svarbu: reikšmė po raktu gali būti ne tik eilutė, bet ir sąrašas žodynų
    (pvz. `words: [{word, syllables}]`). Anksčiau tokie įrašai būdavo
    praleidžiami — dėl to dalis skiemenų ir žodžių neturėjo įrašo.
    """
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in keys:
                yield from _all_strings(v)
            else:
                yield from walk_strings(v, keys)
    elif isinstance(obj, list):
        for v in obj:
            yield from walk_strings(v, keys)


def _all_strings(v):
    """Visos eilutės bet kokiame įdėtame darinyje."""
    if isinstance(v, str):
        yield v
    elif isinstance(v, list):
        for x in v:
            yield from _all_strings(x)
    elif isinstance(v, dict):
        for x in v.values():
            yield from _all_strings(x)


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


def piper_synth(text: str, tempo: float, out: pathlib.Path) -> bool:
    """Sintetizuoja vieną tekstą lokaliniu Piper balsu ir įrašo MP3."""
    global _PIPER
    if _PIPER is None:
        if not PIPER_MODEL.exists():
            print(f"KLAIDA: nėra Piper balso modelio: {PIPER_MODEL}")
            print("Žr. docs/ARCHITEKTURA.md → „Garsas“ (kaip atsisiųsti balsą).")
            return False
        sys.path.insert(0, str(PIPER_DIR))
        from piper import PiperVoice  # type: ignore
        from phonemize_lithuanian import LithuanianPhonemizer  # type: ignore
        from synth_reginute import ReginuteSynth, i_int16  # type: ignore

        _PIPER = (PiperVoice.load(str(PIPER_MODEL)), LithuanianPhonemizer(), ReginuteSynth, i_int16)

    voice, phonemizer, Synth, i16 = _PIPER
    import wave

    wav = out.with_suffix(".wav")
    try:
        audio = Synth(voice, phonemizer, length_scale=LENGTH_SCALE).synthesize(text)
        with wave.open(str(wav), "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(voice.config.sample_rate)
            w.writeframes(i16(audio))
        filters = ["-filter:a", f"atempo={tempo}"] if tempo and abs(tempo - 1.0) > 0.001 else []
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-i", str(wav), *filters, "-codec:a", "libmp3lame",
             "-b:a", "64k", "-ar", "22050", "-ac", "1", str(out)],
            check=True,
        )
        return out.exists() and out.stat().st_size > 800
    except Exception as exc:  # noqa: BLE001
        print(f"  FAIL {text!r}: {exc}")
        return False
    finally:
        wav.unlink(missing_ok=True)


async def run(voice_key: str, only_missing: bool, prune: bool, workers: int = 4, engine: str = "piper") -> int:
    voice = VOICES[voice_key]
    rates = RATES_PIPER if engine == "piper" else RATES
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
        for variant, rate in rates.items():
            rel = f"{variant}/{sha(text)}.mp3"
            dest = AUDIO / rel
            entry[variant] = rel
            if only_missing and dest.exists() and dest.stat().st_size > 800:
                continue
            jobs.append((text, rate, dest))

    if engine == "piper":
        print(f"Balsas: Piper lt_LT-reginute1 (LIEPA) · tekstų: {len(texts)} · generuoti: {len(jobs)}")
        done = failed = 0
        for i, (text, rate, dest) in enumerate(jobs, 1):
            if piper_synth(text, rate, dest):
                done += 1
            else:
                failed += 1
            if i % 25 == 0:
                print(f"  … {i}/{len(jobs)}")
    else:
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

    # Failo vardas turi TURINIO maišą: `n/<teksto-hash>-<turinio-hash>.mp3`.
    # Taip pasikeitus balsui ar tempui atsiranda naujas URL, ir nei naršyklė,
    # nei GitHub Pages CDN negali atiduoti seno įrašo. (Užklausos `?v=`
    # neveikia: medijos elementas su ja lieka `readyState 0`.)
    renamed = 0
    for text, entry in manifest.items():
        for variant in ("n", "s"):
            rel = entry.get(variant)
            if not rel:
                continue
            path = AUDIO / rel
            if not path.exists():
                continue
            digest = hashlib.sha256(path.read_bytes()).hexdigest()[:8]
            target = path.with_name(f"{sha(text)}-{digest}.mp3")
            if path != target:
                path.replace(target)
                renamed += 1
            entry[variant] = f"{variant}/{target.name}"
    if renamed:
        print(f"Pervadinta pagal turinį: {renamed}")

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
    ap.add_argument("--engine", choices=["piper", "edge"], default="piper",
                    help="piper = lokalus lt_LT balsas su kirčio žodynu (numatytas), edge = Azure/Edge debesų balsas")
    ap.add_argument("--voice", choices=sorted(VOICES), default="ona")
    ap.add_argument("--all", action="store_true", help="pergeneruoti ir esamus")
    ap.add_argument("--prune", action="store_true")
    ap.add_argument("--workers", type=int, default=4)
    args = ap.parse_args()
    try:
        return asyncio.run(run(args.voice, not args.all, args.prune, args.workers, args.engine))
    except KeyboardInterrupt:
        return 130


if __name__ == "__main__":
    sys.exit(main())
