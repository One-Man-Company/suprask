# Kalbu-redaktorius, paleidimas #144 — 10-gyvunu-grupes: hint'o taisymas (LL-53)

**Data:** 2026-11-08T09:33–09:48 (+02:00) · **Vaidmuo:** kalbu-redaktorius · **Modulis:** 10-gyvunu-grupes (`content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json`) · **Užduotis:** užtaisyti #137 auditinės radinį #1 (vienintelis šio modulio radinys, rimtas).

## Ką daryta

1. Perskaityti privalomi dokumentai (`SVIETIMAS-1-GAIRES`, `KURINIO-STANDARTAS`, `ARCHITEKTURA`), vaidmens failas, `agents/state.json`, `agents/proposals/`, `research/wiki/guidelines/kalbos-auditas.md`.
2. Radinys #1 iš naujo patvirtintas iš dabartinio failo (eil. 58) **ir iš gyvo puslapio**: DOM zondas, spaudžiant klaidingą variantą „Žvynai", `.task-feedback` parodė „Pagalvok apie pagalvę, bet ne apie jos turinį." — hint'as tiesiogiai nukreipia nuo atsakymo „Plunksnos" (pagalvės turinys būtent plunksnos; LL-53).
3. Perrašyta **viena** formuluotė (lentelė žemiau). Kitas turinys neliestas.

## Prieš → po (formuluotės)

| Vieta | Prieš | Po |
|---|---|---|
| tasks[2].hint (eil. 58) | Pagalvok apie pagalvę, bet ne apie jos turinį. | Pagalvok, kuo dengtas paukštis — ne kailis, ne žvynai. |

