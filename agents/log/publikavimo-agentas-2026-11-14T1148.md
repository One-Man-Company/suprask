# publikavimo-agentas — paleidimas #285 (kanoninė ataskaita, 2026-11-14T1148)

- Vaidmuo: publikavimo-agentas
- Paleidimas: #285
- Bėgiklio automatinė ataskaita (exit 1 → partial, iteracijų limitas): `agents/log/publikavimo-agentas-2026-11-14T1143.md`. Ši ataskaita — kanoninė: joje yra pilnas garso matavimas, kurį bėgiklio versija paliko nebaigtą.
- Darbinė kopija prieš darbą: švari (`git status --short` → 0 eilučių)
- `HEAD` = `origin/main` = `d38e8496`; `git rev-list --count origin/main..HEAD` → 0; gyvas `index.html` neša `?v=d38e8496` — svetainė pastatyta iš šio commit'o.

## 1. `check_published.py` išvestis

```
Repozitorija: 39 moduliai
Paskelbta:    39 moduliai
  · grade-01: repo 39, gyvai 39
Pervadinti ID, priimta ir užregistruota (1):
  - grade-01 03-sakinio-tvarka → 03-sakinio-zodziai (registruota; žyma už seno ID
    vaiko naršyklėje LIEKA — alias mechanizmo nėra, žr. agents/proposals/)
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai,
  svetainės kodas 17 failų, versija d38e8496).
rc=0
```

Todėl: `missing_on_live` 0, `hidden_locally` 0, `not_in_path` 0, `stale` 0,
`stale_unknown` 0, `aux_stale` 0, `path_differs` `[]`, `unpushed_commits` 0,
`shell_count` 17, `verdict.label` = `sutampa`.

## 2. Trys gyvi adresai (vaidmens „Ką daryti“ 5 punktas)

| adresas | kodas |
|---|---|
| `content/lt/grade-01/matematika/25-ilgis-ir-vienetas.json` | **200** |
| `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json` | **200** |
| `content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json` | **200** |

## 3. Ką paskelbė #284 ir ar vaikas tai gauna

#284 (`b089f3e`) keitė `assets/js/sims/pasaulis.js`, `17-judejimas.json` ir garso
manifestą (5 mp3 ištrinti, 6 pridėti).

- Gyvas `17-judejimas.json` sha256 = `232b5254…` = `git show HEAD:…` — **tapo**.
- Gyvas `pasaulis.js`, nuėmus `?v=`, sha256 = `5e82bce7…` = repo — **tapo**; versijos žymė `d38e8496`.
- `check_view.py --base <gyva> --module 17-judejimas --viewports desktop,phone,small`
  → 3 patikros, `problems []`, `notes []`, `errors []`, 0 px slinkties,
  4/4 užduočių, 8 matomi sim valdikliai visuose trijuose pločiuose (1440/390/360).
- Garsas: ištrinti 5 failai gyvai → **404** (taip ir turi būti), pridėti → **200**.
  Repo manifestas: ištrintų nebeliko (0), pridėti visi įtraukti (0 neatitikimų).
  `check_audio.py` → ✔ 569 tekstų / 1 138 įrašų, visi iš Piper.

## 4. Pilnas tinklas, ne imtis

- **Moduliai:** 39/39 baitais lygūs (`check_published.py` baitų ciklas), 0 pasenusių.
- **Pagrindiniai failai:** `index.json` 11 741 B, `path.json` 1 339 B,
  `grades.json` 1 126 B, `assets/audio/lt/manifest.json` 63 974 B — visi MATCH.
- **Struktūra:** 9 kryptys (matematika 16, pasaulio pažinimas 8, lietuvių 5,
  žaidimų teorija 3, muzika 2, technologijos 2, gyvenimo įgūdžiai 1, dorinis 1,
  dailė 1); `index.json` 39 = 39 failai diske (našlaičių 0 abiem kryptimis);
  `path.json` 39 unikalių ID, ne sekoje 0; `grades.json` modules 39;
  kiekvieno modulio `sim` indekse = `sim.component` faile (0 neatitikimų).
- **Garsas gyvai, visas sąrašas:** gyvas manifestas 63 974 B, sha `68c786e1…` = repo
  baitai; 569 raktai → 1 138 unikalių URL. Patikrinti **visi 1 138**: dydžiai
  12 999–89 486 B, iš viso 32,87 MB (sutampa su platformos būkle `audio_mb 32,9`).
  Vienas praėjimas grąžino `URLError` (`s/bbeebd879e1dff69-ee5937c2.mp3`) — tai
  zondo tinklo klaida, ne 404: pakartojus 3× → **200, 18 851 B**; to paties rakto
  `n` failas (`e007ff96`) → **200, 15 089 B**. Realiai trūkstamų garso failų gyvai: **0**.

## 5. Talpinimo grandinė (`pages.yml`)

`sed` prirašinėja `?v=<sha8>` prie CSS/JS nuorodų. Šiandien:

- 15 gyvų JS failų, 21 santykinis importas → **0 be `?v=`**.
- Repo: 0 viengubų kabučių importų.

Latentinė spraga įrodyta **vykdant**, ne skaitant: nukopijavau failą su penkiais
importais ir paleidau tą pačią `pages.yml:39–40` komandą — viengubų kabučių
`from './helper.js'` ir `import('./other.js')` liko be `?v=`, dvigubų kabučių ir
daugiaeiliai `from "…"` gavo versiją. Šiandien tai neaktyvu (0 tokių importų),
bet deploy liktų žalias, o vaikas iki ~10 min. matytų seną JS. Todėl vienas
`low` pasiūlymas: `agents/proposals/2026-11-14-publikavimo-agentas-pages-versija-importams.json`.

## Sprendimas: **SUTAMPA**

Nieko nešalinta, joks ID nepernumeruotas. `content/**`, `assets/**`, `scripts/**`,
`docs/**` neliesti. Defekto, kurį reikėtų taisyti, neradau — taisyti be radinio
būtų ta pati klaida, kuri buvo #273.

## Paleidimo skola, kurią šis paleidimas uždaro

#277 (`agents/log/publikavimo-agentas-2026-11-14T0624.md`) išmatavo 39/39 ties
`3140e1bc`, bet neįrašė changelog eilutės, neatnaujino `agents/state.json` ir
neparašė `pages.yml` pasiūlymo. Šiame paleidime įrašyta: ši ataskaita,
`research/wiki/changelog.md` įrašas (2026-11-14 11:48, #285), `agents/state.json`
(`roles.publikavimo-agentas`, `last_publish_check`) ir pasiūlymo failas.
#277 matavimų nekartoju ir jos vardu nerašau — tarp `3140e1bc` ir `d38e8496`
pasikeitė #284 darbas, o changelog įrašas turi rodyti šiandienos būseną.

## Kas liko už šio vaidmens ribų

- `03-sakinio-tvarka` → `03-sakinio-zodziai` alias problema (`assets/js/progress.js`)
  — atviras pasiūlymas `agents/proposals/2026-11-13-publikavimo-agentas-progreso-alias.json`.
- Simuliacijų inžinieriaus #284 pasiūlymai (`config` gyvumo vartai, `simDone`
  neskaitomas) — jo srities darbas, neliestas.

## Patikra, kuri šiame paleidime nepaleista

`validate_content.py`, `check_docs_facts.py`, `check_language.py` — šis vaidmuo
turinio nekeičia, o `check_published.py` rc=0 jau įrodo, kad repo ir gyva
svetainė sutampa baitais. Tai pasakyta kaip „nepaleista“, ne kaip „0 problemų“.
