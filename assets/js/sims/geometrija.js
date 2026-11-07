/**
 * Erdvinių kūnų simuliacija (1 klasė, matematika).
 *
 * Modelis: vienas kūnas stovi ant stalo, o vaikas keičia TIK žvilgsnį —
 * iš priekio, iš viršaus, nuo šono. Kiekvieną kartą jis pirma spėja, kokią
 * plokščią formą matys, paskui pamato tikrą vaizdą. Taip atsiranda tai, ko
 * neparodo nei tekstas, nei paveikslėlis: kūnas lieka vienas, keičiasi tik
 * vaizdas (kūgis iš priekio — trikampis, iš viršaus — apskritimas).
 *
 * Sąmoningai NEliečiama: briaunų, viršūnių ir sienų skaičiavimas — tai ne
 * 1 klasės programa ir būtent elementų skaičiavimas 6–7 m. vaikui sukelia
 * 2D/3D painiavą (research/wiki/curriculum/matematika-1-klase.md §4.2).
 *
 * Scena surenkama iš `art.js` dalių (LL-13): art.solidCone/solidCylinder/
 * solidBox/solidSphere/flatShape/viewArrow.
 */
import { art } from "./art.js";

/* Trys žvilgsniai. `prep` vartojamas sakinyje, `arrow` — rodyklė prie kūno. */
const VIEWS = [
  { id: "priekis", label: "Iš priekio", prep: "iš priekio", arrow: [8, 196, 30, 178] },
  { id: "virsus", label: "Iš viršaus", prep: "iš viršaus", arrow: [100, 8, 100, 30] },
  { id: "sonas", label: "Nuo šono", prep: "nuo šono", arrow: [198, 150, 184, 150] },
];

/* Formų vardai: nominatyvas (kam?) ir galininkas (ką matai?). */
const SHAPES = {
  trikampis: { nom: "trikampis", acc: "trikampį" },
  apskritimas: { nom: "apskritimas", acc: "apskritimą" },
  kvadratas: { nom: "kvadratas", acc: "kvadratą" },
  staciakampis: { nom: "stačiakampis", acc: "stačiakampį" },
};

/**
 * Kūnai ir jų vaizdai iš trijų pusių. Lentelė yra vienintelis tiesos
 * šaltinis: ir piešinys, ir grįžtamasis ryšys, ir garso sakiniai remiasi ja.
 */
const BODIES = [
  {
    id: "kugis",
    name: "Kūgis",
    acc: "kūgį",
    why: "Kūgio pagrindas apvalus, o viršus smailas.",
    views: { priekis: "trikampis", virsus: "apskritimas", sonas: "trikampis" },
  },
  {
    id: "ritinys",
    name: "Ritinys",
    acc: "ritinį",
    why: "Ritinio galai apvalūs, o šonas tiesus.",
    views: { priekis: "staciakampis", virsus: "apskritimas", sonas: "staciakampis" },
  },
  {
    id: "kubas",
    name: "Kubas",
    acc: "kubą",
    why: "Visos kubo sienos yra kvadratai.",
    views: { priekis: "kvadratas", virsus: "kvadratas", sonas: "kvadratas" },
  },
  {
    id: "gretasienis",
    name: "Gretasienis",
    acc: "gretasienį",
    why: "Gretasienio sienos yra stačiakampiai.",
    views: { priekis: "staciakampis", virsus: "staciakampis", sonas: "staciakampis" },
  },
  {
    id: "rutulys",
    name: "Rutulys",
    acc: "rutulį",
    why: "Rutulys apvalus iš visų pusių.",
    views: { priekis: "apskritimas", virsus: "apskritimas", sonas: "apskritimas" },
  },
];

const byId = (id) => BODIES.find((b) => b.id === id);
const viewById = (id) => VIEWS.find((v) => v.id === id);

/* Kūno piešinys 200×200 tinkle. Rodyklė rodo, iš kur žiūrima. */
function solidMarkup(id, arrowDir) {
  let base;
  if (id === "kugis") base = art.solidCone(102, 166, 54, 122);
  else if (id === "ritinys") base = art.solidCylinder(100, 168, 47, 114);
  else if (id === "kubas") base = art.solidBox(52, 88, 82, 82, 34);
  else if (id === "gretasienis") base = art.solidBox(38, 104, 118, 62, 34);
  else base = art.solidSphere(100, 118, 58);
  if (!arrowDir) return base;
  return base + art.viewArrow(...arrowDir);
}

/* Miniatiūra kūno mygtuke: be rodyklės ir be šešėlio triukšmo. */
function iconMarkup(id) {
  return `<svg viewBox="0 0 200 200" width="40" height="40" aria-hidden="true" focusable="false">${solidMarkup(id, null)}</svg>`;
}

