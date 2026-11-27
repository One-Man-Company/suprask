# simuliaciju-inzinierius — 2026-11-27T1103

- paleidimas: #578 (manual)
- trukmė: 4769s
- modelio išėjimas: 0 (pirminis statusas: ok)
- galutinis sprendimas: `agents/runs.db` laukas `status` ir `detail`
- modelis: hermes:deepseek41flash

## Ataskaita

│ assets/js/sims/matematika.js
│ @@ -1191,6 +1191,8 @@
│
│      let box = 0;           // kiek kubelių įdėta (vienintelis kintamasis)
│      let locked = true;     // kol vaikas nepasakė spėjimo, dėti negalima
│ +    let guess = null;      // vaiko spėjimas: kiek kubelių dėžutėje
│ +    let compared = false;  // spėjimas palyginamas su tuo, kas įvyko, vieną kartą
│      let flipped = false;   // ta pati būsena perskaityta kita kryptimi
│      let reported = false;
│      let lastSaid = "";
│ assets/js/sims/matematika.js
│ @@ -1319,6 +1319,10 @@
│      }
│
│      /* --- būsena ------------------------------------------------------- */
│ +    // Proza — iš `sim.config.sentences` (LL-42): ekrane ir garse tas pats
│ +    // sakinys turi vieną šaltinį. Atsarginis tekstas suformuluotas kitais
│ +    // žodžiais ir pasirodo tik tada, kai modulis sakinio nepateikė.
│ +    const line = (key, fallback) => String(say[key] || fallback || "").trim();
│      function sayOnce(key) {
│        const t = say[key];
│        if (!t || lastSaid === key) return;
│ @@ -1326,23 +1330,38 @@
│        api.speak(t);
│      }
│
│ +    /* Spėjimas yra duomuo, o ne durys (LL-15): jis palyginamas su tuo, kas
│ +       įvyko, pirmos lygybės metu ir tik vieną kartą. Skaičiai — modelio, ne
│ +       teksto: kai vaikas jau pasiekė lygybę, pasakymas „dėžutėje tiek“
│ +       nebeatstoja atsakymo, o paaiškina, kuo prognozė skyrėsi. */
│ +    function guessResult() {
│ +      if (compared || guess === null || diff() !== 0) return "";
│ +      compared = true;
│ +      if (guess === box) return `Spėjai ${guess}. Tiek pat, kiek dėžutėje.`;
│ +      return guess > box
│ +        ? `Spėjai ${guess}, o dėžutėje ${box}. Prognozė buvo didesnė.`
│ +        : `Spėjai ${guess}, o dėžutėje ${box}. Prognozė buvo mažesnė.`;
│ +    }
│ +
│      function feedback() {
│        const d = diff();
│        if (locked) {
│ -        api.readout("Kiek kubelių reikia įdėti? Pasakyk, tada dėk.");
│ +        api.readout(promptGuess || "Kiek kubelių reikia įdėti? Pasakyk, tada dėk.");
│          return;
│        }
│        if (d > 0) {
│ -        api.readout("Kairė sunkesnė");
│ +        api.readout(line("kaire", "Kairėje daugiau."));
│          msg.textContent = box === 0 ? "Dėžutė tuščia. Įdėk kubelį." : "Per daug. Išimk po vieną.";
│          sayOnce("kaire");
│        } else if (d < 0) {
│ -        api.readout("Dešinė sunkesnė");
│ +        api.readout(line("desine", "Dešinėje daugiau."));
│          msg.textContent = box === 0 ? "Dėžutė tuščia. Įdėk kubelį." : "Dar trūksta.";
│          sayOnce("desine");
│        } else {
│ -        api.readout(flipped ? "Ta pati lygybė" : "Abi pusės lygios");
│ -        msg.textContent = `${known} ir ${box} yra ${whole}. Abi pusės lygios.`;
│ +        const cmp = guessResult();
│ +        const head = line(flipped ? "ta-pati" : "lygios", flipped ? "Ta pati lygybė." : "Abi pusės lygios.");
│ +        api.readout(cmp || head);
│ +        msg.textContent = cmp || `${known} ir ${box} yra ${whole}. Abi pusės lygios.`;
│          sayOnce(flipped ? "ta-pati" : "lygios");
│          if (!reported) { reported = true; api.progress({ correct: true }); }
│        }
│ assets/js/sims/matematika.js
│ @@ -1182,6 +1182,8 @@
│      const whole = Math.max(1, Math.min(20, Number(config.whole ?? 8)));
│      const maxBox = Math.max(1, Math.min(20, Number(config.maxBox ?? 10)));
│      const say = config.sentences || {};
│ +    // Klausimas prieš pirmą judesį — iš config, kaip ir kiti sakiniai (LL-42).
│ +    const promptGuess = String(say.spekim || "").trim();
│      const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
│
│      const CX = 180;        // ašis
│ assets/js/sims/matematika.js
│ @@ -1216,8 +1216,16 @@
│        </div>`;
│
│      controls.innerHTML = `
│ -      <div id="sv-guess" style="display:flex;justify-content:center">
│ -        <button class="btn" id="sv-start">Pradedu dėti</button>
│ +      <div id="sv-guess" style="display:grid;gap:.45rem;justify-items:center;max-width:34rem;margin:0 auto">
│ +        <p id="sv-guess-q" style="margin:0;font-family:var(--font-head);font-weight:800;font-size:1.02rem;line-height:1.3;text-align:center">Kiek kubelių reikia įdėti į dėžutę? Pirmiausia spėk.</p>
│ +        <div style="display:flex;gap:.45rem;flex-wrap:wrap;justify-content:center">
│ +          <button class="btn secondary" type="button" data-guess="0" style="min-width:56px">0</button>
│ +          <button class="btn secondary" type="button" data-guess="1" style="min-width:56px">1</button>
│ +          <button class="btn secondary" type="button" data-guess="2" style="min-width:56px">2</button>
│ +          <button class="btn secondary" type="button" data-guess="3" style="min-width:56px">3</button>
│ +          <button class="btn secondary" type="button" data-guess="4" style="min-width:56px">4</button>
│ +          <button class="btn secondary" type="button" data-guess="5" style="min-width:56px">5</button>
│ +        </div>
│        </div>
│        <div id="sv-tools" style="display:none;gap:.6rem;flex-wrap:wrap;justify-content:center;align-items:center">
│          <button class="btn" id="sv-plus">Įdėk 1</button>
│ assets/js/sims/matematika.js
│ @@ -1452,20 +1452,37 @@
│      });
│
│      // Tas pats atrakinimas ir balsui, ir įrašytam spėjimui (pamoka LL-11).
│ -    function startAdding(guess) {
│ +    // Spėjimas yra SĄLYGA, o ne pasirinkimas (LL-110): kol jo nėra, dėti
│ +    // negalima, o atsisakymas paaiškinamas ir nukreipia į spėjimo mygtukus.
│ +    function startAdding(n) {
│ +      if (!Number.isFinite(n) || n < 0) {
│ +        api.readout(promptGuess || "Pirmiausia spėk: kiek kubelių reikia įdėti?");
│ +        api.note("Spėk skaičių, tada dėk kubelius. Spėjimas nėra atsakymas — jį palyginsi su tuo, kas įvyks.");
│ +        const first = controls.querySelector("[data-guess]");
│ +        if (first) first.focus({ preventScroll: true });
│ +        return;
│ +      }
│ 

… PRALEISTA 14061 SIMBOLIŲ IŠ 32061 (įrankių išklotinės) — visa ataskaita: agents/work/simuliaciju-inzinierius/00578/ataskaita-visa.md (katalogas `agents/work/` į repo neįtraukiamas)

 +        return ""
│ +    nxt = text.find("\nconst ", i + len(START))
│ +    return text[i:nxt if nxt > 0 else len(text)]
│ +
│ +
│ +def check() -> list[str]:
│ +    problems: list[str] = []
│ +    src = SIM.read_text(encoding="utf-8")
│ +    block = sim_block(src)
│ +    if not block:
│ +        return [f"nėra sim objekto `{START}` — zondas neturi ko tikrinti"]
│ +
│ +    # T1: spėjimo negalima praleisti — nėra atrakinimo be reikšmės.
│ +    if re.search(r"startAdding\(\s*NaN\s*\)", block):
│ +        problems.append("T1: `startAdding(NaN)` tebėra — spėjimą galima praleisti (LL-110)")
│ +    if re.search(r"startAdding\((?:undefined|null)\)", block):
│ +        problems.append("T1: `startAdding(undefined/null)` — spėjimas nebūtinas")
│ +    if not re.search(r"function startAdding\(n\)\s*\{[^}]{0,400}Number\.isFinite\(n\)", block, re.S):
│ +        problems.append("T1: `startAdding()` netikrina, ar spėjimas tikrai duotas")
│ +
│ +    # T2: spėjimas saugomas ir palyginamas su tuo, kas įvyko.
│ +    if "let guess = null" not in block:
│ +        problems.append("T2: nėra `guess` būsenos — spėjimas nepamenuojamas")
│ +    if "function guessResult()" not in block:
│ +        problems.append("T2: nėra `guessResult()` — spėjimas su rezultatu nepalyginamas (LL-15)")
│ +    if not re.search(r"guessResult\(\)", block.split("function guessResult")[-1]):
│ +        problems.append("T2: `guessResult()` apibrėžtas, bet ekrane nekviečiamas")
│ +    if not re.search(r"\$\{guess\}", block):
│ +        problems.append("T2: pranešime nėra vaiko spėjimo skaičiaus")
│ +    if not re.search(r"box\}", block):
│ +        problems.append("T2: palyginime nėra dėžutės skaičiaus — nėra su kuo lyginti")
│ +
│ +    # T3: palyginimas vienkartinis (ne kas kadrą) ir tik pasiekus lygybę.
│ +    if "let compared = false" not in block or "compared = true" not in block:
│ +        problems.append("T3: palyginimas nekartojamas vieną kartą — trūksta `compared` vėliavėlės")
│ +    if not re.search(r"if \(compared \|\| guess === null[^)]*\) return", block):
│ +        problems.append("T3: `guessResult()` nepaiso `compared`/`guess` — sakinys kartosis")
│ +
│ +    # T4: tuščias laukas nėra spėjimas 0 (`Number("") === 0`).
│ +    if not re.search(r"if \(!String\(value \|\| \"\"\)\.trim\(\)\)", block):
│ +        problems.append("T4: tuščias skaičiaus laukas priimamas kaip spėjimas 0")
│ … omitted 24 diff line(s) across 1 additional file(s)/section(s)
│ assets/js/sims/matematika.js
│ @@ -1434,7 +1434,11 @@
│        lastSaid = "";
│        paint();
│        feedback();
│ -      msg.textContent = "Pradedam iš naujo. Dėžutė tuščia.";
│ +      // Spėjimas nepametamas ir po „Iš naujo“ (LL-16): jis liko vaiko
│ +      // prognozė, o palyginimas jau įvyko — kartoti jo nereikia.
│ +      msg.textContent = guess === null
│ +        ? "Iš naujo. Dėžutė tuščia."
│ +        : `Iš naujo. Dėžutė tuščia, o spėjimas liko ${guess}.`;
│      }
│
│      /* --- įėjimai ------------------------------------------------------ */
│ assets/js/sims/matematika.js
│ @@ -1475,7 +1475,16 @@
│          if (first) first.focus({ preventScroll: true });
│          return;
│        }
│ -      guess = Math.min(maxBox, Math.round(n));
│ +      if (n > maxBox) {
│ +        // Nekerpame tyliai (LL-37): pasakome modelio ribą, o ne paverčiame
│ +        // spėjimą kitu skaičiumi.
│ +        api.readout(`Į dėžutę telpa ne daugiau kaip ${maxBox} kubelių.`);
│ +        api.note(`Pasirink skaičių iki ${maxBox} — tiek kubelių telpa į dėžutę.`);
│ +        const first = controls.querySelector("[data-guess]");
│ +        if (first) first.focus({ preventScroll: true });
│ +        return;
│ +      }
│ +      guess = Math.round(n);
│        locked = false;
│        guessAsk.remove();
│        const gq = controls.querySelector("#sv-guess");
│ assets/js/sims/matematika.js
│ @@ -1476,15 +1476,12 @@
│          return;
│        }
│        if (n > maxBox) {
│ -        // Nekerpame tyliai (LL-37): pasakome modelio ribą, o ne paverčiame
│ -        // spėjimą kitu skaičiumi.
│ -        api.readout(`Į dėžutę telpa ne daugiau kaip ${maxBox} kubelių.`);
│ -        api.note(`Pasirink skaičių iki ${maxBox} — tiek kubelių telpa į dėžutę.`);
│ -        const first = controls.querySelector("[data-guess]");
│ -        if (first) first.focus({ preventScroll: true });
│ -        return;
│ -      }
│ -      guess = Math.round(n);
│ +        // Spėjimas, viršijantis dėžutės talpą, vis tiek yra spėjimas: jį
│ +        // palyginsime su tuo, kas įvyks, o ne atmesime (LL-22 priešingybė).
│ +        guess = Math.round(n);
│ +      } else {
│ +        guess = Math.round(n);
│ +      }
│        locked = false;
│        guessAsk.remove();
│        const gq = controls.querySelector("#sv-guess");
│ assets/js/sims/matematika.js
│ @@ -1475,13 +1475,9 @@
│          if (first) first.focus({ preventScroll: true });
│          return;
│        }
│ -      if (n > maxBox) {
│ -        // Spėjimas, viršijantis dėžutės talpą, vis tiek yra spėjimas: jį
│ -        // palyginsime su tuo, kas įvyks, o ne atmesime (LL-22 priešingybė).
│ -        guess = Math.round(n);
│ -      } else {
│ -        guess = Math.round(n);
│ -      }
│ +      // Spėjimas, viršijantis dėžutės talpą, vis tiek yra spėjimas: jį
│ +      // palyginsime su tuo, kas įvyks, o ne atmesime.
│ +      guess = Math.round(n);
│        locked = false;
│        guessAsk.remove();
│        const gq = controls.querySelector("#sv-guess");
│ scripts/probe_svarstykles_elgsena.py
│ @@ -2,13 +2,18 @@
│  """Elgsenos zondas: 16-lygybe-svarstykles — spėjimas yra sąlyga ir palyginamas.
│
│  Tikrina:
│ - 1. Kol spėjimo nėra, dėti negalima (nė vieno „Pradedu dėti“ mygtuko, kubelių 0).
│ - 2. Paspaudus „Įdėk 1“ be spėjimo — readout prašo spėti, fokusas ties spėjimo mygtuku.
│ - 3. Spėjus 6 (daugiau nei yra), pirmos lygybės metu readout pasako spėjimą IR
│ -    dėžutės skaičių (LL-15), o ne tik „Abi pusės lygios“.
│ + 1. Spėjimo negalima praleisti: nėra „Pradedu dėti“ mygtuko, o dėjimo
│ +    valdikliai paslėpti, kol spėjimo nėra.
│ + 2. Bandymas dėti klaviatūra be spėjimo — readout prašo spėti, scena
│ +    paaiškina, fokusas perkeliamas į spėjimo mygtuką.
│ + 3. Spėjus 5 (daugiau, nei yra dėžutėje), pirmos lygybės metu readout
│ +    pasako ir spėjimą, ir dėžutės kiekį (LL-15).
│   4. Antrą kartą lygybėje spėjimas nebekartojamas.
│   5. simDone atsiranda tik pasiekus lygybę.
│   6. 0 konsolės klaidų, 0 slinkties @360 ir @390; spėjimo mygtukai ≥48 px.
│ +
│ +Be playwright (CI) zondas atsako PRALEISTA ir grąžina 0 — tai pasakoma
│ +žodžiu, o ne nutylima (LL-37). Be tinklo, < 8 s.
│  """
│  from __future__ import annotations
│
│ agents/proposals/2026-11-27-simuliaciju-inzinierius-tuscia-ivestis.json
│ @@ -0,0 +1,17 @@
│ +{
│ +  "role": "simuliaciju-inzinierius",
│ +  "run_id": 578,
│ +  "created": "2026-11-27T11:40:00+02:00",
│ +  "type": "struktura",
│ +  "title": "api.ask() perduoda tuščią įvestį kaip reikšmę — kiekviena simuliacija turi saugotis pati",
│ +  "body": "`assets/js/registry.js` `makeSimApi().ask({ onValue })` kviečia `onValue(input.value.trim())` ir neturi jokios sąlygos dėl tuščios įvesties. Todėl kiekviena simuliacija, kuri ima skaičių (`Number(String(v).replace(/[^0-9]/g,\"\")`), gauna `0` ir negali atskirti „vaikas neatsakė“ nuo „vaikas atsakė 0“. Šiame paleidime tai buvo tikras defektas `16-lygybe-svarstykles` (spėjimas „dėžutėje 0 kubelių“ atsirasdavo palietus „Atsakyti“ nieko neįrašius, o tada buvo sąžiningai palyginamas su 3 — vaikas gavo grįžtamąjį ryšį apie spėjimą, kurio nepadarė; pamoka LL-223). Taisiau tik savo simuliaciją, bet spraga yra bendra: `api.ask` yra platformos kodas, o `grep` rodo, kad juo naudojasi ir `pinigine-ir-kaina`. Siūlau, kad helperis pats nekvietų `onValue` tuščiai įvestei (arba perduotų `null`), ir kad `validate_content.py` įspėtų, jei sim vartoja `api.ask` su `type:\"number\"` ir neturi tuščios įvesties patikros. Taip taisyklė gyventų vienoje vietoje, o ne kiekviename komponente atskirai.",
│ +  "target": "assets/js/registry.js",
│ +  "priority": "normal",
│ +  "status": "new",
│ +  "evidence": [
│ +    "assets/js/registry.js:110-116 — `const send = () => { if (typeof onValue === \"function\") onValue(input.value.trim()); }` — tuščia eilutė perduodama kaip reikšmė",
│ +    "assets/js/sims/matematika.js — `16-lygybe-svarstykles` `api.ask` onValue; `Number(\"\") === 0` (patikrinta node: 0, isFinite true)",
│ +    "assets/js/sims/matematika.js — `pinigine-ir-kaina` tas pats `Number(String(value).replace(/[^0-9]/g,\"\"))`, ten gelbsti atsitiktinė `n <= 0` sąlyga",
│ +    "research/wiki/guidelines/pamokos.md — LL-223 „Tuščia įvestis, kuri tampa sąmoningu atsakymu“ (šis paleidimas)"
│ +  ]
│ +}
Darbas baigtas. Pakeitimai darbinėje kopijoje — commit ir publikavimą atlieka bėgiklis.

