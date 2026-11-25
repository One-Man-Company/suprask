# sistemos-architektas — 2026-11-25T2023

- paleidimas: #542 (manual)
- trukmė: 3486s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/curriculum_backlog.py
│ @@ -286,20 +286,52 @@
│              r["strand"] = _strand_for(r)
│      rows = enrich(rows, grade)
│
│ -    order = {"missing": 0, "partial": 1, "covered": 2}
│ -
│      def _merge(dst: dict, src: dict) -> None:
│ -        if order[src["status"]] < order[dst["status"]]:
│ -            dst["status"], dst["modules"] = src["status"], src["modules"]
│ +        """Sujungia DVI tos pačios programos pozicijos eilutes.
│ +
│ +        Būsena imama **geriausia**, o moduliai — **sąjunga**. Anksčiau čia
│ +        buvo imama blogesnė būsena ir kartu jos modulių sąrašas, todėl
│ +        padengties įrodymas buvo numetamas: 26.1.1 „traumų prevencija“ iš
│ +        spragų lentelės turėjo `covered` [`25-traumu-prevencija`,
│ +        `38-traumu-prevencija`], o 26.1.1 „Saugus elgesys“ iš žemėlapio —
│ +        `partial` [`08-metu-laikai`, `19-dumai-ir-isejimas`]; po sujungimo
│ +        likdavo `partial` BE įrodžiusių modulių, o `target` nukreipdavo į dar
│ +        vieną (trečią) traumų modulį. Kiekvienas agento promptas tą klaidingą
│ +        darbo užsakymą gaudavo kasdien.
│ +
│ +        Skirtingos būsenos nėra „triukšmas“: jos rodo, kad vienas šaltinis
│ +        (programos žemėlapis, spragų lentelė) atsiliko nuo repo. Todėl
│ +        prieštaravimas neužmaskuojamas — jis įrašomas į `stale_claim`, kad
│ +        žmogus ar programos derintojas matytų, kurią wiki eilutę reikia
│ +        atnaujinti, o agentas neitų statyti to, kas jau yra.
│ +        """
│ +        if _STATUS_ORDER[src["status"]] > _STATUS_ORDER[dst["status"]]:
│ +            dst["status"] = src["status"]
│ +        merged = list(dict.fromkeys((dst.get("modules") or []) + (src.get("modules") or [])))
│ +        if merged:
│ +            dst["modules"] = merged[:4]
│          if src.get("section") == "Ko platformoje nėra" and src.get("outcome"):
│              extra = src["outcome"]
│              if extra and extra not in (dst.get("gap") or ""):
│                  dst["gap"] = ((dst.get("gap", "") + " " + extra).strip()
│                                if dst.get("gap") else extra)
│ +        # Prieštaravimas: viena eilutė sako „nėra“, kita rodo modulį.
│ +        if dst["status"] == "covered" and dst.get("gap"):
│ +            dst.setdefault("stale_claim", dst["gap"])
│          for field in ("strand", "sritis", "outcome", "source", "level",
│                        "interactivity", "hours"):
│              if not dst.get(field) and src.get(field):
│                  dst[field] = src[field]
│ +
│ +    def _same_position(dst: dict, src: dict) -> bool:
│ +        """Ar dvi eilutės žymi TĄ PAČIĄ programos poziciją?
│ +
│ +        SKIRTINGI programos kodai yra skirtingos pozicijos, net jei temų
│ +        pavadinimai sutampa: sujungus juos dingtų viena pozicija iš eilės
│ +        („47 pozicijos“ taptų 46) ir niekas to nepastebėtų.
│ +        """
│ +        a, b = dst.get("key", ""), src.get("key", "")
│ +        return not (_CODE_RE.match(a) and _CODE_RE.match(b) and a != b)
│
│      # 1 praėjimas — pagal temos vardą („Saugus elgesys" iš žemėlapio ir iš
│      # spragų lentelės yra viena pozicija, net jei viena turi kodą, o kita ne).
│ scripts/curriculum_backlog.py
│ @@ -70,6 +70,15 @@
│  }
│
│  GRADE = 1
│ +
│ +# Programos pozicijos kodas (`26.1.1`). Skiria programos poziciją nuo temos,
│ +# kuri turi tik vardą (`C:saugus-elgesys`).
│ +_CODE_RE = re.compile(r"^\d+\.\d+\.\d+$")
│ +
│ +# Būsenų eilė: kuo didesnis, tuo daugiau įrodymo. Sujungiant dvi tos pačios
│ +# pozicijos eilutes imama DIDŽIAUSIA reikšmė, nes modulis repo yra faktas, o
│ +# wiki eilutė „nėra“ — tik teiginys, kuris gali būti pasenęs.
│ +_STATUS_ORDER = {"missing": 0, "partial": 1, "covered": 2}
│
│
│  def _slug(text: str) -> str:
│ scripts/curriculum_backlog.py
│ @@ -344,6 +344,8 @@
│
│      # 1 praėjimas — pagal temos vardą („Saugus elgesys" iš žemėlapio ir iš
│      # spragų lentelės yra viena pozicija, net jei viena turi kodą, o kita ne).
│ +    # Du SKIRTINGI kodai lieka dviem pozicijomis: temos vardas sutampa
│ +    # atsitiktinai, o sujungus eilė netektų vieno programos punkto.
│      by_name: dict[str, dict] = {}
│      for r in rows:
│          key = _slug(re.sub(r"^\d+\.\d+\.\d+\s*", "", r["topic"]))
│ @@ -351,16 +353,21 @@
│          if have is None:
│              by_name[key] = r
│              continue
│ +        if not _same_position(have, r):
│ +            by_name[f"{key}#{r['key']}"] = r
│ +            continue
│          _merge(have, r)
│
│      # 2 praėjimas — pagal kodą: numeruota pozicija nugali be kodo, o jei dvi
│      # eilutės turi tą patį kodą (26.1.1 „Saugus elgesys" / „traumų
│ -    # prevencija"), tai TA PATI programos pozicija — imame griežtesnę būseną
│ -    # ir vieną `target`, kad agentas negautų dviejų failų tam pačiam darbui.
│ +    # prevencija"), tai TA PATI programos pozicija — imame GERIAUSIĄ būseną su
│ +    # visais įrodytais moduliais ir vieną `target`, kad agentas negautų dviejų
│ +    # failų tam pačiam darbui. Blogesnė būsena čia nėra „saugesnė": ji siųsdavo
│ +    # kurti trečią modulį temai, kurią jau moko du (LL-199).
│      by_code: dict[str, dict] = {}
│      rest: list[dict] = []
│      for r in by_name.values():
│ -        if re.match(r"^\d+\.\d+\.\d+$", r["key"]):
│ +        if _CODE_RE.match(r["key"]):
│              have = by_code.get(r["key"])
│              if have is not None:
│                  _merge(have, r)
│ scripts/curriculum_backlog.py
│ @@ -298,27 +298,37 @@
│      def _merge(dst: dict, src: dict) -> None:
│          """Sujungia DVI tos pačios programos pozicijos eilutes.
│
│ -        Būsena imama **geriausia**, o moduliai — **sąjunga**. Anksčiau čia
│ -        buvo imama blogesnė būsena ir kartu jos modulių sąrašas, todėl
│ -        padengties įrodymas buvo numetamas: 26.1.1 „traumų prevencija“ iš
│ -        spragų lentelės turėjo `covered` [`25-traumu-prevencija`,
│ +        Būsena imama **geriausia**, o moduliai — TOS eilutės, kuri tą būseną
│ +        įrodė. Anksčia

… PRALEISTA 69319 SIMBOLIŲ IŠ 87319 (įrankių išklotinės) — visa ataskaita: agents/work/sistemos-architektas/00542/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

 šeima: taisymas, kuris gyvenime
│ +    teisingas, bet modeliui atrodo neteisingas).
│ +
│ +    Nurodytas #22168: pasiūlymas #19519 (metodas, tikslas
│ +    `22-medziai-krumai-zoles`) buvo duotas kūrėjui #347, nors tą patį modulį
│ +    jau sukūrė #346 (commit 4b411ea), o ideatoriaus tema #19399 jau buvo
│ +    `done`. Modulis vietoje ir visi vartai žali, tad vienintelis to paleidimo
│ +    trūkumas buvo tai, kad eilė to paties paprašė antrą kartą.
│
│      Priežastis: būseną `new` keičia trys vietos — `kurejas_queue.triage()`
│      (prieš eilės darbą), `mark_implemented()` (po publikavimo) ir
│ @@ -1201,6 +1207,8 @@
│      kad taisyklė negalėtų išsiskirti: du sluoksniai, skaičiuojantys tą patį
│      skirtingai, ir yra šio defekto priežastis.
│      """
│ +    if (kind or "").strip().lower() not in CREATION_TYPES:
│ +        return False, f"tipas „{kind}“ taiso esamą modulį, ne kuria naują"
│      paths = target_paths(target or "")
│      if not paths:
│          return False, "tikslas nenurodo failo kelio"
│ agents/run.py
│ @@ -1182,7 +1182,6 @@
│
│
│  def already_built(target: str, created: str, kind: str = "") -> tuple[bool, str]:
│ -    """Ar pasiūlymo tikslas JAU sukurtas po jo datos? → (taip/ne, įrodymas).
│
│      Taikoma TIK kūrimo pasiūlymams (`tema`, `metodas`), nes `kritika` ir `ux`
│      apie jau esamą modulį teisėtai turi egzistuojantį tikslą — jų darbas yra
│ agents/run.py
│ @@ -1182,6 +1182,7 @@
│
│
│  def already_built(target: str, created: str, kind: str = "") -> tuple[bool, str]:
│ +    """Ar pasiūlymo tikslas JAU sukurtas po jo datos? → (taip/ne, įrodymas).
│
│      Taikoma TIK kūrimo pasiūlymams (`tema`, `metodas`), nes `kritika` ir `ux`
│      apie jau esamą modulį teisėtai turi egzistuojantį tikslą — jų darbas yra
│ agents/run.py
│ @@ -170,6 +170,11 @@
│  # kaip pakeistas failas, 5 s gedimas atrodė kaip „paskelbta 1 failų“, o eilės
│  # apsauga („0 failų = ne bandymas“) niekada negalėjo suveikti.
│  LOG_PREFIX = "agents/log/"
│ +
│ +# Pasiūlymų tipai, kurie KURIA naują failą. Tik jiems galioja „jau sukurtas =
│ +# nebe darbas“ taisyklė; `kritika`, `ux` ir `atitiktis` apie esamą modulį turi
│ +# egzistuojantį tikslą teisėtai, nes jų darbas — jį taisyti (#22168).
│ +CREATION_TYPES = ("tema", "metodas")
│
│  # Laukimo užraktui ribos (#516). Viena bendra 900 s riba buvo trumpesnė už tai,
│  # ko laukiama: eilės vaidmens vienas darbas trunka iki 2098 s (p95, `runs.db`
│ scripts/kurejas_queue.py
│ @@ -129,6 +129,18 @@
│                                     "metodas panaudotas — modulis sukurtas po pasiūlymo")
│              obsolete += 1
│              continue
│ +
│ +        # Bendras kelias per `run.already_built()`: „tema“ ir „metodas“, kurių
│ +        # tikslas jau sukurtas PO prašymo datos, yra įgyvendinti. Anksčiau ši
│ +        # taisyklė buvo dvi vietos (`OBSOLETE_TYPES` čia ir `mark_implemented`
│ +        # po publikavimo), o tiesioginis `--proposal` paleidimas jos visai
│ +        # neturėjo — todėl #19519 kūrėjas statė antrą kartą (#22168).
│ +        if target and kind in runner.CREATION_TYPES:
│ +            built, why = runner.already_built(target, r.get("created") or "", kind)
│ +            if built:
│ +                db.set_proposal_status(int(r["id"]), "obsolete", f"jau įgyvendinta: {why}")
│ +                obsolete += 1
│ +                continue
│
│          if key in seen:
│              db.set_proposal_status(int(r["id"]), "obsolete", f"dubliuoja ##{seen[key]}")
│ agents/run.py
│ @@ -2024,6 +2024,22 @@
│              print(f"Pasiūlymas #{args.proposal} jau {proposal['status']} — praleista")
│              return 0
│
│ +        # #22168: tiesioginis paleidimas (`--proposal`, dashboard, rankinis) kaip
│ +        # tik eilė kviesdavo „ar tikslas jau sukurtas“. Eilės `triage()` čia
│ +        # nevykdoma, o `mark_implemented()` reikalauja pakeisto tikslo TAME
│ +        # PAČIAME commite — todėl jau padarytas darbas buvo statomas antrą
│ +        # kartą (kūrėjas #347 statė `22-medziai-krumai-zoles`, kurį jau sukūrė
│ +        # #346). Taisyklė ta pati (`already_built()`), kad abu keliai nesiskirtų.
│ +        if not args.publish_only:
│ +            built, why = already_built(proposal.get("target") or "",
│ +                                       proposal.get("created") or "",
│ +                                       proposal.get("type") or "")
│ +            if built:
│ +                db.set_proposal_status(int(proposal["id"]), "obsolete",
│ +                                       f"jau įgyvendinta: {why}")
│ +                print(f"Pasiūlymas #{args.proposal} jau įgyvendintas ({why}) — praleista")
│ +                return 0
│ +
│          # Klasė, kurią žmogus išjungė dashboard'e, nekuriama — net jei pasiūlymas
│          # jai jau buvo eilėje.
│          pg = grade_scope.grade_of_target(proposal.get("target") or "")
│ scripts/probe_already_built.py
│ @@ -0,0 +1,119 @@
│ +#!/usr/bin/env python3
│ +"""Zondas `run.already_built()` — paleidžiamas įrodymas (LL-36, #22168).
│ +
│ +Kodėl šis failas egzistuoja
│ +---------------------------
│ +2026-11-18 eilė davė kūrėjui #347 pasiūlymą #19519 (metodas, tikslas
│ +`22-medziai-krumai-zoles`), nors tą patį modulį jau sukūrė #346 (commit
│ +4b411ea), o ideatoriaus tema #19399 jau buvo `done`. Modulis buvo vietoje,
│ +visi vartai žali — vienintelis to paleidimo trūkumas buvo tai, kad eilė to
│ +paties paprašė antrą kartą. Kūrėjas, norėdamas nepadaryti žalos, turėjo
│ +rinktis tarp dublikato (gairių 4 klausimas — nedubliavimas) ir tuščio
│ +paleidimo, o eilė abiem atvejais liko tokia pati.
│ +
│ +Priežastis: būseną `new` keitė trys vietos, bet „ar jau padaryta“ tikrino tik
│ +`kurejas_queue.triage()` — eilės kelias. Tiesioginis `--proposal` paleidimas
│ +(dashboard, rankinis) tos patikros neturėjo, o `mark_implemented()` reikalauja
│ +pakeisto tikslo TAME PAČIAME commite, kurio jau padarytam darbui nėra.
│ +
│ +Zondas tikrina **abiem kryptimis**, nes taisyklė gali pakenkti dviem būdais:
│ +
│ +  A1 „tema“ su tikslu, sukurtu PO prašymo → laikoma įgyvendinta
│ +  A2 „metodas“ — taip pat (tai buvo tikrasis #22168 atvejis)
│ +  A3 „kritika“ su egzistuojančiu tikslu → NElaikoma įgyvendinta (ji taiso,
│ +     o ne kuria; be šito visos kritikos pastabos užsidarytų vien todėl,
│ +     kad failas yra)
│ +  A4 „ux“ — taip pat ne
│ +  A5 tikslo failo nėra → niekada ne „jau įgyvendinta“
│ +  A6 tikslas sukurtas PRIEŠ prašymą → ne „jau įgyvendinta“ (kritika gali
│ +     ateiti vėliau už modulį ir būti teisinga)
│ +  A7 tuščias / neįskaitomas tikslas ar data → saugus „ne“, ne klaida
│ +  A8 reali repo data: `22-medziai-krumai-zoles.json` su #19519 data → taip
│ +     (tai įrodo, kad taisyklė tikrai išsprendžia užregistruotą atvejį)
│ +
│ +Be tinklo. Naudoja `git log --diff-filter=A`, kuris veikia vietiniame repo;
│ +kai istorijos nėra (šviežias klonas be `.git`), grąžinama „ne“ su priežastimi,
│ +o ne klaida.
│ +
│ +Naudojimas:
│ +    python3 scripts/probe_already_built.py      # 0 — visi lūkesčiai išsipildė
│ +"""
│ +
│ +from __future__ import annotations
│ +
│ +import pathlib
│ +import sys
│ +
│ +HERE = pathlib.Path(__file__).resolve().parent
│ +ROOT = HERE.parent
│ +sys.path.insert(0, str(ROOT / "agents"))
│ +
│ +import run as runner  # noqa: E402
│ +
│ +results: list[tuple[str, bool, str]] = []
│ +
│ +
│ +def case(name: str, ok: bool, detail: str) -> None:
│ +    results.append((name, ok, detail))
│ +    print(f"{'✔' if ok else 'KLAIDA'} {name} — {detail}")
│ +
│ +
│ +def main() -> int:
│ +    real = "content/lt/grade-01/pasaulio-pazinimas/22-medziai-krumai-zoles.json"
│ +    # Data sąmoningai ankstyva: bet kuris repo modulis po jos yra „sukurtas po“.
│ +    early = "2026-11-01T00:00:00+02:00"
│ +    # Data, kuri yra po visų repo commit'ų — nieko negali būti sukurta po jos.
│ +    late = "2030-01-01T00:00:00+02:00"
│ +
│ +    got, why = runner.already_built(real, early, "tema")
│ +    case("A1 tema su vėliau sukurtu tikslu — įgyvendinta", got, why)
│ +
│ +    got, why = runner.already_built(real, early, "metodas")
│ +    case("A2 metodas — tas pats (#22168 atvejis)", got, why)
│ +
│ +    got, why = runner.already_built(real, early, "kritika")
│ +    case("A3 kritika NElaikoma įgyvendinta", not got, why)
│ +
│ +    got, why = runner.already_built(real, early, "ux")
│ +    case("A4 ux NElaikomas įgyvendintu", not got, why)
│ … omitted 41 diff line(s) across 1 additional file(s)/section(s)
ĮGYVENDINTA: #42019, #42779, #22168

