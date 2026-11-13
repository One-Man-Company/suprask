# publikavimo-agentas — 2026-11-13T1144

- paleidimas: #265 (manual)
- trukmė: 333s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub265_audio.py
│ @@ -0,0 +1,75 @@
│ +#!/usr/bin/env python3
│ +"""Gyvo garso zondas: ar naujų modulių tariami sakiniai tikrai groja iš svetainės.
│ +
│ +Ieško teksto modulio JSON `sim.config` vertėse, susiranda manifeste įrašą,
│ +tada ima `n` ir `s` mp3 iš GitHub Pages ir tikrina kodą, baitus ir ID3 antraštę.
│ +"""
│ +import hashlib
│ +import json
│ +import pathlib
│ +import sys
│ +import urllib.request
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +LIVE = "https://one-man-company.github.io/suprask/assets/audio/lt/"
│ +MODULES = [
│ +    "content/lt/grade-01/pasaulio-pazinimas/20-kas-gyvas.json",
│ +    "content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json",
│ +    "content/lt/grade-01/lietuviu-kalba/05-plakatas-ir-informacija.json",
│ +]
│ +
│ +
│ +def strings(obj):
│ +    if isinstance(obj, str):
│ +        yield obj
│ +    elif isinstance(obj, list):
│ +        for v in obj:
│ +            yield from strings(v)
│ +    elif isinstance(obj, dict):
│ +        for v in obj.values():
│ +            yield from strings(v)
│ +
│ +
│ +def collect(node, out):
│ +    for s in strings(node):
│ +        if len(s.split()) >= 2:
│ +            out.append(s)
│ +
│ +
│ +manifest = json.loads((ROOT / "assets/audio/lt/manifest.json").read_text(encoding="utf-8"))
│ +print("manifesto raktai:", len(manifest))
│ +
│ +picked = []
│ +for rel in MODULES:
│ +    data = json.loads((ROOT / rel).read_text(encoding="utf-8"))
│ +    texts = []
│ +    collect(data.get("sim", {}).get("config", {}), texts)
│ +    for t in texts[:2]:
│ +        picked.append((rel.split("/")[-1], t))
│ +
│ +ok = 0
│ +for rel, text in picked:
│ +    key = hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]
│ +    entry = manifest.get(key)
│ +    if not entry:
│ +        print(f"  ✗ {rel}: manifeste nėra {key[:8]} „{text[:40]}“")
│ +        continue
│ +    for variant in ("n", "s"):
│ +        rel_url = entry.get(variant) if isinstance(entry, dict) else None
│ +        if not rel_url:
│ +            print(f"  · {rel}: {variant} nėra (tekstas trumpas)")
│ +            continue
│ +        url = LIVE + rel_url
│ +        try:
│ +            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "suprask-check/1.2"}), timeout=20) as r:
│ +                blob = r.read()
│ +                code = r.status
│ +        except Exception as exc:  # noqa: BLE001
│ +            print(f"  ✗ {variant} {rel_url} → {type(exc).__name__}")
│ +            continue
│ +        magic = blob[:3] == b"ID3"
│ +        ok += 1 if (code == 200 and magic and len(blob) > 4000) else 0
│ +        print(f"  {code} {variant} {rel_url} {len(blob)} B ID3={magic}  „{text[:44]}“")
│ +
│ +print(f"\nSėkmingi įrašai: {ok}/{len(picked) * 2}")
│ +sys.exit(0 if ok == len(picked) * 2 else 1)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub265_audio.py
│ @@ -39,6 +39,20 @@
│  manifest = json.loads((ROOT / "assets/audio/lt/manifest.json").read_text(encoding="utf-8"))
│  print("manifesto raktai:", len(manifest))
│
│ +# Manifestas raktus laiko pačiu tekstu, o failo vardas prasideda `sha256(tekstas)[:16]`.
│ +# Todėl ieškoma pagal baitą: raktas gali būti normalizuotas, failo vardas — ne.
│ +by_digest = {}
│ +for k, v in manifest.items():
│ +    for variant in ("n", "s"):
│ +        path = (v or {}).get(variant)
│ +        if path:
│ +            by_digest.setdefault(path.split("/")[-1].split("-")[0], {})[variant] = path
│ +
│ +
│ +def entry_for(text):
│ +    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]
│ +    return digest, manifest.get(text) or by_digest.get(digest)
│ +
│  picked = []
│  for rel in MODULES:
│      data = json.loads((ROOT / rel).read_text(encoding="utf-8"))
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pub265_audio.py
│ @@ -63,10 +63,9 @@
│
│  ok = 0
│  for rel, text in picked:
│ -    key = hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]
│ -    entry = manifest.get(key)
│ +    digest, entry = entry_for(text)
│      if not entry:
│ -        print(f"  ✗ {rel}: manifeste nėra {key[:8]} „{text[:40]}“")
│ +        print(f"  ✗ {rel}: manifeste nėra {digest[:8]} „{text[:40]}“")
│          continue
│      for variant in ("n", "s"):
│          rel_url = entry.get(variant) if isinstance(entry, dict) else None
Sustabdau darbą ties riba — iteracijų limitas. Toliau — kas jau išmatuota ir kas liko nepadaryta.

