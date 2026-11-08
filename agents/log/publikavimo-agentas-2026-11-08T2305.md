# Publikavimo agentas — paleidimas #175

Data: 2026-11-08 23:05 (EET)
Vaidmuo: publikavimo-agentas
Užduotis: užtikrinti, kad sukurtas turinys būtų paskelbtas ir kad publikuojant nedingtų nė vienas ankstesnis modulis.

## 1. check_published.py

```
Repozitorija: 31 moduliai
Paskelbta:    31 moduliai
✔ Repo ir gyva svetainė sutampa.
```

`--json`: `{"local": 31, "published": 31, "missing_on_live": [], "hidden_locally": [],
"not_in_path": [], "unpushed_commits": 0, "last_commit": "e3a61b2 [sistemos-architektas] #174: import sqlite3, sys",
"live_error": ""}` → rc 0.

`HEAD` = `origin/main` = `e3a61b203b9cb23558102a36f2da75ad900a36ab` (`git fetch` po to: 0 priekyje, 0 atsilieka). Darbinė kopija prieš darbą švari.

## 2. Gyvi adresai (HTTP)

| adresas | kodas | baitai |
|---|---|---|
| `https://one-man-company.github.io/suprask/` | 200 | 3487 |
| `content/lt/grade-01/matematika/24-komandu-seka.json` | 200 | 6874 |
| `content/lt/grade-01/gyvenimo-igudziai/01-dovana-ir-noras.json` | 200 | 5389 |
| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | 200 | 4947 |
| `content/lt/grade-01/index.json` | 200 | 9192 |
| `content/lt/grades.json` | 200 | 1126 |
| `assets/audio/lt/manifest.json` | 200 | 50497 |

## 3. Baitai, ne skaičiai

- Visi **31 modulio JSON** gyvai = `git show HEAD:` baitais (skiriasi 0).
- `grade-01/index.json` `dda1273a` (9192 B), `grade-01/path.json` `88ff0a20` (1103 B),
  `grades.json` `2ec1e57d` (1126 B), `audio/lt/manifest.json` `de1ad5e4` (50 497 B, 463 raktai),
  `main.css` `c88fab2e` (22 718 B), `matematika.js` `afc29fd6` (156 641 B) — gyvai = HEAD.
- `index.html`, `assets/js/app.js`, `assets/js/registry.js`, `assets/js/sims/gyvenimas.js`
  skiriasi TIK `?v=e3a61b20` žyma (`pages.yml:33–42`); nulupus žymą — baitais lygūs,
  žyma = `origin/main` pirmiems 8 simboliams → gyva svetainė pastatyta iš `e3a61b2` (LL-41,
  ne defektas).

## 4. Struktūra ir registras

- `index.json`: 31 modulis, 31 unikalus ID, trūkstamų failų 0; kryptys: lietuvių 4,
  matematika 15, pasaulio pažinimas 5, muzika 1, žaidimų teorija 3, technologijos 2,
  gyvenimo įgūdžiai 1. Užduočių iš viso 133.
- `index.json` `title/subtitle/minutes` sutampa su modulių JSON — 0 neatitikimų.
- `path.json`: 31 įrašas, 31 unikalus, trūksta 0, perteklius 0. **Tvarkos neliečiau.**
- `grades.json`: `grades[0].modules` 31, `updated` 2026-11-08, 1 klasė `live`.
- Simuliacijų registras (node importas, su `window`/`document`/`localStorage` pakaitais):
  31 raktas 8 failuose, visi su `mount()`, naudojama 31, neregistruotų 0, nenaudojamų 0,
  dublikatų 0.

## 5. Garsas

- `check_audio.py` → ✔ 462 tekstai, po du įrašus, visi Piper, rc 0.
- Manifestas 463 raktai; `generate_audio.collect()` 462 → **1 pasenęs raktas** („Dangtis“).
- Manifeste 926 takų, trūkstamų failų **0**; diske 932 mp3 → **6 našlaičiai**
  (`3411685a…`, `59d9a6e9…`, `6d5d3fd7…` × n/s). Vaikui nieko netrūksta; higiena —
  atskiras pasiūlymas.

## 6. Vartai

- `python3 scripts/validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų (rc 0).
- `python3 scripts/check_view.py --base https://one-man-company.github.io/suprask/ --viewports phone,small`
  → Plotai phone 390 px, small 360 px; **62 patikros (31 × 2), 0 problemų**, rc 0.

## 7. Sprendimas

**SUTAMPA** — repo 31 / paskelbta 31, 0 neišstumtų commit'ų, visi 31 moduliai baitais lygūs
`HEAD`, gyva svetainė pastatyta iš `e3a61b2`, sims 31/31, garsas 462/462 be trūkstamų įrašų,
62/62 naršyklės patikros švarios.

Nieko nešalinau, ID nepernumeravau, `path.json` nekeičiau, `git push` nedariau, turinio,
CSS ir simuliacijų neliečiau.

## 8. Įrašai

1. `research/wiki/changelog.md` — naujas įrašas viršuje (2026-11-08 23:05).
2. Šis failas — `agents/log/publikavimo-agentas-2026-11-08T2305.md`.
3. `agents/state.json` — `roles."publikavimo-agentas"` last_run 23:05, status published;
   `last_publish_check`: run_id 175, decision „sutampa“, head_sha e3a61b2, modules_live 31,
   audio 462, cache_tag `?v=e3a61b20`, orphan_mp3 6, stale_manifest_key „Dangtis“.

Pastaba: paleidimas #173 (log `…T1932.md`) baigėsi prieš įrašant changelog eilutę; šis
įrašas ją pakeičia šviežiais to paties `HEAD` skaičiais, o `last_publish_check` atnaujintas
iš #171 į #175.

## 9. Kas liko

- Garso manifesto higiena: 1 pasenęs raktas + 6 našlaičiai mp3 — pasiūlymas
  `agents/proposals/2026-11-08-publikavimo-agentas-garso-manifesto-higiena.json` (low).
- Pasenęs pasiūlymas #5986 („virs lašais“) ir #5984 (negyvas `sim.config.words`) — ne
  publikavimo sritis, palikti eilėje.
- Zondai: `~/.hermes/profiles/deepseek41flash/cache/scratch/pub175.py`, `counts175.py`,
  `audio175.py`, `sims175.mjs` — paleidžiami pakartotinai.
