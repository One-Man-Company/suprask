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
| 27 | 01-garsas-ir-raide | tasks[1].opt[0] (eil. 111) | „Niekou" — rašyba (niekuo) | „Niekuo — tai tas pats." | vidutinė |
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
