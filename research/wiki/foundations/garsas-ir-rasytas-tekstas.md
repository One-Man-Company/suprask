---
title: "Garsas ir rašytas tekstas: kada tas pats sakinys padeda, o kada trukdo"
tipas: fundamentai
temos: [garsas, naracija, perteklius, pradedantieji skaitytojai, simuliacijos]
amzius: "6-8"
atnaujinta: 2026-11-23
saltiniai: 4
---

# Garsas ir rašytas tekstas: kada tas pats sakinys padeda, o kada trukdo

## Pagrindinė idėja

„Ar garsas padeda 1 klasėje“ yra du klausimai su skirtingais atsakymais. Pirmas: ar apskritai tarti tekstą garsiai, kai vaikas dar skaito lėtai? Taip — balsas yra pagrindinis kanalas, o ne papildoma pagalba. Antras: ar rodyti ekrane tuos pačius žodžius, kuriuos balsas taria? Tai priklauso nuo to, ar tuo pačiu metu ekrane yra paveikslas, į kurį reikia žiūrėti, ir ar rašomas tekstas yra tas pats žodis į žodį, ar sutrumpinta versija.

Antras klausimas literatūroje vadinamas **pertekliaus principu**. Jo formuluotė siaura: kai paveikslas aiškinamas balsu, pridėtas toks pat rašytas tekstas mokymąsi veikia blogiau negu vien balsas su paveikslu. Tai nėra „tekstas blogai“ — tai „keli to paties turinio egzemplioriai vienu metu“.

## Ką rodo tyrimai

**Apžvalga skiria du pertekliaus tipus.** Trypke, Stebner ir Wirth (2023) išanalizavo 54 straipsnius su 63 tyrimais (1991–2021) ir atskyrė **turinio perteklių** (ta pati informacija keliuose šaltiniuose) nuo **kanalo pertekliaus** (ta pati informacija ateina ir akimis, ir ausimis). Poveikis priklauso nuo tipo.

**Identiškas rašytas tekstas prie įgarsinto paveikslo — neigiamas.** Keturi tyrimai (Mayer ir kt., 2001; Bohec ir Jamet, 2008; Sombatteera ir Kalyuga, 2012; Yue ir kt., 2013) rodo, kad paveikslas + balsas + tas pats raštas duoda prastesnius rezultatus negu paveikslas + balsas. Kai tekstas pateiktas sutrumpintai, rezultatas geresnis negu su identišku (Sombatteera ir Kalyuga; Yue ir kt.). Trys tyrimai (Wu, 2011; Roscoe ir kt., 2015; Dooley, 2015) didelio ir mažo sutapimo neatskyrė — kryptis nuosekli, dydis ne.

**Balsas + raštas be paveikslo — teigiamas.** Adesope ir Nesbit (2012) apibendrino 57 tyrimus (daugiausia studentai): balsas su rašytu tekstu neatsiliko nuo vien rašyto teksto ir lenkė vien balsą. Pranašumas didžiausias mažai žinantiems, sisteminio tempo medžiagai ir medžiagai be paveikslo; raktiniai žodžiai, ne perrašytas sakinys, paaiškino didžiąją jo dalį.

**Mažai žinantiems turinio perteklius gali padėti.** Trypke ir kt. (2023) rekomenduoja turinio perteklių, kai medžiaga sudėtinga, o besimokantysis — naujokas; neigiami atvejai siejami su didesnėmis žiniomis. Tai mūsų atvejo kryptis.

**Pradedantiesiems skaitytojams duomenų beveik nėra.** Torcasio ir Sweller (2010) atliko tris eksperimentus būtent su pradedančiaisiais: informatyvios iliustracijos prie paprasto teksto skaitymo įgūdį blogino labiau negu jokios iliustracijos, o neinformatyvios netrukdė. Ten nebuvo balso — tik iliustracija ir tekstas.

## Ką tai reiškia SUPRASK platformai

