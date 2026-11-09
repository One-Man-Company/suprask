---
title: "Forma ir spalva: kas neša tapatybę, o kas — įspūdį"
tipas: fundamentai
temos: [dailė, spalva, forma, modeliai, išraiška, pradinė mokykla]
amzius: "6-7"
atnaujinta: 2026-11-09
saltiniai: 4
---

# Forma ir spalva: kas neša tapatybę, o kas — įspūdį

## Pagrindinė idėja

Piešinyje du sluoksniai elgiasi skirtingai. **Forma** (linijos, dėmių vieta ir dydis) pasako, *kas* nupiešta — ji neša tapatybę. **Spalva** (užpildas) nekeičia to, kas nupiešta, bet keičia įspūdį, su kuriuo į piešinį žiūrima. 6–7 metų vaikui šis skirtumas nematomas todėl, kad abu sluoksniai keičiasi tame pačiame paveiksle vienu metu: jei paveikslas atrodo kitaip, vaikui atrodo, kad ir nupiešta kitaip.

Antra kliūtis yra ta, kad spalva kasdienėje patirtyje *yra* daikto požymis: geltona yra saulė, žalia — lapas, mėlyna — dangus. Vadinasi, vaiko nuostata „spalva yra daikto pavadinimas“ nėra klaida apie pasaulį — ji teisinga ten, kur spalva tikrai priklauso daiktui. Dailėje ji neteisinga, nes ten spalva pasirenkama, o ne atpažįstama. Todėl modelis negali remtis daiktais: daiktas kviečia spalvą vadinti, o ne keisti.

## Ką rodo tyrimai

**Vaikai spalvą vartoja simboliškai, kai jiems pasakoma įspūdžio kryptis.** Burkitt, Barrett ir Davis (2003) tyrė 330 vaikų nuo 4 iki 11 metų. Vaikai spalvino tris identiškas figūras (žmogų, šunį, medį), kurioms buvo duotos skirtingos charakteristikos: neutrali, „nemaloni“ ir „maloni“. Visose amžiaus grupėse ir visose temose vaikai malonioms figūroms rinkosi labiausiai mėgstamas spalvas, nemalonioms — mažiausiai mėgstamas, o neutralioms — vidutines. Nemalonioms figūroms visose grupėse dažniausiai rinktasi juodą, neutralioms — pagrindines spalvas, malonioms — platų pagrindinių ir antrinių spalvų spektrą. Autoriai daro išvadą, kad vaikai geba sistemingai keisti spalvos vartojimą pagal įspūdžio charakteristiką ir kad **net labai maži vaikai spalvą vartoja simboliškai**.

Svarbi sąlyga: charakteristiką vaikams *pasakydavo* tyrėjas. Patys iš piešinio jie įspūdžio nenuskaitydavo. Tai reiškia, kad 6–7 metų vaikui nereikia aiškinti „mėlyna yra liūdna“; jam reikia sudaryti sąlygas pamatyti, kad **toje pačioje formoje** spalva keičia įspūdį, ir duoti progą tai pasakyti savais žodžiais.

**Spalvos ir jausmo ryšį vaikas randa labai anksti, bet jis nėra įgimtas.** Zentner (2001) parodė, kad jau 3–4 metų vaikai randa pastovius ryšius tarp spalvų ir veido išraiškų, nors šie du reiškiniai neturi jokių bendrų fizinių savybių ir nepatenka į įprastas kategorijas. Autorius svarsto dvi paaiškinimo kryptis: ryšio išmokimą iš konvencijos ir bendrą suvokiamą dimensiją. Praktinė išvada platformai ta pati: ryšys egzistuoja, bet jį reikia parodyti, o ne paskelbti taisykle.

**Kodėl spalva taip lengvai „prilimpa“ prie daikto.** Palmer ir Schloss (2010) pasiūlė ekologinės valentingumo teorijos paaiškinimą: spalvų vertinimas kyla iš vidutinių emocinių reakcijų į daiktus, su kuriais ta spalva siejama. Žmonės mėgsta spalvas, stipriai susietas su mėgstamais daiktais (mėlyna — su giedru dangumi ir švariu vandeniu), ir nemėgsta spalvų, susietų su nemėgstamais daiktais (ruda — su išmatomis ir sugedusiu maistu). Modeliui tai svarbu dvejopa: pirma, spalvos reikšmė iš tikrųjų ateina iš daikto, todėl vaiko nuostata turi pagrindą; antra, jei modelyje yra atpažįstamas daiktas, jis traukia dėmesį į save ir užgožia klausimą apie spalvą kaip priemonę.

