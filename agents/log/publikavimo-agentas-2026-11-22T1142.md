# publikavimo-agentas — 2026-11-22T1142

- paleidimas: #439 (manual)
- trukmė: 426s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/probe_check_published.py
│ @@ -0,0 +1,206 @@
│ +#!/usr/bin/env python3
│ +"""Zondas `check_published.py` garso vardo patikrai — pakartojamas, be tinklo.
│ +
│ +Kodėl šis failas egzistuoja (LL-36, LL-21). Iki #439 neigiamos kontrolės buvo
│ +rašomos į `scratch/pubNNN/` ir **niekada neįtraukiamos į repo** (`git log --all
│ +-- scratch` → 0 commit'ų). Docstring'e liko penkios nuorodos į failus, kurių
│ +repo nėra, tad kiekvienas, kas norėjo patikrinti teiginį „zondas rodė taip“,
│ +turėjo jį priimti tikėjimu. #433 docstring'e buvo eilutė apie
│ +`scratch/pub433/probe.py`, kuri ne tik nebuvo įtraukta — ji nebuvo nė karto
│ +paleista. Teiginys faile be matavimo yra tas pats defektas, kaip skaičius
│ +dokumente, kurio niekas neperskaičiuoja.
│ +
│ +Šis zondas tikrina būtent tai, ko negali patikrinti `check_published.py` savo
│ +bėgime: kad **kiekviena** `audio_name_digest()` būsena (`checked`, `mismatch`,
│ +`text_mismatch`, `unverified`, `absent`) realiai įsijungia ir kad jų suma
│ +visada lygi `total` (LL-37 — tyli riba). Veidrodis statomas laikiname
│ +kataloge iš **tikrų** `assets/audio/lt/` failų; repo failai nekeičiami, tinklo
│ +užklausų nėra, tad zondą galima paleisti bet kada, taip pat ir po vėlesnių
│ +pataisymų (regresijos patikra).
│ +
│ +Naudojimas:
│ +    python3 scripts/probe_check_published.py      # 0 — visi lūkesčiai išsipildė
│ +"""
│ +
│ +from __future__ import annotations
│ +
│ +import hashlib
│ +import json
│ +import pathlib
│ +import shutil
│ +import sys
│ +import tempfile
│ +
│ +HERE = pathlib.Path(__file__).resolve().parent
│ +ROOT = HERE.parent
│ +sys.path.insert(0, str(HERE))
│ +
│ +import check_published as cp  # noqa: E402
│ +
│ +REAL_MANIFEST = ROOT / "assets" / "audio" / "lt" / "manifest.json"
│ +REAL_AUDIO = REAL_MANIFEST.parent
│ +
│ +results: list[tuple[str, bool, str]] = []
│ +
│ +
│ +def check(name: str, ok: bool, detail: str) -> None:
│ +    results.append((name, ok, detail))
│ +    print(f"{'OK  ' if ok else 'KLAIDA'} {name} — {detail}")
│ +
│ +
│ +def sha16(text: str) -> str:
│ +    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]
│ +
│ +
│ +def real_pairs(limit: int = 2) -> list[tuple[str, str]]:
│ +    """(tekstas, kelias manifeste) poros iš tikro manifesto, failai egzistuoja."""
│ +    data = json.loads(REAL_MANIFEST.read_text(encoding="utf-8"))
│ +    out: list[tuple[str, str]] = []
│ +    for text, value in sorted(data.items()):
│ +        for rel in (value.values() if isinstance(value, dict) else [value]):
│ +            if rel and (REAL_AUDIO / rel).exists():
│ +                out.append((text, rel))
│ +                break
│ +        if len(out) >= limit:
│ +            break
│ +    return out
│ +
│ +
│ +def build_mirror(base: pathlib.Path, pairs: list[tuple[str, str]]) -> pathlib.Path:
│ +    """Laikinas garso katalogas su tikromis kopijomis ir manifestu."""
│ +    manifest: dict[str, dict[str, str]] = {}
│ +    for text, rel in pairs:
│ +        target_rel = pathlib.Path(rel).name
│ +        (base / target_rel).parent.mkdir(parents=True, exist_ok=True)
│ +        shutil.copyfile(REAL_AUDIO / rel, base / target_rel)
│ +        manifest[text] = {"n": target_rel}
│ +    path = base / "manifest.json"
│ +    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
│ … omitted 128 diff line(s) across 1 additional file(s)/section(s)
│ scripts/check_published.py
│ @@ -252,9 +252,31 @@
│      atskirą eilutę (būsena be savo šakos būtų LL-129).
│    Išmatuota 2026-11-22: 1 486/1 486 priekis = `sha(manifesto raktas)[:16]`,
│    `text_mismatch` 0, `mismatch` 0, `absent` 0, 0,2 s (vietinis skaitymas).
│ -  Neigiama kontrolė (`scratch/pub433/probe.py`): manifeste pakeistas vienas
│ -  raktas → `text_mismatch` 1, `verdict` „1 garso failo vardas rodo kitą TEKSTĄ“,
│ -  rc 1; atkūrus — vėl 0 ir rc 0.
│ +  Neigiamos kontrolės #433 bėgimas **nepaleido**: docstring'e buvo nuoroda į
│ +  `scratch/pub433/probe.py`, kurio nebuvo nė repo, nė diske (žr. #439 žemiau).
│ +
│ +2026-11-22 (paleidimas #439): patikros teiginys pagaliau turi paleidžiamą įrodymą.
│ +  #433 paliko docstring'e sakinį „Neigiama kontrolė (`scratch/pub433/probe.py`)
│ +  → `text_mismatch` 1 … rc 1“, kurio **niekas nepaleido** ir kurio failo niekada
│ +  nebuvo. Tai LL-36 (įrodymas, kurio faile nebeliko) ir LL-21 (teiginys be
│ +  matavimo), tik atvirkščia tvarka: pirmiau parašytas rezultatas, paskui
│ +  nepadarytas matavimas. Be to paaiškėjo šaknis: `git log --all -- scratch` →
│ +  **0 commit'ų**, t. y. visi iki šiol cituoti zondai (`pub368`, `pub370`,
│ +  `pub386`, `pub388`, `pub404`) gyveno kataloge, kuris į repo nepatenka, tad
│ +  nė vieno jų pakartoti neįmanoma — dokumente liko tik jų pažadas.
│ +  Dabar yra `scripts/probe_check_published.py` — **įtrauktas į repo**,
│ +  paleidžiamas be tinklo (veidrodis statomas laikiname kataloge iš tikrų
│ +  `assets/audio/lt/` failų, repo neliečiamas):
│ +    `python3 scripts/probe_check_published.py` → **10/10**, rc 0, 0,3 s.
│ +  Jis įjungia kiekvieną `audio_name_digest()` būseną atskirai (A sveika
│ +  būsena → `checked = total`; B pakeistas teksto raktas → `text_mismatch` 1 ir
│ +  `verdict` „…kitą TEKSTĄ…“; C nukirptas mp3 → `mismatch` 1 ir „…kitą
│ +  turinį…“; D įrašas be failo → `absent` 1; E atkūrimas → vėl žalia; F tikras
│ +  manifestas po zondo nepakitęs) ir kiekviename žingsnyje tikrina sumos
│ +  invariantą `checked + mismatch + text_mismatch + unverified + absent = total`
│ +  (LL-37). Paleistas ir šio bėgimo fone: `check_published.py` numatytuoju
│ +  režimu — repo 52 / paskelbta 52, garsas 1 514/1 514, vardo maišas
│ +  1 514/1 514, svetainės kodas 19 failų, rc 0.
│
│  Naudojimas:
│      python3 scripts/check_published.py               # žmogui
│ research/wiki/guidelines/pamokos.md
│ @@ -979,3 +979,10 @@
│  - **Priežastis:** matuoklis rūšiuoja pagal perteklių, o esant lygiam pertekliui — pagal **trumpiausią tekstą**. Keturi elementai slinko po 6 px (svg, `#sdp-ones-box`, jo eilutė ir sv

… PRALEISTA 3628 SIMBOLIŲ IŠ 21628 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00439/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

kstas remiasi **neigiama kontrole**, ta kontrolė turi būti repo failas, paleidžiamas iš šviežio klono be tinklo ir neliečiantis repo (veidrodis — laikiname kataloge), o teiginys privalo įvardyti **komandą ir jos skaičius**. Vienkartinis zondas gali gyventi kur nori, bet tada repo tekste cituojamas tik **faktas**, niekada jo kelias. Ir atvirkščiai: prieš įrašydamas sakinį apie zondą, paleisk tą komandą tame pačiame darbe.
│ +- **Patikra:** `python3 scripts/probe_check_published.py` — **10/10 lūkesčių, rc 0, 0,26 s**, be tinklo; veidrodis statomas `tempfile` kataloge iš tikrų `assets/audio/lt/` failų, tad `git status` prieš ir po — švarus. Zondas įjungia kiekvieną `audio_name_digest()` būseną atskirai (A `checked = total`, B `text_mismatch` 1 + `verdict` „…kitą TEKSTĄ…“, C nukirptas mp3 → `mismatch` 1 + „…kitą turinį…“, D įrašas be failo → `absent` 1, E atkūrimas → vėl žalia, F tikras manifestas nepakitęs) ir kiekviename žingsnyje tikrina, kad `checked + mismatch + text_mismatch + unverified + absent = total` (LL-37). Bendras patikros taisykles atitinkantis įprotis: po kiekvieno docstring pakeitimo, kuriame yra skaičius, paleisk tą pačią komandą ir palygink — `check_published.py` šiame darbe: repo 52 / paskelbta 52, garsas 1 514/1 514, vardo maišas 1 514/1 514.
│ research/wiki/changelog.md
│ @@ -2,7 +2,16 @@
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│
│ -## 2026-11-21 (16:40) — Leidėjas #427: gyva svetainė = `f62ad65f`, repo 51 / gyvai 51, garsas 1 486/1 486, 23 svetainės failai baitais lygūs; palaikyta
│ +## 2026-11-22 — Publikavimo patikra #439: repo 52 / paskelbta 52 prie `3a55f447`, garsas 1 514/1 514; #433 teiginys be matavimo pakeistas paleidžiamu zendu
│ +
│ +- **Būsena (`scripts/check_published.py`, numatytasis režimas, rc 0, 96 s):** „Repozitorija: 52 moduliai / Paskelbta: 52 moduliai“ (`grade-01: repo 52, gyvai 52`); `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `stale`, `stale_unknown`, `live_missing`, `missing_in_repo`, `aux_stale`, `aux_absent`, `aux_gone`, `shell_stale`, `shell_gone`, `shell_unreachable` — visi `[]`; `shell_count` 19, garsas **1 514/1 514** (`sampled: false`), garso vardai **1 514/1 514** (`mismatch` 0, `text_mismatch` 0, `unverified` 0, `absent` 0), `live_version` = `repo_version` = `3a55f447`, `unpushed_commits` 0, `deploy_pending` false, `retried_requests` 0. `vanished_ids` 1 — `03-sakinio-tvarka` → `03-sakinio-zodziai`, `alias_ok: true` (žyma perkeliama).
│ +- **3 realios gyvos patikros (HTTP kodai):** `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` → **200**; `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → **200**; `content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json` → **200**; **neigiama kontrolė** `content/lt/grade-01/matematika/99-nera.json` → **404**.
│ +- **Defektas, paliktas #433, uždarytas:** docstring'e stovėjo „Neigiama kontrolė (`scratch/pub433/probe.py`) → `text_mismatch` 1 … rc 1“, bet tokio failo nebuvo nei repo, nei diske (`git log --all -- scratch` → 0 commit'ų), o pats zondas nebuvo paleistas nė karto — t. y. rezultatas įrašytas prieš matavimą (LL-21, LL-36). Dabar yra į repo įtrauktas, be tinklo paleidžiamas `scripts/probe_check_published.py`, statantis veidrodį `tempfile` kataloge iš tikrų `assets/audio/lt/` failų: **10/10 lūkesčių, rc 0, 0,26 s**, `git status` prieš ir po — švarus. Jis įjungia kiekvieną garso vardo būseną atskirai (B pakeistas teksto raktas → `text_mismatch` 1 + `verdict` „…kitą TEKSTĄ…“; C nukirptas mp3 → `mismatch` 1 + „…kitą turinį…“; D įrašas be failo → `absent` 1; E atkūrimas → vėl žalia) ir kiekviename žingsnyje tikrina sumos invariantą `checked + mismatch + text_mismatch + unverified + absent = total` (LL-37). Docstring pataisytas: klaidinga nuoroda pakeista šiuo faktu, o šaknis (`scratch/` niekada neįtraukiamas į repo) įvardyta.
│ +- **Vartai po pakeitimo:** `check_registry.py --grade 1` → „kryptys 9 · index 52 · failai 52 · užduotys 227 (optional 52) · sim 52 · path 52 · našlaičiai 0 / PROBLEMŲ: 0“, rc 0; `check_docs_facts.py` → 0 klaidų, 0 įspėjimų, rc 0; `check_agents.py` rc 0 (1 įspėjimas, buvęs prieš: sisteminiai pasiūlymai laukia >3 d.); `py_compile` abiem įrankiams — OK.
│ +- **Nauja pamoka:** `research/wiki/guidelines/pamokos.md` → **LL-137** „Zondas, kurio niekas negali paleisti: įrodymas kataloge, kuris į repo nepatenka“ (Simptomas / Priežastis / Taisyklė / Patikra).
│ +- **Sprendimas:** **sutampa** (repo 52 / paskelbta 52, garsas 1 514/1 514, kodas 19 failų, 0 neišstumtų commit'ų) ir **ištaisyta** (`scripts/check_published.py` docstring + naujas `scripts/probe_check_published.py`). Neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `.github/workflows/**`; joks modulio ID nepernumeruotas, nieko nešalinta; jokio `git push` iš agento.
│ +
│ +## 2026-11-21 (16:40) — Leidėjas #427: gyva svetainė = `f62ad65f`, repo 51 / gyvai 51, garsas 1 486 / 1 486, 23 svetainės failai baitais lygūs; palaikyta
│
│  - **Ką paskelbė agentai šiandien (`git log --since=2026-11-21T00:00:00` → 12 commit'ų):** `3ab7119` metodininkas #419 — `research/wiki/grades/01/metodai.md`; `30c76c0` kūrėjas #420 — `assets/js/sims/calba.js` + `pamokos.md`; `d9bb326` kūrėjas #421 — **naujas modulis** `content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json` (8 221 B, „Kas gyvena tvarte?“) ir `assets/js/sims/calba.js`, `pamokos.md` (LL-132); `6d2a47f` simuliacijų inžinierius #422 — `assets/css/main.css` + `assets/js/sims/matematika.js` (LL-133: rėmo paminkštinimas iš `rem` į `px`, 200 % zondo defektai 120 → 56); `70008a6` dizaineris #424 — `assets/css/main.css` + `assets/js/app.js`; `0df9449` ir `f62ad65` publikavimo agentas #423/#426 — `scripts/check_published.py`. Publikuojami failai tarp jų: `main.css`, `app.js`, `matematika.js`, `calba.js`, `10-gyvunu-grupes.json`, `index.json`, `path.json`.
│  - **`pages.yml`:** 15 paskutinių paleidimų **visi `completed/success`**, kiekvieno `headSha` sutampa su atitinkamu commit'u; naujausias `44912564971` prie `f62ad65f` (35 s, `2026-11-21T14:10:38Z`). Jokio raudono deploy, jokio praleisto push. Gyva versija, nuskaityta iš gyvo `index.html`, — `?v=f62ad65f` = pirmi 8 `HEAD` simboliai, tad svetainė pastatyta būtent iš šio commit'o (ne iš kešo).
│ research/wiki/changelog.md
│ @@ -11,7 +11,7 @@
│  - **Nauja pamoka:** `research/wiki/guidelines/pamokos.md` → **LL-137** „Zondas, kurio niekas negali paleisti: įrodymas kataloge, kuris į repo nepatenka“ (Simptomas / Priežastis / Taisyklė / Patikra).
│  - **Sprendimas:** **sutampa** (repo 52 / paskelbta 52, garsas 1 514/1 514, kodas 19 failų, 0 neišstumtų commit'ų) ir **ištaisyta** (`scripts/check_published.py` docstring + naujas `scripts/probe_check_published.py`). Neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `.github/workflows/**`; joks modulio ID nepernumeruotas, nieko nešalinta; jokio `git push` iš agento.
│
│ -## 2026-11-21 (16:40) — Leidėjas #427: gyva svetainė = `f62ad65f`, repo 51 / gyvai 51, garsas 1 486 / 1 486, 23 svetainės failai baitais lygūs; palaikyta
│ +## 2026-11-21 (16:40) — Leidėjas #427: gyva svetainė = `f62ad65f`, repo 51 / gyvai 51, garsas 1 486/1 486, 23 svetainės failai baitais lygūs; palaikyta
│
│  - **Ką paskelbė agentai šiandien (`git log --since=2026-11-21T00:00:00` → 12 commit'ų):** `3ab7119` metodininkas #419 — `research/wiki/grades/01/metodai.md`; `30c76c0` kūrėjas #420 — `assets/js/sims/calba.js` + `pamokos.md`; `d9bb326` kūrėjas #421 — **naujas modulis** `content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json` (8 221 B, „Kas gyvena tvarte?“) ir `assets/js/sims/calba.js`, `pamokos.md` (LL-132); `6d2a47f` simuliacijų inžinierius #422 — `assets/css/main.css` + `assets/js/sims/matematika.js` (LL-133: rėmo paminkštinimas iš `rem` į `px`, 200 % zondo defektai 120 → 56); `70008a6` dizaineris #424 — `assets/css/main.css` + `assets/js/app.js`; `0df9449` ir `f62ad65` publikavimo agentas #423/#426 — `scripts/check_published.py`. Publikuojami failai tarp jų: `main.css`, `app.js`, `matematika.js`, `calba.js`, `10-gyvunu-grupes.json`, `index.json`, `path.json`.
│  - **`pages.yml`:** 15 paskutinių paleidimų **visi `completed/success`**, kiekvieno `headSha` sutampa su atitinkamu commit'u; naujausias `44912564971` prie `f62ad65f` (35 s, `2026-11-21T14:10:38Z`). Jokio raudono deploy, jokio praleisto push. Gyva versija, nuskaityta iš gyvo `index.html`, — `?v=f62ad65f` = pirmi 8 `HEAD` simboliai, tad svetainė pastatyta būtent iš šio commit'o (ne iš kešo).
ATASKAITA — publikavimo-agentas, paleidimas #439

1. BŪKLĖ (`python3 scripts/check_published.py`, numatytasis režimas, rc 0, 96 s)
   Repozitorija: 52 moduliai / Paskelbta: 52 (grade-01: repo 52, gyvai 52)
   missing_on_live 0, hidden_locally 0, not_in_path 0, orphan_files 0,
   stale 0, stale_unknown 0, live_missing 0, missing_in_repo 0, aux_stale 0,
   aux_absent 0, aux_gone 0, shell_stale 0, shell_gone 0, shell_unreachable 0;
   svetainės kodas 19 failų; garsas 1 514/1 514 (sampled: false);
   garso vardai 1 514/1 514 (mismatch 0, text_mismatch 0, unverified 0, absent 0);
   live_version = repo_version = 3a55f447; unpushed_commits 0; deploy_pending false;
   retried_requests 0. vanished_ids 1 — 03-sakinio-tvarka → 03-sakinio-zodziai,
   alias_ok true (žyma perkeliama, pažanga nepamesta).

2. 3 GYVI ADRESAI (curl)
   200 content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json
   200 content/lt/grade-01/matematika/04-skaiciu-tiese.json
   200 content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
   404 content/lt/grade-01/matematika/99-nera.json (neigiama kontrolė)

3. KĄ PAKEIČIAU — 3 failai + 1 naujas
   - scripts/probe_check_published.py (NAUJAS, įtrauktas į repo): pakartojamas
     neigiamos kontrolės zondas, be tinklo, veidrodis tempfile kataloge iš tikrų
     assets/audio/lt/ failų. Paleistas: 10/10 lūkesčių, rc 0, 0,26 s. Įjungia
     kiekvieną garso vardo būseną atskirai (text_mismatch, mismatch, absent,
     atkūrimą) ir tikrina sumos invariantą = total (LL-37).
   - scripts/check_published.py: pašalintas NEPALEISTAS ir neegzistavusio failo
     teiginys „Neigiama kontrolė (scratch/pub433/probe.py) → text_mismatch 1 … rc 1";
     įrašytas #439 blokas su tikrais skaičiais.
   - research/wiki/guidelines/pamokos.md: nauja pamoka LL-137 „Zondas, kurio
     niekas negali paleisti: įrodymas kataloge, kuris į repo nepatenka".
   - research/wiki/changelog.md: naujas įrašas viršuje (tik papildymas, 0 pašalintų
     eilučių; atsitiktinai pakeistą istorinę #427 antraštę grąžinau į originalą).

   Šaknis, kurią radau: `git log --all -- scratch` → 0 commit'ų, `git ls-files |
   grep -c scratch` → 0. Visi iki šiol cituoti zondai (pub368, pub370, pub386,
   pub388, pub404, pub433) gyveno kataloge, kuris į repo niekada nepatenka, tad
   nė vieno nebuvo galima pakartoti. #433 atveju rezultatas buvo įrašytas anksčiau,
   negu matavimas padarytas — ir nepadarytas nė karto.

4. VARTai PO PAKEITIMO
   check_registry.py --grade 1 → kryptys 9 · index 52 · failai 52 · užduotys 227
   (optional 52) · sim 52 · path 52 · našlaičiai 0 / PROBLEMŲ: 0, rc 0;
   check_docs_facts.py → 0 klaidų, 0 įspėjimų, rc 0;
   check_agents.py rc 0 (1 įspėjimas, buvęs prieš: sisteminiai pasiūlymai >3 d.);
   py_compile abiem įrankiams — OK.

5. SPRENDIMAS: sutampa (repo 52 / paskelbta 52, garsas 1 514/1 514, kodas 19
   failų, 0 neišstumtų commit'ų) IR ištaisyta (scripts/check_published.py
   docstring + scripts/probe_check_published.py).

   Neliesta: content/**, assets/**, docs/**, AGENTS.md, .github/workflows/**;
   joks modulio ID nepernumeruotas, nieko nešalinta, jokio git push iš agento.
   Eilutės „ĮGYVENDINTA:" nėra — nė vienas atviras pasiūlymas (#29003, #24447,
   #24307, #24171, #23765, #22168, #16892, #16338, #5400, #5342) nenurodo šio
   darbo tikslo failo.

   Pastaba: failai palikti darbinėje kopijoje (nepushinta) — publikavimą atlieka
   bėgiklis; kitas žingsnis žmogui/bėgikliui: commit + push, tada deploy pasivys
   pats.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-b0d1afda01951ebde03583e9f384d500a523e0a99e5c1db9d3e045394eeb7e18
```
