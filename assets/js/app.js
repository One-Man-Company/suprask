import { loadGrades, loadGradeIndex, loadModule, loadPath, getSim, makeSimApi } from "./registry.js";
import * as progress from "./progress.js";
import { speak, prime, bindHeaderToggle } from "./speech.js";

const collectStrings = (obj, out = []) => {
  if (typeof obj === "string") { out.push(obj); return out; }
  if (Array.isArray(obj)) { obj.forEach((v) => collectStrings(v, out)); return out; }
  if (obj && typeof obj === "object") Object.values(obj).forEach((v) => collectStrings(v, out));
  return out;
};

const app = document.getElementById("app");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const SITE_TITLE = "Suprask! — interaktyvus mokymasis";

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
  const allIds = g1.strands.flatMap((s) => s.modules.map((m) => m.id));
  const p = progress.count(allIds);

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

    <section aria-labelledby="klases-h">
      <h2 id="klases-h" class="sr-only">Klasės</h2>
      <div class="grade-strip">${strip}</div>
    </section>

    <section aria-labelledby="kryptys-h" style="margin-top:1.5rem">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:1rem;flex-wrap:wrap">
        <h2 id="kryptys-h" style="margin:0">Kryptys</h2>
        <p class="strand-meta" style="margin:0">Tavo kelias: <strong>${p.done} iš ${p.total}</strong> modulių</p>
      </div>
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

/* ------------------------------------------------------------------ */
/*  Klasė                                                              */
/* ------------------------------------------------------------------ */
async function viewGrade(grade) {
  const grades = await loadGrades();
  const meta = grades.grades.find((g) => g.grade === grade);
  if (!meta || meta.status !== "live") return comingSoon(meta);
  const g = await loadGradeIndex(grade);
  const pathDoc = await loadPath(grade);

  const allModules = g.strands.flatMap((s) => s.modules.map((m) => ({ ...m, strand: s })));
  const byId = new Map(allModules.map((m) => [m.id, m]));
  const fallbackSeq = allModules.map((m) => m.id);
  const seq = pathDoc && Array.isArray(pathDoc.sequence) && pathDoc.sequence.length ? pathDoc.sequence : fallbackSeq;
  const next = seq.map((id) => byId.get(id)).find((m) => m && !progress.isDone(m.id)) || null;
  const doneCount = allModules.filter((m) => progress.isDone(m.id)).length;

  const continueCard = next
    ? `<a class="card continue-card" href="#/modulis/${grade}/${next.strand.id}/${next.id}">
         <div>
           <span class="continue-label">Tęsk nuo čia</span>
           <strong>${esc(next.title)}</strong>
           <span class="strand-meta">${esc(next.strand.title)} · ${next.minutes || 8} min. · ${doneCount} iš ${allModules.length} atlikta</span>
         </div>
         <span class="btn">Tęsti →</span>
       </a>`
    : `<div class="card continue-card done">
         <div>
           <span class="continue-label">Kelias įveiktas</span>
           <strong>Visi ${allModules.length} moduliai atlikti 🎉</strong>
           <span class="strand-meta">Gali kartoti bet kurią temą — kartojimas padeda atsiminti.</span>
         </div>
       </div>`;

  const strands = g.strands.map((s) => {
    const done = progress.count(s.modules.map((m) => m.id));
    const mods = s.modules.map((m) => moduleRow(s, m)).join("");
    return `
      <section class="card" style="margin-top:1.5rem">
        <div style="display:flex;gap:.8rem;align-items:center;flex-wrap:wrap">
          <span style="font-size:2rem" aria-hidden="true">${s.emoji}</span>
          <div style="flex:1 1 14rem">
            <h2 style="margin:0;font-size:1.4rem">${esc(s.title)}</h2>
            <p class="strand-meta" style="margin:0">${esc(s.intro || "")}</p>
          </div>
          <span class="chip">${done.done} iš ${done.total}</span>
        </div>
        <div style="margin-top:1rem;display:grid;gap:.6rem">${mods}</div>
      </section>`;
  }).join("");

  app.innerHTML = `
    <div class="crumbs"><a href="#/">Pradžia</a> / ${grade} klasė</div>
    <h1>${grade} klasė</h1>
    <p class="lede" style="color:var(--ink-soft)">${esc(g.age || "")} · ${esc(g.note || "")}</p>
    ${continueCard}
    ${strands}
  `;
}

function moduleRow(strand, m) {
  const done = progress.isDone(m.id);
  return `
    <a class="card" style="display:flex;gap:.8rem;align-items:center;text-decoration:none;padding:.8rem 1rem;border-radius:var(--r-m)"
       href="#/modulis/${strand.grade || 1}/${strand.id}/${m.id}">
      <span aria-hidden="true" style="font-size:1.4rem">${done ? "✅" : "▶️"}</span>
      <span style="flex:1">
        <strong style="display:block">${esc(m.title)}</strong>
        <span class="strand-meta">${esc(m.subtitle || "")} · ${m.minutes || 8} min.</span>
      </span>
      <span class="chip ${done ? "mint" : ""}">${done ? "atlikta" : "bandyk"}</span>
      <span aria-hidden="true" style="font-size:1.6rem;color:var(--ink-faint)">›</span>
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

  const mods = s.modules.map((m) => `
    <a class="card" href="#/modulis/${grade}/${s.id}/${m.id}" style="text-decoration:none;display:grid;gap:.4rem">
      <div style="display:flex;justify-content:space-between;gap:.5rem;align-items:start">
        <h3 style="margin:0;font-size:1.15rem">${esc(m.title)}</h3>
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

  const outcomes = (mod.outcomes || []).map((o) => `<li><span>${esc(o)}</span></li>`).join("");
  const steps = (mod.concept && mod.concept.steps ? mod.concept.steps : []).map((s) => `<li><div>${esc(s)}</div></li>`).join("");

  app.innerHTML = `
    <div class="crumbs"><a href="#/">Pradžia</a> / <a href="#/klase/${grade}">${grade} klasė</a> /
      <a href="#/klase/${grade}/${strand.id}">${esc(strand.title)}</a></div>

    <header class="module-head">
      <p class="eyebrow">${esc(strand.title)} · ${mod.minutes || 8} min.</p>
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

    <details class="card" style="margin-top:1.5rem">
      <summary style="cursor:pointer;font-weight:800;min-height:2.2rem;display:flex;align-items:center">Ką suprasi (mokymosi rezultatai)</summary>
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

    <div style="display:flex;gap:.8rem;flex-wrap:wrap;margin-top:2rem">
      <a class="btn secondary" href="#/klase/${grade}/${strand.id}">← Atgal į temą</a>
      <a class="btn" href="#/klase/${grade}">Visos 1 klasės temos</a>
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
bindHeaderToggle(document.getElementById("sound-toggle"), document.getElementById("sound-icon"));

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
