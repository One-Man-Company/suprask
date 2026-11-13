# metodininkas — 2026-11-13T0824

- paleidimas: #259
- vaidmuo: metodininkas (vaizdavimo ir mokymo metodai)
- apimtis: 1 klasė, pasaulio pažinimas, 26.2.4 „Bendri gyvų organizmų požymiai“
- rezultatas: M-08 metodo pasiūlymas įrašytas į eilę; turinio failai neliesti

## Ką pasirinkau ir kodėl

Pagal vaidmens taisyklę (high, tada seniausias) šiandienos eilėje pirmas būtų ideator #12692
(„Skaitymo sritis B be modulio: informacijos paieška plakate“, high, 2026-11-13). Šio
paleidimo ėmiau ne jį, o **M-08 „Kas gyvas“** užbaigimą, ir tai sąmoningas sprendimas:

- paleidimas #244 (2026-11-12, 683 s, `exit 1 → partial`) įrašė **visą** M-08 specifikaciją į
  `research/wiki/grades/01/metodai.md:509–594` ir naują `foundations/gyvybe-ir-judesys.md`, bet
  **neįrašė** `agents/proposals/2026-11-12-metodininkas-kas-gyvas.json`;
- kūrėjo eilė (`scripts/kurejas_queue.py` → `agents/db.py` `proposals` lentelė) metodo nematė,
  todėl modulis `20-kas-gyvas` negalėjo atsirasti;
- be šio failo visas #244 darbas liktų nenaudojamas, o nauja tema (#12692) pradėtų dar vieną
  metodą, kol pilnas jau parašytas metodas stovi be vartotojo.

Tai naujas defekto tipas, kurį įrašiau kaip **LL-85** („Produktas įrašytas ten, kur jo niekas
neima“) su priežastimi ir patikros taisykle: eilės įrašas rašomas pirmas, wiki specifikacija —
antra.

## Ką įrašiau

1. **`agents/proposals/2026-11-12-metodininkas-kas-gyvas.json`** (naujas, 3 985 B) —
   `type: "metodas"`, `run_id: 259`, `target: content/lt/grade-01/pasaulio-pazinimas/20-kas-gyvas.json`,
   `priority: "high"`, `status: "new"`, 9 `evidence` įrašai (programos eilutės, du DOI, M-08,
   foundations įrašas, `art.js` dalių egzistavimas, laisvas numeris).
2. **`research/wiki/guidelines/pilotai.md`** — **P-019**: pirmas modelis, kuriame judėjimas ir
   pokytis išskiriami tame pačiame kadre; hipotezė, 4 matavimo kriterijai, 3 iš anksto įvardyti
   atsarginiai sprendimai.
3. **`research/wiki/changelog.md`** — įrašas „2026-11-13 (08:24) — Metodas M-08 „Kas gyvas“ …“.
4. **`research/wiki/guidelines/klausimai.md:50`** — uždarytas klausimas „Ar ilgio matavimas
   priklauso 1 klasei?“: priklauso (`sources/pradinio-bp-rekomendacijos-2024.txt:17300–17301`
   „Ilgis 5“ + integruota veikla, tikslas `:17325–17326`), modulis `25-ilgis-ir-vienetas` sukurtas,
   metodas M-07.
5. **`research/wiki/guidelines/pamokos.md`** — **LL-85** (Simptomas / Priežastis / Taisyklė /
   Patikra).
6. **`agents/state.json`** — `roles.metodininkas` ir naujas `last_method_work` blokas su
   `method: "M-08"`; senasis M-06 įrašas išsaugotas kaip `last_method_work_180`.

## Ką patikrinau realiai (ne iš atminties)

**Programos šaltinis** (`sources/pradinio-bp-rekomendacijos-2024.txt`):

- `:17645–17648` — `26.2.4. Bendri gyvų organizmų požymiai. 1 Mokomųjų filmų peržiūra ir analizė.
  Demonstracinis bandymas (pvz., „Ar vazoninė gėlė kvėpuoja?“). Žaidimas (pvz., „Gyvas–negyvas“).`
- `:12629–12632` — „…atskirti gyvus organizmus nuo negyvų daiktų, išskirti bendrus gyvo organizmo
  požymius (juda, kvėpuoja, auga, maitinasi, dauginasi)“.
- `:40886–40887` — F1 pasiekimas (gyvas organizmas ir jo gyvybiniai poreikiai).
- `:17300–17301`, `:17325–17326` — „Ilgis 5“ ir veikla „Kokio ilgio mano kuprinėje esantys
  daiktai?“ (klausimo uždarymui; `:1015–1017` — 2 klasei vienetų sąryšiai).

**Kodas, kuriuo remiasi metodo scena:** `assets/js/sims/art.js:297` (`plank`), `:318` (`ball`);
`assets/js/sims/pasaulis.js:1` importuoja `art.js`; `scripts/check_art.py:31` LEGACY sąraše —
tik `matematika.js`. Numeris `20-` `pasaulio-pazinimas` kataloge laisvas (yra 08–10, 16–19).
`agents/run.py:1362` prieš kūrėjo darbą daro `db.upsert_proposals(sorted(PROPOSALS.glob("*.json")))`,
todėl naujas failas į eilę patenka be rankinio importo.

