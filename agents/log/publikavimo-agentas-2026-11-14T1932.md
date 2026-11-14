# publikavimo-agentas — 2026-11-14T1932

- paleidimas: #290
- vaidmuo: publikavimo-agentas
- tikslas: patikrinti, ar repo ir gyva svetainė sutampa, ir užrašyti trūkstamus įrašus (changelog, log, state)

## 1. `check_published.py` (repo / paskelbta / neišstumta)

```
Repozitorija: 39 moduliai
Paskelbta:    39 moduliai
  · grade-01: repo 39, gyvai 39
Pervadinti ID, priimta ir užregistruota (1):
  - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai (registruota; žyma už seno ID vaiko naršyklėje LIEKA — alias mechanizmo nėra, žr. agents/proposals/)
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, svetainės kodas 17 failų, versija 0fa0df8e).
```

`rc = 0`. `--json`: `missing_on_live []`, `hidden_locally []`, `not_in_path []`, `stale []`, `stale_unknown []`, `aux_stale []`, `shell_stale []`, `shell_unreachable []`, `path_differs []`, `shell_count 17`, `history_checked true`, `live_version = repo_version = 0fa0df8e`, `unpushed_commits 0`, `verdict.label = "sutampa"`, `vanished_ids` 1 įrašas (`03-sakinio-tvarka` → `03-sakinio-zodziai`, `last_rev a2ad497`, `resolved true`).

Git: `HEAD` = `origin/main` = `0fa0df8` (`git rev-list --left-right --count origin/main...HEAD` → `0 0`), darbinė kopija prieš darbą švari (0 eilučių).

## 2. Trys gyvi adresai (HTTP + baitai)

| adresas | kodas | baitai | gyvas sha256 vs `git cat-file blob HEAD:` |
|---|---|---|---|
| `content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json` | 200 | 8 812 B | sutampa (`34bfc3a0…`) |
| `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` | 200 | 5 459 B | sutampa (`f267ae9d…`) |
| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | 200 | 4 932 B | sutampa (`462f9ed4…`) |

Papildomai — gyvas svetainės kodas baitais (9 failai, po `?v=` nuėmimo):

```
index.html           3487 B / 3465 B  SUTAMPA  (2 žymos)
assets/js/app.js    31813 B / 31780 B SUTAMPA  (3 žymos)
assets/js/registry.js 3731 B / 3621 B SUTAMPA (10 žymų)
assets/js/progress.js 2779 B / 2779 B SUTAMPA
assets/js/speech.js   7565 B / 7565 B SUTAMPA
assets/css/main.css  31687 B / 31687 B SUTAMPA
assets/js/sims/art.js 37587 B / 37587 B SUTAMPA
assets/js/sims/daile.js 9554 B / 9543 B SUTAMPA (1 žyma)
assets/js/sims/pasaulis.js 126779 B / 126768 B SUTAMPA (1 žyma)
gyvas app.js turi aria-current="step": True
gyvas main.css turi .mod-row.is-current: True
gyvas index.html versija: ?v=0fa0df8e
```

## 3. Ką reiškia tie skaičiai (ne tik „39 = 39“)

Nuo #285 changelog įrašo (`d38e8496`) iki `HEAD` (`0fa0df8`) turinio ir `assets/` kataloge pasikeitė **tik** du failai: `assets/js/app.js` (+30/−5) ir `assets/css/main.css` (+12) — tai #286 (dizaineris) „pirma neužbaigta eilutė“. Nė vienas modulio JSON, `index.json`, `path.json`, `grades.json` ar garso failas nepasikeitė, todėl vaiko pažangos raktai (`localStorage`) ir modulio ID nejudėjo. Abiejų pakeitimų gyvumas patvirtintas baitais ir turiniu (`aria-current="step"`, `.mod-row.is-current`), ne vien versijos žyma.

## 4. Vartai

