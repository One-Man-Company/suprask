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
  raudona: "Pasikeitė tik spalva. Dėmės forma liko tokia pati.",
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

    /* „Sakau“ minimumas buvo 11rem = 352 px prie 32 px šaknies, todėl
       mygtukas išlipo iš 241 px valdiklių juostos ir už kortelės krašto
       (matuota #8535 @360/32, +28 px). `min(11rem,100%)` riboja minimumą
       turimu pločiu (LL-70); įprastu 16 px šriftu 100 % juostos (298 px)
       didesnis už 11rem (176 px), tad plotis nepakinta. */
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
      <button class="btn" type="button" id="deme-guess" style="min-width:min(11rem,100%)">Sakau</button>
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

/* ------------------------------------------------------------------ */
/* Ta pati linija, trys priemonės                                       */
/*                                                                     */
/* Modelis: TRYS tie patys piešiniai (raidė o, akis, saga), tik juos     */
/* brėžia skirtinga priemonė. Linijos plotį nustato priemonė (`w`), o   */
/* vidaus dydis skaičiuojamas iš geometrijos: r − w/2. Todėl teiginys    */
/* „kreidelė užkloja sagos vidų“ yra ne tekstas, o ta pati SVG kreivė,    */
/* kurios stroke-width didesnis už skersmenį (LL-33, LL-25).            */
/*                                                                     */
/* Antras valdiklis — spaudimas. Jis keičia TIK `stroke-opacity`, t. y.  */
/* tamsumą, o `stroke-width` lieka toks pat. Klaidinga nuostata           */
/* „kuo stipriau spaudi, tuo storesnė linija“ tampa patikrinama, o ne    */
/* perskaitoma (LL-17: būsena rodoma dabar, ne praeityje).              */
/*                                                                     */
/* Kodėl trys skirtingo dydžio formos: tas pats plotis didelėje formoje  */
/* telpa, o mažoje — užkloja vidų. Vaikas pamato, kad storis priklauso   */
/* priemonei, o ar ji tinka — formos dydžiui.                            */
/* ------------------------------------------------------------------ */

const INK = "#3a342b";

