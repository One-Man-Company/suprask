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
.cc-bar {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  right: 0;
  height: 9px;
  border-radius: 5px;
  background: var(--ink);
  transition: left .18s ease, right .18s ease;
}
.cc-wire.is-off .cc-bar {
  left: 22px;
  right: 22px;
  background: repeating-linear-gradient(90deg, var(--ink-faint) 0 9px, transparent 9px 15px);
}
.cc-half-l { right: calc(50% + 28px); }
.cc-half-r { left: calc(50% + 28px); }
.cc-wire.is-off .cc-half-l { left: 22px; }
.cc-wire.is-off .cc-half-r { right: 22px; }
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
  .cc-bar, .cc-lever { transition: none; }
}
`;

const DEFAULT_SAY = {
  pradzia: "Pradedam. Prijunk laidus ir pažiūrėk, ar lemputė šviečia.",
  "nera-laido": "Nė vieno laido. Kelias visai nutrūkęs.",
  "vienas-virsutinis": "Vienas laidas. Nuo baterijos iki lemputės kelias yra, o atgal nėra.",
  "vienas-apatinis": "Vienas laidas. Atgal į bateriją veda, bet iki lemputės neateina.",
  jungiklis: "Abu laidai prijungti. Jungiklis atidarytas, todėl kelias nutrūkęs.",
  sviecia: "Kelias vientisas. Lemputė šviečia.",
  "is-naujo": "Pradedam iš naujo. Prijunk laidus.",
};

const NOTES = {
  "nera-laido": "Bakstelėk laidą — jis prisijungs prie baterijos ir lemputės.",
  "vienas-virsutinis": "Kelias turi sugrįžti į bateriją. Prijunk ir antrą laidą.",
  "vienas-apatinis": "Kelias prasideda ne nuo baterijos. Prijunk ir viršutinį laidą.",
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
      <div class="cc-board">
        <div class="cc-part cc-battery" role="img" aria-label="Baterija su pliuso ir minuso galais">
          <span class="cc-sign" aria-hidden="true">+</span>
          <span class="cc-name">Baterija</span>
          <span class="cc-sign" aria-hidden="true">−</span>
        </div>
        <div class="cc-part cc-lamp" id="cc-lamp" role="img" aria-label="Lemputė nešviečia">
          <span class="cc-bulb" aria-hidden="true"></span>
          <span class="cc-name">Lemputė</span>
        </div>
        <button type="button" class="cc-wire is-off" id="cc-top" aria-pressed="false">
          <span class="cc-bar" aria-hidden="true"></span>
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
      lamp.classList.toggle("is-on", lit);

      label(topBtn, "Viršutinis laidas", top, "Prijungtas", "Neprijungtas");
      label(bottomBtn, "Apatinis laidas", bottom, "Prijungtas", "Neprijungtas");
      switchBtn.setAttribute("aria-pressed", String(closed));
      switchBtn.setAttribute(
        "aria-label",
        closed
          ? "Jungiklis. Uždarytas: kelias vientisas. Bakstelėk, kad atidarytum."
          : "Jungiklis. Atidarytas: kelias nutrūkęs. Bakstelėk, kad uždarytum.",
      );
      lamp.setAttribute("aria-label", lit ? "Lemputė šviečia" : "Lemputė nešviečia");

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

export const SIMS = {
  "elektros-grandine": elektrosGrandine,
  "medziagu-bandymas": medziaguBandymas,
};
