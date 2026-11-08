# metodininkas — 2026-11-08T0845 (paleidimas #133)

## Ką pasirinkau ir kodėl

Eilėje nebuvo nė vieno `new` tipo `tema` pasiūlymo: visi 22 temų/metodų pasiūlymai yra `done`, `obsolete` arba `blocked` (`agents/runs.db`, užklausa `type in ('tema','metodas')`). Tuo pačiu metu `agents/scope.json` 1 klasei reikalauja septynių minimalių temų, o `agents/scope.py` rodo tris nepadengtas: „garso savybės“, „vandens būsenos“ (klaidingai — modulis `16-vandens-busenos` yra, žr. LL-49) ir **„emocijos“** (teisingai — `grep -rl "jausm\|emocij" content/lt/grade-01/` grąžina 0 failų).

Emocijų tema nebuvo tiesiog pamiršta: ji sąmoningai blokuota `research/wiki/guidelines/klausimai.md:29`, nes ideatorius #2 atmetė formą „situacija → viena teisinga emocija“, o ideatorius #128 užrašė abejonę, kad „gerai nupieštas paveikslėlis su abiem vaikais parodo tą patį“. Tai klausimas, į kurį gali atsakyti būtent metodininkas: ar modelis prideda supratimo, kurio neprideda paveikslėlis.

## Metodas M-05 „Emocijos: tas pats įvykis, skirtingas jausmas“

Įrašytas `research/wiki/grades/01/metodai.md` (naujas skyrius prieš „Atviros prielaidos“, `atnaujinta: 2026-11-08`).

- **Viena idėja.** Jausmas priklauso ne vien nuo įvykio, o ir nuo to, ko žmogus norėjo.
- **Atsakymas į interaktyvumo abejonę.** Paveikslėlis parodo **vieną** būseną, todėl iš jo negalima pasakyti, ar skirtumą padarė dovana, ar noras. Modelis laiko dovaną tą pačią ir keičia tik vieno veikėjo norą; antras veikėjas (nekintantis noras) yra kontrolinė pora — vienas veidas apsiverčia, kitas ne. Be to, modelis reikalauja spėjimo prieš veiksmą, ko paveikslėlis nereikalauja.
- **Seka.** Kūnas (du vienodi pieštukai, du savanoriai, skirtingi norai) → ekranas (Rėjus, Ieva, uždara dėžutė, norų burbulai) → simbolis (žodžiai „patenkintas“ / „nusiminęs“ + sakinys apie norus) → perkėlimas (dovana, filmas, žaidimas).
- **Simuliacija `dovana-ir-noras`**, failas `assets/js/sims/gyvenimas.js`, registracija `assets/js/registry.js` (viena `import` eilutė + `Object.assign` sąrašas). `config: { gift: "kamuolys", other: "knyga", fixed: {name:"Ieva", wants:"knyga"}, varying: {name:"Rėjus", wants:"kamuolys"} }`.
- **Vienas kintamasis:** `varying.wants` ∈ {kamuolys, knyga}. Dovana fiksuota; „Atidaryk dėžutę“ yra žingsnis, ne antra reikšmė.
- **5 būsenos** su `readout` ir `api.note`; `api.progress` žymimas tik po to, kai abiem norais dėžutė atidaryta (LL-29), ne po pirmo pakeitimo.
- **4 užduotys** (indeksai 1, 0, 0, 0): atpažinimas („Dėžutėje kamuolys. Rėjus norėjo knygos.“), taikymas (Ieva/Jonas), perkėlimas (filmas apie šunis), praplėtimas (`optional` — pieštukai, juokas ir nuliūdimas). Kiekviena su `hint` į klaidą ir `why`.
- **Nė viena užduotis neklausia vaiko apie jo paties jausmus** — tai atsakymas ir į ideatoriaus asmens duomenų abejonę. Refleksija: „Kaip sužinotum, ar draugui patiks dovana? Ką darytum?“ (laukiamas atsakymas — paklausti).
- **Modelio ribos pasakytos:** modelis „žino“ norą, nes jis nupieštas burbule; realiai noro nesimato. Modelis rodo du jausmus ir vieną priežastį, nevaizduoja slėpiamo jausmo ir mišrių jausmų (Pons ir kt., 2004 — atskiri komponentai).
- **Teksto ilgiai** patikrinti skriptu: `title` 41 simb. (riba 42), `subtitle` 50 (80), `concept.title` 26 (40), `big_idea` 88 (240); visi ekrano sakiniai ≤ 10 žodžių (ilgiausias 9).

