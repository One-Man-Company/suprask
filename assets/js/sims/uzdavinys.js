/**
 * Uždavinio simuliacijos (1 klasė): klausimas renka veiksmą.
 *
 * Modelio idėja: paveikslėlis ir skaičiai NESIKEIČIA — keičiasi tik klausimas.
 * Vaikas pasirenka klausimą („Kiek liko?“, „Kiek iš viso?“, „Kiek nuskrido?“),
 * tada pasirenka veiksmą (sudėti, atimti, nereikia), ir pamato, ar jo spėjimas
 * atitinka klausimą. Spėjimas lieka matomas greta rezultato (LL-15): jo
 * nepakeičia nei kitas klausimas, nei naujas bandymas, kol vaikas nepasirenka
 * pats.
 *
 * Klaidinga nuostata (LL-28): „veiksmą pasako skaičiai“ — vaikas, išgirdęs
 * 8 ir 3, visada atima arba suda, taip pat ir tada, kai klausiama apie tai, kas
 * sąlygoje jau pasakyta. Trečiasis klausimas („Kiek nuskrido?“) yra tas
 * prieštaraujantis pavyzdys: teisingas veiksmas — jokio.
 *
 * Scena surenkama iš `art.js` dalių (LL-13): art.defs/sun/cloud/hills/plank/
 * grass ir art.bird — atpažįstamas paukštis, kurį galima suskaičiuoti.
 */

import { art } from "./art.js";

const QUESTION_KEYS = ["liko", "viso", "nuskrido"];
const ACTION_KEYS = ["sudeti", "atimti", "pasakyta"];

const ACTION_LABEL = {
  sudeti: "Sudėti (+)",
  atimti: "Atimti (−)",
  pasakyta: "Jau pasakyta",
};

/* Kuris veiksmas atsako į kurį klausimą. Tai vienintelė taisyklė, kurią
   modelis moko: klausimas, o ne skaičiai, pasirenka veiksmą. */
const CORRECT = {
  liko: "atimti",
  viso: "sudeti",
  nuskrido: "pasakyta",
};

const CHIP_LABEL = { liko: "Liko", viso: "Iš viso", nuskrido: "Nuskrido" };

