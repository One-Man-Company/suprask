# Klasių sąrašas

Kiekviena klasė turi tris failus: `index.md` (programa ir struktūra), `temos.md` (temų eilė), `metodai.md` (amžiaus tinkamumas ir dizaino taisyklės). Struktūra sukurta `scripts/scaffold_grades.py`.

| Klasė | Amžius | Koncentras | Būsena |
|---|---|---|---|
| [[01/index\|1]] | 6–7 | 1–2 | Live — 35 modulių |
| [[02/index\|2]] | 7–8 | 1–2 | Rengiama |
| [[03/index\|3]] | 8–9 | 3–4 | Rengiama |
| [[04/index\|4]] | 9–10 | 3–4 | Rengiama |
| [[05/index\|5]] | 10–11 | 5–6 | Rengiama |
| [[06/index\|6]] | 11–12 | 5–6 | Rengiama |
| [[07/index\|7]] | 12–13 | 7–8 | Rengiama |
| [[08/index\|8]] | 13–14 | 7–8 | Rengiama |
| [[09/index\|9]] | 14–15 | 9–10 | Rengiama |
| [[10/index\|10]] | 15–16 | 9–10 | Rengiama |
| [[11/index\|11]] | 16–17 | 11–12 | Rengiama |
| [[12/index\|12]] | 17–18 | 11–12 | Rengiama |

## Kodėl klasės atskirtos

To paties modelio negalima perkelti iš 1 į 9 klasę. Skiriasi ne tik turinys, bet ir:

- **kognityvinė apkrova** — kiek kintamųjų vienu metu vaikas gali sekti;
- **skaitymo našta** — kiek teksto galima pateikti ekrane;
- **abstrakcijos lygis** — ar sąvoka rodoma kaip daiktas, ar kaip santykis;
- **vertinimo forma** — savikontrolė ar argumentacija;
- **sąveikos tipas** — tiesioginis manipuliavimas ar scenarijų analizė.

Todėl kiekvienos klasės `metodai.md` yra privaloma prieš kuriant bet kurį tos klasės modulį.

## Kaip pildoma

1. Patikrinti oficialią programą → `curriculum/` įrašas.
2. Užpildyti `temos.md` prioritetus (A/B/C) ir atmestas temas su priežastimi.
3. Parašyti modulį pagal `docs/KURINIO-STANDARTAS.md`.
4. Praeiti validatorių ir pedagoginę patikrą (gairių 6 skyrius).
5. Įrašyti į `content/lt/grades.json` kaip `live` tik tada, kai yra bent 3 moduliai.
