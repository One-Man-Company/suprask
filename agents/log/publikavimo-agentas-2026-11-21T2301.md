# publikavimo-agentas — 2026-11-21T2301

- paleidimas: #430 (manual)
- trukmė: 535s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub430/probe_text_digest.py
│ @@ -0,0 +1,63 @@
│ +#!/usr/bin/env python3
│ +"""Zondas: ar garso vardo TEKSTO maišas sutampa su manifesto raktu.
│ +
│ +`scripts/generate_audio.py:380-381` (ir `sha()` :124) mp3 vardą sudaro
│ +`<sha256(tekstas)[:16]>-<sha256(baitai)[:8]>.mp3`, o manifestas yra
│ +`{tekstas: {n|s: kelias}}`. Taigi vardas neša DU teiginius:
│ +  1. kairioji dalis — „šis failas ištaria BŪTENT šį tekstą“,
│ +  2. dešinioji dalis — „šio failo baitai yra tokie“ (tai tikrina #426/#428).
│ +check_published.audio_name_digest() tikrina TIK antrąją. Jei teksto raktas
│ +pakeistas (pvz. taisant kirčiavimą ar skiemenis), o garsas nepergeneruotas,
│ +vaikas girdi seną žodį — o visi vartai žali.
│ +
│ +Šis zondas matuoja, kiek tokių įrašų yra DABAR, ir parodo, ar trūkstama
│ +patikra kažką pagautų.
│ +"""
│ +import hashlib
│ +import json
│ +import pathlib
│ +import sys
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +MANIFEST = ROOT / "assets" / "audio" / "lt" / "manifest.json"
│ +
│ +
│ +def main() -> int:
│ +    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
│ +    total = 0
│ +    ok_prefix = 0
│ +    bad_prefix = []
│ +    no_prefix = []   # senas formatas: <sha>.mp3 be antros dalies
│ +    for text, entry in data.items():
│ +        if not isinstance(entry, dict):
│ +            continue
│ +        want = hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]
│ +        for variant in ("n", "s"):
│ +            rel = entry.get(variant)
│ +            if not rel:
│ +                continue
│ +            total += 1
│ +            stem = pathlib.Path(rel).stem
│ +            if "-" not in stem:
│ +                no_prefix.append((text, rel))
│ +                continue
│ +            got = stem.split("-")[0]
│ +            if got == want:
│ +                ok_prefix += 1
│ +            else:
│ +                bad_prefix.append((text, rel, want, got))
│ +    print(f"įrašų: {total}")
│ +    print(f"teksto maišas sutampa: {ok_prefix}")
│ +    print(f"teksto maišas NEATITINKA: {len(bad_prefix)}")
│ +    for text, rel, want, got in bad_prefix[:10]:
│ +        print(f"  - {rel}  tekstas „{text}“  laukta {want}, varde {got}")
│ +    print(f"be teksto maišo (senas vardas): {len(no_prefix)}")
│ +    for text, rel in no_prefix[:5]:
│ +        print(f"  - {rel}  tekstas „{text}“")
│ +    print(f"suma: {ok_prefix} + {len(bad_prefix)} + {len(no_prefix)} = "
│ +          f"{ok_prefix + len(bad_prefix) + len(no_prefix)} iš {total}")
│ +    return 0
│ +
│ +
│ +if __name__ == "__main__":
│ +    sys.exit(main())
│ profiles/deepseek41flash/cache/scratch/pub430/probe_dupes.py
│ @@ -0,0 +1,18 @@
│ +#!/usr/bin/env python3
│ +"""Ar manifeste yra vienas kelias po dviem tekstais (ir kiek tokių)."""
│ +import json
│ +import pathlib
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +data = json.loads((ROOT / "assets/audio/lt/manifest.json").read_text(encoding="utf-8"))
│ +rel_to_texts: dict[str, list[str]] = {}
│ +for text, entry in data.items():
│ +    vals = [entry.get(v) for v in ("n", "s")] if isinstance(entry, dict) else [entry]
│ +    for rel in vals:
│ +        if rel:
│ +            rel_to_texts.setdefault(rel, []).append(text)
│ +dupes = {r: t for r, t in rel_to_texts.items() if len(set(t)) > 1}
│ +print("manifesto raktų:", len(data), "unikalių kelių:", len(rel_to_texts))
│ +print("kelių su skirtingais tekstais:", len(dupes))
│ +for r, t in list(dupes.items())[:5]:
│ +    print("  ", r, t)
SUSTABDYTA — darbas baigtas, bet failo šiame paleidime neįrašiau. Sakau tai pirmoje eilutėje, nes pagal taisyklę paleidimas, kuriame pakeista tik ataskaita, laikomas tuščiu.

