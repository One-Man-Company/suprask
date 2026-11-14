import { loadGrades, loadGradeIndex, loadModule, loadPath, getSim, makeSimApi } from "./registry.js";
import * as progress from "./progress.js";

/* Garso modulis kraunamas atskirai ir NEPRIVALOMAI.
 * Jei naršyklė blokuoja ką nors, ko jam reikia (Brave skydai, plėtiniai,
 * pasenęs kešas), puslapis vis tiek turi atsiverti — tik be garso.
 * Statinis `import` šiuo atveju sugriautų visą programą, todėl jis dinaminis.
 */
const SILENT = {
  speak() {}, prime() {}, stop() {}, toggle() {},
  isEnabled: () => false, setEnabled: () => false, bindHeaderToggle() {},
};
let speechApi = null;
function speechLoad() {
  if (!speechApi) {
    speechApi = import("./speech.js").catch((err) => {
      console.warn("Garso modulis neįkeltas — puslapis veikia be garso:", err);
      return SILENT;
    });
  }
  return speechApi;
}
const speak = (text, opts) => { speechLoad().then((m) => { try { m.speak(text, opts); } catch { /* tyliai */ } }); };
const prime = (texts) => { speechLoad().then((m) => { try { m.prime(texts); } catch { /* tyliai */ } }); };

const collectStrings = (obj, out = []) => {
  if (typeof obj === "string") { out.push(obj); return out; }
  if (Array.isArray(obj)) { obj.forEach((v) => collectStrings(v, out)); return out; }
  if (obj && typeof obj === "object") Object.values(obj).forEach((v) => collectStrings(v, out));
  return out;
};

const app = document.getElementById("app");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const SITE_TITLE = "Suprask! — interaktyvus mokymasis";

/* Kelio tvarka. `path.json` yra vienintelis tvarkos šaltinis — ir tam, kur
 * vaikas eina paspaudęs „Toliau“, ir tam, kokia eile rodomi moduliai.
 * Anksčiau sąrašai ėjo `index.json` tvarka, todėl tame pačiame puslapyje
 * buvo dvi skirtingos sekos ir numeris „4 iš 18“ nieko nesutikdavo.
 * Moduliai, kurių kelyje dar nėra (naujas), pridedami gale indekso tvarka:
 * jie lieka pasiekiami ir turi savo numerį, o ne iškrenta iš sąrašo.
 */
function pathSequence(gradeIndex, pathDoc) {
  const all = gradeIndex.strands.flatMap((s) => s.modules.map((m) => ({ ...m, strand: s })));
  const byId = new Map(all.map((m) => [m.id, m]));
  const seq = pathDoc && Array.isArray(pathDoc.sequence)
    ? pathDoc.sequence.filter((id) => byId.has(id))
    : [];
  for (const m of all) if (!seq.includes(m.id)) seq.push(m.id);
  return { all, byId, seq };
}

let cleanupSim = null;
let currentRoute = null;

/* ------------------------------------------------------------------ */
/*  Maršrutizatorius                                                   */
/* ------------------------------------------------------------------ */
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  return raw.split("/").filter(Boolean);
}

async function route() {
  const parts = parseHash();
  const key = parts.join("/");
  if (key === currentRoute) return;
  currentRoute = key;
  teardown();
  document.title = SITE_TITLE;
  app.innerHTML = `<div class="loading">Kraunama…</div>`;
  try {
    if (parts.length === 0) return viewHome();
    if (parts[0] === "apie") return viewAbout();
    if (parts[0] === "metodika") return viewMethod();
    if (parts[0] === "mokytojui") return viewTeacher();
    if (parts[0] === "klase" && parts[1]) {
      const g = Number(parts[1]);
      if (parts[2]) return viewStrand(g, parts[2]);
      return viewGrade(g);
    }
    if (parts[0] === "modulis" && parts[1] && parts[2] && parts[3]) {
      return viewModule(Number(parts[1]), parts[2], parts[3]);
    }
    return notFound();
  } catch (err) {
    app.innerHTML = `<div class="error-box"><strong>Įvyko klaida.</strong><br>${esc(err.message)}</div>`;
  }
}

function teardown() {
  if (typeof cleanupSim === "function") { try { cleanupSim(); } catch {} }
  cleanupSim = null;
}

