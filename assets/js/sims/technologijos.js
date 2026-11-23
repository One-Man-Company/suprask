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
/* Mygtukas ir jungiklis: kas lieka įjungta, kai nuimi pirštą          */
/*                                                                     */
/* Kodėl toks modelis: 1 klasėje valdiklio skirtumas aiškinamas ne    */
/* žodžiais, o ranka. Tas pats šviestuvas, tas pats kelias, vienas     */
/* skirtumas — kelyje arba jungiklis (įsimena padėtį), arba mygtukas  */
/* (veikia tik laikomas). Vaikas pats atranda, kad atleidus pirštą    */
/* šviesa užgęsta, ir tik tada tekstas tai įvardija. Elektros srauto  */
/* nepiešiame, kaip ir 01-elektros-grandine (žr. failo įžangą).       */
/* ------------------------------------------------------------------ */

const VJ_STYLE_ID = "cc-valdiklis-style";

const VJ_CSS = `
.vj-board {
  position: relative;
  width: 100%;
  max-width: 420px;
  height: 240px;
  margin: 0 auto;
  border-radius: var(--r-m);
  background: var(--paper);
  background: color-mix(in srgb, var(--sky) 7%, var(--paper-2));
}
.vj-part {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 68px;
  height: 92px;
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
.vj-battery { left: 0; }
.vj-lamp { right: 0; }
.vj-sign { font-size: 1.1rem; font-weight: 900; line-height: 1; color: var(--ink); }
.vj-name { font-size: .78rem; font-weight: 800; line-height: 1.1; color: var(--ink-soft); }
.vj-bulb {
  display: block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid var(--ink);
  background: var(--paper);
}
.vj-lamp.is-on .vj-bulb {
  background: var(--sun);
  box-shadow: 0 0 0 6px color-mix(in srgb, var(--sun) 38%, transparent),
              0 0 18px 6px color-mix(in srgb, var(--sun) 45%, transparent);
}
.vj-wire {
  position: absolute;
  height: 9px;
  border-radius: 5px;
  background: var(--ink);
  transition: background-color .18s ease;
}
.vj-top { left: 68px; right: 68px; top: 84px; }
.vj-left { left: 68px; right: calc(50% + 42px); top: 156px; }
.vj-right { left: calc(50% + 42px); right: 68px; top: 156px; }
.vj-wire.is-off {
  background: repeating-linear-gradient(90deg, var(--ink-faint) 0 9px, transparent 9px 15px);
}
.vj-slot {
  position: absolute;
  left: 50%;
  top: 118px;
  transform: translateX(-50%);
  width: 84px;
  height: 76px;
  margin: 0;
  padding: 0;
  border: 3px solid var(--ink);
  border-radius: 12px;
  background: var(--paper-2);
  cursor: pointer;
  touch-action: manipulation;
}
.vj-slot:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.vj-slot-name {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 200px;
  font-size: .82rem;
  font-weight: 800;
  color: var(--ink-soft);
  white-space: nowrap;
}
.vj-switch {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 46px;
  height: 46px;
}
.vj-pivot {
  position: absolute;
  left: 7px;
  top: 50%;
  margin-top: -5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--ink);
}
.vj-lever {
  position: absolute;
  left: 10px;
  top: 50%;
  width: 30px;
  height: 8px;
  margin-top: -4px;
  border-radius: 4px;
  background: var(--ink-faint);
  transform-origin: 0 50%;
  transform: rotate(-32deg);
  transition: transform .18s ease, background-color .18s ease;
}
.vj-slot.is-on .vj-lever { background: var(--accent); transform: rotate(0deg); }
.vj-push {
  display: none;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 46px;
  height: 46px;
  box-sizing: border-box;
  border: 3px solid var(--ink);
  border-radius: 50%;
  background: var(--paper);
  box-shadow: inset 0 -4px 0 var(--line);
}
.vj-slot.is-button .vj-switch { display: none; }
.vj-slot.is-button .vj-push { display: block; }
.vj-slot.is-down .vj-push {
  background: var(--sun);
  box-shadow: inset 0 3px 0 var(--line);
  transform: translate(-50%, calc(-50% + 3px));
}
.vj-pick {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  justify-content: center;
}
.vj-chip {
  min-height: 48px;
  min-width: 7.5rem;
  padding: .5rem .8rem;
  border: 2px solid var(--line);
  border-radius: var(--r-s);
  background: var(--paper-2);
  color: var(--ink);
  font: inherit;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
}
.vj-chip[aria-pressed="true"] {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 30%, transparent);
}
.vj-chip:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) {
  .vj-wire, .vj-lever, .vj-push { transition: none; }
}
`;

