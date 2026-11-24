# publikavimo-agentas — 2026-11-24T1600

- paleidimas: #513 (manual)
- trukmė: 499s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/probe_path_order.py
│ @@ -155,24 +155,45 @@
│          # J. Tikras repo: užfiksuota seka egzistuoja, o path.json gali turėti
│          # naujų ID, įterptų sąmoningai (pagal AGENTS.md leidžiama, jei esama
│          # tvarka nesikeičia). Todėl tikrinama: visi užfiksuoti ID yra, nė vienas
│ -        # nepajudėtas, o kiekvienas papildomas įvardytas kaip įterptas. Skaičių
│ -        # lyginti negalima — po užfiksavimo (2026-11-23) kūrėjas į 1 klasę įdėjo
│ -        # 5 modulius, tad lygybė tapo neteisingu lūkesčiu, o raudoni vartai dėl
│ -        # teisingo darbo moko juos apeiti (LL-38 — slenkstis, nuslinkęs nuo duomenų).
│ +        # nepajudėtas, o kiekvienas papildomas **viduryje** įvardytas kaip
│ +        # įterptas. Skaičių lyginti negalima — po užfiksavimo (2026-11-23)
│ +        # kūrėjas į 1 klasę įdėjo 5 modulius, tad lygybė tapo neteisingu
│ +        # lūkesčiu, o raudoni vartai dėl teisingo darbo moko juos apeiti
│ +        # (LL-38 — slenkstis, nuslinkęs nuo duomenų).
│ +        #
│ +        # Lūkestis skaičiuojamas TOMIS PAČIOMIS taisyklėmis kaip įrankis:
│ +        # `inserted_midsequence()` matuoja **poziciją** (naujas ID prieš
│ +        # paskutinį seną), o ne aibės skirtumą. 2026-11-24 būtent čia zondas
│ +        # ir supuvo: 5 nauji ID, 4 jų viduryje, 1 gale, o lūkestis ėmė visą
│ +        # aibės skirtumą (5) — zondas tapo raudonas dėl teisingo repo, o kad
│ +        # jo niekas nepaleido CI, to niekas nematė (LL-182).
│          cp.PATH_ORDER = original
│          real_pin = json.loads(original.read_text(encoding="utf-8"))
│          real_seq = list((real_pin.get("grades") or {}).get("1", {}).get("sequence") or [])
│          path_seq = json.loads((ROOT / "content/lt/grade-01/path.json").read_text(encoding="utf-8"))["sequence"]
│          out = cp.path_order_check(1, path_seq)
│ -        expected_inserted = sorted(set(path_seq) - set(real_seq))
│ +        new_ids = [m for m in path_seq if m not in set(real_seq)]
│ +        pos = {m: i for i, m in enumerate(path_seq)}
│ +        last_old = max((pos[m] for m in real_seq if m in pos), default=-1)
│ +        expected_mid = [m for m in new_ids if pos[m] < last_old]
│ +        expected_tail = [m for m in new_ids if pos[m] > last_old]
│          check("J repo 1 klasės seka užfiksuota, seni ID nepajudėti",
│                bool(real_seq) and out["path_order_checked"] is True
│                and out["path_reordered"] == []
│ -              and sorted(out["path_inserted_midsequence"]) == expected_inserted
│ +              and sorted(out["path_inserted_midsequence"]) == sorted(expected_mid)
│                and set(real_seq) <= set(path_seq),
│                f"pin={len(real_seq)} path={len(path_seq)} "
│ -              f"įterpti={len(out['path_inserted_midsequence'])} "
│ +              f"viduryje={len(out['path_inserted_midsequence'])}/{len(expected_mid)} "
│ +              f"gale={len(expected_tail)} "
│                f"label={out['path_order_baseline'][:40]!r}")
│ +
│ +        # J2. Ta pati riba neigiamai: ID, prirašytas **gale**, neturi būti
│ +        #     įvardytas kaip įterptas į vidurį. Būtent šios dvi krūvos
│ +        #     sumaišymas ir padarė J raudoną (aibė ≠ pozicija).
│ +        check("J2 prirašytas gale nėra „įterptas į vidurį“",
│ +              all(m not in out["path_inserted_midsequence"] for m in expected_tail),
│ +              f"gale={expected_tail or '—'} "
│ +              f"viduryje={sorted(out['path_inserted_midsequence'])}")
│
│          # K. CI režimas `--path-order` (pasiūlymas #42399). Lyginama TIK su
│          #    užfiksuota seka: šviežiame klone `HEAD` yra darbinė kopija, tad
│ scripts/probe_path_order.py
│ @@ -87,6 +87,20 @@
│          check("C įterpimas viduryje matomas kaip inserted_midsequence",
│                out["path_reordered"] == [] and out["path_inserted_midsequence"] == ["a-99"],
│                f"reordered={out['path_reordered']} inserted={out['path_inserted_midsequence']}")
│ +
│ +        # B2. Riba, nuo kurios priklauso visas skirtumas: naujas ID **prieš**
│ +        #     paskutinį seną yra „viduryje“, **po** jo — „gale“. Be šio
│ +        #     lūkesčio J galėtų būti žalias ir tada, kai įrankis traktuoja
│ +        #     paskutinę poziciją kaip vidurį.
│ +        before_last = BASE[:-1] + ["a-98"] + BASE[-1:]
│ +        after_last = BASE + ["a-97"]
│ +        mid_out = cp.path_order_check(1, before_last)
│ +        tail_out = cp.path_order_check(1, after_last)
│ +        check("B2 riba prie paskutinio seno ID: prieš — viduryje, po — gale",
│ +              mid_out["path_inserted_midsequence"] == ["a-98"]
│ +              and tail_out["path_inserted_midsequence"] == [],
│ +              f"prieš={mid_out['path_inserted_midsequence']} "
│ +              f"po={tail_out['path_inserted_midsequence']}")
│
│          # D. Du gretimi seni ID sukeisti → raudona, įvardytas bent vienas.
│          swapped = BASE[:]
│ .github/workflows/validate.yml
│ @@ -8,6 +8,7 @@
│        - "assets/**"
│        - "scripts/**"
│        - "docs/**"
│ +      - ".github/**"
│        - "README.md"
│    pull_request:
│    workflow_dispatch:
│ .github/workflows/validate.yml
│ @@ -51,6 +51,21 @@
│        - name: Vidaus nuorodos
│          run: python3 scripts/check_refs.py
│
│ +      # Zondai. Kiekvienas `scripts/probe_*.py` yra paleidžiamas įrodymas, kad
│ +      # vartai aukščiau tikrai tą būseną mato (LL-36). Bet įrodymas, kurio
│ +      # nepaleidžia niekas, supūva taip pat tyliai, kaip docstringas: 2026-11-24
│ +      # `probe_path_order.py` tapo raudonas (17/18) dėl teisingo kūrėjo darbo —
│ +      # 5 nauji moduliai, 4 į vidurį, 1 į galą — ir to nematė niekas, nes CI šio
│ +      # žingsnio neturėjo (pasiūlymas #46733, LL-182). Ciklas ima **visus**
│ +      # `probe_*.py`: naujas zondas įsijungia be workflow pakeitimo. Sąlyga
│ +      # naujam zondUI: veikia be tinklo ir trunka < 5 s.
│ +      - name: Zondai (be tinklo)
│ +        run: |
│ +          for f in scripts/probe_*.py; do
│ +     