/* ------------------------------------------------------------------ */
/*  Pradžia                                                            */
/* ------------------------------------------------------------------ */
async function viewHome() {
  const grades = await loadGrades();
  const g1 = await loadGradeIndex(1);
  const { all, byId, seq } = pathSequence(g1, await loadPath(1));
  const p = progress.count(all.map((m) => m.id));
  const nextId = seq.find((id) => !progress.isDone(id));
  const next = nextId ? byId.get(nextId) : null;

  const strip = grades.grades.map((g) => {
    if (g.status === "live") {
      return `<a class="grade-pill active" href="#/klase/${g.grade}"><span>${g.grade}</span><small>klasė</small></a>`;
    }
    return `<span class="grade-pill locked" title="Rengiama"><span>${g.grade}</span><small>netrukus</small></span>`;
  }).join("");

  const strands = g1.strands.map((s) => {
    const done = progress.count(s.modules.map((m) => m.id));
    return `
      <a class="card strand-card" href="#/klase/1/${s.id}">
        <span class="strand-emoji" aria-hidden="true">${s.emoji}</span>
        <h3>${esc(s.title)}</h3>
        <p class="strand-meta">${esc(s.intro || "")}</p>
        <p class="strand-meta"><strong>${done.done} iš ${done.total}</strong> modulių atlikta</p>
      </a>`;
  }).join("");

  app.innerHTML = `
    <section class="hero">
      <p class="eyebrow">1 klasė · 6–7 metai</p>
      <h1>Suprask, o ne įsimink.</h1>
      <p class="lede">Simuliacijos, modeliai ir žaidimai, kurie paaiškina pasaulį taip, kad vaikas pats prieitų prie atsakymo. Be registracijos, be skubėjimo, be pažymių.</p>
      <div class="hero-art" aria-hidden="true">${heroArt()}</div>
    </section>

    ${resumeCard(1, next, p)}

    <section aria-labelledby="klases-h">
      <h2 id="klases-h" class="sr-only">Klasės</h2>
      <div class="grade-strip">${strip}</div>
    </section>

    <section aria-labelledby="kryptys-h" style="margin-top:1.5rem">
      <h2 id="kryptys-h" style="margin:0">Kryptys</h2>
      <div class="grid grid-2" style="margin-top:1rem">${strands}</div>
    </section>

    <section class="card" style="margin-top:2rem">
      <h2 style="font-size:1.3rem">Kaip čia mokomasi</h2>
      <ol class="steps">
        <li><div><strong>Pamatai.</strong> Trumpas paaiškinimas — viena idėja, trys žingsniai, jokio pertekliaus.</div></li>
        <li><div><strong>Pabandai.</strong> Simuliacija, kurioje keiti, spaudi, stebi, klysti ir bandai dar kartą.</div></li>
        <li><div><strong>Patikrini.</strong> Trys–keturi klausimai, kurie parodo, ar tikrai supratai — ne ar įsiminei.</div></li>
        <li><div><strong>Pasakoji.</strong> Vienas klausimas, į kurį atsakai savais žodžiais.</div></li>
      </ol>
    </section>
  `;
}

/* „Tęsk nuo čia“ — tas pats veiksmas pradžioje ir klasės puslapyje.
 * Pradžioje jis sutrumpina kelią iki mokymosi vienu paspaudimu: anksčiau
 * reikėjo pirmiau rasti ir atsidaryti klasę. Kai nieko neatlikta, užrašas
 * sako „Pradėk nuo čia“ — pirmą kartą atėjusiam vaikui „tęsk“ būtų netiesa.
 */
function resumeCard(grade, next, { done = 0, total = 0 } = {}) {
  if (!next) {
    return `<div class="card continue-card done">
      <div>
        <span class="continue-label">Kelias įveiktas</span>
        <strong>Visi ${total} moduliai atlikti 🎉</strong>
        <span class="strand-meta">Gali kartoti bet kurią temą — kartojimas padeda atsiminti.</span>
      </div>
    </div>`;
  }
  const started = done > 0;
  return `<a class="card continue-card" href="#/modulis/${grade}/${next.strand.id}/${next.id}">
      <div>
        <span class="continue-label">${started ? "Tęsk nuo čia" : "Pradėk nuo čia"}</span>
        <strong>${esc(next.title)}</strong>
        <span class="strand-meta"><span>${esc(next.strand.title)}</span> <span class="nowrap">· ${next.minutes || 8} min.</span> · ${done} iš ${total} atlikta</span>
      </div>
      <span class="btn">${started ? "Tęsti →" : "Pradėti →"}</span>
    </a>`;
}

