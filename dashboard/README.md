# SUPRASK dashboard (vidinis)

Agentų valdymo skydas. **Ne viešas** — pasiekiamas tik per Tailscale, su HTTP Basic auth.

## Adresas

```
http://100.118.226.11:9410/
http://zoltanas.tail4bbf34.ts.net:9410/
```

Naudotojas: `admin`. Slaptažodis sugeneruojamas pirmą paleidimą ir laikomas:

```bash
cat ~/.config/suprask/dashboard.env
```

Tas failas turi `0600` teises ir į git nepatenka. Jei jo nėra — serveris sukurs naują slaptažodį.

## Ką rodo

- **Suplanuoti paleidimai** — visi 12 vaidmenų, jų dažnis, kitas ir paskutinis paleidimas (iš `systemctl --user list-timers`).
- **Paleidimų istorija** — kiekvienas paleidimas su statusu (`ok`, `partial`, `failed`, `timeout`, `skipped`), trukme, failų skaičiumi ir žurnalu.
- **Pasiūlymai** — ideatoriaus, metodininko, kritiko ir programos derintojo pasiūlymai iš `agents/proposals/`.
- **Turinio statistika** — moduliai, užduotys, simuliacijos, garso įrašai.
- **Paleisti dabar** — rankinis vaidmens paleidimas (tas pats `run.py`, tik su `--trigger dashboard`).

## Paleidimas

```bash
systemctl --user status suprask-dashboard.service
systemctl --user restart suprask-dashboard.service
journalctl --user -u suprask-dashboard -n 50
```

Rankiniu būdu (be systemd):

```bash
SUPRASK_DASH_HOST=127.0.0.1 SUPRASK_DASH_PORT=9411 python3 dashboard/server.py
```

## Duomenys

Visa tiesa — `agents/runs.db` (SQLite, WAL). Dashboard nieko nekeičia, išskyrus:

- `POST /api/run-now` — paleidžia `agents/run.py <vaidmuo> --trigger dashboard`;
- `POST /api/proposal-status` — keičia pasiūlymo būseną (`new`, `accepted`, `rejected`).

Žurnalai — `agents/log/<vaidmuo>-<data>.md`. Failai su `agents/log/` ir `agents/work/` į git nepatenka.

## Saugumas

- Serveris klausosi **tik** Tailscale IP (`100.118.226.11`), ne `0.0.0.0`.
- Basic auth su `hmac.compare_digest`; be prisijungimo — 401.
- `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, jokių išorinių resursų.
- Nėra rašymo į turinį iš dashboard: paleidimas tik per agentų bėgiklį, kuris laikosi gairių.
