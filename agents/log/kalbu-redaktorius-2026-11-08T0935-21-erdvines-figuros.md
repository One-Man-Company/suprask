# Kalbu-redaktorius, paleidimas #140 — 21-erdvines-figuros: kalbos taisymai

**Data:** 2026-11-08T09:20–09:40 (+02:00) · **Vaidmuo:** kalbu-redaktorius · **Modulis:** 21-erdvines-figuros (užduoties blokas viršesnis: šiame paleidime tik šis modulis).

## Ką daryta

1. Perskaityti privalomi dokumentai (`SVIETIMAS-1-GAIRES`, `KURINIO-STANDARTAS`, `ARCHITEKTURA`), vaidmens failas, `agents/state.json`, `agents/proposals/`.
2. Perskaitytas modulis ir `research/wiki/guidelines/kalbos-auditas.md` — čia koncentruojasi radiniai **#6 (rimta)**, **#31, #32 (smulkūs)**; LL-36 disciplinai visos citatos patikrintos iš naujo failo eilutėmis (9, 90, 91) prieš redagavimą.
3. Išmatuota **prieš**: `check_language.py` (modulis: 1 info; klasė: 0/4/22), `validate_content.py --grade 1` (0/0), `check_view.py` 4 plotai (0 problemų).
4. Pakeista **4 vietos** modulio faile + subtitle sinchronizacija `index.json` (1 eil.).
5. Išmatuota **po**; visos patikros praeina.

## Prieš → po (formuluočių lentelė)

