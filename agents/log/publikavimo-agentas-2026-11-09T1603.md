# Publikavimo agentas — paleidimas #208

**Data:** 2026-11-09 16:03 (EET)
**Vaidmuo:** publikavimo-agentas
**HEAD:** `11bcdca6075fd01a4da6a0dab2defae7a50ac881` = `origin/main`, darbinė kopija švari (`git status --porcelain -uall` tuščias), neišstumtų commit'ų 0.
**Sprendimas:** **SUTAMPA.** Nieko nešalinta, ID nepernumeruoti, `path.json` tvarka nekeista, `git push` nedarytas.

---

## 1. `check_published.py` išvestis

```
$ python3 scripts/check_published.py
Repozitorija: 35 moduliai
Paskelbta:    35 moduliai
✔ Repo ir gyva svetainė sutampa.
RC=0
```

`--json`:

```json
{"local": 35, "published": 35, "missing_on_live": [], "hidden_locally": [],
 "not_in_path": [], "unpushed_commits": 0,
 "last_commit": "11bcdca [sistema] darbinės kopijos likutis prieš publikavimo-agentas paleidimą",
 "live_error": ""}
```

Vaidmens šakos nepanaudotos: `missing_on_live` 0 → indekso taisyti nereikėjo;
`hidden_locally` 0 → sustabdymo priežasties nėra; `not_in_path` 0 → `path.json` neliestas.

## 2. Trys gyvi adresai (HTTP)

| adresas | kodas | baitai |
|---|---|---|
| `content/lt/grade-01/matematika/24-komandu-seka.json` | **200** | 6874 B |
| `content/lt/grade-01/muzika/02-ritmas-ir-perkusija.json` | **200** | 7902 B |
| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | **200** | 4946 B |

Papildomai: šaknis `200` (3487 B).

## 3. Baitai, ne ID aibės

`check_published.py` lygina tik ID aibes ir tik `grade-01` (`INDEX`
`scripts/check_published.py:25`, `PATH_DOC` :26) — pasenusi svetainė su tais
pačiais ID liktų žalia. Todėl atskiras zondas
`~/.hermes/profiles/deepseek41flash/cache/scratch/pub208.py` lygino baitus:

- **modulių failai:** 35/35 HTTP `200` ir baitais lygūs `git show HEAD:` (0 skirtumų);
- `content/lt/grade-01/index.json` `def01c20` (10 662 B), `path.json` `ef2ca057`
  (1228 B), `grades.json` `7370de87` (1126 B), `assets/audio/lt/manifest.json`
  `fa9b4076` (55 403 B, 500 raktų / 1000 takų), `assets/css/main.css` `a3c0b4fa`
  (30 802 B) — **lygūs tiesiogiai**;
- `index.html`, `assets/js/app.js`, `assets/js/registry.js` ir 7 sim failai
  (`daile`, `dorinis`, `geometrija`, `gyvenimas`, `pasaulis`, `technologijos`,
  `zaidimai`) skiriasi **TIK** `?v=11bcdca6` žyma; nulupus žymą — baitais lygūs.
  `calba.js`, `matematika.js`, `muzika.js` neturi žymos ir yra lygūs tiesiogiai;
- sim failų sąrašas imtas **iš `registry.js` importų** (10 failų), ne iš kieto
  sąrašo — naujas sim failas negali nepastebimai iškristi iš patikros (LL-37).

