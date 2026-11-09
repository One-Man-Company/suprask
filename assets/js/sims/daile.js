/**
 * Dailės simuliacijos (1 klasė).
 *
 * Modelis: kompozicija (didelė dėmė, maža dėmė, potėpis) įterpiama VIENĄ kartą,
 * o keičiasi tik didelės dėmės `fill`. Todėl vaikas pamato, kad pasikeitė
 * spalva, o ne piešinys — ir tai galima patikrinti, o ne tik perskaityti.
 *
 * Kodėl abstrakti dėmė, o ne peizažas: peizaže spalva turi antrą reikšmę
 * (metų laiką ar paros laiką) ir daiktas kviečia jį pavadinti („saulė negali
 * būti mėlyna“). Dėmė neturi pavadinimo, todėl klausimas lieka apie spalvą.
 *
 * Kodėl grįžimas į jau matytą spalvą yra būtinas: dviejų paveikslų palyginimas
 * neįrodo, kad formos liko tos pačios; grįžimas grąžina LYGIAI tą patį vaizdą.
 *
 * Geometrija (viewBox 328×250) fiksuota: keičiamas tik `fill` atributas, joks
 * `innerHTML` perpiešimas, joks `transform`. Skaitoma būsena (`aria-label`,
 * `aria-pressed`, užrašai) — ne vien spalva (prieinamumas, LL-24).
 */

import { art } from "./art.js";

const DARK = "#3a342b";

/* Fiksuota kompozicija 328×250 srityje. Skaičiai nekeičiami bėgant laikui. */
const BIG = { x: 26, y: 38, w: 168, h: 136 };
const SMALL = { x: 248, y: 40, w: 46, h: 42 };
const STROKE = { x: 170, y: 196, w: 146, h: 9 };

const NOTES = {
  geltona: "Geltona buvo pradžioje. Formos liko tos pačios.",
  raudona: "Pasikeitė tik užpildas.",
  zalia: "Dėmė liko savo vietoje.",
  melyna: "Pasikeitė spalva, ne piešinys.",
};

