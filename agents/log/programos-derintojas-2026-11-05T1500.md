# programos-derintojas — 2026-11-05T1500

- paleidimas: #22
- trukmė: ~630 s
- exit: 0
- modelis: deepseek/deepseek-v4.1-flash
- šaka: agent/kritikas-2026-11-05 (nepakeista; kitų vaidmenų failai neliesti)
- patikros sritis: **1 klasė, matematika** (6 moduliai)

## Ką tikrinau

1. Visus 6 gyvus matematikos modulius (`content/lt/grade-01/matematika/*.json`) — `outcomes`,
   `concept.steps`, `concept.big_idea`, `tasks[].q` ir `teacher.goal` — prieš pirminį programos tekstą.
2. Pirminį šaltinį `sources/pradinio-bp-rekomendacijos-2024.txt`, ne wiki santrauką. Cituojamos eilutės
   patikrintos `sed`/`read_file`, o ne atmintimi.
3. `research/wiki/curriculum/matematika-1-klase.md` teiginius, kurie remiasi tomis pačiomis eilutėmis —
   ieškota, ar wiki ko nėra pasakiusi daugiau, nei sako šaltinis.

## Modulių atitiktis (su citatomis)

| Modulis | Verdiktas | Pagrindas (`sources/…txt`) |
|---|---|---|
| `04-skaiciu-tiese` | iš dalies | Tema: „1 klasė. Skaičiai nuo 0 iki 100… 100-o skaičių lentelė, skaičių tiesė“ (`:33739–33740`). Apimtis: sim `max: 20`, užduotys tik 8+2, 15−4, 12 tarp 11 ir 13 — nė vieno iš trijų privalomų atvejų (`:33520–33521`: vienaženklis+vienaženklis per 10, dviženklis+vienaženklis per 10, dviženklis+dviženklis neper 10). |
| `05-desimtukas` | iš dalies | Dešimtuko sandara atitinka. „Pusė dešimtuko“ (`:19`, `:42–50`) — 2 kl. sąvoka: „2-oje klasėje… ką reiškia pusė, trečdalis…“ (`:795–800`). |
| `06-figuros` | **neatitinka** | 1 kl. branduolys — „taško, tiesės, spindulio, atkarpos – vaizdavimo brėžinyje…“ (`:1030–1033`); 2 kl. — „uždara laužtė, kampas, daugiakampis… jis turi tiek kampų, kiek ir kraštinių“ (`:1033–1037`). Modulio `outcomes[1]` „Skiriu figūras pagal kraštines ir kampus“ yra būtent 2 kl. turinys. |
| `07-desningumai` | iš esmės atitinka | 1 kl.: „objektų sekos iš 2–3 pasikartojančių narių grupių… rasti trūkstamus narius“ (`:33563`). `tasks[3]` (2, 4, 6, 8…) — auganti seka, kurią programa įvardija 3–4 kl. (`:12321–12322`). |
| `15-laikas` | **neatitinka apimties** | „1 klasė. Masė, laikas… 12 val. ir 24 val. laiko sistemose“ (`:33894–33895`). Modulio `svietimas1` teigia 24 val. sistemą „sąmoningai neįtraukusią“, t. y. sąmoningai praleidžiamas privalomas elementas. |
| `16-lygybe-svarstykles` | atitinka | „lygybėse a + b = c, a – b = c nustatyti trūkstamą skaičių“ (`:33521`). Svarstyklės — tos pačios sąvokos modelis; visos užduotys ≤ 10. |

## Pasiūlymai (3, visi `status: new`)

1. `agents/proposals/2026-11-05-programos-derintojas-figuros-2-klase.json` — **high**.
   06 modulis moko 2 klasės geometrijos (kampai, kraštinės, daugiakampio pavadinimas), o 1 kl. branduolio
   (taškas, tiesė, spindulys, atkarpa ir jų padėtis) platformoje nėra. Siūlyti du keliai: performuoti 06 arba
   perkelti jį į 2 kl. planą. Pirmasis uždarytų ir ideator #137 spragą be naujo 18-ojo modulio.
