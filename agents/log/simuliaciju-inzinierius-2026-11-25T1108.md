# simuliaciju-inzinierius — 2026-11-25T1108

- paleidimas: #536 (manual)
- trukmė: 1476s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/probe536_scan.py
│ @@ -0,0 +1,166 @@
│ +#!/usr/bin/env python3
│ +"""Zondas #536: simuliacijų būsenos invariantai per visas 1 klasės simuliacijas.
│ +
│ +Tikrina tris dalykus, kurių nė vienas esamas vartas nemato:
│ +  1. ar `#sim-readout` nėra tuščias įkėlus (kiekviena būsena turi tekstinį atitikmenį);
│ +  2. ar paspaudus „Iš naujo“ readout grįžta į pradinę reikšmę (LL-16);
│ +  3. ar kiekvienas sim valdiklis turi pasiekiamą vardą.
│ +
│ +Naudojimas:
│ +  .venv/bin/python probe536_scan.py [--base http://127.0.0.1:8985/]
│ +"""
│ +import argparse
│ +import json
│ +import urllib.request
│ +from playwright.sync_api import sync_playwright
│ +
│ +CHROME = "/home/zoltanas/.local/bin/google-chrome"
│ +
│ +
│ +def discover(base):
│ +    url = base.rstrip("/") + "/content/lt/grade-01/index.json"
│ +    with urllib.request.urlopen(url, timeout=20) as r:
│ +        data = json.loads(r.read().decode("utf-8"))
│ +    out = []
│ +    for strand in data.get("strands", []):
│ +        for m in strand.get("modules", []):
│ +            out.append({"id": m["id"], "route": f"{strand['id']}/{m['id']}"})
│ +    return out
│ +
│ +
│ +JS_STATE = r"""
│ +() => {
│ +  const ro = document.getElementById('sim-readout');
│ +  const st = document.getElementById('sim-stage');
│ +  const ct = document.getElementById('sim-controls');
│ +  const note = document.getElementById('sim-note');
│ +  const scope = [st, ct].filter(Boolean);
│ +  const btns = [];
│ +  for (const host of scope) {
│ +    host.querySelectorAll('button,[role=button],input[type=range],input[type=checkbox],input[type=radio],select').forEach(b => {
│ +      const name = (b.getAttribute('aria-label') || b.textContent || '').trim().replace(/\s+/g, ' ');
│ +      const r = b.getBoundingClientRect();
│ +      btns.push({ tag: b.tagName.toLowerCase(), name, w: Math.round(r.width), h: Math.round(r.height),
│ +                  disabled: !!b.disabled, id: b.id || '' });
│ +    });
│ +  }
│ +  return {
│ +    readout: ro ? ro.textContent.trim() : null,
│ +    note: note ? note.textContent.trim() : '',
│ +    btns,
│ +    stageText: st ? st.innerText.trim().slice(0, 120) : '',
│ +  };
│ +}
│ +"""
│ +
│ +
│ +def run(base):
│ +    routes = discover(base)
│ +    rows = []
│ +    with sync_playwright() as pw:
│ +        browser = pw.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│ +        ctx = browser.new_context(viewport={"width": 360, "height": 780}, device_scale_factor=1)
│ +        page = ctx.new_page()
│ +        for r in routes:
│ +            errs = []
│ +            page.on("pageerror", lambda e: errs.append(str(e)[:120]))
│ +            page.on("console", lambda m: errs.append("console: " + m.text[:120]) if m.type == "error" else None)
│ +            url = f"{base.rstrip('/')}/#/modulis/1/{r['route']}"
│ +            try:
│ +                page.goto(url, wait_until="domcontentloaded", timeout=25000)
│ +                page.wait_for_selector(".task", timeout=12000)
│ +            except Exception as exc:
│ +                rows.append({"id": r["id"], "error": f"nepasikrovė: {exc}"[:160]})
│ +                continue
│ +            page.wait_for_timeout(450)
│ +            s0 = page.evaluate(JS_STATE)
│ +            # pirmas ne-reset valdiklis
│ +            reset_idx = None
│ … omitted 88 diff line(s) across 1 additional file(s)/section(s)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe536_scan.py
│ @@ -63,6 +63,7 @@
│          page = ctx.new_page()
│          for r in routes:
│              errs = []
│ +            page = ctx.new_page()
│              page.on("pageerror", lambda e: errs.append(str(e)[:120]))
│              page.on("console", lambda m: errs.append("console: " + m.text[:120]) if m.type == "error" else None)
│              url = f"{base.rstrip('/')}/#/modulis/1/{r['route']}"
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe536_scan.py
│ @@ -72,6 +72,7 @@
│                  page.wait_for_selector(".task", timeout=12000)
│              except Exception as exc:
│                  rows.append({"id": r["id"], "error": f"nepasikrovė: {exc}"[:160]})
│ +                page.close()
│                  continue
│              page.wait_for_timeout(450)
│              s0 = page.evaluate(JS_STATE)
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe536_scan.py
│ @@ -121,7 +121,7 @@
│                  "nameless": nameless, "small": small,
│                  "stageText": s0["stageText"], "errors": errs[:3],
│              })
│ -            page.remove_listener("pageerror", page.listeners("pageerror")[-1]) if False else None
│ +            page.close()
│          browser.close()
│      return rows
│
│ assets/js/sims/calba.js
│ @@ -697,6 +697,8 @@
│            <div id="kz-who" style="font-size:var(--fs-s);color:var(--ink-soft);text-align:center">Spausk „Sekantis žmogus“</div>
│          </div>
│          <div style="display:grid;gap:.4rem;margin-top:.8rem">${barsMarkup()}</div>
│ +        <p id="kz-lead" style="margin:.5rem 0 0;text-align:center;font-weight:800;
│ +           font-size:clamp(.98rem,3.6vw,1.1rem);line-height:1.25;overflow-wrap:anywhere"></p>
│          <div style="margin-top:.8rem;padding:.6rem .8rem;border-left:4px solid var(--sun);border-radius:var(--r-s);background:var(--paper)">
│            <p style="margin:0;font-size:clamp(.98rem,3.6vw,1.1rem)">Pastebėjimų: <strong id="kz-total">0</strong></p>
│            <p id="kz-known" style="margin:.25rem 0 0;font-size:clamp(.98rem,3.6vw,1.1rem);font-weight:800">Kol kas nieko nepastebėjai.</p>
│ assets/js/sims/calba.js
│ @@ -609,6 +609,44 @@
│      function topGroups() {
│        const best = groups.reduce((m, g) => Math.max(m, counts[g.id]), 0);
│        return groups.filter((g) => counts[g.id] === best);
│ +    }
│ +
│ +    /* Kas dabar pirmauja — modelio būsena, kuri iki šiol buvo rodoma TIK
│ +       juostų ilgiu ir skaičiumi prie jų. Vaikas, kuris nemato spalvos ar
│ +     

… PRALEISTA 14571 SIMBOLIŲ IŠ 32571 (įrankių išklotinės) — visa ataskaita: agents/work/simuliaciju-inzinierius/00536/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

s veikia ir be garso, ir be spalvos. */
│        const observed = said || (quietText || "Nieko nesakė");
│ -      api.readout(`${observed} Jau sutikai ${zmones(seen)} iš ${people.length}.`
│ +      /* „Nieko nesakė“ neturi sakinio pabaigos, o „Labas!“ turi savo —
│ +         todėl taškas pridedamas tik tada, kai jo nėra (be šito readout
│ +         skaitytų „Nieko nesakė Jau sutikai…“). */
│ +      const observedLine = /[.!?]$/.test(observed) ? observed : `${observed}.`;
│ +      api.readout(`${observedLine} Jau sutikai ${zmones(seen)} iš ${people.length}.`
│          + (leadChanged ? ` ${leadChanged}` : leadText() ? ` ${leadText()}` : ""));
│        /* Duomenys pasikeitė — todėl vaiko pasirinkimas tikrinamas iš naujo,
│           o ne laikomas galiojančiu (LL-17). */
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe536_sveikinasi.py
│ @@ -38,7 +38,7 @@
│        const ro = document.getElementById('sim-readout');
│        const counts = {};
│        document.querySelectorAll('[id^="kz-n-"]').forEach(e => { counts[e.id.replace('kz-n-','')] = Number(e.textContent); });
│ -      const opts = [...document.querySelectorAll('#kz-options [data-opt]')].map(b => b.textContent.replace(/^[•✓]\s*/, '').trim());
│ +      const opts = [...document.querySelectorAll('#kz-options [data-opt]')].map(b => b.textContent.replace(/^[\s•✓]+/, '').trim());
│        const verdict = document.getElementById('kz-verdict');
│        return { readout: ro.textContent.trim(), lead: lead ? lead.textContent.trim() : '',
│                 counts, opts, verdict: verdict ? verdict.textContent.trim() : '',
│ content/lt/grade-01/lietuviu-kalba/04-kaip-zmones-sveikinasi.json
│ @@ -60,7 +60,7 @@
│          { "label": "Labas!", "group": "zodis" },
│          { "label": "Labas rytas!", "group": "zodis" },
│          { "label": "Labas!", "group": "zodis" },
│ -        { "label": "Labas!", "group": "zodis" }
│ +        { "label": "Sveiki!", "group": "zodis" }
│        ]
│      }
│    },
│ research/wiki/guidelines/pamokos.md
│ @@ -1384,4 +1384,4 @@
│  - **Simptomas:** 2026-11-25 (#536) elgsenos zondas per visas 82 pirmos klasės simuliacijas (360 px, po `.task` atsiradimo skaitomas `#sim-readout`) rado lygiai vieną modulį, kuriame readout įkėlus buvo **tuščias** — `04-kaip-zmones-sveikinasi` (`assets/js/sims/calba.js`, komponentas `kaipZmonesSveikinasi`). Simuliacija nupiešdavo lentelę su trimis grupėmis, nurodymą „Spausk „Sekantis žmogus““ ir `api.note`, bet `api.readout` pirmą kartą buvo kviečiamas tik apdorojus pirmą paspaudimą; „Iš naujo“ rašydavo „Tyrimas pradėtas iš naujo.“ be tolesnio veiksmo. Vaikas, kuris negirdi balso arba skaito ekrano skaitytuvu, įėjęs į modulį negavo nė vieno sakinio apie tai, kokia yra modelio būsena ir ką daryti. Nė vienas vartas to nematė: `validate_content.py --grade 1 --strict` 0 klaidų / 0 įspėjimų, `check_ui.py` 0/0, `check_audio.py` „Garsas pilnas: 1212 tekstų, 2426 įrašų“, `check_registry.py --grade 1` „PROBLEMŲ: 0“, `check_view.py` (82 maršrutai × 3 plotai) 246 patikros, 0 problemų. Antras to paties modelio sluoksnis: dauguma buvo rodoma TIK juostos ilgiu ir skaičiumi prie jos — jokio sakinio, kuris pasakytų „daugiausia — „Linktelėjo““, nebuvo nė viename žingsnyje.
│  - **Priežastis:** readout buvo suprastas kaip **įvykio** pranešimas, o ne kaip **būsenos** atitikmuo. Kiekviena `api.readout(...)` eilutė stovėjo `nextEl` ir `reset` apdorojime, todėl pradinė būsena (kuri sukuriama `render()` metu ir neturi įvykio) liko neįvardyta. Tai ne LL-11 (užduotis, kuri reikalauja tik balso) ir ne LL-187 (tušti mazgai, kurių nemato matuoklis): tekstas egzistavo, bet tik po veiksmo, o būsena prieš veiksmą buvo nutylėta. Trečia priežastis — vartai matuoja **matomumą** (ar telpa, ar ≥ 14 px, ar ≥ 48 px), bet ne **turinį**: tuščias `aria-live` mazgas yra 0 aukščio ir 0 pločio, todėl jo niekas nematuoja ir jis niekada nepatenka į pranešimą.
│  - **Taisyklė:** kiekvienas komponentas `mount()` pabaigoje įrašo **pradinės būsenos** `api.readout` — tą patį sakinį, kurį vaikas išgirstų, jei būtų paspaudęs pirmą veiksmą, bet be įvykio: ką modelis rodo dabar ir ką daryti toliau. Jei modelio būsena turi skaičių, palyginimą ar daugumą, jis įvardijamas žodžiu toje pačioje scenoje (ne tik juostos ilgiu), o ne paliekamas išvedamam iš paveikslo. „Iš naujo“ grąžina ne tik duomenis, bet ir tą patį pradinį sakinį (LL-16), o pasikeitimas (lyderis, fazė, rezultatas) sakomas atskiru sakiniu tik tada, kai tikrai įvyksta (LL-14).
│ -- **Patikra:** zondas, kuris iš `content/lt/grade-01/index.json` sudaro sąrašą, atidaro kiekvieną modulį 360 px pločio, palaukia `.task` ir perskaito `#sim-readout` **nepaspaudęs nė vieno valdiklio**. Prieš pataisą: 82 moduliai, tuščių — 1 (`04-kaip-zmones-sveikinasi`). Po pataisos: 82 moduliai, tuščių — 0; tame modulyje readout = „Pastebėjimų dar nėra. Spausk „Sekantis žmogus“ ir žiūrėk, kaip žmonės sveikinasi.“, o „Iš naujo“ → „Tyrimas pradėtas iš naujo. Spausk „Sekantis žmogus“.“. Neigiama kontrolė: tas pats zondas su moduliu, kurio readout rašomas tik po veiksmo (`git stash`), vėl randa 1 tuščią — įrankis nemato to, ko nėra, tik tada, kai jo tikrai nėra.
│ +- **Patikra:** zondas, kuris iš `content/lt/grade-01/index.json` sudaro sąrašą, atidaro kiekvieną modulį 360 px pločio, palaukia `.task` ir perskaito `#sim-readout` **nepaspaudęs nė vieno valdiklio**. Prieš pataisą: 82 moduliai, tuščių — 1 (`04-kaip-zmones-sveikinasi`). Po pataisos: 82 moduliai, tuščių — 0; tame modulyje readout = „Pastebėjimų dar nėra. Spausk „Sekantis žmogus“ ir žiūrėk, kaip žmonės sveikinasi.“, o „Iš naujo“ → „Tyrimas pradėtas iš naujo. Spausk „Sekantis žmogus“.“. Neigiamoji kontrolė yra pats pirmasis bėgimas: tas pats zondas prieš pataisą rado lygiai vieną tuščią readout, o po pataisos — nė vieno, tad tuštuma matoma, o ne praleidžiama.
│ agents/proposals/2026-11-25-simuliaciju-inzinierius-readout-ikelus.json
│ @@ -0,0 +1,17 @@
│ +{
│ +  "role": "simuliaciju-inzinierius",
│ +  "run_id": 536,
│ +  "created": "2026-11-25T11:29:20+02:00",
│ +  "type": "struktura",
│ +  "title": "Pradinė simuliacijos būsena gali neturėti jokio teksto, o nė vienas vartas to nemato",
│ +  "body": "Patikrinau visas 82 pirmos klasės simuliacijas 360 px pločio: po puslapio įkėlimo (kol vaikas dar nieko nepaspaudė) `#sim-readout` buvo tuščias lygiai viename modulyje — `04-kaip-zmones-sveikinasi`. Simuliacija piešė lentelę, bet `api.readout` pirmą kartą kviečiamas tik apdorojus pirmą paspaudimą, todėl vaikas, kuris negirdi balso arba skaito ekrano skaitytuvu, negavo nė vieno sakinio apie tai, kokią būseną mato ir ką daryti. Nė vienas vartas to nemato, nes jie matuoja matomumą (plotį, šriftą, lietimo lauką), o tuščias `aria-live` mazgas yra 0 aukščio ir 0 pločio, tad į matavimo imtį nepatenka. `docs/KURINIO-STANDARTAS.md` §4 jau reikalauja, kad kiekviena būsena turėtų tekstinį atitikmenį (`api.readout`), bet reikalavimas neturi vartų. Siūloma `scripts/check_view.py` matavime (tame pačiame praėjime, kur tikrinama `sim` būsena) nuskaityti `#sim-readout` tekstą iškart po `.task` atsiradimo ir po paspaudimo „Iš naujo“, jei toks yra, ir pranešti kiekvieną modulį, kuriame tekstas tuščias. Tai pigi patikra be naujų priklausomybių: ji naudoja tą patį naršyklės praėjimą ir tą patį maršrutų sąrašą.",
│ +  "target": "scripts/check_view.py",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "docs/KURINIO-STANDARTAS.md §4: „Kiekviena būsena turi tekstinį atitikmenį (api.readout), kad veiktų be garso“",
│ +    "assets/js/sims/calba.js (kaipZmonesSveikinasi: readout įkėlus buvo tuščias, ištaisyta #536)",
│ +    "research/wiki/guidelines/pamokos.md LL-194",
│ +    "/home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe536_scan.py — zondas per 82 modulius: prieš pataisą tuščių 1, po pataisos 0"
│ +  ]
│ +}
Darbas atliktas. Šiame paleidime nebuvo eilės pasiūlymo, kurio tikslas būtų `assets/js/sims/` — pasirinkau (c) kelią: pašalinti aiškų trūkumą simuliacijoje, kurį radau savo zondais.