const erdvinesFiguros = {
  mount({ stage, controls, api, config }) {
    const S = config.sentences || {};
    const VIEW_KEYS = VIEWS.map((v) => v.id);

    /* `revealed` — kuriuos (kūnas, žvilgsnis) vaizdus vaikas jau matė.
       `done` — kurių kūnų visi trys vaizdai jau apžiūrėti (tikslas). */
    const revealed = new Set();
    const done = new Set();
    let body = "kugis";
    let view = "priekis";
    let lastSaid = "";

    stage.innerHTML = `
      <div id="ef-wrap" style="width:100%;max-width:36rem;margin:0 auto;box-sizing:border-box">
        <p class="sim-note" style="margin:0 0 .5rem;text-align:center">
          Pasirink kūną ir žvilgsnį. Spėk, kokią formą matai.
        </p>
        <div id="ef-bodies" role="group" aria-label="Pasirink kūną"
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(6.1rem,1fr));gap:.4rem;box-sizing:border-box"></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(7rem,1fr));gap:.5rem;margin-top:.7rem;box-sizing:border-box">
          <figure style="margin:0;text-align:center;min-width:0">
            <svg id="ef-solid" viewBox="0 0 200 200" width="100%" role="img" aria-label="Kūnas ant stalo"
                 style="display:block;max-height:11rem;margin:0 auto"></svg>
            <figcaption style="font-size:.85rem;color:var(--ink-soft);font-weight:700">Kūnas ant stalo</figcaption>
          </figure>
          <figure style="margin:0;text-align:center;min-width:0">
            <svg id="ef-flat" viewBox="0 0 200 200" width="100%" role="img" aria-label="Ką matai"
                 style="display:block;max-height:11rem;margin:0 auto"></svg>
            <figcaption id="ef-flat-cap" style="font-size:.85rem;color:var(--ink-soft);font-weight:700">Ką matai?</figcaption>
          </figure>
        </div>
        <div id="ef-views" role="group" aria-label="Iš kur žiūri"
             style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.4rem;margin-top:.6rem;box-sizing:border-box"></div>
        <div id="ef-shapes" role="group" aria-label="Kokią formą matai"
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(6.4rem,1fr));gap:.4rem;margin-top:.5rem;box-sizing:border-box"></div>
      </div>`;

    controls.innerHTML = `
      <div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;align-items:center">
        <button class="btn secondary" id="ef-show" aria-label="Rodyti vaizdą neišspėjus">Rodyk vaizdą</button>
        <button class="btn ghost" id="ef-reset" aria-label="Pradėti iš naujo">Iš naujo</button>
      </div>`;

    const solidSvg = stage.querySelector("#ef-solid");
    const flatSvg = stage.querySelector("#ef-flat");
    const flatCap = stage.querySelector("#ef-flat-cap");
    const bodiesEl = stage.querySelector("#ef-bodies");
    const viewsEl = stage.querySelector("#ef-views");
    const shapesEl = stage.querySelector("#ef-shapes");
    const showBtn = controls.querySelector("#ef-show");
    const resetBtn = controls.querySelector("#ef-reset");

    /* --- mygtukai ----------------------------------------------------- */
    bodiesEl.innerHTML = BODIES.map((b) => `
      <button type="button" class="btn secondary ef-body" data-body="${b.id}"
              aria-pressed="${b.id === body}" aria-label="${b.name}"
              style="display:flex;flex-direction:column;align-items:center;gap:.1rem;padding:.45rem .3rem;min-height:56px;box-sizing:border-box">
        ${iconMarkup(b.id)}
        <span style="font-size:.85rem;line-height:1.15;font-weight:800">${b.name}</span>
      </button>`).join("");

    viewsEl.innerHTML = VIEWS.map((v) => `
      <button type="button" class="btn secondary ef-view" data-view="${v.id}"
              aria-pressed="${v.id === view}" aria-label="${v.label}"
              style="padding:.5rem .3rem;min-height:48px;font-size:.95rem;line-height:1.15;text-align:center;box-sizing:border-box">${v.label}</button>`).join("");

    shapesEl.innerHTML = Object.entries(SHAPES).map(([id, sh]) => `
      <button type="button" class="btn secondary ef-shape" data-shape="${id}" aria-label="${sh.nom}"
              style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.15rem;padding:.35rem .25rem;min-height:56px;box-sizing:border-box">
        <svg viewBox="0 0 200 200" width="26" height="26" aria-hidden="true" focusable="false">${art.flatShape(id, 100, 100, 160, 9)}</svg>
        <span style="font-size:.8rem;line-height:1.1;font-weight:800;text-align:center">${sh.nom.charAt(0).toUpperCase() + sh.nom.slice(1)}</span>
      </button>`).join("");

    const bodyBtns = [...bodiesEl.querySelectorAll(".ef-body")];
    const viewBtns = [...viewsEl.querySelectorAll(".ef-view")];
    const shapeBtns = [...shapesEl.querySelectorAll(".ef-shape")];

    const mark = (btn, on) => {
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.style.borderColor = on ? "var(--accent)" : "var(--line)";
      btn.style.background = on ? "color-mix(in srgb, var(--accent) 14%, var(--paper-2))" : "var(--paper-2)";
      btn.style.boxShadow = on ? "inset 0 0 0 2px var(--accent)" : "none";
    };

    /* --- piešimas ----------------------------------------------------- */
    const key = () => `${body}|${view}`;
    const revealedNow = () => revealed.has(key());

    function paint() {
      const b = byId(body);
      const v = viewById(view);

      solidSvg.innerHTML = art.defs("ef") + solidMarkup(body, v.arrow);
      solidSvg.setAttribute("aria-label", `${b.name} ant stalo. Žiūri ${v.prep}.`);

      if (revealedNow()) {
        const shape = SHAPES[b.views[view]];
        flatSvg.innerHTML = art.flatShape(b.views[view], 100, 100, 150, 5);
        flatSvg.setAttribute("aria-label", `${v.label} matai: ${shape.acc}.`);
        flatCap.textContent = `${v.prep.charAt(0).toUpperCase() + v.prep.slice(1)} matai ${shape.acc}`;
      } else {
        flatSvg.innerHTML = `<text x="100" y="128" text-anchor="middle" font-family="system-ui, sans-serif"
              font-size="96" font-weight="900" fill="var(--ink-faint)">?</text>`;
        flatSvg.setAttribute("aria-label", "Vaizdas dar neatskleistas");
        flatCap.textContent = `Ką matai ${v.prep}?`;
      }

      bodyBtns.forEach((btn) => mark(btn, btn.dataset.body === body));
      viewBtns.forEach((btn) => mark(btn, btn.dataset.view === view));
    }

    /* --- grįžtamasis ryšys -------------------------------------------- */
    function promptText() {
      const b = byId(body);
      const v = viewById(view);
      return `Ką matai ${v.prep}, kai žiūri į ${b.acc}?`;
    }

    function announcePrompt() {
      api.readout(promptText());
      api.note("Tas pats kūnas iš skirtingų pusių atrodo skirtingai.");
    }

    function speakOnce(text) {
      if (!text || text === lastSaid) return;
      lastSaid = text;
      api.speak(text);
    }

    function checkGoal() {
      const b = byId(body);
      const all = VIEW_KEYS.every((v) => revealed.has(`${body}|${v}`));
      if (!all || done.has(body)) return;
      done.add(body);
      api.readout(`Apžiūrėjai ${b.acc} iš trijų pusių.`);
      api.note(`Apžiūrėjai ${b.acc} iš trijų pusių. Visą laiką tai buvo vienas kūnas.`);
      speakOnce(S.tikslas);
      // Tikslas pasiektas DABAR: trys to paties kūno vaizdai, o ne pirmas spėjimas.
      api.progress({ correct: true, goal: "trys-zhvilgsniai", body });
    }

    function reveal(guess) {
      const b = byId(body);
      const v = viewById(view);
      const target = b.views[view];
      const shape = SHAPES[target];

      revealed.add(key());
      paint();

      if (!guess) {
        api.readout(`${v.prep.charAt(0).toUpperCase() + v.prep.slice(1)} matai ${shape.acc}.`);
        api.note("Pažiūrėk, kokia forma pasirodė. Pats kūnas nepasikeitė.");
      } else if (guess === target) {
        api.readout(`Taip: ${v.prep} ${b.name.toLowerCase()} atrodo kaip ${shape.nom}.`);
        api.note("Kūnas liko tas pats. Pasikeitė tik vaizdas.");
      } else {
        api.readout(`Ne taip: ${v.prep} ${b.name.toLowerCase()} atrodo kaip ${shape.nom}.`);
        api.note(`${b.why} Pažiūrėk į vaizdą dešinėje.`);
      }

      speakOnce(S[`${b.id}-${v.id}`]);
      checkGoal();
    }

    /* --- įėjimai ------------------------------------------------------ */
    bodyBtns.forEach((btn) => btn.addEventListener("click", () => {
      body = btn.dataset.body;
      view = "priekis";
      paint();
      announcePrompt();
    }));

    viewBtns.forEach((btn) => btn.addEventListener("click", () => {
      view = btn.dataset.view;
      paint();
      if (revealedNow()) {
        const b = byId(body);
        const shape = SHAPES[b.views[view]];
        api.readout(`Jau žiūrėjai ${viewById(view).prep}: ${shape.nom}. Pasirink kitą žvilgsnį.`);
      } else {
        api.readout(promptText());
        api.note("Spėk formą arba spausk „Rodyk vaizdą“.");
      }
    }));

    shapeBtns.forEach((btn) => btn.addEventListener("click", () => reveal(btn.dataset.shape)));

    showBtn.addEventListener("click", () => reveal(null));

    resetBtn.addEventListener("click", () => {
      revealed.clear();
      done.clear();
      lastSaid = "";
      paint();
      api.readout("Pradedam iš naujo. Pasirink kūną.");
      api.note("Tas pats kūnas iš skirtingų pusių atrodo skirtingai.");
      speakOnce(S["is-naujo"]);
    });

    paint();
    announcePrompt();

    return null;
  },
};

export const SIMS = {
  "erdvines-figuros": erdvinesFiguros,
};
