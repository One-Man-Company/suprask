# Pamokos (lessons learned)

Kiekviena pamoka — iš **realaus defekto**, ne iš teorijos. Formatas fiksuotas, kad agentas galėtų
ją pritaikyti ir patikrinti:

- **Simptomas** — ką pamatė vaikas ar mokytojas.
- **Priežastis** — kas konkrečiai buvo ne taip.
- **Taisyklė** — ką daryti visada.
- **Patikra** — kokia komanda ar validatorius tai pagauna.

Naują pamoką **prideda** tas, kas rado defektą; senos netrinamos ir neperrašomos.

---

## LL-01 — Trūkstamas kiekis užduoties sąlygoje

- **Simptomas:** „Tortas padalintas į 8 dalis. Kiek dalių kiekvienam?“ — neįmanoma atsakyti, nes nepasakyta, kiek vaikų.
- **Priežastis:** sąlygoje buvo vienas skaičius, o sprendimui reikia dviejų. Autorius turėjo galvoje 2 vaikus, bet to neparašė.
- **Taisyklė:** jei užduotis dalija, lygina ar daugina — **visi dydžiai turi būti sąlygoje**. Skaičių skaičius sąlygoje = skaičių skaičius sprendime.
- **Patikra:** `check_language.py` ieško dalybos veiksmažodžių („padalinta“, „dalijasi“, „kiekvienam“) be antro skaičiaus; žmogus peržiūri įspėjimus.

## LL-02 — Nepasakytas posūkio dydis

- **Simptomas:** „Jis pasisuka į kairę. Į kurią pusę dabar žiūri?“ — galimi keli atsakymai (90°? 180°?).
- **Priežastis:** erdvinėse užduotyse posūkis gali būti bet kokio dydžio, o atsakymas numatė 90°.
- **Taisyklė:** erdvinėje užduotyje nurodyk **posūkio dydį** („per ketvirtį rato“) arba **kryptį kaip atskaitą** („atsisuka į priešingą pusę“).
- **Patikra:** žmogaus peržiūra + `check_language.py` ieškina „pasuka/pasisuka“ be dydžio žymens.

## LL-03 — Simuliacija ieško elemento, kurio nesukuria

- **Simptomas:** modulyje 17 vaikas matė „Simuliacijos klaida: Cannot read properties of null (reading 'addEventListener')“.
- **Priežastis:** kodas kvietė `controls.querySelector("#vk-left").addEventListener(...)`, bet valdiklių HTML nebuvo sukurtas. Simuliacija virsdavo klaidos bloku.
- **Taisyklė:** jei `mount()` daro `querySelector(...).addEventListener(...)`, tas elementas **privalo** būti sukurtas tame pačiame `mount()`. Nė vienas `querySelector` neturi grąžinti `null` be patikros.
- **Patikra:** `check_view.py` atidaro modulį ir tikrina, kad nebūtų `.error-box` ir kad simuliacijoje būtų bent vienas matomas valdiklis. Prieš publikuojant naują simuliaciją — būtina.

## LL-04 — Užrakinti valdikliai be paaiškinimo

- **Simptomas:** pinigų pamokoje vaikas matė tuščią brūkšniuotą plotą ir vieną mygtuką „Sakau“; monetų nebuvo, nes jos pasirodydavo tik po spėjimo.
- **Priežastis:** `display:none` iki sąlygos įvykdymo, be jokio užrašo, kas tą sąlygą įvykdys.
- **Taisyklė:** užrakintas žingsnis turi būti **matomas**, **užrašytas** ir pasakyti, kas jį atrakina („Pirma pasakyk spėjimą — tada įsijungs monetos“). Niekada nepalik tuščio ploto be paaiškinimo.
- **Patikra:** `check_view.py` (`simVisibleControls`, `simHiddenControls` matuoja tik 0×0 esančius MATOMUOSE konteineriuose).

## LL-05 — Metaduomenys lūžta į dvi eilutes