KAS PAKEISTA
1) `assets/js/sims/calba.js` — komponentas `kaipZmonesSveikinasi` (modulis `04-kaip-zmones-sveikinasi`):
   - Pradinė būsena dabar turi tekstinį atitikmenį: iki šiol `#sim-readout` įkėlus modulį buvo tuščias (readout buvo rašomas tik apdorojus paspaudimą). Dabar `mount()` pabaigoje: „Pastebėjimų dar nėra. Spausk „Sekantis žmogus“ ir žiūrėk, kaip žmonės sveikinasi.“, o „Iš naujo“ grąžina tą patį su instrukcija.
   - Modelio būsena „kas dabar dauguma“ iki šiol buvo rodoma TIK juostos ilgiu ir skaičiumi. Pridėta `#kz-lead` eilutė ir to paties turinio `api.readout`: „Daugiausia — „Linktelėjo“.“ arba, kai lygu, „Dvi grupės lygios: „Žodžiu“ ir „Linktelėjo“.“
   - Lyderio pasikeitimas įvardijamas tik įvykus: „Pasikeitė: anksčiau daugiausia buvo „Linktelėjo“, dabar — „Žodžiu“.“
   - Readout nebepraleidžia sakinio pabaigos („Nieko nesakė. Jau sutikai 1 žmogų iš 8.“), o kiekviename žingsnyje yra ir pastebėjimas, ir kiekis, ir dauguma.
