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
