# publikavimo-agentas — 2026-11-27T2346

- paleidimas: #592 (manual)
- trukmė: 2275s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_published.py
│ @@ -1402,17 +1402,46 @@
│      return [mid for i, mid in enumerate(current) if mid not in base_set and i < last_base]
│
│
│ +def unpinned_ids(current: list[str], baseline: list[str]) -> list[str]:
│ +    """ID, kurie yra `path.json`, bet nėra užfiksuotoje sekoje — ta tvarka nematuota.
│ +
│ +    Kodėl tai atskiras matavimas, o ne aibės skirtumas pranešimui. Nuo #484
│ +    `reordered_ids()` atsako į klausimą „ar senų ID santykinė tvarka
│ +    nepajudėta“, ir jis lygina **tik poras, kurių abu nariai yra bazėje**.
│ +    ID, pridėtas po to, kai seka buvo užfiksuota, į nė vieną porą neįeina —
│ +    jis nematomas. Matuota 2026-11-27 (#592): užfiksuota 72 ID, o `path.json`
│ +    turi 87, tad 15 ID (visi nuo 2026-11-23 pridėti moduliai) buvo **visiškai
│ +    už matavimo ribos**. Sukeitus du iš jų vietomis, `reordered_ids()` grąžina
│ +    tuščią sąrašą, o vartai sako „senų ID tvarka nepajudėta“ ir rc 0 — nors
│ +    vaiko „Tęsk nuo čia“ žingsnis persikėlė. Tai ta pati #481 istorija, tik
│ +    apie modulius, kurių tuo metu dar nebuvo: perstatymas rastas tik tada,
│ +    kai jau buvo svetainėje, ir beliko konstatuoti.
│ +
│ +    Todėl trūkstami ID yra **įvardijami**, o ne nutylimi (LL-37: sąrašas
│ +    nukerpamas, o rezultatas pranešamas kaip pilnas). Jų tvarka netampa
│ +    raudona automatiškai: naują modulį įterpti į vidurį yra teisingas
│ +    darbas (`inserted_midsequence` — geltona), o vartai, kurie draudžia
│ +    teisingą darbą, moko juos apeiti (LL-38). Uždarymas yra sąmoningas
│ +    veiksmas — `--accept-order`, kuris įrašo dabartinę tvarką ir niekada
│ +    neperstumia jau užfiksuoto ID.
│ +    """
│ +    base = set(baseline)
│ +    return [mid for mid in current if mid not in base]
│ +
│ +
│  def path_order_check(grade: int, current_seq: list[str]) -> dict:
│      """Santykinės `path.json` tvarkos patikra vienam klasiui.
│
│ -    Grąžina `path_reordered` (raudona: senų ID tvarka pajudėta), o
│ +    Grąžina `path_reordered` (raudona: senų ID tvarka pajudėta),
│      `path_inserted_midsequence` (geltona: nauji įterpti į vidurį),
│ +    `path_unpinned` (geltona: ID, kurių tvarka užfiksuota seka nemato),
│      `path_order_baseline` (su kuo lyginta) ir `path_order_checked`.
│      """
│      baseline = path_order_baseline(grade, current_seq)
│      out: dict = {
│          "path_reordered": [],
│          "path_inserted_midsequence": [],
│ +        "path_unpinned": [],
│          "path_order_baseline": baseline.get("label", ""),
│          "path_order_checked": bool(baseline.get("checked")),
│      }
│ @@ -1420,9 +1449,13 @@
│          out["path_order_note"] = baseline["note"]
│      base = baseline.get("seq") or []
│      if not base:
│ +        # Be bazės `unpinned_ids()` pavadintų visus ID „neužfiksuotais“, o tai
│ +        # būtų teiginys apie sąrašą, kurio nematėme (LL-37). Apie tai jau
│ +        # pasako `path_order_note` / `path_order_checked`.
│          return out
│      out["path_reordered"] = reordered_ids(current_seq, base)
│      out["path_inserted_midsequence"] = inserted_midsequence(current_seq, base)
│ +    out["path_unpinned"] = unpinned_ids(current_seq, base)
│      return out
│
│
│ scripts/check_published.py
│ @@ -1476,13 +1476,20 @@
│      temos kaimyno yra teisinga, tik tai turi būti matoma pranešime, o ne
│      atrandama vaiko ekrane.
│
│ +    `unpinned` (nuo #592) irgi geltona, bet ji **turi būti matoma**: tai ID,
│ +    kurių tvarkos užfiksuota seka neaprėpia, tad jiems `reordered` negali
│ +    suveikti iš principo. Šiandien (2026-11-27) tokių buvo 15 iš 87 — visi
│ +    moduliai, pridėti po to, kai seka buvo užfiksuota 2026-11-23. Be šios
│ +    eilutės vartai sakydavo „tvarka nepajudėta“ apie 72 ID, o likusius 15
│ +    palikdavo visiškai už matavimo ribos (LL-37).
│ +
│      Grąžina dict su `ok` — vieninteliu lauku, kuriuo remiasi `main()`.
│      """
│      gd = grade_dir(grade)
│      out: dict = {
│          "grade": grade, "file": f"content/lt/{gd}/path.json", "ok": False,
│          "checked": False, "baseline": "", "reordered": [], "inserted": [],
│ -        "sequence_len": 0, "error": "", "note": "",
│ +        "unpinned": [], "sequence_len": 0, "error": "", "note": "",
│      }
│      try:
│          seq = list(json.loads((CONTENT / gd / "path.json")
│ scripts/check_published.py
│ @@ -1515,6 +1515,7 @@
│      base = pin["seq"]
│      out["reordered"] = reordered_ids(seq, base)
│      out["inserted"] = inserted_midsequence(seq, base)
│ +    out["unpinned"] = unpinned_ids(seq, base)
│      out["ok"] = not out["reordered"]
│      return out
│
│ scripts/check_published.py
│ @@ -1567,6 +1567,13 @@
│              print(f"  Nauji moduliai įterpti į vidurį (ne į pabaigą): "
│                    f"{', '.join(r['inserted'])} — leidžiama, bet „kitas žingsnis“ "
│                    f"pasikeitė po jų einantiems.")
│ +        if r["unpinned"]:
│ +            # Ne klaida, bet tyla būtų melas apie aprėptį: šiems ID
│ +            # `reordered` negali suveikti, tad „tvarka nepajudėta“ apie juos
│ +            # nieko nesako. Užfiksuoti galima `--accept-order`.
│ +            print(f"  Tvarka NEAPIMA {len(r['unpinned'])} ID (iš {r['sequence_len']}): "
│ +                  f"{', '.join(r['unpinned'])} — jų perstatymas nebūtų pastebėtas. "
│ +                  f"Užfiksuok: `python3 scripts/check_published.py --accept-order`.")
│      return 0 if ok else 1
│
│
│ scripts/check_published.py
│ @@ -1518,6 +1518,121 @@
│      out["unpinned"] = unpinned_ids(seq, base)
│      out["ok"] = not out["reordered"]
│      return out
│ +
│ +
│ +def accept_order(grade: int, apply: bool) -> dict:
│ +    """Įrašo dabartinę `path.json` tvarką į `scripts/known_path_order.json`.
│ +
│ +    Kodėl reikia atskiro veiksmo, o ne automatinio papildymo. Užfiksuota seka
│ +    yra **sutartis su vaiku**: ji sako, kokia eile jau ėjai ir kur yra tavo
│ +    „Tęsk nuo čia“. Jei ji būtų papildoma kiekvieno bėgimo metu, perstatymas,
│ +    įvykęs prieš tą bėgimą, būtų

… PRALEISTA 31519 SIMBOLIŲ IŠ 49519 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00592/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

1, `probe_lost_grades` 12/12).
│ +- **Sprendimas: ištaisyta.** Failai: `scripts/check_published.py`, `scripts/probe_path_order.py`, `scripts/known_path_order.json`, `agents/roles/publikavimo-agentas.md` (4a žingsnis), `research/wiki/guidelines/pamokos.md` (LL-231), `research/wiki/changelog.md`. Push nedarytas (bėgiklio darbas).
│
│  ## 2026-11-27 — #59752: naujas modulis `04-dermes-garsai` — trys gaidos duoda šešias eiles, o muziką kuria eilė
│
│ scripts/check_published.py
│ @@ -1385,10 +1385,18 @@
│      if head == current_seq:
│          out["checked"] = True
│          out["label"] = "HEAD (nepaskelbtų pakeitimų nėra)"
│ -        out["note"] = ("nėra `scripts/known_path_order.json` įrašo — "
│ -                       "ilgalaikė apsauga neįjungta, matuotas tik HEAD")
│ -        return out
│ -    out.update(seq=head, label="HEAD (darbinė kopija dar nepaskelbta)", checked=True)
│ +    else:
│ +        out.update(seq=head, label="HEAD (darbinė kopija dar nepaskelbta)",
│ +                   checked=True)
│ +    # Pastaba vienoda abiem atvejais: ji pasako **faktą** (ilgalaikės apsaugos
│ +    # nėra), o ne darbinės kopijos būseną. Iki #56887 ji buvo rašoma tik
│ +    # švariame medyje, todėl kūrėjo darbo metu (path.json ką tik papildytas)
│ +    # įrankis apie išjungtą apsaugą nutylėdavo — o zondas, kurio vienas
│ +    # lūkestis yra būtent šis sakinys, tapdavo raudonas būtent tada, kai
│ +    # saugomas darbas vyksta (LL-38 atvirkštinė pusė: vartai, kurie baudžia
│ +    # teisingą darbą, moko jų nepaleisti).
│ +    out["note"] = ("nėra `scripts/known_path_order.json` įrašo — "
│ +                   "ilgalaikė apsauga neįjungta, matuotas tik HEAD")
│      return out
│
│
│ scripts/probe_path_order.py
│ @@ -146,6 +146,20 @@
│                and "known_path_order" in note_h
│                and "HEAD" in out["path_order_baseline"],
│                f"label={out['path_order_baseline']!r} note={note_h[:60]!r}")
│ +        # H1b (#56887): tas pats, bet su NEcommitintu `path.json` — būtent
│ +        # tokia būsena vyksta kūrėjo darbe. Iki pataisos `path_order_baseline()`
│ +        # pastabą rašydavo tik švariame medyje, tad zondas tapdavo raudonas
│ +        # būtent tada, kai saugomas darbas vyksta — ir kūrėjas mokydavosi jo
│ +        # nepaleisti. Pastaba dabar pasako faktą (apsaugos nėra), o ne darbo
│ +        # kopinėjimo būseną, todėl abu atvejai įvardijami.
│ +        dirty_seq = real_path_seq + ["99-tik-zonde"]
│ +        out_dirty = cp.path_order_check(1, dirty_seq)
│ +        check("H1b necommitintas path.json taip pat įvardija išjungtą apsaugą",
│ +              out_dirty["path_order_checked"] is True
│ +              and "known_path_order" in out_dirty.get("path_order_note", "")
│ +              and "darbinė kopija" in out_dirty["path_order_baseline"],
│ +              f"label={out_dirty['path_order_baseline']!r} "
│ +              f"note={out_dirty.get('path_order_note', '')[:50]!r}")
│          shuffled_real = real_path_seq[:]
│          shuffled_real[3], shuffled_real[4] = shuffled_real[4], shuffled_real[3]
│          out = cp.path_order_check(1, shuffled_real)
│ scripts/check_published.py
│ @@ -550,6 +550,14 @@
│    87/87). Su senuoju įrankiu zondas krenta (`KeyError: 'path_unpinned'`), o
│    su sena 72 ID seka `check_published.py --no-bytes` duoda rc 1 su priežastimi
│    „15 modulių tvarka neužfiksuota“.
│ +
│ +  Tame pačiame darbe išspręstas #56887: `path_order_baseline()` pastabą
│ +  („nėra `known_path_order.json` įrašo — ilgalaikė apsauga neįjungta“) rašydavo
│ +  **tik švariame medyje**. Kūrėjo darbe `path.json` visada papildytas, tad
│ +  pastaba dingdavo, o zondas `probe_path_order.py` H1 tapdavo raudonas būtent
│ +  tada, kai saugomas darbas vyksta — ir kūrėjas mokydavosi zondo nepaleisti
│ +  (LL-182/LL-207). Pastaba dabar pasako faktą (apsaugos nėra), o ne darbinės
│ +  kopijos būseną, ir rašoma abiem atvejais; tai patikrina H1b.
│
│  Naudojimas:
│      python3 scripts/check_published.py               # žmogui
│ research/wiki/changelog.md
│ @@ -8,7 +8,8 @@
│  - **3+ gyvi adresai (`curl`).** `content/lt/grade-01/index.json` → **200**; `content/lt/grade-01/muzika/04-dermes-garsai.json` → **200**; `content/lt/grade-01/matematika/37-tinklelio-adresas.json` → **200**; `assets/js/sims/muzika.js` → **200**. **Neigiama kontrolė:** `content/lt/grade-01/matematika/99-nera.json` → **404** (atsarginis `404.html`).
│  - **Defektas, kurio nematė nė vienas vartas (LL-231).** `reordered_ids()` lygina tik ID poras, kurių **abu** nariai yra užfiksuotoje sekoje, tad ID, pridėtas po `scripts/known_path_order.json` užfiksavimo (2026-11-23, 72 ID), į lyginimą neįeina iš principo. Šiandien `path.json` turi 87, t. y. **15 modulių** buvo visiškai už matavimo ribos. Matuota: sukeitus `14-veikejas-pagal-teksta` ir `16-pokalbio-eile` — `reordered_ids()` → `[]`, o `--path-order` → „✔ Maršruto tvarka nepajudėta — grade-01: 87 žingsnių“ ir rc 0, nors vaiko „Tęsk nuo čia“ žingsnis persikėlė. Skaičius 87 tame sakinyje buvo sekos ilgis, ne aprėptis (LL-21/LL-37). Seka neauga pati: kiekvienas naujas modulis didina šį atstumą amžinai, tyliai.
│  - **Ką pakeičiau (tik įrankio kodas ir jo duomenys; turinys, `index.json`, `path.json`, simuliacijos, CSS, `docs/`, `AGENTS.md`, `.github/` neliesti).** (1) `unpinned_ids()` + `path_unpinned` per klasę ir bendrame `report()`; `path_order_steps` duoda vardiklį, kad „15 neaprėpta“ nebūtų skaičius be konteksto. (2) Publikavimo bėgime neužfiksuota aprėptis yra `verdict()` priežastis (rc 1) — jį paleidžia vaidmuo, kuris nusprendžia, kokia tvarka jau yra sutartis; CI `--path-order` lieka geltona su rc 0, nes ten naują modulį įterpti į vidurį yra teisingas darbas (LL-38). (3) `--accept-order [--apply]` — sąmoningas, `git diff` matomas užfiksavimas: atsisako, jei jau užfiksuotų ID tvarka pajudėta (perstatymas, o ne aprėpties spraga) arba jei sekos failas neperskaitytas (tylus perrašymas prarastų kitų klasių įrašus); be `--apply` — sausa eiga. (4) Sėkmės eilutė nebesako „nepajudėta“ be vardiklio: dabar „užfiksuota 87/87 žingsnių“. (5) `scripts/known_path_order.json` papildytas 72 → 87 ID (`accepted_at` 2026-11-28T00:05:01+02:00); jau užfiksuotų ID santykinė tvarka patikrinta prieš įrašant ir nepasikeitė, tad vaiko žingsnis nepajudėtas.
│ -- **Įrodymas (`scripts/probe_path_order.py`, 27/27, be tinklo).** L1 **neigiama kontrolė** — su siauresne baze dviejų neužfiksuotų ID sukeitimas duoda `reordered == []`, o `unpinned` juos įvardija (defektas realus); L2 sausa eiga nieko neįrašo; L3 `--apply` papildo tik trūkstamus ir nekeičia senų ID tvarkos; L4 po užfiksavimo tas pats sukeitimas jau raudonas; L5 perstatymas atmetamas, failas neperrašomas; L6 sugadintas failas neperrašomas; L7 tikrame repo aprėptis 87/87. Su senuoju įrankiu zondas krenta (`KeyError: 'path_unpinned'` — būsena net neegzistavo); su sena 72 ID seka `check_published.py --no-bytes` duoda rc 1 „15 modulių tvarka neužfiksuota“, su papildyta — rc 0.
│ +- **Įrodymas (`scripts/probe_path_order.py`, 28/28, be tinklo).** L1 **neigiama kontrolė** — su siauresne baze dviejų neužfiksuotų ID sukeitimas duoda `reordered == []`, o `unpinned` juos įvardija (defektas realus); L2 sausa eiga nieko neįrašo; L3 `--apply` papildo tik trūkstamus ir nekeičia senų ID tvarkos; L4 po užfiksavimo tas pats sukeitimas jau raudonas; L5 perstatymas atmetamas, failas neperrašomas; L6 sugadintas failas neperrašomas; L7 tikrame repo aprėptis 87/87. Su senuoju įrankiu zondas krenta (`KeyError: 'path_unpinned'` — būsena net neegzistavo); su sena 72 ID seka `check_published.py --no-bytes` duoda rc 1 „15 modulių tvarka neužfiksuota“, su papildyta — rc 0.
│ +- **Įgyvendintas ir atviras pasiūlymas #56887.** `path_order_baseline()` pastabą „nėra `known_path_order.json` įrašo — ilgalaikė apsauga neįjungta“ rašydavo **tik švariame medyje**; kūrėjo darbe `path.json` visada ką tik papildytas, tad pastaba dingdavo, o `probe_path_order.py` H1 tapdavo raudonas būtent tada, kai vyksta saugomas darbas (LL-182/LL-207: vartai, kurie baudžia teisingą darbą, moko jų nepaleisti). Pastaba dabar pasako faktą (apsaugos nėra), o ne darbinės kopijos būseną, ir rašoma abiem atvejais. **Neigiama kontrolė:** su senąja eile `probe_path_order.py` → rc 1 ir `KLAIDA H1b … note=''`, su pataisyta → 28/28, rc 0.
│  - **Vartai po pakeitimo.** `validate_content --grade 1 --strict` 0/0 · `check_registry` index 87 · failai 87 · užduotys 384 · sim 87 · path 87 · našlaičiai 0 · `check_language --grade 1 --strict` 0/0 · `check_refs` 26/26 · `check_ui` 0/0 · `check_docs_facts` sutampa · `check_audio` 1 308 tekstų · 2 616/2 616 · `check_art` ✔ · `check_lessons` 231 · `check_agents` rc 0 · `curriculum_backlog --check` ✔ · `check_published --scope`, `--path-order`, `--accept-order` rc 0 · visi `probe_*.py` rc 0 (`probe_path_order` 27/27, `probe_publish_sets` 63/63, `probe_check_published` 15/15, `probe_published_history` 11/11, `probe_lost_grades` 12/12).
│  - **Sprendimas: ištaisyta.** Failai: `scripts/check_published.py`, `scripts/probe_path_order.py`, `scripts/known_path_order.json`, `agents/roles/publikavimo-agentas.md` (4a žingsnis), `research/wiki/guidelines/pamokos.md` (LL-231), `research/wiki/changelog.md`. Push nedarytas (bėgiklio darbas).
│
**ĮGYVENDINTA: #56887**

