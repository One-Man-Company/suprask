# metodininkas — 2026-11-04T0826

- paleidimas: #5
- trukmė: apie 3 min.
- modelis: deepseek/deepseek-v4.1-flash (profilias deepseek41flash)
- išėjimas: 1 metodas, 1 foundations įrašas, 1 pilotas
- būsena: ok

## Ką pasirinkau

**#1 [tema/high] Laikas: dvi rodyklės sujungtos** → `content/lt/grade-01/matematika/15-laikas.json`.

Prioritetas high, o tarp high pasiūlymų seniausias (2026-11-03T16:58, paleidimas #2).
Kiti high (#2 pinigai, #11 kryptys, #12 lygybė) palikti kitiems paleidimams — vienas
paleidimas, vienas metodas.

Atrankos patikra pagal gairių 4 skyrių:
1. Programa — „nusakyti laiką pilnomis valandomis“ (`matematika-1-klase.md:129`).
2. Interaktyvumas — ryšys tarp rodyklių yra mechaninis, jo nepaaiškina nei tekstas, nei paveikslėlis.
3. Klaidinga nuostata — valandas priskirti ilgajai rodyklei; artimiausio skaičiaus strategija (Williams, 2012).
4. Amžius — vienas kintamasis, jokių minučių, 10 žodžių sakiniai.
5. Nedubliavimas — `04-skaiciu-tiese` moko judėjimo tiese, `05-desimtukas` — dešimtuko struktūros; laikrodžio ciferblatas nei vieno nekartoja.

## Metodas (M-01 „Vienas ratas, vienas žingsnis“)

**Idėja.** Ilgoji apeina vieną ratą — trumpoji pasislenka vienu skaičiumi; pilną valandą
skaitome pagal trumpąją, kai ilgoji ties 12.

**Seka.** Kūnas (apeiti kėdę = ratas, popierinė rodyklė = žingsnis) → ekranas (dvi sujungtos
rodyklės, vaikas traukia ilgąją) → simbolis („3 val.“) → perkėlimas (rodyklių atpažinimas
pagal judėjimą; valanda įvykių sekoje).

**Simuliacija** `laikrodis-sujungtos-rodykles`, `assets/js/sims/matematika.js`:
vienas kintamasis `t` (0–1 rato), trys įėjimai (tempimas ratlankiu, ←/→ po 30°, mygtukas
„Pasūk vieną ratą“), trys būsenos (0 ratų / ratas nebaigtas / ratas baigtas), jokių minučių
brūkšnelių ir jokių minučių skaičių. Rodyklės skiriasi ilgiu ir forma, ne vien spalva.
Garsas — uždaras 12 frazių rinkinys su taisyklinga gramatika (1 valanda / 2–9 valandos /
10–12 valandų), kad `check_audio.py` manifestas neliktų didelis.

**Užduotys.** 1) atpažinimas (ilgoji ties 12, trumpoji ties 7); 2) taikymas (9 val. + vienas
ratas); 3) perkėlimas (kuri rodyklė rodo valandas, kai žymenų nėra); 4) `optional` —
pusė rato, ar jau kita valanda.

**Sąmoningai atmesta.** Minutės (2 klasės turinys — `matematika-1-klase.md:166`), 24 valandų
sistema (antra sąvoka — atskiras modulis), bendras „laikrodžio dalių“ sąrašas (T1.6 draudžia
temų apžvalgą vietoje vienos problemos).

## Ką užrašiau

1. `agents/proposals/2026-11-04-metodininkas-laikas.json` — pasiūlymas `type: metodas`, high.
2. `research/wiki/grades/01/metodai.md` — naujas skyrius „Metodai“, M-01 su visa specifikacija.
3. `research/wiki/foundations/sujungti-dydziai.md` — bendresnė įžvalga: kai modelis sujungia
   du dydžius, teisingas rezultatas nustoja būti supratimo įrodymu (Earnest ir kt., 2017).
   Todėl būtinas spėjimas prieš pirmą judesį ir užduotis apie patį ryšį.
4. `research/wiki/guidelines/pilotai.md` — P-003 (pirmoji simuliacija su priklausomais dydžiais
   ir su tempimu ratu; T6.1 reikalavimas naujam dizaino sprendimui).

## Patikros

- `python3 scripts/validate_content.py` → 0 klaidų, 0 įspėjimų (turinys nekeistas — modulio dar nėra).
- proposal JSON validus, visi privalomi laukai (role, run_id, created, type, title, body,
  target, priority, status, evidence).
- Kiekviena užduotis turi užuominą, nukreipiančią į klaidą, o ne į atsakymą (T3.1).
- Simuliacijos tekstas: 3–5 žodžių readout, jokių laikmačių, jokių „game over“.
- Šaltiniai patikrinti šiame paleidime: Earnest, Gonzales ir Plant (2018, JNC 4(1), 188–214);
  Earnest ir kt. (2017, PME-NA, ERIC ED581317); Williams (2012, JLS 21(2), 216–246).

## Ką palieku kitiems

- `kurejas` — modulio JSON pagal M-01; atsakymų indeksai turi praeiti pasiskirstymo patikrą.
- `simuliaciju-inzinierius` — komponentas `laikrodis-sujungtos-rodykles`; pirmiausia reikia
  nuspręsti, ar tempimas ratlankiu veikia 360 px ekrane taip pat, kaip 720 px (P-003 matavimo dalis).
- Neišspręsta: ar spėjimo sakinys rodomas `readout` (kaip siūlau), ar atskiru `.sim-note` —
  tai UX sprendimas, ne metodo dalis.
