# Suprask!

**Interaktyvi, nemokama vizualinio mokymosi platforma Lietuvos 1–12 klasei.**
Ne įsiminti — suprasti. Simuliacijos, modeliai ir žaidimai, kurie paaiškina sąvoką taip, kad vaikas prieina prie atsakymo pats.

🔗 **Gyva svetainė:** https://one-man-company.github.io/suprask/

---

## Kas yra viduje (šiandien)

**1 klasė — 4 kryptys, 13 modulių, 13 interaktyvių simuliacijų:**

| Kryptis | Moduliai |
|---|---|
| 🔤 Lietuvių kalba | Garsas ir raidė · Skiemenų jungimas · Sakinio tvarka |
| 🔢 Matematika | Skaičių tiesė · Dešimtukas · Figūros · Dėsningumai |
| 🌍 Pasaulio pažinimas | Metų laikai · Augalo gyvenimas · Gyvūnų grupės |
| 🤝 Sąžiningumas ir žaidimai | Sąžiningas dalijimasis · Bendradarbiavimo tiltas · Akmenėlis, žirklės, popierius |

Kiekvienas modulis: viena didelė idėja → simuliacija → paaiškinimas → 3 užduotys → refleksija → blokas mokytojui ir tėvams (su veikla be ekrano ir dažnomis klaidomis).

**2–12 klasės** — struktūra ir tyrimų bazė ruošiama; turinys kuriamas nuosekliai.

## Principai

- **Be registracijos.** Jokių paskyrų, el. pašto, slapukų ar analitikos. Pažanga — tik tavo naršyklėje (`localStorage`).
- **Be išorinių priklausomybių.** Nėra CDN, šriftų, sekimo skriptų. Veikia ir lėtame mokyklos internete.
- **Mobiliu pirmiausia.** Telefonas, planšetė, interaktyvi lenta. Lietimo taikiniai ≥ 48 px, klaviatūros navigacija, garso išjungimas.
- **Viena sąvoka modulyje.** „Mažiau temų, daugiau gylio“.
- **Klaida — mokymosi dalis.** Nėra laikmačių, gyvybių, reitingų ar palyginimų tarp vaikų.

## Metodinis pagrindas

Platforma remiasi oficialiomis Lietuvos bendrosiomis ugdymo programomis (2022, su 2024 m. įgyvendinimo rekomendacijomis) ir „Švietimo kelrodžio 2035“ (Švietimas #1) dešimties žingsnių kryptimi.

Privalomos taisyklės, kurių laikosi ir žmonės, ir agentai:

- [`docs/SVIETIMAS-1-GAIRES.md`](docs/SVIETIMAS-1-GAIRES.md) — turinio ir platformos gairės
- [`docs/KURINIO-STANDARTAS.md`](docs/KURINIO-STANDARTAS.md) — techninė modulio specifikacija
- [`docs/ARCHITEKTURA.md`](docs/ARCHITEKTURA.md) — kaip veikia sistema
- [`research/wiki/`](research/wiki/) — gyva žinių bazė: mokymosi mokslas, žaidimų teorija, klasės, tyrimai

## Paleidimas lokaliai

```bash
git clone https://github.com/One-Man-Company/suprask.git
cd suprask
python3 -m http.server 8987
# atidaryk http://127.0.0.1:8987
```

Nereikia `npm install`, nereikia vykdymo žingsnio. Turinys įkeliamas per `fetch`, todėl reikia serverio (ne `file://`).

Patikra:

```bash
python3 scripts/validate_content.py
```

## Kaip prisidėti

1. **Turinys.** Naujas modulis — JSON failas pagal standartą; prieš siūlant PR paleisk validatoriu.
2. **Simuliacija.** Vienas komponentas `assets/js/sims/` faile, registruojamas `SIMS` eksporte.
3. **Tyrimai.** Šaltinis su nuoroda → įrašas `research/wiki/` su citata ir pritaikymu platformai.
4. **Klaida.** Atidaryk issue su modulio ID ir tuo, ką vaikas padarė / ko nesuprato.

## Agentų sistema

Platformą nuolat vysto dvylika agentų (`agents/`), veikiančių ciklu **ieška → metodas → turinys → simuliacija → kritika → leidimas**:

| Vaidmuo | Ką daro |
|---|---|
| `ideator` | ieško naujų pamokų idėjų pagal programos spragas |
| `metodininkas` | projektuoja mokymo metodą ir simuliacijos scenarijų |
| `kurejas` | kuria modulį pagal metodą (PR) |
| `simuliaciju-inzinierius` | kuria ir tobulina simuliacijas (PR) |
| `dizaineris` | tobulina klasių struktūrą (`path.json`) ir sąsają |
| `kritikas` | nepriklausoma kritika: pedagogika, UX, teiginiai, gairės |
| `programos-derintojas` | derina turinį su oficialia programa |
| `leidejas` | sujungia patikrintus PR, atnaujina changelog |
| `tyrejas` | papildo tyrimų bazę |
| `tikrintojas` | validuoja turinį ir sąsają |
| `sveikatos-inspektorius` | tikrina gyvą svetainę |
| `kuratorius` | savaitės suvestinė ir prioritetai |

Grafikas — `systemd --user` timeriai (10 paleidimų per dieną), kiekvienas paleidimas registruojamas `agents/runs.db`. Žr. [`agents/README.md`](agents/README.md).

## Vidinis dashboard (Tailscale)

Agentų paleidimų istorija, grafikas, pasiūlymai ir turinio statistika — **ne viešai**:

```
http://zoltanas.tail4bbf34.ts.net:9410/
```

HTTP Basic auth; slaptažodis — `~/.config/suprask/dashboard.env`. Žr. [`dashboard/README.md`](dashboard/README.md).

## Garsas

Lietuviškas garsas — iš anksto sugeneruoti neuroninio balso (`lt-LT-OnaNeural`) įrašai, ne naršyklės balsas. 344 įrašai, ~5 MB, generuojami `scripts/generate_audio.py`. Naršyklės balsas naudojamas tik kaip atsarginis variantas dinaminiams sakiniams.

## Licencijos

- **Kodas:** MIT (žr. [`LICENSE`](LICENSE))
- **Turinys ir tekstai:** CC BY-SA 4.0

## Būsena

| | |
|---|---|
| Versija | 0.1 (2026-11) |
| Parengta | 1 klasė (13 modulių) |
| Toliau | 2 klasė, tada 3–4 |
| Kalbos | lietuvių (struktūra paruošta kitoms) |
