/**
 * Pažanga saugoma tik vartotojo naršyklėje (localStorage).
 * Nėra registracijos, nėra serverio, nėra duomenų siuntimo.
 *
 * Svarbu: modulis laikomas atliktu tada, kai kiekviena užduotis atsakyta
 * teisingai bent kartą. Klaidingi bandymai nieko neatima ir neblokuoja.
 */

const KEY = "suprask:progress:v1";

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
  return write(d);
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
  return write(d);
}

export function markSimDone(moduleId) {
  const d = read();
  const m = slot(d, moduleId);
  m.simDone = true;
  m.last = new Date().toISOString();
  return write(d);
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
}
