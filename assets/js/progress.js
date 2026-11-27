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
 *
 * Pervadinus modulį, jo ID pasikeičia, o pažanga saugoma pagal ID. Todėl
 * skaitymo kelyje senas ID keičiamas dabartiniu pagal `index.json` lauką
 * `renamed_from` (žr. `registry.js:renameMap` ir KURINIO-STANDARTAS §7.1) —
 * kitaip vaikas savo darbo nebeatpažintų.
 */

import { renameMap } from "./registry.js";

const KEY = "suprask:progress:v1";

/* Abu tekstai sako, KĄ vaikas padarė ir KĄ daryti toliau — ne kaip sekasi
 * (T5.1). Antrasis pasirodo tik tada, kai atsakytos ir užduotys. */
const MARK_NEXT = "Modelis įveiktas. Atsakyk klausimus žemiau.";
const MARK_DONE = "Modelis įveiktas. Visos užduotys atsakytos.";

const empty = () => ({ modules: {}, updated: null });

/* ------------------------------------------------------------------ */
/*  Pervadinti moduliai: senas ID → dabartinis                          */
/* ------------------------------------------------------------------ */
/* Pervadinimas yra turinio sprendimas, bet pažanga saugoma pagal ID, todėl
 * be šio žemėlapio jis nutrina vaiko darbą: modulis atsiverčia kaip nebandytas,
 * nors vaikas jį jau buvo įveikęs (gairės T3.5 ir T3.6).
 *
 * Žemėlapio šaltinis — tas pats `index.json`, kurį svetainė jau įsikėlė
 * (`renamed_from`), o ne `scripts/known_renames.json`: tas failas yra įrankių
 * duomenys, naršyklė jo neskaito, ir būtent todėl žyma liko našlaite.
 *
 * Skaitymas lieka sinchroninis. Kol klasės indeksas neįkeltas, žemėlapis
 * tuščias ir senas įrašas NEPAKEIČIAMAS — migracija įvyksta vėliau, pirmą
 * kartą perskaičius jau su indeksu, todėl duomenys neprarandami.
 */
function aliases() {
  try { return renameMap(); } catch { return new Map(); }
}

/** Grandinė A→B→C sprendžiama iki galo; ciklas (klaida turinyje) nesukelia amžino ciklo. */
function canonical(moduleId) {
  const map = aliases();
  let id = moduleId;
  for (let hop = 0; hop < 8; hop += 1) {
    const next = map.get(id);
    if (!next || next === id) break;
    id = next;
  }
  return id;
}

/** Vienodas įrašo skaitymas: trūkstami laukai nepakiša `undefined` aritmetikos.
 *
 * Data vieną kartą keitė formą: iki #343 (2026-11-03 13:43–13:53, `0f35296`)
 * įrašas buvo `{seen, tasks, tasksCorrect, last}` — `tasks` buvo bandymų
 * skaičius, `tasksCorrect` — teisingų skaičius, o `solved` masyvo nebuvo.
 * Toks įrašas šiandien vis dar guli vaikų naršyklėse, todėl jo forma
 * **atvaizduojama**, ne atmetama (T3.5: vaikas nepraranda darbo):
 * `total = tasks`, `solved = [0 … tasksCorrect-1]`. Tada `tasksCorrect >= tasks`
 * lieka „atlikta“, o `tasksCorrect < tasks` — ne, kaip ir senoje `isDone()`.
 *
 * LL-209: ši funkcija — vienas šaltinis visiems skaitytojams, o ne rašymo
 * šalutinis kelias. Kas jos nekviečia, tas mato `undefined`.
 */
const tally = (value) => (Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0);

function record(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  // `tasks`/`tasksCorrect` skaitomi tik tada, kai naujos formos lauko nėra:
  // įrašas, turintis ir `solved`, ir senus laukus, yra jau perkeltas.
  const legacy = !Array.isArray(value.solved) && !Number.isFinite(value.total);
  const total = Number.isFinite(value.total) ? tally(value.total) : tally(value.tasks);
  const seen = Number.isFinite(value.seen) ? value.seen : 0;
  const attempts = Number.isFinite(value.attempts)
    ? value.attempts
    : (legacy ? tally(value.tasks) : 0);
  const out = {
    seen,
    attempts,
    total,
    solved: Array.isArray(value.solved)
      ? value.solved.filter(Number.isInteger)
      : legacy
        ? Array.from({ length: Math.min(tally(value.tasksCorrect), total) }, (_, i) => i)
        : [],
    last: typeof value.last === "string" ? value.last : null,
  };
  if (value.simDone === true) out.simDone = true;
  return out;
}

/**
 * Sujungia seno ID įrašą su dabartiniu. Abu įrašai yra to paties vaiko darbas
 * tame pačiame modulyje, todėl imamas didesnis skaičius, o ne suma: kitaip
 * vienas pervadinimas padvigubintų apsilankymus ir bandymus.
 */
function mergeOld(oldValue, curValue) {
  const a = record(oldValue);
  const b = record(curValue);
  if (!a) return b;
  if (!b) return a;
  const out = {
    seen: Math.max(a.seen, b.seen),
    attempts: Math.max(a.attempts, b.attempts),
    total: Math.max(a.total, b.total),
    solved: [...new Set([...a.solved, ...b.solved])].sort((x, y) => x - y),
    last: (a.last || "") > (b.last || "") ? a.last : b.last,
  };
  if (a.simDone || b.simDone) out.simDone = true;
  return out;
}

