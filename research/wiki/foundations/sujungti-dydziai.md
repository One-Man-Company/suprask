---
title: "Sujungti dydžiai modelyje: teisingas rezultatas dar nėra supratimas"
tipas: fundamentai
temos: [simuliacijos, modeliai, sujungti dydžiai, vertinimas, laikas]
amzius: "6-18"
atnaujinta: 2026-11-04
saltiniai: 2
---

# Sujungti dydžiai modelyje: teisingas rezultatas dar nėra supratimas

## Pagrindinė idėja

Kai modelis dviem dydžiams neleidžia judėti atskirai, klaidinga būsena tampa neįmanoma. Tai galinga priemonė sąvokai atrasti — ir tuo pačiu pavojinga priemonė jai patikrinti. Vaikas nebegali parodyti klaidos, bet ir nebegali įrodyti supratimo: teisingas rezultatas atsiranda dėl mechanizmo, o ne dėl vaiko sprendimo.

Skirtumas svarbus todėl, kad platforma modelį naudoja dviem tikslais iš karto — mokyti ir matyti, ar išmoko. Pirmam tikslui jungtis padeda, antram — klaidina.

## Ką rodo tyrimai

**Laikrodis su sujungtomis rodyklėmis.** Earnest, Gonzales ir Plant (2017) tyrė 2 ir 4 klasių mokinius, kurie turėjo pastatyti rodykles nurodytam laikui. Su mechaniškai sujungtomis rodyklėmis mokiniai buvo tikslesni nei su nepriklausomomis. Tačiau autoriai aiškiai rašo: sėkmingi mokiniai galėjo naudotis sujungtomis rodyklėmis **nesvarstydami laikrodžio mato struktūros**. Tikslumas išaugo, supratimo įrodymo neatsirado.

**Kuri rodyklė sunkesnė.** Toje pačioje studijoje (2018, 48 mokiniai) valandų rodyklės padėtis buvo reikšmingai sunkesnė už minučių. Dažniausia strategija — skaičiaus sutapatinimas: skaičius iš užrašyto laiko perkeliamas ant to paties ciferblato numerio. Tai reiškia, kad vaikas atsako į klausimą „kuris skaičius?“, o ne „kuriame intervale esu?“.

Abu rezultatai veda prie vienos išvados: **rodyklių padėties tikslumas nėra sąvokos matas.** Jei modelis atsakymą sukonstruoja pats, teisingos būsenos skaičiavimas nieko nepasako.

## Keturios taisyklės modeliui su jungtimi

1. **Spėjimas prieš pirmą judesį.** Vienas sakinys, ne vertinamas: „Ką pasidarys X, kai Y apeis visą ratą? Pasakyk, tada suk.“ Vaikas įsipareigoja hipotezei, kol mechanizmas dar jos neatliko už jį.
2. **Bent viena užduotis apie patį ryšį, ne apie būseną.** Ne „kiek valandų?“, o „kuri rodyklė rodo valandas, jei per ratą viena apėjo visą ratą, o kita — vieną skaičių?“.
3. **Viena būsena, kurioje jungtis nematoma.** Rodyklės be spalvų ir be žymenų, arba dydžiai atskirti laike. Jei vaikas atpažįsta dydžius iš elgsenos, o ne iš pavadinimo, tai jau perkėlimas.
4. **Teisinga būsena nelyginama su supratimu.** `api.progress` žymi, kad vaikas pasiekė rezultatą, bet niekur nesakoma „išmokai“. Vertinimas lieka užduotyse, kur atsakymo mechanizmas nesukonstruoja.

## Kur tai gali pakenkti

- Jungtis gali **paslėpti klaidą**, kuri vėliau išlenda, kai rodyklės atsiskiria (Williams, 2012, kalba apie latentines klaidas, kurios suveikia tik pereinant prie sunkesnių atvejų).
- Jei vaikas niekada nemato dydžių atskirai, jis gali nesuprasti, kad juos apskritai galima skaičiuoti atskirai — todėl modelio ribos turi būti pasakomos žodžiu, o ne paliekamos numanyti.
- Sujungtas modelis vilioja kurti ilgą animaciją „pažiūrėk, kaip gražiai sukasi“. Tai jau animacija, ne simuliacija: vaikas nieko nekeičia ir nieko nenumato.

## Ką tai reiškia SUPRASK platformai

- Laiko modulyje (`15-laikas`) sujungtos rodyklės yra modelio šerdis, o ne patogumas — bet būtent todėl spėjimas ir 3-oji (perkėlimo) užduotis yra privalomi, ne puošmena.
- Ta pati taisyklė galioja bet kuriam modeliui, kuriame vienas slankiklis judina du rodiklius (svarstyklės, svirtis, greitis ir laikas): jei rezultatas gaunamas pats, klausiama apie ryšį.
- Naujos simuliacijos su jungtimi registruojamos kaip pilotas (`research/wiki/guidelines/pilotai.md`), nes jų vertinamoji vertė mažesnė nei atradimo vertė.

## Susieti

- [[simuliacijos-ir-modeliai]] — kodėl modelis turi reikalauti spėjimo
- [[kognityvine-apkrova]] — vienas kintamasis ir matomas tikslas
- [[vizualus-mokymasis]] — kaip parodyti ryšį be papildomo teksto
- [[interaktyvumo-principai]] — ką vaikas keičia ir ką pamato

## Šaltiniai

1. Earnest, D., Gonzales, A. C., & Plant, A. M. (2018). Time as a measure: Elementary students positioning the hands of an analog clock. *Journal of Numerical Cognition, 4*(1), 188–214. https://doi.org/10.5964/jnc.v4i1.94
2. Earnest, D., Gonzales, A. C., & Plant, A. M. (2017). Time as a measure: Elementary students positioning the hands of an analog clock. *Proceedings of the 39th Annual Meeting of PME-NA*, Indianapolis. https://files.eric.ed.gov/fulltext/ED581317.pdf · Williams, R. F. (2012). Image schemas in clock-reading: Latent errors and emerging expertise. *Journal of the Learning Sciences, 21*(2), 216–246. https://doi.org/10.1080/10508406.2011.553259
