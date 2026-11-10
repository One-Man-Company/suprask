/**
 * Erdvinių kūnų ir ilgio matavimo simuliacijos (1 klasė, matematika).
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
 *
 * Antras komponentas šiame faile — `ilgis-ir-vienetas` (ilgio matavimas
 * sąlyginiais vienetais, matas M-07). Kodėl ne `matematika.js`, paaiškinta
 * prie jo bloko žemiau.
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
 * Kūnai ir jų vaizdai iš trijų pusių. Lentelėje lieka tai, ko negalima
 * perkelti į turinį be matematikos: oficialus vardas, galininkas ir trys
 * vaizdai. Paaiškinimai (`why`) yra vaikui skaitomas tekstas, todėl jie
 * imami iš `sim.config.bodies` (#8987) — kalbos redaktorius gali juos
 * pataisyti nekeisdamas kodo.
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
    views: { priekis: "trikampis", virsus: "apskritimas", sonas: "trikampis" },
  },
  {
    id: "ritinys",
    name: "Ritinys",
    acc: "ritinį",
    views: { priekis: "staciakampis", virsus: "apskritimas", sonas: "staciakampis" },
  },
  {
    id: "kubas",
    name: "Kubas",
    acc: "kubą",
    views: { priekis: "kvadratas", virsus: "kvadratas", sonas: "kvadratas" },
  },
  {
    id: "gretasienis",
    name: "Stačiakampis gretasienis",
    acc: "stačiakampį gretasienį",
    views: { priekis: "staciakampis", virsus: "staciakampis", sonas: "staciakampis" },
  },
  {
    id: "rutulys",
    name: "Rutulys",
    acc: "rutulį",
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
    /* Vaikui rodomi tekstai — tik iš turinio (#8987). `labels` yra trumpi
       užrašai, `notes` — pastabos, `bodies` — kūno paaiškinimai. Garso
       rinkimas (`generate_audio.collect()`) šių raktų nerenka, nes jie
       nėra tariami, todėl naujų mp3 įrašų nereikia. */
    const L = config.labels || {};
    const N = config.notes || {};
    const B = config.bodies || {};
    const prose = (obj, key) => (typeof obj[key] === "string" ? obj[key].trim() : "");
    const join = (...parts) => parts.filter(Boolean).join(" ");
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
       ir eilutė persirikiuoja, o ne išstumia puslapį.

       Kūno takelis — 7.5rem, o ne buvę 6.1rem: ilgiausias oficialaus vardo
       žodis „Stačiakampis“ prie .8rem/800 yra 96 px, o 6.1rem stulpelis
       (97.6 px) atėmus paminkštinimą duoda ~84 px — @390 px ekrane žodis
       lūžo per pusąžodį („Stačiakam / pis“), nors dokumentas neslenka
       (LL-51). 7.5rem = 120 px → turinys ≥106 px, žodis lieka sveikas
       @320–1440 ir 200 % tekste. */
    /* Pastaba — turinys, ne kodas (#5828). Anksčiau ji buvo įrašyta čia, todėl
       kalbos redaktorius negalėjo jos pataisyti nekeisdamas simuliacijos kodo.
       Dabar tekstas imamas iš modulio `sim.config.intro`; atsarginis variantas
       yra TIK pirmasis to paties sakinio sakinys, todėl negali jai prieštarauti
       (LL-42). Triejų krypčių vardai — tie patys, kaip VIEWS mygtukų etiketės. */
    const intro = typeof config.intro === "string" && config.intro.trim()
      ? config.intro.trim()
      : "Pasirink kūną ir spėk, kokią formą matai.";
    stage.innerHTML = `
      <div id="ef-wrap" style="width:100%;max-width:36rem;margin:0 auto;box-sizing:border-box">
        <p id="ef-intro" class="sim-note" style="margin:0 0 .5rem;text-align:center"></p>
        <div id="ef-bodies" role="group" aria-label="Pasirink kūną"
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(7.5rem,100%),1fr));gap:.4rem;box-sizing:border-box"></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(7rem,100%),1fr));gap:.5rem;margin-top:.7rem;box-sizing:border-box">
          <figure style="margin:0;text-align:center;min-width:0">
            <svg id="ef-solid" viewBox="0 0 200 200" width="100%" role="img"
                 style="display:block;max-height:11rem;margin:0 auto"></svg>
            <figcaption id="ef-solid-cap" style="font-size:.85rem;color:var(--ink-soft);font-weight:700"></figcaption>
          </figure>
          <figure style="margin:0;text-align:center;min-width:0">
            <svg id="ef-flat" viewBox="0 0 200 200" width="100%" role="img"
                 style="display:block;max-height:11rem;margin:0 auto"></svg>
            <figcaption id="ef-flat-cap" style="font-size:.85rem;color:var(--ink-soft);font-weight:700"></figcaption>
          </figure>
        </div>
        <p id="ef-views-heading" style="margin:.7rem 0 .3rem;font-size:.85rem;font-weight:800;color:var(--ink-soft);text-align:center"></p>
        <div id="ef-views" role="group" aria-label="Iš kur žiūri"
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(5rem,100%),1fr));gap:.4rem;box-sizing:border-box"></div>
        <p id="ef-shapes-heading" style="margin:.7rem 0 .3rem;font-size:.85rem;font-weight:800;color:var(--ink-soft);text-align:center"></p>
        <div id="ef-shapes" role="group" aria-label="Kokią formą matai"
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(6.4rem,100%),1fr));gap:.4rem;box-sizing:border-box"></div>
      </div>`;

    controls.innerHTML = `
      <div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;align-items:center">
        <button class="btn secondary" id="ef-show" aria-label="Rodyti vaizdą neišspėjus">Rodyk vaizdą</button>
        <button class="btn ghost" id="ef-reset" aria-label="Pradėti iš naujo">Iš naujo</button>
      </div>`;

    const solidSvg = stage.querySelector("#ef-solid");
    const introEl = stage.querySelector("#ef-intro");
    /* textContent, o ne innerHTML: tekstas ateina iš turinio failo, todėl
       negali įterpti žymų. */
    if (introEl) introEl.textContent = intro;
    const flatSvg = stage.querySelector("#ef-flat");
    const flatCap = stage.querySelector("#ef-flat-cap");
    const solidCap = stage.querySelector("#ef-solid-cap");
    const viewsHeading = stage.querySelector("#ef-views-heading");
    const shapesHeading = stage.querySelector("#ef-shapes-heading");
    const solidCaption = prose(L, "solidCaption");
    const flatCaption = prose(L, "flatCaption");

    /* Užrašai imami iš `config.labels` (#8987). Jei rakto nėra, elementas
       paslepiamas — antras to paties sakinio egzempliorius kode būtų
       dviejų šaltinių defektas (LL-42). */
    const showLabel = (el, value) => {
      if (!el) return;
      el.textContent = value;
      el.hidden = !value;
    };
    showLabel(solidCap, solidCaption);
    showLabel(viewsHeading, prose(L, "viewsHeading"));
    showLabel(shapesHeading, prose(L, "shapesHeading"));
    if (solidCaption) solidSvg.setAttribute("aria-label", solidCaption);
    if (flatCaption) flatSvg.setAttribute("aria-label", flatCaption);
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
        flatCap.hidden = false;
        flatCap.textContent = `${v.prep.charAt(0).toUpperCase() + v.prep.slice(1)} matai ${shape.acc}`;
      } else {
        flatSvg.innerHTML = `<text x="100" y="128" text-anchor="middle" font-family="system-ui, sans-serif"
              font-size="96" font-weight="900" fill="var(--ink-faint)">?</text>`;
        flatSvg.setAttribute("aria-label", "Vaizdas dar neatskleistas");
        flatCap.hidden = false;
        flatCap.textContent = flatCaption ? `${flatCaption} ${v.prep}?` : "?";
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
      api.note(prose(N, "prompt"));
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
      api.readout(finished ? join(head, prose(N, "allSides")) : head);

      const why = prose(B, body);
      let note;
      if (!guess) note = prose(N, "revealed");
      else if (guess === target) note = join(why, prose(N, "sameBody"));
      else note = join(why, prose(N, "lookRight"));
      // Viena pastaba, o ne dvi iš eilės: `api.note` keičia tekstą, ne prideda.
      if (finished) note = join(note, prose(N, "goal"));
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
        api.readout(join(
          `${prep.charAt(0).toUpperCase() + prep.slice(1)} matai ${shape.acc}.`,
          prose(N, "chooseView"),
        ));
      } else {
        api.readout(promptText());
        api.note(prose(N, "guess"));
      }
    }));

    shapeBtns.forEach((btn) => btn.addEventListener("click", () => reveal(btn.dataset.shape)));

    showBtn.addEventListener("click", () => reveal(null));

    resetBtn.addEventListener("click", () => {
      revealed.clear();
      done.clear();
      lastSaid = "";
      paint();
      /* Tas pats sakinys, kaip balsui (#5828/LL-42): ekranas ir balsas imami
         iš vieno šaltinio. Atsarginis — kitais žodžiais ir tik kai config
         sakinio nėra. */
      api.readout(S["is-naujo"] || "Pradedam iš naujo.");
      api.note(prose(N, "prompt"));
      speakOnce(S["is-naujo"]);
    });

    paint();
    announcePrompt();

    return null;
  },
};

