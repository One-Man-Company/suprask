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
