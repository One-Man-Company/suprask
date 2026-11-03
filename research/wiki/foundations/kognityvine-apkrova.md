---
title: "Kognityvinė apkrova"
tipas: fundamentai
temos: [darbinė atmintis, Sweller, apkrova, pavyzdžiai]
amzius: "6-18"
atnaujinta: 2026-11-03
saltiniai: 2
---

# Kognityvinė apkrova

## Pagrindinė idėja

Darbinė atmintis — tai vieta, kurioje vyksta mąstymas. Ji labai maža: suaugęs žmogus vienu metu gali apdoroti maždaug 4 naujus elementus, o 6–7 metų vaikas — dar mažiau. Viskas, kas patenka į darbinę atmintį, bet nenaudinga mokymuisi, atima vietą iš to, kas naudinga.

Swellerio kognityvinės apkrovos teorija skiria tris apkrovas:

- **vidinė (intrinsic)** — kiek pati tema sudėtinga; priklauso nuo medžiagos ir nuo to, ką vaikas jau žino;
- **išorinė (extraneous)** — kiek sudėtinga dėl pateikimo: blogas išdėstymas, nereikalingi elementai, neaiškios instrukcijos;
- **naudinga (germane)** — pastangos, kurios veda į schemų kūrimą.

Mokymosi dizainas negali pakeisti vidinės apkrovos, bet privalo mažinti išorinę.

## Ką tai reiškia praktiškai

**Pavyzdžių efektas.** Pradedančiajam duotas išspręstas pavyzdys veiksmingesnis už tą pačią užduotį be pavyzdžio. Bet kai mokinys jau moka, pavyzdžiai pradeda trukdyti (ekspertizės atvirkštinis efektas) — todėl pavyzdys turi būti atsargiai dozuojamas.

**Dėmesio padalijimas.** Jei paveikslas vienur, o jį aiškinantis tekstas kitur, vaikas turi šokinėti tarp jų — tai papildoma apkrova, kuri nieko neišmoko.

**Perteklius.** Tas pats turinys dviem formomis (tekstas + tas pats tekstas garsiai) padidina apkrovą, o ne padeda.

**Lajpsniškas sudėtingumo augimas.** Sudėtingumą didink po vieną elementą. Du nauji kintamieji vienu metu — per daug 1–2 klasei.

## Amžiaus ypatumas (6–7 metai)

- Skaitymas pats savaime sunaudoja darbinę atmintį. Todėl 1 klasėje tekstas ekrane turi būti minimalus, o informacija — vaizdinė ir girdima.
- Instrukcijos turi būti vieno veiksmo („spausk +1“), ne dviejų sąlygų („jei skaičius didesnis nei 10, spausk…“).
- Vaikui sunku išlaikyti tikslą atmintyje, kol atlieka veiksmą. Todėl tikslas turi būti matomas ekrane visą laiką (`api.readout`).

## Ką tai reiškia SUPRASK platformai

1. **Simuliacijoje — vienas kintamasis.** Augalo modelyje yra trys (vanduo, šviesa, laikas), bet jie keičiami atskirais mygtukais ir rodomi kaip atskiri skaitliukai — vaikas mato, kurį keitė.
2. **Tikslas visada matomas.** `api.readout` rodo dabartinę būseną ir tikslą („Tu esi ties 2. Tikslas — 5“), kad vaikas nelaikytų tikslo galvoje.
3. **Nėra dvigubo teksto.** Modulio tekstas ir simuliacijos tekstas niekada nekartoja to paties sakinio.
4. **Pavyzdys prieš užduotį.** Kiekviename modulyje pirmiausia rodomas veikiantis modelis, tik paskui klausiama.
5. **Klaidų skaičius neribojamas, bet apkrova ribojama:** po klaidos atsiranda viena užuomina, ne trys paaiškinimai iš karto.

## Susieti

- [[vizualus-mokymasis]] — kaip pateikti vaizdą
- [[interaktyvumo-principai]] — UI sprendimai, mažinantys apkrovą
- [[simuliacijos-ir-modeliai]] — kodėl modelis padeda kurti schemą

## Šaltiniai

1. Sweller, J., van Merriënboer, J. J. G., & Paas, F. (2019). Cognitive architecture and instructional design: 20 years later. *Educational Psychology Review, 31*, 261–292. https://doi.org/10.1007/s10648-019-09465-5
2. Sweller, J. (2006). The worked example effect and human cognition. *Learning and Instruction, 16*(2), 165–169. https://doi.org/10.1016/j.learninstruc.2006.02.001
