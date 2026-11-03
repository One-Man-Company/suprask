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

Agentai gyvena `agents/` kataloge ir paleidžiami `systemd --user` timeriais per `agents/run.py`. Kiekvienas paleidimas įrašomas į `agents/runs.db` (SQLite).

| vaidmuo | dažnis | ką daro | išėjimas |
|---|---|---|---|
| `tikrintojas` | kasdien 06:40 | validuoja turinį, nuorodas, simuliacijų registrą | ataskaita, issue |
| `tyrejas` | pirmadienis 07:00 | ieško tyrimų ir metodų | wiki įrašai |
| `ideator` | kasdien 07:10 | ieško naujų pamokų idėjų pagal programos spragas | 1–3 pasiūlymai |
| `metodininkas` | kasdien 08:20 | projektuoja mokymo metodą ir simuliacijos scenarijų | metodo pasiūlymas |
| `kurejas` | kasdien 09:30 | kuria modulį pagal patvirtintą metodą | PR |
| `simuliaciju-inzinierius` | kasdien 11:00 | kuria ir tobulina simuliacijas | PR |
| `dizaineris` | II, IV, VI 12:30 | tobulina struktūrą (`path.json`) ir sąsają | PR + pilotas |
| `kritikas` | kasdien 14:00 | nepriklausoma kritika: pedagogika, UX, teiginiai, gairės | kritikos įrašai, blokavimai |
| `programos-derintojas` | I, IV 15:00 | derina turinį su oficialia programa | atitikties pasiūlymai |
| `leidejas` | kasdien 16:30 | sujungia patikrintus PR, atnaujina changelog | sujungti PR |
| `sveikatos-inspektorius` | ketvirtadienis 06:50 | tikrina gyvą svetainę ir našumą | ataskaita, issue |
| `kuratorius` | sekmadienis 18:00 | savaitės suvestinė ir prioritetai | suvestinė |

Ciklas: **ieška → metodas → turinys → simuliacija → kritika → leidimas**. Kritikas ir leidėjas yra atskirti sąmoningai: kas kuria, tas nevertina; kas vertina, tas neleidžia; kas leidžia, tas nekuria.

Visi agentai privalo laikytis `docs/SVIETIMAS-1-GAIRES.md`; pažeidimas laikomas klaida, o ne kūrybiškumu.

Pasiūlymai rašomi į `agents/proposals/*.json` ir suindexuojami į DB. Blokavimo žymos — `agents/proposals/blocks/pr-<n>.json`.

## Struktūros kaita

Klasės mokymosi tvarka gyvena `content/lt/grade-XX/path.json` (`sequence` sąrašas). Tai leidžia keisti maršrutą neperrašant turinio:

- `dizaineris` gali pasiūlyti kitą tvarką (ne daugiau 2 pakeitimų per paleidimą), pagrįstą priklausomybėmis;
- validatorius tikrina, kad visi moduliai egzistuotų ir seka nebūtų tuščia;
- sąsaja rodo „Tęsk nuo čia“ pagal šią seką — vaikui visada vienas aiškus kitas žingsnis.

## Garsas

Lietuviškas garsas generuojamas iš anksto, ne naršyklėje:

- `scripts/generate_audio.py` → `assets/audio/lt/{n|s}/<sha256-prefix>.mp3` (balsas `lt-LT-OnaNeural`, `edge-tts`);
- `assets/js/speech.js` parenka failą pagal teksto SHA-256 ir jo groja; jei įrašo nėra (dinaminis sakinys), naudoja naršyklės balsą;
- du variantai: `n` (normalus, −6 %) ir `s` (lėtas, −16 %, skiemenims ir raidėms);
- `prime()` iš anksto įkelia modulio garso failus, kad pirmas paspaudimas negrotų tuščiai.

## Dashboard (vidinis)

`dashboard/server.py` — stdlib HTTP serveris, skaitantis `agents/runs.db`. Rodo suplanuotus paleidimus, istoriją, pasiūlymus, turinio statistiką ir leidžia paleisti vaidmenį rankiniu būdu.

- Adresas: `http://100.118.226.11:9410/` (Tailscale), **ne** viešas.
- **Jokio prisijungimo ekrano** — prieigą riboja Tailscale tinklas; serveris klausosi tik tailscale0 IP. Papildomas sluoksnis įjungiamas `SUPRASK_DASH_AUTH=on`.
- `systemd --user suprask-dashboard.service`.

## Būsena

- **Live:** 1 klasė — 4 kryptys, 13 modulių, 13 simuliacijų.
- **Ruošiama:** 2–12 klasės (struktūra ir tyrimai wiki lygmenyje).

## Publikavimas

`.github/workflows/pages.yml` publikuoja `main` šaką į GitHub Pages. Jokio surinkimo. Po push svetainė atnaujinama per 1–2 minutes.

## Apribojimai, kuriuos verta žinoti

- `fetch` reikalingas turiniui; atidarius `index.html` tiesiogiai iš disko (file://), moduliai neįkeliami — reikia serverio (`python3 -m http.server`).
- Balsas priklauso nuo naršyklės lietuviško balso; jei jo nėra, tekstas skaitomas tyliai (funkcija neblokuoja mokymosi).
- `localStorage` gali būti išjungtas privataus naršymo režimu — pažanga tiesiog neįsimenama, klaidų nėra.