2) `content/lt/grade-01/lietuviu-kalba/04-kaip-zmones-sveikinasi.json` — `sim.config.people` perstatyta taip, kad modelis TIKRAI apverstų išvadą (naudojami tik jau įrašyti garso tekstai, naujų mp3 nereikia):
   1–2 Žmogus linkteli → „Visi sutikti žmonės linkteli“; 3–6 → „Daugiausia … linkteli“; 7 → lygybė 3:3; 8 → „Daugiausia sutiktų žmonių sveikinasi žodžiu“.
3) `research/wiki/guidelines/pamokos.md` — nauja pamoka LL-194 („Simuliacija, kuri pradeda tyliai: būsena yra, teksto nėra“).
4) `agents/proposals/2026-11-25-simuliaciju-inzinierius-readout-ikelus.json` — pasiūlymas vartams (`scripts/check_view.py`): nė vienas įrankis neskaito `#sim-readout` turinio įkėlus, o tuščias aria-live mazgas yra 0 dydžio, todėl į matavimą nepatenka.

KLAIDINGA NUOSTATA, KURI DABAR PANEIGIAMA
„Iš vieno pastebėjimo galiu pasakyti apie visus“ ir „pirma išvada lieka galutinė“. Anksčiau modelis rodė tik apimties pokytį (visi sutikti → daugiausia) ir daugumos grupė niekada nesikeitė; dabar septintas pastebėjimas duoda lygybę, aštuntas apverčia daugumą priešinga kryptimi, ir tai pasakoma žodžiu, ne tik juostos ilgiu.

