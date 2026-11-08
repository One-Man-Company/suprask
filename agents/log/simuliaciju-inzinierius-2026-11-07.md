# Simuliacijų inžinierius — paleidimas 36

**Data:** 2026-11-07 11:15 (EET)
**Šaka:** agent/kurejas-2026-11-07
**Darbas:** `gyvunu-grupes` (modulis `10-gyvunu-grupes`, pasiūlymas #451, normal)
**Failas:** `assets/js/sims/pasaulis.js`

## Ką dariau ir kodėl

Pasiūlymas #451 fiksavo, kad gyvūnų sąrašas maišomas `sort(() => Math.random() - 0.5)`. Tai ne
kosmetika: modelis tapdavo nedeterministinis (tas pats veiksmas duoda skirtingą rezultatą), maišymas
nebuvo tolygus, o kartais visi vienos grupės gyvūnai atsidurdavo greta — tada užduotis virsdavo
„kopijuok kaimyną“, ne klasifikavimas pagal požymį.

Tvarkydamas radau du didesnius modelio trūkumus, kuriuos ištaisiau tame pačiame komponente:

1. **Simuliacija buvo pažymima atlikta po pirmo teisingo priskyrimo.** `api.progress()` buvo
   kviečiamas kiekvieną kartą priskyrus teisingai, o `app.js:388` jį paverčia `progress.markSimDone()`.
   Vaikui, priskyrusiam vieną karvę iš devynių, modulis jau skaitydavosi „simuliacija atlikta“ —
   tai klaidinga būsena, kurią mato ir vaikas, ir mokytojas.
2. **Grįžtamasis ryšys nepaaiškindavo požymio.** Modulio `svietimas1[1]` teigia „kiekvienas
   priskyrimas iškart paaiškinamas požymiu“, o simuliacija tesakydavo „Teisingai — Karvė yra
   žinduoliai“. Vaikas gaudavo nuosprendį, ne priežastį.

Trečias radinys iškilo maketo matavime: ties 320 px trimis stulpeliais dėžės netilpo (min-content
292 px į 258 px stage) ir atsirasdavo 3 px horizontali slinktis. Sutvarkyta tame pačiame faile.

## Kaip modelis veikia dabar

- **Tvarka fiksuota ir sąmoningai permaišyta** (`GYVUNAI` modulio lygmenyje): Karvė → Varnas → Ešerys →
  Lapė → Antis → Karosas → Kiškis → Pelėda → Ryklys. Gretimi gyvūnai visada iš skirtingų grupių,
  todėl sąrašas niekada „neišduoda“ atsakymo ir kiekvienas paleidimas atkuria tą pačią situaciją
  (mokytojas gali pakartoti su kitu vaiku).
- **Požymis kiekviename priskyrime:** `Teisingai — Karvė priklauso žinduoliams ir maitina veršiuką pienu.`
  Kiekvienas gyvūnas turi savo požymį (`pozymis`), o ne bendrą grupės aprašymą.
- **`api.progress` tik surinkus visas devynias grupes.** Po pirmo teisingo priskyrimo `simDone`
  neįrašomas (patikrinta).
- **`api.readout` po kiekvieno veiksmo:** „Pasirinkai: Varnas. Į kurią grupę dėti?“, „Teisingai.
  Karvė priklauso žinduoliams. Liko 8.“, „Ne ši grupė. Karvė liko lentelėje. Liko 9.“, pabaigoje
  „Visos grupės pilnos: žinduoliai 3, paukščiai 3, žuvys 3.“ — būsena suprantama be garso ir be vaizdo.
- **Dėžių pavadinimai tekstiniai:** ekrane gyvūnai yra emoji, todėl kiekvieno dėžės mygtuko
  `aria-label` keičiamas kartu su būsena („Žinduoliai. Įdėta 3. maitina jauniklius pienu.“), o
  emoji žymimos `aria-hidden`. Anksčiau ekrano skaitytuvas dėžėje skaitydavo emoji vardus.
- **Klaviatūros seka be spąstų:** `aria-pressed` ant pasirinkto gyvūno; po pasirinkimo fokusas
  perkeliamas į pirmą dėžę (nesąrašas perkuriamas), po priskyrimo — atgal į pirmą likusį gyvūną,
  pabaigoje — į baigiamąją žinutę (`tabindex="-1"`). Anksčiau `Tab` ėjo iš naujo per visą puslapį.
- **Valymas:** `setTimeout` („wiggle“) registruojami ir išvalomi; grąžinama valymo funkcija.
  `prefers-reduced-motion` jau gesina animaciją per `main.css:327`.
- **Dėžių tinklelis** `repeat(auto-fit, minmax(5.5rem, 1fr))`: 360–414 px — trys stulpeliai,
  320 px — du, be horizontalios slinkties.

## Patikra (tikra išvestis)

```
python3 scripts/validate_content.py           → 0 klaidų, 0 įspėjimų (RC=0)
python3 scripts/validate_content.py --strict  → 0 klaidų, 0 įspėjimų (RC=0)
python3 scripts/check_ui.py                   → 0 klaidų, 0 įspėjimų (RC=0)
python3 scripts/check_audio.py                → 336 tekstai, visi po du įrašus, Piper balsas
node import testas (pasaulis.js)              → SIMS: metu-laikai, augalo-gyvenimas, gyvunu-grupes
```

Headless Chrome (CDP), 320 / 360 / 414 px:

```
320: docScroll 320 / clientWidth 320, wide 0, small [], console []
360: docScroll 360 / clientWidth 360, wide 0, small [], console []
414: docScroll 414 / clientWidth 414, wide 0, small [], console []
determinizmas: du nepriklausomi įkėlimai → ta pati tvarka (Karvė > Varnas > Ešerys > Lapė >
  Antis > Karosas > Kiškis > Pelėda > Ryklys)
```

Funkcinis kelias (360 px, `localStorage` išvalytas):

| veiksmas | readout | `simDone` |
|---|---|---|
| Karvė → Paukščiai (klaida) | „Ne ši grupė. Karvė liko lentelėje. Liko 9.“ | false |
| Karvė → Žinduoliai (1-as teisingas) | „Teisingai. Karvė priklauso žinduoliams. Liko 8.“ | **false** |
| visi 9 gyvūnai | „Visos grupės pilnos: žinduoliai 3, paukščiai 3, žuvys 3.“ | **true** |
| „Iš naujo“ | „Rūšiuok gyvūnus. Liko 9.“, ta pati tvarka, dėžės „Įdėta 0“ | — |

Klaviatūra (CDP `Input.dispatchKeyEvent`): 8 × `Tab` iki pirmo gyvūno → `Enter` (pasirinkta, `aria-pressed`
nustatytas) → fokusas dėžėje „Žinduoliai“ → `Enter` → „Teisingai. Karvė priklauso žinduoliams. Liko 8.“,
fokusas grįžo į „Varnas. Pasirink.“.

## Kas liko ne mano ribose

1. `16-lygybe` dėžutės lietimo laukas tebėra 46 px ties 320 px (pasiūlymas #452, normal) — kita
   simuliacija, todėl šiame paleidime neliečiau.
2. Simuliacija grupina tik akivaizdžius atvejus, nors modulis žada `teacher.misconceptions`
   (šikšnosparnis, delfinas, pingvinas). Pasiūlymas:
   `agents/proposals/2026-11-07-simuliaciju-inzinierius-klaidinantis-gyvunas.json`
3. `api.progress` semantika kituose komponentuose (`calba.js:58` žymi atlikta po pirmos raidės, nors
   `finish()` ateina tik pabaigus visas). Pasiūlymas:
   `agents/proposals/2026-11-07-simuliaciju-inzinierius-progress-semantika.json`

## Publikavimas

Bėgiklis šio paleidimo metu jau įtraukė didžiąją dalį pakeitimo į commit `3d50f38` (kartu su kito
vaidmens darbu). Likę smulkūs pakeitimai (tinklelis, `tabindex`, fokusas, žinutės formuluotė) palikti
darbinėje kopijoje: `git diff --stat` → `assets/js/sims/pasaulis.js | 8 +, 3 −`.