## Ką tai reiškia SUPRASK platformai

1. **Modelis turi fiksuoti formą mechaniškai, o ne žodžiais.** Jei teiginys yra „formos nepasikeitė“, tai turi būti įmanoma patikrinti: kompozicija įterpiama vieną kartą, keičiamas tik `fill` atributas, o kiekvienos formos `getBBox()` prieš ir po lieka tas pats. Persibraižiusi geometrija teiginį padaro neteisingu, net jei tekstas sako priešingai.
2. **Grįžimas į ankstesnę būseną yra kontrolinis bandymas.** Vaikas, grąžinęs pirmą spalvą ir pamatęs lygiai tą patį paveikslą, gauna įrodymą, kurio paveikslėlis negali duoti. Be grįžimo modelis tinka tik žiūrėjimui.
3. **Vienas kintamasis yra spalva, o ne „spalvų rinkinys“.** Jei keičiasi keli elementai iš karto, vaikas negali pasakyti, kuris iš jų ką padarė — ta pati priežastis, dėl kurios M-05 fiksuoja dovaną ir keičia tik norą.
4. **Abstrakti kompozicija, o ne peizažas.** Peizažas įneša antrą skaitymą: spalva jame žymi metų laiką ar paros laiką (tai jau `08-metu-laikai` sąvoka), o daiktas kviečia jį pavadinti. Dėmė neturi pavadinimo, todėl klausimas lieka apie spalvą.
5. **Nėra teisingos nuotaikos.** Spalvos ir jausmo ryšys iš dalies kultūrinis, todėl užduotys klausia, *kas pasikeitė*, o ne *ką jausti*. Refleksija — vienintelė vieta, kur vaikas pasako savo įspūdį, ir jis neverinamas.
6. **Daltonikui modelis lieka suprantamas, bet ne toks pat.** Spalvos pavadinimas rašomas po kiekvienu dažu ir pasakomas `readout`, todėl būsena perskaitoma ir be spalvų skyrimo; tačiau patiriamas skirtumas mažesnis, ir tai pasakoma mokytojo bloke, o ne slepiama.

## Ko šis įrašas nedaro

Jis neįrodo, kad būtent šis modelis padidina dailės supratimą — Burkitt ir kt. tyrė spalvos parinkimą pagal duotą charakteristiką, o ne mokymą atskirti formą nuo spalvos. Jis taip pat nesprendžia, ar 6–7 metų vaikui „nuotaika“ yra tinkamas žodis: lietuvių kalboje jis vartojamas ir apie orą, ir apie žmogų, todėl modulyje jis vartojamas tik suaugusiojo tekstuose, o vaikui rodomi konkretūs sakiniai („atrodo linksmiau“, „atrodo niūriau“) ir jie neverinami. Kompozicijos estetikos klausimai (ritmas, pusiausvyra, potėpis) lieka kitiems moduliams.

## Susieti

- [[vizualus-mokymasis]] — vienas vizualinis akcentas, tekstas ir vaizdas nedubliuoja
- [[simuliacijos-ir-modeliai]] — modelio ribos pasakomos, o ne slepiamos
- [[kognityvine-apkrova]] — vienas kintamasis, keturi dažai, jokių slankiklių
- [[sujungti-dydziai]] — kodėl grįžimas ir spėjimas yra būtini, kai modelis ką nors atlieka už vaiką
- [[../grades/01/metodai|1 klasės metodai]] — M-06 „Dailė: ta pati forma, kita spalva“

## Šaltiniai

1. Burkitt, E., Barrett, M., & Davis, A. (2003). Children's colour choices for completing drawings of affectively characterised topics. *Journal of Child Psychology and Psychiatry, 44*(3), 445–455. https://doi.org/10.1111/1469-7610.00134
2. Zentner, M. R. (2001). Preferences for colours and colour–emotion combinations in early childhood. *Developmental Science, 4*(4), 389–398. https://doi.org/10.1111/1467-7687.00180
3. Palmer, S. E., & Schloss, K. B. (2010). An ecological valence theory of human color preference. *Proceedings of the National Academy of Sciences, 107*(19), 8877–8882. https://doi.org/10.1073/pnas.0906172107
4. NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, „Dailė“: 1–2 klasių amžiaus ypatumai ir 2 pavyzdys 1 klasei „Kaip susikūrė pasaulis“ (mokymosi turinys: „Tyrinėja ir apibūdina skirtingas spalvų ir dėmių sukuriamas nuotaikas, ritmą“). Vietinis failas: `sources/pradinio-bp-rekomendacijos-2024.txt:2622–2625, 2714–2719`.
