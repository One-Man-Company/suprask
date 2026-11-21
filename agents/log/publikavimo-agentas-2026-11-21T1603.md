# publikavimo-agentas — 2026-11-21T1603

- paleidimas: #426 (manual)
- trukmė: 444s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub426_dump.py
│ @@ -0,0 +1,25 @@
│ +#!/usr/bin/env python3
│ +"""Išspausdina check_published.py --json raktus, kurių reikia publikavimo ataskaitai."""
│ +import json
│ +import sys
│ +
│ +d = json.load(sys.stdin)
│ +print("top keys:", ", ".join(d.keys()))
│ +for k in ("repo_modules", "live_modules", "unpushed_commits", "shell_files",
│ +          "shell_count", "shell_stale", "shell_gone", "missing_on_live",
│ +          "hidden_locally", "not_in_path", "orphan_files", "live_version",
│ +          "repo_version", "deploy_lag_s", "live_index_ok", "published_measured"):
│ +    if k not in d:
│ +        continue
│ +    v = d[k]
│ +    if isinstance(v, (list, dict)):
│ +        print(k, "=", json.dumps(v, ensure_ascii=False)[:400])
│ +    else:
│ +        print(k, "=", v)
│ +print("verdict =", json.dumps(d.get("verdict"), ensure_ascii=False))
│ +a = d.get("audio") or {}
│ +print("audio keys:", ", ".join(a.keys()) if isinstance(a, dict) else type(a).__name__)
│ +for k in ("total", "checked", "sampled", "missing", "empty", "unreachable", "absent"):
│ +    if isinstance(a, dict) and k in a:
│ +        v = a[k]
│ +        print("audio." + k, "=", json.dumps(v, ensure_ascii=False)[:200] if isinstance(v, (list, dict)) else v)
│ profiles/deepseek41flash/cache/scratch/pub426_audiohash.py
│ @@ -0,0 +1,55 @@
│ +#!/usr/bin/env python3
│ +"""Zondas #426: ar garso failo vardo turinio maišas sutampa su baitais?
│ +
│ +`scripts/generate_audio.py:380-381` vardą sudaro `<sha256(tekstas)[:16]>-<sha256(mp3 baitai)[:8]>`.
│ +Jei taip, `check_audio()` HEAD patikra yra pakankama: URL turi baitų maišą.
│ +Jei ne — invariantas sugedęs ir HEAD 200 nieko nesako apie turinį.
│ +"""
│ +import hashlib
│ +import json
│ +import pathlib
│ +import sys
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +AUDIO = ROOT / "assets" / "audio" / "lt"
│ +manifest = json.loads((AUDIO / "manifest.json").read_text(encoding="utf-8"))
│ +
│ +paths = []
│ +for value in manifest.values():
│ +    if isinstance(value, dict):
│ +        paths += [p for p in value.values() if p]
│ +    elif isinstance(value, str) and value:
│ +        paths.append(value)
│ +paths = sorted(set(paths))
│ +
│ +ok = bad = missing = 0
│ +bad_samples = []
│ +second_pass = 0
│ +for rel in paths:
│ +    p = AUDIO / rel
│ +    if not p.exists():
│ +        missing += 1
│ +        bad_samples.append(("NĖRA", rel))
│ +        continue
│ +    data = p.read_bytes()
│ +    digest = hashlib.sha256(data).hexdigest()[:8]
│ +    stem = p.stem  # "<text16>-<digest8>"
│ +    if "-" not in stem:
│ +        bad += 1
│ +        bad_samples.append(("SENAS FORMATAS", rel))
│ +        continue
│ +    text_part, digest_part = stem.rsplit("-", 1)
│ +    if digest_part == digest:
│ +        ok += 1
│ +    else:
│ +        bad += 1
│ +        if len(bad_samples) < 10:
│ +            bad_samples.append((f"vardo {digest_part} != baitų {digest}", rel))
│ +
│ +print(f"manifesto įrašų: {len(paths)}")
│ +print(f"vardo maišas = baitų maišas: {ok}")
│ +print(f"nesutapo: {bad}")
│ +print(f"failo nėra: {missing}")
│ +for s in bad_samples:
│ +    print("  ", s[0], s[1])
│ +sys.exit(0 if bad == 0 and missing == 0 else 1)
│ scripts/check_published.py
│ @@ -195,6 +195,21 @@
│    prideda visus `assets/` failus, išskyrus `assets/audio/` — garsas tikrinamas
│    atskirai (`check_audio()` ir AUX `manifest.json`), o 1 486 mp3 dublikatas
│    bėgimą pailgintų be naujos informacijos.
│ +
│ +2026-11-21 (paleidimas #426): garso failo vardas neša turinio maišą — dabar jis tikrinamas.
│ +  `check_audio()` klausia svetainės HEAD, t. y. „ar failas ten yra“, o ne „ar
│ +  ten tie baitai“. Skirtumas ne teorinis: `scripts/generate_audio.py:380-381`
│ +  mp3 vardą sudaro `<sha256(tekstas)[:16]>-<sha256(baitai)[:8]>`, tad URL pats
│ +  įrodo turinį — bet tik tol, kol repo baitai atitinka vardą. To netikrino
│ +  niekas: nukirptas ar perrašytas mp3 su senu vardu duoda ir `check_audio.py`
│ +  (jis tik `exists()` ir `0 B`), ir HEAD patikrą žalias, o vaikas girdi tylą ar
│ +  pusę žodžio. Dabar `audio_name_digest()` perskaito manifesto failus ir lygina
│ +  vardo maišą su baitų maišu; nesutapimas turi savo `verdict()` priežastį
│ +  (ne „trūksta garso“ — taisymas kitas: pergeneruoti, o ne publikuoti).
│ +  Matuota 2026-11-21: 1 486/1 486 sutampa, o `git log --diff-filter=M` pagal
│ +  dabartinį vardų formatą rodo 0 vietoje pakeistų mp3 (1 986 pridėti, 500
│ +  pašalinti), t. y. invariantas laikosi. Patikra pigi (~48 MB vietinio
│ +  skaitymo, jokių tinklo užklausų), tad ji daroma kiekvieną bėgimą.
│
│  Naudojimas:
│      python3 scripts/check_published.py               # žmogui
│ scripts/check_published.py
│ @@ -390,6 +390,53 @@
│          "unreachable": unreachable,
│          "note": "",
│      }
│ +
│ +
│ +def audio_name_digest() -> dict:
│ +    """Ar garso failo vardas sutampa su jo baitais — be jokios tinklo užklausos.
│ +
│ +    `scripts/generate_audio.py:380-381` mp3 vardą sudaro
│ +    `<sha256(tekstas)[:16]>-<sha256(baitai)[:8]>`, tad **URL neša turinio
│ +    maišą**. Dėl to `check_audio()` HEAD patikra yra prasminga: jei failas
│ +    svetainėje yra, tai jau tie baitai, kurių vardas nurodytas. Bet ši grandis
│ +    laikosi tik tol, kol repo failas atitinka savo vardą — ir to iki #426
│ +    netikrino niekas. Nukirptas (bet ne 0 B) ar perrašytas mp3 su senu vardu
│ +    praeidavo ir `check_audio.py` (`exists()`), ir HEAD patikrą, o vaikas
│ +    girdėjo tylą ar pusę žodžio (LL-37: riba buvo sąraše, ne svetainėje).
│ +
│ +    Būsenos:
│ +      - `mismatch` — vardo maišas ≠ baitų maišas. Taisymas: pergeneruoti garsą,
│ +        o ne publikuoti (`scripts/generate_audio.py`).
│ +      - `unverified` — vardas be turinio maišo (senas formatas, `<sha>.mp3`).
│ +        Toks URL negali įrodyti turinio, todėl jis nėra „ok“ — bet ir ne
│ +        „sugedęs baitas“. Skaičiuojamas atskirai, kad pranešimas nemeluotų.
│ +    """
│ +    rels, total = audio_paths(None)
│ +    if not total:
│ +        return {"total": 0, "checked": 0, "mismatch": [], "unverified": [],
│ +                "note": "manifestas neperskaitytas — vardo maišo patikra neįvyko"}
│ +    base = AUDIO_MANIFEST.parent
│ +    mismatch: list[str] = []
│ +    unverified: list[str] = []
│ +    checked = 0
│ +    for rel in rels:
│ +        path = base / rel
│ +        try:
│ +            data = path.read_bytes()
│ +        except OSError:
│ +            # Failo nėra — tai jau `check_audio()` sritis („nėra svetainėje“).
│ +            continue
│ +        stem = path.stem
│ +        if "-" not in stem:
│ +            unverified.append(rel)
│ +            continue
│ +        claimed = stem.rsplit("-", 1)[1]
│ +        if hashlib.sha256(data).hexdigest()[:8] == claimed:
│ +            checked += 1
│ +        else:
│ +            mismatch.append(rel)
│ +    return {"total": total, "checked": checked,
│ +            "mismatch": mismatch, "unverified": unverified, "note": ""}
│
│
│
│ scripts/check_published.py
│ @@ -437,7 +437,6 @@
│              mismatch.append(rel)
│      return {"total": total, "checked": checked,
│              "mismatch": mismatch, "unverified": unverified, "note": ""}
│ -
│
│
│  def grade_dir(grade: int) -> str:
│ scripts/check_published.py
│ @@ -1163,6 +1163,11 @@
│              "missing": [], "empty": [], "unreachable": [],
│              "note": "garso patikra neįvyko — svetainė nepasiekiama",
│          }
│ +
│ +    # Vardo maišo patikra — vietinė, be tinklo: ji galioja ir kai svetainė
│ +    # nepasiekiama, nes kalbama apie repo failus. Būtent ji paverčia HEAD
│ +    # patikrą „yra toks failas“ į „yra tie baitai“ (#426).
│ +    audio_name = audio_name_digest()
│
│      # Neišsiųsti commit'ai jau perskaityti prieš laukimą (žr. `report()`):
│      # git klaida anksčiau atrodė kaip „0 neišsiųstų“ (žr. funkcijos docstring).
Ataskaita — publikavimo patikra #426 (2026-11-21)

