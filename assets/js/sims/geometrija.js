/**
 * Erdvinių kūnų simuliacija (1 klasė, matematika).
 *
 * Modelis: vienas kūnas stovi ant stalo, o vaikas keičia TIK tai, iš kur
 * žiūri — iš priekio, iš viršaus, nuo šono. Kiekvieną kartą jis pirma spėja,
 * kokią plokščią formą matys, paskui pamato tikrą vaizdą. Taip atsiranda tai,
 * ko neparodo nei tekstas, nei paveikslėlis: kūnas lieka vienas, keičiasi tik
 * vaizdas (kūgis iš priekio — trikampis, iš viršaus — apskritimas).
 *
 * Trys vaizdai nėra pametami: kiekvienas mygtukas „Iš priekio / Iš viršaus /
 * Nuo šono“ po pasižiūrėjimo parodo, kokią formą tada matei. Taip vaikas
 * VISUS tris vaizdus mato vienu metu — invarianto („tas pats kūnas“) negali
 * pamiršti, nes jis lieka ekrane.
 *
 * Sąmoningai NEliečiama: briaunų, viršūnių ir sienų skaičiavimas — tai ne
 * 1 klasės programa ir būtent elementų skaičiavimas 6–7 m. vaikui sukelia
 * 2D/3D painiavą (research/wiki/curriculum/matematika-1-klase.md §4.2).
 *
 * Scena surenkama iš `art.js` dalių (LL-13): art.solidCone/solidCylinder/
 * solidBox/solidSphere/flatShape/viewArrow.
 */
import { art } from "./art.js";

