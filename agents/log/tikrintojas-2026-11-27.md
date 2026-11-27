# Tikrintojas — 2026-11-27 (paleidimas #572)

84 moduliai, 370 užduočių, 84 simuliacijos, 9 kryptys, 2524 mp3 (87,4 MB).
Bazinė patikra — **0 klaidų**. Šiame paleidime rasti du realūs vartų defektai,
kurių nė vienas ankstesnis paleidimas nematė: nepatikrintos standarto §2
simbolių ribos ir `check_module()` ankstyvas grįžimas, kuris po pirmos klaidos
nuslopindavo visą modulio patikrą.

## Vartų išvestis (tikra)

```
$ python3 scripts/validate_content.py
Rezultatas: 0 klaidų, 0 įspėjimų
✔ Turinys atitinka standartą.                                      (rc=0)

$ python3 scripts/validate_content.py --strict
Rezultatas: 0 klaidų, 0 įspėjimų
✔ Turinys atitinka standartą.                                      (rc=0)

$ python3 scripts/check_ui.py
Perskaityta: 12 simuliacijų failų
Rezultatas: 0 klaidų, 0 įspėjimų
✔ Sąsaja atitinka pagrindines taisykles.

$ python3 scripts/check_audio.py
✔ Garsas pilnas: 1262 tekstų (iš jų 8 — tiesioginės api.speak eilutės
  simuliacijų kode), 2524 įrašų, visi iš Piper balso, naudojama 2524 iš 2524 mp3.

$ python3 scripts/check_registry.py --grade 1
SIMS raktai kode: 112
grade-01: kryptys 9 · index 84 · failai 84 · užduotys 370 (optional 84)
          · sim 84 · path 84 · našlaičiai 0
PROBLEMŲ: 0

$ python3 scripts/check_language.py --grade 1 --strict
Moduliai: 84 · klaidos: 0 · įspėjimai: 0 · pastabos: 56 · sakinio riba: 10 ž. (error)
✔ Užduočių formuluotės švarios.

$ python3 scripts/check_docs_facts.py
Dokumentų skaičiai: 0 klaidų, 0 įspėjimų — Sutampa su failais.

$ python3 scripts/check_refs.py
✔ Vidaus nuorodos: 26 nuorodų 16 JS failuose ir 2 HTML — visos veda į esantį failą

$ python3 scripts/check_art.py
✔ Iliustracijos: 9 simuliacijų failai naudoja art.js, legacy: 1

$ python3 scripts/check_lessons.py
✔ Pamokos: 220 įrašų, visi su 4 laukais.

$ python3 scripts/check_published.py
✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai,
  svetainės kodas 19 failų, garso vardai 2524/2524 = baitai ir tekstas,
  garso dydžiai 2524/2524 = Content-Length, versija 9619f3b2).
```

### 22 050 Hz patikra (visi įrašai, be atrankos)

```
failai: 2524   Counter({'22050': 2524})    kitų dažnių 0, neperskaitytų 0
```

### Sąsajos matavimas (naršyklė)

```
$ .venv/bin/python scripts/check_view.py
Plotai: desktop 1440px, phone 390px, small 360px
Patikrinta: 252 (maršrutų: 84 · plotų: 3) · problemos: 0
  · simuliacijų tekstas < 14 px: 93 iš 252 patikrų (pastaba, ne vartas)
        8.6 px  zaidimu-teorija/12-bendradarbiavimo-tiltas @360px  text „Tu“
        9.2 px  pasaulio-pazinimas/22-medziai-krumai-zoles @360px  text „0“
        9.7 px  matematika/19-simto-skaiciu-lentele @360px  div.shl-cell „100“
✔ Visi moduliai matomi ir telpa visuose plotuose (su Brave skydų blokais).

$ .venv/bin/python scripts/check_view.py --text-scale 200 --json
{"problems": [], "scaled_checked": 252, "scaled_unapplied": []}
```

### Gyvi adresai

```
https://one-man-company.github.io/suprask/                          200
https://one-man-company.github.io/suprask/content/lt/grade-01/index.json  200
https://one-man-company.github.io/suprask/content/lt/grades.json    200
```

