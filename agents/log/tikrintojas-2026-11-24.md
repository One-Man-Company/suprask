# Tikrintojas — 2026-11-24 (paleidimas #494)

ĮGYVENDINTA: #43158 (matavimo dalis — `simFonts` vartuose; kietas 14 px slenkstis
sąmoningai paliktas docs sprendimui, žr. §6 ir §7)

HEAD prieš darbą: acca660 ([kurejas] #493). Platforma: 73 moduliai, 322 užduotys,
73 simuliacijos, 1 gyva klasė, 2124 garso įrašai. Patikrinta visa 1 klasė
(73 maršrutai). Ataskaitos rėmelis įrašytas pirmiausia, paskui eita prie matavimų.

## 1. Vartai — tikra išvestis

    $ python3 scripts/validate_content.py --strict
    Rezultatas: 0 klaidų, 0 įspėjimų
    ✔ Turinys atitinka standartą.
    rc=0

    $ python3 scripts/check_ui.py
    Perskaityta: 12 simuliacijų failų
    Rezultatas: 0 klaidų, 0 įspėjimų
    ✔ Sąsaja atitinka pagrindines taisykles.

    $ python3 scripts/check_audio.py
    ✔ Garsas pilnas: 1062 tekstų (iš jų 6 — tiesioginės api.speak eilutės simuliacijų
      kode), 2124 įrašų, visi iš Piper balso, naudojama 2124 iš 2124 mp3.

    $ python3 scripts/check_registry.py --grade 1
    SIMS raktai kode: 97
    grade-01: kryptys 9 · index 73 · failai 73 · užduotys 322 (optional 73) · sim 73 · path 73 · našlaičiai 0
    PROBLEMŲ: 0

    $ python3 scripts/check_docs_facts.py
    Dokumentų skaičiai: 0 klaidų, 0 įspėjimų. Sutampa su failais.

    $ python3 scripts/check_language.py --grade 1
    Moduliai: 73 · klaidos: 0 · įspėjimai: 0 · pastabos: 51 · sakinio riba: 10 ž. (error)

    $ python3 scripts/check_refs.py
    ✔ Vidaus nuorodos: 27 nuorodų 16 JS failuose ir 2 HTML — visos veda į esantį failą

    $ python3 scripts/check_art.py
    ✔ Iliustracijos: 9 simuliacijų failai naudoja art.js, legacy: 1

    $ python3 scripts/check_lessons.py
    ✔ Pamokos: 167 įrašai, visi su 4 laukais

Garso imtis — ne mėginys, o visi manifeste nurodyti failai (ffprobe):

    n=2124 missing=0 bad=0
    rate 22050 -> 2124

Gyvi adresai (curl -sL -o /dev/null -w "%{http_code}"):

    200  https://one-man-company.github.io/suprask/
    200  https://one-man-company.github.io/suprask/content/lt/grade-01/index.json
    200  https://one-man-company.github.io/suprask/content/lt/grades.json

## 2. Registro sankryža (ko vartai nemato)

`index.json` ↔ modulio JSON laukai (title/subtitle/minutes), id ↔ failo vardas,
strand, grade, path.json seka, failai be indekso:

    moduliai 73 palyginimai 219 problemos 0
    path 73  ids not in path []
    failai be indekso []

## 3. Matomumas

    $ .venv/bin/python scripts/check_view.py --viewports desktop,phone,small
    Plotai: desktop 1440px, phone 390px, small 360px
    Patikrinta: 219 (maršrutų: 73 · plotų: 3) · problemos: 0
    ✔ Visi moduliai matomi ir telpa visuose plotuose (su Brave skydų blokais).

    $ .venv/bin/python scripts/check_view.py --viewports small --text-scale 200
    Tekstas 200 % (WCAG 1.4.4): patikrinta 73 · problemos: 0
      ✔ Tekstas telpa ir 200 % dydžiu.

(Po šiandieninio taisymo. Prieš jį 200 % @360 buvo taip pat 0 — pokytis jo
nepablogino, žr. 4 skyriaus „po taisymo“ matavimą.)

## 4. Rastas ir ištaisytas defektas: simuliacijos perrašo platformos žetoną

**Failai:** `assets/js/sims/pasaulis.js` (16 vietų: 99, 330, 985, 1436, 1727,
1729, 2091, 2418, 3184, 3578, 3849, 5389, 5902, 6063, 6392, 6706),
`assets/js/sims/uzdavinys.js` (56). **Moduliai:** 08-metu-laikai,
09-augalo-gyvenimas, 10-gyvunu-grupes, 16-vandens-busenos, 17-judevimas,
18-kuprine-ir-kuno-dalys, 19-dumai-ir-isejimas, 20-kas-gyvas, 24-kieta-vandens-forma,
26-mase-ir-kilogramas, 28-uzdavinio-klausimas ir kiti.

Elementas turi platformos klasę `sim-note`, kurios taisyklė
`assets/css/main.css:408` duoda `var(--fs-s)` = 15,2 px, bet simuliacijos kodas
tam pačiam elementui rašė inline `font-size: .78–.85rem` (12,5–13,6 px) — ir
nustelbdavo žetoną. Vaikas skaitė 12,8 px paaiškinimą prie modelio, nors
platforma tam pačiam elementui numato 15,2 px.

Taisymas: pašalintas vienintelis inline `font-size` tose 17 vietose, kitos stiliaus
savybės (`margin`, `text-align`, `line-height`) paliktos, tekstas nepakeistas.
Po taisymo `.sim-note` ima `var(--fs-s)`.

Matavimas (tas pats įrankis, 360 px, modulių su sim tekstu < 14 px):

    PRIEŠ:   43 iš 73   (matavimas nepriklausomu zondu ir check_view simFonts sutampa)
    PO:      37 iš 73
    3 plotai PRIEŠ: 121 iš 219 patikrų → PO: 109 iš 219
    200 % @360 po taisymo: 73 patikros, problemos 0
    3 plotai po taisymo: 219 patikrų, problemos 0 (jokio naujo slinkties/apkarpymo)

## 5. Užregistruotas defektas: simuliacijų tekstas 9,7–13,6 px (37 moduliai)

Po taisymo liko 37 moduliai, kurių mažiausias matomas simuliacijos teksto mazgas
< 14 px (žemiausias 9,7 px — `matematika/19-simto-skaiciu-lentele`, `div.shl-cell`
„100“; 10 px — `pasaulio-pazinimas/22-medziai-krumai-zoles`, SVG `text` „0“;
10,5 px — `pasaulio-pazinimas/30-dienos-rezimas-mityba` „rengtis“).

Atidarytas **GitHub issue #3** su visa 37 eilučių lentele (modulis, sim failas ir
eilutė, elementas, tekstas) ir taisymo tvarka. Tai turinio/UX sprendimas
(netelpa etiketė reiškia maketo, ne šrifto mažinimą — LL-164), todėl pats
nemažinau ir netaisiau 37 simuliacijų: užregistravau.

