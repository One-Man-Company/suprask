# Agentai

Penki agentai, kurie nuolat prižiūri SUPRASK: tiria, kuria, tikrina, stebi ir apibendrina. Jie dirba pagal grafiką per `systemd --user` timerius ir paleidžiami per `agents/run.py`, kuris kiekvieną užduotį perduoda Hermes profiliui su konkrečiu vaidmens promptu.

## Vaidmenys

| Vaidmuo | Kada | Profilis | Ką daro |
|---|---|---|---|
| `tyrejas` | pirmadienis 07:00 | deepseekpro | ieško patikimų tyrimų, papildo `research/wiki/` |
| `kurejas` | antradienis 07:30 | deepseekpro | kuria vieną modulį, atidaro PR |
| `tikrintojas` | kasdien 06:40 | deepseek41flash | validatorius, nuorodos, issue |
| `sveikatos-inspektorius` | ketvirtadienis 06:50 | deepseek41flash | gyvos svetainės patikra |
| `kuratorius` | sekmadienis 18:00 | deepseek41flash | savaitės suvestinė, changelog |

## Rankinis paleidimas

```bash
python3 agents/run.py kuratorius            # pilnas paleidimas
python3 agents/run.py tyrejas --dry-run    # tik prompto peržiūra
```

Kiekvienas paleidimas:

1. surenka promptą iš `roles/<vaidmuo>.md`, `agents/state.json` ir paskutinės ataskaitos;
2. paleidžia `hermes -p <profilis> chat --query-file … -t terminal,file,web`;
3. įrašo ataskaitą į `agents/log/<vaidmuo>-<data>.md`;
4. atnaujina `agents/state.json`.

Užraktas (`agents/.run.lock`) neleidžia dviem agentams dirbti vienu metu.

## Grafikas (systemd --user)

| Unit | Turinis |
|---|---|
| `suprask-tyrejas.timer` | `Mon *-*-* 07:00` |
| `suprask-kurejas.timer` | `Tue *-*-* 07:30` |
| `suprask-tikrintojas.timer` | `*-*-* 06:40` |
| `suprask-inspektorius.timer` | `Thu *-*-* 06:50` |
| `suprask-kuratorius.timer` | `Sun *-*-* 18:00` |

Įdiegimas:

```bash
cp deploy/systemd/*.service deploy/systemd/*.timer ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now suprask-tikrintojas.timer suprask-tyrejas.timer \
  suprask-kurejas.timer suprask-inspektorius.timer suprask-kuratorius.timer
```

## Taisyklės agentams

- Visi agentai privalo laikytis `docs/SVIETIMAS-1-GAIRES.md`. Prieštaraujantis turinys atmetamas.
- `kurejas` niekada necommitina į `main` — tik PR.
- `tikrintojas` netaiso pedagoginių sprendimų — tik technines klaidas.
- Joks agentas nerenka asmens duomenų ir nenaudoja mokamų paslaugų.
- Kiekvienas paleidimas palieka pėdsaką: žurnalas + `state.json`.