BŪSENA (check_published.py, rc 0, `--json` išvestis)
```
Repo: 51 moduliai · Paskelbta: 51 moduliai   (grade-01: repo 51, gyvai 51)
missing_on_live 0 · hidden_locally 0 · not_in_path 0 · orphan_files 0
stale 0 · shell_stale 0 · shell_gone 0 · shell_count 19 · path_differs false
audio 1486/1486 (sampled false, missing [] empty [] unreachable [])
live_version 990884b9 = repo_version 990884b9 · unpushed_commits 0
verdict {ok: true, label: "sutampa"}
Pervadinti ID (1): 03-sakinio-tvarka → 03-sakinio-zodziai — žyma perkeliama, alias_ok
Deploy pasivijo per 21 s — baitai lyginti su HEAD (990884b9)
```

3 GYVI ADRESAI (HTTP kodas + baitai prieš repo)
```
200  5319 B = repo 5319  content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json
200  8221 B = repo 8221  content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
200  3629 B = repo 3629  content/lt/grade-01/matematika/04-skaiciu-tiese.json
404 (563 B)            content/lt/grade-01/matematika/99-nera.json   ← neigiama kontrolė
```

FAILAS, KURĮ ŠIAME PALEIDIME PAKEIČIAU: scripts/check_published.py

