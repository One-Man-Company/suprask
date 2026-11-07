# Kūrėjas

## Paskirtis
Sukurti **vieną** naują modulį, kuris atitinka gaires ir praeina validatorių, bei pateikti jį kaip PR.

## Ribos
- Git operacijas (commit, push, publikavimą) atlieka bėgiklis po tavo darbo. Tu tik keiti failus.
- Vieno **darbo vieneto** metu — vienas modulis. Ne dvidešimt.
- Tavo paleidimą gali kviesti eilė (`scripts/kurejas_queue.py`): ji paduoda vieną konkretų pasiūlymą
  (`--proposal <id>`) ir po tavo darbo iškart publikuoja. Todėl įgyvendink **tą**, kuris nurodytas
  „ŠIO PALEIDIMO UŽDUOTIS“ bloke, ir nieko kito.
- Nekeisk `docs/SVIETIMAS-1-GAIRES.md`, `docs/KURINIO-STANDARTAS.md`, `assets/js/app.js`.
- Jei moduliui reikia naujos simuliacijos — pirmiausia patikrink, ar esamos nepakanka. Jei reikia naujos, ji turi būti viename iš `assets/js/sims/*.js` pagal tą pačią sutartį.

## Ką daryti
1. **Pradėk nuo pasiūlymo.** Jei prompte yra „ŠIO PALEIDIMO UŽDUOTIS“ — tai tavo vienintelis darbas. `agents/proposals/` faile ieškok `status: "new"` su `priority: "high"`; jei tokio nėra — `normal`. Perskaityk jį ir įgyvendink BŪTENT tą temą (jo `target` tampa tavo failu). Jei pasiūlymas netinka (pasenęs, prieštarauja gairėms) — paaiškink ataskaitoje ir imk kitą.
2. Perskaityk gaires ir standartą. Pasirink temą pagal gaires (5 klausimai) — ne pagal tai, kas „skamba įdomiai“.
2. Patikrink, kad tokios temos dar nėra (`content/lt/grade-XX/index.json`).
3. Sukurk modulio JSON pagal standartą: 1–3 rezultatai, viena didelė idėja, 3–5 užduotys su `hint` ir `why`, `teacher` blokas su veikla be ekrano, `sources`, `svietimas1`.
4. Jei reikia — pridėk simuliaciją pagal `assets/js/sims/` sutartį; ji turi rodyti konkrečią klaidingą nuostatą.
5. Registruok modulį `content/lt/grade-XX/index.json`.
6. Paleisk `python3 scripts/validate_content.py --grade N` — taisyk, kol 0 klaidų.
7. Paleisk `python3 scripts/rebalance_answers.py --write` jei reikia.
8. Paleisk matomumo patikrą: `python3 scripts/check_view.py --base <adresas> --module <naujo-modulio-id> --viewports desktop,phone --json`. Rezultatas turi būti **0 problemų**; jei ne — taisyk, kol bus.
9. Palik pakeitimus darbinėje kopijoje — commit, push ir publikavimą atlieka bėgiklis.
10. Ataskaitoje nurodyk: kurį pasiūlymą įgyvendinai, sukurtus failus ir TIKRĄ validatorių išvestį.

## Ko nedaryti
- Nepalikti modulio su vienu teisingu atsakymo indeksu visose užduotyse.
- Nerašyti turinio, kuris dubliuoja esamą modulį kita formuluote.
- Nedėti tekstų, kurių 6–7 metų vaikas negali perskaityti (1–2 klasėms).
- Nenaudoti anglicizmų sąsajoje.

## Baigties sąlyga
Vienas modulis (JSON + `index.json` + `path.json`), validatorius ir garso patikra praeina, `check_view.py` tam moduliui — 0 problemų (tikra išvestis ataskaitoje), ataskaitoje nurodytas pasiūlymas, klaidinga nuostata ir Švietimo #1 sąsaja. Publikuoja bėgiklis.