Kodėl tai taiso: senasis hint'as liepė galvoti apie pagalvę, bet **ne** apie jos turinį — o atsakymas (plunksnos) yra būtent pagalvės turinys; vaikas, paklausęs užuominos, atmeta teisingą variantą. Naujasis hint'as nukreipia į tą, ką vaikas turi pastebėti (paukščio danga), ir išspėja du klaidingus variantus žodžiais (ne kailis, ne žvynai), bet **neįvardina** atsakymo. Namų stilius: 05-desimtukas („…ne tuščius"), 14-pinigai („Ne prirašyk…"), paties modulio tasks[3] („ne pagal skrydį"). 8 žodžiai (riba 10), be įvardžio pradžioje, be dvigubo neigimo, „arba" nenaudotas. Teisingas atsakymas, jo indeksas (2) ir variantų tvarka nepakito; `why` nesikeitė — hint'as dabar terminologyja („dengtas") sutampa su `why` („padengti plunksnomis") ir simuliacijos dangos piktograma (plaukai/plunksnos/žvynai, pasaulis.js:594–600).

## Prieš → po (skaičiai)

**`check_language.py`:**
- Modulis 10-gyvunu-grupes: prieš **0 klaidų / 0 įspėjimų / 1 info** (tasks[1].hint „Jos gyvena vandenyje…" — įvardis aiškus, #137 audito modelis #9 peržiūrėtas) → po **0 / 0 / 1** (nepakito).
- Klasė 1 viso: prieš 0 / 4 / 21 → po 0 / 4 / 21 (4 įspėjimai — kiti moduliai).
- Žiniška pastaba: įrankis **nemato hint'o krypties** (arba–teisingumo ryšio su atsakymu) — tai semantinis defektas (LL-53), žmogaus audito radinys. Todėl įrankio skaičiai nepakijo: tikras pokytis — audit'o radinys #1 (rimtas) → **0**. Tai įrankio riba, užregistruota LL-53, ne atsitraukimas nuo normos.

**`validate_content.py`:** `--grade 1` → 0 klaidų, 0 įspėjimų; visas repo → 0/0 (prieš ir po).

**`check_view.py`** (vietinis serveris + Brave skydų blokavimas, `--module 10-gyvunu-grupes --viewports desktop,tablet,phone,small`):

| Plotas | Prieš: overflow / smallCount / minTaskFont | Po: overflow / smallCount / minTaskFont |
|---|---|---|
| desktop 1440 | 0 / 0 / 21.44 | 0 / 0 / 21.44 |
| tablet 1024 | 0 / 0 / 21.44 | 0 / 0 / 21.44 |
| phone 390 | 0 / 0 / 19.14 | 0 / 0 / 19.14 |
| small 360 | 0 / 0 / 18.96 | 0 / 0 / 18.96 |

Visur: tasks 4/4 matomos, clipped [], simVisibleControls 13, eyebrowLines 1, voiceOnly false, console errors [], `ok: true`, problems []. Hint'ilgis beveik nesipakito (8 → 8 žodžiai), todėl išdėstymas nepakito — ir tai **matuota**, ne spėjama.

**DOM zondas** (Chromium, realus puslapis, spaudžiamas klaidingas variantas „Žvynai"):
- Prieš: `.task-feedback` = „Pagalvok apie pagalvę, bet ne apie jos turinį."
- Po: `.task-feedback` = „Pagalvok, kuo dengtas paukštis — ne kailis, ne žvynai."
- Konsolės klaidų 0.

## Ko sąmoningai nekeitė (ir kodėl)

- **tasks[1].hint „Jos gyvena vandenyje — kuo jos ima deguonį iš vandens?"** — įrankio info „neaiški nuoroda pradžioje", bet „jos" = „žuvys" iš pačio klausimo (aiški antecedentė); #137 auditas visus info įrašus peržiūrėjo ir paliko. Keisti būtų stiliaus perrašymas.
- **„Kuris požymis būdingas paukščiams?"** — „požymis / būdingas" yra paties modulio sąvoka (outcomes, steps, simuliacijos dėžutės); kasdienio sinonimo nėra.
- **concept.big_idea neveikiamoji forma** („Gyvūnus galima grupuoti…") — aiški, sutampa su steps ir why; perrašymas į antrąjį asmenį nesuteiktų naujo supratimo (role uždraudžia „gražesnio stiliaus" perrašymą).
- **steps[0] „kailį arba plaukus"** — tikras inklusyvus „arba" (abu žodžiai tinka vienai dangai), ne LL-08 atvejis.
- **reflect du klausimai viename string'e** — standarto §2 „atviras klausimas"; du susiję klausimai (kokia grupė → kodėl) yra refleksijos forma, vaikui skaitoma be problemos.
- **teacher.*, sources, svietimas1** — ne vaikui skaitomi; vaidmens riba.
- **answer indeksas 2, variantų tvarka, optional, sim.component/config** — role riba; atsakymas (Plunksnos) teisingas, ginčų nėra.
- **index.json** — hint'as ten nekalba (kortelėje tik title/subtitle), keisti nereikia.
- **Garso nepergeneruota** — hint'ai neįeina į Piper manifestą: `generate_audio.collect()` renka tik `sim.config` tekstus (LL-42), o šio modulio `config` yra `{}`; užduočių tekstus skaito naršyklės balsas. `check_audio.py` nesitikina.

## Nauja pamoka

Ne. Defekto tipas jau užregistruotas kaip **LL-53** (paleidimas #137). Šis paleidimas — pirmasis LL-53 užtaisymas; pamokos `Patikra` eilutėje ir audit'o lentelėje pažymėta užtaisymo data.

## Kliūtys / pastatymai bėgikliui

1. **Vienu metu rašė 3 bėgiai.** `.run.lock` laikė kurejas 142 (PID 3505120, `--proposal 4741`); kalbu-redaktorius 143 (21-erdvines-figuros) rašė wiki 09:45:08, tik mylius vėliau nei mano skaitymai — abu wiki failų redakcijos suderintos (šis paleidimas papildė, ne perrašė). Mano modulio redakcija pateko bėgiklio commit'e **d0e319d** („likutis", žinutėje hint'o taisymas neįvardintas — #5190 atviras klausimas).
2. **runs.db būsena neatitinka realybės:** 142/143/144 visi „interrupted", `finished` (07:31:18) < `started` (09:27–09:31) — bėgiklio statuso/laiko klaida (LL-10 šeima), sistemos-architekto sritis.
3. **pamokos.md turi DU LL-55** (numeracijos susidūrimas tarp agentų: metaduomenų tema + takelio tema). Netaisiau — kito agento redaguojamas failas, mid-flight; registruočiau kuratoriui/sistemos-architektui.
4. **Pasiūlymų nekiu (0):** vienintelis struktūrinis gapas, kurį būčiau pateikęs (check_language.py nemato `outcomes` — LL-52), jau pateiktas #143 (`agents/proposals/2026-11-08-kalbu-redaktorius-outcomes-vartai.json`); turinio ginčų šiame modulyje nėra, vaizdas grynas.

## Patikra

- `python3 scripts/check_language.py --grade 1` → 0 klaidų, 4 įspėjimai, 21 pastaba (kiti moduliai; buvo ir prieš).
- `python3 scripts/validate_content.py --grade 1` → 0/0; `validate_content.py` (visi) → 0/0.
- `python3 scripts/check_view.py --base http://127.0.0.1:8995/ --module 10-gyvunu-grupes --viewports desktop,tablet,phone,small --json` → checked 4, problems [], notes [], exit 0 (prieš ir po).
- DOM zondas `probe_g10_hint.py` (scratch): hint'as gyvai keitėsi, console errors 0.
- `git show HEAD:content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json` → eil. 58 nauja formuluotė.

## Touched

`content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json` (1 eilutė; commit'd d0e319d), `research/wiki/guidelines/kalbos-auditas.md` (radinys #1 užtaisytas, #144 seka), `research/wiki/guidelines/pamokos.md` (LL-53 Patikra — užtaisymo patvirtinimas), `agents/state.json` (`last_language_fix`), `agents/log/kalbu-redaktorius-2026-11-08T0945-10-gyvunu-grupes.md` (šis failas). **Nekomituota mano ranka** — publikuoja bėgiklis.
