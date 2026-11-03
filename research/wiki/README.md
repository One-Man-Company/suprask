# SUPRASK žinių bazė

Tai gyvas, nuolat papildomas žinių rinkinys, kuriuo grindžiamas platformos turinys ir metodai. Jis nėra „dokumentacija“ — jis yra **sprendimų pagrindas**: kiekvienas turinio, simuliacijos ar funkcijos sprendimas turi turėti atsakymą šioje bazėje arba aiškiai pasakyti, kad joje dar nėra.

## Sandara

| Katalogas | Kas viduje |
|---|---|
| `guidelines/` | privalomos taisyklės, atviri klausimai, pilotų registras |
| `foundations/` | mokymosi mokslas: vizualus mokymasis, kognityvinė apkrova, simuliacijos, žaidimų teorija, vertinimas |
| `curriculum/` | oficialios Lietuvos programos išgryninimas pagal dalykus ir klasę |
| `grades/01` … `grades/12` | kiekvienos klasės turinio struktūra ir metodai |

## Kaip čia dirbama

1. **Šaltinis pirma.** Įrašas be patikrinto šaltinio (DOI / URL, kuris atsidaro) neegzistuoja.
2. **Kiekvienas įrašas turi pasekmę.** Skyrius „Ką tai reiškia SUPRASK platformai“ su konkrečiais sprendimais, ne apibendrinimais.
3. **Prieštaravimai fiksuojami.** Jei naujas tyrimas prieštarauja senam įrašui — rašomas prieštaravimas, o ne tyliai ištrinamas senas tekstas.
4. **Changelog privalomas.** Kiekvienas pakeitimas — `changelog.md` įraše su data ir priežastimi.
5. **Klasės atskirai.** 1 klasės atsakymai negalioja 9 klasei. Amžiaus tinkamumas tikrinamas kiekvienai klasei atskirai.

## Susieti dokumentai (ne wiki, o šaltinis tiesos)

- `docs/SVIETIMAS-1-GAIRES.md` — privalomos gairės (normatyvinis dokumentas)
- `docs/KURINIO-STANDARTAS.md` — modulio JSON specifikacija
- `docs/ARCHITEKTURA.md` — kaip veikia platforma

## Būsena

- `foundations/` — pildoma (mokymosi mokslas, žaidimų teorija)
- `curriculum/` — 1 klasė išgryninta iš oficialių dokumentų
- `grades/` — 12 klasių struktūra sukurta; 1 klasė — pilna, 2–12 — karkasas su konkrečiais reikalavimais
