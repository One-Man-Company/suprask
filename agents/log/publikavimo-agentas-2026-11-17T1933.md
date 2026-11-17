# publikavimo-agentas — 2026-11-17T1933

- paleidimas: #336 (manual)
- trukmė: 265s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/p336_orphans.py
│ @@ -0,0 +1,19 @@
│ +"""#336 zondas: ar yra modulių failų, kurių index.json neskelbia (orphan)?"""
│ +import json
│ +import pathlib
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +idx = json.loads((ROOT / "content/lt/grade-01/index.json").read_text(encoding="utf-8"))
│ +ids = [m["id"] for s in idx["strands"] for m in s["modules"]]
│ +files = [m["file"] for s in idx["strands"] for m in s["modules"]]
│ +disk = sorted(
│ +    str(p.relative_to(ROOT / "content/lt"))
│ +    for p in (ROOT / "content/lt").rglob("*.json")
│ +    if p.name not in ("index.json", "path.json", "grades.json")
│ +)
│ +print("index ids:", len(ids), "unique:", len(set(ids)))
│ +print("disk module files:", len(disk))
│ +print("orphans on disk (not in index):", sorted(set(disk) - set(files)))
│ +print("listed but missing on disk:", sorted(set(files) - set(disk)))
│ +bad = [m["id"] for s in idx["strands"] for m in s["modules"] if pathlib.Path(m["file"]).stem != m["id"]]
│ +print("id != filename stem:", bad)
│ profiles/deepseek41flash/cache/scratch/p336_path_probe.py
│ @@ -0,0 +1,67 @@
│ +"""#336 neigiamas zondas: ar check_published.py pamato svetimoje puseje pakeista
│ +kelio seka (path.json) ir ar pranesa butent ta priezasti?
│ +
│ +Naudojama: sukuria veidrodi, kuriame path.json seka sukeista vietomis, pakelia
│ +ji per http.server ir paleidzia check_published.py su SUPRASK_LIVE_ROOT.
│ +
│ +Tikimasi: rc=1 ir pirmoji priezastis "kelio seka skiriasi".
│ +"""
│ +import json
│ +import pathlib
│ +import shutil
│ +import subprocess
│ +import sys
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +MIRROR = pathlib.Path.home() / ".hermes/profiles/deepseek41flash/cache/scratch/mirror336"
│ +PORT = 8941
│ +
│ +
│ +def build_mirror() -> None:
│ +    if MIRROR.exists():
│ +        shutil.rmtree(MIRROR)
│ +    MIRROR.mkdir(parents=True)
│ +    for name in ("index.html", "404.html"):
│ +        shutil.copy2(ROOT / name, MIRROR / name)
│ +    for name in ("assets", "content"):
│ +        subprocess.run(["cp", "-al", str(ROOT / name), str(MIRROR / name)], check=True)
│ +
│ +
│ +def swap_two(path: pathlib.Path) -> tuple[str, str]:
│ +    data = json.loads(path.read_text(encoding="utf-8"))
│ +    seq = data["sequence"]
│ +    a, b = seq[0], seq[1]
│ +    seq[0], seq[1] = b, a
│ +    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
│ +    return a, b
│ +
│ +
│ +def main() -> int:
│ +    build_mirror()
│ +    # hardlink'ai: pries rasydami nutraukiame rysi, kad nepakeistume repo failo
│ +    p = MIRROR / "content/lt/grade-01/path.json"
│ +    p.unlink()
│ +    shutil.copy2(ROOT / "content/lt/grade-01/path.json", p)
│ +    a, b = swap_two(p)
│ +
│ +    srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1"],
│ +                           cwd=MIRROR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
│ +    try:
│ +        import time
│ +        time.sleep(1.5)
│ +        env = {"SUPRASK_LIVE_ROOT": f"http://127.0.0.1:{PORT}/",
│ +               "PATH": "/usr/local/bin:/usr/bin:/bin"}
│ +        proc = subprocess.run([sys.executable, "scripts/check_published.py", "--no-bytes"],
│ +                              cwd=ROOT, capture_output=True, text=True, timeout=180, env=env)
│ +        print(f"--- sekos sukeista: {a} <-> {b}")
│ +        print(proc.stdout.strip())
│ +        print(f"--- rc={proc.returncode}")
│ +        first = [ln for ln in proc.stdout.splitlines() if "skiriasi" in ln]
│ +        print("--- eilute apie seka:", first[0] if first else "NĖRA")
│ +        return 0
│ +    finally:
│ +        srv.terminate()
│ +
│ +
│ +if __name__ == "__main__":
│ +    raise SystemExit(main())
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/p336_path_probe.py
│ @@ -49,8 +49,9 @@
│      try:
│          import time
│          time.sleep(1.5)
│ -        env = {"SUPRASK_LIVE_ROOT": f"http://127.0.0.1:{PORT}/",
│ -               "PATH": "/usr/local/bin:/usr/bin:/bin"}
│ +        import os
│ +        env = dict(os.environ)
│ +        env["SUPRASK_LIVE_ROOT"] = f"http://127.0.0.1:{PORT}/"
│          proc = subprocess.run([sys.executable, "scripts/check_published.py", "--no-bytes"],
│                                cwd=ROOT, capture_output=True, text=True, timeout=180, env=env)
│          print(f"--- sekos sukeista: {a} <-> {b}")
SUSTABDYTA DĖL ŽINGSNIŲ LIMITO — bet pamatinis darbas atliktas ir išmatuotas. Žemiau tai, ką realiai gavau iš įrankių, ir kas liko neįrašyta į repo.

