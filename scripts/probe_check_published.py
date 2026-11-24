#!/usr/bin/env python3
"""Zondas `check_published.py` garso vardo patikrai — pakartojamas, be tinklo.

Kodėl šis failas egzistuoja (LL-36, LL-21). Iki #439 neigiamos kontrolės buvo
rašomos į `scratch/pubNNN/` ir **niekada neįtraukiamos į repo** (`git log --all
-- scratch` → 0 commit'ų). Docstring'e liko penkios nuorodos į failus, kurių
repo nėra, tad kiekvienas, kas norėjo patikrinti teiginį „zondas rodė taip“,
turėjo jį priimti tikėjimu. #433 docstring'e buvo eilutė apie
`scratch/pub433/probe.py`, kuri ne tik nebuvo įtraukta — ji nebuvo nė karto
paleista. Teiginys faile be matavimo yra tas pats defektas, kaip skaičius
dokumente, kurio niekas neperskaičiuoja.

Šis zondas tikrina būtent tai, ko negali patikrinti `check_published.py` savo
bėgime: kad **kiekviena** `audio_name_digest()` būsena (`checked`, `mismatch`,
`text_mismatch`, `unverified`, `absent`) realiai įsijungia ir kad jų suma
visada lygi `total` (LL-37 — tyli riba). Nuo #495 tas pats daroma ir garso
failo **tapatybei svetainėje**: `check_audio()` būsenos `size_mismatch` /
`size_checked` tikrinamos prieš vietinį `http.server` (G–I), nes `Content-Length`
be tinklo neegzistuoja, o būtent jis ir buvo nematomas. Veidrodis statomas
laikiname kataloge iš **tikrų** `assets/audio/lt/` failų; repo failai
nekeičiami, išorinių užklausų nėra, tad zondą galima paleisti bet kada, taip
pat ir po vėlesnių pataisymų (regresijos patikra).

Naudojimas:
    python3 scripts/probe_check_published.py      # 0 — visi lūkesčiai išsipildė
"""

from __future__ import annotations

import functools
import hashlib
import http.server
import json
import pathlib
import shutil
import sys
import tempfile
import threading

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))

import check_published as cp  # noqa: E402

REAL_MANIFEST = ROOT / "assets" / "audio" / "lt" / "manifest.json"
REAL_AUDIO = REAL_MANIFEST.parent

results: list[tuple[str, bool, str]] = []


def check(name: str, ok: bool, detail: str) -> None:
    results.append((name, ok, detail))
    print(f"{'OK  ' if ok else 'KLAIDA'} {name} — {detail}")


def sha16(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]


def real_pairs(limit: int = 2) -> list[tuple[str, str]]:
    """(tekstas, kelias manifeste) poros iš tikro manifesto, failai egzistuoja."""
    data = json.loads(REAL_MANIFEST.read_text(encoding="utf-8"))
    out: list[tuple[str, str]] = []
    for text, value in sorted(data.items()):
        for rel in (value.values() if isinstance(value, dict) else [value]):
            if rel and (REAL_AUDIO / rel).exists():
                out.append((text, rel))
                break
        if len(out) >= limit:
            break
    return out


def build_mirror(base: pathlib.Path, pairs: list[tuple[str, str]]) -> pathlib.Path:
    """Laikinas garso katalogas su tikromis kopijomis ir manifestu."""
    manifest: dict[str, dict[str, str]] = {}
    for text, rel in pairs:
        target_rel = pathlib.Path(rel).name
        (base / target_rel).parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(REAL_AUDIO / rel, base / target_rel)
        manifest[text] = {"n": target_rel}
    path = base / "manifest.json"
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    return path


def sums(report: dict) -> int:
    return (report["checked"] + len(report["mismatch"]) + len(report["text_mismatch"])
            + len(report["unverified"]) + len(report["absent"]))


def verdict_for(report: dict) -> dict:
    """`verdict()` su minimaliu duomenų rinkiniu: tik garso vardo teiginys."""
    return cp.verdict({"audio_name": report, "unpushed_checked": True,
                       "published_measured": True, "bytes_checked": True})


def verdict_for_audio(report: dict) -> dict:
    """`verdict()` su minimaliu duomenų rinkiniu: tik garso failo teiginys."""
    return cp.verdict({"audio": report, "unpushed_checked": True,
                       "published_measured": True, "bytes_checked": True})


class _QuietHandler(http.server.SimpleHTTPRequestHandler):
    """Tas pats serveris be žurnalo eilučių: zondo išvestis turi būti perskaitoma."""

    def log_message(self, format, *args):  # noqa: A002 - bazinės klasės vardas
        pass


def serve(base: pathlib.Path):
    """Vietinis `http.server` — HEAD turi ateiti per tinklą, o ne iš disko.

    `check_audio()` tapatybę matuoja `Content-Length`, tad be serverio ši
    patikra liktų neišbandyta: būtent tai ir buvo defektas (#495).
    """
    handler = functools.partial(_QuietHandler, directory=str(base))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, f"http://127.0.0.1:{httpd.server_address[1]}/"


