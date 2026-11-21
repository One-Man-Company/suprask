# Tikrintojas — 2026-11-21 (paleidimas #416)

Rėmelis įrašytas prieš giluminius tyrimus. Rezultatai papildomi žemiau.

## Būsena darbo pradžioje

- HEAD: `0f9c6f2`, šaka `agent/publikavimo-agentas-2026-11-20`, darbinė kopija švari.
- Platformos būklė (iš dashboard): 51 modulis, 223 užduotys, 51 simuliacija, 1 klasė gyva.
- Paskutinė tikrintojo ataskaita: `agents/log/tikrintojas-2026-11-20.md` — 0 klaidų visuose vartuose;
  liko neįrašytas `agents/state.json` `last_validation` (šis paleidimas jį įrašo šiandienos skaičiais).

## Ką darysiu

1. `validate_content.py`, `check_audio.py`, `check_ui.py`, `check_registry.py`, `check_view.py`,
   `check_svg_fit.py`, `check_docs_facts.py`, `check_language.py`, `check_lessons.py`, `check_art.py`.
2. `content/lt/grade-01/index.json` nuorodų ir sim.component registro patikra.
3. Trijų gyvų adresų HTTP kodai.
4. `agents/state.json` → `last_validation`.

## Rezultatai

```
$ python3 scripts/validate_content.py
Rezultatas: 0 klaidų, 0 įspėjimų
✔ Turinys atitinka standartą.                                    rc=0

$ python3 scripts/check_registry.py
SIMS raktai kode: 73
grade-01: kryptys 9 · index 51 · failai 51 · užduotys 223 (optional 51) · sim 51 · path 51 · našlaičiai 0
PROBLEMŲ: 0                                                       rc=0

$ python3 scripts/check_ui.py
Perskaityta: 12 simuliacijų failų
Rezultatas: 0 klaidų, 0 įspėjimų
✔ Sąsaja atitinka pagrindines taisykles.                          rc=0

$ python3 scripts/check_audio.py
✔ Garsas pilnas: 743 tekstų (iš jų 5 — tiesioginės api.speak eilutės simuliacijų kode),
  1486 įrašų, visi iš Piper balso, naudojama 1486 iš 1486 mp3.    rc=0

$ .venv/bin/python scripts/check_view.py
Plotai: desktop 1440px, phone 390px, small 360px
Patikrinta: 153 (maršrutų: 51 · plotų: 3) · problemos: 0
✔ Visi moduliai matomi ir telpa visuose plotuose (su Brave skydų blokais).   rc=0

$ .venv/bin/python scripts/check_svg_fit.py
Matuota: 102 (modulių 51 × plotų 2) · tolerancija 4px
SVG kerpa daugiau už toleranciją: 0 · deklaruotas sąmoningas perteklius: 2
  pastaba: 18-taskas-tiese-spindulys-atkarpa@1440: 20px — tiesė sąmoningai išeina už lapo krašto
  pastaba: 18-taskas-tiese-spindulys-atkarpa@360: 12.4px — ta pati priežastis          rc=0

$ python3 scripts/check_docs_facts.py
Dokumentų skaičiai: 0 klaidų, 0 įspėjimų
Sutampa su failais. (51 modulis, 9 kryptys)                       rc=0

$ python3 scripts/check_language.py --grade 1
Moduliai: 51 · klaidos: 0 · įspėjimai: 0 · pastabos: 32 · sakinio riba: 10 ž. (error)
✔ Užduočių formuluotės švarios.                                   rc=0

$ python3 scripts/check_lessons.py
✔ Pamokos: 129 įrašai, visi su 4 laukais.

$ python3 scripts/check_art.py
✔ Iliustracijos: 9 simuliacijų failai naudoja art.js, legacy: 1

$ python3 scripts/check_agents.py
✔ Agentai: 15 vaidmenų, visi su failais, grafikais ir ribomis, įspėjimų 1
  ! sisteminiai pasiūlymai laukia >3 d. (8)                        rc=0   (buvo ir prieš)

$ python3 scripts/rebalance_answers.py
Keistų failų: 0 — Sausas bėgimas.                                  rc=0
```

Garso dažnis per-failiškai (ne mėginys), `ffprobe` visiems 1486 failams:

```
1486 22050,1
--- ffprobe klaidos: 0
```

Taigi visi 1486 mp3 yra 22 050 Hz, mono (vienas kanalas) — Piper variklio signalas.

### Nuorodų ir registro patikra

```
$ python3 scripts/check_registry.py     → index 51 = failai 51, našlaičiai 0, PROBLEMŲ 0
$ scratch/probe416_index.py
SIMS raktai kode: 51
index įrašai: 51 · sim.component su raktu: 51 · be sim: 0
index ↔ modulis title/subtitle/minutes nesutapimų: 0
path.json: 51 žingsnių · ne indexe: [] · ne kelyje: []
PROBLEMŲ: 0
```