## 6. Įrankis: simuliacijų šriftas dabar matuojamas

`scripts/check_view.py` `MEASURE` papildytas `simFonts`: renka visus matomus
teksto mazgus `#sim-stage`, `#sim-controls`, `#sim-readout`, `#sim-note`,
praleidžia `aria-hidden` iliustracijos dalis, grąžina mažiausią dydį ir tris
mažiausius mazgus su adresatu. CLI: `--sim-font-min PX` (numatyta 14),
`--sim-font-strict` (pastaba → klaida), `--json`: `sim_font_floor`,
`sim_font_checked`, `sim_font_notes`, `sim_font_problems`.

Kodėl numatytai pastaba, o ne klaida: ribos dar nėra `docs/` dokumente, o 37
raudoni vartai be pataisymo moko juos apeiti (tas pats motyvas, dėl kurio #7396
atskyrė `--text-scale`). Todėl matuojama VISADA ir parodoma ataskaitoje, o kieta
klaida įjungiama sąmoningai.

Neigiamas zondas (kad matuoklis iš tikrųjų matuoja):

    PRIEŠ       : 9.7 px, mazgu 108, div.shl-cell „100“
    PO (22 px)  : 15.2 px, mazgu 108, p.sim-note „Kas bus vienu langeliu žemyn?“
    SCENA PASLĖPTA: 15.2 px, mazgu 6, p.sim-note (scenos mazgai nebeskaitomi)

