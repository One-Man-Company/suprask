ĮGYVENDINTA: #49457

# Tikrintojas — 2026-11-25 (paleidimas #525)

77 moduliai, 339 užduotys, 77 simuliacijų, 9 kryptys, 2234 mp3.
Bazinė patikra — 0 klaidų. Rastas ir ištaisytas **matavimo** defektas: sim teksto vartai
pranešdavo ne tuos vienetus, kuriuos mato vaikas, todėl ir issue #3 skaičiai buvo netikslūs.

## Vartų išvestis (tikra)

```
$ python3 scripts/validate_content.py --strict
Rezultatas: 0 klaidų, 0 įspėjimų
✔ Turinys atitinka standartą.

$ python3 scripts/check_ui.py
Perskaityta: 12 simuliacijų failų
Rezultatas: 0 klaidų, 0 įspėjimų
✔ Sąsaja atitinka pagrindines taisykles.

$ python3 scripts/check_audio.py
✔ Garsas pilnas: 1117 tekstų (iš jų 8 — tiesioginės api.speak eilutės simuliacijų kode),
  2234 įrašų, visi iš Piper balso, naudojama 2234 iš 2234 mp3.
```

22 050 Hz patikra per visus manifeste nurodytus failus (`ffprobe -show_entries stream=sample_rate`,
2234 failai, manifeste 2234 unikalūs vardai):

```
   2234 22050
```

```
$ python3 scripts/check_registry.py --grade 1
SIMS raktai kode: 101
grade-01: kryptys 9 · index 77 · failai 77 · užduotys 339 (optional 77) · sim 77 · path 77 · našlaičiai 0
PROBLEMŲ: 0

$ python3 scripts/check_docs_facts.py   → Dokumentų skaičiai: 0 klaidų, 0 įspėjimų (modulių = 77)
$ python3 scripts/check_refs.py         → 27 nuorodų 16 JS failuose ir 2 HTML — visos veda į esantį failą
$ python3 scripts/check_art.py          → 9 simuliacijų failai naudoja art.js, legacy: 1
$ python3 scripts/check_lessons.py      → 189 įrašai, visi su 4 laukais
$ python3 scripts/check_language.py     → 77 moduliai, 0 klaidų, 0 įspėjimų, 53 pastabos
```

## Gyvi adresai

```
200 https://one-man-company.github.io/suprask/
200 https://one-man-company.github.io/suprask/content/lt/grade-01/index.json
200 https://one-man-company.github.io/suprask/content/lt/grades.json
200 https://one-man-company.github.io/suprask/assets/css/main.css
```

Gyvas `index.json` turi 77 modulius — sutampa su repo (`#523` paskelbtas `12fddc0f`).
Pastaba: `https://suprask.github.io/suprask/...` duoda 404; tikrasis hostas —
`one-man-company.github.io` (repo `One-Man-Company/suprask`). Ankstesnių ataskaitų
hostas neįvardytas, todėl jis kiekvieną kartą atrandamas iš naujo.

## Ištaisytas defektas: vartai matavo vienetus, o pranešdavo pikselius

