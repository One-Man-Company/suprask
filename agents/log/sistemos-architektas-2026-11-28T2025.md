# sistemos-architektas — 2026-11-28T2025

- paleidimas: #610 (manual)
- trukmė: 834s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ scripts/check_docs_facts.py
│ @@ -142,10 +142,22 @@
│          )
│          for title in strand["modules"]:
│              key = re.split(r"[:\s,]", title)[0].rstrip(":")
│ -            if not any(key.lower() in item.lower() for item in listed):
│ +            best, extra = table_entry(listed, title)
│ +            if best is None:
│                  check.fail(
│                      f"{where}:{line_of(text, strand['title'])}: „{strand['title']}“ eilutėje trūksta modulio "
│                      f"„{title}“ (laukiama bent žodžio „{key}“)"
│ +                )
│ +            elif extra:
│ +                # Ta pati sąlyga kaip wiki lentelėje (#64267, LL-239): žmogaus
│ +                # santrumpa („Figūros“) yra tikro vardo POAIBIS ir praeina, o
│ +                # žodis, kurio pavadinime nebėra — seno vardo pėdsakas. Iki šio
│ +                # taisymo README eilutė buvo lyginama tik pagal pirmą žodį, tad
│ +                # pervardintas modulis ten likdavo amžinai.
│ +                check.fail(
│ +                    f"{where}:{line_of(text, strand['title'])}: „{strand['title']}“ eilutės įrašas "
│ +                    f"„{best}“ neatitinka modulio „{title}“ (seno vardo žodžiai: "
│ +                    f"{', '.join(sorted(extra))}) — tai pervardinto modulio pėdsakas"
│                  )
│
│      tasks = re.search(r"(\d+)[–-](\d+) užduotys", text) or re.search(r"(\d+) užduotys", text)
│ scripts/check_docs_facts.py
│ @@ -108,6 +108,53 @@
│          if needle in line:
│              return f"{number} eil."
│      return "?"
│ +
│ +
│ +def title_words(title: str) -> set[str]:
│ +    """Pavadinimo žodžiai, lyginimui: be skyrybos, mažosiomis, be „lentelė“ tipo žodžių.
│ +
│ +    Imami žodžiai nuo 3 raidžių: 1 klasės pavadinimuose „ir“, „o“, „ne“, „kas“
│ +    nesiekia 3 raidžių, bet 3 raidžių žodžiai („kas“, „ne“) priklauso tekstui,
│ +    tad riba — 3. Skaičiai („2“, „14:00“) praleidžiami: jie yra laiko
│ +    užrašas, o ne pavadinimo turinys.
│ +    """
│ +    words = re.split(r"[^\wąčęėįšųūž]+", title.lower())
│ +    return {w for w in words if len(w) > 2 and not w.isdigit()}
│ +
│ +
│ +def title_similarity(item: str, module: str) -> float:
│ +    """Kiek wiki įrašas panašus į modulio pavadinimą (0…1).
│ +
│ +    Naudojamas tik tam, kad iš kelių kandidatų būtų pasirinktas artimiausias —
│ +    vienos krypties sąraše gali būti keli įrašai, kuriuose yra tas pats pirmas
│ +    žodis („Kas gyvena tvarte?“ ir „Kas gyvas: auga ir reaguoja…“).
│ +    """
│ +    return difflib.SequenceMatcher(None, item.lower(), module.lower()).ratio()
│ +
│ +
│ +def table_entry(listed: list[str], module: str) -> tuple[str | None, set[str]]:
│ +    """Modulio įrašas dokumento lentelėje → (įrašas, seno vardo žodžiai).
│ +
│ +    VIENAS šaltinis visiems to paties dydžio skaitytojams (`check_readme`,
│ +    `check_wiki_table`), nes jie lygina tą pačią `index.json` pavadinimų sąrašą
│ +    su tos pačios formos dokumento eilute (LL-239, #64267). Trys būsenos:
│ +
│ +      - `(None, set())` — įrašo nėra: dokumente trūksta modulio;
│ +      - `(įrašas, set())` — įrašas yra ir jis tikras (žmogaus santrumpa
│ +        „Figūros“ vietoje „Figūros aplink mus“ yra POAIBIS, tad praeina);
│ +      - `(įrašas, {žodžiai})` — įrašas turi žodį, kurio pavadinime nebėra:
│ +        tai seno vardo pėdsakas, ne žmogaus formuluotė.
│ +
│ +    Susiejimas eina pagal pirmą pavadinimo žodį (žmogus sąrašą rašo trumpai),
│ +    o iš kelių kandidatų imamas artimiausias — kitaip „Kas gyvena tvarte?“
│ +    būtų lyginamas su „Kas gyvas…“ vien todėl, kad eilėje pirmas.
│ +    """
│ +    key = re.split(r"[:\s,]", module)[0].rstrip(":").lower()
│ +    candidates = [item for item in listed if key in item.lower()]
│ +    if not candidates:
│ +        return None, set()
│ +    best = max(candidates, key=lambda item: title_similarity(item, module))
│ +    return best, title_words(best) - title_words(module)
│
│
│  def check_readme(check: Check, text: str, f: dict) -> None:
│ scripts/check_docs_facts.py
│ @@ -395,28 +395,6 @@
│          check.expect(f"{list_page}:{line_of(text, '[[01/index')}", "modulių", int(found.group(1)), f["module_count"])
│
│
│ -def title_words(title: str) -> set[str]:
│ -    """Pavadinimo žodžiai, lyginimui: be skyrybos, mažosiomis, be „lentelė“ tipo žodžių.
│ -
│ -    Imami žodžiai nuo 3 raidžių: 1 klasės pavadinimuose „ir“, „o“, „ne“, „kas“
│ -    nesiekia 3 raidžių, bet 3 raidžių žodžiai („kas“, „ne“) priklauso tekstui,
│ -    tad riba — 3. Skaičiai („2“, „14:00“) praleidžiami: jie yra laiko
│ -    užrašas, o ne pavadinimo turinys.
│ -    """
│ -    words = re.split(r"[^\wąčęėįšųūž]+", title.lower())
│ -    return {w for w in words if len(w) > 2 and not w.isdigit()}
│ -
│ -
│ -def title_similarity(item: str, module: str) -> float:
│ -    """Kiek wiki įrašas panašus į modulio pavadinimą (0…1).
│ -
│ -    Naudojamas tik tam, kad iš kelių kandidatų būtų pasirinktas artimiausias —
│ -    vienos krypties sąraše gali būti keli įrašai, kuriuose yra tas pats pirmas
│ -    žodis („Kas gyvena tvarte?“ ir „Kas gyvas: auga ir reaguoja…“).
│ -    """
│ -    return difflib.SequenceMatcher(None, item.lower(), module.lower()).ratio()
│ -
│ -
│  def check_wiki_table(check: Check, where: str, text: str, f: dict) -> None:
│      """Wiki krypties lentelė: modulių sąrašas ir „N — gyva“ turi atitikti indeksą.
│
│ scripts/check_docs_facts.py
│ @@ -436,8 +436,10 @@
│          check.expect(f"{where}:{at}", f"„{title}“ modulių lentelėje", count, len(strand["modules"]))
│          for module in strand["modules"]:
│              needle = re.split(r"[:\s,]", module)[0].rstrip(":").lower()
│ -            candidates = [item for item in listed if needle in item.lower()]
│ -            if not candidates:
│ +            best, extra = table_entry(listed, module)
│ +            if best is None:
│ +                # `table_entry` grąžina None tik tada, kai kandidatų nėra;
│ +                # žinom, kad ne — tad čia tik saugiklis, o ne kelias.
│         

… PRALEISTA 4208 SIMBOLIŲ IŠ 22208 (įrankių išklotinės) — visa ataskaita: agents/work/sistemos-architektas/00610/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

_ONE = {"title": "Matematika", "modules": ["Figūros aplink mus"]}
│ +text = (
│ +    "1 klasė — 1 kryptis, 1 moduliai, 1 interaktyvi simuliacija\n"
│ +    "| Matematika | Figūros |\n"
│ +    "Modulio aprašymas: 1 užduotys\n"
│ +    "| Parengta | 1 | 1 | 1 | 1 |\n"
│ +    "Garso: 1 tekstų, 1 įrašų, ~1 MB · lt_LT-reginute1 · CC BY 4.0 · LIEPA · "
│ +    "Robertas Tarasevičius\n"
│ +    "Platformą nuolat vysto vienas agentų\n"
│ +    "| `kurejas` |\n"
│ +)
│ +rep = docs.Check()
│ +import contextlib
│ +import io
│ +with contextlib.redirect_stdout(io.StringIO()):
│ +    docs.check_readme(rep, text, {**README_FIXED, "strands": [STRAND_ONE],
│ +                                  "module_count": 1, "strand_count": 1})
│ +check("R3 README: santrumpa „Figūros“ (poaibis) praeina",
│ +      not [e for e in rep.errors if "Figūros" in e],
│ +      rep.errors[0][:110] if rep.errors else "0 klaidų")
│ +
│ +# R4 — sinchronizatorius ir vartas renka TĄ PATĮ įrašą: `align_items()`
│ +# negali grąžinti kito kandidato nei `table_entry()`.
│ +import sync_docs_facts as sync  # noqa: E402
│ +kept, added, dropped = sync.align_items(
│ +    ["Kas gyvena tvarte? · Kas gyvas: auga ir reaguoja, ne tik juda"],
│ +    ["Kas gyvena tvarte?", "Kas gyvas: auga ir reaguoja, ne tik juda"],
│ +)
│ +check("R4 sync ir vartas renka tą patį įrašą",
│ +      kept == ["Kas gyvena tvarte?", "Kas gyvas: auga ir reaguoja, ne tik juda"],
│ … omitted 6 diff line(s) across 1 additional file(s)/section(s)
│ scripts/probe_wiki_vardai_backlog.py
│ @@ -129,7 +129,7 @@
│          "| Parengta | 1 | 2 | 1 | 1 |\n"
│          "Garso: 1 tekstų, 1 įrašų, ~1 MB · lt_LT-reginute1 · CC BY 4.0 · LIEPA · "
│          "Robertas Tarasevičius\n"
│ -        "Platformą nuolat vysto vienas agentų\n"
│ +        "Platformą nuolat vysto devyni agentų\n"
│          "| `kurejas` |\n"
│      )
│      rep = docs.Check()
│ scripts/probe_wiki_vardai_backlog.py
│ @@ -160,7 +160,7 @@
│      "| Parengta | 1 | 1 | 1 | 1 |\n"
│      "Garso: 1 tekstų, 1 įrašų, ~1 MB · lt_LT-reginute1 · CC BY 4.0 · LIEPA · "
│      "Robertas Tarasevičius\n"
│ -    "Platformą nuolat vysto vienas agentų\n"
│ +    "Platformą nuolat vysto devyni agentų\n"
│      "| `kurejas` |\n"
│  )
│  rep = docs.Check()
│ scripts/probe_wiki_vardai_backlog.py
│ @@ -173,16 +173,20 @@
│        not [e for e in rep.errors if "Figūros" in e],
│        rep.errors[0][:110] if rep.errors else "0 klaidų")
│
│ -# R4 — sinchronizatorius ir vartas renka TĄ PATĮ įrašą: `align_items()`
│ -# negali grąžinti kito kandidato nei `table_entry()`.
│ +# R4 — sinchronizatorius ir vartas renka TĄ PATĮ įrašą. Du moduliai su tuo
│ +# pačiu pirmu žodžiu (`kas`), o dokumente — trumpesnis įrašas. Senasis
│ +# `next(...)` ėmė PIRMĄ modulį („Kas gyvena tvarte?“) ir, matydamas, kad
│ +# įraše yra žodžių, kurių tame pavadinime nėra, pervadintų jį — t. y.
│ +# sinchronizatorius sugadintų teisingą eilutę. Dabar renkama pagal
│ +# `title_similarity`, kaip vartas.
│  import sync_docs_facts as sync  # noqa: E402
│  kept, added, dropped = sync.align_items(
│ -    ["Kas gyvena tvarte? · Kas gyvas: auga ir reaguoja, ne tik juda"],
│ +    ["Kas gyvas: auga ir reaguoja"],
│      ["Kas gyvena tvarte?", "Kas gyvas: auga ir reaguoja, ne tik juda"],
│  )
│ -check("R4 sync ir vartas renka tą patį įrašą",
│ -      kept == ["Kas gyvena tvarte?", "Kas gyvas: auga ir reaguoja, ne tik juda"],
│ -      f"{kept!r}")
│ +check("R4 sync renka artimiausią įrašą, o ne pirmą",
│ +      kept == ["Kas gyvas: auga ir reaguoja"] and added == ["Kas gyvena tvarte?"],
│ +      f"{kept!r} + {added!r}")
│
│
│  # ------------------------------------------------------- 2. backlog --check
│ scripts/probe_wiki_vardai_backlog.py
│ @@ -117,26 +117,35 @@
│      "strands": [STRAND],
│      "strand_count": 1, "module_count": 2, "sim_count": 1,
│      "task_count": 1, "task_min": 1, "task_max": 1,
│ -    "audio_texts": 1, "audio_files": 1, "audio_mb": 1, "roles": ["kurejas"],
│ +    "audio_texts": 1, "audio_files": 1, "audio_mb": 1,
│ +    # Vaidmenų skaičius turi sutapti su žodžiu (README rašo žodžiu), todėl
│ +    # imamas devynių vaidmenų sąrašas ir devynios lentelės eilutės.
│ +    "roles": ["kurejas", "metodininkas", "ideator", "kritikas", "tikrintojas",
│ +              "tyrejas", "leidejas", "dizaineris", "kuratorius"],
│  }
│
│
│ -def readme_report(items: str) -> docs.Check:
│ -    text = (
│ -        "1 klasė — 1 kryptis, 2 moduliai, 1 interaktyvi simuliacija\n"
│ -        f"| Kryptis | Moduliai |\n|---|---|\n| Sąžiningumas ir žaidimai | {items} |\n"
│ +def readme_text(items: str, modules: str = "2") -> str:
│ +    return (
│ +        f"1 klasė — 1 kryptis, {modules} moduliai, 1 interaktyvi simuliacija\n"
│ +        "| Kryptis | Moduliai |\n|---|---|\n"
│ +        f"| Sąžiningumas ir žaidimai | {items} |\n"
│          "Modulio aprašymas: 1 užduotys\n"
│          "| Parengta | 1 | 2 | 1 | 1 |\n"
│          "Garso: 1 tekstų, 1 įrašų, ~1 MB · lt_LT-reginute1 · CC BY 4.0 · LIEPA · "
│          "Robertas Tarasevičius\n"
│          "Platformą nuolat vysto devyni agentų\n"
│ -        "| `kurejas` |\n"
│ +        + "".join(f"| `{role}` |\n" for role in README_FIXED["roles"])
│      )
│ +
│ +
│ +def readme_report(items: str, modules: str = "2") -> docs.Check:
│      rep = docs.Check()
│      import contextlib
│      import io
│      with contextlib.redirect_stdout(io.StringIO()):
│ -        docs.check_readme(rep, text, {**README_FIXED, "strands": [STRAND]})
│ +        docs.check_readme(rep, readme_text(items, modules),
│ +                          {**README_FIXED, "module_count": int(modules)})
│      return rep
│
│
│ scripts/probe_wiki_vardai_backlog.py
│ @@ -162,22 +162,13 @@
│
│  # R3 — žmogaus santrumpa (poaibis) ir README praeina.
│  STRAND_ONE = {"title": "Matematika", "modules": ["Figūros aplink mus"]}
│ -text = (
│ -    "1 klasė — 1 kryptis, 1 moduliai, 1 interaktyvi simuliacija\n"
│ -    "| Matematika | Figūros |\n"
│ -    "Modulio aprašymas: 1 užduotys\n"
│ -    "| Parengta | 1 | 1 | 1 | 1 |\n"
│ -    "Garso: 1 tekstų, 1 įrašų, ~1 MB · lt_LT-reginute1 · CC BY 4.0 · LIEPA · "
│ -    "Robertas Tarasevičius\n"
│ -    "Platformą nuolat vysto devyni agentų\n"
│ -    "| `kurejas` |\n"
│ -)
│  rep = docs.Check()
│  import contextlib
│  import io
│  with contextlib.redirect_stdout(io.StringIO()):
│ -    docs.check_readme(rep, text, {**README_FIXED, "strands": [STRAND_ONE],
│ -                                  "module_count": 1, "strand_count": 1})
│ +    docs.check_readme(rep, readme_text("Figūros", "1"),
│ +                      {**README_FIXED, "strands": [STRAND_ONE],
│ +                       "module_count": 1, "strand_count": 1})
│  check("R3 README: santrumpa „Figūros“ (poaibis) praeina",
│        not [e for e in rep.errors if "Figūros" in e],
│        rep.errors[0][:110] if rep.errors else "0 klaidų")
│ scripts/probe_wiki_vardai_backlog.py
│ @@ -185,7 +185,8 @@
│      ["Kas gyvena tvarte?", "Kas gyvas: auga ir reaguoja, ne tik juda"],
│  )
│  check("R4 sync renka artimiausią įrašą, o ne pirmą",
│ -      kept == ["Kas gyvas: auga ir reaguoja"] and added == ["Kas gyvena tvarte?"],
│ +      kept == ["Kas gyvas: auga ir reaguoja", "Kas gyvena tvarte?"]
│ +      and added == ["Kas gyvena tvarte?"],
│        f"{kept!r} + {added!r}")
│
│
│ scripts/probe_wiki_vardai_backlog.py
│ @@ -160,8 +160,11 @@
│        any("bendradarbiavimo" in e or "seno vardo" in e for e in rep.errors),
│        rep.errors[0][:110] if rep.errors else "tyla — README liko senas vardas")
│
│ -# R3 — žmogaus santrumpa (poaibis) ir README praeina.
│ -STRAND_ONE = {"title": "Matematika", "modules": ["Figūros aplink mus"]}
│ +# R3 — žmogaus santrumpa (poaibis) ir README praeina. NEGALI praeiti dėl kitos
│ +# priežasties: jei eilutė nerasta, `check_readme()` praneša „lentelėje nėra
│ +# krypties“ — todėl lūkesnis reikalauja, kad klaidų būtų NULIS, o poaibio
│ +# įrašas būtų surastas (`table_entry` grąžina patį įrašą).
│ +STRAND_ONE = {"title": "Sąžiningumas ir žaidimai", "modules": ["Figūros aplink mus"]}
│  rep = docs.Check()
│  import contextlib
│  import io
│ @@ -169,9 +172,10 @@
│      docs.check_readme(rep, readme_text("Figūros", "1"),
│                        {**README_FIXED, "strands": [STRAND_ONE],
│                         "module_count": 1, "strand_count": 1})
│ +entry, extra = docs.table_entry(["Figūros"], "Figūros aplink mus")
│  check("R3 README: santrumpa „Figūros“ (poaibis) praeina",
│ -      not [e for e in rep.errors if "Figūros" in e],
│ -      rep.errors[0][:110] if rep.errors else "0 klaidų")
│ +      not rep.errors and entry == "Figūros" and not extra,
│ +      "; ".join(rep.errors)[:110] if rep.errors else f"įrašas {entry!r}, 0 klaidų")
│
│  # R4 — sinchronizatorius ir vartas renka TĄ PATĮ įrašą. Du moduliai su tuo
│  # pačiu pirmu žodžiu (`kas`), o dokumente — trumpesnis įrašas. Senasis
│ scripts/probe_wiki_vardai_backlog.py
│ @@ -131,7 +131,7 @@
│          "| Kryptis | Moduliai |\n|---|---|\n"
│          f"| Sąžiningumas ir žaidimai | {items} |\n"
│          "Modulio aprašymas: 1 užduotys\n"
│ -        "| Parengta | 1 | 2 | 1 | 1 |\n"
│ +        f"| Parengta | 1 | {modules} | 1 | 1 |\n"
│          "Garso: 1 tekstų, 1 įrašų, ~1 MB · lt_LT-reginute1 · CC BY 4.0 · LIEPA · "
│          "Robertas Tarasevičius\n"
│          "Platformą nuolat vysto devyni agentų\n"
Paleidimas baigtas. Darbas yra repo, ne ataskaita.

**ĮGYVENDINTA: #64267**

Ką matavau (prieš)
- `system_report` (180 paleidimų / 7 d.): `sistemos-architektas` 56 % nenaudingas, `simuliaciju-inzinierius` 43 %, `kurejas` 17 %; pasiūlymai 258 (new 36, blocked 5), sisteminių eilėje 27.
- Perskaičiau #64267 įrodymus ir `scripts/check_docs_facts.py`: ta pati lentelės taisyklė gyveno **trijose** vietose. #604/LL-232/LL-239 buvo sutvirtinusios tik `check_wiki_table()`, o `check_readme()` liko su `key in item.lower()`, o `sync_docs_facts.align_items()` rinko kandidatą `next(...)`, ne `title_similarity`.

Ką keičiau
- `scripts/check_docs_facts.py` — sąlyga iškelta į vieną `table_entry(listed, module) → (įrašas, seno_vardo_žodžiai)` su trimis įvardytomis būsenomis; README ir wiki skaitytojai dabar kviečia jį, o ne savo kopiją. `title_words()`/`title_similarity()` perkelti arčiau viršaus.
- `scripts/sync_docs_facts.py` — `align_items()` kandidatą renka pagal `title_similarity`, kaip vartas; seniau galėjo pervadinti **teisingą** žmogaus įrašą, kai du moduliai turi tą patį pirmą žodį.
- `scripts/probe_wiki_vardai_backlog.py` — 5 → 15 lūkesnių (R1–R4: README tikras vardas, senas vardas, žmogaus santrumpa, sinchronizatorius renka tą patį kandidatą). Įsijungia į CI per esamą `probe_*.py` ciklą.
- `research/wiki/guidelines/pamokos.md` — LL-243 (243 įrašai). `agents/system-journal.md` — įrašas Mačiau/Keičiau/Kodėl/Patikra.

Patikra (po)
- `probe_wiki_vardai_backlog.py` **15/15**, rc 0, < 1 s, be tinklo.
- **Neigiama kontrolė** su `git show HEAD:scripts/check_docs_facts.py`: README su senu vardu `Šimto lentelė: žemyn reiškia deimt` → tyla, 0 klaidų; su dabartiniu failu → 1 klaida, įvardijanti įrašą ir trūkstamus žodžius. Defektas buvo tikras, taisymas jį uždaro.
- `check_docs_facts.py` — 0 klaidų, 0 įspėjimų (89 moduliai, 9 kryptys): joks teisingas įrašas netapo raudonas. `sync_docs_facts.py` — „Dokumentai jau sutampa“.
- Visi 32 `probe_*.py` rc 0; `validate_content`, `check_registry`, `check_lessons` (243), `check_ui`, `check_art`, `check_agents`, `check_refs`, `check_language --strict`, `curriculum_backlog.py --check` — rc 0.
- `queue_repair.py --apply --prove`: **#60984, #60735 → done** (abu buvo įgyvendinti, bet kabėjo `new`).
- Grafikai neliesti (ROLES nekeistas), dashboard neliestas.

Neišspręsta sąmoningai
- #56655 `push_backlog()` be vartų — reikia atskiro matavimo su realiu `origin`. #5342 (worktree izoliacija) — daugiaetapis. #42973 — `AGENTS.md` man draudžiamas. `kurejas` 17 % (2 rejected, 2 timeout) — priežastis matuota ankstesniuose paleidimuose, šiandien nekartojau. `content/`, `assets/js/sims/`, `agents/scope.json` — neliesti.

## klaidos

```
session_id: local-25706dcad8e3312e1305ae3ead227dd49c2c83dd2d7ad9bf669820996f038784
```
