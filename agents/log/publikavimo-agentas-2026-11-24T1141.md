# publikavimo-agentas — 2026-11-24T1141

- paleidimas: #506 (manual)
- trukmė: 991s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_published.py
│ @@ -743,20 +743,39 @@
│
│      Trečias reikšmės narys `checked` saugo nuo tylios „0 dingusių“: jei istorijos
│      perskaityti nepavyksta, tai nėra švarus rezultatas (LL-37/LL-10).
│ +
│ +    Kiekviena git užklausa tikrinama pagal **išėjimo kodą**, ne tik pagal
│ +    išvestį. `subprocess.run()` rūpestingai atspausdina klaidą, grąžindamas
│ +    tuščią `stdout`; iki #506 būtent taip atsitikdavo ne git kataloge arba be
│ +    `git` komandos — `revs` likdavo tuščias, o funkcija grąžindavo
│ +    `checked = True`. Tada `verdict()` sakydavo „dingusių ID patikra įvyko“,
│ +    nors nieko nebuvo perskaityta: pervadintas modulis būtų žalias, o vaiko
│ +    žyma liktų be modulio (LL-174 — įrankio nebuvimas nėra tuščias rezultatas).
│      """
│      path = f"content/lt/{grade_dir(grade)}/index.json"
│      note = ""
│      try:
│ -        shallow = subprocess.run(
│ +        probe = subprocess.run(
│              ["git", "rev-parse", "--is-shallow-repository"],
│              cwd=ROOT, capture_output=True, text=True, timeout=20,
│ -        ).stdout.strip()
│ -        if shallow == "true":
│ +        )
│ +        if probe.returncode != 0:
│ +            first = (probe.stderr or "").strip().splitlines()
│ +            return {}, ("git istorijos nepavyko perskaityti: "
│ +                        f"`git rev-parse` grąžino {probe.returncode}"
│ +                        + (f" ({first[0]})" if first else "")), False
│ +        if probe.stdout.strip() == "true":
│              return {}, "git istorija sekli — dingusių ID patikra neįmanoma", False
│ -        revs = subprocess.run(
│ +        log = subprocess.run(
│              ["git", "log", f"--max-count={HISTORY_LIMIT}", "--format=%h", "--", path],
│              cwd=ROOT, capture_output=True, text=True, timeout=120,
│ -        ).stdout.split()
│ +        )
│ +        if log.returncode != 0:
│ +            first = (log.stderr or "").strip().splitlines()
│ +            return {}, ("git istorijos nepavyko perskaityti: "
│ +                        f"`git log` grąžino {log.returncode}"
│ +                        + (f" ({first[0]})" if first else "")), False
│ +        revs = log.stdout.split()
│      except Exception as exc:  # noqa: BLE001
│          return {}, f"git istorijos nepavyko perskaityti ({type(exc).__name__})", False
│
│ @@ -764,20 +783,31 @@
│          note = f"istorija ribota iki {HISTORY_LIMIT} revizijų — senesni ID nepatikrinti"
│
│      seen: dict[str, str] = {}
│ +    unreadable = 0
│      for rev in revs:
│          try:
│ -            blob = subprocess.run(
│ +            show = subprocess.run(
│                  ["git", "show", f"{rev}:{path}"],
│                  cwd=ROOT, capture_output=True, text=True, timeout=30,
│ -            ).stdout
│ -            data = json.loads(blob)
│ +            )
│ +            if show.returncode != 0:
│ +                # Revizijoje indekso dar nebuvo arba jis ne JSON — tai
│ +                # atsakymas, todėl skaičiuojama, bet ne laikoma gedimu.
│ +                continue
│ +            data = json.loads(show.stdout)
│          except Exception:  # noqa: BLE001
│ -            continue  # revizijoje indekso dar nebuvo arba jis ne JSON
│ +            unreadable += 1
│ +            continue
│          for strand in data.get("strands", []):
│              for mod in strand.get("modules", []):
│                  mid = mod.get("id")
│                  if mid and mid not in seen:
│                      seen[mid] = rev
│ +    # `git log` rado revizijas, bet nė vienos nepavyko perskaityti: tai ne
│ +    # „istorijoje modulių nebuvo“, o nepavykusi patikra (LL-37).
│ +    if revs and not seen and unreadable == len(revs):
│ +        return {}, (f"git istorijos nepavyko perskaityti: nė viena iš "
│ +                    f"{len(revs)} revizijų neperskaityta"), False
│      return seen, note, True
│ … omitted 2 diff line(s) across 1 additional file(s)/section(s)
│ scripts/probe_publish_sets.py
│ @@ -0,0 +1,366 @@
│ +#!/usr/bin/env python3
│ +"""Zondas `check_published.py` aibių sprendimams — pakartojamas, be interneto.
│ +
│ +Kodėl šis failas egzistuoja (LL-36, LL-21). `check_published.py` docstring'e
│ +kelios neigiamos kontrolės cituojamos kaip `scratch/pubNNN/*.py`, o
│ +`git log --all -- scratch` rodo 0 commit'ų: tie failai niekada nebuvo repo,
│ +tad teiginį „zondas rodė taip“ skaitytojas turėjo priimti tikėjimu. Blogiausia
│ +ne tai, kad dokumentas neturi įrodymo, o tai, kad **nebuvo ko paleisti iš
│ +naujo** — regresija būtų likusi nepastebėta.
│ +
│ +Šis zondas stato laikiną repo (su tikru `git` ir `origin/main`, kad
│ +`unpushed()` ir istorijos patikra veiktų taip pat, kaip darbe) ir atskirą
│ +gyvos svetainės veidrodį, patiekiamą vietiniu `http.server`. Tada per patį
│ +`report()` tikrina sprendimus, nuo kurių priklauso vaiko pažanga:
│ +
│ +  A  sveika būsena → „sutampa“, rc 0 (kontrolinė; be jos neigiami atvejai
│ +     nieko neįrodytų);
│ +  B  gyvame indekse trūksta repo modulio → `missing_on_live`, rc 1, o tas
│ +     pats ID ne kartojamas kaip „pasenęs“ (LL-37 — vienas defektas, viena
│ +     eilutė);
│ +  C  gyvame indekse yra modulis, kurio repo nebėra → `hidden_locally`
│ +     („dingo iš repo“): tai vaidmens taisyklės „sustok ir pranešk“ atvejis —
│ +     vaiko žyma rodo į modulį, kurio daugiau niekas nekuria;
│ +  D  repo yra modulio failas be indekso įrašo → `orphan_files`
│ +     (publikavimas jį įkelia, o naršyklė jo niekada neprašo);
│ +  E  indeksas rodo į failą, kurio repo nėra → `missing_in_repo` (lūžęs
│ +     indeksas: publikavimas čia nieko nepakeis);
│ +  F  modulio failas gyvai 404, nors indeksas jį rodo → `live_missing`
│ +     (nepasibaigęs publikavimas, ne „bandyk dar kartą“);
│ +  G  pirma užklausa 503, antra 200 → žalia ir `RETRIES` skaičius matomas
│ +     (#368 teiginys „laikina klaida kartojama“, dabar paleidžiamas);
│ +  H  visada 503 → `unreachable`, o pranešimas sako „nepasiekiama“, ne
│ +     „nėra“ (#386/#388 atskyrimas);
│ +  I  ne git 

… PRALEISTA 23851 SIMBOLIŲ IŠ 41851 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00506/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

r vaikas modulio niekada negaus. Dabar `missing_in_repo` surašomas **be tinklo** iš `index.json` ir repo failų (dydžius baitų ciklas tik papildo).
│ +- **Defektas 3 — zondas, raudonas dėl teisingo darbo (LL-38).** `scripts/probe_path_order.py` J/K6 tikrino kietą „72 žingsniai“, o po to, kai 2026-11-24 į 1 klasę atėjo 5 moduliai (4 įterpti į vidurį), zondas tapo raudonas, nors tvarka nepajudėta. Dabar tikrinama „visi užfiksuoti ID yra, nė vienas nepajudėtas, papildomi įvardyti kaip įterpti“, o žingsnių skaičius imamas iš `path.json`.
│ +- **Teiginiai tapo paleidžiami (LL-36).** Docstring'e liko penkios nuorodos į `scratch/pubNNN/*.py`, kurių repo neturi (`git log --all -- scratch` → 0 commit'ų). Dabar tos vietos rodo į naują `scripts/probe_publish_sets.py`, o jis stato laikiną repo su tikru `git`, `origin/main` ir atskiru gyvos svetainės veidrodžiu (`http.server`) ir per `report()`/`verdict()`/`main()` tikrina A–M: sveika būsena (rc 0), `missing_on_live` (ir kad tas pats ID nekartojamas kaip „pasenęs“), `hidden_locally`, `orphan_files`, `missing_in_repo`, `live_missing`, 503→200 kartojimą, visada 503, ne git katalogą (rc 1), 404 klasės indeksą (`live_gone`, `published_measured` False) ir atkūrimą. Rezultatas: **22/22**, rc 0, be interneto, ~6 s.
│ +- **Vartai po pakeitimo:** `validate_content.py --grade 1 --strict` → 0 klaidų / 0 įspėjimų, rc 0; `check_registry.py` → „kryptys 9 · index 77 · failai 77 · užduotys 339 (optional 77) · sim 77 · path 77 · našlaičiai 0 / PROBLEMŲ: 0“; `check_docs_facts.py` → „Sutampa su failais.“; `check_agents.py` rc 0; `check_lessons.py` → **176** įrašai (naujos LL-175, LL-176); `probe_check_published.py` → 15/15; `probe_path_order.py` → 18/18; `probe_publish_sets.py` → 22/22; `check_published.py` rc 0.
│ +- **Nepadaryta ir pasakyta (LL-36):** naršyklės matavimo (360 px / 200 % teksto) šiame paleidime nėra — keisti tik `scripts/` ir du wiki failai, svetainės kodas nepaliestas, geometrijos neteigiu. `git push` nedarytas (bėgiklio darbas).
│ +- **Sprendimas: sutampa.** 77/77 abiejose pusėse, visi modulių baitai ir 19 kodo failų lygūs, garsas 2 224/2 224 ir dydžiai 2 224/2 224, gyva versija = `HEAD` = `8ab37d9e`, 0 neišstumtų commit'ų, joks modulio ID nepernumeruotas, nieko nešalinta. Neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `.github/workflows/**`.
│ +
│ +: šlapio bato forma fiksuojama džiūvimo pabaigoje; naujas pilotas P-023; nauja pamoka LL-170 dėl dvigubos `covered` eilutės
│
│  - **Kas pridėta:** `research/wiki/grades/01/metodai.md` — M-16 „Batas išdžius toks, koks džiūsta“ (1 kl. technologijos, tikslas `content/lt/grade-01/technologijos/08-avalynes-dziovinimas.json`): viena didelė idėja, programos pagrindas (23.2.2 `:9458–9468`, 9 skyriaus C3 `:40061`), 5 nuostatos su paneigimu, 5 žingsnių seka, simuliacijos specifikacija (config JSON, išvestinė `sag(content, stage)` / `outcome(content)` taisyklė, 10 būsenų lentelė, geometrija 360 px, fokasas LL-32, `api.progress` tik po mišraus rezultato), 4 užduotys (indeksai 1/0/1/1), 5 modelio ribos, 5 šaltiniai su DOI. Pasiūlymas — `agents/proposals/2026-11-24-metodininkas-avalynes-dziovinimas.json` (`type: metodas`, `priority: high`).
│  - **Kodėl:** programa avalynės priežiūrą įvardija atskirai, o `06-drabuziu-prieziura.json:98` ir `:85` ją sąmoningai palieka kitam moduliui; to modulio nėra (`ls` → 01, 02, 03, 06, 07; `grep -rin "avalyn" content/lt/grade-01/` → 3 eilutės, visos tame pačiame modulyje). Interaktyvumas reikalingas todėl, kad pasekmė yra laike (kol šlapia — kinta, kai sausa — ne), o paveikslas teparodo vieną būseną.
│ research/wiki/changelog.md
│ @@ -14,7 +14,7 @@
│  - **Nepadaryta ir pasakyta (LL-36):** naršyklės matavimo (360 px / 200 % teksto) šiame paleidime nėra — keisti tik `scripts/` ir du wiki failai, svetainės kodas nepaliestas, geometrijos neteigiu. `git push` nedarytas (bėgiklio darbas).
│  - **Sprendimas: sutampa.** 77/77 abiejose pusėse, visi modulių baitai ir 19 kodo failų lygūs, garsas 2 224/2 224 ir dydžiai 2 224/2 224, gyva versija = `HEAD` = `8ab37d9e`, 0 neišstumtų commit'ų, joks modulio ID nepernumeruotas, nieko nešalinta. Neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `.github/workflows/**`.
│
│ -: šlapio bato forma fiksuojama džiūvimo pabaigoje; naujas pilotas P-023; nauja pamoka LL-170 dėl dvigubos `covered` eilutės
│ +## 2026-11-24 (08:35) — Metodas M-16 (#498): šlapio bato forma fiksuojama džiūvimo pabaigoje; naujas pilotas P-023; nauja pamoka LL-170 dėl dvigubos `covered` eilutės
│
│  - **Kas pridėta:** `research/wiki/grades/01/metodai.md` — M-16 „Batas išdžius toks, koks džiūsta“ (1 kl. technologijos, tikslas `content/lt/grade-01/technologijos/08-avalynes-dziovinimas.json`): viena didelė idėja, programos pagrindas (23.2.2 `:9458–9468`, 9 skyriaus C3 `:40061`), 5 nuostatos su paneigimu, 5 žingsnių seka, simuliacijos specifikacija (config JSON, išvestinė `sag(content, stage)` / `outcome(content)` taisyklė, 10 būsenų lentelė, geometrija 360 px, fokasas LL-32, `api.progress` tik po mišraus rezultato), 4 užduotys (indeksai 1/0/1/1), 5 modelio ribos, 5 šaltiniai su DOI. Pasiūlymas — `agents/proposals/2026-11-24-metodininkas-avalynes-dziovinimas.json` (`type: metodas`, `priority: high`).
│  - **Kodėl:** programa avalynės priežiūrą įvardija atskirai, o `06-drabuziu-prieziura.json:98` ir `:85` ją sąmoningai palieka kitam moduliui; to modulio nėra (`ls` → 01, 02, 03, 06, 07; `grep -rin "avalyn" content/lt/grade-01/` → 3 eilutės, visos tame pačiame modulyje). Interaktyvumas reikalingas todėl, kad pasekmė yra laike (kol šlapia — kinta, kai sausa — ne), o paveikslas teparodo vieną būseną.
│ agents/proposals/2026-11-24-publikavimo-agentas-zondai-ci.json
│ @@ -0,0 +1,18 @@
│ +{
│ +  "role": "publikavimo-agentas",
│ +  "run_id": 506,
│ +  "created": "2026-11-24T11:58:00+02:00",
│ +  "type": "struktura",
│ +  "title": "Zondai niekada nepaleidžiami CI, todėl jie tyliai supuva: probe_path_order buvo raudonas HEAD'e",
│ +  "body": "Repo turi tris paleidžiamus zondus, kurie saugo publikavimo vartus (probe_check_published 15/15, probe_path_order 18/18, naujas probe_publish_sets 22/22), bet nė vienas `.github/workflows/validate.yml` žingsnis jų nepaleidžia — patikra, kad zondai patys neparūdijo, yra tik rankinė. Tai jau įvyko: 2026-11-24 kūrėjo paleidimai #499–#505 įdėjo į 1 klasę 5 modulius, o `probe_path_order.py` J/K6 tikrino kietą „72 žingsniai“; HEAD'e (c14fa66/8ab37d9e) `python3 scripts/probe_path_order.py` davė **16/18, rc 1** del teisingo darbo, ir to niekas nepastebėjo, nes CI zondo neskaito. Be to, būtent zondai yra vienintelis įrodymas, kad `check_published.py` būsenos (`hidden_locally`, `orphan_files`, `missing_in_repo`, `live_missing`, `live_gone`, retry 503→200) realiai įsijungia — be jų tie teiginiai lieka docstringo pažadas (LL-36). Siūloma: vienas `validate.yml` žingsnis „Zondai (be tinklo)“, paleidžiantis `scripts/probe_check_published.py`, `scripts/probe_path_order.py` ir `scripts/probe_publish_sets.py`; visi trys veikia be interneto ir be repo pakeitimų (laikini katalogai), bendra trukmė ~8 s, tad PR vartai nepailgėja pastebimai. Jei kuris zondas raudonas, PR krenta su įvardytu lūkesčiu, o ne po savaitės dokumente.",
│ +  "target": ".github/workflows/validate.yml",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "python3 scripts/probe_path_order.py (HEAD prieš šio paleidimo pataisymą) → 16/18, rc 1: „KLAIDA J repo 1 klasės seka užfiksuota ir sutampa — pin=72 path=77“, „KLAIDA K6 … 72 žingsniai — rc=0, išv… 77 žingsnių“",
│ +    "content/lt/grade-01/path.json — 77 įrašai; scripts/known_path_order.json — 72 (accepted_at 2026-11-23T15:40:00+02:00); 5 nauji ID atėjo #499–#505",
│ +    ".github/workflows/validate.yml — 16 žingsnių, nė vienas nekemša `probe_*.py` (grep `probe_` → 0 workflow eilučių)",
│ +    "scripts/probe_publish_sets.py → 22/22, rc 0, be interneto (šis paleidimas); scripts/probe_check_published.py → 15/15; scripts/probe_path_order.py → 18/18 po pataisymo",
│ +    "docs/SVIETIMAS-1-GAIRES.md §6 — modulis neskelbiamas, kol praeina vartus; research/wiki/guidelines/pamokos.md LL-36 (įrodymas turi būti paleidžiamas), LL-175/LL-176 (naujos šio paleidimo pamokos)"
│ +  ]
│ +}
SPRENDIMAS: **sutampa** (repo 77 / paskelbta 77, `verdict.label` = „sutampa“, rc 0)