- **Simptomas:** ilgo pavadinimo pamokoje „· 8 min.“ nusikeldavo į antrą eilutę ir kortelė atrodė sulūžusi.
- **Priežastis:** vienas `<p>` su ilgu tekstu ir trumpu priedu; tekstas lūždavo bet kur.
- **Taisyklė:** trumpi priedai (laikas, kiekis, žyma) — **atskirame elemente su `white-space: nowrap`**, o konteineris `display:flex; flex-wrap:wrap`.
- **Patikra:** `check_view.py` matuoja `eyebrowLines`; >1 yra defektas.

## LL-06 — Tekstas per mažas telefone

- **Simptomas:** užduoties klausimas telefone buvo ~16 px — pirmokui per mažas.
- **Priežastis:** bazinis dydis ėjo iš bendro `--fs-m`, ne iš užduoties konteksto.
- **Taisyklė:** užduoties tekstas **≥ 18 px telefone** (1–2 kl.), ≥ 20 px desktop; didink `clamp()` pagal peržiūros plotį.
- **Patikra:** `check_view.py` (`minTaskFont`).

## LL-07 — Naujas modulis be matomumo patikros

- **Simptomas:** keli moduliai buvo paskelbti su simuliacija, kuri neįsikeldavo arba be valdiklių.
- **Priežastis:** validatorius tikrino JSON, bet ne tai, ką vaikas pamatys.
- **Taisyklė:** prieš publikuojant modulį **privaloma** paleisti `check_view.py` tam moduliui (desktop + phone) ir į ataskaitą įrašyti skaičius.
- **Patikra:** agento baigties sąlyga + `check_view.py`.

## LL-08 — Dviprasmis „arba“

- **Simptomas:** „kiti rinkiniai duoda 70 arba 50 centų“ — vaikas negali suprasti, ar bet kuris tinka.
- **Priežastis:** šnekamoji kalba pateko į užduotį.
- **Taisyklė:** „arba“ — tik kai tikrai bet kuris variantas tinka. Kitu atveju: „arba … arba … (tik vienas)“ arba perfrazuok į „kuris“.
- **Patikra:** `check_language.py` (dviprasmybių taisyklė).

## LL-09 — Publikavimas atskirtas nuo kūrimo

- **Simptomas:** per parą 9 agentų paleidimai, o svetainėje — nulis pokyčių; 18 commit'ų įstrigo lokaliai.
- **Priežastis:** agentai turėjo patys daryti commit/push, bet netilpo į biudžetą; bėgiklis tik fiksavo failus.
- **Taisyklė:** **agentas keičia failus, bėgiklis publikuoja** (`run.py` → validacija → commit → push). Agentas niekada nedaro `git push`.
- **Patikra:** `check_published.py` (repo vs gyva svetainė) + run statusai.

## LL-10 — Statusas pagal rezultatą, ne pagal išėjimo kodą

- **Simptomas:** dashboard rodė „partial/ok“, nors repo nepakito; patikros vaidmenys atrodė kaip „nieko nepadarė“.
- **Priežastis:** statusas imtas iš proceso exit kodo.
- **Taisyklė:** statusas = `published` / `empty` / `checked` / `rejected` / `conflict` / `unpushed`, sprendžiama pagal failus ir validaciją.
- **Patikra:** `runs.db` + dashboard.

## LL-11 — Užduotis, kuri reikalauja tik balso

- **Simptomas:** pinigų pamokoje buvo tik mygtukas „Sakau spėjimą“ — vaikas, kuris nedrįsta kalbėti garsiai, mokosi tylioje klasėje arba neturi mikrofono, negalėjo atsakyti.
- **Priežastis:** spėjimo žingsnis buvo sumanytas kaip garsus atsakymas, o skaitmeninės alternatyvos nebuvo.
- **Taisyklė:** kiekvienas žingsnis, kuris prašo **atsakymo** (ne tik veiksmo), privalo turėti **teksto lauką** (`api.ask({...})`) šalia balso. Balsas — papildomas kelias, ne vienintelis. Niekada neversk vaiko kalbėti, kad galėtų tęsti.
- **Patikra:** `check_view.py` ieško simuliacijų, kurių nurodymas prašo „pasakyk“, bet valdymo zonoje nėra nei teksto lauko, nei pasirinkimo mygtukų; žmogus peržiūri įspėjimus.

