# metodininkas — 2026-11-24T0823

- paleidimas: #498 (manual)
- trukmė: 712s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ research/wiki/grades/01/metodai.md
│ @@ -1517,6 +1517,142 @@
│
│  **Pastaba dėl pasiūlymo.** Ideatorius (#466) temą jau įrašė (`agents/proposals/2026-11-23-ideator-mygtukas-ir-jungiklis.json`), ir šis metodas ją **siaurina bei taiso**: (1) ideatorius durų skambutį priskyrė prie įtaisų, kurie „įsimena“, o iš tikrųjų skambutis kaip tik neturi atminties — jis yra **priešpriešinis** mygtuko pavyzdys, todėl metode jis perkeltas į 3-ą užduotį, o „įsimenantys“ prietaisai (telefonas, liftas) liko modelio riboje, ne užduotyje (LL-18 — variantas, kuris gyvenime teisingas, negali būti neteisingas atsakymas); (2) ideatorius rėmėsi vien lempa, o metodas įveda **matomą valdiklio padėtį** kaip antrą įrodymą tame pačiame kadre (LL-143); (3) ideatorius siūlė „paspaudžia ir paleidžia“ vienu judesiu, o metodas skaido į du bakstelėjimus, kad paleidimas būtų atskiras žingsnis ir nereikėtų laikyti piršto. Senesnis sistemos pasiūlymas `agents/proposals/backlog-d-elektronika-elektronika.json` tą pačią programos poziciją vadina `04-elektronika`; laikomasi `backlog.json` (ir žmogaus padengties bloko) tako `07-elektronika`, o 04 lieka laisvas.
│
│ +### M-16 — Batas išdžius toks, koks džiūsta: formą užfiksuoja pabaiga, o ne šlapia pradžia
│ +
│ +**Data:** 2026-11-24 · **Tema:** 1 klasės technologijos, 23.2.2 „Drabužių, avalynės priežiūra“ (`sources/pradinio-bp-rekomendacijos-2024.txt:9458–9468`) ir 9 skyriaus C3 „1 klasė. Drabužių, avalynės priežiūra. Praktiškai išbandomi avalynės sutvarkymo būdai“ (`:40061`; OCR tekste — „suvar tymo“) · **Tikslas:** `content/lt/grade-01/technologijos/08-avalynes-dziovinimas.json` (technologijose užimti 01, 02, 03, 06, 07 — 08 laisvas)
│ +
│ +**Viena didelė idėja.** Šlapias odinis batas minkštas, todėl lengvai praranda formą. Sausas — kietas, todėl formos nebeatgauna. Formą užfiksuoja ne šlapia pradžia, o **pabaiga**: batas išdžiūsta tokios formos, kokioje stovi paskutinę džiūvimo akimirką. Todėl šlapius batus džioviname su įdėtu laikraščiu ar įdėklu — ne tam, kad būtų gražiau, o tam, kad būtų kam išlaikyti formą.
│ +
│ +**Ką sako programa.** 23.2.2 punktas 1–2 klasei prašo „…ar/ir avalynės/tekstilės valymas be cheminių priemonių. Apibūdinami darbo procesai, vaizdo ir kt. savybės“ (`:9458–9468`), o 9 skyriaus C3 1 klasei įvardija būtent „Praktiškai išbandomi avalynės sutvarkymo būdai“ (`:40061`). Platformoje avalynė sąmoningai atidėta: `06-drabuziu-prieziura.json:98` `sources` lauke parašyta „— avalynė paliekama atskiram moduliui, kad modulyje liktų viena idėja“, o `teacher.goal` (`:85`) kartoja „Avalynės priežiūra (batų valymas ir džiovinimas) sąmoningai neįtraukta — tai atskiras modulis“. To modulio nėra: `ls content/lt/grade-01/technologijos/` rodo 01, 02, 03, 06, 07, o `grep -rin "avalyn" content/lt/grade-01/` randa tik tris eilutes, ir visos trys yra `06-drabuziu-prieziura.json` tekstuose (tikrinta 2026-11-24). `research/wiki/curriculum/backlog.json` eilutė `D:drabuziu-prieziura` tuo tarpu pažymėta `covered`, nors jos `outcome` yra „1 klasė. Drabužių, avalynės priežiūra“, o `interactivity` — „Sekos pratimas: kaip prižiūri avalynę“. Tai ne padengtis, o pusė temos: drabužiai padengti, avalynė — ne (žr. pastabą dėl pasiūlymo).
│ +
│ +**Kodėl modelis, o ne paveikslėlis.** Paveikslas gali parodyti tik vieną būseną: arba apvalią nosį, arba sulinkusią. Visa šios temos pasekmė yra **laike**: kol batas šlapias, jo forma dar kinta; kai sausas — nebekinta. Todėl reikia modelio, kuriame vaikas pats nustato, kas bus bato viduje, ir pats pastumia džiūvimą į priekį, o paskui pamato, kad nosies nebegalima grąžinti atgal. Tai vienintelis būdas atskirti dvi konkuruojančias nuostatas — „forma grįžta pati“ ir „formą laiko įdėklas“ — nes abi jos daro tą pačią prognozę tol, kol laikas nepajudėjo.
│ +
│ +**Ką rodo tyrimai.**
│ +Han, Hu ir Jiang (2018) parodė, kad kolagenas (odos pagrindas) yra **vandens valdomos formos atminties** medžiaga: vanduo išskiria tarppeptidinius vandenilinius ryšius, todėl šlapia oda tampa formuojama; džiūnant ryšiai susidaro iš naujo — bet jau naujose padėtyse, todėl deformuota forma tampa nauja pusiausvyros forma. Tai tiksliai tas mechanizmas, kurį modelis turi parodyti: formą fiksuoja džiūvimas, o ne šlapimas.
│ +Batzer ir Kreibich (1981) parodė, kad vanduo ryškiai nuleidžia kolageno ir celiuliozės stiklinimo temperatūrą — būtent dėl vandenilinių ryšių nutraukimo. Iš to seka dvi modelio dalys: (1) „šlapias minkštas, sausas kietas“ nėra palyginimas, o ta pati medžiaga dviejose būsenose; (2) **tas pats galioja popieriui**, todėl perkėlimo užduotis su šlapiu lapu remiasi tuo pačiu šaltiniu, o ne analogija „iš galvos“.
│ +Gopnik ir kt. (2001) parodė, kad net 2–4 metų vaikai daro išvadą apie priežastį iš **variacijos ir kovariacijos** modelio: kai vienas dalykas kinta, o kiti lieka tie patys. Todėl modelyje trys batai privalo būti vienodi iš viso, išskyrus vieną dalyką — turinį. Jei jie skirtųsi dydžiu ar spalva, vaikas priežastį galėtų priskirti jiems.
│ +Kearney (2004), aprašydamas spėjimas–stebėjimas–paaiškinimas (POE) užduotis su multimedija, rodo, kad būtent **spėjimas prieš stebėjimą** ištraukia vaiko nuostatą į paviršių ir padaro stebėjimą prasmingą; be spėjimo vaikas žiūri animaciją ir nemato, ką ji paneigė.
│ +Chinn ir Brewer (1993) rodo, kad vienas prieštaraujantis atvejis nuostatos beveik nekeičia — prieštara turi būti aiški ir kartojama. Todėl pažanga žymima ne po pirmo išdžiuvimo, o tada, kai tame pačiame kadre yra ir apvalus, ir sulinkęs batas.
│ +
│ +**Klaidingos nuostatos ir kaip jos paneigiamos.**
│ +
│ +1. **„Šlapias batas išdžius ir pats grįš į savo formą.“** Tai pagrindinė nuostata, ir ji kyla iš kasdienės patirties su guma ir putomis, kurios tikrai atsimena formą. Modelyje batas be įdėklo po džiūvimo lieka sulinkęs, ir jokia būsena nebegrąžina nosies atgal. Svarbu, kad modelis **neturi** mygtuko „ištiesinti“: jei jis būtų, vaikas manytų, kad užtenka pastangos.
│ +2. **„Batas sulinko, nes buvo šlapias.“** Visi trys modelio batai yra vienodai šlapi, todė

… PRALEISTA 26247 SIMBOLIŲ IŠ 44247 (įrankių išklotinės) — visa ataskaita: agents/work/metodininkas/00498/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

md
│ @@ -1,6 +1,16 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-24 (08:35) — Metodas M-16 (#498): šlapio bato forma fiksuojama džiūvimo pabaigoje; naujas pilotas P-023; nauja pamoka LL-170 dėl dvigubos `covered` eilutės
│ +
│ +- **Kas pridėta:** `research/wiki/grades/01/metodai.md` — M-16 „Batas išdžius toks, koks džiūsta“ (1 kl. technologijos, tikslas `content/lt/grade-01/technologijos/08-avalynes-dziovinimas.json`): viena didelė idėja, programos pagrindas (23.2.2 `:9458–9468`, 9 skyriaus C3 `:40061`), 5 nuostatos su paneigimu, 5 žingsnių seka, simuliacijos specifikacija (config JSON, išvestinė `sag(content, stage)` / `outcome(content)` taisyklė, 10 būsenų lentelė, geometrija 360 px, fokasas LL-32, `api.progress` tik po mišraus rezultato), 4 užduotys (indeksai 1/0/1/1), 5 modelio ribos, 5 šaltiniai su DOI. Pasiūlymas — `agents/proposals/2026-11-24-metodininkas-avalynes-dziovinimas.json` (`type: metodas`, `priority: high`).
│ +- **Kodėl:** programa avalynės priežiūrą įvardija atskirai, o `06-drabuziu-prieziura.json:98` ir `:85` ją sąmoningai palieka kitam moduliui; to modulio nėra (`ls` → 01, 02, 03, 06, 07; `grep -rin "avalyn" content/lt/grade-01/` → 3 eilutės, visos tame pačiame modulyje). Interaktyvumas reikalingas todėl, kad pasekmė yra laike (kol šlapia — kinta, kai sausa — ne), o paveikslas teparodo vieną būseną.
│ +- **Šaltiniai:** Han, Hu & Jiang (2018), DOI 10.1039/c8tb01346b (kolageno formos atmintis, valdoma vandens — džiūvimas fiksuoja deformuotą formą); Batzer & Kreibich (1981), DOI 10.1007/BF00255296 (vanduo nuleidžia kolageno ir celiuliozės Tg — tuo pačiu pagrįsta perkėlimo užduotis su popieriumi); Gopnik ir kt. (2001), DOI 10.1037/0012-1649.37.5.620 (priežastis iš variacijos ir kovariacijos); Kearney (2004), DOI 10.1007/s11165-004-8795-y (POE su multimedija); Chinn & Brewer (1993), DOI 10.3102/00346543063001001.
│ +- **Patikra (realūs paleidimai):** juodraštinis modulis laikinai įrašytas target kelyje ir vėl ištrintas — `validate_content.check_module` → 0 klaidų, 1 įspėjimas (komponento `batas` kūno nėra, todėl `sim.config` gyvumas nepatikrintas, LL-61), `check_language.check_module` → 0 radinių. Pirmoji versija davė tikrą radinį ir jis pataisytas: `concept.big_idea` sakinys buvo 14 žodžių (riba 10), o keturi klausimai neturėjo klausiamojo žodžio. Po ištrynimo `validate_content.py --grade 1` → 0 klaidų, 0 įspėjimų; `git status` rodo tik wiki failus ir pasiūlymą.
│ +- **Pilotas:** `research/wiki/guidelines/pilotai.md` — P-023 (dvi fiksuotos džiūvimo padėtys; nustatymas keičiamas tik drėgnoje padėtyje; trys batai iš to paties `art.boot` kvietimo, kad dydis netaptų paaiškinimu).
│ +- **Pamoka:** `research/wiki/guidelines/pamokos.md` — LL-170 (eilutė su dviem temos dalimis ir vienu moduliu negali būti `covered`). Ta pati problema užrašyta `research/wiki/guidelines/klausimai.md` su pasiūlymu programos derintojui skaidyti eilutę arba įvesti `parts`.
│ +- **Neliesta:** `content/**` (juodraštis ištrintas), `assets/**`, `docs/**`, `AGENTS.md`. `backlog.json` netaisytas — tai ne metodininko failas.
│
│  ## 2026-11-24 (06:45) — Publikavimo patikra #495: repo 73 / paskelbta 73 prie `643c3114`, garsas 2 124/2 124 ir **dydžiai 2 124/2 124** (naujas matavimas); sutampa
│
│ research/wiki/grades/01/metodai.md
│ @@ -1606,7 +1606,7 @@
│  Dešimt savybių, kurių negalima praleisti:
│
│  - **Vienas kintamasis:** `content` — kas bato viduje. Abiejų lyčių, spalvos ir dydžio skirtumo nėra: visi trys batai iš to paties `art.boot` kvietimo su tais pačiais parametrais, tik skirtingu `x`. Tai modelio teiginys, o ne dekoracija.
│ -- **Geometrija 360 px:** `viewBox="0 0 340 300"`, `max-width:340px`, `width:100%`; grindų juosta `art.plank(8, 232, 324, 10)`; batų bazė `baseY = 232`, centrai `x = 62 / 170 / 278`, mastelis `s = 0.9` (batas ≈ 92 × 76 px, tarpai 16 px). Užrašas po batu — 12,5 px, `text-anchor:middle`, `y = 262`; jis privalo tilpti į savo 92 px langelį (`Nieko`, `Laikraštis`, `Įdėklas`, `Susilinko`, `Liko apvali`), todėl ilgiausias užrašas „Liko apvali“ rašomas dviem eilutėmis (`tspan`), o ne mažinamas šriftas (LL-06, LL-30). Jokio horizontalaus slinkimo.
│ +- **Geometrija 360 px:** `viewBox="0 0 340 300"`, `max-width:340px`, `width:100%`; grindų juosta `art.plank(8, 232, 324, 10)`; batų bazė `baseY = 232`, centrai `x = 62 / 170 / 278`, mastelis `s = 0.9` (batas ≈ 92 × 76 px, tarpai 16 px). Užrašas po batu — `font-size:var(--fs-s)` (15,2 px), `text-anchor:middle`, `y = 262`; ranka rašyti `font-size` negalima, nes LL-164 parodė, kad `.72rem` (11,5 px) praeina visus vartus ir lieka per mažas vaikui. Užrašas privalo tilpti į savo 92 px langelį (`Nieko`, `Laikraštis`, `Įdėklas`, `Susilinko`, `Liko apvali`): ilgiausias rašomas dviem eilutėmis (`tspan`), o jei vis tiek netelpa — trumpinamas žodis („Apvali“), o ne šriftas (LL-06, LL-30). Jokio horizontalaus slinkimo.
│  - **Įėjimai ir klaviatūra:** trys bato mygtukai (88 × 76 px ekrane — ≥ 48 px), „Palauk“ / „Palauk dar“, trys spėjimo mygtukai, „Iš naujo“; visi `<button>`. `Tab` eilė: batas 1 → batas 2 → batas 3 → „Palauk“; kai rodoma spėjimo juosta — trys spėjimai; `Enter` / `Space` aktyvuoja. `aria-label` sako būseną žodžiais („Pirmas batas. Viduje nieko. Bakstelėk, kad pakeistum.“), ne vien spalvą; `aria-live="polite"` — `readout`.
│  - **Fokusas** (LL-32): paspaudus batą fokusas lieka tame bate (turinys sukasi ratu, todėl nereikia atskiro pasirinkimo meniu); paspaudus „Palauk“ be spėjimo — fokusas į pirmą spėjimo mygtuką; pasirinkus spėjimą — į „Palauk dar“; po antro paspaudimo — į „Iš naujo“. Sušalę batai žymimi `aria-disabled="true"` ir lieka fokusuojami, kad fokusas neprapultų, o bandymas juos pakeisti paaiškinamas `api.note`.
│  - **Grįžtamasis ryšys** paaiškina **kodėl**, o ne „teisingai“: `readout` įvardija, ką vaikas mato („Visi trys susilinko“), `api.note` — kodėl („…nes nė viename nebuvo nieko“). Niekada „neteisingai“ (T2.3, T5.1).
│ research/wiki/grades/01/metodai.md
│ @@ -1550,7 +1550,7 @@
│  4. **Simbolis — užrašas po batu.** Antras „Palauk“ užbaigia džiūvimą; po kiekvienu batu atsiranda jo paties užrašas: „Susilinko“ arba „Liko apvali“, o bato nosis nebekinta. Vaikas pasako taisyklę savais žodžiais: „batas išdžiūsta toks, koks yra džiūdamas“. Tikslas: žodį susieti su tuo, ką jis pats padarė, o ne su ekrano tekstu.
│  5. **Perkėlimas į tris vietas.** Šlapias popieriaus lapas, sulenktas ir padžiovintas; šlapias diržas, džiūvantis susuktas; šlapios pirštinės, numestos susmukusios. Vaikas kiekvienoje situacijoje pasako, kokia forma bus po džiūvimo ir ką reikėjo padaryti, kol daiktas šlapias. Tikslas: taisyklė apie medžiagą, kuri šlampa, o ne apie vieną batą.
│
│ -**Privalomas spėjimo žingsnis.** Vienas spėjimas per vieną džiūvimą, trys variantai: „Visi trys liks apvalūs“ / „Visi trys susilinks“ / „Skirsis“. Spėjimas pasirenkamas **prieš** pirmą „Palauk“ ir lieka matomas virš scenos iki pabaigos; po džiūvimo jis parodomas šalia rezultato („Tavo spėjimas: skirsis“), bet niekada nevadinamas klaida (LL-15). Be spėjimo modelis virsta animacija: vaikas žiūri, kaip keičiasi nosis, bet negali pasakyti, ko tikėjosi.
│ +**Privalomas spėjimo žingsnis.** Vienas spėjimas per vieną džiūvimą, trys variantai: „Visi trys liks apvalūs“ / „Visi trys susilinks“ / „Skirsis“. Spėjimas pasirenkamas po pirmo „Palauk“ ir dar **prieš** tai, kai batai pradeda džiūti (spėjimas paleidžia džiūvimą); jis lieka matomas virš scenos iki pabaigos ir po džiūvimo parodomas šalia rezultato („Tavo spėjimas: skirsis“), bet niekada nevadinamas klaida (LL-15). Be spėjimo modelis virsta animacija: vaikas žiūri, kaip keičiasi nosis, bet negali pasakyti, ko tikėjosi.
│
│  **Simuliacijos specifikacija.** Komponentas `batas`, failas `assets/js/sims/technologijos.js` (registracija: `SIMS` bloke, `technologijos.js:1847–1853`, eilutė `"batas": batas,` po `"valdiklis"`). Batas piešiamas kaip nauja `art.js` dalis `boot(x, baseY, s, sag, content)` — vienas kelias nosiai ir vienas kulnui, o `sag` (0–1) lenkia nosies viršų ir įjungia raukšlės liniją; `content` rodo, kas kyšo iš bato angos (nieko / baltas laikraštis / pilkas įdėklas). `art.js` jau turi `plank`, `block`, `pictogram`, `drops`, todėl grindų juostai ir vandens lašams naujų formų nereikia. `config`:
│
Baigta. Šiame paleidime parašytas vienas metodas, vienas pasiūlymas ir trys wiki įrašai.

KĄ PARAŠIAU

1) research/wiki/grades/01/metodai.md — M-16 „Batas išdžius toks, koks
   džiūsta“ (nauja 140 eilučių sekcija, frontmatter data atnaujinta).
   Tikslas: content/lt/grade-01/technologijos/08-avalynes-dziovinimas.json
   (technologijose užimti 01, 02, 03, 06, 07).

   Viena idėja: formą fiksuoja džiūvimo pabaiga, o ne šlapimas. Modelis —
   trys vienodi šlapi batai; vaikas pats nustato vienintelį kintamąjį (kas
   viduje: nieko / laikraštis / įdėklas), spėja, tada spėjimu paleidžia
   džiūvimą ir antru paspaudimu jį užbaigia. Kol „džiūsta“ — turinį dar
   galima pakeisti ir nosis išsitiesia; kai „sausa“ — nebegalima. Būsena
   išvedama (sag(content, stage), outcome(content)), config neturi lauko
   „kas nutinka, kai viduje nieko“ — ta pati taisyklė kaip M-07, M-13, M-15.
   Specifikacijoje yra 5 žingsnių seka, 10 būsenų lentelė su readout ir
   api.note, config JSON, geometrija 360 px, fokaso taisyklės (LL-32),
   api.progress tik po mišraus rezultato (LL-17, LL-29), 4 užduotys
   (indeksai 1/0/1/1) su tipinėmis klaidomis, 5 modelio ribos, 5 DOI.

2) agents/proposals/2026-11-24-metodininkas-avalynes-dziovinimas.json —
   type: metodas, priority: high, 13 evidence įrašų su failų eilutėmis.

