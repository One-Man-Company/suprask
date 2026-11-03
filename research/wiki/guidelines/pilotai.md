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
