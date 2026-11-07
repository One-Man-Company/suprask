/**
 * Matematikos simuliacijos (1 klasė).
 * Principas: skaičius ir figūra pirma parodomi kaip daiktas, tik paskui — kaip simbolis.
 */

const NS = "http://www.w3.org/2000/svg";
const svgEl = (tag, attrs = {}) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};

/* ------------------------------------------------------------------ */
/* 1. Skaičių linija                                                   */
/* ------------------------------------------------------------------ */
const skaiciuTiese = {
  mount({ stage, controls, api, config }) {
    const max = config.max || 20;
    const targets = config.targets || [5, 8, 12, 15];
    let pos = 0;
    let t = 0;

    stage.innerHTML = `<div style="width:100%"><svg id="sl-svg" viewBox="0 0 720 170" role="img" aria-label="Skaičių tiesė nuo 0 iki ${max}"></svg></div>`;
    controls.innerHTML = `
      <button class="btn secondary" id="sl-minus" style="font-size:1.4rem;min-width:4rem">− 1</button>
      <button class="btn" id="sl-plus" style="font-size:1.4rem;min-width:4rem">+ 1</button>
      <button class="btn ghost" id="sl-reset">Iš naujo</button>`;

    const svg = stage.querySelector("#sl-svg");
    const pad = 34;
    const step = (720 - pad * 2) / max;
    const y = 92;

    svg.appendChild(svgEl("line", { x1: pad, y1: y, x2: 720 - pad, y2: y, stroke: "var(--line)", "stroke-width": 6, "stroke-linecap": "round" }));

    for (let i = 0; i <= max; i += 1) {
      const x = pad + i * step;
      svg.appendChild(svgEl("line", { x1: x, y1: y - 9, x2: x, y2: y + 9, stroke: "var(--ink-faint)", "stroke-width": 2 }));
      const label = svgEl("text", {
        x, y: y + 32, "text-anchor": "middle", fill: "var(--ink-soft)",
        "font-size": max > 12 ? 13 : 15, "font-family": "system-ui", "font-weight": 700,
      });
      label.textContent = i;
      svg.appendChild(label);
    }

    const marker = svgEl("g", {});
    const bubble = svgEl("circle", { r: 22, fill: "var(--accent)" });
    const num = svgEl("text", {
      "text-anchor": "middle", y: 7, fill: "#fff", "font-size": 20, "font-weight": 900, "font-family": "system-ui",
    });
    marker.appendChild(bubble);
    marker.appendChild(num);
    const goalRing = svgEl("circle", { r: 30, fill: "none", stroke: "var(--mint)", "stroke-width": 4, "stroke-dasharray": "5 6" });
    svg.appendChild(goalRing);
    svg.appendChild(marker);

    function paint() {
      const x = pad + pos * step;
      marker.setAttribute("transform", `translate(${x},${y - 34})`);
      num.textContent = pos;
      const gx = pad + targets[t] * step;
      goalRing.setAttribute("cx", gx);
      goalRing.setAttribute("cy", y - 34);
      api.readout(`Tu esi ties ${pos}. Tikslas — ${targets[t]}.`);
    }

    function move(d) {
      pos = Math.max(0, Math.min(max, pos + d));
      paint();
      api.speak(String(pos), { rate: .95 });
      if (pos === targets[t]) {
        api.note(`Puiku! ${targets[t]}. Kiek žingsnių liko iki ${max}?`);
        api.progress({ correct: true });
        t = Math.min(t + 1, targets.length - 1);
        setTimeout(paint, 900);
      }
    }

    controls.querySelector("#sl-plus").addEventListener("click", () => move(1));
    controls.querySelector("#sl-minus").addEventListener("click", () => move(-1));
    controls.querySelector("#sl-reset").addEventListener("click", () => { pos = 0; paint(); api.note("Pradėk nuo nulio."); });

    paint();
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 2. Dešimtukas (ten-frame)                                           */
/* ------------------------------------------------------------------ */
const desimtukas = {
  mount({ stage, controls, api, config }) {
    const cells = Number(config.cells) || 10;
    stage.innerHTML = `
      <div style="text-align:center">
        <div id="dt-grid" style="display:grid;grid-template-columns:repeat(5,minmax(2.6rem,3.4rem));grid-template-rows:repeat(2,minmax(2.6rem,3.4rem));gap:.5rem;justify-content:center"></div>
        <p class="sim-note" id="dt-msg">Spausk langelius ir skaičiuok. Kiek trūksta iki 10?</p>
      </div>`;
    controls.innerHTML = `<button class="btn secondary" id="dt-clear">Išvalyti</button>`;
    const grid = stage.querySelector("#dt-grid");
    const msg = stage.querySelector("#dt-msg");
    const filled = new Set();

    for (let i = 0; i < cells; i += 1) {
      const b = document.createElement("button");
      b.className = "cell";
      b.style.cssText = "width:100%;aspect-ratio:1;border-radius:14px;border:3px solid var(--line);background:var(--paper);font-size:1.6rem;cursor:pointer;transition:transform .1s";
      b.setAttribute("aria-label", `Langelis ${i + 1}`);
      b.addEventListener("click", () => {
        if (filled.has(i)) { filled.delete(i); b.textContent = ""; b.style.background = "var(--paper)"; b.style.borderColor = "var(--line)"; }
        else { filled.add(i); b.textContent = "🔵"; b.style.background = "color-mix(in srgb, var(--sky) 14%, var(--paper))"; b.style.borderColor = "var(--sky)"; }
        update();
      });
      grid.appendChild(b);
    }

    function update() {
      const n = filled.size;
      api.readout(`${n} iš ${cells}. Trūksta ${cells - n}.`);
      if (n === cells) { msg.textContent = "Pilnas dešimtukas! Dabar atimk 3 — kas lieka?"; api.progress({ correct: true }); api.speak("Dešimt. Puiku!"); }
      else if (n === Math.ceil(cells / 2)) { msg.textContent = "Pusė dešimtuko — penki. Kaip dar gali pasakyti penkis?"; }
      else { msg.textContent = "Spausk langelius ir skaičiuok. Kiek trūksta iki 10?"; }
    }

    controls.querySelector("#dt-clear").addEventListener("click", () => {
      filled.clear();
      [...grid.children].forEach((b) => { b.textContent = ""; b.style.background = "var(--paper)"; b.style.borderColor = "var(--line)"; });
      update();
    });

    update();
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 3. Figūrų rūšiavimas pagal kampus                                   */
/*                                                                    */
/* Modelis: figūrą apibrėžia kampų skaičius, o ne padėtis ekrane.      */
/* Vaikas pasuka figūrą ir pamato, kad kampų skaičius nesikeičia —     */
/* būtent tai griovė ankstesnę versiją, kurioje visos figūros stovėjo  */
/* „kaip paveikslėlyje“ ir pasukta figūra likdavo neatpažinta.         */
/* ------------------------------------------------------------------ */
const figuros = {
  mount({ stage, controls, api }) {
    /* Kiekviena figūra aprašyta viršūnėmis. Apskritimas viršūnių neturi —
       tai ir yra jo apibrėžtis, o ne „apvali išvaizda“. */
    const TYPES = {
      trikampis: { corners: 3, points: [[50, 8], [92, 88], [8, 88]] },
      keturkampis: { corners: 4, points: [[14, 26], [86, 26], [86, 74], [14, 74]] },
      kvadratas: { corners: 4, points: [[18, 18], [82, 18], [82, 82], [18, 82]] },
      trapecija: { corners: 4, points: [[24, 22], [76, 22], [94, 82], [6, 82]] },
      apskritimas: { corners: 0, circle: { cx: 50, cy: 50, r: 40 } },
    };

    /* Fiksuota tvarka, ne atsitiktinė: mokytojas gali numatyti, ką vaikas
       matys, o du bandymai lieka palyginami. Pasukimai sąmoningai
       „negražūs“ — figūra turi būti atpažįstama ne pagal padėtį. */
    const LAYOUT = [
      { type: "trikampis", angle: 0 },
      { type: "keturkampis", angle: 0 },
      { type: "apskritimas", angle: 0, scale: 0.62 },
      { type: "kvadratas", angle: 45 },
      { type: "trikampis", angle: 155 },
      { type: "trapecija", angle: 0 },
      { type: "apskritimas", angle: 0 },
      { type: "trikampis", angle: 265 },
    ];

    /* Dėžės vadinamos savybe, ne figūros vardu: taip rūšiuojama pagal
       kampus, o ne pagal perskaitytą žodį. */
    const BINS = [
      { corners: 3, sample: "trikampis", label: "3 kampai" },
      { corners: 4, sample: "keturkampis", label: "4 kampai" },
      { corners: 0, sample: "apskritimas", label: "0 kampų" },
    ];

    const cornerWord = (c) => (c === 0 ? "0 kampų" : `${c} kampai`);
    const turned = (item) => item.angle % 90 !== 0;

    let alive = true;
    let timers = [];
    let state = null;

    const later = (fn, ms) => {
      const id = setTimeout(() => { if (alive) fn(); }, ms);
      timers.push(id);
    };
    const stopTimers = () => { timers.forEach(clearTimeout); timers = []; };

    stage.innerHTML = `
      <div id="fg-wrap" style="width:100%;max-width:100%;min-width:0;box-sizing:border-box">
        <p class="sim-note" style="margin:0 0 .55rem;text-align:center">Pasirink figūrą, tada spausk dėžę su tuo pačiu kampų skaičiumi.</p>
        <div id="fg-tray" role="group" aria-label="Figūros rūšiavimui"
             style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.45rem;box-sizing:border-box"></div>
        <div id="fg-bins" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.45rem;margin-top:.9rem;box-sizing:border-box"></div>
      </div>`;
    controls.innerHTML = `
      <button class="btn secondary" id="fg-turn">Pasuk pasirinktą</button>
      <button class="btn secondary" id="fg-corners" aria-pressed="false">Rodyk kampus</button>
      <button class="btn ghost" id="fg-reset">Iš naujo</button>`;

    const trayEl = stage.querySelector("#fg-tray");
    const binsEl = stage.querySelector("#fg-bins");
    const turnBtn = controls.querySelector("#fg-turn");
    const cornersBtn = controls.querySelector("#fg-corners");

    function freshState() {
      return {
        items: LAYOUT.map((cfg, i) => ({
          key: `f${i}`,
          n: i + 1,
          angle: cfg.angle,
          scale: cfg.scale || 1,
          corners: TYPES[cfg.type].corners,
          type: cfg.type,
          done: false,
        })),
        selected: null,
        showCorners: false,
      };
    }

    /* SVG figūra: transformacija sukama; kampai žymimi taškais. */
    function shapeSvg(item, { size = null, dots = false, angle = 0, scale = 1 } = {}) {
      const svg = svgEl("svg", { viewBox: "0 0 100 100", "aria-hidden": "true", focusable: "false" });
      if (size) {
        svg.setAttribute("width", String(size));
        svg.setAttribute("height", String(size));
      } else {
        svg.style.cssText = "display:block;width:100%;height:100%;max-width:100%";
      }
      const type = TYPES[item.type];
      const g = svgEl("g", {
        transform: `translate(50 50) rotate(${angle}) scale(${scale}) translate(-50 -50)`,
      });
      if (type.circle) {
        g.appendChild(svgEl("circle", {
          ...type.circle,
          fill: "color-mix(in srgb, var(--sky) 26%, var(--paper-2))",
          stroke: "var(--ink)",
          "stroke-width": 5,
        }));
      } else {
        g.appendChild(svgEl("polygon", {
          points: type.points.map(([x, y]) => `${x},${y}`).join(" "),
          fill: "color-mix(in srgb, var(--sun) 42%, var(--paper-2))",
          stroke: "var(--ink)",
          "stroke-width": 5,
          "stroke-linejoin": "round",
        }));
        if (dots) {
          type.points.forEach(([x, y]) => {
            g.appendChild(svgEl("circle", {
              cx: x, cy: y, r: 7.5,
              // Tamsus kontūras: taškas išlieka matomas ir šviesioje, ir tamsioje
              // temoje, o informaciją neša ne vien spalva.
              fill: "var(--coral)", stroke: "var(--ink)", "stroke-width": 2.5,
            }));
          });
        }
      }
      svg.appendChild(g);
      return svg;
    }

    function shapeLabel(item) {
      if (state.showCorners) return `Figūra ${item.n}: ${cornerWord(item.corners)}`;
      return turned(item) ? `Figūra ${item.n}, pasukta` : `Figūra ${item.n}`;
    }

    function buildTray() {
      trayEl.innerHTML = "";
      state.items.forEach((item) => {
        const b = document.createElement("button");
        b.type = "button";
        b.dataset.key = item.key;
        b.style.cssText = "box-sizing:border-box;width:100%;min-width:0;min-height:56px;aspect-ratio:1;" +
          "padding:4px;border:3px solid transparent;border-radius:14px;background:transparent;" +
          "cursor:pointer;display:grid;place-items:center;touch-action:manipulation";
        b.setAttribute("aria-pressed", "false");
        b.setAttribute("aria-label", shapeLabel(item));
        b.addEventListener("click", () => select(item));
        trayEl.appendChild(b);
      });
    }

    function paintTray() {
      [...trayEl.children].forEach((b) => {
        const item = state.items.find((x) => x.key === b.dataset.key);
        if (!item) return;
        b.hidden = item.done;
        // `hidden` vienas nepakanka: įterptas `display:grid` nustelbia naršyklės
        // taisyklę `[hidden]{display:none}`, ir įdėta figūra liktų matoma.
        b.style.display = item.done ? "none" : "grid";
        b.innerHTML = "";
        b.appendChild(shapeSvg(item, { dots: state.showCorners, angle: item.angle, scale: item.scale }));
        const on = state.selected === item.key;
        b.style.borderColor = on ? "var(--ink)" : "transparent";
        b.style.background = on ? "color-mix(in srgb, var(--accent) 16%, transparent)" : "transparent";
        b.setAttribute("aria-pressed", String(on));
        b.setAttribute("aria-label", shapeLabel(item));
      });
    }

    function buildBins() {
      binsEl.innerHTML = "";
      BINS.forEach((bin) => {
        const b = document.createElement("button");
        b.type = "button";
        b.dataset.bin = String(bin.corners);
        b.style.cssText = "box-sizing:border-box;min-width:0;display:grid;justify-items:center;gap:.2rem;" +
          "padding:.5rem .3rem;border:3px dashed var(--line);border-radius:var(--r-m);" +
          "background:var(--paper-2);cursor:pointer;font:inherit;color:inherit;min-height:7rem";
        b.setAttribute("aria-label", `Dėžė: ${bin.label}`);
        b.appendChild(shapeSvg({ type: bin.sample }, { size: 40, dots: true }));
        const strong = document.createElement("strong");
        strong.style.cssText = "font-size:.9rem;font-family:var(--font-head);font-weight:900;line-height:1.1";
        strong.textContent = bin.label;
        b.appendChild(strong);
        const holder = document.createElement("span");
        holder.className = "items";
        holder.style.cssText = "display:flex;flex-wrap:wrap;gap:2px;justify-content:center;min-height:20px";
        b.appendChild(holder);
        b.addEventListener("click", () => place(bin, b, holder));
        binsEl.appendChild(b);
      });
    }

    function select(item) {
      if (!alive || item.done) return;
      state.selected = item.key;
      paintTray();
      api.readout(state.showCorners
        ? `Figūra ${item.n}. Pažymėti kampai — suskaičiuok juos.`
        : `Figūra ${item.n}. Kiek ji turi kampų?`);
      api.note("Dabar spausk dėžę su tuo pačiu kampų skaičiumi.");
    }

    function place(bin, binEl, holder) {
      if (!alive) return;
      const item = state.items.find((x) => x.key === state.selected && !x.done);
      if (!item) {
        api.readout("Pirma pasirink figūrą viršuje.");
        api.note("Pasirink vieną figūrą, tada spausk dėžę.");
        return;
      }

      if (item.corners === bin.corners) {
        item.done = true;
        state.selected = null;
        holder.appendChild(shapeSvg(item, { size: 22, angle: item.angle, scale: item.scale }));
        paintTray();
        api.speak("Teisingai!");

        const left = state.items.filter((x) => !x.done).length;
        if (left === 0) {
          api.readout("Visos figūros savo dėžėse.");
          api.note("Pasuk bet kurią figūrą: kampų skaičius nesikeis. Kiek kampų turi durys?");
          api.speak("Visos figūros savo vietose. Puiku!");
          api.progress({ correct: true });
        } else {
          api.readout(`Teisingai: ${cornerWord(item.corners)}. Liko ${left}.`);
          api.note("Pasirink kitą figūrą. Jei abejoji — įjunk „Rodyk kampus“ ir suskaičiuok.");
        }
        return;
      }

      binEl.classList.add("wiggle");
      later(() => binEl.classList.remove("wiggle"), 520);
      api.readout(item.corners === 0
        ? "Dar ne: ši figūra neturi kampų."
        : `Dar ne: figūra turi ${item.corners} kampus, o dėžėje — ${bin.corners}.`);
      api.note(item.corners === 0
        ? "Apskritimas neturi kampų — ieškok dėžės, kurioje parašyta 0."
        : "Suskaičiuok figūros kampus ir palygink su skaičiumi ant dėžės.");
    }

    function rotateSelected() {
      if (!alive) return;
      const item = state.items.find((x) => x.key === state.selected && !x.done);
      if (!item) {
        api.readout("Pasirink figūrą, tada ją pasuk.");
        api.note("Pirma spausk vieną figūrą viršuje.");
        return;
      }
      item.angle = (item.angle + 30) % 360;
      paintTray();
      if (state.showCorners) {
        api.readout(`Figūra ${item.n}: ${cornerWord(item.corners)} — pasukus tiek pat.`);
        api.note("Kampai pažymėti taškais. Pasuk dar kartą: ar skaičius keičiasi?");
      } else {
        api.readout(`Figūra ${item.n} pasukta. Ar kampų skaičius pasikeitė?`);
        api.note("Įjunk „Rodyk kampus“ ir skaičiuok taškus prieš ir po pasukimo.");
      }
    }

    function toggleCorners() {
      if (!alive) return;
      state.showCorners = !state.showCorners;
      cornersBtn.setAttribute("aria-pressed", String(state.showCorners));
      paintTray();
      const item = state.items.find((x) => x.key === state.selected && !x.done);
      if (!item) {
        api.readout(state.showCorners ? "Kampai žymimi taškais." : "Kampai nebežymimi.");
        api.note("Pasirink figūrą ir skaičiuok pažymėtus taškus.");
        return;
      }
      api.readout(`Figūra ${item.n}: ${cornerWord(item.corners)}.`);
      api.speak(String(item.corners));
      api.note(item.corners === 0
        ? "Apskritimas neturi kampų — nė vieno taško."
        : "Pažymėti taškai ir yra kampai. Suskaičiuok juos.");
    }

    function init() {
      stopTimers();
      state = freshState();
      cornersBtn.setAttribute("aria-pressed", "false");
      buildTray();
      buildBins();
      paintTray();
      api.readout("Pasirink figūrą. Kiek ji turi kampų?");
      api.note("Spausk figūrą, tada dėžę su tuo pačiu kampų skaičiumi.");
    }

    turnBtn.addEventListener("click", rotateSelected);
    cornersBtn.addEventListener("click", toggleCorners);
    controls.querySelector("#fg-reset").addEventListener("click", init);

    init();

    return () => {
      alive = false;
      stopTimers();
    };
  },
};

/* ------------------------------------------------------------------ */
/* 4. Dėsningumai (algoritminis mąstymas)                              */
/* ------------------------------------------------------------------ */
const desningumai = {
  mount({ stage, controls, api, config }) {
    const tasks = config.tasks || [];
    let i = 0;

    stage.innerHTML = `<div id="ds-wrap" style="width:100%;max-width:40rem;text-align:center">
      <div id="ds-seq" style="display:flex;gap:.4rem;justify-content:center;flex-wrap:wrap;font-size:clamp(1.8rem,7vw,2.6rem);min-height:4rem;align-items:center"></div>
      <p class="sim-note" id="ds-msg"></p>
    </div>`;
    controls.innerHTML = `<div id="ds-opts" style="display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center"></div>`;
    const seqEl = stage.querySelector("#ds-seq");
    const msg = stage.querySelector("#ds-msg");
    const optsEl = controls.querySelector("#ds-opts");

    function draw() {
      const t = tasks[i % tasks.length];
      seqEl.innerHTML = t.seq.map((tok) => `<span style="display:inline-grid;place-items:center;min-width:2.4rem">${tok === "?" ? "❔" : tok}</span>`).join("");
      optsEl.innerHTML = t.options.map((o, k) => `<button class="btn secondary" data-k="${k}" style="font-size:1.8rem;min-width:4rem">${o}</button>`).join("");
      msg.textContent = t.prompt || "Kuris elementas eina toliau?";
      optsEl.querySelectorAll("[data-k]").forEach((b) => {
        b.addEventListener("click", () => {
          if (Number(b.dataset.k) === t.answer) {
            api.readout("Teisingai!");
            api.note("Seka kartojasi. Pasakyk, kokia tvarka ji eina.");
            api.progress({ correct: true });
            i += 1;
            setTimeout(() => { if (i < tasks.length) draw(); else {
              stage.innerHTML = `<div style="text-align:center;padding:1rem"><div style="font-size:4rem">🔁</div><p style="font-family:var(--font-head);font-weight:900;font-size:1.3rem">Sekos įveiktos!</p><p class="sim-note">Sugalvok savo seką iš dviejų spalvų ir pasakyk ją draugui.</p></div>`;
              optsEl.innerHTML = "";
            } }, 900);
          } else {
            msg.textContent = "Ne visai. Pakartok seka garsiai: pirmas, antras, pirmas, antras…";
            b.classList.add("wiggle");
            setTimeout(() => b.classList.remove("wiggle"), 450);
          }
        });
      });
    }

    draw();
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 5. Laikrodis su sujungtomis rodyklėmis                              */
/*                                                                    */
/* Modelis: ilgoji apeina vieną ratą, trumpoji pasislenka lygiai per   */
/* vieną skaičių. Vienas kintamasis — kiek ratų pasukta.               */
/* ------------------------------------------------------------------ */
const laikrodisSujungtosRodykles = {
  mount({ stage, controls, api, config }) {
    const startHour = Math.min(12, Math.max(1, Number(config.startHour) || 12));
    const words = Array.isArray(config.words) ? config.words : [];
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let turns = 0;          // kiek ratų pasukta nuo pradžios
    let locked = true;      // kol vaikas nespėjo, rodyklės nesisuka
    let guess = null;       // vaiko spėjimas: 0 — vienas skaičius, 1 — visas ratas, 2 — vietoje
    let compared = false;   // spėjimas lyginamas su rezultatu vieną kartą — po pirmo rato
    let lastMsg = "";       // sim-note keičiamas tik pasikeitus (ta pati taisyklė kaip LL-14)
    let raf = 0;
    let dragAngle = null;
    let reported = false;
    // Animacijos metu paint() būna iškviečiamas kiekvieną kadrą (~86 k./ratą).
    // aria-live sritis neturi kartoti to paties 86 kartus — pranešam tik kai
    // pasikeičia reikšmė. Ta pati taisyklė galioja ir fokusuoto paveikslo žymai.
    let lastReadout = "";
    let lastLabel = "";

    const hourOf = () => 1 + (((startHour - 1 + Math.floor(turns)) % 12) + 12) % 12;
    const fracOf = () => turns - Math.floor(turns);
    const wordOf = (h) => words[h - 1] || `${h} ${h === 1 ? "valanda" : "valandos"}`;

    stage.innerHTML = `
      <div style="width:100%;max-width:24rem;margin:0 auto;text-align:center">
        <svg id="lk-svg" viewBox="0 0 360 360" width="100%" role="img" tabindex="0"
             aria-label="Laikrodis su dviem sujungtomis rodyklėmis"
             style="display:block;touch-action:none;cursor:grab;outline-offset:4px"></svg>
        <p id="lk-digital" style="font-family:var(--font-head);font-weight:900;font-size:1.5rem;margin:.35rem 0 0">12 val.</p>
        <p class="sim-note" id="lk-msg"></p>
      </div>`;

    controls.innerHTML = `
      <div id="lk-guess" style="display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center;max-width:34rem">
        <button class="btn secondary" data-g="0">Pasislinks per vieną skaičių</button>
        <button class="btn secondary" data-g="1">Apeis visą ratą</button>
        <button class="btn secondary" data-g="2">Stovės vietoje</button>
      </div>
      <div id="lk-turn" style="display:none;gap:.6rem;flex-wrap:wrap;justify-content:center;align-items:center">
        <button class="btn" id="lk-one">Pasūk vieną ratą</button>
        <button class="btn ghost" id="lk-reset">Iš naujo</button>
      </div>`;

    const svg = stage.querySelector("#lk-svg");
    const digital = stage.querySelector("#lk-digital");
    const msg = stage.querySelector("#lk-msg");

    const GUESS_TEXT = ["Pasislinks per vieną skaičių", "Apeis visą ratą", "Stovės vietoje"];
    const guessText = () => (guess === null ? "" : GUESS_TEXT[guess] || "");

    // Paaiškinimas po simuliacija nėra aria-live, bet ir jo neverta perrašinėti
    // kiekviename animacijos kadre — keičiam tik pasikeitus tekstui.
    function setMsg(text) {
      if (text === lastMsg) return;
      lastMsg = text;
      msg.textContent = text;
    }

    /* --- ciferblatas ------------------------------------------------- */
    svg.appendChild(svgEl("circle", { cx: 180, cy: 180, r: 156, fill: "var(--paper-2)", stroke: "var(--line)", "stroke-width": 6 }));

    for (let h = 1; h <= 12; h += 1) {
      const a = (h * 30 * Math.PI) / 180;
      const x1 = 180 + Math.sin(a) * 142;
      const y1 = 180 - Math.cos(a) * 142;
      const x2 = 180 + Math.sin(a) * 152;
      const y2 = 180 - Math.cos(a) * 152;
      svg.appendChild(svgEl("line", { x1, y1, x2, y2, stroke: "var(--ink-faint)", "stroke-width": 3, "stroke-linecap": "round" }));

      const label = svgEl("text", {
        x: 180 + Math.sin(a) * 116,
        y: 180 - Math.cos(a) * 116 + 8,
        "text-anchor": "middle",
        fill: "var(--ink-soft)",
        "font-size": 22,
        "font-family": "system-ui",
        "font-weight": 700,
      });
      label.textContent = h;
      svg.appendChild(label);
    }

    // Tikslas: vieta, kur turi sustoti ilgoji, kai ratas baigtas.
    svg.appendChild(svgEl("circle", {
      cx: 180, cy: 180 - 116, r: 20, fill: "none",
      stroke: "var(--mint)", "stroke-width": 4, "stroke-dasharray": "5 6",
    }));

    const shortG = svgEl("g", {});
    shortG.appendChild(svgEl("line", {
      x1: 180, y1: 180, x2: 180, y2: 118,
      stroke: "var(--ink)", "stroke-width": 13, "stroke-linecap": "round",
    }));

    const longG = svgEl("g", {});
    longG.appendChild(svgEl("line", {
      x1: 180, y1: 180, x2: 180, y2: 86,
      stroke: "var(--accent)", "stroke-width": 5, "stroke-linecap": "round",
    }));
    longG.appendChild(svgEl("path", { d: "M180 72 L189 96 L171 96 Z", fill: "var(--accent)" }));

    svg.appendChild(shortG);
    svg.appendChild(longG);
    svg.appendChild(svgEl("circle", { cx: 180, cy: 180, r: 9, fill: "var(--ink)" }));

    /* --- būsena ------------------------------------------------------ */
    function sayReadout(text) {
      if (text === lastReadout) return;
      lastReadout = text;
      api.readout(text);
    }

    function paint() {
      const h = hourOf();
      const frac = fracOf();
      longG.setAttribute("transform", `rotate(${frac * 360} 180 180)`);
      shortG.setAttribute("transform", `rotate(${(h % 12) * 30 + frac * 30} 180 180)`);
      digital.textContent = `${h} val.`;
      const label = `Laikrodis: ${wordOf(h)}. Ilgoji rodyklė ${frac < 0.001 ? "ties 12" : "dar sukasi"}.`;
      if (label !== lastLabel) { lastLabel = label; svg.setAttribute("aria-label", label); }

      if (locked) return;
      if (frac > 0.001) {
        sayReadout("Ratas nebaigtas");
        setMsg(guess === null
          ? "Ilgoji dar neapėjo viso rato. Trumpoji dar tarp skaičių."
          : `Spėjai: „${guessText()}“. Ilgoji dar neapėjo viso rato.`);
      } else {
        sayReadout(wordOf(h));
        setMsg(turns === 0
          ? "Ilgoji ties 12. Suk ją per visą ratą."
          : "Ratas baigtas: ilgoji ties 12, trumpoji stovi ties skaičiumi.");
      }
    }

    // Spėjimas yra duomuo, ne durys: po pirmo užbaigto rato jis palyginamas
    // su tuo, kas įvyko (LL-15). Nekartojama kas ratą — tik pirmą kartą.
    // Palyginama tik tada, kai ratas tikrai apėjo (paspaudimas be judesio — ne).
    function guessResult(h) {
      if (compared || guess === null || Math.floor(turns) < 1) return "";
      compared = true;
      const what = guess === 0
        ? "Spėjai, kad trumpoji pasislinks per vieną skaičių. Taip ir įvyko."
        : `Spėjai, kad ${guessText().toLowerCase()}. Pažiūrėk į trumpąją: ji pasislinko per vieną skaičių.`;
      return `${what} Dabar ji ties ${h}.`;
    }

    function afterRound() {
      paint();
      const h = hourOf();
      const cmp = guessResult(h);
      setMsg(cmp || (turns === 0
        ? "Laikrodis vėl rodo 12. Suk ilgąją per visą ratą."
        : "Ratas baigtas: ilgoji ties 12, trumpoji stovi ties skaičiumi."));
      if (cmp) sayReadout(cmp);
      api.speak(wordOf(h), { rate: 0.9 });
      if (!reported && Math.floor(turns) >= 1) { reported = true; api.progress({ correct: true }); }
    }

    // Sukama po truputį; arti sveiko rato reikšmė prisegama, kad 12 smūgių
    // klaviatūra tikrai baigtų ratą (0,9999… nėra „beveik baigtas“).
    function applyTurns(d) {
      turns += d;
      const near = Math.round(turns);
      if (Math.abs(turns - near) < 0.004) turns = near;
    }

    /* --- sukimas ----------------------------------------------------- */
    function angleAt(evt) {
      const rect = svg.getBoundingClientRect();
      const dx = evt.clientX - (rect.left + rect.width / 2);
      const dy = evt.clientY - (rect.top + rect.height / 2);
      return (Math.atan2(dx, -dy) * 180) / Math.PI;
    }

    function onDown(evt) {
      if (locked) {
        setMsg("Pirma pasakyk, ką galvoji.");
        return;
      }
      dragAngle = angleAt(evt);
      svg.style.cursor = "grabbing";
      if (svg.setPointerCapture) { try { svg.setPointerCapture(evt.pointerId); } catch { /* neprivaloma */ } }
    }

    function onMove(evt) {
      if (dragAngle === null) return;
      const ang = angleAt(evt);
      let d = ang - dragAngle;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      dragAngle = ang;
      applyTurns(d / 360);
      paint();
    }

    function onUp() {
      if (dragAngle === null) return;
      dragAngle = null;
      svg.style.cursor = "grab";
      if (fracOf() <= 0.001) afterRound();
      else { paint(); api.note("Pasuk dar — kol ilgoji neapėjo viso rato, valanda dar nepasikeitė."); }
    }

    function onKey(evt) {
      if (evt.key !== "ArrowRight" && evt.key !== "ArrowLeft") return;
      evt.preventDefault();
      if (locked) { setMsg("Pirma pasakyk, ką galvoji."); return; }
      applyTurns((evt.key === "ArrowRight" ? 1 : -1) / 12);
      paint();
      if (fracOf() <= 0.001) afterRound();
    }

    function oneRound() {
      if (locked || raf) return;
      const target = Math.floor(turns + 1e-6) + 1;
      if (reduce) { turns = target; afterRound(); return; }
      const from = turns;
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / 1400);
        turns = from + (target - from) * k;
        paint();
        if (k < 1) raf = requestAnimationFrame(step);
        else { raf = 0; turns = target; afterRound(); }
      };
      raf = requestAnimationFrame(step);
    }

    svg.addEventListener("pointerdown", onDown);
    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerup", onUp);
    svg.addEventListener("pointercancel", onUp);
    svg.addEventListener("keydown", onKey);

    /* --- spėjimas prieš pirmą judesį -------------------------------- */
    // Spėjimas neužrakina ir neatskleidžia atsakymo: pasirinkęs vaikas sukasi
    // pats, o palyginimas ateina po pirmo rato (guessResult).
    controls.querySelectorAll("[data-g]").forEach((b) => {
      b.addEventListener("click", () => {
        guess = Number(b.dataset.g);
        controls.querySelector("#lk-guess").style.display = "none";
        controls.querySelector("#lk-turn").style.display = "flex";
        locked = false;
        paint();
        setMsg(`Spėjai: „${guessText()}“. Dabar suk ilgąją per visą ratą.`);
        svg.focus();
      });
    });

    controls.querySelector("#lk-one").addEventListener("click", oneRound);
    controls.querySelector("#lk-reset").addEventListener("click", () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      turns = 0;
      paint();
      setMsg("Pradedam iš naujo. Suk ilgąją rodyklę.");
    });

    paint();
    api.readout("Ką pasidarys trumpoji, kai ilgoji apeis visą ratą? Pasakyk, tada suk.");

    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  },
};

/* ------------------------------------------------------------------ */
/* 6. Lygybė su svarstyklėmis                                          */
/*                                                                    */
/* Modelis: „=“ žymi būseną „abi pusės lygios“, o ne veiksmą           */
/* „suskaičiuok ir parašyk atsakymą“. Sija nustoja svyruoti tik        */
/* vienoje vietoje, todėl nuostata „sudėk abu duotus skaičius“ tampa   */
/* matoma, o ne paaiškinama žodžiais (McNeil ir Alibali, 2005).         */
/* ------------------------------------------------------------------ */
const svarstyklesLygybe = {
  mount({ stage, controls, api, config }) {
    const known = Math.max(1, Math.min(10, Number(config.known ?? 5)));
    const whole = Math.max(1, Math.min(20, Number(config.whole ?? 8)));
    const maxBox = Math.max(1, Math.min(20, Number(config.maxBox ?? 10)));
    const say = config.sentences || {};
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const CX = 180;        // ašis
    const BEAM_Y = 76;     // sijos aukštis
    const HALF = 110;      // sijos rankos ilgis
    const PLATE_Y = 166;   // lėkštės viršutinė linija

    let box = 0;           // kiek kubelių įdėta (vienintelis kintamasis)
    let locked = true;     // kol vaikas nepasakė spėjimo, dėti negalima
    let flipped = false;   // ta pati būsena perskaityta kita kryptimi
    let reported = false;
    let lastSaid = "";

    const diff = () => known + box - whole;
    // SVGs `rotate(+a)` sukasi pagal laikrodį: kairysis galas KYLA, dešinysis LEIDŽIASI.
    // Todėl ženklas turi būti atvirkštinis skirtumui — kai dešinė sunkesnė (diff < 0),
    // dešinė turi leistis. Anksčiau ženklas buvo teigiamas, todėl svarstyklės
    // rodydavo atvirkščią pusę (rado publikavimo agentas, #35).
    const angle = () => Math.max(-12, Math.min(12, -1.6 * diff()));

    stage.innerHTML = `
      <div id="sv-wrap" tabindex="0" role="group" aria-label="Svarstyklės"
           style="width:100%;max-width:24rem;margin:0 auto;text-align:center;outline-offset:4px">
        <svg id="sv-svg" viewBox="0 0 360 320" width="100%" role="img"
             aria-label="Svarstyklės su dviem lėkštėmis"></svg>
        <p id="sv-card" style="font-family:var(--font-head);font-weight:900;font-size:1.8rem;margin:.45rem 0 0;letter-spacing:.02em">${known} + ▢ = ${whole}</p>
        <p class="sim-note" id="sv-msg"></p>
      </div>`;

    controls.innerHTML = `
      <div id="sv-guess" style="display:flex;justify-content:center">
        <button class="btn" id="sv-start">Pradedu dėti</button>
      </div>
      <div id="sv-tools" style="display:none;gap:.6rem;flex-wrap:wrap;justify-content:center;align-items:center">
        <button class="btn" id="sv-plus">Įdėk 1</button>
        <button class="btn secondary" id="sv-minus">Išimk 1</button>
        <button class="btn secondary" id="sv-flip">Perskaityk kitaip</button>
        <button class="btn ghost" id="sv-reset">Iš naujo</button>
      </div>`;

    const wrap = stage.querySelector("#sv-wrap");
    const svg = stage.querySelector("#sv-svg");
    const card = stage.querySelector("#sv-card");
    const msg = stage.querySelector("#sv-msg");
    const flipBtn = controls.querySelector("#sv-flip");

    /* --- pastatymas --------------------------------------------------- */
    const cube = (x, y) => svgEl("rect", {
      x, y, width: 14, height: 14, rx: 3, fill: "var(--sky)",
    });
    const thread = (parent, x1, x2) => {
      parent.appendChild(svgEl("line", {
        x1, y1: BEAM_Y, x2, y2: PLATE_Y, stroke: "var(--ink-faint)", "stroke-width": 2,
      }));
    };
    const plate = (parent, x) => {
      parent.appendChild(svgEl("rect", {
        x, y: PLATE_Y, width: 128, height: 8, rx: 4, fill: "var(--line)",
      }));
    };
    const rows = (parent, n, x0) => {
      for (let i = 0; i < n; i += 1) {
        parent.appendChild(cube(x0 + (i % 5) * 16, PLATE_Y - 14 - Math.floor(i / 5) * 16));
      }
    };

    // stovas
    svg.appendChild(svgEl("rect", { x: 132, y: 300, width: 96, height: 8, rx: 4, fill: "var(--line)" }));
    svg.appendChild(svgEl("line", { x1: CX, y1: BEAM_Y, x2: CX, y2: 300, stroke: "var(--line)", "stroke-width": 8 }));

    // 10 taškų juosta: kiek kubelių įdėta
    const strip = svgEl("g", {});
    strip.appendChild(svgEl("rect", {
      x: 146, y: 86, width: 24, height: 124, rx: 8,
      fill: "var(--paper-2)", stroke: "var(--line)", "stroke-width": 2,
    }));
    const dots = [];
    for (let i = 0; i < 10; i += 1) {
      const c = svgEl("circle", { cx: 158, cy: 96 + i * 11, r: 4, fill: "var(--paper)", stroke: "var(--ink-faint)", "stroke-width": 1.5 });
      dots.push(c);
      strip.appendChild(c);
    }
    svg.appendChild(strip);

    // kairė lėkštė: known kubeliai ir uždara dėžutė
    const panL = svgEl("g", {});
    thread(panL, 70, 10);
    thread(panL, 70, 130);
    plate(panL, 6);
    rows(panL, known, 10);

    const boxX = 10 + Math.min(known, 5) * 16;
    const boxG = svgEl("g", { tabindex: "0", role: "button", "aria-label": "Dėžutė" });
    // Nematomas 64 × 64 vienetų laukas: 360 px ekrane SVG susitraukia ~0,83×,
    // todėl 48 px lietimo taikiniui reikia didesnio nei pati dėžutė ploto.
    boxG.appendChild(svgEl("rect", {
      x: boxX - 10, y: PLATE_Y - 56, width: 64, height: 64, fill: "rgba(0,0,0,0)",
    }));
    boxG.appendChild(svgEl("rect", {
      x: boxX, y: PLATE_Y - 48, width: 44, height: 48, rx: 6,
      fill: "var(--paper-2)", stroke: "var(--ink-soft)", "stroke-width": 2.5, "stroke-dasharray": "5 4",
    }));
    const boxGlyph = svgEl("text", {
      x: boxX + 22, y: PLATE_Y - 15, "text-anchor": "middle",
      fill: "var(--ink-soft)", "font-size": 19, "font-weight": 700, "font-family": "system-ui",
    });
    boxGlyph.textContent = "▢";
    boxG.appendChild(boxGlyph);
    svg.appendChild(panL);
    panL.appendChild(boxG);

    // dešinė lėkštė: whole kubeliai
    const panR = svgEl("g", {});
    thread(panR, 290, 230);
    thread(panR, 290, 350);
    plate(panR, 226);
    rows(panR, whole, 230);
    svg.appendChild(panR);

    // sija ir ašis
    const beam = svgEl("g", {});
    beam.appendChild(svgEl("line", {
      x1: CX - HALF, y1: BEAM_Y, x2: CX + HALF, y2: BEAM_Y,
      stroke: "var(--ink)", "stroke-width": 8, "stroke-linecap": "round",
    }));
    svg.appendChild(beam);
    svg.appendChild(svgEl("path", { d: `M${CX} 58 L194 86 L166 86 Z`, fill: "var(--ink-soft)" }));
    svg.appendChild(svgEl("circle", { cx: CX, cy: BEAM_Y, r: 6, fill: "var(--ink)" }));

    if (!reduce) {
      // Pakrypimas pereinamas, bet atsiliepimas niekada nelaukia animacijos.
      [panL, panR, beam].forEach((g) => g.setAttribute("style", "transition:transform .22s ease-out"));
    }

    /* --- būsena ------------------------------------------------------- */
    function sayOnce(key) {
      const t = say[key];
      if (!t || lastSaid === key) return;
      lastSaid = key;
      api.speak(t);
    }

    function feedback() {
      const d = diff();
      if (locked) {
        api.readout("Kiek kubelių reikia įdėti? Pasakyk, tada dėk.");
        return;
      }
      if (d > 0) {
        api.readout("Kairė sunkesnė");
        msg.textContent = box === 0 ? "Dėžutė tuščia. Įdėk kubelį." : "Per daug. Išimk po vieną.";
        sayOnce("kaire");
      } else if (d < 0) {
        api.readout("Dešinė sunkesnė");
        msg.textContent = box === 0 ? "Dėžutė tuščia. Įdėk kubelį." : "Dar trūksta.";
        sayOnce("desine");
      } else {
        api.readout(flipped ? "Ta pati lygybė" : "Abi pusės lygios");
        msg.textContent = `${known} ir ${box} yra ${whole}. Abi pusės lygios.`;
        sayOnce(flipped ? "ta-pati" : "lygios");
        if (!reported) { reported = true; api.progress({ correct: true }); }
      }
    }

    function paint() {
      const a = angle();
      const rad = (a * Math.PI) / 180;
      const place = (g, d) => {
        const dx = d * Math.cos(rad) - d;
        const dy = d * Math.sin(rad);
        g.setAttribute("transform", `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
      };
      beam.setAttribute("transform", `rotate(${a} ${CX} ${BEAM_Y})`);
      place(panL, -HALF);
      place(panR, HALF);

      dots.forEach((c, i) => {
        const on = i < box;
        c.setAttribute("fill", on ? "var(--accent)" : "var(--paper)");
        c.setAttribute("stroke", on ? "var(--accent)" : "var(--ink-faint)");
      });

      const d = diff();
      card.textContent = d === 0
        ? (flipped ? `${whole} = ${known} + ${box}` : `${known} + ${box} = ${whole}`)
        : `${known} + ▢ = ${whole}`;

      const relation = d > 0 ? "Kairė sunkesnė" : d < 0 ? "Dešinė sunkesnė" : "Abi pusės lygios";
      svg.setAttribute("aria-label", `Kairėje ${known} ir ${box}, dešinėje ${whole}. ${relation}.`);
      boxG.setAttribute("aria-label", `Dėžutė. Kubelių viduje: ${box}.`);

      flipBtn.disabled = d !== 0 || locked;
    }

    function setBox(n) {
      if (locked) {
        msg.textContent = "Pirma pasakyk, kiek kubelių reikia įdėti.";
        return;
      }
      box = Math.max(0, Math.min(maxBox, n));
      if (box === 0) { flipped = false; lastSaid = ""; }
      if (known + box - whole !== 0) flipped = false;
      paint();
      feedback();
    }

    function reset() {
      box = 0;
      flipped = false;
      lastSaid = "";
      paint();
      feedback();
      msg.textContent = "Pradedam iš naujo. Dėžutė tuščia.";
    }

    /* --- įėjimai ------------------------------------------------------ */
    boxG.addEventListener("click", () => setBox(box + 1));
    boxG.addEventListener("keydown", (evt) => {
      if (evt.key !== "Enter" && evt.key !== " ") return;
      evt.preventDefault();
      setBox(box + 1);
    });

    wrap.addEventListener("keydown", (evt) => {
      if (evt.key === "ArrowRight" || evt.key === "ArrowUp") { evt.preventDefault(); setBox(box + 1); }
      else if (evt.key === "ArrowLeft" || evt.key === "ArrowDown") { evt.preventDefault(); setBox(box - 1); }
    });

    controls.querySelector("#sv-plus").addEventListener("click", () => setBox(box + 1));
    controls.querySelector("#sv-minus").addEventListener("click", () => setBox(box - 1));
    controls.querySelector("#sv-reset").addEventListener("click", reset);
    flipBtn.addEventListener("click", () => {
      if (diff() !== 0) return;
      flipped = !flipped;
      paint();
      feedback();
    });

    // Tas pats atrakinimas ir balsui, ir įrašytam spėjimui (pamoka LL-11).
    function startAdding(guess) {
      locked = false;
      guessAsk.remove();
      controls.querySelector("#sv-guess").style.display = "none";
      controls.querySelector("#sv-tools").style.display = "flex";
      if (Number.isFinite(guess) && guess >= 0) {
        api.note(`Tavo spėjimas: ${guess}. Dabar dėk kubelius ir pažiūrėk, ar svarstyklės lygios.`);
      }
      paint();
      feedback();
      wrap.focus();
    }

    controls.querySelector("#sv-start").addEventListener("click", () => startAdding(NaN));

    const guessAsk = api.ask({
      label: "Kiek kubelių?",
      type: "number",
      submitLabel: "Atsakyti",
      onValue: (value) => {
        const n = Number(String(value).replace(/[^0-9]/g, ""));
        if (!Number.isFinite(n)) {
          api.note("Įrašyk skaičių, pavyzdžiui 3.");
          return;
        }
        startAdding(n);
      },
    });

    paint();
    api.readout("Kiek kubelių reikia įdėti? Pasakyk, tada dėk.");

    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 7. Piniginė ir kaina                                                */
/*                                                                    */
/* Modelis: pinigo vertę pasako ant jo užrašytas skaičius, o ne jo      */
/* dydis ar pinigų krūva. Kainos juosta ilgėja pagal skaičių, todėl     */
/* „daugiau pinigų — daugiau vertės“ tampa matoma klaida, o ne         */
/* paaiškinimas žodžiais (Berti ir Bombi, 1981; Hasegawa, 2020).        */
/*                                                                    */
/* Konfigūracija (visi laukai neprivalomi):                            */
/*   unit  — "€" arba "c";                                             */
/*   items — [{ label, price }] prekės, kurių kainą vaikas renkasi;     */
/*   coins — monetų vertės, notes — banknotų vertės;                    */
/*   max   — juostos viršutinė riba (numatyta 10 € arba 100 c).         */
/* ------------------------------------------------------------------ */
const pinigineIrKaina = {
  mount({ stage, controls, api, config }) {
    const unit = config.unit === "c" ? "c" : "€";
    const say = config.sentences || {};

    const coins = (Array.isArray(config.coins) && config.coins.length
      ? config.coins : [50, 20, 10, 5]).map(Number).filter((v) => v > 0);
    const notes = (Array.isArray(config.notes) ? config.notes : []).map(Number).filter((v) => v > 0);
    const items = (Array.isArray(config.items) && config.items.length
      ? config.items
      : [{ label: "", price: config.price ?? 60 }]
    ).map((it) => ({ label: String(it.label || ""), price: Math.max(1, Math.round(Number(it.price) || 1)) }));

    const maxVal = Math.max(
      Number(config.max) || (unit === "c" ? 100 : 10),
      ...items.map((i) => i.price), ...coins, ...notes,
    );

    const TRACK_X = 20;
    const TRACK_W = 320;
    const TRACK_Y = 56;
    const TRACK_H = 26;
    const perUnit = TRACK_W / maxVal;

    const fmt = (v) => `${v} ${unit}`;
    const isNote = (v) => notes.includes(v);
    const denoms = [...notes, ...coins].sort((a, b) => b - a);

    // Lietuvių kalba: 1 pinigas, 2 pinigai, 11 pinigų, 21 pinigas…
    const pieceWord = (n) => {
      const d = n % 10;
      const h = n % 100;
      if (d === 1 && h !== 11) return "pinigas";
      if (d >= 2 && d <= 9 && !(h >= 11 && h <= 19)) return "pinigai";
      return "pinigų";
    };

    // Monetos dydis piniginėje. Centų atveju — tikras santykis: 5 c
    // (21,25 mm) didesnė už 10 c (19,75 mm), nors verta perpus mažiau.
    const COIN_PX = { 50: 45, 20: 41, 10: 36.5, 5: 39, 2: 34, 1: 32 };
    const walletCoin = (v) => COIN_PX[v] || 38;
    const walletNote = (v) => (v >= 10 ? [84, 44] : [78, 41]);

    const pieceName = (v) => unit === "c"
      ? `${v} centų moneta`
      : `${v} ${v === 1 ? "euro" : "eurų"} ${isNote(v) ? "banknotas" : "moneta"}`;
    const pieceRemove = (v) => unit === "c"
      ? `Nuimti ${v} centų monetą`
      : `Nuimti ${v} ${v === 1 ? "euro" : "eurų"} ${isNote(v) ? "banknotą" : "monetą"}`;

    function coinSvg(v, size) {
      const r = size / 2;
      const euro = unit !== "c";
      // 1 € — auksinis žiedas ir sidabrinis vidurys, 2 € — atvirkščiai.
      const ring = euro ? (v === 1 ? "#d9ac4f" : "#cfd3d8") : (v === 5 ? "#e2a06a" : "#ffc94d");
      const core = euro ? (v === 1 ? "#ece7dc" : "#d9ac4f") : ring;
      const inner = euro
        ? `<circle cx="${r}" cy="${r}" r="${((r - 1) * 0.7).toFixed(1)}" fill="${core}" stroke="var(--ink-soft)" stroke-width=".8"/>`
        : "";
      return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true" focusable="false">
        <circle cx="${r}" cy="${r}" r="${r - 1}" fill="${ring}" stroke="var(--ink-soft)" stroke-width="1.2"/>
        ${inner}
        <text x="${r}" y="${r + size * 0.12}" text-anchor="middle" fill="var(--ink)"
              font-size="${(size * 0.34).toFixed(1)}" font-weight="900" font-family="system-ui">${v}</text>
      </svg>`;
    }

    function noteSvg(v, w, h) {
      return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true" focusable="false">
        <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="4" fill="#f2e6c6" stroke="var(--ink-soft)" stroke-width="1.2"/>
        <rect x="4" y="4" width="${w - 8}" height="${h - 8}" rx="2" fill="none" stroke="#c9a557" stroke-width="1" opacity=".75"/>
        <text x="${w / 2}" y="${h / 2 + h * 0.14}" text-anchor="middle" fill="var(--ink)"
              font-size="${(h * 0.4).toFixed(1)}" font-weight="900" font-family="system-ui">${v} ${unit}</text>
      </svg>`;
    }

    stage.innerHTML = `
      <div id="pg-wrap" tabindex="0" role="group" aria-label="Piniginė ir kaina"
           style="width:100%;max-width:24rem;margin:0 auto;text-align:center;outline-offset:4px">
        <svg id="pg-svg" viewBox="0 0 360 112" width="100%" role="img"
             aria-label="Kainos juosta"></svg>
        <p id="pg-card" style="font-family:var(--font-head);font-weight:900;font-size:1.5rem;margin:.3rem 0 0;min-height:2rem"></p>
        <div id="pg-plate" role="group" aria-label="Lėkštė su pinigais"
             style="display:flex;flex-wrap:wrap;justify-content:center;gap:.15rem;min-height:3.4rem;padding:.3rem;border:2px dashed var(--line);border-radius:var(--r-s);background:var(--paper-2)"></div>
        <p id="pg-count" style="margin:.5rem 0 0;font-weight:800">Monetų ir banknotų: 0</p>
        <p id="pg-sum" style="margin:.1rem 0 0;font-weight:800">Suma: 0 ${unit}</p>
        <p class="sim-note" id="pg-msg" style="margin:.4rem 0 0"></p>
      </div>`;

    controls.innerHTML = `
      <div id="pg-items" role="group" aria-label="Pasirink prekę"
           style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center">
        ${items.map((it, i) => `
          <button class="btn ${i === 0 ? "" : "secondary"} pg-item" data-i="${i}" aria-pressed="${i === 0}"
                  aria-label="${it.label ? `${it.label}, ${fmt(it.price)}` : `Kaina ${fmt(it.price)}`}">
            ${it.label ? `${it.label} · ${fmt(it.price)}` : `Prekė · ${fmt(it.price)}`}
          </button>`).join("")}
      </div>
      <div id="pg-guess" style="display:flex;flex-direction:column;gap:.35rem;align-items:center">
        <button class="btn" id="pg-say">Sakau spėjimą</button>
        <p class="sim-note" id="pg-lock" style="margin:0">1) Pasakyk spėjimą. 2) Spausk mygtuką. Tada dėsi pinigus.</p>
      </div>
      <div id="pg-purse" aria-disabled="true" style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;align-items:center;opacity:.8">
        ${denoms.map((v) => `
          <button class="btn secondary pg-piece" data-v="${v}" aria-label="${pieceName(v)}" disabled
                  style="width:${isNote(v) ? walletNote(v)[0] + 8 : 60}px;min-width:${isNote(v) ? walletNote(v)[0] + 8 : 60}px;height:60px;padding:0;display:flex;align-items:center;justify-content:center">
            ${isNote(v) ? noteSvg(v, walletNote(v)[0], walletNote(v)[1]) : coinSvg(v, walletCoin(v))}
          </button>`).join("")}
      </div>
      <div id="pg-tools" style="display:none;gap:.6rem;flex-wrap:wrap;justify-content:center;align-items:center">
        <button class="btn ghost" id="pg-undo">Nuimk paskutinį</button>
        <button class="btn ghost" id="pg-reset">Iš naujo</button>
      </div>`;

    const wrap = stage.querySelector("#pg-wrap");
    const svg = stage.querySelector("#pg-svg");
    const plateEl = stage.querySelector("#pg-plate");
    const cardEl = stage.querySelector("#pg-card");
    const countEl = stage.querySelector("#pg-count");
    const sumEl = stage.querySelector("#pg-sum");
    const msgEl = stage.querySelector("#pg-msg");
    const purseEl = controls.querySelector("#pg-purse");
    const toolsEl = controls.querySelector("#pg-tools");
    const guessPanel = controls.querySelector("#pg-guess");

    /* --- scena -------------------------------------------------------- */
    const defs = svgEl("defs", {});
    const hatch = svgEl("pattern", {
      id: "pg-hatch", width: 8, height: 8, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)",
    });
    hatch.appendChild(svgEl("rect", { width: 8, height: 8, fill: "var(--paper-2)" }));
    hatch.appendChild(svgEl("line", { x1: 0, y1: 0, x2: 0, y2: 8, stroke: "var(--warn)", "stroke-width": 4 }));
    defs.appendChild(hatch);
    svg.appendChild(defs);

    svg.appendChild(svgEl("rect", {
      x: TRACK_X, y: TRACK_Y, width: TRACK_W, height: TRACK_H, rx: 13,
      fill: "var(--paper-2)", stroke: "var(--line)", "stroke-width": 2,
    }));

    const fillBar = svgEl("rect", {
      x: TRACK_X, y: TRACK_Y, width: 0, height: TRACK_H, rx: 13, fill: "var(--accent)", opacity: 0,
    });
    svg.appendChild(fillBar);

    const overflow = svgEl("rect", {
      x: 0, y: TRACK_Y, width: 0, height: TRACK_H, rx: 0, fill: "url(#pg-hatch)", display: "none",
    });
    svg.appendChild(overflow);

    const seps = svgEl("g", {});
    svg.appendChild(seps);

    const priceLine = svgEl("line", {
      x1: 0, y1: 48, x2: 0, y2: 90, stroke: "var(--ink)", "stroke-width": 3, "stroke-linecap": "round",
    });
    svg.appendChild(priceLine);
    const priceLabel = svgEl("text", {
      x: 0, y: 42, "text-anchor": "middle", fill: "var(--ink)",
      "font-size": 17, "font-weight": 800, "font-family": "system-ui",
    });
    svg.appendChild(priceLabel);

    const zeroLabel = svgEl("text", {
      x: TRACK_X, y: 108, "text-anchor": "start", fill: "var(--ink-faint)",
      "font-size": 12, "font-weight": 700, "font-family": "system-ui",
    });
    zeroLabel.textContent = "0";
    svg.appendChild(zeroLabel);
    const fullLabel = svgEl("text", {
      x: TRACK_X + TRACK_W, y: 108, "text-anchor": "end", fill: "var(--ink-faint)",
      "font-size": 12, "font-weight": 700, "font-family": "system-ui",
    });
    fullLabel.textContent = fmt(maxVal);
    svg.appendChild(fullLabel);

    /* --- būsena ------------------------------------------------------- */
    let itemIdx = 0;
    let plate = [];           // lėkštėje esančios vertės — vienintelis kintamasis
    let locked = true;        // kol vaikas nepasakė spėjimo, dėti negalima
    let guessCount = null;    // įrašytas spėjimas; null — vaikas tik paspaudė mygtuką
    let progressed = false;
    let toldNote = false;
    let lastSaid = "";
    const paidByItem = new Map();   // prekė → tiksliai sumokėtų rinkinių raktai
    const announced = new Set();    // rinkiniai, apie kuriuos jau pasakyta

    const sum = () => plate.reduce((a, b) => a + b, 0);
    const setKey = () => plate.slice().sort((a, b) => b - a).join("+");
    const price = () => items[itemIdx].price;
    const priceText = () => (items[itemIdx].label ? `${items[itemIdx].label} ${fmt(price())}` : `Kaina ${fmt(price())}`);
    const priceSentence = () => (items[itemIdx].label ? `${items[itemIdx].label} kainuoja ${fmt(price())}.` : `Kaina ${fmt(price())}.`);

    function syncPrice() {
      const x = TRACK_X + price() * perUnit;
      const anchor = x > 300 ? "end" : x < 60 ? "start" : "middle";
      priceLine.setAttribute("x1", x);
      priceLine.setAttribute("x2", x);
      priceLabel.setAttribute("x", x);
      priceLabel.setAttribute("text-anchor", anchor);
      priceLabel.textContent = priceText();
    }

    function sayOnce(key) {
      const t = say[key];
      if (!t || lastSaid === key) return;
      lastSaid = key;
      api.speak(t);
    }

    function renderPlate(focusIdx) {
      if (!plate.length) {
        plateEl.innerHTML = '<span class="sim-note" style="align-self:center;margin:0">Čia dėsi pinigus</span>';
        return;
      }
      plateEl.innerHTML = plate.map((v, i) => `
        <button class="pg-take" data-i="${i}" aria-label="${pieceRemove(v)}"
                style="width:52px;height:48px;min-width:52px;padding:0;border:0;border-radius:var(--r-s);background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer">
          ${isNote(v) ? noteSvg(v, 50, 26) : coinSvg(v, 30)}
        </button>`).join("");
      plateEl.querySelectorAll("button").forEach((b) => {
        b.addEventListener("click", () => removeAt(Number(b.dataset.i)));
      });
      if (typeof focusIdx === "number") {
        const bs = plateEl.querySelectorAll("button");
        if (bs.length) bs[Math.max(0, Math.min(focusIdx, bs.length - 1))].focus();
      }
    }

    function paint(focusIdx) {
      renderPlate(focusIdx);

      const s = sum();
      const shown = Math.min(s, maxVal);
      const width = shown * perUnit;
      fillBar.setAttribute("width", width);
      fillBar.setAttribute("opacity", s === 0 ? "0" : "1");

      if (s > price()) {
        overflow.setAttribute("x", TRACK_X + price() * perUnit);
        overflow.setAttribute("width", Math.max(0, width - price() * perUnit));
        overflow.setAttribute("display", "");
      } else {
        overflow.setAttribute("display", "none");
      }

      // monetų ribos: matosi, kiek juostos pridėjo kiekvienas pinigas
      seps.innerHTML = "";
      let acc = 0;
      plate.forEach((v, i) => {
        acc += v;
        if (i === plate.length - 1 || acc > maxVal) return;
        const x = TRACK_X + acc * perUnit;
        seps.appendChild(svgEl("line", {
          x1: x, y1: TRACK_Y + 2, x2: x, y2: TRACK_Y + TRACK_H - 2,
          stroke: "var(--paper-2)", "stroke-width": 2, opacity: 0.75,
        }));
      });

      countEl.textContent = `Monetų ir banknotų: ${plate.length}`;
      sumEl.textContent = `Suma: ${fmt(s)}`;
      cardEl.textContent = s === price() && s > 0
        ? `${plate.map(fmt).join(" + ")} = ${fmt(price())}`
        : "";

      const relation = s === 0 ? "Lėkštė tuščia."
        : s < price() ? "Dar ne visa kaina."
          : s > price() ? "Suma didesnė už kainą."
            : "Suma lygi kainai.";
      svg.setAttribute("aria-label",
        `${priceText()}. Lėkštėje ${plate.length} ${pieceWord(plate.length)}, suma ${fmt(s)}. ${relation}`);
    }

    function feedback() {
      const s = sum();
      if (locked) {
        api.readout(`${priceSentence()} Kiek monetų ir banknotų prireiks? Pasakyk spėjimą.`);
        return;
      }

      if (s === 0) {
        api.readout(`Kaina ${fmt(price())}. Įdėk pinigų.`);
        msgEl.textContent = "Dar nieko nesumokėta.";
        lastSaid = "";
        return;
      }
      if (s < price()) {
        api.readout("Dar ne visa kaina.");
        msgEl.textContent = "Juosta dar nesiekia kainos žymos.";
        sayOnce("mazai");
        return;
      }
      if (s > price()) {
        api.readout("Per daug. Suma didesnė už kainą.");
        msgEl.textContent = "Juosta peržengė kainos žymą. Nuimk vieną pinigą.";
        sayOnce("perdaug");
        return;
      }

      const key = `${itemIdx}|${setKey()}`;
      const seen = paidByItem.get(itemIdx) || new Set();
      const firstForItem = seen.size === 0;
      if (!seen.has(setKey())) {
        seen.add(setKey());
        paidByItem.set(itemIdx, seen);
      }

      if (!announced.has(key)) {
        announced.add(key);
        if (firstForItem) {
          const n = plate.length;
          let extra;
          if (guessCount === null) {
            extra = " Kiek pinigų lėkštėje?";
          } else if (n === guessCount) {
            extra = ` Spėjai ${guessCount}. Tiek pat, kiek lėkštėje.`;
          } else if (n < guessCount) {
            extra = ` Spėjai ${guessCount}, o lėkštėje ${n}. Didesni pinigai atstojo kelis mažesnius.`;
          } else {
            extra = ` Spėjai ${guessCount}, o lėkštėje ${n}. Ar gali sumokėti mažiau pinigų?`;
          }
          api.readout(`Apmokėta. ${fmt(price())}.${extra}`);
          msgEl.textContent = "Suma ir kaina sutampa.";
          sayOnce("apmoketa");
          if (!progressed) {
            progressed = true;
            api.progress({ correct: true });
          }
          // Vienkartinė pastaba: viena kupiūra atstojo kelias monetas.
          if (!toldNote && plate.some(isNote)) {
            toldNote = true;
            msgEl.textContent = `${msgEl.textContent} Viena kupiūra atstojo kelias monetas.`;
            if (say.kupiura) api.speak(say.kupiura);
          }
        } else {
          api.readout(`Ta pati suma, kiti pinigai. ${fmt(price())}.`);
          msgEl.textContent = "Pinigų skaičius kitas, suma ta pati.";
          sayOnce("kitaip");
        }
      } else {
        api.readout(`Apmokėta. ${fmt(price())}.`);
        msgEl.textContent = "Juosta lygiai ties kainos žyma. Suma ir kaina sutampa.";
        lastSaid = "";
      }
    }

    function addPiece(v) {
      if (locked) return;
      plate.push(v);
      paint();
      feedback();
    }

    function removeAt(i) {
      if (locked) return;
      plate.splice(i, 1);
      lastSaid = "";
      paint(i);
      feedback();
    }

    function undo() {
      if (locked || !plate.length) return;
      plate.pop();
      lastSaid = "";
      paint();
      feedback();
    }

    function reset() {
      if (locked) return;
      plate = [];
      lastSaid = "";
      paint();
      feedback();
      msgEl.textContent = "Pradedam iš naujo. Lėkštė tuščia.";
    }

    /* --- prekės ------------------------------------------------------- */
    function chooseItem(i) {
      if (i === itemIdx) return;
      itemIdx = i;
      plate = [];
      locked = true;
      guessCount = null;
      lastSaid = "";
      controls.querySelectorAll(".pg-item").forEach((b, k) => {
        b.classList.toggle("secondary", k !== i);
        b.setAttribute("aria-pressed", String(k === i));
      });
      guessPanel.style.display = "flex";
      if (askRow) { askRow.style.display = ""; if (askBox.input) askBox.input.value = ""; }
      purseEl.style.opacity = ".8";
      purseEl.setAttribute("aria-disabled", "true");
      purseEl.querySelectorAll(".pg-piece").forEach((b) => { b.disabled = true; });
      toolsEl.style.display = "none";
      syncPrice();
      paint();
      feedback();
    }

    /* --- įėjimai ------------------------------------------------------ */
    purseEl.querySelectorAll("button").forEach((b) => {
      b.addEventListener("click", () => addPiece(Number(b.dataset.v)));
    });

    controls.querySelectorAll(".pg-item").forEach((b) => {
      b.addEventListener("click", () => chooseItem(Number(b.dataset.i)));
    });

    controls.querySelector("#pg-undo").addEventListener("click", undo);
    controls.querySelector("#pg-reset").addEventListener("click", reset);

    function hideGuess() {
      guessPanel.style.display = "none";
      if (askRow) askRow.style.display = "none";
    }

    function unlock(guess) {
      locked = false;
      hideGuess();
      purseEl.style.opacity = "1";
      purseEl.setAttribute("aria-disabled", "false");
      purseEl.querySelectorAll(".pg-piece").forEach((b) => { b.disabled = false; });
      toolsEl.style.display = "flex";
      guessCount = Number.isFinite(guess) && guess > 0 ? Math.round(guess) : null;
      api.note(guessCount !== null
        ? `Tavo spėjimas: ${guessCount} ${pieceWord(guessCount)}. Dabar dėk ir patikrink.`
        : "Dabar dėk pinigus ir žiūrėk į juostą.");
      paint();
      feedback();
      wrap.focus();
    }

    controls.querySelector("#pg-say").addEventListener("click", () => unlock(NaN));

    // Alternatyva balsui: vaikas gali įrašyti spėjimą, jei kalba negarsiai,
    // klasėje tylu arba mikrofonas nepasiekiamas. Žr. pamoką LL-11.
    const askBox = api.ask({
      label: "Kiek monetų ir banknotų?",
      type: "number",
      submitLabel: "Atsakyti",
      onValue: (value) => {
        const n = Number(String(value).replace(/[^0-9]/g, ""));
        if (!Number.isFinite(n) || n <= 0) {
          msgEl.textContent = "Įrašyk skaičių, pavyzdžiui 2.";
          return;
        }
        unlock(n);
      },
    });
    const askRow = askBox.input ? askBox.input.closest(".sim-ask") : null;
    if (askRow) guessPanel.after(askRow);

    // Klaviatūra turi veikti ir tada, kai fokusas yra piniginėje (valdikliuose),
    // ir tada, kai jis lėkštėje (scenoje) — todėl klausomės abiejų.

    function onKey(evt) {
      if (evt.key === "Backspace") {
        evt.preventDefault();
        undo();
        return;
      }
      if (evt.key !== "ArrowLeft" && evt.key !== "ArrowRight") return;
      const list = [...plateEl.querySelectorAll("button"), ...purseEl.querySelectorAll("button")];
      const at = list.indexOf(document.activeElement);
      if (at === -1) return;
      evt.preventDefault();
      const next = (at + (evt.key === "ArrowRight" ? 1 : -1) + list.length) % list.length;
      list[next].focus();
    }

    stage.addEventListener("keydown", onKey);
    controls.addEventListener("keydown", onKey);

    syncPrice();
    paint();
    api.readout(`${priceSentence()} Kiek monetų ir banknotų prireiks? Pasakyk spėjimą.`);
    if (say.pradzia) api.speak(say.pradzia);

    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 8. Vabaliukas ir kryptys                                            */
/* ------------------------------------------------------------------ */
// Modelio taikinys — nuostata „kairė visiems ta pati pusė“.
// Kairė žymima kortele, pritvirtinta prie kūno: ji sukasi kartu su vabaliuku
// ir atsiduria priešingoje ekrano pusėje, kai jis atsisuka į vaiką.
const vabaliukasIrKryptys = {
  mount({ stage, controls, api, config }) {
    const size = Math.max(2, Math.min(4, Number(config.size ?? 3)));
    const start = config.start || { col: 1, row: 1, facing: "up" };
    const leaf = config.leaf || { col: 0, row: 0 };
    const say = config.sentences || {};

    const CELL = 88;
    const GAP = 8;
    const BOARD = size * CELL + (size - 1) * GAP;
    const OFF = (320 - BOARD) / 2;
    const cellX = (col) => OFF + col * (CELL + GAP);
    const cellY = (row) => OFF + row * (CELL + GAP);
    const centerX = (col) => cellX(col) + CELL / 2;
    const centerY = (row) => cellY(row) + CELL / 2;

    // lx/ly — kūno kairės kryptis ekrane, kai veikėjas žiūri ta kryptimi.
    const DIRS = {
      up: { dx: 0, dy: -1, angle: 0, lx: -1, ly: 0 },
      right: { dx: 1, dy: 0, angle: 90, lx: 0, ly: -1 },
      down: { dx: 0, dy: 1, angle: 180, lx: 1, ly: 0 },
      left: { dx: -1, dy: 0, angle: 270, lx: 0, ly: 1 },
    };
    const ORDER = ["up", "right", "down", "left"];
    const FACING_TEXT = { up: "į viršų, nuo tavęs", right: "į dešinę", down: "į tave", left: "į kairę" };
    const STEP_TEXT = { up: "aukštyn", right: "į dešinę", down: "žemyn, link tavęs", left: "į kairę" };

    const DEFAULT_SAY = {
      "nuo-taves": "Vabaliukas žiūri nuo tavęs. Jo kairė — kairėje.",
      "i-desine": "Vabaliukas žiūri į dešinę. Jo kairė — viršuje.",
      "i-tave": "Vabaliukas žiūri į tave. Jo kairė — tavo dešinėje.",
      "i-kaire": "Vabaliukas žiūri į kairę. Jo kairė — apačioje.",
      zingsnis: "Žengė vieną langelį į priekį.",
      krastas: "Toliau tinklelio nėra.",
      lapas: "Pasiekei lapą.",
    };
    const line = (key) => say[key] || DEFAULT_SAY[key];

    let pos = { col: Number(start.col), row: Number(start.row) };
    let facing = DIRS[start.facing] ? start.facing : "up";
    let guess = null;       // vaiko spėjimas: "left" | "right"
    let compared = false;   // spėjimas lyginamas vieną kartą, kai vabaliukas atsisuka į vaiką
    let reported = false;
    let lastSaid = "";

    const reduceMotion = !!(window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    stage.innerHTML = `
      <div id="vk-wrap" tabindex="0" role="group" aria-label="Vabaliukas ir kryptys"
           style="width:100%;max-width:22rem;margin:0 auto;text-align:center;outline-offset:4px">
        <svg id="vk-svg" viewBox="0 0 320 320" width="100%" role="img"
             aria-label="Tinklelis su lapu"></svg>
      </div>`;

    // Valdikliai buvo pamesti: kodas ieško #vk-left/#vk-right/#vk-step/#vk-reset,
    // o jų niekas nesukurdavo — todėl simuliacija krisdavo su „Cannot read
    // properties of null (reading 'addEventListener')" ir vaikas matydavo klaidą.
    controls.innerHTML = `
      <div id="vk-guess" style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;align-items:center;margin-bottom:.5rem">
        <p class="sim-note" id="vk-guess-prompt" style="width:100%;text-align:center;margin:0">Kur bus jo kairė, kai jis atsisuks į tave?</p>
        <button class="btn secondary" id="vk-guess-left" aria-pressed="false"
                aria-label="Spėju: jo kairė bus kairėje">Kairėje</button>
        <button class="btn secondary" id="vk-guess-right" aria-pressed="false"
                aria-label="Spėju: jo kairė bus dešinėje">Dešinėje</button>
      </div>
      <div id="vk-pad" style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;align-items:center">
        <button class="btn secondary" id="vk-left" aria-label="Pasukti į kairę">↺ Kairėn</button>
        <button class="btn" id="vk-step" aria-label="Žengti vieną langelį į priekį">Žengti ⤴</button>
        <button class="btn secondary" id="vk-right" aria-label="Pasukti į dešinę">Dešinėn ↻</button>
      </div>
      <div style="display:flex;justify-content:center;margin-top:.5rem">
        <button class="btn ghost" id="vk-reset">Iš naujo</button>
      </div>`;

    const wrap = stage.querySelector("#vk-wrap");
    const svg = stage.querySelector("#vk-svg");

    /* --- tinklelis ir lapas ------------------------------------------- */
    const cellsG = svgEl("g", { id: "vk-cells" });
    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < size; c += 1) {
        cellsG.appendChild(svgEl("rect", {
          x: cellX(c), y: cellY(r), width: CELL, height: CELL, rx: 14,
          fill: "var(--paper-2)", stroke: "var(--line)", "stroke-width": 2,
        }));
      }
    }
    svg.appendChild(cellsG);

    const leafG = svgEl("g", { id: "vk-leaf", transform: `translate(${centerX(leaf.col)}, ${centerY(leaf.row)})` });
    leafG.appendChild(svgEl("path", {
      d: "M0 26 C -28 12, -28 -22, 0 -28 C 28 -22, 28 12, 0 26 Z",
      fill: "var(--mint)", stroke: "var(--ink)", "stroke-width": 2, opacity: 0.9,
    }));
    leafG.appendChild(svgEl("line", {
      x1: 0, y1: 24, x2: 0, y2: -20, stroke: "var(--ink)", "stroke-width": 3, "stroke-linecap": "round",
    }));
    svg.appendChild(leafG);

    /* --- vabaliukas ---------------------------------------------------- */
    const bugMove = svgEl("g", { id: "vk-bug" });
    const bugRot = svgEl("g", {});
    bugMove.style.transform = `translate(${centerX(pos.col)}px, ${centerY(pos.row)}px)`;
    bugRot.style.transform = `rotate(${DIRS[facing].angle}deg)`;
    bugMove.style.transition = reduceMotion ? "none" : "transform 200ms ease";
    bugRot.style.transition = reduceMotion ? "none" : "transform 200ms ease";

    // Kojos: trys poros. Kairioji pusė — ta, kurioje apyrankė.
    [-10, 1, 12].forEach((y) => {
      bugRot.appendChild(svgEl("line", {
        x1: -13, y1: y, x2: -28, y2: y - 6, stroke: "var(--ink)",
        "stroke-width": 2.5, "stroke-linecap": "round",
      }));
      bugRot.appendChild(svgEl("line", {
        x1: 13, y1: y, x2: 28, y2: y - 6, stroke: "var(--ink)",
        "stroke-width": 2.5, "stroke-linecap": "round",
      }));
    });
    bugRot.appendChild(svgEl("ellipse", {
      cx: 0, cy: 2, rx: 17, ry: 20, fill: "var(--sun)", stroke: "var(--ink)", "stroke-width": 2.5,
    }));
    bugRot.appendChild(svgEl("circle", {
      cx: 0, cy: -22, r: 10.5, fill: "var(--sun)", stroke: "var(--ink)", "stroke-width": 2.5,
    }));
    bugRot.appendChild(svgEl("path", {
      d: "M0 -46 l 7 9 h -14 z", fill: "var(--accent)", stroke: "var(--ink)", "stroke-width": 1.5,
    }));
    // apyrankė ant kairės priekinės kojos — žiedas, ne spalvos laukas
    bugRot.appendChild(svgEl("circle", {
      cx: -22, cy: -14, r: 6, fill: "var(--accent)", stroke: "var(--ink)", "stroke-width": 2.5,
    }));

    bugMove.appendChild(bugRot);
    svg.appendChild(bugMove);

    /* --- kairės kortelė, pritvirtinta prie kūno ----------------------- */
    const leftG = svgEl("g", { id: "vk-mark" });
    const leftLine = svgEl("line", {
      x1: 0, y1: 0, x2: 0, y2: 0, stroke: "var(--accent)", "stroke-width": 3, "stroke-linecap": "round",
    });
    leftG.appendChild(leftLine);
    leftG.appendChild(svgEl("rect", {
      x: -29, y: -13, width: 58, height: 26, rx: 9,
      fill: "var(--accent)", stroke: "var(--ink)", "stroke-width": 2,
    }));
    const leftText = svgEl("text", {
      x: 0, y: 5.5, "text-anchor": "middle", "font-size": 15, "font-weight": 900,
      fill: "var(--ink)", "font-family": "system-ui",
    });
    leftText.textContent = "kairė";
    leftG.appendChild(leftText);
    svg.appendChild(leftG);

    /* --- piešimas ------------------------------------------------------ */
    function paint() {
      const cx = centerX(pos.col);
      const cy = centerY(pos.row);
      const d = DIRS[facing];
      bugMove.style.transform = `translate(${cx}px, ${cy}px)`;
      bugRot.style.transform = `rotate(${d.angle}deg)`;

      const tx = Math.max(36, Math.min(284, cx + d.lx * 58));
      const ty = Math.max(20, Math.min(300, cy + d.ly * 58));
      leftG.style.transform = `translate(${tx}px, ${ty}px)`;
      leftLine.setAttribute("x1", cx + d.lx * 30);
      leftLine.setAttribute("y1", cy + d.ly * 30);
      leftLine.setAttribute("x2", tx - d.lx * 29);
      leftLine.setAttribute("y2", ty - d.ly * 13);

      const onLeaf = pos.col === leaf.col && pos.row === leaf.row;
      svg.setAttribute("aria-label",
        `Tinklelis su lapu viršutiniame kairiajame kampe. Vabaliukas ${onLeaf ? "ant lapo" : "tinklelyje"}, `
        + `žiūri ${FACING_TEXT[facing]}. Apyrankė ant kairės priekinės kojos.`);
    }

    /* --- grįžtamasis ryšys --------------------------------------------- */
    function speakState(key) {
      const t = line(key);
      if (!t || lastSaid === key) return;
      lastSaid = key;
      api.speak(t);
    }

    function feedback(kind) {
      if (kind === "edge") {
        api.readout(line("krastas"));
        api.note("Pasuk ir bandyk kita kryptimi.");
        speakState("krastas");
        return;
      }
      if (kind === "leaf") {
        api.readout(line("lapas"));
        api.note("Dabar pasuk jį į save ir pasakyk, kur jo kairė.");
        speakState("lapas");
        return;
      }
      if (kind === "step") {
        api.readout(line("zingsnis"));
        api.note("Žingsnis eina į priekį, ne į šoną.");
        speakState("zingsnis");
        return;
      }
      const map = {
        up: "nuo-taves",
        right: "i-desine",
        down: "i-tave",
        left: "i-kaire",
      };
      const key = map[facing];

      // Spėjimas lyginamas su tuo, kas įvyko, vieną kartą — kai vabaliukas
      // pirmą kartą atsisuka į vaiką (LL-15). Jei spėjimas neteisingas,
      // sakome, kad apyrankė kitoje pusėje, bet neatimame galimybės pastebėti.
      if (facing === "down" && guess && !compared) {
        compared = true;
        const guessText = guess === "right" ? "dešinėje" : "kairėje";
        if (guess === "right") {
          api.readout(`Spėjai: ${guessText}. Taip ir yra.`);
          api.note("Apyrankė atsidūrė ten, kur spėjai. Kairė sukasi kartu su kūnu.");
        } else {
          api.readout(`Spėjai: ${guessText}. Pažiūrėk į apyrankę — ji kitoje pusėje.`);
          api.note("Spėjimas ir tai, ką matai, ne visada sutampa. Pasuk ir palygink.");
        }
        speakState(key);
        return;
      }

      api.readout(line(key));
      api.note(facing === "down"
        ? "Jis žiūri į tave, todėl jo kairė yra kitoje pusėje."
        : `Pasisuko vietoje. Dabar „Žengti“ ves ${STEP_TEXT[facing]}.`);
      speakState(key);
    }

    function checkProgress() {
      const onLeaf = pos.col === leaf.col && pos.row === leaf.row;
      // Tikslas — pasiekti lapą ir atsisukti į vaiką. Būsena tikrinama dabar,
      // o ne „kada nors pasisuko į vaiką“: anksčiau vėliavėlė likdavo įjungta
      // ir pažanga buvo žymima vabaliukui ant lapo žiūrint į šoną.
      if (onLeaf && facing === "down" && !reported) {
        reported = true;
        api.progress({ correct: true });
      }
    }

    /* --- veiksmai ------------------------------------------------------ */
    const stepBtn = controls.querySelector("#vk-step");

    function canStep() {
      const d = DIRS[facing];
      const nc = pos.col + d.dx;
      const nr = pos.row + d.dy;
      return nc >= 0 && nc < size && nr >= 0 && nr < size;
    }

    function syncStep() {
      const ok = canStep();
      stepBtn.disabled = !ok;
      stepBtn.setAttribute("aria-disabled", String(!ok));
    }

    function rotate(dir) {
      const i = ORDER.indexOf(facing);
      facing = ORDER[(i + (dir === "right" ? 1 : 3)) % 4];
      lastSaid = "";
      paint();
      syncStep();
      feedback("turn");
      checkProgress();
    }

    function step() {
      if (!canStep()) {
        feedback("edge");
        return;
      }
      const d = DIRS[facing];
      pos = { col: pos.col + d.dx, row: pos.row + d.dy };
      lastSaid = "";
      paint();
      syncStep();
      const onLeaf = pos.col === leaf.col && pos.row === leaf.row;
      feedback(onLeaf ? "leaf" : "step");
      checkProgress();
    }

    function reset() {
      pos = { col: Number(start.col), row: Number(start.row) };
      facing = DIRS[start.facing] ? start.facing : "up";
      guess = null;
      compared = false;
      reported = false;
      lastSaid = "";
      syncGuess(null);
      paint();
      syncStep();
      api.readout("Pradedam iš naujo. Vabaliukas žiūri nuo tavęs. Kas bus jo kairė?");
      api.note("Pirmiausia pasirink spėjimą, tada pasuk vabaliuką.");
    }

    function syncGuess(side) {
      const leftBtn = controls.querySelector("#vk-guess-left");
      const rightBtn = controls.querySelector("#vk-guess-right");
      const prompt = controls.querySelector("#vk-guess-prompt");
      leftBtn.setAttribute("aria-pressed", String(side === "left"));
      rightBtn.setAttribute("aria-pressed", String(side === "right"));
      prompt.textContent = side
        ? `Tavo spėjimas: ${side === "right" ? "dešinėje" : "kairėje"}.`
        : "Kur bus jo kairė, kai jis atsisuks į tave?";
    }

    function chooseGuess(side) {
      guess = side;
      compared = false;
      syncGuess(side);
      api.readout(`Spėjai: ${side === "right" ? "dešinėje" : "kairėje"}. Dabar pasuk jį į save.`);
      api.note("Pasukimas vyksta vietoje. Tada palygink su apyranke.");
    }

    /* --- įėjimai ------------------------------------------------------- */
    controls.querySelector("#vk-left").addEventListener("click", () => rotate("left"));
    controls.querySelector("#vk-right").addEventListener("click", () => rotate("right"));
    controls.querySelector("#vk-guess-left").addEventListener("click", () => chooseGuess("left"));
    controls.querySelector("#vk-guess-right").addEventListener("click", () => chooseGuess("right"));
    stepBtn.addEventListener("click", step);
    controls.querySelector("#vk-reset").addEventListener("click", reset);

    wrap.addEventListener("keydown", (evt) => {
      if (evt.target !== wrap) return;   // mygtukai savo klavišus apdoroja patys
      if (evt.key === "ArrowLeft") { evt.preventDefault(); rotate("left"); }
      else if (evt.key === "ArrowRight") { evt.preventDefault(); rotate("right"); }
      else if (evt.key === "ArrowUp" || evt.key === " ") { evt.preventDefault(); step(); }
      else if (evt.key === "r" || evt.key === "R") { evt.preventDefault(); reset(); }
    });

    paint();
    syncStep();
    api.readout("Vabaliukas žiūri nuo tavęs. Kur bus jo kairė, kai jis atsisuks į tave? Pasirink spėjimą, tada pasuk.");
    api.note("Pasukimas vyksta vietoje: jis lieka tame pačiame langelyje.");

    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 9. Taškas, tiesė, spindulys, atkarpa                                 */
/* Skirtumas rodomas GALŲ SKAIČIUMI, ne ilgiu: atkarpą galima ištempti  */
/* per visą lapą, ir ji vis tiek turi du galus, o tiesė — nė vieno.     */
/* ------------------------------------------------------------------ */
const taskasTieseSpindulysAtkarpa = {
  mount({ stage, controls, api, config }) {
    const say = config.sentences || {};

    const DEFAULT_SAY = {
      "tiese": "Tai tiesė. Ji neturi galų: eina už lapo krašto.",
      "vienas": "Taškas ant tiesės. Du spinduliai, du galai.",
      "du": "Tarp taškų atkarpa su dviem galais. Tiesė neturi galo.",
      "salia": "Taškas šalia tiesės. Jis ne ant tiesės.",
      "ilgesne": "Atkarpa ilgesnė. Ji vis dar turi du galus.",
      "per-lapa": "Atkarpa per visą lapą. Ji vis tiek turi du galus.",
      "is-naujo": "Pradedam iš naujo. Padėk tašką ant tiesės.",
    };
    const line = (k) => say[k] || DEFAULT_SAY[k];

    const NOTE = {
      "tiese": "Bakstelėk tiesę ir pastatyk tašką.",
      "vienas": "Kiekvienas spindulys baigiasi tame taške. Už lapo jis eina toliau.",
      "du": "Už taškų liko du spinduliai. Ilgink atkarpą mygtuku.",
      "salia": "Tiesė eina pro šalį. Taškas jos nedalija.",
      "ilgesne": "Žiūrėk į galus: jie niekur nedingo.",
      "per-lapa": "Tiesė eina už lapo. Todėl ji neturi galo.",
      "is-naujo": "Bakstelėk tiesę ir pastatyk tašką.",
    };

    const W = 480;
    const H = 280;
    const LY = 150;          // tiesės aukštis
    const OVER = 20;         // kiek linija išeina už lapo krašto
    const MINX = 26;         // kiek atkarpa gali artėti prie krašto
    const MAXX = W - 26;

    let pts = [];            // taškai ANT tiesės (1 arba 2, surikiuoti)
    let off = null;          // taškas ŠALIA tiesės {x, y}
    let reported = false;
    let lastSaid = "";

    stage.innerHTML = `
      <div id="tt-wrap" tabindex="0" role="group"
           aria-label="Bakstelėk tiesę ir pastatyk tašką"
           style="width:100%;max-width:30rem;margin:0 auto;outline-offset:6px">
        <svg id="tt-svg" viewBox="0 0 ${W} ${H}" width="100%" role="img"
             aria-label="Tiesė per visą lapą"></svg>
      </div>`;

    controls.innerHTML = `
      <div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;align-items:center">
        <button class="btn" id="tt-next" aria-label="Padėti tašką ant tiesės">Padėk tašką</button>
        <button class="btn secondary" id="tt-beside" aria-label="Padėti tašką šalia tiesės">Padėk tašką šalia</button>
      </div>
      <div style="display:flex;justify-content:center;margin-top:.6rem">
        <button class="btn ghost" id="tt-reset" aria-label="Pradėti iš naujo">Iš naujo</button>
      </div>`;

    const wrap = stage.querySelector("#tt-wrap");
    const svg = stage.querySelector("#tt-svg");

    const gLine = svgEl("g", {});
    const gSeg = svgEl("g", {});
    const gPts = svgEl("g", {});
    const gLab = svgEl("g", {});
    svg.append(gLine, gSeg, gPts, gLab);

    const bar = (x1, x2, color, width) => svgEl("line", {
      x1, y1: LY, x2, y2: LY, stroke: color, "stroke-width": width, "stroke-linecap": "butt",
    });

    const label = (text, x, y, color) => {
      const t = svgEl("text", {
        x, y, "text-anchor": "middle", "font-size": 28, "font-weight": 800,
        "font-family": "system-ui, sans-serif", fill: color || "var(--ink)",
      });
      t.textContent = text;
      gLab.appendChild(t);
      // Užrašas neturi liesti lapo krašto: ilgas žodis prie krašto buvo
      // apkarpomas (raidės „s“ nebematėsi).
      try {
        const b = t.getBBox();
        if (b.width) {
          if (b.x < 6) t.setAttribute("x", Number(x) + (6 - b.x));
          else if (b.x + b.width > W - 6) t.setAttribute("x", Number(x) + (W - 6 - b.x - b.width));
        }
      } catch { /* getBBox gali nepavykti, kol scena nematoma */ }
    };

    const dot = (x, y, fill) => {
      gPts.appendChild(svgEl("circle", {
        cx: x, cy: y, r: 12, fill: fill || "var(--ink)",
        stroke: "var(--paper-2)", "stroke-width": 5,
      }));
    };

    function isFull() {
      return pts.length === 2 && pts[0] <= MINX && pts[1] >= MAXX;
    }

    /* --- piešimas ---------------------------------------------------- */
    function paint() {
      gLine.innerHTML = "";
      gSeg.innerHTML = "";
      gPts.innerHTML = "";
      gLab.innerHTML = "";

      const a = pts.length > 0 ? pts[0] : null;
      const b = pts.length > 1 ? pts[1] : null;

      if (a === null) {
        gLine.appendChild(bar(-OVER, W + OVER, "var(--ink)", 11));
        label("tiesė", 66, LY - 26, "var(--ink-soft)");
      } else {
        // kairysis spindulys: nuo lapo krašto iki taško
        gLine.appendChild(bar(-OVER, a, "var(--sky)", 11));
        // dešinysis spindulys: nuo dešiniojo taško iki lapo krašto
        const rightFrom = b === null ? a : b;
        gLine.appendChild(bar(rightFrom, W + OVER, "var(--sky)", 11));

        if (a > 150) label("spindulys", (a - OVER) / 2, LY - 26, "var(--ink-soft)");
        if (W - rightFrom > 150) label("spindulys", (rightFrom + W + OVER) / 2, LY - 26, "var(--ink-soft)");

        if (b !== null) {
          gSeg.appendChild(svgEl("line", {
            x1: a, y1: LY, x2: b, y2: LY, stroke: "var(--accent)",
            "stroke-width": 20, "stroke-linecap": "butt",
          }));
          label("atkarpa", (a + b) / 2, LY - 28);
        }
      }

      pts.forEach((p) => dot(p, LY));
      if (off) {
        dot(off.x, off.y, "var(--ink-soft)");
        label("šalia", off.x, off.y + 40);
      }

      const parts = [];
      if (a === null) parts.push("Tiesė eina per visą lapą ir už jo krašto.");
      else if (b === null) parts.push("Vienas taškas ant tiesės. Nuo jo eina du spinduliai.");
      else parts.push("Du taškai ant tiesės. Tarp jų atkarpa.");
      if (off) parts.push("Vienas taškas šalia tiesės.");
      svg.setAttribute("aria-label", parts.join(" "));
    }

    function announce(key) {
      api.readout(line(key));
      api.note(NOTE[key] || "");
      if (lastSaid !== key) {
        lastSaid = key;
        api.speak(line(key));
      }
    }

    function sync() {
      const btn = controls.querySelector("#tt-next");
      if (pts.length === 0) {
        btn.textContent = "Padėk tašką";
        btn.setAttribute("aria-label", "Padėti tašką ant tiesės");
        btn.disabled = false;
      } else if (pts.length === 1) {
        btn.textContent = "Padėk antrą tašką";
        btn.setAttribute("aria-label", "Padėti antrą tašką ant tiesės");
        btn.disabled = false;
      } else if (isFull()) {
        btn.textContent = "Ilgesnė negali būti";
        btn.setAttribute("aria-label", "Atkarpa jau per visą lapą");
        btn.disabled = true;
      } else {
        btn.textContent = "Pratęsk atkarpą";
        btn.setAttribute("aria-label", "Pratęsti atkarpą į abi puses");
        btn.disabled = false;
      }
    }

    /* --- veiksmai ---------------------------------------------------- */
    function placeOn(x) {
      if (pts.length >= 2) {
        api.readout("Atkarpa jau turi du taškus. Spausk „Pratęsk atkarpą“.");
        api.note("Jei nori dėti kitaip, spausk „Iš naujo“.");
        return;
      }
      const nx = Math.max(MINX, Math.min(MAXX, Math.round(x)));
      pts = pts.concat(nx).sort((p, q) => p - q);
      paint();
      sync();
      announce(pts.length === 1 ? "vienas" : "du");
    }

    function placeBeside() {
      // Po du taškus atkarpa užbaigta — šalia esantis taškas nebeatlieka vaidmens.
      off = { x: 350, y: LY + 80 };
      paint();
      sync();
      announce("salia");
    }

    function extend() {
      if (pts.length < 2) return;
      const step = 70;
      const a = Math.max(MINX, pts[0] - step);
      const b = Math.min(MAXX, pts[1] + step);
      pts = [a, b];
      paint();
      sync();
      if (isFull()) {
        announce("per-lapa");
        // Tikslas pasiektas DABAR: atkarpa per visą lapą ir vis tiek su dviem galais.
        if (!reported) {
          reported = true;
          api.progress({ correct: true });
        }
      } else {
        announce("ilgesne");
      }
    }

    function next() {
      if (pts.length === 0) placeOn(170);
      else if (pts.length === 1) {
        const right = pts[0] + 190;
        placeOn(right <= MAXX ? right : pts[0] - 190);
      } else extend();
    }

    function reset() {
      pts = [];
      off = null;
      reported = false;
      lastSaid = "";
      paint();
      sync();
      announce("is-naujo");
    }

    /* --- bakstelėjimas ----------------------------------------------- */
    function onTap(evt) {
      const r = svg.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const x = ((evt.clientX - r.left) / r.width) * W;
      const y = ((evt.clientY - r.top) / r.height) * H;

      if (Math.abs(y - LY) <= 38) {
        placeOn(x);
        return;
      }
      // Taškas šalia: lieka ten, kur bakstelėta, bet ne per arti tiesės ir ne už lapo.
      const minY = 34;
      const maxY = H - 58;
      let py = y < LY ? Math.min(LY - 64, y) : Math.max(LY + 64, y);
      py = Math.max(minY, Math.min(maxY, py));
      const px = Math.max(40, Math.min(W - 40, x));
      off = { x: px, y: py };
      paint();
      sync();
      announce("salia");
    }

    /* --- įėjimai ------------------------------------------------------ */
    svg.addEventListener("click", onTap);
    controls.querySelector("#tt-next").addEventListener("click", next);
    controls.querySelector("#tt-beside").addEventListener("click", placeBeside);
    controls.querySelector("#tt-reset").addEventListener("click", reset);

    wrap.addEventListener("keydown", (evt) => {
      const arrows = { ArrowLeft: -20, ArrowRight: 20 };
      if (arrows[evt.key]) {
        if (!pts.length) return;          // kol nėra taško, rodyklės neturi ką judinti
        evt.preventDefault();
        const d = arrows[evt.key];
        let i = pts.length - 1;
        let v = pts[i] + d;
        if (pts.length === 2) {
          v = i === 1 ? Math.min(MAXX, Math.max(pts[0] + 40, v))
                      : Math.max(MINX, Math.min(pts[1] - 40, v));
        } else {
          v = Math.max(MINX, Math.min(MAXX, v));
        }
        pts[i] = v;
        paint();
        sync();
        return;
      }
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        next();
      }
    });

    paint();
    sync();
    api.readout(line("tiese"));
    api.note(NOTE["tiese"]);
    api.speak(line("tiese"));

    return null;
  },
};

export const SIMS = {
  "skaiciu-tiese": skaiciuTiese,
  desimtukas,
  figuros,
  desningumai,
  "laikrodis-sujungtos-rodykles": laikrodisSujungtosRodykles,
  "svarstykles-lygybe": svarstyklesLygybe,
  "pinigine-ir-kaina": pinigineIrKaina,
  "vabaliukas-ir-kryptys": vabaliukasIrKryptys,
  "taskas-tiese-spindulys-atkarpa": taskasTieseSpindulysAtkarpa,
};
