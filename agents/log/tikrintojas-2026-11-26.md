# Tikrintojas — 2026-11-26 (paleidimas #545)

82 moduliai, 359 užduotys, 82 simuliacijų, 9 kryptys, 2426 mp3.
Bazinė patikra — **0 klaidų**. Šiame paleidime uždaryta viena reali vartų akloji
zona: standarto §4.4 „spalva niekada nėra vienintelis informacijos nešėjas“ buvo
tikrinama vien CSS lygmenyje, o modelio duomenyse — niekas (pasiūlymas #46530).

## Vartų išvestis (tikra)

```
$ python3 scripts/validate_content.py --strict
Rezultatas: 0 klaidų, 0 įspėjimų
✔ Turinys atitinka standartą.                      (rc=0)

$ python3 scripts/check_ui.py
Perskaityta: 12 simuliacijų failų
Rezultatas: 0 klaidų, 0 įspėjimų
✔ Sąsaja atitinka pagrindines taisykles.

$ python3 scripts/check_audio.py
✔ Garsas pilnas: 1213 tekstų (iš jų 8 — tiesioginės api.speak eilutės simuliacijų
  kode), 2426 įrašų, visi iš Piper balso, naudojama 2426 iš 2426 mp3.

$ python3 scripts/check_registry.py --grade 1
SIMS raktai kode: 110
grade-01: kryptys 9 · index 82 · failai 82 · užduotys 359 (optional 82) · sim 82 · path 82 · našlaičiai 0
PROBLEMŲ: 0

$ python3 scripts/check_docs_facts.py   → Dokumentų skaičiai: 0 klaidų, 0 įspėjimų
$ python3 scripts/check_refs.py         → 27 nuorodų 16 JS failuose ir 2 HTML — visos veda į esantį failą
$ python3 scripts/check_art.py          → 9 simuliacijų failai naudoja art.js, legacy: 1
$ python3 scripts/check_lessons.py      → 202 įrašai, visi su 4 laukais
$ python3 scripts/check_language.py --grade 1 --strict → 82 moduliai, 0 klaidų, 0 įspėjimų, 55 pastabos
$ python3 scripts/check_agents.py       → 15 vaidmenų, 1 įspėjimas (9 sisteminiai pasiūlymai laukia >3 d. — senas, ne šio darbo)
$ python3 scripts/check_published.py    → repo ir gyva svetainė sutampa: 82 moduliai, ID, seka, baitai,
                                          2426/2426 garso vardai = baitai ir tekstas (versija 84e585ef)
```

### 22 050 Hz patikra

Per visus `assets/audio/lt/` mp3 (ffprobe, mono imtis, be atrankos):

```
manifest strings: 2426   mp3 diske: 2426
rates: Counter({'22050': 2426})
```

### Sąsajos matavimas (naršyklė)

```
$ .venv/bin/python scripts/check_view.py
Patikrinta: 246 (maršrutų: 82 · plotų: 3) · problemos: 0
  · simuliacijų tekstas < 14 px: 103 iš 246 patikrų (pastaba, ne vartas)
        8.6 px  zaidimu-teorija/12-bendradarbiavimo-tiltas @360px  text „Tu“
        9.2 px  pasaulio-pazinimas/22-medziai-krumai-zoles @360px  text „0“
        9.6 px  pasaulio-pazinimas/30-dienos-rezimas-mityba @360px  text „rengtis“
        9.7 px  matematika/19-simto-skaiciu-lentele @360px  div.shl-cell „100“
✔ Visi moduliai matomi ir telpa visuose plotuose (su Brave skydų blokais).

$ .venv/bin/python scripts/check_view.py --text-scale 200 --json
scaled_checked 246 · problems 0 · scaled_unapplied []      (rc=0)
```

Papildomas elgsenos zondas (360 px, lokalus serveris, 82 maršrutai):
`#sim-readout` iškart po `.task` atsiradimo — **tuščias 0**, krovimo klaidų 0.
Pasiūlymas #52529 („pradinė būsena be teksto“) šiandien **nepasitvirtino**:
kalba ėjo apie `04-kaip-zmones-sveikinasi`, o `calba.js:536` jau turi
`api.readout` įkėlimo metu (pataisyta #536). Pasiūlymo neatidarysiu.

## Gyvi adresai

```
200 https://one-man-company.github.io/suprask/
200 https://one-man-company.github.io/suprask/content/lt/grade-01/index.json
200 https://one-man-company.github.io/suprask/content/lt/grades.json
200 https://one-man-company.github.io/suprask/assets/css/main.css
```

Gyvas `index.json` turi 82 modulius — sutampa su repo.

## Ištaisyta aklinoji zona: §4.4 buvo vartas tik CSS, o ne modeliui

`validate_content.py` dabar turi `check_sim_palette()`. Jei modulis deklaruoja
`sim.config.palette`, tikrinama keturiais sluoksniais:

1. kiekvienas uždavinyje naudojamas žetonas egzistuoja paletėje ir turi ne tuščią
   `shape` (be formos žetonas atpažįstamas tik atspalviu — būtent LL-174);
2. atsakymų variantai privalo skirtis **forma**;
3. po teisingo žetono įterpimo seka turi būti periodiška (kitaip „taisyklės“,
   kurią vaikas turi atrasti, nėra);
4. teisingas variantas (`answer`) privalo būti **tas**, kuris padaro seką
   periodiška — kitaip atsakymas priklauso nuo spalvos.

Įėjimo erdvės matavimas pakeitė ir patį vartą: pirma versija turėjo atšaką
„daugiau nei vienas sprendimas be spalvos“, kuri negali suveikti **nė kartam**
(išvardijus visas 2–5 žetonų sekas iki 9 vietų — 0 atvejų, nes viena tuščia vieta
periodišką seką padaro daugiausia vienu būdu). Atšaka pašalinta su komentaru, o ne
palikta „dėl saugumo“ — vartas, negalintis suveikti, apie tą sritį neturi sakyti
ir „gerai“ (nauja pamoka LL-202).

Senoji defekto forma (visi žetonai `apskritimas`, kaip buvo prieš #505) dabar yra
raudona su failu ir adresatu:

```
KLAIDA: content/lt/grade-01/matematika/07-desningumai.json: „sim.config.tasks[1]“
        atsakymų variantai nesiskiria forma (apskritimas) — be spalvos jų neatskirtum (LL-174)
… tasks[2] … tasks[3] … tasks[4] … tasks[5]
Rezultatas: 5 klaidų, 0 įspėjimų
```

Failas atstatytas, `validate_content.py --grade 1 --strict` → 0/0 rc 0.

## Neregistruota / nepadaryta

- **Turinio defektai palikti kūrėjui** (ribos: „neteisingas atsakymas ar bloga
  formuluotė — atidaryk issue, netaisyk pats“):
  - `#52974` gėlė „kvėpuoja“: sakinys siunčia į stiklinę vandens, o `pasaulis.js:6661`
    piešia burbuliukus ore prie vazoninės gėlės;
  - `#52972` dienos juosta: kėlimasis 7:25 duoda −5 min. pusryčių, o juosta
    pravažiuoja išėjimo liniją (aritmetika perskaičiuota: 35, 15, −5);
  - `#52973` README:112 „du variantus (sakinys ir skiemuo)“ — iš tikrųjų du tempai.
- **Sim tekstas < 14 px**: 103 iš 246 patikrų (38 unikalūs moduliai @360) — issue #3
  tebegalioja; tai maketo/kūrėjo darbas, ne vartų.
- **320 px @200 %** nematuota (standartas 360 px; `--viewports tiny` yra diagnostika).
- **`check_svg_fit.py` nepaleistas**: reikia `playwright` sisteminio Python'e, yra tik
  `.venv` (ten jis ir veikia).

## Failai

- `scripts/validate_content.py` — `check_sim_palette()`, `_palette_tasks()`, `_period()`;
- `scripts/probe_palette_gate.py` (naujas) — 7 lūkesčiai, 0,04 s, be tinklo; CI ima
  visus `probe_*.py` automatiškai;
- `docs/KURINIO-STANDARTAS.md` §8 — įrašyta, ką validatorius dabar tikrina;
- `research/wiki/guidelines/pamokos.md` — LL-202 (vartas su atšaka, kuri negali suveikti);
- `agents/state.json` — `last_validation`.
