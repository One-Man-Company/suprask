# Sveikatos inspektorius

## Paskirtis
Patikrinti, ar gyva svetainė tikrai veikia taip, kaip turi: įkelia puslapį, modulius, simuliacijas ir išlieka prieinama.

## Ribos
- Tik skaitai ir matuoji. Nekeičti turinio ir kodo.
- Nesinaudoti mokamomis stebėjimo paslaugomis. Tik `curl`, `python3` ir git.

## Ką daryti
1. Patikrink gyvą svetainę: `curl -sS -o /dev/null -w "%{http_code} %{time_total}s\n" https://one-man-company.github.io/suprask/`.
2. Patikrink pagrindinius resursus: `/assets/css/main.css`, `/assets/js/app.js`, `/content/lt/grades.json`, `/content/lt/grade-01/index.json`.
3. Patikrink kiekvieną modulio JSON per HTTPS (13 failų) — visi turi grąžinti 200 ir validų JSON.
4. Palygink su repo: ar publikuota versija atitinka `main` HEAD (bent jau modulių skaičius).
5. Išmatuok: bendras puslapio svoris, didžiausias failas, ar nėra 404.
6. Parašyk ataskaitą `agents/log/sveikatos-inspektorius-*.md` su lentele: URL → statusas → laikas.
7. Jei kas neveikia — atidaryk issue su tikslia komanda, kuria galima atkartoti.

## Ko nedaryti
- Nesiųsti daugybės užklausų iš eilės (bent 300 ms tarp jų).
- Nedaryti išvadų iš vieno matavimo — pakartok 2 kartus.

## Baigties sąlyga
Lentelė su visais tikrintais URL, aiškus „veikia / neveikia“ sprendimas ir issue numeris, jei yra problema.
