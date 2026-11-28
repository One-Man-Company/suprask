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

       Kūno takelis — 8.5rem, o ne buvę 7.5rem: mygtuko etiketė pakelta nuo
       .8rem iki .95rem (#47139 — 12,8 px 6–7 m. vaikui per maža), todėl
       ilgiausias oficialaus vardo žodis „Stačiakampis“ prie .95rem/800 yra
       ~114 px, o 7.5rem stulpelis (120 px) atėmus paminkštinimą duoda ~110 px —
       žodis lūžtų per pusęžodį (LL-51). 8.5rem = 136 px → turinys ≥126 px,
       žodis lieka sveikas @320–1440 ir 200 % tekste. Stulpelių skaičius
       nekinta: 576 px juostoje ir anksčiau tilpo 4, ir dabar 4. */
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
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(8.5rem,100%),1fr));gap:.4rem;box-sizing:border-box"></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(7rem,100%),1fr));gap:.5rem;margin-top:.7rem;box-sizing:border-box">
          <figure style="margin:0;text-align:center;min-width:0">
            <svg id="ef-solid" viewBox="0 0 200 200" width="100%" role="img"
                 style="display:block;max-height:11rem;margin:0 auto"></svg>
            <figcaption id="ef-solid-cap" style="font-size:.95rem;color:var(--ink-soft);font-weight:700"></figcaption>
          </figure>
          <figure style="margin:0;text-align:center;min-width:0">
            <svg id="ef-flat" viewBox="0 0 200 200" width="100%" role="img"
                 style="display:block;max-height:11rem;margin:0 auto"></svg>
            <figcaption id="ef-flat-cap" style="font-size:.95rem;color:var(--ink-soft);font-weight:700"></figcaption>
          </figure>
        </div>
        <p id="ef-views-heading" style="margin:.7rem 0 .3rem;font-size:.95rem;font-weight:800;color:var(--ink-soft);text-align:center"></p>
        <div id="ef-views" role="group" aria-label="Iš kur žiūri"
             style="display:flex;flex-wrap:wrap;gap:.4rem;box-sizing:border-box"></div>
        <p id="ef-shapes-heading" style="margin:.7rem 0 .3rem;font-size:.95rem;font-weight:800;color:var(--ink-soft);text-align:center"></p>
        <div id="ef-shapes" role="group" aria-label="Kokią formą matai"
             style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(8.25rem,100%),1fr));gap:.4rem;box-sizing:border-box"></div>
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
        <span style="font-size:.95rem;line-height:1.15;font-weight:800;text-align:center;overflow-wrap:anywhere">${b.name}</span>
      </button>`).join("");

    /* Antra eilutė — ne puošmena: joje lieka tai, ką vaikas jau matė iš šios
       krypties. Trys mygtukai kartu parodo „vienas kūnas, trys vaizdai“.
       Jos dydis — .95rem, kaip ir visa kita skaitoma sim teksto eilutė:
       modulio užrašas vaiką nukreipia kaip tik į šią eilutę („Mygtuke matysi,
       ką jau matei“), todėl ji negali būti mažiausias ekrano tekstas
       (#47139, LL-185 atvirkštinė: .8rem = 12,8 px 6–7 m. vaikui per maža).

       Eilutė — flex, o ne trys stulpeliai: ilgiausias formos vardas
       „stačiakampis“ prie .95rem užima ~112 px, trims mygtukams reikia
       ~349 px, o sim juosta @390 px ekrane teturi ~329 px. Fiksuotas tris
       stulpelis todėl laužydavo žodį per pusę („stačiakam / pis“, LL-51) —
       ir prie .8rem jau laužė (94,6 px į 93 px). Su `flex:1 1 7rem`
       stalčiuje telpa trys (576 px), telefone — du ir trečias per visą
       plotį, todėl žodis lieka sveikas visur, o trys kryptys vis tiek
       matomos kartu. */
    viewsEl.innerHTML = VIEWS.map((v) => `
      <button type="button" class="btn secondary ef-view" data-view="${v.id}"
              aria-pressed="${v.id === view}" aria-label="${v.label}"
              style="display:flex;flex:1 1 7rem;min-width:0;flex-direction:column;align-items:center;justify-content:center;gap:.1rem;padding:.45rem .25rem;min-height:56px;box-sizing:border-box;text-align:center">
        <span style="font-size:.95rem;line-height:1.15;font-weight:800;overflow-wrap:anywhere">${v.label}</span>
        <span class="ef-seen" style="font-size:.95rem;line-height:1.15;color:var(--ink-soft);font-weight:700;min-height:1.15em;overflow-wrap:anywhere"></span>
      </button>`).join("");

    shapesEl.innerHTML = Object.entries(SHAPES).map(([id, sh]) => `
      <button type="button" class="btn secondary ef-shape" data-shape="${id}" aria-label="${sh.nom}"
              style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.15rem;padding:.35rem .25rem;min-height:56px;box-sizing:border-box">
        <svg viewBox="0 0 200 200" width="26" height="26" aria-hidden="true" focusable="false">${art.flatShape(id, 100, 100, 160, 9)}</svg>
        <span style="font-size:.95rem;line-height:1.1;font-weight:800;text-align:center;overflow-wrap:anywhere">${sh.nom.charAt(0).toUpperCase() + sh.nom.slice(1)}</span>
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
             style="display:none;flex-wrap:wrap;gap:.5rem"></div>
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
        style="flex:1 1 7.5rem;min-width:0;min-height:56px;padding:.4rem .3rem;font-size:var(--fs-s);line-height:1.15;overflow-wrap:anywhere">${cap(u.pl)}</button>`
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
      show(unitsEl, state.measured.size > 0, "flex");
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

/* ------------------------------------------------------------------ */
/* Masė ir kilogramas — dėžutė prieš 1 kg svarstį (1 klasė)             */
/* ------------------------------------------------------------------ */

/**
 * Modelis: dvi VIENODO dydžio dėžutės (putos ir smėlis) sveriamos tose
 * pačiose svarstyklėse prieš 1 kg svarstį. Svarstyklės ir svarstis nejuda —
 * keičiasi tik dėžutė ant lėkštės, todėl kiekvieną kartą matomas tas pats
 * klausimas („sunkesnė ar lengvesnė už kilogramą?“), o atsakymas kitas.
 * Tai ir yra sąvoka, kurios neparodo nei tekstas, nei paveikslėlis: dydis
 * masės nepasako.
 *
 * Ko modelis NEDARO: nerašo tikslios masės gramais. Programa 1 klasei
 * prašo „pajausti, kurių daiktų masę tinka apibūdinti kilogramu“, o
 * gramai ir vienetų sąryšiai priskirti 2 klasei
 * (`sources/pradinio-bp-rekomendacijos-2024.txt:1015–1017`). Todėl
 * palyginimas su 1 kg svarstžiu ir yra visas modelis — dvi baigtys:
 * lengvesnė ar sunkesnė.
 *
 * Spėjimas prieš kiekvieną matavimą (LL-15): spėjimas lieka matomas
 * mygtuke iki galo ir po matavimo tik palyginamas, niekada nevadinamas
 * klaida. Be jo modelis virstų mygtuko spaudimu, o ne sprendimu.
 */
const MS_CX = 150;        // svarstyklių stulpas
const MS_BASE = 196;      // stalviršiaus linija (svarstyklių pagrindas)
const MS_BOX = 42;        // dėžutės kraštinė
const MS_WEIGHT = 47;     // svarsčio plotis: 0,32×47 = 15,0 px užrašui „1 kg“ (LL-186)
const MS_VB_W = 300;
const MS_VB_H = 212;

const msEsc = (text) => String(text).replace(/[&<>"]/g, (c) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]
));

const dezuteIrKilogramas = {
  mount({ stage, controls, api, config }) {
    const S = config.sentences || {};
    const L = config.labels || {};
    const line = (key) => (typeof S[key] === "string" ? S[key] : "");
    const label = (key, fallback) => (typeof L[key] === "string" && L[key] ? L[key] : fallback);
    const tell = (text) => { if (text) api.speak(text); };
    const reference = config.reference && typeof config.reference.label === "string"
      ? config.reference.label
      : "1 kg";

    /* Dėžutė be `vs` arba su kitu žodžiu modelio neturi: svarstyklės
       nepajudėtų, o sakinys teigtų rezultatą. Todėl tai klaida, o ne
       tyliai praleista dėžutė (LL-03, LL-37). */
    const raw = Array.isArray(config.boxes) ? config.boxes : [];
    const boxes = raw.filter((b) => b
      && typeof b.id === "string"
      && typeof b.name === "string"
      && (b.vs === "daugiau" || b.vs === "maziau"));
    if (boxes.length !== raw.length || boxes.length < 2) {
      console.error("dezute-ir-kilogramas: dėžutės nesuderintos su svarstyklėmis", raw);
      stage.innerHTML = '<p class="sim-note" style="margin:0"></p>';
      stage.firstElementChild.textContent = label("mismatch", "Dėžutės nesuderintos su svarstyklėmis.");
      api.readout(label("mismatch", "Dėžutės nesuderintos su svarstyklėmis."));
      return () => {};
    }

    const boxById = (id) => boxes.find((b) => b.id === id) || boxes[0];
    const resultText = (vs) => (vs === "daugiau"
      ? label("resHeavier", "sunkesnė už 1 kg")
      : label("resLighter", "lengvesnė už 1 kg"));

    stage.innerHTML = `
      <div id="ms-wrap" style="width:100%;max-width:23rem;margin:0 auto;box-sizing:border-box;min-width:0">
        <svg id="ms-svg" viewBox="0 0 ${MS_VB_W} ${MS_VB_H}" width="100%" role="img"
             style="display:block;width:100%;height:auto"></svg>
        <p id="ms-records" class="sim-note" style="margin:.4rem 0 0"></p>
      </div>`;

    controls.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:.5rem;width:100%;min-width:0">
        <div id="ms-boxes" role="group" aria-label="${msEsc(label("groupBox", "Pasirink dėžutę"))}"
             style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem"></div>
        <div id="ms-guess" role="group" aria-label="${msEsc(label("groupGuess", "Spėk, kokia dėžutė"))}"
             style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem">
          <button class="btn secondary" type="button" data-guess="daugiau" aria-pressed="false"
                  style="min-height:48px;padding:.4rem .3rem;font-size:var(--fs-s);line-height:1.15;overflow-wrap:anywhere">${msEsc(label("guessHeavier", "Sunkesnė už 1 kg"))}</button>
          <button class="btn secondary" type="button" data-guess="maziau" aria-pressed="false"
                  style="min-height:48px;padding:.4rem .3rem;font-size:var(--fs-s);line-height:1.15;overflow-wrap:anywhere">${msEsc(label("guessLighter", "Lengvesnė už 1 kg"))}</button>
        </div>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;min-width:0">
          <button class="btn" type="button" id="ms-weigh" style="min-height:48px;flex:1 1 9rem">${msEsc(label("weigh", "Pasverti"))}</button>
          <button class="btn ghost" type="button" id="ms-reset" style="min-height:48px">${msEsc(label("reset", "Iš naujo"))}</button>
        </div>
      </div>`;

    const svg = stage.querySelector("#ms-svg");
    const recordsEl = stage.querySelector("#ms-records");
    const boxesEl = controls.querySelector("#ms-boxes");
    const guessEl = controls.querySelector("#ms-guess");
    const weighBtn = controls.querySelector("#ms-weigh");
    const resetBtn = controls.querySelector("#ms-reset");

    /* Dėžutės mygtukai: ta pati dėžutė kaip scenoje, tik mažesnė, todėl
       vaikas atpažįsta, kurią pasirinko, ir neskaito vardo vienintelio. */
    boxesEl.innerHTML = boxes.map((b) => `
      <button class="btn secondary" type="button" data-box="${msEsc(b.id)}" aria-pressed="false"
              aria-label="${msEsc(b.name)}"
              style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.15rem;padding:.4rem .3rem;min-height:56px;box-sizing:border-box">
        <svg viewBox="0 0 36 36" width="34" height="34" aria-hidden="true" focusable="false">
          ${art.boxWithContent(b.kind === "putos" ? "putos" : "smelis", 3, 33, 30)}
        </svg>
        <span style="font-size:var(--fs-s);line-height:1.15;font-weight:800;text-align:center;overflow-wrap:anywhere">${msEsc(b.name)}</span>
        <span class="ms-seen" style="font-size:var(--fs-s);line-height:1.15;color:var(--ink-soft);font-weight:700;min-height:1.15em;overflow-wrap:anywhere"></span>
      </button>`).join("");

    const guessBtns = [...guessEl.querySelectorAll("[data-guess]")];

    let state = {
      box: boxes[0].id,
      guesses: new Map(),   // dėžutė → „daugiau“ | „maziau“
      weighed: new Map(),  // dėžutė → tikrasis „daugiau“ | „maziau“
      reported: false,
    };

    const markOne = (btn, on) => {
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.style.borderColor = on ? "var(--accent)" : "var(--line)";
      btn.style.background = on
        ? "color-mix(in srgb, var(--accent) 14%, var(--paper-2))"
        : "var(--paper-2)";
      btn.style.boxShadow = on ? "inset 0 0 0 2px var(--accent)" : "0 3px 0 var(--line)";
    };

    function paint() {
      const b = boxById(state.box);
      const measured = state.weighed.get(b.id);
      const tilt = measured === "daugiau" ? 1 : measured === "maziau" ? -1 : 0;
      const boxPan = art.balancePan(MS_CX, MS_BASE, tilt, -1);
      const kgPan = art.balancePan(MS_CX, MS_BASE, tilt, 1);

      const parts = [
        art.plank(0, 208, MS_VB_W, 12),
        art.balance(MS_CX, MS_BASE, tilt),
      ];
      /* Kol dėžutė nepasverta, abi lėkštės tuščios, o 1 kg svarstis stovi ant
         stalo. Tai vienintelė garbinga būsena: lygi sija su svarstžiu vienoje
         lėkštėje reikštų „lygu“, nors palyginimo dar nebuvo (LL-13 — piešinys
         negali prieštarauti modeliui). */
      if (measured) {
        parts.push(art.boxWithContent(b.kind === "putos" ? "putos" : "smelis",
          boxPan.x - MS_BOX / 2, boxPan.y, MS_BOX));
        parts.push(art.weight(kgPan.x - MS_WEIGHT / 2, kgPan.y, MS_WEIGHT, reference));
      } else {
        parts.push(art.weight(MS_CX + 76, MS_BASE, MS_WEIGHT, reference));
      }
      svg.innerHTML = parts.join("");

      const tiltText = measured === "daugiau"
        ? label("ariaHeavier", "Dėžutė sunkesnė už")
        : measured === "maziau" ? label("ariaLighter", "Dėžutė lengvesnė už") : label("ariaEmpty", "Dėžutė dar nepasverta.");
      svg.setAttribute("aria-label", `${b.name}. ${tiltText} ${reference}.`.replace(/\s+/g, " ").trim());
    }

    function showRecords() {
      const done = boxes.filter((b) => state.weighed.has(b.id));
      recordsEl.textContent = done.length
        ? done.map((b) => `${b.name} — ${resultText(state.weighed.get(b.id))}`).join(" · ")
        : "";
    }

    function mark() {
      boxes.forEach((b) => {
        const btn = boxesEl.querySelector(`[data-box="${b.id}"]`);
        if (!btn) return;
        markOne(btn, b.id === state.box);
        const seen = state.weighed.get(b.id);
        const sub = btn.querySelector(".ms-seen");
        if (sub) sub.textContent = seen ? resultText(seen) : "";
        btn.setAttribute("aria-label", seen ? `${b.name}. ${resultText(seen)}.` : b.name);
      });
      const guess = state.guesses.get(state.box);
      guessBtns.forEach((btn) => markOne(btn, btn.dataset.guess === guess));
    }

    function sync() {
      paint();
      mark();
      showRecords();
    }

    function selectBox(id) {
      const b = boxById(id);
      state.box = b.id;
      sync();
      const measured = state.weighed.get(b.id);
      if (measured) {
        api.readout(`${b.name}. ${resultText(measured)}.`);
        api.note(state.guesses.get(b.id) === measured ? line("agree") : line("disagree"));
        return;
      }
      api.readout(`${b.name}. ${line("askGuess")}`.trim());
      api.note(line("askGuessNote"));
      tell(line("askGuess"));
    }

    function chooseGuess(kind) {
      const vs = kind === "daugiau" ? "daugiau" : "maziau";
      if (state.weighed.has(state.box)) {
        api.note(line("alreadyWeighed"));
        return;
      }
      state.guesses.set(state.box, vs);
      sync();
      api.readout(vs === "daugiau" ? line("guessedHeavier") : line("guessedLighter"));
      api.note(line("weighNote"));
      tell(vs === "daugiau" ? line("guessedHeavier") : line("guessedLighter"));
    }

    function weigh() {
      const b = boxById(state.box);
      const guess = state.guesses.get(b.id);
      if (!guess) {
        api.readout(line("askGuess"));
        api.note(line("askGuessNote"));
        tell(line("askGuess"));
        const first = guessEl.querySelector("[data-guess]");
        if (first) first.focus();
        return;
      }

      const wasWeighed = state.weighed.has(b.id);
      state.weighed.set(b.id, b.vs);
      sync();

      const shown = b.vs === "daugiau" ? line("weighedHeavier") : line("weighedLighter");
      const done = boxes.every((x) => state.weighed.has(x.id));

      if (done) {
        api.readout(`${shown} ${line("allDone")}`.trim());
        api.note(guess === b.vs ? line("allNoteAgree") : line("allNoteDisagree"));
        tell(shown);
        if (!state.reported) {
          state.reported = true;
          // Tikslas pasiektas DABAR: abi dėžutės pasvertos, o ne pirmas spėjimas.
          api.progress({ correct: true });
        }
        resetBtn.focus();
        return;
      }

      api.readout(shown);
      api.note(wasWeighed ? line("alreadyWeighed") : (guess === b.vs ? line("agree") : line("disagree")));
      tell(shown);
      const next = boxes.find((x) => !state.weighed.has(x.id));
      if (next) {
        const btn = boxesEl.querySelector(`[data-box="${next.id}"]`);
        if (btn) btn.focus();
      }
    }

    function resetAll() {
      state = { box: boxes[0].id, guesses: new Map(), weighed: new Map(), reported: false };
      sync();
      api.readout(line("reset"));
      api.note(line("askGuessNote"));
      tell(line("reset"));
      const first = guessEl.querySelector("[data-guess]");
      if (first) first.focus();
    }

    boxesEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-box]");
      if (btn) selectBox(btn.dataset.box);
    });
    guessEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-guess]");
      if (btn) chooseGuess(btn.dataset.guess);
    });
    weighBtn.addEventListener("click", weigh);
    resetBtn.addEventListener("click", resetAll);

    sync();
    api.readout(line("start"));
    api.note(line("startNote"));
    tell(line("start"));

    return () => {};
  },
};

