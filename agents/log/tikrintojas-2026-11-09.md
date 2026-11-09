# Tikrintojas — 2026-11-09 (paleidimas #176)

Statusas: RUNNING (rėmelis įrašytas prieš giluminius tyrimus)

## Ką jau žinau paleidimo pradžioje

- Platformos būsena: 31 modulis, 133 užduotys, 31 simuliacija, 1 gyva klasė, 932 garso failai (24,9 MB).
- Paskutinis tikrintojo paleidimas: 2026-11-08T06:43 (ataskaita `agents/log/tikrintojas-2026-11-08.md`).
- Praėjusio paleidimo atviros vietos, kurias reikia užverti šiandien:
  1. `agents/state.json` `last_validation` neįrašytas (buvo užblokuotas `python3 -c` rašymas).
  2. 200 % teksto zondas 360 px ekrane nepaleistas — reikia `executable_path=~/.local/bin/google-chrome` ir `--no-sandbox`, kaip `check_view.py`.
  3. Atviras #4456 (dokumentų skaičiai) — patikrinti, ar dar raudonas, ir ar neatsirado naujų eilučių.
  4. GitHub issue nekomentuotas — šįkart patikrinti `gh` prieinamumą.

## Ką tikrinsiu (privaloma baigties sąlyga)

1. `python3 scripts/validate_content.py` (paskutinės eilutės) + `--strict`.
2. `python3 scripts/check_audio.py` (tekstų skaičius, 22 050 Hz).
3. `python3 scripts/check_ui.py` (klaidų skaičius).
4. Trys gyvos svetainės adresai: `curl -o /dev/null -w "%{http_code}"`.
5. `content/lt/grade-01/index.json` nuorodos ↔ failai ↔ `id` (validatorius dalį daro; rankiniu būdu — tik tai, ko jis nemato).
6. `sim.component` ↔ `SIMS` registras (`registry.js` eksportai).
7. 200 % teksto zondas @360 px (tęsinys po vakar).
8. `check_docs_facts.py` — dokumentų skaičiai.

## Rezultatai

(įrašomi žemiau, kai komandos įvykdytos — tikra išvestis, ne perfrazė)

## Išvada

(laikina)