const VJ_SAY = {
  pradzia: "Pradėk nuo jungiklio. Pasuk jį ir nuimk pirštą.",
  "jungiklis-ijungtas": "Šviesa dega. Nuimk pirštą ir pažiūrėk, ar dega toliau.",
  "jungiklis-isjungtas": "Šviesa užgęsta. Jungiklis liko pasuktoje padėtyje.",
  "mygtukas-nepaspaustas": "Mygtukas nepaspaustas, todėl šviesa nešviečia. Spausk ir laikyk.",
  "mygtukas-laikomas": "Šviesa dega, kol laikai mygtuką.",
  "mygtukas-atleistas": "Atleidai pirštą — šviesa užgęsta. Mygtukas nieko neįsimena.",
  "abu-bandyti": "Jungiklis šviesą palieka. Mygtukas dega tik kol laikai.",
  "is-naujo": "Pradedam iš naujo. Įdėtas jungiklis, šviesa neuždegta.",
};

const VJ_NOTES = {
  pradzia: "Bakstelėk jungiklį — jis dabar išjungtas.",
  "jungiklis-ijungtas": "Pirštas jau nebe ant jungiklio. Šviesa vis tiek dega.",
  "jungiklis-isjungtas": "Dabar įdėk mygtuką ir palaikyk jį.",
  "mygtukas-nepaspaustas": "Laikyk pirštą ant mygtuko, o tada atleisk.",
  "mygtukas-laikomas": "Laikyk, kol suskaičiuosi iki trijų. Tada atleisk.",
  "mygtukas-atleistas": "Paliesk mygtuką dar kartą ir vėl atleisk — šviesa vėl užges.",
};

