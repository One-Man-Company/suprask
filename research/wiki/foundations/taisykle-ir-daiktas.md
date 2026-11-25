---
title: "Taisyklė priklauso sąryšiui, ne daiktui: kodėl modelis fiksuoja daiktą ir keičia kortelę"
tipas: fundamentai
temos: [taisyklė, loginės operacijos, modeliai, simuliacijos, sąryšis, kalba]
amzius: "6-12"
atnaujinta: 2026-11-25
saltiniai: 6
---

# Taisyklė priklauso sąryšiui, ne daiktui

## Pagrindinė idėja

Kai daiktas elgiasi pagal taisyklę, vaikas elgseną priskiria **daiktui**, o ne sąryšiui. Lempa „tokia“ — dega, kai kas nors ją uždega; jungiklis „toks“ — uždega lempą. Taisyklė, kuri iš tikrųjų sprendžia, nematoma, nes ji neturi kūno: ji yra ryšys tarp to, kas įjungta, ir to, kas matoma.

Tai ne vienos temos bėda. Ta pati struktūra jau aprašyta kituose įrašuose: [[forma-ir-spalva]] (forma — tapatybė, spalva — įspūdis), [[vienetas-ir-skaicius]] (ilgis priklauso vienetui, o ne daiktui), [[dydis-ir-skaicius]] (monetos vertė — užrašas, o ne skersmuo). Visais atvejais modelis veikia todėl, kad **daiktas lieka nepajudinamas, o keičiama tik ta savybė, kuri neša reikšmę**. Su taisykle yra trečias žingsnis: reikšmę neša ne savybė, o **sąryšis**, todėl jį reikia parodyti kaip atskirą, nuimamą daiktą — kortelę.

Trys pasekmės modeliui:

1. **Daiktas fiksuojamas mechaniškai.** Jungikliai, lempa ir jų vieta nekeičiami nė karto; keičiasi tik kortelė. Jei juda ir daiktas, ir taisyklė, vaikas negali pasakyti, kas sukėlė pokytį.
2. **Taisyklė turi būti perskaitoma, o ne atspėjama iš žodžio.** Sąvokos žodis („ir“, „arba“, „ne“) toli gražu nėra vienareikšmis vaikui, todėl ant kortelės rašoma ir žodžio reikšmė: „užtenka vieno“, „reikia abiejų“, „ne abu“.
3. **Kiekviena taisyklė turi turėti bent vieną atvejį, kuriuo ji skiriasi nuo visų kitų.** Jei dvi taisyklės duoda tą pačią požymių lentelę, „kuri tai taisyklė?“ yra spėjimas, o ne atpažinimas: teisingas atsakymas atsitiktinis, o modelis moko lošti, ne spręsti.

## Ką rodo tyrimai

**Tas pats žodis duoda priešingus atsakymus.** Braine ir Rumain (1981) tyrė 5–6 metų vaikus: komandos užduotyje („paduok vieną“) jie „arba“ suprato išskirtinai (vieną, o ne abu), o tikrumo įvertinimo užduotyje — kaip jungtuką „ir“ (abu). Autoriai padarė išvadą, kad disjunkcijos supratimas komandoje ateina anksčiau negu jos teisingumo sąlygų žinojimas. Vadinasi, ginčas apie žodžio reikšmę negali būti sprendžiamas žodžiu.

**Vaikai „arba“ neretai sustiprina iki „ir“.** Singh, Wexler, Astle-Rahim, Kamawar ir Fox (2016) parodė, kad ikimokyklinukai disjunkcinį sakinį dažnai supranta kaip jungtinį („abu“), nors suaugusieji tą patį sakinį supranta išskirtinai; autoriai tai aiškina pragmatiniu sustiprinimu, o ne neišmanyta semantika.

**Literatūra nesutaria, o tai pats svarbiausias duomuo.** Jasbi ir Frank (2021), ištyrę ikimokyklinukus paprastuose egzistenciniuose sakiniuose, rado, kad vaikų disjunkcijos supratimas yra daug panašesnis į suaugusiųjų, negu buvo manyta ankstesniuose darbuose. Taigi tas pats amžius viename tyrime atrodo „išskirtinis“, kitame „jungtinis“, trečiame „kaip suaugusiojo“. Tai reiškia, kad viena užduotis negali būti sąvokos matas — reikia matomos pasekmės, kurią vaikas pasigamina pats.

**Kasdienė vartosena nėra logikos taisyklė.** Morris (2008) rado, kad „ir“ vaikai pradeda vartoti anksčiau nei „arba“, kad ankstyvas vartojimas paprastai nėra loginis ir kad „arba“ tiek vaikų, tiek suaugusiųjų kalboje dažniausiai yra išskirtinis. Todėl modelis, kuriame „arba“ leidžia abu, privalo pasakyti, kad tai **kortelės** reikšmė, o ne žodžio apskritai.