KĄ IŠMATAVAU (realūs paleidimai, ne atmintis)

  python3 scripts/check_published.py → rc 0
    Repozitorija: 51 moduliai
    Paskelbta:    51 moduliai
      · grade-01: repo 51, gyvai 51
    Deploy pasivijo per 21 s — baitai lyginti su HEAD (5c732e5e).
    Pervadinti ID, priimta ir užregistruota (1):
      - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai (žyma perkeliama)
    Garsas: patikrinta 1486 iš 1486 (visi) — visi pasiekiami
    Garso vardai: 1486 iš 1486 — vardo maišas = baitų maišas
    ✔ Repo ir gyva svetainė sutampa (… svetainės kodas 19 failų …, versija 5c732e5e)

  Neišstumta: 0.  git rev-list --left-right --count origin/main...HEAD → 0 0.
  git rev-parse HEAD → 5c732e5e; gyvas index.html → ?v=5c732e5e (svetainė pastatyta iš šio commit'o).

3 GYVI ADRESAI (HTTP kodas + baitai)

  content/lt/grade-01/matematika/04-skaiciu-tiese.json              200  3 629 B
  content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json         200  5 319 B
  content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json       200  8 221 B
  neigiama kontrolė: …/matematika/99-nera.json                        404    563 B

PAPILDOMI ZONDAI (abu mano, rašyti į scratch, ne į repo)

  1. Vardo PRIEKIO maišas. check_published.audio_name_digest() tikrina tik
     dešinę vardo dalį (baitų maišą). Vardo kairė dalis yra
     sha256(manifesto raktas)[:16] — ji teigia „šis failas ištaria BŪTENT šį
     tekstą“. Jei teksto raktas pakeistas, o garsas nepergeneruotas, vaikas
     girdi seną žodį, o vartai žali. Išmatuota: 1 486/1 486 priekio maišas
     sutampa, 0 neatitikimų, 0 seno formato. Šiandien spragos nėra, bet
     patikros nėra ir ji neegzistuoja — tai tos pačios šeimos spraga kaip
     #426 (trys teiginiai varde, tikrinami du). Tai FIKSUOTAS pastebėjimas,
     ne pataisytas defektas.
  2. Manifesto kelių unikalumas: 743 raktai → 1 486 unikalūs keliai,
     0 kelių po dviem skirtingais tekstais.

SPRENDIMAS: sutampa (repo 51 / paskelbta 51 / neišstumta 0, garsas
1 486/1 486, kodas 19 failų, versija = HEAD, 3 adresai 200, kontrolė 404).
Neliesta: content/**, assets/**, docs/**, AGENTS.md, .github/workflows/**;
joks modulio ID nepernumeruotas, nieko nešalinta, jokio git push.

KAS NEPADARYTA (LL-36 — sakau, o ne nutyliu)

  Šiame paleidime neįrašiau nė vieno failo. Liko neišsaugota:
  a) research/wiki/changelog.md eilutė apie šią patikrą;
  b) pasiūlymas dėl vardo PRIEKIO maišo patikros
     (target: scripts/check_published.py, evidence:
     scripts/generate_audio.py:124 ir :380-381 — sha() ima tekstą, o
     audio_name_digest() lygina tik stem.rsplit("-", 1)[1]);
  c) research/wiki/guidelines/pamokos.md pamoka: vardas, kuris neša DU
     teiginius, o tikrinamas vienas — tai LL-37 atmaina, kur riboja ne
     sąrašo ilgis, o tai, kad vardo dalis net neskaitoma.

  Šių trijų failų rašymas yra kitas žingsnis; dabar jų nėra, todėl šis
  paleidimas neturi ko uždaryti ir jokio pasiūlymo numerio neuždaro.
  Eilutės „ĮGYVENDINTA:“ nėra — nė vienas atviras pasiūlymas (#32798,
  #29003, #24447, #24307, #24171, #23765, #22168, #16892, #16338, #5400)
  nenurodo šio darbo.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-79bfe6acf725eb05035c0ed006dca0e6e6f7f5bd486d4399f2394f55ca418450
```
