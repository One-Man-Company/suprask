# metodininkas — 2026-11-09T0820

- paleidimas: #180 (manual)
- trukmė: 659s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ research/wiki/foundations/forma-ir-spalva.md
│ @@ -0,0 +1,54 @@
│ +---
│ +title: "Forma ir spalva: kas neša tapatybę, o kas — įspūdį"
│ +tipas: fundamentai
│ +temos: [dailė, spalva, forma, modeliai, išraiška, pradinė mokykla]
│ +amzius: "6-7"
│ +atnaujinta: 2026-11-09
│ +saltiniai: 4
│ +---
│ +
│ +# Forma ir spalva: kas neša tapatybę, o kas — įspūdį
│ +
│ +## Pagrindinė idėja
│ +
│ +Piešinyje du sluoksniai elgiasi skirtingai. **Forma** (linijos, dėmių vieta ir dydis) pasako, *kas* nupiešta — ji neša tapatybę. **Spalva** (užpildas) nekeičia to, kas nupiešta, bet keičia įspūdį, su kuriuo į piešinį žiūrima. 6–7 metų vaikui šis skirtumas nematomas todėl, kad abu sluoksniai keičiasi tame pačiame paveiksle vienu metu: jei paveikslas atrodo kitaip, vaikui atrodo, kad ir nupiešta kitaip.
│ +
│ +Antra kliūtis yra ta, kad spalva kasdienėje patirtyje *yra* daikto požymis: geltona yra saulė, žalia — lapas, mėlyna — dangus. Vadinasi, vaiko nuostata „spalva yra daikto pavadinimas“ nėra klaida apie pasaulį — ji teisinga ten, kur spalva tikrai priklauso daiktui. Dailėje ji neteisinga, nes ten spalva pasirenkama, o ne atpažįstama. Todėl modelis negali remtis daiktais: daiktas kviečia spalvą vadinti, o ne keisti.
│ +
│ +## Ką rodo tyrimai
│ +
│ +**Vaikai spalvą vartoja simboliškai, kai jiems pasakoma įspūdžio kryptis.** Burkitt, Barrett ir Davis (2003) tyrė 330 vaikų nuo 4 iki 11 metų. Vaikai spalvino tris identiškas figūras (žmogų, šunį, medį), kurioms buvo duotos skirtingos charakteristikos: neutrali, „nemaloni“ ir „maloni“. Visose amžiaus grupėse ir visose temose vaikai malonioms figūroms rinkosi labiausiai mėgstamas spalvas, nemalonioms — mažiausiai mėgstamas, o neutralioms — vidutines. Nemalonioms figūroms visose grupėse dažniausiai rinktasi juodą, neutralioms — pagrindines spalvas, malonioms — platų pagrindinių ir antrinių spalvų spektrą. Autoriai daro išvadą, kad vaikai geba sistemingai keisti spalvos vartojimą pagal įspūdžio charakteristiką ir kad **net labai maži vaikai spalvą vartoja simboliškai**.
│ +
│ +Svarbi sąlyga: charakteristiką vaikams *pasakydavo* tyrėjas. Patys iš piešinio jie įspūdžio nenuskaitydavo. Tai reiškia, kad 6–7 metų vaikui nereikia aiškinti „mėlyna yra liūdna“; jam reikia sudaryti sąlygas pamatyti, kad **toje pačioje formoje** spalva keičia įspūdį, ir duoti progą tai pasakyti savais žodžiais.
│ +
│ +**Spalvos ir jausmo ryšį vaikas randa labai anksti, bet jis nėra įgimtas.** Zentner (2001) parodė, kad jau 3–4 metų vaikai randa pastovius ryšius tarp spalvų ir veido išraiškų, nors šie du reiškiniai neturi jokių bendrų fizinių savybių ir nepatenka į įprastas kategorijas. Autorius svarsto dvi paaiškinimo kryptis: ryšio išmokimą iš konvencijos ir bendrą suvokiamą dimensiją. Praktinė išvada platformai ta pati: ryšys egzistuoja, bet jį reikia parodyti, o ne paskelbti taisykle.
│ +
│ +**Kodėl spalva taip lengvai „prilimpa“ prie daikto.** Palmer ir Schloss (2010) pasiūlė ekologinės valentingumo teorijos paaiškinimą: spalvų vertinimas kyla iš vidutinių emocinių reakcijų į daiktus, su kuriais ta spalva siejama. Žmonės mėgsta spalvas, stipriai susietas su mėgstamais daiktais (mėlyna — su giedru dangumi ir švariu vandeniu), ir nemėgsta spalvų, susietų su nemėgstamais daiktais (ruda — su išmatomis ir sugedusiu maistu). Modeliui tai svarbu dvejopa: pirma, spalvos reikšmė iš tikrųjų ateina iš daikto, todėl vaiko nuostata turi pagrindą; antra, jei modelyje yra atpažįstamas daiktas, jis traukia dėmesį į save ir užgožia klausimą apie spalvą kaip priemonę.
│ +
│ +## Ką tai reiškia SUPRASK platformai
│ +
│ +1. **Modelis turi fiksuoti formą mechaniškai, o ne žodžiais.** Jei teiginys yra „formos nepasikeitė“, tai turi būti įmanoma patikrinti: kompozicija įterpiama vieną kartą, keičiamas tik `fill` atributas, o kiekvienos formos `getBBox()` prieš ir po lieka tas pats. Persibraižiusi geometrija teiginį padaro neteisingu, net jei tekstas sako priešingai.
│ +2. **Grįžimas į ankstesnę būseną yra kontrolinis bandymas.** Vaikas, grąžinęs pirmą spalvą ir pamatęs lygiai tą patį paveikslą, gauna įrodymą, kurio paveikslėlis negali duoti. Be grįžimo modelis tinka tik žiūrėjimui.
│ +3. **Vienas kintamasis yra spalva, o ne „spalvų rinkinys“.** Jei keičiasi keli elementai iš karto, vaikas negali pasakyti, kuris iš jų ką padarė — ta pati priežastis, dėl kurios M-05 fiksuoja dovaną ir keičia tik norą.
│ +4. **Abstrakti kompozicija, o ne peizažas.** Peizažas įneša antrą skaitymą: spalva jame žymi metų laiką ar paros laiką (tai jau `08-metu-laikai` sąvoka), o daiktas kviečia jį pavadinti. Dėmė neturi pavadinimo, todėl klausimas lieka apie spalvą.
│ +5. **Nėra teisingos nuotaikos.** Spalvos ir jausmo ryšys iš dalies kultūrinis, todėl užduotys klausia, *kas pasikeitė*, o ne *ką jausti*. Refleksija — vienintelė vieta, kur vaikas pasako savo įspūdį, ir jis neverinamas.
│ +6. **Daltonikui modelis lieka suprantamas, bet ne toks pat.** Spalvos pavadinimas rašomas po kiekvienu dažu ir pasakomas `readout`, todėl būsena perskaitoma ir be spalvų skyrimo; tačiau patiriamas skirtumas mažesnis, ir tai pasakoma mokytojo bloke, o ne slepiama.
│ +
│ +## Ko šis įrašas nedaro
│ +
│ +Jis neįrodo, kad būtent šis modelis padidina dailės supratimą — Burkitt ir kt. tyrė spalvos parinkimą pagal duotą charakteristiką, o ne mokymą atskirti formą nuo spalvos. Jis taip pat nesprendžia, ar 6–7 metų vaikui „nuotaika“ yra tinkamas žodis: lietuvių kalboje jis vartojamas ir apie orą, ir apie žmogų, todėl modulyje jis vartojamas tik suaugusiojo tekstuose, o vaikui rodomi konkretūs sakiniai („atrodo linksmiau“, „atrodo niūriau“) ir jie neverinami. Kompozicijos estetikos klausimai (ritmas, pusiausvyra, potėpis) lieka kitiems moduliams.
│ +
│ +## Susieti
│ +
│ +- [[vizualus-mokymasis]] — vienas vizualinis akcentas, tekstas ir vaizdas nedubliuoja
│ +- [[simuliacijos-ir-modeliai]] — modelio ribos pasakomos, o ne slepiamos
│ +- [[kognityvine-apkrova]] — vienas kintamasis, keturi dažai, jokių slankiklių
│ +- [[sujungti-dydziai]] — kodėl grįžimas ir spėjimas yra būtini, kai modelis ką nors atlieka už vaiką
│ +- [[../grades/01/metodai|1 klasės metodai]] — M-06 „Dailė: ta pati forma, kita spalva“
│ +
│ +## Šaltiniai
│ +
│ +1. Burkitt, E., Barrett, M., & Davis, A. (2003). Children's colour choices for completing drawings of affectively characterised topics. *Journal of Child Psychology and Psychiatry, 44*(3), 445–455. https://doi.org/10.1111/1469-7610.00134
│ +2. Zentner, M. R. (2001). Preferences for colours and colour–emotion combinations in early childhood. *Developmental Science, 4*(4), 389–398. https://doi.org/10.1111/1467-7687.00180
│ +3. Palmer, S. E., & Schloss, K. B. (2010). An ecological valence theory of human color preference. *Proceedings of the National Academy of Sciences, 107*(19), 8877–8882. https://doi.org/10.1073/pnas.0906172107
│ +4. NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, „Dailė“: 1–2 klasių amžiaus ypatumai ir 2 pavyzdys 1 klasei „Kaip susikūrė pasaulis“ (mokymosi turinys: „Tyrinėja ir apibūdina skirtingas spalvų ir dėmių sukuriamas nuotaikas, ritmą“). Vietinis failas: `sources/pradinio-bp-rekomendacijos-2024.txt:2622–2625, 2714–2719`.
│ research/wiki/foundations/README.md
│ @@ -13,6 +13,7 @@
│  | [[zenklas-kaip-busena]] | lygybės ženklas kaip būsena, operaciniai šablonai, modelio išdėstymas | modelis rodo abi lygybės kryptis ir bent vieną atvejį be vieno skaičiaus pusėje |
│  | [[dydis-ir-skaicius]] | dydis ir kiekis prieš užrašytą vertę, moneta kaip pavyzdys | jei daiktas neša skaičių, modelis parodo jo poveikį atskirai; grafika neprieštarauja taisyklei |
│  | [[kryptis-ir-ziurovo-pozicija]] | kairė/dešinė kaip kūno, o ne kambario savybė; įsisavinimo tvarka | seka: savo kūnas → veikėjas žiūri ta pačia kryptimi → žiūri į vaiką; žymė sukasi su kūnu |
│ +| [[forma-ir-spalva]] | forma kaip tapatybė, spalva kaip įspūdis; spalvos prisirišimas prie daikto | forma fiksuojama mechaniškai, keičiamas tik užpildas; grįžimas į ankstesnę spalvą kaip kontrolė |
│  | [[jausmas-ir-noras]] | jausmo priežastis yra noras, o noro nesimato; emocijų komponentai | įvykis fiksuotas, noras keičiamas; antras veikėjas kaip kontrolė; nieko neklausiama apie vaiko jausmus |
│  | [[ivertinimas-ir-growth-mindset]] | grįžtamasis ryšys, augimo mąstysena ir jos ribos | `hint` + `why` privalomi, jokių balų |
│
│ research/wiki/grades/01/metodai.md
│ @@ -335,6 +335,83 @@
│
│  **Šaltiniai.** Pons, F., Harris, P. L., & de Rosnay, M. (2004). Emotion comprehension between 3 and 11 years: Developmental periods and hierarchical organization. *European Journal of Developmental Psychology, 1*(2), 127–152. https://doi.org/10.1080/17405620344000022 · Rieffe, C., Terwogt, M. M., & Cowan, R. (2005). Children's understanding of mental states as causes of emotions. *Infant and Child Development, 14*(3), 259–272. https://doi.org/10.1002/icd.391 · Widen, S. C., & Russell, J. A. (2008). Children acquire emotion categories gradually. *Cognitive Development, 23*(2), 291–312. https://doi.org/10.1016/j.cogdev.2008.01.002 · Saarni, C. (1979). Children's understanding of display rules for expressive behavior. *Developmental Psychology, 15*(4), 424–429. https://doi.org/10.1037/0012-1649.15.4.424 · Harris, P. L., Donnelly, K., Guz, G. R., & Pitt-Watson, R. (1986). Children's understanding of the distinction between real and apparent emotion. *Child Development, 57*(4), 895–909. https://doi.org/10.2307/1130366
│
│ +### M-06 — Dailė: ta pati forma, kita spalva
│ +
│ +**Data:** 2026-11-09 · **Tema:** `agents/proposals/2026-11-08-ideator-dailes-spalva-ir-nuotaika.json` (#6539) · **Tikslas:** `content/lt/grade-01/daile/01-spalva-ir-nuotaika.json` · **Šaltinis:** `research/wiki/foundations/forma-ir-spalva.md`
│ +
│ +**Viena didelė idėja.** Forma pasako, *kas* nupiešta. Spalva pasako, *kaip* į tai žiūrima. Toje pačioje formoje kita spalva keičia įspūdį, o piešinys lieka tas pats.
│ +
│ +**Kodėl modelis, o ne paveikslėlis.** Du paveikslai greta parodo skirtumą, bet neįrodo, kad formos liko tos pačios: vaikas neturi būdo patikrinti, ar antrame paveiksle kas nors nepajudėjo, ir paprastai sprendžia, kad „nupiešta kitaip“. Modelis laiko geometriją nepajudinamą — keičiamas tik didelės dėmės užpildas — o grįžimas į ankstesnę spalvą parodo lygiai tą patį paveikslą. Tai kontrolinis bandymas, kurio paveikslėlis negali duoti. Be to, modelis reikalauja spėjimo prieš veiksmą, ko paveikslėlis taip pat nereikalauja.
│ +
│ +**Kodėl abstrakti dėmė, o ne peizažas.** Peizaže spalva turi antrą reikšmę: ji žymi metų laiką ar paros laiką (tai jau `08-metu-laikai` sąvoka), o saulė ar medis kviečia sakyti „saulė negali būti mėlyna“ — tada pokalbis pasisuka apie daiktą, o ne apie spalvą kaip priemonę. Dėmė neturi pavadinimo, todėl vienintelis klausimas lieka toks, koks turi būti. Tai ir programos turinys: 1 klasei skirtas ciklas „Kaip susikūrė pasaulis“ prašo „tyrinėti ir apibūdinti skirtingas spalvų ir dėmių sukuriamas nuotaikas, ritmą“ (`sources/pradinio-bp-rekomendacijos-2024.txt:2717–2718`), o ne atpažinti daiktus.
│ +
│ +**Klaidingos nuostatos ir kaip jos paneigiamos.**
│ +
│ +1. **„Spalva yra daikto pavadinimas“** (geltona = saulė, žalia = lapas). Ši nuostata ne išgalvota: suaugusiųjų spalvų vertinimai paaiškinami tuo, su kokiais daiktais spalva siejama (Palmer ir Schloss, 2010), o 3–4 metų vaikai jau randa pastovius spalvos ir jausmo ryšius (Zentner, 2001). Paneigiama modeliu: ta pati dėmė nudažoma kita spalva ir lieka ta pačia dėme — jos vieta, dydis ir kraštas nepakinta. Spalva čia pasirenkama, o ne atpažįstama.
│ +2. **„Jei paveikslas atrodo kitaip, jis ir nupieštas kitaip.“** Vaikas sujungia suvokimo pokytį su piešinio pokyčiu, nes kasdienėje patirtyje abu dažniausiai kinta kartu. Paneigiama mechaniškai: forma neperpiešiama, keičiamas tik `fill`, o grįžimas į pirmą spalvą grąžina lygiai tą patį vaizdą. Skirtumo šaltinis tampa matomas todėl, kad jį galima panaikinti ir vėl sukelti.
│ +3. **„Spalva tik puošia, prasmę neša forma“** (įprasta darželio taisyklė „spalvink gražiai“). Paneigiama tuo pačiu veiksmu iš kitos pusės: pasikeitus vien užpildams, pasikeičia tai, ką vaikas apie paveikslą pasako, nors nė viena linija nepajudėjo. Jei spalva būtų tik puošmena, pasakojimas nepasikeistų.
│ +4. **„Yra viena teisinga nuotaika.“** Modelis šios nuostatos nepaneigia, o jos neleidžia atsirasti: užduotys klausia, kas pasikeitė (forma ar spalva), o ne ką jausti; jausmo žodį vaikas pasako refleksijoje ir jis neverinamas.
│ +
│ +**Seka (konkretumas → modelis → simbolis → perkėlimas).**
│ +
│ +1. **Du lapai, viena dėmė.** Mokytojas duoda du vienodus lapus, kuriuose ta pati didelė dėmė nupiešta pieštuku. Vaikas vieną nudažo šiltai (geltona, raudona), kitą vėsiai (žalia, mėlyna) ir padeda greta. Tikslas: pajusti, kad piešinys nepakito, o įspūdis pasikeitė. Mokytojas neklausia, kuris gražesnis, ir nevertina.
│ +2. **Ekranas, viena dėmė.** Ta pati kompozicija: didelė dėmė, maža dėmė ir plona linija. Vaikas spaudžia vieną iš keturių dažų; keičiasi tik didelės dėmės užpildas. Tikslas: pamatyti pasekmę be perpiešimo — akimirksniu ir be animacijos įžangos.
│ +3. **Grįžimas.** Vaikas grąžina pirmą spalvą ir pamato, kad paveikslas atrodo lygiai taip pat kaip pradžioje. Tikslas: atlikti kontrolinį bandymą savo ranka. Be šio žingsnio modelis tinka tik žiūrėjimui, o su juo — įrodymui.
│ +4. **Simbolis.** Po kompozicija atsiranda dvi eilutės: „FORMA“ su tomis pačiomis trimis formomis, nubrėžtomis plonu kontūru be užpildo, ir „SPALVA“ su dabartinio dažo kvadratėliu. Vaikas pasako: „Forma ta pati, spalva kita.“ Tikslas: du dalykus įvardyti atskirai. Tai vienintelis žymėjimas, kurio reikia 1 klasei — jokių spalvų ratų, jokių terminų.
│ +5. **Perkėlimas.** Ta pati taisyklė be modelio: du vienodi kartoniniai apskritimai, nudažyti skirtingai (ar tai ta pati forma?); du to paties piešinio atvirukai skirtingomis spalvomis; nespalvota to paties piešinio kopija. Tikslas: atpažinti, kad formos tapatybė išlieka be spalvos.
│ +
│ +**Privalomas spėjimo žingsnis prieš pirmą dažą.** `api.readout`: „Kas pasikeis: formos ar nuotaika? Pasakyk, tada keisk.“ Kol vaikas nepaspaudė „Sakau“, dažų juosta neaktyvi. Be spėjimo modelis virsta dažymu: vaikas spaudo dažus tol, kol atrodo įdomiai, ir ryšio nesudaro — tas pats pavojus kaip M-01–M-05 (`foundations/sujungti-dydziai.md`). Atsakymo variantų ekrane nėra: kintamasis lieka vienas, o spėjimas tikrinamas žodžiu ir užduotyse be modelio.
│ +
│ +**Simuliacijos specifikacija.** Komponentas `deme-ir-spalvos`, failas `assets/js/sims/daile.js` (naujas). Registracija `assets/js/registry.js`: viena eilutė `import * as daile from "./sims/daile.js";` ir `Object.assign({}, …, daile.SIMS)` sąraše. `config`:
│ +
│ +```json
│ +{ "colors": [
│ +    { "id": "geltona", "name": "Geltona", "hex": "#f2c33c" },
│ +    { "id": "raudona", "name": "Raudona", "hex": "#d9534f" },
│ +    { "id": "zalia",   "name": "Žalia",   "hex": "#57a05a" },
│ +    { "id": "melyna",  "name": "Mėlyna",  "hex": "#4a7fbf" } ],
│ +  "start": "geltona",
│ +  "sentences": { "...": "devynios frazės iš lentelės žemiau" } }
│ +```
│ +
│ +| Būsena | Ką rodo | `readout` | `api.note` |
│ +|---|---|---|---|
│ +| pradžia, kol nepasakyta | didelė dėmė geltona, maža dėmė ir linija tamsios, dažų juosta neaktyvi | „Kas pasikeis: formos ar nuotaika? Pasakyk, tada keisk.“ | „Pirma pasakyk, tada rinkis spalvą.“ |
│ +| geltona | didelė dėmė geltona | „Geltona dėmė. Formos tos pačios.“ | „Pasikeitė tik užpildas.“ |
│ +| raudona | didelė dėmė raudona | „Raudona dėmė. Formos tos pačios.“ | „Ta pati vieta, ta pati forma.“ |
│ +| žalia | didelė dėmė žalia | „Žalia dėmė. Formos tos pačios.“ | „Dėmė liko savo vietoje.“ |
│ +| mėlyna | didelė dėmė mėlyna | „Mėlyna dėmė. Formos tos pačios.“ | „Pasikeitė spalva, ne piešinys.“ |
│ +| grįžimas į jau matytą spalvą | ta pati būsena kaip anksčiau, taškas į tašką | „Vėl geltona. Paveikslas toks pat.“ | „Forma nepakito nė vienu tašku.“ |
│ +| palyginimas (pamatytos ≥ 2 spalvos) | tos pačios formos | „Dvi spalvos. Viena forma.“ | „Pasikeitė įspūdis, o ne piešinys.“ |
│ +
│ +- **Vienas kintamasis:** `didelesDemesSpalva` ∈ keturi dažai. Mažos dėmės ir linijos spalva fiksuota (`#3a342b`), jų padėtis ir dydis — konfigūracijoje. Daugiau vaikas nieko nekeičia: nėra slankiklio, dydžio, „naujo piešinio“ mygtuko. Trys formos ir keturi dažai yra mažiausias rinkinys, kuriame matosi ir šiltos, ir vėsios spalvos pora.
│ +- **Geometrija užrakinta mechaniškai.** Kompozicija į sceną įterpiama vieną kartą `mount()` metu, o keičiant spalvą keičiamas tik `fill` atributas (pvz., `stage.querySelector("#deme-didele").setAttribute("fill", c.hex)`). Jokio `innerHTML` perpiešimo, jokio `transform`. **Patikra, kurią turi atlikti inžinierius:** kiekvienos formos `getBBox()` prieš ir po visų keturių spalvų yra vienodas (x, y, width, height lygūs iki paskutinio skaitmens), o `data-color` keičiasi. Tai ne estetikos reikalavimas — tai modelio teiginio sąlyga: jei geometrija bent kartą persibraižo, sakinys „formos nepasikeitė“ tampa neteisingas.
│ +- **Nauja `art.js` dalis.** `spot(x, y, w, h, color, kind)` — netaisyklinga dėmė: `path` iš aštuonių taškų su `Q` kreivėmis, todėl kraštas banguotas (elipsė netinka: lygus ovalas atrodo kaip kamuolys, o ne dėmė — LL-13). `kind`: `apvali` | `kampuota`; `fill` iš argumento. Dėmė piešiama vieną kartą, o spalva keičiama per `fill`, kaip aprašyta aukščiau.
│ +- **Išdėstymas 360 px:** scena 328 × 250 px (`viewBox="0 0 328 250"`, `width:100%`, `max-width:328px`). Didelė dėmė 168 × 132 px, maža dėmė 44 px, linija 148 × 8 px. Dažų juosta: 4 × 64 px + 3 × 12 px tarpų = 292 px iš 328 px, aukštis 56 px. Jokio horizontalaus slinkimo.
│ +- **Įėjimai:** keturi dažų mygtukai 64 × 56 px, kiekvienas su matomu žodžiu po kvadratėliu ir `aria-label` („Geltona spalva“), `aria-pressed`; „Sakau“ 328 × 56 px; „Iš naujo“ ≥ 48 px. Klaviatūra: `Tab` tarp dažų, `Enter`/`Space` pasirenka, `←`/`→` perjungia fokusą, `R` atstato pradžią.
│ +- **Grįžtamasis ryšys** — iškart po paspaudimo (≤ 1 kadras), be perėjimo ir be garso įžangos. `readout` įvardija spalvą ir tai, kad formos liko; `api.note` pasako vieną sakinį apie veiksmą, niekada apie vaiką. `api.progress({ correct: true })` — vieną kartą, kai pamatytos bent dvi skirtingos spalvos **ir** grįžta į bent vieną jau matytą (t. y. po palyginimo), o ne po pirmo dažo (LL-29). „Iš naujo“ pažangos netrina (LL-16).
│ +- **Garsas** — devynios nustatytos frazės, lygiai kaip lentelėje; jos laikomos `config.sentences`, o ne simuliacijos kode (LL-42), todėl `scripts/generate_audio.py` jas mato. `api.note` garsiai neskaitomas (mažas manifestas). Generuojant reikia abiejų variantų (`n`, `s`).
│ +- **Spalva nėra vienintelis informacijos nešėjas:** po kiekvienu dažu parašytas jo pavadinimas, `readout` jį pasako, būsena dar žymima `aria-pressed`, o formos atpažįstamos iš kontūro. Daltonikui modelis lieka suprantamas kaip „ta pati forma, kiti dažai“, tačiau patiriamas skirtumas mažesnis — tai pasakoma mokytojo bloke, o ne slepiama.
│ +- **Scenos `aria-label`** (atnaujinamas po kiekvieno pasirinkimo): „Didelė dėmė geltona, maža dėmė ir linija tamsios. Dėmės vieta nepakito.“ Nekartoja `readout` sakinio žodis į žodį.
│ +- **Jokių laikmačių, ėjimų limito, „game over“.** Grįžimas prie ankstesnės spalvos niekada nelaikomas klaida; dažą galima keisti tiek kartų, kiek nori.
│ +
│ +**Užduotys.**
│ +
│ +| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
│ +|---|---|---|---|---|---|
│ +| 1 | atpažinimas | „Tas pats piešinys nudažytas geltonai ir mėlynai. Kas pasikeitė?“ — Tik formos / Tik spalva / Ir formos, ir spalva | Tik spalva (1) | trečias — „ir formos“: pasikeitus įspūdžiui vaikui atrodo, kad pasikeitė ir piešinys | „Palygink, ar dėmė liko toje pačioje vietoje.“ |
│ +| 2 | taikymas | „Dailininkas nori to paties piešinio kitokios nuotaikos. Ką keisti?“ — Formas / Piešti iš naujo / Spalvas | Spalvas (2) | antras — „piešti iš naujo“: nuotaikos pokytis painiojamas su nauju darbu | „Nuotaiką keičia dažai, o ne piešinio formos.“ |
│ +| 3 | perkėlimas | „Du viršeliai turi tą patį piešinį. Spalvos skiriasi. Ar piešinys tas pats?“ — Taip, piešinys tas pats / Ne, piešinys naujas / Ne, piešinys nebeatpažįstamas | Taip (0) | antras — nauja spalva priimama kaip naujas piešinys | „Žiūrėk į linijas ir dėmių formą, ne į spalvą.“ |
│ +| 4 | praplėtimas (`optional: true`) | „Tas pats piešinys nuskanuotas nespalvotai. Ar jį dar atpažinsi?“ — Ne, be spalvų nieko nematysi / Taip, formos liko tos pačios / Ne, tai jau kitas piešinys | Taip (1) | pirmas — spalva laikoma vienintele atpažinimo priemone | „Kas piešinyje lieka, kai spalvos dingsta?“ |
│ +
│ +**Refleksija.** „Kuris paveikslas tau atrodė niūriau? Ką pakeitei, kad jis toks pasidarytų?“ Klausiama žodžiu, nevertinama; teisingo atsakymo nėra, o laukiamas atsakymas — kad pasikeitė spalva, o ne piešinys.
│ +
│ +**Modelio ribos (pasakomos vaikui ir mokytojui).** Modelis keičia vieną savybę — didelės dėmės spalvą — ir nevaizduoja nei potėpio, nei dėmės dydžio, nei ritmo, nors programa šalia nuotaikos mini ir ritmą; ritmas lieka mokytojo veiklai. Modelis neparodo, ką vaikas jaučia: žodžius jis pasako pats. Spalvos ir jausmo ryšys yra iš dalies kultūrinis ir išmoktas (Palmer ir Schloss, 2010; Zentner, 2001), todėl modulis nemoko „mėlyna = liūdna“ — jis moko, kad spalva keičia įspūdį ir kad forma nuo to nepakinta. Nespalvotame spaudinyje piešinys netenka spalvos, bet ne formos: todėl praplėtimo užduotis klausia būtent apie tai. Dėmė nėra joks daiktas: jei vaikas ją pavadina „saulute“, mokytojas atsako „tai dėmė“, o ne „ne, saulė geltona“ — taip spalva nepatampa daikto etikete.
│ +
│ +**Ką tai reiškia modulio autoriui.** Nauja kryptis `daile` (`content/lt/grade-01/index.json`: `id` `"daile"`, `title` „Dailė“, `emoji` „🎨“, `intro` „Forma, spalva ir nuotaika: žiūrėk, keisk, palygink.“) — būtent ASCII `daile`, nes `agents/scope.py` `STRAND_SUBJECT` turi raktus `"dailė"` ir `"daile"`. `title` — „Dailė: ta pati forma, kita spalva“ (31 simbolis); `subtitle` — „Toje pačioje formoje kitos spalvos keičia nuotaiką“ (51); `minutes` — 9; trys `outcomes`: „Pasakau, kas piešinyje yra forma, o kas spalva.“, „Pakeičiu spalvą ir nusakau, kaip pasikeitė įspūdis.“, „Paaiškinu, kodėl forma liko ta pati.“; `concept.title` — „Spalva keičia nuotaiką“ (22); `concept.big_idea` — „Ta pati forma gali atrodyti linksmai arba niūriai. Įspūdį keičia spalva, o ne naujas piešinys.“ (105); `concept.steps` — keturi žingsniai iš sekos 2–5; `concept.example` — „Tas pats atvirukas išspausdintas du kartus: viename dėmė geltona, kitame mėlyna. Piešinys tas pats, įspūdis kitas.“; `teacher.offline` — du lapai su ta pačia pieštuku nupiešta dėme, vienas dažomas šiltai, kitas vėsiai, paskui du vienodi kartoniniai apskritimai; `teacher.misconceptions` — trys nuostatos iš šio skyriaus (1–3), o ketvirtoji („yra teisinga nuotaika“) įrašoma kaip modelio riba, ne kaip klaida; `sim` — `{ "component": "deme-ir-spalvos", "config": { … } }`. Numeris `01-` laisvas, nes kryptis nauja. Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/index.json` ir `path.json` (kūrėjo ar dizainerio darbas, ne metodo dalis); siūloma vieta kelyje — tarp `09-augalo-gyvenimas` ir `06-figuros`: vaikas jau matė formas gamtoje, tada atskiria formą nuo spalvos, o geometrija jau įvardija pačias formas („forma lieka ta pati, kad ir kaip ją pasuktum“).
│ +
│ … omitted 5 diff line(s) across 1 additional file(s)/section(s)
│ research/wiki/grades/01/metodai.md
│ @@ -3,7 +3,7 @@
│  tipas: metodai
│  klase: 1
│  amzius: "6–7"
│ -atnaujinta: 2026-11-08
│ +atnaujinta: 2026-11-09
│  ---
│
│  # 1 klasės metodai
│ research/wiki/grades/01/metodai.md
│ @@ -357,7 +357,7 @@
│  1. **Du lapai, viena dėmė.** Mokytojas duoda du vienodus lapus, kuriuose ta pati didelė dėmė nupiešta pieštuku. Vaikas vieną nudažo šiltai (geltona, raudona), kitą vėsiai (žalia, mėlyna) ir padeda greta. Tikslas: pajusti, kad piešinys nepakito, o įspūdis pasikeitė. Mokytojas neklausia, kuris gražesnis, ir nevertina.
│  2. **Ekranas, viena dėmė.** Ta pati kompozicija: didelė dėmė, maža dėmė ir plona linija. Vaikas spaudžia vieną iš keturių dažų; keičiasi tik didelės dėmės užpildas. Tikslas: pamatyti pasekmę be perpiešimo — akimirksniu ir be animacijos įžangos.
│  3. **Grįžimas.** Vaikas grąžina pirmą spalvą ir pamato, kad paveikslas atrodo lygiai taip pat kaip pradžioje. Tikslas: atlikti kontrolinį bandymą savo ranka. Be šio žingsnio modelis tinka tik žiūrėjimui, o su juo — įrodymui.
│ -4. **Simbolis.** Po kompozicija atsiranda dvi eilutės: „FORMA“ su tomis pačiomis trimis formomis, nubrėžtomis plonu kontūru be užpildo, ir „SPALVA“ su dabartinio dažo kvadratėliu. Vaikas pasako: „Forma ta pati, spalva kita.“ Tikslas: du dalykus įvardyti atskirai. Tai vienintelis žymėjimas, kurio reikia 1 klasei — jokių spalvų ratų, jokių terminų.
│ +4. **Simbolis.** Po kompozicija atsiranda dvi eilutės: „FORMA“ su tomis pačiomis trimis formomis, nubrėžtomis plonomis linijomis be užpildo, ir „SPALVA“ su dabartinio dažo kvadratėliu. Vaikas pasako: „Forma ta pati, spalva kita.“ Tikslas: du dalykus įvardyti atskirai. Tai vienintelis žymėjimas, kurio reikia 1 klasei — jokių spalvų ratų, jokių terminų.
│  5. **Perkėlimas.** Ta pati taisyklė be modelio: du vienodi kartoniniai apskritimai, nudažyti skirtingai (ar tai ta pati forma?); du to paties piešinio atvirukai skirtingomis spalvomis; nespalvota to paties piešinio kopija. Tikslas: atpažinti, kad formos tapatybė išlieka be spalvos.
│
│  **Privalomas spėjimo žingsnis prieš pirmą dažą.** `api.readout`: „Kas pasikeis: formos ar nuotaika? Pasakyk, tada keisk.“ Kol vaikas nepaspaudė „Sakau“, dažų juosta neaktyvi. Be spėjimo modelis virsta dažymu: vaikas spaudo dažus tol, kol atrodo įdomiai, ir ryšio nesudaro — tas pats pavojus kaip M-01–M-05 (`foundations/sujungti-dydziai.md`). Atsakymo variantų ekrane nėra: kintamasis lieka vienas, o spėjimas tikrinamas žodžiu ir užduotyse be modelio.
│ research/wiki/grades/01/metodai.md
│ @@ -349,7 +349,7 @@
│
│  1. **„Spalva yra daikto pavadinimas“** (geltona = saulė, žalia = lapas). Ši nuostata ne išgalvota: suaugusiųjų spalvų vertinimai paaiškinami tuo, su kokiais daiktais spalva siejama (Palmer ir Schloss, 2010), o 3–4 metų vaikai jau randa pastovius spalvos ir jausmo ryšius (Zentner, 2001). Paneigiama modeliu: ta pati dėmė nudažoma kita spalva ir lieka ta pačia dėme — jos vieta, dydis ir kraštas nepakinta. Spalva čia pasirenkama, o ne atpažįstama.
│  2. **„Jei paveikslas atrodo kitaip, jis ir nupieštas kitaip.“** Vaikas sujungia suvokimo pokytį su piešinio pokyčiu, nes kasdienėje patirtyje abu dažniausiai kinta kartu. Paneigiama mechaniškai: forma neperpiešiama, keičiamas tik `fill`, o grįžimas į pirmą spalvą grąžina lygiai tą patį vaizdą. Skirtumo šaltinis tampa matomas todėl, kad jį galima panaikinti ir vėl sukelti.
│ -3. **„Spalva tik puošia, prasmę neša forma“** (įprasta darželio taisyklė „spalvink gražiai“). Paneigiama tuo pačiu veiksmu iš kitos pusės: pasikeitus vien užpildams, pasikeičia tai, ką vaikas apie paveikslą pasako, nors nė viena linija nepajudėjo. Jei spalva būtų tik puošmena, pasakojimas nepasikeistų.
│ +3. **„Spalva tik puošia, prasmę neša forma“** (įprasta darželio taisyklė „spalvink gražiai“). paneigiama tuo pačiu veiksmu iš kitos pusės: pasikeitus tik užpildams, pasikeičia tai, ką vaikas apie paveikslą pasako, nors nė viena linija nepajudėjo. Jei spalva būtų tik puošmena, pasakojimas nepasikeistų.
│  4. **„Yra viena teisinga nuotaika.“** Modelis šios nuostatos nepaneigia, o jos neleidžia atsirasti: užduotys klausia, kas pasikeitė (forma ar spalva), o ne ką jausti; jausmo žodį vaikas pasako refleksijoje ir jis neverinamas.
│
│  **Seka (konkretumas → modelis → simbolis → perkėlimas).**
│ research/wiki/grades/01/metodai.md
│ @@ -349,7 +349,7 @@
│
│  1. **„Spalva yra daikto pavadinimas“** (geltona = saulė, žalia = lapas). Ši nuostata ne išgalvota: suaugusiųjų spalvų vertinimai paaiškinami tuo, su kokiais daiktais spalva siejama (Palmer ir Schloss, 2010), o 3–4 metų vaikai jau randa pastovius spalvos ir jausmo ryšius (Zentner, 2001). Paneigiama modeliu: ta pati dėmė nudažoma kita spalva ir lieka ta pačia dėme — jos vieta, dydis ir kraštas nepakinta. Spalva čia pasirenkama, o ne atpažįstama.
│  2. **„Jei paveikslas atrodo kitaip, jis ir nupieštas kitaip.“** Vaikas sujungia suvokimo pokytį su piešinio pokyčiu, nes kasdienėje patirtyje abu dažniausiai kinta kartu. Paneigiama mechaniškai: forma neperpiešiama, keičiamas tik `fill`, o grįžimas į pirmą spalvą grąžina lygiai tą patį vaizdą. Skirtumo šaltinis tampa matomas todėl, kad jį galima panaikinti ir vėl sukelti.
│ -3. **„Spalva tik puošia, prasmę neša forma“** (įprasta darželio taisyklė „spalvink gražiai“). paneigiama tuo pačiu veiksmu iš kitos pusės: pasikeitus tik užpildams, pasikeičia tai, ką vaikas apie paveikslą pasako, nors nė viena linija nepajudėjo. Jei spalva būtų tik puošmena, pasakojimas nepasikeistų.
│ +3. **„Spalva tik puošia, prasmę neša forma“** (įprasta darželio taisyklė „spalvink gražiai“). Paneigiama tuo pačiu veiksmu iš kitos pusės: pasikeitus tik užpildams, pasikeičia tai, ką vaikas apie paveikslą pasako, nors nė viena linija nepajudėjo. Jei spalva būtų tik puošmena, pasakojimas nepasikeistų.
│  4. **„Yra viena teisinga nuotaika.“** Modelis šios nuostatos nepaneigia, o jos neleidžia atsirasti: užduotys klausia, kas pasikeitė (forma ar spalva), o ne ką jausti; jausmo žodį vaikas pasako refleksijoje ir jis neverinamas.
│
│  **Seka (konkretumas → modelis → simbolis → perkėlimas).**
│ research/wiki/guidelines/pilotai.md
│ @@ -162,3 +162,12 @@
│  - **Kaip matuojame:** (1) ar vaikas po noro pakeitimo savais žodžiais pasako, kad pasikeitė noras, o dovana liko ta pati; (2) ar perkėlimo užduotyje (filmas apie šunis) nurodo, kad vienai bus smagu, kitai baisu, o ne „visiems smagu“; (3) ar refleksijoje pasako, kad reikia paklausti, o ne spėti iš veido. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
│  - **Rezultatas:** dar nėra. Metodas įrašytas, modulis dar nesukurtas; techninė patikra bus įrašyta jį įgyvendinus.
│  - **Sprendimas:** laukiama duomenų. Jei vaikai vis tiek atsako pagal dovaną, stiprinamas spėjimo žingsnis ir antrojo veikėjo nekintamumas (abu veidai rodomi vienu metu ilgiau), o ne pridedama teksto; jei „noras“ 6–7 m. vaikui pasirodo per abstraktus, burbulas keičiamas konkrečiu daiktu veikėjo rankoje, o sąvoka lieka neįvardyta.
│ +
│ +### P-018 — Dailė: geometrija užrakinta, keičiamas tik užpildas
│ +
│ +- **Data:** 2026-11-09
│ +- **Hipotezė:** jei modelis keičia vienintelę savybę — didelės dėmės spalvą — o geometriją laiko mechaniškai nepajudinamą (keičiamas tik `fill`), tai 6–7 m. vaikas, grįžęs į pirmą spalvą ir pamatęs tą patį paveikslą, įgyja įrodymą, kurio dviejų paveikslų palyginimas neduoda: skirtumą padarė spalva, o ne piešinys. Jei prieš pirmą dažą dar prašoma spėjimo, vaikas ryšį sudaro pats, o ne perskaito jį iš ekrano (P2 — veiksmas prieš paaiškinimą; T2.2 — supratimas naujoje situacijoje; LL-29 — pažanga tik po palyginimo; Burkitt ir kt., 2003).
│ +- **Ką keičiame:** komponentas `deme-ir-spalvos` (modulis `01-spalva-ir-nuotaika`, nauja kryptis `daile`). Tai pirmas modelis, kuriame kintamasis yra **paviršiaus savybė** (užpildo spalva), o ne kiekis, padėtis ar laikas; ir pirmas, kuriame invariantas užtikrinamas kodu, o ne teksto pažadu — kompozicija įterpiama vieną kartą, keičiamas tik `fill`, todėl kiekvienos formos `getBBox()` prieš ir po yra vienodas. Tai pirmas dailės modulis platformoje (privalomas dalykas be nė vieno modulio). Modelis sąmoningai neturi peizažo: daiktas kviestų jį pavadinti („saulė negali būti mėlyna“), o metų laiko spalva dubliuotų `08-metu-laikai`.
│ +- **Kaip matuojame:** (1) ar vaikas po grįžimo į pirmą spalvą savais žodžiais pasako, kad piešinys tas pats, o įspūdis kitas; (2) ar perkėlimo užduotyje (du viršeliai su tuo pačiu piešiniu) atpažįsta tą patį piešinį, o ne „naują“; (3) ar praplėtimo užduotyje (nespalvota kopija) nurodo formą, o ne spalvą kaip atpažinimo pagrindą. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
│ +- **Rezultatas:** dar nėra. Metodas įrašytas, modulis dar nesukurtas; techninė patikra bus įrašyta jį įgyvendinus.
│ +- **Sprendimas:** laukiama duomenų. Jei vaikai vis tiek sako „nupiešta kitaip“, stiprinamas grįžimo žingsnis (prieš grįžtant rodoma ta pati spalva antrą kartą), o ne pridedama teksto; jei keturi dažai 360 px ekrane atrodo per smulkūs, mažinama iki dviejų (viena šilta, viena vėsi), o kiti paliekami mokytojo veiklai su tikrais dažais.
│ research/wiki/guidelines/pilotai.md
│ @@ -170,4 +170,4 @@
│  - **Ką keičiame:** komponentas `deme-ir-spalvos` (modulis `01-spalva-ir-nuotaika`, nauja kryptis `daile`). Tai pirmas modelis, kuriame kintamasis yra **paviršiaus savybė** (užpildo spalva), o ne kiekis, padėtis ar laikas; ir pirmas, kuriame invariantas užtikrinamas kodu, o ne teksto pažadu — kompozicija įterpiama vieną kartą, keičiamas tik `fill`, todėl kiekvienos formos `getBBox()` prieš ir po yra vienodas. Tai pirmas dailės modulis platformoje (privalomas dalykas be nė vieno modulio). Modelis sąmoningai neturi peizažo: daiktas kviestų jį pavadinti („saulė negali būti mėlyna“), o metų laiko spalva dubliuotų `08-metu-laikai`.
│  - **Kaip matuojame:** (1) ar vaikas po grįžimo į pirmą spalvą savais žodžiais pasako, kad piešinys tas pats, o įspūdis kitas; (2) ar perkėlimo užduotyje (du viršeliai su tuo pačiu piešiniu) atpažįsta tą patį piešinį, o ne „naują“; (3) ar praplėtimo užduotyje (nespalvota kopija) nurodo formą, o ne spalvą kaip atpažinimo pagrindą. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
│  - **Rezultatas:** dar nėra. Metodas įrašytas, modulis dar nesukurtas; techninė patikra bus įrašyta jį įgyvendinus.
│ -- **Sprendimas:** laukiama duomenų. Jei vaikai vis tiek sako „nupiešta kitaip“, stiprinamas grįžimo žingsnis (prieš grįžtant rodoma ta pati spalva antrą kartą), o ne pridedama teksto; jei keturi dažai 360 px ekrane atrodo per smulkūs, mažinama iki dviejų (viena šilta, viena vėsi), o kiti paliekami mokytojo veiklai su tikrais dažais.
│ +- **Sprendimas:** laukiama duomenų. Jei vaikai vis tiek sako „nupiešta kitaip“, stiprinamas grįžimo žingsnis (to paties kontūro paryškinimas prieš keičiant spalvą ir po to), o ne pridedama teksto; jei keturi dažai 360 px ekrane atrodo per smulkūs, mažinama iki dviejų (viena šilta, viena vėsi), o kiti paliekami mokytojo veiklai su tikrais dažais.
│ agents/proposals/2026-11-09-metodininkas-dailes-spalva.json
│ @@ -0,0 +1,23 @@
│ +{
│ +  "role": "metodininkas",
│ +  "run_id": 180,
│ +  "created": "2026-11-09T08:32:00+02:00",
│ +  "type": "metodas",
│ +  "title": "Dailė: forma neša tapatybę, spalva — įspūdį (vienas kintamasis: didelės dėmės užpildas)",
│ +  "body": "Metodas temai #6539 („Dailė: ta pati kompozicija, kita spalva“) ir pirmam dailės moduliui `01-spalva-ir-nuotaika` (nauja kryptis `daile`). Viena didelė idėja: forma pasako, kas nupiešta, spalva — kaip į tai žiūrima; toje pačioje formoje kita spalva keičia įspūdį, o piešinys lieka tas pats. Modelis sąmoningai abstraktus (didelė dėmė, maža dėmė, linija), nes peizažas įneštų antrą reikšmę — metų laiką (jau `08-metu-laikai`) ir daikto pavadinimą („saulė negali būti mėlyna“). Kintamasis vienas: didelės dėmės užpildas iš keturių dažų; mažos dėmės ir linijos spalva fiksuota, o kompozicija įterpiama vieną kartą ir keičiamas tik `fill`, todėl teiginys „formos nepasikeitė“ yra patikrinamas (`getBBox()` prieš ir po vienodas), o ne pažadas. Grįžimas į pirmą spalvą yra kontrolinis bandymas: vaikas pamato lygiai tą patį paveikslą, ko dviejų paveikslų palyginimas neduoda. Klaidingos nuostatos: „spalva yra daikto pavadinimas“, „jei atrodo kitaip, tai ir nupiešta kitaip“, „spalva tik puošia“; ketvirtoji („yra teisinga nuotaika“) neleidžiama atsirasti, nes užduotys klausia, kas pasikeitė, o jausmo žodį vaikas pasako tik refleksijoje ir jis neverinamas. Inžinieriui duota visa, ko reikia be papildomų klausimų: 7 būsenos su `readout` ir `api.note`, `api.progress` tik po palyginimo (LL-29), 360 px išdėstymas, 9 garso frazės `config.sentences` (LL-42), nauja `art.js` dalis `spot()`, 4 užduotys su tipine klaida ir `hint` (viena `optional`), taip pat modulio laukų reikšmės ir siūloma vieta `path.json`. Šaltiniai su DOI: Burkitt, Barrett & Davis (2003) — 330 vaikų 4–11 m., spalva parinkta pagal įspūdžio charakteristiką visose amžiaus grupėse; Zentner (2001) — 3–4 m. vaikai jau randa spalvos ir jausmo ryšius; Palmer & Schloss (2010) — spalvos vertė kyla iš daikto, su kuriuo ji siejama, todėl vaiko nuostata turi pagrindą. Programa: NŠA (2024) dailės 2 pavyzdys 1 klasei „Kaip susikūrė pasaulis“ — „Tyrinėja ir apibūdina skirtingas spalvų ir dėmių sukuriamas nuotaikas, ritmą“ (`sources/pradinio-bp-rekomendacijos-2024.txt:2717–2718`).",
│ +  "target": "content/lt/grade-01/daile/01-spalva-ir-nuotaika.json",
│ +  "priority": "high",
│ +  "status": "new",
│ +  "evidence": [
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:2717–2718 (1–2 kl. dailės turinys: „Tyrinėja ir apibūdina skirtingas spalvų ir dėmių sukuriamas nuotaikas, ritmą“) ir :2714 („2 pavyzdys. 2 pamokų ciklas 1 klasei. Tema: „Kaip susikūrė pasaulis.““)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:2622–2625 (1–2 kl. amžiaus ypatumai: linkę fantazuoti, svarbi mokytojo nuomonė)",
│ +    "research/wiki/curriculum/kti-dalykai-1-klase.md:13 (trys dailės pasiekimų sritys) ir :22 (oficialus 1 kl. pamokų ciklas)",
│ +    "research/wiki/grades/01/metodai.md M-06 — seka, simuliacijos būsenos, užduotys",
│ +    "research/wiki/foundations/forma-ir-spalva.md — forma kaip tapatybė, spalva kaip įspūdis; mechaniškai fiksuotas invariantas",
│ +    "Burkitt, E., Barrett, M., & Davis, A. (2003). Children's colour choices for completing drawings of affectively characterised topics. J Child Psychol Psychiatry 44(3), 445–455. https://doi.org/10.1111/1469-7610.00134",
│ +    "Zentner, M. R. (2001). Preferences for colours and colour–emotion combinations in early childhood. Developmental Science 4(4), 389–398. https://doi.org/10.1111/1467-7687.00180",
│ +    "Palmer, S. E., & Schloss, K. B. (2010). An ecological valence theory of human color preference. PNAS 107(19), 8877–8882. https://doi.org/10.1073/pnas.0906172107",
│ +    "agents/scope.py:109–110 (`STRAND_SUBJECT` turi „dailė“ ir „daile“ — strand id turi būti ASCII `daile`)",
│ +    "content/lt/grade-01/index.json (31 modulis, 7 kryptys, 0 dailės modulių — patikrinta prieš rašant)"
│ +  ]
│ +}
│ research/wiki/changelog.md
│ @@ -1,6 +1,14 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-09 (08:32) — Metodas M-06 „Dailė: ta pati forma, kita spalva“ (#6539)
│ +
│ +- **`research/wiki/grades/01/metodai.md`** — naujas skyrius **M-06** (prieš „Atviros prielaidos“; `atnaujinta: 2026-11-09`). Viena idėja: forma neša tapatybę, spalva — įspūdį. Modelis `deme-ir-spalvos` keičia vienintelį kintamąjį (didelės dėmės užpildą iš keturių dažų), o geometrija įterpiama vieną kartą ir neperpiešiama, todėl teiginys „formos nepasikeitė“ patikrinamas (`getBBox()` prieš ir po vienodas). Grįžimas į pirmą spalvą — kontrolinis bandymas. 7 būsenos su `readout`/`api.note`, `api.progress` tik po palyginimo (LL-29), 4 užduotys (viena `optional`), 9 garso frazės `config.sentences` (LL-42), nauja `art.js` dalis `spot()`.
│ +- **`research/wiki/foundations/forma-ir-spalva.md`** — naujas įrašas (3 DOI šaltiniai + programa): forma kaip tapatybė, spalva kaip įspūdis; kodėl spalva limpa prie daikto (Palmer & Schloss, 2010) ir kodėl vaikas ją vartoja simboliškai tik gavęs įspūdžio kryptį (Burkitt ir kt., 2003). Indekso eilutė `foundations/README.md`.
│ +- **`research/wiki/guidelines/pilotai.md`** — **P-018**: pirmas modelis, kuriame kintamasis yra paviršiaus savybė, o invariantas užtikrinamas kodu, ne teksto pažadu.
│ +- **`agents/proposals/2026-11-09-metodininkas-dailes-spalva.json`** — `type: metodas`, `target: content/lt/grade-01/daile/01-spalva-ir-nuotaika.json`, prioritetas `high`. Tai pirmas dailės modulis (privalomas dalykas be nė vieno modulio) ir nauja kryptis `daile`.
│ +- **Kodėl:** eilėje seniausias `high` `tema` pasiūlymas buvo #6539; dailė yra vienas iš keturių privalomų dalykų be modulio. Programa tą pačią veiklą įvardija tiesiogiai (`sources/pradinio-bp-rekomendacijos-2024.txt:2717–2718`), o interaktyvumo nauda pagrįsta: dviejų paveikslų palyginimas neįrodo, kad formos liko tos pačios.
│
│  ## 2026-11-09 (06:26) — Publikavimo patikra #177: repo 31 / paskelbta 31, visi moduliai baitais lygūs `HEAD`
│
│ profiles/deepseek41flash/cache/scratch/check_m06.py
│ @@ -0,0 +1,87 @@
│ +import re, json
│ +
│ +W = re.compile(r"[0-9A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]+")
│ +
│ +def words(s):
│ +    return W.findall(s)
│ +
│ +def sent_max(s):
│ +    parts = [p for p in re.split(r"[.!?…]+", s) if p.strip()]
│ +    return max((len(words(p)) for p in parts), default=0), parts
│ +
│ +title = "Dailė: ta pati forma, kita spalva"
│ +subtitle = "Toje pačioje formoje kitos spalvos keičia nuotaiką"
│ +ctitle = "Spalva keičia nuotaiką"
│ +big = "Ta pati forma gali atrodyti linksmai arba niūriai. Įspūdį keičia spalva, o ne naujas piešinys."
│ +steps = [
│ +    "Didelė dėmė turi formą ir spalvą. Forma lieka, spalvą keiti.",
│ +    "Pasirink dažą ir pažiūrėk, kas pasikeitė.",
│ +    "Grąžink pirmą spalvą. Ar piešinys toks pat?",
│ +    "Pasakyk: forma ta pati, spalva kita.",
│ +]
│ +example = "Tas pats atvirukas išspausdintas du kartus: viename dėmė geltona, kitame mėlyna. Piešinys tas pats, įspūdis kitas."
│ +outcomes = [
│ +    "Pasakau, kas piešinyje yra forma, o kas spalva.",
│ +    "Pakeičiu spalvą ir nusakau, kaip pasikeitė įspūdis.",
│ +    "Paaiškinu, kodėl forma liko ta pati.",
│ +]
│ +tasks = [
│ +    ("Tas pats piešinys nudažytas geltonai ir mėlynai. Kas pasikeitė?",
│ +     ["Tik formos", "Tik spalva", "Ir formos, ir spalva"],
│ +     "Palygink, ar dėmė liko toje pačioje vietoje.",
│ +     "Dėmės vieta ir forma nepakito, pasikeitė tik jos spalva."),
│ +    ("Dailininkas nori to paties piešinio kitokios nuotaikos. Ką keisti?",
│ +     ["Formas", "Piešti iš naujo", "Spalvas"],
│ +     "Nuotaiką keičia dažai, o ne piešinio formos.",
│ +     "Formos lieka tos pačios, o spalvos keičia įspūdį."),
│ +    ("Du viršeliai turi tą patį piešinį. Spalvos skiriasi. Ar piešinys tas pats?",
│ +     ["Taip, piešinys tas pats", "Ne, piešinys naujas", "Ne, piešinys nebeatpažįstamas"],
│ +     "Žiūrėk į linijas ir dėmių formą, ne į spalvą.",
│ +     "Formos ir linijos tos pačios, todėl piešinys tas pats."),
│ +    ("Tas pats piešinys nuskanuotas nespalvotai. Ar jį dar atpažinsi?",
│ +     ["Ne, be spalvų nieko nematysi", "Taip, formos liko tos pačios", "Ne, tai jau kitas piešinys"],
│ +     "Kas piešinyje lieka, kai spalvos dingsta?",
│ +     "Forma neša tai, kas nupiešta, o spalva — nuotaiką."),
│ +]
│ +readouts = [
│ +    "Kas pasikeis: formos ar nuotaika? Pasakyk, tada keisk.",
│ +    "Geltona dėmė. Formos tos pačios.",
│ +    "Raudona dėmė. Formos tos pačios.",
│ +    "Žalia dėmė. Formos tos pačios.",
│ +    "Mėlyna dėmė. Formos tos pačios.",
│ +    "Vėl geltona. Paveikslas toks pat.",
│ +    "Dvi spalvos. Viena forma.",
│ +]
│ +notes = [
│ +    "Pirma pasakyk, tada rinkis spalvą.",
│ +    "Pasikeitė tik užpildas.",
│ +    "Ta pati vieta, ta pati forma.",
│ +    "Dėmė liko savo vietoje.",
│ +    "Pasikeitė spalva, ne piešinys.",
│ +    "Forma nepakito nė vienu tašku.",
│ +    "Pasikeitė įspūdis, o ne piešinys.",
│ +]
│ +reflect = "Kuris paveikslas tau atrodė niūriau? Ką pakeitei, kad jis toks pasidarytų?"
│ +
│ +print("title", len(title), "<=42", len(title) <= 42)
│ +print("subtitle", len(subtitle), "<=80", len(subtitle) <= 80)
│ +print("concept.title", len(ctitle), "<=40", len(ctitle) <= 40)
│ +print("big_idea", len(big), "<=240", len(big) <= 240, "max words/sentence", sent_max(big)[0])
│ +for i, s in enumerate(steps, 1):
│ +    print("step%d" % i, len(s), "<=200", len(s) <= 200, "max words", sent_max(s)[0])
│ +print("example words/sentence", sent_max(example)[0])
│ +for o in outcomes:
│ +    print("outcome words", sent_max(o)[0], "|", o)
│ +bad = False
│ +for i, (q, opts, hint, why) in enumerate(tasks, 1):
│ +    mq = sent_max(q)[0]
│ +    mh = sent_max(hint)[0]
│ … omitted 9 diff line(s) across 1 additional file(s)/section(s)
│ research/wiki/grades/01/metodai.md
│ @@ -408,7 +408,7 @@
│
│  **Modelio ribos (pasakomos vaikui ir mokytojui).** Modelis keičia vieną savybę — didelės dėmės spalvą — ir nevaizduoja nei potėpio, nei dėmės dydžio, nei ritmo, nors programa šalia nuotaikos mini ir ritmą; ritmas lieka mokytojo veiklai. Modelis neparodo, ką vaikas jaučia: žodžius jis pasako pats. Spalvos ir jausmo ryšys yra iš dalies kultūrinis ir išmoktas (Palmer ir Schloss, 2010; Zentner, 2001), todėl modulis nemoko „mėlyna = liūdna“ — jis moko, kad spalva keičia įspūdį ir kad forma nuo to nepakinta. Nespalvotame spaudinyje piešinys netenka spalvos, bet ne formos: todėl praplėtimo užduotis klausia būtent apie tai. Dėmė nėra joks daiktas: jei vaikas ją pavadina „saulute“, mokytojas atsako „tai dėmė“, o ne „ne, saulė geltona“ — taip spalva nepatampa daikto etikete.
│
│ -**Ką tai reiškia modulio autoriui.** Nauja kryptis `daile` (`content/lt/grade-01/index.json`: `id` `"daile"`, `title` „Dailė“, `emoji` „🎨“, `intro` „Forma, spalva ir nuotaika: žiūrėk, keisk, palygink.“) — būtent ASCII `daile`, nes `agents/scope.py` `STRAND_SUBJECT` turi raktus `"dailė"` ir `"daile"`. `title` — „Dailė: ta pati forma, kita spalva“ (31 simbolis); `subtitle` — „Toje pačioje formoje kitos spalvos keičia nuotaiką“ (51); `minutes` — 9; trys `outcomes`: „Pasakau, kas piešinyje yra forma, o kas spalva.“, „Pakeičiu spalvą ir nusakau, kaip pasikeitė įspūdis.“, „Paaiškinu, kodėl forma liko ta pati.“; `concept.title` — „Spalva keičia nuotaiką“ (22); `concept.big_idea` — „Ta pati forma gali atrodyti linksmai arba niūriai. Įspūdį keičia spalva, o ne naujas piešinys.“ (105); `concept.steps` — keturi žingsniai iš sekos 2–5; `concept.example` — „Tas pats atvirukas išspausdintas du kartus: viename dėmė geltona, kitame mėlyna. Piešinys tas pats, įspūdis kitas.“; `teacher.offline` — du lapai su ta pačia pieštuku nupiešta dėme, vienas dažomas šiltai, kitas vėsiai, paskui du vienodi kartoniniai apskritimai; `teacher.misconceptions` — trys nuostatos iš šio skyriaus (1–3), o ketvirtoji („yra teisinga nuotaika“) įrašoma kaip modelio riba, ne kaip klaida; `sim` — `{ "component": "deme-ir-spalvos", "config": { … } }`. Numeris `01-` laisvas, nes kryptis nauja. Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/index.json` ir `path.json` (kūrėjo ar dizainerio darbas, ne metodo dalis); siūloma vieta kelyje — tarp `09-augalo-gyvenimas` ir `06-figuros`: vaikas jau matė formas gamtoje, tada atskiria formą nuo spalvos, o geometrija jau įvardija pačias formas („forma lieka ta pati, kad ir kaip ją pasuktum“).
│ +**Ką tai reiškia modulio autoriui.** Nauja kryptis `daile` (`content/lt/grade-01/index.json`: `id` `"daile"`, `title` „Dailė“, `emoji` „🎨“, `intro` „Forma, spalva ir nuotaika: žiūrėk, keisk, palygink.“) — būtent ASCII `daile`, nes `agents/scope.py` `STRAND_SUBJECT` turi raktus `"dailė"` ir `"daile"`. `title` — „Dailė: ta pati forma, kita spalva“ (33 simboliai); `subtitle` — „Toje pačioje formoje kitos spalvos keičia nuotaiką“ (50); `minutes` — 9; trys `outcomes`: „Pasakau, kas piešinyje yra forma, o kas spalva.“, „Pakeičiu spalvą ir nusakau, kaip pasikeitė įspūdis.“, „Paaiškinu, kodėl forma liko ta pati.“; `concept.title` — „Spalva keičia nuotaiką“ (22); `concept.big_idea` — „Ta pati forma gali atrodyti linksmai arba niūriai. Įspūdį keičia spalva, o ne naujas piešinys.“ (94); `concept.steps` — keturi žingsniai iš sekos 2–5; `concept.example` — „Tas pats atvirukas išspausdintas du kartus. Viename dėmė geltona, kitame mėlyna. Piešinys tas pats, įspūdis kitas.“; `teacher.offline` — du lapai su ta pačia pieštuku nupiešta dėme, vienas dažomas šiltai, kitas vėsiai, paskui du vienodi kartoniniai apskritimai; `teacher.misconceptions` — trys nuostatos iš šio skyriaus (1–3), o ketvirtoji („yra teisinga nuotaika“) įrašoma kaip modelio riba, ne kaip klaida; `sim` — `{ "component": "deme-ir-spalvos", "config": { … } }`. Numeris `01-` laisvas, nes kryptis nauja. Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/index.json` ir `path.json` (kūrėjo ar dizainerio darbas, ne metodo dalis); siūloma vieta kelyje — tarp `09-augalo-gyvenimas` ir `06-figuros`: vaikas jau matė formas gamtoje, tada atskiria formą nuo spalvos, o geometrija jau įvardija pačias formas („forma lieka ta pati, kad ir kaip ją pasuktum“).
│
│  **Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, „Dailė“: 1–2 klasių amžiaus ypatumai (`sources/pradinio-bp-rekomendacijos-2024.txt:2622–2625`) ir 2 pavyzdys 1 klasei „Kaip susikūrė pasaulis“ (`:2714–2719`). `research/wiki/curriculum/kti-dalykai-1-klase.md` — dailės pasiekimų sritys (`:13`) ir oficialus 1 klasės ciklas (`:22`). Burkitt, E., Barrett, M., & Davis, A. (2003). Children's colour choices for completing drawings of affectively characterised topics. *Journal of Child Psychology and Psychiatry, 44*(3), 445–455. https://doi.org/10.1111/1469-7610.00134 · Zentner, M. R. (2001). Preferences for colours and colour–emotion combinations in early childhood. *Developmental Science, 4*(4), 389–398. https://doi.org/10.1111/1467-7687.00180 · Palmer, S. E., & Schloss, K. B. (2010). An ecological valence theory of human color preference. *PNAS, 107*(19), 8877–8882. https://doi.org/10.1073/pnas.0906172107
│
│ agents/log/metodininkas-2026-11-09.md
│ @@ -0,0 +1,63 @@
│ +# metodininkas — 2026-11-09 (paleidimas #180)
│ +
│ +## Ką pasirinkau ir kodėl
│ +
│ +Pagal vaidmens taisyklę (prioritetas `high`, paskui seniausias) eilėje buvo keturi `high` `tema` pasiūlymai: #6539 dailė (2026-11-08 12:33), #6540 dorinis ugdymas (12:35), #7566 kuprinė (2026-11-09), #7567 ritmas (2026-11-09). Seniausias — **#6539 „Dailė: ta pati kompozicija, kita spalva — nuotaika keičiasi, formos ne“**, ir jis atitinka du kartu sutampančius poreikius:
│ +
│ +- dailė yra vienas iš keturių privalomų 1 klasės dalykų, neturinčių nė vieno modulio (kartu su doriniu ugdymu, pilietiškumu ir gyvenimo įgūdžiais — pastarasis modulį jau turi);
│ +- pasiūlyme yra aiški klaidinga nuostata ir aiškus vienas kintamasis, t. y. jis praeina gairių 4 skyriaus penkis klausimus be išlygų.
│ +
│ +Pasiūlymo teiginiai patikrinti tiesiogiai: `sources/pradinio-bp-rekomendacijos-2024.txt:2714` („2 pavyzdys. 2 pamokų ciklas 1 klasei. Tema: „Kaip susikūrė pasaulis.““), `:2717–2718` („Tyrinėja ir apibūdina skirtingas spalvų ir dėmių sukuriamas nuotaikas, ritmą“), `:2622–2625` (1–2 kl. amžiaus ypatumai), `research/wiki/curriculum/kti-dalykai-1-klase.md:13` (trys dailės pasiekimų sritys) ir `:22` (1 kl. pamokų ciklas). Vienas pasiūlymo teiginys apie kodą netikslus: jame rašoma, kad `scope.py STRAND_SUBJECT` „neturi“ dailės rakto — iš tikrųjų `agents/scope.py:109–110` turi ir `"dailė"`, ir `"daile"`. Todėl metode strand id fiksuotas kaip ASCII `daile` (abi reikšmės veiktų, bet ASCII raktas yra tas, kuris jau naudojamas kituose failuose).
│ +
│ +## Metodas M-06 „Dailė: ta pati forma, kita spalva“
│ +
│ +Įrašytas `research/wiki/grades/01/metodai.md` (naujas skyrius prieš „Atviros prielaidos“, `atnaujinta: 2026-11-09`).
│ +
│ +- **Viena didelė idėja.** Forma pasako, *kas* nupiešta; spalva — *kaip* į tai žiūrima. Toje pačioje formoje kita spalva keičia įspūdį, o piešinys lieka tas pats.
│ +- **Kodėl modelis, o ne paveikslėlis.** Du paveikslai greta neįrodo, kad formos liko tos pačios. Modelis laiko geometriją nepajudinamą ir keičia tik didelės dėmės užpildą, o grįžimas į ankstesnę spalvą parodo lygiai tą patį vaizdą — tai kontrolinis bandymas, kurio paveikslėlis negali duoti.
│ +- **Kodėl abstrakti dėmė, o ne peizažas.** Peizaže spalva turi antrą reikšmę (metų laikas — jau `08-metu-laikai`), o daiktas kviečia jį pavadinti („saulė negali būti mėlyna“). Dėmė neturi pavadinimo, todėl klausimas lieka apie spalvą. Tai ir programos turinys (`:2717–2718`).
│ +- **Klaidingos nuostatos (4).** „Spalva yra daikto pavadinimas“; „jei atrodo kitaip, tai ir nupiešta kitaip“; „spalva tik puošia, prasmę neša forma“; „yra viena teisinga nuotaika“ (pastaroji neleidžiama atsirasti, o ne paneigiama).
│ +- **Seka.** Du lapai su ta pačia pieštuku nupiešta dėme (kūnas) → ekranas su keturiais dažais → grįžimas į pirmą spalvą (kontrolė) → simbolis („FORMA“ / „SPALVA“) → perkėlimas (kartoniniai apskritimai, du viršeliai, nespalvota kopija).
│ +- **Simuliacija `deme-ir-spalvos`**, failas `assets/js/sims/daile.js` (naujas), registracija `assets/js/registry.js` (viena `import` eilutė + `Object.assign` sąrašas). `config`: `colors` (4 dažai su `id`/`name`/`hex`), `start`, `sentences` (9 frazės).
│ +- **Vienas kintamasis:** `didelesDemesSpalva` ∈ 4 dažai. Mažos dėmės ir linijos spalva fiksuota (`#3a342b`), padėtis ir dydis konfigūracijoje.
│ +- **Invariantas užtikrintas kodu:** kompozicija įterpiama vieną kartą, keičiamas tik `fill`; inžinieriaus patikra — kiekvienos formos `getBBox()` prieš ir po visų keturių spalvų vienodas. Tai modelio teiginio sąlyga, ne estetika.
│ +- **7 būsenos** su `readout` ir `api.note`; `api.progress({correct:true})` — tik po palyginimo (≥ 2 skirtingos spalvos **ir** grįžimas į jau matytą), ne po pirmo dažo (LL-29); „Iš naujo“ pažangos netrina (LL-16).
│ +- **4 užduotys** (teisingi indeksai 1/2/0/1; 4-a `optional`): atpažinimas (kas pasikeitė), taikymas (ką keisti, norint kitokios nuotaikos), perkėlimas (du viršeliai), praplėtimas (nespalvota kopija). Kiekviena su `hint` į klaidą ir `why`.
│ +- **Nauja `art.js` dalis** `spot(x, y, w, h, color, kind)` — netaisyklingas `path` su `Q` kreivėmis; elipsė atmesta (lygus ovalas atrodo kaip kamuolys, LL-13).
│ +- **9 garso frazės** `config.sentences` (LL-42), kad `scripts/generate_audio.py` jas matytų; `api.note` garsiai neskaitomas.
│ +- **Modelio ribos pasakytos:** viena savybė, jokio potėpio/dydžio/ritmo; modelis neparodo, ką vaikas jaučia; spalvos–jausmo ryšys iš dalies kultūrinis (Palmer & Schloss, 2010; Zentner, 2001), todėl modulis nemoko „mėlyna = liūdna“; nespalvotame spaudinyje lieka forma; daltonikui būsena perskaitoma iš žodžių, bet patirtis silpnesnė — sakoma mokytojo bloke.
│ +
│ +## Kiti failai
│ +
│ +- `research/wiki/foundations/forma-ir-spalva.md` — naujas įrašas (3 DOI šaltiniai + programa); indekso eilutė `foundations/README.md`.
│ +- `research/wiki/guidelines/pilotai.md` — **P-018** (pirmas modelis, kuriame kintamasis yra paviršiaus savybė, o invariantas užtikrintas kodu).
│ +- `research/wiki/changelog.md` — 2026-11-09 (08:32) įrašas.
│ +- `agents/proposals/2026-11-09-metodininkas-dailes-spalva.json` — `type: metodas`, `target: content/lt/grade-01/daile/01-spalva-ir-nuotaika.json`, prioritetas `high`.
│ +
│ +## Šaltiniai (patikrinti)
│ +
│ +- **Burkitt, Barrett & Davis (2003)** — Crossref: J Child Psychol Psychiatry 44(3), 445–455, DOI 10.1111/1469-7610.00134; abstraktas perskaitytas per Europe PMC (PMID 12635973): 330 vaikų 4–11 m., trys sąlygos (žmogus, šuo, medis), dvi sesijos; malonioms figūroms — labiausiai mėgstamos spalvos, nemalonioms — mažiausiai mėgstamos, neutralioms — vidutinės; nemalonioms dažniausiai juoda; išvada — „even very young children are able to use colours symbolically“.
│ +- **Zentner (2001)** — Crossref + OpenAlex W2048803496: Developmental Science 4(4), 389–398, DOI 10.1111/1467-7687.00180; abstraktas — 3–4 m. vaikai randa pastovius spalvų ir veido išraiškų ryšius, nors reiškiniai neturi bendrų fizinių savybių.
│ +- **Palmer & Schloss (2010)** — Crossref: PNAS 107(19), 8877–8882, DOI 10.1073/pnas.0906172107; abstraktas — ekologinės valentingumo teorijos testas (mėlyna su giedru dangumi ir švariu vandeniu, ruda su išmatomis ir sugedusiu maistu).
│ +- Metode sąmoningai nesiremiama niekuo, ko abstraktas nesako: Burkitt ir kt. tyrė spalvos *parinkimą* pagal duotą charakteristiką, o ne mokymą atskirti formą nuo spalvos — tai įrašyta ir foundations „Ko šis įrašas nedaro“.
│ +
│ +## Patikra
│ +
│ +- `validate_content.py --grade 1` → 0 klaidų, 0 įspėjimų (rc 0); `--strict` → 0/0 (rc 0).
│ +- `check_language.py --grade 1` → 0 klaidų; įspėjimai (ilgi žodžiai `13-akmenelis-popierius`) buvo prieš darbą.
│ +- `check_lessons.py` → 64 įrašai, visi su 4 laukais (rc 0).
│ +- `check_agents.py` → 15 vaidmenų, 1 įspėjimas (`sistemos-architektas` nepapildė `system-journal.md`) — buvo prieš darbą.
│ +- `check_docs_facts.py` → 0 klaidų, 0 įspėjimų; `check_art.py` → 5 simuliacijų failai naudoja `art.js`.
│ +- **Teksto ilgiai matuoti skriptu, ne akimis (LL-21):** `title` 33 (riba 42), `subtitle` 50 (80), `concept.title` 22 (40), `big_idea` 94 (240), `concept.example` 3 sakiniai po 6/5/7 ž.; `concept.steps` 60/41/43/36 simb. (riba 200); visi `readout`, `api.note`, užduočių `q`/`hint`/`why`, `outcomes` ir refleksijos sakiniai ≤ 10 žodžių (ilgiausias 9). Pirmoji versija turėjo tris netikslius skaičius (`title` 31, `subtitle` 51, `big_idea` 105) ir 11 žodžių `concept.example` sakinį — visi pataisyti prieš įrašant.
│ +- `check_view.py` netaikytas: sąsaja ir simuliacijos kodas neliesti (modulio dar nėra).
│ +
│ +## Kas liko
│ +
│ +1. **Modulis dar nesukurtas.** Kūrėjui reikės: naujos krypties `daile` (`content/lt/grade-01/index.json`), `path.json` įrašo (siūloma vieta — tarp `09-augalo-gyvenimas` ir `06-figuros`), `assets/js/sims/daile.js`, `registry.js` eilutės, `art.js` dalies `spot()` ir 9 garso frazių.
│ +2. **Dailė uždengia vieną iš keturių privalomų dalykų be modulio.** Liko dorinis ugdymas (#6540, `high`) ir pilietiškumas (ideatorius 2026-11-09 atmetė kaip paveikslėlį — `klausimai.md`); gyvenimo įgūdžiai jau turi `01-dovana-ir-noras`.
│ +3. **#6540 (dorinis ugdymas) yra kitas pagal eiliškumą** — jo modelis (trys vaikai stato bokštą, vienas nustoja) reikalauja kelių veikėjų būsenų ir bendro rezultato, todėl jam reikės atskiro paleidimo ir, greičiausiai, naujos sim rūšies (ne vieno kintamojo, o eilės ėjimų).
│ +4. `agents/scope.py` „vandens būsenos“ vis dar rodo nepadengtą (LL-49, #5047) — nekartoju.
│ +
│ +## Pamokos
│ +
│ +Naujo defekto tipo neradau. Pritaikyti iš anksto: LL-21 (skaičiai dokumente perskaičiuoti skriptu — ir trys buvo neteisingi), LL-29 (`api.progress` tik po palyginimo), LL-42 (visi tariami sakiniai `config.sentences`), LL-13 (elipsė dėmei atmesta), LL-23 (išvedžiau tik 1 klasės programos sąvokas: „nuotaika“, „dėmė“, „forma“), LL-36 (pasiūlymo citatos patikrintos tose pačiose eilutėse).
│ profiles/deepseek41flash/cache/scratch/update_state.py
│ @@ -0,0 +1,38 @@
│ +import json, pathlib
│ +
│ +p = pathlib.Path("agents/state.json")
│ +s = json.loads(p.read_text(encoding="utf-8"))
│ +
│ +s["last_method_work"] = {
│ +    "date": "2026-11-09",
│ +    "run_id": 180,
│ +    "proposal": "agents/proposals/2026-11-09-metodininkas-dailes-spalva.json",
│ +    "source_proposal": "agents/proposals/2026-11-08-ideator-dailes-spalva-ir-nuotaika.json (#6539)",
│ +    "target": "content/lt/grade-01/daile/01-spalva-ir-nuotaika.json",
│ +    "method": "M-06",
│ +    "topic": "dailė — spalva ir nuotaika",
│ +    "selection": "Pagal vaidmens taisyklę (high, tada seniausias) eilėje buvo keturi high `tema` pasiūlymai: #6539 dailė (2026-11-08 12:33), #6540 dorinis ugdymas (12:35), #7566 kuprinė, #7567 ritmas. Seniausias — #6539; dailė yra vienas iš keturių privalomų 1 klasės dalykų be nė vieno modulio, o pasiūlymas turi vieną kintamąjį ir aiškią klaidingą nuostatą.",
│ +    "misconception": "„Spalva yra daikto pavadinimas“ ir „jei paveikslas atrodo kitaip, jis ir nupieštas kitaip“; trečioji — „spalva tik puošia, prasmę neša forma“; ketvirtoji („yra teisinga nuotaika“) neleidžiama atsirasti, o ne paneigiama.",
│ +    "answer": "Du paveikslai greta neįrodo, kad formos liko tos pačios. Modelis laiko geometriją mechaniškai nepajudinamą (kompozicija įterpiama vieną kartą, keičiamas tik `fill`; `getBBox()` prieš ir po vienodas), o grįžimas į ankstesnę spalvą grąžina lygiai tą patį vaizdą — tai kontrolinis bandymas, kurio paveikslėlis negali duoti. Abstrakti dėmė, o ne peizažas, nes daiktas kviestų jį pavadinti, o metų laiko spalva dubliuotų 08-metu-laikai.",
│ +    "what_changed": "1) research/wiki/grades/01/metodai.md — naujas M-06 (seka: du lapai → ekranas → grįžimas → simbolis „FORMA/SPALVA“ → perkėlimas; simuliacija `deme-ir-spalvos` assets/js/sims/daile.js + registry.js; vienas kintamasis `didelesDemesSpalva`; 7 būsenos; 4 užduotys, indeksai 1/2/0/1, 4-a optional; nauja art.js dalis `spot()`; 9 garso frazės config.sentences; modelio ribos). 2) foundations/forma-ir-spalva.md — naujas įrašas. 3) foundations/README.md — indekso eilutė. 4) guidelines/pilotai.md — P-018. 5) changelog.md — 2026-11-09 (08:32) įrašas.",
│ +    "measure": "Teksto ilgiai skriptu (LL-21): title 33 (riba 42), subtitle 50 (80), concept.title 22 (40), big_idea 94 (240), concept.example 3 sakiniai 6/5/7 ž., concept.steps 60/41/43/36 simb. (200), visi readout/api.note/q/hint/why/outcomes/refleksija ≤ 10 ž. (ilgiausias 9). Pirmoji versija turėjo tris netikslius skaičius (31/51/105) ir 11 ž. example sakinį — pataisyta prieš įrašant. Išdėstymas: scena 328×250, dažų juosta 4×64 + 3×12 = 292 iš 328 px.",
│ +    "svietimas1": "P1/T1.2 — viena sąvoka (forma vs spalva), be ritmo ir potėpio; P2 — spėjimas prieš pirmą dažą ir grįžimas kaip kontrolė; T2.2 — perkėlimas į viršelius ir nespalvotą kopiją; T3.1/T3.4 — hint kiekvienoje užduotyje, 4-a optional; T5.1 — grįžtamasis ryšys apie veiksmą, jokia nuotaika nevertinama; T5.5 — 64×56 px taikiniai, spalva ne vienintelis informacijos nešėjas (žodis po dažu, readout, aria-pressed); T6.1 — pilotas P-018.",
│ +    "sources_verified": "Crossref/Europe PMC: Burkitt, Barrett & Davis 2003 (10.1111/1469-7610.00134, JCPP 44(3) 445–455, PMID 12635973, 330 vaikų 4–11 m., abstraktas perskaitytas). Zentner 2001 (10.1111/1467-7687.00180, Dev. Sci. 4(4) 389–398, OpenAlex W2048803496). Palmer & Schloss 2010 (10.1073/pnas.0906172107, PNAS 107(19) 8877–8882). Programa: sources/pradinio-bp-rekomendacijos-2024.txt:2714, 2717–2718, 2622–2625.",
│ +    "verified": "validate_content.py --grade 1 → 0 klaidų, 0 įspėjimų (rc 0); --strict → 0/0; check_language.py --grade 1 → 0 klaidų (ilgų žodžių įspėjimai buvo prieš darbą); check_lessons.py → 64 įrašai; check_agents.py → 15 vaidmenų (1 įspėjimas buvo prieš darbą); check_docs_facts.py → 0/0; check_art.py → 5 failai naudoja art.js.",
│ +    "new_lesson": "— (naujo defekto tipo nerasta; LL-21, LL-29, LL-42, LL-13, LL-23, LL-36 pritaikyti iš anksto)",
│ +    "proposal_out": "— (vienas paleidimas — vienas metodas)",
│ +    "log": "agents/log/metodininkas-2026-11-09.md",
│ +    "remaining": "Modulis dar nesukurtas: kūrėjui reikia naujos krypties `daile` (index.json, strand id ASCII `daile`), path.json įrašo (siūloma vieta tarp 09-augalo-gyvenimas ir 06-figuros), assets/js/sims/daile.js, registry.js eilutės, art.js dalies `spot()` ir 9 garso frazių. Dailė uždengia vieną iš keturių privalomų dalykų be modulio; liko dorinis ugdymas (#6540, kitas pagal eiliškumą) ir pilietiškumas (atmestas kaip paveikslėlis, klausimai.md). agents/scope.py „vandens būsenos“ vis dar rodo nepadengtą (LL-49, #5047) — nekartota.",
│ +    "notes": "Modulis nekuriamas — target yra būsimo modulio kelias, todėl index.json, path.json, garsas ir check_view.py netaikyti (failo nėra). Pasiūlymo pastaba, kad scope.py neturi dailės rakto, netiksli: agents/scope.py:109–110 turi ir „dailė“, ir „daile“ — metode fiksuotas ASCII `daile`. agents/state.json yra .gitignore; ataskaita agents/log/*.md — tracked.",
│ +    "touched": "research/wiki/grades/01/metodai.md; research/wiki/foundations/forma-ir-spalva.md; research/wiki/foundations/README.md; research/wiki/guidelines/pilotai.md; research/wiki/changelog.md; agents/proposals/2026-11-09-metodininkas-dailes-spalva.json; agents/log/metodininkas-2026-11-09.md; agents/state.json",
│ +}
│ +
│ +role = s["roles"]["metodininkas"]
│ +role["last_run"] = "2026-11-09T08:32:00"
│ +role["status"] = "published"
│ +role["log"] = "agents/log/metodininkas-2026-11-09.md"
│ +
│ +s["updated"] = "2026-11-09T08:32:00"
│ +
│ +p.write_text(json.dumps(s, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
│ +print("ok", len(json.dumps(s, ensure_ascii=False)), "chars")
│ profiles/deepseek41flash/cache/scratch/probe_state.py
│ @@ -0,0 +1,19 @@
│ +import json, sqlite3
│ +
│ +s = json.load(open("agents/state.json", encoding="utf-8"))
│ +print("top keys:", len(s))
│ +print("last_method_work method:", s["last_method_work"]["method"], s["last_method_work"]["run_id"])
│ +print("role:", s["roles"]["metodininkas"])
│ +
│ +c = sqlite3.connect("agents/runs.db")
│ +c.row_factory = sqlite3.Row
│ +cols = [r[1] for r in c.execute("PRAGMA table_info(proposals)")]
│ +print("proposals cols:", cols)
│ +rows = list(c.execute("SELECT id, role, type, priority, status, created, title FROM proposals WHERE role='metodininkas' ORDER BY id DESC LIMIT 5"))
│ +for r in rows:
│ +    print(dict(r))
│ +try:
│ +    found = list(c.execute("SELECT id, status FROM proposals WHERE title LIKE '%forma neša tapatybę%'"))
│ +    print("my proposal indexed:", [tuple(x) for x in found])
│ +except Exception as e:
│ +    print("query err", e)
Baigta. Metodas M-06 įrašytas ir patikrintas.

**Ką pasirinkau.** Seniausias `high` `tema` pasiūlymas eilėje — #6539 dailė (2026-11-08 12:33). Dailė yra vienas iš keturių privalomų 1 klasės dalykų be nė vieno modulio, o pasiūlymas turi vieną kintamąjį ir konkrečią klaidingą nuostatą. Pasiūlymo citatos patikrintos tose pačiose eilutėse (`sources/pradinio-bp-rekomendacijos-2024.txt:2714`, `:2717–2718`, `:2622–2625`). Viena pasiūlymo pastaba netiksli: `agents/scope.py:109–110` turi ir `"dailė"`, ir `"daile"` — metode fiksuotas ASCII `daile`.

**Metodas (M-06 „Dailė: ta pati forma, kita spalva“).** Forma pasako, kas nupiešta; spalva — kaip į tai žiūrima. Simuliacija `deme-ir-spalvos` keičia vienintelį kintamąjį (didelės dėmės užpildą iš 4 dažų), o kompozicija įterpiama vieną kartą ir keičiamas tik `fill` — todėl teiginys „formos nepasikeitė“ patikrinamas (`getBBox()` prieš ir po vienodas), o grįžimas į pirmą spalvą yra kontrolinis bandymas. Sąmoningai abstrakti dėmė, o ne peizažas: daiktas kviestų jį pavadinti, o metų laiko spalva dubliuotų `08-metu-laikai`. Duota viskas be papildomų klausimų: 5 žingsnių seka, 7 būsenos su `readout`/`api.note`, `api.progress` tik po palyginimo (LL-29), 360 px išdėstymas (dažai 4×64 + 3×12 = 292 iš 328 px), 9 garso frazės `config.sentences` (LL-42), nauja `art.js` dalis `spot()`, 4 užduotys (indeksai 1/2/0/1, ketvirta `optional`) su `hint` ir `why`, 3 klaidingos nuostatos + ketvirtoji neutralizuota, modulio laukų reikšmės ir vieta `path.json`.

**Failai.** `research/wiki/grades/01/metodai.md` (M-06), `research/wiki/foundations/forma-ir-spalva.md` (+ eilutė `foundations/README.md`), `pilotai.md` (P-018), `changelog.md`, `agents/proposals/2026-11-09-metodininkas-dailes-spalva.json`, `agents/log/metodininkas-2026-11-09.md`, `agents/state.json` (`last_method_work` + vaidmens būsena).

**Patikra (tikri rezultatai).** `validate_content.py --grade 1` ir `--strict` → 0/0, rc 0. `check_language.py --grade 1` → 0 klaidų (ilgų žodžių įspėjimai buvo prieš darbą). `check_lessons.py` → 64 įrašai; `check_agents.py` → 15 vaidmenų (1 įspėjimas buvo prieš); `check_docs_facts.py` → 0/0; `check_art.py` → 5 failai naudoja `art.js`. Teksto ilgiai matuoti skriptu (LL-21): pirmoji versija turėjo tris netikslius skaičius (31/51/105) ir 11 žodžių `example` sakinį — pataisyta prieš įrašant. DOI patvirtinti per Crossref/Europe PMC (Burkitt ir kt. 2003, PMID 12635973 — abstraktas perskaitytas; Zentner 2001; Palmer & Schloss 2010).

**Kas liko.**
1. Modulis dar nesukurtas: kūrėjui reikia krypties `daile` (`index.json`), `path.json` įrašo (siūloma tarp `09-augalo-gyvenimas` ir `06-figuros`), `assets/js/sims/daile.js`, `registry.js` eilutės, `art.js` dalies `spot()` ir 9 garso frazių.
2. **Neužbaigta dalis:** pasiūlymas įrašytas kaip failas, bet `agents/runs.db` jo dar neindeksavo (užklausa pagal pavadinimą grąžino tuščią sąrašą; ankstesni metodininko įrašai turi ID 5485, 606, 361…). Indeksavimą turi atlikti bėgiklis (`agents/run.py`) arba reikia atskiro įrašo — to padaryti nebespėjau.
3. Dorinis ugdymas (#6540) yra kitas pagal eiliškumą; jo modelis reikalauja kelių veikėjų ėjimų eilės, todėl greičiausiai naujos sim rūšies.
4. `agents/scope.py` „vandens būsenos“ vis dar rodo nepadengtą (LL-49, #5047) — nekartota.

Naujo defekto tipo neradau, todėl `research/wiki/guidelines/pamokos.md` nepildytas.

## klaidos

```
session_id: local-bcfc1fb33d4de2a10f4e60d54b4c51f1e2350edc23aa270815e97227adec5401
```
