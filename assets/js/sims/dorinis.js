/**
 * Dorinio ugdymo simuliacijos (1 klasė).
 *
 * Modelis: trys vaikai stato vieną bokštą, kiekvienas savo stulpą. Stogas
 * uždedamas tik tada, kai visi trys stulpai vienodo aukščio, t. y. kai visi
 * trys vaikai įdėjo savo blokus. Vaikas pirma spėja, ar bokštas bus baigtas,
 * tada pasirenka, kas nustoja dėti, ir stato iš naujo.
 *
 * Kodėl ne „bokštas sugriūna“: trijų stulpų konstrukcija su plokščiu stogu
 * fiziškai nenugriūtų, jei vieno stulpo trūktų, o modelis neturi teigti
 * daugiau, nei rodo (LL-18). Todėl rodoma tai, kas tikra: be vieno stulpo
 * stogas neuždedamas, todėl bendras darbas lieka nebaigtas visiems.
 *
 * Kodėl trys stulpai, o ne viena krūva: vienoje krūvoje trūkstamas blokas
 * reiškia tik žemesnį bokštą, o bendro rezultato sąlyga lieka neaiški.
 * Trys stulpai yra matoma sutartis: stogas remiasi į visus tris.
 */

import { art } from "./art.js";

const GROUND = 252;
const BLOCK = 30;
const ROOF = { x: 137, y: 162, w: 120, h: 10 };

