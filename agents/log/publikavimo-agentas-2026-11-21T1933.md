# publikavimo-agentas — 2026-11-21T1933

- paleidimas: #428 (manual)
- trukmė: 411s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub428/probe_audio_name.py
│ @@ -0,0 +1,28 @@
│ +#!/usr/bin/env python3
│ +"""Zondas: audio_name_digest() rezultatas ir ar jis pasiekia report()/verdict().
│ +
│ +Paleidimas:
│ +    python3 probe_audio_name.py
│ +"""
│ +import sys
│ +import time
│ +
│ +sys.path.insert(0, "/home/zoltanas/workspace/suprask/scripts")
│ +import check_published as cp  # noqa: E402
│ +
│ +
│ +def main() -> int:
│ +    started = time.time()
│ +    digest = cp.audio_name_digest()
│ +    print("audio_name_digest():")
│ +    for key, value in digest.items():
│ +        if isinstance(value, list):
│ +            print(f"  {key}: {len(value)} {value[:3]}")
│ +        else:
│ +            print(f"  {key}: {value}")
│ +    print(f"  secs: {time.time() - started:.2f}")
│ +    return 0
│ +
│ +
│ +if __name__ == "__main__":
│ +    raise SystemExit(main())
│ profiles/deepseek41flash/cache/scratch/pub428/probe_audio_size.py
│ @@ -0,0 +1,88 @@
│ +#!/usr/bin/env python3
│ +"""Zondas: ar gyvo mp3 `Content-Length` lygus repo failo dydžiui.
│ +
│ +Jei lygus visiems 1 486 įrašams, dydžio palyginimas yra sa bus vartų išplėtimas
│ +(„svetainėje kitas failas tuo pačiu vardu") be klaidingų raudonų. Jei ne — jis
│ +būtų melas, ir jo jungti negalima.
│ +
│ +    python3 probe_audio_size.py
│ +"""
│ +import json
│ +import pathlib
│ +import sys
│ +import urllib.error
│ +import urllib.request
│ +from concurrent.futures import ThreadPoolExecutor
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +MANIFEST = ROOT / "assets" / "audio" / "lt" / "manifest.json"
│ +LIVE = "https://one-man-company.github.io/suprask/assets/audio/lt/"
│ +UA = {"User-Agent": "suprask-probe/1.0"}
│ +
│ +
│ +def rels() -> list[str]:
│ +    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
│ +    out: list[str] = []
│ +    for value in data.values():
│ +        if isinstance(value, dict):
│ +            out += [str(p) for p in value.values() if p]
│ +        elif isinstance(value, str) and value:
│ +            out.append(value)
│ +    return sorted(out)
│ +
│ +
│ +def head(rel: str) -> tuple[str, int]:
│ +    for attempt in (0, 1):
│ +        try:
│ +            req = urllib.request.Request(LIVE + rel, headers=UA, method="HEAD")
│ +            with urllib.request.urlopen(req, timeout=20) as resp:
│ +                return "ok", int(resp.headers.get("Content-Length") or 0)
│ +        except urllib.error.HTTPError as exc:
│ +            if exc.code in (404, 410):
│ +                return "missing", -1
│ +            if attempt == 0:
│ +                continue
│ +            return "unreachable", -1
│ +        except Exception:  # noqa: BLE001
│ +            if attempt == 0:
│ +                continue
│ +            return "unreachable", -1
│ +    return "unreachable", -1
│ +
│ +
│ +def main() -> int:
│ +    rs = rels()
│ +    print(f"manifesto įrašų: {len(rs)}")
│ +    with ThreadPoolExecutor(max_workers=10) as pool:
│ +        got = list(pool.map(lambda r: (r, head(r)), rs))
│ +    same = differ = missing = unreachable = absent = 0
│ +    diffs: list[str] = []
│ +    for rel, (state, size) in got:
│ +        path = MANIFEST.parent / rel
│ +        if not path.exists():
│ +            absent += 1
│ +            continue
│ +        if state == "missing":
│ +            missing += 1
│ +            continue
│ +        if state == "unreachable":
│ +            unreachable += 1
│ +            continue
│ +        if size == path.stat().st_size:
│ +            same += 1
│ +        else:
│ +            differ += 1
│ +            if len(diffs) < 8:
│ +                diffs.append(f"{rel}: repo {path.stat().st_size} B, gyvai {size} B")
│ +    print(f"dydis sutampa: {same}")
│ +    print(f"dydis SKIRIASI: {differ}")
│ … omitted 10 diff line(s) across 1 additional file(s)/section(s)
│ scripts/check_published.py
│ @@ -410,21 +410,32 @@
│        - `unverified` — vardas be turinio maišo (senas formatas, `<sha>.mp3`).
│          Toks URL negali įrodyti turinio, todėl jis nėra „ok“ — bet ir ne
│          „sugedęs baitas“. Skaičiuojamas atskirai, kad pranešimas nemeluotų.
│ +      - `absent` — manifesto įrašas, kurio failo repo nėra. Ši aibė atsirado
│ +        #428: iki tol toks įrašas buvo tyliai praleistas (`continue`), todėl
│ +        `checked` + `unverified` + `mismatch` buvo **mažiau** už `total`, o tai
│ +        yra tyli riba (LL-37) — skaičiai atrodė kaip pilnas matavimas, nors
│ +        dalis įrašų nebuvo nei patikrinta, nei įvardyta. Trūkstamą failą
│ +        svetainėje jau matuoja `check_audio()`, tad čia jis tik įvardijamas,
│ +        o ne dubliuojamas kaip antra klaida.
│      """
│      rels, total = audio_paths(None)
│      if not total:
│          return {"total": 0, "checked": 0, "mismatch": [], "unverified": [],
│ -                "note": "manifestas neperskaitytas — vardo maišo patikra neįvyko"}
│ +                "absent": [], "note": "manifestas neperskaitytas — vardo maišo "
│ +                                      "patikra neįvyko"}
│      base = AUDIO_MANIFEST.parent
│      mismatch: list[str] = []
│      unverified: list[str] = []
│ +    absent: list[str] = []
│      checked = 0
│      for rel in rels:
│          path = base / rel
│          try:
│              data = path.read_bytes()
│          except OSError:
│ -            # Failo nėra — tai jau `check_audio()` sritis („nėra svetainėje“).
│ +            # Failo nėra — tai jau `check_audio()` sritis („nėra svetainėje“),
│ +            # bet aibė turi būti įvardyta, kad sumos sutaptų su `total`.
│ +            absent.append(rel)
│              continue
│          stem = path.stem
│          if "-" not in stem:
│ scripts/check_published.py
│ @@ -447,7 +447,8 @@
│          else:
│              mismatch.append(rel)
│      return {"total": total, "checked": checked,
│ -            "mismatch": mismatch, "unverified": unverified, "note": ""}
│ +            "mismatch": mismatch, "unverified": unverified,
│ +            "absent": absent, "note": ""}


… PRALEISTA 7560 SIMBOLIŲ IŠ 25560 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00428/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

│ +Trys scenarijai veidrodyje (tikras `assets/audio/` neliečiamas):
│ +  A. vardas atitinka baitus            → mismatch 0, verdict be garso vardo priežasties
│ +  B. nukirptas mp3 su senu vardu       → mismatch 1, verdict turi priežastį „pergeneruoti"
│ +  C. seno formato vardas (<sha>.mp3)   → unverified 1, verdict be mismatch (bet skaičiuojama)
│ +  D. manifesto įrašas be repo failo    → absent 1, suma = total (ne tyli riba)
│ +
│ +    python3 probe_negative.py
│ +"""
│ +import hashlib
│ +import json
│ +import pathlib
│ +import shutil
│ +import sys
│ +
│ +sys.path.insert(0, "/home/zoltanas/workspace/suprask/scripts")
│ +import check_published as cp  # noqa: E402
│ +
│ +SCRATCH = pathlib.Path("/home/zoltanas/.hermes/profiles/deepseek41flash/cache/"
│ +                       "scratch/pub428/mirror_audio")
│ +
│ +
│ +def make_entry(text: str, payload: bytes, stem_ok: bool = True) -> tuple[str, str]:
│ +    text_hash = hashlib.sha256(text.encode()).hexdigest()[:16]
│ +    data_hash = hashlib.sha256(payload).hexdigest()[:8]
│ +    rel = f"lt/{text_hash}-{data_hash}.mp3"
│ +    return rel, text_hash
│ +
│ +
│ +def build(scenario: str) -> pathlib.Path:
│ +    if SCRATCH.exists():
│ +        shutil.rmtree(SCRATCH)
│ +    (SCRATCH / "lt").mkdir(parents=True)
│ +    manifest: dict[str, dict] = {}
│ +
│ +    ok_payload = b"ID3" + b"\x00" * 400
│ +    text_hash = hashlib.sha256("geras tekstas".encode()).hexdigest()[:16]
│ +    ok_rel = f"{text_hash}-{hashlib.sha256(ok_payload).hexdigest()[:8]}.mp3"
│ +    (SCRATCH / "lt" / ok_rel).write_bytes(ok_payload)
│ +    manifest["geras tekstas"] = {"n": ok_rel}
│ +
│ +    if scenario == "A":
│ +        pass
│ +    elif scenario == "B":
│ +        # vardas teisingas, baitai kiti (nukirpta) — tiksliai tas atvejis,
│ +        # kurio `check_audio.py` (exists) ir HEAD patikra nemato
│ +        cut = ok_payload[:120]
│ +        (SCRATCH / "lt" / ok_rel).write_bytes(cut)
│ +    elif scenario == "C":
│ +        old_text = "senas įrašas"
│ +        old_hash = hashlib.sha256(old_text.encode()).hexdigest()[:16]
│ +        (SCRATCH / "lt" / f"{old_hash}.mp3").write_bytes(b"ID3" + b"\x00" * 100)
│ +        manifest[old_text] = {"n": f"{old_hash}.mp3"}
│ +    elif scenario == "D":
│ +        ghost_text = "dingęs įrašas"
│ +        ghost_hash = hashlib.sha256(ghost_text.encode()).hexdigest()[:16]
│ +        manifest[ghost_text] = {"n": f"{ghost_hash}-deadbeef.mp3"}  # failo nėra
│ +    else:
│ +        raise SystemExit(f"nežinomas scenarijus {scenario}")
│ +
│ +    (SCRATCH / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False),
│ +                                           encoding="utf-8")
│ +    return SCRATCH / "manifest.json"
│ +
│ +
│ +def run(scenario: str) -> int:
│ +    cp.AUDIO_MANIFEST = build(scenario)
│ +    digest = cp.audio_name_digest()
│ +    sums = digest["checked"] + len(digest["mismatch"]) + len(digest["unverified"]) + len(digest["absent"])
│ +    data = {"audio_name": digest, "audio": {"missing": [], "empty": [], "unreachable": []},
│ +            "unpushed_checked": True, "unpushed_commits": 0}
│ +    v = cp.verdict(data)
│ +    print(f"--- {scenario} ---")
│ +    print(f"  total {digest['total']}, checked {digest['checked']}, "
│ +          f"mismatch {len(digest['mismatch'])}, unverified {len(digest['unverified'])}, "
│ +          f"absent {len(digest['absent'])}, suma {sums} {'OK' if sums == digest['total'] else 'NESUTAMPA'}")
│ … omitted 36 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/pub428/probe_negative.py
│ @@ -1,11 +1,17 @@
│  #!/usr/bin/env python3
│  """Neigiama kontrolė: ar įjungta garso vardo maišo patikra tikrai raudonuoja.
│
│ -Trys scenarijai veidrodyje (tikras `assets/audio/` neliečiamas):
│ -  A. vardas atitinka baitus            → mismatch 0, verdict be garso vardo priežasties
│ -  B. nukirptas mp3 su senu vardu       → mismatch 1, verdict turi priežastį „pergeneruoti"
│ -  C. seno formato vardas (<sha>.mp3)   → unverified 1, verdict be mismatch (bet skaičiuojama)
│ -  D. manifesto įrašas be repo failo    → absent 1, suma = total (ne tyli riba)
│ +Keturi scenarijai veidrodyje (tikras `assets/audio/` neliečiamas). Manifesto
│ +reikšmės yra keliai `base` atžvilgiu (`assets/audio/lt/`), veidrodyje —
│ +`mirror_audio/`, todėl failo kelias yra `mirror_audio/lt/<vardas>.mp3`, o
│ +manifeste rašoma `lt/<vardas>.mp3`. Pirmas zondo variantas šito neskyrė ir
│ +visi keturi scenarijai davė `absent 1` — tai buvo zondo klaida, ne įrankio.
│ +Todėl zondas turi ir savikontrolę: sumos lygybė su `total` tikrinama kiekvienam.
│ +
│ +  A. vardas atitinka baitus          → mismatch 0, verdict žalias
│ +  B. nukirptas mp3 su senu vardu     → mismatch 1, verdict raudonas
│ +  C. seno formato vardas (<sha>.mp3) → unverified 1, verdict žalias (bet skaičius pasakytas)
│ +  D. manifesto įrašas be repo failo  → absent 1, verdict raudonas, suma = total
│
│      python3 probe_negative.py
│  """
│ @@ -22,13 +28,6 @@
│                         "scratch/pub428/mirror_audio")
│
│
│ -def make_entry(text: str, payload: bytes, stem_ok: bool = True) -> tuple[str, str]:
│ -    text_hash = hashlib.sha256(text.encode()).hexdigest()[:16]
│ -    data_hash = hashlib.sha256(payload).hexdigest()[:8]
│ -    rel = f"lt/{text_hash}-{data_hash}.mp3"
│ -    return rel, text_hash
│ -
│ -
│  def build(scenario: str) -> pathlib.Path:
│      if SCRATCH.exists():
│          shutil.rmtree(SCRATCH)
│ @@ -36,27 +35,29 @@
│      manifest: dict[str, dict] = {}
│
│      ok_payload = b"ID3" + b"\x00" * 400
│ -    text_hash = hashlib.sha256("geras tekstas".encode()).hexdigest()[:16]
│ -    ok_rel = f"{text_hash}-{hashlib.sha256(ok_payload).hexdigest()[:8]}.mp3"
│ -    (SCRATCH / "lt" / ok_rel).write_bytes(ok_payload)
│ -    manifest["geras tekstas"] = {"n": ok_rel}
│ +    ok_text = "geras tekstas"
│ +    ok_hash = hashlib.sha256(ok_text.encode()).hexdigest()[:16]
│ +    data_hash = hashlib.sha256(ok_payload).hexdigest()[:8]
│ +    ok_rel = f"lt/{ok_hash}-{data_hash}.mp3"
│ +    (SCRATCH / ok_rel).write_bytes(ok_payload)
│ +    manifest[ok_text] = {"n": ok_rel}
│
│      if scenario == "A":
│          pass
│      elif scenario == "B":
│ -        # vardas teisingas, baitai kiti (nukirpta) — tiksliai tas atvejis,
│ -        # kurio `check_audio.py` (exists) ir HEAD patikra nemato
│ -        cut = ok_payload[:120]
│ -        (SCRATCH / "lt" / ok_rel).write_bytes(cut)
│ +        # Vardas teisingas, baitai kiti (nukirpta). Būtent šio atvejo nemato
│ +        # nei `check_audio.py` (`exists()`), nei HEAD patikra.
│ +        (SCRATCH / ok_rel).write_bytes(ok_payload[:120])
│      elif scenario == "C":
│          old_text = "senas įrašas"
│          old_hash = hashlib.sha256(old_text.encode()).hexdigest()[:16]
│ -        (SCRATCH / "lt" / f"{old_hash}.mp3").write_bytes(b"ID3" + b"\x00" * 100)
│ -        manifest[old_text] = {"n": f"{old_hash}.mp3"}
│ +        old_rel = f"lt/{old_hash}.mp3"
│ +        (SCRATCH / old_rel).write_bytes(b"ID3" + b"\x00" * 100)
│ +        manifest[old_text] = {"n": old_rel}
│      elif scenario == "D":
│          ghost_text = "dingęs įrašas"
│          ghost_hash = hashlib.sha256(ghost_text.encode()).hexdigest()[:16]
│ -        manifest[ghost_text] = {"n": f"{ghost_hash}-deadbeef.mp3"}  # failo nėra
│ +        manifest[ghost_text] = {"n": f"lt/{ghost_hash}-deadbeef.mp3"}  # failo nėra
│      else:
│          raise SystemExit(f"nežinomas scenarijus {scenario}")
│
│ @@ -65,48 +66,28 @@
│ … omitted 62 diff line(s) across 1 additional file(s)/section(s)
SPRENDIMAS: **sutampa** ir **ištaisyta** (`scripts/check_published.py`).

