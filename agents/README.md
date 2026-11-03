# Agentai

Dvylika agentų, kurie nuolat vysto SUPRASK. Kiekvienas paleidimas — vienas vaidmuo, vienas įrašas `agents/runs.db`, vienas žurnalas `agents/log/`.

## Ciklas

```
tikrintojas 06:40 ─┐
tyrejas     07:00 ─┤
ideator     07:10 ─┼─► metodininkas 08:20 ─► kurejas 09:30 ─┐
                   │                                        ├─► kritikas 14:00 ─► leidejas 16:30
sim. inž.   11:00 ─┘        dizaineris II/IV/VI 12:30 ───────┘
programos derintojas I/IV 15:00 · inspektorius Thu 06:50 · kuratorius Sun 18:00
```

**Kas kuria — nevertina. Kas vertina — neleidžia. Kas leidžia — nekuria.**

## Vaidmenys

| Vaidmuo | Profilis | Ką daro | Išėjimas |
|---|---|---|---|
| `tikrintojas` | deepseek41flash | validatorius, nuorodos, registras | ataskaita, issue |
| `tyrejas` | deepseek41flash | tyrimai ir metodai | wiki įrašai |
| `ideator` | deepseek41flash | naujos pamokų idėjos | 1–3 pasiūlymai |
| `metodininkas` | deepseek41flash | metodo ir simuliacijos scenarijus | metodo pasiūlymas |
| `kurejas` | deepseek41flash | modulio kūrimas | PR |
| `simuliaciju-inzinierius` | deepseek41flash | simuliacijų kūrimas | PR |
| `dizaineris` | deepseek41flash | struktūra (`path.json`), sąsaja | PR + pilotas |
| `kritikas` | deepseekv4flashlatest | nepriklausoma kritika | kritika, blokavimai |
| `programos-derintojas` | deepseek41flash | atitiktis programai | atitikties pasiūlymai |
| `leidejas` | deepseek41flash | PR sujungimas | sujungti PR |
| `sveikatos-inspektorius` | deepseek41flash | gyvos svetainės patikra | ataskaita |
| `kuratorius` | deepseek41flash | savaitės suvestinė | suvestinė |

Profilius galima keisti `agents/run.py` `ROLES` lentelėje. Jei provideris atmeta raktą (401/429), bėgiklis automatiškai bando `SUPRASK_FALLBACK_PROFILE` (numatyta `deepseek41flash`).

## Rankinis paleidimas

```bash
python3 agents/run.py kritikas                 # pilnas paleidimas
python3 agents/run.py ideator --dry-run        # tik prompto peržiūra
python3 agents/run.py kurejas --trigger dashboard
```

Kiekvienas paleidimas:

1. surenka promptą iš `roles/<vaidmuo>.md`, `agents/state.json`, DB istorijos ir atvirų pasiūlymų;
2. paleidžia `hermes -p <profilis> chat --query-file … -t terminal,file,web`;
3. įrašo žurnalą, DB įrašą (statusas, trukmė, pakeisti failai), atnaujina `state.json`;
4. suindexuoja `agents/proposals/*.json` į DB.

Užraktas (`agents/.run.lock`) neleidžia dviem agentams dirbti vienu metu.

## Pasiūlymai

Vaidmenys, kurie neturi teisės keisti turinio (ideator, metodininkas, kritikas, programos derintojas), rašo JSON į `agents/proposals/`:

```json
{
  "role": "ideator",
  "run_id": 12,
  "type": "tema",
  "title": "Pinigai: kiek kainuoja?",
  "body": "…",
  "target": "content/lt/grade-01/matematika/",
  "priority": "high",
  "status": "new",
  "evidence": ["research/wiki/curriculum/matematika-1-klase.md"]
}
```

Kritikas gali blokuoti PR: `agents/proposals/blocks/pr-<n>.json`. `leidejas` tokio PR nesujungs.

## Grafikas (systemd --user)

Timeriai generuojami iš `agents/run.py`, kad niekada neišsiderintų:

```bash
python3 deploy/gen_timers.py --install
systemctl --user list-timers 'suprask*'
```

## Stebėjimas

Vidinis dashboard: `http://zoltanas.tail4bbf34.ts.net:9410/` — paleidimų istorija, grafikas, pasiūlymai, turinio statistika. Žr. [`../dashboard/README.md`](../dashboard/README.md).

## Taisyklės agentams

- Visi agentai privalo laikytis `docs/SVIETIMAS-1-GAIRES.md`. Prieštaraujantis turinys atmetamas.
- `kurejas` ir `simuliaciju-inzinierius` niekada necommitina į `main` — tik PR.
- `kritikas` nieko netaiso — tik fiksuoja ir blokuoja.
- `leidejas` neautorius: sujungia tik tai, kas praėjo validatorius ir neturi blokų.
- Joks agentas nerenka asmens duomenų ir nenaudoja mokamų paslaugų.
- Kiekvienas paleidimas palieka pėdsaką: žurnalas + DB įrašas.