/* ------------------------------------------------------------------ */
/* 4. Grupavimas pagal požymį (1 klasė, matematika)                    */
/*                                                                    */
/* Modelis: VIENA krūva, trys klausimai. Viršuje krūva nekinta nė      */
/* viename žingsnyje — keičiasi tik požymis, pagal kurį ji skirstoma,  */
/* todėl priežastis matoma be paaiškinimo. Ta pati pora (raudonas ir   */
/* geltonas didelis trikampis) pagal formą atsiduria viename būryje,  */
/* o pagal spalvą — skirtinguose. Grupė nėra daikto savybė.            */
/*                                                                    */
/* Ko modelyje NĖRA: jokio „neteisingo“ skirstymo (gairės P3). Visi   */
/* trys požymiai teisingi, nes kiekvienas atsako į savo klausimą. Nėra */
/* ir ketvirto požymio („gražus“, „mano mėgstamas“) — jo paveikslėlyje */
/* nematyti, o modelis rodo tik tai, ką vaikas gali patikrinti akimis. */
/*                                                                    */
/* Būriai IŠVEDAMI iš tų pačių `items` laukelių, kuriuos mato vaikas   */
/* (`valueOf`), o ne įrašomi atskirai — ta pati taisyklė kaip M-07 ir  */
/* M-10. Jei modulio `claim` („šie du bus kartu / atskirai“) nesutampa */
/* su išvesta būsena, komponentas sako klaidą garsiai (console.error),*/
/* o ne tyliai nupiešia kitą būrį, negu teigia sakinys (LL-33, LL-25). */
/*                                                                    */
/* Spėjimas NĖRA vertinamas kaip teisingas ar klaidingas: jis tik      */
/* pakartojamas prieš tai, kas atsitiko. Kadangi ta pati pora vieną    */
/* kartą būna kartu, o kitą — ne, „neteisingo spėjimo“ sąvoka čia      */
/* neturi prasmės, o bauda mokytų priešingai nei gairės T5.1 (LL-18).  */
/*                                                                    */
/* Scena surenkama iš `art.js` dalių (LL-13): art.flatShape su        */
/* užpildu, kuris čia yra pats tiriamas požymis.                       */
/* ------------------------------------------------------------------ */
const KG_VIEW = 132;
const KG_COLOR = { raudona: "#e2695c", geltona: "#f2c14e", melyna: "#6d9bd8" };
const KG_SHAPES = ["trikampis", "kvadratas", "apskritimas"];
const KG_SIZES = ["didelis", "mazas"];
const KG_ATTR = { forma: "shape", spalva: "color", dydis: "size" };