/* Trys žiūrėjimo kryptys. `prep` vartojamas sakinyje, `arrow` — rodyklė prie kūno. */
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
 *
 * Vardai — oficialūs (NŠA 2024, matematikos programa 1 klasei): ne
 * „gretasienis“, o „stačiakampis gretasienis“. Modulio rezultatas moko to
 * paties vardo, todėl simuliacija negali jo trumpinti (#5826, LL-34 atvirkštinė).
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
    name: "Stačiakampis gretasienis",
    acc: "stačiakampį gretasienį",
    why: "Visos jo sienos yra stačiakampiai.",
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

    /* `revealed` — kuriuos (kūnas, kryptis) vaizdus vaikas jau matė.
       `done` — kurių kūnų visi trys vaizdai jau apžiūrėti (tikslas). */
    const revealed = new Set();
    const done = new Set();
    let body = "kugis";
    let view = "priekis";
    let lastSaid = "";

    /* Tinkleliai rišami prie `min(<rem>,100%)`, o ne prie gryno `rem`:
       200 % teksto atveju šaknies `rem` padvigubėja ir minimumas nebetelpa į
       kortelę (LL-40). Su `min()` stulpelis susitraukia iki kortelės pločio
       ir eilutė persirikiuoja, o ne išstumia puslapį. */
    stage.innerHTML = `
      <div id="ef-wrap" style="width:100%;max-width:36rem;margin:0 auto;box-sizing:border-box">
        <p class="sim-note" style="margin:0 0 .5rem;text-align:center">
          Pasirink kūną ir spėk, kokią formą matai. Tada žiūrėk iš kitos pusės.
        </p>
        <div id="ef-bodies" role="group" aria-label="Pasirink kūną"
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(6.1rem,100%),1fr));gap:.4rem;box-sizing:border-box"></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(7rem,100%),1fr));gap:.5rem;margin-top:.7rem;box-sizing:border-box">
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
        <p style="margin:.7rem 0 .3rem;font-size:.85rem;font-weight:800;color:var(--ink-soft);text-align:center">Iš kur žiūri? Ką matei, lieka po mygtuku.</p>
        <div id="ef-views" role="group" aria-label="Iš kur žiūri"
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(5rem,100%),1fr));gap:.4rem;box-sizing:border-box"></div>
        <p style="margin:.7rem 0 .3rem;font-size:.85rem;font-weight:800;color:var(--ink-soft);text-align:center">Kokią formą matai?</p>
        <div id="ef-shapes" role="group" aria-label="Kokią formą matai"
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(6.4rem,100%),1fr));gap:.4rem;box-sizing:border-box"></div>
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
              style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.1rem;padding:.45rem .3rem;min-height:56px;box-sizing:border-box">
        ${iconMarkup(b.id)}
        <span style="font-size:.8rem;line-height:1.15;font-weight:800;text-align:center;overflow-wrap:anywhere">${b.name}</span>
      </button>`).join("");

    /* Antra eilutė — ne puošmena: joje lieka tai, ką vaikas jau matė iš šios
       krypties. Trys mygtukai kartu parodo „vienas kūnas, trys vaizdai“. */
    viewsEl.innerHTML = VIEWS.map((v) => `
      <button type="button" class="btn secondary ef-view" data-view="${v.id}"
              aria-pressed="${v.id === view}" aria-label="${v.label}"
              style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.1rem;padding:.45rem .25rem;min-height:56px;box-sizing:border-box;text-align:center">
        <span style="font-size:.95rem;line-height:1.15;font-weight:800;overflow-wrap:anywhere">${v.label}</span>
        <span class="ef-seen" style="font-size:.8rem;line-height:1.15;color:var(--ink-soft);font-weight:700;min-height:1.15em;overflow-wrap:anywhere"></span>
      </button>`).join("");

    shapesEl.innerHTML = Object.entries(SHAPES).map(([id, sh]) => `
      <button type="button" class="btn secondary ef-shape" data-shape="${id}" aria-label="${sh.nom}"
              style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.15rem;padding:.35rem .25rem;min-height:56px;box-sizing:border-box">
        <svg viewBox="0 0 200 200" width="26" height="26" aria-hidden="true" focusable="false">${art.flatShape(id, 100, 100, 160, 9)}</svg>
        <span style="font-size:.8rem;line-height:1.1;font-weight:800;text-align:center;overflow-wrap:anywhere">${sh.nom.charAt(0).toUpperCase() + sh.nom.slice(1)}</span>
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
      viewBtns.forEach((btn) => {
        const vId = btn.dataset.view;
        const seen = revealed.has(`${body}|${vId}`);
        const shape = seen ? SHAPES[byId(body).views[vId]] : null;
        mark(btn, vId === view);
        btn.querySelector(".ef-seen").textContent = shape ? shape.nom : "—";
        btn.setAttribute(
          "aria-label",
          shape ? `${viewById(vId).label}. Matai ${shape.acc}.` : `${viewById(vId).label}. Dar nežiūrėjai.`,
        );
      });
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

    /** Grąžina `true`, jei tik dabar pabaigtas šio kūno trečias vaizdas. */
    function checkGoal() {
      const b = byId(body);
      const all = VIEW_KEYS.every((v) => revealed.has(`${body}|${v}`));
      if (!all || done.has(body)) return false;
      done.add(body);
      speakOnce(S.tikslas || "Vienas kūnas, trys skirtingi vaizdai.");
      // Tikslas pasiektas DABAR: trys to paties kūno vaizdai, o ne pirmas spėjimas.
      api.progress({ correct: true, goal: "trys-vaizdai", body });
      return true;
    }

    function reveal(guess) {
      const b = byId(body);
      const v = viewById(view);
      const target = b.views[view];
      const shape = SHAPES[target];

      revealed.add(key());
      paint();

      /* Grįžtamasis ryšys apie VEIKSMA, ne apie vaiką (T5.1): pasakoma, ką
         jis spėjo, ir ką iš tikrųjų mato. Nėra „neteisingai“. */
      let head;
      if (!guess) head = `${b.name} ${v.prep}: matai ${shape.acc}.`;
      else if (guess === target) head = `Taip. ${b.name} ${v.prep}: matai ${shape.acc}.`;
      else head = `Tu spėjai ${SHAPES[guess].acc}. Iš tikrųjų ${b.name.toLowerCase()} ${v.prep}: matai ${shape.acc}.`;

      const finished = checkGoal();
      api.readout(finished ? `${head} Apžiūrėjai jį iš trijų pusių.` : head);

      let note;
      if (!guess) note = "Pats kūnas nepasikeitė. Pasikeitė tik vaizdas.";
      else if (guess === target) note = `${b.why} Pats kūnas liko tas pats.`;
      else note = `${b.why} Pažiūrėk į paveikslą dešinėje.`;
      // Viena pastaba, o ne dvi iš eilės: `api.note` keičia tekstą, ne prideda.
      if (finished) note = `${note} Trys vaizdai, vienas kūnas.`;
      api.note(note);

      speakOnce(S[`${b.id}-${v.id}`]);
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
        const prep = viewById(view).prep;
        api.readout(`${prep.charAt(0).toUpperCase() + prep.slice(1)} matai ${shape.acc}. Pasirink, iš kur dar žiūrėsi.`);
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
