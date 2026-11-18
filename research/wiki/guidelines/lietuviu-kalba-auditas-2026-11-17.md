# Lietuvių kalbos modulių auditas — 1 klasė

- **Data:** 2026-11-17
- **Apimtis:** visi 5 `content/lt/grade-01/lietuviu-kalba/*.json` moduliai + jų simuliacijos (`assets/js/sims/calba.js`).
- **Plotai:** desktop 1440 px, planšetė 1024 px, telefonas 390 px, mažas telefonas 360 px.
- **Būdai:** `check_view.py` (Brave skydų blokada), gyvas DOM zondas, `check_language.py`, `validate_content.py`, `check_audio.py`, rankinė simuliacijų eiga, klaviatūros navigacija, ARIA patikra.
- **Vykdytojas:** kalbu-redaktorius (rankinis QA, 2026-11-17).

## Santrauka

Iš 5 modulių **visi 5** turi bent vieną rimtą arba vidutinį trūkumą. Bendras vaizdas:

| Modulis | Būsena | Rimti | Vidutiniai | Smulkūs |
|---|---|---|---|---|
| 01-garsas-ir-raide | Yra rimtų | 2 | 1 | 1 |
| 02-skiemenu-jungimas | Yra rimtų | 1 | 1 | 1 |
| 03-sakinio-zodziai | Geras, su pastabomis | 0 | 1 | 1 |
| 04-kaip-zmones-sveikinasi | Yra rimtų | 2 | 1 | 1 |
| 05-plakatas-ir-informacija | Geras, su pastabomis | 0 | 1 | 0 |

**Bendri skaičiai:** 5 rimti, 5 vidutiniai, 4 smulkūs radiniai. Visi 5 moduliai praeina `validate_content.py` (0 klaidų) ir `check_view.py` (0 problemų) — tai rodo, kad techniniai vartai nemato turinio ir pedagoginių defektų.

## Ką reiškia sunkumas

- **Rimta** — vaikas supranta klaidingai, negali atlikti užduoties arba išmoksta netaisyklingos taisyklės.
- **Vidutinė** — vaikas supranta, bet lėtas skaitytojas stoja, arba prarandama dalis mokymosi vertės.
- **Smulki** — stilius, vieningumas, nedidelė klaida.

---

## 01-garsas-ir-raide

### R1. Užduotis prašo paveikslėlio, o rodomi tik žodžiai (RIMTA)

- **Failas:** `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json:98-107`
- **Klausimas:** „Kuris paveikslėlis prasideda ta pačia raide kaip „medis“?“
- **Variantai:** `mama`, `žuvis`, `obuolys` — **jokio paveikslo, jokio emoji**.
- **Kodėl tai rimta:** 6–7 metų vaikas, dar neskaitantis sklandžiai, klausime ieško paveikslėlio, bet jo nėra. Tai prieštarauja modulio idėjai (garsas vs raidė) ir pirmos klasės programai, kuri reikalauja vaizdinės atramos. Vaikas gali manyti, kad „paveikslėlis“ yra pats žodis, ir taip prarasti pasitikėjimą užduotimi.
- **Ką keisti:** kiekvieną variantą papildyti emoji arba SVG iliustracija (👩 mama, 🐟 žuvis, 🍎 obuolys); formuluotę keisti į „Kuris žodis prasideda ta pačia raide kaip „medis“?“, jei paveikslėlių nebus. Geriausia — abu: paveikslėlis + žodis.

### R2. Simuliacijos pabaigos klausimas neįmanomas (RIMTA)

- **Failas:** `content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json:23-93`; `assets/js/sims/calba.js:76-80`
- **Kodas:** `finish()` rodo „Dabar pasakyk: kurie du žodžiai prasideda ta pačia raide?“
- **Faktas:** visi 6 žodžiai prasideda skirtingomis raidėmis: K (katė), S (saulė), M (medis), O (obuolys), Ž (žuvis), N (namas). **Nė viena pora nesutampa.**
- **Kodėl tai rimta:** vaikas ieško atsakymo, kurio nėra. Tai moko, kad užduotis gali būti neįveikiama, ir mažina pasitikėjimą.
- **Ką keisti:** arba pakeisti pabaigos klausimą į „Kurį žodį įsiminei geriausiai?“, arba įtraukti į sąrašą porą su ta pačia pradžios raide (pvz., „medis“ ir „mama“ abu prasideda M) ir klausti apie juos.

