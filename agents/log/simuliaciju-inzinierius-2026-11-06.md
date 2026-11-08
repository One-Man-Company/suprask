# Simuliacijų inžinierius — paleidimas 28

**Data:** 2026-11-06 11:15 (EET)
**Šaka:** agent/kurejas-2026-11-06
**Darbas:** `augalo-gyvenimas` (modulis `09-augalo-gyvenimas`, pasiūlymas #222, high)
**Failas:** `assets/js/sims/pasaulis.js` (commit be9df41, 207 +, 37 −)

## Kodėl ši simuliacija

Kritikas (#222) nustatė tris prieštaravimus modulyje `09-augalo-gyvenimas`:

1. Augimas buvo `min(water, light)/5 × min(day/10, 1)` — vanduo 5 visada geriau už 4, tad modelis
   **stiprino** tą klaidingą nuostatą („daug vandens geriau“), kurią modulis pats įvardija kaip klaidą
   (`teacher.misconceptions[1]`).
2. Modelis turėjo tik `water` ir `light`, o `outcomes` žada vandenį, šviesą, **šilumą** ir **dirvožemį** —
   dviejų sąlygų vaikas negalėjo nei atrasti, nei patikrinti.
3. Po 10 dienos „Diena →“ nebedavė jokio pokyčio.

## Ką modelis daro dabar

Vienas kintamasis vaikui — sąlyga, o laikas — antras:

- **Vanduo 0–5**, augimo dalis `AG_WATER = [0, 0.4, 0.85, 1, 0.5, 0.15]`. Optimalu 3; 4 ir 5 kenkia
  (šaknys „dūsta“), 0 — vysta. Tai tiesiogiai griovė nuostatą „kuo daugiau vandens, tuo geriau“.
- **Šviesa 0–5**, `AG_LIGHT = [0, 0.3, 0.7, 1, 1, 1]`.
- **Šiluma** — šalta / šilta (0,1 / 1). Pridėta, kad `outcomes` šiluma būtų tikrinama, o ne tik minima.
- **Augimas per dieną = silpniausia sąlyga × 0,22** (`agFactors().gf`). Vienos trūkumas sustabdo viską,
  todėl 10 dienų su perlaistymu duoda mažą augalą — tai jaučiama, ne tik perskaitoma.
- **Dydis kaupiasi, būsena reaguoja iš karto**: lapai nusvyra (perlaistymas, sausa), stiebas blyšksta
  (tamsa), augalas neauga (šalta). Tai skirtingi dalykai ir vaikui tai matoma.
- `api.progress` — tik pražydus; `api.readout` — `„Žiedas · vanduo gerai · šviesa gerai · šilta · 6 dienos“`;
  `api.note` — silpniausios grandies paaiškinimas; `api.speak` — etapo vardas, kai jis pasikeičia.
- Modelio riba pasakyta žodžiu po simuliacija: „dirvožemis čia yra visą laiką, o šaknų nematome“.

## Patikra (tikra išvestis)

```
python3 scripts/validate_content.py          → 0 klaidų, 0 įspėjimų (RC=0)
python3 scripts/validate_content.py --strict → 0 klaidų, 0 įspėjimų (RC=0)
python3 scripts/check_ui.py                  → 0 klaidų, 0 įspėjimų (RC=0)
python3 scripts/check_audio.py               → 329 tekstai, visi po du įrašus, Piper balsas
node --check assets/js/sims/pasaulis.js      → OK
node import testas                           → SIMS: metu-laikai, augalo-gyvenimas, gyvunu-grupes
```

Headless Chrome (CDP, `Emulation.setDeviceMetricsOverride`), 320 / 360 / 414 px:

```
docScroll == docClient (320/320, 360/360, 414/414)
stage.scroll == stage.client, controls.scroll == controls.client
wide: []   small: []        (nė vieno elemento už ribų, nė vieno taikinio < 48 px)
console: []                 (Runtime.exceptionThrown + Log.entryAdded: 0)
```

Maketas: `sim-shell` 780 px ties 360 px (buvo 965), valdikliai 239 px (buvo 424) — visa simuliacija
telpa į vieną 800 px ekraną. Ties 320 px dienos eilutė gražiai persikelia į dvi eilutes (102 px),
horizontaliоs slinkties nėra. Visi mygtukai ≥ 48 px pločio.

Modelio elgsena (išvesta ir palyginta, ne „atrodo gerai“):

| veiksmas | readout | note |
|---|---|---|
| 6 dienos gerų sąlygų | Žiedas · … · 6 dienos | „Augalas išaugo ir pražydo…“ |
| vanduo 5 | Augalas vysta · vanduo per daug | „Ko trūksta: per daug vandens, šaknys nekvėpuoja“ |
| vanduo 0 | Augalas vysta · vanduo nėra | „Ko trūksta: nėra vandens, lapai nusvyra“ |
| šviesa 0 | Augalas blyškus · šviesa nėra | „Ko trūksta: nėra šviesos, augalas blyškus“ |
| šalta | Augalas neauga | „Ko trūksta: šalta, augalas beveik neauga“ |
| 10 dienų nuo pradžios su vanduo 5 | Augalas vysta · 11 dienų | augalas liko mažas, `simDone` neįrašytas |

Papildomai patikrinta: lapo kelio `d` pasikeičia, kai augalas vysta (tip y 133 → 176);
`localStorage` `suprask:progress:v1` gauna `simDone: true` tik po žiedo; po „Iš naujo“ būsena grįžta
į „Sėkla · 1 diena“; klaviatūra — `Tab`, `Enter` ant „Diena →“, `Space` ant „+“ keičia būseną.

## Rasta ir pataisyta pačios eigos metu

- Etapo žymė ėjo vien nuo dydžio: numirštantis augalas vis dar rodė „Žiedas“. Dabar `agStage(size, wilt, cold, pale)`.
- Tamsa neblokavo žiedo ir nekeitė etapo — pridėta `pale` į `bloom` ir į etapą.
- Paaiškinimas sakė „Sąlygos geros“, kai vandens buvo 1 (augimas 0,4). Dabar kliūtis nustatoma pagal
  mažiausią dalį (`why()`), o „Sąlygos geros“ rodoma tik kai `gf ≥ 0,8`.
- Valdiklių skydas buvo 424 px — vaikas negalėjo matyti augalo ir mygtukų vienu metu. Perdaryta į tris eilutes.

## Kas ne mano ribose (pasiūlymai)

1. Modulio 1 užduotis „Ko augalui reikia labiausiai?“ su atsakymu „Vandens ir šviesos“ dabar prieštarauja
   modeliui, kuriame šiluma taip pat būtina. → `agents/proposals/2026-11-06-simuliaciju-inzinierius-uzduotis-1.json`
2. `gyvunu-grupes` (`pasaulis.js:450`) rūšiuoja `Math.random()` — modelis nedeterministinis.
   → `agents/proposals/2026-11-06-simuliaciju-inzinierius-gyvunu-determinizmas.json`
3. `16-lygybe` dėžutės lietimo laukas 64 vienetų → 46 px ties 320 px pločio ekranu (2 px iki 48).
   → `agents/proposals/2026-11-06-simuliaciju-inzinierius-lygybes-taikinys.json`

## Publikavimas

Commit be9df41 atliktas bėgiklio (`assets/js/sims/pasaulis.js`, 207 +, 37 −). Darbinė kopija šio failo
atžvilgiu švari; `git show HEAD:` baitai sutampa su disku (sha256 c8eac347…).
