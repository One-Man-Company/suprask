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

    controls.querySelector("#fg-reset").addEventListener("click", () => {
      stage.innerHTML = "";
      controls.innerHTML = "";
      figuros.mount({ stage, controls, api, config });
    });

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

export const SIMS = {
  "skaiciu-tiese": skaiciuTiese,
  desimtukas,
  figuros,
  desningumai,
  "laikrodis-sujungtos-rodykles": laikrodisSujungtosRodykles,
};
