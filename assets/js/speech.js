/**
 * Lietuviškas garsas — v3.
 *
 * Principai:
 *  1. VIENAS <audio> elementas, sukurtas kartą. Jo `src` keičiamas sinchroniškai
 *     paspaudimo metu — taip neprarandama naudotojo gesto aktyvacija (iOS/Android).
 *  2. Garso failai iš anksto parsisiunčiami kaip Blob ir grojami iš `blob:` URL,
 *     todėl paspaudimas negali „nutilti" dėl lėto tinklo ar buferizavimo.
 *  3. Jei naršyklė vis tiek blokuoja garsą, apie tai pranešama įvykiu
 *     `suprask:sound-blocked` — sąsaja parodyk užuominą, o ne tylą.
 *  4. Tekstas → failas ieškomas manifests (be crypto.subtle), todėl veikia ir
 *     su Brave Shields / griežtais privatumo nustatymais.
 */

const BASE = "./assets/audio/lt/";
const MANIFEST_URL = `${BASE}manifest.json`;

let element = null;      // vienintelis Audio elementas
let manifest = null;
let manifestReady = null;
let blobs = new Map();   // url -> objectURL
let preloading = new Set();
let playToken = 0;
let enabled = true;
let voice = null;

/* ---------- saugi localStorage ---------- */
function storageGet(key, fallback = null) {
  try { return window.localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function storageSet(key, value) {
  try { window.localStorage.setItem(key, value); } catch { /* nėra prieigos */ }
}
enabled = storageGet("suprask:sound", "on") !== "off";

/* ---------- manifestas ---------- */
manifestReady = fetch(MANIFEST_URL, { cache: "force-cache" })
  .then((r) => (r.ok ? r.json() : {}))
  .then((data) => { manifest = data || {}; return manifest; })
  .catch(() => { manifest = {}; return manifest; });

/* ---------- garso elementas ---------- */
function el() {
  if (element) return element;
  const a = document.createElement("audio");
  a.preload = "auto";
  a.setAttribute("playsinline", "");
  a.setAttribute("aria-hidden", "true");
  a.style.display = "none";
  document.body.appendChild(a);
  element = a;
  return a;
}

/* ---------- naršyklės balsas (tik su lt balsu) ---------- */
function pickVoice() {
  try {
    const synth = window.speechSynthesis;
    if (!synth || typeof synth.getVoices !== "function") return null;
    const voices = synth.getVoices() || [];
    return (
      voices.find((v) => (v.lang || "").toLowerCase() === "lt-lt") ||
      voices.find((v) => (v.lang || "").toLowerCase().startsWith("lt")) ||
      null
    );
  } catch { return null; }
}

try {
  voice = pickVoice();
  window.speechSynthesis?.addEventListener?.("voiceschanged", () => { voice = pickVoice(); });
} catch { /* ignore */ }

const variantFor = (rate) => (rate <= 0.85 ? "s" : "n");

/* ---------- vieša sąsaja ---------- */
export function isEnabled() { return enabled; }

export function setEnabled(v) {
  enabled = Boolean(v);
  storageSet("suprask:sound", enabled ? "on" : "off");
  if (!enabled) stop();
  return enabled;
}

export function toggle() { return setEnabled(!enabled); }

export function stop() {
  playToken += 1;
  if (element) {
    try { element.pause(); element.currentTime = 0; } catch { /* ignore */ }
  }
  try { window.speechSynthesis?.cancel?.(); } catch { /* ignore */ }
}

function entryFor(text) {
  if (!manifest) return null;
  return manifest[text] || null;
}

function announceBlocked() {
  try { window.dispatchEvent(new CustomEvent("suprask:sound-blocked")); } catch { /* ignore */ }
}

function tts(text, rate) {
  if (!enabled) return;
  if (!voice) voice = pickVoice();
  if (!voice) { announceBlocked(); return; }
  try {
    const synth = window.speechSynthesis;
    if (!synth || typeof synth.speak !== "function") return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "lt-LT";
    u.rate = rate <= 0.85 ? 0.8 : 0.95;
    u.pitch = 1.02;
    u.voice = voice;
    synth.speak(u);
  } catch { /* ignore */ }
}

/** Groja įrašą. `src` nustatomas ir play() kviečiamas sinchroniškai. */
export function speak(text, { rate = 0.92 } = {}) {
  if (!enabled || !text) return;
  const clean = String(text).trim();
  if (!clean) return;

  const run = () => {
    const entry = entryFor(clean);
    const rel = entry ? entry[variantFor(rate)] : null;
    if (!rel) { tts(clean, rate); return; }

    const url = BASE + rel;
    const src = blobs.get(url) || url;
    const a = el();
    const token = ++playToken;

    // Tas pats įrašas spaudžiamas pakartotinai — pradedame nuo pradžios.
    try {
      if (a.src !== src) a.src = src;
      a.currentTime = 0;
    } catch { /* ignore */ }

    const p = a.play();
    if (p && typeof p.catch === "function") {
      p.catch((err) => {
        if (token !== playToken) return; // jau groja kitas garsas
        const retry = () => {
          if (token !== playToken) return;
          const q = a.play();
          if (q && q.catch) q.catch(() => announceBlocked());
          window.removeEventListener("pointerdown", retry);
        };
        window.addEventListener("pointerdown", retry, { once: true });
        if (!err || err.name !== "NotAllowedError") announceBlocked();
      });
    }
  };

  if (manifest) run();
  else manifestReady.then(run);
}

/**
 * Iš anksto parsiunčia garso failus kaip Blob (grojimas be tinklo delsos).
 * Ribojama, kad lėtame mobiliajame tinkle nekonkuruotų su turiniu.
 */
export function prime(texts = [], { limit = 8 } = {}) {
  if (!enabled) return;
  const unique = [...new Set(texts.filter((t) => typeof t === "string" && t.trim()))].slice(0, limit);

  const warm = () => {
    for (const t of unique) {
      const entry = entryFor(t);
      if (!entry) continue;
      for (const variant of ["n", "s"]) {
        const rel = entry[variant];
        if (!rel) continue;
        const url = BASE + rel;
        if (blobs.has(url) || preloading.has(url)) continue;
        preloading.add(url);
        fetch(url)
          .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
          .then((blob) => { blobs.set(url, URL.createObjectURL(blob)); })
          .catch(() => { /* gros iš tinklo */ })
          .finally(() => preloading.delete(url));
      }
    }
  };

  if (manifest) warm();
  else manifestReady.then(warm);
}

/** Garso įjungimo mygtukas antraštėje */
export function bindHeaderToggle(btn, icon) {
  const paint = () => {
    btn.setAttribute("aria-pressed", String(enabled));
    if (icon) icon.textContent = enabled ? "🔊" : "🔇";
  };
  paint();
  btn.addEventListener("click", () => {
    toggle();
    paint();
    if (enabled) speak("Garsas įjungtas");
  });
}