Kiekvienas `index.json` įrašas: `file` egzistuoja, failo vardas = įrašo `id` = modulio `id`,
`strand` sutampa su krypties `id`, `sim.component` yra `SIMS` eksporte. `check_registry.py` kode
skaičiuoja 73 `SIMS` raktus (12 failų, įskaitant ne 1 klasės komponentus); 1 klasė naudoja 51 —
visi 51 rasti registre, 0 be `sim`.

Papildomai (ne vartuose, bet #16892 matuota): index kortelės `title`/`subtitle`/`minutes` prieš
modulio tuos pačius laukus — 51 × 3 = 153 palyginimai, **0 nesutapimų**. Defektas latentinis:
`validate_content.py` jų nelygina, bet šiandien jie sutampa.

### Užduočių formuluočių zondai (ką vartai nemato)

```
$ scratch/probe416_hint.py     (223 užduotys)
A) visas teisingo varianto tekstas užuominoje: 0
B) ≥60 % reikšminių teisingo varianto žodžių dangoje: 0

$ scratch/probe416_dupes.py    (223 užduotys, 51 modulis)
A) tas pats klausimas skirtinguose moduliuose: 0
B) tas pats klausimas tame pačiame modulyje: 0
D) ta pati užuomina skirtinguose moduliuose: 0
C) tie patys variantai keliose užduotyse: 2 — abu paaiškinti, NE defektai:
   ('07-desningumai',1) ir ('07-desningumai',3) → ('','','')  ← MANO zondo artefaktas:
      zondas šalina ne-ASCII simbolius, o variantai yra 🔺/🔻/⬛ ir 🔵/⭐/⬛ — skirtingi.
      Patikrinta ranka: 07-desningumai.json:129–133 ir :151–155.
   ('18-taskas-tiese-spindulys-atkarpa',0) ir ('03-lankstymas-ir-karpiniai',0) → („vieną",„du",„tris")
      — skirtingi dalykai (tiesė / popieriaus lankstymas); variantų tekstas sutampa atsitiktinai.
```

## Klaidos ir eilutės

**0 klaidų.** Nė vienas vartas nepranešė klaidos: turinys, registras, sąsaja, garsas, dokumentų
skaičiai, kalbos formuluotės, iliustracijos, pamokų registras — visi `rc=0`; `check_view.py` 153
patikros (51 maršrutas × 3 plotai: 1440/390/360 px) — 0 problemų, įskaitant 360 px.

Aplinkos pastaba (ne repo defektas): `python3 scripts/check_svg_fit.py` su sistemos interpretatoriumi
rašo `KLAIDA: nėra playwright (pip install playwright)` ir grąžina rc=2; su `.venv/bin/python` dirba.
`check_view.py` ir `check_svg_fit.py` reikalauja Playwright — šiame hoste jis yra tik `.venv`.
Naujo issue nekūriau: tai aplinka, ne repo, ir CI (`validate.yml`) tų dviejų įrankių nepaleidžia.

GitHub: atvirų issue 1 (`#2` „Garso patikra aklina atvirkštinei krypčiai: 6 našlaitiniai mp3…“,
2026-11-09). Šiandien `check_audio.py` našlaičių nebemato (`naudojama 1486 iš 1486`, `--list` tuščias),
tad issue atrodo pasenęs. Neuždariau ir naujo nekūriau — vaikui matomo defekto šiandien nėra.

## HTTP kodai

```
$ curl -sS -o /dev/null -m 20 -w "%{http_code}" <adresas>
https://one-man-company.github.io/suprask/                                -> 200
https://one-man-company.github.io/suprask/content/lt/grade-01/index.json   -> 200   sha256 c2ffd8634eac7893 = repo
https://one-man-company.github.io/suprask/content/lt/grades.json           -> 200   sha256 711a39633eebd2f6 = repo
```

`https://suprask.lt/` toks adresas neegzistuoja (2026-11-20 matuota 000); README skelbia github.io —
naudoti jį. Šiandien nekartota, nes adresas nepakito.

## Nepadaryta

1. `check_view.py --base <gyva svetainė>` (gyvos naršyklės patikra) nepaleista — biudžetas; 360 px
   elgsena matuota vietiniame serveryje (153 patikros, 0 problemų).
2. 200 % teksto zondas (LL-39 / #7396 „Vartai nemato 200 % teksto“) šiandien **nematuotas**;
   `check_agents.py` jį primena kaip >3 d. laukiantį sisteminį pasiūlymą.
3. Nauja pamoka nepridėta: nė vieno naujo, įrodyto defekto tipo šiandien nebuvo — vienintelis
   įdomesnis radinys („tie patys variantai“) buvo mano zondo artefaktas.
