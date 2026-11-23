# publikavimo-agentas — 2026-11-23T1933

- paleidimas: #486 (manual)
- trukmė: 620s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_published.py
│ @@ -313,11 +313,25 @@
│    `07-elektronika`. Teigiama: numatytasis bėgimas → rc 0, 72/72, o sėkmės
│    eilutė pasako, su kuo lyginta.
│
│ +2026-11-23 (paleidimas #486, pasiūlymas #42399): tvarkos patikra perkelta į CI vartus.
│ +  #484 sukūrė matavimą, bet jis gyveno vien publikavimo agente, kuris paleidžiamas
│ +  **po** to, kai bėgikas išstūmė backlog'ą. #481 perkėlimas buvo rastas tik tada,
│ +  kai jau buvo svetainėje: beliko konstatuoti. Dabar yra `--path-order` režimas —
│ +  be tinklo, be `git show` (šviežiame CI klone `HEAD` **yra** darbinė kopija, tad
│ +  lyginimas su `HEAD` visada būtų žalias: tyli žalia, LL-37), lyginama išimtinai
│ +  su `scripts/known_path_order.json`. Su tuo pačiu failu lygina ir `.github/workflows/`
│ +  `validate.yml` žingsnis, todėl kūrimo commit'as, perstatantis esamą modulį,
│ +  krenta PR vartuose su įvardytu ID. Sąmoningas perstatymas lieka galimas: jis
│ +  keičia `known_path_order.json` tame pačiame commit'e ir matomas `git diff`.
│ +  Įrodymas repo: `scripts/probe_path_order.py` → **16/16** (K1–K4 — pats režimas,
│ +  įskaitant „nėra užfiksuotos sekos → rc 1, o ne žalia“).
│ +
│  Naudojimas:
│      python3 scripts/check_published.py               # žmogui
│      python3 scripts/check_published.py --json        # dashboard'ui
│      python3 scripts/check_published.py --grade 1     # viena klasė
│      python3 scripts/check_published.py --no-bytes    # greita: tik ID ir seka
│ +    python3 scripts/check_published.py --path-order   # be tinklo: tik maršruto tvarka (CI)
│      python3 scripts/check_published.py --audio-full  # tas pats kaip numatyta
│      python3 scripts/check_published.py --audio-sample 48   # greitas, aklas
│  """
│ scripts/check_published.py
│ @@ -903,6 +903,96 @@
│      out["path_reordered"] = reordered_ids(current_seq, base)
│      out["path_inserted_midsequence"] = inserted_midsequence(current_seq, base)
│      return out
│ +
│ +
│ +def path_order_gate(grade: int) -> dict:
│ +    """`--path-order` režimas: santykinė `path.json` tvarka be tinklo, CI vartams.
│ +
│ +    Kodėl atskiras režimas, o ne `--no-bytes`. Du dalykai jame neveikia CI:
│ +
│ +    1. tinklas — `report()` lygina su gyva svetaine, o PR vartuose svetainė
│ +       dar nerodo šio commit'o, tad atsakymas būtų apie praeitą publikavimą;
│ +    2. `git show HEAD:path.json` — šviežiame CI klone `HEAD` **yra** darbinė
│ +       kopija, tad `path_order_baseline()` fallback'as visada grąžintų
│ +       „sutampa“: vartai, kurie žali bet kokiu atveju, yra blogesni už jokių
│ +       (LL-37). Todėl čia lyginama **tik** su `scripts/known_path_order.json`,
│ +       o jei įrašo nėra — tai ne „tvarka gera“, o „neišmatuota“, ir rc 1.
│ +
│ +    `inserted_midsequence` lieka geltona ir rc nekeičia: naują modulį dėti prie
│ +    temos kaimyno yra teisinga, tik tai turi būti matoma pranešime, o ne
│ +    atrandama vaiko ekrane.
│ +
│ +    Grąžina dict su `ok` — vieninteliu lauku, kuriuo remiasi `main()`.
│ +    """
│ +    gd = grade_dir(grade)
│ +    out: dict = {
│ +        "grade": grade, "file": f"content/lt/{gd}/path.json", "ok": False,
│ +        "checked": False, "baseline": "", "reordered": [], "inserted": [],
│ +        "sequence_len": 0, "error": "", "note": "",
│ +    }
│ +    try:
│ +        seq = list(json.loads((CONTENT / gd / "path.json")
│ +                              .read_text(encoding="utf-8")).get("sequence", []))
│ +    except (OSError, json.JSONDecodeError) as exc:
│ +        # Neperskaitytas kelias nėra „tvarka gera“: be jo negalima pasakyti
│ +        # nieko apie vaiko „Tęsk nuo čia“. rc 1 ir priežastis žodžiais.
│ +        out["error"] = f"path.json neperskaitytas ({type(exc).__name__}: {exc})"
│ +        return out
│ +    out["sequence_len"] = len(seq)
│ +    if not seq:
│ +        out["error"] = "path.json seka tuščia"
│ +        return out
│ +
│ +    pin = pinned_sequence(grade)
│ +    if not pin:
│ +        out["note"] = ("nėra užfiksuotos sekos `scripts/known_path_order.json` — "
│ +                       "tvarka NEIŠMATUOTA (tai ne „nepajudėta“)")
│ +        return out
│ +
│ +    out["checked"] = True
│ +    out["baseline"] = pin["label"]
│ +    base = pin["seq"]
│ +    out["reordered"] = reordered_ids(seq, base)
│ +    out["inserted"] = inserted_midsequence(seq, base)
│ +    out["ok"] = not out["reordered"]
│ +    return out
│ +
│ +
│ +def path_order_main(grade: int, as_json: bool) -> int:
│ +    """Išveda `path_order_gate()` rezultatą žmogui arba JSON'u. rc 1 — raudona."""
│ +    grades = [grade] if grade else live_grades()
│ +    rows = [path_order_gate(g) for g in grades]
│ +    ok = all(r["ok"] for r in rows)
│ +    if as_json:
│ +        print(json.dumps({"ok": ok, "grades": rows}, ensure_ascii=False))
│ +        return 0 if ok else 1
│ +
│ +    for r in rows:
│ +        name = grade_dir(r["grade"])
│ +        if r["error"]:
│ +            print(f"MARŠRUTO TVARKA NEIŠMATUOTA — {name}: {r['error']}")
│ +            continue
│ +        if not r["checked"]:
│ +            print(f"MARŠRUTO TVARKA NEIŠMATUOTA — {name}: {r['note']}")
│ +            continue
│ +        if r["reordered"]:
│ +            print(f"SEKOS TVARKA PAJUDĖTA — {name}: {len(r['reordered'])} senų ID "
│ +                  f"santykinė tvarka skiriasi nuo {r['baseline']}: "
│ … omitted 18 diff line(s) across 1 additional file(s)/section(s)
│ scripts/check_published.py
│ @@ -1830,6 +1830,9 @@
│      ap.add_argument("--json", action="store_true")
│      ap.add_argument("--grade", type=int, default=0, help="tikrinti vieną klasę")
│      ap.add_argument("--no-bytes", action="store_true", help="greita: tik ID ir seka")
│ +    ap.add_argument("--path-order", action="store_true",
│ +                    help="be tinklo ir be git: tik maršruto tvarka prieš "
│ +                         "scripts/known_path_order.json (CI vartams)")
│      ap.add_argument("--audio-full", action="store_true",
│                      help="tikrinti visus garso įrašus (tai yra ir

… PRALEISTA 8715 SIMBOLIŲ IŠ 26715 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00486/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

u `HEAD`, būtų žali visada (ten `HEAD` **yra** darbinė
│  kopija). Todėl zondas tikrina ir rc, ir tai, kad be užfiksuotos sekos rezultatas
│ research/wiki/changelog.md
│ @@ -1,6 +1,21 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-23 (17:00) — Publikavimo patikra #486: repo 72 / paskelbta 72 prie `b43f208f`; maršruto tvarkos vartai perkelti į CI (pasiūlymas #42399), o ne tik į paleidimą po push; sutampa
│ +
│ +- **Būsena (`scripts/check_published.py`, `--json`, rc 0):** „Repozitorija: 72 moduliai / Paskelbta: 72 moduliai“ (`grade-01: repo 72, gyvai 72`); `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `stale`, `live_missing`, `missing_in_repo`, `aux_stale`, `aux_gone`, `shell_stale`, `shell_gone`, `shell_unreachable` — visi `[]`; `path_differs` `[]`, `path_reordered` `[]`, `path_inserted_midsequence` `[]`, `path_order_checked` true (`grade-01 scripts/known_path_order.json (2026-11-23T15:40:00+02:00)`), `shell_count` 19, garsas **2 096/2 096**, garso vardai **2 096/2 096**, `live_version` = `repo_version` = `b43f208f`, `deploy_pending` false, `unpushed_commits` 0 (`unpushed_checked` true), `bytes_checked` true, `verdict.label` = „sutampa“.
│ +- **Įgyvendintas #42399 — tvarka krenta PR vartuose, ne po push:** #484 sukūrė matavimą, bet jis gyveno publikavimo agente, kuris paleidžiamas **po** to, kai bėgikas išstūmė backlog'ą. Todėl #481 `07-elektronika` perkėlimas buvo rastas tik tada, kai jau buvo svetainėje, ir beliko konstatuoti. Dabar `scripts/check_published.py` turi `--path-order` režimą (be tinklo, be `git show`), o `.github/workflows/validate.yml` — žingsnį „Maršruto tvarka“ iškart po „Registrų sankirta“: `check_registry.py` lygina `path.json` **aibę**, šis žingsnis — senų ID **santykine tvarką**.
│ +- **Kodėl atskiras režimas, o ne `--no-bytes`:** CI klone `HEAD` **yra** darbinė kopija, tad `path_order_baseline()` fallback'as „lyginti su HEAD“ grąžintų „sutampa“ bet kokiu atveju — vartai, žali visada, yra blogesni už jokių (nauja **LL-160**). `--path-order` lygina išimtinai su `scripts/known_path_order.json`; jei įrašo nėra, rezultatas yra „NEIŠMATUOTA“ ir rc 1, o ne tyli žalia. Sąmoningas perstatymas lieka galimas: keičiamas `known_path_order.json` tame pačiame commit'e ir matomas `git diff`.
│ +- **Teiginys turi paleidžiamą įrodymą (LL-36):** `python3 scripts/probe_path_order.py` → **18/18**, rc 0, be tinklo. Buvę A–J (12) + nauji K1–K6: K1 užfiksuota seka = `path.json` → ok; K2 realus perstatymas (perkeltas `01-dovana-ir-noras` iš 40 į 3 poziciją) → ok false ir **įvardytas būtent jis**; K3 nėra užfiksuotos sekos → ok false; K4 nėra `path.json` → ok false su priežastimi, ne išimtis; K5 rc 0 / rc 1 (LL-10 — statusas pagal išėjimo kodą); K6 `subprocess.run` ir `urllib.request.urlopen` pakeisti į metančius `AssertionError` → rc 0, t. y. režimas tikrai nepaliečia nei git, nei tinklo.
│ +- **CI imitacija, ne prielaida:** šviežias `git clone --depth 1` (be istorijos, kaip actions/checkout) → `--path-order` rc 0, „72 žingsnių“. Tame pačiame klone atliktas commit'as, grąžinantis `07-elektronika` į 70 poziciją (tas pats judesys, kurį padarė #481) → rc **1**, „SEKOS TVARKA PAJUDĖTA … 1 senų ID …: 07-elektronika“. Taigi kūrimo commit'as, perstatinėjantis esamą modulį, dabar krenta PR vartuose su konkrečiu ID.
│ +- **3 realios gyvos patikros (HTTP kodai, `curl`):** `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → **200**; `content/lt/grade-01/pasaulio-pazinimas/23-ismestas-daiktas-nedingsta.json` → **200**; `content/lt/grade-01/technologijos/07-elektronika.json` → **200**; **neigiama kontrolė** `content/lt/grade-01/matematika/99-nera.json` → **404**.
│ +- **Vartai po pakeitimo:** `validate_content.py --grade 1 --strict` → 0 klaidų / 0 įspėjimų, rc 0; `check_registry.py` → „PROBLEMŲ: 0“; `check_docs_facts.py` → „Sutampa su failais.“; `check_agents.py` rc 0 (15 vaidmenų); `check_art.py` rc 0 (9 sims failai naudoja `art.js`); `check_lessons.py` → 160 įrašai (nauja LL-160); `check_language.py --grade 1 --strict` → „švarios“; `check_published.py --path-order` → rc 0.
│ +- **Nauja pamoka (LL-160):** „Vartai, kurie klonuotame CI lygina su savimi: žalia visada“ — `research/wiki/guidelines/pamokos.md`. Ji atskirta nuo LL-159 sąmoningai: LL-159 yra vartai, kurių **negalima uždaryti** (bazė juda kartu su pataisa), LL-160 — vartai, kurių **negalima atidaryti** (bazė klone sutampa su darbine kopija). Pataisa ta pati: bazė — užfiksuota sutartis, ne `HEAD`.
│ +- **Raudonas, bet NE šio darbo vartas:** `curriculum_backlog.py --check` → rc 1 („backlog.json pasenęs“). Priežastis trečią paleidimą iš eilės nepasikeitusi: `backlog.json` keistas `bf08958` (14:01), `curriculum/matematika-1-klase.md` — `973a2b9` (15:13, #483). Tai programos-derintojo generavimo žingsnis; jo nepaleidau (riba: nekeičiu `research/` turinio), tik įrašiau pasiūlymą `agents/proposals/2026-11-23-publikavimo-agentas-backlog-regeneravimas.json`. Svarbu dėl šio darbo: kol workflow raudonas dėl svetimos priežasties, naujo žingsnio signalas skęsta triukšme.
│ +- **Nepadaryta ir pasakyta (LL-36):** naršyklės matavimo (360 px / 200 % teksto) šiame paleidime nėra — `playwright` aplinkoje neįdiegtas. Šis darbas keitė tik `scripts/` ir `validate.yml`, tad geometrijos netikrinau ir to neteigiu.
│ +- **Sprendimas: sutampa.** 72/72 abiejose pusėse, 3/3 gyvi adresai `200` (+ neigiama kontrolė `404`), 0 neišstumtų commit'ų, joks modulio ID nepernumeruotas, nieko nešalinta. Neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`; simuliacijos ir CSS — ne šio vaidmens ribos.
│ +
│
│  ## 2026-11-23 (16:36) — Publikavimo patikra #485: repo 72 / paskelbta 72 prie `301cc047`, visi 72 modulių failai gyvai `200`, `pages.yml` žalias (34 s), garsas 2 096/2 096; `app.js` skirtumas — `?v=` injekcija, ne driftas; palaikyta
│
│ agents/proposals/2026-11-23-publikavimo-agentas-backlog-regeneravimas.json
│ @@ -0,0 +1,20 @@
│ +{
│ +  "role": "publikavimo-agentas",
│ +  "run_id": 486,
│ +  "created": "2026-11-23T19:45:00+02:00",
│ +  "type": "struktura",
│ +  "title": "`backlog.json` pasenęs trečią paleidimą: vartai, kurie raudoni dėl svetimo žingsnio, paslepia naujus vartus",
│ +  "body": "`python3 scripts/curriculum_backlog.py --check` grąžina rc 1 („backlog.json pasenęs (pasikeitė curriculum/*.md)“) jau trečią paleidimą iš eilės (#484, #485, #486). Priežastis išmatuota: `research/wiki/curriculum/backlog.json` paskutinį kartą keistas `bf08958` (14:01), o `research/wiki/curriculum/matematika-1-klase.md` — `973a2b9` (15:13, programos-derintojas #483). Tai reiškia, kad `.github/workflows/validate.yml` `validate` job'as šiandien baigiasi raudonai **nepriklausomai nuo to, ką atneša PR**, tad naujas žingsnis („Maršruto tvarka“, #42399) savo signalą praranda triukšme — o raudoni vartai, kurių negalima uždaryti teisingu veiksmu, moko juos apeiti (LL-159/LL-160 šeima). Siūloma: `curriculum_backlog.py --check` turėtų ne tik pasakyti „pasenęs“, bet ir įvardyti, kuris `curriculum/*.md` failas ir kuri data skiriasi, o CI žingsnis turėtų būti paleidžiamas taip, kad jo rezultatas būtų matomas net tada, kai kitas žingsnis jau krito (atskiras job'as arba `continue-on-error` su aiškiu žymesniu). Alternatyva, paprastesnė: PR, keičiantis `curriculum/*.md`, privalo tame pačiame commit'e turėti ir pergeneruotą `backlog.json` — tada generatoriaus niekas nepamiršta, o eilė agentams visada atitinka programą. Šio vaidmens riba — `scripts/` ir `.github/workflows/`, bet `research/wiki/curriculum/backlog.json` yra programos-derintojo generuojamas turinys, todėl pats jo nepaleidau.",
│ +  "target": "scripts/curriculum_backlog.py",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "python3 scripts/curriculum_backlog.py --check → rc 1 „KLAIDA: backlog.json pasenęs (pasikeitė curriculum/*.md)“ (2026-11-23 19:39)",
│ +    "git log --oneline -1 -- research/wiki/curriculum/backlog.json → bf08958 (2026-11-23 14:01)",
│ +    "973a2b9 — programos-derintojas #483 (15:13) pakeitė research/wiki/curriculum/matematika-1-klase.md",
│ +    ".github/workflows/validate.yml:41–42 — žingsnis „Programos padengties eilė“ krenta ir sustabdo job'ą prieš likusius žingsnius",
│ +    "research/wiki/changelog.md — ta pati priežastis užfiksuota #484 ir #485 įrašuose, ne kartą „sutvarkyta“",
│ +    "research/wiki/guidelines/pamokos.md LL-159, LL-160 — vartai, kurių negalima uždaryti / atidaryti teisingu veiksmu, moko juos apeiti",
│ +    "docs/SVIETIMAS-1-GAIRES.md T1.1 / T2.1 — modulio rezultatas turi būti susietas su programos pasiekimu, tad eilė turi būti iš programos, o ne iš pasenusio failo"
│ +  ]
│ +}
ĮGYVENDINTA: #42399

Sprendimas: **sutampa** (ir vartai sustiprinti — pasiūlymas #42399 perkeltas iš „po push“ į PR vartus).

check_published.py
```
Repozitorija: 72 moduliai
Paskelbta:    72 moduliai
  · grade-01: repo 72, gyvai 72
Sekos tvarka: 72 ID, lyginta su scripts/known_path_order.json (2026-11-23T15:40:00+02:00)
Garsas: 2096/2096 · Garso vardai: 2096/2096 (baitai ir tekstas)
Neišstumta commit'ų: 0 (patikra įvyko) · live_version = repo_version = b43f208f · deploy_pending false
✔ sutampa (missing_on_live / hidden_locally / not_in_path / stale / shell_* — visi [])
```

3 gyvi adresai (curl)
- content/lt/grade-01/matematika/04-skaiciu-tiese.json → 200
- content/lt/grade-01/pasaulio-pazinimas/23-ismestas-daiktas-nedingsta.json → 200
- content/lt/grade-01/technologijos/07-elektronika.json → 200
- neigiama kontrolė .../matematika/99-nera.json → 404

Ką pakeičiau
- scripts/check_published.py — naujas `--path-order` režimas (`path_order_gate`, `path_order_main`): be tinklo ir be `git show`, lygina **tik** su scripts/known_path_order.json; be užfiksuotos sekos → „NEIŠMATUOTA“ ir rc 1, ne tyli žalia. Priežastis dokumentuota: CI klone `HEAD` = darbinė kopija, tad HEAD fallback'as būtų žalias visada.
- .github/workflows/validate.yml — žingsnis „Maršruto tvarka“ iškart po „Registrų sankirta“ (check_registry matuoja aibę, šis — santykinę tvarką). YAML parsuotas: 15 žingsnių, validus.
- scripts/probe_path_order.py — 12 → **18/18** lūkesčių; K1–K6 dengia patį režimą, rc (0/1) ir tai, kad `subprocess.run`/`urlopen` nekvietimai (K6 įrodo: git ir tinklas nepaliečiami).
- CI imitacija realiame `git clone --depth 1`: teigiama → rc 0, 72 žingsniai; commit'as, grąžinantis 07-elektronika į 70 poziciją → **rc 1**, įvardytas 07-elektronika.
- research/wiki/changelog.md — įrašas „2026-11-23 (17:00) — Publikavimo patikra #486…“.
- research/wiki/guidelines/pamokos.md — nauja **LL-160** („vartai, kurie klonuotame CI lygina su savimi: žalia visada“), atskirta nuo LL-159 (ten — negalima uždaryti, čia — negalima atidaryti). check_lessons: 160 įrašai.
- agents/proposals/2026-11-23-publikavimo-agentas-backlog-regeneravimas.json — pasiūlymas (normal, target scripts/curriculum_backlog.py).

Vartai po pakeitimo: validate_content --grade 1 --strict 0/0 rc 0 · check_registry PROBLEMŲ 0 · check_docs_facts „Sutampa su failais“ · check_agents rc 0 (15 vaidmenų) · check_art rc 0 · check_lessons 160 · check_language --grade 1 --strict švaru · check_audio 2096/2096 rc 0 · probe_path_order 18/18 · check_published --path-order rc 0.

NEPADARYTA IR PASAKYTA
- `curriculum_backlog.py --check` → **rc 1** („backlog.json pasenęs“) trečią paleidimą iš eilės. Ne mano priežastis: backlog.json keistas bf08958 (14:01), matematika-1-klase.md — 973a2b9 (15:13, #483). Generatoriaus nepaleidau (research/wiki/curriculum — programos-derintojo sritis); užfiksuota changeloge ir pasiūlyme. Praktinė pasekmė šiam darbui: kol CI job'as raudonas dėl svetimo žingsnio, naujo žingsnio signalas skęsta, nors jis ir įvykdomas prieš tą žingsnį.
- Naršyklės matavimo (360 px / 200 %) nėra — playwright aplinkoje neįdiegtas; darbas keitė tik scripts/ ir validate.yml, todėl geometrijos neteigiu.

Neliesta: content/**, assets/**, docs/**, AGENTS.md; joks modulio ID nepernumeruotas, nieko nešalinta, git push nedarytas.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-6fd02ae8551f9630502291e32f26d3d9607a9e5f5f176076834e732daea56c65
```
