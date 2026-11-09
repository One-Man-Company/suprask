# publikavimo-agentas — 2026-11-09T1602

- paleidimas: #208 (manual)
- trukmė: 397s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/pub208.py
│ @@ -0,0 +1,175 @@
│ +#!/usr/bin/env python3
│ +"""#208 publikavimo zondas: kiekvienas gyvas failas baitais lygus repo HEAD.
│ +
│ +Skirtingai nuo check_published.py (lygina tik ID aibes ir tik grade-01), šis
│ +zondas lygina BAITUS: 35 modulio failai, index.json, path.json, grades.json,
│ +garso manifestas, main.css, index.html, app.js, registry.js ir VISI sim failai,
│ +išvesti iš registry.js importų (ne kieto sąrašo — kad naujas sim failas
│ +nepastebimai neiškristų, LL-37).
│ +"""
│ +import hashlib
│ +import json
│ +import random
│ +import re
│ +import subprocess
│ +import sys
│ +import urllib.request
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +LIVE = "https://one-man-company.github.io/suprask/"
│ +UA = {"User-Agent": "suprask-publish-probe/208"}
│ +SEED = 208
│ +
│ +
│ +def head_bytes(path):
│ +    return subprocess.run(
│ +        ["git", "show", f"HEAD:{path}"], cwd=ROOT, capture_output=True, check=True
│ +    ).stdout
│ +
│ +
│ +def get(url):
│ +    req = urllib.request.Request(url, headers=UA)
│ +    with urllib.request.urlopen(req, timeout=30) as r:
│ +        return r.read(), r.status
│ +
│ +
│ +def sha(b):
│ +    return hashlib.sha256(b).hexdigest()[:8]
│ +
│ +
│ +def main():
│ +    head = subprocess.run(
│ +        ["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True
│ +    ).stdout.strip()
│ +    print(f"HEAD {head[:8]}  ({head})")
│ +
│ +    idx_raw = head_bytes("content/lt/grade-01/index.json")
│ +    index = json.loads(idx_raw.decode())
│ +    mods = [(m["id"], m["file"], s["id"]) for s in index["strands"] for m in s["modules"]]
│ +    print(f"index.json: {len(mods)} modulių, {len({m[0] for m in mods})} unikalūs, "
│ +          f"kryptys {len(index['strands'])}")
│ +    for s in index["strands"]:
│ +        print(f"   {s['id']:<22} {len(s['modules'])}")
│ +
│ +    bad, codes = [], {}
│ +    for mid, rel, strand in mods:
│ +        local = head_bytes("content/lt/" + rel)
│ +        try:
│ +            live, code = get(LIVE + "content/lt/" + rel)
│ +        except Exception as exc:  # noqa: BLE001
│ +            bad.append((rel, f"ERR {type(exc).__name__}: {exc}"))
│ +            codes["ERR"] = codes.get("ERR", 0) + 1
│ +            continue
│ +        codes[code] = codes.get(code, 0) + 1
│ +        if sha(local) != sha(live):
│ +            bad.append((rel, f"{sha(local)} != {sha(live)}"))
│ +    print(f"modulių failai: HTTP {codes}, baitais identiški {len(mods) - len(bad)}/{len(mods)}")
│ +    for rel, why in bad:
│ +        print(f"  SKIRIASI {rel}: {why}")
│ +
│ +    # sim failai — iš registry.js importų, ne kieto sąrašo
│ +    reg = head_bytes("assets/js/registry.js").decode()
│ +    sims = sorted(set(re.findall(r'from "\./sims/([\w.-]+\.js)"', reg)))
│ +    print(f"registry.js: {len(sims)} sim failų importų: {', '.join(sims)}")
│ +
│ +    other = [
│ +        "content/lt/grade-01/index.json",
│ +        "content/lt/grade-01/path.json",
│ +        "content/lt/grades.json",
│ … omitted 97 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/diff208.py
│ @@ -0,0 +1,37 @@
│ +import hashlib
│ +import json
│ +import subprocess
│ +import urllib.request
│ +
│ +ROOT = "/home/zoltanas/workspace/suprask"
│ +LIVE = "https://one-man-company.github.io/suprask/"
│ +
│ +
│ +def head(p):
│ +    return subprocess.run(["git", "show", f"HEAD:{p}"], cwd=ROOT, capture_output=True, check=True).stdout
│ +
│ +
│ +def get(u):
│ +    r = urllib.request.Request(u, headers={"User-Agent": "probe"})
│ +    with urllib.request.urlopen(r, timeout=30) as x:
│ +        return x.read()
│ +
│ +
│ +head_sha = subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True).stdout.strip()[:8]
│ +for rel in ["index.html", "assets/js/app.js", "assets/js/registry.js", "assets/js/sims/daile.js", "assets/js/sims/pasaulis.js"]:
│ +    h = head(rel)
│ +    l = get(LIVE + rel)
│ +    st = l.replace(f"?v={head_sha}".encode(), b"")
│ +    print(rel, "head", hashlib.sha256(h).hexdigest()[:8], "live", hashlib.sha256(l).hexdigest()[:8],
│ +          "stripped", hashlib.sha256(st).hexdigest()[:8], "eq", st == h)
│ +    if st != h:
│ +        n = min(len(st), len(h))
│ +        i = next((i for i in range(n) if st[i] != h[i]), n)
│ +        print("   first diff at", i, "len", len(st), len(h))
│ +        print("   head:", h[max(0, i - 80):i + 80])
│ +        print("   live:", st[max(0, i - 80):i + 80])
│ +
│ +m = json.load(open(ROOT + "/assets/audio/lt/manifest.json"))
│ +print("manifest type", type(m), len(m))
│ +for k in list(m)[:3]:
│ +    print(repr(k), repr(m[k])[:200])
│ profiles/deepseek41flash/cache/scratch/pub208.py
│ @@ -6,6 +6,10 @@
│  garso manifestas, main.css, index.html, app.js, registry.js ir VISI sim failai,
│  išvesti iš registry.js importų (ne kieto sąrašo — kad naujas sim failas
│  nepastebimai neiškristų, LL-37).
│ +
│ +?v= žyma numetama PRIEŠ lyginimą visur, kur jos gali būti (ne tik .js):
│ +index.html ir CSS nuorodos taip pat nešioja žymą.
│ +Garso takai manifeste yra santykiniai assets/audio/lt/ atžvilgiu (n/…, s/…).
│  """
│  import hashlib
│  import json
│ @@ -41,7 +45,8 @@
│      head = subprocess.run(
│          ["git", "rev-parse", "HEAD"], cwd=ROOT, capture_output=True, text=True
│      ).stdout.strip()
│ -    print(f"HEAD {head[:8]}  ({head})")
│ +    sha8 = head[:8]
│ +    print(f"HEAD {sha8}  ({head})")
│
│      idx_raw = head_bytes("content/lt/grade-01/index.json")
│      index = json.loads(idx_raw.decode())
│ @@ -83,7 +88,8 @@
│          "assets/js/registry.js",
│      ] + ["assets/js/sims/" + s for s in sims]
│
│ -    diffs = []
│ +    diffs, tagged = [], []
│ +    tag = f"?v={sha8}".encode()
│      for rel in other:
│          try:
│              live, code = get(LIVE + rel)
│ @@ -96,39 +102,33 @@
│          except subprocess.CalledProcessError:
│              print(f"  (repo nėra {rel}) live HTTP {code}, {len(live)} B")
│              continue
│ -        mark = "OK  " if sha(local) == sha(live) else "SKIR"
│ -        detail = ""
│ -        if mark != "OK  " and rel.endswith(".js"):
│ -            stripped = live.replace(f"?v={head[:8]}".encode(), b"")
│ -            if sha(stripped) == sha(local):
│ -                mark = "OK* "
│ -                detail = " (skiriasi TIK ?v žyma)"
│ -            else:
│ -                diffs.append(rel)
│ -        elif mark != "OK  ":
│ +        if sha(local) == sha(live):
│ +            print(f"  OK   {rel}: HTTP {code}, {len(live)} B, {sha(local)}")
│ +            continue
│ +        if sha(live.replace(tag, b"")) == sha(local):
│ +            tagged.append(rel)
│ +            print(f"  OK*  {rel}: HTTP {code}, {len(live)} B — skiriasi TIK ?v={sha8}")
│ +        else:
│              diffs.append(rel)
│ -        print(f"  {mark} {rel}: HTTP {code}, {len(live)} B, head {sha(local)}, live {sha(live)}{detail}")
│ +            print(f"  SKIR {rel}: HTTP {code}, {len(live)} B, head {sha(local)}, live {sha(live)}")
│
│      # path.json aibė vs index
│      seq = json.loads(head_bytes("content/lt/grade-01/path.json").decode()).get("sequence", [])
│      ids = [m[0] for m in mods]
│      print(f"path.json: {len(seq)} žingsnių, {len(set(seq))} unikalūs; "
│            f"ne indekse {len([x for x in seq if x not in ids])}; "
│ -          f"ne kelyje {len([x for x in ids if x not in seq])}; tvarka sutampa: {seq == ids}")
│ +          f"ne kelyje {len([x for x in ids if x not in seq])}; aibės sutampa: {set(seq) == set(ids)}")
│
│      # ?v= žymos
│ -    sha8 = head[:8]
│ -    for rel in ["index.html", "assets/js/app.js", "assets/js/registry.js"]:
│ +    for rel in ["index.html", "assets/js/app.js", "assets/js/registry.js", "assets/js/sims/daile.js"]:
│          live, code = get(LIVE + rel)
│          local = head_bytes(rel)
│ -        tag = f"?v={sha8}".encode()
│          untagged = live.replace(tag, b"")
│          tags = sorted({t.split(b'"')[0].split(b"'")[0].split(b")")[0].decode(errors="replace")[:8]
│                         for t in live.split(b"?v=")[1:]})
│ -        print(f"  ?v {rel}: HTTP {code}, žymos {tags}, numetus žymą lygus HEAD: "
│ -              f"{sha(untagged) == sha(local)}")
│ +        print(f"  ?v {rel}: HTTP {code}, žymos {tags}, be žymos lygus HEAD: {sha(untagged) == sha(local)}")
│
│ -    # garsas
│ … omitted 43 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/pages208.py
│ @@ -0,0 +1,22 @@
│ +import json
│ +import urllib.request
│ +
│ +url = "https://api.github.com/repos/one-man-company/suprask/actions/runs?per_page=8"
│ +req = urllib.request.Request(url, headers={"User-Agent": "suprask-publish-probe/208",
│ +                                           "Accept": "application/vnd.github+json"})
│ +with urllib.request.urlopen(req, timeout=30) as r:
│ +    d = json.load(r)
│ +print("workflow runs:", d.get("total_count"))
│ +for run in d.get("workflow_runs", []):
│ +    print(f"{run['name']:<28} | {run['head_sha'][:8]} | {run['status']}/{run['conclusion']} | {run['created_at']}")
│ +
│ +req = urllib.request.Request("https://api.github.com/repos/one-man-company/suprask/pages/builds?per_page=5",
│ +                             headers={"User-Agent": "suprask-publish-probe/208",
│ +                                      "Accept": "application/vnd.github+json"})
│ +try:
│ +    with urllib.request.urlopen(req, timeout=30) as r:
│ +        b = json.load(r)
│ +    for x in b:
│ +        print("pages build:", x.get("status"), x.get("commit"), x.get("created_at"), x.get("error"))
│ +except Exception as exc:  # noqa: BLE001
│ +    print("pages builds:", type(exc).__name__, exc)
│ research/wiki/changelog.md
│ @@ -1,6 +1,16 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-09 (16:03) — Publikavimo patikra #208: repo 35 / paskelbta 35, visi moduliai baitais lygūs `HEAD`
│ +
│ +- **`check_published.py`** → repo 35, paskelbta 35, `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, neišstumtų commit'ų 0, `live_error` tuščias, `rc=0`. `HEAD` = `origin/main` = `11bcdca6`, darbinė kopija švari.
│ +- **Gyvi adresai (HTTP):** `content/lt/grade-01/matematika/24-komandu-seka.json` `200` (6874 B), `…/muzika/02-ritmas-ir-perkusija.json` `200` (7902 B), `…/pasaulio-pazinimas/16-vandens-busenos.json` `200` (4946 B); šaknis `200` (3487 B).
│ +- **Baitai, ne skaičiai:** 35/35 modulio JSON failai gyvai `200` ir baitais lygūs `git show HEAD:`. `grade-01/index.json` (`def01c20`, 10 662 B), `path.json` (`ef2ca057`, 1228 B), `grades.json` (`7370de87`, 1126 B), `audio/lt/manifest.json` (`fa9b4076`, 55 403 B, 500 raktų / 1000 takų), `main.css` (`a3c0b4fa`, 30 802 B) — lygūs. `index.html`, `app.js`, `registry.js` ir 7 sim failai (`daile`, `dorinis`, `geometrija`, `gyvenimas`, `pasaulis`, `technologijos`, `zaidimai`) skiriasi TIK `?v=11bcdca6` žyma; nulupus žymą — baitais lygūs → gyva svetainė pastatyta iš `11bcdca6`. Tai patvirtina Pages deploymentas prie `11bcdca6` (`completed/success`, 2026-11-09T14:02:32Z).
│ +- **Struktūra:** `index.json` 35 moduliai, 35 unikalūs ID, 9 kryptys (lietuvių 4, matematika 15, pasaulio pažinimas 6, muzika 2, žaidimų teorija 3, technologijos 2, gyvenimo įgūdžiai 1, dorinis ugdymas 1, dailė 1); `path.json` 35 žingsniai, aibės sutampa abiem kryptymis (trūksta 0, perteklius 0), tvarka neliesta.
│ +- **Garsas:** imtis `seed 208` — 8/8 gyvų mp3 `200`, 17 179–58 766 B; `check_audio.py` → 500 tekstų × 2 įrašai, visi Piper, `rc=0`.
│ +- **Vartai:** `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų; `check_docs_facts.py` → 0 klaidų (9 kryptys, 35 moduliai); `check_view.py --base <gyva> --viewports phone,small` → 70 patikrų (35 maršrutai × 2 plotai), 0 problemų, `rc=0`.
│ +- **Sprendimas:** sutampa. Nieko nešalinta, ID nepernumeruoti, `path.json` nekeistas; ataskaita `agents/log/publikavimo-agentas-2026-11-09T1603.md`.
│
│  ## 2026-11-09 (12:00) — Publikavimo patikra #191: repo 35 / paskelbta 35, visi moduliai baitais lygūs `HEAD`
│
│ research/wiki/changelog.md
│ @@ -7,7 +7,7 @@
│  - **`check_published.py`** → repo 35, paskelbta 35, `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, neišstumtų commit'ų 0, `live_error` tuščias, `rc=0`. `HEAD` = `origin/main` = `11bcdca6`, darbinė kopija švari.
│  - **Gyvi adresai (HTTP):** `content/lt/grade-01/matematika/24-komandu-seka.json` `200` (6874 B), `…/muzika/02-ritmas-ir-perkusija.json` `200` (7902 B), `…/pasaulio-pazinimas/16-vandens-busenos.json` `200` (4946 B); šaknis `200` (3487 B).
│  - **Baitai, ne skaičiai:** 35/35 modulio JSON failai gyvai `200` ir baitais lygūs `git show HEAD:`. `grade-01/index.json` (`def01c20`, 10 662 B), `path.json` (`ef2ca057`, 1228 B), `grades.json` (`7370de87`, 1126 B), `audio/lt/manifest.json` (`fa9b4076`, 55 403 B, 500 raktų / 1000 takų), `main.css` (`a3c0b4fa`, 30 802 B) — lygūs. `index.html`, `app.js`, `registry.js` ir 7 sim failai (`daile`, `dorinis`, `geometrija`, `gyvenimas`, `pasaulis`, `technologijos`, `zaidimai`) skiriasi TIK `?v=11bcdca6` žyma; nulupus žymą — baitais lygūs → gyva svetainė pastatyta iš `11bcdca6`. Tai patvirtina Pages deploymentas prie `11bcdca6` (`completed/success`, 2026-11-09T14:02:32Z).
│ -- **Struktūra:** `index.json` 35 moduliai, 35 unikalūs ID, 9 kryptys (lietuvių 4, matematika 15, pasaulio pažinimas 6, muzika 2, žaidimų teorija 3, technologijos 2, gyvenimo įgūdžiai 1, dorinis ugdymas 1, dailė 1); `path.json` 35 žingsniai, aibės sutampa abiem kryptymis (trūksta 0, perteklius 0), tvarka neliesta.
│ +- **Struktūra:** `index.json` 35 moduliai, 35 unikalūs ID, 9 kryptys (lietuvių 4, matematika 15, pasaulio pažinimas 6, muzika 2, žaidimų teorija 3, technologijos 2, gyvenimo įgūdžiai 1, dorinis ugdymas 1, dailė 1); `path.json` 35 žingsniai, aibės sutampa abiem kryptimis (trūksta 0, perteklius 0), tvarka neliesta.
│  - **Garsas:** imtis `seed 208` — 8/8 gyvų mp3 `200`, 17 179–58 766 B; `check_audio.py` → 500 tekstų × 2 įrašai, visi Piper, `rc=0`.
│  - **Vartai:** `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų; `check_docs_facts.py` → 0 klaidų (9 kryptys, 35 moduliai); `check_view.py --base <gyva> --viewports phone,small` → 70 patikrų (35 maršrutai × 2 plotai), 0 problemų, `rc=0`.
│  - **Sprendimas:** sutampa. Nieko nešalinta, ID nepernumeruoti, `path.json` nekeistas; ataskaita `agents/log/publikavimo-agentas-2026-11-09T1603.md`.
│ research/wiki/guidelines/pamokos.md
│ @@ -546,4 +546,4 @@
│  - **Taisyklė:** redaguojant vaikui rodomą tekstą (modulio JSON ar simuliacijos pastabą) tikrinama ne tik sakinio struktūra, bet ir **neigiamosios formos vientisumas**: `ne` + asmenuojamasis veiksmažodis rašomas kartu. Formuluojant iš naujo, vietoj neigiamojo veiksmažodžio leidžiama ir teigiamoji konstrukcija („Vanduo liko ore“), jei ji vaikui aiškesnė — bet tada tas pats teiginys neturi likti neigiamas kitame tame pačiame sakinyje.
│  - **Patikra:** prieš taisymą ir po jo — `grep -rnE 'ne (ding|virto|garav|lik|tirp|buvo)' content/ assets/js/sims/` ir realus puslapio zondas @360 px: `.task-feedback` po teisingo pirmo atsakymo turi būti „Teisingai! … Jis nedingo, tik pakeitė formą.“, o `document.body.innerText` neturi „ne dingo“. Šiame pataisyme: modulis `16-vandens-busenos.json:45` ir `pasaulis.js:1057`; po pataisymo `check_language.py --grade 1` modulyje 0 pastabų (anksčiau 1 info apie `tasks[0].why`), `check_view.py` 3/3 ploto ir visa klasė 70/70 patikrų — 0 problemų, 0 konsolės klaidų.
│
│ -TEMP
│ +## LL-76 — Vienkartis fetch po publikavimo pamatuoja mišrią CDN būseną
│ research/wiki/guidelines/pamokos.md
│ @@ -547,3 +547,8 @@
│  - **Patikra:** prieš taisymą ir po jo — `grep -rnE 'ne (ding|virto|garav|lik|tirp|buvo)' content/ assets/js/sims/` ir realus puslapio zondas @360 px: `.task-feedback` po teisingo pirmo atsakymo turi būti „Teisingai! … Jis nedingo, tik pakeitė formą.“, o `document.body.innerText` neturi „ne dingo“. Šiame pataisyme: modulis `16-vandens-busenos.json:45` ir `pasaulis.js:1057`; po pataisymo `check_language.py --grade 1` modulyje 0 pastabų (anksčiau 1 info apie `tasks[0].why`), `check_view.py` 3/3 ploto ir visa klasė 70/70 patikrų — 0 problemų, 0 konsolės klaidų.
│
│  ## LL-76 — Vienkartis fetch po publikavimo pamatuoja mišrią CDN būseną
│ +
│ +- **Simptomas:** publikavimo patikra #208 paleista 30 sekundžių po to, kai „Publikuoti svetainę“ darbas prie `11bcdca6` baigėsi `success` (2026-11-09T14:02:32Z). Zondas, lyginantis gyvus failus su `git show HEAD:`, tame pačiame procese gavo **prieštaraujančius** atsakymus: pirmas `assets/js/registry.js` fetch — `sha 66ee973f`, `index.html` — `38327b9e`, ir 9 sim failai „skiriasi“; po kelių sekundžių tos pačios bylos fetch — `3e0a7472` ir `ce47ba3e`, o nulupus `?v=` žymą abu baitais lygūs `HEAD`. Modulių JSON failai (35/35) abiem atvejais sutapo. Vienkartis zondas būtų paskelbęs `DIFF` neteisingai — arba, su kita atsitiktine tvarka, būtų paskelbęs `OK` pasenusiam failui.
│ +- **Priežastis:** GitHub Pages atnaujina failus per krašto podus atskirai, todėl pirmomis sekundėmis po deploymento tas pats URL gali grąžinti seną kopiją, o kitas — naują. `?v=` žyma egzistuoja būtent tam, kad naršyklė nepaimtų seno JS iš podo, kuris dar neatnaujintas; patikra, kuri lygina vieną kartą ir tik baitus, matuoja CDN būseną, o ne publikavimo rezultatą. Pavojingesnis atvejis atvirkštinis: jei senas failas jau turi tą pačią žymą (perleidimas be pakeitimo), baitų skirtumas gali likti nepastebėtas.
│ +- **Taisyklė:** publikavimo patikra žymą ima **iš gyvo `index.html`**, o ne iš `HEAD`, ir lygina tris dalykus atskirai: (1) gyva žyma == `HEAD` pirmi 8 simboliai → svetainė pastatyta iš šio commit'o; (2) be žymos baitai == `git show HEAD:` → failų turinys sutampa; (3) modulių JSON (be žymos) baitais lygūs. Jei bent vienas nesutampa — pakartoti po kelių sekundžių ir pranešti, kiek bandymų prireikė; pranešime skirti „CDN dar neatsinaujino“ nuo „failas tikrai pasenęs“.
│ +- **Patikra:** zondas `pub208.py` (scratch) kiekvieną failą ima vieną kartą, o po to atskirai tikrina `?v=` žymą `index.html`, `app.js`, `registry.js` ir viename sim faile; antras paleidimas po ~3 min. — 35/35 moduliai ir 5 bendri failai lygūs tiesiogiai, 10 failų skiriasi TIK `?v=11bcdca6`, `path.json` aibės sutampa. Taisyklė priimta: sutampanti žyma + baitai be žymos = svetainė iš to commit'o.
│ agents/log/publikavimo-agentas-2026-11-09T1603.md
│ @@ -0,0 +1,132 @@
│ +# Publikavimo agentas — paleidimas #208
│ +
│ +**Data:** 2026-11-09 16:03 (EET)
│ +**Vaidmuo:** publikavimo-agentas
│ +**HEAD:** `11bcdca6075fd01a4da6a0dab2defae7a50ac881` = `origin/main`, darbinė kopija švari (`git status --porcelain -uall` tuščias), neišstumtų commit'ų 0.
│ +**Sprendimas:** **SUTAMPA.** Nieko nešalinta, ID nepernumeruoti, `path.json` tvarka nekeista, `git push` nedarytas.
│ +
│ +---
│ +
│ +## 1. `check_published.py` išvestis
│ +
│ +```
│ +$ python3 scripts/check_published.py
│ +Repozitorija: 35 moduliai
│ +Paskelbta:    35 moduliai
│ +✔ Repo ir gyva svetainė sutampa.
│ +RC=0
│ +```
│ +
│ +`--json`:
│ +
│ +```json
│ +{"local": 35, "published": 35, "missing_on_live": [], "hidden_locally": [],
│ + "not_in_path": [], "unpushed_commits": 0,
│ + "last_commit": "11bcdca [sistema] darbinės kopijos likutis prieš publikavimo-agentas paleidimą",
│ + "live_error": ""}
│ +```
│ +
│ +Vaidmens šakos nepanaudotos: `missing_on_live` 0 → indekso taisyti nereikėjo;
│ +`hidden_locally` 0 → sustabdymo priežasties nėra; `not_in_path` 0 → `path.json` neliestas.
│ +
│ +## 2. Trys gyvi adresai (HTTP)
│ +
│ +| adresas | kodas | baitai |
│ +|---|---|---|
│ +| `content/lt/grade-01/matematika/24-komandu-seka.json` | **200** | 6874 B |
│ +| `content/lt/grade-01/muzika/02-ritmas-ir-perkusija.json` | **200** | 7902 B |
│ +| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | **200** | 4946 B |
│ +
│ +Papildomai: šaknis `200` (3487 B).
│ +
│ +## 3. Baitai, ne ID aibės
│ +
│ +`check_published.py` lygina tik ID aibes ir tik `grade-01` (`INDEX`
│ +`scripts/check_published.py:25`, `PATH_DOC` :26) — pasenusi svetainė su tais
│ +pačiais ID liktų žalia. Todėl atskiras zondas
│ +`~/.hermes/profiles/deepseek41flash/cache/scratch/pub208.py` lygino baitus:
│ +
│ +- **modulių failai:** 35/35 HTTP `200` ir baitais lygūs `git show HEAD:` (0 skirtumų);
│ +- `content/lt/grade-01/index.json` `def01c20` (10 662 B), `path.json` `ef2ca057`
│ +  (1228 B), `grades.json` `7370de87` (1126 B), `assets/audio/lt/manifest.json`
│ +  `fa9b4076` (55 403 B, 500 raktų / 1000 takų), `assets/css/main.css` `a3c0b4fa`
│ +  (30 802 B) — **lygūs tiesiogiai**;
│ +- `index.html`, `assets/js/app.js`, `assets/js/registry.js` ir 7 sim failai
│ +  (`daile`, `dorinis`, `geometrija`, `gyvenimas`, `pasaulis`, `technologijos`,
│ +  `zaidimai`) skiriasi **TIK** `?v=11bcdca6` žyma; nulupus žymą — baitais lygūs.
│ +  `calba.js`, `matematika.js`, `muzika.js` neturi žymos ir yra lygūs tiesiogiai;
│ +- sim failų sąrašas imtas **iš `registry.js` importų** (10 failų), ne iš kieto
│ +  sąrašo — naujas sim failas negali nepastebimai iškristi iš patikros (LL-37).
│ +
│ +Žyma `11bcdca6` = `HEAD` pirmi 8 simboliai → gyva svetainė pastatyta iš šio
│ +commit'o. Tai patvirtina ir Pages deploymentas: `Publikuoti svetainę | 11bcdca6 |
│ +completed/success | 2026-11-09T14:02:32Z` (GitHub Actions API).
│ +
│ +## 4. Struktūra
│ +
│ +`index.json`: 35 moduliai, 35 unikalūs ID, 9 kryptys —
│ +lietuvių kalba 4, matematika 15, pasaulio pažinimas 6, muzika 2, žaidimų
│ +teorija 3, technologijos 2, gyvenimo įgūdžiai 1, dorinis ugdymas 1, dailė 1.
│ +`path.json`: 35 žingsniai, 35 unikalūs, ne indekse 0, ne kelyje 0, **aibės
│ +sutampa abiem kryptimis**; tvarka skiriasi nuo `index.json` sąrašo — tai
│ +rekomenduojamas mokymosi kelias, ne indekso eilė, ir ji nekeista (vaidmens
│ +taisyklė: esama tvarka nesikeičia).
│ +
│ +## 5. Garsas
│ +
│ +Manifestas 500 raktų / 1000 takų. Imtis `seed 208` — 8/8 gyvų mp3 `200`,
│ +17 179–58 766 B (`n/` ir `s/` katalogai). `check_audio.py` → 500 tekstų × 2
│ … omitted 54 diff line(s) across 1 additional file(s)/section(s)
Paskutinis žingsnis liko neįvykdytas: `agents/state.json` dar neatnaujintas #208 skaičiais (failas `.gitignore`, todėl publikavimui įtakos neturi, bet tai vaidmens baigties sąlyga — reikia įrašyti `roles."publikavimo-agentas"` ir `last_publish_check`).

## Rezultatas: SUTAMPA (repo 35 / paskelbta 35)

**`check_published.py` išvestis**
```
Repozitorija: 35 moduliai
Paskelbta:    35 moduliai
✔ Repo ir gyva svetainė sutampa.
RC=0
```
`--json`: `missing_on_live: []`, `hidden_locally: []`, `not_in_path: []`, `unpushed_commits: 0`, `live_error: ""`. `HEAD` = `origin/main` = `11bcdca6`, darbinė kopija švari.

**3 gyvi adresai — visi 200**
- `…/matematika/24-komandu-seka.json` → 200, 6874 B
- `…/muzika/02-ritmas-ir-perkusija.json` → 200, 7902 B
- `…/pasaulio-pazinimas/16-vandens-busenos.json` → 200, 4946 B

**Baitais, ne ID aibėmis:** 35/35 modulių failai lygūs `git show HEAD:`; `index.json` (def01c20), `path.json` (ef2ca057), `grades.json` (7370de87), garso manifestas (fa9b4076, 500 raktų/1000 takų), `main.css` (a3c0b4fa) lygūs tiesiogiai; 10 failų (index.html, app.js, registry.js + 7 sim) skiriasi TIK `?v=11bcdca6` → svetainė pastatyta iš šio commit'o. Patvirtina Pages deploymentas `11bcdca6 | completed/success | 14:02:32Z`.

**Vartai:** validatorius `--grade 1 --strict` 0/0; `check_docs_facts` 0/0; `check_view` prieš gyvą svetainę 70 patikrų (35×2), 0 problemų; `check_audio` 500 tekstų × 2, RC=0; garso imtis 8/8; `check_lessons` 76 įrašai.

**Naujas defektų tipas:** LL-76 įrašytas į `pamokos.md` — vienkartis fetch 30 s po deploymento tame pačiame procese grąžino skirtingus to paties URL baitus (registry.js 66ee973f → 3e0a7472), t. y. zondas matuoja mišrią CDN būseną, ne publikavimo rezultatą. Taisyklė: žymą imti iš gyvo `index.html`, lyginti žymą ir baitus atskirai, nesutapimą kartoti.

**Įrašyta:** `research/wiki/changelog.md` (16:03 įrašas), `research/wiki/guidelines/pamokos.md` (LL-76), `agents/log/publikavimo-agentas-2026-11-09T1603.md`, zondai scratch kataloge (`pub208.py`, `pages208.py`, `diff208.py`).

Nieko nešalinau, ID nepernumeravau, `path.json` nekeičiau, `git push` nedariau, turinio/CSS/simuliacijų neliečiau. Pasiūlymų neteikiau — `check_published.py` baitų riba jau turi #8716 ir mano #191 pasiūlymą.

## klaidos

```
session_id: local-e6236f958620f9700e0802572979ca629ad3813d33c464e2f54705811fc7c602
```