**Neigimas suprantamas anksti, bet ne sudėtinio sakinio atžvilgiu.** Reuter, Feiman ir Snedeker (2018) parodė, kad 2–3 metų vaikai „ne“, „ne…“ ir „negali“ supranta palankioje situacijoje, bet supratimas priklauso nuo konteksto. Todėl „NE“ 6–7 metų modelyje neturi būti aiškinamas kaip trečia savarankiška taisyklė: jis turi turėti sakinį, kurį neigia („abu įjungti“), ir parodyti apvertimą.

## Keturios taisyklės modeliui, kuriame yra taisyklė

1. **Daiktas nejuda.** Visi įėjimai ir išėjimas lieka toje pačioje vietoje; keičiama tik taisyklė. Patikra: elemento `getBBox()` prieš ir po taisyklės keitimo vienodas.
2. **Taisyklė parašyta ant daikto, kurį vaikas gali paimti.** Ne tekste po simuliacija, o ant kortelės, kuri pasirenkama. Vaikas turi matyti, kad taisyklė yra atskiras daiktas, o ne lempos savybė.
3. **Kiekviena taisyklė atskiriama bent vienu atveju.** Patikra: sudaroma visų įėjimų × visų taisyklių lentelė ir tikrinama, ar kiekviena taisyklės eilutė unikali. Jei dvi eilutės sutampa, viena taisyklė šalinama arba pridedamas atvejis.
4. **Spėjimas prieš pirmą veiksmą.** Be jo modelis virsta demonstracija, o vaikas atsako po to, kai pasekmę jau matė (`research/wiki/foundations/sujungti-dydziai.md`).

## Kur tai gali pakenkti

- **Kortelė keičiama kiekvieną kartą.** Jei vaikas niekada nepamato to paties įėjimo su kita taisykle, modelis rodo atsitiktinumą, ne sąryšį. Todėl kortelė keičiama tik tada, kai lenta baigta, o požymis lieka.
- **Žodis taisyklės vietoje.** Jei ekrane parašyta tik „ARBA“, vaikas atsako pagal kalbą, o ne pagal modelį; tada modelis matuoja žodyną, ne sąvoką.
- **Dvi taisyklės, kurių negalima atskirti.** Atpažinimo užduotis tampa spėjimu iš trijų variantų; teisingas atsakymas nebepasako, ar vaikas suprato.
- **Taisyklė, kuri neturi nė vieno atvejo, kai ji skiriasi nuo „įprastos“.** Jei visi atvejai sutampa su vaiko laukiamu rezultatu, modelis patvirtina nuostatą, o ne parodo ją (LL-28).

## Ką tai reiškia SUPRASK platformai

1. Bet kuris modelis „iš elgsenos atpažink taisyklę“ (loginės operacijos, komandų seka, medžiagų savybės, augalų grupė) privalo turėti įėjimų lentelę, kuri atskiria kiekvieną variantą. Tai patikrinama rankiniu būdu per kelias minutes ir neturi būti paliekama autoriaus nuojautai.
2. Sąvokos žodis rodomas **ant taisyklės kartu su paaiškinimu**, o ne viename sakinyje po simuliacija.
3. Kasdienė žodžio vartosena nepaverčiama klaida: modelio ribos pasako, kad „arba“ kasdienėje kalboje dažniausiai reiškia vieną (LL-18).
4. Modelis, kuriame taisyklė yra sąryšis, turi baigtis vienu sakiniu, kuris taisyklę įvardija („Kortelė ABU dega tik su abiem jungikliais“) — tai simbolis, kurį vaikas gali pasakyti pats.

## Šaltiniai

Braine, M. D. S., & Rumain, B. (1981). Development of comprehension of "or": Evidence for a sequence of competencies. *Journal of Experimental Child Psychology, 31*(1), 46–70. https://doi.org/10.1016/0022-0965(81)90003-5 · Morris, B. J. (2008). Logically speaking: Evidence for item-based acquisition of the connectives AND & OR. *Journal of Cognition and Development, 9*(1), 67–88. https://doi.org/10.1080/15248370701836600 · Singh, R., Wexler, K., Astle-Rahim, A., Kamawar, D., & Fox, D. (2016). Children interpret disjunction as conjunction: Consequences for theories of implicature and child development. *Natural Language Semantics, 24*(4), 305–352. https://doi.org/10.1007/s11050-016-9126-3 · Jasbi, M., & Frank, M. C. (2021). Adults' and children's comprehension of linguistic disjunction. *Collabra: Psychology, 7*(1), 27702. https://doi.org/10.1525/collabra.27702 · Reuter, T., Feiman, R., & Snedeker, J. (2018). Getting to no: Pragmatic and semantic factors in two- and three-year-olds' understanding of negation. *Child Development, 89*(4), e364–e381. https://doi.org/10.1111/cdev.12858 · Kearney, M. (2004). Classroom use of multimedia-supported predict–observe–explain tasks. *Research in Science Education, 34*(4), 427–453. https://doi.org/10.1007/s11165-004-8795-y
