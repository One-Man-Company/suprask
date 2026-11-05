/**
 * Pasaulio pažinimo simuliacijos (1 klasė).
 * Principas: gamtos reiškinys tampa modeliu, kurį vaikas gali „pasukti“ ir pamatyti pasekmes.
 */

const NS = "http://www.w3.org/2000/svg";
const svgEl = (tag, attrs = {}) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};

/* ------------------------------------------------------------------ */
/* 1. Metų laikai — metų ratas                                         */
/* ------------------------------------------------------------------ */
/* Vienas kintamasis — mėnuo. Iš jo išvedama dienos trukmė, saulės
   kelio aukštis ir medžio būsena. Tai modelis, o ne keturi paruošti
   paveikslėliai: tempiant per metus matyti, kad pokytis laipsniškas,
   o ne „persijungia“ tam tikrą dieną. Dienos trukmė — apytikrė
   Vilniaus platumai (≈55° š. pl.), apvalinta iki 5 min. */
const MENUO = [
  { n: "Sausis", acc: "sausį", s: "Žiema", dm: 475, alt: 12, lapai: 0, sniegas: true, pauksciai: false,
    note: "Mažai šviesos. Medis ilsisi, daug paukščių išskrido." },
  { n: "Vasaris", acc: "vasarį", s: "Žiema", dm: 575, alt: 20, lapai: 0, sniegas: true, pauksciai: false,
    note: "Diena jau ilgėja, bet žiema dar laikosi." },
  { n: "Kovas", acc: "kovą", s: "Pavasaris", dm: 705, alt: 30, lapai: 1, sniegas: false, pauksciai: true,
    note: "Paukščiai grįžta, ant medžio sprogsta pumpurai." },
  { n: "Balandis", acc: "balandį", s: "Pavasaris", dm: 845, alt: 43, lapai: 1, sniegas: false, pauksciai: true,
    note: "Diena sparčiai ilgėja, todėl šilčiau ir žolė žaliuoja." },
  { n: "Gegužė", acc: "gegužę", s: "Pavasaris", dm: 970, alt: 53, lapai: 2, sniegas: false, pauksciai: true,
    note: "Beveik ilgiausia diena. Medis jau su lapais." },
  { n: "Birželis", acc: "birželį", s: "Vasara", dm: 1045, alt: 58, lapai: 3, sniegas: false, pauksciai: true,
    note: "Ilgiausia diena: daugiausia šviesos ir šilumos." },
  { n: "Liepa", acc: "liepą", s: "Vasara", dm: 1005, alt: 55, lapai: 3, sniegas: false, pauksciai: true,
    note: "Diena dar ilga, nors jau pamažu trumpėja." },
  { n: "Rugpjūtis", acc: "rugpjūtį", s: "Vasara", dm: 885, alt: 47, lapai: 3, sniegas: false, pauksciai: true,
    note: "Diena trumpėja. Vaisiai noksta, paukščiai ruošiasi." },
  { n: "Rugsėjis", acc: "rugsėjį", s: "Ruduo", dm: 750, alt: 36, lapai: 4, sniegas: false, pauksciai: false,
    note: "Lapai gelsta. Gandrai skrenda į šiltus kraštus." },
  { n: "Spalis", acc: "spalį", s: "Ruduo", dm: 625, alt: 25, lapai: 4, sniegas: false, pauksciai: false,
    note: "Diena trumpėja greitai. Lapai krinta." },
  { n: "Lapkritis", acc: "lapkritį", s: "Ruduo", dm: 500, alt: 15, lapai: 5, sniegas: false, pauksciai: false,
    note: "Šviesos vis mažiau. Medis beveik be lapų." },
  { n: "Gruodis", acc: "gruodį", s: "Žiema", dm: 435, alt: 11, lapai: 0, sniegas: true, pauksciai: false,
    note: "Trumpiausia diena. Sniegas, medis ilsisi." },
];

