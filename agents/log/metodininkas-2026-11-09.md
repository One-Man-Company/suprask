# metodininkas — 2026-11-09 (paleidimas #180)

## Ką pasirinkau ir kodėl

Pagal vaidmens taisyklę (prioritetas `high`, paskui seniausias) eilėje buvo keturi `high` `tema` pasiūlymai: #6539 dailė (2026-11-08 12:33), #6540 dorinis ugdymas (12:35), #7566 kuprinė (2026-11-09), #7567 ritmas (2026-11-09). Seniausias — **#6539 „Dailė: ta pati kompozicija, kita spalva — nuotaika keičiasi, formos ne“**, ir jis atitinka du kartu sutampančius poreikius:

- dailė yra vienas iš keturių privalomų 1 klasės dalykų, neturinčių nė vieno modulio (kartu su doriniu ugdymu, pilietiškumu ir gyvenimo įgūdžiais — pastarasis modulį jau turi);
- pasiūlyme yra aiški klaidinga nuostata ir aiškus vienas kintamasis, t. y. jis praeina gairių 4 skyriaus penkis klausimus be išlygų.

Pasiūlymo teiginiai patikrinti tiesiogiai: `sources/pradinio-bp-rekomendacijos-2024.txt:2714` („2 pavyzdys. 2 pamokų ciklas 1 klasei. Tema: „Kaip susikūrė pasaulis.““), `:2717–2718` („Tyrinėja ir apibūdina skirtingas spalvų ir dėmių sukuriamas nuotaikas, ritmą“), `:2622–2625` (1–2 kl. amžiaus ypatumai), `research/wiki/curriculum/kti-dalykai-1-klase.md:13` (trys dailės pasiekimų sritys) ir `:22` (1 kl. pamokų ciklas). Vienas pasiūlymo teiginys apie kodą netikslus: jame rašoma, kad `scope.py STRAND_SUBJECT` „neturi“ dailės rakto — iš tikrųjų `agents/scope.py:109–110` turi ir `"dailė"`, ir `"daile"`. Todėl metode strand id fiksuotas kaip ASCII `daile` (abi reikšmės veiktų, bet ASCII raktas yra tas, kuris jau naudojamas kituose failuose).

## Metodas M-06 „Dailė: ta pati forma, kita spalva“

Įrašytas `research/wiki/grades/01/metodai.md` (naujas skyrius prieš „Atviros prielaidos“, `atnaujinta: 2026-11-09`).

