/**
 * Technologijų simuliacijos (1 klasė).
 *
 * Principas: elektros srovės nepiešiame ir neanimuojame. Tyrimai (Chiu & Lin,
 * 2005; Lin, 2017) rodo, kad maži vaikai dažniausiai laikosi „vienpolio“
 * modelio — elektra vienu laidu nueina nuo baterijos iki lemputės, todėl
 * antrasis laidas atrodo nereikalingas. Judantis „srautas“ ekrane tik
 * sustiprintų nuostatą, kad elektra yra matoma medžiaga. Todėl grįžtamąjį ryšį
 * duoda lemputė, o kelio vientisumą — pati linija: ištisa arba su pertrauka.
 */

import { art } from "./art.js";

const STYLE_ID = "cc-elektros-style";

const CSS = `
.cc-board {
  position: relative;
  width: 100%;
  max-width: 420px;
  height: 214px;
  margin: 0 auto;
  border-radius: var(--r-m);
  background: var(--paper);
  background: color-mix(in srgb, var(--sky) 7%, var(--paper-2));
}
.cc-part {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 76px;
  height: 96px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 6px 4px;
  border: 3px solid var(--ink);
  border-radius: 12px;
  background: var(--paper-2);
  text-align: center;
}
.cc-battery { left: 0; }
.cc-lamp { right: 0; }
.cc-sign { font-size: 1.15rem; font-weight: 900; line-height: 1; color: var(--ink); }
.cc-name { font-size: .8rem; font-weight: 800; line-height: 1.15; color: var(--ink-soft); }
.cc-bulb {
  display: block;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 3px solid var(--ink);
  background: var(--paper);
}
.cc-lamp.is-on .cc-bulb {
  background: var(--sun);
  box-shadow: 0 0 0 6px color-mix(in srgb, var(--sun) 38%, transparent),
              0 0 18px 6px color-mix(in srgb, var(--sun) 45%, transparent);
}
.cc-wire {
  position: absolute;
  left: 64px;
  right: 64px;
  height: 48px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
}
.cc-wire:focus-visible,
.cc-switch:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
#cc-top { top: 35px; }
#cc-bottom { top: 131px; }
/*
 * Gnybtai. Keturi kontaktai ten, kur laidas susitinka su baterija ir lempute:
 * viršuje prie baterijos pliuso, apačioje prie minuso, ir abu lemputės šone.
 * Prijungtas gnybtas užpildytas, neprijungtas — tuščias žiedas. Todėl vaikas
 * mato NE TIK kad laido nėra, bet ir KURIOJE VIETOJE kelias atviras, o
 * informaciją neša ir forma, ir tekstas, ne vien spalva.
 */
.cc-term {
  position: absolute;
  width: 14px;
  height: 14px;
  box-sizing: border-box;
  border: 2px solid var(--ink);
  border-radius: 50%;
  background: var(--paper);
  pointer-events: none;
  transition: background-color .18s ease;
}
.cc-term.is-on { background: var(--ink); }
.cc-term.t-bat { left: 69px; }
.cc-term.t-lamp { right: 69px; }
.cc-term.t-top { top: 52px; }
.cc-term.t-bot { top: 148px; }
.cc-bar {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 9px;
  border-radius: 5px;
  background: var(--ink);
  transition: left .18s ease, right .18s ease;
}
/*
 * Prijungtas laidas baigiasi ties gnybtu (18 px nuo laido dėžės krašto).
 * Neprijungtas atsitraukia iki 34 px, todėl tarpas tarp gnybto ir laido yra
 * 15 px — matoma pertrauka, o ne 10 px „beveik liečia“ (kritiko radinys #41:
 * laidas liečia lemputę, o tekstas sako „neateina“).
 */
.cc-whole { left: 18px; right: 18px; }
.cc-half-l { left: 18px; right: calc(50% + 28px); }
.cc-half-r { left: calc(50% + 28px); right: 18px; }
.cc-wire.is-off .cc-whole { left: 34px; right: 34px; }
.cc-wire.is-off .cc-half-l { left: 34px; }
.cc-wire.is-off .cc-half-r { right: 34px; }
.cc-wire.is-off .cc-bar {
  background: repeating-linear-gradient(90deg, var(--ink-faint) 0 9px, transparent 9px 15px);
}
.cc-switch {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 131px;
  width: 56px;
  height: 48px;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
}
.cc-pivot {
  position: absolute;
  left: 0;
  top: 50%;
  width: 12px;
  height: 12px;
  margin-top: -6px;
  border-radius: 50%;
  background: var(--ink);
}
.cc-lever {
  position: absolute;
  left: 6px;
  right: 6px;
  top: 50%;
  height: 9px;
  border-radius: 5px;
  background: var(--accent);
  transform-origin: 0 50%;
  transform: translateY(-50%);
  transition: transform .18s ease;
}
.cc-switch.is-open .cc-lever { transform: translateY(-50%) rotate(-34deg); }
/* Jungiklis yra apatiniame laide. Kai tas laidas neprijungtas, svirtis
   braižoma ta pačia brūkšniuota linija kaip trūkstamas laidas — kitaip
   valdiklis atrodo esąs kelyje, kurio nėra. */
.cc-switch.is-off .cc-lever {
  background: repeating-linear-gradient(90deg, var(--ink-faint) 0 6px, transparent 6px 11px);
}
.cc-switch-name {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 184px;
  font-size: .8rem;
  font-weight: 800;
  color: var(--ink-soft);
  white-space: nowrap;
}
@media (prefers-reduced-motion: reduce) {
  .cc-bar, .cc-lever, .cc-term { transition: none; }
}
`;

const DEFAULT_SAY = {
  pradzia: "Pradedam. Prijunk laidus ir pažiūrėk, ar lemputė šviečia.",
  "nera-laido": "Nė vieno laido. Kelias visai nutrūkęs.",
  // Sakinys turi atitikti paveikslą (LL-13): su vienu laidu jis TIKRAI liečia
  // ir bateriją, ir lemputę, todėl „iki lemputės neateina“ buvo netiesa.
  // Tiesą pasako tai, ko trūksta: kito laido nėra, todėl kelias neužsidaro.
  "vienas-virsutinis": "Viršutinis laidas yra. Apatinio nėra, todėl kelias neužsidaro.",
  "vienas-apatinis": "Apatinis laidas yra. Viršutinio nėra, todėl kelias neužsidaro.",
  jungiklis: "Abu laidai prijungti. Jungiklis atidarytas, todėl kelias nutrūkęs.",
  sviecia: "Kelias vientisas. Lemputė šviečia.",
  "is-naujo": "Pradedam iš naujo. Prijunk laidus.",
};

const NOTES = {
  "nera-laido": "Bakstelėk laidą — jis prisijungs prie baterijos ir lemputės.",
  "vienas-virsutinis": "Kelias turi sugrįžti. Prijunk apatinį laidą.",
  "vienas-apatinis": "Kelias turi sugrįžti. Prijunk viršutinį laidą.",
  jungiklis: "Jungiklis yra tame pačiame kelyje. Uždaryk jį ir lemputė vėl švies.",
  sviecia: "Dabar atidaryk jungiklį ir pažiūrėk, kas nutiks keliui.",
};

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

const elektrosGrandine = {
  mount({ stage, controls, api, config }) {
    ensureStyle();

    const say = config.sentences || {};
    const line = (key) => say[key] || DEFAULT_SAY[key] || "";

    stage.innerHTML = `
      <div class="cc-board" id="cc-board" role="group" aria-label="Baterija ir lemputė, sujungtos dviem laidais">
        <div class="cc-part cc-battery" role="img" aria-label="Baterija su pliuso ir minuso galais">
          <span class="cc-sign" aria-hidden="true">+</span>
          <span class="cc-name">Baterija</span>
          <span class="cc-sign" aria-hidden="true">−</span>
        </div>
        <div class="cc-part cc-lamp" id="cc-lamp" role="img" aria-label="Lemputė nešviečia">
          <span class="cc-bulb" aria-hidden="true"></span>
          <span class="cc-name">Lemputė</span>
        </div>
        <span class="cc-term t-bat t-top" id="cc-t-bat-top" aria-hidden="true"></span>
        <span class="cc-term t-bat t-bot" id="cc-t-bat-bot" aria-hidden="true"></span>
        <span class="cc-term t-lamp t-top" id="cc-t-lamp-top" aria-hidden="true"></span>
        <span class="cc-term t-lamp t-bot" id="cc-t-lamp-bot" aria-hidden="true"></span>
        <button type="button" class="cc-wire is-off" id="cc-top" aria-pressed="false">
          <span class="cc-bar cc-whole" aria-hidden="true"></span>
        </button>
        <button type="button" class="cc-wire is-off" id="cc-bottom" aria-pressed="false">
          <span class="cc-bar cc-half-l" aria-hidden="true"></span>
          <span class="cc-bar cc-half-r" aria-hidden="true"></span>
        </button>
        <button type="button" class="cc-switch" id="cc-switch" aria-pressed="true">
          <span class="cc-pivot" aria-hidden="true"></span>
          <span class="cc-lever" aria-hidden="true"></span>
        </button>
        <span class="cc-switch-name" aria-hidden="true">Jungiklis</span>
      </div>`;

    controls.innerHTML = `<button type="button" class="btn ghost" id="cc-reset">Iš naujo</button>`;

    const topBtn = stage.querySelector("#cc-top");
    const bottomBtn = stage.querySelector("#cc-bottom");
    const switchBtn = stage.querySelector("#cc-switch");
    const lamp = stage.querySelector("#cc-lamp");
    const board = stage.querySelector("#cc-board");
    const terms = {
      topBat: stage.querySelector("#cc-t-bat-top"),
      topLamp: stage.querySelector("#cc-t-lamp-top"),
      botBat: stage.querySelector("#cc-t-bat-bot"),
      botLamp: stage.querySelector("#cc-t-lamp-bot"),
    };

    // Būsena: du laidai (prijungtas / nuimtas) ir jungiklis (uždarytas / atidarytas).
    let top = false;
    let bottom = false;
    let closed = true;
    let litOnce = false;
    let lastSpoken = "";

    function stateKey() {
      if (!top && !bottom) return "nera-laido";
      if (top !== bottom) return top ? "vienas-virsutinis" : "vienas-apatinis";
      return closed ? "sviecia" : "jungiklis";
    }

    function label(btn, name, on, onWord, offWord) {
      btn.setAttribute("aria-pressed", String(on));
      btn.setAttribute(
        "aria-label",
        `${name}. ${on ? onWord : offWord}. Bakstelėk, kad ${on ? "nuimtum" : "prijungtum"}.`,
      );
    }

    function render() {
      const key = stateKey();
      const lit = key === "sviecia";

      topBtn.classList.toggle("is-off", !top);
      bottomBtn.classList.toggle("is-off", !bottom);
      switchBtn.classList.toggle("is-open", !closed);
      // Jungiklis guli apatiniame laide: kai laido nėra, jo svirtis irgi
      // braižoma kaip trūkstama, kad valdiklis nekviestų spausti kelio,
      // kurio nėra (LL-04, LL-13). Tokiu metu jis ir negaudo paspaudimų —
      // kitaip vidurinė apatinio laido dalis būtų akla zona: vaikas nori
      // prijungti laidą, o paliečia jungiklį ir nieko neįvyksta.
      switchBtn.classList.toggle("is-off", !bottom);
      switchBtn.style.pointerEvents = bottom ? "" : "none";
      lamp.classList.toggle("is-on", lit);

      terms.topBat.classList.toggle("is-on", top);
      terms.topLamp.classList.toggle("is-on", top);
      terms.botBat.classList.toggle("is-on", bottom);
      terms.botLamp.classList.toggle("is-on", bottom);

      label(topBtn, "Viršutinis laidas", top, "Prijungtas", "Neprijungtas");
      label(bottomBtn, "Apatinis laidas", bottom, "Prijungtas", "Neprijungtas");
      switchBtn.setAttribute("aria-pressed", String(closed));
      switchBtn.setAttribute(
        "aria-label",
        !bottom
          ? "Jungiklis. Apatinis laidas neprijungtas, todėl jungiklis kelyje nedalyvauja."
          : closed
            ? "Jungiklis. Uždarytas: kelias vientisas. Bakstelėk, kad atidarytum."
            : "Jungiklis. Atidarytas: kelias nutrūkęs. Bakstelėk, kad uždarytum.",
      );
      lamp.setAttribute("aria-label", lit ? "Lemputė šviečia" : "Lemputė nešviečia");
      board.setAttribute(
        "aria-label",
        `Baterija kairėje, lemputė dešinėje. Viršutinis laidas ${top ? "prijungtas" : "neprijungtas"}. `
          + `Apatinis laidas ${bottom ? "prijungtas" : "neprijungtas"}. `
          + `Jungiklis ${closed ? "uždarytas" : "atidarytas"}. Lemputė ${lit ? "šviečia" : "nešviečia"}.`,
      );

      api.readout(line(key));
      api.note(NOTES[key] || "");

      if (key !== lastSpoken) {
        lastSpoken = key;
        api.speak(line(key));
      }

      // Rezultatas — užsidegusi lemputė, o ne kiekvienas prisilietimas.
      if (lit && !litOnce) {
        litOnce = true;
        api.progress({ correct: true });
      }
    }

    function touch(fn) {
      fn();
      lastSpoken = "";
      render();
    }

    topBtn.addEventListener("click", () => touch(() => { top = !top; }));
    bottomBtn.addEventListener("click", () => touch(() => { bottom = !bottom; }));
    switchBtn.addEventListener("click", () => touch(() => { closed = !closed; }));

    controls.querySelector("#cc-reset").addEventListener("click", () => {
      top = false;
      bottom = false;
      closed = true;
      lastSpoken = "nera-laido";
      render();
      const text = line("is-naujo");
      lastSpoken = "is-naujo";
      api.readout(text);
      api.note(NOTES["nera-laido"]);
      api.speak(text);
    });

    // Pirmas ekrano tekstas kviečia veikti, o ne aprašo būseną.
    // Garsas paleidžiamas tik po pirmo vaiko prisilietimo, ne įkeliant modulį.
    lastSpoken = stateKey();
    render();
    api.readout(line("pradzia"));
    api.note(NOTES["nera-laido"]);

    return null;
  },
};

