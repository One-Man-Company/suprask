# publikavimo-agentas — 2026-11-23T1601

- paleidimas: #484 (manual)
- trukmė: 1187s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_published.py
│ @@ -290,6 +290,7 @@
│  from __future__ import annotations
│
│  import argparse
│ +import bisect
│  import hashlib
│  import json
│  import os
│ scripts/check_published.py
│ @@ -688,6 +688,166 @@
│              "alias_ok": bool(successor) and alias == successor,
│          })
│      return {"items": items, "note": note, "checked": checked}
│ +
│ +
│ +def sequence_at(rel: str, rev: str) -> list[str] | None:
│ +    """`<rev>:<rel>` failo `sequence`; `None`, jei revizijoje jo nėra arba jis ne JSON.
│ +
│ +    `None` čia reiškia „nėra su kuo lyginti“, o ne „tuščia seka“ — tuščia seka
│ +    būtų teiginys apie turinį, kurio neperskaitėme (LL-37).
│ +    """
│ +    try:
│ +        blob = subprocess.run(
│ +            ["git", "show", f"{rev}:{rel}"],
│ +            cwd=ROOT, capture_output=True, text=True, timeout=30,
│ +        ).stdout
│ +        if not blob.strip():
│ +            return None
│ +        return list(json.loads(blob).get("sequence", []))
│ +    except Exception:  # noqa: BLE001
│ +        return None
│ +
│ +
│ +def path_order_baseline(grade: int, current_seq: list[str]) -> dict:
│ +    """Seka, su kuria lyginama **santykinė** `path.json` tvarka, ir jos šaltinis.
│ +
│ +    `not_in_path` ir `path_differs` atsako į klausimą „ar visi ID yra“ ir „ar
│ +    seka tokia pati kaip svetainėje“. Nė vienas nemato to, kas nutinka, kai
│ +    naujas modulis įterpiamas ne į pabaigą: aibė ta pati, o kiekvieno po jo
│ +    einančio žingsnio vieta pasislenka, tad vaiko „Tęsk nuo čia“ taškas tyliai
│ +    persikelia (gairės T3.6; AGENTS.md reikalavimas „esama tvarka nesikeistų“).
│ +
│ +    Bazė imama taip: jei darbinė `path.json` kopija skiriasi nuo `HEAD`, tai
│ +    **nepaskelbtas** pakeitimas — lyginama su `HEAD`. Kitu atveju pakeitimas,
│ +    kurį reikia įvertinti, yra paskutinis commit'as, palietęs šį failą, tad
│ +    lyginama su jo priešininke (`git log --max-count=2`). Pirmuoju atveju
│ +    nieko neprarandama, antruoju — nematuojama sena istorija, kuri jau buvo
│ +    patikrinta ankstesniais bėgimais.
│ +
│ +    Trečias raktas `checked` saugo nuo tylios „tvarka gera“: jei git istorijos
│ +    perskaityti nepavyksta, tai nėra švarus rezultatas, o `verdict()` apie tai
│ +    pasako atskirai (LL-37).
│ +    """
│ +    rel = f"content/lt/{grade_dir(grade)}/path.json"
│ +    out: dict = {"seq": [], "label": "", "checked": False, "note": ""}
│ +    try:
│ +        shallow = subprocess.run(
│ +            ["git", "rev-parse", "--is-shallow-repository"],
│ +            cwd=ROOT, capture_output=True, text=True, timeout=20,
│ +        ).stdout.strip()
│ +    except Exception as exc:  # noqa: BLE001
│ +        out["note"] = f"git neprieinamas ({type(exc).__name__}) — sekos tvarkos patikra neįmanoma"
│ +        return out
│ +    if shallow == "true":
│ +        out["note"] = "git istorija sekli — sekos tvarkos patikra neįmanoma"
│ +        return out
│ +
│ +    head = sequence_at(rel, "HEAD")
│ +    if head is None:
│ +        # Failo HEAD'e nėra: arba jis dar neįtrauktas, arba tai pirmas commit'as.
│ +        # Abiem atvejais nėra su kuo lyginti, ir tai yra išmatuotas faktas.
│ +        out["label"] = "HEAD (path.json istorijoje dar nėra)"
│ +        out["checked"] = True
│ +        return out
│ +    if head != current_seq:
│ +        out["seq"] = head
│ +        out["label"] = "HEAD (darbinė kopija dar nepaskelbta)"
│ +        out["checked"] = True
│ +        return out
│ +
│ +    try:
│ +        revs = subprocess.run(
│ +            ["git", "log", "--max-count=2", "--format=%h", "--", rel],
│ +            cwd=ROOT, capture_output=True, text=True, timeout=60,
│ +        ).stdout.split()
│ +    except Exception as exc:  # noqa: BLE001
│ +        out["note"] = f"path.json istorijos nepavyko perskaityti ({type(exc).__name__})"
│ +        return out
│ … omitted 88 diff line(s) across 1 additional file(s)/section(s)
│ scripts/check_published.py
│ @@ -1244,6 +1244,12 @@
│      if out["path_differs"]:
│          out["path_missing"] = [m for m in local_seq if m not in live_seq]
│          out["path_extra"] = [m for m in live_seq if m not in local_seq]
│ +    # Santykinė senų ID tvarka. Aibė gali būti teisinga (`not_in_path` 0), o
│ +    # žingsnių tvarka pajudėta — tada vaiko „Tęsk nuo čia“ rodo į kitą vietą,
│ +    # nors kiekvienas skaičius pranešime sutampa (AGENTS.md: „esama tvarka
│ +    # nesikeistų“; gairės T3.6). Matuojama prieš HEAD / paskutinį path.json
│ +    # commit'ą, ne prieš šiandieninį failą, nes kitaip skirtumo nebūtų.
│ +    out.update(path_order_check(grade, local_seq))
│
│      stale: list[dict] = []
│      stale_unknown: list[str] = []
│ scripts/check_published.py
│ @@ -1500,6 +1500,16 @@
│          "deploy_live_version": live_v,
│          "deploy_waited": deploy_waited,
│          "path_differs": [g["grade"] for g in per_grade if g.get("path_differs")],
│ +        # Santykinė `path.json` tvarka: atskiri sąrašai, nes taisymas kitas nei
│ +        # „įrašyk trūkstamą ID“ (`not_in_path`) ar „seka pasenusi“ (`path_differs`).
│ +        "path_reordered": merge("path_reordered"),
│ +        "path_inserted_midsequence": merge("path_inserted_midsequence"),
│ +        "path_order_baseline": "; ".join(
│ +            f"{grade_dir(g['grade'])}: {g['path_order_baseline']}"
│ +            for g in per_grade if g.get("path_order_baseline")),
│ +        "path_order_checked": all(g.get("path_order_checked", False) for g in per_grade),
│ +        "path_order_note": "; ".join(
│ +            g["path_order_note"] for g in per_grade if g.get("path_order_note")),
│          "unpushed_commits": len(unpushed_list),
│          "unpushed_checked": unpushed_ok,
│          "retried_requests": RETRIES["count"],
│ scripts/check_published.py
│ @@ -1615,6 +1615,11 @@
│          reasons.append(f"{len(data['missing_in_repo'])} indekso įrašas be failo repo")
│      if data.get("path_differs"):
│          reasons.append("kelio seka skiriasi")
│ +    # Senų ID tvarka pajudėta: kiekv

