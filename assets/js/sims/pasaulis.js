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
/* 1. Metų laikai                                                      */
/* ------------------------------------------------------------------ */
const metuLaikai = {
  mount({ stage, controls, api }) {
    const seasons = [
      { name: "Pavasaris", sky: "#d9f0fb", ground: "#8fd38a", leaf: "#7ed957", sun: "#ffd84d", note: "Sniegas tirpsta, paukščiai grįžta, medžiai žydi." },
      { name: "Vasara", sky: "#bfe6ff", ground: "#5fbf62", leaf: "#3f9e4a", sun: "#ffb020", note: "Šilta, daug lapų, obuoliai noksta, bitės dūzgia." },
      { name: "Ruduo", sky: "#e6ecf2", ground: "#c9a56a", leaf: "#e08b3a", sun: "#f0b060", note: "Lapai gelsta ir krinta. Paukščiai ruošiasi skrydžiui." },
      { name: "Žiema", sky: "#e9f1f7", ground: "#ffffff", leaf: null, sun: "#cfe3f2", note: "Šalta, sniegas, medžiai be lapų, vanduo užšąla." },
    ];
    let idx = 0;

    stage.innerHTML = `<div style="width:100%;max-width:40rem"><svg id="ml-scene" viewBox="0 0 400 260" role="img" aria-label="Metų laikų scena"></svg></div>`;
    controls.innerHTML = `<div id="ml-btns" style="display:flex;gap:.4rem;flex-wrap:wrap;justify-content:center"></div>`;
    const svg = stage.querySelector("#ml-scene");
    const btns = controls.querySelector("#ml-btns");

    function render() {
      const s = seasons[idx];
      svg.innerHTML = `
        <rect x="0" y="0" width="400" height="210" rx="18" fill="${s.sky}"/>
        <circle cx="326" cy="52" r="26" fill="${s.sun}"/>
        <rect x="0" y="185" width="400" height="60" rx="0" fill="${s.ground}"/>
        <rect x="176" y="140" width="22" height="60" fill="#8a6242" rx="4"/>
        ${s.leaf ? `
          <circle cx="187" cy="118" r="44" fill="${s.leaf}"/>
          <circle cx="150" cy="134" r="30" fill="${s.leaf}"/>
          <circle cx="224" cy="134" r="30" fill="${s.leaf}"/>` : `
          <path d="M187 96 L160 128 M187 96 L214 126 M187 96 L187 132" stroke="#8a6242" stroke-width="5" fill="none" stroke-linecap="round"/>`}
        ${idx === 3 ? `<circle cx="60" cy="60" r="4" fill="#fff"/><circle cx="110" cy="34" r="3" fill="#fff"/><circle cx="250" cy="40" r="4" fill="#fff"/><circle cx="300" cy="96" r="3" fill="#fff"/>` : ""}
        ${idx === 0 ? `<g fill="#7ec8e3"><ellipse cx="70" cy="48" rx="26" ry="9"/><ellipse cx="96" cy="40" rx="18" ry="8"/></g>` : ""}
        ${idx === 2 ? `<g fill="#e08b3a" opacity=".95"><circle cx="80" cy="196" r="6"/><circle cx="120" cy="208" r="5"/><circle cx="300" cy="200" r="6"/></g>` : ""}
        <text x="200" y="243" text-anchor="middle" font-family="system-ui" font-size="15" font-weight="700" fill="#3a342b">${s.name}</text>`;
      api.readout(s.name);
      api.note(s.note);
      api.speak(s.name, { rate: .9 });
      [...btns.children].forEach((b, k) => {
        b.setAttribute("aria-pressed", String(k === idx));
        b.style.background = k === idx ? "var(--ink)" : "var(--paper-2)";
        b.style.color = k === idx ? "var(--paper)" : "var(--ink)";
      });
    }

    seasons.forEach((s, k) => {
      const b = document.createElement("button");
      b.className = "btn secondary";
      b.style.fontSize = ".95rem";
      b.textContent = s.name;
      b.addEventListener("click", () => { idx = k; render(); });
      btns.appendChild(b);
    });

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
