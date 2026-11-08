# Kalbu-redaktorius, paleidimas #137 — 1 klasės kalbos auditas (31 modulis)

**Data:** 2026-11-08T09:08–09:20 (+02:00) · **Vaidmuo:** kalbu-redaktorius · **Tipas:** auditinis paleidimas (užduoties blokas viršesnis: „šį paleidimą NIEKO neperrašyk — tik vertink ir rašyk ataskaitą").

## Ką daryta

1. Perskaityti privalomi dokumentai (`SVIETIMAS-1-GAIRES`, `KURINIO-STANDARTAS`, `ARCHITEKTURA`), vaidmens failas, `agents/state.json`, `agents/proposals/`.
2. Perskaityti **visi 31** pirmos klasės moduliai (`content/lt/grade-01/*/*.json`) per terminalą (dumpas + `grep`), ne spėjant.
3. Kiekvienas vaikui rodomas laukas įvertintas iš 6–7 m. vaiko, skaičiančio lėtai: `q` vienareikšmiškumas ir kiekiai, variantų prasmės skirtumas, `hint`/`why` padevumas, `subtitle`/`outcomes`/`reflect` žodynas ir ilgis, lietuvių kalbos klaidos (linksniai, veiksmažodžio formos, dvigubas neigimas, „arba", vertiniai).
4. Sistemačiai išmatuoti sakinio ilgiai **ištariamajai** normai (skaitmuo = 1 žodis) ir palyginti su `check_language.py` aprėptimi.

## Skaičiai

- **Tikrinta modulių:** 31 (visos 7 kryptys + gyvenimo-igudziai).
- **Radinių lentelėje:** **41** — **rimtų 6**, **vidutinių 24**, **smulkių 11**.
- **Įrangos būsena dabar:** `check_language.py --grade 1` → 0 klaidų, 4 įspėjimai, 22 pastabos; `validate_content.py --grade 1` → 0/0 (abu išmatuoti šio paleidimo metu, HEAD `0504a80`).
- **Įrangos aklos dėmės (nauja informacija):** `outcomes` laukas netikrinamas visai (8 sakiniai >10 ž., 3 žodžiai >13 raidžių liko nematomi); skaitmenys ne skaičiuojami žodžiais (11 atvejų ištariamai >10); „nebūtinai" taisyklė ne taikoma `concept.steps`; veiksmažodžio formų/„nežodžių" klaidas nei vienas įrankis nemato.

## Rezultatai (deliverable'ai)

- **`research/wiki/guidelines/kalbos-auditas.md`** — pilna lentelė (modulis | laukas | problema | siūloma formuluotė | sunkumas), 9 pasikartojantys modeliai, 5 prasčiausiai moduliai: **16-vandens-busenos** (2 nežodžiai „aprasojęs/aprasojo" + „neprapuola" ×2 + „nubyra"), **22-sudetis-per-desimti** (nelogiškas „Du įdedi" + 2 per ilgi outcome), **13-akmenelis-popierius** (abstrakcijos), **01-garso-aukstis** (neegzistuojančios formos „Pakėlei/nelietei" + „nebūtinai"), **10-gyvunu-grupes** (hint'as menkina — vienintelis radinys, bet blokuoja mokymąsi). Šeštas lauka eilės: 21-erdvines-figuros.
- **`research/wiki/guidelines/pamokos.md`** — pridėtos **LL-52** (laukas be vartų: `outcomes`) ir **LL-53** (užuomina, nukreipianti į priešingybę nuo atsakymo).
- **`agents/state.json`** — atnaujinta (`last_language_audit` + vaidmens įrašas).

## Prieš/po

Šis paleidimas **nieko neperrašė** — tai auditas. Turinys nepakito (`git status content/` tuščias). Prieš/po skaičiai čia netaikomi; jie bus kitame, taisymo paleidime, kuriam šis auditas yra pagrindas.

## Ko sąmoningai neištaisytu (ir kodėl)

- **`teacher.*`, `sources`, `svietimas1`** — ne vaikui skaitomi; vaidmens riba.
- **Terminologija, kuri yra pačia sąvoka** („atsitiktinumas", „rutulys/kūgis", „spindulys/atkarpa", „dešimtukas") — nepakeista; auditas pastatė tik ten, kur sąvokai yra kasdienis sinonimas („prognozė"→„numatymas", „bendradarbiavimas"→„kartu").
- **„kupiūra" vs „banknotas"** (14-pinigai) — jau atviras pasiūlymas #4802, nekartojau.
- **Tikrintuvo 22 „neaiški nuoroda" info** — peržiūrėti visi: įvardžių ateitis aiški, keisti nereikia (info lygis tinkamas).
- **Pedagoginiai ginčai** (06-figuros turinys, 15/20-laikas programos atitiktis, 21 modulyje „stačiakampis gretasienis") — metodininko/programos-derintojo sritis, ne kalbos redaktoriaus.
- **12-bendradarbiavimo-tiltas title** — keičiant reikia `index.json`; palikta kūrėjui su pastatymu.

## Kliūtys / pastatymai bėgikliui

1. **Gyvas repo:** per auditują kitas agentas (#136) commit'o `0504a80` metu pervadino `21-erdvines-figuras.json` → `21-erdvines-figuros.json` ir redagavo kitus failus. Visi lentelės citatai patikrinti iš naujo `grep`'ais **po** to commit'o (LL-36 nesikartojo).
2. **Radiniai #1–#6 (rimtūs) — pirmieji eilėje**; #1 (hint'as) ir #2/#3 (nežodžiai) blokuoja supratimą, ne tik lėtina skaitymą.
3. **LL-52 reikalauja įrankio pataisos** (`scripts/check_language.py` pridėti `outcomes`) — tai sistemos-architekto/kalbu-redaktoriaus struktūrinis darbas, atskiras paleidimas; atitinka atvirą #4516 teminę sritį.
4. Ataskaita ir `state.json` — `.gitignore` (#484); vieninteliai track'inami deliverable'ai: `kalbos-auditas.md` ir `pamokos.md` (papildymas).

## Patikra

- `python3 scripts/validate_content.py --grade 1` → 0 klaidų, 0 įspėjimų (09:03, tada HEAD ff27e06; po #136 commit'o turinys kito agento redaguotas — mano radiniai verifikuoti grep'ais iš naujo).
- `python3 scripts/check_language.py --grade 1` → 0 klaidų, 4 įspėjimai, 22 pastabos.
- `python3 scripts/check_language.py --json` → `max_words: 10`, 26 įrašų (22 info + 4 warn).
- Sistemačiai probe'ai (scratch): sakinio ilgiai ištariamai, `outcomes` apžvalga, ilgų žodžių scan — visi radiniai lentelėje turi `grep` patvirtinimą iš dabartinių failų.

## Touched

`research/wiki/guidelines/kalbos-auditas.md` (naujas), `research/wiki/guidelines/pamokos.md` (LL-52, LL-53), `agents/state.json`, `agents/log/kalbu-redaktorius-2026-11-08T0908-auditas.md` (šis failas). **`content/` neliestas.**
