#!/usr/bin/env python3
"""
Publikavimo būklė: kiek turinio yra repo ir kiek realiai pasiekė gyvą svetainę.

Skirtumas tarp „sukurta“ ir „paskelbta“ anksčiau nebuvo matomas: dashboard
skaičiavo failus diske, o svetainėje modulių buvo mažiau. Šis įrankis lygina
abi puses ir, svarbiausia, tikrina, ar nepradingo nė vienas modulio ID —
nuo to priklauso vaiko `localStorage` pažanga.

2026-11-09 išplėsta (pasiūlymas #8716). Anksčiau:
  - klasė buvo įrašyta kieta (`grade-01`) — kai bus paleista 2 klasė, įrankis
    jos nematytų ir vėl sakytų „sutampa“;
  - lyginamos tik ID aibės, tad gyva svetainė su tais pačiais ID, bet pasenusiu
    failo turiniu, būdavo pavadinta suderinta. Baitų lygybę agentai turėjo
    įrodinėti atskirais zondais kiekvieną publikavimo paleidimą.
Dabar: klasės imamos iš `grades.json` (`status: live`), kiekvienas gyvas
modulio failas lyginamas baitais (sha256) su repo failu, o pranešime
atskiriama „trūksta ID“ nuo „ID yra, turinys pasenęs“. Nesutapimas
patikrinamas antrą kartą — GitHub Pages pirmomis sekundėmis po deploymento
gali grąžinti mišrią krašto būseną (LL-76).

2026-11-12 (paleidimas #247): lyginami ir failai, kuriuos svetainė skaito
prieš modulį — `grades.json`, klasės `index.json`, `path.json` ir
`assets/audio/lt/manifest.json`. Anksčiau moduliai galėjo būti 200, o gyvas
manifestas pasenęs: naujo modulio garsas 404, o visi vartai žali (LL-78).

2026-11-12 (paleidimas #253): lyginamas ir svetainės **kodas**, ne tik
turinys — `index.html`, `assets/js/**/*.js`, `assets/css/*.css`. Anksčiau
įrankis tikrino vien `content/lt/**` ir du pagalbinius failus, todėl
nepaskelbtas simuliacijos pataisymas buvo nematomas: modulių baitai sutampa,
o vaikas vykdo seną `assets/js/sims/*.js` (LL-83).

2026-11-13 (paleidimas #271): tikrinama ir **git istorija**, ne tik dabartis.
Modulis `03-sakinio-tvarka` pervadintas į `03-sakinio-zodziai` (#261): repo ir
gyva svetainė po to sutapo 39/39, visi baitai lygūs, visi vartai žali — o vaiko
`localStorage` žyma tam moduliui liko be modulio. Įrankis tokio įvykio nematė,
nes lygino tik dvi dabarties būsenas. Dabar iš klasės `index.json` istorijos
surenkami visi kada nors buvę ID; tie, kurių dabartiniame indekse nėra,
pranešami kaip `vanished_ids`. Priimtas pervadinimas (su aiškiu įpėdiniu)
registruojamas `scripts/known_renames.json` — kitaip vartai raudoni.

Dėmesio: `?v=<commit>` — ne turinio skirtumas. `.github/workflows/pages.yml`
prieš publikavimą prirašo commit'o trumpinį prie CSS/JS nuorodų, kad
naršyklė nepaimtų iš GitHub Pages tarpinės atminties seno failo. Todėl
svetainės failai lyginami **nuėmus `?v=`**, o pati versija perskaitoma ir
palyginama su `git HEAD` — kitu atveju įrankis klaidingai skelbtų „pasenęs
kodas“ po kiekvieno publikavimo.

2026-11-15 (paleidimas #301): tikrinami ir **garso failai**, ne tik manifestas.
Iki šiol lygintas tik `assets/audio/lt/manifest.json` baitais: jei manifestas
gyvas ir teisingas, vartai žali — nors patys mp3 gali būti nepaskelbti, ir
vaikas, paspaudęs garsiakalbį, negirdi nieko. Ši sritis liko vienintelė, kurios
neapėmė nė vieni vartai (#288, #292, #294 kas kartą matavo rankiniu zendu:
1138/1138, 86 s). Dabar manifestas perskaitomas, kiekvienas įrašas tikrinamas
HEAD užklausa, o rezultatas įvardijamas skaičiais. Numatytai tikrinami **visi**
įrašai: #303 neigiamas zondas parodė, kad 48 įrašų mėginys svetainėje su dviem
sugedusiais mp3 iš 1138 duoda rc 0 — tyli žalia, nors vaikas girdi nieko.
`--audio-sample N` paliktas greitam rankiniam bėgimui; jis išvestyje visada
sako „mėginys“ ir niekada nepranešamas kaip pilnas (LL-37).

2026-11-15 (paleidimas #308): dvi tylios žalios uždarytos.
  - `404.html` įtrauktas į `SHELL_GLOBS`: jį naršyklė realiai įkelia (tai
    puslapis, kurį vaikas pamato radęs neteisingą adresą ar nepaskelbtą
    modulį), o `pages.yml` jį kopijuoja į svetainę. Veidrodis su 563 B → 594 B
    failu anksčiau davė rc 0 ir „sutampa“; dabar — `PASENĘS KODAS: 404.html`.
  - `unpushed()` grąžina ir tai, ar patikra įvyko. Git klaida (šviežias klonas
    be `origin/main`) anksčiau virsdavo „0 neišsiųstų“; dabar `verdict()` sako
    „neišsiųstų commit'ų patikra neįvyko“ ir rc lieka 1.

2026-11-18 (paleidimas #356): priimtas pervadinimas nebelaikomas „be alias“.
  Pranešimas kiekvienam `vanished_ids` įrašui kietai rašė „alias mechanizmo
  nėra, žr. agents/proposals/“, nors `assets/js/progress.js:50–120` jį turi,
  `assets/js/registry.js:52–67` duoda žemėlapį, o `index.json` jau turi
  `renamed_from` (KURINIO-STANDARTAS §7.1). Tai buvo teiginys apie vaiko
  pažangą, kurio niekas neperskaičiavo (LL-21 / LL-34), ir jis kartojo darbą,
  kuris jau padarytas. Dabar `renamed_from_map()` skaito būtent klasės
  `index.json` (tą failą, kurį naršyklė ir įkelia), o pranešimas sako, ką
  rado: „žyma perkeliama“ arba „DĖMESIO: žyma liktų našlaite“. Pervadinimas,
  kuris yra `known_renames.json`, bet neturi `renamed_from` indekse, dabar
  daro ir rc 1 (`verdict()`: „pervadintas ID be alias“).

2026-11-18 (paleidimas #368): laikina tinklo klaida nebelaikoma „modulio nėra“.
  Pirmas šio paleidimo `check_published.py` bėgimas davė rc 1 ir
  „NEPASIEKIAMI gyvi failai (1): 06-figuros“, nors `curl` tą patį adresą tuoj
  pat atsakė 200 / 4 712 B, o antras bėgimas — 45/45 ir rc 0. Priežastis:
  `compare()` nutraukdavo po **vienos** nepavykusios užklausos (`fetch()` → None
  → `live_size -1` → `stale_unknown` → raudona), o `_audio_state()` tą pačią
  klaidą kartojo. Viena kryptis turėjo kartojimą, kita — ne, tad vartai apie
  vaiko patirtį skelbė faktą („modulis nepasiekiamas“), kurio po vieno bandymo
  pasakyti negalima. Dabar `fetch()` 404/410 laiko galutiniu atsakymu, o kitas
  klaidas kartoja (2 bandymai, 1,5 s pertrauka); pakartojimų skaičius
  išvedamas, kad tylaus kartojimo nebūtų (LL-37). Pakartojamas įrodymas
  (`scripts/probe_publish_sets.py`, įtrauktas #506): G — veidrodis, kuris
  pirmą užklausą atsako 503, o antrą 200, duoda `ok` ir matomą pakartojimų
  skaičių; H — visada 503 duoda `unreachable`, o ne „nėra“.

2026-11-18 (paleidimas #372): #370 palikta pusė darbo užbaigta ir tyli žalia uždaryta.
  #370 `compare()` perdarė į būsenas (`ok|differs|absent|unreachable`) ir atskyrė
  „indeksas rodo į failą, kurio repo nėra“ nuo „failas pasenęs“, bet trys
  vartotojai liko su senu boolean kontraktu. Blogiausias — `report()` AUX_FILES
  ciklas: `ok, _, _ = compare(...)`; `if not ok:` — o ne tuščia **eilutė**
  visada teisinga, tad pasenęs `grades.json` / garso `manifest.json` nebūtų
  parodytas nė karto (tyli žalia). Be to `missing_in_repo`, `aux_absent` ir
  `stale_unmeasured` buvo surenkami `check_grade()` viduje ir **numetami**
  `report()` išvestyje, o `verdict()` jų nepažino: zondas (veidrodis, kuriame
  repo indeksas rodo į failą, o failo nėra) davė `verdict: sutampa, ok=True`.
  Pakartojamas įrodymas: `scripts/probe_publish_sets.py` E. Dabar visi trys
  būsenų vartotojai (AUX ciklas, `verdict()`, spausdintuvas) skaito būseną,
  o trūkstamas repo failas rodomas kaip `LŪŽĘS INDEKSAS` su gyvos pusės
  matavimu (`head_state()`): ar svetainėje failas yra. Neišmatuotas dydis
  lieka `-1` ir pranešamas žodžiais, ne kaip „0 B“.

2026-11-19 (paleidimas #374): pranešimas nebeteigia to, ko nebuvo matuota.
  Du defektai, kuriuos rado zondas `probe.py` (`--expect old` → 2/2, t. y.
  abu dar buvo):
  - `--no-bytes` režimas sąmoningai **nelygina** baitų, bet sėkmės eilutė
    iki šiol sakydavo „sutampa (ID, seka, modulių ir pagrindinių failų
    baitai, svetainės kodas 0 failų)“. Nei baitai, nei kodas nebuvo
    lyginti, o „0 failų“ yra ne matavimas, o praleista dalis. Greitas
    rankinis bėgimas taip tapdavo „įrodymu“, kurio nebuvo (LL-37/LL-10).
    Dabar `report()` grąžina `bytes_checked`, o eilutė sako „dalinė
    patikra“ ir išvardija, kas NETIKRINTA.
  - Sulaužytas **repo** indeksas (`content/lt/grade-01/index.json`
    neperskaitomas) buvo rašomas į `live_error`, o `verdict()` iš to darė
    „gyva svetainė nepasiekiama“. Veidrodis be indekso davė rc 1 su klaida
    apie svetainę, nors svetainė sveika, o taisyti reikia repo failą
    (LL-21). Dabar `check_grade()` tokį atvejį rašo į `repo_error`, o
    `verdict()` pirmoji priežastis — „repo indekso nepavyko perskaityti“.

2026-11-19 (paleidimas #382): nepasiekiama svetainė nebepaverčiama skaičiais.
  #374 užbaigė `--no-bytes` ir `repo_error` puses, bet trys vietos liko:
  - `published` buvo skaičiuojamas iš gyvo indekso, kurio **neperskaitėme**:
    svetainės gedimas virsdavo „Paskelbta: 0 modulių“ — teiginys apie
    svetainę, kurios nematėme. Dabar yra `published_measured`, o eilutė sako
    „Paskelbta: neišmatuota“.
  - baitų ciklas (`check_grade()`) ėjo net tada, kai gyvo indekso nėra: 48
    užklausos virsdavo 48 eilutėmis „NEPASIEKTA“ apie failus, kurių niekas
    nematė. Dabar jis paleidžiamas tik su perskaitytu gyvu indeksu, o **repo**
    indekso vientisumas (įrašas be failo) tikrinamas ir be tinklo.
  - `report()` pradeda vienu HEAD į `index.html`: kai svetainė neatsiliepia,
    pagrindinių failų, svetainės kodo ir 1432 garso įrašų patikros
    nevykdomos, o pranešime pasakoma, kas NETIKRINTA (ne 1451 „nepasiekiama“).

2026-11-19 (paleidimas #386): 404 nebelaikomas ryšio klaida.
  `fetch()` grąžino `None` ir tada, kai svetainė **atsakė 404**, ir tada, kai
  ryšio nebuvo, o `compare()` abu paversdavo `"unreachable"`. Pasekmė: modulio
  failo, kurio svetainėje nėra, atveju įrankis rašė „NEPASIEKTA po 2 bandymų“ —
  teiginys apie tinklą, kurio nebuvo (404 net nekartojamas), ir patarimas
  bandyti dar kartą vietoj publikuoti (LL-21, LL-37). Dabar `fetch_answer()`
  skiria `ok|missing|unreachable`, o `compare()` ir `_shell_state()` turi
  būseną `"gone"`: repo failas yra, svetainė atsakė 404/410. Ji rodoma
  atskirai (`SVETAINĖJE NĖRA MODULIO FAILO`, `…PAGRINDINIO FAILO`,
  `…KODO FAILO`), o `verdict()` turi savo priežastis, nes taisymas kitas —
  paleisti publikavimą, ne kartoti užklausą. Pakartojamas įrodymas:
  `scripts/probe_publish_sets.py` F — gyvai 404 esantis modulio failas duoda
  `live_missing` ir atskirą priežastį, o ne „nepasiekiama“.

2026-11-19 (paleidimas #388): ta pati 404 klaida liko vienu lygiu aukščiau.
  #386 sutvarkė modulio failą ir svetainės kodą, bet **klasės** `index.json`
  ir `path.json` tebebuvo skaitomi senuoju `fetch()` kontraktu: 404 virsdavo
  `None`, `live_error` — „gyvas grade-01/index.json nepasiekiamas“, o
  `verdict()` — „gyva svetainė nepasiekiama“. Tai būdavo pranešama kartu su
  garso eilute, kuri ėjo per **tą pačią** svetainę ir rado visus 1432 įrašus,
  tad pranešimas prieštaravo pats sau ir siuntė taisyti tinklo vietoj
  publikavimo (LL-21, LL-120). Realus atvejis: klasė įjungta `grades.json`
  (`status: live`), o jos katalogas dar nepaskelbtas. Dabar `check_grade()`
  naudoja `fetch_answer()`, rašo `live_gone`, o `verdict()` turi priežastį
  „klasės failo nėra svetainėje (404)“. Pakartojamas įrodymas:
  `scripts/probe_publish_sets.py` L — 404 indeksas duoda `live_gone`,
  `published_measured is False` ir tokią pačią priežastį, o ne „gyva svetainė
  nepasiekiama“.

2026-11-20 (paleidimas #404): modulio failas, kurio niekas neindeksuoja, nebe tyli žalia.
  Zondas (dabar pakartojamas: `scripts/probe_publish_sets.py` D) atkartojo realų darbą: modulio failas
  įdėtas į `content/lt/grade-01/matematika/`, `grades.json` skelbiamas skaičius
  pakeltas 51 → 52, o `index.json` įrašo nėra. `pages.yml` kopijuoja visą
  `content/`, tad failas svetainėje **yra**, bet naršyklė jo neprašo — modulio
  vaikas nepasiekia, o dashboard'as skaičiuoja failą. Visi trys vartai liko žali:
  `validate_content.py --grade 1 --strict` rc 0 (skaičius sutampa su failų
  skaičiumi), `check_registry.py --grade 1` rc 0 (našlaitį **išspausdino**, bet
  į `problems` neįtraukė), o šis įrankis pranešė „repo 51, gyvai 51, sutampa“ —
  52 failai diske virto 51 moduliu abiejose pusėse. Dabar `check_grade()` skaito
  ir failus (ne tik indeksą) ir įrašo `orphan_files`, `verdict()` turi savo
  priežastį, o pranešimas įvardija failą. Tai LL-37 šeima (tyli riba), tik
  riboja ne užklausą, o aibę: matuota „indeksas prieš indeksą“, o vaikui
  svarbu „failas prieš naršyklę“.

2026-11-21 (paleidimas #423): svetainės failai imami iš katalogo, ne tik `*.js`/`*.css`.
  `shell_files()` rinkdavo `index.html`, `404.html`, `assets/js/**/*.js` ir
  `assets/css/*.css`, o `pages.yml` publikuoja `cp -r assets` — t. y. visą
  katalogą. Bet koks kitas svetainės failas (paveikslas, SVG, šriftas, JSON)
  būtų paskelbtas be vartų: baitų lyginimas jo nepamatytų, o vaikas, radęs
  404 paveikslo adrese, nematytų jokio įspėjimo. Matuota buvo tai, kas
  įrašyta sąraše, ne tai, ką svetainė siunčia (LL-37 — tyli riba). Šiandien
  tokių failų nėra, todėl poveikis nulinis (`shell_count` 19 → 19), bet pirmas
  `assets/img/*.svg` praeitų visas patikras žalias. Dabar `shell_files()`
  prideda visus `assets/` failus, išskyrus `assets/audio/` — garsas tikrinamas
  atskirai (`check_audio()` ir AUX `manifest.json`), o 1 486 mp3 dublikatas
  bėgimą pailgintų be naujos informacijos.

2026-11-21 (paleidimas #426): garso failo vardas neša turinio maišą — dabar jis tikrinamas.
  `check_audio()` klausia svetainės HEAD, t. y. „ar failas ten yra“, o ne „ar
  ten tie baitai“. Skirtumas ne teorinis: `scripts/generate_audio.py:380-381`
  mp3 vardą sudaro `<sha256(tekstas)[:16]>-<sha256(baitai)[:8]>`, tad URL pats
  įrodo turinį — bet tik tol, kol repo baitai atitinka vardą. To netikrino
  niekas: nukirptas ar perrašytas mp3 su senu vardu duoda ir `check_audio.py`
  (jis tik `exists()` ir `0 B`), ir HEAD patikrą žalias, o vaikas girdi tylą ar
  pusę žodžio. Dabar `audio_name_digest()` perskaito manifesto failus ir lygina
  vardo maišą su baitų maišu; nesutapimas turi savo `verdict()` priežastį
  (ne „trūksta garso“ — taisymas kitas: pergeneruoti, o ne publikuoti).
  Matuota 2026-11-21: 1 486/1 486 sutampa, o `git log --diff-filter=M` pagal
  dabartinį vardų formatą rodo 0 vietoje pakeistų mp3 (1 986 pridėti, 500
  pašalinti), t. y. invariantas laikosi. Patikra pigi (~48 MB vietinio
  skaitymo, jokių tinklo užklausų), tad ji daroma kiekvieną bėgimą.

2026-11-21 (paleidimas #428): #426 patikra įjungta ir jos tyli riba uždaryta.
  #426 paliko `audio_name_digest()` parašytą, bet **nejungtą**: `report()` jį
  kvietė, o rezultatas neįeidavo nei į išvestį, nei į `verdict()`, nei į
  pranešimą. Tai reiškia, kad patikra egzistavo tik kaip funkcija, kurios
  niekas neperskaito — tas pats defektas kaip #370 (parašyta, bet vartai
  nenaudoja). Dabar:
  - `report()` įrašo `audio_name` į išvestį (ir `--json`, ir žmogui);
  - `verdict()` turi dvi naujas priežastis: `mismatch` (vardas rodo kitą
    turinį → pergeneruoti garsą, ne publikuoti) ir `absent` (manifesto įrašas
    be repo failo → vardo maišas nepatikrintas);
  - pranešime yra eilutė „Garso vardai: N iš N — vardo maišas = baitų maišas“,
    o sėkmės eilutėje — „garso vardai N/N = baitai“.
  Antroji pataisa ta pati sritis: `audio_name_digest()` trūkstamą failą
  praleisdavo `continue`, todėl `checked + unverified + mismatch` buvo
  mažiau už `total` ir skaičius atrodė pilnas, nors dalis įrašų nepatikrinta
  (LL-37 — tyli riba; ta pati klasė kaip #303 mėginys ir #404 našlaitis).
  Dabar trūkstamas failas patenka į `absent` ir yra įvardijamas.
  Išmatuota 2026-11-21: 1 486/1 486 vardo maišas = baitų maišas, `absent` 0,
  `unverified` 0, 0,15 s (vietinis skaitymas, be tinklo).

  Svarbus skirtumas nuo #426 ataskaitos: ji teigė „48 MB vietinio skaitymo,
  ~1 s“. Matuota 0,15 s — failų skaitymas nekainuoja nieko, o 48 s kainuoja
  HEAD užklausos (`check_audio()`). Šis įrašas tą skaičių pataiso, o ne
  kartoja (LL-21 — skaičius dokumente, kurio niekas neperskaičiuoja).

2026-11-22 (paleidimas #433): vardo PRIEKIS pagaliau tikrinamas — antrasis teiginys.
  #426/#428 patikrino, kad `n/<sha(tekstas)>-<sha(baitai)>.mp3` galas sutampa su
  baitais, bet **priekio** nepalietė nė karto: `audio_paths()` grąžindavo vien
  kelius, teksto, kurį failas įsipareigoja ištarti, sąraše nebuvo. Realus
  scenarijus: modulyje pataisoma rašyba ar kirčiavimas, manifestas lieka tas
  pats raktas, garsas nepergeneruojamas — `check_audio.py` mato `exists()`,
  HEAD mato 200, galo maišas sutampa (baitai tie patys), o vaikas girdi žodį,
  kurio ekrane jau nebėra. Dabar:
  - `audio_entries()` grąžina **(kelias, tekstas)** poras, `audio_paths()` lieka
    kaip apvalkalas HEAD patikrai;
  - `audio_name_digest()` turi penktą būseną `text_mismatch` (baitai savi,
    priekis rodo kitą tekstą), ir visos penkios sumuojasi į `total`;
  - `verdict()` turi atskirą priežastį „vardas rodo kitą TEKSTĄ“, o pranešimas —
    atskirą eilutę (būsena be savo šakos būtų LL-129).
  Išmatuota 2026-11-22: 1 486/1 486 priekis = `sha(manifesto raktas)[:16]`,
  `text_mismatch` 0, `mismatch` 0, `absent` 0, 0,2 s (vietinis skaitymas).
  Neigiamos kontrolės #433 bėgimas **nepaleido**: docstring'e buvo nuoroda į
  `scratch/pub433/probe.py`, kurio nebuvo nė repo, nė diske (žr. #439 žemiau).

2026-11-22 (paleidimas #439): patikros teiginys pagaliau turi paleidžiamą įrodymą.
  #433 paliko docstring'e sakinį „Neigiama kontrolė (`scratch/pub433/probe.py`)
  → `text_mismatch` 1 … rc 1“, kurio **niekas nepaleido** ir kurio failo niekada
  nebuvo. Tai LL-36 (įrodymas, kurio faile nebeliko) ir LL-21 (teiginys be
  matavimo), tik atvirkščia tvarka: pirmiau parašytas rezultatas, paskui
  nepadarytas matavimas. Be to paaiškėjo šaknis: `git log --all -- scratch` →
  **0 commit'ų**, t. y. visi iki šiol cituoti zondai (`pub368`, `pub370`,
  `pub386`, `pub388`, `pub404`) gyveno kataloge, kuris į repo nepatenka, tad
  nė vieno jų pakartoti neįmanoma — dokumente liko tik jų pažadas.
  Dabar yra `scripts/probe_check_published.py` — **įtrauktas į repo**,
  paleidžiamas be tinklo (veidrodis statomas laikiname kataloge iš tikrų
  `assets/audio/lt/` failų, repo neliečiamas):
    `python3 scripts/probe_check_published.py` → **10/10**, rc 0, 0,3 s.
  Jis įjungia kiekvieną `audio_name_digest()` būseną atskirai (A sveika
  būsena → `checked = total`; B pakeistas teksto raktas → `text_mismatch` 1 ir
  `verdict` „…kitą TEKSTĄ…“; C nukirptas mp3 → `mismatch` 1 ir „…kitą
  turinį…“; D įrašas be failo → `absent` 1; E atkūrimas → vėl žalia; F tikras
  manifestas po zondo nepakitęs) ir kiekviename žingsnyje tikrina sumos
  invariantą `checked + mismatch + text_mismatch + unverified + absent = total`
  (LL-37). Paleistas ir šio bėgimo fone: `check_published.py` numatytuoju
  režimu — repo 52 / paskelbta 52, garsas 1 514/1 514, vardo maišas
  1 514/1 514, svetainės kodas 19 failų, rc 0.

2026-11-23 (paleidimas #484): `path.json` santykinė tvarka pagaliau matuojama (#41652).
  #480 ataskaita tvarką patvirtino **rankiniu skriptu** (`git show 7f346d9:…`
  → „visi 62 seni ID, santykinė tvarka True“), o įrankis, kuriuo remiamasi
  publikavimo sprendime, to nemokėjo: `not_in_path` matuoja aibę, `path_differs`
  — ar seka tokia pati kaip svetainėje. Todėl modulio perkėlimas į kitą vietą
  (aibė ta pati, visi skaičiai sutampa) praeidavo žalias, nors vaiko „Tęsk nuo
  čia“ žingsnis persikeldavo (gairės T3.6; AGENTS.md „esama tvarka nesikeistų“).
  Šiandien tai ne teorija: pirmas šios patikros bėgimas parodė, kad #481
  perkėlė `07-elektronika` iš 70 į 48 poziciją (prie `01-elektros-grandine`).
  Perkėlimas jau buvo paskelbtas, todėl jis **priimtas** ir užfiksuotas, o ne
  atšauktas: atšaukimas vėl pajudintų tą patį žingsnį. Dabar:
  - `scripts/known_path_order.json` — užfiksuota kiekvienos klasės tvarka
    (`sequence`, `accepted_at`, `note`). Tai tos pačios rūšies įrankio duomenys
    kaip `known_renames.json`: sąmoningas perkėlimas keičia failą matomai, o ne
    tyliai. Bazė būtent tokia, o ne „vakarykštė `path.json` versija“, nes
    priimtas perstatymas kitaip liktų raudonas tol, kol kas nors vėl palies
    failą, ir vartai mokytų juos apeiti (LL-37 atvirkštinė pusė);
  - `check_grade()` rašo `path_reordered` (senų ID santykinė tvarka pajudėta —
    raudona) ir `path_inserted_midsequence` (naujas įrašytas į vidurį, ne į
    pabaigą — geltona, bet įvardijama, nes perstumia „kitą žingsnį“);
  - `path_reordered` yra minimali aibė: LIS papildinys, t. y. „pašalinus šiuos
    ID likusi tvarka atitinka ankstesnę“. Viso sąrašo rašyti negalima — jis
    kaltintų ir tuos ID, kurie savo vietoje (LL-21);
  - `path_order_checked` saugo nuo tylios žalios: be užfiksuotos sekos ir be
    HEAD failo `verdict()` sako „sekos tvarkos patikra neįvyko“;
  - be užfiksuotos sekos lieka HEAD patikra, tad necommitintas perstatymas
    matomas ir tada, kai įrašo dar nėra.
  Įrodymas repo: `scripts/probe_path_order.py` → **12/12**, rc 0, be tinklo
  (laikinas sekos failas; A–F būsenos, G invariantas, H1–H3 ribos, I sugadintas
  JSON, J tikras repo). Neigiama kontrolė per patį įrankį:
  `SUPRASK_PATH_ORDER=<perstatyta seka> python3 scripts/check_published.py
  --no-bytes` → rc 1, `verdict` „1 senų ID tvarka pajudėta“, įvardytas
  `07-elektronika`. Teigiama: numatytasis bėgimas → rc 0, 72/72, o sėkmės
  eilutė pasako, su kuo lyginta.

2026-11-23 (paleidimas #486, pasiūlymas #42399): tvarkos patikra perkelta į CI vartus.
  #484 sukūrė matavimą, bet jis gyveno vien publikavimo agente, kuris paleidžiamas
  **po** to, kai bėgikas išstūmė backlog'ą. #481 perkėlimas buvo rastas tik tada,
  kai jau buvo svetainėje: beliko konstatuoti. Dabar yra `--path-order` režimas —
  be tinklo, be `git show` (šviežiame CI klone `HEAD` **yra** darbinė kopija, tad
  lyginimas su `HEAD` visada būtų žalias: tyli žalia, LL-37), lyginama išimtinai
  su `scripts/known_path_order.json`. Su tuo pačiu failu lygina ir `.github/workflows/`
  `validate.yml` žingsnis, todėl kūrimo commit'as, perstatantis esamą modulį,
  krenta PR vartuose su įvardytu ID. Sąmoningas perstatymas lieka galimas: jis
  keičia `known_path_order.json` tame pačiame commit'e ir matomas `git diff`.
  Įrodymas repo: `scripts/probe_path_order.py` → **18/18** (A–J buvę 12; K1–K6 —
  pats režimas, įskaitant „nėra užfiksuotos sekos → rc 1, o ne žalia“ ir
  „režimas nepaliečia git ar tinklo“).

2026-11-24 (paleidimas #495): gyvas garso failas matuojamas ne tik „yra“, bet ir „toks pat“.
  `check_audio()` šešis paleidimus klausė svetainės „ar failas ten yra“ ir
  niekada — „ar ten tie patys baitai“. Skylė vaikui girdima: svetainė gali
  atsakyti 200 ir **pusę** mp3 (nutrūkęs įkėlimas, senas failas tokiu pačiu
  vardu), tada 404 nėra, `empty` nėra (dydis > 0), o `audio_name_digest()`
  žalias — jis lygina **repo** baitus su **repo** vardu, t. y. sako tiesą apie
  failą diske, ne apie tai, ką siunčia svetainė (LL-167 ta pati šeima: vartai
  tikrina tai, kas yra, o ne tai, kas siunčiama). Dydis nekainuoja nė vienos
  papildomos užklausos: HEAD jau grąžina `Content-Length`, disko dydis yra
  `stat()`. Dabar `check_audio()` grąžina `size_checked` ir `size_mismatch`
  (failas, disko baitai, gyvi baitai), `verdict()` turi atskirą priežastį
  („nutrūkęs įrašas“ — taisymas paleisti publikavimą, o ne pergeneruoti
  garsą), o pranešime visada spausdinama „dydis: N iš N“ eilutė, kad
  „visi pasiekiami“ nebūtų skaitomas kaip pilnas atsakymas (LL-37).
  Išmatuota prieš įjungiant: 2 124/2 124 `Content-Length` = disko baitai,
  `Content-Length` 0 atvejų 0, 404 0 (visos 1 062 poros × n/s, HEAD per gyvą
  svetainę). Šiandien poveikis nulinis, bet pirmas nutrūkęs mp3 anksčiau
  praeidavo visas patikras žalias. Įrodymas repo:
  `python3 scripts/probe_check_published.py` → **15/15** (du nauji žingsniai
  su vietiniu `http.server` veidrodžiu: sveikas → `size_mismatch` 0 ir
  verdict žalias; sutrumpintas mp3 → `size_mismatch` 1, įvardytas failas ir
  abu dydžiai, verdict raudonas).

2026-11-24 (paleidimas #506): du tylūs žali šaltiniai uždaryti, o teiginiai tapo paleidžiami.
  Pirma, `historical_ids()` (dingusių ID patikra — nuo jos priklauso vaiko
  `localStorage` žyma po pervadinimo) `checked` grąžindavo `True` ir tada, kai
  **git neatsakė**. Priežastis buvo `subprocess.run(...).stdout` be
  `returncode` patikros: ne git kataloge ar be `git` komandos `stdout` tuščias,
  `revs = []`, o funkcija sakydavo „patikrinta, dingusių 0“. Tai LL-175
  (įrankio nebuvimas nėra tuščias rezultatas) — toks pat tylios žalios atvejis
  kaip LL-37, tik riba ne užklausos ilgis, o įrankio atsakymas. Dabar
  `git rev-parse`, `git log` ir `git show` tikrinami pagal išėjimo kodą, o jei
  `git log` rado revizijas ir nė viena neperskaityta — tai irgi nepavykusi
  patikra, ne „istorijoje modulių nebuvo“. `verdict()` tam jau turėjo priežastį
  „dingusių ID patikra neįvyko“.
  Antra, lūžęs indeksas (įrašas yra, failo repo nėra) buvo matuojamas tik
  baitų cikle, o tas ciklas sąmoningai praleidžia `missing_on_live` ID. Todėl
  įrašas, kurio failas dar ir nepaskelbtas, atrodė vien kaip „1 neskelbta“ —
  t. y. taisymas „paleisk publikavimą“, nors publikavimas jo neįkelia ir vaikas
  modulio niekada negaus. Dabar `missing_in_repo` surašomas **be tinklo** iš
  `index.json` ir repo failų, o baitų ciklas tik papildo dydžius.
  Trečia, `probe_path_order.py` J/K6 tikrino kietą skaičių (72 žingsniai) ir po
  to, kai 2026-11-24 kūrėjas į 1 klasę įdėjo 5 modulius, tapo raudonas dėl
  teisingo darbo; dabar tikrinama „visi užfiksuoti ID yra, nė vienas
  nepajudėtas, papildomi įvardyti kaip įterpti“ ir žingsnių skaičius imamas iš
  `path.json` (LL-38).
  Įrodymas repo: `python3 scripts/probe_publish_sets.py` → **22/22**, rc 0,
  be interneto, ~6 s. Zondas stato laikiną repo su tikru `git`, `origin/main`
  ir atskiru gyvos svetainės veidrodžiu, tada per `report()`/`verdict()`/`main()`
  tikrina A–M: sveika būsena (rc 0), `missing_on_live` (ir kad tas pats ID
  nekartojamas kaip „pasenęs“), `hidden_locally`, `orphan_files`,
  `missing_in_repo`, `live_missing`, 503→200 kartojimą, visada 503,
  ne git katalogą (rc 1), 404 klasės indeksą (`live_gone`, `published_measured`
  False) ir atkūrimą. Šiame paleidime tikras bėgimas nepakito: repo 77 /
  paskelbta 77, garso dydžiai 2 224/2 224, rc 0.

Naudojimas:
    python3 scripts/check_published.py               # žmogui
    python3 scripts/check_published.py --json        # dashboard'ui
    python3 scripts/check_published.py --grade 1     # viena klasė
    python3 scripts/check_published.py --no-bytes    # greita: tik ID ir seka
    python3 scripts/check_published.py --path-order   # be tinklo: tik maršruto tvarka (CI)
    python3 scripts/check_published.py --audio-full  # tas pats kaip numatyta
    python3 scripts/check_published.py --audio-sample 48   # greitas, aklas
"""