## LL-12 — Žyma, kuri susispaudžia į apskritimą

- **Simptomas:** telefone modulio kortelėje „9 min.“ virto apskritimu su „9“ virš „min.“ — atrodė kaip sulūžusi kortelė.
- **Priežastis:** `.chip` neturėjo `white-space: nowrap` ir galėjo trauktis (`flex-shrink`), o ilgas pavadinimas užėmė visą eilutę.
- **Taisyklė:** trumpos žymos (laikas, kiekis, būsena) — `flex: 0 0 auto; white-space: nowrap`; trauktis turi **pavadinimas** (`min-width: 0; overflow-wrap: anywhere`), ne žyma.
- **Patikra:** `check_view.py` matuoja žymų aukštį ir plotį; žyma aukštesnė nei viena eilutė (h > 34 px) yra defektas.

## LL-13 — Plokšti stačiakampiai nėra iliustracija

- **Simptomas:** sėklos pamokoje buvo mėlynas stačiakampis „dangus“, rudas stačiakampis „žemė“ ir mažas rudas lopinėlis „sėkla“; metų laikų pamokoje žiemą kalvos liko žalios, o medis atrodė kaip kuolas; tilto pamokoje upė buvo plokščia mėlyna dėmė.
- **Priežastis:** kiekviena scena piešė savo primityvus (`<rect>`, `<circle>`), todėl trūko gylio, o spalvos nebuvo susietos su būsena.
- **Taisyklė:** scenos nenaudoja savo stačiakampių. Jos renka kompoziciją iš `assets/js/sims/art.js` (`defs`, `sun`, `cloud`, `hills`, `soil`, `tree`, `leaf`, `stem`, `flower`, `river`, `bridge`, `block`, `kid`, `grass`, `snow`). Spalvos ir formos keičiasi pagal būseną: žiema — šaltos kalvos ir plikas medis, vasara — žalios, ruduo — geltonos ir krintantys lapai.
- **Papildoma taisyklė:** ženklas ekrane ir iliustracija turi sutarti. Jei užrašas „žiema“, žalių kalvų būti negali — tai klaidinantis modelis.
- **Patikra:** `python3 scripts/check_art.py` — scena, kuri piešia SVG savo formomis ir nenaudoja `art.js`, laikoma broku; `LEGACY` sąrašas gali tik mažėti. Be to `check_view.py` tikrina išdėstymą, bet ne meną; kiekvieną naują ar pakeistą sceną žmogus (ar vaizdo peržiūra) įvertina atskirai: ar matosi, kas pavaizduota, be paaiškinimo.

## LL-14 — Gyvas tekstas, keičiamas kiekvieną kadrą

- **Simptomas:** laikrodžio pamokoje ekrano skaitytuvas per vieną 1,4 s pasukimą paskelbė „Ratas nebaigtas“ apie 84 kartus. Vaikas su ekrano skaitytuvu negirdi nieko kito, o regintis vaikas nemato jokios problemos — todėl defektas lieka nepastebėtas.
- **Priežastis:** `paint()` piešia kiekvieną `requestAnimationFrame` kadrą ir kiekviename kadre kvietė `api.readout(...)`, kuri rašo į `aria-live="polite"` sritį. Trys skirtingos reikšmės virto 86 pranešimais.
- **Taisyklė:** `api.readout()` ir fokusuoto elemento `aria-label` keičiami **tik pasikeitus reikšmei**, ne kiekviename kadre: laikyk `lastReadout` / `lastLabel` ir pranešk, kai tekstas kitas. Animacija gali būti kadrinė, tekstas — ne.
- **Patikra:** MutationObserver ant `#sim-readout` per vieną pilną veiksmą (čia — vienas ratas) turi rodyti **tiek pat mutacijų, kiek skirtingų reikšmių**, ne 80+. `check_view.py` to nepagauna, nes matuoja išdėstymą, ne pranešimų skaičių.

