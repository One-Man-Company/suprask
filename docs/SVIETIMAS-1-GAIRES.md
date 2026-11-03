# Švietimas #1 — privalomos turinio ir platformos gairės

**Būsena:** galiojanti nuo 2026-11-03. Privaloma visiems SUPRASK moduliams, simuliacijoms ir funkcijoms, 1–12 klasėse.
**Kam skirta:** turinio autoriams, simuliacijų kūrėjams, agentams (tyrėjui, kūrėjui, tikrintojui, kuratoriui) ir žmonėms, kurie priima turinio sprendimus.
**Šaltinis:** „Švietimo kelrodis 2035“ (Švietimas #1, 2026) — 10 žingsnių programa, ir oficialios Lietuvos bendrosios ugdymo programos (2022, su 2024 m. įgyvendinimo rekomendacijomis).

> Šios gairės yra **suderintos su** Švietimas #1 kryptimi. Tai ne oficialus šios iniciatyvos produktas ir ne ministerijos patvirtinta medžiaga. Platforma remiasi principais, o ne kopijuoja dokumentą.

---

## 1. Kodėl šios gairės egzistuoja

„Švietimo kelrodis“ kelia vieną tikslą — kiekvienam Lietuvos vaikui vienodai kokybišką išsilavinimą — ir skaido jį į tris sritis: kokybiškos ugdymo programos, profesionali vadyba, motyvuoti mokytojai. Trys iš dešimties žingsnių yra tiesiogiai apie tai, ką gali daryti skaitmeninė mokymosi priemonė: **1 žingsnis** (mažiau temų, daugiau gylio), **2 žingsnis** (vienodas pasiekimų vertinimas) ir **3 žingsnis** (kiekvieno mokinio pažanga ir pagalba laiku). Kiti žingsniai platformai taikomi netiesiogiai — per reikalavimą nekenkti mokytojo darbui ir neimituoti to, ko negalime padaryti gerai.

Kelrodis taip pat nurodo, kodėl tai svarbu dabar: PISA 2025 duomenimis, tik 52 % Lietuvos penkiolikmečių tiki, kad gebėjimus galima ugdyti (EBPO vidurkis 69 %, Estijoje 83 %), o aukščiausius pasiekimų lygius pasiekia tik 6 % mokinių matematikoje. Platforma, kuri ugdo „suprantu, nes pats atradau“ patirtį, yra viena iš priemonių šiam tikslui.

## 2. Trys nekeičiami principai

**P1. Viena didelė idėja modulyje.** Modulis aiškina vieną sąvoką ir jos pasekmes. Jei norisi dėstyti dvi sąvokas — tai du moduliai.
**P2. Veiksmas prieš paaiškinimą.** Vaikas pirmiausia bando, keičia, stebi, o paaiškinimas ateina po to, kai jau turi patirties. Simuliacija nėra iliustracija prie teksto — ji yra pagrindinė mokymosi vieta.
**P3. Klaida yra duomenys, ne nuosprendis.** Jokia platformos dalis nebaudžia, neskaičiuoja „netinkamų“ bandymų, nerodo raudonų kryžiukų sąrašo, nelygina vaikų tarpusavyje.

## 3. Privalomos taisyklės pagal žingsnius

### 3.1. Žingsnis 1 — mažesnė apimtis, didesnis gylis

- **T1.1.** Kiekvienas modulis turi 1–3 mokymosi rezultatus, suformuluotus kaip „mokinys geba…“, o ne „mokinys žino apie…“.
- **T1.2.** Modulyje draudžiama dėstyti daugiau nei vieną naują sąvoką. Papildomos idėjos perkeliamos į atskirą modulį arba į „Mokytojui“ skiltį.
- **T1.3.** Kiekvienas modulis turi aiškiai atskirtą **būtinąjį branduolį** (tai, ką privalo suprasti visi) ir **praplėtimą** (užduotis, kurią gali rinktis greitesnis vaikas). Platformoje tai atskiriama žyma `optional: true` užduotyse.
- **T1.4.** Modulio trukmė — 8–12 minučių. Ilgesnį turinį skaidyk, ne trumpink kokybės sąskaita.
- **T1.5.** Tekstas ekrane — ne daugiau kaip 120 žodžių viename žingsnyje; 1 klasei — iki 60 žodžių.
- **T1.6.** Draudžiama „temų sąrašo“ logika: modulis ne apžvelgia temą, o išsprendžia vieną supratimo problemą.

### 3.2. Žingsnis 2 — vienodas vertinimas

- **T2.1.** Kiekvienas rezultatas susiejamas su konkrečiu oficialios programos pasiekimu (dalykas, sritis, numeris). Be šios sąsajos modulis neskelbiamas.
- **T2.2.** Savikontrolės užduotys vertina **supratimą naujoje situacijoje**, ne įsimintą formuluotę. Klausimas „ką atsimeni“ neleidžiamas.
- **T2.3.** Visiems moduliams taikoma ta pati trijų žingsnių grįžtamojo ryšio schema: (1) kas teisinga, (2) kodėl, (3) ką daryti toliau. Niekada vien „Neteisingai“.
- **T2.4.** Vertinimo kalba vienoda visose klasėse: tas pats pasiekimų lygis reiškia tą patį. Lygiai: *pradedantysis*, *pagrindinis*, *aukštesnysis* — žr. `docs/KURINIO-STANDARTAS.md`.
- **T2.5.** Platforma nerašo pažymių ir nesiunčia rezultatų mokyklai. Vertinimas yra mokymosi įrankis, ne atskaitomybė.

### 3.3. Žingsnis 3 — pažanga ir pagalba laiku

- **T3.1.** Kiekviena neteisinga atsakymo galimybė turi savo paaiškinimą (`hint`), nukreipiantį į klaidą, o ne į teisingą atsakymą.
- **T3.2.** Pagalbos kopėčios: pirma užuomina, po antro bandymo — konkretus modelio žingsnis (pvz., „pažiūrėk į simuliaciją ir pakeisk vieną parametrą“). Teisingas atsakymas niekada neparodomas automatiškai.
- **T3.3.** Nėra laiko limitų, laikmačių, gyvybių skaičiaus, „streak“ spaudimo.
- **T3.4.** Greitesniems mokiniams kiekviename modulyje numatyta bent viena gilesnė užduotis (`optional`), kad neliktų „baigiau per 2 minutes“.
- **T3.5.** Pažanga matoma vaikui paprastai (atlikta / ne) ir suaugusiajam — be asmeninių duomenų. Duomenys saugomi tik naršyklėje; jokia telemetrija nesiunčiama.
- **T3.6.** Perėjimas tarp klasių ir temų niekada nepraranda konteksto: kiekvienas modulis turi „iš kur atėjome“ ir „kur toliau“ sąsajas.

### 3.4. Žingsnis 5 — pozityvi mokymosi aplinka

- **T5.1.** Grįžtamasis ryšys — apie veiksmą, ne apie vaiką. „Šis bandymas parodė…“, o ne „tu gabus / silpnas“.
- **T5.2.** Nėra reitingų, lyderių lentelių, palyginimų su kitais vaikais, socialinių funkcijų.
- **T5.3.** Kiekvienas modulis baigiamas refleksija, kurią vaikas pasako savais žodžiais.
- **T5.4.** Kalba: trumpi sakiniai, vienaskaitos antrasis asmuo, jokių sarkazmo ar bauginimo formuluočių, jokių „lengva/ sunku“ etikečių.
- **T5.5.** Prieinamumas: lietimo taikiniai ≥ 48 px, kontrastas ≥ 4,5:1 tekstui, klaviatūros navigacija, garso išjungimo galimybė, `prefers-reduced-motion` palaikymas.

### 3.5. Žingsnis 6 — tobulinimas per pilotus

- **T6.1.** Kiekvienas naujas dizaino sprendimas (nauja simuliacijos rūšis, užduoties tipas, navigacijos pokytis) laikomas pilotu ir įrašomas `research/wiki/guidelines/pilotai.md` su hipoteze ir vertinimo kriterijumi.
- **T6.2.** Sprendimai plečiami tik tada, kai yra duomenų arba aiškaus tyrimo pagrindo. „Atrodo gražiau“ nėra argumentas.
- **T6.3.** Nepavykę sprendimai fiksuojami taip pat, kaip pavykę. Neigiami rezultatai nėra slepiami.

### 3.6. Žingsniai 8–10 — mokytojas lieka mokytoju

- **T8.1.** Kiekvienas modulis turi bloką „Mokytojui ir tėvams“: tikslas, klausimas vaikui, veikla be ekrano, dažnos klaidos.
- **T8.2.** Platforma nepretenduoja vertinti mokytojo darbo ir neteikia „pamokos scenarijų“, kurie pakeistų mokytojo sprendimus.
- **T8.3.** Modulis turi būti naudingas ir be interneto: veikla be ekrano aprašyta taip, kad ją būtų galima atlikti su popieriumi ar daiktais.

## 4. Kaip renkamos temos (agento sprendimo taisyklė)

Tema patenka į platformą, tik jei atsako „taip“ į visus penkis klausimus:

1. **Programos sąsaja.** Ar tema tiesiogiai atitinka oficialios programos pasiekimą toje klasėje?
2. **Interaktyvumo nauda.** Ar modelis / simuliacija prideda supratimo, kurio neprideda geras tekstas ar paveikslėlis? Jei ne — tema neplatforminė.
3. **Klaidinga nuostata.** Ar yra žinoma, dažna šios temos klaidinga nuostata, kurią modelis gali parodyti? Jei ne — formuluotė dar nebrandi.
4. **Amžiaus tinkamumas.** Ar kognityviniai reikalavimai (darbinė atmintis, abstrakcijos lygis, skaitymo įgūdžiai) atitinka klasės amžių? Žr. `research/wiki/curriculum/`.
5. **Nedubliavimas.** Ar platformoje nėra kito modulio, sprendžiančio tą pačią supratimo problemą?

Jei bent vienas atsakymas „ne“ — tema grąžinama į tyrimų sąrašą su paaiškinimu, o ne kuriama.

## 5. Klasės ir amžiaus ribos

Kiekviena klasė turi savo turinio ir metodų struktūrą (`research/wiki/grades/`). Privalomi amžiaus apribojimai:

| Klasė | Skaitymo našta ekrane | Abstrakcijos lygis | Simuliacijos tipas |
|---|---|---|---|
| 1–2 | labai maža, garsas + vaizdas | konkreti, viena sąvoka | tiesioginis manipuliavimas, be klaidų baudimo |
| 3–4 | maža, trumpi sakiniai | konkreti → pusiau abstrakti | taisyklės atradimas, matavimas |
| 5–6 | vidutinė | sąvoka + modelis | parametrų keitimas, kelių kintamųjų sąveika |
| 7–8 | vidutinė | abstrakti sąvoka | hipotezė → bandymas → išvada |
| 9–10 | didesnė | sisteminis mąstymas | duomenų analizė, scenarijai |
| 11–12 | pilna | kritinis vertinimas | modelių ribų tyrimas, argumentacija |

**6+3+3 pastaba.** „Švietimo kelrodis“ siūlo pereiti prie 6+3+3 struktūros (7 žingsnis). Platforma šiandien naudoja 1–12 klasių numeraciją; kai struktūra pasikeis, klasės bus peržymimos per `content/lt/grades.json` lauką `mapping`, neperrašant turinio.

## 6. Kokybiniai vartai (be jų neskelbiama)

Modulis laikomas paruoštu, kai praeina visus vartus:

1. `python3 scripts/validate_content.py` — schema, privalomi laukai, simuliacijos egzistavimas, unikalūs ID.
2. **Pedagoginė patikra** — 1–3 rezultatai, 1 didelė idėja, būtinas branduolys + praplėtimas, 3–4 užduotys su `hint` ir `why`.
3. **Amžiaus patikra** — teksto kiekis, sakinio ilgis, sąvokų skaičius pagal 5 skyriaus lentelę.
4. **Prieinamumo patikra** — visi interaktyvūs elementai pasiekiami klaviatūra, yra `aria-label`, veikia be garso.
5. **Kalbos patikra** — lietuvių kalba, jokių anglicizmų vartotojo sąsajoje, taisyklinga terminija (pvz., *skaičių tiesė*, ne *linija*).
6. **Techninė patikra** — simuliacija įkeliama be klaidų, veikia 360 px pločio ekrane.

## 7. Ko platforma nedaro

- Nevertina mokytojų ir nerenka duomenų apie mokyklas.
- Nepakeičia vadovėlio ar pamokos; ji skirta pirmam susidūrimui su sąvoka.
- Neparduoda, nereklamuoja, nenaudoja tamsiųjų šablonų (dark patterns).
- Nenaudoja „dirbtinio intelekto mokytojo“, kuris kalbėtų vietoj vaiko. Agentai kuria ir tikrina turinį, bet mokymosi dialogas vyksta su mokytoju, tėvais ar klasės draugu.

## 8. Kaip šios gairės keičiamos

- Gairės keičiamos tik per `docs/` pakeitimą su `CHANGELOG` įrašu ir nuoroda į šaltinį (tyrimą, teisės aktą, duomenis).
- Kiekvienas pakeitimas turi nurodyti, kuriuos modulius jis paveikia, ir ar reikia juos peržiūrėti.
- Agentas, prieštaraujantis šioms gairėms, laikomas sugedusiu: turinys atmetamas, o ne taisyklė apeinama.

---

**Susieti dokumentai:** `docs/KURINIO-STANDARTAS.md` (techninė specifikacija), `docs/ARCHITEKTURA.md` (platformos sandara), `research/wiki/guidelines/` (gyva gairių versija su tyrimų nuorodomis), `research/wiki/foundations/` (mokymosi mokslo pagrindas).
