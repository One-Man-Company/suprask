# metodininkas — 2026-11-06T0822

- paleidimas: #26 (manual)
- trukmė: 520s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/props.py
│ @@ -0,0 +1,15 @@
│ +import json, glob, os, sys
│ +
│ +rows = []
│ +for f in sorted(glob.glob('/home/zoltanas/workspace/suprask/agents/proposals/*.json')):
│ +    try:
│ +        d = json.load(open(f))
│ +    except Exception as e:
│ +        print("BAD", f, e)
│ +        continue
│ +    rows.append((str(d.get('status')), str(d.get('priority')), str(d.get('created')),
│ +                 str(d.get('type')), str(d.get('role')), os.path.basename(f),
│ +                 str(d.get('title', ''))[:80], str(d.get('target', ''))))
│ +
│ +for r in sorted(rows, key=lambda r: (r[0], r[1], r[2])):
│ +    print(" | ".join(r))
│ profiles/deepseek41flash/cache/scratch/pinigai.py
│ @@ -0,0 +1,45 @@
│ +from itertools import product
│ +
│ +coins = [50, 20, 10, 5]
│ +
│ +def ways(total, coins, maxn=8):
│ +    out = []
│ +    def rec(i, left, acc):
│ +        if left == 0:
│ +            out.append(tuple(acc))
│ +            return
│ +        if i >= len(coins) or len(acc) > 12:
│ +            return
│ +        c = coins[i]
│ +        k = 0
│ +        while c * k <= left:
│ +            rec(i + 1, left - c * k, acc + [c] * k)
│ +            k += 1
│ +    rec(0, total, [])
│ +    return out
│ +
│ +for price in (25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95):
│ +    w = ways(price, coins)
│ +    print(price, "būdų:", len(w), "| trumpiausias:", min((len(x), x) for x in w))
│ +
│ +print()
│ +price = 60
│ +print("60 c rinkiniai:")
│ +for x in ways(60, coins)[:10]:
│ +    print("  ", " + ".join(str(c) for c in x), "=", sum(x), "monetų:", len(x))
│ +
│ +# 360 px geometrija: monetos tikru santykiu
│ +mm = {50: 24.25, 20: 22.25, 10: 19.75, 5: 21.25}
│ +scale = 1.85  # px per mm
│ +print()
│ +for c, d in mm.items():
│ +    print(f"{c:>2} c: {d} mm -> {d*scale:.1f} px")
│ +print("5 c ir 10 c skirtumas:", round((mm[5]-mm[10])*scale, 1), "px")
│ +print("eilutė 4 monetų:", round(sum(d*scale for d in mm.values()), 1), "px")
│ +print("tarpai 3 x 8 px:", round(sum(d*scale for d in mm.values()) + 3*8, 1), "px iš 328 px")
│ +print()
│ +for t in ["Pinigai: monetos vertė, ne dydis",
│ +          "Vertė parašyta ant monetos, ne jos dydis",
│ +          "Pinigai: vertė yra skaičius ant monetos",
│ +          "Skaičiuojam monetų vertę, ne monetų skaičių"]:
│ +    print(len(t), t)
│ profiles/deepseek41flash/cache/scratch/lengths.py
│ @@ -0,0 +1,16 @@
│ +cands = [
│ + ("title", "Pinigai: monetos vertė parašyta, ne išmatuojama"),
│ + ("title", "Pinigai: vertė parašyta ant monetos"),
│ + ("title", "Pinigai: monetos vertė, ne jos dydis"),
│ + ("subtitle", "Sumą sudaro užrašyti skaičiai, ne monetų skaičius"),
│ + ("subtitle", "Skaičiuok, kas parašyta ant monetos, ne kiek ji didelė"),
│ +]
│ +for k, s in cands:
│ +    print(k, len(s), s)
│ +
│ +print()
│ +print("sumos:", 50+10, 50+20, 50+20+10, 20*4, 50+20+20+5, 50+20+10+10+5, 20*4+10+5)
│ +print("bar 100 c @3.2 px/c:", 100*3.2, "| 60 c:", 60*3.2, "| 85 c:", 85*3.2)
│ +print("pinigine 4x56 + 3x8:", 4*56+3*8)
│ +print("lekste 10 x 28 + 9 x 4:", 10*28+9*4)
│ +print("5c vs 10c px @1.85:", round((21.25-19.75)*1.85,1), "| @28px leksteje:", round(28*1.5/24.25,1))
│ research/wiki/grades/01/metodai.md
│ @@ -3,7 +3,7 @@
│  tipas: metodai
│  klase: 1
│  amzius: "6–7"
│ -atnaujinta: 2026-11-05
│ +atnaujinta: 2026-11-06
│  ---
│
│  # 1 klasės metodai
│ research/wiki/grades/01/metodai.md
│ @@ -138,6 +138,67 @@
│
│  **Šaltiniai.** Baroody, A. J., & Ginsburg, H. P. (1983). The effects of instruction on children's understanding of the "equals" sign. *The Elementary School Journal, 84*(2), 199–212. https://doi.org/10.1086/461356 · McNeil, N. M., & Alibali, M. W. (2005). Why won't you change your mind? Knowledge of operational patterns hinders learning and performance on equations. *Child Development, 76*(4), 883–899. https://doi.org/10.1111/j.1467-8624.2005.00884.x · Falkner, K. P., Levi, L., & Carpenter, T. P. (1999). Children's understanding of equality: A foundation for algebra. *Teaching Children Mathematics, 6*(4), 232–236. https://doi.org/10.5951/TCM.6.4.0232 · Stephens, A., Sung, Y., Strachota, S., Torres, R. V., Morton, K., Gardiner, A. M., Blanton, M., Knuth, E., & Stroud, R. (2022). The role of balance scales in supporting productive thinking about equations among diverse learners. *Mathematical Thinking and Learning, 24*(1), 1–18. https://doi.org/10.1080/10986065.2020.1793055 · Otten, M., Van den Heuvel-Panhuizen, M., & Veldhuis, M. (2019). The balance model for teaching linear equations: A systematic literature review. *International Journal of STEM Education, 6*(1). https://doi.org/10.1186/s40594-019-0183-2
│
│ +### M-03 — Pinigai: monetos vertė parašyta, ne išmatuojama
│ +
│ +**Data:** 2026-11-06 · **Tema:** `agents/proposals/2026-11-03-ideator-pinigai.json` · **Tikslas:** `content/lt/grade-01/matematika/14-pinigai.json` · **Šaltinis:** `research/wiki/foundations/dydis-ir-skaicius.md`
│ +
│ +**Viena didelė idėja.** Monetos vertė yra ant jos parašytas skaičius. Pinigų suma — tų skaičių suma. Nei monetų dydis, nei monetų skaičius sumos nepasako.
│ +
│ +**Kodėl modelis, o ne sakinys.** Šešeriamečiai vertę skaito iš to, ką mato: didesnė moneta atrodo vertingesnė, daugiau monetų — daugiau pinigų. Whitehurst ir Edmunds (1973) tyrė 80 vaikų nuo 2 iki 8 metų: sąvokai „daugiau“ vaikai naudojo monetos **dydį**, o ne vertę, ir toks pasirinkimas išliko iki septynerių metų, nors santykinės vertės supratimas ėmė ryškėti apie šešerius. Berti ir Bombi (1981), 12 mėnesių stebėję 80 vaikų (3–8 m.), aprašė šešias pakopas: pirmosiose vaikas pinigus skiria pagal **fizinį dydį ar pavadinimą**, o tiksli vertės ir kainos atitiktis susidaro tik penktoje pakopoje — po to, kai vaikas jau žino, kad mokėti reikia sumą, kuri ne mažesnė už kainą. Ši sąsaja nedingsta ir vėliau: Hasegawa (2020) parodė, kad net suaugusieji greičiau ir tiksliau lygina monetų dydį, kai didesnė moneta ir vertesnė — „didesnis yra daugiau“ veikia automatiškai, ne kaip samprotavimas. Todėl raginimas „žiūrėk į skaičių“ konkuruoja su tuo, ką vaikas mato, ir pralaimi. Reikia modelio, kuriame **vertė atsiskiria nuo dydžio fiziškai**: mažesnė moneta gali pripildyti daugiau juostos, o kelios monetos — mažiau.
│ +
│ +**Klaidingos nuostatos ir kaip jos paneigiamos.**
│ +
│ +1. **„Didesnė moneta verta daugiau.“** Paneigiama tikru euro atveju: 5 centų moneta yra 21,25 mm skersmens, o 10 centų — 19,75 mm, tad 5 c moneta **didesnė**, nors verta perpus mažiau (Europos Komisijos ir EUR-Lex techninės specifikacijos). Modelis šio skirtumo neįrodo paveikslu ir to neslepia: 1,5 mm ekrane yra apie 2 px, todėl po to, kai vaikas įdeda abi monetas, `api.note` pasako vieną sakinį („Penkių centų moneta didesnė, bet verta mažiau.“), o **juosta** parodo dvigubą skirtumą. Skaičius ir juosta, ne akių matas.
│ +2. **„Daugiau monetų — daugiau pinigų.“** Modelis skaičių ir sumą rodo atskirai ir niekada nesujungia: „Monetų: 6“ stovi kitoje eilutėje negu „Suma: 60 c“. Paneigiama veiksmu: 1 × 50 c + 1 × 10 c ir 6 × 10 c duoda tą pačią sumą su skirtingu monetų skaičiumi, o užduotis prašo palyginti du rinkinius, kurių monetų skaičius skiriasi. Programa pati skiria šiuos du klausimus: 1 klasės pasiekimų pavyzdyje klausiama atskirai „Kiek monetų turi…?“ ir „Kiek pinigų turi…?“ (`sources/pradinio-bp-rekomendacijos-2024.txt:33957–33959`). Kad atskyrimas būtinas, rodo ir Tracy bei Fanelli (2000): iš 35 pirmokų tik 7 teisingai suskaičiavo **mišrų** monetų rinkinį, o vertės tvarka monetas išdėliojo 34 %.
│ +3. **„Monetos vertė — tai, ką už ją galima nupirkti.“** Tracy ir Fanelli (2000) užfiksavo vaikų atsakymus, kur moneta vertinama preke („verta ledinuko“). Ši nuostata modeliu nepaneigiama, nes modelis rodo kainą, o ne pasirinkimą parduotuvėje; ji įrašoma į `teacher.misconceptions` ir aptariama su mokytoju, o ne vaizduojama simuliacijoje.
│ +
│ +**Seka (konkretumas → modelis → simbolis → perkėlimas).**
│ +
│ +1. **Sauja.** Du vienodi maišeliai ar dvi saujos: vienoje viena 50 c moneta, kitoje penkios 10 c monetos. Vaikas pasveria abi saujas ir pasako, kur, jo nuomone, daugiau pinigų. Tikslas: pajusti, kad **sunkesnė sauja nėra turtingesnė** — svoris ir kiekis yra kitas matmuo negu suma. (Mokytojas sumos dar nepasako.)
│ +2. **Ekranas.** Parduotuvės kortelė su kaina 60 c ir kainos juosta. Piniginėje keturios monetos — 50, 20, 10 ir 5 c — nupieštos **tikru santykiu**, su skaičiumi viduje. Vaikas baksteli monetą, ji nukeliauja į lėkštę, o juosta pailgėja tiek, kiek ta moneta verta. Tikslas: pamatyti, kad juostą ilgina **skaičius ant monetos**, o ne monetos dydis ar jų skaičius.
│ +3. **Simbolis.** Kai juosta pasiekia kainos žymą, po lėkšte atsiranda eilutė `50 c + 10 c = 60 c`, o virš jos lieka atskira eilutė `Monetų: 2`. Vaikas perskaito sumą balsu. Tikslas: suma yra užrašytų skaičių suma; monetų skaičius yra kitas klausimas ir į eilutę nepatenka.
│ +4. **Perkėlimas.** Ta pati kaina 60 c surenkama **kitaip** (20 + 20 + 20 arba 10 + 10 + 10 + 10 + 10 + 10): atsiranda tekstas „Ta pati suma, kitos monetos“, o `Monetų:` skaičius pasikeičia, suma — ne. Tada du vaikai moka už 80 c prekę: vienas 50 + 20 + 10, kitas keturiomis 20 c monetomis. Tikslas: atpažinti, kad skirtingi rinkiniai gali reikšti tą pačią sumą, ir perkelti taisyklę į situaciją be modelio.
│ +
│ +**Privalomas žingsnis prieš pirmą judesį.** `api.readout`: „Kiek monetų prireiks 60 centų? Pasakyk, tada dėk.“ Kol vaikas nepasakė (paspaudė „Sakau“), monetos neaktyvios. Be spėjimo modelis tampa generatoriumi: vaikas baksto tol, kol juosta prisipildo, ir teisinga būsena atsiranda be sprendimo — tas pats pavojus kaip M-01 ir M-02 (`foundations/sujungti-dydziai.md`). Spėjimas čia skirtas **monetų skaičiui**, nes būtent skaičių vaikas linkęs painioti su suma.
│ +
│ +**Simuliacijos specifikacija.** Komponentas `pinigine-ir-kaina`, `assets/js/sims/matematika.js`, `config: { "price": 60, "coins": [50, 20, 10, 5] }`.
│ +
│ +| Būsena | Ką rodo | `readout` | `api.note` |
│ +|---|---|---|---|
│ +| lėkštė tuščia (`sum = 0`) | juosta tuščia, kainos žyma ties 60 c | „Kaina 60 c. Įdėk monetą.“ | „Dar nieko nesumokėta.“ |
│ +| per mažai (`sum < price`) | juosta trumpesnė už žymą | „Dar ne visa kaina.“ | „Juosta dar nesiekia kainos žymos.“ |
│ +| lygiai (`sum = price`) | juosta lygiai ties žyma, eilutė `50 c + 10 c = 60 c` | „Apmokėta. 60 c.“ | „50 ir 10 yra 60.“ |
│ +| per daug (`sum > price`) | juosta peržengusi žymą, perteklius — brūkšniuotas | „Per daug.“ | „Juosta peržengė kainos žymą. Nuimk monetą.“ |
│ +| ta pati suma kitaip (po pirmo `sum = price`) | ta pati juosta, kitas monetų rinkinys | „Ta pati suma, kitos monetos.“ | „Monetų skaičius kitas, suma ta pati.“ |
│ +| įdėta 5 c ir 10 c kartu (vieną kartą) | abi monetos lėkštėje, jų juostos skiriasi dvigubai | ta pati būsena | „Penkių centų moneta didesnė, bet verta mažiau.“ |
│ +
│ +- **Vienas kintamasis:** monetų rinkinys lėkštėje. Suma — deterministinė: `sum = 50a + 20b + 10c + 5d`. Daugiau vaikas nieko nekeičia; kaina fiksuota konfigūracijoje, monetų rinkinys fiksuotas (jokių „pasirink valiutą“).
│ +- **Juosta:** 3,2 px už centą → 100 c = 320 px, telpa į 328 px turinio plotį; kaina 60 c — 192 px žyma; didžiausia įmanoma suma 85 c — 272 px. Juostos ilgis keičiasi iškart (be perėjimo, jei `prefers-reduced-motion`).
│ +- **Monetų piešimas:** tikras santykis, 1,85 px/mm — 50 c ≈ 45 px, 20 c ≈ 41 px, 10 c ≈ 36,5 px, 5 c ≈ 39 px. Skaičius rašomas monetos viduje („50“, „c“), spalva — papildoma (5 c vario, 10–50 c aukso). **Lėkštėje** monetos rodomos vienodo 28 px dydžio, nes ten rodoma vertė, o ne dydis; tai sąmoninga modelio supaprastinimas, įvardytas žemiau.
│ +- **Įėjimai:** keturi piniginės mygtukai 56 × 56 px (moneta 45 px viduje, `aria-label` „50 centų moneta“), lėkštėje monetos su 48 × 48 px lietimo sritimi (nuima monetą), mygtukai „Nuimk paskutinę“ ir „Iš naujo“ (≥ 48 px), „Sakau“ (spėjimo žingsnis). Klaviatūra: `Tab` tarp mygtukų, `Enter`/`Space` įdeda arba nuima, `←`/`→` perkelia pasirinkimą lėkštėje, `Backspace` nuima paskutinę.
│ +- **Lėkštė:** `flex-wrap`, 28 px monetos su 4 px tarpu; eilutėje telpa 10 (316 px), dvi eilutės padengia 20 monetų — daugiausia, kiek reikia 95 c iš 5 c monetų. Perpildymas nebaudžiamas: monetų tiesiog daugiau, o eilutė vyniojama.
│ +- **Grįžtamasis ryšys** — iškart po kiekvieno bakstelėjimo; `readout` įvardija tik santykį („Dar ne visa kaina“, „Per daug“), `api.note` — vieną sakinį apie veiksmą, ne apie vaiką. `api.progress({ correct: true })` — vieną kartą, kai pirmą kartą sumokama tiksliai.
│ +- **Garsas** — penkios nustatytos frazės: „Dar ne visa kaina.“, „Apmokėta.“, „Per daug. Nuimk monetą.“, „Penkių centų moneta didesnė, bet verta mažiau.“, „Ta pati suma, kitos monetos.“ Skaičiai garsiai neskaitomi (mažas `scripts/check_audio.py` manifestas); generuojant garso failus reikia abiejų variantų (`n`, `s`).
│ +- **Prieinamumas:** scenos SVG `role="img"` su `aria-label`, atnaujinamu po kiekvieno veiksmo („Lėkštėje dvi monetos: 50 ir 10. Suma 60 centų. Kaina 60 centų.“); `readout` turi `aria-live="polite"`; spalva niekada nėra vienintelis informacijos nešėjas — perteklius žymimas brūkšniu, ne tik raudonai; visi mygtukai turi `aria-label`.
│ +- **Be laikmačių, be ėjimų limito, be „game over“.** Per didelė suma — informacija, ne bauda: vaikas nuima monetą ir bando toliau.
│ +
│ +**Užduotys.**
│ +
│ +| # | Tipas | Klausimas ir variantai | Teisingas | Tipinė klaida | Užuomina |
│ +|---|---|---|---|---|---|
│ +| 1 | atpažinimas | „Ant stalo trys monetos: 50 c, 10 c ir 10 c. Kiek tai pinigų?“ — 3 c / 30 c / 70 c | 70 c (indeksas 2) | 3 c — skaičiuoja monetas, ne vertes | „Skaičiuok, kas parašyta ant kiekvienos monetos, o ne kiek monetų yra.“ |
│ +| 2 | taikymas | „Kaina 60 c. Kuris rinkinys sumokės tiksliai — nei per mažai, nei per daug?“ — `50 c + 10 c` / `50 c + 20 c` / `20 c + 20 c + 10 c` | `50 c + 10 c` (0) | antras — 70 c, per daug; trečias — 50 c, per mažai | „Sudėk abu skaičius ir palygink su kaina. Ar rinkinys didesnis už 60?“ |
│ +| 3 | perkėlimas | „Už tą pačią 80 c prekę vienas vaikas davė 50 + 20 + 10, kitas — keturias 20 c monetas. Kuris sumokėjo daugiau?“ — Pirmas / Antras / Abu sumokėjo tiek pat | Abu sumokėjo tiek pat (2) | „Pirmas“ (didžiausios monetos) arba „Antras“ (daugiau monetų) | „Monetų skaičius ir monetų dydis čia nieko nesako. Sudėk abu rinkinius.“ |
│ +| 4 | praplėtimas (`optional: true`) | „Kaina 95 c. Kuris rinkinys sumokės šią kainą mažiausiai monetų?“ — `50 + 20 + 20 + 5` / `50 + 20 + 10 + 10 + 5` / `20 + 20 + 20 + 20 + 10 + 5` | `50 + 20 + 20 + 5` (1) | trečias — ima daug smulkių, nes „kuo daugiau monetų, tuo saugiau“; antras — nešioja po 10 c, nors 20 c verta daugiau | „Viena didesnė moneta gali pakeisti kelias mažesnes. Skaičiuok, kiek monetų lieka kiekviename rinkinyje.“ |
│ +
│ +**Refleksija.** „Kai dvi monetos skiriasi dydžiu, kaip sužinai, kuri verta daugiau? Papasakok, kur žiūri.“ Klausiama žodžiu, nevertinama; laukiamas atsakymas — į užrašytą skaičių, o dydis gali ir apgauti.
│ +
│ +**Modelio ribos (pasakomos vaikui ir mokytojui).** Modelis rodo tik monetas iki 1 euro; banknotai (5, 10 €) ir 1 €, 2 € monetos lieka mokytojo veiklai su tikrais pinigais, nes jų įtraukimas reikalautų euro ir centų sąryšio — tai antra sąvoka. Modelis pats suskaičiuoja sumą, todėl tiksliai sumokėta juosta **nėra supratimo įrodymas**: dėl to yra spėjimo žingsnis ir užduotys be modelio. Ekrane monetų dydžiai tikri, bet 5 c ir 10 c skirtumas — 1,5 mm (apie 2 px), tad jį įvardija tekstas ir juosta, o ne akis; lėkštėje monetos sąmoningai vienodo dydžio. Kainos laikomos iki 95 c, kad vaiko aritmetika liktų 100 ribose (1 klasės skaičių sritis).
│ +
│ +**Ką tai reiškia modulio autoriui.** `title` — „Pinigai: monetos vertė, ne jos dydis“ (36 simboliai); `subtitle` — „Sumą sudaro užrašyti skaičiai, ne monetų skaičius“ (49); `minutes` — 9; trys `outcomes` (atpažįstu monetą pagal užrašytą vertę; sudedu sumą iš kelių monetų; paaiškinu, kodėl didesnė moneta ne visada verta daugiau); `concept.example` — „Parduotuvėje 60 centų kainuojantį ledinuką gali sumokėti viena 50 c ir viena 10 c moneta arba šešiomis 10 c monetomis.“; `teacher.offline` — du maišeliai su ta pačia suma (50 c prieš penkias 10 c), po to tikrų monetų rūšiavimas pagal užrašą, ne pagal dydį; `teacher.misconceptions` — trys nuostatos iš šio skyriaus; `sim` — `{ "component": "pinigine-ir-kaina", "config": { "price": 60, "coins": [50, 20, 10, 5] } }`. Modulį įrašius, jis turi būti įtrauktas į `content/lt/grade-01/index.json` ir `path.json` (dizainerio arba leidėjo darbas, ne metodo dalis); numeris `14-` laisvas (15 ir 16 jau užimti).
│ +
│ +**Šaltiniai.** Berti, A. E., & Bombi, A. S. (1981). The development of the concept of money and its value: A longitudinal study. *Child Development, 52*(4), 1179–1182. https://doi.org/10.2307/1129504 · Strauss, A. L. (1952). The development and transformation of monetary meanings in the child. *American Sociological Review, 17*(3), 275–286. https://doi.org/10.2307/2088073 · Hasegawa, K. (2020). The size-value compatibility effect. *Scientific Reports, 10*, 62419. https://doi.org/10.1038/s41598-020-62419-8 · Edmunds, G. J., & Whitehurst, K. (1973). *The emergence and development of monetary concepts in young children* (ERIC ED087553). https://eric.ed.gov/?id=ED087553 · Tracy, D. M., & Fanelli, B. H. (2000). *Teaching money concepts: Are we shortchanging our kids?* (ERIC ED451065). https://eric.ed.gov/?id=ED451065 · Europos Komisija. *Common sides of euro coins* (techninės specifikacijos). https://economy-finance.ec.europa.eu/euro/euro-coins-and-notes/euro-coins/common-sides-euro-coins_en · EUR-Lex. *Denominations and technical specifications of euro coins*. https://eur-lex.europa.eu/EN/legal-content/summary/denominations-and-technical-specifications-of-euro-coins.html
│ +
│  ## Atviros prielaidos
│
│  - _(kas šioje klasėje dar nepatikrinta; žr. [[../../guidelines/klausimai|klausimus]])_
│ research/wiki/grades/01/metodai.md
│ @@ -138,7 +138,7 @@
│
│  **Šaltiniai.** Baroody, A. J., & Ginsburg, H. P. (1983). The effects of instruction on children's understanding of the "equals" sign. *The Elementary School Journal, 84*(2), 199–212. https://doi.org/10.1086/461356 · McNeil, N. M., & Alibali, M. W. (2005). Why won't you change your mind? Knowledge of operational patterns hinders learning and performance on equations. *Child Development, 76*(4), 883–899. https://doi.org/10.1111/j.1467-8624.2005.00884.x · Falkner, K. P., Levi, L., & Carpenter, T. P. (1999). Children's understanding of equality: A foundation for algebra. *Teaching Children Mathematics, 6*(4), 232–236. https://doi.org/10.5951/TCM.6.4.0232 · Stephens, A., Sung, Y., Strachota, S., Torres, R. V., Morton, K., Gardiner, A. M., Blanton, M., Knuth, E., & Stroud, R. (2022). The role of balance scales in supporting productive thinking about equations among diverse learners. *Mathematical Thinking and Learning, 24*(1), 1–18. https://doi.org/10.1080/10986065.2020.1793055 · Otten, M., Van den Heuvel-Panhuizen, M., & Veldhuis, M. (2019). The balance model for teaching linear equations: A systematic literature review. *International Journal of STEM Education, 6*(1). https://doi.org/10.1186/s40594-019-0183-2
│
│ -### M-03 — Pinigai: monetos vertė parašyta, ne išmatuojama
│ +### M-03 — Pinigai: monetos vertė, ne jos dydis
│
│  **Data:** 2026-11-06 · **Tema:** `agents/proposals/2026-11-03-ideator-pinigai.json` · **Tikslas:** `content/lt/grade-01/matematika/14-pinigai.json` · **Šaltinis:** `research/wiki/foundations/dydis-ir-skaicius.md`
│
│ research/wiki/grades/01/metodai.md
│ @@ -144,7 +144,7 @@
│
│  **Viena didelė idėja.** Monetos vertė yra ant jos parašytas skaičius. Pinigų suma — tų skaičių suma. Nei monetų dydis, nei monetų skaičius sumos nepasako.
│
│ -**Kodėl modelis, o ne sakinys.** Šešeriamečiai vertę skaito iš to, ką mato: didesnė moneta atrodo vertingesnė, daugiau monetų — daugiau pinigų. Whitehurst ir Edmunds (1973) tyrė 80 vaikų nuo 2 iki 8 metų: sąvokai „daugiau“ vaikai naudojo monetos **dydį**, o ne vertę, ir toks pasirinkimas išliko iki septynerių metų, nors santykinės vertės supratimas ėmė ryškėti apie šešerius. Berti ir Bombi (1981), 12 mėnesių stebėję 80 vaikų (3–8 m.), aprašė šešias pakopas: pirmosiose vaikas pinigus skiria pagal **fizinį dydį ar pavadinimą**, o tiksli vertės ir kainos atitiktis susidaro tik penktoje pakopoje — po to, kai vaikas jau žino, kad mokėti reikia sumą, kuri ne mažesnė už kainą. Ši sąsaja nedingsta ir vėliau: Hasegawa (2020) parodė, kad net suaugusieji greičiau ir tiksliau lygina monetų dydį, kai didesnė moneta ir vertesnė — „didesnis yra daugiau“ veikia automatiškai, ne kaip samprotavimas. Todėl raginimas „žiūrėk į skaičių“ konkuruoja su tuo, ką vaikas mato, ir pralaimi. Reikia modelio, kuriame **vertė atsiskiria nuo dydžio fiziškai**: mažesnė moneta gali pripildyti daugiau juostos, o kelios monetos — mažiau.
│ +**Kodėl modelis, o ne sakinys.** Šešeriamečiai vertę skaito iš to, ką mato: didesnė moneta atrodo vertingesnė, daugiau monetų — daugiau pinigų. Whitehurst ir Edmunds (1973) tyrė 80 vaikų nuo 2 iki 8 metų: sąvokai „daugiau“ vaikai naudojo monetos **dydį**, o ne vertę, ir toks pasirinkimas išliko iki septynerių metų, nors santykinės vertės supratimas ėmė ryškėti apie šešerius. Berti ir Bombi (1981), kas 12 mėnesių kartodami tyrimą su 80 vaikų (3–8 m.), aprašė šešias pakopas: pirmosiose vaikas pinigus skiria pagal **fizinį dydį ar pavadinimą**, o tiksli vertės ir kainos atitiktis susidaro tik penktoje pakopoje — po to, kai vaikas jau žino, kad mokėti reikia sumą, kuri ne mažesnė už kainą. Ši sąsaja nedingsta ir vėliau: Hasegawa (2020) parodė, kad net suaugusieji greičiau ir tiksliau lygina monetų dydį, kai didesnė moneta ir vertesnė — „didesnis yra daugiau“ veikia automatiškai, ne kaip samprotavimas. Todėl raginimas „žiūrėk į skaičių“ konkuruoja su tuo, ką vaikas mato, ir pralaimi. Reikia modelio, kuriame **vertė atsiskiria nuo dydžio fiziškai**: mažesnė moneta gali pripildyti daugiau juostos, o kelios monetos — mažiau.
│
│  **Klaidingos nuostatos ir kaip jos paneigiamos.**
│
│ research/wiki/grades/01/metodai.md
│ @@ -144,7 +144,7 @@
│
│  **Viena didelė idėja.** Monetos vertė yra ant jos parašytas skaičius. Pinigų suma — tų skaičių suma. Nei monetų dydis, nei monetų skaičius sumos nepasako.
│
│ -**Kodėl modelis, o ne sakinys.** Šešeriamečiai vertę skaito iš to, ką mato: didesnė moneta atrodo vertingesnė, daugiau monetų — daugiau pinigų. Whitehurst ir Edmunds (1973) tyrė 80 vaikų nuo 2 iki 8 metų: sąvokai „daugiau“ vaikai naudojo monetos **dydį**, o ne vertę, ir toks pasirinkimas išliko iki septynerių metų, nors santykinės vertės supratimas ėmė ryškėti apie šešerius. Berti ir Bombi (1981), kas 12 mėnesių kartodami tyrimą su 80 vaikų (3–8 m.), aprašė šešias pakopas: pirmosiose vaikas pinigus skiria pagal **fizinį dydį ar pavadinimą**, o tiksli vertės ir kainos atitiktis susidaro tik penktoje pakopoje — po to, kai vaikas jau žino, kad mokėti reikia sumą, kuri ne mažesnė už kainą. Ši sąsaja nedingsta ir vėliau: Hasegawa (2020) parodė, kad net suaugusieji greičiau ir tiksliau lygina monetų dydį, kai didesnė moneta ir vertesnė — „didesnis yra daugiau“ veikia automatiškai, ne kaip samprotavimas. Todėl raginimas „žiūrėk į skaičių“ konkuruoja su tuo, ką vaikas mato, ir pralaimi. Reikia modelio, kuriame **vertė atsiskiria nuo dydžio fiziškai**: mažesnė moneta gali pripildyti daugiau juostos, o kelios monetos — mažiau.
│ +**Kodėl modelis, o ne sakinys.** Šešeriamečiai vertę skaito iš to, ką mato: didesnė moneta atrodo vertingesnė, daugiau monetų — daugiau pinigų. Whitehurst ir Edmunds (1973) tyrė 80 vaikų nuo 2 iki 8 metų: sąvokai „daugiau“ vaikai naudojo monetos **dydį**, o ne vertę, ir toks pasirinkimas išliko iki septynerių metų, nors santykinės vertės supratimas ėmė ryškėti apie šešerius. Berti ir Bombi (1981), kas 12 mėnesių kartodami tyrimą su 80 vaikų (3–8 m.), aprašė šešias pakopas: pirmosiose vaikas pinigus skiria pagal **fizinį dydį ar pavadinimą**, o tiksli vertės ir kainos atitiktis susidaro tik penktoje pakopoje — po to, kai vaikas jau žino, kad mokėti reikia sumą, kuri ne mažesnė už kainą. Ši sąsaja nedingsta ir vėliau: Hasegawa (2020) eksperimentuose dalyviai apie monetos dydį sprendė lėčiau ir klysdavo dažniau, kai mažesnės vertės moneta buvo pavaizduota didesnė — „didesnis yra daugiau“ veikia automatiškai, net kai žmogus prieš tai laikė tikras monetas. Todėl raginimas „žiūrėk į skaičių“ konkuruoja su tuo, ką vaikas mato, ir pralaimi. Reikia modelio, kuriame **vertė atsiskiria nuo dydžio fiziškai**: mažesnė moneta gali pripildyti daugiau juostos, o kelios monetos — mažiau.
│
│  **Klaidingos nuostatos ir kaip jos paneigiamos.**
│
│ research/wiki/foundations/dydis-ir-skaicius.md
│ @@ -0,0 +1,52 @@
│ +---
│ +title: "Dydis ir skaičius: kodėl vertė turi būti rodoma atskirai nuo išvaizdos"
│ +tipas: fundamentai
│ +temos: [pinigai, vertė, dydis, kiekis, modeliai, ankstyvoji matematika]
│ +amzius: "5-9"
│ +atnaujinta: 2026-11-06
│ +saltiniai: 6
│ +---
│ +
│ +# Dydis ir skaičius: kodėl vertė turi būti rodoma atskirai nuo išvaizdos
│ +
│ +## Pagrindinė idėja
│ +
│ +Kai daiktas turi ir **matomą dydį**, ir **užrašytą skaičių**, o jie vienas kitam prieštarauja, vaikas iki septynerių metų paprastai tiki dydžiu. Tai nėra nežinojimas, kurį pašalina paaiškinimas: dydis yra tiesiogiai matomas, o skaičius — sutartinis ženklas, kurio reikšmę reikia žinoti. Todėl modelis, kuriame daiktas neša skaičių, privalo parodyti to skaičiaus **poveikį atskirai** (juosta, suma, eilutė), o ne tik užrašyti jį ant daikto. Priešingu atveju modelis tyliai moko tos pačios klaidos, kurią turėtų griauti.
│ +
│ +## Ką rodo tyrimai
│ +
│ +**Kiekis ir dydis laimi prieš vertę.** Edmunds ir Whitehurst (1973) tyrė 80 vaikų nuo 2 iki 8 metų. Klausiami, kuri moneta „daugiau“, vaikai rinkosi **didesnę**, ne vertesnę; toks pasirinkimas išliko iki septynerių metų, nors santykinės vertės supratimas ėmė ryškėti apie šešerius. Tai reiškia, kad pirmoje klasėje dydžio strategija dar gyva, o ne užmarštyje.
│ +
│ +**Vertė susidaro pakopomis.** Berti ir Bombi (1981), kas dvylika mėnesių kartodami tyrimą su 80 vaikų (3–8 m.), aprašė šešias pakopas. Pirmosiose vaikas pinigus skiria pagal **fizinį dydį arba pavadinimą**; tiksli vertės ir kainos atitiktis atsiranda tik penktoje pakopoje, ir tik po to, kai vaikas jau supranta, jog mokėti reikia sumą, ne mažesnę už kainą. Kitaip tariant, vertė nėra vienas aktas — ji statoma iš kelių supratimų, o dydžio strategija yra ankstesnė, ne klaidinga atrama.
│ +
│ +**Sąsaja išlieka automatiška.** Hasegawa (2020) parodė dydžio ir vertės suderinamumo efektą: kai mažesnės vertės moneta pavaizduota didesnė, sprendimas apie dydį tampa lėtesnis ir klaidingesnis, nors dalyviai prieš tai laikė tikras monetas. Dydis ir vertė nėra du nepriklausomi kanalai — jie susijungia prieš sąmoningą samprotavimą.
│ +
│ +**Mokymo priemonė gali būti klaidos šaltinis.** Tracy ir Fanelli (2000), dirbę su K–3 klasėmis, nustatė, kad parduodami žaisliniai pinigai nėra proporcingi monetos vertei, todėl vaikas negali išvesti rinkinio vertės — jam belieka atmintinai žinoti kiekvienos monetos vertę. Iš 35 pirmokų mišrų monetų rinkinį teisingai suskaičiavo 7, o monetas vertės tvarka išdėliojo 34 %.
│ +
│ +## Ką tai reiškia SUPRASK platformai
│ +
│ +1. **Skaičius ant objekto nėra modelis.** Jei daiktas neša reikšmę (moneta su „50“, kauliukas, padalos žyma), modelis turi turėti antrą, atskirą vaizdą tam, ką tas skaičius padaro: juostą, sumą, eilutę, ilgį. Be jo vaikas mato tik daiktą.
│ +2. **Modelio grafika neturi koduoti klaidingos taisyklės.** Jei piešiame monetas, jų dydis turi būti tikras — net kai tikras skirtumas prieštarauja vertei (5 c moneta didesnė už 10 c). Netikras, „patogus“ dydis moko to, ką neigiam.
│ +3. **Kai skirtumas per mažas, jį įvardija tekstas.** 1,5 mm ekrane yra apie 2 px. Modelis, kuris tyliai tikisi, kad vaikas pamatys, apgauna ir vaiką, ir mokytoją; todėl toks skirtumas pasakomas vienu sakiniu ir parodomas juosta, o ne akių matu.
│ +4. **Kiekis ir suma rodomi atskirai ir niekada nesujungiami.** „Monetų: 6“ ir „Suma: 60 c“ yra du skirtingi klausimai; juos suliejus atsiranda būtent ta painiava, kurią fiksuoja tyrimai.
│ +5. **Modelis, kuris pats suskaičiuoja, reikalauja spėjimo.** Jei juosta prisipildo savaime, teisinga būsena nėra supratimo įrodymas — ta pati taisyklė kaip [[sujungti-dydziai]] ir [[zenklas-kaip-busena]].
│ +
│ +## Ko šis įrašas nedaro
│ +
│ +Jis neįrodo, kad visi pirmokai klysta, ir nepateisina „dydžio“ kaip atskiro mokymo tikslo. Berti ir Bombi duomenys surinkti 1981 m. Italijoje su lira, o ne su euru; imtis nedidelė (80 vaikų), o pakopų ribos aprašytos kokybiškai. Tracy ir Fanelli ataskaita yra konferencinio tipo tyrimas su mažomis grupėmis (viena pirmokų klasė — 6 mokiniai). Įrašas nustato tik **mažiausią dizaino sąlygą**: jei modelis rodo daiktą su skaičiumi, jis turi parodyti ir tai, ką tas skaičius padaro, o savo grafika neturi prieštarauti savo pačių taisyklei.
│ +
│ +## Susieti
│ +
│ +- [[simuliacijos-ir-modeliai]] — modelio ribos ir konkretybės nykimas
│ +- [[kognityvine-apkrova]] — kodėl du matmenys vienu metu yra per daug
│ +- [[sujungti-dydziai]] — kodėl teisinga modelio būsena dar nėra supratimas
│ +- [[../grades/01/metodai|1 klasės metodai]] — M-03 „Pinigai: monetos vertė, ne jos dydis“
│ +
│ +## Šaltiniai
│ +
│ +1. Berti, A. E., & Bombi, A. S. (1981). The development of the concept of money and its value: A longitudinal study. *Child Development, 52*(4), 1179–1182. https://doi.org/10.2307/1129504
│ +2. Strauss, A. L. (1952). The development and transformation of monetary meanings in the child. *American Sociological Review, 17*(3), 275–286. https://doi.org/10.2307/2088073
│ +3. Hasegawa, K. (2020). The size-value compatibility effect. *Scientific Reports, 10*, 62419. https://doi.org/10.1038/s41598-020-62419-8
│ +4. Edmunds, G. J., & Whitehurst, K. (1973). *The emergence and development of monetary concepts in young children* (ERIC ED087553). https://eric.ed.gov/?id=ED087553
│ +5. Tracy, D. M., & Fanelli, B. H. (2000). *Teaching money concepts: Are we shortchanging our kids?* (ERIC ED451065). https://eric.ed.gov/?id=ED451065
│ +6. Europos Komisija. *Common sides of euro coins* (techninės specifikacijos: 5 c — 21,25 mm, 10 c — 19,75 mm). https://economy-finance.ec.europa.eu/euro/euro-coins-and-notes/euro-coins/common-sides-euro-coins_en
│ research/wiki/foundations/dydis-ir-skaicius.md
│ @@ -17,7 +17,7 @@
│
│  **Kiekis ir dydis laimi prieš vertę.** Edmunds ir Whitehurst (1973) tyrė 80 vaikų nuo 2 iki 8 metų. Klausiami, kuri moneta „daugiau“, vaikai rinkosi **didesnę**, ne vertesnę; toks pasirinkimas išliko iki septynerių metų, nors santykinės vertės supratimas ėmė ryškėti apie šešerius. Tai reiškia, kad pirmoje klasėje dydžio strategija dar gyva, o ne užmarštyje.
│
│ -**Vertė susidaro pakopomis.** Berti ir Bombi (1981), kas dvylika mėnesių kartodami tyrimą su 80 vaikų (3–8 m.), aprašė šešias pakopas. Pirmosiose vaikas pinigus skiria pagal **fizinį dydį arba pavadinimą**; tiksli vertės ir kainos atitiktis atsiranda tik penktoje pakopoje, ir tik po to, kai vaikas jau supranta, jog mokėti reikia sumą, ne mažesnę už kainą. Kitaip tariant, vertė nėra vienas aktas — ji statoma iš kelių supratimų, o dydžio strategija yra ankstesnė, ne klaidinga atrama.
│ +**Vertė susidaro pakopomis.** Berti ir Bombi (1981), kas dvylika mėnesių kartodami tyrimą su 80 vaikų (3–8 m.), aprašė šešias pakopas. Pirmosiose vaikas pinigus skiria pagal **fizinį dydį arba pavadinimą**; tiksli vertės ir kainos atitiktis atsiranda tik penktoje pakopoje, ir tik po to, kai vaikas jau supranta, jog mokėti reikia sumą, ne mažesnę už kainą. Kitaip tariant, vertė nėra vienas aktas — ji statoma iš kelių supratimų, o dydžio strategija yra ankstesnė, ne klaidinga atrama. Savo rezultatus autoriai palygino su Strauss (1952), kuris panašias atsakymų pakopas buvo aprašęs kitos šalies vaikams.
│
│  **Sąsaja išlieka automatiška.** Hasegawa (2020) parodė dydžio ir vertės suderinamumo efektą: kai mažesnės vertės moneta pavaizduota didesnė, sprendimas apie dydį tampa lėtesnis ir klaidingesnis, nors dalyviai prieš tai laikė tikras monetas. Dydis ir vertė nėra du nepriklausomi kanalai — jie susijungia prieš sąmoningą samprotavimą.
│
│ research/wiki/grades/01/metodai.md
│ @@ -144,7 +144,7 @@
│
│  **Viena didelė idėja.** Monetos vertė yra ant jos parašytas skaičius. Pinigų suma — tų skaičių suma. Nei monetų dydis, nei monetų skaičius sumos nepasako.
│
│ -**Kodėl modelis, o ne sakinys.** Šešeriamečiai vertę skaito iš to, ką mato: didesnė moneta atrodo vertingesnė, daugiau monetų — daugiau pinigų. Whitehurst ir Edmunds (1973) tyrė 80 vaikų nuo 2 iki 8 metų: sąvokai „daugiau“ vaikai naudojo monetos **dydį**, o ne vertę, ir toks pasirinkimas išliko iki septynerių metų, nors santykinės vertės supratimas ėmė ryškėti apie šešerius. Berti ir Bombi (1981), kas 12 mėnesių kartodami tyrimą su 80 vaikų (3–8 m.), aprašė šešias pakopas: pirmosiose vaikas pinigus skiria pagal **fizinį dydį ar pavadinimą**, o tiksli vertės ir kainos atitiktis susidaro tik penktoje pakopoje — po to, kai vaikas jau žino, kad mokėti reikia sumą, kuri ne mažesnė už kainą. Ši sąsaja nedingsta ir vėliau: Hasegawa (2020) eksperimentuose dalyviai apie monetos dydį sprendė lėčiau ir klysdavo dažniau, kai mažesnės vertės moneta buvo pavaizduota didesnė — „didesnis yra daugiau“ veikia automatiškai, net kai žmogus prieš tai laikė tikras monetas. Todėl raginimas „žiūrėk į skaičių“ konkuruoja su tuo, ką vaikas mato, ir pralaimi. Reikia modelio, kuriame **vertė atsiskiria nuo dydžio fiziškai**: mažesnė moneta gali pripildyti daugiau juostos, o kelios monetos — mažiau.
│ +**Kodėl modelis, o ne sakinys.** Šešeriamečiai vertę skaito iš to, ką mato: didesnė moneta atrodo vertingesnė, daugiau monetų — daugiau pinigų. Whitehurst ir Edmunds (1973) tyrė 80 vaikų nuo 2 iki 8 metų: sąvokai „daugiau“ vaikai naudojo monetos **dydį**, o ne vertę, ir toks pasirinkimas išliko iki septynerių metų, nors santykinės vertės supratimas ėmė ryškėti apie šešerius. Berti ir Bombi (1981), kas 12 mėnesių kartodami tyrimą su 80 vaikų (3–8 m.), aprašė šešias pakopas: pirmosiose vaikas pinigus skiria pagal **fizinį dydį ar pavadinimą**, o tiksli vertės ir kainos atitiktis susidaro tik penktoje pakopoje — po to, kai vaikas jau žino, kad mokėti reikia sumą, kuri ne mažesnė už kainą. Savo rezultatus autoriai palygino su Strauss (1952) gautais atsakymais kitos šalies vaikams — pakopos pasikartojo. Ši sąsaja nedingsta ir vėliau: Hasegawa (2020) eksperimentuose dalyviai apie monetos dydį sprendė lėčiau ir klysdavo dažniau, kai mažesnės vertės moneta buvo pavaizduota didesnė — „didesnis yra daugiau“ veikia automatiškai, net kai žmogus prieš tai laikė tikras monetas. Todėl raginimas „žiūrėk į skaičių“ konkuruoja su tuo, ką vaikas mato, ir pralaimi. Reikia modelio, kuriame **vertė atsiskiria nuo dydžio fiziškai**: mažesnė moneta gali pripildyti daugiau juostos, o kelios monetos — mažiau.
│
│  **Klaidingos nuostatos ir kaip jos paneigiamos.**
│
│ research/wiki/grades/01/metodai.md
│ @@ -144,7 +144,7 @@
│
│  **Viena didelė idėja.** Monetos vertė yra ant jos parašytas skaičius. Pinigų suma — tų skaičių suma. Nei monetų dydis, nei monetų skaičius sumos nepasako.
│
│ -**Kodėl modelis, o ne sakinys.** Šešeriamečiai vertę skaito iš to, ką mato: didesnė moneta atrodo vertingesnė, daugiau monetų — daugiau pinigų. Whitehurst ir Edmunds (1973) tyrė 80 vaikų nuo 2 iki 8 metų: sąvokai „daugiau“ vaikai naudojo monetos **dydį**, o ne vertę, ir toks pasirinkimas išliko iki septynerių metų, nors santykinės vertės supratimas ėmė ryškėti apie šešerius. Berti ir Bombi (1981), kas 12 mėnesių kartodami tyrimą su 80 vaikų (3–8 m.), aprašė šešias pakopas: pirmosiose vaikas pinigus skiria pagal **fizinį dydį ar pavadinimą**, o tiksli vertės ir kainos atitiktis susidaro tik penktoje pakopoje — po to, kai vaikas jau žino, kad mokėti reikia sumą, kuri ne mažesnė už kainą. Savo rezultatus autoriai palygino su Strauss (1952) gautais atsakymais kitos šalies vaikams — pakopos pasikartojo. Ši sąsaja nedingsta ir vėliau: Hasegawa (2020) eksperimentuose dalyviai apie monetos dydį sprendė lėčiau ir klysdavo dažniau, kai mažesnės vertės moneta buvo pavaizduota didesnė — „didesnis yra daugiau“ veikia automatiškai, net kai žmogus prieš tai laikė tikras monetas. Todėl raginimas „žiūrėk į skaičių“ konkuruoja su tuo, ką vaikas mato, ir pralaimi. Reikia modelio, kuriame **vertė atsiskiria nuo dydžio fiziškai**: mažesnė moneta gali pripildyti daugiau juostos, o kelios monetos — mažiau.
│ +**Kodėl modelis, o ne sakinys.** Šešeriamečiai vertę skaito iš to, ką mato: didesnė moneta atrodo vertingesnė, daugiau monetų — daugiau pinigų. Edmunds ir Whitehurst (1973) tyrė 80 vaikų nuo 2 iki 8 metų: sąvokai „daugiau“ vaikai naudojo monetos **dydį**, o ne vertę, ir toks pasirinkimas išliko iki septynerių metų, nors santykinės vertės supratimas ėmė ryškėti apie šešerius. Berti ir Bombi (1981), kas 12 mėnesių kartodami tyrimą su 80 vaikų (3–8 m.), aprašė šešias pakopas: pirmosiose vaikas pinigus skiria pagal **fizinį dydį ar pavadinimą**, o tiksli vertės ir kainos atitiktis susidaro tik penktoje pakopoje — po to, kai vaikas jau žino, kad mokėti reikia sumą, kuri ne mažesnė už kainą. Savo rezultatus autoriai palygino su Strauss (1952) gautais atsakymais kitos šalies vaikams — pakopos pasikartojo. Ši sąsaja nedingsta ir vėliau: Hasegawa (2020) eksperimentuose dalyviai apie monetos dydį sprendė lėčiau ir klysdavo dažniau, kai mažesnės vertės moneta buvo pavaizduota didesnė — „didesnis yra daugiau“ veikia automatiškai, net kai žmogus prieš tai laikė tikras monetas. Todėl raginimas „žiūrėk į skaičių“ konkuruoja su tuo, ką vaikas mato, ir pralaimi. Reikia modelio, kuriame **vertė atsiskiria nuo dydžio fiziškai**: mažesnė moneta gali pripildyti daugiau juostos, o kelios monetos — mažiau.
│
│  **Klaidingos nuostatos ir kaip jos paneigiamos.**
│
│ research/wiki/foundations/README.md
│ @@ -11,6 +11,7 @@
│  | [[simuliacijos-ir-modeliai]] | PhET, konkretybės nykimas, produktyvi nesėkmė | veiksmas prieš paaiškinimą, modelio ribos pasakomos |
│  | [[interaktyvumo-principai]] | UI 6–7 metų vaikams, taikiniai, grįžtamasis ryšys | ≥48 px, jokių laikmačių, klaida ne aklavietė |
│  | [[zenklas-kaip-busena]] | lygybės ženklas kaip būsena, operaciniai šablonai, modelio išdėstymas | modelis rodo abi lygybės kryptis ir bent vieną atvejį be vieno skaičiaus pusėje |
│ +| [[dydis-ir-skaicius]] | dydis ir kiekis prieš užrašytą vertę, moneta kaip pavyzdys | jei daiktas neša skaičių, modelis parodo jo poveikį atskirai; grafika neprieštarauja taisyklei |
│  | [[ivertinimas-ir-growth-mindset]] | grįžtamasis ryšys, augimo mąstysena ir jos ribos | `hint` + `why` privalomi, jokių balų |
│
│  ## Žaidimų teorijos dalis
│ research/wiki/guidelines/pilotai.md
│ @@ -71,3 +71,12 @@
│  - **Kaip matuojame:** dviejų žingsnių (modulio pabaiga → kitas modulis) paspaudimų skaičius — dabar 1, anksčiau 2–3; dalis vaikų, kurie per tą pačią sesiją atsidaro kitą modulį tame pačiame kelyje; klausimas mokytojui, ar vaikui reikėjo priminti, kur eiti toliau. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
│  - **Rezultatas:** dar nėra. Techninė patikra: `validate_content.py` 0/0, `check_ui.py` 0/0, 0 konsolės klaidų 5 maršrutuose, 0 px horizontalaus slinkimo ties 360/414/768/1024/1440 px, visų 15 modulių kito žingsnio adresas sutampa su `path.json`, per mažų taikinių puslapyje liko 2 (abu — licencijų nuorodos sakinyje).
│  - **Sprendimas:** laukiama duomenų. Jei vaikai vis tiek grįžta į temų sąrašą, o ne spaudžia „Toliau“, kortelė keliama aukščiau (virš „Pasitikrink“), o ne dauginamos nuorodos.
│ +
│ +### P-008 — Pinigai: vertė juostoje, monetų skaičius atskirai
│ +
│ +- **Data:** 2026-11-06
│ +- **Hipotezė:** jei monetos vertė modelio ekrane atsiskiria nuo jos išvaizdos (juosta, kuri ilgėja pagal užrašytą skaičių, ir atskira eilutė „Monetų: N“), tai daugiau pirmokų sumą skaičiuoja iš verčių, o ne renkasi didžiausią ar daugiausiai monetų, nes 6–8 metų vaikai vertę linkę spręsti pagal matomą dydį ir kiekį, o ši strategija išlieka bent iki septynerių metų (Edmunds ir Whitehurst, 1973; Berti ir Bombi, 1981; `research/wiki/foundations/dydis-ir-skaicius.md`).
│ +- **Ką keičiame:** pirmoji simuliacija, kurioje monetos piešiamos **tikru santykiu** (5 c moneta didesnė už 10 c, nors verta perpus mažiau), o lėkštėje — sąmoningai vienodo 28 px dydžio; pirmas atvejis, kai modelis atvirai pasako, jog realus dydžio skirtumas ekrane per mažas (apie 2 px), todėl jį įvardija tekstas ir juosta, o ne akių matas. Modulis `14-pinigai`, komponentas `pinigine-ir-kaina`.
│ +- **Kaip matuojame:** (1) kiek kartų vaikas pirmame bandyme ima didžiausią monetą, kai ji nėra vertingiausia; (2) ar perkėlimo užduotyje (du rinkiniai, ta pati suma, skirtingas monetų skaičius) atsako „tiek pat“; (3) ar refleksijoje vaikas nurodo užrašytą skaičių, o ne dydį. Duomenys nerenkami automatiškai — tik savanoriškas mokytojo stebėjimas.
│ +- **Rezultatas:** dar nėra.
│ +- **Sprendimas:** laukiama duomenų. Jei vaikai vis tiek renkasi didesnę monetą, stiprinamas tekstas ir garso frazė, o monetų dydis ekrane **nedidinamas** — grafika neturi meluoti apie tai, ką modelis teigia.
│ research/wiki/changelog.md
│ @@ -1,6 +1,15 @@
│  # Changelog
│
│  Kiekvienas žinių bazės pakeitimas — vienas įrašas. Naujausi viršuje. Formatas: data · failas · kas pasikeitė · kodėl.
│ +
│ +## 2026-11-06 — Pinigų metodas M-03
│ +
│ +- **`grades/01/metodai.md`** — naujas metodas M-03 „Pinigai: monetos vertė, ne jos dydis“ (tema `2026-11-03-ideator-pinigai.json`): seka nuo saujos iki simbolio, simuliacijos `pinigine-ir-kaina` šešios būsenos, keturios užduotys su tipinėmis klaidomis ir užuominomis, modelio ribos.
│ +- **`foundations/dydis-ir-skaicius.md`** — naujas įrašas: kai daiktas turi ir matomą dydį, ir užrašytą skaičių, vaikas iki septynerių metų tiki dydžiu; todėl modelis turi parodyti skaičiaus poveikį atskirai, o jo grafika neturi prieštarauti savo pačių taisyklei.
│ +- **`foundations/README.md`** — indekso eilutė.
│ +- **`guidelines/pilotai.md`** — P-008 (vertė juostoje, monetų skaičius atskirai, tikras monetų dydis ekrane).
│ +- **Šaltinis:** Berti & Bombi (1981) https://doi.org/10.2307/1129504 · Strauss (1952) https://doi.org/10.2307/2088073 · Hasegawa (2020) https://doi.org/10.1038/s41598-020-62419-8 · Edmunds & Whitehurst (1973) https://eric.ed.gov/?id=ED087553 · Tracy & Fanelli (2000) https://eric.ed.gov/?id=ED451065 · Europos Komisijos monetų specifikacijos (5 c — 21,25 mm, 10 c — 19,75 mm).
│ +- **Poveikis platformai:** būsimas modulis `14-pinigai`; taisyklė „daiktas su skaičiumi reikalauja atskiro poveikio vaizdo“ taikoma ir kitiems modeliams, kur vertė užrašyta, o ne išmatuojama (moneta, kauliukas, padalos žymė).
│
│  ## 2026-11-05 (16:30) — Dienos darbas #16–#22: parašytas, bet nepaskelbtas
│
│ agents/proposals/2026-11-06-metodininkas-pinigai.json
│ @@ -0,0 +1,25 @@
│ +{
│ +  "role": "metodininkas",
│ +  "run_id": 26,
│ +  "created": "2026-11-06T08:31:00+02:00",
│ +  "type": "metodas",
│ +  "title": "Pinigai: monetos vertė, ne jos dydis",
│ +  "body": "1 klasės programa prašo atpažinti euro monetas pagal vertę ir sudėti sumą keliais skirtingais deriniais, o tyrimai rodo, kad 6–7 metų vaikas vertę skaito iš matomo požymio: didesnė moneta atrodo vertingesnė, daugiau monetų — daugiau pinigų (Edmunds ir Whitehurst, 1973; Berti ir Bombi, 1981). Metodas M-03 tai griauja modeliu, kuriame vertė atsiskiria nuo išvaizdos fiziškai: piniginėje keturios monetos (50, 20, 10, 5 c) nupieštos tikru santykiu, vaikas deda jas ant lėkštės, o kainos juosta ilgėja pagal užrašytą skaičių — 5 c moneta lieka didesnė už 10 c, bet juosta trumpesnė. Monetų skaičius („Monetų: 2“) ir suma („Suma: 60 c“) rodomi atskirose eilutėse ir niekada nesujungiami, o eilutė 50 c + 10 c = 60 c atsiranda tik tada, kai juosta pasiekia kainos žymą. Prieš pirmą judesį vaikas spėja, kiek monetų prireiks, nes modelis pats suskaičiuoja sumą ir be spėjimo taptų generatoriumi. Užduotys tikrina atpažinimą (trys monetos — kiek pinigų), taikymą (kuris rinkinys duoda 60 c tiksliai), perkėlimą (du rinkiniai už tą pačią 80 c kainą) ir praplėtimą (95 c mažiausiai monetų). Modelis sąmoningai apsiriboja monetomis iki 1 euro, o realų 1,5 mm dydžio skirtumą įvardija tekstu, nes ekrane jis yra apie 2 px — modelis neturi apsimesti, kad parodo tai, ko neparodo. Visa specifikacija su būsenomis, 360 px geometrija, garso frazėmis ir modelio ribomis — research/wiki/grades/01/metodai.md, skyrius M-03.",
│ +  "target": "content/lt/grade-01/matematika/14-pinigai.json",
│ +  "priority": "high",
│ +  "status": "new",
│ +  "evidence": [
│ +    "research/wiki/grades/01/metodai.md#M-03 — pilnas metodas: keturių žingsnių seka, šešios simuliacijos būsenos, keturios užduotys su tipinėmis klaidomis ir užuominomis, modelio ribos, modulio autoriaus parametrai",
│ +    "research/wiki/foundations/dydis-ir-skaicius.md — bendresnė įžvalga: kai daiktas neša skaičių, modelis turi parodyti jo poveikį atskirai, o grafika neturi prieštarauti taisyklei",
│ +    "research/wiki/curriculum/matematika-1-klase.md:83 — „1 klasė. Finansinis raštingumas. Mokomasi atpažinti euro banknotus ir monetas pagal vertę, norimą pinigų sumą sudėlioti keliais skirtingais banknotų ir monetų deriniais“",
│ +    "research/wiki/curriculum/matematika-1-klase.md:169 — metų pabaigos pasiekimas: „Atpažįsta euro banknotus ir monetas pagal vertę; sudėlioja sumą keliais deriniais“",
│ +    "sources/pradinio-bp-rekomendacijos-2024.txt:33957–33959 — pasiekimų pavyzdyje atskirai klausiama „Kiek monetų turi …?“ ir „Kiek pinigų turi …?“ — kiekis ir suma yra du klausimai",
│ +    "agents/proposals/2026-11-03-ideator-pinigai.json — ideatoriaus pasiūlymas (tema/high), kurio pagrindu sukurtas metodas",
│ +    "https://doi.org/10.2307/1129504 — Berti ir Bombi (1981): šešios pakopos, vertė skiriama pagal fizinį dydį ar pavadinimą iki penktos pakopos",
│ +    "https://doi.org/10.2307/2088073 — Strauss (1952): ankstesnis tyrimas, kurio pakopas Berti ir Bombi atkartojo kitos šalies vaikams",
│ +    "https://doi.org/10.1038/s41598-020-62419-8 — Hasegawa (2020): dydžio ir vertės suderinamumo efektas, veikiantis automatiškai",
│ +    "https://eric.ed.gov/?id=ED087553 — Edmunds ir Whitehurst (1973): 2–8 m. vaikai „daugiau“ sprendžia pagal monetos dydį; strategija išlieka iki septynerių",
│ +    "https://eric.ed.gov/?id=ED451065 — Tracy ir Fanelli (2000): tik 7 iš 35 pirmokų suskaičiavo mišrų rinkinį; žaisliniai pinigai neproporcingi vertei",
│ +    "https://economy-finance.ec.europa.eu/euro/euro-coins-and-notes/euro-coins/common-sides-euro-coins_en — 5 c moneta 21,25 mm, 10 c — 19,75 mm: 5 c didesnė, bet verta perpus mažiau"
│ +  ]
│ +}
Baigta dalis darbo — bet ne visa baigties sąlyga. Štai tikslus būklės vaizdas.