/**
 * Perrašo seno ID įrašus dabartiniais raktais. Kviečiama vieną kartą per
 * `read()`: po migracijos seno rakto nebelieka, todėl kitas skaitymas nieko
 * nekeičia ir `updated` nesisuka kiekvieną kartą.
 * @returns {boolean} true — buvo ką perkelti (reikia įrašyti atgal).
 */
function migrate(d) {
  const map = aliases();
  if (!map.size || !d.modules) return false;
  let moved = false;
  for (const oldId of [...map.keys()]) {
    if (!d.modules[oldId]) continue;
    const toId = canonical(oldId);
    if (toId === oldId) continue;
    d.modules[toId] = mergeOld(d.modules[oldId], d.modules[toId]);
    delete d.modules[oldId];
    moved = true;
  }
  return moved;
}

/**
 * Indeksai, kurių užduočių nebeliko, nesiskaito: sutrumpėjęs modulis negali
 * atrodyti atliktas vien todėl, kad sename įraše buvo daugiau atsakymų
 * (LL-20, LL-31). Pasikartojantys indeksai irgi negali išpūsti „atlikta“.
 */
function tidySolved(m) {
  if (typeof m.total !== "number" || m.total <= 0) {
    m.solved = [...new Set(m.solved.filter(Number.isInteger))];
    return;
  }
  m.solved = [...new Set(m.solved.filter((i) => Number.isInteger(i) && i < m.total))];
}

/** Kanoninio įrašo laukai — `record()` grąžina tik juos, `canonicalRecord()`
 *  su jais lygina. Naujas laukas turi atsirasti abiejose vietose. */
const FIELDS = ["seen", "attempts", "total", "solved", "last", "simDone"];

/** Ar išsaugotas įrašas jau toks, kokį grąžintų `record()` — be perrašymo. */
function canonicalRecord(raw, m) {
  if (!raw || typeof raw !== "object" || !m) return false;
  const keys = Object.keys(raw);
  if (keys.length !== Object.keys(m).length) return false;
  if (keys.some((k) => !FIELDS.includes(k))) return false;
  return raw.seen === m.seen
    && raw.attempts === m.attempts
    && raw.total === m.total
    && raw.last === m.last
    && raw.simDone === m.simDone
    && Array.isArray(raw.solved)
    && raw.solved.length === m.solved.length
    && raw.solved.every((v, i) => v === m.solved[i]);
}

/**
 * Normalizuoja VISUS įrašus vietoje. Tai skaitymo kelio dalis (LL-209):
 * `read()` grąžina tik tokią formą, kokią supranta kiekvienas skaitytojas,
 * nesvarbu, kada įrašas atsirado ir kokia buvo schema tą dieną.
 *
 * @returns {boolean} true — bent vienas įrašas buvo ne kanoninės formos
 *   (reikia įrašyti atgal, kad normalizavimas nebūtų kartojamas kiekvieną
 *   skaitymą ir `updated` nesisuktų).
 */
function normalizeAll(d) {
  if (!d.modules || typeof d.modules !== "object" || Array.isArray(d.modules)) {
    d.modules = {};
    return true;
  }
  let changed = false;
  for (const [id, raw] of Object.entries(d.modules)) {
    const m = record(raw);
    if (!m) { delete d.modules[id]; changed = true; continue; }
    tidySolved(m); // LL-20/LL-31: sutrumpėjęs modulis negali likti „atliktas“
    if (!canonicalRecord(raw, m)) changed = true;
    d.modules[id] = m;
  }
  return changed;
}

export function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || !data.modules) return empty();
    // Forma normalizuojama PIRMIAU už pervadinimą: `mergeOld()` ima
    // `record()` šaltinį, o skaitytojai (`count`, `isDone`, `get`,
    // `resumeTarget`) turi matyti vieną formą — ne tą, kuri atsitiktinai
    // guli diske.
    let changed = normalizeAll(data);
    // Pervadinimas: žyma keliama po dabartiniu ID, o senas raktas išnyksta
    // (ne kopijuojama), kad įrašai negalėtų išsiskirti.
    if (migrate(data)) changed = true;
    if (changed) write(data);
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
  // Senas ID rašomas po dabartiniu — kitaip po pervadinimo atsirastų antras
  // įrašas tam pačiam moduliui ir vienas iš jų liktų nematomas.
  const id = canonical(moduleId);
  const m = d.modules[id] || { seen: 0, attempts: 0, solved: [], total: 0, last: null };
  if (!Array.isArray(m.solved)) m.solved = [];
  if (typeof m.attempts !== "number") m.attempts = 0;
  if (typeof m.total !== "number") m.total = 0;
  tidySolved(m);
  d.modules[id] = m;
  return m;
}

export function markVisited(moduleId, total = 0) {
  const d = read();
  const m = slot(d, moduleId);
  m.seen += 1;
  m.last = new Date().toISOString();
  if (total > 0) m.total = total;
  tidySolved(m); // užduočių skaičius gali būti mažesnis nei sename įraše
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
  tidySolved(m);
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
  // Senas ID (pvz., iš seno adreso ar pasenusio sąrašo) grąžina tą patį įrašą
  // kaip dabartinis — `read()` jau perkėlė žymą, tad abu keliai veda į vieną.
  return read().modules[canonical(moduleId)] || null;
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
    const m = d.modules[canonical(id)];
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
  moduleId = canonical(moduleId); // atidarytas puslapis gali turėti ir seną ID
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