from __future__ import annotations

import argparse
import bisect
import hashlib
import json
import os
import pathlib
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "lt"
GRADES = CONTENT / "grades.json"
LIVE_ROOT = os.environ.get("SUPRASK_LIVE_ROOT", "https://one-man-company.github.io/suprask/")
UA = {"User-Agent": "suprask-check/1.2"}

# Failai, kuriuos svetainė skaito prieš bet kurį modulį. Jie nelyginami modulio
# baitų cikle (jis eina tik per `content/lt/<klase>/`), todėl pasenęs gyvas
# `manifest.json` anksčiau likdavo nepastebėtas: visi moduliai 200, visi vartai
# žali, o naujo modulio garso įrašo svetainėje nėra (404). LL-78.
AUX_FILES = [
    ("content/lt/grades.json", CONTENT / "grades.json"),
    ("assets/audio/lt/manifest.json", ROOT / "assets" / "audio" / "lt" / "manifest.json"),
]

# Svetainės kodas, kuris vykdomas naršyklėje. `content/` baitai sako, ką vaikas
# turėtų matyti, bet ne ką jis iš tikrųjų vykdo: simuliacijos, maršrutizatorius
# ir stilius gyvena `assets/`. Nepaskelbtas `assets/js/sims/*.js` pataisymas
# anksčiau likdavo nematomas — visi modulių baitai sutapdavo (LL-83).
SHELL_GLOBS = [
    ("index.html", None),
    # `404.html` irgi įkeliamas naršyklės: tai puslapis, kurį vaikas pamato,
    # kai modulio adresas neteisingas arba failas nepaskelbtas. Jis kopijuojamas
    # į svetainę (`pages.yml`: `cp index.html 404.html _site/`), bet nebuvo nė
    # viename varte — #306 paliko tai atviru, #308 įrodė zondą: veidrodis su
    # 563 B → 594 B `404.html` davė rc 0 ir „sutampa“, nors gyvas failas kitas.
    ("404.html", None),
    ("assets/js", "*.js"),
    ("assets/css", "*.css"),
]
# `?v=<commit>` prirašo `.github/workflows/pages.yml`. Tai ne turinio skirtumas,
# todėl prieš lyginimą žymė nuimama, o versija perskaitoma atskirai.
VERSION_PARAM = re.compile(r"\?v=[0-9a-f]{6,40}")

