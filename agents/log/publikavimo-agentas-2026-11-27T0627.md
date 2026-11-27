# publikavimo-agentas — 2026-11-27T0627

- paleidimas: #573 (manual)
- trukmė: 2937s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_published.py
│ @@ -564,7 +564,21 @@
│  # matuojama tik vieno commit'o atžvilgiu — t. y. viena diena, o ne sutartis.
│  PATH_ORDER = pathlib.Path(os.environ.get("SUPRASK_PATH_ORDER")
│                            or (ROOT / "scripts" / "known_path_order.json"))
│ -HISTORY_LIMIT = 400
│ +# Viršutinė riba, kiek `index.json` revizijų dar skaitoma. Tai **išteklių**
│ +# apsauga (kad vienas bėgimas nepradėtų trinti dešimčių tūkstančių blob'ų), o
│ +# ne matavimo riba: viršijus ją patikra grąžinama kaip **neįvykusi**
│ +# (`checked=False` → rc 1 su priežastimi), o ne kaip „dingusių nėra“.
│ +#
│ +# Iki #573 čia buvo `--max-count=HISTORY_LIMIT`, o pasiekus ribą būdavo
│ +# spausdinama pastaba „istorija ribota … senesni ID nepatikrinti“ ir
│ +# `checked` likdavo `True`. Pasekmė tyli: modulis, išimtas iš indeksto
│ +# anksčiau nei prieš 400 indekso revizijų, nebeatpažįstamas, o įrankis toliau
│ +# sako „sutampa“ — nors būtent šio įrankio vienintelė garantija yra „vaiko
│ +# žyma niekada nelieka be modulio“ (LL-37: sąrašas nukertamas, o rezultatas
│ +# pranešamas kaip pilnas). Šiandien indekso revizijų 86, tad riba dar
│ +# nepasiekta, bet `git log` rodo ~3 revizijas per dieną — ji būtų pasiekta
│ +# maždaug per keturis mėnesius, tyliai.
│ +HISTORY_LIMIT = 20000
│
│  # Garsas. Manifestas jau lyginamas kaip `AUX_FILES` įrašas, bet baitų lygybė
│  # sako tik tiek, kad sąrašas gyvas — ne kad failai, į kuriuos jis rodo, yra
│ scripts/check_published.py
│ @@ -894,6 +894,14 @@
│
│      Trečias reikšmės narys `checked` saugo nuo tylios „0 dingusių“: jei istorijos
│      perskaityti nepavyksta, tai nėra švarus rezultatas (LL-37/LL-10).
│ +
│ +    Nuo #573 skaitoma **visa** indekso istorija, o ne paskutinės 400 revizijų.
│ +    Ribos buvimas nebuvo neutralus: pasiekus ją `checked` likdavo `True`, o
│ +    pranešimas tik pridėdavo pastabą — taigi seniai išimtas modulis išnykdavo
│ +    iš patikros, o įrankis vis tiek sakydavo „sutampa“. Dabar riba yra tik
│ +    išteklių apsauga ir viršijus ją patikra pranešama kaip neįvykusi.
│ +    Revizijos skaitomos vienu `git cat-file --batch` procesu (visi blob'ai iš
│ +    karto), nes po vieną `git show` 20 000 revizijų reikštų 20 000 procesų.
│
│      Kiekviena git užklausa tikrinama pagal **išėjimo kodą**, ne tik pagal
│      išvestį. `subprocess.run()` rūpestingai atspausdina klaidą, grąžindamas
│ scripts/check_published.py
│ @@ -926,7 +926,7 @@
│          if probe.stdout.strip() == "true":
│              return {}, "git istorija sekli — dingusių ID patikra neįmanoma", False
│          log = subprocess.run(
│ -            ["git", "log", f"--max-count={HISTORY_LIMIT}", "--format=%h", "--", path],
│ +            ["git", "log", "--format=%h", "--", path],
│              cwd=ROOT, capture_output=True, text=True, timeout=120,
│          )
│          if log.returncode != 0:
│ @@ -938,22 +938,30 @@
│      except Exception as exc:  # noqa: BLE001
│          return {}, f"git istorijos nepavyko perskaityti ({type(exc).__name__})", False
│
│ -    if len(revs) >= HISTORY_LIMIT:
│ -        note = f"istorija ribota iki {HISTORY_LIMIT} revizijų — senesni ID nepatikrinti"
│ +    # Nė viena revizija nėra „dingusių nėra“: tai teiginys apie failą, kurio
│ +    # istorijos nematėme (ne git katalogas, ne tas kelias, tuščias klonas).
│ +    if not revs:
│ +        return {}, ("git log negrąžino nė vienos indekso revizijos — "
│ +                    "dingusių ID patikra neatlikta"), False
│ +    # Išteklių apsauga, o ne matavimo riba: viršijus ją sakome „neatlikta“,
│ +    # nes tyliai nukirpta istorija yra būtent tas defektas, kurį #573 šalina.
│ +    if len(revs) > HISTORY_LIMIT:
│ +        return {}, (f"indekso istorija didesnė už {HISTORY_LIMIT} revizijų — "
│ +                    "dingusių ID patikra neatlikta (padidink HISTORY_LIMIT)"), False
│ +
│ +    blobs, batch_error = _batch_blobs([f"{rev}:{path}" for rev in revs])
│ +    if batch_error:
│ +        return {}, f"git istorijos nepavyko perskaityti: {batch_error}", False
│
│      seen: dict[str, str] = {}
│      unreadable = 0
│ -    for rev in revs:
│ +    for rev, blob in zip(revs, blobs):
│ +        if blob is None:
│ +            # Revizijoje indekso dar nebuvo arba jis ne JSON — tai atsakymas,
│ +            # todėl skaičiuojama, bet ne laikoma gedimu.
│ +            continue
│          try:
│ -            show = subprocess.run(
│ -                ["git", "show", f"{rev}:{path}"],
│ -                cwd=ROOT, capture_output=True, text=True, timeout=30,
│ -            )
│ -            if show.returncode != 0:
│ -                # Revizijoje indekso dar nebuvo arba jis ne JSON — tai
│ -                # atsakymas, todėl skaičiuojama, bet ne laikoma gedimu.
│ -                continue
│ -            data = json.loads(show.stdout)
│ +            data = json.loads(blob.decode("utf-8"))
│          except Exception:  # noqa: BLE001
│              unreadable += 1
│              continue
│ @@ -967,7 +975,7 @@
│      if revs and not seen and unreadable == len(revs):
│          return {}, (f"git istorijos nepavyko perskaityti: nė viena iš "
│                      f"{len(revs)} revizijų neperskaityta"), False
│ -    return seen, note, True
│ +    return seen, "", True
│
│
│  def vanished(grade: int, current_ids: list[str]) -> dict:
│ scripts/check_published.py
│ @@ -882,6 +882,60 @@
│                  if isinstance(old, str) and old and new_id and old != new_id:
│                      out[old] = new_id
│      return out
│ +
│ +
│ +def _batch_blobs(specs: list[str]) -> tuple[list[bytes | None], str]:
│ +    """Visi `<rev>:<kelias>` blob'ai **vienu** `git cat-file --batch` procesu.
│ +
│ +    Kodėl ne `git show` cikle: iki #573 istorija buvo ribojama 400 revizijų
│ +    būtent todėl, kad kiekviena revizija kainavo atskirą procesą (~30 ms).
│ +    Nuėmus ribą, bet palikus ciklą, 20 000 revizijų reikštų 10 minučių.
│ +    `--batch` priima sąrašą objektų iš `stdin` ir atsako srautu, tad kaina
│ +    lieka vienas procesas ir t

… PRALEISTA 66541 SIMBOLIŲ IŠ 84541 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00573/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

o: `historical_ids(1)` → `checked True`, 85 ID (84 dabartiniai + `03-sakinio-tvarka`), 0,04 s.
│ scripts/probe_published_history.py
│ @@ -246,7 +246,6 @@
│
│          patch(repo)
│          no_path = "content/lt/grade-01/nera.json"
│ -        ids_none, note_none, ok_none = cp.historical_ids(1)
│          blobs_none, err_none = cp._batch_blobs([f"HEAD:{no_path}", "HEAD:README.md",
│                                                  "HEAD:kelias su tarpu.json"])
│          check("F7: trūkstamas objektas → `None`, kelias su tarpu skaitomas",
│ scripts/probe_published_history.py
│ @@ -28,8 +28,9 @@
│        skaitymo dalis nesugadina to, ką senoji darė teisingai;
│    D5  viršijus `HISTORY_LIMIT` patikra pranešama kaip **neįvykusi**
│        (`checked: false`), o ne kaip „dingusių nėra“ (LL-37);
│ -  E6  ne git katalogas ir neegzistuojantis kelias irgi duoda `checked: false`;
│ -  F7  `_batch_blobs` trūkstamą objektą žymi `None`, o ne klaida.
│ +  E6  ne git katalogas ir kelias be istorijos irgi duoda `checked: false`;
│ +  F7  `_batch_blobs` trūkstamą objektą žymi `None`, ne klaida, o kelias su
│ +      tarpu (antraštėje 5 laukai) perskaitomas — skaidymas iš dešinės.
│
│  Naudojimas:
│      python3 scripts/probe_published_history.py      # 0 — visi lūkesčiai išsipildė
│ scripts/probe_published_history.py
│ @@ -46,7 +46,6 @@
│  import tempfile
│
│  HERE = pathlib.Path(__file__).resolve().parent
│ -ROOT = HERE.parent
│  sys.path.insert(0, str(HERE))
│
│  import check_published as cp  # noqa: E402
│ scripts/check_published.py
│ @@ -2702,7 +2702,10 @@
│      if orphan:
│          reasons.append(f"{len(orphan)} pervadintas ID be alias (žyma liktų našlaite)")
│      if data.get("history_unchecked"):
│ -        reasons.append("dingusių ID patikra neįvyko")
│ +        # Įvardijama ir klasė: be jos priežastis nesiunčia prie failo, o
│ +        # „neįvyko“ be vietos yra tas pats kaip „nežinau kur“ (LL-21).
│ +        grades = ", ".join(grade_dir(g) for g in data["history_unchecked"])
│ +        reasons.append(f"dingusių ID patikra neįvyko ({grades})")
│      # Tyli riba: git istorijos neperskaičius, „tvarka nepajudėta“ būtų
│      # teiginys apie matavimą, kurio nebuvo (LL-37).
│      if data.get("path_order_checked") is False:
│ scripts/probe_published_history.py
│ @@ -263,6 +263,15 @@
│          check("E6: indekso be istorijos nepavadina švaria patikra",
│                ok_empty is False and ids_empty == {} and "negrąžino" in note_empty,
│                f"checked {ok_empty}, pastaba „{note_empty[:90]}“")
│ +
│ +        # G8: priežastis įvardija **klasę**, ne tik „neįvyko“. Be jos mokytojas
│ +        # ar agentas žino, kad kažkas ne taip, bet ne kur (LL-21: priežastis
│ +        # turi siųsti prie matavimo, ne prie nuotaikos).
│ +        reason = cp.verdict({"unpushed_checked": True, "scope_checked": True,
│ +                             "history_unchecked": [1, 9]})["reasons"]
│ +        check("G8: `verdict()` priežastyje įvardija klases",
│ +              reason == ["dingusių ID patikra neįvyko (grade-01, grade-09)"],
│ +              f"priežastys {reason}")
│      finally:
│          cp.HISTORY_LIMIT = saved_limit
│          for name, value in saved.items():
│ scripts/probe_published_history.py
│ @@ -30,7 +30,9 @@
│        (`checked: false`), o ne kaip „dingusių nėra“ (LL-37);
│    E6  ne git katalogas ir kelias be istorijos irgi duoda `checked: false`;
│    F7  `_batch_blobs` trūkstamą objektą žymi `None`, ne klaida, o kelias su
│ -      tarpu (antraštėje 5 laukai) perskaitomas — skaidymas iš dešinės.
│ +      tarpu (antraštėje 5 laukai) perskaitomas — skaidymas iš dešinės;
│ +  G8  `verdict()` priežastyje įvardija **klasę** („… neįvyko (grade-01)“),
│ +      ne tik „neįvyko“.
│
│  Naudojimas:
│      python3 scripts/probe_published_history.py      # 0 — visi lūkesčiai išsipildė
│ research/wiki/changelog.md
│ @@ -7,7 +7,7 @@
│  - **Defektas.** `scripts/check_published.py` vienintelė garantija — „vaiko `localStorage` žyma nelieka be modulio“ — remiasi klasės `index.json` git istorija. `historical_ids()` ėjo `git log --max-count=400`, o pasiekus ribą **grįždavo `checked = True`** ir tik pridėdavo pastabą „istorija ribota iki 400 revizijų — senesni ID nepatikrinti“. Modulis, išimtas iš indekso anksčiau nei prieš 400 indekso revizijų, nebeatpažįstamas, `vanished_ids` tuščias, `verdict()` — „sutampa“, rc 0. Išmatuota: grade-01 indeksas turi 86 revizijas, `git log` — ~3 per dieną, tad riba būtų pasiekta maždaug per keturis mėnesius, tyliai (pastaba rc nekeičia). Antras sluoksnis toje pačioje funkcijoje: tuščia kelio istorija (`git log` negrąžino nė vienos revizijos — ne tas kelias, tuščias klonas) irgi virsdavo `checked = True`, nes sąlyga `if revs and not seen` netikrino `revs` tuščumo.
│  - **Priežastis.** Riba buvo įvesta dėl **kainos**: kiekviena revizija buvo skaitoma atskiru `git show` procesu. Išmatavus šiandien (86 revizijos, ši mašina): 2,07 ms/revizijai, t. y. 400 ≈ 0,8 s, o 20 000 ≈ 0,7 min — kaina reali, bet ne tokia, kad pateisintų apibrėžties keitimą. Sąlyga „pasiekėme ribą“ vis tiek buvo užrašyta kaip sėkmė su pastaba: išteklių apribojimas virto matavimo apibrėžtimi. LL-37 šeima, tik nukerpama ne rezultatų sąrašas, o **įrodymo bazė**, o išvada apie ją skelbiama.
│  - **Ką pakeičiau (`scripts/check_published.py`, tik įrankio kodas).** (1) `git log` be `--max-count` — skaitoma visa indekso istorija. (2) Nauja `_batch_blobs()` — visi `<rev>:<kelias>` blob'ai imami **vienu** `git cat-file --batch` procesu (kaina 0,04 s prie 86 revizijų, tiesinė prie dešimt tūkstančių), antraštės ir dydžiai tikrinami, nutrumpėjęs atsakymas — klaida, o ne tyli dalis. (3) `HISTORY_LIMIT` 400 → 20 000 ir lieka **tik** išteklių apsauga: viršijus `checked = False` → rc 1 su priežastimi „dingusių ID patikra neatlikta“, o ne „dingusių nėra“. (4) Tuščia kelio istorija taip pat `checked = False`. (5) Pranešimas „Dingusių ID patikros riba: …“ pakeistas į „DINGUSIŲ ID PATIKRA NEATLIKTA — …“, nes pastaba nebe apie ribą, o apie neįvykusią patikrą.
│ -- **Naujas vartas (`scripts/probe_published_history.py`, be tinklo, 0,3 s, įsijungia į CI `probe_*.py` ciklą be workflow pakeitimo).** Laikinas git repo su **420** indekso revizijų (per `git fast-import`, nes 420 `git commit` procesų viršytų CI zondo 5 s ribą) ir trimis moduliais: A1 išimtas ID matomas; A2 ta pati skaitymo dalis su sena 400 riba jo **nematytų** (2 ID vietoj 4) — defektas realus, ne įsivaizduojamas; B3 `vanished()` + `verdict()` raudonas su priežastimi; C4 priimtas pervadinimas lieka `resolved`/`alias_ok`; D5 `HISTORY_LIMIT = 10` → `checked False`; E6 ne git katalogas ir tuščia istorija → `checked False`; F7 trūkstamas blob'as → `None`, o kelias su tarpu perskaitomas (antraštė skaidoma iš dešinės).
│ +- **Naujas vartas (`scripts/probe_published_history.py`, be tinklo, 0,3 s, įsijungia į CI `probe_*.py` ciklą be workflow pakeitimo).** Laikinas git repo su **420** indekso revizijų (per `git fast-import`, nes 420 `git commit` procesų viršytų CI zondo 5 s ribą) ir trimis moduliais: A1 išimtas ID matomas; A2 ta pati skaitymo dalis su sena 400 riba jo **nematytų** (2 ID vietoj 4) — defektas realus, ne įsivaizduojamas; B3 `vanished()` + `verdict()` raudonas su priežastimi; C4 priimtas pervadinimas lieka `resolved`/`alias_ok`; D5 `HISTORY_LIMIT = 10` → `checked False`; E6 ne git katalogas ir tuščia istorija → `checked False`; F7 trūkstamas blob'as → `None`, o kelias su tarpu perskaitomas (antraštė skaidoma iš dešinės); G8 `verdict()` priežastyje įvardija klasę („dingusių ID patikra neįvyko (grade-01)“).
│  - **Matavimas.** Realus repo: `historical_ids(1)` → `checked True`, 85 ID (84 dabartiniai + priimtas pervadinimas `03-sakinio-tvarka`), 0,04 s; tie patys 86 blob'ai atskiru `git show` ciklu — 0,18 s (2,07 ms/revizijai), t. y. 400 revizijų būtų ~0,8 s, tad riba sutaupydavo mažiau nei sekundę. Zondas prieš pataisą (senoji funkcija su 400 riba) — 420 revizijų fixture'e išimto ID neranda; po pataisos 10/10, rc 0.
│  - **Vartai po pakeitimo.** `check_published.py` → repo 84 / paskelbta 84 / neišstumta 0, „✔ Repo ir gyva svetainė sutampa“, rc 0 (garso 2524/2524, rėmas 2632 failai visi matuoti, gylio nuorodos absoliučios, versija 1352bd04); `probe_publish_sets.py` 63/63; `probe_check_published.py` 15/15; visi 21 `probe_*.py` rc 0; `validate_content.py --grade 1 --strict` 0/0; `check_registry` 84/84/370/84/84, našlaičių 0; `check_language --grade 1 --strict` 0/0; `check_refs` 26/26; `check_ui` 0/0; `check_audio` 1262 tekstų · 2524/2524; `check_art` ✔; `check_docs_facts` sutampa; `check_lessons` **221**; `--scope` ir `--path-order` rc 0.
│  - **Sprendimas: ištaisyta.** Turinys, `index.json`, `path.json`, simuliacijos, `docs/*` ir `AGENTS.md` neliesti; joks modulio ID nepervardytas, nieko nešalinta, `localStorage` raktai nepajudėti. Failai: `scripts/check_published.py`, `scripts/probe_published_history.py`, `research/wiki/guidelines/pamokos.md`, `research/wiki/changelog.md`. Push nedarytas (bėgiklio darbas).
`check_published.py` išvestis: **repo 84 / paskelbta 84 / neišstumta 0**, `behind` 0, verdiktas **sutampa** (rc 0). HTTP: `34-dvizenklis-plius-dvizenklis.json` 200, `41-augalo-dalys.json` 200, `03-sakinio-zodziai.json` 200; neigiama kontrolė `99-nera.json` 404, `404.html` 200.

Sprendimas: **ištaisyta** — bet ne publikavime, o pačiame įrankyje, kuris apie publikavimą sprendžia.

Defektas. Šio vaidmens vienintelė garantija yra „vaiko `localStorage` žyma nelieka be modulio“, o ji remiasi klasės `index.json` git istorija. `historical_ids()` ėjo `git log --max-count=400`, o pasiekus ribą grąžindavo `checked = True` ir tik pridėdavo pastabą. Modulis, išimtas iš indekso anksčiau nei prieš 400 indekso revizijų, nebeatpažįstamas — `vanished_ids` tuščias, `verdict()` „sutampa“, rc 0. Šiandien indeksas turi 86 revizijas, auga ~3 per dieną, tad riba būtų pasiekta maždaug per keturis mėnesius — tyliai, nes pastaba rc nekeičia. Antras sluoksnis toje pačioje funkcijoje: tuščia kelio istorija (`git log` negrąžino nė vienos revizijos — ne tas kelias, tuščias klonas) irgi virsdavo `checked = True`.

Ką pakeičiau (nelietęs `content/`, `assets/`, `docs/`, `AGENTS.md`):
- `scripts/check_published.py` — `git log` be `--max-count`; nauja `_batch_blobs()` ima visus blob'us vienu `git cat-file --batch` procesu (0,015 s prie 86 revizijų, 12× pigiau už ciklą — būtent kaina ir buvo vienintelė ribos priežastis); `HISTORY_LIMIT` 400 → 20 000 ir lieka tik išteklių apsauga (viršijus `checked=False` → rc 1, ne „dingusių nėra“); tuščia kelio istorija taip pat `checked=False`; pranešimas „DINGUSIŲ ID PATIKRA NEATLIKTA — …“; `verdict()` priežastyje įvardija klasę („… neįvyko (grade-01)“).
- `scripts/probe_published_history.py` — naujas vartas, 11/11, 0,3 s, be tinklo: laikinas git repo su 420 indekso revizijų per `git fast-import`. A1 išimtas ID matomas; A2 ta pati skaitymo dalis su sena 400 riba jo **nematytų** (2 ID vietoj 4) — defektas realus, o ne įsivaizduojamas; B3 `verdict()` raudonas; C4 priimtas pervadinimas lieka `resolved`/`alias_ok`; D5/E6/F7/G8 — riba, ne git katalogas, tuščia istorija, kelias su tarpu, klasės įvardijimas.
- `research/wiki/guidelines/pamokos.md` — **LL-221**; `research/wiki/changelog.md` — #573 įrašas.

Matavimas. Realus repo: `historical_ids(1)` → `checked True`, 85 ID (84 dabartiniai + priimtas `03-sakinio-tvarka`), 0,04 s; tie patys 86 blob'ai `git show` ciklu — 0,18 s, tad sena riba sutaupydavo mažiau nei sekundę.

Vartai: `validate_content --grade 1 --strict` 0/0 · `check_registry` 84/84/370/84/84, našlaičių 0 · `check_language --strict` 0/0 · `check_refs` 26/26 · `check_ui` 0/0 · `check_docs_facts` sutampa · `check_audio` 1 262 tekstų / 2 524 · `check_art` ✔ · `check_lessons` 221 · `check_agents` rc 0 · `curriculum_backlog --check` ✔ · `--scope` ir `--path-order` rc 0 · visi 21 `probe_*.py` rc 0 · `probe_publish_sets` 63/63, `probe_check_published` 15/15.

Modulių ID, `path.json` seka ir `localStorage` raktai neliesti; push nedarytas (bėgiklio darbas).

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-2814a3ad40369cecfdf170aa31737780497e9ec9d09f19f06f80728f0b4c6255
```