const kruvaIrBuriai = {
  mount({ stage, controls, api, config }) {
    const S = config.sentences || {};
    const L = config.labels || {};
    const V = config.values || {};

    /* Proza — tik iš `config.sentences` (LL-42): kode nėra nė vieno
       sakinio, kurio negirdėtų balsas ir nematytų `check_audio.py`. */
    const line = (key) => (typeof S[key] === "string" ? S[key] : "");
    const lab = (key, fallback) => {
      const v = typeof L[key] === "string" ? L[key].trim() : "";
      return v || fallback || "";
    };
    const valueLabel = (id, value) => {
      const map = V[id];
      return map && typeof map[value] === "string" ? map[value] : "";
    };

    const ITEMS = Array.isArray(config.items) ? config.items : [];
    const CRITERIA = Array.isArray(config.criteria) ? config.criteria : [];
    const PAIR = config.pair && typeof config.pair === "object" ? config.pair : {};
    const a = ITEMS.find((it) => it && it.id === PAIR.a) || null;
    const b = ITEMS.find((it) => it && it.id === PAIR.b) || null;

    const state = { criterion: "", guess: "", seen: new Set(), reported: false };

    /* --- duomenų vientisumas ---------------------------------------- */
    /* Viską, ką sakinys pasako apie būrį, komponentas perskaičiuoja iš tų
       pačių laukelių, kuriuos mato vaikas (M-07, M-10). */
    function integrity() {
      if (ITEMS.length < 4) return "per mažai daiktų krūvoje";
      if (!a || !b || a === b) return "pora nenurodyta arba sutampa";
      for (const it of ITEMS) {
        if (!it || !KG_SHAPES.includes(it.shape)) return `nežinoma forma „${it && it.shape}“`;
        if (!KG_COLOR[it.color]) return `nežinoma spalva „${it.color}“`;
        if (!KG_SIZES.includes(it.size)) return `nežinomas dydis „${it.size}“`;
      }
      if (!CRITERIA.length) return "nėra nė vieno požymio";
      for (const c of CRITERIA) {
        if (!KG_ATTR[c.id]) return `nežinomas požymis „${c.id}“`;
        if (!line(c.id)) return `požymiui „${c.id}“ trūksta sakinio`;
        if (!lab(c.id, c.button || "")) return `požymiui „${c.id}“ trūksta mygtuko užrašo`;
        for (const it of ITEMS) {
          const v = it[KG_ATTR[c.id]];
          if (!valueLabel(c.id, v)) return `požymiui „${c.id}“ trūksta pavadinimo „${v}“`;
        }
        /* `together` — sakinio teiginys apie porą. Lyginamas su išvesta
           būsena, o ne pasitikima: jei modulis pameluotų, modelio tekstas
           rodytų vieną, o būriai — kitą. */
        const derived = a[KG_ATTR[c.id]] === b[KG_ATTR[c.id]];
        if (typeof c.together === "boolean" && c.together !== derived) {
          return `teiginys „${c.id}: together=${c.together}“ nesutampa su išvesta ${derived}`;
        }
      }
      return "";
    }

    const problem = integrity();
    if (problem) {
      console.error(`kruva-ir-buriai: ${problem}`);
      stage.innerHTML = `<p class="sim-note" style="margin:0">${line("broken")}</p>`;
      controls.innerHTML = "";
      api.readout(line("broken"));
      return null;
    }

    stage.innerHTML = `
      <div id="kg-wrap" style="width:100%;max-width:100%;min-width:0;box-sizing:border-box">
        <p id="kg-pile-note" class="sim-note" style="margin:0 0 .3rem">${line("pileNote")}</p>
        <div id="kg-pile" role="img"
             style="display:flex;flex-wrap:wrap;gap:.45rem;justify-content:center;align-items:flex-end;
                    min-height:2.6rem;padding:.4rem;border:2px dashed var(--line);
                    border-radius:var(--r-s);background:var(--paper);box-sizing:border-box"></div>
        <div id="kg-groups" style="display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.7rem;min-width:0"></div>
        <ul id="kg-marks" style="margin:.55rem 0 0;padding-left:1.1rem;font-size:var(--fs-s);line-height:1.35"></ul>
      </div>`;

    controls.innerHTML = `
      <div role="group" aria-label="${lab("guessGroup", "Pirma spėk")}"
           style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem;width:100%">
        <button type="button" class="btn secondary" id="kg-g-yes" aria-pressed="false"
                style="min-height:48px;min-width:0">${lab("guessYes", "Bus kartu")}</button>
        <button type="button" class="btn secondary" id="kg-g-no" aria-pressed="false"
                style="min-height:48px;min-width:0">${lab("guessNo", "Bus atskirai")}</button>
      </div>
      <div role="group" id="kg-crit" aria-label="${lab("critGroup", "Pasirink požymį")}"
           style="display:flex;flex-direction:column;gap:.4rem;width:100%"></div>
      <button type="button" class="btn ghost" id="kg-reset" style="min-height:48px">${lab("again", "Iš naujo")}</button>`;

    const pileEl = stage.querySelector("#kg-pile");
    const pileNoteEl = stage.querySelector("#kg-pile-note");
    const groupsEl = stage.querySelector("#kg-groups");
    const marksEl = stage.querySelector("#kg-marks");
    const guessYes = controls.querySelector("#kg-g-yes");
    const guessNo = controls.querySelector("#kg-g-no");
    const critEl = controls.querySelector("#kg-crit");
    const resetBtn = controls.querySelector("#kg-reset");

    critEl.innerHTML = CRITERIA.map((c) => (
      `<button type="button" class="btn secondary" data-crit="${c.id}" aria-pressed="false"
               style="min-height:56px;width:100%;padding:.4rem .5rem;line-height:1.2">${lab(c.id, c.button)}</button>`
    )).join("");
    const critBtns = CRITERIA.map((c) => critEl.querySelector(`[data-crit="${c.id}"]`));

    /* Piktograma: forma, spalva ir dydis matomi tame pačiame plote, todėl
       didelis ir mažas daiktas skiriasi dydžiu, o ne tik užrašu. */
    function icon(item) {
      const px = item.size === "didelis" ? 40 : 27;
      const s = item.size === "didelis" ? 96 : 64;
      return `<svg viewBox="0 0 ${KG_VIEW} ${KG_VIEW}" width="${px}" height="${px}" aria-hidden="true"
                   focusable="false" style="display:block;overflow:visible">${
        art.flatShape(item.shape, KG_VIEW / 2, KG_VIEW / 2, s, 4, KG_COLOR[item.color])
      }</svg>`;
    }

    /* Būriai išvedami iš daiktų požymių; tvarka — pirmo pasirodymo tvarka,
       todėl mokytojas gali numatyti, ką vaikas matys, o du bandymai lieka
       palyginami. */
    function groupsOf(id) {
      const order = [];
      const byValue = new Map();
      for (const it of ITEMS) {
        const v = it[KG_ATTR[id]];
        if (!byValue.has(v)) { byValue.set(v, []); order.push(v); }
        byValue.get(v).push(it);
      }
      return order.map((v) => ({ value: v, label: valueLabel(id, v), items: byValue.get(v) }));
    }

    /* Ar pora dabar tame pačiame būryje — perskaičiuojama iš tų pačių
       požymių, pagal kuriuos sudėti būriai, o ne iš atskiro laukelio. */
    const pairTogether = (id) => a[KG_ATTR[id]] === b[KG_ATTR[id]];
    const pairLabel = `${a.label || ""} ${lab("and", "ir")} ${b.label || ""}`;

    function paintPile() {
      pileEl.innerHTML = ITEMS.map((it) => `
        <div style="display:flex;flex-direction:column;align-items:center;gap:.1rem;min-width:0">
          ${icon(it)}
          ${it.id === PAIR.a || it.id === PAIR.b
            ? `<span style="font-size:var(--fs-s);font-weight:800;line-height:1.1">${lab("mark", "Šis")}</span>`
            : ""}
        </div>`).join("");
      pileEl.setAttribute("aria-label", `${lab("pile", "Krūva")}: ${ITEMS.map((it) => it.label || "").filter(Boolean).join(", ")}`);
      if (!line("pileNote")) pileNoteEl.hidden = true;
    }

    function paintGroups() {
      if (!state.criterion) {
        groupsEl.innerHTML = `<p class="sim-note" style="margin:0;width:100%">${line("pick")}</p>`;
        groupsEl.setAttribute("aria-label", line("pick"));
        return;
      }
      const groups = groupsOf(state.criterion);
      groupsEl.innerHTML = groups.map((g) => `
        <div role="group" aria-label="${g.label}: ${g.items.length}"
             style="flex:1 1 6.4rem;min-width:0;box-sizing:border-box;border:2px solid var(--line);
                    border-radius:var(--r-s);background:var(--paper-2);padding:.4rem .45rem">
          <p style="margin:0 0 .3rem;font-size:var(--fs-s);font-weight:800;text-align:center;line-height:1.2">${g.label}</p>
          <div style="display:flex;flex-wrap:wrap;gap:.35rem;justify-content:center;align-items:flex-end">${
            g.items.map(icon).join("")
          }</div>
        </div>`).join("");
      groupsEl.setAttribute("aria-label", groups.map((g) => `${g.label} — ${g.items.length}`).join(", "));
    }

    function paintMarks() {
      /* Požymiai, kurie jau parodyti, lieka ir po „Iš naujo“ (LL-16):
         kitaip vaikas pamiršta, ką jau rado, ir žymos dingsta iki galutinio
         dydžio (LL-20). */
      const seen = CRITERIA.filter((c) => state.seen.has(c.id)).map((c) => line(c.id));
      marksEl.innerHTML = seen.map((t) => `<li>${t}</li>`).join("");
      marksEl.hidden = seen.length === 0;
    }

    function paintControls() {
      const pairs = [[guessYes, state.guess === "yes"], [guessNo, state.guess === "no"]];
      for (const [btn, on] of pairs) {
        btn.setAttribute("aria-pressed", String(on));
        btn.className = on ? "btn" : "btn secondary";
        btn.style.minHeight = "48px";
      }
      critBtns.forEach((btn, i) => {
        if (!btn) return;
        const on = CRITERIA[i].id === state.criterion;
        /* Mygtukai NElukinami be paaiškinimo (LL-04): vaikas gali spausti
           bet kada, o atsakymas — sakinys „pirma spėk“ ir fokusas į spėjimą. */
        btn.setAttribute("aria-pressed", String(on));
        btn.className = on ? "btn" : "btn secondary";
        btn.style.minHeight = "56px";
        btn.style.width = "100%";
        btn.setAttribute("aria-label",
          `${on ? lab("nowOn", "Dabar") + " " : ""}${lab(CRITERIA[i].id, CRITERIA[i].button)}`);
      });
    }

    const paint = () => { paintPile(); paintGroups(); paintMarks(); paintControls(); };
    const tell = (text) => { if (text) api.speak(text); };

    function pickGuess(kind) {
      state.guess = kind;
      paintControls();
      const text = line(kind === "yes" ? "guessYes" : "guessNo");
      api.readout(text);
      api.note(line("chosen"));
      tell(text);
      critBtns[0]?.focus();
    }

    function pickCriterion(id) {
      if (!state.guess) {
        /* Ne „negalima“, o ką daryti toliau: pirma spėk, tada rinkis. Tai
           tvarka, apsauganti nuo spaudymo bandymų būdu (LL-15), o ne bauda. */
        api.readout(line("locked"));
        api.note(line("locked"));
        tell(line("locked"));
        guessYes.focus();
        return;
      }
      const first = !state.seen.has(id);
      state.criterion = id;
      state.seen.add(id);
      paint();

      const fact = line(id);
      /* Spėjimas palyginamas su tuo, kas atsitiko, vieną kartą — prie pirmo
         požymio. Toliau sakomi trys FAKTAI („pagal formą — kartu“, „pagal
         spalvą — atskirai“, „pagal dydį — vėl kartu“), ir būtent jie patys
         parodo, kad ta pati pora atsakė skirtingai į skirtingą klausimą.
         Antro palyginimo nereikia, o kartojamas jis skambėtų kaip bauda
         (T5.1). */
      const cmp = first ? line(state.guess === "yes" ? "cmpYes" : "cmpNo") : "";
      const allSeen = state.seen.size === CRITERIA.length;

      if (allSeen && !state.reported) {
        state.reported = true;
        api.progress({ correct: true });
        api.readout([fact, line("all")].filter(Boolean).join(" "));
        api.note(line("all"));
        tell(line("all"));
        resetBtn.focus();
        return;
      }

      api.readout([cmp, fact].filter(Boolean).join(" "));
      /* Paaiškinimas — mechanizmas, o ne įvykis: „tas pats požymis abiem,
         todėl kartu“ / „šiuo požymiu skiriasi, todėl atskirai“. Jis
         perskaičiuojamas iš tų pačių laukelių, pagal kuriuos sudėti būriai
         (`pairTogether`), todėl sutampa su ekranu (LL-33). */
      api.note(first ? (pairTogether(id) ? line("noteTogether") : line("noteApart")) : line("repeat"));
      tell(fact);
    }

    function reset() {
      state.criterion = "";
      state.guess = "";
      paint();
      api.readout(line("again"));
      api.note(line("guess"));
      tell(line("again"));
      guessYes.focus();
    }

    critEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-crit]");
      if (btn) pickCriterion(btn.dataset.crit);
    });
    guessYes.addEventListener("click", () => pickGuess("yes"));
    guessNo.addEventListener("click", () => pickGuess("no"));
    resetBtn.addEventListener("click", reset);

    /* Pradinė būsena įvardijama, o ne paliekama tyli (LL-194): vaikas turi
       žinoti, kad krūva yra viena ir nepakitusi. */
    paint();
    api.readout(line("start"));
    api.note(line("guess"));
    tell(line("start"));

    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 5. Tinklelio adresas (1 klasė, matematika)                          */
