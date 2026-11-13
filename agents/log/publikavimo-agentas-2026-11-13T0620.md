# publikavimo-agentas — 2026-11-13T0620

- paleidimas: #257 (manual)
- trukmė: 226s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub257/audio_probe.py
│ @@ -0,0 +1,24 @@
│ +import json, random, urllib.request, urllib.error
│ +
│ +m = json.load(open('assets/audio/lt/manifest.json'))
│ +print('manifest keys:', len(m))
│ +random.seed(257)
│ +keys = random.sample(sorted(m), 4)
│ +base = 'https://one-man-company.github.io/suprask/assets/audio/lt/'
│ +ok = 0
│ +for k in keys:
│ +    entry = m[k]
│ +    paths = entry if isinstance(entry, list) else entry.get('paths', entry)
│ +    if isinstance(paths, str):
│ +        paths = [paths]
│ +    for p in paths:
│ +        url = base + p
│ +        try:
│ +            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'suprask-check/1.2'}), timeout=25) as r:
│ +                body = r.read()
│ +                tag = body[:3]
│ +                print(f"  {r.status} {len(body):>6}B {tag!r:12} {p}")
│ +                ok += 1 if r.status == 200 and tag == b'ID3' else 0
│ +        except Exception as exc:
│ +            print(f"  ERR {type(exc).__name__} {p}")
│ +print(f'audio sample ok: {ok}')
│ profiles/deepseek41flash/cache/scratch/pub257/audio_probe.py
│ @@ -1,24 +1,25 @@
│ -import json, random, urllib.request, urllib.error
│ +import json, random, urllib.request
│
│  m = json.load(open('assets/audio/lt/manifest.json'))
│  print('manifest keys:', len(m))
│  random.seed(257)
│  keys = random.sample(sorted(m), 4)
│  base = 'https://one-man-company.github.io/suprask/assets/audio/lt/'
│ -ok = 0
│ +ok = bad = 0
│  for k in keys:
│ -    entry = m[k]
│ -    paths = entry if isinstance(entry, list) else entry.get('paths', entry)
│ -    if isinstance(paths, str):
│ -        paths = [paths]
│ -    for p in paths:
│ +    for variant in ('n', 's'):
│ +        p = m[k][variant]
│          url = base + p
│          try:
│ -            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'suprask-check/1.2'}), timeout=25) as r:
│ +            with urllib.request.urlopen(
│ +                urllib.request.Request(url, headers={'User-Agent': 'suprask-check/1.2'}), timeout=25
│ +            ) as r:
│                  body = r.read()
│ -                tag = body[:3]
│ -                print(f"  {r.status} {len(body):>6}B {tag!r:12} {p}")
│ -                ok += 1 if r.status == 200 and tag == b'ID3' else 0
│ +                good = r.status == 200 and body[:3] == b'ID3'
│ +                ok += 1 if good else 0
│ +                bad += 0 if good else 1
│ +                print(f"  {r.status} {len(body):>6}B {body[:3]!r:8} {p}")
│          except Exception as exc:
│ +            bad += 1
│              print(f"  ERR {type(exc).__name__} {p}")
│ -print(f'audio sample ok: {ok}')
│ +print(f'audio sample: {ok} ok, {bad} bad')
│ research/wiki/changelog.md
│ @@ -1,6 +1,17 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-13 (06:23) — Publikavimo patikra #257: repo 37 / paskelbta 37, veidrodžių A/B/C scenarijai išmatuoti pirmą kartą
│ +
│ +- **`check_published.py`** → repo 37, paskelbta 37, `grade-01: repo 37, gyvai 37`; `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0, `aux_stale` 0, `shell_stale` 0, `shell_unreachable` 0, `path_differs` [], `live_error` tuščias, `unpushed_commits` 0, `verdict.label` = `sutampa`, `rc=0` (4,7 s).
│ +- **Pastatyta iš `HEAD`:** `HEAD` = `origin/main` = `3d8f4782` (`git rev-list --left-right --count origin/main...HEAD` → `0 0`), darbinė kopija švari (`git status --porcelain -uall` → 0 eilučių), gyvas `index.html` neša `?v=3d8f4782` — svetainė pastatyta būtent iš šio commit'o. Svetainės kodas: **17 failų** baitais sutampa po `?v=` žymos nuėmimo.
│ +- **3 gyvi adresai (+2):** `matematika/25-ilgis-ir-vienetas.json` `200` (8812 B), `lietuviu-kalba/01-garsas-ir-raide.json` `200` (5044 B), `pasaulio-pazinimas/16-vandens-busenos.json` `200` (4946 B); papildomai `grade-01/index.json` `200` (11 209 B) ir `assets/audio/lt/manifest.json` `200` (60 758 B).
│ +- **A/B/C veidrodžiai (paleisti, o ne tik paruošti — #255 tai buvo palikę atvirą):** (A) `127.0.0.1:8976`, `assets/js/sims/muzika.js` 23 121 B prieš repo 23 086 B → `PASENĘS KODAS — naršyklė vykdo kitą failą`, `rc=1`; (B) `:8977`, to paties failo nėra → `NEPASIEKIAMI svetainės kodo failai`, `rc=1`; (C) `:8978`, failai **tie patys**, skiriasi tik `?v=3f05969b` žyma → `rc=0`, `sutampa`, o `live_version` rodomas kaip informacija, ne kaip defektas. Taigi #253 įrankio pakeitimas veikia į abi puses: kodo skirtumą pagauna, žymos nepaverčia klaidingu signalu.
│ +- **Naršyklė prieš gyvą bazę:** `check_view.py --base <gyva> --module 25-ilgis-ir-vienetas --viewports phone,small` → 2 patikros, 0 problemų, `rc=0`; `--module 03-sakinio-tvarka` → 2 patikros, 0 problemų.
│ +- **Garsas:** manifestas 543 raktai; imtis `seed 257` (4 raktai × `n`/`s`) → **8/8** `200`, `ID3`, 14 462–51 869 B. Struktūrinė patikra, kurios manifestas vienas nepajėgia: `git ls-files 'assets/audio/lt/*.mp3'` = **1086** ir diske = **1086** — nė vienas įrašas nėra netrackintas, todėl manifeste esantis takas negali duoti 404 dėl `.gitignore`.
│ +- **Vartai:** `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų (`rc=0`); `check_docs_facts.py` → 0 klaidų, 0 įspėjimų (9 kryptys, 37 moduliai, 37 sim., 161 užduotis, 543 garso tekstai, 1086 įrašai).
│ +- **Sprendimas:** **sutampa**. Nieko nešalinta, ID nepernumeruoti, `index.json` / `path.json` / `grades.json` / garso manifestas neliesti. Šis įrašas uždengia ir #255 (2026-11-12 23:04), kurio changelog eilutė nebuvo įrašyta, o skaičiai buvo tie patys (37/37 prie `3f05969b`). Nauja pamoka **LL-84** (vartai lygino tai, ką vaikas turėtų matyti, o ne tai, ką naršyklė vykdo). Ataskaita `agents/log/publikavimo-agentas-2026-11-13T0623.md`.
│
│  ## 2026-11-12 (16:37) — Publikavimo patikra #252 (leidėjas): repo 37 / gyvai 37, 74 gyvos naršyklės patikros, 0 problemų
│
│ research/wiki/guidelines/pamokos.md
│ @@ -601,3 +601,10 @@
│  - **Priežastis:** prielaida „naujausias įrašas = paskutinis baigtas įrašas“ buvo teisinga tik žiūrint iš šalies. Vartai, kuriuos vykdo pats matuojamas vaidmuo, visada mato save kaip `running` įrašą pirmoje vietoje; statuso filtras buvo užrašytas kaip `if`, o ne kaip sąrašo filtras, todėl vietoj „praleisk vykstantį ir imk paskutinį baigtą“ gavosi „jei paskutinis netinka — tylėk“. Tai ta pati šeima kaip LL-37 (tyli riba), bet priežastis kitokia: ne nukirptas sąrašas, o **įsivertinimas savo paties eigoje**.
│  - **Taisyklė:** kai vartai lygina vaidmens darbą su įrašų saugykla, atskaitos taškas yra paskutinis **baigtas** to vaidmens paleidimas, o vykstantys įrašai filtruojami sąrašo lygmenyje (`[r for r in runs if r["status"] in DONE]`), ne `if` šakoje virš pirmo elemento. Laikas lyginamas su paleidimo **pradžia**, ne pabaiga: darbo pabaigos laukas dar neužpildytas tuo metu, kai patikra bėga, o įrašas į dienoraštį rašomas darbo metu. Kiekvienas vartas, kurio pirmas realus paleidimas neįspėja, turi būti paleistas du kartus — prieš pataisymą ir po jo — ir abu rezultatai užrašomi.
│  - **Patikra:** `python3 scripts/check_agents.py` prieš pataisymą → 1 įspėjimas (sisteminiai pasiūlymai), po pataisymo be jokių kitų pakeitimų → 2 įspėjimai, iš jų „baigė darbą (#238) be dienoraščio įrašo“. Tada įrašius dienoraščio įrašą ir pakartojus — vėl 1 įspėjimas (įspėjimas nėra nuolatinis, jis reaguoja į failo laiką).
│ +
│ +## LL-84 — Vartai, lyginantys tai, ką vaikas turėtų matyti, o ne tai, ką naršyklė vykdo
│ +
│ +- **Simptomas:** `scripts/check_published.py` iki #253 lygino tik `content/lt/**` (modulių JSON, `index.json`, `path.json`, `grades.json`) ir garso manifestą. Todėl nepaskelbtas simuliacijos pataisymas buvo visiškai nematomas: modulių baitai sutampa, `verdict` = `sutampa`, visi vartai žali, o vaikas naršyklėje vykdo **seną** `assets/js/sims/*.js` ir mato seną elgesį. Tai ta pati pasekmė kaip LL-80 („1 ėjimai“), tik priešinga kryptimi: taisymas padarytas repokataloge, o į vaiką nenuėjo, ir niekas to nepranešė. Antroji to paties įrankio pusė: `.github/workflows/pages.yml` prie CSS/JS nuorodų prirašo `?v=<commit>`; jei vartai lygintų baitus be normalizavimo, **kiekvienas** sėkmingas publikavimas atrodytų kaip „pasenęs kodas“ (klaidingas signalas po kiekvieno deploy).
│ +- **Priežastis:** lyginamų failų sąrašas buvo sudarytas pagal klausimą „ką vaikas turi matyti“ (turinys), o ne „ką naršyklė įkelia ir vykdo“ (kodas). Vienas šaltinis buvo laikomas visuma: `content/` baitai sutampa ≠ svetainė tokia pati, nes piešimą, pažangą ir balsą atlieka `assets/js/**`. `?v=` žyma yra publikavimo mechanizmo dalis, o ne turinio skirtumas — be atskiro normalizavimo ji tą patį mechanizmą paverstų nuolatiniu klaidingu signalu.
│ +- **Taisyklė:** publikavimo vartai privalo lyginti **visą tai, ką naršyklė įkelia**, ne tik duomenis: `index.html`, `assets/js/**/*.js`, `assets/css/*.css` — ir sąrašą imti iš katalogų (kad nauja simuliacija atsirastų be įrankio pakeitimo), o ne rašyti ranka. Publikavimo mechanizmo prirašytos žymos (`?v=`, `#hash`) prieš lyginimą nuimamos, o pati versija perskaitoma ir parodoma atskirai. Nauja failų grupė, kurią svetainė įkelia (`manifest.json`, `404.html`), įtraukiama į tą patį sąrašą tame pačiame pakeitime, kuriame atsiranda.
│ +- **Patikra:** lokalūs veidrodžiai su `SUPRASK_LIVE_ROOT`, trys scenarijai per tą patį `main()` kelią: (A) `assets/js/sims/muzika.js` 23 121 B, repo 23 086 B → `PASENĘS KODAS`, `rc=1`; (B) to paties failo nėra → `NEPASIEKIAMI svetainės kodo failai`, `rc=1`; (C) failai tie patys, skiriasi tik `?v=3f05969b` → `rc=0`, `sutampa`, `live_version` rodoma kaip informacija. Tikra svetainė 2026-11-13: `shell_count` 17 failų, `live_version` `3d8f4782` = `HEAD`, `shell_stale` 0 — žymė neatpažįstama kaip defektas, o kodo skirtumas pagaunamas.
│ agents/log/publikavimo-agentas-2026-11-13T0623.md
│ @@ -0,0 +1,100 @@
│ +# Publikavimo agentas — paleidimas #257 (2026-11-13 06:20)
│ +
│ +## 1. `check_published.py` išvestis (paleista, ne iš atminties)
│ +
│ +```
│ +Repozitorija: 37 moduliai
│ +Paskelbta:    37 moduliai
│ +  · grade-01: repo 37, gyvai 37
│ +✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai,
│ +  svetainės kodas 17 failų, versija 3d8f4782).
│ +rc=0   (4,7 s)
│ +```
│ +
│ +Raktai: `missing_on_live` 0 · `hidden_locally` 0 · `not_in_path` 0 · `stale` 0 ·
│ +`stale_unknown` 0 · `aux_stale` 0 · `shell_stale` 0 · `shell_unreachable` 0 ·
│ +`path_differs` [] · `unpushed_commits` 0 · `live_error` tuščias · `verdict.label` = `sutampa`.
│ +
│ +**Būsena:** `HEAD` = `origin/main` = `3d8f4782` (`git rev-list --left-right --count
│ +origin/main...HEAD` → `0 0`); `git status --porcelain -uall` → 0 eilučių. Gyvas
│ +`index.html` neša `?v=3d8f4782`, t. y. pirmus 8 `HEAD` simbolius — svetainė pastatyta
│ +būtent iš šito commit'o, ne iš ankstesnio.
│ +
│ +## 2. Trys gyvi adresai (HTTP, tikra užklausa)
│ +
│ +| adresas | kodas | baitai |
│ +|---|---|---|
│ +| `content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json` | **200** | 8 812 |
│ +| `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` | **200** | 5 044 |
│ +| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | **200** | 4 946 |
│ +| `content/lt/grade-01/index.json` (papildomai) | 200 | 11 209 |
│ +| `assets/audio/lt/manifest.json` (papildomai) | 200 | 60 758 |
│ +
│ +## 3. A/B/C veidrodžiai — #255 palikimas uždarytas
│ +
│ +#255 paruošė tris veidrodžius, bet patikrų nepaleido. Šįkart paleistos per tą patį
│ +`main()` kelią (`SUPRASK_LIVE_ROOT`, `python3 -m http.server` 8976–8978):
│ +
│ +| scenarijus | kas suklastota | rezultatas |
│ +|---|---|---|
│ +| **A** `:8976` | `assets/js/sims/muzika.js` 23 121 B (repo 23 086 B) | `PASENĘS KODAS — naršyklė vykdo kitą failą (1)`, **rc=1** |
│ +| **B** `:8977` | to paties failo svetainėje nėra | `NEPASIEKIAMI svetainės kodo failai (1)`, **rc=1** |
│ +| **C** `:8978` | failai tie patys, tik `?v=3f05969b` žyma | `rc=0`, `sutampa`, `live_version` 3f05969b parodytas kaip informacija |
│ +
│ +Išvada: #253 įrankio pakeitimas veikia į abi puses — kodo skirtumą pagauna, o
│ +publikavimo žymos nepaverčia klaidingu signalu (be normalizavimo kiekvienas deploy
│ +atrodytų „pasenęs“). Nuo šiol apie tą pakeitimą galima rašyti „išmatuota“, ne „paruošta“.
│ +
│ +## 4. Naršyklė prieš gyvą bazę
│ +
│ +- `check_view.py --base https://one-man-company.github.io/suprask/ --module
│ +  25-ilgis-ir-vienetas --viewports phone,small` → 2 patikros (390/360 px), 0 problemų, rc 0.
│ +- `--module 03-sakinio-tvarka --viewports phone,small` → 2 patikros, 0 problemų, rc 0.
│ +
│ +## 5. Garsas
│ +
│ +- Manifestas 543 raktai; imtis `seed 257` (4 raktai × `n`/`s`) → **8/8** `200`, `ID3`,
│ +  14 462–51 869 B.
│ +- Struktūrinė patikra, kurios manifestas vienas nepajėgia: `git ls-files
│ +  'assets/audio/lt/*.mp3'` = **1086** ir diske = **1086**. Nė vienas įrašas netrackintas,
│ +  todėl manifeste esantis takas negali duoti 404 dėl `.gitignore` — šios klasės atskiro
│ +  vartų papildymo nereikia (manifesto baitai jau lyginami kaip `aux_stale`).
│ +
│ +## 6. Vartai
│ +
│ +- `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų, rc 0.
│ +- `check_docs_facts.py` → 0 klaidų, 0 įspėjimų (9 kryptys, 37 moduliai, 37 sim.,
│ +  161 užduotis, 543 garso tekstai, 1086 įrašai).
│ +- `404.html`: gyvas 200, 563 B, SHA-256 lygus repo failui (`3fbdd06f…`). Įrankis jo
│ +  nel ygina (į `SHELL_GLOBS` įeina tik `index.html`), bet skirtumo nėra — defekto
│ +  įrodymo neturiu, todėl įrankio neliečiau, tik užrašau ribą.
│ +
│ +## 7. Sprendimas
│ +
│ +**SUTAMPA.** Repo 37 / paskelbta 37, baitai ir seka sutampa, svetainės kodas (17 failų)
│ +sutampa, `pages.yml` žymė = `HEAD`, 5/5 HTTP 200, 4/4 naršyklės patikros švarios,
│ +8/8 garso imtis, visi vartai žali.
│ +
│ +Nieko nešalinau, ID nepernumeravau, `index.json` / `path.json` / `grades.json` / garso
│ … omitted 22 diff line(s) across 1 additional file(s)/section(s)
│ agents/log/publikavimo-agentas-2026-11-13T0623.md
│ @@ -66,7 +66,7 @@
│  - `check_docs_facts.py` → 0 klaidų, 0 įspėjimų (9 kryptys, 37 moduliai, 37 sim.,
│    161 užduotis, 543 garso tekstai, 1086 įrašai).
│  - `404.html`: gyvas 200, 563 B, SHA-256 lygus repo failui (`3fbdd06f…`). Įrankis jo
│ -  nel ygina (į `SHELL_GLOBS` įeina tik `index.html`), bet skirtumo nėra — defekto
│ +  nelygina (į `SHELL_GLOBS` įeina tik `index.html`), bet skirtumo nėra — defekto
│    įrodymo neturiu, todėl įrankio neliečiau, tik užrašau ribą.
│
│  ## 7. Sprendimas
│ agents/log/publikavimo-agentas-2026-11-13T0623.md
│ @@ -88,7 +88,7 @@
│
│  ## 9. Kas liko atvira (ne mano vaidmens)
│
│ -1. **`404.html` nel yginamas** `check_published.py`. Šiandien baitai sutampa, tad tai
│ +1. **`404.html` nelyginamas** `check_published.py`. Šiandien baitai sutampa, tad tai
│     teorinė spraga; jei kada skirsis, įrankis tylės. Taisyti verta tik tada, kai bus
│     įrodymas — kitaip tai būtų vartų plėtimas be defekto.
│  2. **#5190 / #5342 / #5400** (bėgiklio commit'o žinutė, worktree izoliacija, dokumentų
│ agents/state.json
│ @@ -71,9 +71,9 @@
│        "cadence": "pirmadieniais, ketvirtadieniais"
│      },
│      "publikavimo-agentas": {
│ -      "last_run": "2026-11-12T23:04:15",
│ -      "status": "published",
│ -      "log": "agents/log/publikavimo-agentas-2026-11-12T2301.md",
│ +      "last_run": "2026-11-13T06:23:00",
│ +      "status": "published",
│ +      "log": "agents/log/publikavimo-agentas-2026-11-13T0623.md",
│        "description": "Užtikrina, kad sukurtas turinys būtų paskelbtas ir neprarastų ankstesnių modulių",
│        "cadence": "kasdien 5 kartus (06:20, 11:40, 16:00, 19:30, 23:00)"
│      },
Paleidimas #257 baigtas. Sprendimas: **SUTAMPA**.

## `check_published.py` išvestis (paleista)

```
Repozitorija: 37 moduliai
Paskelbta:    37 moduliai
  · grade-01: repo 37, gyvai 37
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai,
  svetainės kodas 17 failų, versija 3d8f4782).
