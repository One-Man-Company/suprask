# publikavimo-agentas — 2026-11-14T2304

- paleidimas: #292 (manual)
- trukmė: 712s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/probe292_audio.py
│ @@ -0,0 +1,86 @@
│ +#!/usr/bin/env python3
│ +"""Zondas #292: ar VISI garso failai, kuriuos svetainė gali paprašyti, realiai
│ +pasiekiami gyvai. `check_published.py` lygina manifestą baitais, bet patys mp3
│ +failai nelyginami — manifestas gali sutapti, o failo serveryje nebuvo (LL-37:
│ +sąrašas skelbiamas pilnas, o tikrinama dalis).
│ +"""
│ +import json
│ +import hashlib
│ +import pathlib
│ +import subprocess
│ +import sys
│ +import time
│ +import urllib.request
│ +from concurrent.futures import ThreadPoolExecutor
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +LIVE = "https://one-man-company.github.io/suprask/"
│ +UA = {"User-Agent": "suprask-check/1.2"}
│ +
│ +
│ +def fetch(url, timeout=25):
│ +    req = urllib.request.Request(url, headers=UA)
│ +    with urllib.request.urlopen(req, timeout=timeout) as r:
│ +        return r.status, r.read()
│ +
│ +
│ +man_path = ROOT / "assets/audio/lt/manifest.json"
│ +man_bytes = man_path.read_bytes()
│ +man = json.loads(man_bytes)
│ +
│ +rels = set()
│ +for key, variants in man.items():
│ +    if isinstance(variants, dict):
│ +        for v in variants.values():
│ +            if isinstance(v, str) and v.endswith(".mp3"):
│ +                rels.add(v)
│ +    elif isinstance(variants, list):
│ +        for v in variants:
│ +            if isinstance(v, str) and v.endswith(".mp3"):
│ +                rels.add(v)
│ +print("manifest keys:", len(man), "unique mp3 refs:", len(rels))
│ +print("manifest sha256:", hashlib.sha256(man_bytes).hexdigest()[:16], "bytes:", len(man_bytes))
│ +
│ +disk = {str(p.relative_to(ROOT)) for p in (ROOT / "assets/audio").rglob("*.mp3")}
│ +print("mp3 on disk:", len(disk), "| in manifest not on disk:", len(rels - disk),
│ +      "| on disk not in manifest:", len(disk - rels))
│ +
│ +# git: ar visi mp3 yra repo (ne tik diske)
│ +tracked = subprocess.run(["git", "ls-files", "assets/audio"], cwd=ROOT,
│ +                         capture_output=True, text=True).stdout.split()
│ +tracked_mp3 = {t for t in tracked if t.endswith(".mp3")}
│ +print("mp3 in git:", len(tracked_mp3), "| not tracked:", len(disk - tracked_mp3))
│ +
│ +todo = sorted(rels)
│ +ids = {v: k for k, vs in man.items() for v in (vs.values() if isinstance(vs, dict) else vs)
│ +       if isinstance(v, str)}
│ +
│ +
│ +def check(rel):
│ +    url = LIVE + rel
│ +    for attempt in range(3):
│ +        try:
│ +            status, body = fetch(url)
│ +            if status == 200 and len(body) > 0:
│ +                want = hashlib.sha256((ROOT / rel).read_bytes()).hexdigest()
│ +                got = hashlib.sha256(body).hexdigest()
│ +                return rel, "ok" if want == got else "bytes-differ", len(body), attempt
│ +            return rel, f"status-{status}", len(body), attempt
│ +        except Exception as exc:  # noqa: BLE001
│ +            if attempt == 2:
│ +                return rel, f"err-{type(exc).__name__}", 0, attempt
│ +            time.sleep(1.0)
│ +
│ +
│ +t0 = time.time()
│ +with ThreadPoolExecutor(max_workers=16) as pool:
│ +    results = list(pool.map(check, todo))
│ +
│ … omitted 8 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/manifest_peek.py
│ @@ -0,0 +1,6 @@
│ +import json
│ +m = json.load(open("assets/audio/lt/manifest.json"))
│ +for x in list(m)[:3]:
│ +    print(repr(x), json.dumps(m[x], ensure_ascii=False)[:200])
│ +v = list(m.values())[0]
│ +print("FIRST_REF", v if isinstance(v, str) else list(v.values())[0])
│ profiles/deepseek41flash/cache/scratch/probe292_audio2.py
│ @@ -0,0 +1,79 @@
│ +#!/usr/bin/env python3
│ +"""Zondas #292 (pataisytas): visi garso failai, kuriuos svetainė gali paprašyti.
│ +
│ +Manifesto reikšmės yra santykinės `assets/audio/lt/` atžvilgiu (pvz. "n/ab-12.mp3"),
│ +ne repo šaknies atžvilgiu. Pirmas bandymas klaidingai klijavo prie LIVE šaknies ir
│ +gavo 1138 × HTTPError — tai buvo zondo defektas, ne svetainės.
│ +"""
│ +import json
│ +import hashlib
│ +import pathlib
│ +import subprocess
│ +import sys
│ +import time
│ +import urllib.request
│ +from concurrent.futures import ThreadPoolExecutor
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +AUDIO = ROOT / "assets/audio/lt"
│ +LIVE = "https://one-man-company.github.io/suprask/assets/audio/lt/"
│ +UA = {"User-Agent": "suprask-check/1.2"}
│ +
│ +
│ +def fetch(url, timeout=30):
│ +    req = urllib.request.Request(url, headers=UA)
│ +    with urllib.request.urlopen(req, timeout=timeout) as r:
│ +        return r.status, r.read()
│ +
│ +
│ +man = json.loads((AUDIO / "manifest.json").read_bytes())
│ +rels, owner = set(), {}
│ +for key, variants in man.items():
│ +    for v in variants.values():
│ +        if isinstance(v, str) and v.endswith(".mp3"):
│ +            rels.add(v)
│ +            owner.setdefault(v, key)
│ +
│ +print("manifest keys:", len(man), "| unique mp3 refs:", len(rels))
│ +disk = {str(p.relative_to(AUDIO)) for p in AUDIO.rglob("*.mp3")}
│ +print("mp3 on disk:", len(disk),
│ +      "| manifesto nurodyta, bet diske nėra:", len(rels - disk),
│ +      "| diske yra, manifeste nėra:", len(disk - rels))
│ +tracked = subprocess.run(["git", "ls-files", "assets/audio"], cwd=ROOT,
│ +                         capture_output=True, text=True).stdout.split()
│ +tracked_mp3 = {t[len("assets/audio/lt/"):] for t in tracked
│ +               if t.endswith(".mp3") and t.startswith("assets/audio/lt/")}
│ +print("mp3 in git:", len(tracked_mp3), "| diske, bet ne git:", len(disk - tracked_mp3))
│ +
│ +
│ +def check(rel):
│ +    url = LIVE + rel
│ +    want = hashlib.sha256((AUDIO / rel).read_bytes()).hexdigest()
│ +    for attempt in range(3):
│ +        try:
│ +            status, body = fetch(url)
│ +            if status == 200 and body:
│ +                return rel, ("ok" if hashlib.sha256(body).hexdigest() == want else "bytes-differ"), len(body), attempt
│ +            return rel, f"status-{status}", len(body), attempt
│ +        except urllib.error.HTTPError as exc:
│ +            return rel, f"http-{exc.code}", 0, attempt
│ +        except Exception as exc:  # noqa: BLE001
│ +            if attempt == 2:
│ +                return rel, f"err-{type(exc).__name__}", 0, attempt
│ +            time.sleep(1.0)
│ +
│ +
│ +todo = sorted(rels)
│ +t0 = time.time()
│ +with ThreadPoolExecutor(max_workers=12) as pool:
│ +    results = list(pool.map(check, todo))
│ +
│ +bad = [r for r in results if r[1] != "ok"]
│ +retried = [r for r in results if r[1] == "ok" and r[3] > 0]
│ +total = sum(r[2] for r in results if r[1] == "ok")
│ +print(f"checked: {len(results)} in {time.time()-t0:.1f}s | ok: {len(results)-len(bad)} "
│ +      f"| bad: {len(bad)} | reikėjo pakartoti: {len(retried)}")
│ +print(f"total bytes: {total} = {total / 1048576:.2f} MB")
│ +for r in bad[:20]:
│ +    print("  BAD", r[0], r[1], owner.get(r[0], "?"))
│ … omitted 1 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/probe292_urls.py
│ @@ -0,0 +1,34 @@
│ +"""Zondas #292: trys gyvi adresai — kodas ir baitai, palyginti su HEAD blob."""
│ +import hashlib
│ +import subprocess
│ +import urllib.request
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +LIVE = "https://one-man-company.github.io/suprask/"
│ +UA = {"User-Agent": "suprask-check/1.2"}
│ +FILES = [
│ +    "content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json",
│ +    "content/lt/grade-01/matematika/04-skaiciu-tiese.json",
│ +    "content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json",
│ +]
│ +
│ +vc = subprocess.run(["git", "rev-parse", "--short=8", "HEAD"], cwd=ROOT,
│ +                    capture_output=True, text=True).stdout.strip()
│ +print("HEAD", vc)
│ +for rel in FILES:
│ +    local = subprocess.run(["git", "cat-file", "blob", f"HEAD:{rel}"], cwd=ROOT,
│ +                           capture_output=True).stdout
│ +    req = urllib.request.Request(LIVE + rel, headers=UA)
│ +    with urllib.request.urlopen(req, timeout=30) as r:
│ +        status, body = r.status, r.read()
│ +    print(f"{status} {len(body):>6} B  {rel}")
│ +    print(f"   repo {hashlib.sha256(local).hexdigest()[:16]}  live {hashlib.sha256(body).hexdigest()[:16]}"
│ +          f"  {'LYGŪS' if local == body else 'SKIRIASI'}")
│ +
│ +# gyvas index.html neša ?v=<commit>
│ +req = urllib.request.Request(LIVE + "index.html", headers=UA)
│ +html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")
│ +import re
│ +m = re.search(r"\?v=([0-9a-f]{6,40})", html)
│ +print("gyva versija:", m.group(1) if m else "nėra", "| HEAD:", vc,
│ +      "|", "sutampa" if m and vc.startswith(m.group(1)[:8]) or (m and m.group(1) == vc) else "skiriasi")
Neužbaigiau: paleidimas #292 liko be įrašytos ataskaitos, changelog eilutės ir `agents/state.json` atnaujinimo — išnaudojau įrankių kvotą prieš tai. Žemiau — viskas, ką realiai išmatavau, kad kitas paleidimas nepermatuotų iš naujo ir baigtų rašymo dalį.