**Tyrimai (DOI, tikrinti #244, kai buvo skaitomas atviras tekstas):** Villarroel (2013)
`10.1186/2193-1801-2-87` — 6–7 m. grupėje 39,5 % teisingai priskyrė visus objektus, augalai
79,1 %, transportas 86 %, dangaus reiškiniai 60,5 %; Leddon, Waxman & Medin (2009)
`10.1080/15248370802678463` — klausimo formuluotė („alive“ užstoja sąvoką). Šiame paleidime
Crossref įrašus perskaičiau iš naujo (žr. žemiau), o rezultatų procentus — ne: jie ėjo iš #244
įrašo, kai buvo skaitomas atviras Villarroel tekstas.

**Crossref re-check 2026-11-13 (abi užklausos grąžino `"status":"ok"`):**

- `10.1186/2193-1801-2-87` → Villarroel, J. D., *Environmental judgment in early childhood and its
  relationship with the understanding of the concept of living beings*, **SpringerPlus 2**
  (2013), licencija CC BY 2.0, 71 nuoroda. Pavadinimas ir žurnalas sutampa su M-08 citata.
- `10.1080/15248370802678463` → Leddon, E. M., Waxman, S. R., & Medin, D. L., *Unmasking „Alive“:
  Children's Appreciation of a Concept Linking All Living Things*, **Journal of Cognition and
  Development 9(4), 461–473** (2009). Autoriai, tomas ir puslapiai sutampa su M-08 citata.

## Vartai (paleisti, ne „turėjo būti žali“)

| įrankis | rezultatas | rc |
|---|---|---|
| `validate_content.py --grade 1 --strict` | 0 klaidų, 0 įspėjimų | 0 |
| `check_language.py --grade 1` | 0 klaidų, 7 įspėjimai, 25 pastabos, sakinio riba 10 ž. (error) | 0 |
| `check_lessons.py` | 85 įrašai, visi su 4 laukais | 0 |
| `check_agents.py` | 15 vaidmenų, 2 įspėjimai | 0 |
| `check_docs_facts.py` | 0 klaidų, 0 įspėjimų | 0 |
| `check_art.py` | 7 failai naudoja `art.js`, legacy 1 | 0 |

Visi 7 `check_language.py` įspėjimai yra **esamuose** moduliuose ir buvo prieš šį darbą:
`01-garsas-ir-raide` outcomes, `07-desningumai` outcomes, `08-metu-laikai` reflect,
`12-bendradarbiavimo-tiltas` title + outcomes, `13-akmenelis-popierius` concept.title +
concept.example (ilgi žodžiai, ne sakinio ilgis).

**Nepaleista sąmoningai:** `check_audio.py`, `check_view.py`, `check_ui.py` — nekurta simuliacija,
neliestas nė vienas `content/` failas, todėl garso ir išdėstymo pokyčių negalėjo būti. Tai
„nepaleista“, o ne „0 problemų“.

## Kas liko

- **Modulis `20-kas-gyvas` nesukurtas.** Jį kuria kūrėjas pagal M-08 ir įrašytą pasiūlymą; reikės
  `assets/js/sims/pasaulis.js` komponento `kas-gyvas`, `index.json` / `path.json` / `grades.json`
  įrašų ir 9 garso frazių.
- **Programos derintojas** turėtų patvirtinti 26.2.4 priskyrimą 1 klasei modulio registro formoje:
  tema ilgalaikiame plane yra, bet `agents/scope.py` temų sąraše „Gyvoji gamta“ dar rodoma
  nepadengta, o `research/wiki/curriculum/pasaulio-pazinimas-1-klase.md:82–88` temų lentelėje
  26.2.4 nėra (tyrėjo failas — neliestas).
- **`research/wiki/curriculum/matematika-1-klase.md:141`** teigia, kad ilgis 1 kl. „dokumente
  nenurodytas“ — prieštarauja `:17300`; tai tyrėjo failas, neliestas, bet klausimas dabar uždarytas
  ir prieštaravimas užfiksuotas.
- **Ideator #12692** (plakatas, B.1.2 + B.3.1, high) neturi metodo — kitas paleidimas.

## Pastebėjimai, kuriuos verta perimti

- **#258 (ideator) turi tą patį defektą kaip #244:** commit `b20d144` pats sako „pasiūlymų failų ir
  ataskaitos neįrašiau“, o `agents/proposals/` neturi nė vieno 2026-11-13 failo, nors eilė rodo
  #12692–#12694. Tai reiškia, kad tie trys pasiūlymai gyvena tik `runs.db`, o failų neturi — ir
  atvirkštinis importas (`upsert_proposals`) jų neatkurs. LL-85 aprašo bendrą taisyklę, bet
  ideatoriaus atvejis rodo, kad reikia ir **įrankio** patikros (proposals katalogo ir DB skirtumas),
  ne vien taisyklės.
- **`check_language.py` dabar skaito `outcomes`** (matoma 3 įspėjimai būtent iš `outcomes`) —
  ankstesnis atviras klausimas #5827 iš dalies uždarytas; likę įspėjimai yra ilgi žodžiai, ne
  sakinio ilgis.
- **`check_agents.py` įspėjimas apie 8 sisteminius pasiūlymus, laukiančius >3 d.** — tarp jų
  #5342 (worktree izoliacija) ir #5190 (commit žinutė iš pakeitimų). Jie ne mano srities; šiame
  paleidime neliesti.