const klausimasRenkaVeiksma = {
  mount({ stage, controls, api, config }) {
    const S = config.sentences || {};
    const TOTAL = Number(config.total) || 8;
    const STAY = Number(config.stay) || 5;
    const FLY = Number(config.fly) || 3;
    const ANSWER = { liko: STAY, viso: TOTAL, nuskrido: FLY };

    let q = null;        // pasirinktas klausimas
    let a = null;        // paskutinis pasirinktas veiksmas
    const solved = new Set();  // kuriems klausimams jau rastas teisingas veiksmas
    let reported = false;

    stage.innerHTML = `
      <div style="width:100%;max-width:30rem;margin:0 auto;min-width:0">
        <p id="uk-story" class="sim-note"
           style="margin:0 0 .35rem;text-align:center;font-weight:800;font-size:.95rem;line-height:1.3"></p>
        <svg id="uk-scene" viewBox="0 0 360 240" width="100%" role="img"
             style="display:block;width:100%;height:auto"></svg>
        <p id="uk-eq"
           style="margin:.55rem 0 .1rem;text-align:center;font-family:var(--font-head);font-weight:900;font-size:1.35rem;line-height:1.15;min-height:1.6rem"></p>
        <p id="uk-guess" class="sim-note" style="margin:0;text-align:center;min-height:1.3rem"></p>
        <div id="uk-chips" style="display:flex;gap:.35rem;justify-content:center;flex-wrap:wrap;margin-top:.45rem"></div>
      </div>`;

    controls.innerHTML = `
      <div style="width:100%;max-width:30rem;margin:0 auto;display:grid;gap:.55rem;min-width:0">
        <div style="min-width:0">
          <span class="sim-note" style="display:block;font-weight:800;margin-bottom:.2rem">1. Pasirink klausimą</span>
          <div id="uk-qs" role="group" aria-label="Klausimas" style="display:grid;gap:.35rem;min-width:0"></div>
        </div>
        <div style="min-width:0">
          <span class="sim-note" style="display:block;font-weight:800;margin-bottom:.2rem">2. Ką darysi?</span>
          <div id="uk-as" role="group" aria-label="Veiksmas"
               style="display:grid;grid-template-columns:repeat(auto-fit,minmax(7.5rem,1fr));gap:.35rem;min-width:0"></div>
        </div>
        <button type="button" class="btn ghost" id="uk-reset" style="min-height:48px">Iš naujo</button>
      </div>`;

    const svgEl = stage.querySelector("#uk-scene");
    const storyEl = stage.querySelector("#uk-story");
    const eqEl = stage.querySelector("#uk-eq");
    const guessEl = stage.querySelector("#uk-guess");
    const chipsEl = stage.querySelector("#uk-chips");
    const qBox = controls.querySelector("#uk-qs");
    const aBox = controls.querySelector("#uk-as");

    storyEl.textContent = S.story || "";

    /* --- klausimų ir veiksmų mygtukai --------------------------------- */
    qBox.innerHTML = QUESTION_KEYS.map((key) => `
      <button type="button" class="btn secondary uk-q" data-key="${key}" aria-pressed="false"
              aria-label="${S[`q-${key}`] || key}"
              style="min-height:48px;width:100%;text-align:left;line-height:1.2">
        ${S[`q-${key}`] || key}
      </button>`).join("");

    aBox.innerHTML = ACTION_KEYS.map((key) => `
      <button type="button" class="btn secondary uk-a" data-key="${key}" aria-pressed="false"
              style="min-height:48px;width:100%;min-width:0;padding:.3rem .4rem;font-size:.95rem">
        ${ACTION_LABEL[key]}
      </button>`).join("");

    /* --- piešimas ------------------------------------------------------ */
    function focusKey() {
      if (!q || !a) return "both";
      if (CORRECT[q] !== a) return "both";
      if (q === "liko") return "sit";
      if (q === "nuskrido") return "fly";
      return "both";
    }

    function scene() {
      const focus = focusKey();
      const sitOp = focus === "fly" ? 0.32 : 1;
      const flyOp = focus === "sit" ? 0.32 : 1;
      svgEl.setAttribute("aria-label",
        `Ant tvoros sėdi ${STAY} paukščiai, virš jos skrenda ${FLY}.`);
      svgEl.innerHTML = `
        ${art.defs("uk")}
        <rect x="0" y="0" width="360" height="240" rx="16" fill="url(#uk-sky)"/>
        ${art.sun(308, 42, 16, "uk")}
        ${art.cloud(70, 44, 1)}
        ${art.cloud(178, 26, 0.7, 0.85)}
        ${art.hills(360, 176)}
        ${art.grass(34, 232, 1.1)}
        ${art.grass(330, 236, 0.95)}
        ${art.grass(190, 238, 0.8)}
        <g opacity="${sitOp}">
          ${art.plank(52, 234, 56, 11, 90)}
          ${art.plank(308, 234, 56, 11, 90)}
          ${art.plank(18, 196, 324, 12)}
          ${[92, 146, 200, 254, 300].map((x) => art.bird(x, 184, 0.95, "sedi")).join("")}
        </g>
        <g opacity="${flyOp}">
          ${art.bird(148, 96, 0.8, "skrenda")}
          ${art.bird(212, 66, 0.72, "skrenda")}
          ${art.bird(284, 104, 0.66, "skrenda")}
        </g>`;
    }

    function numbersFor(actionKey) {
      if (actionKey === "sudeti") return `${STAY} + ${FLY} = ${TOTAL}`;
      if (actionKey === "atimti") return `${TOTAL} − ${FLY} = ${STAY}`;
      return "—";
    }

    function paintChips() {
      chipsEl.innerHTML = QUESTION_KEYS.map((key) => {
        const known = solved.has(key);
        const value = known ? String(ANSWER[key]) : "?";
        const on = known ? "background:var(--paper-2);border-color:var(--line)" : "";
        return `<span style="display:inline-flex;align-items:center;gap:.3rem;padding:.2rem .55rem;
          border:2px solid var(--line);border-radius:999px;font-size:.85rem;font-weight:700;${on}">
          ${CHIP_LABEL[key]}: <strong>${value}</strong></span>`;
      }).join("");
    }

    function markButtons() {
      controls.querySelectorAll(".uk-q").forEach((btn) => {
        const on = btn.dataset.key === q;
        btn.setAttribute("aria-pressed", String(on));
        btn.className = on ? "btn uk-q" : "btn secondary uk-q";
      });
      controls.querySelectorAll(".uk-a").forEach((btn) => {
        const on = btn.dataset.key === a;
        btn.setAttribute("aria-pressed", String(on));
        btn.className = on ? "btn uk-a" : "btn secondary uk-a";
      });
    }

    function paint() {
      scene();
      markButtons();
      paintChips();
      eqEl.textContent = a ? numbersFor(a) : "";
      guessEl.textContent = a ? `${S.guess || ""} ${ACTION_LABEL[a]}`.trim() : "";
      if (q && a) {
        api.readout(`Klausimas: ${S[`q-${q}`] || ""} Tavo spėjimas: ${ACTION_LABEL[a]}.`);
      } else {
        api.readout(S.ask || "");
      }
    }

    /* --- veiksmai ------------------------------------------------------ */
    function evaluate() {
      const line = S[`${q}-${a}`] || "";
      if (CORRECT[q] === a) solved.add(q);
      paint();
      if (line) {
        api.note(line);
        api.speak(line);
      }
      if (solved.size === QUESTION_KEYS.length && !reported) {
        reported = true;
        api.progress({ correct: true });
        if (S.done) {
          api.note(`${line} ${S.done}`.trim());
          api.speak(S.done);
        }
      }
    }

    qBox.querySelectorAll(".uk-q").forEach((btn) => {
      btn.addEventListener("click", () => {
        q = btn.dataset.key;
        a = null;
        paint();
        api.note(S.ask || "");
      });
    });

    aBox.querySelectorAll(".uk-a").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!q) {
          /* Niekas neužrakinta (LL-04): pasakome, ko trūksta, o ne tyliai
             nieko neįvykdome. */
          if (S.pickQuestion) {
            api.note(S.pickQuestion);
            api.speak(S.pickQuestion);
          }
          return;
        }
        a = btn.dataset.key;
        evaluate();
      });
    });

    controls.querySelector("#uk-reset").addEventListener("click", () => {
      q = null;
      a = null;
      solved.clear();
      paint();
      if (S.reset) {
        api.note(S.reset);
        api.speak(S.reset);
      }
    });

    paint();
    api.note(S.ask || "");
    api.speak(S.story || "");
    return null;
  },
};

export const SIMS = {
  "klausimas-renka-veiksma": klausimasRenkaVeiksma,
};
