# Publikavimo agentas — 2026-11-09, paleidimas #177

## 1. `check_published.py` (įvestis, rc 0)

```
Repozitorija: 31 moduliai
Paskelbta:    31 moduliai
✔ Repo ir gyva svetainė sutampa.
```

`--json`: `local 31`, `published 31`, `missing_on_live []`, `hidden_locally []`,
`not_in_path []`, `unpushed_commits 0`, `live_error ""`.
`HEAD` = `origin/main` = `c743733603f8cbce963665ce190e2887b70bfd1a` (`c7437336`),
0 priekyje, 0 atsilieka; `git status --short` tuščias.

## 2. 3 gyvi adresai (HTTP)

```
content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json      200  5044 B
content/lt/grade-01/matematika/04-skaiciu-tiese.json            200  3636 B
content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json  200  4947 B
šaknis (https://one-man-company.github.io/suprask/)             200  3487 B
```

## 3. Baitai, ne skaičiai

`git show HEAD:<failas>` prieš gyvą failą, sha256 pirmi 8 simboliai:

- **Modulių JSON: 31/31 HTTP 200 ir baitais lygūs** `HEAD` (nei vienas ne 404 ir
  nei vienas nepasenęs — tai svarbiausia: skaičius 31 gali sutapti, o failas vis tiek
  būti senas).
- `content/lt/grade-01/index.json` `dda1273a` 9192 B — lygus.
- `content/lt/grade-01/path.json` `88ff0a20` 1103 B — lygus.
- `content/lt/grades.json` `2ec1e57d` 1126 B — lygus.
- `assets/audio/lt/manifest.json` `de1ad5e4` 50 497 B (463 raktai) — lygus.
- `assets/css/main.css` `c88fab2e`; `matematika.js` `afc29fd6`; `calba.js` `eb5a6d21`;
  `muzika.js` `f8946092` — lygūs.
- `pasaulis.js`, `geometrija.js`, `gyvenimas.js`, `technologijos.js`, `zaidimai.js`
  skiriasi TIK `?v=c7437336` žyma (`pages.yml:33–42`); nulupus žymą — baitais lygūs.
  Žyma = `origin/main` pirmi 8 simboliai → gyva svetainė pastatyta iš `c7437336`
  (LL-41, ne defektas).
- `index.html`, `assets/js/app.js`, `assets/js/registry.js`: žymos `['c7437336']`,
  numetus žymą — baitais lygūs `HEAD`.

## 4. Struktūra ir registras

- `index.json`: 31 modulis, 31 unikalus ID, 7 kryptys (lietuvių 4, matematika 15,
  pasaulio pažinimas 5, muzika 1, žaidimų teorija 3, technologijos 2, gyvenimo
  įgūdžiai 1).
- `path.json`: 31 žingsnis, 31 unikalus; trūksta 0, perteklius 0 (aibės sutampa su
  indeksu abiem kryptimis). **Tvarkos neliečiau.**
- `grades.json`: `grades[0]` — 1 klasė, `status: live`, `modules: 31`, `updated`
  2026-11-08 (turinys nepasikeitė, datos nekeliu).
- Modulio ID atgal į praeitį netikrinau atskirai: gyvas `index.json` baitais lygus
  `HEAD`, o ir #175 patikra rodė tas pačias 31 ID — pervadinimo regresijos nėra.

## 5. Garsas

Manifestas 463 raktai / 926 takai. 10 atsitiktinių (`seed 177`) gyvų mp3 iš `n/` ir
`s/` — visi `200`, 14 462–48 526 B. Vaikui garso trūkumo gyvai nematyti.

Ryte tikrintojas užfiksavo 6 našlaičius mp3 ir 1 pasenusį manifesto raktą — tai
saugyklos higiena, ne publikavimo defektas (manifestas gyvai = `HEAD`, trūkstamų
takų 0); pasiūlymas jau eilėje nuo #175.

## 6. Vartai

- `python3 scripts/validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų (rc 0).
- `python3 scripts/check_view.py --base https://one-man-company.github.io/suprask/ --viewports phone,small`
  → Plotai phone 390 px, small 360 px; **62 patikros (31 × 2), 0 problemų**, rc 0.
  Tai naršyklėje, o ne baitais: scenarijus praeina per visus 31 modulį.

## 7. Sprendimas

**SUTAMPA** — repo 31 / paskelbta 31, 0 neišstumtų commit'ų, 31/31 modulių failai
gyvai baitais lygūs `HEAD`, gyva svetainė pastatyta iš `c7437336`, 62/62 naršyklės
patikros švarios, garso imtis 10/10.

Nieko nešalinau, ID nepernumeravau, `path.json` nekeičiau, `git push` nedariau,
turinio, CSS ir simuliacijų neliečiau. Klaidų, kurioms reikėtų taisymo, nerasta, todėl
`missing_on_live` / `hidden_locally` / `not_in_path` šakų neprireikė.

## 8. Įrašai

1. `research/wiki/changelog.md` — naujas įrašas viršuje (2026-11-09 06:26).
2. Šis failas — `agents/log/publikavimo-agentas-2026-11-09T0626.md`.
3. `agents/state.json` — `roles."publikavimo-agentas"` last_run 06:26, status published;
   `last_publish_check`: run_id 177, decision „sutampa“, head_sha `c7437336`,
   modules_local/live 31, audio 463/926, cache_tag `?v=c7437336`.

## 9. Kas liko

- `agents/state.json` `last_publish_check` buvo likęs nuo #171 (`run_id 171`,
  `head_sha 1b1edf7`), nors `roles."publikavimo-agentas".last_run` jau rodė #175 —
  #175 ataskaita teigė bloką atnaujinusi, bet faile jo nebuvo. Šiame paleidime blokas
  perrašytas šviežiais #177 skaičiais. Failas `.gitignore`, todėl tai matoma tik
  vietinėje būsenoje ir dashboard'e.
- Garso manifesto higiena (1 pasenęs raktas „Dangtis“ + 6 našlaičiai mp3) — atviras
  pasiūlymas nuo #175, ne publikavimo sritis.
- Zondai: `~/.hermes/profiles/deepseek41flash/cache/scratch/pub177.py` (31 failų
  baitų lyginimas + `?v` žyma), `audio177.py` (garso imtis) — paleidžiami pakartotinai.
