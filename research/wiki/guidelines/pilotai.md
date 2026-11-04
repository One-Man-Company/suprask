# Pilotų registras

Kiekvienas naujas dizaino sprendimas laikomas pilotu (Švietimas #1, 6 žingsnis). Čia registruojama: hipotezė, ką keičiame, kaip matuosime, rezultatas. Sprendimai neplatinami tol, kol nėra rezultato.

## Šablonas

```
### P-000 — pavadinimas
- **Data:**
- **Hipotezė:** jei padarysime X, tai Y pagerės, nes Z (šaltinis).
- **Ką keičiame:**
- **Kaip matuojame:** (konkretus rodiklis, ne „geriau“)
- **Rezultatas:** (data, skaičiai)
- **Sprendimas:** plėsti / tobulinti / stabdyti
```

---

### P-001 — Simuliacija prieš paaiškinimą
- **Data:** 2026-11-03
- **Hipotezė:** jei modulyje simuliacija rodoma prieš išsamų paaiškinimą, vaikas ilgiau išbūna ir geriau atsako į perkėlimo užduotį, nes pirmiau įgyja konkrečios patirties (konkretumas prieš abstrakciją; produktyvios nesėkmės tyrimai).
- **Ką keičiame:** modulio puslapio tvarką — simuliacija iškelta virš „Kaip tai veikia“.
- **Kaip matuojame:** užduočių teisingumo dalis pirmame bandyme ir modulio užbaigimo dažnis. Duomenys nerenkami automatiškai — matuojama tik savanorišku mokytojo stebėjimu.
- **Rezultatas:** dar nėra.
- **Sprendimas:** laukiama duomenų.

### P-002 — Vienas teisingo atsakymo indeksas
- **Data:** 2026-11-03
- **Hipotezė:** jei teisingi atsakymai visada pirmame variante, vaikai pradeda spausti pirmą variantą neskaitę.
- **Ką keičiame:** atsakymų pozicijos perskirstytos (`scripts/rebalance_answers.py`), validatorius tikrina, kad ne visi atsakymai būtų tame pačiame indekse.
- **Kaip matuojame:** nebegalima — klaida buvo pašalinta prieš publikuojant.
- **Rezultatas:** pašalinta.
- **Sprendimas:** taisyklė įtraukta į standartą.

### P-003 — Figūra atpažįstama pagal kampus, ne pagal padėtį
- **Data:** 2026-11-04
- **Hipotezė:** jei rūšiavimo simuliacijoje figūros rodomos pasuktos ir vaikas gali jas sukti pats, o dėžės vadinamos kampų skaičiumi (ne figūros vardu), tai mažiau vaikų klysta su pasukta figūra ir dažniau vadovaujasi savybe, nes 1 klasės programoje figūra apibrėžiama kraštinėmis ir kampais, o dažna klaida — atpažinti tik „kaip paveikslėlyje“ (`06-figuros` `teacher.misconceptions`).
- **Ką keičiame:** `figuros` simuliacija (`assets/js/sims/matematika.js`): figūros pasuktos (0°, 155°, 265°, kvadratas 45°), dėžės žymimos „3 kampai / 4 kampai / 0 kampų“ su figūros kontūru, pridėtas parametras „Pasuk pasirinktą“ ir jungiklis „Rodyk kampus“ (kampai žymimi taškais). Be to, pašalintas 41 px horizontalus slinkimas 360 px ekrane ir figūrų mygtukams suteikti `aria-label`.
- **Kaip matuojame:** klaidų, kai pasukta figūra įdedama į neteisingą dėžę, dalis pirmame bandyme ir tai, ar vaikas savo žodžiais pasako, kad pasukus kampų skaičius nekinta (refleksijos klausimas). Stebėjimas savanoriškas, duomenys nerenkami.
- **Rezultatas:** dar nėra.
- **Sprendimas:** laukiama duomenų.

### P-004 — Sujungtos laikrodžio rodyklės
- **Data:** 2026-11-04
- **Hipotezė:** jei ilgoji ir trumpoji rodyklės modeliuojamos kaip mechaniškai sujungtos (viena negali judėti be kitos), pirmokai dažniau teisingai nurodo pilną valandą ir perkelia taisyklę į naują situaciją, nes ryšį stebi, o ne įsimena. Rizika žinoma iš anksto: sujungtos rodyklės gali duoti teisingą padėtį be supratimo (Earnest ir kt., 2017; `research/wiki/foundations/sujungti-dydziai.md`).
- **Ką keičiame:** pirmoji simuliacija, kurioje dydžiai priklausomi, o pagrindinis įėjimas — tempimas ratu (ne bakstelėjimas). Modulis `15-laikas`, komponentas `laikrodis-sujungtos-rodykles`.
- **Kaip matuojame:** perkėlimo užduoties (rodyklių atpažinimas pagal judėjimą) teisingumas pirmu bandymu ir tai, ar refleksijoje vaikas įvardija patį ryšį („ratas — žingsnis“), o ne tik pakartoja valandą. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
- **Rezultatas:** dar nėra.
- **Sprendimas:** laukiama duomenų. Jei vaikai atsakys teisingai, bet neįvardys ryšio, jungtis lieka, o spėjimo žingsnis ir perkėlimo užduotis stiprinami.
