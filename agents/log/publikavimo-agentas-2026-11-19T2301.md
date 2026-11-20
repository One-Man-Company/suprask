# publikavimo-agentas — 2026-11-19T2301

- paleidimas: #390 (manual)
- trukmė: 240s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

# Publikavimo patikra #390

**ĮGYVENDINTA: —** (šis paleidimas pasiūlymų iš eilės neįgyvendino)

## check_published.py išvestis (realus bėgimas, rc 0)

    Repozitorija: 48 moduliai
    Paskelbta:    48 moduliai
      · grade-01: repo 48, gyvai 48
    Pervadinti ID, priimta ir užregistruota (1):
      - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai (žyma perkeliama — index.json „03-sakinio-zodziai“ turi renamed_from, progress.js migruoja)
    Garsas: patikrinta 1432 iš 1432 (visi) — visi pasiekiami
    ✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, svetainės kodas 19 failų, versija 009c84fa)

Papildomai iš `git`: `HEAD` = `origin/main` = `009c84f`, `git rev-list --count origin/main..HEAD` → **0 neišstumtų commit'ų**. Svetainės versijos žymė `009c84fa` = repo HEAD.

## 3 gyvi adresai (curl, realūs matai)

    content/lt/grade-01/matematika/04-skaiciu-tiese.json            200  3636 B
    content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json       200  5313 B
    content/lt/grade-01/pasaulio-pazinimas/08-metu-laikai.json       200  4411 B

## Sprendimas

**sutampa** — repo 48 / paskelbta 48, 0 neišstumtų commit'ų, visi 1432 garso įrašai pasiekiami, 19 svetainės kodo failų baitai sutampa, 3 modulio adresai 200. Modulio ID nekeisti, `content/**`, `assets/**`, `docs/**`, `AGENTS.md`, kitų vaidmenų failai neliesti; jokio `git push`.

## Ko šis bėgimas NEpadarė (sąžiningai)

Pasiektas įrankių kvotos limitas prieš įrašant darbo failus, todėl:

1. **`research/wiki/changelog.md` eilutė #390 neįrašyta** (repo švarus — `git status` 0 eilučių; šiame commit'e jokio failo nepakeista).
2. **`agents/state.json` blokas `last_publish_check_390` neįrašytas.**
3. **Nepatikrinta hipotezė dėl naujo defekto:** `check_published.py` ir `validate_content.py` tikrina tik `index.json → failas` kryptį. Jei kūrėjas įdeda modulio JSON ir atnaujina `grades.json` skaičių, bet pamiršta įrašą `index.json`, toks „našlaitis“ failas publikuojamas svetainėje, bet vaikui nepasiekiamas, o abu vartai lieka žali (repo 48 = gyvai 48). Tai būtų ta pati LL-09/LL-21 šeima, kurią šis vaidmuo ir saugo. Šiandien tokių failų nerasta nebuvo — tikrinimo komanda neįvykdyta (kvota).
4. Nauja pamoka `research/wiki/guidelines/pamokos.md` nepridėta — 3 punkto defektas dar neįrodytas zondais, tad pamokos rašyti negalima.

Rekomendacija kitam publikavimo-agento paleidimui: pirmiausia paleisti našlaičių palyginimą (`glob */*.json` vs `index.json` sąrašas), tada įrašyti changelog eilutę su šio bėgimo skaičiais (48/48, `009c84fa`, 0 neišstumtų, 1432/1432, 200/200/200).

## klaidos

```
session_id: local-5756e70c8c44819fb154ad37f1bd0357bff53b27c917f31e842a372cb705e943
```
