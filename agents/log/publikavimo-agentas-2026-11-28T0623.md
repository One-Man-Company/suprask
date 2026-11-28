# publikavimo-agentas — 2026-11-28T0623

- paleidimas: #595 (manual)
- trukmė: 2491s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_published.py
│ @@ -2346,6 +2346,81 @@
│          return ""
│      match = VERSION_PARAM.search(blob.decode("utf-8", "replace"))
│      return match.group(0)[3:] if match else ""
│ +
│ +
│ +# `href="…"` / `src='…'` reikšmė — su kabute, kuri ją atidarė (kad nesugriebtų
│ +# kito atributo). Naudojama tik `index.html` kodo nuorodoms.
│ +REF_ATTR = re.compile(r"""(?:href|src)\s*=\s*(["'])([^"']+)\1""")
│ +# Nuoroda yra „svetainės kodas“, jei rodo į `assets/css/*.css` arba
│ +# `assets/js/*.js`. Paveikslai, `data:` URI ir garso manifestas čia neįeina:
│ +# jiems `pages.yml` žymos nededa ir nereikia — jie neimportuojami, o prašomi
│ +# tiesiogiai.
│ +CODE_REF = re.compile(r"assets/(?:css|js)/[^?#]+\.(?:css|js)$")
│ +
│ +
│ +def shell_version_stamps(blob: bytes | None) -> dict:
│ +    """Ar **kiekviena** kodo nuoroda `index.html` turi `?v=<commit>` (LL-233).
│ +
│ +    Kodėl to reikia. `_version_of()` grąžina **pirmą** rastą žymę ir vadina ją
│ +    „svetainės versija“. Tai tiesa tik tada, kai žymų tiek pat, kiek kodo
│ +    nuorodų. `.github/workflows/pages.yml` turi du **kietai įrašytus** `sed`
│ +    raštus (`main.css`, `app.js`), tad trečia nuoroda (naujas stilius, antras
│ +    scenarijų failas) lieka be žymės, o naršyklė jai taiko GitHub Pages
│ +    tarpinę atmintį (~10 min.) — vaikas mato seną failą.
│ +
│ +    Šitą defektą nematė nė vienas vartas, ir dviem atžvilgiais:
│ +      1. `_shell_state()` prieš lyginimą žymę **nuima**, tad trūkstama žymė
│ +         repo ir gyvo failo skirtumo nepadaro;
│ +      2. `_version_of()` perskaito tą žymę, kuri yra, tad `deploy_pending`
│ +         lieka `False`, o sėkmės eilutė rašo „versija <sha>“ — teiginį apie
│ +         **vieną** nuorodą, tarsi jis galiotų visoms.
│ +
│ +    Matuota 2026-11-28 (#595, laikinas veidrodis `…/mirror595`, tas pats
│ +    `pages.yml` `sed`): įdėjus antrą `<link href="./assets/css/print.css">`,
│ +    publikavimo žingsnis praėjo (`rc 0`, `leftover` tuščias — jis skaito tik
│ +    `assets/js` importus), o `check_published.py` toliau rašė „sutampa“ ir
│ +    „versija <sha>“, nors `print.css` nuoroda žymos neturėjo.
│ +
│ +    `versions` — visos skirtingos rastos žymės. Daugiau nei viena reiškia,
│ +    kad svetainė **mišri** (pusė failų iš vieno commit'o, pusė iš kito):
│ +    `_version_of()` tokios būsenos neįvardija, nes ima pirmą.
│ +    """
│ +    text = "" if blob is None else blob.decode("utf-8", "replace")
│ +    stamped: list[str] = []
│ +    unstamped: list[str] = []
│ +    versions: set[str] = set()
│ +    for match in REF_ATTR.finditer(text):
│ +        url = match.group(2).strip()
│ +        path = url.split("?", 1)[0].split("#", 1)[0]
│ +        if not CODE_REF.search(path):
│ +            continue
│ +        ver = VERSION_PARAM.search(url)
│ +        if ver:
│ +            stamped.append(path)
│ +            versions.add(ver.group(0)[3:])
│ +        else:
│ +            unstamped.append(path)
│ +    return {
│ +        "stamped": stamped,
│ +        "unstamped": unstamped,
│ +        "versions": sorted(versions),
│ +        "refs": len(stamped) + len(unstamped),
│ +    }
│ +
│ +
│ +def shell_version_check() -> dict:
│ +    """`shell_version_stamps()` prieš gyvą `index.html`; be tinklo — tuščia.
│ +
│ +    Skaitoma su keitimo žyme, nes būtent žymė yra matavimo objektas: be jos
│ +    kraštas gali atiduoti seną `index.html`, kuriame žymos dar nėra, ir
│ +    vartas praneštų apie publikavimo defektą, kurio priežastis — tarpinė
│ +    atmintis (LL-201 šeima).
│ +    """
│ +    status, blob = fetch_answer(cache_busted(LIVE_ROOT + "index.html"), attempts=1)
│ +    if status != "ok" or blob is None:
│ +        # Neišmatuota nėra „viskas pažymėta“ (LL-37).
│ +        return {"measured": False, **shell_version_stamps(None)}
│ +    return {"measured": True, **shell_version_stamps(blob)}
│ … omitted 3 diff line(s) across 1 additional file(s)/section(s)
│ scripts/check_published.py
│ @@ -2917,6 +2917,13 @@
│      shell = check_shell(live_v if live_bytes_ok else None) if live_bytes_ok else {
│          "shell_stale": [], "shell_unreachable": [], "shell_count": 0,
│          "live_version": "", "repo_version": "", "skipped": True,
│ +    }
│ +    # LL-233: ar **kiekviena** `index.html` kodo nuoroda turi `?v=`. `check_shell()`
│ +    # ir `_version_of()` šito nepasako: pirmas žymę nuima, antras ima pirmą
│ +    # rastą. Be šio matavimo nauja CSS/JS nuoroda publikavimo žingsnyje lieka
│ +    # be žymės, o vartai toliau rašo „sutampa, versija <sha>“.
│ +    version_stamps = shell_version_check() if live_bytes_ok else {
│ +        "measured": False, "stamped": [], "unstamped": [], "versions": [], "refs": 0,
│      }
│
│      # Garsas: manifestas lyginamas aukščiau, bet failai — ne. Be šios dalies
│ scripts/check_published.py
│ @@ -3024,6 +3024,14 @@
│          "shell_gone": shell.get("shell_gone", []),
│          "shell_unreachable": shell["shell_unreachable"],
│          "shell_count": shell["shell_count"],
│ +        # LL-233 — atskiri raktai, nes tai ne „kodas pasenęs“ ir ne „deploy
│ +        # nepasivijo“, o trečias dalykas: žymė, kurios nėra, tad failas
│ +        # naršyklėje gali būti bet kurios versijos.
│ +        "shell_version_refs": version_stamps["refs"],
│ +        "shell_version_stamped": version_stamps["stamped"],
│ +        "shell_version_unstamped": version_stamps["unstamped"],
│ +        "shell_version_values": version_stamps["versions"],
│ +        "shell_version_measured": version_stamps["measured"],
│          "live_version": shell["live_version"],
│          "repo_version": shell["repo_version"],
│          # Deploy'aus langas. `deploy_pending` reiškia: gyva svetainė pastatyta
│ scripts/check_published.py
│ @@ -3315,6 +3315,17 @@
│                         f"{first['css_value']})")
│      if data.get("shell_gone"):
│          reasons.append(f"{len(data['shell_gone'])} svetainės kodo failo nėra")
│ +    # LL-233: kodo nuoroda be `?v=`. Tai ne „deploy nepasivijo“ (versija gali
│ +    # bū

