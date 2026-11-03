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
  mount({ stage, controls, api }) {
    stage.innerHTML = `
      <div style="text-align:center">
        <div id="dt-grid" style="display:grid;grid-template-columns:repeat(5,minmax(2.6rem,3.4rem));grid-template-rows:repeat(2,minmax(2.6rem,3.4rem));gap:.5rem;justify-content:center"></div>
        <p class="sim-note" id="dt-msg">Spausk langelius ir skaičiuok. Kiek trūksta iki 10?</p>
      </div>`;
    controls.innerHTML = `<button class="btn secondary" id="dt-clear">Išvalyti</button>`;
    const grid = stage.querySelector("#dt-grid");
    const msg = stage.querySelector("#dt-msg");
    const filled = new Set();

    for (let i = 0; i < 10; i += 1) {
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
      api.readout(`${n} iš 10. Trūksta ${10 - n}.`);
      if (n === 10) { msg.textContent = "Pilnas dešimtukas! Dabar atimk 3 — kas lieka?"; api.progress({ correct: true }); api.speak("Dešimt. Puiku!"); }
      else if (n === 5) { msg.textContent = "Pusė dešimtuko — penki. Kaip dar gali pasakyti penkis?"; }
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
/* 3. Figūrų rūšiavimas                                                */
/* ------------------------------------------------------------------ */
const figuros = {
  mount({ stage, controls, api, config }) {
    const shapes = [
      { id: "trikampis", label: "Trikampis", path: "M50 16 L90 84 L10 84 Z" },
      { id: "keturkampis", label: "Keturkampis", path: "M18 20 H82 V84 H18 Z" },
      { id: "apskritimas", label: "Apskritimas", circle: { cx: 50, cy: 52, r: 34 } },
    ];
    const colors = ["#ff8a3d", "#4fc3a1", "#5aa9e6", "#f2708a", "#8f7ae5", "#ffc94d"];
    const tray = [];
    shapes.forEach((s) => { for (let k = 0; k < 3; k += 1) tray.push({ ...s, key: `${s.id}-${k}`, color: colors[(tray.length % colors.length)] }); });
    tray.sort(() => Math.random() - 0.5);

    let selected = null;
    const placed = { trikampis: 0, keturkampis: 0, apskritimas: 0 };

    stage.innerHTML = `
      <div style="width:100%;max-width:44rem">
        <div id="fg-tray" style="display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center;min-height:6rem;padding:.6rem;border-radius:var(--r-m);background:color-mix(in srgb, var(--sun) 8%, var(--paper))"></div>
        <div id="fg-bins" style="display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem;margin-top:1rem"></div>
        <p class="sim-note" id="fg-msg">Pasirink figūrą, tada spausk dėžę, kuriai ji priklauso.</p>
      </div>`;
    controls.innerHTML = `<button class="btn ghost" id="fg-reset">Iš naujo</button>`;
    const trayEl = stage.querySelector("#fg-tray");
    const binsEl = stage.querySelector("#fg-bins");
    const msg = stage.querySelector("#fg-msg");

    function shapeSvg(item, size = 62) {
      const svg = svgEl("svg", { viewBox: "0 0 100 100", width: size, height: size, "aria-hidden": "true" });
      if (item.circle) svg.appendChild(svgEl("circle", { ...item.circle, fill: item.color }));
      else svg.appendChild(svgEl("path", { d: item.path, fill: item.color }));
      return svg;
    }

    function drawTray() {
      trayEl.innerHTML = "";
      tray.forEach((item) => {
        const b = document.createElement("button");
        b.style.cssText = "border:3px solid transparent;background:transparent;border-radius:14px;padding:4px;cursor:pointer;min-width:70px;min-height:70px";
        b.dataset.key = item.key;
        b.appendChild(shapeSvg(item));
        if (selected === item.key) b.style.borderColor = "var(--ink)";
        b.addEventListener("click", () => {
          selected = item.key;
          drawTray();
          api.speak(item.label, { rate: .9 });
        });
        trayEl.appendChild(b);
      });
    }

    shapes.forEach((s) => {
      const bin = document.createElement("button");
      bin.style.cssText = "display:grid;place-items:center;gap:.3rem;padding:.8rem .4rem;border:3px dashed var(--line);border-radius:var(--r-m);background:var(--paper-2);cursor:pointer;min-height:8rem";
      bin.innerHTML = `<span style="font-family:var(--font-head);font-weight:900;font-size:.95rem">${s.label}</span>`;
      const holder = document.createElement("span");
      holder.style.cssText = "display:flex;gap:2px;flex-wrap:wrap;justify-content:center";
      bin.appendChild(holder);
      bin.addEventListener("click", () => {
        if (!selected) { msg.textContent = "Pirma pasirink figūrą viršuje."; return; }
        const item = tray.find((x) => x.key === selected);
        if (!item) return;
        if (item.id === s.id) {
          placed[s.id] += 1;
          holder.appendChild(shapeSvg(item, 26));
          tray.splice(tray.indexOf(item), 1);
          selected = null;
          drawTray();
          api.progress({ correct: true });
          msg.textContent = "Teisingai!";
          if (tray.length === 0) {
            msg.textContent = "Visos figūros surūšiuotos! Suskaičiuok, kiek kiekvienoje dėžėje.";
            api.readout(`Trikampiai ${placed.trikampis}, keturkampiai ${placed.keturkampis}, apskritimai ${placed.apskritimas}`);
            api.speak("Visos figūros savo vietose. Puiku!");
          }
        } else {
          bin.classList.add("wiggle");
          setTimeout(() => bin.classList.remove("wiggle"), 450);
          msg.textContent = "Tai ne šios dėžės figūra. Apžiūrėk kampus ir kraštines.";
        }
      });
      binsEl.appendChild(bin);
    });

    controls.querySelector("#fg-reset").addEventListener("click", () => location.reload());

    drawTray();
    api.readout("Rūšiuok figūras");
    return null;
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