/* ------------------------------------------------------------------ */
/* Medžiagų bandymas: kuri kaladėlė plauks?                            */
/*                                                                     */
/* Kodėl toks modelis: tyrimai rodo, kad 6–8 m. vaikas plaukimą       */
/* aiškina svoriu („plaukia, nes lengva“), o tankio idėja susiformuoja */
/* tik apie 9 m. (Inhelder & Piaget; Schwichow & Zoupidis, 2024).      */
/* Todėl ekrane nėra nei tankio, nei žodžių „lengva/sunku“: pirma —     */
/* trys VIENODO dydžio kaladėlės, paskui — sunkesnė medinė ir lengvesnė */
/* metalinė. Abu kartus rezultatą parodo pats bandymas, o ne tekstas.   */
/* ------------------------------------------------------------------ */

const MB_STYLE_ID = "cc-medziagos-style";

const MB_CSS = `
.mb-scene {
  display: block;
  width: 100%;
  max-width: 420px;
  height: auto;
  margin: 0 auto;
  border-radius: var(--r-m);
  background: var(--paper-2);
}
.mb-shelf {
  flex: 1 1 100%;
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  justify-content: center;
  margin: 0 0 .6rem;
}
.mb-block {
  flex: 1 1 6.2rem;
  min-width: 5.4rem;
  min-height: 88px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: .15rem;
  padding: .3rem .35rem .4rem;
  border: 2px solid var(--line);
  border-radius: var(--r-s);
  background: var(--paper-2);
  color: var(--ink);
  font: inherit;
  font-size: .92rem;
  font-weight: 800;
  line-height: 1.15;
  text-align: center;
  cursor: pointer;
}
.mb-block svg { width: 48px; height: 48px; }
.mb-block.is-picked {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 34%, transparent);
}
.mb-block.is-in { border-style: dashed; color: var(--ink-soft); }
.mb-block:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.mb-block[hidden] { display: none; }
.mb-actions {
  flex: 1 1 100%;
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  justify-content: center;
}
.mb-actions .btn { min-height: 48px; }
`;

const MB_FLOOR = 236; // lovelio dugno vidus (kaladėlės apačia)

const MB_SAY = {
  pradzia: "Trys vienodo dydžio kaladėlės. Kuri plauks?",
  spejimas: "Spėjimas įrašytas. Spausk „Nuleisk į vandenį“.",
  "medis-plaukia": "Medis plaukia.",
  "akmuo-dugne": "Akmuo dugne.",
  "metalas-dugne": "Metalas dugne.",
  "visos-istirtos": "Visos trys vandenyje. Medis plaukia, akmuo ir metalas dugne.",
  "antra-dalis": "Dvi naujos kaladėlės. Didelė medinė ir maža metalinė.",
  pasverta: "Didelis medis sunkesnis už mažą metalą.",
  "didelis-medis-plaukia": "Didelis medis plaukia.",
  "mazas-metalas-dugne": "Mažas metalas dugne.",
  baigta: "Sunkesnis medis plaukia. Lengvesnis metalas dugne.",
  "is-naujo": "Pradedam iš naujo. Trys vienodo dydžio kaladėlės.",
};