- **Viena didelė idėja.** Forma pasako, *kas* nupiešta; spalva — *kaip* į tai žiūrima. Toje pačioje formoje kita spalva keičia įspūdį, o piešinys lieka tas pats.
- **Kodėl modelis, o ne paveikslėlis.** Du paveikslai greta neįrodo, kad formos liko tos pačios. Modelis laiko geometriją nepajudinamą ir keičia tik didelės dėmės užpildą, o grįžimas į ankstesnę spalvą parodo lygiai tą patį vaizdą — tai kontrolinis bandymas, kurio paveikslėlis negali duoti.
- **Kodėl abstrakti dėmė, o ne peizažas.** Peizaže spalva turi antrą reikšmę (metų laikas — jau `08-metu-laikai`), o daiktas kviečia jį pavadinti („saulė negali būti mėlyna“). Dėmė neturi pavadinimo, todėl klausimas lieka apie spalvą. Tai ir programos turinys (`:2717–2718`).
- **Klaidingos nuostatos (4).** „Spalva yra daikto pavadinimas“; „jei atrodo kitaip, tai ir nupiešta kitaip“; „spalva tik puošia, prasmę neša forma“; „yra viena teisinga nuotaika“ (pastaroji neleidžiama atsirasti, o ne paneigiama).
- **Seka.** Du lapai su ta pačia pieštuku nupiešta dėme (kūnas) → ekranas su keturiais dažais → grįžimas į pirmą spalvą (kontrolė) → simbolis („FORMA“ / „SPALVA“) → perkėlimas (kartoniniai apskritimai, du viršeliai, nespalvota kopija).
- **Simuliacija `deme-ir-spalvos`**, failas `assets/js/sims/daile.js` (naujas), registracija `assets/js/registry.js` (viena `import` eilutė + `Object.assign` sąrašas). `config`: `colors` (4 dažai su `id`/`name`/`hex`), `start`, `sentences` (9 frazės).
- **Vienas kintamasis:** `didelesDemesSpalva` ∈ 4 dažai. Mažos dėmės ir linijos spalva fiksuota (`#3a342b`), padėtis ir dydis konfigūracijoje.
- **Invariantas užtikrintas kodu:** kompozicija įterpiama vieną kartą, keičiamas tik `fill`; inžinieriaus patikra — kiekvienos formos `getBBox()` prieš ir po visų keturių spalvų vienodas. Tai modelio teiginio sąlyga, ne estetika.
- **7 būsenos** su `readout` ir `api.note`; `api.progress({correct:true})` — tik po palyginimo (≥ 2 skirtingos spalvos **ir** grįžimas į jau matytą), ne po pirmo dažo (LL-29); „Iš naujo“ pažangos netrina (LL-16).
- **4 užduotys** (teisingi indeksai 1/2/0/1; 4-a `optional`): atpažinimas (kas pasikeitė), taikymas (ką keisti, norint kitokios nuotaikos), perkėlimas (du viršeliai), praplėtimas (nespalvota kopija). Kiekviena su `hint` į klaidą ir `why`.
- **Nauja `art.js` dalis** `spot(x, y, w, h, color, kind)` — netaisyklingas `path` su `Q` kreivėmis; elipsė atmesta (lygus ovalas atrodo kaip kamuolys, LL-13).
- **9 garso frazės** `config.sentences` (LL-42), kad `scripts/generate_audio.py` jas matytų; `api.note` garsiai neskaitomas.
- **Modelio ribos pasakytos:** viena savybė, jokio potėpio/dydžio/ritmo; modelis neparodo, ką vaikas jaučia; spalvos–jausmo ryšys iš dalies kultūrinis (Palmer & Schloss, 2010; Zentner, 2001), todėl modulis nemoko „mėlyna = liūdna“; nespalvotame spaudinyje lieka forma; daltonikui būsena perskaitoma iš žodžių, bet patirtis silpnesnė — sakoma mokytojo bloke.

## Kiti failai

- `research/wiki/foundations/forma-ir-spalva.md` — naujas įrašas (3 DOI šaltiniai + programa); indekso eilutė `foundations/README.md`.
- `research/wiki/guidelines/pilotai.md` — **P-018** (pirmas modelis, kuriame kintamasis yra paviršiaus savybė, o invariantas užtikrintas kodu).
- `research/wiki/changelog.md` — 2026-11-09 (08:32) įrašas.
- `agents/proposals/2026-11-09-metodininkas-dailes-spalva.json` — `type: metodas`, `target: content/lt/grade-01/daile/01-spalva-ir-nuotaika.json`, prioritetas `high`.

## Šaltiniai (patikrinti)

- **Burkitt, Barrett & Davis (2003)** — Crossref: J Child Psychol Psychiatry 44(3), 445–455, DOI 10.1111/1469-7610.00134; abstraktas perskaitytas per Europe PMC (PMID 12635973): 330 vaikų 4–11 m., trys sąlygos (žmogus, šuo, medis), dvi sesijos; malonioms figūroms — labiausiai mėgstamos spalvos, nemalonioms — mažiausiai mėgstamos, neutralioms — vidutinės; nemalonioms dažniausiai juoda; išvada — „even very young children are able to use colours symbolically“.
- **Zentner (2001)** — Crossref + OpenAlex W2048803496: Developmental Science 4(4), 389–398, DOI 10.1111/1467-7687.00180; abstraktas — 3–4 m. vaikai randa pastovius spalvų ir veido išraiškų ryšius, nors reiškiniai neturi bendrų fizinių savybių.
- **Palmer & Schloss (2010)** — Crossref: PNAS 107(19), 8877–8882, DOI 10.1073/pnas.0906172107; abstraktas — ekologinės valentingumo teorijos testas (mėlyna su giedru dangumi ir švariu vandeniu, ruda su išmatomis ir sugedusiu maistu).
- Metode sąmoningai nesiremiama niekuo, ko abstraktas nesako: Burkitt ir kt. tyrė spalvos *parinkimą* pagal duotą charakteristiką, o ne mokymą atskirti formą nuo spalvos — tai įrašyta ir foundations „Ko šis įrašas nedaro“.

