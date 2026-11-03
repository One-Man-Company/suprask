/**
 * Lietuviškas garsas.
 *
 * Pirmas pasirinkimas — iš anksto sugeneruoti neuroninio balso įrašai
 * (`assets/audio/lt/{n|s}/<sha256-prefix>.mp3`, balsas lt-LT-OnaNeural).
 * Jei įrašo nėra (dinaminis sakinys), naudojamas naršyklės balsas, kad
 * niekas neliktų be garso.
 *
 * Failų vardai sutampa su `scripts/generate_audio.py` (sha256, pirmi 16 hex).
 */

const BASE = "./assets/audio/lt/";
const cache = new Map(); // url -> Audio
let current = null; // šiuo metu grojantis Audio
let enabled = localStorage.getItem("suprask:sound") !== "off";
let voice = null;

/* ---------- naršyklės balso atsarginis variantas ---------- */
function pickVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  return (
    voices.find((v) => v.lang === "lt-LT") ||
    voices.find((v) => (v.lang || "").toLowerCase().startsWith("lt")) ||
    null
  );
}

if ("speechSynthesis" in window) {
  voice = pickVoice();
  window.speechSynthesis.addEventListener?.("voiceschanged", () => { voice = pickVoice(); });
}

/* ---------- tekstas → failo vardas ---------- */
const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

async function hashText(text) {
  if (!globalThis.crypto?.subtle) throw new Error("crypto.subtle neprieinamas");
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return hex(digest).slice(0, 16);
}

const variantFor = (rate) => (rate <= 0.85 ? "s" : "n");

/* ---------- vieša sąsaja ---------- */
export function isEnabled() { return enabled; }

export function setEnabled(v) {
  enabled = Boolean(v);
  localStorage.setItem("suprask:sound", enabled ? "on" : "off");
  if (!enabled) stop();
  return enabled;
}

export function toggle() { return setEnabled(!enabled); }

export function stop() {
  if (current) {
    try { current.pause(); current.currentTime = 0; } catch { /* ignore */ }
    current = null;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

/** Groja iš anksto įrašytą garsą; jei nepavyksta — naršyklės balsą. */
export function speak(text, { rate = 0.92 } = {}) {
  if (!enabled || !text) return;
  const clean = String(text).trim();
  if (!clean) return;

  const variant = variantFor(rate);
  stop();

  hashText(clean)
    .then((h) => {
      const url = `${BASE}${variant}/${h}.mp3`;
      const audio = cache.get(url) || new Audio(url);
      audio.preload = "auto";
      cache.set(url, audio);
      current = audio;

      const fallback = () => tts(clean, rate);
      audio.onerror = fallback;
      const p = audio.play();
      if (p && typeof p.catch === "function") p.catch(fallback);
    })
    .catch(() => tts(clean, rate));
}

/** Naršyklės balsas (tik kai įrašo nėra). */
function tts(text, rate) {
  if (!enabled || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "lt-LT";
    u.rate = rate <= 0.85 ? 0.8 : 0.95;
    u.pitch = 1.02;
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  } catch { /* tyliai praleidžiame */ }
}

/**
 * Iš anksto įkelia garso failus, kad pirmas paspaudimas negrotų tuščiai.
 * Kviečiama įkėlus modulį su visais modulio tekstais.
 */
export function prime(texts = []) {
  if (!enabled) return;
  const unique = [...new Set(texts.filter((t) => typeof t === "string" && t.trim()))].slice(0, 40);
  for (const t of unique) {
    hashText(t).then((h) => {
      for (const variant of ["n", "s"]) {
        const url = `${BASE}${variant}/${h}.mp3`;
        if (cache.has(url)) continue;
        const a = new Audio(url);
        a.preload = "auto";
        cache.set(url, a);
      }
    }).catch(() => { /* be garso */ });
  }
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