… PRALEISTA 5161 SIMBOLIŲ IŠ 23161 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00595/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

/index.html").read_text(encoding="utf-8")
│ +          code = re.compile(r"assets/(?:css|js)/[^?#]+\.(?:css|js)$")
│ +          bad = []
│ +          for m in re.finditer(r"""(?:href|src)\s*=\s*(["'])([^"']+)\1""", html):
│ +              url = m.group(2).strip()
│ +              path = url.split("?", 1)[0].split("#", 1)[0]
│ +              if code.search(path) and not re.search(r"\?v=[0-9a-f]{6,40}", url):
│ +                  bad.append(url)
│ +          if bad:
│ +              print(f"::error::Kodo nuoroda be ?v= ({len(bad)}): {', '.join(bad)}")
│ +              sys.exit(1)
│ +          print("Kodo nuorodos: visos su ?v=")
│ +          PY
│            echo "versija: $SHA"; grep -o "main.css?v=[a-f0-9]*" _site/index.html | head -1
│
│        # Vidinės nuorodos — **surinktame artefakte**, ne repo. `check_published`
│ .github/workflows/pages.yml
│ @@ -45,7 +45,7 @@
│            # Vartai: jei bent vienas santykinis importas liko be žymos, publikavimas
│            # stabdomas. Kitaip deploy būtų žalias, o vaikas iki ~10 min. matytų seną
│            # JS — ir nė viena patikra to nepasakytų.
│ -          leftover=$(grep -rnE "(from|import\()[[:space:]]*['\"\`]\\./[^'\"\`]*\\.js['\"\`]" _site/assets/js --include="*.js" || true)
│ +          leftover=$(grep -rnE "(from|import\()[[:space:]]*['\"\`]\./[^'\"\`]*\.js['\"\`]" _site/assets/js --include="*.js" || true)
│            if [ -n "$leftover" ]; then
│              echo "::error::Santykinis importas be ?v= — naršyklė ims seną failą:"
│              echo "$leftover"
│ scripts/probe_shell_version.py
│ @@ -0,0 +1,185 @@
│ +#!/usr/bin/env python3
│ +"""Zondas `check_published.py` svetainės kodo žymų patikrai — be tinklo.
│ +
│ +Kodėl šis failas egzistuoja (LL-36, LL-21). 2026-11-28 (#595) rastas defektas,
│ +kurio nematė nė vienas vartas: `.github/workflows/pages.yml` prirašo
│ +`?v=<commit>` dviem **kietai įrašytiems** raštams (`main.css`, `app.js`), o
│ +likęs to paties žingsnio vartas skaito tik `assets/js` **importus**. Trečia
│ +kodo nuoroda `index.html` (naujas stilius, antras scenarijų failas) todėl
│ +likdavo be žymės, o naršyklė jai taiko GitHub Pages tarpinę atmintį (~10 min.)
│ +— vaikas mato seną failą.
│ +
│ +Vartai to nematė dviem atžvilgiais ir abu yra `check_published.py` kode:
│ +  1. `_shell_state()` prieš lyginimą žymę **nuima**, tad trūkstama žymė repo
│ +     ir gyvo failo skirtumo nepadaro;
│ +  2. `_version_of()` ima **pirmą** rastą žymę ir skelbia ją visos svetainės
│ +     versija, tad `deploy_pending` lieka `False`, o sėkmės eilutė rašo
│ +     „versija <sha>“ — teiginį apie vieną nuorodą, tarsi jis galiotų visoms.
│ +
│ +Zondas tikrina gryną funkciją `shell_version_stamps()` ir `verdict()` —
│ +be tinklo, be laikinų serverių, < 0,2 s. HTTP kelias (`shell_version_check()`)
│ +tikrinamas atskirai žemiau, per `http.server` vienam katalogui.
│ +
│ +Naudojimas:
│ +    python3 scripts/probe_check_published.py   # žr. ten esančius G–I
│ +    python3 scripts/probe_shell_version.py     # 0 — visi lūkesčiai išsipildė
│ +"""
│ +
│ +from __future__ import annotations
│ +
│ +import functools
│ +import http.server
│ +import pathlib
│ +import sys
│ +import tempfile
│ +import threading
│ +
│ +HERE = pathlib.Path(__file__).resolve().parent
│ +ROOT = HERE.parent
│ +sys.path.insert(0, str(HERE))
│ +
│ +import check_published as cp  # noqa: E402
│ +
│ +results: list[tuple[str, bool, str]] = []
│ +
│ +
│ +def check(name: str, ok: bool, detail: str) -> None:
│ +    results.append((name, ok, detail))
│ +    print(f"{'OK  ' if ok else 'KLAIDA'} {name} — {detail}")
│ +
│ +
│ +def html(*refs: str) -> bytes:
│ +    """`index.html` fragmentas su duotomis nuorodomis (kiekviena — jau su žyme ar be)."""
│ +    body = "\n".join(f'<link href="{r}" />' for r in refs)
│ +    return f"<!doctype html><html><head>\n{body}\n</head></html>".encode("utf-8")
│ +
│ +
│ +SHA = "cdd8c73e"
│ +
│ +
│ +class _QuietHandler(http.server.SimpleHTTPRequestHandler):
│ +    def log_message(self, format, *args):  # noqa: A002
│ +        pass
│ +
│ +
│ +def serve(base: pathlib.Path):
│ +    handler = functools.partial(_QuietHandler, directory=str(base))
│ +    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
│ +    threading.Thread(target=httpd.serve_forever, daemon=True).start()
│ +    return httpd, f"http://127.0.0.1:{httpd.server_address[1]}/"
│ +
│ +
│ +def verdict_shell(stamps: dict) -> dict:
│ +    """`verdict()` su tik žymų teiginiu — kiti raktai sveiki, kad klaida būtų viena."""
│ +    return cp.verdict({
│ +        "shell_version_unstamped": stamps["unstamped"],
│ +        "shell_version_values": stamps["versions"],
│ +        "shell_version_measured": True,
│ +        "unpushed_checked": True,
│ … omitted 107 diff line(s) across 1 additional file(s)/section(s)
│ agents/roles/publikavimo-agentas.md
│ @@ -18,6 +18,8 @@
│  4. Jei yra `not_in_path` — papildyk `content/lt/grade-<NN>/path.json` `sequence` sąrašą taip, kad visi ID būtų, bet **esama tvarka nesikeistų** (nauji pridedami gale).
│  4a. Jei yra `path_unpinned` (įrankis sako „SEKOS TVARKA NEAPIMA N MODULIŲ“) — tai ne klaida, o **neišmatuota sritis**: tų ID perstatymo niekas nematytų, nes jų nėra užfiksuotoje sekoje. Užfiksuok juos matomu pakeitimu: `python3 scripts/check_published.py --accept-order` (sausa eiga — pamatyk, ką įrašytų), tada `--accept-order --apply`. Įrankis pats atsisakys, jei jau užfiksuotų ID tvarka pajudėta — tada tai perstatymas, o ne aprėpties spraga: grąžink seną tvarką, o sąmoningą perstatymą keisk `scripts/known_path_order.json` ranka, kad sprendimas būtų matomas `git diff`.
│  5. Patikrink 3 gyvus adresus: `curl -s -o /dev/null -w "%{http_code}" https://one-man-company.github.io/suprask/content/lt/grade-<NN>/<kryptis>/<modulis>.json`.
│ +5a. Jei yra `shell_version_unstamped` (sėkmės eilutė sako „kodo nuorodos su `?v=`: N/M“, N < M) — `index.html` turi kodo nuorodą, kuriai `pages.yml` neprirašė versijos žymės. Tai ne kosmetika: be žymės naršyklė tam failui iki ~10 min. ima seną kopiją iš GitHub Pages tarpinės atminties, tad vaikas gali gauti seną CSS/JS. Nuorodos **nešalink** ir žymos **neįrašyk ranka** — `pages.yml` žymą prirašo statybos metu, o repo `index.html` jos neturi. Taisyk priežastį: `.github/workflows/pages.yml` žymų vartas skaito visas `assets/css|js` nuorodas, tad jei jis raudonas — nuoroda parašyta taip, kad vartas jos neatpažįsta (absoliutus adresas, `//` pradžia, kitas katalogas). Jei vartas žalias, o `unstamped` vis tiek ne tuščias — žymė dingo po statybos; tai publikavimo defektas, pranešk, o ne taisyk turinį. **Niekada nelaikyk „versija <sha>“ įrodymu, kad visos nuorodos pažymėtos** — `_version_of()` ima pirmą radinį (LL-233); vardiklį rodo tik `N/M`.
│ +5b. Jei yra `shell_version_values` daugiau nei vienas įrašas — svetainė **mišri** (pusė failų iš vieno commit'o, pusė iš kito). Tai ne „deploy nepasivijo“: paleisk publikavimą dar kartą ir, jei nepadeda, pranešk kaip sustabdyta.
│  6. Jei viskas sutampa — įrašyk į `research/wiki/changelog.md` vieną eilutę su skaičiais (repo N / paskelbta N).
│
│  ## Ko nedaryti
│ .github/workflows/pages.yml
│ @@ -40,7 +40,7 @@
│            # todėl raštas tinka ir `from './x.js'`, ir `from "./x.js"`,
│            # ir `import('./x.js')`. Anksčiau buvo ieškoma tik dvigubų kabučių,
│            # todėl viengubos likdavo be žymos (LL-38: vartai nemato standarto).
│ -          find _site/assets/js -name "*.js" -print0 | xargs -0 sed -i -E \
│ +          find _site/assets/js -name "*.js" -print0 | xargs -0 -r sed -i -E \
│              "s#(from )(['\"])(\./[^'\"]+\.js)\2#\1\2\3?v=$SHA\2#g; s#(import\()(['\"])(\./[^'\"]+\.js)\2#\1\2\3?v=$SHA\2#g"
│            # Vartai: jei bent vienas santykinis importas liko be žymos, publikavimas
│            # stabdomas. Kitaip deploy būtų žalias, o vaikas iki ~10 min. matytų seną
│ scripts/check_published.py
│ @@ -3323,8 +3323,11 @@
│          reasons.append(
│              f"{len(unstamped)} svetainės kodo nuoroda be `?v=` "
│              f"({', '.join(unstamped[:3])}) — naršyklė gali imti seną failą")
│ -    elif data.get("shell_version_measured") is False and data.get("bytes_checked"):
│ -        # Neperskaityta nėra „visos pažymėtos“ (LL-37).
│ +    elif (data.get("shell_version_measured") is False
│ +          and data.get("bytes_checked") and data.get("live_measured")):
│ +        # Svetainė atsakė, o šio vieno skaitymo nepavyko: ne „visos pažymėtos“
│ +        # (LL-37). Kai svetainė nepasiekiama apskritai, priežastis jau įvardyta
│ +        # aukščiau — antra eilutė tik atrodytų kaip antras defektas.
│          reasons.append("svetainės kodo žymų patikra neįvyko")
│      # Mišri versija: visos nuorodos pažymėtos, bet **skirtingais** commit'ais.
│      # Pusė svetainės iš vieno, pusė iš kito — `_version_of()` to nepasako, nes
Done. Here is the run report.

```
check_published.py (rc 0):
  Repozitorija: 87 moduliai · Paskelbta: 87 · Neišstumta: 0
  missing_on_live / hidden_locally / not_in_path / orphan_files / stale / aux_* = visi []
  garsas 2616/2616 pasiekiami · dydžiai 2616/2616 = Content-Length · vardo maišas 2616/2616
  versija cdd8c73e abiejose pusėse · seka 87/87 žingsnių · rėmas 2727 failai
  verdict ok, reasons []

3 HTTP kodai:
  content/lt/grade-01/matematika/34-dvizenklis-plius-dvizenklis.json  → 200 (7 802 B)
  content/lt/grade-01/pasaulio-pazinimas/08-metu-laikai.json          → 200 (4 389 B)
  content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json          → 200 (5 459 B)
  neigiama kontrolė: matematika/99-nera.json → 404 (4 290 B, atsarginis 404.html)

Sprendimas: IŠTAISYTA
```

Repo ir gyva svetainė sutampa — nieko publikuoti nereikėjo (`87/87`, `0` neišstumtų). Rastas defektas yra ne turinyje, o **mano paties varte**.

Radinys (LL-233). `check_published.py` versiją skaitė iš **pirmo** `?v=` radinio ir skelbė ją visos svetainės versija, o `_shell_state()` prieš baitų lyginimą tą žymę **nuima**. Todėl kodo nuoroda be žymės nepadaro nei „pasenęs kodas“ (baitai lygūs), nei „deploy nepasivijo“ (versija ta pati). Matuota laikiname veidrodyje, `index.html` su trim nuorodom, `print.css` be `?v=`:

- sena versija → `✔ sutampa … versija cdd8c73e`, **rc 0**
- `pages.yml` žingsnis su ta pačia būsena → **rc 0** (abu `sed` kietai įrašyti `main.css`/`app.js`, likutinis vartas skaito tik `assets/js` importus)
- su žyme, bet svetainė iš kito commit'o → teisingai rc 1

Taigi neteisinga būsena buvo pasiekiama, o ne aptinkama.

Ką pakeičiau (`content/`, `index.json`, `path.json`, simuliacijų, CSS, garso, `docs/SVIETIMAS`, `AGENTS.md` nelietęs):

- `scripts/check_published.py` — `shell_version_stamps()` (kiekviena `assets/css|js` nuoroda; atskiri `unstamped` ir visos skirtingos `versions`), `shell_version_check()` (HTTP su keitimo žyme; neperskaityta → `measured False`), 5 `shell_version_*` raktai, `verdict()` priežastys „N kodo nuoroda be `?v=`“, „kodas mišrus“, diagnostinė eilutė, sėkmės eilutė su vardikliu (`2/2`)
- `.github/workflows/pages.yml` — trečias vartas skaito **visas** `index.html` kodo nuorodas (ne tris žinomas — kitaip defektas grįžtų su ketvirta); `xargs -0` → `xargs -0 -r`
- `scripts/probe_shell_version.py` (naujas, 13/13, 0,6 s, be tinklo) — su senuoju kodu krenta (`AttributeError`, rc 1)
- `agents/roles/publikavimo-agentas.md` (5a/5b), `research/wiki/guidelines/pamokos.md` (LL-233), `research/wiki/changelog.md`

Vartai: `validate_content --strict` 0/0 · `check_registry` 87/87/384/87/87, našlaičiai 0 · `check_language --strict` 0/0 · `check_refs` 26/26 · `check_ui` 0/0 · `check_docs_facts` sutampa · `check_audio` 1308/2616 · `check_art` ✔ · `check_lessons` 233 · `check_agents` rc 0 · `curriculum_backlog --check` ✔ · `--scope`/`--path-order`/`--accept-order` rc 0 · visi **29** `probe_*.py` rc 0 · gyvas renderis (`34-dvizenklis-plius-dvizenklis`, 390/360 px) 0 problemų.

Ko neteigiu: kad gyva svetainė šiandien turi defektą — ji turi abi žymes (`2/2`). Pataisyta tai, kad nutrūkimas būtų buvęs nematomas. `git push` nedarytas (bėgiklio darbas).

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-742766f56faefd906b9a189fc74935593f472e040fcedc9950571fa8d26c57fd
```
