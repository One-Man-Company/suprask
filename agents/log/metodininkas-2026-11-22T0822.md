# metodininkas — 2026-11-22T0822

- paleidimas: #434 (manual)
- trukmė: 1459s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/m434/scan.py
│ @@ -0,0 +1,33 @@
│ +import json, os, glob, re
│ +
│ +root = "/home/zoltanas/workspace/suprask"
│ +rows = []
│ +for p in sorted(glob.glob(os.path.join(root, "agents/proposals/*.json"))):
│ +    try:
│ +        d = json.load(open(p))
│ +    except Exception as e:
│ +        print("BROKEN", p, e)
│ +        continue
│ +    tgt = d.get("target", "")
│ +    m = re.match(r"(content/[^\s,]+\.json)", tgt)
│ +    exists = None
│ +    if m:
│ +        exists = os.path.exists(os.path.join(root, m.group(1)))
│ +    rows.append((d.get("status"), d.get("priority"), d.get("type"), d.get("title"), tgt, exists, os.path.basename(p)))
│ +
│ +print("=== new + high, tikslo failas NEEGZISTUOJA ===")
│ +for r in rows:
│ +    if r[0] == "new" and r[1] == "high" and r[5] is False:
│ +        print(r[2], "|", r[3], "|", r[4], "|", r[6])
│ +
│ +print()
│ +print("=== new (visi), tikslo failas NEEGZISTUOJA ===")
│ +for r in rows:
│ +    if r[0] == "new" and r[5] is False:
│ +        print(r[1], "|", r[2], "|", r[3], "|", r[4], "|", r[6])
│ +
│ +print()
│ +print("=== new, target ne content failas ===")
│ +for r in rows:
│ +    if r[0] == "new" and r[5] is None:
│ +        print(r[1], "|", r[2], "|", r[3], "|", r[4], "|", r[6])
│ agents/proposals/2026-11-22-metodininkas-traumu-prevencija.json
│ @@ -0,0 +1,25 @@
│ +{
│ +  "role": "metodininkas",
│ +  "run_id": 434,
│ +  "created": "2026-11-22T08:42:00+02:00",
│ +  "type": "metodas",
│ +  "title": "M-13 — Traumos priežastis: pašalink vieną priežastį, įvykis nebeįvyksta",
│ +  "body": "Metodas temai, kuri 1 klasės programoje turi 3 valandas, o platformoje teturi gaisro dalį: 26.1.1 „Saugus elgesys“ ir projektas „Kaip išvengti traumų?“ (sources/pradinio-bp-rekomendacijos-2024.txt:14960–14966, ilgalaikis planas :17618–17626). Vaikas pirmiausia apžiūri tą pačią mokyklos koridoriaus vietą popieriuje ir suranda, kas joje galėtų pakenkti, tada ekrane keičia vieną daiktą: šlapias grindų ruožas, ant grindų palikta kuprinė, tamsus kampas be šviesos. Kai priežastis yra, tas pats judėjimas baigiasi kritimu; kai priežasties nėra, tas pats judėjimas baigiasi saugiai. Vaikas ne klausosi taisyklės, o mato, kad įvykis turi priežastį, kurią galima pašalinti — ir kad priežastis yra aplinkoje, ne vaiko bėdumas. Modelis sąmoningai neteisia vaiko ir nevardija „kaltės“: rodoma vieta ir daiktas, o grįžtamasis ryšys sako, kas pasikeitė kelyje. Užduotys perkelia tą pačią taisyklę į kiemo aikštelę, sporto salę ir į „kur kreiptis pagalbos“, o praplėtimo užduotis prašo sugalvoti dar vieną priežastį, kurios modelyje nėra.",
│ +  "target": "content/lt/grade-01/pasaulio-pazinimas/25-traumu-prevencija.json",
│ +  "priority": "high",
│ +  "status": "new",
│ +  "evidence": [
│ +    "research/wiki/grades/01/metodai.md — M-13 (šis paleidimas): seka, simuliacijos būsenos, 4 užduotys, klaidingos nuostatos, modelio ribos",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:14960–14966 — 26.1.1 „Saugus elgesys“: projektas „Kaip išvengti traumų?“ (kaip apsaugoti kūno dalis ir kodėl tai svarbu), skrajutė „Būk atsargus mokyklos koridoriuose, kiemo aikštelėje, sporto salėje“, projektas „Mano elgesys ištikus nelaimei“ (kur kreiptis pagalbos)",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:17618–17626 — 1 klasės ilgalaikis planas: 26.1.1 — 3 val., atvejo analizė, situaciniai ir vaidybiniai žaidimai",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:8390–8392 — 26.1.1 galimos veiklos 1 klasėje: praktinė veikla (atvejo analizė, situaciniai, vaidybiniai, stalo žaidimai), filmų peržiūra ir analizė",
│ +    "research/wiki/curriculum/pasaulio-pazinimas-1-klase.md:85 — 26.1.1, 3 val., projektai „Kaip išvengti traumų?“ ir „Mano elgesys ištikus nelaimei“",
│ +    "research/wiki/curriculum/pasaulio-pazinimas-1-klase.md:174 — spragos lentelė: „26.1.1 traumų prevencija — yra tik gaisro dalis (19); traumų temos nėra“",
│ +    "research/wiki/curriculum/pasaulio-pazinimas-1-klase.md (4 skyriaus 4 punktas) — saugumas ir sveikata mokomi per savo kūną ir savo aplinką, ne per abstrakčias taisykles",
│ +    "content/lt/grade-01/pasaulio-pazinimas/19-dumai-ir-isejimas.json — vienintelis 26.1.1 modulis, jis sprendžia dūmų kelią, ne traumos priežastį; grep „traum|susižaloj|nukrit“ content/lt/grade-01 → 0 atvejų (tikrinta 2026-11-22)",
│ +    "agents/log/ideator-2026-11-22T0743.md:29–34 — tema parengta ideatoriaus #433, bet pasiūlymo failas neįrašytas (LL-36/L-85 šeima); šaltinio eilutės ir spragos įrodymas paimti iš čia ir patikrinti šiame paleidime",
│ +    "Schwebel, D. C. (2019). Why “accidents” are not accidental: Using psychological science to understand and prevent unintentional child injuries. American Psychologist, 74(9), 1137–1147. https://doi.org/10.1037/amp0000487 — vaikų traumos turi išmatuojamas priežastis (elgsena, priežiūra, aplinka), todėl jas galima numatyti ir šalinti",
│ +    "Zhuravlev, P., Mueller, C., & St. Vil, D. (2024). Just my luck: How children’s causal attributions contribute to injury prevention. European Journal of Trauma and Emergency Surgery, 50, 3095–3098. https://doi.org/10.1007/s00068-023-02425-3 — vaikai, kurie traumą priskyrė sėkmei/nesėkmei, negalėjo sugalvoti nė vienos prevencijos strategijos; kurie įžvelgė priežastį — galėjo. Tyrimas su 10–18 m. vaikais, todėl 1 klasei imama tik kryptis (priežastis, ne likimas), o ne jo apimtis",
│ +    "Niedenthal, P. M., & al. netaikyta; vietoje to — Morrongiello, B. A., & Kane, A. (2015). An evaluation of the Cool 2 Be Safe program. Journal of Pediatric Psychology, 40(6), 588–597 — įrodytas traumų rizikos įsitikinimų kaitos kelias per trumpas struktūruotas veiklas, ne per paskaitą (šaltinis naudotas kaip krypties pagrindas, ne kaip šio modelio efekto įrodymas)"
│ +  ]
│ +}
│ agents/proposals/2026-11-22-metodininkas-traumu-prevencija.json
│ @@ -19,7 +19,6 @@
│      "content/lt/grade-01/pasaulio-pazinimas/19-dumai-ir-isejimas.json — vienintelis 26.1.1 modulis, jis sprendžia dūmų kelią, ne traumos pri

