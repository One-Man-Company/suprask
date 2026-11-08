# Agentų sistema

Dvylika vaidmenų, kurie kasdien vysto SUPRASK: randa temų, kuria metodus, rašo modulius, tobulina simuliacijas ir tikrina rezultatą. Šis dokumentas aprašo, **kaip darbas patenka į svetainę** ir kaip diagnozuoti, kai nepatenka.

## Grandinė

```
agentas (modelis)  →  pakeitimai darbinėje kopijoje
                   →  bėgiklis: validatoriai
                   →  commit + push į main (arba atmetimas)
                   →  GitHub Pages deploy
                   →  leidejas: gyvos svetainės patikra
```

Bėgiklis — `agents/run.py`. Jis paleidžiamas systemd timer'io (`suprask-agent@<vaidmuo>.service`), vienu metu dirba vienas agentas (`agents/.run.lock`).

## Rašymo užraktas (vienas visiems)

Visi agentai dirba **tame pačiame** darbiniame kataloge, todėl du rašantys
agentai vienu metu negali dirbti: pirmasis publikuotų antrojo nebaigtus
pakeitimus (taip atsitiko commit'e `5b58476`). Todėl:

- `agents/.run.lock` imamas **visiems vaidmenims** viso paleidimo metu;
- antrasis agentas **laukia** (`SUPRASK_LOCK_WAIT`, numatyta 900 s), o ne
  praleidžia — kitaip jis tyliai praranda savo dienos paleidimą;
- git operacijos papildomai saugomos trumpu `.git.lock`;
- failas, kuris buvo nešvarus **prieš** paleidimą, niekada nepatenka į to
  paleidimo commit'ą.

## Klasių apimtis ir minimalios temos

Kurias klases agentai vysto, sprendžia **žmogus** dashboard'e
(`/` → „Klasės ir minimalios temos"), ne agentai. Būsena saugoma
`agents/scope.json`, valdoma `agents/scope.py`.

- **Įjungta klasė** — agentai jai kuria turinį. Išjungta — neliečiama: jei
  pasiūlymo failas nurodo išjungtą klasę, bėgiklis jį pažymi `blocked`
  („N klasė išjungta") ir net nepradeda darbo.
- **Minimalios temos** — laisvas sąrašas (viena tema — viena eilutė). Tai
  **apatinė riba**, ne visas darbas: agentai privalo padengti šias temas, bet
  kuria ir žymiai daugiau.
- **Vienai temai gali būti keli moduliai**, skaičius neribojamas, jei temai
  išnagrinėti reikia kelių dalių (skirtingi aspektai, skirtingi veiksmai).
- Dashboard rodo apytikrę padengtį (✓ / ○) lygindamas temos žodžius su
  modulių pavadinimais — tai užuomina, o ne sprendimas.

Blokas „KLASIŲ APIMTIS" įterpiamas į **kiekvieno** agento promptą, todėl
ideatorius, metodininkas ir kūrėjas mato tą patį susitarimą.

## Kūrėjo eilė (kodėl ne vienas modulis per dieną)

`kurejas` yra **eilės darbuotojas**. Vienas jo darbo vienetas — vienas pasiūlymas, bet paleidimas
(iš systemd) eina per `scripts/kurejas_queue.py`, kuris:

1. pažymi pasenusius pasiūlymus (`tema`, kurio failas jau yra) ir dublius → `obsolete`;
2. ima pasiūlymus prioriteto tvarka (high → normal → low, tada pagal ID);
3. kiekvienam kviečia `agents/run.py kurejas --proposal <id>`, kuris **pats** validuoja, commituoja
   ir publikuoja;
4. po kiekvieno paleidimo užraktas atleidžiamas, todėl kiti agentai nelaukia;
5. pasiūlymas pažymimas `done` (arba `blocked`, jei nepavyko); numatytos ribos — 60 pasiūlymų /
   720 minučių vienam paleidimui (12 h, `TimeoutStartSec` 13 h).

**Laikas parinktas pagal kitus agentus:** ideatorius siūlo 07:10, metodininkas prideda metodus
08:20, o kūrėjas pradeda 09:00 — eilė jau pripildyta ir su metodais. Kūrėjas dirba iki 12 h, bet
turi **savo užraktą** (`.run.kurejas.lock`), todėl sim inžinierius (11:00), dizaineris (12:30) ir
kritikas (14:00) nebelieka užblokuoti. Git operacijos serializuojamos atskiru `.git.lock`.

Todėl per dieną apdorojama iki 8 pasiūlymų, o ne vienas, ir eilė gali išsekti. Kai eilė tuščia,
paleidimas baigiasi — kitas tikrina vėl pagal grafiką (09:30).

## Kas atsakingas už ką

| Veiksmas | Kas atlieka | Kodėl taip |
|---|---|---|
| Failų keitimas | agentas (modelis) | reikia supratimo, ne šablono |
| Validacija | bėgiklis | agentas neturi „prisipažinti“, kad nepatikrino |
| Commit / push | bėgiklis | agentai dažnai neturi laiko ir rašo „nepadaryta“ |
| Publikavimo priežiūra | `leidejas` | patikrina gyvą svetainę, atsuka sugedusį commit'ą |

Agentui **draudžiama** daryti `git commit`, `git push`, `gh pr create` — tai buvo pagrindinė priežastis, kodėl per parą 9 paleidimai nedavė nė vieno pokyčio svetainėje.

## Statusai (`agents/runs.db`)

| Statusas | Reikšmė |
|---|---|
| `published` | validacija praėjo, commit paskelbtas (yra `commit_sha`) |
| `empty` | agentas failų nepakeitė — nieko nepaskelbta |
| `rejected` | validacija nepraėjo, pakeitimai atmesti (žr. `validation`) |
| `conflict` | susidūrė su `origin/main`, reikia žmogaus |
| `unpushed` | commit yra, bet push nepavyko |
| `failed` / `timeout` | modelio klaida arba laikas baigėsi |

Anksčiau statusas priklausė nuo `exit` kodo, todėl „partial“ atrodė kaip sėkmė, nors repo nepasikeitė.

## Rankinis įstrigusio darbo paskelbimas

Jei agentas padarė darbą, bet jis liko necommitintas (pvz. trūko laiko):

```bash
python3 agents/run.py <vaidmuo> --publish-only
```

Šis režimas **neatmeta** pakeitimų, jei validacija krenta — tik praneša, kad nepradingtų žmogaus darbo.

## Diagnostika

```bash
python3 agents/run.py <vaidmuo> --dry-run     # parodyti promptą
python3 agents/run.py <vaidmuo> --trigger dashboard
python3 - <<'PY'                              # paskutiniai paleidimai
import sqlite3; c=sqlite3.connect("agents/runs.db"); c.row_factory=sqlite3.Row
for r in c.execute("select id,role,status,commit_sha,validation from runs order by id desc limit 10"):
    print(dict(r))
PY
gh run list --workflow=pages.yml --limit 3    # ar deploy žalias
```

Dashboard (tik Tailscale): `http://zoltanas.tail4bbf34.ts.net:9410/` — rodo statusą, commit'ą ir validacijos išvestį.

## Klaidų, kurios jau buvo, sąrašas

- **Nepublikavimas.** Bėgiklis tik fiksavo `artifacts`, bet necommituodavo. `kurejas` buvo sukūręs `15-laikas` modulį su simuliacija ir 24 garso įrašais — jis pragulėjo parą ir į svetainę nepateko.
- **Statusas pagal exit kodą.** `partial` atrodė kaip sėkmė; žmogus matė „daug paleidimų, jokių pokyčių“.
- **`git add -A`.** Vienas publikavimas įtraukė ir žmogaus nebaigtus pakeitimus į agento commit'ą. Dabar komituojami tik to paleidimo failai.
- **Revert be ribų.** `--publish-only` su nepavykusia validacija atsukdavo VISUS darbinius failus, įskaitant žmogaus redaguotus. Dabar rankiniu režimu nieko neatmeta.
- **Konfliktai.** Du agentai pridėdavo skirtingus įrašus į tą patį markdown žurnalą; rebase krisdavo ir darbas likdavo šakoje. Dabar naudojamas merge, o `.md` žurnalų konfliktai sujungiami išsaugant abi puses.