/* ------------------------------------------------------------------ */
/*  Klasė                                                              */
/* ------------------------------------------------------------------ */
async function viewGrade(grade) {
  const grades = await loadGrades();
  const meta = grades.grades.find((g) => g.grade === grade);
  if (!meta || meta.status !== "live") return comingSoon(meta);
  const g = await loadGradeIndex(grade);
  const { all, byId, seq } = pathSequence(g, await loadPath(grade));

  const nextId = seq.find((id) => !progress.isDone(id));
  const next = nextId ? byId.get(nextId) : null;
  const doneCount = all.filter((m) => progress.isDone(m.id)).length;
  const continueCard = resumeCard(grade, next, { done: doneCount, total: all.length });

  /* Vienas sąrašas — gryna kelio eilė.
   * Anksčiau moduliai buvo skirstomi į krypčių korteles, o rikiuojami tik
   * kortelės viduje. Tai eilės nepakeitė: krypties viduje kelias ir indeksas
   * sutampa, todėl numeriai puslapyje bėgo 1, 2, 5, 3, 6, 8, 9, 10, 12… —
   * trys skirtingos vietos viename sąraše. Dabar seka viena, o kryptis
   * pažymima tik ten, kur ji pasikeičia, kad vaikas neprarastų konteksto.
   */
  let lastStrand = null;
  const steps = seq.map((id, i) => {
    const m = byId.get(id);
    const s = m.strand;
    const label = s.id === lastStrand
      ? ""
      : `<p class="path-strand"><span aria-hidden="true">${esc(s.emoji || "")}</span> ${esc(s.title)}</p>`;
    lastStrand = s.id;
    return label + moduleRow(s, m, i + 1, seq.length, {
      current: id === nextId,
      started: doneCount > 0,
    });
  }).join("");

  /* Kryptys lieka kaip atskiras įėjimas (pvz., mokytojui reikia tik
   * matematikos), bet jos nebekartoja modulių eilių — tik pažangą. */
  const strands = g.strands.map((s) => {
    const done = progress.count(s.modules.map((m) => m.id));
    return `
      <a class="card strand-card" href="#/klase/${grade}/${s.id}">
        <span class="strand-emoji" aria-hidden="true">${esc(s.emoji || "")}</span>
        <h3>${esc(s.title)}</h3>
        <p class="strand-meta">${esc(s.intro || "")}</p>
        <p class="strand-meta"><strong>${done.done} iš ${done.total}</strong> modulių atlikta</p>
      </a>`;
  }).join("");

  app.innerHTML = `
    <div class="crumbs"><a href="#/">Pradžia</a> / ${grade} klasė</div>
    <h1>${grade} klasė</h1>
    <p class="lede" style="color:var(--ink-soft)">${esc(g.age || "")} · ${esc(g.note || "")}</p>
    ${continueCard}

    <section aria-labelledby="kelias-h" style="margin-top:1.5rem">
      <h2 id="kelias-h" style="font-size:1.3rem">Mokymosi kelias</h2>
      <p class="strand-meta" style="margin:.2rem 0 .6rem">Eik iš viršaus į apačią. Skaičius rodo tą pačią vietą kaip „Kitas žingsnis“ modulio apačioje.</p>
      <div class="path-list">${steps}</div>
    </section>

    <section aria-labelledby="kryptys-h" style="margin-top:2rem">
      <h2 id="kryptys-h" style="font-size:1.3rem">Kryptys</h2>
      <div class="grid grid-2" style="margin-top:1rem">${strands}</div>
    </section>
  `;
}

/* Eilutėje — to paties kelio numeris kaip modulio puslapyje („Kitas žingsnis ·
 * N iš 19“). Skaičius yra tas pats abiejuose puslapiuose, todėl vaikas gali
 * atpažinti, kur yra, o ne spėlioti, kuri tvarka galioja.
 *
 * Žymos rodomos TIK ten, kur jos ką nors sako (2026-11-14, paleidimas #286):
 *   „atlikta“ — modulis baigtas (vienintelė busena, kurios vaikas negali
 *               atpažinti iš nieko kito);
 *   „tęsk“ / „pradėk“ — VIENA vieta, į kurią veda „Tęsk nuo čia“ kortelė
 *               viršuje. Anksčiau sąraše buvo 39 vienodos „bandyk“ žymos, t. y.
 *               žyma ant kiekvienos eilutės, kuri nieko neskiria, ir telefone
 *               ji kiekvienai eilutei pridėdavo trečią eilutę (matuota
 *               @390 px: eilutė 153 px → 116 px, sąrašas 7062 → 5614 px).
 *               Ne žymė, o numeris ir pavadinimas pasako, kad modulis dar
 *               neatliktas.
 */
