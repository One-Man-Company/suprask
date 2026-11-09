# publikavimo-agentas — 2026-11-09T1154 (paleidimas #191)

- **Vaidmuo:** publikavimo-agentas
- **Paleidimas:** #191, 2026-11-09
- **HEAD:** `5a921b1705a98bbed92d21d9dfe5210d9cf17e82` = `origin/main` (po `git fetch`)
- **Darbinė kopija:** švari (`git status --porcelain -uall` → 0 eilučių)
- **Sprendimas:** **SUTAMPA** (repo 35 / paskelbta 35)

## 1. `check_published.py` išvestis

```
Repozitorija: 35 moduliai
Paskelbta:    35 moduliai
✔ Repo ir gyva svetainė sutampa.        RC=0
```

`--json`:

```json
{"local": 35, "published": 35, "missing_on_live": [], "hidden_locally": [],
 "not_in_path": [], "unpushed_commits": 0, "live_error": ""}
```

- `missing_on_live` tuščias — nė vienas repo modulis netrūksta gyvai.
- `hidden_locally` tuščias — **nė vienas modulis nepradingo iš repo**, vaiko `localStorage`
  pažanga nerodo į nieką. Sustabdymo priežasties nėra.
- `not_in_path` tuščias — `path.json` 35 žingsniai, 35 unikalūs; aibė sutampa su indeksu
  abiem kryptimis (ne indekse 0, ne kelyje 0). **Tvarkos neliečiau**: `sequence` eina
  mokymosi tvarka, o ne `index.json` eilės tvarka.
- Neišstumtų commit'ų 0 (`git rev-list origin/main..HEAD` → 0).
- `live_error` tuščias.

## 2. Baitai, ne skaičiai (zondas `pub191.py`)

Skaičiai gali sutapti, o failai būti pasenę, todėl lyginau kiekvieną gyvą failą su
`git show HEAD:` baitais.

- **Modulių failai: 35/35** — HTTP `{200: 35}`, visi baitais identiški `HEAD`.
- **Struktūros failai** — visi baitais lygūs `HEAD`:
  `content/lt/grade-01/index.json` (`def01c20`, 10 662 B), `path.json` (`ef2ca057`, 1 228 B),
  `grades.json` (`7370de87`, 1 126 B), `assets/audio/lt/manifest.json` (`e396ff29`, 55 401 B),
  `assets/css/main.css` (`f7c4b8c9`, 23 701 B).
- **Simuliacijų JS:** `matematika.js`, `muzika.js`, `calba.js` — lygūs tiesiogiai.
  `pasaulis.js`, `geometrija.js`, `gyvenimas.js`, `technologijos.js`, `zaidimai.js`,
  `daile.js` — skiriasi **tik** `?v=` žyma; ją nulupus baitais lygūs `HEAD`.
- **`?v=` žyma = pastatymo įrodymas:** `index.html`, `app.js`, `registry.js` turi vienintelę
  žymą `5a921b17` (= `HEAD` pirmi 8 simboliai), o numetus žymą failai baitais lygūs `HEAD`
  → gyva svetainė pastatyta būtent iš `5a921b17`.
- **Deploymentas:** GitHub Actions „Publikuoti svetainę“ prie `5a921b1` (2026-11-09T09:54:37Z,
  t. y. 11:54 vietos laiku) — `status: completed`, `conclusion: success`. Ta pati akimirka
  kaip `HEAD` commit'as, todėl tarpinės būsenos nėra.

## 3. Trys gyvi adresai (HTTP)

```
200  6242 B  content/lt/grade-01/daile/01-spalva-ir-nuotaika.json
200  7902 B  content/lt/grade-01/muzika/02-ritmas-ir-perkusija.json
200  6209 B  content/lt/grade-01/dorinis-ugdymas/01-susitarimas-ir-zaidimas.json
```

Papildomai: `index.json` `200` / 10 662 B, `path.json` `200` / 1 228 B, šaknis `200` / 3 487 B.

## 4. Struktūra ir registras

`index.json`: 35 moduliai, 35 unikalūs ID, **9 kryptys**:

| kryptis | modulių |
|---|---|
| lietuviu-kalba | 4 |
| matematika | 15 |
| pasaulio-pazinimas | 6 |
| muzika | 2 |
| zaidimu-teorija | 3 |
| technologijos | 2 |
| gyvenimo-igudziai | 1 |
| dorinis-ugdymas | 1 |
| daile | 1 |