function ensureMbStyle() {
  if (document.getElementById(MB_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = MB_STYLE_ID;
  style.textContent = MB_CSS;
  document.head.appendChild(style);
}

const medziaguBandymas = {
  mount({ stage, controls, api, config }) {
    ensureMbStyle();

    const say = config.sentences || {};
    const line = (key) => say[key] || MB_SAY[key] || "";

    // P1 — trys vienodo dydžio kaladėlės. P2 — didelė medinė ir maža metalinė.
    const P1 = [
      { id: "medis", kind: "medis", label: "Medis", s: 44, cx: 88, floats: true, key: "medis-plaukia" },
      { id: "akmuo", kind: "akmuo", label: "Akmuo", s: 44, cx: 170, floats: false, key: "akmuo-dugne" },
      { id: "metalas", kind: "metalas", label: "Metalas", s: 44, cx: 252, floats: false, key: "metalas-dugne" },
    ];
    const P2 = [
      { id: "didelis-medis", kind: "medis", label: "Didelis medis", s: 54, cx: 106, floats: true, key: "didelis-medis-plaukia" },
      { id: "mazas-metalas", kind: "metalas", label: "Mažas metalas", s: 32, cx: 234, floats: false, key: "mazas-metalas-dugne" },
    ];

    let phase = 1;
    let picked = null;
    let inWater = [];
    let weighed = false;
    let reported = false;

    stage.innerHTML = `<svg class="mb-scene" id="mb-scene" viewBox="0 0 340 280" role="img" aria-label="Lovelis su vandeniu"></svg>`;
    controls.innerHTML = `
      <div class="mb-shelf" id="mb-shelf"></div>
      <div class="mb-actions">
        <button type="button" class="btn secondary" id="mb-weigh" hidden>Pasverk</button>
        <button type="button" class="btn" id="mb-drop">Nuleisk į vandenį</button>
        <button type="button" class="btn ghost" id="mb-next" hidden>Kitos kaladėlės</button>
        <button type="button" class="btn ghost" id="mb-reset">Iš naujo</button>
      </div>`;

    const scene = stage.querySelector("#mb-scene");
    const shelf = controls.querySelector("#mb-shelf");
    const weighBtn = controls.querySelector("#mb-weigh");
    const nextBtn = controls.querySelector("#mb-next");
    const list = () => (phase === 1 ? P1 : P2);

    /* Kubo centras `cx` — visos silueto (su šonu) pločio vidurys. */
    const cube = (kind, cx, topY, s) => art.materialCube(kind, cx - s * 0.65, topY, s);

    function paintScene() {
      // Vandens paviršius: pirmoje dalyje lovelis pilnesnis, antroje — žemesnis,
      // kad virš jo tilptų svertas.
      const water = phase === 1 ? 188 : 196;
      const tilt = phase === 2 && weighed ? -6 : 0;
      const beamY = (x) => 104 + Math.tan((tilt * Math.PI) / 180) * (x - 170);

      const cubes = list().map((b) => {
        if (inWater.includes(b.id)) {
          const bottom = b.floats ? water + 2 : MB_FLOOR;
          return cube(b.kind, b.cx, bottom - b.s, b.s);
        }
        if (phase === 2) return cube(b.kind, b.cx, beamY(b.cx) - b.s, b.s);
        return "";
      }).join("");

      const seesaw = phase === 2
        ? `${art.flatShape("trikampis", 170, 125, 30)}
           <g transform="rotate(${tilt} 170 104)">${art.plank(40, 111, 260, 7)}</g>`
        : "";

      scene.innerHTML = `${art.defs("mb")}
        ${seesaw}
        ${art.plank(0, 262, 340, 14)}
        ${art.plank(18, 250, 312, 12)}
        ${art.plank(30, 250, 80, 12, 90)}
        ${art.plank(330, 250, 80, 12, 90)}
        ${art.river(30, water, 288, 238 - water, "mb")}
        ${cubes}`;

      const wet = list().filter((b) => inWater.includes(b.id))
        .map((b) => `${b.label} ${b.floats ? "plaukia" : "dugne"}`);
      const dry = list().filter((b) => !inWater.includes(b.id)).map((b) => b.label);
      const parts = [phase === 1 ? "Lovelis su vandeniu." : "Svertas ir lovelis su vandeniu."];
      if (dry.length) parts.push(`${phase === 1 ? "Ant stalo" : "Ant sverto"}: ${dry.join(", ")}.`);
      parts.push(wet.length ? `Vandenyje: ${wet.join(", ")}.` : "Vandenyje dar nieko.");
      scene.setAttribute("aria-label", parts.join(" "));
    }

    function buildShelf() {
      shelf.innerHTML = list().map((b) => `
        <button type="button" class="mb-block" id="mb-b-${b.id}">
          <svg viewBox="0 0 64 64" aria-hidden="true">${art.materialCube(b.kind, 3, 15, 44)}</svg>
          <span>${b.label}</span>
        </button>`).join("");
      list().forEach((b) => {
        shelf.querySelector(`#mb-b-${b.id}`).addEventListener("click", () => pickBlock(b.id));
      });
      paintShelf();
    }

    function paintShelf() {
      list().forEach((b) => {
        const btn = shelf.querySelector(`#mb-b-${b.id}`);
        if (!btn) return;
        const isPicked = picked === b.id;
        const isIn = inWater.includes(b.id);
        btn.classList.toggle("is-picked", isPicked);
        btn.classList.toggle("is-in", isIn);
        btn.setAttribute("aria-pressed", String(isPicked));
        btn.setAttribute("aria-label",
          isIn
            ? `${b.label}. Jau vandenyje. ${b.floats ? "Plaukia." : "Dugne."}`
            : `${b.label}. Bakstelėk, jei spėji, kad plauks.`);
      });
    }

    function focusWeigh() {
      weighBtn.hidden = false;
      weighBtn.focus();
    }

    function pickBlock(id) {
      const b = list().find((x) => x.id === id);
      if (!b) return;
      if (inWater.includes(id)) {
        api.readout(`${b.label}: ${b.floats ? "plaukia" : "dugne"}.`);
        api.note("Ši kaladėlė jau vandenyje. Pasirink kitą.");
        api.speak(line(b.key));
        return;
      }
      if (phase === 2 && !weighed) {
        api.readout("Pirma pasverk abi kaladėles.");
        api.note("Svertas parodys, kuri sunkesnė. Tada spėk.");
        focusWeigh();
        return;
      }
      picked = id;
      paintShelf();
      api.readout(`Spėji, kad ${b.label.toLowerCase()} plauks.`);
      api.note("Dabar spausk „Nuleisk į vandenį“.");
      api.speak(line("spejimas"));
    }

    function drop() {
      if (picked === null) {
        const left = list().filter((x) => !inWater.includes(x.id)).length;
        if (left === 0) {
          // Nuleisti nebėra ko: mygtukas lieka vietoje, bet pasako, kur eiti toliau
          // (LL-04 — užrakintas ar „tuščias“ valdiklis turi paaiškinti).
          api.readout(phase === 1 ? line("visos-istirtos") : line("baigta"));
          api.note(phase === 1
            ? "Spausk „Kitos kaladėlės“."
            : "Spausk „Iš naujo“, jei nori kartoti bandymą.");
          return;
        }
        api.readout("Pirma bakstelėk kaladėlę.");
        api.note("Pasirink tą, kuri, tavo manymu, plauks.");
        const any = shelf.querySelector(".mb-block");
        if (any) any.focus();
        return;
      }
      const b = list().find((x) => x.id === picked);
      picked = null;
      inWater.push(b.id);
      paintScene();
      paintShelf();

      const left = list().filter((x) => !inWater.includes(x.id)).length;
      const result = b.floats ? `${b.label} plaukia.` : `${b.label} nusileido į dugną.`;

      if (left > 0) {
        api.readout(`${result} Liko ${left === 1 ? "viena kaladėlė" : "dar dvi kaladėlės"}.`);
        api.note(b.floats
          ? "Spėjai teisingai. Bakstelėk kitą kaladėlę."
          : "Spėjai, kad plauks. Įvyko kitaip. Bakstelėk kitą.");
        api.speak(line(b.key));
        return;
      }

      if (phase === 1) {
        api.readout(line("visos-istirtos"));
        api.note("Visos trys vienodo dydžio, o plaukia viena. Pažiūrėk, kuri.");
        api.speak(line("visos-istirtos"));
        nextBtn.hidden = false;
        nextBtn.focus();
        return;
      }

      api.readout(line("baigta"));
      api.note("Svoris nepasakė, kuri plauks. Tai parodė bandymas.");
      api.speak(line("baigta"));
      // Rezultatas — abu bandymai, o ne pirmas nuleidimas (LL-29).
      if (!reported) {
        reported = true;
        api.progress({ correct: true });
      }
    }

    function weigh() {
      weighed = true;
      paintScene();
      api.readout(line("pasverta"));
      api.note("Svertas nusviro į medinę pusę. Dabar spėk, kuri plauks.");
      api.speak(line("pasverta"));
    }

    function next() {
      phase = 2;
      picked = null;
      inWater = [];
      weighed = false;
      nextBtn.hidden = true;
      buildShelf();
      paintScene();
      api.readout(line("antra-dalis"));
      api.note("Pirma spausk „Pasverk“.");
      api.speak(line("antra-dalis"));
      focusWeigh();
    }

    function reset() {
      phase = 1;
      picked = null;
      inWater = [];
      weighed = false;
      nextBtn.hidden = true;
      weighBtn.hidden = true;
      buildShelf();
      paintScene();
      api.readout(line("is-naujo"));
      api.note("Bakstelėk kaladėlę, kurią nori nuleisti.");
      api.speak(line("is-naujo"));
    }

    controls.querySelector("#mb-drop").addEventListener("click", drop);
    weighBtn.addEventListener("click", weigh);
    nextBtn.addEventListener("click", next);
    controls.querySelector("#mb-reset").addEventListener("click", reset);

    buildShelf();
    paintScene();
    api.readout(line("pradzia"));
    api.note("Bakstelėk kaladėlę, kurią nori nuleisti.");

    return null;
  },
};

/* ------------------------------------------------------------------ */
/* Lankstymas ir karpiniai: vienas kirpimas, kelios skylės             */
/*                                                                     */
/* Kodėl toks modelis: 23.3.1 sritis praktinę veiklą įvardija          */
/* tiesiogiai („popieriaus plastikos gaminiai: karpiniai,              */
/* lankstiniai“), todėl ekrane kartojama ta pati veikla: lankstymas,    */
/* sluoksnių skaičiavimas, vienas kirpimas ir atvėrimas. Vaikas spėja   */
/* skylių skaičių PIRMA, o rezultatą pamato tik atvėręs lapą — taip     */
/* spėjimas nepametamas (LL-15), o klaida netampa nuosprendžiu (P3).    */
/* Simetrija ir jos ašis sąmoningai nemokoma: tai 2 klasės matematikos  */
/* tema (LL-23), todėl kriterijus — sluoksnių ir skylių skaičius.       */
/* Empson & Turner (2006) rodo, kad lankstymo uždaviniuose vaikai      */
/* spėja dalių skaičių, o produktyviausia yra dvigubinimo idėja.        */
/* ------------------------------------------------------------------ */

const LK_STYLE_ID = "cc-lankstymo-style";

const LK_CSS = `
.lk-wrap { display: flex; flex-direction: column; align-items: center; gap: .4rem; width: 100%; }
.lk-paper-box {
  display: flex; align-items: center; justify-content: center;
  width: 100%; min-height: 178px; padding: .3rem 0;
}
.lk-paper {
  position: relative;
  box-sizing: border-box;
  width: 240px; height: 168px;
  border: 2px solid #cbbda3;
  border-radius: 3px;
  background: linear-gradient(158deg, #fffdf6 0%, #f5edda 100%);
  box-shadow: 0 5px 0 #e4d9c2, 0 10px 16px rgba(64, 48, 20, .16);
  transition: width .22s ease, height .22s ease;
}
.lk-paper[data-fold="1"], .lk-paper[data-fold="2"] { width: 120px; }
.lk-paper[data-fold="2"] { height: 84px; }
.lk-crease { position: absolute; border: 0; }
.lk-crease.v { top: 0; bottom: 0; left: 50%; border-left: 2px dashed #d3c4a6; }
.lk-crease.h { left: 0; right: 0; top: 50%; border-top: 2px dashed #d3c4a6; }
.lk-hole {
  position: absolute;
  width: 22px; height: 22px; margin: -11px 0 0 -11px;
  border-radius: 50%;
  background: #d9cdb4;
  box-shadow: inset 0 2px 5px rgba(64, 48, 20, .5);
}
.lk-mark {
  position: absolute; left: 50%; top: 50%;
  width: 30px; height: 30px; margin: -15px 0 0 -15px;
  display: flex; align-items: center; justify-content: center;
  border: 2px dashed var(--accent); border-radius: 50%;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  font-size: 15px; line-height: 1;
}
.lk-edge { display: flex; flex-direction: column; align-items: center; gap: .2rem; }
.lk-edge[hidden] { display: none; }
.lk-cap { margin: 0; font-size: .8rem; font-weight: 800; color: var(--ink-soft); }
.lk-strips { display: flex; flex-direction: column; gap: 2px; width: 124px; }
.lk-strip {
  height: 7px; border: 1px solid #cbbda3; border-radius: 2px;
  background: linear-gradient(#fffdf6, #e8ddc6);
}
.lk-badge {
  margin: 0; padding: .2rem .7rem;
  border: 2px solid color-mix(in srgb, var(--accent) 50%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 14%, var(--paper-2));
  font-size: .85rem; font-weight: 800; color: var(--ink);
}
.lk-badge[hidden] { display: none; }
.lk-row, .lk-guess { display: flex; flex-wrap: wrap; gap: .5rem; justify-content: center; width: 100%; }
.lk-row[hidden], .lk-guess[hidden] { display: none; }
.lk-row .btn { min-height: 48px; }
.lk-guess button { min-width: 56px; min-height: 56px; padding: 0 .4rem; font-size: 1.35rem; font-weight: 900; }
.lk-guess button[aria-pressed="true"] { outline: 3px solid var(--accent); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .lk-paper { transition: none; } }
`;

const LK_SAY = {
  pradzia: "Vienas lapas. Perlenk jį pusiau.",
  "perlenkta-1": "Lapas perlenktas pusiau. Perlenk dar kartą.",
  spek: "Spėk, kiek skylių bus, kai atversi lapą.",
  spejimas: "Spėjimas įrašytas. Įkerpk vieną skylę.",
  ikirpta: "Vienas kirpimas per visus sluoksnius.",
  "atverta-2": "Atvėrei lapą. Dvi skylės.",
  "atverta-4": "Atvėrei lapą. Keturios skylės.",
  "antra-dalis": "Naujas lapas. Perlenk jį du kartus.",
  "is-naujo": "Pradedam iš naujo. Vienas lapas.",
};

/* Skylės (mot. g.) ir sluoksniai (vyr. g.) — skirtingos formos, todėl
   atskiros lentelės: „radai keturias“, bet „kirto keturis“. */
const LK_HOLE_NOM = ["viena", "dvi", "trys", "keturios"];
const LK_HOLE_ACC = ["vieną", "dvi", "tris", "keturias"];
const LK_LAYER_ACC = ["vieną", "du", "tris", "keturis"];

/* Kur atsiranda skylės atvėrus lapą. Kirpimas visada yra sulenkto lapo
   viduryje, toli nuo klosčių, todėl skylių skaičius lygus sluoksnių
   skaičiui. Koordinatės — atversto lapo procentai. */
const LK_HOLES = {
  1: [[25, 50], [75, 50]],
  2: [[25, 25], [75, 25], [25, 75], [75, 75]],
};

function ensureLkStyle() {
  if (document.getElementById(LK_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = LK_STYLE_ID;
  style.textContent = LK_CSS;
  document.head.appendChild(style);
}

const lankstymasIrKarpiniai = {
  mount({ stage, controls, api, config }) {
    ensureLkStyle();

    const say = config.sentences || {};
    const line = (key) => say[key] || LK_SAY[key] || "";
    const holeName = (n) => `${LK_HOLE_NOM[n - 1]} ${n === 1 ? "skylė" : "skylės"}`;

    // 1 dalis — viena klostė (du sluoksniai). 2 dalis — dvi klostės (keturi).
    let phase = 1;
    let folds = 0;
    let cut = false;
    let open = false;
    let guess = 0;
    let reported = false;

    const maxFolds = () => (phase === 1 ? 1 : 2);
    const holeCount = () => (folds === 2 ? 4 : 2);

    stage.innerHTML = `
      <div class="lk-wrap">
        <div class="lk-paper-box">
          <div class="lk-paper" id="lk-paper" data-fold="0" role="img"></div>
        </div>
        <p class="lk-badge" id="lk-badge" hidden></p>
        <div class="lk-edge" id="lk-edge">
          <p class="lk-cap">Sulenkto lapo kraštas</p>
          <div class="lk-strips" id="lk-strips"></div>
        </div>
      </div>`;

    controls.innerHTML = `
      <div class="lk-row"><button type="button" class="btn" id="lk-fold">Perlenk pusiau</button></div>
      <div class="lk-guess" id="lk-guess" hidden></div>
      <div class="lk-row">
        <button type="button" class="btn secondary" id="lk-cut" hidden>Įkerpk skylę</button>
        <button type="button" class="btn secondary" id="lk-open" hidden>Atverk lapą</button>
        <button type="button" class="btn ghost" id="lk-next" hidden>Kitas lapas</button>
        <button type="button" class="btn ghost" id="lk-reset">Iš naujo</button>
      </div>`;

    const paper = stage.querySelector("#lk-paper");
    const edge = stage.querySelector("#lk-edge");
    const strips = stage.querySelector("#lk-strips");
    const badge = stage.querySelector("#lk-badge");
    const foldBtn = controls.querySelector("#lk-fold");
    const cutBtn = controls.querySelector("#lk-cut");
    const openBtn = controls.querySelector("#lk-open");
    const nextBtn = controls.querySelector("#lk-next");
    const guessBox = controls.querySelector("#lk-guess");

    // Spėjimas renkamas mygtukais, o ne žodžiu: 1 klasėje skaičius vaikas
    // atpažįsta greičiau, o ekrano skaitytuvas gauna pilną sakinį.
    guessBox.innerHTML = [1, 2, 3, 4]
      .map((n) => `<button type="button" class="btn ghost" data-guess="${n}" aria-pressed="false">${n}</button>`)
      .join("");
    const guessBtns = [...guessBox.querySelectorAll("button")];
    guessBtns.forEach((btn, i) => btn.setAttribute("aria-label", `Spėju, bus ${holeName(i + 1)}.`));

    function paint() {
      paper.dataset.fold = String(open ? 0 : folds);

      const holes = [];
      if (open) {
        LK_HOLES[folds === 2 ? 2 : 1].forEach(([x, y]) => {
          holes.push(`<span class="lk-hole" style="left:${x}%;top:${y}%"></span>`);
        });
      } else if (cut) {
        holes.push(`<span class="lk-hole" style="left:50%;top:50%"></span>`);
      }
      const creases = open && folds > 0
        ? `<span class="lk-crease v"></span>${folds === 2 ? `<span class="lk-crease h"></span>` : ""}`
        : "";
      // Žirklės rodo TIKSLIĄ būsimos skylės vietą — tą pačią, kurioje atsiras
      // skylė, todėl žymeklis neužkloja to, ką žymi (LL-24).
      const mark = !cut && !open ? `<span class="lk-mark" aria-hidden="true">✂</span>` : "";
      paper.innerHTML = creases + holes.join("") + mark;

      paper.setAttribute(
        "aria-label",
        open
          ? `Atvertas lapas. Skylių ${LK_HOLE_NOM[holeCount() - 1]}.`
          : folds === 0
            ? "Vienas lapas. Žirklės rodo, kur bus skylė."
            : `Sulenktas lapas. ${folds === 1 ? "Viena klostė" : "Dvi klostės"}.`
              + (cut ? " Skylė jau įkirpta." : " Žirklės rodo, kur bus skylė."),
      );

      // Sluoksnių juostelės — lapo kraštas iš šono. Jos lieka tol, kol lapas
      // sulenktas: būtent ten vaikas skaičiuoja ir pamato dvigubėjimą.
      edge.hidden = open;
      strips.innerHTML = Array.from({ length: Math.pow(2, folds) }, () => `<span class="lk-strip"></span>`).join("");

      guessBtns.forEach((btn, i) => btn.setAttribute("aria-pressed", String(guess === i + 1)));
      badge.hidden = !(open && guess > 0);
      if (!badge.hidden) {
        badge.textContent = `Spėjai ${LK_HOLE_ACC[guess - 1]} · radai ${LK_HOLE_ACC[holeCount() - 1]}`;
        badge.setAttribute(
          "aria-label",
          `Tavo spėjimas: ${holeName(guess)}. Radai: ${holeName(holeCount())}.`,
        );
      }

      foldBtn.hidden = open || folds >= maxFolds();
      guessBox.hidden = open || cut || folds < maxFolds();
      cutBtn.hidden = open || cut || guess === 0;
      openBtn.hidden = open || !cut;
      nextBtn.hidden = !(open && phase === 1);
    }

    function fold() {
      if (open || folds >= maxFolds()) return;
      folds += 1;
      const more = folds < maxFolds();
      paint();
      if (more) {
        api.readout(line("perlenkta-1"));
        api.speak(line("perlenkta-1"));
        api.note("Perlenk dar kartą pusiau.");
        return;
      }
      api.readout(line("spek"));
      api.speak(line("spek"));
      api.note("Suskaičiuok sluoksnius krašte. Tada spausk savo spėjimą.");
    }

    function pickGuess(n) {
      guess = n;
      paint();
      api.readout(`Spėji: ${holeName(n)}.`);
      api.speak(line("spejimas"));
      api.note("Dabar spausk „Įkerpk skylę“.");
      cutBtn.focus();
    }

    function cutHole() {
      if (cut || open) return;
      cut = true;
      paint();
      api.readout(line("ikirpta"));
      api.speak(line("ikirpta"));
      api.note("Dabar spausk „Atverk lapą“ ir skaičiuok.");
      openBtn.focus();
    }

    function unfold() {
      if (!cut || open) return;
      open = true;
      paint();
      const n = holeCount();
      const key = n === 4 ? "atverta-4" : "atverta-2";
      api.readout(`${line(key)} Spėjai ${LK_HOLE_ACC[guess - 1]}.`);
      api.speak(line(key));
      api.note(guess === n
        ? `Sutapo. Vienas kirpimas kirto ${LK_LAYER_ACC[n - 1]} sluoksnius.`
        : `Spėjai ${LK_HOLE_ACC[guess - 1]}, o radai ${LK_HOLE_ACC[n - 1]}. Lankstymas dvigubina sluoksnius.`);
      // Pažanga žymima tik įveikus antrą dalį — pirmoji yra pasiruošimas (LL-29).
      if (phase === 2 && !reported) {
        reported = true;
        api.progress({ correct: true });
      }
    }

    function next() {
      phase = 2;
      folds = 0;
      cut = false;
      open = false;
      guess = 0;
      paint();
      api.readout(line("antra-dalis"));
      api.speak(line("antra-dalis"));
      api.note("Spausk „Perlenk pusiau“ du kartus.");
    }

    function reset() {
      phase = 1;
      folds = 0;
      cut = false;
      open = false;
      guess = 0;
      paint();
      api.readout(line("is-naujo"));
      api.speak(line("is-naujo"));
      api.note("Spausk „Perlenk pusiau“.");
    }

    foldBtn.addEventListener("click", fold);
    guessBtns.forEach((btn, i) => btn.addEventListener("click", () => pickGuess(i + 1)));
    cutBtn.addEventListener("click", cutHole);
    openBtn.addEventListener("click", unfold);
    nextBtn.addEventListener("click", next);
    controls.querySelector("#lk-reset").addEventListener("click", reset);

    paint();
    // Pirmas ekrano tekstas kviečia veikti, o balsas įsijungia tik po pirmo
    // vaiko prisilietimo (kaip ir kitose technologijų simuliacijose).
    api.readout(line("pradzia"));
    api.note("Spausk „Perlenk pusiau“.");

    return null;
  },
};

/* ------------------------------------------------------------------ */
/* Drabužių priežiūra: balti atskirai, spalvoti atskirai              */
/*                                                                    */
/* Kodėl toks modelis: 23.2.2 sritis prašo praktiškai išbandyti        */
/* drabužių priežiūrą, o vaiko sprendimas skalbime yra RŪŠIAVIMAS, ne  */
/* seka „išskalbk–išdžiovink–išlygink“ (kuri kartotų komandų sekos     */
/* mechaniką). Klaidinga nuostata — „mašina viską išskalbia, todėl      */
/* spalva nesvarbi“ — parodoma tiesiogiai: balti marškiniai bendrame   */
/* skalbyne parausta, nes spalvotas audinys atiduoda dažus.            */
/* Prieš skalbimą visi drabužiai nešvarūs (matoma dėmė), po skalbimo    */
/* dėmės dingsta — todėl skalbimas veikia ir tada, kai vaikas sudėjo    */
/* teisingai, o ne tik tada, kai klydo (LL-15: rezultatas nepametamas). */
/* Progress žymimas tik pabaigus visą ciklą (visi keturi sudėti ir      */
/* išskalbti), o ne po pirmo įdėjimo (LL-29).                           */
/* ------------------------------------------------------------------ */

const DP_STYLE_ID = "cc-drabuziu-style";

const DP_CSS = `
.dp-scene {
  display: block;
  width: 100%;
  max-width: 420px;
  height: auto;
  margin: 0 auto;
  border-radius: var(--r-m);
  background: var(--paper-2);
}
.dp-items {
  display: flex;
  flex-wrap: wrap;
  gap: .45rem;
  justify-content: center;
  width: 100%;
}
.dp-item {
  flex: 1 1 6.4rem;
  min-width: 6.1rem;
  min-height: 104px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: .1rem;
  padding: .3rem .35rem .45rem;
  border: 2px solid var(--line);
  border-radius: var(--r-s);
  background: var(--paper-2);
  color: var(--ink);
  font: inherit;
  font-size: .86rem;
  font-weight: 800;
  line-height: 1.15;
  text-align: center;
  cursor: pointer;
}
.dp-item svg { width: 46px; height: 46px; }
.dp-where {
  font-size: .74rem;
  font-weight: 600;
  color: var(--ink-soft);
  line-height: 1.2;
}
.dp-item.is-picked {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 34%, transparent);
}
.dp-item:focus-visible, .dp-bin:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.dp-bins {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  width: 100%;
}
.dp-bin {
  flex: 1 1 6rem;
  min-width: 0;
  min-height: 56px;
  padding: .4rem .5rem;
  border: 2px dashed var(--line);
  border-radius: var(--r-s);
  background: transparent;
  color: var(--ink);
  font: inherit;
  font-size: .92rem;
  font-weight: 800;
  cursor: pointer;
}
.dp-bin:hover { border-style: solid; }
.dp-actions {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  justify-content: center;
  width: 100%;
}
.dp-actions .btn { min-height: 48px; }
`;

const DP_SAY = {
  pradzia: "Keturi drabužiai. Du balti, du spalvoti.",
  pasirinkta: "Pasirinkai drabužį. Dabar pasirink pintinę.",
  sudeta: "Visi drabužiai pintinėse. Spausk „Skalbti“.",
  nepilna: "Dar ne visi drabužiai pintinėse.",
  tvarkinga: "Balti liko balti. Spalvoti liko savo spalvos.",
  sumaisyta: "Balti drabužiai paraudo.",
  "is-naujo": "Pradedam iš naujo. Keturi drabužiai.",
};

const DP_PINK = "#efbccb";

function ensureDpStyle() {
  if (document.getElementById(DP_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = DP_STYLE_ID;
  style.textContent = DP_CSS;
  document.head.appendChild(style);
}

const drabuziuPrieziura = {
  mount({ stage, controls, api, config }) {
    ensureDpStyle();

    const say = config.sentences || {};
    const line = (key) => say[key] || DP_SAY[key] || "";

    const ITEMS = [
      { id: "marskiniai", kind: "marskiniai", label: "Balti marškiniai", color: "#f2f1e9", light: true },
      { id: "kojines", kind: "kojine", label: "Baltos kojinės", color: "#f2f1e9", light: true },
      { id: "suknele", kind: "suknele", label: "Raudona suknelė", color: "#d9534f", light: false },
      { id: "kelnes", kind: "kelnes", label: "Mėlynos kelnės", color: "#3f6fb5", light: false },
    ];
    const BINS = [
      { id: "balta", label: "Balti", where: "baltuose" },
      { id: "spalvota", label: "Spalvoti", where: "spalvotuose" },
    ];

    let place = {};
    let picked = null;
    let washed = false;
    let reported = false;

    stage.innerHTML = `<svg class="dp-scene" viewBox="0 0 340 320" role="img"
      aria-label="Drabužiai ant lentynos ir dvi pintinės"></svg>`;
    controls.innerHTML = `
      <div class="dp-items" id="dp-items"></div>
      <div class="dp-bins">
        <button type="button" class="dp-bin" id="dp-bin-balta">Į baltus</button>
        <button type="button" class="dp-bin" id="dp-bin-spalvota">Į spalvotus</button>
      </div>
      <div class="dp-actions">
        <button type="button" class="btn" id="dp-wash">Skalbti</button>
        <button type="button" class="btn ghost" id="dp-reset">Iš naujo</button>
      </div>`;

    const scene = stage.querySelector(".dp-scene");
    const chipBox = controls.querySelector("#dp-items");
    const washBtn = controls.querySelector("#dp-wash");

    const inBin = (binId) => ITEMS.filter((it) => place[it.id] === binId);
    const binHasColour = (binId) => inBin(binId).some((it) => !it.light);
    const colourNow = (it) => (washed && it.light && binHasColour(place[it.id]) ? DP_PINK : it.color);

    /* Purvo dėmė matoma tik prieš skalbimą: taip vaikas pamato, kad skalbimas
       ką nors padarė ir tada, kai spalvos liko savo vietose. */
    function garmentAt(it, x, y, s, col) {
      const dirt = washed
        ? ""
        : `<g opacity=".5">${art.spot(x + 12 * s, y + 30 * s, 20 * s, 14 * s, "#8a7357")}</g>`;
      return `${art.garment(it.kind, x, y, s, col)}${dirt}`;
    }

    function paintScene() {
      const onShelf = ITEMS.filter((it) => !place[it.id])
        .map((it) => garmentAt(it, 26 + ITEMS.indexOf(it) * 72, 100, 0.86, it.color))
        .join("");

      const bins = [
        { id: "balta", x: 12 },
        { id: "spalvota", x: 176 },
      ].map(({ id, x }) => {
        const list = inBin(id);
        const inner = list.map((it, i) => garmentAt(
          it,
          x + 34 + (i % 2) * 58,
          220 + Math.floor(i / 2) * 36,
          0.66,
          colourNow(it),
        )).join("");
        const name = BINS.find((b) => b.id === id).label;
        const label = `<text x="${x + 76}" y="216" text-anchor="middle"
          style="font-family:var(--font-head);font-size:12.5px;font-weight:800;fill:#5b3d18">${name}</text>`;
        return `${art.basket(x, 306, 152, 92)}${inner}${label}`;
      }).join("");

      scene.innerHTML = `${art.plank(10, 148, 320, 12)}
        <rect x="22" y="148" width="10" height="14" rx="3" fill="#8a5c33" opacity=".5"/>
        <rect x="308" y="148" width="10" height="14" rx="3" fill="#8a5c33" opacity=".5"/>
        ${onShelf}${bins}`;

      const shelfLeft = ITEMS.filter((it) => !place[it.id]).map((it) => it.label.toLowerCase());
      const parts = [shelfLeft.length ? `Ant lentynos: ${shelfLeft.join(", ")}.` : "Lentyna tuščia."];
      BINS.forEach((b) => {
        const list = inBin(b.id).map((it) => it.label.toLowerCase());
        parts.push(list.length
          ? `Pintinėje „${b.label}“: ${list.join(", ")}.`
          : `Pintinė „${b.label}“ tuščia.`);
      });
      if (washed) {
        const pink = ITEMS.filter((it) => it.light && binHasColour(place[it.id]))
          .map((it) => it.label);
        parts.push(pink.length
          ? `${pink.join(" ir ")} paraudo.`
          : "Balti liko balti, purvo dėmės dingo.");
      }
      scene.setAttribute("aria-label", parts.join(" "));
    }

    function paintChips() {
      ITEMS.forEach((it) => {
        const btn = chipBox.querySelector(`#dp-i-${it.id}`);
        if (!btn) return;
        const where = place[it.id];
        const binName = where ? BINS.find((b) => b.id === where).where : "";
        btn.classList.toggle("is-picked", picked === it.id);
        btn.setAttribute("aria-pressed", String(picked === it.id));
        btn.querySelector(".dp-where").textContent = where
          ? (washed ? `Išskalbti ${binName}` : `Jau ${binName}`)
          : "Dar ant lentynos";
        btn.setAttribute("aria-label", where
          ? `${it.label}. ${washed ? "Išskalbti" : "Jau"} ${binName}.`
          : `${it.label}. Dar ant lentynos. Bakstelėk ir pasirink pintinę.`);
      });
    }

    function paint() {
      paintScene();
      paintChips();
    }

    function buildChips() {
      chipBox.innerHTML = ITEMS.map((it) => `
        <button type="button" class="dp-item" id="dp-i-${it.id}">
          <svg viewBox="0 0 64 64" aria-hidden="true">${art.garment(it.kind, 4, 4, 0.88, it.color)}</svg>
          <span>${it.label}</span>
          <span class="dp-where">Dar ant lentynos</span>
        </button>`).join("");
      ITEMS.forEach((it) => {
        chipBox.querySelector(`#dp-i-${it.id}`).addEventListener("click", () => pick(it.id));
      });
    }

    const allPlaced = () => ITEMS.every((it) => place[it.id]);

    function pick(id) {
      if (washed) {
        api.readout("Skalbiniai jau išskalbti.");
        api.note("Spausk „Iš naujo“, jei nori paskirstyti kitaip.");
        return;
      }
      const it = ITEMS.find((x) => x.id === id);
      picked = id;
      paintChips();
      api.readout(`${it.label}. Į kurią pintinę dėsi?`);
      api.note("Spausk „Į baltus“ arba „Į spalvotus“.");
      api.speak(line("pasirinkta"));
    }

    function placeIn(binId) {
      if (washed) {
        api.readout("Skalbiniai jau išskalbti.");
        api.note("Spausk „Iš naujo“, jei nori paskirstyti kitaip.");
        return;
      }
      if (!picked) {
        const left = ITEMS.filter((it) => !place[it.id]);
        api.readout("Pirma bakstelėk drabužį.");
        api.note(left.length
          ? "Pasirink vieną iš drabužių ant lentynos."
          : "Visi drabužiai jau pintinėse. Spausk „Skalbti“.");
        const any = chipBox.querySelector(".dp-item");
        if (any) any.focus();
        return;
      }
      const it = ITEMS.find((x) => x.id === picked);
      const bin = BINS.find((b) => b.id === binId);
      place[it.id] = binId;
      picked = null;
      paint();
      api.readout(`${it.label} — ${bin.where}.`);

      if (allPlaced()) {
        api.readout(line("sudeta"));
        api.note("Pintinės pilnos. Spausk „Skalbti“ ir pažiūrėk, kas nutiks.");
        api.speak(line("sudeta"));
        washBtn.focus();
        return;
      }
      const left = ITEMS.filter((x) => !place[x.id]).length;
      api.note(left === 1 ? "Liko vienas drabužys." : `Liko dar ${left} drabužiai.`);
    }

    function wash() {
      if (!allPlaced()) {
        api.readout(line("nepilna"));
        api.note("Sudėk į pintines visus keturis drabužius.");
        api.speak(line("nepilna"));
        const next = ITEMS.find((it) => !place[it.id]);
        const chip = next && chipBox.querySelector(`#dp-i-${next.id}`);
        if (chip) chip.focus();
        return;
      }
      washed = true;
      paint();

      const pink = ITEMS.filter((it) => it.light && binHasColour(place[it.id]));
      if (!pink.length) {
        api.readout(line("tvarkinga"));
        api.note("Purvo dėmės dingo, o spalvos liko savo vietose. Taip baltus ir skalbiame — atskirai.");
        api.speak(line("tvarkinga"));
        // Pažanga žymima tik pabaigus visą ciklą: visi sudėti ir išskalbti (LL-29).
        if (!reported) {
          reported = true;
          api.progress({ correct: true });
        }
        return;
      }

      api.readout(line("sumaisyta"));
      api.note(`${pink.map((it) => it.label).join(" ir ")} nusidažė, `
        + "nes pintinėje buvo spalvotas audinys. Spausk „Iš naujo“ ir paskirstyk kitaip.");
      api.speak(line("sumaisyta"));
    }

    function reset() {
      place = {};
      picked = null;
      washed = false;
      paint();
      api.readout(line("is-naujo"));
      api.note("Bakstelėk drabužį, tada pasirink pintinę.");
      api.speak(line("is-naujo"));
    }

    washBtn.addEventListener("click", wash);
    controls.querySelector("#dp-bin-balta").addEventListener("click", () => placeIn("balta"));
    controls.querySelector("#dp-bin-spalvota").addEventListener("click", () => placeIn("spalvota"));
    controls.querySelector("#dp-reset").addEventListener("click", reset);

    buildChips();
    paint();
    api.readout(line("pradzia"));
    api.note("Bakstelėk drabužį, tada pasirink pintinę.");

    return null;
  },
};

/* ------------------------------------------------------------------ */
/* Batas: formą užfiksuoja džiūvimas (M-16)                            */
/*                                                                     */
/* Kodėl toks modelis: trys vienodi šlapi batai, o vienintelis          */
/* skirtumas — kas viduje. Kol batas drėgnas, forma dar kinta; kai      */
/* sausas — nebegrįžta. Komponente nėra mygtuko „ištiesinti“, nes       */
/* būtent to vaikas ir tikisi („forma grįš pati“). `sag` išvedamas iš    */
/* turinio ir padėties, o ne įrašomas: config neturi lauko „kas nutinka, */
/* kai viduje nieko“ (ta pati taisyklė kaip M-15).                      */
/* ------------------------------------------------------------------ */

const BT_STYLE_ID = "cc-batas-style";

const BT_CSS = `
.bt-guess {
  display: none;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: .4rem .5rem;
  width: 100%;
  max-width: 340px;
  margin: 0 auto .5rem;
  padding: .5rem .55rem;
  border: 2px dashed var(--line);
  border-radius: var(--r-s);
  background: var(--paper-2);
}
.bt-guess.is-on { display: flex; }
.bt-guess p {
  flex-basis: 100%;
  margin: 0;
  text-align: center;
  font-size: .95rem;
  font-weight: 800;
  line-height: 1.25;
  color: var(--ink);
}
.bt-guess button {
  min-width: 6.4rem;
  min-height: 48px;
  padding: .4rem .6rem;
  border: 2px solid var(--line);
  border-radius: var(--r-s);
  background: var(--paper);
  color: var(--ink);
  font: inherit;
  font-size: .95rem;
  font-weight: 800;
  cursor: pointer;
  touch-action: manipulation;
}
.bt-guess button[aria-pressed="true"] {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 28%, transparent);
}
.bt-guess button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.bt-made { flex-basis: 100%; margin: 0; text-align: center; font-size: .9rem; font-weight: 800; color: var(--ink-soft); }
.bt-wrap {
  position: relative;
  width: 100%;
  max-width: 340px;
  margin: 0 auto;
  border-radius: var(--r-m);
  background: color-mix(in srgb, var(--sky) 8%, var(--paper-2));
}
.bt-scene { display: block; width: 100%; height: auto; }
/* Batai patys yra mygtukai: taikinys 96 x 92 vienetų (>= 48 px ekrane),
   o ne atskiras sąrašas po paveikslu. Fonas permatomas, kad vaikas
   spaustų būtent batą, o ne jo dėžutę. */
.bt-hit {
  position: absolute;
  width: 28.235%;
  height: 31.945%;
  top: 50.694%;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 16px;
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
}
.bt-hit:hover { background: color-mix(in srgb, var(--accent) 9%, transparent); }
.bt-hit:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.bt-actions { display: flex; flex-wrap: wrap; gap: .5rem; justify-content: center; width: 100%; }
.bt-actions .btn { min-height: 48px; }
@media (prefers-reduced-motion: reduce) {
  .bt-hit { transition: none; }
}
`;

const BT_SAY = {
  start: "Trys šlapi batai. Bakstelėk batą ir pasirink, kas viduje.",
  nieko: "Bato viduje nieko.",
  laikrastis: "Bato viduje laikraštis.",
  idedas: "Bato viduje įdėklas.",
  guess: "Pirma spėk, kas bus batams.",
  dziusta: "Batai džiūsta. Nosis smunka ten, kur viduje nieko.",
  edit: "Dar drėgnas. Formą dar galima pakeisti.",
  // Raktas turi sutapti su `config.sentences` raktu (`sausas`), kitaip
  // atsarginis sakinys neatsiranda ir vaikas, paspaudęs sausą batą,
  // išgirsta tylą (LL-14 šeima).
  sausas: "Batas jau sausas. Forma nebegrįš.",
  mixed: "Batai išdžiūvo nevienodai: vienur nosis apvali, kitur susilinkusi.",
  round: "Visi liko apvalūs, nes viduje buvo laikraštis ar įdėklas.",
  bent: "Visi susilinko, nes nė viename nebuvo nieko.",
  reset: "Vėl trys šlapi batai.",
};

const BT_STAGES = ["slapias", "dziusta", "sausas"];
const BT_ORDINAL = ["Pirmas", "Antras", "Trečias"];

function ensureBtStyle() {
  if (document.getElementById(BT_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = BT_STYLE_ID;
  style.textContent = BT_CSS;
  document.head.appendChild(style);
}

const batas = {
  mount({ stage, controls, api, config }) {
    ensureBtStyle();

    const S = config.sentences || {};
    const L = config.labels || {};
    const line = (key) => (typeof S[key] === "string" ? S[key] : (BT_SAY[key] || ""));
    const label = (key, fallback) => (typeof L[key] === "string" ? L[key] : fallback);

    const contents = Array.isArray(config.contents) ? config.contents.filter((c) => c && c.key) : [];
    const stageList = Array.isArray(config.stages)
      ? config.stages.filter((s) => s && s.key)
      : [];
    const keys = contents.map((c) => c.key);
    const stageKeys = stageList.map((s) => s.key);
    // Modelio sąlyga: turi būti „nieko“ atvejis (nuo jo priklauso `sag`) ir
    // trys padėtys. Nežinoma konfigūracija negali tyliai virsti „tvarkingu“.
    if (keys.length < 2 || !keys.includes("nieko") || BT_STAGES.some((k) => !stageKeys.includes(k))) {
      console.error("[batas] config nesuderintas:", config);
      stage.innerHTML = `<p class="error-box">Batas nesuderintas.</p>`;
      return null;
    }

    const labelOf = (key) => {
      const c = contents.find((x) => x.key === key);
      return c ? c.label : key;
    };
    const stageName = () => {
      const s = stageList.find((x) => x.key === st.stage);
      return s ? s.label : "";
    };

    const st = {
      contents: ["nieko", "nieko", "nieko"],
      stage: "slapias",     // slapias | dziusta | sausas
      guess: null,          // same | bent | split
      guessShown: false,
      reported: false,
    };

    // Viena taisyklė visam modeliui (M-16): formą fiksuoja pabaiga.
    const sagOf = (content) => {
      if (st.stage === "slapias") return 0;
      if (st.stage === "dziusta") return content === "nieko" ? 0.5 : 0;
      return content === "nieko" ? 1 : 0;
    };
    const outcomeOf = (content) => (content === "nieko" ? "crooked" : "round");
    const rounds = () => st.contents.filter((c) => outcomeOf(c) === "round").length;
    // Du atskiri žodynai, ir jų negalima maišyti: spėjimo raktai yra
    // `same|bent|split` (mygtukų etiketės), o rezultato sakiniai —
    // `round|bent|mixed`. Kai vienas buvo ieškomas kitame, pabaigos
    // paaiškinimas išeidavo tuščias: vaikas matydavo batus, bet
    // neišgirsdavo, kodėl (LL-33 šeima — tekstas įrašytas pagal vieną atvejį).
    const outcomeKey = () => {
      const r = rounds();
      return r === 3 ? "round" : r === 0 ? "bent" : "mixed";
    };
    const guessTruth = () => {
      const r = rounds();
      return r === 3 ? "same" : r === 0 ? "bent" : "split";
    };
    const guessLabel = (key) => {
      if (key === "same") return label("same", "Visi liks apvalūs");
      if (key === "bent") return label("bent", "Visi susilinks");
      return label("split", "Skirsis");
    };

    const VBW = 340;
    const VBH = 288;
    const GROUND = 231;
    const SCALE = 0.92;
    const CENTERS = [62, 170, 278];

    const guessQ = label("guess", "Kas bus batams?");

    stage.innerHTML = `
      <div class="bt-guess" id="bt-guess" role="group" aria-label="${guessQ}">
        <p id="bt-guess-q">${guessQ}</p>
        <button type="button" id="bt-g-same" aria-pressed="false">${guessLabel("same")}</button>
        <button type="button" id="bt-g-bent" aria-pressed="false">${guessLabel("bent")}</button>
        <button type="button" id="bt-g-split" aria-pressed="false">${guessLabel("split")}</button>
        <p class="bt-made" id="bt-made"></p>
      </div>
      <div class="bt-wrap" id="bt-wrap">
        <svg class="bt-scene" id="bt-scene" viewBox="0 0 ${VBW} ${VBH}" role="img" aria-label=""></svg>
        ${CENTERS.map((cx, i) => {
          const left = ((cx - 48) / VBW) * 100;
          return `<button type="button" class="bt-hit" id="bt-hit-${i}" style="left:${left.toFixed(3)}%"></button>`;
        }).join("")}
      </div>`;

    controls.innerHTML = `
      <div class="bt-actions">
        <button type="button" class="btn" id="bt-wait">${label("wait", "Palauk")}</button>
        <button type="button" class="btn ghost" id="bt-reset">${label("again", "Iš naujo")}</button>
      </div>`;

    const scene = stage.querySelector("#bt-scene");
    const guessBar = stage.querySelector("#bt-guess");
    const madeLine = stage.querySelector("#bt-made");
    const guessBtns = {
      same: stage.querySelector("#bt-g-same"),
      bent: stage.querySelector("#bt-g-bent"),
      split: stage.querySelector("#bt-g-split"),
    };
    const bootBtns = CENTERS.map((_, i) => stage.querySelector(`#bt-hit-${i}`));
    const waitBtn = controls.querySelector("#bt-wait");
    const resetBtn = controls.querySelector("#bt-reset");

    /* Tekstas po batu niekada nedingsta: jis arba sako turinį, arba rezultatą.
       Būtent todėl „Susilinko“ ir „Apvali“ turi savo vietą, o ne atsiranda
       virš paveikslo kaip bendras sakinys (LL-13, LL-24). */
    function paintScene() {
      const boots = CENTERS.map((cx, i) => art.boot(
        cx - 50 * SCALE, GROUND, SCALE, sagOf(st.contents[i]), st.contents[i],
      )).join("");

      // 17 px, o ne `var(--fs-s)`: SVG tekstą dar sumažina pats viewBox
      // (340 → 301 px telefone), todėl 15,2 px ekrane taptų 13,5 px. Vartai
      // matuoja CSS dydį, o vaikas mato galutinį — todėl bazė didinama
      // tiek, kad ir 360 px pločiui liktų ≥ 15 px (LL-06, LL-39).
      const caps = CENTERS.map((cx, i) => {
        const c = st.contents[i];
        const text = st.stage === "sausas"
          ? (outcomeOf(c) === "round" ? label("round", "Apvali") : label("crooked", "Susilinko"))
          : labelOf(c);
        return `<text x="${cx}" y="262" text-anchor="middle"
          style="font-family:var(--font-head);font-size:17px;font-weight:800;fill:#5b3d18">${text}</text>`;
      }).join("");

      // Vandens lašų sąmoningai nėra: vienintelis kintamasis šiame modelyje
      // yra tai, kas bato viduje, o ne drėgmė. Lašai pasakytų „šlapia /
      // sausa“ ir nukreiptų dėmesį nuo nosies linijos (T1.2, LL-13).
      scene.innerHTML = `${art.defs("bt")}${art.plank(6, 240, 328, 9)}${boots}${caps}`;

      const parts = CENTERS.map((cx, i) => {
        const c = st.contents[i];
        const nose = st.stage === "slapias"
          ? "nosis apvali"
          : st.stage === "dziusta"
            ? (outcomeOf(c) === "round" ? "nosis dar apvali" : "nosis jau įlinkusi per pusę")
            : (outcomeOf(c) === "round" ? "nosis liko apvali" : "nosis susilinkusi");
        return `${BT_ORDINAL[i]} batas, viduje ${labelOf(c).toLowerCase()}, ${nose}.`;
      });
      scene.setAttribute("aria-label", `${stageName()}. ${parts.join(" ")}`);
    }

    function paintButtons() {
      bootBtns.forEach((btn, i) => {
        const c = st.contents[i];
        const frozen = st.stage === "sausas";
        btn.setAttribute("aria-disabled", String(frozen));
        const state = frozen
          ? (outcomeOf(c) === "round" ? `${label("round", "Apvali")}.` : `${label("crooked", "Susilinko")}.`)
          : "Bakstelėk, kad pakeistum, kas viduje.";
        btn.setAttribute(
          "aria-label",
          `${BT_ORDINAL[i]} batas. Viduje ${labelOf(c).toLowerCase()}. ${state}`,
        );
      });

      const drying = st.stage === "dziusta";
      const dry = st.stage === "sausas";
      // Sausam batui „Palauk dar“ būtų netiesa: laukti nebereikia. Todėl
      // mygtukas tada sako būseną, o ne komandą, ir lieka toje pačioje
      // vietoje, kad išdėstymas nešokinėtų po pirštu (LL-32).
      waitBtn.textContent = dry
        ? label("dry", "Batai sausi")
        : drying
          ? label("waitMore", "Palauk dar")
          : label("wait", "Palauk");
      // Ne `disabled`, kad fokusas neprapultų (LL-32).
      waitBtn.setAttribute("aria-disabled", String(dry));

      const shown = st.guessShown;
      guessBar.classList.toggle("is-on", shown);
      guessBar.style.display = shown ? "flex" : "none";
      Object.entries(guessBtns).forEach(([k, btn]) => {
        btn.setAttribute("aria-pressed", String(st.guess === k));
        btn.setAttribute("aria-disabled", String(st.stage !== "slapias"));
      });

      let made = "";
      if (st.guess) {
        made = `Tavo spėjimas: ${guessLabel(st.guess).toLowerCase()}.`;
        if (st.stage === "sausas") {
          made += guessTruth() === st.guess ? " Taip ir gavosi." : " Gavosi kitaip.";
        }
      }
      madeLine.textContent = made;
    }

    function paint() {
      paintScene();
      paintButtons();
    }

    function say(text) {
      if (!text) return;
      api.speak(text);
    }

    function tapBoot(i) {
      if (st.stage === "sausas") {
        const text = line("sausas");
        api.readout(text);
        api.note(text);
        say(text);
        return;
      }
      const cur = keys.indexOf(st.contents[i]);
      const next = contents[(cur + 1) % contents.length];
      st.contents[i] = next.key;
      paint();

      const text = line(next.key);
      api.readout(text);
      // Džiūnant sakinys turi pasakyti, kad forma dar kinta — kitaip vaikas
      // gali pamanyti, kad turinys jau nieko nekeičia.
      const note = st.stage === "dziusta" ? line("edit") : text;
      api.note(note);
      say(st.stage === "dziusta" ? line("edit") : text);
    }

    function wait() {
      if (st.stage === "sausas") {
        const text = line("sausas");
        api.readout(text);
        api.note(`Spausk „${label("again", "Iš naujo")}“, jei nori pradėti iš naujo.`);
        say(text);
        resetBtn.focus();
        return;
      }
      if (st.stage === "slapias") {
        st.guessShown = true;
        paint();
        const text = line("guess");
        api.readout(text);
        api.note(text);
        say(text);
        guessBtns.same.focus();
        return;
      }
      finish();
    }

    function chooseGuess(key) {
      if (st.stage !== "slapias" || !st.guessShown) {
        // Paspaudimas po spėjimo negali likti tyliu tekstu: vaikas, kuris dar
        // neskaito, turi išgirsti, kas dabar vyksta. Todėl sakomas esamos
        // padėties sakinys, o ne nauja, garso neturinti eilutė.
        const text = line(st.stage === "sausas" ? "sausas" : "dziusta");
        api.readout(text);
        api.note(st.stage === "sausas"
          ? `Spausk „${label("again", "Iš naujo")}“, jei nori pradėti iš naujo.`
          : `Spėjimas jau užrašytas. Spausk „${label("waitMore", "Palauk dar")}“.`);
        say(text);
        return;
      }
      st.guess = key;
      st.stage = "dziusta";
      paint();
      const text = line("dziusta");
      api.readout(text);
      api.note(text);
      say(text);
      waitBtn.focus();
    }

    function finish() {
      st.stage = "sausas";
      const key = outcomeKey();
      paint();

      const text = line(key);
      api.readout(text);
      const hint = key === "mixed"
        ? ""
        : ` Spausk „${label("again", "Iš naujo")}“ ir į vieną batą įdėk laikraštį, į kitą nieko.`;
      api.note(text + hint);
      say(text);

      // Pažanga — tik kai tame pačiame kadre yra ir apvalus, ir sulinkęs
      // batas (LL-17). Vienodi trys batai nieko nepaneigia, todėl bandymas
      // kartojamas, bet klaida nevadinama (LL-15).
      if (key === "mixed" && !st.reported) {
        st.reported = true;
        api.progress({ correct: true });
      }
      resetBtn.focus();
    }

    function reset() {
      st.contents = ["nieko", "nieko", "nieko"];
      st.stage = "slapias";
      st.guess = null;
      st.guessShown = false;
      paint();
      const text = line("reset");
      api.readout(text);
      api.note("Bakstelėk batą ir pasirink, kas viduje.");
      say(text);
      bootBtns[0].focus();
    }

    bootBtns.forEach((btn, i) => btn.addEventListener("click", () => tapBoot(i)));
    guessBtns.same.addEventListener("click", () => chooseGuess("same"));
    guessBtns.bent.addEventListener("click", () => chooseGuess("bent"));
    guessBtns.split.addEventListener("click", () => chooseGuess("split"));
    waitBtn.addEventListener("click", wait);
    resetBtn.addEventListener("click", reset);

    paint();
    api.readout(line("start"));
    api.note("Bakstelėk batą ir pasirink, kas viduje.");

    return null;
  },
};

/* ------------------------------------------------------------------ */
/* Valdiklis: jungiklis lieka, mygtukas grįžta (M-15)                  */
/*                                                                     */
/* Kodėl toks modelis: 1 klasėje valdiklio skirtumą vaikas pamato po   */
/* paleidimo, o ne iš paveikslėlio. Abu valdikliai vienodo dydžio ir    */
/* viename aukštyje, veiksmas tas pats (paspaudimas ir paleidimas), o   */
/* keičiasi vienintelis dalykas — kuris valdiklis laiko šviesą. Šviesos */
/* būsena išvedama iš valdiklio elgsenos (`behaviour`), o ne įrašoma    */
/* atskirai: jungiklio atveju šviesą laiko jo padėtis, mygtuko — tik    */
/* pirštas. Todėl „paspaudžiau“ dar nepasako, kas bus atleidus.          */
/* Elektros srovės nepiešiame (žr. failo įžangą).                        */
/* ------------------------------------------------------------------ */

const VD_STYLE_ID = "cc-valdiklis-style";

const VD_CSS = `
.vd-guess {
  display: none;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: .4rem .5rem;
  width: 100%;
  max-width: 340px;
  margin: 0 auto .5rem;
  padding: .5rem .55rem;
  border: 2px dashed var(--line);
  border-radius: var(--r-s);
  background: var(--paper-2);
}
.vd-guess.is-on { display: flex; }
.vd-guess p {
  flex-basis: 100%;
  margin: 0;
  text-align: center;
  font-size: .95rem;
  font-weight: 800;
  line-height: 1.25;
  color: var(--ink);
}
.vd-guess button {
  min-width: 6rem;
  min-height: 48px;
  padding: .4rem .7rem;
  border: 2px solid var(--line);
  border-radius: var(--r-s);
  background: var(--paper);
  color: var(--ink);
  font: inherit;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  touch-action: manipulation;
}
.vd-guess button[aria-pressed="true"] {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 28%, transparent);
}
.vd-guess button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.vd-made { font-weight: 800; color: var(--ink-soft); }
.vd-scene-wrap {
  max-width: 340px;
  margin: 0 auto;
  border-radius: var(--r-m);
  background: color-mix(in srgb, var(--sky) 8%, var(--paper-2));
}
.vd-scene { display: block; width: 100%; height: auto; }
.vd-row {
  display: grid;
  /* minmax(0, 1fr) ir min-width: 0 — kitaip ilgesnis būsenos žodis
     („Knopkė aukštyn“) išpučia stulpelį ir 200 % tekste atsiranda
     horizontali slinktis (WCAG 1.4.4, LL-39). */
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .55rem;
  width: 100%;
  max-width: 340px;
  margin: .55rem auto .5rem;
}
.vd-ctl {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .1rem;
  min-width: 0;
  min-height: 104px;
  padding: .35rem .25rem .45rem;
  border: 3px solid var(--line);
  border-radius: var(--r-s);
  background: var(--paper-2);
  color: var(--ink);
  font: inherit;
  cursor: pointer;
  touch-action: manipulation;
}
.vd-ctl.is-active { border-color: var(--accent); }
.vd-ctl:not(.is-active) svg.vd-icon { opacity: .45; }
.vd-ctl:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.vd-ctl svg.vd-icon { display: block; width: 64px; height: 64px; }
.vd-name { max-width: 100%; font-size: .95rem; font-weight: 800; line-height: 1.1; overflow-wrap: break-word; }
.vd-state {
  max-width: 100%;
  /* Dvi eilutės rezervuotos iš anksto: kitaip būsenos žodis („Knopkė
     nuspausta“) perkelia dėžutę į antrą eilutę ir visos scenos aukštis
     šokinėja po pirštu (LL-151 šeima — išdėstymo poslinkis per būseną). */
  min-height: 2.3em;
  font-size: .8rem;
  font-weight: 700;
  line-height: 1.15;
  text-align: center;
  color: var(--ink-soft);
  overflow-wrap: break-word;
}
.vd-actions { display: flex; flex-wrap: wrap; gap: .5rem; justify-content: center; width: 100%; }
.vd-table { width: 100%; max-width: 340px; margin: .6rem auto 0; padding: 0; list-style: none; }
.vd-table li {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: .5rem;
  padding: .35rem .1rem;
  border-bottom: 1px dashed var(--line);
  font-size: .95rem;
  font-weight: 800;
  color: var(--ink);
}
.vd-table .vd-empty { border-bottom: 0; font-weight: 700; color: var(--ink-soft); }
`;

const VD_ARROW = { lieka: "↓", grizta: "↑" };
const VD_DONE = { lieka: "liko", grizta: "grįžta" };

function ensureVdStyle() {
  if (document.getElementById(VD_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = VD_STYLE_ID;
  style.textContent = VD_CSS;
  document.head.appendChild(style);
}

const valdiklis = {
  mount({ stage, controls, api, config }) {
    ensureVdStyle();

    const S = config.sentences || {};
    const L = config.labels || {};
    const LAMP = config.lamp || {};
    const valdikliai = Array.isArray(config.controls) ? config.controls.slice() : [];
    const line = (key) => (typeof S[key] === "string" ? S[key] : "");
    const label = (key, fallback) => (typeof L[key] === "string" ? L[key] : fallback);

    // `behaviour` yra modelio šaltinis: iš jo išvedama, kas laiko šviesą.
    // Nežinoma reikšmė negali tyliai virsti „užgesusios lempos“ modeliu.
    const broken = valdikliai.filter((c) => !c || (c.behaviour !== "lieka" && c.behaviour !== "grizta"));
    if (valdikliai.length < 2 || broken.length) {
      console.error("[valdiklis] config.controls nesuderintas:", config.controls);
      stage.innerHTML = `<p class="error-box">Valdiklis nesuderintas.</p>`;
      return null;
    }

    const byKey = (key) => valdikliai.find((c) => c.key === key) || null;
    const lower = (key) => (byKey(key) ? byKey(key).label.toLowerCase() : "");

    const st = {
      active: valdikliai[0].key,
      holder: null,       // kuris valdiklis dabar laiko šviesą
      down: {},           // judanti dalis: svirtis žemyn / knopkė nuspausta
      pressed: {},        // ar pirštas dar laiko
      guess: {},          // spėjimas: "stay" | "goes"
      rows: {},           // lentelės eilutės (išlieka ir po „Iš naujo“)
      phase: "idle",      // idle | pressed
      spoken: "",
      reported: false,
    };

    // Viena taisyklė visam modeliui (M-15): šviesą laiko valdiklio padėtis.
    // Jungiklis po paleidimo lieka žemyn, todėl dega; mygtukas grįžta, todėl
    // šviesą laiko tik pirštas (`pressed`).
    function litBy(c) {
      if (!c) return false;
      return c.behaviour === "lieka" ? !!st.down[c.key] : !!st.pressed[c.key];
    }
    const lit = () => litBy(byKey(st.holder));

    function stateText(c) {
      const down = !!st.down[c.key];
      if (c.behaviour === "lieka") return down ? "Svirtis žemyn" : "Svirtis aukštyn";
      return down ? "Knopkė nuspausta" : "Knopkė aukštyn";
    }

    function iconOf(c) {
      const down = !!st.down[c.key];
      if (c.behaviour === "lieka") {
        return `${art.block(0, 0, 64, "#eef3f7", "", "#9aa4ae")}
          ${art.ball(24, 48, 4.5, "#5c6168", "#3a4046")}
          ${art.plank(24, 48, 24, 7, down ? -18 : 62)}`;
      }
      return `${art.block(0, 0, 64, "#eef3f7", "", "#9aa4ae")}
        ${art.spot(15, down ? 17 : 13, 34, 34, "#c3ccd5", "apvali", 2.5)}
        ${art.ball(32, down ? 38 : 32, 12, down ? "#f6c86e" : "#e6ebf0", "#8a8f96")}`;
    }

    const guessQ = label("guess", "Kas bus atleidus?");
    const tableTitle = label("tableTitle", "Ką paliko pirštas");

    stage.innerHTML = `
      <div class="vd-guess" id="vd-guess" role="group" aria-label="${guessQ}">
        <p id="vd-guess-q">${guessQ}</p>
        <button type="button" id="vd-guess-stay" aria-pressed="false">${label("stay", "Liks")}</button>
        <button type="button" id="vd-guess-goes" aria-pressed="false">${label("goes", "Užgęs")}</button>
        <p class="vd-made" id="vd-made"></p>
      </div>
      <div class="vd-scene-wrap">
        <svg class="vd-scene" id="vd-scene" viewBox="0 0 328 196" role="img" aria-label=""></svg>
      </div>`;

    controls.innerHTML = `
      <div class="vd-row" role="group" aria-label="Valdikliai">
        ${valdikliai.map((c) => `
          <button type="button" class="vd-ctl" id="vd-ctl-${c.key}" aria-pressed="false">
            <svg class="vd-icon" viewBox="0 0 64 64" aria-hidden="true" id="vd-icon-${c.key}"></svg>
            <span class="vd-name">${c.label}</span>
            <span class="vd-state" id="vd-state-${c.key}"></span>
          </button>`).join("")}
      </div>
      <div class="vd-actions">
        <button type="button" class="btn" id="vd-press">${label("press", "Paspausk")}</button>
        <button type="button" class="btn" id="vd-release">${label("release", "Atleisk")}</button>
        <button type="button" class="btn ghost" id="vd-reset">${label("again", "Iš naujo")}</button>
      </div>
      <ul class="vd-table" id="vd-table" aria-label="${tableTitle}"></ul>`;

    const scene = stage.querySelector("#vd-scene");
    const guessBar = stage.querySelector("#vd-guess");
    const guessStay = stage.querySelector("#vd-guess-stay");
    const guessGoes = stage.querySelector("#vd-guess-goes");
    const madeLine = stage.querySelector("#vd-made");
    const pressBtn = controls.querySelector("#vd-press");
    const releaseBtn = controls.querySelector("#vd-release");
    const resetBtn = controls.querySelector("#vd-reset");

    function paintScene() {
      const on = lit();
      const holder = byKey(st.holder);
      const lampSay = on ? (LAMP.on || "Šviesa dega.") : (LAMP.off || "Šviesa užgęsta.");
      const glow = on
        ? `<circle cx="166" cy="106" r="60" fill="url(#vd-glow)"/>
           ${art.spot(52, 176, 228, 12, "#ffe9a8")}`
        : "";
      scene.innerHTML = `${art.defs("vd")}${glow}
        ${art.plank(24, 188, 280, 14)}
        ${art.plank(170, 174, 66, 8, 90)}
        ${art.block(148, 144, 30, "#8a8f96", "", "#5c6168")}
        ${art.ball(166, 106, 24, on ? "#ffe08a" : "#cfd6dd", "#8a8f96")}
        <text x="166" y="62" text-anchor="middle"
          style="font-family:var(--font-head);font-size:13px;font-weight:800;fill:#5b4a2f">Lemputė</text>`;
      // Aprašas atsako į tą patį klausimą, kurį rodo paveikslas: dega ar ne.
      scene.setAttribute(
        "aria-label",
        `${lampSay} `
          + (holder ? `Šviesą laiko ${holder.label.toLowerCase()}.` : "Dabar nė vienas valdiklis nelaiko šviesos."),
      );
    }

    function paintTable() {
      const host = controls.querySelector("#vd-table");
      const keys = valdikliai.map((c) => c.key).filter((k) => st.rows[k]);
      if (!keys.length) {
        host.innerHTML = `<li class="vd-empty">Kol kas tuščia.</li>`;
        return;
      }
      host.innerHTML = keys.map((k) => {
        const c = byKey(k);
        return `<li><span>${c.label}</span><span><span aria-hidden="true">${VD_ARROW[c.behaviour]}</span> `
          + `${VD_DONE[c.behaviour]}</span></li>`;
      }).join("");
    }

    function paint() {
      valdikliai.forEach((c) => {
        const box = controls.querySelector(`#vd-ctl-${c.key}`);
        const isActive = c.key === st.active;
        box.classList.toggle("is-active", isActive);
        box.setAttribute("aria-pressed", String(isActive));
        box.setAttribute(
          "aria-label",
          `${c.label}. ${stateText(c)}. `
            + (isActive ? "Šis valdiklis pasirinktas." : "Bakstelėk, kad pasirinktum."),
        );
        controls.querySelector(`#vd-state-${c.key}`).textContent = stateText(c);
        controls.querySelector(`#vd-icon-${c.key}`).innerHTML = iconOf(c);
      });

      // Spėjimo eilutė lieka virš scenos iki paleidimo (M-15), o ne išnyksta
      // pasirinkus: vaikas turi matyti, ką spėjo, tada kai atleidžia.
      const guessing = st.phase === "pressed";
      guessBar.classList.toggle("is-on", guessing);
      // LL-154: slėpiama klasė, kuri tikrai keičia `display`, o ne `hidden`.
      guessBar.style.display = guessing ? "flex" : "none";
      madeLine.textContent = st.phase === "pressed" && st.guess[st.active]
        ? `Tavo spėjimas: ${st.guess[st.active] === "stay" ? label("stay", "Liks") : label("goes", "Užgęs")}.`
        : "";
      guessStay.setAttribute("aria-pressed", String(st.guess[st.active] === "stay"));
      guessGoes.setAttribute("aria-pressed", String(st.guess[st.active] === "goes"));

      // Neišjungiame (`disabled`), kad fokusas neprapultų (LL-32); būsena
      // pasakoma `aria-disabled`, o paaiškinimas — `readout` tekste.
      pressBtn.setAttribute("aria-disabled", String(st.phase === "pressed"));
      releaseBtn.setAttribute("aria-disabled", String(st.phase !== "pressed" || !st.guess[st.active]));

      paintScene();
      paintTable();
    }

    function announce(text) {
      if (!text || text === st.spoken) return;
      st.spoken = text;
      api.speak(text);
    }

    function press() {
      const c = byKey(st.active);
      if (st.phase === "pressed") {
        const msg = `Pirma atleisk ${lower(st.active)}.`;
        api.readout(msg);
        api.note("Kol valdiklis paspaustas, kito pasirinkti negalima.");
        releaseBtn.focus();
        return;
      }
      st.holder = c.key;
      st.pressed[c.key] = true;
      st.down[c.key] = true;
      st.phase = "pressed";
      paint();

      const text = line("press");
      api.readout(text);
      announce(text);
      if (!st.guess[c.key]) {
        api.note(line("guess") || "Pirma spėk, tada atleisk.");
        guessStay.focus();
      } else {
        api.note(`Spausk „${label("release", "Atleisk")}“.`);
        releaseBtn.focus();
      }
    }

    function chooseGuess(value) {
      if (st.phase !== "pressed") return;
      st.guess[st.active] = value;
      paint();
      api.note(`Spausk „${label("release", "Atleisk")}“.`);
      releaseBtn.focus();
    }

    function release() {
      const c = byKey(st.active);
      if (st.phase !== "pressed") {
        api.readout(`Pirma paspausk ${lower(st.active)}.`);
        api.note(`Spausk „${label("press", "Paspausk")}“.`);
        pressBtn.focus();
        return;
      }
      if (!st.guess[c.key]) {
        api.readout(line("guess") || "Pirma spėk, tada atleisk.");
        guessStay.focus();
        return;
      }

      st.pressed[c.key] = false;
      // Mygtukas grįžta atgal; jungiklis lieka ten, kur buvo nustumtas.
      if (c.behaviour !== "lieka") st.down[c.key] = false;
      st.phase = "idle";
      // Ar tai pirmas šio valdiklio paleidimas — nuo to priklauso, ar
      // sakome padarinį, ar jau visą išvadą. Po „Iš naujo“ lentelė lieka
      // pilna, bet vaikas vėl daro VIENĄ bandymą, todėl jam priklauso
      // padarinys, o ne santrauka (LL-17).
      const firstTime = !st.rows[c.key];
      st.rows[c.key] = true;

      const both = valdikliai.every((x) => st.rows[x.key]);
      const outcome = c.behaviour === "lieka" ? line("stay") : line("goes");
      paint();

      const text = firstTime && both ? line("table") : outcome;
      api.readout(text);
      announce(text);
      api.note(
        (c.behaviour === "lieka"
          ? "Svirtis liko žemyn, todėl šviesa dega be piršto."
          : "Knopkė grįžo aukštyn, todėl šviesa užgęsta.")
          + (firstTime && both
            ? " Abu valdikliai išbandyti."
            : (both ? "" : " Dabar pabandyk kitą valdiklį.")),
      );

      // Pažanga — tik kai abu valdikliai išbandyti ir abi eilutės lentelėje (LL-17).
      if (both && !st.reported) {
        st.reported = true;
        api.progress({ correct: true });
      }
      // Fokusas eina ten, kur vaikui toliau verta žiūrėti: į kito valdiklio
      // dėžutę, o kai abu išbandyti — į „Iš naujo“.
      const next = valdikliai.find((x) => !st.rows[x.key]);
      if (next) controls.querySelector(`#vd-ctl-${next.key}`).focus();
      else resetBtn.focus();
    }

    function selectControl(key) {
      if (st.phase === "pressed") {
        if (key === st.active) {
          releaseBtn.focus();
          return;
        }
        const msg = `Pirma atleisk ${lower(st.active)}.`;
        api.readout(msg);
        api.note("Kol valdiklis paspaustas, kito pasirinkti negalima.");
        releaseBtn.focus();
        return;
      }
      if (key === st.active) {
        press();
        return;
      }
      st.active = key;
      st.spoken = "";
      paint();
      api.readout(`${byKey(key).label} parinktas.`);
      api.note(`Dabar pasirinktas ${lower(key)}. Spausk „${label("press", "Paspausk")}“.`);
      pressBtn.focus();
    }

    function reset() {
      st.active = valdikliai[0].key;
      st.holder = null;
      st.down = {};
      st.pressed = {};
      st.guess = {};
      st.phase = "idle";
      st.spoken = "";
      paint();
      const text = line("reset");
      api.readout(text);
      announce(text);
      api.note(`Spausk „${label("press", "Paspausk")}“ ir pažiūrėk, kas bus atleidus.`);
      const first = controls.querySelector(`#vd-ctl-${valdikliai[0].key}`);
      if (first) first.focus();
    }

    valdikliai.forEach((c) => {
      controls.querySelector(`#vd-ctl-${c.key}`).addEventListener("click", () => selectControl(c.key));
    });
    pressBtn.addEventListener("click", press);
    releaseBtn.addEventListener("click", release);
    resetBtn.addEventListener("click", reset);
    guessStay.addEventListener("click", () => chooseGuess("stay"));
    guessGoes.addEventListener("click", () => chooseGuess("goes"));

    paint();
    api.readout(line("start"));
    api.note(`Spausk „${label("press", "Paspausk")}“ ir pažiūrėk, kas bus atleidus.`);

    // Garsas paleidžiamas tik po pirmo vaiko veiksmo: įkeliant modulį
    // skamba tik instrukcija, kuri jau parašyta `readout` lauke.
    return null;
  },
};

/* ------------------------------------------------------------------ */
/* Audinys: austas ir megztas (23.2.1, 1–2 klasė)                      */
/*                                                                     */
/* Kodėl toks modelis: audinio struktūros vaikas nepamato perbraukęs   */
/* pirštu — skirtumą parodo tik pasekmė. Todėl abu lopeliai rodomi      */
/* priartinti iki siūlų, o vienintelis veiksmas „Ištrauk siūlą“ duoda   */
/* SKIRTINGĄ rezultatą: austame siūlas išslysta, megztame kilputės     */
/* bėga viena po kitos. Nuostata „skiriasi tik raštu“ griūna be         */
/* paaiškinimo, nes raštas abiem atvejais lieka toks pat.              */
/*                                                                     */
/* Skalbimas, dėmės ir temperatūra sąmoningai neliesti — tai           */
/* 06-drabuziu-prieziura; šiame modelyje viena sąvoka ir viena pasekmė. */
/*                                                                     */
/* Abu lopeliai piešiami tame pačiame 140 × 140 lauke ir to paties      */
/* mastelio siūlais, todėl vaikas lygina struktūrą, o ne paveikslo      */
/* stilių (LL-13). Austame — ištisi horizontalūs ir vertikalūs siūlai,  */
/* persidengiantys kas antrą sankirtą; megztame — vertikalios V formos  */
/* kilputės, kurios ir sudaro „kopėčias“, kai viena nutrūksta.          */
/* ------------------------------------------------------------------ */

const AD_STYLE_ID = "cc-audinys-style";

const AD_CSS = `
.ad-wrap { width: 100%; max-width: 360px; margin: 0 auto; }
/* Pasirinkimas pasakomas žodžiu, ne vien rėmelio spalva (T5.5). Eilutė
   rezervuoja aukštį iš anksto, kad parinkus lopelį scena nešokinėtų. */
.ad-pick {
  margin: 0 0 .45rem;
  min-height: 1.4em;
  text-align: center;
  font-size: .95rem;
  font-weight: 800;
  line-height: 1.2;
  color: var(--ink-soft);
  overflow-wrap: break-word;
}
.ad-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }
.ad-cell {
  min-width: 0;
  margin: 0;
  padding: .3rem .3rem .35rem;
  border: 3px solid transparent;
  border-radius: var(--r-s);
  background: color-mix(in srgb, var(--sky) 8%, var(--paper-2));
  text-align: center;
}
.ad-cell.is-on { border-color: var(--accent); }
.ad-cell svg { display: block; width: 100%; height: auto; }
.ad-cell figcaption {
  margin-top: .15rem;
  font-size: .95rem;
  font-weight: 800;
  line-height: 1.15;
  color: var(--ink);
  overflow-wrap: break-word;
}
.ad-choose {
  min-height: 48px;
  padding: .5rem .85rem;
  border: 2px solid var(--line);
  border-radius: var(--r-s);
  background: var(--paper);
  color: var(--ink);
  font: inherit;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  touch-action: manipulation;
}
.ad-choose[aria-pressed="true"] {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 26%, transparent);
}
.ad-choose:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.ad-actions { display: flex; flex-wrap: wrap; gap: .5rem; justify-content: center; margin-top: .6rem; }
`;

function ensureAdStyle() {
  if (document.getElementById(AD_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = AD_STYLE_ID;
  style.textContent = AD_CSS;
  document.head.appendChild(style);
}

/* Austas audinys: ištisi siūlai skersai ir išilgai. Kai vienas ištrauktas,
   jis lieka kaboti prie krašto, o visi kiti siūlai — savo vietoje. */
function wovenScene(pulled) {
  const cell = 14;
  const n = 6;
  const x0 = (140 - n * cell) / 2;
  const y0 = (140 - n * cell) / 2;
  const half = cell / 2;
  const pullRow = 3;
  const edge = x0 + n * cell;

  let g = art.spot(x0 - 9, y0 - 9, n * cell + 18, n * cell + 18, "#f1e3c9", "kampuota");

  // Ataudas: horizontalūs siūlai.
  for (let j = 0; j < n; j += 1) {
    if (pulled && j === pullRow) continue;
    const y = y0 + half + j * cell;
    g += `<line x1="${x0 - 2}" y1="${y}" x2="${edge + 2}" y2="${y}"
      stroke="#9c6a3e" stroke-width="5" stroke-linecap="round"/>`;
  }

  // Metmenys: vertikalūs siūlai po horizontaliais.
  for (let i = 0; i < n; i += 1) {
    const x = x0 + half + i * cell;
    g += `<line x1="${x}" y1="${y0 - 2}" x2="${x}" y2="${y0 + n * cell + 2}"
      stroke="#c08a56" stroke-width="5" stroke-linecap="round"/>`;
  }

  // Kas antras susikirtimas — viršuje horizontalus siūlas, todėl matosi
  // pynimas: vienur viršuje metmenys, kitur ataudai.
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      if ((i + j) % 2 === 0) continue;
      if (pulled && j === pullRow) continue;
      const x = x0 + half + i * cell;
      const y = y0 + half + j * cell;
      g += `<line x1="${x - 5}" y1="${y}" x2="${x + 5}" y2="${y}"
        stroke="#9c6a3e" stroke-width="5" stroke-linecap="round"/>`;
    }
  }

  // Ištrauktas siūlas kybo prie dešiniojo krašto.
  if (pulled) {
    const y = y0 + half + pullRow * cell;
    g += `<path d="M${edge + 2} ${y} C ${edge + 18} ${y + 3} ${edge + 14} ${y + 22} ${edge + 4} ${y + 27}"
      fill="none" stroke="#9c6a3e" stroke-width="4.5" stroke-linecap="round"/>`;
  }

  return g;
}

/* Megztas audinys: vertikalios V formos kilputės. Kai viena nutrūksta,
   visas stulpelis atsiveria iki krašto — skylutė bėga, o siūlas lieka
   kyboti apačioje. */
function knitScene(pulled) {
  const cw = 14;
  const ch = 12;
  const cols = 6;
  const rows = 6;
  const x0 = (140 - cols * cw) / 2;
  const y0 = (140 - rows * ch) / 2;
  const pullCol = 2;
  const bot = y0 + rows * ch + 2;
  const hx = x0 + cw / 2 + pullCol * cw;

  let g = art.spot(x0 - 10, y0 - 10, cols * cw + 20, rows * ch + 20, "#e6eef5", "kampuota");

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (pulled && c === pullCol) continue;
      const x = x0 + cw / 2 + c * cw;
      const y = y0 + 2 + r * ch;
      g += `<path d="M${x - 6} ${y} L${x} ${y + 11} L${x + 6} ${y}"
        fill="none" stroke="#7b9db8" stroke-width="4.4"
        stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  }

  if (pulled) {
    // Plyšys suplyšusio stulpelio vietoje.
    g += `<path d="M${hx - 6} ${y0 + 8} C ${hx - 11} ${y0 + 30} ${hx - 9} ${bot - 18} ${hx - 7} ${bot}
      L ${hx + 7} ${bot} C ${hx + 10} ${bot - 20} ${hx + 11} ${y0 + 28} ${hx + 5} ${y0 + 8} Z"
      fill="#41505c" opacity=".82"/>`;
    // Išsibėgusi gija, kabanti apačioje.
    g += `<path d="M${hx} ${bot} C ${hx + 3} ${bot + 12} ${hx + 17} ${bot + 8} ${hx + 19} ${bot + 21}"
      fill="none" stroke="#7b9db8" stroke-width="4.2" stroke-linecap="round"/>`;
  }

  return g;
}

const audinys = {
  mount({ stage, controls, api, config }) {
    ensureAdStyle();

    const S = config.sentences || {};
    const L = config.labels || {};
    const C = config.captions || {};
    const line = (key) => (typeof S[key] === "string" ? S[key] : "");
    const label = (key, fallback) => (typeof L[key] === "string" ? L[key] : fallback);
    const cap = (key, fallback) => (typeof C[key] === "string" ? C[key] : fallback);

    const st = {
      pick: "woven",
      pulled: { woven: false, knit: false },
      reported: false,
      said: "",
    };

    stage.innerHTML = `
      <div class="ad-wrap">
        <p class="ad-pick" id="ad-pick"></p>
        <div class="ad-pair">
          <figure class="ad-cell" id="ad-woven">
            <svg viewBox="0 0 140 140" role="img" aria-label=""></svg>
            <figcaption>${cap("woven", "Austas")}</figcaption>
          </figure>
          <figure class="ad-cell" id="ad-knit">
            <svg viewBox="0 0 140 140" role="img" aria-label=""></svg>
            <figcaption>${cap("knit", "Megztas")}</figcaption>
          </figure>
        </div>
      </div>`;

    controls.innerHTML = `
      <div class="ad-actions" role="group" aria-label="Audinio pasirinkimas">
        <button type="button" class="ad-choose" id="ad-woven-btn" aria-pressed="false">${label("woven", "Austas audinys")}</button>
        <button type="button" class="ad-choose" id="ad-knit-btn" aria-pressed="false">${label("knit", "Megztas audinys")}</button>
      </div>
      <div class="ad-actions">
        <button type="button" class="btn" id="ad-pull">${label("pull", "Ištrauk siūlą")}</button>
        <button type="button" class="btn ghost" id="ad-again">${label("again", "Iš naujo")}</button>
      </div>`;

    const pickLine = stage.querySelector("#ad-pick");
    const wCell = stage.querySelector("#ad-woven");
    const kCell = stage.querySelector("#ad-knit");
    const wSvg = wCell.querySelector("svg");
    const kSvg = kCell.querySelector("svg");
    const wBtn = controls.querySelector("#ad-woven-btn");
    const kBtn = controls.querySelector("#ad-knit-btn");
    const pullBtn = controls.querySelector("#ad-pull");
    const resetBtn = controls.querySelector("#ad-again");

    function paint() {
      wSvg.innerHTML = wovenScene(st.pulled.woven);
      kSvg.innerHTML = knitScene(st.pulled.knit);

      wSvg.setAttribute(
        "aria-label",
        st.pulled.woven
          ? "Austas audinys: vienas siūlas išslydo, audinys liko vientisas."
          : "Austas audinys: siūlai eina skersai ir išilgai.",
      );
      kSvg.setAttribute(
        "aria-label",
        st.pulled.knit
          ? "Megztas audinys: kilputės bėga, liko plyšys per visą gabalą."
          : "Megztas audinys: kilputės susikabinusios viena su kita.",
      );

      wCell.classList.toggle("is-on", st.pick === "woven");
      kCell.classList.toggle("is-on", st.pick === "knit");
      wBtn.setAttribute("aria-pressed", String(st.pick === "woven"));
      kBtn.setAttribute("aria-pressed", String(st.pick === "knit"));

      const chosen = label(st.pick, "");
      pickLine.textContent = `${label("chosen", "Pasirinkta")}: ${chosen.toLowerCase()}.`;
    }

    function say(text) {
      if (!text || text === st.said) return;
      st.said = text;
      api.speak(text);
    }

    function select(which) {
      st.pick = which;
      st.said = "";
      paint();
      const text = st.pulled[which] ? line("already") : line("select");
      api.readout(text);
      say(text);
      // Paaiškinimas keičiasi kartu su lopeliu: kitaip po ankstesnio
      // bandymo liktų sakinys apie kitą audinį (LL-14 šeima).
      api.note(st.pulled[which]
        ? "Pažiūrėk į plyšį ir palygink su kitu lopeliu."
        : `Spausk „${label("pull", "Ištrauk siūlą")}“ ir žiūrėk, kas bus.`);
      pullBtn.focus();
    }

    function pull() {
      const which = st.pick;
      if (st.pulled[which]) {
        const text = line("already");
        api.readout(text);
        say(text);
        (which === "woven" ? kBtn : wBtn).focus();
        return;
      }

      st.pulled[which] = true;
      st.said = "";
      paint();

      const both = st.pulled.woven && st.pulled.knit;
      const text = both ? line("both") : line(which);
      api.readout(text);
      say(text);

      // Paaiškinimas po veiksmo — kas nutiko, o ne kas „teisinga“.
      api.note(which === "woven"
        ? "Siūlai susikerta. Gretimi siūlai liko savo vietoje."
        : "Viena kilputė laikė kitą. Todėl kilputės bėga toliau.");

      // Pažanga — tik kai abu lopeliai išnagrinėti (LL-17): vienas
      // ištrauktas siūlas dar neparodo skirtumo, nes nėra su kuo lyginti.
      if (both && !st.reported) {
        st.reported = true;
        api.progress({ correct: true });
      }

      if (both) resetBtn.focus();
      else (which === "woven" ? kBtn : wBtn).focus();
    }

    function reset() {
      st.pulled = { woven: false, knit: false };
      st.pick = "woven";
      st.said = "";
      paint();
      const text = line("reset");
      api.readout(text);
      say(text);
      api.note("Pasirink lopelį ir ištrauk siūlą.");
      pullBtn.focus();
    }

    wBtn.addEventListener("click", () => select("woven"));
    kBtn.addEventListener("click", () => select("knit"));
    pullBtn.addEventListener("click", pull);
    resetBtn.addEventListener("click", reset);

    paint();
    api.readout(line("start"));

    return null;
  },
};

export const SIMS = {
  "elektros-grandine": elektrosGrandine,
  "medziagu-bandymas": medziaguBandymas,
  "lankstymas-ir-karpiniai": lankstymasIrKarpiniai,
  "drabuziu-prieziura": drabuziuPrieziura,
  "batas": batas,
  "valdiklis": valdiklis,
  "audinys": audinys,
};
