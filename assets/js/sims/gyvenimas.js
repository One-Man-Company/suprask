/**
 * Gyvenimo įgūdžių simuliacijos (1 klasė).
 *
 * `dovana-ir-noras` — M-05 modelis (research/wiki/grades/01/metodai.md#M-05):
 * tas pats įvykis (dovana) laikomas pastovus, o keičiamas TIK vieno veikėjo
 * noras. Antras veikėjas yra kontrolinė pora: jo noras nekinta, todėl jo veidas
 * nepakinta nė karto. Jei jausmą lemtų dovana, abu veidai keistųsi kartu.
 *
 * Kodėl scena surenkama iš art.js dalių: stalas (plank), vaikai (kid), dėžutė
 * (block), kamuolys (ball) — tai tos pačios formos kaip kitose scenose (LL-13).
 * Veido išraiškos art.js neturi (standarto „Iliustracijos“ sąraše tokios dalies
 * nėra), todėl akys ir burna piešiamos čia pat — jos ir yra kintamoji būsena,
 * kurios negalima pakeisti jokia bendra dalimi.
 *
 * Tekstas scenoje nerašomas: SVG sumažinamas iki 300 px pločio, o 6–7 metų
 * vaikui mažas tekstas telefone yra atskiras defektas (LL-06). Vardai ir jausmų
 * žodžiai yra HTML, todėl jie išlieka skaitomo dydžio visuose plotuose.
 */
import { art } from "./art.js";

/** Veido išraiška ant `art.kid` galvos. mood: happy | sad | neutral */
function face(cx, cy, r, mood) {
  const f = (v) => v.toFixed(1);
  const eyeY = cy - r * 0.2;
  const eyeDx = r * 0.38;
  const dot = (x) => `<circle cx="${f(x)}" cy="${f(eyeY)}" r="${f(r * 0.14)}" fill="#3a342b"/>`;
  const stroke = `fill="none" stroke="#3a342b" stroke-width="${f(r * 0.16)}" stroke-linecap="round"`;
  let mouth;
  if (mood === "happy") {
    mouth = `<path d="M${f(cx - r * 0.44)} ${f(cy + r * 0.26)} Q ${f(cx)} ${f(cy + r * 0.7)} ${f(cx + r * 0.44)} ${f(cy + r * 0.26)}" ${stroke}/>`;
  } else if (mood === "sad") {
    mouth = `<path d="M${f(cx - r * 0.44)} ${f(cy + r * 0.62)} Q ${f(cx)} ${f(cy + r * 0.18)} ${f(cx + r * 0.44)} ${f(cy + r * 0.62)}" ${stroke}/>`;
  } else {
    mouth = `<line x1="${f(cx - r * 0.36)}" y1="${f(cy + r * 0.4)}" x2="${f(cx + r * 0.36)}" y2="${f(cy + r * 0.4)}" ${stroke}/>`;
  }
  return dot(cx - eyeDx) + dot(cx + eyeDx) + mouth;
}

/**
 * Kilmininkas tiems daiktams, kuriuos simuliacija gali pavadinti sakinyje
 * („norėjo kamuolio“, ne „norėjo kamuolys“). Nežinomas žodis lieka kaip yra —
 * tada sakinys skamba prasčiau, bet ne meluoja.
 */
const GENITIVE = {
  kamuolys: "kamuolio",
  knyga: "knygos",
  pieštukas: "pieštuko",
  trintukas: "trintuko",
  šalikas: "šaliko",
  lėlė: "lėlės",
};

const gen = (word) => GENITIVE[word] || word;