function ensureVjStyle() {
  if (document.getElementById(VJ_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = VJ_STYLE_ID;
  style.textContent = VJ_CSS;
  document.head.appendChild(style);
}

const mygtukasIrJungiklis = {
  mount({ stage, controls, api, config }) {
    ensureVjStyle();

    const say = config.sentences || {};
    const line = (key) => say[key] || VJ_SAY[key] || "";

    stage.innerHTML = `
      <div class="vj-board" id="vj-board" role="group" aria-label="Baterija ir lemputė, kelyje vienas valdiklis">
        <span class="vj-wire vj-top" aria-hidden="true"></span>
        <span class="vj-wire vj-left is-off" id="vj-left" aria-hidden="true"></span>
        <span class="vj-wire vj-right is-off" id="vj-right" aria-hidden="true"></span>
        <div class="vj-part vj-battery" role="img" aria-label="Baterija su pliuso ir minuso galais">
          <span class="vj-sign" aria-hidden="true">+</span>
          <span class="vj-name">Baterija</span>
          <span class="vj-sign" aria-hidden="true">−</span>
        </div>
        <div class="vj-part vj-lamp" id="vj-lamp" role="img" aria-label="Lemputė nešviečia">
          <span class="vj-bulb" aria-hidden="true"></span>
          <span class="vj-name">Lemputė</span>
        </div>
        <button type="button" class="vj-slot" id="vj-slot" aria-pressed="false">
          <span class="vj-switch" aria-hidden="true">
            <span class="vj-pivot"></span>
            <span class="vj-lever"></span>
          </span>
          <span class="vj-push" aria-hidden="true"></span>
        </button>
        <span class="vj-slot-name" id="vj-slot-name" aria-hidden="true">Jungiklis</span>
      </div>`;

    controls.innerHTML = `
      <div class="vj-pick">
        <button type="button" class="vj-chip" id="vj-pick-switch" aria-pressed="true">Jungiklis</button>
        <button type="button" class="vj-chip" id="vj-pick-button" aria-pressed="false">Mygtukas</button>
      </div>
      <button type="button" class="btn ghost" id="vj-reset">Iš naujo</button>`;

    const board = stage.querySelector("#vj-board");
    const lamp = stage.querySelector("#vj-lamp");
    const slot = stage.querySelector("#vj-slot");
    const slotName = stage.querySelector("#vj-slot-name");
    const leftWire = stage.querySelector("#vj-left");
    const rightWire = stage.querySelector("#vj-right");
    const pickSwitch = controls.querySelector("#vj-pick-switch");
    const pickButton = controls.querySelector("#vj-pick-button");

    // Būsena: kelyje vienas valdiklis. Jungiklis turi padėtį, mygtukas — ne.
    let device = "jungiklis";
    let switchOn = false;
    let buttonDown = false;
    let buttonTested = false;
    let switchTested = false;
    let firstTouch = true;
    let progressed = false;
    let lastSpoken = "";
    let pulseTimer = null;

    function lit() {
      return device === "jungiklis" ? switchOn : buttonDown;
    }

    function stateKey() {
      if (firstTouch) return "pradzia";
      if (device === "jungiklis") return switchOn ? "jungiklis-ijungtas" : "jungiklis-isjungtas";
      if (buttonDown) return "mygtukas-laikomas";
      return buttonTested ? "mygtukas-atleistas" : "mygtukas-nepaspaustas";
    }

    function slotLabel() {
      if (device === "jungiklis") {
        return switchOn
          ? "Jungiklis. Įjungtas: šviesa dega. Pasuk, kad išjungtum."
          : "Jungiklis. Išjungtas: šviesa nešviečia. Pasuk, kad uždegtum.";
      }
      return buttonDown
        ? "Mygtukas. Laikai paspaudęs: šviesa dega. Atleisk pirštą."
        : "Mygtukas. Nepaspaustas: šviesa nešviečia. Spausk ir laikyk.";
    }

    function render() {
      const key = stateKey();
      const on = lit();
      const both = switchTested && buttonTested;

      slot.classList.toggle("is-button", device === "mygtukas");
      slot.classList.toggle("is-on", device === "jungiklis" && switchOn);
      slot.classList.toggle("is-down", device === "mygtukas" && buttonDown);
      slot.setAttribute("aria-pressed", String(on));
      slot.setAttribute("aria-label", slotLabel());

      lamp.classList.toggle("is-on", on);
      lamp.setAttribute("aria-label", on ? "Lemputė šviečia" : "Lemputė nešviečia");
      leftWire.classList.toggle("is-off", !on);
      rightWire.classList.toggle("is-off", !on);
      slotName.textContent = device === "jungiklis" ? "Jungiklis" : "Mygtukas";

      pickSwitch.setAttribute("aria-pressed", String(device === "jungiklis"));
      pickButton.setAttribute("aria-pressed", String(device === "mygtukas"));
      board.setAttribute(
        "aria-label",
        `Baterija kairėje, lemputė dešinėje. Kelyje ${device === "jungiklis" ? "jungiklis" : "mygtukas"}. `
          + `Lemputė ${on ? "šviečia" : "nešviečia"}.`,
      );

      api.readout(line(key));
      // Kai abu valdikliai jau išbandyti, užuominos nebereikia: lieka pati
      // išvada, kurią vaikas ką tik pamatė savo rankomis.
      api.note(both ? line("abu-bandyti") : (VJ_NOTES[key] || ""));

      if (key !== lastSpoken) {
        lastSpoken = key;
        api.speak(line(key));
      }

      // Rezultatas — abi patirtys iš eilės: jungiklis paliko šviesą degti,
      // mygtukas užgeso atleidus. Vienas prisilietimas pažangos nežymi.
      if (both && !progressed) {
        progressed = true;
        api.progress({ correct: true });
      }
    }

    function touch(fn) {
      firstTouch = false;
      fn();
      lastSpoken = "";
      render();
    }

    function press() {
      if (device !== "mygtukas" || buttonDown) return;
      touch(() => { buttonDown = true; });
    }

    function release() {
      if (device !== "mygtukas" || !buttonDown) return;
      touch(() => {
        buttonDown = false;
        buttonTested = true;
      });
    }

    function choose(next) {
      if (device === next) return;
      touch(() => {
        device = next;
        buttonDown = false;
      });
    }

    // Jungiklis: pasukimas išlieka. Mygtukas: veikia tik laikomas.
    slot.addEventListener("click", (e) => {
      if (device === "jungiklis") {
        touch(() => {
          switchOn = !switchOn;
          if (switchOn) switchTested = true;
        });
        return;
      }
      // Klaviatūros ar pagalbinių technologijų paleistas paspaudimas neturi
      // „laikymo“, todėl parodomas trumpas paspaudimas ir atleidimas.
      if (e.detail === 0) {
        press();
        if (pulseTimer) clearTimeout(pulseTimer);
        pulseTimer = setTimeout(() => { pulseTimer = null; release(); }, 500);
      }
    });

    // Piršto nutraukimas nuo mygtuko neturi užgesti vien todėl, kad tekstas
    // virš simuliacijos pasikeitė ir scena trumpam pasislinko po pirštu.
    // Todėl paspaudimas „pažymimas“ (pointer capture): atleidimas įskaitomas
    // tik tikru pointerup ar pointercancel, o ne pointerleave dėl išdėstymo.
    slot.addEventListener("pointerdown", (e) => {
      if (device !== "mygtukas" || e.button > 0) return;
      try { slot.setPointerCapture(e.pointerId); } catch { /* senos naršyklės */ }
      press();
    });
    slot.addEventListener("pointerup", (e) => {
      try {
        if (slot.hasPointerCapture(e.pointerId)) slot.releasePointerCapture(e.pointerId);
      } catch { /* senos naršyklės */ }
      release();
    });
    slot.addEventListener("pointercancel", () => release());
    slot.addEventListener("blur", () => release());

    slot.addEventListener("keydown", (e) => {
      if (device !== "mygtukas") return;
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      if (e.repeat) return;
      press();
    });
    slot.addEventListener("keyup", (e) => {
      if (device !== "mygtukas") return;
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      release();
    });

    pickSwitch.addEventListener("click", () => choose("jungiklis"));
    pickButton.addEventListener("click", () => choose("mygtukas"));

    controls.querySelector("#vj-reset").addEventListener("click", () => {
      if (pulseTimer) { clearTimeout(pulseTimer); pulseTimer = null; }
      device = "jungiklis";
      switchOn = false;
      buttonDown = false;
      buttonTested = false;
      switchTested = false;
      firstTouch = false;
      progressed = false;
      lastSpoken = "is-naujo";
      render();
      const text = line("is-naujo");
      api.readout(text);
      api.note(VJ_NOTES["pradzia"]);
      api.speak(text);
    });

    // Pirmas ekrano tekstas kviečia veikti, o ne aprašo būseną.
    // Garsas paleidžiamas tik po pirmo vaiko prisilietimo, ne įkeliant modulį.
    lastSpoken = stateKey();
    render();

    return () => {
      if (pulseTimer) clearTimeout(pulseTimer);
    };
  },
};

export const SIMS = {
  "elektros-grandine": elektrosGrandine,
  "medziagu-bandymas": medziaguBandymas,
  "lankstymas-ir-karpiniai": lankstymasIrKarpiniai,
  "drabuziu-prieziura": drabuziuPrieziura,
  "mygtukas-ir-jungiklis": mygtukasIrJungiklis,
};
