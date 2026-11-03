/**
 * Lietuviškas balsas per naršyklės SpeechSynthesis.
 * Nėra išorinių paslaugų, jokių failų parsisiuntimo, jokių sekimo skriptų.
 */

let enabled = localStorage.getItem("suprask:sound") !== "off";
let voice = null;

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

export function isEnabled() { return enabled; }

export function setEnabled(v) {
  enabled = Boolean(v);
  localStorage.setItem("suprask:sound", enabled ? "on" : "off");
  if (!enabled && "speechSynthesis" in window) window.speechSynthesis.cancel();
  return enabled;
}

export function toggle() { return setEnabled(!enabled); }

export function speak(text, { rate = 0.92, pitch = 1.05 } = {}) {
  if (!enabled || !text) return;
  if (!("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text));
    u.lang = "lt-LT";
    u.rate = rate;
    u.pitch = pitch;
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  } catch { /* tyliai praleidžiame */ }
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