1. **Balsas lieka ir nėra „perteklius“.** Vaikui, kuris skaito lėtai, rašytas tekstas vienas neprieinamas. Žala — tik ten, kur balsas ir tekstas dubliuoja vienas kitą prie paveikslo.
2. **Netariamas tas pats sakinys, kuris rodomas prie paveikslo.** Tariama trumpiausia prasminga atkarpa — terminas, skaičius, vienas veiksmas. Du tekstų lygiai (`say`, `display`) leidžiami, jei kiekvienas turi vieną šaltinį.
3. **Ekrano tekstas trumpesnis, ne ilgesnis už tariamą.** Jei balsas sako vieną sakinį, ekrane telpa 2–4 žodžiai.
4. **Vienas teiginys — vienas kanalas.** Šiandien `21-erdvines-figuros` tame pačiame kadre siunčia tą patį teiginį dviem kanalais: `geometrija.js:329–331` skaityklė rašo „Kūgis iš viršaus: matai apskritimą“, o `:345` balsas taria „Kūgis iš viršaus atrodo kaip apskritimas“ (sakinys iš `21-erdvines-figuros.json`, `sim.config.sentences`). Abu teiginiai teisingi ir kiekvienas turi savo šaltinį — kodą ir JSON — todėl „vieno šaltinio“ taisyklė jų nemato.
5. **Pastaba papildo, o ne kartoja.** Jei `api.readout` pasakė rezultatą, `api.note` turi pasakyti priežastį.
6. **Skaičiai, kuriuos turime (2026-11-23).** Garso takelyje 883 tekstai (tiek pat, kiek 1 766 garso failų ÷ 2 balsai): 427 (48 %) yra 1–2 žodžių etiketės, 149 (17 %) — 7 ir daugiau žodžių sakiniai; bent vieną sakinio ilgumo `sim.config` garsą turi 39 iš 62 modulių. Matuota `scripts/generate_audio.py` `collect()`, todėl skaičius apima ir `api.speak()` literales. Ilgesnį garsą prie paveikslo tikriname atskirai.
7. **Visą sakinį balsas gali sakyti,** kai ekrane nėra paveikslo (refleksijos klausimas, įvadas), arba kai modelis nejuda ir vaikas pats valdo tempą.

## Ko šis įrašas nedaro

Jis nepagrindžia rašyto teksto šalinimo: garsas gali būti išjungtas, o kurčias vaikas privalo gauti tą pačią informaciją (T5.5). Jis neatsako, ar lietuviškas sintezės balsas 6–7 metų vaikui suprantamas — tam reikia piloto.

## Susieti

- [[vizualus-mokymasis]] — teksto ir vaizdo santykis, ankstesnė pertekliaus taisyklė
- [[kognityvine-apkrova]] — kodėl du žodiniai srautai kainuoja
- [[interaktyvumo-principai]] — garso išjungimas, prieinamumas
- [[modulio-ritmas-ir-demesys]] — kada keisti veiklos rūšį

## Šaltiniai

1. Mayer, R. E., & Fiorella, L. (Eds.). (2021). *The Cambridge handbook of multimedia learning* (3rd ed.). Cambridge University Press. https://doi.org/10.1017/9781108894333 — bendrasis principų rinkinys.
2. Trypke, M., Stebner, F., & Wirth, J. (2023). Two types of redundancy in multimedia learning: A literature review. *Frontiers in Psychology, 14*, 1148035. https://doi.org/10.3389/fpsyg.2023.1148035
3. Adesope, O. O., & Nesbit, J. C. (2012). Verbal redundancy in multimedia learning environments: A meta-analysis. *Journal of Educational Psychology, 104*(1), 250–263. https://doi.org/10.1037/a0026147
4. Torcasio, S., & Sweller, J. (2010). The use of illustrations when learning to read: A cognitive load theory approach. *Applied Cognitive Psychology, 24*(5), 659–672. https://doi.org/10.1002/acp.1577
