# programos-derintojas — 2026-11-23T1503

- paleidimas: #483 (manual)
- trukmė: 592s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ agents/proposals/2026-11-23-programos-derintojas-ketvircio-posukiai-2-klase.json
│ @@ -0,0 +1,20 @@
│ +{
│ +  "role": "programos-derintojas",
│ +  "run_id": 483,
│ +  "created": "2026-11-23T15:08:00+02:00",
│ +  "type": "atitiktis",
│ +  "title": "Ketvirčio posūkiai — 2 klasės plėtotė, o modulis juos moko kaip 1 klasės branduolį",
│ +  "body": "Modulio 32-transformacijos-konstravimas visas modelis ir visos penkios užduotys moko ketvirčio apskritimo posūkių: žymė iš viršaus eina į dešinę, keturi ketvirčiai grąžina ją į pradžią. Programos 1 klasės Transformacijų aprašas ketvirčių nemini — jame lieka padėties apibūdinimas, pasisukimas kairėn/dešinėn, pagal/prieš laikrodžio rodyklę ir 3 žingsniai pirmyn/atgal (sources/pradinio-bp-rekomendacijos-2024.txt:34017–34019). Ketvirčio posūkiai įvardyti kaip 2 klasės plėtotė: „2-oje klasėje ši tema bus plėtojama plačiau: mokiniai mokysis kurti tam tikrą vietą vaizduojančius planus, sukurti ir vykdyti kelių žingsnių instrukciją, susijusią su judėjimu tame plane, įskaitant pusės ar ketvirčio apskritimo posūkius“ (:1021–1022). Modulio sources paskutinį sakinį priskiria 1 klasei, nors jis yra 2 kl. pastraipoje — citata dokumente egzistuoja, todėl joks vartas jos nepagauna. Siūloma: (a) perrašyti outcomes ir 1–2 užduotis taip, kad mokymosi tikslas būtų 1 kl. turinys — kryptis pagal/prieš laikrodžio rodyklę ir padėties pokytis, o ratas liktų stebėjimo priemonė, ne ketvirčių aritmetika; (b) „kiek ketvirčių grąžina į pradžią“ ir panašias užduotis atidėti 2 klasei; (c) sources citatą perskaidyti į du sakinius su klasių žymomis, kad 1 kl. ir 2 kl. teiginiai nebesilietų. Jei ketvirčiai paliekami branduolyje, modulis turi būti perkeliamas į 2 klasę, o ne lieka 1 klasėje.",
│ +  "target": "content/lt/grade-01/matematika/32-transformacijos-konstravimas.json",
│ +  "priority": "high",
│ +  "status": "new",
│ +  "evidence": [
│ +    "content/lt/grade-01/matematika/32-transformacijos-konstravimas.json:5 — title „Ketvirtis rato pagal laikrodžio rodyklę“",
│ +    "content/lt/grade-01/matematika/32-transformacijos-konstravimas.json:10–11 — outcomes „Pasakau, kur atsidurs žymė po ketvirčio rato“ ir „kodėl keturi ketvirčiai grąžina žymę į pradžią“",
│ +    "content/lt/grade-01/matematika/32-transformacijos-konstravimas.json:108 — sources teiginys „atlikti pusės ar ketvirčio apskritimo posūkius“ priskirtas 1 klasei",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:34017–34019 — „1 klasė. Transformacijos… pasisukti kairėn/dešinėn, pagal/prieš laikrodžio rodyklę; paeiti 3 žingsnius pirmyn/atgal“ (ketvirčių nėra)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:1021–1022 — „2-oje klasėje… įskaitant pusės ar ketvirčio apskritimo posūkius“",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:17306 — 1 kl. metų plane „Transformacijos 4“ (be ketvirčių)",
│ +    "research/wiki/curriculum/matematika-1-klase.md §4.3 ir §9 — šios patikros įrašas"
│ +  ]
│ +}
│ agents/proposals/2026-11-23-programos-derintojas-dvizenklis-plius-dvizenklis.json
│ @@ -0,0 +1,19 @@
│ +{
│ +  "role": "programos-derintojas",
│ +  "run_id": 483,
│ +  "created": "2026-11-23T15:09:00+02:00",
│ +  "type": "tema",
│ +  "title": "Trūksta programos atvejo: dviženklis + dviženklis neperžengiant dešimties (16 + 12)",
│ +  "body": "Programa 1 klasei įvardija lygiai tris sudėties ir atimties atvejus: vienaženklių skaičių peržengiant dešimtį, dviženklio ir vienaženklio skaičių peržengiant dešimtį ir dviženklių skaičių neperžengiant dešimties (sources/pradinio-bp-rekomendacijos-2024.txt:33520–33521). Trečiasis atvejis dokumente iliustruotas būtent pavyzdžiu „16 + 12 = ▢“ (:33527), o jo atitikmuo atimčiai yra 28 − 12. Platformoje pirmus du atvejus moko 22-sudetis-per-desimti, atimtį per dešimtį — 29-atimtis-per-desimti, bet trečiojo atvejo nemoko nė vienas modulis: 22 simuliacijos dėmenys yra tik vienaženkliai (config first [7, 8, 9], second [4, 5, 6]). Tema turi aiškų interaktyvumo potencialą: vaikas stato 16 ir 12 iš dešimčių strypelių ir vienetų kubelių, mato, kad susidaro dvi dešimtys ir aštuoni vienetai, o nauja dešimtis nesusidaro — tai priešingybė 22 modeliui, kuriame dešimtukas sąmoningai papildomas. Siūlomas modulis „Dviženklis plius dviženklis be perėjimo“: du rezultatai (sudedu dešimtis su dešimtimis ir vienetus su vienetais, kai vienetai neperžengia dešimties; paaiškinu, kodėl 16 + 12 = 28, o ne 218 ar 38), 4 užduotys su hint ir why, viena optional su atimtimi 28 − 12. Simuliacijos idėja — dvi strypelių-kubelių juostos, kurios liejasi į vieną; skaičius ant juostos atsiranda tik tada, kai abi dalys sudėtos.",
│ +  "target": "content/lt/grade-01/matematika/34-dvizenklis-plius-dvizenklis.json",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:33520–33521 — trys privalomi 1 kl. sudėties ir atimties atvejai",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:33527 — pavyzdys „16 + 12 = “",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:17312 — 1 kl. metų plane „Sudėtis ir atimtis 41“ valanda",
│ +    "content/lt/grade-01/matematika/22-sudetis-per-desimti.json:26–27 — sim dėmenys tik vienaženkliai (first [7,8,9], second [4,5,6])",
│ +    "content/lt/grade-01/matematika/29-atimtis-per-desimti.json — atimties per dešimtį atvejis, ne dviženklis − dviženklis",
│ +    "research/wiki/curriculum/matematika-1-klase.md §2.2 ir §9.2 — atvejų lentelė ir šios patikros išvada"
│ +  ]
│ +}
│ agents/proposals/2026-11-23-programos-derintojas-skaiciu-tiese-100.json
│ @@ -0,0 +1,18 @@
│ +{
│ +  "role": "programos-derintojas",
│ +  "run_id": 483,
│ +  "created": "2026-11-23T15:10:00+02:00",
│ +  "type": "atitiktis",
│ +  "title": "Skaičių tiesė apsiriboja 20, nors 1 klasės programa — 0–100",
│ +  "body": "Programa 1 klasei aprašo skaičius nuo 0 iki 100 ir kaip atskirą objektą — skaičių tiesę: „1 klasė. Skaičiai nuo 0 iki 100… Tyrinėjama, kaip sudaryta 100-o skaičių lentelė, skaičių tiesė“ (sources/pradinio-bp-rekomendacijos-2024.txt:33739–33740).

… PRALEISTA 12170 SIMBOLIŲ IŠ 30170 (įrankių išklotinės) — visa ataskaita: agents/work/programos-derintojas/00483/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

-stulpelis` | atitinka | „registruoti renkamus duomenis, kai yra 2–3 stebimo požymio reikšmės, pavaizduoti piktograma ar stulpine diagrama“ (`:23028–23031`); 1 kl. perskaityti (`:34044`) | Dažnių lentelė sąmoningai palikta 2 klasei (`:1108–1111`) |
│ +| `24-komandu-seka` | atitinka | komandų sekos 1–2 kl. (B1.3–B4.3, `:12277–12291`); „schema, piešiniu pavaizduoti nuosekliai atliekamų komandų seką“ (`:12308–12309`); metų plane „Algoritmai ir programavimas 8“ (`:17262–17263`) | Informatika integruota per matematiką, kaip numato programa |
│ +| `25-ilgis-ir-vienetas` | atitinka | metų plane „Ilgis 5“ (`:17300`), integruota veikla `:17301–17305`; „mato jausmas“ ir „spėti ir tikrinti“ (`:1010–1017`) | 1 kl. — sąlyginiai vienetai; cm ir mm — 2 kl. (`:1010–1017`) |
│ +| `26-mase-ir-kilogramas` | atitinka | „Susipažįstama su pagrindiniu masės matavimo vienetu kilogramu (kg)… kokių daiktų masę tinka/netinka apibūdinti šiuo vienetu“ (`:33783–33784`) | Modelis keičia tik dėžutę, svarstis ir svarstyklės lieka — priežastis matoma |
│ +| `27-skaicius-ir-skaitmuo` | atitinka | „Aptariamos skaičiaus ir skaitmens sąvokos. Tyrinėjama, kaip sudaryta 100-o skaičių lentelė“ (`:33739–33740`) | „Dešimtys / vienetai“ dokumente 1 kl. neįvardyti tiesiogiai; jie kyla iš 100 lentelės sandaros (`19`) ir atgalinio skaičiavimo per dešimtį (`30`). T4 variantai suformuluoti „Taip / Ne“ į „kas daugiau“ klausimą — kalbos, ne programos defektas |
│ +| `28-uzdavinio-klausimas` | atitinka | vieno veiksmo uždaviniai: kiek iš viso, likutis, keliais mažiau (`:774–780`); dviejų žingsnių — 2 kl. (`:778–780`) | T3 („kiek nuskrido“ — jau parašyta) moko skaityti sąlygą, ne skaičiuoti |
│ +| `29-atimtis-per-desimti` | atitinka | dviženklis − vienaženklis per 10 (`:692–699`, `:33520–33521`) | 13 − 9, 12 − 8, 14 − 8 — programos atvejis |
│ +| `30-skaiciavimas-atgal-per-desimti` | atitinka | „skaičiuoti pirmyn ir atgal nuo bet kurio skaičiaus“ (`:33739`) | Po 30 eina 29 — būtent dešimčių skaitmens kaita |
│ +| `32-transformacijos-konstravimas` | **NEATITINKA** | 1 kl. Transformacijos — padėties apibūdinimas, kryptis, 3 žingsniai (`:34017–34019`); „pusės ar ketvirčio apskritimo posūkius“ — **2 kl.** plėtotė (`:1021–1022`, `:12347–12356`); 1 kl. plane „Transformacijos 4“ (`:17306`), bet be ketvirčių | Visas modelis ir visos 5 užduotys — ketvirčio posūkiai (failas `:5`, `:10–11`). `sources` (`:108`) paskutinį sakinį priskiria 1 kl., nors jis yra 2 kl. pastraipoje. Pasiūlymas `2026-11-23-programos-derintojas-ketvircio-posukiai-2-klase.json` |
│ +| `33-trukstamas-demuo` | atitinka | trūkstamas skaičius lygybėse; pavyzdys „▢ + ▢ = 18… tris skirtingus variantus“ (`:33521–33522`, `:33533`) | Keli sprendiniai — programos pavyzdžio esmė |
│ +
│ +### 9.1. Trys taisyklės, kuriomis remiasi lentelė
│ +
│ +1. **1 kl. metų planas yra turinio liudininkas.** Plane (`:17218–17312`) 100 val. ir temos: „Skaičiai nuo 0 iki 100
│ +   12+3“, „Sudėtis ir atimtis 41“, „Sekos 5“, „Algoritmai ir programavimas 8“, „Finansinis raštingumas 4“,
│ +   „Masė, laikas 5“, „Ilgis 5“, „Transformacijos 4“, „Plokščios figūros 5“, „Erdvės figūros 3“, „Duomenys 8“.
│ +   Tema, kurios šiame plane nėra, 1 klasei nepriklauso.
│ +2. **Ketvirčio posūkiai — 2 kl., ne 1 kl.** Tas pats žodžių junginys kartojasi 2 kl. lentelėje (`:12356`), todėl
│ +   citatos paieška dokumente jo „neišduoda“: sakinys egzistuoja, tik ne toje klasėje.
│ +3. **1 kl. matematikoje nėra D tipo kodų.** 9 skyriuje 1 kl. aprašoma temomis („1 klasė. Sudėtis ir atimtis“),
│ +   o ne pasiekimų kodais; kodų priskyrimas 1 kl. moduliui yra netikslus, jei jis nėra cituojamas iš kito dalyko
│ +   (pvz., informatikos B1.3–B4.3, kurie galioja 1–2 kl. juostai).
│ +
│ +### 9.2. Ko 1 kl. matematikos moduliai dar neapima
│ +
│ +- **Dviženklis + dviženklis neperžengiant dešimties** (16 + 12 = ▢, `:33520–33521`, `:33527`). Nė vienas modulis
│ +  šio atvejo nemoko; `22` sim dėmenys yra tik vienaženkliai (`22-sudetis-per-desimti.json:26–27`). Siūlomas
│ +  modulis `34-dvizenklis-plius-dvizenklis` (pasiūlymas `2026-11-23-programos-derintojas-dvizenklis-plius-dvizenklis.json`).
│ +- **Dviženklis − dviženklis neperžengiant dešimties** (28 − 12) — tas pats atvejis atimčiai; turėtų būti to paties
│ +  modulio `optional` užduotis.
│ +- **Skaičių tiesė iki 100** — `04` sim `max: 20`; 100 lentelė (`19`, `30`) ir sudėtis per dešimtį (`22`, `29`) jau
│ +  naudoja visą ruožą, todėl tiesė lieka vienintelė modelio spraga (§9 lentelė, `04`).
│ +
│ +### 9.3. Rastas neatitikimas
│ +
│ +**`32-transformacijos-konstravimas` moko 2 klasės turinio.** Modulio `title` — „Ketvirtis rato pagal laikrodžio
│ +rodyklę“, abu `outcomes` kalba apie ketvirčius (`:10–11`), visos penkios užduotys — apie ketvirčio posūkį ir keturių
│ +ketvirčių grįžimą. 1 klasės programos sakinys (`:34017–34019`) ketvirčių nemini; jie įvardyti kaip 2 klasės plėtotė
│ +(`:1021–1022`). Defektas nematomas citatos vartams: `sources` (`:108`) cituoja realų dokumento sakinį, tik tas
│ +sakinys priklauso 2 kl. pastraipai. Taisymo kryptis — susiaurinti branduolį iki 1 kl. krypties ir padėties pokyčio,
│ +o ketvirčių aritmetiką atidėti 2 klasei.
│ +
│ … omitted 4 diff line(s) across 1 additional file(s)/section(s)
│ research/wiki/curriculum/matematika-1-klase.md
│ @@ -161,7 +161,7 @@
│  > „**1 klasė. Duomenys ir jų interpretavimas.** Mokomasi **perskaityti piktogramoje, stulpelinėje diagramoje** pateikiamą informaciją, ja remtis atsakant į pagrindinį tyrimo klausimą.“
│  > — *9 skyrius*
│
│ -Naujovė: „Duomenis mokiniai mokysis pavaizduoti ne tik grafiškai (piktograma ar stulpeline diagrama), bet ir **dažnių lentele**“ (*Duomenys ir tikimybės, 1–2 klasė*), tačiau aiškinamasis tekstas dažnių lentelę priskiria **2 klasei** („jau 2-oje klasėje“). 1 klasei saugiausia laikyti: **piktograma + stulpelinė diagrama**, dažnių lentelė — [PATIKRINTI].
│ +Naujovė: „Duomenis mokiniai mokysis pavaizduoti ne tik grafiškai (piktograma ar stulpeline diagrama), bet ir **dažnių lentele**“ (*Duomenys ir tikimybės, 1–2 klasė*), tačiau aiškinamasis tekstas dažnių lentelę priskiria **2 klasei** („jau 2-oje klasėje“, `:1108–1111`). 1 klasei saugiausia laikyti: **piktograma + stulpelinė diagrama**; dažnių lentelė — 2 kl. (`:1108–1111`).
│
│  ## 7. Ką 1-okas turi mokėti metų gale
│
│ research/wiki/curriculum/matematika-1-klase.md
│ @@ -227,8 +227,8 @@
│     Tema, kurios šiame plane nėra, 1 klasei nepriklauso.
│  2. **Ketvirčio posūkiai — 2 kl., ne 1 kl.** Tas pats žodžių junginys kartojasi 2 kl. lentelėje (`:12356`), todėl
│     citatos paieška dokumente jo „neišduoda“: sakinys egzistuoja, tik ne toje klasėje.
│ -3. **1 kl. matematikoje nėra D tipo kodų.** 9 skyriuje 1 kl. aprašoma temomis („1 klasė. Sudėtis ir atimtis“),
│ -   o ne pasiekimų kodais; kodų priskyrimas 1 kl. moduliui yra netikslus, jei jis nėra cituojamas iš kito dalyko
│ +3. **1 kl. matematikoje pasiekimai aprašomi temomis, o ne kodais.** 9 skyriuje 1 kl. rašoma „1 klasė. Sudėtis ir
│ +   atimtis“), o ne A1.1 tipo kodu; kodų priskyrimas 1 kl. moduliui yra netikslus, jei jis nėra cituojamas iš kito dalyko
│     (pvz., informatikos B1.3–B4.3, kurie galioja 1–2 kl. juostai).
│
│  ### 9.2. Ko 1 kl. matematikos moduliai dar neapima
│ agents/proposals/2026-11-23-programos-derintojas-dvizenklis-plius-dvizenklis.json
│ @@ -11,7 +11,7 @@
│    "evidence": [
│      "sources/pradinio-bp-rekomendacijos-2024.txt:33520–33521 — trys privalomi 1 kl. sudėties ir atimties atvejai",
│      "sources/pradinio-bp-rekomendacijos-2024.txt:33527 — pavyzdys „16 + 12 = “",
│ -    "sources/pradinio-bp-rekomendacijos-2024.txt:17312 — 1 kl. metų plane „Sudėtis ir atimtis 41“ valanda",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:17246 — 1 kl. metų plane „Sudėtis ir atimtis 41“ valanda",
│      "content/lt/grade-01/matematika/22-sudetis-per-desimti.json:26–27 — sim dėmenys tik vienaženkliai (first [7,8,9], second [4,5,6])",
│      "content/lt/grade-01/matematika/29-atimtis-per-desimti.json — atimties per dešimtį atvejis, ne dviženklis − dviženklis",
│      "research/wiki/curriculum/matematika-1-klase.md §2.2 ir §9.2 — atvejų lentelė ir šios patikros išvada"
│ research/wiki/curriculum/matematika-1-klase.md
│ @@ -228,7 +228,7 @@
│  2. **Ketvirčio posūkiai — 2 kl., ne 1 kl.** Tas pats žodžių junginys kartojasi 2 kl. lentelėje (`:12356`), todėl
│     citatos paieška dokumente jo „neišduoda“: sakinys egzistuoja, tik ne toje klasėje.
│  3. **1 kl. matematikoje pasiekimai aprašomi temomis, o ne kodais.** 9 skyriuje 1 kl. rašoma „1 klasė. Sudėtis ir
│ -   atimtis“), o ne A1.1 tipo kodu; kodų priskyrimas 1 kl. moduliui yra netikslus, jei jis nėra cituojamas iš kito dalyko
│ +   atimtis“, o ne „A1.1“ tipo kodu; kodų priskyrimas 1 kl. moduliui yra netikslus, jei jis nėra cituojamas iš kito dalyko
│     (pvz., informatikos B1.3–B4.3, kurie galioja 1–2 kl. juostai).
│
│  ### 9.2. Ko 1 kl. matematikos moduliai dar neapima
PATIKRA ATLIKTA — 1 klasė, matematika (visi 23 moduliai, paleidimas #483)

Verdiktai (23): atitinka 21, iš dalies 1, neatitinka 1.

NEATITIKIMAS
  32-transformacijos-konstravimas — moko 2 klasės turinio.
    Modulio title (:5), abu outcomes (:10–11) ir visos 5 užduotys — ketvirčio apskritimo
    posūkiai. 1 kl. Transformacijų aprašas baigiasi padėtimi, kryptimi ir 3 žingsniais
    (:34017–34019); ketvirčiai įvardyti kaip 2 kl. plėtotė: „2-oje klasėje ši tema bus
    plėtojama plačiau… įskaitant pusės ar ketvirčio apskritimo posūkius“ (:1021–1022).
    1 kl. metų plane yra „Transformacijos 4“ (:17306), bet be ketvirčių.
    Defektas nematomas citatos vartams: sources (:108) cituoja realų dokumento sakinį,
    tik jis priklauso 2 kl. pastraipai (:12347–12356).

IŠ DALIES
  04-skaiciu-tiese — sim max 20 (:26), visos užduotys ≤ 19, nors 1 kl. skaičių tiesė
    yra 0–100 (:33739–33740). Pats teacher.goal (:85) tai pripažįsta.

SPRAGOS (programoje privaloma, modulio nėra)
  - dviženklis + dviženklis neperžengiant dešimties — 16 + 12 = ▢ (:33520–33521, :33527);
    22 sim dėmenys tik vienaženkliai (:26–27).
  - dviženklis − dviženklis neperžengiant dešimties (28 − 12) — tas pats atvejis atimčiai.
  - skaičių tiesė 0–100 — tik 04 spraga (žr. aukščiau).

PAKEISTI FAILAI
  research/wiki/curriculum/matematika-1-klase.md
    §9 perrašytas: 23 modulių lentelė su citatomis ir eilučių numeriais, §9.1 trys
    taisyklės, §9.2 trys spragos, §9.3 neatitikimas. §4.3 papildytas ketvirčių klasės
    riba. §5 Ilgis eilutė patikslinta ir senas [PATIKRINTI] išspręstas: 1 kl. metų plane
    „Ilgis 5“ (:17300). Taip pat paaiškėjo, kad seni 05 ir 15 verdiktai (2026-11-05)
    nebegalioja — „pusė deimtuko“ išimta, 24 val. sistema atsirado 20 modulyje.
  research/wiki/guidelines/pamokos.md
    LL-158 — Citata teisinga, bet paimta iš kitos klasės pastraipos.
  agents/state.json
    last_curriculum_check atnaujintas (run 483), senasis įrašas paliktas previous.

PASIŪLYMAI (3)
  agents/proposals/2026-11-23-programos-derintojas-ketvircio-posukiai-2-klase.json
    atitiktis/high → 32-transformacijos-konstravimas.json
  agents/proposals/2026-11-23-programos-derintojas-dvizenklis-plius-dvizenklis.json
    tema/normal → naujas 34-dvizenklis-plius-dvizenklis.json
  agents/proposals/2026-11-23-programos-derintojas-skaiciu-tiese-100.json
    atitiktis/normal → 04-skaiciu-tiese.json

PATIKRA
  validate_content.py --grade 1 --strict → 0 klaidų / 0 įspėjimų, rc 0
  validate_content.py --strict → 0/0, rc 0 (turinio nekeista)
  check_lessons.py → 158 įrašai, visi su 4 laukais, rc 0
  check_docs_facts.py → 0/0
  check_agents.py → 15 vaidmenų, 1 įspėjimas (buvo prieš)
  Visos 33 cituotos šaltinio eilutės perskaitytos grep/awk; 3 pasiūlymų JSON validūs.

Nedaryta sąmoningai: 07-desningumai T1 skaitmeninė seka palikta kaip pastaba (branduolys —
objektų sekos atitinka; „įvairios skaičių sekos“ — 2 kl., :921–922), nes tai viena užduotis,
ne modulio kryptis. 27-skaicius-ir-skaitmuo T4 variantų formuluotė („Taip / Ne“ į „kas
didesnis“) — kalbos defektas, ne programos; perduota ateičiai, ne šiam vaidmeniui.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-271bb615c1023a23cddfb483d0e52d1809fe56b21044dce2385dd64b23890e0b
```
