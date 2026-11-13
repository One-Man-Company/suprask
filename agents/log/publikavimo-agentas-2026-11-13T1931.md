# publikavimo-agentas — 2026-11-13T1931

- paleidimas: #273 (manual)
- trukmė: 264s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/probe273.py
│ @@ -0,0 +1,20 @@
│ +import json, re, pathlib
│ +
│ +root = pathlib.Path('/home/zoltanas/workspace/suprask')
│ +src = (root / 'scripts/add_optional_tasks.py').read_text(encoding='utf-8')
│ +keys = re.findall(r'^    "([0-9]{2}-[a-z0-9-]+)":', src, re.M)
│ +idx = json.loads((root / 'content/lt/grade-01/index.json').read_text(encoding='utf-8'))
│ +ids = [m['id'] for s in idx['strands'] for m in s['modules']]
│ +print('OPTIONAL raktai:', len(keys))
│ +print('moduliai:', len(ids))
│ +print('raktai be modulio:', [k for k in keys if k not in ids])
│ +print('moduliai be rakto:', [i for i in ids if i not in keys])
│ +print('dublikatai:', sorted({k for k in keys if keys.count(k) > 1}))
│ +bad = []
│ +for s in idx['strands']:
│ +    for m in s['modules']:
│ +        d = json.loads((root / 'content/lt' / m['file']).read_text(encoding='utf-8'))
│ +        n = sum(1 for t in d['tasks'] if t.get('optional'))
│ +        if n != 1:
│ +            bad.append((m['id'], n))
│ +print('moduliai be lygiai vienos optional:', bad)
│ agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json
│ @@ -0,0 +1,19 @@
│ +{
│ +  "role": "publikavimo-agentas",
│ +  "run_id": 273,
│ +  "created": "2026-11-13T19:40:00+02:00",
│ +  "type": "struktura",
│ +  "title": "Pervadintas modulis praranda vaiko pažangą: reikia alias žemėlapio, kurį skaito naršyklė",
│ +  "body": "Aštuonioliktame publikavimo patikros paleidime vartai rodo, kad repo ir gyva svetainė sutampa 39/39, o modulio 03-sakinio-tvarka žyma vaiko naršyklėje vis dar yra. Kai modulis pervadintas į 03-sakinio-zodziai, abi pusės pasikeitė kartu, tad publikavimo vartai buvo žali, o vaikas, kuris tą modulį jau buvo atlikęs, dabar mato jį kaip neatliktą ir jo darbo nebeatpažįsta. Tai ne kosmetika: gairių T3.5 ir T3.6 reikalauja, kad perėjimas neprarastų konteksto, o pažanga yra vienintelis platformos atminties sluoksnis. Siūlau dviejų dalių sprendimą. Pirma, index.json modulio įrašas gauna neprivalomą lauką renamed_from (masyvas senų ID), kuris keliauja su turiniu ir todėl jau yra paskelbtas be jokio papildomo failo. Antra, progress.js skaitymo kelyje (slot, get, count) senas ID pakeičiamas dabartiniu ir žyma perrašoma vieną kartą, kad ji nebūtų migruojama per kiekvieną puslapio atidarymą. Be to, projekto duomenų failas scripts/known_renames.json negali būti vienintelė vieta: jo svetainė neskaito, jis matomas tik vartams. Jei laukas atmetamas, reikia atskiro served failo content/lt/<klase>/aliases.json; tada KURINIO-STANDARTAS turi būti papildytas tuo pačiu pakeitimu, kad schema ir validatorius nesiskirtų.",
│ +  "target": "assets/js/progress.js + content/lt/grade-01/index.json (modulio įrašo laukas renamed_from)",
│ +  "priority": "high",
│ +  "status": "new",
│ +  "evidence": [
│ +    "assets/js/progress.js:31 — slot() saugo ir skaito žymą tik pagal modulio ID, jokio alias atvejo nėra; get():77 ir count():88–96 lygina tą patį raktą",
│ +    "assets/js/ — grep 'renamed|alias|sakinio-tvarka' teksto kode: 0 atvejų, t. y. naršyklė senojo ID net nepažįsta",
│ +    "scripts/known_renames.json — priimtas pervadinimas 03-sakinio-tvarka → 03-sakinio-zodziai (paleidimas #261), bet failas yra įrankio duomenys, ne served turinys",
│ +    "docs/SVIETIMAS-1-GAIRES.md:49 (T3.6) — perėjimas tarp klasių ir temų niekada nepraranda konteksto",
│ +    "docs/SVIETIMAS-1-GAIRES.md:48 (T3.5) — pažanga matoma vaikui paprastai (atlikta / ne)",
│ +    "research/wiki/changelog.md įrašas 2026-11-13 (16:40) — pasekmė įvardyta, bet nepaversta darbu"
│ +  ]
│ +}
│ agents/proposals/2026-11-13-publikavimo-agentas-add-optional-rakto-likutis.json
│ @@ -0,0 +1,18 @@
│ +{
│ +  "role": "publikavimo-agentas",
│ +  "run_id": 273,
│ +  "created": "2026-11-13T19:42:00+02:00",
│ +  "type": "struktura",
│ +  "title": "Praplėtimo užduočių įrankis tyliai praleidžia modulius: raktas į seną ID ir nė vieno pranešimo",
│ +  "body": "scripts/add_optional_tasks.py laiko užduotis žodyne pagal modulio ID. Šiandien tame žodyne yra 13 raktų, o modulių — 39, ir vienas raktas (03-sakinio-tvarka) rodo į ID, kurio nebėra nuo pervadinimo #261. Tai nėra šiandien matomas turinio defektas: kiekvienas 39 modulių jau turi lygiai vieną optional užduotį, tad validatorius žalias. Bet įrankis turi dvi tylėjimo formas. Pirma, raktas be modulio nieko neveikia ir niekas to nepraneša — po kiekvieno pervadinimo lieka vis daugiau neveikiančių raktų, o kitas žmogus, pridėjęs užduotį „senam“ moduliui, nematys, kad ji niekur nepateko. Antra, modulis be rakto tiesiog praleidžiamas — t. y. įrankis, kurio paskirtis užtikrinti gairių T3.4 (bent viena gilesnė užduotis), negali pasakyti, kuriems moduliams jos trūksta. Siūlau: (a) pakeisti raktą 03-sakinio-tvarka → 03-sakinio-zodziai (arba išimti, jei užduotis jau yra modulyje); (b) paleidus be --write, įrankis spausdintų tris aibes — raktai be modulio, moduliai be rakto, moduliai be optional užduoties — ir grąžintų rc 1, jei pirmoji arba trečioji netuščia. Taip tas pats įrankis tampa ataskaita, o ne vienkartiniu rašymu.",
│ +  "target": "scripts/add_optional_tasks.py",
│ +  "priority": "low",
│ +  "status": "new",
│ +  "evidence": [
│ +    "scripts/add_optional_tasks.py — OPTIONAL žodynas, 13 raktų; tarp jų 03-sakinio-tvarka",
│ +    "content/lt/grade-01/index.json — 39 modulių ID; 03-sakinio-tvarka tarp jų nėra, yra 03-sakinio-zodziai",
│ +    "scripts/known_renames.json — tas pats pervadinimas užregistruotas (paleidimas #261)",
│ +    "Patikra šiame paleidime: 39/39 moduliai turi lygiai vieną optional:true užduotį, todėl defektas latentinis, ne matomas",
│ +    "docs/SVIETIMAS-1-GAIRES.md:47 (T3.4) — kiekviename modulyje numatyta bent viena gilesnė užduotis"
│ +  ]
│ +}
│ scripts/check_published.py
│ @@ -578,7 +578,8 @@
│          print(f"Pervadinti ID, priimta ir užregistruota ({len(accepted)}):")
│          for v in accepted:
│              print(f"  - grade-{v['grade']:02d} {v['id']} → {v['successor']} "
│ -                  f"(žyma tam moduliui nebegalioja)")
│ +                  f"(registruota; žyma už seno ID vaiko naršyklėje LIEKA — "
│ +                  f"alias mechanizmo nėra, žr. agents/proposals/)")
│      if data.get("history_note"):
│          print(f"Dingusių ID patikros riba: {data['history_note']}")
│      if data["path_differs"]:
│ research/wiki/changelog.md
│ @@ -1,6 +1,16 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-13 (19:47) — Publikavimo patikra #273: 39/39 sutampa; vartai nustojo teigti, kad žyma „nebegalioja“
│ +
│ +- **Būsena:** `HEAD` = `origin/main` = `a7936290`, `git rev-list --left-right --count origin/main...HEAD` → `0 0`, darbinė kopija po darbo turi tik `scripts/check_published.py` (šio paleidimo taisymas) ir du naujus pasiūlymų failus. Gyvas `index.html` neša `?v=a7936290` — svetainė pastatyta iš šio commit'o (`live_version` = `repo_version`).
│ +- **`check_published.py`:** repo 39 / paskelbta 39 (`grade-01: repo 39, gyvai 39`); `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0, `aux_stale` 0, `shell_stale` 0, `shell_unreachable` 0, `path_differs` `[]`, `unpushed_commits` 0, `shell_count` 17, `verdict.label` = `sutampa`, `rc=0`. Modulių, `index.json`, `path.json`, `grades.json`, garso manifesto ir svetainės kodo baitai sutampa su gyvais.
│ +- **3 gyvi adresai:** `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → `200`; `…/lietuviu-kalba/03-sakinio-zodziai.json` → `200`; `…/pasaulio-pazinimas/16-vandens-busenos.json` → `200`.
│ +- **Ką keitė šis paleidimas:** `scripts/check_published.py:579–583` priimto pervadinimo eilutė skelbė „(žyma tam moduliui nebegalioja)“. Tai netiesa: `assets/js/progress.js:31` žymą saugo pagal modulio ID, `get():77` ir `count():88–96` lygina tą patį raktą, o `grep 'renamed|alias|sakinio-tvarka' assets/js` → 0 atvejų, t. y. naršyklė senojo ID net nepažįsta. Įrašas `scripts/known_renames.json` yra vartų sprendimas, ne pasekmės panaikinimas — dabar išvestis tai ir sako („žyma už seno ID vaiko naršyklėje LIEKA — alias mechanizmo nėra“), o `rc` ir `verdict` nepasikeitė. Nauja pamoka LL-89 (`guidelines/pamokos.md`).
│ +- **Eilės įrašai (pirmą kartą, po #271 ataskaitoje likusio pažado):** `agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json` (high, `progress.js` + `index.json` laukas `renamed_from`) ir `agents/proposals/2026-11-13-publikavimo-agentas-add-optional-rakto-likutis.json` (low, `scripts/add_optional_tasks.py`: 13 raktų 39 moduliams, vienas raktas — į jau nebeegzistuojantį `03-sakinio-tvarka`; 39/39 moduliai šiandien turi po lygiai vieną `optional` užduotį, tad defektas latentinis).
│ +- **Vartai:** `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų, `rc=0`; `check_docs_facts.py` → 0/0 (9 kryptys, 39 moduliai, 39 simuliacijos, 169 užduotys, 567 garso tekstai, 1 134 įrašai); `check_agents.py` → 15 vaidmenų, `rc=0`, 2 įspėjimai (abu seni).
│ +- **Sprendimas:** **sutampa**. Niekas nešalinta, ID nepernumeruoti, `index.json` / `path.json` / `grades.json` / garsas / turinys neliesti. Ataskaita `agents/log/publikavimo-agentas-2026-11-13T1947.md`.
│
│  ## 2026-11-13 (16:40) — Publikavimo patikra #272: repo 39 / paskelbta 39, trys nauji moduliai gyvai, pervadinimas matomas istorijoje
│
│ research/wiki/guidelines/pamokos.md
│ @@ -637,3 +637,11 @@
│  - **Taisyklė:** vartai, saugantys **tapatybę** (modulio ID, `path.json` seka, pažangos raktas), privalo turėti istorinį atskaitos tašką, ne tik dabartį: iš git istorijos surenkami visi kada nors buvę ID, o dabartiniame indekse nesantys pranešami su įpėdiniu. Sąmoningas pervadinimas registruojamas atskirame duomenų faile su įpėdiniu ir priežastimi; jei įpėdinio nėra — tai regresija, kuri rodoma raudonai. Nepavykusi istorijos patikra (sekli kopija, neperskaitomas failas) **negali** reikšti „0 dingusių“: tada vartai sako „nepatikrinta“ ir yra raudoni (LL-37/LL-10 šeima). Registracijos failas yra įrankio duomenys, ne turinio schema — bet jis nešalina pasekmės: kol svetainė neskaito alias žemėlapio, dingęs ID reiškia prarastą žymą, ir tai turi būti atskiras darbas, ne vartų išjungimas.
│  - **Patikra:** trys kryptys per tą patį `main()` kelią: (A) be registro → `rc=1` ir `DINGĘ ID — vaiko pažanga liko be modulio (1): grade-01 03-sakinio-tvarka (paskutinį kartą a2ad497)`; (B) įpėdinis, kurio indekse nėra (`99-nebera`) → `rc=1`; (C) su įrašytu įpėdiniu → `rc=0`, `vanished_ids[0].resolved = true`. Tikra svetainė 2026-11-13 (#272): `check_published.py` → `vanished_ids` 1 įrašas (`03-sakinio-tvarka` → `03-sakinio-zodziai`, `resolved: true`), `history_checked` `true`, `history_note` tuščias, `verdict.label` = `sutampa`, `rc=0`; gyvas senas adresas `…/03-sakinio-tvarka.json` → `404`, o vaiko žymos pasekmė suformuluota pasiūlymu atskirai.
│
│ +## LL-89 — Registro įrašas, kuris įspėjimą paverčia patikinimu: „žyma nebegalioja“, nors pasekmė liko
│ +
│ +- **Simptomas:** `check_published.py` po #271, radęs priimtą pervadinimą, spausdindavo `Pervadinti ID, priimta ir užregistruota (1): grade-01 03-sakinio-tvarka → 03-sakinio-zodziai (žyma tam moduliui nebegalioja)`. Tai netiesa: `assets/js/progress.js:31` (`slot(d, moduleId)`) saugo ir skaito žymą tik pagal modulio ID, `get():77` ir `count():88–96` lygina tą patį raktą, o `grep 'renamed\|alias\|sakinio-tvarka' assets/js` duoda 0 atvejų — naršyklė senojo ID net nepažįsta. Vaiko žyma senam ID liko taškais, kurių dabartinis modulis nerodo, o įrankio išvestis žmogui (ir kitam agentui) pasakė priešingai. Paleidimas #272, matydamas tą pačią būseną, changelog'e teisingai rašė „pasekmė, kuri lieka“, bet pasitikėjo įrankio skliaustais.
│ +- **Priežastis:** `scripts/known_renames.json` buvo sukurtas tam, kad **vartai** nebekeltų to paties įvykio antrą kartą. Registracijos faktas (`resolved: true`) reiškia „įpėdinis indekse yra, sprendimas peržiūrėtas“, o išvesties tekstas tą patį faktą performulavo kaip **pasekmės panaikinimą**. Tai ta pati šeima kaip LL-10 (`statusas pagal rezultatą, ne pagal išėjimo kodą`) ir LL-37 (`tyli riba`), bet nauja vieta: ne skaičius, o **sakinys šalia skaičiaus**, kurio niekas nematuoja. Jokia patikra nelygina „kg įrankis žada, kad nebegalioja“ su „ką served kodas iš tikrųjų daro“, todėl melagingas skliaustas gyveno per du paleidimus ir visus vartus.
│ +- **Taisyklė:** vartų išvestis gali registruoti **sprendimą**, bet negali skelbti, kad **pasekmė panaikinta**, jei to neįrodo served kodas. Priimto nukrypimo eilutė formuluojama taip, kad pasakytų, kas lieka: „registruota; žyma už seno ID vaiko naršyklėje LIEKA — alias mechanizmo nėra“. Kiekvienas žodis „nebegalioja“, „ištaisyta“, „sutvarkyta“ vartų išvestyje turi turėti atitikmenį, kurį galima `grep`-inti naršyklės kode; jei jo nėra, tai ne statusas, o ketinimas, ir vietą jam — `agents/proposals/`, ne spausdinama eilutė.
│ +- **Patikra:** `grep -rn 'renamed\|alias' assets/js` → 0 (alias mechanizmo nėra, taigi ir „nebegalioja“ neteisinga). Po taisymo `python3 scripts/check_published.py` → ta pati eilutė su „žyma už seno ID vaiko naršyklėje LIEKA — alias mechanizmo nėra, žr. agents/proposals/“, `verdict.label` = `sutampa`, `rc=0` (sprendimas nepakito, pasikeitė tik tai, ką jis teigia). Darbas, kuris pasekmę pašalintų, atskirtas: `agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json`.
│ +
│ +
│ agents/log/publikavimo-agentas-2026-11-13T1947.md
│ @@ -0,0 +1,108 @@
│ +# Publikavimo agentas — paleidimas #273 (2026-11-13T19:47+02:00)
│ +
│ +## 1. `check_published.py` išvestis (ne perfrazuota)
│ +
│ +```
│ +Repozitorija: 39 moduliai
│ +Paskelbta:    39 moduliai
│ +  · grade-01: repo 39, gyvai 39
│ +Pervadinti ID, priimta ir užregistruota (1):
│ +  - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai (registruota; žyma už seno ID
│ +    vaiko naršyklėje LIEKA — alias mechanizmo nėra, žr. agents/proposals/)
│ +✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai,
│ +  svetainės kodas 17 failų, versija a7936290).
│ +RC=0
│ +```
│ +
│ +Būsena po raktų: `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0,
│ +`stale` 0, `stale_unknown` 0, `aux_stale` 0, `shell_stale` 0,
│ +`shell_unreachable` 0, `path_differs` `[]`, `unpushed_commits` 0,
│ +`history_checked` `true`, `history_note` tuščias, `live_version` =
│ +`repo_version` = `a7936290`, `verdict.label` = `sutampa`. Gyvas `index.html`
│ +neša `?v=a7936290` — svetainė pastatyta būtent iš šio commit'o.
│ +
│ +Neišstumta commit'ų: **0** (`git rev-list --left-right --count origin/main...HEAD`
│ +→ `0	0`, `HEAD` = `origin/main` = `a7936290`).
│ +
│ +## 2. Trys gyvi adresai
│ +
│ +| adresas | kodas |
│ +|---|---|
│ +| `content/lt/grade-01/matematika/04-skaiciu-tiese.json` | 200 |
│ +| `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` | 200 |
│ +| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | 200 |
│ +
│ +## 3. Kiti vartai
│ +
│ +- `python3 scripts/validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų, rc 0.
│ +- `python3 scripts/check_docs_facts.py` → 0 klaidų, 0 įspėjimų (9 kryptys, 39 moduliai,
│ +  39 simuliacijos, 169 užduotys, 567 garso tekstų, 1 134 įrašai).
│ +- `python3 scripts/check_agents.py` → 15 vaidmenų, rc 0, 2 įspėjimai (abu seni:
│ +  sistemos-architektas be žurnalo įrašo; 9 sisteminiai pasiūlymai laukia >3 d.).
│ +
│ +## 4. Sprendimas: **SUTAMPA**
│ +
│ +Nieko nešalinta, joks ID nepernumeruotas, `index.json`, `path.json`, `grades.json`,
│ +garsas ir turinys neliesti. `hidden_locally` tuščias, `not_in_path` tuščias —
│ +taisyti `path.json` nereikėjo.
│ +
│ +## 5. Ką šis paleidimas vis dėlto pakeitė
│ +
│ +### 5.1. Įrankio išvestis, kuri teigė daugiau, nei žinojo (LL-89)
│ +
│ +`scripts/check_published.py` priimto pervadinimo eilutė skelbė
│ +„(žyma tam moduliui nebegalioja)“. Patikrinus served kodą:
│ +
│ +- `assets/js/progress.js:31` — `slot(d, moduleId)` saugo ir skaito žymą tik pagal modulio ID;
│ +- `get():77`, `count():88–96` — lygina tą patį raktą, jokio alias;
│ +- `grep -rn 'renamed\|alias\|sakinio-tvarka' assets/js` → **0 atvejų**, t. y. naršyklė
│ +  senojo ID net nepažįsta.
│ +
│ +Todėl teiginys buvo neteisingas, o `scripts/known_renames.json` yra **vartų sprendimas**,
│ +ne pasekmės panaikinimas. Pakeista viena spausdinama eilutė
│ +(`scripts/check_published.py:577–583`): dabar ji sako, kas lieka. `verdict` ir `rc`
│ +nepasikeitė — sprendimas tas pats, pasikeitė tik tai, ką jis teigia.
│ +
│ +### 5.2. Du eilės įrašai (skola iš #271)
│ +
│ +#271 ataskaitoje du pasiūlymai buvo suformuluoti, bet failai neįrašyti (LL-85 šeima).
│ +Šiame paleidime įrašyti:
│ +
│ +1. `agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json` (high) —
│ +   `renamed_from` modulio įraše + alias migracija `progress.js` skaitymo kelyje.
│ +   Įrodymas: `progress.js:31/77/88–96`, `grep` 0 atvejų, gairių T3.5/T3.6.
│ +2. `agents/proposals/2026-11-13-publikavimo-agentas-add-optional-rakto-likutis.json` (low) —
│ +   `scripts/add_optional_tasks.py`: 13 raktų 39 moduliams, vienas raktas
│ +   `03-sakinio-tvarka` rodo į nebeegzistuojantį ID, o įrankis tyli abiem kryptimis.
│ +   Defektas latentinis: 39/39 moduliai šiandien turi lygiai vieną `optional: true`
│ +   užduotį (patikrinta skriptu per visus `tasks`).
│ … omitted 30 diff line(s) across 1 additional file(s)/section(s)
│ agents/state.json
│ @@ -1226,5 +1226,33 @@
│      "proposal_out": "— (vienas paleidimas — vienas pasiūlymas; #44 siūloma uždaryti kaip įgyvendintą, eilės perrašymo klaida jau turi atvirą pasiūlymą 2026-11-07-kurejas-eile-grazina-igyvendintus.json)",
│      "log": "agents/log/kurejas-2026-11-09-44.md",
│      "published": "— (publikuoja bėgiklis)"
│ +  },
│ +  "last_publish_check_273": {
│ +    "date": "2026-11-13T19:47:00+02:00",
│ +    "run_id": 273,
│ +    "role": "publikavimo-agentas",
│ +    "head_sha": "a7936290",
│ +    "main_sha": "a7936290",
│ +    "unpublished_commits": 0,
│ +    "worktree": "prieš darbą švarus; po darbo — M scripts/check_published.py, ?? du pasiūlymų failai, research/wiki/changelog.md, research/wiki/guidelines/pamokos.md, agents/log/*.md",
│ +    "modules_local": 39,
│ +    "modules_live": 39,
│ +    "ids": "missing_on_live 0, hidden_locally 0, not_in_path 0, stale 0, stale_unknown 0, aux_stale 0, shell_stale 0, shell_unreachable 0, path_differs [] — rc 0",
│ +    "live_version": "a7936290 (repo HEAD a7936290); shell_count 17",
│ +    "vanished_ids": "1 įrašas — 03-sakinio-tvarka → 03-sakinio-zodziai, resolved true; history_checked true, history_note tuščias",
│ +    "http_codes": {
│ +      "matematika/04-skaiciu-tiese.json": "200",
│ +      "lietuviu-kalba/03-sakinio-zodziai.json": "200",
│ +      "pasaulio-pazinimas/16-vandens-busenos.json": "200"
│ +    },
│ +    "validated": "validate_content.py --grade 1 --strict 0/0 rc 0; check_docs_facts.py 0/0 (9 kryptys, 39 moduliai, 39 sim, 169 užduotys, 567 garso tekstų, 1134 įrašai); check_agents.py 15 vaidmenų rc 0, 2 įspėjimai (seni)",
│ +    "fix": "scripts/check_published.py:577–583 — priimto pervadinimo eilutė „žyma tam moduliui nebegalioja“ pakeista į „žyma už seno ID vaiko naršyklėje LIEKA — alias mechanizmo nėra“; verdict ir rc nepakito. Pagrindas: progress.js:31/77/88–96 saugo pagal modulio ID, grep 'renamed|alias|sakinio-tvarka' assets/js → 0 atvejų",
│ +    "proposal_out": "agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json (high, progress.js + index.json renamed_from); agents/proposals/2026-11-13-publikavimo-agentas-add-optional-rakto-likutis.json (low, add_optional_tasks.py — 13 raktų 39 moduliams, 03-sakinio-tvarka likutis)",
│ +    "new_lesson": "LL-89 — Registro įrašas, kuris įspėjimą paverčia patikinimu (research/wiki/guidelines/pamokos.md)",
│ +    "decision": "sutampa",
│ +    "changelog": "research/wiki/changelog.md — įrašas 2026-11-13 (19:47)",
│ +    "log": "agents/log/publikavimo-agentas-2026-11-13T1947.md",
│ +    "remaining": "Alias mechanizmo nėra — vaiko žyma už 03-sakinio-tvarka lieka be modulio, kol neįgyvendintas progreso-alias pasiūlymas. Dashboard'o kortelė nepaleista (ne šio vaidmens failas). 9 sisteminiai pasiūlymai laukia >3 d. — eilės klausimas.",
│ +    "notes": "Turinys, ID, index.json, path.json, grades.json, manifestas ir assets neliesti. Du pasiūlymų failai — skola iš #271, kur ataskaitoje suformuluoti, bet neįrašyti (LL-85). agents/state.json yra .gitignore."
│    }
│  }
## Sprendimas: SUTAMPA

**`check_published.py` išvestis (rc 0):**
```
Repozitorija: 39 moduliai
Paskelbta:    39 moduliai
  · grade-01: repo 39, gyvai 39
