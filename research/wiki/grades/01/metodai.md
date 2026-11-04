---
title: "1 klasės metodai"
tipas: metodai
klase: 1
amzius: "6–7"
atnaujinta: 2026-11-04
---

# 1 klasės metodai

## Kognityvinis profilis

Pirmas susidūrimas su raide, skaičiumi ir pasauliu. Viskas pradedama nuo konkretaus daikto, garso ir veiksmo.

## Ką tai reiškia dizainui

- **Simuliacijos tipas:** tiesioginis manipuliavimas (bakstelėjimas, tempimas), garsas + vaizdas, vienas kintamasis, jokių laikmačių
- **Tekstas ekrane:** pagal amžiaus lentelę `docs/SVIETIMAS-1-GAIRES.md` (5 skyrius).
- **Grįžtamasis ryšys:** trumpas, apie veiksmą, be palyginimo su kitais.
- **Vertinimas:** savikontrolė ir refleksija; jokių pažymių.

## Ko vengti

- ilgo teksto, kelių kintamųjų iš karto, abstrakčių simbolių be vaizdo, bet kokio vertinimo balais

## Metodai

### M-01 — Laikas: vienas ratas, vienas žingsnis

**Data:** 2026-11-04 · **Tema:** `agents/proposals/2026-11-03-ideator-laikas.json` · **Tikslas:** `content/lt/grade-01/matematika/15-laikas.json`

**Viena didelė idėja.** Ilgoji rodyklė apeina vieną ratą — trumpoji pasislenka vienu skaičiumi. Pilną valandą skaitome pagal trumpąją, kai ilgoji stovi ties 12.

Minučių skaičius šiame metode nemokomas. Programa 1 klasei prašo „nusakyti laiką **pilnomis valandomis** (val., h)“ (`matematika-1-klase.md:129`), o minutės yra antra sąvoka. Modelis ilgąją rodyklę vadina „vienu ratu“, ne „60 minučių“, ir ciferblate sąmoningai nėra minučių brūkšnelių.

**Klaidingos nuostatos.**

1. **„Valandas rodo ilgoji rodyklė“** — ji ilgesnė, labiau matoma ir labiau juda, todėl vaikas ją laiko svarbiausia. Klaida pasireiškia kaip atsakymas „12 valandų“, kai ilgoji stovi ties 12, o trumpoji ties 7.
2. **„Rodyklės nepriklausomos“** — piešinyje kiekvieną rodyklę galima pastatyti kur nori, todėl vaikas nesitiki, kad viena priklauso nuo kitos. Tikrame laikrodyje jos sujungtos mechaniškai.
3. **Artimiausio skaičiaus strategija** (Williams, 2012): valanda nuskaitoma pagal artimiausią skaičių, todėl 2:50 skaitoma kaip 3:50, nes trumpoji rodyklė jau prie 3. Šiame modulyje rodomos tik pilnos valandos, bet **tarpinė padėtis parodoma sąmoningai** — kad vaikas matytų, jog tarp skaičių valanda dar nepasikeitė, ir nuostata nesusidarytų.

**Seka (konkretumas → simbolis → perkėlimas).**

1. **Kūnas.** Vaikas apeina kėdę — tai vienas ratas. Po kiekvieno rato mokytojas paslenka popierinę rodyklę per vieną skaičių ant kartono laikrodžio. Ratas jaučiamas kojomis, žingsnis — akimis.
2. **Ekranas.** Dvi sujungtos rodyklės. Vaikas traukia ilgąją; trumpoji slenka lygiai dvylika kartų lėčiau ir tik užsidarius ratui sustoja ties skaičiumi.
3. **Simbolis.** Ratui užsidarius pasirodo užrašas „3 val.“ — skaičius ir vienetas. Vaikas pasako „3 valandos“ ir parodo, kuri rodyklė tą skaičių parodė.
4. **Perkėlimas.** Rodyklių atpažinimas pagal judėjimą (kai spalvos ir užrašai nematomi) ir valandos skaičiavimas įvykių sekoje: „Išvyko 9 valandą, važiavo vieną ratą — kelintą atvyko?“

**Privalomas žingsnis prieš pirmą sukimo judesį.** `api.readout`: „Ką pasidarys trumpoji, kai ilgoji apeis visą ratą? Pasakyk, tada suk.“ Vaikas spėja žodžiu, tada tikrina. Tai ne puošmena: Earnest, Gonzales ir Plant (2017) nustatė, kad mechaniškai sujungtos rodyklės pagerina padėties tikslumą, bet dalis vaikų teisingai pastato rodykles „nesvarstydami mato struktūros“. Sujungtas modelis pats išsprendžia uždavinį už vaiką — todėl spėjimas ir perkėlimo užduotis yra būtini, o teisinga padėtis nelaikoma supratimo įrodymu.

**Simuliacijos specifikacija.** Komponentas `laikrodis-sujungtos-rodykles`, `assets/js/sims/matematika.js`, `config: { "startHour": 12 }`.

