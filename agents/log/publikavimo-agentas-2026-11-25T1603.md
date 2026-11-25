# publikavimo-agentas — 2026-11-25T1603

- paleidimas: #539 (manual)
- trukmė: 1128s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_published.py
│ @@ -437,6 +437,31 @@
│    Įrodymas: `scripts/probe_publish_sets.py` R (pirmas GET 404, su `?cb=` 200 →
│    „sutampa“, rc 0 ir įvardyta priežastis) ir S (tas pats kelias visada 404 →
│    vis dar `live_missing`, rc 1).
│ +
│ +2026-11-25 (paleidimas #539): 200 su senais baitais gali būti krašto **teigiama**
│ +  kopija, ne nepaskelbtas turinys.
│ +  Ta pati #50319 šeima, tik priešingu ženklu. Kraštas (GitHub Pages per Fastly)
│ +  laiko ir teigiamą kopiją, o `content/**` JSON naršyklė prašo **be** `?v=`
│ +  (`registry.js` → `fetch(BASE + path)`), tad modulio perrašymas paleidžia
│ +  TTL langą: gyvas adresas atsako 200, bet senais baitais. Iki šios pataisos
│ +  `compare()` po dviejų matavimų be keitimo žymės skelbė „pasenęs turinys“ —
│ +  t. y. siūlė ieškoti turinio skirtumo, kurio repo ir `main` neturi, nors
│ +  pakartojimas su `?cb=` būtų davęs repo baitus. Dabar po antro nesėkmingo
│ +  matavimo daromas **vienas** pakartojimas su keitimo žyme:
│ +  - baitai sutampa su repo → būsena lieka „ok“, o `CDN_STALE` /
│ +    `cdn_stale` / `cdn_stale_count` įrašo, kad kraštas atidavė seną kopiją
│ +    (atskira eilutė „CDN SENA KOPIJA“ ir priedas sėkmės eilutėje — ne tyli
│ +    žalia, LL-37);
│ +  - baitai skiriasi ir su žyme → būsena lieka „differs“ (tikras pasenimas),
│ +    taigi tikro deploy atsilikimo ši pataisa paversti žaliu negali.
│ +  Tas pats kelias yra `compare()` (moduliai, `index.json`, `path.json`,
│ +  `AUX_FILES`) ir `_shell_state()` (svetainės kodas, kurį naršyklė įkelia su
│ +  `?v=<commit>`; jo be žymės matavimas yra kitas krašto raktas, tad senas
│ +  atsakymas ten juo labiau ne įrodymas apie publikavimą).
│ +  Įrodymas: `scripts/probe_publish_sets.py` U (seni baitai be žymės, repo
│ +  baitai su žyme → „sutampa“, rc 0, priežastis įvardyta) ir V (seni baitai ir
│ +  su žyme → vis dar `stale`, rc 1; neigiama kontrolė, kad pataisa
│ +  nemaskuoja tikro atsilikimo).
│
│  Naudojimas:
│      python3 scripts/check_published.py               # žmogui
│ scripts/check_published.py
│ @@ -1335,6 +1335,12 @@
│  # kurį kraštas atidavė iš savo 404 kopijos. Sąmoningai rodomas pranešime, nes
│  # „failo nėra“ ir „kraštas dar nepersikrovė“ turi likti atskiri (LL-21, LL-37).
│  CDN_REFRESH = {"count": 0, "items": []}
│ +# Kitas atskiras skaičius: gyvas adresas atsakė **200**, bet senais baitais, o
│ +# pakartojimas su keitimo žyme davė repo baitus. Tai krašto teigiama kopija, ne
│ +# nepaskelbtas turinys. Skiriama nuo `CDN_REFRESH`, nes ten pirmas atsakymas
│ +# buvo 404 (neigiama kopija), o čia — 200 su pasenusiu kūnu. Abiem atvejais
│ +# priežastis pasakoma, o ne nuslopinama (LL-37).
│ +CDN_STALE = {"count": 0, "items": []}
│
│
│  def cache_busted(url: str) -> str:
│ scripts/check_published.py
│ @@ -1373,6 +1373,34 @@
│          return None
│      CDN_REFRESH["count"] += 1
│      CDN_REFRESH["items"].append(rel)
│ +    return blob
│ +
│ +
│ +def refetch_after_diff(url: str, rel: str, local_sha: str) -> bytes | None:
│ +    """Vienas pakartojimas su keitimo žyme, kai gyvi baitai **skyrėsi**.
│ +
│ +    Kodėl tai ne tas pats, kas `compare()` LL-76 pakartojimas. Tas pakartojimas
│ +    eina į tą patį adresą, tad krašto teigiama kopija (200 su senu kūnu) atsako
│ +    lygiai taip pat — du vienodi matavimai tada skelbiami „pasenęs turinys“, o
│ +    tai teiginys apie priežastį, kurios niekas nepatikrino (LL-21). Kraštas
│ +    (GitHub Pages per Fastly) kešuoja pagal pilną URL su užklausos eilute, tad
│ +    `?cb=<laikas>` yra **kitas raktas** ir atsako tuo, ką turi origin — t. y.
│ +    tuo, ar failas iš tikrųjų paskelbtas.
│ +
│ +    Todėl:
│ +      - su žyme gauti baitai lygūs repo → būsena grįžta „ok“, o `CDN_STALE`
│ +        įrašo, kad pirmi du matavimai buvo seni (ne tyliai, LL-37);
│ +      - su žyme baitai kiti → `None`, o `compare()` palieka „differs“: tikras
│ +        deploy atsilikimas arba kitas turinys lieka raudonas.
│ +
│ +    Kvietėjas privalo mokėti atskirti abu atvejus; ši funkcija pati būsenos
│ +    nekeičia.
│ +    """
│ +    status, blob = fetch_answer(cache_busted(url), attempts=1)
│ +    if status != "ok" or blob is None or sha(blob) != local_sha:
│ +        return None
│ +    CDN_STALE["count"] += 1
│ +    CDN_STALE["items"].append(rel)
│      return blob
│
│
│ scripts/check_published.py
│ @@ -1506,7 +1506,16 @@
│              # šį skirtumą prarasdavo ir 404 virsdavo „unreachable“.
│              return ("gone" if status == "missing" else "unreachable"), len(local), -1
│          live = again
│ -    return ("ok" if sha(live) == sha(local) else "differs"), len(local), len(live)
│ +    if sha(live) != sha(local):
│ +        # Du vienodi matavimai dar neįrodo, kad failas nepaskelbtas: jei kraštas
│ +        # laiko **teigiamą** seną kopiją (200 su senu kūnu), jis atsakys taip
│ +        # pat ir trečią kartą. Todėl vienas matavimas su keitimo žyme — kitas
│ +        # krašto raktas (#539). Baitai sutampa su repo → turinys paskelbtas, o
│ +        # `CDN_STALE` įrašo vėlavimą; skiriasi → `differs`, kaip iki šiol.
│ +        fresh = refetch_after_diff(LIVE_ROOT + url_rel, url_rel, sha(local))
│ +        if fresh is not None:
│ +            return "ok", len(local), len(fresh)
│ +    return (("ok" if sha(live) == sha(local) else "differs"), len(local), len(live))
│
│
│  def same_bytes(rel: str) -> tuple[str, int, int]:
│ scripts/check_published.py
│ @@ -1591,6 +1591,17 @@
│                  # Kaip `compare()`: 404 antrą kartą yra atsakymas, ne tinklas.
│                  return ("gone" if status == "missing" else "unreachable"), len(local), -1
│              live = again
│ +    # Kraštas gali laikyti ir teigiamą seną kopiją. Be šio matavimo du vienodi
│ +    # atsakymai virstų „kodo failas pasenęs“ — t. y. teigtų priežastį, kurios
│ +    # niekas nepatikrino (LL-21). Be to, naršyklė šį failą prašo su
│ +    # `?v=<commit>` (`pages.yml`), tad be žymės išmatuotas adresas yra **kitas**
│ +    # krašto raktas: senas atsakymas jame neįrodo, kad v

… PRALEISTA 11082 SIMBOLIŲ IŠ 29082 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00539/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

sutampa
│ +
│ +- **Būsena (`python3 scripts/check_published.py`, rc 0):** „Repozitorija: 82 moduliai / Klasės: grade-01 (statusas „live“ iš content/lt/grades.json) / Paskelbta: 82 moduliai“ (`grade-01`: repo 82, gyvai 82); `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `missing_in_repo`, `live_missing`, `live_gone`, `stale*`, `aux_*`, `shell_*` — visi `[]`; `path_reordered` `[]`, `path_inserted_midsequence` 9 (įvardyti, įterpimas į vidurį leidžiamas); garsas **2 426/2 426**, vardai 2 426/2 426, dydžiai 2 426/2 426; svetainės kodas 19 failų; `live_version` = `repo_version` = `47ba9936`, `deploy_pending` false, `unpushed_commits` 0, `cdn_refreshed` 0, `cdn_stale` 0; pervedamas ID vienas (`03-sakinio-tvarka` → `03-sakinio-zodziai`, `alias_ok: true`); `verdict` = „sutampa“.
│ +- **3 gyvi adresai (`curl`, kodas ir baitai):** `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → **200** (4 972 B); `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` → **200** (5 459 B); `content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json` → **200** (8 685 B). **Neigiama kontrolė:** `content/lt/grade-01/matematika/99-nera.json` → **404** (563 B), tad 200 aukščiau yra atsakymas, o ne bendras krašto elgesys.
│ +- **Defektas ir taisymas (LL-197).** #537 išsprendė 404 iš krašto **neigiamos** kopijos; liko ta pati klaida priešingu ženklu. `compare()` po dviejų nesėkmingų matavimų skelbė `stale` („pasenęs turinys“) ir `verdict` — „sustabdyta“, nors abu matavimai ėjo į **tą patį** adresą be keitimo žymės, o krašto teigiama kopija atsako identiškai. Naršyklė `content/**` JSON prašo be `?v=` (`assets/js/registry.js:21`), tad modulio perrašymas paleidžia TTL langą, per kurį gyvas adresas atsako 200 senais baitais. Dabar `scripts/check_published.py` turi `refetch_after_diff()`: kai ir po LL-76 pakartojimo baitai skiriasi, daromas **vienas** matavimas su keitimo žyme — sutampa su repo → būsena „ok“ su įrašu `cdn_stale` / `cdn_stale_count` (pranešime „CDN SENA KOPIJA“ ir priedas sėkmės eilutėje); skiriasi ir su žyme → „differs“, kaip iki šiol. Tas pats kelias įjungtas `_shell_state()` (kodą naršyklė įkelia su `?v=<commit>`, tad ir ten be žymės matuotas adresas yra kitas krašto raktas), o ne tik tame faile, ant kurio pastebėta.
│ +- **Įrodymas repo (`scripts/probe_publish_sets.py` → 40/40, rc 0, be interneto, 18 s).** U: veidrodis, kuris `01-a.json` be žymės atsako 200 senu kūnu, o su `?cb=` — repo baitais → `verdict sutampa`, `stale []`, `cdn_stale_count 1`, rc 0 ir pranešime „CDN SENA KOPIJA … ne pasenęs turinys“. V (neigiama kontrolė): tie patys seni baitai ir be žymės, ir su ja → vis dar `stale ['01-a']`, `cdn_stale_count 0`, rc 1, tad pataisa negali tikro deploy atsilikimo paversti žaliu. Papildomai U/V patikrina, kad zondas rašo tik į veidrodį (repo baitai 43 B nepakitę).
│ +- **Vartai po pakeitimo:** `validate_content.py` 0 klaidų / 0 įspėjimų; `check_registry.py` „kryptys 9 · index 82 · failai 82 · užduotys 359 (optional 82) · sim 82 · path 82 · našlaičiai 0 / PROBLEMŲ: 0“; `check_language.py` 0 klaidų / 0 įspėjimų (55 pastabos); `check_audio.py` „Garsas pilnas: 1 213 tekstų, 2 426 įrašų“; `check_lessons.py` 197 įrašai; `check_refs.py` 27 nuorodos rc 0; `check_docs_facts.py` sutampa; `probe_check_published.py` 15/15; `probe_publish_sets.py` 40/40.
│ +- **Būsena po darbo (`check_published.py`, rc 0):** repo 82 / paskelbta 82, garsas 2 426/2 426, kodas 19 failų, `live_version` = `47ba9936`, 0 neišstumtų commit'ų, `cdn_refreshed` 0 ir `cdn_stale` 0 (nė vienas atsakymas nebuvo krašto kopija). **Sprendimas: sutampa** — keisti tik `scripts/check_published.py`, `scripts/probe_publish_sets.py` ir `research/wiki/guidelines/pamokos.md`; `content/**`, `assets/**`, `docs/**`, modulių ID, seka ir vaiko `localStorage` raktai neliesti, push nedarytas (bėgiklio darbas).
│
│  ## 2026-11-25 (11:47) — Publikavimo patikra #537: repo 82 / paskelbta 82 prie `54b427f4`, garsas 2 426/2 426 (vardai ir dydžiai 2 426/2 426); 404 nebelaikomas galutiniu, kai kraštas atsako iš neigiamos kopijos (LL-195), sutampa
│
│ research/wiki/changelog.md
│ @@ -6,7 +6,7 @@
│
│  - **Būsena (`python3 scripts/check_published.py`, rc 0):** „Repozitorija: 82 moduliai / Klasės: grade-01 (statusas „live“ iš content/lt/grades.json) / Paskelbta: 82 moduliai“ (`grade-01`: repo 82, gyvai 82); `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `missing_in_repo`, `live_missing`, `live_gone`, `stale*`, `aux_*`, `shell_*` — visi `[]`; `path_reordered` `[]`, `path_inserted_midsequence` 9 (įvardyti, įterpimas į vidurį leidžiamas); garsas **2 426/2 426**, vardai 2 426/2 426, dydžiai 2 426/2 426; svetainės kodas 19 failų; `live_version` = `repo_version` = `47ba9936`, `deploy_pending` false, `unpushed_commits` 0, `cdn_refreshed` 0, `cdn_stale` 0; pervedamas ID vienas (`03-sakinio-tvarka` → `03-sakinio-zodziai`, `alias_ok: true`); `verdict` = „sutampa“.
│  - **3 gyvi adresai (`curl`, kodas ir baitai):** `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → **200** (4 972 B); `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` → **200** (5 459 B); `content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json` → **200** (8 685 B). **Neigiama kontrolė:** `content/lt/grade-01/matematika/99-nera.json` → **404** (563 B), tad 200 aukščiau yra atsakymas, o ne bendras krašto elgesys.
│ -- **Defektas ir taisymas (LL-197).** #537 išsprendė 404 iš krašto **neigiamos** kopijos; liko ta pati klaida priešingu ženklu. `compare()` po dviejų nesėkmingų matavimų skelbė `stale` („pasenęs turinys“) ir `verdict` — „sustabdyta“, nors abu matavimai ėjo į **tą patį** adresą be keitimo žymės, o krašto teigiama kopija atsako identiškai. Naršyklė `content/**` JSON prašo be `?v=` (`assets/js/registry.js:21`), tad modulio perrašymas paleidžia TTL langą, per kurį gyvas adresas atsako 200 senais baitais. Dabar `scripts/check_published.py` turi `refetch_after_diff()`: kai ir po LL-76 pakartojimo baitai skiriasi, daromas **vienas** matavimas su keitimo žyme — sutampa su repo → būsena „ok“ su įrašu `cdn_stale` / `cdn_stale_count` (pranešime „CDN SENA KOPIJA“ ir priedas sėkmės eilutėje); skiriasi ir su žyme → „differs“, kaip iki šiol. Tas pats kelias įjungtas `_shell_state()` (kodą naršyklė įkelia su `?v=<commit>`, tad ir ten be žymės matuotas adresas yra kitas krašto raktas), o ne tik tame faile, ant kurio pastebėta.
│ +- **Defektas ir taisymas (LL-197).** #537 išsprendė 404 iš krašto **neigiamos** kopijos; liko ta pati klaida priešingu ženklu. `compare()` po dviejų nesėkmingų matavimų skelbė `stale` („pasenęs turinys“) ir `verdict` — „sustabdyta“, nors abu matavimai ėjo į **tą patį** adresą be keitimo žymės, o krašto teigiama kopija atsako identiškai. Naršyklė `content/**` JSON prašo be `?v=` (`assets/js/registry.js:19`), tad modulio perrašymas paleidžia TTL langą, per kurį gyvas adresas atsako 200 senais baitais. Dabar `scripts/check_published.py` turi `refetch_after_diff()`: kai ir po LL-76 pakartojimo baitai skiriasi, daromas **vienas** matavimas su keitimo žyme — sutampa su repo → būsena „ok“ su įrašu `cdn_stale` / `cdn_stale_count` (pranešime „CDN SENA KOPIJA“ ir priedas sėkmės eilutėje); skiriasi ir su žyme → „differs“, kaip iki šiol. Tas pats kelias įjungtas `_shell_state()` (kodą naršyklė įkelia su `?v=<commit>`, tad ir ten be žymės matuotas adresas yra kitas krašto raktas), o ne tik tame faile, ant kurio pastebėta.
│  - **Įrodymas repo (`scripts/probe_publish_sets.py` → 40/40, rc 0, be interneto, 18 s).** U: veidrodis, kuris `01-a.json` be žymės atsako 200 senu kūnu, o su `?cb=` — repo baitais → `verdict sutampa`, `stale []`, `cdn_stale_count 1`, rc 0 ir pranešime „CDN SENA KOPIJA … ne pasenęs turinys“. V (neigiama kontrolė): tie patys seni baitai ir be žymės, ir su ja → vis dar `stale ['01-a']`, `cdn_stale_count 0`, rc 1, tad pataisa negali tikro deploy atsilikimo paversti žaliu. Papildomai U/V patikrina, kad zondas rašo tik į veidrodį (repo baitai 43 B nepakitę).
│  - **Vartai po pakeitimo:** `validate_content.py` 0 klaidų / 0 įspėjimų; `check_registry.py` „kryptys 9 · index 82 · failai 82 · užduotys 359 (optional 82) · sim 82 · path 82 · našlaičiai 0 / PROBLEMŲ: 0“; `check_language.py` 0 klaidų / 0 įspėjimų (55 pastabos); `check_audio.py` „Garsas pilnas: 1 213 tekstų, 2 426 įrašų“; `check_lessons.py` 197 įrašai; `check_refs.py` 27 nuorodos rc 0; `check_docs_facts.py` sutampa; `probe_check_published.py` 15/15; `probe_publish_sets.py` 40/40.
│  - **Būsena po darbo (`check_published.py`, rc 0):** repo 82 / paskelbta 82, garsas 2 426/2 426, kodas 19 failų, `live_version` = `47ba9936`, 0 neišstumtų commit'ų, `cdn_refreshed` 0 ir `cdn_stale` 0 (nė vienas atsakymas nebuvo krašto kopija). **Sprendimas: sutampa** — keisti tik `scripts/check_published.py`, `scripts/probe_publish_sets.py` ir `research/wiki/guidelines/pamokos.md`; `content/**`, `assets/**`, `docs/**`, modulių ID, seka ir vaiko `localStorage` raktai neliesti, push nedarytas (bėgiklio darbas).
Sprendimas: **sutampa**. Šiame paleidime eilės pasiūlymo neįgyvendinau (nė vienas atvirasis nepretenduoja į mano vaidmens failus), todėl `ĮGYVENDINTA:` eilutės nėra.

`python3 scripts/check_published.py` (rc 0)
  Repozitorija 82 · paskelbta 82 · neišstumta 0 · versija repo = gyva = 47ba9936
  grade-01: repo 82, gyvai 82 · garsas 2 426/2 426 (vardai 2 426/2 426, dydžiai 2 426/2 426)
  kodas 19 failų · `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`,
  `missing_in_repo`, `live_missing`, `live_gone`, `stale*`, `aux_*`, `shell_*` — visi []
  `cdn_refreshed` 0, `cdn_stale` 0 · pervedamas ID vienas (`03-sakinio-tvarka` → `03-sakinio-zodziai`, alias_ok)

3 gyvi adresai (curl, kodas ir baitai)
  matematika/04-skaiciu-tiese.json → 200 (4 972 B)
  lietuviu-kalba/03-sakinio-zodziai.json → 200 (5 459 B)
  pasaulio-pazinimas/10-gyvunu-grupes.json → 200 (8 685 B)
  neigiama kontrolė matematika/99-nera.json → 404 (563 B)

Ką pakeičiau (defektas mano paties įrankyje, vaikui nematomas, bet klaidino sekantį agentą)
  #537 uždarė 404 iš krašto neigiamos kopijos; liko ta pati klaida priešingu ženklu. `compare()`
  du kartus matuodavo **tą patį** adresą be keitimo žymės, o krašto teigiama kopija atsako
  identiškai — todėl „200 su senu kūnu“ virsdavo `stale` + „sustabdyta“, nors turinys paskelbtas.
  - `scripts/check_published.py` — naujas `refetch_after_diff()`: kai ir po LL-76 pakartojimo
    baitai skiriasi, daromas **vienas** matavimas su `?cb=`; sutampa su repo → „ok“ + įrašas
    `cdn_stale` / `cdn_stale_count` (atskira eilutė „CDN SENA KOPIJA“ ir priedas sėkmės eilutėje),
    skiriasi ir su žyme → `differs`, kaip iki šiol. Įjungta `compare()` ir `_shell_state()`
    (kodą naršyklė įkelia su `?v=<commit>`, tad be žymės matuotas adresas yra kitas krašto raktas).
  - `scripts/probe_publish_sets.py` — nauji U (seni baitai be žymės, repo baitai su žyme →
    „sutampa“, rc 0, priežastis įvardyta) ir V (seni baitai ir su žyme → vis dar `stale`, rc 1;
    neigiama kontrolė, kad pataisa nemaskuotų tikro deploy atsilikimo). **40/40, rc 0.**
  - `research/wiki/guidelines/pamokos.md` — LL-197 (naujas defekto tipas: 200 su senu kūnu
    palaikytas turinio defektu).
  - `research/wiki/changelog.md` — #539 įrašas su skaičiais ir įrodymu.

Vartai po pakeitimo
  `validate_content.py` 0/0 · `check_registry.py` „index 82 · failai 82 · užduotys 359 · sim 82 · path 82 · našlaičiai 0 / PROBLEMŲ: 0“ · `check_language.py` 0/0 · `check_audio.py` 1 213 tekstų / 2 426 įrašų · `check_lessons.py` 197 · `check_refs.py` 27/27 · `check_docs_facts.py` sutampa · `probe_check_published.py` 15/15 · `probe_publish_sets.py` 40/40. Tikrame bėgime `cdn_stale` [] — 82 moduliai ir 2 426 garso įrašai neiškvietė nė vieno papildomo matavimo.

Neliesta: `content/**`, `assets/**`, `docs/**`, modulių ID, seka, vaiko `localStorage` raktai; push nedarytas (bėgiklio darbas). Failai repo: `scripts/check_published.py`, `scripts/probe_publish_sets.py`, `research/wiki/guidelines/pamokos.md`, `research/wiki/changelog.md`.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-c4024ff667cd6f698365e23051242bc4680e61d01410cb2c66e49ce50a4ebdd5
```
