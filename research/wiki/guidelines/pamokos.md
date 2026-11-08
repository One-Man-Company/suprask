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

## LL-17 — Sėkmės sąlyga, kuri tikrina praeitį, o ne dabartį

- **Simptomas:** krypčių pamokoje vabaliuką pasukus į vaiką ir atgal, o paskui atvedus jį į lapą žiūrintį į kairę, modelis vis tiek pranešė tikslą pasiektą (`simDone: true`). Ekrane matėsi viena būsena, o pažanga buvo žymima pagal kitą.
- **Priežastis:** `facedDown` vėliavėlė buvo uždegama bet kada pasisukus į vaiką ir niekada negesinama, o `checkProgress()` skaitė vėliavėlę, ne `facing`. Kintamasis saugojo istoriją („kada nors žiūrėjo į vaiką“), o sąlyga reikalavo dabarties („dabar žiūri į vaiką“).
- **Taisyklė:** sėkmės sąlyga skaitoma iš tos pačios būsenos, kuri nupiešta ekrane. Istorinė vėliavėlė leidžiama tik tada, kai semantika tikrai yra „kada nors įvyko“ (pvz., ar vaikas išbandė visus variantus), ir ji vadinama taip, kad supainioti su dabartimi neįmanoma (`everFacedViewer`), o „Iš naujo“ ją išvalo kartu su kita būsena.
- **Patikra:** zondas, kuris (1) pasuka veikėją į vaiką, (2) atsisuka atgal, (3) nuveda į tikslą kita kryptimi ir tikrina, kad `simDone` liktų `false`; (4) pasuka į vaiką ties tikslu ir tikrina `true`. Šiame pataisyme: prieš — `true` žiūrint į kairę, po — `false`; žingsnis į priekį po posūkio taip pat rodo, kad ta pati komanda veda kita kryptimi.

## LL-18 — Klaidingas variantas, kuris gyvenime teisingas

- **Simptomas:** metų laikų modulyje pirma perkėlimo užduotis buvo „Kodėl birželį lauke galima žaisti iki vėlaus vakaro?“ su variantu „Nes birželį oras šiltas“. Vaikas, pasirinkęs šiltą orą, samprotavo teisingai — šiltą vakarą kieme tikrai galima žaisti, — bet buvo pažymėtas neteisingai. Klausimas buvo apie šviesą, o atsakymas buvo apie ką kitą, ir abu teisingi.
- **Priežastis:** klaidingas variantas buvo tikrinamas pagal tai, ar jis yra **priežastis**, o ne pagal tai, ar jis apskritai **teisingas**. Užduoties kamienas („galima žaisti“) turi dvi sąlygas — šviesą ir šilumą, — todėl bet kuris iš dviejų variantų jį paaiškina.
- **Taisyklė:** kiekvienam klaidingam variantui parašyk vieną sakinį: „jei taip būtų, ar klausiamas rezultatas iš tiesų įvyktų?“ Jei atsakymas „iš dalies taip“ — kaltas kamienas, ne variantas. Kamieną perrašyk taip, kad rezultatą lemtų **viena** priežastis, o klaidingas variantas jame jau būtų paneigtas. Šiuo atveju užduotis tapo „Rugsėjį dar šilta, bet vakarais temsta anksčiau. Kodėl?“ — kamienas pats pasako, kad šilta, todėl oro variantas nebeapginamas, o teisingas lieka tik dienos trukmė.
- **Patikra:** zondo metu spausk kiekvieną variantą ir perskaityk kamieną su juo kaip vieną sakinį: „…nes oras šiltas“ turi skambėti kaip akivaizdi netiesa, o ne kaip dar vienas teisingas paaiškinimas. `check_language.py` šito nepagauna — jis tikrina formuluotės ilgį ir dviprasmiškus jungtukus, ne variantų teisingumą realiame gyvenime.

## LL-19 — Taisymas grupės viduje, kuris negali pakeisti grupės eilės

- **Simptomas:** klasės puslapyje moduliai buvo rodomi penkiose krypčių kortelėse, o numeriai bėgo 1, 2, 5, 3, 6, 8, 9, 10, 12… — vaikas, eidamas sąrašu iš viršaus į apačią, gaudavo kitokią seką nei „Kitas žingsnis“. Dizainerio paleidimas #40 paskelbė „sąrašo eilė sutampa su `path.json` 18/18“, o jo zondas tai „patvirtino“.
- **Priežastis:** moduliai buvo skirstomi į krypčių korteles ir rikiuojami **kortelės viduje**. Krypties viduje `path.json` eilė ir `index.json` eilė sutampa, todėl rūšiavimas buvo nieko nekeičiantis veiksmas. Zondas laukiamą seką apskaičiavo **ta pačia klaidinga taisykle** (grupė + rūšiavimas grupės viduje), todėl palygino klaidą su klaida ir grąžino „sutampa“.
- **Taisyklė:** jei rikiuojama grupėse, grupių eilė nesikeičia — norint vienos sekos, sąrašas turi būti **viena seka**, o grupė rodoma kaip žyma eilutėje (arba kaip atskiras įėjimas), ne kaip konteineris. Patikros laukiama reikšmė imama iš **šaltinio** (`path.json`), o ne perskaičiuojama ta pačia funkcija, kurią tikriname: zondas, kuris kartoja kodo logiką, gali įrodyti tik tai, kad kodas sutampa su savimi.
- **Patikra:** nuskaityk rodomus žingsnių numerius DOM eile ir palygink su `path.json` pozicijomis: seka turi būti griežtai didėjanti 1…N be šuolių (19 modulių — 19 numerių). Šiame pataisyme prieš: `[1,2,3] | [4,5,6,7,8,9,10,11,12] | [13,14,15] | …` pagal kryptis; po: `[1…19]`, o „Kitas žingsnis · N iš 19“ sutampa 18/18 + paskutiniame — „Kelio pabaiga“.

## LL-20 — Bauda, kuri išnyksta iki galutinio dydžio

