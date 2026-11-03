/**
 * Lietuviškas garsas.
 *
 * Šaltinis — iš anksto sugeneruoti neuroninio balso įrašai
 * (`assets/audio/lt/{n|s}/<id>.mp3`, balsas lt-LT-OnaNeural).
 * Tekstas → failas ieškomas manifests (`assets/audio/lt/manifest.json`),
 * todėl nereikia `crypto.subtle` — veikia ir naršyklėse, kurios blokuoja
 * fingerprinting API (Brave Shields, griežti privatumo nustatymai) arba
 * neleidžia localStorage.
 *
 * Naršyklės balsas naudojamas TIK jei įrašo nėra IR yra lietuviškas balsas.
 * Angliškas balsas lietuviško teksto niekada neskaito.
 */

const BASE = "./assets/audio/lt/";
const MANIFEST_URL = `${BASE}manifest.json`;

const audioCache = new Map(); // url -> Audio
let manifest = null;
let manifestReady = null;
let current = null;
let enabled = true;
let voice = null;

/* ---------- saugi localStorage prieiga ---------- */
function storageGet(key, fallback = null) {
  try { return window.localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function storageSet(key, value) {
  try { window.localStorage.setItem(key, value); } catch { /* nėra prieigos — tyliai */ }
}

enabled = storageGet("suprask:sound", "on") !== "off";

/* ---------- manifestas ---------- */
manifestReady = fetch(MANIFEST_URL, { cache: "force-cache" })
  .then((r) => (r.ok ? r.json() : {}))
  .then((data) => { manifest = data || {}; return manifest; })
  .catch(() => { manifest = {}; return manifest; });

/* ---------- naršyklės balso atsarginis variantas ---------- */
function pickVoice() {
  // Brave/privatumo plėtiniai gali padaryti API neveikiančiu, bet palikti savybę.
  // Todėl kiekviena prieiga apgaubta — garso modulis neturi griauti visos programos.
  try {
    const synth = window.speechSynthesis;
    if (!synth || typeof synth.getVoices !== "function") return null;
    const voices = synth.getVoices() || [];
    return (
      voices.find((v) => (v.lang || "").toLowerCase() === "lt-lt") ||
      voices.find((v) => (v.lang || "").toLowerCase().startsWith("lt")) ||
      null
    );
  } catch {
    return null;
  }
}

try {
  voice = pickVoice();
  window.speechSynthesis?.addEventListener?.("voiceschanged", () => { voice = pickVoice(); });
} catch { /* be naršyklės balso — naudosime įrašus */ }

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
  if (current) {
    try { current.pause(); current.currentTime = 0; } catch { /* ignore */ }
    current = null;
  }
  try { window.speechSynthesis?.cancel?.(); } catch { /* ignore */ }
}

function entryFor(text) {
  if (!manifest) return null;
  return manifest[text] || null;
}

/** Groja iš anksto įrašytą garsą; jei įrašo nėra — lietuvišką naršyklės balsą. */
export function speak(text, { rate = 0.92 } = {}) {
  if (!enabled || !text) return;
  const clean = String(text).trim();
  if (!clean) return;

  const play = () => {
    const entry = entryFor(clean);
    const rel = entry ? entry[variantFor(rate)] : null;
    if (!rel) { tts(clean, rate); return; }

    const url = BASE + rel;
    stop();
    const audio = audioCache.get(url) || new Audio(url);
    audio.preload = "auto";
    audioCache.set(url, audio);
    current = audio;

    const p = audio.play();
    if (p && typeof p.catch === "function") {
      // Autoplay kvota: bandome dar kartą per kitą naudotojo paspaudimą.
      // Svetimos kalbos balso neįjungiame net jei grojimas nepavyksta.
      p.catch(() => {
        const resume = () => {
          audio.play().catch(() => {});
          window.removeEventListener("pointerdown", resume);
        };
        window.addEventListener("pointerdown", resume, { once: true });
      });
    }
  };

  if (manifest) play();
  else manifestReady.then(play);
}

/** Naršyklės balsas — tik jei yra lietuviškas balsas. */
function tts(text, rate) {
  if (!enabled) return;
  if (!voice) voice = pickVoice();
  if (!voice) return; // nėra lietuviško balso — geriau tyla nei angliškas skaitymas
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
  } catch { /* tyliai praleidžiame */ }
}

/** Iš anksto įkelia modulio garso failus, kad pirmas paspaudimas būtų tylus. */
export function prime(texts = []) {
  if (!enabled) return;
  const unique = [...new Set(texts.filter((t) => typeof t === "string" && t.trim()))].slice(0, 40);
  const warm = () => {
    for (const t of unique) {
      const entry = entryFor(t);
      if (!entry) continue;
      for (const variant of ["n", "s"]) {
        const rel = entry[variant];
        if (!rel) continue;
        const url = BASE + rel;
        if (audioCache.has(url)) continue;
        const a = new Audio(url);
        a.preload = "auto";
        audioCache.set(url, a);
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
