# kalbu-redaktorius — 2026-11-07T11:19

- paleidimas: #38
- trukmė: ~7 min
- tikslas: `content/lt/grade-01/matematika/15-laikas.json`

## Kodėl šis modulis

`python3 scripts/check_language.py --json` (17 modulių, 9 įspėjimai, 11 info):

| modulis | įspėjimai | info |
|---|---|---|
| 15-laikas | 2 | 2 |
| 09-augalo-gyvenimas | 2 | 1 |
| 07-desningumai / 14-pinigai / 16-lygybe / 12-bendradarbiavimo-tiltas | 1 | 0 |
| 17-kryptys-ir-vieta | 1 | 7 |

Daugiausia įspėjimų turi du moduliai. Pasirinktas `15-laikas`, o ne `09-augalo-gyvenimas`, nes pastarasis turi atvirą „high“ turinio pasiūlymą
(`2026-11-06-simuliacininkas…` → `2026-11-06-simuliaciju-inzinierius-uzduotis-1.json`, #453): modelis rodo tris augimo sąlygas, o 1 užduotis tebėra
„vandens ir šviesos“. Ten problema ne formuluotėje, o modelyje ir užduotyje; formuluotės taisymas ją užmaskuotų, o bėgiklio `close_proposals()`
uždarė pasiūlymą kaip įgyvendintą.

## Prieš / po

| # | laukas | prieš | po | kodėl |
|---|---|---|---|---|
| 1 | `outcomes[1]` | Paaiškinu, kodėl **po vieno ilgosios rato** trumpoji pasislenka vienu skaičiumi. (10 ž.) | Paaiškinu, kodėl trumpoji **per vieną ratą** pasislenka vienu skaičiumi. (9 ž.) | „po vieno ilgosios rato“ skamba kaip trukmė („po valandos“), ne kaip ratas; žodžių tvarka dabar atkartoja priežastį → pasekmę |
| 2 | `concept.steps[1]` | Per tą ratą trumpoji pasislenka **per vieną skaičių**. | Per tą ratą trumpoji pasislenka **vienu skaičiumi**. | du „per“ viename sakinyje; toliau modulyje (big_idea, 2 užduoties `why`) vartojama „vienu skaičiumi“ — dabar ta pati forma visur |
| 3 | `concept.example` | Trumpoji pasislenka **nuo 3 prie 4** | Trumpoji pasislenka **nuo 3 iki 4** | atstumas/intervalu lietuviškai „nuo… iki…“; „nuo… prie…“ netaisyklinga |
| 4 | `tasks[3].q` | Rodyklės **be žymenų**. **Per vieną ratą viena rodyklė apėjo visą ratą, kita pasislinko tik per vieną skaičių** (14 ž.). Kuri rodo valandas? | Rodyklės **neturi žymenų**. **Viena rodyklė apsisuko visą ratą. Kita pasislinko vienu skaičiumi.** Kuri rodo valandas? | 14 ž. > 12 ribos ir > 10 standarto; viena instrukcija — vienas sakinys; „be žymenų“ → „neturi žymenų“ (pilnas sakinys) |
| 5 | `tasks[3].options[0..1]` | **Ta, kuri** apėjo visą ratą / **Ta, kuri** pasislinko per vieną skaičių | **Rodyklė, kuri** apsisuko visą ratą / **Rodyklė, kuri** pasislinko vienu skaičiumi | variantas turi būti suprantamas atskirai, be įvardžio; abu variantai dabar prasideda tuo pačiu daiktavardžiu, tad skiriasi tik veiksmu, ne žodžių tvarka |
| 6 | `tasks[3].hint` | Daugiau judanti rodyklė ne visada **skaičiuoja** didesnį vienetą. Palygink, kiek pasislinko **kiekviena**. | Daugiau judanti rodyklė ne visada **rodo** didesnį vienetą. Palygink, kiek pasislinko **kiekviena rodyklė**. | „rodyklė skaičiuoja“ — netikslu; „kiekviena“ be daiktavardžio 6-mečiui neaišku. Užuomina vis dar nenurodo atsakymo |
| 7 | `tasks[4].why` | Valanda pasikeičia **tik tada, kai ilgoji užbaigia visą ratą — trumpoji tada** stovi lygiai ties skaičiumi. (15 ž.) | Valanda pasikeičia, kai ilgoji užbaigia visą ratą. **Trumoji tada** stovi lygiai ties skaičiumi. | 15 ž. > 12; brūkšnys jungė dvi mintis; „tik tada“ + „tada“ kartojosi |

Atsakymų indeksai (`answer`) nekeisti: 1, 0, 1, 1. Nė vienas variantas neperrašytas taip, kad pasikeistų, kuris yra teisingas.

## Ko sąmoningai nekeičiau

- `title`, `subtitle` — tvarkingi (6 ir 6 ž.), o pavadinimas dublikuojamas `content/lt/grade-01/index.json`; keitimas be indekso sukeltų neatitikimą.
- `concept.title`, `concept.big_idea` — vaidmuo draudžia liesti `concept`; `big_idea` jau buvo 5/7/5 ž.
- `tasks[1]`, `tasks[2]`, `tasks[3].hint` pirmas sakinys — jokių taisyklių nepažeidžia; „neperrašyti viso modulio gražesniu stiliumi“.
- `tasks[2].why` — atviras turinio pasiūlymas (24 val. sistema) neliečiamas, tai ne formuluotė.
- `teacher.*`, `sim.*`, `sources` — vaidmuo draudžia.
- `09-augalo-gyvenimas` (2 įspėjimai) — žr. „Kodėl šis modulis“.
- `17-kryptys-ir-vieta` (8 pastabos: 1 įspėjimas + 7 info „sakinys prasideda įvardžiu“) — viliojantis taikinys, bet failas turi du atvirus „high“ pasiūlymus (`2026-11-04-ideator-kryptys`, `2026-11-07-metodininkas-kryptys`, #606), kurie ginčija būtent pavadinimo ir `concept` formuluotę („kairė priklauso nuo žiūrovo“ prieštarauja `big_idea` „priklauso kūnui“). Mano commit'as bėgiklio `close_proposals()` būtų pažymėtas kaip tų pasiūlymų įgyvendinimas, nors koncepto neginu. Palikta metodininkui.

## Patikra

- `python3 scripts/check_language.py --grade 1` → **9 įspėjimai → 7**; `15-laikas`: **2 įspėjimai + 2 info → 0 + 0** (modulis sąraše nebepasirodo).
- `python3 scripts/validate_content.py --grade 1` → 0 klaidų, 0 įspėjimų (ir su `--strict`).
- `python3 scripts/check_audio.py` → 336 tekstai × 2 įrašai, OK (neliečiau `sim.config.sentences`).
- `python3 scripts/check_ui.py` → 0/0.
- Savas matuoklis pagal `KURINIO-STANDARTAS.md:110` (≤10 ž. 1 klasei): liko vienas 12 ž. sakinys — `tasks[3].why` („Valandas rodo trumpoji: per vieną ilgosios ratą ji pasislenka tik vienu skaičiumi.“). Jis telpa į 12 ž. tikrintuvo ribą, o skaidymas su jau pataisytu `why` darytų per daug triukšmo; kandidatas kitam paleidimui.

## Kliūtys, kurias reikia žinoti

1. **Bėgiklio commit'as paims ir kito proceso failus.** Šio paleidimo metu (11:22) kažkas kitas rašė `assets/css/main.css` (+`.task-q` dydis) ir pridėjo `scripts/check_view.py`. `changed_files()` ima viską, kas pasikeitė per paleidimą, tad mano commit'as gali juos įtraukti. Taisyti nedrįsau — tai ne mano vaidmens failai. Susiję atviri pasiūlymai: #485, #484.
2. **`close_proposals()` uždaro visus „new“ pasiūlymus, kurių `target` patenka į commit'ą**, ne tik įgyvendintus (#486). Šįkart tai nekliudė: `15-laikas` turi du „high“ pasiūlymus, bet jie abu jau įgyvendinti (modulio pavadinimas ir `laikrodis-sujungtos-rodykles` modelis yra būtent iš jų), tad jų uždarymas yra teisingas.
3. **Ataskaitos nepatenka į repo**: `agents/log/*` ir `agents/state.json` yra `.gitignore` (#484), tad šis failas lieka tik vietoje.