/*                                                                    */
/* Viena sąvoka: LANGELIO ADRESĄ sudaro DU ženklai. Raidė viena pati   */
/* žymi visą stulpelį (kelis langelius), skaičius vienas pats — visą    */
/* eilutę. Tik raidė IR skaičius kartu pasako vieną langelį.            */
/*                                                                    */
/* Klaidinga nuostatą, kurią modelis parodo: „vieno ženklo užtenka     */
/* pasakyti, kur daiktas“ (jos atmaina — „B1 yra pirmas langelis“).    */
/* Todėl pirmas paspaustas ženklas NIEKADA neparyškina vieno langelio: */
/* jis paryškina visą liniją, o langelių skaičius ekrane perskaičiuoja- */
/* mas iš to paties tinklelio, kurį vaikas mato (M-07).                */
/*                                                                    */
/* Ko modelyje NĖRA: koordinačių plokštumos (ji — 4 klasė), posūkių ir */
/* judėjimo (tai `24-komandu-seka`), skaičių lentelės tvarkos (tai     */
/* `19-simto-skaiciu-lentele`). Čia daiktas nejuda — keičiasi tik tai,  */
/* KIEK ženklų jo vietą pasako.                                        */
/*                                                                    */
/* Scena surenkama iš `art.js` dalių (LL-13): art.frog / butterfly /   */
/* flower / bird / leaf / fruit — vaikas turi atpažinti tą patį        */
/* gyvūną kiekviename langelyje be užrašo skaitymo.                    */
/* ------------------------------------------------------------------ */
const TA_LETTERS = ["A", "B", "C", "D", "E", "F"];
const TA_CELL = 62;
const TA_GAP = 6;
const TA_TOP = 26;
const TA_VIEW_W = 320;

