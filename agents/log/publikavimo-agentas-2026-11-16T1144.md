# publikavimo-agentas — 2026-11-16T1144

- paleidimas: #316 (manual)
- trukmė: 411s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ assets/audio/lt/manifest.json
│ @@ -586,10 +586,6 @@
│   "Atkarpa per visą lapą. Ji vis tiek turi du galus.": {
│    "n": "n/850358511b12a071-dbb36792.mp3",
│    "s": "s/850358511b12a071-5964052b.mp3"
│ - },
│ - "Augalas grįžo į pradinį dydį: pokytis 0.": {
│ -  "n": "n/a50bdcfcde0078a0.mp3",
│ -  "s": "s/a50bdcfcde0078a0.mp3"
│   },
│   "Augalas paaugo. Kiti du nepakito.": {
│    "n": "n/c233c5fdbd319065-83103cae.mp3",
│ profiles/deepseek41flash/cache/scratch/p316_mirror.py
│ @@ -0,0 +1,57 @@
│ +"""#316 zondas A (LL-98): ar publikavimo vartai mato `404.html` skirtumą.
│ +
│ +Kas tikrinama: `scripts/check_published.py` lygina svetainės kodo failus
│ +(`SHELL_GLOBS`). 404.html įtrauktas #308, bet tai niekada nebuvo parodyta
│ +neigiamu zendu šiame repo variante. Veidrodis su kitu 404.html turi duoti
│ +rc 1 ir `PASENĘS KODAS: 404.html`.
│ +
│ +Naudojimas:
│ +    python3 p316_mirror.py build     # sukuria veidrodį $SCRATCH/m316
│ +    python3 p316_mirror.py mutate    # pakeičia tik veidrodžio 404.html
│ +    python3 p316_mirror.py files     # shell_files() sąrašas iš repo
│ +"""
│ +
│ +from __future__ import annotations
│ +
│ +import pathlib
│ +import shutil
│ +import sys
│ +
│ +REPO = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +BASE = pathlib.Path("/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/m316")
│ +
│ +
│ +def build() -> None:
│ +    if BASE.exists():
│ +        shutil.rmtree(BASE)
│ +    BASE.mkdir(parents=True)
│ +    for name in ("index.html", "404.html"):
│ +        shutil.copy2(REPO / name, BASE / name)
│ +    for name in ("assets", "content", "scripts"):
│ +        shutil.copytree(REPO / name, BASE / name,
│ +                        ignore=shutil.ignore_patterns("*.pyc", "__pycache__"))
│ +    print("veidrodis:", BASE)
│ +    print("404.html:", (BASE / "404.html").stat().st_size, "B")
│ +
│ +
│ +def mutate() -> None:
│ +    path = BASE / "404.html"
│ +    original = path.read_text(encoding="utf-8")
│ +    path.write_text(original + "\n<!-- veidrodžio žymė -->\n", encoding="utf-8")
│ +    print("404.html po pakeitimo:", path.stat().st_size, "B")
│ +
│ +
│ +def files() -> None:
│ +    sys.path.insert(0, str(REPO / "scripts"))
│ +    import check_published as cp  # noqa: E402
│ +
│ +    names = cp.shell_files()
│ +    print(f"shell_files(): {len(names)}")
│ +    for name in names:
│ +        print("  -", name)
│ +    print("404.html įtrauktas:", "404.html" in names)
│ +
│ +
│ +if __name__ == "__main__":
│ +    cmd = sys.argv[1] if len(sys.argv) > 1 else "build"
│ +    {"build": build, "mutate": mutate, "files": files}[cmd]()
Sustabdau čia — baigėsi leidžiamų įrankio kvietimų limitas. Žemiau — kas realiai išmatuota ir kas liko nepadaryta. Ataskaitos failo ir `state.json` įrašyti nespėjau, todėl **šis paleidimas nėra užbaigtas pagal savo baigties sąlygą**.

## `check_published.py` išvestis (prieš darbą, rc 1)

```
Repozitorija: 39 moduliai
Paskelbta:    39 moduliai
  · grade-01: repo 39, gyvai 39
PASENĘS PAGRINDINIS FAILAS (1):
  - assets/audio/lt/manifest.json: repo 64095 B, gyvai 63974 B   ← pirmas bėgimas
Garsas: patikrinta 1140 iš 1140 (visi) — TRŪKSTA 2
  - n/a50bdcfcde0078a0.mp3 — nėra svetainėje
  - s/a50bdcfcde0078a0.mp3 — nėra svetainėje
```
Antras bėgimas (po kelių sekundžių) manifestų skirtumo neberodė (krašto kešas susilygino: `sha256 7e4f8631…` abiejose pusėse) — liko tik 2 trūkstami mp3.

## Priežastis — rasta ir įrodyta

`22aac9e` („darbinės kopijos likutis prieš publikavimo-agentas paleidimą“) įtraukė į manifestą 4 eilutes:
`"Augalas grįžo į pradinį dydį: pokytis 0." → n/a50bdcfcde0078a0.mp3, s/…`. Tų mp3 **nėra nei repo, nei gyvai** (`git log --all` tokio failo niekada neturėjo). Tekstas priklausė atmestam #315 (`simuliaciju-inzinierius`) simuliacijos pakeitimui: dabar `assets/js/sims/pasaulis.js` šio sakinio nebesako (liko tik `:2478` „Kamuoliukas juda, bet lentelėje jo pokytis 0.“), o `grep` per visą repo randa frazę **tik manifeste**. Taigi manifestas buvo vienintelė vieta, kuri teigė, kad toks garsas egzistuoja.

Papildomas radinys: `check_audio.py` to nematė — rc 0, „✔ Garsas pilnas … naudojama **1140 iš 1138** mp3“. Įrankis eina tik `manifestas → diskas` **kalbamiems** tekstams (`texts = generate_audio.collect()`, `check_audio.py:70–78`), todėl įrašas, kurio niekas nekalba ir kurio failo nėra, jam neegzistuoja; skaičių neatitikimą jis atspausdina, bet nežymi. Publikavimo vartai tą patį defektą pagavo (`TRŪKSTA 2`).

## Ką pakeičiau

`assets/audio/lt/manifest.json` — pašalintos 4 eilutės (2 nuorodos į neegzistuojančius failus). Po pakeitimo:
- `check_audio.py` → `✔ … 1138 įrašų … naudojama 1138 iš 1138 mp3`, rc 0 (skaičiai sutampa pirmą kartą);
- `manifest.json` `sha256` = `68c786e1…`, 63 974 B — **baitais tas pats manifestas, kuris buvo paskelbtas #304**. Taisymas ne „naujas turinys“, o grąžinimas į paskutinę sąžiningą būseną;
- 2 trūkstami mp3 išnyko iš vartų išvesties.

## 3 gyvi adresai (HTTP)

- `content/lt/grade-01/pasaulio-pazinimas/20-kas-gyvas.json` → **200**, 6 599 B
- `content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json` → **200**, 8 812 B
- `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` → **200**, 5 044 B
- neigiamas zondas: neegzistuojantis kelias (`matematika/27-skaicius-ir-skaitmuo.json`, `dorinis-ugdymas/01-dovana-ir-noras.json`) → **404**, 563 B — tai repo `404.html` dydis, tad 404 puslapis gyvas ir nepamasko trūkstamo modulio. (Mano pirmi du URL bandymai buvo neteisingi patys — tie moduliai neegzistuoja; tai ne defektas.)
- Šaknis `https://one-man-company.github.io/suprask/` → **200**, 3 487 B

## Sprendimas

**Ištaisyta** (`assets/audio/lt/manifest.json`), su viena sąlyga: dabartinė vartų būsena po taisymo bus

```
PASENĘS PAGRINDINIS FAILAS (1):
  - assets/audio/lt/manifest.json: repo 63974 B, gyvai 64095 B
Garsas: patikrinta 1138 iš 1138 (visi) — visi pasiekiami
```

Tai **laukiama** būsena, ne regresija: `git push` daro bėgiklis, tad gyva svetainė dar neša seną manifestą su dviem mirusiomis nuorodomis. Vaikui skirtumo nėra (to sakinio niekas nekalba), o po kito paleidimo push + Pages deploy (27–34 s) abi pusės susilygins į 63 974 B. **Kito paleidimo publikavimo agentui pirmas darbas — patvirtinti, kad `aux_stale` tapo 0.**

## Ko nespėjau (debt, privaloma kitam paleidimui)

1. **Ataskaitos failas neįrašytas** — `agents/log/publikavimo-agentas-2026-11-16T…md`.
2. **`agents/state.json` neatnaujintas** (`roles.publikavimo-agentas`, `last_publish_check_316`).
3. **`research/wiki/changelog.md` eilutė neįrašyta** (repo 39 / paskelbta 39, garsas 1138/1138, 3× 200, manifest taisymas).
4. **Pamoka neįrašyta** į `research/wiki/guidelines/pamokos.md`. `pamokos.md` turi 97 įrašus iki LL-97, tad trūksta trijų:
   - **LL-98** (iš #310 skolos) — `404.html` įtrauktas į `SHELL_GLOBS`; šiandien sumatuota: `shell_files()` = **18** failų (2 html + 15 js + 1 css) ir `404.html` jame yra. Veidrodis `scratch/m316` (baitų kopija, 563 B `404.html`) **jau sukurtas**, bet neigiamas zondas (pakeistas 404.html → `PASENĘS KODAS: 404.html`, rc 1) **nepaleistas**.
   - **LL-99** (iš #310 skolos) — `unpushed()` grąžina `([], False)` be `origin/main`, `verdict({})` → `ok=False`; zondas neparašytas.
   - **LL-100** (naujas, šiandien išmatuotas) — *„Įrašas, kurio niekas nekalba ir kurio failo nėra: `check_audio.py` žalias, `check_published.py` raudonas“*. Simptomas: manifestas teigė 2 garso failus, kurių nėra niekur; `check_audio.py` rc 0 ir „naudojama 1140 iš 1138“, o vartai — `TRŪKSTA 2`. Priežastis: `check_audio.py:69–78` eina tik per `generate_audio.collect()` tekstus, tad manifeste esantis įrašas, kurio tekstas nebekalbamas, nepatenka nė į vieną patikrą; neatitikimą įrankis atspausdina, bet `ok` jo neįskaito. Taisyklė: manifestas tikrinamas **abiem kryptimis** — kiekvienas įrašas turi turėti failą diske, nepriklausomai nuo to, ar tekstas šiandien kalbamas; „referenced 1140 / on_disk 1138“ yra klaida, ne informacija. Patikra: prieš taisymą — `check_audio` rc 0 + „1140 iš 1138“, `check_published` rc 1 + 2 failai; po taisymo — `check_audio` 1138/1138 rc 0, manifestas `68c786e1…` = paskelbtas #304, vartuose audio eilutė „1138 iš 1138 — visi pasiekiami“. Rekomenduojamas pasiūlymas `scripts/check_audio.py`: papildyti `refs - disk` kryptį (ne tik `disk - refs` našlaičiams) ir neleisti žalios būsenos, kai `referenced != on_disk`.
5. **Pasiūlymai (`agents/proposals/`) neįrašyti** — vienintelis brandus kandidatas: `type: struktura`, `target: scripts/check_audio.py`, priority `high`, evidence: `assets/audio/lt/manifest.json` (`22aac9e` diff), `scripts/check_audio.py:69–78,155–159`, `scripts/check_published.py:204–223`, `agents/log/simuliaciju-inzinierius-2026-11-16T1103.md:174`.

## Kas neliesta

`content/**`, `assets/js/**`, `assets/css/**`, `docs/**`, `AGENTS.md`, `scripts/**` — nepakeisti. Joks modulio ID nepernumeruotas, joks modulis nešalintas. Darbo medyje — vienas failas: `assets/audio/lt/manifest.json` (−4 eilutės). Veidrodis `~/.hermes/profiles/deepseek41flash/cache/scratch/m316` liko kaip zondo medžiaga, jo trinti nereikia.

## klaidos

```
session_id: local-ad13013998ccf3c13388c0b188316f87443c0fc6a81dad54ce1d4f199a244aae
```