## Ką radau

`system_report.py` prieš darbą: 170 paleidimų, sisteminių pasiūlymų **24**, `>3 d.` įspėjimų **9**, padengtis `45 padengta / 1 iš dalies / 1 be modulio`. Visos patikros buvo žalios — ir būtent tai buvo problema: `klausimai.md` tą patį įrašą kartojo tris paleidimus iš eilės, o nė vienas vartas jo nematė.

## Kas tikrai lūžo

`scripts/curriculum_backlog.py::_merge()` sąmoningai imdavo „griežtesnę“ būseną — bet **kartu su jos modulių sąrašu**. Todėl 26.1.1 pozicija, kurią jau mokė `25-traumu-prevencija` ir `38-traumu-prevencija` (`covered`), virsdavo `partial` su raktažodžių triukšmu (`08-metu-laikai`, `19-dumai-ir-isejimas`), o `target` siūlydavo statyti **trečią** traumų modulį. Kiekvienas agento promptas tą klaidingą užsakymą gaudavo kasdien.

Būsena ir įrodymas buvo laikomi vienu lauku, todėl „saugesnis“ pasirinkimas neišvengiamai naikino vienintelį faktą, kurį turėjo saugoti.

## Ką keičiau

- **`scripts/curriculum_backlog.py`** — būsena ir įrodymas atskirti; prieštaravimas įrašomas `stale_claim` su šaltinio eilute; sujungimas padarytas **simetrišku** (tvarka nekeičia rezultato); skirtingi programos kodai nesujungiami; `--check` dabar įvardija, **kuris** `curriculum/*.md` pasikeitė; `clear_stale_absence()` pašalina „nėra“ tekstą iš visų `covered` eilučių.
- **`agents/run.py` + `scripts/kurejas_queue.py`** — `already_built()` kaip vienas šaltinis abiem įėjimams (eilė ir `--proposal`), nes anksčiau taisyklė gyveno viename kelyje.
- **`research/wiki/curriculum/pasaulio-pazinimas-1-klase.md`** — šešios pasenusios eilutės pakeistos faktais.
- **`scripts/probe_backlog_merge.py`** (15 lūkesčių) ir **`scripts/probe_already_built.py`** (9) — paleidžiami įrodymai, įsijungia į CI per esamą `probe_*.py` ciklą.
- **`pamokos.md`** — LL-199 ir LL-200.

