# SUPRASK architektūra

## Principai

1. **Jokio vykdymo (build) žingsnio.** GitHub Pages talpina tai, kas yra repo. HTML + CSS + ES moduliai.
2. **Turinys atskirtas nuo kodo.** Moduliai — JSON failai. Kurti turinį gali agentas, nekeisdamas platformos.
3. **Simuliacija — registruojamas komponentas.** Nauja simuliacija pridedama viename faile ir iškart pasiekiama per `sim.component`.
4. **Jokių išorinių priklausomybių.** Nėra CDN, šriftų, analitikos, sekimo. Veikia neprisijungus, kai failai podėlyje.
5. **Duomenų nėra.** Pažanga — `localStorage`, nieko nesiunčiama į serverį.

## Struktūra

```
suprask/
├── index.html                 # vienintelis HTML įėjimas
├── assets/
│   ├── css/main.css           # dizaino sistema (tokenai, komponentai)
│   └── js/
│       ├── app.js             # maršrutizatorius ir vaizdai
│       ├── registry.js        # turinio įkėlimas + simuliacijų registras
│       ├── progress.js        # localStorage pažanga
│       ├── speech.js          # lietuviškas balsas
│       └── sims/              # simuliacijos pagal sritį
│           ├── calba.js
│           ├── matematika.js
│           ├── pasaulis.js
│           └── zaidimai.js
├── content/lt/
│   ├── grades.json            # 12 klasių būsena
│   └── grade-01/              # klasės indeksas + modulių JSON
├── research/wiki/             # Obsidian vault: gairės, tyrimai, klasių struktūros
├── docs/                      # normatyviniai dokumentai
├── agents/                    # agentų vaidmenys, bėgiklis, būsena
├── scripts/                   # validatorius, pagalbiniai įrankiai
├── sources/                   # oficialūs dokumentai (txt + pdf), iš kurių kurtas turinys
└── .github/workflows/         # publikavimas ir patikra
```

## Maršrutai (hash router)

| maršrutas | vaizdas |
|---|---|
| `#/` | pradžia, klasių juosta, kryptys |
| `#/klase/1` | klasės kryptys ir modulių sąrašas |
| `#/klase/1/matematika` | krypties moduliai |
| `#/modulis/1/matematika/04-skaiciu-tiese` | modulis: simuliacija → paaiškinimas → užduotys → refleksija |
| `#/apie`, `#/metodika`, `#/mokytojui` | statiniai puslapiai |

Hash maršrutizatorius pasirinktas sąmoningai: jis veikia iš bet kurio poaplankio (GitHub Pages projektų puslapiai) be serverio perrašymo taisyklių.

## Modulio gyvavimo ciklas

1. `app.js` įkelia `grade-XX/index.json` ir randa modulio įrašą.
2. Įkeliamas modulio JSON pagal `file`.
3. `mountSim()` suranda komponentą `registry.js` registre pagal `mod.sim.component`.
4. Komponentas gauna `{ stage, controls, api, config }` ir grąžina valymo funkciją.
5. `mountTasks()` sugeneruoja užduotis; kiekvienas atsakymas rašomas į `progress.js`.

## Kaip pridėti

**Modulį:** sukurti JSON pagal `docs/KURINIO-STANDARTAS.md`, įrašyti į `index.json`, paleisti validatoriu.
**Kryptį:** įrašyti į `index.json` `strands[]`; atskiro kodo nereikia.
**Klasę:** sukurti `content/lt/grade-XX/index.json`, pakeisti `grades.json`, sukurti wiki struktūrą.
**Simuliaciją:** pridėti į `assets/js/sims/<sritis>.js` ir į to failo `SIMS` eksportą. Jei reikia naujos srities — importuoti `registry.js` faile.
**Kalbą:** sukurti `content/<lang>/` su ta pačia struktūra; `registry.js` `BASE` keičiamas per kalbos pasirinkimą (numatyta `lt`).

## Agentų sistema

Agentai gyvena `agents/` kataloge ir yra paleidžiami sistemos grafiku (`systemd --user` timeriai) per `agents/run.py`.

| vaidmuo | dažnis | ką daro |
|---|---|---|
| `tyrejas` | pirmadienis | ieško naujų tyrimų ir metodų, papildo `research/wiki/` |
| `kurejas` | antradienis | kuria naujus modulius pagal gaires, atidaro PR |
| `tikrintojas` | kasdien | validuoja turinį, tikrina sąsają, registruoja klaidas |
| `sveikatos-inspektorius` | ketvirtadienis | tikrina gyvą svetainę, nuorodas, našumą |
| `kuratorius` | sekmadienis | apibendrina savaitę, atnaujina būseną ir gaires |

Visi agentai privalo laikytis `docs/SVIETIMAS-1-GAIRES.md`; pažeidimas laikomas klaida, o ne kūrybiškumu.

## Būsena

- **Live:** 1 klasė — 4 kryptys, 13 modulių, 13 simuliacijų.
- **Ruošiama:** 2–12 klasės (struktūra ir tyrimai wiki lygmenyje).

## Publikavimas

`.github/workflows/pages.yml` publikuoja `main` šaką į GitHub Pages. Jokio surinkimo. Po push svetainė atnaujinama per 1–2 minutes.

## Apribojimai, kuriuos verta žinoti

- `fetch` reikalingas turiniui; atidarius `index.html` tiesiogiai iš disko (file://), moduliai neįkeliami — reikia serverio (`python3 -m http.server`).
- Balsas priklauso nuo naršyklės lietuviško balso; jei jo nėra, tekstas skaitomas tyliai (funkcija neblokuoja mokymosi).
- `localStorage` gali būti išjungtas privataus naršymo režimu — pažanga tiesiog neįsimenama, klaidų nėra.
