# simuliaciju-inzinierius — 2026-11-10 (paleidimas #219)

- **Vaidmuo:** simuliacijų inžinierius
- **Data:** 2026-11-10, 11:14 EET
- **Darbas:** vienas esminis vienos simuliacijos patobulinimas
- **Simuliacija:** `akmenelis-popierius` (modulis `13-akmenelis-popierius`, 1 klasė, kryptis „Sąžiningumas ir žaidimai“)
- **Failas:** `assets/js/sims/zaidimai.js` (+86 / −26)
- **Tipo šaltinis:** (c) patobulinimas, kuris pašalina aiškų trūkumą — modulis žadėjo lūkesčio palyginimą, modelis jo neturėjo

## KLAIDINGA NUOSTATA

Simuliacija po dešimto ėjimo **paskelbdavo** išvadą „kiekvienas variantas laimi maždaug trečdalį kartų. Nėra „karštos rankos“ — tik atsitiktinumas“, nors ekrane nebuvo nei trečdalio skaičiaus, nei lūkesčio, nei palyginimo su tuo, ką vaikas surinko. Modulio rezultatas `outcomes[1]` žada „Stebiu rezultatus ir lyginu juos su lūkesčiu“ — modelis šito neįgyvendino nė vienoje būsenoje.

Vaiko nuostata, kurią dabar modelis atremia *veiksmo metu*, o ne paskaita po dešimto ėjimo: „laimėjau tris kartus iš eilės, vadinasi, man sekasi / kitas ėjimas bus prastesnis“. Serijos sakinys pasirodo iš karto, kai serija prasideda (3 vienodi rezultatai), o ne tada, kai jau nebeaktualu.

## KAS PAKEISTA