rc=0   (4,7 s)
```

Visi raktai tušti: `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `aux_stale` 0, `shell_stale` 0, `unpushed_commits` 0. `HEAD` = `origin/main` = `3d8f4782` (0/0), darbinė kopija švari, gyvas `index.html` neša `?v=3d8f4782` — svetainė pastatyta būtent iš šio commit'o.

## 3 gyvi adresai

- `matematika/25-ilgis-ir-vienetas.json` → **200** (8 812 B)
- `lietuviu-kalba/01-garsas-ir-raide.json` → **200** (5 044 B)
- `pasaulio-pazinimas/16-vandens-busenos.json` → **200** (4 946 B)
- papildomai: `index.json` 200 (11 209 B), `audio/manifest.json` 200 (60 758 B)

## Uždarytas #255 palikimas

A/B/C veidrodžiai pagaliau **išmatuoti**, ne tik paruošti: A (muzika.js 23 121 prieš 23 086 B) → `PASENĘS KODAS`, rc 1; B (failo nėra) → `NEPASIEKIAMI svetainės kodo failai`, rc 1; C (skiriasi tik `?v=` žymė) → rc 0, `sutampa`. Įrankio pakeitimas veikia į abi puses.

Papildomai: `check_view.py` prieš gyvą bazę 2 moduliams — 4 patikros, 0 problemų; garso imtis 8/8 HTTP 200 su ID3; 1086 mp3 trackinta = 1086 diske; `validate_content --grade 1 --strict` 0/0; `check_docs_facts` 0/0.