## LL-15 — Spėjimas, kurį modelis pameta

- **Simptomas:** pinigų pamokoje vaikas įrašė spėjimą „3 monetos“, sumokėjo 50 c + 10 c, o modelis atsakė tik „Apmokėta. 60 c.“ — spėjimas niekur nepaminėtas. Vaikas neturi progos pamatyti, kad jo prognozė buvo neteisinga.
- **Priežastis:** spėjimas buvo naudojamas kaip „durų“ mechanizmas (atrakinti monetoms), o ne kaip duomuo: reikšmė įrašyta, bet rezultato tekstas jos neperskaitė.
- **Taisyklė:** jei modelis prašo spėjimo, jis privalo jį **palyginti su tuo, kas įvyko** pirmos baigties metu („Spėjai 3, o lėkštėje 2“). Jei spėjimas nesutampa — pasakyk, kuo skyrėsi, bet neatskleisk teisingo atsakymo. Spėjimas be palyginimo yra dekoracija, o ne mokymasis.
- **Patikra:** zondas, kuris įrašo spėjimą (`api.ask` laukas), atlieka veiksmą ir tikrina, kad `#sim-readout` tekste būtų spėjimo skaičius. `check_view.py` to nepagauna — jis matuoja išdėstymą, ne pranešimų turinį. Tas pats trūkumas lieka `16-lygybe-svarstykles` simuliacijoje (`sv-*`), todėl jis įrašytas pasiūlymu simuliacijų inžinieriui. `15-laikas` simuliacijoje (`lk-*`) šis trūkumas pataisytas paleidime #49: spėjimas nebepatvirtinamas iš karto, o po pirmo užbaigto rato palyginamas su tuo, kas įvyko („Spėjai, kad apeis visą ratą… Dabar ji ties 1“), ir lyginamas tik vieną kartą.

## LL-16 — Būsena, kuri grįžta atgal per importą

- **Simptomas:** kūrėjo eilė kiekvieną dieną prasidėdavo tuo pačiu jau įgyvendintu pasiūlymu; 41 pasiūlymas „naujas“ kabėjo 4 dienas, o per tą laiką eilė įgyvendino 0. Tie patys 5–9 pasiūlymai buvo žymimi pasenusiais, bet po kelių minučių vėl atsirasdavo eilės galvoje.
- **Priežastis:** būsena saugoma dviejose vietose — DB (`new` / `done` / `obsolete` / `blocked`) ir pasiūlymo JSON faile, kuriame visada parašyta `"status": "new"`. `upsert_proposals()` kiekvieno paleidimo pabaigoje imdavo `status` iš failo, todėl triage ir publikavimo sprendimai buvo nunulinami, o eilė vėl imdavo tą patį darbą (pasiūlymai #1071, #486).
- **Taisyklė:** **kiekvienas būsenos laukas turi vieną savininką.** Jei įrašas importuojamas iš šablono, importas gali kurti naują įrašą, bet negali atstatyti jau priimto sprendimo: `new` iš šaltinio reiškia „nieko nesakau“, o ne „atstatyk“. Prieš rašydami `UPDATE … SET status=excluded.status`, paklausk, kas yra to lauko savininkas.
- **Patikra:** zondas, kuris (1) paleidžia triage, (2) užrašo būsenų kiekius, (3) pakartoja importą ir (4) palygina: jei po importo `done`/`obsolete` skaičius sumažėjo — defektas. Šiame pataisyme: prieš 43 new → po triage 38 new + 5 obsolete → po importo **vėl 45 new**, 0 obsolete.
