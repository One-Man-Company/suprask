# metodininkas — 2026-11-25T0823

- paleidimas: #529 (manual)
- trukmė: 758s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ content/lt/grade-01/matematika/35-logines-operacijos-ir-arba-ne.json
│ @@ -0,0 +1,144 @@
│ +{
│ +  "id": "35-logines-operacijos-ir-arba-ne",
│ +  "grade": 1,
│ +  "strand": "matematika",
│ +  "title": "Kortelė pasako, kada degs lempa",
│ +  "subtitle": "Dvi kortelės, ta pati pora jungiklių, kita lempos būsena",
│ +  "minutes": 9,
│ +  "outcomes": [
│ +    "Pasakau, kada lempa degs, kai žinau kortelės taisyklę.",
│ +    "Palyginu dvi korteles su tais pačiais jungikliais.",
│ +    "Paaiškinu, kad lempą valdo taisyklė, o ne jungiklis."
│ +  ],
│ +  "concept": {
│ +    "title": "Taisyklė, o ne lempa",
│ +    "big_idea": "Ta pati pora jungiklių dega kitaip, nes taisyklę pasako kortelė. Lempa pati nieko nenusprendžia.",
│ +    "steps": [
│ +      "Pasirink kortelę ir pažiūrėk, ką ji žada.",
│ +      "Spėk, ar degs, tada įjunk jungiklį.",
│ +      "Palygink spėjimą su lempa lentelėje.",
│ +      "Uždėk NE ir pažiūrėk, kas apsiverčia."
│ +    ],
│ +    "example": "Žaislinis robotas važiuoja, kai įjungtas jo jungiklis ir uždėta baterija."
│ +  },
│ +  "sim": {
│ +    "component": "taisykle-ir-lempa",
│ +    "config": {
│ +      "switches": [
│ +        { "key": "kaire", "label": "Kairys" },
│ +        { "key": "desine", "label": "Dešinys" }
│ +      ],
│ +      "cards": [
│ +        { "key": "abu", "label": "ABU", "op": "IR", "gloss": "reikia abiejų" },
│ +        { "key": "bent", "label": "BENT VIENAS", "op": "ARBA", "gloss": "užtenka vieno" }
│ +      ],
│ +      "negate": { "label": "NE", "gloss": "apverčia" },
│ +      "cases": [
│ +        { "key": "kaire", "label": "tik kairys" },
│ +        { "key": "desine", "label": "tik dešinys" },
│ +        { "key": "abudu", "label": "abu įjungti" }
│ +      ],
│ +      "labels": {
│ +        "guess": "Kas bus su lempa?",
│ +        "on": "Degs",
│ +        "off": "Nedegs",
│ +        "test": "Įjunk",
│ +        "pick": "Kuri taisyklė?",
│ +        "again": "Iš naujo",
│ +        "tableCase": "Jungikliai",
│ +        "tableGuess": "Spėjai",
│ +        "tableLamp": "Lempa"
│ +      },
│ +      "sentences": {
│ +        "start": "Du jungikliai, viena lempa ir kortelė.",
│ +        "rule": "Kortelė pasako taisyklę.",
│ +        "guess": "Pirma spėk, kas bus su lempa.",
│ +        "locked": "Pirma spėk. Tada įjunk jungiklį.",
│ +        "kaireDega": "Kairys įjungtas. Lempa dega.",
│ +        "kaireTamsu": "Kairys įjungtas. Lempa nedega.",
│ +        "desineDega": "Dešinys įjungtas. Lempa dega.",
│ +        "desineTamsu": "Dešinys įjungtas. Lempa nedega.",
│ +        "abuduDega": "Abu įjungti. Lempa dega.",
│ +        "abuduTamsu": "Abu įjungti. Lempa nedega.",
│ +        "abuBaigta": "Kortelė ABU dega tik su abiem jungikliais.",
│ +        "bentBaigta": "Kortelė BENT VIENAS dega ir su vienu.",
│ +        "lyginu": "Ta pati pora jungiklių. Kita kortelė, kita lempa.",
│ +        "ne": "NE apverčia. Kur buvo tamsu, dega.",
│ +        "uzversta": "Kortelė užversta. Išbandyk ir pasakyk, kuri tai.",
│ +        "atversta": "Kortelė atversta. Palygink su savo atsakymu.",
│ +        "vel": "Valom nuo pradžių. Abu jungikliai išjungti."
│ +      }
│ +    }
│ +  },
│ +  "tasks": [
│ +    {
│ +      "q": "Kortelė ABU. Įjungtas tik kairys jungiklis. Ar dega lempa?",
│ +      "options": [
│ +        "Taip, lempa dega",
│ +        "Ne, lempa nedega",
│ … omitted 66 diff line(s) across 1 additional file(s)/section(s)
│ content/lt/grade-01/matematika/35-logines-operacijos-ir-arba-ne.json
│ @@ -101,7 +101,7 @@
│          "Taip, skambės"
│        ],
│        "answer": 2,
│ -      "hint": "Ši taisyklė tokia pat kaip viena kortelė modelyje.",
│ +      "hint": "Modelyje tokia pat taisyklė buvo ant vienos kortelės.",
│        "why": "Taisyklė reikalauja bent vieno, o abu paspausti jos netrikdo."
│      },
│      {
│ content/lt/grade-01/matematika/35-logines-operacijos-ir-arba-ne.json
│ @@ -113,7 +113,7 @@
│        ],
│        "answer": 1,
│        "hint": "Prisimink lentelę: kiek eilučių degė su kiekviena kortele.",
│ -      "why": "Su vienu nedega, su abiem dega — taip elgiasi tik kortelė ABU.",
│ +      "why": "Su vienu nedega, su abiem dega. Taip elgiasi tik kortelė ABU.",
│        "optional": true
│      }
│    ],
│ content/lt/grade-01/matematika/35-logines-operacijos-ir-arba-ne.json
│ @@ -0,0 +1,147 @@
│ +{
│ +  "id": "35-logines-operacijos-ir-arba-ne",
│ +  "grade": 1,
│ +  "strand": "matematika",
│ +  "title": "Kortelė pasako, kada degs lempa",
│ +  "subtitle": "Trys kortelės, ta pati pora jungiklių, kita lempos būsena",
│ +  "minutes": 9,
│ +  "outcomes": [
│ +    "Pasakau, kada lempa degs, kai žinau kortelės taisyklę.",
│ +    "Palyginu tris korteles su tais pačiais jungikliais.",
│ +    "Paaiškinu, kad lempą valdo taisyklė, o ne jungiklis."
│ +  ],
│ +  "concept": {
│ +    "title": "Taisyklė, o ne lempa",
│ +    "big_idea": "Ta pati pora jungiklių dega kitaip, nes taisyklę pasako kortelė. Lempa pati nieko nenusprendžia.",
│ +    "steps": [
│ +      "Pasirink kortelę ir pažiūrėk, ką ji žada.",
│ +      "Spėk, ar degs, tada įjunk jungiklį.",
│ +      "Palygink spėjimą su lempa lentelėje.",
│ +      "Pasirink kortelę NE ir palygink."
│ +    ],
│ +    "example": "Žaislinis robotas važiuoja, kai įjungtas jo jungiklis ir uždėta baterija."
│ +  },
│ +  "sim": {
│ +    "component": "taisykle-ir-lempa",
│ +    "config": {
│ +      "switches": [
│ +        { "key": "kaire", "label": "Kairys" },
│ +        { "key": "desine", "label": "Dešinys" }
│ +      ],
│ +      "cards": [
│ +        { "key": "abu", "label": "ABU", "op": "IR", "gloss": "reikia abiejų" },
│ +        { "key": "bent", "label": "BENT VIENAS", "op": "ARBA", "gloss": "užtenka vieno" },
│ +        { "key": "ne", "label": "NE", "op": "NE", "gloss": "ne abu" }
│ +      ],
│ +      "cases": [
│ +        { "key": "kaire", "label": "tik kairys" },
│ +        { "key": "desine", "label": "tik dešinys" },
│ +        { "key": "abudu", "label": "abu įjungti" }
│ +      ],
│ +      "labels": {
│ +        "on": "Degs",
│ +   

… PRALEISTA 53305 SIMBOLIŲ IŠ 71305 (įrankių išklotinės) — visa ataskaita: agents/work/metodininkas/00529/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

todėl performuluotas į „Modelyje tokia pat taisyklė buvo ant vienos kortelės.“ Toliau sąmoningai vengta žodžio „arba“ visuose vaikui skaitomuose laukuose, kuriuos tikrina `AMBIGUOUS` (`check_language.py:108`): operatorius „ARBA“ gyvena tik `concept.big_idea` ir `sim.config.cards[].op`, o kortelės užrašas vaikui yra „BENT VIENAS — užtenka vieno“. Taip dviprasmybės vartas nebūna apeinamas — jis neturi ko rasti, nes kortelė pati pasako savo reikšmę.
│ +Pirmoji juodraščio versija davė **du tikrus radinius**, ir abu pataisyti, o ne apeiti: 4 užduoties `why` buvo 11 žodžių (riba — 10) ir skaidytas į du sakinius; 3 užduoties `hint` prasidėjo įvardžiu „Ši“ (`check_language` „neaiški nuoroda pradžioje“), todėl performuluotas į „Modelyje tokia pat taisyklė buvo ant vienos kortelės.“ Toliau sąmoningai vengta žodžio „arba“ visuose vaikui skaitomuose laukuose, kuriuos tikrina `AMBIGUOUS` (`check_language.py:107`): operatorius „ARBA“ gyvena tik `concept.big_idea` ir `sim.config.cards[].op`, o kortelės užrašas vaikui yra „BENT VIENAS — užtenka vieno“. Taip dviprasmybės vartas nebūna apeinamas — jis neturi ko rasti, nes kortelė pati pasako savo reikšmę.
│
│  Įspėjimas paliktas sąmoningai ir neapeitas: komponento dar nėra, todėl `sim.config` gyvumo (LL-61) patikrinti negalima. Jį privalo paleisti tas, kas rašys `taisykle-ir-lempa` į `matematika.js`: su tikru komponento kūnu tas pats vartas turi duoti 0 įspėjimų. Rankinė patikra be modulio: kiekvienas `config` raktas (`switches`, `cards`, `cases`, `labels`, `sentences` ir jų vidus) turi atsirasti komponento kūne, o `lit()` turi būti lyginamas su `op` reikšmėmis `"IR"`, `"ARBA"`, `"NE"`, ne su kortelės vardais.
│
│ research/wiki/grades/01/metodai.md
│ @@ -1666,7 +1666,7 @@
│
│  **Viena didelė idėja.** Lempą valdo ne jungiklis ir ne pati lempa, o taisyklė, kurią pasako kortelė. Toje pačioje poroje jungiklių trys kortelės duoda tris skirtingas lempos būsenas. Todėl klausimas „kodėl dega?“ turi antrą dalį: „pagal kurią taisyklę?“
│
│ -**Ką sako programa ir ko platformoje nėra.** B2.3 yra 1–2 klasių stulpelyje ir apima komandų seką bei pasirinkimo komandą, bet loginės operacijos jame išvardytos atskirai — kaip tai, ką vaikas turi **skirti**, o ne apibrėžti. Platformoje komandų seka jau yra (`24-komandu-seka`), grandinės vientisumas — `01-elektros-grandine`, o jungiklio ir mygtuko skirtumas — `07-elektronika`. Nė vienas iš jų neturi sąryšio „įėjimai → išėjimas“: `grep -rin "logines operacij\|loginių operacij" content/lt/grade-01/` → **0** eilučių, `grep -rln "jungik" content/lt/grade-01/*/*.json` → 2 failai (abi technologijos). Loginių operacijų pozicijos nėra ir `research/wiki/curriculum/backlog.json` (47 pozicijos, `grep -o "operacij[a-z]*"` → 0), todėl šis modulis negalėjo atsirasti iš padengties eilės — tik iš pasiūlymo.
│ +**Ką sako programa ir ko platformoje nėra.** B2.3 yra 1–2 klasių stulpelyje ir apima komandų seką bei pasirinkimo komandą, bet loginės operacijos jame išvardytos atskirai — kaip tai, ką vaikas turi **skirti**, o ne apibrėžti. Platformoje komandų seka jau yra (`24-komandu-seka`), grandinės vientisumas — `01-elektros-grandine`, o jungiklio ir mygtuko skirtumas — `07-elektronika`. Nė viename iš jų taisyklė neegzistuoja kaip atskiras, keičiamas dalykas: jungiklis ten vienas, o jo elgsena — paties daikto savybė. Patikra: `grep -rin "logines operacij\|loginių operacij" content/lt/grade-01/` → **0** eilučių, `grep -rln "jungik" content/lt/grade-01/*/*.json` → 2 failai (abi technologijos). Loginių operacijų pozicijos nėra ir `research/wiki/curriculum/backlog.json` (47 pozicijos, `grep -o "operacij[a-z]*"` → 0), todėl šis modulis negalėjo atsirasti iš padengties eilės — tik iš pasiūlymo.
│
│  **Kodėl modelis, o ne paveikslėlis ir ne sakinys.** Paveikslas su trimis degančiomis eilutėmis jau pasako atsakymą, o sakinys „kortelė BENT VIENAS reiškia bent vieną“ pasako jį dar tiesiau. Abu jie turi tą pačią ydą: vaikas neturi ką patikrinti. Modelis duoda vienintelį dalyką, kurio paveikslas negali — **tą pačią porą jungiklių su kita kortele**, kai jungikliai nejuda nė per pikselį, o keičiasi tik kortelė. Tada priežastis atsiskiria nuo daikto mechaniškai, o ne iš teksto. Antras interaktyvumo argumentas — spėjimas prieš kiekvieną įjungimą: be jo modelis virstų lempučių demonstracija.
│
│ research/wiki/grades/01/metodai.md
│ @@ -1682,7 +1682,7 @@
│
│  **Klaidingos nuostatos ir kaip jos paneigiamos.**
│
│ -1. **„Kiekvienas jungiklis uždega lempą.“** Vaikas įjungia vieną jungiklį ir laukia šviesos; kortelė ABU jos neduoda. Paneigiama ne tekstu, o tuo, kad tas pats jungiklis įjungiamas su visomis trimis kortelėmis tame pačiame kadre, o jungiklio padėtis ir lempa nesutampa dvejose iš trijų.
│ +1. **„Kiekvienas jungiklis uždega lempą.“** Vaikas įjungia vieną jungiklį ir laukia šviesos; kortelė ABU jos neduoda. Paneigiama ne tekstu, o tuo, kad tas pats vienas įjungtas jungiklis su trimis kortelėmis duoda dvi skirtingas pasekmes: su ABU tamsu, su BENT VIENAS ir su NE — dega.
│  2. **„Jei parašyta ARBA, tai reiškia vieną, o ne abu.“** Tai ne išgalvota klaida — taip „arba“ vartojama kasdienėje kalboje ir taip jį komandos užduotyje supranta 5–7 metų vaikai (Braine ir Rumain, 1981; Morris, 2008). Paneigiama dviem dalykais: kortelėje parašyta „užtenka vieno“, o lentelė rodo **tris** degančias eilutes. Modelis sąmoningai neklausia „ką reiškia žodis arba“ — jis klausia „ką daro ši kortelė“, todėl klaidinga nuostata apie žodį lieka teisinga, o apie kortelę — ne (LL-18).
│  3. **„NE išjungia lempą.“** Vaikas NE supranta kaip išjungimo mygtuką. Modelis rodo priešingai: sujungus abu jungiklius kortelė ABU dega, o kortelė NE — ne; kai abu išjungti, ABU tyli, o NE dega. Neigimas čia yra **apvertimas**, ir jis matomas kaip dviejų lentelių veidrodis.
│  4. **„Lempa pati žino, kada degti“** (daikto savybė). Tai ta pati nuostata kaip M-06 („spalva yra daikto pavadinimas“) ir M-07 („skaičius pasako ilgį“), tik apie elgseną. Paneigiama tuo, kad lempa nekinta nė karto: keičiasi tik kortelė, o lempa paklūsta.
│ research/wiki/grades/01/metodai.md
│ @@ -1757,7 +1757,7 @@
│
│  Dešimt savybių, kurių negalima praleisti:
│
│ -- **Vienas kintamasis:** `case` — kurį iš trijų jungiklių derinių vaikas bando. Kortelė yra **raundo sąlyga**, o ne antras kintamasis: ji keičiama tik tada, kai lenta baigta, ir tada lentelė pradedama iš naujo, o požymis lieka. Jungiklių padėtis, lempos vieta ir kortelės dydis nekinta nė karto — tai modelio teiginys, o ne dekoracija (LL-27).
│ +- **Vienas kintamasis:** `case` — kurį iš trijų jungiklių derinių vaikas bando. Kortelė yra **raundo sąlyga**, o ne antras kintamasis: ją pakeitus lentelė pradedama iš naujo (nebaigtos eilutės išvalomos), o jau baigtų lentelių požymiai lieka matomi. Kortelė niekada neužrakinama — jei vaikas nori grįžti atgal, jis grįžta ir bando iš naujo be jokių nuobaudų (LL-04). Jungiklių padėtis, lempos vieta ir kortelės dydis nekinta nė karto — tai modelio teiginys, o ne dekoracija (LL-27).
│  - **Pirma lentelės eilutė rodoma iš karto.** Abu išjungti — pradinė padėtis, kurią vaikas mato įėjęs, todėl ji įrašoma į lentelę be spėjimo. Be jos modelis turėtų trijų eilučių lentelę ir ketvirtą nepaaiškintą lempos būseną; su ja lentelė yra **pilna** (visi keturi įėjimai), o vaikui nereikia nė vieno papildomo bakstelėjimo.
│  - **Geometrija 360 px:** scena `viewBox="0 0 328 300"`, `max-width:328px`, `width:100%`; jungiklių dėžutės 72 × 72 px (x 24–96 ir 232–304, y 150–222), lemputė `art.ball(164, 92, 26)`, lentynėlė `art.plank(8, 222, 312, 12)`, kortelės lizdas 132 × 56 px (x 98, y 236). Lentelė — HTML po scena: trys stulpeliai 128 / 92 / 92 px ir du 8 px tarpai = 328 px, keturios eilutės po 34 px; šriftas `var(--fs-s)` (15,2 px), ne mažesnis (LL-06, LL-164). Kortelių sąrašas — **vertikali** trijų mygtukų kolona po 328 × 56 px, o ne trys mygtukai vienoje eilutėje: „BENT VIENAS“ telefone netelpa į trečdalį pločio ir lūžtų žodis (LL-186). Jokio horizontalaus slinkimo.
│  - **Įėjimai ir klaviatūra:** jungiklių dėžutės `<button>` po 72 × 72 px (`aria-pressed`), trys spėjimo mygtukai ≥ 48 px, „Įjunk“ 328 × 56 px, trys kortelių mygtukai 328 × 56 px, „Iš naujo“ ≥ 48 px. `Tab` eilė: kairys → dešinys → spėjimas → „Įjunk“ → kortelės → „Iš naujo“; `Enter` / `Space` aktyvuoja; `aria-live="polite"` — `readout`.
Darbas įrašytas. Ataskaita:

KĄ PADARIAU (failai, ne aprašymas)

  1) research/wiki/grades/01/metodai.md — naujas M-17 „Taisyklė, o ne lempa:
     ta pati pora jungiklių, trys kortelės“ (pasiūlymas #50535, target
     content/lt/grade-01/matematika/35-logines-operacijos-ir-arba-ne.json).
     Yra: 5 žingsnių seka, sim.config blokas, 8 būsenų lentelė su readout ir
     api.note, lit(card,a,b) išvedimo taisyklė, geometrija 360 px, fokaso seka
     (LL-32), api.progress tik po visų trijų lentelių (LL-17, LL-29), 4 užduotys
     (indeksai 1/0/2/1) su tipinėmis klaidomis, 6 modelio ribos, 6 DOI šaltiniai.

  2) research/wiki/foundations/taisykle-ir-daiktas.md — naujas pagrindo įrašas
     (vaikas elgseną priskiria daiktui, ne sąryšiui; daiktas fiksuojamas,
     keičiama taisyklė; kiekviena taisyklė atskiriama bent vienu atveju) +
     eilutė foundations/README.md lentelėje.

  3) agents/proposals/2026-11-25-metodininkas-logines-operacijos.json —
     type: metodas, priority: high, 14 evidence įrašų su failų eilutėmis.

  4) research/wiki/guidelines/klausimai.md — B2.3 neturi pozicijos
     backlog.json (47 eilutės, grep „operacij“ → 0), todėl padengties eilė šio
     modulio niekada neprašys ir po įrašymo neužskaitys.

  5) research/wiki/changelog.md — įrašas 2026-11-25 (08:35).

