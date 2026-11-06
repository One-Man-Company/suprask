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
/* Modelis: trys sąlygos (vanduo, šviesa, šiluma) ir laikas.
   Augimas per dieną lygus SILPNIAUSIOS sąlygos daliai × 0,22 — todėl
   vienos trūkumas sustabdo viską, o vandens perteklius kenkia taip pat,
   kaip jo trūkumas (šaknys „dūsta“): vandens optimalu yra 3 iš 5.
   Dydis kaupiasi tik per dienas: pabloginus sąlygas augalas nesumenksta,
   bet nustoja augti ir pradeda vysti. Tai ir yra modelio riba, kurią
   pasakome žodžiu po simuliacija. */
const AG_WATER = [0, 0.4, 0.85, 1, 0.5, 0.15];   // vanduo 0–5 → augimo dalis
const AG_LIGHT = [0, 0.3, 0.7, 1, 1, 1];          // šviesa 0–5 → augimo dalis
const AG_DAYS_MAX = 12;
const AG_STEP = 0.22;                             // gera diena ≈ 22 % dydžio

const agFactors = (water, light, warm) => {
  const wf = AG_WATER[water];
  const lf = AG_LIGHT[light];
  const hf = warm ? 1 : 0.1;
  return { wf, lf, hf, gf: Math.min(wf, lf, hf) };
};
const agWaterWord = (w) => ["nėra", "mažai", "beveik gerai", "gerai", "per daug", "per daug"][w];
const agLightWord = (l) => (l === 0 ? "nėra" : l <= 2 ? "mažai" : "gerai");
const agStage = (s, wilt = false, cold = false, pale = false) => {
  if (s <= 0) return "Sėkla";
  if (wilt) return "Augalas vysta";
  if (cold) return "Augalas neauga";
  if (pale) return "Augalas blyškus";
  return s < 0.25 ? "Daigas" : s < 0.55 ? "Jaunas augalas" : s < 0.9 ? "Augalas su lapais" : "Žiedas";
};
const agDaysText = (n) => `${n} ${n === 1 ? "diena" : n < 10 ? "dienos" : "dienų"}`;

/* Lapas: nuo stiebo link šono. droop = 1 — lapas nusvyra žemyn. */
function agLeaf(x, y, s, dir, droop, col) {
  const tipX = x + dir * s * 0.95;
  const tipY = y - s * 0.55 + droop * s * 1.25;
  const c1x = x + dir * s * 0.8;
  const c1y = y - s * 0.95 + droop * s * 0.25;
  const c2x = x + dir * s * 0.35;
  const c2y = y + s * 0.35;
  return `<path d="M${x} ${y} Q${c1x} ${c1y} ${tipX} ${tipY} Q${c2x} ${c2y} ${x} ${y} Z" fill="${col}"/>`;
}