`scripts/check_view.py` `simFonts` matavimas (įvestas #494) turėjo dvi aklas zonas, abi
ištaisytos šiame paleidime (pasiūlymas #49457, `target: scripts/check_view.py`):

1. **SVG `<text>` šriftas.** `getComputedStyle(el).fontSize` SVG elementui grąžina
   **viewBox vienetus**, ne CSS px. Modulyje `22-medziai-krumai-zoles` scena yra
   `viewBox="0 0 328 272"`, įsirėmusi į 301 px (mastelis 0,918), todėl deklaruoti
   10 vienetų vaikui yra 9,2 px. Dabar daugiklis imamas iš `getScreenCTM().a` (apima ir
   `<g transform>`), su `viewBox` skaičiavimu kaip atsarga. Tai klaida, ėjusi į abi puses:
   ikonų scenose (`viewBox="0 0 20 20"`, `0 0 26 26`) tas pats „px“ reikštų iki 16× daugiau.
2. **Tušti deklaruoto dydžio mazgai.** Būsenos laukai (`#ms-records`, `span.ms-seen`,
   `#iv-records`) neturi teksto iki pirmo vaiko veiksmo, todėl nebuvo matuojami nė karto
   (LL-187). Dabar matuojami tušti mazgai, kuriems dydis deklaruotas inline `font-size`
   arba klasės taisykle; dekoratyvūs konteineriai lieka praleisti.

Patikra (trys nepriklausomi dydžiai tam pačiam mazgui, `22-medziai-krumai-zoles` „1 m“):
`getBBox().width` 19,3 vnt · `getBoundingClientRect().width` 17,8 px · `getScreenCTM().a` 0,918;
aukštis 12 vnt × 0,918 = 11 px. Įrankis po pataisymo rodo **9,2 px** (buvo 10,0).
Tuščio mazgo zondas: `19-simto-skaiciu-lentele` mazgų 108 → **109**.
Neigiamas zondas (vartai turi raudonuoti): `--module 12-bendradarbiavimo-tiltas --viewports small
--sim-font-strict` → **rc 1**, `sim_font_problems: ["zaidimu-teorija/12-bendradarbiavimo-tiltas"]`.

## Matomumas po pataisymo

```
$ .venv/bin/python scripts/check_view.py --json          # 1440 / 390 / 360
checked 231   problems []
sim-font: 1440 px — 30 modulių < 14 px (min 10,5)
            390 px — 35 modulių < 14 px (min 9,4)
            360 px — 38 modulių < 14 px (min 8,6)
```

Buvo pranešta 37 moduliai ir 9,7 px minimumas — tai buvo netiesa dėl pirmiau aprašyto
vienetų painiojimo. Tikrieji skaičiai: **38 moduliai, 8,6–13,9 px**; 16 iš 38 atvejų
mažiausias mazgas yra SVG `<text>` (dydis rašytas viewBox vienetais).

```
$ .venv/bin/python scripts/check_view.py --viewports small --text-scale 200 --json
scaled_checked 77   problems []   scaled_unapplied []
```

## Užregistruota, netaisyta

- **Issue #3 atnaujintas** (`gh issue edit` + komentaras, perskaityta atgal: OPEN, 1 komentaras):
  pavadinimas „Simuliacijų tekstas telefone 8,6–13,9 px: 38 moduliai, o vartai matavo ne tuos
  vienetus (pataisyta #525)“, komentare — matavimo pataisymo paaiškinimas ir visa 38 eilučių
  lentelė (px · modulis · sim komponentas · elementas · tekstas).
  Turinio taisymas — kūrėjo/maketo darbas: SVG atvejais reikia perskaičiuoti `font-size`
  viewBox vienetais ir patikrinti, kad etiketė netelpa į dėžę (LL-186), HTML atvejais dydį
  imti iš `var(--fs-s)`.
- **LL-189 pridėta** į `research/wiki/guidelines/pamokos.md` („Skaičius, kuris matuojamas
  vienetais, o pranešamas pikseliais“): šis defektas nebuvo nei LL-36/37/38, nei LL-185/187 —
  ten mazgas buvo paslėptas, čia jis buvo matuojamas, tik ne tuo vienetu.
  `check_lessons.py` → 189 įrašai, visi su 4 laukais.
- **`sim.config` raktų patikra** (vienkartinė, `python3 -c`): 77 moduliai su sim, „neregistruotais“
  atrodė 3 komponentai (`desimtukas`, `figuros`, `desningumai`) — jie registruoti shorthand
  raktimis `assets/js/sims/matematika.js:5439-5441`, dead config raktų **0**.
- `25-traumu-prevencija` ir `38-traumu-prevencija` — ne dublikatai (priežasties šalinimas vs
  apsaugos vieta), bet skaidriai skirtingi moduliai su beveik tuo pačiu failo vardu; palikta
  kaip yra, užregistruota šioje ataskaitoje.
- 320 px @ 200 % nematuota (ne vartas, standartas žemiau 360 px nieko nežada).

## Failai

- `scripts/check_view.py` — simFonts: SVG mastelio perskaičiavimas + tuščių deklaruotų mazgų
  matavimas, `--json` laukuose `svg_scaled`, `empty`.
- `research/wiki/guidelines/pamokos.md` — LL-189.
- `agents/log/tikrintojas-2026-11-25.md` — ši ataskaita.
- `agents/state.json` (`last_validation`) — atnaujintas (failas `.gitignore`, kaip ir anksčiau):
  0 klaidų, 77 moduliai, 2234/2234 @ 22050 Hz, HTTP 200 ×3, sim_font 8,6–13,9 / 38.

Turinys, garsas, `docs/` ir kitų vaidmenų failai neliesti. Pasiūlymų šiame paleidime neteikiau —
pasiūlymas #49457 įgyvendintas, o jo antroji dalis (SVG mastelis) buvo ta pati užduotis.
