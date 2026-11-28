# Tikrintojas — 2026-11-28 (run 594)

**Būsena: 0 klaidų.** Tikra komandų išvestis žemiau. Du vartai buvo akli prieš
akivaizdų defektą — abu pataisyti `scripts/` (tikrintojo sritis), su neigiamais
zondais.

## Baigties sąlyga — tikra išvestis

```
$ python3 scripts/validate_content.py
Rezultatas: 0 klaidų, 0 įspėjimų
✔ Turinys atitinka standartą.

$ python3 scripts/validate_content.py --strict
Rezultatas: 0 klaidų, 0 įspėjimų
✔ Turinys atitinka standartą.          rc=0

$ python3 scripts/check_audio.py
✔ Garsas pilnas: 1308 tekstų (iš jų 8 — tiesioginės api.speak eilutės simuliacijų
  kode), 2616 įrašų, visi iš Piper balso, naudojama 2616 iš 2616 mp3.

$ ffprobe per 2616 mp3 (assets/audio/lt/**/*.mp3, sample_rate)
failai: 2616
Counter({'22050': 2616})              ← kitų dažnių 0

$ python3 scripts/check_ui.py
Perskaityta: 12 simuliacijų failų
Rezultatas: 0 klaidų, 0 įspėjimų
✔ Sąsaja atitinka pagrindines taisykles.

$ python3 scripts/check_registry.py --grade 1
SIMS raktai kode: 115
grade-01: kryptys 9 · index 87 · failai 87 · užduotys 384 (optional 87) · sim 87 · path 87 · našlaičiai 0
PROBLEMŲ: 0

$ python3 scripts/check_docs_facts.py
Dokumentų skaičiai: 0 klaidų, 0 įspėjimų
Sutampa su failais.

$ python3 scripts/curriculum_backlog.py --check
✔ Padengties eilė suderinta: 47 pozicijų, 1 be modulio          rc=0

$ python3 scripts/check_lessons.py
✔ Pamokos: 232 įrašai, visi su 4 laukais.

$ python3 scripts/check_art.py
✔ Iliustracijos: 9 simuliacijų failai naudoja art.js, legacy: 1

$ python3 scripts/check_refs.py
✔ Vidaus nuorodos: 26 nuorodų 16 JS failuose ir 2 HTML — visos veda į esantį failą

$ .venv/bin/python scripts/check_view.py
Plotai: desktop 1440px, phone 390px, small 360px
Patikrinta: 261 (maršrutų: 87 · plotų: 3) · problemos: 0
✔ Visi moduliai matomi ir telpa visuose plotuose (su Brave skydų blokais).

$ python3 scripts/check_published.py
Repozitorija: 87 moduliai
Paskelbta:    87 moduliai  · grade-01: repo 87, gyvai 87
Garsas: patikrinta 2616 iš 2616 — visi pasiekiami; dydis 2616/2616
✔ Repo ir gyva svetainė sutampa (… versija 84aa6f50)
```

Gyvi adresai (`curl -o /dev/null -w "%{http_code}"`):

```
https://one-man-company.github.io/suprask/                           -> 200
https://one-man-company.github.io/suprask/content/lt/grade-01/index.json -> 200
https://one-man-company.github.io/suprask/content/lt/grades.json     -> 200
```

## Ką radau ir pataisiau

### 1. Wiki lentelė nustojo tylėti apie pervardintą modulį (#60984)

`check_docs_facts.check_wiki_table()` susiedavo wiki įrašą su moduliu pagal
PIRMĄ pavadinimo žodį. Matuota repo:

```
research/wiki/grades/01/index.md:35  „Komandų seka: viena klaida pakreipia kelią“
  index.json                         „Komandų seka: viena klaida nuveda ne ten“
research/wiki/grades/01/index.md:38  „Bendradarbiavimo tiltas“
  index.json                         „Tiltas: kai dirbame kartu“

prieš: check_docs_facts.py → 0 klaidų · „Sutampa su failais“   rc=0
```

Pridėtas antras signalas: wiki įrašo žodžių aibė negali turėti **žodžio, kurio
tikrame pavadinime nėra** (seno vardo pėdsakas), o įrašas gali būti TRUMPESNIS
(žmogaus santrumpa „Figūros“ ⊂ „Figūros aplink mus“ lieka žalia). Iš kelių
kandidatų su tuo pačiu pirmu žodžiu imamas artimiausias (`difflib`), ne pirmas
sąraše. `sync_docs_facts.align_items()` naudoja tą pačią sąlygą ir tokį įrašą
perrašo tikruoju vardu.

```
po: check_docs_facts.py → 2 klaidos, rc=1
    ✘ :35 „Komandų seka: viena klaida pakreipia kelią“ neatitinka modulio
       „…nuveda ne ten“ (seno vardo žodžiai: kelią, pakreipia)
    ✘ :38 „Bendradarbiavimo tiltas“ neatitinka modulio
       „Tiltas: kai dirbame kartu“ (seno vardo žodžiai: bendradarbiavimo)
    sync_docs_facts.py --apply → wiki eilutės pataisytos
    check_docs_facts.py → 0 klaidų, rc=0
```

