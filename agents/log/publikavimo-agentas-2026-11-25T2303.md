# publikavimo-agentas — 2026-11-25T2303

- paleidimas: #544 (manual)
- trukmė: 2265s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_published.py
│ @@ -1341,6 +1341,14 @@
│  # buvo 404 (neigiama kopija), o čia — 200 su pasenusiu kūnu. Abiem atvejais
│  # priežastis pasakoma, o ne nuslopinama (LL-37).
│  CDN_STALE = {"count": 0, "items": []}
│ +# Trečias atskiras skaičius (LL-201, paleidimas #544): **versija** `?v=`, o ne
│ +# failo kūnas. `_shell_state()` prieš lyginimą nuima `?v=` (ji yra publikavimo
│ +# žymė, ne turinys), o `live_version()` skaitė tą patį `index.html` be keitimo
│ +# žymės — tad žymos, kuri yra vienintelis `deploy_pending` šaltinis, iš krašto
│ +# senos kopijos negalėjo atskirti niekas. Matuota 2026-11-25 laikiname veidrodyje:
│ +# visi baitai `ok` (`shell_stale` [], `stale` [], `aux_stale` []), o `verdict`
│ +# raudonas — „svetainė pastatyta iš bbbbbbbb … deploy nepasivijo per 3 s“.
│ +CDN_VERSION = {"count": 0, "items": []}
│
│
│  def cache_busted(url: str) -> str:
│ scripts/check_published.py
│ @@ -1622,13 +1622,57 @@
│          return ""
│
│
│ -def live_version() -> str:
│ -    """Commit'as, iš kurio sukurta gyva svetainė (`?v=` žymė `index.html`)."""
│ -    blob = fetch(LIVE_ROOT + "index.html")
│ +def _version_of(blob: bytes | None) -> str:
│ +    """`?v=<commit>` žymė iš `index.html` baitų; tuščia, jei baitų nėra ar žymės nėra."""
│      if blob is None:
│          return ""
│      match = VERSION_PARAM.search(blob.decode("utf-8", "replace"))
│      return match.group(0)[3:] if match else ""
│ +
│ +
│ +def live_version(fresh: bool = True) -> str:
│ +    """Commit'as, iš kurio sukurta gyva svetainė (`?v=` žymė `index.html`).
│ +
│ +    `fresh=True` (numatytasis) klausia **su keitimo žyme**. Tai ne tas pats
│ +    klausimas, kaip „ką dabar atsakytų mano naršyklė“: `?v=` yra publikavimo
│ +    žymė, o GitHub Pages (per Fastly) laiko ir **teigiamą** `index.html` kopiją,
│ +    tad adresas be žymės gali atsakyti senu kūnu dar ilgai po to, kai failas
│ +    paskelbtas. Ši žymė yra vienintelis `deploy_pending` šaltinis, o iki #544
│ +    ji buvo vienintelis nuotolinis skaitymas, kuris neturėjo pakartojimo su
│ +    keitimo žyme: `compare()` (LL-197), `_shell_state()` ir `head_state()` tokį
│ +    atvejį jau skyrė nuo pasenusio turinio, o čia — ne. LL-201: laikinas
│ +    veidrodis, kurio `index.html` be žymės neša `bbbbbbbb`, o su žyme — repo
│ +    baitus, davė `shell_stale []`, `stale []`, `aux_stale []` ir vis dėlto
│ +    raudoną `verdict` („svetainė pastatyta iš bbbbbbbb … deploy nepasivijo per
│ +    3 s“). Vaikui tai reiškė „paleisk publikavimą“, nors publikavimas jau
│ +    įvyko, o bėgiklio `push_backlog()` toks veiksmas tik sukeltų `conflict`.
│ +
│ +    Skirtumas tarp be žymės ir su žyme gaunamo atsakymo įrašomas `CDN_VERSION`
│ +    ir pranešamas žodžiais, o ne nuslopinamas: vaiko naršyklė `?cb=` nededa,
│ +    todėl ji kurį laiką gali gauti seną `index.html`, t. y. senas `?v=` nuorodas
│ +    (LL-37). Būsena lieka „paskelbta“ kaip ir `CDN_STALE` atveju — vėlavimas
│ +    praeina pats, o kartoti publikavimo nereikia.
│ +
│ +    `fresh=False` — sąmoningai „ką atsako naršyklė“: rankiniam matavimui ir
│ +    zondams, kurie tikrina būtent krašto atsakymą.
│ +    """
│ +    blob = fetch(LIVE_ROOT + "index.html")
│ +    if blob is None:
│ +        return ""
│ +    version = _version_of(blob)
│ +    if not fresh:
│ +        return version
│ +    status, fresh_blob = fetch_answer(cache_busted(LIVE_ROOT + "index.html"))
│ +    if status != "ok":
│ +        # Su žyme neatsakė: tai ne „versija sena“, o „neišmatuota“. Grąžinama
│ +        # tai, ką davė paprastas skaitymas, o `live_error`/`deploy_pending`
│ +        # sprendžia `verdict()` — spėlioti nereikia (LL-37).
│ +        return version
│ +    deployed = _version_of(fresh_blob) or version
│ +    if deployed != version:
│ +        CDN_VERSION["count"] += 1
│ +        CDN_VERSION["items"].append({"edge": version or "?", "origin": deployed})
│ +    return deployed
│
│
│  def await_deploy(live: str, repo: str, skip: bool = False) -> tuple[str, int, bool]:
│ scripts/check_published.py
│ @@ -1722,7 +1722,14 @@
│      return state != "unreachable"
│
│
│ -def check_shell() -> dict:
│ +def check_shell(live_v: str | None = None) -> dict:
│ +    """Svetainės kodas: baitai ir versija.
│ +
│ +    `live_v` — jau išmatuota versija (žr. `live_version()`). Perduodama, nes
│ +    `report()` ją skaito prieš laukimą, o antras nepriklausomas skaitymas
│ +    skaitytų **kitą** krašto atsakymą ir tą patį faktą įvardytų du kartus
│ +    (LL-21). `None` — matuojama čia (rankiniam naudojimui).
│ +    """
│      files = shell_files()
│      with ThreadPoolExecutor(max_workers=6) as pool:
│          results = list(pool.map(lambda rel: (rel, _shell_state(rel)), files))
│ scripts/check_published.py
│ @@ -1750,7 +1750,7 @@
│          "shell_gone": missing,
│          "shell_unreachable": unreachable,
│          "shell_count": len(files),
│ -        "live_version": live_version(),
│ +        "live_version": live_v if live_v is not None else live_version(fresh=False),
│          "repo_version": repo_version(),
│      }
│
│ scripts/check_published.py
│ @@ -2038,6 +2038,8 @@
│      CDN_REFRESH["items"] = []
│      CDN_STALE["count"] = 0
│      CDN_STALE["items"] = []
│ +    CDN_VERSION["count"] = 0
│ +    CDN_VERSION["items"] = []
│      # Kurių klasių apskritai ieškoma — iš `grades.json`, ir tai yra
│      # **matavimas**, ne atsarginis variantas (`grade_scope()`). Anksčiau
│      # neperskaitytas sąrašas virdavo `[1]`, tad sugadintas `grades.json`
│ scripts/check_published.py
│ @@ -2109,7 +2109,7 @@
│                  aux_stale.append(item)
│
│      # Svetainės kodas: ką vaikas iš tikrųjų įkelia, o ne tik ką rodo turinio JSON.
│ -    shell = check_shell() if live_bytes_ok else {
│ +    shell = check_shell(live_v if live_bytes_ok else None) if live_bytes_ok else {
│          "shell_stale": [], "shell_unreachable": [], "shell_count": 0,
│          "live_version": "", "repo_version": "", "skipped": True,
│      }
│ scripts/check_published.py
│ @@ -2229,6 +2229,

… PRALEISTA 17725 SIMBOLIŲ IŠ 35725 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00544/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

index 82 / užduotys 359 / sim 82 / path 82 / PROBLEMŲ 0; `check_published.py --path-order` rc 0; `--scope` rc 0; `probe_check_published.py` 15/15; `probe_publish_sets.py` 50/50; `py_compile` OK.
│ +- **Sprendimas: sutampa.** `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, modulių ID, `path.json` seka ir vaiko `localStorage` raktai neliesti; push nedarytas (bėgiklio darbas). Failai repo: `scripts/check_published.py`, `scripts/probe_publish_sets.py`, `research/wiki/guidelines/pamokos.md` (LL-201), `research/wiki/changelog.md`.
│
│  ## 2026-11-25 (20:07) — Publikavimo patikra #541: repo 82 / paskelbta 82 prie `e1541604`, garsas 2 426/2 426; „deploy nepasivijo“ nebepranešamas, kai kopija atsilieka nuo `origin/main` (LL-198), sutampa
│
│ research/wiki/changelog.md
│ @@ -8,7 +8,7 @@
│  - **3 gyvi adresai (`curl`, kodas ir baitai):** `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → **200** (4 972 B); `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` → **200** (5 459 B); `content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json` → **200** (8 685 B). **Neigiama kontrolė:** `content/lt/grade-01/matematika/99-nera.json` → **404** (563 B).
│  - **Defektas ir taisymas (LL-201).** #537/#539/#541 taisė krašto kopiją **failo kūno** lygmenyje (`compare()` → LL-197, `_shell_state()`, `head_state()`), o `live_version()` — vienintelis nuotolinis skaitymas, kurio rezultatas eina į `verdict()` — liko be keitimo žymės. `?v=` yra atskiras krašto raktas, tad po publikavimo `index.html` be žymės kurį laiką atsako **senu** `?v=`, nors moduliai jau nauji. Matuota laikiname veidrodyje prieš pataisą: `shell_stale []`, `stale []`, `aux_stale []`, o `deploy_pending` True ir `verdict` raudonas („svetainė pastatyta iš bbbbbbbb … deploy nepasivijo per 3 s“). Vaidmens taisyklei tai reiškė „paleisk publikavimą“, nors publikavimas jau įvyko. Dabar: `live_version(fresh=True)` numatytai klausia su `cache_busted()`, skirtumas tarp be žymės ir su žyme gaunamo atsakymo įrašomas `CDN_VERSION` ir pranešamas žodžiais („CDN SENA VERSIJA“), `check_shell(live_v)` nebeskaitykite versijos antrą kartą (LL-21), o dedupe užtikrina, kad `await_deploy()` ciklas vieno fakto nepraneštų 4 kartus.
│  - **Įrodymas repo (`scripts/probe_publish_sets.py` → 50/50, rc 0, be interneto).** X: veidrodis, kurio `index.html` be žymės neša `?v=deadbeef`, o su žyme — repo versiją → `verdict` žalias, `deploy_pending` False, `cdn_version_stale_count` 1 su pora `deadbeef → HEAD`, CLI spausdina „CDN SENA VERSIJA“, pakartotinas skaitymas skaičiaus nedubliuoja. X2 (neigiama kontrolė): ir be žymės, ir su ja sena versija → `deploy_pending` True ir „deploy nepasivijo“ **lieka**, `cdn_version_stale_count` 0. Papildomai sutaisytas pats zondas: `publish()` veidrodis anksčiau `index.html` kopijuodavo pažodžiui (be `?v=`), t. y. matuodavo būseną, kurios svetainėje nebūna — todėl X pirmą kartą krito; dabar veidrodis prirašo `?v=<HEAD>`, kaip `pages.yml`. A–W nepakito.
│ -- **Vartai po pakeikimo:** `validate_content.py` 0/0; `check_registry.py` index 82 / užduotys 359 / sim 82 / path 82 / PROBLEMŲ 0; `check_published.py --path-order` rc 0; `--scope` rc 0; `probe_check_published.py` 15/15; `probe_publish_sets.py` 50/50; `py_compile` OK.
│ +- **Vartai po pakeitimo:** `validate_content.py` 0/0; `check_registry.py` index 82 / užduotys 359 / sim 82 / path 82 / PROBLEMŲ 0; `check_published.py --path-order` rc 0; `--scope` rc 0; `probe_check_published.py` 15/15; `probe_publish_sets.py` 50/50; `py_compile` OK.
│  - **Sprendimas: sutampa.** `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, modulių ID, `path.json` seka ir vaiko `localStorage` raktai neliesti; push nedarytas (bėgiklio darbas). Failai repo: `scripts/check_published.py`, `scripts/probe_publish_sets.py`, `research/wiki/guidelines/pamokos.md` (LL-201), `research/wiki/changelog.md`.
│
│  ## 2026-11-25 (20:07) — Publikavimo patikra #541: repo 82 / paskelbta 82 prie `e1541604`, garsas 2 426/2 426; „deploy nepasivijo“ nebepranešamas, kai kopija atsilieka nuo `origin/main` (LL-198), sutampa
│ research/wiki/changelog.md
│ @@ -6,7 +6,7 @@
│
│  - **Būsena (`python3 scripts/check_published.py`, rc 0, po pataisymo):** „Repozitorija: 82 moduliai / Klasės: grade-01 (statusas „live“) / Paskelbta: 82 moduliai“ (`grade-01`: repo 82, gyvai 82); `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `missing_in_repo`, `live_missing`, `live_gone`, `stale*`, `aux_*`, `shell_*` — visi `[]`; garsas **2 426/2 426**, vardai 2 426/2 426, dydžiai 2 426/2 426; svetainės kodas 19 failų; `live_version` = `repo_version` = `bc52d5a3`, `deploy_pending` false, `unpushed_commits` 0, `behind_commits` 0, `cdn_version_stale_count` 0; pervedamas ID vienas (`03-sakinio-tvarka` → `03-sakinio-zodziai`, `alias_ok: true`); `path_reordered` `[]`, 9 moduliai įterpti į maršruto vidurį (įvardyti, įterpimas leidžiamas); `verdict` = „sutampa“.
│  - **3 gyvi adresai (`curl`, kodas ir baitai):** `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → **200** (4 972 B); `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` → **200** (5 459 B); `content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json` → **200** (8 685 B). **Neigiama kontrolė:** `content/lt/grade-01/matematika/99-nera.json` → **404** (563 B).
│ -- **Defektas ir taisymas (LL-201).** #537/#539/#541 taisė krašto kopiją **failo kūno** lygmenyje (`compare()` → LL-197, `_shell_state()`, `head_state()`), o `live_version()` — vienintelis nuotolinis skaitymas, kurio rezultatas eina į `verdict()` — liko be keitimo žymės. `?v=` yra atskiras krašto raktas, tad po publikavimo `index.html` be žymės kurį laiką atsako **senu** `?v=`, nors moduliai jau nauji. Matuota laikiname veidrodyje prieš pataisą: `shell_stale []`, `stale []`, `aux_stale []`, o `deploy_pending` True ir `verdict` raudonas („svetainė pastatyta iš bbbbbbbb … deploy nepasivijo per 3 s“). Vaidmens taisyklei tai reiškė „paleisk publikavimą“, nors publikavimas jau įvyko. Dabar: `live_version(fresh=True)` numatytai klausia su `cache_busted()`, skirtumas tarp be žymės ir su žyme gaunamo atsakymo įrašomas `CDN_VERSION` ir pranešamas žodžiais („CDN SENA VERSIJA“), `check_shell(live_v)` nebeskaitykite versijos antrą kartą (LL-21), o dedupe užtikrina, kad `await_deploy()` ciklas vieno fakto nepraneštų 4 kartus.
│ +- **Defektas ir taisymas (LL-201).** #537/#539/#541 taisė krašto kopiją **failo kūno** lygmenyje (`compare()` → LL-197, `_shell_state()`, `head_state()`), o `live_version()` — vienintelis nuotolinis skaitymas, kurio rezultatas eina į `verdict()` — liko be keitimo žymės. `?v=` yra atskiras krašto raktas, tad po publikavimo `index.html` be žymės kurį laiką atsako **senu** `?v=`, nors moduliai jau nauji. Matuota laikiname veidrodyje prieš pataisą: `shell_stale []`, `stale []`, `aux_stale []`, o `deploy_pending` True ir `verdict` raudonas („svetainė pastatyta iš bbbbbbbb … deploy nepasivijo per 3 s“). Vaidmens taisyklei tai reiškė „paleisk publikavimą“, nors publikavimas jau įvyko. Dabar: `live_version(fresh=True)` numatytai klausia su `cache_busted()`, skirtumas tarp be žymės ir su žyme gaunamo atsakymo įrašomas `CDN_VERSION` ir pranešamas žodžiais („CDN SENA VERSIJA“), `check_shell(live_v)` versijos antrą kartą nebeskaito (LL-21), o dedupe užtikrina, kad `await_deploy()` ciklas vieno fakto nepraneštų 4 kartus.
│  - **Įrodymas repo (`scripts/probe_publish_sets.py` → 50/50, rc 0, be interneto).** X: veidrodis, kurio `index.html` be žymės neša `?v=deadbeef`, o su žyme — repo versiją → `verdict` žalias, `deploy_pending` False, `cdn_version_stale_count` 1 su pora `deadbeef → HEAD`, CLI spausdina „CDN SENA VERSIJA“, pakartotinas skaitymas skaičiaus nedubliuoja. X2 (neigiama kontrolė): ir be žymės, ir su ja sena versija → `deploy_pending` True ir „deploy nepasivijo“ **lieka**, `cdn_version_stale_count` 0. Papildomai sutaisytas pats zondas: `publish()` veidrodis anksčiau `index.html` kopijuodavo pažodžiui (be `?v=`), t. y. matuodavo būseną, kurios svetainėje nebūna — todėl X pirmą kartą krito; dabar veidrodis prirašo `?v=<HEAD>`, kaip `pages.yml`. A–W nepakito.
│  - **Vartai po pakeitimo:** `validate_content.py` 0/0; `check_registry.py` index 82 / užduotys 359 / sim 82 / path 82 / PROBLEMŲ 0; `check_published.py --path-order` rc 0; `--scope` rc 0; `probe_check_published.py` 15/15; `probe_publish_sets.py` 50/50; `py_compile` OK.
│  - **Sprendimas: sutampa.** `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, modulių ID, `path.json` seka ir vaiko `localStorage` raktai neliesti; push nedarytas (bėgiklio darbas). Failai repo: `scripts/check_published.py`, `scripts/probe_publish_sets.py`, `research/wiki/guidelines/pamokos.md` (LL-201), `research/wiki/changelog.md`.
Darbas baigtas. Ataskaita:

**`check_published.py` išvestis (repo / paskelbta / neišstumta)**

```
Repozitorija: 82 moduliai
Klasės:       grade-01 (statusas „live“ iš content/lt/grades.json)
Paskelbta:    82 moduliai
  · grade-01: repo 82, gyvai 82
verdict = sutampa     rc 0

missing_on_live, hidden_locally, not_in_path, orphan_files, missing_in_repo,
live_missing, live_gone, stale*, aux_*, shell_*  — visi []
garsas 2426/2426 (vardai 2426/2426 = baitai ir tekstas, dydžiai 2426/2426 = Content-Length)
svetainės kodas 19 failų
live_version = repo_version = bc52d5a3, deploy_pending false
unpushed_commits 0, behind_commits 0, cdn_version_stale_count 0, cdn_stale_count 0
pervedamas ID vienas (03-sakinio-tvarka → 03-sakinio-zodziai, alias_ok)
```

**3 gyvi adresai (kodas ir baitai)**
```
matematika/04-skaiciu-tiese.json         200  4 972 B
lietuviu-kalba/03-sakinio-zodziai.json   200  5 459 B
pasaulio-pazinimas/10-gyvunu-grupes.json 200  8 685 B
neigiama kontrolė matematika/99-nera.json 404  563 B
```

**Ką pakeičiau** (defektas mano paties įrankyje; vaikui nematomas, bet siuntė taisyti ne to)

#537/#539/#541 taisė krašto kopiją **failo kūno** lygmenyje (`compare()`, `_shell_state()`, `head_state()`). Liko ketvirta tos pačios šeimos atmaina: `live_version()` — vienintelis nuotolinis skaitymas, kurio rezultatas eina į `verdict()` — ėjo be keitimo žymės. `?v=` yra atskiras krašto raktas, tad po publikavimo `index.html` be žymės dar atsako **senu** `?v=`, nors moduliai jau nauji.

Matuota prieš pataisą laikiname veidrodyje: `shell_stale []`, `stale []`, `aux_stale []`, o `deploy_pending` True ir `verdict` raudonas („svetainė pastatyta iš bbbbbbbb … deploy nepasivijo per 3 s“). Vaidmens taisyklei tai reiškia „paleisk publikavimą“, nors publikavimas jau įvyko — o bėgiklio `push_backlog()` kelyje toks pakartojimas baigiasi `conflict`.

- `scripts/check_published.py` — `live_version(fresh=True)`, `_version_of()`, `CDN_VERSION`; `check_shell(live_v)` versijos antrą kartą nebeskaito; dedupe, kad `await_deploy()` ciklas vieno fakto nepraneštų 4 kartus; CLI eilutė „CDN SENA VERSIJA“ ir sėkmės eilutės uodega.
- `scripts/probe_publish_sets.py` — X (krašto sena `?v=` → žalia, faktas įvardytas, skaičius nedubliuojamas) ir X2 (neigiama kontrolė: ir su žyme sena → raudona lieka). Papildomai sutaisytas pats veidrodis: jis `index.html` kopijuodavo pažodžiui, be `?v=` žymės, kurią prirašo `pages.yml` — todėl X pirmą kartą krito. **50/50**, rc 0.
- `research/wiki/guidelines/pamokos.md` — LL-201 (naujas tipas: versija matuota be keitimo žymės, o baitai su ja — tas pats kraštas, du atsakymai).
- `research/wiki/changelog.md` — #544 įrašas.

**Vartai po pakeitimo**
`validate_content.py` 0/0 · `check_registry.py` index 82 / užduotys 359 / sim 82 / path 82 / PROBLEMŲ 0 · `check_language.py --grade 1 --strict` 0/0 · `check_audio.py` 1 213 tekstų / 2 426 įrašų · `check_refs.py` 27/27 · `check_docs_facts.py` sutampa · `check_lessons.py` 201 su 4 laukais · `--path-order` rc 0 · `--scope` rc 0 · visi 7 zondai 135/135 · `py_compile` OK.

**Sprendimas: sutampa.** Nereikėjo nieko atšaukti; pataisyta tik savo įrankio diagnostika. Neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, modulių ID, `path.json` seka, vaiko `localStorage` raktai. Push nedarytas (bėgiklio darbas).

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-e0d16dfd1c944c90d3830675b9d277cfb9203c1eaaf57a3ee4b50cd405117450
```
