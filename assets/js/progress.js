/**
 * Pažanga saugoma tik vartotojo naršyklėje (localStorage).
 * Nėra registracijos, nėra serverio, nėra duomenų siuntimo.
 *
 * Svarbu: modulis laikomas atliktu tada, kai kiekviena užduotis atsakyta
 * teisingai bent kartą. Klaidingi bandymai nieko neatima ir neblokuoja.
 *
 * Du pažymėjimai, ir jie nėra tas pats dalykas:
 *   `solved` / `total` — užduotys („Pasitikrink“). Tai modulio atlikimo sąlyga.
 *   `simDone`         — simuliacijos mokymosi tikslas pasiektas (`api.progress()`).
 *
 * Simuliacijos žymė viena pati modulio „atliktu“ nepadaro: užduotys lieka
 * patikra, ar vaikas suprato, o ne tik pabandė (KURINIO-STANDARTAS §5). Bet
 * žymė turi būti matoma — kitaip ji tik rašoma ir nieko nereiškia. Todėl šis
 * modulis nupiešia žymą `.sim-goal` modulio puslapyje, o tekstą ima iš tos
 * pačios būsenos, kad žyma ir būsena negalėtų išsiskirti (LL-42).
 */

const KEY = "suprask:progress:v1";

/* Abu tekstai sako, KĄ vaikas padarė ir KĄ daryti toliau — ne kaip sekasi
 * (T5.1). Antrasis pasirodo tik tada, kai atsakytos ir užduotys. */
const MARK_NEXT = "Modelis įveiktas. Atsakyk klausimus žemiau.";
const MARK_DONE = "Modelis įveiktas. Visos užduotys atsakytos.";

const empty = () => ({ modules: {}, updated: null });

export function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || !data.modules) return empty();
    return data;
  } catch {
    return empty();
  }
}

function write(data) {
  data.updated = new Date().toISOString();
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* privatus režimas */ }
  return data;
}

function slot(d, moduleId) {
  const m = d.modules[moduleId] || { seen: 0, attempts: 0, solved: [], total: 0, last: null };
  if (!Array.isArray(m.solved)) m.solved = [];
  if (typeof m.attempts !== "number") m.attempts = 0;
  if (typeof m.total !== "number") m.total = 0;
  d.modules[moduleId] = m;
  return m;
}

export function markVisited(moduleId, total = 0) {
  const d = read();
  const m = slot(d, moduleId);
  m.seen += 1;
  m.last = new Date().toISOString();
  if (total > 0) m.total = total;
  const out = write(d);
  showMark(moduleId);
  return out;
}

/**
 * @param {string} moduleId
 * @param {boolean} correct
 * @param {{index:number,total:number}} opts
 */
export function markTask(moduleId, correct, { index = null, total = 0 } = {}) {
  const d = read();
  const m = slot(d, moduleId);
  m.attempts += 1;
  m.last = new Date().toISOString();
  if (total > 0) m.total = total;
  if (correct && Number.isInteger(index) && !m.solved.includes(index)) {
    m.solved.push(index);
  } else if (correct && !Number.isInteger(index)) {
    // senas kvietimo būdas be indekso — skaičiuojame kaip atskirą teisingą
    m.solved.push(m.solved.length);
  }
  const out = write(d);
  syncMark(moduleId); // pasikeitė užduočių būsena — žymos tekstas gali keistis
  return out;
}

export function markSimDone(moduleId) {
  const d = read();
  const m = slot(d, moduleId);
  m.simDone = true;
  m.last = new Date().toISOString();
  const out = write(d);
  showMark(moduleId); // simuliacijos tikslas pasiektas — žymą rodom iš karto
  return out;
}

export function get(moduleId) {
  return read().modules[moduleId] || null;
}

export function isDone(moduleId) {
  const m = get(moduleId);
  if (!m) return false;
  if (m.total > 0) return m.solved.length >= m.total;
  return m.solved.length > 0;
}

export function count(moduleIds) {
  const d = read();
  let done = 0;
  for (const id of moduleIds) {
    const m = d.modules[id];
    if (!m) continue;
    if (m.total > 0 ? m.solved.length >= m.total : m.solved.length > 0) done += 1;
  }
  return { done, total: moduleIds.length };
}

export function reset() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  if (typeof document !== "undefined") {
    document.querySelectorAll(".sim-goal").forEach((el) => el.remove());
  }
}

/* ------------------------------------------------------------------ */
/*  Simuliacijos žymė modulio puslapyje                                */
/* ------------------------------------------------------------------ */

let shellWatch = null;

function stopWatching() {
  if (shellWatch) { shellWatch.disconnect(); shellWatch = null; }
}

/** Modulis, kurio puslapis atidarytas dabar (#/modulis/<klase>/<kryptis>/<id>). */
function currentModuleId() {
  if (typeof location === "undefined") return null;
  const parts = String(location.hash || "").replace(/^#\/?/, "").split("/").filter(Boolean);
  return parts[0] === "modulis" ? parts[3] || null : null;
}

/**
 * Sulygina žymą su būsena. Neskaito jokio kito šaltinio: tekstas kyla iš
 * `simDone` ir `isDone()`, todėl žyma negali pasakyti daugiau, nei žinoma.
 *
 * @returns {boolean} true — žymos klausimas išspręstas (nupiešta, pašalinta
 *   arba atidarytas kitas puslapis); false — modulio puslapis dar nestatytas.
 */
function syncMark(moduleId) {
  if (typeof document === "undefined") return true;
  if (currentModuleId() !== moduleId) return true;
  const shell = document.querySelector(".sim-shell");
  if (!shell) return false;

  const existing = shell.querySelector(".sim-goal");
  const saved = get(moduleId);
  if (!saved || saved.simDone !== true) {
    if (existing) existing.remove();
    return true;
  }

  const text = isDone(moduleId) ? MARK_DONE : MARK_NEXT;
  if (existing) {
    if (existing.textContent !== text) existing.textContent = text; // LL-14: keičiam tik pasikeitus būsenai
    return true;
  }
  const mark = document.createElement("p");
  mark.className = "sim-goal";
  mark.setAttribute("role", "status");
  mark.textContent = text;
  // Kortelės apačioje, po `.sim-note`: ten baigiasi simuliacija ir prasideda
  // „Pasitikrink“, todėl žyma kartoja ką tik įvykusį veiksmą savo vietoje.
  shell.appendChild(mark);
  return true;
}

/**
 * Parodo žymą dabar arba tada, kai modulio puslapis bus pastatytas.
 * `markVisited()` kviečiamas PRIEŠ `app.innerHTML`, todėl sim kortelės dar
 * nėra; jos laukiama stebint `#app` pokyčius, o ne spėliojant laiko tarpą
 * (LL-03 — komponentas neieško elemento, kurio dar nesukūrė).
 */
function showMark(moduleId) {
  if (typeof document === "undefined") return;
  stopWatching();
  if (syncMark(moduleId)) return;
  const root = document.getElementById("app") || document.body;
  if (!root || typeof MutationObserver !== "function") return;
  shellWatch = new MutationObserver(() => {
    if (syncMark(moduleId)) stopWatching();
  });
  shellWatch.observe(root, { childList: true, subtree: true });
}
