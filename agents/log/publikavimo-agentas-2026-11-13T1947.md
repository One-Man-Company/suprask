# Publikavimo agentas — paleidimas #273 (2026-11-13T19:47+02:00)

## 1. `check_published.py` išvestis (ne perfrazuota)

```
Repozitorija: 39 moduliai
Paskelbta:    39 moduliai
  · grade-01: repo 39, gyvai 39
Pervadinti ID, priimta ir užregistruota (1):
  - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai (registruota; žyma už seno ID
    vaiko naršyklėje LIEKA — alias mechanizmo nėra, žr. agents/proposals/)
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai,
  svetainės kodas 17 failų, versija a7936290).
RC=0
```

Būsena po raktų: `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0,
`stale` 0, `stale_unknown` 0, `aux_stale` 0, `shell_stale` 0,
`shell_unreachable` 0, `path_differs` `[]`, `unpushed_commits` 0,
`history_checked` `true`, `history_note` tuščias, `live_version` =
`repo_version` = `a7936290`, `verdict.label` = `sutampa`. Gyvas `index.html`
neša `?v=a7936290` — svetainė pastatyta būtent iš šio commit'o.

Neišstumta commit'ų: **0** (`git rev-list --left-right --count origin/main...HEAD`
→ `0	0`, `HEAD` = `origin/main` = `a7936290`).

## 2. Trys gyvi adresai

| adresas | kodas |
|---|---|
| `content/lt/grade-01/matematika/04-skaiciu-tiese.json` | 200 |
| `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` | 200 |
| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | 200 |

## 3. Kiti vartai

- `python3 scripts/validate_content.py --grade 1 --strict` → 0 klaidų, 0 įspėjimų, rc 0.
- `python3 scripts/check_docs_facts.py` → 0 klaidų, 0 įspėjimų (9 kryptys, 39 moduliai,
  39 simuliacijos, 169 užduotys, 567 garso tekstų, 1 134 įrašai).
- `python3 scripts/check_agents.py` → 15 vaidmenų, rc 0, 2 įspėjimai (abu seni:
  sistemos-architektas be žurnalo įrašo; 9 sisteminiai pasiūlymai laukia >3 d.).

## 4. Sprendimas: **SUTAMPA**

Nieko nešalinta, joks ID nepernumeruotas, `index.json`, `path.json`, `grades.json`,
garsas ir turinys neliesti. `hidden_locally` tuščias, `not_in_path` tuščias —
taisyti `path.json` nereikėjo.

## 5. Ką šis paleidimas vis dėlto pakeitė

### 5.1. Įrankio išvestis, kuri teigė daugiau, nei žinojo (LL-89)

`scripts/check_published.py` priimto pervadinimo eilutė skelbė
„(žyma tam moduliui nebegalioja)“. Patikrinus served kodą:

- `assets/js/progress.js:31` — `slot(d, moduleId)` saugo ir skaito žymą tik pagal modulio ID;
- `get():77`, `count():88–96` — lygina tą patį raktą, jokio alias;
- `grep -rn 'renamed\|alias\|sakinio-tvarka' assets/js` → **0 atvejų**, t. y. naršyklė
  senojo ID net nepažįsta.

Todėl teiginys buvo neteisingas, o `scripts/known_renames.json` yra **vartų sprendimas**,
ne pasekmės panaikinimas. Pakeista viena spausdinama eilutė
(`scripts/check_published.py:577–583`): dabar ji sako, kas lieka. `verdict` ir `rc`
nepasikeitė — sprendimas tas pats, pasikeitė tik tai, ką jis teigia.

### 5.2. Du eilės įrašai (skola iš #271)

#271 ataskaitoje du pasiūlymai buvo suformuluoti, bet failai neįrašyti (LL-85 šeima).
Šiame paleidime įrašyti:

1. `agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json` (high) —
   `renamed_from` modulio įraše + alias migracija `progress.js` skaitymo kelyje.
   Įrodymas: `progress.js:31/77/88–96`, `grep` 0 atvejų, gairių T3.5/T3.6.
2. `agents/proposals/2026-11-13-publikavimo-agentas-add-optional-rakto-likutis.json` (low) —
   `scripts/add_optional_tasks.py`: 13 raktų 39 moduliams, vienas raktas
   `03-sakinio-tvarka` rodo į nebeegzistuojantį ID, o įrankis tyli abiem kryptimis.
   Defektas latentinis: 39/39 moduliai šiandien turi lygiai vieną `optional: true`
   užduotį (patikrinta skriptu per visus `tasks`).

### 5.3. Pamoka LL-89

`research/wiki/guidelines/pamokos.md` — naujas tipas: „Registro įrašas, kuris įspėjimą
paverčia patikinimu“. `check_lessons.py` → visi įrašai su 4 laukais.

## 6. Kas liko nepadaryta (sąžiningai)

1. **Alias mechanizmo nėra** — tai ne publikavimo, o platformos kodo darbas; šiame
   paleidime tik pasiūlymas. Kol jo nėra, vaikas, atlikęs `03-sakinio-tvarka`, dabartinio
   `03-sakinio-zodziai` mato kaip neatliktą. Kitos priemonės (versti vaiką atlikti iš naujo)
   nesiūlau: tai būtų pažangos trynimas.
2. **Dashboard'o kortelė** — `check_published.py --json` jau turi `verdict` iš vieno
   šaltinio (#12895), bet dashboard'o renderio šiame profilyje nepaleidau (ne mano failas).
3. **9 sisteminiai pasiūlymai laukia >3 d.** (`check_agents.py` įspėjimas) — eilės
   prioritetų klausimas, ne šio vaidmens sprendimas.

## 7. Failai

Pakeisti: `scripts/check_published.py` (1 eilutė išvestyje), `research/wiki/changelog.md`
(naujas įrašas 19:47), `research/wiki/guidelines/pamokos.md` (LL-89),
`agents/log/publikavimo-agentas-2026-11-13T1947.md` (ši ataskaita), `agents/state.json`
(`last_publish_check_273`; `.gitignore`).

Nauji: `agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json`,
`agents/proposals/2026-11-13-publikavimo-agentas-add-optional-rakto-likutis.json`,
`agents/log/publikavimo-agentas-2026-11-13T1947.md`.

Neliesta: `content/**` (turinys, `index.json`, `path.json`, `grades.json`),
`assets/**` (simuliacijos, CSS, `progress.js`), `docs/**`, kitų vaidmenų failai.