function moduleRow(strand, m, step = 0, stepTotal = 0, state = {}) {
  const done = progress.isDone(m.id);
  const current = !done && state.current === true;
  const chip = done
    ? `<span class="chip mint">atlikta</span>`
    : current
      ? `<span class="chip">${state.started ? "tęsk" : "pradėk"}</span>`
      : "";
  return `
    <a class="card mod-row${current ? " is-current" : ""}"${current ? ' aria-current="step"' : ""}
       href="#/modulis/${strand.grade || 1}/${strand.id}/${m.id}">
      ${step ? `<span class="step-badge${done ? " done" : ""}${current ? " current" : ""}"><span class="sr-only">Žingsnis </span>${step}<span class="sr-only"> iš ${stepTotal}</span></span>` : ""}
      <span class="mod-row-body">
        <strong>${esc(m.title)}</strong>
        <span class="strand-meta"><span>${esc(m.subtitle || "")}</span> <span class="nowrap">· ${m.minutes || 8} min.</span></span>
      </span>
      ${chip}
      <span class="mod-row-go" aria-hidden="true">›</span>
    </a>`;
}

function comingSoon(meta) {
  app.innerHTML = `
    <div class="crumbs"><a href="#/">Pradžia</a></div>
    <h1>${meta ? meta.grade : ""} klasė — rengiama</h1>
    <div class="card">
      <p>Šiuo metu platformoje pilnai parengta <strong>1 klasė</strong>. Kitos klasės kuriamos nuosekliai: kiekvienai klasei rengiamas atskiras turinio ir metodų rinkinys, atitinkantis to amžiaus vaiko galimybes ir oficialią programą.</p>
      <p class="strand-meta">Norite prisidėti? Turinys atviras — žr. <a href="#/mokytojui">Mokytojui ir tėvams</a>.</p>
      <a class="btn" href="#/klase/1">Atidaryti 1 klasę</a>
    </div>`;
}

/* ------------------------------------------------------------------ */
/*  Kryptis                                                            */
/* ------------------------------------------------------------------ */
async function viewStrand(grade, strandId) {
  const g = await loadGradeIndex(grade);
  const s = g.strands.find((x) => x.id === strandId);
  if (!s) return notFound();
  const { seq } = pathSequence(g, await loadPath(grade));

  // Krypties sąrašas laikosi tos pačios kelio eilės kaip klasės puslapis —
  // kitaip ta pati kryptis atrodytų vis kitaip, priklausomai nuo įėjimo.
  const mods = s.modules.slice().sort((a, b) => seq.indexOf(a.id) - seq.indexOf(b.id)).map((m) => `
    <a class="card" href="#/modulis/${grade}/${s.id}/${m.id}" style="text-decoration:none;display:grid;gap:.4rem">
      <div style="display:flex;justify-content:space-between;gap:.5rem;align-items:start">
        <h3 style="margin:0;font-size:1.15rem;min-width:0;overflow-wrap:anywhere">${esc(m.title)}</h3>
        <span class="chip ${progress.isDone(m.id) ? "mint" : ""}">${progress.isDone(m.id) ? "atlikta" : `${m.minutes || 8} min.`}</span>
      </div>
      <p class="strand-meta" style="margin:0">${esc(m.subtitle || "")}</p>
    </a>`).join("");

  app.innerHTML = `
    <div class="crumbs"><a href="#/">Pradžia</a> / <a href="#/klase/${grade}">${grade} klasė</a> / ${esc(s.title)}</div>
    <h1><span aria-hidden="true">${s.emoji}</span> ${esc(s.title)}</h1>
    <p class="lede" style="color:var(--ink-soft)">${esc(s.intro || "")}</p>
    <div class="grid grid-2" style="margin-top:1.5rem">${mods}</div>
  `;
}

