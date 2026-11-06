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
    let raf = 0;
    let dragAngle = null;
    let reported = false;

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
    function paint() {
      const h = hourOf();
      const frac = fracOf();
      longG.setAttribute("transform", `rotate(${frac * 360} 180 180)`);
      shortG.setAttribute("transform", `rotate(${(h % 12) * 30 + frac * 30} 180 180)`);
      digital.textContent = `${h} val.`;
      svg.setAttribute("aria-label", `Laikrodis: ${wordOf(h)}. Ilgoji rodyklė ${frac < 0.001 ? "ties 12" : "dar sukasi"}.`);

      if (locked) return;
      if (frac > 0.001) {
        api.readout("Ratas nebaigtas");
        msg.textContent = "Ilgoji dar neapėjo viso rato. Trumpoji dar tarp skaičių.";
      } else {
        api.readout(wordOf(h));
        msg.textContent = turns === 0
          ? "Ilgoji ties 12. Suk ją per visą ratą."
          : "Ratas baigtas: ilgoji ties 12, trumpoji stovi ties skaičiumi.";
      }
    }

    function afterRound() {
      paint();
      const h = hourOf();
      msg.textContent = "Vienas ratas — vienas žingsnis. Trumpoji pasislinko per vieną skaičių.";
      api.speak(wordOf(h), { rate: 0.9 });
      if (!reported) { reported = true; api.progress({ correct: true }); }
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
        msg.textContent = "Pirma pasakyk, ką galvoji.";
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
      if (locked) { msg.textContent = "Pirma pasakyk, ką galvoji."; return; }
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
    controls.querySelectorAll("[data-g]").forEach((b) => {
      b.addEventListener("click", () => {
        const guess = Number(b.dataset.g);
        controls.querySelector("#lk-guess").style.display = "none";
        controls.querySelector("#lk-turn").style.display = "flex";
        locked = false;
        paint();
        msg.textContent = guess === 0
          ? "Taip: per vieną ratą trumpoji pasislenka per vieną skaičių. Dabar suk ir pažiūrėk."
          : "Pabandyk: suk ilgąją per visą ratą ir stebėk, ką daro trumpoji.";
        svg.focus();
      });
    });

    controls.querySelector("#lk-one").addEventListener("click", oneRound);
    controls.querySelector("#lk-reset").addEventListener("click", () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      turns = 0;
      paint();
      msg.textContent = "Pradedam iš naujo. Suk ilgąją rodyklę.";
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
    const angle = () => Math.max(-12, Math.min(12, 1.6 * diff()));

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

    controls.querySelector("#sv-start").addEventListener("click", () => {
      locked = false;
      controls.querySelector("#sv-guess").style.display = "none";
      controls.querySelector("#sv-tools").style.display = "flex";
      paint();
      feedback();
      wrap.focus();
    });

    paint();
    api.readout("Kiek kubelių reikia įdėti? Pasakyk, tada dėk.");

    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 7. Piniginė ir kaina                                                */
/*                                                                    */
/* Modelis: monetos vertę pasako ant jos užrašytas skaičius, o ne      */
/* dydis ar monetų kiekis. Juosta ilgėja pagal skaičių, todėl          */
/* „didesnė moneta — daugiau pinigų“ tampa matoma klaida, o ne         */
/* paaiškinimas žodžiais (Berti ir Bombi, 1981; Hasegawa, 2020).       */
/* ------------------------------------------------------------------ */
const pinigineIrKaina = {
  mount({ stage, controls, api, config }) {
    const price = Math.max(1, Math.min(100, Number(config.price ?? 60)));
    const coinList = (Array.isArray(config.coins) && config.coins.length ? config.coins : [50, 20, 10, 5])
      .map((c) => Number(c))
      .filter((c) => c > 0);
    const say = config.sentences || {};

    const PER_CENT = 3.2;   // 100 c = 320 px, telpa į 360 vienetų sceną
    const MAX_SUM = 100;
    const TRACK_X = 20;
    const TRACK_W = 320;
    const TRACK_Y = 52;
    const TRACK_H = 26;

    // Tikri monetų skersmenys (1,85 px/mm): 5 c (21,25 mm) yra DIDESNĖ
    // už 10 c (19,75 mm), nors verta perpus mažiau. Tai ir yra modelio taikinys.
    const DIAMETER = { 50: 45, 20: 41, 10: 36.5, 5: 39 };
    const diameter = (c) => DIAMETER[c] || 38;

    let plate = [];         // monetos lėkštėje — vienintelis kintamasis
    let locked = true;      // kol vaikas nepasakė spėjimo, dėti negalima
    let reported = false;
    let firstSet = "";
    let toldOther = false;
    let toldSize = false;
    let lastSaid = "";

    const sum = () => plate.reduce((a, b) => a + b, 0);
    const setKey = () => plate.slice().sort((a, b) => b - a).join("+");

    // Lietuvių kalba: 1 moneta, 2 monetos, 11 monetų, 21 moneta…
    const coinWord = (n) => {
      const d = n % 10;
      const h = n % 100;
      if (d === 1 && h !== 11) return "moneta";
      if (d >= 2 && d <= 9 && !(h >= 11 && h <= 19)) return "monetos";
      return "monetų";
    };

    function coinSvg(cents, size) {
      const r = size / 2;
      const fill = cents === 5 ? "#e2a06a" : "var(--sun)";   // varis / auksas — tik papildoma
      return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true" focusable="false">
        <circle cx="${r}" cy="${r}" r="${r - 1}" fill="${fill}" stroke="var(--ink-soft)" stroke-width="1.5"/>
        <text x="${r}" y="${r + size * 0.16}" text-anchor="middle" fill="var(--ink)"
              font-size="${(size * 0.38).toFixed(1)}" font-weight="900" font-family="system-ui">${cents}</text>
      </svg>`;
    }

    stage.innerHTML = `
      <div id="pg-wrap" tabindex="0" role="group" aria-label="Piniginė ir kaina"
           style="width:100%;max-width:24rem;margin:0 auto;text-align:center;outline-offset:4px">
        <svg id="pg-svg" viewBox="0 0 360 100" width="100%" role="img"
             aria-label="Kainos juosta"></svg>
        <p id="pg-card" style="font-family:var(--font-head);font-weight:900;font-size:1.6rem;margin:.3rem 0 0;min-height:2rem"></p>
        <div id="pg-plate" role="group" aria-label="Lėkštė su monetomis"
             style="display:flex;flex-wrap:wrap;justify-content:center;gap:.15rem;min-height:3.4rem;padding:.3rem;border:2px dashed var(--line);border-radius:var(--r-s);background:var(--paper-2)"></div>
        <p id="pg-count" style="margin:.5rem 0 0;font-weight:800">Monetų: 0</p>
        <p id="pg-sum" style="margin:.1rem 0 0;font-weight:800">Suma: 0 c</p>
        <p class="sim-note" id="pg-msg" style="margin:.4rem 0 0"></p>
      </div>`;

    controls.innerHTML = `
      <div id="pg-guess" style="display:flex;justify-content:center">
        <button class="btn" id="pg-say">Sakau</button>
      </div>
      <div id="pg-purse" style="display:none;gap:.5rem;flex-wrap:wrap;justify-content:center;align-items:center">
        ${coinList.map((c) => `
          <button class="btn secondary pg-coin" data-cent="${c}" aria-label="${c} centų moneta"
                  style="width:56px;height:56px;min-width:56px;padding:0;display:flex;align-items:center;justify-content:center">
            ${coinSvg(c, diameter(c))}
          </button>`).join("")}
      </div>
      <div id="pg-tools" style="display:none;gap:.6rem;flex-wrap:wrap;justify-content:center;align-items:center">
        <button class="btn ghost" id="pg-undo">Nuimk paskutinę</button>
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

    const priceX = TRACK_X + price * PER_CENT;
    const priceAnchor = priceX > 300 ? "end" : priceX < 60 ? "start" : "middle";
    const priceLine = svgEl("line", {
      x1: priceX, y1: 44, x2: priceX, y2: 86, stroke: "var(--ink)", "stroke-width": 3, "stroke-linecap": "round",
    });
    svg.appendChild(priceLine);
    const priceLabel = svgEl("text", {
      x: priceX, y: 38, "text-anchor": priceAnchor, fill: "var(--ink)",
      "font-size": 17, "font-weight": 800, "font-family": "system-ui",
    });
    priceLabel.textContent = `Kaina ${price} c`;
    svg.appendChild(priceLabel);

    const zeroLabel = svgEl("text", {
      x: TRACK_X, y: 98, "text-anchor": "start", fill: "var(--ink-faint)",
      "font-size": 12, "font-weight": 700, "font-family": "system-ui",
    });
    zeroLabel.textContent = "0";
    svg.appendChild(zeroLabel);
    const fullLabel = svgEl("text", {
      x: TRACK_X + TRACK_W, y: 98, "text-anchor": "end", fill: "var(--ink-faint)",
      "font-size": 12, "font-weight": 700, "font-family": "system-ui",
    });
    fullLabel.textContent = "100 c";
    svg.appendChild(fullLabel);

    /* --- būsena ------------------------------------------------------- */
    function sayOnce(key) {
      const t = say[key];
      if (!t || lastSaid === key) return;
      lastSaid = key;
      api.speak(t);
    }

    function renderPlate(focusIdx) {
      plateEl.innerHTML = plate.map((c, i) => `
        <button class="pg-take" data-i="${i}" aria-label="Nuimti ${c} centų monetą"
                style="width:48px;height:48px;min-width:48px;padding:0;border:0;border-radius:50%;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer">
          ${coinSvg(c, 30)}
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
      const shown = Math.min(s, MAX_SUM);
      const width = shown * PER_CENT;
      fillBar.setAttribute("width", width);
      fillBar.setAttribute("opacity", s === 0 ? "0" : "1");

      if (s > price && TRACK_X + width > priceX) {
        overflow.setAttribute("x", priceX);
        overflow.setAttribute("width", TRACK_X + width - priceX);
        overflow.setAttribute("display", "");
      } else {
        overflow.setAttribute("display", "none");
      }

      // monetų ribos: matosi, kiek juostos pridėjo kiekviena moneta
      seps.innerHTML = "";
      let acc = 0;
      plate.forEach((c, i) => {
        acc += c;
        if (i === plate.length - 1 || acc > MAX_SUM) return;
        const x = TRACK_X + acc * PER_CENT;
        seps.appendChild(svgEl("line", {
          x1: x, y1: TRACK_Y + 2, x2: x, y2: TRACK_Y + TRACK_H - 2,
          stroke: "var(--paper-2)", "stroke-width": 2, opacity: 0.75,
        }));
      });

      countEl.textContent = `Monetų: ${plate.length}`;
      sumEl.textContent = `Suma: ${s} c`;
      cardEl.textContent = s === price && s > 0
        ? `${plate.map((c) => `${c} c`).join(" + ")} = ${price} c`
        : "";

      const relation = s === 0 ? "Lėkštė tuščia." : s < price ? "Dar ne visa kaina." : s > price ? "Per daug." : "Suma lygi kainai.";
      svg.setAttribute("aria-label",
        `Kaina ${price} centų. Lėkštėje ${plate.length} ${coinWord(plate.length)}, suma ${s} centų. ${relation}`);
    }

    function feedback() {
      const s = sum();
      if (locked) {
        api.readout(`Kiek monetų prireiks ${price} centų? Pasakyk, tada dėk.`);
        return;
      }

      if (s === 0) {
        api.readout(`Kaina ${price} c. Įdėk monetą.`);
        msgEl.textContent = "Dar nieko nesumokėta.";
        lastSaid = "";
      } else if (s < price) {
        api.readout("Dar ne visa kaina.");
        msgEl.textContent = "Juosta dar nesiekia kainos žymos.";
        sayOnce("mazai");
      } else if (s > price) {
        api.readout("Per daug.");
        msgEl.textContent = "Juosta peržengė kainos žymą. Nuimk monetą.";
        sayOnce("perdaug");
      } else if (!reported) {
        reported = true;
        firstSet = setKey();
        api.readout(`Apmokėta. ${price} c.`);
        msgEl.textContent = "Juosta lygiai ties kainos žyma. Suma ir kaina sutampa.";
        sayOnce("apmoketa");
        api.progress({ correct: true });
      } else if (!toldOther && setKey() !== firstSet) {
        toldOther = true;
        api.readout("Ta pati suma, kitos monetos.");
        msgEl.textContent = "Monetų skaičius kitas, suma ta pati.";
        sayOnce("kitaip");
      } else {
        api.readout(`Apmokėta. ${price} c.`);
        msgEl.textContent = "Juosta lygiai ties kainos žyma. Suma ir kaina sutampa.";
        lastSaid = "";
      }

      // Vienkartinė pastaba: 5 c moneta didesnė už 10 c, bet verta perpus mažiau.
      if (!toldSize && plate.includes(5) && plate.includes(10)) {
        toldSize = true;
        msgEl.textContent = "Penkių centų moneta didesnė, bet verta mažiau.";
        if (say.dydis) api.speak(say.dydis);
      }
    }

    function addCoin(c) {
      if (locked) return;
      plate.push(c);
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
      plate = [];
      lastSaid = "";
      paint();
      feedback();
      msgEl.textContent = "Pradedam iš naujo. Lėkštė tuščia.";
    }

    /* --- įėjimai ------------------------------------------------------ */
    purseEl.querySelectorAll("button").forEach((b) => {
      b.addEventListener("click", () => addCoin(Number(b.dataset.cent)));
    });

    controls.querySelector("#pg-undo").addEventListener("click", undo);
    controls.querySelector("#pg-reset").addEventListener("click", reset);

    controls.querySelector("#pg-say").addEventListener("click", () => {
      locked = false;
      controls.querySelector("#pg-guess").style.display = "none";
      purseEl.style.display = "flex";
      controls.querySelector("#pg-tools").style.display = "flex";
      paint();
      feedback();
      wrap.focus();
    });

    wrap.addEventListener("keydown", (evt) => {
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
    });

    paint();
    api.readout(`Kiek monetų prireiks ${price} centų? Pasakyk, tada dėk.`);

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
};
