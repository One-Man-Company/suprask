/**
 * Muzikos simuliacijos (1 klasė).
 *
 * Principas: garso aukštis ir garsumas rodomi kaip DU atskiri valdikliai su
 * dviem atskirais rodmenimis. Vaikas pats įsitikina, kad pakeitus vieną
 * savybę kita nepasikeičia — tai paneigia nuostatą „aukštas garsas = garsus
 * garsas“ (žr. agents/proposals/2026-11-08-ideator-garso-aukstis.json).
 *
 * Kodėl schema, o ne scena: čia nėra dangaus, žemės ar augalų, tad art.js
 * dalys netinka — rodomas matavimo prietaisas (aukščio kopėčios ir garsumo
 * juosta), o ne iliustracija (LL-13). Rodmenys yra tekstiniai, todėl modelis
 * veikia ir visiškai be garso.
 */

/* ---------- garsas ---------- */
const AC = window.AudioContext || window.webkitAudioContext;

function soundEnabled() {
  // Tas pats raktas, kurį naudoja speech.js. Nekuriame statinės priklausomybės
  // nuo speech.js, nes jis kraunamas neprivalomai (žr. app.js).
  try { return window.localStorage.getItem("suprask:sound") !== "off"; } catch { return true; }
}

/* ---------- simuliacija ---------- */
const garsoAukstis = {
  mount({ stage, controls, api, config }) {
    const PITCH = config.pitch || [];
    const VOL = config.volume || [];
    const BTNS = config.controls || [];
    const P_SHORT = PITCH.map((x) => x.short);
    const V_SHORT = VOL.map((x) => x.short);

    let pi = 1; // aukštis: 0 žemas … paskutinis aukštas
    let vi = 1; // garsumas: 0 tyliai … paskutinis garsiai
    let touchedPitch = false;
    let touchedVol = false;
    let listened = false;
    let reported = false;

    let ctx = null;
    const live = new Set();

    stage.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,10rem),1fr));gap:1rem;width:100%">
        <div id="ga-ladder" role="group" aria-label="Garso aukštis" style="display:grid;gap:.35rem;min-width:0"></div>
        <div style="display:grid;gap:.55rem;min-width:0">
          <p style="margin:0;font-family:var(--font-head);font-weight:900;font-size:1.05rem">Garsumas</p>
          <div id="ga-bar" style="position:relative;height:1.6rem;border:2px solid var(--ink-soft);border-radius:999px;background:var(--paper)">
            <div id="ga-fill" style="height:100%;border-radius:999px;background:var(--accent)"></div>
          </div>
          <div id="ga-bar-labels" style="display:grid;grid-template-columns:repeat(${VOL.length || 1},minmax(0,1fr));gap:.2rem;font-size:.82rem;font-weight:700;color:var(--ink-soft)"></div>
        </div>
      </div>`;

    const ladder = stage.querySelector("#ga-ladder");
    const fill = stage.querySelector("#ga-fill");
    const barLabels = stage.querySelector("#ga-bar-labels");

    PITCH.forEach((item, i) => {
      const row = document.createElement("div");
      row.dataset.p = String(i);
      row.style.cssText = "display:flex;align-items:center;gap:.45rem;min-height:2.7rem;padding:0 .7rem;border-radius:999px;border:2px solid transparent;font-weight:800;font-size:1rem";
      row.innerHTML = `<span aria-hidden="true" style="width:1.4rem;text-align:center;font-size:1.15rem">♪</span><span>${item.short}</span>`;
      ladder.appendChild(row);
    });

    VOL.forEach((item) => {
      const lab = document.createElement("span");
      lab.textContent = item.short;
      lab.style.textAlign = "center";
      barLabels.appendChild(lab);
    });

    function paint(readout = true) {
      ladder.querySelectorAll("[data-p]").forEach((row) => {
        const on = Number(row.dataset.p) === pi;
        row.style.background = on ? "var(--accent)" : "transparent";
        // Tamsus tekstas ant oranžinės: kontrastas 6,9:1 (balta duotų tik 2,35:1).
        row.style.color = on ? "var(--ink)" : "var(--ink-soft)";
        row.style.borderColor = on ? "var(--accent-press)" : "var(--line)";
        row.querySelector("span[aria-hidden]").style.opacity = on ? "1" : ".25";
        row.setAttribute("aria-current", on ? "true" : "false");
      });

      fill.style.width = `${((vi + 1) / VOL.length) * 100}%`;

      if (readout) api.readout(`Garsas ${P_SHORT[pi]}, skamba ${V_SHORT[vi]}.`);
    }

    function ensureCtx() {
      if (ctx) return ctx;
      if (!AC) return null;
      try { ctx = new AC(); } catch { ctx = null; }
      return ctx;
    }

    function tone() {
      const c = ensureCtx();
      if (!c) return false;
      if (c.state === "suspended" && typeof c.resume === "function") c.resume().catch(() => {});
      let osc = null;
      let gain = null;
      try {
        osc = c.createOscillator();
        gain = c.createGain();
        const t0 = c.currentTime;
        const peak = VOL[vi].gain;
        osc.type = "sine";
        osc.frequency.setValueAtTime(PITCH[pi].hz, t0);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.05);
        gain.gain.setValueAtTime(peak, t0 + 0.95);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.15);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(t0);
        osc.stop(t0 + 1.2);
      } catch {
        return false;
      }
      live.add(osc);
      osc.onended = () => {
        live.delete(osc);
        try { osc.disconnect(); gain.disconnect(); } catch { /* jau atjungta */ }
      };
      return true;
    }

    function checkProgress(allowNote) {
      if (reported || !touchedPitch || !touchedVol || !listened) return;
      reported = true;
      api.progress({ correct: true });
      if (allowNote) api.note("Keitei aukštį ir garsumą atskirai: tai dvi skirtingos savybės.");
    }

    function step(axis, dir) {
      if (axis === "pitch") {
        const next = Math.min(PITCH.length - 1, Math.max(0, pi + dir));
        if (next === pi) {
          api.note(dir > 0 ? "Tai aukščiausias aukštis. Žemyn — mygtuku „Žemyn“." : "Tai žemiausias aukštis. Aukštyn — mygtuku „Aukštyn“.");
          return;
        }
        pi = next;
        touchedPitch = true;
        paint();
        api.speak(PITCH[pi].label, { rate: 0.9 });
        api.note(`Aukštis — ${P_SHORT[pi]}. Garsumas liko ${V_SHORT[vi]}.`);
      } else {
        const next = Math.min(VOL.length - 1, Math.max(0, vi + dir));
        if (next === vi) {
          api.note(dir > 0 ? "Tai garsiausias garsumas. Tyliau — mygtuku „Tyliau“." : "Tai tyliausias garsumas. Garsiau — mygtuku „Garsiau“.");
          return;
        }
        vi = next;
        touchedVol = true;
        paint();
        api.speak(VOL[vi].label, { rate: 0.9 });
        api.note(`Garsumas — ${V_SHORT[vi]}. Aukštis liko ${P_SHORT[pi]}.`);
      }
      checkProgress(true);
    }

    function listen() {
      listened = true;
      if (!soundEnabled()) {
        api.note("Garsas išjungtas. Įjunk jį mygtuku viršuje ir spausk „Paklausyk“ dar kartą.");
        checkProgress(false);
        return;
      }
      if (!tone()) {
        api.note("Šiame įrenginyje garso groti nepavyko. Rodmenys vis tiek rodo aukštį ir garsumą.");
        checkProgress(false);
        return;
      }
      api.note(`Skamba 1 sekundę: ${P_SHORT[pi]} garsas, ${V_SHORT[vi]}.`);
      checkProgress(true);
    }

    controls.innerHTML = BTNS.map((b) => `
      <button class="${b.action === "play" ? "btn" : "btn secondary"}" data-act="${b.action}"
        aria-label="${b.aria}" style="min-width:4.6rem">
        <span aria-hidden="true">${b.glyph || ""}</span><span>${b.label}</span>
      </button>`).join("");

    controls.querySelectorAll("[data-act]").forEach((b) => {
      b.addEventListener("click", () => {
        switch (b.dataset.act) {
          case "pitch-up": step("pitch", 1); break;
          case "pitch-down": step("pitch", -1); break;
          case "vol-up": step("vol", 1); break;
          case "vol-down": step("vol", -1); break;
          case "play": listen(); break;
          default: break;
        }
      });
    });

    paint();
    api.note("Pirma keisk aukštį. Paskui keisk garsumą ir žiūrėk, ar aukštis pakito.");

    return () => {
      live.forEach((osc) => { try { osc.stop(); } catch { /* jau sustabdytas */ } });
      live.clear();
      if (ctx && typeof ctx.close === "function") { try { ctx.close(); } catch { /* jau uždarytas */ } }
      ctx = null;
    };
  },
};

/* ---------- ritmas ir pulsas ---------- */

/**
 * Modelis: pulsas — fiksuotas tinklelis, kuris teka tolygiai (16 dūžių,
 * 4 taktai po 4 pulsus). Ritmas — kortelės, dedamos ANT to tinklelio.
 * Keičiamos tik kortelės; pulso eilutė lieka ta pati, todėl vaikas girdi ir
 * mato, kad pasikeitė ritmas, o ne pulsas (klaidinga nuostata „pulsas ir
 * ritmas yra tas pats“).
 *
 * Kodėl kortelė turi tris būsenas: „tam“ sutampa su pulsu (vaikas girdi, kaip
 * abu sluoksniai susilieja), „ti-ti“ duoda antrą garsą pusiaukelėje, o „tyla“
 * parodo, kad pulsas teka ir tada, kai nieko neploji. Be „tylos“ modelis
 * neįrodytų, kad pulsas nepriklauso nuo ritmo.
 *
 * Garso laikas skaičiuojamas AudioContext laikrodžiu (ne setTimeout), o
 * vizualiniai ženklai — atskirai, todėl lėtas įrenginys negroja „plaukiojančio“
 * ritmo. Be garso modelis lieka prasmingas: pulsas rodomas tašku, ritmas —
 * kortele.
 */

const BEAT_MS = 600;           // vienas pulsas ≈ 100 dūžių per minutę
const BARS = 4;
const BEATS_PER_BAR = 4;
const TOTAL_BEATS = BARS * BEATS_PER_BAR;
const COUNT_MS = 220;          // kiek laiko prieš pirmą garsą
const PULSE_HZ = 220;          // žemas „tuk“ — pulsas
const CLAP_HZ = 990;           // aukštas „tak“ — plojimas

const DEFAULT_CARDS = [
  { id: "tam", word: "Tam", desc: "vienas plojimas" },
  { id: "titi", word: "Ti-ti", desc: "du plojimai" },
  { id: "tyla", word: "Tyla", desc: "tyla" },
];

function cardGlyph(id) {
  if (id === "titi") {
    return '<span style="width:.5rem;height:.5rem;border-radius:50%;background:var(--ink)"></span>' +
      '<span style="width:.5rem;height:.5rem;border-radius:50%;background:var(--ink)"></span>';
  }
  if (id === "tyla") {
    return '<span style="width:.85rem;height:.85rem;border-radius:50%;border:2px dashed var(--ink-soft)"></span>';
  }
  return '<span style="width:.85rem;height:.85rem;border-radius:50%;background:var(--ink)"></span>';
}

const ritmasIrPulsas = {
  mount({ stage, controls, api, config }) {
    const CARDS = Array.isArray(config.cards) && config.cards.length ? config.cards : DEFAULT_CARDS;
    const BY_ID = new Map(CARDS.map((c) => [c.id, c]));
    const SENT = config.sentences || {};
    const START = BY_ID.has(config.start) ? config.start : CARDS[0].id;
    const IDS = CARDS.map((c) => c.id);

    const state = new Array(TOTAL_BEATS).fill(START);
    let answered = false;
    let playing = false;
    let reported = false;
    let timers = [];
    let ctx = null;
    const live = new Set();

    stage.innerHTML = `
      <div style="display:grid;gap:.45rem;width:100%;max-width:26rem;min-width:0">
        <div style="display:grid;gap:.2rem;font-size:.74rem;font-weight:800;color:var(--ink-soft);min-width:0">
          <span style="display:flex;align-items:center;gap:.35rem;flex-wrap:wrap">
            <span aria-hidden="true" style="width:.55rem;height:.55rem;border-radius:50%;background:var(--ink-soft)"></span>
            PULSAS — mažas taškas, teka tolygiai
          </span>
          <span id="rb-key" style="display:flex;align-items:center;gap:.8rem;flex-wrap:wrap"></span>
        </div>
        <div id="rb-bars" style="display:grid;gap:.5rem;min-width:0"></div>
      </div>`;

    const bars = stage.querySelector("#rb-bars");
    const key = stage.querySelector("#rb-key");
    const cells = [];

    CARDS.forEach((c) => {
      const item = document.createElement("span");
      item.style.cssText = "display:inline-flex;align-items:center;gap:.3rem";
      item.innerHTML = `<span aria-hidden="true" style="display:inline-flex;align-items:center;gap:.14rem">${cardGlyph(c.id)}</span>${c.word}`;
      key.appendChild(item);
    });

    for (let b = 0; b < BARS; b += 1) {
      const wrap = document.createElement("div");
      wrap.style.cssText = "display:grid;gap:.22rem;min-width:0";
      wrap.setAttribute("role", "group");
      wrap.setAttribute("aria-label", `${b + 1} taktas`);

      const cap = document.createElement("p");
      cap.textContent = `${b + 1} taktas`;
      cap.style.cssText = "margin:0;font-size:.7rem;font-weight:800;letter-spacing:.04em;color:var(--ink-soft)";
      wrap.appendChild(cap);

      const row = document.createElement("div");
      row.style.cssText = "display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.35rem;min-width:0";

      for (let p = 0; p < BEATS_PER_BAR; p += 1) {
        const i = b * BEATS_PER_BAR + p;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.dataset.i = String(i);
        /* Aukštis fiksuotas px, o ne rem: 200 % tekste langelis neturi išpūsti
           tinklelio, o 48 px taikinio reikalavimas tenkinamas ir 16 px šaknyje
           (LL-40 — taisymas turi galioti visame ruože, ne vien zondo taške). */
        btn.style.cssText = "display:grid;justify-items:center;align-content:center;gap:.15rem;" +
          "min-height:48px;min-width:0;padding:.35rem .15rem;border:2px solid var(--line);" +
          "border-radius:10px;background:var(--paper);color:var(--ink);font:inherit;cursor:pointer";
        btn.innerHTML =
          '<span class="rb-dot" aria-hidden="true" style="width:.6rem;height:.6rem;border-radius:50%;background:var(--ink-soft)"></span>' +
          '<span class="rb-glyph" aria-hidden="true" style="display:flex;align-items:center;justify-content:center;gap:.16rem;min-height:1rem"></span>';
        btn.addEventListener("click", () => cycle(i));
        cells.push(btn);
        row.appendChild(btn);
      }

      wrap.appendChild(row);
      bars.appendChild(wrap);
    }

    /* Mygtukų minimumai — `rem`, tad 200 % tekste (32 px šaknis) jie auga
       kartu su šriftu ir gali būti platesni už visą valdiklių juostą
       (`min-width` laimi prieš `max-width`): „Paleisk“ 8rem = 256 px, kai
       @360/32 juostai skirta 241 px, todėl mygtukas išlipo iš kortelės.
       `min(8rem,100%)` riboja minimumą turimu pločiu (LL-70), o įprastu
       16 px šriftu 100 % juostos (298 px) didesnis už 8rem — plotis
       nepakinta (matuota prieš ir po). */
    controls.innerHTML = `
      <button class="btn" type="button" id="rb-guess" style="min-width:7.5rem">Sakau</button>
      <button class="btn" type="button" id="rb-play" aria-label="Paleisk pulsą ir ritmą" style="min-width:min(8rem,100%)">Paleisk</button>
      <button class="btn secondary" type="button" id="rb-reset" style="min-width:6rem">Iš naujo</button>`;

    const guessBtn = controls.querySelector("#rb-guess");
    const playBtn = controls.querySelector("#rb-play");
    const resetBtn = controls.querySelector("#rb-reset");

    function after(ms, fn) {
      timers.push(setTimeout(fn, ms));
    }

    function clearTimers() {
      timers.forEach((id) => clearTimeout(id));
      timers = [];
    }

    function ensureCtx() {
      if (ctx) return ctx;
      if (!AC) return null;
      try { ctx = new AC(); } catch { ctx = null; }
      return ctx;
    }

    function speak(key) {
      const text = SENT[key];
      if (text) api.speak(text, { rate: 0.95 });
    }

    function paintCell(i) {
      const btn = cells[i];
      const c = BY_ID.get(state[i]);
      btn.querySelector(".rb-glyph").innerHTML = cardGlyph(c.id);
      const bar = Math.floor(i / BEATS_PER_BAR) + 1;
      const pos = (i % BEATS_PER_BAR) + 1;
      btn.setAttribute("aria-label", `${bar} taktas, ${pos} pulsas: ${c.desc}. Spausk, kad keistum.`);
    }

    function setCardsEnabled(on) {
      cells.forEach((b) => {
        if (on) b.removeAttribute("aria-disabled");
        else b.setAttribute("aria-disabled", "true");
        b.style.opacity = on ? "1" : ".55";
      });
    }

    function paintPlay() {
      playBtn.textContent = playing ? "Sustabdyk" : "Paleisk";
      playBtn.setAttribute("aria-label", playing ? "Sustabdyk grojimą" : "Paleisk pulsą ir ritmą");
    }

    function lightPulse(i, on) {
      const dot = cells[i].querySelector(".rb-dot");
      dot.style.background = on ? "var(--accent)" : "var(--ink-soft)";
      dot.style.transform = on ? "scale(1.5)" : "none";
    }

    function flash(i) {
      const b = cells[i];
      b.style.borderColor = "var(--accent-press)";
      b.style.background = "var(--paper-2)";
      after(130, () => {
        b.style.borderColor = "var(--line)";
        b.style.background = "var(--paper)";
      });
    }

    function clearVisuals() {
      cells.forEach((b) => {
        const dot = b.querySelector(".rb-dot");
        dot.style.background = "var(--ink-soft)";
        dot.style.transform = "none";
        b.style.borderColor = "var(--line)";
        b.style.background = "var(--paper)";
      });
    }

    function tone(when, freq, peak, dur) {
      const c = ctx;
      if (!c) return;
      let osc = null;
      let gain = null;
      try {
        osc = c.createOscillator();
        gain = c.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, when);
        gain.gain.setValueAtTime(0.0001, when);
        gain.gain.exponentialRampToValueAtTime(peak, when + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(when);
        osc.stop(when + dur + 0.03);
      } catch {
        return;
      }
      live.add(osc);
      osc.onended = () => {
        live.delete(osc);
        try { osc.disconnect(); gain.disconnect(); } catch { /* jau atjungta */ }
      };
    }

    function stop(byUser) {
      clearTimers();
      live.forEach((osc) => { try { osc.stop(); } catch { /* jau sustabdytas */ } });
      live.clear();
      clearVisuals();
      playing = false;
      paintPlay();
      if (byUser) {
        api.readout(SENT.stop || "Sustabdyta.");
        api.note("Gali keisti korteles.");
        speak("stop");
      }
    }

    function finish() {
      clearTimers();
      clearVisuals();
      playing = false;
      paintPlay();
      /* Ritmas sutampa su pulsu tik tada, kai visos kortelės „tam“. Bet kuri
         kita kortelė įrodo, kad ritmas yra atskiras sluoksnis (LL-29: pažanga
         žymima tik įvykus visam ciklui, ne po pirmos kortelės). */
      const varied = state.some((s) => s !== START);
      if (varied) {
        api.readout(SENT.done || "Pulsas ėjo tolygiai, o ritmas keitėsi.");
        api.note("Pulsas skambėjo visus keturis taktus. Keitėsi tik plojimai.");
        speak("done");
        if (!reported) {
          reported = true;
          api.progress({ correct: true });
        }
      } else {
        api.readout(SENT.same || "Ritmas toks pat kaip pulsas.");
        api.note("Pakeisk bent vieną kortelę ir paleisk dar kartą.");
        speak("same");
      }
    }

    function play() {
      if (playing) {
        stop(true);
        return;
      }
      const c = ensureCtx();
      const useSound = !!c && soundEnabled();
      if (c && c.state === "suspended" && typeof c.resume === "function") c.resume().catch(() => {});

      clearTimers();
      clearVisuals();
      playing = true;
      paintPlay();

      const baseMs = COUNT_MS;
      const baseAudio = useSound ? c.currentTime + baseMs / 1000 : 0;

      for (let i = 0; i < TOTAL_BEATS; i += 1) {
        const at = baseMs + i * BEAT_MS;
        const card = state[i];
        const audioAt = baseAudio + (i * BEAT_MS) / 1000;

        after(at, () => lightPulse(i, true));
        after(at + BEAT_MS * 0.55, () => lightPulse(i, false));

        if (card === "tam") after(at, () => flash(i));
        if (card === "titi") {
          after(at, () => flash(i));
          after(at + BEAT_MS / 2, () => flash(i));
        }

        if (useSound) {
          tone(audioAt, PULSE_HZ, 0.06, 0.09);
          if (card === "tam") tone(audioAt, CLAP_HZ, 0.09, 0.06);
          if (card === "titi") {
            tone(audioAt, CLAP_HZ, 0.09, 0.05);
            tone(audioAt + BEAT_MS / 2000, CLAP_HZ, 0.07, 0.05);
          }
        }
      }

      after(baseMs + TOTAL_BEATS * BEAT_MS + 320, finish);

      api.readout(SENT.play || "Klausyk abiejų sluoksnių kartu.");
      api.note(SENT.listen || "Pulsas žemai, plojimai aukštai.");
      speak("play");

      if (!useSound) {
        api.note(c ? (SENT.nosound || "") : (SENT.nosupport || ""));
      }
    }

    function cycle(i) {
      if (!answered) {
        api.note(SENT.guess || "Pirma pasakyk, tada keisk.");
        speak("guess");
        guessBtn.focus();
        return;
      }
      if (playing) {
        api.note(SENT.locked || "Pirma sustabdyk, tada keisk.");
        playBtn.focus();
        return;
      }
      const next = IDS[(IDS.indexOf(state[i]) + 1) % IDS.length];
      state[i] = next;
      paintCell(i);
      const c = BY_ID.get(next);
      api.readout(`${c.word}.`);
      api.note(SENT[next] || "");
      speak(next);
    }

    function reset() {
      if (playing) stop(false);
      state.fill(START);
      cells.forEach((_, i) => paintCell(i));
      clearVisuals();
      api.readout(SENT.reset || "Vėl pradžia.");
      api.note("Visos kortelės tam.");
      speak("reset");
    }

    cells.forEach((b, i) => paintCell(i));
    setCardsEnabled(false);
    paintPlay();

    guessBtn.addEventListener("click", () => {
      answered = true;
      guessBtn.hidden = true;
      setCardsEnabled(true);
      api.readout(SENT.start || "Pulsas skamba kas vieną.");
      api.note("Dabar keisk korteles ir klausyk, kas kinta.");
      speak("start");
      cells[0].focus();
    });

    playBtn.addEventListener("click", play);
    resetBtn.addEventListener("click", reset);

    bars.addEventListener("keydown", (e) => {
      const i = cells.indexOf(document.activeElement);
      if (i < 0) return;
      let next = -1;
      if (e.key === "ArrowRight") next = (i + 1) % TOTAL_BEATS;
      else if (e.key === "ArrowLeft") next = (i - 1 + TOTAL_BEATS) % TOTAL_BEATS;
      else if (e.key === "ArrowDown") next = (i + BEATS_PER_BAR) % TOTAL_BEATS;
      else if (e.key === "ArrowUp") next = (i - BEATS_PER_BAR + TOTAL_BEATS) % TOTAL_BEATS;
      if (next >= 0) {
        e.preventDefault();
        cells[next].focus();
      }
    });

    api.readout(SENT.ask || "Kas pasikeis, kai pakeisi korteles?");
    api.note("Paklausyk. Tada pasakyk, kas pasikeis.");

    return () => {
      clearTimers();
      live.forEach((osc) => { try { osc.stop(); } catch { /* jau sustabdytas */ } });
      live.clear();
      if (ctx && typeof ctx.close === "function") { try { ctx.close(); } catch { /* jau uždarytas */ } }
      ctx = null;
    };
  },
};

/* ---------- klausymasis: melodija ir pritarimas ---------- */

/**
 * Modelis: TAS PATS aštuonių natų motyvas atliekamas trimis būdais —
 * vienas atlikėjas, ansamblis (melodija + pritarimas), orkestras (melodija +
 * pritarimas + bosas). Melodijos linija visais atvejais ta pati, o po ja
 * atsiranda vis daugiau balsų, todėl vaikas girdi ir mato: dainos nekeičia
 * atlikėjų skaičius (klaidinga nuostata „groja daug — tai jau kita daina“).
 *
 * Kodėl tai modelis, o ne iliustracija: kintamasis yra atlikėjų sudėtis, o
 * melodija fiksuota. Jei melodija keistųsi kartu, palyginimas nieko neįrodytų.
 *
 * Kodėl schema, o ne scena: čia nėra dangaus, žemės ar veikėjų, kuriems
 * reikėtų `art.js` dalių — rodomas garso sluoksnių vaizdas (trys eilutės po
 * aštuonis taškus), ne piešinys (LL-13). Todėl paveikslas lieka prasmingas ir
 * be garso: melodijos eilutė atrodo vienodai visais trimis atvejais.
 *
 * Garsas sintetinamas `AudioContext` laikrodžiu, o šviesos — atskirai: lėtas
 * įrenginys negroja „plaukiojančio“ metro, o be garso modelis vis tiek rodo,
 * kas skamba, o kas tyli.
 */

const KL_BEAT_MS = 560;                 // vienas pulsas ≈ 107 dūžių per minutę
const KL_NOTE_S = 0.5;                  // kiek skamba viena nata
const DEFAULT_MELODY = [392, 440, 494, 440, 392, 330, 294, 330];

const DEFAULT_LAYERS = [
  { id: "melodija", label: "Melodija" },
  { id: "pritarimas", label: "Pritarimas" },
  { id: "bosas", label: "Bosas" },
];

const DEFAULT_PERFORMERS = [
  { id: "vienas", label: "Vienas atlikėjas", layers: ["melodija"] },
  { id: "ansamblis", label: "Ansamblis", layers: ["melodija", "pritarimas"] },
  { id: "orkestras", label: "Orkestras", layers: ["melodija", "pritarimas", "bosas"] },
];

/* Skirtingų sluoksnių tembrai ir stipriai. Melodija sąmoningai GARSIAUSIA:
 * jei orkestras ją užgožtų, vaikas negalėtų įsitikinti, kad ji nepakito. */
const KL_VOICE = {
  melodija: { wave: "triangle", gain: 0.11, ratio: 1 },
  pritarimas: { wave: "sine", gain: 0.045, ratio: 0.7937 }, // tercija žemiau
  bosas: { wave: "sine", gain: 0.065, ratio: 0.25 },        // dvi oktavos žemiau
};

const klausymas = {
  mount({ stage, controls, api, config }) {
    const PERFORMERS = Array.isArray(config.performers) && config.performers.length
      ? config.performers : DEFAULT_PERFORMERS;
    const LAYERS = Array.isArray(config.layers) && config.layers.length
      ? config.layers : DEFAULT_LAYERS;
    const MELODY = (Array.isArray(config.melody) ? config.melody : DEFAULT_MELODY)
      .filter((n) => typeof n === "number" && n > 0);
    const SENT = config.sentences || {};
    const NOTES = MELODY.length ? MELODY : DEFAULT_MELODY;

    let unlocked = false;
    let selected = PERFORMERS[0].id;
    let playing = false;
    let reported = false;
    const heard = new Set();
    let timers = [];
    let ctx = null;
    const live = new Set();

    stage.innerHTML = `
      <div style="display:grid;gap:.45rem;width:100%;max-width:30rem;min-width:0">
        <p id="kl-who" style="margin:0;font-family:var(--font-head);font-weight:900;font-size:1.05rem;text-align:center">
          Rinkis atlikėją
        </p>
        <div id="kl-rows" style="display:grid;gap:.4rem;min-width:0"></div>
      </div>`;

    const rows = stage.querySelector("#kl-rows");
    const who = stage.querySelector("#kl-who");
    const rowEls = new Map();

    /* Trys eilutės = trys garso sluoksniai. Taško aukštis — natos aukštis,
       todėl eilutė rodo melodijos judėjimo kryptį (programa prašo būtent to:
       „plaštakos judesiu rodyti melodijos judėjimo kryptį“). Tai ir yra
       aktyvusis klausymasis: vaikas seka liniją, o ne sėdi prie įrašo.
       Kiekviena eilutė normalizuojama savo diapazone: melodija lieka ta pati
       visais trimis atvejais, o bosas yra atskiras, retesnis balsas. */
    function heights(freqs) {
      const lo = Math.min(...freqs);
      const hi = Math.max(...freqs);
      const span = Math.max(1, hi - lo);
      return freqs.map((f) => Math.round(((f - lo) / span) * 45));
    }

    const layerFreqs = (id) => {
      if (id === "pritarimas") return NOTES.map((f) => f * KL_VOICE.pritarimas.ratio);
      if (id === "bosas") return NOTES.filter((_, i) => i % 2 === 0).map((f) => f * KL_VOICE.bosas.ratio);
      return NOTES.slice();
    };

    LAYERS.forEach((layer) => {
      const freqs = layerFreqs(layer.id);
      const tops = heights(freqs);

      const row = document.createElement("div");
      row.dataset.layer = layer.id;
      row.style.cssText = "display:grid;grid-template-columns:minmax(4.4rem,auto) minmax(0,1fr);align-items:end;gap:.45rem;min-width:0";

      const name = document.createElement("span");
      name.textContent = layer.label;
      name.style.cssText = "font-size:.8rem;font-weight:800;color:var(--ink-soft);text-align:right;overflow-wrap:anywhere;padding-bottom:.2rem";

      const strip = document.createElement("span");
      strip.style.cssText = "display:flex;align-items:flex-end;gap:.22rem;min-width:0;height:4rem";
      strip.setAttribute("role", "img");

      const dots = [];
      for (let i = 0; i < NOTES.length; i += 1) {
        const cell = document.createElement("span");
        /* Aukštis imamas iš juostos, o ne iš jos pločio: procentinis
           `margin-bottom` šioje vietoje skaičiuojamas pagal TĖVO PLOTĮ, todėl
           tame pačiame modelyje natos „kildavo“ skirtingai priklausomai nuo
           ekrano pločio (LL-40 — matuok tai, ką vaikas gauna, ne kas patogu).
           Todėl tarpas yra atskiras flex vaikas su procentiniu `flex-basis`,
           o juosta turi fiksuotą `rem` aukštį — procentas tada reiškia juostos
           aukštį ir auga kartu su šriftu. */
        cell.style.cssText = "flex:1 1 0;min-width:0;display:flex;flex-direction:column;" +
          "justify-content:flex-end;height:100%";

        const spacer = document.createElement("span");
        spacer.style.cssText = "flex:0 0 auto;min-height:0";

        const dot = document.createElement("span");
        dot.className = "kl-dot";
        dot.style.cssText = "width:100%;max-width:1.5rem;aspect-ratio:1;border-radius:50%;" +
          "border:2px solid var(--line);background:transparent;flex:0 0 auto";

        if (layer.id === "melodija") {
          spacer.style.height = `${tops[i]}%`;
        } else if (layer.id === "pritarimas") {
          spacer.style.height = `${tops[i]}%`;
          dot.style.maxWidth = "1.1rem";
          dot.style.marginLeft = "auto";
          dot.style.marginRight = "auto";
        } else {
          /* Bosas skamba kas antrą pulsą. Tuščias langelis rodo, kad natos
             ten nėra, o ne kad ji pamesta. */
          dot.style.maxWidth = "1.1rem";
          dot.style.marginLeft = "auto";
          dot.style.marginRight = "auto";
          if (i % 2 !== 0) {
            dot.style.visibility = "hidden";
          } else {
            spacer.style.height = `${tops[i / 2]}%`;
          }
        }

        /* Taškas pirmas, tarpas antras: kolona lygiuojama į apačią, todėl
           tarpas PO taško ir yra aukštis, kuriuo nata kyla virš juostos
           apačios. Atvirkščia tvarka tarpą padėtų VIRŠ taško ir visos natos
           liktų viename lygyje (LL-36: modelis turi rodyti tai, ką žada
           užrašas). */
        cell.append(dot, spacer);
        strip.appendChild(cell);
        dots.push(dot);
      }

      row.append(name, strip);
      rows.appendChild(row);
      rowEls.set(layer.id, { row, strip, dots });
    });

    function ensureCtx() {
      if (ctx) return ctx;
      if (!AC) return null;
      try { ctx = new AC(); } catch { ctx = null; }
      return ctx;
    }

    function after(ms, fn) {
      timers.push(setTimeout(fn, ms));
    }

    function clearTimers() {
      timers.forEach((id) => clearTimeout(id));
      timers = [];
    }

    function speak(key) {
      const text = SENT[key];
      if (text) api.speak(text, { rate: 0.95 });
    }

    function layersOf(performerId) {
      const perf = PERFORMERS.find((p) => p.id === performerId) || PERFORMERS[0];
      return Array.isArray(perf.layers) && perf.layers.length ? perf.layers : ["melodija"];
    }

    /* Kurių sluoksnių šiame atlikime apskritai nėra — jie rodomi kaip
       „tylūs“ (punktyriniai), o ne paslepiami: vaikas turi matyti, ko trūksta. */
    function paint(active) {
      LAYERS.forEach((layer) => {
        const entry = rowEls.get(layer.id);
        if (!entry) return;
        const on = active.includes(layer.id);
        entry.row.style.opacity = on ? "1" : ".45";
        entry.strip.setAttribute("aria-label", `${layer.label}: ${on ? "skamba" : "tyli"}`);
        entry.dots.forEach((dot) => {
          dot.style.background = "transparent";
          dot.style.borderStyle = on ? "solid" : "dashed";
          dot.style.borderColor = "var(--line)";
        });
      });
    }

    function light(layerId, i, on) {
      const entry = rowEls.get(layerId);
      if (!entry || !entry.dots[i]) return;
      const dot = entry.dots[i];
      dot.style.background = on ? "var(--accent)" : "transparent";
      dot.style.borderColor = on ? "var(--accent-press)" : "var(--line)";
    }

    function tone(when, freq, dur, peak, wave) {
      const c = ctx;
      if (!c) return;
      let osc = null;
      let gain = null;
      try {
        osc = c.createOscillator();
        gain = c.createGain();
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, when);
        gain.gain.setValueAtTime(0.0001, when);
        gain.gain.exponentialRampToValueAtTime(peak, when + 0.03);
        gain.gain.setValueAtTime(peak, when + dur * 0.72);
        gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(when);
        osc.stop(when + dur + 0.02);
      } catch {
        return;
      }
      live.add(osc);
      osc.onended = () => {
        live.delete(osc);
        try { osc.disconnect(); gain.disconnect(); } catch { /* jau atjungta */ }
      };
    }

    function stopSound() {
      clearTimers();
      live.forEach((osc) => { try { osc.stop(); } catch { /* jau sustabdytas */ } });
      live.clear();
      playing = false;
      paintPlay();
      /* Sustabdžius lieka degančios natos, jei jų nenutriname: vaikas matytų
         „groja toliau“, nors garsas jau nutilo (LL-17 — būsena turi rodyti
         dabartį, ne praeitį). Todėl eilutės grąžinamos į ramią būseną. */
      paint(layersOf(selected));
    }

    function paintPlay() {
      playBtn.textContent = playing ? "Sustabdyk" : "Paleisk";
      playBtn.setAttribute("aria-label", playing ? "Sustabdyk atlikimą" : "Paleisk pasirinktą atlikimą");
    }

    function paintPerformers() {
      perfButtons.forEach((btn) => {
        const on = btn.dataset.perf === selected;
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        btn.style.background = on ? "var(--accent)" : "var(--paper)";
        btn.style.color = on ? "var(--ink)" : "inherit";
        btn.style.borderColor = on ? "var(--accent-press)" : "var(--line)";
      });
    }

    function unlock() {
      unlocked = true;
      guessBtn.hidden = true;
      perfButtons.forEach((b) => b.removeAttribute("aria-disabled"));
      paint(layersOf(selected));
      const current = PERFORMERS.find((p) => p.id === selected);
      who.textContent = current ? current.label : "Rinkis atlikėją";
      api.readout(SENT.start || "Melodija yra viena linija. Klausyk jos visą laiką.");
      api.note(SENT.after || "Palygink su kitu atlikėju.");
      speak("start");
      const active = perfButtons.find((b) => b.dataset.perf === selected) || perfButtons[0];
      if (active) active.focus();
    }

    function finish() {
      clearTimers();
      playing = false;
      paintPlay();
      const active = layersOf(selected);
      paint(active);
      heard.add(selected);
      if (heard.size >= PERFORMERS.length) {
        if (!reported) {
          reported = true;
          api.progress({ correct: true });
          api.readout(SENT.done || "Tris kartus skambėjo ta pati melodija.");
          api.note("Keitėsi tik tai, kas grojo. Melodija liko ta pati.");
          speak("done");
        } else {
          api.readout(SENT.same || "Vėl ta pati melodija.");
          api.note(SENT.after || "Palygink su kitu atlikėju.");
          speak("same");
        }
      } else {
        api.readout(SENT.after || "Palygink su kitu atlikėju.");
        api.note("Paklausyk kito atlikėjo ir palygink melodiją.");
        speak("after");
      }
    }

    function play() {
      if (playing) {
        stopSound();
        return;
      }
      const perf = PERFORMERS.find((p) => p.id === selected) || PERFORMERS[0];
      const active = layersOf(selected);
      const c = ensureCtx();
      const useSound = !!c && soundEnabled();
      if (c && c.state === "suspended" && typeof c.resume === "function") c.resume().catch(() => {});

      clearTimers();
      paint(active);
      playing = true;
      paintPlay();
      who.textContent = perf.label;
      api.readout(SENT[perf.id] || perf.label);
      speak(perf.id);

      if (!useSound) {
        api.note(c ? (SENT.nosound || "") : (SENT.nosupport || ""));
      }

      const base = useSound ? c.currentTime + 0.12 : 0;

      NOTES.forEach((freq, i) => {
        const at = i * KL_BEAT_MS;
        const audioAt = base + at / 1000;

        if (useSound) {
          const mel = KL_VOICE.melodija;
          tone(audioAt, freq * mel.ratio, KL_NOTE_S, mel.gain, mel.wave);
          if (active.includes("pritarimas")) {
            const p = KL_VOICE.pritarimas;
            tone(audioAt, freq * p.ratio, KL_NOTE_S, p.gain, p.wave);
          }
          if (active.includes("bosas") && i % 2 === 0) {
            const b = KL_VOICE.bosas;
            tone(audioAt, freq * b.ratio, (KL_BEAT_MS * 2) / 1000, b.gain, b.wave);
          }
        }

        after(at, () => light("melodija", i, true));
        if (active.includes("pritarimas")) after(at, () => light("pritarimas", i, true));
        if (active.includes("bosas") && i % 2 === 0) after(at, () => light("bosas", i, true));

        const off = at + KL_NOTE_S * 1000 * 0.72;
        after(off, () => {
          light("melodija", i, false);
          if (active.includes("pritarimas")) light("pritarimas", i, false);
          if (active.includes("bosas") && i % 2 === 0) light("bosas", i, false);
        });
      });

      after(NOTES.length * KL_BEAT_MS + 240, finish);
    }

    controls.innerHTML = `
      <button class="btn" type="button" id="kl-guess" style="min-width:min(7rem,100%)">Sakau</button>
      ${PERFORMERS.map((p) => `
        <button class="btn secondary" type="button" data-perf="${p.id}" aria-disabled="true"
          aria-pressed="false" style="min-width:min(8rem,100%)">${p.label}</button>`).join("")}
      <button class="btn" type="button" id="kl-play" aria-label="Paleisk pasirinktą atlikimą"
        style="min-width:min(7.5rem,100%)">Paleisk</button>`;

    const guessBtn = controls.querySelector("#kl-guess");
    const playBtn = controls.querySelector("#kl-play");
    const perfButtons = [...controls.querySelectorAll("[data-perf]")];

    perfButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!unlocked) {
          api.note(SENT.guess || "Pirma pasakyk savo spėjimą, tada rinkis atlikėją.");
          speak("guess");
          guessBtn.focus();
          return;
        }
        if (playing) stopSound();
        selected = btn.dataset.perf;
        paintPerformers();
        paint(layersOf(selected));
        const perf = PERFORMERS.find((p) => p.id === selected);
        who.textContent = perf ? perf.label : btn.textContent;
        api.readout(perf ? perf.label : btn.textContent);
        api.note(SENT.select || "Dabar spausk „Paleisk“ ir klausyk.");
        speak(selected);
        playBtn.focus();
      });
    });

    guessBtn.addEventListener("click", unlock);
    playBtn.addEventListener("click", play);

    paint([]);
    paintPerformers();
    paintPlay();
    api.readout(SENT.ask || "Kas pasikeis, kai prisijungs daugiau atlikėjų?");
    api.note("Pirma pasakyk savo spėjimą, tada rinkis atlikėją.");

    return () => {
      clearTimers();
      live.forEach((osc) => { try { osc.stop(); } catch { /* jau sustabdytas */ } });
      live.clear();
      if (ctx && typeof ctx.close === "function") { try { ctx.close(); } catch { /* jau uždarytas */ } }
      ctx = null;
    };
  },
};

export const SIMS = {
  "garso-aukstis": garsoAukstis,
  "ritmas-ir-pulsas": ritmasIrPulsas,
  "melodija-ir-pritarimas": klausymas,
};