- **Simptomas:** augalo modelis perlaistymui (vanduo 4/5) rodė etiketę „Augalas vysta“ ir rašė „per daug vandens, šaknys nekvėpuoja“, bet po 12 dienų augalas buvo **lygiai tokio pat aukščio kaip laistytas teisingai** — 174 px prieš 174 px. Vienintelis dydis, kurį vaikas matuoja akimis, sakė „nieko bloga“, o žodis — „vysta“.
- **Priežastis:** bauda buvo įrašyta augimo faktoriuje (0,5 vietoj 1), o dydis kaupiamas iki lubų `Math.min(1, …)`. Dvylikos dienų pakako luboms pasiekti net su puse greičio, todėl paskutinė būsena buvo tokia pati. Patikra tikrino etiketę („vysta“) ir `simDone` nebuvimą, o ne galutinį matomą dydį; pilotas P-009 net teigė „dešimt perlaistymo dienų duoda mažą augalą“ — tai buvo netiesa, kol niekas neišmatavo aukščio.
- **Taisyklė:** bausmė turi būti matoma **tame pačiame dydyje, kurį vaikas lygina**, ir **galutinėje būsenoje**, ne tik tarpiniame žingsnyje. Jei modelis kaupia dydį per laiką ir turi lubas, patikrink, ar prastesnė sąlyga negali jų pasiekti per turimą laiką: arba mažink greitį tiek, kad lubos liktų nepasiektos, arba stabdyk augimą visai.
- **Patikra:** zondas, kuris praveda **visą** modelio laiką (12 dienų) dviem sąlygomis ir palygina galutinius matomus dydžius: prastesnė sąlyga privalo duoti mažesnį skaičių, o ne tą patį. Šiame pataisyme prieš — vanduo 3: 174 px, vanduo 4: 174 px (skyrėsi tik žiedas); po — vanduo 4: 77 px, vanduo 5: 0 px ir augimas sustoja, o grįžus prie 3 augimas atsinaujina (114 → 147 → 174 px). `check_view.py` ir `check_art.py` to nepagauna: jie matuoja išdėstymą ir piešinį, ne modelio išvestį.

## LL-21 — Skaičius dokumente, kurio niekas neperskaičiuoja

- **Simptomas:** `README.md` skelbė „4 kryptys, 13 modulių, 13 interaktyvių simuliacijų“, o `content/lt/grade-01/index.json` jau turėjo 19 modulių penkiose kryptyse; `docs/ARCHITEKTURA.md` tame pačiame sakinyje teigė 17. Matematikos eilutėje buvo išvardyti 4 moduliai iš 9, modulio aprašyme — „3 užduotys“, kai visuose moduliuose jų 4–5. Tas pats README nurodė nebe naudojamą balsą `lt-LT-OnaNeural` ir neturėjo privalomos balso CC BY 4.0 atribucijos, nors `scripts/generate_audio.py` numatytasis variklis yra `piper`. Klaida išsilaikė penkis paleidimus: #223 atsirado 21 paleidime, o 29-ame buvo papildytas užrašu „PAPILDYTA“ — skaičius pataisytas nebuvo, tik dar kartą perskaičiuotas.
- **Priežastis:** skaičius dokumente buvo **ranka perrašoma kopija** failų būsenos, o jokio įrankio, kuris jį perskaičiuotų, nebuvo: `validate_content.py` tikrina turinį, `check_audio.py` — įrašų pilnumą, nė vienas nežiūri į dokumentus. Agentas, radęs neatitikimą, neturėjo pigaus būdo jam užkirsti kelio, todėl rinkosi pigiausią — papildyti pasiūlymą. Viešas teiginys apie pajėgumą taip tapo vieninteliu dalyku, kurio niekas nematuoja.
- **Taisyklė:** kiekvienas skaičius, kuris skelbiamas už repo ribų (moduliai, kryptys, simuliacijos, užduotys, įrašai, agentai), turi būti **perskaičiuojamas iš šaltinio failų**, ne įrašomas iš atminties, ir turi turėti komandą, kuri tą patį padarytų prieš publikavimą. Skaičius keičiasi tik kartu su dokumentu tame pačiame pakeitime. Licencijos atribucija yra toks pat teiginys kaip ir skaičius: jei balsas keičiasi, pasikeičia ir priskyrimas.
- **Patikra:** `python3 scripts/check_docs_facts.py` — lygina README, `docs/ARCHITEKTURA.md` ir `content/lt/grades.json` su `index.json`, `SIMS` registrais, `assets/audio/lt/manifest.json` ir `agents/roles/*.md`; CI `.github/workflows/validate.yml` paleidžia jį po turinio validacijos. Kad patikra būtų įrodyta, ji paleista ir **prieš pataisą**: senajame README ir ARCHITEKTURA rastos 29 neatitiktys (kryptys 4≠5, moduliai 13≠19 ir 17≠19, simuliacijos 13≠19, matematikos eilutė 4≠9, trūkstama „Technologijos“ kryptis, „3 užduotys“ prieš 4–5, garso įrašai 344≠708, ~5 MB prieš 17 MB, `lt-LT-OnaNeural`, 4 trūkstami atribucijos elementai, „dvylika agentų“ prieš 15, 3 trūkstami vaidmenys, 2 trūkstami sims failai medyje), o po pataisos — 0 klaidų, 0 įspėjimų. Patikra, kuri niekada nebuvo paleista prieš taisomą failą, gali įrodyti tik tai, kad ji sutinka su savimi (žr. LL-19).

## LL-22 — Užuomina, kuri perskaito atsakymą

