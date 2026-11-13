# Suprask!

**Interaktyvi, nemokama vizualinio mokymosi platforma Lietuvos 1–12 klasei.**
Ne įsiminti — suprasti. Simuliacijos, modeliai ir žaidimai, kurie paaiškina sąvoką taip, kad vaikas prieina prie atsakymo pats.

🔗 **Gyva svetainė:** https://one-man-company.github.io/suprask/

---

## Kas yra viduje (šiandien)

**1 klasė — 9 kryptys, 38 modulių, 38 interaktyvių simuliacijų:**

| Kryptis | Moduliai |
|---|---|
| 🔤 Lietuvių kalba | Garsas ir raidė · Skiemenų jungimas · Sakinio tvarka · Kaip žmonės sveikinasi · Plakatas: kur ieškoti atsakymo |
| 🔢 Matematika | Skaičių tiesė · Dešimtukas · Sudėtis per dešimtį · Šimto lentelė · Figūros · Dėsningumai · Pinigai · Laikas: vienas ratas · Laikas: 2 val. ir 14:00 · Lygybė · Kryptys · Taškas, tiesė, spindulys, atkarpa · Ilgis · Erdvinės figūros · Piktograma ir stulpelis · Komandų seka |
| 🌍 Pasaulio pažinimas | Metų laikai · Augalo gyvenimas · Gyvūnų grupės · Kur dingsta vanduo · Nuožulnioji plokštuma · Kuprinė: tas pats svoris · Dūmai: žemai ir lauk |
| 🎵 Muzika | Aukštas garsas ne visada garsus · Ritmas: plojimai ant pulso |
| 🤝 Sąžiningumas ir žaidimai | Sąžiningas dalijimasis · Bendradarbiavimo tiltas · Akmenėlis, žirklės, popierius |
| 🔌 Technologijos | Elektra: kelias turi būti vientisas · Medžiagos: tinkamumą parodo bandymas |
| 💛 Gyvenimo įgūdžiai | Dovana: kodėl vienas džiaugiasi, kitas ne |
| 🕊️ Dorinis ugdymas | Kai vienas nustoja, nukenčia visi |
| 🎨 Dailė | Dailė: ta pati forma, kita spalva |

Kiekvienas modulis: viena didelė idėja → simuliacija → paaiškinimas → 4–5 užduotys → refleksija → blokas mokytojui ir tėvams (su veikla be ekrano ir dažnomis klaidomis).

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
python3 scripts/check_docs_facts.py
```

`check_docs_facts.py` lygina šio README ir `docs/ARCHITEKTURA.md` skaičius (kryptys, moduliai, simuliacijos, užduotys, garso įrašai, agentai) su failais — kad viešas pajėgumo teiginys neatsiliktų nuo turinio.

## Kaip prisidėti

1. **Turinys.** Naujas modulis — JSON failas pagal standartą; prieš siūlant PR paleisk validatoriu.
2. **Simuliacija.** Vienas komponentas `assets/js/sims/` faile, registruojamas `SIMS` eksporte.
3. **Tyrimai.** Šaltinis su nuoroda → įrašas `research/wiki/` su citata ir pritaikymu platformai.
4. **Klaida.** Atidaryk issue su modulio ID ir tuo, ką vaikas padarė / ko nesuprato.

## Agentų sistema

Platformą nuolat vysto penkiolika agentų (`agents/`), veikiančių ciklu **ieška → metodas → turinys → simuliacija → kritika → leidimas**:

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
| `kalbu-redaktorius` | tikrina užduočių formuluotes (vienareikšmiškumas, sakinio ilgis) |
| `sistemos-architektas` | matuoja agentų darbą, taiso sistemines problemas ir grafikus |
| `publikavimo-agentas` | užtikrina, kad sukurtas turinys būtų paskelbtas |

Grafikas — `systemd --user` timeriai (`ROLES` sąraše `agents/run.py`), kiekvienas paleidimas registruojamas `agents/runs.db`. Žr. [`agents/README.md`](agents/README.md).

## Vidinis dashboard (Tailscale)

Agentų paleidimų istorija, grafikas, pasiūlymai ir turinio statistika — **ne viešai**:

```
http://zoltanas.tail4bbf34.ts.net:9410/
```

HTTP prieiga ribojama Tailscale tinklu — jokio prisijungimo ekrano. Žr. [`dashboard/README.md`](dashboard/README.md).

## Garsas

Lietuviškas garsas — iš anksto sugeneruoti įrašai, ne naršyklės sintezė: 552 tekstų po du variantus (sakinys ir skiemuo) — 1104 įrašų, ~32 MB. Numatytasis variklis yra Piper (`lt_LT-reginute1`), nes jis kirtį ima iš 189 262 formų kirčio žodyno, o ne spėlioja; lietuvių kalboje kirtis keičia reikšmę. Azure/Edge balsas (`--engine edge`) paliktas atsarginiam perklausos variantui, o naršyklės balsas naudojamas tik tada, kai teksto nėra manifests ir yra lietuviškas balsas. Generavimas — `scripts/generate_audio.py`, pilnumas tikrinamas `scripts/check_audio.py`.

## Licencijos

- **Kodas:** MIT (žr. [`LICENSE`](LICENSE))
- **Turinys ir tekstai:** CC BY-SA 4.0
- **Balsas ir garso įrašai:** `lt_LT-reginute1` — Robertas Tarasevičius, sugeneruotas iš LIEPA studijinio korpuso (2013–2015, Vilniaus universitetas su Lietuvių kalbos institutu, LEU ir Šiaulių universitetu), **CC BY 4.0**; kirčio žodynas — iš LIEPA anotacijų ir Arūno Smaliuko `g2p-lt-lexicon` (CC BY 4.0). Visi įrašai sugeneruoti mašininiu būdu — tai nurodyta ir „Apie“ puslapyje (ES AI aktas, 50 str.).

## Būsena

| | |
|---|---|
| Versija | 0.1 (2026-11) |
| Parengta | 1 klasė — 9 kryptys, 38 modulių, 38 simuliacijų, 165 užduotys |
| Toliau | 2 klasė, tada 3–4 |
| Kalbos | lietuvių (struktūra paruošta kitoms) |
