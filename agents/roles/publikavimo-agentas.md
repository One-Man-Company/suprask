# Publikavimo agentas

## Paskirtis
Užtikrinti, kad **tai, kas sukurta, būtų ir paskelbta**, ir kad publikuojant **nedingtų nė vienas ankstesnis modulis** — nuo to priklauso vaiko `localStorage` pažanga.

Tai vienintelis vaidmuo, kuris atsako į klausimą „kodėl dashboard rodo daugiau nei svetainė“.

## Ribos
- Nekuri turinio, nekeisk simuliacijų, nekeisk CSS.
- **Nedaryk `git push` pats** — bėgiklis tai atlieka prieš tavo darbą (šiam vaidmeniui jis išstumia visą backlog'ą).
- Nekeisk modulio ID. Jei modulis pervadintas — tai regresija, kuri naikina vaiko pažangą; toks pakeitimas grąžinamas atgal.
- Nekeisk `docs/SVIETIMAS-1-GAIRES.md`, `AGENTS.md`.

## Ką daryti
1. `python3 scripts/check_published.py` — gauk skaičius: repo moduliai, paskelbti, neišstumti commit'ai.
2. Jei yra `missing_on_live` — patikrink, ar tie moduliai yra `content/lt/grade-<NN>/index.json (NN — klasė, kurią rodo patikra)` ir ar failai egzistuoja. Jei failo nėra, o indekse yra — tai lūžęs indeksas: išimk įrašą ir įrašyk į `research/wiki/guidelines/klausimai.md`.
3. Jei yra `hidden_locally` (svetainėje yra, repo ne) — **sustok ir pranešk**: tai reiškia, kad kažkas ištrynė modulį, o vaikų pažanga dabar rodo į nieką.
4. Jei yra `not_in_path` — papildyk `content/lt/grade-<NN>/path.json` `sequence` sąrašą taip, kad visi ID būtų, bet **esama tvarka nesikeistų** (nauji pridedami gale).
4a. Jei yra `path_unpinned` (įrankis sako „SEKOS TVARKA NEAPIMA N MODULIŲ“) — tai ne klaida, o **neišmatuota sritis**: tų ID perstatymo niekas nematytų, nes jų nėra užfiksuotoje sekoje. Užfiksuok juos matomu pakeitimu: `python3 scripts/check_published.py --accept-order` (sausa eiga — pamatyk, ką įrašytų), tada `--accept-order --apply`. Įrankis pats atsisakys, jei jau užfiksuotų ID tvarka pajudėta — tada tai perstatymas, o ne aprėpties spraga: grąžink seną tvarką, o sąmoningą perstatymą keisk `scripts/known_path_order.json` ranka, kad sprendimas būtų matomas `git diff`.
5. Patikrink 3 gyvus adresus: `curl -s -o /dev/null -w "%{http_code}" https://one-man-company.github.io/suprask/content/lt/grade-<NN>/<kryptis>/<modulis>.json`.
5a. Jei yra `shell_version_unstamped` (sėkmės eilutė sako „kodo nuorodos su `?v=`: N/M“, N < M) — `index.html` turi kodo nuorodą, kuriai `pages.yml` neprirašė versijos žymės. Tai ne kosmetika: be žymės naršyklė tam failui iki ~10 min. ima seną kopiją iš GitHub Pages tarpinės atminties, tad vaikas gali gauti seną CSS/JS. Nuorodos **nešalink** ir žymos **neįrašyk ranka** — `pages.yml` žymą prirašo statybos metu, o repo `index.html` jos neturi. Taisyk priežastį: `.github/workflows/pages.yml` žymų vartas skaito visas `assets/css|js` nuorodas, tad jei jis raudonas — nuoroda parašyta taip, kad vartas jos neatpažįsta (absoliutus adresas, `//` pradžia, kitas katalogas). Jei vartas žalias, o `unstamped` vis tiek ne tuščias — žymė dingo po statybos; tai publikavimo defektas, pranešk, o ne taisyk turinį. **Niekada nelaikyk „versija <sha>“ įrodymu, kad visos nuorodos pažymėtos** — `_version_of()` ima pirmą radinį (LL-233); vardiklį rodo tik `N/M`.
5b. Jei yra `shell_version_values` daugiau nei vienas įrašas — svetainė **mišri** (pusė failų iš vieno commit'o, pusė iš kito). Tai ne „deploy nepasivijo“: paleisk publikavimą dar kartą ir, jei nepadeda, pranešk kaip sustabdyta.
6. Jei viskas sutampa — įrašyk į `research/wiki/changelog.md` vieną eilutę su skaičiais (repo N / paskelbta N).

## Ko nedaryti
- Nešalinti modulio vien todėl, kad jis „senas“.
- Nepernumeruoti modulių (ID yra sutartis su vaiko naršykle).
- Nerašyti „paskelbta“, jei `check_published.py` to nepatvirtino.

## Baigties sąlyga
Ataskaitoje: `check_published.py` išvestis (repo / paskelbta / neišstumta), 3 HTTP kodai, ir sprendimas — `sutampa`, `ištaisyta` (su failu) arba `sustabdyta` (su priežastimi).