- **Simptomas:** modulyje „Skaičių tiesė“ pirma užduotis „Pradedi nuo 8 ir pridedi 2. Kur atsidursi?“ turėjo užuominą „Du žingsniai į dešinę nuo 8: 9, 10.“, o teisingas variantas buvo „10“. Vaikas nespėliojo ir neskaičiavo — perskaitė jau išspręstą veiksmą ir pasirinko paskutinį skaičių. Tas pats modulyje „Akmenėlis, žirklės, popierius“: klausimas „Kuris ėjimas nugali žirkles?“ su užuomina „Akmenėlis atbukina žirkles.“ Abu moduliai jau buvo išleisti ir abu praėjo validatorių.
- **Priežastis:** validatorius tikrino tik tai, ar užuomina ne tuščia ir ne ilgesnė nei 200 simbolių. Turinį rašė tas pats modelis, kuris žinojo atsakymą, todėl užuominą suformulavo kaip **paaiškinimą**, o ne kaip nuorodą į klaidą: lengviausia paaiškinti — parodyti sprendimą. Gairių T3.1 reikalavimas „nukreipti į klaidą, o ne į atsakymą“ neturėjo jokios mašininės patikros, todėl kiekviename naujame modulyje jis buvo vykdomas tik tiek, kiek apie jį atsiminė rašantysis.
- **Taisyklė:** užuomina rašoma kaip kryptis arba klausimas, nurodantis **būtent tą klaidą, kurią vaikas padaro** (skaičiuoja patį pradinį skaičių, galvoja, kad aštrus visada nugali kietą), ir joje negali būti teisingo varianto teksto net tada, kai jis trumpas kaip vienas skaičius. Prieš įrašydamas užuominą, perskaityk ją kartu su klausimu ir atsakyk sau: „ar po šios frazės dar yra ką spręsti?“
- **Patikra:** `python3 scripts/validate_content.py` nuo šio pakeitimo kiekvienoje užduotyje lygina `options[answer]` tekstą (normalizuotą, žodžio ribose) su `hint` ir, radęs sutapimą, grąžina **klaidą**, ne įspėjimą. Prieš pataisą: 2 klaidos (`04-skaiciu-tiese` 1 užduotis „10“, `13-akmenelis-popierius` 4 užduotis „Akmenėlis“), po pataisos — 0 klaidų visuose 19 modulių. Patikros riba: skaičiai, parašyti žodžiais, ir perifrazės („dešimtukas“) nepagaunamos — tai tinklelis, ne garantija.

## LL-23 — Modelio kriterijus — vyresnės klasės sąvoka

- **Simptomas:** modulyje „Figūros aplink mus“ (1 klasė) vaikas rūšiavo figūras į dėžes „3 kampai / 4 kampai / 0 kampų“ ir turėjo pasukti figūrą, kad įsitikintų, jog kampų skaičius nesikeičia. Kampo ir daugiakampio kraštinės pirmoje klasėje programa dar nemoko — tai 2 klasės turinys. Vaikas galėjo atsakyti tik spėdamas arba pasikartodamas iš vyresnio brolio, o modelis nedavė būdo taisyklei išvesti.
- **Priežastis:** simuliacijos kriterijus buvo pasirinktas pagal tai, kas „matematiškai tvarkinga“ (savybė, kurią galima suskaičiuoti), o ne pagal tai, ką ta klasė jau moka. Nė vienas įrankis to nepagavo: `validate_content.py` tikrino JSON, `check_language.py` — sakinius, `check_view.py` — išdėstymą; visi trys žiūrėjo į formą, ne į sąvokos amžių.
- **Taisyklė:** kiekvienas veiksmas, kurio modelis reikalauja iš vaiko, turi būti pagrįstas tos klasės programos sąvoka. Prieš rašydamas kriterijų („rūšiuok pagal kampus“, „skaičiuok kraštines“), pasitikrink `research/wiki/curriculum/` ir programos rekomendacijų eilutes: jei sąvoka ten priskirta vyresnei klasei, modelis turi remtis tuo, ką vaikas jau turi (pvz., forma ir padėtis), o savybę palikti tam moduliui, kuris tą klasę atvers. Atpažinimas („tai apskritimas“) ir savybių analizė („turi tris kampus“) yra skirtingi lygmenys — pirmas tinka 1 klasei, antras — 2 klasei.
- **Patikra:** žmogaus peržiūra su vienu klausimu prie kiekvieno valdiklio: „kurioje klasėje ši sąvoka išmokoma?“ — atsakymas turi būti ta pati klasė, kurioje yra modulis. Papildomai: vaikas turi galėti pasiekti `api.progress` vien veikdamas su modeliu, be išorinio apibrėžimo. Šiame pataisyme dėžės pervadintos formos vardu, kampų skaičiavimas ir „Rodyk kampus“ pašalinti; `check_view.py` ir zondas (9 figūros, 3 dėžės, pasukta figūra į tą pačią dėžę, `simDone` tik surūšiavus visas) rodo, kad modelis veikia, bet sąvokos amžių patikrina tik šis klausimas.

## LL-24 — Žymeklis, kuris užkloja tai, ką žymi

- **Simptomas:** erdvinių kūnų scenoje rodyklė „žiūriu iš čia“ buvo nupiešta fiksuotomis koordinatėmis, tinkamomis kūgiui ir rutuliui, bet stačiakampis gretasienis yra platesnis — rodyklės smaigalys atsidūrė jo šešėlio plote (kūno `getBBox` 38…177 × 77…181, rodyklės 14…40 × 170…192). Vaikas mato brūkšniuotą liniją, kertančią patį daiktą, į kurį ji turėtų rodyti, o 125 px pločio panelėje tai atrodo kaip įbrėžimas. Paveikslo prasmė — „žiūriu iš šios pusės“ — dingsta būtent tam kūnui, kurio forma mažiausiai įprasta.
- **Priežastis:** žymeklio vieta buvo parinkta akimis pagal vieną kūną ir nurašyta visiems penkiems; patikra tikrino, ar rodyklė **yra** DOM'e, o ne **kur** ji yra objekto atžvilgiu. `check_art.py` mato tik tai, kad scena naudoja `art.js`, o `check_view.py` — ar elementas telpa į konteinerį; nė vienas nelygina žymeklio ir objekto geometrijos.
- **Taisyklė:** kiekvienas žymeklis (rodyklė, akis, etiketė, brūkšnys) ant iliustracijos turi būti išdėstomas taip, kad nepriklausytų nuo vieno objekto dydžio: arba jo vieta skaičiuojama iš objekto `getBBox()`, arba kiekvienam objekto ir būsenos deriniui patikrinama, kad jie nesikerta. „Nupiešta vienam pavyzdžiui“ nėra tas pats kaip „veikia visiems“.
- **Patikra:** zondas pereina 5 kūnus × 3 žvilgsnius, paima abiejų scenos `<g>` grupių `getBBox()` ir reikalauja, kad žymeklis nekirstų kūno ir liktų 0…200 ribose — 30/30 atvejų `separated: true`, `inside: true`. Prieš pataisą ta pati patikra davė 4 klaidas (gretasienis: „iš priekio“ ir „nuo šono“), po pataisos — 0; `check_art.py` ir `check_view.py` abi šias klaidas praleido.