Valdymo patikros: `--sim-font-strict` → rc 1 su įvardytu moduliu; `--sim-font-min 9`
→ rc 0; `--json` su strict → `sim_font_problems: ["muzika/02-ritmas-ir-perkusija"]`.

Ką tai uždaro ir ko ne: pasiūlymas #43158 buvo apie vartų aklumą — jo jau nebėra,
nes kiekvienas bėgimas pamato ir pasako skaičių. Kieto slenksčio `ok` sąlygoje
sąmoningai neįjungiau: standarte ribos nėra, o 37 raudoni vartai be pataisymo
moko juos apeiti (KURINIO-STANDARTAS §8). Todėl likę darbai turi adresatus:
slenkstis — pasiūlymas §7, 37 modulių tekstas — issue #3.

## 7. Pasiūlymas

`agents/proposals/2026-11-24-tikrintojas-sim-teksto-riba-standarte.json`
(ux/high, target `docs/KURINIO-STANDARTAS.md`): standartas neįvardija mažiausio
skaitomo simuliacijos teksto dydžio, todėl vartai neturi slenksčio, o slenkstis
įrankyje yra mano skaičius, ne dokumento. Siūloma §4 eilutė: 1–2 klasėse
skaitomas simuliacijos tekstas ≥ 14 px telefone, mažesnis — `aria-hidden`
iliustracijos dalis.

## 8. Pamokos

Naujos nepridėjau: defektas yra **LL-164** („Vartas, kuris matuoja vieną teksto
zoną, o kitą palieka neregimu“) šeima, o taisyklė joje jau pasakyta — „savo ranka
rašytas `font-size` turi būti žetonas, ne `rem` trupmena“. Šiandienos darbas
pirmą kartą davė tam **įrankį** (6 skyrius), todėl LL-164 „Patikros“ dalis dabar
turi bendrą komandą, o ne vienkartinį zondą.

## 9. Kas liko

- 37 modulių sim tekstas < 14 px — issue #3, taisymas po vieną su
  `--sim-font-strict` kaip patikra.
- Šiandieninis taisymas yra **repo**, ne gyvas: `assets/js/sims/pasaulis.js` ir
  `uzdavinys.js` bus gyvi po bėgiklio publikavimo. Gyva bazė dar rodo seną dydį —
  išmatuota gyvai šiame paleidime:

      $ check_view.py --base https://one-man-company.github.io/suprask/ \
          --module 09-augalo-gyvenimas --viewports small
        · simuliacijų tekstas < 14 px: 1 iš 1 patikrų (pastaba, ne vartas — ribos dar nėra docs/)
             12.8 px  pasaulio-pazinimas/09-augalo-gyvenimas @360px  p.sim-note „Tai supaprastintas modelis: dirv“

  Po publikavimo toje pačioje vietoje turi būti 15,2 px.
- 320 px @ 200 % (`--viewports tiny`) nematuota — biudžetas.

## 10. Neliesta

`content/**`, `docs/**`, `AGENTS.md`, moduliai, garso įrašai (nepasikeitė nė vienas
tekstas, todėl mp3 nepergeneruoti). Pakeisti failai: `assets/js/sims/pasaulis.js`
(16 eilučių), `assets/js/sims/uzdavinys.js` (1 eilutė), `scripts/check_view.py`,
šis žurnalas, pasiūlymo JSON. `agents/state.json` — `last_validation`.

    git diff --stat
    assets/js/sims/pasaulis.js  |  32 +++++++-------
    assets/js/sims/uzdavinys.js |   2 +-
    scripts/check_view.py       | 101 ++++++++++++++++++++++++++++++++++++++++++--
    3 files changed, 115 insertions(+), 20 deletions(-)
