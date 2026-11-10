import { art } from "./art.js";
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

    /* Torto piešinys buvo `width="min(78vw,300px)"` — plotis nuo ekrano, o ne
       nuo kortelės. Prie 200 % teksto kortelė susitraukia (šaknies `rem`
       padidina paraštes), 78vw lieka 323 px, todėl SVG išstūmė kortelę 26 px
       (#4741). Dabar plotis 100 % kortelės, o 300 px ir 78vw lieka tik
       viršutine riba: įprastu šriftu matoma lygiai tiek pat (300 px @414,
       280,8 px @360). */
    stage.innerHTML = `
      <div style="text-align:center;min-width:0;max-width:100%;box-sizing:border-box">
        <svg id="sd-cake" viewBox="0 0 220 220" role="img" aria-label="Tortas, padalintas į 8 dalis"
             style="width:100%;max-width:min(78vw,300px);height:auto"></svg>
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
        <input id="bt-range" type="range" min="0" max="${MINE}" value="0" step="1" style="width:100%;height:3rem" aria-label="Kiek blokų duosi draugui" />
        <button class="btn secondary" id="bt-try">Statyti tiltą</button>
      </div>`;
    const svg = stage.querySelector("#bt-scene");
    const msg = stage.querySelector("#bt-msg");
    const range = controls.querySelector("#bt-range");
    const val = controls.querySelector("#bt-val");

    function draw(built) {
      const total = give + THEIRS;
      svg.innerHTML = `
        ${art.defs("bt")}
        <rect x="0" y="0" width="420" height="220" rx="14" fill="url(#bt-sky)"/>
        ${art.hills(420, 82, "#b6d9a4", "#9cc78a")}
        <rect x="0" y="88" width="92" height="132" fill="#c9a96e"/>
        <rect x="328" y="88" width="92" height="132" fill="#c9a96e"/>
        <rect x="0" y="88" width="92" height="12" fill="#a9d98a"/>
        <rect x="328" y="88" width="92" height="12" fill="#a9d98a"/>
        ${art.grass(18, 100, 1)}${art.grass(66, 101, 0.9)}
        ${art.grass(352, 100, 1)}${art.grass(398, 101, 0.9)}
        ${art.river(92, 96, 236, 124, "bt")}
        ${Array.from({ length: MINE - give }).map((_, i) => art.block(14 + i * 19, 60, 17, "#ff8a3d", "", "#a04d17")).join("")}
        ${Array.from({ length: THEIRS }).map((_, i) => art.block(336 + i * 19, 60, 17, "#4fc3a1", "", "#2f8a72")).join("")}
        <text x="46" y="52" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="700" fill="#5f574d">Tu</text>
        <text x="374" y="52" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="700" fill="#5f574d">Draugas</text>
        ${built ? `
          ${art.bridge(78, 112, 264)}
          ${art.kid(104, 112, 0.9, "#ff8a3d")}
          ${art.kid(316, 112, 0.9, "#4fc3a1")}
          <rect x="104" y="190" width="212" height="24" rx="12" fill="#fff" opacity=".85"/>
          <text x="210" y="206" text-anchor="middle" font-family="system-ui" font-size="14" font-weight="800" fill="#1d5e8c">Tiltas pastatytas — perėjo abu!</text>` : `
          <text x="210" y="118" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="700" fill="#1d5e8c">
            tiltui reikia ${NEED} blokų
          </text>
          <rect x="120" y="190" width="180" height="24" rx="12" fill="#fff" opacity=".85"/>
          <text x="210" y="206" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="700" fill="#1d5e8c">
            Surinkta ${total} iš ${NEED} blokų
          </text>`}`;
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
    const ROWS = [
      { k: "win", label: "Laimėjimai", c: "#4fc3a1" },
      { k: "lose", label: "Pralaimėjimai", c: "#f2708a" },
      { k: "draw", label: "Lygiosios", c: "#ffc94d" },
    ];
    /* Modulio rezultatas žada „stebiu rezultatus ir lyginu juos su lūkesčiu“,
       o simuliacija anksčiau tik skaičiavo ir po dešimto ėjimo PASKELBDAMA
       „kiekvienas variantas laimi maždaug trečdalį kartų“ — neparodžiusi nei
       lūkesčio, nei palyginimo su juo. Dabar trečdalis rodomas kaip skaičius,
       o palyginti kviečiamas vaikas (P2: pirma veiksmas, paskui
       paaiškinimas). Trečdalis imamas ties 9 ėjimais, nes 9 : 3 = 3 —
       sveikas skaičius, kurį vaikas perskaičiuoja pats. */
    const THIRD_AT = 9;
    const DUEL = "Akmenėlis nugali žirkles. Žirklės nugali popierių. Popierius nugali akmenėlį.";
    const ejimai = (n) => (n % 10 === 1 && n % 100 !== 11 ? "ėjimas" : "ėjimai");
    const score = { win: 0, lose: 0, draw: 0 };
    let streak = { id: null, n: 0 };
    let announced = false;

    /* Kortelė yra `#sim-stage` tinklelio vaikas: be `min-width:0` jos
       mažiausias plotis lygus turinio min-content, todėl prie 200 % teksto
       (32 px šaknis) žaidimo eilutė išstūmė puslapį 24 px, o 360 px ekrane —
       78 px (#4741). Dydžiai rišami prie TIKRO kortelės pločio (`cqw`), nes
       `rem` seka šaknies šriftu ir auga kartu su juo. */
    stage.innerHTML = `
      <div style="text-align:center;width:100%;max-width:40rem;min-width:0;box-sizing:border-box;container-type:inline-size">
        <div id="ap-play" style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:min(1.2rem,6cqw);font-size:min(clamp(2.6rem,10vw,4rem),22cqw);min-height:6rem">
          <span id="ap-you">❔</span><span style="font-size:min(1.2rem,9cqw);color:var(--ink-faint)">prieš</span><span id="ap-pc">❔</span>
        </div>
        <p id="ap-msg" style="font-family:var(--font-head);font-weight:800;min-height:1.6rem"></p>
        <div id="ap-bars" style="display:flex;flex-direction:column;gap:.4rem;max-width:26rem;margin:0 auto"></div>
        <p id="ap-third" style="font-size:.95rem;font-weight:700;margin:.6rem 0 0"></p>
      </div>`;
    controls.innerHTML = `
      <div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;min-width:0">
        ${moves.map((m) => `<button class="btn secondary" data-move="${m.id}" style="font-size:min(2rem,10vw);min-width:min(4.4rem,22vw);min-height:48px" aria-label="${m.label}">${m.emoji}</button>`).join("")}
      </div>
      <button class="btn ghost" id="ap-reset">Nuo nulio</button>`;
    const youEl = stage.querySelector("#ap-you");
    const pcEl = stage.querySelector("#ap-pc");
    const msgEl = stage.querySelector("#ap-msg");
    const barsEl = stage.querySelector("#ap-bars");
    const thirdEl = stage.querySelector("#ap-third");

    function bars() {
      const total = score.win + score.lose + score.draw || 1;
      /* Fiksuotos `7rem`/`3rem` kolonos prie 200 % teksto (32 px šaknis) užėmė
         336 px ir stulpelis nebetilpo į 294,8 px kortelę (#4741). Dabar tai
         lanksti eilutė: įprastu šriftu pločiai tie patys, o padidinus tekstą
         eilutė persirikiuoja (LL-41, LL-51), o ne išstumia puslapį. */
      barsEl.innerHTML = ROWS.map((r) => `
        <div style="display:flex;flex-wrap:wrap;gap:.35rem .5rem;align-items:center;font-size:.9rem;font-weight:700;min-width:0">
          <span style="flex:0 0 auto">${r.label}</span>
          <span style="flex:1 1 5rem;min-width:2.5rem;height:1.2rem;background:var(--line);border-radius:999px;overflow:hidden">
            <span style="display:block;height:100%;width:${(score[r.k] / total) * 100}%;background:${r.c}"></span>
          </span>
          <span style="flex:0 0 auto;min-width:1.2rem;text-align:right">${score[r.k]}</span>
        </div>`).join("");
      /* Trečdalis imamas iš TIKRŲ ėjimų, o ne paskelbiamas iš anksto: kai
         ėjimų skaičius nesidalija iš 3, neišgalvotas skaičius nerodomas.
         „1 ėjimas“ / „2 ėjimai“ — skaičiaus forma, ne daugiskaita visada. */
      const played = score.win + score.lose + score.draw;
      thirdEl.textContent = played === 0
        ? "Iš viso 0 ėjimų."
        : played % 3 === 0
          ? `${played} ${ejimai(played)}. Jei visi trys lygūs — po ${played / 3}.`
          : `${played} ${ejimai(played)}.`;
    }

    /* Trys paaiškinimo eilės, visos trumpesnės už 10 žodžių. Serija rodoma
       TIK jai prasidėjus, o ne po dešimto ėjimo: kitaip vaikas „karštą ranką“
       jau spėja įsidėmėti, o neigimą išgirsta kaip pamokymą, ne pastebėjimą. */
    function explain(played) {
      if (streak.n >= 3) return `Jau ${streak.n} tokie patys rezultatai iš eilės. Kitas ėjimas gali būti bet kuris.`;
      if (played > 0 && played % 3 === 0) return `Po ${played} ėjimų trečdalis — po ${played / 3}. Palygink su savo skaičiais.`;
      return DUEL;
    }

    function play(id) {
      const me = moves.find((m) => m.id === id);
      const pc = moves[Math.floor(Math.random() * moves.length)];
      youEl.textContent = me.emoji;
      pcEl.textContent = pc.emoji;
      let out;
      if (me.id === pc.id) {
        out = "draw"; score.draw += 1;
        msgEl.textContent = "Lygiosios — abu parodėte tą patį.";
      } else if (me.beats === pc.id) {
        out = "win"; score.win += 1;
        msgEl.textContent = `${me.label} nugali ${pc.acc}!`;
      } else {
        out = "lose"; score.lose += 1;
        msgEl.textContent = `${pc.label} nugali ${me.acc}.`;
      }
      streak = streak.id === out ? { id: out, n: streak.n + 1 } : { id: out, n: 1 };

      const played = score.win + score.lose + score.draw;
      bars();
      api.readout(`Laimėjimai ${score.win}, pralaimėjimai ${score.lose}, lygiosios ${score.draw}. Ėjimų ${played}.`);
      api.note(explain(played));
      if (played >= THIRD_AT && !announced) {
        announced = true;
        api.progress({ correct: true });
      }
    }

    controls.querySelectorAll("[data-move]").forEach((b) => b.addEventListener("click", () => play(b.dataset.move)));
    controls.querySelector("#ap-reset").addEventListener("click", () => {
      score.win = 0; score.lose = 0; score.draw = 0;
      streak = { id: null, n: 0 };
      youEl.textContent = "❔"; pcEl.textContent = "❔";
      msgEl.textContent = "";
      bars();
      api.readout("Laimėjimai 0, pralaimėjimai 0, lygiosios 0. Ėjimų 0.");
      api.note(DUEL);
    });

    bars();
    api.readout("Laimėjimai 0, pralaimėjimai 0, lygiosios 0. Ėjimų 0.");
    api.note(DUEL);
    return null;
  },
};

export const SIMS = {
  "saziningas-dalijimasis": saziningasDalijimasis,
  "bendradarbiavimo-tiltas": bendradarbiavimoTiltas,
  "akmenelis-popierius": akmenelisPopierius,
};
