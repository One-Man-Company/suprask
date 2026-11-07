# Kurinio standartas

Techninė ir pedagoginė specifikacija tam, kaip atrodo SUPRASK modulis. Viskas, kas neatitinka šio dokumento, automatiškai atmetama `scripts/validate_content.py`.

## 1. Failo vieta ir pavadinimas

```
content/lt/grade-XX/<kryptis>/<NN>-<slug>.json
```

- `grade-XX` — dviejų skaitmenų klasė (`grade-01` … `grade-12`).
- `<kryptis>` — viena iš `index.json` nurodytų krypčių (`lietuviu-kalba`, `matematika`, `pasaulio-pazinimas`, `zaidimu-teorija`, …).
- `NN` — dviejų skaitmenų eilės numeris kryptyje.
- `<slug>` — lietuviškas pavadinimas be diakritikų, brūkšneliais.

Modulis registruojamas `content/lt/grade-XX/index.json` masyve `strands[].modules[]`.

## 2. Modulio JSON laukai

| laukas | tipas | privalomas | reikšmė |
|---|---|---|---|
| `id` | string | ✔ | unikalus visoje platformoje, toks pat kaip failo pavadinimas be `.json` |
| `grade` | int | ✔ | 1–12 |
| `strand` | string | ✔ | krypties ID iš `index.json` |
| `title` | string | ✔ | iki 42 simbolių, be taško gale |
| `subtitle` | string | ✔ | viena eilutė, iki 80 simbolių |
| `minutes` | int | ✔ | 8–12 |
| `outcomes` | string[] | ✔ | 1–3 rezultatai, prasidedantys veiksmažodžiu („Skiriu…“) |
| `concept.title` | string | ✔ | iki 40 simbolių |
| `concept.big_idea` | string | ✔ | 1–2 sakiniai, iki 240 simbolių |
| `concept.steps` | string[] | ✔ | 2–4 žingsniai, kiekvienas iki 200 simbolių |
| `concept.example` | string | – | konkretus pavyzdys iš vaiko gyvenimo |
| `sim` | object | – | `{ component, config }`; `component` turi egzistuoti simuliacijų registre |
| `tasks` | object[] | ✔ | 3–5 užduotys (žr. 3 skyrių) |
| `reflect` | string | ✔ | vienas atviras klausimas, į kurį atsakoma žodžiu |
| `teacher` | object | ✔ | `goal`, `prompt`, `offline`, `misconceptions[]` |
| `sources` | string[] | ✔ | bent vienas oficialus šaltinis |
| `svietimas1` | string[] | ✔ | bent viena sąsaja su „Švietimo kelrodžio“ žingsniu |

## 3. Užduoties objektas

```json
{
  "q": "Klausimas, kuris tikrina supratimą naujoje situacijoje",
  "options": ["A", "B", "C"],
  "answer": 0,
  "hint": "Užuomina, nukreipianti į klaidą, o ne į atsakymą",
  "why": "Paaiškinimas, kodėl atsakymas teisingas",
  "optional": false
}
```

Taisyklės:

- `answer` — indeksas į `options`; teisingas atsakymas negali būti visada pirmas (validatorius tikrina pasiskirstymą).
- `hint` privalomas kiekvienai užduočiai; jame draudžiama rašyti teisingą atsakymą.
- `why` — vienas sakinys, susiejantis atsakymą su modeliu ar sąvoka.
- Klausimai „Ką atsimeni?“, „Kuris teiginys teisingas?“ be konteksto neleidžiami.
- Bent viena užduotis turi būti perkėlimo (transfer) tipo: ta pati sąvoka kitoje situacijoje.
- `optional: true` — praplėtimo užduotis greitesniems mokiniams. **Kiekviename modulyje privaloma bent viena** (gairių T3.4), visose klasėse.

## 4. Simuliacijos sutartis

Simuliacija registruojama `assets/js/sims/<sritis>.js` faile:

```js
export const SIMS = {
  "mano-sim": {
    mount({ stage, controls, api, config }) {
      // piešiam į stage ir controls
      return () => { /* valymas, jei reikia */ };
    },
  },
};
```

`api` suteikia:

- `api.speak(text)` — lietuviškas balsas (gerbia garso išjungimą);
- `api.readout(text)` — didelis tekstas virš simuliacijos (`aria-live`);
- `api.note(text)` — paaiškinimas po simuliacija;
- `api.progress(payload)` — pažymima, kad mokinys pasiekė rezultatą.

Reikalavimai simuliacijai:

1. **Turi būti modelis, ne animacija.** Naudotojas keičia bent vieną parametrą ir mato pasekmę.
2. **Jokia klaida nėra galutinė.** Visada galima bandyti dar kartą be perkrovimo.
3. **Be laiko spaudimo.** Jokių laikmačių, ėjimų limitų, „game over“.
4. **Prieinamumas.** Visi interaktyvūs elementai — `button` arba `[role=button]` su `tabindex` ir `aria-label`; spalva niekada nėra vienintelis informacijos nešėjas.
5. **Be išorinių resursų.** Jokių CDN, šriftų, sekimo skriptų, tinklo užklausų po įkėlimo.
6. **Mobilus pirmiausia.** Veikia 360 px pločio ekrane; lietimo taikiniai ≥ 48 px.
7. **Tvarkingas išėjimas.** Jei naudojami `setInterval`/`setTimeout`, grąžinama valymo funkcija.

## 5. Vertinimo lygiai

Tie patys visose klasėse:

| lygis | ką reiškia | kaip atrodo platformoje |
|---|---|---|
| pradedantysis | atpažįsta sąvoką su pagalba | užuominos, modelio demonstracija |
| pagrindinis | taiko sąvoką įprastoje situacijoje | visos privalomos užduotys |
| aukštesnysis | taiko sąvoką naujoje situacijoje ir paaiškina | `optional` užduotis + refleksija |

Naudojama tik mokymuisi. Pažymiai nerašomi, lygiai nėra rodomi kaip „įvertinimas“ vaikui.

## 6. Kalbos taisyklės

- Sąsaja ir turinys — tik lietuvių kalba; kitos kalbos pridedamos per `content/<lang>/`, ne maišant į vieną failą.
- Terminija — oficiali: **skaičių tiesė**, **garsas**, **raidė**, **skiemuo**, **dėmuo**, **pasiekimų sritis**.
- Sakinio ilgis 1–2 klasei — iki 10 žodžių; 3–4 — iki 14; 5–6 — iki 18.
- Vienaskaitos antrasis asmuo („pabandyk“, „pasakyk“), ne „mokinys turi“.
- Jokių anglicizmų vartotojo sąsajoje („skill“, „level“, „streak“, „challenge“).
- Diakritika privaloma visur, įskaitant klaidų pranešimus.

## 7. Klasės indeksas

`content/lt/grade-XX/index.json`:

```json
{
  "grade": 1,
  "age": "6–7 metai",
  "note": "viena eilutė apie klasės tikslą",
  "strands": [
    {
      "id": "matematika",
      "grade": 1,
      "title": "Matematika",
      "emoji": "🔢",
      "intro": "viena eilutė",
      "modules": [
        { "id": "04-skaiciu-tiese", "title": "Skaičių tiesė", "subtitle": "…",
          "file": "grade-01/matematika/04-skaiciu-tiese.json",
          "minutes": 9, "sim": "skaiciu-tiese" }
      ]
    }
  ]
}
```

## 8. Patikra

```bash
python3 scripts/validate_content.py             # visi moduliai
python3 scripts/validate_content.py --grade 1   # viena klasė
python3 scripts/validate_content.py --strict    # įspėjimai kaip klaidos
```

Validatorius tikrina: JSON validumą, privalomus laukus, ID unikalumą, nuorodų į failus egzistavimą, simuliacijos registravimą, užduočių skaičių, `hint`/`why` buvimą, atsakymų pasiskirstymą, teksto ilgį, diakritiką, draudžiamus žodžius.

## 9. Naujos klasės pridėjimas

1. Sukurk `content/lt/grade-XX/index.json` pagal 7 skyrių.
2. `content/lt/grades.json` faile pakeisk `status` į `live`.
3. Sukurk `research/wiki/grades/XX/` su `index.md`, `temos.md`, `metodai.md`.
4. Pravesk `validate_content.py --grade XX`.
5. Atnaujink `docs/ARCHITEKTURA.md` skiltyje „Būsena“.

## Iliustracijos

Simuliacijų scena yra mokymo priemonė, ne puošmena: vaikas turi suprasti, kas
pavaizduota, be paaiškinimo.

- Scena surenkama iš `assets/js/sims/art.js` dalių (`defs`, `sun`, `cloud`,
  `hills`, `soil`, `pot`, `seed`, `stem`, `leaf`, `flower`, `tree`, `river`,
  `bridge`, `block`, `kid`, `grass`, `snow`, `drops`).
- Savo `<rect>` „dangui“ ar „žemei“ rašyti negalima; elipsė lapui — negalima.
- Iliustracija keičiasi pagal būseną: vanduo, šviesa, šiluma, sezonas.
- Užrašas ir paveikslas privalo sutarti (jei „žiema“ — ne žalios kalvos).
- Patikra: `python3 scripts/check_art.py` (CI) + žmogaus akis kiekvienai naujai scenai.