## Patikra

- `validate_content.py --grade 1` → 0 klaidų, 0 įspėjimų (rc 0); `--strict` → 0/0 (rc 0).
- `check_language.py --grade 1` → 0 klaidų; įspėjimai (ilgi žodžiai `13-akmenelis-popierius`) buvo prieš darbą.
- `check_lessons.py` → 64 įrašai, visi su 4 laukais (rc 0).
- `check_agents.py` → 15 vaidmenų, 1 įspėjimas (`sistemos-architektas` nepapildė `system-journal.md`) — buvo prieš darbą.
- `check_docs_facts.py` → 0 klaidų, 0 įspėjimų; `check_art.py` → 5 simuliacijų failai naudoja `art.js`.
- **Teksto ilgiai matuoti skriptu, ne akimis (LL-21):** `title` 33 (riba 42), `subtitle` 50 (80), `concept.title` 22 (40), `big_idea` 94 (240), `concept.example` 3 sakiniai po 6/5/7 ž.; `concept.steps` 60/41/43/36 simb. (riba 200); visi `readout`, `api.note`, užduočių `q`/`hint`/`why`, `outcomes` ir refleksijos sakiniai ≤ 10 žodžių (ilgiausias 9). Pirmoji versija turėjo tris netikslius skaičius (`title` 31, `subtitle` 51, `big_idea` 105) ir 11 žodžių `concept.example` sakinį — visi pataisyti prieš įrašant.
- `check_view.py` netaikytas: sąsaja ir simuliacijos kodas neliesti (modulio dar nėra).

## Kas liko

1. **Modulis dar nesukurtas.** Kūrėjui reikės: naujos krypties `daile` (`content/lt/grade-01/index.json`), `path.json` įrašo (siūloma vieta — tarp `09-augalo-gyvenimas` ir `06-figuros`), `assets/js/sims/daile.js`, `registry.js` eilutės, `art.js` dalies `spot()` ir 9 garso frazių.
2. **Dailė uždengia vieną iš keturių privalomų dalykų be modulio.** Liko dorinis ugdymas (#6540, `high`) ir pilietiškumas (ideatorius 2026-11-09 atmetė kaip paveikslėlį — `klausimai.md`); gyvenimo įgūdžiai jau turi `01-dovana-ir-noras`.
3. **#6540 (dorinis ugdymas) yra kitas pagal eiliškumą** — jo modelis (trys vaikai stato bokštą, vienas nustoja) reikalauja kelių veikėjų būsenų ir bendro rezultato, todėl jam reikės atskiro paleidimo ir, greičiausiai, naujos sim rūšies (ne vieno kintamojo, o eilės ėjimų).
4. `agents/scope.py` „vandens būsenos“ vis dar rodo nepadengtą (LL-49, #5047) — nekartoju.

## Pamokos

Naujo defekto tipo neradau. Pritaikyti iš anksto: LL-21 (skaičiai dokumente perskaičiuoti skriptu — ir trys buvo neteisingi), LL-29 (`api.progress` tik po palyginimo), LL-42 (visi tariami sakiniai `config.sentences`), LL-13 (elipsė dėmei atmesta), LL-23 (išvedžiau tik 1 klasės programos sąvokas: „nuotaika“, „dėmė“, „forma“), LL-36 (pasiūlymo citatos patikrintos tose pačiose eilutėse).