TIKRA VARTŲ IŠVESTIS
  python3 scripts/validate_content.py --grade 1 --strict → „0 klaidų, 0 įspėjimų“, RC 0
  python3 scripts/check_ui.py → „Perskaityta: 12 simuliacijų failų · 0 klaidų, 0 įspėjimų“
  python3 scripts/check_language.py --grade 1 --strict → „82 moduliai · klaidos: 0 · įspėjimai: 0“
  python3 scripts/check_view.py --base http://127.0.0.1:8985/ → „Patikrinta: 246 (maršrutų: 82 · plotų: 3) · problemos: 0“
  check_view --module 04-kaip-zmones-sveikinasi --viewports small --text-scale 200 → „problemos: 0 · Tekstas telpa ir 200 % dydžiu“
  python3 scripts/check_audio.py → „Garsas pilnas: 1213 tekstų, 2426 įrašų, naudojama 2426 iš 2426 mp3“
  python3 scripts/check_registry.py --grade 1 → „index 82 · failai 82 · sim 82 · našlaičiai 0 · PROBLEMŲ: 0“
  check_lessons → 194 įrašai; check_docs_facts → 0 klaidų; check_refs → 27/27; check_art → 9 failai

360 PX EKRANE (playwright, trys zondai)
  probe536_scan.py (82 moduliai @360, readout skaitomas NEPASPAUDUS nė vieno valdiklio): prieš pataisą tuščių readout — 1 (`04-kaip-zmones-sveikinasi`), po pataisos — 0; konsolės klaidų 0.
  probe536_sveikinasi.py: kiekviename iš 8 žingsnių readout netuščias ir įvardija daugumą; teisingą išvadą zondas apskaičiuoja pats iš `#kz-n-*` skaičių ir patikrina, kad simuliacija priima būtent ją („Tinka…“), o abu kiti variantai atmetami („Netinka…“); lyderio pasikeitimai — tik 7 ir 8 žingsniuose; `simDone` atsiranda tik po teisingos galutinės išvados (patikrinta ir @360, ir @320).
  Geometrija @360: dokumento perteklius 0, visi sim mygtukai ≥ 48 px, `#kz-lead` dešinys kraštas 331 px (riba 360), šriftas 15,68 px; 200 % tekste — perteklius 0, taip pat 0; Tab + Enter veikia, fokusas po Enter lieka tame pačiame mygtuke.

PASTABA
`research/wiki/curriculum/backlog.json` ir `backlog.md` darbo metu buvo pergeneruoti kito proceso (11:08:50, `modules_now` 77 → 82) — aš jų nelytėjau; palikti darbinėje kopijoje tokie, kokie buvo.

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-0b51bea612e9509211685461b47eb3f5d5c27f6a674b3e194365f173c7ce78cf
```