/* ------------------------------------------------------------------ */
/* Ilgis ir vienetas — sąlyginiai matavimo vienetai (1 klasė)           */
/* ------------------------------------------------------------------ */

/**
 * Modelis: lenta įterpiama VIENĄ kartą ir nejuda, o vaikas keičia tik
 * vienetą — sąvaržėlę, trintuką ar pieštuką. Skaičius išeina kitas
 * (6, 4, 2), o lenta lieka ta pati. Grįžus prie jau matuoto vieneto
 * gaunamas lygiai toks pat vaizdas: tai kontrolinis bandymas, kurio du
 * atskiri paveikslai negali duoti.
 *
 * Skaičius niekada nerodomas vienas — visada su vienetu („Trys sąvaržėlės“).
 * Dalyba tikrinama, ne apvalinama: jei vienetas netelpa sveiką kartų skaičių,
 * modelis pasako, kad vienetai nesuderinti su lenta.
 *
 * Scena surenkama iš `art.js` (LL-13): `art.defs` + `art.plank`. Vienetų
 * žetonai skiriasi forma, o ne vien spalva.
 *
 * Komponentas gyvena čia, o ne `matematika.js`, nes pastarasis dar yra
 * vienintelė `check_art.py` LEGACY scena: importavus jame art.js, visą failą
 * tektų skelbti migruotu, nors kitos jo scenos tebepiešiamos savo formomis.
 */