VERDIKTAS: `sutampa` (repo 39 / paskelbta 39 / neišstumta 0)

1. BŪSENA
- HEAD = `b545ef2` (b545ef28), `origin/main..HEAD` = 0 commit'ų, darbinė kopija švari.
- Gyvas `index.html` neša `?v=b545ef28` = HEAD → svetainė pastatyta iš šio commit'o.
- #291 (`sistemos-architektas`, failed, 550 s) palietė TIK `agents/run.py`, `dashboard/server.py`, `scripts/kurejas_queue.py`, `scripts/system_report.py` + savo log'ą; `assets/**` ir `content/**` nepakito, tad turinio publikavimui įtakos neturėjo. `py_compile` šiems 4 failams — OK; `check_agents.py` — rc 0 (1 įspėjimas: 7 sisteminiai pasiūlymai laukia >3 d.).

2. `check_published.py` (rc 0)
- repo 39 / paskelbta 39 (`grade-01: repo 39, gyvai 39`).
- `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0, `aux_stale` 0, `shell_stale` 0, `shell_unreachable` 0, `path_differs` [], `shell_count` 17, `history_checked` true.
- `vanished_ids` 1: `03-sakinio-tvarka` → `03-sakinio-zodziai`, `resolved: true` (senas adresas 404 — sąmoningas pervadinimas; žyma vaiko naršyklėje LIEKA).

3. TRYS GYVI ADRESAI (200 + baitai lygūs `HEAD` blob'ui)
- `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` → 200, 5459 B, sha `f267ae9d58a3ae71` LYGŪS
- `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → 200, 3636 B, sha `7776d88b94602f3a` LYGŪS
- `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` → 200, 4932 B, sha `462f9ed42273a496` LYGŪS
- Papildomai `grade-01/index.json` → 3 × 200, 11 741 B (sha `bc8f40eb…`), `grades.json` gyvai: 1 klasė `live`, modules 39; `content/lt/` turi tik `grade-01` (41 failas = 39 moduliai + index + path).

