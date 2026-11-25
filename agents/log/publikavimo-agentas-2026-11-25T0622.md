# publikavimo-agentas — 2026-11-25T0622

- paleidimas: #526 (manual)
- trukmė: 731s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/probe_route_alias.py
│ @@ -0,0 +1,151 @@
│ +#!/usr/bin/env python3
│ +"""Ar senas (pervadinto) modulio adresas veda į įpėdinį, o ne į „Nerasta“.
│ +
│ +Kodėl šis zondas egzistuoja. `KURINIO-STANDARTAS.md` §7.1 leidžia modulį
│ +pervardinti ir reikalauja `renamed_from`, kad vaiko `localStorage` žyma
│ +nepasiklystų. Bet žyma — ne vienintelė vieta, kur gyvena senas ID: jis lieka
│ +mokytojo numatytoje nuorodoje, kitoje atidarytoje kortelėje, naršyklės
│ +istorijoje. `app.js` modulį randa **tik** pagal `index.json` `id`, todėl
│ +senas adresas atsidurdavo ties `notFound()` — vaikas matydavo „Nerasta“,
│ +nors pamoka ta pačia tema svetainėje yra (`#523`: `03-sakinio-tvarka` →
│ +`03-sakinio-zodziai`).
│ +
│ +Zondas matuoja TIKRĄ naršyklę, o ne kodą: kiekvieną `renamed_from` porą
│ +atidaro senu adresu ir tikrina, kad
│ +  1. puslapyje matomas įpėdinio pavadinimas (ne „Nerasta“),
│ +  2. adresas nukreiptas į dabartinį ID (kad nuoroda būtų galima dalintis toliau),
│ +  3. neigiama kontrolė — išgalvotas ID VIS DAR rodo „Nerasta“ (kitaip
│ +     zondas būtų žalias ir tada, kai maršrutizatorius nerodo nieko).
│ +
│ +Naudojimas:
│ +    .venv/bin/python scripts/probe_route_alias.py            # vietinis repo
│ +    .venv/bin/python scripts/probe_route_alias.py --json
│ +
│ +Išėjimas: rc 0 — visi atvejai praėjo; rc 1 — bent vienas senas adresas
│ +neveda į įpėdinį; rc 2 — nėra playwright / Chrome.
│ +"""
│ +
│ +from __future__ import annotations
│ +
│ +import argparse
│ +import functools
│ +import http.server
│ +import json
│ +import os
│ +import pathlib
│ +import socketserver
│ +import sys
│ +import threading
│ +
│ +ROOT = pathlib.Path(__file__).resolve().parent.parent
│ +BOGUS_ID = "99-zondo-isgalvotas-modulis"
│ +
│ +
│ +def renamed_pairs() -> list[dict]:
│ +    """(grade, strand, senas ID, dabartinis ID, pavadinimas) iš visų klaidų."""
│ +    pairs: list[dict] = []
│ +    for index_path in sorted((ROOT / "content" / "lt").glob("grade-*/index.json")):
│ +        doc = json.loads(index_path.read_text(encoding="utf-8"))
│ +        grade = int(doc.get("grade") or 0)
│ +        for strand in doc.get("strands", []):
│ +            for mod in strand.get("modules", []):
│ +                olds = mod.get("renamed_from") or []
│ +                if not isinstance(olds, list):
│ +                    continue
│ +                for old in olds:
│ +                    if not isinstance(old, str) or not old or old == mod.get("id"):
│ +                        continue
│ +                    pairs.append({
│ +                        "grade": grade,
│ +                        "strand": strand.get("id", ""),
│ +                        "old": old,
│ +                        "id": mod.get("id", ""),
│ +                        "title": mod.get("title", ""),
│ +                    })
│ +    return pairs
│ +
│ +
│ +def serve() -> tuple[socketserver.TCPServer, str]:
│ +    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
│ +    handler.log_message = lambda *a, **k: None  # tyliai: zondo išvestis — tik rezultatai
│ +    httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), handler)
│ +    httpd.daemon_threads = True
│ +    threading.Thread(target=httpd.serve_forever, daemon=True).start()
│ +    return httpd, f"http://127.0.0.1:{httpd.server_address[1]}/"
│ +
│ +
│ +def open_hash(page, base: str, hash_route: str) -> dict:
│ +    """Atidaro hash maršrutą ir grąžina, ką vaikas iš tikrųjų mato."""
│ … omitted 73 diff line(s) across 1 additional file(s)/section(s)
│ scripts/probe_route_alias.py
│ @@ -66,8 +66,12 @@
│
│
│  def serve() -> tuple[socketserver.TCPServer, str]:
│ -    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
│ -    handler.log_message = lambda *a, **k: None  # tyliai: zondo išvestis — tik rezultatai
│ +    class QuietHandler(http.server.SimpleHTTPRequestHandler):
│ +        # Zondo išvestis — tik rezultatai, ne kiekvienas HTTP prašymas.
│ +        def log_message(self, *args, **kwargs):  # noqa: D401
│ +            pass
│ +
│ +    handler = functools.partial(QuietHandler, directory=str(ROOT))
│      httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), handler)
│      httpd.daemon_threads = True
│      threading.Thread(target=httpd.serve_forever, daemon=True).start()
│ assets/js/app.js
│ @@ -1,4 +1,4 @@
│ -import { loadGrades, loadGradeIndex, loadModule, loadPath, getSim, makeSimApi } from "./registry.js";
│ +import { loadGrades, loadGradeIndex, loadModule, loadPath, getSim, makeSimApi, renameMap } from "./registry.js";
│  import * as progress from "./progress.js";
│
│  /* Garso modulis kraunamas atskirai ir NEPRIVALOMAI.
│ assets/js/app.js
│ @@ -378,11 +378,45 @@
│    if (line.textContent !== text) line.textContent = text;
│  }
│
│ +/* Pervadinto modulio adresas. `renamed_from` saugo vaiko žymą (`progress.js`),
│ + * bet senas ID gyvena ir numatytoje mokytojo nuorodoje, atidarytoje kortelėje,
│ + * naršyklės istorijoje. Maršrutizatorius modulį randa **tik** pagal
│ + * `index.json` `id`, todėl be šios grandinės senas adresas atvesdavo į
│ + * „Nerasta“, nors pamoka svetainėje yra (#523: 03-sakinio-tvarka →
│ + * 03-sakinio-zodziai). Grandinė A→B→C sprendžiama iki galo, ciklas
│ + * sustabdomas, o įpėdinis ieškomas visose klasės kryptyse — pervadinimas
│ + * gali perkelti modulį ir į kitą kryptį.
│ + */
│ +function successorOf(gradeIndex, moduleId) {
│ +  const map = renameMap();
│ +  let id = moduleId;
│ +  for (let hop = 0; hop < 8; hop += 1) {
│ +    const next = map.get(id);
│ +    if (!next || next === id) break;
│ +    id = next;
│ +  }
│ +  if (id === moduleId) return null;
│ +  for (const strand of gradeIndex.strands) {
│ +    const m = (strand.modules || []).find((x) => x.id === id);
│ +    if (m) return { strandId: strand.id, id: m.id };
│ +  }
│ +  return null;
│ +}
│ +
│  async function viewModule(grade, strandId, moduleId) {
│    const g = await loadGradeIndex(grade);
│    const strand = g.strands.fin

… PRALEISTA 14663 SIMBOLIŲ IŠ 32663 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00526/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

-nera.json` → **404** (563 B). Pastaba: pirmas nekešuotas bandymas į `03-sakinio-zodziai.json` grąžino 404 (563 B), antras su `?cb=` — 200; tai CDN neigiamos kopijos langas po pervadinimo, o ne turinio spraga (failas gyvai yra ir baitiškai lygus repo).
│ +- **Defektas ir taisymas (LL-190).** #523 pervadino modulį su `renamed_from`, ir `progress.js` žymą perkelia, bet maršrutizatorius modulį rado tik pagal `index.json` `id`: senas adresas `#/modulis/1/lietuviu-kalba/03-sakinio-tvarka` rodė „Nerasta“, nors pamoka yra. Išmatuota tikra naršykle (`scripts/check_route_alias.py`) → 0/1, rc 1. Pataisyta `assets/js/app.js`: `successorOf()` sprendžia `renamed_from` grandinę (iki 8 šuolių, ciklas sustabdomas, įpėdinis ieškomas visose kryptyse), o `viewModule()` nukreipia `history.replaceState` ir atnaujina `currentRoute`. Po pataisos → 1/1, rc 0: antraštė „Kas? Ką veikia?“, adresas `#/modulis/1/lietuviu-kalba/03-sakinio-zodziui`… t. y. `03-sakinio-zodziai`; neigiama kontrolė (išgalvotas ID) vis dar „Nerasta“.
│ +- **Dokumentas:** `docs/KURINIO-STANDARTAS.md` §7.1 papildytas taisykle „Senas adresas taip pat nenustoja veikti“ — kitaip kitas pervadinimas vėl liktų su žymos migracija ir mirusiu adresu.
│ +- **Vartai po pakeitimo:** `validate_content.py` 0/0; `check_registry.py` „index 77 · failai 77 · užduotys 339 · sim 77 · path 77 · našlaičiai 0 / PROBLEMŲ: 0“; `check_language.py` 0/0; `check_audio.py` 2 234/2 234; `check_lessons.py` 190 įrašų (nauja LL-190); `check_refs.py` 27 nuorodos rc 0; `check_docs_facts.py` sutampa; `probe_publish_sets.py` 31/31 rc 0; pilnos klasės `check_view.py` (vietinis serveris) **231 patikra, `problems: []`**, konsolė švari.
│ +- **Būsena po darbo (sąmoningai ne „sutampa“):** `check_published.py` → „PASENĘS KODAS — naršyklė vykdo kitą failą (1): `assets/js/app.js`: repo 36 134 B, gyvai 34 488 B“ (gyva versija = `HEAD` = `f5746608`, t. y. deploy dar nepaleistas). Modulių skaičiai nepajudėti (repo 77 / gyvai 77), garsas 2 234/2 234. **Sprendimas: ištaisyta** — failai `assets/js/app.js`, `scripts/check_route_alias.py`, `docs/KURINIO-STANDARTAS.md`, `research/wiki/guidelines/pamokos.md`; publikavimą atlieka bėgiklis (push + Pages), po jo šis įrašas turi būti patvirtintas kitu `check_published.py` bėgimu.
│ +
│
│  ## 2026-11-24 (23:07) — Publikavimo patikra #524: repo 77 / paskelbta 77 prie `12fddc0f`, garsas 2 224/2 224 (vardai ir dydžiai 2 224/2 224); paskutinis sim pataisymas (#523) svetainėje baitas į baitą; sutampa
│
│ research/wiki/changelog.md
│ @@ -6,7 +6,7 @@
│
│  - **Būsena prieš darbą (`python3 scripts/check_published.py`, rc 0):** „Repozitorija: 77 moduliai / Klasės: grade-01 / Paskelbta: 77 moduliai“ (`grade-01`: repo 77, gyvai 77); `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `missing_in_repo`, `live_missing`, `live_gone`, `stale*`, `aux_*`, `shell_*` — visi `[]`; `path_reordered` `[]`, `path_inserted_midsequence` 4 (įvardyti); garsas **2 234/2 234**, vardai 2 234/2 234, dydžiai 2 234/2 234; kodas 19 failų; `live_version` = `repo_version` = `f5746608`, `unpushed_commits` 0; `verdict` = „sutampa“.
│  - **3 gyvi adresai (`curl`, kodas ir baitai):** `matematika/04-skaiciu-tiese.json` → **200** (4 972 B); `lietuviu-kalba/03-sakinio-zodziai.json` → **200** (5 459 B, pervadinimo įpėdinis); `pasaulio-pazinimas/10-gyvunu-grupes.json` → **200** (8 685 B). **Neigiama kontrolė:** `matematika/99-nera.json` → **404** (563 B). Pastaba: pirmas nekešuotas bandymas į `03-sakinio-zodziai.json` grąžino 404 (563 B), antras su `?cb=` — 200; tai CDN neigiamos kopijos langas po pervadinimo, o ne turinio spraga (failas gyvai yra ir baitiškai lygus repo).
│ -- **Defektas ir taisymas (LL-190).** #523 pervadino modulį su `renamed_from`, ir `progress.js` žymą perkelia, bet maršrutizatorius modulį rado tik pagal `index.json` `id`: senas adresas `#/modulis/1/lietuviu-kalba/03-sakinio-tvarka` rodė „Nerasta“, nors pamoka yra. Išmatuota tikra naršykle (`scripts/check_route_alias.py`) → 0/1, rc 1. Pataisyta `assets/js/app.js`: `successorOf()` sprendžia `renamed_from` grandinę (iki 8 šuolių, ciklas sustabdomas, įpėdinis ieškomas visose kryptyse), o `viewModule()` nukreipia `history.replaceState` ir atnaujina `currentRoute`. Po pataisos → 1/1, rc 0: antraštė „Kas? Ką veikia?“, adresas `#/modulis/1/lietuviu-kalba/03-sakinio-zodziui`… t. y. `03-sakinio-zodziai`; neigiama kontrolė (išgalvotas ID) vis dar „Nerasta“.
│ +- **Defektas ir taisymas (LL-190).** #523 pervadino modulį su `renamed_from`, ir `progress.js` žymą perkelia, bet maršrutizatorius modulį rado tik pagal `index.json` `id`: senas adresas `#/modulis/1/lietuviu-kalba/03-sakinio-tvarka` rodė „Nerasta“, nors pamoka yra. Išmatuota tikra naršykle (`scripts/check_route_alias.py`) → 0/1, rc 1. Pataisyta `assets/js/app.js`: `successorOf()` sprendžia `renamed_from` grandinę (iki 8 šuolių, ciklas sustabdomas, įpėdinis ieškomas visose kryptyse), o `viewModule()` nukreipia `history.replaceState` ir atnaujina `currentRoute`. Po pataisos → 1/1, rc 0: antraštė „Kas? Ką veikia?“, adresas `#/modulis/1/lietuviu-kalba/03-sakinio-zodziai`; neigiama kontrolė (išgalvotas ID) vis dar „Nerasta“.
│  - **Dokumentas:** `docs/KURINIO-STANDARTAS.md` §7.1 papildytas taisykle „Senas adresas taip pat nenustoja veikti“ — kitaip kitas pervadinimas vėl liktų su žymos migracija ir mirusiu adresu.
│  - **Vartai po pakeitimo:** `validate_content.py` 0/0; `check_registry.py` „index 77 · failai 77 · užduotys 339 · sim 77 · path 77 · našlaičiai 0 / PROBLEMŲ: 0“; `check_language.py` 0/0; `check_audio.py` 2 234/2 234; `check_lessons.py` 190 įrašų (nauja LL-190); `check_refs.py` 27 nuorodos rc 0; `check_docs_facts.py` sutampa; `probe_publish_sets.py` 31/31 rc 0; pilnos klasės `check_view.py` (vietinis serveris) **231 patikra, `problems: []`**, konsolė švari.
│  - **Būsena po darbo (sąmoningai ne „sutampa“):** `check_published.py` → „PASENĘS KODAS — naršyklė vykdo kitą failą (1): `assets/js/app.js`: repo 36 134 B, gyvai 34 488 B“ (gyva versija = `HEAD` = `f5746608`, t. y. deploy dar nepaleistas). Modulių skaičiai nepajudėti (repo 77 / gyvai 77), garsas 2 234/2 234. **Sprendimas: ištaisyta** — failai `assets/js/app.js`, `scripts/check_route_alias.py`, `docs/KURINIO-STANDARTAS.md`, `research/wiki/guidelines/pamokos.md`; publikavimą atlieka bėgiklis (push + Pages), po jo šis įrašas turi būti patvirtintas kitu `check_published.py` bėgimu.
│ agents/proposals/2026-11-25-publikavimo-agentas-404-kesas.json
│ @@ -0,0 +1,17 @@
│ +{
│ +  "role": "publikavimo-agentas",
│ +  "run_id": 526,
│ +  "created": "2026-11-25T06:58:00+02:00",
│ +  "type": "struktura",
│ +  "title": "Šviežiai pervadinto failo 404 gali būti CDN neigiama kopija, o įrankis jį laiko galutiniu atsakymu",
│ +  "body": "Paleidime #526 pirmas nekešuotas `curl` į `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` grąžino 404 (563 B GitHub klaidos puslapis), o antras bandymas su `?cb=` į tą patį adresą — 200 (5 459 B, baitiškai lygus repo). Failas svetainėje yra, bet CDN kraštas kurį laiką atsakinėja neigiama kopija (pačio 404 atsakymo antraštės rodė `x-cache: HIT`, `age: 42`). `check_published.fetch_answer()` 404/410 sąmoningai laiko galutiniu atsakymu ir nekartoja (#386) — tai teisinga tikram nebuvimui, bet ne tam atvejui, kai kelias ką tik atsirado (naujas ar pervadintas modulis, naujas kodas). Pasekmė ta pati kaip LL-21/LL-37: vartai po deploy'o praneša „1 modulio failo nėra svetainėje“, `verdict` sako „sustabdyta“, ir sekantis agentas eina ieškoti ištrinto turinio, nors reikia tik palaukti arba perkrauti. Siūloma: kai būsena `gone`, tą patį adresą pakartoti VIENĄ kartą su keitimo žyme (`?cb=<laikas>`) ir, jei atsakymas 200, o baitai sutampa su repo, laikyti `ok` su atskiru įrašu („CDN neigiama kopija, baitai sutampa“); jei ir su žyme 404 — palikti `gone` ir pranešti kaip dabar. Taip neprarandamas 404 ir nepasiekiamumo atskyrimas, o tik atskiriama „failo nėra“ nuo „kraštas dar nepersikrovė“. Zondas: `probe_publish_sets.py` atvejis su dviem atsakymais tame pačiame adrese (pirmas 404, antras 200) → rc 0 ir įvardyta priežastis, o su abiem 404 → rc 1.",
│ +  "target": "scripts/check_published.py",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "curl 2026-11-25 06:21 — https://one-man-company.github.io/suprask/content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json → 404 / 563 B; tas pats adresas su ?cb=<random> → 200 / 5 459 B",
│ +    "curl -I to paties 404 atsakymo antraštės: x-cache: HIT, age: 42, x-github-edge-region: fra; 200 atsakymo: last-modified, cache-control: max-age=600",
│ +    "scripts/check_published.py:1302–1304 — HTTPError 404/410 → return \"missing\", None be karto; :1366–1369 — \"missing\" → būsena \"gone\" ir verdict „modulio failo nėra svetainėje“",
│ +    "research/wiki/guidelines/pamokos.md LL-21, LL-37 — pasenusi / neteisinga priežastis siunčia taisyti ne to"
│ +  ]
│ +}
Sprendimas: **ištaisyta**. Publikavimo būsena prieš darbą sutapo (77/77), bet rastas ir ištaisytas vaikui matomas defektas — po #523 pervadinimo senas modulio adresas vedė į „Nerasta“.