const linijosStoris = {
  mount({ stage, controls, api, config }) {
    const OBJECTS = Array.isArray(config.objects) ? config.objects : [];
    const TOOLS = Array.isArray(config.tools) ? config.tools : [];
    if (!OBJECTS.length || !TOOLS.length) {
      stage.innerHTML = `<p class="strand-meta">Piešiniai dar nesukonfigūruoti.</p>`;
      return () => {};
    }

    const SENT = config.sentences || {};
    const NOTES = config.notes || {};

    let tool = TOOLS.find((t) => t.id === config.start) || TOOLS[0];
    let strong = true;
    let reported = false;
    let pressSwitched = false;
    let nudged = false;
    let lastNote = "";
    const used = new Set([tool.id]);

    stage.innerHTML = `
      <div style="display:grid;gap:.7rem;width:100%;min-width:0">
        <div role="group" aria-label="Trys piešiniai"
             style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem;align-items:end">
          ${OBJECTS.map((o, i) => `
            <figure style="margin:0;display:grid;justify-items:center;gap:.3rem;min-width:0">
              <svg data-fig="${i}" viewBox="0 0 96 96" width="100%" role="img"
                   aria-label="${o.label}"
                   style="display:block;width:100%;max-width:96px;height:auto">
                <g data-ring="${i}">${art.spot(48 - o.r, 48 - o.r, o.r * 2, o.r * 2, INK, "apvali", tool.w)}</g>
              </svg>
              <figcaption style="font-size:.95rem;font-weight:800;text-align:center;color:var(--ink-soft)">${o.label}</figcaption>
            </figure>`).join("")}
        </div>
      </div>`;

    controls.innerHTML = `
      <div role="group" aria-label="Piešimo priemonės"
           style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;width:100%">
        ${TOOLS.map((t) => `
          <button class="btn secondary" type="button" data-tool="${t.id}"
            aria-label="${t.name}: ${t.say}" aria-pressed="false"
            style="display:grid;justify-items:center;align-content:center;gap:.2rem;
                   min-width:4.6rem;padding:.35rem .5rem">
            <svg viewBox="0 0 46 40" width="46" height="40" aria-hidden="true"
                 style="display:block">${art.spot(4, (40 - t.w) / 2, 38, t.w, INK, "juosta")}</svg>
            <span style="font-size:.95rem;font-weight:800">${t.name}</span>
          </button>`).join("")}
      </div>
      <div role="group" aria-label="Spaudimas"
           style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;width:100%">
        <button class="btn secondary" type="button" data-press="weak"
          aria-label="Spausti silpnai" aria-pressed="false" style="min-width:6rem;font-size:.95rem">Silpnai</button>
        <button class="btn secondary" type="button" data-press="strong"
          aria-label="Spausti stipriai" aria-pressed="true" style="min-width:6rem;font-size:.95rem">Stipriai</button>
        <button class="btn secondary" type="button" id="lp-reset"
          aria-label="Pradėti iš naujo" style="min-width:6rem;font-size:.95rem">Iš naujo</button>
      </div>`;

    const figs = OBJECTS.map((_, i) => stage.querySelector(`[data-fig="${i}"]`));
    const rings = OBJECTS.map((_, i) => stage.querySelector(`[data-ring="${i}"] path`));
    const toolBtns = Array.from(controls.querySelectorAll("[data-tool]"));
    const pressBtns = Array.from(controls.querySelectorAll("[data-press]"));
    const resetBtn = controls.querySelector("#lp-reset");

    /* Vidaus spindulys — ta pati formule, iš kurios piešiama kreivė.
       Jei tekstas ir geometrija imtų skirtingus skaičius, sakinys galėtų
       teigti viena, o paveikslas rodyti kita (LL-03). */
    const holeOf = (o) => o.r - tool.w / 2;

    function stateWord(o) {
      const hole = holeOf(o);
      if (hole < 1) return "vidus užsipildė";
      if (hole < o.r * 0.6) return "vidus susiaurėjo";
      return "vidus matosi";
    }

    function render() {
      OBJECTS.forEach((o, i) => {
        const path = rings[i];
        if (path) {
          path.setAttribute("stroke-width", String(tool.w));
          path.setAttribute("stroke-opacity", strong ? "1" : "0.5");
        }
        const fig = figs[i];
        if (fig) fig.setAttribute("aria-label", `${o.label}, nupiešta ${tool.ins}: ${stateWord(o)}`);
      });

      toolBtns.forEach((b) => {
        const on = b.dataset.tool === tool.id;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.style.borderColor = on ? "var(--ink)" : "var(--line)";
      });
      pressBtns.forEach((b) => {
        const on = (b.dataset.press === "strong") === strong;
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.style.borderColor = on ? "var(--ink)" : "var(--line)";
      });
    }

    function say(key) {
      const text = SENT[key] || "";
      if (text) api.speak(text, { rate: 0.95 });
      return text;
    }

    /* Vienas vartas pastebėjimui: `lastNote` laiko tai, ką vaikas dabar
       mato, kad vėlesnis sakinys galėtų jį PRIDĖTI, o ne pakeisti. */
    function setNote(text) {
      lastNote = String(text || "").replace(/\s+/g, " ").trim();
      api.note(lastNote);
    }

    function nudge() {
      if (pressSwitched || nudged || used.size < 2) return "";
      nudged = true;
      return SENT.pressHint ? ` ${SENT.pressHint}` : "";
    }

    /* Pažanga žymima tik įveikus ABU žingsnius: palyginti bent tris
       priemones IR tos pačios priemonės spaudimą. Vienas priemonės
       pasirinkimas nėra „baigta“ (LL-29).

       Išvada PRIDEDAMA prie pastebėjimo, o ne pakeičia jį: jei baigimo
       sakinys užrašytų „Sagos vidus liko siauras“, vaikas nebegalėtų
       perskaityti to, ką ką tik pamatė (LL-14, LL-33). */
    function checkDone() {
      if (reported || used.size < 3 || !pressSwitched) return;
      reported = true;
      api.readout(say("done"));
      setNote(`${lastNote} ${SENT.noteDone || ""}`);
      api.progress({ correct: true });
    }

    function chooseTool(id) {
      if (id === tool.id) {
        setNote(SENT.sameTool || "Ši priemonė jau rankoje.");
        return;
      }
      tool = TOOLS.find((t) => t.id === id) || tool;
      used.add(tool.id);
      render();
      api.readout(say(tool.id));
      setNote((NOTES[tool.id] || "") + nudge());
      checkDone();
    }

    function choosePress(value) {
      const wantStrong = value === "strong";
      if (wantStrong === strong) {
        setNote(SENT.samePress || "Spaudimas toks pat. Rink kitą.");
        return;
      }
      strong = wantStrong;
      pressSwitched = true;
      render();
      api.readout(say(strong ? "stipriai" : "silpnai"));
      setNote(SENT[strong ? "noteStrong" : "noteWeak"] || "");
      checkDone();
    }

    function reset() {
      tool = TOOLS.find((t) => t.id === config.start) || TOOLS[0];
      strong = true;
      render();
      api.readout(SENT.start || "Rink priemonę ir žiūrėk.");
      setNote(NOTES[tool.id] || "");
    }

    toolBtns.forEach((b) => b.addEventListener("click", () => chooseTool(b.dataset.tool)));
    pressBtns.forEach((b) => b.addEventListener("click", () => choosePress(b.dataset.press)));
    if (resetBtn) resetBtn.addEventListener("click", reset);

    controls.addEventListener("keydown", (e) => {
      const active = document.activeElement;
      const inTools = toolBtns.indexOf(active);
      const inPress = pressBtns.indexOf(active);
      if (inTools >= 0 && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        e.preventDefault();
        const step = e.key === "ArrowRight" ? 1 : -1;
        toolBtns[(inTools + step + toolBtns.length) % toolBtns.length].focus();
      } else if (inPress >= 0 && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        e.preventDefault();
        pressBtns[(inPress + 1) % pressBtns.length].focus();
      } else if (e.key === "r" || e.key === "R") {
        reset();
      }
    });

    render();
    api.readout(SENT.start || "Rink priemonę ir žiūrėk.");
    setNote(NOTES[tool.id] || "");

    return () => {};
  },
};

export const SIMS = {
  "deme-ir-spalvos": demeIrSpalvos,
  "linijos-storis": linijosStoris,
};