… PRALEISTA 31187 SIMBOLIŲ IŠ 49187 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00484/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

do patikra nepalūžo); `check_lessons.py` → 158 įrašai.
│  - **Nepadaryta ir pasakyta (LL-36):** naršyklės matavimo (360 px / 200 %) šiame paleidime nėra — `playwright` aplinkoje neįdiegtas, tas pats kaip #464/#480. Šis darbas keitė tik `scripts/` įrankius, tad geometrijos netikrinau ir to neteigiu.
│ +- **Rastas, bet NE mano taisomas vartų gedimas:** `python3 scripts/curriculum_backlog.py --check` → rc 1 („backlog.json pasenęs“). Priežastis ne šiame darbe: #483 (15:13) pakeitė `research/wiki/curriculum/matematika-1-klase.md`, o `backlog.json` paskutinį kartą keistas `bf08958` (`git log -- research/wiki/curriculum/backlog.json`). Tai programos-derintojo generavimo žingsnis, ne publikavimo; `curriculum/*.md` šiame paleidime neliesti (`git status --porcelain research/wiki/curriculum` tuščias), tad gedimas buvo prieš jį. Neužfiksuota kaip sutvarkyta.
│  - **Neliesta:** `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `.github/workflows/**`; joks modulio ID nepernumeruotas, nieko nešalinta, jokio `git push` iš agento. **Sprendimas: sutampa** (su užfiksuota tvarka).
│
│  ## 2026-11-23 (11:56) — Publikavimo patikra #480: repo 72 / paskelbta 72 prie `c1bc6ef1`, visi 72 modulių failai + `index.json` + `path.json` gyvai baitais lygūs, garsas 2 094/2 094 įrašų ir 1 047 tekstai be spragų, kortelės sutampa su moduliais 72/72; palaikyta
│ agents/proposals/2026-11-23-publikavimo-agentas-path-order-ci.json
│ @@ -0,0 +1,20 @@
│ +{
│ +  "role": "publikavimo-agentas",
│ +  "run_id": 484,
│ +  "created": "2026-11-23T16:25:00+02:00",
│ +  "type": "struktura",
│ +  "title": "Maršruto perstatymas turi būti raudonas prieš push, o ne po jo: check_published --path-order CI žingsnyje",
│ +  "body": "Šiandien patikra, kuri matuoja `path.json` santykinę tvarką, įgyvendinta (#41652) ir iškart rado realų atvejį: #481 perkėlė `07-elektronika` iš 70 į 48 poziciją, ir tai praėjo visus vartus, nes matuota buvo tik aibių sutaptis. Bet patikra gyvena publikavimo agente, kuris paleidžiamas po to, kai bėgikas jau išstūmė backlog'ą — t. y. defektas randamas tada, kai jis jau svetainėje, ir lieka tik konstatavimas. `validate.yml` šiandien paleidžia `validate_content.py`, `check_registry.py`, `check_docs_facts.py`, `curriculum_backlog.py --check`, `check_agents.py`, `check_art.py`, `check_lessons.py`, `check_language.py`, `check_audio.py` ir simuliacijų registro patikrą, bet nė vienas iš jų nelygina `path.json` su užfiksuota seka. Siūloma: pridėti į `check_published.py` režimą `--path-order` (be tinklo: skaito `content/lt/grade-XX/path.json` ir `scripts/known_path_order.json`, rc 1 jei `path_reordered` netuščias) ir vieną žingsnį `validate.yml`, kuris jį iškviečia. Tada kūrimo commit'as, kuris perstato esamą modulį, krenta PR vartuose su įvardytu ID, o ne tyliai perstumia vaiko „Tęsk nuo čia“ žingsnį. Sąmoningas perstatymas lieka galimas: jis keičia `scripts/known_path_order.json` tame pačiame commit'e ir tampa matomas `git diff`.",
│ +  "target": ".github/workflows/validate.yml",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "scripts/check_published.py — nauji laukai path_reordered, path_inserted_midsequence, path_order_checked (paleidimas #484)",
│ +    "scripts/known_path_order.json — užfiksuota 1 klasės seka (72 ID, accepted_at 2026-11-23)",
│ +    "scripts/probe_path_order.py — 12/12 lūkesčių, rc 0, be tinklo",
│ +    "git diff c1bc6ef 749f936 -- content/lt/grade-01/path.json — 07-elektronika perkeltas iš 70 į 48 poziciją (#481)",
│ +    ".github/workflows/validate.yml — nėra nė vieno žingsnio, kuris lygintų path.json su užfiksuota seka",
│ +    "docs/SVIETIMAS-1-GAIRES.md T3.6 — perėjimas tarp temų niekada nepraranda konteksto",
│ +    "research/wiki/guidelines/pamokos.md LL-159 — vartai, kurių bazė juda kartu su pataisa"
│ +  ]
│ +}
│ research/wiki/changelog.md
│ @@ -10,7 +10,7 @@
│  - **Bazė — užfiksuota seka, ne „vakarykštis failas“:** `scripts/known_path_order.json` (`sequence`, `accepted_at`, `note` kiekvienai klasei) — tos pačios rūšies įrankio duomenys kaip `known_renames.json`. Lyginti su paskutiniu commit'u būtų buvę paprasčiau, bet tada priimtas perstatymas liktų raudonas tol, kol kas nors vėl palies failą, ir vartai mokytų juos apeiti; užfiksuota seka keičiama sąmoningu, `git diff` matomu pakeitimu. Nauji moduliai gali būti pridedami gale be jokio failo keitimo (`reordered_ids()` lygina tik abiejose pusėse esančius ID).
│  - **Teiginys turi paleidžiamą įrodymą (LL-36):** `scripts/probe_path_order.py` → **12/12**, rc 0, be tinklo (laikinas sekos failas): A sutampa, B prirašymas gale, C įterpimas viduryje, D gretimų sukeitimas, E perkėlimas įvardytas tiksliai, F pašalinimas nėra perstatymas, G invariantas „pašalinus įvardytus ID tvarka atitinka ankstesnę“, H1–H3 ribos (nėra sekos / necommitintas pakeitimas / nėra nei sekos, nei HEAD), I sugadintas JSON, J tikras repo (72 = 72). **Neigiama kontrolė per patį įrankį:** `SUPRASK_PATH_ORDER=<perstatyta seka> check_published.py --no-bytes` → **rc 1**, `verdict` „1 senų ID tvarka pajudėta“, įvardytas `07-elektronika`; teigiama — rc 0.
│  - **3 realios gyvos patikros (HTTP kodai):** `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` → **200**; `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → **200**; `content/lt/grade-01/technologijos/07-elektronika.json` → **200** (šiandien perkeltas modulis); **neigiama kontrolė** `content/lt/grade-01/matematika/99-nera.json` → **404**; `index.json` ir `path.json` → **200**.
│ -- **Vartai po pakeitimo:** `validate_content.py --grade 1 --strict` → 0 klaidų / 0 įspėjimų, rc 0; `check_registry.py` → „kryptys 9 · index 72 · failai 72 · užduotys 316 (optional 72) · sim 72 · path 72 · našlaičiai 0 / PROBLEMŲ: 0“; `check_docs_facts.py` → 0/0; `check_agents.py` rc 0 (15 vaidmenų); `probe_check_published.py` → 10/10 (senoji garso vardo patikra nepalūžo); `check_lessons.py` → 158 įrašai.
│ +- **Vartai po pakeitimo:** `validate_content.py --grade 1 --strict` → 0 klaidų / 0 įspėjimų, rc 0; `check_registry.py` → „kryptys 9 · index 72 · failai 72 · užduotys 316 (optional 72) · sim 72 · path 72 · našlaičiai 0 / PROBLEMŲ: 0“; `check_docs_facts.py` → 0/0; `check_agents.py` rc 0 (15 vaidmenų); `probe_check_published.py` → 10/10 (senoji garso vardo patikra nepalūžo); `check_lessons.py` → 159 įrašai (nauja LL-159).
│  - **Nepadaryta ir pasakyta (LL-36):** naršyklės matavimo (360 px / 200 %) šiame paleidime nėra — `playwright` aplinkoje neįdiegtas, tas pats kaip #464/#480. Šis darbas keitė tik `scripts/` įrankius, tad geometrijos netikrinau ir to neteigiu.
│  - **Rastas, bet NE mano taisomas vartų gedimas:** `python3 scripts/curriculum_backlog.py --check` → rc 1 („backlog.json pasenęs“). Priežastis ne šiame darbe: #483 (15:13) pakeitė `research/wiki/curriculum/matematika-1-klase.md`, o `backlog.json` paskutinį kartą keistas `bf08958` (`git log -- research/wiki/curriculum/backlog.json`). Tai programos-derintojo generavimo žingsnis, ne publikavimo; `curriculum/*.md` šiame paleidime neliesti (`git status --porcelain research/wiki/curriculum` tuščias), tad gedimas buvo prieš jį. Neužfiksuota kaip sutvarkyta.
│  - **Neliesta:** `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `.github/workflows/**`; joks modulio ID nepernumeruotas, nieko nešalinta, jokio `git push` iš agento. **Sprendimas: sutampa** (su užfiksuota tvarka).
`ĮGYVENDINTA: #41652`

PUBLIKAVIMO PATIKRA #484 — rezultatas: **sutampa** (su užfiksuota ėjimo tvarka)

check_published.py (numatytasis, rc 0):
  Repozitorija: 72 moduliai / Paskelbta: 72 moduliai (grade-01: repo 72, gyvai 72)
  Neišstumta: 0 commit'ų · deploy_pending false · bytes_checked true
  live_version = repo_version = deploy_live_version = 973a2b9d · shell_count 19
  missing_on_live / hidden_locally / not_in_path / orphan_files / stale / stale_unknown /
  stale_unmeasured / live_missing / live_gone / missing_in_repo / aux_stale / aux_absent /
  aux_gone / shell_stale / shell_gone / shell_unreachable — visi []
  garsas 2096/2096 (sampled false) · garso vardai 2096/2096 (mismatch 0, text_mismatch 0)
  vanished_ids 1: 03-sakinio-tvarka → 03-sakinio-zodziai, resolved true, alias_ok true
  path_differs [] · path_reordered [] · path_inserted_midsequence [] · path_order_checked true
  verdict {"ok": true, "label": "sutampa"}

3 gyvi adresai (curl, HTTP kodai):
  200 content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json
  200 content/lt/grade-01/matematika/04-skaiciu-tiese.json
  200 content/lt/grade-01/technologijos/07-elektronika.json
  404 content/lt/grade-01/matematika/99-nera.json   (neigiama kontrolė)
  200 index.json · 200 path.json

KAS PADARYTA (failai, ne ataskaita)

scripts/check_published.py — `path.json` santykinė tvarka pagaliau matuojama. Iki šiol
`not_in_path` matavo aibę, `path_differs` — ar seka tokia pati kaip svetainėje; modulio
perkėlimas (visi skaičiai sutampa) praeidavo žalias, nors vaiko „Tęsk nuo čia“ persikeldavo
(gairės T3.6, AGENTS.md „esama tvarka nesikeistų“). Dabar: `path_reordered` (raudona,
minimali aibė — LIS papildinys: „pašalinus šiuos ID likusi tvarka atitinka ankstesnę“),
`path_inserted_midsequence` (geltona, įvardijama), `path_order_checked` (be jo būtų tyli
žalia), `verdict()` priežastis, sėkmės eilutė pasako, su kuo lyginta.

scripts/known_path_order.json — užfiksuota 1 klasės seka (72 ID) kaip sąmoninga sutartis,
tos pačios rūšies įrankio duomenys kaip `known_renames.json`. Bazė būtent tokia, o ne
„vakarykštis path.json“: priimtas perstatymas kitaip liktų raudonas tol, kol kas nors vėl
palies failą, ir vartai mokytų juos apeiti. Nauji moduliai gali būti pridedami gale be
jokio failo keitimo.

PIRMAS MATAVIMAS RADO REALŲ DEFEKTĄ: #481 (kurejas) perkėlė `07-elektronika` iš 70 į 48
poziciją (prie `01-elektros-grandine`) — `git diff c1bc6ef 749f936 -- content/lt/grade-01/path.json`.
Kūrėjo logas tai įvardija kaip sąmoningą (agents/log/kurejas-2026-11-23T1159.md:361), bet
įvyko kūrimo commit'e ir niekas to nepamatė. Perkėlimas jau paskelbtas, todėl **priimtas ir
užfiksuotas**, o ne atšauktas: atšaukimas vėl pajudintų tą patį žingsnį. Sprendimo klausimai
įrašyti research/wiki/guidelines/klausimai.md.

scripts/probe_path_order.py — įrodymas repo (LL-36): **12/12**, rc 0, be tinklo. Neigiama
kontrolė per patį įrankį: `SUPRASK_PATH_ORDER=<perstatyta seka> check_published.py --no-bytes`
→ rc 1, verdict „1 senų ID tvarka pajudėta“, įvardytas 07-elektronika; teigiama — rc 0.

research/wiki/changelog.md — įrašas „2026-11-23 (16:17) — Publikavimo patikra #484…“.
research/wiki/guidelines/pamokos.md — nauja **LL-159** („vartai, kurių bazė juda kartu su
pataisa: priimtas pakeitimas lieka raudonas amžinai“) — tai defektas, kurį radau savo
pirmoje implementacijoje ir pakeičiau prieš paleisdamas.
agents/proposals/2026-11-23-publikavimo-agentas-path-order-ci.json — pasiūlymas (normal,
target .github/workflows/validate.yml): perstatymas turi kristi PR vartuose, ne po push.
agents/proposals/2026-11-23-publikavimo-agentas-path-tvarka.json — statusas → done (tą patį
darbą įgyvendino #41652).

Vartai po pakeitimo: validate_content --grade 1 --strict 0/0 rc 0 · check_registry 9/72/72/
316(72)/72/72 našlaičiai 0 · check_docs_facts 0/0 · check_language 0 klaidų · check_agents
rc 0 (15 vaidmenų) · probe_check_published 10/10 (senoji patikra nepalūžo) · check_lessons
159 įrašai.

NEPADARYTA IR PASAKYTA
- Naršyklės matavimo (360 px / 200 %) nėra: playwright aplinkoje neįdiegtas. Šis darbas keitė
  tik scripts/ įrankius, tad geometrijos netikrinau ir to neteigiu.
- `curriculum_backlog.py --check` → rc 1 („backlog.json pasenęs“). Ne šio darbo priežastis:
  #483 pakeitė research/wiki/curriculum/matematika-1-klase.md, o backlog.json paskutinį kartą
  keistas bf08958; curriculum/*.md neliesti (git status tuščias toje srityje). Tai
  programos-derintojo generavimo žingsnis — neužfiksuota kaip sutvarkyta, įrašyta changeloge.

Neliesta: content/**, assets/**, docs/**, AGENTS.md, .github/workflows/**; joks modulio ID
nepernumeruotas, nieko nešalinta, git push nedarytas.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-313021cef931cf84da8271bea2109e052866ef2ce8752463133cb13c01a99812
```