/* Figūros piešiamos tame pačiame 48 × 48 lauke, todėl langelio turinys
   nepriklauso nuo to, kurią figūrą modulis įdėjo (LL-24). Mastelis kiekvienai
   figūrai atskiras: skirtingos `art.js` dalys piešiamos skirtingo dydžio
   koordinatėse, todėl vienas bendras `s` vieną gyvūną padarytų 21 px, kitą —
   45 px tame pačiame 62 vienetų langelyje. */
const TA_FIGURES = {
  varlyte: (cx, cy) => art.frog(cx, cy + 13.5 * 0.72, 0.72),
  drugelis: (cx, cy) => art.butterfly(cx, cy + 2, 0.58),
  gelyte: (cx, cy) => art.flower(cx, cy + 2, 1.55),
  pauksciukas: (cx, cy) => art.bird(cx, cy + 17 * 0.73, 0.73),
  obuolys: (cx, cy) => art.fruit(cx, cy + 7, 1.4, 1),
};

const tinklelioAdresas = {
  mount({ stage, controls, api, config }) {
    const S = config.sentences || {};
    const L = config.labels || {};

    /* Proza — tik iš `config.sentences` (LL-42): kode nėra nė vieno
       sakinio, kurio negirdėtų balsas ir nematytų `check_audio.py`.
       Mygtuko užrašas imamas iš `config.labels` — jis netariamas, bet
       ir negali būti kode (LL-222: etiketė yra žodis, ne sakinys). */
    const line = (key) => (typeof S[key] === "string" ? S[key].trim() : "");
    const lab = (key, fallback) => {
      const v = typeof L[key] === "string" ? L[key].trim() : "";
      return v || fallback || "";
    };
    const tell = (key) => { const t = line(key); if (t) api.speak(t); };

    const clampInt = (value, lo, hi, dflt) => {
      const n = Number(value);
      if (!Number.isFinite(n)) return dflt;
      return Math.max(lo, Math.min(hi, Math.round(n)));
    };

    const cols = clampInt(config.cols, 2, TA_LETTERS.length, 4);
    const rows = clampInt(config.rows, 2, 4, 3);
    const letters = TA_LETTERS.slice(0, cols);

    /* `items` — kas sėdi kiekviename langelyje. Adresas imamas iš `cell`
       (pvz. „B1“), o ne iš masyvo eilės: modulio tekstas kalba tais
       pačiais adresais, kuriuos vaikas mato, ir jei jie išsiskyrę,
       komponentas tai pasako garsiai, o ne piešia kitą tinklelį. */
    const cellOf = (raw) => {
      const m = /^([A-F])([1-4])$/.exec(String(raw || "").trim().toUpperCase());
      if (!m) return null;
      const col = TA_LETTERS.indexOf(m[1]);
      const row = Number(m[2]) - 1;
      if (col >= cols || row >= rows) return null;
      return { col, row, addr: `${m[1]}${m[2]}` };
    };

    const items = [];
    for (const raw of Array.isArray(config.items) ? config.items : []) {
      const pos = cellOf(raw && raw.cell);
      const figure = String((raw && raw.figure) || "");
      const label = String((raw && raw.label) || "");
      if (!pos || !TA_FIGURES[figure] || !label) {
        console.error(`tinklelio-adresas: blogas įrašas ${JSON.stringify(raw)}`);
        stage.innerHTML = `<p class="sim-note" style="margin:0">${line("broken")}</p>`;
        controls.innerHTML = "";
        api.readout(line("broken"));
        return null;
      }
      items.push({ ...pos, figure, label });
    }

    const itemAt = (col, row) => items.find((it) => it.col === col && it.row === row) || null;

    /* --- būsena ------------------------------------------------------- */
    /* `letter` ir `number` — KIEK ženklų vaikas jau davė. Tai vienintelis
       modelio kintamasis; viskas kita (kiek langelių, kuris langelis)
       perskaičiuojama iš jo (LL-17: sėkmės sąlyga žiūri dabartį). */
    let letter = -1;
    let number = -1;
    let reported = false;

    const both = () => letter >= 0 && number >= 0;
    const litCount = () => (both() ? 1 : letter >= 0 ? rows : number >= 0 ? cols : 0);
    const isLit = (col, row) => (both()
      ? letter === col && number === row
      : letter >= 0 ? letter === col : number >= 0 ? number === row : false);

    /* --- scena -------------------------------------------------------- */
    const boardW = cols * TA_CELL + (cols - 1) * TA_GAP;
    const boardH = rows * TA_CELL + (rows - 1) * TA_GAP;
    const offX = (TA_VIEW_W - boardW) / 2 + 7;
    const offY = TA_TOP;
    const viewH = offY + boardH + 12;
    const cellX = (col) => offX + col * (TA_CELL + TA_GAP);
    const cellY = (row) => offY + row * (TA_CELL + TA_GAP);
    const midX = (col) => cellX(col) + TA_CELL / 2;
    const midY = (row) => cellY(row) + TA_CELL / 2;

    stage.innerHTML = `
      <div id="ta-wrap" style="width:100%;max-width:100%;min-width:0;box-sizing:border-box">
        <svg id="ta-svg" viewBox="0 0 ${TA_VIEW_W} ${viewH}" width="100%" role="img"
             style="display:block;width:100%;max-width:23rem;height:auto;margin:0 auto"></svg>
      </div>`;

    const svg = stage.querySelector("#ta-svg");
    const f = (v) => Number(v).toFixed(1);

    /* Antraštės (raidės ir skaičiai) — ne puošmena: be jų langelio
       adresas neturi iš kur kilti. Raidės viršuje, skaičiai kairėje. */
    const head = [];
    letters.forEach((ch, col) => {
      head.push(`<text x="${f(midX(col))}" y="18" text-anchor="middle"
        style="font-family:var(--font-head);font-size:17px;font-weight:900;fill:var(--ink)">${ch}</text>`);
    });
    for (let row = 0; row < rows; row += 1) {
      head.push(`<text x="${f(offX - 15)}" y="${f(midY(row) + 6)}" text-anchor="middle"
        style="font-family:var(--font-head);font-size:17px;font-weight:900;fill:var(--ink)">${row + 1}</text>`);
    }

    const cells = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        cells.push(`<rect data-cell="${col}-${row}" x="${f(cellX(col))}" y="${f(cellY(row))}"
          width="${TA_CELL}" height="${TA_CELL}" rx="12"
          style="fill:var(--paper-2);stroke:var(--line);stroke-width:2"/>`);
      }
    }

    svg.innerHTML = `${head.join("")}<g id="ta-cells">${cells.join("")}</g><g id="ta-figs"></g>`;

    const figG = svg.querySelector("#ta-figs");
    for (const it of items) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("data-fig", `${it.col}-${it.row}`);
      g.setAttribute("aria-hidden", "true");
      g.innerHTML = TA_FIGURES[it.figure](midX(it.col), midY(it.row));
      figG.appendChild(g);
    }

    const rects = [...svg.querySelectorAll("rect[data-cell]")];

    controls.innerHTML = `
      <div role="group" aria-label="Raidė — kuriame stulpelyje" id="ta-letters"
           style="display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;width:100%;min-width:0"></div>
      <div role="group" aria-label="Skaičius — kurioje eilutėje" id="ta-numbers"
           style="display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;width:100%;min-width:0"></div>
      <div style="display:flex;justify-content:center;width:100%">
        <button type="button" class="btn ghost" id="ta-reset" style="min-height:48px">${lab("again", "Iš naujo")}</button>
      </div>`;

    const lettersEl = controls.querySelector("#ta-letters");
    const numbersEl = controls.querySelector("#ta-numbers");
    const resetBtn = controls.querySelector("#ta-reset");

    /* Mygtukai — vieninteliai lietimo taikiniai. Jie sukurti iš to paties
       `cols`/`rows`, iš kurių nupieštas tinklelis, todėl mygtuko ženklas
       niekada nenurodo nieko, ko tinklelyje nėra (LL-03). */
    const BTN = "min-height:56px;min-width:56px;padding:.5rem .9rem;"
      + "font-family:var(--font-head);font-weight:900;font-size:1.15rem";
    lettersEl.innerHTML = letters.map((ch, col) => `<button type="button" class="btn secondary"
      data-letter="${col}" aria-pressed="false" aria-label="Raidė ${ch}" style="${BTN}">${ch}</button>`).join("");
    numbersEl.innerHTML = Array.from({ length: rows }, (_, row) => `<button type="button"
      class="btn secondary" data-number="${row}" aria-pressed="false"
      aria-label="Skaičius ${row + 1}" style="${BTN}">${row + 1}</button>`).join("");

    const letterBtns = [...lettersEl.querySelectorAll("button")];
    const numberBtns = [...numbersEl.querySelectorAll("button")];

    /* --- piešimas ------------------------------------------------------ */
    function paint() {
      rects.forEach((rect) => {
        const [col, row] = rect.dataset.cell.split("-").map(Number);
        const lit = isLit(col, row);
        /* Spalva nėra vienintelis informacijos nešėjas: paryškintas
           langelis turi ir storą brūkšniuotą rėmą (standartas §4.4). */
        rect.style.fill = lit ? "var(--sun)" : "var(--paper-2)";
        rect.style.stroke = lit ? "var(--ink)" : "var(--line)";
        rect.style.strokeWidth = lit ? "3.5" : "2";
        rect.style.strokeDasharray = lit ? "7 5" : "";
      });

      letterBtns.forEach((btn, i) => {
        const on = i === letter;
        btn.setAttribute("aria-pressed", String(on));
        btn.className = on ? "btn" : "btn secondary";
      });
      numberBtns.forEach((btn, i) => {
        const on = i === number;
        btn.setAttribute("aria-pressed", String(on));
        btn.className = on ? "btn" : "btn secondary";
      });

      const lit = litCount();
      const addr = both() ? `${letters[letter]}${number + 1}` : "";
      svg.setAttribute("aria-label", both()
        ? `Tinklelis ${rows} eilučių ir ${cols} stulpelių. Paryškintas vienas langelis ${addr}.`
        : `Tinklelis ${rows} eilučių ir ${cols} stulpelių. Paryškinta langelių: ${lit}.`);
      return { lit, addr };
    }

    /* --- veiksmai ------------------------------------------------------ */
    function showFixed() {
      const { lit, addr } = paint();
      if (both()) {
        const it = itemAt(letter, number);
        const text = it ? `${addr} — ${it.label}. ${line("cell")}` : `${addr}. ${line("empty")}`;
        api.readout(text);
        api.note(line(it ? "cellNote" : "emptyNote"));
        tell(it ? "cell" : "empty");
        if (!reported) {
          /* Pažanga — tik įvardijus VIENĄ langelį (visas ciklas), o ne po
             pirmo ženklo (LL-29). */
          reported = true;
          api.progress({ correct: true });
        }
        return;
      }
      if (letter >= 0) {
        api.readout(`${letters[letter]} — ${lit} ${line("lit")} ${line("letter")}`);
        api.note(line("letterNote"));
        tell("letter");
        return;
      }
      if (number >= 0) {
        api.readout(`${number + 1} — ${lit} ${line("lit")} ${line("number")}`);
        api.note(line("numberNote"));
        tell("number");
        return;
      }
      api.readout(line("start"));
      api.note(line("startNote"));
    }

    function pickLetter(col) {
      /* Nauja raidė numeta skaičių: taip vaikas pats pamato, kad vieno
         ženklo atgal nebeužtenka — vėl paryškinama visa linija. */
      letter = col;
      number = -1;
      showFixed();
    }

    function pickNumber(row) {
      number = row;
      showFixed();
    }

    function reset() {
      letter = -1;
      number = -1;
      paint();
      api.readout(line("again"));
      api.note(line("startNote"));
      tell("again");
      letterBtns[0]?.focus();
    }

    lettersEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-letter]");
      if (btn) pickLetter(Number(btn.dataset.letter));
    });
    numbersEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-number]");
      if (btn) pickNumber(Number(btn.dataset.number));
    });
    resetBtn.addEventListener("click", reset);

    /* Pradinė būsena įvardijama, o ne paliekama tyli (LL-194). */
    paint();
    api.readout(line("start"));
    api.note(line("startNote"));

    return null;
  },
};