`check_published.py` išvestis (tikra, `e46bb1e8` + šis commit):
- Repozitorija: **87** moduliai · Paskelbta: **87** · Neišstumta: **0** (prieš mano commit'ą), rc **0**, `verdict` — `sutampa`, `reasons []`
- Garsas 2 616/2 616 pasiekiami, dydžiai 2 616/2 616 = `Content-Length`, vardo maišas 2 616/2 616 = baitai IR tekstas
- Svetainės kodas 19 failų, rėmas 2 727 publikuojami failai visi matuoti, versija `e46bb1e8` abiejose pusėse, `path.json` 87 žingsnių
- Atsiliko 0. Po commit'o rodo „1 neišstumtas“ — tai bėgiklio darbas, push nedarytas.

3 HTTP kodai: `content/lt/grade-01/muzika/04-dermes-garsai.json` → **200** (8 597 B) · `content/lt/grade-01/matematika/37-tinklelio-adresas.json` → **200** (8 081 B) · `assets/js/sims/muzika.js` → **200** (55 139 B). Neigiama kontrolė: `…/matematika/99-nera.json` → **404** (4 290 B — atsarginis `404.html`).

Sprendimas: **ištaisyta.**

Rastas dvigubas defektas mano paties varte. Pirmas (naujas, LL-231): `reordered_ids()` lygina tik poras, kurių abu nariai yra užfiksuotoje sekoje, o seka buvo užfiksuota 2026-11-23 su 72 ID, kai `path.json` šiandien turi 87 — **15 modulių buvo visiškai už matavimo ribos**. Matuota: sukeitus `14-veikejas-pagal-teksta` ir `16-pokalbio-eile`, `--path-order` vis tiek rašė „✔ nepajudėta“ ir rc 0. Antras (#56887, atviras pasiūlymas tame pačiame faile): `path_order_baseline()` pastabą rašydavo tik švariame medyje, tad zondas H1 buvo raudonas **būtent tada, kai kūrėjas dirba**.

Ką pakeičiau (turinio, `index.json`, simuliacijų, CSS, `docs/`, `AGENTS.md`, `.github/` nelietęs):
- `scripts/check_published.py` — `unpinned_ids()`, `path_unpinned`, `path_order_steps` (vardiklis), `verdict()` priežastis publikavimo bėgime, `--accept-order [--apply]` (sausa eiga + atsisakymas, jei perstatymas ar sugadintas failas), sėkmės eilutė dabar sako „užfiksuota 87/87 žingsnių“, o ne „nepajudėta“ be aprėpties; baseline pastaba rašoma abiem atvejais
- `scripts/known_path_order.json` — 72 → 87 ID; senų ID santykinė tvarka patikrinta prieš įrašant ir nepakito
- `scripts/probe_path_order.py` — **28/28** (L1–L7 + H1b); L1 neigiama kontrolė, L4 uždarymas, L5/L6 atsisakymai. Su senuoju įrankiu krenta (`KeyError: 'path_unpinned'`; H1b → `note=''`, rc 1)
- `agents/roles/publikavimo-agentas.md` (4a žingsnis), `research/wiki/guidelines/pamokos.md` (LL-231), `research/wiki/changelog.md`

Vartai: `validate_content --strict` 0/0 · `check_registry` 87/87/384/87/87, našlaičiai 0 · `check_language --strict` 0/0 · `check_refs` 26/26 · `check_ui` 0/0 · `check_docs_facts` sutampa · `check_audio` 1 308 / 2 616 · `check_art` ✔ · `check_lessons` 231 · `check_agents` rc 0 · `curriculum_backlog --check` ✔ · `--scope`, `--path-order`, `--accept-order` rc 0 · visi 27 `probe_*.py` rc 0.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-a825174cc8737051dbfbb54b0359170fe3e739621b105e5a8d19b8016e1b8d9c
```
