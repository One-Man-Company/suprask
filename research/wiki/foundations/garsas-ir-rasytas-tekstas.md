---
title: "Garsas ir rašytas tekstas: kada tas pats sakinys padeda, o kada trukdo"
tipas: fundamentai
temos: [garsas, naracija, perteklius, pradedantieji skaitytojai, simuliacijos]
amzius: "6-8"
atnaujinta: 2026-11-09
saltiniai: 4
---

# Garsas ir rašytas tekstas: kada tas pats sakinys padeda, o kada trukdo

## Pagrindinė idėja

„Ar garsas padeda 1 klasėje“ yra du klausimai su skirtingais atsakymais. Pirmas: ar apskritai tarti tekstą garsiai, kai vaikas dar skaito lėtai? Taip — balsas yra pagrindinis kanalas, o ne papildoma pagalba. Antras: ar rodyti ekrane tuos pačius žodžius, kuriuos balsas taria? Tai priklauso nuo dviejų dalykų: ar tuo pačiu metu ekrane yra paveikslas, į kurį reikia žiūrėti, ir ar rašomas tekstas yra tas pats žodis į žodį, ar sutrumpinta versija.

Antras klausimas literatūroje vadinamas **pertekliaus (redundancy) principu**. Jo formuluotė siaura: kai paveikslas ar animacija aiškinami balsu, pridėtas toks pat rašytas tekstas mokymąsi veikia blogiau negu vien balsas su paveikslu. Tai nėra „tekstas blogai“ — tai „keli to paties turinio egzemplioriai vienu metu“.

## Ką rodo tyrimai

**Poveikis nedidelis, bet kryptis nuosekli.** Mayerio sudarytoje principų lentelėje pertekliaus efektas remiamas 8 iš 12 eksperimentų, medianinis efektas d = 0,10. Tai mažas efektas; cituoti jį kaip „įrodymą, kad tekstas kenkia“ būtų neteisinga. Mechanizmas dvigubas: akys blaškosi tarp paveikslo ir teksto, o darbinė atmintis eikvoja pastangas lygindama du žodinius srautus.

**63 tyrimų apžvalga rodo, kur yra riba.** Trypke, Stebner ir Wirth (2023) skyrė turinio perteklių nuo kanalo pertekliaus. Kai prie pasakojamos iliustracijos pridedamas **identiškas** rašytas tekstas, rezultatas neigiamas (Mayer ir kt., 2001; Bohec ir Jamet, 2008; Sombatteera ir Kalyuga, 2012; Yue ir kt., 2013). Kai pridedamas **sutrumpintas** ar raktiniais žodžiais pagrįstas tekstas, rezultatas geresnis negu su identišku. Kai paveikslo konkurento nėra, 33 tyrimų rezultatai nevienodi, dažnai teigiami — ypač kai tekstas trumpas ir raktinis (Bernal, 2014).

**Metaanalizė patvirtina tą pačią asimetriją.** Adesope ir Nesbit (2012) apibendrino 57 tyrimus: balsas su rašytu tekstu davė tokį patį rezultatą kaip vien rašytas tekstas ir geresnį už vien balsą. Pranašumas buvo didžiausias mažai žinantiems, sisteminio tempo medžiagai ir **medžiagai be paveikslo**; raktiniai žodžiai, o ne perrašytas sakinys, paaiškino didžiąją jo dalį.

**Ribos sąlygos mums svarbesnės už pagrindinį efektą.** Žala mažėja arba dingsta, kai medžiaga lėto tempo arba vaikas pats valdo tempą, kai tekstas trumpas, kai jis ne žodis į žodį ir kai paveikslo nėra (Mayer ir Fiorella, 2021). Mūsų simuliacijos yra vaiko valdomos, todėl didžiausios rizikos atvejis — greitas sisteminis tempas su identišku tekstu — pas mus nebūdingas. Bet ne nulinis: balsas ir tekstas pasirodo tą pačią akimirką, kai keičiasi paveikslas.

**Ko tyrimai neatsako.** Nė vienas apžvalgos tyrimas neatliktas su pradedančiaisiais skaitytojais. Artimiausias yra Torcasio ir Sweller (2010), kuris tyrė būtent juos: informatyvios iliustracijos prie paprasto teksto skaitymo įgūdį blogino labiau negu jokių iliustracijų, o neinformatyvios netrukdė. Bet ten nebuvo balso — tik iliustracija ir tekstas.