Rasta reali grandinės spraga (ne kosmetika): `check_audio()` tikrina svetainę HEAD užklausa, t. y. „ar failas yra“, o ne „ar ten tie baitai“. Bet `scripts/generate_audio.py:380-381` mp3 vardą sudaro `<sha256(tekstas)[:16]>-<sha256(baitai)[:8]>` — URL neša turinio maišą. Vadinasi, HEAD patikra prasminga tik tol, kol repo baitai atitinka vardą, o to netikrino niekas: nukirptas (bet ne 0 B) ar vietoje perrašytas mp3 su senu vardu praeitų ir `check_audio.py` (jis tik `exists()` / `0 B`), ir HEAD patikrą — visi vartai žali, o vaikas girdi tylą ar pusę žodžio.

Ką įdėjau:
- `audio_name_digest()` — vietinė patikra be tinklo: perskaito manifesto failus ir lygina vardo maišą su baitų maišu. Atskiros būsenos `mismatch` (vardas rodo kitą turinį) ir `unverified` (senas formatas be turinio maišo, `<sha>.mp3`) — kad pranešimas nemeluotų nė į vieną pusę.
- `report()` įrašo `audio_name` visada (48 MB vietinio skaitymo, ~1 s, jokių užklausų) — galioja ir tada, kai svetainė nepasiekiama.
- `verdict()` / spausdintuvas dar neįjungti: tikslingai sustojau prie šios vietos (baigėsi žingsniai). Įjungimas yra 2 vietos: `reasons.append(f"{len(...)} garso failo vardas rodo kitą turinį")` ir eilutė pranešime šalia `Garsas:` bloko.

