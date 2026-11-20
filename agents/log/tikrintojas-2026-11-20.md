# Tikrintojas — 2026-11-20 (paleidimas 391)

## Rėmelis (įrašytas prieš giluminius tyrimus)

Platformos būklė paleidimo metu: 48 moduliai, 210 užduočių, 48 simuliacijos, 1 klasė gyva,
1432 garso failai (45,3 MB).

Numatytos patikros:
1. `python3 scripts/validate_content.py` — schema, nuorodos, SIMS registras.
2. `python3 scripts/check_audio.py` — tekstai vs garso failai, 22 050 Hz.
3. `python3 scripts/check_ui.py` — sąsajos klaidų skaičius.
4. `content/lt/grade-01/index.json` ↔ failai ↔ `path.json` ↔ `SIMS` sankirta.
5. Trys gyvi adresai (root, grade-01 index, grades.json) — HTTP kodai.

## Rezultatai

(įrašoma vykdymo eigoje)
