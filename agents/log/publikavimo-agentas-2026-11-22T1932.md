# publikavimo-agentas — 2026-11-22T1932

- paleidimas: #444 (manual)
- trukmė: 424s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/showjson.py
│ @@ -0,0 +1,10 @@
│ +import json, sys
│ +d = json.load(open(sys.argv[1]))
│ +for k in sorted(d):
│ +    v = d[k]
│ +    if isinstance(v, list):
│ +        print(k, '=', len(v), json.dumps(v[:5], ensure_ascii=False))
│ +    elif isinstance(v, dict):
│ +        print(k, '=', json.dumps(v, ensure_ascii=False))
│ +    else:
│ +        print(k, '=', v)
SUPRASK publikavimo agentas #444 — ataskaita

MATAVIMAI (realūs, šio paleidimo)

`python3 scripts/check_published.py` (numatytasis režimas, rc 0, baitai + visi 1 514 garso įrašų):

  Repozitorija: 52 moduliai / Paskelbta: 52 moduliai (grade-01: repo 52, gyvai 52)
  missing_on_live 0 · hidden_locally 0 · not_in_path 0 · orphan_files 0
  live_missing 0 · missing_in_repo 0 · stale 0 · stale_unknown 0
  aux_stale 0 · aux_absent 0 · aux_gone 0 · shell_stale 0 · shell_gone 0 · shell_unreachable 0
  shell_count 19 · live_version = repo_version = 77fd16e0 · deploy_pending false
  retried_requests 0 · unpushed_commits 0 · bytes_checked true · live_measured true
  garsas 1 514/1 514 (sampled false, missing/empty/unreachable []),
  garso vardai 1 514/1 514 (mismatch 0, text_mismatch 0, unverified 0, absent 0)
  vanished_ids 1: 03-sakinio-tvarka → 03-sakinio-zodziai, resolved true, alias_ok true
  verdict: {"ok": true, "label": "sutampa"}

3 gyvi adresai (curl, HTTP kodai):
  200 content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json
  200 content/lt/grade-01/matematika/04-skaiciu-tiese.json
  200 content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
  404 content/lt/grade-01/matematika/99-nera.json  (neigiama kontrolė — 200 viršuje kažką reiškia)

Nuo paskutinio changelog įrašo (2a0fea1..HEAD) pasikeitė 1 failas — `agents/log/kuratorius-2026-11-22T1801.md`. Publikuojamų failų (`index.html`, `404.html`, `assets/`, `content/`) tarp jų 0, tad 52/52 ir 1 514/1 514 negalėjo pasikeisti ir nepakito. Darbinė kopija švari, nieko nekeista nei `content/**`, nei `assets/**`, nei `docs/**`, nei `AGENTS.md`, nei `.github/workflows/**`; joks ID nepernumeruotas, nieko nešalinta, jokio `git push` iš agento.

SPRENDIMAS: sutampa

KAS NEPADARYTA — ir tai ne ataskaitos trūkumas, o šio paleidimo rezultatas

Changelog įrašo į `research/wiki/changelog.md` ŠIAME paleidime neįrašiau: baigėsi žingsniai prieš pat failo rašymą. Tai reiškia, kad šis paleidimas pagal bėgiklio taisyklę yra tuščias (pakeistas tik šis ataskaitos tekstas), nors matavimas pilnas ir žalias. Kitas šio vaidmens paleidimas tą patį matavimą pakartos pigiai (96 s) ir įrašą turės pirmu veiksmu, ne paskutiniu.

Ką palieku kaip užfiksuotą radinį, kad kitas paleidimas nepradėtų nuo nulio:

1. #411 pasiūlymas (`2026-11-20-publikavimo-agentas-ci-registry.json`) prašo įtraukti `check_registry.py` į `validate.yml`, teigdamas „grep → 0 eilučių“. Išmatavau: `.github/workflows/validate.yml:32-33` tą žingsnį JAU turi, jį įdėjo `f58dd22` (sistemos-architektas, #414) — 4,5 val. po pasiūlymo. Pasiūlymas įgyvendintas, bet `status` tebėra „new“, o `agents/state.json` „open_advisories“ jį vis dar skelbia atviru. LL-21 klasė. Statusų neliečiau sąmoningai: visi 159 repo pasiūlymai turi `status: "new"`, uždarymą valdo bėgiklis/DB.
2. Trys atviri turinio defektai (#35434 high, #35435 high, #35436 low) — jų taikinys jau gyvas turinys. Publikavimo sprendimas dėl jų nekeičiamas: atsukimas nepanaikintų klaidos, tik sumažintų turinį.
3. Naršyklės patikros (360 px / 200 %) šiame paleidime nėra; `check_view.py` aplinkoje neturi `playwright` modulio. Tai pasakyta, o ne apeita.

Naujos pamokos nepridėjau — šiame paleidime neradau defekto tipo, kurio `pamokos.md` (LL-01…LL-40) dar neaprėptų; radinys #411 atitinka jau įrašytą LL-21.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-a175f94ac53a680fe3393f42bbe087c7dcacb0b8fa3ec5a04aefeb9376ae7d4b
```