const augaloGyvenimas = {
  mount({ stage, controls, api }) {
    let water = 3;
    let light = 3;
    let warm = true;
    let day = 1;
    let size = 0;          // 0 — sėkla, 1 — suaugęs augalas
    let dayMsg = "";
    let lastStage = "";
    let bloomed = false;

    stage.innerHTML = `
      <div style="width:100%;max-width:30rem">
        <svg id="ag-scene" viewBox="0 0 360 300" role="img" aria-label="Augalo augimo modelis"></svg>
        <p class="sim-note" style="font-size:.8rem">Tai supaprastintas modelis: dirvožemis čia yra visą laiką, o šaknų nematome.</p>
      </div>`;

    const condRow = (id, label, icon) => `
      <div style="display:flex;align-items:center;gap:.4rem;min-height:56px;border-bottom:2px solid var(--line)">
        <span style="flex:0 0 auto;width:5.4rem;font-size:.9rem;font-weight:800"><span aria-hidden="true">${icon}</span> ${label}</span>
        <div id="ag-${id}-dots" aria-hidden="true" style="display:flex;flex:1 1 auto;min-width:0;gap:3px"></div>
        <button class="btn secondary" id="ag-${id}-minus" aria-label="Mažiau: ${label.toLowerCase()}" style="flex:0 0 auto;min-width:48px;min-height:48px;padding:0;font-size:1.35rem;line-height:1">−</button>
        <button class="btn secondary" id="ag-${id}-plus" aria-label="Daugiau: ${label.toLowerCase()}" style="flex:0 0 auto;min-width:48px;min-height:48px;padding:0;font-size:1.35rem;line-height:1">+</button>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.5rem;width:100%;max-width:34rem;margin:0 auto">
        <div style="border:2px solid var(--line);border-radius:var(--r-m);background:var(--paper-2);padding:.35rem .5rem">
          ${condRow("w", "Vanduo", "💧")}
          ${condRow("l", "Šviesa", "☀️")}
          <div style="display:flex;align-items:center;gap:.4rem;min-height:56px">
            <span style="flex:0 0 auto;width:5.4rem;font-size:.9rem;font-weight:800"><span aria-hidden="true">🌡️</span> Šiluma</span>
            <button class="btn secondary" id="ag-cold" aria-pressed="false" style="flex:1 1 0;min-width:48px;min-height:48px;padding:.3rem .2rem;font-size:.95rem">Šalta</button>
            <button class="btn secondary" id="ag-warm" aria-pressed="true" style="flex:1 1 0;min-width:48px;min-height:48px;padding:.3rem .2rem;font-size:.95rem">Šilta</button>
          </div>
        </div>
        <div style="display:flex;gap:.4rem;align-items:center;justify-content:center;flex-wrap:wrap">
          <span id="ag-day" style="font-weight:800;font-size:.95rem">1 diena</span>
          <button class="btn" id="ag-next" aria-label="Kita diena" style="flex:1 1 auto;min-height:48px;padding:.5rem .8rem;font-size:.95rem">Diena →</button>
          <button class="btn ghost" id="ag-reset" aria-label="Pradėti iš naujo" style="flex:0 0 auto;min-width:48px;min-height:48px;padding:.5rem .7rem;font-size:.95rem">Iš naujo</button>
        </div>
      </div>`;

    const svg = stage.querySelector("#ag-scene");
    const q = (sel) => controls.querySelector(sel);

    function dots(el, value, max) {
      el.innerHTML = "";
      for (let k = 1; k <= max; k += 1) {
        const s = document.createElement("span");
        s.style.cssText = "flex:1 1 0;min-width:0;height:12px;border-radius:3px;"
          + (k <= value ? "background:var(--ink)" : "border:2px solid var(--ink-faint)");
        el.appendChild(s);
      }
    }

    function render() {
      const { gf } = agFactors(water, light, warm);
      const wilt = water === 0 || water >= 4;
      const pale = light <= 1;
      const cold = !warm;
      const bloom = size >= 0.9 && !wilt && !cold && !pale;

      const h = size <= 0 ? 0 : 22 + size * 152;
      const leafS = 12 + size * 22;
      const droop = wilt ? 1 : 0;
      const stemCol = cold ? "#6f93a8" : pale ? "#8fae78" : "#4c8b3a";
      const leafCol = water === 0 ? "#b9a06c"
        : water >= 4 ? "#bdb75c"
          : cold ? "#7fa2b5" : pale ? "#a8c98a" : "#5fbf62";

      const sunR = 13 + light * 1.8;
      const rays = light >= 2
        ? [0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
          const rad = (a * Math.PI) / 180;
          const r1 = sunR + 6;
          const r2 = sunR + 13;
          return `<line x1="${312 + Math.cos(rad) * r1}" y1="${44 + Math.sin(rad) * r1}"`
            + ` x2="${312 + Math.cos(rad) * r2}" y2="${44 + Math.sin(rad) * r2}"/>`;
        }).join("")
        : "";

      const petals = bloom
        ? Array.from({ length: 6 }, (_, k) => {
          const a = (k * 60 * Math.PI) / 180;
          return `<circle cx="${180 + Math.cos(a) * 9}" cy="${248 - h - 10 + Math.sin(a) * 9}" r="7" fill="#f2708a"/>`;
        }).join("")
        : "";

      const flakes = cold
        ? [58, 104, 268, 314].map((x) => `<path d="M${x} 270 h16 M${x + 8} 262 v16`
          + ` M${x + 2} 264 l12 12 M${x + 14} 264 l-12 12" stroke="#5aa9e6" stroke-width="2.5" stroke-linecap="round"/>`).join("")
        : "";

      svg.innerHTML = `
        <rect x="0" y="0" width="360" height="300" rx="18" fill="color-mix(in srgb, var(--sky) 10%, var(--paper-2))"/>
        <circle cx="312" cy="44" r="${sunR}" fill="#f4b942" opacity="${light === 0 ? 0.35 : 1}"/>
        <g stroke="#f4b942" stroke-width="3" stroke-linecap="round">${rays}</g>
        <rect x="0" y="248" width="360" height="52" fill="#a4805a"/>
        ${size <= 0 ? '<ellipse cx="180" cy="242" rx="9" ry="6" fill="#6b4a2f"/>' : ""}
        ${h > 0 ? `<line x1="180" y1="248" x2="180" y2="${248 - h}" stroke="${stemCol}" stroke-width="${3 + size * 5}" stroke-linecap="round"/>` : ""}
        ${h > 0 && size > 0.05 ? agLeaf(179, 248 - h * 0.55, leafS, -1, droop, leafCol)
    + agLeaf(181, 248 - h * 0.4, leafS, 1, droop, leafCol) : ""}
        ${petals}${petals ? `<circle cx="180" cy="${248 - h - 10}" r="8" fill="#ffc94d"/>` : ""}
        <ellipse cx="180" cy="248" rx="${26 + size * 6}" ry="7" fill="#8a6242" opacity=".55"/>
        ${flakes}`;

      svg.setAttribute("aria-label",
        `Augalo modelis: ${agStage(size, wilt, cold, pale).toLowerCase()}, vanduo ${agWaterWord(water)}, `
        + `šviesa ${agLightWord(light)}, ${warm ? "šilta" : "šalta"}`);

      dots(q("#ag-w-dots"), water, 5);
      dots(q("#ag-l-dots"), light, 5);

      /* Pasirinkimas rodomas ir spalva, ir aria-pressed — spalva ne vienintelė. */
      q("#ag-cold").setAttribute("aria-pressed", String(!warm));
      q("#ag-warm").setAttribute("aria-pressed", String(warm));
      for (const [btn, on] of [[q("#ag-cold"), !warm], [q("#ag-warm"), warm]]) {
        btn.style.background = on ? "var(--ink)" : "var(--paper-2)";
        btn.style.color = on ? "var(--paper)" : "var(--ink)";
        btn.style.borderColor = on ? "var(--ink)" : "var(--line)";
      }
      q("#ag-day").textContent = agDaysText(day);
      q("#ag-next").disabled = day >= AG_DAYS_MAX;

      const st = agStage(size, wilt, cold, pale);
      api.readout(`${st} · vanduo ${agWaterWord(water)} · šviesa ${agLightWord(light)}`
        + ` · ${warm ? "šilta" : "šalta"} · ${agDaysText(day)}`);

      /* Kliūtis — ta sąlyga, kurios dalis mažiausia (silpniausia grandis). */
      const why = () => {
        const low = Math.min(AG_WATER[water], AG_LIGHT[light], warm ? 1 : 0.1);
        if (low === (warm ? 1 : 0.1)) return "šalta, augalas beveik neauga";
        if (low === AG_WATER[water]) {
          if (water === 0) return "nėra vandens, lapai nusvyra";
          if (water >= 4) return "per daug vandens, šaknys nekvėpuoja";
          return "mažai vandens, auga lėtai";
        }
        return light === 0 ? "nėra šviesos, augalas blyškus" : "mažai šviesos, auga lėtai";
      };

      const cause = gf >= 0.8 ? "" : why();
      let note;
      if (cause) note = `Ko trūksta: ${cause}.`;
      else if (size >= 1) note = "Augalas išaugo ir pražydo. Dabar pakeisk vieną sąlygą — kas nutiks?";
      else note = "Sąlygos geros. Spausk „Kita diena“ — augalas paūgės.";
      api.note(dayMsg ? `${dayMsg} ${note}` : note);

      if (st !== lastStage) {
        lastStage = st;
        api.speak(st, { rate: 0.9 });
      }

      /* Rezultatas — pražydęs augalas, o ne kiekvienas paspaudimas. */
      if (!bloomed && bloom) {
        bloomed = true;
        api.progress({ correct: true });
      }
      return gf;
    }

    const dayStep = () => {
      if (day >= AG_DAYS_MAX) return;
      const { gf } = agFactors(water, light, warm);
      day += 1;
      size = Math.min(1, size + gf * AG_STEP);
      dayMsg = gf < 0.5 ? "Šią dieną augalas beveik nepajudėjo." : "";
      render();
    };
    const setCond = (fn) => { fn(); dayMsg = ""; render(); };

    q("#ag-w-plus").addEventListener("click", () => setCond(() => { water = Math.min(5, water + 1); }));
    q("#ag-w-minus").addEventListener("click", () => setCond(() => { water = Math.max(0, water - 1); }));
    q("#ag-l-plus").addEventListener("click", () => setCond(() => { light = Math.min(5, light + 1); }));
    q("#ag-l-minus").addEventListener("click", () => setCond(() => { light = Math.max(0, light - 1); }));
    q("#ag-cold").addEventListener("click", () => setCond(() => { warm = false; }));
    q("#ag-warm").addEventListener("click", () => setCond(() => { warm = true; }));
    q("#ag-next").addEventListener("click", dayStep);
    q("#ag-reset").addEventListener("click", () => {
      water = 3; light = 3; warm = true; day = 1; size = 0; dayMsg = ""; lastStage = "";
      render();
    });

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