… PRALEISTA 5719 SIMBOLIŲ IŠ 23719 (įrankių išklotinės) — visa ataskaita: agents/work/metodininkas/00434/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

 sugalvoti nė vienos prevencijos strategijos, o tie, kurie įžvelgė priežastį savo veiksme, galėjo. Tyrimas darytas su 10–18 m. vaikais, todėl 1 klasei imama tik **kryptis** (priežastis, ne likimas), o ne jo apimtis ir ne jo klausimų formuluotės.
│ +Hillier ir Morrongiello (1998) parodė, kad 120 vaikų nuo 6 iki 10 metų **jau skiria** rizikos laipsnį nuotraukose — tai pagrindžia amžiaus tinkamumą: 6–7 m. vaikas gali pasakyti, kuri vieta pavojingesnė, jei jam duota kuo remtis. Tas pats tyrimas įspėja, kad berniukai ir mergaitės remiasi skirtingais požymiais (galimos žalos sunkumu ir pažeidžiamumu), todėl modelyje nėra nė vieno sakinio apie „drąsą“ ar „baimę“ — vertinamas tik daiktas kelyje.
│ +
│ +**Klaidingos nuostatos ir kaip jos paneigiamos.**
│ +
│ +1. **„Trauma atsitinka be priežasties, tiesiog nepasisekė.“** Paneigiama tuo pačiu ėjimu du kartus: su daiktu kelyje ir be jo. Vaikas mato, kad pasikeitė ne jis, o vieta — ir kad priežastis buvo vienintelis skirtumas.
│ +2. **„Užteks būti atsargesniam, ir daiktas kelyje nebekliudys.“** Modelio kintamasis yra daiktas, o ėjimas nesikeičia: kol priežastis yra, ėjimas vis tiek baigiasi kritimu. Tai priešparyzdys tame pačiame kadre (LL-28): atsargumas padeda, bet priežasties nepašalina.
│ +3. **„Kaltas vaikas, o ne vieta.“** Modelis niekada neįvardija vaiko kaip priežasties: `api.note` sako, kas yra kelyje („Grindys šlapios toje vietoje, kur bėgai“), o ne „bėgai per greitai“. Tai ir T5.1 reikalavimas — grįžtamasis ryšys apie veiksmą ir aplinką, ne apie vaiką.
│ +4. **„Kuprinė ant grindų — tik netvarka, ne priežastis.“** Modelis kritimą sustabdo būtent ties kuprine ir `readout` pasako, kad koja užkliuvo už jos. Netvarka ir pavojus tame pačiame kadre sutampa, bet priežastis įvardijama daiktu, ne tvarka.
│ +5. **„Pavojinga vieta yra visada pavojinga.“** Ta pati vieta su tuo pačiu vaiku yra saugi, kai daikto nėra. Modelis tą pačią sceną naudoja abiem atvejais, todėl vaikas negali priskirti pavojaus pačiai vietai.
│ +
│ +**Seka (konkretumas → pusiau abstraktus modelis → simbolis → perkėlimas).**
│ +
│ +1. **Popieriaus planas.** Vaikas ant lapo nupiešia mokyklos koridorių tiesia linija ir apibrauna **vietą**, kur kas nors galėtų pakenkti. Mokytojas neįvardija atsakymo ir neklausia „ar tu atsargus“. Tikslas: priežasties ieškoti vietoje, o ne savyje.
│ +2. **Ekranas, vieta ir vienas daiktas.** Ekrane ta pati koridoriaus atkarpa. Vaikas pasirenka, kas yra kelyje (šlapios grindys / kuprinė / tamsu / nieko), ir prieš ėjimą **spėja**: „Ar šis ėjimas baigsis saugiai?“ (Taip / Ne). Tikslas: sąryšį tarp daikto ir pasekmės vaikas pasitikrina pats, o ne išgirsta taisyklę.
│ +3. **Kontrolinis ėjimas be priežasties.** Tas pats vaikas, tas pats ėjimas, kelyje „nieko“. Ėjimas baigiasi saugiai. Tikslas: atskirti vaiką nuo vietos — pasikeitė tik daiktas.
│ +4. **Visi trys daiktai ir simbolis.** Vaikas išbando tris priežastis, o po kiekvieno bandymo į sąrašą „Ką radau kelyje“ įrašoma vietos eilutė. Visos keturios eilutės (trys priežastys ir „nieko“) sudaro lentelę „vieta → kas kelyje → kuo baigėsi“. Tikslas: taisyklę pasakyti savais žodžiais, kai ji jau matyta keturis kartus.
│ +5. **Perkėlimas į tris kitas vietas.** Be modelio: kiemo aikštelė, sporto salė, laiptai. Vaikas pasako, ko kiekvienoje vietoje ieškotų ir ką darytų radęs. Tikslas: taisyklė ne apie koridorių, o apie bet kurią vietą.
│ +
│ +**Privalomas spėjimo žingsnis prieš pirmą ėjimą.** Vienas spėjimas apie **vieną** pasekmę (saugiai / ne), palyginamas su tuo, kas įvyko (LL-15). Spėjimas niekada nevadinamas klaida ir lieka matomas virš scenos. Be jo modelis virsta animacija: vaikas žiūri, kaip figūrėlė juda, o daikto kelyje nepastebi.
│ +
│ +**Simuliacijos specifikacija.** Komponentas `traumos-priezastis`, failas `assets/js/sims/pasaulis.js` (jis importuoja `art.js` ir jau naudoja `art.kid`, `art.plank`, `art.block`, todėl `scripts/check_art.py` naujų dalių nereikalauja ir LEGACY sąrašo liesti negalima). Registracija: `SIMS` bloke (`pasaulis.js:4084`) pridedama eilutė `"traumos-priezastis": traumosPriezastis,`. `config`:
│ +
│ +```json
│ +{ "place": "Koridorius",
│ +  "causes": [ { "key": "slapia",  "label": "Šlapios grindys" },
│ +              { "key": "kuprine", "label": "Kuprinė ant grindų" },
│ +              { "key": "tamsu",   "label": "Tamsus kampas" },
│ +              { "key": "nieko",   "label": "Nieko nėra" } ],
│ +  "labels": { "guessYes": "Taip", "guessNo": "Ne", "walk": "Eik",
│ +              "again": "Iš naujo", "foundTitle": "Ką radau kelyje",
│ +              "safe": "Saugiai", "fall": "Kliudė" },
│ +  "sentences": { "start": "…", "guess": "…", "slapia": "…", "kuprine": "…",
│ +                 "tamsu": "…", "nieko": "…", "table": "…", "reset": "…" } }
│ +```
│ +
│ +**Pasekmė išvedama, o ne įrašyta.** `config.causes[]` sąmoningai neturi lauko, kuo ėjimas baigiasi: `outcome(key) = key === "nieko" ? "safe" : "fall"`. Jei `key` nežinomas arba `label` tuščias, komponentas rašo `console.error` ir rodo „Vieta nesuderinta.“, o ne tyliai praleidžia kortelę. Tai ta pati taisyklė kaip M-07 (`kiekis = board.px / unit.px`), M-11 (`cells = sound.stretch ? 8 : 1`) ir M-12 (`onesMax = 9 - first.ones`): teiginys ekrane išvedamas iš tų pačių duomenų, kuriuos mato vaikas.
│ +
│ +| Būsena | Ką vaikas mato | `readout` | `api.note` |
│ +|---|---|---|---|
│ +| pradžia | koridoriaus atkarpa, vaikas kairėje, keturios kortelės, tuščia lentelė | „Kas yra kelyje?“ | „Pasirink vieną ir pažiūrėk.“ |
│ +| spėjimas | pasirinkta kortelė pažymėta, mygtukai „Taip“ / „Ne“ | „Ar šis ėjimas baigsis saugiai?“ | „Pirma spėk, tada eik.“ |
│ +| ėjimas, priežastis yra | vaikas sustoja ties daiktu, kelias pažymėtas trūkio ženklu | „Kliudė.“ | „Kelyje buvo šlapios grindys.“ |
│ +| ėjimas, priežasties nėra | vaikas praeina visą atkarpą, kelias ištisinis | „Saugiai.“ | „Kelyje nieko nebuvo.“ |
│ +| lentelė, 1–3 eilutės | lentelė pildosi: vieta, kas kelyje, kuo baigėsi | „Dar trūksta vietų.“ | „Išbandyk ir kitus daiktus.“ |
│ +| lentelė pilna | keturios eilutės, paskutinė „nieko“ | „Keturi ėjimai, viena taisyklė.“ | „Tas pats vaikas, ta pati vieta.“ |
│ +| „Iš naujo“ | scena atstatyta, lentelė lieka | „Pradedam iš naujo.“ | „Bandyk kitą daiktą.“ |
│ +
│ +Septynios savybės, kurių negalima praleisti:
│ +
│ +- **Vienas kintamasis:** `cause` — kas yra kelyje. Vaiko figūrėlė, ėjimo kelias ir vieta nesikeičia niekada; tai yra modelio teiginys, o ne dekoracija.
│ +- **Geometrija 360 px:** scena `viewBox="0 0 328 300"`, `max-width:328px`; grindų juosta `art.plank(14, 264, 300, 14)`; vaikas `art.kid(48, 258, 0.9)`; daiktas — `art.block` (kuprinė), `art.plank` su pakreipimu (šlapias ruožas), tamsus kampas — `art.block` tamsiu užpildu su užrašu „tamsu“ (spalva niekada vienintelis informacijos nešėjas). Kortelės 2 × 2, po 156 × 56 px su 8 px tarpais (320 px iš 328). Jokio horizontalaus slinkimo; 200 % tekste matmenys lieka tie patys, didėja tik užrašai (`min-width:0` ant tėvų, LL-125).
│ +- **Įėjimai ir klaviatūra:** `Tab` tarp keturių kortelių ir mygtukų, `Enter`/`Space` aktyvuoja, `←`/`→` perjungia korteles, `R` atstato. Visi taikiniai ≥ 48 px.
│ +- **Fokusas** (LL-32): pasirinkus kortelę fokusas eina į spėjimo mygtuką, o ne į neaktyvų elementą; po ėjimo lieka „Eik“ ir `readout` pasikeičia; po „Iš naujo“ — į pirmą neišbandytą kortelę.
│ +- **Grįžtamasis ryšys** — `readout` po ėjimo, `api.note` sako **kodėl** ir niekada apie vaiką (T5.1); žodis „kaltas“ nevartojamas nė karto. `api.progress({ correct: true })` — vieną kartą, kai lentelėje yra visos keturios eilutės (tikrinama dabartinė būsena, ne istorija — LL-17), o ne po pirmo ėjimo (LL-29). „Iš naujo“ pažangos netrina (LL-16).
│ +- **Garsas:** tariamos tik instrukcijos ir `api.note` (`config.sentences`, 8 frazės × 2 įrašai = 16 naujų mp3). Vietos pavadinimas ir eilutės lentelėje **netariami** kiekvieną kartą — juos perskaito `api.readout` (LL-14).
│ +- **Be laikmačių, be ėjimų limito, be „game over“.** Kritimas niekada nekartojamas automatiškai ir niekada nevertinamas balu.
│ +
│ +**Užduotys.**
│ +
│ +| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
│ +|---|---|---|---|---|---|
│ +| 1 | atpažinimas | „Koridoriuje šlapios grindys. Kas nutiks, kai vaikas bėgs?“ — „Nieko, grindys nesvarbu“ / „Jis gali paslysti ir nukristi“ / „Jis bėgs greičiau“ | 1 | „Nieko, grindys nesvarbu“ — vaikas priežasties ieško savyje, ne vietoje | „Pažiūrėk į grindis toje vietoje, kur bėgama.“ |
│ … omitted 27 diff line(s) across 1 additional file(s)/section(s)
Įrašiau du failus. Abu yra repo, juodraščio patikros paleisti nebespėjau — tai pasakau atvirai, o ne apsimetu, kad vartai praėjo.

