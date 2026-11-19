#!/usr/bin/env python3
"""
Publikavimo būklė: kiek turinio yra repo ir kiek realiai pasiekė gyvą svetainę.

Skirtumas tarp „sukurta“ ir „paskelbta“ anksčiau nebuvo matomas: dashboard
skaičiavo failus diske, o svetainėje modulių buvo mažiau. Šis įrankis lygina
abi puses ir, svarbiausia, tikrina, ar nepradingo nė vienas modulio ID —
nuo to priklauso vaiko `localStorage` pažanga.

2026-11-09 išplėsta (pasiūlymas #8716). Anksčiau:
  - klasė buvo įrašyta kieta (`grade-01`) — kai bus paleista 2 klasė, įrankis
    jos nematytų ir vėl sakytų „sutampa“;
  - lyginamos tik ID aibės, tad gyva svetainė su tais pačiais ID, bet pasenusiu
    failo turiniu, būdavo pavadinta suderinta. Baitų lygybę agentai turėjo
    įrodinėti atskirais zondais kiekvieną publikavimo paleidimą.
Dabar: klasės imamos iš `grades.json` (`status: live`), kiekvienas gyvas
modulio failas lyginamas baitais (sha256) su repo failu, o pranešime
atskiriama „trūksta ID“ nuo „ID yra, turinys pasenęs“. Nesutapimas
patikrinamas antrą kartą — GitHub Pages pirmomis sekundėmis po deploymento
gali grąžinti mišrią krašto būseną (LL-76).

2026-11-12 (paleidimas #247): lyginami ir failai, kuriuos svetainė skaito
prieš modulį — `grades.json`, klasės `index.json`, `path.json` ir
`assets/audio/lt/manifest.json`. Anksčiau moduliai galėjo būti 200, o gyvas
manifestas pasenęs: naujo modulio garsas 404, o visi vartai žali (LL-78).

2026-11-12 (paleidimas #253): lyginamas ir svetainės **kodas**, ne tik
turinys — `index.html`, `assets/js/**/*.js`, `assets/css/*.css`. Anksčiau
įrankis tikrino vien `content/lt/**` ir du pagalbinius failus, todėl
nepaskelbtas simuliacijos pataisymas buvo nematomas: modulių baitai sutampa,
o vaikas vykdo seną `assets/js/sims/*.js` (LL-83).

2026-11-13 (paleidimas #271): tikrinama ir **git istorija**, ne tik dabartis.
Modulis `03-sakinio-tvarka` pervadintas į `03-sakinio-zodziai` (#261): repo ir
gyva svetainė po to sutapo 39/39, visi baitai lygūs, visi vartai žali — o vaiko
`localStorage` žyma tam moduliui liko be modulio. Įrankis tokio įvykio nematė,
nes lygino tik dvi dabarties būsenas. Dabar iš klasės `index.json` istorijos
surenkami visi kada nors buvę ID; tie, kurių dabartiniame indekse nėra,
pranešami kaip `vanished_ids`. Priimtas pervadinimas (su aiškiu įpėdiniu)
registruojamas `scripts/known_renames.json` — kitaip vartai raudoni.

Dėmesio: `?v=<commit>` — ne turinio skirtumas. `.github/workflows/pages.yml`
prieš publikavimą prirašo commit'o trumpinį prie CSS/JS nuorodų, kad
naršyklė nepaimtų iš GitHub Pages tarpinės atminties seno failo. Todėl
svetainės failai lyginami **nuėmus `?v=`**, o pati versija perskaitoma ir
palyginama su `git HEAD` — kitu atveju įrankis klaidingai skelbtų „pasenęs
kodas“ po kiekvieno publikavimo.

2026-11-15 (paleidimas #301): tikrinami ir **garso failai**, ne tik manifestas.
Iki šiol lygintas tik `assets/audio/lt/manifest.json` baitais: jei manifestas
gyvas ir teisingas, vartai žali — nors patys mp3 gali būti nepaskelbti, ir
vaikas, paspaudęs garsiakalbį, negirdi nieko. Ši sritis liko vienintelė, kurios
neapėmė nė vieni vartai (#288, #292, #294 kas kartą matavo rankiniu zendu:
1138/1138, 86 s). Dabar manifestas perskaitomas, kiekvienas įrašas tikrinamas
HEAD užklausa, o rezultatas įvardijamas skaičiais. Numatytai tikrinami **visi**
įrašai: #303 neigiamas zondas parodė, kad 48 įrašų mėginys svetainėje su dviem
sugedusiais mp3 iš 1138 duoda rc 0 — tyli žalia, nors vaikas girdi nieko.
`--audio-sample N` paliktas greitam rankiniam bėgimui; jis išvestyje visada
sako „mėginys“ ir niekada nepranešamas kaip pilnas (LL-37).

2026-11-15 (paleidimas #308): dvi tylios žalios uždarytos.
  - `404.html` įtrauktas į `SHELL_GLOBS`: jį naršyklė realiai įkelia (tai
    puslapis, kurį vaikas pamato radęs neteisingą adresą ar nepaskelbtą
    modulį), o `pages.yml` jį kopijuoja į svetainę. Veidrodis su 563 B → 594 B
    failu anksčiau davė rc 0 ir „sutampa“; dabar — `PASENĘS KODAS: 404.html`.
  - `unpushed()` grąžina ir tai, ar patikra įvyko. Git klaida (šviežias klonas
    be `origin/main`) anksčiau virsdavo „0 neišsiųstų“; dabar `verdict()` sako
    „neišsiųstų commit'ų patikra neįvyko“ ir rc lieka 1.

2026-11-18 (paleidimas #356): priimtas pervadinimas nebelaikomas „be alias“.
  Pranešimas kiekvienam `vanished_ids` įrašui kietai rašė „alias mechanizmo
  nėra, žr. agents/proposals/“, nors `assets/js/progress.js:50–120` jį turi,
  `assets/js/registry.js:52–67` duoda žemėlapį, o `index.json` jau turi
  `renamed_from` (KURINIO-STANDARTAS §7.1). Tai buvo teiginys apie vaiko
  pažangą, kurio niekas neperskaičiavo (LL-21 / LL-34), ir jis kartojo darbą,
  kuris jau padarytas. Dabar `renamed_from_map()` skaito būtent klasės
  `index.json` (tą failą, kurį naršyklė ir įkelia), o pranešimas sako, ką
  rado: „žyma perkeliama“ arba „DĖMESIO: žyma liktų našlaite“. Pervadinimas,
  kuris yra `known_renames.json`, bet neturi `renamed_from` indekse, dabar
  daro ir rc 1 (`verdict()`: „pervadintas ID be alias“).

2026-11-18 (paleidimas #368): laikina tinklo klaida nebelaikoma „modulio nėra“.
  Pirmas šio paleidimo `check_published.py` bėgimas davė rc 1 ir
  „NEPASIEKIAMI gyvi failai (1): 06-figuros“, nors `curl` tą patį adresą tuoj
  pat atsakė 200 / 4 712 B, o antras bėgimas — 45/45 ir rc 0. Priežastis:
  `compare()` nutraukdavo po **vienos** nepavykusios užklausos (`fetch()` → None
  → `live_size -1` → `stale_unknown` → raudona), o `_audio_state()` tą pačią
  klaidą kartojo. Viena kryptis turėjo kartojimą, kita — ne, tad vartai apie
  vaiko patirtį skelbė faktą („modulis nepasiekiamas“), kurio po vieno bandymo
  pasakyti negalima. Dabar `fetch()` 404/410 laiko galutiniu atsakymu, o kitas
  klaidas kartoja (2 bandymai, 1,5 s pertrauka); pakartojimų skaičius
  išvedamas, kad tylaus kartojimo nebūtų (LL-37). Neigiamas zondas:
  `scratch/pub368/zondas_503.py` — veidrodis, kuris pirmą užklausą atsako 503,
  o antrą 200, anksčiau davė raudoną, dabar žalią; veidrodis, kuris 503 atsako
  visada, lieka raudonas.

2026-11-18 (paleidimas #372): #370 palikta pusė darbo užbaigta ir tyli žalia uždaryta.
  #370 `compare()` perdarė į būsenas (`ok|differs|absent|unreachable`) ir atskyrė
  „indeksas rodo į failą, kurio repo nėra“ nuo „failas pasenęs“, bet trys
  vartotojai liko su senu boolean kontraktu. Blogiausias — `report()` AUX_FILES
  ciklas: `ok, _, _ = compare(...)`; `if not ok:` — o ne tuščia **eilutė**
  visada teisinga, tad pasenęs `grades.json` / garso `manifest.json` nebūtų
  parodytas nė karto (tyli žalia). Be to `missing_in_repo`, `aux_absent` ir
  `stale_unmeasured` buvo surenkami `check_grade()` viduje ir **numetami**
  `report()` išvestyje, o `verdict()` jų nepažino: zondas
  (`scratch/pub370/zondas_trukstamas_failas.py`, veidrodis be modulio failo,
  gyva svetainė jį turi) davė `verdict: sutampa, ok=True`. Dabar visi trys
  būsenų vartotojai (AUX ciklas, `verdict()`, spausdintuvas) skaito būseną,
  o trūkstamas repo failas rodomas kaip `LŪŽĘS INDEKSAS` su gyvos pusės
  matavimu (`head_state()`): ar svetainėje failas yra. Neišmatuotas dydis
  lieka `-1` ir pranešamas žodžiais, ne kaip „0 B“.

2026-11-19 (paleidimas #374): pranešimas nebeteigia to, ko nebuvo matuota.
  Du defektai, kuriuos rado zondas `probe.py` (`--expect old` → 2/2, t. y.
  abu dar buvo):
  - `--no-bytes` režimas sąmoningai **nelygina** baitų, bet sėkmės eilutė
    iki šiol sakydavo „sutampa (ID, seka, modulių ir pagrindinių failų
    baitai, svetainės kodas 0 failų)“. Nei baitai, nei kodas nebuvo
    lyginti, o „0 failų“ yra ne matavimas, o praleista dalis. Greitas
    rankinis bėgimas taip tapdavo „įrodymu“, kurio nebuvo (LL-37/LL-10).
    Dabar `report()` grąžina `bytes_checked`, o eilutė sako „dalinė
    patikra“ ir išvardija, kas NETIKRINTA.
  - Sulaužytas **repo** indeksas (`content/lt/grade-01/index.json`
    neperskaitomas) buvo rašomas į `live_error`, o `verdict()` iš to darė
    „gyva svetainė nepasiekiama“. Veidrodis be indekso davė rc 1 su klaida
    apie svetainę, nors svetainė sveika, o taisyti reikia repo failą
    (LL-21). Dabar `check_grade()` tokį atvejį rašo į `repo_error`, o
    `verdict()` pirmoji priežastis — „repo indekso nepavyko perskaityti“.

2026-11-19 (paleidimas #382): nepasiekiama svetainė nebepaverčiama skaičiais.
  #374 užbaigė `--no-bytes` ir `repo_error` puses, bet trys vietos liko:
  - `published` buvo skaičiuojamas iš gyvo indekso, kurio **neperskaitėme**:
    svetainės gedimas virsdavo „Paskelbta: 0 modulių“ — teiginys apie
    svetainę, kurios nematėme. Dabar yra `published_measured`, o eilutė sako
    „Paskelbta: neišmatuota“.
  - baitų ciklas (`check_grade()`) ėjo net tada, kai gyvo indekso nėra: 48
    užklausos virsdavo 48 eilutėmis „NEPASIEKTA“ apie failus, kurių niekas
    nematė. Dabar jis paleidžiamas tik su perskaitytu gyvu indeksu, o **repo**
    indekso vientisumas (įrašas be failo) tikrinamas ir be tinklo.
  - `report()` pradeda vienu HEAD į `index.html`: kai svetainė neatsiliepia,
    pagrindinių failų, svetainės kodo ir 1432 garso įrašų patikros
    nevykdomos, o pranešime pasakoma, kas NETIKRINTA (ne 1451 „nepasiekiama“).

2026-11-19 (paleidimas #386): 404 nebelaikomas ryšio klaida.
  `fetch()` grąžino `None` ir tada, kai svetainė **atsakė 404**, ir tada, kai
  ryšio nebuvo, o `compare()` abu paversdavo `"unreachable"`. Pasekmė: modulio
  failo, kurio svetainėje nėra, atveju įrankis rašė „NEPASIEKTA po 2 bandymų“ —
  teiginys apie tinklą, kurio nebuvo (404 net nekartojamas), ir patarimas
  bandyti dar kartą vietoj publikuoti (LL-21, LL-37). Dabar `fetch_answer()`
  skiria `ok|missing|unreachable`, o `compare()` ir `_shell_state()` turi
  būseną `"gone"`: repo failas yra, svetainė atsakė 404/410. Ji rodoma
  atskirai (`SVETAINĖJE NĖRA MODULIO FAILO`, `…PAGRINDINIO FAILO`,
  `…KODO FAILO`), o `verdict()` turi savo priežastis, nes taisymas kitas —
  paleisti publikavimą, ne kartoti užklausą. Zondas:
  `scratch/pub386/probe.py` — prieš pataisymą 3/5 (B krito), po — 5/5.

Naudojimas:
    python3 scripts/check_published.py               # žmogui
    python3 scripts/check_published.py --json        # dashboard'ui
    python3 scripts/check_published.py --grade 1     # viena klasė
    python3 scripts/check_published.py --no-bytes    # greita: tik ID ir seka
    python3 scripts/check_published.py --audio-full  # tas pats kaip numatyta
    python3 scripts/check_published.py --audio-sample 48   # greitas, aklas
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import pathlib
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content" / "lt"
GRADES = CONTENT / "grades.json"
LIVE_ROOT = os.environ.get("SUPRASK_LIVE_ROOT", "https://one-man-company.github.io/suprask/")
UA = {"User-Agent": "suprask-check/1.2"}

# Failai, kuriuos svetainė skaito prieš bet kurį modulį. Jie nelyginami modulio
# baitų cikle (jis eina tik per `content/lt/<klase>/`), todėl pasenęs gyvas
# `manifest.json` anksčiau likdavo nepastebėtas: visi moduliai 200, visi vartai
# žali, o naujo modulio garso įrašo svetainėje nėra (404). LL-78.
AUX_FILES = [
    ("content/lt/grades.json", CONTENT / "grades.json"),
    ("assets/audio/lt/manifest.json", ROOT / "assets" / "audio" / "lt" / "manifest.json"),
]

# Svetainės kodas, kuris vykdomas naršyklėje. `content/` baitai sako, ką vaikas
# turėtų matyti, bet ne ką jis iš tikrųjų vykdo: simuliacijos, maršrutizatorius
# ir stilius gyvena `assets/`. Nepaskelbtas `assets/js/sims/*.js` pataisymas
# anksčiau likdavo nematomas — visi modulių baitai sutapdavo (LL-83).
SHELL_GLOBS = [
    ("index.html", None),
    # `404.html` irgi įkeliamas naršyklės: tai puslapis, kurį vaikas pamato,
    # kai modulio adresas neteisingas arba failas nepaskelbtas. Jis kopijuojamas
    # į svetainę (`pages.yml`: `cp index.html 404.html _site/`), bet nebuvo nė
    # viename varte — #306 paliko tai atviru, #308 įrodė zondą: veidrodis su
    # 563 B → 594 B `404.html` davė rc 0 ir „sutampa“, nors gyvas failas kitas.
    ("404.html", None),
    ("assets/js", "*.js"),
    ("assets/css", "*.css"),
]
# `?v=<commit>` prirašo `.github/workflows/pages.yml`. Tai ne turinio skirtumas,
# todėl prieš lyginimą žymė nuimama, o versija perskaitoma atskirai.
VERSION_PARAM = re.compile(r"\?v=[0-9a-f]{6,40}")

# Priimti modulių pervadinimai. Failas yra įrankio duomenys, ne turinio schema:
# jis nekeičia modulio formato, tik pasako, kad dingęs ID turi įpėdinį ir kad
# sprendimas buvo peržiūrėtas. Be jo kiekvienas sąmoningas pervadinimas darytų
# vartus amžinai raudonus, o amžinai raudoni vartai — tas pats kaip jokių (LL-37).
RENAMES = ROOT / "scripts" / "known_renames.json"
HISTORY_LIMIT = 400

# Garsas. Manifestas jau lyginamas kaip `AUX_FILES` įrašas, bet baitų lygybė
# sako tik tiek, kad sąrašas gyvas — ne kad failai, į kuriuos jis rodo, yra
# svetainėje. Vaikas, paspaudęs garsiakalbį, gauna 404 ir nieko negirdi, o
# visi vartai žali (#288, #292, #294). Todėl manifestas perskaitomas ir
# tikrinamas kiekvienas įrašas.
AUDIO_MANIFEST = ROOT / "assets" / "audio" / "lt" / "manifest.json"
AUDIO_URL_PREFIX = "assets/audio/lt/"
# Numatytasis režimas — visi įrašai. 48 įrašų mėginys buvo greitas (5,8 s), bet
# #303 neigiamas zondas parodė, kad jis **aklas**: veidrodis su 2 sugedusiais mp3
# iš 1138 (vienas 404, vienas 0 B) davė rc 0 ir „visi pasiekiami“. Pavienis
# trūkstamas failas nepatenka į 48 tolygžius taškus, o būtent pavienis failas ir
# yra realus atvejis (naujo modulio mp3 nepateko į publikavimą). Pilna patikra
# trunka 56 s prieš gyvą svetainę ir 1,3 s prieš vietinį veidrodį — pigiau nei
# vienas modulis be garso. `--audio-sample N` lieka greitam rankiniam bėgimui ir
# išvestyje visada pasako, kad tai mėginys.
AUDIO_SAMPLE = 48


def audio_paths(sample: int | None = None) -> tuple[list[str], int]:
    """(tikrinimi garso kelių sąrašas, kiek jų iš viso manifeste).

    `sample=None` — visi įrašai. Mėginys imamas tolygiai (kas n-tas), ne iš
    pradžios: pirmi įrašai yra seniausi ir paskelbti seniausiai, tad pradžios
    mėginys sistemingai nematytų naujausio modulio garso (LL-37).
    """
    try:
        data = json.loads(AUDIO_MANIFEST.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return [], 0
    paths: list[str] = []
    for value in data.values():
        if isinstance(value, dict):
            paths += [str(p) for p in value.values() if p]
        elif isinstance(value, str) and value:
            paths.append(value)
    paths.sort()
    total = len(paths)
    if sample is None or sample <= 0 or total <= sample:
        return paths, total
    step = total / sample
    picked = [paths[min(total - 1, int(i * step))] for i in range(sample)]
    return list(dict.fromkeys(picked)), total


def head_state(url_rel: str) -> tuple[str, int]:
    """Būsena („ok“, „missing“, „unreachable“) ir baitai. HEAD, ne GET: turinys čia
    neįdomus — įdomu, ar failas yra svetainėje.

    `missing` reiškia **atsakymą** (404/410), `unreachable` — kad atsakymo
    negavome nė po dviejų bandymų. Šios dvi būsenos skiriasi: pirmoji yra
    faktas apie svetainę, antroji — apie ryšį. Sumaišytos jos praneštų
    „failo nėra“ apie failą, kurio niekas nematė (LL-37).
    """
    for attempt in (0, 1):
        try:
            req = urllib.request.Request(LIVE_ROOT + url_rel, headers=UA, method="HEAD")
            with urllib.request.urlopen(req, timeout=20) as resp:
                return "ok", int(resp.headers.get("Content-Length") or 0)
        except urllib.error.HTTPError as exc:
            if exc.code in (404, 410):
                return "missing", -1
            if attempt == 0:
                time.sleep(1.5)  # LL-76: kraštas po deploymento būna mišrus
                continue
            return "unreachable", -1
        except Exception:  # noqa: BLE001
            if attempt == 0:
                time.sleep(1.5)
                continue
            return "unreachable", -1
    return "unreachable", -1


def _audio_state(rel: str) -> tuple[str, int]:
    """("ok"|"missing"|"empty"|"unreachable", baitai) — žr. `head_state()`."""
    state, size = head_state(AUDIO_URL_PREFIX + rel)
    if state == "ok" and size <= 0:
        return "empty", size
    return state, size


def check_audio(sample: int | None = None) -> dict:
    rels, total = audio_paths(sample)
    if not total:
        return {"total": 0, "checked": 0, "sampled": False,
                "missing": [], "empty": [], "unreachable": [],
                "note": "manifestas neperskaitytas — garso patikra neįvyko"}
    with ThreadPoolExecutor(max_workers=10) as pool:
        results = list(pool.map(lambda rel: (rel, _audio_state(rel)), rels))
    missing = [rel for rel, (state, _) in results if state == "missing"]
    empty = [rel for rel, (state, _) in results if state == "empty"]
    unreachable = [rel for rel, (state, _) in results if state == "unreachable"]
    return {
        "total": total,
        "checked": len(rels),
        "sampled": len(rels) < total,
        "missing": missing,
        "empty": empty,
        "unreachable": unreachable,
        "note": "",
    }



def grade_dir(grade: int) -> str:
    return f"grade-{grade:02d}"


def known_renames() -> dict[tuple[int, str], str]:
    """(klasė, senas ID) → naujas ID. Priimti pervadinimai, ne spėjimai."""
    try:
        data = json.loads(RENAMES.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    out: dict[tuple[int, str], str] = {}
    for item in data.get("renames", []):
        if item.get("from") and item.get("to"):
            out[(int(item.get("grade", 0)), str(item["from"]))] = str(item["to"])
    return out


def renamed_from_map(grade: int) -> dict[str, str]:
    """Senas ID → dabartinis, kaip jį mato **naršyklė** (klasės `index.json`).

    Tai ne tas pats failas kaip `known_renames.json`. `known_renames.json` yra
    vartų duomenys, kurių naršyklė neskaito; žymą perkelia `progress.js`
    (`renameMap()` → `registry.js`, `migrate()`), o šaltinis jai — `renamed_from`
    klasės indekse (KURINIO-STANDARTAS §7.1). Todėl įrankis, norėdamas pasakyti,
    ar vaiko žyma bus perkelta, turi skaityti būtent indeksą.

    Kodėl atsirado (#356): iki tol pranešimas kiekvienam priimtam pervadinimui
    kietai rašė „alias mechanizmo nėra, žr. agents/proposals/“. Mechanizmas jau
    buvo įdiegtas (`assets/js/progress.js:50–120`, `assets/js/registry.js:52–67`)
    ir aprašytas standarte, o `index.json` jau turėjo `renamed_from` — vartai
    kartojo pasenusį teiginį, o ne jį perskaičiavo (LL-21, LL-34). Pasekmė ne
    kosmetinė: pagal tokią eilutę agentas kas kartą siūlytų darbą, kuris jau
    padarytas, o skaitytojas manytų, kad vaiko pažanga prarasta.

    Grąžinama tuščia, jei indekso perskaityti nepavyksta — tada pranešama
    „nepatikrinta“, o ne „nėra“ (LL-37).
    """
    path = CONTENT / grade_dir(grade) / "index.json"
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    out: dict[str, str] = {}
    for strand in data.get("strands", []):
        for mod in strand.get("modules", []):
            new_id = mod.get("id")
            for old in mod.get("renamed_from") or []:
                if isinstance(old, str) and old and new_id and old != new_id:
                    out[old] = new_id
    return out


def historical_ids(grade: int) -> tuple[dict[str, str], str, bool]:
    """Visi ID, kada nors buvę klasės `index.json`, pastaba ir ar patikra įvyko.

    Dabarties lyginimas pervadinimo nemato: jei repo ir gyva svetainė pakeistos
    kartu, abi pusės sutampa, o vaiko žyma vis tiek neteko modulio (LL-88).
    Todėl imama git istorija. Kiekvienam ID įsimenama **naujausia** revizija,
    kurioje jis buvo (`revs` eina nuo naujausios).

    Trečias reikšmės narys `checked` saugo nuo tylios „0 dingusių“: jei istorijos
    perskaityti nepavyksta, tai nėra švarus rezultatas (LL-37/LL-10).
    """
    path = f"content/lt/{grade_dir(grade)}/index.json"
    note = ""
    try:
        shallow = subprocess.run(
            ["git", "rev-parse", "--is-shallow-repository"],
            cwd=ROOT, capture_output=True, text=True, timeout=20,
        ).stdout.strip()
        if shallow == "true":
            return {}, "git istorija sekli — dingusių ID patikra neįmanoma", False
        revs = subprocess.run(
            ["git", "log", f"--max-count={HISTORY_LIMIT}", "--format=%h", "--", path],
            cwd=ROOT, capture_output=True, text=True, timeout=120,
        ).stdout.split()
    except Exception as exc:  # noqa: BLE001
        return {}, f"git istorijos nepavyko perskaityti ({type(exc).__name__})", False

    if len(revs) >= HISTORY_LIMIT:
        note = f"istorija ribota iki {HISTORY_LIMIT} revizijų — senesni ID nepatikrinti"

    seen: dict[str, str] = {}
    for rev in revs:
        try:
            blob = subprocess.run(
                ["git", "show", f"{rev}:{path}"],
                cwd=ROOT, capture_output=True, text=True, timeout=30,
            ).stdout
            data = json.loads(blob)
        except Exception:  # noqa: BLE001
            continue  # revizijoje indekso dar nebuvo arba jis ne JSON
        for strand in data.get("strands", []):
            for mod in strand.get("modules", []):
                mid = mod.get("id")
                if mid and mid not in seen:
                    seen[mid] = rev
    return seen, note, True


def vanished(grade: int, current_ids: list[str]) -> dict:
    """Dingę ID su įpėdiniu, jei pervadinimas priimtas ir užregistruotas.

    Kiekvienam įrašui pridedama ir tai, ar žymą **realiai** perkelia naršyklė:
    `alias` — kur veda `index.json` `renamed_from` (tuščia, jei nėra), o
    `alias_ok` — ar tas pats įpėdinis, kaip `known_renames.json`. Be šių laukų
    vartai neturėdavo kuo pagrįsti teiginio apie vaiko pažangą ir rašė kietai
    įrašytą tekstą (#356, LL-21).
    """
    hist, note, checked = historical_ids(grade)
    known = known_renames()
    browser = renamed_from_map(grade)
    cur = set(current_ids)
    items: list[dict] = []
    for mid, rev in sorted(hist.items()):
        if mid in cur:
            continue
        successor = known.get((grade, mid), "")
        alias = browser.get(mid, "")
        items.append({
            "grade": grade,
            "id": mid,
            "last_rev": rev,
            "successor": successor,
            "resolved": bool(successor) and successor in cur,
            "alias": alias,
            "alias_ok": bool(successor) and alias == successor,
        })
    return {"items": items, "note": note, "checked": checked}


def live_grades() -> list[int]:
    try:
        data = json.loads(GRADES.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return [1]
    out = [int(g["grade"]) for g in data.get("grades", []) if g.get("status") == "live"]
    return out or [1]


def local_index(grade: int) -> tuple[dict, dict[str, str]]:
    path = CONTENT / grade_dir(grade) / "index.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    files: dict[str, str] = {}
    for strand in data.get("strands", []):
        for mod in strand.get("modules", []):
            if mod.get("file"):
                files[mod["id"]] = mod["file"]
    return data, files


RETRY_PAUSE = 1.5
FETCH_ATTEMPTS = 2
# Kiek užklausų teko kartoti po laikinos klaidos. Skaičius išvedamas, o ne
# nuslopinamas: tylus kartojimas paslėptų flakuojančią svetainę (LL-37).
RETRIES = {"count": 0}


def fetch_answer(url: str, timeout: int = 20,
                 attempts: int = FETCH_ATTEMPTS) -> tuple[str, bytes | None]:
    """(būsena, baitai), kur būsena yra `"ok"` | `"missing"` | `"unreachable"`.

    Atskyrimas atsirado dėl #386: `fetch()` grąžindavo `None` ir 404, ir
    laikinam ryšio gedimui, o `compare()` abu paversdavo „nepasiekta“.
    Svetainė, kurioje modulio failo **nėra**, pranešdavo „NEPASIEKTA po 2
    bandymų“: teiginys apie tinklą, kurio nebuvo — 404 yra atsakymas, ir jo
    net nekartojame. Vaikui skirtumas didelis: 404 reiškia „publikavimas
    nepaleistas / failas nedingo“, o nepasiekiamumas — „bandyk dar kartą“.
    404/410 — galutinis atsakymas, kitos klaidos kartojamos (LL-76, #368).
    """
    for attempt in range(max(1, attempts)):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return "ok", resp.read()
        except urllib.error.HTTPError as exc:
            if exc.code in (404, 410):
                return "missing", None
        except Exception:  # noqa: BLE001
            pass
        if attempt + 1 < max(1, attempts):
            RETRIES["count"] += 1
            time.sleep(RETRY_PAUSE)
    return "unreachable", None


def fetch(url: str, timeout: int = 20, attempts: int = FETCH_ATTEMPTS) -> bytes | None:
    """Failo turinys arba `None`. 404/410 — galutinis atsakymas, nekartojama.

    Anksčiau bet kokia klaida (503, ryšio nutrūkimas, timeout) virsdavo `None`
    po **vieno** bandymo, o `compare()` tokią `None` reikšmę paversdavo
    `stale_unknown` — t. y. vartai paskelbdavo „modulis nepasiekiamas“ apie
    failą, kuris svetainėje yra. Paleidimas #368: pirmas bėgimas rc 1 su
    `06-figuros`, `curl` tas pats adresas → 200 / 4 712 B, antras bėgimas rc 0.
    Todėl laikinos klaidos kartojamos, o `_audio_state()` ir `_shell_state()`
    turi tą patį kelią. 404/410 kartojami nėra: tai ne flakas, o atsakymas.
    """
    return fetch_answer(url, timeout, attempts)[1]



def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def compare(local_path: pathlib.Path, url_rel: str) -> tuple[str, int, int]:
    """(būsena, repo baitai, gyvi baitai).

    Būsena: `"ok"` | `"differs"` | `"absent"` | `"gone"` | `"unreachable"`.

    `"absent"` — repo failo nėra (indeksas rodo į nieką), `"gone"` — repo
    failas yra, o svetainė atsakė 404/410. Iki #386 abu atvejai su gyvos
    pusės klaida ėjo į `"unreachable"`, todėl svetainė be modulio failo
    pranešdavo „NEPASIEKTA po 2 bandymų“ — t. y. siūlė tikrinti ryšį, kai
    reikia publikuoti (LL-21, LL-37). Skirtumas vaikui konkretus: 404 niekada
    nepraeis savaime, nepasiekiamumas — gali.

    Baitų reikšmės: `-1` reiškia **neišmatuota**, ne 0. Tai svarbu, nes 0 baitų
    yra tikras matavimas (tuščias failas), o trūkstamas failas neturi jokio
    dydžio. Iki #370 abu atvejai rašė 0, todėl pranešimas apie failą, kurio
    repo nėra, skambėjo kaip matavimas: „repo 0 B, gyvai 0 B“ — nors gyvo failo
    dydis nebuvo matuotas net vieną kartą (`fetch()` net nebuvo iškviestas, nes
    funkcija grįždavo anksčiau). Vaikas tokiu atveju nematė nieko, o vartai
    pranešdavo „pasenęs turinys“, t. y. siūlė perkrauti publikavimą vietoj
    pataisyti indeksą (LL-21, LL-37).
    """
    if not local_path.exists():
        # Repo pusės nėra, bet gyva pusė **išmatuojama** ir tai keičia
        # pranešimą: jei svetainėje failas yra, defektas yra tik indeksas
        # (repo failą reikia grąžinti), o jei nėra — failo nėra niekur.
        # #370 klaida buvo priešinga: grįžtant be matavimo pranešime
        # atsirasdavo „repo 0 B, gyvai 0 B“, nors nė vienas dydis nebuvo
        # matuotas (LL-21, LL-37).
        state, live_size = head_state(url_rel)
        if state == "ok":
            return "absent", -1, live_size
        return "absent", -1, -1
    local = local_path.read_bytes()
    status, live = fetch_answer(LIVE_ROOT + url_rel)
    if status == "missing":
        # Atsakymas gautas: failo svetainėje nėra. Tai ne ryšio klaida ir ne
        # pasenęs turinys — nėra ko lyginti baitais (LL-21).
        return "gone", len(local), -1
    if live is None:
        return "unreachable", len(local), -1
    if sha(live) != sha(local):
        # LL-76: pirmomis sekundėmis po deploymento kraštas gali būti mišrus.
        time.sleep(1.5)
        live = fetch(LIVE_ROOT + url_rel)
        if live is None:
            return "unreachable", len(local), -1
    return ("ok" if sha(live) == sha(local) else "differs"), len(local), len(live)


def same_bytes(rel: str) -> tuple[str, int, int]:
    """(būsena, repo baitai, gyvi baitai) — žr. `compare()`."""
    return compare(CONTENT / rel, "content/lt/" + rel)


def shell_files() -> list[str]:
    """Svetainės kodo failai, kuriuos naršyklė įkelia (`index.html`, JS, CSS).

    Sąrašas imamas iš katalogų, ne įrašomas ranka: nauja simuliacija
    `assets/js/sims/` faile atsiranda be įrankio pakeitimo.
    """
    out: list[str] = []
    for name, pattern in SHELL_GLOBS:
        path = ROOT / name
        if pattern is None:
            if path.exists():
                out.append(name)
            continue
        if path.is_dir():
            out += [str(p.relative_to(ROOT)) for p in sorted(path.rglob(pattern))]
    return out


def strip_version(text: str) -> str:
    """Nuima `?v=<commit>` — publikavimo žymą, ne turinio skirtumą."""
    return VERSION_PARAM.sub("", text)


def _shell_state(rel: str) -> tuple[str, int, int]:
    """("ok"|"differs"|"gone"|"unreachable", repo baitai, gyvi baitai)."""
    local_path = ROOT / rel
    if not local_path.exists():
        return "ok", 0, 0
    local = local_path.read_bytes()
    status, live = fetch_answer(LIVE_ROOT + rel)
    if status == "missing":
        # Svetainė kodo failo neturi: tai nepasibaigęs publikavimas, o ne
        # ryšio klaida (#386, ta pati LL-21 šeima kaip `compare()`).
        return "gone", len(local), -1
    if live is None:
        return "unreachable", len(local), -1
    for attempt in (0, 1):
        if strip_version(live.decode("utf-8", "replace")) == strip_version(local.decode("utf-8", "replace")):
            return "ok", len(local), len(live)
        if attempt == 0:
            # LL-76: pirmomis sekundėmis po deploymento kraštas gali būti mišrus.
            time.sleep(2.5)
            live = fetch(LIVE_ROOT + rel)
            if live is None:
                return "unreachable", len(local), -1
    return "differs", len(local), len(live)


def repo_version() -> str:
    try:
        return subprocess.run(
            ["git", "rev-parse", "--short=8", "HEAD"], cwd=ROOT, capture_output=True, text=True, timeout=20
        ).stdout.strip()
    except Exception:  # noqa: BLE001
        return ""


def live_version() -> str:
    """Commit'as, iš kurio sukurta gyva svetainė (`?v=` žymė `index.html`)."""
    blob = fetch(LIVE_ROOT + "index.html")
    if blob is None:
        return ""
    match = VERSION_PARAM.search(blob.decode("utf-8", "replace"))
    return match.group(0)[3:] if match else ""


def site_reachable() -> bool:
    """Ar gyva svetainė iš viso atsako (HEAD į `index.html`).

    Vienas pigus matavimas prieš visus kitus. Be jo kiekviena gyva patikra
    atskirai aiškinosi tą patį gedimą ir kiekviena jo rezultatą pranešdavo
    kaip atskirą faktą: 48 moduliai „nepasiekiami“, 19 kodo failų
    „nepasiekiami“, 1432 garso įrašai „nepasiekiami“ — nors buvo vienas
    faktas (svetainė neatsiliepia), o 1451 užklausa tikrino ryšį, ne turinį.

    404/410 čia reiškia „serveris atsako“ — tada svetainė pasiekiama ir
    toliau matuojama įprastai.
    """
    state, _ = head_state("index.html")
    return state != "unreachable"


def check_shell() -> dict:
    files = shell_files()
    with ThreadPoolExecutor(max_workers=6) as pool:
        results = list(pool.map(lambda rel: (rel, _shell_state(rel)), files))
    stale: list[dict] = []
    unreachable: list[str] = []
    missing: list[str] = []
    for rel, (state, local_size, live_size) in results:
        if state == "differs":
            stale.append({"file": rel, "repo_bytes": local_size, "live_bytes": live_size})
        elif state == "gone":
            # Failo svetainėje nėra (404). Tai nepasibaigęs publikavimas, o ne
            # „nepasiekiamas“ — kitaip pranešimas siųstų tikrinti ryšį (#386).
            missing.append(rel)
        elif state == "unreachable":
            unreachable.append(rel)
    return {
        "shell_stale": stale,
        "shell_gone": missing,
        "shell_unreachable": unreachable,
        "shell_count": len(files),
        "live_version": live_version(),
        "repo_version": repo_version(),
    }



def check_grade(grade: int, compare_bytes: bool = True) -> dict:
    gd = grade_dir(grade)
    # `repo_error` ir `live_error` yra skirtingi dalykai: pirmasis reiškia,
    # kad įrankis nemato **repo** indekso (taisyti reikia failą), antrasis —
    # kad neatsiliepia gyva svetainė. Iki #374 abu ėjo į `live_error`, o
    # `verdict()` iš to darė „gyva svetainė nepasiekiama“: veidrodis be
    # `grade-01/index.json` skelbė klaidą apie svetainę, nors svetainė sveika
    # (LL-21 — teiginys apie priežastį, kurios niekas neperskaitė).
    out: dict = {"grade": grade, "live_error": "", "repo_error": ""}

    try:
        data, files = local_index(grade)
    except (OSError, json.JSONDecodeError) as exc:
        out["repo_error"] = f"repo {gd}/index.json: {type(exc).__name__}: {exc}"
        return out
    local_ids = [m["id"] for s in data.get("strands", []) for m in s.get("modules", [])]

    live_ids: list[str] = []
    live_seq: list[str] = []
    live_index_ok = False
    for name in ("index.json", "path.json"):
        blob = fetch(f"{LIVE_ROOT}content/lt/{gd}/{name}")
        if blob is None:
            out["live_error"] = out["live_error"] or f"gyvas {gd}/{name} nepasiekiamas"
            break
        if name == "index.json":
            live_data = json.loads(blob.decode("utf-8"))
            live_ids = [m["id"] for s in live_data.get("strands", []) for m in s.get("modules", [])]
            live_index_ok = True
        else:
            live_seq = list(json.loads(blob.decode("utf-8")).get("sequence", []))

    out["live_index_ok"] = live_index_ok
    # Ar `published` yra matavimas, ar tik nulis vietoj jo. Kai gyvo indekso
    # neperskaitėme, „Paskelbta: 0“ yra teiginys apie svetainę, kurios
    # nematėme (#382, LL-37/LL-21).
    out["published_measured"] = live_index_ok
    out["local"] = len(local_ids)
    out["published"] = len(live_ids)
    if live_index_ok:
        out["missing_on_live"] = [m for m in local_ids if m not in live_ids]
        out["hidden_locally"] = [m for m in live_ids if m not in local_ids]
    else:
        # Gyvo indekso nematėme, tad bet kuris sąrašas būtų teiginys apie
        # neperskaitytą svetainę. #374: svetainės gedimas atspausdindavo
        # „NESKELBTA (45)“ — t. y. visą klasę „nepaskelbta“ — nors nebuvo
        # perskaitytas nė vienas gyvas failas (LL-37). Sprendimą neša
        # `live_error` (`verdict()` → rc 1), o ne išgalvotas sąrašas.
        out["missing_on_live"] = []
        out["hidden_locally"] = []

    # LL-88: abi dabartys gali sutapti, o ID vis tiek gali būti dingęs.
    # Nuo to priklauso vaiko `localStorage` žyma, todėl tikrinama ne tik
    # „repo vs gyva“, bet ir „šiandien vs istorija“.
    gone = vanished(grade, local_ids)
    out["vanished_ids"] = gone["items"]
    out["history_note"] = gone["note"]
    out["history_checked"] = gone["checked"]

    try:
        local_seq = list(json.loads((CONTENT / gd / "path.json").read_text(encoding="utf-8")).get("sequence", []))
    except (OSError, json.JSONDecodeError):
        local_seq = []
    out["not_in_path"] = [m for m in local_ids if m not in local_seq]
    out["path_differs"] = bool(live_seq) and live_seq != local_seq
    if out["path_differs"]:
        out["path_missing"] = [m for m in local_seq if m not in live_seq]
        out["path_extra"] = [m for m in live_seq if m not in local_seq]

    stale: list[dict] = []
    stale_unknown: list[str] = []
    live_missing: list[dict] = []
    missing_in_repo: list[dict] = []
    unmeasured: list[str] = []
    if compare_bytes:
        # Modulys, kurio ID gyvame `index.json` nėra, jau įvardytas kaip
        # NESKELBTA — jo baitų skirtumas nieko neprideda, o pranešime atrodytų
        # kaip antras, kitoks defektas („turinys pasenęs“), nors turinys
        # nepasenęs: jo svetainėje tiesiog nėra. 2026-11-12 zondas su veidrodžiu
        # rodė tą patį ID abiejose eilutėse.
        missing = set(out["missing_on_live"])
        if live_index_ok:
            todo = [(mid, files[mid]) for mid in local_ids if mid in files and mid not in missing]
            with ThreadPoolExecutor(max_workers=8) as pool:
                results = list(pool.map(lambda pair: (pair[0], pair[1], same_bytes(*pair[1:])), todo))
            for mid, rel, (state, local_size, live_size) in results:
                if state == "ok":
                    continue
                if state == "absent":
                    # Indeksas rodo į failą, kurio repo nėra (#370). Tai ne
                    # „pasenęs turinys“ ir ne „nepasiekiamas“: publikavimas čia
                    # nieko nepakeis, kol indeksas netaisytas. Vaidmens taisyklė
                    # šį atvejį vadina lūžusiu indeksu ir reikalauja jį įvardyti
                    # atskirai, o ne sumaišyti su publikavimo defektais.
                    missing_in_repo.append({"id": mid, "file": rel, "grade": grade,
                                            "repo_bytes": local_size, "live_bytes": live_size})
                elif state == "gone":
                    # Svetainė atsakė 404/410: failo ten nėra, nors indeksas jį
                    # rodo. Tai nepasibaigęs publikavimas, o ne „bandyk dar
                    # kartą“ (#386). Sąrašas atskiras, nes baitų nėra su kuo
                    # lyginti — `live_size` čia `-1`, ir be šios šakos įrašas
                    # nukristų į „neišmatuotas dydis“.
                    live_missing.append({"id": mid, "file": rel, "grade": grade,
                                         "repo_bytes": local_size})
                elif state == "unreachable":
                    stale_unknown.append(mid)
                elif live_size < 0 or local_size < 0:
                    # Būsena „differs“, bet vienas dydis neišmatuotas — tokio
                    # derinio būti neturėtų; jei atsiranda, sakome tai žodžiais,
                    # o ne spausdiname -1 kaip baitus (LL-37).
                    unmeasured.append(mid)
                else:
                    stale.append({"id": mid, "file": rel, "repo_bytes": local_size,
                                  "live_bytes": live_size})
        else:
            # Gyvo indekso neperskaitėme, tad palyginti nėra su kuo: 48 baitų
            # užklausos duotų 48 eilutes „NEPASIEKTA“ apie failus, kurių niekas
            # nematė (#382, LL-37). Bet „indeksas rodo į failą, kurio repo
            # nėra“ yra repo defektas — jis tikrinamas be tinklo ir lieka.
            for mid in local_ids:
                rel = files.get(mid)
                if rel and not (CONTENT / rel).exists():
                    missing_in_repo.append({"id": mid, "file": rel, "grade": grade,
                                            "repo_bytes": -1, "live_bytes": -1})
    out["stale"] = stale
    out["stale_unknown"] = stale_unknown
    out["live_missing"] = live_missing
    out["missing_in_repo"] = missing_in_repo
    if unmeasured:
        out["stale_unmeasured"] = unmeasured

    # LL-78: klasės indeksas ir seka skaitomi prieš modulį, todėl jų baitai
    # lyginami atskirai — kitaip „ID yra“ nereiškia „svetainė rodo tą patį“.
    aux_stale: list[dict] = []
    aux_absent: list[dict] = []
    aux_gone: list[dict] = []
    if compare_bytes and live_index_ok:
        for name in ("index.json", "path.json"):
            url_rel = f"content/lt/{gd}/{name}"
            state, local_size, live_size = compare(CONTENT / gd / name, url_rel)
            if state == "ok":
                continue
            item = {"file": url_rel, "state": state,
                    "repo_bytes": local_size, "live_bytes": live_size}
            if state == "absent":
                aux_absent.append(item)
            elif state == "gone":
                aux_gone.append(item)
            else:
                aux_stale.append(item)
    out["aux_stale"] = aux_stale
    out["aux_absent"] = aux_absent
    out["aux_gone"] = aux_gone
    return out


def unpushed() -> tuple[list[str], bool]:
    """(commit'ai, kurių nėra `origin/main`, ar patikra įvyko).

    Anksčiau bet kokia git klaida (`origin/main` dar nenuskaitytas, veidrodis be
    remote, sulūžęs indeksas) virsdavo tuščiu sąrašu — t. y. „0 neišsiųstų“ ir
    žaliu „sutampa“. 2026-11-15 (#308) šviežias repo be `origin/main`: tikras
    `git rev-list` grąžino rc 128 ir tuščią stdout, o įrankis pranešė 0. Tai ta
    pati LL-37/LL-10 šeima: skaičius, kuris atrodo išmatuotas, bet nėra.
    Antrasis reikšmės narys eina į `verdict()`, kad „nepatikrinta“ būtų
    pasakyta žodžiais, o ne tylėtų.
    """
    try:
        proc = subprocess.run(
            ["git", "rev-list", "origin/main..HEAD"], cwd=ROOT, capture_output=True, text=True, timeout=30
        )
    except Exception:  # noqa: BLE001
        return [], False
    if proc.returncode != 0:
        return [], False
    return [c for c in proc.stdout.split() if c], True


def last_commit() -> str:
    try:
        return subprocess.run(
            ["git", "log", "--oneline", "-1"], cwd=ROOT, capture_output=True, text=True, timeout=20
        ).stdout.strip()
    except Exception:  # noqa: BLE001
        return ""


def report(grades: list[int] | None = None, compare_bytes: bool = True,
           audio_sample: int | None = None) -> dict:
    RETRIES["count"] = 0
    grades = grades or live_grades()
    # Vienas pigus HEAD prieš viską: jei svetainė neatsiliepia, likusios gyvos
    # patikros (pagrindiniai failai, svetainės kodas, 1432 garso įrašai) duotų
    # tik ilgą „nepasiekiama“ sąrašą — vieną gedimą, pakartotą 1451 kartą.
    # Matuojama kartą, o pranešime pasakoma, kas NETIKRINTA (#382).
    live_reachable = site_reachable()
    live_bytes_ok = compare_bytes and live_reachable
    per_grade = [check_grade(g, compare_bytes) for g in grades]

    def merge(key: str) -> list:
        out: list = []
        for g in per_grade:
            out.extend(g.get(key, []))
        return out

    live_errors = [f"{grade_dir(g['grade'])}: {g['live_error']}" for g in per_grade if g.get("live_error")]
    repo_errors = [f"{grade_dir(g['grade'])}: {g['repo_error']}" for g in per_grade if g.get("repo_error")]

    # Svarbiausias failas, kurio modulio baitų ciklas neapima: garso manifestas.
    # Jo stagnacija reiškia 404 naujo modulio garsui, o visi kiti vartai žali.
    aux_stale = list(merge("aux_stale"))
    aux_absent = list(merge("aux_absent"))
    aux_gone = list(merge("aux_gone"))
    if live_bytes_ok:
        for url_rel, local_path in AUX_FILES:
            # Kontraktas yra būsena, ne boolean: `compare()` grąžina
            # "ok"|"differs"|"absent"|"gone"|"unreachable". Iki #372 čia buvo
            # `if not ok:` — o ne tuščia būsena visada teisinga, tad
            # pasenęs `manifest.json` / `grades.json` būdavo tyliai
            # nerodomas (tyli žalia, blogiau nei prieš #370 darbą).
            state, local_size, live_size = compare(local_path, url_rel)
            if state == "ok":
                continue
            item = {"file": url_rel, "state": state,
                    "repo_bytes": local_size, "live_bytes": live_size}
            if state == "absent":
                aux_absent.append(item)
            elif state == "gone":
                aux_gone.append(item)
            else:
                aux_stale.append(item)

    # Svetainės kodas: ką vaikas iš tikrųjų įkelia, o ne tik ką rodo turinio JSON.
    shell = check_shell() if live_bytes_ok else {
        "shell_stale": [], "shell_unreachable": [], "shell_count": 0,
        "live_version": "", "repo_version": "", "skipped": True,
    }

    # Garsas: manifestas lyginamas aukščiau, bet failai — ne. Be šios dalies
    # „sutampa“ galėjo reikšti „manifestas teisingas, o mp3 svetainėje nėra“.
    if live_bytes_ok:
        audio = check_audio(None if not compare_bytes else audio_sample)
    elif not compare_bytes:
        audio = {
            "total": 0, "checked": 0, "sampled": False,
            "missing": [], "empty": [], "unreachable": [],
            "note": "garso patikra praleista (--no-bytes)",
        }
    else:
        # Svetainė neatsiliepia: 1432 HEAD užklausos matuotų ryšį, ne garsą.
        # Pasakoma žodžiais, o ne „trūksta 1432“ (#382).
        audio = {
            "total": 0, "checked": 0, "sampled": False,
            "missing": [], "empty": [], "unreachable": [],
            "note": "garso patikra neįvyko — svetainė nepasiekiama",
        }

    # Neišsiųsti commit'ai. `unpushed()` grąžina ir tai, ar patikra įvyko:
    # git klaida anksčiau atrodė kaip „0 neišsiųstų“ (žr. funkcijos docstring).
    unpushed_list, unpushed_ok = unpushed()

    out = {
        "grades": per_grade,
        "live_grades": grades,
        # Suderinta su senuoju formatu (changelog'ai ir dashboard'as skaito šiuos raktus).
        "local": sum(g.get("local", 0) for g in per_grade),
        "published": sum(g.get("published", 0) for g in per_grade),
        "missing_on_live": merge("missing_on_live"),
        "hidden_locally": merge("hidden_locally"),
        "not_in_path": merge("not_in_path"),
        "vanished_ids": merge("vanished_ids"),
        "history_note": "; ".join(g.get("history_note", "") for g in per_grade if g.get("history_note")),
        "history_unchecked": [g["grade"] for g in per_grade if g.get("history_checked") is False],
        "stale": merge("stale"),
        "stale_unknown": merge("stale_unknown"),
        "stale_unmeasured": merge("stale_unmeasured"),
        "live_missing": merge("live_missing"),
        "missing_in_repo": merge("missing_in_repo"),
        "aux_stale": aux_stale,
        "aux_absent": aux_absent,
        "aux_gone": aux_gone,
        "audio": audio,
        "shell_stale": shell["shell_stale"],
        "shell_gone": shell.get("shell_gone", []),
        "shell_unreachable": shell["shell_unreachable"],
        "shell_count": shell["shell_count"],
        "live_version": shell["live_version"],
        "repo_version": shell["repo_version"],
        "path_differs": [g["grade"] for g in per_grade if g.get("path_differs")],
        "unpushed_commits": len(unpushed_list),
        "unpushed_checked": unpushed_ok,
        "retried_requests": RETRIES["count"],
        "last_commit": last_commit(),
        "live_error": "; ".join(live_errors),
        "repo_error": "; ".join(repo_errors),
        # Ką šis bėgimas **iš tikrųjų** matavo. Be šio lauko `--no-bytes` ar
        # nepasiekiamos svetainės sėkmės eilutė skelbė matavimus, kurių
        # nebuvo (#374, #382).
        "bytes_checked": compare_bytes,
        "live_measured": live_reachable,
        # `published` skaičiuojamas tik iš perskaityto gyvo indekso. Kai jo
        # nėra, skaičius yra 0, bet tai ne matavimas — todėl atskiras laukas
        # (dashboard'as ir žmogus turi matyti skirtumą).
        "published_measured": all(g.get("published_measured", False) for g in per_grade),
    }
    # Sprendimas keliauja kartu su duomenimis: dashboard'as neperrašo taisyklės
    # savo (LL-10 — būsena iš to paties šaltinio, iš kurio imamas rc).
    out["verdict"] = verdict(out)
    return out


def verdict(data: dict) -> dict:
    """Vienintelis sprendimo šaltinis: kodėl publikuota / kodėl ne.

    Dashboard'as anksčiau pats skaičiavo „sutampa“ iš dviejų raktų
    (`missing_on_live`, `unpushed_commits`), o vartai rc=1 dar ir dėl `stale`,
    `stale_unknown`, `aux_stale`, `path_differs`, `shell_stale`. Žmogus matė
    žalią kortelę, kai įrankis buvo raudonas (#12895, LL-10 klasė). Todėl
    priežastys skaičiuojamos čia, o `problems()` ir dashboard'as tik skaito
    rezultatą.
    """
    reasons: list[str] = []
    # Repo klaida — pirmoji, nes ji yra šaknis: kol įrankis nemato klasės
    # indekso, jokia išvada apie svetainę negalioja. #374: anksčiau šis
    # atvejis virsdavo „gyva svetainė nepasiekiama“ ir siuntė taisyti ne to.
    if data.get("repo_error"):
        reasons.append("repo indekso nepavyko perskaityti")
    if data.get("live_error"):
        reasons.append("gyva svetainė nepasiekiama")
    # `published` be perskaityto gyvo indekso yra nulis vietoj matavimo. Jei
    # dėl kokios nors priežasties `live_error` liko tuščias, skaičius vis tiek
    # neturi atrodyti išmatuotas (#382).
    if data.get("published_measured") is False and not data.get("live_error"):
        reasons.append("paskelbtų modulių skaičius neišmatuotas")
    if data.get("missing_on_live"):
        reasons.append(f"{len(data['missing_on_live'])} neskelbta")
    if data.get("hidden_locally"):
        reasons.append(f"{len(data['hidden_locally'])} dingo iš repo")
    if data.get("not_in_path"):
        reasons.append(f"{len(data['not_in_path'])} ne kelyje")
    unexplained = [v for v in data.get("vanished_ids", []) if not v.get("resolved")]
    if unexplained:
        reasons.append(f"{len(unexplained)} dingęs ID (pažanga liko be modulio)")
    # Pervadinimas, kurio naršyklė neperkelia: `known_renames.json` sako
    # „įpėdinis yra“, o `index.json` `renamed_from` neturi — žyma liktų
    # našlaite. Tai ne tas pats kaip „mechanizmo nėra“ (#356), todėl
    # tikrinama kiekvieno įrašo duomenimis, o ne prielaida.
    orphan = [v for v in data.get("vanished_ids", [])
              if v.get("resolved") and not v.get("alias_ok")]
    if orphan:
        reasons.append(f"{len(orphan)} pervadintas ID be alias (žyma liktų našlaite)")
    if data.get("history_unchecked"):
        reasons.append("dingusių ID patikra neįvyko")
    if data.get("stale"):
        reasons.append(f"{len(data['stale'])} pasenęs modulis")
    if data.get("live_missing"):
        # Atsakymas 404, ne laikinas ryšio gedimas. Atskira priežastis, nes
        # taisymas kitas: paleisti publikavimą, o ne bandyti dar kartą (#386).
        reasons.append(f"{len(data['live_missing'])} modulio failo nėra svetainėje")
    if data.get("stale_unknown"):
        reasons.append(f"{len(data['stale_unknown'])} nepasiekiamas modulis")
    if data.get("stale_unmeasured"):
        reasons.append(f"{len(data['stale_unmeasured'])} modulis su neišmatuotu dydžiu")
    if data.get("missing_in_repo"):
        # Indeksas rodo į failą, kurio repo nėra. Publikavimas čia nieko
        # nepakeis — priežastis kitokia, todėl ir eilutė kitokia (LL-21).
        reasons.append(f"{len(data['missing_in_repo'])} indekso įrašas be failo repo")
    if data.get("path_differs"):
        reasons.append("kelio seka skiriasi")
    if data.get("aux_stale"):
        reasons.append(f"{len(data['aux_stale'])} pasenęs pagrindinis failas")
    if data.get("aux_absent"):
        reasons.append(f"{len(data['aux_absent'])} pagrindinis failas be repo kopijos")
    if data.get("aux_gone"):
        reasons.append(f"{len(data['aux_gone'])} pagrindinio failo nėra svetainėje")
    if data.get("shell_stale"):
        reasons.append(f"{len(data['shell_stale'])} pasenęs kodas")
    if data.get("shell_gone"):
        reasons.append(f"{len(data['shell_gone'])} svetainės kodo failo nėra")
    if data.get("shell_unreachable"):
        reasons.append(f"{len(data['shell_unreachable'])} nepasiekiamas kodas")
    audio = data.get("audio") or {}
    if audio.get("missing"):
        reasons.append(f"{len(audio['missing'])} trūksta garso failo")
    if audio.get("empty"):
        reasons.append(f"{len(audio['empty'])} tuščias garso failas")
    if audio.get("unreachable"):
        reasons.append(f"{len(audio['unreachable'])} nepasiekiamas garso failas")
    # Numatytasis `False`, ne `True`: nežinoma būsena neturi atrodyti kaip
    # išmatuotas nulis. `check()` visada įrašo raktą, tad šis kelias liečia tik
    # svetimus dict'us (senas snapshot'as, rankinis zondas) — jiems saugiau
    # pasakyti „nepatikrinta“ negu „0 neišsiųstų“ (#310 zondas: `verdict({})`
    # anksčiau grąžino žalią „sutampa“).
    if not data.get("unpushed_checked", False):
        reasons.append("neišsiųstų commit'ų patikra neįvyko")
    elif data.get("unpushed_commits"):
        reasons.append(f"{data['unpushed_commits']} neišsiųstas commit")
    return {"ok": not reasons, "reasons": reasons,
            "label": "sutampa" if not reasons else reasons[0]}


def problems(data: dict) -> bool:
    return not verdict(data)["ok"]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--grade", type=int, default=0, help="tikrinti vieną klasę")
    ap.add_argument("--no-bytes", action="store_true", help="greita: tik ID ir seka")
    ap.add_argument("--audio-full", action="store_true",
                    help="tikrinti visus garso įrašus (tai yra ir numatytasis režimas)")
    ap.add_argument("--audio-sample", type=int, default=0,
                    help=f"greitas režimas: tikrinti tik N garso įrašų mėginį "
                         f"(pvz. --audio-sample {AUDIO_SAMPLE}; toks mėginys nemato "
                         f"pavienių 404 — tik rankiniam bėgimui)")
    args = ap.parse_args()

    grades = [args.grade] if args.grade else None
    # Numatytai — visi garso įrašai (#303: mėginys duoda žalią šalia 404 mp3).
    sample = args.audio_sample if args.audio_sample > 0 and not args.audio_full else None
    data = report(grades, compare_bytes=not args.no_bytes, audio_sample=sample)

    if args.json:
        print(json.dumps(data, ensure_ascii=False))
        return 1 if problems(data) else 0

    print(f"Repozitorija: {data['local']} moduliai")
    if data.get("published_measured", True):
        print(f"Paskelbta:    {data['published']} moduliai")
    else:
        # Ne „0 modulių“: tiek pat tiesos būtų sakyti „0“ ir „48“, nes gyvo
        # indekso niekas neperskaitė (#382, LL-37).
        print("Paskelbta:    neišmatuota — gyvos svetainės indeksas neperskaitytas")
    for g in data["grades"]:
        live = g.get("published", 0) if g.get("published_measured", True) else "neišmatuota"
        print(f"  · {grade_dir(g['grade'])}: repo {g.get('local', 0)}, gyvai {live}")
    if not data.get("live_measured", True):
        # Viena priežastis, viena eilutė. Anksčiau šis vienas faktas virsdavo
        # 48 modulių + 19 kodo failų + 1432 garso įrašų sąrašu (LL-37).
        print("SVETAINĖ NEPASIEKIAMA — pagrindiniai failai, svetainės kodas ir garsas "
              "NETIKRINTI (matuoti neįmanoma). Taisyk pasiekiamumą, ne turinį.")
    if data["repo_error"]:
        # Ne „svetainė nepasiekiama“: įrankis nemato repo indekso, o be jo
        # bet kokia išvada apie svetainę yra spėjimas (#374).
        print(f"REPO INDEKSAS NEPERSKAITYTAS: {data['repo_error']}")
        print("  Taisyk repo failą — publikavimas čia nieko nepakeis.")
    if data["live_error"]:
        print(f"Gyvos svetainės klaida: {data['live_error']}")
    if data["missing_on_live"]:
        print(f"NESKELBTA ({len(data['missing_on_live'])}): {', '.join(data['missing_on_live'])}")
    if data["hidden_locally"]:
        print(f"PAVOJUS PAŽANGAI — svetainėje yra, repo ne ({len(data['hidden_locally'])}): {', '.join(data['hidden_locally'])}")
    if data["stale"]:
        print(f"PASENĘS TURINYS — ID yra, failas gyvai kitas ({len(data['stale'])}):")
        for s in data["stale"]:
            print(f"  - {s['id']} ({s['file']}): repo {s['repo_bytes']} B, gyvai {s['live_bytes']} B")
    if data.get("live_missing"):
        # Ne „NEPASIEKTA po 2 bandymų“: 404 yra atsakymas, ne tinklo gedimas.
        # Vaikui tai reiškia, kad modulio svetainėje nėra — reikia publikuoti.
        print(f"SVETAINĖJE NĖRA MODULIO FAILO — indeksas jį rodo, svetainė atsakė 404 "
              f"({len(data['live_missing'])}):")
        for item in data["live_missing"]:
            print(f"  - {item['id']} ({item['file']}), repo {item['repo_bytes']} B. "
                  f"Tai nepasibaigęs publikavimas, o ne ryšio klaida.")
    if data["stale_unknown"]:
        print(f"NEPASIEKTA po {FETCH_ATTEMPTS} bandymų ({len(data['stale_unknown'])}): "
              f"{', '.join(data['stale_unknown'])}")
    if data.get("missing_in_repo"):
        # Atskira eilutė: tai ne publikavimo defektas. Svetainė šio modulio
        # nerodo todėl, kad repo indeksas rodo į failą, kurio nėra (LL-21).
        print(f"LŪŽĘS INDEKSAS — įrašas yra, failo repo nėra ({len(data['missing_in_repo'])}):")
        for item in data["missing_in_repo"]:
            size = item["live_bytes"]
            if size > 0:
                live = f"svetainėje failas yra ({size} B) — dingo repo kopija"
            elif size == 0:
                live = "svetainėje failas yra, bet tuščias (0 B)"
            else:
                live = "svetainėje jo nėra arba jis nepasiektas (neišmatuota)"
            print(f"  - {item['id']} ({item['file']}): {live}. Taisyk indeksą, "
                  f"ne publikavimą.")
    if data.get("stale_unmeasured"):
        print(f"NEIŠMATUOTAS DYDIS ({len(data['stale_unmeasured'])}): "
              f"{', '.join(data['stale_unmeasured'])} — baitų lyginti negalima, "
              f"tai ne „0 baitų“")
    if data["not_in_path"]:
        print(f"NĖRA path.json sekoje ({len(data['not_in_path'])}): {', '.join(data['not_in_path'])}")
    accepted = [v for v in data.get("vanished_ids", []) if v.get("resolved")]
    unexplained = [v for v in data.get("vanished_ids", []) if not v.get("resolved")]
    if unexplained:
        print(f"DINGĘ ID — vaiko pažanga liko be modulio ({len(unexplained)}):")
        for v in unexplained:
            print(f"  - grade-{v['grade']:02d} {v['id']} (paskutinį kartą {v['last_rev']})")
    if accepted:
        print(f"Pervadinti ID, priimta ir užregistruota ({len(accepted)}):")
        for v in accepted:
            succ = v["successor"]
            if v.get("alias_ok"):
                # Teiginys apie vaiko pažangą — iš duomenų, ne iš atminties:
                # `index.json` `renamed_from` + `progress.js` migracija (LL-21).
                state = (f"žyma perkeliama — index.json „{succ}“ turi "
                         f"renamed_from, progress.js migruoja")
            elif v.get("alias"):
                state = (f"DĖMESIO: žyma NEBUS perkelta — index.json rodo į "
                         f"„{v['alias']}“, o known_renames.json — į „{succ}“")
            else:
                state = (f"DĖMESIO: žyma liktų našlaite — index.json įraše "
                         f"„{succ}“ nėra renamed_from")
            print(f"  - grade-{v['grade']:02d} {v['id']} → {succ} ({state})")
    if data.get("history_note"):
        print(f"Dingusių ID patikros riba: {data['history_note']}")
    if data["path_differs"]:
        print(f"path.json seka skiriasi: klasė {', '.join(map(str, data['path_differs']))}")
    if data["aux_stale"]:
        print(f"PASENĘS PAGRINDINIS FAILAS — moduliai 200, bet svetainė skaito kitą ({len(data['aux_stale'])}):")
        for s in data["aux_stale"]:
            live = "nepasiektas" if s["live_bytes"] < 0 else f"gyvai {s['live_bytes']} B"
            print(f"  - {s['file']}: repo {s['repo_bytes']} B, {live}")
    if data.get("aux_absent"):
        print(f"PAGRINDINIO FAILO NĖRA REPO ({len(data['aux_absent'])}) — "
              f"svetainė jį skaito prieš kiekvieną modulį:")
        for s in data["aux_absent"]:
            live = "neišmatuota" if s["live_bytes"] < 0 else f"gyvai {s['live_bytes']} B"
            print(f"  - {s['file']}: repo failo nėra, {live}")
    if data.get("aux_gone"):
        # Svetainė atsakė 404: failo ten nėra, nors repo jį turi. Tai
        # nepasibaigęs publikavimas, o ne „nepasiektas“ (#386).
        print(f"PAGRINDINIO FAILO NĖRA SVETAINĖJE — svetainė atsakė 404 "
              f"({len(data['aux_gone'])}):")
        for s in data["aux_gone"]:
            print(f"  - {s['file']}: repo {s['repo_bytes']} B, svetainėje failo nėra")
    if data.get("shell_stale"):
        print(f"PASENĘS KODAS — naršyklė vykdo kitą failą ({len(data['shell_stale'])}):")
        for s in data["shell_stale"]:
            print(f"  - {s['file']}: repo {s['repo_bytes']} B, gyvai {s['live_bytes']} B")
        if data.get("live_version") or data.get("repo_version"):
            print(f"  gyvai versija {data.get('live_version') or '?'}, repo HEAD {data.get('repo_version') or '?'}")
    if data.get("shell_unreachable"):
        print(f"NEPASIEKIAMI svetainės kodo failai ({len(data['shell_unreachable'])}): "
              f"{', '.join(data['shell_unreachable'])}")
    if data.get("shell_gone"):
        # 404, ne laikinas gedimas: kodas nepaskelbtas, o ne ryšys nutrūkęs.
        print(f"SVETAINĖJE NĖRA KODO FAILO — svetainė atsakė 404 "
              f"({len(data['shell_gone'])}): {', '.join(data['shell_gone'])}")
    audio = data.get("audio") or {}
    if audio.get("total"):
        kind = "mėginys" if audio.get("sampled") else "visi"
        line = f"Garsas: patikrinta {audio['checked']} iš {audio['total']} ({kind})"
        bad = len(audio.get("missing", [])) + len(audio.get("empty", [])) + len(audio.get("unreachable", []))
        print(line + (f" — TRŪKSTA {bad}" if bad else " — visi pasiekiami"))
        for key, label in (("missing", "nėra svetainėje"), ("empty", "tuščias"),
                           ("unreachable", "nepasiektas")):
            for rel in audio.get(key, [])[:10]:
                print(f"  - {rel} — {label}")
        if audio.get("sampled"):
            print("  (mėginys, ne visa apimtis — numatytasis režimas tikrina visus įrašus)")
    elif audio.get("note"):
        print(f"Garsas: {audio['note']}")
    if data["unpushed_commits"]:
        print(f"Neišstumta commit'ų: {data['unpushed_commits']}")
    if not data.get("unpushed_checked", False):
        print("Neišstumtų commit'ų patikra NEĮVYKO — git negalėjo palyginti su origin/main "
              "(tai ne „0“, o nežinoma; patikrink `git fetch`).")
    if data.get("retried_requests"):
        # Ne klaida, bet svarbu: jei svetainė flakuoja, skaičius auga.
        print(f"Užklausos, kartotos po laikinos klaidos: {data['retried_requests']}")
    if not problems(data):
        if data.get("bytes_checked", True):
            print(f"✔ Repo ir gyva svetainė sutampa (ID, seka, modulių ir pagrindinių failų baitai, "
                  f"svetainės kodas {data.get('shell_count', 0)} failų"
                  f"{', versija ' + data['live_version'] if data.get('live_version') else ''}).")
        else:
            # `--no-bytes` sąmoningai nelygina baitų, kodo ir garso. Iki #374
            # ši eilutė vis tiek sakydavo „baitai“ ir „svetainės kodas 0 failų“,
            # t. y. pranešdavo apie matavimą, kurio nebuvo (LL-37).
            print("✔ ID ir seka sutampa — DALINĖ PATIKRA: modulių baitai, pagrindinių failų baitai, "
                  "svetainės kodas ir garsas NETIKRINTI (--no-bytes).")

    return 1 if problems(data) else 0


if __name__ == "__main__":
    raise SystemExit(main())