## Kas padaryta

**Pasirinkimas.** Ėmiau seniausią `new` `high` temą, kuriai dar nebuvo metodo: **#3 „Pinigai: vertė yra skaičius, ne dydis“** (`agents/proposals/2026-11-03-ideator-pinigai.json`, 2026-11-03T16:58). #1 laikas jau turi M-01 ir modulį, kiti `high` palikti.

**Metodas M-03 „Pinigai: monetos vertė, ne jos dydis“** (`research/wiki/grades/01/metodai.md`, įrašytas, antraštė `atnaujinta: 2026-11-06`):
- viena idėja: vertė — ant monetos parašytas skaičius, suma — tų skaičių suma; nei dydis, nei monetų skaičius sumos nepasako;
- 4 žingsnių seka (sauja → ekranas → simbolis → perkėlimas) su kiekvieno tikslu;
- simuliacija `pinigine-ir-kaina`, `config {price:60, coins:[50,20,10,5]}`, 6 būsenos su `readout`/`api.note`, juosta 3,2 px/c (100 c = 320 px iš 328), monetos tikru santykiu (50 c ≈ 45 px, 10 c ≈ 36,5, 5 c ≈ 39), lėkštėje vienodo 28 px, 20 monetų talpa, klaviatūra, `prefers-reduced-motion`, 5 garso frazės, `api.progress` vieną kartą;
- privalomas spėjimo žingsnis prieš pirmą judesį (kad modelis netaptų generatoriumi);
- 4 užduotys (indeksai 2, 0, 2, 1) su tipine klaida ir užuomina į klaidą;
- modelio ribos: tik monetos iki 1 €, banknotai — mokytojo veikla, modelis pats skaičiuoja sumą, 1,5 mm skirtumas ekrane ≈ 2 px, todėl jį įvardija tekstas ir juosta.