### V1. „Niekou“ — netaisyklinga rašyba (VIDUTINĖ)

- **Failas:** `01-garsas-ir-raide.json:122` (`tasks[1].options[0]`; audito metu eilutė buvo 111 — failas per tą laiką išaugo R1 taisymu)
- **Tekstas:** „Niekou — tai tas pats“
- **Ką keisti:** „Niekuo — tai tas pats“. Šis radinys jau buvo užfiksuotas 2026-11-08 audite (#27), bet tekstas vis dar yra faile.
- **Užtaisyta #362 (2026-11-18, pasiūlymas #20852):** variantas dabar skaitomas „Niekuo — tai tas pats“. Zondas 390 ir 360 px (`probe_20852.py`) — 24/24: puslapyje nėra „Niekou“, variantas telpa (0 nusikirpimo), 48 px aukščio, po klaidos rodoma užuomina „Pagalvok, ką darai su ausimis, o ką su akimis.“, po teisingo — „Teisingai! Garsas yra tai, ką girdime…“.

### S1. Užduoties Nr. 2 formuluotė „Niekou“ (SMRULKI)

Ta pati klaida kaip V1.

---

## 02-skiemenu-jungimas

### R3. „Mokykla“ skaidoma netaisyklingai (RIMTA)

- **Failas:** `content/lt/grade-01/lietuviu-kalba/02-skiemenu-jungimas.json:64-70`
- **Dabartinis skaidymas:** `["mo", "kyk", "la"]`
- **Teisingas skaidymas:** `["mo", "ky", "kla"]`
- **Kodėl tai rimta:** modulio tikslas — išmokyti skiemenavimo. Vaikas girdi „kyk“ kaip atskirą skiemenį ir išmoksta klaidingos taisyklės. Pagal lietuvių kalbos skiemenavimą dviejų priebalsių junginys su sonantu (kl) eina prie kito balsio: mo-ky-kla. Tai vienintelis toks žodis modulyje, bet jo pakanka, kad sugriautų modulio tikslą.
- **Ką keisti:** `["mo", "ky", "kla"]`. Patikrinti ir kitus žodžius: „obuolys“ = o-buo-lys (teisinga), „pilis“ = pi-lis (teisinga), „saulė“ = sau-lė (teisinga).

### V2. Užduotis „pi lis“ gali klaidinti (VIDUTINĖ)

- **Failas:** `02-skiemenu-jungimas.json:87-95`
- **Klausimas:** „Kuris užrašas yra vienas žodis „pilis“?“
- **Variantai:** „pi lis“, „p i l i s“, „pilis“. Teisingas — „pilis“.
- **Kodėl tai vidutinė:** „pi lis“ yra teisingas to paties žodžio skiemenavimas. Vaikas, kuris ką tik mokėsi skiemenų, gali manyti, kad „pi lis“ irgi yra žodis. Užduotis skirta tarpams, o ne skiemenavimui, todėl formuluotė turėtų tai pasakyti aiškiau.
- **Ką keisti:** „Kuris užrašas parašytas kaip vienas žodis be tarpų?“ arba paaiškinime pridėti „Tarpai rodo pauzes, o žodis rašomas vientisai“.

### S2. Pirmos užduoties pavadinimas „Kiek skiemenų žodyje „saulė“?“ (SMRULKI)

Viskas teisinga. Užduotis gera, atsakymas „Du“, hintas „Suplok: sau-lė. Kiek kartų delnai susitiko?“ — geras.

---

## 03-sakinio-zodziai

### V3. „Kita tvarka“ mygtukas nėra integruotas į simuliacijos eigą (VIDUTINĖ)

- **Failas:** `assets/js/sims/calba.js:437-449`
- **Kas vyksta:** paspaudus „Kita tvarka“, simuliacija persirikiuoja žodžius ir pradeda iš naujo. Tai veikia, bet vaikas turi vėl rasti veikėją ir veiksmą. Jei jis to nepadarys, gali manyti, kad tvarka pakeitė atsakymą.
- **Kodėl tai vidutinė:** modulio idėja — „žodį randi pagal klausimą, o ne pagal vietą“. Perstatymas turėtų būti įrodymas, kad atsakymai nesikeičia, o ne papildoma užduotis.
- **Ką keisti:** po perstatymo automatiškai parodyti tuos pačius klausimus ir tuos pačius atsakymus (be vaiko pasirinkimo), o vaikui leisti tik stebėti. Alternatyva: pridėti trumpą paaiškinimą „Žodžiai persirikiavo. Klausimai tie patys, atsakymai tie patys. Pabandyk dar kartą.“ — tai jau yra, bet trūksta, kad simuliacija parodytų, jog atsakymas tas pats.

### S3. Simuliacijos tekstas „Ir jam galima užduoti klausimą“ (SMRULKI)

- **Failas:** `calba.js:406-408`
- **Tekstas:** „Liko žodis „pieną“. Ir jam galima užduoti klausimą.“
- **Ką keisti:** „Liko žodis „pieną“. Jam galima užduoti klausimą.“ (be „Ir“) — sklandžiau.

### Kas veikia gerai

- Užduotys Nr. 1–3 tikrina supratimą, ne įsimintą formuluotę.
- Užduotyje Nr. 3 yra sakinys, kuriame veikėjas ne pirmas („Knygą berniukas skaito“) — tai puikus perkėlimas.
- Simuliacija turi „Kita tvarka“ mygtuką ir aiškiai rodo, kad žodžių tvarka nesikeičia.
- Visi 4 sakiniai turi `variant_order`, `ask_cas`, `ask_veikia`.

---

## 04-kaip-zmones-sveikinasi

### R4. Simuliacija pati padaro išvadą, kuri prieštarauja modulio idėjai (RIMTA)

- **Failas:** `assets/js/sims/calba.js:544-552` (`conclusion()`)
- **Kas vyksta:** po pirmo žmogaus simuliacija rodo „Visi sveikinasi žodžiu.“ Tai yra būtent ta klaidinga išvada, kurią modulis turi paneigti („vienas pastebėjimas dar nėra išvada“).
- **Kodėl tai rimta:** vaikas nemokomas daryti išvados pats. Jis spaudžia „Sekantis žmogus“ ir stebi, kaip tekstas keičiasi. Tai demonstracija, ne tyrimas. Be to, „Visi…“ po vieno žmogaus yra tiesiog neteisinga.
- **Ką keisti:**
  1. Po vieno pastebėjimo rodyti „Kol kas žinai tik apie vieną žmogų. Nepadaryk išvados apie visus.“
  2. „Visi sutikti žmonės…“ vietoje „Visi…“ (nes „visi“ gali reikšti visus pasaulio žmones).
  3. Reikalauti, kad vaikas pats pasirinktų išvadą iš variantų (pvz., „Visi…“, „Daugiausia…“, „Dar neaišku“), o simuliacija patikrintų, ar ji atitinka duomenis.

### R5. „Mano išvada“ mygtukas neveikia taip, kaip atrodo (RIMTA)

- **Failas:** `assets/js/sims/calba.js:634-646`
- **Kas vyksta:** vaikas spaudžia „Mano išvada“, ir simuliacija įrašo **automatiškai sugeneruotą** išvadą kaip vaiko išvadą. Vaikas nieko neparašo ir nepasirenka.
- **Kodėl tai rimta:** tai klaidinantis grįžtamasis ryšys. Vaikas mano, kad padarė išvadą, o iš tikrųjų ją padarė simuliacija.
- **Ką keisti:** „Mano išvada“ turėtų atidaryti pasirinkimų sąrašą („Visi…“, „Daugiausia…“, „Dar neaišku“) ir leisti vaikui pasirinkti. Tik tada simuliacija palygintų su duomenimis.

### V4. Garso įrašas taria veiksmą, o ne pasveikinimą (VIDUTINĖ)

- **Failas:** `content/lt/grade-01/lietuviu-kalba/04-kaip-zmones-sveikinasi.json:51-60`; `calba.js:616`
- **Kas vyksta:** kai žmogus linkteli, `label` yra „Linktelėjo“, ir simuliacija groja „Linktelėjo“. Vaikas girdi veiksmo pavadinimą, o ne pasveikinimą.
- **Ką keisti:** atskirti `label` (ką vaikas mato) nuo `say` (ką vaikas girdi). Linktelėjimo atveju galėtų groti tylos garsą arba „Linktelėjo“ su paaiškinimu, kad tai ne žodinis sveikinimas.

### S4. Pirmos išvados rodymas (SMRULKI)

- **Failas:** `calba.js:561-567`
- **Tekstas:** „Pirma išvada (pastebėjimų: 1): „Visi sveikinasi žodžiu.““
- **Ką keisti:** „Pirma išvada (po 1 pastebėjimo): „Visi sveikinasi žodžiu.““ — gramatiškai taisyklingiau.

### Kas veikia gerai

- Simuliacijos duomenys fiksuoti (8 žmonės, 5 žodis, 2 linkt, 1 mostas) — tyrimas atkuriamas.
- Trečias žmogus tyčia sveikinasi kitaip — tai geras prieštaraujantis atvejis.
- „Pirma išvada“ ir „Dabar“ palyginimas rodo, kaip išvada keičiasi.
- Užduotys Nr. 1–4 gerai perkelia taisyklę į naujas situacijas.

---

## 05-plakatas-ir-informacija

### V5. Pusė neteisingų pasirinkimų neturi savo paaiškinimo (VIDUTINĖ)

- **Failas:** `content/lt/grade-01/lietuviu-kalba/05-plakatas-ir-informacija.json:62-96`
- **Kas vyksta:** kiekvienas klausimas turi `miss` žemėlapį, bet jis padengia tik dalį zonų. Pvz.:
  - Q2 „Kiek atšvaitų turi berniukas?“ → `miss` turi tik `uzrasas-atsvaitas`. Paspaudus `uzrasas-dviratis` arba `uzrasas-gatva`, rodoma bendra frazė „Ši plakato dalis į klausimą neatsako.“
  - Q3 „Kurioje dviračio pusėje yra baltas žibintas?“ → `miss` turi tik `uzrasas-dviratis`. Paspaudus `uzrasas-gatva` arba `piesinys-atsvaitas`, rodoma bendra frazė.
- **Kodėl tai vidutinė:** modulio tikslas — mokyti ieškoti informacijos. Bendra frazė „neatsako“ nemoko, kodėl būtent ši dalis netinka. Vaikas negauna grįžtamojo ryšio apie savo klaidą.
- **Ką keisti:** kiekvienam klausimui pridėti `miss` įrašus visoms kitoms zonoms (bent jau toms, kurios matomos tame pačiame ekrane). Pvz., Q2 `uzrasas-dviratis`: „Šis užrašas kalba apie dviračio pusę, o ne apie atšvaitų skaičių.“; Q2 `uzrasas-gatva`: „Šis užrašas kalba apie ėjimą per gatvę, ne apie atšvaitus.“

### Kas veikia gerai

- Plakatas turi 5 zonas (2 piešiniai, 3 užrašai) — tikras informacijos šaltinis.
- SVG piešiniai turi `aria-label` ir `alt` tekstus.
- „Slėpti piešinius“ mygtukas — puikus modelio parametras, leidžiantis vaikui pajusti, kad piešinys neša informaciją.
- Užduotys Nr. 1–4 perkelia taisyklę į kitus plakatus (rankų plovimas, rūšiavimas, gesintuvas).
- Skaitliukas „Užraše rasta / piešinyje rasta“ rodo, kur informacija buvo rasta, o ne taškus.

---

## Sisteminės pastabos

### 1. Techniniai vartai nemato turinio defektų

Visi 5 moduliai praeina:
- `validate_content.py --grade 1` → 0 klaidų
- `check_language.py --grade 1` → 0 klaidų (5 įspėjimai, 28 pastabos)
- `check_view.py` desktop/tablet/phone/small → 0 problemų
- `check_audio.py` → visi tekstai turi garso įrašus

Tačiau randama 5 rimti ir 5 vidutiniai defektai. Tai reiškia, kad:
- `check_language.py` netikrina, ar užduotis atitinka vaizdinį kontekstą (R1), ar skiemenavimas teisingas (R3), ar simuliacijos išvada atitinka modulio idėją (R4).
- `check_view.py` matuoja tik geometriją, ne pedagoginę prasmę.
- `validate_content.py` tikrina schemą, ne turinį.

**Siūloma:** pridėti į `check_audio.py` arba atskirą `check_sim.py` patikrą, kuri tikrina:
- ar `sim.config` tekstai atitinka `tasks` tekstus (pvz., ar pabaigos klausimas įmanomas su duotais duomenimis);
- ar skiemenavimas atitinka lietuvių kalbos taisykles (bent jau `syllables` ilgis ir balsių skaičius);
- ar simuliacijos `conclusion()` / `finish()` tekstai neprieštarauja modulio `outcomes`.

### 2. Užduočių variantai neturi vaizdų

Visi 5 moduliai naudoja tik tekstinius variantus. Pirmos klasės vaikui tai per abstraktu. Rekomenduojama:
- kiekvienam `.choice` leisti ne tik tekstą, bet ir `emoji` arba `image` lauką;
- `app.js` `mountTasks()` turėtų atvaizduoti emoji/SVG prieš tekstą;
- `KURINIO-STANDARTAS.md` papildyti: „1–2 klasėje bent viena užduotis turi turėti vaizdinį variantą“.

### 3. `sim.config` tekstai nėra tikrinami `check_language.py`

`check_language.py` tikrina `concept`, `reflect`, `tasks`, `outcomes`, bet ne `sim.config`. Todėl simuliacijų tekstai (pvz., „Visi sveikinasi žodžiu.“) gali būti netaisyklingi arba per ilgi. Siūloma įtraukti `sim.config` į `check_language.py` (bent jau `api.speak` ir `api.note` tekstus).

### 4. `04-kaip-zmones-sveikinasi` simuliacija yra demonstracija, ne tyrimas

Tai atskiras sisteminis klausimas: ar simuliacija turi leisti vaikui daryti išvadą, ar tik stebėti? Gairės (P2) sako „veiksmas prieš paaiškinimą“, bet čia vaikas tik stebi. Siūloma peržiūrėti visų simuliacijų `api.progress()` ir `finish()` logiką: ar jos tikrina, ką vaikas padarė, ar tik ką jis pamatė.

---

## Prioritetai

1. **R3 (02-skiemenu-jungimas)** — netaisyklingas skiemenavimas. Tai vienintelis dalykas, kuris moko klaidingos taisyklės. Taisyti pirmiausia.
2. **R4/R5 (04-kaip-zmones-sveikinasi)** — simuliacija prieštarauja modulio idėjai. Tai rimčiausias pedagoginis defektas.
3. **R1 (01-garsas-ir-raide)** — užduotis be paveikslėlio. Tai rimtas amžiaus tinkamumo pažeidimas.
4. **R2 (01-garsas-ir-raide)** — neįmanomas pabaigos klausimas. Tai akivaizdus klaidos signalas.
5. **V5 (05-plakatas-ir-informacija)** — nepilnos užuominos. Tai mažina mokymosi vertę, bet ne moko klaidingai.
6. **V4 (04-kaip-zmones-sveikinasi)** — garso įrašas taria veiksmą. Tai painioja, bet ne moko klaidingai.
7. **V1/V2/S1/S2/S3/S4** — smulkūs kalbos ir formuluočių pataisymai.

## Susieti pasiūlymai

Visi radiniai pateikti `agents/proposals/2026-11-17-kalbu-redaktorius-*.json`:

- `01-paveiklelis-be-paveikslo.json` (R1)
- `01-sim-pabaiga-neimanoma.json` (R2)
- `02-skiemenu-jungimas-mokykla.json` (R3)
- `04-isvada-uz-vaika.json` (R4/R5)
- `05-plakatas-nepilnos-uzuominos.json` (V5)
- `01-niekou-rasyba.json` (V1)
- `04-sveikinimo-garsas.json` (V4)

## Ką šis auditas NEliečia

- `teacher.*` tekstai — suaugusiojo tekstas, ne vaikui.
- `sources`, `svietimas1` — ne vaikui skaitomi.
- Programos atitiktis (D.3.3.1–D.3.3.4 ir kt.) — programos-derintojo sritis.
- Simuliacijų logika už `calba.js` ribų — simuliacijų inžinieriaus sritis.
- Kitų dalykų moduliai — atskiras auditas.

---

*Auditas atliktas rankiniu būdu, naudojant gyvą svetainę, DOM zondus ir validatorius. Visi skaičiai ir citatos patikrinti 2026-11-17.*