check_published.py išvestis
  Repozitorija: 77 moduliai · Paskelbta: 77 (grade-01: repo 77, gyvai 77)
  Neišstumta commit'ų: 0 · gyva versija = repo HEAD = 8ab37d9e · deploy_pending false
  missing_on_live / hidden_locally / not_in_path / orphan_files / stale / live_missing /
  missing_in_repo / aux_stale / shell_stale — visi []
  seka: 77 žingsnių, senų ID tvarka nepajudėta, 4 nauji įterpti į vidurį (14-veikejas-pagal-teksta,
  41-augalo-dalys, 08-avalynes-dziovinimas, 09-austinis-ir-megztas-audinys) — leidžiama, įvardyta
  garsas: 2 224/2 224 pasiekiami, dydžiai 2 224/2 224 = Content-Length, vardai 2 224/2 224
  svetainės kodas 19 failų; pervadintas ID vienas ir sutvarkytas (03-sakinio-tvarka → 03-sakinio-zodziai)

3 gyvi adresai (curl)
  matematika/34-dvizenklis-plius-dvizenklis.json → 200 (7 802 B)
  lietuviu-kalba/03-sakinio-zodziai.json → 200 (5 459 B)
  assets/js/sims/matematika.js → 200 (232 781 B)
  neigiama kontrolė: matematika/99-nera.json → 404 · pasaulio-pazinimas/42-traumu-prevencija.json → 404
  (pastarasis — programos `target`, kurio repo dar nėra; įrašo index.json nėra, tad ir ne missing_on_live)

