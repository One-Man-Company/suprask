---
title: "Interaktyvumo principai 6–7 metų vaikams"
tipas: fundamentai
temos: [UI, prieinamumas, lietimo taikiniai, grįžtamasis ryšys, klaidos]
amzius: "6-7"
atnaujinta: 2026-11-03
saltiniai: 3
---

# Interaktyvumo principai 6–7 metų vaikams

## Kodėl suaugusiųjų UI taisyklės netinka

Vaikas, kuris dar nemoka sklandžiai skaityti, negali pasikliauti tekstine navigacija. Jis negali tiksliai spustelėti mažo taikinio, nesmagu laukti, ir nesupranta, kad „X“ kampe reiškia „uždaryti“. Todėl sąsaja turi būti kuriama ne „supaprastinus“ suaugusiųjų versiją, o iš naujo pagal vaiko galimybes.

## Taisyklės, kurių laikomės

**1. Vienas akivaizdus veiksmas ekrane.** Vaikas neturi rinktis iš penkių mygtukų, kuris dabar svarbiausias.

**2. Taikinys ≥ 48 × 48 px.** Ne dėl estetikos — dėl to, kad vaiko pirštas netikslus, o smulkioji motorika dar formuojasi. Visi platformos mygtukai atitinka šį minimumą.

**3. Niekada nebaudžiama už netikslumą.** Netinkamas taikinys ne „išjungia“ žaidimo, neima gyvybės, nepraranda pažangos.

**4. Grįžtamasis ryšys per 100–200 ms.** Jei vaikas nepamato reakcijos iš karto, jis spaudžia dar kartą ir praranda ryšį tarp veiksmo ir pasekmės. Todėl simuliacijos atsako iškart, be animacijos „įžangos“.

**5. Garsas visada gali būti išjungtas.** Garsas padeda, bet klasėje gali trukdyti. Mygtukas `🔊` yra visose simuliacijose ir išsisaugo.

**6. Tekstas — ne vienintelis informacijos nešėjas.** Spalva + forma + padėtis + garsas. Spalva niekada nėra vienintelis skirtumas (prieinamumas neregiams ir daltonikams).

**7. Klaida — ne aklavietė.** Po neteisingo atsakymo atsiranda paaiškinimas ir galimybė bandyti dar kartą, ne „teisingas atsakymas“.

**8. Jokių laikmačių ir skaičiuojamų bandymų.** Vaikas turi tiek laiko, kiek jam reikia.

**9. Tėvų/mokytojų informacija atskirta.** Vaikui rodoma 1–2 sakiniai; suaugusiajam — tikslas, klaidos, veikla be ekrano.

**10. Veikia be interneto, kai įkelta.** Jokio „kraunama…“ tarp veiksmų.

## Ką rodo tyrimai apie vaikų ir ekranų sąveiką

- Vaikai mokosi geriau iš **aktyvios** sąveikos nei iš pasyvaus žiūrėjimo; pasyvus video su ta pačia medžiaga duoda mažesnį prieaugį.
- Per didelis stimulių kiekis (garsai, animacijos, taškai) mažina mokymosi efektą, nors vaikams atrodo „įdomiau“.
- Grįžtamasis ryšys, paaiškinantis **kodėl**, veiksmingesnis už „teisingai / neteisingai“, ypač pradedantiesiems.

## Ką tai reiškia SUPRASK platformai

1. Simuliacijų mygtukai naudoja `.btn` klasę su `min-height: 48px`; ikonos — 52 px.
2. Kiekviena simuliacija turi `api.readout` (didelis tekstas) ir `api.note` (vienas paaiškinimas), ne daugiau.
3. Klaida visada grąžina **užuominą**, o ne atsakymą; teisingas variantas neatskleidžiamas automatiškai.
4. Nėra laikmačių, gyvybių, „streak“ skaitiklių — validatorius tikrina draudžiamus žodžius.
5. Visi interaktyvūs elementai turi `aria-label`; SVG figūros — `role="img"` su aprašu.
6. `prefers-reduced-motion` išjungia visas animacijas.

## Susieti

- [[kognityvine-apkrova]] — kodėl mažiau elementų geriau
- [[vizualus-mokymasis]] — vaizdo ir teksto santykis
- [[ivertinimas-ir-growth-mindset]] — grįžtamojo ryšio formuluotės

## Šaltiniai

1. Mayer, R. E. (2014). *The Cambridge Handbook of Multimedia Learning* (2nd ed.). Cambridge University Press. https://doi.org/10.1017/CBO9781139547369
2. Hirsh-Pasek, K., et al. (2015). Putting education in "educational" apps: Lessons from the science of learning. *Psychological Science in the Public Interest, 16*(1), 3–34. https://doi.org/10.1177/1529100615569721
3. Wouters, P., van Nimwegen, C., van Oostendorp, H., & van der Spek, E. D. (2013). A meta-analysis of the cognitive and motivational effects of serious games. *Journal of Educational Psychology, 105*(2), 249–265. https://doi.org/10.1037/a0031311