| # | Vieta | Prieš | Po | Kodėl |
|---|---|---|---|---|
| 1 | `outcomes[0]` (eil. 9) | „Skiriu kūną nuo jo vaizdo: tas pats kūgis iš priekio atrodo kitaip nei iš viršaus." — **15 žodžių** viename sakinyje | „Skiriu kūną nuo jo vaizdo. Kūgis iš priekio atrodo kitaip nei iš viršaus." — 5 + 10 ž. | Auditas #6, **rimta**: 1 kl. sakinio riba 10 ž. (standartas §6); dvitaškis sulipdė dvi mintis į vieną sakinį. Įrankis outcomes nemato (LL-52) — radinys tik rankinis. |
| 2 | `subtitle` (eil. 6) + `index.json:37` | „Tas pats kūgis iš priekio — trikampis, iš viršaus — apskritimas" | „Kūgis tas pats — iš priekio trikampis, iš viršaus apskritimas" | Įrankio info „neaiški nuoroda pradžioje". Subtitle atvaizdujama **atskirai** (modulių kortelės sąrašas `app.js:262`, puslapio `.lede` `app.js:359`) — „Tas" neturi antecedentės pirmame kontakte (LL-56). Samonės idėja išliko („tas pats" viduryje). |
| 3 | `tasks[3].hint` (eil. 90) | „Pasuk kamuolį rankoje. Ar kuri nors pusė plokščia?" | „Pasuk kamuolį rankoje. Ar nors viena pusė plokščia?" | Auditas #31: „kuri nors" netvarkinga konstrukcija; „nors viena" — žinoma 1 kl. forma. Klausimas apie stebėjimą, ne atsakymą (T3.1 nepažeista). |
| 4 | `tasks[3].why` (eil. 91) | „Rutulys apvalus iš visų pusių, o lėkštė plokščia." | „Rutulys (kamuolys) apvalus iš visų pusių, o lėkštė plokščia." | Auditas #32: q ir option kalba „kamuolys", why — tik „rutulys" be tarpinės; 6–7 m. vaikas turi sujungti kasdienį žodį su sąvoka. 9 ž., riba 10. |

`answer` indeksai (1, 2, 0, 1, 0), `options`, `optional: true` — **nepakito**. Teisingas atsakymas ir užduočių esmė — nepakito.

## Atsakytas radinys (korektas)

- **`tasks[4].q` žmogaus asmens forma** — mano sesijos pradžios skaityme (09:19) failas rodė „Iš priekio **matau** trikampį…". Tačiau `git show` įrodė, kad **HEAD nuo 0504a80 jau turi „matai"** (`0504a80`, `378dbd8`, `7db8a6d`, HEAD — visi blobai vienodi). T. y. diskas trumpam turėjo svetimą nebaigtą būseną (kitas agentas dirba tame pačiame kataloge — LL-45/LL-54 šeima), o mano patch'as prieš HEAD turinį buvo **no-op** (`7db8a6d` numstat modulio failui 4/4 — tik subtitle, outcomes, hint, why). Į commit'intą turinį asmens formulos nekirto: ji jau buvo teisinga. Išmoka: prieš redaguojant, eilutės tikrinamos ne tik iš disko, bet ir iš HEAD blobo, kai darbinė kopija švari, o skaitymas jaunas.

## Skaičiai (prieš → po)

- **`check_language.py` (modulis 21-erdvines-figuros): 1 info → 0** (warn 0 → 0, error 0 → 0). Klasės lygmeniu: info 22 → 21, warn 4 → 4 (visi 4 kituose moduliuose, buvo ir prieš), error 0 → 0.
- **`outcomes[0]` sakinio ilgis (rankinis, įrankis nemato — LL-52): 15 ž. → 5 + 10 ž.**
- **`validate_content.py`: 0/0 → 0/0** (`--grade 1` ir be parametrų, abu exit 0).
- **`check_view.py --module 21-erdvines-figuros --viewports desktop,tablet,phone,small`** (1440/1024/390/360, Brave skydų blokada localStorage/crypto.subtle/speechSynthesis įbuildinta):
  - `overflow`: 0 → 0 (visuose keturiuose plotuose)
  - `smallCount`: 0 → 0; `clipped`: [] → []
  - `tasksVisible`: 5/5 → 5/5
  - `minTaskFont`: 21.44 / 21.44 / 19.14 / 18.96 px → **identiškai** (tekstas trumpėjo, išdėstymas nepakito)
  - `simVisibleControls`: 14 → 14; `eyebrowLines`: 1 → 1; `loading`/`fatal`/`errors`: false → false
  - Rezultatas: 4 patikros, **0 problemų, exit 0** (prieš ir po).

## Ko sąmoningai nekeitė (ir kodėl)

- **`concept.*`, `sim.config`, `teacher.*`, `sources`, `svietimas1`** — vaidmens riba; `sim.config` yra vienintelis garso šaltinis (LL-42) ir čia geras (visi sakiniai ≤ 10 ž.).
- **Terminai** „stačiakampis gretasienis", „ritinys", „rutulys", „kūgis", „kubas", „erdvinės figūros" — pačios sąvokos / oficiali programos terminija (audito #137 taisyklė). „simuliacijoje" = 13 raidžių, riba ≤ 13 — neviršyta.
- **`tasks[1].hint` „Ar dėžutė turi kampus?"** — nukreipia į stebėjimą (kampai skiria kubą nuo ritinio), nurodo klaidą, ne atsakymą (T3.1 laikoma).
- **`tasks[4]` variantas „Kamuolys didesnis"** — gali būti teisingas gyvenime (didžiulis kamuolys vs maža lėkštė), bet tai numanomas distraktorius apie **neesminį** atributą: užduotis lygina formas, o ne dydžius, ir dydis nenurodytas (definijuojantis vs neesminis požymis — 1 klasės programos tema). Pedagogika, ne kalba — metodininko sritis; LL-18 nepalaikiau, nes kamienas pats apibrėžia lyginamųjų savybių klasę.
- **`tasks[4]` variantas „Lėkštė neturi krašto"** — teiginys neteisingas (lėkštė turi kraštą/riedelę), todėl distraktorius galioja.
- **21 info kituose moduliuose** — auditas #137 peržiūrėjo visus 22 ir paliko (referentai aiškūs); nekartojau.
- **„abu apvalūs"** (tasks[4].q) — mišrios giminės koordinacija, kasdienė norma, vaikui nekliudanti.
- **concept.steps[1] „spausk jos mygtuką"** — šnekamosios kalbos riba, iš konteksto aišku.

## Nauja pamoka

**LL-58** pridėta į `research/wiki/guidelines/pamokos.md` — metaduomenų laukas (subtitle, outcomes elementas) atvaizduojamas atskirai, be aplinkos sakinių; čia sakinio pradžios įvardis kabo be pagrindo, skirtingai nuo užduočių sakinių, kur prieš tai einantis sakinys duoda antecedentę. (Numeris keistas tris kartus: LL-55, LL-56 ir LL-57 tarpinėse redakcijose atiteko lygiagretių sesijų agentams — panaikinta dubliacija.)

## Kliūtys / pastatymai bėgikliui

1. **Bėgiklis sulaimėjo mano turinio pakeitimus commit'e `7db8a6d`** („[sistema] darbinės kopijos likutis prieš kalbu-redaktorius paleidimą", 09:31:14) **darbo metu** — t. y. turinys commit'intas prieš ataskaitą. Tame commit'e yra ir **svetas** `assets/js/sims/matematika.js` (25/7 eil., run 139 kurejas, aktyvus); `c21ebee` turi dar 6/2 eil. to paties svetimo failo. Autorystė pagal turinį, ne laiką (LL-49): mano failai — `content/lt/grade-01/matematika/21-erdvines-figuros.json` (4 eil.) ir `content/lt/grade-01/index.json` (1 eil.). Commit'o žinutė failų nenominuoja (LL-47 šeima), bet `numstat` juos įrodė.
2. **LL-52 patvirtintas gyvai**: rimtasis radinys (#6, outcomes 15 ž.) buvo pilnai nematomas `check_language.py` — įrankis rodė tik 1 info (subtitle). Pateiktas pasiūlymas outcomes įtraukti į tikrintuvą (`agents/proposals/2026-11-08-kalbu-redaktorius-outcomes-vartai.json`).
3. **Trumpalaikė darbinės kopijos būsena** (žr. „Atsakytas radinys"): mano 09:19 skaitymas pagavo „matau", o HEAD nuo 0504a80 turi „matai" — diskas tarpine akimirkia turėjo svetimą nebaigtą redakciją, kuri vėliau atstatyta. `git status` tuo metu jau rodė švarą. Tai #5342 (worktree izoliacija) ir LL-45/LL-54 šeimos pažeidimas skaitymo pusėje.
4. Darbinėje kopijoje liko **svetas** pakeitimas `assets/js/sims/matematika.js` (run 139) — neliestas, į mano ataskaitą neįtrauktas.
5. **Garso nepergeneruota** ir nereikia: `generate_audio.collect()` renka tik `sim.config` raktus (`word/syllables/words/sentences/label`, `scripts/generate_audio.py:157-159`) — `sim.config` neliestas.
6. **Lygiagretus to paties modulio redagavimas** (kitas kalbu-redaktorius, sibling sesija, jo logas `…T0943-21-erdvines-figuros.md`): per mano darbą jis perprašė `tasks[0].hint` („Pažiūrėk, kokia forma kūgis remiasi į stalą." → „Pažiūrėk, ką kūnis turi apačioje."), pridėjo pamoką LL-56, pasiūlymą `…-gretasienis-pavadinimas` ir pakeitė `kalbos-auditas.md`. Mano 4 pakeitimai buvo kitose eilutėse — susidūrimų nėra, abu darbai dabar diske. `check_view` pakartotas ir su jų hint'u: 4 plotai, 0 problemų. Tai #5342 (worktree izoliacija) praktinis patvirtinimas.

## Patikra

- `python3 scripts/check_language.py --grade 1` → 0 klaidų, 4 įspėjimai (buvo ir prieš; kiti moduliai), 21 pastaba (buvo 22).
- `python3 scripts/check_language.py --grade 1 --json` → modulis 21-erdvines-figuros: **0 įrašų** (buvo 1 info).
- `python3 scripts/validate_content.py --grade 1` → 0/0; `validate_content.py` (visi moduliai) → 0/0.
- `python3 scripts/check_view.py --base http://127.0.0.1:8931/ --module 21-erdvines-figuros --viewports desktop,tablet,phone,small` → 4 patikros, 0 problemų, exit 0 (prieš ir po).
- `python3 scripts/check_docs_facts.py` → 0 klaidų, 0 įspėjimų (skaičiai 7/31/31/133 nepakito — redakcija skaičių nelietė).
- Senos formuluotės `grep`'u: liko tik `agents/log/*.md` istoriniuose įrašuose (tariama, LL-36 nesikartojo); `index.json` ir modulio failas sinchronizuoti.

## Touched

`content/lt/grade-01/matematika/21-erdvines-figuros.json` (4 vietos), `content/lt/grade-01/index.json` (subtitle sinchronizacija), `research/wiki/guidelines/pamokos.md` (LL-58), `agents/proposals/2026-11-08-kalbu-redaktorius-outcomes-vartai.json`, `agents/log/kalbu-redaktorius-2026-11-08T0935-21-erdvines-figuros.md` (šis failas), `agents/state.json`. Turinio pakeitimai bėgiklio sulaimėti commit'e `7db8a6d`; ataskaitos/pasiūlymo/pamokos failai — lauka bėgiklio commit'o.
