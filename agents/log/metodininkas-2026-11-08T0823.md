# metodininkas — 2026-11-08T0823

- paleidimas: #133 (manual)
- trukmė: 1024s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/q_new.py
│ @@ -0,0 +1,8 @@
│ +import sqlite3
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +rows = c.execute("select id,type,priority,status,role,created,title,target from proposals where status='new' order by case priority when 'high' then 0 when 'normal' then 1 else 2 end, id").fetchall()
│ +for r in rows:
│ +    print(r[0], '|', r[1], '|', r[2], '|', r[3], '|', r[4], '|', r[5], '|', r[6], '|', r[7])
│ +print('--- counts ---')
│ +for r in c.execute("select status, type, count(*) from proposals group by status, type"):
│ +    print(r)
│ profiles/deepseek41flash/cache/scratch/q_tema.py
│ @@ -0,0 +1,9 @@
│ +import sqlite3, json
│ +c = sqlite3.connect('/home/zoltanas/workspace/suprask/agents/runs.db')
│ +print('=== tema/metodas proposals ===')
│ +for r in c.execute("select id,type,status,priority,created,title,target from proposals where type in ('tema','metodas') order by id"):
│ +    print(r)
│ +print()
│ +print('=== blocked ===')
│ +for r in c.execute("select id,type,status,title,target,note from proposals where status='blocked'"):
│ +    print(r)
│ profiles/deepseek41flash/cache/scratch/m05_strings.py
│ @@ -0,0 +1,59 @@
│ +# -*- coding: utf-8 -*-
│ +import re
│ +
│ +strings = {
│ +    "title": "Dovana: kodėl vienas džiaugiasi, kitas ne",
│ +    "subtitle": "Tas pats daiktas gali nuliūdinti, jei jo nenorėjai",
│ +    "concept.title": "Jausmas priklauso nuo noro",
│ +    "concept.big_idea": "Jausmas priklauso ne vien nuo to, kas nutiko. Jis priklauso ir nuo to, ko žmogus norėjo.",
│ +    "concept.example": "Močiutė atnešė šaliką. Vienas anūkas apsidžiaugia, kitas tyliai padeda jį į šalį.",
│ +    "outcome1": "Pasakau, ko norėjo veikėjas.",
│ +    "outcome2": "Nusakau, kaip jausis žmogus, gavęs ne tai, ko norėjo.",
│ +    "outcome3": "Paaiškinu, kodėl ta pati dovana vienam džiugu, kitam ne.",
│ +    "reflect": "Kaip sužinotum, ar draugui patiks dovana? Ką darytum?",
│ +    "q1": "Dėžutėje kamuolys. Rėjus norėjo knygos. Kaip jausis Rėjus?",
│ +    "q1_o1": "Džiaugsis",
│ +    "q1_o2": "Nusimins",
│ +    "q1_o3": "Nieko nejaus",
│ +    "q1_hint": "Palygink, ko jis norėjo, su tuo, ką rado.",
│ +    "q1_why": "Jis norėjo knygos, o gavo kamuolį.",
│ +    "q2": "Ieva nori knygos, o Jonas nori kamuolio. Močiutė atnešė knygą. Kas džiaugsis?",
│ +    "q2_o1": "Ieva",
│ +    "q2_o2": "Jonas",
│ +    "q2_o3": "Abu vaikai",
│ +    "q2_hint": "Žiūrėk, ko norėjo kiekvienas vaikas.",
│ +    "q2_why": "Ieva norėjo knygos, todėl ji džiaugsis.",
│ +    "q3": "Klasėje rodomas filmas apie šunis. Viena mergaitė turi šunį, kita jo bijo. Ar filmas abiem bus smagus?",
│ +    "q3_o1": "Ne: vienai smagus, kitai baisus",
│ +    "q3_o2": "Taip, visiems bus smagus",
│ +    "q3_o3": "Ne, filmas nepatiks nė vienai",
│ +    "q3_hint": "Pagalvok, kaip kiekviena mergaitė žiūri į šunis.",
│ +    "q3_why": "Jausmas priklauso ir nuo to, ką žmogus jaučia šunims.",
│ +    "q4": "Dėžutėje pieštukai. Vienas vaikas juokiasi, kitas nuliūsta. Ką tai rodo?",
│ +    "q4_o1": "Jie norėjo skirtingų dovanų",
│ +    "q4_o2": "Pieštukai buvo sulaužyti",
│ +    "q4_o3": "Vienas vaikas blogesnis",
│ +    "q4_hint": "Tas pats daiktas, o jausmai skirtingi. Kodėl?",
│ +    "q4_why": "Skirtingi norai paaiškina skirtingus jausmus.",
│ +    "r_start": "Dėžutė uždaryta. Ko nori Rėjus?",
│ +    "r_predict": "Rėjus nori kamuolio. Pakeisi jo norą. Kas pasikeis? Pasakyk, tada keisk.",
│ +    "r_one": "Rėjus džiaugiasi. Ieva nusimena.",
│ +    "r_both": "Dabar abu nusimena.",
│ +    "r_same": "Viena dovana, du jausmai.",
│ +    "n_start": "Pirma pasakyk, ko nori Rėjus.",
│ +    "n_one": "Rėjus norėjo kamuolio. Ieva norėjo knygos.",
│ +    "n_both": "Pasikeitė tik noras. Dovana liko ta pati.",
│ +    "n_same": "Tas pats kamuolys. Vienas jo norėjo, kitas ne.",
│ +    "n_again": "Noras pasikeitė, pasikeitė ir jausmas.",
│ +}
│ +
│ +for k, v in strings.items():
│ +    parts = [p.strip() for p in re.split(r"[.?!]+\s*", v) if p.strip()]
│ +    mx = max(len(p.split()) for p in parts) if parts else 0
│ +    print(f"{k:16s} chars={len(v):3d} words_max={mx:2d} | {v}")
│ +
│ +print("\n-- per ilgi sakiniai (>10 z.) --")
│ +for k, v in strings.items():
│ +    for p in [p.strip() for p in re.split(r"[.?!]+\s*", v) if p.strip()]:
│ +        if len(p.split()) > 10:
│ +            print(f"{k}: {len(p.split())} | {p}")
│ research/wiki/grades/01/metodai.md
│ @@ -266,6 +266,75 @@
│
│  **Šaltiniai.** Rigal, R. (1994). Right-left orientation: Development of correct use of right and left terms. *Perceptual and Motor Skills, 79*(3), 1259–1278. https://doi.org/10.2466/pms.1994.79.3.1259 · Rigal, R. (1996). Right-left orientation, mental rotation, and perspective-taking. *Perceptual and Motor Skills, 83*(3), 831–842. https://doi.org/10.2466/pms.1996.83.3.831 · Phinney, J. S., & Nummedal, S. G. (1979). Effects of left-right orientation and position reversals on spatial perspective taking in young children. *Perceptual and Motor Skills, 48*(1), 223–227. https://doi.org/10.2466/pms.1979.48.1.223 · Borke, H. (1975). Piaget's mountains revisited. *Developmental Psychology, 11*(2), 240–243. https://doi.org/10.1037/h0076459 · Way, J., & Cartwright, K. (2024). Turn left, turn right. *MERGA 46 Quick Reads*. http://merga.net.au/wp-content/uploads/2024/09/6-MERGA-46-2024-Quick-Reads_Way-and-Cartwright.pdf · Kocher, D., Sarmiento, L., Heller, S., Yang, Y., Kushnir, T., & Green, K. E. (2020). No, your other left! *IEEE ICDL-EpiRob 2020*, 1–6. https://doi.org/10.1109/icdl-epirob48136.2020.9278108 · Abarbanell, L., & Li, P. (2021). Unraveling the contribution of left-right language on spatial perspective taking. *Spatial Cognition & Computation, 21*(1), 1–38. https://doi.org/10.1080/13875868.2020.1825442
│
│ +### M-05 — Emocijos: tas pats įvykis, skirtingas jausmas
│ +
│ +**Data:** 2026-11-08 · **Tema:** `research/wiki/guidelines/klausimai.md:29` (atviras klausimas, ideator #128) · **Tikslas:** `content/lt/grade-01/gyvenimo-igudziai/01-dovana-ir-noras.json` · **Šaltinis:** `research/wiki/foundations/jausmas-ir-noras.md`
│ +
│ +**Viena didelė idėja.** Tas pats įvykis gali kelti skirtingus jausmus. Jausmas priklauso ne vien nuo to, kas nutiko, o ir nuo to, ko žmogus norėjo.
│ +
│ +**Kodėl modelis, o ne paveikslėlis.** Klausimas `klausimai.md:29` buvo toks: „gerai nupieštas paveikslėlis su abiem vaikais parodo tą patį“. Ne — parodo vieną būseną. Iš paveikslėlio, kuriame vienas vaikas juokiasi, o kitas nuliūsta prie tos pačios dovanos, vaikas negali pasakyti, **kas** tą skirtumą padarė: gal dovana gera ir tik antrasis nemoka džiaugtis, gal pirmasis jos prašė. Noras yra nematomas, todėl jo negalima nei parodyti, nei pakeisti paveikslėlyje. Modelis laiko tą patį įvykį (dovaną) ir keičia tik norą: pasikeičia vieno vaiko veidas, kito — ne. Toks palyginimas egzistuoja tik todėl, kad egzistuoja antra būsena, o paveikslėlyje jos nėra. Antras interaktyvumo argumentas — spėjimas prieš veiksmą (`r_predict`): paveikslėlis jo nereikalauja, modelis be jo praranda prasmę.
│ +
│ +**Kodėl būtent noras, o ne „visi jaučia skirtingai“.** Rieffe, Terwogt ir Cowan (2005) prašė 4, 6 ir 10 metų vaikų (n = 122) paaiškinti, kodėl veikėjas jaučiasi taip, kaip jaučiasi. Mentalinius paaiškinimus (norą, įsitikinimą) jauniausieji vartojo rečiausiai, o su amžiumi jų daugėjo; be to, noras dažniausiai paaiškindavo pyktį, džiaugsmą ir liūdesnį. Vadinasi, 6–7 metų vaikas noro kaip priežasties **jau ieško**, bet dar nepakankamai, kad ja paremtų sprendimą tada, kai noro niekas nepasakė. Todėl modelyje noras ne aiškinamas žodžiais, o parodomas burbulu ir duodamas keisti. Pons, Harris ir de Rosnay (2004), ištyrę 100 vaikų nuo 3 iki 11 metų, parodė, kad emocijų supratimas skyla į devynis komponentus, o trys tarpsniai išsidėsto hierarchiškai: vėlesnis remiasi ankstesniu. Todėl modulis ima patį pirmą ryšį (jausmas ← noras) ir sąmoningai neapima nei slepiamo jausmo, nei mišrių jausmų — tai vėlesni komponentai.
│ +
│ +**Klaidingos nuostatos ir kaip jos paneigiamos.**
│ +
│ +1. **„Kas gavo dovaną, tas džiaugiasi.“** Tai ta pati situacinė taisyklė, kurią vaikas taiko, kol noras nepastebėtas: įvykis matomas, noras — ne. Paneigiama modeliu: dovana ta pati, o Rėjaus veidas apsiverčia pakeitus tik jo norą; Ievos veidas nepakinta nė karto, nors dovana ta pati. Jei jausmą lemtų dovana, abu veidai keistųsi kartu.
│ +2. **„Jei vaikas nuliūdo, dovana buvo bloga (arba jis nedėkingas).“** Paneigiama palyginimu: ta pati dovana vienam džiugu, kitam ne, tad priežastis yra noras, ne daikto vertė ir ne vaiko būdas. Saarni (1979) rodo, kad slėpti nusivylimą vaikai išmoksta palaipsniui (6 → 10 metų), todėl atviras nusivylimas 6–7 metais yra amžių atitinkantis elgesys, o ne auklėjimo trūkumas.
│ +3. **„Vienas įvykis — vienas teisingas jausmas.“** Būtent šios nuostatos bijojo ideatorius, atmesdamas formą „situacija → viena teisinga emocija“ (`agents/log/ideator-2026-11-03T1655.md:116–117`). Modelyje teisingo jausmo įvykiui nėra: du vaikai prie tos pačios dovanos jaučiasi priešingai, ir abu jausmai teisingi. Užduotys klausia ne „ką jauti tu“, o „ką jaus tas žmogus, jei jis norėjo to“.
│ +
│ +**Tikslas sąmoningai kuklus.** Modulis nesiekia, kad vaikas nustatytų kito žmogaus jausmą. To negalima padaryti iš veido, o modelis to ir nerodo: jis rodo, nuo ko jausmas priklauso. Tikslas — kad vaikas pastebėtų ryšį „noras → jausmas“ ir turėtų vieną veiksmą, kuriuo tą ryšį pasitikrintų: pakeisti norą ir pažiūrėti. Widen ir Russell (2008) rodo, kad 6–7 metų vaiko emocijų žodynas dar platus (vienas žodis dengia kelis jausmus), todėl modulis vartoja tik du žodžius — *patenkintas* ir *nusiminęs* — ir nepretenduoja mokyti viso sąrašo.
│ +
│ +**Seka (konkretumas → modelis → simbolis → perkėlimas).**
│ +
│ +1. **Kūnas.** Mokytojas įvynioja du vienodus pieštukus į du vienodus popieriaus lapus. Prieš tai du savanoriai pasako, ko norėtų: vienas pieštuko, kitas trintuko. Abu gauna pieštuką. Vaikai pamato vieną juoką ir vieną nusivylimą prie vienodų dovanų. Tikslas: pajusti, kad jausmo nepaaiškina pats daiktas. (Savanoriai — mokytojo pasirinkti; niekas neklausia, kaip jaučiasi visas vaikas, ir niekas nieko neįrašo.)
│ +2. **Ekranas.** Rėjus ir Ieva prie stalo, tarp jų uždara dėžutė. Virš kiekvieno — norų burbulas su daiktu. Vaikas baksteli Rėjaus burbulą ir noras pasikeičia; dovaną atidengia mygtukas „Atidaryk dėžutę“. Tikslas: pamatyti, kad keičiasi vieno veidas, o kito ne.
│ +3. **Simbolis.** Po veidais atsiranda žodžiai „patenkintas“ ir „nusiminęs“, po jais — sakinys „Rėjus norėjo kamuolio. Ieva norėjo knygos.“ Vaikas perskaito ir pasako, kodėl jausmai skirtingi. Tikslas: jausmą įvardyti žodžiu, o priežastį — noru, ne daiktu.
│ +4. **Perkėlimas.** Ta pati taisyklė trijose situacijose be modelio: dovana, filmas, žaidimas. Tikslas: taikyti taisyklę ten, kur noro nesimato ir reikia paklausti.
│ +
│ +**Privalomas spėjimo žingsnis prieš pirmą keitimą.** `api.readout`: „Rėjus nori kamuolio. Pakeisi jo norą. Kas pasikeis? Pasakyk, tada keisk.“ Vaikas atsako balsu, tada baksteli. Be spėjimo modelis virsta generatoriumi: vaikas baksto tol, kol pamato įdomų veidą, ir ryšio nesudaro — tas pats pavojus kaip M-01–M-04 (`research/wiki/foundations/sujungti-dydziai.md`). Atsakymo variantų ekrane nėra: kintamasis turi likti vienas.
│ +
│ +**Simuliacijos specifikacija.** Komponentas `dovana-ir-noras`, failas `assets/js/sims/gyvenimas.js` (naujas; registruojamas `assets/js/registry.js` viena `import * as gyvenimas from "./sims/gyvenimas.js";` eilute ir `Object.assign({}, …, gyvenimas.SIMS)` sąraše). `config`:
│ +
│ +```json
│ +{ "gift": "kamuolys", "other": "knyga",
│ +  "fixed":   { "name": "Ieva", "wants": "knyga" },
│ +  "varying": { "name": "Rėjus", "wants": "kamuolys" },
│ +  "sentences": { "start": "…", "predict": "…", "one": "…", "both": "…", "same": "…" } }
│ +```
│ +
│ +| Būsena | Ką rodo | `readout` | `api.note` |
│ +|---|---|---|---|
│ +| pradžia (dėžutė uždaryta, Rėjus nori kamuolio) | du vaikai, du norų burbulai, uždara dėžutė | „Dėžutė uždaryta. Ko nori Rėjus?“ | „Pirma pasakyk, ko nori Rėjus.“ |
│ +| atidaryta, Rėjus nori kamuolio | Rėjus šypsosi, Ieva nusimena, po veidais žodžiai | „Rėjus džiaugiasi. Ieva nusimena.“ | „Rėjus norėjo kamuolio. Ieva norėjo knygos.“ |
│ +| Rėjus nori knygos (dovana ta pati) | abu nusimena; Ievos veidas nepakito | „Dabar abu nusimena.“ | „Pasikeitė tik noras. Dovana liko ta pati.“ |
│ +| grįžta į kamuolį | kaip antra būsena | „Rėjus džiaugiasi. Ieva nusimena.“ | „Noras pasikeitė, pasikeitė ir jausmas.“ |
│ +| abi būsenos matytos (palyginimas) | abu veidai ir abu sakiniai vienu metu | „Viena dovana, du jausmai.“ | „Tas pats kamuolys. Vienas jo norėjo, kitas ne.“ |
│ +
│ +- **Vienas kintamasis:** `varying.wants` ∈ {`kamuolys`, `knyga`}. Vaikas keičia tik tai, ko nori Rėjus. `gift` yra fiksuotas konfigūracijoje ir vaiko nekeičiamas; „Atidaryk dėžutę“ yra žingsnis, o ne antra reikšmė. Ievos noras nekinta — jis yra kontrolinė pora, rodanti, kad veidai kinta ne kartu.
│ +- **Išdėstymas 360 px:** dvi veikėjų plokštės po 148 px ir 16 px tarpas = 312 px iš 328 px. Veidas 72 px, norų burbulas 56 × 56 px, dėžutė 96 × 72 px. Trys eilutės: veidai, burbulai, sakiniai; jokio horizontalaus slinkimo.
│ +- **Įėjimai:** norų burbulas — `[role=button]` su `tabindex="0"`, `aria-pressed` ir `aria-label` „Rėjus nori kamuolio. Pakeisk norą.“; „Atidaryk dėžutę“ / „Uždaryk“ 328 × 56 px; „Iš naujo“ ≥ 48 px. Klaviatūra: `Tab` tarp trijų taikinių, `Enter`/`Space` aktyvuoja, `←`/`→` perjungia norą, kai burbulas fokusuotas.
│ +- **Grįžtamasis ryšys** — iškart po veiksmo (≤ 1 kadras). `readout` įvardija būseną, `api.note` — vieną sakinį apie veiksmą. `api.progress({ correct: true })` — vieną kartą, kai **abiem** norais dėžutė atidaryta (t. y. po palyginimo), o ne po pirmo pakeitimo (LL-29).
│ +- **Garsas** — penkios nustatytos frazės, lygiai tokios kaip `readout` lentelėje; jos laikomos `config.sentences`, o ne simuliacijos kode (LL-42), todėl `scripts/generate_audio.py` jas mato. `api.note` garsiai neskaitomas (mažas manifestas). Generuojant reikia abiejų variantų (`n`, `s`).
│ +- **Prieinamumas:** scenos SVG `role="img"`, `aria-label` aprašo, ką rodo kiekvienas vaikas ir ką jis nori, bet nekartoja `readout` sakinio: „Rėjus šypsosi, jo burbule kamuolys. Ieva nusimena, jos burbule knyga. Dėžutėje kamuolys.“ `readout` turi `aria-live="polite"`. Veido išraiška niekada nėra vienintelis informacijos nešėjas: šalia visada yra žodis ir burbulas.
│ +- **Jokių laikmačių, ėjimų limito, „game over“.** Nusivylimas yra informacija, ne bauda; vaikas norą keičia tiek kartų, kiek nori.
│ +
│ +**Užduotys.**
│ +
│ +| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
│ +|---|---|---|---|---|---|
│ +| 1 | atpažinimas | „Dėžutėje kamuolys. Rėjus norėjo knygos. Kaip jausis Rėjus?“ — Džiaugsis / Nusimins / Nieko nejaus | Nusimins (1) | „Džiaugsis“ — sprendžia iš dovanos, ne iš noro | „Palygink, ko jis norėjo, su tuo, ką rado.“ |
│ +| 2 | taikymas | „Ieva nori knygos, o Jonas nori kamuolio. Močiutė atnešė knygą. Kas džiaugsis?“ — Ieva / Jonas / Abu vaikai | Ieva (0) | „Abu vaikai“ — dovana gera, vadinasi, visiems | „Žiūrėk, ko norėjo kiekvienas vaikas.“ |
│ +| 3 | perkėlimas | „Klasėje rodomas filmas apie šunis. Viena mergaitė turi šunį, kita jo bijo. Ar filmas abiem bus smagus?“ — Ne: vienai smagus, kitai baisus / Taip, visiems bus smagus / Ne, filmas nepatiks nė vienai | Ne: vienai smagus, kitai baisus (0) | „Taip, visiems bus smagus“ — įvykis priskiriamas visiems | „Pagalvok, kaip kiekviena mergaitė žiūri į šunį.“ |
│ +| 4 | praplėtimas (`optional: true`) | „Dėžutėje pieštukai. Vienas vaikas juokiasi, kitas nuliūsta. Ką tai rodo?“ — Jie norėjo skirtingų dovanų / Pieštukai buvo sulaužyti / Vienas vaikas blogesnis | Jie norėjo skirtingų dovanų (0) | „Vienas vaikas blogesnis“ — jausmą paverčia žmogaus vertinimu | „Tas pats daiktas, o jausmai skirtingi. Kodėl?“ |
│ +
│ +**Refleksija.** „Kaip sužinotum, ar draugui patiks dovana? Ką darytum?“ Klausiama žodžiu, nevertinama; laukiamas atsakymas — paklausti. Šis klausimas yra ir modelio ribos tąsa: burbulas ekrane parodo norą, o realiame gyvenime noro nesimato.
│ +
│ +**Modelio ribos (pasakomos vaikui ir mokytojui).** Modelis žino, ko vaikas nori, nes noras nupieštas burbule; realiame gyvenime taip nebūna — todėl reikia klausti, o ne spėti iš veido. Modelis rodo tik du jausmus (*patenkintas*, *nusiminęs*) ir tik vieną priežastį (noras); tikras jausmas priklauso ir nuo nuovargio, netikėtumo, ankstesnės patirties, o kartais du jausmai būna kartu — to modelis nevaizduoja ir to neslepia. Modelis taip pat nevaizduoja slėpiamo jausmo (kai žmogus šypsosi, nors jam liūdna): tai atskiras komponentas (Pons ir kt., 2004), kuriam reikės atskiro modulio, ir jis 6–7 metais dar tik formuojasi (Harris ir kt., 1986; Saarni, 1979). Todėl teisingas atsakymas modulyje nėra „įvaldymo“ įrodymas, o modelyje parodytas ryšys nėra taisyklė „visada taip“.
│ +
│ +**Ką tai reiškia modulio autoriui.** `title` — „Dovana: kodėl vienas džiaugiasi, kitas ne“ (41 simbolis); `subtitle` — „Tas pats daiktas gali nuliūdinti, jei jo nenorėjai“ (50); `minutes` — 9; trys `outcomes`: „Pasakau, ko norėjo veikėjas.“, „Nusakau, kaip jausis žmogus, gavęs ne tai, ko norėjo.“, „Paaiškinu, kodėl ta pati dovana vienam džiugu, kitam ne.“; `concept.title` — „Jausmas priklauso nuo noro“ (26); `concept.big_idea` — „Jausmas priklauso ne vien nuo to, kas nutiko. Jis priklauso ir nuo to, ko žmogus norėjo.“ (88); `concept.steps` — keturi žingsniai iš sekos 1–4; `concept.example` — „Močiutė atnešė šaliką. Vienas anūkas apsidžiaugia, kitas tyliai padeda jį į šalį.“; `teacher.offline` — du vienodi pieštukai dviejuose vienoduose popieriaus lapuose ir du savanoriai, prieš tai pasakę, ko norėtų; po to pokalbis „kodėl vienas džiaugėsi, o kitas ne“; `teacher.misconceptions` — trys nuostatos iš šio skyriaus; `sim` — `{ "component": "dovana-ir-noras", "config": { "gift": "kamuolys", "other": "knyga", "fixed": { "name": "Ieva", "wants": "knyga" }, "varying": { "name": "Rėjus", "wants": "kamuolys" } } }`. Moduliui reikia **naujos krypties** `gyvenimo-igudziai` (`content/lt/grade-01/index.json`: `title` „Gyvenimo įgūdžiai“, `emoji` „💛“, `intro` „Jausmai ir santykiai: nuo savęs prie kito.“) ir įrašo `path.json`; tai kūrėjo darbas, ne metodo dalis. Numeris `01-` laisvas, nes kryptis nauja.
│ +
│ +**Šaltiniai.** Pons, F., Harris, P. L., & de Rosnay, M. (2004). Emotion comprehension between 3 and 11 years: Developmental periods and hierarchical organization. *European Journal of Developmental Psychology, 1*(2), 127–152. https://doi.org/10.1080/17405620344000022 · Rieffe, C., Terwogt, M. M., & Cowan, R. (2005). Children's understanding of mental states as causes of emotions. *Infant and Child Development, 14*(3), 259–272. https://doi.org/10.1002/icd.391 · Widen, S. C., & Russell, J. A. (2008). Children acquire emotion categories gradually. *Cognitive Development, 23*(2), 291–312. https://doi.org/10.1016/j.cogdev.2008.01.002 · Saarni, C. (1979). Children's understanding of display rules for expressive behavior. *Developmental Psychology, 15*(4), 424–429. https://doi.org/10.1037/0012-1649.15.4.424 · Harris, P. L., Donnelly, K., Guz, G. R., & Pitt-Watson, R. (1986). Children's understanding of the distinction between real and apparent emotion. *Child Development, 57*(4), 895–909. https://doi.org/10.2307/1130366
│ +
│  ## Atviros prielaidos
│
│  - _(kas šioje klasėje dar nepatikrinta; žr. [[../../guidelines/klausimai|klausimus]])_
│ research/wiki/foundations/jausmas-ir-noras.md
│ @@ -0,0 +1,56 @@
│ +---
│ +title: "Jausmas ir noras: priežastis, kurios nesimato"
│ +tipas: fundamentai
│ +temos: [emocijos, noras, priežastis, simuliacijos, pradinė mokykla]
│ +amzius: "6-7"
│ +atnaujinta: 2026-11-08
│ +saltiniai: 5
│ +---
│ +
│ +# Jausmas ir noras: priežastis, kurios nesimato
│ +
│ +## Pagrindinė idėja
│ +
│ +Tas pats įvykis gali kelti skirtingus jausmus. Skirtumą daro tai, ko žmogus norėjo, o ne vien tai, kas nutiko. Bėda ta, kad įvykis matomas (dovana, filmas, žaidimas), o noras — ne. Kol noras nepasakytas, vaikui lieka vienintelis matomas paaiškinimas: įvykis. Todėl 6–7 metų vaikas, paklaustas „kaip jis jausis?“, atsako pagal tai, ką mato, o ne pagal tai, ko žmogus norėjo.
│ +
│ +Tai ne vaiko trūkumas, o informacijos trūkumas. Noras yra mentalinė būsena: jos negalima pamatyti, ją galima tik pasakyti arba numanyti. Todėl bet kuri priemonė, kuri norą tik aprašo žodžiais, pralaimi tam, ką vaikas mato. Norą reikia padaryti matomą ir keičiamą.
│ +
│ +## Ką rodo tyrimai
│ +
│ +**Emocijų supratimas skyla į komponentus, ir jie ateina ne iš karto.** Pons, Harris ir de Rosnay (2004) ištyrė 100 vaikų nuo 3 iki 11 metų devyniais komponentais — nuo veido išraiškos atpažinimo iki moralinių jausmų. Autoriai rado aiškų pagerėjimą su amžiumi kiekviename komponente, tris raidos tarpsnius ir hierarchinį ryšį tarp jų: vėlesnis komponentas remiasi ankstesniu. Tai reiškia, kad negalima mokyti slėpiamo jausmo ar mišrių jausmų tam, kas dar netvirtai sieja jausmą su paprasčiausia jo priežastimi.
│ +
│ +**Noro kaip priežasties vaikas ieško, bet dar ne visada ja remiasi.** Rieffe, Terwogt ir Cowan (2005) prašė 4, 6 ir 10 metų vaikų (n = 122) paaiškinti, kodėl veikėjas jaučiasi taip, kaip jaučiasi — tiek įprastai, tiek netikėtai. Mentalinius paaiškinimus (norą, įsitikinimą) jauniausieji vartojo rečiausiai, o su amžiumi jų daugėjo. Be to, paaiškinimas priklausė nuo jausmo: pyktį, džiaugsmą ir liūdesnį vaikai aiškino noru, o baimę — įsitikinimu. Vadinasi, noras yra tas kelias, kuriuo 6–7 metų vaikas jau eina; modelyje jį reikia sustiprinti, o ne pakeisti.
│ +
│ +**Žodis dar platus.** Widen ir Russell (2008) parodė, kad vaikų emocijų kategorijos siaurėja palaipsniui: mažesnis vaikas vienu žodžiu dengia kelis jausmus ir tik vėliau pradeda skirti, pavyzdžiui, susijaudinimą nuo džiaugsmo. Todėl modulyje, kuriame aiškinama priežastis, reikia kuo mažiau žodžių: du gerai suprantami jausmai duoda daugiau negu penki iš dalies suprantami.
│ +
│ +**Atviras nusivylimas yra amžiaus norma.** Saarni (1979) tyrė 6, 8 ir 10 metų vaikus ir parodė, kad supratimas, jog jausmo galima nerodyti, stiprėja su amžiumi. Harris, Donnelly, Guz ir Pitt-Watson (1986) atskyrė tikrą ir rodomą jausmą: 6-mečiai šį skirtumą jau skiria, 4-mečiai — dar ne. Praktinė išvada: 6–7 metų vaikas, gavęs dovaną ir jos nenorėdamas, gali nuliūsti atvirai. Tai informacija apie norą, o ne apie auklėjimą, ir modelis turi tai pasakyti, nes kitaip mokytojas klaidą palaikys elgesio problema.
│ +
│ +## Ką tai reiškia SUPRASK platformai
│ +
│ +1. **Modelis turi keisti tai, ko nesimato.** Įvykis fiksuojamas (dovana ta pati), o kintamasis yra noras. Jei kinta ir įvykis, ir noras, vaikas negali pasakyti, kuris iš jų ką padarė.
│ +2. **Reikia kontrolinės poros.** Antras veikėjas, kurio noras nekinta, parodo, kad veidai kinta ne kartą su įvykiu: vienas veidas apsiverčia, kitas — ne.
│ +3. **Nėra „teisingo“ jausmo įvykiui.** Du vaikai prie tos pačios dovanos jaučiasi priešingai, ir abu teisūs. Tai atsakymas į `guidelines/klausimai.md:29` abejonę dėl formos „situacija → viena teisinga emocija“.
│ +4. **Niekas neklausia vaiko apie jo paties jausmus.** Užduotys klausia apie veikėją, o refleksija — apie veiksmą („ko paklaustum“). Taip nepatenkama į asmens duomenų sritį ir neišugdoma nuostata, kad yra „teisingas“ jausmas.
│ +5. **Spėjimas prieš veiksmą būtinas.** Paveikslėlis spėjimo nereikalauja, modelis be jo virsta mygtukų spaudymu: vaikas keistų norą tol, kol veidas atrodys įdomiai.
│ +6. **Modelio ribos sakomos atvirai.** Modelis „žino“ norą, nes jis nupieštas burbule. Realiame gyvenime noro nesimato — todėl refleksija klausia, ko reikėtų paklausti. Be šio sakinio modelis mokytų manyti, kad kito žmogaus norą galima perskaityti iš veido.
│ +7. **Tikslas formuluojamas kukliai.** Modulis neįrodo, kad vaikas nustatys kito jausmą; jis parodo, nuo ko jausmas priklauso. Slėpiamas jausmas ir mišrūs jausmai lieka kitiems komponentams (Pons ir kt., 2004).
│ +
│ +## Ko šis įrašas nedaro
│ +
│ +Jis neįrodo, kad būtent šis modelis pagerina emocijų supratimą — tokio tyrimo apie šią simuliaciją nėra, o Pons ir kt. duomenys yra apie raidą, ne apie mokymą. Jis taip pat nepateisina emocijų temos kaip „labai aukštos“ vien dėl to, kad ji svarbi: interaktyvumo nauda turi būti parodoma kiekvieną kartą, kaip ir kitose temose. Ryšys su tikrais jausmais klasėje (pyktis, baimė) čia neaprašytas — tai atskira psichologinio saugumo sritis.
│ +
│ +## Susieti
│ +
│ +- [[kognityvine-apkrova]] — kodėl du jausmai ir vienas kintamasis, o ne visas sąrašas
│ +- [[simuliacijos-ir-modeliai]] — modelio ribų pasakymas
│ +- [[interaktyvumo-principai]] — grįžtamasis ryšys, taikiniai, jokių laikmačių
│ +- [[saziningas-dalijimasis]] — klausimas „kaip jaustųsi draugas“ kaip refleksijos dalis
│ +- [[../grades/01/metodai|1 klasės metodai]] — M-05 „Emocijos: tas pats įvykis, skirtingas jausmas“
│ +
│ +## Šaltiniai
│ +
│ +1. Pons, F., Harris, P. L., & de Rosnay, M. (2004). Emotion comprehension between 3 and 11 years: Developmental periods and hierarchical organization. *European Journal of Developmental Psychology, 1*(2), 127–152. https://doi.org/10.1080/17405620344000022
│ +2. Rieffe, C., Terwogt, M. M., & Cowan, R. (2005). Children's understanding of mental states as causes of emotions. *Infant and Child Development, 14*(3), 259–272. https://doi.org/10.1002/icd.391
│ +3. Widen, S. C., & Russell, J. A. (2008). Children acquire emotion categories gradually. *Cognitive Development, 23*(2), 291–312. https://doi.org/10.1016/j.cogdev.2008.01.002
│ +4. Saarni, C. (1979). Children's understanding of display rules for expressive behavior. *Developmental Psychology, 15*(4), 424–429. https://doi.org/10.1037/0012-1649.15.4.424
│ +5. Harris, P. L., Donnelly, K., Guz, G. R., & Pitt-Watson, R. (1986). Children's understanding of the distinction between real and apparent emotion. *Child Development, 57*(4), 895–909. https://doi.org/10.2307/1130366
│ research/wiki/grades/01/metodai.md
│ @@ -3,7 +3,7 @@
│  tipas: metodai
│  klase: 1
│  amzius: "6–7"
│ -atnaujinta: 2026-11-07
│ +atnaujinta: 2026-11-08
│  ---
│
│  # 1 klasės metodai
│ research/wiki/foundations/README.md
│ @@ -13,6 +13,7 @@
│  | [[zenklas-kaip-busena]] | lygybės ženklas kaip būsena, operaciniai šablonai, modelio išdėstymas | modelis rodo abi lygybės kryptis ir bent vieną atvejį be vieno skaičiaus pusėje |
│  | [[dydis-ir-skaicius]] | dydis ir kiekis prieš užrašytą vertę, moneta kaip pavyzdys | jei daiktas neša skaičių, modelis parodo jo poveikį atskirai; grafika neprieštarauja taisyklei |
│  | [[kryptis-ir-ziurovo-pozicija]] | kairė/dešinė kaip kūno, o ne kambario savybė; įsisavinimo tvarka | seka: savo kūnas → veikėjas žiūri ta pačia kryptimi → žiūri į vaiką; žymė sukasi su kūnu |
│ +| [[jausmas-ir-noras]] | jausmo priežastis yra noras, o noro nesimato; emocijų komponentai | įvykis fiksuotas, noras keičiamas; antra veikėjas kaip kontrolė; nieko neklausiama apie vaiko jausmus |
│  | [[ivertinimas-ir-growth-mindset]] | grįžtamasis ryšys, augimo mąstysena ir jos ribos | `hint` + `why` privalomi, jokių balų |
│
│  ## Žaidimų teorijos dalis
│ research/wiki/foundations/README.md
│ @@ -13,7 +13,7 @@
│  | [[zenklas-kaip-busena]] | lygybės ženklas kaip būsena, operaciniai šablonai, modelio išdėstymas | modelis rodo abi lygybės kryptis ir bent vieną atvejį be vieno skaičiaus pusėje |
│  | [[dydis-ir-skaicius]] | dydis ir kiekis prieš užrašytą vertę, moneta kaip pavyzdys | jei daiktas neša skaičių, modelis parodo jo poveikį atskirai; grafika neprieštarauja taisyklei |
│  | [[kryptis-ir-ziurovo-pozicija]] | kairė/dešinė kaip kūno, o ne kambario savybė; įsisavinimo tvarka | seka: savo kūnas → veikėjas žiūri ta pačia kryptimi → žiūri į vaiką; žymė sukasi su kūnu |
│ -| [[jausmas-ir-noras]] | jausmo priežastis yra noras, o noro nesimato; emocijų komponentai | įvykis fiksuotas, noras keičiamas; antra veikėjas kaip kontrolė; nieko neklausiama apie vaiko jausmus |
│ +| [[jausmas-ir-noras]] | jausmo priežastis yra noras, o noro nesimato; emocijų komponentai | įvykis fiksuotas, noras keičiamas; antras veikėjas kaip kontrolė; nieko neklausiama apie vaiko jausmus |
│  | [[ivertinimas-ir-growth-mindset]] | grįžtamasis ryšys, augimo mąstysena ir jos ribos | `hint` + `why` privalomi, jokių balų |
│
│  ## Žaidimų teorijos dalis
│ research/wiki/guidelines/klausimai.md
│ @@ -26,7 +26,8 @@
│
│  ## Gyvenimo įgūdžiai (1 klasė)
│
│ -- [ ] **Ar emocijų atpažinimą galima parodyti modeliu, o ne paveikslėliu, ir neklausiant vaiko apie savo jausmus?** Paleidimas #2 atmetė formą „situacija → viena teisinga emocija“, nes ji pati kuria klaidingą nuostatą, o jausmo priskyrimas sau liečia asmens duomenis (`agents/log/ideator-2026-11-03T1655.md:116–117`). Neeilinis variantas, kurio dar nevertinome: tas pats įvykis dviem skirtingiems vaikams (vienas mėgsta šunis, kitas bijo) — modelis rodytų, kad įvykis jausmo neapsprendžia, ir nė vienas atsakymas nebūtų „neteisingas“. Abejonė ta pati, dėl kurios tema laikoma neatidaryta: gerai nupieštas paveikslėlis su abiem vaikais parodo tą patį, tad gairių 2 klausimas (interaktyvumo nauda) lieka neatsakytas, o be jo projekto „labai aukšta“ reitingas (`kti-dalykai-1-klase.md:150`) nepakanka. Kol neatsakyta, emocijų modulis ne kuriamas (ideator, paleidimas #128).
│ +- [x] **Ar emocijų atpažinimą galima parodyti modeliu, o ne paveikslėliu, ir neklausiant vaiko apie savo jausmus?** Paleidimas #2 atmetė formą „situacija → viena teisinga emocija“, nes ji pati kuria klaidingą nuostatą, o jausmo priskyrimas sau liečia asmens duomenis (`agents/log/ideator-2026-11-03T1655.md:116–117`). Neeilinis variantas, kurio dar nevertinome: tas pats įvykis dviem skirtingiems vaikams (vienas mėgsta šunis, kitas bijo) — modelis rodytų, kad įvykis jausmo neapsprendžia, ir nė vienas atsakymas nebūtų „neteisingas“. Abejonė ta pati, dėl kurios tema laikoma neatidaryta: gerai nupieštas paveikslėlis su abiem vaikais parodo tą patį, tad gairių 2 klausimas (interaktyvumo nauda) lieka neatsakytas, o be jo projekto „labai aukšta“ reitingas (`kti-dalykai-1-klase.md:150`) nepakanka. Kol neatsakyta, emocijų modulis ne kuriamas (ideator, paleidimas #128).
│ +  **Atsakyta 2026-11-08 (metodininkas #133).** Paveikslėlis parodo **vieną** būseną, todėl iš jo negalima pasakyti, kas padarė skirtumą: dovana ar noras. Noras yra nematomas, tad jo negalima nei parodyti, nei pakeisti — modelis laiko įvykį tą patį ir keičia tik norą, o antras veikėjas (nekintantis noras) parodo, kad veidai kinta ne kartą su įvykiu (kontrolinė pora). Be to, modelis reikalauja spėjimo prieš veiksmą, ko paveikslėlis nereikalauja. Forma „situacija → viena teisinga emocija“ atsisakyta: modelyje du vaikai prie tos pačios dovanos jaučiasi priešingai ir abu teisūs, o vaiko apie jo paties jausmus niekas neklausia (užduotys apie veikėją, refleksija — apie veiksmą). Metodas: `grades/01/metodai.md#M-05`, pagrindas: [[../foundations/jausmas-ir-noras|jausmas-ir-noras]] (Pons ir kt., 2004; Rieffe ir kt., 2005; Widen ir Russell, 2008; Saarni, 1979; Harris ir kt., 1986).
│
│  ## Žaidimų teorija
│
│ research/wiki/guidelines/pilotai.md
│ @@ -153,3 +153,12 @@
│  - **Kaip matuojame:** (1) ar vaikas po pirmo ėjimo žemyn savais žodžiais pasako, kad pasikeitė dešimtis, o pabaiga liko ta pati; (2) ar perkėlimo užduotyje (po 46, trys žingsniai nuo 63) renkasi dešimčių žingsnį, o ne „sekantį skaičių“; (3) ar praplėtimo užduotį su dviem žingsniais į kairę ir vienu žemyn sprendžia dviem atskirais pokyčiais. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
│  - **Rezultatas:** dar nėra. Techninė patikra: `validate_content.py --strict` 0 klaidų, 0 įspėjimų (visa platforma); `check_audio.py` 427 tekstai × 2 įrašai (Piper); `check_docs_facts.py` 0 neatitikčių; `check_art.py`, `check_ui.py`, `check_agents.py`, `check_lessons.py` 0 klaidų; `check_language.py --grade 1` naujame modulyje 0 pastabų; `check_view.py` (19-simto-skaiciu-lentele, 1440 + 390 px) `problems: []`, pilnas 1 klasės bėgimas — 54 patikros (27 maršrutai × 2 plotai), 0 problemų. Playwright zondas (360×740 ir 390×844, 85 teiginiai kiekviename): spėjimas 20 palyginamas su įvykiu („Žemyn nuo 19 yra 29“), `simDone` neįrašytas po pirmos ir trečios krypčių ir įrašytas po ketvirtos (LL-29), eilutės galas neleidžia judėti ir paaiškinamas, „Iš naujo“ pažangos neištrina, 0 px slinkties, 0 mažų taikinių, 0 konsolės klaidų; 320/360/390/1440 px nė vienas langelis nekerta savo dėžės (`scroll == client`).
│  - **Sprendimas:** laukiama duomenų. Jei vaikai lentelę vis tiek skaito kaip knygą, stiprinamas pirmas ėjimas (žemyn rodoma visa eilutė paryškinama ilgiau), o ne pridedama teksto; jei 100-o lentelė telefone atrodo per smulki, modelis pradedamas nuo trijų eilučių ištraukos su ta pačia geometrija, o visa lentelė paliekama mokytojo veiklai.
│ +
│ +### P-017 — Emocijos: įvykis fiksuotas, noras keičiamas, antras veikėjas kaip kontrolė
│ +
│ +- **Data:** 2026-11-08
│ +- **Hipotezė:** jei modelyje dovana lieka ta pati, o vaikas keičia tik vieno veikėjo norą, tai 6–7 m. vaikas pamato, kad veidas kinta nuo noro, o ne nuo įvykio: pirmo veikėjo veidas apsiverčia, antrojo (kurio noras nekinta) — ne. Jei prieš kiekvieną keitimą dar prašoma spėjimo, vaikas ryšį sudaro pats, o ne perskaito jį iš ekrano. Tai atsakymas į `guidelines/klausimai.md:29` abejonę, kad „paveikslėlis parodo tą patį“ (P2 — veiksmas prieš paaiškinimą; T2.2 — supratimas naujoje situacijoje; Rieffe ir kt., 2005; Pons ir kt., 2004).
│ +- **Ką keičiame:** komponentas `dovana-ir-noras` (modulis `01-dovana-ir-noras`, nauja kryptis `gyvenimo-igudziai`). Tai pirmas modelis, kuriame kintamasis yra **nematoma** būsena (noras), o matomas įvykis fiksuojamas; ir pirmas, kuriame antras veikėjas sąmoningai laikomas nekintantis — jis yra kontrolinė pora, parodanti, kad veidai kinta ne kartą su įvykiu. Noras rodomas burbulu, o modelio ribose pasakyta, kad realiai noro nesimato ir reikia paklausti. Nė viena užduotis neklausia vaiko apie jo paties jausmus.
│ +- **Kaip matuojame:** (1) ar vaikas po noro pakeitimo savais žodžiais pasako, kad pasikeitė noras, o dovana liko ta pati; (2) ar perkėlimo užduotyje (filmas apie šunis) nurodo, kad vienai bus smagu, kitai baisu, o ne „visiems smagu“; (3) ar refleksijoje pasako, kad reikia paklausti, o ne spėti iš veido. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
│ +- **Rezultatas:** dar nėra. Metodas įrašytas, modulis dar nesukurtas; techninė patikra bus įrašyta jį įgyvendinus.
│ +- **Sprendimas:** laukiama duomenų. Jei vaikai vis tiek atsako pagal dovaną, stiprinamas spėjimo žingsnis ir antrojo veikėjo nekintamumas (abu veidai rodomi vienu metu ilgiau), o ne pridedama teksto; jei „noras“ 6–7 m. vaikui pasirodo per abstraktus, burbulas keičiamas konkrečiu daiktu veikėjo rankoje, o sąvoka lieka neįvardyta.
│ research/wiki/changelog.md
│ @@ -1,6 +1,16 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-08 (08:40) — Emocijų metodas M-05: jausmas priklauso nuo noro
│ +
│ +- **`grades/01/metodai.md`** — naujas metodas M-05 „Emocijos: tas pats įvykis, skirtingas jausmas“ (tema atidaryta kaip `guidelines/klausimai.md:29`): keturių žingsnių seka, simuliacijos `dovana-ir-noras` penkios būsenos, keturios užduotys su tipinėmis klaidomis, modelio ribos, argumentas, kodėl paveikslėlis čia nepakanka.
│ +- **`foundations/jausmas-ir-noras.md`** — naujas įrašas: jausmo priežastis yra noras, o noro nesimato; emocijų supratimas skyla į komponentus (Pons ir kt., 2004), mentaliniai paaiškinimai stiprėja su amžiumi (Rieffe ir kt., 2005), atviras nusivylimas 6–7 m. yra amžiaus norma (Saarni, 1979).
│ +- **`foundations/README.md`** — indekso eilutė.
│ +- **`guidelines/klausimai.md:29`** — klausimas apie emocijų modelį pažymėtas atsakytu: interaktyvumo nauda parodoma fiksuotu įvykiu ir keičiamu noru, o ne paveikslėliu.
│ +- **`guidelines/pilotai.md`** — P-017 (nematomas kintamasis + antras veikėjas kaip kontrolinė pora).
│ +- **Šaltinis:** Pons, Harris & de Rosnay (2004) https://doi.org/10.1080/17405620344000022 · Rieffe, Terwogt & Cowan (2005) https://doi.org/10.1002/icd.391 · Widen & Russell (2008) https://doi.org/10.1016/j.cogdev.2008.01.002 · Saarni (1979) https://doi.org/10.1037/0012-1649.15.4.424 · Harris ir kt. (1986) https://doi.org/10.2307/1130366
│ +- **Poveikis platformai:** būsimas modulis `content/lt/grade-01/gyvenimo-igudziai/01-dovana-ir-noras.json` ir nauja kryptis `gyvenimo-igudziai`. Taisyklė „kintamasis turi būti tai, ko nesimato, o matomas įvykis fiksuojamas“ taikoma ir kitiems socialiniams modeliams.
│
│  ## 2026-11-08 (06:13) — Publikavimo patikra #122: repo 28 / paskelbta 28, svetainė baitais lygi HEAD
│
│ research/wiki/grades/01/metodai.md
│ @@ -213,7 +213,7 @@
│
│  1. **„Kairė visiems ta pati pusė.“** Vaikas savo kairę perkelia veikėjui, kuris žiūri į jį. Rigal (1996) šį atsakymo būdą aprašo kaip būdingą mažiausiems ir nykstantį su amžiumi. Paneigiama pačiu modeliu: vabaliukui atsisukus į vaiką, žymė „kairė“ persoka į kitą ekrano pusę. Jei kairė būtų kambario savybė, posūkis jos nepajudintų.
│  2. **„Pasukti į kairę visada reiškia į kairę ekrano pusę.“** Tai ta pati klaida, tik apie komandą. Kai vabaliukas žiūri į vaiką, „Pasuk kairėn“ veda į dešinę ekrano pusę. Paneigiama dviem būsenomis, kurias vaikas pasiekia pats.
│ -3. **„Pasukti reiškia žengti į šoną.“** Way ir Cartwright (2024) individualiai kalbino 36 pirmokus: tik keturi visiškai teisingai atliko abi užduotis, penki negalėjo įvykdyti nė vieno krypties nurodymo, o ne daugelis robotui apskritai davė komandas „kairėn“/„dešinėn“ — dažniau rodė gestais arba sakė „eik ten“. Tą patį žodį „pasuk“ vaikai suprato skirtingai: vieni pasisuko vietoje, kiti žengė į šoną. Todėl modelyje posūkis vyksta **vietoje** (vabaliukas lieka tame pačiame langelyje), o žingsnis yra atskiras mygtukas su atskiru sakiniu.
│ +3. **„Pasukti reiškia žengti į šoną.“** Way ir Cartwright (2024) individualiai kalbino 36 pirmokus: tik keturi visiškai teisingai atliko abi užduotis, penki negalėjo įvykdyti nė vieno krypties nurodymo, o dauguma robotui komandų „kairėn“/„dešinėn“ iš viso nesakė — dažniau rodė gestais arba sakė „eik ten“. Tą patį žodį „pasuk“ vaikai suprato skirtingai: vieni pasisuko vietoje, kiti žengė į šoną. Todėl modelyje posūkis vyksta **vietoje** (vabaliukas lieka tame pačiame langelyje), o žingsnis yra atskiras mygtukas su atskiru sakiniu.
│  4. **„Jei nemoka, vadinasi, dar per mažas.“** Borke (1975) parodė, kad supaprastinus perspektyvos užduotį net trejų metų vaikai atsako ne vien iš savo pozicijos. Nesėkmė labiau priklauso nuo užduoties sandaros negu nuo vaiko savybės, todėl modelis sąmoningai paprastas: vienas veikėjas, viena sąsaja, trys ant trijų langeliai.
│
│  **Seka (konkretumas → modelis → simbolis → perkėlimas).**
│ research/wiki/foundations/kryptis-ir-ziurovo-pozicija.md
│ @@ -19,7 +19,7 @@
│
│  **Žodžių tvarka skiriasi nuo suvokimo tvarkos.** Rigal (1994) tyrė 406 vaikus. Skirti kairę nuo dešinės ir atpažinti simetriškus ženklus vaikai išmoksta gerokai anksčiau negu **pavartoti žodžius**. Žodžius „kairė“ ir „dešinė“ jie pradeda teisingai taikyti savo kūnui maždaug nuo septynerių metų, paskui — žmogui, žiūrinčiam **ta pačia kryptimi**, ir tik 8–9 metų — žmogui, žiūrinčiam **į juos**. Net vienuolikos metų pusė tiriamųjų žodžių kitiems žmonėms dar netaikė tinkamai.
│
│ -**Priešingas žvilgsnis yra sunkiausias atvejis.** Rigal (1996) su tais pačiais 406 vaikais atskyrė tris dalykus: atvaizdo atpažinimą, kairės/dešinės įvardijimą ir mintinį sukimą. Atvaizdą atpažinti sekėsi net mažiausiems. Kairės/dešinės įvardijimas buvo sunkus net vyriausiems, kai reikėjo mintyse pasukti. Kai reikėjo pasakyti, ką mato į vaiką atsisukęs žmogus, mažiausi rinkosi taip, tarsi tas žmogus matytų **iš jų pačių pozicijos**; ši dalis mažėjo su amžiumi, bet net 11-mečių teisingai atsakė tik pusė. Dalis vaikų suprato, kad kryptis pasikeitė, bet nesiejo to su kairės/dešinės padėtimi atvaizde.
│ +**Priešingas žvilgsnis yra sunkiausias atvejis.** Rigal (1996), tyręs 406 vaikus nuo 5 iki 11 metų, atskyrė tris dalykus: atvaizdo atpažinimą, kairės/dešinės įvardijimą ir mintinį sukimą. Atvaizdą atpažinti sekėsi net mažiausiems. Kairės/dešinės įvardijimas buvo sunkus net vyriausiems, kai reikėjo mintyse pasukti. Kai reikėjo pasakyti, ką mato į vaiką atsisukęs žmogus, mažiausi rinkosi taip, tarsi tas žmogus matytų **iš jų pačių pozicijos**; ši dalis mažėjo su amžiumi, bet net 11-mečių teisingai atsakė tik pusė. Dalis vaikų suprato, kad kryptis pasikeitė, bet nesiejo to su kairės/dešinės padėtimi atvaizde.
│
│  **„Pasukti“ vaikams reiškia ne tą patį.** Way ir Cartwright (2024) individualiai kalbino 36 pirmokus. Tik keturi visiškai teisingai atliko abi užduotis, penki negalėjo įvykdyti nė vieno krypties nurodymo, o dauguma robotui komandų „kairėn“/„dešinėn“ iš viso nesakė — rodė gestais arba sakė „eik ten“. Vaikai tą patį žodį „pasuk“ suprato įvairiai: vieni pasisuko vietoje, kiti žengė į šoną. Tai ne vien kalbos trūkumas — pati instrukcija turi du skirtingus kūno veiksmus.
│
│ agents/proposals/2026-11-08-metodininkas-emocijos.json
│ @@ -0,0 +1,23 @@
│ +{
│ +  "role": "metodininkas",
│ +  "run_id": 133,
│ +  "created": "2026-11-08T08:45:00+02:00",
│ +  "type": "metodas",
│ +  "title": "Emocijos: tas pats įvykis, skirtingas jausmas",
│ +  "body": "Metodas M-05 temai „emocijos“ — vienintelei privalomai 1 klasės temai, kurios platformoje dar nėra ir kuri iki šiol buvo sąmoningai blokuota (klausimai.md:29). Atsakoma į tą abejonę: paveikslėlis parodo vieną būseną, todėl iš jo negalima pasakyti, ar jausmą padarė dovana, ar noras; modelis laiko dovaną tą pačią ir keičia tik vieno veikėjo norą, o antras veikėjas (nekintantis noras) yra kontrolinė pora — vienas veidas apsiverčia, kitas ne. Viena idėja: jausmas priklauso ne vien nuo įvykio, o ir nuo to, ko žmogus norėjo. Simuliacija „dovana-ir-noras“ turi vieną kintamąjį (Rėjaus noras: kamuolys ↔ knyga), fiksuotą dovaną ir penkias būsenas su readout/note; prieš pirmą keitimą vaikas spėja, o api.progress žymimas tik po palyginimo, ne po pirmo pakeitimo. Keturios užduotys (atpažinimas, taikymas, perkėlimas į filmą apie šunis, praplėtimas) su tipinėmis klaidomis ir užuominomis; nė viena neklausia vaiko apie jo paties jausmus, todėl nepatenkama į asmens duomenų sritį. Moduliui reikia naujos krypties gyvenimo-igudziai ir simuliacijų failo assets/js/sims/gyvenimas.js (registracija registry.js — viena import eilutė ir vienas Object.assign įrašas). Metodas remiasi emocijų supratimo komponentais (Pons ir kt., 2004), mentalinių paaiškinimų raida (Rieffe ir kt., 2005) ir tuo, kad atviras nusivylimas 6–7 m. yra amžiaus norma (Saarni, 1979).",
│ +  "target": "content/lt/grade-01/gyvenimo-igudziai/01-dovana-ir-noras.json",
│ +  "priority": "high",
│ +  "status": "new",
│ +  "evidence": [
│ +    "research/wiki/grades/01/metodai.md#M-05 — visas metodas: seka, penkios simuliacijos būsenos, keturios užduotys, modelio ribos",
│ +    "research/wiki/foundations/jausmas-ir-noras.md — pagrindas ir platformos pasekmės",
│ +    "research/wiki/guidelines/klausimai.md:29 — atviras klausimas apie emocijų modelį (pažymėtas atsakytu)",
│ +    "research/wiki/curriculum/kti-dalykai-1-klase.md:96 — pasiekimas „atpažįsta, įvardija ir valdo emocijas, elgesį“; žodynas „piktas, baikštus, patenkintas, pakylėtas, susijaudinęs“",
│ +    "research/wiki/curriculum/kti-dalykai-1-klase.md:150 — „Emocijų atpažinimas situacijoje“ įvertintas „labai aukštai — paprasta, giliai reikalinga“",
│ +    "Pons, F., Harris, P. L., & de Rosnay, M. (2004). Emotion comprehension between 3 and 11 years. European Journal of Developmental Psychology, 1(2), 127–152. https://doi.org/10.1080/17405620344000022",
│ +    "Rieffe, C., Terwogt, M. M., & Cowan, R. (2005). Children's understanding of mental states as causes of emotions. Infant and Child Development, 14(3), 259–272. https://doi.org/10.1002/icd.391",
│ +    "Widen, S. C., & Russell, J. A. (2008). Children acquire emotion categories gradually. Cognitive Development, 23(2), 291–312. https://doi.org/10.1016/j.cogdev.2008.01.002",
│ +    "Saarni, C. (1979). Children's understanding of display rules for expressive behavior. Developmental Psychology, 15(4), 424–429. https://doi.org/10.1037/0012-1649.15.4.424",
│ +    "Harris, P. L., Donnelly, K., Guz, G. R., & Pitt-Watson, R. (1986). Children's understanding of the distinction between real and apparent emotion. Child Development, 57(4), 895–909. https://doi.org/10.2307/1130366"
│ +  ]
│ +}
│ agents/log/metodininkas-2026-11-08T0845.md
│ @@ -0,0 +1,53 @@
│ +# metodininkas — 2026-11-08T0845 (paleidimas #133)
│ +
│ +## Ką pasirinkau ir kodėl
│ +
│ +Eilėje nebuvo nė vieno `new` tipo `tema` pasiūlymo: visi 22 temų/metodų pasiūlymai yra `done`, `obsolete` arba `blocked` (`agents/runs.db`, užklausa `type in ('tema','metodas')`). Tuo pačiu metu `agents/scope.json` 1 klasei reikalauja septynių minimalių temų, o `agents/scope.py` rodo tris nepadengtas: „garso savybės“, „vandens būsenos“ (klaidingai — modulis `16-vandens-busenos` yra, žr. LL-49) ir **„emocijos“** (teisingai — `grep -rl "jausm\|emocij" content/lt/grade-01/` grąžina 0 failų).
│ +
│ +Emocijų tema nebuvo tiesiog pamiršta: ji sąmoningai blokuota `research/wiki/guidelines/klausimai.md:29`, nes ideatorius #2 atmetė formą „situacija → viena teisinga emocija“, o ideatorius #128 užrašė abejonę, kad „gerai nupieštas paveikslėlis su abiem vaikais parodo tą patį“. Tai klausimas, į kurį gali atsakyti būtent metodininkas: ar modelis prideda supratimo, kurio neprideda paveikslėlis.
│ +
│ +## Metodas M-05 „Emocijos: tas pats įvykis, skirtingas jausmas“
│ +
│ +Įrašytas `research/wiki/grades/01/metodai.md` (naujas skyrius prieš „Atviros prielaidos“, `atnaujinta: 2026-11-08`).
│ +
│ +- **Viena idėja.** Jausmas priklauso ne vien nuo įvykio, o ir nuo to, ko žmogus norėjo.
│ +- **Atsakymas į interaktyvumo abejonę.** Paveikslėlis parodo **vieną** būseną, todėl iš jo negalima pasakyti, ar skirtumą padarė dovana, ar noras. Modelis laiko dovaną tą pačią ir keičia tik vieno veikėjo norą; antras veikėjas (nekintantis noras) yra kontrolinė pora — vienas veidas apsiverčia, kitas ne. Be to, modelis reikalauja spėjimo prieš veiksmą, ko paveikslėlis nereikalauja.
│ +- **Seka.** Kūnas (du vienodi pieštukai, du savanoriai, skirtingi norai) → ekranas (Rėjus, Ieva, uždara dėžutė, norų burbulai) → simbolis (žodžiai „patenkintas“ / „nusiminęs“ + sakinys apie norus) → perkėlimas (dovana, filmas, žaidimas).
│ +- **Simuliacija `dovana-ir-noras`**, failas `assets/js/sims/gyvenimas.js`, registracija `assets/js/registry.js` (viena `import` eilutė + `Object.assign` sąrašas). `config: { gift: "kamuolys", other: "knyga", fixed: {name:"Ieva", wants:"knyga"}, varying: {name:"Rėjus", wants:"kamuolys"} }`.
│ +- **Vienas kintamasis:** `varying.wants` ∈ {kamuolys, knyga}. Dovana fiksuota; „Atidaryk dėžutę“ yra žingsnis, ne antra reikšmė.
│ +- **5 būsenos** su `readout` ir `api.note`; `api.progress` žymimas tik po to, kai abiem norais dėžutė atidaryta (LL-29), ne po pirmo pakeitimo.
│ +- **4 užduotys** (indeksai 1, 0, 0, 0): atpažinimas („Dėžutėje kamuolys. Rėjus norėjo knygos.“), taikymas (Ieva/Jonas), perkėlimas (filmas apie šunis), praplėtimas (`optional` — pieštukai, juokas ir nuliūdimas). Kiekviena su `hint` į klaidą ir `why`.
│ +- **Nė viena užduotis neklausia vaiko apie jo paties jausmus** — tai atsakymas ir į ideatoriaus asmens duomenų abejonę. Refleksija: „Kaip sužinotum, ar draugui patiks dovana? Ką darytum?“ (laukiamas atsakymas — paklausti).
│ +- **Modelio ribos pasakytos:** modelis „žino“ norą, nes jis nupieštas burbule; realiai noro nesimato. Modelis rodo du jausmus ir vieną priežastį, nevaizduoja slėpiamo jausmo ir mišrių jausmų (Pons ir kt., 2004 — atskiri komponentai).
│ +- **Teksto ilgiai** patikrinti skriptu: `title` 41 simb. (riba 42), `subtitle` 50 (80), `concept.title` 26 (40), `big_idea` 88 (240); visi ekrano sakiniai ≤ 10 žodžių (ilgiausias 9).
│ +
│ +## Kiti failai
│ +
│ +- `research/wiki/foundations/jausmas-ir-noras.md` — naujas įrašas (5 šaltiniai), indekso eilutė `foundations/README.md`.
│ +- `research/wiki/guidelines/klausimai.md:29` — klausimas pažymėtas `[x]` ir papildytas atsakymu (pagal paties failo taisyklę: atsakius — perkeliama į `foundations/`).
│ +- `research/wiki/guidelines/pilotai.md` — P-017 (nematomas kintamasis + kontrolinė pora).
│ +- `research/wiki/changelog.md` — 2026-11-08 (08:40) įrašas.
│ +- `agents/proposals/2026-11-08-metodininkas-emocijos.json` — `type: metodas`, `target: content/lt/grade-01/gyvenimo-igudziai/01-dovana-ir-noras.json`, prioritetas `high`.
│ +
│ +## Baigtos ankstesnio paleidimo skolos
│ +
│ +1. `research/wiki/foundations/kryptis-ir-ziurovo-pozicija.md:22` — „Rigal (1996) su tais pačiais 406 vaikais“ → „Rigal (1996), tyręs 406 vaikus nuo 5 iki 11 metų“. OpenAlex abstrakte sakoma „a group of 406 subjects ranging from 5 to 11 yr.“, bet ne „tie patys vaikai“ kaip 1994 m. tyrime; todėl teiginys susilpnintas iki to, ką šaltinis sako.
│ +2. `research/wiki/grades/01/metodai.md:216` — sugadinta MERGA formuluotė („o ne daugelis robotui apskritai davė komandas“) grąžinta prie šaltinio: „o dauguma robotui komandų „kairėn“/„dešinėn“ iš viso nesakė“. MERGA tekste: „the majority did not use left/right commands at all“.
│ +3. `agents/log/metodininkas-2026-11-07T0820.md` buvo tik bėgiklio diff'as be mano suvestinės — šiandienos ataskaita ją pakeičia turinio prasme; istorijos neperrašinėjau.
│ +
│ +## Patikra
│ +
│ +- `validate_content.py` → 0 klaidų, 0 įspėjimų (exit 0).
│ +- `validate_content.py --strict` → 0 klaidų, 0 įspėjimų (exit 0).
│ +- `check_language.py --grade 1` → 0 klaidų; įspėjimai (ilgi žodžiai `13-akmenelis-popierius`) buvo prieš darbą.
│ +- `check_lessons.py` → 49 įrašai, visi su 4 laukais.
│ +- `check_agents.py` → 15 vaidmenų (exit 0).
│ +- DOI patvirtinti per Crossref/OpenAlex: Pons ir kt. 2004 (EJDP 1(2) 127–152), Rieffe ir kt. 2005 (ICD 14(3) 259–272), Widen & Russell 2008 (Cogn. Dev. 23(2) 291–312), Saarni 1979 (Dev. Psych. 15(4) 424–429), Harris ir kt. 1986 (Child Dev. 57, 895, DOI 10.2307/1130366).
│ +- Pons ir kt. 2004 abstraktas perskaitytas tiesiogiai (100 vaikų, 3–11 m., devyni komponentai, trys tarpsniai, hierarchinis ryšys) — metodas remiasi tuo, ką abstraktas sako, o ne santrauka.
│ +
│ +## Kas liko / pastebėjimai
│ +
│ +1. **Eilėje nėra nė vieno `new` temų pasiūlymo.** Tai reiškia, kad metodininkas nebegali dirbti pagal savo taisyklę „imk `new` pasiūlymą“ — šį kartą darbas atliktas pagal privalomą `agents/scope.json` sąrašą ir atvirą klausimą. Tai sistemos, o ne šio vaidmens problema: ideatoriaus eilė turi gaminti naujas temas, bet negamina.
│ +2. `agents/scope.py` „vandens būsenos“ vis dar rodo `covered=False`, nors modulis yra (LL-49). Priėmimas #5047 tai jau registruoja — nekartoju.
│ +3. Modulis dar nesukurtas: kūrėjui reikės naujos krypties `gyvenimo-igudziai` (`index.json`), `path.json` įrašo, `assets/js/sims/gyvenimas.js` ir `registry.js` eilutės, taip pat garso įrašų (5 frazės).
│ +4. „Garso savybės“ lieka vienintelė privaloma tema be metodo: modulis `muzika/01-garso-aukstis` jau yra, bet M- metodo tam neturime — kandidatas kitam paleidimui.
│ agents/state.json
│ @@ -15,9 +15,9 @@
│        "cadence": "kasdien"
│      },
│      "metodininkas": {
│ -      "last_run": "2026-11-07T08:31:46",
│ -      "status": "conflict",
│ -      "log": "agents/log/metodininkas-2026-11-07T0820.md",
│ +      "last_run": "2026-11-08T08:45:00",
│ +      "status": "ok",
│ +      "log": "agents/log/metodininkas-2026-11-08T0845.md",
│        "description": "Kuria vaizdavimo metodus ir simuliacijų scenarijus pasiūlymams",
│        "cadence": "kasdien"
│      },
│ agents/state.json
│ @@ -372,8 +372,30 @@
│      "touched": "content/lt/grade-01/matematika/24-komandu-seka.json; assets/js/sims/matematika.js; content/lt/grade-01/index.json; content/lt/grade-01/path.json; content/lt/grades.json; assets/audio/lt/manifest.json (+28 mp3); research/wiki/guidelines/pamokos.md; agents/log/kurejas-2026-11-08T0810-5046.md; agents/state.json",
│      "live_verified": "2026-11-08T08:14 — https://one-man-company.github.io/suprask/#/modulis/1/matematika/24-komandu-seka: simuliacija įsikėlė (5 komandos), klaidinga seka → „Seka baigėsi ne prie vėliavos.“, dukart palietus trečią komandą → pirmyn, „Robotas pasiekė vėliavą. Seka tinka.“, simDone true, 0 konsolės klaidų (8/8). check_view.py --base <gyva> --module 24-komandu-seka --viewports desktop,phone,small → checked 3, problems [], notes [], ok true visuose (360/390/1440)."
│    },
│ +  "last_method_work": {
│ +    "date": "2026-11-08",
│ +    "run_id": 133,
│ +    "proposal": "agents/proposals/2026-11-08-metodininkas-emocijos.json",
│ +    "target": "content/lt/grade-01/gyvenimo-igudziai/01-dovana-ir-noras.json",
│ +    "method": "M-05",
│ +    "topic": "emocijos",
│ +    "selection": "Eilėje nebuvo nė vieno `new` tipo `tema` pasiūlymo (22 temų/metodų įrašai — done, obsolete arba blocked). Darbas atliktas pagal privalomą agents/scope.json sąrašą: „emocijos“ — vienintelė privaloma 1 klasės tema, kurios platformoje nėra (grep „jausm|emocij“ content/lt/grade-01/ → 0 failų) ir kuri buvo sąmoningai blokuota kaip atviras klausimas (klausimai.md:29).",
│ +    "defect": "Klausimas klausimai.md:29: „gerai nupieštas paveikslėlis su abiem vaikais parodo tą patį“ — todėl interaktyvumo nauda (gairių 2 klausimas) liko neįrodyta, o tema nekuriama.",
│ +    "answer": "Paveikslėlis parodo vieną būseną, todėl iš jo negalima pasakyti, kas padarė skirtumą (dovana ar noras). Modelis laiko įvykį tą patį ir keičia tik vieno veikėjo norą, o antras veikėjas su nekintančiu noru yra kontrolinė pora: vienas veidas apsiverčia, kitas ne. Be to, modelis reikalauja spėjimo prieš veiksmą, ko paveikslėlis nereikalauja.",
│ +    "what_changed": "1) research/wiki/grades/01/metodai.md — naujas M-05 (seka kūnas→ekranas→simbolis→perkėlimas; simuliacija `dovana-ir-noras` assets/js/sims/gyvenimas.js su registracija registry.js; vienas kintamasis `varying.wants`; 5 būsenos; 4 užduotys, indeksai 1/0/0/0, 4-a optional; modelio ribos). 2) foundations/jausmas-ir-noras.md — naujas įrašas. 3) foundations/README.md — indekso eilutė. 4) guidelines/klausimai.md:29 — pažymėtas atsakytu. 5) guidelines/pilotai.md — P-017. 6) changelog.md — 2026-11-08 įrašas. 7) foundations/kryptis-ir-ziurovo-pozicija.md:22 — „su tais pačiais 406 vaikais“ → „tyręs 406 vaikus nuo 5 iki 11 metų“ (OpenAlex abstraktas nesako, kad tai tie patys vaikai). 8) metodai.md:216 — sugadinta MERGA formuluotė grąžinta prie šaltinio („dauguma komandų kairėn/dešinėn iš viso nesakė“).",
│ +    "measure": "Teksto ilgiai skriptu: title 41 (riba 42), subtitle 50 (80), concept.title 26 (40), big_idea 88 (240), concept.example 81; visi ekrano sakiniai ≤ 10 žodžių (ilgiausias 9, imtinai hint/why/options). Layout: dvi plokštės po 148 px + 16 px = 312 px iš 328 px @360; taikiniai 56×56 ir 328×56 px.",
│ +    "svietimas1": "P2 — spėjimas ir keitimas prieš paaiškinimą; T1.2 — viena sąvoka (jausmas ← noras), be slėpiamo ir mišraus jausmo; T2.2 — perkėlimas į filmą; T3.1/T3.4 — hint kiekvienoje užduotyje, 4-a optional; T5.1 — grįžtamasis ryšys apie veiksmą; asmens duomenų nėra (nė viena užduotis neklausia vaiko apie jo jausmus).",
│ +    "sources_verified": "Crossref/OpenAlex: Pons, Harris & de Rosnay 2004 (10.1080/17405620344000022, EJDP 1(2) 127–152, 100 vaikų 3–11 m., devyni komponentai, trys tarpsniai); Rieffe, Terwogt & Cowan 2005 (10.1002/icd.391, ICD 14(3) 259–272, n=122, 4/6/10 m.); Widen & Russell 2008 (10.1016/j.cogdev.2008.01.002, Cogn. Dev. 23(2) 291–312); Saarni 1979 (10.1037/0012-1649.15.4.424, Dev. Psych. 15(4) 424–429); Harris ir kt. 1986 (10.2307/1130366, Child Dev. 57, 895).",
│ +    "verified": "validate_content.py → 0 klaidų, 0 įspėjimų (exit 0) ir --strict → 0/0; check_language.py --grade 1 → 0 klaidų (ilgų žodžių įspėjimai buvo prieš darbą); check_lessons.py → 49 įrašai su 4 laukais; check_agents.py → 15 vaidmenų (exit 0).",
│ +    "new_lesson": "— (naujo defekto tipo nerasta; LL-29 ir LL-42 pritaikyti iš anksto: api.progress tik po palyginimo, visi sakiniai config.sentences)",
│ +    "proposal_out": "— (vienas paleidimas — vienas metodas; kitų pasiūlymų nekūriau)",
│ +    "log": "agents/log/metodininkas-2026-11-08T0845.md",
│ +    "remaining": "Modulis dar nesukurtas: kūrėjui reikia naujos krypties `gyvenimo-igudziai` index.json, path.json įrašo, assets/js/sims/gyvenimas.js, registry.js eilutės ir 5 garso frazių. Eilėje nėra nė vieno `new` temų pasiūlymo — ideatoriaus eilė negamina naujų temų, todėl metodininkas dirbo pagal scope sąrašą. „Garso savybės“ lieka vienintelė privaloma tema be metodo (modulis muzika/01-garso-aukstis yra). agents/scope.py „vandens būsenos“ vis dar rodo nepadengtą (LL-49, #5047) — nekartota.",
│ +    "notes": "Modulis nekuriamas — target yra būsimo modulio kelias, todėl index.json, path.json, garsas ir check_view.py netaikyti (failo nėra). agents/state.json yra .gitignore; ataskaita agents/log/*.md — tracked. Darbinėje kopijoje kitų vaidmenų pakeitimai (README, ARCHITEKTURA, wiki/grades/01/index.md, wiki/grades/README.md, agents/run.py, pamokos.md) neliesti.",
│ +    "touched": "research/wiki/grades/01/metodai.md; research/wiki/foundations/jausmas-ir-noras.md; research/wiki/foundations/README.md; research/wiki/foundations/kryptis-ir-ziurovo-pozicija.md; research/wiki/guidelines/klausimai.md; research/wiki/guidelines/pilotai.md; research/wiki/changelog.md; agents/proposals/2026-11-08-metodininkas-emocijos.json; agents/log/metodininkas-2026-11-08T0845.md; agents/state.json"
│ +  },
│    "open_questions": "research/wiki/guidelines/klausimai.md",
│ -  "updated": "2026-11-08T08:34:11",
│ +  "updated": "2026-11-08T08:50:00",
│    "last_attribution_work": {
│      "date": "2026-11-08",
│      "run_id": 132,
Metodas M-05 įrašytas ir patikrintas.

## Kas padaryta

**Pasirinkimas.** Eilėje nebuvo nė vieno `new` tipo `tema` pasiūlymo — visi 22 temų/metodų įrašai `done`, `obsolete` arba `blocked`. Todėl dirbau pagal privalomą `agents/scope.json` sąrašą: **„emocijos“** yra vienintelė privaloma 1 klasės tema, kurios platformoje nėra (`grep "jausm\|emocij" content/lt/grade-01/` → 0 failų) ir kuri buvo sąmoningai blokuota kaip atviras klausimas (`klausimai.md:29`).

**Atsakymas į blokavusią abejonę.** Ideatorius bijojo, kad „gerai nupieštas paveikslėlis su abiem vaikais parodo tą patį". Ne — paveikslėlis parodo **vieną** būseną, todėl iš jo negalima pasakyti, kas padarė skirtumą: dovana ar noras. Modelis laiko dovaną tą pačią ir keičia tik vieno veikėjo norą, o antrą veikėją su nekintančiu noru palieka kaip kontrolinę porą — vienas veidas apsiverčia, kitas ne. Be to, modelis reikalauja spėjimo prieš veiksmą, ko paveikslėlis nereikalauja.

**Metodas M-05 „Emocijos: tas pats įvykis, skirtingas jausmas"** (`research/wiki/grades/01/metodai.md`):
- viena idėja: jausmas priklauso ne vien nuo įvykio, o ir nuo to, ko žmogus norėjo;
- seka: kūnas (du vienodi pieštukai, skirtingi norai) → ekranas (Rėjus, Ieva, norų burbulai) → simbolis („patenkintas"/„nusiminęs" + sakinys apie norus) → perkėlimas;
- simuliacija `dovana-ir-noras` (`assets/js/sims/gyvenimas.js` + `registry.js` eilutė), vienas kintamasis `varying.wants`, 5 būsenos su `readout`/`note`, `api.progress` tik po palyginimo (LL-29), sakiniai tik `config.sentences` (LL-42);
- 4 užduotys (indeksai 1/0/0/0, 4-a `optional`), kiekviena su `hint` į klaidą ir `why`; **nė viena neklausia vaiko apie jo paties jausmus**;
- modelio ribos: burbulas rodo norą, realiai noro nesimato — reikia paklausti.

**Kiti failai:** `foundations/jausmas-ir-noras.md` (naujas, 5 šaltiniai), `foundations/README.md`, `guidelines/klausimai.md:29` (pažymėtas atsakytu), `guidelines/pilotai.md` (P-017), `changelog.md`, `agents/proposals/2026-11-08-metodininkas-emocijos.json`, ataskaita `agents/log/metodininkas-2026-11-08T0845.md`, `agents/state.json` (`last_method_work`).

**Uždarytos ankstesnės skolos:** `kryptis-ir-ziurovo-pozicija.md:22` — „su tais pačiais 406 vaikais" → „tyręs 406 vaikus nuo 5 iki 11 metų" (OpenAlex abstraktas to nesako); `metodai.md:216` — sugadinta MERGA formuluotė grąžinta prie šaltinio.

**Patikra.** `validate_content.py` ir `--strict` → 0 klaidų / 0 įspėjimų; `check_language.py --grade 1` → 0 klaidų; `check_lessons.py` → 49 įrašai; `check_agents.py` → 15 vaidmenų. DOI patvirtinti per Crossref/OpenAlex (Pons 2004, Rieffe 2005, Widen & Russell 2008, Saarni 1979, Harris 1986), Pons abstraktas perskaitytas tiesiogiai. Teksto ilgiai matuoti skriptu: title 41/42, big_idea 88/240, visi ekrano sakiniai ≤ 10 žodžių.

## Kas liko

1. Modulis dar nesukurtas — kūrėjui reikia naujos krypties `gyvenimo-igudziai`, `path.json` įrašo, `gyvenimas.js`, `registry.js` eilutės ir 5 garso frazių.
2. Eilėje nėra nė vieno `new` temų pasiūlymo — sistemos problema (ideatoriaus eilė negamina temų), užregistruota ataskaitoje.
3. `agents/scope.py` „vandens būsenos" vis dar rodo nepadengtą (LL-49, #5047) — nekartota.
4. „Garso savybės" lieka vienintelė privaloma tema be metodo.

## klaidos

```
session_id: local-74d8fc7e8cf0693e043d3d526673ed60753491a9eefb97cd05677bafd4ae6a64
```
