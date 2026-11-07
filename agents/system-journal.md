# Agentų sistemos dienoraštis

Kiekvienas `sistemos-architektas` paleidimas palieka įrašą: ką matė, ką keitė,
kodėl ir kaip patikrino. Seni įrašai netrinami — jie yra sistemos atmintis.

## 2026-11-07 · pradinis įrašas (ne agento)

- **Mačiau:** sistema turi 14 vaidmenų, 18 modulių, 41 neapdorotą pasiūlymą
  (seniausias prieš 4 d.). Istorijoje 18 `conflict` paleidimų; `metodininkas`
  nenaudingas 75 % paleidimų, `programos-derintojas` — 100 % (1 paleidimas).
- **Keičiau:** sukurtas vaidmuo `sistemos-architektas` (20:20 kasdien), įrankiai
  `scripts/system_report.py` ir `scripts/check_agents.py`.
- **Kodėl:** sistema neturėjo nieko, kas žiūrėtų į visumą — kiekvienas agentas
  matė tik savo darbą.
- **Patikra:** `check_agents.py` — 14 vaidmenų (vėliau 15 su architektu), visi su
  failais, grafikais ir ribomis.

## 2026-11-07 21:51 · sistemos-architektas #48 (pirmas paleidimas, įrašas įrašytas vėliau)

- **Mačiau:** 47 paleidimai per 7 d.; 18 `conflict`, 4 `empty`, 1 `rejected`;
  `metodininkas` nenaudingas 75 %, `programos-derintojas` 100 %, `tikrintojas` 60 %.
  41 pasiūlymas „naujas“, seniausias 4 d. Kūrėjo eilė ėmė tą patį įgyvendintą
  darbą iš naujo (#1071).
- **Keičiau:**
  - `agents/run.py` — vietoje ranka įrašytos eilutės „13 modulių, 13 simuliacijų“
    prompte dabar skaičiuojama `headline()` iš failų (kiekvienas agentas matė
    pasenusį skaičių);
  - `agents/db.py` — nauja `runs.detail` stulpelis: konflikto priežastis lieka DB,
    o ne tik stdout'e (todėl 18 konfliktų buvo nepaaiškinami);
  - `scripts/kurejas_queue.py` — „metodas“ su jau sukurtu moduliu atpažįstamas pagal
    git istoriją (failas atsirado PO pasiūlymo) ir nebeduodamas kaip darbas;
  - `research/wiki/guidelines/pamokos.md` — LL-16 „Būsena, kuri grįžta atgal per
    importą“: vienas laukas turi vieną savininką.
- **Kodėl:** visos trys problemos kartojo tą pačią klasę — būsena ar faktas buvo
  dviejose vietose, todėl sistema „pamiršdavo“ priimtus sprendimus.
- **Patikra:** `check_agents.py` ✔ 15 vaidmenų; `validate_content.py` ✔;
  `check_art.py` ✔; `check_lessons.py` ✔ 16 įrašų; publikavimo vartai ✔.
  Po pataisymo pasiūlymo būsena išlieka `done` po `upsert_proposals()` (zondas).
- **Nepadaryta:** dienoraščio įrašo negeneravo pats (šis įrašas įrašytas ranka);
  dėl to `check_agents.py` dabar įspėja, jei po architekto darbo dienoraštis
  nepapildytas.
