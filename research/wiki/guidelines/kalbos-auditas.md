# Kalbos auditas — 1 klasė (31 modulis)

- **Data:** 2026-11-08
- **Paleidimas:** #137 (kalbu-redaktorius, auditinis paleidimas — nieko neperrašyta)
- **Apimtis:** visi 31 `content/lt/grade-01/*/*.json` moduliai, vaikui rodomi laukai: `title`, `subtitle`, `outcomes`, `concept.*`, `reflect`, `tasks[].q/options/hint/why`, `sim.config` tekstai. `teacher.*` — ne (suaugusiojo tekstas).
- **Snapshotas:** HEAD `0504a80` (#136). Per auditują kitas agentas pervadino `21-erdvines-figuras.json` → `21-erdvines-figuros.json`; visi cituoti radiniai patikrinti iš naujo `grep`'ais jau po to commit'o (LL-36).
- **Kaip vertinta:** iš 6–7 m. vaiko, kuris skaito lėtai, pusės. Sakinio ilgis matuojamas **ištariamai** (skaitmuo = 1 žodis, pvz. „14:00" tariama „keturiolika valandų"); įrankio (`check_language.py`) matavimas pateikiamas lygiai, kur skiriasi.

## Įrankio akumos (svarbu, kol skaitote lentelę)

`scripts/check_language.py` tikrina `title`, `subtitle`, `concept.*`, `reflect`, `sim.config`, `tasks[].q/options/hint/why`. **Jis visai netikrina `outcomes`** — o ten rasta 8 per ilgi (>10 ž.) sakiniai ir 3 žodžiai >13 raidžių. Be to:

1. Skaitmenys ne skaičiuojami žodžiais (`WORD_RE` tik raidės) — 11 atvejų ištariamai >10 žodžių, įrankžiui rodant ≤10.
2. Dviprasmiškumo taisyklės („arba", „nebūtinai") taikomos tik `tasks` laukams, ne `concept.steps`.
3. Veiksmažodžio formos ir nežodžiai (`aprasojęs`, `Pakėlei`) — jokie įrankis nepažįsta; reikia žmogaus akių arba žodyno pagrindo.

Dabartinė `check_language.py --grade 1` būsena: 0 klaidų, 4 įspėjimai (ilgi žodžiai), 22 pastabos (įvardis pradžioje). `validate_content.py --grade 1`: 0/0.

## Lentelė (41 radinys)

Sunkumas: **rimta** = vaikas supranta klaidingai ar nebegali skaityti; **vidutinė** = supranta, bet lėtas skaitytojas stoja; **smulki** = stilius/vieningumas. † — įrankis jau žymi (warn).

| # | Modulis | Laukas | Problema | Siūloma formuluotė | Sunkumas |
|---|---|---|---|---|---|
| 1 | 10-gyvunu-grupes | tasks[2].hint (eil. 58) | Užuomina nukreipia nuo atsakymo: „bet ne apie jos turinį" — o atsakymas „plunksnos" būtent ir yra pagalvės turinys; vaikas gauna priešingą nuorodą | „Pagalvok, kuo dengtas paukštis — ne kailis, ne žvynai." | rimta · **užtaisyta #144** |
| 2 | 16-vandens-busenos | concept.example (eil. 22) | „būna aprasojęs" — tokio žodžio nėra (norėta „užparęs"); vaikas negali suprasti | „Ryte vonios veidrodis būna užparęs." | rimta |
| 3 | 16-vandens-busenos | tasks[2].q (eil. 54) | „aprasojo" — taip pat nežodis | „Ryte vonios veidrodis užparojo. Kas jame?" | rimta |
| 4 | 01-garso-aukstis (muzika) | tasks[0].q (eil. 48) | „Pakėlei … nelietei" — neegzistuoja šios formos (2 asm.: pakėlai, nepalietei) | „Pakėlai aukštį, o garsumo ratuko nepalietei. Kas pasikeitė?" | rimta |
| 5 | 22-sudetis-per-desimti | concept.example (eil. 21) | „Du įdedi į pilną dešimtuką" — „du" skaitomas kaip skaičius arba kaip liepiamasis? Sakinys nelogiškas | „Dvi dėmes įdėk į pilną dešimtuką. Trys lieka." | rimta |
| 6 | 21-erdvines-figuros | outcomes[0] | 15 žodžių viename sakinyje; įrankis outcomes netikrina | „Skiriu kūną nuo jo vaizdo. Kūgis iš priekio atrodo kitaip nei iš viršaus." | rimta |
| 7 | 16-vandens-busenos | subtitle (eil. 6), outcomes[0] (eil. 9) | „neprapuola" — ne bendrinė forma, 2 vietose | subtitle: „Vanduo neišnyksta — jis keičia savo formą"; outcomes: „…vanduo neišnyksta, o būna ore kaip garas." | vidutinė |
| 8 | 16-vandens-busenos | concept.steps[3] (eil. 20) | „nubyra" — retas, neaiškus žodis | „Lašai nubėga atgal į puodą." | vidutinė |
| 9 | 04-skaiciu-tiese | outcomes[0] | 12 žodžių + „skaičių skaičių tiesėje" — netvarkinga | „Rodau skaičius skaičių tiesėje. Judu ja į dešinę arba į kairę." | vidutinė |
| 10 | 04-skaiciu-tiese | outcomes[1] | 11 žodžių | „Paaiškinu, kad pridėti — judėti į dešinę, o atimti — į kairę." | vidutinė |
| 11 | 19-simto-skaiciu-lentele | outcomes[1] | 11 žodžių | „Paaiškinu, kodėl po 19 žemiau stovi 29, o ne 20." | vidutinė |
| 12 | 22-sudetis-per-desimti | outcomes[0] | 11 žodžių | „Sudedu per dešimtį. Pirma papildau dešimtuką, paskui pridedu likusį." | vidutinė |
| 13 | 22-sudetis-per-desimti | outcomes[1] | 12 ištariamų žodžių (skaičiai) | „Paaiškinu, kodėl 8 + 5 patogu skaičiuoti per dešimtuką." | vidutinė |
| 14 | 17-judejimas | outcomes[1] | 11 žodžių | „Paaiškinu, kodėl rutuliai atrieda beveik kartu, nors sveria skirtingai." | vidutinė |
| 15 | 13-akmenelis-popierius | outcomes[2] | 11 žodžių | „Nustoju tikėti „karšta ranka". Rezultatas artėja prie trečdalio." | vidutinė |
| 16 | 13-akmenelis-popierius | concept.title, concept.example † | „Atsitiktinumas" (14 raidžių) — sąvoka būtina moduliui, tai terminas, ne stiliaus klaida | Terminą palikti; įrankio warn priimtinas. Jei trumpinama — tik aplinkiniai sakiniai | vidutinė |
| 17 | 07-desningumai | outcomes[0] (eil. 9) | „pasikartojančią" (15 raidžių); įrankis outcomes netikrina | „Pastebiu kartojančią seką, ją tęsiu ir randu trūkstamą narį." | vidutinė |
| 18 | 07-desningumai | concept.steps[2] (eil. 19), tasks[2].hint (eil. 146) | „prognozė" — sunkus žodis 1 klasei; `big_idea` ir užduotys kitur naudoja „numatyti" | „Tai jau numatymas, o ne spėjimas." / hint: „Pagalvok apie numatymą." | vidutinė |
| 19 | 01-garso-aukstis | concept.steps[2] (eil. 19) | „nebūtinai" — modalus neigimas, uždraustas 1 klasei (vaidmens taisyklė); tikrintuvas concept steps netikrina dviprasmiškumo | „Aukštas garsas gali būti tylus. Tylus garsas gali būti labai aukštas." | vidutinė |
| 20 | 12-bendradarbiavimo-tiltas | outcomes[0] (eil. 9) | „bendradarbiavimas" (17 raidžių) + „pasilikimas sau" — abstraktu 6–7 m. vaikui | „Paaiškinu, kodėl draugo pagalba eina toliau nei vienam." | vidutinė |
| 21 | 12-bendradarbiavimo-tiltas | title (eil. 5) † | „Bendradarbiavimo" (17 raidžių); keičiant reikia `index.json` title | Kūrėjo/dizainerio sprendimas: „Tiltas per upę" (3 ž.) | vidutinė |
| 22 | 04-kaip-zmones-sveikinasi | outcomes[0] (eil. 9) | „nesudėtingą kalbos vartojimo tyrimą" — vertinys iš suaugusių kalbos | „Stebiu, kaip žmonės sveikinasi, ir rašau, ką pastebėjau." | vidutinė |
| 23 | 02-medziagu-bandymas | tasks[1].q (eil. 55), tasks[3].q (eil. 77) | „…įmesti į vandenį" — dalyvis be pagalbinio veiksmažodžio; lėtas skaitytojas stoja | „Metalinį šaukštą ir medinę mentelę įmeta į vandenį. Kuri nusileis į dugną?" / „Mažą akmenuką ir didelį medinį rąstą įmeta į vandenį. Kas plauks?" | vidutinė |
| 24 | 09-augalo-gyvenimas | tasks[2].hint (eil. 59) | „kai pasėji" — neteisinga forma (2 asm.: pasėjai) | „Kas atsitinka pirmiausia, kai pasėjai?" | vidutinė |
| 25 | 11-saziningas-dalijimasis | tasks[1].opt[0] (eil. 42) | „tu dalijai" — neteisinga forma (refleksyvinė „dalijaisi" arba „padalinai") | „Sąžininga, nes tu padalinai." | vidutinė |
| 26 | 11-saziningas-dalijimasis | tasks[1].hint (eil. 47) | „jaustumeisi" — neegzistuoja tokia forma (1 dgs. sąlyginė: jaustumės) | „Kaip jaustumės, jei tau liktų 2?" | vidutinė |
| 27 | 01-garsas-ir-raide | tasks[1].opt[0] (eil. 111 → 122) | „Niekou" — rašyba (niekuo) | „Niekuo — tai tas pats." | vidutinė · **užtaisyta #362** |
| 28 | 23-piktograma-ir-stulpelis | tasks[2].q (eil. 59) | „Už mėlyną spalvą gavo 6 balsus" — trūksta veikėjo; lėtas skaitytojas neranda, kas gavo | „Už mėlyną spalvą buvo 6 balsai." | vidutinė |
| 29 | 18-taskas-tiese-spindulys-atkarpa | tasks[3].opt[1] (eil. 76) | „Taip, bet tik pusiau" — be prasmės šioje situacijoje (taškas negali dalinti pusiau) | „Taip, jei jis būtų ant tiesės." | vidutinė |
| 30 | 13-akmenelis-popierius | outcomes[0], outcomes[2] | 10 žodžių, bet 3 sunkūs žodžiai eilutėje (variantai lygūs, laimėjimas, atsitiktinumas) | „Paaiškinu, kodėl laimėjimas priklauso nuo atsitiktinumo." (8 ž.) | vidutinė |
| 31 | 21-erdvines-figuros | tasks[3].hint (eil. 90) | „Ar kuri n os pusė plokščia?" — netvarkinga konstrukcija | „Ar nors viena pusė plokščia?" | smulki |
| 32 | 21-erdvines-figuros | tasks[3].q → why (eil. 83, 91) | Sinonimas perpėtas be paaiškinimo: q „kamuolys", why „rutulys" | why: „Rutulys (kamuolys) apvalus iš visų pusių, o lėkštė plokščia." | smulki |
| 33 | 18-taskas-tiese-spindulys-atkarpa | tasks[2].q (eil. 62) | „nematome" — asmuo nesutampa su kitomis užduotimis (visur 2 asm.) | „Kodėl nubrėžtos tiesės galas nematomas?" | smulki |
| 34 | 18-taskas-tiese-spindulys-atkarpa | concept.example (eil. 22) | „ten, kur pakeli pieštuką" — kančiozna | „…ten, kur baigiasi piešimas." | smulki |
| 35 | 06-figuros | concept.example (eil. 21) | Trūksta kablelio po dalyvio | „Plytelę pasukus, ji lieka tokia pati." | smulki |
| 36 | 08-metu-laikai | tasks[2].why (eil. 60) | „migrantai" — spaudos žodis, ne vaikietiškas | „Žiemą skrendantys paukščiai rudenį išskrenda." | smulki |
| 37 | 08-metu-laikai | reflect (eil. 86) † | „mėgstamiausias" (14 raidžių), superlatyvas | „Kurį metų laiką tu myli daugiausia?" | smulki |
| 38 | 17-kryptys-ir-vieta | concept.steps[3] (eil. 20) | „Tikram žmogui" — šnekatinė forma | „Su tikru žmogiu kairę randi kitaip." | smulki |
| 39 | 14-pinigai | tasks[1].q (eil. 58), tasks[3].q (eil. 80), tasks[0].why (eil. 55) | „rinkinys" — abstraktesnis nei modulyje kitur vartojami „pinigai" (4 vietos) | „Kuris būdas sumokės tiksliai?" / „Kuriame būde mažiausiai pinigų?" / „…tad pinigai verti 3 eurų." | smulki |
| 40 | 20-laikas-12-ir-24-val | tasks[3].hint | „ką — po pietų" — elipsė su brūkšniu kančiozna | „Pagalvok, ką 2:00 reiškia naktį ir ką reiškia po pietų." | smulki |
| 41 | 01-garsas-ir-raide | outcomes[2] (eil. 11) | „prasidedančius" (14 raidžių); įrankis outcomes netikrina | „Randu kelis žodžius su ta pačia pirmąja raide." | smulki |

