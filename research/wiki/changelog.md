# Changelog

Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.

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