## Ką pakeičiau

`assets/js/sims/matematika.js` — simuliacija `svarstykles-lygybe` (modulis `16-lygybe-svarstykles`). Klaidinga nuostata, kurią modelis turi griauti, yra „= reiškia suskaičiuok ir parašyk atsakymą“, o modulio `svietimas1` žadėjo „spėjimas prieš pirmą judesį“. Iki šio darbo buvo trys defektai:

1. **Spėjimą buvo galima praleisti** — mygtukas „Pradedu dėti“ atrakindavo kubelius, nei vieno spėjimo neprašęs (`startAdding(NaN)`). LL-110.
2. **Spėjimas nebuvo palyginamas su rezultatu** — įrašomas į `api.note` ir pirma lygybė sakydavo tik „Abi pusės lygios“. LL-15; `pamokos.md:119` šį modulį tiesiogiai įvardija kaip neištaisytą.
3. **Tuščia įvestis tapo sąmoningu spėjimu** — `Number("".replace(...)) === 0` (patikrinta node), tad palietus „Atsakyti“ tuščiai modelis registruodavo „dėžutėje 0 kubelių“ ir paskui sąžiningai tai palygindavo su 3. Tai naujas defekto tipas → pamoka **LL-223** įrašyta `research/wiki/guidelines/pamokos.md`.

