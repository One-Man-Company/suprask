# Publikavimo agentas — paleidimas #212

**Data:** 2026-11-09 23:06 (EET)
**Vaidmuo:** publikavimo-agentas
**HEAD:** `b4a6fac35111217edf907ad5fe5e0b40647762e4` = `origin/main`, darbinė kopija švari (`git status --porcelain -uall` tuščias), neišstumtų commit'ų 0.
**Sprendimas:** **SUTAMPA.** Nieko nešalinta, ID nepernumeruoti, `path.json` tvarka nekeista, `git push` nedarytas, joks turinio failas netaisytas.

---

## 1. `check_published.py` išvestis

```
$ python3 scripts/check_published.py
Repozitorija: 35 moduliai
Paskelbta:    35 moduliai
  · grade-01: repo 35, gyvai 35
✔ Repo ir gyva svetainė sutampa (ID, seka ir failų baitai).
RC=0
```

`--json` (sutrumpinta):

```json
{"local": 35, "published": 35,
 "missing_on_live": [], "hidden_locally": [], "not_in_path": [],
 "stale": [], "stale_unknown": [], "path_differs": [],
 "unpushed_commits": 0,
 "last_commit": "b4a6fac [sistemos-architektas] #211: import sqlite3, sys",
 "live_error": ""}
```

Įrankis šįkart **jau pats** lygino baitus: #211 (`scripts/check_published.py`, +242 eil.)
įgyvendino atvirą #8716 — klasės imamos iš `grades.json` (`status: live`), kiekvienas
gyvas modulio failas lyginamas `sha256` su repo failu, o nesutapimas patikrinamas antrą
kartą (LL-76). Todėl atskiras baitų zondas buvo reikalingas tik tam, ko įrankis
neapima — `assets/` failams (žr. §3).

Vaidmens šakos nepanaudotos: `missing_on_live` 0 → indekso taisyti nereikėjo;
`hidden_locally` 0 → sustabdymo priežasties nėra (`path.json` ir `index.json` ID aibės
sutampa abiem kryptimis); `not_in_path` 0 → `path.json` neliestas.

## 2. Trys gyvi adresai (HTTP)

| adresas | kodas | baitai |
|---|---|---|
| `content/lt/grade-01/daile/01-spalva-ir-nuotaika.json` | **200** | 6242 B |
| `content/lt/grade-01/matematika/24-komandu-seka.json` | **200** | 6874 B |
| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | **200** | 4946 B |

Papildomai: `…/pasaulio-pazinimas/18-kuprine-ir-kuno-dalys.json` **200** (8051 B),
šaknis **200** (3487 B). Jokio kito kodo nebuvo.

## 3. Baitai, ne ID aibės — tai, ko `check_published.py` neapima