## 1. `check_published.py` išvestis (paleista, ne iš atminties)

```
Repozitorija: 39 moduliai
Paskelbta:    39 moduliai
  · grade-01: repo 39, gyvai 39
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai,
  svetainės kodas 17 failų, versija 8da65911).
rc=0
```

Raktai JSON'e: `missing_on_live` [], `hidden_locally` [], `not_in_path` [], `stale` [],
`stale_unknown` [], `aux_stale` [], `shell_stale` [], `shell_unreachable` [],
`path_differs` [], `unpushed_commits` 0, `live_version` 8da65911 = `repo_version` 8da65911,
`verdict.label` = `sutampa`.

Būsena: `HEAD` = `origin/main` = `8da65911`, darbo medis švarus. Gyvas `index.html` neša
`?v=8da65911`, t. y. svetainė pastatyta iš šito commit'o.

## 2. Trys gyvi adresai (tikra užklausa)

| adresas | kodas | baitai |
|---|---|---|
| `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` | **200** | 5 459 |
| `content/lt/grade-01/pasaulio-pazinimas/20-kas-gyvas.json` | **200** | 6 599 |
| `content/lt/grade-01/lietuviu-kalba/05-plakatas-ir-informacija.json` | **200** | 7 454 |
| `content/lt/grade-01/index.json` (papildomai) | 200 | 11 738 |

## 3. Rastas defektas, kurio įrankis nemato: dingo modulio ID

