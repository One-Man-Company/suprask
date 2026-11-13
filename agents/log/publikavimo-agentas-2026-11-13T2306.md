# Publikavimo agentas — paleidimas #275 (2026-11-13T23:06+02:00)

## 1. `check_published.py` išvestis (ne perfrazuota)

```
Repozitorija: 39 moduliai
Paskelbta:    39 moduliai
  · grade-01: repo 39, gyvai 39
Pervadinti ID, priimta ir užregistruota (1):
  - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai (registruota; žyma už seno ID vaiko naršyklėje LIEKA — alias mechanizmo nėra, žr. agents/proposals/)
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, svetainės kodas 17 failų, versija 27635c28).
RC=0
```

Po raktų: `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0,
`stale_unknown` 0, `aux_stale` 0, `shell_stale` 0, `shell_unreachable` 0,
`path_differs` `[]`, `unpushed_commits` 0, `shell_count` 17,
`history_checked` `true`, `history_note` tuščias,
`vanished_ids` 1 (`03-sakinio-tvarka` → `03-sakinio-zodziai`, `resolved: true`),
`live_version` = `repo_version` = `27635c28`, `verdict.label` = `sutampa`, rc 0.
Trukmė — 6,2 s.

`HEAD` = `origin/main` = `27635c28`, `git rev-list --left-right --count
origin/main...HEAD` → `0	0`, darbinė kopija prieš darbą švari
(`git status --porcelain -uall` → 0 eilučių). Gyvas `index.html` neša
`?v=27635c28` — svetainė pastatyta būtent iš šio commit'o. Neišstumtų commit'ų: 0.

## 2. Trys gyvi adresai (+3 pagrindiniai)

| adresas | kodas | baitai |
|---|---|---|
| `content/lt/grade-01/matematika/04-skaiciu-tiese.json` | 200 | 3 636 |
| `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` | 200 | 5 459 |
| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | 200 | 4 932 |
| `/` (šaknis) | 200 | 3 487 |
| `content/lt/grade-01/index.json` | 200 | 11 741 |
| `assets/audio/lt/manifest.json` | 200 | 63 966 |

Repo to paties manifesto dydis — 63 966 B; `grades.json` 1 126 B,
`grade-01/index.json` 11 741 B, `path.json` 1 339 B. Visi sutampa su gyvais
(vartų `aux_stale` = 0).

## 3. Ką dar patikrinau šiame paleidime (ne vartų darbas)

1. **Indekso ir failų vientisumas.** `index.json` 39 nuorodos ↔ diske 39 modulių
   failai; failų, kurių nėra indekse — 0; indekso įrašų be failo — 0.
   `path.json` `sequence` 39 unikalių ID, nei vieno ne indekse, nei vieno indekso
   ID ne sekoje.
2. **Senasis ID niekur nedingo į kodą.** `grep -rn "03-sakinio-tvarka"` per
   `*.json/*.js/*.html` (be `agents/`, `research/`, `scripts/known_renames.json`)
   → 0 atvejų. Taigi nė vienas gyvas failas nesiunčia vaiko į nebeegzistuojantį
   modulį; lieka tik `localStorage` žymos problema (alias, #15045), kuri yra
   platformos kodo, ne publikavimo darbas.
3. **Visas garsas, ne manifestas.** Vartai lygina tik `manifest.json` baitus;
   pačių mp3 failų niekas nelygina. Šiame paleidime išmatuota pilnai:
   - manifestas 569 raktai → 1 138 nuorodos (`n` 569, `s` 569);
   - nuorodų, kurių nėra diske — **0**; diske esančių mp3, kurių nėra manifeste — **0**;
   - `git ls-files 'assets/audio/lt/*/*.mp3'` = **1 138** = diske **1 138**, nepridėtų/pakeistų `assets` failų — 0;
   - gyvai `HEAD` užklausa į **1 138** failų → **1 138 × 200**, ne 200 — 0.

   Kodėl toks skenavimas nėra dedamas į kiekvieną paleidimą: `pages.yml` publikuoja
   šaką be surinkimo žingsnio, todėl paskelbiama viskas, kas įtrackinta; grandinė
   „manifestas → diskas → git → gyva“ šiandien uždaryta trimis nepriklausomais
   matavimais. Tai įrodymas šiam kartui, ne naujas nuolatinis vartas.

## 4. Sprendimas: **SUTAMPA**

Nieko nešalinta, joks ID nepernumeruotas, `index.json` / `path.json` /
`grades.json` / garso manifestas / modulių JSON / `assets/` neliesti.
Jokių failų šiame paleidime nekeitinėjau — nebuvo ko taisyti, o be defekto
daromas pakeitimas paskutinį kartą (#273) ir buvo ta vieta, kur įrankis ėmė
teigti daugiau, nei matė.

## 5. Kas liko atvira (ne šio vaidmens sprendimas)

1. **Alias mechanizmo nėra.** Vaikas, atlikęs `03-sakinio-tvarka`, dabartinio
   `03-sakinio-zodziai` mato kaip neatliktą. Pasiūlymas
   `agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json` (high)
   tebegalioja; tai `assets/js/progress.js` + `index.json` `renamed_from`,
   ne publikavimo failas.
2. **Dashboard'o kortelė** — `check_published.py --json` jau turi `verdict` iš
   vieno šaltinio; renderio šiame profilyje nepaleidau (ne mano failas).
3. **#274 pasekmė publikuota:** `HEAD` 27635c2 yra gyvai (`?v=27635c28`), tačiau
   #274 keitė `scripts/`, kurių naršyklė neįkelia — publikavimo poveikio nėra.

## 6. Failai

Pakeisti: `research/wiki/changelog.md` (naujas įrašas 23:06), `agents/state.json`
(`last_publish_check_275`, `.gitignore`), `agents/log/publikavimo-agentas-2026-11-13T2306.md`
(ši ataskaita).

Neliesta: `content/**`, `assets/**`, `docs/**`, `scripts/**`, kitų vaidmenų failai,
naujų pasiūlymų nėra (nė vienas šio paleidimo radinys nevertas atskiro eilės įrašo —
garsas išmatuotas sveikas, indeksas vientisas, ID neprarasti).