Zondas `pub212_assets.py` (scratch, 21 failas): `git cat-file blob HEAD:<kelias>` prieš
gyvą baitą; iš gyvo failo **pašalinama** `?v=<sha8>` žyma (ne pakeičiama žymekliu —
pirmoji tokio zondo versija #210 dėl to davė 3 klaidingus DIFF).

```
OK index.html 3465 B (pašalinta ?v= žyma)     OK assets/js/sims/matematika.js 158964 B
OK assets/css/main.css 30802 B                OK assets/js/sims/muzika.js 23086 B
OK assets/js/app.js 30713 B (?v=)             OK assets/js/sims/pasaulis.js 95894 B (?v=)
OK assets/js/registry.js 3621 B (?v=)         OK assets/js/sims/technologijos.js 21653 B
OK assets/js/progress.js 2779 B               OK assets/js/sims/zaidimai.js 13614 B
OK assets/js/speech.js 7565 B                 OK assets/audio/lt/manifest.json 55403 B
OK assets/js/sims/art.js 35702 B              OK content/lt/grades.json 1126 B
OK assets/js/sims/calba.js 20380 B            OK content/lt/grade-01/index.json 10662 B
OK assets/js/sims/daile.js 9543 B (?v=)       OK content/lt/grade-01/path.json 1228 B
OK assets/js/sims/dorinis.js 13681 B (?v=)    OK assets/js/sims/geometrija.js 18542 B
OK assets/js/sims/gyvenimas.js 11115 B (?v=)

Sutampa: 21/21; skirtumų: 0
```

Gyvas `index.html` neša `?v=b4a6fac3` — pirmi 8 `HEAD` simboliai, tad svetainė pastatyta
iš `b4a6fac`, o ne iš ankstesnio `99b8a34`. Pages deploymentas prie to paties SHA yra
`completed/success`; tai sutampa ir su `?v=` žyma, ir su baitų lygybe.

## 4. Garsas (imtis)

`seed 212`, 8 manifestо raktai × `n`/`s` = **16/16** gyvų mp3 → `200`, ID3 antraštė,
18 433–69 215 B (`Diena 9`, `Pralaimėjai`, `16 blokus`, `Pilnas dešimtukas!`,
`2 valandos`, `Aštuoni ir šeši yra keturiolika.`, `Pakeisk petnešų ilgį.`,
`Suskaičiavai visas figūras. Apskritimų daugiau, nors jie mažesni.`).
Pirmoji zondo versija rodė 0/16 — klaida buvo zonde (manifesto takai yra santykiniai
`assets/audio/lt/` atžvilgiu), ne svetainėje; po pataisymo 16/16.

## 5. Ką vaikas realiai mato (gyva svetainė)

```
$ .venv/bin/python scripts/check_view.py --base https://one-man-company.github.io/suprask/ --viewports small
Plotai: small 360px
Patikrinta: 35 (maršrutų: 35 · plotų: 1) · problemos: 0
✔ Visi moduliai matomi ir telpa visuose plotuose (su Brave skydų blokais).
RC=0
```

Be `.venv` `python3` neranda playwright (`KLAIDA: nėra playwright`) — zondas paleistas
repo `.venv/bin/python`, kaip ir ankstesniuose paleidimuose.

## 6. Nutekėjimo patikra

`agents/state.json`, `agents/AGENTS.md`, `docs/ARCHITEKTURA.md`,
`scripts/check_published.py`, `research/wiki/changelog.md` → **404**; `404.html` → **200**.
Vidiniai keliai ir toliau nepublikuojami.

## 7. Ką tai reiškia turiniui

Nuo #209 (`97ed524`) turinys ir `assets/` nekeitėsi: #211 keitė tik `agents/db.py`,
`dashboard/server.py`, `scripts/check_agents.py`, `scripts/check_audio.py`,
`scripts/check_published.py`, `scripts/system_report.py`. Todėl vaiko `localStorage`
pažanga rodo į tuos pačius 35 modulius ir tuos pačius ID, o svetainė atiduoda tuos
pačius baitus, kuriuos #209 patvirtino.

#210 (19:38) patikra changelog įrašo nepaliko (trijų likusių darbų sąrašas toje
ataskaitoje). Šis įrašas (`research/wiki/changelog.md`, 2026-11-09 23:06) ją uždengia
tais pačiais skaičiais — naujo teiginio apie #210 nepridėta, nes to paleidimo baitų
zondo išvestis buvo 44/44 ir HTTP 35/35.

## 8. Kas neliesta

- `agents/proposals/` — naujų pasiūlymų neteikta: atviras #8716 (`check_published.py`)
  šiandien įgyvendintas, o likę publikavimo pastebėjimai (garso našlaičiai #7397,
  `?v=` normalizavimas) jau turi atvirus pasiūlymus.
- `content/`, `assets/`, `docs/`, `scripts/`, `agents/run.py` — neliesti.
- `research/wiki/guidelines/pamokos.md` — naujos pamokos nepridėta: `?v=` žymos taisyklė
  jau fiksuota LL-76, o šio paleidimo zondo klaida (manifesto takai be `assets/audio/lt/`
  priešdėlio) yra zondo, ne platformos, defektas.
