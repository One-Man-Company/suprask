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

export const SIMS = {
  "elektros-grandine": elektrosGrandine,
};