3) research/wiki/guidelines/pilotai.md — P-023 (hipotezė, ką keičiame,
   matavimas, atsarginiai sprendimai).

4) research/wiki/guidelines/pamokos.md — LL-170 (naujas defekto tipas:
   eilutėje du temos dalykai, modulyje vienas, o būsena `covered`).

5) research/wiki/guidelines/klausimai.md — `backlog.json` eilutės
   D:drabuziu-prieziura padengties klaida su pasiūlymu programos derintojui.

6) research/wiki/changelog.md — įrašas 2026-11-24 (08:35).

KĄ PATAISIAU IDEATORIAUS TEKSTE (IR SAVO)

#44721 siūlė tris iš anksto prikimštus batus ir laiko slankiklį. Be vaiko
valdomo kintamojo modelis tampa iliustracija (gairių P2), o slankiklis su
valandomis įneša antrą sąvoką 1 klasei (T1.2). Todėl: turinį nustato vaikas,
laikas — dvi fiksuotos padėtys. Ideatoriaus teiginį „be įdėklo nosis
sulinksta“ paverčiau modelio atveju, o ribose pasakiau, kad kietas batas gali
išsilaikyti ir be įdėklo (LL-18). Ideatoriaus šaltinius (wikishoes.org,
jihua3515.com) pakeičiau DOI šaltiniais.