Nuo praėjusios patikros (#257, 06:23, 37 moduliai) repo turi 39 modulius, bet ne tik
pridėta — **pašalintas** `03-sakinio-tvarka`. Commit `0334138` (#261) `git rm` seną failą ir
įrašė `03-sakinio-zodziai`. Patikra:

- `git log --diff-filter=D` → `content/lt/grade-01/lietuviu-kalba/03-sakinio-tvarka.json` ištrintas būtent `0334138`;
- gyvas senas adresas `…/03-sakinio-tvarka.json` → **404**;
- repo nelikę jokių nuorodų į seną ID, išskyrus `scripts/add_optional_tasks.py:34` (negyvas raktas, kurejas jį sąmoningai paliko).

Tai **ne netyčinis regresas**: pakeitimą pagrindžia `agents/proposals/2026-11-12-programos-derintojas-sakinio-tvarka.json` (senasis modulis mokė žodžių eilės taisyklės, kurios lietuvių kalboje nėra; `sources/pradinio-bp-rekomendacijos-2024.txt:39795–39809`, D.3.3.1–D.3.3.4), o kurejas jį dokumentavo `agents/log/kurejas-2026-11-13T0917.md:505–532`. Todėl turinio negrąžinau: gairės (§8) draudžia „pritaikyti“ prieštaraujantį turinį, o turinys ne mano vaidmens.

Tačiau lieka reali pasekmė: `assets/js/progress.js:31` pažangą saugo **tik pagal modulio ID**, be alias mechanizmo — vaikui, baigusiam `03-sakinio-tvarka`, to modulio žyma dabar našlaitė (klaidos nėra, rodoma „neatlikta“). Ir pats įrankis to nematė: `check_published.py` lygina tik dabartinę gyvą būseną su repo, o abi pusės jau sutampa.

## 4. Kitos patikros (visos žalios)

- **Naršyklė prieš gyvą bazę:** `check_view.py --base https://one-man-company.github.io/suprask/ --viewports phone,small` → **78 patikros** (39 maršrutai × 390/360 px), 0 problemų, rc 0, 1 min 19 s (su Brave skydų blokais).
- **Garsas:** manifestas 567 raktai; imtis iš trijų naujų modulių → **8/8** gyvų įrašų `200`, `ID3`, 21 985–56 885 B (po 4 tekstus × `n`/`s`).
- **Vartai:** `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų, rc 0. `check_audio.py` → 567 tekstai, 1 134 įrašai, visi iš Piper, panaudota 1 134/1 134, rc 0. `check_docs_facts.py` → 0 klaidų, 0 įspėjimų (39 moduliai, 9 kryptys), rc 0.

## 5. Sprendimas

**SUTAMPA** pagal publikavimo būseną: repo 39 / paskelbta 39, baitai, seka, svetainės kodas (17 failų) ir versija sutampa, 4/4 HTTP 200, 78/78 naršyklės patikros, 8/8 garso imtis, visi vartai žali.

Atskirai, ne kaip publikavimo klaida, o kaip **pranešimas apie ID pakeitimą**: modulis `03-sakinio-tvarka` pakeistas `03-sakinio-zodziai` (#261) dėl programos atitikties; vaiko pažanga tam vienam moduliui nustoja galioti. Nieko nešalinau, nepernumeravau, `index.json` / `path.json` / `grades.json` / garso manifesto neliečiau.

## 6. Kas liko nepadaryta (sąžiningai)

1. **Neįrašiau ataskaitos į `agents/log/` ir neatnaujinau `agents/state.json`** — baigties sąlyga formaliai neįvykdyta dėl iteracijų ribos.
2. **Neįrašiau changelog eilutės** `research/wiki/changelog.md` (39/39, versija 8da65911).
3. **Nepadariau įrankio pataisos**, kurią jau pagrindžiau: `check_published.py` neturi istorinės patikros (`vanished_ids` — ID, buvę ankstesnėse `index.json` revizijose, bet dingę dabar; git istorija pilna, 273 commit'ai, `index.json` liestas 33 kartus, repo ne shallow). Tai vienintelis būdas, kad tokia tyli pervadinimo klasė nebeliktų nematoma; dabar tai būtų vartų plėtimas su realiu defektu, ne be jo.
4. **Neįrašiau pamokos** į `research/wiki/guidelines/pamokos.md` (siūloma LL-85: „Dingęs ID tarp dviejų publikavimo paleidimų — abi pusės sutampa, todėl įrankis, lyginantis tik dabartį, tyli“).
5. **Neparašiau pasiūlymų**: (a) `renamed_from` alias `index.json` → `progress.js` migracija, kad pervadinimas neprarastų vaiko žymos (įrodymas: šio paleidimo atvejis + `progress.js:31`); (b) `scripts/add_optional_tasks.py:34` hardcoded ID sąrašas vietoj skaitymo iš `index.json`.

Kitas paleidimas gali pradėti nuo 3–5 punktų — visi įrodymai surinkti aukščiau.

## klaidos

```
session_id: local-46cbef6e0716a9d8e9737f50a696f78711c857793b09bb15bfa282693c51bfc8
```
