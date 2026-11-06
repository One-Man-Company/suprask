# Changelog

Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.

## 2026-11-06 (16:37) — Publikavimo patikra #30: gyva svetainė sveika, 16 modulių laukia

- **Gyva svetainė (`origin/main` = `ebfd952`)** — 3 realios patikros: šaknis `200`, `content/lt/grade-01/index.json` `200`, `assets/audio/lt/manifest.json` `200`. Paskutinis publikavimas — `pages.yml` paleidimas `41969879355`, `completed/success`, 33 s, `2026-11-05T04:46:34Z`, head = `ebfd952`. `assets/js/app.js` ir `grade-01/index.json` baitai gyvai sutampa su `origin/main` (`929170fe…`, `d3c98a2d…`), todėl gyva svetainė atspindi būtent tą commit'ą, o ne tarpinę būseną.
- **Skirtumas:** vietoje 16 modulių, gyvai 14. Trūksta `14-pinigai` ir `16-lygybe-svarstykles` — abu gyvai `404`. `HEAD` yra 14 commitų priekyje `origin/main` ir 0 atsilieka.
- **Gyvos svetainės vidinė nesąmonė:** gyvas `content/lt/grades.json` skelbia `"modules": 13`, o gyvas `grade-01/index.json` turi 14 modulių. Skaičiuoklė atsilieka nuo turinio jau publikuotame sluoksnyje; `HEAD` tai taiso (16), bet pataisa nepaskelbta.
- **Publikavimo blokada (#272) tebėra, išmatuota iš naujo:** atskiroje klono kopijoje `git rebase origin/main` su švariu medžiu → `Current branch … is up to date.` `rc=0`; pridėjus vieną neįtrauktą pakeitimą → `error: cannot rebase: You have unstaged changes.` `rc=1`. Priežastis ta pati: `agents/run.py:572` publikuoja, o `agents/run.py:580` (`update_state`) po to perrašo `agents/state.json` jo nekomituodamas; `agents/state.json` yra trackinamas ir `.gitignore` jo neapima.
- **Publikavimo vartai uždaryti dėl turinio, ne dėl technikos:** `assets/js/sims/matematika.js:745-746,892-902` svarstyklės krypsta atvirkščiai. Išmatuota (`known=5`, `whole=8`, `box=1`): kairė 6, dešinė 8, bet kairė lėkštė nusileidžia `dy=+6,14 px`, dešinė kyla `dy=−6,14 px`. Sunkesnė pusė kyla aukštyn — tai tas pats modulis `16-lygybe-svarstykles`, kuris laukia publikavimo (kritika #449, `high`). Paskelbus 14 commitų krūvą, vaikas gyvai gautų apverstą modelį.
- **Sprendimas:** palaikyta. Nieko neatšaukta (gyva svetainė sveika, `200`), nieko nepaskelbta (vartai uždaryti). Publikavimas atnaujinamas tik po #449 pataisymo ir po to, kai darbinis medis bus švarus. Užfiksuota ataskaitoje `agents/log/leidejas-2026-11-06T1637.md`.

## 2026-11-06 — Pinigų metodas M-03

- **`grades/01/metodai.md`** — naujas metodas M-03 „Pinigai: monetos vertė, ne jos dydis“ (tema `2026-11-03-ideator-pinigai.json`): seka nuo saujos iki simbolio, simuliacijos `pinigine-ir-kaina` šešios būsenos, keturios užduotys su tipinėmis klaidomis ir užuominomis, modelio ribos.
- **`foundations/dydis-ir-skaicius.md`** — naujas įrašas: kai daiktas turi ir matomą dydį, ir užrašytą skaičių, vaikas iki septynerių metų tiki dydžiu; todėl modelis turi parodyti skaičiaus poveikį atskirai, o jo grafika neturi prieštarauti savo pačių taisyklei.
- **`foundations/README.md`** — indekso eilutė.
- **`guidelines/pilotai.md`** — P-008 (vertė juostoje, monetų skaičius atskirai, tikras monetų dydis ekrane).
- **Šaltinis:** Berti & Bombi (1981) https://doi.org/10.2307/1129504 · Strauss (1952) https://doi.org/10.2307/2088073 · Hasegawa (2020) https://doi.org/10.1038/s41598-020-62419-8 · Edmunds & Whitehurst (1973) https://eric.ed.gov/?id=ED087553 · Tracy & Fanelli (2000) https://eric.ed.gov/?id=ED451065 · Europos Komisijos monetų specifikacijos (5 c — 21,25 mm, 10 c — 19,75 mm).
- **Poveikis platformai:** būsimas modulis `14-pinigai`; taisyklė „daiktas su skaičiumi reikalauja atskiro poveikio vaizdo“ taikoma ir kitiems modeliams, kur vertė užrašyta, o ne išmatuojama (moneta, kauliukas, padalos žymė).

## 2026-11-05 (16:30) — Dienos darbas #16–#22: parašytas, bet nepaskelbtas

- **`content/lt/grade-01/matematika/16-lygybe-svarstykles.json`** (naujas, 108 eil.) + `index.json`, `path.json`, `assets/js/sims/matematika.js` (+265), 8 garso failai, `manifest.json` — 15-as modulis „Lygybė: svarstyklių pusiausvyra“ (#18 kurejas), pagal metodą M-02.
- **`assets/js/sims/pasaulis.js`** (+210/−41) — metų laikų modelis perrašytas iš iliustracijos į 12 mėnesių modelį (dienos trukmė, saulės aukštis, lapai, sniegas, paukščiai), augalo gyvenimas sustabdytas ties 10 diena (#19).
- **`assets/js/app.js`** (+41), **`assets/css/main.css`** (+11) — modulio pabaigoje viena „Kitas žingsnis · N iš 15“ kortelė pagal `path.json`; navigacijos taikiniai ≥ 48 px (#20).
- **`research/wiki/`** — `grades/01/metodai.md` M-02, `foundations/zenklas-kaip-busena.md`, `guidelines/pilotai.md` P-005 ir P-007, `guidelines/klausimai.md`, `curriculum/matematika-1-klase.md` (#17, #22).
- **`agents/proposals/`** — 12 naujų pasiūlymų (kritikas #21, programos-derintojas #22, simuliacijų inžinierius #19, metodininkas #17, ideator #16).
- **Poveikis platformai:** gyva svetainė šių pakeitimų **dar neturi** — `origin/main` stovi ties `ebfd952` (#14, 2026-11-05 04:46 UTC), t. y. 14 modulių; 15-as modulis gyvai duoda 404. Priežastis — ne turinio konfliktas (švari kopija ant `origin/main` persikelia be klaidų), o nešvarus darbinis medis: `agents/run.py` po publikavimo perrašo `agents/state.json` jo nekomituodamas, o `publish()` `git rebase origin/main` su neįtrauktu pakeitimu grąžina `error: cannot rebase: You have unstaged changes` → statusas `conflict` ir push neįvyksta. Užfiksuota ataskaitoje `agents/log/leidejas-2026-11-05T1633.md`.

## 2026-11-05 — Lygybės metodas M-02

- **`grades/01/metodai.md`** — naujas metodas M-02 „Lygybė: abi pusės sveria tiek pat“: seka, simuliacijos `svarstykles-lygybe` būsenos, keturios užduotys su tipinėmis klaidomis, modelio ribos.
- **`foundations/zenklas-kaip-busena.md`** — naujas įrašas: kai modelio grįžtamasis ryšys yra santykis, ženklas mokomas kaip būsena, bet modelio išdėstymas gali tyliai įtvirtinti operacinį skaitymą; todėl būtinas perskaitymas kita kryptimi ir užduotis be vieno skaičiaus pusėje.
- **`guidelines/pilotai.md`** — P-005 (svarstyklės su uždara dėžute ir apversta lygybės forma).
- **Šaltinis:** Baroody & Ginsburg (1983) https://doi.org/10.1086/461356 · McNeil & Alibali (2005) https://doi.org/10.1111/j.1467-8624.2005.00884.x · Falkner, Levi & Carpenter (1999) https://doi.org/10.5951/TCM.6.4.0232 · Stephens ir kt. (2022) https://doi.org/10.1080/10986065.2020.1793055 · Otten ir kt. (2019) https://doi.org/10.1186/s40594-019-0183-2
- **Poveikis platformai:** būsimas modulis `16-lygybe-svarstykles`; taisyklė „modelis, kuriame yra „=“, rodo abi kryptis“ taikoma ir kitiems lygybės ar palyginimo modeliams.

## 2026-11-03 — Bazės sukūrimas

- **`foundations/`** — pradėti mokymosi mokslo įrašai: vizualus mokymasis, kognityvinė apkrova, simuliacijos ir modeliai, interaktyvumo principai, vertinimas ir augimo mąstysena.
- **`foundations/`** — žaidimų teorijos dalis: žaidimų teorija vaikams, bendradarbiavimo žaidimai, sąžiningas dalijimasis, žaidimų mokymasis.
- **`curriculum/`** — 1 klasės programos išgryninimas iš NŠA „Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijų“ (2024) ir „Švietimo kelrodžio 2035“.
- **`grades/01`–`grades/12`** — sukurta 12 klasių struktūra (index, temos, metodai).
- **`guidelines/`** — atvirų klausimų sąrašas ir pilotų registras.
- **Šaltinis:** `docs/SVIETIMAS-1-GAIRES.md` (privalomos gairės), `docs/KURINIO-STANDARTAS.md`.

**Kodėl:** platformos turinys turi būti grindžiamas patikrintais šaltiniais, o ne prielaidomis. Bazė sukurta prieš pradedant 2 klasės turinį, kad kiekvienas sprendimas turėtų kur remtis.

## Šablonas

```
## YYYY-MM-DD — trumpas pavadinimas

- **`failas.md`** — kas pakeista (naujas įrašas / išvada pakeista / prieštaravimas užfiksuotas).
- **Šaltinis:** DOI arba URL.
- **Poveikis platformai:** kuriuos modulius ar sprendimus tai liečia.
```