## 1. `check_published.py` išvestis (numatytasis režimas, rc 0)

```
Repozitorija: 39 moduliai
Paskelbta:    39 moduliai
  · grade-01: repo 39, gyvai 39
Pervadinti ID, priimta ir užregistruota (1):
  - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai (žyma už seno ID LIEKA — alias nėra)
Garsas: patikrinta 1138 iš 1138 (visi) — visi pasiekiami
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai,
  svetainės kodas 18 failų, versija 97402a51).
```

Neišstumta: `git rev-list --left-right --count origin/main...HEAD` → `0 0`; darbo kopija švari (0 eilučių).

Svarbi pastaba: patikros metu gyva svetainė dar nešė `?v=97402a51`, o `HEAD` buvo `5efb599`; vėliau (per šį patį paleidimą) Pages deploy baigėsi ir `curl` jau rodė `app.js?v=5efb599f` — t. y. versija pasivijo, turinio baitai abiem atvejais sutapo.

## 2. Trys gyvi adresai (curl, ne per įrankį)

| adresas | kodas | baitai |
|---|---|---|
| `content/lt/grade-01/matematika/04-skaiciu-tiese.json` | 200 | 3 636 = repo 3 636 |
| `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` | 200 | 5 044 = repo 5 044 |
| `content/lt/grade-01/pasaulio-pazinimas/09-augalo-gyvenimas.json` | 200 | 3 828 = repo 3 828 |

Papildomai: `index.html` 200, `404.html` 200 (563 B, sutampa su repo), `assets/js/app.js` 200, `grade-01/index.json` 200.

## 3. Kitos patikros (visos žalios)

- `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų, rc 0
- `check_docs_facts.py` → 0/0 (9 kryptys, 39 moduliai, 39 sim, 169 užduotys, 569 garso tekstai, 1 138 įrašai, 15 agentų)
- `check_audio.py --no-engine` → 569 tekstų / 1 138 įrašų / 1 138 mp3, rc 0
- Savarankiškas indekso kryžminis perskaičiavimas (`p336_orphans.py`): 39 ID, 39 failai diske, **0 našlaičių failų, 0 indekse įrašytų bet trūkstamų failų, 0 neatitikimų tarp `id` ir failo vardo** — tai dimensija, kurios `check_published.py` netikrina (jis eina tik nuo indekso į failus).

## 4. Naujas matavimas: `path_differs` signalas įrodytas pirmą kartą

`grep -rn "kelio seka skiriasi" agents/log/` rado tik įrankio išeities kodo eilutę — ši vartų atšaka per visą projektą nebuvo nei karto stebėta veikiant. Veidrodis `scratch/mirror336` (kietosios nuorodos, repo inodai neliesti; `SUPRASK_LIVE_ROOT=http://127.0.0.1:8941/`), kuriame `grade-01/path.json` sukeisti `01-garsas-ir-raide` ↔ `02-skiemenu-jungimas`:

```
path.json seka skiriasi: klasė 1
rc=1
```

Po zondo `git status` rodo, kad repo `path.json` neliestas. Tai pirmasis įrodytas šios šakos suveikimas (anksčiau tik `not_in_path` signalas buvo įrodytas #321).

## 5. Sprendimas

**`sutampa`.** Nieko netaisiau, nes nebuvo ko: repo ir gyva svetainė sutampa visose matuotose srityse.

## 6. Kas NEĮRAŠYTA (žingsniai baigėsi anksčiau)

Neįvykdžiau savo vaidmens 6 punkto — **`research/wiki/changelog.md` įrašas neįrašytas**, ir `agents/state.json` `last_publish_check_336` blokas neįrašytas. Tai reiškia, kad šis paleidimas pagal bėgiklio taisyklę gali būti laikomas tuščiu (pakeista tik ataskaita). Ką reikia įrašyti (visi skaičiai aukščiau yra išmatuoti):

- `research/wiki/changelog.md` (naujausias viršuje): data 2026-11-17, 39/39, kodas 18 failų, `?v=5efb599f`, garsas 1 138/1 138, 3 × 200 su baitų lygybe, 0 našlaičių indekse, `path_differs` įrodytas pirmą kartą, sprendimas `sutampa`.
- `agents/state.json` → `last_publish_check_336` (šalia `last_publish_check_321`).

Atviros skolos, kurios nesikeičia: progreso alias `progress.js` (pasiūlymas `2026-11-13-...-progreso-alias.json`, high, 4 dienas nejuda), garso manifesto abiem kryptimis patikra (`2026-11-16-...-garsas-abiem-kryptim.json`), `index.json` kortelės laukų palyginimas (`2026-11-14-...-index-ir-modulis.json`).

## klaidos

```
session_id: local-e8bb2f495c26b3b5238ca66b4b07f098dc12d72a71da4c6976e0e1d9633a7a58
```
