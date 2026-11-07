/**
 * Turinio ir simuliacijų registras.
 * Visas turinys — grynas JSON, kad jį galėtų kurti, tikrinti ir papildyti agentai
 * nekeisdami platformos kodo. Nauja simuliacija registruojama vienoje vietoje.
 */

export const BASE = "./content/lt/";

const cache = new Map();

async function getJSON(path) {
  if (cache.has(path)) return cache.get(path);
  const p = fetch(BASE + path, { cache: "no-cache" }).then(async (r) => {
    if (!r.ok) throw new Error(`Nepavyko įkelti ${path} (${r.status})`);
    return r.json();
  });
  cache.set(path, p);
  return p;
}

export const loadGrades = () => getJSON("grades.json");
export const loadGradeIndex = (grade) => getJSON(`grade-${String(grade).padStart(2, "0")}/index.json`);
export const loadModule = (file) => getJSON(file);

/** Rekomenduojamas mokymosi kelias; jei failo nėra — null (ne klaida). */
export async function loadPath(grade) {
  try {
    return await getJSON(`grade-${String(grade).padStart(2, "0")}/path.json`);
  } catch {
    return null;
  }
}

/* ---------- simuliacijų registras ---------- */
import * as calba from "./sims/calba.js";
import * as matematika from "./sims/matematika.js";
import * as pasaulis from "./sims/pasaulis.js";
import * as technologijos from "./sims/technologijos.js";
import * as zaidimai from "./sims/zaidimai.js";

const SIMS = Object.assign({}, calba.SIMS, matematika.SIMS, pasaulis.SIMS, technologijos.SIMS, zaidimai.SIMS);

export function getSim(id) {
  return SIMS[id] || null;
}

export function simIds() {
  return Object.keys(SIMS).sort();
}

/**
 * Simuliacijos API, kurį gauna kiekviena simuliacija.
 * Palengvina vienodą garsą, pranešimus ir būsenos išsaugojimą.
 */
export function makeSimApi({ speak, readout, note, moduleId, onProgress }) {
  return {
    speak,
    readout: (t) => { if (readout) readout.textContent = t; },
    note: (t) => { if (note) note.textContent = t; },
    progress: (payload) => { if (onProgress) onProgress(moduleId, payload); },
  };
}