const susitarimoBokstas = {
  mount({ stage, controls, api, config }) {
    const KIDS = Array.isArray(config.kids) ? config.kids.slice(0, 3) : [];
    if (KIDS.length !== 3) {
      stage.innerHTML = `<p class="strand-meta">Vaikai dar nesukonfigūruoti.</p>`;
      return () => {};
    }

    const SENT = config.sentences || {};
    const ROUNDS = Math.max(1, Math.min(4, Number(config.rounds) || 3));
    const COLS = [144, 182, 220];
    const KID_X = [159, 197, 235];
    const KID_Y = 292;
    const REDUCE = typeof window !== "undefined"
      && typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let skipped = null;
    let heights = [0, 0, 0];
    let guess = null;
    let runGuess = null;
    let phase = "idle";
    let outcome = null;
    let reported = false;
    let timer = 0;
    const seen = new Set();

    stage.innerHTML = `
      <div style="display:grid;gap:.6rem;justify-items:center;width:100%;min-width:0">
        <div id="sb-scene-wrap" style="width:100%;min-width:0;text-align:center"></div>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.8rem;width:100%;max-width:30rem;min-width:0;margin:0 auto">
        <div style="min-width:0">
          <p id="sb-who-label" style="font-weight:800;text-align:center;margin:0 0 .35rem">Kas nustoja dėti?</p>
          <div id="sb-who" role="group" aria-labelledby="sb-who-label"
               style="display:flex;flex-wrap:wrap;gap:.45rem;justify-content:center;min-width:0;width:100%">
            <button class="btn secondary" type="button" data-who="" aria-pressed="true"
                    style="min-height:3rem;flex:0 1 auto;min-width:0;max-width:100%;padding-left:.8rem;padding-right:.8rem">Niekas</button>
            ${KIDS.map((k) => `
              <button class="btn secondary" type="button" data-who="${k.id}" aria-pressed="false"
                      style="min-height:3rem;flex:0 1 auto;min-width:0;max-width:100%;padding-left:.8rem;padding-right:.8rem">
                <span aria-hidden="true" style="display:inline-block;width:.9rem;height:.9rem;border-radius:50%;
                      background:${k.color};border:1px solid rgba(0,0,0,.3);flex:0 0 auto"></span>
                ${k.name}
              </button>`).join("")}
          </div>
        </div>
        <div style="min-width:0">
          <p id="sb-guess-label" style="font-weight:800;text-align:center;margin:0 0 .35rem">Ar bokštas bus baigtas?</p>
          <div id="sb-guess" role="group" aria-labelledby="sb-guess-label"
               style="display:flex;flex-wrap:wrap;gap:.45rem;justify-content:center;min-width:0;width:100%">
            <button class="btn secondary" type="button" data-guess="stand" aria-pressed="false"
                    style="min-height:3rem;flex:0 1 auto;min-width:0;max-width:100%;padding-left:.8rem;padding-right:.8rem">Bus baigtas</button>
            <button class="btn secondary" type="button" data-guess="fall" aria-pressed="false"
                    style="min-height:3rem;flex:0 1 auto;min-width:0;max-width:100%;padding-left:.8rem;padding-right:.8rem">Liks nebaigtas</button>
          </div>
        </div>
        <div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;min-width:0;width:100%">
          <button class="btn" type="button" id="sb-build" style="min-width:0;flex:1 1 8rem;max-width:100%;padding-left:1rem;padding-right:1rem">Statyti</button>
          <button class="btn ghost" type="button" id="sb-reset" style="min-width:0;flex:0 1 auto;max-width:100%;padding-left:1rem;padding-right:1rem">Iš naujo</button>
        </div>
      </div>`;

    const sceneWrap = stage.querySelector("#sb-scene-wrap");
    const whoBtns = Array.from(controls.querySelectorAll("[data-who]"));
    const guessBtns = Array.from(controls.querySelectorAll("[data-guess]"));
    const buildBtn = controls.querySelector("#sb-build");
    const resetBtn = controls.querySelector("#sb-reset");

    function kidById(id) {
      return KIDS.find((k) => k.id === id) || null;
    }

    function sceneLabel() {
      if (phase === "build") {
        return `Stato bokštą. ${KIDS.map((k, i) => `${k.name}: ${heights[i]}`).join(", ")}.`;
      }
      if (outcome === "stand") {
        return "Bokštas baigtas. Visi trys stulpai po tris blokus. Stogas uždėtas.";
      }
      if (outcome === "fall") {
        const k = kidById(skipped);
        return `Bokštas nebaigtas. ${k ? `${k.name} nepastatė savo stulpo.` : "Vieno stulpo nėra."} Stogas guli ant žemės.`;
      }
      const k = kidById(skipped);
      return `Trys vaikai. ${k ? `${k.name} nustoja dėti.` : "Visi trys deda."} Bokštas dar nepastatytas.`;
    }

    function sceneSVG() {
      const parts = [];
      parts.push(art.defs("sb"));
      parts.push(art.sun(322, 44, 15, "sb", 1));
      parts.push(art.cloud(62, 48, 0.75));
      parts.push(art.hills(360, GROUND - 2, "#b6d9a4", "#9cc78a"));
      parts.push(art.grass(118, 292, 1));
      parts.push(art.grass(266, 294, 0.9));
      parts.push(art.grass(300, 290, 0.8));

      /* Vaikai — po savo stulpu, todėl matoma, kas kurio stulpo šeimininkas.
         Spalva niekada nėra vienintelis informacijos nešėjas: blokuose yra
         raidė, o po vaikais — vardas. */
      KIDS.forEach((k, i) => {
        parts.push(art.kid(KID_X[i], KID_Y, 0.95, k.color));
        parts.push(`<text x="${KID_X[i]}" y="309" text-anchor="middle" font-family="system-ui, sans-serif"
          font-size="12" font-weight="700" fill="#5f574d">${k.name}</text>`);
      });

      /* Trūkstamo stulpo vieta — brūkšniuotas kontūras. Tai ne puošmena:
         be jo tuščia vieta atrodo kaip dar nepradėtas stulpas, o ne kaip
         praleistas ėjimas. */
      if (outcome === "fall" && skipped) {
        const i = KIDS.findIndex((k) => k.id === skipped);
        if (i >= 0) {
          parts.push(`<rect x="${COLS[i]}" y="${GROUND - BLOCK * ROUNDS}" width="${BLOCK}"
            height="${BLOCK * ROUNDS}" rx="6" fill="none" stroke="#8a8378" stroke-width="2"
            stroke-dasharray="5 6" opacity=".75"/>`);
        }
      }

      KIDS.forEach((k, i) => {
        for (let h = 0; h < heights[i]; h += 1) {
          const y = GROUND - BLOCK * (h + 1);
          parts.push(art.block(COLS[i], y, BLOCK, k.color, k.initial, k.dark));
        }
      });

      if (outcome === "stand") {
        parts.push(art.plank(ROOF.x, ROOF.y, ROOF.w, ROOF.h, 0));
      } else if (outcome === "fall") {
        parts.push(`<g transform="rotate(-9 250 296)">${art.plank(250, 296, 96, 9, 0)}</g>`);
      }

      return `<svg id="sb-scene" viewBox="0 0 360 314" width="100%"
        style="display:block;max-width:360px;height:auto;margin:0 auto"
        role="img" aria-label="${sceneLabel()}">${parts.join("")}</svg>`;
    }

    function render() {
      sceneWrap.innerHTML = sceneSVG();
    }

    function clearTimer() {
      if (timer) {
        clearTimeout(timer);
        timer = 0;
      }
    }

    function updateWho() {
      whoBtns.forEach((b) => {
        const on = (b.dataset.who || null) === skipped;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.style.borderColor = on ? "var(--ink)" : "var(--line)";
        b.style.background = on ? "var(--sun-soft, #fff3cf)" : "";
      });
    }

    function updateGuess() {
      guessBtns.forEach((b) => {
        const on = b.dataset.guess === guess;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.style.borderColor = on ? "var(--ink)" : "var(--line)";
        b.style.background = on ? "var(--sun-soft, #fff3cf)" : "";
        b.setAttribute("aria-disabled", phase === "build" ? "true" : "false");
        b.style.opacity = phase === "build" ? ".55" : "1";
      });
      if (guess && phase !== "build") buildBtn.removeAttribute("aria-disabled");
      else buildBtn.setAttribute("aria-disabled", "true");
      buildBtn.style.opacity = guess && phase !== "build" ? "1" : ".55";
    }

    function updateWhoDisabled() {
      whoBtns.forEach((b) => {
        b.setAttribute("aria-disabled", phase === "build" ? "true" : "false");
        b.style.opacity = phase === "build" ? ".55" : "1";
      });
    }

    function clearScene() {
      clearTimer();
      phase = "idle";
      heights = [0, 0, 0];
      outcome = null;
      updateWhoDisabled();
      render();
    }

    function startBuild() {
      clearTimer();
      phase = "build";
      outcome = null;
      heights = [0, 0, 0];
      runGuess = guess;
      guess = null;
      updateWhoDisabled();
      updateGuess();
      render();
      api.readout("Statome bokštą.");

      const steps = [];
      for (let r = 0; r < ROUNDS; r += 1) {
        KIDS.forEach((k, i) => {
          if (k.id !== skipped) steps.push(i);
        });
      }

      let stepIndex = 0;
      const advance = () => {
        if (stepIndex >= steps.length) {
          timer = setTimeout(finish, REDUCE ? 80 : 420);
          return;
        }
        const i = steps[stepIndex];
        stepIndex += 1;
        heights[i] += 1;
        render();
        timer = setTimeout(advance, REDUCE ? 70 : 330);
      };
      advance();
    }

    function finish() {
      timer = 0;
      phase = "done";
      const complete = heights.every((h) => h === ROUNDS);
      outcome = complete ? "stand" : "fall";
      seen.add(outcome);
      render();
      updateWhoDisabled();
      updateGuess();

      const sentence = complete
        ? (SENT.stand || "Bokštas baigtas. Visi trys laikėsi eilės.")
        : (SENT.fall || "Bokštas nebaigtas. Visiems trūksta vieno stulpo.");
      api.readout(sentence);
      if (typeof api.speak === "function") api.speak(sentence, { rate: 0.95 });

      const matched = runGuess === outcome;
      const k = kidById(skipped);
      let note;
      if (complete) {
        note = matched
          ? "Tu spėjai, kad bus baigtas. Taip ir įvyko."
          : "Tu spėjai, kad liks nebaigtas. Visi trys dėjo, todėl stogas uždėtas.";
      } else {
        note = matched
          ? `Tu spėjai, kad liks nebaigtas. Taip ir įvyko. ${k ? k.name : "Vienas vaikas"} nedėjo, todėl stogo uždėti negalima.`
          : `Tu spėjai, kad bus baigtas. ${k ? k.name : "Vienas vaikas"} nedėjo, todėl stogas liko ant žemės.`;
      }

      if (seen.size >= 2) {
        note += " Tu matei abu atvejus.";
        if (!reported) {
          reported = true;
          api.progress({ correct: true });
          note += " Paaiškink, kodėl taip yra.";
        }
      } else {
        note += complete
          ? " Pabandyk ir kitą atvejį: vienas nustoja dėti."
          : " Pabandyk ir kitą atvejį: visi trys deda.";
      }
      api.note(note);
    }

    whoBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (phase === "build") {
          api.note("Palauk, kol baigsime.");
          return;
        }
        skipped = btn.dataset.who || null;
        guess = null;
        runGuess = null;
        clearScene();
        updateWho();
        updateGuess();
        const k = kidById(skipped);
        api.readout(SENT.ask || "Kas nutiks?");
        api.note(k ? `${k.name} nustoja dėti.` : "Visi trys deda.");
      });
    });

    guessBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (phase === "build") {
          api.note("Palauk, kol baigsime.");
          return;
        }
        guess = btn.dataset.guess;
        runGuess = null;
        if (outcome) {
          clearScene();
          api.readout(SENT.ask || "Kas nutiks?");
        }
        updateWhoDisabled();
        updateGuess();
        api.note("Dabar spausk „Statyti“.");
      });
    });

    buildBtn.addEventListener("click", () => {
      if (phase === "build") {
        api.note("Palauk, kol baigsime.");
        return;
      }
      if (!guess) {
        api.note("Pirma pasirink, kas nutiks.");
        guessBtns[0].focus();
        return;
      }
      startBuild();
    });

    resetBtn.addEventListener("click", () => {
      skipped = null;
      guess = null;
      runGuess = null;
      clearScene();
      updateWho();
      updateGuess();
      api.readout(SENT.ask || "Kas nutiks?");
      api.note("Pasirink, kas nustoja dėti, ir spėk.");
    });

    updateWho();
    updateGuess();
    render();
    api.readout(SENT.ask || "Ar bokštas bus baigtas? Pirma spėk, tada statyk.");
    api.note("Pasirink, kas nustoja dėti, ir spėk.");

    return () => clearTimer();
  },
};

export const SIMS = {
  "susitarimo-bokstas": susitarimoBokstas,
};
