# Publikavimo patikra #122 — 2026-11-08 06:13

**Vaidmuo:** publikavimo-agentas · **Paleidimas:** 122 · **Sprendimas:** SUTAMPA

## 1. `check_published.py` išvestis

```
Repozitorija: 28 moduliai
Paskelbta:    28 moduliai
✔ Repo ir gyva svetainė sutampa.
EXIT=0
```

- `missing_on_live`: — (0)
- `hidden_locally`: — (0) — nė vienas modulio ID nepradingo iš repo, vaiko `localStorage` pažanga saugi
- `not_in_path`: — (0)
- `unpushed_commits`: 0 (`git rev-list origin/main..HEAD --count` = 0; `origin/main` = `HEAD` = `8b29d9b`)

## 2. HTTP kodai (realūs, ne iš repo)

| adresas | kodas |
|---|---|
| `https://one-man-company.github.io/suprask/` | 200 |
| `/content/lt/grade-01/matematika/23-piktograma-ir-stulpelis.json` | 200 |
| `/content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | 200 |
| `/content/lt/grade-01/technologijos/02-medziagu-bandymas.json` | 200 |

Papildomai: `content/lt/grade-01/index.json` 200, `path.json` 200, `grades.json` 200, `assets/audio/lt/manifest.json` 200.

## 3. Skaičiai sutampa ne tik kaip skaičiai

- `index.json`: 28 modulių, visi 28 failai egzistuoja, nė vieno ID neatitikimo tarp indekso ir failo `id`.
- `path.json`: 28 įrašų, 28 unikūs, indekse bet ne kelyje — 0, kelyje bet ne indekse — 0. Tvarkos neliečiau.
- **Visi 28 modulių JSON failai gyvai 200 ir baitais lygūs `git show HEAD:<failas>` — 0 skirtumų.**
- `index.json` baitais lygus HEAD (`sha256 a9cc86b3…`), `path.json` — lygus, `grades.json` gyvai ir vietoje skelbia `"modules": 28`.
- Garsas: `assets/audio/lt/manifest.json` 200, 46 764 baitai, `2a68b9c6…` = HEAD, 433 tekstai abiejose pusėse, raktų aibių skirtumas 0.
- Simuliacijų registras — importu per `node`, ne `grep` (LL-13): 28 raktai, 28 unikūs, visi su `mount()`, modulių su `sim` — 28 (28 unikūs komponentai), neregistruotų 0, registre bet nenaudojamų 0.

## 4. Kodėl 7 iš 13 `assets/` failų skiriasi nuo HEAD baitais

Palyginus `index.html`, CSS ir visus `assets/js/**` baitais: 6 sutampa, 7 skiriasi. Skirtumas — **ne turinys**: `.github/workflows/pages.yml:33–42` publikavimo metu prirašo `?v=<sha>` prie CSS ir JS nuorodų (kad GitHub Pages CDN neatiduotų seno failo ~10 min.). Gyvuose failuose žyma `?v=8b29d9bc`, o `HEAD` = `8b29d9bccd…` — tai pirmi 8 `HEAD` simboliai. Vadinasi, gyva svetainė pastatyta būtent iš `8b29d9b`. `assets/css/main.css` gyvai 200 ir baitais lygus HEAD (jis gauna žymą tik `index.html` nuorodoje, ne savo turinyje).

Darbinė kopija turi vieną neįcommituotą pakeitimą — `M assets/css/main.css` (vykstančio kurejo paleidimo #121 darbas ties #4563 eyebrow taisymu). Jis **nepaskelbtas ir nėra mano**; lyginau su `git show HEAD:`, ne su darbo medžiu.

## 5. Validacija

```
python3 scripts/validate_content.py --grade 1 --strict
Rezultatas: 0 klaidų, 0 įspėjimų
✔ Turinys atitinka standartą.
```

## 6. Sprendimas

**SUTAMPA** — repo 28 / paskelbta 28, 0 neišstumtų commit'ų, visi 28 modulių failai gyvai baitais lygūs HEAD, sims registras 28/28, garsas 433/433.

Nieko nešalinau, ID nepernumeravau, `path.json` nekeičiau, `git push` nedariau, CSS/simuliacijų/turinio neliečiau.

## 7. Už vaidmens ribų (neliestą, bet matyta)

- `docs/ARCHITEKTURA.md:178` „Būsena“ tebėra „5 kryptys, 27 moduliai, 27 simuliacijos“, o repo ir gyva svetainė turi 28 / 28. Tai dokumento skaičius (LL-21) ir jau padengtas atviru #4456 — `docs/` ne mano vaidmens sritis.
- `check_published.py` lygina tik ID sąrašus, ne failų baitus ir ne `path.json` turinį. Šiandien skirtumų nebuvo, bet įrankis pats to nepasakytų; gilesnė patikra atlikta atskiru zondu (`/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/pubcheck122.py`, `assetscheck122.py`, `simscheck122.mjs`).

## 8. Nauja pamoka

**LL-41 — Gyva svetainė nėra HEAD baitais: publikavimas prirašo versiją** (įrašyta `research/wiki/guidelines/pamokos.md`). Būtent šiandien baitų palyginimas be `?v=` normalizavimo būtų davęs 7 klaidingus „svetainė lenkia repo“ signalus. Tas pats zondas, lyginęs su darbo medžiu, būtų skelbęs regresiją dėl kito vaidmens neįcommituoto `main.css`.
