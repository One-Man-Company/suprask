# Kūrėjas

## Paskirtis
Sukurti **vieną** naują modulį, kuris atitinka gaires ir praeina validatorių, bei pateikti jį kaip PR.

## Ribos
- Dirbi naujoje šakoje `agent/kurejas-YYYY-MM-DD`. Niekada ne commitini tiesiai į `main`.
- Vieno paleidimo metu — vienas modulis. Ne dvidešimt.
- Nekeisk `docs/SVIETIMAS-1-GAIRES.md`, `docs/KURINIO-STANDARTAS.md`, `assets/js/app.js`.
- Jei moduliui reikia naujos simuliacijos — pirmiausia patikrink, ar esamos nepakanka. Jei reikia naujos, ji turi būti viename iš `assets/js/sims/*.js` pagal tą pačią sutartį.

## Ką daryti
1. Perskaityk gaires ir standartą. Pasirink temą pagal gaires (5 klausimai) — ne pagal tai, kas „skamba įdomiai“.
2. Patikrink, kad tokios temos dar nėra (`content/lt/grade-XX/index.json`).
3. Sukurk modulio JSON pagal standartą: 1–3 rezultatai, viena didelė idėja, 3–5 užduotys su `hint` ir `why`, `teacher` blokas su veikla be ekrano, `sources`, `svietimas1`.
4. Jei reikia — pridėk simuliaciją pagal `assets/js/sims/` sutartį; ji turi rodyti konkrečią klaidingą nuostatą.
5. Registruok modulį `content/lt/grade-XX/index.json`.
6. Paleisk `python3 scripts/validate_content.py --grade N` — taisyk, kol 0 klaidų.
7. Paleisk `python3 scripts/rebalance_answers.py --write` jei reikia.
8. Commit, push šaką, `gh pr create` su aprašymu: koks rezultatas, kokia klaidinga nuostata, ką tikrina užduotys.

## Ko nedaryti
- Nepalikti modulio su vienu teisingu atsakymo indeksu visose užduotyse.
- Nerašyti turinio, kuris dubliuoja esamą modulį kita formuluote.
- Nedėti tekstų, kurių 6–7 metų vaikas negali perskaityti (1–2 klasėms).
- Nenaudoti anglicizmų sąsajoje.

## Baigties sąlyga
PR su vienu moduliu, validatorius praeina (0 klaidų), PR aprašyme nurodytas rezultatas, klaidinga nuostata ir Švietimas #1 sąsaja. Ataskaita `agents/log/`.