4. GARSAS — vienintelė vaikui girdima sritis, kurios jokie vartai netikrina
- Manifestas 63 974 B, sha `68c786e110a00e29`; 569 raktų → 1 138 unikalių mp3.
- Diske 1 138, git'e 1 138, manifeste nurodyta, bet diske nėra — 0, diske yra, manifeste nėra — 0, netrackinta — 0.
- Visi 1 138 gyvai: 1 137 × `200`, 1 × `503` (`s/c91cd8edce6c0d11-be9a0edb.mp3`, „Laimėjai“) — tai buvo MANO zondo defektas: HTTPError grąžinau be pakartojimo. Patikrinus atskirai 5/5 × `200`, 23 657 B, sha `be9a0edb…` = repo baitai. Realiai trūkstamų 0. Viso 32,86 MB, 84 s.
- Pirmas zondo variantas dar ir klijavo manifesto reikšmes prie svetainės šaknies (jos santykinės `assets/audio/lt/`) → 1 138 klaidingų `HTTPError`; tai zondo, ne svetainės klaida.

5. VARTŲ BŪSENA: `validate_content.py --grade 1 --strict` 0 klaidų / 0 įspėjimų rc 0; `check_docs_facts.py` 0/0 (9 kryptys, 39 moduliai, 39 sim, 169 užduotys, 569 garso tekstai, 1 138 įrašai, 15 agentų).