/* ------------------------------------------------------------------ */
/* 6. Du požymiai kartu (1 klasė, matematika)                           */
/*                                                                    */
/* Viena sąvoka: DU požymiai atrenka, o ne prideda. Vaikas pažymi    */
/* spalvą ir dydį; krūva lieka ta pati (devyni daiktai), keičiasi tik */
/* tai, KIEK jų pažymėta: viena spalva — keturi, spalva IR dydis —    */
/* vienas. Todėl sakinys „liko mažiau“ yra išvestis, o ne tekstas.    */
/*                                                                    */
/* Klaidinga nuostata, kurią modelis parodo: „jei pažymėjau raudoną,  */
/* tai visi raudoni tinka“ (antras požymis lyg ir neveikia). Todėl    */
/* spalva ir dydis niekada nekeičia krūvos dydžio ir kiekvieną kartą  */
/* skaičius sumažėja matomai — tą patį skaičių vaikas perskaito      */
/* ekrane, o ne pasitiki tekstu.                                      */
/*                                                                    */
/* Skirtumas nuo `36-grupavimas-pagal-pozymi`: ten keičiamas VIENAS   */
/* požymis ir krūva PADALIJAMA į būrius (visi daiktai lieka). Čia du  */
/* požymiai veikia KARTU ir iš krūvos ATRENKAMA dalis — kita sąvoka.  */
/*                                                                    */
/* Skirtumas nuo `23-piktograma-ir-stulpelis`: ten skaičiuojama jau   */
/* sudaryta grupė. Scena surenkama iš `art.js` (LL-13): art.flatShape */
/* su užpildu, kuris čia yra pats požymis.                            */
/* ------------------------------------------------------------------ */
const DP_VIEW = 132;
const DP_COLOR = { raudona: "#e2695c", melyna: "#6d9bd8", geltona: "#f2c14e" };
const DP_ATTR = { spalva: "color", dydis: "size" };
const DP_SIZES = ["didelis", "mazas"];