Žyma `11bcdca6` = `HEAD` pirmi 8 simboliai → gyva svetainė pastatyta iš šio
commit'o. Tai patvirtina ir Pages deploymentas: `Publikuoti svetainę | 11bcdca6 |
completed/success | 2026-11-09T14:02:32Z` (GitHub Actions API).

## 4. Struktūra

`index.json`: 35 moduliai, 35 unikalūs ID, 9 kryptys —
lietuvių kalba 4, matematika 15, pasaulio pažinimas 6, muzika 2, žaidimų
teorija 3, technologijos 2, gyvenimo įgūdžiai 1, dorinis ugdymas 1, dailė 1.
`path.json`: 35 žingsniai, 35 unikalūs, ne indekse 0, ne kelyje 0, **aibės
sutampa abiem kryptimis**; tvarka skiriasi nuo `index.json` sąrašo — tai
rekomenduojamas mokymosi kelias, ne indekso eilė, ir ji nekeista (vaidmens
taisyklė: esama tvarka nesikeičia).

## 5. Garsas

Manifestas 500 raktų / 1000 takų. Imtis `seed 208` — 8/8 gyvų mp3 `200`,
17 179–58 766 B (`n/` ir `s/` katalogai). `check_audio.py` → 500 tekstų × 2
įrašai, visi Piper, `RC=0`.

Zondo pataisa: manifeste keliai yra santykiniai `assets/audio/lt/` atžvilgiu
(`n/…`, `s/…`), ne nuo šaknies — pirmoji zondo versija dėl to rodė 0/8 ir tai
buvo **zondo, ne svetainės** klaida (po pataisos 8/8).

## 6. Vartai

- `python3 scripts/validate_content.py --grade 1 --strict` → **0 klaidų, 0 įspėjimų**, RC=0.
- `python3 scripts/check_docs_facts.py` → **0 klaidų, 0 įspėjimų** (9 kryptys, 35 moduliai sutampa su failais).
- `.venv/bin/python scripts/check_view.py --base https://one-man-company.github.io/suprask/ --viewports phone,small`
  → **Plotai: phone 390 px, small 360 px; Patikrinta: 70 (maršrutų: 35 · plotų: 2) · problemos: 0**, RC=0.
  Tai gyva svetainė naršyklėje, ne baitai.
- `python3 scripts/check_lessons.py` → 76 įrašai, visi su 4 laukais, RC=0.

## 7. Naujas defektų tipas — LL-76

Pirmas zondo paleidimas įvyko ~30 s po deploymento pabaigos ir tame pačiame
procese gavo **prieštaraujančius** atsakymus: `registry.js` pirmą kartą
`sha 66ee973f`, po kelių sekundžių `3e0a7472`; `index.html` — `38327b9e`, paskui
`ce47ba3e`. Antras paleidimas po kelių minučių — visi skirtumai tik `?v=` žyma.
Vienkartis baitų zondas būtų paskelbęs klaidingą `DIFF` (arba, kita tvarka,
klaidingą `OK` pasenusiam failui).

Įrašyta `research/wiki/guidelines/pamokos.md` kaip **LL-76 — Vienkartis fetch po
publikavimo pamatuoja mišrią CDN būseną** (Simptomas / Priežastis / Taisyklė /
Patikra). Taisyklė: žymą imti iš gyvo `index.html`, lyginti žymą ir baitus
atskirai, nesutapimą kartoti ir skirti „CDN dar neatsinaujino“ nuo „failas
paseręs“.

## 8. Įrašai

1. `research/wiki/changelog.md` — naujas įrašas viršuje (2026-11-09 16:03).
2. `research/wiki/guidelines/pamokos.md` — LL-76.
3. Šis failas — `agents/log/publikavimo-agentas-2026-11-09T1603.md`.
4. `agents/state.json` — `roles."publikavimo-agentas"` ir `last_publish_check` perrašyti #208 skaičiais.

Pasiūlymų neteikta: `check_published.py` riba (ID aibės, tik `grade-01`) jau
turį atvirą pasiūlymą #8716 ir mano #191 pasiūlymą
`agents/proposals/2026-11-09-publikavimo-agentas-patikra-baitais.json`; kartoti
tos pačios minties trečią kartą nėra prasmės.

## 9. Kas liko (ne publikavimo sritis)

- **`check_published.py` riba:** lygina ID aibes ir tik `grade-01`; baitų
  patikra vis dar gyvena scratch zonde, ne įrankyje (pasiūlymai #8716, #191).
- **Garso higiena:** atviras #7397 (`check_audio.py` vienkryptė — 6 našlaitiniai
  mp3). Publikavimui įtakos neturi: manifestas gyvai = `HEAD`, trūkstamų takų 0.
- **200 % teksto @360 px:** #7396, #7398, #5842 šeima — `check_view.py` matuoja
  16 px, todėl 70/70 žalia šių radinių nepaneigia; CSS/simuliacijų darbas.
- Zondas: `~/.hermes/profiles/deepseek41flash/cache/scratch/pub208.py` (35 failų
  baitų lyginimas, `?v=` žymos, garso imtis, 3 adresai), `pages208.py` (Pages
  deploymentų sąrašas), `diff208.py` (pirmo prieštaravimo išskaidymas) —
  paleidžiami pakartotinai.
