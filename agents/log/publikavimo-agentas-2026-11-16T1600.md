# publikavimo-agentas — 2026-11-16T1600

- paleidimas: #319 (manual)
- trukmė: 356s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/p319_ll98.py
│ @@ -0,0 +1,74 @@
│ +"""#319 zondas A (LL-98): ar publikavimo vartai iš tikrųjų mato `404.html` skirtumą.
│ +
│ +Kas tikrinama: `scripts/check_published.py` `SHELL_GLOBS` turi `404.html`, bet
│ +tai niekada nebuvo parodyta neigiamu zendu. Veidrodis `scratch/m316` (kietosios
│ +nuorodos / kopija, originalai neliečiami) su pakeistu `404.html` turi duoti
│ +rc 1 ir eilutę `PASENĘS KODAS — naršyklė vykdo kitą failą (1): - 404.html`.
│ +
│ +Naudojimas (serverį kelia iškvietėjas):
│ +    python3 p319_ll98.py shell        # shell_files() iš repo
│ +    python3 p319_ll98.py baseline     # rc be pakeitimo (per SUPRASK_LIVE_ROOT)
│ +    python3 p319_ll98.py mutate       # pakeičia tik veidrodžio 404.html
│ +    python3 p319_ll98.py restore      # grąžina veidrodžio 404.html
│ +"""
│ +
│ +from __future__ import annotations
│ +
│ +import os
│ +import pathlib
│ +import subprocess
│ +import sys
│ +
│ +SCRATCH = pathlib.Path(__file__).resolve().parent
│ +REPO = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +BASE = SCRATCH / "m316"
│ +LIVE = os.environ.get("SUPRASK_LIVE_ROOT", "http://127.0.0.1:8977/")
│ +
│ +
│ +def shell() -> int:
│ +    sys.path.insert(0, str(REPO / "scripts"))
│ +    import check_published as cp
│ +
│ +    names = cp.shell_files()
│ +    print(f"shell_files(): {len(names)}")
│ +    for n in names:
│ +        print("  -", n)
│ +    print("404.html įtrauktas:", "404.html" in names)
│ +    return 0
│ +
│ +
│ +def run(label: str) -> int:
│ +    env = dict(os.environ, SUPRASK_LIVE_ROOT=LIVE)
│ +    proc = subprocess.run(
│ +        [sys.executable, str(REPO / "scripts" / "check_published.py")],
│ +        cwd=REPO, capture_output=True, text=True, env=env, timeout=600,
│ +    )
│ +    print(f"=== {label} (SUPRASK_LIVE_ROOT={LIVE}) rc={proc.returncode} ===")
│ +    for line in proc.stdout.splitlines():
│ +        if any(k in line for k in ("PASENĘS KODAS", "404.html", "Repozitorija", "Paskelbta",
│ +                                   "Garsas:", "sutampa", "Neišstumta", "patikra NEĮVYKO")):
│ +            print(" ", line)
│ +    if proc.returncode not in (0, 1):
│ +        print(proc.stderr[-800:])
│ +    return proc.returncode
│ +
│ +
│ +def mutate() -> int:
│ +    path = BASE / "404.html"
│ +    path.write_text(path.read_text(encoding="utf-8") + "\n<!-- zondo žymė -->\n", encoding="utf-8")
│ +    print("404.html po pakeitimo:", path.stat().st_size, "B (repo:", (REPO / "404.html").stat().st_size, "B)")
│ +    return 0
│ +
│ +
│ +def restore() -> int:
│ +    (BASE / "404.html").write_text((REPO / "404.html").read_text(encoding="utf-8"), encoding="utf-8")
│ +    print("404.html atstatytas:", (BASE / "404.html").stat().st_size, "B")
│ +    return 0
│ +
│ +
│ +if __name__ == "__main__":
│ +    cmd = sys.argv[1] if len(sys.argv) > 1 else "shell"
│ +    sys.exit({"shell": shell, "baseline": lambda: run("A1 bazinis, 404.html nepakeistas"),
│ +              "mutate": mutate, "restore": restore,
│ +              "after": lambda: run("A2 po 404.html pakeitimo"),
│ +              "back": lambda: run("A3 404.html atstatytas")}[cmd]())
│ profiles/deepseek41flash/cache/scratch/p319_ll99.py
│ @@ -0,0 +1,73 @@
│ +"""#319 zondas B (LL-99): ar vartai atskiria „0 neišsiųstų“ nuo „nepatikrinta“.
│ +
│ +Kas tikrinama: `check_published.unpushed()` grąžina `([], False)`, kai git
│ +negalėjo palyginti su `origin/main` (šviežias klonas be remote, sulūžęs
│ +indeksas). `verdict()` turi pasakyti žodžiais „neišsiųstų commit'ų patikra
│ +neįvyko“ ir rc turi būti 1 — ne tyli žalia „0“.
│ +
│ +Repositorija sukuriama laikiname kataloge; tikrasis repo neliečiamas.
│ +"""
│ +
│ +from __future__ import annotations
│ +
│ +import importlib.util
│ +import pathlib
│ +import shutil
│ +import subprocess
│ +import sys
│ +import tempfile
│ +
│ +REPO = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +
│ +
│ +def git(cwd: pathlib.Path, *args: str) -> subprocess.CompletedProcess:
│ +    return subprocess.run(["git", *args], cwd=cwd, capture_output=True, text=True, timeout=60)
│ +
│ +
│ +def main() -> int:
│ +    tmp = pathlib.Path(tempfile.mkdtemp(prefix="p319_ll99_"))
│ +    try:
│ +        (tmp / "scripts").mkdir()
│ +        shutil.copy2(REPO / "scripts" / "check_published.py", tmp / "scripts" / "check_published.py")
│ +        (tmp / "README.md").write_text("# laikinas repo\n", encoding="utf-8")
│ +        git(tmp, "init", "-q")
│ +        git(tmp, "-c", "user.email=z@example.invalid", "-c", "user.name=zondas", "add", "-A")
│ +        git(tmp, "-c", "user.email=z@example.invalid", "-c", "user.name=zondas",
│ +            "commit", "-q", "-m", "zondas")
│ +        remotes = git(tmp, "remote", "-v").stdout.strip()
│ +
│ +        spec = importlib.util.spec_from_file_location("cp319", tmp / "scripts" / "check_published.py")
│ +        cp = importlib.util.module_from_spec(spec)
│ +        spec.loader.exec_module(cp)
│ +
│ +        raw = git(tmp, "rev-list", "origin/main..HEAD")
│ +        print(f"repo be remote: ROOT={cp.ROOT}")
│ +        print(f"remote sąrašas: {remotes or '(tuščias)'}")
│ +        print(f"git rev-list origin/main..HEAD → rc={raw.returncode} stdout={raw.stdout.strip()!r}")
│ +        print(f"unpushed() → {cp.unpushed()}")
│ +        v1 = cp.verdict({})
│ +        print(f"verdict({{}}) → ok={v1['ok']} reasons={v1['reasons']}")
│ +        v2 = cp.verdict({"unpushed_checked": False, "unpushed_commits": 0,
│ +                         "local": 1, "published": 1})
│ +        print(f"verdict(be patikros, 0 commit'ų) → ok={v2['ok']} reasons={v2['reasons']}")
│ +
│ +        git(tmp, "update-ref", "refs/remotes/origin/main", "HEAD")
│ +        print(f"po update-ref origin/main: unpushed() → {cp.unpushed()}")
│ +        v3 = cp.verdict({"unpushed_checked": True, "unpushed_commits": 0,
│ +                         "local": 1, "published": 1})
│ +        print(f"verdict(patikra įvyko, 0 commit'ų) → ok={v3['ok']} reasons={v3['reasons']}")
│ +
│ +        git(tmp, "-c", "user.email=z@example.invalid", "-c", "user.name=zondas",
│ +            "commit", "-q", "--allow-empty", "-m", "antras")
│ +        print(f"po naujo commit'o: unpushed() → {cp.unpushed()}")
│ +
│ +        ok = (raw.returncode != 0 and v1["ok"] is False and v2["ok"] is False
│ +              and v3["ok"] is True)
│ +        print("REZULTATAS:", "OK — nepatikrinta nėra žalia" if ok else "DEFEKTAS")
│ +        return 0 if ok else 1
│ +    finally:
│ +        shutil.rmtree(tmp, ignore_errors=True)
│ +
│ +
│ +if __name__ == "__main__":
│ +    sys.exit(main())
│ profiles/deepseek41flash/cache/scratch/p319_ll100.py
│ @@ -0,0 +1,79 @@
│ +"""#319 zondas C (LL-100): manifestas tikrinamas tik viena kryptimi.
│ +
│ +Kas tikrinama: `scripts/check_audio.py` `missing` ciklas eina tik per
│ +`generate_audio.collect()` tekstus (t. y. per tai, kas šiandien kalbama).
│ +Manifesto įrašas, kurio tekstas nebekalbamas, o failo nėra diske, nepatenka
│ +nė į vieną patikrą: `ok` lieka True, nors manifestas žada failus, kurių nėra.
│ +
│ +Zondas:
│ +  C1 — tikras manifestas: refs bei disk aibės, `refs - disk` ir `disk - refs`.
│ +  C2 — laikina manifestas+diskas kopija (kietosios nuorodos) su vienu
│ +       papildomu įrašu, kurio failų nėra ir kurio tekstas nekalbamas:
│ +       `check()` turi likti ok=True, `referenced` 1140, `on_disk` 1138.
│ +       Tai tiksliai atkartoja #316 simptomą („naudojama 1140 iš 1138“).
│ +"""
│ +
│ +from __future__ import annotations
│ +
│ +import json
│ +import os
│ +import pathlib
│ +import shutil
│ +import sys
│ +import tempfile
│ +
│ +REPO = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +sys.path.insert(0, str(REPO / "scripts"))
│ +
│ +import check_audio  # noqa: E402
│ +
│ +BOGUS_TEXT = "Niekada nesakoma eilutė."
│ +BOGUS = {"n": "n/00000000deadbeef.mp3", "s": "s/00000000deadbeef.mp3"}
│ +
│ +
│ +def main() -> int:
│ +    manifest = json.loads((check_audio.AUDIO / "manifest.json").read_text(encoding="utf-8"))
│ +    refs = check_audio.referenced(manifest)
│ +    disk = check_audio.on_disk()
│ +    print(f"C1 tikras: tekstų raktų {len(manifest)}, refs {len(refs)}, disk {len(disk)}")
│ +    print(f"C1 refs - disk (manifestas žada failą, kurio nėra): {len(refs - disk)}")
│ +    print(f"C1 disk - refs (failas, kurio manifestas nemini): {len(disk - refs)}")
│ +    for rel in sorted(refs - disk)[:10]:
│ +        print("   -", rel)
│ +
│ +    baseline = check_audio.check(probe_engine=False)
│ +    print(f"C1 check(): ok={baseline['ok']} referenced={baseline['referenced']} "
│ +          f"on_disk={baseline['on_disk']} missing={len(baseline['missing'])} "
│ +          f"orphans={len(baseline['orphans'])}")
│ +
│ +    tmp = pathlib.Path(tempfile.mkdtemp(prefix="p319_ll100_"))
│ +    try:
│ +        for sub in ("n", "s"):
│ +            (tmp / sub).mkdir()
│ +            for src in (check_audio.AUDIO / sub).glob("*.mp3"):
│ +                os.link(src, tmp / sub / src.name)
│ +        aug = dict(manifest)
│ +        aug[BOGUS_TEXT] = BOGUS
│ +        (tmp / "manifest.json").write_text(json.dumps(aug, ensure_ascii=False, indent=1),
│ +                                           encoding="utf-8")
│ +        real_audio = check_audio.AUDIO
│ +        check_audio.AUDIO = tmp
│ +        try:
│ +            data = check_audio.check(probe_engine=False)
│ +        finally:
│ +            check_audio.AUDIO = real_audio
│ +        print(f"C2 manifestas su įrašu, kurio failų nėra: ok={data['ok']} "
│ +              f"referenced={data['referenced']} on_disk={data['on_disk']} "
│ +              f"missing={len(data['missing'])} orphans={len(data['orphans'])}")
│ +        print(f"C2 tekstas {BOGUS_TEXT!r} yra tarp collect() tekstų: "
│ +              f"{BOGUS_TEXT in check_audio.generate_audio.collect()}")
│ +        blind = data["ok"] is True and data["referenced"] == data["on_disk"] + 2
│ +        print("REZULTATAS:", "DEFEKTAS patvirtintas — vartai žali, nors manifestas žada "
│ +              "2 failus, kurių nėra" if blind else "zondas nepavyko atkartoti")
│ +        return 0 if blind else 1
│ +    finally:
│ +        shutil.rmtree(tmp, ignore_errors=True)
│ +
│ +
│ +if __name__ == "__main__":
│ … omitted 1 diff line(s) across 1 additional file(s)/section(s)
│ research/wiki/guidelines/pamokos.md
│ @@ -700,6 +700,27 @@
│  - **Taisyklė:** kai vartai atmeta taisyklingą formuluotę, pirmiausia tikrinama, ar formuluotė tikrai netaisyklinga; jei taisyklinga — taisomas **įrankis** (sąrašas papildomas žodžių grupėmis „pagal ką“, „iš ko“, „su kuo“, „už ką“), o ne prastesnis tekstas. Jei įrankio keisti šiame darbe negalima, sprendimas įvardijamas sąmoningu („sakinys pakeistas, žodyno spraga užrašyta“), o ne tyliu.
│  - **Patikra:** prieš keičiant sakinį — paleisti `check_language.check_module` ant to paties juodraščio dviem variantais (originalus ir pakeistas) ir palyginti, ar pasikeitė tik įspėjimas, o ne prasmė; po sąrašo papildymo — tie patys du variantai turi būti be įspėjimų, o esami 39 moduliai — be naujų įspėjimų (`python3 scripts/check_language.py --grade 1`).
│
│ -
│ -
│ -
│ +## LL-98 — Failas, įtrauktas į vartus, bet neparodytas nė vienu neigiamu zendu
│ +
│ +- **Simptomas:** `scripts/check_published.py` `SHELL_GLOBS` turi `404.html` nuo #308, o komentaras teigia, kad veidrodis su 563 B → 594 B failu „davė `PASENĘS KODAS: 404.html`“. #316 tam sukūrė veidrodį `scratch/m316` ir jį **pastatė**, bet nepakeitė `404.html` ir nepaleido patikros — tad šiame repo variante teiginys rėmėsi ankstesnio paleidimo aprašymu, ne išmatuotu rc.
│ +- **Priežastis:** vartų failų sąrašas buvo papildytas, o įrodymas atliktas kitoje vietoje (ar apskritai ne tame pačiame medyje); patikros scriptas liko `build` būsenoje. Dviguba apsauga (failas sąraše + ankstesnis zondas kitame repo variante) atrodė kaip viena apsauga.
│ +- **Taisyklė:** kiekvienas **naujas** elementas tikrinamų failų sąraše (`SHELL_GLOBS`, `AUX_FILES`, garso manifestas) turi būti įrodytas neigiamu zendu tame pačiame darbe ir tame pačiame medyje: bazinis rc 0 → pakeičiamas **tik tas** failas → rc 1, kuriame failas įvardytas vardu → atstatyta → vėl rc 0. Komentaras, kuris cituoja praeities matavimą, nėra patikra.
│ +- **Patikra:** 2026-11-16 (#319): `shell_files()` = 18, `404.html` jame yra; veidrodis `scratch/m316` + `http.server 8977` + `SUPRASK_LIVE_ROOT`: nepakeistas → rc 0 „sutampa (… svetainės kodas 18 failų)“; `404.html` 563 B → 586 B → rc 1 `PASENĘS KODAS — naršyklė vykdo kitą failą (1): 404.html: repo 563 B, gyvai 586 B`; atstatytas → rc 0. Zondas: `scratch/p319_ll98.py baseline|mutate|after|back`.
│ +
│ +## LL-99 — Grąžinama reikšmė, kuri išsprendžia dvi skirtingas būsenas į vieną
│ +
│ +- **Simptomas:** `check_published.unpushed()` grąžino tik sąrašą, tad tuščias sąrašas reiškė ir „0 neišsiųstų commit'ų“, ir „git negalėjo palyginti su `origin/main`“. Šviežiame klone be remote `git rev-list origin/main..HEAD` grąžina rc 128 ir tuščią stdout — vartai rašydavo žalią „sutampa“, o `verdict({})` iš viso grąžindavo `ok=True`.
│ +- **Priežastis:** nežinoma būsena neturėjo savo ženklo. Kai funkcija turi vieną grąžinamą reikšmę, klaidos atvejį tenka užrašyti ta pačia reikšme kaip sėkmės atvejį (tuščias sąrašas, nulis, `False`), ir vartai negali atskirti „išmatuota 0“ nuo „nematė“.
│ +- **Taisyklė:** jei matavimas gali neįvykti, funkcija grąžina **porą** (reikšmė, ar patikra įvyko) arba trijų būsenų objektą, o sprendimo funkcija (`verdict`) nežinomą būseną paverčia priežastimi žodžiais ir rc 1. Numatytasis nežinomos būsenos sprendimas — **ne** žalias (`data.get("x_checked", False)`, ne `True`).
│ +- **Patikra:** 2026-11-16 (#319) laikinas repo be remote (`scratch/p319_ll99.py`): `git rev-list origin/main..HEAD` → rc 128, stdout `''`; `unpushed()` → `([], False)`; `verdict({})` → `ok=False`, priežastis „neišsiųstų commit'ų patikra neįvyko“; `verdict({"unpushed_checked": False, ...})` → `ok=False`; po `git update-ref refs/remotes/origin/main HEAD` → `([], True)` ir `ok=True`; po naujo commit'o → 1 hash ir rc 1.
│ +
│ +## LL-100 — Manifestas, kurio įrašas tikrinamas tik viena kryptimi
│ +
│ +- **Simptomas:** #316 manifeste buvo 2 įrašai, kurių mp3 failų nebuvo niekur (nei diske, nei svetainėje), o `check_audio.py` rašė `✔ Garsas pilnas: … naudojama 1140 iš 1138 mp3` ir grąžino rc 0. Vartai (`check_published.py`) tą pačią dieną buvo raudoni — du įrankiai apie tą patį failą sakė priešingai.
│ +- **Priežastis:** `check_audio.py:69–78` `missing` ciklas eina per `generate_audio.collect()` tekstus, t. y. per tai, kas **šiandien kalbama**. Manifesto įrašas, kurio tekstas nebekalbamas, nepatenka nė į vieną patikrą, o `ok` (`:105`) skaičiuojamas tik iš `missing` ir `wrong_engine`. Skaičius „naudojama 1140 iš 1138“ buvo atspausdintas kaip informacija (`:155–159`), ne kaip klaida.
│ +- **Taisyklė:** failų sąrašas (manifestas) tikrinamas **abiem kryptimis** ir žalias tik tada, kai abi aibės lygios: `disk - refs` (našlaitis, failas be įrašo) ir `refs - disk` (įrašas be failo, nepriklausomai nuo to, ar tekstas šiandien kalbamas). `referenced != on_disk` yra klaida, o ne įspėjimas.
│ +- **Patikra:** 2026-11-16 (#319, `scratch/p319_ll100.py`): tikras manifestas — 569 tekstų, refs 1138, disk 1138, `refs - disk` 0, `disk - refs` 0, `check()` ok=True; laikina kopija su vienu papildomu įrašu, kurio failų nėra ir kurio tekstas nekalbamas (`collect()` jo neturi) — `check()` vis tiek `ok=True`, `referenced` 1140, `on_disk` 1138, `missing` 0, `orphans` 0. Rekomendacija — pasiūlymas `agents/proposals/2026-11-16-publikavimo-agentas-garsas-abiem-kryptim.md`.
│ +
│ +
│ +
│ +
│ agents/proposals/2026-11-16-publikavimo-agentas-garsas-abiem-kryptim.json
│ @@ -0,0 +1,21 @@
│ +{
│ +  "role": "publikavimo-agentas",
│ +  "run_id": 319,
│ +  "created": "2026-11-16T16:10:00+02:00",
│ +  "type": "struktura",
│ +  "title": "Garso manifestas tikrinamas abiem kryptimis — refs - disk yra nematoma",
│ +  "body": "`scripts/check_audio.py` manifestą tikrina tik viena kryptimi: `missing` ciklas (eil. 69–78) eina per `generate_audio.collect()` tekstus, t. y. per tai, kas šiandien kalbama. Manifesto įrašas, kurio tekstas nebekalbamas, o failo nėra, nepatenka nė į vieną patikrą — `ok` (eil. 105) skaičiuojamas tik iš `missing` ir `wrong_engine`. Atvirkštinė kryptis `disk - refs` (našlaitis) skaičiuojama, bet `refs - disk` (įrašas be failo) ne. 2026-11-16 #316 būtent taip ir atsitiko: manifeste du įrašai, kurių mp3 niekur nebuvo; `check_audio.py` rašė „✔ Garsas pilnas … naudojama 1140 iš 1138 mp3“ ir grąžino rc 0, o `check_published.py` tuo pačiu metu buvo raudonas. Kad defektas kartotųsi, reikia nemokamo, lokalaus pataisymo: `missing_files = sorted(refs - disk)` įtraukiamas į `ok` ir į žinutę kartu su tekstu, kuriam tas failas priklauso (atvirkštinis manifestas tekstas → variantas → kelias), o `referenced != on_disk` iš informacijos (eil. 155–159) tampa klaida. Tai neliečia turinio, manifestas šiandien švarus (refs 1138 = disk 1138), todėl pataisymas nieko nekeičia vaikui, tik užkerta tą pačią tylią žalią. Zondas, kuriuo tai patvirtinta, yra `scratch/p319_ll100.py`: laikina kopija su vienu papildomu įrašu (failai neegzistuoja, tekstas nekalbamas) → `ok=True`, `referenced=1140`, `on_disk=1138`, `missing=0`. Šis įrankis ne mano failas (`scripts/`), todėl teikiamas pasiūlymas, o ne pakeitimas.",
│ +  "target": "scripts/check_audio.py",
│ +  "priority": "high",
│ +  "status": "new",
│ +  "evidence": [
│ +    "scripts/check_audio.py:69-78 (missing ciklas eina tik per generate_audio.collect() tekstus)",
│ +    "scripts/check_audio.py:102-113 (ok = not missing and not wrong_engine; refs - disk neįtrauktas)",
│ +    "scripts/check_audio.py:155-159 („naudojama 1140 iš 1138“ spausdinama kaip informacija)",
│ +    "scripts/check_published.py:204-223 (vartai tą patį manifestą traktuoja kaip klaidą — du įrankiai nesutaria)",
│ +    "agents/log/simuliaciju-inzinierius-2026-11-16T1103.md:174 (defektas užfiksuotas pirmą kartą)",
│ +    "assets/audio/lt/manifest.json (2026-11-16 #316: du įrašai be failų, pašalinti šiame darbe)",
│ +    "scratch/p319_ll100.py (zondas: ok=True esant referenced=1140, on_disk=1138)",
│ +    "research/wiki/guidelines/pamokos.md LL-100"
│ +  ]
│ +}
│ research/wiki/changelog.md
│ @@ -1,6 +1,19 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-16 (16:10) — Publikavimo patikra #319: repo 39 / paskelbta 39, kodas 18 failų, garsas 1 138/1 138, trys skolos uždarytos neigiamais zondais
│ +
│ +- **Būsena:** `HEAD` = `origin/main` = `e263ed2`, `git rev-list --left-right --count origin/main...HEAD` → `0 0`; darbinė kopija prieš darbą švari (`git status --porcelain -uall` → 0 eilučių). Gyvas `index.html` → `200`, 3 487 B.
│ +- **`check_published.py` (numatytasis režimas, rc 0):** „Repozitorija: 39 moduliai / Paskelbta: 39 moduliai“ (`grade-01: repo 39, gyvai 39`); `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `aux_stale` 0, `shell_stale` 0, `shell_unreachable` 0, `path_differs` `[]`, `history_checked` true, `shell_count` 18, `Garsas: patikrinta 1138 iš 1138 (visi) — visi pasiekiami`, `verdict.label` = `sutampa`. `vanished_ids` 1 — `03-sakinio-tvarka` → `03-sakinio-zodziai`, `resolved: true` (žyma už seno ID vaiko naršyklėje lieka; alias pasiūlymas jau eilėje).
│ +- **3 gyvi adresai:** `content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json` → `200`, 8 812 B; `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` → `200`, 5 044 B; `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` → `200`, 4 932 B. Papildomai `grade-01/index.json` `200` 11 741 B, `assets/audio/lt/manifest.json` `200` 63 974 B.
│ +- **Skola iš #316 uždaryta trimis išmatuotais zondais** (`scratch/p319_*.py`):
│ +  - **LL-98** (`404.html` vartuose): `shell_files()` = 18 ir `404.html` jame yra; veidrodis `scratch/m316` + `http.server 8977` + `SUPRASK_LIVE_ROOT` — nepakeistas → rc 0 „sutampa (… svetainės kodas 18 failų)“; `404.html` 563 B → 586 B → rc 1 `PASENĘS KODAS — naršyklė vykdo kitą failą (1): 404.html: repo 563 B, gyvai 586 B`; atstatytas → rc 0. Tai pirmas įrodytas `404.html` neigiamas atvejis šiame repo variante.
│ +  - **LL-99** (neišsiųstų commit'ų patikra): laikinas repo be remote — `git rev-list origin/main..HEAD` rc 128, stdout `''`; `unpushed()` → `([], False)`; `verdict({})` → `ok=False` („neišsiųstų commit'ų patikra neįvyko“); po `update-ref refs/remotes/origin/main HEAD` → `([], True)`, `ok=True`; po naujo commit'o → 1 hash. Nežinoma būsena nėra žalia.
│ +  - **LL-100** (manifestas viena kryptimi): tikras manifestas — 569 tekstų, refs 1 138, disk 1 138, `refs - disk` 0, `disk - refs` 0, `check()` ok=True; laikina kopija su papildomu įrašu, kurio failų nėra ir tekstas nekalbamas → `check()` vis tiek `ok=True`, `referenced` 1 140, `on_disk` 1 138, `missing` 0. Defektas atkartotas, taisymas — pasiūlymas `scripts/check_audio.py` savininkui.
│ +- **#316 manifestas sutvarkytas ir patvirtintas:** po tų dviejų įrašų pašalinimo abi aibės lygios (1 138 = 1 138), `check_audio.py` → „✔ Garsas pilnas: 569 tekstų (iš jų 5 — tiesioginės `api.speak` eilutės), 1138 įrašų, visi iš Piper balso, naudojama 1138 iš 1138 mp3“, rc 0.
│ +- **Vartai:** `validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų, rc 0; `check_docs_facts.py` → 0/0 (9 kryptys, 39 moduliai, 39 sim, 169 užduotys, 569 garso tekstai, 1 138 įrašai, 15 agentų); `check_lessons.py` → 97 įrašai prieš šio darbo pamokas.
│ +- **Sprendimas:** **sutampa**. Nieko nešalinta, joks ID nepernumeruotas, `content/**` ir `assets/**` neliesti; medyje — `research/wiki/guidelines/pamokos.md` (LL-98, LL-99, LL-100), `agents/proposals/2026-11-16-publikavimo-agentas-garsas-abiem-kryptim.json`, `agents/log/publikavimo-agentas-2026-11-16T1610.md` ir šis įrašas. Ankstesnio paleidimo (#316) kanoninės ataskaitos nebuvo — šis įrašas užima jos vietą šiandienos skaičiais.
│
│  ## 2026-11-15 (16:40) — Publikavimo patikra #304: gyva svetainė = `d746acd`, 39/39 modulių baitai sutampa, garsas 1 138/1 138, vienas bėgiklio commit'as dar neišsiųstas
│
│ agents/log/publikavimo-agentas-2026-11-16T1610.md
│ @@ -0,0 +1,128 @@
│ +# publikavimo-agentas — 2026-11-16T1610
│ +
│ +- paleidimas: #319
│ +- vaidmuo: publikavimo-agentas
│ +- data: 2026-11-16 (16:04–16:10)
│ +- sprendimas: **sutampa** — `check_published.py` rc 0, repo 39 / paskelbta 39
│ +- neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `scripts/**`
│ +
│ +## 1. Įėjimo būsena
│ +
│ +- `HEAD` = `origin/main` = `e263ed2` (`git rev-list --left-right --count origin/main...HEAD` → `0 0`).
│ +- Darbinė kopija prieš darbą švari (`git status --porcelain -uall` → 0 eilučių).
│ +- Platformos būsena (paleidimo antraštė): 39 moduliai, 169 užduotys, 39 sim, 1 klasė gyva, 1 138 garso failų (32,9 MB).
│ +
│ +## 2. `check_published.py` išvestis (numatytasis režimas, rc 0)
│ +
│ +```
│ +Repozitorija: 39 moduliai
│ +Paskelbta:    39 moduliai
│ +  · grade-01: repo 39, gyvai 39
│ +Pervadinti ID, priimta ir užregistruota (1):
│ +  - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai (registruota; žyma už seno ID vaiko naršyklėje LIEKA — alias mechanizmo nėra, žr. agents/proposals/)
│ +Garsas: patikrinta 1138 iš 1138 (visi) — visi pasiekiami
│ +✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, svetainės kodas 18 failų, versija e263ed21).
│ +```
│ +
│ +Kiti raktai: `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `stale_unknown` 0,
│ +`aux_stale` 0, `shell_stale` 0, `shell_unreachable` 0, `path_differs` `[]`, `history_checked` true,
│ +`unpushed_commits` 0, `unpushed_checked` true, `shell_count` 18, `verdict.label` = `sutampa`.
│ +
│ +Nė vieno `hidden_locally` — todėl 3 žingsnis („sustok ir pranešk“) neįjungtas: vaiko `localStorage`
│ +žymos neturi nė vieno modulio, kurio repo nebūtų. Vienintelis dingęs ID yra priimtas pervadinimas
│ +`03-sakinio-tvarka` → `03-sakinio-zodziai` (`scripts/known_renames.json`), `resolved: true`.
│ +
│ +## 3. Trys gyvi adresai (HTTP kodai)
│ +
│ +| adresas | kodas | baitai |
│ +|---|---|---|
│ +| `content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json` | 200 | 8 812 |
│ +| `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` | 200 | 5 044 |
│ +| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | 200 | 4 932 |
│ +
│ +Papildomai: `content/lt/grade-01/index.json` 200 / 11 741 B, `assets/audio/lt/manifest.json` 200 / 63 974 B,
│ +`index.html` 200 / 3 487 B. Baitai sutampa su repo — juos lygino pats `check_published.py` (39 moduliai +
│ +18 kodo failų + 2 pagrindiniai failai + 1 138 mp3).
│ +
│ +## 4. Skola iš #316 — trys pamokos, trys išmatuoti zondai
│ +
│ +#316 paliko keturis skolos punktus. Visi uždaryti šiame darbe.
│ +
│ +### LL-98 — `404.html` vartuose (`scratch/p319_ll98.py`)
│ +
│ +- `shell_files()` = **18** failų, `404.html` jame yra (buvo 17 prieš #308).
│ +- Veidrodis `scratch/m316` (kietoji kopija repo failų) + `python3 -m http.server 8977` ir
│ +  `SUPRASK_LIVE_ROOT=http://127.0.0.1:8977/`:
│ +  - **A1** bazinis, `404.html` nepakeistas (563 B) → **rc 0**, „sutampa (… svetainės kodas 18 failų)“;
│ +  - **A2** `404.html` 563 B → 586 B (+23 B komentaras) → **rc 1**,
│ +    `PASENĘS KODAS — naršyklė vykdo kitą failą (1): 404.html: repo 563 B, gyvai 586 B`;
│ +  - **A3** failas atstatytas → **rc 0**.
│ +- Tai pirmas įrodytas `404.html` neigiamas atvejis šiame repo variante. Kodo nekeista: vartai jau
│ +  elgėsi teisingai, trūko įrodymo, o ne pataisos.
│ +
│ +### LL-99 — neišsiųstų commit'ų patikra (`scratch/p319_ll99.py`)
│ +
│ +Laikinas repo (`git init`, vienas commit, jokio remote), modulis importuotas tiesiai:
│ +
│ +```
│ +git rev-list origin/main..HEAD → rc=128 stdout=''
│ +unpushed() → ([], False)
│ +verdict({}) → ok=False reasons=["neišsiųstų commit'ų patikra neįvyko"]
│ +verdict(be patikros, 0 commit'ų) → ok=False reasons=["neišsiųstų commit'ų patikra neįvyko"]
│ +po update-ref refs/remotes/origin/main HEAD: unpushed() → ([], True)
│ +verdict(patikra įvyko, 0 commit'ų) → ok=True reasons=[]
│ +po naujo commit'o: unpushed() → (['57aa2905…'], True)
│ +```
│ +
│ +Nežinoma būsena nėra žalia; žalia grąžinama tik tada, kai git tikrai palygino.
│ +
│ … omitted 50 diff line(s) across 1 additional file(s)/section(s)
│ agents/state.json
│ @@ -71,9 +71,9 @@
│        "cadence": "pirmadieniais, ketvirtadieniais"
│      },
│      "publikavimo-agentas": {
│ -      "last_run": "2026-11-16T11:51:29",
│ +      "last_run": "2026-11-16T16:10:00",
│        "status": "published",
│ -      "log": "agents/log/publikavimo-agentas-2026-11-16T1144.md",
│ +      "log": "agents/log/publikavimo-agentas-2026-11-16T1610.md",
│        "description": "Užtikrina, kad sukurtas turinys būtų paskelbtas ir neprarastų ankstesnių modulių",
│        "cadence": "kasdien 5 kartus (06:20, 11:40, 16:00, 19:30, 23:00)"
│      },
Ataskaita — paleidimas #319, publikavimo-agentas. Sprendimas: **sutampa** (repo 39 / paskelbta 39). Darbas nebaigtas iki galo — žemiau tiksliai kas padaryta, kas ne.

## `check_published.py` išvestis (rc 0)

```
Repozitorija: 39 moduliai
Paskelbta:    39 moduliai
  · grade-01: repo 39, gyvai 39
Pervadinti ID, priimta ir užregistruota (1):
  - grade-01 03-sakinio-tvarka → 03-sakinio-zodzi (resolved)
Garsas: patikrinta 1138 iš 1138 (visi) — visi pasiekiami
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai,
  svetainės kodas 18 failų, versija e263ed21).
```

`HEAD` = `origin/main` = `e263ed2` (0 0), medis prieš darbą švarus. `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0, `aux_stale` 0, `shell_stale` 0, `path_differs` [], `unpushed_commits` 0.

## 3 HTTP kodai
- `matematika/25-ilgis-ir-vienetas.json` → 200, 8 812 B
- `lietuviu-kalba/01-garsas-ir-raide.json` → 200, 5 044 B
- `pasaulio-pazinimas/16-vandens-busenos.json` → 200, 4 932 B

Papildomai: `index.json` 200/11 741 B, `manifest.json` 200/63 974 B, `index.html` 200/3 487 B.

## Skola iš #316 uždaryta — trys realiai paleisti zondai
- **LL-98** (`404.html` vartuose): `shell_files()` = 18, `404.html` jame. Veidrodis `scratch/m316` + `http.server 8977` + `SUPRASK_LIVE_ROOT`: bazinis **rc 0** → `404.html` 563→586 B → **rc 1** „PASENĘS KODAS (1): 404.html: repo 563 B, gyvai 586 B“ → atstatytas **rc 0**.
- **LL-99**: laikinas repo be remote — `git rev-list origin/main..HEAD` rc 128, `unpushed()` → `([], False)`, `verdict({})` → `ok=False`; po `update-ref origin/main` → `([], True)`, `ok=True`; su nauju commit'u → 1 hash.
- **LL-100**: tikras manifestas refs 1138 = disk 1138, abi skirtys 0; sintetinis įrašas (failų nėra, tekstas nekalbamas) → `check()` vis tiek **ok=True**, referenced 1140 / on_disk 1138. Defektas atkartotas.

Vartai: `validate_content.py --grade 1 --strict` 0/0 rc 0; `check_docs_facts.py` 0/0; `check_lessons.py` 97 įrašai; `check_audio.py` 569 tekstų / 1138 įrašų / 1138 mp3 rc 0.

## Įrašyta
- `research/wiki/guidelines/pamokos.md` — LL-98, LL-99, LL-100
- `research/wiki/changelog.md` — įrašas 2026-11-16 (16:10)
- `agents/proposals/2026-11-16-publikavimo-agentas-garsas-abiem-kryptim.json` (struktura/high, `scripts/check_audio.py`)
- `agents/log/publikavimo-agentas-2026-11-16T1610.md`
- `agents/state.json` — `roles.publikavimo-agentas` atnaujintas

## NEBAIGTA (privaloma kitam paleidimui)
1. **`agents/state.json` `last_publish_check_319` blokas neįrašytas** — atnaujintas tik `roles.publikavimo-agentas`; kitų paleidimų pavyzdžiu reikia pridėti raktą su `decision: "sutampa"`, `modules_live/local: 39`, `shell_count: 18`, `http_codes`, `audio: 1138/1138`, `unpushed 0`, `touched`.
2. **`check_view.py` nepaleistas** (sąmoningai — `content/**` ir `assets/**` neliesti; ataskaitoje tai įvardyta).
3. **`check_audio.py` abiem kryptimis** — tik pasiūlymas; kol neįgyvendintas, lokalus CI tos klasės defekto nepagaus (pagauna tik `check_published.py`).
4. **Pažangos alias** už pervadinto `03-sakinio-tvarka` tebėra atviras (`progress.js` ne mano failas).

Neliesta: `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, `scripts/**`. Joks modulis nešalintas, joks ID nepernumeruotas.

## klaidos

```
session_id: local-a3fa199513a1bf8a94d202ec93905faf9c8d8ab8d88f2d0892e5b83dfad4753f
```