README.md `Sąžiningumas ir žaidimai` sąrašas ir wiki `:35`/`:38` eilutės — tai
tie patys 3 failai, kuriuos pakeitė sinchronizatorius (`git diff --stat`).

### 2. `curriculum_backlog.py --check` neregėjo išvestinių laukų (#60735)

`--check` lygino TIK `source_hash`, o tas maišas imamas iš
`research/wiki/curriculum/*.md`. Iš `content/` skaičiuojami laukai
(`modules_now`, `counts`, `rows[].status/modules/target`) nebuvo lyginami
**niekada**, todėl vartas „✔ eilė suderinta“ galėjo būti žalias prie bet kokio
skaičiaus.

```
neigiamas zondas: modules_now = 999
prieš: ✔ Padengties eilė suderinta …   rc=0     ← tyla
po:    KLAIDA: backlog.json išvestiniai laukai atsiliko nuo content/ —
         · modules_now: faile 999, dabar 87
         · counts: faile {...}, dabar {...}    rc=1
atstačius: ✔ Padengties eilė suderinta: 47 pozicijų, 1 be modulio   rc=0
```

Šis skaičius yra vienintelis backlog kiekis, kurį `agents/run.py:_backlog_brief()`
įdeda į **kiekvieno agento** promptą — agentas gaudavo du skirtingus to paties
kiekio skaičius (antraštė 87, backlog 84) ir negalėjo žinoti, kuris teisingas.

### Zondas

`scripts/probe_wiki_vardai_backlog.py` (naujas, be tinklo, < 0,2 s, įsijungia į
CI `probe_*.py` ciklą be workflow pakeitimo):

```
✔ W1 tikri vardai praeina
✔ W2 senas vardas „Bendradarbiavimo tiltas“ pagautas
✔ W3 santrumpa „Figūros“ (poaibis) praeina
✔ W4 pirmas žodis tas pats, bet senas vardas pagautas
✔ W5 artimiausias kandidatas pasirenkamas
✔ B1 nesutrikęs backlog — 0 pranešimų
✔ B2 modules_now 84 vs 87 pagautas
✔ B3 eilutės statusas ir counts pagauti
✔ B4 išnykusi eilutė pagauta
✔ B5 eilutės modulių sąrašas pagautas
✔ B6 main() --check kviečia derived_drift()

Zondas: 0 nepavykę lūkesniai iš 11        rc=0
```

Visi kiti zondai po pakeitimo: 25 failai, 0 krentančių (4 PRALEISTA: nėra
playwright — elgsenos patikros, kaip ir anksčiau).

## Moduliai ir kryptys

87 modulių / 9 kryptys / 384 užduotys (kiekviename modulyje po 1 `optional`) /
87 simuliacijų / `index.json` ↔ failai ↔ `path.json` ↔ `SIMS` — 87/87/87/87,
našlaičių 0. Kiekvienas `sim.component` egzistuoja `SIMS` eksporte (115 raktų
kode).

## Nauja pamoka

**LL-232 — Vartas matuoja tarpinį dydį, o skelbia galutinį.** Abu šiandienos
defektai buvo tos pačios formos: saugomas išvestinis dydis (pavadinimas,
modulių skaičius), lyginamas jo pirmtakas (pirmas žodis, šaltinio failo maišas).
Įrašyta `research/wiki/guidelines/pamokos.md` (232 įrašai, `check_lessons.py`
žalias).

## Nepaliesta / nepadaryta

- Sim teksto dydis: 93 iš 261 patikrų @360 px < 14 px (`check_view.py` pastaba,
  ne vartas — standartas px ribos neįvardija). Issue #3 tebegalioja.
- Pasiūlymai #60487 (18 rodomų, bet netariamų sim teksto laukų: `place`, `trait`,
  `winter`) ir #60243 (`api.ask()` tuščia įvestis) — neliesti: pirmas keistų
  garso aprėpties apimtį (sprendimas, ne techninis taisymas), antras — `assets/js/`.
- Turinio defektai #60737/#60736/#59756/#59753 — kūrėjo darbas, ne tikrintojo.
- `agents/state.json` `last_validation` atnaujintas (run 594, 0 klaidų,
  2616/2616 @ 22050 Hz, HTTP 200/200/200).

## Failai

```
scripts/check_docs_facts.py         + title_words(), title_similarity(), antras signalas lentelėje
scripts/sync_docs_facts.py          + align_items() perrašo seno vardo įrašą
scripts/curriculum_backlog.py       + row_identity(), derived_drift(), --check juos kviečia
scripts/probe_wiki_vardai_backlog.py  (naujas zondas, 11 lūkesnių)
research/wiki/guidelines/pamokos.md + LL-232
research/wiki/grades/01/index.md    seni vardai pataisyti (sinchronizatorius)
README.md                           tas pats sąrašas
agents/state.json                   last_validation (run 594)
agents/log/tikrintojas-2026-11-28.md  ši ataskaita
```
