# metodininkas — 2026-11-23T0824

- paleidimas: #468 (manual)
- trukmė: 585s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/07-elektronika-draft.json
│ @@ -0,0 +1,105 @@
│ +{
│ +  "id": "07-elektronika",
│ +  "grade": 1,
│ +  "strand": "technologijos",
│ +  "title": "Mygtukas grįžta, jungiklis lieka",
│ +  "subtitle": "Tas pats paspaudimas baigiasi dviem būdais",
│ +  "minutes": 9,
│ +  "outcomes": [
│ +    "Parodau, kad po paspaudimo jungiklis lieka, o mygtukas grįžta atgal.",
│ +    "Nuspėju, ar šviesa liks degti atleidus, ir pasitikrinu modelyje.",
│ +    "Paaiškinu, kodėl šviesa dega tol, kol valdiklis lieka toje padėtyje."
│ +  ],
│ +  "concept": {
│ +    "title": "Šviesa seka valdiklį",
│ +    "big_idea": "Abu valdikliai įjungia tą pačią šviesą. Skirtumas ryškus paleidus: jungiklis lieka nuspaustas, o mygtukas grįžta. Šviesa dega tol, kol valdiklis yra įjungtoje padėtyje.",
│ +    "steps": [
│ +      "Paspausk jungiklį ir pažiūrėk, kas dega.",
│ +      "Atleisk ir pažiūrėk, ar jungiklis liko.",
│ +      "Tą patį padaryk su mygtuku.",
│ +      "Pasakyk, kas skiriasi paleidus."
│ +    ],
│ +    "example": "Namuose šviesos jungiklis lieka įjungtas, o durų skambutis skamba tik kol laikai."
│ +  },
│ +  "sim": {
│ +    "component": "valdiklis",
│ +    "config": {
│ +      "lamp": { "on": "Šviesa dega", "off": "Šviesa užgęsta" },
│ +      "controls": [
│ +        { "key": "jungiklis", "label": "Jungiklis", "behaviour": "lieka" },
│ +        { "key": "mygtukas", "label": "Mygtukas", "behaviour": "grizta" }
│ +      ],
│ +      "labels": {
│ +        "press": "Paspausk",
│ +        "release": "Atleisk",
│ +        "guess": "Kas bus atleidus?",
│ +        "stay": "Liks",
│ +        "goes": "Užgęs",
│ +        "again": "Iš naujo",
│ +        "tableTitle": "Ką paliko pirštas"
│ +      },
│ +      "sentences": {
│ +        "start": "Paspausk vieną valdiklį ir pažiūrėk.",
│ +        "press": "Šviesa dega. Pirštas dar laiko.",
│ +        "guess": "Pirma spėk, tada atleisk.",
│ +        "stay": "Jungiklis liko nuspaustas. Šviesa dega toliau.",
│ +        "goes": "Mygtukas grįžo atgal. Šviesa užgęsta.",
│ +        "table": "Abu veikia. Vienas lieka, kitas grįžta.",
│ +        "reset": "Pradedam iš naujo. Abu valdikliai atstatyti."
│ +      }
│ +    }
│ +  },
│ +  "tasks": [
│ +    {
│ +      "q": "Paspausei mygtuką ir paleidai. Kas nutiko šviesai?",
│ +      "options": ["Šviesa liko degti", "Šviesa užgeso", "Šviesa tapo ryškesnė"],
│ +      "answer": 1,
│ +      "hint": "Pažiūrėk į mygtuką po paleidimo.",
│ +      "why": "Mygtukas grįžta, todėl šviesa dega tik kol laikai.",
│ +      "optional": false
│ +    },
│ +    {
│ +      "q": "Šviesą įjungi jungikliu ir išeini iš kambario. Kas bus?",
│ +      "options": ["Šviesa degs toliau", "Šviesa užges iškart", "Šviesa degs tik minutę"],
│ +      "answer": 0,
│ +      "hint": "Pažiūrėk, ar jungiklis liko žemyn.",
│ +      "why": "Jungiklis liko įjungtas, todėl šviesa dega ir be tavęs.",
│ +      "optional": false
│ +    },
│ +    {
│ +      "q": "Durų skambutis nutyla paleidus mygtuką. Kodėl?",
│ +      "options": ["Nes skambutis turi laikmatį", "Nes garsas nueina per sieną", "Nes mygtukas grįžta į vietą"],
│ +      "answer": 2,
│ +      "hint": "Skambutis neturi laikmačio — kas jį išjungia?",
│ +      "why": "Skambučio mygtukas grįžta, todėl garsas baigiasi kartu.",
│ +      "optional": false
│ +    },
│ +    {
│ +      "q": "Jungiklis liko įjungtas visą naktį. Kas nutiks, jei jo neliesi?",
│ … omitted 27 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/check_draft.py
│ @@ -0,0 +1,34 @@
│ +#!/usr/bin/env python3
│ +"""Juodraštinio modulio vartai: tas pats kelias kaip CI, be paliktų failų."""
│ +import json
│ +import pathlib
│ +import sys
│ +
│ +ROOT = pathlib.Path("/home/zoltanas/workspace/suprask")
│ +sys.path.insert(0, str(ROOT / "scripts"))
│ +import validate_content as vc  # noqa: E402
│ +import check_language as cl  # noqa: E402
│ +
│ +draft = pathlib.Path("/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/07-elektronika-draft.json")
│ +target = ROOT / "content/lt/grade-01/technologijos/07-elektronika.json"
│ +raw = draft.read_text(encoding="utf-8")
│ +data = json.loads(raw)
│ +target.write_text(raw, encoding="utf-8")
│ +try:
│ +    rep = vc.Report()
│ +    sims = vc.registered_sims() | {"valdiklis"}
│ +    meta = json.loads((ROOT / "content/lt/grades.json").read_text(encoding="utf-8"))
│ +    vc.check_module(target, data, rep, sims, meta)
│ +    print("validate_content: errors", len(rep.errors), "warnings", len(rep.warnings))
│ +    for e in rep.errors:
│ +        print("  E:", e)
│ +    for w in rep.warnings:
│ +        print("  W:", w)
│ +    out = []
│ +    cl.check_module(target, out)
│ +    print("check_language: findings", len(out))
│ +    for f in out:
│ +        print("  L:", f["severity"], f["where"], f["issue"], "|", f["detail"])
│ +finally:
│ +    target.unlink()
│ +print("draft removed:", not target.exists())
│ research/wiki/grades/01/metodai.md
│ @@ -1407,6 +1407,116 @@
│
│  **Šaltiniai.** NŠA (2024). *Pradinio ugdymo bendrųjų programų įgyvendinimo rekomendacijos*, etika ir skaitmeninio turinio kūrimas (`sources/pradinio-bp-rekomendacijos-2024.txt:105–106`, `:12271–12273`, `:16434–16442`). Suler, J. (2004). The online disinhibition effect. *CyberPsychology & Behavior, 7*(3), 321–326. https://doi.org/10.1089/1094931041291295 · Widen, S. C., & Russell, J. A. (2008). Children acquire emotion categories gradually. *Cognitive Development, 23*(2), 291–312. https://doi.org/10.1016/j.cogdev.2008.01.002 · Piaget, J. (1932). *The Moral Judgment of the Child*. London: Kegan Paul.
│
│ +### M-15 — Jungiklis lieka, mygtukas grįžta: šviesą laiko padėtis, o ne pirštas
│ +
│ +**Data:** 2026-11-23 · **Tema:** 1 klasės technologijos, 23.4.1 „Elektros, elektronikos prietaisai… valdymo ypatumai — jungiklio, mygtuko panaudojimas“ (`sources/pradinio-bp-rekomendacijos-2024.txt:9788–9796`), programos pozicija `D:elektronika`, būsena `missing` (`research/wiki/curriculum/backlog.json`) 

… PRALEISTA 24307 SIMBOLIŲ IŠ 42307 (įrankių išklotinės) — visa ataskaita: agents/work/metodininkas/00468/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

dėžutės sąmoningai vienodo dydžio ir viename aukštyje, kad dydis ar vieta negalėtų tapti paaiškinimu. Trečias — paprasta lempa be atminties yra sąmoninga modelio riba, kuri įvardijama `teacher` bloke, o ne nutylima.
│  - **Kaip matuojame:** (1) ar po pirmo paleidimo vaikas savais žodžiais pasako, kad jungiklis liko, o pirštas jau ne; (2) ar po antro valdiklio pasako, kad knopkė grįžo; (3) ar 3 užduotyje (durų skambutis) remiasi valdiklio padėtimi, o ne „laikmačiu“; (4) ar praplėtimo užduotyje (jungiklis per naktį) nepasako „užges savaime“. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
│  - **Rezultatas:** dar nėra. Metodas ir pasiūlymas įrašyti (`agents/proposals/2026-11-23-metodininkas-elektronika.json`), modulis dar nesukurtas. Techninė patikra, kurią galima padaryti be modulio: juodraštinis modulis praėjo `validate_content.check_module` (0 klaidų, 1 įspėjimas — komponento kūno dar nėra, tad `sim.config` gyvumas nepatikrintas) ir `check_language.check_module` (0 radinių, 1 kl. riba — 10 žodžių).
│  - **Sprendimas:** laukiama duomenų. Jei vaikai vis tiek sako „šviesa liko, nes aš taip norėjau“, pirmiausia stiprinamas ne tekstas, o **padėties matomumas**: svirtis nuspalvinama ir po paleidimo lieka pusiau nuleista tol, kol vaikas pasako, kas laiko šviesą. Jei 360 px ekrane lempa ir dvi dėžutės per ankštos, lempa keliama aukščiau palangės, o dėžutės lieka to paties dydžio — mažinti dėžučių negalima, nes tada dydis vėl taptų pašaliniu požymiu. Jei „Paspausk / Atleisk“ atrodo kaip du atskiri veiksmai, o ne vienas judesys, antras bakstelėjimas pervardijamas į „Nuimk pirštą“, o supaprastinimas pasakomas garsiau.
│ research/wiki/changelog.md
│ @@ -1,6 +1,17 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-23 (08:35) — Metodininkas #468: M-15 „Jungiklis lieka, mygtukas grįžta“ (programos pozicija D:elektronika)
│ +
│ +- **`grades/01/metodai.md`** — naujas metodas M-15: vienas kintamasis (kurį valdiklį vaikas paspaudė), ta pati lempa ir tas pats veiksmas; jungiklis po paleidimo lieka, mygtukas grįžta, todėl šviesa dega arba užgęsta. Yra 5 žingsnių seka, simuliacijos `valdiklis` 7 būsenų lentelė su `readout`/`api.note`, išvedama būsena (`lit = behaviour === "lieka" ? down : pressed`), geometrija 360 px, fokaso ir garso taisyklės, 4 užduotys (indeksai 1/0/2/0), 5 klaidingos nuostatos ir 5 modelio ribos.
│ +- **`agents/proposals/2026-11-23-metodininkas-elektronika.json`** — `type: metodas`, `priority: high`, `target: content/lt/grade-01/technologijos/07-elektronika.json`, 13 `evidence` įrašų su failų eilutėmis ir DOI. Be šio įrašo kūrėjas metodo nematytų.
│ +- **`guidelines/pilotai.md`** — P-022: hipotezė, ką keičiame (pirmas modelis, kuriame pasekmė ateina **po** veiksmo pabaigos ir ją neša valdiklio padėtis), matavimo kriterijai ir atsarginiai sprendimai.
│ +- **Šaltinis:** NŠA (2024) 23.4.1 (`sources/pradinio-bp-rekomendacijos-2024.txt:9788–9796`) · Osborne (1983) https://doi.org/10.1080/0263514830010108 · Chinn & Brewer (1993) https://doi.org/10.3102/00346543063001001 · Bonawitz ir kt. (2011) https://doi.org/10.1016/j.cognition.2010.10.001 · Shipstone (1984) https://doi.org/10.1080/0140528840060208
│ +- **Poveikis platformai:** būsimas modulis `07-elektronika` (technologijos, po `01-elektros-grandine`); patikrinta, kad temos platformoje nėra — `grep -rin "mygtuk" content/lt/grade-01/technologijos/` duoda 1 eilutę ir ji yra `01-elektros-grandine.json` `sources` lauke, o `grep -rin "atleis\|atleid" content/lt/grade-01/` — 0 eilučių (2026-11-23).
│ +- **Patikra:** juodraštinis modulis praėjo `validate_content.check_module` (0 klaidų, 1 įspėjimas: komponento kūno dar nėra, tad `sim.config` gyvumas nepatikrintas) ir `check_language.check_module` (0 radinių); `git status` po patikros švarus, `content/` neliestas.
│ +- **Taisymas ideatoriaus tekste:** `agents/proposals/2026-11-23-ideator-mygtukas-ir-jungiklis.json` durų skambutį priskyrė prie „įsimenančių“ įtaisų; skambutis kaip tik neturi atminties, todėl metode jis yra priešpriešinis pavyzdys (3 užduotis), o telefonas ir liftas — modelio riba, ne užduotis (LL-18). Pasiūlymo statuso šis vaidmuo neliečia.
│ +- **Nepadaryta ir pasakyta:** `foundations/` įrašo nepridėta — įžvalga „pasekmę neša valdiklio padėtis, o ne veiksmas“ šiame amžiuje lieka šios temos viduje ir jau užfiksuota M-15 modelio ribose bei P-022; platesniam fundamentui trūksta antro nepriklausomo modelio. Naršyklės zondo (360 px) nėra, nes modulio ir komponento dar neegzistuoja.
│
│  ## 2026-11-23 — Tyrėjas #465: du fundamentai sutvarkyti (apimtis ≤800 žodžių), platformos matavimai perskaičiuoti, indeksas papildytas
│
│ research/wiki/grades/01/metodai.md
│ @@ -1440,7 +1440,7 @@
│
│  **Privalomas spėjimo žingsnis prieš kiekvieną pirmą paleidimą.** Du spėjimai per visą modulį — po vieną kiekvienam valdikliui. Spėjimas turi lygiai du variantus („Liks“ / „Užgęs“), lieka matomas virš scenos iki paleidimo ir po jo niekada nevadinamas klaida (LL-15). Be spėjimo modelis virsta animacija: vaikas žiūri, kaip lemputė keičiasi, bet nepastebi, kas nutiko valdikliui. Spėjimas taip pat yra vienintelis būdas pamatyti nuostatą „paspaudžiau → liks“ **prieš** ją paneigiant, o ne po to, kai vaikas jau žino atsakymą.
│
│ -**Simuliacijos specifikacija.** Komponentas `valdiklis`, failas `assets/js/sims/technologijos.js` (jis jau importuoja `art.js` ir naudoja `art.defs`, `art.plank`, `art.block`, `art.ball`, `art.spot`, todėl `scripts/check_art.py` naujų dalių nereikalauja ir LEGACY sąrašo liesti negalima). Registracija: `SIMS` bloke (`technologijos.js:1380–1385`) pridedama eilutė `"valdiklis": valdiklis,` po `"drabuziu-prieziura"`. `config`:
│ +**Simuliacijos specifikacija.** Komponentas `valdiklis`, failas `assets/js/sims/technologijos.js` (`art.js` jau turi visas reikalingas dalis — `art.defs`, `art.plank`, `art.block`, `art.ball`, `art.spot`, o pats failas jau kviečia `art.plank` 6 kartus, `art.defs`, `art.spot`, `art.flatShape`, `art.materialCube`, todėl `scripts/check_art.py` reikalavimas „≥3 `art.*` kvietimai“ tenkinamas ir LEGACY sąrašo liesti negalima). Registracija: `SIMS` bloke (`technologijos.js:1380–1385`) pridedama eilutė `"valdiklis": valdiklis,` po `"drabuziu-prieziura"`. `config`:
│
│  ```json
│  { "lamp": { "on": "Šviesa dega", "off": "Šviesa užgęsta" },
│ research/wiki/grades/01/metodai.md
│ @@ -1477,7 +1477,7 @@
│  - **Įėjimai ir klaviatūra:** visi elementai `<button>`; `Tab` eilė — jungiklis → mygtukas → „Paspausk“ → „Atleisk“ → „Iš naujo“; `Enter` / `Space` aktyvuoja; `aria-pressed` žymi nuspaustą valdiklį, `aria-live="polite"` — `readout`. `aria-label` pasako būseną žodžiais („Jungiklis nuspaustas, šviesa dega“), ne vien spalvą.
│  - **Fokusas** (LL-32): pasirinkus valdiklį fokusas eina į „Paspausk“; po paspaudimo — į spėjimo mygtukus; po spėjimo — į „Atleisk“; po paleidimo — į kito valdiklio „Paspausk“, o kai abu išbandyti — į „Iš naujo“. Nenaudojami valdikliai žymimi `aria-disabled` ir `focus()`, o ne `disabled`, kad fokusas neprapultų.
│  - **Grįžtamasis ryšys** — `readout` po paleidimo įvardija **padėtį**, `api.note` sako **kodėl**, ir niekada „teisingai“ (T2.3, T5.1). `api.progress({ correct: true })` kviečiamas vieną kartą, kai abu valdikliai turi `released === true` **dabartinėje** būsenoje ir lentelėje yra abi eilutės (LL-17), o ne po pirmo paleidimo (LL-29). „Iš naujo“ pažangos netrina (LL-16).
│ -- **Garsas:** tariamos tik instrukcijos ir paaiškinimai iš `config.sentences` (7 frazės × 2 įrašai = 14 naujų mp3), o `api.note` rodo **tą patį** sakinį, kuris tariamas — todėl ekranas ir balsas negali išsiskirti. Eilutės lentelėje ir `readout` netariamos kiekvieną kartą (LL-14).
│ +- **Garsas:** tariamos tik instrukcijos ir paaiškinimai iš `config.sentences` (7 frazės; kiekviena gauna po du įrašus — `n` ir `s` — tad manifestas išaugs iki 14 įrašų, jei tų pačių sakinių dar neturi), o `api.note` rodo **tą patį** sakinį, kuris tariamas — todėl ekranas ir balsas negali išsiskirti. Eilutės lentelėje ir `readout` netariamos kiekvieną kartą (LL-14).
│  - **Be laikmačių, be ėjimų limito, be „game over“.** Paleidimą galima kartoti tiek, kiek vaikas nori, ir abi būsenos turi savo įrodymą paveiksle: dega — švytėjimas ir nuleista svirtis, ne — tamsi lemputė ir grįžusi knopkė (LL-143).
│
│  **Užduotys.**
Darbas baigtas. Metodas įrašytas į repo, ne tik ataskaitoje.

KAS PAKEISTA

1) research/wiki/grades/01/metodai.md — naujas metodas M-15 (110 eilučių, prieš „Atviros prielaidos“):
   „Jungiklis lieka, mygtukas grįžta: šviesą laiko padėtis, o ne pirštas“.
   Priežastis rinktis šią temą: programos pozicija D:elektronika yra `missing`
   (backlog.json), o grandinė platformoje jau mokoma (01-elektros-grandine).
   Patikrinta, kad temos nėra: `grep -rin "mygtuk" content/lt/grade-01/technologijos/`
   duoda 1 eilutę ir ji yra sources lauke; `grep -rin "atleis\|atleid"
   content/lt/grade-01/` — 0 eilučių.

   Viena didelė idėja: tas pats veiksmas (paspaudimas → paleidimas) baigiasi
   dviem būdais, ir skirtumą nuleidžia valdiklio padėtis, ne pirštas.
   Jungiklis lieka nuspaustas → šviesa dega; mygtukas grįžta → šviesa užgęsta.
   Todėl modelis neša antrą įrodymą tame pačiame kadre (LL-143): dega — švytėjimas
   IR nuleista svirtis; ne — tamsi lemputė IR grįžusi knopkė.
   Abu valdikliai sąmoningai vienodo dydžio, viename aukštyje — kad dydis negalėtų
   tapti paaiškinimu (paneigia nuostatą „didesnis įsimena“).
   Būsena išvedama: `lit = behaviour === "lieka" ? down : pressed`; config neturi
   lauko, kuo baigiasi paleidimas (ta pati taisyklė kaip M-07, M-13, M-14).

   Specifikacijoje yra viskas, ko prašo baigties sąlyga: 5 žingsnių seka su tikslais,
   7 būsenų lentelė (readout + api.note), sim `valdiklis` faile technologijos.js su
   registracijos eilute, config JSON, geometrija 360 px su konkrečiomis art.js
   koordinatėmis, fokaso taisyklės (LL-32), api.progress tik po abiejų paleidimų
   (LL-17, LL-29), 4 užduotys (indeksai 1/0/2/0) su tipinėmis klaidomis, refleksija,
   5 modelio ribos, 4 DOIs.

2) agents/proposals/2026-11-23-metodininkas-elektronika.json — `type: metodas`,
   `priority: high`, target `content/lt/grade-01/technologijos/07-elektronika.json`,
   13 evidence įrašų su failų eilutėmis.

3) research/wiki/guidelines/pilotai.md — P-022 (hipotezė, ką keičiame, matavimas,
   atsarginiai sprendimai).

4) research/wiki/changelog.md — įrašas 2026-11-23 (08:35).

KĄ PATAISIAU IDEATORIAUS TEKSTE

#466 durų skambutį priskyrė prie įtaisų, kurie „įsimena“. Skambutis kaip tik
neturi atminties — jis yra priešpriešinis pavyzdys. Todėl jis perkeltas į 3 užduotį,
o telefonas/liftas liko modelio riboje, ne užduotyje (LL-18: gyvenime teisingas
variantas negali būti neteisingas atsakymas). Tai įrašyta ir metodo pastaboje.

PATIKRA (realūs paleidimai, ne ketinimai)

  validate_content.py --grade 1 --strict → 0 klaidų, 0 įspėjimų
  check_language.py --grade 1            → 0 klaidų (sakinio riba 10 ž.)
  check_registry.py --grade 1            → 62/62/62/273/62/62, našlaičiai 0
  juodraštinis modulis (scratch, tada ištrintas):
      validate_content.check_module → 0 klaidų, 1 įspėjimas
      check_language.check_module   → 0 radinių
  git status po patikros: content/ neliestas, liko tik 4 numatyti failai.

Įspėjimas paliktas ir neapeistas: komponento kūno dar nėra, todėl sim.config
gyvumo (LL-61) patikrinti negalima — tai turės padaryti tas, kas rašys `valdiklis`.

KO NEDARIAU

- foundations/ įrašo nepridėjau: įžvalga „pasekmę neša valdiklio padėtis, o ne
  veiksmas“ kol kas lieka šios temos viduje ir jau užfiksuota M-15 ribose bei P-022;
  platesniam fundamentui trūksta antro nepriklausomo modelio.
- Naršyklės zondo 360 px nėra — modulio ir komponento dar neegzistuoja.
- Nė vieno atviro pasiūlymo tikslo failas šiame commit'e nepakeistas, todėl
  ataskaitos pirma eilutė be „ĮGYVENDINTA:“ (07-elektronika.json dar nesukurtas —
  jį kurs kūrėjas pagal šį metodą).

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-17e7e256823ec66e588d20d5d9bb8c5e55e95a412b5c881c753592baaa251ac2
```