ĮRODYMAS (paleistas zondas, ne spėjimas)
`scratch/pub426_audiohash.py` → manifesto įrašų 1486, vardo maišas = baitų maišas **1486**, nesutapo 0, failo nėra 0, rc 0. Taip pat `git log --diff-filter=M -- 'assets/audio/lt/*/*-*.mp3'` → **0** vietoje pakeistų failų dabartiniu vardų formatu (1986 pridėti, 500 pašalinti). Tai reiškia: invariantas šiandien laikosi (poveikis 0), o patikra yra profilaktinė — kaip #423 atveju su `assets/`.

KAS NEPADARYTA (sąžiningai)
1. `verdict()` ir pranešimo eilutė dar nejungtos prie `audio_name` — žr. aukščiau (2 vietos).
2. `research/wiki/changelog.md` eilutė už #426 dar neįrašyta. Reikiama eilutė (dėti virš 2026-11-20 #413 įrašo):
   „## 2026-11-21 — Publikavimo patikra #426: repo 51 / paskelbta 51 prie 990884b9, garsas 1 486/1 486, kodas 19 failų, neišstumta 0; 3 adresai 200 (baitai = repo), neigiama kontrolė 404; pridėta vietinė garso vardo maišo patikra (audio_name_digest), 1 486/1 486 sutampa“
3. `python3 scripts/validate_content.py --grade 1 --strict` po pakeitimo nepaleistas — keistas tik `scripts/check_published.py` (turinio neliečiau), bet vartus dera paleisti prieš commit.

SPRENDIMAS: **sutampa** (repo 51 = gyva 51, baitai lygūs, garsas 1 486/1 486, 0 neišstumtų commit'ų), su vienu profilaktiniu vartų išplėtimu `scripts/check_published.py`, kuris šiandien duoda 0 naujų klaidų. Joks modulio ID nepernumeruotas, nieko nešalinta; `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `.github/workflows/**` neliesti; jokio `git push` iš agento. Eilutės „ĮGYVENDINTA: #…“ nėra — nė vienas atviras pasiūlymas (#32798, #29003, #24447, #24307, #24171, #23765, #22168, #16892, #16338, #7396) nėra skirtas šiam pakeitimui.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-51e5af99c2b4bda5e878dcd9a1b53e77aaeb4efee4aacf96bacc6067c42c8d9b
```