2. `agents/proposals/2026-11-05-programos-derintojas-puse-desimtuko.json` — **normal**.
   05 modulyje „pusė dešimtuko“ (žingsnis + 2 užduotis) yra 2 kl. sąvoka; be to, užduotis — apibrėžimo
   atsiminimas (prieš gairių T2.2). Siūlyta penketų struktūra ir perkėlimo klausimas.
3. `agents/proposals/2026-11-05-programos-derintojas-auganti-seka.json` — **normal**.
   07 praplėtimo užduotis — auganti skaičių seka (2, 4, 6, 8), kuri prieštarauja ir modulio rezultatui, ir
   1 kl. sekos tipui; vietoj jos siūlyta AABAAB seka su trūkstamu **viduriniu** nariu (programos reikalavimas,
   kurio nedengia nė viena užduotis).

## Wiki pataisymas

`research/wiki/curriculum/matematika-1-klase.md`:

- §3 — įrašyta tikslumo pastaba: 1 kl. aprašas sako „2–3“ narių grupių (`:33563`), o 1–2 kl. lentelė — „2–4“ (`:12297`).
  Ankstesnis teiginys „skaičių sekos — 2 klasėje“ pirminiame tekste nepasakytas → pažymėtas **[PATIKRINTI]**.
  Augančios sekos susietos su 3–4 kl. (`:12321–12322`).
- Naujas §9 — 6 modulių atitikties lentelė su eilutėmis; ja gali naudotis `kurejas` ir `ideator` be pakartotinės
  šaltinio paieškos.

## Ką patikrinau ir kas buvo tvarkoje

- `python3 scripts/validate_content.py` → **0 klaidų, 0 įspėjimų** (turinio nekeičiau — tik wiki ir pasiūlymus).
- Visi trys pasiūlymų failai — validus JSON.
- `15-laikas`: 12 val. sistema, pilnos valandos, rodyklių priklausomybė — atitinka programą; trūksta tik 24 val. dalies.
- `16-lygybe-svarstykles`: trūkstamas dėmuo, lygybės skaitymas abiem kryptimis — atitinka `:33521`; `optional`
  užduotis (4 + 3 = 5 + 2) yra perkėlimas toje pačioje klasėje, ne nauja sąvoka.

## Ko nepavyko patikrinti / ko nedariau

- **2 klasės programos teksto atskirai netikrinau** — rekomendacijose 2 kl. turinys pateiktas tik per 1–2 kl.
  lenteles, todėl „2 kl.“ priskirimas remiasi 1 klasės aprašo priešprieša („2-oje klasėje mokiniai išsiaiškins…“),
  ne atskiru 2 kl. skyriumi.
- **Nesprendžiau, ar siūlyti 15 modulio 24 val. dalį** — ideator #135 (`20-laikas-12-ir-24-val.json`) jau dengia
  šią temą, o gairių P1 draudžia dvi idėjas viename modulyje. Todėl radinys paliktas lentelėje, ne pasiūlymuose.
- **04 modulio apimties (sim `max: 20`)** neįrašiau atskiru pasiūlymu dėl 3 įrašų limito ir to, kad tam pačiam
  failui jau yra #224 (hint) — radinys fiksuotas lentelėje; jei #224 bus uždarytas, verta grįžti.
- Kitų dalykų (lietuvių kalba, pasaulio pažinimas, žaidimų teorija) šiame paleidime netikrinau — vienas
  paleidimas, viena sritis.
- Turinio modulių, `assets/`, `docs/`, `AGENTS.md` ir kitų vaidmenų failų neliečiau. Necommitinau: šakoje jau
  yra `dizaineris` ir `kritikas` necommitintų pakeitimų.