… PRALEISTA 2779 SIMBOLIŲ IŠ 20779 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00513/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

žfiksuotos sekos → ok false, ne tyli žalia), K5 (rc 0 / rc 1 — statusas pagal išėjimo kodą, LL-10), K6 (`subprocess.run` ir `urllib.request.urlopen` pakeisti į metančius `AssertionError`, o režimas vis tiek duoda rc 0 — įrodyta, kad git ir tinklas nepaliečiami). Aplinkos imitacija: `git clone --depth 1 file://…` → `--path-order` rc 0; tame pačiame klone commit'as, grąžinantis `07-elektronika` į 70 poziciją → rc **1** ir įvardytas `07-elektronika`. Jei kada nors vartai vėl pradės naudoti `HEAD`, K6 kris pirmas.
│ +- **Patikra:** `python3 scripts/probe_path_order.py` → **18/18**, rc 0, be tinklo **2026-11-23**; 2026-11-24 tas pats zondas buvo 17/18 dėl savo paties lūkesčio, o ne dėl vartų (žr. LL-182), po pataisymo — 20/20. Trys lūkesčiai būtent šiam defektui: K3 (nėra užfiksuotos sekos → ok false, ne tyli žalia), K5 (rc 0 / rc 1 — statusas pagal išėjimo kodą, LL-10), K6 (`subprocess.run` ir `urllib.request.urlopen` pakeisti į metančius `AssertionError`, o režimas vis tiek duoda rc 0 — įrodyta, kad git ir tinklas nepaliečiami). Aplinkos imitacija: `git clone --depth 1 file://…` → `--path-order` rc 0; tame pačiame klone commit'as, grąžinantis `07-elektronika` į 70 poziciją → rc **1** ir įvardytas `07-elektronika`. Jei kada nors vartai vėl pradės naudoti `HEAD`, K6 kris pirmas.
│
│  ## LL-161 — Sinchronizavimas su savo paties klaida: vartai skaičiuoja skaitmenis, o ne žodį
│
│ research/wiki/guidelines/pamokos.md
│ @@ -1294,3 +1294,10 @@
│  - **Priežastis:** terminas vartotas kaip savaime aiškus, nes autorius mato rėmelį ekrane ir žino, kad jis vadinamas dešimtuku. Modelio daiktas neturėjo **savo** vardo, o pasiskolino skaičiaus vardą — todėl vienas žodis ėmė žymėti ir kiekį, ir indą. Tai ne LL-34 (sąvoka išimta iš modulio, bet liko sim tekste) ir ne LL-23 (vyresnės klasės sąvoka): sąvoka amžių atitinka, tik jos referentas dviprasmis, o apibrėžimo sakinio nebuvo nė viename vaiko lauke. `check_language.py` matuoja sakinio ilgį, `validate_content.py` — schemą; nė vienas nelygina, ar žodis, kuriuo modulis vadina daiktą, apskritai paaiškintas.
│  - **Taisyklė:** jei modelyje yra daiktas, kurio vardas sutampa su kasdieniu skaičiaus ar mato vardu (dešimtukas, šimtukas, tuzinas, pora), pirmas vaikui skirtas sakinys jį apibrėžia **per savybę**, o ne per tapatybę: „Dešimtukas turi dešimt langelių.“ Apibrėžimas rašomas prieš pirmą užduotį, kurioje vaikas prašomas tame daikte ką nors skaičiuoti, ir prieš pirmą `why`, kuriame daiktas minimas kilmininku („dešimtukui trūksta“). Jei daikto negalima apibrėžti vienu sakiniu, jis pervadinamas („rėmelis“), o skaičius lieka skaičiumi.
│  - **Patikra:** grep visuose vaiko laukuose (`title`, `subtitle`, `outcomes`, `concept.*`, `tasks[].q/options/hint/why`, `reflect`, `sim.config`) dėl termino, kuris tame pačiame modulyje vartojamas ir su skaičiaus reikšme (šalia „iki dešimties“, „dešimt“, „15“), ir su daikto reikšme („į dešimtuką“, „dešimtuke“, „dešimtuką“). Jei abi reikšmės yra, ieškoma pirmo sakinio, apibrėžiančio daiktą per savybę („turi“, „yra … langelių“), ir jis turi būti **anksčiau** už pirmą daikto reikšmę užduotyje. Šiame modulyje po pataisymo: 5 daikto reikšmės (`steps[0]`, `steps[1]`, `tasks[0].q`, `tasks[1].hint`, `tasks[4]` `why`), visos po apibrėžimo `steps[0]`; skaičiaus reikšmės liko `big_idea`, `steps[2]`, `steps[3]`, `tasks[2]`.
│ +
│ +## LL-182 — Zondas, kurio lūkestis matuoja aibę, o įrankis poziciją — ir kurio niekas nepaleidžia
│ +
│ +- **Simptomas:** 2026-11-24 (#506) ataskaitoje parašyta „`probe_path_order.py` → 18/18, rc 0“, o tame pačiame commite (`d243804`) ta pati komanda duoda **17/18, rc 1**: „KLAIDA J repo 1 klasės seka užfiksuota, seni ID nepajudėti — pin=72 path=77 įterpti=4“. Repo buvo tvarkingas: 4 nauji moduliai įterpti į maršruto vidurį, 1 prirašytas gale, senų ID tvarka nepajudėta, o `check_published.py` ir jo CI režimas `--path-order` — žali. Taigi zondas kaltino teisingą darbą, o raudona būsena gyvavo nuo kūrėjo paleidimų #499–#505 iki šio paleidimo, nes `.github/workflows/validate.yml` (16 žingsnių) neturėjo nė vieno `probe_*.py` paleidimo (pasiūlymas #46733).
│ +- **Priežastis:** du sluoksniai. (A) J lūkestis buvo `sorted(set(path_seq) - set(real_seq))` — **aibės** skirtumas (5), o `inserted_midsequence()` matuoja **poziciją**: naujas ID, esantis prieš paskutinį užfiksuotą (4). Kol visi nauji ID buvo gale, abu dydžiai sutapdavo (0 = 0), tad klaida buvo nematoma; kai atsirado ir vidurinių, ir galinių, 4 ≠ 5 — ir zondas apkaltino repo, o ne save. (B) Zondas yra vartų įrodymas, bet ne vartai: jį paleisdavo tik žmogus, todėl raudona būsena nebuvo niekam matoma, o ataskaita ją pavadino žalia. Tai LL-36 atmaina (įrodymas faile yra, bet jo niekas nevykdo ir niekas neperskaito) ir LL-38 giminaitis (lūkestis nuslinko nuo įrankio semantikos, kaip anksčiau — nuo duomenų).
│ +- **Taisyklė:** zondo lūkestis skaičiuojamas **to paties dydžio** semantika, kurią įrankis matuoja: pozicija — pozicija, aibė — aibė; riba tarp „vidurio“ ir „galo“ turi savo atskirą lūkestį, o ne išvedama iš aibės. Ir kiekvienas `probe_*.py` paleidžiamas tuose pačiuose vartuose, kuriuos saugo (CI ciklas per `scripts/probe_*.py` glob'ą — naujas zondas įsijungia be workflow pakeitimo; sąlyga: be tinklo, < 5 s). Skaičius ataskaitoje leidžiamas tik tada, kai jį atkuria **viena komanda iš `HEAD`**, o ne iš to paties paleidimo atminties.
│ +- **Patikra:** `python3 scripts/probe_path_order.py` → **20/20**, rc 0, be tinklo: J (`viduryje=4/4 gale=1`), B2 (naujas ID prieš paskutinį seną — viduryje, po jo — gale), J2 (`34-dvizenklis-plius-dvizenklis` yra gale, tad negali būti „įterptas į vidurį“). Neigiama kontrolė: jei J lūkestis vėl imtų aibę, kris 4 ≠ 5; jei įrankis pradėtų galinį ID laikyti viduriu, kris B2 ir J2. CI imitacija: `bash -e -c 'for f in scripts/probe_*.py; do python3 "$f"; done'` → rc 0 (4 zondai: 15/15, 20/20, 22/22, 9/9, ~9 s). `validate.yml` po pakeitimo — 17 žingsnių, `push.paths` turi `.github/**`.
│ research/wiki/changelog.md
│ @@ -1,6 +1,15 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-24 (16:06) — Publikavimo patikra #513: repo 77 / paskelbta 77 prie `428ad5b5`, garsas 2 224/2 224 (vardai ir dydžiai 2 224/2 224); zondai įjungti į CI (#46733) ir pašalintas jų pačių raudonas lūkestis (LL-182); sutampa
│ +
│ +- **Būsena (`python3 scripts/check_published.py`, rc 0):** „Repozitorija: 77 moduliai / Paskelbta: 77 moduliai“ (`grade-01: repo 77, gyvai 77`); `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `missing_in_repo`, `live_missing`, `live_gone`, `stale*`, `aux_*`, `shell_*` — visi `[]`; `path_inserted_midsequence` 4 (`14-veikejas-pagal-teksta`, `41-augalo-dalys`, `08-avalynes-dziovinimas`, `09-austinis-ir-megztas-audinys` — įterpti į vidurį, leidžiama, įvardyta), `path_reordered` `[]`; garsas **2 224/2 224** (visi, ne mėginys), garso vardai **2 224/2 224** (vardo maišas = baitų maišas IR priekis = teksto maišas), garso dydžiai **2 224/2 224** (diskas = `Content-Length`); svetainės kodas 19 failų; `live_version` = `repo_version` = `428ad5b5`, `deploy_pending` false, `unpushed_commits` 0; pervedamas ID vienas ir sutvarkytas (`03-sakinio-tvarka` → `03-sakinio-zodziai`); `verdict` = „sutampa“.
│ +- **3 gyvi adresai (`curl`, HTTP kodas):** `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → **200**; `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` → **200**; `content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json` → **200**.
│ +- **Defektas — zondas, raudonas dėl teisingo repo (LL-182).** `scripts/probe_path_order.py` J tikrino `sorted(set(path_seq) - set(real_seq))` (aibės skirtumas, 5), o `inserted_midsequence()` matuoja poziciją (naujas ID prieš paskutinį užfiksuotą, 4): 5-asis (`34-dvizenklis-plius-dvizenklis`) prirašytas gale. Todėl HEAD'e (`d243804`) zondas davė **17/18, rc 1**, nors tvarka nepajudėta, o #506 ataskaita tą patį zondą pavadino „18/18“. Dabar J lūkestis skaičiuojamas pozicijomis, pridėti B2 (riba: naujas ID prieš paskutinį seną — viduryje, po jo — gale) ir J2 (galinis ID negali būti „įterptas į vidurį“): **20/20, rc 0**.
│ +- **Defektas — zondų niekas nepaleido (pasiūlymas #46733).** `.github/workflows/validate.yml` turėjo 16 žingsnių ir nė vieno `probe_*.py`, todėl aukščiau aprašyta raudona būsena gyvavo nuo #499–#505 ir buvo matoma tik žmogui paleidus ranka. Pridėtas žingsnis „Zondai (be tinklo)“, einantis per `scripts/probe_*.py` glob'ą (naujas zondas įsijungia be workflow pakeitimo; sąlyga — be tinklo, < 5 s), o `push.paths` papildytas `.github/**`, kad workflow pataisa pati paleistų patikrą.
│ +- **Vartai po pakeitimo:** `validate_content.py --grade 1 --strict` 0 klaidų / 0 įspėjimų; `check_registry.py` 0 problemų (index 77 · failai 77 · užduotys 339 · sim 77 · path 77 · našlaičiai 0); `check_refs.py` 27 nuorodos rc 0; `check_docs_facts.py` „Sutampa su failais“; `check_agents.py` rc 0; `check_lessons.py` 182 įrašai (nauja LL-182); CI imitacija `bash -e` per visus zondus — rc 0 (15/15, 20/20, 22/22, 9/9, ~9 s); `validate.yml` parsinamas (17 žingsnių).
│ +- **Sprendimas: sutampa.** 77/77 abiejose pusėse, visi modulių baitai ir 19 kodo failų lygūs, garsas 2 224/2 224 ir dydžiai 2 224/2 224, gyva versija = `HEAD` = `428ad5b5`, 0 neišstumtų commit'ų. Neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`; joks modulio ID nepernumeruotas, nieko nešalinta.
│
│  ## 2026-11-24 (11:54) — Publikavimo patikra #506: repo 77 / paskelbta 77 prie `8ab37d9e`, garsas 2 224/2 224 ir dydžiai 2 224/2 224; du tylūs žali uždaryti (git neatsakė → „patikrinta“; lūžęs indeksas paslėptas deduplikacijos), naujas zondas 22/22; sutampa
│
ĮGYVENDINTA: #46733

check_published.py (rc 0)
  Repozitorija: 77 moduliai / Paskelbta: 77 (grade-01: repo 77, gyvai 77)
  missing_on_live, hidden_locally, not_in_path, orphan_files, missing_in_repo, live_missing,
  live_gone, stale*, aux_*, shell_* — visi [] · path_reordered [] · path_inserted_midsequence 4
  (14-veikejas-pagal-teksta, 41-augalo-dalys, 08-avalynes-dziovinimas, 09-austinis-ir-megztas-audinys)
  garsas 2224/2224 · garso vardai 2224/2224 · dydžiai 2224/2224 · kodas 19 failų
  live_version = repo_version = 428ad5b5 · deploy_pending false · neišstumta 0
  verdict: „sutampa“

3 gyvi adresai (curl)
  content/lt/grade-01/matematika/04-skaiciu-tiese.json → 200
  content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json → 200
  content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json → 200

Sprendimas: sutampa. Modulių nepernumeravau, nieko nešalinau, git push nedariau.

KĄ PADARIAU (failai)
  .github/workflows/validate.yml — naujas žingsnis „Zondai (be tinklo)“, einantis per
  scripts/probe_*.py glob'ą (naujas zondas įsijungia be workflow pakeitimo), ir push.paths
  papildytas .github/**. Tai ir yra #46733 įgyvendinimas.
  scripts/probe_path_order.py — J lūkestis ėmė aibės skirtumą (5 nauji ID), o įrankio
  inserted_midsequence() matuoja poziciją (4: vienas ID prirašytas gale). Todėl HEAD'e
  (d243804) zondas davė 17/18 rc 1 dėl teisingo repo, nors #506 ataskaita jį pavadino „18/18“.
  Dabar: J skaičiuoja pozicijomis, B2 – riba prie paskutinio seno ID, J2 – galinis ID negali
  būti „įterptas į vidurį“. 20/20, rc 0 (matuota: senas lūkestis 5 ≠ 4, t. y. krisdavo).
  research/wiki/guidelines/pamokos.md — LL-182 (zondas, raudonas dėl teisingo darbo, ir jo
  niekas nepaleidžia) + LL-160 patikros eilutė pažymėta data (18/18 galiojo 11-23).
  research/wiki/changelog.md — įrašas „2026-11-24 (16:06) — Publikavimo patikra #513“.

VARTai PO PAKEITIMO
  validate_content --grade 1 --strict 0/0 · check_registry 0 problemų (index 77 · failai 77 ·
  užduotys 339 · sim 77 · path 77 · našlaičiai 0) · check_refs 27 nuorodos rc 0 ·
  check_docs_facts „Sutampa su failais“ · check_agents rc 0 · check_lessons 182 įrašai ·
  zondai: 15/15, 20/20, 22/22, 9/9, visi rc 0 · CI imitacija bash -e → rc 0 · validate.yml
  parsinamas (17 žingsnių) · check_published rc 0.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-c316e20eba10b65383b1785b48f8d35e8f03cbe993b86db2b2c6abb1ee85b50a
```