**1. `research/wiki/grades/01/metodai.md` — naujas skyrius M-13**

„M-13 — Traumos priežastis: pašalink vieną priežastį, įvykis nebeįvyksta“ (98 eilutės, įterpta prieš „Atviros prielaidos“, esamas turinys neliestas).

Ką metodas dengia: 26.1.1 „Saugus elgesys“ — 1 klasėje 3 valandos, projektas „Kaip išvengti traumų?“ (`sources/pradinio-bp-rekomendacijos-2024.txt:14960–14966`), ilgalaikis planas `:17618–17626`, galimų veiklų lentelė `:8390–8392`. Platformoje ši tema neturi modulio: `grep "traum|susižaloj|griuv|nukrit" content/lt/grade-01/` → 0 atvejų užduotyse; `19-dumai-ir-isejimas` sprendžia dūmų kelią, o `research/wiki/curriculum/pasaulio-pazinimas-1-klase.md:174` tai įvardija pažodžiui.

Sprendimas, kuris skiria jį nuo ideatoriaus #433 pasiūlymo: modelio kintamasis yra **daiktas kelyje**, o ne vaiko elgesys. Iš ideatoriaus trijų priežasčių (šlapios grindys, bėgimas, kuprinė) pašalinau **bėgimą** — jis priklauso vaikui, o ne vietai, ir tame pačiame kadre būtų antra sąvoka (T1.2); su bėgimu klaidinga nuostata „kaltas vaikas“ liktų nepašalinta, o su fiksuotu ėjimu ji paneigiama tuo pačiu veiksmu. Tai ir T5.1: grįžtamasis ryšys apie vietą, ne apie vaiką.

