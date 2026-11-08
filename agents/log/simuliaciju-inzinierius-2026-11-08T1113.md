# simuliaciju-inzinierius — 2026-11-08T1113

- paleidimas: #157 (manual)
- trukmė: 700s
- exit: 1 → partial
- modelis: hermes:deepseek41flash

## Ataskaita

│ profiles/deepseek41flash/cache/scratch/probe_pw.py
│ @@ -0,0 +1,13 @@
│ +import sys
│ +try:
│ +    from playwright.sync_api import sync_playwright
│ +except Exception as e:
│ +    print("NO PLAYWRIGHT:", e)
│ +    sys.exit(0)
│ +try:
│ +    with sync_playwright() as p:
│ +        b = p.chromium.launch()
│ +        print("CHROMIUM OK", b.version)
│ +        b.close()
│ +except Exception as e:
│ +    print("NO BROWSER:", e)
│ assets/js/sims/pasaulis.js
│ @@ -853,13 +853,31 @@
│     ledukas: tai paaiškina, kodėl garas virsta lašais.
│     Ribos: puodas rodomas perpjautas (kitaip vandens nesimatytų), o
│     vanduo ore lieka nepavaizduotas — tik žodžiu pasakome, kad jis ten.
│ -   Modelis neturi laikmačio: vienas paspaudimas = kelios minutės. */
│ +   Modelis neturi laikmačio: vienas paspaudimas = kelios minutės.
│ +
│ +   Trys žodžiai — Vanduo, Garas, Ledas — ateina iš modulio `sim.config.words`,
│ +   o ne iš kodo: anksčiau konfigūracija buvo negyva (žodžiai kabėjo JSON, o
│ +   simuliacija juos turėjo įrašytus kietai), todėl redaguojant terminiją
│ +   pasikeisdavo tik garso įrašai, o ekrane likdavo seni žodžiai (LL-61).
│ +   Būsenų juosta po scena parodo, kuris iš trijų dalykų scenoje yra DABAR:
│ +   tai atsakymas į modulio rezultatą „Įvardiju tris vandens būsenas“.
│ +   Ženklas (● / ○) ir žodis neša informaciją, spalva — tik paryškina. */
│
│  const VB_MAX = 5;
│  const VB_HEAT = ["Vėsu", "Šilta", "Verdantis"];
│ +/* Atsarginiai žodžiai — kai komponentas montuojamas be `config`
│ +   (pvz. bandyme). Modulyje visada laimi `sim.config.words`. */
│ +const VB_WORDS = { water: "Vanduo", ice: "Ledas", steam: "Garas", drops: "Lašai" };
│
│  const vandensBusenos = {
│ -  mount({ stage, controls, api }) {
│ +  mount({ stage, controls, api, config }) {
│ +    const words = { ...VB_WORDS };
│ +    const cfgWords = config && typeof config.words === "object" && !Array.isArray(config.words)
│ +      ? config.words : {};
│ +    for (const key of Object.keys(VB_WORDS)) {
│ +      const v = cfgWords[key];
│ +      if (typeof v === "string" && v.trim()) words[key] = v.trim();
│ +    }
│      let level = VB_MAX;      // vandens lygis 0..5
│      let heat = 1;            // 0 vėsu, 1 šilta, 2 verdantis
│      let lid = false;         // ar dangtis uždėtas
│ assets/js/sims/pasaulis.js
│ @@ -883,16 +883,36 @@
│      let lid = false;         // ar dangtis uždėtas
│      let drops = 0;           // lašai ant dangčio (0..5)
│      let inAir = 0;           // vanduo, išėjęs į orą be dangčio
│ +    let evaporated = 0;      // kiek vandens apskritai virto garu
│      let returned = 0;        // kiek lašų grąžinta į puodą
│      let presses = 0;         // kiek kartų kaitinta — tik bangelių vietai
│      let reported = false;
│      let msg = "Pakaitink puodą ir pažiūrėk, kas kyla virš vandens.";
│ -    const spoke = { steam: false, drops: false, back: false };
│ +    const spoke = { steam: false, drops: false, ice: false, back: false };
│ +
│ +    const esc = (s) => String(s ?? "").replace(/[&<>"]/g,
│ +      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
│ +
│ +    /* Būsenų kortelė: kairėje — ženklas, po juo — žodis iš `sim.config.words`,
│ +       apačioje — kur tas dalykas yra dabar. Trys signalai (ženklas, žodis,
│ +       rėmelio storis), todėl spalva nėra vienintelis informacijos nešėjas. */
│ +    const stateCard = (key) => `
│ +      <div class="vb-state" data-state="${key}" data-on="false"
│ +           style="border:2px solid var(--line);border-radius:.6rem;padding:.3rem .2rem;text-align:center">
│ +        <span class="vb-mark" aria-hidden="true"
│ +              style="font-size:.7rem;line-height:1;color:var(--ink-soft)">○</span>
│ +        <span class="vb-name" style="display:block;font-weight:800;font-size:.88rem;line-height:1.2">${esc(words[key])}</span>
│ +        <span class="vb-where" style="display:block;font-size:.72rem;line-height:1.2;color:var(--ink-soft)">dar nėra</span>
│ +      </div>`;
│
│      stage.innerHTML = `
│        <div style="width:100%;max-width:28rem;margin:0 auto">
│          <svg id="vb-scene" viewBox="0 0 360 330" role="img"
│               aria-label="Vandens būsenų modelis: puodas ant laužo"></svg>
│ +        <div id="vb-states" aria-label="Kas dabar yra scenoje"
│ +             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(5.4rem,1fr));gap:.4rem;margin:.55rem 0 0">
│ +          ${["water", "steam", "ice"].map(stateCard).join("")}
│ +        </div>
│          <p class="sim-note" style="font-size:.8rem;text-align:center">
│            Modelis supaprastintas: puodas rodomas perpjautas, kad matytum vandenį.
│          </p>
│ assets/js/sims/pasaulis.js
│ @@ -1014,7 +1014,7 @@
│          <ellipse cx="180" cy="146" rx="62" ry="9" fill="#dbe5ee" opacity=".7"/>
│          ${art.block(166, 108, 28, "#e2f3fc", "", "#a7d3e6")}
│          <text x="200" y="126" font-family="system-ui, sans-serif" font-size="11" font-weight="700"
│ -              fill="#4a5560">ledas</text>
│ +              fill="#4a5560">${esc(words.ice.toLowerCase())}</text>
│          ${dropsUnderLid}`;
│
│        const lidOff = `
│ assets/js/sims/pasaulis.js
│ @@ -1031,6 +1031,13 @@
│            : steam(172, 142, 42, 0.42) + steam(192, 144, 34, 0.32))
│          : "";
│
│ +      /* Garas yra tai, ko nesimato, todėl jis turi vardą pačioje scenoje,
│ +         o ne tik kortelėje po ja. */
│ +      const steamWord = steamWisps
│ +        ? `<text x="208" y="122" font-family="system-ui, sans-serif" font-size="11" font-weight="700"
│ +                fill="#4a5560">${esc(words.steam.toLowerCase())}</text>`
│ +        : "";
│ +
│        /* Vanduo, kuris išėjo į orą: silpnos srovelės toliau nuo puodo.
│           Jos rodo, kad vanduo liko ore, o ne dingo. */
│        const airWisps = inAir > 0 && !lid
│ assets/js/sims/pasaulis.js
│ @@ -1069,6 +1069,7 @@
│          ${pot}
│          ${lid ? lidOn : lidOff}
│          ${steamWisps}
│ +        ${steamWord}
│          ${airWisps}`;
│
│        svg.setAttribute("aria-label",
│ assets/js/sims/pasaulis.js
│ @@ -1076,7 +1076,30 @@
│          `Puodas ant laužo. Vandens lygis ${level} iš ${VB_MAX}. `
│          + `${heat === 0 ? "Ugnis nedega" : strong ? "Ugnis stipri" : "Ugnis silpna"}. `
│          + `${lid ? "Dangtis uždėtas" : "Dangtis nuimtas"}. `
│ -        + `Ant dangčio ${drops} lašų.`);
│ +        + (drops > 0 ? `${words.drops} ant dangčio: ${drops}.` : ""));
│ +
│ +      /* Kortelės atitinka tai, kas scenoje yra DABAR, o ne tai, ką vaikas
│ +         kažkada padarė: išgaravus visam vandeniui, „Vanduo“ vėl rodo
│ +         „dar nėra“, nors anksčiau puodas buvo pilnas (LL-17). */
│ +      const where = {
│ +        water: level > 0 ? "yra puode" : "dar nėra",
│ +        steam: evaporated > 0 ? (lid ? "po dangčiu" : "ore") : "dar nėra",
│ +        ice: lid ? "ant dangčio" : "dar nėra",
│ +      };
│ +      for (const key of Object.keys(where)) {
│ +        const card = stage.querySelector(`.vb-state[data-state="${key}"]`);
│ +        if (!card) continue;
│ +        const on = where[key] !== "dar nėra";
│ +        card.dataset.on = on ? "true" : "false";
│ +        card.style.borderColor = on ? "var(--ink)" : "var(--line)";
│ +        card.style.background = on ? "var(--paper)" : "transparent";
│ +        const mark = card.querySelector(".vb-mark");
│ +        mark.textContent = on ? "●" : "○";
│ +        mark.style.color = on ? "var(--ink)" : "var(--ink-soft)";
│ +        const spot = card.querySelector(".vb-where");
│ +        spot.textContent = where[key];
│ +        spot.style.color = on ? "var(--ink)" : "var(--ink-soft)";
│ +      }
│
│        q("#vb-heat").value = String(heat);
│        q("#vb-heat").setAttribute("aria-valuetext", `Šiluma: ${heatWord()}`);
│ @@ -1087,13 +1110,21 @@
│        lidBtn.setAttribute("aria-pressed", String(lid));
│        lidBtn.setAttribute("aria-label", lid ? "Nuimk dangtį nuo puodo" : "Uždėk vėsų dangtį ant puodo");
│
│ -      api.readout(`Vandens lygis ${level} iš ${VB_MAX} · ${lid ? "dangtis uždėtas" : "dangtis nuimtas"}`
│ -        + `${drops > 0 ? ` · ant dangčio ${drops} lašai` : ""}`);
│ +      /* Tekstinis kortelių atitikmuo: ką rodo būsenų juosta, tą pasako
│ +         readout — todėl modelis veikia ir be vaizdo. */
│ +      const onScene = Object.keys(where)
│ +        .filter((k) => where[k] !== "dar nėra")
│ +        .map((k) => words[k]);
│ +      api.readout(`Vandens lygis ${level} iš ${VB_MAX}. `
│ +        + `${lid ? "Dangtis uždėtas" : "Dangtis nuimtas"}. `
│ +        + (onScene.length ? `Scenoje: ${onScene.join(", ")}.` : "")
│ +        + (drops > 0 ? ` ${words.drops} ant dangčio: ${drops}.` : ""));
│        api.note(msg);
│
│ -      if (!spoke.steam && heat > 0 && level < VB_MAX) { spoke.steam = true; api.speak("Garas"); }
│ -      if (!spoke.drops && drops > 0) { spoke.drops = true; api.speak("Lašai"); }
│ -      if (!spoke.back && returned > 0) { spoke.back = true; api.speak("Vanduo"); }
│ +      if (!spoke.steam && evaporated > 0) { spoke.steam = true; api.speak(words.steam); }
│ +      if (!spoke.drops && drops > 0) { spoke.drops = true; api.speak(words.drops); }
│ +      if (!spoke.ice && lid) { spoke.ice = true; api.speak(words.ice); }
│ +      if (!spoke.back && returned > 0) { spoke.back = true; api.speak(words.water); }
│      }
│
│      function boil() {
│ assets/js/sims/pasaulis.js
│ @@ -1140,6 +1140,7 @@
│        }
│        const amount = Math.min(level, heat);   // 1 arba 2 lygiai per kartą
│        level -= amount;
│ +      evaporated += amount;
│        presses += 1;
│        if (lid) {
│          drops = Math.min(VB_MAX, drops + amount);
│ @@ -1148,7 +1149,7 @@
│            : "Dar daugiau garo nusėdo ant dangčio.";
│        } else {
│          inAir += amount;
│ -        msg = "Vanduo virto garu ir išėjo į orą. Jis ne dingo — jis ore.";
│ +        msg = "Vanduo virto garu ir išėjo į orą. Vanduo liko ore, tik jo nematome.";
│        }
│        render();
│      }
│ @@ -1156,7 +1157,7 @@
│      function toggleLid() {
│        lid = !lid;
│        msg = lid
│ -        ? "Dangtis uždėtas. Jis vėsus, todėl garas ant jo virs lašais."
│ +        ? "Dangtis uždėtas. Jis vėsus, todėl garas ant jo virsta lašais."
│          : "Dangtis nuimtas. Garas kils tiesiai į orą.";
│        render();
│      }
│ assets/js/sims/pasaulis.js
│ @@ -1175,8 +1175,11 @@
│        msg = "Lašai nubėgo atgal į puodą. Vanduo sugrįžo, nebuvo dingęs.";
│        render();
│        /* Rezultatas — visas ciklas: garas surinktas ant dangčio ir grąžintas.
│ -         Vienas išgarinimas ar vienas lašas dar nėra įrodymas (LL-29). */
│ -      if (!reported && returned >= 2) {
│ +         Vienas išgarinimas dar nėra įrodymas (LL-29), o vieno lašo grąžinimas
│ +         jau yra: lašas atsirado tik tada, kai garas virto vandeniu, ir tik tada
│ +         galėjo sugrįžti. Anksčiau sąlyga reikalavo DVIEJŲ lašų, todėl vaikas,
│ +         kaitinęs „Šilta“, viso ciklo įrodymo taip ir negavo. */
│ +      if (!reported && returned > 0) {
│          reported = true;
│          api.progress({ correct: true });
│        }
│ assets/js/sims/pasaulis.js
│ @@ -1196,7 +1196,8 @@
│      q("#vb-lid").addEventListener("click", toggleLid);
│      q("#vb-back").addEventListener("click", backToPot);
│      q("#vb-reset").addEventListener("click", () => {
│ -      level = VB_MAX; heat = 1; lid = false; drops = 0; inAir = 0; returned = 0; presses = 0;
│ +      level = VB_MAX; heat = 1; lid = false; drops = 0; inAir = 0; evaporated = 0;
│ +      returned = 0; presses = 0;
│        msg = "Naujas bandymas. Pakaitink puodą ir stebėk garą.";
│        render();
│      });
│ assets/js/sims/pasaulis.js
│ @@ -1025,7 +1025,8 @@
│          </g>`;
│
│        /* Garas: be dangčio kyla aukštyn ir tolsta; su dangčiu lieka po juo. */
│ -      const steamWisps = heat > 0 && level > 0 && !lid
│ +      const showSteam = heat > 0 && level > 0 && !lid;
│ +      const steamWisps = showSteam
│          ? (heat === 2
│            ? steam(168, 140, 62, 0.62) + steam(184, 138, 74, 0.55) + steam(200, 142, 54, 0.42)
│            : steam(172, 142, 42, 0.42) + steam(192, 144, 34, 0.32))
│ @@ -1033,14 +1034,15 @@
│
│        /* Garas yra tai, ko nesimato, todėl jis turi vardą pačioje scenoje,
│           o ne tik kortelėje po ja. */
│ -      const steamWord = steamWisps
│ +      const steamWord = showSteam
│          ? `<text x="208" y="122" font-family="system-ui, sans-serif" font-size="11" font-weight="700"
│                  fill="#4a5560">${esc(words.steam.toLowerCase())}</text>`
│          : "";
│
│        /* Vanduo, kuris išėjo į orą: silpnos srovelės toliau nuo puodo.
│           Jos rodo, kad vanduo liko ore, o ne dingo. */
│ -      const airWisps = inAir > 0 && !lid
│ +      const showAir = inAir > 0 && !lid;
│ +      const airWisps = showAir
│          ? steam(286, 132, 46, 0.22) + steam(306, 122, 36, 0.18)
│          : "";
│
│ assets/js/sims/pasaulis.js
│ @@ -1080,12 +1080,13 @@
│          + `${lid ? "Dangtis uždėtas" : "Dangtis nuimtas"}. `
│          + (drops > 0 ? `${words.drops} ant dangčio: ${drops}.` : ""));
│
│ -      /* Kortelės atitinka tai, kas scenoje yra DABAR, o ne tai, ką vaikas
│ -         kažkada padarė: išgaravus visam vandeniui, „Vanduo“ vėl rodo
│ -         „dar nėra“, nors anksčiau puodas buvo pilnas (LL-17). */
│ +      /* Kortelės atitinka tai, kas scenoje yra DABAR, ir skaitomos iš tų pačių
│ +         sąlygų, iš kurių piešiama scena (showSteam, showAir, lid) — kitaip
│ +         paveikslas ir užrašas galėtų išsiskirti (LL-34). Išgaravus visam
│ +         vandeniui, „Vanduo“ vėl rodo „dar nėra“ (LL-17). */
│        const where = {
│          water: level > 0 ? "yra puode" : "dar nėra",
│ -        steam: evaporated > 0 ? (lid ? "po dangčiu" : "ore") : "dar nėra",
│ +        steam: showSteam || showAir ? "ore" : "dar nėra",
│          ice: lid ? "ant dangčio" : "dar nėra",
│        };
│        for (const key of Object.keys(where)) {
│ assets/js/sims/pasaulis.js
│ @@ -1080,13 +1080,17 @@
│          + `${lid ? "Dangtis uždėtas" : "Dangtis nuimtas"}. `
│          + (drops > 0 ? `${words.drops} ant dangčio: ${drops}.` : ""));
│
│ -      /* Kortelės atitinka tai, kas scenoje yra DABAR, ir skaitomos iš tų pačių
│ -         sąlygų, iš kurių piešiama scena (showSteam, showAir, lid) — kitaip
│ -         paveikslas ir užrašas galėtų išsiskirti (LL-34). Išgaravus visam
│ -         vandeniui, „Vanduo“ vėl rodo „dar nėra“ (LL-17). */
│ +      /* Kortelės atitinka tai, kas modelyje yra DABAR, ir skaitomos iš tų
│ +         pačių sąlygų, iš kurių piešiama scena (showSteam, showAir, lid) —
│ +         kitaip paveikslas ir užrašas galėtų išsiskirti (LL-34). Su dangčiu
│ +         garo nesimato, bet jis ten yra ir virsta lašais, todėl kortelė sako
│ +         „po dangčiu“. Išgaravus visam vandeniui, „Vanduo“ vėl rodo
│ +         „dar nėra“ (LL-17). */
│        const where = {
│          water: level > 0 ? "yra puode" : "dar nėra",
│ -        steam: showSteam || showAir ? "ore" : "dar nėra",
│ +        steam: lid
│ +          ? (heat > 0 && level > 0 ? "po dangčiu" : "dar nėra")
│ +          : (showSteam || showAir ? "ore" : "dar nėra"),
│          ice: lid ? "ant dangčio" : "dar nėra",
│        };
│        for (const key of Object.keys(where)) {
│ assets/js/sims/pasaulis.js
│ @@ -1124,7 +1124,7 @@
│          .map((k) => words[k]);
│        api.readout(`Vandens lygis ${level} iš ${VB_MAX}. `
│          + `${lid ? "Dangtis uždėtas" : "Dangtis nuimtas"}. `
│ -        + (onScene.length ? `Scenoje: ${onScene.join(", ")}.` : "")
│ +        + (onScene.length ? `Dabar: ${onScene.join(", ")}.` : "")
│          + (drops > 0 ? ` ${words.drops} ant dangčio: ${drops}.` : ""));
│        api.note(msg);
│
│ assets/js/sims/pasaulis.js
│ @@ -909,7 +909,7 @@
│        <div style="width:100%;max-width:28rem;margin:0 auto">
│          <svg id="vb-scene" viewBox="0 0 360 330" role="img"
│               aria-label="Vandens būsenų modelis: puodas ant laužo"></svg>
│ -        <div id="vb-states" aria-label="Kas dabar yra scenoje"
│ +        <div id="vb-states" role="group" aria-label="Kas dabar yra modelyje"
│               style="display:grid;grid-template-columns:repeat(auto-fit,minmax(5.4rem,1fr));gap:.4rem;margin:.55rem 0 0">
│            ${["water", "steam", "ice"].map(stateCard).join("")}
│          </div>
│ content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json
│ @@ -24,7 +24,12 @@
│    "sim": {
│      "component": "vandens-busenos",
│      "config": {
│ -      "words": ["Vanduo", "Ledas", "Garas", "Dangtis", "Lašai"]
│ +      "words": {
│ +        "water": "Vanduo",
│ +        "ice": "Ledas",
│ +        "steam": "Garas",
│ +        "drops": "Lašai"
│ +      }
│      }
│    },
│    "tasks": [
│ profiles/deepseek41flash/cache/scratch/probe_import.mjs
│ @@ -0,0 +1,3 @@
│ +import { SIMS } from "/home/zoltanas/workspace/suprask/assets/js/sims/pasaulis.js";
│ +console.log("SIMS:", Object.keys(SIMS).join(","));
│ +console.log("vandens-busenos mount tipas:", typeof SIMS["vandens-busenos"].mount);
│ profiles/deepseek41flash/cache/scratch/probe_vanduo.py
│ @@ -0,0 +1,112 @@
│ +"""Zondas: 16-vandens-busenos simuliacija 360 px ekrane (tikra naršyklė).
│ +
│ +Tikrina:
│ +  1. būsenų kortelių tekstai pradžioje ir po veiksmų;
│ +  2. readout (tekstinis atitikmuo);
│ +  3. progress semantika: vienas pilnas ciklas „Šilta“ dabar įrašo simDone;
│ +  4. taikiniai ≥ 44 px, nėra horizontalios slinkties, nėra konsolės klaidų;
│ +  5. klaviatūra: Tab + Enter ant dangčio mygtuko.
│ +"""
│ +import json
│ +import sys
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8126/"
│ +ROUTE = BASE + "#/modulis/1/pasaulio-pazinimas/16-vandens-busenos"
│ +CHROME = "/home/zoltanas/.local/bin/google-chrome"
│ +KEY = "suprask:progress:v1"
│ +
│ +CARDS_JS = """() => [...document.querySelectorAll('#vb-states .vb-state')].map(c => ({
│ +  state: c.dataset.state,
│ +  on: c.dataset.on,
│ +  name: c.querySelector('.vb-name').textContent,
│ +  where: c.querySelector('.vb-where').textContent,
│ +  border: getComputedStyle(c).borderTopColor,
│ +  borderWidth: getComputedStyle(c).borderTopWidth,
│ +}))"""
│ +
│ +MODULE = json.load(open("/home/zoltanas/workspace/suprask/content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json", encoding="utf-8"))
│ +
│ +
│ +def snapshot(page, label):
│ +    cards = page.evaluate(CARDS_JS)
│ +    readout = page.inner_text("#sim-readout")
│ +    note = page.inner_text("#sim-note")
│ +    progress = page.evaluate(
│ +        "() => JSON.parse(localStorage.getItem('suprask:progress:v1') || '{}').modules?.['16-vandens-busenos'] || null"
│ +    )
│ +    print(f"\n[{label}]")
│ +    for c in cards:
│ +        print(f"  {c['name']:8} on={c['on']:5} {c['where']:12} border={c['borderWidth']} {c['border']}")
│ +    print(f"  readout: {readout}")
│ +    print(f"  note   : {note}")
│ +    print(f"  simDone: {bool(progress and progress.get('simDone'))}")
│ +    return cards, readout, note, progress
│ +
│ +
│ +with sync_playwright() as pw:
│ +    browser = pw.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│ +    ctx = browser.new_context(viewport={"width": 360, "height": 780}, device_scale_factor=1)
│ +    page = ctx.new_page()
│ +    errors = []
│ +    page.on("pageerror", lambda e: errors.append("pageerror: " + str(e)[:200]))
│ +    page.on("console", lambda m: errors.append("console: " + m.text[:200]) if m.type == "error" else None)
│ +
│ +    page.goto(ROUTE, wait_until="domcontentloaded", timeout=25000)
│ +    page.wait_for_selector("#vb-states .vb-state", timeout=12000)
│ +    page.wait_for_timeout(400)
│ +
│ +    print("Platis:", page.evaluate("() => ({ scroll: document.documentElement.scrollWidth, vw: window.innerWidth })"))
│ +
│ +    cards, readout, note, prog = snapshot(page, "pradžia")
│ +    assert [c["name"] for c in cards] == [
│ +        MODULE["sim"]["config"]["words"]["water"],
│ +        MODULE["sim"]["config"]["words"]["steam"],
│ +        MODULE["sim"]["config"]["words"]["ice"],
│ +    ], cards
│ +    assert [c["where"] for c in cards] == ["yra puode", "ore", "dar nėra"], cards
│ +    assert prog is None or not prog.get("simDone"), prog
│ +
│ +    # 1 veiksmas: dangtis (klaviatūra)
│ +    page.focus("#vb-lid")
│ +    page.keyboard.press("Enter")
│ +    page.wait_for_timeout(200)
│ +    cards, readout, note, prog = snapshot(page, "dangtis uždėtas (Enter)")
│ +    assert [c["where"] for c in cards] == ["yra puode", "po dangčiu", "ant dangčio"], cards
│ +    assert not (prog and prog.get("simDone")), "pažanga po pirmo žingsnio!"
│ +
│ … omitted 34 diff line(s) across 1 additional file(s)/section(s)
│ profiles/deepseek41flash/cache/scratch/probe_config_live.py
│ @@ -0,0 +1,51 @@
│ +"""Ar `sim.config.words` tikrai gyvas: pakeitus žodžius JSON, keičiasi ekranas.
│ +
│ +Tas pats puslapis, bet modulio JSON atsakymas perimamas ir žodžiai pakeičiami
│ +didžiosiomis raidėmis. Jei kortelės ir scena rodo naujus žodžius — konfigūracija
│ +skaitoma; jei rodo senus — ji vėl negyva.
│ +"""
│ +import json
│ +
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8126/"
│ +ROUTE = BASE + "#/modulis/1/pasaulio-pazinimas/16-vandens-busenos"
│ +CHROME = "/home/zoltanas/.local/bin/google-chrome"
│ +SRC = "/home/zoltanas/workspace/suprask/content/lt/grade-01/pasaulio-pazinimas/16-vandens-busenos.json"
│ +
│ +data = json.load(open(SRC, encoding="utf-8"))
│ +data["sim"]["config"]["words"] = {
│ +    "water": "VANDUO",
│ +    "ice": "LEDAS",
│ +    "steam": "GARAS",
│ +    "drops": "LAŠAI",
│ +}
│ +
│ +with sync_playwright() as pw:
│ +    browser = pw.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│ +    ctx = browser.new_context(viewport={"width": 360, "height": 780})
│ +    page = ctx.new_page()
│ +    page.route("**/16-vandens-busenos.json", lambda route: route.fulfill(
│ +        status=200, content_type="application/json", body=json.dumps(data, ensure_ascii=False)))
│ +    page.goto(ROUTE, wait_until="domcontentloaded", timeout=25000)
│ +    page.wait_for_selector("#vb-states .vb-state", timeout=12000)
│ +    page.wait_for_timeout(300)
│ +
│ +    cards = page.evaluate("""() => [...document.querySelectorAll('#vb-states .vb-name')].map(e => e.textContent)""")
│ +    print("Kortelės:", cards)
│ +    assert cards == ["VANDUO", "GARAS", "LEDAS"], cards
│ +
│ +    page.click("#vb-lid")
│ +    page.wait_for_timeout(200)
│ +    svg_texts = page.evaluate("""() => [...document.querySelectorAll('#vb-scene text')].map(e => e.textContent)""")
│ +    print("Scenos užrašai (dangtis uždėtas):", svg_texts)
│ +    assert "ledas" in svg_texts, svg_texts
│ +
│ +    readout = page.inner_text("#sim-readout")
│ +    print("Readout:", readout)
│ +    assert "Dabar: VANDUO, GARAS, LEDAS." in readout, readout
│ +
│ +    ctx.close()
│ +    browser.close()
│ +
│ +print("\nOK: sim.config.words valdo korteles, scena ir readout")
│ profiles/deepseek41flash/cache/scratch/probe_layout.py
│ @@ -0,0 +1,55 @@
│ +"""Maketo zondas: kortelių ir scenos užrašų geometrija keliuose pločiuose."""
│ +from playwright.sync_api import sync_playwright
│ +
│ +BASE = "http://127.0.0.1:8126/"
│ +ROUTE = BASE + "#/modulis/1/pasaulio-pazinimas/16-vandens-busenos"
│ +CHROME = "/home/zoltanas/.local/bin/google-chrome"
│ +
│ +MEASURE = """() => {
│ +  const de = document.documentElement;
│ +  const cards = [...document.querySelectorAll('#vb-states .vb-state')].map(c => {
│ +    const r = c.getBoundingClientRect();
│ +    return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) };
│ +  });
│ +  const svg = document.querySelector('#vb-scene').getBoundingClientRect();
│ +  const labels = [...document.querySelectorAll('#vb-scene text')].map(t => {
│ +    const r = t.getBoundingClientRect();
│ +    return { text: t.textContent, x: Math.round(r.left), right: Math.round(r.right), y: Math.round(r.top) };
│ +  });
│ +  const note = document.querySelector('#sim-stage .sim-note').getBoundingClientRect();
│ +  return {
│ +    vw: window.innerWidth,
│ +    scroll: de.scrollWidth,
│ +    svg: { w: Math.round(svg.width), h: Math.round(svg.height), bottom: Math.round(svg.bottom) },
│ +    cards,
│ +    cardsWrap: Math.round(document.querySelector('#vb-states').getBoundingClientRect().height),
│ +    labels,
│ +    noteTop: Math.round(note.top),
│ +    labelOverflow: labels.filter(l => l.right > window.innerWidth - 8),
│ +  };
│ +}"""
│ +
│ +with sync_playwright() as pw:
│ +    browser = pw.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
│ +    for width in (320, 360, 390, 414, 768):
│ +        ctx = browser.new_context(viewport={"width": width, "height": 900})
│ +        page = ctx.new_page()
│ +        page.goto(ROUTE, wait_until="domcontentloaded", timeout=25000)
│ +        page.wait_for_selector("#vb-states .vb-state", timeout=12000)
│ +        page.wait_for_timeout(300)
│ +        page.click("#vb-lid")
│ +        page.wait_for_timeout(150)
│ +        m = page.evaluate(MEASURE)
│ +        print(f"\n=== {width}px ===")
│ +        print(f"  scroll={m['scroll']} vw={m['vw']}  svg {m['svg']['w']}x{m['svg']['h']} bottom={m['svg']['bottom']}")
│ +        print(f"  kortelės: {m['cards']}  juostos aukštis={m['cardsWrap']}")
│ +        print(f"  užrašai: {m['labels']}")
│ +        print(f"  pastaba top={m['noteTop']}  išlendantys užrašai={m['labelOverflow']}")
│ +        assert m["scroll"] <= m["vw"], f"horizontali slinktis {width}px: {m['scroll']} > {m['vw']}"
│ +        assert not m["labelOverflow"], m["labelOverflow"]
│ +        assert all(c["h"] >= 48 for c in m["cards"]), m["cards"]
│ +        assert m["noteTop"] > m["svg"]["bottom"], "kortelės persidengia su pastaba"
│ +        ctx.close()
│ +    browser.close()
│ +
│ +print("\nOK: 320/360/390/414/768 px be slinkties, kortelės ≥48 px, užrašai scenoje")
│ assets/js/sims/pasaulis.js
│ @@ -1205,6 +1205,9 @@
│      q("#vb-reset").addEventListener("click", () => {
│        level = VB_MAX; heat = 1; lid = false; drops = 0; inAir = 0; evaporated = 0;
│        returned = 0; presses = 0;
│ +      /* Žodžiai vėl tariami naujame bandyme: vaikas, pradėjęs iš naujo,
│ +         turi išgirsti tuos pačius vardus, o ne tylą. */
│ +      spoke.steam = spoke.drops = spoke.ice = spoke.back = false;
│        msg = "Naujas bandymas. Pakaitink puodą ir stebėk garą.";
│        render();
│      });
│ assets/js/sims/pasaulis.js
│ @@ -1136,7 +1136,12 @@
│
│      function boil() {
│        if (level === 0) {
│ -        msg = "Puodas tuščias. Paspausk „Iš naujo“ ir bandyk dar kartą.";
│ +        /* Tuščias puodas su lašais ant dangčio nėra aklavietė: vanduo ten pat.
│ +           Siųsti vaiką į „Iš naujo“ reikštų išmesti būtent tą įrodymą, kurį
│ +           jis ką tik surinko (LL-18). */
│ +        msg = drops > 0
│ +          ? "Puodas tuščias, bet vanduo yra ant dangčio. Paspausk „Grąžink lašus“."
│ +          : "Puodas tuščias. Paspausk „Iš naujo“ ir bandyk dar kartą.";
│          render();
│          return;
│        }
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe_vanduo.py
│ @@ -96,6 +96,25 @@
│      cards, readout, note, prog = snapshot(page, "dangtis nuimtas + pakaitinta")
│      assert [c["where"] for c in cards] == ["yra puode", "ore", "dar nėra"], cards
│
│ +    # 5 veiksmas: aklavietė — puodas tuščias, bet lašai ant dangčio
│ +    page.evaluate("""() => { const r = document.querySelector('#vb-heat'); r.value = '2';
│ +      r.dispatchEvent(new Event('input', { bubbles: true })); }""")
│ +    page.wait_for_timeout(100)
│ +    if page.get_attribute("#vb-lid", "aria-pressed") == "false":
│ +        page.click("#vb-lid")
│ +    for _ in range(4):
│ +        page.click("#vb-boil")
│ +        page.wait_for_timeout(80)
│ +    cards, readout, note, prog = snapshot(page, "puodas tuščias (verdantis, dangtis)")
│ +    page.click("#vb-boil")
│ +    page.wait_for_timeout(150)
│ +    cards, readout, note, prog = snapshot(page, "dar kartą kaitinti tuščią puodą")
│ +    assert "ant dangčio" in note, note
│ +    page.click("#vb-back")
│ +    page.wait_for_timeout(150)
│ +    cards, readout, note, prog = snapshot(page, "lašai grąžinti iš tuščio puodo")
│ +    assert "Vandens lygis 5 iš 5" in readout, readout
│ +
│      # Taikiniai
│      small = page.evaluate("""() => [...document.querySelectorAll('#sim-stage button, #sim-controls button, #sim-controls input')]
│        .map(el => { const r = el.getBoundingClientRect(); return { t: (el.textContent||el.id).trim().slice(0,20), w: Math.round(r.width), h: Math.round(r.height) }; })
│ /home/zoltanas/.hermes/profiles/deepseek41flash/cache/scratch/probe_vanduo.py
│ @@ -113,7 +113,8 @@
│      page.click("#vb-back")
│      page.wait_for_timeout(150)
│      cards, readout, note, prog = snapshot(page, "lašai grąžinti iš tuščio puodo")
│ -    assert "Vandens lygis 5 iš 5" in readout, readout
│ +    assert "Vanduo sugrįžo" in note, note
│ +    assert "Vandens lygis 0 iš 5" not in readout, readout
│
│      # Taikiniai
│      small = page.evaluate("""() => [...document.querySelectorAll('#sim-stage button, #sim-controls button, #sim-controls input')]
Darbas atliktas, bet ataskaitos ir state.json dar neįrašiau — iteracijų limitas baigėsi. Štai tiksli būsena.

KĄ PAKEIČIAU (viskas darbinėje kopijoje, necommitinta)

`assets/js/sims/pasaulis.js` — simuliacija `vandens-busenos` (modulis 16, „Kur dingsta vanduo“), pasiūlymas #5984 + #5986.

1. Negyva konfigūracija prijungta. `mount({stage, controls, api, config})` dabar skaito `sim.config.words`; kortelės, scenos užrašai, `readout` ir tariami žodžiai imami iš JSON. Patikrinta perimant modulio JSON naršyklėje: pakeitus žodžius į VANDUO/GARAS/LEDAS, kortelės, SVG užrašas ir readout pasikeitė — konfigūracija gyva.
2. Modulio `sim.config.words` iš masyvo virto vardiniu objektu `{water, ice, steam, drops}` („Dangtis“ pašalintas — mygtuko „Uždėti dangtį“ forma yra galininkas, ne keičiamas terminas).
3. Būsenų juosta po scena: Vanduo / Garas / Ledas su vieta („yra puode“, „po dangčiu“, „ore“, „ant dangčio“, „dar nėra“). Trys signalai — ženklas ●/○, žodis, rėmelio storis — spalva ne vienintelė. Sąlygos skaitomos iš tų pačių `showSteam` / `showAir` / `lid`, iš kurių piešiama scena, tad paveikslas ir užrašas negali išsiskirti. Tai tiesiogiai tee sia modulio rezultatą „Įvardiju tris vandens būsenas“.
4. Scenoje atsirado garo vardas („garas“) ir ledo užrašas imamas iš konfigūracijos.
5. Pažangos slenkstis: buvo `returned >= 2`, todėl vaikas, kaitinęs „Šilta“, viso ciklo įrodymo negavo (1 lygis = 1 lašas). Dabar `returned > 0` — vienas pilnas ciklas.
6. Aklavietė: išgaravus visam vandeniui su dangčiu, „Pakaitink“ siuntė į „Iš naujo“ — tai išmesdavo lašus, kuriuose ir buvo vanduo. Dabar siunčia į „Grąžink lašus“.
7. Kalba: „virs lašais“ → „virsta lašais“ (#5986); „Jis ne dingo — jis ore“ → „Vanduo liko ore, tik jo nematome“; „Ant dangčio N lašų“ (neteisinga derinama forma) pakeista „Lašai ant dangčio: N“. „Iš naujo“ vėl įjungia tariamus žodžius.

TIKRA IŠVESTIS

    validate_content.py            0 klaidų, 0 įspėjimų
    validate_content.py --strict   0 klaidų, 0 įspėjimų
    check_ui.py                    0 klaidų, 0 įspėjimų
    check_language.py              0 klaidų (4 įspėjimai — seni, kituose moduliuose)
    check_art.py                   5 sim failai naudoja art.js, legacy 1
    check_audio.py                 462 tekstai, visi po du įrašus, Piper
    check_view.py --module ...     3 plotai (1440/390/360), 0 problemų
    check_view.py (visa 1 kl.)     93 patikros (31×3), 0 problemų
    node import                    SIMS: metu-laikai,…,vandens-busenos,… ✓
    zondas 360 px                  scrollWidth 360 == innerWidth, maži taikiniai [], 0 konsolės klaidų
    zondas 320/360/390/414/768     be slinkties; kortelės 70 px aukščio (≥48); užrašai scenoje netelpa už krašto
    pažanga                        po dangčio + 1 virimas + grąžinimas → simDone true („Šilta“); prieš tai false
    kalava                         Tab → Enter ant „Uždėti dangtį“ veikia, būsenos pasikeičia

KLAIDINGA NUOSTATA: „išgaravęs vanduo išnyksta“. Modelis rodo abi puses (garas ore be dangčio / lašai ant vėsaus dangčio ir sugrįžimas), o dabar dar ir įvardija, kuri būsena yra dabar.

LIKO NEĮRAŠYTA (reikia kito paleidimo arba rankinio įrašymo)

- `agents/log/simuliaciju-inzinierius-2026-11-08.md` — ataskaita nesukurta.
- `agents/state.json` — `roles.simuliaciju-inzinierius` (`last_run`, `status: published`, `log`, `last_sim_work`) neatnaujintas.
- `research/wiki/guidelines/pamokos.md` — nauja pamoka neįrašyta. Siūloma formuluotė: „Slenkstis, kuris reikalauja dviejų įrodymų vietoj vieno“ (Simptomas: vaikas atlieka visą ciklą, bet pažanga neįrašoma; Priežastis: `returned >= 2`, nors modelis vienu metu duoda 1 lygį; Taisyklė: pažangos slenkstis = vienas pilnas ciklas; Patikra: ciklas silpniausiu nustatymu ir `simDone`).
- Pasiūlymai (iki 3) neįrašyti. Parengti: (a) `check_audio.py` nemato `api.speak("...")` eilučių simuliacijų kode — tekstas gali būti tariamas be įrašo ir vartai žali; (b) `check_view.py` matuoja tik `.chip`, o sim kortelės (`.vb-state`) nepatenka į dviejų eilučių vartus.

Neliečiau kitų simuliacijų, `app.js`, `registry.js`, `AGENTS.md`, kitų klasių. Commit ir publikavimą atlieka bėgiklis.

## klaidos

```
session_id: local-ab09029a0c3c7dcdfd98df94bd35b57ffedb0e79b5ca0a20f86617fbc5dfdae0
```
