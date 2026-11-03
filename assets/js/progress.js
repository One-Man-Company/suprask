/**
 * Pažanga saugoma tik vartotojo naršyklėje (localStorage).
 * Nėra registracijos, nėra serverio, nėra duomenų siuntimo.
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

export function markVisited(moduleId) {
  const d = read();
  const m = d.modules[moduleId] || { seen: 0, tasks: 0, tasksCorrect: 0, last: null };
  m.seen += 1;
  m.last = new Date().toISOString();
  d.modules[moduleId] = m;
  return write(d);
}

export function markTask(moduleId, correct) {
  const d = read();
  const m = d.modules[moduleId] || { seen: 0, tasks: 0, tasksCorrect: 0, last: null };
  m.tasks += 1;
  if (correct) m.tasksCorrect += 1;
  m.last = new Date().toISOString();
  d.modules[moduleId] = m;
  return write(d);
}

export function markSimDone(moduleId) {
  const d = read();
  const m = d.modules[moduleId] || { seen: 0, tasks: 0, tasksCorrect: 0, last: null };
  m.simDone = true;
  m.last = new Date().toISOString();
  d.modules[moduleId] = m;
  return write(d);
}

export function get(moduleId) {
  return read().modules[moduleId] || null;
}

export function isDone(moduleId) {
  const m = get(moduleId);
  return Boolean(m && m.tasks > 0 && m.tasksCorrect >= m.tasks);
}

export function count(moduleIds) {
  const d = read();
  let done = 0;
  for (const id of moduleIds) {
    const m = d.modules[id];
    if (m && m.tasks > 0 && m.tasksCorrect >= m.tasks) done += 1;
  }
  return { done, total: moduleIds.length };
}

export function reset() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
