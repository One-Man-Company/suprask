# publikavimo-agentas — 2026-11-24T0623

- paleidimas: #495 (manual)
- trukmė: 1219s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/probe495_audio_size.py
│ @@ -0,0 +1,60 @@
│ +"""Zondas: ar gyvo garso failo Content-Length sutampa su disko dydziu.
│ +
│ +Tikrina VISUS manifeste nurodytus irasus (ne megini), HEAD uzklausa.
│ +"""
│ +import json, os, pathlib, urllib.request, urllib.error
│ +from concurrent.futures import ThreadPoolExecutor
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +BASE = "https://one-man-company.github.io/suprask/"
│ +MAN = ROOT / "assets/audio/lt/manifest.json"
│ +UA = {"User-Agent": "suprask-probe/1.0"}
│ +
│ +
│ +def entries():
│ +    data = json.loads(MAN.read_text(encoding="utf-8"))
│ +    out = []
│ +    for key, val in data.items():
│ +        if isinstance(val, dict):
│ +            for form in ("n", "s"):
│ +                rel = val.get(form)
│ +                if isinstance(rel, str):
│ +                    out.append(rel)
│ +        elif isinstance(val, list):
│ +            out += [r for r in val if isinstance(r, str)]
│ +    return out
│ +
│ +
│ +def head(rel):
│ +    url = BASE + "assets/audio/lt/" + rel
│ +    for attempt in (0, 1):
│ +        try:
│ +            req = urllib.request.Request(url, headers=UA, method="HEAD")
│ +            with urllib.request.urlopen(req, timeout=25) as resp:
│ +                return rel, int(resp.headers.get("Content-Length") or 0)
│ +        except urllib.error.HTTPError as exc:
│ +            return rel, -exc.code
│ +        except Exception:
│ +            if attempt == 0:
│ +                continue
│ +            return rel, -1
│ +    return rel, -1
│ +
│ +
│ +rels = entries()
│ +print("irasai:", len(rels))
│ +rows = []
│ +with ThreadPoolExecutor(max_workers=12) as pool:
│ +    for rel, live in pool.map(head, rels):
│ +        disk = (MAN.parent / rel).stat().st_size if (MAN.parent / rel).exists() else None
│ +        rows.append((rel, disk, live))
│ +
│ +diff = [r for r in rows if r[1] is not None and r[2] > 0 and r[1] != r[2]]
│ +zero = [r for r in rows if r[2] == 0]
│ +bad = [r for r in rows if r[2] < 0]
│ +print("sutampa:", sum(1 for r in rows if r[1] == r[2]))
│ +print("skiriasi dydis:", len(diff))
│ +for r in diff[:10]:
│ +    print("  ", r)
│ +print("Content-Length 0:", len(zero))
│ +print("nepasiekta/404:", len(bad), bad[:5])
│ scripts/check_published.py
│ @@ -517,16 +517,57 @@
│
│
│  def check_audio(sample: int | None = None) -> dict:
│ +    """Ar garso failai yra svetainėje IR ar jie tokie patys kaip repo.
│ +
│ +    Iki #495 buvo klausiama tik „ar failas ten yra“ (`ok` ir `0 B`). To
│ +    pakako 404 atvejui, bet ne antram teiginiui: svetainė gali atsakyti 200 ir
│ +    **kitokiu** failu — nutrūkusiu, pusiau įkeltu, senu. Vaikui tai ta pati
│ +    klaida kaip 404 (girdi tylą ar pusę žodžio), o vartai buvo žali, nes
│ +    `audio_name_digest()` lygina **repo** baitus su repo vardu, o ne su tuo,
│ +    ką siunčia svetainė (LL-167: vartai lygina tai, kas yra, o ne tai, į ką
│ +    nurodoma).
│ +
│ +    Dydis yra pigiausias įrodymas abiem pusėms: HEAD jau grąžina
│ +    `Content-Length`, o disko dydį turime vietoje. Todėl papildomų užklausų
│ +    nereikia — nauja informacija ateina iš to paties atsakymo.
│ +
│ +    Būsenos (kaip `audio_name_digest()`, kad sumos nemeluotų — LL-37):
│ +      - `size_checked` — kiek failų dydį pavyko palyginti (failas yra
│ +        svetainėje ir repo);
│ +      - `size_mismatch` — svetainė siunčia kitokio dydžio failą. Taisymas:
│ +        paleisti publikavimą iš naujo, o ne pergeneruoti garsą (baitai repo
│ +        sveiki — tai įrodo vardo galas).
│ +    Failas, kurio repo nėra, čia neįskaitomas: jį įvardija
│ +    `audio_name_digest()` kaip `absent`, o svetainėje — `missing`; trečia
│ +    eilutė už tą patį defektą būtų LL-21 (skaičius, kuris kaltina ne tą).
│ +    """
│      rels, total = audio_paths(sample)
│      if not total:
│          return {"total": 0, "checked": 0, "sampled": False,
│                  "missing": [], "empty": [], "unreachable": [],
│ +                "size_checked": 0, "size_mismatch": [],
│                  "note": "manifestas neperskaitytas — garso patikra neįvyko"}
│      with ThreadPoolExecutor(max_workers=10) as pool:
│          results = list(pool.map(lambda rel: (rel, _audio_state(rel)), rels))
│      missing = [rel for rel, (state, _) in results if state == "missing"]
│      empty = [rel for rel, (state, _) in results if state == "empty"]
│      unreachable = [rel for rel, (state, _) in results if state == "unreachable"]
│ +    # Dydis lyginamas tik tada, kai failas svetainėje tikrai yra: priešingu
│ +    # atveju `-1` ar `0` būtų palyginti su disku ir tas pats defektas būtų
│ +    # praneštas du kartus skirtingais žodžiais (LL-129).
│ +    size_mismatch: list[dict] = []
│ +    size_checked = 0
│ +    for rel, (state, live_size) in results:
│ +        if state != "ok":
│ +            continue
│ +        try:
│ +            disk_size = (AUDIO_MANIFEST.parent / rel).stat().st_size
│ +        except OSError:
│ +            continue
│ +        size_checked += 1
│ +        if disk_size != live_size:
│ +            size_mismatch.append({"file": rel, "disk_bytes": disk_size,
│ +                                  "live_bytes": live_size})
│      return {
│          "total": total,
│          "checked": len(rels),
│ @@ -534,6 +575,8 @@
│          "missing": missing,
│          "empty": empty,
│          "unreachable": unreachable,
│ +        "size_checked": size_checked,
│ +        "size_mismatch": size_mismatch,
│          "note": "",
│      }
│
│ scripts/check_published.py
│ @@ -1832,6 +1832,12 @@
│          reasons.append(f"{len(audio['empty'])} tuščias garso failas")
│      if audio.get("unreachable"):
│          reasons.append(f"{len(audio['unreachable'])} nepasiekiamas garso failas")
│ +    # Failas yra, bet svetainė siunčia kitokio dydžio baitus (nutrūkęs, pusiau
│ +    # įkeltas, senas). Tai ne „trūksta garso“: pergeneravimas nieko nepakeis,
│ +    # o publikavimas pakeis — todėl ir priežastis sava (LL-129, LL-2