## Kiti failai

- `research/wiki/foundations/jausmas-ir-noras.md` — naujas įrašas (5 šaltiniai), indekso eilutė `foundations/README.md`.
- `research/wiki/guidelines/klausimai.md:29` — klausimas pažymėtas `[x]` ir papildytas atsakymu (pagal paties failo taisyklę: atsakius — perkeliama į `foundations/`).
- `research/wiki/guidelines/pilotai.md` — P-017 (nematomas kintamasis + kontrolinė pora).
- `research/wiki/changelog.md` — 2026-11-08 (08:40) įrašas.
- `agents/proposals/2026-11-08-metodininkas-emocijos.json` — `type: metodas`, `target: content/lt/grade-01/gyvenimo-igudziai/01-dovana-ir-noras.json`, prioritetas `high`.

## Baigtos ankstesnio paleidimo skolos

1. `research/wiki/foundations/kryptis-ir-ziurovo-pozicija.md:22` — „Rigal (1996) su tais pačiais 406 vaikais“ → „Rigal (1996), tyręs 406 vaikus nuo 5 iki 11 metų“. OpenAlex abstrakte sakoma „a group of 406 subjects ranging from 5 to 11 yr.“, bet ne „tie patys vaikai“ kaip 1994 m. tyrime; todėl teiginys susilpnintas iki to, ką šaltinis sako.
2. `research/wiki/grades/01/metodai.md:216` — sugadinta MERGA formuluotė („o ne daugelis robotui apskritai davė komandas“) grąžinta prie šaltinio: „o dauguma robotui komandų „kairėn“/„dešinėn“ iš viso nesakė“. MERGA tekste: „the majority did not use left/right commands at all“.
3. `agents/log/metodininkas-2026-11-07T0820.md` buvo tik bėgiklio diff'as be mano suvestinės — šiandienos ataskaita ją pakeičia turinio prasme; istorijos neperrašinėjau.

## Patikra

- `validate_content.py` → 0 klaidų, 0 įspėjimų (exit 0).
- `validate_content.py --strict` → 0 klaidų, 0 įspėjimų (exit 0).
- `check_language.py --grade 1` → 0 klaidų; įspėjimai (ilgi žodžiai `13-akmenelis-popierius`) buvo prieš darbą.
- `check_lessons.py` → 49 įrašai, visi su 4 laukais.
- `check_agents.py` → 15 vaidmenų (exit 0).
- DOI patvirtinti per Crossref/OpenAlex: Pons ir kt. 2004 (EJDP 1(2) 127–152), Rieffe ir kt. 2005 (ICD 14(3) 259–272), Widen & Russell 2008 (Cogn. Dev. 23(2) 291–312), Saarni 1979 (Dev. Psych. 15(4) 424–429), Harris ir kt. 1986 (Child Dev. 57, 895, DOI 10.2307/1130366).
- Pons ir kt. 2004 abstraktas perskaitytas tiesiogiai (100 vaikų, 3–11 m., devyni komponentai, trys tarpsniai, hierarchinis ryšys) — metodas remiasi tuo, ką abstraktas sako, o ne santrauka.

## Kas liko / pastebėjimai

1. **Eilėje nėra nė vieno `new` temų pasiūlymo.** Tai reiškia, kad metodininkas nebegali dirbti pagal savo taisyklę „imk `new` pasiūlymą“ — šį kartą darbas atliktas pagal privalomą `agents/scope.json` sąrašą ir atvirą klausimą. Tai sistemos, o ne šio vaidmens problema: ideatoriaus eilė turi gaminti naujas temas, bet negamina.
2. `agents/scope.py` „vandens būsenos“ vis dar rodo `covered=False`, nors modulis yra (LL-49). Priėmimas #5047 tai jau registruoja — nekartoju.
3. Modulis dar nesukurtas: kūrėjui reikės naujos krypties `gyvenimo-igudziai` (`index.json`), `path.json` įrašo, `assets/js/sims/gyvenimas.js` ir `registry.js` eilutės, taip pat garso įrašų (5 frazės).
4. „Garso savybės“ lieka vienintelė privaloma tema be metodo: modulis `muzika/01-garso-aukstis` jau yra, bet M- metodo tam neturime — kandidatas kitam paleidimui.