KUR PATAISIAU IDEATORIŲ (ir kodėl)

  Ideatorius siūlė, kad vaikas pasirinktų taisyklę ir pamatytų, jog „arba“ leidžia
  abu. Tyrimai rodo, kad tas pats 5–6 m. vaikas komandos užduotyje „arba“ supranta
  IŠSKIRTINAI, o tikrumo įvertinimo užduotyje — jungtiniškai (Braine & Rumain
  1981), o literatūra apskritai nesutaria (Jasbi & Frank 2021 rado daug artimesnį
  suaugusiesiems supratimą). Todėl:
  - „arba“ reikšmė nepaversta klaida (LL-18): kortelė turi užrašą „užtenka vieno“,
    o modelio ribose pasakyta, kad kasdienė vartosena lieka išskirtinė (Morris 2008);
  - NE tapo atskira kortele, kuri neigia vieną sakinį („abu įjungti“), o ne trečiąja
    nepriklausoma taisykle — 6–7 m. vaikui NE be neigiamo sakinio neturi ką apversti;
  - pridėtas spėjimas prieš kiekvieną įjungimą ir keturių eilučių lentelė, nes be jų
    pasekmė matoma, o sąryšis — ne.

PATIKRA (realūs paleidimai)

  Juodraštinis modulis laikinai įrašytas target kelyje, tada ištrintas:
      validate_content.check_module → 0 klaidų, 1 įspėjimas
        (komponento taisykle-ir-lempa kūno nėra → sim.config gyvumas nepatikrintas)
      check_language.check_module   → 0 radinių
  Pirmoji versija davė du TIKRUS radinius, abu pataisyti, ne apeiti: 4 užduoties
  why buvo 11 žodžių (riba 10), 3 užduoties hint prasidėjo įvardžiu „Ši“.
  Po ištrynimo:
      validate_content.py --grade 1 --strict → 0 klaidų, 0 įspėjimų
      check_language.py --grade 1 --strict   → 0 klaidų, 0 įspėjimų (53 pastabos)
      check_agents.py rc 0 (1 senas įspėjimas, ne mano)
      check_refs.py 27/27; check_lessons.py 190; check_docs_facts.py sutampa
  git status: content/ ir assets/ neliesti — liko 4 wiki failai + 2 nauji.

KO NEDARIAU

  - Modulio nesukūriau (kūrėjo darbas), todėl ataskaitos pirma eilutė be
    „ĮGYVENDINTA:“ — #50535 tikslo failas dar neegzistuoja, pasiūlymas lieka eilėje.
  - Naujos pamokos nepridėjau: defekto repo nepamačiau, o pamokos rašomos tik iš
    realaus defekto. Vietoj to atskyrimo reikalavimas (kiekviena taisyklė turi bent
    vieną atskiriamąjį atvejį; IR 0/0/1, ARBA 1/1/1, NE 1/1/0 — visos skirtingos)
    įrašytas į metodo specifikaciją ir foundations įrašą.
  - Įspėjimas apie sim.config gyvumą paliktas sąmoningai: komponento dar nėra, tad
    LL-61 patikrinti negalima. Tai turės padaryti tas, kas rašys sim į matematika.js.
  - backlog.json netaisytas — ne metodininko failas; klaida aprašyta klausimai.md.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-5efaf80a7e6921cf1c09c5816f058071e78e1458d996bdc627d58f7f1e3aed3c
```