Dabar: spėjimas yra 11 mygtukų (iš `config.maxBox`, ne kietas sąrašas), be spėjimo dėjimas neįmanomas ir paaiškinamas (fokusas perkeliamas į spėjimą), pirma lygybė `api.readout` pasako „Spėjai 5, o dėžutėje 3. Prognozė buvo didesnė.“ (vieną kartą, ne kas kadrą, skaičiai — modelio, proza — iš `config.sentences`).

Du nauji zondai: `scripts/probe_svarstykles_spejimas.py` (statinis, 0,04 s, įsijungia į CI `probe_*.py` ciklą) ir `scripts/probe_svarstykles_elgsena.py` (tikra naršyklė, 6 s). Pasiūlymas `agents/proposals/2026-11-27-simuliaciju-inzinierius-tuscia-ivestis.json` — `api.ask()` pati turi neperduoti tuščios įvesties; taisiau tik savo simuliaciją, o spraga bendra.

## Tikra vartų išvestis

```
validate_content.py (visi)       → 0 klaidų, 0 įspėjimų
validate --grade 1 --strict      → 0 klaidų, 0 įspėjimų
check_ui.py                      → Perskaityta: 12 simuliacijų failų · 0 klaidų, 0 įspėjimų
probe_svarstykles_spejimas.py    → ✔ (senas kodas: 8 problemos, rc 1)
probe_svarstykles_elgsena.py     → 32/32 lūkesčių (390 ir 360 px)
check_view --module 16-…         → Patikrinta 3 · problemos: 0
check_view --module 16-… 200 %   → problemos: 0, tekstas telpa
check_view (visa 1 kl.)          → checked 255 · problemos 0 · pastabos 0
check_registry --grade 1         → index 85 · failai 85 · našlaičiai 0 · PROBLEMŲ: 0
check_language --grade 1 --strict→ klaidos 0 · įspėjimai 0
check_audio.py                   → 2550/2550 (naujų tekstų nepridėjau — proza iš config)
check_lessons.py                 → 223 įrašai, visi su 4 laukais
```

## 360 px ekrane — kaip patikrinta

Du nepriklausomi keliai: elgsenos zondas (Playwright, Chromium) ir geometrijos matavimas `getBoundingClientRect` keturiais režimais:

- spėjimo mygtukai: @360/16 px **60×48**, @360/32 px **48×88**, @390/32 px **50×88**, @320/16 px **60×48** — visi ≥48 px abiem ašimis;
- dokumento horizontali slinktis **0 px** visais keturiais atvejais; `.sim-shell` 331/331 @360, 294/294 @320;
- simDone atsiranda tik pasiekus lygybę; antrą kartą lygybėje „Spėjai“ nebekartojamas; „Perskaityk kitaip“ spėjimo neperžymi iš naujo; 0 konsolės klaidų.

Pastaba: `check_view.py` @320 px rodo vieną pastabą — SVG simbolis „▢“ 13,9 px (ribos standarte dar nėra, tai ne vartas).

## klaidos

```
⚠ dashboard [education41] pid 561537: unit restart still pending; this process may still serve pre-update code.
    Restart its unit: `systemctl --user restart hermes-dashboard.service`

session_id: local-f7e161abf3cc11296f096007d40ae520d3b8afaa12e7ed06c125eacbf539d17c
```
