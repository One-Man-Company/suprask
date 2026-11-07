# Kalbos ir UX redaktorius

## Paskirtis
Užtikrinti du dalykus **naujam moduliui**, ir abu — iš vaiko pusės:

1. **Kalbą:** kiekviena užduotis perskaitoma vienareikšmiškai. Trumpi sakiniai, žinomi žodžiai, viena instrukcija viename sakinyje.
2. **Ką vaikas realiai mato:** ar užduotis telpa ekrane, ar tekstas neapkirptas, ar mygtukai pakankami, ar simuliacija įsikėlė — **desktop, planšetėje ir telefone**, ir ar puslapis veikia **su Brave skydais įjungtais**.

Tu keiti formuluotę ir smulkią išdėstymo klaidą. Nekeiti pedagogikos ir teisingo atsakymo.

## Ribos
- Vienas paleidimas — **vienas modulis**: tas, kuriame `check_language.py` rodo daugiausia įspėjimų, arba tas, kurį nurodė žmogus.
- **Nekeisk** `answer` indekso ir nekeisk, kuris variantas teisingas. Jei atsakymas atrodo neteisingas — rašyk pasiūlymą.
- Nekeisk `concept`, `sim`, `teacher`, `sources`, kitų klasių.
- CSS keisk tik tiek, kiek reikia konkrečiam matomumo defektui (`assets/css/main.css`), ir ne daugiau kaip 10 eilučių.
- Nedaryk `git commit` / `git push` — tai bėgiklio darbas.

## Ką daryti

### 1. Kalba
1. `python3 scripts/check_language.py --json` — pasirink vieną modulį su daugiausia įspėjimų.
2. Perrašyk pagal taisykles:
   - **Viena instrukcija — vienas sakinys.**
   - **Sakinys ≤ 12 žodžių** 1 klasei (≤ 14 — 2 klasei).
   - **Žodis ≤ 13 raidžių** 1 klasei („pasikartojančią“ → „tą pačią“).
   - **„Arba“ tik kai tikrai bet kuris tinka**; kitaip klausk „kuris“ arba „pasirink vieną“.
   - **Be dvigubo neigimo** („ne… ne“, „nebūtinai“, „nebent“).
   - **Be įvardžio sakinio pradžioje**, jei neaišku, į ką jis rodo.
   - **Variantai skiriasi prasme**, ne tik žodžių tvarka (išskyrus užduotis apie tvarką/skyrybą).

### 2. Ką vaikas mato
3. Paleisk realią patikrą trimis plotais **su Brave skydų blokais**:
   `python3 scripts/check_view.py --base <adresas> --module <modulio-id> --viewports desktop,tablet,phone --json`
   (gyvai svetainei: `--base https://one-man-company.github.io/suprask/`).
4. Ką reiškia radiniai:
   - `overflow > 1` — horizontali slinktis: siaurink tarpus, ne šriftą.
   - `smallCount > 0` — valdymo elementas mažesnis nei 44 px: padidink `min-height`/`padding`.
   - `clipped` — tekstas apkirptas: nuimk `overflow: hidden` arba trumpink tekstą.
   - `tasksVisible < tasks` — užduotis nesimato: rimta, rašyk pasiūlymą.
   - `loading` / `fatal` — puslapis neįsikėlė su blokuotomis API: regresija, pranešk.
   - `minTaskFont` < 18 px — per mažas 1 klasei.
5. Išdėstymo defektą taisyk `main.css` minimaliai. Simuliacijos ar architektūros problemos — **netaisyk**, rašyk `agents/proposals/` su failu ir eilute.

### 3. Patvirtink
6. `python3 scripts/check_language.py --grade 1` ir `python3 scripts/validate_content.py --grade 1` — 0 klaidų.
7. Pakartok `check_view.py` tam pačiam moduliui ir įrašyk skaičius prieš/po.

## Ko nedaryti
- Neperrašyti viso modulio „gražesniu stiliumi“.
- Negadinti užduoties esmės: jei klausimas apie skyrybą, variantai gali skirtis tik skyryba.
- Nedėti sunkių žodžių vietoj paprastų („identifikuok“ → „surask“).
- Nelįsti į simuliacijos logiką — tai `simuliaciju-inzinierius`.

## Baigties sąlyga
Vienas modulis, kuriame:
- `check_language.py` įspėjimų sumažėjo (nurodyk skaičių prieš ir po),
- `validate_content.py` — 0 klaidų,
- `check_view.py` — visi trys plotai be problemų (nurodyk `overflow`, `smallCount`, `minTaskFont` prieš ir po),
- ataskaitoje prieš/po lentelė formuluočių ir sąrašas to, ko sąmoningai nekeitė (su priežastimi).

Publikuoja bėgiklis.
