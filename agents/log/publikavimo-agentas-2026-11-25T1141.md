# publikavimo-agentas — 2026-11-25T1141

- paleidimas: #537 (manual)
- trukmė: 552s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_published.py
│ @@ -1280,6 +1280,44 @@
│  # Kiek užklausų teko kartoti po laikinos klaidos. Skaičius išvedamas, o ne
│  # nuslopinamas: tylus kartojimas paslėptų flakuojančią svetainę (LL-37).
│  RETRIES = {"count": 0}
│ +# Kiek 404 pasirodė buvę krašto **neigiama** kopija (#50319). Tai atskiras
│ +# skaičius nuo `RETRIES`: ten laikina klaida (503, timeout), čia — atsakymas,
│ +# kurį kraštas atidavė iš savo 404 kopijos. Sąmoningai rodomas pranešime, nes
│ +# „failo nėra“ ir „kraštas dar nepersikrovė“ turi likti atskiri (LL-21, LL-37).
│ +CDN_REFRESH = {"count": 0, "items": []}
│ +
│ +
│ +def cache_busted(url: str) -> str:
│ +    """Tas pats adresas su keitimo žyme — apeina krašto neigiamą kopiją."""
│ +    sep = "&" if "?" in url else "?"
│ +    return f"{url}{sep}cb={int(time.time() * 1000)}"
│ +
│ +
│ +def refetch_after_gone(url: str, rel: str) -> bytes | None:
│ +    """Vienas pakartojimas su keitimo žyme, kai pirmas atsakymas buvo 404/410.
│ +
│ +    Kodėl tai ne tas pats, kas `fetch_answer()` kartojimas. 404 yra
│ +    **atsakymas** (#386), ir jo kartoti be priežasties negalima: tikro
│ +    nebuvimo atveju tai būtų tik dvigubas srautas. Bet kraštas (GitHub Pages
│ +    per Fastly) laiko ir **neigiamą** 404 kopiją, o ką tik atsiradęs kelias —
│ +    naujas ar pervadintas modulis, naujas kodo failas, naujai įjungta klasė —
│ +    kurį laiką atsako 404 būtent iš jos. Paleidimas #526: pirmas nekešuotas
│ +    GET į `03-sakinio-zodziai.json` → 404 / 563 B (`x-cache: HIT`,
│ +    `age: 42`), tas pats adresas su `?cb=` → 200 / 5 459 B, baitiškai lygus
│ +    repo. Vaikui tai ne „failo nėra“, o „puslapis dar nepersikrovė“.
│ +
│ +    Todėl kartojama **vieną kartą** ir **tik su keitimo žyme**: žymė apeina
│ +    krašto raktą, o tikro nebuvimo neatveria (GitHub Pages 404 atsako ir su
│ +    `?cb=`). Atsakymas 200 grąžinamas kaip įprasti baitai, o įrašas
│ +    `CDN_REFRESH` pasako, kad pirmas atsakymas buvo 404 — kitaip pranešimas
│ +    vaidintų, jog pirmas bandymas pavyko (LL-21, LL-37).
│ +    """
│ +    status, blob = fetch_answer(cache_busted(url), attempts=1)
│ +    if status != "ok" or blob is None:
│ +        return None
│ +    CDN_REFRESH["count"] += 1
│ +    CDN_REFRESH["items"].append(rel)
│ +    return blob
│
│
│  def fetch_answer(url: str, timeout: int = 20,
│ scripts/check_published.py
│ @@ -1403,9 +1403,14 @@
│      status, live = fetch_answer(LIVE_ROOT + url_rel)
│      if status == "missing":
│          # Atsakymas gautas: failo svetainėje nėra. Tai ne ryšio klaida ir ne
│ -        # pasenęs turinys — nėra ko lyginti baitais (LL-21).
│ -        return "gone", len(local), -1
│ -    if live is None:
│ +        # pasenęs turinys — nėra ko lyginti baitais (LL-21). Bet 404 gali būti
│ +        # ir krašto neigiama kopija, kuri laikoma po pervadinimo ar naujo
│ +        # publikavimo (#50319), todėl vienas pakartojimas su keitimo žyme.
│ +        # Jei ir jis 404 — būsena lieka „gone“ ir pranešama kaip iki šiol.
│ +        live = refetch_after_gone(LIVE_ROOT + url_rel, url_rel)
│ +        if live is None:
│ +            return "gone", len(local), -1
│ +    elif live is None:
│          return "unreachable", len(local), -1
│      if sha(live) != sha(local):
│          # LL-76: pirmomis sekundėmis po deploymento kraštas gali būti mišrus.
│ scripts/check_published.py
│ @@ -1475,9 +1475,13 @@
│      status, live = fetch_answer(LIVE_ROOT + rel)
│      if status == "missing":
│          # Svetainė kodo failo neturi: tai nepasibaigęs publikavimas, o ne
│ -        # ryšio klaida (#386, ta pati LL-21 šeima kaip `compare()`).
│ -        return "gone", len(local), -1
│ -    if live is None:
│ +        # ryšio klaida (#386, ta pati LL-21 šeima kaip `compare()`). Kodo
│ +        # failas po deploy'o taip pat būna krašto neigiamoje kopijoje, tad
│ +        # vienas pakartojimas su keitimo žyme (#50319); likus 404 — „gone“.
│ +        live = refetch_after_gone(LIVE_ROOT + rel, rel)
│ +        if live is None:
│ +            return "gone", len(local), -1
│ +    elif live is None:
│          return "unreachable", len(local), -1
│      for attempt in (0, 1):
│          if strip_version(live.decode("utf-8", "replace")) == strip_version(local.decode("utf-8", "replace")):
│ scripts/check_published.py
│ @@ -589,6 +589,13 @@
│                  return "ok", int(resp.headers.get("Content-Length") or 0)
│          except urllib.error.HTTPError as exc:
│              if exc.code in (404, 410):
│ +                # Krašto neigiama kopija (#50319): naujas kodas, garsas ar
│ +                # klasės katalogas kurį laiką atsako 404 būtent iš jos.
│ +                # Vienas pakartojimas su keitimo žyme; jei ir jis 404 —
│ +                # tai atsakymas, ne ryšio gedimas (LL-37).
│ +                blob = refetch_after_gone(LIVE_ROOT + url_rel, url_rel)
│ +                if blob is not None:
│ +                    return "ok", len(blob)
│                  return "missing", -1
│              if attempt == 0:
│                  time.sleep(1.5)  # LL-76: kraštas po deploymento būna mišrus
│ scripts/check_published.py
│ @@ -1648,11 +1648,17 @@
│      # patikra ėjo per tą pačią svetainę ir rado viską (LL-21, LL-120 vienu
│      # lygiu aukščiau: priežastis, kurios niekas neperskaitė).
│      for name in ("index.json", "path.json"):
│ -        status, blob = fetch_answer(f"{LIVE_ROOT}content/lt/{gd}/{name}")
│ +        url_rel = f"content/lt/{gd}/{name}"
│ +        status, blob = fetch_answer(LIVE_ROOT + url_rel)
│          if status == "missing":
│ -            # 404 — atsakymas, ne gedimas: failo svetainėje nėra.
│ -            out["live_gone"].append(f"{gd}/{name}")
│ -            break
│ +            # 404 — atsakymas, ne gedimas: failo svetainėje nėra. Bet ką tik
│ +            # įjungtos klasės indeksas būna krašto neigiamoje kopijoje, tad
│ +            # vienas pakartojimas su keitimo žyme (#50319). Likus 404 —
│ +            # `live_gone`, kaip iki šiol.
│ +            blob = refetch_after

… PRALEISTA 23227 SIMBOLIŲ IŠ 41227 (įrankių išklotinės) — visa ataskaita: agents/work/publikavimo-agentas/00537/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

e `compare()` su pakartojimu → `ok`, o pakartojimą išjungus (elgsena iki #537) → `gone`, nors baitai (43 B) abiejose pusėse vienodi. Tikrame bėgime 2026-11-25 `cdn_refreshed` buvo `[]` — 82 modulių ir 2 426 garso failų patikra nepradėjo nė vieno bereikalingo pakartojimo, tad žymė nepaverčia įrankio lėtesniu.
│ +
│ scripts/check_published.py
│ @@ -1440,9 +1440,13 @@
│      if sha(live) != sha(local):
│          # LL-76: pirmomis sekundėmis po deploymento kraštas gali būti mišrus.
│          time.sleep(1.5)
│ -        live = fetch(LIVE_ROOT + url_rel)
│ -        if live is None:
│ -            return "unreachable", len(local), -1
│ +        status, again = fetch_answer(LIVE_ROOT + url_rel)
│ +        if again is None:
│ +            # Antras matavimas irgi neatsakė turiniu: 404 čia yra atsakymas,
│ +            # ne ryšio klaida (ta pati #386 taisyklė); `fetch()` šioje vietoje
│ +            # šį skirtumą prarasdavo ir 404 virsdavo „unreachable“.
│ +            return ("gone" if status == "missing" else "unreachable"), len(local), -1
│ +        live = again
│      return ("ok" if sha(live) == sha(local) else "differs"), len(local), len(live)
│
│
│ scripts/check_published.py
│ @@ -1518,9 +1518,11 @@
│          if attempt == 0:
│              # LL-76: pirmomis sekundėmis po deploymento kraštas gali būti mišrus.
│              time.sleep(2.5)
│ -            live = fetch(LIVE_ROOT + rel)
│ -            if live is None:
│ -                return "unreachable", len(local), -1
│ +            status, again = fetch_answer(LIVE_ROOT + rel)
│ +            if again is None:
│ +                # Kaip `compare()`: 404 antrą kartą yra atsakymas, ne tinklas.
│ +                return ("gone" if status == "missing" else "unreachable"), len(local), -1
│ +            live = again
│      return "differs", len(local), len(live)
│
│
│ scripts/probe_publish_sets.py
│ @@ -551,6 +551,40 @@
│          httpd5.shutdown()
│          httpd5.server_close()
│          cp.LIVE_ROOT = url
│ +
│ +        # T. Skirtingi baitai pirmu matavimu, o antras matavimas — 404
│ +        #    (LL-76 pakartojimas). Tai atsakymas, ne tinklo gedimas: būsena
│ +        #    turi likti `gone`, o ne virsti `unreachable`.
│ +        class _StaleThenGone(_QuietHandler):
│ +            sent = {"n": 0}
│ +
│ +            def do_GET(self):  # noqa: N802
│ +                if "01-a.json" in self.path:
│ +                    if self.sent["n"] == 0:
│ +                        self.sent["n"] += 1
│ +                        body = b'{"id": "01-a", "title": "senas"}'
│ +                        self.send_response(200)
│ +                        self.send_header("Content-Type", "application/json")
│ +                        self.send_header("Content-Length", str(len(body)))
│ +                        self.end_headers()
│ +                        self.wfile.write(body)
│ +                        return
│ +                    self.send_error(404)
│ +                    return
│ +                super().do_GET()
│ +
│ +        httpd6 = http.server.ThreadingHTTPServer(
│ +            ("127.0.0.1", 0), functools.partial(_StaleThenGone, directory=str(live)))
│ +        threading.Thread(target=httpd6.serve_forever, daemon=True).start()
│ +        cp.LIVE_ROOT = f"http://127.0.0.1:{httpd6.server_address[1]}/"
│ +        state, _, _ = cp.compare(
│ +            repo / "content" / "lt" / "grade-01" / "matematika" / "01-a.json",
│ +            "content/lt/grade-01/matematika/01-a.json")
│ +        check("T: antro matavimo 404 → `gone`, ne `unreachable`",
│ +              state == "gone", f"būsena {state}")
│ +        httpd6.shutdown()
│ +        httpd6.server_close()
│ +        cp.LIVE_ROOT = url
│      finally:
│          if httpd is not None:
│              httpd.shutdown()
│ scripts/probe_publish_sets.py
│ @@ -53,7 +53,9 @@
│       kopija“). Iki #537 toks atvejis virsdavo `live_missing` ir
│       „sustabdyta“, tad sekantis agentas eidavo ieškoti ištrinto turinio;
│    S  tas pats kelias 404 **ir su žyme** → vis dar `live_missing`, rc 1:
│ -     pakartojimas negali paversti tikro nebuvimo žalia.
│ +     pakartojimas negali paversti tikro nebuvimo žalia;
│ +  T  baitai skiriasi, o LL-76 pakartojimas atsako 404 → `gone`, o ne
│ +     `unreachable`: 404 lieka atsakymu ir antru matavimu.
│
│  Repo failai nekeičiami: viskas vyksta `tempfile` kataloge, kuris ištrinamas.
│  Zondą galima paleisti bet kada, taip pat kaip regresijos patikrą.
│ research/wiki/changelog.md
│ @@ -7,7 +7,7 @@
│  - **Būsena prieš darbą (`python3 scripts/check_published.py`, rc 0):** „Repozitorija: 82 moduliai / Klasės: grade-01 (statusas „live“ iš content/lt/grades.json) / Paskelbta: 82 moduliai“ (`grade-01`: repo 82, gyvai 82); `missing_on_live`, `hidden_locally`, `not_in_path`, `orphan_files`, `missing_in_repo`, `live_missing`, `live_gone`, `stale*`, `aux_*`, `shell_*` — visi `[]`; `path_reordered` `[]`, `path_inserted_midsequence` 9 (įvardyti, įterpimas į vidurį leidžiamas); garsas **2 426/2 426**, vardai 2 426/2 426, dydžiai 2 426/2 426; svetainės kodas 19 failų; `live_version` = `repo_version` = `54b427f4`, `unpushed_commits` 0; pervedamas ID vienas (`03-sakinio-tvarka` → `03-sakinio-zodziai`, `alias_ok: true`); `verdict` = „sutampa“. Tai reiškia, kad #526 pataisymas (`assets/js/app.js`, adresas po pervadinimo) svetainėje jau baitas į baitą.
│  - **3 gyvi adresai (`curl`, kodas ir baitai):** `content/lt/grade-01/matematika/04-skaiciu-tiese.json` → **200** (4 972 B); `content/lt/grade-01/lietuviu-kalba/03-sakinio-zodziai.json` → **200** (5 459 B, pervadinimo įpėdinis); `content/lt/grade-01/pasaulio-pazinimas/10-gyvunu-grupes.json` → **200** (8 685 B). **Neigiama kontrolė:** `content/lt/grade-01/matematika/99-nera.json` → **404** (563 B), tad 200 aukščiau yra atsakymas, o ne bendras krašto elgesys.
│  - **Defektas ir taisymas (LL-195, pasiūlymas #50319).** #386 taisyklė „404 yra atsakymas, todėl nekartojamas“ teisinga tikram nebuvimui, bet ne krašto **neigiamai** kopijai: #526 pirmas nekešuotas GET į ką tik pervadintą failą grąžino 404 / 563 B su `x-cache: HIT`, `age: 42`, o tas pats adresas su `?cb=` — 200 / 5 459 B. Įrankis tokį atvejį skelbė `live_missing` ir „sustabdyta“, tad sekantis agentas eidavo ieškoti ištrinto turinio. Dabar `scripts/check_published.py` turi `refetch_after_gone()`: kai pirmas atsakymas 404/410, tas pats adresas pakartojamas **vieną kartą** ir **tik su keitimo žyme** (`?cb=<laikas>`); 200 → ta pati būsena „ok“ su įrašu `cdn_refreshed` / `cdn_refreshed_count` (pranešime atskira eilutė „CDN NEIGIAMA KOPIJA“ ir sėkmės eilutėje), o jei ir su žyme 404 — būsena lieka „gone“ ir pranešama kaip iki šiol. Tas pats kelias įjungtas `compare()`, `_shell_state()`, `head_state()` (garso HEAD) ir `check_grade()` klasės `index.json` / `path.json`: vienas defektas, ne vienas failas (LL-21).
│ -- **Įrodymas repo (`scripts/probe_publish_sets.py` → 36/36, rc 0, be interneto).** R: veidrodis, kuris pirmą GET į `01-a.json` be žymės atsako 404, o su `?cb=` — 200 → `verdict sutampa`, `live_missing []`, `cdn_refreshed_count 1`, rc 0 ir pranešime yra „CDN NEIGIAMA KOPIJA“; tas pats per `head_state()` → `ok`, 43 B. S: tas pats kelias 404 ir su žyme → vis dar `live_missing ['01-a']`, `cdn_refreshed_count 0`, rc 1. **Neigiama kontrolė atskirai:** tame pačiame veidrodyje `compare()` su pakartojimu → `ok`, o pakartojimą išjungus (elgsena iki #537) → `gone`; 43 B abiejose pusėse, tad skiriasi tik būsena, ne failas.
│ +- **Įrodymas repo (`scripts/probe_publish_sets.py` → 36/36, rc 0, be interneto).** R: veidrodis, kuris pirmą GET į `01-a.json` be žymės atsako 404, o su `?cb=` — 200 → `verdict sutampa`, `live_missing []`, `cdn_refreshed_count 1`, rc 0 ir pranešime yra „CDN NEIGIAMA KOPIJA“; tas pats per `head_state()` → `ok`, 43 B. S: tas pats kelias 404 ir su žyme → vis dar `live_missing ['01-a']`, `cdn_refreshed_count 0`, rc 1. **Neigiama kontrolė atskirai:** tame pačiame veidrodyje `compare()` su pakartojimu → `ok`, o pakartojimą išjungus (elgsena iki #537) → `gone`; 43 B abiejose pusėse, tad skiriasi tik būsena, ne failas. T: baitai skiriasi, o LL-76 pakartojimas atsako 404 → `gone`, ne `unreachable` (anksčiau ši vieta 404 paversdavo „nepasiekta“).
│  - **Vartai po pakeitimo:** `validate_content.py` 0/0; `check_registry.py` „kryptys 9 · index 82 · failai 82 · užduotys 359 (optional 82) · sim 82 · path 82 · našlaičiai 0 / PROBLEMŲ: 0“; `check_language.py` 0 klaidų / 0 įspėjimų (82 moduliai, 55 pastabos); `check_audio.py` „Garsas pilnas: 1 213 tekstų, 2 426 įrašų“; `check_lessons.py` 195 įrašai; `check_refs.py` 27 nuorodos rc 0; `check_docs_facts.py` sutampa; `probe_publish_sets.py` 36/36.
│  - **Būsena po darbo (`check_published.py`, rc 0):** repo 82 / paskelbta 82, garsas 2 426/2 426, kodas 19 failų, `live_version` = `54b427f4`, 0 neišstumtų commit'ų, `cdn_refreshed` `[]` (nė vienas 404 nebuvo neigiama kopija), `verdict` = „sutampa“. **Sprendimas: sutampa** — keistas tik įrankis `scripts/check_published.py` ir jo zondas; `content/**`, `assets/**`, modulių ID, seka ir vaiko `localStorage` raktai neliesti, push nedarytas (bėgiklio darbas).
│
ĮGYVENDINTA: #50319

check_published.py išvestis (repo / paskelbta / neišstumta)
  Repozitorija: 82 moduliai · Klasės: grade-01 („live“ iš content/lt/grades.json) · Paskelbta: 82 moduliai
  · grade-01: repo 82, gyvai 82 · garsas 2 426/2 426 (dydžiai 2 426/2 426, vardai 2 426/2 426)
  · kodas 19 failų, live_version = repo_version = 54b427f4, neišstumta 0, cdn_refreshed []
  · missing_on_live / hidden_locally / not_in_path / orphan_files / missing_in_repo / live_missing /
    live_gone / stale* / aux_* / shell_* — visi [] ; path_reordered [] ; verdict „sutampa“, rc 0

3 gyvi adresai (curl, kodas ir baitai)
  matematika/04-skaiciu-tiese.json → 200 (4 972 B)
  lietuviu-kalba/03-sakinio-zodziai.json → 200 (5 459 B)
  pasaulio-pazinimas/10-gyvunu-grupes.json → 200 (8 685 B)
  neigiama kontrolė matematika/99-nera.json → 404 (563 B)

Kas buvo negerai ir kas pakeista
  #386 taisyklė „404 yra atsakymas, todėl nekartojamas“ teisinga tikram nebuvimui, bet ne krašto neigiamai kopijai: #526 pirmas nekešuotas GET į ką tik pervadintą failą grąžino 404/563 B (`x-cache: HIT`, `age: 42`), o su `?cb=` — 200/5 459 B. Įrankis tokį atvejį skelbė `live_missing` + „sustabdyta“, ir sekantis agentas eidavo ieškoti ištrinto turinio.
  - `scripts/check_published.py` — naujas `refetch_after_gone()`: 404/410 atveju tas pats adresas pakartojamas VIENĄ kartą ir TIK su keitimo žyme; 200 → ta pati būsena „ok“ su įrašu `cdn_refreshed` / `cdn_refreshed_count` (atskira eilutė „CDN NEIGIAMA KOPIJA“ ir sėkmės eilutėje), o 404 ir su žyme → `gone`, kaip iki šiol. Įjungta `compare()`, `_shell_state()`, `head_state()` (garsas) ir `check_grade()` klasės `index.json`/`path.json`. Papildomai LL-76 pakartojime 404 nebevirsta „unreachable“.
  - `scripts/probe_publish_sets.py` — nauji atvejai R (404 → 200 su žyme → sutampa, rc 0, priežastis įvardyta), S (404 ir su žyme → vis dar `live_missing`, rc 1), T (baitai skiriasi, antras matavimas 404 → `gone`, ne `unreachable`). **36/36, rc 0.**
  - `research/wiki/guidelines/pamokos.md` — LL-195 (naujas defekto tipas: atsakymas iš krašto neigiamos kopijos laikomas faktu).
  - `research/wiki/changelog.md` — #537 įrašas su skaičiais ir įrodymu.

Vartai po pakeitimo
  `validate_content.py` 0/0 · `check_registry.py` „index 82 · failai 82 · užduotys 359 · sim 82 · path 82 · našlaičiai 0 / PROBLEMŲ: 0“ · `check_language.py` 0/0 · `check_audio.py` 2 426 įrašų · `check_lessons.py` 195 · `check_refs.py` 27/27 · `check_docs_facts.py` sutampa · `probe_check_published.py` 15/15 · `probe_publish_sets.py` 36/36.
  Neigiama kontrolė atskirai: tame pačiame veidrodyje `compare()` su pakartojimu → `ok`, o pakartojimą išjungus (elgsena iki #537) → `gone`, baitai 43 B abiejose pusėse.

Sprendimas: **sutampa**. Keisti tik įrankis ir jo zondas; `content/**`, `assets/**`, modulių ID, seka ir vaiko `localStorage` raktai neliesti, `git push` nedarytas — tai atlieka bėgiklis.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-1b373dd05b4ddc0e2fa32d2eddd359dd21e7f34d8be0a8881cd5a991b913311d
```