## Įrašyta

- `research/wiki/changelog.md` — įrašas 2026-11-13 (06:23), uždengia ir #255
- `research/wiki/guidelines/pamokos.md` — **LL-84** (vartai lygino tai, ką vaikas turėtų matyti, o ne tai, ką naršyklė vykdo; `?v=` žymė nėra turinio skirtumas)
- `agents/log/publikavimo-agentas-2026-11-13T0623.md` — ataskaita
- `agents/state.json` — `publikavimo-agentas` last_run/log atnaujinti

## Kas liko (sąžiningai)

1. `last_publish_check_257` bloko į `state.json` neįrašiau — baigėsi ėjimai; vaidmens įrašas atnaujintas, detalus blokas liko neužrašytas.
2. `404.html` nelyginamas `check_published.py` (`SHELL_GLOBS` turi tik `index.html`). Išmatavau: gyvas failas baitais lygus repo, tad defekto nėra — įrankio neliečiau, tik užrašiau ribą ataskaitoje. Vartų plėtimas be įrodymo būtų tas pats LL-39 šeimos nusidėjimas.
3. Veidrodžių serveriai 8975–8978 tebėra paleisti (scratch katalogas, ne repo) — reikia sustabdyti `process_manage`.
4. Ataskaitos ir changelog pakeitimai darbinėje kopijoje — commit'ina bėgiklis.

## klaidos

```
session_id: local-bbb1f00fd392d21ff9dcc57a0315ac4538b349a0591178f1b837f7a9372a6e43
```