def main() -> int:
    pairs = real_pairs(2)
    if len(pairs) < 2:
        check("pasiruošimas", False,
              f"tikro manifesto porų su failais rasta {len(pairs)}, reikia 2 — "
              f"zondas neįvyko (tai ne „viskas gerai“)")
        return 1

    # 0. Tikras manifestas: vardo priekis = teksto maišas. Tai ta pati taisyklė,
    #    kurią tikrina įrankis, bet matuojama atskirai nuo jo — kitaip zondas
    #    tikėtų tuo pačiu kodu, kurį tikrina.
    bad_prefix = [rel for text, rel in pairs
                  if pathlib.Path(rel).stem.rsplit("-", 1)[0] != sha16(text)]
    check("tikro manifesto priekis = sha(tekstas)[:16]", not bad_prefix,
          f"{len(pairs) - len(bad_prefix)}/{len(pairs)} porų sutampa"
          + (f", NEATITINKA: {bad_prefix}" if bad_prefix else ""))

    tmp = pathlib.Path(tempfile.mkdtemp(prefix="probe_cp_"))
    original = cp.AUDIO_MANIFEST
    try:
        manifest_path = build_mirror(tmp, pairs)
        cp.AUDIO_MANIFEST = manifest_path

        # A. Kontrolinė būsena — viskas sveika. Be jos neigiami atvejai nieko
        #    neįrodytų: klaida galėtų kilti iš bet ko.
        report = cp.audio_name_digest()
        check("A: sveikas veidrodis → checked = total",
              report["total"] == 2 and report["checked"] == 2 and sums(report) == report["total"],
              f"total {report['total']}, checked {report['checked']}, suma {sums(report)}")
        check("A: verdict žalias, kai nėra neatitikimų", verdict_for(report)["ok"],
              f"verdict {verdict_for(report)['label']}")

        # B. Tekstas pakeistas, garsas nepergeneruotas: baitai savi, priekis
        #    rodo kitą tekstą. Tai būsena, dėl kurios #433 apskritai atsirado.
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
        old_key = pairs[0][0]
        new_key = old_key + " (pataisyta rašyba)"
        data[new_key] = data.pop(old_key)
        manifest_path.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        report = cp.audio_name_digest()
        label = verdict_for(report)
        check("B: pakeistas teksto raktas → text_mismatch = 1",
              len(report["text_mismatch"]) == 1 and report["checked"] == 1
              and sums(report) == report["total"],
              f"text_mismatch {len(report['text_mismatch'])}, checked {report['checked']}, "
              f"suma {sums(report)}/{report['total']}")
        check("B: verdict raudonas ir įvardija TEKSTĄ",
              not label["ok"] and "TEKSTĄ" in label["label"],
              f"verdict {label['label']}")

        # C. Baitai pakeisti po generavimo (nukirptas mp3): priekis rodo tą patį
        #    tekstą, bet galas nebeatitinka failo turinio.
        manifest_path.write_text(
            json.dumps({pairs[0][0]: {"n": pathlib.Path(pairs[0][1]).name},
                        pairs[1][0]: {"n": pathlib.Path(pairs[1][1]).name}},
                       ensure_ascii=False, indent=1), encoding="utf-8")
        victim = tmp / pathlib.Path(pairs[0][1]).name
        victim.write_bytes(victim.read_bytes()[:-100])
        report = cp.audio_name_digest()
        label = verdict_for(report)
        check("C: nukirptas mp3 → mismatch = 1, text_mismatch = 0",
              len(report["mismatch"]) == 1 and not report["text_mismatch"]
              and sums(report) == report["total"],
              f"mismatch {len(report['mismatch'])}, text_mismatch "
              f"{len(report['text_mismatch'])}, suma {sums(report)}/{report['total']}")
        check("C: verdict sako „kitą turinį“, ne „kitą TEKSTĄ“",
              not label["ok"] and "turinį" in label["label"],
              f"verdict {label['label']}")
        shutil.copyfile(REAL_AUDIO / pairs[0][1], victim)

        # D. Manifesto įrašas be failo: būsena turi būti įvardyta, o ne tyliai
        #    praleista — kitaip `checked` atrodo kaip pilnas matavimas (LL-37).
        manifest_path.write_text(
            json.dumps({pairs[0][0]: {"n": "n/nera-tokio-failo.mp3"},
                        pairs[1][0]: {"n": pathlib.Path(pairs[1][1]).name}},
                       ensure_ascii=False, indent=1), encoding="utf-8")
        report = cp.audio_name_digest()
        check("D: trūkstamas failas → absent = 1, suma = total",
              len(report["absent"]) == 1 and report["checked"] == 1
              and sums(report) == report["total"],
              f"absent {len(report['absent'])}, checked {report['checked']}, "
              f"suma {sums(report)}/{report['total']}")

        # E. Sugrįžimas į sveiką būseną: ta pati patikra turi vėl būti žalia.
        #    Be šios dalies zondas įrodytų tik tai, kad klaida moka raudoną.
        manifest_path.write_text(
            json.dumps({pairs[0][0]: {"n": pathlib.Path(pairs[0][1]).name},
                        pairs[1][0]: {"n": pathlib.Path(pairs[1][1]).name}},
                       ensure_ascii=False, indent=1), encoding="utf-8")
        report = cp.audio_name_digest()
        check("E: atkūrus → vėl checked = total ir verdict žalias",
              report["checked"] == 2 and sums(report) == report["total"]
              and verdict_for(report)["ok"],
              f"checked {report['checked']}/{report['total']}, "
              f"verdict {verdict_for(report)['label']}")

        # G–I. Garso failo TAPATYBĖ svetainėje (#495). Vardo maišas įrodo, kad
        #    repo baitai atitinka repo vardą; jis nieko nesako apie tai, ką
        #    siunčia svetainė. Todėl veidrodis patiekiamas per HTTP: HEAD
        #    `Content-Length` yra vienintelis to teiginio šaltinis.
        #    Du katalogai sąmoningai atskiri: `disk` yra „repo“ (su manifestu),
        #    `web` — tai, ką siunčia serveris. Jei abu būtų vienas katalogas,
        #    sutrumpintume ir disko kopiją, ir patikra lygintų failą su pačiu
        #    savimi (pirmas zondo bėgimas taip ir parodė: 0 neatitikimų).
        disk_dir = tmp / "disk" / "assets" / "audio" / "lt"
        disk_manifest = build_mirror(disk_dir, pairs)
        web = tmp / "web" / "assets" / "audio" / "lt"
        build_mirror(web, pairs)
        httpd, url = serve(tmp / "web")
        original_live = cp.LIVE_ROOT
        try:
            cp.AUDIO_MANIFEST = disk_manifest
            cp.LIVE_ROOT = url
            report = cp.check_audio()
            label = verdict_for_audio(report)
            check("G: sveikas HTTP veidrodis → size_checked 2, mismatch 0",
                  report["size_checked"] == 2 and not report["size_mismatch"]
                  and not report["missing"] and not report["empty"],
                  f"size_checked {report['size_checked']}, mismatch "
                  f"{len(report['size_mismatch'])}, missing {len(report['missing'])}")
            check("G: verdict žalias, kai dydžiai sutampa", label["ok"],
                  f"verdict {label['label']}")

            # H. Svetainė siunčia tą patį vardą, bet pusę failo: 404 nėra,
            #    `empty` nėra (dydis > 0). Būtent šis atvejis iki #495 buvo
            #    žalias visuose vartuose.
            victim_rel = pathlib.Path(pairs[0][1]).name
            victim = web / victim_rel
            full_size = (disk_dir / victim_rel).stat().st_size
            victim.write_bytes(victim.read_bytes()[:-100])
            report = cp.check_audio()
            label = verdict_for_audio(report)
            hit = report["size_mismatch"][0] if report["size_mismatch"] else {}
            check("H: sutrumpintas mp3 svetainėje → size_mismatch = 1",
                  len(report["size_mismatch"]) == 1 and report["size_checked"] == 2
                  and hit.get("live_bytes") == full_size - 100
                  and hit.get("disk_bytes") == full_size,
                  f"size_mismatch {len(report['size_mismatch'])}, "
                  f"gyvi {hit.get('live_bytes')} B / disko {hit.get('disk_bytes')} B")
            check("H: verdict raudonas ir įvardija dydį",
                  not label["ok"] and "dydžio" in label["label"],
                  f"verdict {label['label']}")

            # I. Failo atkūrimas — patikra turi vėl būti žalia, o ne likti
            #    raudona kaip „įsiminusi“ klaidą.
            victim.write_bytes((REAL_AUDIO / pairs[0][1]).read_bytes())
            report = cp.check_audio()
            check("I: atkūrus failą → mismatch 0 ir verdict žalias",
                  not report["size_mismatch"] and verdict_for_audio(report)["ok"],
                  f"mismatch {len(report['size_mismatch'])}, "
                  f"verdict {verdict_for_audio(report)['label']}")
        finally:
            httpd.shutdown()
            httpd.server_close()
            cp.LIVE_ROOT = original_live
            cp.AUDIO_MANIFEST = manifest_path
    finally:
        cp.AUDIO_MANIFEST = original
        shutil.rmtree(tmp, ignore_errors=True)

    # F. Po zondo — tikras manifestas ir tikri failai neliesti, o įrankis
    #    ką tik perskaitytas repo keliu tebėra žalias.
    report = cp.audio_name_digest()
    check("F: tikras repo manifestas po zondo nepakitęs ir sveikas",
          cp.AUDIO_MANIFEST == REAL_MANIFEST and report["checked"] == report["total"]
          and sums(report) == report["total"],
          f"{report['checked']}/{report['total']} vardo maišas = baitai ir tekstas")

    passed = sum(1 for _, ok, _ in results if ok)
    print(f"\n{passed}/{len(results)} lūkesčių išsipildė")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