## LL-25 — Sąlyga, kurią modelis turi, o užduotis pamiršo

- **Simptomas:** modulyje „Augalo gyvenimas“ simuliacija turi tris kintamas sąlygas (vanduo, šviesa, šiluma; šalta → augimo dalis 0,1), o pirma užduotis klausė „Ko augalui reikia labiausiai, kad jis augtų?“ ir teisingu laikė „Vandens ir šviesos“. Vaikas, ką tik simuliacijoje atvėsinęs augalą ir perskaitęs „Augalas neauga“, už teisingą atsakymą gaudavo būtent tą, kuris paneigia jo patirtį. Antroji užduotis prieštaravo taip pat: tamsoje stiebas per dieną nepailgėjo (`stemSame: true`), o variantas skelbė „auga lėtai“. Modulis praėjo validatorių, `check_view.py` ir garso patikrą.
- **Priežastis:** modelis buvo perrašytas (paleidimas 28, kritikas #222) ir prie jo pridėta trečia sąlyga, bet modulio tekstas liko iš ankstesnės versijos. Nė vienas įrankis nelygina teksto su modelio logika: validatorius tikrina JSON laukus, `check_language.py` — sakinius, `check_view.py` — išdėstymą, `check_audio.py` — įrašus. Sakinys apie modelį yra žmogaus parašytas teiginys, o ne iš modelio išvedama reikšmė, todėl pasikeitus modeliui jis nepasikeičia pats.
- **Taisyklė:** kai keičiamas modelio kintamųjų rinkinys ar jų poveikis, tame pačiame pakeitime peržiūrimi **visi** to modulio sakiniai, kurie teigia, ko reikia ir kas nutinka: `outcomes`, `concept.steps`, kiekvienos užduoties `options`, `why`, `hint`, `teacher.misconceptions`. Kiekvienas variantas perskaitomas su klausimu „ar tai, ką modelis parodo, sutampa su šiuo sakiniu?“ Pastovi sąlyga (dirvožemis) negali būti išvardyta tarp kintamųjų nei `outcomes`, nei užduotyse — ji priklauso `concept` tekstui ir simuliacijos pastabai.
- **Patikra:** funkcinis zondas, kuris kiekvieną sąlygą išjungia atskirai ir nuskaito modelio išvestį, o paskui lygina ją su užduoties teisingu variantu: šalta → `Augalas neauga`; tamsa → `Augalas blyškus` ir `stemSame: true`; vanduo 5 → „per daug vandens, šaknys nekvėpuoja“. Šiame pataisyme pirma užduotis tapo „Kiek sąlygų reikia augalui, kad jis augtų?“ → „Trijų: vandens, šviesos ir šilumos“, antra — „Jis blyksta ir neauga“, o iš `outcomes` išimtas dirvožemis. `validate_content.py`, `check_language.py`, `check_audio.py`, `check_art.py` ir `check_view.py` (0 problemų abiem pločiams) tokios neatitikties nepagauna — ją randa tik zondas, kuris lygina modelio išvestį su tekstu.


## LL-26 — Stulpelis, sudėtas iš skaičiuojamų paveikslėlių

- **Simptomas:** pirmame duomenų modulyje („Piktograma ir stulpelis“, 1 klasė) diagrama natūraliai susidėlioja iš tų pačių ikonėlių kaip piktograma: viena figūra — vienas stulpelio langelis. Taip atrodo dauguma vadovėlinių stulpelių, todėl sprendimas atrodė nekaltas. Kaminski ir Sloutsky (2013) eksperimente 6–8 m. vaikai, kurių stulpelį sudarė skaičiuojami paveikslėliai, ėmė skaičiuoti paveikslėlius ir nebeskaitė aukščio — tai yra, modulis būtų mokęs to, ką vaikas jau moka (skaičiuoti), o ne to, ko dar nemoka (skaityti aukštį). Modelis būtų „veikęs“, užduotys — išsprendžiamos, o pagrindinė sąvoka — apeita.
- **Priežastis:** diagrama neturi savo primityvo nei `art.js`, nei CSS sistemose, todėl stulpelis surenkamas iš to paties bloko kaip piktogramos ženklas. Patikros žiūri į formą, o ne į mokymosi kelią: `validate_content.py` tikrina JSON, `check_art.py` — ar scena naudoja bendras dalis, `check_view.py` — ar telpa ir ar matomi valdikliai. Nė viena neklausia: „ar vaizdas leidžia apeiti sąvoką, kurią modulis moko?“
- **Taisyklė:** stulpelis vientisas — jo aukštis tiesiogiai proporcingas kiekiui, o viduje nėra skaičiuojamų elementų. Skaičiuojami ženklai leidžiami tik piktogramos režime, ir abu vaizdai rodomi atskirai (perjungiamu mygtuku), kad vaikas pats įsitikintų, jog jie rodo tą patį skaičių. Diagramos puošimas ikonomis nėra neutralus dizaino pasirinkimas — jis keičia tai, ką vaikas išmoksta.
- **Patikra:** zondas matuoja abu dalykus: (1) stulpelio elemente nėra vaikų mazgų (`childElementCount === 0`), (2) aukštis tiesiškai priklauso nuo skaičiaus — 3 figūros → 45 px, 7 → 105 px (UNIT 15), o piktogramoje ženklų skaičius lygus figūrų skaičiui (3 ir 7). `check_view.py` (0 problemų 1440 ir 390 px) ir garso patikra tokią klaidą praleistų, todėl ši patikra daroma zondo, ne validatoriumi.

## LL-27 — Dėmuo, kuris išgaruoja perkėlus dėmes

- **Simptomas:** sudėties per dešimtį modelyje vaikas spaudžia „Papildyk dešimtuką“, dvi dėmės iš penkių persikelia į dešimtuką, o ant stalo lieka trys. Jei modelis tiesiog perpiešia stalą su trimis dėmėmis, vaikas ekrane mato `8 + 5`, paskui `10 + 3` ir `13` — bet niekur nebemato penketo ir negali pamatyti, kad penketas susiskaidė į `2 + 3`. Modelis „veikia“ (suma teisinga, dešimtukas pilnas, `api.progress` įrašomas), o būtent ta dalis, kurios modulis moko — antro dėmens skaidymas — lieka nematoma. Vaikui tai atrodo taip, lyg dešimtukas „suvalgytų“ dėmes be taisyklės.
- **Priežastis:** modelis buvo tikrintas pagal išvestį (suma, pilnas dešimtukas, pažymėtas rezultatas), o ne pagal tai, ar kiekvienas veiksme panaudotas skaičius lieka matomas. Įrankiai to nepagauna: `validate_content.py` tikrina JSON, `check_language.py` — sakinius, `check_view.py` — išdėstymą ir taikinius, `check_audio.py` — įrašus. Perkėlimas yra vienintelis veiksmas, kurio metu ekrane esantis kiekis sumažėja, ir nė vienas įrankis nelygina „ką vaikas matė prieš“ su „ką mato po“.
- **Taisyklė:** kai modelis perkelia kiekį iš vienos grupės į kitą, šaltinio skaidymas turi likti ekrane: rodyk lygybę `X = a + b` (čia `5 = 2 + 3`), o likutis turi likti suskaičiuojamas toje pačioje vietoje, kur buvo. Perkeltos dalys turi būti atpažįstamai tos pačios (spalva, padėtis), kad vaikas galėtų jas atsekti, o ne spėlioti, iš kur atsirado dešimtukas. Paslėpti seną kiekį leidžiama tik tada, kai jo nebereikia nė vienam modulio sakiniui.
- **Patikra:** zondas skaičiuoja elementus abiejose zonose prieš ir po veiksmo ir nuskaito skaidymo tekstą: rėmelio dėmės = `a + perkeltos` = 10, ant stalo = `b − perkeltos`, o tekstas `b = perkeltos + liko` turi sumuotis. Šiame modulyje: prieš — 8 dėmės rėmelyje ir 5 ant stalo, po — 10 rėmelyje (8 mėlynos + 2 geltonos) ir 3 ant stalo, tekstas `5 = 2 + 3`, `8 + 2 = 10, paskui 10 + 3 = 13`; pakeitus dėmenis į 9 ir 6 — `9 + 1 = 10, paskui 10 + 5 = 15` ir `6 = 1 + 5`. `validate_content.py`, `check_view.py` (0 problemų 1440 ir 390 px) ir garso patikra tokio praradimo nepastebėtų.

## LL-28 — Modelis, kuriame nėra nė vieno prieštaraujančio pavyzdžio

- **Simptomas:** modulis „Gyvūnų grupės“ įvardija tris klaidingas nuostatas (šikšnosparnis priskiriamas paukščiams, delfinas — žuvims, pingvinas — „ne paukštis“), o simuliacijos devyni gyvūnai visi atpažįstami iš akivaizdžių požymių. Vaikas, kuris mano, kad delfinas yra žuvis, modelį praeina nepatyręs nė vieno prieštaravimo: jis tik patvirtina tai, ką jau moka. Simuliacija atrodo tvarkinga (visi priskyrimai teisingi, `api.progress` įrašytas), bet neįvyksta būtent tas mokymasis, dėl kurio modulis parašytas (proposal #727, `10-gyvunu-grupes.json:79–83`).
- **Priežastis:** simuliacija buvo tikrinta pagal veikimą (ar mygtukai reaguoja, ar visi gyvūnai surikiuojami, ar rezultatas įrašomas), o ne pagal `teacher.misconceptions` sąrašą. Nė vienas įrankis šito nepagauna: `validate_content.py` tikrina JSON laukus, `check_language.py` — sakinius, `check_view.py` — išdėstymą ir taikinius, `check_audio.py` — įrašus. Nuostatų sąrašas yra dokumentacijos tekstas, o ne patikros sąlyga.
- **Taisyklė:** kiekviena modulio įvardyta klaidinga nuostata turi turėti atitikmenį modelyje — bent vieną atvejį, kai akivaizdus požymis (gyvena vandenyje, skraido, neskraido) prieštarauja grupei. Toks atvejis turi būti natūraliai viliojantis (delfinas plaukia kaip žuvis), o modelis į klaidą atsakyti **požymiu**, ne nuosprendžiu („plaukia kaip žuvis, bet žiaunų neturi — kuo kvėpuoja?“). Klaidinantis atvejis yra praplėtimas: jis nerodomas iki pagrindinio rezultato ir neįskaitomas į `api.progress`.
- **Patikra:** zondas eina būtent klaidingu keliu (delfinas → žuvų dėžė) ir tikrina, kad pasirodytų su tuo susijęs požymio klausimas, o ne bendras „ne ši grupė“; antrą kartą klystant — modelio žingsnis; teisingai priskyrus — priešingas paaiškinimas (vieta vandenyje ≠ grupė). Šiame modulyje: 360, 320 ir 1024 px, 27 patikros paleidimui (81 iš viso), 0 klaidų, `simDone` lieka `true` po devynių priskyrimų ir antras klaidingas bandymas jo neatšaukia.

## LL-29 — Pažanga, pažymėta po pirmo žingsnio

- **Simptomas:** vaikas modulyje „Garsas ir raidė“ paspaudė pirmą teisingą raidę iš šešių, o mokytojo pažangoje modulis jau virto „simuliacija atlikta“; ekrane dar buvo „Žodis 2 iš 6“. Ta pati būsena buvo „Sakinio tvarkoje“ (4 sakiniai), „Dėsningumuose“ (4 sekos) ir „Skaičių tiesėje“ (5 taikiniai): pažanga įrašoma po pirmo teisingo tarpinio žingsnio, nors to paties komponento pabaigos ekranas („Įveikei visas raides!“, „Sekos įveiktos!“) ateina tik įveikus visus.
- **Priežastis:** `api.progress()` buvo kviečiamas toje pačioje šakoje, kur apdorojamas vienas teisingas atsakymas, o ne ten, kur baigiamas ciklas. `app.js:388` kiekvieną kvietimą verčia `progress.markSimDone()`, o `progress.js:66` įrašo `simDone: true` — įrašas idempotentinis, todėl vėlesni kvietimai nieko nekeičia ir klaida lieka nematoma. Semantikos nepatikrina nė vienas įrankis: `validate_content.py` tikrina JSON laukus, `check_audio.py` — įrašus, `check_view.py` — išdėstymą; visi žiūri į formą, ne į tai, **kada** įrašoma būsena.
- **Taisyklė:** `api.progress()` kviečiamas tik pasiekus simuliacijos mokymosi tikslą — pabaigus visą ciklą (visos raidės, visi sakiniai, visos sekos, visi taikiniai) arba įvykdžius vieną išbaigtą veiksmą (dešimtukas pilnas, svarstyklės lygios, tiltas pastatytas). Jei modelis turi kelių žingsnių seką, tarpiniai žingsniai gali turėti savo grįžtamąjį ryšį (`api.note`), bet ne pažangos įrašą. Sutartis — `docs/KURINIO-STANDARTAS.md` §4.
- **Patikra:** zondas, kuris eina visą kelią ir kiekviename žingsnyje nuskaito `localStorage` `simDone`: po pirmo teisingo žingsnio turi būti `false`, po paskutinio — `true`. Šiame pataisyme: 4 moduliai × 7 patikros = 28 patikros, 0 nepavykusių; prieš pataisą visuose keturiuose `simDone` buvo `true` jau po pirmo žingsnio. `validate_content.py`, `check_ui.py`, `check_view.py` ir `check_audio.py` šios klaidos nepagauna.


## LL-30 — Etiketė, kuri išsikiša iš dėžės, bet dokumentas neslenka

- **Simptomas:** pasiūlymas #42 dėžėms pridėjo dangos žodį ir grupės vardą padidino iki 0,95 rem. @360 px žodis „Žinduoliai“ išmatuotas 85 px, o dėžei teksto liko 81,6 px — 3,4 px kyšojo už vidinės dėžės ribos ir ėjo po brūkšniuotu rėmeliu. Tam pačiam moduliui `check_view.py` rodė `{"checked": 2, "problems": []}`: jis tikrina dokumento `scrollWidth` (liko 360 px), mažus taikinius ir matomumą, o elemento vidinis išsikišimas į dokumentą nepatenka — grid stulpelis jį prilaiko, tad puslapis nesislenka.
- **Priežastis:** tikrinta buvo puslapio horizontalioji slinktis, o ne kiekvieno teksto santykis su jo dėže. Trijų stulpelių tinklelis @360 px duoda 88 px vidinio pločio — tai maždaug devynios raidės 15 px šriftu, o ilgiausias grupės vardas turi dešimt.
- **Taisyklė:** kai tekstas dedamas į fiksuoto pločio dėžę (dėžė, žetonas, kortelė), tikrinamas **kiekvieno** elemento `scrollWidth` prieš `clientWidth`, ne vien dokumento platumas. Etiketės šriftas nemažinamas žemiau 14 px — mažinti raidę, kad ji tilptų, yra LL-06 klaida iš kitos pusės; jei netelpa, keičiamas maketas (mažiau stulpelių, didesnis tarpas), o ne šriftas.
- **Patikra:** zondas ima kiekvienos dėžės `clientWidth`/`scrollWidth` ir joje esančių vaikų plotį @360 ir @390 px, taip pat su 125 % šakniniu šriftu. Šiame pataisyme: 0,95 rem → 85 px prieš 81,6 px (kirpo), 0,9 rem → 81 px prieš 81,6 px (telpa); `scroll == client` visose trijose dėžėse abiejuose pločiuose, 0 px dokumento slinkties. `check_view.py` abiem variantais rodė 0 problemų — klaidą randa tik šis zondas.

## LL-31 — Skaičius, kuris nusikirpo langelyje

- **Simptomas:** pirmame 100-o skaičių lentelės modelyje langelių šriftas buvo pritaikytas dviženkliams skaičiams. 360 px ekrane langelio vidus liko 23 px, o triženklis „100“ — 23,4 px, tad paskutinis lentelės langelis rodė nukirptą skaičių; 320 px ekrane vidus buvo 19 px, o tekstas 23,4 px — nusikirpo trečdalis. Kirtimas buvo tyliai paslėptas `overflow:hidden`, todėl nei dokumentas, nei langelis nesislinko: ekrane atrodė tiesiog „00“. Pastebėta kuriant, iki publikavimo.
- **Priežastis:** šriftas buvo parinktas pagal tipinį langelio turinį (dvizenklį skaičių), o ne pagal ilgiausią („100“). `check_view.py` matavo dokumento `scrollWidth` ir mygtukų dydį — abu buvo tvarkingi, nes perteklių sugėrė `overflow:hidden`; `validate_content.py` ir `check_language.py` žiūri JSON, ne geometriją. Tai ta pati šeima kaip LL-30, tik priešinga kryptimi: ten etiketė kyšojo iš dėžės, čia turinys dingo dėžės viduje, ir abiem atvejais puslapis nesislenka.
- **Taisyklė:** kai tinklelio langelyje yra kintančio ilgio tekstas, matuojamas **ilgiausias** variantas (100-o lentelėje — „100“), o ne tipinis, ir kiekvienam langeliui lyginama `scrollWidth` su `clientWidth`. Jei stulpelių skaičius yra pati sąvoka (10 stulpelių — tai, kas daro lentelę šimto lentele), jo keisti negalima, todėl vieninteliam triženkliam langeliui leidžiamas **dokumentuotas** mažesnis šriftas ir jis neturi kirsti turinio. Tai sąmoninga LL-30 išimtis: ten maketas buvo laisvas, čia — ne.
- **Patikra:** zondas 320/360/390/1440 px ima kiekvieno langelio `clientWidth`, `scrollWidth` ir išmatuoja ilgiausio skaičiaus teksto plotį atskiru matuokliu: 320 px — „100“ 20,0 px iš 23 px (9,6 px šriftas), dviženkliai 16,5 px iš 23 px (11,84 px); 360 px — 20,3 iš 27 (9,72 px) ir 16,8 iš 27 (12,06 px); 390 px — 22 iš 30 ir 18,2 iš 30; 1440 px — 28,1 iš 51 ir 21,8 iš 51. Visur `scroll == client`, 0 px dokumento slinkties. `check_view.py` (1440 + 390 px) rodė `problems: []` ir prieš pataisą — klaidą randa tik šis matavimas.

## LL-32 — Fokusas, kurį naršyklė numeta išjungusi valdiklį

- **Simptomas:** augalo modelyje vaikas klaviatūra (Tab į „Diena →“, tada Enter) paspaudžia paskutinį kartą, 12 dieną mygtukas išsijungia — ir `document.activeElement` tampa `body`. Ekrane viskas tvarkinga: tekstas „Modelis baigiasi 12 dieną. Vaisius prinoko — jame yra sėklų.“ matomas, „Iš naujo“ šalia, `aria-live` yra. Bet vaikas su klaviatūra ar ekrano skaitytuvu nebeturi kur eiti: kad pasiektų „Iš naujo“, jis turi Tab'inti nuo puslapio pradžios per visą turinį. Ta pati būsena susidaro ir nuvytimo kelyje, kai „Diena →“ užrakinamas po trečios dienos be augimo.
- **Priežastis:** `disabled` mygtukas išmetamas iš fokusų sekos, o naršyklė fokusą, kuris buvo ant jo, numeta į dokumento pradžią. Patikros to nepagauna: `check_view.py` matuoja slinktį, taikinius, matomumą ir konsolės klaidas; `validate_content.py` ir `check_language.py` žiūri JSON ir sakinius; `check_art.py` — ar scena naudoja bendras dalis; `check_ui.py` — CSS/HTML taisykles. Nė vienas neklausia, kur yra `document.activeElement` po būsenos pakeitimo, nes tai matoma tik klaviatūros sekoje.
- **Taisyklė:** jei valdiklis programuojant išjungiamas (ar paslepiamas) tuo metu, kai fokusas buvo ant jo, fokusas **turi būti perkeltas** į artimiausią likusį veiksmą (šiuo atveju „Iš naujo“) arba į priežastį paaiškinantį bloką. Perkelti tik tada, kai fokusas jau buvo ten — kitaip vagiamas fokusas iš vaiko, kuris tuo metu laiko kitą valdiklį. Priežastis vis tiek rašoma matomame tekste (LL-04), o būsenos tekstas turi `aria-live`, kad būtų perskaitytas.
- **Patikra:** klaviatūros zondas eina visą kelią be pelės: Tab į „Diena →“, Enter iki pabaigos (ir atskirai — iki nuvytimo), tada tikrina `document.activeElement` (turi būti `ag-reset`), `#ag-end` tekstą ir `aria-live`, o po to Enter ant „Iš naujo“ — ar „Diena →“ vėl įjungtas ir tekstas išvalytas. Prieš pataisymą: `{"active": "BODY", "nextDisabled": true}`; po pataisymo: `{"active": "ag-reset", "nextDisabled": true}` ir `{"active": "ag-reset", "nextDisabled": false, "end": ""}` po „Iš naujo“. `check_view.py` abiem atvejais rodė `problems: []` — klaidą randa tik šis zondas.

## LL-33 — Paaiškinimas, įrašytas pagal pirmą pavyzdį

- **Simptomas:** modulyje „Dėsningumai“ į klaidingą atsakymą simuliacija atsakydavo vienu sakiniu „Ne visai. Pakartok seka garsiai: pirmas, antras, pirmas, antras…“. Pirmoji seka buvo ABAB, todėl sakinys jai tikdavo; bet to paties modelio antra seka (🟡🟡🟢), trečia (🟠🟢🔵) ir ketvirta (🟣🟣🟣🟠) kartojasi ne po du, tad vaikas, suklydęs 3 iš 4 sekų, gaudavo taisyklių aprašymą, kurio jo sekoje nėra. Klaida atrodo kaip pagalba („perskaityk garsiai“), bet nukreipia į neteisingą grupės ilgį — tai klaidinga nuostata, pasakyta modelio balsu.
- **Priežastis:** grįžtamasis ryšys buvo parašytas kaip vienas kietai įrašytas sakinys tame komponente, kuris pirmas sukurtas (viena seka, vienas autorius). Kai `config.tasks` išaugo iki keturių–penkių skirtingo ilgio grupių, tekstas liko tas pats: jis priklauso nuo *konfigūracijos*, o buvo įrašytas *kode*. Nė vienas įrankis to nepagauna: `validate_content.py` tikrina JSON laukus, `check_language.py` — modulio sakinius (simuliacijos kodas nepatenka), `check_view.py` — išdėstymą ir taikinius, `check_audio.py` — garso įrašus. Grįžtamasis ryšys tikrinamas tik tada, kai kas nors sąmoningai paspaudžia neteisingą variantą kiekvienoje sekoje.
- **Taisyklė:** klaidos paaiškinimas simuliacijoje formuluojamas **apie veiksmą, ne apie konkrečią seką**: „perskaityk seką nuo pradžios ir pasakyk, kas kartojasi“. Jei norima pasakyti konkrečią taisyklę, ji imama iš `config` tos sekos, o ne rašoma kode. Tas pats galioja baigiamiesiems ir pagyrimo sakiniams: jie neturi įvardyti elemento, kurio kitose konfigūracijose nėra. Klaidos tekstas skelbiamas ir per `api.readout` (aria-live), ne vien matomame `.sim-note`, nes kitaip vaikas su ekrano skaitytuvu klaidos negirdi.
- **Patikra:** zondas eina visas sekas ir po **kiekvieno** klaidingo paspaudimo nuskaito matomą tekstą ir `#sim-readout`: turi būti ta pati, nuo sekos nepriklausanti formuluotė ir joje neturi būti nė vieno konkrečios sekos elemento pavadinimo („pirmas“, „antras“, spalvos). Šiame pataisyme: 5 sekos × 1 klaidingas paspaudimas @360 px → 5/5 `wrong_note: „Ne visai. Perskaityk seką nuo pradžios ir pasakyk, kas kartojasi.“`, `wrong_readout: „Dar ne visai. Rask, kas kartojasi.“`, 0 px slinkties, klaidingas paspaudimas sekos nekeičia; prieš pataisą toje pačioje vietoje buvo „pirmas, antras, pirmas, antras…“ 3 sekose iš 4. `validate_content.py`, `check_language.py`, `check_audio.py` ir `check_view.py` šios klaidos nepagauna — ji matoma tik paspaudus neteisingą variantą.


## LL-34 — Sąvoka išimta iš modulio, bet liko simuliacijos tekste

- **Simptomas:** modulyje „Dešimtukas“ trečias žingsnis ir antra užduotis kalbėjo apie „pusę dešimtuko“ — 2 klasės sąvoką. Pasiūlymas #250 liepė ją pakeisti penketų sandara, ir modulio JSON buvo sutvarkytas. Bet simuliacija `desimtukas` (`assets/js/sims/matematika.js:132`) po penkių paspaustų langelių vis dar sakė „Pusė dešimtuko — penki. Kaip dar gali pasakyti penkis?“ — vaikas, atlikęs jau pataisytą modulį, iš modelio išgirstų būtent tą sąvoką, kurios modulyje nebeliko.
- **Priežastis:** ta pati pedagoginė formuluotė gyvavo dviejose vietose — turinyje (`concept.steps`, `tasks`) ir simuliacijos kode. Pasiūlymo `target` buvo tik JSON failas, o nė vienas įrankis simuliacijos sakinių su turiniu nelygina: `validate_content.py` tikrina JSON laukus, `check_language.py` skaito `content/`, `check_audio.py` — garso įrašus, `check_view.py` — geometriją ir būsenas.
- **Taisyklė:** kai iš modulio šalinama ar keičiama sąvoka, tos sąvokos ieškoma **visame repo** (`grep -rn`), ne tik `target` faile: simuliacijos, `teacher` ir `svietimas1` tekstai turi likti suderinti su `concept` ir `tasks`. Simuliacijos tekstas formuluojamas taip, kad tikti bet kuriai to paties modelio būsenai (penketas kaip eilė, o ne „pusė“), ir neįvardija sąvokos, kurios modulyje nėra.
- **Patikra:** `grep -rn` sąvokos visame repo prieš ir po pataisymo; zondas @360 px eina modelio būsenomis (0, pirma eilė pilna, 8 iš 10, 10 iš 10, išvalyta, 5 langeliai išmėtyti) ir nuskaito `#dt-msg` bei `#sim-readout` — nė viename neturi būti pašalintos sąvokos. Šiame pataisyme: 6 būsenos, 0 paminėjimų, 0 px slinkties, 0 konsolės klaidų; prieš pataisą toje pačioje vietoje buvo „Pusė dešimtuko — penki.“

## LL-35 — Sąrašas, kuris matuojamas kaip sakinys

- **Simptomas:** pasiūlymas #448 skelbė, kad modulyje „Pinigai“ trys sakiniai viršija 10 žodžių ribą. Du iš tų „sakinių“ buvo pinigų sąrašai: `2 € + 2 € + 2 € + 2 €` ir `5 € + 1 € + 1 € + 1 €`. Juose yra keturios vertės ir septyni skyrikliai (`€`, `+`); skaičiuojant tarpus, gaunasi 11 „žodžių“, nors vaikas perskaito keturis skaičius. Jei būtų taisoma pagal šį matavimą, tektų laužyti sąrašo užrašą (rašyti be tarpų arba keisti „+“ kableliais) ir prarasti sudėjimo užuominą, kuri šiame modulyje yra pati sąvoka.
- **Priežastis:** matuoklis skaičiavo tarpus, o standartas (`docs/KURINIO-STANDARTAS.md:110`) kalba apie sakinio žodžius. Simbolis `€` ir ženklas `+` yra skyrikliai, ne žodžiai; `check_language.py` (`WORD_RE`) juos jau praleidžia, bet pasiūlymo autorius matavo savo skriptu. Dviejų matavimo būdų skirtumas virto dviem skirtingais „trūkumais“ tame pačiame faile.
- **Taisyklė:** sakinio ilgis matuojamas **žodžiais, kuriuos vaikas ištaria** (raidės ir skaičiai), o pinigų ar daiktų sąrašas vertinamas pagal **elementų skaičių**. Jei matuoklis duoda ilgesnį sąrašą nei jo elementų skaičius, klaida yra matuoklyje, o ne turinyje: taisomas matuoklis, o ne sąrašas.
- **Patikra:** du matavimai vienu metu — `check_language.py` (raidiniai žodžiai) ir savas skriptas, skaičiuojantis ir tarpus, ir elementus. Šiame pataisyme sąrašai perrašyti į `5 €, 2 € ir 1 €` forma, kuri tenkina abu matavimus (≤10 žetonų ir 3 vertės), o sakiniai — iki 10 raidinių žodžių; `python3 scripts/check_language.py --grade 1` moduliui rodo 0 įspėjimų.

## LL-36 — Pasiūlymo įrodymas, kurio faile nebeliko

- **Simptomas:** #448 cituotas ilgiausias sakinys („Parduotuvėje 60 centų kainuojantį ledinuką…“, 20 žodžių, `14-pinigai.json:22`) tame faile jau neegzistavo — modulis buvo perrašytas po to, kai pasiūlymas įrašytas. Tikrų pažeidimų tame faile buvo trys, ir nė vienas ne tas, kurį rodė pasiūlymas. Agentas, vykdantis pasiūlymą pažodžiui, būtų ieškojęs eilutės, kurios nėra, ir galėjo pranešti „jau sutvarkyta“, nors du sąrašai vis dar viršijo matuoklio ribą.
- **Priežastis:** pasiūlymas fiksuoja failo būseną įrašymo metu, o eilėje jis laukia parų; turinys per tą laiką keitėsi (kiti paleidimai). `target` failas liko tas pats, tad pasiūlymas neatrodė pasenęs, nors jo citatos — pasenusios.
- **Taisyklė:** prieš taisydamas išmatuok **visą `target` failą iš naujo**, ne tik cituotas eilutes; ataskaitoje nurodyk, kiek pažeidimų yra dabar ir ar jie sutampa su pasiūlymo sąrašu. Jei nesutampa — taisyk tai, ką radai, o skirtumą įrašyk į ataskaitą, kad eilės savininkas žinotų, jog pasiūlymo matavimas pasenęs.
- **Patikra:** matuoklio paleidimas prieš darbą (`scan_all.py` visai klasei) ir po darbo ta pačia metrika; ataskaitoje — skaičiai „prieš / po“ ir pasiūlymo citatų atitikimo patikra (`grep` citatos faile). Šiame pataisyme: prieš — 49 sakiniai 18 modulių, po — 46 sakiniai 17 modulių, cituota 20 žodžių eilutė faile nerasta.