KĄ PADARIAU (failai)
  scripts/check_published.py — trys pataisymai:
  1) `historical_ids()` grąžindavo `checked = True`, kai git **neatsakė** (matuota: ne git katalogas →
     `({}, "", True)`, nors `git rev-parse` rc 128). Dingęs ID būtų likęs žalias, o vaiko žyma —
     našlaite. Dabar `git rev-parse` / `git log` / `git show` tikrinami pagal išėjimo kodą, o
     „revizijos rastos, nė viena neperskaityta“ = nepavykusi patikra.
  2) lūžęs indeksas (įrašas yra, failo repo nėra) buvo matuojamas tik baitų cikle, o tas praleidžia
     `missing_on_live` ID → defektas atrodė vien kaip „1 neskelbta“. Dabar `missing_in_repo`
     surašomas be tinklo iš index.json ir repo failų.
  3) docstringe penkios nuorodos į `scratch/pubNNN/*.py`, kurių repo neturi (git log --all -- scratch
     → 0 commit'ų), pakeistos į paleidžiamą zondą.
  scripts/probe_publish_sets.py (naujas, 22 lūkesčiai A–M, be interneto, ~6 s): laikinas repo su tikru
  git + origin/main ir atskiru gyvos svetainės veidrodžiu; tikrina per report()/verdict()/main():
  sveika (rc 0), missing_on_live, hidden_locally, orphan_files, missing_in_repo, live_missing,
  503→200, visada 503, ne git katalogas (rc 1), 404 klasės indeksas, atkūrimas.
  scripts/probe_path_order.py — J/K6 tikrino kietą „72 žingsniai“ ir po #499–#505 tapo raudoni dėl
  teisingo darbo (matuota HEAD'e: 16/18, rc 1); dabar tikrinama santykinė tvarka, o skaičius imamas
  iš path.json.
  research/wiki/guidelines/pamokos.md — LL-175 („įvyko“, kai įrankio nebuvo), LL-176 (defektas,
  paslėptas deduplikacijos).
  research/wiki/changelog.md — įrašas „2026-11-24 (11:54) — Publikavimo patikra #506“.
  agents/proposals/2026-11-24-publikavimo-agentas-zondai-ci.json — siūlymas paleisti tris zondus CI.

ĮRODYMAI
  probe_publish_sets 22/22 rc 0 · probe_check_published 15/15 · probe_path_order 18/18 ·
  check_published (numatytasis ir --path-order) rc 0 · validate_content --grade 1 --strict 0/0 ·
  check_registry 0 problemų (index 77 · failai 77 · užduotys 339 · sim 77 · path 77 · našlaičiai 0) ·
  check_docs_facts „Sutampa su failais“ · check_agents rc 0 · check_lessons 176 · check_audio pilnas.
  Shallow repo elgsena nepakito (checked False su „istorija sekli“), tikrame repo — checked True (78 istoriniai ID).

NEPADARYTA IR PASAKYTA
  Naršyklės matavimo (360 px / 200 %) nėra — keisti tik scripts/ ir du wiki failai, svetainės kodas
  nepaliestas, geometrijos neteigiu. git push nedarytas (bėgiklio darbas). Neliesta: content/**,
  assets/**, docs/**, AGENTS.md, .github/workflows/**; joks modulio ID nepernumeruotas, nieko nešalinta.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-7d1dd510000dd432ec673e382f62d0af0a6d87d54f16e76d2f1ceac28a85dd4d
```
