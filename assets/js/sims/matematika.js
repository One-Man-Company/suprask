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

export const SIMS = {
  "skaiciu-tiese": skaiciuTiese,
  desimtukas,
  figuros,
  desningumai,
};