## Patikra

Padengtis `45/1/1` → **`46/0/1`**, pozicijų 47 → 47. `26.1.1`: `partial` + `target 42-…` → `covered`, `target` tuščias.

Neigiamosios kontrolės: `git show HEAD:scripts/curriculum_backlog.py` tame pačiame procese duoda `partial` + `42-traumu-prevencija.json`; #42019 radinys išlieka. `already_built()` su tikra #19519 data duoda „sukurtas 2026-11-18 10:04, po prašymo“; `kritika` ir `ux` su tuo pačiu tikslu — **ne** (kitaip visos kritikos pastabos užsidarytų vien todėl, kad failas yra).

Sisteminiai pasiūlymai **24 → 21**, `>3 d.` įspėjimai **9 → 8**, `new` **27 → 24**. 10 vartų rc 0, 7 zondai 111/111. Grafikai neliesti (ROLES nekeistas).

## Sąmoningai neliesta

`content/` ir `assets/js/sims/` — tai kūrėjo ir inžinieriaus darbas (#52972, #52974 turi tikslus moduliuose). `agents/scope.json` — žmogaus sprendimas. AGENTS.md ir kitų vaidmenų failai — neliesti.

## Neišspręsta

- **#5342** (worktree izoliacija, 17 d.) — seniausias, bet tai daugiaetapis darbas, kurio negalima padaryti vienu žingsniu: reikia `.venv` simbolinės nuorodos ir `before` nuotraukos perkėlimo į worktree.
- **21 sisteminis pasiūlymas** liko — jų nekėliau visų vienu metu.
- **`sistemos-architektas` 28 % nenaudingų** (2 iš 7 paleidimų baigėsi `exhausted` po 1221 ir 2741 s, 0 darbo failų). Tai ne vaidmens, o biudžeto problema: `build_prompt()` įterpia ~250 eilučių konteksto prieš bet kokį skaitymą. Sprendimas — konteksto išskaidymas arba dviejų fazių paleidimas — netilpo į šį paleidimą ir lieka kaip atviras darbas.
- **`kritikas` 43 %** — 1 `empty` (699 s) ir 2 `skipped` po 900 s (užrakto laukimas). `skipped` jau nebeblokuoja pasiūlymų, bet vaidmuo vis tiek praranda paleidimą; tai ta pati užrakto šeima, kurią taisiau #516, ir jos nepakartojau šiandien.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-9fef50a4d0328a97439cd07d88cb8fec357bb9d1814e1dead34b66695343b62c
```
