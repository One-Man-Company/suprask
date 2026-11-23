# Tikrintojas — 2026-11-23 (paleidimas #463)

HEAD prieš darbą: d5df08b ([kurejas] #462). Platforma: 62 moduliai, 273 užduotys,
62 simuliacijos, 1766 garso įrašai. Patikrinta visa 1 klasė (62 maršrutai).

## 1. Vartai — tikra išvestis

    $ python3 scripts/validate_content.py --strict
    Rezultatas: 0 klaidų, 0 įspėjimų
    ✔ Turinys atitinka standartą.
    rc=0

    $ python3 scripts/check_ui.py
    Perskaityta: 12 simuliacijų failų
    Rezultatas: 0 klaidų, 0 įspėjimų
    ✔ Sąsaja atitinka pagrindines taisykles.
    rc=0

    $ python3 scripts/check_audio.py
    ✔ Garsas pilnas: 883 tekstų (iš jų 6 — tiesioginės api.speak eilutės simuliacijų
      kode), 1766 įrašų, visi iš Piper balso, naudojama 1766 iš 1766 mp3.

Sample rate atskirai (ffprobe per visus manifeste nurodytus failus, ne ėminį):

    mp3 įrašų manifeste: 1766, patikrinta ffprobe: 1766, ne 22050 Hz: 0, nerasta diske: 0

    $ python3 scripts/check_registry.py --grade 1
    SIMS raktai kode: 84
    grade-01: kryptys 9 · index 62 · failai 62 · užduotys 273 (optional 62) · sim 62 · path 62 · našlaičiai 0
    PROBLEMŲ: 0

    $ python3 scripts/check_docs_facts.py
    Dokumentų skaičiai: 0 klaidų, 0 įspėjimų. Sutampa su failais.

    $ python3 scripts/check_language.py --grade 1
    Moduliai: 62 · klaidos: 0 · įspėjimai: 0 · pastabos: 44 · sakinio riba: 10 ž. (error)

Gyvi adresai (curl -L -o /dev/null -w "%{http_code}"):

    /suprask/                                   200
    /suprask/content/lt/grade-01/index.json     200
    /suprask/content/lt/grades.json             200

Pastaba: be `-L` šaknis grąžina 301 (į `/suprask/`) — tai GitHub Pages
kanoninis peradresavimas, ne defektas.

## 2. Matomumas

    $ .venv/bin/python scripts/check_view.py --viewports desktop,phone,small
    Plotai: desktop 1440px, phone 390px, small 360px
    Patikrinta: 186 (maršrutų: 62 · plotų: 3) · problemos: 0

    $ .venv/bin/python scripts/check_view.py --viewports small --text-scale 200
    (prieš taisymą, gyva svetainė)
    Tekstas 200 % (WCAG 1.4.4): patikrinta 62 · problemos: 1
      ✗ technologijos/06-drabuziu-prieziura @360px: slinktis 21px; button.dp-bin „Į spalvotus“ +21px

    (po taisymo, vietinis serveris 8941)
    Tekstas 200 % (WCAG 1.4.4): patikrinta 62 · problemos: 0
      ✔ Tekstas telpa ir 200 % dydžiu.

Desktop + phone @ 200 % (124 patikros) — 0 problemų ir prieš, ir po; defektas
buvo tik 360 px.

## 3. Vienintelis defektas — ištaisytas

Failas: `assets/js/sims/technologijos.js:1090–1101` (`.dp-bins`, `.dp-bin`).
Modulis: `technologijos/06-drabuziu-prieziura`, mygtukai „Į baltus“ / „Į spalvotus“.

Priežastis (LL-41 / LL-55 šeima): `.dp-bin` turėjo `flex: 1 1 0` be `min-width: 0`,
todėl flex minimumas liko `min-content`, o jį lėmė ilgiausias žodis. Prie 32 px
šaknies „spalvotus“ yra 139 px, mygtukas išsipūtė iki 196,5 px, dviejų mygtukų
suma 352 px > 301,2 px scenos → puslapio slinktis 381/360.

Matavimas (Playwright, 360×780, 32 px šaknis):

    PRIEŠ:      doc scrollW 381 / innerW 360; .dp-bin 139,6 + 196,5; min-width auto
    min-width:0 vienas: doc 360 / 360, BET „Į spalvotus“ lūžta į 3 eilutes (142,6 px)
    PO taisymo: doc 360 / 360; .dp-bin 301,2 × 75,2; žodis 1 eilutėje; klaidos []

Todėl `min-width: 0` vienas būtų buvęs neteisingas taisymas — jis pašalina slinktį
laužydamas žodį viduryje (LL-55). Pakeista:

    .dp-bins { display:flex; flex-wrap:wrap; gap:.5rem; width:100%; }
    .dp-bin  { flex:1 1 6rem; min-width:0; ... }

16 px (numatytasis) išlieka no-op — išmatuota A/B tame pačiame puslapyje
(įterpus atgal `min-width:auto`):

    @360 16px  PO [147, 147]  PRIEŠ [147, 147]  binsScrollW 301/301  doc 360/360
    @390 16px  PO [104.8, 104.8]  PRIEŠ [104.8, 104.8]  doc 390/390
    @320 16px  PO [128.4, 128.4]  PRIEŠ [128.4, 128.4]  doc 320/320

Veiksmas nepažeistas (paspaudimas, 16 px ir 200 %):

    16px: picked=1 readout='Balti marškiniai — spalvotuose.' note='Liko dar 3 drabužiai.' btnH=[56,56]
    32px: picked=1 readout='Balti marškiniai — spalvotuose.' note='Liko dar 3 drabužiai.' btnH=[75.2,75.2]
    klaidų 0 abiem atvejais

Mygtukai prie 200 % lieka 75,2 px aukščio (≥ 48 px, T5.5).

## 4. Registro sankryža (ko vartai nemato)

`index.json` ↔ modulio JSON laukai (title/subtitle/minutes), id ↔ failo vardas,
strand ↔ kryptis — 62 moduliai × 3 laukai:

    index įrašų: 62; laukų nesutapimų: 0; id/strand problemų: 0

Tai tas pats latentinis #16892, kuris šiandien nesuveikė: 186 palyginimai, 0 nesutapimų.

## 5. Issue

- **#2 (našlaitiniai mp3) — komentuota, siūlau uždaryti.** Atvirkštinė patikra
  įrankyje yra (`scripts/check_audio.py:110`), įrodyta neigiamu zondur:
  nukopijavus mp3 kaip `n/zzz-zondas463.mp3` → „naudojama 1766 iš 1767 mp3 /
  ĮSPĖJIMAS: 1 našlaičių — n/zzz-zondas463.mp3“; failas pašalintas, diske vėl 1766.
  Duomenyse našlaičių 0.
- Naujo issue nekūriau: vienintelis defektas buvo techninis ir ištaisytas čia pat,
  su matavimu ir žurnalo įrašu (vaidmens taisyklė „netaisyti tyliai“).

## 6. Pasiūlymas

`agents/proposals/2026-11-23-tikrintojas-200-luzes-zodis.json` (struktura/normal,
target `scripts/check_view.py`): `--text-scale` matuoja puslapio slinktį, bet ne
tai, ar žodis liko sveikas. Šiandieninis atvejis tai įrodo: su `min-width:0` vienu
slinktis būtų 0, o žodis — per tris eilutes.

## 7. Pamokos

Naujos nepridėjau. Defektas priklauso LL-41 (flex/tinklelio minimumas) ir LL-55
(„documentElement.scrollWidth tampa 0, o matuoklis rodo žalia“) šeimai — abi jau
aprašytos su ta pačia taisykle, kurią šiandien pritaikiau.

## 8. Kas liko

- Taisymas yra **repo**, ne gyvas: `assets/js/sims/technologijos.js` bus gyvas po
  bėgiklio publikavimo. Iki tol gyva svetainė 360 px @ 200 % vis dar rodo 21 px
  slinktį (matuota aukščiau). Po deploy pakartoti:
  `check_view.py --viewports small --text-scale 200` → turi būti 0.
- #32798 (48 px taikiniai prie 200 %) neištirtas iki galo: šiandien išmatuoti tik
  šio modulio mygtukai (75,2 px), ne visa platforma.
- 320 px @ 200 % (`--viewports tiny`) nematuota — biudžetas.

## 9. Neliesta

`content/**`, `docs/**`, `AGENTS.md`, `scripts/**`, kiti sim failai, `agents/state.json`
(įrašytas `last_validation`). Pakeisti 3 failai: `assets/js/sims/technologijos.js`
(3 eilutės), šis žurnalas, pasiūlymo JSON.