Naujos nuo praėjusios patikros (#177, 31 modulis): `dorinis-ugdymas/01-susitarimas-ir-zaidimas`,
`daile/01-spalva-ir-nuotaika`, `muzika/02-ritmas-ir-perkusija`, `pasaulio-pazinimas/18-kuprine-ir-kuno-dalys`
— visi keturi gyvai 200 ir baitais lygūs `HEAD`.

## 5. Garsas

Manifestas 500 raktų / 1 000 takų (55 401 B), baitais lygus `HEAD`. Atsitiktinė imtis
(`seed 191`, 8 takai iš `n/` ir `s/`) — **8/8 HTTP 200**, 13 626–65 035 B.
Vaikui garso trūkumo gyvai nematyti.

## 6. Vartai

- `python3 scripts/validate_content.py --grade 1 --strict` → **0 klaidų, 0 įspėjimų**, RC=0.
- `python3 scripts/check_docs_facts.py` → **0 klaidų, 0 įspėjimų**; dokumentai skelbia
  9 kryptis, 35 modulius — sutampa su failais.
- `python3 scripts/check_view.py --base https://one-man-company.github.io/suprask/ --viewports phone,small`
  → **Plotai: phone 390 px, small 360 px; Patikrinta: 70 (maršrutų: 35 · plotų: 2) · problemos: 0**, RC=0.
  Tai naršyklėje, o ne baitais: scenarijus perėjo visus 35 modulius su Brave skydų blokais.
  (Pirmas bandymas su sistemos `python3` krito `RC=2` — „nėra playwright“; pakartota su
  `.venv/bin/python`, kur Playwright 1.64.1. Tai įrankio aplinka, ne svetainės defektas.)

## 7. Sprendimas

**SUTAMPA.**

- repo 35 / paskelbta 35, 0 neišstumtų commit'ų, `live_error` tuščias;
- 35/35 modulių failai gyvai baitais lygūs `HEAD`;
- gyva svetainė pastatyta iš `5a921b17` (`?v=` žyma + sėkmingas Pages deploymentas);
- 3/3 prašomi adresai `200`;
- 70/70 naršyklės patikrų švarios; validatorius 0/0; dokumentų skaičiai 0 klaidų;
- garso imtis 8/8.

Nieko nešalinau, ID nepernumeravau, `path.json` nekeičiau, `git push` nedariau, turinio,
CSS ir simuliacijų neliečiau. `missing_on_live` / `hidden_locally` / `not_in_path` šakų
neprireikė, todėl taisymo failo nėra.

## 8. Įrašai

1. `research/wiki/changelog.md` — naujas įrašas viršuje (2026-11-09 12:00).
2. Šis failas — `agents/log/publikavimo-agentas-2026-11-09T1154.md`. Bėgiklis į jį buvo
   įrašęs neapdorotą šio paleidimo išvestį (zondo diff + nutrauktos atsakymo dalis) ir
   žymą `exit: 1 → partial`; paleidimas buvo sustabdytas dėl įrankių kvotos, o ne dėl
   publikavimo klaidos. Failas perrašytas tikrąja ataskaita po to, kai trūkstama 70 patikrų
   eilutė buvo gauta.
3. `agents/state.json` — `roles."publikavimo-agentas"` (`last_run` 2026-11-09T11:59,
   `status: published`) ir `last_publish_check` perrašytas #191 skaičiais.
4. `agents/proposals/2026-11-09-publikavimo-agentas-patikra-baitais.json` — vienas
   pasiūlymas (normal, `struktura`): `check_published.py` tegu lygina baitus ir visas
   gyvas klases, ne vien `grade-01` ID aibę.

## 9. Kas liko (ne publikavimo sritis)

- **Garso higiena:** atviras pasiūlymas #7397 (`check_audio.py` vienkryptė patikra —
  6 našlaitiniai mp3). Publikavimui įtakos neturi: manifestas gyvai = `HEAD`, trūkstamų
  takų 0, imtis 8/8.
- **200 % teksto @360 px:** #8535, #7398, #5842, #5834 — platformos CSS/simuliacijos,
  ne publikavimas; `check_view.py` matuoja 16 px, todėl 70/70 žalia nepaneigia šių radinių.
- **`check_published.py` riba:** jis lygina tik ID aibes ir tik `grade-01` (`INDEX`
  `scripts/check_published.py:25`, `PATH_DOC` :26). Pasenusi svetainė su tais pačiais ID
  ir antroji klasė liktų nematomos. Pasiūlymas
  `agents/proposals/2026-11-09-publikavimo-agentas-patikra-baitais.json`
  (normal, `struktura`).
- Zondai: `~/.hermes/profiles/deepseek41flash/cache/scratch/pub191.py` (35 failų baitų
  lyginimas, `path.json` aibė, `?v=` žymos), `audio191.py` (garso imtis) — paleidžiami
  pakartotinai.