**Klaidingos nuostatos ir paneigimas.** 5 c moneta (21,25 mm) didesnė už 10 c (19,75 mm), bet verta perpus mažiau — realus euro atvejis, ne iliustracija; „daugiau monetų“ paneigiama tuo, kad `Monetų:` ir `Suma:` rodomi atskirai ir ta pati suma surenkama skirtingu monetų skaičiumi.

**Kiti failai:** `foundations/dydis-ir-skaicius.md` (naujas įrašas), `foundations/README.md` (indekso eilutė), `guidelines/pilotai.md` (P-008), `changelog.md` (2026-11-06 įrašas), `agents/proposals/2026-11-06-metodininkas-pinigai.json` (type `metodas`, validus JSON).

**Šaltiniai patikrinti per Crossref / ERIC / EK:** Berti & Bombi 1981, DOI 10.2307/1129504 · Strauss 1952, 10.2307/2088073 · Hasegawa 2020, 10.1038/s41598-020-62419-8 · Edmunds & Whitehurst 1973, ERIC ED087553 · Tracy & Fanelli 2000, ERIC ED451065 · EK monetų specifikacijos.

## Kas liko

1. **`agents/log/metodininkas-2026-11-06T0827.md`** — neįrašytas.
2. **`agents/state.json`** — metodininko `last_run`/`status: ok`/`log` ir `last_method_work` blokas neatnaujinti.
3. **Validatorius po pakeitimų nepaleistas** — prieš rašant buvo 0 klaidų, 0 įspėjimų; mano failai yra `research/wiki/` ir `agents/proposals/`, kurių validatorius neliečia, bet tai reikia patvirtinti, ne preziumuoti.

Darbinis medis jau buvo nešvarus iki manęs (`#272` publikavimo blokada — ne mano sritis); mano įrašai jį papildė, bet `run.py` komituoja tik šio paleidimo failus.

## klaidos

```
session_id: local-06ba17d6ae381b47151ae0eafbc150dd4d34fa474001a60b4833d1f43fc27e5d
```