const IV_BOARD_X = 40;
const IV_BOARD_BOTTOM = 148;
const IV_BOARD_H = 46;
const IV_TOKEN_Y = 112;
const IV_VB_W = 328;

/** Vieneto žetonas. Forma atpažįstama ir be spalvos (LL-13).
 *  Piešinys užima LYGIAI savo laukelį [x, x + px]: todėl vienetai dėliojami
 *  be tarpų, o paskutinio žetono kraštas sutampa su lentos galu. */
function ilgioToken(unit, x) {
  const w = unit.px;
  const y = IV_TOKEN_Y;
  if (unit.id === "trintukas") {
    return `<g><rect x="${x}" y="${y + 5}" width="${w}" height="20" rx="4"
      fill="#f0a6b8" stroke="#a85f76" stroke-width="2.4"/>
      <rect x="${x + w - 15}" y="${y + 8}" width="11" height="14" fill="#ffffff" opacity=".6"/></g>`;
  }
  if (unit.id === "piestukas") {
    return `<g>
      <rect x="${x}" y="${y + 8}" width="${w - 30}" height="14" rx="2"
        fill="#f6c86e" stroke="#a9793f" stroke-width="2.2"/>
      <path d="M${x + w - 30} ${y + 8} L${x + w} ${y + 15} L${x + w - 30} ${y + 22} Z"
        fill="#f6c86e" stroke="#a9793f" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M${x + w - 12} ${y + 13} L${x + w} ${y + 15} L${x + w - 12} ${y + 17} Z" fill="#3a3a3a"/>
      <rect x="${x + 1}" y="${y + 8}" width="9" height="14" fill="#e46b6b" opacity=".85"/>
    </g>`;
  }
  return `<g>
    <rect x="${x}" y="${y + 5}" width="${w}" height="20" rx="9"
      fill="none" stroke="#5b6b7a" stroke-width="3"/>
    <rect x="${x + 6}" y="${y + 11}" width="${w - 12}" height="8" rx="4"
      fill="none" stroke="#5b6b7a" stroke-width="2.4"/>
  </g>`;
}