PATIKRA (realūs paleidimai, ne ketinimai)

  juodraštinis modulis laikinai įrašytas target kelyje, tada ištrintas:
      validate_content.check_module → 0 klaidų, 1 įspėjimas
      check_language.check_module   → 0 radinių
  pirmoji versija davė tikrą radinį — big_idea sakinys 14 žodžių (riba 10)
      ir 4 klausimai be klausiamojo žodžio; abu pataisyta, ne apeita.
  po ištrynimo:
      validate_content.py --grade 1 --strict → 0 klaidų, 0 įspėjimų
      check_language.py --grade 1 --strict   → 0 klaidų, 0 įspėjimų
      check_lessons.py → 170 įrašų, visi su 4 laukais
      check_docs_facts.py → sutampa
      check_registry.py --grade 1 → 73/73/322/73/73, našlaičiai 0
      check_agents.py rc 0 (1 senas įspėjimas, ne mano)
  git status: content/ ir assets/ neliesti; liko 5 wiki failai + 1 pasiūlymas.

KO NEDARIAU

- Modulio nesukūriau (tai kūrėjo darbas) — todėl ataskaitos pirma eilutė be
  „ĮGYVENDINTA:“: #44721 tikslo failas 08-avalynes-dziovinimas.json dar
  neegzistuoja, o pasiūlymas liko eilėje.
- Įspėjimas apie sim.config gyvumą paliktas sąmoningai: komponento `batas`
  kūno nėra, tad LL-61 patikrinti negalima. Tai turės padaryti tas, kas rašys
  sim į technologijos.js.
- backlog.json netaisytas — tai ne metodininko failas; klaida aprašyta
  klausimai.md ir paversta pamoka LL-170.
- Naršyklės zondo 360 px nėra: modulio ir komponento dar neegzistuoja.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-827a722aaaeb0ea9196475b101be81ebb90d6c7f2bf685b7a244c23d6c7031a1
```