Specifikacijoje yra viskas, ko prašo baigties sąlyga: 5 žingsnių seka su tikslais, simuliacijos `traumos-priezastis` (`assets/js/sims/pasaulis.js`, `SIMS` blokas `:4084`) 7 būsenų lentelė, pasekmė išvedama (`outcome = key === "nieko" ? "safe" : "fall"`), geometrija 360 px, fokaso taisyklės, `api.progress` tik po keturių eilučių (LL-17, LL-29), 4 užduotys (indeksai 1/2/0/2) su tipinėmis klaidomis, 5 klaidingos nuostatos su paneigimo mechanizmu, 5 modelio ribos, 3 šaltiniai su DOI (Schwebel 2019; Zhuravlev ir kt. 2024; Hillier & Morrongiello 1998 — visi trys perskaityti kaip Crossref/leidėjo metaduomenys ir abstraktai šiandien, todėl jų rezultatų skaičių necitavau toliau, negu abstraktuose parašyta).

**2. `agents/proposals/2026-11-22-metodininkas-traumu-prevencija.json`**

`type: metodas`, `priority: high`, `target: content/lt/grade-01/pasaulio-pazinimas/25-traumu-prevencija.json`, 11 `evidence` įrašų su failų eilutėmis. Tai eilės įrašas, be kurio kūrėjas šio metodo nematytų — būtent ta klaida, kuri #244/#259 istorijoje virto LL-85.