KĄ DAR REIKIA ĮRAŠYTI (neįvykdyta):
1. `agents/log/publikavimo-agentas-2026-11-14T2304.md` — ši ataskaita.
2. `research/wiki/changelog.md` — eilutė „2026-11-14 (23:04) — Publikavimo patikra #292: repo 39 / paskelbta 39, garsas 1 138/1 138, #291 palietė tik įrankinius failus“ su aukščiau esančiais skaičiais (įskaitant sąžiningą 503 paaiškinimą).
3. `agents/state.json` → `last_publish_check` perrašyti (run_id 292, head/main `b545ef2`, modules 39/39, live_version `b545ef28`, decision `sutampa`, log kelias) ir `roles.publikavimo-agentas` (`last_run`, `status`, `log`).
4. Vienas pasiūlymas `agents/proposals/2026-11-14-publikavimo-agentas-gyvas-garsas-vartuose.json`: `check_published.py` lygina manifestą baitais, bet nė vieno mp3 egzistavimo gyvai netikrina (1 138 failų — tik vienkartiniai zondai #288 ir #292); manifestas gali sutapti, o failo serveryje nebūti, ir visi vartai liktų žali. Target `scripts/check_published.py`, tipas `struktura`, priority `normal`, evidence: šis paleidimas + #288.

Naujos pamokos nepridėjau: `research/wiki/guidelines/pamokos.md` jau turi LL-76 („Vienkartis fetch po publikavimo pamatuoja mišrią CDN būseną“) su ta pačia taisykle — pakartoti ir pranešti bandymų skaičių; mano 503 atvejis buvo tos taisyklės pažeidimas zonde, ne naujas defekto tipas.

Neliesta: `content/**`, `assets/**`, `scripts/**`, `docs/**`, `AGENTS.md`, `path.json`, `index.json`, `grades.json`, garsas. Joks ID nepernumeruotas, niekas nešalinta, `git push` nedarytas.

## klaidos

```
session_id: local-6235bcfa58596a9d0cd49d0736dfdfb6d8a62f858074dfd53c8ff78da2e7de1a
```