# Deploy'aus langas. GitHub Pages pastato svetainę per 1–2 min. po push, o
# bėgikas išstumia backlog'ą **prieš** šio vaidmens darbą. Todėl pirmas
# `check_published.py` bėgimas matuoja repo HEAD prieš dar nestatytą svetainę.
# 2026-11-20 (paleidimas #415) tas pats commit'as davė du skirtingus atsakymus:
# 35 „pasenę“ moduliai + 1 pagrindinis failas, o po minutės — „sutampa“, be
# jokio pakeitimo. Tai ne turinio defektas, o teiginys apie priežastį
# („nepaskelbta“), kurios neperskaitė nė vienas matavimas (LL-21): gyva
# versija tiesiog buvo ankstesnė už HEAD. Dabar prieš baitų ciklą palaukiama,
# kol `?v=` pasivys HEAD, o jei nepasiveja — pranešama kaip „deploy
# nepasivijo“, o ne kaip N pasenusių failų, kuriuos „reikia taisyti“.
DEPLOY_WAIT = int(os.environ.get("SUPRASK_DEPLOY_WAIT", "150"))
DEPLOY_POLL = max(1, int(os.environ.get("SUPRASK_DEPLOY_POLL", "10")))

# Priimti modulių pervadinimai. Failas yra įrankio duomenys, ne turinio schema:
# jis nekeičia modulio formato, tik pasako, kad dingęs ID turi įpėdinį ir kad
# sprendimas buvo peržiūrėtas. Be jo kiekvienas sąmoningas pervadinimas darytų
# vartus amžinai raudonus, o amžinai raudoni vartai — tas pats kaip jokių (LL-37).
RENAMES = ROOT / "scripts" / "known_renames.json"
# Užfiksuota ėjimo tvarka (`path.json` santykinė ID seka). Tai tos pačios
# rūšies įrankio duomenys kaip `known_renames.json`: failas sako, kokia tvarka
# jau yra sutartis su vaiku. Be jo „ar senų ID tvarka nepajudėta“ gali būti
# matuojama tik vieno commit'o atžvilgiu — t. y. viena diena, o ne sutartis.
PATH_ORDER = pathlib.Path(os.environ.get("SUPRASK_PATH_ORDER")
                          or (ROOT / "scripts" / "known_path_order.json"))
HISTORY_LIMIT = 400

# Garsas. Manifestas jau lyginamas kaip `AUX_FILES` įrašas, bet baitų lygybė
# sako tik tiek, kad sąrašas gyvas — ne kad failai, į kuriuos jis rodo, yra
# svetainėje. Vaikas, paspaudęs garsiakalbį, gauna 404 ir nieko negirdi, o
# visi vartai žali (#288, #292, #294). Todėl manifestas perskaitomas ir
# tikrinamas kiekvienas įrašas.
AUDIO_MANIFEST = ROOT / "assets" / "audio" / "lt" / "manifest.json"
AUDIO_URL_PREFIX = "assets/audio/lt/"
# Numatytasis režimas — visi įrašai. 48 įrašų mėginys buvo greitas (5,8 s), bet
# #303 neigiamas zondas parodė, kad jis **aklas**: veidrodis su 2 sugedusiais mp3
# iš 1138 (vienas 404, vienas 0 B) davė rc 0 ir „visi pasiekiami“. Pavienis
# trūkstamas failas nepatenka į 48 tolygžius taškus, o būtent pavienis failas ir
# yra realus atvejis (naujo modulio mp3 nepateko į publikavimą). Pilna patikra
# trunka 56 s prieš gyvą svetainę ir 1,3 s prieš vietinį veidrodį — pigiau nei
# vienas modulis be garso. `--audio-sample N` lieka greitam rankiniam bėgimui ir
# išvestyje visada pasako, kad tai mėginys.
AUDIO_SAMPLE = 48