## Ką tai reiškia SUPRASK platformai

1. **Balsas lieka ir nėra „perteklius“.** Vaikui, kuris skaito lėtai, rašytas tekstas vienas neprieinamas. Tyrimai rodo žalą tik ten, kur balsas ir tekstas dubliuoja vienas kitą prie paveikslo.
2. **Netariamas tas pats sakinys, kuris rodomas prie paveikslo.** Tariama trumpiausia prasminga atkarpa — terminas, skaičius, vienas veiksmas („Dešinė sunkesnė.“). Du tekstų lygiai (`say` — girdima, `display` — rodoma) leidžiami, jei kiekvienas turi vieną šaltinį.
3. **Ekrano tekstas trumpesnis, ne ilgesnis už tariamą.** Jei balsas sako vieną sakinį, ekrane telpa 2–4 žodžiai. Jei ekrane trys sakiniai, o balsas kartoja jų turinį, tai jau trys žodiniai srautai prie vieno paveikslo.
4. **Pastaba nekartoja skaityklos.** Jei `api.readout` jau pasakė rezultatą, `api.note` turi pasakyti priežastį. Platformoje yra atvejis, kai pastaba prasideda tuo pačiu sakiniu kaip skaitykla: `assets/js/sims/geometrija.js:231` — „Apžiūrėjai kūną iš trijų pusių.“, `:232` — „Apžiūrėjai kūną iš trijų pusių. Visą laiką tai buvo vienas kūnas.“; be to, požymis po paveikslu (`:196`) kartoja skaityklos sakinį (`:248`) pažodžiui, o balsas taria trečią to paties teiginio variantą.
5. **Skaičiai, kuriuos turime.** Garso takelyje 463 tekstai: 338 (73 %) yra 1–2 žodžių etiketės, 48 (10 %) — 7 ir daugiau žodžių sakiniai; bent vieną sakinio ilgumo garsą turi 16 iš 31 modulio. Etikečių forma atitinka tyrimų rekomendaciją; sakinio ilgumo garsas prie paveikslo yra vieta, kurią reikia tikrinti kiekvieną atvejį atskirai.
6. **Visą sakinį balsas gali sakyti,** kai ekrane nėra paveikslo, į kurį reikia žiūrėti (refleksijos klausimas, įvadas), arba kai modelis nejuda ir vaikas pats valdo tempą.

## Ko šis įrašas nedaro

Jis nepagrindžia rašyto teksto šalinimo: garsas gali būti išjungtas, o kurčias vaikas privalo gauti tą pačią informaciją (T5.5). Jis neatsako, ar lietuviškas sintezės balsas tokiu tempu suprantamas 6–7 metų vaikui — tam reikia piloto su vaikais. Ir neįrodo, kad trys tekstinės eilutės ekrane savaime per daug: tai darbinės atminties klausimas, sprendžiamas atskirai.

## Susieti

- [[vizualus-mokymasis]] — teksto ir vaizdo santykis, ankstesnė pertekliaus taisyklė
- [[kognityvine-apkrova]] — kodėl du žodiniai srautai kainuoja
- [[interaktyvumo-principai]] — garso išjungimas, prieinamumas
- [[modulio-ritmas-ir-demesys]] — kada keisti veiklos rūšį

## Šaltiniai

1. Mayer, R. E., & Fiorella, L. (Eds.). (2021). *The Cambridge handbook of multimedia learning* (3rd ed.). Cambridge University Press. https://doi.org/10.1017/9781108894333
2. Trypke, M., Stebner, F., & Wirth, J. (2023). Two types of redundancy in multimedia learning: A literature review. *Frontiers in Psychology, 14*, 1148035. https://doi.org/10.3389/fpsyg.2023.1148035
3. Adesope, O. O., & Nesbit, J. C. (2012). Verbal redundancy in multimedia learning environments: A meta-analysis. *Journal of Educational Psychology, 104*(1), 250–263. https://doi.org/10.1037/a0026147
4. Torcasio, S., & Sweller, J. (2010). The use of illustrations when learning to read: A cognitive load approach. *Applied Cognitive Psychology, 24*(5), 659–672. https://doi.org/10.1002/acp.1577