- `validate_content.py --grade 1 --strict` → **0 klaidų, 0 įspėjimų**, `rc 0`.
- `check_docs_facts.py` → **0 klaidų, 0 įspėjimų** (9 kryptys, 39 moduliai, 39 simuliacijos, 169 užduotys, 569 garso tekstai, 1 138 įrašai, 15 agentų).
- `check_audio.py` → ✔ 569 tekstų (5 tiesioginės `api.speak` eilutės), 1 138 įrašų, naudojama **1 138 iš 1 138 mp3**.

## 5. Naujas radinys — latentinis, ne matomas

Klasės puslapio kortelė `title`, `subtitle`, `minutes` ima iš `index.json` (`assets/js/app.js:281–282`, `:314–317`), o modulio puslapio antraštė tuos pačius laukus ima iš modulio JSON (`:377–379`). `scripts/validate_content.py:262–265` lygina tik `id` ir `strand`, tad šios dvi to paties fakto kopijos niekada nesulyginamos; `check_published.py` lygina failus su gyva svetaine, ne failus tarpusavyje.

Išmatavau zendu (39 moduliai × 4 laukai = 156 palyginimai): **nesutapimų 0**. Tai reiškia, kad šiandien vaikui nieko nesimato — todėl nieko ir netaisiau. Užregistruota pasiūlymu `agents/proposals/2026-11-14-publikavimo-agentas-index-ir-modulis.json` (normal), o ne tyliu pataisymu, kurio niekas neperžiūrėtų.

## 6. Ką parašiau šiame paleidime

1. `research/wiki/changelog.md` — naujas įrašas 2026-11-14 (19:32), viršuje. Tai uždaro ir #288 skolą: #288 išmatavo 39/39 bei visą garsą, bet baigėsi `exit 1 → partial` ir changelog eilutės neįrašė.
2. `agents/log/publikavimo-agentas-2026-11-14T1932.md` — ši ataskaita.
3. `agents/state.json` — `roles.publikavimo-agentas` (`last_run`, `status`, `log`) ir `last_publish_check`.
4. `agents/proposals/2026-11-14-publikavimo-agentas-index-ir-modulis.json` — vienas pasiūlymas (riba: ne daugiau kaip 3).

Neliesta: `content/**`, `assets/**`, `scripts/**`, `docs/**`, `AGENTS.md`, `path.json`, `index.json`, `grades.json`, garsas. Joks ID nepernumeruotas, niekas nešalinta.

## 7. Kas liko atvira (ne šio vaidmens)

- **Alias pažangai** (`progress.js` nežino, kad `03-sakinio-tvarka` virto `03-sakinio-zodziai`) — pasiūlymas jau eilėje nuo #273: `agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json` (high). Tai vienintelė šiandien matoma publikavimo pasekmė vaikui: kas tą modulį buvo atlikęs, dabar mato jį kaip neatliktą.
- **`add_optional_tasks.py`** turi raktą į nebeegzistuojantį ID `03-sakinio-tvarka` (13 raktų 39 moduliams) — latentinis, `agents/proposals/2026-11-13-publikavimo-agentas-add-optional-rakto-likutis.json`.
- **`pages.yml` viengubų kabučių `sed` spraga** — latentinė (`agents/proposals/2026-11-14-publikavimo-agentas-pages-versija-importams.json`).

## 8. Nauja pamoka

Naujos pamokos nepridėjau: šiandien nebuvo nė vieno vaiko matomo defekto, o radinys (dvi to paties fakto kopijos, kurių vartai nesulygina) šiandien duoda 0 nesutapimų. Pamokų sąrašas yra realių klaidų registras, ne idėjų sąrašas — jei šis invariantas kada nors lūš, tuo metu ir atsiras LL įrašas su konkrečiu įrodymu.

## Sprendimas

**`sutampa`** — repo 39 / paskelbta 39, neišstumtų commit'ų 0, 3/3 gyvi adresai `200` ir baitais lygūs `HEAD`, svetainės kodas 17 failų ir 9/9 baitais patikrinti failai sutampa, visi vartai žali. Nieko nešalinta, ID nepernumeruoti.
