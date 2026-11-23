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

/* ------------------------------------------------------------------ */
/* `zodis-per-ekrana` — virtualumas (Etika: „Aš ir virtualumas“)        */
/*                                                                     */
/* Klaidinga nuostata, kurią modelis turi parodyti: „ekrane aš nesu     */
/* matomas, todėl mano žodis žmogaus nepasiekia ir jo neliečia“.       */
/* Modelis laiko ŽODĮ vieninteliu kintamuoju, o kanalą (gyvai / per     */
/* ekraną) — antru pasirinkimu. Gavėjo veidas keičiasi nuo žodžio        */
/* prasmės, o ne nuo kanalo: tas pats žodis abiem keliais duoda tą patį  */
/* veidą. Todėl vaikas ne iš teksto, o iš dviejų savo paties siuntimų    */
/* pamato, kad ekranas žmogaus neapsaugo.                              */
/*                                                                     */
/* Kodėl gavėjo veidas yra kintamoji būsena, o ne tekstas: 6–7 metų     */
/* vaikas jausmą skaito iš veido, ne iš sakinio (Widen & Russell, 2008, */
/* žr. modulio `sources`). Scena renkama iš art.js dalių (LL-13): kalvos, */
/* žolė, vaikai. Veido art.js neturi, todėl akys ir burna piešiamos čia  */
/* pat — jos ir yra tai, kas kinta.                                    */
/* ------------------------------------------------------------------ */

/** Veido išraiška ant `art.kid` galvos. mood: happy | sad | neutral.
 *  Antakiai kinta kartu su burna: vien burnos lankstas 360 px ekrane yra
 *  ~4 px, o antakiai kartu duoda ženklą, kurį vaikas atskiria iš tolo.
 */
function veidas(cx, cy, r, mood) {
  const f = (v) => v.toFixed(1);
  const eyeY = cy - r * 0.2;
  const eyeDx = r * 0.38;
  const stroke = `fill="none" stroke="#3a342b" stroke-width="${f(r * 0.16)}" stroke-linecap="round"`;
  const akys = [-eyeDx, eyeDx]
    .map((dx) => `<circle cx="${f(cx + dx)}" cy="${f(eyeY)}" r="${f(r * 0.14)}" fill="#3a342b"/>`)
    .join("");
  const brow = (left, right) => (left && right)
    ? `<path d="M${f(cx - r * 0.62)} ${f(eyeY - r * 0.5)} L${f(cx - r * 0.2)} ${f(eyeY - r * 0.36)}"
            ${stroke} stroke-width="${f(r * 0.14)}"/>`
      + `<path d="M${f(cx + r * 0.62)} ${f(eyeY - r * 0.5)} L${f(cx + r * 0.2)} ${f(eyeY - r * 0.36)}"
            ${stroke} stroke-width="${f(r * 0.14)}"/>`
    : "";
  if (mood === "happy") {
    /* Linksma: burna kyla į viršų, antakiai pakelti ir lankstūs. */
    const b = `<path d="M${f(cx - r * 0.6)} ${f(eyeY - r * 0.34)} Q ${f(cx - r * 0.4)} ${f(eyeY - r * 0.6)} ${f(cx - r * 0.18)} ${f(eyeY - r * 0.46)}"
            ${stroke} stroke-width="${f(r * 0.13)}"/>`
      + `<path d="M${f(cx + r * 0.6)} ${f(eyeY - r * 0.34)} Q ${f(cx + r * 0.4)} ${f(eyeY - r * 0.6)} ${f(cx + r * 0.18)} ${f(eyeY - r * 0.46)}"
            ${stroke} stroke-width="${f(r * 0.13)}"/>`;
    return akys + b
      + `<path d="M${f(cx - r * 0.46)} ${f(cy + r * 0.22)} Q ${f(cx)} ${f(cy + r * 0.86)} ${f(cx + r * 0.46)} ${f(cy + r * 0.22)}" ${stroke}/>`;
  }
  if (mood === "sad") {
    /* Liūdna: burna leidžiasi, antakiai nuleisti į šonus. */
    return akys + brow(true, true)
      + `<path d="M${f(cx - r * 0.46)} ${f(cy + r * 0.72)} Q ${f(cx)} ${f(cy + r * 0.1)} ${f(cx + r * 0.46)} ${f(cy + r * 0.72)}" ${stroke}/>`;
  }
  return akys + `<line x1="${f(cx - r * 0.36)}" y1="${f(cy + r * 0.42)}" x2="${f(cx + r * 0.36)}" y2="${f(cy + r * 0.42)}" ${stroke}/>`;
}