## Pasikartojantys modeliai

1. **`outcomes` — įrankio akloji dėmė.** 8 sakiniai >10 žodžių, 3 žodžiai >13 raidžių, sunkūs žodžiai — visi liko nematimi, nes `check_language.py` lauko visai neskaito (LL-52).
2. **Neegzistuojančios veiksmažodžio formos** (5 atvejai, 4 moduliai): „Pakėlei/nelietei", „pasėji", „tu dalijai", „jaustumeisi", „Niekou". Validatorius (diakritika, žodžiai) ir `check_language.py` (ilgis) juos nepagaužia — tik žmogaus akys arba žodyno pagrindas.
3. **Nežodis sakinio vietoje:** „aprasojęs / aprasojo" (16-vandens-busenos, 2 vietos) — norėta „užparęs / užparojo".
4. **Sunkus žodis ten, kur modulis turi kasdienį sinonimą:** „nebūtinai" (→ „gali būti tylus"), „prognozė" (→ „numatymas", kaip `big_idea`), „bendradarbiavimas" (→ „kartu"), „migrantai" (→ „žiemą skrendantys paukščiai"), „rinkinys" (→ „būdas / pinigai").
5. **Skaičių infliacija:** įrankis ne skaito skaitmenų žodžiais; 11 atvejų ištariamai >10 žodžių, kai įrankis rodo ≤10 (daugiausia `20-laikas-12-ir-24-val`, `13-akmenelis-popierius`). Smulki, bet lėtai skaitantis vaikas skaičius taria. Pastaba: santrumpos taškas („2 val.") daro sakinį dviem įrankio matuose — LL-35 šeima.
6. **Asmens nesutapimas:** klausime „…nematome?" (18-taskas) tarp 2 asm. liepiamųjų; „Jo nematome" (16-vandens steps) — priimtina bendrinė pastaboja, palikta.
7. **Dalyvis be pagalbinio veiksmažodžio:** „…įmesti į vandenį" (02-medziagu-bandymas, 2 užduotys).
8. **Hint'as, kuris nukreipia ne į klaidą, o į priešingybę** (10-gyvunu-grupes) — LL-22 šeima, atvirkščia kryptimi (LL-53).
9. **Tikrintuvo 22 „neaiški nuoroda pradžioje" info** — peržiūrėta vienu metu: visų įvardžių (tas/jis/jie/ja) ateityje aiškus, keičiama nieko. Info lygis tinkamas.

## 5 prasčiausių modulių (taisyti pirmiausia)

1. **16-vandens-busenos** — 2 nežodžiai („aprasojęs", „aprasojo") + „neprapuola" ×2 + „nubyra". Vaikas stoja ties kiekvienu trečiu sakiniu.
2. **22-sudetis-per-desimti** — nelogiškas pavyzdys („Du įdedi") + 2 per ilgi outcome sakiniai.
3. **13-akmenelis-popierius** — abstrakčiausias 1 klasės turinys: „atsitiktinumas" outcomes/title/example, 11–12 žodžių outcome sakiniai (2 † įrankio žinomi).
4. **01-garso-aukstis** — neegzistuojančios veiksmažodžio formos pačioje pirmaj užduotyje + „nebūtinai" concept žingsnyje.
5. **10-gyvunu-grupes** — tik vienas radinys, bet jis rimtas: hint'as menkina (rodo nuo „plunksnų", kurios yra atsakymas). **Užtaisyta #144** (hint'as perrašytas).

Šeštas lauka eilės: **21-erdvines-figuros** (15 žodžių outcome + 2 smulkūs).

## Ko auditas NElipęs

- `teacher.*`, `sources`, `svietimas1` — ne vaikui skaitomi.
- Terminologija, kuri yra pačia modulio sąvoka („atsitiktinumas", „kūnas/rutulys", „spindulys/atkarpa", „dešimtukas") — nepakeista; pastatyta tik ten, kur sąvoka turi kasdienį sinonimą.
- „kupiūra" vs „banknotas" (14-pinigai) — jau atviras pasiūlymas #4802, nekartojamas.
- Pedagoginiai ginčai (06-figuros, 15-laikas/20-laikas programos atitiktis) — metodininko/programos-derintojo sritis.

## Taisymo būsena (paleidimas #143, 2026-11-08T09:43)

- **#6, #31, #32 (21-erdvines-figuros)** — pataisyta commit'e 7db8a6d („darbinės kopijos likutis", surastas prieš šį paleidimą; autorystė — nutrūkęs kalbu-redaktoriaus paleidimas, šis paleidimas tik patvirtino grep'u): outcomes[0] suskaidytas į 5 + 8 žodžių, tasks[3].hint → „Ar nors viena pusė plokščia?", tasks[3].why → „Rutulys (kamuolys) …".
- **Naujas radinys (#143), pataisyta:** tasks[0].hint „kokia forma kūgis remiasi į stalą" — „remtis į" vaizduoja atremtą kūną, o kūgis stovi ant pagrindo → „Pažiūrėk, ką kūnis turi apačioje." (pamoka LL-56).
- **Likę atviri:** `outcomes` laukas įrankiui vis dar nepatikrintas (LL-52); „Gretasienis" (sim mygtukas + sim.config 3 sakiniai) vs „stačiakampis gretasienis" (outcomes[1], teacher, programa) — pasiūlymas agents/proposals/2026-11-08-kalbu-redaktorius-gretasienis-pavadinimas.json.

## Taisymo būsena (paleidimas #147, 2026-11-08T10:00)

- **Nauji radiniai (ne buvusioje 41 radinių lentelėje), visi `21-erdvines-figuros`, pataisyta:**
  1. `concept.steps[0]` — „Pasirink kūną ir žvilgsnį." → „Pasirink kūną." (abstraktus „žvilgsnis"; sim mygtukai sako konkrečiai: „Iš priekio / Iš viršaus / Nuo šono").
  2. `concept.steps[2]` — „Pakeisk žvilgsnį." → „Žiūrėk iš kitos pusės." (ta pati priežastis; sim promptas jau vartoja „žiūri").
  3. `tasks[1].hint` — „su kauliuku" → „su kubu" (priekinė nuoroda: „kauliukas" pirmą kartą pasirodo tik `tasks[2].q`).
  4. `tasks[2].hint` — „į kauliuką simuliacijoje" → „į kubą simuliacijoje" (simuliacijoje kauliuko nėra — `geometrija.js BODIES`; pamoka LL-57).
  5. `tasks[3].options[0]` — „Kamuolys didesnis" → „Kamuolys plokščias" (nesusietas kiekis: dydis be atskaitos, gyvenime gali būti teisingas — LL-18; naujas variantas visada klaidingas ir tikrina módulio branduolio painiavą plokščiu/apvaliu).
- **Įrankio akluumė:** visi 5 radiniai liko nematomi `check_language.py` (hint'o kryptis, varianto prasmė, žingsnių abstraktumas — LL-52/LL-53 šeima); modulis įrankyje 0 įrašų ir prieš, ir po.
- **Likę atviri:** `geometrija.js:112` kieta sim pastaba „Pasirink kūną ir žvilgsnį" nesutampa su konkrečiais žingsniais — pasiūlymas `agents/proposals/2026-11-08-kalbu-redaktorius-sim-uzrasas-zvilgsnis.json`; „Gretasienis" (#143 pasiūlymas) vis dar atviras.

## Taisymo būsena (paleidimas #144, 2026-11-08T09:45)

- **#1 (10-gyvunu-grupes)** — pataisyta: tasks[2].hint „Pagalvok apie pagalvę, bet ne apie jos turinį." → „Pagalvok, kuo dengtas paukštis — ne kailis, ne žvynai." (LL-53; senasis hint'as nukreipė nuo atsakymo „Plunksnos", nes pagalvės turinys būtent plunksnos). Patikrinta: DOM zondas (klaidžiant „Žvynai", `.task-feedback` rodo naują tekstą), `check_view.py` 4 plotai (0 problemų, minTaskFont nepakito), `validate_content.py` 0/0. `check_language.py` modulio įrašas nepakito (0/0/1) — įrankis nemato hint'o krypties; tai LL-53 riba, ne atsitraukimas. Redakcija pateko bėgiklio commit'e d0e319d (likučio commit'as; autorystės pastatas — #4998/#5190 atviri).
- **Likę atviri:** kitų modulių radiniai (žr. lentelę); `outcomes` vartai (LL-52) — atviras pasiūlymas (#143).

## Taisymo būsena (paleidimas #148, 2026-11-08T10:17)

- **10-gyvunu-grupes — pakartotinė fresh-eyes peržiūra** (auditas #137 šiam moduliui rado tik #1, užtaisyta #144; šį kartą žiūrima iš naujo). Vienintelis likęs radinys: tasks[3].hint „Paukštį atpažįstame ne pagal skrydį." — 1-asis asmuo daugiskaita vaikui, skaitančiam vienam, ir vienintelis 1-asmens formulys modulyje (kiti hint'ai: 2-asis „Pagalvok…" arba 3-asis klausimas). → „Ne visi paukščiai skraido." (5 žodžiai; tą pačią pagalbą — skrydis nėra požymis; atsakymo „Pingvinas" ir požymių plunksnos/kiaušiniai neatskleidžia). Nauja pamoka LL-60.
- **Skaičiai:** `check_language.py` (modulis): 0 klaida / 0 įspėjimas / 1 info ir prieš, ir po („Jos" — aiški antecedentė iš klausimo; auditas #137 paliko). warn 0→0 (modulis buvo švarus po #144; šio radinio tipas įrankiui nematomas — ta pati situacija kaip LL-53). `validate_content.py` 0/0. `check_view.py` desktop/tablet/phone: 0 problemų, overflow 0, smallCount 0, minTaskFont 21.44/21.44/19.14, tasks 4/4, simVisibleControls 13. DOM zondas: klaidingas „Varnas" → `.task-feedback` = naujas hint'as; seno teksto puslapyje nebeliko; 0 console/page klaidų.
- **Įrankio akluumė:** hint'as asmenimis (kaip ir hint'o kryptis, LL-53) lieka nematomas `check_language.py` — LL-52/LL-53 šeima.

## Taisymo būsena (paleidimas #149, 2026-11-08T10:36)

- **#2, #3 (rimti) — užtaisyta:** `concept.example` „būna aprasojęs" → „būna užparęs"; `tasks[2].q` „aprasojo" → „užparojo".
- **#7 (vidutinė) — užtaisyta:** subtitle „Vanduo neprapuola — jis keičia savo formą" → „Vanduo neišnyksta — jis keičia savo formą"; `outcomes[0]` „…neprapuola, o būna ore kaip garas." → „…neišnyksta, o būna ore kaip garas." Subtitle sinchronizuota `content/lt/grade-01/index.json:53` (metaduomenų kopija — LL-05/LL-21 šeima; be sinchronizacijos modulio kortelėje liktų nežodis).
- **#8 (vidutinė) — užtaisyta:** `concept.steps[3]` „Lašai nubyra atgal į puodą." → „Lašai nubėga atgal į puodą."
- **Naujas radinys (šio paleidimo fresh eyes), užtaisyta:** `concept.big_idea` antrame sakinyje buvo du dalyviniai konstrukcijai — „Šildomas jis kyla į orą, o vėsdamas vėl tampa lašais." 6–7 m. vaikui neperskaitomos (run užduoties kategorija „vertiniai"). → „Kai pakaiti, kyla į orą, o kai atvėsta, tampa lašais." (10 žodžių, be dalyvių; prasmė nepakito — abi būsenų kaitos pusės; big_idea riba 1–2 sakiniai išlaikyta).
- **Skaičiai:** `check_language.py` (modulis): 0 klaida / 0 įspėjimas / 1 info → **0/0/1** (info — `tasks[0].why` „Jis ne dingo, tik pakeitė formą.", antecedentė aiški; audit modelis #9 paliko). Įspėjimų 0→0 dėl to, kad visi 5 radiniai buvo įrankio akluose (nežodžiai „aprasojęs/aprasojo", „neprapuola", retas „nubyra", dalyviniai konstrukcijai — LL-52 šeima); žmogaus akių radiniai **5 → 0**. Klasė: 0 klaida, 4 įspėjimai (kiti moduliai, buvo ir prieš darbą), 21 info. `validate_content.py --grade 1` ir be parametrų → 0/0. `check_audio.py` → 463 tekstai × 2 įrašai (Piper), exit 0.
- **`check_view.py`** (local server, Brave skydų blokada `BRAVE_INIT`, desktop/tablet/phone): **prieš = po** — `checked` 3, `problems` [], `notes` [], exit 0; `overflow` 0/0/0, `smallCount` 0, `tasksVisible` 4/4, `clipped` [], `simVisibleControls` 4, `loading`/`fatal` false, console/page errors 0; `minTaskFont` 21.44 / 21.44 / 19.14 px (tekstai trumpesni, geometrija nepakito).
- **DOM zondas** (`probe149_dom.py`, scratch, Chromium 1440 px, `.venv` Playwright, `google-chrome`, Brave skydų blokada): RESULT OK — 7 nauji teiginiai matomi (`subtitle`, `big_idea` ×2, `outcomes[0]` — jie yra suglaustame `<details>` „Ką suprasi", `app.js:392–394`, todėl zonde imamas `textContent`, ne `innerText`; `concept.example`, `concept.steps[3]`, `tasks[2].q`), 5 seni neberendinami (`neprapuola`, `aprasoj`, `nubyra`, `Šildomas`, `vėsdamas`), sim readout gyvas („Vandens lygis 5 iš 5 · dangtis nuimtas"), 4 užduotys, 3 outcomes, 0 console/page klaidų.
- **Likę atviri:** `sim.config.words` negyvas (niekur neskaitomas) → pasiūlymas `2026-11-08-kalbu-redaktorius-sim-config-zodziai-mirus.json` (LL-61); sim pastabos „virs" → pasiūlymas `2026-11-08-kalbu-redaktorius-sim-virs-lašais.json`; `steps[1]` „Jo nematome" palikta (audit modelis #6 — priimtina bendrinė pastaboja); `check_language.py` nežodžių/dalyvių nemata — įrankio riba, atviras #5827 (`outcomes` vartai) ir LL-52/LL-53 šeima.


## 2026-11-17 — lietuvių kalbos modulių auditas (5 moduliai)

Naujas auditas: `research/wiki/guidelines/lietuviu-kalba-auditas-2026-11-17.md`.

Rasta **5 rimti, 5 vidutiniai, 4 smulkūs** radiniai. Visi 5 moduliai praeina `validate_content.py` ir `check_view.py`, bet turi turinio ir pedagoginių defektų. Visi pateikti `agents/proposals/2026-11-17-kalbu-redaktorius-*.json`:

- 01-garsas-ir-raide: užduotis be paveikslėlio (R1); neįmanomas pabaigos klausimas (R2); „Niekou“ (V1).
- 02-skiemenu-jungimas: „mokykla“ skaidoma mo-kyk-la, o turi būti mo-ky-kla (R3).
- 04-kaip-zmones-sveikinasi: simuliacija pati padaro išvadą „Visi…“ po vieno žmogaus (R4/R5) — užtaisyta #352; garso įrašas taria veiksmą (V4) — užtaisyta #363.
- 05-plakatas-ir-informacija: pusė neteisingų pasirinkimų neturi savo paaiškinimo (V5).

## Taisymo būsena (paleidimas #508, 2026-11-24T13:30)

Modulis: **21-erdvines-figuros** (1 kl., matematika). Audito #137 radiniai #6, #31, #32 ir #143/#147 radiniai jau buvo uždaryti anksčiau; šį kartą peržiūra daryta iš naujo, nuo vaiko, kuris skaito lėtai ir vartoja 200 % teksto.

**Pakeista (13 vietų, visos — formuluotė; `answer` indeksai, `concept`, `teacher`, `sources`, sim JSON raktai nepaliesti):**

| Laukas | Prieš | Po | Priežastis |
|---|---|---|---|
| outcomes[1] | „Įvardiju kubą, rutulį…“ | „Vardinu kubą, rutulį…“ | „Įvardiju“ — suaugusiojo terminas, 6–7 m. vaikui neverčiamas žodis |
| concept.steps[0] | „…iš viršaus **ar** nuo šono.“ | „…iš viršaus **arba** nuo šono.“ | „ar“ yra klausiamasis: nurodymas skaitomas kaip klausimas |
| concept.steps[1] | „Spėk, kokią formą matai, **ir** spausk **jos** mygtuką.“ | „Spėk, kokią formą matai. Tada spausk **tos formos** mygtuką.“ | dvi instrukcijos viename sakinyje + įvardis be daikto |
| sim.intro | „Pasirink kūną **ir** spėk… Tada rinkis: … **ar** nuo šono.“ | „Pasirink kūną. Spėk… Tada rinkis: … **arba** nuo šono.“ | ta pati priežastis; tekstas rodomas virš modelio, skaitomas pirmas |
| labels.viewsHeading | „Iš kur žiūrėsi? Mygtuke…“ | „Pasirink, iš kur žiūrėsi. Mygtuke…“ | užrašas virš mygtukų buvo klausimas, o ne nurodymas |
| notes.lookRight | „…į paveikslą **dešinėje**.“ | „…į **antrą** paveikslą.“ | prie 200 % teksto figūros sukrenta viena po kita — žodis apie vietą tampa neteisingas (nauja pamoka LL-178) |
| notes.allSides | „Apžiūrėjai **jį**…“ | „Apžiūrėjai **kūną**…“ | įvardis sakinio pradžioje be daikto toje pačioje eilutėje |
| bodies.kugis | „Kūgio **pagrindas** apvalus…“ | „Kūgio **apačia** apvali…“ | modulyje tas pats daiktas vadintas dviem žodžiais: užuomina sakė „apačia“, modelis — „pagrindas“ |
| tasks[0].why | „Kūgio **pagrindas** apvalus…“ | „Kūgio **apačia** apvali…“ | ta pati priežastis (atsakymas nepakeistas) |
| tasks[4].why | „…o jo **pagrindas** apvalus.“ | „…o jo **apačia** apvali.“ | ta pati priežastis |
| tasks[1].q | „…stačiakampį, iš viršaus **—** apskritimą. **Kas tai per kūnas?**“ | „…stačiakampį. Iš viršaus matai apskritimą. **Kuris tai kūnas?**“ | brūkšninė elipsė 1 klasei + tas pats klausimas modulyje jau buvo „Kuris tai kūnas?“ (tasks[4]) |
| tasks[1].hint | „…Pažiūrėk į **dėžutę** iš viršaus.“ | „…Pažiūrėk į **kubą** simuliacijoje.“ | „dėžutė“ modelyje neegzistuoja — vaikas jos ieško ir neranda (ta pati šeima kaip #147 radinys „kauliukas“) |
| reflect | „…iš **kiekvienos** pusės… Kaip **jis** atrodo…“ | „…iš **skirtingų** pusių… Kaip **tas daiktas** atrodo…“ | „kiekviena pusė“ kūne nesuskaičiuojama; įvardis vietoj daikto |

**Skaičiai.** `check_language.py --grade 1`: klaidos 0 → 0, įspėjimai 0 → 0, pastabos 53 → 53 (modulyje 0 įrašų ir prieš, ir po — visi 13 radinių buvo žmogaus akių lauke: klausiamasis „ar“, įvardis, sąvokos dubliavimas, varianto objektas modelyje, pozicinis žodis; LL-52/LL-53 šeima). Žmogaus akių radiniai: **13 → 0**. `validate_content.py --grade 1`: 0 klaidų, 0 įspėjimų. `check_audio.py`: 1112 tekstų / 2224 įrašų — nepakito, nes nė vienas pakeistas raktas (`outcomes`, `concept`, `tasks`, `reflect`, `sim.config.intro/labels/notes/bodies`) nėra tariamas; `sim.config.sentences` sąmoningai neliestas, nes tie sakiniai turi mp3 įrašus.

**`check_view.py` (Brave skydų imitacija, 127.0.0.1:8972):** prieš ir po vienodai — 1440: `overflow` 0, `smallCount` 0, `minTaskFont` 21,44, `tasksVisible` 5/5; 1024: 0 / 0 / 21,44 / 5/5; 390: 0 / 0 / 19,14 / 5/5; `clipped []`, `loading`/`fatal` false, konsolės klaidų 0, `problems []`.

**DOM zondai:** `probe508_dom2.py` (390 px, `localStorage`/`crypto`/`speechSynthesis` užblokuoti) — sim pastaba po neteisingo spėjimo „Kūgio apačia apvali, o viršus smailas. Pažiūrėk į antrą paveikslą.“; užduočių užuominos („Pažiūrėk, kokia kūgio apačia.“, „…Pažiūrėk į kubą simuliacijoje.“) ir naujas 2-os užduoties klausimas rodomi; `readout` po trijų vaizdų „Ritinys nuo šono: matai stačiakampį. Apžiūrėjai kūną iš trijų pusių.“; tikslo pastaba („Trys vaizdai, vienas kūnas.“) atsiranda tik trečią kartą — tame pačiame `checkGoal()` kelyje, kuris kviečia `api.progress`, tad pažanga žymima pabaigoje, ne po pirmo vaizdo; `localStorage` zonde užblokuotas, todėl žymos įrašo tiesiogiai nematuota; konsolės klaidų 0.

**Palikta sąmoningai:** `title` („Erdvinės figūros“) ir `subtitle` (indekso kopija — LL-05/LL-21, keitimas reikalautų `index.json` sinchronizacijos, o tekstas suprantamas); `sim.config.sentences[*]` (17 sakinių turi garso įrašus — keitimas paliktų vaiką be balso iki pergeneravimo; „Pradedam iš naujo.“ ir „Jis visą laiką buvo tas pats.“ lieka); `bodies.gretasienis` ir `sentences.gretasienis-*` (trumpasis „gretasienis“ vietoj „stačiakampis gretasienis“ — atviras #143 pasiūlymas, ne kalbos redaktoriaus sprendimas); `concept.big_idea` (4 trumpi sakiniai vietoj standarto „1–2“ — 1 klasei trumpesni sakiniai sąmoningesni už ilgesnį su jungtukais; validatoriuje nepažeidžia); `tasks[3].options` („Kamuolys plokščias“ / „Kamuolys apvalus iš visų pusių“ / „Lėkštė neturi krašto“ — skiriasi prasme, `answer` indeksas neliestas).

**Nauji pasiūlymai:** `agents/proposals/2026-11-24-kalbu-redaktorius-ar-vieto-arba.json` (check_language nemato klausiamojo „ar“ instrukcijoje) ir `agents/proposals/2026-11-24-kalbu-redaktorius-sim-seen-etikete-12px.json` (`.ef-seen` 12,8 px — sim teksto minimumo vartai neegzistuoja, #44331). Nauja pamoka: LL-178 (nurodymas pagal vietą ekrane, o ne pagal daiktą).

## Taisymo būsena (paleidimas #509, 2026-11-24)

Modulis `10-gyvunu-grupes`. `check_language.py` modulyje rodė **0 įrašų ir prieš, ir po** — visi radiniai buvo žmogaus akių lauke (LL-52/LL-53 šeima: sakinio tiesa, ne jo ilgis). Šįkart pagrindinis klausimas buvo ne „ar sakinys per ilgas“, o „ar jis teisingas visiems šešiems modelio gyvūnams“ (nauja pamoka LL-179).

| Vieta | Prieš | Po | Priežastis |
|---|---|---|---|
| `subtitle` (+ `index.json`) | „…tai **pasako** maistas, o ne vieta“ | „…tai **parodo** maistas, o ne vieta“ | „pasakyti“ nenaudojama negyvam daiktui; „parodo“ sutampa su `sim.config.sentences.rule` |
| `concept.big_idea` | „…maistą **ir pastogę** gauna… Laukinis **susiranda pats**. Todėl grupę **pasako ne vieta, o tai, kas gyvūnu rūpinasi**.“ | „…**maisto** gauna… Laukinis **maisto** susiranda pats. Todėl grupę **parodo maistas, o ne vieta**.“ | pastogė — kriterijus, kurį paneigia gandras ant tvarto stogo; „tai, kas rūpinasi“ — abstrakti šalutinė 6–7 m. vaikui |
| `concept.steps[2]` | „…ir **palygink, kas lieka, o kas išeina**“ | „…ir **pažiūrėk, kas pasikeitė**“ | palyginimas be kriterijaus; dvejetainis rėmas netinka ežiui (įminga) ir lapei (ateina arčiau) |
| `tasks[1].q` | „Karvė gyvena tvarte, **o gandras ant tvarto stogo**.“ | „Karvė gyvena tvarte. Gandras gyvena ant tvarto stogo.“ | elipsė be veiksmažodžio — lėtas skaitytojas sustoja (ta pati šeima kaip #auditas 23/47) |
| `tasks[1].options[2]` | „Abu, nes jie gyvena **viename kieme**“ | „Abu, nes jie gyvena **prie to paties tvarto**“ | variante atsirado žodis, kurio sąlygoje nėra (kiemas); klaidinga nuoroda į kitą vietą |
| `tasks[2].q` | „**Kodėl katinas yra naminis gyvūnas?**“ | „**Ar katinas naminis, ar laukinis? Kodėl?**“ | sąlyga teigė atsakymą, o variantas „Laukinis, nes gyvena lauke“ į tokį klausimą neatsako |
| `tasks[2].hint` | „**Kodėl žmogus pila jam pieno?**“ | „**Pagalvok, kas katinui duoda maisto.**“ | užuomina klausė apie žmogaus motyvą (vaikas atsakytų „nes nori pieno“), o ne apie kriterijų |
| `tasks[3].q` | „…į kiemą **pažiūrėti vištų**“ | „…į kiemą **pas vištas**“ | netaisyklingas kilmininkas po „pažiūrėti“ |
| `tasks[3].options[2]` | „Taip, nes ji **ieško maisto kieme**“ | „Taip, nes ji **moka gaudyti vištas**“ | 0 ir 2 variantai buvo beveik ta pati mintis (vieta) — dabar skiriasi ašis: įgūdis ≠ žmogaus priežiūra |
| `tasks[3].hint` | „Kas jai **duoda maisto**?“ | „Kas ją **šeria**?“ | naujas variantas atėmė „maistas“ iš klaidingų variantų, tad užuomina ėmė to žodžio neišduoti (LL-22 vartai; validatorius tai pagavo) |
| `tasks[4].options[1]` | „Lieka tvarte ir **lesa šieną su karve**“ | „**Žmogus atneša jam maisto į tvartą**“ | gandras šieno neėda — variantas buvo juokingas, ne klaidingas dėl grupės; naujas tikrina branduolį (maitina žmogus ⇒ naminis?) |
| `tasks[4].why` | „**Karvei šieną duoda žmogus.**“ | „**Karvė lieka, nes jai šieną duoda žmogus.**“ | kontrastas su gandru buvo tik numanomas |
| `tasks[5].q` | „Šuo gyveno **prieglaudoje**. Ten juo rūpinosi…“ | „Šuo gyveno prieglaudoje. **Prieglauda — tai namai, kur šunys laukia šeimos.** Juo rūpinosi…“ | „prieglauda“ 6–7 m. vaikui neaiškus žodis, o nuo jo supratimo priklauso visa užduotis |
| `tasks[5].hint` | „…**Kas visai kitaip?**“ | „…**Ar jis ten buvo laukinis?**“ | nebaigtas klausimas („kas kitaip?“) → klausimas, kuris tikrina kriterijų, o ne įvardija variantą |
| `sim.config.sentences.winter` | „Žiema. Pažiūrėk, **kas lieka, o kas išeina**.“ | „Žiema. Pažiūrėk, **kas pasikeitė**.“ | tas pats dvejetainis rėmas (garso įrašas pergeneruotas) |
| `sim.config.sentences.winterNote` | „**Vieta pasikeitė**, o grupė liko ta pati.“ | „**Atėjo žiema**, o grupė liko ta pati.“ | vietą keičia 2 gyvūnai iš 6; teiginys prieštaravo tam, ką vaikas ką tik matė sąraše (garso įrašas pergeneruotas) |

**Skaičiai.** `check_language.py --grade 1`: klaidos 0 → 0, įspėjimai 0 → 0, pastabos 53 → 53; modulyje 0 įrašų prieš ir po. Žmogaus akių radiniai: **16 → 0** (14 modulio laukuose + 2 `sim.config` sakiniai; `subtitle` pakeistas ir `index.json`, kad metaduomenys nelūžtų — LL-05). `validate_content.py` (be parametrų ir `--grade 1`): 0 klaidų, 0 įspėjimų. `check_audio.py`: 1112 tekstų / 2224 įrašų — skaičiai nepakito (2 sakiniai pakeisti, 2 nauji įrašai × n/s, 4 mp3 pergeneruoti `.venv/bin/python scripts/generate_audio.py`, 4 našlaičiai pašalinti `--prune`), visi 2224 mp3 naudojami.

**`check_view.py` (Brave skydų imitacija, 127.0.0.1:8972, `--module 10-gyvunu-grupes`):** prieš ir po vienodai —
| Plotis | overflow | smallCount | minTaskFont | tasksVisible | clipped | loading/fatal | problems |
|---|---|---|---|---|---|---|---|
| 1440 | 0 | 0 | 21,44 px | 5/5 | [] | false | [] |
| 1024 | 0 | 0 | 21,44 px | 5/5 | [] | false | [] |
| 390 | 0 | 0 | 19,14 px | 5/5 | [] | false | [] |

**DOM zondas** (`probe_gg.py`, 390 px, brauzerio blokai visiems ne vietiniams URL): 5 užduotys su naujais tekstais; sim: 6 kortelės su vieta, abi dėžės, užrakintas „Žiema“ pasako „Pirma sudėk visus gyvūnus. Tada „Žiema“ parodys, kas pasikeis.“ (LL-04), teisingai sudėjus — „Visi gyvūnai savo vietose. Grupę parodo maistas, o ne vieta.“, tada „Žiema“ atrakina ir rodo „Atėjo žiema, o grupė liko ta pati. Karvė vis dar naminė, o gandras — laukinis.“; konsolės klaidų 0.

**Palikta sąmoningai:** `title` „Kas gyvena tvarte?“ (kabliukas; keitimas reikalautų `index.json` ir viso maršruto antraščių); `sim.config.sentences.wrong` „Pažiūrėk ne į vietą, o į tai, kas duoda maistą.“ (kontrastinis neiginys, ne dvigubas; 8 žodžiai; perrašymas būtų stilius, ne defektas); `concept.example` „ūkininkas“ (9 raidės, konkretus ir pažįstamas žodis, ne vertinys); `teacher.*` (suaugusiojo tekstas — pastogės kriterijaus pataisa perduota pasiūlymu); `svietimas1` (ne vaikui skaitoma, o jo 1 žingsnis jau atitinka naują `big_idea`); `tasks[1]`, `tasks[3]`, `tasks[5]` `answer` indeksai ir variantų tvarka — neliesti nė viename.

**Nauji pasiūlymai:** `2026-11-24-kalbu-redaktorius-sim-kieti-tekstai-12px.json` (sim tekstas 12,8 px + 4 sakiniai kode, kurių nemato nei kalbos, nei garso vartai) ir `2026-11-24-kalbu-redaktorius-teacher-pastoges-kriterijus.json` (teacher.goal tebemoko pastogės kriterijaus). Nauja pamoka: LL-179 (kriterijus, kurį paneigia pats modelis).

## Taisymo būsena (paleidimas #510, 2026-11-24T14:27)

Modulis **01-garso-aukstis** (1 kl., muzika). Audito #137 radiniai #4 ir #19 jau buvo uždaryti anksčiau, todėl šį kartą modulis skaitytas iš naujo, nuo 6–7 m. vaiko, kuris klausosi ir skaito lėtai. `check_language.py` modulyje rodė **0 įrašų ir prieš, ir po** (visi radiniai — žmogaus akių lauke: varianto objektas, užuominos kryptis, sakinio elipsė, nesusietas laipsnis).

| Laukas | Prieš | Po | Priežastis |
|---|---|---|---|
| `outcomes[0]` | „Skiriu aukštą garsą nuo **garsaus** ir paaiškinu skirtumą.“ | „Skiriu, kada garsas aukštas, o kada garsus. Paaiškinu skirtumą.“ | „skirti … nuo garsaus“ be daiktavardžio — vaikas ieško, nuo ko skirti (LL-01 šeima) |
| `concept.steps[0]` | „Paklausyk žemo garso, **paskui aukšto**. **Garsumą palik tokį pat.**“ | „Paklausyk žemo garso. Paskui paklausyk aukšto. Garsumo nekeisk.“ | elipsė be veiksmažodžio + sakinys pradedamas galininku; dvi instrukcijos viename sakinyje |
| `concept.steps[2]` | „Aukštas garsas gali būti tylus. **Tylus garsas gali būti labai aukštas.**“ | „Aukštas garsas gali būti tylus. Žemas garsas gali būti garsus.“ | antras sakinys — tos pačios minties veidrodis (simetriška), o „labai aukštas“ — laipsnis be atskaitos; naujas sakinys duoda kitą įstrižainę, kurią vaikas gali patikrinti simuliacijoje |
| `tasks[1].hint` | „**Paklausyk**, kas keičiasi, kai nata lieka ta pati.“ | „Pagalvok, ar garsiau dainuodamas vaikas dainuoja aukščiau.“ | užduotyje nėra garso: „paklausyk“ yra neįvykdomas nurodymas (ta pati šeima kaip hint'as apie simuliacijoje neegzistuojantį daiktą); nauja užuomina nukreipia į klaidingą nuostatą „garsiau = aukščiau“ |
| `tasks[2].options` | „Pirmas“ / „Antras“ / „Abu vienodai“ | „Mažo šuniuko“ / „Didelio šuns“ / „Abiejų vienodai“ | variantas nurodė sakinio eilę, ne daiktą; užduotis pati numeruojama („3.“), tad „Pirmas“ dubliuoja numerį (nauja pamoka LL-180) |
| `tasks[2].hint` | „Aukštis ir garsumas — ne tas pats dalykas.“ | „Šuniukas loja tyliai. Ar tyliai reiškia žemai?“ | buvusi formuluotė — apibrėžimas, ne nuoroda į konkrečią vaiko klaidą; naujoji klausia būtent to, ką vaikas supainiojo |
| `tasks[2].why` | „**Antras** loja žemai, nors ir garsiai.“ | „Didelis šuo loja žemai, nors ir garsiai.“ | `why` liko su eilės žodžiu, kurio variantuose nebeliko |
| `tasks[3].hint` | „Palygink, kaip skamba mažas ir didelis **daiktas**.“ | „Palygink, kaip skamba mažas ir didelis **varpas**.“ | užduotis apie varpus, o užuomina kalbėjo apie „daiktą“ — vaikas ieškojo kito objekto |
| `reflect` | „**Kuris buvo aukštesnis, o kuris garsesnis?** Papasakok.“ | „Pasakyk, kuris buvo aukštesnis. Ar aukštesnis garsas buvo ir garsesnis?“ | senasis klausimas neatsakomas, kai vaiko prisiminti garsai skiriasi tik viena savybe (arba abi savybės keičiasi kartu); naujasis visada atsakomas ir tikrina nepriklausomumą |

**Skaičiai.** `check_language.py --grade 1`: klaidos 0 → 0, įspėjimai 0 → 0, pastabos 53 → 53 (modulyje 0 įrašų ir prieš, ir po — LL-52/LL-53 šeima: sakinio sandara ir varianto objektas, ne jo ilgis). Žmogaus akių radiniai: **9 → 0**. `validate_content.py` (be parametrų ir `--grade 1`): 0 klaidų, 0 įspėjimų. `check_audio.py`: 1112 tekstų / 2224 įrašų — nepakito, nes nė vienas pakeistas raktas (`outcomes`, `concept.steps`, `tasks`, `reflect`) netariamas; `sim.config` (vienintelis tariamas šiame modulyje) neliestas.

**`check_view.py` (Brave skydų imitacija, 127.0.0.1:8972, `--module 01-garso-aukstis`):** prieš ir po vienodai —

| Plotis | overflow | smallCount | minTaskFont | tasksVisible | clipped | loading/fatal | problems |
|---|---|---|---|---|---|---|---|
| 1440 | 0 | 0 | 21,44 px | 4/4 | [] | false | [] |
| 1024 | 0 | 0 | 21,44 px | 4/4 | [] | false | [] |
| 390 | 0 | 0 | 19,14 px | 4/4 | [] | false | [] |

`simFonts.min` = 13,1 px visuose trijuose plotuose, bet tai **ne šio modulio defektas**: garsumo skalės etiketės („tyliai“, „vidutiniškai“, „garsiai“) naudoja platformos žetoną `--fs-xs` (`muzika.js:51`, `font-size:.82rem`), t. y. mažiausią leistiną žetoną, o ne savavališką trupmeną. Sim teksto minimumo standarte dar nėra (#44331), tad tai lieka pastaba, ne vartai — atskiro pasiūlymo nekartoju.

**DOM zondas** (`probe510.py`, 390 px, `localStorage`/`crypto.subtle`/`speechSynthesis` užblokuoti): matomi 7 nauji tekstai (outcomes[0], steps[0], steps[2], trys varianto etiketės, reflect klausimas), senų tekstų puslapyje nebeliko (`Pirmas`, `Antras`, „labai aukštas“, „didelis daiktas“, „Paklausyk, kas keičiasi“ — 0 atitikimų); 2 užduotis po klaidingo „Aukštis“ rodo „Pagalvok, ar garsiau dainuodamas vaikas dainuoja aukščiau.“, po teisingo „Garsumas“ — „Teisingai! Toje pačioje natoje keičiasi tik garsumas.“; 3 užduotis po klaidingo „Mažo šuniuko“ rodo „Šuniukas loja tyliai. Ar tyliai reiškia žemai?“, po teisingo — „Teisingai! Didelis šuo loja žemai, nors ir garsiai.“; 4 užduotis po klaidingo varianto — „Palygink, kaip skamba mažas ir didelis varpas.“; simuliacija gyva („Garsas vidutinis, skamba vidutiniškai.“ → aukštis aukštyn → „Garsas aukštas…“ → garsumas žemyn → „…skamba tyliai.“ → „Keitei aukštį ir garsumą atskirai: tai dvi skirtingos savybės.“), konsolės klaidų 0.

**Audito klaida, kurią reikia žinoti.** Šio audito lentelės radinys **#4** skelbė, kad „Pakėlei … nelietei“ yra neegzistuojančios formos ir siūlė „pakėlai, nepalietei“. Tai netiesa: *kelti* būtasis laikas — „kėliau, **kėlei**, kėlė“, *liesti* — „liečiau, **lietei**, lietė“, tad „pakėlei“ ir „lietei“ yra taisyklingos 2-ojo asmens formos, o „pakėlai“ būtų klaida. Modulis vis tiek buvo perrašytas #151 (dabar „Aukštį pakėlei, o garsumo nekeitei.“), bet klaidinga audito eilutė ateityje gali paskatinti „taisyti“ taisyklingą tekstą — todėl ji žymima čia, o ne trinama iš istorijos.

**Palikta sąmoningai:** `title` („Aukštas garsas ne visada garsus“) ir `subtitle` (indekso kopija — LL-05/LL-21, keitimas reikalautų `index.json` sinchronizacijos, o tekstas suprantamas); `concept.big_idea` (3 trumpi sakiniai vietoj standarto „1–2“ — 1 klasei trumpesni sakiniai sąmoningesni; validatoriuje nepažeidžia); `concept.title` „Dvi atskiros savybės“ (sąvokos pavadinimas, ne sakinys); `tasks[1].q` „Pirma garsiai, paskui tyliai.“ (veiksmažodžio elipsė po to paties veikėjo — prasmė vienareikšmė, o „nata“ vartojama ir seseriniame `03-klausymasis`); `sim.config` (tariamos etiketės „Žemas garsas“… ir `short` „žemas/vidutinis/aukštas“ sutampa su simuliacijos kopėčiomis ir juosta — keitimas paliktų vaiką be balso iki pergeneravimo); `teacher.*` ir `sources` (suaugusiojo tekstas ir šaltiniai — ne vaiko laukas); visi `answer` indeksai (1, 2, 1, 0) ir teisingi variantai — nepaliesti nė viename.

**Naujas pasiūlymas:** `agents/proposals/2026-11-24-kalbu-redaktorius-eiles-tvarka-variantuose.json` (vartai, kurie mato variantą-eilės žodį be daikto). Nauja pamoka: LL-180.

## Taisymo būsena (paleidimas #512, 2026-11-24T14:55)

Modulis **22-sudetis-per-desimti** (1 kl., matematika; audito #137 5-oji vieta sąraše). `check_language.py` modulyje rodė **0 įrašų ir prieš, ir po** — visi radiniai buvo žmogaus akių lauke: neapibrėžtas sąvokos referentas, trūkstantis objektas, brūkšninė elipsė, dvitaškis vietoj veiksmažodžio.

| Laukas | Prieš | Po | Priežastis |
|---|---|---|---|
| `outcomes[1]` | „Paaiškinu, kodėl 8 + 5 **patogu skaičiuoti** per dešimtį.“ | „Paaiškinu, kodėl 8 + 5 **skaičiuoju** per dešimtį.“ | audito #13: 12 ištariamų žodžių; „patogu“ yra vertinimas, o rezultatas prasideda „Paaiškinu, kodėl…“, tad sakinys liko trumpesnis ir veiksmažodinis |
| `concept.big_idea` | „Pirma paimk **tiek**, kiek trūksta iki dešimties.“ | „Pirma paimk **tiek dėmių**, kiek trūksta iki dešimties.“ | „paimk tiek“ be daikto — vaikas ieško, ko imti (LL-01 šeima) |
| `concept.steps[0]` | „Pirmas skaičius jau **dešimtuke**. Suskaičiuok tuščius langelius.“ | „**Dešimtukas turi dešimt langelių.** Pirmas skaičius jau **jame**. Suskaičiuok tuščius langelius.“ | sąvoka niekur neapibrėžta, o tas pats žodis modulyje reiškė ir skaičių 10, ir langelių rėmelį; „dešimtuke yra 8 dėmės“ skambėjo kaip prieštaravimas (nauja pamoka LL-181) |
| `concept.steps[1]` | „Dešimtukas prisipildo **— tai dešimt**.“ | „**Pilname dešimtuke yra dešimt dėmių.**“ | brūkšninė elipsė be veiksmažodžio; naujasis sakinys tą pačią mintį pasako konkrečiai ir tikrinamai modelyje |
| `concept.steps[3]` | „**Kaskart trūksta kito skaičiaus.**“ | „**Kartais trūksta trijų dėmių, kartais vienos.**“ | kiekio neįvardijo niekas: „kito skaičiaus“ nepasako, kiek; konkretūs skaičiai sutampa su 7 + 5 ir 9 + 6 tame pačiame žingsnyje |
| `concept.example` | „Paimk 2 obuolius ir įdėk į krepšį **— bus dešimt**. Liko 3 obuoliai. Viso 13.“ | „**Iš tų penkių** įdėk 2 obuolius į krepšį. **Krepšyje** bus dešimt obuolių. Liko 3 obuoliai. Viso 13 obuolių.“ | audito #5 radinio likutis: nepasakyta, iš kur imti 2 ir ko liko 3 (vaikas mato du skaičių šaltinius); brūkšninė elipsė |
| `tasks[0].q` | „Dešimtuke yra 8 dėmės.“ | „Dešimtuke **jau** yra 8 dėmės.“ | be apibrėžimo sakinys prieštaravo pats sau (dešimtyje aštuonių nėra); kartu su `steps[0]` dabar skaitomas kaip „rėmelyje jau 8, kiek dar trūksta“ |
| `tasks[0].why` | „8 + 2 = 10, todėl **dešimtukui** trūksta dviejų dėmių.“ | „8 + 2 = 10, todėl **dar trūksta** dviejų dėmių.“ | trūksta ne daiktui, o iki skaičiaus; naudininkas klaidino |
| `tasks[1].options[2]` | „Prie dešimties pridėti 5 ir gauti 15“ | „Gauti dešimt, paskui pridėti visus 5“ | klaidingas variantas rėmėsi dešimčia, kurios toje vietoje dar nėra; naujasis tiksliai nusako klaidą (pridedamas visas antras dėmuo), o ne kitą veiksmą |
| `tasks[1].why` | „Iš penkių paimk 2, gausi dešimt, o likusius 3 pridėk: 13.“ | „Iš penkių paimk 2, gausi dešimt. Paskui pridėk likusius 3 ir gausi 13.“ | 10 ištariamų žodžių viename sakinyje su dvitaškiu — lėtas skaitytojas stoja ties dvitaškiu; mintis ta pati |
| `tasks[2].q` | „…6 mėlyni **rutuliai**“ | „…6 mėlyni **kamuoliai**“ | tame pačiame modulyje tas pats daiktas buvo vadinamas dviem vardais (5 užduotis — „kamuoliai“); vaikas ieškojo, ar čia tas pats |
| `tasks[4].q` | „Įdėjo dar 7. Kiek kamuolių **dabar**?“ | „Įdėjo dar 7 **kamuolius**. Kiek kamuolių dabar **dėžėje**?“ | objektas neįvardytas („7“ ko?), o „dabar“ nepasako, kur skaičiuoti |
| `tasks[4].hint` | „Papildyk 16 iki 20 taip, **kaip pildei** dešimtuką.“ | „**Kiek trūksta nuo 16 iki 20?**“ | eigos būtasis „pildei“ + nurodymas „kaip“, kurio vaikas negali atlikti (jau praeityje); naujasis klausia to paties pirmo žingsnio ir neįvardija atsakymo |
| `tasks[4].why` | „16 + 4 = 20, o likusius 3 pridėk: 23.“ | „16 + 4 = 20, o likusius 3 pridėk **ir gausi** 23.“ | dvitaškis vietoj veiksmažodžio, 10 ištariamų žodžių |
| `reflect` | „Pagalvok, kaip skaičiuoji 8 + 5. **Kurį skaičių tau lengviausia papildyti iki dešimties?**“ | „**Kuris kelias tau patogesnis: po vieną ar per dešimtį? Kodėl?**“ | antrasis klausimas neturėjo vieno atsakymo (papildomas visada tas pats pirmas skaičius); naujasis prašo palyginti abu modulio kelius |

**Skaičiai.** `check_language.py --grade 1`: klaidos **0 → 0**, įspėjimai **0 → 0**, pastabos **53 → 53**; modulyje **0 įrašų prieš ir po** (LL-52/LL-53 šeima: sakinio sandara, referentas, ne jo ilgis). Žmogaus akių radiniai: **15 → 0**. `validate_content.py` (be parametrų ir `--grade 1`): **0 klaidų, 0 įspėjimų**. `check_audio.py`: **1112 tekstų / 2224 įrašų — nepakito** (nė vienas pakeistas laukas netariamas; `sim.config` neliestas). Kiti CI vartai: `check_registry`, `check_published --path-order`, `check_refs`, `check_docs_facts`, `curriculum_backlog --check`, `check_agents`, `check_art`, `check_lessons` (180 pamokų) — 0 problemų, `check_language --strict` — ✔.

**`check_view.py` (Brave skydų imitacija, 127.0.0.1:8972, `--module 22-sudetis-per-desimti`):** prieš ir po vienodai —

| Plotis | overflow | smallCount | minTaskFont | tasksVisible | clipped | simFont min | loading/fatal | problems |
|---|---|---|---|---|---|---|---|---|
| 1440 | 0 | 0 | 21,44 px | 5/5 | [] | 15,2 px | false | [] |
| 1024 | 0 | 0 | 21,44 px | 5/5 | [] | 15,2 px | false | [] |
| 390 | 0 | 0 | 19,14 px | 5/5 | [] | 15,2 px | false | [] |
| 360 | 0 | 0 | 18,96 px | 5/5 | [] | 15,2 px | false | [] |

**DOM zondas** (`probe512.py`, 390 px, `localStorage`/`crypto.subtle`/`speechSynthesis` užblokuoti, ne vietiniai URL nutraukti): 11 naujų tekstų matomi (outcomes[1], big_idea 2 sakinys, steps[0] abu sakiniai su apibrėžimu, steps[1], steps[3], example, 1 užduoties klausimas, 2 užduoties trečias variantas, 3 užduoties klausimas su „kamuoliai“, 5 užduoties klausimas, reflect); senų tekstų puslapyje **0** (`Pirmas skaičius jau dešimtuke. Suskaičiuok…`, „Dešimtukas prisipildo — tai dešimt“, „Kaskart trūksta kito skaičiaus“, „Paimk 2 obuolius ir įdėk…“, „Prie dešimties pridėti 5 ir gauti 15“, „rutuliai“, „kaip pildei dešimtuką“, „Pagalvok, kaip skaičiuoji 8 + 5“). Grįžtamasis ryšys: 1 užduotis po „3“ → „Suskaičiuok tuščius langelius dešimtuke.“, po „2“ → „Teisingai! 8 + 2 = 10, todėl dar trūksta dviejų dėmių.“; 2 užduotis po klaidingo varianto → „Ar visus penkis reikia dėti į dešimtuką?“, po teisingo → „…Paskui pridėk likusius 3 ir gausi 13.“; 5 užduotis po „22“ → „Kiek trūksta nuo 16 iki 20?“, po „23“ → „Teisingai! 16 + 4 = 20, o likusius 3 pridėk ir gausi 23.“ Simuliacija gyva: 9 + 5, spėjimas 1 → „Į dešimtuką nuėjo 1 dėmė. Ant stalo liko 4. Tavo spėjimas sutapo: 1.“, readout „Dešimt ir dar 4. Viso 14.“, lygybė „9 + 1 = 10, paskui 10 + 4 = 14.“, antras paspaudimas → „Dešimtukas jau pilnas. Ant stalo liko 4.“ Konsolės klaidų **0**.

**Palikta sąmoningai:** `title` („Sudėtis per dešimtį“) ir `subtitle` („Pirma papildyk dešimtuką, paskui pridėk, kas liko“ — indekso kopija, LL-05/LL-21; keitimas reikalautų `index.json` sinchronizacijos, o „papildyk dešimtuką“ sutampa su sim mygtuku ir po `steps[0]` apibrėžimo yra vienareikšmis); `sim.config.sentences` (visi 13 sakinių turi garso įrašus; `pradek` atitinka sim antraštę, o keitimas paliktų vaiką be balso iki pergeneravimo — dublikato klausimas perduotas pasiūlymu); `concept.steps[2]` „Prie dešimties pridėk dėmes, kurios liko ant stalo.“ (7 žodžiai, „kurios“ rodo į dėmes tame pačiame sakinyje); `tasks[1].hint` „Ar visus penkis reikia dėti į dešimtuką?“ (klausimas apie rėmelį, kuris dabar apibrėžtas; atsakymo neišduoda); `tasks[3]` klausimas ir `why` (7 + 5 kelias jau teisingas, „dešimtukas prisipildo“ — modelio žodis); `outcomes[0]` „Pirma papildau dešimtuką, paskui pridedu likusį.“ (sutampa su sim mygtuku, sąvoka apibrėžta `steps[0]`); `teacher.*`, `sources`, `svietimas1` (suaugusiojo tekstas ir šaltiniai — ne vaiko laukas); visi `answer` indeksai (0, 1, 1, 2, 1) ir teisingi variantai — nepaliesti nė viename.

**Naujas pasiūlymas:** `agents/proposals/2026-11-24-kalbu-redaktorius-sim-antraste-dublikatas.json` (ta pati sim antraštė įrašyta ir `matematika.js:2940`, ir `sim.config.sentences.pradek` — tekstai jau išsiskyrė, o kodo sakinio nemato nei kalbos, nei garso vartai). Nauja pamoka: **LL-181** (terminas, kuris reiškia ir daiktą, ir skaičių).