def audio_entries(sample: int | None = None) -> tuple[list[tuple[str, str]], int]:
    """(tikrinamos (kelias, tekstas) poros, kiek jų iš viso manifeste).

    **Kodėl poros, o ne vien keliai (#433).** Garso failo vardas
    (`scripts/generate_audio.py:381`) yra `<sha256(tekstas)[:16]>-<sha256(baitai)[:8]>.mp3`,
    t. y. jis neša **du** teiginius: „šis failas ištaria BŪTENT šį tekstą“ ir
    „šio failo baitai yra būtent šie“. #426/#428 patikrino tik antrąjį, nes
    `audio_paths()` grąžindavo vien kelius — teksto, kurį failas turi ištarti,
    sąraše nebuvo, tad pirmo teiginio net nebuvo su kuo palyginti (LL-106:
    vardas su dviem tvirtinimais, tikrinamas vienas). Pasekmė vaikui girdima:
    pakeitus teksto raktą ir nepergeneravus garso, vaikas girdi **seną žodį**,
    o visi vartai žali.

    Poros, o ne du atskiri sąrašai: manifeste du skirtingi tekstai gali rodyti
    į tą patį failą (kol kas taip nėra, bet formatas to nedraudžia). Tada vienas
    įrašas bus `checked`, kitas — `text_mismatch`, ir abu turi būti įskaityti,
    kad sumos sutaptų su `total` (LL-37).

    `sample=None` — visi įrašai. Mėginys imamas tolygiai (kas n-tas), ne iš
    pradžios: pirmi įrašai yra seniausi ir paskelbti seniausiai, tad pradžios
    mėginys sistemingai nematytų naujausio modulio garso (LL-37).
    """
    try:
        data = json.loads(AUDIO_MANIFEST.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return [], 0
    pairs: list[tuple[str, str]] = []
    for text, value in data.items():
        if isinstance(value, dict):
            pairs += [(str(p), text) for p in value.values() if p]
        elif isinstance(value, str) and value:
            pairs.append((value, text))
    pairs.sort()
    total = len(pairs)
    if sample is None or sample <= 0 or total <= sample:
        return pairs, total
    step = total / sample
    picked = [pairs[min(total - 1, int(i * step))] for i in range(sample)]
    return list(dict.fromkeys(picked)), total


def audio_paths(sample: int | None = None) -> tuple[list[str], int]:
    """Tik keliai (`audio_entries()` be tekstų). Palikta HEAD patikrai ir
    seniems skaitytojams; vardo maišo patikra ima `audio_entries()`."""
    pairs, total = audio_entries(sample)
    return [rel for rel, _ in pairs], total


def head_state(url_rel: str) -> tuple[str, int]:
    """Būsena („ok“, „missing“, „unreachable“) ir baitai. HEAD, ne GET: turinys čia
    neįdomus — įdomu, ar failas yra svetainėje.

    `missing` reiškia **atsakymą** (404/410), `unreachable` — kad atsakymo
    negavome nė po dviejų bandymų. Šios dvi būsenos skiriasi: pirmoji yra
    faktas apie svetainę, antroji — apie ryšį. Sumaišytos jos praneštų
    „failo nėra“ apie failą, kurio niekas nematė (LL-37).
    """
    for attempt in (0, 1):
        try:
            req = urllib.request.Request(LIVE_ROOT + url_rel, headers=UA, method="HEAD")
            with urllib.request.urlopen(req, timeout=20) as resp:
                return "ok", int(resp.headers.get("Content-Length") or 0)
        except urllib.error.HTTPError as exc:
            if exc.code in (404, 410):
                return "missing", -1
            if attempt == 0:
                time.sleep(1.5)  # LL-76: kraštas po deploymento būna mišrus
                continue
            return "unreachable", -1
        except Exception:  # noqa: BLE001
            if attempt == 0:
                time.sleep(1.5)
                continue
            return "unreachable", -1
    return "unreachable", -1


def _audio_state(rel: str) -> tuple[str, int]:
    """("ok"|"missing"|"empty"|"unreachable", baitai) — žr. `head_state()`."""
    state, size = head_state(AUDIO_URL_PREFIX + rel)
    if state == "ok" and size <= 0:
        return "empty", size
    return state, size


def check_audio(sample: int | None = None) -> dict:
    """Ar garso failai yra svetainėje IR ar jie tokie patys kaip repo.

    Iki #495 buvo klausiama tik „ar failas ten yra“ (`ok` ir `0 B`). To
    pakako 404 atvejui, bet ne antram teiginiui: svetainė gali atsakyti 200 ir
    **kitokiu** failu — nutrūkusiu, pusiau įkeltu, senu. Vaikui tai ta pati
    klaida kaip 404 (girdi tylą ar pusę žodžio), o vartai buvo žali, nes
    `audio_name_digest()` lygina **repo** baitus su repo vardu, o ne su tuo,
    ką siunčia svetainė (LL-167: vartai lygina tai, kas yra, o ne tai, į ką
    nurodoma).

    Dydis yra pigiausias įrodymas abiem pusėms: HEAD jau grąžina
    `Content-Length`, o disko dydį turime vietoje. Todėl papildomų užklausų
    nereikia — nauja informacija ateina iš to paties atsakymo.

    Būsenos (kaip `audio_name_digest()`, kad sumos nemeluotų — LL-37):
      - `size_checked` — kiek failų dydį pavyko palyginti (failas yra
        svetainėje ir repo);
      - `size_mismatch` — svetainė siunčia kitokio dydžio failą. Taisymas:
        paleisti publikavimą iš naujo, o ne pergeneruoti garsą (baitai repo
        sveiki — tai įrodo vardo galas).
    Failas, kurio repo nėra, čia neįskaitomas: jį įvardija
    `audio_name_digest()` kaip `absent`, o svetainėje — `missing`; trečia
    eilutė už tą patį defektą būtų LL-21 (skaičius, kuris kaltina ne tą).
    """
    rels, total = audio_paths(sample)
    if not total:
        return {"total": 0, "checked": 0, "sampled": False,
                "missing": [], "empty": [], "unreachable": [],
                "size_checked": 0, "size_mismatch": [],
                "note": "manifestas neperskaitytas — garso patikra neįvyko"}
    with ThreadPoolExecutor(max_workers=10) as pool:
        results = list(pool.map(lambda rel: (rel, _audio_state(rel)), rels))
    missing = [rel for rel, (state, _) in results if state == "missing"]
    empty = [rel for rel, (state, _) in results if state == "empty"]
    unreachable = [rel for rel, (state, _) in results if state == "unreachable"]
    # Dydis lyginamas tik tada, kai failas svetainėje tikrai yra: priešingu
    # atveju `-1` ar `0` būtų palyginti su disku ir tas pats defektas būtų
    # praneštas du kartus skirtingais žodžiais (LL-129).
    size_mismatch: list[dict] = []
    size_checked = 0
    for rel, (state, live_size) in results:
        if state != "ok":
            continue
        try:
            disk_size = (AUDIO_MANIFEST.parent / rel).stat().st_size
        except OSError:
            continue
        size_checked += 1
        if disk_size != live_size:
            size_mismatch.append({"file": rel, "disk_bytes": disk_size,
                                  "live_bytes": live_size})
    return {
        "total": total,
        "checked": len(rels),
        "sampled": len(rels) < total,
        "missing": missing,
        "empty": empty,
        "unreachable": unreachable,
        "size_checked": size_checked,
        "size_mismatch": size_mismatch,
        "note": "",
    }


def audio_name_digest() -> dict:
    """Ar garso failo vardas sutampa su tuo, ką jis žada — be tinklo užklausos.

    `scripts/generate_audio.py:367-385` mp3 vardą sudaro
    `<sha256(tekstas)[:16]>-<sha256(baitai)[:8]>`, tad **URL neša du teiginius**:

      1. priekis (`sha(tekstas)[:16]`) — „šis failas ištaria BŪTENT šį tekstą“;
      2. galas (`sha(baitai)[:8]`) — „šio failo baitai yra būtent šie“.

    #426/#428 patikrino tik antrąjį, nes sąraše buvo vien keliai, o ne
    (kelias, tekstas). Dėl to pirmasis teiginys buvo nepatikrintas nė karto:
    pakeitus teksto raktą (pataisius rašybą, kirčiavimą, perrašius sakinį
    modulyje) ir nepergeneravus garso, failo vardas toliau rodo į **seną
    tekstą**, `check_audio.py` mato `exists()`, HEAD mato 200, galo maišas
    sutampa (baitai tie patys) — ir vaikas girdi žodį, kurio ekrane jau nebėra.
    Tai ta pati šeima kaip #426 (vardas teigia daugiau, negu tikrinama), tik
    trečias teiginys: **tekstas**, kurį vardas įsipareigoja ištarti (LL-106).

    Būsenos (visos kartu sudaro `total`, kad suma nemeluotų — LL-37):
      - `checked` — abu vardo teiginiai sutampa.
      - `mismatch` — baitų maišas ≠ vardas. Taisymas: pergeneruoti garsą, o ne
        publikuoti (`scripts/generate_audio.py`).
      - `text_mismatch` — baitai savi, bet priekis rodo **kitą tekstą**, negu
        manifestas. Taisymas tas pats (pergeneruoti), bet priežastis kita:
        failo baitai sveiki, todėl vien `mismatch` patikra jo nematė.
      - `unverified` — vardas be priekio ar be galo (senas formatas, `<sha>.mp3`).
        Toks URL negali įrodyti turinio, todėl jis nėra „ok“ — bet ir ne
        „sugedęs baitas“. Skaičiuojamas atskirai, kad pranešimas nemeluotų.
      - `absent` — manifesto įrašas, kurio failo repo nėra. Ši aibė atsirado
        #428: iki tol toks įrašas buvo tyliai praleistas (`continue`), todėl
        `checked` + `unverified` + `mismatch` buvo **mažiau** už `total`, o tai
        yra tyli riba (LL-37) — skaičiai atrodė kaip pilnas matavimas, nors
        dalis įrašų nebuvo nei patikrinta, nei įvardyta. Trūkstamą failą
        svetainėje jau matuoja `check_audio()`, tad čia jis tik įvardijamas,
        o ne dubliuojamas kaip antra klaida.
    """
    pairs, total = audio_entries(None)
    if not total:
        return {"total": 0, "checked": 0, "mismatch": [], "text_mismatch": [],
                "unverified": [], "absent": [],
                "note": "manifestas neperskaitytas — vardo maišo patikra neįvyko"}
    base = AUDIO_MANIFEST.parent
    mismatch: list[str] = []
    text_mismatch: list[str] = []
    unverified: list[str] = []
    absent: list[str] = []
    checked = 0
    for rel, text in pairs:
        path = base / rel
        try:
            data = path.read_bytes()
        except OSError:
            # Failo nėra — tai jau `check_audio()` sritis („nėra svetainėje“),
            # bet aibė turi būti įvardyta, kad sumos sutaptų su `total`.
            absent.append(rel)
            continue
        stem = path.stem
        if "-" not in stem:
            unverified.append(rel)
            continue
        # `rsplit`, ne `split`: tekstų maišas ir baitų maišas atskirti BŪTENT
        # paskutiniu brūkšniu, o priekis yra viskas iki jo.
        claimed_text, claimed_bytes = stem.rsplit("-", 1)
        if hashlib.sha256(data).hexdigest()[:8] != claimed_bytes:
            mismatch.append(rel)
            continue
        # Baitai savi. Dabar antrasis teiginys: ar priekis — šio teksto maišas?
        # `generate_audio.sha()` ima tuos pačius 16 simbolių ta pačia tvarka.
        if hashlib.sha256(text.encode("utf-8")).hexdigest()[:16] != claimed_text:
            text_mismatch.append(rel)
            continue
        checked += 1
    return {"total": total, "checked": checked,
            "mismatch": mismatch, "text_mismatch": text_mismatch,
            "unverified": unverified, "absent": absent, "note": ""}


def grade_dir(grade: int) -> str:
    return f"grade-{grade:02d}"


def known_renames() -> dict[tuple[int, str], str]:
    """(klasė, senas ID) → naujas ID. Priimti pervadinimai, ne spėjimai."""
    try:
        data = json.loads(RENAMES.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    out: dict[tuple[int, str], str] = {}
    for item in data.get("renames", []):
        if item.get("from") and item.get("to"):
            out[(int(item.get("grade", 0)), str(item["from"]))] = str(item["to"])
    return out


def renamed_from_map(grade: int) -> dict[str, str]:
    """Senas ID → dabartinis, kaip jį mato **naršyklė** (klasės `index.json`).

    Tai ne tas pats failas kaip `known_renames.json`. `known_renames.json` yra
    vartų duomenys, kurių naršyklė neskaito; žymą perkelia `progress.js`
    (`renameMap()` → `registry.js`, `migrate()`), o šaltinis jai — `renamed_from`
    klasės indekse (KURINIO-STANDARTAS §7.1). Todėl įrankis, norėdamas pasakyti,
    ar vaiko žyma bus perkelta, turi skaityti būtent indeksą.

    Kodėl atsirado (#356): iki tol pranešimas kiekvienam priimtam pervadinimui
    kietai rašė „alias mechanizmo nėra, žr. agents/proposals/“. Mechanizmas jau
    buvo įdiegtas (`assets/js/progress.js:50–120`, `assets/js/registry.js:52–67`)
    ir aprašytas standarte, o `index.json` jau turėjo `renamed_from` — vartai
    kartojo pasenusį teiginį, o ne jį perskaičiavo (LL-21, LL-34). Pasekmė ne
    kosmetinė: pagal tokią eilutę agentas kas kartą siūlytų darbą, kuris jau
    padarytas, o skaitytojas manytų, kad vaiko pažanga prarasta.

    Grąžinama tuščia, jei indekso perskaityti nepavyksta — tada pranešama
    „nepatikrinta“, o ne „nėra“ (LL-37).
    """
    path = CONTENT / grade_dir(grade) / "index.json"
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    out: dict[str, str] = {}
    for strand in data.get("strands", []):
        for mod in strand.get("modules", []):
            new_id = mod.get("id")
            for old in mod.get("renamed_from") or []:
                if isinstance(old, str) and old and new_id and old != new_id:
                    out[old] = new_id
    return out


def historical_ids(grade: int) -> tuple[dict[str, str], str, bool]:
    """Visi ID, kada nors buvę klasės `index.json`, pastaba ir ar patikra įvyko.

    Dabarties lyginimas pervadinimo nemato: jei repo ir gyva svetainė pakeistos
    kartu, abi pusės sutampa, o vaiko žyma vis tiek neteko modulio (LL-88).
    Todėl imama git istorija. Kiekvienam ID įsimenama **naujausia** revizija,
    kurioje jis buvo (`revs` eina nuo naujausios).

    Trečias reikšmės narys `checked` saugo nuo tylios „0 dingusių“: jei istorijos
    perskaityti nepavyksta, tai nėra švarus rezultatas (LL-37/LL-10).

    Kiekviena git užklausa tikrinama pagal **išėjimo kodą**, ne tik pagal
    išvestį. `subprocess.run()` rūpestingai atspausdina klaidą, grąžindamas
    tuščią `stdout`; iki #506 būtent taip atsitikdavo ne git kataloge arba be
    `git` komandos — `revs` likdavo tuščias, o funkcija grąžindavo
    `checked = True`. Tada `verdict()` sakydavo „dingusių ID patikra įvyko“,
    nors nieko nebuvo perskaityta: pervadintas modulis būtų žalias, o vaiko
    žyma liktų be modulio (LL-175 — įrankio nebuvimas nėra tuščias rezultatas).
    """
    path = f"content/lt/{grade_dir(grade)}/index.json"
    note = ""
    try:
        probe = subprocess.run(
            ["git", "rev-parse", "--is-shallow-repository"],
            cwd=ROOT, capture_output=True, text=True, timeout=20,
        )
        if probe.returncode != 0:
            first = (probe.stderr or "").strip().splitlines()
            return {}, ("git istorijos nepavyko perskaityti: "
                        f"`git rev-parse` grąžino {probe.returncode}"
                        + (f" ({first[0]})" if first else "")), False
        if probe.stdout.strip() == "true":
            return {}, "git istorija sekli — dingusių ID patikra neįmanoma", False
        log = subprocess.run(
            ["git", "log", f"--max-count={HISTORY_LIMIT}", "--format=%h", "--", path],
            cwd=ROOT, capture_output=True, text=True, timeout=120,
        )
        if log.returncode != 0:
            first = (log.stderr or "").strip().splitlines()
            return {}, ("git istorijos nepavyko perskaityti: "
                        f"`git log` grąžino {log.returncode}"
                        + (f" ({first[0]})" if first else "")), False
        revs = log.stdout.split()
    except Exception as exc:  # noqa: BLE001
        return {}, f"git istorijos nepavyko perskaityti ({type(exc).__name__})", False

    if len(revs) >= HISTORY_LIMIT:
        note = f"istorija ribota iki {HISTORY_LIMIT} revizijų — senesni ID nepatikrinti"

    seen: dict[str, str] = {}
    unreadable = 0
    for rev in revs:
        try:
            show = subprocess.run(
                ["git", "show", f"{rev}:{path}"],
                cwd=ROOT, capture_output=True, text=True, timeout=30,
            )
            if show.returncode != 0:
                # Revizijoje indekso dar nebuvo arba jis ne JSON — tai
                # atsakymas, todėl skaičiuojama, bet ne laikoma gedimu.
                continue
            data = json.loads(show.stdout)
        except Exception:  # noqa: BLE001
            unreadable += 1
            continue
        for strand in data.get("strands", []):
            for mod in strand.get("modules", []):
                mid = mod.get("id")
                if mid and mid not in seen:
                    seen[mid] = rev
    # `git log` rado revizijas, bet nė vienos nepavyko perskaityti: tai ne
    # „istorijoje modulių nebuvo“, o nepavykusi patikra (LL-37).
    if revs and not seen and unreadable == len(revs):
        return {}, (f"git istorijos nepavyko perskaityti: nė viena iš "
                    f"{len(revs)} revizijų neperskaityta"), False
    return seen, note, True


def vanished(grade: int, current_ids: list[str]) -> dict:
    """Dingę ID su įpėdiniu, jei pervadinimas priimtas ir užregistruotas.

    Kiekvienam įrašui pridedama ir tai, ar žymą **realiai** perkelia naršyklė:
    `alias` — kur veda `index.json` `renamed_from` (tuščia, jei nėra), o
    `alias_ok` — ar tas pats įpėdinis, kaip `known_renames.json`. Be šių laukų
    vartai neturėdavo kuo pagrįsti teiginio apie vaiko pažangą ir rašė kietai
    įrašytą tekstą (#356, LL-21).
    """
    hist, note, checked = historical_ids(grade)
    known = known_renames()
    browser = renamed_from_map(grade)
    cur = set(current_ids)
    items: list[dict] = []
    for mid, rev in sorted(hist.items()):
        if mid in cur:
            continue
        successor = known.get((grade, mid), "")
        alias = browser.get(mid, "")
        items.append({
            "grade": grade,
            "id": mid,
            "last_rev": rev,
            "successor": successor,
            "resolved": bool(successor) and successor in cur,
            "alias": alias,
            "alias_ok": bool(successor) and alias == successor,
        })
    return {"items": items, "note": note, "checked": checked}


def sequence_at(rel: str, rev: str) -> list[str] | None:
    """`<rev>:<rel>` failo `sequence`; `None`, jei revizijoje jo nėra arba jis ne JSON.

    `None` čia reiškia „nėra su kuo lyginti“, o ne „tuščia seka“ — tuščia seka
    būtų teiginys apie turinį, kurio neperskaitėme (LL-37).
    """
    try:
        blob = subprocess.run(
            ["git", "show", f"{rev}:{rel}"],
            cwd=ROOT, capture_output=True, text=True, timeout=30,
        ).stdout
        if not blob.strip():
            return None
        return list(json.loads(blob).get("sequence", []))
    except Exception:  # noqa: BLE001
        return None


def pinned_sequence(grade: int) -> dict | None:
    """Užfiksuota klasės ėjimo tvarka iš `scripts/known_path_order.json`.

    Kodėl atskiras failas, o ne „vakarykštė `path.json` versija“. Pirmoji
    mintis buvo lyginti su paskutiniu commit'u, palietusiu `path.json`. Bet
    tada sąmoningas (priimtas) perstatymas liktų raudonas tol, kol kas nors
    vėl palies failą — o priėmus naują tvarką ji **yra** sutartis su vaiku,
    tad vartai, kurie to nemato, moko juos apeiti (LL-37 atvirkštinė pusė).
    Užfiksuota seka yra ta pati sutartis kaip `known_renames.json`: ji
    keičiama sąmoningu failo pakeitimu, matomu `git diff`, o ne tyliai.

    Grąžinama `None`, jei įrašo nėra arba jis tuščias — tada žemiau lieka tik
    necommitinto pakeitimo patikra.
    """
    try:
        data = json.loads(PATH_ORDER.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    entry = (data.get("grades") or {}).get(str(grade))
    if not isinstance(entry, dict):
        return None
    seq = [m for m in entry.get("sequence") or [] if isinstance(m, str) and m]
    if not seq:
        return None
    when = entry.get("accepted_at") or "?"
    return {"seq": seq, "label": f"scripts/known_path_order.json ({when})",
            "note": entry.get("note", "")}


def path_order_baseline(grade: int, current_seq: list[str]) -> dict:
    """Seka, su kuria lyginama **santykinė** `path.json` tvarka, ir jos šaltinis.

    `not_in_path` ir `path_differs` atsako į klausimą „ar visi ID yra“ ir „ar
    seka tokia pati kaip svetainėje“. Nė vienas nemato to, kas nutinka, kai
    naujas modulis įterpiamas ne į pabaigą: aibė ta pati, o kiekvieno po jo
    einančio žingsnio vieta pasislenka, tad vaiko „Tęsk nuo čia“ taškas tyliai
    persikelia (gairės T3.6; AGENTS.md reikalavimas „esama tvarka nesikeistų“).

    Pirmenybė — užfiksuotai sekai (`scripts/known_path_order.json`), nes ji
    gyvena ilgiau nei vienas commit'as. Jei įrašo nėra, matuojamas bent
    **nepaskelbtas** pakeitimas: darbinė `path.json` kopija prieš `HEAD`.
    Trečias raktas `checked` saugo nuo tylios „tvarka gera“: jei nėra nei
    užfiksuotos sekos, nei su kuo lyginti, tai nėra švarus rezultatas, o
    `verdict()` apie tai pasako atskirai (LL-37).
    """
    out: dict = {"seq": [], "label": "", "checked": False, "note": ""}
    pin = pinned_sequence(grade)
    if pin:
        out.update(seq=pin["seq"], label=pin["label"],
                   note=pin.get("note", ""), checked=True)
        return out

    rel = f"content/lt/{grade_dir(grade)}/path.json"
    head = sequence_at(rel, "HEAD")
    if head is None:
        out["note"] = ("nėra `scripts/known_path_order.json` įrašo ir nėra "
                       "su kuo lyginti — tvarka neužfiksuota")
        return out
    if head == current_seq:
        out["checked"] = True
        out["label"] = "HEAD (nepaskelbtų pakeitimų nėra)"
        out["note"] = ("nėra `scripts/known_path_order.json` įrašo — "
                       "ilgalaikė apsauga neįjungta, matuotas tik HEAD")
        return out
    out.update(seq=head, label="HEAD (darbinė kopija dar nepaskelbta)", checked=True)
    return out



def reordered_ids(current: list[str], baseline: list[str]) -> list[str]:
    """ID, kurių pašalinus likusių santykinė tvarka sutampa su ankstesne.

    Tai ilgiausios didėjančios bazinės tvarkos posekės papildinys (LIS), t. y.
    mažiausia aibė, kuria galima pagrįsti teiginį „tvarka pajudėta“. Viso
    sąrašo rašyti negalima: jis kaltintų ir tuos ID, kurie savo vietoje
    (LL-21 — teiginys turi atitikti matavimą).
    """
    pos = {mid: i for i, mid in enumerate(current)}
    pairs = [(pos[mid], mid) for mid in baseline if mid in pos]
    if len(pairs) < 2:
        return []
    tails: list[int] = []
    tail_at: list[int] = []
    prev = [-1] * len(pairs)
    for i, (p, _) in enumerate(pairs):
        k = bisect.bisect_left(tails, p)
        if k == len(tails):
            tails.append(p)
            tail_at.append(i)
        else:
            tails[k] = p
            tail_at[k] = i
        prev[i] = tail_at[k - 1] if k else -1
    keep: set[int] = set()
    i = tail_at[-1]
    while i != -1:
        keep.add(i)
        i = prev[i]
    return [mid for i, (_, mid) in enumerate(pairs) if i not in keep]


def inserted_midsequence(current: list[str], baseline: list[str]) -> list[str]:
    """Nauji ID, įterpti **ne į pabaigą** — prieš kurį nors seną žingsnį.

    Tai ne klaida: naują modulį pedagogiškai teisinga dėti šalia temos
    kaimyno. Bet jis perstumia kiekvieną po jo einantį žingsnį, tad žmogus
    turi matyti, kam pasikeitė „kitas žingsnis“ (gairės T3.6), o ne atrasti
    tai vaiko ekrane.
    """
    pos = {mid: i for i, mid in enumerate(current)}
    base_pos = [pos[mid] for mid in baseline if mid in pos]
    if not base_pos:
        return []
    last_base = max(base_pos)
    base_set = set(baseline)
    return [mid for i, mid in enumerate(current) if mid not in base_set and i < last_base]


def path_order_check(grade: int, current_seq: list[str]) -> dict:
    """Santykinės `path.json` tvarkos patikra vienam klasiui.

    Grąžina `path_reordered` (raudona: senų ID tvarka pajudėta), o
    `path_inserted_midsequence` (geltona: nauji įterpti į vidurį),
    `path_order_baseline` (su kuo lyginta) ir `path_order_checked`.
    """
    baseline = path_order_baseline(grade, current_seq)
    out: dict = {
        "path_reordered": [],
        "path_inserted_midsequence": [],
        "path_order_baseline": baseline.get("label", ""),
        "path_order_checked": bool(baseline.get("checked")),
    }
    if baseline.get("note"):
        out["path_order_note"] = baseline["note"]
    base = baseline.get("seq") or []
    if not base:
        return out
    out["path_reordered"] = reordered_ids(current_seq, base)
    out["path_inserted_midsequence"] = inserted_midsequence(current_seq, base)
    return out


def path_order_gate(grade: int) -> dict:
    """`--path-order` režimas: santykinė `path.json` tvarka be tinklo, CI vartams.

    Kodėl atskiras režimas, o ne `--no-bytes`. Du dalykai jame neveikia CI:

    1. tinklas — `report()` lygina su gyva svetaine, o PR vartuose svetainė
       dar nerodo šio commit'o, tad atsakymas būtų apie praeitą publikavimą;
    2. `git show HEAD:path.json` — šviežiame CI klone `HEAD` **yra** darbinė
       kopija, tad `path_order_baseline()` fallback'as visada grąžintų
       „sutampa“: vartai, kurie žali bet kokiu atveju, yra blogesni už jokių
       (LL-37). Todėl čia lyginama **tik** su `scripts/known_path_order.json`,
       o jei įrašo nėra — tai ne „tvarka gera“, o „neišmatuota“, ir rc 1.

    `inserted_midsequence` lieka geltona ir rc nekeičia: naują modulį dėti prie
    temos kaimyno yra teisinga, tik tai turi būti matoma pranešime, o ne
    atrandama vaiko ekrane.

    Grąžina dict su `ok` — vieninteliu lauku, kuriuo remiasi `main()`.
    """
    gd = grade_dir(grade)
    out: dict = {
        "grade": grade, "file": f"content/lt/{gd}/path.json", "ok": False,
        "checked": False, "baseline": "", "reordered": [], "inserted": [],
        "sequence_len": 0, "error": "", "note": "",
    }
    try:
        seq = list(json.loads((CONTENT / gd / "path.json")
                              .read_text(encoding="utf-8")).get("sequence", []))
    except (OSError, json.JSONDecodeError) as exc:
        # Neperskaitytas kelias nėra „tvarka gera“: be jo negalima pasakyti
        # nieko apie vaiko „Tęsk nuo čia“. rc 1 ir priežastis žodžiais.
        out["error"] = f"path.json neperskaitytas ({type(exc).__name__}: {exc})"
        return out
    out["sequence_len"] = len(seq)
    if not seq:
        out["error"] = "path.json seka tuščia"
        return out

    pin = pinned_sequence(grade)
    if not pin:
        out["note"] = ("nėra užfiksuotos sekos `scripts/known_path_order.json` — "
                       "tvarka NEIŠMATUOTA (tai ne „nepajudėta“)")
        return out

    out["checked"] = True
    out["baseline"] = pin["label"]
    base = pin["seq"]
    out["reordered"] = reordered_ids(seq, base)
    out["inserted"] = inserted_midsequence(seq, base)
    out["ok"] = not out["reordered"]
    return out


def path_order_main(grade: int, as_json: bool) -> int:
    """Išveda `path_order_gate()` rezultatą žmogui arba JSON'u. rc 1 — raudona."""
    grades = [grade] if grade else live_grades()
    rows = [path_order_gate(g) for g in grades]
    ok = all(r["ok"] for r in rows)
    if as_json:
        print(json.dumps({"ok": ok, "grades": rows}, ensure_ascii=False))
        return 0 if ok else 1

    for r in rows:
        name = grade_dir(r["grade"])
        if r["error"]:
            print(f"MARŠRUTO TVARKA NEIŠMATUOTA — {name}: {r['error']}")
            continue
        if not r["checked"]:
            print(f"MARŠRUTO TVARKA NEIŠMATUOTA — {name}: {r['note']}")
            continue
        if r["reordered"]:
            print(f"SEKOS TVARKA PAJUDĖTA — {name}: {len(r['reordered'])} senų ID "
                  f"santykinė tvarka skiriasi nuo {r['baseline']}: "
                  f"{', '.join(r['reordered'])}.")
            print("  Pašalinus šiuos ID likusi tvarka atitinka ankstesnę, tad "
                  "vaiko „Tęsk nuo čia“ žingsnis persikėlė.")
            print("  Taisyk `path.json`: grąžink seną tvarką, o naujus modulius "
                  "įrašyk į pabaigą. Jei perstatymas sąmoningas — atnaujink "
                  "`scripts/known_path_order.json` tame pačiame commit'e "
                  "(tada jis matomas `git diff`).")
        else:
            print(f"✔ Maršruto tvarka nepajudėta — {name}: {r['sequence_len']} "
                  f"žingsnių, lyginta su {r['baseline']}.")
        if r["inserted"]:
            print(f"  Nauji moduliai įterpti į vidurį (ne į pabaigą): "
                  f"{', '.join(r['inserted'])} — leidžiama, bet „kitas žingsnis“ "
                  f"pasikeitė po jų einantiems.")
    return 0 if ok else 1


def live_grades() -> list[int]:
    try:
        data = json.loads(GRADES.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return [1]
    out = [int(g["grade"]) for g in data.get("grades", []) if g.get("status") == "live"]
    return out or [1]


def local_index(grade: int) -> tuple[dict, dict[str, str]]:
    path = CONTENT / grade_dir(grade) / "index.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    files: dict[str, str] = {}
    for strand in data.get("strands", []):
        for mod in strand.get("modules", []):
            if mod.get("file"):
                files[mod["id"]] = mod["file"]
    return data, files


RETRY_PAUSE = 1.5
FETCH_ATTEMPTS = 2
# Kiek užklausų teko kartoti po laikinos klaidos. Skaičius išvedamas, o ne
# nuslopinamas: tylus kartojimas paslėptų flakuojančią svetainę (LL-37).
RETRIES = {"count": 0}


def fetch_answer(url: str, timeout: int = 20,
                 attempts: int = FETCH_ATTEMPTS) -> tuple[str, bytes | None]:
    """(būsena, baitai), kur būsena yra `"ok"` | `"missing"` | `"unreachable"`.

    Atskyrimas atsirado dėl #386: `fetch()` grąžindavo `None` ir 404, ir
    laikinam ryšio gedimui, o `compare()` abu paversdavo „nepasiekta“.
    Svetainė, kurioje modulio failo **nėra**, pranešdavo „NEPASIEKTA po 2
    bandymų“: teiginys apie tinklą, kurio nebuvo — 404 yra atsakymas, ir jo
    net nekartojame. Vaikui skirtumas didelis: 404 reiškia „publikavimas
    nepaleistas / failas nedingo“, o nepasiekiamumas — „bandyk dar kartą“.
    404/410 — galutinis atsakymas, kitos klaidos kartojamos (LL-76, #368).
    """
    for attempt in range(max(1, attempts)):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return "ok", resp.read()
        except urllib.error.HTTPError as exc:
            if exc.code in (404, 410):
                return "missing", None
        except Exception:  # noqa: BLE001
            pass
        if attempt + 1 < max(1, attempts):
            RETRIES["count"] += 1
            time.sleep(RETRY_PAUSE)
    return "unreachable", None


def fetch(url: str, timeout: int = 20, attempts: int = FETCH_ATTEMPTS) -> bytes | None:
    """Failo turinys arba `None`. 404/410 — galutinis atsakymas, nekartojama.

    Anksčiau bet kokia klaida (503, ryšio nutrūkimas, timeout) virsdavo `None`
    po **vieno** bandymo, o `compare()` tokią `None` reikšmę paversdavo
    `stale_unknown` — t. y. vartai paskelbdavo „modulis nepasiekiamas“ apie
    failą, kuris svetainėje yra. Paleidimas #368: pirmas bėgimas rc 1 su
    `06-figuros`, `curl` tas pats adresas → 200 / 4 712 B, antras bėgimas rc 0.
    Todėl laikinos klaidos kartojamos, o `_audio_state()` ir `_shell_state()`
    turi tą patį kelią. 404/410 kartojami nėra: tai ne flakas, o atsakymas.
    """
    return fetch_answer(url, timeout, attempts)[1]



def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def compare(local_path: pathlib.Path, url_rel: str) -> tuple[str, int, int]:
    """(būsena, repo baitai, gyvi baitai).

    Būsena: `"ok"` | `"differs"` | `"absent"` | `"gone"` | `"unreachable"`.

    `"absent"` — repo failo nėra (indeksas rodo į nieką), `"gone"` — repo
    failas yra, o svetainė atsakė 404/410. Iki #386 abu atvejai su gyvos
    pusės klaida ėjo į `"unreachable"`, todėl svetainė be modulio failo
    pranešdavo „NEPASIEKTA po 2 bandymų“ — t. y. siūlė tikrinti ryšį, kai
    reikia publikuoti (LL-21, LL-37). Skirtumas vaikui konkretus: 404 niekada
    nepraeis savaime, nepasiekiamumas — gali.

    Baitų reikšmės: `-1` reiškia **neišmatuota**, ne 0. Tai svarbu, nes 0 baitų
    yra tikras matavimas (tuščias failas), o trūkstamas failas neturi jokio
    dydžio. Iki #370 abu atvejai rašė 0, todėl pranešimas apie failą, kurio
    repo nėra, skambėjo kaip matavimas: „repo 0 B, gyvai 0 B“ — nors gyvo failo
    dydis nebuvo matuotas net vieną kartą (`fetch()` net nebuvo iškviestas, nes
    funkcija grįždavo anksčiau). Vaikas tokiu atveju nematė nieko, o vartai
    pranešdavo „pasenęs turinys“, t. y. siūlė perkrauti publikavimą vietoj
    pataisyti indeksą (LL-21, LL-37).
    """
    if not local_path.exists():
        # Repo pusės nėra, bet gyva pusė **išmatuojama** ir tai keičia
        # pranešimą: jei svetainėje failas yra, defektas yra tik indeksas
        # (repo failą reikia grąžinti), o jei nėra — failo nėra niekur.
        # #370 klaida buvo priešinga: grįžtant be matavimo pranešime
        # atsirasdavo „repo 0 B, gyvai 0 B“, nors nė vienas dydis nebuvo
        # matuotas (LL-21, LL-37).
        state, live_size = head_state(url_rel)
        if state == "ok":
            return "absent", -1, live_size
        return "absent", -1, -1
    local = local_path.read_bytes()
    status, live = fetch_answer(LIVE_ROOT + url_rel)
    if status == "missing":
        # Atsakymas gautas: failo svetainėje nėra. Tai ne ryšio klaida ir ne
        # pasenęs turinys — nėra ko lyginti baitais (LL-21).
        return "gone", len(local), -1
    if live is None:
        return "unreachable", len(local), -1
    if sha(live) != sha(local):
        # LL-76: pirmomis sekundėmis po deploymento kraštas gali būti mišrus.
        time.sleep(1.5)
        live = fetch(LIVE_ROOT + url_rel)
        if live is None:
            return "unreachable", len(local), -1
    return ("ok" if sha(live) == sha(local) else "differs"), len(local), len(live)


def same_bytes(rel: str) -> tuple[str, int, int]:
    """(būsena, repo baitai, gyvi baitai) — žr. `compare()`."""
    return compare(CONTENT / rel, "content/lt/" + rel)


def shell_files() -> list[str]:
    """Svetainės failai, kuriuos naršyklė įkelia (`index.html`, JS, CSS, kiti `assets/`).

    Sąrašas imamas iš katalogų, ne įrašomas ranka: nauja simuliacija
    `assets/js/sims/` faile atsiranda be įrankio pakeitimo.

    `SHELL_GLOBS` išvardija tik `*.js` ir `*.css`, o `pages.yml` publikuoja
    visą `assets/` (`cp -r assets`). Todėl po jų pridedami visi kiti `assets/`
    failai — paveikslas, SVG, šriftas, JSON. Kitaip pirmas `assets/img/*.svg`
    būtų paskelbtas be vartų: baitai žali, o vaikas paveikslo adrese randa 404
    (LL-37 — riboja sąrašas, ne svetainė). `assets/audio/` praleidžiamas:
    garsą tikrina `check_audio()` ir AUX `manifest.json`.
    """
    out: list[str] = []
    for name, pattern in SHELL_GLOBS:
        path = ROOT / name
        if pattern is None:
            if path.exists():
                out.append(name)
            continue
        if path.is_dir():
            out += [str(p.relative_to(ROOT)) for p in sorted(path.rglob(pattern))]
    assets = ROOT / "assets"
    if assets.is_dir():
        for p in sorted(assets.rglob("*")):
            if not p.is_file():
                continue
            rel = p.relative_to(ROOT).as_posix()
            if rel.startswith("assets/audio/"):
                continue
            if rel not in out:
                out.append(rel)
    return out


def strip_version(text: str) -> str:
    """Nuima `?v=<commit>` — publikavimo žymą, ne turinio skirtumą."""
    return VERSION_PARAM.sub("", text)


def _shell_state(rel: str) -> tuple[str, int, int]:
    """("ok"|"differs"|"gone"|"unreachable", repo baitai, gyvi baitai)."""
    local_path = ROOT / rel
    if not local_path.exists():
        return "ok", 0, 0
    local = local_path.read_bytes()
    status, live = fetch_answer(LIVE_ROOT + rel)
    if status == "missing":
        # Svetainė kodo failo neturi: tai nepasibaigęs publikavimas, o ne
        # ryšio klaida (#386, ta pati LL-21 šeima kaip `compare()`).
        return "gone", len(local), -1
    if live is None:
        return "unreachable", len(local), -1
    for attempt in (0, 1):
        if strip_version(live.decode("utf-8", "replace")) == strip_version(local.decode("utf-8", "replace")):
            return "ok", len(local), len(live)
        if attempt == 0:
            # LL-76: pirmomis sekundėmis po deploymento kraštas gali būti mišrus.
            time.sleep(2.5)
            live = fetch(LIVE_ROOT + rel)
            if live is None:
                return "unreachable", len(local), -1
    return "differs", len(local), len(live)


def repo_version() -> str:
    try:
        return subprocess.run(
            ["git", "rev-parse", "--short=8", "HEAD"], cwd=ROOT, capture_output=True, text=True, timeout=20
        ).stdout.strip()
    except Exception:  # noqa: BLE001
        return ""


def live_version() -> str:
    """Commit'as, iš kurio sukurta gyva svetainė (`?v=` žymė `index.html`)."""
    blob = fetch(LIVE_ROOT + "index.html")
    if blob is None:
        return ""
    match = VERSION_PARAM.search(blob.decode("utf-8", "replace"))
    return match.group(0)[3:] if match else ""


def await_deploy(live: str, repo: str, skip: bool = False) -> tuple[str, int, bool]:
    """Laukia, kol gyva svetainė bus pastatyta iš `repo` (HEAD).

    Grąžina `(gyva versija po laukimo, laukta sekundžių, ar deploy nepasivijo)`.

    Kodėl laukti, o ne tik pranešti: baitų lyginimas HEAD atžvilgiu per
    deploy'aus langą kiekvieną neseniai pakeistą failą vadina „pasenusiu
    turiniu“. Tas pats atsitiko 2026-11-20 (#415): pirmas bėgimas — 35
    pasenę moduliai, antras (be jokio pakeitimo) — „sutampa“. Vaikui skirtas
    sprendimas buvo „taisyk turinį“, nors reikėjo tik palaukti.

    `skip` — yra neišsiųstų commit'ų: HEAD svetainėje negali pasirodyti, kol
    jie nepaskelbti, tad laukimas būtų tuščias (ir atrodytų kaip sulėtėjęs
    įrankis). Tuomet grąžinama išmatuota versija be laukimo.

    Jei gyvos versijos perskaityti nepavyko (tuščia), laukiama taip pat
    negalima — nežinomas dydis nėra „nepasivijo“ (LL-37): grąžinama tuščia
    versija ir `False`, o spręsti paliekama `verdict()`.
    """
    if skip or not live or not repo or live == repo or DEPLOY_WAIT <= 0:
        return live, 0, bool(live and repo and live != repo)
    started = time.monotonic()
    current = live
    while time.monotonic() - started < DEPLOY_WAIT:
        time.sleep(min(DEPLOY_POLL, max(1, int(DEPLOY_WAIT - (time.monotonic() - started)))))
        current = live_version() or current
        if current == repo:
            return current, int(time.monotonic() - started), False
    return current, int(time.monotonic() - started), current != repo


def site_reachable() -> bool:
    """Ar gyva svetainė iš viso atsako (HEAD į `index.html`).

    Vienas pigus matavimas prieš visus kitus. Be jo kiekviena gyva patikra
    atskirai aiškinosi tą patį gedimą ir kiekviena jo rezultatą pranešdavo
    kaip atskirą faktą: 48 moduliai „nepasiekiami“, 19 kodo failų
    „nepasiekiami“, 1432 garso įrašai „nepasiekiami“ — nors buvo vienas
    faktas (svetainė neatsiliepia), o 1451 užklausa tikrino ryšį, ne turinį.

    404/410 čia reiškia „serveris atsako“ — tada svetainė pasiekiama ir
    toliau matuojama įprastai.
    """
    state, _ = head_state("index.html")
    return state != "unreachable"


def check_shell() -> dict:
    files = shell_files()
    with ThreadPoolExecutor(max_workers=6) as pool:
        results = list(pool.map(lambda rel: (rel, _shell_state(rel)), files))
    stale: list[dict] = []
    unreachable: list[str] = []
    missing: list[str] = []
    for rel, (state, local_size, live_size) in results:
        if state == "differs":
            stale.append({"file": rel, "repo_bytes": local_size, "live_bytes": live_size})
        elif state == "gone":
            # Failo svetainėje nėra (404). Tai nepasibaigęs publikavimas, o ne
            # „nepasiekiamas“ — kitaip pranešimas siųstų tikrinti ryšį (#386).
            missing.append(rel)
        elif state == "unreachable":
            unreachable.append(rel)
    return {
        "shell_stale": stale,
        "shell_gone": missing,
        "shell_unreachable": unreachable,
        "shell_count": len(files),
        "live_version": live_version(),
        "repo_version": repo_version(),
    }



def orphan_module_files(grade: int, listed: set[str]) -> list[dict]:
    """Modulių failai, kurių klasės `index.json` nerodo.

    Tai **ne** tas pats kaip „failas nėra svetainėje“ (#386) ir ne „failas
    nėra repo“ (#370). Failas guli `content/lt/grade-NN/<kryptis>/`, tad
    `pages.yml` jį nukopijuoja ir svetainėje jis yra, bet naršyklė modulio
    ieško per `index.json` įrašą — be jo modulio vaikas nepasieks, nors
    dashboard'as failą skaičiuoja. Būtent tai yra šio vaidmens klausimas
    „kodėl dashboard rodo daugiau nei svetainė“ (#404).

    Skaičiavimas vietinis: tinklo neprireikia, todėl jis atliekamas ir tada,
    kai gyvo indekso perskaityti nepavyksta — failo buvimas repo yra faktas
    ne apie svetainę.
    """
    gdir = CONTENT / grade_dir(grade)
    out: list[dict] = []
    if not gdir.exists():
        return out
    for path in sorted(gdir.glob("*/*.json")):
        if path.stem in listed:
            continue
        out.append({"grade": grade, "id": path.stem,
                    "file": str(path.relative_to(CONTENT))})
    return out


def check_grade(grade: int, compare_bytes: bool = True) -> dict:
    gd = grade_dir(grade)
    # `repo_error` ir `live_error` yra skirtingi dalykai: pirmasis reiškia,
    # kad įrankis nemato **repo** indekso (taisyti reikia failą), antrasis —
    # kad neatsiliepia gyva svetainė. Iki #374 abu ėjo į `live_error`, o
    # `verdict()` iš to darė „gyva svetainė nepasiekiama“: veidrodis be
    # `grade-01/index.json` skelbė klaidą apie svetainę, nors svetainė sveika
    # (LL-21 — teiginys apie priežastį, kurios niekas neperskaitė).
    out: dict = {"grade": grade, "live_error": "", "repo_error": "", "live_gone": []}

    try:
        data, files = local_index(grade)
    except (OSError, json.JSONDecodeError) as exc:
        out["repo_error"] = f"repo {gd}/index.json: {type(exc).__name__}: {exc}"
        return out
    local_ids = [m["id"] for s in data.get("strands", []) for m in s.get("modules", [])]

    live_ids: list[str] = []
    live_seq: list[str] = []
    live_index_ok = False
    # Klasės indeksas ir `path.json` skaitomi prieš bet kurį modulį, tad jų
    # 404 yra atskiras faktas, ne ryšio klaida: tai nepaskelbta klasė
    # (`grades.json` jau sako `live`, o katalogas dar ne svetainėje). Iki #388
    # `fetch()` grąžindavo `None` abiem atvejais, o `verdict()` iš to darė
    # „gyva svetainė nepasiekiama“ — tame pačiame pranešime, kuriame garso
    # patikra ėjo per tą pačią svetainę ir rado viską (LL-21, LL-120 vienu
    # lygiu aukščiau: priežastis, kurios niekas neperskaitė).
    for name in ("index.json", "path.json"):
        status, blob = fetch_answer(f"{LIVE_ROOT}content/lt/{gd}/{name}")
        if status == "missing":
            # 404 — atsakymas, ne gedimas: failo svetainėje nėra.
            out["live_gone"].append(f"{gd}/{name}")
            break
        if blob is None:
            out["live_error"] = out["live_error"] or f"gyvas {gd}/{name} nepasiekiamas"
            break
        if name == "index.json":
            live_data = json.loads(blob.decode("utf-8"))
            live_ids = [m["id"] for s in live_data.get("strands", []) for m in s.get("modules", [])]
            live_index_ok = True
        else:
            live_seq = list(json.loads(blob.decode("utf-8")).get("sequence", []))

    out["live_index_ok"] = live_index_ok
    # Ar `published` yra matavimas, ar tik nulis vietoj jo. Kai gyvo indekso
    # neperskaitėme, „Paskelbta: 0“ yra teiginys apie svetainę, kurios
    # nematėme (#382, LL-37/LL-21).
    out["published_measured"] = live_index_ok
    out["local"] = len(local_ids)
    out["published"] = len(live_ids)
    if live_index_ok:
        out["missing_on_live"] = [m for m in local_ids if m not in live_ids]
        out["hidden_locally"] = [m for m in live_ids if m not in local_ids]
    else:
        # Gyvo indekso nematėme, tad bet kuris sąrašas būtų teiginys apie
        # neperskaitytą svetainę. #374: svetainės gedimas atspausdindavo
        # „NESKELBTA (45)“ — t. y. visą klasę „nepaskelbta“ — nors nebuvo
        # perskaitytas nė vienas gyvas failas (LL-37). Sprendimą neša
        # `live_error` (`verdict()` → rc 1), o ne išgalvotas sąrašas.
        out["missing_on_live"] = []
        out["hidden_locally"] = []

    # LL-88: abi dabartys gali sutapti, o ID vis tiek gali būti dingęs.
    # Nuo to priklauso vaiko `localStorage` žyma, todėl tikrinama ne tik
    # „repo vs gyva“, bet ir „šiandien vs istorija“.
    gone = vanished(grade, local_ids)
    out["vanished_ids"] = gone["items"]
    out["history_note"] = gone["note"]
    out["history_checked"] = gone["checked"]

    try:
        local_seq = list(json.loads((CONTENT / gd / "path.json").read_text(encoding="utf-8")).get("sequence", []))
    except (OSError, json.JSONDecodeError):
        local_seq = []
    out["not_in_path"] = [m for m in local_ids if m not in local_seq]
    # Failai, kurių indeksas nemini (#404). Skaičiuojama vietinėje pusėje, todėl
    # ir tada, kai gyvo indekso perskaityti nepavyko: failo buvimas repo yra
    # faktas apie repo, ne apie tinką.
    out["orphan_files"] = orphan_module_files(grade, set(local_ids))
    out["path_differs"] = bool(live_seq) and live_seq != local_seq
    if out["path_differs"]:
        out["path_missing"] = [m for m in local_seq if m not in live_seq]
        out["path_extra"] = [m for m in live_seq if m not in local_seq]
    # Santykinė senų ID tvarka. Aibė gali būti teisinga (`not_in_path` 0), o
    # žingsnių tvarka pajudėta — tada vaiko „Tęsk nuo čia“ rodo į kitą vietą,
    # nors kiekvienas skaičius pranešime sutampa (AGENTS.md: „esama tvarka
    # nesikeistų“; gairės T3.6). Matuojama prieš HEAD / paskutinį path.json
    # commit'ą, ne prieš šiandieninį failą, nes kitaip skirtumo nebūtų.
    out.update(path_order_check(grade, local_seq))

    stale: list[dict] = []
    stale_unknown: list[str] = []
    live_missing: list[dict] = []
    unmeasured: list[str] = []
    # Indekso įrašai, rodantys į failą, kurio repo nėra — matuojama **be
    # tinklo** ir nepriklausomai nuo gyvos svetainės būsenos (#506). Iki tol
    # sąrašas pildėsi tik baitų cikle, o tas ciklas sąmoningai praleidžia
    # `missing_on_live` ID (2026-11-12: vienas ID neturi pasirodyti dviejose
    # eilutėse). Pasekmė: lūžęs indeksas, kurio modulis dar ir nepaskelbtas,
    # atrodė tik kaip „1 neskelbta“ — t. y. taisymas „paleisk publikavimą“,
    # nors publikavimas tokio modulio neįkelia ir vaikas jo niekada negaus
    # (LL-37: vienas defektas paslėpė kitą, sunkesnį).
    missing_in_repo: list[dict] = [
        {"id": mid, "file": files[mid], "grade": grade,
         "repo_bytes": -1, "live_bytes": -1}
        for mid in local_ids if files.get(mid) and not (CONTENT / files[mid]).exists()
    ]
    if compare_bytes:
        # Modulys, kurio ID gyvame `index.json` nėra, jau įvardytas kaip
        # NESKELBTA — jo baitų skirtumas nieko neprideda, o pranešime atrodytų
        # kaip antras, kitoks defektas („turinys pasenęs“), nors turinys
        # nepasenęs: jo svetainėje tiesiog nėra. 2026-11-12 zondas su veidrodžiu
        # rodė tą patį ID abiejose eilutėse.
        missing = set(out["missing_on_live"])
        if live_index_ok:
            todo = [(mid, files[mid]) for mid in local_ids if mid in files and mid not in missing]
            with ThreadPoolExecutor(max_workers=8) as pool:
                results = list(pool.map(lambda pair: (pair[0], pair[1], same_bytes(*pair[1:])), todo))
            for mid, rel, (state, local_size, live_size) in results:
                if state == "ok":
                    continue
                if state == "absent":
                    # Indeksas rodo į failą, kurio repo nėra (#370). Tai ne
                    # „pasenęs turinys“ ir ne „nepasiekiamas“: publikavimas čia
                    # nieko nepakeis, kol indeksas netaisytas. Vaidmens taisyklė
                    # šį atvejį vadina lūžusiu indeksu ir reikalauja jį įvardyti
                    # atskirai, o ne sumaišyti su publikavimo defektais.
                    # Įrašas jau yra (sėjamas aukščiau) — papildomi tik dydžiai.
                    for item in missing_in_repo:
                        if item["id"] == mid:
                            item["repo_bytes"] = local_size
                            item["live_bytes"] = live_size
                            break
                elif state == "gone":
                    # Svetainė atsakė 404/410: failo ten nėra, nors indeksas jį
                    # rodo. Tai nepasibaigęs publikavimas, o ne „bandyk dar
                    # kartą“ (#386). Sąrašas atskiras, nes baitų nėra su kuo
                    # lyginti — `live_size` čia `-1`, ir be šios šakos įrašas
                    # nukristų į „neišmatuotas dydis“.
                    live_missing.append({"id": mid, "file": rel, "grade": grade,
                                         "repo_bytes": local_size})
                elif state == "unreachable":
                    stale_unknown.append(mid)
                elif live_size < 0 or local_size < 0:
                    # Būsena „differs“, bet vienas dydis neišmatuotas — tokio
                    # derinio būti neturėtų; jei atsiranda, sakome tai žodžiais,
                    # o ne spausdiname -1 kaip baitus (LL-37).
                    unmeasured.append(mid)
                else:
                    stale.append({"id": mid, "file": rel, "repo_bytes": local_size,
                                  "live_bytes": live_size})
        # Kai gyvo indekso neperskaitėme, lūžę indekso įrašai jau surašyti
        # aukščiau — jie repo faktas, ne svetainės matavimas (#382, LL-37).
    out["stale"] = stale
    out["stale_unknown"] = stale_unknown
    out["live_missing"] = live_missing
    out["missing_in_repo"] = missing_in_repo
    if unmeasured:
        out["stale_unmeasured"] = unmeasured

    # LL-78: klasės indeksas ir seka skaitomi prieš modulį, todėl jų baitai
    # lyginami atskirai — kitaip „ID yra“ nereiškia „svetainė rodo tą patį“.
    aux_stale: list[dict] = []
    aux_absent: list[dict] = []
    aux_gone: list[dict] = []
    if compare_bytes and live_index_ok:
        for name in ("index.json", "path.json"):
            url_rel = f"content/lt/{gd}/{name}"
            state, local_size, live_size = compare(CONTENT / gd / name, url_rel)
            if state == "ok":
                continue
            item = {"file": url_rel, "state": state,
                    "repo_bytes": local_size, "live_bytes": live_size}
            if state == "absent":
                aux_absent.append(item)
            elif state == "gone":
                aux_gone.append(item)
            else:
                aux_stale.append(item)
    out["aux_stale"] = aux_stale
    out["aux_absent"] = aux_absent
    out["aux_gone"] = aux_gone
    return out


def unpushed() -> tuple[list[str], bool]:
    """(commit'ai, kurių nėra `origin/main`, ar patikra įvyko).

    Anksčiau bet kokia git klaida (`origin/main` dar nenuskaitytas, veidrodis be
    remote, sulūžęs indeksas) virsdavo tuščiu sąrašu — t. y. „0 neišsiųstų“ ir
    žaliu „sutampa“. 2026-11-15 (#308) šviežias repo be `origin/main`: tikras
    `git rev-list` grąžino rc 128 ir tuščią stdout, o įrankis pranešė 0. Tai ta
    pati LL-37/LL-10 šeima: skaičius, kuris atrodo išmatuotas, bet nėra.
    Antrasis reikšmės narys eina į `verdict()`, kad „nepatikrinta“ būtų
    pasakyta žodžiais, o ne tylėtų.
    """
    try:
        proc = subprocess.run(
            ["git", "rev-list", "origin/main..HEAD"], cwd=ROOT, capture_output=True, text=True, timeout=30
        )
    except Exception:  # noqa: BLE001
        return [], False
    if proc.returncode != 0:
        return [], False
    return [c for c in proc.stdout.split() if c], True


def last_commit() -> str:
    try:
        return subprocess.run(
            ["git", "log", "--oneline", "-1"], cwd=ROOT, capture_output=True, text=True, timeout=20
        ).stdout.strip()
    except Exception:  # noqa: BLE001
        return ""


def report(grades: list[int] | None = None, compare_bytes: bool = True,
           audio_sample: int | None = None) -> dict:
    RETRIES["count"] = 0
    grades = grades or live_grades()
    # Vienas pigus HEAD prieš viską: jei svetainė neatsiliepia, likusios gyvos
    # patikros (pagrindiniai failai, svetainės kodas, 1432 garso įrašai) duotų
    # tik ilgą „nepasiekiama“ sąrašą — vieną gedimą, pakartotą 1451 kartą.
    # Matuojama kartą, o pranešime pasakoma, kas NETIKRINTA (#382).
    live_reachable = site_reachable()
    live_bytes_ok = compare_bytes and live_reachable
    # Neišsiųsti commit'ai skaičiuojami **prieš** laukimą: jei HEAD dar
    # neišstumtas, svetainė jo net negauna, tad laukti būtų be prasmės.
    unpushed_list, unpushed_ok = unpushed()
    # Deploy'aus langas: svetainė gali būti dar pastatyta iš ankstesnio
    # commit'o (bėgikas išstumia backlog'ą prieš šį darbą). Tuomet baitų
    # skirtumai yra laiko, ne turinio defektas — laukiama, kol `?v=` pasivys
    # HEAD. `--no-bytes` režime baitai nelyginami, tad ir laukti nereikia.
    live_v = live_version() if live_bytes_ok else ""
    repo_v = repo_version()
    live_v, deploy_waited, deploy_pending = await_deploy(
        live_v, repo_v, skip=(not live_bytes_ok) or bool(unpushed_list))
    per_grade = [check_grade(g, compare_bytes) for g in grades]

    def merge(key: str) -> list:
        out: list = []
        for g in per_grade:
            out.extend(g.get(key, []))
        return out

    live_errors = [f"{grade_dir(g['grade'])}: {g['live_error']}" for g in per_grade if g.get("live_error")]
    repo_errors = [f"{grade_dir(g['grade'])}: {g['repo_error']}" for g in per_grade if g.get("repo_error")]

    # Svarbiausias failas, kurio modulio baitų ciklas neapima: garso manifestas.
    # Jo stagnacija reiškia 404 naujo modulio garsui, o visi kiti vartai žali.
    aux_stale = list(merge("aux_stale"))
    aux_absent = list(merge("aux_absent"))
    aux_gone = list(merge("aux_gone"))
    if live_bytes_ok:
        for url_rel, local_path in AUX_FILES:
            # Kontraktas yra būsena, ne boolean: `compare()` grąžina
            # "ok"|"differs"|"absent"|"gone"|"unreachable". Iki #372 čia buvo
            # `if not ok:` — o ne tuščia būsena visada teisinga, tad
            # pasenęs `manifest.json` / `grades.json` būdavo tyliai
            # nerodomas (tyli žalia, blogiau nei prieš #370 darbą).
            state, local_size, live_size = compare(local_path, url_rel)
            if state == "ok":
                continue
            item = {"file": url_rel, "state": state,
                    "repo_bytes": local_size, "live_bytes": live_size}
            if state == "absent":
                aux_absent.append(item)
            elif state == "gone":
                aux_gone.append(item)
            else:
                aux_stale.append(item)

    # Svetainės kodas: ką vaikas iš tikrųjų įkelia, o ne tik ką rodo turinio JSON.
    shell = check_shell() if live_bytes_ok else {
        "shell_stale": [], "shell_unreachable": [], "shell_count": 0,
        "live_version": "", "repo_version": "", "skipped": True,
    }

    # Garsas: manifestas lyginamas aukščiau, bet failai — ne. Be šios dalies
    # „sutampa“ galėjo reikšti „manifestas teisingas, o mp3 svetainėje nėra“.
    if live_bytes_ok:
        audio = check_audio(None if not compare_bytes else audio_sample)
    elif not compare_bytes:
        audio = {
            "total": 0, "checked": 0, "sampled": False,
            "missing": [], "empty": [], "unreachable": [],
            "note": "garso patikra praleista (--no-bytes)",
        }
    else:
        # Svetainė neatsiliepia: 1432 HEAD užklausos matuotų ryšį, ne garsą.
        # Pasakoma žodžiais, o ne „trūksta 1432“ (#382).
        audio = {
            "total": 0, "checked": 0, "sampled": False,
            "missing": [], "empty": [], "unreachable": [],
            "note": "garso patikra neįvyko — svetainė nepasiekiama",
        }

    # Vardo maišo patikra — vietinė, be tinklo: ji galioja ir kai svetainė
    # nepasiekiama, nes kalbama apie repo failus. Būtent ji paverčia HEAD
    # patikrą „yra toks failas“ į „yra tie baitai“ (#426).
    audio_name = audio_name_digest()

    # Neišsiųsti commit'ai jau perskaityti prieš laukimą (žr. `report()`):
    # git klaida anksčiau atrodė kaip „0 neišsiųstų“ (žr. funkcijos docstring).

    out = {
        "grades": per_grade,
        "live_grades": grades,
        # Suderinta su senuoju formatu (changelog'ai ir dashboard'as skaito šiuos raktus).
        "local": sum(g.get("local", 0) for g in per_grade),
        "published": sum(g.get("published", 0) for g in per_grade),
        "missing_on_live": merge("missing_on_live"),
        "hidden_locally": merge("hidden_locally"),
        "not_in_path": merge("not_in_path"),
        "orphan_files": merge("orphan_files"),
        "vanished_ids": merge("vanished_ids"),
        "history_note": "; ".join(g.get("history_note", "") for g in per_grade if g.get("history_note")),
        "history_unchecked": [g["grade"] for g in per_grade if g.get("history_checked") is False],
        "stale": merge("stale"),
        "stale_unknown": merge("stale_unknown"),
        "stale_unmeasured": merge("stale_unmeasured"),
        "live_missing": merge("live_missing"),
        "live_gone": merge("live_gone"),
        "missing_in_repo": merge("missing_in_repo"),
        "aux_stale": aux_stale,
        "aux_absent": aux_absent,
        "aux_gone": aux_gone,
        "audio": audio,
        # Vardo maišo patikra — vietinė, be tinklo (#426/#428). `audio` sako
        # „failas svetainėje yra“, o šis laukas — „tas failas yra tie baitai,
        # kuriuos žada jo vardas“. Skyrė ne teorinis: nukirptas mp3 su senu
        # vardu praeitų HEAD patikrą, o vaikas girdėtų pusę žodžio.
        "audio_name": audio_name,
        "shell_stale": shell["shell_stale"],
        "shell_gone": shell.get("shell_gone", []),
        "shell_unreachable": shell["shell_unreachable"],
        "shell_count": shell["shell_count"],
        "live_version": shell["live_version"],
        "repo_version": shell["repo_version"],
        # Deploy'aus langas. `deploy_pending` reiškia: gyva svetainė pastatyta
        # iš kito commit'o nei repo HEAD, tad baitų skirtumai gali būti laiko,
        # ne turinio. Be šio lauko #415 tas pats commit'as davė „35 pasenę
        # moduliai“ ir „sutampa“ — priklausomai nuo to, kada bėgimas įvyko.
        "deploy_pending": deploy_pending,
        "deploy_live_version": live_v,
        "deploy_waited": deploy_waited,
        "path_differs": [g["grade"] for g in per_grade if g.get("path_differs")],
        # Santykinė `path.json` tvarka: atskiri sąrašai, nes taisymas kitas nei
        # „įrašyk trūkstamą ID“ (`not_in_path`) ar „seka pasenusi“ (`path_differs`).
        "path_reordered": merge("path_reordered"),
        "path_inserted_midsequence": merge("path_inserted_midsequence"),
        "path_order_baseline": "; ".join(
            f"{grade_dir(g['grade'])} {g['path_order_baseline']}"
            for g in per_grade if g.get("path_order_baseline")),
        "path_order_checked": all(g.get("path_order_checked", False) for g in per_grade),
        "path_order_note": "; ".join(
            g["path_order_note"] for g in per_grade if g.get("path_order_note")),
        "unpushed_commits": len(unpushed_list),
        "unpushed_checked": unpushed_ok,
        "retried_requests": RETRIES["count"],
        "last_commit": last_commit(),
        "live_error": "; ".join(live_errors),
        "repo_error": "; ".join(repo_errors),
        # Ką šis bėgimas **iš tikrųjų** matavo. Be šio lauko `--no-bytes` ar
        # nepasiekiamos svetainės sėkmės eilutė skelbė matavimus, kurių
        # nebuvo (#374, #382).
        "bytes_checked": compare_bytes,
        "live_measured": live_reachable,
        # `published` skaičiuojamas tik iš perskaityto gyvo indekso. Kai jo
        # nėra, skaičius yra 0, bet tai ne matavimas — todėl atskiras laukas
        # (dashboard'as ir žmogus turi matyti skirtumą).
        "published_measured": all(g.get("published_measured", False) for g in per_grade),
    }
    # Sprendimas keliauja kartu su duomenimis: dashboard'as neperrašo taisyklės
    # savo (LL-10 — būsena iš to paties šaltinio, iš kurio imamas rc).
    out["verdict"] = verdict(out)
    return out


def verdict(data: dict) -> dict:
    """Vienintelis sprendimo šaltinis: kodėl publikuota / kodėl ne.

    Dashboard'as anksčiau pats skaičiavo „sutampa“ iš dviejų raktų
    (`missing_on_live`, `unpushed_commits`), o vartai rc=1 dar ir dėl `stale`,
    `stale_unknown`, `aux_stale`, `path_differs`, `shell_stale`. Žmogus matė
    žalią kortelę, kai įrankis buvo raudonas (#12895, LL-10 klasė). Todėl
    priežastys skaičiuojamos čia, o `problems()` ir dashboard'as tik skaito
    rezultatą.
    """
    reasons: list[str] = []
    # Repo klaida — pirmoji, nes ji yra šaknis: kol įrankis nemato klasės
    # indekso, jokia išvada apie svetainę negalioja. #374: anksčiau šis
    # atvejis virsdavo „gyva svetainė nepasiekiama“ ir siuntė taisyti ne to.
    if data.get("repo_error"):
        reasons.append("repo indekso nepavyko perskaityti")
    if data.get("live_error"):
        reasons.append("gyva svetainė nepasiekiama")
    # Klasės indekso 404: svetainė atsako, bet klasės katalogo joje nėra.
    # Atskira priežastis, nes taisymas kitas — publikuoti, o ne kartoti
    # užklausą. Iki #388 šis atvejis virsdavo „gyva svetainė nepasiekiama“,
    # nors tame pačiame pranešime garso patikra ėjo per tą pačią svetainę
    # (LL-21, LL-120 vienu lygiu aukščiau).
    if data.get("live_gone"):
        reasons.append(f"klasės failo nėra svetainėje (404): {', '.join(data['live_gone'])}")
    # `published` be perskaityto gyvo indekso yra nulis vietoj matavimo. Jei
    # dėl kokios nors priežasties `live_error` liko tuščias, skaičius vis tiek
    # neturi atrodyti išmatuotas (#382). Kai indekso svetainėje nėra, priežastis
    # jau įvardyta aukščiau, tad kartoti „neišmatuota“ nereikia.
    if (data.get("published_measured") is False and not data.get("live_error")
            and not data.get("live_gone")):
        reasons.append("paskelbtų modulių skaičius neišmatuotas")
    # Deploy'aus langas — prieš visas baitų priežastis: kai svetainė pastatyta
    # iš ankstesnio commit'o, „N pasenęs modulis“ yra to pasekmė, o taisymas
    # ne toks (reikia palaukti / paleisti publikavimą, ne taisyti turinį).
    # #415: tas pats commit'as davė ir 35, ir 0 — skirtumas buvo tik laikas.
    if data.get("deploy_pending"):
        live = data.get("deploy_live_version") or data.get("live_version") or "?"
        repo = data.get("repo_version") or "?"
        reasons.append(
            f"svetainė pastatyta iš {live}, o repo HEAD {repo} — deploy nepasivijo "
            f"per {data.get('deploy_waited', 0)} s")
    if data.get("missing_on_live"):
        reasons.append(f"{len(data['missing_on_live'])} neskelbta")
    if data.get("hidden_locally"):
        reasons.append(f"{len(data['hidden_locally'])} dingo iš repo")
    if data.get("not_in_path"):
        reasons.append(f"{len(data['not_in_path'])} ne kelyje")
    if data.get("orphan_files"):
        # Failas yra repo ir svetainėje (pages.yml kopijuoja visą content/), bet
        # indekso įrašo nėra — naršyklė jo neprašo. Tai ne publikavimo
        # trūkumas, kurį ištaisytų push, ir ne ryšio klaida: trūksta įrašo
        # `index.json` (#404).
        reasons.append(f"{len(data['orphan_files'])} modulio failo be indekso įrašo")
    unexplained = [v for v in data.get("vanished_ids", []) if not v.get("resolved")]
    if unexplained:
        reasons.append(f"{len(unexplained)} dingęs ID (pažanga liko be modulio)")
    # Pervadinimas, kurio naršyklė neperkelia: `known_renames.json` sako
    # „įpėdinis yra“, o `index.json` `renamed_from` neturi — žyma liktų
    # našlaite. Tai ne tas pats kaip „mechanizmo nėra“ (#356), todėl
    # tikrinama kiekvieno įrašo duomenimis, o ne prielaida.
    orphan = [v for v in data.get("vanished_ids", [])
              if v.get("resolved") and not v.get("alias_ok")]
    if orphan:
        reasons.append(f"{len(orphan)} pervadintas ID be alias (žyma liktų našlaite)")
    if data.get("history_unchecked"):
        reasons.append("dingusių ID patikra neįvyko")
    # Tyli riba: git istorijos neperskaičius, „tvarka nepajudėta“ būtų
    # teiginys apie matavimą, kurio nebuvo (LL-37).
    if data.get("path_order_checked") is False:
        reasons.append("sekos tvarkos patikra neįvyko")
    if data.get("stale"):
        reasons.append(f"{len(data['stale'])} pasenęs modulis")
    if data.get("live_missing"):
        # Atsakymas 404, ne laikinas ryšio gedimas. Atskira priežastis, nes
        # taisymas kitas: paleisti publikavimą, o ne bandyti dar kartą (#386).
        reasons.append(f"{len(data['live_missing'])} modulio failo nėra svetainėje")
    if data.get("stale_unknown"):
        reasons.append(f"{len(data['stale_unknown'])} nepasiekiamas modulis")
    if data.get("stale_unmeasured"):
        reasons.append(f"{len(data['stale_unmeasured'])} modulis su neišmatuotu dydžiu")
    if data.get("missing_in_repo"):
        # Indeksas rodo į failą, kurio repo nėra. Publikavimas čia nieko
        # nepakeis — priežastis kitokia, todėl ir eilutė kitokia (LL-21).
        reasons.append(f"{len(data['missing_in_repo'])} indekso įrašas be failo repo")
    if data.get("path_differs"):
        reasons.append("kelio seka skiriasi")
    # Senų ID tvarka pajudėta: kiekvienas ID yra, bet vaiko „Tęsk nuo čia“
    # rodo į kitą žingsnį nei vakar. Tai ne tas pats kaip „trūksta ID“ ar
    # „seka pasenusi“, todėl ir priežastis sava (LL-21).
    if data.get("path_reordered"):
        reasons.append(f"{len(data['path_reordered'])} senų ID tvarka pajudėta")
    if data.get("aux_stale"):
        reasons.append(f"{len(data['aux_stale'])} pasenęs pagrindinis failas")
    if data.get("aux_absent"):
        reasons.append(f"{len(data['aux_absent'])} pagrindinis failas be repo kopijos")
    if data.get("aux_gone"):
        reasons.append(f"{len(data['aux_gone'])} pagrindinio failo nėra svetainėje")
    if data.get("shell_stale"):
        reasons.append(f"{len(data['shell_stale'])} pasenęs kodas")
    if data.get("shell_gone"):
        reasons.append(f"{len(data['shell_gone'])} svetainės kodo failo nėra")
    if data.get("shell_unreachable"):
        reasons.append(f"{len(data['shell_unreachable'])} nepasiekiamas kodas")
    audio = data.get("audio") or {}
    if audio.get("missing"):
        reasons.append(f"{len(audio['missing'])} trūksta garso failo")
    if audio.get("empty"):
        reasons.append(f"{len(audio['empty'])} tuščias garso failas")
    if audio.get("unreachable"):
        reasons.append(f"{len(audio['unreachable'])} nepasiekiamas garso failas")
    # Failas yra, bet svetainė siunčia kitokio dydžio baitus (nutrūkęs, pusiau
    # įkeltas, senas). Tai ne „trūksta garso“: pergeneravimas nieko nepakeis,
    # o publikavimas pakeis — todėl ir priežastis sava (LL-129, LL-21).
    if audio.get("size_mismatch"):
        reasons.append(f"{len(audio['size_mismatch'])} garso failas svetainėje "
                       f"kitokio dydžio nei repo (nutrūkęs įrašas)")
    # Vardo maišo patikra (#426/#428). Tai NE „trūksta garso“: failas yra, bet
    # jo baitai ne tie, kuriuos žada vardas — taisymas pergeneruoti, ne
    # publikuoti. Del to atskira priežastis, o ne ta pati eilutė.
    name = data.get("audio_name") or {}
    if name.get("mismatch"):
        reasons.append(f"{len(name['mismatch'])} garso failo vardas rodo kitą "
                       f"turinį (pergeneruoti, ne publikuoti)")
    if name.get("text_mismatch"):
        # Baitai savi, bet vardo priekis rodo KITĄ tekstą. Atskira priežastis:
        # jei ši būsena susilietų su `mismatch`, pranešimas kaltintų failo
        # baitus, nors jie sveiki — o taisymas kitas (pergeneruoti tekstui,
        # ne atkurti baitams). LL-129: būsena be savo šakos virsta „kita“.
        reasons.append(f"{len(name['text_mismatch'])} garso failo vardas rodo "
                       f"kitą TEKSTĄ (garsas senesnis už tekstą, pergeneruoti)")
    if name.get("absent"):
        # Įrašas manifeste, failo repo nėra. `check_audio()` tai jau mato kaip
        # „dangling“, bet būtent šis laukas pasako, kad vardo maišo patikra
        # to įrašo NEATLIKO — kitaip suma atrodytų pilna (LL-37).
        reasons.append(f"{len(name['absent'])} garso įrašo failo nėra repo "
                       f"(vardo maišas nepatikrintas)")
    # Numatytasis `False`, ne `True`: nežinoma būsena neturi atrodyti kaip
    # išmatuotas nulis. `check()` visada įrašo raktą, tad šis kelias liečia tik
    # svetimus dict'us (senas snapshot'as, rankinis zondas) — jiems saugiau
    # pasakyti „nepatikrinta“ negu „0 neišsiųstų“ (#310 zondas: `verdict({})`
    # anksčiau grąžino žalią „sutampa“).
    if not data.get("unpushed_checked", False):
        reasons.append("neišsiųstų commit'ų patikra neįvyko")
    elif data.get("unpushed_commits"):
        reasons.append(f"{data['unpushed_commits']} neišsiųstas commit")
    return {"ok": not reasons, "reasons": reasons,
            "label": "sutampa" if not reasons else reasons[0]}


def problems(data: dict) -> bool:
    return not verdict(data)["ok"]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--grade", type=int, default=0, help="tikrinti vieną klasę")
    ap.add_argument("--no-bytes", action="store_true", help="greita: tik ID ir seka")
    ap.add_argument("--path-order", action="store_true",
                    help="be tinklo ir be git: tik maršruto tvarka prieš "
                         "scripts/known_path_order.json (CI vartams)")
    ap.add_argument("--audio-full", action="store_true",
                    help="tikrinti visus garso įrašus (tai yra ir numatytasis režimas)")
    ap.add_argument("--audio-sample", type=int, default=0,
                    help=f"greitas režimas: tikrinti tik N garso įrašų mėginį "
                         f"(pvz. --audio-sample {AUDIO_SAMPLE}; toks mėginys nemato "
                         f"pavienių 404 — tik rankiniam bėgimui)")
    args = ap.parse_args()

    # Tvarkos vartai pirmi: jie be tinklo ir be `git show`, tad CI klone matuoja
    # tą patį, ką vietoje. Visi kiti režimai lygina su gyva svetaine, kuri PR
    # metu dar nerodo šio commit'o.
    if args.path_order:
        return path_order_main(args.grade, args.json)

    grades = [args.grade] if args.grade else None
    # Numatytai — visi garso įrašai (#303: mėginys duoda žalią šalia 404 mp3).
    sample = args.audio_sample if args.audio_sample > 0 and not args.audio_full else None
    data = report(grades, compare_bytes=not args.no_bytes, audio_sample=sample)

    if args.json:
        print(json.dumps(data, ensure_ascii=False))
        return 1 if problems(data) else 0

    print(f"Repozitorija: {data['local']} moduliai")
    if data.get("published_measured", True):
        print(f"Paskelbta:    {data['published']} moduliai")
    elif data.get("live_gone"):
        # 404 yra atsakymas: klasės katalogo svetainėje nėra. Ne „neperskaityta“.
        print(f"Paskelbta:    neišmatuota — svetainėje nėra "
              f"{', '.join(data['live_gone'])} (404)")
    else:
        # Ne „0 modulių“: tiek pat tiesos būtų sakyti „0“ ir „48“, nes gyvo
        # indekso niekas neperskaitė (#382, LL-37).
        print("Paskelbta:    neišmatuota — gyvos svetainės indeksas neperskaitytas")
    for g in data["grades"]:
        live = g.get("published", 0) if g.get("published_measured", True) else "neišmatuota"
        print(f"  · {grade_dir(g['grade'])}: repo {g.get('local', 0)}, gyvai {live}")
    if not data.get("live_measured", True):
        # Viena priežastis, viena eilutė. Anksčiau šis vienas faktas virsdavo
        # 48 modulių + 19 kodo failų + 1432 garso įrašų sąrašu (LL-37).
        print("SVETAINĖ NEPASIEKIAMA — pagrindiniai failai, svetainės kodas ir garsas "
              "NETIKRINTI (matuoti neįmanoma). Taisyk pasiekiamumą, ne turinį.")
    if data["repo_error"]:
        # Ne „svetainė nepasiekiama“: įrankis nemato repo indekso, o be jo
        # bet kokia išvada apie svetainę yra spėjimas (#374).
        print(f"REPO INDEKSAS NEPERSKAITYTAS: {data['repo_error']}")
        print("  Taisyk repo failą — publikavimas čia nieko nepakeis.")
    if data["live_error"]:
        print(f"Gyvos svetainės klaida: {data['live_error']}")
    if data.get("live_gone"):
        # Ne „svetainė nepasiekiama“: svetainė atsakė 404, tad trūksta
        # publikavimo, o ne ryšio. Svetainės klaida šiame bėgime tuščia, o
        # garso patikra ėjo per tą pačią svetainę (#388, LL-120).
        print(f"SVETAINĖJE NĖRA KLASĖS FAILO — svetainė atsakė 404 "
              f"({len(data['live_gone'])}): {', '.join(data['live_gone'])}")
        print("  Publikuok klasę — kiti adresai svetainėje atsakė, tad tai ne ryšio gedimas.")
    if data.get("deploy_pending"):
        # Ne „pasenęs turinys“: skirtumas yra laiko, ne failo. Vaikui skirtas
        # sprendimas kitas — laukti arba paleisti publikavimą (#415).
        print(f"PUBLIKAVIMAS NEPASIVIJO — svetainė pastatyta iš "
              f"{data.get('deploy_live_version') or '?'}, repo HEAD "
              f"{data.get('repo_version') or '?'}, laukta {data.get('deploy_waited', 0)} s.")
        print("  Žemiau esantys baitų skirtumai yra to pasekmė, o ne atskiri turinio "
              "defektai: neliesk failų, paleisk publikavimą (arba pakartok patikrą).")
    elif data.get("deploy_waited"):
        # Tylus laukimas būtų tas pats kaip tyli riba (LL-37): pasakoma, ką
        # įrankis veikė ir kad baitai lyginti jau su HEAD.
        print(f"Deploy pasivijo per {data['deploy_waited']} s — baitai lyginti su HEAD "
              f"({data.get('deploy_live_version') or '?'}).")
    if data["missing_on_live"]:
        print(f"NESKELBTA ({len(data['missing_on_live'])}): {', '.join(data['missing_on_live'])}")
    if data["hidden_locally"]:
        print(f"PAVOJUS PAŽANGAI — svetainėje yra, repo ne ({len(data['hidden_locally'])}): {', '.join(data['hidden_locally'])}")
    if data["stale"]:
        print(f"PASENĘS TURINYS — ID yra, failas gyvai kitas ({len(data['stale'])}):")
        for s in data["stale"]:
            print(f"  - {s['id']} ({s['file']}): repo {s['repo_bytes']} B, gyvai {s['live_bytes']} B")
    if data.get("live_missing"):
        # Ne „NEPASIEKTA po 2 bandymų“: 404 yra atsakymas, ne tinklo gedimas.
        # Vaikui tai reiškia, kad modulio svetainėje nėra — reikia publikuoti.
        print(f"SVETAINĖJE NĖRA MODULIO FAILO — indeksas jį rodo, svetainė atsakė 404 "
              f"({len(data['live_missing'])}):")
        for item in data["live_missing"]:
            print(f"  - {item['id']} ({item['file']}), repo {item['repo_bytes']} B. "
                  f"Tai nepasibaigęs publikavimas, o ne ryšio klaida.")
    if data["stale_unknown"]:
        print(f"NEPASIEKTA po {FETCH_ATTEMPTS} bandymų ({len(data['stale_unknown'])}): "
              f"{', '.join(data['stale_unknown'])}")
    if data.get("missing_in_repo"):
        # Atskira eilutė: tai ne publikavimo defektas. Svetainė šio modulio
        # nerodo todėl, kad repo indeksas rodo į failą, kurio nėra (LL-21).
        print(f"LŪŽĘS INDEKSAS — įrašas yra, failo repo nėra ({len(data['missing_in_repo'])}):")
        for item in data["missing_in_repo"]:
            size = item["live_bytes"]
            if size > 0:
                live = f"svetainėje failas yra ({size} B) — dingo repo kopija"
            elif size == 0:
                live = "svetainėje failas yra, bet tuščias (0 B)"
            else:
                live = "svetainėje jo nėra arba jis nepasiektas (neišmatuota)"
            print(f"  - {item['id']} ({item['file']}): {live}. Taisyk indeksą, "
                  f"ne publikavimą.")
    if data.get("stale_unmeasured"):
        print(f"NEIŠMATUOTAS DYDIS ({len(data['stale_unmeasured'])}): "
              f"{', '.join(data['stale_unmeasured'])} — baitų lyginti negalima, "
              f"tai ne „0 baitų“")
    if data["not_in_path"]:
        print(f"NĖRA path.json sekoje ({len(data['not_in_path'])}): {', '.join(data['not_in_path'])}")
    if data.get("orphan_files"):
        # Ne „neskelbta“ ir ne „pasenęs turinys“: failas yra abiejose pusėse,
        # tik jo niekas neindeksuoja, tad naršyklė į jį niekada nenukreips
        # (#404). Taisymas — `index.json` įrašas (ir `path.json`), ne push.
        print(f"FAILAS BE INDEKSO ĮRAŠO — svetainėje jis yra, bet vaikas jo "
              f"nepasieks ({len(data['orphan_files'])}):")
        for item in data["orphan_files"]:
            print(f"  - {item['id']} ({item['file']}): `index.json` įrašo nėra. "
                  f"Įrašyk modulį į indeksą arba pašalink failą.")
    accepted = [v for v in data.get("vanished_ids", []) if v.get("resolved")]
    unexplained = [v for v in data.get("vanished_ids", []) if not v.get("resolved")]
    if unexplained:
        print(f"DINGĘ ID — vaiko pažanga liko be modulio ({len(unexplained)}):")
        for v in unexplained:
            print(f"  - grade-{v['grade']:02d} {v['id']} (paskutinį kartą {v['last_rev']})")
    if accepted:
        print(f"Pervadinti ID, priimta ir užregistruota ({len(accepted)}):")
        for v in accepted:
            succ = v["successor"]
            if v.get("alias_ok"):
                # Teiginys apie vaiko pažangą — iš duomenų, ne iš atminties:
                # `index.json` `renamed_from` + `progress.js` migracija (LL-21).
                state = (f"žyma perkeliama — index.json „{succ}“ turi "
                         f"renamed_from, progress.js migruoja")
            elif v.get("alias"):
                state = (f"DĖMESIO: žyma NEBUS perkelta — index.json rodo į "
                         f"„{v['alias']}“, o known_renames.json — į „{succ}“")
            else:
                state = (f"DĖMESIO: žyma liktų našlaite — index.json įraše "
                         f"„{succ}“ nėra renamed_from")
            print(f"  - grade-{v['grade']:02d} {v['id']} → {succ} ({state})")
    if data.get("history_note"):
        print(f"Dingusių ID patikros riba: {data['history_note']}")
    if data["path_differs"]:
        print(f"path.json seka skiriasi: klasė {', '.join(map(str, data['path_differs']))}")
    if data.get("path_reordered"):
        # Aibė sutampa, tvarka — ne. Taisymas yra kitas nei „įrašyk trūkstamą
        # ID“, todėl ir eilutė sava: grąžink seną tvarką ir naujus įrašyk gale.
        base = data.get("path_order_baseline") or "?"
        print(f"SEKOS TVARKA PAJUDĖTA — senų ID santykinė tvarka skiriasi nuo "
              f"{base} ({len(data['path_reordered'])}): "
              f"{', '.join(data['path_reordered'])}. Pašalinus šiuos ID likusi "
              f"tvarka atitinka ankstesnę. Vaiko „Tęsk nuo čia“ žingsnis persikėlė.")
    inserted = data.get("path_inserted_midsequence") or []
    if inserted:
        # Ne klaida, bet ne tyla: įterpimas viduryje perstumia visus po jo
        # einančius žingsnius, o tai žmogus turi žinoti iš įrankio, ne iš vaiko.
        print(f"Nauji moduliai įterpti į maršruto vidurį (ne į pabaigą) "
              f"({len(inserted)}): {', '.join(inserted)} — tai leidžiama, bet "
              f"„kitas žingsnis“ pasikeitė jiems ir po jų einantiems.")
    if data.get("path_order_note"):
        print(f"Sekos tvarka: {data['path_order_note']}")
    if data.get("path_order_checked") is False:
        print("SEKOS TVARKOS PATIKRA NEĮVYKO — „tvarka nepajudėta“ nebuvo "
              "išmatuota (git istorija neperskaityta). Tai ne „0 pajudėta“.")
    if data["aux_stale"]:
        print(f"PASENĘS PAGRINDINIS FAILAS — moduliai 200, bet svetainė skaito kitą ({len(data['aux_stale'])}):")
        for s in data["aux_stale"]:
            live = "nepasiektas" if s["live_bytes"] < 0 else f"gyvai {s['live_bytes']} B"
            print(f"  - {s['file']}: repo {s['repo_bytes']} B, {live}")
    if data.get("aux_absent"):
        print(f"PAGRINDINIO FAILO NĖRA REPO ({len(data['aux_absent'])}) — "
              f"svetainė jį skaito prieš kiekvieną modulį:")
        for s in data["aux_absent"]:
            live = "neišmatuota" if s["live_bytes"] < 0 else f"gyvai {s['live_bytes']} B"
            print(f"  - {s['file']}: repo failo nėra, {live}")
    if data.get("aux_gone"):
        # Svetainė atsakė 404: failo ten nėra, nors repo jį turi. Tai
        # nepasibaigęs publikavimas, o ne „nepasiektas“ (#386).
        print(f"PAGRINDINIO FAILO NĖRA SVETAINĖJE — svetainė atsakė 404 "
              f"({len(data['aux_gone'])}):")
        for s in data["aux_gone"]:
            print(f"  - {s['file']}: repo {s['repo_bytes']} B, svetainėje failo nėra")
    if data.get("shell_stale"):
        print(f"PASENĘS KODAS — naršyklė vykdo kitą failą ({len(data['shell_stale'])}):")
        for s in data["shell_stale"]:
            print(f"  - {s['file']}: repo {s['repo_bytes']} B, gyvai {s['live_bytes']} B")
        if data.get("live_version") or data.get("repo_version"):
            print(f"  gyvai versija {data.get('live_version') or '?'}, repo HEAD {data.get('repo_version') or '?'}")
    if data.get("shell_unreachable"):
        print(f"NEPASIEKIAMI svetainės kodo failai ({len(data['shell_unreachable'])}): "
              f"{', '.join(data['shell_unreachable'])}")
    if data.get("shell_gone"):
        # 404, ne laikinas gedimas: kodas nepaskelbtas, o ne ryšys nutrūkęs.
        print(f"SVETAINĖJE NĖRA KODO FAILO — svetainė atsakė 404 "
              f"({len(data['shell_gone'])}): {', '.join(data['shell_gone'])}")
    audio = data.get("audio") or {}
    if audio.get("total"):
        kind = "mėginys" if audio.get("sampled") else "visi"
        line = f"Garsas: patikrinta {audio['checked']} iš {audio['total']} ({kind})"
        bad = len(audio.get("missing", [])) + len(audio.get("empty", [])) + len(audio.get("unreachable", []))
        print(line + (f" — TRŪKSTA {bad}" if bad else " — visi pasiekiami"))
        for key, label in (("missing", "nėra svetainėje"), ("empty", "tuščias"),
                           ("unreachable", "nepasiektas")):
            for rel in audio.get(key, [])[:10]:
                print(f"  - {rel} — {label}")
        # Antras teiginys: failas ne tik yra, bet ir toks pat. Eilutė
        # spausdinama visada, kai matuota — kitaip „visi pasiekiami“ skambėtų
        # kaip pilnas atsakymas, nors dydis būtų nematytas (LL-37).
        if audio.get("size_checked"):
            size_bad = audio.get("size_mismatch") or []
            ok_sizes = audio["size_checked"] - len(size_bad)
            tail = ("visi tokio pat dydžio" if not size_bad
                    else f"SKIRIASI {len(size_bad)}")
            print(f"  dydis: {ok_sizes} iš {audio['size_checked']} — {tail} "
                  f"(diskas = Content-Length)")
            for item in size_bad[:10]:
                print(f"  - {item['file']} — svetainėje {item['live_bytes']} B, "
                      f"repo {item['disk_bytes']} B")
        if audio.get("sampled"):
            print("  (mėginys, ne visa apimtis — numatytasis režimas tikrina visus įrašus)")
    elif audio.get("note"):
        print(f"Garsas: {audio['note']}")
    # Vardo maišo eilutė — visada, kai patikra įvyko, net jei viskas gerai:
    # „failas yra“ ir „failas yra tie baitai“ yra du skirtingi teiginiai, o
    # skirtumas vaikui girdimas (nukirptas mp3 → pusė žodžio).
    name = data.get("audio_name") or {}
    if name.get("note"):
        print(f"Garso vardai: {name['note']}")
    elif name.get("total"):
        bad = (len(name.get("mismatch", [])) + len(name.get("text_mismatch", []))
               + len(name.get("absent", [])))
        unverified = len(name.get("unverified", []))
        line = (f"Garso vardai: {name.get('checked', 0)} iš {name['total']} — "
                f"vardo maišas = baitų maišas IR priekis = teksto maišas")
        if bad:
            line += f" — NEATITINKA {bad}"
        if unverified:
            line += f" — {unverified} be turinio maišo (senas vardas)"
        print(line)
        for rel in name.get("mismatch", [])[:10]:
            print(f"  - {rel} — vardas rodo kitą turinį, pergeneruok garsą")
        for rel in name.get("text_mismatch", [])[:10]:
            print(f"  - {rel} — vardas rodo kitą TEKSTĄ, garsas senesnis už "
                  f"tekstą — pergeneruok")
        for rel in name.get("absent", [])[:10]:
            print(f"  - {rel} — manifesto įrašas, failo repo nėra "
                  f"(vardo maišas nepatikrintas)")
        if len(name.get("mismatch", [])) > 10:
            print(f"  … ir dar {len(name['mismatch']) - 10}")
    if data["unpushed_commits"]:
        print(f"Neišstumta commit'ų: {data['unpushed_commits']}")
    if not data.get("unpushed_checked", False):
        print("Neišstumtų commit'ų patikra NEĮVYKO — git negalėjo palyginti su origin/main "
              "(tai ne „0“, o nežinoma; patikrink `git fetch`).")
    if data.get("retried_requests"):
        # Ne klaida, bet svarbu: jei svetainė flakuoja, skaičius auga.
        print(f"Užklausos, kartotos po laikinos klaidos: {data['retried_requests']}")
    if not problems(data):
        name = data.get("audio_name") or {}
        # Vardo maišas tikrinamas ir `--no-bytes` režime (jis vietinis, be
        # tinklo), todėl jo sėkmės dalis sakoma abiem atvejais — kitaip
        # „garsas NETIKRINTAS“ paneigtų matavimą, kuris įvyko.
        name_tail = ""
        if name.get("total"):
            name_tail = (f", garso vardai {name.get('checked', 0)}/{name['total']}"
                         f" = baitai ir tekstas")
        # Tapatybė svetainėje (#495): „failas yra“ ir „failas toks pat“ yra du
        # teiginiai, todėl sėkmės eilutėje jie skiriami — kitaip žalias
        # „sutampa“ apie 2 124 mp3 nieko nesakytų apie jų dydį.
        size_tail = ""
        if audio.get("size_checked"):
            ok_sizes = audio["size_checked"] - len(audio.get("size_mismatch") or [])
            size_tail = f", garso dydžiai {ok_sizes}/{audio['size_checked']} = Content-Length"
        # Tvarka — matavimas, o ne prielaida: sėkmės eilutė turi pasakyti, su
        # kuo lyginta, kitaip „sutampa“ apie 72 ID nieko nesako apie jų eilę.
        order_tail = ""
        if data.get("path_order_checked"):
            order_tail = (f" (senų ID tvarka nepajudėta, lyginta su "
                          f"{data.get('path_order_baseline') or '?'})")
            inserted_n = len(data.get("path_inserted_midsequence") or [])
            if inserted_n:
                order_tail = (f" (senų ID tvarka nepajudėta, lyginta su "
                              f"{data.get('path_order_baseline') or '?'}, "
                              f"{inserted_n} naujas įterptas į vidurį)")
        if data.get("bytes_checked", True):
            print(f"✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, "
                  f"svetainės kodas {data.get('shell_count', 0)} failų"
                  f"{name_tail}"
                  f"{size_tail}"
                  f"{order_tail}"
                  f"{', versija ' + data['live_version'] if data.get('live_version') else ''}).")
        else:
            # `--no-bytes` sąmoningai nelygina baitų, kodo ir garso. Iki #374
            # ši eilutė vis tiek sakydavo „baitai“ ir „svetainės kodas 0 failų“,
            # t. y. pranešdavo apie matavimą, kurio nebuvo (LL-37).
            print("✔ ID ir seka sutampa — DALINĖ PATIKRA: modulių baitai, pagrindinių failų baitai, "
                  "svetainės kodas ir garsas svetainėje NETIKRINTI (--no-bytes)"
                  f"{name_tail}{order_tail}.")

    if problems(data):
        # Priežasčių sakinys yra tas pats, kurį skaito dashboard'as ir
        # `--json` (LL-10): žmogus neturi iš naujo daryti išvados iš detalių
        # eilučių. Eilutės viršuje pasako KUR, ši — KODĖL. Iki #495 CLI
        # spausdindavo tik detales, o sprendimo sakinio neturėjo.
        reasons = (data.get("verdict") or {}).get("reasons") or []
        print("SPRENDIMAS: nepublikuota — " + "; ".join(reasons))

    return 1 if problems(data) else 0


if __name__ == "__main__":
    raise SystemExit(main())