const metuLaikai = {
  mount({ stage, controls, api }) {
    const M = MENUO;
    let i = 0;                    // 0..11 — vienintelis modelio kintamasis
    let lastSeason = "";
    const seen = new Set();
    let reported = false;

    stage.innerHTML = `
      <div style="width:100%;max-width:26rem;margin:0 auto">
        <svg id="ml-scene" viewBox="0 0 360 300" role="img" aria-label="Metų laikų modelis"></svg>
        <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:.25rem .5rem;margin:.7rem 0 .3rem">
          <strong id="ml-hours" style="font-family:var(--font-head);font-size:1.1rem"></strong>
          <span id="ml-dir" style="font-weight:700;font-size:.9rem"></span>
        </div>
        <div id="ml-bar" role="img" style="position:relative;height:18px;border-radius:9px;background:var(--paper-2);border:2px solid var(--line)">
          <div id="ml-fill" style="height:100%;border-radius:7px;background:#f4b942"></div>
          <span style="position:absolute;left:30.2%;top:-5px;width:2px;height:28px;background:var(--ink-faint)"></span>
          <span style="position:absolute;left:72.6%;top:-5px;width:2px;height:28px;background:var(--ink-faint)"></span>
        </div>
        <div style="position:relative;height:1.1rem;margin-top:.15rem;font-size:.72rem;color:var(--ink-soft)">
          <span style="position:absolute;left:30.2%;transform:translateX(-50%)">gruodis</span>
          <span style="position:absolute;left:72.6%;transform:translateX(-50%)">birželis</span>
        </div>
        <p class="sim-note" style="font-size:.8rem;text-align:center">Tai supaprastintas modelis: tikras oras kasdien būna įvairus.</p>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.4rem;width:100%;max-width:26rem;margin:0 auto">
        <label for="ml-month" style="display:block;text-align:center;font-weight:800;font-size:.95rem">Mėnuo: <span id="ml-mname">Sausis</span></label>
        <input id="ml-month" type="range" min="1" max="12" step="1" value="1"
               aria-label="Pasirink mėnesį"
               style="width:100%;height:48px;accent-color:var(--ink)" />
        <div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap">
          <button class="btn secondary" id="ml-prev" aria-label="Ankstesnis mėnuo">◀ Ankstesnis</button>
          <button class="btn secondary" id="ml-next" aria-label="Kitas mėnuo">Kitas ▶</button>
        </div>
      </div>`;

    const svg = stage.querySelector("#ml-scene");
    const hoursEl = stage.querySelector("#ml-hours");
    const dirEl = stage.querySelector("#ml-dir");
    const barEl = stage.querySelector("#ml-bar");
    const fillEl = stage.querySelector("#ml-fill");
    const mname = controls.querySelector("#ml-mname");
    const range = controls.querySelector("#ml-month");

    const hm = (min) => `${Math.floor(min / 60)} val. ${String(min % 60).padStart(2, "0")} min.`;

    /* Medis: tas pats medis, penki jo metų etapai. */
    function tree(d) {
      const trunk = `<rect x="50" y="146" width="12" height="60" rx="4" fill="#8a6242"/>`;
      const branch = `<path d="M56 150 L38 130 M56 150 L74 128 M56 148 L56 118"
        stroke="#8a6242" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      const c = (x, y, r, col) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`;
      if (d.lapai === 0) return trunk + branch;
      if (d.lapai === 1) return trunk + branch
        + c(40, 132, 5, "#8ed081") + c(72, 130, 5, "#8ed081") + c(56, 116, 6, "#8ed081");
      if (d.lapai === 2) return trunk + branch
        + c(56, 138, 18, "#8ed081") + c(38, 146, 12, "#8ed081") + c(74, 146, 12, "#8ed081");
      if (d.lapai === 3) return trunk
        + c(56, 134, 30, "#4f9e4a") + c(34, 148, 20, "#4f9e4a") + c(78, 148, 20, "#4f9e4a");
      if (d.lapai === 4) return trunk
        + c(56, 134, 30, "#d98324") + c(34, 148, 20, "#d98324") + c(78, 148, 20, "#d98324");
      return trunk + branch
        + c(40, 136, 10, "#d98324") + c(72, 138, 10, "#d98324") + c(56, 126, 9, "#d98324");
    }

    const GROUND = {
      "Žiema": "#f1f7fb",
      "Pavasaris": "#a9d98a",
      "Vasara": "#6dbb62",
      "Ruduo": "#c9b05e",
    };

    function render() {
      const d = M[i];
      const half = 40 + ((d.dm - 435) / 610) * 90;   // kuo ilgesnė diena, tuo platesnis lankas
      const top = 205 - (d.alt / 58) * 120;           // kuo aukščiau saulė, tuo aukštesnis lankas
      const cy = 2 * top - 205;
      const snow = d.sniegas
        ? `<g fill="#ffffff"><circle cx="120" cy="209" r="4"/><circle cx="168" cy="215" r="3"/>
             <circle cx="232" cy="210" r="4"/><circle cx="292" cy="216" r="3"/>
             <circle cx="326" cy="208" r="3"/></g>`
        : "";
      const birds = d.pauksciai
        ? `<path d="M118 62 q7 -7 14 0 M148 46 q6 -6 12 0" stroke="#4a4a4a"
             stroke-width="3" fill="none" stroke-linecap="round"/>`
        : "";

      svg.innerHTML = `
        <rect x="0" y="0" width="360" height="205" rx="16" fill="#e4f1fb"/>
        <path d="M${215 - half} 205 Q215 ${cy} ${215 + half} 205" fill="none"
              stroke="#b9cddd" stroke-width="3" stroke-dasharray="5 6"/>
        <g stroke="#f4b942" stroke-width="3" stroke-linecap="round">
          <line x1="${215 - 22}" y1="${top}" x2="${215 - 14}" y2="${top}"/>
          <line x1="${215 + 14}" y1="${top}" x2="${215 + 22}" y2="${top}"/>
          <line x1="215" y1="${top - 22}" x2="215" y2="${top - 14}"/>
          <line x1="215" y1="${top + 14}" x2="215" y2="${top + 22}"/>
        </g>
        <circle cx="215" cy="${top}" r="13" fill="#f4b942"/>
        ${birds}
        <rect x="0" y="205" width="360" height="95" fill="#cbb287"/>
        <rect x="0" y="205" width="360" height="14" fill="${GROUND[d.s]}"/>
        ${snow}
        ${tree(d)}
        <text x="20" y="40" font-family="system-ui" font-size="22" font-weight="800" fill="#3a342b">${d.n}</text>
        <text x="20" y="62" font-family="system-ui" font-size="15" font-weight="600" fill="#5f574d">${d.s}</text>`;

      svg.setAttribute("aria-label",
        `Metų laikų modelis: ${d.n}, ${d.s.toLowerCase()}, šviesu ${hm(d.dm)}`);

      mname.textContent = d.n;
      range.value = String(i + 1);
      range.setAttribute("aria-valuetext", `${d.n}, šviesu ${hm(d.dm)}`);

      hoursEl.textContent = `Šviesu ${hm(d.dm)}`;
      const prev = M[(i + 11) % 12];
      const diff = d.dm - prev.dm;
      dirEl.textContent = diff > 0 ? `↗ ilgesnė nei ${prev.acc}`
        : diff < 0 ? `↘ trumpesnė nei ${prev.acc}`
        : `→ tokia pati kaip ${prev.acc}`;
      fillEl.style.width = `${(d.dm / 1440) * 100}%`;
      barEl.setAttribute("aria-label",
        `Dienos ilgis ${hm(d.dm)} iš 24 valandų; trumpiausia diena gruodį, ilgiausia birželį`);

      api.readout(`${d.n} — ${d.s.toLowerCase()}. Šviesu ${hm(d.dm)}`);
      api.note(d.note);
      if (d.s !== lastSeason) {
        lastSeason = d.s;
        api.speak(d.s, { rate: .9 });
      }

      /* Rezultatas — kai vaikas palygino abu galus, o ne kai „surinko“ mėnesius. */
      seen.add(i + 1);
      if (!reported && seen.has(6) && seen.has(12)) {
        reported = true;
        api.progress({ correct: true });
      }
    }

    const step = (n) => { i = (i + n + 12) % 12; render(); };
    controls.querySelector("#ml-prev").addEventListener("click", () => step(-1));
    controls.querySelector("#ml-next").addEventListener("click", () => step(1));
    range.addEventListener("input", () => { i = Number(range.value) - 1; render(); });

    render();
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 2. Augalo gyvenimas                                                 */
/* ------------------------------------------------------------------ */
const augaloGyvenimas = {
  mount({ stage, controls, api }) {
    let water = 2;
    let light = 2;
    let day = 1;

    stage.innerHTML = `<div style="width:100%;max-width:38rem"><svg id="ag-scene" viewBox="0 0 360 300" role="img" aria-label="Augalo augimo modelis"></svg></div>`;
    controls.innerHTML = `
      <div style="display:flex;gap:.4rem;flex-wrap:wrap;justify-content:center;align-items:center">
        <button class="btn secondary" id="ag-wmin">💧 mažiau</button>
        <button class="btn secondary" id="ag-wplus">💧 daugiau</button>
        <button class="btn secondary" id="ag-lmin">☀️ mažiau</button>
        <button class="btn secondary" id="ag-lplus">☀️ daugiau</button>
        <button class="btn" id="ag-next">Diena →</button>
      </div>`;
    const svg = stage.querySelector("#ag-scene");

    function growth() {
      if (water === 0 || light === 0) return 0;
      const base = Math.min(water, light) / 5;      // 0.2 – 1
      const time = Math.min(day / 10, 1);
      return base * time;
    }

    function render() {
      const g = growth();
      const h = 20 + g * 150;
      const leafSize = 10 + g * 26;
      const flower = g > 0.86;
      svg.innerHTML = `
        <rect x="0" y="0" width="360" height="300" rx="18" fill="color-mix(in srgb, var(--sky) 10%, var(--paper-2))"/>
        <rect x="0" y="248" width="360" height="52" fill="#8a6242" opacity=".35"/>
        <line x1="180" y1="248" x2="180" y2="${248 - h}" stroke="#4c8b3a" stroke-width="${4 + g * 6}" stroke-linecap="round"/>
        ${g > 0.15 ? `<ellipse cx="${180 - leafSize}" cy="${248 - h * .62}" rx="${leafSize}" ry="${leafSize * .55}" fill="#5fbf62" transform="rotate(-18 ${180 - leafSize} ${248 - h * .62})"/>
        <ellipse cx="${180 + leafSize}" cy="${248 - h * .45}" rx="${leafSize}" ry="${leafSize * .55}" fill="#4da653" transform="rotate(18 ${180 + leafSize} ${248 - h * .45})"/>` : ""}
        ${flower ? `<circle cx="180" cy="${248 - h - 6}" r="14" fill="#f2708a"/><circle cx="180" cy="${248 - h - 6}" r="5" fill="#ffc94d"/>` : ""}
        <text x="18" y="30" font-family="system-ui" font-size="14" font-weight="700" fill="#5f574d">💧 ${water}/5   ☀️ ${light}/5   📅 ${day} d.</text>`;
      const stageName = g === 0 ? "Sėkla dar nemirkusi" : g < 0.3 ? "Daigas" : g < 0.6 ? "Jaunas augalas" : g < 0.86 ? "Augalas su lapais" : "Žydi!";
      api.readout(stageName);
      if (water === 0) api.note("Augalui reikia vandens. Įpilk ir palauk.");
      else if (light === 0) api.note("Be šviesos augalas neaugs. Įjunk saulę.");
      else if (flower) api.note("Augalas pražydo. Kas jam labiausiai padėjo — vanduo, šviesa ar laikas?");
      else api.note("Keisk vandenį, šviesą ir dienas. Stebėk, kas nutinka.");
      if (flower) api.progress({ correct: true });
    }

    const bind = (id, fn) => controls.querySelector(id).addEventListener("click", () => { fn(); render(); });
    bind("#ag-wplus", () => { water = Math.min(5, water + 1); });
    bind("#ag-wmin", () => { water = Math.max(0, water - 1); });
    bind("#ag-lplus", () => { light = Math.min(5, light + 1); });
    bind("#ag-lmin", () => { light = Math.max(0, light - 1); });
    bind("#ag-next", () => { day = Math.min(30, day + 1); api.speak(`Diena ${day}`, { rate: 1 }); });

    render();
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 3. Gyvūnų grupės                                                    */
/* ------------------------------------------------------------------ */
const gyvunuGrupes = {
  mount({ stage, controls, api }) {
    const groups = [
      { id: "zinduoliai", label: "Žinduoliai", hint: "maitina jauniklius pienu" },
      { id: "pauksciai", label: "Paukščiai", hint: "turi plunksnas ir deda kiaušinius" },
      { id: "zuvis", label: "Žuvys", hint: "gyvena vandenyje, kvėpuoja žiaunomis" },
    ];
    const animals = [
      { emoji: "🐄", name: "Karvė", g: "zinduoliai" },
      { emoji: "🦊", name: "Lapė", g: "zinduoliai" },
      { emoji: "🐇", name: "Kiškis", g: "zinduoliai" },
      { emoji: "🐦", name: "Varnas", g: "pauksciai" },
      { emoji: "🦆", name: "Antis", g: "pauksciai" },
      { emoji: "🦉", name: "Pelėda", g: "pauksciai" },
      { emoji: "🐟", name: "Ešerys", g: "zuvis" },
      { emoji: "🐠", name: "Karosas", g: "zuvis" },
      { emoji: "🦈", name: "Ryklys", g: "zuvis" },
    ].sort(() => Math.random() - 0.5);

    let selected = null;
    const placed = { zinduoliai: 0, pauksciai: 0, zuvis: 0 };

    stage.innerHTML = `
      <div style="width:100%;max-width:46rem">
        <div id="gg-tray" style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;padding:.6rem;border-radius:var(--r-m);background:color-mix(in srgb, var(--mint) 10%, var(--paper))"></div>
        <div id="gg-bins" style="display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-top:1rem"></div>
        <p class="sim-note" id="gg-msg"></p>
      </div>`;
    controls.innerHTML = `<button class="btn ghost" id="gg-reset">Iš naujo</button>`;
    const trayEl = stage.querySelector("#gg-tray");
    const binsEl = stage.querySelector("#gg-bins");
    const msg = stage.querySelector("#gg-msg");

    function drawTray() {
      trayEl.innerHTML = "";
      animals.forEach((a) => {
        if (a.done) return;
        const b = document.createElement("button");
        b.style.cssText = `border:3px solid ${selected === a.name ? "var(--ink)" : "transparent"};background:transparent;border-radius:14px;padding:4px 6px;cursor:pointer;font-size:2rem;min-width:64px;min-height:64px`;
        b.innerHTML = `<span aria-hidden="true">${a.emoji}</span><span class="sr-only">${a.name}</span>`;
        b.addEventListener("click", () => { selected = a.name; drawTray(); api.speak(a.name, { rate: .9 }); });
        trayEl.appendChild(b);
      });
    }

    groups.forEach((g) => {
      const bin = document.createElement("button");
      bin.style.cssText = "display:grid;place-items:center;gap:.25rem;padding:.6rem .3rem;border:3px dashed var(--line);border-radius:var(--r-m);background:var(--paper-2);cursor:pointer;min-height:9rem";
      bin.innerHTML = `<strong style="font-size:.95rem">${g.label}</strong><span style="font-size:.72rem;color:var(--ink-faint);text-align:center">${g.hint}</span><span class="items" style="display:flex;gap:2px;flex-wrap:wrap;justify-content:center;font-size:1.1rem"></span>`;
      const holder = bin.querySelector(".items");
      bin.addEventListener("click", () => {
        if (!selected) { msg.textContent = "Pirma pasirink gyvūną."; return; }
        const a = animals.find((x) => x.name === selected && !x.done);
        if (!a) return;
        if (a.g === g.id) {
          a.done = true;
          placed[g.id] += 1;
          holder.textContent += a.emoji;
          selected = null;
          drawTray();
          msg.textContent = `Teisingai — ${a.name} yra ${g.label.toLowerCase()}.`;
          api.progress({ correct: true });
          if (animals.every((x) => x.done)) {
            msg.textContent = "Visi gyvūnai savo grupėse! Pagalvok: kuo dar skiriasi šios trys grupės?";
            api.readout(`Žinduoliai ${placed.zinduoliai}, paukščiai ${placed.pauksciai}, žuvys ${placed.zuvis}`);
          }
        } else {
          bin.classList.add("wiggle");
          setTimeout(() => bin.classList.remove("wiggle"), 450);
          msg.textContent = "Ne ši grupė. Pagalvok: kuo šis gyvūnas dengtas ir kuo kvėpuoja?";
        }
      });
      binsEl.appendChild(bin);
    });

    controls.querySelector("#gg-reset").addEventListener("click", () => {
      stage.innerHTML = "";
      controls.innerHTML = "";
      gyvunuGrupes.mount({ stage, controls, api });
    });
    drawTray();
    api.readout("Rūšiuok gyvūnus");
    return null;
  },
};

export const SIMS = {
  "metu-laikai": metuLaikai,
  "augalo-gyvenimas": augaloGyvenimas,
  "gyvunu-grupes": gyvunuGrupes,
};
