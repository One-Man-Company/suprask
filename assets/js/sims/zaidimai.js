/**
 * Žaidimų teorijos simuliacijos (1 klasė).
 * Principas: sąvoka „sąžininga“, „bendradarbiauti“, „tikimybė“ parodoma kaip žaidimas,
 * kuriame vaikas pats priima sprendimus ir mato jų pasekmes abiem pusėms.
 */

const NS = "http://www.w3.org/2000/svg";
const svgEl = (tag, attrs = {}) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};

/* ------------------------------------------------------------------ */
/* 1. Sąžiningas dalijimasis (tortas)                                  */
/* ------------------------------------------------------------------ */
const saziningasDalijimasis = {
  mount({ stage, controls, api }) {
    const SLICES = 8;
    const owners = new Array(SLICES).fill(null); // null | "a" | "b"
    const R = 92;
    const CX = 110;
    const CY = 110;

    stage.innerHTML = `
      <div style="text-align:center">
        <svg id="sd-cake" viewBox="0 0 220 220" width="min(78vw,300px)" role="img" aria-label="Tortas, padalintas į 8 dalis"></svg>
        <p id="sd-count" style="font-family:var(--font-head);font-weight:900;font-size:1.15rem;margin:.4rem 0"></p>
      </div>`;
    controls.innerHTML = `<button class="btn secondary" id="sd-reset">Iš naujo</button>`;
    const svg = stage.querySelector("#sd-cake");
    const countEl = stage.querySelector("#sd-count");

    function pt(angle) {
      const rad = (angle * Math.PI) / 180;
      return [CX + R * Math.cos(rad), CY + R * Math.sin(rad)];
    }

    function draw() {
      svg.innerHTML = `<circle cx="${CX}" cy="${CY}" r="${R + 8}" fill="none" stroke="var(--line)" stroke-width="2" stroke-dasharray="4 6"/>`;
      for (let i = 0; i < SLICES; i += 1) {
        const a0 = (360 / SLICES) * i - 90;
        const a1 = a0 + 360 / SLICES;
        const [x0, y0] = pt(a0);
        const [x1, y1] = pt(a1);
        const owner = owners[i];
        const fill = owner === "a" ? "#5aa9e6" : owner === "b" ? "#ffc94d" : "#f7e6cf";
        const slice = svgEl("path", {
          d: `M${CX},${CY} L${x0},${y0} A${R},${R} 0 0 1 ${x1},${y1} Z`,
          fill, stroke: "var(--paper-2)", "stroke-width": 3, class: "piece", "data-i": i,
          role: "button", tabindex: 0, "aria-label": `Dalis ${i + 1}`,
        });
        slice.style.cursor = "pointer";
        const flip = () => {
          owners[i] = owners[i] === null ? "a" : owners[i] === "a" ? "b" : null;
          draw();
        };
        slice.addEventListener("click", flip);
        slice.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
        svg.appendChild(slice);
      }
      svg.appendChild(svgEl("circle", { cx: CX, cy: CY, r: 6, fill: "var(--ink-faint)" }));

      const a = owners.filter((o) => o === "a").length;
      const b = owners.filter((o) => o === "b").length;
      const left = owners.filter((o) => o === null).length;
      countEl.textContent = `Tu: ${a} · Draugas: ${b} · Nepadalinta: ${left}`;
      api.readout(`Tu ${a}, draugas ${b}`);

      if (left === 0 && a === b) {
        api.note("Sąžininga! Abu gavote po tiek pat. Ar yra kitas būdas padalinti sąžiningai?");
        api.progress({ correct: true });
      } else if (left === 0 && a !== b) {
        api.note(a > b ? "Tu pasiėmei daugiau. Kaip jaustųsi draugas?" : "Draugas gavo daugiau. Ar taip norėjai?");
      } else {
        api.note("Spausk dalis: pirmas spausdinimas — tau, antras — draugui, trečias — atgal.");
      }
    }

    controls.querySelector("#sd-reset").addEventListener("click", () => {
      owners.fill(null);
      draw();
    });

    draw();
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 2. Bendradarbiavimo tiltas                                          */
/* ------------------------------------------------------------------ */
const bendradarbiavimoTiltas = {
  mount({ stage, controls, api }) {
    const NEED = 6;
    const MINE = 4;
    const THEIRS = 4;
    let give = 0;

    stage.innerHTML = `
      <div style="width:100%;max-width:44rem;text-align:center">
        <svg id="bt-scene" viewBox="0 0 420 220" role="img" aria-label="Upė ir tiltas"></svg>
        <p class="sim-note" id="bt-msg"></p>
      </div>`;
    controls.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:.5rem;width:100%;max-width:26rem">
        <label for="bt-range" style="font-weight:800;text-align:center">Kiek savo blokų duosi draugui? <span id="bt-val">0</span></label>
        <input id="bt-range" type="range" min="0" max="${MINE}" value="0" step="1" style="width:100%;height:2.6rem" />
        <button class="btn secondary" id="bt-try">Statyti tiltą</button>
      </div>`;
    const svg = stage.querySelector("#bt-scene");
    const msg = stage.querySelector("#bt-msg");
    const range = controls.querySelector("#bt-range");
    const val = controls.querySelector("#bt-val");

    function draw(built) {
      const total = give + THEIRS;
      svg.innerHTML = `
        <rect x="0" y="120" width="420" height="100" fill="#dff0fb"/>
        <path d="M0 120 Q105 150 210 122 T420 120 L420 220 L0 220 Z" fill="#a8d4ef"/>
        <rect x="0" y="96" width="420" height="26" fill="#c9a56a"/>
        <text x="20" y="86" font-family="system-ui" font-size="13" fill="#5f574d">Tu</text>
        <text x="380" y="86" font-family="system-ui" font-size="13" fill="#5f574d">Draugas</text>
        ${Array.from({ length: MINE - give }).map((_, i) => `<rect x="${24 + i * 22}" y="${62}" width="18" height="18" rx="4" fill="#ff8a3d"/>`).join("")}
        ${Array.from({ length: THEIRS }).map((_, i) => `<rect x="${300 + i * 22}" y="${62}" width="18" height="18" rx="4" fill="#4fc3a1"/>`).join("")}
        ${built ? `
          <rect x="90" y="78" width="240" height="16" rx="4" fill="#8a6242"/>
          <path d="M104 78 L124 96 M144 78 L164 96 M184 78 L204 96 M224 78 L244 96 M264 78 L284 96" stroke="#6d4c33" stroke-width="4"/>
          <circle cx="150" cy="62" r="9" fill="#23201c"/><circle cx="270" cy="62" r="9" fill="#23201c"/>` : `
          <text x="210" y="70" text-anchor="middle" font-family="system-ui" font-size="13" fill="#8b8175">tiltui reikia ${NEED} blokų</text>`}
        <text x="210" y="206" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="700" fill="#1d5e8c">
          ${built ? "Tiltas pastatytas — perėjo abu!" : `Surinkta ${total} iš ${NEED} blokų`}
        </text>`;
      val.textContent = String(give);
      api.readout(`${give} + ${THEIRS} = ${total} blokų`);
      if (built) {
        api.note("Kai dalijamės, tiltas pastatomas ir praeina abu. Ar galėjo laimėti tik vienas?");
        api.progress({ correct: true });
      } else if (total < NEED) {
        msg.textContent = `Trūksta ${NEED - total} bloko (-ų). Jei pasiliksi visus blokus sau, tiltas nebus pastatytas.`;
      }
    }

    range.addEventListener("input", () => { give = Number(range.value); draw(false); msg.textContent = ""; api.speak(`${give} blokus`, { rate: 1 }); });
    controls.querySelector("#bt-try").addEventListener("click", () => draw(give + THEIRS >= NEED));

    draw(false);
    msg.textContent = "Draugas visada duoda savo 4 blokus. Kiek duosi tu?";
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 3. Akmenėlis, žirklės, popierius — tikimybė                         */
/* ------------------------------------------------------------------ */
const akmenelisPopierius = {
  mount({ stage, controls, api }) {
    const moves = [
      { id: "akmenelis", emoji: "✊", label: "Akmenėlis", acc: "akmenėlį", beats: "zirkles" },
      { id: "zirkles", emoji: "✌️", label: "Žirklės", acc: "žirkles", beats: "popierius" },
      { id: "popierius", emoji: "✋", label: "Popierius", acc: "popierių", beats: "akmenelis" },
    ];
    const score = { win: 0, lose: 0, draw: 0 };
    let last = "Paklausk draugo arba spausk savo ėjimą.";

    stage.innerHTML = `
      <div style="text-align:center;width:100%;max-width:40rem">
        <div id="ap-play" style="display:flex;justify-content:center;align-items:center;gap:1.2rem;font-size:clamp(2.6rem,10vw,4rem);min-height:6rem">
          <span id="ap-you">❔</span><span style="font-size:1.2rem;color:var(--ink-faint)">prieš</span><span id="ap-pc">❔</span>
        </div>
        <p id="ap-msg" style="font-family:var(--font-head);font-weight:800;min-height:1.6rem"></p>
        <div id="ap-bars" style="display:grid;gap:.4rem;max-width:24rem;margin:0 auto"></div>
      </div>`;
    controls.innerHTML = `
      <div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center">
        ${moves.map((m) => `<button class="btn secondary" data-move="${m.id}" style="font-size:2rem;min-width:4.4rem" aria-label="${m.label}">${m.emoji}</button>`).join("")}
      </div>
      <button class="btn ghost" id="ap-reset">Nuo nulio</button>`;
    const youEl = stage.querySelector("#ap-you");
    const pcEl = stage.querySelector("#ap-pc");
    const msgEl = stage.querySelector("#ap-msg");
    const barsEl = stage.querySelector("#ap-bars");

    function bars() {
      const total = score.win + score.lose + score.draw || 1;
      const rows = [
        { k: "Laimėjai", v: score.win, c: "#4fc3a1" },
        { k: "Pralaimėjai", v: score.lose, c: "#f2708a" },
        { k: "Lygiosios", v: score.draw, c: "#ffc94d" },
      ];
      barsEl.innerHTML = rows.map((r) => `
        <div style="display:grid;grid-template-columns:7rem 1fr 3rem;gap:.5rem;align-items:center;font-size:.9rem;font-weight:700">
          <span style="text-align:right">${r.k}</span>
          <span style="height:1.2rem;background:var(--line);border-radius:999px;overflow:hidden">
            <span style="display:block;height:100%;width:${(r.v / total) * 100}%;background:${r.c}"></span>
          </span>
          <span>${r.v}</span>
        </div>`).join("");
    }

    function play(id) {
      const me = moves.find((m) => m.id === id);
      const pc = moves[Math.floor(Math.random() * moves.length)];
      youEl.textContent = me.emoji;
      pcEl.textContent = pc.emoji;
      if (me.id === pc.id) { score.draw += 1; msgEl.textContent = "Lygiosios — abu parodėte tą patį."; }
      else if (me.beats === pc.id) { score.win += 1; msgEl.textContent = `${me.label} nugali ${pc.acc}!`; }
      else { score.lose += 1; msgEl.textContent = `${pc.label} nugali ${me.acc}.`; }
      bars();
      api.readout(`Tu ${score.win} · Kompiuteris ${score.lose} · Lygiosios ${score.draw}`);
      const total = score.win + score.lose + score.draw;
      if (total >= 10) {
        api.note(`Po ${total} ėjimų: kiekvienas variantas laimi maždaug trečdalį kartų. Nėra „karštos rankos“ — tik atsitiktinumas.`);
        api.progress({ correct: true });
      } else {
        api.note(last);
      }
    }

    controls.querySelectorAll("[data-move]").forEach((b) => b.addEventListener("click", () => play(b.dataset.move)));
    controls.querySelector("#ap-reset").addEventListener("click", () => {
      score.win = 0; score.lose = 0; score.draw = 0;
      youEl.textContent = "❔"; pcEl.textContent = "❔";
      msgEl.textContent = ""; bars(); api.readout("0 · 0 · 0");
    });

    bars();
    return null;
  },
};

export const SIMS = {
  "saziningas-dalijimasis": saziningasDalijimasis,
  "bendradarbiavimo-tiltas": bendradarbiavimoTiltas,
  "akmenelis-popierius": akmenelisPopierius,
};