const ilgisIrVienetas = {
  mount({ stage, controls, api, config }) {
    const S = config.sentences || {};
    const bag = (key) => (S[key] && typeof S[key] === "object" ? S[key] : {});
    const line = (key) => (typeof S[key] === "string" ? S[key] : "");
    const tell = (text) => { if (text) api.speak(text); };
    const cap = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : "");
    const positive = (value, fallback) => {
      const n = Number(value);
      return Number.isFinite(n) && n > 0 ? n : fallback;
    };

    const units = (Array.isArray(config.units) ? config.units : [])
      .filter((u) => u && typeof u.id === "string" && Number(u.px) > 0)
      .map((u) => ({
        id: u.id,
        pl: typeof u.pl === "string" ? u.pl : u.id,
        instr: typeof u.instr === "string" ? u.instr : u.id,
        px: Number(u.px),
      }));
    const boardPx = positive(config.board && config.board.px, 240);
    const unitById = (id) => units.find((u) => u.id === id) || null;
    const countOf = (u) => Math.round(boardPx / u.px);
    const whole = units.length > 0
      && units.every((u) => Math.abs(boardPx / u.px - Math.round(boardPx / u.px)) < 1e-9);

    if (!whole) {
      // Tylus apvalinimas būtų neteisingas modelis: „7,5 trintuko“ vaikas nemato.
      console.error("ilgis-ir-vienetas: vienetai nesuderinti su lenta", boardPx, units.map((u) => u.px));
      stage.innerHTML = '<p class="sim-note" style="margin:0"></p>';
      stage.firstElementChild.textContent = line("mismatch");
      api.readout(line("mismatch"));
      return () => {};
    }

    const startId = unitById(config.start) ? config.start : units[0].id;
    const dirUnit = unitById(config.dirGuess) ? config.dirGuess : "";
    const guessValues = (Array.isArray(config.firstGuess) ? config.firstGuess : [])
      .map((n) => Number(n))
      .filter((n) => Number.isInteger(n) && n > 0)
      .slice(0, 3);

    const countPhrase = (u, n) => {
      const list = bag("counts")[u.id];
      if (!Array.isArray(list) || n < 1 || n > list.length) return "";
      return typeof list[n - 1] === "string" ? list[n - 1] : "";
    };

    stage.innerHTML = `
      <div id="iv-wrap" style="width:100%;max-width:22rem;margin:0 auto;box-sizing:border-box;min-width:0">
        <svg id="iv-svg" viewBox="0 0 ${IV_VB_W} 184" width="100%" role="img"
             style="display:block;width:100%;height:auto"></svg>
        <p id="iv-records" class="sim-note" style="margin:.4rem 0 0"></p>
      </div>`;

    controls.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:.5rem;width:100%;min-width:0">
        <div id="iv-guess" role="group" aria-label="Spėk, kiek vienetų telpa"
             style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem"></div>
        <div id="iv-dir" role="group" aria-label="Ar telps daugiau, ar mažiau"
             style="display:none;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem"></div>
        <div id="iv-units" role="group" aria-label="Kuo matuoti"
             style="display:none;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem"></div>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;min-width:0">
          <button class="btn secondary" type="button" id="iv-place"
                  style="display:none;min-height:48px;flex:1 1 10rem">Dėk vieną</button>
          <button class="btn ghost" type="button" id="iv-reset" style="min-height:48px">Iš naujo</button>
        </div>
      </div>`;

    const svg = stage.querySelector("#iv-svg");
    const recordsEl = stage.querySelector("#iv-records");
    const guessEl = controls.querySelector("#iv-guess");
    const dirEl = controls.querySelector("#iv-dir");
    const unitsEl = controls.querySelector("#iv-units");
    const placeBtn = controls.querySelector("#iv-place");
    const resetBtn = controls.querySelector("#iv-reset");

    svg.innerHTML = [
      art.defs("iv"),
      art.plank(IV_BOARD_X, IV_BOARD_BOTTOM, boardPx, IV_BOARD_H),
      `<line x1="${IV_BOARD_X + boardPx}" y1="${IV_BOARD_BOTTOM - IV_BOARD_H - 10}"
        x2="${IV_BOARD_X + boardPx}" y2="${IV_BOARD_BOTTOM + 6}"
        style="stroke:var(--ink);stroke-opacity:.45;stroke-width:2.5"
        stroke-dasharray="5 5" stroke-linecap="round"/>`,
      '<g id="iv-tokens"></g>',
      `<text id="iv-count" x="${IV_VB_W / 2}" y="174" text-anchor="middle"
        style="font-family:var(--font-head);font-size:15px;font-weight:800;fill:var(--ink)"></text>`,
    ].join("");

    const tokensG = svg.querySelector("#iv-tokens");
    const countEl = svg.querySelector("#iv-count");

    guessEl.innerHTML = guessValues.map((n) => (
      `<button class="btn secondary" type="button" data-guess="${n}"
        aria-label="Spėju ${n}" style="min-height:48px">${n}</button>`
    )).join("");

    dirEl.innerHTML = `
      <button class="btn secondary" type="button" data-dir="more" aria-label="Bus daugiau vienetų"
              style="min-height:48px">Daugiau</button>
      <button class="btn secondary" type="button" data-dir="less" aria-label="Bus mažiau vienetų"
              style="min-height:48px">Mažiau</button>`;

    unitsEl.innerHTML = units.map((u) => (
      `<button class="btn secondary" type="button" data-unit="${u.id}" aria-pressed="false"
        aria-label="Matuoti ${u.instr}"
        style="min-height:56px;padding:.4rem .3rem;font-size:.85rem;line-height:1.15;overflow-wrap:anywhere">${cap(u.pl)}</button>`
    )).join("");

    let state = {
      unit: startId,
      placed: 0,
      phase: "guess",      // guess | dir | measure
      firstGuess: null,
      dirGuess: null,
      measured: new Map(), // vienetas → kiek vienetų telpo
      reported: false,
    };

    const show = (el, on, display) => { if (el) el.style.display = on ? display : "none"; };

    function paint() {
      const u = unitById(state.unit);
      if (!u) return;
      const total = countOf(u);
      let markup = "";
      for (let i = 0; i < state.placed && i < total; i += 1) {
        markup += ilgioToken(u, IV_BOARD_X + i * u.px);
      }
      tokensG.innerHTML = markup;
      const phrase = state.placed > 0 ? countPhrase(u, state.placed) : "";
      countEl.textContent = phrase;
      svg.setAttribute("aria-label",
        `Lenta. ${phrase ? `${phrase}.` : "Dar nieko nepadėta."} Lentos galas pažymėtas.`);
    }

    function markUnits() {
      units.forEach((u) => {
        const btn = unitsEl.querySelector(`[data-unit="${u.id}"]`);
        if (!btn) return;
        const on = u.id === state.unit;
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        btn.style.borderColor = on ? "var(--accent)" : "var(--line)";
        btn.style.background = on
          ? "color-mix(in srgb, var(--accent) 14%, var(--paper-2))"
          : "var(--paper-2)";
        btn.style.boxShadow = on ? "inset 0 0 0 2px var(--accent)" : "0 3px 0 var(--line)";
      });
    }

    function sync() {
      // Vienetų eilutė atsiranda tik po pirmo matavimo: pirma spėjimas ir
      // matavimas sąvaržėlėmis, tik tada keičiamas vienetas (M-07 seka).
      show(guessEl, state.phase === "guess", "grid");
      show(dirEl, state.phase === "dir", "grid");
      show(unitsEl, state.measured.size > 0, "grid");
      const u = unitById(state.unit);
      show(placeBtn, state.phase === "measure" && !!u && state.placed < countOf(u), "inline-flex");
      paint();
      markUnits();
    }

    function showRecords() {
      const done = units.filter((u) => state.measured.has(u.id));
      if (!done.length) { recordsEl.textContent = ""; return; }
      const parts = done.map((u) => countPhrase(u, countOf(u))).filter(Boolean);
      recordsEl.textContent = state.measured.size === units.length
        ? `${parts.join(" · ")} — ${line("same")}`
        : parts.join(" · ");
    }

    function finishUnit(u) {
      state.measured.set(u.id, countOf(u));
      const full = bag("full")[u.id] || "";
      let note;
      if (state.measured.size === 1 && state.firstGuess != null) {
        note = bag("cmp")[String(state.firstGuess)] || "";
      } else if (u.id === dirUnit && state.dirGuess) {
        note = state.dirGuess === "more" ? line("dirMore") : line("dirLess");
      } else {
        note = line("last");
      }
      showRecords();
      sync();
      if (state.measured.size === units.length) {
        // Tikslas pasiektas DABAR: visi trys vienetai, o ne pirmas matavimas.
        api.readout([full, line("all")].filter(Boolean).join(" "));
        api.note(line("same"));
        tell(full);
        if (!state.reported) {
          state.reported = true;
          api.progress({ correct: true });
        }
        resetBtn.focus();
        return;
      }
      api.readout(full);
      api.note(note);
      tell(full);
      const next = units.find((u2) => !state.measured.has(u2.id));
      if (next) {
        const btn = unitsEl.querySelector(`[data-unit="${next.id}"]`);
        if (btn) btn.focus();
      } else {
        resetBtn.focus();
      }
    }

    function placeOne() {
      if (state.phase !== "measure") return;
      const u = unitById(state.unit);
      if (!u) return;
      const total = countOf(u);
      if (state.placed >= total) {
        api.note(line("fullBoard"));
        return;
      }
      state.placed += 1;
      sync();
      const phrase = countPhrase(u, state.placed);
      api.readout(phrase ? `${phrase}.` : "");
      if (state.placed < total) {
        api.note(line("place"));
        tell(phrase);
        return;
      }
      finishUnit(u);
    }

    function selectUnit(id) {
      const u = unitById(id);
      if (!u || state.phase === "guess") return;
      state.unit = id;
      if (state.measured.has(id)) {
        // Grįžimas prie jau matuoto vieneto: lygiai tas pats vaizdas.
        state.placed = countOf(u);
        state.phase = "measure";
        sync();
        api.readout(bag("full")[id] || "");
        api.note(line("back"));
        tell(bag("full")[id] || "");
        return;
      }
      state.placed = 0;
      if (id === dirUnit && !state.dirGuess) {
        state.phase = "dir";
        sync();
        api.readout(line("ask"));
        api.note(line("askNote"));
        tell(line("ask"));
        const first = dirEl.querySelector("button");
        if (first) first.focus();
        return;
      }
      state.phase = "measure";
      sync();
      api.readout(line("next"));
      api.note(line("place"));
      tell(line("next"));
      placeBtn.focus();
    }

    function chooseGuess(n) {
      if (state.phase !== "guess") return;
      state.firstGuess = n;
      state.phase = "measure";
      state.placed = 0;
      sync();
      const text = bag("guess")[String(n)] || "";
      if (text) api.readout(text);
      api.note(line("guessNote"));
      tell(text);
      placeBtn.focus();
    }

    function chooseDir(kind) {
      if (state.phase !== "dir") return;
      state.dirGuess = kind === "less" ? "less" : "more";
      state.phase = "measure";
      state.placed = 0;
      sync();
      api.readout(line("next"));
      api.note(line("place"));
      tell(line("next"));
      placeBtn.focus();
    }

    function resetAll() {
      state = {
        unit: startId,
        placed: 0,
        phase: "guess",
        firstGuess: null,
        dirGuess: null,
        measured: new Map(),
        reported: false,
      };
      recordsEl.textContent = "";
      sync();
      api.readout(line("start"));
      api.note(line("guessNote"));
      tell(line("start"));
      const first = guessEl.querySelector("button");
      if (first) first.focus();
    }

    guessEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-guess]");
      if (btn) chooseGuess(Number(btn.dataset.guess));
    });
    dirEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-dir]");
      if (btn) chooseDir(btn.dataset.dir);
    });
    unitsEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-unit]");
      if (btn) selectUnit(btn.dataset.unit);
    });
    placeBtn.addEventListener("click", placeOne);
    resetBtn.addEventListener("click", resetAll);

    /* Klaviatūra: ←/→ perjungia vienetus, R atstato — tik kai fokusas
       valdikliuose, kad nepagrobtų puslapio slinkimo. */
    controls.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (state.phase === "guess") return;
        const i = units.findIndex((u) => u.id === state.unit);
        if (i < 0) return;
        e.preventDefault();
        const next = units[(i + (e.key === "ArrowRight" ? 1 : units.length - 1)) % units.length];
        selectUnit(next.id);
        const btn = unitsEl.querySelector(`[data-unit="${next.id}"]`);
        if (btn) btn.focus();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        resetAll();
      }
    });

    sync();
    api.readout(line("start"));
    api.note(line("guessNote"));
    tell(line("start"));

    return () => {};
  },
};

export const SIMS = {
  "erdvines-figuros": erdvinesFiguros,
  "ilgis-ir-vienetas": ilgisIrVienetas,
};