PALEIDIMO IŠVESTIS (`python3 scripts/check_published.py`, numatytasis režimas, 57,7 s, rc 0)

  Repozitorija: 51 moduliai
  Paskelbta:    51 moduliai
    · grade-01: repo 51, gyvai 51
  Garsas: patikrinta 1486 iš 1486 (visi) — visi pasiekiami
  Garso vardai: 1486 iš 1486 — vardo maišas = baitų maišas
  Pervadinti ID, priimta ir užregistruota (1):
    - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai (žyma perkeliama — index.json „03-sakinio-zodziai“ turi renamed_from, progress.js migruoja)
  Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, svetainės kodas 19 failų, garso vardai 1486/1486 = baitai, versija 45625cff)

Repo 51 / paskelbta 51 / neišstumta 0 (eilutė „Neišstumta commit'ų“ nespausdinta = 0, o patikra įvyko; jei būtų neįvykusi, būtų atskira eilutė).

3 GYVI ADRESAI + NEIGIAMA KONTROLĖ

  content/lt/grade-01/matematika/04-skaiciu-tiese.json         200  3629 B
  content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json   200  5319 B
  content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json 200  8221 B
  content/lt/grade-01/matematika/99-nera.json                  404   563 B

404 kontrolė rodo, kad 200 aukščiau ką nors reiškia.

KĄ PADARIAU (failas, ne ataskaita)

#426 paliko `audio_name_digest()` parašytą, bet NEJUNGTĄ: `report()` ją kvietė, o rezultatas neįeidavo nei į išvestį, nei į `verdict()`, nei į pranešimą. Tai patikra, kurios niekas neperskaito — ta pati klasė kaip #370.

1. Įjungta grandinė trijose vietose: `report()` įrašo `audio_name` į išvestį; `verdict()` turi dvi priežastis — `mismatch` (vardas rodo kitą turinį → pergeneruoti garsą, ne publikuoti) ir `absent`; pranešime eilutė „Garso vardai: …“ ir sėkmės eilutėje „garso vardai 1486/1486 = baitai“.
2. Rasta ir uždaryta tyli riba toje pačioje funkcijoje: trūkstantį failą ji praleisdavo `continue`, todėl `checked + unverified + mismatch` buvo mažiau už `total` — skaičius atrodė pilnas, nors dalis įrašų nepatikrinta (LL-37, ta pati klasė kaip #303 mėginys ir #404 našlaitis). Dabar trūkstamas failas patenka į `absent` ir įvardijamas.
3. Pataisytas #426 ataskaitos skaičius: ten rašyta „~48 MB, ~1 s“. Matuota 0,15 s — vietinis skaitymas nekainuoja nieko, 48 s kainuoja HEAD užklausos. Įrašyta docstring'e, o ne pakartota (LL-21).

ĮRODYMAS ZONDU (`scratch/pub428/probe_negative.py`, 4 scenarijai, 4/4 PASS, rc 0)

  A sveikas atvejis            → mismatch 0, verdict žalias
  B nukirptas mp3 su senu vardu → mismatch 1, verdict raudonas: „1 garso failo vardas rodo kitą turinį (pergeneruoti, ne publikuoti)“
  C seno formato vardas        → unverified 1, verdict žalias (skaičius pasakytas)
  D manifesto įrašas be failo  → absent 1, verdict raudonas, suma 2/2 = total

Pirmas zondo variantas davė 4/4 FAIL — priežastis buvo zonde (manifesto keliai `base` atžvilgiu), ne įrankyje; pataisęs zondą gavau 4/4 PASS. Tai įrašyta zondo docstring'e, kad kitas nelaikytų jo įrankio defektu.

VARTai PO PAKEITIMO

  py_compile                OK
  validate_content --grade 1 --strict   0 klaidų, 0 įspėjimų, rc 0
  check_registry --grade 1  9 kryptys · index 51 · failai 51 · užduotys 223 (optional 51) · sim 51 · path 51 · našlaičiai 0 · PROBLEMŲ 0, rc 0
  check_audio --no-engine   743 tekstų / 1486 įrašų / 1486 iš 1486 mp3, rc 0
  check_lessons             133 įrašai, visi su 4 laukais, rc 0
  check_published --no-bytes rc 0, „Garso vardai: 1486 iš 1486“, dalinė patikra pasakyta žodžiais

KAS NEPADARYTA (sąžiningai)

`research/wiki/changelog.md` eilutė neįrašyta — baigėsi žingsniai. Reikiama eilutė (dėti virš 2026-11-21 #427 įrašo):

  ## 2026-11-21 — Publikavimo patikra #428: repo 51 / paskelbta 51 prie `45625cff`, garsas 1 486/1 486, kodas 19 failų, neišstumta 0; 3 adresai 200 (baitai = repo), neigiama kontrolė 404; #426 garso vardo maišo patikra įjungta (audio_name į išvestį, verdict, pranešimą), tyli riba uždaryta (absent aibė: suma = total), zondas 4/4

NELIESTA: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `.github/workflows/**`, `AGENTS.md`; joks modulio ID nepernumeruotas, nieko nešalinta, jokio `git push` iš agento. Pakeistas vienas failas: `scripts/check_published.py`.

Eilutės „ĮGYVENDINTA: #…“ nėra — nė vienas atviras pasiūlymas (#32798, #29003, #24447, #24307, #24171, #23765, #22168, #16892, #16338, #7396) nenurodo `check_published.py` garso vardo patikros, tad šis darbas jų neuždaro.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-0c58e9fe4e36618fdf4f6a895ae4418c4c83d8988fc4ca77c5b6e31d05977ccd
```