| Būsena | Ką rodo | `readout` |
|---|---|---|
| 0 ratų | abi rodyklės ties 12 | „12 valandų“ |
| ratas nebaigtas | ilgoji tarp skaičių, trumpoji pasislinkusi mažiau nei per skaičių | „Ratas nebaigtas“ |
| ratas baigtas | ilgoji lygiai ties 12, trumpoji lygiai ties skaičiumi | „1 valanda“ |

- **Vienas kintamasis:** `t` ∈ [0; 1] — kiek rato pasukta. `ilgoji = t · 360°`, `trumpoji = (valanda % 12) · 30° + t · 30°`. Nieko daugiau vaikas nekeičia.
- **Valdymas:** tempti ilgąją rodyklę (veikia visame ratlankio plote, ne tik ant rodyklės), `←`/`→` po 30°, mygtukas „Pasūk vieną ratą“ (≥ 48 px). Trys įėjimai, viena būsena — taip patenkamas ir 48 px reikalavimas, ir klaviatūra.
- **Skirtumas be spalvos:** trumpoji — stora ir buka, ilgoji — plona su rodykle. Spalva niekada nėra vienintelis informacijos nešėjas.
- **Tikslas matomas:** žalias žiedas ties 12 (target), rodyklė — oranžinė (active), visa kita neutralu.
- **Garsas:** uždaras 12 frazių rinkinys („1 valanda“, „2 valandos“ … „12 valandų“), kad `scripts/check_audio.py` manifestas liktų mažas. Gramatika — viena funkcija: 1 → *valanda*, 2–9 → *valandos*, 10–12 → *valandų*.
- **`prefers-reduced-motion`:** rodyklės nejuda tolygiai, būsena pasikeičia iš karto.
- **Be laikmačių, be ėjimų limito, be „game over“.** Ratas sukasi tiek kartų, kiek vaikas nori; 12 → 1 persisuka be klaidos pranešimo.

**Užduotys.**

1. **Atpažinimas** (pagrindinis lygis). „Ilgoji rodyklė ties 12, trumpoji — ties 7. Kiek dabar valandų?“ Variantai: 7 valandos / 12 valandų / 5 valandos. Užuomina į klaidą: „Kuri rodyklė trumpa? Ilgoji tik parodė, kad ratas baigtas.“
2. **Taikymas.** „Laikrodis rodo 9 valandas. Ilgoji apeina visą ratą ir vėl stoja ties 12. Kiek dabar valandų?“ (10). Užuomina: „Vienas ratas — vienas žingsnis trumpąja. Skaičiuok nuo 9 vienu toliau.“
3. **Perkėlimas.** „Rodyklės be žymenų. Per vieną ratą viena rodyklė apėjo visą ratą, kita pasislinko tik per vieną skaičių. Kuri rodo valandas?“ (trumpoji). Užuomina: „Daugiau judanti rodyklė ne visada skaičiuoja didesnį vienetą. Palygink, kiek pasislinko kiekviena.“
4. **Praplėtimas** (`optional: true`, aukštesnysis lygis). „Ilgoji nuėjo pusę rato ir sustojo. Ar laikrodis jau rodo kitą valandą?“ (ne — ratas nebaigtas, trumpoji dar tarp skaičių). Užuomina: „Pažiūrėk, ar trumpoji jau stovi lygiai ties skaičiumi.“

**Refleksija.** „Kiek ratų turi apeiti ilgoji, kol trumpoji apeis visą laikrodį? Pasakyk, kaip sužinojai.“ Atsakymas 12 — ne nauja sąvoka, o šio modelio pasekmė, todėl klausiama žodžiu, ne vertinama.

**Modelio ribos (pasakomos vaikui ir mokytojui).** Modelis nerodo minučių ir sekundžių; ilgoji rodyklė čia reiškia vieną ratą, o ne 60 minučių; 24 valandų sistema yra atskiras modulis, nes tai antra sąvoka. Tikrame laikrodyje rodyklės juda tolygiai — modelyje taip pat, todėl vaikas nemato dirbtinio „šuolio“.

**Šaltiniai.** Williams, R. F. (2012). Image schemas in clock-reading. *Journal of the Learning Sciences, 21*(2), 216–246. https://doi.org/10.1080/10508406.2011.553259 · Earnest, D., Gonzales, A. C., & Plant, A. M. (2018). Time as a measure: Elementary students positioning the hands of an analog clock. *Journal of Numerical Cognition, 4*(1), 188–214. https://doi.org/10.5964/jnc.v4i1.94 · Earnest, D., Gonzales, A. C., & Plant, A. M. (2017). Time as a measure… PME-NA 39 proceedings: https://files.eric.ed.gov/fulltext/ED581317.pdf

## Atviros prielaidos

- _(kas šioje klasėje dar nepatikrinta; žr. [[../../guidelines/klausimai|klausimus]])_

## Šaltiniai

- Oficiali programa: `research/wiki/curriculum/`
- Metodų bazė: `research/wiki/foundations/`