const duPozymiaiPaieska = {
  mount({ stage, controls, api, config }) {
    const S = config.sentences || {};
    const L = config.labels || {};

    /* Proza — tik iš `config.sentences` (LL-42): kode nėra nė vieno
       sakinio, kurio negirdėtų balsas ir nematytų `check_audio.py`. */
    const line = (key) => (typeof S[key] === "string" ? S[key].trim() : "");
    const lab = (key, fallback) => {
      const v = typeof L[key] === "string" ? L[key].trim() : "";
      return v || fallback || "";
    };
    const tell = (key) => { const t = line(key); if (t) api.speak(t); };

    const CRITERIA = (Array.isArray(config.criteria) ? config.criteria : [])
      .filter((c) => c && DP_ATTR[c.id])
      .map((c) => ({ id: c.id, button: String(c.button || ""), values: c.values || {} }));
    const ITEMS = Array.isArray(config.items) ? config.items : [];

    const valueLabel = (crit, v) => {
      const map = crit.values || {};
      return typeof map[v] === "string" ? map[v] : "";
    };

    /* --- duomenų vientisumas ---------------------------------------- */
    /* Visus skaičius, kuriuos modelis taria, komponentas perskaičiuoja
       iš tų pačių laukelių, kuriuos vaikas mato (M-07, M-10, LL-33). */
    function integrity() {
      if (CRITERIA.length !== 2) return "modeliui reikia lygiai dviejų požymių";
      if (ITEMS.length < 6) return "per mažai daiktų krūvoje";
      for (const c of CRITERIA) {
        if (!c.button) return `požymiui „${c.id}“ trūksta mygtuko užrašo`;
        const values = Object.keys(c.values || {});
        if (values.length < 2) return `požymis „${c.id}“ turi mažiau nei dvi reikšmes`;
      }
      for (const it of ITEMS) {
        if (!it || !it.id) return "daiktas be ID";
        if (!DP_COLOR[it.color]) return `nežinoma spalva „${it && it.color}“`;
        if (!DP_SIZES.includes(it.size)) return `nežinomas dydis „${it && it.size}“`;
        for (const c of CRITERIA) {
          const v = it[DP_ATTR[c.id]];
          if (!valueLabel(c, v)) return `požymiui „${c.id}“ trūksta reikšmės „${v}“ pavadinimo`;
        }
      }
      /* Teiginys „du požymiai pažymi mažiau“ turi būti tiesa KIEKVIENAI
         porai, o ne vienai pasirinktai. Jei kuri pora nesusiaurina, modelis
         nutylių, kad kai kada antras požymis nieko neatrenka — todėl tai
         klaida, o ne tyliai kitokia eiga (LL-25, LL-37). */
      for (const a of Object.keys(CRITERIA[0].values)) {
        for (const b of Object.keys(CRITERIA[1].values)) {
          const inOne = ITEMS.filter((it) => it[DP_ATTR[CRITERIA[0].id]] === a).length;
          const inBoth = ITEMS.filter((it) => it[DP_ATTR[CRITERIA[0].id]] === a
            && it[DP_ATTR[CRITERIA[1].id]] === b).length;
          if (inBoth >= inOne || inBoth === 0) {
            return `pora „${a} + ${b}“ nesusiaurina (${inOne} → ${inBoth}) — modelis teigtų netiesą`;
          }
        }
      }
      return "";
    }

    const problem = integrity();
    if (problem) {
      console.error(`du-pozymiai-paieska: ${problem}`);
      stage.innerHTML = `<p class="sim-note" style="margin:0">${line("broken")}</p>`;
      controls.innerHTML = "";
      api.readout(line("broken"));
      return null;
    }

    stage.innerHTML = `
      <div id="dp-wrap" style="width:100%;max-width:100%;min-width:0;box-sizing:border-box">
        <div id="dp-pile" role="img"
             style="display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;align-items:center;
                    min-height:3rem;padding:.5rem;border:2px dashed var(--line);
                    border-radius:var(--r-s);background:var(--paper);box-sizing:border-box"></div>
        <p id="dp-count" style="margin:.6rem 0 0;text-align:center;font-size:var(--fs-l);font-weight:800;line-height:1.25"></p>
        <ul id="dp-found" style="margin:.5rem 0 0;padding-left:1.1rem;font-size:var(--fs-s);line-height:1.35"></ul>
      </div>`;

    controls.innerHTML = `
      <div id="dp-groups" style="display:flex;flex-direction:column;gap:.55rem;width:100%"></div>
      <button type="button" class="btn ghost" id="dp-reset" style="min-height:48px">${lab("again", "Iš naujo")}</button>`;

    const pileEl = stage.querySelector("#dp-pile");
    const countEl = stage.querySelector("#dp-count");
    const foundEl = stage.querySelector("#dp-found");
    const groupsEl = controls.querySelector("#dp-groups");
    const resetBtn = controls.querySelector("#dp-reset");

    groupsEl.innerHTML = CRITERIA.map((c) => `
      <div role="group" aria-label="${c.button}"
           style="min-width:0;border:2px solid var(--line);border-radius:var(--r-s);
                  background:var(--paper-2);padding:.45rem .5rem">
        <p style="margin:0 0 .35rem;font-size:var(--fs-s);font-weight:800;line-height:1.2">${c.button}</p>
        <div style="display:flex;flex-wrap:wrap;gap:.4rem;justify-content:center;min-width:0">${
          Object.keys(c.values || {}).map((v) => `<button type="button" class="btn secondary"
            data-crit="${c.id}" data-value="${v}" aria-pressed="false"
            style="min-height:56px;min-width:0;flex:1 1 5.5rem;padding:.4rem .4rem;line-height:1.15">${valueLabel(c, v)}</button>`).join("")
        }</div>
      </div>`).join("");

    /* Būsena: pasirinktos požymių reikšmės. `found` sąmoningai NEišvaloma
       „Iš naujo“ (LL-16, LL-20): kitaip vaikas pamiršta, kad tas pats
       daiktas jau buvo pažymėtas pagal vieną požymį, ir skaičius 4 → 1
       dingsta iki galutinio dydžio. */
    const state = { sel: {}, found: [], reported: false };

    const chosen = () => CRITERIA.filter((c) => state.sel[c.id]);
    const matches = (it) => chosen().every((c) => it[DP_ATTR[c.id]] === state.sel[c.id]);
    const count = () => (chosen().length ? ITEMS.filter(matches).length : ITEMS.length);

    function icon(it, px) {
      const s = it.size === "didelis" ? 96 : 64;
      return `<svg viewBox="0 0 ${DP_VIEW} ${DP_VIEW}" width="${px}" height="${px}" aria-hidden="true"
                   focusable="false" style="display:block;overflow:visible">${
        art.flatShape(it.shape, DP_VIEW / 2, DP_VIEW / 2, s, 4, DP_COLOR[it.color])
      }</svg>`;
    }

    function paintPile() {
      const any = chosen().length > 0;
      pileEl.innerHTML = ITEMS.map((it) => {
        const hit = any && matches(it);
        const px = any ? (hit ? 46 : 30) : 34;
        /* Žymėjimas neša ne tik spalvą: pažymėtas daiktas turi storą rėmą
           ir yra didesnis, o nepažymėtas — mažesnis ir nespalvotas
           (standartas §4.4, LL-13). */
        const box = hit
          ? "box-shadow:0 0 0 3px var(--ink);border-radius:12px;padding:2px;"
          : "filter:grayscale(1);opacity:.32;padding:2px;";
        return `<div data-item="${it.id}" style="${any ? box : "padding:2px;"}">${icon(it, px)}</div>`;
      }).join("");

      const labels = (any ? ITEMS.filter(matches) : ITEMS).map((it) => it.label || "").filter(Boolean);
      pileEl.setAttribute("aria-label",
        `${line("pile")} ${ITEMS.length}. ${line("shown")} ${labels.join(", ")}.`.replace(/\s+/g, " ").trim());
    }

    function paintCount() {
      const n = count();
      const chosenNow = chosen();
      const values = chosenNow.map((c) => valueLabel(c, state.sel[c.id])).filter(Boolean).join(", ");
      countEl.textContent = chosenNow.length
        ? `${line("marked") || "Pažymėta:"} ${n} ${line("of") || "iš"} ${ITEMS.length}`
        : "";
      countEl.setAttribute("aria-label", chosenNow.length
        ? `${values}. ${line("marked") || "Pažymėta:"} ${n} ${line("of") || "iš"} ${ITEMS.length}.`
        : line("start"));
      return { n, values };
    }

    function paintFound() {
      foundEl.innerHTML = state.found.map((t) => `<li>${t}</li>`).join("");
      foundEl.hidden = state.found.length === 0;
    }

    function paintButtons() {
      groupsEl.querySelectorAll("[data-crit]").forEach((btn) => {
        const on = state.sel[btn.dataset.crit] === btn.dataset.value;
        btn.setAttribute("aria-pressed", String(on));
        btn.className = on ? "btn" : "btn secondary";
        btn.style.minHeight = "56px";
      });
    }

    const paint = () => { paintPile(); paintCount(); paintFound(); paintButtons(); };

    function toggle(critId, value) {
      const crit = CRITERIA.find((c) => c.id === critId);
      if (!crit) return;
      const was = state.sel[critId] || "";
      state.sel[critId] = was === value ? "" : value;

      paintPile();

      const n = count();
      const chosenNow = chosen();
      const values = chosenNow.map((c) => valueLabel(c, state.sel[c.id])).filter(Boolean);
      if (chosenNow.length) {
        const entry = `${values.join(", ")} — ${n}`;
        if (!state.found.includes(entry)) state.found.push(entry);
      }
      paintFound();
      paintButtons();

      if (!chosenNow.length) {
        paintCount();
        api.readout(line("start"));
        api.note(line("startNote"));
        tell("startNote");
        return;
      }

      const prefix = chosenNow.length > 1 ? line("critsPrefix") : line("critPrefix");
      api.readout(`${prefix} ${values.join(", ")}. ${line("marked")} ${n} ${line("of")} ${ITEMS.length}.`
        .replace(/\s+/g, " ").trim());
      paintCount();

      if (chosenNow.length > 1) {
        api.note(line("fewerNote"));
        tell("fewer");
        if (!state.reported) {
          /* Pažymima DABAR: abu požymiai pasirinkti ir atranka įvykusi, o ne
             po pirmo požymio (LL-29). */
          state.reported = true;
          api.progress({ correct: true });
        }
        return;
      }
      /* Vienas požymis — dar ne atranka iš dviejų. Sakoma, ką daryti
         toliau, o ne „neteisingai“ (T3.1, T5.1). */
      const other = CRITERIA.find((c) => !state.sel[c.id]);
      const key = other && other.id === "dydis" ? "afterColor" : "afterSize";
      api.note(line(key));
      tell(key);
    }

    function reset() {
      state.sel = {};
      paint();
      api.readout(line("again"));
      api.note(line("startNote"));
      tell("again");
      const first = groupsEl.querySelector("[data-crit]");
      if (first) first.focus();
    }

    groupsEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-crit]");
      if (btn) toggle(btn.dataset.crit, btn.dataset.value);
    });
    resetBtn.addEventListener("click", reset);

    paint();
    api.readout(line("start"));
    api.note(line("startNote"));
    tell("startNote");

    return null;
  },
};

export const SIMS = {
  "erdvines-figuros": erdvinesFiguros,
  "ilgis-ir-vienetas": ilgisIrVienetas,
  "dezute-ir-kilogramas": dezuteIrKilogramas,
  "kruva-ir-buriai": kruvaIrBuriai,
  "tinklelio-adresas": tinklelioAdresas,
  "du-pozymiai-paieska": duPozymiaiPaieska,
};