const demeIrSpalvos = {
  mount({ stage, controls, api, config }) {
    const COLORS = Array.isArray(config.colors) ? config.colors : [];
    if (!COLORS.length) {
      stage.innerHTML = `<p class="strand-meta">Spalvos dar nesukonfigūruotos.</p>`;
      return () => {};
    }

    const byId = new Map(COLORS.map((c) => [c.id, c]));
    const SENT = config.sentences || {};
    const startColor = byId.get(config.start) || COLORS[0];

    let answered = false;
    let current = startColor.id;
    const seen = new Set([startColor.id]);
    let returned = false;
    let reported = false;
    let timer = 0;

    stage.innerHTML = `
      <div style="display:grid;gap:.8rem;justify-items:center;width:100%;min-width:0">
        <svg id="deme-scene" viewBox="0 0 328 250" width="100%"
             style="display:block;max-width:328px;height:auto"
             role="img" aria-label="Didelė dėmė ${startColor.name.toLowerCase()}, maža dėmė ir linija tamsios. Dėmės vieta nepakito.">
          <g id="deme-didele">${art.spot(BIG.x, BIG.y, BIG.w, BIG.h, startColor.hex, "apvali")}</g>
          <g id="deme-maza">${art.spot(SMALL.x, SMALL.y, SMALL.w, SMALL.h, DARK, "apvali")}</g>
          ${art.spot(STROKE.x, STROKE.y, STROKE.w, STROKE.h, DARK, "juosta")}
        </svg>

        <div style="display:flex;gap:1.1rem;align-items:center;justify-content:center;flex-wrap:wrap;font-size:.8rem;font-weight:800;letter-spacing:.04em;color:var(--ink-soft)">
          <span style="display:inline-flex;align-items:center;gap:.4rem">
            <svg viewBox="0 0 62 26" width="62" height="26" aria-hidden="true">
              ${art.spot(2, 3, 32, 20, DARK, "apvali", 1.6)}
              ${art.spot(40, 5, 16, 14, DARK, "kampuota", 1.6)}
            </svg>
            FORMA
          </span>
          <span style="display:inline-flex;align-items:center;gap:.4rem">
            <span id="deme-swatch" aria-hidden="true" style="display:inline-block;width:1.05rem;height:1.05rem;border-radius:5px;border:1px solid rgba(0,0,0,.3);background:${startColor.hex}"></span>
            SPALVA
          </span>
        </div>
      </div>`;

    controls.innerHTML = `
      <div id="deme-colors" role="group" aria-label="Dažai"
           style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;width:100%">
        ${COLORS.map((c) => `
          <button class="btn secondary" type="button" data-color="${c.id}"
            aria-label="${c.name} spalva" aria-pressed="false" aria-disabled="true"
            style="display:grid;justify-items:center;align-content:center;gap:.15rem;
                   min-width:4.3rem;min-height:3.4rem;padding:.25rem .35rem;opacity:.55">
            <span aria-hidden="true" style="width:1.8rem;height:1.8rem;border-radius:50%;
                  background:${c.hex};border:2px solid rgba(0,0,0,.28)"></span>
            <span style="font-size:.72rem;font-weight:800">${c.name}</span>
          </button>`).join("")}
      </div>
      <button class="btn" type="button" id="deme-guess" style="min-width:11rem">Sakau</button>
      <button class="btn secondary" type="button" id="deme-reset"
        aria-label="Pradėti iš naujo" style="min-width:6rem">Iš naujo</button>`;

    const scene = stage.querySelector("#deme-scene");
    const bigPath = stage.querySelector("#deme-didele path");
    const swatch = stage.querySelector("#deme-swatch");
    const colorBtns = Array.from(controls.querySelectorAll("[data-color]"));
    const guessBtn = controls.querySelector("#deme-guess");
    const resetBtn = controls.querySelector("#deme-reset");

    const lower = (c) => c.name.toLowerCase();

    function setSpot(id) {
      const c = byId.get(id);
      /* Tik užpildas — forma, dydis ir vieta nekeičiami (LL-13, modelio sąlyga). */
      bigPath.setAttribute("fill", c.hex);
      if (swatch) swatch.style.background = c.hex;
    }

    function updateSceneLabel(id) {
      const c = byId.get(id);
      scene.setAttribute(
        "aria-label",
        `Didelė dėmė ${lower(c)}, maža dėmė ir linija tamsios. Dėmės vieta nepakito.`
      );
    }

    function updatePressed(id) {
      colorBtns.forEach((b) => {
        const on = b.dataset.color === id;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.style.borderColor = on ? "var(--ink)" : "var(--line)";
      });
    }

    function speak(key) {
      const text = SENT[key];
      if (text) api.speak(text, { rate: 0.95 });
    }

    function clearTimer() {
      if (timer) {
        clearTimeout(timer);
        timer = 0;
      }
    }

    function chooseColor(id) {
      clearTimer();

      if (!answered) {
        api.note("Pirma pasakyk, tada rinkis spalvą.");
        speak("guess");
        guessBtn.focus();
        return;
      }

      if (id === current) {
        api.note("Ši spalva jau rodoma. Pasirink kitą.");
        return;
      }

      const c = byId.get(id);
      const wasSeen = seen.has(id);

      setSpot(id);
      updateSceneLabel(id);
      updatePressed(id);
      current = id;

      if (wasSeen) {
        returned = true;
        api.readout(`Vėl ${lower(c)}. Paveikslas toks pat.`);
        api.note("Forma nepakito nė vienu tašku.");
        speak(`vel-${id}`);
      } else {
        seen.add(id);
        api.readout(`${c.name} dėmė. Formos tos pačios.`);
        api.note(NOTES[id] || "Pasikeitė tik užpildas.");
        speak(id);
      }

      /* Palyginimas rodomas po grįžimo, ne po pirmo dažo (LL-29): vaikas turi
         pamatyti dvi spalvas TOJE PAČIOJE formoje ir sugrįžti į pirmą. */
      if (seen.size >= 2 && returned && !reported) {
        timer = setTimeout(() => {
          timer = 0;
          api.readout("Dvi spalvos. Viena forma.");
          api.note("Pasikeitė įspūdis, o ne piešinys.");
          if (!reported) {
            reported = true;
            api.progress({ correct: true });
          }
        }, 1400);
      }
    }

    function reset() {
      clearTimer();
      returned = false;
      current = startColor.id;
      seen.clear();
      seen.add(startColor.id);
      setSpot(current);
      updateSceneLabel(current);
      updatePressed(current);
      api.readout(`${startColor.name} dėmė vėl pradžioje. Formos tos pačios.`);
      api.note("Keisk spalvas ir žiūrėk, ar kas nors pajuda.");
    }

    colorBtns.forEach((btn) => {
      btn.addEventListener("click", () => chooseColor(btn.dataset.color));
    });

    guessBtn.addEventListener("click", () => {
      answered = true;
      guessBtn.hidden = true;
      colorBtns.forEach((b) => {
        b.removeAttribute("aria-disabled");
        b.style.opacity = "1";
      });
      api.readout(`${startColor.name} dėmė. Formos tos pačios.`);
      api.note("Dabar rinkis dažą ir žiūrėk, kas pasikeis.");
      speak(startColor.id);
      colorBtns[0].focus();
    });

    resetBtn.addEventListener("click", reset);

    controls.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const i = colorBtns.indexOf(document.activeElement);
        if (i < 0) return;
        e.preventDefault();
        const step = e.key === "ArrowRight" ? 1 : -1;
        colorBtns[(i + step + colorBtns.length) % colorBtns.length].focus();
      } else if (e.key === "r" || e.key === "R") {
        reset();
      }
    });

    setSpot(current);
    updatePressed(current);
    api.readout("Kas pasikeis: formos ar nuotaika? Pasakyk, tada keisk.");
    api.note("Pirma pasakyk, tada rinkis spalvą.");

    return () => clearTimer();
  },
};

export const SIMS = {
  "deme-ir-spalvos": demeIrSpalvos,
};
