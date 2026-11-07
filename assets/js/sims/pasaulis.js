import { art } from "./art.js";
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

      const seasonKey = d.s === "Žiema" ? "ziema"
        : d.s === "Pavasaris" ? "pavasaris"
          : d.s === "Vasara" ? "vasara" : "ruduo";
      const skyRef = seasonKey === "ziema" ? "ml-winter"
        : seasonKey === "ruduo" ? "ml-autumn" : "ml-sky";

      /* Sezoninė paletė: žiemą žalios kalvos prieštaravo užrašui „žiema“.
         Dabar kalvos, žemė ir saulė keičiasi kartu su mėnesiu. */
      const PAL = {
        ziema: { hill: "#dbe8f0", hill2: "#c2d6e2", ground: "#e8f1f6", band: "#dfe9ee", sun: 0.55 },
        pavasaris: { hill: "#bde0a0", hill2: "#a3cf84", ground: "#cdb489", band: "#a9d98a", sun: 0.9 },
        vasara: { hill: "#93cc83", hill2: "#74b366", ground: "#cbb287", band: "#6dbb62", sun: 1 },
        ruduo: { hill: "#e0c98d", hill2: "#cbae68", ground: "#cbb287", band: "#c9b05e", sun: 0.8 },
      }[seasonKey];

      svg.innerHTML = `
        ${art.defs("ml")}
        <rect x="0" y="0" width="360" height="300" rx="16" fill="url(#${skyRef})"/>
        <path d="M${215 - half} 205 Q215 ${cy} ${215 + half} 205" fill="none"
              stroke="#7f9ab2" stroke-width="3" stroke-dasharray="5 7" opacity=".9"/>
        ${art.sun(215, top, 13, "ml", PAL.sun)}
        ${birds}
        ${art.hills(360, 196, PAL.hill, PAL.hill2)}
        <rect x="0" y="205" width="360" height="95" fill="${PAL.ground}"/>
        <rect x="0" y="205" width="360" height="16" fill="${PAL.band}"/>
        ${art.grass(16, 209, 1, seasonKey === "ziema" ? "#bcd4de" : "#5aa552")}
        ${art.grass(296, 208, 0.95, seasonKey === "ziema" ? "#bcd4de" : "#5aa552")}
        ${art.grass(330, 210, 0.8, seasonKey === "ziema" ? "#bcd4de" : "#5aa552")}
        ${snow}
        ${art.tree(58, 209, 1.4, seasonKey)}
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
   pasakome žodžiu po simuliacija.

   Kodėl 4 ir 5 duoda 0,15 ir 0, o ne 0,5 ir 0,15: su 0,5 perlaistytas
   augalas per 12 dienų pasiekdavo LYGIAI tokį patį aukštį kaip laistytas
   teisingai (174 px) — vaikui vienintelis matomas dydis sakė „nieko
   blogo“, nors etiketė — „vysta“. P-009 žada, kad dešimt perlaistymo
   dienų duoda mažą augalą, todėl virš optimalaus kiekvienas papildomas
   žingsnis augimą mažina, o 5/5 jį sustabdo visai. */
const AG_WATER = [0, 0.4, 0.85, 1, 0.15, 0];     // vanduo 0–5 → augimo dalis
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

      const sunR = 13 + light * 1.6;
      const topX = 180 + (droop ? 14 : 0);

      /* Vandens perteklius — bala; sausra — įtrūkusi žemė. Abu rodo pasekmę,
         ne tik skaičių valdiklyje. */
      const soilDecor = water >= 4
        ? `<ellipse cx="180" cy="252" rx="${44 + size * 10}" ry="9" fill="#4d9fd1" opacity=".32"/>`
        : water === 0
          ? `<g stroke="#5d3720" stroke-opacity=".45" stroke-width="2.2" fill="none" stroke-linecap="round">
               <path d="M116 270 l11 8 l-7 9"/><path d="M252 268 l-10 9 l8 8"/></g>`
          : "";

      svg.innerHTML = `
        ${art.defs("ag")}
        <rect x="0" y="0" width="360" height="300" rx="18" fill="url(#ag-sky)"/>
        ${art.sun(312, 44, sunR, "ag", light / 5)}
        ${light >= 2 ? art.cloud(64, 54, 1) + art.cloud(150, 32, 0.72, 0.85) : ""}
        ${art.hills(360, 232)}
        ${art.soil(0, 248, 360, 52, "ag")}
        ${soilDecor}
        ${water >= 4 ? art.drops(74, 74, 6) : ""}
        ${size <= 0 ? `<ellipse cx="180" cy="252" rx="24" ry="12" fill="#5f3d27" opacity=".45"/>`
          + art.seed(180, 251, 1.2) : ""}
        ${h > 0 ? art.stem(180, 248, h, 3 + size * 5, stemCol, droop) : ""}
        ${h > 0 && size > 0.05
          ? art.leaf(178, 248 - h * 0.5, leafS, -1, droop, leafCol)
            + art.leaf(182, 248 - h * 0.34, leafS, 1, droop, leafCol) : ""}
        ${bloom ? art.flower(topX, 248 - h, 1) : ""}
        ${art.grass(26, 250, 1.1, cold ? "#a9c6cf" : "#5aa552")}
        ${art.grass(118, 251, 0.9, cold ? "#a9c6cf" : "#5aa552")}
        ${art.grass(304, 250, 1, cold ? "#a9c6cf" : "#5aa552")}
        ${cold ? art.snow(0, 246, 12) : ""}
      `;

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

      /* Kliūtis — ta sąlyga, kurios dalis mažiausia (silpniausia grandis).
         Sąlygos lyginamos tiesiogiai, o ne per `Math.min` reikšmę: tvarka
         fiksuota (šiluma → šviesa → vanduo), todėl `low === ...` neatspėja,
         o pasako pirmą silpniausią grandį. Pataisius ją, žinutė pasikeičia. */
      const why = () => {
        const wf = AG_WATER[water];
        const lf = AG_LIGHT[light];
        const hf = warm ? 1 : 0.1;
        if (hf < Math.min(wf, lf)) return "šalta, augalas beveik neauga";
        if (lf < wf) {
          return light === 0 ? "nėra šviesos, augalas blyškus" : "mažai šviesos, auga lėtai";
        }
        // Sausros žodis priklauso nuo to, ką vaikas mato: sėklai lapai nenusvyra.
        if (water === 0) {
          return size <= 0.05 ? "nėra vandens, sėkla nepabunda" : "nėra vandens, lapai nusvyra";
        }
        if (water >= 4) {
          return size <= 0.05 ? "per daug vandens, sėkla nepabunda" : "per daug vandens, šaknys nekvėpuoja";
        }
        return "mažai vandens, auga lėtai";
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
      if (gf === 0) dayMsg = "Šią dieną augalas visai nepajudėjo.";
      else dayMsg = gf < 0.5 ? "Šią dieną augalas beveik nepajudėjo." : "";
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
/* Grupė nustatoma pagal tuos pačius tris požymius (danga, kvėpavimas,
   jauniklių auginimas). Gyvūnų tvarka fiksuota ir sąmoningai permaišyta
   taip, kad gretimi gyvūnai priklausytų skirtingoms grupėms. Anksčiau
   sąrašas buvo maišomas `sort(() => Math.random() - 0.5)`: tas pats
   veiksmas duodavo skirtingą rezultatą (mokytojas negalėjo pakartoti),
   maišymas nebuvo tolygus, o kartais visi vienos grupės gyvūnai
   atsidurdavo greta — tada užduotis virsdavo „kopijuok kaimyną“. */
const GYVUNU_GRUPES = [
  { id: "zinduoliai", label: "Žinduoliai", dative: "žinduoliams", hint: "maitina jauniklius pienu" },
  { id: "pauksciai", label: "Paukščiai", dative: "paukščiams", hint: "turi plunksnas ir deda kiaušinius" },
  { id: "zuvis", label: "Žuvys", dative: "žuvims", hint: "gyvena vandenyje, kvėpuoja žiaunomis" },
];

const GYVUNAI = [
  { emoji: "🐄", name: "Karvė", g: "zinduoliai", pozymis: "maitina veršiuką pienu" },
  { emoji: "🐦", name: "Varnas", g: "pauksciai", pozymis: "turi plunksnas" },
  { emoji: "🐟", name: "Ešerys", g: "zuvis", pozymis: "kvėpuoja žiaunomis" },
  { emoji: "🦊", name: "Lapė", g: "zinduoliai", pozymis: "maitina jauniklius pienu" },
  { emoji: "🦆", name: "Antis", g: "pauksciai", pozymis: "deda kiaušinius" },
  { emoji: "🐠", name: "Karosas", g: "zuvis", pozymis: "turi žvynus" },
  { emoji: "🐇", name: "Kiškis", g: "zinduoliai", pozymis: "maitina jauniklius pienu" },
  { emoji: "🦉", name: "Pelėda", g: "pauksciai", pozymis: "turi plunksnas" },
  { emoji: "🦈", name: "Ryklys", g: "zuvis", pozymis: "kvėpuoja žiaunomis" },
];

/* Klaidinantis gyvūnas (pasiūlymas #727). Devyni akivaizdūs gyvūnai modelį
   tik patvirtina, bet negriauna nė vienos modulio įvardytos klaidingos
   nuostatos (10-gyvunu-grupes.json:79–83). Delfinas gyvena vandenyje ir
   plaukia kaip žuvis — todėl jį norisi dėti į žuvų dėžę. Jis parodomas TIK
   tada, kai devyni gyvūnai jau sudėti: tada tai perkėlimas (T2.2), o ne dar
   vienas pavyzdys. Jis neįskaitomas į api.progress — praplėtimas neturi
   tapti sąlyga užbaigti (T1.3).

   Užuominos skirtingos pagal dėžę, į kurią vaikas įdėjo: jos kartoja
   vaiko pastebėjimą („plaukia kaip žuvis“, „gyvena vandenyje“) ir klausia
   apie požymį. Teisingas atsakymas neįvardijamas (LL-22, T3.1). */
const KLAIDINANTIS_GYVUNAS = {
  emoji: "🐬", name: "Delfinas", g: "zinduoliai", pozymis: "maitina jauniklius pienu",
  extra: true,
  reveal: "Visi devyni gyvūnai savo grupėse! Dar vienas: delfinas. Kur jis?",
  right: "Delfinas gyvena vandenyje, bet maitina jauniklius pienu. Jis žinduolis!",
  note: "Delfinas neturi žiaunų. Jis kvėpuoja plaučiais. Todėl jis žinduolis, o ne žuvis.",
  hintZuvis: "Delfinas plaukia kaip žuvis, bet žiaunų neturi. Kuo jis kvėpuoja?",
  hintPauksciai: "Delfinas neturi plunksnų. Bet jis gyvena vandenyje. Kuo jis kvėpuoja?",
  step: "Prisimink: delfino jauniklis geria pieną. Ką tai pasako apie grupę?",
};

const gyvunuGrupes = {
  mount({ stage, controls, api }) {
    const groups = GYVUNU_GRUPES;
    // Papildomas gyvūnas gyvena tame pačiame sąraše (kad priskyrimo logika
    // būtų ta pati), bet `visible` jį paslepia iki devynių priskyrimų —
    // kitaip jis taptų dešimtuoju „eiliniu“ gyvūnu ir prarastų perkėlimo
    // prasmę.
    const animals = [
      ...GYVUNAI.map((a) => ({ ...a, done: false, visible: true })),
      { ...KLAIDINANTIS_GYVUNAS, done: false, visible: false, tries: 0 },
    ];

    let selected = null;
    let challenge = false;   // ar papildomas gyvūnas jau parodytas
    let reported = false;    // ar api.progress jau iškviestas (LL-17)
    const placed = { zinduoliai: 0, pauksciai: 0, zuvis: 0 };
    const timers = new Set();
    const left = () => animals.filter((a) => !a.done && a.visible).length;

    stage.innerHTML = `
      <div style="width:100%;max-width:46rem">
        <div id="gg-tray" style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;padding:.6rem;border-radius:var(--r-m);background:color-mix(in srgb, var(--mint) 10%, var(--paper))"></div>
        <div id="gg-bins" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(5.5rem,1fr));gap:.5rem;margin-top:1rem"></div>
        <p class="sim-note" id="gg-msg" tabindex="-1"></p>
      </div>`;
    controls.innerHTML = `<button class="btn ghost" id="gg-reset">Iš naujo</button>`;
    // Pastaba yra už scenos ribų, todėl „Iš naujo“ jos neišvalo — be šios
    // eilutės po perkrovimo liktų sakinys apie delfiną, nors lentelėje vėl
    // devyni gyvūnai (LL-16: būsena, kuri grįžta atgal per perkrovimą).
    api.note("");
    const trayEl = stage.querySelector("#gg-tray");
    const binsEl = stage.querySelector("#gg-bins");
    const msg = stage.querySelector("#gg-msg");

    function drawTray() {
      trayEl.innerHTML = "";
      animals.forEach((a) => {
        if (a.done || !a.visible) return;
        const on = selected === a.name;
        // Papildomas gyvūnas pažymėtas brūkšniu ir žodžiu — ne vien spalva
        // (T5.5): vaikas turi matyti, kad tai ne dešimtas eilinis gyvūnas.
        const border = on ? "3px solid var(--ink)"
          : (a.extra ? "3px dashed var(--ink-faint)" : "3px solid transparent");
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", a.extra
          ? `${a.name}. Papildomas gyvūnas. Pasirink.`
          : `${a.name}. Pasirink.`);
        b.setAttribute("aria-pressed", String(on));
        b.style.cssText = `border:${border};background:transparent;border-radius:14px;padding:4px 6px;cursor:pointer;font-size:2rem;min-width:64px;min-height:64px`;
        b.innerHTML = `<span aria-hidden="true" style="display:block;line-height:1.1">${a.emoji}</span>`
          + (a.extra ? `<span aria-hidden="true" style="display:block;font-size:.6rem;line-height:1.1;font-weight:700;color:var(--ink-soft)">papildomas</span>` : "")
          + `<span class="sr-only">${a.name}</span>`;
        b.addEventListener("click", () => {
          selected = a.name;
          drawTray();
          api.readout(`Pasirinkai: ${a.name}. Į kurią grupę dėti?`);
          api.speak(a.name, { rate: .9 });
          // Klaviatūra nesustoja ties perkurtu sąrašu: sekantis žingsnis — grupė.
          binsEl.querySelector("button[data-g]").focus();
        });
        trayEl.appendChild(b);
      });
    }

    // Ekrane gyvūnai rodomi paveikslėliais, todėl kiekvienos grupės mygtuko
    // pavadinimas keičiamas tekstu: grupė, kiek įdėta ir pagal ką atpažinti.
    function paintBins() {
      binsEl.querySelectorAll("button[data-g]").forEach((bin) => {
        const g = groups.find((x) => x.id === bin.dataset.g);
        bin.setAttribute("aria-label", `${g.label}. Įdėta ${placed[g.id]}. ${g.hint}.`);
      });
    }

    groups.forEach((g) => {
      const bin = document.createElement("button");
      bin.type = "button";
      bin.dataset.g = g.id;
      bin.style.cssText = "display:grid;place-items:center;gap:.25rem;padding:.6rem .3rem;border:3px dashed var(--line);border-radius:var(--r-m);background:var(--paper-2);cursor:pointer;min-height:9rem";
      bin.innerHTML = `<strong style="font-size:.95rem">${g.label}</strong><span style="font-size:.72rem;color:var(--ink-faint);text-align:center">${g.hint}</span><span class="items" aria-hidden="true" style="display:flex;gap:2px;flex-wrap:wrap;justify-content:center;font-size:1.1rem"></span>`;
      const holder = bin.querySelector(".items");
      bin.addEventListener("click", () => {
        if (!selected) { msg.textContent = "Pirma pasirink gyvūną."; api.readout("Pirma pasirink gyvūną."); return; }
        const a = animals.find((x) => x.name === selected && !x.done);
        if (!a) return;
        if (a.g === g.id) {
          a.done = true;
          placed[g.id] += 1;
          const mark = document.createElement("span");
          mark.textContent = a.emoji;
          mark.setAttribute("aria-hidden", "true");
          holder.appendChild(mark);
          selected = null;

          /* Papildomas gyvūnas: jokio skaičiaus, jokio api.progress — tik
             požymis ir priežastis, kodėl vieta vandenyje neklaidina. */
          if (a.extra) {
            drawTray();
            paintBins();
            msg.textContent = a.right;
            api.readout("Delfinas priklauso žinduoliams. Grupę rodo požymiai, o ne vieta.");
            api.note(a.note);
            msg.focus();
            return;
          }

          const baseLeft = animals.filter((x) => !x.done && !x.extra).length;
          if (baseLeft === 0 && !challenge) {
            challenge = true;
            const extra = animals.find((x) => x.extra);
            extra.visible = true;
            drawTray();
            paintBins();
            msg.textContent = extra.reveal;
            api.readout(`Visos grupės pilnos: žinduoliai ${placed.zinduoliai}, paukščiai ${placed.pauksciai}, žuvys ${placed.zuvis}. Dar vienas gyvūnas: delfinas.`);
            // Rezultatas — devyni gyvūnai grupėse. Papildomas gyvūnas jo
            // nebeatšaukia ir negrąžina atgal (LL-17).
            if (!reported) { reported = true; api.progress({ correct: true }); }
            const next = trayEl.querySelector("button");
            if (next) next.focus();
            return;
          }

          drawTray();
          paintBins();
          msg.textContent = `Teisingai — ${a.name} priklauso ${g.dative} ir ${a.pozymis}.`;
          api.readout(`Teisingai. ${a.name} priklauso ${g.dative}. Liko ${left()}.`);
          // Grįžtama prie gyvūnų: kitas priskyrimas prasideda nuo pasirinkimo.
          const next = trayEl.querySelector("button");
          if (next) next.focus();
        } else {
          bin.classList.add("wiggle");
          const t = setTimeout(() => { bin.classList.remove("wiggle"); timers.delete(t); }, 450);
          timers.add(t);

          if (a.extra) {
            a.tries += 1;
            // Pirma užuomina kartoja vaiko pastebėjimą ir klausia apie požymį,
            // antra — modelio žingsnis (T3.2). Atsakymas neįvardijamas (LL-22).
            msg.textContent = a.tries === 1
              ? (g.id === "zuvis" ? a.hintZuvis : a.hintPauksciai)
              : a.step;
            api.readout(`Delfinas liko lentelėje. Liko ${left()}.`);
            return;
          }

          msg.textContent = "Ne ši grupė. Pagalvok: kuo šis gyvūnas dengtas ir kuo kvėpuoja?";
          api.readout(`Ne ši grupė. ${a.name} liko lentelėje. Liko ${left()}.`);
        }
      });
      binsEl.appendChild(bin);
    });

    controls.querySelector("#gg-reset").addEventListener("click", () => {
      timers.forEach(clearTimeout);
      timers.clear();
      stage.innerHTML = "";
      controls.innerHTML = "";
      gyvunuGrupes.mount({ stage, controls, api });
    });
    drawTray();
    paintBins();
    api.readout(`Rūšiuok gyvūnus. Liko ${left()}.`);
    return () => { timers.forEach(clearTimeout); timers.clear(); };
  },
};

/* ------------------------------------------------------------------ */
/* 4. Vandens būsenos — kur dingsta vanduo                             */
/* ------------------------------------------------------------------ */
/* Klaidinga nuostata (Bar ir Galili, 1994): 5–6 m. vaikas mano, kad
   išgaravęs vanduo išnyksta, o 7–8 m. — kad jis susigeria į paviršių.
   Todėl modelis turi du kelius tam pačiam vandeniui:
     be dangčio — vanduo išeina į orą ir jo nebesugrąžinsi;
     su dangčiu — garas nusėda lašais, o „Grąžink lašus“ parodo, kad
     vandens kiekis puode vėl toks pat.
   Skaičių vaikas neskaičiuoja: lygį rodo vandens juosta puode ir lašai
   ant dangčio. Šiluma keičia greitį (0 / 1 / 2 lygio per „pakaitinimą“),
   o dangtis — tai, kur garas nusėda. Dangtis vėsus, nes ant jo guli
   ledukas: tai paaiškina, kodėl garas virsta lašais.
   Ribos: puodas rodomas perpjautas (kitaip vandens nesimatytų), o
   vanduo ore lieka nepavaizduotas — tik žodžiu pasakome, kad jis ten.
   Modelis neturi laikmačio: vienas paspaudimas = kelios minutės. */

const VB_MAX = 5;
const VB_HEAT = ["Vėsu", "Šilta", "Verdantis"];

const vandensBusenos = {
  mount({ stage, controls, api }) {
    let level = VB_MAX;      // vandens lygis 0..5
    let heat = 1;            // 0 vėsu, 1 šilta, 2 verdantis
    let lid = false;         // ar dangtis uždėtas
    let drops = 0;           // lašai ant dangčio (0..5)
    let inAir = 0;           // vanduo, išėjęs į orą be dangčio
    let returned = 0;        // kiek lašų grąžinta į puodą
    let presses = 0;         // kiek kartų kaitinta — tik bangelių vietai
    let reported = false;
    let msg = "Pakaitink puodą ir pažiūrėk, kas kyla virš vandens.";
    const spoke = { steam: false, drops: false, back: false };

    stage.innerHTML = `
      <div style="width:100%;max-width:28rem;margin:0 auto">
        <svg id="vb-scene" viewBox="0 0 360 330" role="img"
             aria-label="Vandens būsenų modelis: puodas ant laužo"></svg>
        <p class="sim-note" style="font-size:.8rem;text-align:center">
          Modelis supaprastintas: puodas rodomas perpjautas, kad matytum vandenį.
        </p>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.6rem;width:100%;max-width:32rem;margin:0 auto">
        <div>
          <label for="vb-heat" style="display:block;text-align:center;font-weight:800;font-size:.95rem">
            Šiluma: <span id="vb-heat-word">Šilta</span>
          </label>
          <input id="vb-heat" type="range" min="0" max="2" step="1" value="1"
                 aria-label="Šiluma po puodu: vėsu, šilta arba verdantis"
                 style="width:100%;height:48px;accent-color:var(--ink)" />
          <div aria-hidden="true" style="display:flex;justify-content:space-between;font-size:.75rem;color:var(--ink-soft);padding:0 .3rem">
            <span>Vėsu</span><span>Šilta</span><span>Verdantis</span>
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center">
          <button class="btn" id="vb-boil" aria-label="Pakaitink puodą kelias minutes"
                  style="flex:1 1 8.5rem;min-height:48px">Pakaitink</button>
          <button class="btn secondary" id="vb-lid" aria-pressed="false"
                  style="flex:1 1 8.5rem;min-height:48px">Uždėti dangtį</button>
          <button class="btn secondary" id="vb-back" aria-label="Pakreipk dangtį ir grąžink lašus į puodą"
                  style="flex:1 1 8.5rem;min-height:48px">Grąžink lašus</button>
          <button class="btn ghost" id="vb-reset" aria-label="Pradėti bandymą iš naujo"
                  style="flex:0 0 auto;min-height:48px">Iš naujo</button>
        </div>
      </div>`;

    const svg = stage.querySelector("#vb-scene");
    const q = (sel) => controls.querySelector(sel);

    const heatWord = () => VB_HEAT[heat].toLowerCase();

    /* Vanduo puode: kuo daugiau lygių, tuo aukščiau paviršius. */
    const waterTop = () => 250 - level * 14.8;

    function firePath(cx, baseY, h, col, op) {
      return `<path d="M${cx} ${baseY} C${cx - 13} ${baseY - h * 0.45} ${cx - 5} ${baseY - h * 0.7} ${cx} ${baseY - h}`
        + ` C${cx + 7} ${baseY - h * 0.6} ${cx + 13} ${baseY - h * 0.4} ${cx} ${baseY} Z"`
        + ` fill="${col}" opacity="${op}"/>`;
    }

    /* Garo srovelė: kylanti vingiuota linija. Kiekis ir aukštis priklauso
       nuo šilumos, o ne nuo atsitiktinumo — tą patį veiksmą vaikas gali
       pakartoti ir pamatyti tą patį vaizdą. */
    function steam(x, top, h, op) {
      return `<path d="M${x} ${top} q -9 -${h * 0.3} 0 -${h * 0.55} q 9 -${h * 0.28} 0 -${h * 0.55}"`
        + ` stroke="#ffffff" stroke-opacity="${op}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    }

    function render() {
      const top = waterTop();
      const strong = heat === 2;
      const fireH = heat === 0 ? 0 : strong ? 44 : 24;
      const flames = fireH
        ? firePath(180, 302, fireH, "#f2892f", 0.95)
          + firePath(164, 302, fireH * 0.68, "#f6a63c", 0.9)
          + firePath(196, 302, fireH * 0.62, "#f6a63c", 0.9)
          + firePath(180, 302, fireH * 0.52, "#ffd166", 0.95)
        : "";

      const bubbles = strong && level > 0
        ? Array.from({ length: 4 }, (_, i) => {
          const bx = 152 + i * 18;
          const by = Math.min(246, top + 16 + ((i * 13 + presses * 7) % 18));
          return `<circle cx="${bx}" cy="${by}" r="3" fill="#ffffff" opacity=".5"/>`;
        }).join("")
        : "";

      const water = level > 0
        ? `<path d="M126 ${top} Q180 ${top - 7} 234 ${top} L229 254 Q180 262 131 254 Z" fill="url(#vb-water)"/>
           <ellipse cx="180" cy="${top}" rx="54" ry="8" fill="#a6d9f0" opacity=".9"/>
           <path d="M140 ${top + 26} q14 -5 28 0 t28 0" stroke="#ffffff" stroke-opacity=".35"
                 stroke-width="2.4" fill="none" stroke-linecap="round"/>
           <path d="M150 ${top + 46} q12 -4 24 0 t24 0" stroke="#ffffff" stroke-opacity=".22"
                 stroke-width="2.2" fill="none" stroke-linecap="round"/>
           ${bubbles}`
        : `<path d="M131 254 Q180 262 229 254 L232 246 Q180 253 128 246 Z" fill="#8b5e3c" opacity=".55"/>`;

      const pot = `
        <path d="M112 150 H248 L241 252 Q236 268 180 270 Q124 268 119 252 Z"
              fill="#5c6772" stroke="#39424c" stroke-width="3"/>
        ${water}
        <path d="M121 168 q-17 5 -13 21 q3 11 16 8" fill="none" stroke="#39424c" stroke-width="6" stroke-linecap="round"/>
        <path d="M239 168 q17 5 13 21 q-3 11 -16 8" fill="none" stroke="#39424c" stroke-width="6" stroke-linecap="round"/>
        <ellipse cx="180" cy="150" rx="70" ry="13" fill="#6d7985" stroke="#39424c" stroke-width="3"/>
        <ellipse cx="180" cy="150" rx="60" ry="9" fill="#333b43"/>
        <path d="M124 158 q-4 46 3 84" stroke="#ffffff" stroke-opacity=".22" stroke-width="5"
              fill="none" stroke-linecap="round"/>`;

      const dropsUnderLid = drops > 0
        ? art.drops(155, 164, drops, "#5fb3e0")
        : "";

      const lidOn = `
        <ellipse cx="180" cy="150" rx="74" ry="14" fill="#c3ced8" stroke="#7e8b98" stroke-width="3"/>
        <ellipse cx="180" cy="146" rx="62" ry="9" fill="#dbe5ee" opacity=".7"/>
        ${art.block(166, 108, 28, "#e2f3fc", "", "#a7d3e6")}
        <text x="200" y="126" font-family="system-ui, sans-serif" font-size="11" font-weight="700"
              fill="#4a5560">ledas</text>
        ${dropsUnderLid}`;

      const lidOff = `
        <g transform="translate(292 292) rotate(-12)">
          <ellipse cx="0" cy="0" rx="34" ry="8" fill="#c3ced8" stroke="#7e8b98" stroke-width="2.5"/>
          <ellipse cx="0" cy="-3" rx="24" ry="5" fill="#dbe5ee" opacity=".7"/>
          ${drops > 0 ? art.drops(-16, 1, drops, "#5fb3e0") : ""}
        </g>`;

      /* Garas: be dangčio kyla aukštyn ir tolsta; su dangčiu lieka po juo. */
      const steamWisps = heat > 0 && level > 0 && !lid
        ? (heat === 2
          ? steam(168, 140, 62, 0.62) + steam(184, 138, 74, 0.55) + steam(200, 142, 54, 0.42)
          : steam(172, 142, 42, 0.42) + steam(192, 144, 34, 0.32))
        : "";

      /* Vanduo, kuris išėjo į orą: silpnos srovelės toliau nuo puodo.
         Jos rodo, kad vanduo liko ore, o ne dingo. */
      const airWisps = inAir > 0 && !lid
        ? steam(286, 132, 46, 0.22) + steam(306, 122, 36, 0.18)
        : "";

      svg.innerHTML = `
        ${art.defs("vb")}
        <rect x="0" y="0" width="360" height="330" rx="16" fill="url(#vb-sky)"/>
        ${art.sun(314, 46, 13, "vb", heat === 2 ? 1 : 0.85)}
        ${art.cloud(52, 54, 1)}
        ${art.cloud(148, 34, 0.62, 0.8)}
        ${art.birds(30, 100)}
        ${art.hills(360, 212)}
        ${art.soil(0, 236, 360, 94, "vb")}
        ${art.grass(24, 240, 1)}
        ${art.grass(330, 242, 0.9)}
        <g fill="#6f6257" stroke="#4f463d" stroke-width="2">
          <circle cx="126" cy="300" r="9"/><circle cx="234" cy="300" r="9"/>
          <circle cx="146" cy="311" r="7"/><circle cx="214" cy="311" r="7"/>
        </g>
        <g transform="translate(180 300) rotate(-8)">
          <rect x="-30" y="-3" width="60" height="9" rx="4.5" fill="#8a5c33"/>
        </g>
        <g transform="translate(180 302) rotate(9)">
          <rect x="-24" y="-2" width="48" height="8" rx="4" fill="#6f4630"/>
        </g>
        ${flames}
        ${pot}
        ${lid ? lidOn : lidOff}
        ${steamWisps}
        ${airWisps}`;

      svg.setAttribute("aria-label",
        `Puodas ant laužo. Vandens lygis ${level} iš ${VB_MAX}. `
        + `${heat === 0 ? "Ugnis nedega" : strong ? "Ugnis stipri" : "Ugnis silpna"}. `
        + `${lid ? "Dangtis uždėtas" : "Dangtis nuimtas"}. `
        + `Ant dangčio ${drops} lašų.`);

      q("#vb-heat").value = String(heat);
      q("#vb-heat").setAttribute("aria-valuetext", `Šiluma: ${heatWord()}`);
      q("#vb-heat-word").textContent = VB_HEAT[heat];

      const lidBtn = q("#vb-lid");
      lidBtn.textContent = lid ? "Nuimti dangtį" : "Uždėti dangtį";
      lidBtn.setAttribute("aria-pressed", String(lid));
      lidBtn.setAttribute("aria-label", lid ? "Nuimk dangtį nuo puodo" : "Uždėk vėsų dangtį ant puodo");

      api.readout(`Vandens lygis ${level} iš ${VB_MAX} · ${lid ? "dangtis uždėtas" : "dangtis nuimtas"}`
        + `${drops > 0 ? ` · ant dangčio ${drops} lašai` : ""}`);
      api.note(msg);

      if (!spoke.steam && heat > 0 && level < VB_MAX) { spoke.steam = true; api.speak("Garas"); }
      if (!spoke.drops && drops > 0) { spoke.drops = true; api.speak("Lašai"); }
      if (!spoke.back && returned > 0) { spoke.back = true; api.speak("Vanduo"); }
    }

    function boil() {
      if (level === 0) {
        msg = "Puodas tuščias. Paspausk „Iš naujo“ ir bandyk dar kartą.";
        render();
        return;
      }
      if (heat === 0) {
        msg = "Vėsioje vanduo beveik negaruoja. Pastumk šilumą į dešinę.";
        render();
        return;
      }
      const amount = Math.min(level, heat);   // 1 arba 2 lygiai per kartą
      level -= amount;
      presses += 1;
      if (lid) {
        drops = Math.min(VB_MAX, drops + amount);
        msg = drops === amount
          ? "Vanduo virto garu ir nusėdo ant dangčio lašais."
          : "Dar daugiau garo nusėdo ant dangčio.";
      } else {
        inAir += amount;
        msg = "Vanduo virto garu ir išėjo į orą. Jis ne dingo — jis ore.";
      }
      render();
    }

    function toggleLid() {
      lid = !lid;
      msg = lid
        ? "Dangtis uždėtas. Jis vėsus, todėl garas ant jo virs lašais."
        : "Dangtis nuimtas. Garas kils tiesiai į orą.";
      render();
    }

    function backToPot() {
      if (drops === 0) {
        msg = "Ant dangčio dar nėra lašų. Uždėk dangtį ir pakaitink.";
        render();
        return;
      }
      const amount = drops;
      level = Math.min(VB_MAX, level + amount);
      returned += amount;
      drops = 0;
      msg = "Lašai nubėgo atgal į puodą. Vanduo sugrįžo, nebuvo dingęs.";
      render();
      /* Rezultatas — visas ciklas: garas surinktas ant dangčio ir grąžintas.
         Vienas išgarinimas ar vienas lašas dar nėra įrodymas (LL-29). */
      if (!reported && returned >= 2) {
        reported = true;
        api.progress({ correct: true });
      }
    }

    q("#vb-heat").addEventListener("input", (e) => {
      heat = Number(e.target.value);
      msg = heat === 0
        ? "Vėsu: garų beveik nematyti."
        : heat === 1 ? "Šilta: vanduo pradeda garuoti." : "Verdantis: garas kyla stipriai.";
      render();
    });
    q("#vb-boil").addEventListener("click", boil);
    q("#vb-lid").addEventListener("click", toggleLid);
    q("#vb-back").addEventListener("click", backToPot);
    q("#vb-reset").addEventListener("click", () => {
      level = VB_MAX; heat = 1; lid = false; drops = 0; inAir = 0; returned = 0; presses = 0;
      msg = "Naujas bandymas. Pakaitink puodą ir stebėk garą.";
      render();
    });

    render();
    return null;
  },
};

export const SIMS = {
  "metu-laikai": metuLaikai,
  "augalo-gyvenimas": augaloGyvenimas,
  "gyvunu-grupes": gyvunuGrupes,
  "vandens-busenos": vandensBusenos,
};