const zodisPerEkrana = {
  mount({ stage, controls, api, config }) {
    const S = config.sentences || {};
    const WORDS = (Array.isArray(config.words) ? config.words : [])
      .filter((w) => typeof w === "string" && w.trim());
    const TONES = Array.isArray(config.tones) ? config.tones : [];
    const LABELS = config.toneLabels || {};
    const KIDS = Array.isArray(config.kids) ? config.kids : [];
    const SIUNTEJAS = KIDS[0] && KIDS[0].name ? KIDS[0] : { name: "Rūta", color: "#f0b45a" };
    const GAVEJAS = KIDS[1] && KIDS[1].name ? KIDS[1] : { name: "Tomas", color: "#7cc0ea" };

    const MOOD = { siltas: "happy", saltas: "sad" };
    /* Duomenų vientisumas: jei žodis neturi jausmo, modelis tylėtų ten, kur
       turėjo parodyti pasekmę, o vaikas pamatytų tik „nieko neatsitiko“ —
       būtent priešingai nei teigia modulis. Todėl tai klaida, ne tyli spraga. */
    if (WORDS.length < 2 || !WORDS.every((_, i) => MOOD[TONES[i]])) {
      console.error("Virtualumo žodžiai nesuderinti: kiekvienam žodžiui reikia tones[i] = siltas | saltas.");
      stage.innerHTML = `<p style="margin:0;font-weight:800">Žodžiai nesuderinti su jausmais.</p>`;
      api.readout("Žodžiai nesuderinti.");
      return () => {};
    }

    const GROUND = 240;
    /* Vaikai didesni nei kitose scenose (3,0, o ne 1,7): būtent VEIDAS yra
       tai, ką vaikas turi perskaityti, o mažesniu masteliu 360 px ekrane
       burna būtų keli pikseliai — per maža, kad 6–7 m. vaikas atskirtų
       šypseną nuo liūdno veido (LL-06). Todėl veidui skirta pusė scenos. */
    const SX = 62;
    const RX = 298;
    const SCALE = 3.4;
    const HEAD_Y = GROUND - 33 * SCALE;
    const HEAD_R = 8 * SCALE;
    const REDUCE = typeof window !== "undefined"
      && typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let word = -1;
    let channel = "gyvai";
    let phase = "idle";
    let shown = { gyvai: null, ekranas: null };
    let reportedFor = -1;
    let timer = 0;

    stage.innerHTML = `
      <div style="display:grid;gap:.5rem;justify-items:center;width:100%;min-width:0">
        <div id="zv-scene-wrap" style="width:100%;min-width:0;text-align:center"></div>
        <p id="zv-compare" aria-live="polite"
           style="margin:0 auto;max-width:30rem;min-width:0;font-size:1rem;font-weight:800;
                  text-align:center;line-height:1.4;overflow-wrap:anywhere"></p>
      </div>`;

    controls.innerHTML = `
      <div style="display:grid;gap:.7rem;width:100%;max-width:30rem;min-width:0;margin:0 auto">
        <div style="min-width:0">
          <p id="zv-words-label" style="font-weight:800;text-align:center;margin:0 0 .35rem">${S.prompt || "Ką pasakysi?"}</p>
          <div id="zv-words" role="group" aria-labelledby="zv-words-label"
               style="display:grid;gap:.45rem;min-width:0">
            ${WORDS.map((w, i) => `
              <button class="btn secondary" type="button" data-word="${i}" aria-pressed="false"
                      style="min-height:3rem;height:auto;padding:.5rem .7rem;font-size:1rem;line-height:1.3;
                             white-space:normal;overflow-wrap:anywhere;text-align:left">„${w}“</button>`).join("")}
          </div>
        </div>
        <div style="min-width:0">
          <p id="zv-channel-label" style="font-weight:800;text-align:center;margin:.2rem 0 .35rem">${S.channel || "Per ką pasakysi?"}</p>
          <div id="zv-channel" role="group" aria-labelledby="zv-channel-label"
               style="display:flex;gap:.45rem;flex-wrap:wrap;justify-content:center;min-width:0;width:100%">
            <button class="btn secondary" type="button" data-channel="gyvai" aria-pressed="true"
                    style="min-height:3rem;flex:1 1 8rem;min-width:0;max-width:100%;padding-left:.8rem;padding-right:.8rem">Gyvai</button>
            <button class="btn secondary" type="button" data-channel="ekranas" aria-pressed="false"
                    style="min-height:3rem;flex:1 1 8rem;min-width:0;max-width:100%;padding-left:.8rem;padding-right:.8rem">Per ekraną</button>
          </div>
        </div>
        <div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;min-width:0;width:100%">
          <button class="btn" type="button" id="zv-send"
                  style="min-width:0;flex:1 1 8rem;max-width:100%">${S.send || "Siųsti"}</button>
          <button class="btn ghost" type="button" id="zv-reset"
                  style="min-width:0;flex:0 1 auto;max-width:100%">Iš naujo</button>
        </div>
      </div>`;

    const sceneWrap = stage.querySelector("#zv-scene-wrap");
    const compareEl = stage.querySelector("#zv-compare");
    const wordBtns = Array.from(controls.querySelectorAll("[data-word]"));
    const channelBtns = Array.from(controls.querySelectorAll("[data-channel]"));
    const sendBtn = controls.querySelector("#zv-send");
    const resetBtn = controls.querySelector("#zv-reset");

    function moodOf(i) {
      if (i < 0) return "neutral";
      return MOOD[TONES[i]] || "neutral";
    }

    function moodWord(i) {
      const label = LABELS[TONES[i]];
      return label ? label : "";
    }

    /* Kortelė — tai, kaip žodis atkeliauja per ekraną: trys eilutės.
       Ji stovi TARP vaikų ir virš jų galvų (galvos — y 182–210), nes kortelė,
       užklojusi gavėjo veidą, paslėptų būtent tą pasekmę, kurią modelis turi
       parodyti (LL-24). Todėl ji nejuda: ekranas nekeliauja, žodis keliauja. */
    function kortele() {
      return `<g transform="translate(148 56)">
        <rect x="0" y="0" width="64" height="42" rx="8" fill="#fdfbf3" stroke="#8a8378" stroke-width="2.4"/>
        <line x1="10" y1="13" x2="53" y2="13" stroke="#b9b2a1" stroke-width="3" stroke-linecap="round"/>
        <line x1="10" y1="22" x2="44" y2="22" stroke="#b9b2a1" stroke-width="3" stroke-linecap="round"/>
        <line x1="10" y1="31" x2="49" y2="31" stroke="#b9b2a1" stroke-width="3" stroke-linecap="round"/>
      </g>`;
    }

    /* Balsas — trys arkos nuo siuntėjo iki gavėjo. Pradžia ir pabaiga
       prasideda nuo pačių galvų kraštų (HEAD_R), todėl arka nesibaigia
       ore ir neužkloja veido: ji jungia du žmones, o ne du taškus.
       Keliaudama balsas brūkšniuotas, atkeliavęs — vientisas; taip ekranas
       sutaria su `#sim-readout` žodžiu „keliauja“, o ne tyli (LL-14). */
    function arkos() {
      const f = (v) => v.toFixed(1);
      const x1 = SX + HEAD_R * 0.6;
      const x2 = RX - HEAD_R * 0.6;
      const dash = phase === "carry" ? ' stroke-dasharray="9 7"' : "";
      return [0, 1, 2].map((i) => {
        const y = HEAD_Y - HEAD_R - 10 - i * 13;
        return `<path d="M${f(x1)} ${f(y + 10)} Q ${f((x1 + x2) / 2)} ${f(y - 20)} ${f(x2)} ${f(y + 10)}"
                  fill="none" stroke="#8a8378" stroke-width="3" stroke-linecap="round" opacity=".8"${dash}/>`;
      }).join("");
    }

    function sceneLabel() {
      const vardas = GAVEJAS.name;
      if (phase === "carry") return `Žodis keliauja iš ${SIUNTEJAS.name} pas ${vardas}.`;
      if (phase === "done") {
        return `${SIUNTEJAS.name} pasakė žodį. ${vardas}: ${moodWord(word).toLowerCase()}.`;
      }
      return `${SIUNTEJAS.name} ir ${vardas} kalba.`;
    }

    function sceneSVG() {
      const parts = [];
      parts.push(art.defs("zv"));
      parts.push(art.sun(324, 44, 14, "zv", 1));
      parts.push(art.cloud(56, 46, 0.72));
      parts.push(art.hills(360, GROUND - 2, "#b6d9a4", "#9cc78a"));
      /* Žolė — KALVOJE, o ne po jos: `hills()` užpildas baigiasi ties
         GROUND + 44, todėl žolė, nupiešta žemiau, kabotų tuščiame fone
         (LL-13: scena turi būti vientisa, ne klijuota). */
      parts.push(art.grass(44, GROUND + 16, 1));
      parts.push(art.grass(318, GROUND + 18, 0.9));

      parts.push(art.kid(SX, GROUND, SCALE, SIUNTEJAS.color));
      parts.push(art.kid(RX, GROUND, SCALE, GAVEJAS.color));
      /* Siuntėjo veidas nekinta: jis nemato, kas atsitiko. Gavėjo — kinta.
         `data-face` reikalingas tam, kad žondas galėtų perskaityti TIK gavėjo
         veidą; be jo abiejų vaikų akys ir burnos susilieja į vieną sąrašą ir
         palyginimas „tas pats veidas abiem keliais“ liktų nepatikrintas. */
      const gavejoMood = phase === "done" ? moodOf(word) : "neutral";
      parts.push(`<g data-face="siuntejas" data-mood="neutral">${veidas(SX, HEAD_Y, HEAD_R, "neutral")}</g>`);
      parts.push(`<g data-face="gavejas" data-mood="${gavejoMood}">${veidas(RX, HEAD_Y, HEAD_R, gavejoMood)}</g>`);

      if (channel === "gyvai") {
        parts.push(arkos());
      } else {
        parts.push(kortele());
      }

      return `<svg id="zv-scene" viewBox="0 0 360 308" width="100%"
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

    function paintComparison() {
      const a = shown.gyvai ? `Gyvai: ${LABELS[shown.gyvai] || "—"}` : "Gyvai: —";
      const b = shown.ekranas ? `Per ekraną: ${LABELS[shown.ekranas] || "—"}` : "Per ekraną: —";
      compareEl.textContent = `${a} · ${b}`;
    }

    function updateWord() {
      wordBtns.forEach((b) => {
        const on = Number(b.dataset.word) === word;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.style.borderColor = on ? "var(--ink)" : "var(--line)";
        b.style.background = on ? "var(--sun-soft, #fff3cf)" : "";
        b.setAttribute("aria-disabled", phase === "carry" ? "true" : "false");
        b.style.opacity = phase === "carry" ? ".55" : "1";
      });
    }

    function updateChannel() {
      channelBtns.forEach((b) => {
        const on = b.dataset.channel === channel;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.style.borderColor = on ? "var(--ink)" : "var(--line)";
        b.style.background = on ? "var(--sun-soft, #fff3cf)" : "";
        b.setAttribute("aria-disabled", phase === "carry" ? "true" : "false");
        b.style.opacity = phase === "carry" ? ".55" : "1";
      });
      sendBtn.setAttribute("aria-disabled", phase === "carry" ? "true" : "false");
      sendBtn.style.opacity = phase === "carry" ? ".55" : "1";
    }

    function send() {
      if (phase === "carry") return;
      if (word < 0) {
        api.note(S.pick || "Pirma pasirink žodį.");
        wordBtns[0].focus();
        return;
      }
      clearTimer();
      phase = "carry";
      updateWord();
      updateChannel();
      render();
      api.readout(S.carry || "Žodis keliauja.");
      timer = setTimeout(finish, REDUCE ? 120 : 520);
    }

    function finish() {
      timer = 0;
      phase = "done";
      shown[channel] = TONES[word];
      render();
      updateWord();
      updateChannel();
      paintComparison();

      const warm = MOOD[TONES[word]] === "happy" ? "warm" : "cold";
      const both = Boolean(shown.gyvai && shown.ekranas);
      /* Sakinys imamas iš `sim.config.sentences` KAIP VISUMA, ne sujungiamas
         kode: `speech.js` įrašo ieško pagal visą eilutę, o sulipdyta eilutė
         manifeste neegzistuoja — vaikas girdėtų naršyklės balsą arba tylą
         (LL-42, LL-145). Todėl kiekviena baigtis turi savo raktą. */
      const said = both
        ? (S.both && S.both[warm])
        : (S.say && S.say[channel === "gyvai" ? "live" : "screen"] && S.say[channel === "gyvai" ? "live" : "screen"][warm]);
      if (!said) {
        console.error("Nėra sim.config.sentences baigties sakinio — jis būtų be garso įrašo.");
        api.readout("Sakinio nėra.");
        return;
      }
      api.readout(said);
      if (typeof api.speak === "function") api.speak(said, { rate: 0.95 });

      let note = said;
      if (both) {
        if (reportedFor !== word) {
          reportedFor = word;
          api.progress({ correct: true });
        }
      } else {
        note += channel === "gyvai"
          ? " Dabar pasiųsk tą patį žodį per ekraną."
          : " Dabar pasakyk tą patį žodį gyvai.";
      }
      api.note(note);
    }

    wordBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (phase === "carry") {
          api.note("Palauk, kol žodis nueis.");
          return;
        }
        const next = Number(btn.dataset.word);
        if (next !== word) {
          /* Kitas žodis — naujas palyginimas. Seni rezultatai nebepasakytų
             nieko apie šį žodį, todėl jie neturi likti ekrane. */
          shown = { gyvai: null, ekranas: null };
          reportedFor = -1;
        }
        word = next;
        phase = "idle";
        updateWord();
        updateChannel();
        paintComparison();
        render();
        api.readout(S.ask || "Ką pasakysi?");
        api.note(`Pasirinkta: „${WORDS[word]}“`);
      });
    });

    channelBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (phase === "carry") {
          api.note("Palauk, kol žodis nueis.");
          return;
        }
        channel = btn.dataset.channel;
        updateChannel();
        render();
        api.note(channel === "gyvai" ? "Žodis bus pasakytas gyvai." : "Žodis bus parašytas ekrane.");
      });
    });

    sendBtn.addEventListener("click", send);

    resetBtn.addEventListener("click", () => {
      clearTimer();
      word = -1;
      channel = "gyvai";
      phase = "idle";
      shown = { gyvai: null, ekranas: null };
      reportedFor = -1;
      updateWord();
      updateChannel();
      paintComparison();
      render();
      api.readout(S.ask || "Ką pasakysi?");
      api.note(S.pick || "Pirma pasirink žodį.");
    });

    updateWord();
    updateChannel();
    paintComparison();
    render();
    api.readout(S.ask || "Ką pasakysi?");
    api.note(`Pasirink žodį ir kelia, kuriuo jis nueis pas ${GAVEJAS.name}.`);

    return () => clearTimer();
  },
};

export const SIMS = {
  "susitarimo-bokstas": susitarimoBokstas,
  "zodis-per-ekrana": zodisPerEkrana,
};