## KĄ PADARIAU (du vartų defektai, abu su neigiama kontrole)

**1. Standarto §2 simbolių ribos nebuvo tikrinamos (LL-38 šeima).**
`validate_content.py` tikrino `concept.big_idea` prie **260** simbolių, o
`docs/KURINIO-STANDARTAS.md` §2 sako **240**; `title` (42), `subtitle` (80),
`concept.title` (40), kiekvienas `concept.steps` elementas (200) ir „`title` be
taško gale“ neturėjo nė vieno varto. Modulis su 90 simbolių `subtitle` praeidavo
visus vartus, nors tą patį `subtitle` vaikas skaito klasės sąraše.

Pridėta: `FIELD_LIMITS` + `check_field_limits()` (pažeidimas = `error`, nes
standartas jį įvardija kaip reikalavimą) ir `check_field_limits_against_standard()`,
kuris kiekvieno paleidimo pradžioje lygina lentelę su dokumentu — jei §2 pasikeis,
o kodas liks senas, vartai praneš normų nesutapimą, o ne „0 klaidų“.

**2. `check_module()` nutildavo po pirmos klaidos.**
Sąlyga buvo `if rep.errors and any(str(rel) in e for e in rep.errors[-len(REQUIRED_MODULE):]): return`
— t. y. grįždavo po **bet kurios** šio failo klaidos, įskaitant
`check_index_matches_module()` nesutapimą. Matuota laikiname faile: modulis su
nesutapusiu `subtitle` indekse, 90 simbolių `subtitle`, 2 užduotimis ir be
`optional` davė **1** klaidą; trys kiti pažeidimai liko nematomi. Pataisyta į
`before = len(rep.errors)` … `if len(rep.errors) > before: return` — ankstyvas
grįžimas lieka tik tada, kai trūksta privalomo lauko.

Neigiama kontrolė tame pačiame laikiname faile (po pataisos):

```
KLAIDA: … „subtitle“ nesutampa su klasės indeksu …
KLAIDA: … „subtitle“ 90 simbolių, standartas §2 leidžia 80
KLAIDA: … užduočių turi būti 3–5 (dabar 2)
KLAIDA: … trūksta praplėtimo užduoties („optional“)
Rezultatas: 4 klaidų, 0 įspėjimų                                    (rc=1)
— atstačius failą: 0 klaidų, rc=0
```

Zondas `scripts/probe_field_limits.py` (be tinklo, < 0,2 s, įsijungia į CI
`probe_*.py` ciklą): 10 lūkesnių, 0 nepavykusių — P1–P6 ribų kontrolės
(įskaitant „lygiai ties riba praeina“ ir indeksuotą `concept.steps[2]`), P7
normų sutapimas, P8 sena riba 260 pranešama kaip klaida, P9 dingusi §2 eilutė
pranešama, P10 indekso klaida neslopina kitų patikrų.

Failai: `scripts/validate_content.py`, `scripts/probe_field_limits.py` (naujas),
`docs/KURINIO-STANDARTAS.md` §8, `research/wiki/guidelines/pamokos.md` (LL-220),
`agents/state.json` `last_validation` (git-ignored, bet įrašytas).

## NEPADARYTA

- Turinio defektai palikti kūrėjui (vaidmens riba „neteisingas atsakymas —
  atidaryk issue, netaisyk pats“): #52974, #52972, #52973 jau registruoti.
- Sim teksto dydis: 93 iš 252 patikrų @360 px < 14 px, žemiausias 8,6 px
  (`zaidimu-teorija/12-bendradarbiavimo-tiltas`). Standartas §4.6 px ribos
  neįvardija, todėl tai pastaba, ne vartas (issue #3 tebegalioja).
- `sim.config` sakinio ir scenos daiktų lyginimas (pasiūlymas #55248) —
  neįgyvendintas; šiandien nė vienas vartas to neligina.
- 320 px @200 % nematuota (žemiau standarto pločio, diagnostika).