… PRALEISTA 22358 SIMBOLIŲ IŠ 40358 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00495/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

ailas yra svetainėje“ (200 ir dydis > 0). Svetainė gali atsakyti 200 ir **pusę** failo (nutrūkęs įkėlimas, senas failas tokiu pačiu vardu) — tada nėra nei 404, nei `empty`, o `audio_name_digest()` žalias, nes jis lygina **repo** baitus su **repo** vardu, ne su tuo, ką siunčia svetainė. Vaikas girdi pusę žodžio, o visi vartai žali.
│  - **Ką pakeičiau (tik `scripts/`, svetainės kodas nepaliestas):** `check_audio()` dabar grąžina `size_checked` ir `size_mismatch` (`file`, `disk_bytes`, `live_bytes`) ir lygina HEAD `Content-Length` su disko `stat()` — **nė vienos papildomos užklausos**, informacija jau atėjo su HEAD; dydis lyginamas tik kai failas tikrai yra (kitaip tas pats defektas būtų praneštas dviem žodžiais, LL-129); `verdict()` turi atskirą priežastį „…garso failas svetainėje kitokio dydžio nei repo (nutrūkęs įrašas)“ — taisymas paleisti publikavimą, o ne pergeneruoti garsą; pranešime visada spausdinama eilutė „dydis: N iš N — visi tokio pat dydžio (diskas = Content-Length)“, o sėkmės eilutėje — „garso dydžiai 2 124/2 124 = Content-Length“, kad „visi pasiekiami“ nebūtų skaitomas kaip pilnas atsakymas (LL-37).
│  - **Teiginys turi paleidžiamą įrodymą (LL-36):** `python3 scripts/probe_check_published.py` → **15/15**, rc 0, be išorinių užklausų (vietinis `http.server`). Du nauji žingsniai: G sveikas HTTP veidrodis → `size_checked` 2, `size_mismatch` 0, verdict žalias; H sutrumpintas mp3 serveryje → `size_mismatch` 1 su **abu dydžiais** (15 825 B prieš 15 925 B) ir verdict „…kitokio dydžio nei repo (nutrūkęs įrašas)“; I failą atkūrus → vėl žalia. Zondo pirmas bėgimas pats parodė tą pačią LL-167 atmainą: kai disko ir serverio katalogas buvo vienas, sutrumpintas failas buvo lyginamas su savimi ir davė 0 neatitikimų — todėl veidrodis dabar sąmoningai dviejų katalogų.
│ +- **Neigiama kontrolė per patį įrankį, ne tik per zondą:** pilnas svetainės veidrodis (`cp -al`, 78 MB, 2 124 mp3) → numatytasis bėgimas **rc 0**; vieną mp3 pakeitus pusės ilgio **serverio** kopija (repo failas nepalytėtas — `stat` rodo tuos pačius 15 925 B ir tą patį inode) → **rc 1** ir vienintelė priežastis „1 garso failas svetainėje kitokio dydžio nei repo (nutrūkęs įrašas)“, eilutėje `n/5feceb66ffc86f38-541e670e.mp3 — svetainėje 7 962 B, repo 15 925 B`; atstačius failą → vėl **rc 0**. Visos kitos kategorijos tame pačiame bėgime liko `[]`, tad priežastis tikrai ta, o ne triukšmas.
│ +- **Sprendimo sakinys CLI išvestyje:** iki šiol `check_published.py` žmogui spausdindavo tik detalių eilutes, o `verdict` sakinį turėjo tik `--json` ir dashboard'as. Dabar nepavykus bėgimui spausdinama `SPRENDIMAS: nepublikuota — …` su tomis pačiomis priežastimis (LL-10 — būsena iš to paties šaltinio, iš kurio imamas rc), kad nauja priežastis nebūtų matoma vien JSON'e.
│  - **Poveikis šiandien nulinis, bet ne nematuotas:** prieš įjungiant išmatuota, kad 2 124/2 124 `Content-Length` = disko baitai, `Content-Length` 0 atvejų 0, 404 0 (1 062 poros × n/s, HEAD per gyvą svetainę). Tai reiškia, kad šiandien nė vienas vaikas nepraranda garso — bet pirmas nutrūkęs mp3 anksčiau praeidavo visas patikras žalias.
│  - **Vartai po pakeitimo:** `validate_content.py --grade 1 --strict` → 0 klaidų / 0 įspėjimų, rc 0; `check_registry.py --grade 1` → „kryptys 9 · index 73 · failai 73 · užduotys 322 (optional 73) · sim 73 · path 73 · našlaičiai 0 / PROBLEMŲ: 0“; `check_docs_facts.py` → „Sutampa su failais.“; `check_agents.py` rc 0 (15 vaidmenų, 1 senas įspėjimas apie sisteminius pasiūlymus); `check_lessons.py` → **168** įrašai (nauja LL-168); `check_published.py` rc 0 (1 min 11 s, 2 124 HEAD užklausos).
│  - **Nepadaryta ir pasakyta (LL-36):** naršyklės matavimo (360 px / 200 % teksto) šiame paleidime nėra — keistas tik `scripts/` ir `research/wiki/guidelines/pamokos.md`, o svetainės kodas nepaliestas; geometrijos neteigiu. `git push` nedarytas (bėgiklio darbas).
│ agents/state.json
│ @@ -527,6 +527,43 @@
│      "open_advisories": "#30960 / agents/proposals/2026-11-20-publikavimo-agentas-ci-registry.json — CI (validate.yml) nepaleidžia check_registry.py; .github/workflows/** ne šio vaidmens failas",
│      "notes": "Nieko nešalinta, joks ID nepernumeruotas; content/**, assets/**, docs/**, AGENTS.md, .github/workflows/** neliesti; jokio git push iš agento. Gyvos naršyklės (check_view.py) patikros šiame paleidime nepaleistos — biudžetas baigėsi; 360 px elgsena remiasi praėjusių paleidimų matavimu."
│    },
│ +  "last_publish_check_495": {
│ +    "date": "2026-11-24T06:45:00",
│ +    "run_id": 495,
│ +    "role": "publikavimo-agentas",
│ +    "head_sha": "643c3114",
│ +    "main_sha": "643c3114",
│ +    "unpublished_commits": 0,
│ +    "unpushed_checked": true,
│ +    "worktree": "švarus prieš darbą (git status --porcelain -uall → 0 eilučių); po darbo — scripts/check_published.py, scripts/probe_check_published.py, research/wiki/guidelines/pamokos.md, research/wiki/changelog.md",
│ +    "modules_local": 73,
│ +    "modules_live": 73,
│ +    "verdict": "sutampa",
│ +    "ids": "missing_on_live 0, hidden_locally 0, not_in_path 0, orphan_files 0, stale 0, stale_unknown 0, stale_unmeasured 0, live_missing 0, live_gone 0, missing_in_repo 0, aux_stale 0, aux_absent 0, aux_gone 0, shell_stale 0, shell_gone 0, shell_unreachable 0, shell_count 19, path_differs false, path_reordered [], path_inserted_midsequence [], path_order_checked true (grade-01 known_path_order.json 2026-11-23T15:40)",
│ +    "vanished_ids": "1 — 03-sakinio-tvarka → 03-sakinio-zodziai (resolved true, alias_ok true)",
│ +    "audio": "2124/2124 pasiekiami (sampled false), vardo maišas 2124/2124, dydžiai 2124/2124 = Content-Length (naujas matavimas #495), missing/empty/unreachable []",
│ +    "live_version": "643c3114",
│ +    "repo_version": "643c3114",
│ +    "deploy_pending": false,
│ +    "http_codes": {
│ +      "matematika/34-dvizenklis-plius-dvizenklis.json": "200 (7802 B)",
│ +      "pasaulio-pazinimas/38-traumu-prevencija.json": "200",
│ +      "lietuviu-kalba/03-sakinio-zodziai.json": "200 (5459 B)",
│ +      "assets/js/sims/matematika.js": "200 (232781 B)",
│ +      "matematika/99-nera.json": "404 (neigiama kontrolė)",
│ +      "pasaulio-pazinimas/41-traumu-prevencija.json": "404 — backlog target, kurio repo dar nėra"
│ +    },
│ +    "defect_fixed": "check_audio() matavo tik 'failas yra' (200 ir >0 B), ne 'tie patys baitai': nutrūkęs/pusiau įkeltas mp3 svetainėje būtų žalias, o audio_name_digest() lygina repo baitus su repo vardu. Dabar lyginamas HEAD Content-Length su disko stat() → size_checked / size_mismatch, atskira verdict priežastis, eilutė 'dydis: N iš N' ir sėkmės eilutėje 'garso dydžiai N/N = Content-Length'; CLI nepavykus dabar spausdina SPRENDIMAS sakinį.",
│ +    "measured_before": "2124/2124 Content-Length = disko baitai, Content-Length 0 → 0, 404 → 0 (HEAD per gyvą svetainę; poveikis šiandien nulinis)",
│ +    "probe": "scripts/probe_check_published.py → 15/15 rc 0 (G sveikas HTTP veidrodis; H sutrumpintas mp3 → size_mismatch 1 su 15825/15925 B ir verdict; I atkūrus → žalia). Pirmas zondo bėgimas rodė 0 neatitikimų, nes diskas ir serveris buvo tas pats katalogas (LL-167 atmaina) — pataisyta dviem katalogais.",
│ +    "negative_control_cli": "pilnas veidrodis cp -al (78 MB) → rc 0; serverio mp3 pusė ilgio (repo failas nepalytėtas, tas pats inode ir 15925 B) → rc 1, vienintelė priežastis 'nutrūkęs įrašas', įvardytas n/5feceb66…mp3 (7962 prieš 15925 B); atstačius → rc 0",
│ +    "gates": "validate_content --grade 1 --strict 0/0 rc 0; check_registry --grade 1 index 73 / failai 73 / užduotys 322 / sim 73 / path 73 / našlaičiai 0, PROBLEMŲ 0; check_docs_facts 'Sutampa su failais'; check_agents rc 0 (15 vaidmenų, 1 senas įspėjimas); check_lessons 168 (LL-168); check_published numatytasis rc 0 per 1 min 11 s",
│ +    "decision": "sutampa",
│ +    "new_lesson": "LL-168 — Vartai, kurie klausia „ar yra“, kai vaikui svarbu „ar tas pats“ (research/wiki/guidelines/pamokos.md)",
│ +    "changelog": "research/wiki/changelog.md — įrašas 2026-11-24 (06:45)",
│ +    "not_verified": "Naršyklės matavimo (360 px / 200 % teksto) nėra — keistas tik scripts/ ir vienas wiki failas, geometrijos neteigiu. git push nedarytas (bėgiklio darbas).",
│ +    "notes": "Neliesta content/**, assets/**, docs/**, AGENTS.md, .github/workflows/**; joks modulio ID nepernumeruotas, nieko nešalinta. agents/state.json yra .gitignore."
│ +  },
│    "last_publish_check": {
│      "date": "2026-11-15T16:20:00",
│      "run_id": 303,
PASKELBIMO PATIKRA #495 — SPENDIMAS: SUTAMPA

check_published.py (numatytasis ir --json, rc 0, 1 min 11 s)
  Repozitorija: 73 moduliai / Paskelbta: 73 moduliai (grade-01: repo 73, gyvai 73)
  missing_on_live, hidden_locally, not_in_path, orphan_files, stale, stale_unknown, live_missing,
  live_gone, missing_in_repo, aux_stale, aux_absent, aux_gone, shell_stale, shell_gone,
  shell_unreachable — visi []
  path_differs false · path_reordered [] · path_inserted_midsequence [] · path_order_checked true
  (grade-01 scripts/known_path_order.json 2026-11-23T15:40)
  shell_count 19 · garsas 2124/2124 · vardo maišas 2124/2124 · dydžiai 2124/2124
  live_version = repo_version = 643c3114 · deploy_pending false · unpushed_commits 0
  Pervadintas ID vienas ir sutvarkytas: 03-sakinio-tvarka → 03-sakinio-zodziai (resolved, alias_ok)

HTTP kodai (curl, gyva svetainė)
  content/lt/grade-01/matematika/34-dvizenklis-plius-dvizenklis.json → 200 (7 802 B)
  content/lt/grade-01/pasaulio-pazinimas/38-traumu-prevencija.json → 200
  content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json → 200 (5 459 B)
  assets/js/sims/matematika.js → 200 (232 781 B)
  neigiama kontrolė: matematika/99-nera.json → 404 · pasaulio-pazinimas/41-traumu-prevencija.json → 404
  (pastarasis yra programos spragos `target`, kurio repo dar nėra — 404 teisingas)

KĄ PADARIAU (failai)
  Radau defektą savo paties įrankyje: check_audio() šešis paleidimus klausė „ar failas YRA
  svetainėje“ (200 ir >0 B), o ne „ar ten TIE PATYS baitai“. Svetainė gali atsakyti 200 ir pusę
  mp3 — tada nėra nei 404, nei empty, audio_name_digest() žalias (jis lygina repo baitus su repo
  vardu), o vaikas girdi pusę žodžio.

  scripts/check_published.py — check_audio() dabar grąžina size_checked / size_mismatch ir lygina
  HEAD Content-Length su disko stat() (jokių papildomų užklausų); verdict() turi atskirą priežastį
  „…kitokio dydžio nei repo (nutrūkęs įrašas)“; pranešime eilutė „dydis: N iš N“, sėkmės eilutėje
  „garso dydžiai N/N = Content-Length“; nepavykus bėgimui CLI dabar spausdina SPRENDIMAS sakinį
  (anksčiau jį turėjo tik --json ir dashboard).
  scripts/probe_check_published.py — 15/15 (G sveikas HTTP veidrodis, H sutrumpintas mp3 → 15 825
  prieš 15 925 B, I atkūrus → žalia).
  research/wiki/guidelines/pamokos.md — nauja LL-168 „Vartai, kurie klausia ‚ar yra‘, kai vaikui
  svarbu ‚ar tas pats‘“; check_lessons 168.
  research/wiki/changelog.md — įrašas „2026-11-24 (06:45) — Publikavimo patikra #495“.

ĮRODYMAI
  Prieš įjungiant: 2 124/2 124 Content-Length = disko baitai, 0 B atvejų 0, 404 0 (poveikis šiandien
  nulinis, ne nematuotas).
  Neigiama kontrolė per patį įrankį: pilnas veidrodis (cp -al, 78 MB) → rc 0; vieną serveryje
  patiektą mp3 sutrumpinus per pusę (repo failas nepalytėtas — tas pats inode, 15 925 B) → rc 1,
  vienintelė priežastis „1 garso failas svetainėje kitokio dydžio nei repo (nutrūkęs įrašas)“,
  eilutėje n/5feceb66…mp3 — 7 962 B prieš 15 925 B; atstačius → rc 0.
  Vartai: validate_content --grade 1 --strict 0/0 rc 0 · check_registry 0 problemų (index 73 ·
  failai 73 · užduotys 322 · sim 73 · path 73 · našlaičiai 0) · check_docs_facts „Sutampa su
  failais“ · check_agents rc 0 · check_lessons 168.

NEPADARYTA IR PASAKYTA
  Naršyklės matavimo (360 px / 200 %) nėra — keisti tik scripts/ ir du wiki failai, svetainės kodas
  nepaliestas, geometrijos neteigiu. git push nedarytas (bėgiklio darbas). Neliesta: content/**,
  assets/**, docs/**, AGENTS.md, .github/workflows/**; joks modulio ID nepernumeruotas, nieko
  nešalinta.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-442ff894307267428e6586279fc7256e68fe79513cde12b8a03b41a34ffb02b2
```
