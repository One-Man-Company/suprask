# publikavimo-agentas — 2026-11-22T1602

- paleidimas: #441 (manual)
- trukmė: 354s
- modelio išėjimas: 1 (pirminis statusas: partial)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

Nepasiekiau iteracijų ribos su užbaigtu darbu — šiame paleidime repo failo neįrašiau. Ataskaita žemiau, bet ji skaitoma kaip tuščia pagal bėgiklio taisykles; tai sakau tiesiai, o ne maskuoju.

KĄ IŠMATAVAU (realūs paleidimai, ne atmintis)

`python3 scripts/check_published.py` (numatytasis, rc 0):
  Repozitorija: 52 moduliai / Paskelbta: 52 moduliai (grade-01: repo 52, gyvai 52)
  missing_on_live [], hidden_locally [], not_in_path [], orphan_files [],
  stale [], stale_unknown [], live_gone [], missing_in_repo [], aux_stale [],
  aux_absent [], aux_gone [], shell_count 19, garsas 1 514/1 514 (sampled false),
  garso vardai 1 514/1 514 (mismatch 0, text_mismatch 0, unverified 0, absent 0),
  live_version = repo_version = 828e6127, deploy_pending false, retried_requests 0,
  unpushed_commits 0, vanished_ids 1 (`03-sakinio-tvarka → 03-sakinio-zodziai`,
  resolved true, alias_ok true — žyma perkeliama).

3 gyvi adresai (curl, HTTP kodai):
  200 content/lt/grade-01/lietuviu-kalba/01-garsas-ir-raide.json
  200 content/lt/grade-01/matematika/04-skaiciu-tiese.json
  200 content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json
  404 content/lt/grade-01/matematika/99-nera.json (neigiama kontrolė)

Vartai po patikros: validate_content --grade 1 --strict → 0 klaidų / 0 įspėjimų, rc 0;
check_registry --grade 1 → „kryptys 9 · index 52 · failai 52 · užduotys 227 (optional 52) ·
sim 52 · path 52 · našlaičiai 0 / PROBLEMŲ: 0“, rc 0; check_docs_facts → 0/0, rc 0;
probe_check_published.py → 10/10 lūkesčių, rc 0.

Nuo paskutinio changelog įrašo (`2e0a7ca..HEAD`) pakeistas 1 commit (#440, kritikas) —
5 failai, publikuojamų (`index.html`, `404.html`, `assets/`, `content/`) tarp jų 0,
todėl 52/52 ir 1 514/1 514 negalėjo pasikeisti ir nepakito.

SPRENDIMAS: sutampa (repo 52 / paskelbta 52, garsas 1 514/1 514 abiem patikromis,
kodas 19 failų, 0 neišstumtų commit'ų, gyva versija = HEAD).

RADINYS, KURIO NEĮRAŠIAU

`agents/proposals/2026-11-20-publikavimo-agentas-ci-registry.json` (mano vaidmens #411
pasiūlymas) prašo į `validate.yml` įtraukti `check_registry.py`, teigdamas „grep → 0 eilučių“.
Išmatavau: `.github/workflows/validate.yml:32-33` tą žingsnį **jau turi**, jį įdėjo
`f58dd22` (sistemos-architektas, #414, 2026-11-20 20:30) — 4,5 val. po pasiūlymo. Pasiūlymas
įgyvendintas, bet failo `status` tebėra „new“, o `agents/state.json` bloke
(„open_advisories“) jis vis dar skelbiamas atviru. Tai LL-21 klasė: teiginys, kurio niekas
neperskaičiavo. Statusų faile nekeičiau sąmoningai — visi 159 repo pasiūlymai turi
`status: "new"`, tad uždarymą valdo bėgiklis/DB, ne failo laukas.

Kas liko nepadaryta: changelog įrašas (`research/wiki/changelog.md`) ir šio radinio
įforminimas; gyvos naršyklės patikros nėra — `check_view.py` su `/usr/bin/python3` atsakė
„KLAIDA: nėra playwright“, nors `~/.cache/ms-playwright/chromium-1255` diske yra, tad
360 px elgsena remiasi praėjusių paleidimų matavimais, ne šios dienos.
Neliesta: content/**, assets/**, docs/**, AGENTS.md, .github/workflows/**; joks modulio ID
nepernumeruotas, nieko nešalinta, jokio git push iš agento. Darbinė kopija švari.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-26babc944894e30d3171de16b733911674e03adbdb8be10694a74e5220472609
```