1. **Lūkestis tapo apskaičiuojamu dydžiu.** `#ap-third` eilutė ima ėjimų skaičių ir, kai jis dalijasi iš 3, parodo trečdalį: `3 ėjimai. Jei visi trys lygūs — po 1.` Ties 1, 2, 4, 5, 7, 8 dalinio nėra, todėl trečdalis nerodomas (ne apvalinamas, ne išgalvojamas).
2. **Paliginimo sakinys** (`#sim-note`) po 3, 6, 9 ėjimų: `Po 9 ėjimų trečdalis — po 3. Palygink su savo skaičiais.` — abi pusės yra tame pačiame lange, o palyginimą atlieka vaikas (P2: veiksmas prieš paaiškinimą).
3. **Serijos pastebėjimas** vietoje paskelbtos išvados: `Jau 3 tokie patys rezultatai iš eilės. Kitas ėjimas gali būti bet kuris.` — teiginys apie modelį (kiekvienas ėjimas renkamas iš trijų), o ne apie vaiko sėkmę.
4. **Mirusi būsena pašalinta:** `let last = "Paklausk draugo arba spausk savo ėjimą."` buvo priskirtas vieną kartą ir niekada nepakeistas — `api.note(last)` visada rašė tą patį nurodymą, net po septynių ėjimų. Dabar pradinė pastaba — dvikovos taisyklė („Akmenėlis nugali žirkles…“), kuri lieka atsargine eile.
5. **Pradinė būsena turi tekstinį atitikmenį:** `api.readout("Laimėjimai 0, pralaimėjimai 0, lygiosios 0. Ėjimų 0.")` — anksčiau `#sim-readout` buvo tuščias iki pirmo paspaudimo.
6. **Skaičiaus forma:** `ejimai(n)` parenka „1 ėjimas“ / „2 ėjimai“ / „21 ėjimas“ (pirmoji versija rašė „1 ėjimai“, žr. LL-80).
7. **200 % teksto apsauga išlaikyta:** fiksuotos `7rem`/`3rem` kolonos pakeistos `flex` eilute su `flex-wrap` ir `min-width:0` (anksčiau sutvarkyta #4741, dabar ta pati struktūra taikoma ir naujai eilutei). Mygtukų dydis rištas `min(2rem,10vw)` / `min(4.4rem,22vw)`, `min-height:48px`.

## PAMATUOTA (tikra zondo išvestis, `probe219.py`, Chromium 1248, 127.0.0.1:8987)

Išdėstymas (5 ėjimai prieš matavimą, kad stulpeliai būtų užpildyti):

| plotis / šaknis | docOverflow | #sim-stage scroll/client | taikiniai | mažiausias |
|---|---|---|---|---|
| 1440 / 16 px | 0 | 972 / 972 | 89×64 ×3, 139×64 | 89×64 |
| 1440 / 32 px | 0 | 1249 / 1249 | 173×124 ×3, 274×124 | 173×124 |
| 390 / 16 px | 0 | 328 / 328 | 89×64 ×3, 139×48 | 89×48 |
| 390 / 32 px | 0 | 271 / 271 | 86×95 ×3, 204×88 | 86×88 |
| 360 / 16 px | 0 | 298 / 298 | 89×64 ×3, 139×48 | 89×48 |
| 360 / 32 px | 0 | 241 / 241 | 79×91 ×3, 202×88 | 79×88 |

- `overflowing: []` visais šešiais atvejais (joks sim ar valdiklių palikuonis neišlindo už viewport ribų).
- `smallTargets: []` — nė vienas taikinys mažesnis už 48 px; mažiausias 79×88 @360/32.
- `errors: []` — 0 konsolės klaidų ir 0 `pageerror` visuose 10 zondo paleidimų.

Būsenos (`probe219.py` A/B/C dalys):

- Po 2 ėjimų: `2 ėjimai.`, pastaba — dvikovos taisyklė, `simDone false`.
- Po 3 ėjimų: `3 ėjimai. Jei visi trys lygūs — po 1.`, pastaba `Jau 3 tokie patys rezultatai iš eilės…`, `simDone false`.
- Po 9 ėjimų: `9 ėjimai. Jei visi trys lygūs — po 3.`, `simDone true`.
- Mišri seka (1→9): trečdalio sakinys tik ties 3 (`po 1`), 6 (`po 2`) ir 9 (`po 3`); ties 1, 2, 4, 5, 7, 8 — `N ėjimai.` be trečdalio.
- `Nuo nulio`: `Laimėjimai 0, pralaimėjimai 0, lygiosios 0. Ėjimų 0.`, `Iš viso 0 ėjimų.`, `simDone` lieka `true` (platformos pažanga per modulį, ne per bėgimą — LL-16).

Klaviatūra (`probe219b.py`, 360 px, Tab nuo dokumento pradžios):

```
Pereiti prie turinio → Suprask! pradžia → 🔊Garsas → ℹ️Apie → Pradžia →
1 klasė → Sąžiningumas ir žaidimai → Akmenėlis → Žirklės → Popierius → Nuo nulio
```

`Enter` ant „Popierius“ → `Laimėjimai 1, pralaimėjimai 0, lygiosios 0. Ėjimų 1.`, `1 ėjimas.`

## VARTŲ IŠVESTIS (tikra)

```
python3 scripts/validate_content.py --grade 1 --strict   → Rezultatas: 0 klaidų, 0 įspėjimų; rc=0
python3 scripts/check_ui.py                             → Rezultatas: 0 klaidų, 0 įspėjimų; rc=0
.venv/bin/python scripts/check_view.py --module 13-akmenelis-popierius --viewports desktop,phone,small
  Plotai: desktop 1440px, phone 390px, small 360px
  Patikrinta: 3 (maršrutų: 1 · plotų: 3) · problemos: 0; rc=0
.venv/bin/python scripts/check_view.py --viewports desktop,phone,small
  Patikrinta: 111 (maršrutų: 37 · plotų: 3) · problemos: 0; rc=0
python3 scripts/check_audio.py   → ✔ Garsas pilnas: 543 tekstų, 1086 įrašų, visi iš Piper, 1086/1086 mp3
python3 scripts/check_art.py     → ✔ 7 simuliacijų failai naudoja art.js, legacy: 1
python3 scripts/check_lessons.py → ✔ 80 įrašai, visi su 4 laukais
python3 scripts/check_docs_facts.py → Dokumentų skaičiai: 0 klaidų, 0 įspėjimų
python3 scripts/check_agents.py  → ✔ 15 vaidmenų, 1 įspėjimas (sistemos-architektas, buvo prieš)
python3 scripts/check_language.py --grade 1 → 0 klaidų; 2 įspėjimai apie 13-akmenelis-popierius
  (concept.title „Atsitiktinumas“ 14 raidžių, concept.example „atsitiktinumas“ 14 raidžių — buvo prieš,
  turinio JSON neliestas; ilgo žodžio riba 13)
node --check assets/js/sims/zaidimai.js → SYNTAX_OK
```

Pastaba: `scripts/check_view.py` paleistas su sistemos `python3` atsako `KLAIDA: nėra playwright`; matuota su `.venv/bin/python` (ten Playwright įdiegtas). Tai įrankio aplinkos, ne simuliacijos reikalas.

## ŠVIETIMAS #1 SĄSAJA

- **1 žingsnis (gylis):** viena sąvoka — atsitiktinumas neturi „serijos taisyklės“; lūkestis rodomas kaip trečdalis, ne kaip formulė.
- **2 žingsnis (vienodas vertinimas):** tas pats trečdalio skaičius gaunamas iš bet kurio vaiko ėjimų, todėl palyginimas nepriklauso nuo sėkmės.
- **3 žingsnis (pagalba laiku):** serijos pastebėjimas ateina tą akimirką, kai serija prasideda; jokio laikmačio, jokio ėjimų limito, jokio „game over“ — po devinto ėjimo žaisti galima toliau.
- **T5.5 (prieinamumas):** taikiniai ≥ 48 px visuose plotuose, visi valdikliai `button` su `aria-label`, informacija ne vien spalva (skaičiai prie kiekvieno stulpelio, tekstinis `#sim-readout`), 200 % tekste 0 px slinkties.

## NAUJOS PAMOKOS

- **LL-79 — Išvada, kuri paskelbta, o ne apskaičiuota.** Kiekvienas kiekybinis teiginys ekrane imamas iš rodomos būsenos; jei sakoma „trečdalis“, jis skaičiuojamas iš ėjimų ir rodomas tame pačiame lange, o kai nesidalija iš 3 — nerodomas.
- **LL-80 — Skaičius sakinyje be savo formos („1 ėjimai“).** Į vaikui rodomą sakinį įterpus skaičiuojamą skaičių, forma parenkama kode; vartai simuliacijų kodo neskaito, todėl tai gaudoma tik zonde.

Abi įrašytos `research/wiki/guidelines/pamokos.md` (check_lessons: 80 įrašai, visi su 4 laukais).

## PASIŪLYMAI

1. `agents/proposals/2026-11-10-simuliaciju-inzinierius-garso-literaliai.json` — `scripts/check_audio.py` nemato tiesioginių `api.speak("...")` eilučių: `calba.js:229` „Sudėjai visus sakinius!“ ir `matematika.js:81` „Visi taikiniai pasiekti!“ neturi mp3, o suvestinė sako „Garsas pilnas“. `speech.js:134` tokį tekstą tyliai atiduoda naršyklės `tts()`.
2. `agents/proposals/2026-11-10-simuliaciju-inzinierius-visada-trecdalis.json` — to paties modulio `concept.example` „visada grįžta prie maždaug trečdalio“ prieštarauja `concept.steps[2]` „bet ne tiksliai 10“; simuliacija šios problemos nebeturi, modulio tekstas — turi.

## KO NELIECIAU

`assets/js/app.js`, `registry.js`, `art.js`, `main.css`, kiti sim failai, kitų modulių JSON, 2–12 klasės, `AGENTS.md`, `docs/`. Modulio JSON neliestas — `sim.component` ir `sim.config` liko tie patys (`{}`), todėl garso įrašų neprireikė (`generate_audio.py collect()` renka tik `sim.config`).

## LIKO

- Simuliacija neturi garso (`api.speak`) — visi sakiniai tekstiniai (`#sim-readout`, `#sim-note`, `#ap-third`), todėl veikia be garso, bet 1 klasėje garsas yra pirmas kanalas; garso frazės galėtų būti atskiras darbas su `sim.config.sentences` (dabar `{}`).
- 200 % tekste @360 px puslapio slinktis ne simuliacijos ribose (atviras #4748 — `.task-q` klausimo `<span>`), sim `#sim-stage` 241/241.
- `check_view.py` nematuoja padidinto teksto; 200 % matuota atskiru zondu.
- `scripts/check_audio.py` aklumas `api.speak` literalams — pasiūlymas pateiktas, ne mano failas.
- Ataskaitos failas `agents/log/simuliaciju-inzinierius-2026-11-09*.md` iš ankstesnio paleidimo buvo rungtynių DIFF tekstas, ne ataskaita (bėgiklio žinutės šaltinis, #5190 šeima) — neliestas.

Pakeitimai palikti darbinėje kopijoje. Commit ir publikavimą atlieka bėgiklis.
