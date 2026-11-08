# Kalbu-redaktorius — paleidimas 143 — 21-erdvines-figuros

- **Data:** 2026-11-08T09:43+02:00
- **Vaidmuo:** kalbu-redaktorius
- **Modulis:** 21-erdvines-figuros (`content/lt/grade-01/matematika/21-erdvines-figuros.json`)
- **Snapshotas:** HEAD `7db8a6d` ([sistema] darbinės kopijos likutis prieš kalbu-redaktorius paleidimą). Medyje darbas vyksta paraleliai: kiti agentai turi nekomituotų pakeitimų `assets/css/main.css`, `assets/js/sims/matematika.js`, `assets/js/sims/zaidimai.js`, `content/.../10-gyvunu-grupes.json`, `research/wiki/guidelines/pamokos.md` — jų darbas nelietas (LL-54 tema).

## Svarbus kontekstas: radiniai jau dalinai pataisyti prieš šį paleidimą

Commit'as `7db8a6d` (09:31, „darbinės kopijos likutis") prieš šį paleidimą jau turėjo **visus tris** #137 audito radinius šiam moduliui pritaikytus formuluotes (autorystė — nutrūkęs kalbu-redaktoriaus paleidimas #140, mato launch lentelėje „running"; jo įrašas `agents/state.json` → `last_language_fix`, run_id 140, yra autoritetingas to darbo aprašymas, įskaitant index.json:37 subtitle sinchronizaciją ir atšauktą no-op bandymą). Šis paleidimas tų pataisymų **patikrino grep'u iš naujo** (LL-36 nesikartojo), prižiūrėjo jų kokybę ir **pridėjo naują, audito nerastą radinį** (tasks[0].hint'o posakis). todėl „prieš" skaičiai žemiau — iš `git show 7db8a6d^` (auditinė būsena), o ne iš šio paleidimo pradžios.

## Prieš → po (formuluočių lentelė)

| # | Laukas | Prieš | Po | Sunkumas | Autorystė |
|---|---|---|---|---|---|
| 1 | subtitle | „Tas pats kūgis iš priekio — trikampis, iš viršaus — apskritimas" (brūkšniais tarpinėje pozicijoje, sunkiau skaitoma) | „Kūgis tas pats — iš priekio trikampis, iš viršaus apskritimas" | smulki | 7db8a6d likutis; index.json subtitle suderintas tuo pačiu commit'u |
| 2 | outcomes[0] | „Skiriu kūną nuo jo vaizdo: tas pats kūgis iš priekio atrodo kitaip nei iš viršaus." — **15 žodžių viename sakinyje** (auditas #6, rimta; įrankis outcomes netikrina — LL-52) | „Skiriu kūną nuo jo vaizdo. Kūgis iš priekio atrodo kitaip nei iš viršaus." (5 + 8 ž.) | rimta | 7db8a6d likutis |
| 3 | tasks[3].hint | „Pasuk kamuolį rankoje. Ar kuri n os pusė plokščia?" (netvarkinga konstrukcija, auditas #31) | „Pasuk kamuolį rankoje. Ar nors viena pusė plokščia?" | smulki | 7db8a6d likutis |
| 4 | tasks[3].why | „Rutulys apvalus iš visų pusių, o lėkštė plokščia." (sinonimas „kamuolys" q:83 — be paaiškinimo, auditas #32) | „Rutulys (kamuolys) apvalus iš visų pusių, o lėkštė plokščia." | smulki | 7db8a6d likutis |
| 5 | tasks[0].hint | „Pažiūrėk, kokia forma kūgis remiasi į stalą." — „remtis į" reiškia atremtas prie ko nors (kaip į sieną); simuliacijoje kūgis **stovi ant pagrindo**. Vaikas galėjo suvokti atremtą kūgį, žiūrėti šoną ir atsakyti „trikampį" | „Pažiūrėk, ką kūnis turi apačioje." (5 ž.; rodymas ties pagrindą; atsakymo neatskleidžia — T3.1) | rimta (naujas radinys, #143) | **šis paleidimas** |

## Ko sąmoningai NEkeitau (su priežastimi)

- **`concept.*`, `sim.config`, `teacher.*`, `sources`, `svietimas1`** — vaidmens riba (role failas: „Nekeisk concept, sim, teacher, sources").
- **Terminologija, kuri yra pačia sąvoka** — „kūgis/rutulys/ritinys/kubas", „stačiakampis gretasienis" (outcomes[1]), sim etiketės. Terminas paliktas oficialios programos formoje (modulio sources: NŠA 2024, programa 2022).
- **„Gretasienis" (trumpinys) vs „stačiakampis gretasienis"** — sim mygtuke (geometrija.js:62) ir 3 sim.config sakiniuose (37–39) vartojamas trumpinys, o outcomes[1] moka pilną vardą; be to, sakinyje „Gretasienis … atrodo kaip stačiakampis" žodis „stačiakampis" pasirodo dviem skirtingiems daiktams (kūno vardo dalis ir plokščias vaizdas). **Netaisyta čia**: sim.config keitimas reiškia būtiną garso pergeneravimą (Piper, 3 tariami sakiniai), o sim mygtuko etiketė — `geometrija.js` kodą (simulacijų inžinieriaus sritis). Užregistruota pasiūlymu `agents/proposals/2026-11-08-kalbu-redaktorius-gretasienis-pavadinimas.json` (normal).
- **Sim.config sakiniai „Apžiūrėjai…", „Pradedam iš naujo."** — tariami (garso manifeste), vaikui suprantami, ne supratimo defektas; keičiant būtų pergeneruoti garso įrašus. Palikta.
- **`answer` indeksai, variantų prasmės, `optional` žyma** — nepaliesti. Teisingumas patikrintas iš naujo prieš sim modelį (geometrija.js BODIES views): kūgis iš viršaus → apskritimas (T1 answer 1 ✓); konservų dėžutė → ritinys (T2 answer 2 ✓); kauliukas/kubas iš viršaus → kvadratas (T3 answer 0 ✓); kamuolys (rutulys) vs lėkštė → „apvalus iš visų pusių" (T4 answer 1 ✓); trikampis+apskritimas → kūgis (T5 answer 0 ✓). Klausimų esmė nepakeista.
- **T2 hint'as „Ar dėžutė turi kampus?"** — kaltarų formuluotė, bet pedagogiškai tiksli (svarstyklių logika: kubas turi kampus, ritinys — ne), palikta.
- **Kitų agentų paralelūs pakeitimai** (main.css, matematika.js, zaidimai.js, 10-gyvunu-grupes.json) — ne mano darbas, nekličiau, necomment-inu.

## Matavimai prieš / po

### Kalbos įrankiai
- `check_language.py --grade 1`: **0 klaidų · 4 įspėjimai · 21 pastaba** — ir prieš, ir po. 4 įspėjimai yra kituose moduliuose (08-metu-laikai, 12-bendradarbiavimo-tiltas, 13-akmenelis-popierius ×2) — ne šio vaidmens riba. **Modulio 21-erdvines-figuros įrašų: 0 → 0.** Aiškinimas: įrankis jau paleidimo pradžioje rodė 0 šiam moduliui, nes likutis commit'as `7db8a6d` buvo pritaikęs tris audito radinius; ketvirtasis (hint'as #5) buvo žmogaus radinys, kurio tipu (posakis priešingai nei modelio geometrija) įrankis negali kelti. Redukcija parodoma žmogaus audito matuokliu: **4 defektai → 0** (3 likučio + 1 šio paleidimo).
- `check_language.py --json`: `max_words: 10`; 21-erdvines… issues: 0.
- `validate_content.py --grade 1`: **0 klaidų, 0 įspėjimų** (ir `--strict` — 0/0).
- `check_audio.py`: 463 tekstai × 2 įrašai, Piper — pilnas. Hint'ai į garso manifestą nepatenka (`grep -c "kokia forma" manifest.json` → 0), todėl hint'o keitimas garso nereikalauja; sim.config neliestas.

### Ką vaikas mato (check_view.py, Brave skydų imitacija BRAVE_INIT įbuilta)

`--base http://127.0.0.1:8994/ --module 21-erdvines-figuros --viewports desktop,tablet,phone,small`

| Plotas | overflow | smallCount | tasksVisible | minTaskFont | clipped | simControls | ok |
|---|---|---|---|---|---|---|---|
| prieš — desktop 1440 | 0 | 0 | 5/5 | 21.44 | 0 | 14 | true |
| prieš — tablet 1024 | 0 | 0 | 5/5 | 21.44 | 0 | 14 | true |
| prieš — phone 390 | 0 | 0 | 5/5 | 19.14 | 0 | 14 | true |
| prieš — small 360 | 0 | 0 | 5/5 | 18.96 | 0 | 14 | true |
| po — desktop 1440 | 0 | 0 | 5/5 | 21.44 | 0 | 14 | true |
| po — tablet 1024 | 0 | 0 | 5/5 | 21.44 | 0 | 14 | true |
| po — phone 390 | 0 | 0 | 5/5 | 19.14 | 0 | 14 | true |
| po — small 360 | 0 | 0 | 5/5 | 18.96 | 0 | 14 | true |

`problems: 0`, `notes: 0`, `errors: 0` visuose plotuose, prieš ir po (keistas tik hint'o tekstas, 8 → 5 žodžiai; CSS neliesta — #4748/#4741 klasės problemos, jei ir kurios, kitų modulių, ir jau atskiruose pasiūlymuose).

## Nauja pamoka

**LL-56 — Užuominos posakis nurodo kitą kūno padėtį nei modelis** (`research/wiki/guidelines/pamokos.md`): hint'as „kūgis remiasi į stalą" vaizduoja atremtą kūną, o modelis turi kūną stovintį ant pagrindo; įrankiai to nepatikrina — tik žmogus su paleista simuliacija. Taisyklė: hint'o veiksmažodžiai ir linksniai turi atitikti modelio geometriją.

## Pasiūlymai (1, limitas 3)

- `agents/proposals/2026-11-08-kalbu-redaktorius-gretasienis-pavadinimas.json` — sim etiketė/sim.config „Gretasienis" vs modulio „stačiakampis gretasienis" (normal; reikia sim kodo + garso pergeneravimo — ne kalbu-redaktoriaus tiesioginis taisymas).

## Kliūtys / pastatymai bėgikliui

1. **Autorystės rizikа reali:** šį modulį jau „turojo" nutrūkęs kalbu-redaktoriaus paleidimas (#140), jo likutis sucommituotas sistema (`7db8a6d`). Mano git diff — tiksliai 1 eilutė (tasks[0].hint). LL-54 (worktree izoliacija) ir #5190 (commit žinutė iš pakeitimų) išlieka atviri.
2. **`outcomes` laukas įrankiui aklas** (LL-52): kol `check_language.py` jo neskaito, „įspėjimų sumažėjimas" šio tipo defektams matuojamas tik auditu. #4516/#5544 tema.
4. **Paralelūs rašytojai:** darbinėje kopijoje kitų agentų pakeitimai (tarp jau `pamokos.md` — LL-54/LL-55 pridėtos tarp man skaitymo ir rašymo; mano LL-56 numeravimas patikrintas iš naujo grep'u, kolizijos nėra).
5. **LL-56 numeracijos kolizija (nenueita):** run 140 `state.json` įrašė savo pamoką kaip „LL-56" (subtitle/outcomes įvardis be pagrindo), bet tą įrašo `pamokos.md` nepateko — darbinės kopijos lenktynės (LL-54 šeima). Šiame faile LL-56 = postūrio pamoka (mano). Run 140 įvardžio pamokos neužrašiau — ne mano turinys, autorybė neaiški; palikta kitam paleidimui.
6. Garso pergeneravimas nereikalinga (hint'ai netariami); jei bėgiklis priims gretasienio pasiūlymą — ten reikės `generate_audio.py` bėgimo (3 sim.config sakiniai).

## Patikra (komandos)

```
python3 scripts/check_language.py --grade 1        → 0 klaida, 4 įspėjimai (kiti moduliai), 21 pastaba; EXIT 0
python3 scripts/check_language.py --json           → 21-erdvines-figuros issues: 0
python3 scripts/validate_content.py --grade 1      → 0 klaidų, 0 įspėjimų; EXIT 0
python3 scripts/validate_content.py --grade 1 --strict → 0/0; EXIT 0
python3 scripts/check_audio.py                     → 463 tekstai × 2 įrašai; EXIT 0
.venv/bin/python scripts/check_view.py --base http://127.0.0.1:8994/ --module 21-erdvines-figuros --viewports desktop,tablet,phone,small --json → checked 4, problems 0, notes 0; EXIT 0 (prieš ir po)
```

## Touched

- `content/lt/grade-01/matematika/21-erdvines-figuros.json` (1 eilutė: tasks[0].hint)
- `research/wiki/guidelines/pamokos.md` (LL-56)
- `research/wiki/guidelines/kalbos-auditas.md` (taisymo būsenos žymė)
- `agents/proposals/2026-11-08-kalbu-redaktorius-gretasienis-pavadinimas.json` (naujas)
- `agents/state.json` (last_language_work)
- `agents/log/kalbu-redaktorius-2026-11-08T0943-21-erdvines-figuros.md` (ši ataskaita)

Commit'inu ir publikuoju — ne, tai bėgiklio darbas (role ribos).