/** Noro burbulo piktograma. Knyga — staciakampis su nugarėle ir lapų linijomis. */
function wantIcon(kind, size = 36) {
  if (kind === "kamuolys") {
    return `<svg viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true" focusable="false">${art.ball(20, 20, 15)}</svg>`;
  }
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true" focusable="false">
    ${art.flatShape("staciakampis", 21, 20, 34)}
    <line x1="12" y1="10.4" x2="12" y2="29.6" stroke="#6d4a1c" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="16" y1="15" x2="30" y2="15" stroke="#6d4a1c" stroke-width="1.5" opacity=".45"/>
    <line x1="16" y1="20" x2="30" y2="20" stroke="#6d4a1c" stroke-width="1.5" opacity=".45"/>
    <line x1="16" y1="25" x2="30" y2="25" stroke="#6d4a1c" stroke-width="1.5" opacity=".45"/>
  </svg>`;
}

const dovanIrNoras = {
  mount({ stage, controls, api, config }) {
    const S = config.sentences || {};
    const gift = config.gift || "kamuolys";
    const fixed = config.fixed || { name: "Ieva", wants: "knyga" };
    const varying = config.varying || { name: "Rėjus", wants: gift };
    const OPTIONS = [gift, fixed.wants];
    const START_WANT = OPTIONS.includes(varying.wants) ? varying.wants : gift;

    let wants = START_WANT;
    let open = false;
    let predicted = false;
    const seen = new Set();
    let reported = false;

    stage.innerHTML = `
      <div style="width:100%;max-width:26rem">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-bottom:.45rem">
          <div style="display:grid;justify-items:center;gap:.2rem;min-width:0">
            <span style="font-weight:800;font-size:.95rem;color:var(--ink-soft)">${varying.name}</span>
            <button type="button" id="dn-want"
              style="width:100%;min-height:3.8rem;padding:.4rem .3rem;border:2px dashed var(--ink-soft);border-radius:1rem;background:var(--paper);display:grid;justify-items:center;gap:.1rem;font:inherit;font-weight:800;color:var(--ink);cursor:pointer">
              <span id="dn-want-icon" aria-hidden="true">${wantIcon(wants)}</span>
              <span id="dn-want-word" style="font-size:1rem">${wants}</span>
              <span style="font-size:.8rem;font-weight:700;color:var(--ink-soft)">Pakeisk norą</span>
            </button>
          </div>
          <div style="display:grid;justify-items:center;gap:.2rem;min-width:0">
            <span style="font-weight:800;font-size:.95rem;color:var(--ink-soft)">${fixed.name}</span>
            <div style="width:100%;min-height:3.8rem;padding:.4rem .3rem;border:2px solid var(--line);border-radius:1rem;background:var(--paper-2);display:grid;justify-items:center;gap:.1rem;font-weight:800;color:var(--ink)">
              <span aria-hidden="true">${wantIcon(fixed.wants)}</span>
              <span style="font-size:1rem">${fixed.wants}</span>
              <span style="font-size:.8rem;font-weight:700;color:var(--ink-soft)">Noras nesikeičia</span>
            </div>
          </div>
        </div>

        <svg id="dn-scene" viewBox="0 0 320 210" width="100%" role="img" style="display:block"
             aria-label="Scena"></svg>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem;text-align:center;margin-top:.35rem">
          <div id="dn-r-mood" style="font-weight:800;min-height:1.6rem">—</div>
          <div id="dn-i-mood" style="font-weight:800;min-height:1.6rem">—</div>
        </div>

        <p id="dn-compare" hidden
           style="margin:.7rem 0 0;padding:.6rem .8rem;border-left:4px solid var(--sun);background:var(--paper-2);border-radius:.5rem;font-size:1rem"></p>
      </div>`;

    const svg = stage.querySelector("#dn-scene");
    const wantBtn = stage.querySelector("#dn-want");
    const wantIconBox = stage.querySelector("#dn-want-icon");
    const wantWord = stage.querySelector("#dn-want-word");
    const rMoodEl = stage.querySelector("#dn-r-mood");
    const iMoodEl = stage.querySelector("#dn-i-mood");
    const compareEl = stage.querySelector("#dn-compare");

    controls.innerHTML = `
      <button class="btn" id="dn-say" aria-label="Sakau. Atsakiau į klausimą.">Sakau</button>
      <button class="btn secondary" id="dn-open" aria-label="Atidaryti dovanos dėžutę">Atidaryk dėžutę</button>
      <button class="btn ghost" id="dn-reset" aria-label="Pradėti iš naujo">Iš naujo</button>`;
    const sayBtn = controls.querySelector("#dn-say");
    const openBtn = controls.querySelector("#dn-open");
    const resetBtn = controls.querySelector("#dn-reset");

    function drawScene(rMood, iMood) {
      const kidScale = 1.35;
      const headY = 176 - 33 * kidScale;
      const headR = 8 * kidScale;
      svg.innerHTML = `
        ${art.plank(40, 186, 240, 12, 0)}
        ${art.kid(72, 176, kidScale, "#ff8a3d")}
        ${art.kid(248, 176, kidScale, "#4fc3a1")}
        <g data-face="varying" data-mood="${rMood}">${face(72, headY, headR, rMood)}</g>
        <g data-face="fixed" data-mood="${iMood}">${face(248, headY, headR, iMood)}</g>
        ${art.block(138, 126, 46, "#e9a13a", open ? "" : "?", "#a06a1c")}
        ${open ? art.ball(161, 118, 15) : ""}`;
    }

    function paint({ speak = false } = {}) {
      const rMood = !open ? "neutral" : wants === gift ? "happy" : "sad";
      const iMood = !open ? "neutral" : "sad";
      if (open) seen.add(wants);
      const compared = open && seen.size >= 2;

      drawScene(rMood, iMood);
      wantIconBox.innerHTML = wantIcon(wants);
      wantWord.textContent = wants;
      wantBtn.setAttribute("aria-label", `${varying.name} nori ${wants}. Pakeisk norą.`);
      wantBtn.setAttribute("aria-pressed", String(open && wants === gift));

      rMoodEl.textContent = open ? (rMood === "happy" ? "patenkintas" : "nusiminęs") : "—";
      iMoodEl.textContent = open ? "nusiminęs" : "—";

      compareEl.hidden = !compared;
      compareEl.textContent = compared
        ? `Kai ${varying.name} norėjo ${gen(gift)}, jis džiaugėsi. Kai ${varying.name} norėjo ${gen(fixed.wants)}, nusiminė abu.`
        : "";

      svg.setAttribute(
        "aria-label",
        open
          ? `${varying.name} norėjo ${gen(wants)}. ${fixed.name} norėjo ${gen(fixed.wants)}. Dėžutėje ${gift}.`
          : `Dėžutė uždaryta. ${varying.name} nori ${wants}. ${fixed.name} nori ${fixed.wants}.`
      );

      let text;
      if (!predicted) text = S.predict || "";
      else if (!open) text = S.start || "";
      else if (compared) text = S.same || "";
      else if (rMood === "happy") text = S.one || "";
      else text = S.both || "";
      api.readout(text);
      if (speak && text) api.speak(text, { rate: 0.9 });

      let note;
      if (!predicted) note = "Pasakyk savo spėjimą. Tada spausk „Sakau“.";
      else if (!open) note = "Dabar keisk norą arba atidaryk dėžutę.";
      else if (compared) note = "Tas pats kamuolys. Vienas jo norėjo, kitas ne.";
      else if (wants !== gift) note = "Pasikeitė tik noras. Dovana liko ta pati.";
      else note = `${varying.name} norėjo ${gen(gift)}. ${fixed.name} norėjo ${gen(fixed.wants)}.`;
      api.note(note);

      if (open && seen.size >= 2 && !reported) {
        reported = true;
        api.progress({ correct: true });
      }
    }

    function toggleWant() {
      if (!predicted) {
        api.note("Pirmiausia atsakyk į klausimą. Tada keisk norą.");
        return;
      }
      wants = wants === gift ? fixed.wants : gift;
      paint({ speak: true });
    }

    wantBtn.addEventListener("click", toggleWant);
    wantBtn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        toggleWant();
      }
    });

    sayBtn.addEventListener("click", () => {
      predicted = true;
      paint({ speak: true });
    });

    openBtn.addEventListener("click", () => {
      if (!predicted) {
        api.note("Pirmiausia atsakyk į klausimą. Tada atidaryk.");
        return;
      }
      open = !open;
      openBtn.textContent = open ? "Uždaryk dėžutę" : "Atidaryk dėžutę";
      openBtn.setAttribute("aria-label", open ? "Uždaryti dovanos dėžutę" : "Atidaryti dovanos dėžutę");
      paint({ speak: true });
    });

    resetBtn.addEventListener("click", () => {
      wants = START_WANT;
      open = false;
      predicted = false;
      openBtn.textContent = "Atidaryk dėžutę";
      openBtn.setAttribute("aria-label", "Atidaryti dovanos dėžutę");
      paint();
    });

    paint();
    return null;
  },
};

export const SIMS = {
  "dovana-ir-noras": dovanIrNoras,
};