/* ------------------------------------------------------------------ */
/*  Modulis                                                            */
/* ------------------------------------------------------------------ */
async function viewModule(grade, strandId, moduleId) {
  const g = await loadGradeIndex(grade);
  const strand = g.strands.find((x) => x.id === strandId);
  const entry = strand && strand.modules.find((m) => m.id === moduleId);
  if (!entry) return notFound();

  const mod = await loadModule(entry.file);
  document.title = `${mod.title} — Suprask!`;
  const tasks = Array.isArray(mod.tasks) ? mod.tasks : [];
  progress.markVisited(mod.id, tasks.length);

  /* Kur toliau — imama iš `path.json`, kad vaikas eitų tuo pačiu keliu,
   * kurį rodo „Tęsk nuo čia" ir numeriai klasės puslapyje. Sąrašo tvarka ir
   * „Kitas žingsnis“ naudoja tą patį skaičiavimą (`pathSequence`), todėl
   * „žingsnis 7“ reiškia tą patį modulį abiejuose puslapiuose.
   */
  const { byId, seq } = pathSequence(g, await loadPath(grade));
  const pos = seq.indexOf(moduleId);
  const next = pos >= 0 && pos + 1 < seq.length ? byId.get(seq[pos + 1]) : null;

  const nextCard = next
    ? `<a class="card continue-card" data-next-module href="#/modulis/${grade}/${next.strand.id}/${next.id}">
         <div>
           <span class="continue-label">Kitas žingsnis · ${pos + 2} iš ${seq.length}</span>
           <strong>${esc(next.title)}</strong>
           <span class="strand-meta"><span>${esc(next.strand.title)}</span> <span class="nowrap">· ${next.minutes || 8} min.</span></span>
         </div>
         <span class="btn">Toliau →</span>
       </a>`
    : `<div class="card continue-card done">
         <div>
           <span class="continue-label">Kelio pabaiga</span>
           <strong>Tai paskutinis žingsnis kelyje</strong>
           <span class="strand-meta">Gali kartoti bet kurią temą — kartojimas padeda atsiminti.</span>
         </div>
         <a class="btn" href="#/klase/${grade}">Į temų sąrašą</a>
       </div>`;

  const outcomes = (mod.outcomes || []).map((o) => `<li><span>${esc(o)}</span></li>`).join("");
  const steps = (mod.concept && mod.concept.steps ? mod.concept.steps : []).map((s) => `<li><div>${esc(s)}</div></li>`).join("");

  app.innerHTML = `
    <div class="crumbs"><a href="#/">Pradžia</a> / <a href="#/klase/${grade}">${grade} klasė</a> /
      <a href="#/klase/${grade}/${strand.id}">${esc(strand.title)}</a></div>

    <header class="module-head">
      <p class="eyebrow"><span>${esc(strand.title)}</span><span class="dot" aria-hidden="true">·</span><span class="nowrap">${mod.minutes || 8} min.</span></p>
      <h1>${esc(mod.title)}</h1>
      <p class="lede" style="color:var(--ink-soft)">${esc(mod.subtitle || "")}</p>
      ${mod.concept && mod.concept.big_idea ? `<p class="big-idea">${esc(mod.concept.big_idea)}</p>` : ""}
    </header>

    ${mod.sim ? `
    <section class="sim-shell" aria-label="Interaktyvi simuliacija">
      <div class="eyebrow" style="text-align:center">Pabandyk pats</div>
      <div class="sim-readout" id="sim-readout" aria-live="polite"></div>
      <div class="sim-stage" id="sim-stage"></div>
      <div class="sim-controls" id="sim-controls"></div>
      <p class="sim-note" id="sim-note"></p>
    </section>` : ""}

    <section class="card" style="margin-top:1.2rem">
      <h2 style="font-size:1.2rem">${esc((mod.concept && mod.concept.title) || "Kaip tai veikia")}</h2>
      <ol class="steps">${steps}</ol>
      ${mod.concept && mod.concept.example ? `<p style="margin:1rem 0 0;padding:.8rem 1rem;border-left:4px solid var(--sun);background:color-mix(in srgb,var(--sun) 10%, var(--paper-2));border-radius:var(--r-s)">${esc(mod.concept.example)}</p>` : ""}
    </section>

    <section style="margin-top:1.5rem">
      <h2 style="font-size:1.3rem">Pasitikrink</h2>
      <div id="tasks"></div>
    </section>

    ${mod.reflect ? `
    <section class="card" style="margin-top:1.5rem">
      <h2 style="font-size:1.15rem">Pagalvok ir pasakyk</h2>
      <p style="margin:0">${esc(mod.reflect)}</p>
      <p class="strand-meta" style="margin:.6rem 0 0">Atsakyk garsiai savais žodžiais — taip žinios tampa tavo.</p>
    </section>` : ""}

    ${nextCard}

    <details class="card" style="margin-top:1.5rem">
      <summary>Ką suprasi (mokymosi rezultatai)</summary>
      <ul class="outcomes" style="margin-top:.8rem">${outcomes}</ul>
    </details>

    <details class="teacher">
      <summary>Mokytojui ir tėvams</summary>
      <div style="color:var(--ink-soft);font-size:var(--fs-s)">
        ${mod.teacher ? `
          ${mod.teacher.goal ? `<p><strong>Tikslas.</strong> ${esc(mod.teacher.goal)}</p>` : ""}
          ${mod.teacher.prompt ? `<p><strong>Klausimas vaikui.</strong> ${esc(mod.teacher.prompt)}</p>` : ""}
          ${mod.teacher.offline ? `<p><strong>Be ekrano.</strong> ${esc(mod.teacher.offline)}</p>` : ""}
          ${Array.isArray(mod.teacher.misconceptions) && mod.teacher.misconceptions.length
            ? `<p><strong>Dažnos klaidos.</strong></p><ul>${mod.teacher.misconceptions.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
        ` : "<p>Papildoma medžiaga ruošiama.</p>"}
        ${Array.isArray(mod.sources) && mod.sources.length ? `<p><strong>Šaltiniai.</strong> ${mod.sources.map((x) => esc(x)).join("; ")}</p>` : ""}
        ${Array.isArray(mod.svietimas1) && mod.svietimas1.length ? `<p><strong>Švietimas #1 sąsaja.</strong> ${mod.svietimas1.map((x) => esc(x)).join(", ")}</p>` : ""}
      </div>
    </details>

    <div class="module-foot">
      <a class="btn secondary" href="#/klase/${grade}/${strand.id}">← ${esc(strand.title)}</a>
    </div>
  `;

  mountSim(mod);
  mountTasks(mod);
}

function mountSim(mod) {
  const stage = document.getElementById("sim-stage");
  const controls = document.getElementById("sim-controls");
  const readout = document.getElementById("sim-readout");
  const note = document.getElementById("sim-note");
  if (!stage || !mod.sim) return;

  const component = getSim(mod.sim.component);
  if (!component) {
    stage.innerHTML = `<p class="error-box">Simuliacija „${esc(mod.sim.component)}“ dar neįdiegta.</p>`;
    return;
  }

  const api = makeSimApi({
    controls,
    speak,
    readout,
    note,
    moduleId: mod.id,
    onProgress: () => progress.markSimDone(mod.id),
  });

  try {
    const result = component.mount({ stage, controls, api, config: mod.sim.config || {} });
    if (typeof result === "function") cleanupSim = result;
    else if (result && typeof result.destroy === "function") cleanupSim = () => result.destroy();
    // Įkeliam garsą iš anksto, kad pirmas paspaudimas negrotų tuščiai.
    prime(collectStrings(mod.sim.config || {}).filter((s) => s.length <= 120));
  } catch (err) {
    stage.innerHTML = `<p class="error-box">Simuliacijos klaida: ${esc(err.message)}</p>`;
  }
}

function mountTasks(mod) {
  const host = document.getElementById("tasks");
  const tasks = Array.isArray(mod.tasks) ? mod.tasks : [];
  if (!host || !tasks.length) { if (host) host.innerHTML = "<p class='strand-meta'>Užduotys ruošiamos.</p>"; return; }

  host.innerHTML = tasks.map((t, i) => `
    <div class="task" data-task="${i}">
      <div class="task-q"><span class="task-num">${i + 1}.</span><span>${esc(t.q)}</span></div>
      <div class="choices">
        ${t.options.map((o, j) => `<button class="choice" data-i="${i}" data-j="${j}">${esc(o)}</button>`).join("")}
      </div>
      <p class="task-feedback" aria-live="polite"></p>
    </div>`).join("");

  host.querySelectorAll(".choice").forEach((btn) => {
    btn.addEventListener("click", () => {
      const task = tasks[Number(btn.dataset.i)];
      const j = Number(btn.dataset.j);
      const wrap = btn.closest(".task");
      const fb = wrap.querySelector(".task-feedback");
      const correct = j === task.answer;

      if (correct) {
        wrap.querySelectorAll(".choice").forEach((b) => { b.disabled = true; b.classList.remove("wrong"); });
        btn.classList.add("correct");
        fb.className = "task-feedback ok";
        fb.textContent = task.why ? `Teisingai! ${task.why}` : "Teisingai! Puiku, kad pabandei.";
        progress.markTask(mod.id, true, { index: Number(btn.dataset.i), total: tasks.length });
      } else {
        btn.classList.add("wrong");
        btn.disabled = true;
        fb.className = "task-feedback try";
        fb.textContent = task.hint || "Ne visai. Pagalvok dar ir pabandyk kitą atsakymą — klysti yra dalis mokymosi.";
        progress.markTask(mod.id, false, { index: Number(btn.dataset.i), total: tasks.length });
      }
    });
  });
}

/* ------------------------------------------------------------------ */
/*  Statiniai puslapiai                                                */
/* ------------------------------------------------------------------ */
function viewAbout() {
  app.innerHTML = `
    <div class="crumbs"><a href="#/">Pradžia</a> / Apie</div>
    <h1>Apie Suprask!</h1>
    <div class="card stack">
      <p><strong>Suprask!</strong> — nemokama, atvira, interaktyvi vizualinio mokymosi platforma Lietuvos mokiniams nuo 1 iki 12 klasės. Jos tikslas paprastas: kad vaikas ne įsimintų taisyklę, o suprastų, kodėl ji veikia.</p>
      <p>Platforma remiasi oficialiomis Lietuvos bendrosiomis ugdymo programomis ir „Švietimo kelrodžio 2035“ (Švietimas #1) dešimties žingsnių kryptimi: mažiau temų, daugiau gylio; aiškūs mokymosi rezultatai; pagalba laiku; augimo mąstysena.</p>
      <p>Nereikia registracijos, nereikia el. pašto, nerenkami jokie duomenys. Pažanga saugoma tik tavo naršyklėje.</p>
      <p>Turinys platinamas pagal CC BY-SA 4.0, kodas — MIT licencija. Projektą kuria ir prižiūri atvira bendruomenė bei automatizuoti agentai, kurie nuolat tikrina, tyrinėja ir papildo medžiagą.</p>
      <p><strong>Apie balsą.</strong> Žodžius taria mašininis lietuviškas balsas, sugeneruotas iš Vilniaus universiteto LIEPA studijinio korpuso (balsas <em>lt_LT-reginute1</em>, autorius Robertas Tarasevičius, CC BY 4.0). Kirtis imamas iš 189 262 žodžių formų kirčio žodyno, o ne spėliojamas — lietuvių kalboje kirtis keičia žodžio reikšmę. Visi garso įrašai yra mašininiai, ne žmogaus balso įrašai.</p>
      <p class="strand-meta">Pradėta 2026 m. lapkritį. Pirmoji pilna klasė — 1-oji.</p>
    </div>`;
}

function viewMethod() {
  app.innerHTML = `
    <div class="crumbs"><a href="#/">Pradžia</a> / Metodika</div>
    <h1>Kaip kuriamas turinys</h1>
    <div class="card stack">
      <p>Kiekvienas modulis atsiranda pagal tą patį šešių žingsnių šabloną, pagrįstą mokymosi mokslų tyrimais:</p>
      <ol class="steps">
        <li><div><strong>Viena didelė idėja.</strong> Modulyje aiškinama viena sąvoka, ne penkios.</div></li>
        <li><div><strong>Konkretu prieš abstraktu.</strong> Pradedama nuo daikto, kurį galima paliesti ar pamatyti, tada pereinama prie simbolio.</div></li>
        <li><div><strong>Veiksmas, ne animacija.</strong> Vaikas pats keičia parametrus ir mato pasekmes — tai, ką daro, o ne tai, ką žiūri.</div></li>
        <li><div><strong>Momentinis, paaiškinantis grįžtamasis ryšys.</strong> Klaida ne baudžiama — ji parodo, ką verta apžiūrėti iš naujo.</div></li>
        <li><div><strong>Perkėlimas.</strong> Užduotys tikrina supratimą naujoje situacijoje, ne įsimintą formuluotę.</div></li>
        <li><div><strong>Įskaitymas.</strong> Vaikas pasakoja savais žodžiais — mokytojui tai geriausias supratimo rodiklis.</div></li>
      </ol>
      <p class="strand-meta">Išsamios gairės: <a href="https://github.com/One-Man-Company/suprask/blob/main/docs/SVIETIMAS-1-GAIRES.md">Švietimas #1 gairės</a> ir <a href="https://github.com/One-Man-Company/suprask/blob/main/docs/KURINIO-STANDARTAS.md">kurinio standartas</a>.</p>
    </div>`;
}

function viewTeacher() {
  app.innerHTML = `
    <div class="crumbs"><a href="#/">Pradžia</a> / Mokytojui ir tėvams</div>
    <h1>Mokytojui ir tėvams</h1>
    <div class="card stack">
      <p><strong>Kaip naudoti pamokoje.</strong> Vienas modulis — 8–12 minučių: 2 min. pokalbis prie paveikslo, 4–5 min. simuliacija poromis, 3 min. užduotys, 2 min. pasakojimas savais žodžiais.</p>
      <p><strong>Ko platforma nepadarys.</strong> Ji nepakeis mokytojo aiškinimo, nevertins rašto darbų ir nespres už vaiką. Ji skirta tam, kad sunkiausias dalykas — pirmas susidūrimas su sąvoka — būtų vaizdus ir saugus klysti.</p>
      <p><strong>Be ekrano.</strong> Kiekviename modulyje yra „Be ekrano“ užduotis ta pačia tema, kurią galima atlikti su daiktais klasėje ar namuose.</p>
      <p><strong>Duomenų nėra.</strong> Neregistruojama, nesekama, nerenkama. Pažymėjimai lieka vaiko naršyklėje.</p>
      <p><strong>Pritaikymas.</strong> Padidinkite teksto dydį naršyklės nustatymuose; visi mygtukai ≥ 48 px, veikia klaviatūra, yra garso įjungimo/išjungimo mygtukas.</p>
      <p class="strand-meta">Turinio autoriams: žr. <a href="https://github.com/One-Man-Company/suprask/blob/main/docs/KURINIO-STANDARTAS.md">kurinio standartą</a> — JSON schema, pedagoginė kontrolė, vertinimo kriterijai.</p>
    </div>`;
}

function notFound() {
  app.innerHTML = `
    <div class="crumbs"><a href="#/">Pradžia</a></div>
    <h1>Nerasta</h1>
    <p>Šis puslapis neegzistuoja arba dar nesukurtas.</p>
    <a class="btn" href="#/">Į pradžią</a>`;
}

/* ------------------------------------------------------------------ */
function heroArt() {
  return `<svg viewBox="0 0 240 240" role="presentation">
    <circle cx="120" cy="120" r="104" fill="none" stroke="#e7ddcd" stroke-width="3" stroke-dasharray="6 10"/>
    <circle cx="120" cy="120" r="78" fill="#ffc94d" opacity=".35"/>
    <g fill="none" stroke="#23201c" stroke-width="5" stroke-linecap="round">
      <path d="M60 150 L110 100 L150 130 L186 84"/>
    </g>
    <circle cx="60" cy="150" r="10" fill="#ff8a3d"/>
    <circle cx="110" cy="100" r="10" fill="#4fc3a1"/>
    <circle cx="150" cy="130" r="10" fill="#5aa9e6"/>
    <circle cx="186" cy="84" r="12" fill="#f2708a"/>
    <text x="120" y="205" text-anchor="middle" font-family="system-ui" font-size="15" font-weight="700" fill="#8b8175">bandai · klysti · supranti</text>
  </svg>`;
}

/* ------------------------------------------------------------------ */
speechLoad().then((m) => m.bindHeaderToggle(document.getElementById("sound-toggle"), document.getElementById("sound-icon")));

/* Jei naršyklė blokuoja garsą, pasakome tai žodžiais — o ne tyla. */
let soundHintShown = false;
window.addEventListener("suprask:sound-blocked", () => {
  if (soundHintShown) return;
  soundHintShown = true;
  const hint = document.createElement("div");
  hint.className = "sound-hint";
  hint.setAttribute("role", "status");
  hint.textContent = "Garsas neįsijungė. Paliesk ekraną dar kartą.";
  document.body.appendChild(hint);
  setTimeout(() => hint.classList.add("sound-hint--out"), 5000);
  setTimeout(() => hint.remove(), 5600);
});

/* ---------- apsauga nuo amžino „Kraunama…" ----------
 * Jei naršyklė blokuoja API (Brave Shields: localStorage, crypto) arba
 * scenarijus nulūžta, vaikas neturi matyti tuščio ekrano.
 */
function showFatal(message) {
  if (!app) return;
  app.innerHTML = `
    <div class="card" style="max-width:36rem;margin:2rem auto">
      <h1 style="font-size:1.4rem">Nepavyko įkelti</h1>
      <p>${esc(message)}</p>
      <p class="strand-meta">Pabandyk atnaujinti puslapį. Jei naudoji Brave su įjungtais skydais,
      leisk šiam puslapiui veikti (skydų ikona → „Shields down for this site").</p>
      <button class="btn" onclick="location.reload()">Atnaujinti</button>
    </div>`;
}

window.addEventListener("error", (e) => {
  if (app.querySelector(".loading")) showFatal("Įvyko scenarijaus klaida. " + (e.message || ""));
}, { once: true });

window.addEventListener("unhandledrejection", () => {
  if (app.querySelector(".loading")) showFatal("Įvyko klaida įkeliant turinį.");
}, { once: true });

setTimeout(() => {
  if (app.querySelector(".loading")) showFatal("Turinys neįsikėlė per 8 sekundes.");
}, 8000);

window.addEventListener("hashchange", route);
route();