Patikra (`python3 scripts/check_published.py`, rc 0 prieš darbą)
  Repozitorija: 77 moduliai · Klasės: grade-01 („live“) · Paskelbta: 77
  grade-01: repo 77, gyvai 77; visi sąrašai [] (missing_on_live, hidden_locally,
  not_in_path, orphan_files, missing_in_repo, live_missing, stale*, aux_*, shell_*);
  path_reordered []; path_inserted_midsequence 4 (į vidurį, leidžiama);
  garsas 2 234/2 234 · vardai 2 234/2 234 · dydžiai 2 234/2 234;
  kodas 19 failų; live = repo = f5746608; neišstumta 0; verdict „sutampa“

3 gyvi adresai (curl)
  matematika/04-skaiciu-tiese.json → 200 (4 972 B)
  lietuviu-kalba/03-sakinio-zodziai.json → 200 (5 459 B)
  pasaulio-pazinimas/10-gyvunu-grupes.json → 200 (8 685 B)
  neigiama kontrolė matematika/99-nera.json → 404 (563 B)

Kas buvo negerai ir kas pakeista
  `#523` pervadino `03-sakinio-tvarka` → `03-sakinio-zodziui` (`03-sakinio-zodziai`), ir `progress.js` žymą perkelia, bet maršrutizatorius modulį rado tik pagal `index.json` `id`. Tikra naršyklė: `#/modulis/1/lietuviu-kalba/03-sakinio-tvarka` → antraštė „Nerasta“, nors pamoka svetainėje yra. Visi kiti vartai buvo žali, nes senas ID nėra nė viename sąraše.
  - `assets/js/app.js` — `successorOf()` sprendžia `renamed_from` grandinę (iki 8 šuolių, ciklas sustabdomas, įpėdinis ieškomas visose kryptyse); `viewModule()` nukreipia `history.replaceState` ir atnaujina `currentRoute`.
  - `scripts/check_route_alias.py` — naujas patikrinimas tikra naršykle: kiekviena `renamed_from` pora atidaroma senu adresu ir turi parodyti įpėdinio antraštę bei adresą su dabartiniu ID; neigiama kontrolė — išgalvotas ID vis dar „Nerasta“. Prieš pataisą 0/1 rc 1, po — 1/1 rc 0.
  - `docs/KURINIO-STANDARTAS.md` §7.1 — taisyklė „Senas adresas taip pat nenustoja veikti“.
  - `research/wiki/guidelines/pamokos.md` — LL-190 (naujas defekto tipas: žyma perkeliama, adresas miršta).
  - `agents/proposals/2026-11-25-publikavimo-agentas-404-kesas.json` — pastebėta, kad pirmas nekešuotas GET į ką tik pervadintą failą grąžino pasenusį 404, o su `?cb=` — 200; siūloma `gone` atvejį kartoti vieną kartą su keitimo žyme.

Vartai po pakeitimo
  `validate_content.py` 0/0 · `check_registry.py` „index 77 · failai 77 · užduotys 339 · sim 77 · path 77 · našlaičiai 0 / PROBLEMŲ: 0“ · `check_language.py` 0/0 · `check_audio.py` 2 234/2 234 · `check_lessons.py` 190 įrašų · `check_refs.py` rc 0 · `check_docs_facts.py` sutampa · `probe_publish_sets.py` 31/31 · `check_view.py` vietiniu serveriu **231 patikra, problems: []**.

Būsena po darbo (ne „sutampa“, sąmoningai): `check_published.py` → „PASENĘS KODAS — naršyklė vykdo kitą failą (1): assets/js/app.js: repo 36 134 B, gyvai 34 488 B“, repo 77 / paskelbta 77, neišstumta 0. Tai reiškia, kad pataisymas dar nepaskelbtas — push ir Pages deploy atlieka bėgiklis; po jo reikia kito `check_published.py` bėgimo, kuris turi grąžinti „sutampa“. Push nedarytas, modulio ID nekeistas, turinys ir simuliacijos neliestos.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-8fde1d609ac2f8717d93e0f75ce8adc7e676f4f217cfed9bf4752973b34382d9
```
