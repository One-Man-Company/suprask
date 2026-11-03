---
title: "Vizualus ir daugialypis mokymasis"
tipas: fundamentai
temos: [daugialypė terpė, dual coding, Mayer principai, vaizdas ir tekstas]
amzius: "6-18"
atnaujinta: 2026-11-03
saltiniai: 3
---

# Vizualus ir daugialypis mokymasis

## Pagrindinė idėja

Žmogus mokosi geriau, kai ta pati informacija pateikiama **dviem kanalais** — vaizdu ir žodžiu — bet tik tada, kai tie kanalai vienas kitą papildo, o ne dubliuoja. Tai vadinama dvigubu kodavimu (dual coding): vaizdinė ir kalbinė informacija saugomos skirtingai ir viena kitą sustiprina.

Problema ta, kad dauguma „vaizdingų“ skaidrių iš tikrųjų trukdo. Mayerio daugialypės terpės tyrimai rodo, kad žmogaus dėmesys ir darbinė atmintis riboti, todėl bet koks papildomas elementas, kuris neneša mokymosi informacijos, mažina supratimą.

## Principai, kurie pasitvirtino

**Rišlumas (coherence).** Pašalink nereikalingus elementus: dekoratyvines iliustracijas, foninę muziką, įdomias bet nesusijusias istorijas. Įdomumas nelygus mokymuisi („seductive details“ efektas).

**Signalizavimas (signalling).** Parodyk, į ką žiūrėti: paryškink, apibrėžk rėmeliu, pabrauk. Vaikas neturi spėlioti, kuri paveikslo dalis svarbi.

**Segmentavimas (segmenting).** Padalink turinį į mažus, naudotojo valdomus žingsnius. Vaikas pats spaudžia „toliau“ — tada jis spėja apdoroti informaciją.

**Erdvinis ir laikinis gretimumas.** Žodis ir jį paaiškinantis vaizdas turi būti greta (ne vienas puslapio viršuje, kitas apačioje) ir vienu metu.

**Pertekliškumas (redundancy).** Neskaitome ekrane to paties teksto, kurį tuo metu sakome garsiai. Geriau vaizdas + trumpas balsas, nei vaizdas + ilgas tekstas + balsas.

**Modališkumas.** Vaizdas + garsas dažnai veiksmingiau nei vaizdas + tekstas, ypač pradedantiesiems skaitytojams — jiems skaitymas pats savaime yra papildoma kognityvinė apkrova.

## Kur tai gali pakenkti

- Per daug spalvų ir animacijų — dėmesys keliauja į judėjimą, ne į sąvoką.
- Vaizdas, kuris „gražus“, bet netikslus (pvz., neteisingos proporcijos) — formuoja klaidingą modelį.
- Vienu metu rodomas tekstas ir tas pats tekstas garsiai — perteklius.
- Ilgas įvadinis tekstas prieš veiksmą: vaikas nustoja skaityti ir spaudžia bet ką.

## Ką tai reiškia SUPRASK platformai

1. **Simuliacijoje — ne daugiau kaip vienas vizualinis akcentas.** Dabartinė taisyklė: aktyvus elementas žymimas viena spalva (oranžinė), tikslas — kontrastinga (žalia), visa kita - neutralu.
2. **Tekstas ir vaizdas niekada nedubliuoja vienas kito.** Jei simuliacija rodo skaičių tiesę, tekstas neaprašinėja, kas joje matoma — jis klausia, ką vaikas pastebi.
3. **Garsas — užuomina, ne pamoka.** `api.speak` naudojamas vienam žodžiui ar skaičiui, ne ilgam paaiškinimui, nes ilgas balsas + ilgas tekstas = perteklius.
4. **Segmentavimas jau įdiegtas:** modulis suskirstytas į 4 dalis (idėja → simuliacija → paaiškinimas → užduotys), kiekviena valdoma vaiko.
5. **Jokių dekoratyvinių animacijų.** `pulse` naudojamas tik dėmesiui atkreipti į aktyvų elementą, ne grožiui.

## Susieti

- [[kognityvine-apkrova]] — kodėl perteklius kenkia
- [[simuliacijos-ir-modeliai]] — kaip vaizdas tampa modeliu
- [[interaktyvumo-principai]] — konkrečios UI taisyklės

## Šaltiniai

1. Mayer, R. E. (2009). *Multimedia Learning* (2nd ed.). Cambridge University Press. https://doi.org/10.1017/CBO9780511811678
2. Paivio, A. (1986). *Mental Representations: A Dual Coding Approach*. Oxford University Press.
3. Mayer, R. E. (2014). *The Cambridge Handbook of Multimedia Learning* (2nd ed.). Cambridge University Press. https://doi.org/10.1017/CBO9781139547369