Pervadinti ID, priimta ir užregistruota (1):
  - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai (registruota; žyma už seno ID
    vaiko naršyklėje LIEKA — alias mechanizmo nėra, žr. agents/proposals/)
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai,
  svetainės kodas 17 failų, versija a7936290).
```
`missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `aux_stale` 0, `shell_stale` 0, `path_differs` [], `unpushed_commits` 0, `live_version` = `repo_version` = `a7936290`, `history_checked` true.

**3 HTTP kodai:** `matematika/04-skaiciu-tiese.json` → 200; `lietuviu-kalba/03-sakinio-zodziai.json` → 200; `pasaulio-pazinimas/16-vandens-busenos.json` → 200.

**Vartai:** `validate_content.py --grade 1 --strict` 0/0 rc 0; `check_docs_facts.py` 0/0 (9 kryptys, 39 moduliai, 39 sim, 169 užduotys, 567 garso tekstai, 1134 įrašai); `check_agents.py` 15 vaidmenų rc 0 (2 seni įspėjimai); `check_lessons.py` 89 įrašai rc 0.

### Ką pakeičiau
1. **`scripts/check_published.py:577–583`** — priimto pervadinimo eilutė skelbė „žyma tam moduliui nebegalioja“, o tai netiesa: `progress.js:31/77/88–96` saugo pagal modulio ID, `grep 'renamed|alias|sakinio-tvarka' assets/js` → 0 atvejų. Dabar eilutė sako, kas lieka. `verdict` ir `rc` nepakito.
2. **Du pasiūlymai (skola iš #271, LL-85 šeima):** `agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json` (high — `renamed_from` + alias migracija `progress.js`) ir `…-add-optional-rakto-likutis.json` (low — `add_optional_tasks.py`: 13 raktų 39 moduliams, vienas į nebeegzistuojantį `03-sakinio-tvarka`; 39/39 moduliai šiandien turi po vieną `optional`, tad latentinis).
3. **LL-89** `research/wiki/guidelines/pamokos.md`; **changelog** įrašas 2026-11-13 (19:47); **ataskaita** `agents/log/publikavimo-agentas-2026-11-13T1947.md`; **`agents/state.json`** → `last_publish_check_273`.

### Liko
- Alias mechanizmo nėra — vaiko žyma už `03-sakinio-tvarka` tebėra be modulio, kol neįgyvendintas aukščiau esantis pasiūlymas (platformos kodo darbas, ne publikavimo).
- Dashboard'o kortelė nepaleista (ne šio vaidmens failas).

Darbinėje kopijoje (bėgiklis komituos): `M research/wiki/changelog.md`, `M research/wiki/guidelines/pamokos.md`, `M scripts/check_published.py`, trys nauji failai. Turinys, ID, `index.json`, `path.json`, `grades.json`, manifestas ir `assets/` neliesti.

## klaidos

```
session_id: local-b3c2941be33c5adeafa3b656e994bdbcc1f73acd89ae46c6d48ae9ac931961d6
```