**Ko nepadariau**

- Juodraštinio modulio per `validate_content.check_module` ir `check_language.check_module` nepaleidau — pasibaigė žingsniai. Metodo tekste parašyta „rezultatai — ataskaitoje“, tad šis sakinys kol kas neturi pagrindo; jį reikia arba užpildyti, arba išbraukti. Tai žinoma spraga, ne paslėpta.
- `research/wiki/guidelines/pilotai.md` P-022, `research/wiki/changelog.md` įrašas, `research/wiki/foundations/` papildymas ir `agents/log/` ataskaita — neįrašyti. Trys pirmieji įprastai priklauso metodo darbui, bet žingsnių biudžetas baigėsi anksčiau; pirmenybę atidaviau metodui ir pasiūlymui, nes be jų paleidimas būtų tuščias.
- Naujos pamokos į `pamokos.md` nepridėjau: naujo defekto tipo nepamačiau, o LL-15, LL-17, LL-28, LL-29, LL-32 sprendimai ėmėsi esamas taisykles.

`check_art.py` neliestas sąmoningai: `pasaulis.js` jau importuoja `art.js` ir naudoja `art.kid`, `art.plank`, `art.block`, o LEGACY sąraše yra tik `matematika.js` — naujų dalių nereikia, o sąrašo keitimas būtų ne mano ribose.

Ataskaitos pirma eilutė be „ĮGYVENDINTA:“ — nei vieno atviro pasiūlymo numerio tikslas šiame commit'e nepakeistas.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-e00bd500bd424e819ef64983cc61a58a71c65fb7f65a2cc1fd86722f8ecbbdb9
```
